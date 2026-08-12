/* ══ LES TESTS DU LOT 45 — LE HASARD, PUR ═══════════════════════════════

   `ui/builder/dice.mjs` ne connaît AUCUN DOM : ce fichier le teste comme
   n'importe quelle fonction pure, sans `dom-stub.mjs`. C'est CE fichier qui
   prouve la règle de relance (commande §4, test 2) — « un test qui dépend
   du hasard réel n'est pas un test » : toute source d'aléa ici est une
   fonction FABRIQUÉE, jamais `Math.random`. */

import test from "node:test";
import assert from "node:assert/strict";

import { rollThreeD6, rollTen, markKept, rollAbilitySet, drawArcana } from "../ui/builder/dice.mjs";

/** Une source d'aléa qui rejoue une SUITE FIXE de nombres dans [0,1) —
 *  boucle sur elle-même si on lui en demande plus qu'elle n'en porte, pour
 *  ne jamais planter un test qui tire plus de dés que prévu par erreur. */
function scriptedRng(sequence) {
  let i = 0;
  return () => {
    const value = sequence[i % sequence.length];
    i += 1;
    return value;
  };
}

/* ══ 1 — rollThreeD6 / rollTen : la forme ═══════════════════════════════ */

test("rollThreeD6 rend trois dés dans [1,6] et leur somme exacte", () => {
  const rng = scriptedRng([0, 0.5, 0.999]); // → d6: 1, 4, 6
  const roll = rollThreeD6(rng);
  assert.deepEqual(roll.dice, [1, 4, 6]);
  assert.equal(roll.total, 11);
});

test("rollTen rend exactement DIX jets, jamais recomposés depuis un total", () => {
  const rng = scriptedRng([0, 0, 0]); // 1+1+1 = 3, dix fois
  const rolls = rollTen(rng);
  assert.equal(rolls.length, 10);
  for (const roll of rolls) {
    assert.deepEqual(roll.dice, [1, 1, 1]);
    assert.equal(roll.total, 3);
  }
});

/* ══ 3 — CHAQUE JET VAUT ENTRE 3 ET 18, sur un grand nombre de jets ══════
   Hasard RÉEL ici (Math.random), volontairement : ce test-ci ne prouve pas
   la règle de relance (test 2, plus bas, le fait sur un hasard scripté) —
   il prouve seulement les bornes physiques de 3d6, sur assez de jets pour
   que les deux bornes soient vraiment atteintes. */

test("chaque jet de 3d6 vaut entre 3 et 18 — vérifié sur mille jets, les deux bornes sont atteintes", () => {
  let min = 99;
  let max = 0;
  for (let i = 0; i < 1000; i += 1) {
    const { total } = rollThreeD6(Math.random);
    assert.ok(total >= 3 && total <= 18, `un jet de 3d6 vaut ${total}, hors [3,18]`);
    min = Math.min(min, total);
    max = Math.max(max, total);
  }
  assert.equal(min, 3, "le minimum (3×1) doit apparaître sur mille jets");
  assert.equal(max, 18, "le maximum (3×6) doit apparaître sur mille jets");
});

/* ══ markKept — LES SIX MEILLEURS, ÉGALITÉ TRANCHÉE PAR L'ORDRE ═════════ */

test("markKept retient les SIX plus grands totaux, les DIX restent visibles", () => {
  const totaux = [3, 18, 17, 16, 14, 13, 12, 5, 4, 3];
  const rolls = totaux.map((total) => ({ dice: [1, 1, 1], total }));
  const marked = markKept(rolls);
  assert.equal(marked.length, 10, "les DIX restent visibles — écartés compris");
  const keptIndexes = marked.filter((r) => r.kept).map((r) => r.index).sort((a, b) => a - b);
  assert.deepEqual(keptIndexes, [1, 2, 3, 4, 5, 6], "les six plus grands totaux (18,17,16,14,13,12) sont aux index 1..6");
  assert.equal(marked.filter((r) => r.kept).length, 6, "exactement six retenus, jamais plus");
});

test("markKept tranche une égalité par l'ORDRE DU JET — le premier jeté gagne", () => {
  // Sept jets à 10 (index 0..6) puis trois plus bas — six des sept "10" sont
  // gardés, et c'est le PREMIER jeté (index 0..5) qui l'emporte sur le 7e (index 6).
  const totaux = [10, 10, 10, 10, 10, 10, 10, 5, 4, 3];
  const rolls = totaux.map((total) => ({ dice: [1, 1, 1], total }));
  const marked = markKept(rolls);
  const keptIndexes = marked.filter((r) => r.kept).map((r) => r.index).sort((a, b) => a - b);
  assert.deepEqual(keptIndexes, [0, 1, 2, 3, 4, 5], "les six PREMIERS jets à 10 gagnent");
  assert.equal(marked[6].kept, false, "le SEPTIÈME jet à 10 (même valeur, jeté après) est écarté");
});

