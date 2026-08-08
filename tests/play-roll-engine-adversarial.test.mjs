/* Suite portée de fh-phb `tests/roll-engine-adversarial.test.js` (193 l., main).

   Package 9 — chasse adversariale sur le moteur de jets et la machine à états
   Destinée / Chaos / Éveil arcanique. Chaque bloc reproduit UN défaut concret
   trouvé en lisant et en fuzzant le moteur, puis asserte le comportement
   corrigé. Chacune de ces assertions a échoué contre la source d'avant le
   correctif : ce sont des régressions gardées, pas des tests de confort.

   Ce qui n'est PAS venu : `testBroadcastRetriesAfterFailedSend`, entièrement
   bâti sur `fetch` et le statut du fil. Le bloc `play` n'atteint pas le
   réseau ; l'invariant de RÉÉMISSION qu'il gardait aussi est porté ci-dessous
   sur le bus, et le reste (le retry après échec réseau) appartient au bloc
   `table` et devra être re-tenu là. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { makeHarness } from "./play-harness.mjs";
import { forcedDieResult, createDiceKit } from "../src/play/dice.mjs";

function baseDestiny(points) {
  return { score: 8, points, dice: [], pending: [], overreach: 0, awakeningOwed: 0, lastChange: null };
}

test("un Éveil dû est un COMPTE, pas un drapeau", () => {
  const h = makeHarness();
  h.reset();
  h.state.destiny = baseDestiny(0);
  h.state.vitals = { current: null, max: null, exhaustion: 0, shortRestUsed: false };

  h.queueRolls(20);
  h.t.quickRoll("Arcana", "INT", 5);
  assert.equal(h.state.destiny.awakeningOwed, 1, "one Natural 20 at 0 points owes one draw");
  h.queueRolls(20);
  h.t.quickRoll("Investigation", "INT", 5);
  assert.equal(h.state.destiny.awakeningOwed, 2,
    "REGRESSION: a second Natural 20 at 0, before the first card is drawn, owes a SECOND draw — it must not collapse back into the same single flag");

  /* REWRITTEN (lot C, portage v2) : la v1 réglait l'Éveil par `keepArcana`, qui
     tirait dans le paquet des 22 Arcanes (`window.FH_ARCANA`) et écrivait la
     carte gardée dans le profil. Le paquet est du CONTENU et le profil est le
     document : ni l'un ni l'autre n'entre dans `play`. Le verbe porte la moitié
     MOTEUR — un Éveil dû réglé, plancher à zéro — et la carte n'arrive que par
     son identité.
     REWRITTEN 2026-08-08 (lot 5, §C) : la carte doit désormais DÉCLARER ce
     qu'elle donne. `keepArcana` appliquait `score+1 / points+10` sans regarder
     la carte, ce qui n'était juste que parce que le paquet v1 ne contenait que
     les 22 majeurs ; avec les 78 cartes, tout mineur aurait donné +1 au Score.
     Le COMPTE testé ici n'a pas bougé d'un pouce. */
  const major = { id: "arc-0", name: "The Fool", numeral: "0", arcana: "major", points: 10 };
  h.t.settleAwakening(major);
  assert.equal(h.state.destiny.awakeningOwed, 1, "drawing once settles exactly one owed Awakening");
  h.t.settleAwakening(major);
  assert.equal(h.state.destiny.awakeningOwed, 0, "and the second draw settles the second — nothing is lost, nothing goes negative");
  h.t.settleAwakening(major);
  assert.equal(h.state.destiny.awakeningOwed, 0, "et un tirage de trop ne descend pas sous zéro");
  assert.equal(h.queueEmpty(), 0);
});

