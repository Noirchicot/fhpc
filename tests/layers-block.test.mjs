/* Lot 7 — LE BLOC DERRIÈRE LE NOYAU, ET SES LOIS DE FRONTIÈRE.

   Les verbes sont le seul point d'entrée, ils passent par `dispatch`, et rien
   dans `src/layers/` ne touche le DOM, le réseau, ni le DISQUE.

   ⚠️ LE GARDE STRUCTUREL EST ÉCRIT POUR ÊTRE ATTAQUÉ. Le 2026-08-08,
   `play-block` a montré qu'un garde vert depuis trois lots pouvait ne rien
   garder : il comptait des fichiers, et pointé ailleurs il comptait toujours.
   Ici l'inspection est une FONCTION PURE (`inspect`) et son périmètre une
   autre (`perimeterGaps`) ; les deux tournent sur le vrai `src/layers/` ET sur
   des sources fabriquées qui les violent, une violation à la fois. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { dispatch, assertBlocks } from "../src/kernel/registry.mjs";
import { registerLayers, createLayers } from "../src/layers/index.mjs";
import { fileBytes, aLayer, anAdd, HOMEBREW, SRD_FR } from "./layers-harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const layersDir = path.join(here, "..", "src", "layers");

/* Les commentaires sont retirés avant l'inspection — ils NOMMENT ce qui est
   interdit (« le bloc ne lit pas le disque ») et un garde qui les lit
   interdirait d'expliquer la frontière qu'il défend. Même règle qu'au bloc
   `play`. */
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");

function readSources(dir) {
  return fs.readdirSync(dir).filter((name) => name.endsWith(".mjs")).map((name) => {
    const raw = fs.readFileSync(path.join(dir, name), "utf8");
    return { name, raw, text: stripComments(raw) };
  });
}

/* ── LES DEUX GARDES, PURS ET ATTAQUABLES ───────────────────────────── */

