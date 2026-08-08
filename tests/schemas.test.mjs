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

test("REJET — référence de choix vers un genre hors de l'énumération", () => {
  const doc = clone(charExample);
  /* REWRITTEN 2026-08-08 — le cobaye était `arcana`, et il est devenu LÉGAL
     (révision d'architecte, trou GAP-KIND clos). Garder ce test tel quel
     l'aurait rendu vert pour la mauvaise raison le jour où le schéma aurait
     re-fermé le genre par accident. `boon` prend le rôle : genre FH réel,
     toujours hors de l'énumération. */
  doc.build.choices[0].ref = { kind: "boon", id: "fh:boon:fr:ix" };
  assertRejected(validateChar, doc, "une référence vers un genre inconnu");
});

test("ACCEPTÉ — un personnage DIT quel Arcane il porte, par le mécanisme de choix", () => {
  /* AJOUTÉ 2026-08-08. C'est l'assertion qui démontre ce que la révision du
     genre `arcana` ouvre RÉELLEMENT, et elle valait mieux qu'un commentaire :
     la question « où vit l'Arcane du personnage ? » (QUESTIONS-ARCHITECTE §4,
     ouverte depuis le lot 16) n'appelait AUCUN champ neuf. `$defs/kind` est
     référencé par `build.choices[].ref.kind` ; ouvrir le genre a donc donné
     sa place à la carte, dans la forme exacte que l'espèce, la classe et
     l'historique utilisent déjà. */
  const doc = clone(charExample);
  doc.build.choices.push({
    path: "fh.destiny.arcana",
    ref: { kind: "arcana", id: "fh:arcana:en:the-hermit" },
    label: "The Hermit"
  });
  assert.equal(validateChar(doc), true, ajv.errorsText(validateChar.errors));

  /* Et l'autre moitié : le terme de l'Arcane dans le Score peut CITER sa
     carte. `$defs/kind` gouverne aussi `resolved.stats[].breakdown[].source`,
     sans quoi l'impact serait un nombre nu que rien ne justifierait. */
  const avecScore = clone(charExample);
  avecScore.resolved.stats = [{
    id: "fh:destiny",
    flag: "fh.destiny",
    name: "Destiny Score",
    value: 2,
    breakdown: [
      { label: "The Hermit", value: 2, source: { kind: "arcana", id: "fh:arcana:en:the-hermit" } }
    ]
  }];
  assert.equal(validateChar(avecScore), true, ajv.errorsText(validateChar.errors));
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

/* ---------- les cinq trous bouchés après revue d'architecte ---------- */

test("REJET — notes restées une chaîne unique (l'ancienne forme ne passe plus)", () => {
  const doc = clone(charExample);
  doc.resolved.notes = "Histoire et notes de table écrasées l'une par l'autre.";
  assertRejected(validateChar, doc, "des notes en chaîne unique");
});

test("REJET — note sans texte", () => {
  const doc = clone(charExample);
  delete doc.resolved.notes[0].text;
  assertRejected(validateChar, doc, "une note vide de texte");
});

test("REJET — note au titre vide (un titre vide n'est pas un titre)", () => {
  const doc = clone(charExample);
  doc.resolved.notes[0].title = "";
  assertRejected(validateChar, doc, "une note au titre vide");
});

test("ACCEPTÉ — note sans titre (le cas courant à la table)", () => {
  const doc = clone(charExample);
  assert.equal(Object.hasOwn(doc.resolved.notes[1], "title"), false);
  assertValid(validateChar, doc, "une note sans titre");
});

test("REJET — collection d'outils absente", () => {
  const doc = clone(charExample);
  delete doc.resolved.tools;
  assertRejected(validateChar, doc, "une fiche sans collection d'outils");
});

test("REJET — outil sans caractéristique associée", () => {
  const doc = clone(charExample);
  delete doc.resolved.tools[0].ability;
  assertRejected(validateChar, doc, "un outil sans caractéristique");
});

test("REJET — outil rangé dans une compétence par un champ inventé", () => {
  const doc = clone(charExample);
  doc.resolved.skills.push({
    id: "outil-calligraphe",
    name: "Matériel de calligraphe",
    ability: "dex",
    bonus: 4,
    proficiency: "proficient",
    category: "tool"
  });
  assertRejected(validateChar, doc, "un outil déguisé en compétence");
});

test("REJET — générateur sans version", () => {
  const doc = clone(charExample);
  delete doc.generator.version;
  assertRejected(validateChar, doc, "un générateur anonyme de version");
});

test("ACCEPTÉ — document sans générateur (écrit à la main)", () => {
  const doc = clone(charExample);
  delete doc.generator;
  assertValid(validateChar, doc, "un document sans générateur");
});

test("REJET — lien externe vers un système non énuméré", () => {
  const doc = clone(charExample);
  doc.build.external.roll20 = { characterId: 12 };
  assertRejected(validateChar, doc, "un lien vers un système inconnu");
});

test("REJET — lien D&D Beyond sans identifiant de fiche", () => {
  const doc = clone(charExample);
  delete doc.build.external.ddb.characterId;
  assertRejected(validateChar, doc, "un lien externe sans fiche visée");
});

test("REJET — identifiant externe rattaché à un chemin de choix mal formé", () => {
  const doc = clone(charExample);
  doc.build.external.ddb.entityIds["Background..Feat"] = 4003;
  assertRejected(validateChar, doc, "un id externe sur un chemin mal formé");
});

test("ACCEPTÉ — document sans lien externe", () => {
  const doc = clone(charExample);
  delete doc.build.external;
  assertValid(validateChar, doc, "un document jamais importé");
});

test("REJET — bourse incomplète (une dénomination manquante)", () => {
  const doc = clone(charExample);
  delete doc.resolved.currency.pp;
  assertRejected(validateChar, doc, "une bourse à trois dénominations");
});

test("REJET — bourse négative", () => {
  const doc = clone(charExample);
  doc.resolved.currency.gp = -1;
  assertRejected(validateChar, doc, "une bourse négative");
});

test("REJET — dénomination hors SRD 2024 (l'électrum a disparu)", () => {
  const doc = clone(charExample);
  doc.resolved.currency.ep = 3;
  assertRejected(validateChar, doc, "des pièces d'électrum");
});

test("la charnière du multiclassage lanceur existe et reste facultative", () => {
  // La porte de sortie : `spellcasting` pourra devenir un tableau sans invalider
  // un seul document, et `id`/`name` nomment déjà la source d'incantation.
  assert.equal(charExample.resolved.spellcasting.id, "magicien");
  const doc = clone(charExample);
  delete doc.resolved.spellcasting.id;
  delete doc.resolved.spellcasting.name;
  assertValid(validateChar, doc, "un bloc d'incantation sans identité de source");
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

/* ══ ATTAQUE DU 2026-08-08 (RELECTEUR Adverserial) ═════════════════════
   Les invariants hors-schéma couvraient l'unicité dans `build` — les chemins
   de choix, les chemins d'override, les ids de couche — et PAS celle des ids
   de `resolved`, alors que ce sont eux les ancres que les overrides visent.
   Les quatre mutilations ci-dessous passaient schéma ET invariants. */

test("REJET (hors schéma) — deux compétences portent le même id (ancre d'override ambiguë)", () => {
  const doc = clone(charExample);
  const twin = clone(doc.resolved.skills[0]);
  twin.name = "Homonyme";
  twin.bonus = 9; // une valeur DIFFÉRENTE, et légale : c'est l'ambiguïté qu'on teste, pas la borne
  doc.resolved.skills.push(twin);
  assertValid(validateChar, doc, "le document (le schéma seul ne voit pas le doublon d'ancre)");
  const violations = charInvariantViolations(doc);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /resolved\.skills.*acrobaties.*aucune ne gagne/);
});

test("REJET (hors schéma) — le doublon d'ancre est vu dans TOUTE collection de resolved", () => {
  /* Générique exprès : la prochaine collection ajoutée à `resolved` est
     couverte sans qu'on ait à y penser — c'est ce que le compte en dur d'un
     garde ne sait jamais faire. */
  for (const name of ["resources", "traits", "actions", "gear", "notes", "languages", "senses", "tools", "craft"]) {
    const doc = clone(charExample);
    const collection = doc.resolved[name];
    if (!Array.isArray(collection) || collection.length === 0) continue;
    collection.push(clone(collection[0]));
    const violations = charInvariantViolations(doc);
    assert.ok(violations.some((v) => v.startsWith(`resolved.${name} :`)),
      `un id dupliqué dans resolved.${name} doit être NOMMÉ`);
  }
});

test("un id absent n'est pas un doublon — deux entrées sans id ne s'accusent pas l'une l'autre", () => {
  /* Le pendant du rejet : `duplicates` ne compte que les chaînes, donc deux
     entrées d'une collection facultative sans id restent silencieuses. Sans
     ce test, durcir l'unicité aurait pu rendre tout document ordinaire
     fautif. */
  const doc = clone(charExample);
  doc.resolved.notes = [{ text: "une" }, { text: "deux" }];
  assert.deepEqual(charInvariantViolations(doc), []);
});

test("un document mutilé fait dire une VIOLATION, jamais planter le validateur", () => {
  /* Mesuré le 2026-08-08 : `build.layers: [null]` avec un `stack` présent
     sortait en TypeError — un validateur qui plante sur une entrée hostile ne
     valide pas cette entrée, et c'est une entrée hostile qu'on lui donne. */
  const hostile = {
    build: { layers: [null], choices: [], budgets: {}, overrides: [] },
    resolved: { derivation: { stack: [{ id: "srd", version: "5.2.1", hash: "abc" }] } }
  };
  let violations;
  assert.doesNotThrow(() => { violations = charInvariantViolations(hostile); });
  assert.ok(violations.some((v) => /périmé/.test(v)), "et la divergence de pile est bien celle qui est nommée");

  assert.deepEqual(charInvariantViolations(null), ["build absent : un document fh-char/1 porte toujours ses deux étages."]);
  assert.doesNotThrow(() => charInvariantViolations({ build: {}, resolved: "pas un objet" }));
});

/* ══ RÉVISION DES SCHÉMAS DU 2026-08-08 (architecte) ═══════════════════
   Cinq ajouts, chacun avec son accept ET son rejet — un champ qu'on n'a
   vérifié qu'en acceptation ne prouve rien, c'est le rejet qui porte la
   garantie (même discipline que le lot 2, ci-dessus).

   Provenance : genres 13 et 14 du lot `6-srd-tables` ; les trois manques
   relevés par le conseiller VTT ; la décision d'Eric sur le don de dé ; et
   deux trous trouvés à la revue — la collision `spell_slots` et la nature
   de `fh.exhaustion`. */

test("genres 13 et 14 — une couche peut porter `skill` et `class-progression`", () => {
  const layer = clone(layerExample);
  const record = clone(Object.values(layer.records[Object.keys(layer.records)[0]])[0]);
  layer.records.skill = { "srd:skill:fr:athletisme": record };
  layer.records["class-progression"] = { "srd:class-progression:fr:magicien": clone(record) };
  assertValid(validateLayer, layer, "les deux genres neufs sont acceptés");
});

test("REJET — un genre inconnu reste un rejet bruyant", () => {
  const layer = clone(layerExample);
  layer.records.skil = {};
  assertRejected(validateLayer, layer, "`skil` n'entre pas en silence sous prétexte que `skill` existe");
});

test("valeurs de règle — une couche peut remplacer un NOMBRE, pas seulement lever un drapeau", () => {
  const layer = clone(layerExample);
  layer.ruleValues = { "fh.exhaustion": -1, "fh.destiny": true };
  assertValid(validateLayer, layer, "un nombre et un booléen sont les deux seules formes");
});

test("REJET — une valeur de règle n'est ni du texte ni un objet", () => {
  /* Du texte ici serait un mot affichable au milieu d'un réglage moteur
     (loi §0.13) ; un objet rouvrirait la porte à une mécanique transportée
     par une couche, ce que la décision Q4 ferme. */
  const bad = clone(layerExample);
  bad.ruleValues = { "fh.exhaustion": "moins un" };
  assertRejected(validateLayer, bad, "une valeur de règle textuelle est refusée");
  const worse = clone(layerExample);
  worse.ruleValues = { "fh.exhaustion": { par: "degre", valeur: -1 } };
  assertRejected(validateLayer, worse, "un objet est refusé");
  const unnamed = clone(layerExample);
  unnamed.ruleValues = { exhaustion: -1 };
  assertRejected(validateLayer, unnamed, "une clef sans préfixe de couche est refusée");
});

test("don de dé — une ressource reçue porte sa provenance", () => {
  const doc = clone(charExample);
  doc.resolved.resources.push({
    id: "bardic-recu", name: "Inspiration bardique", max: 1, current: 1,
    origin: { from: "Ellora", source: "bardic-inspiration", timing: "advance" }
  });
  assertValid(validateChar, doc, "le receveur détient un dé qui dit d'où il vient");
});

test("REJET — une provenance sans donneur, et une fenêtre inventée", () => {
  const orphan = clone(charExample);
  orphan.resolved.resources.push({
    id: "orphelin", name: "Dé sans père", max: 1, current: 1,
    origin: { source: "bardic-inspiration" }
  });
  assertRejected(validateChar, orphan, "un dé reçu de personne n'est pas un dé reçu");

  const bogus = clone(charExample);
  bogus.resolved.resources.push({
    id: "fenetre", name: "Dé", max: 1, current: 1,
    origin: { from: "Ellora", source: "bardic-inspiration", window: "plus tard" }
  });
  assertRejected(validateChar, bogus, "« à l'avance » et « en réaction » sont les deux seules portes");
});

test("magie de pacte — les emplacements peuvent revenir sur un repos COURT", () => {
  /* Trouvé en revue du lot 6 : sans ce champ, un occultiste correctement
     dérivé ne récupérerait jamais ses emplacements. */
  const doc = clone(charExample);
  doc.resolved.spellcasting = {
    ability: "cha", dc: 13, attackBonus: 5, slotsRecharge: "short",
    slots: { 1: { max: 1, current: 1 } }, spells: []
  };
  assertValid(validateChar, doc, "un occultiste niveau 1 s'écrit");
});

test("REJET — une recharge d'emplacements qui n'existe pas dans les règles", () => {
  const doc = clone(charExample);
  doc.resolved.spellcasting = {
    ability: "cha", dc: 13, attackBonus: 5, slotsRecharge: "day",
    slots: { 1: { max: 1, current: 1 } }, spells: []
  };
  assertRejected(validateChar, doc, "`day` vaut pour une ressource, jamais pour des emplacements");
});

test("interopérabilité VTT — taille, type de créature, portrait et jeton", () => {
  const doc = clone(charExample);
  doc.resolved.identity.size = "large";
  doc.resolved.identity.creatureType = "humanoïde";
  doc.resolved.identity.portrait = { portraitUrl: "https://x/buste.png", tokenUrl: "https://x/pion.png" };
  assertValid(validateChar, doc, "Foundry et Owlbear ont de quoi poser un pion à la bonne échelle");
});

test("REJET — une taille inventée, et des octets d'image dans le document", () => {
  const size = clone(charExample);
  size.resolved.identity.size = "enormous";
  assertRejected(validateChar, size, "les six tailles du SRD, pas une septième");

  const bytes = clone(charExample);
  bytes.resolved.identity.portrait = { portraitUrl: "https://x/a.png", data: "iVBORw0KGgo=" };
  assertRejected(validateChar, bytes, "un portrait est une RÉFÉRENCE — un document qu'on s'échange ne grossit pas sans limite");
});

test("une action peut nommer l'objet qui la porte — et l'ancre reste un slug", () => {
  const doc = clone(charExample);
  /* Pas de `if` ici : un test qui se saute quand la fixture change est un
     garde creux, et un garde creux est pire que pas de garde. */
  assert.ok(doc.resolved.actions.length > 0, "l'exemple porte des actions — sinon ce test ne prouve rien");
  const action = doc.resolved.actions[0];
  action.gearId = "epee-longue";
  assertValid(validateChar, doc, "désarmer un personnage peut enfin retirer une attaque");
  action.gearId = "Épée Longue !!";
  assertRejected(validateChar, doc, "une ancre est un identifiant machine, pas un libellé");
});
