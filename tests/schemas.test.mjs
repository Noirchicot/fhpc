/* Lot B — fh-char/1 et fh-layer/1.

   Deux obligations : les exemples valident, et chaque invariant a son exemple
   MUTILÉ qui échoue. Un schéma dont on n'a vérifié que les cas nominaux ne
   prouve rien : c'est le rejet qui porte la garantie.

   Les mutilations sont fabriquées ici, à partir d'une copie profonde de
   l'exemple valide, plutôt que commitées comme fichiers cassés — un fichier
   invalide dans examples/ finit toujours par être copié par quelqu'un.

   ajv est une dépendance de DEV (8.20.0, épinglée). Le runtime reste zéro-dép.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import { charInvariantViolations } from "../src/schemas/invariants.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));

const charSchema = read("schemas/fh-char.schema.json");
const layerSchema = read("schemas/fh-layer.schema.json");
const charExample = read("examples/personnage-srd-fr-niveau1.fh-char.json");
const layerExample = read("examples/layer-homebrew-fr.fh-layer.json");

const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateChar = ajv.compile(charSchema);
const validateLayer = ajv.compile(layerSchema);

/* Valide, ou échoue en NOMMANT le premier chemin fautif — un test rouge doit
   dire où, pas seulement non. */
function assertValid(validate, doc, what) {
  const ok = validate(doc);
  assert.equal(ok, true, `${what} devrait valider — ${ajv.errorsText(validate.errors)}`);
}

function assertRejected(validate, doc, what) {
  const ok = validate(doc);
  assert.equal(ok, false, `${what} devrait être REJETÉ et a été accepté.`);
}