test("§C — un mineur ne monte PAS le Score, et une carte muette jette", () => {
  /* Le bug garanti que §L5 exigeait d'empêcher, trouvé par l'expert Fate's Hand
     le 2026-08-08 : `keepArcana()` v1 appliquait `score+1` INCONDITIONNELLEMENT.
     Porté avec les 78 cartes, tout mineur aurait donné +1 au Score maximum.
     La correction n'est pas un `if` de plus : la partie chiffrée est FONCTION
     DE LA CARTE, et elle n'existe pas tant que la carte n'est pas connue. */
  const h = makeHarness();
  h.reset();
  h.state.destiny = { score: 8, points: 0, dice: [], pending: [], overreach: 0, awakeningOwed: 2, lastChange: null };

  h.t.settleAwakening({ id: "min-3", name: "Three of Cups", arcana: "minor", points: 4, brick: true });
  assert.equal(h.state.destiny.score, 8, "REGRESSION §C : un Arcane MINEUR ne touche pas au Score maximum");
  assert.equal(h.state.destiny.points, 4, "il donne des points temporaires, et ceux de la carte");
  assert.equal(h.state.destiny.awakeningOwed, 1, "et il règle bien un Éveil dû");

  h.t.settleAwakening({ id: "maj-1", name: "The Magician", numeral: "I", arcana: "major", points: 10 });
  assert.equal(h.state.destiny.score, 9, "seul un MAJEUR monte le Score maximum");
  assert.equal(h.state.destiny.points, 14, "et il donne ce que SA carte déclare");

  /* Une carte muette est une erreur bruyante, pas un repli sur « major » —
     retomber sur l'ancienne constante par défaut serait exactement le bug. */
  assert.throws(() => h.t.settleAwakening({ name: "Unnamed" }), /major.*minor/,
    "une carte qui ne déclare pas son arcane jette au lieu de supposer");
  assert.throws(() => h.t.settleAwakening({ arcana: "major" }), /temporary Points/,
    "et une carte qui ne déclare pas ses points aussi — « +10 » était une constante de paquet, pas une règle");
  assert.equal(h.state.destiny.score, 9, "aucun de ces deux refus n'a rien appliqué à moitié");
});

test("§C — le +1 au Score est un acquis SANS SOURCE DE RÈGLE : il part au document", () => {
  /* Invariant 1 de `fh-char/1` : `resolved` n'est écrit que par la dérivation.
     Un +1 permanent écrit seulement là serait effacé à la prochaine
     reconstruction. L'historique des Éveils doit vivre en `build.choices`
     scalaires — donc `play` ÉMET le choix à enregistrer, il ne l'écrit pas :
     le document ne lui appartient pas. */
  const h = makeHarness();
  h.reset();
  h.state.destiny = { score: 8, points: 0, dice: [], pending: [], overreach: 0, awakeningOwed: 1, lastChange: null };
  h.t.settleAwakening({ id: "maj-21", name: "The World", numeral: "XXI", arcana: "major", points: 10 });
  const announced = h.emitted.filter((event) => event.type === "awakening-settled");
  assert.equal(announced.length, 1, "l'Éveil réglé est annoncé une fois");
  assert.equal(announced[0].granted.score, 1, "ce qu'il a donné est chiffré sur l'événement");
  assert.equal(announced[0].granted.points, 10);
  assert.ok(announced[0].choice.path.startsWith("fh.awakenings["), "et il porte le CHOIX scalaire que `build` doit enregistrer");
  assert.equal(announced[0].choice.value, "maj-21", "identifié par la carte, pas par son texte");
});

test("une dette de destin ne tombe jamais en silence", () => {
  const h = makeHarness();
  h.reset();
  h.state.destiny = baseDestiny(5);

  h.t.addPendingFate({ kind: "chaos", entryId: "r1", ability: "INT", name: "defy #1" });
  h.t.addPendingFate({ kind: "chaos", entryId: "r2", ability: "STR", name: "defy #2" });
  h.t.addPendingFate({ kind: "overreach", entryId: "r3", ability: "WIS", dc: 14, overreach: 4 });
  h.t.addPendingFate({ kind: "chaos", entryId: "r4", ability: "CHA", name: "defy #4" });
  assert.equal(h.state.events.length, 0, "no debt has been dropped yet — no expiry line should exist");

  h.t.addPendingFate({ kind: "overreach", entryId: "r5", ability: "DEX", dc: 11, overreach: 1 });
  assert.equal(h.t.pendingFate().some((item) => item.entryId === "r1"), false, "the strip still holds only 4 — the oldest is evicted under load, same as before");
  assert.equal(h.t.pendingFate().length, 4);
  /* REGRESSION: the old code called .slice(-4) and threw the oldest debt away
     with no trace at all — a fatigue-bearing Chaos/Overreach obligation simply
     vanishing is exactly the silent fallback the handoff §2 forbids. */
  assert.equal(h.state.events.length, 1, "an eviction must leave a visible trace instead of vanishing without one");
  assert.match(h.state.events[0].text, /never faced.*expired/i);
});

