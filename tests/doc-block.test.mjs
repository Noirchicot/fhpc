/* ══ LOT 14 — LE BLOC `doc`, SES LOIS DE FRONTIÈRE ET SES REFUS ════════

   ⚠️ LES GARDES SONT ÉCRITS POUR ÊTRE ATTAQUÉS. Le 2026-08-08, `play-block` a
   montré qu'un garde vert depuis trois lots pouvait ne rien garder : il
   COMPTAIT des fichiers, et pointé ailleurs il comptait toujours. Ici comme
   aux lots 7, 9 et 10, l'inspection est une FONCTION PURE et son périmètre une
   autre ; les deux tournent sur le vrai `src/doc/` ET sur des sources
   fabriquées qui les violent, une violation à la fois. L'arpenteur est
   RÉCURSIF : `src/doc/sous/` n'est pas une porte de sortie.

   Le périmètre est une LISTE DE NOMS, pas un compte. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createDoc, DocError } from "../src/doc/index.mjs";
import { createFsStorage, SUFFIX } from "../src/storage/fs.mjs";
import { loadSources, findForbidden, stripComments, HOUSE_MECHANICS } from "./source-scan.mjs";
import {
  charSchema, characterNamed, exampleBytes, exampleDocument,
  fixedClock, makeBus, makeDoc, memoryStorage
} from "./doc-harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const docDir = path.join(here, "..", "src", "doc");
const storageDir = path.join(here, "..", "src", "storage");
const sources = () => loadSources([docDir], docDir);

/* ── GARDE 1 : LES DÉPENDANCES INTERDITES ───────────────────────────── */

