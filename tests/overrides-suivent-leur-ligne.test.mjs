/* ══ LES OVERRIDES SUIVENT LEUR LIGNE — lot 306 ═════════════════════════════

   🔴 LES DEUX DÉFAUTS SIGNALÉS PAR LE LOT 296 :
     1. retirer `gear[N]` laissait derrière lui les overrides ancrés sur CETTE ligne ;
     2. retirer la ligne à l'id NU (`dagger`) fait monter la suivante à l'id nu : un override
        sur `dagger:gear-M` devenait orphelin (`rebuild` JETAIT, plus de fiche) — et celui qui
        visait la ligne retirée aurait mordu EN SILENCE sur la suivante.

   ⚖️ LA RÈGLE (architecte, 26/09) : retirer une ligne efface les overrides dont l'ancre la
   désigne (son id AVANT le retrait) ; ceux d'une ligne promue sont ré-ancrés sur son nouvel
   id. Un seul écrivain : `retirerLaLigne` → `overridesApresRetrait` (`ancre-de-ligne.mjs`).

   ⭐ CES GARDES REJOUENT LE VRAI ORGANE (`retirerLaLigne`) SUR LES VRAIS VERBES, et jugent par
   la DONNÉE : la liste `build.overrides` entière, ce que `rebuild` rend, ligne par ligne.
   La fixture porte déjà deux overrides NON CONCERNÉS (`vitals.hpMax`, `gear[torch].quantity`) :
   ils sont les témoins de « rien d'autre ne bouge ».
   📏 Éprouvés ROUGES sur le moteur de `main` (v847) et par mutation — voir le rapport du lot. */
import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { charInvariantViolations } from "../src/schemas/invariants.mjs";

globalThis.document = createTestDocument();
const { nextGearIndex, retirerLaLigne } = await import("../ui/builder/equipment-step.mjs");

const fixture = exempleFhEn();
const { build, layers } = fixture;
const query = layers.verbs.query;
const verbs = build.verbs;
const rebuild = (document) => verbs.rebuild({ document });
const DAGUE = { kind: "weapon", id: "srd:weapon:en:dagger" };

/** Pose une ligne comme `addGearLine` (recette comprise). */
function poser(doc, ref, champs = []) {
  const index = nextGearIndex(doc);
  doc = verbs.choose({ document: doc, path: `gear[${index}]`, ref }).document;
  doc = verbs.set({ document: doc, path: `gear[${index}].quantity`, value: 1 }).document;
  doc = verbs.set({ document: doc, path: `gear[${index}].equipped`, value: false }).document;
  for (const [suffixe, v] of champs) doc = verbs.set({ document: doc, path: `gear[${index}]${suffixe}`, value: v }).document;
  return { doc, index };
}
const surcharger = (doc, path, value, by = "gm") => verbs.override({ document: doc, path, value, by }).document;
const retirer = (doc, index) => retirerLaLigne({ document: doc, verbs, query, index });
const ligneDe = (r, name) => r.resolved.gear.find((g) => g.name === name);
/** Les overrides que la fixture porte déjà : AUCUN ne vise une dague. */
const TEMOINS = structuredClone(fixture.document.build.overrides);

/** Deux dagues : `gear[0]` (la dague d'Ilyra, id nu `dagger`) et une dague +1 (`dagger:gear-8`),
 *  un override de quantité sur chacune — posés ENTRE les témoins, pour éprouver l'ordre. */
function deuxDagues() {
  const plusUn = poser(fixture.document, DAGUE, [[".bonus", "+1"]]);
  let doc = surcharger(plusUn.doc, "resolved.gear[dagger].quantity", 5);
  doc = surcharger(doc, `resolved.gear[dagger:gear-${plusUn.index}].quantity`, 3, "player");
  doc = surcharger(doc, "resolved.gear[quarterstaff].quantity", 2);
  const r = rebuild(doc);
  assert.deepEqual([ligneDe(r, "Dagger").id, ligneDe(r, "Dagger").quantity], ["dagger", 5], "témoin : l'override de la 1ʳᵉ mord");
  assert.deepEqual([ligneDe(r, "Dagger +1").id, ligneDe(r, "Dagger +1").quantity], [`dagger:gear-${plusUn.index}`, 3],
    "témoin : l'override de la 2ᵉ mord");
  return { doc, second: plusUn.index };
}

