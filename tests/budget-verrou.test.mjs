import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/* ══════════════════════════════════════════════════════════════════════════
   ⛔ TROIS NOVICES POUR DEUX POINTS, ET LA PORTE DISAIT « SPENT » — trouvé
   par Eric le 27/08 (« attention, il faut que le texte corresponde aux
   choix faits — tu ne peux qu'en choisir 2 »).

   Le NOYAU faisait tout juste : BUDGET_TIER_COST, la somme, et le verrou
   `skill-budget.overspent` posé sur le plan (decisions.mjs). C'est l'ÉCRAN
   qui l'ignorait : `budgetDepense` testait `answered >= expected` — un
   dépassement passait pour une réponse. La leçon est la loi de la porte
   sous une autre forme : les deux signaux (le verrou du noyau, le mot de
   la porte) ne peuvent pas se contredire.
   ══════════════════════════════════════════════════════════════════════════ */

const SPECIES = readFileSync(new URL("../ui/builder/species-step.mjs", import.meta.url), "utf8");

test("budgetDepense respecte le verrou et exige le compte EXACT", () => {
  const fn = SPECIES.match(/function budgetDepense\(ctx\) \{[\s\S]*?\n\}/);
  assert.ok(fn, "budgetDepense existe");
  assert.match(fn[0], /if \(plan\.lock\) return false;/, "un plan verrouillé n'est jamais « spent »");
  assert.match(fn[0], /Number\(plan\.answered\) === attendu/, "le compte est exact — un dépassement n'est pas une réponse");
  assert.doesNotMatch(fn[0], />= attendu/, "le >= menteur ne revient pas");
});

test("le bilan de la bourse se tait sur un plan verrouillé", () => {
  assert.match(SPECIES, /if \(!budget \|\| budget\.lock\) return null;/,
    "un dépassement n'est pas un acquis — pas de ligne Bound skills sous verrou");
});
