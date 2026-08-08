/* Le RÈGLEMENT, et les deux formats qui en sortent.

   Portée de la section « the semantic layer » + « settlement » de fh-phb
   `tests/campaign-feed.test.js` (main). C'est la suite qui garde le piège nommé
   en clair dans le lot C : LE RÈGLEMENT N'EST PAS DANS `addHistory`.

   Ce qui n'est PAS venu : tout ce qui est TRANSPORT — les POST, le statut
   LIVE/RECENT/OFF, `feedMerge` et l'affichage du flux. Ils appartiennent au
   bloc `table`, qui s'abonne à `roll-settled`. Ici le bus est le seul aval. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { makeHarness, fhCharacter } from "./play-harness.mjs";

const entry = (over = {}) => Object.assign({
  id: "e1", kind: "d20", name: "Hunting", ability: "WIS", baseBonus: 5, total: 27, natural: 12,
  dc: "", outcome: "", adjusted: false, natChoice: null, destiny: null, bonusDice: [],
  createdAt: new Date().toISOString()
}, over);

test("la couche sémantique : `intent` dit ce qu'un programme doit lire", () => {
  const h = makeHarness();
  h.reset();
  const outcome = (over) => h.derive.intent(entry(over)).outcome;
  assert.equal(outcome({ natural: 20 }), "critical-success");
  assert.equal(outcome({ natural: 1, natChoice: "accept" }), "critical-failure");
  assert.equal(outcome({ natural: 1, natChoice: "chaos" }), "critical-success");
  assert.equal(outcome({ total: 27, dc: 15 }), "success");
  assert.equal(outcome({ total: 9, dc: 15 }), "failure");
  assert.equal(outcome({ destiny: { criticalFailure: true } }), "critical-failure");
  // Anything genuinely undecided stays null rather than guessing a verdict.
  assert.equal(outcome({ natural: 1, natChoice: null }), null, "an unresolved natural 1 has no outcome");
  assert.equal(outcome({ natural: 12, dc: "" }), null, "no DC means no stated verdict");

  const intent = h.derive.intent(entry({ dc: 15 }));
  assert.equal(intent.kind, "check");
  assert.equal(intent.check, "Hunting");
  assert.equal(intent.ability, "WIS");
  assert.equal(intent.dc, 15);
  assert.equal(intent.total, 27);
  assert.equal(h.derive.intent(entry({ kind: "tray" })), null, "only a d20 check produces a check intent");
});

test("`fh-roll/1` est la VUE, exportée telle quelle", () => {
  const h = makeHarness();
  h.reset();
  h.state.campaign = "FH2";
  // REWRITTEN 2026-08-09 (lot 21) — un `fh-char/1` réel : `destinyBuild` est un champ v1 que le schéma ignore.
  h.state.character = fhCharacter({ name: "Yedrivel" });
  const view = h.derive.export(entry({ dc: 15, outcome: "Success" }));
  assert.equal(view.schema, "fh-roll/1", "the display layer is exported unchanged");
  assert.equal(view.id, "e1");
  assert.equal(view.campaign, "FH2");
  assert.equal(view.character, "Yedrivel");
  assert.equal(view.title, "Hunting");
  assert.equal(view.total, 27);
  assert.equal(view.dc, 15);
  assert.equal(view.bonus, 5);
  assert.ok(Array.isArray(view.parts) && view.parts.length, "les parts sont là");
  assert.ok(Array.isArray(view.badges), "les badges aussi");
  assert.ok(Array.isArray(view.badgeIds), "et leurs ids, pour une dédup par jeton et non par texte");
  assert.ok(Array.isArray(view.dice) && view.dice.length, "et les dés à plat, pour qu'un autre dock les dessine");
  assert.equal(view.dice[0].role, "base");
});

test("PIÈGE : un 1 naturel non résolu ne doit PAS atteindre la table", () => {
  /* This is the finding that shaped the hook: a natural 1 is in history but the
     player has not chosen yet, and defying turns it into a 20. Announcing at
     addHistory would show the table a critical failure that silently reverses. */
  const h = makeHarness();
  h.reset();
  h.queueRolls(1);
  h.t.quickRoll("Arcana", "INT", 3, "");
  assert.equal(h.state.history.length, 1, "le 1 EST dans l'historique — addHistory a bien été traversé");
  assert.equal(h.t.rollTransactionActive(), true, "a natural 1 still holds the roll");
  assert.equal(h.settledEvents().length, 0, "an unresolved natural 1 must not reach the table");

  const pending = h.state.history[0];
  h.t.resolveNatOne(pending.id, "chaos");
  assert.equal(h.settledEvents().length, 1, "the table hears about it once the player has answered");
  assert.equal(h.settledEvents()[0].roll.total, 23, "and hears the 20, not the 1");
  assert.equal(h.settledEvents()[0].intent.outcome, "critical-success");
  assert.equal(h.queueEmpty(), 0);
});

