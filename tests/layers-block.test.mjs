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
import { loadSources, findForbidden, HOUSE_MECHANICS, genreVocabulary, maskGenreVocabulary } from "./source-scan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const layersDir = path.join(here, "..", "src", "layers");

/* REWRITTEN 2026-08-08 (RELECTEUR Adverserial, seconde passe) — ce fichier
   portait ENCORE l'arpenteur à plat et le dépouilleur à regex, seul des six
   gardes de bloc à ne pas être passé sur `tests/source-scan.mjs`. Les deux
   défauts du 2026-08-08 y vivaient donc intacts, et ils ont été MESURÉS ici
   même, sur ce garde-ci, avant d'être réparés :

     · l'arpenteur lisait `src/layers/` À PLAT. Un fichier posé dans
       `src/layers/sous/` nommant `node:fs`, `document.getElementById`,
       `Date.now` ET `Math.random` laissait les 8 tests de ce fichier VERTS ;
     · le dépouilleur à regex EFFAÇAIT DU CODE. Sur les deux littéraux
       ordinaires du défaut n°4 (une regex contenant une ouverture de
       commentaire, une chaîne contenant deux barres obliques), `Math.random`
       et `Date.now` disparaissaient de la zone inspectée.

   L'arpenteur et le dépouilleur partagés sont sous test dans
   tests/guards-adversarial.test.mjs ; il n'y a plus de copie ici. */
