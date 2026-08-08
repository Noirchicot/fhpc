/* Lot 7 — LA PORTE D'ENTRÉE D'UNE COUCHE.

   Deux obligations, reprises de la discipline du lot 2 : la vraie matière
   entre, et chaque refus a son cas MUTILÉ qui échoue. « Un schéma dont on n'a
   vérifié que les cas nominaux ne prouve rien : c'est le rejet qui porte la
   garantie » — ici c'est un validateur en code, la règle ne change pas.

   ET LE GARDE DE DÉRIVE. `ajv` est une dépendance de DÉV : le schéma n'est pas
   là au chargement, donc `src/layers/document.mjs` en est l'exécution. Deux
   copies d'une même règle divergent toujours — sauf si quelque chose les
   compare. C'est ce que fait la dernière section, en lisant le fichier de
   schéma sur le disque. */

import test from "node:test";
import assert from "node:assert/strict";

import {
  readLayer, assertLayerShape, sha256, GENRES, FORBIDDEN_KEYS, PATTERNS, PATCH_KEYS
} from "../src/layers/document.mjs";
import { parseChangePath } from "../src/layers/paths.mjs";
import { aLayer, anAdd, fileBytes, readJson, HOMEBREW, SRD_FR } from "./layers-harness.mjs";

const clone = (value) => JSON.parse(JSON.stringify(value));

/* Jette-t-il, et le message NOMME-t-il la chose ? Un rejet muet et un rejet
   qui oblige à deviner coûtent le même prix à qui le reçoit. */
function rejects(fn, needle, what) {
  let caught = null;
  try { fn(); } catch (error) { caught = error; }
  assert.ok(caught, `${what} devrait être REJETÉ et a été accepté.`);
  assert.match(caught.message, needle, `${what} : le refus doit nommer la chose (message : ${caught.message})`);
  return caught;
}

/* ── la vraie matière entre ─────────────────────────────────────────── */

test("les deux couches SRD et la couche d'exemple entrent, et leur empreinte est celle des octets", () => {
  for (const rel of [SRD_FR, HOMEBREW]) {
    const raw = fileBytes(rel);
    const read = readLayer(raw, rel);
    assert.equal(read.hash, sha256(raw));
    assert.match(read.hash, PATTERNS.sha256);
    assert.equal(read.document.schema, "fh-layer/1");
    assert.ok(read.total > 0, `${rel} porte des records`);
  }
});

test("l'empreinte rendue est CELLE que le personnage d'exemple transporte déjà", () => {
  /* Le pont avec le lot 2 : `build.layers[].hash` est le SHA-256 du fichier de
     couche, et c'est ce bloc qui le calcule au chargement (schéma fh-char/1).
     Si les deux ne tombaient pas d'accord, l'un des deux mentirait. */
  const read = readLayer(fileBytes(HOMEBREW), HOMEBREW);
  const doc = readJson("examples/personnage-srd-fr-niveau1.fh-char.json");
  const ref = doc.build.layers.find((layer) => layer.id === "exemple-homebrew-fr");
  assert.equal(read.hash, ref.hash);
});

test("une chaîne UTF-8 vaut ses octets ; un document déjà analysé est refusé", () => {
  const layer = aLayer();
  const text = JSON.stringify(layer);
  assert.equal(readLayer(text, "t").hash, sha256(Buffer.from(text, "utf8")));
  rejects(() => readLayer(layer, "t"), /OCTETS/, "une couche donnée en objet");
  rejects(() => readLayer(42, "t"), /OCTETS/, "une couche donnée en nombre");
});

/* ── le refus des clefs dangereuses, ATTAQUÉ ────────────────────────── */

test("ATTAQUE — `__proto__` enfoui dans un record est refusé AVANT d'exister", () => {
  /* Le texte est fabriqué à la main : un littéral `{__proto__: …}` poserait le
     prototype au lieu de créer une clef, et l'attaque n'aurait pas lieu. */
  const layer = aLayer({ records: { gear: { "t:gear:fr:x": anAdd("X", { a: 1 }) } } });
  const text = JSON.stringify(layer).replace('"a":1', '"a":{"__proto__":{"pollue":true}}');
  rejects(() => readLayer(text, "attaque"), /__proto__/, "une couche portant __proto__");
  assert.equal({}.pollue, undefined, "et rien n'a été pollué au passage");
});

test("ATTAQUE — chacune des dix clefs interdites est refusée, où qu'elle soit", () => {
  for (const key of FORBIDDEN_KEYS) {
    const text = JSON.stringify(aLayer({
      records: { gear: { "t:gear:fr:x": anAdd("X", { a: 1 }) } }
    })).replace('"a":1', `"a":{"nid":{${JSON.stringify(key)}:1}}`);
    rejects(() => readLayer(text, "attaque"), new RegExp(key.replace(/[$_]/g, "\\$&")),
      `une couche portant « ${key} » en profondeur`);
  }
});

