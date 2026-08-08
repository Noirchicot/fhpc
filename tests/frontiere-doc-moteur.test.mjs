/* ══ LA FRONTIÈRE MOTEUR ↔ CONTRAT (RELECTEUR Adverserial, 2026-08-08) ═

   Un invariant que PERSONNE n'exécutait.

   Le lot 5 a fixé la forme de la provenance d'un dé reçu et l'a explicitement
   LIVRÉE À L'ARCHITECTE (loi §0.10, COUPE-LOT-5.md §8) : « `resolved.
   resources[]` de `fh-char/1` n'a pas ce champ et son `additionalProperties`
   est `false` ». L'architecte a répondu le même jour en ajoutant `origin` au
   schéma — avec un AUTRE vocabulaire. Les deux bouts du transfert existent,
   chacun est testé chez lui, et RIEN ne traverse :

     tests/play-srd-only.test.mjs  asserte la forme du MOTEUR
     tests/schemas.test.mjs        asserte la forme du CONTRAT
     (aucune suite ne compile fh-char/1 contre une sortie de `snapshot()`)

   Quatre divergences sur le même objet, mesurées ci-dessous. Trois sont des
   renommages ; la quatrième est un TROU : `givenAt` — quand le dé a été donné,
   ce dont dépend l'expiration — n'a AUCUNE place dans le contrat.

   ⚠️ CE TEST N'EST PAS UN CORRECTIF. Choisir qui s'aligne sur qui (et où loger
   `givenAt`) est une décision d'architecture, pas de relecture : le RELECTEUR
   s'arrête ici et pose la question (loi §0.10). Ce que le test garantit, c'est
   que la divergence ne peut plus être invisible — le jour où l'un des deux
   bouts bouge, il devient rouge et force la mise à jour de l'autre. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { makeHarness } from "./play-harness.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const charSchema = JSON.parse(readFileSync(join(root, "schemas/fh-char.schema.json"), "utf8"));

/* On compile le SOUS-SCHÉMA de la provenance, pas le document entier : ce qui
   est en cause est cette forme-là, et un rejet sur `origin` doit se lire sans
   le bruit de tout le reste d'un personnage. */
const originSchema = {
  $schema: charSchema.$schema,
  $defs: charSchema.$defs,
  ...charSchema.$defs.resolved.properties.resources.items.properties.origin
};
const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateOrigin = ajv.compile(originSchema);

/** La provenance telle que le MOTEUR l'écrit dans ce qu'il rend au document. */
function engineOrigin() {
  const h = makeHarness({ layers: [] });
  h.verbs.open({ character: { name: "Aldra" }, pseudo: "Aldra" });
  h.verbs.receiveDie({
    schema: "fh-die-gift/1", from: "Lyra", to: "Aldra", timing: "ahead",
    givenAt: "2026-08-08T00:00:00.000Z",
    die: { source: "bardic", sides: 6, label: "Bardic", tint: "violet", kind: "die", count: 1, correction: "bardic" }
  });
  return h.verbs.snapshot().poolResources[0].origin;
}

test("le contrat SAIT décrire une provenance — le sous-schéma n'est pas cassé", () => {
  /* Le témoin : sans lui, une VALIDATION ci-dessous ne prouverait rien de plus
     qu'un rejet ne le faisait (un schéma qui accepte tout « valide » tout). */
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", timing: "advance" }), true,
    ajv.errorsText(validateOrigin.errors));
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic" }), true,
    "une provenance minimale — qui a donné, quelle règle — suffit");
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", timing: "plus tard" }), false,
    "et le contrat refuse toujours une fenêtre inventée : ce témoin-ci mord dans l'autre sens");
});

/* REWRITTEN 2026-08-08 (architecte) — ce fichier épinglait une DIVERGENCE.
   Le RELECTEUR Adverserial l'avait écrit pour que la frontière ne puisse plus
   être invisible, en demandant explicitement qu'on le réécrive à la nouvelle
   vérité le jour où quelqu'un réconcilierait les deux bouts (loi §0.7).
   C'est fait : le moteur dit désormais `window`/`advance` comme le contrat, et
   le contrat a accueilli `givenAt` et `expiresAt: null`. Le test change donc de
   sens — il ne constate plus l'écart, il interdit qu'il revienne. */
test("FRONTIÈRE — la provenance que le moteur PERSISTE valide contre fh-char/1", () => {
  const origin = engineOrigin();

  // Ce que le moteur écrit, aujourd'hui, mot pour mot.
  assert.deepEqual(Object.keys(origin).sort(), ["expiresAt", "from", "givenAt", "source", "timing"]);
  assert.equal(origin.timing, "advance");

  assert.equal(validateOrigin(origin), true,
    "LA POIGNÉE DE MAIN A LIEU POUR DE VRAI : " + ajv.errorsText(validateOrigin.errors));
});

test("FRONTIÈRE — `expiresAt: null` est admis, et il ne veut pas dire la même chose qu'absent", () => {
  /* Le moteur écrit `null` quand le dé ne périme pas. Le contrat l'admet
     EXPLICITEMENT plutôt que d'exiger l'absence : `null` dit « j'ai regardé, il
     n'y en a pas », l'absence dirait « personne n'a regardé ». Les deux sont
     valides, ils ne portent pas la même information. */
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", expiresAt: null }), true,
    ajv.errorsText(validateOrigin.errors));
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic" }), true,
    "l'absence reste valide elle aussi");
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", expires: null }), false,
    "en revanche l'ANCIEN nom est mort : `expires` n'existe plus, il fait paire avec givenAt sous le nom expiresAt");
});

test("FRONTIÈRE — le trou de contrat `givenAt` est bouché, et il porte une vraie date", () => {
  const origin = engineOrigin();
  assert.match(origin.givenAt, /^\d{4}-\d{2}-\d{2}T/, "le moteur horodate le don");
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", givenAt: origin.givenAt }), true,
    ajv.errorsText(validateOrigin.errors));
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", givenAt: "hier" }), false,
    "et le contrat ne prend pas n'importe quoi pour une date — sans quoi expiresAt ne se calcule sur rien");
});
