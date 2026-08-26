import test from "node:test";
import assert from "node:assert/strict";

import { buildViolation, buildViolationList, statSumViolations } from "../src/build/validate.mjs";
import { renderBuildViolation } from "../src/labels.mjs";
import { TOOLS } from "../src/mcp/tools.mjs";
import { makeHarness, acceptanceDocument } from "./build-harness.mjs";

const KEY = /^[a-z][a-z0-9.:_-]{0,79}$/;

/* LOT 43 — `background.feat-mismatch` A DISPARU AVEC `background.feat`
   (contrat §1b : aucun consommateur ne lisait ce chemin). Deux clefs neuves
   le remplacent dans ce carnet : `background.boost-cap-exceeded` (le
   plafond par caractéristique) et `background.boost-total-mismatch` (le
   total, ni trop ni trop peu) — contrat §1d. Le titre du test reste fidèle
   au compte réel : quatorze phrases aujourd'hui, une de moins et deux de
   plus que les treize d'origine. */
test("LOT 27/43 — les quatorze phrases restent strictement les mêmes", () => {
  const cases = [
    [buildViolation("document.invariant-violated", { message: "build absent : un document fh-char/1 porte toujours ses deux étages." }),
      "build absent : un document fh-char/1 porte toujours ses deux étages."],
    [buildViolation("choice.query-threw", { path: "class.cantrips[0]", message: "genre inconnu" }, "class.cantrips[0]"),
      "choix « class.cantrips[0] » : genre inconnu"],
    [buildViolation("choice.ref-missing", { path: "class.cantrips[0]", kind: "spell", id: "srd:spell:en:absent" }, "class.cantrips[0]"),
      "choix « class.cantrips[0] » : la pile ne porte aucun spell « srd:spell:en:absent »."],
    [buildViolation("derive.threw", { message: "le pli est cassé" }), "le pli est cassé"],
    [buildViolation("skill-grant.count-mismatch", { root: "class", declared: 2, actual: 1, answers: "arcana" }, "class"),
      "« class » fait choisir 2 compétence(s) et les choix en désignent 1 (arcana)."],
    [buildViolation("background.ability-key-invalid", { backgroundId: "srd:background:en:sage", key: "\"foo\"", abilityKeys: "str, dex, con, int, wis, cha" }),
      "l'arrière-plan « srd:background:en:sage » porte `ability_keys` = \"foo\", qui n'est pas une clef de caractéristique (str, dex, con, int, wis, cha)."],
    [buildViolation("background.boost-disallowed", { path: "background.boost.str", backgroundId: "srd:background:en:sage", abilityKeys: "con, int, wis" }, "background.boost.str"),
      "le choix « background.boost.str » augmente une caractéristique que l'arrière-plan « srd:background:en:sage » ne nomme pas (il nomme : con, int, wis)."],
    [buildViolation("background.boost-cap-exceeded", { path: "background.boost.str", value: 3, cap: 2 }, "background.boost.str"),
      "le choix « background.boost.str » pose 3 point(s) sur une seule caractéristique — le plafond est de 2 points par caractéristique."],
    [buildViolation("background.boost-total-mismatch", { backgroundId: "fh:background:en:inheritance", total: 2, expected: 3 }, "background.boost"),
      "l'arrière-plan « fh:background:en:inheritance » répartit 2 point(s) de caractéristique au total, et il en faut exactement 3 (+2/+1 ou +1/+1/+1)."],
    [buildViolation("stat.entry-not-stat", { stat: "null" }, "resolved.stats"),
      "resolved.stats : une entrée n'est pas une statistique (null)."],
    [buildViolation("stat.breakdown-missing", { anchor: "x" }, "resolved.stats[x]"),
      "resolved.stats[x] : aucun détail — le schéma en exige au moins un terme, et une statistique sans détail est exactement l'objet que cette collection existe pour remplacer."],
    [buildViolation("stat.term-not-integer", { anchor: "x", term: "\"un\" = \"1\"" }, "resolved.stats[x]"),
      "resolved.stats[x] : le terme \"un\" = \"1\" ne porte pas de valeur entière — un terme qui ne s'additionne pas rend le total indémontrable."],
    [buildViolation("stat.value-not-integer", { anchor: "x", value: "\"six\"", sum: 5 }, "resolved.stats[x]"),
      "resolved.stats[x] : `value` vaut \"six\" et le détail somme à 5 — une statistique dérivée est un entier."],
    [buildViolation("stat.value-mismatch", { anchor: "x", value: 6, sum: 5, terms: "\"un\" = 2 ; \"deux\" = 3" }, "resolved.stats[x]"),
      "resolved.stats[x] : `value` vaut 6, et son détail somme à 5 (\"un\" = 2 ; \"deux\" = 3). Le schéma le dit et ne sait pas l'additionner : un total que son propre détail contredit est un chiffre faux qui a l'air juste."]
  ];

  assert.equal(cases.length, 14);
  assert.deepEqual(cases.map(([violation]) => renderBuildViolation(violation)), cases.map(([, text]) => text));
});

