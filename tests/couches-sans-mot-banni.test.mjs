/* ══ LOT 365 (c) — AUCUNE COUCHE NE PORTE LE MOT BANNI « ADDENDUM » ════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 365 trois retouches.md` (ARCHI 35, 29/09).

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER — relevé par le lot 360 sur v913 :
   `layers/fh-inheritance-en.layer.json` portait, dans ses `reason` et la description de
   l'Inheritance, « addendums §4 (Eric, 2026-08-13) ». Eric a banni le mot (20/08) : ce
   qui dit comment Fate's Hand diverge du SRD s'appelle le CONVERTISSEUR, un dérivé, et la
   source d'une règle est le chapitre du vault qui alimente le site. Le mot citait un
   fichier supprimé depuis, dont la hiérarchie était fausse.
   ⭐ LA CORRECTION EST DANS LA SOURCE (`src/tools/fh-inheritance-source.mjs`), la couche
   est régénérée ; `tests/fh-inheritance.test.mjs` exige déjà l'égalité octet pour octet
   entre la couche et son générateur, donc une retouche à la main rougirait là.
   ⛔ CE GARDE LIT TOUTES LES COUCHES COMMITÉES, pas la seule qu'on a corrigée : un mot
   banni revenu par un autre générateur (ou par une couche écrite à la main) accuse aussi.
   Les citations historiques des commentaires de code ne sont pas des couches : elles ne
   sont pas lues ici. */
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./build-harness.mjs";

const MOT_BANNI = /addendum/i;
const COUCHES = readdirSync(join(ROOT, "layers")).filter((f) => f.endsWith(".layer.json")).sort();

test("(c) ⛔ aucune couche commitée ne porte « addendum », sous aucune casse", () => {
  assert.ok(COUCHES.length >= 15, `témoin : ${COUCHES.length} couches lues — le garde doit toutes les voir`);
  assert.ok(COUCHES.includes("fh-inheritance-en.layer.json"), "témoin : la couche corrigée est dans la liste");
  const heritage = readFileSync(join(ROOT, "layers", "fh-inheritance-en.layer.json"), "utf8");
  assert.match(heritage, /No background record is chosen anymore/, "témoin : le garde lit le texte des raisons");
  const fautives = COUCHES.filter((f) => MOT_BANNI.test(readFileSync(join(ROOT, "layers", f), "utf8")));
  assert.deepEqual(fautives, [], `le mot banni revient dans : ${fautives.join(", ")} — corrige la SOURCE du générateur, puis régénère`);
});