test("un jet ordinaire se règle immédiatement, en révision 0", () => {
  const h = makeHarness();
  h.reset();
  h.queueRolls(12);
  h.t.quickRoll("Hunting", "WIS", 5, "");
  assert.equal(h.settledEvents().length, 1, "an ordinary roll settles immediately");
  assert.equal(h.settledEvents()[0].roll.total, 17);
  assert.equal(h.settledEvents()[0].rev, 0);
  assert.equal(h.queueEmpty(), 0);
});

test("un dé de Destinée isolé se règle sur la branche finish-sequence, pas par addHistory", () => {
  const h = makeHarness();
  h.reset(6, [h.die("solo-d6", 6, true)]);
  h.t.stageDestinyFromPool("solo-d6");
  h.queueRolls(4);
  /* REWRITTEN (lot 5) — la v1 (et le lot 3) faisaient commencer `rollTrayDice`
     par « et si un dé de Destinée attend ? ». C'était le chemin commun qui
     citait une mécanique maison. L'aiguillage passe désormais par des
     RÉCLAMATIONS déclarées, et c'est `roll` qui les consulte : la couche
     réclame en priorité 70, le plateau libre reste à 100. Ce qui est vérifié
     — un dé d'or seul se règle seul — n'a pas bougé d'un pouce. */
  h.verbs.roll();
  assert.equal(h.state.history[0].kind, "destiny");
  assert.equal(h.settledEvents().length, 1, "un jet de Destinée isolé n'ouvre pas de jet : il se règle en fin de séquence");
  assert.equal(h.settledEvents()[0].roll.kind, "destiny");
  assert.equal(h.settledEvents()[0].intent, null, "et il ne produit pas d'intent de test — ce n'est pas un check");
  assert.equal(h.queueEmpty(), 0);
});

test("un échec critique arcanique retient le règlement jusqu'à la réponse", () => {
  const h = makeHarness();
  h.reset(3, [h.die("arc", 8, true)]);
  h.queueRolls(1);
  h.state.rollConfig = Object.assign(h.t.rollInput("Arcana", "INT", 2, { mode: "flat" }), { destinyDieId: "arc", destinyConfirmed: true });
  h.t.runConfiguredRoll();
  assert.equal(h.t.rollTransactionActive(), true);
  assert.equal(h.settledEvents().length, 0, "la question tient le jet : rien n'est réglé");
  h.queueRolls(12);
  h.t.resolveArcaneOne(h.state.trayPrompt.entryId, "accept");
  assert.equal(h.settledEvents().length, 1, "la réponse donnée, le jet se règle");
  assert.equal(h.settledEvents()[0].roll.total, 1 + 12 + 2);
  assert.equal(h.queueEmpty(), 0);
});

test("la réserve annonce ses mouvements sur `pool-changed`", () => {
  const h = makeHarness();
  h.reset(5, [h.die("p-d4", 4, true)]);
  const before = h.poolEvents().length;
  h.queueRolls(3);
  h.t.spendDestinyDie("p-d4", true);
  assert.ok(h.poolEvents().length > before, "dépenser un dé de Destinée bouge la réserve, et le dit");
  const last = h.poolEvents()[h.poolEvents().length - 1];
  assert.equal(last.destiny.points, 2);
  assert.equal(h.queueEmpty(), 0);
});