test("les deux schémas se compilent en JSON Schema 2020-12 strict", () => {
  assert.equal(charSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(layerSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(typeof validateChar, "function");
  assert.equal(typeof validateLayer, "function");
});

test("l'exemple de personnage SRD niveau 1 valide contre fh-char/1", () => {
  assertValid(validateChar, charExample, "l'exemple de personnage");
});

test("l'exemple de couche homebrew valide contre fh-layer/1", () => {
  assertValid(validateLayer, layerExample, "l'exemple de couche");
});

test("l'exemple de couche exerce les quatre gestes : add, patch, disable, flag", () => {
  const entries = Object.values(layerExample.records).flatMap((genre) => Object.values(genre));
  const ops = entries.map((entry) => entry.op || "add");
  assert.equal(ops.filter((op) => op === "add").length, 3);
  assert.equal(ops.filter((op) => op === "patch").length, 1);
  assert.equal(ops.filter((op) => op === "disable").length, 1);
  assert.equal(layerExample.flags.length, 1);
});

test("le hash de couche du personnage est le SHA-256 réel du fichier de couche", () => {
  const bytes = readFileSync(join(root, "examples/layer-homebrew-fr.fh-layer.json"));
  const digest = createHash("sha256").update(bytes).digest("hex");
  const ref = charExample.build.layers.find((layer) => layer.id === "exemple-homebrew-fr");
  assert.equal(ref.hash, digest, "build.layers[exemple-homebrew-fr].hash a divergé du fichier");
  const derived = charExample.resolved.derivation.stack.find((l) => l.id === "exemple-homebrew-fr");
  assert.equal(derived.hash, digest);
});

/* ---------- fh-char/1 : un cas de rejet par invariant ---------- */

test("REJET — état de séance dans le document (resolved)", () => {
  const doc = clone(charExample);
  doc.resolved.hand = ["attaque-dague"];
  assertRejected(validateChar, doc, "un document portant une main de séance");
});

test("REJET — état de séance dans le document (build)", () => {
  const doc = clone(charExample);
  doc.build.transaction = { open: true };
  assertRejected(validateChar, doc, "un document portant une transaction de jet");
});

test("REJET — clef inconnue à la racine (aucun strip silencieux)", () => {
  const doc = clone(charExample);
  doc.campaign = "n'importe laquelle";
  assertRejected(validateChar, doc, "une clef racine inconnue");
});

test("REJET — override sans path", () => {
  const doc = clone(charExample);
  delete doc.build.overrides[0].path;
  assertRejected(validateChar, doc, "un override sans chemin");
});

test("REJET — override sans auteur (by)", () => {
  const doc = clone(charExample);
  delete doc.build.overrides[0].by;
  assertRejected(validateChar, doc, "un override anonyme");
});

test("REJET — override dont l'auteur n'est ni player ni gm", () => {
  const doc = clone(charExample);
  doc.build.overrides[0].by = "dm";
  assertRejected(validateChar, doc, "un override signé « dm »");
});

test("REJET — override enraciné dans build au lieu de resolved", () => {
  const doc = clone(charExample);
  doc.build.overrides[0].path = "build.layers[srd-5.2.1-fr].version";
  assertRejected(validateChar, doc, "un override visant l'étage des règles");
});

test("REJET — override ciblant une collection par index au lieu d'un id", () => {
  const doc = clone(charExample);
  doc.build.overrides[0].path = "resolved.skills[0].bonus";
  assertRejected(validateChar, doc, "un override adressé par index");
});

test("REJET — valeur d'override porteuse d'une clef de pollution de prototype", () => {
  const doc = clone(charExample);
  // Passage par JSON.parse : un littéral `{__proto__: …}` poserait le prototype
  // au lieu de créer une clef propre, et le document ne contiendrait rien.
  doc.build.overrides[0].value = JSON.parse('{"__proto__":{"polluted":true}}');
  assertRejected(validateChar, doc, "une valeur d'override polluant le prototype");
});

test("REJET — choix portant à la fois ref et value", () => {
  const doc = clone(charExample);
  doc.build.choices[0].value = "elfe";
  assertRejected(validateChar, doc, "un choix ambigu (ref + value)");
});

test("REJET — choix ne portant ni ref ni value", () => {
  const doc = clone(charExample);
  doc.build.choices.push({ path: "class.subclass" });
  assertRejected(validateChar, doc, "un choix vide");
});

test("REJET — référence de choix vers un genre hors des 12", () => {
  const doc = clone(charExample);
  doc.build.choices[0].ref = { kind: "arcana", id: "fh:arcana:fr:ix" };
  assertRejected(validateChar, doc, "une référence vers un genre inconnu");
});

test("REJET — couche du build sans hash", () => {
  const doc = clone(charExample);
  delete doc.build.layers[1].hash;
  assertRejected(validateChar, doc, "une couche sans empreinte");
});

test("REJET — une des six caractéristiques manquante", () => {
  const doc = clone(charExample);
  delete doc.resolved.abilities.cha;
  assertRejected(validateChar, doc, "une fiche à cinq caractéristiques");
});

test("REJET — emplacement de sort de niveau 10", () => {
  const doc = clone(charExample);
  doc.resolved.spellcasting.slots["10"] = { max: 1, current: 1 };
  assertRejected(validateChar, doc, "un emplacement de niveau 10");
});

test("REJET — entrée de craft sans drapeau qui l'active", () => {
  const doc = clone(charExample);
  doc.resolved.craft.push({ id: "forge", name: "Forge" });
  assertRejected(validateChar, doc, "une entrée de craft sans drapeau");
});

test("REJET — ressource comptée sans maximum", () => {
  const doc = clone(charExample);
  delete doc.resolved.resources[0].max;
  assertRejected(validateChar, doc, "une ressource sans maximum");
});

test("ACCEPTÉ — personnage sans incantation (spellcasting: null)", () => {
  const doc = clone(charExample);
  doc.resolved.spellcasting = null;
  assertValid(validateChar, doc, "un personnage non lanceur");
});

/* ---------- fh-layer/1 : un cas de rejet par invariant ---------- */

test("REJET — genre inconnu dans records (faute de frappe acceptée en silence)", () => {
  const layer = clone(layerExample);
  layer.records.spel = {};
  assertRejected(validateLayer, layer, "un genre « spel »");
});

test("REJET — id de record hors convention", () => {
  const layer = clone(layerExample);
  layer.records.gear["lanterne pliante"] = layer.records.gear["exemple:gear:fr:lanterne-pliante"];
  assertRejected(validateLayer, layer, "un id de record avec une espace");
});

test("REJET — patch sans changes", () => {
  const layer = clone(layerExample);
  delete layer.records.weapon["srd:weapon:fr:dague"].changes;
  assertRejected(validateLayer, layer, "un patch sans modification");
});

test("REJET — patch dont un chemin de changes est mal formé", () => {
  const layer = clone(layerExample);
  layer.records.weapon["srd:weapon:fr:dague"].changes = { "data..cost": "3 po" };
  assertRejected(validateLayer, layer, "un chemin de patch mal formé");
});

test("REJET — record mêlant deux opérations", () => {
  const layer = clone(layerExample);
  layer.records.weapon["srd:weapon:fr:dague"].op = "disable";
  assertRejected(validateLayer, layer, "un record à la fois patch et disable");
});

test("REJET — données de record portant une clef exécutable", () => {
  const layer = clone(layerExample);
  layer.records.gear["exemple:gear:fr:lanterne-pliante"].data.script = "alert(1)";
  assertRejected(validateLayer, layer, "un record portant du script");
});

test("REJET — clef de pollution de prototype enfouie dans les données", () => {
  const layer = clone(layerExample);
  layer.records.gear["exemple:gear:fr:lanterne-pliante"].data.effets =
    JSON.parse('{"nuit":{"constructor":{"charge":1}}}');
  assertRejected(validateLayer, layer, "une clef constructor en profondeur");
});

test("REJET — drapeau sans espace de noms", () => {
  const layer = clone(layerExample);
  layer.flags = ["veillee"];
  assertRejected(validateLayer, layer, "un drapeau non espacé");
});

test("REJET — couche sans attribution", () => {
  const layer = clone(layerExample);
  delete layer.attribution;
  assertRejected(validateLayer, layer, "une couche qui ne déclare pas sa licence");
});

test("REJET — couche sans langue", () => {
  const layer = clone(layerExample);
  delete layer.lang;
  assertRejected(validateLayer, layer, "une couche sans langue");
});

test("ACCEPTÉ — add sans op explicite (add est le défaut)", () => {
  const layer = clone(layerExample);
  delete layer.records.gear["exemple:gear:fr:lanterne-pliante"].op;
  assertValid(validateLayer, layer, "un add implicite");
});

/* ---------- invariants hors portée de JSON Schema ---------- */

test("l'exemple de personnage ne viole aucun invariant hors-schéma", () => {
  assert.deepEqual(charInvariantViolations(charExample), []);
});

test("REJET (hors schéma) — deux overrides sur le même chemin", () => {
  const doc = clone(charExample);
  doc.build.overrides.push({ path: doc.build.overrides[0].path, value: 12, by: "player" });
  assertValid(validateChar, doc, "le document (le schéma seul ne voit pas le doublon)");
  const violations = charInvariantViolations(doc);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /build\.overrides.*resolved\.vitals\.hpMax/);
});

test("REJET (hors schéma) — deux choix sur le même chemin", () => {
  const doc = clone(charExample);
  doc.build.choices.push({ path: "class", value: "roublard" });
  const violations = charInvariantViolations(doc);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /build\.choices.*« class »/);
});

test("REJET (hors schéma) — resolved dérivé d'une autre pile que build.layers", () => {
  const doc = clone(charExample);
  doc.resolved.derivation.stack.pop();
  const violations = charInvariantViolations(doc);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /périmé/);
});

test("REJET (hors schéma) — la même couche montée deux fois", () => {
  const doc = clone(charExample);
  doc.build.layers.push(clone(doc.build.layers[1]));
  const violations = charInvariantViolations(doc);
  assert.ok(violations.some((v) => /apparaît deux fois/.test(v)));
});
