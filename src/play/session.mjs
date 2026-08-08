/* ══ LE BLOC `play` — LE MOTEUR DE JETS SRD ══════════════════════════
   Porté de fh-phb `docs/javascripts/fh-player-sheet.js` (main, ~5 645 l.) par
   le lot 3, puis RECOUPÉ par le lot 5.

   ⚠️ CE FICHIER EST SRD, ET SEULEMENT SRD (loi §0.12). Il ne contient pas les
   mots Destiny, Chaos, Overreach, Arcane ni Awakening, et le garde structurel
   de `tests/play-srd-only.test.mjs` le vérifie sur les octets. Un personnage
   SRD pur, sans aucune couche chargée, traverse ce code de bout en bout.

   CE QUE LE LOT 5 A ENLEVÉ D'ICI, ET OÙ C'EST PARTI :
   - la Destinée (réserve, points, dés, dépense, Éveil), le Chaos, l'Overreach,
     le 1 naturel qui pose une question, le +2 maison → `src/modules/fh/`.
   - les MOTS (verdicts, badges, lignes de flux, refus) → `labels.mjs`, un
     paquet de données que `derive` applique à la frontière (loi §0.13).
   Ce qui reste ici est le jeu de base : le d20, l'avantage, le modificateur,
   le seuil, les dés bonus, les dégâts, l'Épuisement, l'historique, et LA
   TRANSACTION DE JET.

   COMMENT UNE COUCHE ENTRE. Elle ne s'appelle pas, elle S'INSCRIT : le chemin
   commun invoque un MOMENT (`src/play/sequence.mjs`) et n'a jamais entendu
   parler d'un module. Pas un seul `if (fh)`.

   LES DEUX POINTS DE RÈGLEMENT sont `openRollState` et la branche
   `finish-sequence` de `runQueueDone`, tous deux gardés par la transaction.
   PIÈGE CONNU, gravé ici : le règlement n'est PAS dans `addHistory`.
   `finishRolledEntry` appelle `addHistory` puis RETOURNE quand une couche
   pose une question — régler là montrerait à la table un résultat que le
   joueur peut encore renverser. Et un jet ajusté ne passe jamais par
   `addHistory` : `completeHistoryAdjustment` mute l'entrée en place.

   ⚠️ D.2 — LA TRANSACTION DE JET EST ROUVRABLE, ET C'EST INTOUCHABLE. Un jet
   réglé n'est pas figé : il doit pouvoir recevoir un dé et CHANGER DE VERDICT.
   `adjustment-choice` est une phase bloquante, `completeHistoryAdjustment` en
   est la sortie, `entry.adjusted` est posé aux deux points, et le badge
   `adjusted` le dit. Rien de tout cela n'a bougé au lot 5. */

import { clamp, mod, signed, makeRollDie, platformRandomUint32, platformUuid } from "./utils.mjs";
import {
  DIE_SEQUENCE, ROLL_DIE_SIZES, MAX_BONUS_DICE, MAX_FREE_DICE, MAX_HISTORY,
  createDiceKit, dieColour, rollMode, forcedDieResult, chooseDiePlan,
  trayDiceForPlan, pendingTrayDice
} from "./dice.mjs";
import { createLexicon, SEALABLE_SOURCES, CORRECTION_DICE, rollHasThreshold, rollThreshold, rollWasMade } from "./lexicon.mjs";
import { createLabels, EN_SRD } from "./labels.mjs";
import { createSequence } from "./sequence.mjs";
import { rollTypeFor, applySettings, damagePlanFor, ROLL_TYPE_IDS } from "./rolltypes.mjs";
import { createExport } from "./export.mjs";

const ABILITY_NAMES = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };
/* SRD 5.2.1, `srd:glossary:en:exhaustion` (p.181) : six niveaux, la mort au
   sixième, et « the roll is reduced by 2 times your Exhaustion level ». Le
   multiplicateur est une valeur de RÈGLE : une couche a le droit de le
   remplacer (Fate's Hand joue à −1), la condition reste celle du SRD. */
const MAX_EXHAUSTION = 6;
const SRD_EXHAUSTION_PER_LEVEL = 2;
const MAX_EVENTS = 10;
const POOL_DIE_SIDES = [4, 6, 8, 10, 12];
const MAX_POOL_RESOURCES = 12;
const MAX_POOL_COUNT = 9;
/* Le sceau EST le dé (R6) : une teinte de réserve qui appartient à un sceau
   stage ce sceau, donc « Tactical cramoisi » reproduit le dé Tactical. */
const POOL_TINT_SEAL = { azure: "guidance", violet: "bardic", crimson: "tactical" };
const SOURCE_TINT = { guidance: "azure", bardic: "violet", tactical: "crimson" };

/* Un jet OUVERT ne verrouille plus le dock : il a déjà atteint le flux, et
   CLEAR TRAY ou le jet suivant sont ses deux sorties légitimes. Les seules
   phases qui tiennent encore la transaction sont celles qui posent
   véritablement une question au joueur — celles du chemin commun, plus celles
   qu'une couche ouvre par une décision. */
const BLOCKING_PHASES = { "roll-choice": 1, "adjustment-choice": 1 };

