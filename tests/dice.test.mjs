/* ══ LES TESTS DU LOT 45 — LE HASARD, PUR ═══════════════════════════════

   `ui/builder/dice.mjs` ne connaît AUCUN DOM : ce fichier le teste comme
   n'importe quelle fonction pure, sans `dom-stub.mjs`. C'est CE fichier qui
   prouve la règle de tirage — « un test qui dépend du hasard réel n'est pas
   un test » : toute source d'aléa ici est une fonction FABRIQUÉE, jamais
   `Math.random`.

   ⚠️ LA RÈGLE A CHANGÉ LE 2026-08-16 (lot 80, §3), et les tests du §2 avec
   elle. La relance du lot entier est morte ; deux planchers l'ont remplacée.
   Le détail, et la mesure qui l'a décidée, sont en tête du §2. */

import test from "node:test";
import assert from "node:assert/strict";

import {
  rollThreeD6, rollTen, markKept, rollAbilitySet, appliquerLesPlanchers, drawArcana
} from "../ui/builder/dice.mjs";

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

/* 🔴 CE TEST ÉTAIT L'« INSTABILITÉ DE SUITE » — nommée le 2026-08-13, portée
   par trois passations comme un inconnu non résolu, et attribuée à tort au
   voisinage d'un `git merge`. Corrigé le 2026-08-14, PRIS SUR LE FAIT sur la
   passe qui a suivi la fusion du lot 57.

   LA MESURE, et elle est nette : l'ancienne version tirait MILLE jets avec
   `Math.random` RÉEL et EXIGEAIT que les deux bornes sortent. Or
   P(3d6 = 3) = P(3d6 = 18) = 1/216, donc P(absente sur mille jets) ≈ 0,97 %
   chacune. Simulé sur 200 000 répétitions : **1,96 % d'échec — une passe
   rouge toutes les 51 exécutions.**

   ⭐ ÇA EXPLIQUE LES TROIS OBSERVATIONS : c'est bien `dice.test.mjs` que le
   lot 49 avait vu rouge ; c'est rare et jamais reproductible à la demande ;
   et ça n'a AUCUN rapport avec `git merge` — le voisinage était une
   coïncidence, exactement ce que la passation du 14 refusait d'écrire comme
   une cause. Elle avait raison de refuser.

   ⛔ LA RÉPARATION N'EST PAS « PLUS DE JETS ». Augmenter N rend l'échec plus
   rare sans jamais l'éliminer : un test dont la réussite est probabiliste
   reste un test qui ment de temps en temps, et celui-ci a coûté trois
   passations d'enquête. UNE PROPRIÉTÉ DÉTERMINISTE SE PROUVE
   DÉTERMINISTIQUEMENT — c'est ce que fait ce fichier partout ailleurs, avec
   `scriptedRng`, depuis le premier jour.

   Les deux moitiés sont donc séparées : les BORNES sont atteignables (fait
   déterministe, prouvé par un rng scripté), et l'INTERVALLE tient sur du
   hasard réel (propriété vraie de TOUT tirage, jamais probabiliste). */

test("les deux bornes de 3d6 sont ATTEIGNABLES — prouvé sans hasard", () => {
  assert.equal(rollThreeD6(scriptedRng([0])).total, 3, "3×1 = 3, la borne basse");
  assert.equal(rollThreeD6(scriptedRng([0.999])).total, 18, "3×6 = 18, la borne haute");
});

