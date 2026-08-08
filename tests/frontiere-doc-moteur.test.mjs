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
  /* Le témoin : la forme que l'architecte a écrite passe. Sans lui, un rejet
     ci-dessous ne prouverait rien (un schéma qui refuse tout « détecte » tout). */
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", window: "advance" }), true,
    ajv.errorsText(validateOrigin.errors));
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", window: "reaction", expires: "2026-08-08T01:00:00.000Z" }), true,
    ajv.errorsText(validateOrigin.errors));
});

test("FRONTIÈRE — la provenance que le moteur PERSISTE ne valide PAS contre fh-char/1", () => {
  const origin = engineOrigin();

  // Ce que le moteur écrit, aujourd'hui, mot pour mot.
  assert.deepEqual(Object.keys(origin).sort(), ["expiresAt", "from", "givenAt", "source", "timing"]);
  assert.equal(origin.timing, "ahead");

  const ok = validateOrigin(origin);
  assert.equal(ok, false,
    "si ce test devient rouge ICI, c'est que quelqu'un a réconcilié les deux bouts : réécrire ce fichier à la nouvelle vérité (loi §0.7), ne pas le supprimer");

  /* Les quatre divergences, nommées une à une — un « ça ne valide pas » global
     ne dirait pas QUOI réconcilier. */
  const rejected = new Set(validateOrigin.errors.map((e) => e.params.additionalProperty).filter(Boolean));
  assert.ok(rejected.has("timing"), "le moteur dit `timing`, le contrat dit `window`");
  assert.ok(rejected.has("expiresAt"), "le moteur dit `expiresAt`, le contrat dit `expires`");
  assert.ok(rejected.has("givenAt"),
    "TROU DE CONTRAT — `givenAt` n'a aucun champ d'accueil dans fh-char/1 : c'est la seule des quatre qui ne se règle pas par un renommage (question ouverte à l'architecte)");

  // Et la valeur elle-même n'est pas dans l'énumération du contrat.
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", window: origin.timing }), false,
    "le moteur dit `ahead`, le contrat énumère `advance` | `reaction`");
});

test("FRONTIÈRE — `expiresAt: null` ne passe pas non plus, même une fois renommé", () => {
  /* Le moteur écrit `null` quand le dé ne périme pas ; le contrat exprime la
     même chose par l'ABSENCE du champ (`$comment` : « Quand elle est absente,
     le dé ne périme pas de lui-même »). Deux façons de dire « pas
     d'échéance » : c'est la cinquième chose à trancher, et la moins visible. */
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic", expires: null }), false);
  assert.equal(validateOrigin({ from: "Lyra", source: "bardic" }), true,
    "l'absence est la façon dont le contrat dit « pas d'échéance »");
});