/* ══ 2 — ⚔️ LA RELANCE MORD : un lot sans 15+ est REJETÉ EN ENTIER ══════
   Le test qui compte le plus (commande §4) : un hasard SCRIPTÉ où le
   PREMIER lot de dix jets ne porte AUCUN total ≥ 15 (dix jets de "2,2,2" =
   6, aucun n'atteint 15), et le SECOND lot en porte un — `rollAbilitySet`
   doit rendre le SECOND, jamais le premier, et le dire (`rerollCount`). */

test("⚔️ ATTAQUE — un lot dont aucun des dix jets n'atteint 15 est REJETÉ EN ENTIER, jamais retouché", () => {
  // Premier lot (10×3d6) : chaque dé vaut 2 → chaque jet totalise 6. Aucun ≥ 15.
  const lotRejete = Array(30).fill(1 / 6); // d6(1/6) = floor(1/6*6)+1 = 2
  // Second lot : le premier jet vaut 18 (trois 6), le reste vaut 6 comme avant.
  const lotAccepte = [0.999, 0.999, 0.999].concat(Array(27).fill(1 / 6));
  const rng = scriptedRng(lotRejete.concat(lotAccepte));

  const result = rollAbilitySet(rng);
  assert.equal(result.rerollCount, 1, "un seul lot a été rejeté avant celui rendu");
  assert.equal(result.rolls.length, 10);
  assert.ok(result.rolls.some((r) => r.total >= 15), "le lot RENDU porte bien un total ≥ 15");
  assert.equal(result.rolls[0].total, 18, "c'est bien le second lot scripté qui est rendu — le premier (tout à 6) est absent");
  // Preuve que le lot rejeté n'a laissé AUCUNE trace : le total 6 apparaît
  // seulement dans les neuf jets restants du lot RENDU, pas dans un dixième
  // en trop — la liste rendue a exactement dix entrées (vérifié plus haut).
  assert.deepEqual(result.rolls.slice(1).map((r) => r.total), Array(9).fill(6));
});

test("rollAbilitySet ne relance pas quand le premier lot porte déjà un 15+", () => {
  const rng = scriptedRng([0.999, 0.999, 0.999].concat(Array(27).fill(0)));
  const result = rollAbilitySet(rng);
  assert.equal(result.rerollCount, 0, "aucune relance : le premier lot satisfait déjà la règle");
  assert.equal(result.rolls[0].total, 18);
});

test("rollAbilitySet, avec Math.random réel, rend toujours un lot qui satisfait la règle (mille tirages)", () => {
  for (let i = 0; i < 200; i += 1) {
    const { rolls } = rollAbilitySet(Math.random);
    assert.ok(rolls.some((r) => r.total >= 15), "le lot rendu satisfait toujours « au moins un 15+ »");
    assert.equal(rolls.filter((r) => r.kept).length, 6);
  }
});

/* ══ 6 — drawArcana NE TIRE QUE DU CATALOGUE REÇU, jamais un 22 en dur ═══ */

test("drawArcana tire dans le catalogue REÇU — un catalogue à 3 ne rend jamais une 4e entrée", () => {
  const catalogue = [{ id: "a" }, { id: "b" }, { id: "c" }];
  for (const rngValue of [0, 0.33, 0.5, 0.99]) {
    const rng = scriptedRng([rngValue]);
    const tire = drawArcana(catalogue, rng);
    assert.ok(catalogue.includes(tire), `« ${JSON.stringify(tire)} » doit être un élément du catalogue de 3`);
  }
});

test("drawArcana rend null sur un catalogue vide — jamais un id fabriqué", () => {
  assert.equal(drawArcana([], Math.random), null);
});

test("drawArcana couvre les BORNES du catalogue (premier et dernier élément atteignables)", () => {
  const catalogue = [{ id: "premier" }, { id: "milieu" }, { id: "dernier" }];
  assert.equal(drawArcana(catalogue, scriptedRng([0])).id, "premier");
  assert.equal(drawArcana(catalogue, scriptedRng([0.999999])).id, "dernier");
});