export function createPlay({
  bus,
  layers = [],
  randomUint32 = platformRandomUint32,
  uuid = platformUuid,
  now = () => new Date().toISOString()
} = {}) {
  if (!bus || typeof bus.emit !== "function") {
    throw new Error("fhpc/play: createPlay needs a bus with emit()");
  }

  /* ── Le montage des couches ──────────────────────────────────────────
     Trois passes, dans cet ordre, parce que chacune a besoin de la
     précédente : les DÉCLARATIONS d'abord (elles sont pures), puis le lexique
     et les dés qui les lisent, puis le BRANCHEMENT qui leur tend les rouages. */
  const sequence = createSequence();
  const declarations = layers.slice();
  const labels = createLabels(EN_SRD, ...declarations.map((layer) => layer.labels || {}));
  const t = labels;

  /* Les valeurs de règle qu'une couche remplace. Deux couches qui voudraient
     la même valeur est une ambiguïté, et elle jette (loi §0.5). */
  const rules = { exhaustionPerLevel: SRD_EXHAUSTION_PER_LEVEL };
  const ruleOwner = {};
  declarations.forEach((layer) => {
    Object.entries(layer.rules || {}).forEach(([key, value]) => {
      if (rules[key] === undefined) throw new Error('fhpc/play: layer "' + layer.name + '" overrides unknown rule "' + key + '"');
      if (ruleOwner[key]) {
        throw new Error('fhpc/play: "' + ruleOwner[key] + '" and "' + layer.name + '" both override rule "' + key + '"');
      }
      ruleOwner[key] = layer.name;
      rules[key] = value;
    });
  });

  const rollDie = makeRollDie(randomUint32);
  const kit = createDiceKit({ rollDie, uuid, labels, modules: declarations });
  const {
    newFreeDie, normalizeFreeDie, newBonusDie, normalizeBonusDie,
    makeDiePlan, entryBonusDice, mirrorNamedBonusDice, trayDiceFromEntry
  } = kit;
  const lexicon = createLexicon({ entryBonusDice, labels, modules: declarations });
  const {
    ROLL_SOURCES, ROLL_VERDICTS, ROLL_BADGE_RULES,
    rollSource, sealLabel, rollVerdict, outcomeFor, verdictText,
    rollBadges, entryTotal, rollParts, rollRuling, rollVocabulary, moduleSignature
  } = lexicon;
  const exporter = createExport({
    trayDiceFromEntry, rollParts, rollBadges, rollRuling, entryBonusDice,
    rollVerdict, rollThreshold, rollHasThreshold, moduleSignature
  });
  const { rollExport, intentFor, rollSignature } = exporter;

  /* ── La tranche d'état ───────────────────────────────────────────────
     Tout est de la séance : rien ici ne voyage dans le document `fh-char/1`.
     `character` est la seule chose que `play` LIT sans jamais l'écrire — c'est
     `resolved`, semé par `open`, et il n'en garde qu'une référence.
     Une couche montée AJOUTE ses propres clefs ; le chemin commun n'en déclare
     aucune, et c'est ce qui rend la coupe vérifiable sur les octets. */
  const state = {
    character: null,
    campaign: "", pseudo: "",
    vitals: null,
    history: [], events: [],
    prefs: { bardicSides: 6 },
    poolResources: [],
    traySelection: [], trayLabel: t("tray.free-label"),
    trayResults: [], trayTitle: t("tray.idle"), trayResultText: "", trayVerdict: "", trayQuietTitle: "",
    trayPrompt: null, queueDone: "", rollSequence: null, rollConfig: null,
    diePrompt: null,
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
    bus.emit("pool-changed", Object.assign(
      { reason, vitals: state.vitals, poolResources: state.poolResources },
      harvestLayers()
    ));
  }

  /* ══ Les vitaux et l'Épuisement ════════════════════════════════════ */

  function normalizeVitals(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    const max = raw.max == null || raw.max === "" ? null : Math.max(0, Math.round(Number(raw.max) || 0));
    let current = raw.current == null || raw.current === "" ? null : Math.round(Number(raw.current) || 0);
    if (current != null) current = Math.max(-999, max == null ? current : Math.min(current, max));
    if (max != null && current == null) current = max;
    /* Six niveaux, le sixième est la mort. Le repos court qui peut effacer un
       niveau est dépensé jusqu'au long : `play` porte le drapeau, l'effacement
       est un geste, pas un automatisme. */
    return { current, max, exhaustion: clamp(raw.exhaustion, 0, MAX_EXHAUSTION), shortRestUsed: !!raw.shortRestUsed };
  }

  function exhaustionLevel() { return clamp(state.vitals && state.vitals.exhaustion, 0, MAX_EXHAUSTION); }
  /* Chaque niveau est un malus plat sur tout test de d20 : il voyage avec les
     dés du jet au lieu d'être retenu par le joueur. Le CHIFFRE est une valeur
     de règle (SRD : 2 par niveau) qu'une couche peut remplacer. */
  function exhaustionPenalty() { return -exhaustionLevel() * rules.exhaustionPerLevel; }
  function exhaustionText(level, reason) {
    return t("event.exhaustion", {
      level, reason: reason || "Adjusted", max: MAX_EXHAUSTION,
      penalty: level * rules.exhaustionPerLevel
    });
  }
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
     bloque rien. Seule une vraie décision tient le jet. */
  function recordEvent(spec) {
    const event = {
      id: uuid(), text: spec.text, kind: spec.kind || "info", entryId: spec.entryId || null,
      tag: spec.tag || "", createdAt: now()
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
  /* Une décision ouverte par une couche TIENT la transaction, sans que le
     chemin commun sache de quelle question il s'agit : `blocking` est déclaré
     par le type de la décision, pas deviné à partir de son nom. */
  const blockingDecisions = {};
  function openDecision(decision) {
    state.rollSequence = state.rollSequence || {};
    if (decision.entryId) state.rollSequence.entryId = decision.entryId;
    state.rollSequence.phase = decision.type;
    blockingDecisions[decision.type] = 1;
    state.trayPrompt = Object.assign({}, decision);
  }
  function closeDecision() {
    const done = state.queueDone;
    state.queueDone = "";
    state.trayPrompt = null;
    /* La question est répondue, donc la phase doit cesser de tenir le dock,
       même quand rien n'était garé derrière elle. */
    if (state.rollSequence && phaseBlocks(state.rollSequence.phase)) state.rollSequence.phase = "open-after-events";
    return done;
  }
  function phaseBlocks(phase) { return !!(BLOCKING_PHASES[phase] || blockingDecisions[phase]); }

  /* Un seul endroit recalcule une entrée après réécriture — par un Portent posé
     sur un dé tombé, ou par une décision de couche. Un jet libre garde son
     propre verdict ; un test regagne son résultat depuis les nombres. */
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

  function entryById(id) {
    if (state.rollSequence && state.rollSequence.entry && state.rollSequence.entry.id === id) return state.rollSequence.entry;
    return state.history.find((item) => item.id === id) || null;
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
       le même emplacement : le style de verdict ne se pose que quand le titre
       EST le verdict du Ruling. */
    const ruling = rollVocabulary(entry).ruling;
    state.trayResults = results;
    state.trayTitle = ruling.verdict || ruling.title;
    // affichage, pas compte (T1) : l'énumération des dés reste hors du bois.
    state.trayResultText = ruling.display.join(" · ");
    state.trayVerdict = ruling.verdict;
    // Le nom seul, pour l'instant où les dés sont encore en l'air.
    state.trayQuietTitle = entry.name || t("tray.roll");
  }

  function prepareTrayForConfig(cfg) {
    if (!cfg) return;
    const original = cfg.editingId ? state.history.find((item) => item.id === cfg.editingId) : null;
    if (cfg.editingId && !original) return;
    const dice = [];
    if (original) {
      const originalD20 = original.d20Roll || {
        sides: 20, rolls: original.d20s || [original.kept], result: original.kept,
        chosenIndex: original.d20Choice != null ? original.d20Choice : (original.d20s || []).indexOf(original.kept),
        mode: original.d20Mode, forced: !!original.d20Forced
      };
      trayDiceForPlan(originalD20, "d20", { dieRole: "base" }).forEach((die) => { die.natural = die.result; dice.push(die); });
      const existingIds = {};
      entryBonusDice(original).forEach((die) => {
        existingIds[die.id] = true;
        trayDiceForPlan(die, die.label, { dieRole: "bonus" }).forEach((item) => dice.push(item));
      });
      (cfg.bonusDice || []).filter((die) => !existingIds[die.id]).forEach((die) => {
        pendingTrayDice(die.sides, die.label, die.advantageMode, die.forcedResult, { dieRole: "bonus", sourceIcon: die.sourceIcon, colour: die.colour || "", bonusId: die.id })
          .forEach((item) => dice.push(item));
      });
    } else {
      pendingTrayDice(20, "d20", cfg.d20Mode, cfg.d20ForcedResult, { dieRole: "base" }).forEach((item) => dice.push(item));
      (cfg.bonusDice || []).forEach((bonusDie) => {
        pendingTrayDice(bonusDie.sides, bonusDie.label, bonusDie.advantageMode, bonusDie.forcedResult, { dieRole: "bonus", sourceIcon: bonusDie.sourceIcon, colour: bonusDie.colour || "", bonusId: bonusDie.id })
          .forEach((item) => dice.push(item));
      });
    }
    /* Ce qu'une couche fait attendre dans le plateau. Le chemin commun ne sait
       pas ce que c'est ; il sait seulement où ça se pose. */
    configTrayHooks.forEach((hook) => (hook(cfg, original) || []).forEach((item) => dice.push(item)));
    // Le +X manuel bat sa pièce dès qu'il est tapé (R2) ; un zéro n'en bat aucune.
    if (Number(cfg.custom)) dice.push({ kind: "modifier", result: Number(cfg.custom), label: t("modifier.manual"), tone: "mod", pending: !original || Number(original.custom) !== Number(cfg.custom) });
    if (!original && exhaustionLevel()) dice.push({ kind: "modifier", result: exhaustionPenalty(), label: t("modifier.exhaustion"), tone: "exhaustion", pending: true });
    state.traySelection = [];
    state.trayResults = dice;
    state.trayTitle = cfg.name + " " + signed(cfg.baseBonus);
    state.trayResultText = original ? t("tray.d20-locked") : t("tray.ready");
  }

  /* CLEAR TRAY vide la main et, avec elle, le commentaire courant au-dessus des
     dés — le flux garde le relevé permanent. Les badges sont des DETTES, pas du
     commentaire : ils restent. */
  function clearDiceTray(closeConsole) {
    recreditPendingPoolDice();
    state.traySelection = [];
    state.trayResults = [];
    state.trayTitle = t("tray.idle");
    state.trayResultText = "";
    state.trayQuietTitle = "";
    state.trayVerdict = "";
    state.trayPrompt = null;
    state.queueDone = "";
    state.rollSequence = null;
    state.diePrompt = null;
    state.events = [];
    sequence.run("session-clear", {});
    if (closeConsole !== false) state.rollConfig = null;
  }

  function rollTransactionActive() {
    const seq = state.rollSequence;
    return !!(seq && phaseBlocks(seq.phase));
  }
  function warnRollLocked() { notify(t("notice.roll-locked"), "warn"); }

  /* ══ Le jet ouvert ═════════════════════════════════════════════════
     Un jet posé ne finit plus par un popup bloquant. Il reste OUVERT : le
     plateau garde ses dés et toute source d'un nouveau dé reste vive. Seule
     une vraie question bloque encore. */

  function stagedList() {
    const seq = state.rollSequence;
    return seq && Array.isArray(seq.staged) ? seq.staged : [];
  }
  function setStaged(next) {
    state.rollSequence = state.rollSequence || {};
    state.rollSequence.staged = next;
  }
  function rollOpen() { return !!(state.rollSequence && state.rollSequence.phase === "open"); }
  function openEntry() {
    const seq = state.rollSequence;
    if (!seq) return null;
    return state.history.find((item) => item.id === seq.entryId) || null;
  }
  function stagedBonusCount() { return stagedList().filter((item) => item.kind === "bonus").length; }
  function openStatusText(entry) {
    const staged = stagedList().length, base = rollDetailText(entry);
    return base + (staged ? (base ? " · " : "") + t("tray.staged-count", { count: staged }) : "");
  }
  function rollVerdictText(entry) { const ruling = rollRuling(entry); return ruling.verdict || ruling.title; }
  function rollDetailText(entry) { return rollRuling(entry).display.join(" · "); }

  function refreshOpenTray(entry) {
    setTrayFromEntry(entry);
    stagedList().forEach((item) => {
      const dice = pendingTrayDice(item.sides, item.label, item.advantageMode || "flat", null, {
        dieRole: item.kind === "bonus" ? "bonus" : item.kind,
        sourceIcon: item.sourceIcon || "", colour: item.colour || "",
        flash: item.kind !== "bonus", stagedId: item.id
      });
      /* Ordre de construction strict (Eric, 2026-08-04) : un dé stagé prend sa
         place chronologique à la fin, comme tout autre dé. */
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
      notify(t("notice.d20-is-base"), "warn"); return;
    }
    if (entryBonusDice(entry).length + stagedBonusCount() >= MAX_BONUS_DICE) {
      notify(t("notice.bonus-cap", { max: MAX_BONUS_DICE }), "warn"); return;
    }
    const used = entryBonusDice(entry).concat(stagedList()).map((die) => {
      const match = String(die.sourceIcon || "").match(/^other-([123])$/);
      return match ? Number(match[1]) : 0;
    });
    const slot = [1, 2, 3].find((value) => used.indexOf(value) < 0) || 1;
    setStaged(stagedList().concat([{
      id: uuid(), kind: "bonus", label: label || t("source.other-" + slot),
      sides, sourceIcon: sourceIcon || ("other-" + slot)
    }]));
    refreshOpenTray(entry);
  }

  function unstageDie(sides) {
    const entry = openEntry();
    if (!rollOpen() || !entry) return false;
    const staged = stagedList();
    for (let i = staged.length - 1; i >= 0; i--) {
      if (staged[i].kind === "bonus" && Number(staged[i].sides) === Number(sides)) {
        recreditPoolDie(staged[i]);
        dropEventsTagged(staged[i].tag);
        staged.splice(i, 1);
        refreshOpenTray(entry);
        return true;
      }
    }
    return false;
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
     il lance.

     ⚠️ D.2 : C'EST LA MOITIÉ « ROUVRIR » DE LA TRANSACTION ROUVRABLE. Elle ne
     bouge pas. */
  function rollStagedDice() {
    const entry = openEntry(), staged = stagedList();
    if (!rollOpen() || !entry) return;
    if (!staged.length) { repeatOpenRoll(entry); return; }
    /* Ce que les couches font des dés qui leur appartiennent, avant que les
       dés bonus ordinaires soient lancés. */
    const moment = sequence.run("reopen", { entry, staged });
    let events = moment.events.slice();
    const decision = moment.decision;
    const settled = moment.settled;
    staged.forEach((item) => {
      if (item.kind !== "bonus") return;
      if (entryBonusDice(entry).length >= MAX_BONUS_DICE) return;
      const plan = Object.assign(
        newBonusDie(item.label, item.sides, item.sourceIcon, item.colour),
        makeDiePlan(item.sides, item.advantageMode || "flat", item.forcedResult)
      );
      plan.poolResourceId = item.poolResourceId;
      plan.correction = item.correction || null;
      entry.bonusDice = entryBonusDice(entry).concat([plan]);
    });
    mirrorNamedBonusDice(entry);
    entry.total = entryTotal(entry);
    entry.outcome = outcomeFor(entry);
    entry.adjusted = true;
    entry.adjustedAt = now();
    setStaged([]);
    events = events.concat(settleCorrections(entry));
    setTrayFromEntry(entry);
    if (events.length || decision) {
      state.rollSequence.phase = "open-after-events";
      announceEvents(events, settled ? "finish-sequence" : "open-roll", decision);
      return;
    }
    if (settled) { releaseRoll(); setTrayFromEntry(entry); return; }
    openRollState(entry);
  }

  /* ── D.4 — LE REMBOURSEMENT CONDITIONNEL ─────────────────────────────
     VÉRIFIÉ dans le moteur porté : il n'existait pas. `recreditPoolDie` ne
     rendait une ressource que si son dé n'avait PAS de résultat — un dé lancé
     était dépensé, point. C'est juste pour Bardic (« expended when it's
     rolled »), et faux pour Tactical Mind : « If the check still fails, this
     use of Second Wind isn't expended » (SRD, Guerrier niv. 2).

     L'invariant 4 de `fh-char/1` dit « décrémenté AU RÈGLEMENT ». Un règlement
     qui REND la ressource selon le résultat n'était écrit nulle part : le
     voici. Il tourne au moment où le verdict est connu, et lui seul. */
  function settleCorrections(entry) {
    const events = [];
    entryBonusDice(entry).forEach((die) => {
      const rule = die.correction && CORRECTION_DICE[die.correction];
      if (!rule || !rule.refundIfStillFails || die.refunded) return;
      const stillFails = rollHasThreshold(entry) && entry.total < rollThreshold(entry);
      if (!stillFails) return;
      die.refunded = true;
      const source = entry.bonusDice.find((item) => item.id === die.id);
      if (source) source.refunded = true;
      if (die.poolResourceId) recreditPoolResource(die.poolResourceId);
      events.push({ text: t("event.refund", { label: sealLabel(die.correction) }), kind: "gain", entryId: entry.id });
    });
    return events;
  }

  /* ROLL à nouveau sur le même test : le montage est gardé, les dés ne le sont
     pas — et les dés BONUS sont des dés, pas du montage (M1, décision Eric
     2026-08-06). Une robe scellée est une faveur accordée pour UN jet : le
     suivant repart du d20 nu, toutes les robes de nouveau disponibles. Les
     drapeaux guidance/bardic doivent être effacés avec les dés, sinon
     ensureConfigBonusDice les rajouterait discrètement. */
  function repeatOpenRoll(entry) {
    const cfg = configFromEntry(entry);
    cfg.editingId = null; cfg.d20ForcedResult = null;
    cfg.bonusDice = []; cfg.guidance = false; cfg.bardic = false;
    configResetHooks.forEach((reset) => Object.assign(cfg, reset()));
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
    /* Le MOMENT `result`. Une couche peut y POSER UNE QUESTION, et alors rien
       n'est réglé : le joueur doit répondre, et sa réponse peut renverser le
       jet. C'est le piège du lot 3, gravé : régler ici montrerait à la table
       un résultat qui change silencieusement. */
    const moment = sequence.run("result", { entry });
    events = (events || []).concat(moment.events);
    state.rollSequence = state.rollSequence || {};
    state.rollSequence.entryId = entry.id;
    if (moment.decision) {
      state.queueDone = "";
      openDecision(moment.decision);
      return;
    }
    events = events.concat(runDamagePhase(entry));
    entry.outcome = outcomeFor(entry);
    recomputeTrayText(entry);
    if (events.length) {
      state.rollSequence.phase = "open-after-events";
      announceEvents(events, "open-roll");
      return;
    }
    openRollState(entry);
  }

  function recomputeTrayText(entry) {
    state.trayResultText = t("tray.total", { total: entry.total, outcome: entry.outcome });
  }

  /* ── Exigence A — LA SECONDE PHASE D'UNE ATTAQUE ─────────────────────
     Toucher, puis des dégâts : DEUX JETS LIÉS, une seule entrée de flux. Le
     critique double les DÉS et jamais le bonus (SRD p.179). Les dégâts ne sont
     pas lancés quand le seuil est connu ET manqué ; quand il ne l'est pas, le
     MJ tient la CA et le moteur lance — il ne devine pas un échec. */
  function runDamagePhase(entry) {
    const damage = entry.damage;
    if (!damage || entry.damageDice) return [];
    /* Un coup dont on SAIT qu'il a manqué ne fait pas de dégâts. Quand le
       seuil est inconnu — c'est le MJ qui tient la CA — le moteur lance : il
       ne devine pas un échec. Et un sort à sauvegarde n'a pas de jet du
       lanceur du tout : ses dégâts ne dépendent pas d'un dé qu'il n'a pas. */
    if (rollWasMade(entry) && rollHasThreshold(entry) && entry.total < rollThreshold(entry)) return [];
    const critical = entry.rollType === "attack" && entry.natural === 20;
    const plan = damagePlanFor(damage, { critical });
    entry.damageDice = plan.dice.map((die) => ({ sides: die.sides, result: rollDie(die.sides) }));
    entry.damageCritical = critical;
    entry.damageTotal = entry.damageDice.reduce((sum, die) => sum + die.result, 0) + plan.bonus;
    const events = [];
    if (critical) events.push({ text: t("event.critical-hit", { name: entry.name }), kind: "nat20", entryId: entry.id });
    events.push({ text: t("event.damage", { name: entry.name, total: entry.damageTotal, type: damage.type }), kind: "result", entryId: entry.id });
    return events;
  }

  function quickRoll(name, ability, bonus, note) {
    clearDiceTray(false);
    state.rollConfig = null;
    const natural = rollDie(20);
    const entry = newEntry("check", {
      name, ability, baseBonus: Number(bonus) || 0,
      d20Mode: "flat", d20s: [natural],
      d20Roll: { sides: 20, mode: "flat", rolls: [natural], result: natural, chosenIndex: 0, forced: false },
      d20Choice: 0, d20Forced: false, kept: natural, natural, note: note || ""
    });
    state.rollSequence = { phase: "remaining", entryId: entry.id };
    finishRolledEntry(entry, []);
  }

  function newEntry(rollType, fields) {
    return Object.assign({
      id: uuid(), kind: "d20", rollType,
      name: "", ability: "", baseBonus: 0, custom: 0, dc: "", note: "",
      exhaustion: exhaustionLevel(), exhaustionPenalty: exhaustionPenalty(),
      d20Mode: "flat", d20s: [], kept: null, natural: null,
      bonusDice: [], guidance: null, bardic: null, rerolls: [],
      createdAt: now(), adjusted: false
    }, fields);
  }

  /* ══ La configuration d'un jet ═════════════════════════════════════ */

  function rollInput(name, ability, bonus, options) {
    options = options || {};
    const type = rollTypeFor(options.rollType);
    const cfg = Object.assign({
      rollType: type.id, name, ability, baseBonus: Number(bonus) || 0,
      d20Mode: rollMode(options.mode), d20ForcedResult: null,
      guidance: false, bardic: false,
      bardicSides: Number(state.prefs.bardicSides) || 6, bonusDice: [],
      custom: 0, dc: options.dc != null ? String(options.dc) : "",
      note: options.note || "", editingId: null
    }, ...configDefaultHooks.map((hook) => hook()));
    /* Les réglages propres au type, lus par la liste FERMÉE du type — jamais
       recopiés en vrac depuis les options (exigence A). */
    const typed = {};
    Object.keys(type.settings).forEach((key) => { if (options[key] !== undefined) typed[key] = options[key]; });
    applySettings(type, cfg, typed);
    return cfg;
  }

  function ensureConfigBonusDice(cfg) {
    cfg.bonusDice = (Array.isArray(cfg.bonusDice) ? cfg.bonusDice : []).slice(0, MAX_BONUS_DICE);
    if (cfg.guidance && !cfg.bonusDice.some((die) => String(die.label).toLowerCase() === "guidance") && cfg.bonusDice.length < MAX_BONUS_DICE) {
      cfg.bonusDice.push(newBonusDie(t("source.guidance"), 4));
    }
    if (cfg.bardic && !cfg.bonusDice.some((die) => String(die.label).toLowerCase() === "bardic") && cfg.bonusDice.length < MAX_BONUS_DICE) {
      cfg.bonusDice.push(newBonusDie(t("source.bardic"), Number(cfg.bardicSides) || 6));
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
    return Object.assign({
      editingId: entry.id, rollType: entry.rollType || "check",
      name: entry.name, ability: entry.ability, baseBonus: entry.baseBonus,
      d20Mode: entry.d20Mode || "flat", d20ForcedResult: entry.d20Forced ? entry.kept : null,
      guidance: !!entry.guidance, bardic: !!entry.bardic,
      bardicSides: entry.bardic ? entry.bardic.sides : Number(state.prefs.bardicSides) || 6,
      bonusDice: dice,
      custom: Number(entry.custom) || 0, dc: entry.dc, ac: entry.ac, note: entry.note || "",
      damage: entry.damage || null
    }, ...configEntryHooks.map((hook) => hook(entry)));
  }

  function showDieChoice(target, index, plan, label) {
    state.rollSequence.phase = target === "d20" || target === "bonus" ? "roll-choice"
      : target === "adjustment" ? "adjustment-choice" : target + "-choice";
    blockingDecisions[state.rollSequence.phase] = 1;
    state.trayPrompt = {
      type: "die-choice", target, index, label, sides: plan.sides, mode: plan.mode, rolls: plan.rolls.slice(),
      dieRole: target === "d20" ? "base" : target === "adjustment" ? "bonus" : target
    };
  }

  function continueRemainingChoices() {
    const seq = state.rollSequence;
    if (!seq || !seq.entry) return;
    const next = (seq.choiceQueue || []).shift();
    if (next) {
      const plan = next.target === "d20" ? seq.entry.d20Roll : seq.entry.bonusDice[next.index];
      showDieChoice(next.target, next.index, plan, next.label);
      return;
    }
    const entry = seq.entry;
    entry.kept = entry.d20Roll.result;
    entry.natural = entry.kept;
    entry.d20Choice = entry.d20Roll.chosenIndex;
    entry.d20Forced = !!entry.d20Roll.forced;
    mirrorNamedBonusDice(entry);
    state.trayPrompt = null;
    seq.phase = "result";
    finishRolledEntry(entry, []);
  }

  /* ⚠️ D.2 — L'AUTRE MOITIÉ DE LA TRANSACTION ROUVRABLE : la sortie. Un jet
     déjà dans le flux est MUTÉ EN PLACE, jamais dupliqué, et il recalcule son
     verdict. Intouchable. */
  function completeHistoryAdjustment(entry, cfg, plans) {
    // Un simple dé bonus ne bloque jamais : il atterrit dans le plateau et la boucle rouvre.
    const existing = entryBonusDice(entry), events = [];
    entry.custom = cfg.custom; entry.dc = cfg.dc;
    entry.bonusDice = existing.concat(plans || []).slice(0, MAX_BONUS_DICE).map(normalizeBonusDie);
    mirrorNamedBonusDice(entry);
    entry.total = entryTotal(entry);
    entry.adjusted = true;
    entry.adjustedAt = now();
    entry.outcome = outcomeFor(entry);
    /* D.4 sur l'AUTRE porte de réouverture : un dé de correction ajouté par la
       console d'ajustement se rembourse aux mêmes conditions que celui qui
       passe par les dés stagés. Deux portes, un seul règlement. */
    settleCorrections(entry).forEach((spec) => events.push(spec));
    state.trayPrompt = null;
    setTrayFromEntry(entry);
    state.rollSequence.entryId = entry.id;
    if (events.length) { state.rollSequence.phase = "open-after-events"; announceEvents(events, "open-roll"); return; }
    openRollState(entry);
  }

  function continueAdjustmentChoices() {
    const seq = state.rollSequence;
    if (!seq || !seq.entry) return;
    const next = (seq.choiceQueue || []).shift();
    if (next) { showDieChoice("adjustment", next.index, seq.adjustmentPlans[next.index], next.label); return; }
    completeHistoryAdjustment(seq.entry, seq.cfg, seq.adjustmentPlans || []);
  }

  function resolveDieChoice(index) {
    const prompt = state.trayPrompt, seq = state.rollSequence;
    if (!prompt || prompt.type !== "die-choice" || !seq) return;
    state.trayPrompt = null;
    /* Une couche qui a un dé à faire choisir déclare sa cible ; le chemin
       commun n'en connaît que deux, le d20 et un dé bonus. */
    const owned = dieChoiceTargets[prompt.target];
    if (owned) { owned(seq, index); return; }
    if (prompt.target === "d20") chooseDiePlan(seq.entry.d20Roll, index);
    else if (prompt.target === "bonus") chooseDiePlan(seq.entry.bonusDice[prompt.index], index);
    else if (prompt.target === "adjustment") { chooseDiePlan(seq.adjustmentPlans[prompt.index], index); continueAdjustmentChoices(); return; }
    setTrayFromEntry(seq.entry);
    state.trayResultText = t("tray.choice-recorded");
    continueRemainingChoices();
  }

  function runConfiguredRoll() {
    const cfg = state.rollConfig;
    if (!cfg) return;
    ensureConfigBonusDice(cfg);
    if (state.rollSequence && state.rollSequence.phase && state.rollSequence.phase !== "resolved") return;
    if (cfg.editingId) { applyHistoryAdjustment(cfg); return; }
    const type = rollTypeFor(cfg.rollType);
    const entry = newEntry(type.id, {
      name: cfg.name, ability: cfg.ability, baseBonus: cfg.baseBonus,
      d20Mode: cfg.d20Mode, custom: cfg.custom, dc: cfg.dc, ac: cfg.ac,
      saveAbility: cfg.saveAbility, saveDc: cfg.saveDc, slotLevel: cfg.slotLevel,
      concentration: !!cfg.concentration, damage: cfg.damage || null, note: cfg.note
    });
    state.rollSequence = { phase: "mount", cfg: snapshotRollConfig(cfg), entry, entryId: entry.id };
    const opened = runSlotPhase(entry, cfg);
    /* Le MOMENT `pre-roll` : ce qui se lance AVANT le d20. Une couche peut
       RÉCLAMER la séquence ici (elle a un dé à lancer d'abord) ; elle la rend
       ensuite par `roll-remaining`. */
    const moment = sequence.run("pre-roll", { cfg: state.rollSequence.cfg, entry, sequence: state.rollSequence });
    if (moment.claimed) return;
    if (opened.length) { announceEvents(opened, "roll-remaining"); return; }
    state.rollSequence.phase = "remaining";
    rollSequenceRemaining();
  }

  /* La phase `slot` d'un sort : l'emplacement est consommé au lancement, pas
     au résultat. Sans `slotResourceId` déclaré, le moteur ANNONCE la dépense
     sans décrémenter quoi que ce soit — il n'invente pas l'identifiant d'une
     ressource qu'on ne lui a pas nommée (loi §0.10). */
  function runSlotPhase(entry, cfg) {
    if (entry.rollType !== "spell") return [];
    const events = [];
    if (cfg.slotLevel) {
      if (cfg.slotResourceId) spendPoolResourceSilently(cfg.slotResourceId);
      events.push({ text: t("event.slot-spent", { slotLevel: cfg.slotLevel, name: entry.name }), kind: "loss", entryId: entry.id });
    }
    if (cfg.concentration) events.push({ text: t("event.concentration", { name: entry.name }), kind: "info", entryId: entry.id });
    if (cfg.resolution === "save" && cfg.saveAbility) {
      events.push({ text: t("event.save-dc", { name: entry.name, ability: cfg.saveAbility, dc: cfg.saveDc }), kind: "info", entryId: entry.id });
    }
    return events;
  }

  function rollSequenceRemaining() {
    const seq = state.rollSequence;
    if (!seq || !seq.cfg || !seq.entry) return;
    const cfg = seq.cfg, entry = seq.entry;
    /* Un sort à sauvegarde n'a PAS de jet du lanceur : la cible sauvegarde. La
       séquence saute donc la phase `d20` et va droit aux dégâts. */
    if (entry.rollType === "spell" && cfg.resolution === "save") {
      entry.kept = null; entry.natural = null; entry.d20s = [];
      finishRolledEntry(entry, []);
      return;
    }
    entry.d20Roll = makeDiePlan(20, cfg.d20Mode, cfg.d20ForcedResult);
    entry.d20s = entry.d20Roll.rolls.slice();
    entry.bonusDice = (cfg.bonusDice || []).map((die, index) => Object.assign(normalizeBonusDie(die, index), makeDiePlan(die.sides, die.advantageMode, die.forcedResult)));
    seq.choiceQueue = [];
    if (entry.d20Roll.result == null) seq.choiceQueue.push({ target: "d20", index: 0, label: "d20" });
    entry.bonusDice.forEach((die, index) => { if (die.result == null) seq.choiceQueue.push({ target: "bonus", index, label: die.label + " d" + die.sides }); });
    setTrayFromEntry(entry);
    state.trayResultText = seq.choiceQueue.length ? t("tray.choose-keep") : t("tray.rolling");
    continueRemainingChoices();
  }

  function applyHistoryAdjustment(cfg) {
    const entry = state.history.find((item) => item.id === cfg.editingId);
    if (!entry || entry.kind !== "d20") return;
    state.rollSequence = { phase: "adjustment", cfg: snapshotRollConfig(cfg), entry, entryId: entry.id, adjustment: true };
    const moment = sequence.run("pre-roll", { cfg: state.rollSequence.cfg, entry, sequence: state.rollSequence, adjustment: true });
    if (moment.claimed) return;
    applyHistoryAdjustmentRemaining(entry, cfg);
  }

  function applyHistoryAdjustmentRemaining(entry, cfg) {
    const existingIds = {};
    entryBonusDice(entry).forEach((die) => { existingIds[die.id] = true; });
    const plans = (cfg.bonusDice || [])
      .filter((die) => !existingIds[die.id])
      .slice(0, Math.max(0, MAX_BONUS_DICE - entryBonusDice(entry).length))
      .map((die, index) => Object.assign(normalizeBonusDie(die, index), makeDiePlan(die.sides, die.advantageMode, die.forcedResult)));
    const seq = state.rollSequence || { phase: "adjustment", entry, cfg: snapshotRollConfig(cfg), entryId: entry.id, adjustment: true };
    state.rollSequence = seq;
    seq.entry = entry;
    seq.cfg = snapshotRollConfig(cfg);
    seq.adjustmentPlans = plans;
    seq.choiceQueue = [];
    plans.forEach((die, index) => { if (die.result == null) seq.choiceQueue.push({ target: "adjustment", index, label: die.label + " d" + die.sides }); });
    if (seq.choiceQueue.length) {
      setTrayFromEntry(entry);
      plans.forEach((die) => trayDiceForPlan(die, die.label, { dieRole: "bonus" }).forEach((item) => state.trayResults.push(item)));
      state.trayResultText = t("tray.d20-locked-choose");
      continueAdjustmentChoices();
      return;
    }
    completeHistoryAdjustment(entry, cfg, plans);
  }

  /* ── POINT DE RÈGLEMENT n°2 : la branche `finish-sequence` ─────────── */
  function runQueueDone(action) {
    if (action === "roll-remaining") {
      if (state.rollSequence) state.rollSequence.phase = "remaining";
      rollSequenceRemaining(); return;
    }
    if (action === "adjustment-remaining") {
      const seq = state.rollSequence;
      const adjusted = (seq && state.history.find((item) => item.id === seq.entryId)) || (seq && seq.entry);
      if (adjusted && seq && seq.cfg) {
        if (seq.entry) adoptSequenceEntry(adjusted, seq.entry);
        applyHistoryAdjustmentRemaining(adjusted, seq.cfg);
      }
      return;
    }
    if (action === "open-roll") { const landed = openEntry(); if (landed) openRollState(landed); return; }
    // Un jet qui n'ouvre pas de transaction se règle ici.
    if (action === "finish-sequence") {
      const settled = state.rollSequence && state.history.find((item) => item.id === state.rollSequence.entryId);
      if (settled) settleEntry(settled);
      state.rollSequence = null;
      return;
    }
  }

  /* Une couche qui a écrit sur l'entrée de séquence pendant sa phase doit
     retrouver son travail sur l'entrée de l'historique. Le chemin commun ne
     sait pas ce qu'elle a écrit : il recopie les clefs qu'elle déclare. */
  const adoptedKeys = declarations.flatMap((layer) => layer.entryKeys || []);
  function adoptSequenceEntry(target, source) {
    if (target === source) return;
    adoptedKeys.forEach((key) => { if (source[key] !== undefined) target[key] = source[key]; });
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
    return {
      id: raw.id || uuid(), label, short, kind, sides, count, tint,
      correction: CORRECTION_DICE[raw.correction] ? raw.correction : undefined,
      /* ── D.5 — LA PROVENANCE D'UN DÉ REÇU ────────────────────────────
         Un dé donné par un autre joueur est, chez le receveur, une ressource
         comptée ORDINAIRE — qui porte SA PROVENANCE. Le champ existait déjà
         dans ce normaliseur (`origin`) et n'était jamais rempli ; le lot 5 le
         remplit et en fixe la forme.
         ⚠️ `resolved.resources[]` de `fh-char/1` n'a PAS ce champ, et son
         `additionalProperties` est `false` : la forme ci-dessous est LIVRÉE À
         L'ARCHITECTE, elle n'est pas écrite dans le schéma par ce lot
         (loi §0.10). Voir COUPE-LOT-5.md § « la forme de provenance ». */
      origin: normalizeOrigin(raw.origin)
    };
  }

  /* ARBITRÉ PAR L'ARCHITECTE le 2026-08-08, après que le RELECTEUR Adverserial
     a montré que ce moteur et `fh-char/1` ne parlaient PAS la même langue —
     `timing`/`ahead` ici, `window`/`advance` au contrat, `givenAt` nulle part.
     Chaque bout était testé chez lui et aucune suite ne les confrontait : la
     poignée de main avait eu lieu dans le vide. Le défaut venait de
     l'architecte, qui avait écrit le schéma depuis le DOCUMENT du lot 5 au lieu
     de son CODE. C'est le moteur qui se déplace sur les deux noms — `window`
     dit ce que le consommateur a besoin de savoir (quand le dé peut servir),
     et c'est le mot de la décision d'Eric — et c'est le contrat qui accueille
     `givenAt`, sans lequel `expiresAt` ne se calcule pas. */
  function normalizeOrigin(raw) {
    if (!raw || typeof raw !== "object") return undefined;
    const timing = raw.timing === "reaction" ? "reaction" : "advance";
    return {
      from: String(raw.from || "").slice(0, 60),
      source: String(raw.source || "").slice(0, 40),
      timing,
      givenAt: raw.givenAt || now(),
      expiresAt: raw.expiresAt || null
    };
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
     son usage. Un dé lancé ne revient jamais — sauf remboursement conditionnel
     déclaré par sa source (D.4). */
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

  function spendPoolResourceSilently(id) {
    const res = poolResourceById(id);
    if (!res || Number(res.count) < 1) { notify(t("notice.pool-spent"), "warn"); return false; }
    res.count = Number(res.count) - 1;
    emitPool("pool-spend");
    return true;
  }

  /* Dépenser : le dé est STAGÉ, où que vive la main — un jet ouvert, une
     console préparée, ou rien du tout. Le décrément se fait maintenant ; ROLL
     le rend définitif, la reprise l'annule. */
  function spendPoolResource(id) {
    const res = poolResourceById(id);
    if (!res || Number(res.count) < 1) { notify(t("notice.pool-spent"), "warn"); return; }
    const icon = poolSourceIconFor(res), colour = icon ? "" : (res.tint || "");
    if (rollOpen()) {
      const entry = openEntry();
      if (!entry) return;
      if (entryBonusDice(entry).length + stagedBonusCount() >= MAX_BONUS_DICE) {
        notify(t("notice.bonus-cap", { max: MAX_BONUS_DICE }), "warn"); return;
      }
      res.count = Number(res.count) - 1;
      setStaged(stagedList().concat([{
        id: uuid(), kind: "bonus", label: res.label, short: res.short, sides: res.sides,
        sourceIcon: icon, colour, poolResourceId: res.id, correction: res.correction || null
      }]));
      refreshOpenTray(entry);
      emitPool("pool-spend");
      return;
    }
    const cfg = state.rollConfig;
    if (cfg && !cfg.editingId) {
      if ((cfg.bonusDice || []).length >= MAX_BONUS_DICE) { notify(t("notice.bonus-cap", { max: MAX_BONUS_DICE }), "warn"); return; }
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
    if (state.traySelection.length >= MAX_FREE_DICE) { pushEvent(t("notice.free-cap", { max: MAX_FREE_DICE }), "warn"); return; }
    res.count = Number(res.count) - 1;
    const free = newFreeDie(res.sides, colour || SOURCE_TINT[icon] || "");
    free.label = res.label;
    free.short = res.short;
    free.poolResourceId = res.id;
    state.traySelection.push(free);
    state.trayResults = [];
    emitPool("pool-spend");
  }

  /* ══ D.1 — LES TROIS VERBES DE DÉ, ET ILS NE SE RAMÈNENT PAS L'UN À L'AUTRE
     ══════════════════════════════════════════════════════════════════════
     Tranché par Eric le 2026-08-08. Trois fenêtres, trois cibles, trois portes.
     Un moteur qui les traite pareil laissera passer un Bardic sur un succès.

     | Verbe    | Fenêtre                          | Cible              |
     |----------|----------------------------------|--------------------|
     | addDie   | APRÈS un échec                   | le TOTAL           |
     | rerollDie| IMMÉDIATEMENT après ce dé        | N'IMPORTE QUEL dé  |
     | mountDie | AVANT le jet                     | le d20 / le montage|
  */

  /* ── Verbe n°1 : AJOUTER un dé après un échec ───────────────────────
     Bardic Inspiration (Barde) et Tactical Mind (Guerrier niv. 2). La FENÊTRE
     est une garde réelle, pas un commentaire : un Bardic dépensé sur un succès
     est un dé perdu pour rien, et c'est le bug que D.1 existe pour empêcher.

     Quand le jet N'A PAS de seuil, le moteur ne peut pas savoir s'il a échoué —
     c'est le MJ qui tient le DD. Il autorise alors le dé, et le dit ici plutôt
     que de faire semblant de vérifier. */
  function addDie(source, { sides, poolResourceId } = {}) {
    const rule = CORRECTION_DICE[source];
    if (!rule) throw new Error('fhpc/play: "' + source + '" is not a correction die — one of ' + Object.keys(CORRECTION_DICE).join(", "));
    const entry = openEntry();
    if (!rollOpen() || !entry) { notify(t("notice.correction-needs-landed", { label: sealLabel(source) }), "warn"); return false; }
    if (rule.appliesTo.indexOf(entry.rollType || "check") < 0) {
      notify(t("notice.correction-needs-failure", { label: sealLabel(source) }), "warn"); return false;
    }
    if (rollHasThreshold(entry) && entry.total >= rollThreshold(entry)) {
      notify(t("notice.correction-needs-failure", { label: sealLabel(source) }), "warn"); return false;
    }
    if (entryBonusDice(entry).length + stagedBonusCount() >= MAX_BONUS_DICE) {
      notify(t("notice.bonus-cap", { max: MAX_BONUS_DICE }), "warn"); return false;
    }
    setStaged(stagedList().concat([{
      id: uuid(), kind: "bonus", label: sealLabel(source), sides: Number(sides) || rule.sides,
      sourceIcon: source, correction: source, poolResourceId: poolResourceId || null
    }]));
    refreshOpenTray(entry);
    return true;
  }

  /* ── Verbe n°2 : RELANCER un dé déjà tombé ──────────────────────────
     Point d'inspiration héroïque (SRD 5.2, `srd:glossary:en:heroic-inspiration`,
     p.183) : « expend it to reroll any die immediately after rolling it, and
     you must use the new roll ».

     N'IMPORTE QUEL dé : le d20, un dé bonus, un dé de dégâts. C'est ce qui le
     sépare des deux autres verbes, et c'est pour cela qu'il traverse le même
     mécanisme de réécriture en place que le Portent — l'entrée est MUTÉE, elle
     n'est jamais dupliquée, et le verdict est recalculé.

     ⚠️ Fate's Hand a RETIRÉ cette mécanique, et le SRD la garde. Elle vit donc
     ici, dans le chemin commun, et elle doit marcher AVEC LA COUCHE DÉBRAYÉE.
     C'est le troisième test d'acceptation du lot. */
  function rerollDie({ entryId, dieKey, poolResourceId, source = "heroic-inspiration" } = {}) {
    const entry = entryById(entryId) || openEntry();
    if (!entry) { notify(t("notice.reroll-needs-landed"), "warn"); return false; }
    const target = landedDiePart(entry, dieKey);
    if (!target || target.result == null) { notify(t("notice.reroll-unknown-die"), "warn"); return false; }
    if (poolResourceId && !spendPoolResourceSilently(poolResourceId)) return false;
    const before = target.result;
    const after = rollDie(target.sides);
    writeLandedDie(entry, dieKey, after);
    entry.rerolls = (entry.rerolls || []).concat([{ dieKey, label: target.label, before, after, source, at: now() }]);
    entry.adjusted = true;
    entry.adjustedAt = now();
    recomputeEntry(entry);
    refreshEntryTray(entry);
    const events = [{ text: t("event.reroll", { source, label: target.label, before, after }), kind: "adjusted", entryId: entry.id }];
    state.rollSequence = state.rollSequence || {};
    state.rollSequence.entryId = entry.id;
    if (!rollOpen()) state.rollSequence.phase = "open-after-events";
    announceEvents(events, "open-roll");
    return true;
  }

  /* ── Verbe n°3 : MONTER un dé avant le jet ──────────────────────────
     Guidance, l'avantage : ce sont des décisions prises AVANT que les dés
     quittent la main. Les offrir après coup était l'ancien bug — et c'est
     exactement la raison pour laquelle `guidance` a quitté SEALABLE_SOURCES
     (D.3). La fenêtre est donc l'inverse de celle d'`addDie` : il faut une
     console préparée et RIEN de lancé. */
  function mountDie({ source = "guidance", sides, mode } = {}) {
    const cfg = state.rollConfig;
    if (!cfg || cfg.editingId || rollOpen()) {
      notify(t("notice.mount-after-roll", { label: sealLabel(source) }), "warn"); return false;
    }
    if (mode) { cfg.d20Mode = rollMode(mode); prepareTrayForConfig(cfg); return true; }
    if ((cfg.bonusDice || []).length >= MAX_BONUS_DICE) { notify(t("notice.bonus-cap", { max: MAX_BONUS_DICE }), "warn"); return false; }
    cfg.bonusDice.push(newBonusDie(sealLabel(source), Number(sides) || 4, source));
    syncPresetFlags(cfg);
    prepareTrayForConfig(cfg);
    return true;
  }

  /* ══ D.5 — LE DON D'UN DÉ ENTRE JOUEURS ════════════════════════════
     « Le dé de Bardic est donné par un barde au joueur : il faudrait qu'un
     joueur puisse donner un dé à un autre joueur. »

     LE LOT 5 CONSTRUIT LES DEUX BOUTS, PAS LE TRANSPORT. Faire voyager le dé
     d'une machine à l'autre est du bloc `table` (M4). Ici, un dé reçu se pose
     directement.

     Deux fenêtres, et ce sont DEUX PORTES, comme en D.1 :
     - `advance`  : le dé ATTEND sur la fiche du receveur, ressource comptée ;
     - `reaction` : le dé arrive PENDANT une transaction ouverte et se stage. */

  /* Le bout DONNEUR : il décrémente SA ressource et émet un événement. Il ne
     touche à aucun autre document — le personnage appartient au joueur. */
  function giveDie({ source, to, timing = "advance", poolResourceId, dieId } = {}) {
    const gift = giftSources[source];
    let offered = null;
    if (gift) {
      offered = gift({ dieId, poolResourceId, to, timing });
      if (!offered) return null;
    } else {
      const res = poolResourceById(poolResourceId);
      if (!res || Number(res.count) < 1) { notify(t("notice.no-such-resource", { label: source || "die" }), "warn"); return null; }
      res.count = Number(res.count) - 1;
      emitPool("pool-given");
      offered = { source: source || res.correction || "", sides: res.sides, label: res.label, tint: res.tint, kind: res.kind, count: 1, correction: res.correction };
    }
    const record = {
      schema: "fh-die-gift/1",
      from: (state.character && state.character.name) || state.pseudo || "",
      to: String(to || ""), timing,
      die: offered, givenAt: now()
    };
    pushEvent(t("event.die-given", { label: offered.label, sides: offered.sides, to: record.to, timing }), "loss");
    bus.emit("die-given", record);
    return record;
  }

  /* Le bout RECEVEUR : le dé reçu est une ressource comptée ORDINAIRE qui
     porte sa provenance. Rien de neuf dans le moteur — c'est le point : un dé
     donné se dépense exactement comme un dé qu'on possédait déjà. */
  function receiveDie(record) {
    if (!record || !record.die) throw new Error("fhpc/play: receiveDie needs a fh-die-gift/1 record");
    const die = record.die;
    const resource = normalizePoolResource({
      id: uuid(), label: die.label, short: die.short, kind: die.kind || "die",
      sides: die.sides, count: die.count == null ? 1 : die.count, tint: die.tint,
      correction: die.correction,
      origin: { from: record.from, source: die.source || "", timing: record.timing, givenAt: record.givenAt }
    });
    if (poolList().length >= MAX_POOL_RESOURCES) { notify(t("notice.pool-spent"), "warn"); return null; }
    poolList().push(resource);
    emitPool("pool-received");
    pushEvent(t("event.die-received", { label: resource.label, sides: resource.sides, from: record.from, timing: record.timing }), "gain");
    /* La fenêtre « en réaction » n'est pas la même que « à l'avance » : un dé
       donné en réaction arrive PENDANT une transaction ouverte et se pose tout
       de suite ; un dé donné à l'avance attend sur la fiche. */
    if (record.timing === "reaction" && rollOpen()) spendPoolResource(resource.id);
    return resource;
  }

  /* ══ Le plateau libre ══════════════════════════════════════════════ */

  function addTrayDie(sides) {
    sides = Number(sides);
    if (ROLL_DIE_SIZES.indexOf(sides) < 0) return;
    /* Avec une console ouverte, le plateau nourrit le jet préparé plutôt qu'une
       réserve libre. */
    const cfg = state.rollConfig;
    if (cfg && !cfg.editingId) {
      if (sides === 20 || sides === 100) { notify(t("notice.d20-is-base"), "warn"); return; }
      if ((cfg.bonusDice || []).length >= MAX_BONUS_DICE) { notify(t("notice.bonus-cap", { max: MAX_BONUS_DICE }), "warn"); return; }
      const used = (cfg.bonusDice || []).map((die) => {
        const match = String(die.sourceIcon || "").match(/^other-([123])$/);
        return match ? Number(match[1]) : 0;
      });
      const slot = [1, 2, 3].find((value) => used.indexOf(value) < 0) || Math.min(3, cfg.bonusDice.length + 1);
      cfg.bonusDice.push(newBonusDie(t("source.other-" + slot), sides, "other-" + slot));
      syncPresetFlags(cfg);
      prepareTrayForConfig(cfg);
      return;
    }
    if (state.traySelection.length >= MAX_FREE_DICE) { pushEvent(t("notice.free-cap", { max: MAX_FREE_DICE }), "warn"); return; }
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
    if (!state.traySelection.length) state.traySelection = [newFreeDie(20)];
    if (label != null) state.trayLabel = String(label || t("tray.free-label")).slice(0, 48);
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
      id: uuid(), kind: "tray", name: state.trayLabel || t("tray.free-label"), dice,
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
    if (special && die20Notice(special)) {
      events.push({ text: die20Notice(special) + " · " + entry.name + " · Total " + entry.total, kind: special.result === 20 ? "nat20" : "nat1", entryId: entry.id });
    }
    state.rollSequence = null;
    state.queueDone = "";
    if (events.length) {
      state.rollSequence = { phase: "free-tray", entryId: entry.id };
      announceEvents(events, "finish-sequence");
    }
  }
  /* Un naturel extrême dans le plateau libre est un FAIT annoncé, pas un
     verdict : la table libre n'a ni seuil ni conséquence. */
  function die20Notice(die) {
    return die.result === 20 ? t("verdict.natural-20") + " IN THE TRAY" : t("verdict.natural-1") + " IN THE TRAY";
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
    /* Les portées qu'une couche possède. Le chemin commun n'en connaît que
       cinq : la base, un dé stagé, un dé bonus de console, un dé libre, un dé
       tombé. */
    for (const key of Object.keys(dieScopes)) {
      const found = dieScopes[key].find(prompt);
      if (found) return found;
    }
    /* Un dé stagé répond au clic droit comme tout autre dé de la main — c'est
       tout l'intérêt qu'il ne soit plus un popup. */
    if (prompt.stagedId) {
      const item = stagedList().find((die) => die.id === prompt.stagedId);
      return item ? Object.assign({ scope: item.kind === "bonus" ? "staged" : "staged-" + item.kind }, item) : null;
    }
    if (prompt.bonusId) {
      const bonus = cfg && (cfg.bonusDice || []).find((die) => die.id === prompt.bonusId && !die.locked);
      return bonus ? Object.assign({ scope: "bonus" }, bonus) : null;
    }
    if (prompt.freeId) {
      const free = state.traySelection.find((die) => die.id === prompt.freeId);
      return free ? Object.assign({ scope: "free", label: "d" + free.sides, sourceIcon: "" }, free) : null;
    }
    /* Un dé déjà tombé. Rien de lui ne peut être relancé par un sceau ni
       re-monté, mais un Devin peut encore remplacer ce qu'il lit — et un Point
       d'inspiration héroïque peut le relancer (D.1, verbe n°2). */
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

  /* Les sortes de dé qu'une entrée résolue possède, adressées par une clef
     stable pour que le menu atteigne le même dé après n'importe quel rendu. */
  function landedDiePart(entry, key) {
    if (!entry || !key) return null;
    if (key === "d20") return entry.kind === "d20" ? { sides: 20, label: "d20", result: entry.kept, forced: !!entry.d20Forced, colour: entry.d20Colour || "" } : null;
    const bonus = String(key).match(/^bonus:(.+)$/);
    if (bonus) {
      const die = entryBonusDice(entry).find((item) => item.id === bonus[1]);
      return die ? { sides: die.sides, label: die.label, result: die.result, forced: !!die.forced, colour: die.colour || "", sourceIcon: die.sourceIcon || "" } : null;
    }
    const damage = String(key).match(/^damage:(\d+)$/);
    if (damage) {
      const item = (entry.damageDice || [])[Number(damage[1])];
      return item ? { sides: item.sides, label: t("tray.damage"), result: item.result, forced: !!item.forced, colour: "" } : null;
    }
    const free = String(key).match(/^free:(\d+)$/);
    if (free) {
      const item = (entry.dice || [])[Number(free[1])];
      return item ? { sides: item.sides, label: "d" + item.sides, result: item.result, forced: !!item.forced, colour: item.colour || "" } : null;
    }
    return null;
  }

  /* Écrire un nouveau résultat sur un dé TOMBÉ, quelle que soit sa sorte. Un
     seul endroit — le Portent et la relance en dépendent tous les deux, et
     deux implémentations de la même écriture divergeraient. */
  function writeLandedDie(entry, key, value) {
    if (key === "d20") {
      entry.d20Roll = { sides: 20, mode: "flat", rolls: [value], result: value, chosenIndex: 0, forced: false };
      entry.d20s = [value]; entry.d20Choice = 0; entry.d20Mode = "flat"; entry.kept = value; entry.natural = value;
      return;
    }
    const bonus = String(key).match(/^bonus:(.+)$/);
    if (bonus) {
      const die = (entry.bonusDice || []).find((item) => item.id === bonus[1]);
      if (die) { die.rolls = [value]; die.result = value; die.chosenIndex = 0; mirrorNamedBonusDice(entry); }
      return;
    }
    const damage = String(key).match(/^damage:(\d+)$/);
    if (damage) {
      const die = (entry.damageDice || [])[Number(damage[1])];
      if (die) {
        die.result = value;
        entry.damageTotal = entry.damageDice.reduce((sum, item) => sum + item.result, 0) + ((entry.damage && entry.damage.bonus) || 0);
      }
      return;
    }
    const free = String(key).match(/^free:(\d+)$/);
    if (free) {
      const die = (entry.dice || [])[Number(free[1])];
      if (die) { die.rolls = [value]; die.result = value; die.chosenIndex = 0; }
    }
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
    const owned = dieScopes[target.scope];
    if (owned) { owned.mutate(prompt, patch, target); refreshTrayForState(); return; }
    if (target.scope === "base") {
      if (patch.advantageMode != null) cfg.d20Mode = patch.advantageMode;
      if (patch.forcedResult !== undefined) cfg.d20ForcedResult = forcedDieResult(patch.forcedResult, 20);
      if (patch.colour != null) cfg.d20Colour = patch.colour;
    } else if (target.scope.indexOf("staged") === 0) {
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
    if (target.scope === "base") { notify(t("notice.base-die-immovable"), "warn"); return; }
    // Un dé déjà tombé appartient à un jet résolu : il peut être remplacé, jamais retiré.
    if (target.scope === "landed") { notify(t("notice.landed-die-immovable"), "warn"); return; }
    const owned = dieScopes[target.scope];
    if (owned) owned.drop(prompt, target);
    else if (target.scope.indexOf("staged") === 0) {
      const staged = stagedList().find((die) => die.id === prompt.stagedId);
      recreditPoolDie(staged);
      /* Une ligne qui n'avait de sens que tant que ce dé attendait s'en va avec
         lui. En v1 le nom de l'étiquette était écrit en dur ici, dans le chemin
         commun ; il voyage désormais SUR le dé, posé par qui l'a stagé. */
      if (staged) dropEventsTagged(staged.tag);
      setStaged(stagedList().filter((die) => die.id !== prompt.stagedId));
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

  /* Sceller un dé, c'est déclarer CE QU'IL EST : un dé de Bardic, un dé de
     Tactical. La liste est fermée à ces deux-là (D.3) et un sceau inconnu est
     un refus nommé, pas un habillage silencieux. */
  function sealStagedDie(seal) {
    const target = findStagedDie(state.diePrompt);
    if (!target) return;
    if (SEALABLE_SOURCES.indexOf(String(seal)) < 0) {
      notify(t("notice.no-such-resource", { label: String(seal) }), "warn"); return;
    }
    /* Choisir une robe scellée habille le dé ENTIER (R6) : la teinte du sceau
       revient, donc la couleur manuelle est effacée. */
    mutateStagedDie({ sourceIcon: seal, label: sealLabel(seal), colour: "", correction: seal });
  }

  /* ══ Ouvrir / fermer une séance ════════════════════════════════════ */

  /* Le document appartient aux blocs `doc`/`build`. `play` reçoit ce dont il a
     besoin pour jouer et le rend quand la séance se ferme ; il ne va rien
     chercher tout seul, et il ne persiste rien. */
  function open(payload = {}) {
    const { character = null, vitals = null, history = null, poolResources = null, campaign = "", pseudo = "" } = payload;
    state.character = character;
    state.campaign = campaign;
    state.pseudo = pseudo;
    state.vitals = normalizeVitals(vitals);
    state.history = Array.isArray(history) ? history.slice(0, MAX_HISTORY) : [];
    state.events = [];
    state.poolResources = normalizePoolResources(poolResources);
    state.traySelection = [newFreeDie(20)];
    state.settled = {};
    /* Le MOMENT `session-open` : chaque couche sème SA tranche. Le chemin
       commun ne sait pas ce qu'elle sème, seulement quand. */
    sequence.run("session-open", payload);
    clearDiceTray(true);
    emitPool("open");
  }

  /* Ce que les couches déclarent posséder, demandé UNE fois. Le chemin commun
     n'en connaît ni les clefs ni le contenu : il les recopie. */
  function harvestLayers() {
    const contributions = Object.values(sequence.run("session-snapshot", {}).contributions);
    return contributions.length ? Object.assign({}, ...contributions) : {};
  }

  /* Ce que la séance rend au document : les ressources comptées et
     l'historique, plus ce que chaque couche déclare posséder. L'état de séance
     (transaction, main, sélection) ne voyage pas — règle de persistance n°4. */
  function snapshot() {
    prunePoolResources();
    return Object.assign({
      vitals: state.vitals,
      history: state.history.slice(0, MAX_HISTORY),
      poolResources: poolList()
    }, harvestLayers());
  }

  /* ══ Le branchement des couches ════════════════════════════════════ */

  const engine = {
    state, t, uuid, now, rollDie, clamp, emit: bus.emit,
    makeDiePlan, trayDiceForPlan, pendingTrayDice, chooseDiePlan, forcedDieResult, DIE_SEQUENCE,
    entryById, addHistory, recomputeEntry, refreshEntryTray, setTrayFromEntry, prepareTrayForConfig,
    rollOpen, openEntry, stagedList, setStaged, refreshOpenTray, openRollState, releaseRoll,
    settleEntry, clearDiceTray, announceEvents, recordEvent, pushEvent, dropEventsTagged,
    openDecision, closeDecision, notify, clearNotice, emitPool, entryTotal, outcomeFor,
    exhaustionLevel, exhaustionPenalty, exhaustionText, setExhaustion, setVitals, saveInfo,
    rollTransactionActive, warnRollLocked, showDieChoice, snapshotRollConfig,
    spendPoolResource, recreditPoolResource, poolResourceById
  };

  const layerVerbs = {};
  const layerDerive = {};
  const layerInternals = {};
  const dieScopes = {};
  const dieChoiceTargets = {};
  const giftSources = {};
  const configDefaultHooks = [];
  const configResetHooks = [];
  const configEntryHooks = [];
  const configTrayHooks = [];
  const configSettings = {};
  const claims = [];

  declarations.forEach((layer) => {
    if (typeof layer.bind !== "function") throw new Error('fhpc/play: layer "' + layer.name + '" has no bind()');
    const bound = layer.bind(engine);
    Object.assign(layerVerbs, bound.verbs || {});
    Object.assign(layerDerive, bound.derive || {});
    layerInternals[layer.name] = bound.internals || {};
    Object.assign(dieScopes, bound.dieScopes || {});
    Object.assign(dieChoiceTargets, bound.dieChoiceTargets || {});
    Object.assign(giftSources, bound.giftSources || {});
    Object.assign(configSettings, bound.configSettings || {});
    if (bound.configDefaults) { configDefaultHooks.push(bound.configDefaults); configResetHooks.push(bound.configDefaults); }
    if (bound.configFromEntry) configEntryHooks.push(bound.configFromEntry);
    if (bound.configTrayDice) configTrayHooks.push(bound.configTrayDice);
    (bound.rollClaims || []).forEach((claim) => claims.push(claim));
    sequence.mount({ name: layer.name, flags: layer.flags, register: bound.register || [] });
  });

  /* L'aiguillage de ROLL, par priorité déclarée. En v1 le verbe branchait
     lui-même sur deux mécaniques maison ; il ne connaît plus que des
     réclamations, et les siennes sont dans la même liste que les autres. */
  claims.push(
    { priority: 50, when: () => rollOpen(), run: rollStagedDice },
    { priority: 60, when: () => !!state.rollConfig, run: runConfiguredRoll },
    { priority: 100, when: () => true, run: () => rollTrayDice() }
  );
  claims.sort((a, b) => a.priority - b.priority);

  /* ── Les verbes : le seul point d'entrée du bloc ────────────────────
     Nommés depuis le vocabulaire `data-*` v1 (voir contracts/play.md pour la
     table de correspondance complète). Les verbes d'une couche entrent ICI, et
     seulement si elle est montée : sans elle, ils N'EXISTENT PAS. */
  const verbs = Object.assign({
    open: (p) => open(p || {}),
    snapshot: () => snapshot(),

    // le jet
    prepare: (p) => { clearDiceTray(false); state.rollConfig = rollInput(p.name, p.ability, p.bonus, p); prepareTrayForConfig(state.rollConfig); clearNotice(); },
    /* ⚠️ Exigence A : `configure` n'accepte plus un patch quelconque. Chaque
       réglage est lu par la liste FERMÉE du type courant, et une clef inconnue
       jette en nommant ce que ce type accepte. */
    configure: (p) => {
      if (!state.rollConfig) return;
      const type = rollTypeFor(state.rollConfig.rollType);
      const closed = Object.assign({}, type.settings, configSettings);
      applySettings({ settings: closed, label: type.label }, state.rollConfig, p || {});
    },
    roll: () => {
      const claim = claims.find((item) => item.when());
      return claim ? claim.run() : undefined;
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

    // D.1 — les trois verbes de dé, et leurs trois fenêtres
    addDie: (p) => addDie(p.source, p),
    rerollDie: (p) => rerollDie(p || {}),
    mountDie: (p) => mountDie(p || {}),

    // D.5 — le don, aux deux bouts, sans le transport
    giveDie: (p) => giveDie(p || {}),
    receiveDie: (p) => receiveDie(p),

    // les décisions
    resolveDieChoice: (p) => resolveDieChoice(p.index),

    // la réserve comptée
    spendPoolResource: (p) => spendPoolResource(p.id),
    setPoolResources: (p) => { state.poolResources = normalizePoolResources(p.resources); emitPool("pool-set"); },

    // les vitaux
    setVitals: (p) => setVitals(p.patch, p.message),
    setExhaustion: (p) => setExhaustion(p.level, p.reason, p.silent)
  }, layerVerbs);

  /* Les DÉRIVATIONS : lecture seule sur une entrée, pour les surfaces. Aucune
     ne touche l'état — c'est ce qui garantit qu'une surface ne peut pas
     recalculer un badge pour son compte. */
  const derive = Object.assign({
    badges: rollBadges, ruling: rollRuling, vocabulary: rollVocabulary, verdict: rollVerdict,
    outcome: outcomeFor, total: entryTotal, parts: rollParts, trayDice: trayDiceFromEntry,
    export: (entry) => rollExport(entry, { campaign: state.campaign, character: (state.character && state.character.name) || state.pseudo }),
    intent: intentFor,
    verdictText: rollVerdictText, detailText: rollDetailText,
    sealLabel, source: rollSource, label: t,
    poolTitle, visiblePoolResources,
    flags: () => sequence.flags(), rules: () => Object.assign({}, rules)
  }, layerDerive);

  /* Les ROUAGES. Exposés délibérément : les suites portées les tiennent
     directement (comme la v1 les tenait par son hook `__fhRollMachine`).
     Ce n'est pas la surface publique du bloc : celle-là, c'est `verbs`. */
  const engineHandles = Object.assign({}, engine, {
    rollTransactionActive, rollOpen, openEntry, stagedList, stagedBonusCount, entryById,
    normalizeVitals, normalizePoolResources, normalizePoolResource,
    exhaustionLevel, exhaustionPenalty, exhaustionText, setExhaustion, setVitals,
    announceEvents, recordEvent, pushEvent, dropEventsTagged, openDecision, closeDecision, runQueueDone,
    rollInput, ensureConfigBonusDice, snapshotRollConfig, configFromEntry, syncPresetFlags,
    runConfiguredRoll, rollSequenceRemaining, resolveDieChoice,
    applyHistoryAdjustment, applyHistoryAdjustmentRemaining, completeHistoryAdjustment,
    finishRolledEntry, quickRoll, openRollState, settleEntry, releaseRoll, repeatOpenRoll, rollStagedDice,
    stageBonusDie, unstageDie, addDie, rerollDie, mountDie, giveDie, receiveDie,
    addTrayDie, removeTrayDie, dropTrayDie, rollTrayDice, clearDiceTray,
    setTrayFromEntry, prepareTrayForConfig, refreshOpenTray, refreshEntryTray, refreshTrayForState,
    findStagedDie, landedDiePart, writeLandedDie, retuneLandedDie, mutateStagedDie, dropStagedDie, sealStagedDie,
    poolList, poolResourceById, spendPoolResource, recreditPoolDie, prunePoolResources,
    recomputeEntry, addHistory, entryTotal, outcomeFor, rollDie, saveInfo, runDamagePhase,
    BLOCKING_PHASES, MAX_EXHAUSTION, MAX_BONUS_DICE, MAX_FREE_DICE, MAX_HISTORY,
    ROLL_SOURCES, ROLL_VERDICTS, ROLL_BADGE_RULES, SEALABLE_SOURCES, CORRECTION_DICE,
    ROLL_TYPE_IDS, rollHasDc: rollHasThreshold, rollHasThreshold, rollThreshold,
    sequence, layers: layerInternals
  });

  return { name: "play", state, verbs, derive, engine: engineHandles, flags: sequence.flags() };
}
