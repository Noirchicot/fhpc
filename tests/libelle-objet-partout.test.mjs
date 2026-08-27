import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/* ══════════════════════════════════════════════════════════════════════════
   ⛔ « [object Object] » EN PRODUCTION — 2026-08-27, vu par Eric sur son
   iPhone avant d'être vu ici. Depuis le lot 50, un libellé d'item peut être
   un OBJET {mot, sous} (la résolution d'une porte : « High Elf » / lineage).
   La branche PORTE le dépliait ; la tête d'un item réglé et le titre du
   sous-écran le passaient BRUTS à text().

   La leçon : un libellé qui change de forme doit être déplié PARTOUT où il
   s'affiche — et chaque point d'affichage passe par `motDe`, le seul organe
   qui sait lire les deux formes. Ce garde tient le câblage des trois points.
   ══════════════════════════════════════════════════════════════════════════ */

const PARCOURS = readFileSync(new URL("../ui/builder/parcours-ecrans.mjs", import.meta.url), "utf8");
const SHELL = readFileSync(new URL("../ui/builder/shell.mjs", import.meta.url), "utf8");

test("la tête d'un item réglé passe par motDe — jamais le libellé brut", () => {
  assert.match(PARCOURS,
    /"parcours-item-mot", \[text\(motDe\(labelOf \? labelOf\(item\) : item\.path\)\)\]/,
    "parcours-ecrans.mjs : la branche sansChoix/acheve déplie le libellé");
});

test("le titre du sous-écran passe par motDe — jamais l'objet brut", () => {
  assert.match(SHELL,
    /titre: motDe\(cfg\.itemLabel \? cfg\.itemLabel\(item\.path, ctx\) : motDuChemin\(item\.path\)\)/,
    "shell.mjs : renderParcoursItem déplie le titre");
});

test("motDe sait lire les deux formes — la string ET l'objet", async () => {
  const { motDe } = await import("../ui/builder/parcours-ecrans.mjs");
  assert.equal(motDe("Lineage"), "Lineage");
  assert.equal(motDe({ mot: "High Elf", sous: "lineage" }), "High Elf (lineage)");
  assert.equal(motDe({ mot: "Skill budget" }), "Skill budget");
});
