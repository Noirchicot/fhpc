/* ══ LA COUCHE FATE'S HAND — un module moteur activé par ses drapeaux ═══
   Loi §0.12 : « LE SRD EST LA BASE, FH EST UNE COUCHE PAR-DESSUS. »

   Tout ce que ce fichier porte vivait, avant le lot 5, tissé dans
   `src/play/session.mjs` : 384 lignes sur 2 556 citant une mécanique maison,
   sans un seul interrupteur. La commande du lot 3 était fautive, pas son
   travail : elle disait « porter » sans exiger la séparation.

   PORTÉ, PAS RÉÉCRIT. Les fonctions gardent leurs noms v1 pour que le diff
   reste auditable, y compris quand un nom français aurait mieux dit la chose.
   Ce qui a changé, c'est QUI les appelle : le chemin commun ne les nomme plus
   jamais. Il invoque un MOMENT, et ce module s'y est inscrit.

   TROIS PROPRIÉTÉS QU'UN TEST PEUT VÉRIFIER, ET QUI SONT LE LOT :
   1. Sans ce module, `verbs.spendDestiny` n'existe pas — pas « ne fait rien » :
      n'existe pas (loi §0.6, pas de code mort derrière un interrupteur).
   2. Sans ce module, `state.destiny` n'est pas semé et rien ne le lit.
   3. Aucun fichier de `src/play/` ne contient les mots Destiny, Chaos,
      Overreach, Arcane ou Awakening — c'est tenu par un garde structurel
      (`tests/play-srd-only.test.mjs`).

   CE QUI N'EST PAS ENTRÉ ICI, ET C'EST VOULU : le paquet des 78 cartes
   d'Arcane et les tables de Chaos. Ce sont du CONTENU (l'IP d'Eric), pas du
   moteur — ils arrivent par injection ou par le document (KICKOFF §0.8). */

import { createChaos } from "./chaos.mjs";
import { FH_EN } from "./labels.mjs";
import {
  FH_SOURCES, FH_VERDICTS, FH_BADGES,
  fhTotal, fhParts, fhRulingTail, fhBaseValue,
  fhTrayDice, fhDecorateBase, fhTrayDiceForKind, fhSignature
} from "./lexicon.mjs";
import { SRD_VERDICTS } from "../../play/lexicon.mjs";

/* Les deux chaînes face-machine que les entrées de sauvegarde portent en dur
   depuis la v1. Elles sont LUES ICI, pas recopiées : une seule table de
   verdicts, un seul mot sur le fil (invariant 7 du contrat `play`). */
const OUTCOME_SUCCESS = SRD_VERDICTS.find((rule) => rule.id === "success").outcome;
const OUTCOME_FAILURE = SRD_VERDICTS.find((rule) => rule.id === "failure").outcome;

const MAX_PENDING = 4;
const MAX_PINNED = 6;

export function createFhLayer({ chaosTables = null } = {}) {
  return {
    name: "fh",

    /* Les drapeaux que la couche LÈVE. Le chemin commun ne les lit jamais pour
       décider quoi faire — ils disent au document quelles capacités ont servi
       (`fh-char/1`, `$defs/flag`). */
    flags: ["fh.arcana", "fh.chaos", "fh.destiny", "fh.exhaustion", "fh.overreach"],

    labels: FH_EN,
    sources: FH_SOURCES,
    verdicts: FH_VERDICTS,
    badges: FH_BADGES,
    total: fhTotal,
    parts: fhParts,
    rulingTail: fhRulingTail,
    baseValue: fhBaseValue,
    trayDice: fhTrayDice,
    decorateBase: fhDecorateBase,
    trayDiceForKind: fhTrayDiceForKind,
    signature: fhSignature,

    /* Les clefs que la couche écrit sur une entrée. Quand une séquence
       d'ajustement travaille sur une COPIE de l'entrée, le chemin commun doit
       recopier ce que la couche y a mis — sans savoir ce que c'est. */
    entryKeys: ["destiny", "natChoice", "transformed", "originalKept", "destinyPointChange", "awakening", "chaosRoll", "chaosTotal", "chaosRow", "plusTwo"],

    /* ⚠️ VALEUR DE RÈGLE SURCHARGÉE, et c'en est la seule.
       Le SRD 5.2.1 (`srd:glossary:en:exhaustion`, p.181) dit : « When you make
       a D20 Test, the roll is reduced by 2 times your Exhaustion level. »
       Fate's Hand joue la CONDITION du SRD avec un chiffre maison : −1 par
       niveau (le commentaire du moteur v1 disait déjà « Épuisement maison »).
       La condition reste donc SRD — six niveaux, la mort au sixième — et seul
       le multiplicateur descend de la couche. */
    rules: { exhaustionPerLevel: 1 },

    bind(engine) { return bindFh(engine, { chaosTables }); }
  };
}

/* ══════════════════════════════════════════════════════════════════════
   Le corps de la couche. `engine` est la poignée que `play` lui tend : les
   rouages du moteur, et rien du document.
   ══════════════════════════════════════════════════════════════════════ */