const FORBIDDEN = [
  /* ⚠️ POURQUOI PAS `/\bdocument\b/` COMME AU BLOC `play`. Ici « document »
     est le mot du DOMAINE : une couche EST un document `fh-layer/1`, le
     schéma et l'architecture l'appellent ainsi, et `document.mjs` porte ce
     nom. Un garde qui interdirait le mot pousserait le prochain à renommer le
     domaine pour lui faire plaisir — ce qui achète une ligne verte et perd le
     vocabulaire. On interdit donc le DOM par ses formes atteignables, et
     l'attaque plus bas le prouve sur du vrai code de DOM. */
  [/\bwindow\b/, "window"],
  [/globalThis\s*\.\s*document\b/, "globalThis.document"],
  [/\bdocument\s*\.\s*(getElementById|querySelector|createElement|body|head|write)\b/, "le document du DOM"],
  [/querySelector/, "querySelector"],
  [/\binnerHTML\b/, "innerHTML"],
  [/\blocalStorage\b/, "localStorage"],
  // Le transport appartient au bloc `table`, jamais à qui tient le contenu.
  [/\bfetch\s*\(/, "fetch("],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/\bsetTimeout\b/, "setTimeout"],
  [/\bsetInterval\b/, "setInterval"],
  /* LE DISQUE. Une couche entre par ses OCTETS : qui possède le fichier le
     lit. Un bloc qui lirait lui-même marcherait sur la tranche de `doc` et
     rendrait l'empreinte dépendante d'un chemin. */
  [/node:fs\b/, "node:fs"],
  [/node:path\b/, "node:path"],
  [/\breadFileSync\b/, "readFileSync"],
  [/\bwriteFileSync\b/, "writeFileSync"],
  [/\bhomedir\b/, "homedir"],
  // Le hasard et l'horloge n'ont rien à faire dans un pli déterministe.
  [/Math\.random/, "Math.random"],
  [/\bDate\.now\b/, "Date.now"],
  /* AUCUNE CORRESPONDANCE FR↔EN (§L7.5). Les deux couches SRD sont autonomes ;
     la pile lit `lang`, elle ne la devine jamais, et elle ne connaît le nom
     d'aucune couche en particulier. */
  [/srd-5\.2\.1/, "l'id d'une couche en dur"],
  [/translation|translate|traduction/i, "un appariement de traductions"],
  [/["'](fr|en)["']/, "une langue en dur"]
];

/** Rend la liste des violations, jamais un booléen : un garde doit dire QUOI
 *  et OÙ, sinon il oblige à rechercher ce qu'il vient de trouver. */
function inspect(sources) {
  const found = [];
  for (const { name, text } of sources) {
    for (const [pattern, label] of FORBIDDEN) {
      if (pattern.test(text)) found.push(`src/layers/${name} : « ${label} »`);
    }
  }
  return found;
}

/** Le périmètre. C'est LUI qui a menti ailleurs le 2026-08-08 : un compte de
 *  fichiers reste vrai quand on le pointe sur le mauvais répertoire. On nomme
 *  donc ce qui DOIT être inspecté, et on le compare. */
const MUST_INSPECT = ["document.mjs", "index.mjs", "paths.mjs", "stack.mjs"];
function perimeterGaps(sources) {
  const seen = new Set(sources.map((source) => source.name));
  return MUST_INSPECT.filter((name) => !seen.has(name));
}

/* ── le bloc sur le noyau ───────────────────────────────────────────── */

test("le bloc s'enregistre sur le noyau et répond à dispatch", () => {
  registerLayers();
  assertBlocks(["layers"]);

  const registered = dispatch("layers.register", { bytes: fileBytes(SRD_FR), origin: SRD_FR });
  assert.equal(registered.id, "srd-5.2.1-fr");
  assert.equal(registered.records, 1309);

  const skill = dispatch("layers.query", { kind: "skill", id: "srd:skill:fr:perception" });
  assert.equal(skill.record.name, "Perception");

  // Un verbe inconnu jette en le NOMMANT — jamais un échec muet (loi §0.5).
  assert.throws(() => dispatch("layers.load"), /unknown verb "load" on block "layers"/);
});

test("les sept verbes sont le seul point d'entrée, et ils passent tous par dispatch", () => {
  /* Quatre viennent du kickoff ; trois sont ajoutés par ce lot et soumis à
     ratification (contracts/layers.md). Ils doivent exister sous ces noms. */
  assert.equal(dispatch("layers.query", { kind: "skill" }).length, 18);
  assert.deepEqual(dispatch("layers.flags"), []);
  assert.deepEqual(dispatch("layers.ruleValues"), {});
  assert.equal(dispatch("layers.stack").length, 1);

  assert.deepEqual(dispatch("layers.disable", { id: "srd-5.2.1-fr" }), { id: "srd-5.2.1-fr", enabled: false, changed: true });
  assert.deepEqual(dispatch("layers.query", { kind: "skill" }), [], "une couche éteinte ne répond plus");
  assert.deepEqual(dispatch("layers.enable", { id: "srd-5.2.1-fr" }), { id: "srd-5.2.1-fr", enabled: true, changed: true });
  assert.equal(dispatch("layers.query", { kind: "skill" }).length, 18);
});

test("le registre est un singleton — une suite construit des INSTANCES", () => {
  /* `defineBlock` jette sur un double enregistrement : bonne loi pour une
     application, ingérable pour une suite. D'où le partage
     `createLayers` / `registerLayers`, comme au bloc `play`. */
  assert.throws(() => registerLayers(), /block "layers" is already defined/);
  const instance = createLayers({ bus: { emit() {} } });
  assert.deepEqual(Object.keys(instance).sort(), ["name", "verbs"]);
  assert.equal(instance.verbs.stack().length, 0, "et l'instance neuve ne voit rien de la pile du noyau");
});

/* ── les gardes structurels, et leurs attaques ──────────────────────── */

test("ZÉRO DOM, ZÉRO réseau, ZÉRO disque, AUCUNE langue en dur dans src/layers/", () => {
  assert.deepEqual(inspect(readSources(layersDir)), []);
});

test("ATTAQUE DU GARDE — chacun des interdits, violé une fois, est vu et NOMMÉ", () => {
  /* Une violation à la fois : un garde qui ne rapporterait que la première
     ligne fautive passerait le test global en laissant filer les suivantes. */
  const violations = [
    ["disque.mjs", 'import { readFileSync } from "node:fs";'],
    ["dom.mjs", "const el = document.getElementById('x');"],
    ["fenetre.mjs", "const w = window.innerWidth;"],
    ["reseau.mjs", "await fetch('https://exemple');"],
    ["minuteur.mjs", "setTimeout(() => {}, 10);"],
    ["horloge.mjs", "const at = Date.now();"],
    ["hasard.mjs", "const r = Math.random();"],
    ["appariement.mjs", 'const pairs = { translation_of: "x" };'],
    ["langue.mjs", 'const langs = ["fr", "en"];'],
    ["couche.mjs", 'const base = "srd-5.2.1-fr";']
  ];
  for (const [name, source] of violations) {
    const found = inspect([{ name, text: source }]);
    assert.ok(found.length > 0, `« ${source} » aurait dû être vu dans ${name}`);
    assert.match(found[0], new RegExp(name.replace(".", "\\.")), "et la violation nomme son fichier");
  }
  /* Le pendant, sans lequel le garde pourrait n'être qu'un refus universel :
     le vocabulaire du domaine passe. */
  assert.deepEqual(inspect([
    { name: "sain.mjs", text: 'import { readLayer } from "./document.mjs";\nconst id = layer.document.id;' }
  ]), [], "« document » comme mot du domaine n'est pas le DOM");
});

test("ATTAQUE DU PÉRIMÈTRE — le garde refuse d'être pointé sur le vide ou sur un répertoire amputé", () => {
  /* LA leçon du 2026-08-08, appliquée à mon propre garde : ce n'est pas un
     COMPTE qu'on vérifie, c'est une LISTE DE NOMS. Un `src/layers/` déplacé,
     vidé ou amputé sortirait ses modules de la loi sans un mot. */
  assert.deepEqual(perimeterGaps(readSources(layersDir)), [], "le vrai répertoire est complet");
  assert.deepEqual(perimeterGaps([]), MUST_INSPECT, "un périmètre vide n'est jamais une réussite");
  assert.deepEqual(
    perimeterGaps(readSources(layersDir).filter((source) => source.name !== "paths.mjs")),
    ["paths.mjs"],
    "et un seul fichier soustrait se voit, nommément"
  );
  /* L'autre bout : un fichier NEUF dans `src/layers/` tombe sous la loi sans
     qu'on ait rien à déclarer. La liste prouve qu'on regarde au bon endroit ;
     elle ne borne pas ce qui est inspecté. */
  const withNew = readSources(layersDir).concat({ name: "neuf.mjs", text: "import fs from 'node:fs';" });
  assert.deepEqual(perimeterGaps(withNew), []);
  assert.equal(inspect(withNew).length, 1, "et il est jugé comme les autres");
});

test("le bloc ne dépend d'aucun autre bloc", () => {
  /* Il importe le noyau (registre, bus) et rien de `src/play/`, `src/modules/`,
     `src/schemas/` ni `src/tools/` : une pile de couches qui connaîtrait le
     moteur ferait du moteur une dépendance du contenu — l'exact envers de la
     loi §0.12, où le SRD est dessous et le moteur au-dessus. */
  for (const { name, text } of readSources(layersDir)) {
    for (const forbidden of ["../play/", "../modules/", "../schemas/", "../tools/"]) {
      assert.equal(text.includes(forbidden), false, `src/layers/${name} ne doit pas importer ${forbidden}`);
    }
  }
});

/* ── la décision Q4, prise au mot ───────────────────────────────────── */

test("une couche homebrew d'inconnu est inoffensive à charger", () => {
  /* On charge un document hostile et on regarde ce qu'il a obtenu. Rien —
     parce qu'il n'est jamais devenu un objet. */
  const hostile = JSON.stringify(aLayer({
    id: "inconnu",
    records: { gear: { "x:gear:fr:piege": anAdd("Piège", { a: 1 }) } }
  })).replace('"a":1', '"a":{"__proto__":{"estAdmin":true}}');

  const block = createLayers({ bus: { emit() {} } });
  assert.throws(() => block.verbs.register({ bytes: hostile, origin: "inconnu" }), /__proto__/);
  assert.equal({}.estAdmin, undefined, "aucun prototype n'a bougé");
  assert.equal(block.verbs.stack().length, 0, "et la pile est restée vide");

  // La vraie couche d'exemple, elle, entre sans histoire — sur son socle SRD.
  block.verbs.register({ bytes: fileBytes(SRD_FR), origin: SRD_FR });
  assert.doesNotThrow(() => block.verbs.register({ bytes: fileBytes(HOMEBREW), origin: HOMEBREW }));
});
