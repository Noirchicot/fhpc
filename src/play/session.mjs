/* ══ LE BLOC `play` — le moteur de jets, sans DOM ═════════════════════
   Porté de fh-phb `docs/javascripts/fh-player-sheet.js` (main, ~5 645 l.) :
   transaction de jet et ses gardes, phases de séquence, Destinée, Chaos,
   Overreach, réserves comptées, règlement, historique.

   PORTÉ, PAS RÉÉCRIT. Le comportement est la vérité et les suites en sont la
   preuve : les noms de fonctions v1 sont conservés pour que le diff reste
   auditable, y compris quand un nom français aurait mieux dit la chose.

   Ce que le bloc n'a PAS le droit de faire (loi du lot C) : toucher le DOM,
   lire `window`, atteindre le réseau. Ce qui remplace ces trois choses :
   - le rendu → des ÉVÉNEMENTS sur le bus, l'UI s'abonne ;
   - `window.crypto` / `window.FH_CHAOS` → des DÉPENDANCES injectées ;
   - le fil réseau → l'événement `roll-settled`, que le bloc `table` porte.

   Les DEUX POINTS DE RÈGLEMENT sont `openRollState` et la branche
   `finish-sequence` de `runQueueDone`, tous deux gardés par la transaction.
   PIÈGE CONNU, gravé ici : le règlement n'est PAS dans `addHistory`.
   `finishRolledEntry` appelle `addHistory` puis RETOURNE sur un 1 naturel, en
   laissant le joueur accepter ou défier — régler là montrerait à la table un
   échec critique qui devient silencieusement un 20. Et un jet ajusté ne passe
   jamais par `addHistory` : `completeHistoryAdjustment` mute l'entrée en place. */

import { clamp, mod, signed, makeRollDie, platformRandomUint32, platformUuid } from "./utils.mjs";
import {
  DIE_SEQUENCE, ROLL_DIE_SIZES, MAX_BONUS_DICE, MAX_FREE_DICE, MAX_HISTORY,
  createDiceKit, dieColour, rollMode, forcedDieResult, chooseDiePlan,
  trayDiceForPlan, pendingTrayDice
} from "./dice.mjs";
import { LEX, ROLL_SOURCES, SEALABLE_SOURCES, sealLabel, rollVerdict, outcomeFor, rollHasDc, createLexicon } from "./lexicon.mjs";
import { createChaos } from "./chaos.mjs";
import { createExport } from "./export.mjs";

const ABILITY_NAMES = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };
const MAX_EXHAUSTION = 6;
const MAX_EVENTS = 10;
const MAX_PENDING = 4;
const MAX_PINNED = 6;
const POOL_DIE_SIDES = [4, 6, 8, 10, 12];
const MAX_POOL_RESOURCES = 12;
const MAX_POOL_COUNT = 9;
/* Le sceau EST le dé (R6) : une teinte de réserve qui appartient à un sceau
   stage ce sceau, donc « Tactical cramoisi » reproduit le dé Tactical. */
const POOL_TINT_SEAL = { azure: "guidance", violet: "bardic", crimson: "tactical" };
const SOURCE_TINT = { guidance: "azure", bardic: "violet", tactical: "crimson" };

/* Un jet OUVERT ne verrouille plus le dock : il a déjà atteint le flux, et
   CLEAR TRAY ou le jet suivant sont ses deux sorties légitimes. Les seules
   phases qui tiennent encore la transaction sont les quatre qui posent
   véritablement une question au joueur. */
const BLOCKING_PHASES = { nat1: 1, arcane1: 1, "roll-choice": 1, "destiny-choice": 1, "adjustment-choice": 1 };

