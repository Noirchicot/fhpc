/* LE LIGNAGE SE DÉCLARE, QUELLE QUE SOIT LA FORME DU CHEMIN.

   🔴 L'INCIDENT (2026-09-08, trouvé par Eric sur sa propre fiche) : le moteur
   testait `picked.byPath.has("species.lineage")` — sans indice — pour déclarer
   `underived.lineage-not-composed`. L'écran écrit `species.lineage[0]`, AVEC
   indice. La clef ne correspondait pas, la déclaration ne partait jamais, et le
   choix tombait dans `unconsumed` : la liste des DÉFAUTS, sans sa raison.

   ⭐ Le signal existait et visait à côté. Un garde qui cherche la mauvaise clef
   est plus dangereux qu'un garde absent : il a l'air de veiller. */

import test from "node:test";
import assert from "node:assert/strict";
import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN } from "./build-harness.mjs";

const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN] });
const KEYS = ["str", "dex", "con", "int", "wis", "cha"];

const documentAvec = (choixEnPlus) => ({
  schema: "fh-char/1", id: "lignage", name: "Lignage", lang: "en",
  units: { distance: "ft", weight: "lb" },
  generator: { name: "tests/lignage-deux-formes", version: "1.0.0" },
  created: "2026-09-08T09:00:00Z", modified: "2026-09-08T09:00:00Z",
  build: {
    layers: manifestOf(h.layers),
    choices: [
      { path: "level", value: 1 },
      { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
      { path: "species", ref: { kind: "species", id: "srd:species:en:elf" } },
      ...KEYS.map((k) => ({ path: `abilities.${k}`, value: 12 })),
      ...choixEnPlus
    ],
    budgets: {}, overrides: []
  }
});

const declareLeLignage = (choix) =>
  (h.verbs.rebuild({ document: documentAvec(choix) }).underived || [])
    .some((u) => u && u.key === "underived.lineage-not-composed");

test("la forme INDEXÉE — celle que l'écran écrit — déclare le lignage", () => {
  assert.ok(declareLeLignage([{ path: "species.lineage[0]", value: "high-elf" }]),
    "⛔ `species.lineage[0]` ne déclare pas `underived.lineage-not-composed`. C'est la " +
    "forme que `species-step.mjs` écrit : sans cette déclaration, le choix tombe en " +
    "`unconsumed` — dans les défauts, sans sa raison — et le joueur ne sait pas POURQUOI " +
    "son lignage n'est pas dans son identité.");
});

test("la forme NUE déclare toujours — l'ancienne n'a pas été perdue en réparant", () => {
  assert.ok(declareLeLignage([{ path: "species.lineage", value: "high-elf" }]),
    "⛔ `species.lineage` ne déclare plus : la réparation du 08/09 a cassé le cas qui " +
    "marchait. Une alternative se garde DES DEUX CÔTÉS.");
});

test("le témoin contraire — sans lignage, RIEN ne se déclare", () => {
  /* ⭐ Sans lui, les deux tests ci-dessus resteraient verts si la déclaration
     partait pour TOUS les personnages : un garde qui accuse tout le monde
     n'accuse personne. */
  assert.ok(!declareLeLignage([]),
    "⛔ un personnage SANS choix de lignage déclare quand même " +
    "`underived.lineage-not-composed` : le test s'est élargi jusqu'à ne plus rien dire.");
});