test("306 · 1 — 🔴 ON RETIRE LA PREMIÈRE DAGUE : son override part, celui de la seconde la SUIT sous `dagger`", () => {
  const { doc } = deuxDagues();
  const apres = retirer(doc, 0);
  assert.deepEqual(apres.build.overrides, [
    ...TEMOINS,
    { path: "resolved.gear[dagger].quantity", value: 3, by: "player" },
    { path: "resolved.gear[quarterstaff].quantity", value: 2, by: "gm" }
  ], "⭐ l'override de la ligne retirée (5) a disparu ; celui de la +1 est ré-ancré, À SA PLACE dans la liste");
  const r = rebuild(apres); // ⛔ avant ce lot : « l'override … vise … que la dérivation n'a pas produit »
  const promue = ligneDe(r, "Dagger +1");
  assert.deepEqual([promue.id, promue.quantity], ["dagger", 3], "la +1 porte l'id nu, et SON override (3), pas celui de la dague retirée (5)");
  assert.equal(ligneDe(r, "Dagger"), undefined, "la dague retirée est partie");
  assert.deepEqual(charInvariantViolations(r.document), []);
});

test("306 · 2 — ON RETIRE LA SECONDE DAGUE : son override part, celui de la première reste intact", () => {
  const { doc, second } = deuxDagues();
  const apres = retirer(doc, second);
  assert.deepEqual(apres.build.overrides, [
    ...TEMOINS,
    { path: "resolved.gear[dagger].quantity", value: 5, by: "gm" },
    { path: "resolved.gear[quarterstaff].quantity", value: 2, by: "gm" }
  ]);
  const r = rebuild(apres);
  assert.deepEqual([ligneDe(r, "Dagger").id, ligneDe(r, "Dagger").quantity], ["dagger", 5]);
  assert.equal(ligneDe(r, "Dagger +1"), undefined);
});

test("306 · 3 — UNE LIGNE SANS DOUBLON, SURCHARGÉE, RETIRÉE : l'override part et `rebuild` passe", () => {
  /* la fixture surcharge `resolved.gear[torch].quantity` ; la torche est `gear[7]`, seule de son record */
  assert.equal(rebuild(fixture.document).resolved.gear.find((g) => g.id === "torch").quantity, 4, "témoin : l'override mord");
  const apres = retirer(fixture.document, 7);
  assert.deepEqual(apres.build.overrides, TEMOINS.filter((o) => !o.path.startsWith("resolved.gear[torch]")),
    "⛔ l'override de la torche ne survit pas à la torche");
  const r = rebuild(apres); // ⛔ avant ce lot : orphelin, `rebuild` jetait
  assert.equal(r.resolved.gear.some((g) => /^torch/.test(g.id)), false);
  assert.deepEqual(charInvariantViolations(r.document), []);
});

test("306 · 4 — ⚔️ AUCUN OVERRIDE D'UNE LIGNE NON CONCERNÉE NE BOUGE — trois dagues, on retire la première", () => {
  /* ⭐ trois lignes du même record : retirer l'id nu promeut la 2ᵉ (`:gear-8` → `dagger`), et la 3ᵉ
     (`:gear-9`) ne change PAS d'ancre — son override ne doit pas bouger d'un caractère. */
  const plusUn = poser(fixture.document, DAGUE, [[".bonus", "+1"]]);
  const plusDeux = poser(plusUn.doc, DAGUE, [[".bonus", "+2"]]);
  let doc = surcharger(plusDeux.doc, `resolved.gear[dagger:gear-${plusDeux.index}].quantity`, 7);
  doc = surcharger(doc, "resolved.gear[dagger].quantity", 5);
  doc = surcharger(doc, `resolved.gear[dagger:gear-${plusUn.index}].quantity`, 3);
  const apres = retirer(doc, 0);
  assert.deepEqual(apres.build.overrides, [
    ...TEMOINS,
    { path: `resolved.gear[dagger:gear-${plusDeux.index}].quantity`, value: 7, by: "gm" },
    { path: "resolved.gear[dagger].quantity", value: 3, by: "gm" }
  ], "la 3ᵉ garde son override, à sa place ; la 2ᵉ est ré-ancrée ; celui de la 1ʳᵉ est parti");
  const r = rebuild(apres);
  assert.deepEqual(["Dagger +1", "Dagger +2"].map((n) => [ligneDe(r, n).id, ligneDe(r, n).quantity]),
    [["dagger", 3], [`dagger:gear-${plusDeux.index}`, 7]]);
  /* ⭐ et une ligne sans override, retirée, laisse la liste IDENTIQUE — le même document de verbes */
  const sansOverride = retirer(fixture.document, 2);
  assert.deepEqual(sansOverride.build.overrides, TEMOINS, "retirer le livre ne touche à aucun override");
});