export function createPlay({
  bus,
  chaosTables = null,
  randomUint32 = platformRandomUint32,
  uuid = platformUuid,
  now = () => new Date().toISOString()
} = {}) {
  if (!bus || typeof bus.emit !== "function") {
    throw new Error("fhpc/play: createPlay needs a bus with emit()");
  }

  const rollDie = makeRollDie(randomUint32);
  const kit = createDiceKit({ rollDie, uuid });
  const {
    newFreeDie, normalizeFreeDie, newBonusDie, normalizeBonusDie,
    makeDiePlan, entryBonusDice, mirrorNamedBonusDice, trayDiceFromEntry
  } = kit;
  const lexicon = createLexicon({ entryBonusDice });
  const { rollBadges, entryTotal, rollParts, rollRuling, rollVocabulary } = lexicon;
  const chaos = createChaos(chaosTables);
  const { chaosRowText, chaosVerdict } = chaos;
  const exporter = createExport({ trayDiceFromEntry, rollParts, rollBadges, rollRuling, entryBonusDice });
  const { rollExport, intentFor, rollSignature } = exporter;

  /* ── La tranche d'état ───────────────────────────────────────────────
     Tout est de la séance : rien ici ne voyage dans le document `fh-char/1`.
     `character` est la seule chose que `play` LIT sans jamais l'écrire — c'est
     `resolved`, semé par `open`, et il n'en garde qu'une référence. */
  const state = {
    character: null,
    campaign: "", pseudo: "",
    destiny: null, vitals: null,
    history: [], events: [],
    prefs: { bardicSides: 6 },
    poolResources: [],
    traySelection: [], trayLabel: "Damage roll",
    trayResults: [], trayTitle: "Dice Tray", trayResultText: "", trayVerdict: "", trayQuietTitle: "",
    trayPrompt: null, queueDone: "", rollSequence: null, rollConfig: null,
    pendingArmed: null, destinyStaged: null, diePrompt: null,
    message: "", messageKind: "",
    settled: {}
  };

  /* ── Ce qui a remplacé le rendu ──────────────────────────────────────
     La v1 finissait presque chaque fonction par `render()`. Ici il n'y a rien
     à redessiner : l'état a changé, le bus le dit, l'UI décide. */
  function notify(message, kind) {
    state.message = message;
    state.messageKind = kind || "";
  }
  function clearNotice() { state.message = ""; state.messageKind = ""; }
  function emitPool(reason) {
    bus.emit("pool-changed", { reason, destiny: state.destiny, vitals: state.vitals, poolResources: state.poolResources });
  }

  /* ══ Destinée : réserve, points, dés ═══════════════════════════════ */

  function makeDestinySlots(score, points) {
    const slotCount = Math.min(15, Math.max(5, Math.ceil(Math.max(0, Number(score) || 0) / 2), Math.ceil(Math.max(0, Number(points) || 0) / 2)));
    const fullCount = Math.min(15, Math.max(0, Math.floor((Number(points) || 0) / 2)));
    const slots = [];
    for (let i = 0; i < slotCount; i++) slots.push({ id: uuid(), sides: DIE_SEQUENCE[i % DIE_SEQUENCE.length], available: i < fullCount });
    return slots;
  }

  function normalizeDestiny(raw, ch) {
    const buildScore = Number(ch && ch.destinyBuild && ch.destinyBuild.score)
      || Number(ch && ch.build && ch.build.destinyFeats && ch.build.destinyFeats.score)
      || (Number(ch && ch.pb) || 2) + 2;
    raw = raw && typeof raw === "object" ? raw : {};
    const score = raw.score != null ? Number(raw.score) : buildScore;
    const points = raw.points != null ? Number(raw.points) : score;
    const counts = {};
    let dice = Array.isArray(raw.dice)
      ? raw.dice.map((die, i) => ({
        id: die.id || uuid(),
        sides: DIE_SEQUENCE.indexOf(Number(die.sides)) >= 0 ? Number(die.sides) : DIE_SEQUENCE[i % DIE_SEQUENCE.length],
        available: !!die.available
      })).filter((die) => { counts[die.sides] = (counts[die.sides] || 0) + 1; return counts[die.sides] <= 3; })
      : makeDestinySlots(score, points);
    if (!dice.length) dice = makeDestinySlots(score, points);
    // Un profil sauvegardé d'avant le plancher peut encore porter des points négatifs.
    const overreach = Math.max(0, Number(raw.overreach) || 0, points < 0 ? -points : 0);
    // Destin différé : Chaos et sauvegardes d'Overreach sont PORTÉS, pas lancés sur place.
    const pending = Array.isArray(raw.pending)
      ? raw.pending.filter((item) => item && (item.kind === "chaos" || item.kind === "overreach" || item.kind === "note")).slice(0, MAX_PENDING + 2)
      : [];
    /* Un COMPTE de tirages d'Arcane dus, pas un drapeau : un second 20 naturel
       à 0 avant que la première carte soit tirée en doit un second. */
    return {
      score, points: Math.max(0, points), dice, overreach, pending,
      awakeningOwed: Math.max(0, Number(raw.awakeningOwed) || 0),
      lastChange: raw.lastChange || null
    };
  }

  function normalizeVitals(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    const max = raw.max == null || raw.max === "" ? null : Math.max(0, Math.round(Number(raw.max) || 0));
    let current = raw.current == null || raw.current === "" ? null : Math.round(Number(raw.current) || 0);
    if (current != null) current = Math.max(-999, max == null ? current : Math.min(current, max));
    if (max != null && current == null) current = max;
    /* Épuisement maison : six niveaux, −1 plat chacun, le niveau 6 est la mort.
       Le repos court qui peut effacer un niveau est dépensé jusqu'au long. */
    return { current, max, exhaustion: clamp(raw.exhaustion, 0, MAX_EXHAUSTION), shortRestUsed: !!raw.shortRestUsed };
  }

  function exhaustionLevel() { return clamp(state.vitals && state.vitals.exhaustion, 0, MAX_EXHAUSTION); }
  /* Chaque niveau est un −1 plat sur tout test de d20 : le malus voyage avec
     les dés du jet au lieu d'être retenu par le joueur. */
  function exhaustionPenalty() { return -exhaustionLevel(); }
  function exhaustionNote(level) {
    if (level >= MAX_EXHAUSTION) return "level 6 is death";
    return level ? "−" + level + " on every d20 test" : "clear";
  }
  function exhaustionText(level, reason) { return "EXHAUSTION " + level + " · " + (reason || "Adjusted") + " · " + exhaustionNote(level); }
  /* `silent` laisse un appelant replier l'annonce dans son propre lot, pour que
     la conséquence atterrisse AU-DESSUS de sa cause dans une liste newest-first. */
  function setExhaustion(level, reason, silent) {
    const before = exhaustionLevel();
    level = clamp(level, 0, MAX_EXHAUSTION);
    if (level === before) return before;
    setVitals({ exhaustion: level });
    if (!silent) pushEvent(exhaustionText(level, reason), level > before ? "loss" : "gain");
    return level;
  }
  function setVitals(patch, message) {
    state.vitals = normalizeVitals(Object.assign({}, state.vitals || {}, patch));
    if (message) notify(message, "success");
    emitPool("vitals");
  }

  function saveInfo(ability, ch) {
    const proficient = (ch.savingProficiencies || []).indexOf(ability) >= 0;
    return {
      name: ABILITY_NAMES[ability] + " Save", ability,
      tier: proficient ? "proficient" : "none",
      bonus: mod(ch.abilities[ability]) + (proficient ? ch.pb : 0)
    };
  }

  /* ══ La zone d'événements ══════════════════════════════════════════
     Plus une file de popups : une LISTE. Un événement informatif est une ligne
     qui s'annonce et s'empile sous la précédente, ne coûte aucun clic et ne
     bloque rien. Seule une vraie décision — un 1 naturel, un échec critique
     arcanique, un choix A/D — tient le jet. */
  function recordEvent(spec) {
    const event = {
      id: uuid(), text: spec.text, kind: spec.kind || "info", entryId: spec.entryId || null,
      chaosRoll: spec.chaosRoll || null, tag: spec.tag || "", createdAt: now()
    };
    state.events.unshift(event);
    state.events = state.events.slice(0, MAX_EVENTS);
    return event;
  }
  function pushEvent(text, kind, entryId) { return recordEvent({ text, kind, entryId }); }
  /* Une ligne qui n'a de sens que tant que quelque chose attend — un dé posé
     dans le plateau — porte une étiquette, pour qu'annuler cette chose emporte
     sa ligne au lieu de laisser un mensonge à l'écran. */
  function dropEventsTagged(tag) {
    if (!tag) return;
    state.events = state.events.filter((event) => event.tag !== tag);
  }
  /* Annoncer, puis continuer. Une décision est la seule chose qui peut
     interrompre : elle gare la suite dans queueDone jusqu'à la réponse. */
  function announceEvents(events, done, decision) {
    (events || []).forEach(recordEvent);
    if (decision) { state.queueDone = done || ""; openDecision(decision); return; }
    const next = done || "";
    state.queueDone = "";
    runQueueDone(next);
  }
  function openDecision(decision) {
    state.rollSequence = state.rollSequence || {};
    if (decision.entryId) state.rollSequence.entryId = decision.entryId;
    state.rollSequence.phase = decision.type;
    state.trayPrompt = Object.assign({}, decision);
  }
  function closeDecision() {
    const done = state.queueDone;
    state.queueDone = "";
    state.trayPrompt = null;
    /* La question est répondue, donc la phase doit cesser de tenir le dock,
       même quand rien n'était garé derrière elle. */
    if (state.rollSequence && BLOCKING_PHASES[state.rollSequence.phase]) state.rollSequence.phase = "open-after-events";
    return done;
  }

  /* Un seul endroit recalcule une entrée après réécriture — par un Portent posé
     sur un dé tombé, ou par un échec arcanique refusé. Un jet libre garde son
     propre verdict ; un test regagne son résultat depuis les nombres.
     `flatBonus` est ce qu'un jet de Chaos ajoute par-dessus son dé : l'Overreach. */
  function recomputeEntry(entry) {
    if (!entry) return;
    if (entry.kind === "tray") {
      entry.total = (entry.dice || []).reduce((sum, die) => sum + (Number(die.result) || 0), 0) + (Number(entry.flatBonus) || 0);
      return;
    }
    entry.total = entryTotal(entry);
    entry.outcome = outcomeFor(entry);
  }

  function refreshEntryTray(entry) {
    if (!entry) return;
    if (rollOpen() && state.rollSequence && state.rollSequence.entryId === entry.id) { refreshOpenTray(entry); return; }
    setTrayFromEntry(entry);
  }

  function recoverLowestDie() {
    for (let missingIndex = 0; missingIndex < DIE_SEQUENCE.length; missingIndex++) {
      const missingSides = DIE_SEQUENCE[missingIndex];
      const missing = state.destiny.dice.find((die) => die.sides === missingSides && !die.available);
      if (missing) { missing.available = true; return missing; }
    }
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < DIE_SEQUENCE.length; i++) {
        const sides = DIE_SEQUENCE[i];
        const count = state.destiny.dice.filter((die) => die.sides === sides).length;
        if (count <= round) { const die = { id: uuid(), sides, available: true }; state.destiny.dice.push(die); return die; }
      }
    }
    return null;
  }

  function adjustDestinyDie(sides, direction) {
    sides = Number(sides); direction = Number(direction);
    const matching = state.destiny.dice.filter((die) => die.sides === sides);
    let changed = false;
    if (direction > 0) {
      const spent = matching.find((die) => !die.available);
      if (spent) { spent.available = true; changed = true; }
      else if (matching.length < 3) { state.destiny.dice.push({ id: uuid(), sides, available: true }); changed = true; }
    } else {
      const full = matching.slice().reverse().find((die) => die.available);
      if (full) { full.available = false; changed = true; }
    }
    if (changed) pushEvent((direction > 0 ? "Gained " : "Removed ") + "a Destiny d" + sides, direction > 0 ? "die-gain" : "die-loss");
    state.destiny.lastChange = { reason: "Manual d" + sides + " pool correction", at: now() };
    emitPool("destiny-dice");
  }

  function setDestinyPoints(next, reason, recover, silent) {
    const before = Number(state.destiny.points) || 0;
    next = Math.max(-99, Math.min(999, Number(next) || 0));
    /* Les points ne tombent jamais sous zéro. Ce qu'ils auraient dépassé est
       enregistré comme Overreach, que le Chaos lit pour poser son DD. */
    const shortfall = next < 0 ? -next : 0;
    state.destiny.overreach = shortfall
      ? (Number(state.destiny.overreach) || 0) + shortfall
      : (next > before ? 0 : Number(state.destiny.overreach) || 0);
    next = Math.max(0, next);
    state.destiny.points = next;
    let recovered = null;
    if (recover !== false && next > before && next > 0 && next % 2 === 0) recovered = recoverLowestDie();
    if (!silent && next !== before) {
      pushEvent((next > before ? "Gained " : "Lost ") + Math.abs(next - before) + " Destiny Point" + (Math.abs(next - before) === 1 ? "" : "s"), next > before ? "gain" : "loss");
    }
    if (!silent && recovered) pushEvent("Gained a Destiny d" + recovered.sides, "die-gain");
    state.destiny.lastChange = { before, after: next, reason: reason || "Correction", recovered: recovered && recovered.id, at: now() };
    emitPool("destiny-points");
    return recovered;
  }

  function updateDestinyField(field, value, reason) {
    if (field === "score") state.destiny.score = clamp(value, 0, 99);
    else setDestinyPoints(value, reason || "Manual correction", true);
    emitPool("destiny-field");
  }

  /* ══ Dépenser un dé de Destinée ════════════════════════════════════ */

  function spendDestinyDie(dieId, silent, rolled) {
    const die = state.destiny.dice.find((item) => item.id === dieId && item.available);
    if (!die) return null;
    die.available = false;
    const plan = rolled || makeDiePlan(die.sides, "flat", null);
    const result = Number(plan.result);
    const before = Number(state.destiny.points) || 0;
    let cost, criticalSuccess = false, criticalFailure = false, chaosRisk = null, recovered = null;
    if (result === die.sides) {
      cost = 1; criticalSuccess = true;
      recovered = setDestinyPoints(before - 1, "Arcane Critical Success d" + die.sides, true, !!silent);
    } else if (result === 1) {
      cost = -1; criticalFailure = true;
      recovered = setDestinyPoints(before + 1, "Arcane Critical Failure d" + die.sides, true, !!silent);
    } else {
      cost = result;
      recovered = setDestinyPoints(before - result, "Destiny d" + die.sides, true, !!silent);
      const over = Number(state.destiny.overreach) || 0;
      if (over > 0) chaosRisk = { overreach: over, dc: 10 + over };
    }
    if (!silent && criticalSuccess) pushEvent(LEX.CRITINF + " · Destiny d" + die.sides + " rolled " + result, "arcane-critical-success");
    else if (!silent && criticalFailure) pushEvent(LEX.FUMBLEINF + " · Destiny d" + die.sides + " rolled 1", "arcane-critical-failure");
    return {
      dieId: die.id, sides: die.sides, result, rolls: (plan.rolls || [result]).slice(),
      chosenIndex: plan.chosenIndex == null ? 0 : plan.chosenIndex,
      advantageMode: rollMode(plan.mode), forced: !!plan.forced, cost,
      pointsBefore: before, pointsAfter: state.destiny.points,
      criticalSuccess, criticalFailure, chaos: chaosRisk, recovered
    };
  }

  /* Un 1 sur un dé de Destinée n'est plus un verdict, c'est une OFFRE — le
     miroir du 1 naturel. L'accepter et l'échec critique tient pour +1 point de
     Destinée ; le refuser et le 1 se lit comme la face la plus haute du dé, un
     succès critique arcanique payé de tous les points de Destinée et d'un 2d6
     sur le Chaos. */
  function arcaneDecision(spent, entryId) {
    if (!spent || !spent.criticalFailure || spent.arcaneChoice) return null;
    return { type: "arcane1", entryId, sides: spent.sides };
  }

  function entryById(id) {
    if (state.rollSequence && state.rollSequence.entry && state.rollSequence.entry.id === id) return state.rollSequence.entry;
    return state.history.find((item) => item.id === id) || null;
  }

  /* Un dé de Destinée posé dans le plateau garde ce que son propre menu lui a
     donné. L'A/D est l'exception : choisir après coup demande un résolveur que
     ce chemin n'a pas, donc son menu ne l'offre jamais et une valeur égarée
     retombe à plat. */
  function destinyPlanFor(item) {
    const mode = rollMode(item && item.advantageMode);
    return makeDiePlan(item.sides, mode === "choice" ? "flat" : mode, item && item.forcedResult);
  }

  function destinyEventSpecs(spent, entryId) {
    if (!spent) return [];
    const change = spent.pointsAfter - spent.pointsBefore;
    const events = [], parts = [];
    const rollEntry = (state.rollSequence && state.rollSequence.entry) || state.history.find((entry) => entry.id === entryId);
    const offered = !!arcaneDecision(spent, entryId);
    if (spent.criticalSuccess) parts.push(LEX.CRITINF, "Destiny d" + spent.sides + " rolled " + spent.result);
    else if (spent.criticalFailure) parts.push(LEX.FUMBLEINF, "Destiny d" + spent.sides + " rolled 1");
    else parts.push("Destiny d" + spent.sides + " rolled " + spent.result);
    /* Un échec encore en attente de sa réponse annonce le jet et rien d'autre :
       les points qu'il a bougés peuvent être défaits, et une ligne ne doit pas
       affirmer ce qui peut être défait. */
    if (!offered) {
      if (change) parts.push((change > 0 ? "Gained " : "Lost ") + Math.abs(change) + " Destiny Point" + (Math.abs(change) === 1 ? "" : "s"), "Current " + spent.pointsAfter);
      if (spent.recovered) parts.push("Gained a Destiny d" + spent.recovered.sides);
    }
    events.push({
      text: parts.join(" · "),
      kind: spent.criticalSuccess ? "arcane-critical-success" : spent.criticalFailure ? "arcane-critical-failure" : "destiny",
      entryId
    });
    // La sauvegarde elle-même est différée derrière un marqueur ; cette ligne ne fait que l'annoncer.
    if (spent.chaos) {
      const saveAbility = (rollEntry && rollEntry.ability) || "";
      addPendingFate({ kind: "overreach", entryId, ability: saveAbility, dc: spent.chaos.dc, overreach: spent.chaos.overreach });
      events.push({ text: "CHAOS RISK · Overreach " + spent.chaos.overreach + " · " + (saveAbility || "Ability") + " save DC " + spent.chaos.dc + " · pending", kind: "chaos", entryId });
    }
    return events;
  }

  /* Les deux réponses sont déjà à moitié appliquées : spendDestinyDie a accordé
     le point à l'instant où le 1 est tombé, donc accepter n'a qu'à l'annoncer
     et refuser doit le reprendre — ainsi que le dé qu'il a pu ramener. */
  function resolveArcaneOne(id, choice) {
    const entry = entryById(id), spent = entry && entry.destiny;
    if (!entry || !spent || !spent.criticalFailure || spent.arcaneChoice) return;
    const events = [];
    if (choice === "accept") {
      spent.arcaneChoice = "accept";
      const accepted = ["∞ FATE ACCEPTED · " + LEX.fumbleInf, "Gained 1 Destiny Point", "Current " + state.destiny.points];
      if (spent.recovered) accepted.push("Gained a Destiny d" + spent.recovered.sides);
      events.push({ text: accepted.join(" · "), kind: "arcane-critical-failure", entryId: entry.id });
    } else {
      if (spent.recovered) {
        const back = state.destiny.dice.find((die) => die.id === spent.recovered.id);
        if (back) back.available = false;
      }
      spent.arcaneChoice = "chaos"; spent.transformed = true; spent.originalResult = spent.result;
      spent.result = spent.sides; spent.rolls = [spent.sides]; spent.chosenIndex = 0; spent.recovered = null;
      spent.criticalFailure = false; spent.criticalSuccess = true;
      const hadPoints = state.destiny.points;
      setDestinyPoints(0, "Arcane fate refused", false, true);
      /* Le Ruling et le badge de dépense lisent tous deux `pointsAfter` sur ce
         relevé ; refuser vide la réserve, donc le relevé doit le dire ou toute
         surface citera éternellement le solde d'avant le refus. */
      spent.pointsAfter = state.destiny.points;
      addPendingFate({ kind: "chaos", entryId: entry.id, ability: entry.ability || "", name: entry.name || "Arcane failure refused" });
      events.push(
        { text: "∞ FATE REFUSED · The 1 becomes " + spent.sides + " · " + LEX.critInf + (hadPoints ? " · Destiny becomes 0" : ""), kind: "arcane-critical-success", entryId: entry.id },
        { text: "CHAOS IS PENDING · 1 fatigue point per round until you face it", kind: "chaos", entryId: entry.id }
      );
    }
    recomputeEntry(entry);
    const done = closeDecision();
    if (state.history.indexOf(entry) >= 0) refreshEntryTray(entry);
    announceEvents(events, done);
  }

  function naturalDestiny(entry) {
    const events = [];
    if (entry.natural === 20) {
      const before = state.destiny.points;
      const recovered = setDestinyPoints(before - 1, LEX.crit20, true, true);
      entry.destinyPointChange = { before, after: state.destiny.points, reason: LEX.crit20 };
      entry.awakening = state.destiny.points === 0;
      // Le tirage est dû à partir de cet instant et jusqu'à ce que la carte soit donnée.
      if (entry.awakening) state.destiny.awakeningOwed = (Number(state.destiny.awakeningOwed) || 0) + 1;
      const parts = [
        entry.awakening ? "ARCANE AWAKENING · " + LEX.crit20 + " at Destiny 0" : LEX.CRIT20 + " · Fate bends in your favor",
        "Lost 1 Destiny Point", "Current " + state.destiny.points
      ];
      if (recovered) parts.push("Gained a Destiny d" + recovered.sides);
      events.push({ text: parts.join(" · "), kind: entry.awakening ? "awakening" : "nat20", entryId: entry.id });
    } else if (entry.natural === 1) entry.natChoice = null;
    return events;
  }

  /* La moitié MOTEUR de `keepArcana` v1 : un tirage règle exactement UN Éveil
     dû — un second 20 naturel tombé avant que cette carte soit donnée doit
     encore le sien. Le paquet des 22 Arcanes est du CONTENU (il vivait dans
     `window.FH_ARCANA`), et le choix de garder ou d'échanger la carte
     appartient au document : ils ne sont pas entrés. La carte n'arrive ici que
     par son identité, pour la ligne d'annonce. */
  function settleAwakening(card) {
    if (!state.destiny) return null;
    const before = state.destiny.score;
    state.destiny.score = clamp(before + 1, 0, 99);
    setDestinyPoints((Number(state.destiny.points) || 0) + 10, "Arcane Awakening", true, true);
    state.destiny.awakeningOwed = Math.max(0, (Number(state.destiny.awakeningOwed) || 0) - 1);
    const named = card && (card.name || card.numeral)
      ? "Drew " + [card.numeral, card.name].filter(Boolean).join(" · ") + " · " : "";
    state.trayPrompt = null;
    announceEvents([{ text: "ARCANE AWAKENING · " + named + "Score " + state.destiny.score + " · +10 temporary Points", kind: "awakening" }], "");
    return state.destiny.awakeningOwed;
  }

  function addHistory(entry) {
    state.history.unshift(entry);
    state.history = state.history.slice(0, MAX_HISTORY);
  }

  /* ══ Le plateau ════════════════════════════════════════════════════ */

  function setTrayFromEntry(entry) {
    const results = trayDiceFromEntry(entry);
    /* Le Ruling est dérivé ici, une fois, depuis l'entrée. `trayVerdict` est ce
       qui permet de distinguer un verdict du moteur d'une consigne écrite dans
       le même emplacement (« Roll 2d6 and read the Chaos table ») : le style de
       verdict ne se pose que quand le titre EST le verdict du Ruling. */
    const ruling = rollVocabulary(entry).ruling;
    state.trayResults = results;
    state.trayTitle = ruling.verdict || ruling.title;
    // affichage, pas compte (T1) : l'énumération des dés reste hors du bois.
    state.trayResultText = ruling.display.join(" · ");
    state.trayVerdict = ruling.verdict;
    // Le nom seul, pour l'instant où les dés sont encore en l'air.
    state.trayQuietTitle = entry.name || "Roll";
  }

  function prepareTrayForConfig(cfg) {
    if (!cfg) return;
    if (cfg.editingId) {
      const original = state.history.find((item) => item.id === cfg.editingId);
      if (!original) return;
      const locked = [];
      const originalD20 = original.d20Roll || {
        sides: 20, rolls: original.d20s || [original.kept], result: original.kept,
        chosenIndex: original.d20Choice != null ? original.d20Choice : (original.d20s || []).indexOf(original.kept),
        mode: original.d20Mode, forced: !!original.d20Forced
      };
      trayDiceForPlan(originalD20, "d20", { dieRole: "base" }).forEach((die) => { die.natural = die.result; locked.push(die); });
      const existingIds = {};
      entryBonusDice(original).forEach((die) => {
        existingIds[die.id] = true;
        trayDiceForPlan(die, die.label, { dieRole: "bonus" }).forEach((item) => locked.push(item));
      });
      (cfg.bonusDice || []).filter((die) => !existingIds[die.id]).forEach((die) => {
        pendingTrayDice(die.sides, die.label, die.advantageMode, die.forcedResult, { dieRole: "bonus", sourceIcon: die.sourceIcon, colour: die.colour || "", bonusId: die.id })
          .forEach((item) => locked.push(item));
      });
      if (original.destiny) {
        trayDiceForPlan(original.destiny, "Destiny", {
          dieRole: "destiny",
          special: original.destiny.criticalSuccess ? "arcane-critical-success" : original.destiny.criticalFailure ? "arcane-critical-failure" : ""
        }).forEach((item) => locked.push(item));
      } else if (cfg.destinyDieId) {
        const pendingDestiny = state.destiny.dice.find((item) => item.id === cfg.destinyDieId);
        if (pendingDestiny) {
          pendingTrayDice(pendingDestiny.sides, "Destiny", cfg.destinyMode, cfg.destinyForcedResult, { flash: true, destinyDieId: pendingDestiny.id, dieRole: "destiny" })
            .forEach((item) => locked.push(item));
        }
      }
      if (cfg.plusTwo) locked.push({ kind: "modifier", result: 2, label: "FH bonus", pending: !original.plusTwo });
      if (Number(cfg.custom)) locked.push({ kind: "modifier", result: Number(cfg.custom), label: "Manual", tone: "mod", pending: Number(original.custom) !== Number(cfg.custom) });
      state.traySelection = [];
      state.trayResults = locked;
      state.trayTitle = cfg.name + " " + signed(cfg.baseBonus);
      state.trayResultText = "Original d20 locked";
      return;
    }
    const dice = pendingTrayDice(20, "d20", cfg.d20Mode, cfg.d20ForcedResult, { dieRole: "base" });
    (cfg.bonusDice || []).forEach((bonusDie) => {
      pendingTrayDice(bonusDie.sides, bonusDie.label, bonusDie.advantageMode, bonusDie.forcedResult, { dieRole: "bonus", sourceIcon: bonusDie.sourceIcon, colour: bonusDie.colour || "", bonusId: bonusDie.id })
        .forEach((item) => dice.push(item));
    });
    if (cfg.destinyDieId) {
      const die = state.destiny.dice.find((item) => item.id === cfg.destinyDieId);
      if (die) pendingTrayDice(die.sides, "Destiny", cfg.destinyMode, cfg.destinyForcedResult, { flash: true, destinyDieId: die.id, dieRole: "destiny" }).forEach((item) => dice.push(item));
    }
    if (cfg.plusTwo) dice.push({ kind: "modifier", result: 2, label: "FH bonus", pending: true });
    // Le +X manuel bat sa pièce dès qu'il est tapé (R2) ; un zéro n'en bat aucune.
    if (Number(cfg.custom)) dice.push({ kind: "modifier", result: Number(cfg.custom), label: "Manual", tone: "mod", pending: true });
    if (exhaustionLevel()) dice.push({ kind: "modifier", result: exhaustionPenalty(), label: "Exhaustion", tone: "exhaustion", pending: true });
    state.traySelection = [];
    state.trayResults = dice;
    state.trayTitle = cfg.name + " " + signed(cfg.baseBonus);
    state.trayResultText = "Ready";
  }

  /* CLEAR TRAY vide la main et, avec elle, le commentaire courant au-dessus des
     dés — le flux garde le relevé permanent. Les badges sont des DETTES, pas du
     commentaire : ils restent. */
  function clearDiceTray(closeConsole) {
    recreditPendingPoolDice();
    state.traySelection = [];
    state.trayResults = [];
    state.trayTitle = "Dice Tray";
    state.trayResultText = "";
    state.trayQuietTitle = "";
    state.trayVerdict = "";
    state.trayPrompt = null;
    state.queueDone = "";
    state.rollSequence = null;
    state.pendingArmed = null;
    state.diePrompt = null;
    state.destinyStaged = null;
    state.events = [];
    if (closeConsole !== false) state.rollConfig = null;
  }

  function rollTransactionActive() {
    const sequence = state.rollSequence;
    return !!(sequence && BLOCKING_PHASES[sequence.phase]);
  }
  function warnRollLocked() { notify("Finish the current roll before starting or clearing another one.", "warn"); }

  /* ══ Le jet ouvert ═════════════════════════════════════════════════
     Un jet posé ne finit plus par un popup bloquant. Il reste OUVERT : le
     plateau garde ses dés et toute source d'un nouveau dé reste vive. Seules
     trois choses bloquent encore : le choix A/D, un 1 naturel, et les
     conséquences d'un dé de Destinée. */

  function stagedList() {
    const sequence = state.rollSequence;
    return sequence && Array.isArray(sequence.staged) ? sequence.staged : [];
  }
  function rollOpen() { return !!(state.rollSequence && state.rollSequence.phase === "open"); }
  function openEntry() {
    const sequence = state.rollSequence;
    if (!sequence) return null;
    return state.history.find((item) => item.id === sequence.entryId) || null;
  }
  function stagedBonusCount() { return stagedList().filter((item) => item.kind !== "destiny").length; }
  function openStatusText(entry) {
    const staged = stagedList().length, base = rollDetailText(entry);
    return base + (staged ? (base ? " · " : "") + staged + " new " + (staged === 1 ? "die" : "dice") + " ready" : "");
  }
  function rollVerdictText(entry) { const ruling = rollRuling(entry); return ruling.verdict || ruling.title; }
  function rollDetailText(entry) { return rollRuling(entry).display.join(" · "); }

  function refreshOpenTray(entry) {
    setTrayFromEntry(entry);
    stagedList().forEach((item) => {
      const dice = pendingTrayDice(item.sides, item.label, item.advantageMode || "flat", null, {
        dieRole: item.kind === "destiny" ? "destiny" : "bonus",
        sourceIcon: item.sourceIcon || "", colour: item.colour || "",
        flash: item.kind === "destiny", stagedId: item.id
      });
      /* Ordre de construction strict (Eric, 2026-08-04) : un dé de Destinée
         stagé prend sa place chronologique à la fin, comme tout autre dé. */
      dice.forEach((die) => state.trayResults.push(die));
    });
    state.trayResultText = openStatusText(entry);
  }

  /* ── POINT DE RÈGLEMENT n°1 ──────────────────────────────────────────
     Tout chemin de d20 converge ici. Un jet ouvert peut encore accréter des
     dés stagés, donc la même entrée se règle légitimement plus d'une fois —
     d'où les révisions, et la signature qui décide si quelque chose a changé. */
  function openRollState(entry) {
    if (!entry) return;
    state.rollSequence = state.rollSequence || {};
    state.rollSequence.entryId = entry.id;
    state.rollSequence.phase = "open";
    state.rollSequence.staged = stagedList();
    state.trayPrompt = null;
    state.queueDone = "";
    state.rollConfig = configFromEntry(entry);
    refreshOpenTray(entry);
    settleEntry(entry);
  }

  /* ── Le règlement lui-même ───────────────────────────────────────────
     Gardé par la transaction : une question ouverte n'a rien réglé du tout. */
  function settleEntry(entry) {
    if (!entry || rollTransactionActive()) return null;
    const signature = rollSignature(entry);
    const known = state.settled[entry.id];
    if (known && known.signature === signature) return null;
    const rev = known ? known.rev + 1 : 0;
    state.settled[entry.id] = { signature, rev };
    return bus.emit("roll-settled", {
      rollId: entry.id, rev,
      roll: rollExport(entry, { campaign: state.campaign, character: (state.character && state.character.name) || state.pseudo }),
      intent: intentFor(entry)
    });
  }

  function stageBonusDie(sides, label, sourceIcon) {
    const entry = openEntry();
    if (!rollOpen() || !entry) return;
    sides = Number(sides);
    if (ROLL_DIE_SIZES.indexOf(sides) < 0 || sides === 20 || sides === 100) {
      notify("The d20 is the base die; d% stays a free roll.", "warn"); return;
    }
    if (entryBonusDice(entry).length + stagedBonusCount() >= MAX_BONUS_DICE) {
      notify("A roll carries at most " + MAX_BONUS_DICE + " bonus dice.", "warn"); return;
    }
    const used = entryBonusDice(entry).concat(stagedList()).map((die) => {
      const match = String(die.sourceIcon || "").match(/^other-([123])$/);
      return match ? Number(match[1]) : 0;
    });
    const slot = [1, 2, 3].find((value) => used.indexOf(value) < 0) || 1;
    state.rollSequence.staged = stagedList().concat([{
      id: uuid(), kind: "bonus", label: label || ("Bonus " + ["", "I", "II", "III"][slot]),
      sides, sourceIcon: sourceIcon || ("other-" + slot)
    }]);
    refreshOpenTray(entry);
  }

  function unstageDie(sides) {
    const entry = openEntry();
    if (!rollOpen() || !entry) return false;
    const staged = stagedList();
    for (let i = staged.length - 1; i >= 0; i--) {
      if (staged[i].kind !== "destiny" && Number(staged[i].sides) === Number(sides)) {
        recreditPoolDie(staged[i]);
        staged.splice(i, 1);
        refreshOpenTray(entry);
        return true;
      }
    }
    return false;
  }

  function stageDestinyDie(dieId) {
    const entry = openEntry();
    if (!rollOpen() || !entry || entry.destiny) return;
    if (stagedList().some((item) => item.kind === "destiny")) return;
    const die = state.destiny.dice.find((item) => item.id === dieId && item.available);
    if (!die) return;
    state.rollSequence.staged = stagedList().concat([{
      id: uuid(), kind: "destiny", destinyDieId: die.id, label: "Destiny", sides: die.sides,
      advantageMode: "flat", forcedResult: null
    }]);
    refreshOpenTray(entry);
  }

  /* ── La réserve de Destinée se comporte comme le sélecteur blanc ─────
     Cliquer un dé d'or ne le dépense jamais et ne pose aucune question : il met
     le dé dans le plateau, dans celui des trois contextes qui est vivant. ROLL
     est la seule chose qui dépense de la Destinée, et c'est ce qui rend
     l'annulation gratuite. */
  function announceStagedDestiny(die) {
    dropEventsTagged("staged-destiny");
    recordEvent({ text: "Destiny d" + die.sides + " waits in the tray · nothing is spent until ROLL", kind: "destiny", tag: "staged-destiny" });
  }

  function stageDestinyFromPool(dieId) {
    const die = state.destiny.dice.find((item) => item.id === dieId && item.available);
    if (!die) { notify("That Destiny die is no longer available.", "warn"); return; }
    if (rollOpen()) {
      const entry = openEntry();
      if (!entry || entry.destiny || stagedList().some((item) => item.kind === "destiny")) {
        notify("This roll already carries a Destiny die.", "warn"); return;
      }
      stageDestinyDie(dieId); announceStagedDestiny(die); return;
    }
    const cfg = state.rollConfig;
    if (cfg) {
      const edited = cfg.editingId && state.history.find((item) => item.id === cfg.editingId);
      if (edited && edited.destiny) { notify("This roll already carries a Destiny die.", "warn"); return; }
      cfg.destinyDieId = die.id; cfg.destinyConfirmed = true; cfg.destinyForcedResult = null;
      prepareTrayForConfig(cfg); announceStagedDestiny(die); return;
    }
    state.destinyStaged = { dieId: die.id, sides: die.sides, advantageMode: "flat", forcedResult: null };
    announceStagedDestiny(die);
  }

  /* Le jet a atterri mais reste ouvert. Rien n'a à être « appliqué » — c'est
     déjà dans le flux. Deux choses seulement y mettent fin : CLEAR TRAY, ou un
     nouveau jet. */
  function releaseRoll() {
    state.rollSequence = null; state.queueDone = ""; state.trayPrompt = null; state.diePrompt = null;
  }

  /* ROLL sur un jet ouvert : seuls les dés fraîchement stagés quittent la main,
     et ils rejoignent la MÊME entrée de flux. Sans rien de stagé, cela relance
     simplement le même test comme une entrée neuve — le bouton dit ROLL, donc
     il lance. */
  function rollStagedDice() {
    const entry = openEntry(), staged = stagedList();
    if (!rollOpen() || !entry) return;
    if (!staged.length) { repeatOpenRoll(entry); return; }
    let events = [], settled = false, decision = null;
    staged.forEach((item) => {
      if (item.kind === "destiny") {
        if (entry.destiny) return;
        const spent = spendDestinyDie(item.destinyDieId, true, destinyPlanFor(item));
        if (!spent) return;
        entry.destiny = spent;
        dropEventsTagged("staged-destiny");
        events = events.concat(destinyEventSpecs(spent, entry.id));
        decision = decision || arcaneDecision(spent, entry.id);
        // Un 1 ou le maximum sur un dé de Destinée règle le jet sur place.
        if (spent.criticalSuccess || spent.criticalFailure) settled = true;
        return;
      }
      if (entryBonusDice(entry).length >= MAX_BONUS_DICE) return;
      const plan = Object.assign(
        newBonusDie(item.label, item.sides, item.sourceIcon, item.colour),
        makeDiePlan(item.sides, item.advantageMode || "flat", item.forcedResult)
      );
      entry.bonusDice = entryBonusDice(entry).concat([plan]);
    });
    mirrorNamedBonusDice(entry);
    entry.total = entryTotal(entry);
    entry.outcome = outcomeFor(entry);
    entry.adjusted = true;
    entry.adjustedAt = now();
    state.rollSequence.staged = [];
    setTrayFromEntry(entry);
    if (events.length || decision) {
      state.rollSequence.phase = "open-after-events";
      announceEvents(events, settled ? "finish-sequence" : "open-roll", decision);
      return;
    }
    if (settled) { releaseRoll(); setTrayFromEntry(entry); return; }
    openRollState(entry);
  }

  /* ROLL à nouveau sur le même test : le montage est gardé, les dés ne le sont
     pas — et les dés BONUS sont des dés, pas du montage (M1, décision Eric
     2026-08-06). Une robe scellée est une faveur accordée pour UN jet : le
     suivant repart du d20 nu, toutes les robes de nouveau disponibles. Les
     drapeaux guidance/bardic doivent être effacés avec les dés, sinon
     ensureConfigBonusDice les rajouterait discrètement. */
  function repeatOpenRoll(entry) {
    const cfg = configFromEntry(entry);
    cfg.editingId = null; cfg.d20ForcedResult = null; cfg.destinyForcedResult = null;
    cfg.destinyDieId = ""; cfg.destinyConfirmed = false;
    cfg.bonusDice = []; cfg.guidance = false; cfg.bardic = false;
    releaseRoll();
    state.rollConfig = cfg;
    prepareTrayForConfig(cfg);
    runConfiguredRoll();
  }

  function finishRolledEntry(entry, events) {
    entry.total = entryTotal(entry);
    entry.outcome = outcomeFor(entry);
    addHistory(entry);
    setTrayFromEntry(entry);
    state.rollConfig = configFromEntry(entry);
    clearNotice();
    /* PIÈGE : on RETOURNE ici sur un 1 naturel. Rien n'est réglé — le joueur
       doit encore accepter ou défier, et un 20 peut encore sortir de ce 1. */
    if (entry.natural === 1) {
      state.rollSequence = state.rollSequence || {};
      state.rollSequence.entryId = entry.id;
      state.rollSequence.phase = "nat1";
      state.trayPrompt = { type: "nat1", entryId: entry.id };
      return;
    }
    events = (events || []).concat(naturalDestiny(entry));
    entry.outcome = outcomeFor(entry);
    state.trayResultText = "Total " + entry.total + (entry.outcome ? " · " + entry.outcome : "");
    state.rollSequence = state.rollSequence || {};
    state.rollSequence.entryId = entry.id;
    if (events.length) {
      state.rollSequence.phase = "open-after-events";
      announceEvents(events, "open-roll");
      return;
    }
    openRollState(entry);
  }

  function quickRoll(name, ability, bonus, note) {
    clearDiceTray(false);
    state.rollConfig = null;
    const natural = rollDie(20);
    const entry = {
      id: uuid(), kind: "d20", name, ability, baseBonus: Number(bonus) || 0, exhaustion: exhaustionLevel(),
      d20Mode: "flat", d20s: [natural],
      d20Roll: { sides: 20, mode: "flat", rolls: [natural], result: natural, chosenIndex: 0, forced: false },
      d20Choice: 0, d20Forced: false, kept: natural, natural, plusTwo: false, custom: 0,
      bonusDice: [], guidance: null, bardic: null, destiny: null, dc: "", note: note || "",
      createdAt: now(), adjusted: false
    };
    state.rollSequence = { phase: "remaining", entryId: entry.id };
    finishRolledEntry(entry, []);
  }

  /* ══ La configuration d'un jet ═════════════════════════════════════ */

  function rollInput(name, ability, bonus, options) {
    options = options || {};
    return {
      name, ability, baseBonus: Number(bonus) || 0, d20Mode: rollMode(options.mode), d20ForcedResult: null,
      plusTwo: !!options.plusTwo, guidance: false, bardic: false,
      bardicSides: Number(state.prefs.bardicSides) || 6, bonusDice: [],
      destinyDieId: "", destinyConfirmed: false, destinyMode: "flat", destinyForcedResult: null, custom: 0,
      dc: options.dc != null ? String(options.dc) : "", note: options.note || "", editingId: null
    };
  }

  function ensureConfigBonusDice(cfg) {
    cfg.bonusDice = (Array.isArray(cfg.bonusDice) ? cfg.bonusDice : []).slice(0, MAX_BONUS_DICE);
    if (cfg.guidance && !cfg.bonusDice.some((die) => String(die.label).toLowerCase() === "guidance") && cfg.bonusDice.length < MAX_BONUS_DICE) {
      cfg.bonusDice.push(newBonusDie("Guidance", 4));
    }
    if (cfg.bardic && !cfg.bonusDice.some((die) => String(die.label).toLowerCase() === "bardic") && cfg.bonusDice.length < MAX_BONUS_DICE) {
      cfg.bonusDice.push(newBonusDie("Bardic", Number(cfg.bardicSides) || 6));
    }
    return cfg;
  }

  function syncPresetFlags(cfg) {
    const guidance = (cfg.bonusDice || []).find((die) => die.label.toLowerCase() === "guidance");
    const bardic = (cfg.bonusDice || []).find((die) => die.label.toLowerCase() === "bardic");
    cfg.guidance = !!guidance;
    cfg.bardic = !!bardic;
    if (bardic) { cfg.bardicSides = bardic.sides; state.prefs.bardicSides = bardic.sides; }
  }

  function snapshotRollConfig(cfg) {
    ensureConfigBonusDice(cfg);
    const copy = Object.assign({}, cfg);
    copy.bonusDice = (cfg.bonusDice || []).map((die, index) => normalizeBonusDie(die, index));
    return copy;
  }

  function configFromEntry(entry) {
    const dice = entryBonusDice(entry).map((die) => { die.locked = true; return die; });
    return {
      editingId: entry.id, name: entry.name, ability: entry.ability, baseBonus: entry.baseBonus,
      d20Mode: entry.d20Mode || "flat", d20ForcedResult: entry.d20Forced ? entry.kept : null,
      plusTwo: !!entry.plusTwo, guidance: !!entry.guidance, bardic: !!entry.bardic,
      bardicSides: entry.bardic ? entry.bardic.sides : Number(state.prefs.bardicSides) || 6,
      bonusDice: dice, destinyDieId: "", destinyConfirmed: false,
      destinyMode: (entry.destiny && entry.destiny.advantageMode) || "flat",
      destinyForcedResult: entry.destiny && entry.destiny.forced ? entry.destiny.result : null,
      custom: Number(entry.custom) || 0, dc: entry.dc, note: entry.note || ""
    };
  }

  function showDieChoice(target, index, plan, label) {
    state.rollSequence.phase = target === "destiny" ? "destiny-choice" : target === "adjustment" ? "adjustment-choice" : "roll-choice";
    state.trayPrompt = {
      type: "die-choice", target, index, label, sides: plan.sides, mode: plan.mode, rolls: plan.rolls.slice(),
      dieRole: target === "destiny" ? "destiny" : target === "d20" ? "base" : "bonus"
    };
  }

  function continueRemainingChoices() {
    const sequence = state.rollSequence;
    if (!sequence || !sequence.entry) return;
    const next = (sequence.choiceQueue || []).shift();
    if (next) {
      const plan = next.target === "d20" ? sequence.entry.d20Roll : sequence.entry.bonusDice[next.index];
      showDieChoice(next.target, next.index, plan, next.label);
      return;
    }
    const entry = sequence.entry;
    entry.kept = entry.d20Roll.result;
    entry.natural = entry.kept;
    entry.d20Choice = entry.d20Roll.chosenIndex;
    entry.d20Forced = !!entry.d20Roll.forced;
    mirrorNamedBonusDice(entry);
    state.trayPrompt = null;
    sequence.phase = "result";
    finishRolledEntry(entry, []);
  }

  function completeHistoryAdjustment(entry, cfg, plans) {
    // Un simple dé bonus ne bloque jamais : il atterrit dans le plateau et la boucle rouvre.
    const existing = entryBonusDice(entry), events = [];
    entry.plusTwo = cfg.plusTwo; entry.custom = cfg.custom; entry.dc = cfg.dc;
    entry.bonusDice = existing.concat(plans || []).slice(0, MAX_BONUS_DICE).map(normalizeBonusDie);
    mirrorNamedBonusDice(entry);
    entry.total = entryTotal(entry);
    entry.adjusted = true;
    entry.adjustedAt = now();
    entry.outcome = outcomeFor(entry);
    state.trayPrompt = null;
    setTrayFromEntry(entry);
    state.rollSequence.entryId = entry.id;
    if (events.length) { state.rollSequence.phase = "open-after-events"; announceEvents(events, "open-roll"); return; }
    openRollState(entry);
  }

  function continueAdjustmentChoices() {
    const sequence = state.rollSequence;
    if (!sequence || !sequence.entry) return;
    const next = (sequence.choiceQueue || []).shift();
    if (next) { showDieChoice("adjustment", next.index, sequence.adjustmentPlans[next.index], next.label); return; }
    completeHistoryAdjustment(sequence.entry, sequence.cfg, sequence.adjustmentPlans || []);
  }

  function resolveDieChoice(index) {
    const prompt = state.trayPrompt, sequence = state.rollSequence;
    if (!prompt || prompt.type !== "die-choice" || !sequence) return;
    state.trayPrompt = null;
    if (prompt.target === "destiny") { chooseDiePlan(sequence.destinyPlan, index); rollSequenceDestiny(); return; }
    if (prompt.target === "d20") chooseDiePlan(sequence.entry.d20Roll, index);
    else if (prompt.target === "bonus") chooseDiePlan(sequence.entry.bonusDice[prompt.index], index);
    else if (prompt.target === "adjustment") { chooseDiePlan(sequence.adjustmentPlans[prompt.index], index); continueAdjustmentChoices(); return; }
    setTrayFromEntry(sequence.entry);
    state.trayResultText = "Choice recorded";
    continueRemainingChoices();
  }

  function runConfiguredRoll() {
    const cfg = state.rollConfig;
    if (!cfg) return;
    ensureConfigBonusDice(cfg);
    if (state.rollSequence && state.rollSequence.phase && state.rollSequence.phase !== "resolved") return;
    if (cfg.editingId) { applyHistoryAdjustment(cfg); return; }
    const entry = {
      id: uuid(), kind: "d20", name: cfg.name, ability: cfg.ability, baseBonus: cfg.baseBonus,
      exhaustion: exhaustionLevel(), d20Mode: cfg.d20Mode, d20s: [], kept: null, natural: null,
      plusTwo: cfg.plusTwo, custom: cfg.custom, dc: cfg.dc, note: cfg.note, createdAt: now(),
      adjusted: false, bonusDice: [], guidance: null, bardic: null, destiny: null
    };
    state.rollSequence = { phase: cfg.destinyDieId ? "destiny" : "remaining", cfg: snapshotRollConfig(cfg), entry, entryId: entry.id };
    if (cfg.destinyDieId) rollSequenceDestiny(); else rollSequenceRemaining();
  }

  function rollSequenceDestiny() {
    const sequence = state.rollSequence;
    if (!sequence || !sequence.cfg) return;
    const cfg = sequence.cfg;
    const die = state.destiny.dice.find((item) => item.id === cfg.destinyDieId && item.available);
    if (!die) { pushEvent("That Destiny die is no longer available.", "error"); state.rollSequence = null; return; }
    if (!sequence.destinyPlan) sequence.destinyPlan = makeDiePlan(die.sides, cfg.destinyMode, cfg.destinyForcedResult);
    prepareTrayForConfig(cfg);
    state.trayResults = state.trayResults.filter((item) => item.destinyDieId !== die.id);
    trayDiceForPlan(sequence.destinyPlan, "Destiny", { flash: true, destinyDieId: die.id, dieRole: "destiny" })
      .forEach((item) => state.trayResults.push(item));
    state.trayResultText = sequence.destinyPlan.result == null ? "Choose the Destiny result" : "Destiny result selected";
    if (sequence.destinyPlan.result == null) { showDieChoice("destiny", 0, sequence.destinyPlan, "Destiny d" + die.sides); return; }
    const spent = spendDestinyDie(cfg.destinyDieId, true, sequence.destinyPlan);
    if (!spent) { pushEvent("That Destiny die is no longer available.", "error"); state.rollSequence = null; return; }
    sequence.entry.destiny = spent;
    sequence.phase = "destiny-events";
    prepareTrayForConfig(sequence.cfg);
    state.trayResults = state.trayResults.filter((item) => item.destinyDieId !== spent.dieId);
    trayDiceForPlan(spent, "Destiny", {
      destinyDieId: spent.dieId, dieRole: "destiny",
      special: spent.criticalSuccess ? "arcane-critical-success" : spent.criticalFailure ? "arcane-critical-failure" : ""
    }).forEach((item) => state.trayResults.push(item));
    state.trayResultText = "Destiny d" + spent.sides + " = " + spent.result;
    announceEvents(
      destinyEventSpecs(spent, sequence.entry.id),
      sequence.adjustment ? "adjustment-remaining" : "roll-remaining",
      arcaneDecision(spent, sequence.entry.id)
    );
  }

  function rollSequenceRemaining() {
    const sequence = state.rollSequence;
    if (!sequence || !sequence.cfg || !sequence.entry) return;
    const cfg = sequence.cfg, entry = sequence.entry;
    entry.d20Roll = makeDiePlan(20, cfg.d20Mode, cfg.d20ForcedResult);
    entry.d20s = entry.d20Roll.rolls.slice();
    entry.bonusDice = (cfg.bonusDice || []).map((die, index) => Object.assign(normalizeBonusDie(die, index), makeDiePlan(die.sides, die.advantageMode, die.forcedResult)));
    sequence.choiceQueue = [];
    if (entry.d20Roll.result == null) sequence.choiceQueue.push({ target: "d20", index: 0, label: "d20" });
    entry.bonusDice.forEach((die, index) => { if (die.result == null) sequence.choiceQueue.push({ target: "bonus", index, label: die.label + " d" + die.sides }); });
    setTrayFromEntry(entry);
    state.trayResultText = sequence.choiceQueue.length ? "Choose which result to keep" : "Rolling…";
    continueRemainingChoices();
  }

  function applyHistoryAdjustment(cfg) {
    const entry = state.history.find((item) => item.id === cfg.editingId);
    if (!entry || entry.kind !== "d20") return;
    if (!entry.destiny && cfg.destinyDieId) {
      state.rollSequence = { phase: "destiny", cfg: snapshotRollConfig(cfg), entry, entryId: entry.id, adjustment: true };
      rollSequenceDestiny();
      return;
    }
    state.rollSequence = { phase: "adjustment", cfg: snapshotRollConfig(cfg), entry, entryId: entry.id, adjustment: true };
    applyHistoryAdjustmentRemaining(entry, cfg);
  }

  function applyHistoryAdjustmentRemaining(entry, cfg) {
    const existingIds = {};
    entryBonusDice(entry).forEach((die) => { existingIds[die.id] = true; });
    const plans = (cfg.bonusDice || [])
      .filter((die) => !existingIds[die.id])
      .slice(0, Math.max(0, MAX_BONUS_DICE - entryBonusDice(entry).length))
      .map((die, index) => Object.assign(normalizeBonusDie(die, index), makeDiePlan(die.sides, die.advantageMode, die.forcedResult)));
    const sequence = state.rollSequence || { phase: "adjustment", entry, cfg: snapshotRollConfig(cfg), entryId: entry.id, adjustment: true };
    state.rollSequence = sequence;
    sequence.entry = entry;
    sequence.cfg = snapshotRollConfig(cfg);
    sequence.adjustmentPlans = plans;
    sequence.choiceQueue = [];
    plans.forEach((die, index) => { if (die.result == null) sequence.choiceQueue.push({ target: "adjustment", index, label: die.label + " d" + die.sides }); });
    if (sequence.choiceQueue.length) {
      setTrayFromEntry(entry);
      plans.forEach((die) => trayDiceForPlan(die, die.label, { dieRole: "bonus" }).forEach((item) => state.trayResults.push(item)));
      state.trayResultText = "Original d20 locked · choose bonus";
      continueAdjustmentChoices();
      return;
    }
    completeHistoryAdjustment(entry, cfg, plans);
  }

  /* ROLL sur un dé de Destinée qui attend dans le plateau, rien d'autre de
     préparé. Le clic qui l'y a mis n'a rien dépensé ; c'est ici qu'il l'est. */
  function standaloneDestiny(dieId, plan) {
    clearDiceTray(false);
    state.rollConfig = null;
    const spent = spendDestinyDie(dieId, true, plan);
    if (!spent) return;
    const entry = {
      id: uuid(), kind: "destiny", name: "Destiny d" + spent.sides, createdAt: now(), destiny: spent,
      total: spent.result,
      outcome: spent.criticalSuccess ? "Arcane Critical Success" : spent.criticalFailure ? "Arcane Critical Failure" : spent.chaos ? "Chaos risk" : "Destiny spent"
    };
    addHistory(entry);
    setTrayFromEntry(entry);
    state.rollSequence = { phase: "standalone", entryId: entry.id };
    const decision = arcaneDecision(spent, entry.id);
    let specs = destinyEventSpecs(spent, entry.id);
    // La ligne de verdict attend quand le verdict est encore au joueur de le donner.
    if (!decision) specs = specs.concat([{ text: entry.name + " · " + entry.outcome, kind: "result", entryId: entry.id }]);
    announceEvents(specs, "finish-sequence", decision);
  }

  function resolveNatOne(id, choice) {
    const entry = state.history.find((item) => item.id === id);
    if (!entry || entry.natural !== 1 || entry.natChoice) return;
    const events = [];
    if (choice === "accept") {
      const before = state.destiny.points;
      const recovered = setDestinyPoints(before + 1, LEX.fumble1 + " accepted", true, true);
      entry.natChoice = "accept";
      entry.destinyPointChange = { before, after: state.destiny.points, reason: LEX.fumble1 + " accepted" };
      const accepted = ["FATE ACCEPTED · " + LEX.fumble1, "Gained 1 Destiny Point", "Current " + state.destiny.points];
      if (recovered) accepted.push("Gained a Destiny d" + recovered.sides);
      events.push({ text: accepted.join(" · "), kind: "nat1", entryId: entry.id });
    } else {
      /* Défier le destin ne lance plus le Chaos sur place : les 2d6 sont
         différés derrière un marqueur, pour que la table ne soit jamais
         bloquée au milieu d'un tour. */
      const oldPoints = state.destiny.points;
      entry.natChoice = "chaos";
      entry.originalKept = entry.kept;
      entry.transformed = true;
      entry.kept = 20;
      setDestinyPoints(0, "Invoked Chaos", false, true);
      entry.total = entryTotal(entry);
      addPendingFate({ kind: "chaos", entryId: entry.id, ability: entry.ability || "", name: entry.name || "Defied roll" });
      events.push(
        { text: "FATE DEFIED · The 1 becomes 20" + (oldPoints ? " · Destiny becomes 0" : ""), kind: "nat1", entryId: entry.id },
        { text: "CHAOS IS PENDING · 1 fatigue point per round until you face it", kind: "chaos", entryId: entry.id }
      );
    }
    setTrayFromEntry(entry);
    entry.outcome = outcomeFor(entry);
    state.trayPrompt = null;
    state.rollSequence = state.rollSequence || {};
    state.rollSequence.entryId = entry.id;
    state.rollSequence.phase = "open-after-events";
    announceEvents(events, "open-roll");
  }

  /* ── POINT DE RÈGLEMENT n°2 : la branche `finish-sequence` ─────────── */
  function runQueueDone(action) {
    if (action === "roll-remaining") { rollSequenceRemaining(); return; }
    if (action === "adjustment-remaining") {
      const sequence = state.rollSequence;
      const adjusted = (sequence && state.history.find((item) => item.id === sequence.entryId)) || (sequence && sequence.entry);
      if (adjusted && sequence && sequence.cfg) {
        if (sequence.entry && sequence.entry.destiny) adjusted.destiny = sequence.entry.destiny;
        applyHistoryAdjustmentRemaining(adjusted, sequence.cfg);
      }
      return;
    }
    if (action === "open-roll") { const landed = openEntry(); if (landed) openRollState(landed); return; }
    // Un dé de Destinée isolé n'ouvre jamais de jet : il se règle ici.
    if (action === "finish-sequence") {
      const settled = state.rollSequence && state.history.find((item) => item.id === state.rollSequence.entryId);
      if (settled) settleEntry(settled);
      state.rollSequence = null;
      return;
    }
  }

  /* ══ Destin différé : Chaos et Overreach ═══════════════════════════
     Ils n'interrompent plus le tour. Ils sont portés comme un marqueur : le
     plateau reste libre, un bouton rouge attend, et le joueur paie un point de
     fatigue par round jusqu'à ce que ce soit résolu. Les deux mécaniques
     restent séparées — un 1 naturel défié résout 2d6 sur la table du Chaos,
     un Overreach résout une sauvegarde contre 10 + Overreach. */

  function pendingFate() { return (state.destiny && Array.isArray(state.destiny.pending)) ? state.destiny.pending : []; }

  function addPendingFate(spec) {
    if (!state.destiny) return null;
    const item = Object.assign({ id: uuid(), createdAt: now() }, spec);
    const next = pendingFate().concat([item]);
    /* La bande en tient quatre ; une dette qui tombe par l'avant DOIT le dire —
       un jet de Chaos ou une sauvegarde d'Overreach qui s'éteint en silence est
       exactement le repli muet que le handoff interdit, pas un détail de ménage. */
    if (next.length > MAX_PENDING) {
      const dropped = next.shift();
      pushEvent("A pending " + pendingLabel(dropped) + " debt was never faced and has expired.", "chaos");
    }
    state.destiny.pending = next;
    emitPool("pending");
    return item;
  }

  function dropPendingFate(id) {
    if (!state.destiny) return;
    state.destiny.pending = pendingFate().filter((item) => item.id !== id);
    emitPool("pending");
  }

  /* Un champ sert les deux cartes : avec un id il renomme ce badge, sans id il
     épingle une note. Un libellé vide n'est pas un badge. */
  function savePendingLabel(id, rawLabel) {
    const label = String(rawLabel || "").trim().slice(0, 24);
    if (!label) { notify("Give the badge a name first.", "warn"); return false; }
    if (id) {
      const item = pendingFate().find((entry) => entry.id === id);
      if (item) item.label = label;
    } else if (pendingFate().length >= MAX_PINNED) {
      notify("Six badges is the most the strip holds.", "warn"); return false;
    } else {
      addPendingFate({ kind: "note", label });
    }
    state.trayPrompt = null;
    return true;
  }

  function pendingLabel(item) {
    if (item.label) return String(item.label).slice(0, 24);
    return item.kind === "chaos" ? "CHAOS" : item.kind === "overreach" ? "OVERREACH " + (Number(item.overreach) || 0) : "NOTE";
  }
  function pendingResolvable(item) { return item.kind === "chaos" || item.kind === "overreach"; }
  function pendingTitle(item) {
    if (item.kind === "note") return "A reminder you pinned yourself. Click to open · right click to rename or cancel it.";
    return (item.kind === "chaos" ? "Chaos is pending" : "An Overreach save is pending, DC " + (Number(item.dc) || 10))
      + " — 1 fatigue point per round until you face it. Click to resolve · right click to rename or cancel it.";
  }

  /* Armer un marqueur ne fait que remplir le plateau — ROLL reste l'appel du joueur. */
  function armPendingFate(id) {
    const item = pendingFate().find((entry) => entry.id === id);
    if (!item || !pendingResolvable(item)) return;
    if (rollTransactionActive()) { warnRollLocked(); return; }
    state.trayPrompt = null;
    state.rollConfig = null;
    state.traySelection = [];
    if (item.kind === "chaos") {
      state.pendingArmed = { id: item.id, kind: "chaos", sides: [6, 6], ability: item.ability || "" };
      state.trayResults = [0, 1].map((index) => ({ sides: 6, result: null, label: "Chaos #" + (index + 1), pending: true, special: "chaos", dieRole: "chaos" }));
      state.trayTitle = "Chaos";
      state.trayResultText = "Roll 2d6 and read the Chaos table";
    } else {
      state.pendingArmed = { id: item.id, kind: "overreach", sides: [20], dc: Number(item.dc) || 10, ability: item.ability || "", overreach: Number(item.overreach) || 0 };
      state.trayResults = [{ sides: 20, result: null, label: (item.ability || "") + " save", pending: true, dieRole: "base" }];
      state.trayTitle = "Overreach save";
      state.trayResultText = "DC " + (Number(item.dc) || 10) + " — roll to hold the Weave";
    }
  }

  function rollPendingFate() {
    const armed = state.pendingArmed;
    if (!armed) return;
    const item = pendingFate().find((entry) => entry.id === armed.id);
    const entry = item && state.history.find((row) => row.id === item.entryId);
    /* Refuser le destin — un 1 naturel ou un échec critique arcanique — saute
       entièrement la sauvegarde d'Overreach et va droit aux 2d6 sur la table. */
    if (armed.kind === "chaos") {
      const chaosAbility = armed.ability || (item && item.ability) || (entry && entry.ability) || "";
      const roll = [rollDie(6), rollDie(6)], total = roll[0] + roll[1];
      if (entry) { entry.chaosRoll = roll; entry.chaosTotal = total; }
      state.trayResults = roll.map((result, index) => ({ sides: 6, result, label: "Chaos #" + (index + 1), special: "chaos", dieRole: "chaos" }));
      const chaosEntry = {
        id: uuid(), kind: "tray",
        name: "Chaos" + (chaosAbility ? " · " + chaosAbility : "") + (item && item.name ? " · " + item.name : ""),
        ability: chaosAbility, dice: roll.map((result) => ({ sides: 6, result })), flatBonus: 0, total,
        createdAt: now(), outcome: "Chaos " + total, chaosRow: chaosRowText(chaosAbility, total)
      };
      state.trayTitle = "Chaos";
      state.trayResultText = "2d6 = " + roll.join(" + ") + " = " + total;
      addHistory(chaosEntry);
      if (item) dropPendingFate(item.id);
      state.pendingArmed = null;
      state.rollSequence = { phase: "free-tray", entryId: chaosEntry.id };
      announceEvents([{ text: "CHAOS RESOLVED · 2d6 = " + roll.join(" + ") + " = " + total + " · " + chaosVerdict(chaosAbility, total), kind: "chaos", entryId: chaosEntry.id }], "finish-sequence");
      return;
    }
    const ability = armed.ability || "";
    let save = { bonus: 0 };
    try { if (ability && state.character) save = saveInfo(ability, state.character); } catch (error) { /* une fiche incomplète ne casse pas la sauvegarde */ }
    const overreach = Number(armed.overreach) || Number(item && item.overreach) || 0;
    const natural = rollDie(20);
    const total = natural + (Number(save.bonus) || 0) - exhaustionLevel();
    const dc = Number(armed.dc) || 10;
    const held = total >= dc;
    const saveEntry = {
      id: uuid(), kind: "d20", name: "Overreach save" + (ability ? " · " + ability : ""), ability,
      exhaustion: exhaustionLevel(), baseBonus: Number(save.bonus) || 0, d20Mode: "flat", d20s: [natural],
      d20Roll: { sides: 20, mode: "flat", rolls: [natural], result: natural, chosenIndex: 0, forced: false },
      d20Choice: 0, d20Forced: false, kept: natural, natural, plusTwo: false, custom: 0, bonusDice: [],
      guidance: null, bardic: null, destiny: null, dc: String(dc), note: "Deferred Overreach",
      createdAt: now(), adjusted: false, total, outcome: held ? "Success" : "Failure"
    };
    addHistory(saveEntry);
    setTrayFromEntry(saveEntry);
    if (item) dropPendingFate(item.id);
    state.pendingArmed = null;
    const saveEvents = [{ text: (held ? "WEAVE HELD" : "OVERREACH BREAKS") + " · " + (ability || "Save") + " " + total + " vs DC " + dc, kind: held ? "result" : "chaos", entryId: saveEntry.id }];
    /* Tenir la Trame n'est pas gratuit : les règles le paient en Épuisement. */
    if (held) {
      state.rollSequence = { phase: "free-tray", entryId: saveEntry.id };
      const beforeLevel = exhaustionLevel();
      const after = setExhaustion(beforeLevel + 1, "Overreach held", true);
      if (after !== beforeLevel) saveEvents.push({ text: exhaustionText(after, "Overreach held"), kind: after >= MAX_EXHAUSTION ? "nat1" : "loss", entryId: saveEntry.id });
      announceEvents(saveEvents, "finish-sequence");
      return;
    }
    /* L'échouer lance 1d6 + Overreach sur la table — un seul geste, parce que la
       sauvegarde et sa conséquence sont un seul moment à la table. */
    const chaosDie = rollDie(6), chaosTotal = chaosDie + overreach;
    const breakEntry = {
      id: uuid(), kind: "tray", name: "Chaos" + (ability ? " · " + ability : ""), ability,
      dice: [{ sides: 6, result: chaosDie }], flatBonus: overreach, total: chaosTotal,
      createdAt: now(), outcome: "Chaos " + chaosTotal, chaosRow: chaosRowText(ability, chaosTotal)
    };
    addHistory(breakEntry);
    state.trayResults = [{ sides: 6, result: chaosDie, label: "Chaos", special: "chaos", dieRole: "chaos" }];
    if (overreach) state.trayResults.push({ kind: "modifier", result: overreach, label: "Overreach", tone: "overreach" });
    state.trayTitle = "Chaos";
    state.trayResultText = "d6 " + chaosDie + (overreach ? " + Overreach " + overreach : "") + " = " + chaosTotal;
    state.rollSequence = { phase: "free-tray", entryId: breakEntry.id };
    saveEvents.push({ text: "CHAOS · d6 " + chaosDie + (overreach ? " + Overreach " + overreach : "") + " = " + chaosTotal + " · " + chaosVerdict(ability, chaosTotal), kind: "chaos", entryId: breakEntry.id });
    announceEvents(saveEvents, "finish-sequence");
  }

  /* ══ La réserve comptée (phase 4) ══════════════════════════════════ */

  function poolList() { return Array.isArray(state.poolResources) ? state.poolResources : (state.poolResources = []); }
  function poolResourceById(id) { return poolList().find((res) => res.id === id) || null; }
  function visiblePoolResources() { return poolList().filter((res) => Number(res.count) > 0); }

  function normalizePoolResource(raw) {
    if (!raw || typeof raw !== "object") return null;
    const sides = POOL_DIE_SIDES.indexOf(Number(raw.sides)) >= 0 ? Number(raw.sides) : 8;
    const kind = raw.kind === "count" ? "count" : "die";
    const count = clamp(raw.count == null ? 1 : raw.count, 0, kind === "die" ? 1 : MAX_POOL_COUNT);
    /* P9 : « Bardic Inspiration » ne tient nulle part où on l'affiche. La
       ressource porte donc DEUX noms : celui qu'on lit sur une carte (14) et
       celui que les surfaces étroites peuvent tenir (7). */
    const label = String(raw.label || "Resource").slice(0, 14);
    const short = String(raw.short == null ? "" : raw.short).trim().slice(0, 7) || label.split(/\s+/)[0].slice(0, 7);
    const tint = dieColour(raw.tint) && raw.tint !== "gold" ? raw.tint : "ash";
    return { id: raw.id || uuid(), label, short, kind, sides, count, tint, origin: raw.origin || undefined };
  }

  function normalizePoolResources(raw) {
    return (Array.isArray(raw) ? raw : []).map(normalizePoolResource).filter(Boolean).slice(0, MAX_POOL_RESOURCES);
  }

  function poolSourceIconFor(res) { return POOL_TINT_SEAL[String(res.tint || "")] || ""; }
  function poolTitle(res) {
    const nature = res.kind === "die" ? "d" + res.sides : "×" + res.count + " · spends a d" + res.sides;
    return res.label + " — " + nature + " · click stages it (ROLL spends it) · right click to edit";
  }

  /* Un dé de réserve encore EN ATTENTE (sans résultat) qui quitte la main rend
     son usage. Un dé lancé ne revient jamais — il était dépensé, comme la Destinée. */
  function recreditPoolResource(id) {
    const res = poolResourceById(id);
    if (!res) return;
    res.count = clamp(Number(res.count) + 1, 0, res.kind === "die" ? 1 : MAX_POOL_COUNT);
    emitPool("pool-recredit");
  }
  function recreditPoolDie(die) {
    if (die && die.poolResourceId && die.result == null && !die.locked) recreditPoolResource(die.poolResourceId);
  }
  function recreditPendingPoolDice() {
    stagedList().forEach(recreditPoolDie);
    state.traySelection.forEach(recreditPoolDie);
    const cfg = state.rollConfig;
    if (cfg) (cfg.bonusDice || []).forEach(recreditPoolDie);
  }
  function poolResourceReferenced(id) {
    if (stagedList().some((die) => die.poolResourceId === id)) return true;
    if (state.traySelection.some((die) => die.poolResourceId === id)) return true;
    const cfg = state.rollConfig;
    if (cfg && (cfg.bonusDice || []).some((die) => die.poolResourceId === id && die.result == null)) return true;
    return false;
  }
  /* Une ressource vidée ne subsiste invisiblement que tant qu'un de ses dés
     attend dans une main (pour qu'annuler puisse la re-créditer) ; dès que plus
     rien ne la pointe, elle est vraiment consommée et quitte la liste. */
  function prunePoolResources() {
    state.poolResources = poolList().filter((res) => Number(res.count) > 0 || poolResourceReferenced(res.id));
  }

  /* Dépenser : le dé est STAGÉ, où que vive la main — un jet ouvert, une
     console préparée, ou rien du tout. Le décrément se fait maintenant ; ROLL
     le rend définitif, la reprise l'annule. */
  function spendPoolResource(id) {
    const res = poolResourceById(id);
    if (!res || Number(res.count) < 1) { notify("That pool resource is spent.", "warn"); return; }
    const icon = poolSourceIconFor(res), colour = icon ? "" : (res.tint || "");
    if (rollOpen()) {
      const entry = openEntry();
      if (!entry) return;
      if (entryBonusDice(entry).length + stagedBonusCount() >= MAX_BONUS_DICE) {
        notify("A roll carries at most " + MAX_BONUS_DICE + " bonus dice.", "warn"); return;
      }
      res.count = Number(res.count) - 1;
      state.rollSequence.staged = stagedList().concat([{
        id: uuid(), kind: "bonus", label: res.label, short: res.short, sides: res.sides,
        sourceIcon: icon, colour, poolResourceId: res.id
      }]);
      refreshOpenTray(entry);
      emitPool("pool-spend");
      return;
    }
    const cfg = state.rollConfig;
    if (cfg && !cfg.editingId) {
      if ((cfg.bonusDice || []).length >= MAX_BONUS_DICE) { notify("A roll carries at most " + MAX_BONUS_DICE + " bonus dice.", "warn"); return; }
      res.count = Number(res.count) - 1;
      const bonus = newBonusDie(res.label, res.sides, icon || undefined, colour);
      bonus.short = res.short;
      bonus.poolResourceId = res.id;
      cfg.bonusDice.push(bonus);
      syncPresetFlags(cfg);
      prepareTrayForConfig(cfg);
      emitPool("pool-spend");
      return;
    }
    if (state.traySelection.length >= MAX_FREE_DICE) { pushEvent("The free-roll tray holds at most " + MAX_FREE_DICE + " dice", "warn"); return; }
    res.count = Number(res.count) - 1;
    const free = newFreeDie(res.sides, colour || SOURCE_TINT[icon] || "");
    free.label = res.label;
    free.short = res.short;
    free.poolResourceId = res.id;
    state.traySelection.push(free);
    state.trayResults = [];
    emitPool("pool-spend");
  }

  /* ══ Le plateau libre ══════════════════════════════════════════════ */

  function addTrayDie(sides) {
    sides = Number(sides);
    if (ROLL_DIE_SIZES.indexOf(sides) < 0) return;
    /* Avec une console ouverte, le plateau nourrit le jet préparé plutôt qu'une
       réserve libre. */
    const cfg = state.rollConfig;
    if (cfg && !cfg.editingId) {
      if (sides === 20 || sides === 100) { notify("The d20 is the base die; d% stays a free roll.", "warn"); return; }
      if ((cfg.bonusDice || []).length >= MAX_BONUS_DICE) { notify("A roll carries at most " + MAX_BONUS_DICE + " bonus dice.", "warn"); return; }
      const used = (cfg.bonusDice || []).map((die) => {
        const match = String(die.sourceIcon || "").match(/^other-([123])$/);
        return match ? Number(match[1]) : 0;
      });
      const slot = [1, 2, 3].find((value) => used.indexOf(value) < 0) || Math.min(3, cfg.bonusDice.length + 1);
      cfg.bonusDice.push(newBonusDie("Bonus " + ["", "I", "II", "III"][slot], sides, "other-" + slot));
      syncPresetFlags(cfg);
      prepareTrayForConfig(cfg);
      return;
    }
    if (state.traySelection.length >= MAX_FREE_DICE) { pushEvent("The free-roll tray holds at most " + MAX_FREE_DICE + " dice", "warn"); return; }
    state.traySelection.push(newFreeDie(sides));
    state.trayResults = [];
  }

  function removeTrayDie(index) {
    recreditPoolDie(state.traySelection[Number(index)]);
    state.traySelection.splice(Number(index), 1);
    state.trayResults = [];
  }
  function removeTrayDieSize(sides) {
    sides = Number(sides);
    for (let i = state.traySelection.length - 1; i >= 0; i--) {
      if (state.traySelection[i].sides === sides) { removeTrayDie(i); return; }
    }
  }
  // Le miroir d'addTrayDie : un dé bonus mal cliqué ne force plus à annuler tout le jet.
  function dropTrayDie(sides) {
    sides = Number(sides);
    if (ROLL_DIE_SIZES.indexOf(sides) < 0) return;
    const cfg = state.rollConfig;
    if (cfg && !cfg.editingId) {
      const dice = cfg.bonusDice || [];
      for (let i = dice.length - 1; i >= 0; i--) {
        if (Number(dice[i].sides) === sides && !dice[i].locked) {
          recreditPoolDie(dice[i]);
          dice.splice(i, 1);
          syncPresetFlags(cfg);
          prepareTrayForConfig(cfg);
          return;
        }
      }
      return;
    }
    removeTrayDieSize(sides);
  }

  function rollTrayDice(label) {
    /* Un dé de Destinée qui attend dans le plateau libre est exactement ce à
       quoi ROLL sert : il se résout seul, aux conditions de la réserve. */
    if (state.destinyStaged) {
      const waiting = state.destinyStaged;
      state.destinyStaged = null;
      dropEventsTagged("staged-destiny");
      standaloneDestiny(waiting.dieId, destinyPlanFor(waiting));
      return;
    }
    if (!state.traySelection.length) state.traySelection = [newFreeDie(20)];
    if (label != null) state.trayLabel = String(label || "Damage roll").slice(0, 48);
    const dice = state.traySelection.map((die) => {
      const plan = makeDiePlan(die.sides, die.advantageMode, die.forcedResult);
      return {
        sides: die.sides, result: plan.result, rolls: (plan.rolls || [plan.result]).slice(),
        chosenIndex: plan.chosenIndex == null ? 0 : plan.chosenIndex,
        advantageMode: rollMode(plan.mode), forced: !!plan.forced,
        colour: die.colour || "", label: die.label || undefined
      };
    });
    const entry = {
      id: uuid(), kind: "tray", name: state.trayLabel || "Damage roll", dice,
      total: dice.reduce((sum, die) => sum + (Number(die.result) || 0), 0),
      createdAt: now(), outcome: "Free roll"
    };
    /* ROLL est ce qui dépense une ressource de réserve pour de bon. La main
       gardée peut être relancée, mais un dé venu de la réserve comptée est un
       usage : il quitte la sélection, et son décrément devient définitif. */
    state.traySelection = state.traySelection.filter((die) => !die.poolResourceId);
    addHistory(entry);
    setTrayFromEntry(entry);
    const special = dice.find((die) => die.sides === 20 && (die.result === 1 || die.result === 20));
    const events = [];
    if (special) {
      events.push({
        text: (special.result === 20 ? LEX.CRIT20 + " IN THE TRAY" : LEX.FUMBLE1 + " IN THE TRAY") + " · " + entry.name + " · Total " + entry.total,
        kind: special.result === 20 ? "nat20" : "nat1", entryId: entry.id
      });
    }
    state.rollSequence = null;
    state.queueDone = "";
    if (events.length) {
      state.rollSequence = { phase: "free-tray", entryId: entry.id };
      announceEvents(events, "finish-sequence");
    }
  }

  /* ══ Le menu d'un dé ═══════════════════════════════════════════════
     `diePrompt` est de la SÉLECTION, donc de l'état de séance : quel dé le
     joueur a désigné. Ce n'est pas du DOM. */

  function findStagedDie(prompt) {
    if (!prompt) return null;
    const cfg = state.rollConfig;
    if (prompt.base) {
      if (!cfg || cfg.editingId) return null;
      return { scope: "base", sides: 20, label: "Base d20", advantageMode: cfg.d20Mode || "flat", forcedResult: cfg.d20ForcedResult, colour: cfg.d20Colour || "", sourceIcon: "" };
    }
    if (prompt.destinyDieId) {
      if (!cfg) return null;
      const poolDie = state.destiny.dice.find((die) => die.id === prompt.destinyDieId && die.available);
      if (!poolDie || cfg.destinyDieId !== poolDie.id) return null;
      return { scope: "destiny", sides: poolDie.sides, label: "Destiny d" + poolDie.sides, advantageMode: cfg.destinyMode || "flat", forcedResult: cfg.destinyForcedResult, colour: "", sourceIcon: "" };
    }
    /* Un dé de Destinée stagé répond au clic droit comme tout autre dé de la
       main — c'est tout l'intérêt qu'il ne soit plus un popup. */
    if (prompt.stagedId) {
      const item = stagedList().find((die) => die.id === prompt.stagedId);
      return item ? Object.assign({ scope: item.kind === "destiny" ? "staged-destiny" : "staged" }, item) : null;
    }
    if (prompt.poolId) {
      const waiting = state.destinyStaged;
      if (!waiting || waiting.dieId !== prompt.poolId) return null;
      if (!state.destiny.dice.some((die) => die.id === waiting.dieId && die.available)) return null;
      return { scope: "pool-destiny", sides: waiting.sides, label: "Destiny d" + waiting.sides, advantageMode: waiting.advantageMode || "flat", forcedResult: waiting.forcedResult, colour: "", sourceIcon: "" };
    }
    if (prompt.bonusId) {
      const bonus = cfg && (cfg.bonusDice || []).find((die) => die.id === prompt.bonusId && !die.locked);
      return bonus ? Object.assign({ scope: "bonus" }, bonus) : null;
    }
    if (prompt.freeId) {
      const free = state.traySelection.find((die) => die.id === prompt.freeId);
      return free ? Object.assign({ scope: "free", label: "d" + free.sides, sourceIcon: "" }, free) : null;
    }
    /* Un dé déjà tombé. Rien de lui ne peut être relancé ni re-scellé, mais un
       Devin peut encore remplacer ce qu'il lit. */
    if (prompt.landedKey) {
      const landed = entryById(prompt.entryId), part = landedDiePart(landed, prompt.landedKey);
      if (!part) return null;
      return {
        scope: "landed", entryId: landed.id, landedKey: prompt.landedKey, sides: part.sides, label: part.label,
        colour: part.colour || "", forcedResult: part.forced ? part.result : null, advantageMode: "flat", sourceIcon: part.sourceIcon || ""
      };
    }
    return null;
  }

  /* Les trois sortes de dé qu'une entrée résolue possède, adressées par une
     clef stable pour que le menu atteigne le même dé après n'importe quel rendu. */
  function landedDiePart(entry, key) {
    if (!entry || !key) return null;
    if (key === "d20") return entry.kind === "d20" ? { sides: 20, label: "d20", result: entry.kept, forced: !!entry.d20Forced, colour: entry.d20Colour || "" } : null;
    const bonus = String(key).match(/^bonus:(.+)$/);
    if (bonus) {
      const die = entryBonusDice(entry).find((item) => item.id === bonus[1]);
      return die ? { sides: die.sides, label: die.label, result: die.result, forced: !!die.forced, colour: die.colour || "", sourceIcon: die.sourceIcon || "" } : null;
    }
    const free = String(key).match(/^free:(\d+)$/);
    if (free) {
      const item = (entry.dice || [])[Number(free[1])];
      return item ? { sides: item.sides, label: "d" + item.sides, result: item.result, forced: !!item.forced, colour: item.colour || "" } : null;
    }
    return null;
  }

  /* Remplacer un dé tombé réécrit l'entrée EN PLACE, pour que la ligne de flux
     qu'elle possède déjà soit corrigée plutôt qu'une seconde n'apparaisse
     dessous. Le premier Portent garde ce que les dés ont réellement dit, pour
     que « — comme il est tombé » puisse rendre le jet au hasard. */
  function retuneLandedDie(prompt, patch) {
    const entry = entryById(prompt && prompt.entryId), key = String((prompt && prompt.landedKey) || "");
    if (!entry) return;
    const setsResult = patch.forcedResult !== undefined;
    if (key === "d20") {
      if (entry.kind !== "d20") return;
      if (patch.colour != null) entry.d20Colour = patch.colour;
      if (setsResult) {
        if (!entry.d20Origin) entry.d20Origin = { rolls: (entry.d20s || []).slice(), kept: entry.kept, chosenIndex: entry.d20Choice, mode: entry.d20Mode || "flat", forced: !!entry.d20Forced };
        const value = forcedDieResult(patch.forcedResult, 20), origin = entry.d20Origin;
        const rolls = value == null ? origin.rolls.slice() : [value];
        const kept = value == null ? origin.kept : value;
        entry.d20Roll = { sides: 20, mode: value == null ? origin.mode : "flat", rolls, result: kept, chosenIndex: value == null ? origin.chosenIndex : 0, forced: value != null || (value == null && origin.forced) };
        entry.d20s = rolls;
        entry.d20Choice = entry.d20Roll.chosenIndex;
        entry.d20Mode = entry.d20Roll.mode;
        entry.d20Forced = !!entry.d20Roll.forced;
        entry.kept = kept;
        entry.natural = kept;
      }
    } else {
      const bonus = String(key).match(/^bonus:(.+)$/), free = String(key).match(/^free:(\d+)$/);
      let die = null;
      if (bonus) die = (entry.bonusDice || []).find((item) => item.id === bonus[1]);
      else if (free) die = (entry.dice || [])[Number(free[1])];
      if (!die) return;
      if (patch.colour != null) die.colour = patch.colour;
      if (setsResult) {
        if (!die.origin) die.origin = { rolls: (die.rolls || [die.result]).slice(), result: die.result, chosenIndex: die.chosenIndex == null ? 0 : die.chosenIndex, forced: !!die.forced };
        const forcedValue = forcedDieResult(patch.forcedResult, die.sides);
        if (forcedValue == null) { die.rolls = die.origin.rolls.slice(); die.result = die.origin.result; die.chosenIndex = die.origin.chosenIndex; die.forced = die.origin.forced; }
        else { die.rolls = [forcedValue]; die.result = forcedValue; die.chosenIndex = 0; die.forced = true; }
      }
      if (bonus) mirrorNamedBonusDice(entry);
    }
    if (setsResult) { entry.adjusted = true; entry.adjustedAt = now(); recomputeEntry(entry); }
    refreshEntryTray(entry);
  }

  function refreshTrayForState() {
    if (rollOpen()) { const entry = openEntry(); if (entry) refreshOpenTray(entry); return; }
    if (state.rollConfig) prepareTrayForConfig(state.rollConfig);
    else state.trayResults = [];
  }

  function mutateStagedDie(patch) {
    const prompt = state.diePrompt, target = findStagedDie(prompt), cfg = state.rollConfig;
    if (!target) return;
    if (target.scope === "landed") { retuneLandedDie(prompt, patch); return; }
    if (target.scope === "pool-destiny") { Object.assign(state.destinyStaged, patch); return; }
    if (target.scope === "base") {
      if (patch.advantageMode != null) cfg.d20Mode = patch.advantageMode;
      if (patch.forcedResult !== undefined) cfg.d20ForcedResult = forcedDieResult(patch.forcedResult, 20);
      if (patch.colour != null) cfg.d20Colour = patch.colour;
    } else if (target.scope === "destiny") {
      if (patch.advantageMode != null) cfg.destinyMode = patch.advantageMode;
      if (patch.forcedResult !== undefined) cfg.destinyForcedResult = forcedDieResult(patch.forcedResult, target.sides);
    } else if (target.scope === "staged" || target.scope === "staged-destiny") {
      const item = stagedList().find((die) => die.id === prompt.stagedId);
      if (item) Object.assign(item, patch);
    } else if (target.scope === "bonus") {
      const bonus = (cfg.bonusDice || []).find((die) => die.id === prompt.bonusId);
      if (bonus) Object.assign(bonus, patch);
    } else if (target.scope === "free") {
      const freeDie = state.traySelection.find((die) => die.id === prompt.freeId);
      if (freeDie) Object.assign(freeDie, patch);
    }
    refreshTrayForState();
  }

  function dropStagedDie() {
    const prompt = state.diePrompt, target = findStagedDie(prompt);
    if (!target) return;
    // Le d20 de base EST le jet — il ne peut pas être sorti de son propre plateau.
    if (target.scope === "base") { notify("The d20 is the roll — it cannot be removed.", "warn"); return; }
    // Un dé déjà tombé appartient à un jet résolu : il peut être remplacé, jamais retiré.
    if (target.scope === "landed") { notify("A die that has fallen stays in its roll.", "warn"); return; }
    if (target.scope === "pool-destiny") { state.destinyStaged = null; dropEventsTagged("staged-destiny"); }
    else if (target.scope === "destiny") {
      const cfg = state.rollConfig;
      cfg.destinyDieId = ""; cfg.destinyConfirmed = false; cfg.destinyForcedResult = null;
      dropEventsTagged("staged-destiny");
    } else if (target.scope === "staged" || target.scope === "staged-destiny") {
      recreditPoolDie(stagedList().find((die) => die.id === prompt.stagedId));
      state.rollSequence.staged = stagedList().filter((die) => die.id !== prompt.stagedId);
      if (target.scope === "staged-destiny") dropEventsTagged("staged-destiny");
    } else if (target.scope === "bonus") {
      const config = state.rollConfig;
      recreditPoolDie((config.bonusDice || []).find((die) => die.id === prompt.bonusId));
      config.bonusDice = (config.bonusDice || []).filter((die) => die.id !== prompt.bonusId);
      syncPresetFlags(config);
    } else if (target.scope === "free") {
      recreditPoolDie(state.traySelection.find((die) => die.id === prompt.freeId));
      state.traySelection = state.traySelection.filter((die) => die.id !== prompt.freeId);
    }
    state.diePrompt = null;
    refreshTrayForState();
  }

  /* Sceller un dé « Destiny » n'est pas décoratif : cela sort un dé de la
     réserve. Rien n'est dépensé par le sceau non plus — le dé de réserve passe
     simplement dans la main, et ROLL reste ce qui le dépense. */
  function sealStagedDie(seal) {
    const target = findStagedDie(state.diePrompt);
    if (!target) return;
    /* Choisir une robe scellée habille le dé ENTIER (R6) : la teinte du sceau
       revient, donc la couleur manuelle est effacée. */
    if (seal !== "destiny") { mutateStagedDie({ sourceIcon: seal, label: sealLabel(seal), colour: "" }); return; }
    const poolDie = state.destiny.dice.find((die) => die.available && die.sides === target.sides);
    if (!poolDie) { notify("No Destiny d" + target.sides + " is available in the pool.", "warn"); return; }
    dropStagedDie();
    stageDestinyFromPool(poolDie.id);
  }

  /* ══ Ouvrir / fermer une séance ════════════════════════════════════ */

  /* Le document appartient aux blocs `doc`/`build`. `play` reçoit ce dont il a
     besoin pour jouer et le rend quand la séance se ferme ; il ne va rien
     chercher tout seul, et il ne persiste rien. */
  function open({ character = null, destiny = null, vitals = null, history = null, poolResources = null, campaign = "", pseudo = "" } = {}) {
    state.character = character;
    state.campaign = campaign;
    state.pseudo = pseudo;
    state.destiny = normalizeDestiny(destiny, character || {});
    state.vitals = normalizeVitals(vitals);
    state.history = Array.isArray(history) ? history.slice(0, MAX_HISTORY) : [];
    state.events = [];
    state.poolResources = normalizePoolResources(poolResources);
    state.traySelection = [newFreeDie(20)];
    state.settled = {};
    clearDiceTray(true);
    emitPool("open");
  }

  /* Ce que la séance rend au document : les ressources comptées et
     l'historique. L'état de séance (transaction, main, sélection) ne voyage
     pas — règle de persistance n°4. */
  function snapshot() {
    prunePoolResources();
    return {
      destiny: state.destiny,
      vitals: state.vitals,
      history: state.history.slice(0, MAX_HISTORY),
      poolResources: poolList()
    };
  }

  /* ── Les verbes : le seul point d'entrée du bloc ────────────────────
     Nommés depuis le vocabulaire `data-*` v1 (voir contracts/play.md pour la
     table de correspondance complète). */
  const verbs = {
    open: (p) => open(p || {}),
    snapshot: () => snapshot(),

    // le jet
    prepare: (p) => { clearDiceTray(false); state.rollConfig = rollInput(p.name, p.ability, p.bonus, p); prepareTrayForConfig(state.rollConfig); clearNotice(); },
    configure: (p) => { if (state.rollConfig) Object.assign(state.rollConfig, p || {}); },
    roll: () => {
      if (state.pendingArmed) return rollPendingFate();
      if (rollOpen()) return rollStagedDice();
      if (state.rollConfig) return runConfiguredRoll();
      return rollTrayDice();
    },
    quickRoll: (p) => quickRoll(p.name, p.ability, p.bonus, p.note),
    rollTray: (p) => rollTrayDice(p && p.label),
    clearTray: (p) => clearDiceTray(!p || p.closeConsole !== false),
    editEntry: (p) => { const entry = state.history.find((item) => item.id === p.entryId); if (entry) { state.rollConfig = configFromEntry(entry); prepareTrayForConfig(state.rollConfig); } },

    // la main
    addTrayDie: (p) => addTrayDie(p.sides),
    dropTrayDie: (p) => dropTrayDie(p.sides),
    stageDie: (p) => stageBonusDie(p.sides, p.label, p.sourceIcon),
    unstageDie: (p) => unstageDie(p.sides),
    selectDie: (p) => { state.diePrompt = p || null; },
    mutateDie: (p) => mutateStagedDie(p || {}),
    sealDie: (p) => sealStagedDie(p.seal),
    dropDie: () => dropStagedDie(),

    // la Destinée
    spendDestiny: (p) => stageDestinyFromPool(p.dieId),
    stageDestinyDie: (p) => stageDestinyDie(p.dieId),
    adjustDestinyDie: (p) => adjustDestinyDie(p.sides, p.direction),
    setDestinyField: (p) => updateDestinyField(p.field, p.value, p.reason),
    settleAwakening: (p) => settleAwakening(p && p.card),

    // les décisions
    resolveDieChoice: (p) => resolveDieChoice(p.index),
    resolveNatOne: (p) => resolveNatOne(p.entryId, p.choice),
    resolveArcaneOne: (p) => resolveArcaneOne(p.entryId, p.choice),

    // le destin différé
    armPending: (p) => armPendingFate(p.id),
    resolvePending: () => rollPendingFate(),
    addPending: (p) => addPendingFate(p),
    dropPending: (p) => dropPendingFate(p.id),
    renamePending: (p) => savePendingLabel(p.id, p.label),

    // la réserve comptée
    spendPoolResource: (p) => spendPoolResource(p.id),
    setPoolResources: (p) => { state.poolResources = normalizePoolResources(p.resources); emitPool("pool-set"); },

    // les vitaux
    setVitals: (p) => setVitals(p.patch, p.message),
    setExhaustion: (p) => setExhaustion(p.level, p.reason, p.silent)
  };

  /* Les DÉRIVATIONS : lecture seule sur une entrée, pour les surfaces. Aucune
     ne touche l'état — c'est ce qui garantit qu'une surface ne peut pas
     recalculer un badge pour son compte. */
  const derive = {
    badges: rollBadges, ruling: rollRuling, vocabulary: rollVocabulary, verdict: rollVerdict,
    outcome: outcomeFor, total: entryTotal, parts: rollParts, trayDice: trayDiceFromEntry,
    export: (entry) => rollExport(entry, { campaign: state.campaign, character: (state.character && state.character.name) || state.pseudo }),
    intent: intentFor,
    verdictText: rollVerdictText, detailText: rollDetailText,
    chaosRow: chaosRowText, chaosVerdict,
    pendingLabel, pendingTitle, pendingResolvable, sealLabel,
    poolTitle, visiblePoolResources
  };

  /* Les ROUAGES. Exposés délibérément : les suites portées les tiennent
     directement (comme la v1 les tenait par son hook `__fhRollMachine`), et la
     décision Q4 veut que les mécaniques neuves soient des MODULES MOTEUR
     activés par drapeaux — ils entreront par ici, pas par du contenu de couche.
     Ce n'est pas la surface publique du bloc : celle-là, c'est `verbs`. */
  const engine = {
    rollTransactionActive, rollOpen, openEntry, stagedList, stagedBonusCount, entryById,
    makeDestinySlots, normalizeDestiny, normalizeVitals, normalizePoolResources,
    spendDestinyDie, destinyEventSpecs, arcaneDecision, naturalDestiny, destinyPlanFor,
    setDestinyPoints, recoverLowestDie, adjustDestinyDie, settleAwakening,
    exhaustionLevel, exhaustionPenalty, exhaustionText, setExhaustion, setVitals,
    announceEvents, recordEvent, pushEvent, dropEventsTagged, openDecision, closeDecision, runQueueDone,
    pendingFate, addPendingFate, dropPendingFate, armPendingFate, rollPendingFate,
    rollInput, ensureConfigBonusDice, snapshotRollConfig, configFromEntry, syncPresetFlags,
    runConfiguredRoll, rollSequenceDestiny, rollSequenceRemaining, resolveDieChoice,
    applyHistoryAdjustment, applyHistoryAdjustmentRemaining, completeHistoryAdjustment,
    finishRolledEntry, quickRoll, standaloneDestiny, resolveNatOne, resolveArcaneOne,
    openRollState, settleEntry, releaseRoll, repeatOpenRoll, rollStagedDice,
    stageBonusDie, unstageDie, stageDestinyDie, stageDestinyFromPool,
    addTrayDie, removeTrayDie, dropTrayDie, rollTrayDice, clearDiceTray,
    setTrayFromEntry, prepareTrayForConfig, refreshOpenTray, refreshEntryTray, refreshTrayForState,
    findStagedDie, landedDiePart, retuneLandedDie, mutateStagedDie, dropStagedDie, sealStagedDie,
    poolList, poolResourceById, spendPoolResource, recreditPoolDie, prunePoolResources,
    recomputeEntry, addHistory, entryTotal, outcomeFor, rollDie, saveInfo,
    BLOCKING_PHASES, MAX_EXHAUSTION, MAX_BONUS_DICE, MAX_FREE_DICE, MAX_HISTORY,
    ROLL_SOURCES, SEALABLE_SOURCES, LEX, rollHasDc
  };

  return { name: "play", state, verbs, derive, engine };
}