const FORBIDDEN = [
  /* LE DISQUE — L'INTERDIT CENTRAL DE CE LOT (décision D1). Le bloc POSSÈDE le
     stockage et ne code pas le disque : le magasin arrive injecté, et
     l'implémentation système de fichiers vit hors du bloc
     (`src/storage/fs.mjs`). Ce n'est pas de l'abstraction gratuite : c'est ce
     qui permet d'éprouver le magasin entier sans écrire un octet, donc sans
     jamais salir l'arbre de travail (lot 13). */
  [/node:fs\b/, "node:fs"],
  [/node:path\b/, "node:path"],
  [/node:os\b/, "node:os"],
  [/\b(readFileSync|writeFileSync|readdirSync|mkdirSync|rmSync|renameSync|existsSync|statSync|unlinkSync)\b/,
    "une opération de fichier"],
  [/\bcreate(Read|Write)Stream\b/, "un flux de fichier"],
  [/\bhomedir\b|\btmpdir\b/, "un répertoire de la plate-forme"],
  [/\bfileURLToPath\b|import\.meta\.url/, "l'emplacement du module sur le disque"],
  /* LE PROCESSUS. Le bloc ne lit ni argument de ligne de commande, ni variable
     d'environnement : une racine de magasin qui viendrait de là serait un
     chemin choisi par le bloc, pas par le joueur (décision D2). */
  [/\bprocess\s*\./, "process"],
  [/node:child_process\b/, "node:child_process"],
  [/\bspawn\s*\(/, "spawn("],
  /* LE RÉSEAU. « Baseline du voyage : export/import fichier. Toute synchro :
     optionnelle et débranchable » — et personne n'a formulé le besoin (§0.6).
     Un `fetch` ici serait un serveur mondial à maintenir (loi §0.9). */
  [/\bfetch\s*\(/, "fetch("],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/\bsetInterval\b/, "setInterval"],
  /* LE DOM. Comme aux blocs `layers`, `build` et `mcp`, le mot `document`
     n'est PAS interdit : c'est le mot du domaine ici, et c'est même le mot le
     plus employé du bloc. Le DOM est interdit par ses formes atteignables. */
  [/\bwindow\b/, "window"],
  [/globalThis\s*\.\s*document\b/, "globalThis.document"],
  [/\bdocument\s*\.\s*(getElementById|querySelector|createElement|body|head|innerText)\b/, "le document du DOM"],
  [/querySelector/, "querySelector"],
  [/\binnerHTML\b/, "innerHTML"],
  [/\blocalStorage\b/, "localStorage"],
  [/\bindexedDB\b/i, "indexedDB"],
  /* LES AUTRES BLOCS. `doc` ne parle à personne : il reçoit et rend des
     documents. ⚠️ `../storage/` est dans la liste et c'est le cœur de D1 — un
     bloc qui importe son magasin ne le reçoit plus, et le garde tombe.
     `src/schemas/invariants.mjs` est AUTORISÉ et voulu : ce module existe
     pour que les invariants que JSON Schema ne sait pas dire s'appliquent au
     même endroit chez `build` et ici. */
  [/\.\.\/build\//, "un import de src/build/"],
  [/\.\.\/layers\//, "un import de src/layers/"],
  [/\.\.\/play\//, "un import de src/play/"],
  [/\.\.\/modules\//, "un import de src/modules/"],
  [/\.\.\/mcp\//, "un import de src/mcp/"],
  [/\.\.\/tools\//, "un import de src/tools/"],
  [/\.\.\/storage\//, "un import de src/storage/ — le magasin est INJECTÉ (D1)"],
  /* Le bloc ne décide ni d'un hasard, ni d'une langue, ni d'une couche. */
  [/Math\.random/, "Math.random"],
  [/["'](fr|en)["']/, "une langue en dur"],
  [/srd-5\.2\.1/, "l'id d'une couche en dur"]
];

/* L'HORLOGE, ET SON UNIQUE EXEMPTION. Même partage qu'au bloc `build` :
   `clock.mjs` porte le défaut de plate-forme et il est le seul fichier de
   `src/doc/` autorisé à nommer `Date`. L'exemption est prouvée dans les DEUX
   sens plus bas — elle ne vaut que pour l'horloge, pas pour le reste. */
const CLOCK = "clock.mjs";
const HORLOGE = [/\bnew Date\b|\bDate\.now\b/, "l'horloge de plate-forme"];

/* ── GARDE 2 : AUCUN CHEMIN, JAMAIS (décision D2) ────────────────────
   « Un bloc qui choisit où vivent les fichiers de quelqu'un a déjà décidé à sa
   place. » Ce garde-ci cherche les CHEMINS, et il a une particularité : les
   spécificateurs de module (`from "./errors.mjs"`) sont retirés avant
   l'inspection. Un import relatif est la structure du programme, pas
   l'emplacement des données de quelqu'un — les confondre rendrait le garde
   inapplicable, donc désactivé, et c'est la garantie entière qui partirait. */
function stripModuleSpecifiers(text) {
  return text
    .replace(/\bfrom\s*(["'])[^"'\n]*\1/g, "from ⟨module⟩")
    .replace(/\bimport\s*\(\s*(["'])[^"'\n]*\1\s*\)/g, "import(⟨module⟩)");
}

/* ⚠️ CHAQUE MOTIF A DÛ ÊTRE RÉGLÉ SUR LA PROSE RÉELLE DU BLOC, et c'est la
   leçon du garde §0.12 (« un garde se teste sur les formes que le code
   emploie »). Deux réglages, mesurés le 2026-08-08 en écrivant ce lot :

     · « un littéral qui commence par un chemin » exige qu'un CARACTÈRE DE
       CHEMIN suive la barre oblique, et le séparateur nu ne connaît que les
       guillemets. Sans ces deux réglages, la prose ordinaire des messages
       d'erreur rougissait — un nom de code entre accents graves suivi d'une
       barre oblique ressemble à un chemin. Un garde qui crie au loup se fait
       désactiver, et c'est la garantie entière qui part avec lui.
     · « un chemin recollé dans un gabarit » exige une FIN d'interpolation
       avant la barre : sans elle, il mordait sur `(/${node.pattern}/)`, qui
       affiche une expression régulière dans un message. */
const CHEMINS = [
  [/["'`]\s*(\/|\.\.?\/|~\/)[A-Za-z0-9_.~-]/, "un littéral qui commence par un chemin"],
  [/["']\s*\/\s*["']/, "un séparateur de chemin en littéral"],
  [/\}\s*\/\s*(\$\{|[A-Za-z0-9_.~-])/, "un chemin recollé dans un gabarit"],
  [/["'`][^"'`\n]*\.(json|fh-char|dat|txt|bak|tmp)\b/, "un nom de fichier de données"],
  [/\.fhpc\b/, "un répertoire d'application inventé"],
  [/\bpath\s*\.\s*(join|resolve|dirname|basename|extname|sep|normalize)\b/, "le module `path`"],
  [/\bsep\b|\bdelimiter\b/, "un séparateur de chemin"]
];

function inspect(list) {
  const horloge = list.filter((source) => source.name !== CLOCK);
  return findForbidden(list, FORBIDDEN)
    .concat(findForbidden(horloge, [HORLOGE]))
    .concat(findForbidden(list.map((source) => ({ ...source, text: stripModuleSpecifiers(source.text) })), CHEMINS))
    .concat(findForbidden(list, HOUSE_MECHANICS))
    .map(({ name, label }) => `src/doc/${name} : « ${label} »`);
}

/* ── GARDE 3 : LE PÉRIMÈTRE, PAR SES NOMS ───────────────────────────── */

/** Le refus attendu, RENDU pour qu'on puisse lire ce qu'il dit. `assert.throws`
 *  ne rend rien : il vérifie qu'on jette, jamais que le message NOMME sa
 *  raison — et dans ce dépôt, ce qu'un refus dit est la moitié de sa valeur. */
function refuse(travail, motif, quoi = "ce geste") {
  let error = null;
  try { travail(); } catch (caught) { error = caught; }
  assert.ok(error, `${quoi} devait être REFUSÉ — un succès silencieux est le pire des résultats`);
  assert.ok(error instanceof DocError,
    `${quoi} : le refus est un DocError, reçu ${error.constructor.name} — ${error.message}`);
  if (motif) assert.match(error.message, motif, `le refus doit NOMMER sa raison — reçu : ${error.message}`);
  return error;
}

const MUST_INSPECT = ["clock.mjs", "errors.mjs", "index.mjs", "schema.mjs", "serialize.mjs", "store.mjs"];
function perimeterGaps(list) {
  const seen = new Set(list.map((source) => source.name));
  return MUST_INSPECT.filter((name) => !seen.has(name));
}

test("ZÉRO DISQUE, ZÉRO CHEMIN, ZÉRO PROCESSUS, ZÉRO RÉSEAU dans src/doc/", () => {
  assert.deepEqual(inspect(sources()), []);
});

test("ATTAQUE DU GARDE — chacun des interdits, violé une fois, est vu et NOMMÉ", () => {
  const violations = [
    ["disque.mjs", 'import { readFileSync } from "node:fs";'],
    ["ecriture.mjs", "writeFileSync(cible, octets);"],
    ["chemin.mjs", 'import { join } from "node:path";'],
    ["maison.mjs", "const base = homedir();"],
    ["module.mjs", "const ici = fileURLToPath(import.meta.url);"],
    ["processus.mjs", "const racine = process.env.FHPC_HOME;"],
    ["enfant.mjs", 'import { spawn } from "node:child_process";'],
    ["reseau.mjs", "await fetch('https://exemple');"],
    ["synchro.mjs", "setInterval(pousser, 60000);"],
    ["dom.mjs", "const el = document.getElementById('x');"],
    ["fenetre.mjs", "const w = window.innerWidth;"],
    ["navigateur.mjs", "localStorage.setItem('perso', texte);"],
    ["magasin.mjs", 'import { createFsStorage } from "../storage/fs.mjs";'],
    ["domaine.mjs", 'import { createBuild } from "../build/index.mjs";'],
    ["pile.mjs", 'import { createLayers } from "../layers/index.mjs";'],
    ["hasard.mjs", "const suffixe = Math.random().toString(36);"],
    ["horloge.mjs", "const at = Date.now();"],
    ["langue.mjs", 'const defaut = "fr";'],
    ["couche.mjs", 'const base = "srd-5.2.1-fr";'],
    /* §0.12 : un personnage SRD pur traverse ce bloc de bout en bout. Une
       mécanique de couche nommée ici serait une couche tissée dans le chemin
       commun — et elle passerait par un LITTÉRAL, que le dépouilleur garde. */
    ["maison-fh.mjs", 'const champ = "destiny";'],
    /* LES CHEMINS — décision D2, une forme par ligne. */
    ["racine.mjs", 'const base = "/Users/eric/personnages";'],
    ["tilde.mjs", 'const base = "~/Documents/fhpc";'],
    ["relatif.mjs", 'const base = "./personnages";'],
    ["parent.mjs", 'const base = "../personnages";'],
    ["cache.mjs", 'const dossier = ".fhpc";'],
    ["fichier.mjs", 'const cible = id + ".fh-char.json";'],
    ["extension.mjs", 'const brut = nom + ".json";'],
    ["separateur.mjs", 'const cible = base + "/" + id;'],
    ["gabarit.mjs", "const cible = `${base}/${id}`;"],
    ["module-path.mjs", "const cible = path.join(base, id);"],
    ["sep.mjs", "const cible = base + sep + id;"]
  ];
  for (const [name, source] of violations) {
    const found = inspect([{ name, text: source }]);
    assert.ok(found.length > 0, `« ${source} » aurait dû être vu dans ${name}`);
    assert.match(found[0], new RegExp(name.replace(/\./g, "\\.")), "et la violation nomme son fichier");
  }

  /* ET LE PENDANT, QUI COMPTE AUTANT. Un garde qui crie au loup se fait
     désactiver, et c'est la garantie entière qui part avec lui. Ces lignes-ci
     sont du vocabulaire ORDINAIRE de ce bloc et doivent rester vertes — en
     particulier les deux formes qui ressemblent le plus à un chemin :
     l'import relatif (structure du programme, pas emplacement de données) et
     le nom du schéma, qui porte une barre oblique. */
  assert.deepEqual(inspect([{
    name: "sain.mjs",
    text: [
      'import { DocError } from "./errors.mjs";',
      'import { charInvariantViolations } from "../schemas/invariants.mjs";',
      'fail(`fhpc/doc: le document ne valide pas contre \\`fh-char/1\\` : ${violations.join("\\n- ")}`);',
      'const parsed = JSON.parse(bytes.toString("utf8"));',
      "const id = document.id; storage.write(id, bytes); bus.emit(\"doc-saved\", { id });",
      "const hash = createHash(\"sha256\").update(bytes).digest(\"hex\");",
      'fail("les deux annonces `doc-opened`/`doc-saved` sont le seul moyen de savoir, et `save`/`import` " +',
      '  "y passent toutes deux.");',
      "const route = [\"$defs\", \"safeKey\"]; fail(`le schéma ne porte pas ${route.join('.')}`);"
    ].join("\n")
  }]), []);
});

test("ATTAQUE DE L'EXEMPTION D'HORLOGE — elle ne vaut QUE pour clock.mjs, et QUE pour Date", () => {
  const date = "export const at = new Date().toISOString();";
  assert.deepEqual(inspect([{ name: CLOCK, text: date }]), [],
    "clock.mjs porte le défaut de plate-forme : c'est sa raison d'être");
  assert.equal(inspect([{ name: "store.mjs", text: date }]).length, 1,
    "et partout ailleurs l'horloge arrive par l'argument ou n'arrive pas");
  assert.equal(inspect([{ name: CLOCK, text: 'import fs from "node:fs";' }]).length, 1,
    "l'exemption porte sur l'horloge, pas sur le reste : clock.mjs n'a aucun droit sur le disque");
  /* ET SUR LE VRAI FICHIER : l'exemption n'est pas décorative, elle est
     réellement consommée. Si `clock.mjs` cessait de nommer `Date`, ce test
     rougirait et l'exemption devrait partir avec lui. */
  const vraiClock = sources().find((source) => source.name === CLOCK);
  assert.ok(vraiClock && /new Date/.test(vraiClock.text),
    "clock.mjs doit RÉELLEMENT porter l'horloge, sinon l'exemption garde une porte que personne n'emprunte");
});

test("ATTAQUE DU PÉRIMÈTRE — le garde refuse d'être pointé sur le vide ou sur un répertoire amputé", () => {
  assert.deepEqual(perimeterGaps(sources()), [], "le vrai répertoire est complet");
  assert.deepEqual(perimeterGaps([]), MUST_INSPECT, "un périmètre vide n'est jamais une réussite");
  assert.deepEqual(
    perimeterGaps(sources().filter((source) => source.name !== "store.mjs")),
    ["store.mjs"],
    "et un seul fichier soustrait se voit, nommément"
  );
  /* L'autre bout : un fichier NEUF dans `src/doc/` tombe sous la loi sans
     qu'on ait rien à déclarer. La liste prouve qu'on regarde au bon endroit ;
     elle ne borne pas ce qui est inspecté. */
  const withNew = sources().concat({ name: "neuf.mjs", text: 'import fs from "node:fs";' });
  assert.deepEqual(perimeterGaps(withNew), []);
  assert.equal(inspect(withNew).length, 1, "et il est jugé comme les autres");

  /* ⚠️ L'ARPENTEUR MARCHE L'ARBRE, et on le VÉRIFIE sur un vrai
     sous-répertoire, créé et retiré, plutôt que de croire `loadSources`. */
  const sous = path.join(docDir, "sous");
  const piege = path.join(sous, "porte-de-sortie.mjs");
  fs.mkdirSync(sous, { recursive: true });
  try {
    fs.writeFileSync(piege, 'import fs from "node:fs";\n', "utf8");
    const found = inspect(sources());
    assert.equal(found.length, 1, "un sous-répertoire n'est PAS une porte de sortie hors de la loi");
    assert.match(found[0], /sous\/porte-de-sortie\.mjs/);
  } finally {
    fs.rmSync(sous, { recursive: true, force: true });
  }
  assert.deepEqual(inspect(sources()), [], "et l'arbre est restauré");
});

test("LE DISQUE EXISTE BIEN QUELQUE PART — `src/storage/fs.mjs` le nomme, et c'est là que ça se passe", () => {
  /* Sans ce test, « zéro disque dans src/doc/ » se tiendrait aussi bien dans
     un dépôt où RIEN n'écrit jamais de fichier — c'est-à-dire dans un dépôt où
     le bloc `doc` ne sert à rien. La frontière n'a de sens que si l'autre côté
     est habité. */
  const raw = fs.readFileSync(path.join(storageDir, "fs.mjs"), "utf8");
  const text = stripComments(raw);
  for (const [pattern, quoi] of [
    [/node:fs\b/, "node:fs"],
    [/node:path\b/, "node:path"],
    [/readFileSync/, "la lecture"],
    [/writeFileSync/, "l'écriture"],
    [/renameSync/, "le renommage atomique"]
  ]) {
    assert.match(text, pattern, `src/storage/fs.mjs doit nommer ${quoi} : c'est son métier`);
  }
  assert.match(text, /\.fh-char\.json|SUFFIX/, "et c'est LUI qui connaît l'extension, pas le bloc");
});

/* ── §0.12 SUR LE MAGASIN, QUI N'ÉTAIT SOUS AUCUN GARDE ──────────────── */

const storageSources = () => loadSources([storageDir], storageDir);
const MUST_INSPECT_STORAGE = ["fs.mjs"];
function storageGaps(list) {
  const seen = new Set(list.map((source) => source.name));
  return MUST_INSPECT_STORAGE.filter((name) => !seen.has(name));
}

test("§0.12 — le magasin de fichiers ne connaît AUCUNE mécanique maison", () => {
  /* ⚠️ AJOUTÉ LE 2026-08-08 (RELECTEUR Adverserial, seconde passe). `src/storage/`
     n'était sous AUCUN garde structurel : le test au-dessus vérifie seulement
     qu'il NOMME le disque, ce qui est l'inverse d'un interdit. Mesuré avant de
     poser ce garde : un `export const spendDestiny = (n) => n + 1;` déposé dans
     `src/storage/fs.mjs` laissait les 409 tests du dépôt VERTS.

     Le magasin transporte des OCTETS. Il est sur le chemin d'un personnage SRD
     pur de bout en bout, donc il tombe sous la loi §0.12 comme `doc` lui-même —
     et il y tombe déjà en fait : mesuré, zéro occurrence dans le fichier. Le
     garde ne fait que rendre vrai par construction ce qui n'était vrai que par
     chance. */
  assert.deepEqual(
    findForbidden(storageSources(), HOUSE_MECHANICS).map(({ name, label }) => `src/storage/${name} : « ${label} »`),
    []);

  /* LE PÉRIMÈTRE, PAR SON NOM — pas par un compte, et pas par la confiance
     qu'un répertoire pointé est le bon (la leçon du 2026-08-08). */
  assert.deepEqual(storageGaps(storageSources()), [], "le vrai répertoire est complet");
  assert.deepEqual(storageGaps([]), MUST_INSPECT_STORAGE, "un périmètre vide n'est jamais une réussite");

  /* ET L'ATTAQUE, sans laquelle le garde ci-dessus ne prouverait rien de plus
     qu'un répertoire actuellement propre. Les deux bouts du défaut n°5 : le
     mot nu, et l'identifiant composé. */
  for (const violation of [
    'const champ = "destiny";',
    "export function spendDestinyDie(n) { return n + 1; }",
    "const table = rollChaos(dice);",
    "entry.vibrationLevel = 3;"
  ]) {
    assert.ok(findForbidden([{ name: "sonde.mjs", text: violation }], HOUSE_MECHANICS).length > 0,
      "le magasin ne doit pas pouvoir nommer une mécanique maison : " + violation);
  }

  /* ET LE PENDANT : le vocabulaire ordinaire du magasin reste vert, sans quoi
     le garde se ferait désactiver et c'est la garantie entière qui partirait. */
  assert.deepEqual(findForbidden([{
    name: "sain.mjs",
    text: [
      'import fs from "node:fs";',
      'export const SUFFIX = ".fh-char.json";',
      "const SAFE_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;",
      "fs.renameSync(temporary, file);"
    ].join("\n")
  }], HOUSE_MECHANICS), []);
});

/* ── LA CONSTRUCTION : CE QUE LE BLOC EXIGE, ET POURQUOI ─────────────── */

test("createDoc REFUSE ce qu'il ne peut pas tenir — magasin, port incomplet, schéma, bus", () => {
  const schema = charSchema();
  const bus = makeBus();
  const storage = memoryStorage();

  refuse(() => createDoc({ schema, bus }), /storage/, "un bloc sans magasin");
  refuse(() => createDoc({ storage: { list() {}, read() {} }, schema, bus }), /`write`/, "un port incomplet");
  refuse(() => createDoc({ storage, bus }), /schema/, "un bloc sans schéma");
  refuse(() => createDoc({ storage, schema }), /bus/, "un bloc sans bus");
  refuse(() => createDoc({ storage, schema, bus, now: "midi" }), /now/, "une horloge qui n'est pas une fonction");

  /* LE TÉMOIN : les quatre réunis construisent, et l'instance ne rend que
     `{name, verbs}` — pas de `state`, pas de poignée sur les rouages. C'est la
     seule forme où « personne ne lit l'état d'un autre bloc » se VÉRIFIE au
     lieu de se promettre (même forme que `layers`, `build` et `mcp`). */
  const doc = createDoc({ storage, schema, bus });
  assert.deepEqual(Object.keys(doc).sort(), ["name", "verbs"]);
  assert.equal(doc.name, "doc");
  /* LOT 47 — deux verbes de plus : `create` (un document neuf et vide) et
     `rename` (le nom qui entre). Les six du kickoff restent, à l'identique.
     LOT 48 — un neuvième : `describe` (genre, alignement, campagne — lus
     dans le schéma, pas recopiés). */
  assert.deepEqual(Object.keys(doc.verbs).sort(),
    ["create", "describe", "duplicate", "export", "import", "list", "open", "rename", "save"]);
});

/* ── LES VERBES ─────────────────────────────────────────────────────── */

test("open — rend le document, et refuse en NOMMANT ce qui manque", () => {
  const { verbs, bus } = makeDoc();
  verbs.save({ document: characterNamed("aldra", "Aldra") });

  const ouvert = verbs.open({ id: "aldra" });
  assert.equal(ouvert.document.name, "Aldra");
  assert.equal(bus.last("doc-opened").id, "aldra");

  const absent = refuse(() => verbs.open({ id: "personne" }), /aucun document « personne »/);
  assert.match(absent.message, /aldra/, "et le refus dit ce que le magasin porte, pour qu'on n'ait pas à deviner");

  refuse(() => verbs.open({ id: "a/b" }), /n'est pas un identifiant de document/);
  refuse(() => verbs.open({}), /n'est pas un identifiant de document/);
});

test("save — écrit des octets canoniques et NE TOUCHE À RIEN du contenu", () => {
  const { verbs, storage, bus } = makeDoc();
  const document = characterNamed("aldra", "Aldra");
  document.modified = "2026-01-01T00:00:00Z";

  const ecrit = verbs.save({ document });
  assert.equal(ecrit.replaced, false);
  assert.equal(bus.last("doc-saved").reason, "save");

  /* Un bloc qui réécrirait `modified` rendrait deux sauvegardes du même
     document différentes, et l'empreinte cesserait d'être un témoin. */
  assert.equal(verbs.open({ id: "aldra" }).document.modified, "2026-01-01T00:00:00Z");

  /* Et l'appelant ne tient jamais l'objet du bloc : ce qui sort est cloné. */
  const ouvert = verbs.open({ id: "aldra" });
  ouvert.document.name = "Quelqu'un d'autre";
  assert.equal(verbs.open({ id: "aldra" }).document.name, "Aldra");

  /* La même sauvegarde deux fois n'écrit pas deux formes différentes. */
  const encore = verbs.save({ document, expect: ecrit.hash });
  assert.equal(encore.hash, ecrit.hash);
  assert.equal(encore.replaced, true);
  assert.equal(storage.list().length, 1);
});

test("list — inventorie tout, RAPPORTE ce qui est cassé, et ne jette jamais", () => {
  const { verbs, storage } = makeDoc();
  verbs.save({ document: characterNamed("aldra", "Aldra") });
  verbs.save({ document: characterNamed("bryn", "Bryn") });

  /* Trois façons pour une entrée d'être cassée, posées SANS passer par le
     bloc — c'est-à-dire par la seule porte qui existe vraiment : quelqu'un a
     touché au répertoire à la main. */
  storage.plant("casse", Buffer.from("{ ceci n'est pas du JSON", "utf8"));
  storage.plant("etranger", Buffer.from(JSON.stringify({ schema: "fh-layer/1" }), "utf8"));
  const menteur = exampleDocument();
  menteur.id = "aldra";
  storage.plant("menteur", Buffer.from(JSON.stringify(menteur), "utf8"));

  const entrees = verbs.list();
  assert.deepEqual(entrees.map((entry) => entry.id), ["aldra", "bryn", "casse", "etranger", "menteur"],
    "un inventaire qui CACHE un fichier est pire qu'un inventaire qui en montre un cassé");
  assert.deepEqual(entrees.map((entry) => entry.ok), [true, true, false, false, false]);
  assert.match(entrees[2].reason, /JSON illisible/);
  assert.match(entrees[3].reason, /fh-layer\/1/);
  assert.match(entrees[4].reason, /« menteur ».+« aldra »/s,
    "et l'entrée dont la clef contredit le contenu est nommée par ses DEUX identités");

  /* Les entrées saines portent de quoi reconnaître son personnage sans
     l'ouvrir — et leur empreinte, qui est la clef de l'écrasement délibéré. */
  assert.equal(entrees[0].name, "Aldra");
  assert.equal(entrees[1].level, 1);
  assert.equal(entrees[0].hash.length, 64);

  /* ET LE REFUS RESTE ENTIER AUX AUTRES PORTES : `list` est le seul verbe
     indulgent, et il l'est pour ne rien cacher. */
  refuse(() => verbs.open({ id: "casse" }), /JSON illisible/);
  refuse(() => verbs.export({ id: "etranger" }), /fh-layer\/1/);
  refuse(() => verbs.open({ id: "menteur" }), /la clef du magasin EST l'id du document/i);
});

test("import — stocke les octets TELS QUELS, et `as` renomme jusque DANS le document", () => {
  const { verbs, storage } = makeDoc();
  const octets = exampleBytes();

  const entree = verbs.import({ bytes: octets });
  assert.equal(Buffer.compare(storage.read(entree.id), octets), 0,
    "ce qui entre en octets est stocké tel quel : c'est ce qui rend le voyage byte-identique");

  const copie = verbs.import({ bytes: octets, as: "sylvane-ipad" });
  assert.equal(copie.id, "sylvane-ipad");
  assert.equal(copie.renamed, true);
  assert.equal(verbs.open({ id: "sylvane-ipad" }).document.id, "sylvane-ipad",
    "une clef et un contenu qui se contredisent sont un magasin qu'on ne peut plus relire");
  assert.notEqual(copie.hash, entree.hash, "le document a changé, son empreinte aussi — et ça se dit");

  /* `as` identique à l'id du document ne renomme rien et ne re-sérialise rien. */
  const ailleurs = makeDoc();
  const tel = ailleurs.verbs.import({ bytes: octets, as: "exemple-sylvane-aubelame" });
  assert.equal(tel.renamed, false);
  assert.equal(tel.hash, entree.hash);

  refuse(() => verbs.import({}), /import attend `\{bytes\}`/);
  refuse(() => verbs.import({ bytes: exampleDocument() }), /attendu des octets/);
  refuse(() => verbs.import({ bytes: octets, as: "Un Nom Avec Des Espaces" }),
    /n'est pas un identifiant de document/);
});

test("export — rend des OCTETS, jamais un chemin, jamais un nom de fichier", () => {
  const { verbs, bus } = makeDoc();
  verbs.import({ bytes: exampleBytes() });
  const valise = verbs.export({ id: "exemple-sylvane-aubelame" });

  assert.deepEqual(Object.keys(valise).sort(), ["bytes", "hash", "id", "size"],
    "le bloc ne connaît pas le disque : il ne peut nommer ni un endroit, ni un fichier — " +
    "choisir un nom de fichier, c'est déjà décider à la place du joueur (D2)");
  assert.equal(Buffer.compare(Buffer.from(valise.bytes), exampleBytes()), 0);
  assert.equal(bus.of("doc-saved").length, 1,
    "exporter ne modifie rien, donc n'annonce rien : le seul `doc-saved` est celui de l'import");

  /* Les octets rendus sont une COPIE : muter ce qu'on a reçu ne corrompt pas
     le magasin de tout le monde. */
  Buffer.from(valise.bytes).fill(0);
  assert.equal(Buffer.compare(Buffer.from(verbs.export({ id: "exemple-sylvane-aubelame" }).bytes), exampleBytes()), 0);

  refuse(() => verbs.export({ id: "personne" }), /aucun document « personne »/);
});

test("duplicate — un id neuf que L'APPELANT nomme, et une copie qui date d'aujourd'hui", () => {
  const now = fixedClock("2026-08-08T12:00:00Z");
  const { verbs } = makeDoc({ now });
  const source = characterNamed("aldra", "Aldra");
  source.created = "2026-01-01T00:00:00Z";
  source.modified = "2026-02-02T00:00:00Z";
  verbs.save({ document: source });

  now.set("2026-08-08T09:30:00Z");
  const copie = verbs.duplicate({ id: "aldra", as: "aldra-variante" });
  assert.equal(copie.from, "aldra");
  assert.equal(copie.id, "aldra-variante");

  const document = verbs.open({ id: "aldra-variante" }).document;
  assert.equal(document.id, "aldra-variante");
  assert.equal(document.created, "2026-08-08T09:30:00Z",
    "une copie est un document NEUF : le laisser prétendre avoir été créé avant d'exister est un mensonge daté");
  assert.equal(document.modified, "2026-08-08T09:30:00Z");
  assert.equal(document.name, "Aldra", "tout le reste est recopié à l'identique");
  assert.deepEqual(document.build, source.build);

  /* L'original n'a pas bougé d'un octet. */
  assert.equal(verbs.open({ id: "aldra" }).document.created, "2026-01-01T00:00:00Z");

  /* LES TROIS REFUS DE `duplicate`, chacun nommé. */
  refuse(() => verbs.duplicate({ id: "aldra" }), /ne fabrique aucun identifiant/i);
  refuse(() => verbs.duplicate({ id: "aldra", as: "aldra" }), /l'écriture s'appelle `save`/);
  refuse(() => verbs.duplicate({ id: "aldra", as: "aldra-variante" }), /existe déjà dans le magasin/);
  refuse(() => verbs.duplicate({ id: "personne", as: "x" }), /aucun document « personne »/);
});

/* ── LA COLLISION D'ÉCRITURE : LE DERNIER NE GAGNE PAS EN SILENCE ────── */

test("COLLISION — un document posé par quelqu'un d'autre n'est jamais écrasé en silence", () => {
  const storage = memoryStorage();
  const { verbs } = makeDoc({ storage });

  /* Le magasin porte déjà « aldra » — une session précédente, un autre
     appareil, un fichier déposé à la main. Le bloc ne l'a jamais lu. */
  const ancien = characterNamed("aldra", "Aldra (version du MJ)");
  storage.plant("aldra", Buffer.from(JSON.stringify(ancien, null, 2) + "\n", "utf8"));

  const neuf = characterNamed("aldra", "Aldra (ma version)");
  const refus = refuse(() => verbs.save({ document: neuf }), /le vide battre le rempli sans choix explicite/i);
  assert.match(refus.message, /expect/, "et le refus DIT comment déclarer ce qu'on écrase");
  assert.equal(JSON.parse(storage.read("aldra")).name, "Aldra (version du MJ)",
    "un refus laisse le magasin exactement où il était");

  /* PREMIÈRE ISSUE EXPLICITE : l'ouvrir d'abord. Le bloc sait alors ce qu'il
     écrase, et la boucle ordinaire ne demande rien de plus. */
  verbs.open({ id: "aldra" });
  verbs.save({ document: neuf });
  assert.equal(verbs.open({ id: "aldra" }).document.name, "Aldra (ma version)");

  /* SECONDE ISSUE EXPLICITE : déclarer l'empreinte, celle que `list()` rend. */
  const autre = makeDoc({ storage });
  const empreinte = autre.verbs.list()[0].hash;
  refuse(() => autre.verbs.save({ document: characterNamed("aldra", "Troisième") }), /expect/);
  autre.verbs.save({ document: characterNamed("aldra", "Troisième"), expect: empreinte });
  assert.equal(autre.verbs.open({ id: "aldra" }).document.name, "Troisième");
});

test("COLLISION — le bloc sait ce qu'il a ÉCRIT, pas seulement ce qu'il a lu", () => {
  /* ⚠️ AJOUTÉ LE 2026-08-08 (RELECTEUR Adverserial, seconde passe). Le témoin
     d'empreinte a deux moitiés, et une seule était sous test : le `seen.set`
     d'`open`. Celui de `commit` n'était couvert par rien — mesuré en le
     retirant, les 409 tests restaient VERTS. Or c'est lui qui rend possible la
     boucle ordinaire que le fichier promet en toutes lettres (« le bloc SAIT ce
     qu'il a lu OU ÉCRIT : la boucle ordinaire open → modifier → save ne demande
     donc rien de plus »). Sans lui, les trois portes d'écriture se referment
     derrière elles : on ne peut plus sauvegarder deux fois de suite, ni écrire
     par-dessus ce qu'on vient d'importer ou de dupliquer, sans redéclarer une
     empreinte à chaque tour.

     Les trois portes sont donc éprouvées, chacune SANS `expect` et SANS `open`
     intercalé — c'est tout le propos. */
  const { verbs } = makeDoc();

  verbs.save({ document: characterNamed("aldra", "Aldra") });
  verbs.save({ document: characterNamed("aldra", "Aldra corrigée") });
  assert.equal(verbs.open({ id: "aldra" }).document.name, "Aldra corrigée",
    "save → save : le bloc écrase ce qu'IL a écrit, sans avoir à le relire");

  verbs.import({ bytes: exampleBytes() });
  const importe = characterNamed("exemple-sylvane-aubelame", "Sylvane retouchée");
  verbs.save({ document: importe });
  assert.equal(verbs.open({ id: "exemple-sylvane-aubelame" }).document.name, "Sylvane retouchée",
    "import → save : importer est une écriture, et le bloc s'en souvient comme d'une écriture");

  verbs.duplicate({ id: "aldra", as: "aldra-variante" });
  verbs.save({ document: characterNamed("aldra-variante", "Variante retouchée") });
  assert.equal(verbs.open({ id: "aldra-variante" }).document.name, "Variante retouchée",
    "duplicate → save : la copie aussi est une écriture du bloc");

  /* ET LE PENDANT, sans lequel ce test serait la preuve d'un bloc qui accepte
     tout : ce que le bloc n'a NI lu NI écrit reste refusé. */
  const storage = memoryStorage();
  const autre = makeDoc({ storage });
  storage.plant("etranger", Buffer.from(JSON.stringify(characterNamed("etranger", "Posé à la main")), "utf8"));
  refuse(() => autre.verbs.save({ document: characterNamed("etranger", "Écrasé") }), /ne l'a pas lu/);
});

test("COLLISION — deux écritures qui se croisent : la seconde est refusée en montrant les DEUX empreintes", () => {
  const storage = memoryStorage();
  const moi = makeDoc({ storage });
  const toi = makeDoc({ storage });

  moi.verbs.save({ document: characterNamed("aldra", "Aldra") });
  const monEmpreinte = moi.verbs.open({ id: "aldra" }).hash;
  toi.verbs.open({ id: "aldra" });

  /* Toi écris. Mon empreinte devient périmée sans que rien ne me l'ait dit —
     c'est exactement la situation que le témoin existe pour voir. */
  toi.verbs.save({ document: characterNamed("aldra", "Aldra (par toi)") });

  const refus = refuse(() => moi.verbs.save({ document: characterNamed("aldra", "Aldra (par moi)") }),
    /a changé dans le magasin depuis la dernière lecture/);
  assert.match(refus.message, new RegExp(monEmpreinte.slice(0, 12)), "l'empreinte attendue est dans le message");
  assert.equal(moi.verbs.list()[0].name, "Aldra (par toi)", "et l'écriture de l'autre est intacte");

  /* Relire, rejouer, réécrire : c'est la seule issue, et elle marche. */
  moi.verbs.open({ id: "aldra" });
  moi.verbs.save({ document: characterNamed("aldra", "Aldra (fusionnée)") });
  assert.equal(moi.verbs.list()[0].name, "Aldra (fusionnée)");
});

test("COLLISION — `expect: null` dit « je crée », et il est vérifié dans les deux sens", () => {
  const storage = memoryStorage();
  const { verbs } = makeDoc({ storage });

  verbs.save({ document: characterNamed("aldra", "Aldra"), expect: null });
  refuse(() => verbs.save({ document: characterNamed("aldra", "Encore"), expect: null }), /porte déjà « aldra »/);

  const empreinte = verbs.list()[0].hash;
  storage.forget("aldra");
  const disparu = refuse(() => verbs.save({ document: characterNamed("aldra", "X"), expect: empreinte }),
    /ne porte aucun « aldra »/);
  assert.match(disparu.message, /retiré depuis la lecture/,
    "recréer en silence un document qu'on croyait modifier est la même faute dans l'autre sens");

  refuse(() => verbs.save({ document: characterNamed("aldra", "X"), expect: 12 }), /empreinte/);
});

test("IDENTITÉ — la clef du magasin EST l'id du document, vérifié aux DEUX bouts", () => {
  const storage = memoryStorage();
  const { verbs } = makeDoc({ storage });

  /* À L'ÉCRITURE : impossible de ranger un document ailleurs que sous son id —
     il n'y a aucun argument pour le demander, et c'est le point. La clef est
     dérivée du document, jamais reçue à côté de lui. */
  verbs.save({ document: characterNamed("aldra", "Aldra") });
  assert.deepEqual(storage.list(), ["aldra"]);

  /* À LA LECTURE : un magasin trafiqué à la main est NOMMÉ et refusé, par ses
     deux identités. C'est la seule façon dont deux documents pourraient porter
     le même id dans un magasin — et elle ne survit pas à une lecture. */
  const menteur = characterNamed("aldra", "Aldra");
  storage.plant("bryn", Buffer.from(JSON.stringify(menteur, null, 2) + "\n", "utf8"));
  for (const verbe of ["open", "export", "duplicate"]) {
    const appel = verbe === "duplicate" ? { id: "bryn", as: "neuf" } : { id: "bryn" };
    const refus = refuse(() => verbs[verbe](appel), null, verbe);
    assert.match(refus.message, /« bryn »/, `${verbe} nomme la clef`);
    assert.match(refus.message, /« aldra »/, `${verbe} nomme l'id que le document revendique`);
  }
});

test("LES ÉVÉNEMENTS — doc-opened et doc-saved, et rien d'autre", () => {
  const { verbs, bus } = makeDoc();
  verbs.save({ document: characterNamed("aldra", "Aldra") });
  verbs.open({ id: "aldra" });
  verbs.import({ bytes: exampleBytes() });
  verbs.duplicate({ id: "aldra", as: "aldra-bis" });
  verbs.list();
  verbs.export({ id: "aldra" });

  assert.deepEqual(bus.events.map((event) => event.type),
    ["doc-saved", "doc-opened", "doc-saved", "doc-saved"],
    "lire une liste et exporter ne changent rien, donc n'annoncent rien");
  assert.deepEqual(bus.of("doc-saved").map((event) => event.reason), ["save", "import", "duplicate"],
    "un seul type d'événement, une `reason` qui dit par quelle porte — jamais un type inventé par lot");
  assert.deepEqual(Object.keys(bus.last("doc-opened")).sort(), ["hash", "id", "size", "type"]);
});

/* ── LE MAGASIN SYSTÈME DE FICHIERS, DANS UN RÉPERTOIRE TEMPORAIRE ──── */

function dansUnRepertoireTemporaire(travail) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fhpc-doc-"));
  try { return travail(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test("MAGASIN FICHIER — la racine vient de l'appelant, et il n'y a AUCUN défaut", () => {
  refuse(() => createFsStorage(), /décision D2/);
  refuse(() => createFsStorage({}), /root/);
  dansUnRepertoireTemporaire((dir) => {
    const absent = path.join(dir, "pas-encore");
    const refus = refuse(() => createFsStorage({ root: absent }), /n'existe pas/);
    assert.match(refus.message, /create/, "et il dit quel geste explicite le créerait");
    assert.equal(fs.existsSync(absent), false, "un refus ne fabrique pas un dossier chez quelqu'un");

    createFsStorage({ root: absent, create: true });
    assert.equal(fs.existsSync(absent), true);

    const fichier = path.join(dir, "un-fichier");
    fs.writeFileSync(fichier, "x");
    refuse(() => createFsStorage({ root: fichier }), /n'est pas un répertoire/);
  });
});

test("MAGASIN FICHIER — le voyage complet sur un VRAI disque, et le fichier porte le nom attendu", () => {
  dansUnRepertoireTemporaire((dir) => {
    const storage = createFsStorage({ root: dir });
    const { verbs } = makeDoc({ storage });

    verbs.import({ bytes: exampleBytes() });
    assert.deepEqual(fs.readdirSync(dir), [`exemple-sylvane-aubelame${SUFFIX}`]);
    assert.equal(
      Buffer.compare(fs.readFileSync(path.join(dir, `exemple-sylvane-aubelame${SUFFIX}`)), exampleBytes()), 0,
      "le fichier posé sur le disque EST le fichier reçu — c'est toute la thèse du produit");

    /* LA CONSÉQUENCE OBSERVABLE : un second bloc, monté sur la même racine,
       voit le personnage. Une inspection de code ne prouve pas la
       persistance ; celle-ci si. */
    const relecteur = makeDoc({ storage: createFsStorage({ root: dir }) });
    assert.equal(relecteur.verbs.list()[0].name, "Sylvane Aubelame");
    assert.equal(
      Buffer.compare(Buffer.from(relecteur.verbs.export({ id: "exemple-sylvane-aubelame" }).bytes), exampleBytes()), 0);

    /* Le répertoire est celui du JOUEUR : il a le droit d'y garder autre
       chose, et le magasin ne prétend pas lire ses notes. */
    fs.writeFileSync(path.join(dir, "notes de table.md"), "# ce soir\n");
    assert.deepEqual(storage.list(), ["exemple-sylvane-aubelame"]);

    /* Une écriture ne laisse aucun fichier partiel derrière elle. */
    verbs.duplicate({ id: "exemple-sylvane-aubelame", as: "sylvane-copie" });
    assert.deepEqual(fs.readdirSync(dir).filter((name) => name.includes("partiel")), []);
    assert.deepEqual(storage.list().sort(), ["exemple-sylvane-aubelame", "sylvane-copie"]);
  });
});

test("MAGASIN FICHIER — une clef qui ne peut pas devenir un nom de fichier est REFUSÉE", () => {
  dansUnRepertoireTemporaire((dir) => {
    const storage = createFsStorage({ root: dir });
    for (const mechante of ["../evasion", "sous/dossier", ".cache", "", "a".repeat(200)]) {
      refuse(() => storage.read(mechante), /clef de magasin/, `la clef « ${mechante} »`);
      refuse(() => storage.write(mechante, Buffer.from("x")), /clef de magasin/, `la clef « ${mechante} »`);
    }
    /* LE TÉMOIN : une clef ordinaire passe, et le contrôle n'est donc pas un
       mur qui refuse tout. */
    storage.write("aldra", Buffer.from("{}\n"));
    assert.equal(storage.read("aldra").toString("utf8"), "{}\n");
    assert.equal(storage.read("jamais-ecrit"), null, "une clef absente rend `null`, jamais une erreur");
  });
});