function bindFh(engine, { chaosTables }) {
  const {
    state, t, uuid, now, rollDie, clamp,
    makeDiePlan, trayDiceForPlan, pendingTrayDice, chooseDiePlan, DIE_SEQUENCE,
    entryById, addHistory, recomputeEntry, refreshEntryTray, setTrayFromEntry, prepareTrayForConfig,
    rollOpen, openEntry, stagedList, setStaged, openRollState, clearDiceTray,
    announceEvents, recordEvent, pushEvent, dropEventsTagged, closeDecision,
    notify, emitPool, emit, entryTotal, outcomeFor,
    exhaustionLevel, setExhaustion, exhaustionText, saveInfo,
    rollTransactionActive, warnRollLocked, showDieChoice, snapshotRollConfig
  } = engine;

  const chaos = createChaos(chaosTables, t);
  const { chaosRowText, chaosVerdict } = chaos;

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
    if (changed) pushEvent(t(direction > 0 ? "fh.event.die-gained" : "fh.event.die-lost", { sides }), direction > 0 ? "die-gain" : "die-loss");
    state.destiny.lastChange = { reason: t("fh.reason.manual-pool", { sides }), at: now() };
    emitPool("destiny-dice");
  }

  /* ══ LE SCORE PLAFONNE LA RÉCUPÉRATION, ET RIEN D'AUTRE ════════════
     Règle d'Eric, tranchée le 2026-08-08 (logbook « FHV2 - Couche FH »,
     chapitre 3), et §2 des règles : « Cap & overflow: long rest and most
     recovery cannot exceed your Score. The exceptions — Arcana cards and
     Natural 1s — grant temporary points that may push you above your Score. »

     ⭐ LA PHRASE QUI RÈGLE L'IMPLÉMENTATION, mot pour mot : « tant que je ne
     suis pas au-dessus de mon score, les temporaires se comportent comme des
     récupérations ». Il n'y a donc RIEN À DISTINGUER SOUS LE PLAFOND — et le
     moteur ne tient PAS deux compteurs. Un seul total ; le Score borne
     seulement CE QUI RENTRE PAR RÉCUPÉRATION. Ce qui dépasse reste jusqu'à ce
     qu'on le dépense, et c'est exactement ce que dit `max(score, before)` :
     une récupération ne franchit pas le Score, et elle ne fait pas non plus
     redescendre quelqu'un qui est déjà au-dessus.

     Une BAISSE n'a pas de nature : dépenser n'est jamais plafonné.

     ⚠️ Écart mesuré le 2026-08-08 en confrontant le chapitre au code :
     `state.destiny.score` existait, un Arcane majeur le montait, et
     `setDestinyPoints` NE LE CONSULTAIT JAMAIS. La règle du plafond n'était
     appliquée nulle part. */
  const GAIN_RECOVERED = "recovered";   // repos long, et tout ce que la règle appelle « recovery »
  const GAIN_TEMPORARY = "temporary";   // pioche d'Arcane, 1 naturel, le +1 de l'« Accept » (§3.4)
  /* Une valeur POSÉE À LA MAIN par le joueur ou le MJ. Elle n'est ni une
     récupération ni un point temporaire : c'est une correction, et la borner
     empêcherait de rattraper un état de séance. ⚠️ Non couvert par les règles
     d'Eric — question ouverte, `QUESTIONS-ARCHITECTE.md`, lot 16. */
  const GAIN_DECLARED = "declared";
  const GAIN_KINDS = [GAIN_RECOVERED, GAIN_TEMPORARY, GAIN_DECLARED];

  /* Le plancher §2 : « Long rest: regain +1 Destiny Point ». C'est le seul
     nombre que la règle écrite chiffre. Ce qu'une espèce (Humain : 2/jour) ou
     un Arcane (l'Impératrice) y ajoute est du CONTENU de couche, et il arrive
     par le paramètre — le moteur ne le devine pas. */
  const LONG_REST_RECOVERY = 1;

  function ceilingForGain(next, before, gain) {
    if (gain === GAIN_RECOVERED) return Math.min(next, Math.max(Number(state.destiny.score) || 0, before));
    if (gain === GAIN_TEMPORARY || gain === GAIN_DECLARED) return next;
    throw new Error(
      "fhpc/fh: a rise in Destiny Points must declare where it comes from — got " + JSON.stringify(gain) +
      " instead of one of " + GAIN_KINDS.join(", ") +
      "; the Score caps recovery and nothing else, and a rise the engine cannot classify would pick a side in silence"
    );
  }

  function setDestinyPoints(next, reason, recover, silent, gain) {
    const before = Number(state.destiny.points) || 0;
    next = Math.max(-99, Math.min(999, Number(next) || 0));
    // Seule une HAUSSE se réclame d'une source, et seule une récupération est bornée.
    if (next > before) next = ceilingForGain(next, before, gain);
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
      pushEvent(t("fh.event.points-moved", { change: next - before }), next > before ? "gain" : "loss");
    }
    if (!silent && recovered) pushEvent(t("fh.event.die-gained", { sides: recovered.sides }), "die-gain");
    state.destiny.lastChange = { before, after: next, reason: reason || t("fh.reason.correction"), recovered: recovered && recovered.id, at: now() };
    emitPool("destiny-points");
    return recovered;
  }

  function updateDestinyField(field, value, reason) {
    if (field === "score") state.destiny.score = clamp(value, 0, 99);
    else setDestinyPoints(value, reason || t("fh.reason.manual-correction"), true, false, GAIN_DECLARED);
    emitPool("destiny-field");
  }

  /* LA RÉCUPÉRATION — le seul chemin que le Score borne, et il n'existait pas.
     Sans lui, la borne serait du code mort derrière une intention (loi §0.6) :
     les trois hausses que le moteur portait sont toutes des TEMPORAIRES.

     `amount` est ce que la table accorde ; le défaut est le +1 de §2. Un
     nombre illégal JETTE plutôt que de retomber sur 1 — un repos silencieux
     qui rend le mauvais nombre de points est pire qu'un refus bruyant. */
  function recoverDestinyPoints(amount, reason) {
    const asked = amount == null ? LONG_REST_RECOVERY : Number(amount);
    if (!isFinite(asked) || asked < 0 || Math.round(asked) !== asked) {
      throw new Error(
        "fhpc/fh: a Destiny recovery must declare a whole, non-negative number of Points — got " + JSON.stringify(amount)
      );
    }
    const before = Number(state.destiny.points) || 0;
    const recovered = setDestinyPoints(before + asked, reason || t("fh.reason.recovery"), true, true, GAIN_RECOVERED);
    const after = Number(state.destiny.points) || 0;
    if (after > before) {
      pushEvent(
        [t("fh.event.points-moved", { change: after - before }), t("fh.event.points-current", { points: after })].join(" · "),
        "gain"
      );
    }
    /* Le plafond qui mord est un REFUS, et un refus se dit. Sans cette ligne,
       un repos long qui ne rend rien serait indiscernable d'un repos oublié. */
    if (after < before + asked) {
      pushEvent(t("fh.event.recovery-capped", { score: state.destiny.score, points: after, lost: before + asked - after }), "info");
    }
    if (recovered) pushEvent(t("fh.event.die-gained", { sides: recovered.sides }), "die-gain");
    emitPool("destiny-recovery");
    return after;
  }

  /* ══ LA VIBRATION ══════════════════════════════════════════════════
     `The Major Arcana.md` : « Vibration — an optional temporary effect on a
     critical Destiny roll, equivalent to a spell (spell level matches the die
     size) », avec sa table : d4 → 1, d6 → 2, d8 → 3, d10 → 4, d12 → 5.

     ⚠️ CE N'EST PAS L'ÉVEIL, et les confondre est l'erreur qui a été faite le
     2026-08-08 puis retirée :

       · Éveil arcanique — Points à 0 APRÈS UN 20 NATUREL AU D20 → pioche dans
         les 78 cartes. C'est `onResult`, et il a raison de ne rien déclencher
         sur un critique arcanique.
       · Vibration — un CRITIQUE ARCANIQUE (le maximum d'un dé de Destinée) →
         l'effet de sort listé sur l'Arcane du personnage, au niveau du dé.

     ⚠️ LE MOTEUR NE CONNAÎT AUCUN TEXTE DE CARTE (décision Q4 : les couches
     portent le contenu, le moteur porte la mécanique). Il déclenche et il
     calcule le NIVEAU — rien d'autre. Il n'a pas non plus à désigner la carte :
     un seul Arcane majeur est actif à la fois (§5), donc l'effet est celui du
     personnage, et c'est la surface qui va le lire là où il vit déjà.

     Cette mécanique avait été PERDUE AU PORTAGE : zéro occurrence dans `src/`,
     alors que le dock v1 la portait pour les 22 cartes. */
  const VIBRATION_LEVEL_BY_SIDES = { 4: 1, 6: 2, 8: 3, 10: 4, 12: 5 };

  /* « an effect listed on YOUR Arcana » : sans Arcane connu, il n'y a aucun
     effet listé, donc rien à signaler. Ce n'est pas un repli silencieux, c'est
     la condition d'existence de la règle — et le critique arcanique, lui, a
     bien lieu dans les deux cas. */
  function arcanaKnown() {
    const build = state.character && state.character.destinyBuild;
    return !!(build && build.arcana);
  }

  function vibrationFor(sides) {
    if (!arcanaKnown()) return null;
    const level = VIBRATION_LEVEL_BY_SIDES[Number(sides)];
    if (!level) {
      throw new Error(
        "fhpc/fh: no Vibration spell level is written for a d" + sides +
        " — the table runs d4→1 … d12→5, and choosing a level for a die the rules never sized would be inventing a rule"
      );
    }
    return { sides: Number(sides), level };
  }

  /* ══ Dépenser un dé de Destinée ════════════════════════════════════ */

  function spendDestinyDie(dieId, silent, rolled) {
    const die = state.destiny.dice.find((item) => item.id === dieId && item.available);
    if (!die) return null;
    const plan = rolled || makeDiePlan(die.sides, "flat", null);
    const result = Number(plan.result);
    /* ⚠️ LA VIBRATION SE CALCULE AVANT QUE LE DÉ SOIT CONSOMMÉ, et c'est un
       correctif, pas un goût (RELECTEUR Adverserial, 2026-08-08). `vibrationFor`
       JETTE sur un dé que la table ne dimensionne pas (d20), et
       `die.available = false` était posé plus haut : le refus partait en ayant
       déjà mangé le dé, sans retirer de point ni annoncer quoi que ce soit. La
       doctrine de ce lot est écrite deux fois dans sa propre suite — « l'arbre
       est restauré : le refus n'a rien bougé » —, et elle vaut ici aussi. Le
       jet, lui, a bien eu lieu : c'est ce que le dé a fait qui décide du refus. */
    const vibration = result === die.sides ? vibrationFor(die.sides) : null;
    die.available = false;
    const before = Number(state.destiny.points) || 0;
    let cost, criticalSuccess = false, criticalFailure = false, chaosRisk = null, recovered = null;
    if (result === die.sides) {
      cost = 1; criticalSuccess = true;
      recovered = setDestinyPoints(before - 1, t("fh.reason.arcane-critical-success", { sides: die.sides }), true, !!silent);
    } else if (result === 1) {
      cost = -1; criticalFailure = true;
      /* Le +1 de l'« Accept » (§3.4) est TEMPORAIRE — tranché par Eric le
         2026-08-08. Il est accordé à l'instant où le 1 tombe ; refuser le
         reprend. Il peut donc dépasser le Score. */
      recovered = setDestinyPoints(before + 1, t("fh.reason.arcane-critical-failure", { sides: die.sides }), true, !!silent, GAIN_TEMPORARY);
    } else {
      cost = result;
      recovered = setDestinyPoints(before - result, t("fh.reason.destiny-die", { sides: die.sides }), true, !!silent);
      const over = Number(state.destiny.overreach) || 0;
      if (over > 0) chaosRisk = { overreach: over, dc: 10 + over };
    }
    if (!silent && criticalSuccess) pushEvent(t("fh.event.arcane-critical", { sides: die.sides, result }), "arcane-critical-success");
    else if (!silent && criticalFailure) pushEvent(t("fh.event.arcane-fumble", { sides: die.sides }), "arcane-critical-failure");
    return {
      dieId: die.id, sides: die.sides, result, rolls: (plan.rolls || [result]).slice(),
      chosenIndex: plan.chosenIndex == null ? 0 : plan.chosenIndex,
      advantageMode: plan.mode === "advantage" || plan.mode === "disadvantage" || plan.mode === "choice" ? plan.mode : "flat",
      forced: !!plan.forced, cost,
      pointsBefore: before, pointsAfter: state.destiny.points,
      criticalSuccess, criticalFailure, vibration, chaos: chaosRisk, recovered
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

  /* Un dé de Destinée posé dans le plateau garde ce que son propre menu lui a
     donné. L'A/D est l'exception : choisir après coup demande un résolveur que
     ce chemin n'a pas, donc son menu ne l'offre jamais et une valeur égarée
     retombe à plat. */
  function destinyPlanFor(item) {
    const mode = item && item.advantageMode;
    const safe = mode === "advantage" || mode === "disadvantage" ? mode : "flat";
    return makeDiePlan(item.sides, safe, item && item.forcedResult);
  }

  function destinyEventSpecs(spent, entryId) {
    if (!spent) return [];
    const change = spent.pointsAfter - spent.pointsBefore;
    const events = [], parts = [];
    const rollEntry = (state.rollSequence && state.rollSequence.entry) || state.history.find((entry) => entry.id === entryId);
    const offered = !!arcaneDecision(spent, entryId);
    if (spent.criticalSuccess) parts.push(t("fh.CRITINF"), t("fh.event.destiny-rolled", { sides: spent.sides, result: spent.result }));
    else if (spent.criticalFailure) parts.push(t("fh.FUMBLEINF"), t("fh.event.destiny-rolled", { sides: spent.sides, result: 1 }));
    else parts.push(t("fh.event.destiny-rolled", { sides: spent.sides, result: spent.result }));
    /* La Vibration est OPTIONNELLE : la ligne l'OFFRE, elle ne l'applique pas.
       Le niveau est tout ce que le moteur en sait ; l'effet est celui que porte
       l'Arcane du personnage, et aucun mot de carte ne passe par ici. */
    if (spent.vibration) parts.push(t("fh.event.vibration", { sides: spent.vibration.sides, level: spent.vibration.level }));
    /* Un échec encore en attente de sa réponse annonce le jet et rien d'autre :
       les points qu'il a bougés peuvent être défaits, et une ligne ne doit pas
       affirmer ce qui peut être défait. */
    if (!offered) {
      if (change) parts.push(t("fh.event.points-moved", { change }), t("fh.event.points-current", { points: spent.pointsAfter }));
      if (spent.recovered) parts.push(t("fh.event.die-gained", { sides: spent.recovered.sides }));
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
      events.push({ text: t("fh.event.chaos-risk", { overreach: spent.chaos.overreach, ability: saveAbility, dc: spent.chaos.dc }), kind: "chaos", entryId });
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
      const accepted = [t("fh.event.arcane-fate-accepted"), t("fh.event.gained-one-point"), t("fh.event.points-current", { points: state.destiny.points })];
      if (spent.recovered) accepted.push(t("fh.event.die-gained", { sides: spent.recovered.sides }));
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
      setDestinyPoints(0, t("fh.reason.fate-refused"), false, true);
      /* Le Ruling et le badge de dépense lisent tous deux `pointsAfter` sur ce
         relevé ; refuser vide la réserve, donc le relevé doit le dire ou toute
         surface citera éternellement le solde d'avant le refus. */
      spent.pointsAfter = state.destiny.points;
      addPendingFate({ kind: "chaos", entryId: entry.id, ability: entry.ability || "", name: entry.name || t("fh.reason.arcane-failure-refused") });
      events.push(
        { text: t("fh.event.arcane-fate-refused", { sides: spent.sides, hadPoints }), kind: "arcane-critical-success", entryId: entry.id },
        { text: t("fh.event.chaos-pending"), kind: "chaos", entryId: entry.id }
      );
    }
    recomputeEntry(entry);
    const done = closeDecision();
    if (state.history.indexOf(entry) >= 0) refreshEntryTray(entry);
    announceEvents(events, done);
  }

  /* Le MOMENT `result` : le d20 est tombé, son naturel est connu, rien n'est
     encore annoncé. C'est ici que Fate's Hand lit ce que le dé a fait — le
     chemin commun, lui, ne sait pas qu'un 20 coûte un point. */
  function onResult({ entry }) {
    if (entry.natural === 1) {
      /* Un 1 naturel POSE UNE QUESTION, et la question tient le jet. Le SRD
         n'a rien à dire d'un 1 hors attaque : sans cette couche, il tombe et
         c'est tout. */
      entry.natChoice = null;
      return { decision: { type: "nat1", entryId: entry.id } };
    }
    if (entry.natural !== 20) return null;
    const before = state.destiny.points;
    const recovered = setDestinyPoints(before - 1, t("fh.crit20"), true, true);
    entry.destinyPointChange = { before, after: state.destiny.points, reason: t("fh.crit20") };
    entry.awakening = state.destiny.points === 0;
    // Le tirage est dû à partir de cet instant et jusqu'à ce que la carte soit donnée.
    if (entry.awakening) state.destiny.awakeningOwed = (Number(state.destiny.awakeningOwed) || 0) + 1;
    const parts = [
      entry.awakening ? t("fh.event.awakening-roll") : t("fh.event.crit20-roll"),
      t("fh.event.points-moved", { change: -1 }),
      t("fh.event.points-current", { points: state.destiny.points })
    ];
    if (recovered) parts.push(t("fh.event.die-gained", { sides: recovered.sides }));
    return { events: [{ text: parts.join(" · "), kind: entry.awakening ? "awakening" : "nat20", entryId: entry.id }] };
  }

  /* ── §C — L'ÉVEIL ARCANIQUE, RÉÉCRIT ────────────────────────────────
     `keepArcana()` v1 appliquait `score+1` / `points+10` INCONDITIONNELLEMENT.
     Ce n'était juste que parce que le paquet v1 ne contenait que les 22
     Arcanes majeurs. Porté avec les 78 cartes, TOUT MINEUR AURAIT DONNÉ +1 AU
     SCORE — un bug garanti, trouvé par l'expert Fate's Hand le 2026-08-08.

     La correction n'est pas un `if` de plus : c'est que LA PARTIE CHIFFRÉE
     N'EXISTE PAS TANT QUE LA CARTE N'EST PAS CONNUE. Elle est fonction de la
     carte. Un seul chemin — la pioche règle ET applique — pas deux moitiés.

     La carte DOIT donc déclarer ce qu'elle donne. Une carte muette jette (loi
     §0.5) : `+10` n'était pas une règle, c'était une constante de paquet, et
     la redevenir par défaut serait exactement le repli silencieux qui a créé
     le bug.

     ⚠️ Le `+1` au Score maximum est un ACQUIS PERMANENT SANS SOURCE DE RÈGLE :
     écrit seulement dans `resolved`, la prochaine dérivation l'efface
     (invariant 1 de `fh-char/1`). L'historique des Éveils doit vivre en
     `build.choices` scalaires — donc ce verbe ÉMET le choix à enregistrer, il
     ne l'écrit pas lui-même : le document n'appartient pas à `play`. */
  function settleAwakening(card) {
    if (!state.destiny) return null;
    if (!card || typeof card !== "object") {
      throw new Error("fhpc/fh: settleAwakening needs the card that was drawn — the numbers are a function of the card");
    }
    if (card.arcana !== "major" && card.arcana !== "minor") {
      throw new Error(
        'fhpc/fh: the drawn card must declare arcana "major" or "minor" (got ' + JSON.stringify(card.arcana) +
        ") — only a major raises the Destiny Score, and assuming major is the v1 bug this check exists to stop"
      );
    }
    if (!isFinite(Number(card.points))) {
      throw new Error('fhpc/fh: the drawn card must declare how many temporary Points it grants — "+10" was a deck constant, not a rule');
    }
    const grantedPoints = Math.round(Number(card.points));
    const before = state.destiny.score;
    // Seul un majeur monte le Score maximum. Un mineur donne des points et une Brique.
    if (card.arcana === "major") state.destiny.score = clamp(before + 1, 0, 99);
    /* §2 : une carte d'Arcane donne des points TEMPORAIRES, qui « may push you
       above your Score ». C'est l'une des deux exceptions nommées au plafond. */
    setDestinyPoints((Number(state.destiny.points) || 0) + grantedPoints, t("fh.reason.awakening"), true, true, GAIN_TEMPORARY);
    state.destiny.awakeningOwed = Math.max(0, (Number(state.destiny.awakeningOwed) || 0) - 1);
    const named = [card.numeral, card.name].filter(Boolean).join(" · ");
    state.trayPrompt = null;
    /* Le choix scalaire que `build` doit enregistrer pour que le +1 survive à
       la prochaine dérivation. `play` l'annonce ; il n'écrit pas le document. */
    emit("awakening-settled", {
      card: { id: card.id || null, name: card.name || null, numeral: card.numeral || null, arcana: card.arcana },
      granted: { score: card.arcana === "major" ? 1 : 0, points: grantedPoints, brick: !!card.brick },
      choice: { path: "fh.awakenings[" + (Number(state.destiny.awakeningsSettled) || 0) + "]", value: card.id || named || card.arcana },
      owed: state.destiny.awakeningOwed
    });
    state.destiny.awakeningsSettled = (Number(state.destiny.awakeningsSettled) || 0) + 1;
    announceEvents([{
      text: t("fh.event.awakening-settled", {
        card: named, scoreChanged: card.arcana === "major", score: state.destiny.score,
        points: grantedPoints, brick: !!card.brick
      }),
      kind: "awakening"
    }], "");
    return state.destiny.awakeningOwed;
  }

  /* ══ Le dé de Destinée dans la main ════════════════════════════════ */

  /* La réserve de Destinée se comporte comme le sélecteur blanc : cliquer un
     dé d'or ne le dépense jamais et ne pose aucune question. ROLL est la seule
     chose qui dépense de la Destinée, et c'est ce qui rend l'annulation
     gratuite. */
  function announceStagedDestiny(die) {
    dropEventsTagged("staged-destiny");
    recordEvent({ text: t("fh.event.staged-destiny", { sides: die.sides }), kind: "destiny", tag: "staged-destiny" });
  }

  function stageDestinyDie(dieId) {
    const entry = openEntry();
    if (!rollOpen() || !entry || entry.destiny) return;
    if (stagedList().some((item) => item.kind === "destiny")) return;
    const die = state.destiny.dice.find((item) => item.id === dieId && item.available);
    if (!die) return;
    setStaged(stagedList().concat([{
      id: uuid(), kind: "destiny", destinyDieId: die.id, label: t("fh.tray.destiny"), sides: die.sides,
      advantageMode: "flat", forcedResult: null,
      /* L'étiquette de la ligne « ce dé attend dans le plateau » voyage SUR le
         dé : le retirer emporte sa ligne, sans que le chemin commun ait à
         connaître le nom de l'étiquette. */
      tag: "staged-destiny"
    }]));
    engine.refreshOpenTray(entry);
  }

  function stageDestinyFromPool(dieId) {
    const die = state.destiny.dice.find((item) => item.id === dieId && item.available);
    if (!die) { notify(t("fh.notice.die-unavailable"), "warn"); return; }
    if (rollOpen()) {
      const entry = openEntry();
      if (!entry || entry.destiny || stagedList().some((item) => item.kind === "destiny")) {
        notify(t("fh.notice.already-carries"), "warn"); return;
      }
      stageDestinyDie(dieId); announceStagedDestiny(die); return;
    }
    const cfg = state.rollConfig;
    if (cfg) {
      const edited = cfg.editingId && state.history.find((item) => item.id === cfg.editingId);
      if (edited && edited.destiny) { notify(t("fh.notice.already-carries"), "warn"); return; }
      cfg.destinyDieId = die.id; cfg.destinyConfirmed = true; cfg.destinyForcedResult = null;
      prepareTrayForConfig(cfg); announceStagedDestiny(die); return;
    }
    state.destinyStaged = { dieId: die.id, sides: die.sides, advantageMode: "flat", forcedResult: null };
    announceStagedDestiny(die);
  }

  /* Le MOMENT `reopen` : des dés stagés rejoignent un jet déjà réglé. Si l'un
     d'eux est un dé de Destinée, c'est ici qu'il est DÉPENSÉ. */
  function onReopen({ entry, staged }) {
    const item = staged.find((die) => die.kind === "destiny");
    if (!item || entry.destiny) return null;
    const spent = spendDestinyDie(item.destinyDieId, true, destinyPlanFor(item));
    if (!spent) return null;
    entry.destiny = spent;
    dropEventsTagged("staged-destiny");
    return {
      events: destinyEventSpecs(spent, entry.id),
      decision: arcaneDecision(spent, entry.id),
      // Un 1 ou le maximum sur un dé de Destinée règle le jet sur place.
      settled: !!(spent.criticalSuccess || spent.criticalFailure)
    };
  }

  /* Le MOMENT `pre-roll` : ce qui se lance AVANT le d20. En v1, `runConfiguredRoll`
     branchait lui-même sur `cfg.destinyDieId` — le chemin commun décidait, donc
     il connaissait la Destinée. Il ne la connaît plus : il demande, et la
     couche RÉCLAME la séquence quand elle a un dé à lancer d'abord. */
  function onPreRoll({ cfg, entry, sequence, adjustment }) {
    if (!cfg.destinyDieId) return null;
    // Un jet déjà ajusté qui PORTE DÉJÀ un dé de Destinée n'en relance pas un second.
    if (adjustment && entry && entry.destiny) return null;
    sequence.phase = "destiny";
    sequence.adjustment = !!adjustment;
    rollSequenceDestiny();
    return { claimed: true };
  }

  function rollSequenceDestiny() {
    const sequence = state.rollSequence;
    if (!sequence || !sequence.cfg) return;
    const cfg = sequence.cfg;
    const die = state.destiny.dice.find((item) => item.id === cfg.destinyDieId && item.available);
    if (!die) { pushEvent(t("fh.notice.die-unavailable"), "error"); state.rollSequence = null; return; }
    if (!sequence.destinyPlan) sequence.destinyPlan = makeDiePlan(die.sides, cfg.destinyMode, cfg.destinyForcedResult);
    prepareTrayForConfig(cfg);
    state.trayResults = state.trayResults.filter((item) => item.destinyDieId !== die.id);
    trayDiceForPlan(sequence.destinyPlan, t("fh.tray.destiny"), { flash: true, destinyDieId: die.id, dieRole: "destiny" })
      .forEach((item) => state.trayResults.push(item));
    state.trayResultText = sequence.destinyPlan.result == null ? t("fh.tray.destiny-choose") : t("fh.tray.destiny-chosen");
    if (sequence.destinyPlan.result == null) { showDieChoice("destiny", 0, sequence.destinyPlan, t("fh.tray.destiny") + " d" + die.sides); return; }
    const spent = spendDestinyDie(cfg.destinyDieId, true, sequence.destinyPlan);
    if (!spent) { pushEvent(t("fh.notice.die-unavailable"), "error"); state.rollSequence = null; return; }
    sequence.entry.destiny = spent;
    sequence.phase = "destiny-events";
    prepareTrayForConfig(sequence.cfg);
    state.trayResults = state.trayResults.filter((item) => item.destinyDieId !== spent.dieId);
    trayDiceForPlan(spent, t("fh.tray.destiny"), {
      destinyDieId: spent.dieId, dieRole: "destiny",
      special: spent.criticalSuccess ? "arcane-critical-success" : spent.criticalFailure ? "arcane-critical-failure" : ""
    }).forEach((item) => state.trayResults.push(item));
    state.trayResultText = t("fh.tray.destiny-result", { sides: spent.sides, result: spent.result });
    announceEvents(
      destinyEventSpecs(spent, sequence.entry.id),
      sequence.adjustment ? "adjustment-remaining" : "roll-remaining",
      arcaneDecision(spent, sequence.entry.id)
    );
  }

  /* ROLL sur un dé de Destinée qui attend dans le plateau, rien d'autre de
     préparé. Le clic qui l'y a mis n'a rien dépensé ; c'est ici qu'il l'est. */
  function standaloneDestiny(dieId, plan) {
    clearDiceTray(false);
    state.rollConfig = null;
    const spent = spendDestinyDie(dieId, true, plan);
    if (!spent) return;
    const entry = {
      id: uuid(), kind: "destiny", name: t("fh.entry.destiny", { sides: spent.sides }), createdAt: now(), destiny: spent,
      total: spent.result,
      outcome: spent.criticalSuccess ? t("fh.outcome.arcane-critical-success")
        : spent.criticalFailure ? t("fh.outcome.arcane-critical-failure")
          : spent.chaos ? t("fh.outcome.chaos-risk") : t("fh.outcome.destiny-spent")
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
      /* §2 : l'autre exception nommée. Un 1 naturel accepté rend un point
         TEMPORAIRE, qui passe au-dessus du Score. */
      const recovered = setDestinyPoints(before + 1, t("fh.reason.fate-accepted"), true, true, GAIN_TEMPORARY);
      entry.natChoice = "accept";
      entry.destinyPointChange = { before, after: state.destiny.points, reason: t("fh.reason.fate-accepted") };
      const accepted = [t("fh.event.fate-accepted"), t("fh.event.gained-one-point"), t("fh.event.points-current", { points: state.destiny.points })];
      if (recovered) accepted.push(t("fh.event.die-gained", { sides: recovered.sides }));
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
      setDestinyPoints(0, t("fh.reason.invoked-chaos"), false, true);
      entry.total = entryTotal(entry);
      addPendingFate({ kind: "chaos", entryId: entry.id, ability: entry.ability || "", name: entry.name || t("fh.reason.defied-roll") });
      events.push(
        { text: t("fh.event.fate-defied", { hadPoints: oldPoints }), kind: "nat1", entryId: entry.id },
        { text: t("fh.event.chaos-pending"), kind: "chaos", entryId: entry.id }
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
      pushEvent(t("fh.event.debt-expired", { label: pendingLabel(dropped) }), "chaos");
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
    if (!label) { notify(t("notice.badge-needs-name"), "warn"); return false; }
    if (id) {
      const item = pendingFate().find((entry) => entry.id === id);
      if (item) item.label = label;
    } else if (pendingFate().length >= MAX_PINNED) {
      notify(t("notice.badge-cap", { max: MAX_PINNED }), "warn"); return false;
    } else {
      addPendingFate({ kind: "note", label });
    }
    state.trayPrompt = null;
    return true;
  }

  function pendingLabel(item) {
    if (item.label) return String(item.label).slice(0, 24);
    if (item.kind === "chaos") return t("fh.pending.chaos");
    if (item.kind === "overreach") return t("fh.pending.overreach", { overreach: Number(item.overreach) || 0 });
    return t("fh.pending.note");
  }
  function pendingResolvable(item) { return item.kind === "chaos" || item.kind === "overreach"; }
  function pendingTitle(item) {
    if (item.kind === "note") return t("fh.pending.title.note");
    return item.kind === "chaos" ? t("fh.pending.title.chaos") : t("fh.pending.title.overreach", { dc: Number(item.dc) || 10 });
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
      state.trayResults = [0, 1].map((index) => ({ sides: 6, result: null, label: t("fh.tray.chaos-die", { index: index + 1 }), pending: true, special: "chaos", dieRole: "chaos" }));
      state.trayTitle = t("fh.tray.chaos");
      state.trayResultText = t("fh.tray.chaos-prompt");
    } else {
      state.pendingArmed = { id: item.id, kind: "overreach", sides: [20], dc: Number(item.dc) || 10, ability: item.ability || "", overreach: Number(item.overreach) || 0 };
      state.trayResults = [{ sides: 20, result: null, label: t("fh.tray.save-label", { ability: item.ability || "" }), pending: true, dieRole: "base" }];
      state.trayTitle = t("fh.tray.overreach-save");
      state.trayResultText = t("fh.tray.overreach-prompt", { dc: Number(item.dc) || 10 });
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
      state.trayResults = roll.map((result, index) => ({ sides: 6, result, label: t("fh.tray.chaos-die", { index: index + 1 }), special: "chaos", dieRole: "chaos" }));
      const chaosEntry = {
        id: uuid(), kind: "tray",
        name: t("fh.entry.chaos", { ability: chaosAbility, name: item && item.name }),
        ability: chaosAbility, dice: roll.map((result) => ({ sides: 6, result })), flatBonus: 0, total,
        createdAt: now(), outcome: t("fh.outcome.chaos", { total }), chaosRow: chaosRowText(chaosAbility, total)
      };
      state.trayTitle = t("fh.tray.chaos");
      state.trayResultText = "2d6 = " + roll.join(" + ") + " = " + total;
      addHistory(chaosEntry);
      if (item) dropPendingFate(item.id);
      state.pendingArmed = null;
      state.rollSequence = { phase: "free-tray", entryId: chaosEntry.id };
      announceEvents([{ text: t("fh.event.chaos-resolved", { rolls: roll, total, verdict: chaosVerdict(chaosAbility, total) }), kind: "chaos", entryId: chaosEntry.id }], "finish-sequence");
      return;
    }
    const ability = armed.ability || "";
    let save = { bonus: 0 };
    try { if (ability && state.character) save = saveInfo(ability, state.character); } catch (error) { /* une fiche incomplète ne casse pas la sauvegarde */ }
    const overreach = Number(armed.overreach) || Number(item && item.overreach) || 0;
    const natural = rollDie(20);
    const penalty = engine.exhaustionPenalty();
    const total = natural + (Number(save.bonus) || 0) + penalty;
    const dc = Number(armed.dc) || 10;
    const held = total >= dc;
    const saveEntry = {
      id: uuid(), kind: "d20", rollType: "check", name: t("fh.entry.overreach-save", { ability }), ability,
      exhaustion: exhaustionLevel(), exhaustionPenalty: penalty,
      baseBonus: Number(save.bonus) || 0, d20Mode: "flat", d20s: [natural],
      d20Roll: { sides: 20, mode: "flat", rolls: [natural], result: natural, chosenIndex: 0, forced: false },
      d20Choice: 0, d20Forced: false, kept: natural, natural, plusTwo: false, custom: 0, bonusDice: [],
      guidance: null, bardic: null, destiny: null, dc: String(dc), note: t("fh.reason.deferred-overreach"),
      createdAt: now(), adjusted: false, total, outcome: held ? OUTCOME_SUCCESS : OUTCOME_FAILURE
    };
    addHistory(saveEntry);
    setTrayFromEntry(saveEntry);
    if (item) dropPendingFate(item.id);
    state.pendingArmed = null;
    const saveEvents = [{
      text: t(held ? "fh.event.weave-held" : "fh.event.overreach-breaks", { ability, total, dc }),
      kind: held ? "result" : "chaos", entryId: saveEntry.id
    }];
    /* Tenir la Trame n'est pas gratuit : les règles le paient en Épuisement. */
    if (held) {
      state.rollSequence = { phase: "free-tray", entryId: saveEntry.id };
      const beforeLevel = exhaustionLevel();
      const after = setExhaustion(beforeLevel + 1, t("fh.reason.overreach-held"), true);
      if (after !== beforeLevel) saveEvents.push({ text: exhaustionText(after, t("fh.reason.overreach-held")), kind: after >= 6 ? "nat1" : "loss", entryId: saveEntry.id });
      announceEvents(saveEvents, "finish-sequence");
      return;
    }
    /* L'échouer lance 1d6 + Overreach sur la table — un seul geste, parce que la
       sauvegarde et sa conséquence sont un seul moment à la table. */
    const chaosDie = rollDie(6), chaosTotal = chaosDie + overreach;
    const breakEntry = {
      id: uuid(), kind: "tray", name: t("fh.entry.chaos", { ability, name: "" }), ability,
      dice: [{ sides: 6, result: chaosDie }], flatBonus: overreach, total: chaosTotal,
      createdAt: now(), outcome: t("fh.outcome.chaos", { total: chaosTotal }), chaosRow: chaosRowText(ability, chaosTotal)
    };
    addHistory(breakEntry);
    state.trayResults = [{ sides: 6, result: chaosDie, label: t("fh.tray.chaos"), special: "chaos", dieRole: "chaos" }];
    if (overreach) state.trayResults.push({ kind: "modifier", result: overreach, label: t("part.overreach"), tone: "overreach" });
    state.trayTitle = t("fh.tray.chaos");
    state.trayResultText = "d6 " + chaosDie + (overreach ? " + Overreach " + overreach : "") + " = " + chaosTotal;
    state.rollSequence = { phase: "free-tray", entryId: breakEntry.id };
    saveEvents.push({ text: t("fh.event.chaos-break", { die: chaosDie, overreach, total: chaosTotal, verdict: chaosVerdict(ability, chaosTotal) }), kind: "chaos", entryId: breakEntry.id });
    announceEvents(saveEvents, "finish-sequence");
  }

  /* ══ D.5 — LE DON D'UN DÉ DE DESTINÉE ══════════════════════════════
     « Dans de rares cas, notamment avec l'Arcane du Diable, un joueur peut
     donner un dé de Destinée à un autre joueur, en réaction ou à l'avance. »

     La couche s'inscrit sur LE MÊME VERBE que le don SRD (`giveDie`) : c'est
     un test de plus de la séparation, et un bon. Ce qui change entre les deux,
     c'est la ressource dépensée — pas la forme du don, pas le transport. */
  function giveDestinyDie({ dieId, to, timing }) {
    const die = state.destiny.dice.find((item) => item.id === dieId && item.available);
    if (!die) { notify(t("fh.notice.die-unavailable"), "warn"); return null; }
    die.available = false;
    emitPool("destiny-given");
    pushEvent(t("fh.event.gift-destiny", { sides: die.sides, to, timing }), "destiny");
    return {
      source: "destiny", sides: die.sides, label: t("source.destiny"), tint: "gold",
      kind: "die", count: 1
    };
  }

  /* ══ Ce que la couche rend au reste du bloc ════════════════════════ */

  const verbs = {
    spendDestiny: (p) => stageDestinyFromPool(p.dieId),
    stageDestinyDie: (p) => stageDestinyDie(p.dieId),
    adjustDestinyDie: (p) => adjustDestinyDie(p.sides, p.direction),
    setDestinyField: (p) => updateDestinyField(p.field, p.value, p.reason),
    recoverDestiny: (p) => recoverDestinyPoints(p && p.amount, p && p.reason),
    settleAwakening: (p) => settleAwakening(p && p.card),
    resolveNatOne: (p) => resolveNatOne(p.entryId, p.choice),
    resolveArcaneOne: (p) => resolveArcaneOne(p.entryId, p.choice),
    armPending: (p) => armPendingFate(p.id),
    resolvePending: () => rollPendingFate(),
    addPending: (p) => addPendingFate(p),
    dropPending: (p) => dropPendingFate(p.id),
    renamePending: (p) => savePendingLabel(p.id, p.label)
  };

  const derive = { chaosRow: chaosRowText, chaosVerdict, pendingLabel, pendingTitle, pendingResolvable };

  /* Les ROUAGES exposés aux suites de la couche, comme `play.engine` l'est aux
     siennes. Ce n'est pas la surface publique : celle-là, c'est `verbs`. */
  const internals = {
    makeDestinySlots, normalizeDestiny, recoverLowestDie, adjustDestinyDie,
    setDestinyPoints, recoverDestinyPoints, vibrationFor, arcanaKnown,
    GAIN_RECOVERED, GAIN_TEMPORARY, GAIN_DECLARED, LONG_REST_RECOVERY,
    updateDestinyField, spendDestinyDie, arcaneDecision, destinyPlanFor,
    destinyEventSpecs, resolveArcaneOne, settleAwakening, naturalDestiny: (entry) => {
      const answer = onResult({ entry });
      return (answer && answer.events) || [];
    },
    stageDestinyDie, stageDestinyFromPool, standaloneDestiny, resolveNatOne,
    pendingFate, addPendingFate, dropPendingFate, savePendingLabel,
    armPendingFate, rollPendingFate, rollSequenceDestiny, giveDestinyDie,
    chaosRowText, chaosVerdict
  };

  return {
    verbs, derive, internals,

    /* Les réclamations de ROLL, par priorité. En v1 le verbe `roll` branchait
       lui-même sur `state.pendingArmed` et `state.destinyStaged` — deux
       mécaniques maison citées dans l'aiguillage commun. */
    rollClaims: [
      { priority: 10, when: () => !!state.pendingArmed, run: rollPendingFate },
      {
        priority: 70, when: () => !!state.destinyStaged,
        run: () => {
          const waiting = state.destinyStaged;
          state.destinyStaged = null;
          dropEventsTagged("staged-destiny");
          standaloneDestiny(waiting.dieId, destinyPlanFor(waiting));
        }
      }
    ],

    /* Les portées de dé que la couche possède dans le menu d'un dé. */
    dieScopes: {
      "pool-destiny": {
        find: (prompt) => {
          if (!prompt.poolId) return null;
          const waiting = state.destinyStaged;
          if (!waiting || waiting.dieId !== prompt.poolId) return null;
          if (!state.destiny.dice.some((die) => die.id === waiting.dieId && die.available)) return null;
          return { scope: "pool-destiny", sides: waiting.sides, label: t("fh.tray.destiny") + " d" + waiting.sides, advantageMode: waiting.advantageMode || "flat", forcedResult: waiting.forcedResult, colour: "", sourceIcon: "" };
        },
        mutate: (prompt, patch) => { Object.assign(state.destinyStaged, patch); },
        drop: () => { state.destinyStaged = null; dropEventsTagged("staged-destiny"); }
      },
      destiny: {
        find: (prompt) => {
          const cfg = state.rollConfig;
          if (!prompt.destinyDieId || !cfg) return null;
          const poolDie = state.destiny.dice.find((die) => die.id === prompt.destinyDieId && die.available);
          if (!poolDie || cfg.destinyDieId !== poolDie.id) return null;
          return { scope: "destiny", sides: poolDie.sides, label: t("fh.tray.destiny") + " d" + poolDie.sides, advantageMode: cfg.destinyMode || "flat", forcedResult: cfg.destinyForcedResult, colour: "", sourceIcon: "" };
        },
        mutate: (prompt, patch, target) => {
          const cfg = state.rollConfig;
          if (patch.advantageMode != null) cfg.destinyMode = patch.advantageMode;
          if (patch.forcedResult !== undefined) cfg.destinyForcedResult = engine.forcedDieResult(patch.forcedResult, target.sides);
        },
        drop: () => {
          const cfg = state.rollConfig;
          cfg.destinyDieId = ""; cfg.destinyConfirmed = false; cfg.destinyForcedResult = null;
          dropEventsTagged("staged-destiny");
        }
      }
    },

    /* Le choix A/D d'un dé de Destinée : sa cible dans `resolveDieChoice`. */
    dieChoiceTargets: {
      destiny: (sequence, index) => { chooseDiePlan(sequence.destinyPlan, index); rollSequenceDestiny(); }
    },

    /* Les réglages que la couche ajoute à une console de jet, et les dés
       qu'elle y fait attendre. */
    configDefaults: () => ({ plusTwo: false, destinyDieId: "", destinyConfirmed: false, destinyMode: "flat", destinyForcedResult: null }),
    configSettings: { plusTwo: (v) => !!v, destinyDieId: (v) => String(v || ""), destinyMode: (v) => String(v || "flat"), destinyForcedResult: (v) => (v == null || v === "" ? null : Math.round(Number(v) || 0)) },
    configFromEntry: (entry) => ({
      plusTwo: !!entry.plusTwo, destinyDieId: "", destinyConfirmed: false,
      destinyMode: (entry.destiny && entry.destiny.advantageMode) || "flat",
      destinyForcedResult: entry.destiny && entry.destiny.forced ? entry.destiny.result : null
    }),
    configTrayDice: (cfg, original) => {
      const dice = [];
      if (original && original.destiny) {
        trayDiceForPlan(original.destiny, t("fh.tray.destiny"), {
          dieRole: "destiny",
          special: original.destiny.criticalSuccess ? "arcane-critical-success" : original.destiny.criticalFailure ? "arcane-critical-failure" : ""
        }).forEach((item) => dice.push(item));
      } else if (cfg.destinyDieId) {
        const pendingDestiny = state.destiny.dice.find((item) => item.id === cfg.destinyDieId);
        if (pendingDestiny) {
          pendingTrayDice(pendingDestiny.sides, t("fh.tray.destiny"), cfg.destinyMode, cfg.destinyForcedResult, { flash: true, destinyDieId: pendingDestiny.id, dieRole: "destiny" })
            .forEach((item) => dice.push(item));
        }
      }
      if (cfg.plusTwo) dice.push({ kind: "modifier", result: 2, label: t("fh.tray.fh-bonus"), pending: !(original && original.plusTwo) });
      return dice;
    },

    /* La couche apporte sa propre source de don : donner un dé de Destinée
       s'inscrit sur le même verbe que donner un dé de Barde. */
    giftSources: { destiny: giveDestinyDie },

    /* ── LES INSCRIPTIONS ─────────────────────────────────────────────
       C'est tout ce que le chemin commun sait de cette couche : trois
       moments, et des poignées qu'il ne nomme jamais. */
    register: [
      { moment: "session-open", handler: ({ destiny, character }) => { state.destiny = normalizeDestiny(destiny, character || {}); } },
      { moment: "session-snapshot", handler: () => ({ contribute: { destiny: state.destiny } }) },
      { moment: "session-clear", handler: () => { state.destinyStaged = null; state.pendingArmed = null; } },
      { moment: "pre-roll", handler: onPreRoll },
      { moment: "result", handler: onResult },
      { moment: "reopen", handler: onReopen }
    ]
  };
}