test("ATTAQUE — la clef interdite passée par le CHEMIN d'un patch est refusée elle aussi", () => {
  /* Le trou que cette attaque a trouvé : la grammaire de chemin du schéma
     n'énumère que des identifiants, donc `data.constructor` est un chemin
     PARFAITEMENT VALIDE pour elle. Le reviver ne le voit pas non plus — c'est
     une chaîne, pas une clef. Le refus ne pouvait donc vivre qu'au moment où
     le chemin est lu, et c'est là qu'il est. */
  assert.match(PATTERNS.changePath.source, /a-zA-Z/, "la grammaire laisse bien passer un tel identifiant");
  assert.equal(PATTERNS.changePath.test("data.constructor"), true, "le schéma seul ne le refuserait pas");
  rejects(() => parseChangePath("data.constructor", "attaque"), /constructor/, "un patch visant data.constructor");
  rejects(() => parseChangePath("data.__proto__.x", "attaque"), /__proto__/, "un patch traversant __proto__");
  assert.deepEqual(parseChangePath("data.cost"), [
    { kind: "name", value: "data" }, { kind: "name", value: "cost" }
  ], "et un chemin honnête se lit toujours");
});

/* ── les listes fermées, ATTAQUÉES ──────────────────────────────────── */

test("ATTAQUE — une clef inconnue n'est jamais ignorée en silence", () => {
  rejects(() => assertLayerShape(aLayer({ campagne: "n'importe laquelle" }), "t"),
    /campagne/, "une clef racine inconnue");
  rejects(() => assertLayerShape(aLayer({
    records: { gear: { "t:gear:fr:x": { name: "X", data: {}, prix: 3 } } }
  }), "t"), /prix/, "une clef inconnue dans un add");
  rejects(() => assertLayerShape(aLayer({
    records: { gear: { "t:gear:fr:x": { op: "disable", pourquoi: "…" } } }
  }), "t"), /pourquoi/, "une clef inconnue dans un disable");
});

test("ATTAQUE — un genre inconnu, et le presque-genre qui ressemble au vrai", () => {
  rejects(() => assertLayerShape(aLayer({ records: { spel: {} } }), "t"), /spel/, "le genre « spel »");
  rejects(() => assertLayerShape(aLayer({ records: { skil: {} } }), "t"), /skil/,
    "« skil » n'entre pas en silence sous prétexte que « skill » existe");
  /* Et les 14 vrais passent — un garde qui refuse tout est aussi faux qu'un
     garde qui accepte tout. */
  const records = {};
  for (const genre of GENRES) records[genre] = {};
  assert.doesNotThrow(() => assertLayerShape(aLayer({ records }), "t"));
});

test("ATTAQUE — les trois opérations, et rien d'autre", () => {
  rejects(() => assertLayerShape(aLayer({
    records: { gear: { "t:gear:fr:x": { op: "remove" } } }
  }), "t"), /add, patch et disable/, "une quatrième opération");
  rejects(() => assertLayerShape(aLayer({
    records: { gear: { "t:gear:fr:x": { op: "patch", changes: {} } } }
  }), "t"), /vide/, "un patch qui ne change rien");
  rejects(() => assertLayerShape(aLayer({
    records: { gear: { "t:gear:fr:x": { op: "patch", changes: { "data..cost": 1 } } } }
  }), "t"), /mal formé/, "un chemin de patch mal formé");
  rejects(() => assertLayerShape(aLayer({
    records: { gear: { "t:gear:fr:x": { name: "X" } } }
  }), "t"), /data/, "un add sans contenu");
});

test("ATTAQUE — les identités : id de couche, id de record, langue, drapeau", () => {
  rejects(() => assertLayerShape(aLayer({ id: "Ma Couche" }), "t"), /id/, "un id de couche avec une espace");
  rejects(() => assertLayerShape(aLayer({ lang: "français" }), "t"), /lang/, "une langue en toutes lettres");
  rejects(() => assertLayerShape(aLayer({ flags: ["veillee"] }), "t"), /drapeau/, "un drapeau sans espace de noms");
  rejects(() => assertLayerShape(aLayer({
    records: { gear: { "lanterne pliante": anAdd("X") } }
  }), "t"), /id de record/, "un id de record avec une espace");
  const noLicense = aLayer();
  delete noLicense.attribution;
  rejects(() => assertLayerShape(noLicense, "t"), /attribution/, "une couche qui ne déclare pas sa licence");
});

test("ATTAQUE — une valeur de règle n'est ni du texte ni un objet", () => {
  assert.doesNotThrow(() => assertLayerShape(aLayer({ ruleValues: { "fh.exhaustion": -1, "fh.destiny": true } }), "t"));
  rejects(() => assertLayerShape(aLayer({ ruleValues: { "fh.exhaustion": "moins un" } }), "t"),
    /nombre ou un booléen/, "une valeur de règle textuelle");
  rejects(() => assertLayerShape(aLayer({ ruleValues: { "fh.exhaustion": { par: "degre" } } }), "t"),
    /nombre ou un booléen/, "une valeur de règle en objet");
  rejects(() => assertLayerShape(aLayer({ ruleValues: { exhaustion: -1 } }), "t"),
    /clef de règle/, "une clef de règle sans espace de noms");
});