test("une face de dé forcée reste un entier, même venue d'un état corrompu", () => {
  let counter = 0;
  const kit = createDiceKit({ rollDie: () => 1, uuid: () => "adv-" + (++counter) });
  assert.equal(Number.isInteger(forcedDieResult(15.7, 20)), true, "a die face must be an integer even if the stored value is not");
  assert.equal(forcedDieResult(15.7, 20), 16, "rounds rather than truncating toward a face that was never actually the closest one");
  assert.equal(forcedDieResult("12.25", 20), 12);
  assert.equal(forcedDieResult(0.4, 20), 1, "still clamps to the die's real minimum face");
  assert.equal(forcedDieResult(-5, 8), 1);
  assert.equal(forcedDieResult(99, 8), 8);

  const bonus = kit.normalizeBonusDie({ label: "Corrupted", sides: 8, forcedResult: 6.6 }, 0);
  assert.equal(bonus.forcedResult, 7, "a bonus die rehydrated from a corrupted/hand-edited profile also lands on a real face");

  const plan = kit.makeDiePlan(20, "flat", 7.9);
  assert.equal(plan.result, 8, "and the plan that actually feeds the total carries the sanitized integer, not the raw hostile input");
});

test("refuser un 1 arcanique met à jour le relevé des points", () => {
  /* Found by the roll-vocabulary lot (§5, 2026-08-03): refusing an Arcane 1
     zeroed the pool via setDestinyPoints but never touched spent.pointsAfter,
     so the Ruling and the destiny-spend badge kept quoting the pre-refusal
     balance ("Current 9") while the real pool was 0. */
  const h = makeHarness();
  h.reset();
  h.state.destiny = baseDestiny(8);
  h.state.destiny.dice = [{ id: "d1", sides: 8, available: true, colour: "gold" }];
  h.state.vitals = { current: null, max: null, exhaustion: 0, shortRestUsed: false };

  h.queueRolls(1);
  const spent = h.t.spendDestinyDie("d1", true);
  assert.equal(spent.criticalFailure, true);
  assert.equal(spent.pointsAfter, 9, "the granted point is on the record at spend time");

  const entry = { id: "e1", kind: "d20", name: "Test", ability: "INT", kept: 10, natural: null, dc: "", dice: [], destiny: spent };
  h.state.history.unshift(entry);
  h.t.resolveArcaneOne("e1", "chaos");

  assert.equal(h.state.destiny.points, 0, "refusing empties the pool");
  assert.equal(spent.pointsAfter, 0, "REGRESSION: the record must say the pool is empty, not quote the pre-refusal 9");
  const ruling = h.derive.ruling(entry);
  assert.equal(ruling.account.some((line) => /Current 9/.test(line)), false, "the Ruling no longer quotes the stale balance");
  assert.equal(ruling.account.some((line) => /Current 0/.test(line)), true, "it states where the refusal actually leaves you");
  const destinyBadge = h.derive.badges(entry).find((badge) => badge.id === "destiny-spend");
  assert.match(destinyBadge.t, /→ 0/, "and the badge agrees with the Ruling on the real balance");
  assert.equal(h.queueEmpty(), 0);
});

test("régler deux fois de suite une entrée INCHANGÉE ne coûte qu'une émission", () => {
  /* L'invariant compagnon de `testBroadcastRetriesAfterFailedSend` : deux
     appels SYNCHRONES pour la même entrée encore inchangée (le passe de rendu
     suivant, en v1) doivent coûter exactement un envoi. La moitié réseau du
     test v1 — un envoi raté reste rejouable, et n'a pas consommé de numéro de
     révision — appartient désormais au bloc `table` : le relevé de règlement
     ici est OPTIMISTE par construction, puisqu'il n'y a plus rien qui puisse
     échouer entre `play` et le bus. À re-tenir dans `table`. */
  const h = makeHarness();
  h.reset();
  const entry = {
    id: "entry-1", kind: "d20", name: "Arcana", ability: "INT", baseBonus: 3,
    d20s: [15], kept: 15, natural: 15, plusTwo: false, custom: 0, bonusDice: [],
    guidance: null, bardic: null, destiny: null, dc: "", note: "",
    createdAt: new Date().toISOString(), adjusted: false, total: 18, outcome: ""
  };
  h.t.settleEntry(entry);
  h.t.settleEntry(entry);
  assert.equal(h.settledEvents().length, 1, "back-to-back settlements of an unchanged entry must not double-emit");
  assert.equal(h.settledEvents()[0].rev, 0, "the confirmed settlement is rev 0");

  // Ce qui CHANGE le jet consomme une révision, et une seule.
  entry.total = 23;
  entry.adjusted = true;
  h.t.settleEntry(entry);
  h.t.settleEntry(entry);
  assert.equal(h.settledEvents().length, 2, "a changed entry settles again — once");
  assert.equal(h.settledEvents()[1].rev, 1, "and takes the next revision number");
});