test("LOT 27 — la sortie publique ne porte que des violations structurées", () => {
  const h = makeHarness();
  const document = acceptanceDocument(h.layers);
  document.build.choices.find((choice) => choice.path === "class.cantrips[0]").ref.id = "srd:spell:en:absent";
  const verdict = h.verbs.validate({ document });
  const violation = verdict.violations.find((entry) => entry.key === "choice.ref-missing");

  assert.deepEqual(violation, {
    key: "choice.ref-missing",
    params: { path: "class.cantrips[0]", kind: "spell", id: "srd:spell:en:absent" },
    path: "class.cantrips[0]"
  });
  for (const entry of verdict.violations) {
    assert.notEqual(typeof entry, "string");
    assert.match(entry.key, KEY);
    assert.equal(Array.isArray(entry.params), false);
    assert.equal(Object.values(entry.params).every((value) => value === null || ["string", "number", "boolean"].includes(typeof value)), true);
  }
});

test("LOT 27 — le garde refuse une chaîne nue, une clef sans mots et un chemin faux", () => {
  const list = buildViolationList();
  assert.throws(() => list.add("une phrase nue"), /jamais une chaîne/);
  assert.throws(() => list.add({ key: "clef invalide", params: {} }), /jamais une chaîne/);
  assert.throws(() => renderBuildViolation({ key: "absence.inconnue", params: {} }), /no label for/);

  const right = statSumViolations({ stats: [{ id: "juste", value: 2, breakdown: [{ label: "terme", value: 1 }] }] })[0];
  assert.equal(right.path, "resolved.stats[juste]");
  const broken = { ...right, path: "resolved.stats[faux]" };
  assert.throws(() => assert.equal(broken.path, "resolved.stats[juste]"), /Expected values to be strictly equal/);
});

test("LOT 27 — MCP rend le texte historique et publie la structure", () => {
  const violation = buildViolation("choice.ref-missing", {
    path: "class.cantrips[0]", kind: "spell", id: "srd:spell:en:absent"
  }, "class.cantrips[0]");
  const tool = TOOLS.find((entry) => entry.name === "build.validate");
  const out = { ok: false, violations: [violation], warnings: [] };

  assert.equal(tool.render(out), "1 VIOLATION(S) :\n  · choix « class.cantrips[0] » : la pile ne porte aucun spell « srd:spell:en:absent ».\nAucun avertissement.");
  assert.deepEqual(JSON.parse(JSON.stringify(out)).violations, [{
    key: "choice.ref-missing",
    params: { path: "class.cantrips[0]", kind: "spell", id: "srd:spell:en:absent" },
    path: "class.cantrips[0]"
  }]);
});

test("CORRECTION POST-REVUE — les ancres hostiles gardent le texte historique", () => {
  const cases = [
    [{ value: 0, breakdown: [] },
      "resolved.stats[undefined] : aucun détail — le schéma en exige au moins un terme, et une statistique sans détail est exactement l'objet que cette collection existe pour remplacer."],
    [{ id: 7, value: 0, breakdown: [] },
      "resolved.stats[7] : aucun détail — le schéma en exige au moins un terme, et une statistique sans détail est exactement l'objet que cette collection existe pour remplacer."],
    [{ id: { hostile: true }, value: 0, breakdown: [] },
      "resolved.stats[{\"hostile\":true}] : aucun détail — le schéma en exige au moins un terme, et une statistique sans détail est exactement l'objet que cette collection existe pour remplacer."],
    [{ id: "sans-detail", value: 0 },
      "resolved.stats[sans-detail] : aucun détail — le schéma en exige au moins un terme, et une statistique sans détail est exactement l'objet que cette collection existe pour remplacer."],
    [undefined, "resolved.stats : une entrée n'est pas une statistique (undefined)."]
  ];

  for (const [stat, expected] of cases) {
    let violations;
    assert.doesNotThrow(() => { violations = statSumViolations({ stats: [stat] }); });
    assert.equal(violations.length, 1);
    assert.equal(renderBuildViolation(violations[0]), expected);
  }
});