test("un JSON illisible est une erreur nommée, pas un document vide", () => {
  rejects(() => readLayer("{ pas du json", "t"), /JSON illisible/, "des octets qui ne sont pas du JSON");
  rejects(() => readLayer("[]", "t"), /objet fh-layer\/1/, "un tableau à la racine");
  rejects(() => readLayer(JSON.stringify({ schema: "fh-layer/2" }), "t"), /fh-layer\/1/, "un schéma d'une autre version");
});

/* ── LE GARDE DE DÉRIVE : le code contre le schéma ──────────────────── */

/* Pur, exporté à l'attaque : il rend la liste des écarts au lieu d'assener un
   booléen. Un garde qu'on ne peut pas faire mentir n'a jamais été éprouvé. */
function drift(runtime, fromSchema) {
  const gaps = [];
  for (const [what, [mine, theirs]] of Object.entries(runtime)) {
    const a = JSON.stringify(mine);
    const b = JSON.stringify(fromSchema[what] === undefined ? theirs : fromSchema[what]);
    if (a !== b) gaps.push(`${what} : le code dit ${a}, le schéma dit ${b}`);
  }
  return gaps;
}

test("aucune dérive entre le validateur en code et fh-layer.schema.json", () => {
  const schema = readJson("schemas/fh-layer.schema.json");
  const schemaGenres = Object.keys(schema.properties.records.properties);
  /* `safeKey` s'écrit en négatif dans le schéma : `not: {pattern: "^(a|b|…)$"}`. */
  const safeKey = schema.$defs.safeKey.not.pattern.replace(/^\^\(|\)\$$/g, "").split("|");
  const pairs = {
    "les 14 genres": [GENRES, schemaGenres],
    "les clefs interdites": [FORBIDDEN_KEYS, safeKey],
    "le chemin d'un patch": [PATTERNS.changePath.source, schema.$defs.opPatch.properties.changes.propertyNames.pattern],
    /* AJOUT DU LOT 17. `remove` est une clef sœur de `changes` et porte la MÊME
       grammaire : deux copies d'une grammaire ne restent égales que si quelque
       chose les compare — et il y en a maintenant trois. */
    "le chemin d'un retrait": [PATTERNS.changePath.source, schema.$defs.opPatch.properties.remove.items.pattern],
    "les clefs d'un patch": [PATCH_KEYS, Object.keys(schema.$defs.opPatch.properties)],
    "l'id d'un record": [PATTERNS.recordId.source, schema.$defs.recordId.pattern],
    "un drapeau": [PATTERNS.flag.source, schema.$defs.flag.pattern],
    "l'id d'une couche": [PATTERNS.layerId.source, schema.properties.id.pattern],
    "la langue": [PATTERNS.lang.source, schema.properties.lang.pattern],
    "le slug d'un record": [PATTERNS.slug.source, schema.$defs.opAdd.properties.slug.pattern]
  };
  assert.deepEqual(drift(pairs, {}), [], "le code et le schéma doivent dire la même chose, mot pour mot");
});

test("ATTAQUE DU GARDE DE DÉRIVE — il voit un quinzième genre ajouté au schéma seul", () => {
  /* La leçon du 2026-08-08 : un garde vert qu'on n'a jamais violé ne prouve
     rien. On le viole ici, sur chacune des deux formes qu'il compare. */
  const withGhost = drift({ "les 14 genres": [GENRES, GENRES.concat("arcana")] }, {});
  assert.equal(withGhost.length, 1);
  assert.match(withGhost[0], /arcana/);

  const withLooseKey = drift({ "les clefs interdites": [FORBIDDEN_KEYS, FORBIDDEN_KEYS.filter((k) => k !== "eval")] }, {});
  assert.equal(withLooseKey.length, 1, "retirer `eval` du schéma sans le retirer du code doit se voir");

  const withPattern = drift({ "le chemin d'un patch": [PATTERNS.changePath.source, "^.*$"] }, {});
  assert.equal(withPattern.length, 1, "une grammaire relâchée d'un côté doit se voir");

  /* Et les deux couples ajoutés par le lot 17, violés eux aussi : un garde
     qu'on ajoute sans le voir rougir n'a jamais été éprouvé. */
  const withLooseRemove = drift({ "le chemin d'un retrait": [PATTERNS.changePath.source, "^.*$"] }, {});
  assert.equal(withLooseRemove.length, 1, "un `remove` dont la grammaire s'écarterait de `changes` doit se voir");

  const withGhostKey = drift({ "les clefs d'un patch": [PATCH_KEYS, PATCH_KEYS.concat("effets")] }, {});
  assert.equal(withGhostKey.length, 1);
  assert.match(withGhostKey[0], /effets/, "une clef ouverte dans le schéma seul serait acceptée par la norme " +
    "et refusée par son exécution — l'écart doit se voir ici, pas chez quelqu'un d'autre");

  assert.deepEqual(drift({ "rien n'a bougé": [GENRES, GENRES] }, {}), [],
    "et il reste muet quand les deux disent la même chose");
});