function readSources(dir) {
  return loadSources([dir], dir);
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
 *  et OÙ, sinon il oblige à rechercher ce qu'il vient de trouver.
 *
 *  REWRITTEN 2026-08-08 (RELECTEUR Adverserial, seconde passe) — passe par
 *  `findForbidden`, qui essaie chaque motif sur le texte dépouillé ET sur le
 *  même texte passé au découpeur d'identifiants (défaut n°5). Un `pattern.test`
 *  nu, comme ici avant, perdait ce durcissement.
 *
 *  ⚠️ §0.12 EST AJOUTÉE ICI, ET ELLE N'Y ÉTAIT PAS. Mesuré le 2026-08-08 :
 *  un `export const destinyScoreFor = (r) => r.data.arcana ? r.data.chaosPool : 0`
 *  posé dans `src/layers/stack.mjs` laissait les 409 tests du dépôt VERTS. La
 *  loi la plus haute du chantier — « un personnage SRD pur traverse-t-il ce
 *  code de bout en bout ? » — n'était tenue que sur `src/play/`, `src/doc/` et
 *  `src/mcp/`, alors que `src/layers/` EST le bloc qui porte le SRD. Mesuré
 *  avant de poser, comme le veut la règle : zéro occurrence dans les quatre
 *  fichiers du bloc, aucune suite ne rougit. */
/* RÉVISION DU 2026-08-08 — le masque du vocabulaire des genres.
   `src/layers/` est LE bloc qui possède l'énumération fermée, et depuis que
   `arcana` y est entré, le garde §0.12 mordait sur une clef de vocabulaire.
   Le masque retire le genre ENTRE GUILLEMETS et rien d'autre ; sa liste est
   lue dans le schéma, jamais tenue à la main. Le raisonnement complet est
   dans tests/source-scan.mjs, et l'attaque qui prouve qu'il ne fuit pas est
   juste en dessous du garde. */
const GENRE_VOCABULARY = genreVocabulary(path.join(here, "..", "schemas", "fh-layer.schema.json"));

function inspect(sources) {
  const masked = sources.map((source) => ({
    ...source,
    text: maskGenreVocabulary(source.text, GENRE_VOCABULARY)
  }));
  return findForbidden(masked, FORBIDDEN.concat(HOUSE_MECHANICS))
    .map(({ name, label }) => `src/layers/${name} : « ${label} »`);
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
  assert.equal(registered.records, 1329, "mesuré le 2026-08-23 : 1 328 + le record `item-value` du lot 92 de fh-srd");

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
    ["couche.mjs", 'const base = "srd-5.2.1-fr";'],
    /* §0.12 — AJOUTÉ LE 2026-08-08 (seconde passe adversariale). Les deux
       bouts de la leçon du défaut n°5 : le mot nu, et l'identifiant composé,
       que la frontière de mot laissait passer. */
    ["maison-fh.mjs", 'const champ = "destiny";'],
    ["maison-composee.mjs", "export function resolveArcana(entry) { return entry.chaosPool; }"]
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

test("ATTAQUE DU MASQUE DE VOCABULAIRE — il exempte la clef de genre, RIEN d'autre", () => {
  /* Le masque ajouté le 2026-08-08 est une EXEMPTION à une loi ratifiée
     (§0.12). Une exemption qu'on n'attaque pas est une porte ouverte qu'on a
     décrite comme une serrure — d'où ce test, écrit en même temps qu'elle.

     Ce qui PASSE : le genre entre guillemets, la forme d'une clef dans une
     énumération fermée. C'est le seul cas que l'arbitrage couvre. */
  assert.deepEqual(
    inspect([{ name: "vocabulaire.mjs", text: 'export const GENRES = ["arcana", "armor", "spell"];' }]),
    [],
    "un genre entre guillemets est du vocabulaire, pas une mécanique"
  );

  /* Ce qui MORD ENCORE, et c'est la moitié qui compte. Les trois formes par
     lesquelles une vraie mécanique essaierait de passer sous le masque. */
  const fuites = [
    ["identifiant.mjs", "export function resolveArcana(entry) { return entry; }"],
    ["compose.mjs", "const pool = entry.arcanaPool;"],
    ["mot-nu.mjs", "const champ = arcana;"],
    ["autre-mecanique.mjs", 'const champ = "destiny";']
  ];
  for (const [name, source] of fuites) {
    assert.ok(
      inspect([{ name, text: source }]).length > 0,
      `« ${source} » n'est PAS une clef de genre et doit rester vu`
    );
  }

  /* Et le masque ne peut pas grossir en douce : sa liste EST celle du schéma.
     Un genre inventé dans le code ne s'exempte pas lui-même. */
  assert.ok(
    inspect([{ name: "invente.mjs", text: 'const g = "arcanum";' }]).length > 0,
    "« arcanum » n'est pas un genre déclaré au schéma — aucune exemption"
  );
  assert.equal(GENRE_VOCABULARY.includes("arcana"), true);
  assert.equal(GENRE_VOCABULARY.includes("arcanum"), false);
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

  /* ⚠️ AJOUTÉ LE 2026-08-08 (RELECTEUR Adverserial, seconde passe). L'arpenteur
     de ce fichier lisait `src/layers/` À PLAT, et la violation ci-dessous a
     RÉELLEMENT laissé les huit tests verts avant le correctif. On ne croit donc
     pas `loadSources` sur parole : le sous-répertoire est créé, jugé, retiré,
     et l'arbre est reconstaté propre — comme au bloc `doc`. */
  const sous = path.join(layersDir, "sous");
  const piege = path.join(sous, "porte-de-sortie.mjs");
  fs.mkdirSync(sous, { recursive: true });
  try {
    fs.writeFileSync(piege, "import fs from \"node:fs\";\nexport const at = Date.now();\n", "utf8");
    const found = inspect(readSources(layersDir));
    assert.equal(found.length, 2, "un sous-répertoire n'est PAS une porte de sortie hors de la loi");
    assert.ok(found.every((line) => /sous\/porte-de-sortie\.mjs/.test(line)),
      "et les deux violations nomment le fichier enfoui : " + found.join(" / "));
  } finally {
    fs.rmSync(sous, { recursive: true, force: true });
  }
  assert.deepEqual(inspect(readSources(layersDir)), [], "et l'arbre est restauré");
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