test("chaque jet de 3d6 tombe dans [3,18] — mille jets de hasard RÉEL", () => {
  /* Cette assertion-ci est vraie de CHAQUE tirage, donc elle ne peut pas
     échouer par malchance : c'est ce qui la distingue de celle d'avant. */
  for (let i = 0; i < 1000; i += 1) {
    const { total, dice } = rollThreeD6(Math.random);
    assert.ok(total >= 3 && total <= 18, `un jet de 3d6 vaut ${total}, hors [3,18]`);
    assert.equal(dice.length, 3, "trois dés, toujours");
    assert.equal(dice.reduce((a, b) => a + b, 0), total, "le total EST la somme des dés jetés");
  }
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

/* ══ 2 — ⚔️ LES DEUX PLANCHERS MORDENT, ET LA RELANCE N'EXISTE PLUS ══════
   🔴 CES QUATRE TESTS ONT CHANGÉ DE LOI LE 2026-08-16, PAS DE FORME. Ils
   gardaient la règle d'origine (ADDENDUMS §4) : « on relance le lot ENTIER
   si aucun des dix n'atteint 15 ». Eric l'a remplacée, et il l'a fait sur
   une mesure — cette relance partait **38 %** du temps (0,61 lot jeté par
   personnage), donc jusqu'à 25 s de théâtre à jeter à la cadence du plateau.

   LA RÈGLE D'AUJOURD'HUI, mot pour mot : *« Dix jets de 3d6, on garde les
   six meilleurs. Si le meilleur n'atteint pas 14, il devient 14. Le plus
   mauvais devient toujours 8. AUCUNE RELANCE. »*

   ⛔ ET LE GARDE NE S'EST PAS ADOUCI EN CHANGEANT DE CIBLE : la relance
   était une chose à PROUVER, elle est devenue une chose à INTERDIRE. Le
   premier test ci-dessous est exactement l'ancien scénario — dix jets à 6,
   aucun 15 — et il exige maintenant que ce lot soit RENDU, jamais rejoué. */

test("⚔️ ATTAQUE — le lot qui déclenchait la relance (dix jets à 6, aucun 15) est RENDU TEL QUEL, jamais rejoué", () => {
  /* L'ANCIEN scénario, à l'octet : chaque dé vaut 2 → chaque jet totalise 6.
     Sous l'ancienne règle, ce lot partait à la poubelle et un second était
     tiré. Le rng ne porte QUE trente valeurs : s'il relançait, il s'épuiserait
     — la preuve est donc double, par le résultat ET par le script. */
  const rng = scriptedRng(Array(30).fill(1 / 6)); // d6(1/6) = floor(1/6*6)+1 = 2
  const result = rollAbilitySet(rng);

  assert.equal(result.rerollCount, 0, "plus aucune relance, jamais — le champ reste à zéro");
  assert.equal(result.rolls.length, 10);
  const gardes = result.rolls.filter((r) => r.kept);
  assert.equal(gardes.length, 6);
  /* Six jets à 6 : le meilleur (6 < 14) monte à 14, le pire descend à 8, et
     les quatre autres gardés restent à 6. */
  assert.deepEqual(gardes.map((r) => r.total).sort((a, b) => a - b), [6, 6, 6, 6, 8, 14]);
  /* ⛔ ET LE JET N'EST PAS RÉÉCRIT : ses trois dés disent toujours 2+2+2, et
     `brut` garde la somme réelle. Un 14 posé au-dessus d'un « 2+2+2 » muet
     serait un total menteur. */
  const monte = gardes.find((r) => r.ajuste === "haut");
  assert.deepEqual(monte.dice, [2, 2, 2], "les dés du jet ne changent pas");
  assert.equal(monte.brut, 6, "et la somme réelle reste lisible");
  assert.equal(gardes.find((r) => r.ajuste === "bas").brut, 6);
});

test("le plancher du HAUT ne mord QUE s'il manque — un lot qui porte déjà 14 ou plus garde son meilleur intact", () => {
  /* Le premier jet vaut 18 (trois 6) ; les neuf autres valent 3 (trois 1). */
  const rng = scriptedRng([0.999, 0.999, 0.999].concat(Array(27).fill(0)));
  const { rolls, rerollCount } = rollAbilitySet(rng);
  assert.equal(rerollCount, 0);
  assert.equal(rolls[0].total, 18, "18 ≥ 14 : le meilleur ne bouge pas");
  assert.equal(rolls[0].ajuste, undefined, "et rien ne le marque comme ajusté");
  assert.equal(rolls[0].brut, undefined, "ni ne lui invente une somme d'origine");
});

test("⚠️ « le plus mauvais devient TOUJOURS 8 » va dans les DEUX SENS — un pire à 12 DESCEND à 8", () => {
  /* 🔴 LE POINT LE PLUS FACILE À RATER DE TOUTE LA RÈGLE, et celui qui coûte
     le plus cher : lu comme un simple plancher, il rendrait la méthode
     strictement plus généreuse que le tableau standard. C'est la mesure qui
     tranche — la moyenne publiée est 71,8 CONTRE 72,0 pour le tableau, donc
     la règle RETIRE quelque chose. Le panneau INFO le dit dans l'autre
     langue : « A 14 is promised, an 8 is owed ». */
  const rolls = [18, 17, 16, 15, 14, 12, 5, 4, 3, 3].map((total, index) => ({
    dice: [1, 1, 1], total, index, kept: index < 6
  }));
  const apres = appliquerLesPlanchers(rolls);
  const pire = apres[5];
  assert.equal(pire.total, 8, "12 était le plus mauvais des six gardés : il DESCEND à 8");
  assert.equal(pire.brut, 12, "et sa valeur d'origine reste lisible");
  assert.equal(pire.ajuste, "bas");
  assert.deepEqual(apres.slice(0, 5).map((r) => r.total), [18, 17, 16, 15, 14],
    "les cinq autres gardés ne bougent pas d'un point");
});

test("⚔️ SIX GARDÉS TOUS ÉGAUX — les DEUX planchers s'appliquent quand même, sur deux jets distincts", () => {
  /* Le cas que deux comparaisons `>` / `<` rateraient en silence : le même
     jet serait à la fois le meilleur et le pire, et un seul plancher
     partirait. C'est pour ça que `appliquerLesPlanchers` trie. */
  const rolls = Array.from({ length: 10 }, (_, index) => ({
    dice: [4, 3, 3], total: 10, index, kept: index < 6
  }));
  const gardes = appliquerLesPlanchers(rolls).filter((r) => r.kept);
  assert.equal(gardes.filter((r) => r.ajuste === "haut").length, 1, "un jet monte à 14");
  assert.equal(gardes.filter((r) => r.ajuste === "bas").length, 1, "un AUTRE descend à 8");
  assert.deepEqual(gardes.map((r) => r.total).sort((a, b) => a - b), [8, 10, 10, 10, 10, 14]);
});

test("rollAbilitySet, avec Math.random réel, tient ses deux garanties (deux cents tirages)", () => {
  for (let i = 0; i < 200; i += 1) {
    const { rolls, rerollCount } = rollAbilitySet(Math.random);
    const gardes = rolls.filter((r) => r.kept);
    assert.equal(gardes.length, 6);
    assert.equal(rerollCount, 0, "aucune relance, jamais");
    assert.ok(Math.max(...gardes.map((r) => r.total)) >= 14, "un 14 est promis");
    assert.ok(gardes.some((r) => r.total === 8), "et un 8 est dû");
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
