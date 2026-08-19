/* Lot 9 — LE BLOC DERRIÈRE LE NOYAU, ET SES LOIS DE FRONTIÈRE.

   ⚠️ LES GARDES SONT ÉCRITS POUR ÊTRE ATTAQUÉS. Le 2026-08-08, `play-block` a
   montré qu'un garde vert depuis trois lots pouvait ne rien garder : il
   comptait des fichiers, et pointé ailleurs il comptait toujours. Ici comme au
   lot 7, l'inspection est une FONCTION PURE (`inspect`) et son périmètre une
   autre (`perimeterGaps`) ; les deux tournent sur le vrai `src/build/` ET sur
   des sources fabriquées qui les violent, une violation à la fois.

   Le périmètre est une LISTE DE NOMS, pas un compte. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createBuild } from "../src/build/index.mjs";
import { CHOICE_PATH, OVERRIDE_PATH } from "../src/build/paths.mjs";
import { SPELL_TEXT_MAX } from "../src/build/derive.mjs";
import { loadSources, findForbidden, HOUSE_MECHANICS, LAYER_NAMES } from "./source-scan.mjs";
import { makeHarness, acceptanceDocument } from "./build-harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(here, "..", "src", "build");
const sources = () => loadSources([buildDir], buildDir);

/* ── GARDE 1 : LES DÉPENDANCES INTERDITES ───────────────────────────── */

const FORBIDDEN = [
  /* Le DOM. Même remarque qu'au bloc `layers` : on n'interdit pas le mot
     `document`, qui est le mot du DOMAINE ici (le bloc reçoit et rend des
     documents `fh-char/1`). On interdit le DOM par ses formes atteignables. */
  [/\bwindow\b/, "window"],
  [/globalThis\s*\.\s*document\b/, "globalThis.document"],
  [/\bdocument\s*\.\s*(getElementById|querySelector|createElement|body|head|write)\b/, "le document du DOM"],
  [/querySelector/, "querySelector"],
  [/\binnerHTML\b/, "innerHTML"],
  [/\blocalStorage\b/, "localStorage"],
  // Le réseau appartient au bloc `table`, jamais à qui dérive une fiche.
  [/\bfetch\s*\(/, "fetch("],
  [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/\bsetTimeout\b/, "setTimeout"],
  [/\bsetInterval\b/, "setInterval"],
  /* LE DISQUE. Au M2, le bloc `doc` n'existe pas : le bloc `build` reçoit et
     rend des documents EN MÉMOIRE. Lire un fichier appartient à qui le
     possède, et ce n'est pas lui. */
  [/node:fs\b/, "node:fs"],
  [/node:path\b/, "node:path"],
  [/\breadFileSync\b/, "readFileSync"],
  [/\bwriteFileSync\b/, "writeFileSync"],
  [/\bhomedir\b/, "homedir"],
  // Une dérivation est déterministe : deux plis des mêmes choix sont égaux.
  [/Math\.random/, "Math.random"],
  /* LA PILE. `query` est le SEUL chemin de lecture du contenu : un import
     direct ferait de `src/layers/` une dépendance de compilation du dériveur,
     et il n'y aurait plus rien à vérifier. */
  [/\.\.\/layers\//, "un import de src/layers/"],
  [/\.\.\/play\//, "un import de src/play/"],
  [/\.\.\/modules\//, "un import de src/modules/"],
  [/\.\.\/tools\//, "un import de src/tools/"],
  /* AUCUNE COUCHE, AUCUNE LANGUE EN DUR. La dérivation LIT `units.distance`
     et `lang`, elle ne les devine jamais et ne connaît le nom d'aucune couche. */
  [/srd-5\.2\.1/, "l'id d'une couche en dur"],
  [/["'](fr|en)["']/, "une langue en dur"]
];

/* L'HORLOGE est la seule dépendance non déterministe du bloc, et elle est
   INJECTABLE. `clock.mjs` porte le défaut de plate-forme et il est le seul
   fichier autorisé à nommer `Date` — même partage que `src/play/utils.mjs`
   pour le hasard. */
const CLOCK_ONLY = [[/\bnew Date\b|\bDate\.now\b/, "l'horloge de plate-forme"]];

function inspect(list) {
  return findForbidden(list, FORBIDDEN)
    .concat(findForbidden(list.filter(({ name }) => name !== "clock.mjs"), CLOCK_ONLY))
    .map(({ name, label }) => `src/build/${name} : « ${label} »`);
}

/* ── GARDE 2 : LE PÉRIMÈTRE, PAR SES NOMS ───────────────────────────── */

/* REWRITTEN 2026-08-08 (lot 19) — `validate.mjs` entre dans la liste le jour
   où il entre dans le répertoire. Un fichier neuf est DÉJÀ jugé par GARDE 1
   (le périmètre ne borne pas ce qui est inspecté), mais tant qu'il n'est pas
   nommé ici, sa DISPARITION passerait inaperçue — et c'est lui qui porte le
   seul contrôle exécuté de l'invariant de somme. */
const MUST_INSPECT = ["block.mjs", "clock.mjs", "derive.mjs", "diff.mjs", "errors.mjs", "index.mjs", "paths.mjs", "validate.mjs"];
function perimeterGaps(list) {
  const seen = new Set(list.map((source) => source.name));
  return MUST_INSPECT.filter((name) => !seen.has(name));
}

/* ── GARDE 3 : LE VOCABULAIRE FRANÇAIS DE JEU ───────────────────────────
   « Le moteur produit des IDENTIFIANTS, l'interface produit des MOTS »
   (loi §0.13). Une table `"Sagesse" → wis` dans `src/build/` serait LA faute
   que ce lot existe pour éviter — le contrat DERIVATION-FIELDS.md §1 la nomme
   mot pour mot comme l'une des deux raisons de son existence.

   Le garde mord sur les LITTÉRAUX autant que sur le code : un nom de jeu
   français dans un message d'erreur est un nom de jeu français dans le
   moteur, et c'est par là qu'une table de correspondance commence. */
const FRENCH_GAME_WORDS = [
  ["Force", "Dextérité", "Constitution", "Intelligence", "Sagesse", "Charisme"],
  ["Acrobaties", "Arcanes", "Athlétisme", "Discrétion", "Dressage", "Escamotage", "Histoire",
    "Intimidation", "Intuition", "Investigation", "Médecine", "Nature", "Perception", "Persuasion",
    "Religion", "Représentation", "Survie", "Tromperie"]
].flat().map((word) => [new RegExp(`\\b${word}\\b`), word]);

/* ── le bloc sur le noyau et sa surface ─────────────────────────────── */

test("l'instance ne rend que {name, verbs} — l'état du bloc n'a aucune poignée", () => {
  const h = makeHarness();
  assert.deepEqual(Object.keys(h.build).sort(), ["name", "verbs"]);
  assert.equal(h.build.name, "build");
  assert.deepEqual(Object.keys(h.build.verbs).sort(),
    ["choose", "clear", "decisions", "override", "rebuild", "set", "validate"],
    "`decisions` entre le 2026-08-20 : le carnet SANS la dérivation, pour l'écran qui n'est pas encore dérivable");
});

/* ══ LE CARNET SANS LA DÉRIVATION — 2026-08-20 ═════════════════════════════
   🔴 CE TEST EXISTE PARCE QU'UN ÉCRAN EST MORT EN SILENCE, et qu'aucune suite
   ne l'a vu : `I changed my mind` sur l'étape Class effaçait le choix `class`,
   la coquille rappelait `rebuild`, et `derive` jetait — écran figé, geste
   perdu. La page l'a montré, 1241 tests verts ne l'ont pas montré.

   ⭐ CE QUE LE VERBE PROMET, ET QUI EST TOUT L'INTÉRÊT : là où `rebuild` n'a
   plus rien à dire, `decisions` sait encore dire CE QU'IL MANQUE et avec quoi
   le réparer. C'est la seule chose dont l'écran de Class ait besoin.
   ⛔ Et il n'écrit rien : le refus de `rebuild` reste entier juste après. */
test("`decisions` rend le carnet là où `rebuild` ne peut plus dériver — sans classe", () => {
  const h = makeHarness();
  const complet = acceptanceDocument(h.layers);
  const sansClasse = {
    ...complet,
    build: { ...complet.build, choices: complet.build.choices.filter((c) => c.path !== "class") }
  };

  /* ① LE REFUS DE `derive` TIENT — on ne l'a pas désarmé. */
  assert.throws(() => h.build.verbs.rebuild({ document: sansClasse }), /aucun choix `class`/);

  /* ② ET LE CARNET RÉPOND QUAND MÊME, en nommant le plan à remplir. */
  const { decisions } = h.build.verbs.decisions({ document: sansClasse });
  const plan = decisions.find((d) => d.path === "class");
  assert.ok(plan, "le carnet publie le plan `class` même sans choix `class`");
  assert.equal(plan.answered, 0, "rien n'est répondu — c'est justement l'état qu'on vient de créer");
  assert.ok(plan.options.length > 0, "et il porte de quoi répondre : les classes de la pile");

  /* ③ SUR UN DOCUMENT COMPLET, LES DEUX CHEMINS DISENT LA MÊME CHOSE — sinon
     l'écran verrait un carnet selon qu'on a dérivé ou non. */
  const parRebuild = h.build.verbs.rebuild({ document: complet }).decisions;
  const parVerbe = h.build.verbs.decisions({ document: complet }).decisions;
  assert.deepEqual(parVerbe, parRebuild, "même carnet, dérivé ou pas");
});

test("createBuild refuse de se construire sans bus et sans dispatch", () => {
  assert.throws(() => createBuild({}), /needs a bus/);
  assert.throws(() => createBuild({ bus: { emit() {} } }), /needs a bus/, "il lui faut aussi `on` : il ÉCOUTE layers-changed");
  assert.throws(() => createBuild({ bus: { emit() {}, on() {} } }), /needs a dispatch/);
});

/* REWRITTEN 2026-08-08 (lot 19) — `layers.flags` ENTRE DANS LA LISTE, et
   l'assertion n'est pas relâchée : elle reste une liste EXACTE, et c'est elle
   qui a rougi la première quand la troisième route est apparue.

   La route est due, pas commode. Une statistique dérivée est produite par un
   module activé par un DRAPEAU DE COUCHE (décision Q4) : sans lire les
   drapeaux, le bloc n'aurait le choix qu'entre allumer tous les modules
   injectés (loi §0.12 rompue — un personnage SRD pur porterait alors une
   mécanique maison) et n'en allumer aucun. Ce qui reste interdit n'a pas
   changé : ni `register`, ni `enable`, ni `disable`, ni `ruleValues`. */
test("le bloc ne lit la pile QUE par dispatch — et seulement par `layers.query`, `layers.stack` et `layers.flags`", () => {
  const h = makeHarness();
  h.dispatched.length = 0;
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.deepEqual([...new Set(h.dispatched)].sort(), ["layers.flags", "layers.query", "layers.stack"],
    "aucune autre route n'est empruntée : ni `register`, ni `enable`, ni `ruleValues`");
});

/* ── les gardes, et leurs attaques ──────────────────────────────────── */

test("ZÉRO DOM, ZÉRO RÉSEAU, ZÉRO DISQUE, AUCUN IMPORT D'UN AUTRE BLOC dans src/build/", () => {
  assert.deepEqual(inspect(sources()), []);
});

test("ATTAQUE DU GARDE — chacun des interdits, violé une fois, est vu et NOMMÉ", () => {
  const violations = [
    ["disque.mjs", 'import { readFileSync } from "node:fs";'],
    ["dom.mjs", "const el = document.getElementById('x');"],
    ["fenetre.mjs", "const w = window.innerWidth;"],
    ["reseau.mjs", "await fetch('https://exemple');"],
    ["minuteur.mjs", "setTimeout(() => {}, 10);"],
    ["hasard.mjs", "const r = Math.random();"],
    ["horloge.mjs", "const at = Date.now();"],
    ["pile.mjs", 'import { createLayers } from "../layers/index.mjs";'],
    ["moteur.mjs", 'import { createPlay } from "../play/session.mjs";'],
    ["langue.mjs", 'const langs = ["fr", "en"];'],
    ["couche.mjs", 'const base = "srd-5.2.1-fr";']
  ];
  for (const [name, source] of violations) {
    const found = inspect([{ name, text: source }]);
    assert.ok(found.length > 0, `« ${source} » aurait dû être vu dans ${name}`);
    assert.match(found[0], new RegExp(name.replace(".", "\\.")), "et la violation nomme son fichier");
  }
  /* L'exemption de l'horloge est NOMMÉE, pas générale : le même code dans
     `clock.mjs` passe, ailleurs il est vu. Sans ce pendant, le garde pourrait
     n'être qu'un refus universel. */
  assert.deepEqual(inspect([{ name: "clock.mjs", text: "return new Date().toISOString();" }]), []);
  assert.equal(inspect([{ name: "derive.mjs", text: "return new Date().toISOString();" }]).length, 1);
  // Et le vocabulaire du domaine passe : « document » n'est pas le DOM.
  assert.deepEqual(inspect([
    { name: "sain.mjs", text: 'const build = document.build;\nconst view = query({ kind, id });' }
  ]), []);
});

test("ATTAQUE DU PÉRIMÈTRE — le garde refuse d'être pointé sur le vide ou sur un répertoire amputé", () => {
  assert.deepEqual(perimeterGaps(sources()), [], "le vrai répertoire est complet");
  assert.deepEqual(perimeterGaps([]), MUST_INSPECT, "un périmètre vide n'est jamais une réussite");
  assert.deepEqual(
    perimeterGaps(sources().filter((source) => source.name !== "derive.mjs")),
    ["derive.mjs"],
    "et un seul fichier soustrait se voit, nommément"
  );
  /* L'autre bout : un fichier NEUF dans `src/build/` tombe sous la loi sans
     qu'on ait rien à déclarer. La liste prouve qu'on regarde au bon endroit ;
     elle ne borne pas ce qui est inspecté. */
  const withNew = sources().concat({ name: "neuf.mjs", text: "import fs from 'node:fs';" });
  assert.deepEqual(perimeterGaps(withNew), []);
  assert.equal(inspect(withNew).length, 1, "et il est jugé comme les autres");
  /* Et le garde marche l'ARBRE : un sous-répertoire ne serait pas une porte de
     sortie. `loadSources` est récursif — vérifié sur le vrai répertoire. */
  assert.ok(sources().length >= MUST_INSPECT.length);
});

test("AUCUN NOM FRANÇAIS DE JEU DANS src/build/ — pas de table « Sagesse » → wis", () => {
  const hits = findForbidden(sources(), FRENCH_GAME_WORDS);
  assert.deepEqual(hits, [], "les mots viennent des RECORDS, jamais du moteur (loi §0.13)");
});

test("ATTAQUE DU GARDE DE VOCABULAIRE — la faute que ce lot existe pour éviter est vue", () => {
  const faute = 'const TABLE = { "Sagesse": "wis", "Force": "str" };';
  const found = findForbidden([{ name: "traduction.mjs", text: faute }], FRENCH_GAME_WORDS);
  assert.deepEqual(found.map((hit) => hit.label).sort(), ["Force", "Sagesse"]);
  // Une compétence aussi, et jusque dans un message d'erreur.
  assert.equal(findForbidden([{ name: "x.mjs", text: 'fail("la compétence Perception manque");' }], FRENCH_GAME_WORDS).length, 1);
  // Et le pendant : le vocabulaire MACHINE passe entier.
  assert.deepEqual(findForbidden([
    { name: "sain.mjs", text: 'const ABILITY_KEYS = ["str","dex","con","int","wis","cha"];' }
  ], FRENCH_GAME_WORDS), []);
});

/* ── GARDE 4 : LA LOI §0.12 DANS LE PLI ─────────────────────────────────
   AJOUTÉ LE 2026-08-08 (lot 19). « LE SRD EST LA BASE, FH EST UNE COUCHE
   PAR-DESSUS » : le garde existait pour `src/play/` et `src/doc/`, il ne
   couvrait pas `src/build/`. Il le couvre maintenant, et c'est le lot qui l'a
   rendu nécessaire — la première mécanique maison du pli, le Score de
   Destinée, vient d'y entrer par un MODULE injecté.

   MESURÉ AVANT DE POSER : zéro occurrence dans le vrai `src/build/`, aucune
   suite ne rougit. Un garde qui crie au loup se fait désactiver.

   Les deux listes vont ensemble et elles gardent deux choses différentes :
   HOUSE_MECHANICS interdit le VOCABULAIRE de la maison (Destiny, Chaos,
   Arcana…), LAYER_NAMES interdit de NOMMER la couche — c'est ce dernier qui
   ferme la porte par laquelle un `import { createFhDestinyStat } from
   "../modules/fh/…"` entrerait, en plus du motif `../modules/` de GARDE 1. */

test("LOI §0.12 — aucune mécanique Fate's Hand n'est citée dans src/build/", () => {
  assert.deepEqual(findForbidden(sources(), HOUSE_MECHANICS), [],
    "le pli est le chemin commun : un personnage SRD pur doit le traverser de bout en bout");
  assert.deepEqual(findForbidden(sources(), LAYER_NAMES), [],
    "et il ne nomme aucune couche — les modules s'INJECTENT, ils ne s'importent pas");
});

test("ATTAQUE DU GARDE §0.12 — la faute passe par le pli, une fois chacune, et elle est vue", () => {
  const violations = [
    ["derive.mjs", "const score = entry.destinyBase + proficiency;", "Destiny"],
    ["derive.mjs", "if (spendDestiny) return null;", "Destiny"],
    ["derive.mjs", "const table = rollChaos();", "Chaos"],
    ["derive.mjs", "const impact = card.arcana;", "Arcana"],
    ["derive.mjs", "settleAwakening(card);", "Awakening"],
    ["derive.mjs", "const over = applyOverreach(x);", "Overreach"]
  ];
  for (const [name, text, label] of violations) {
    const found = findForbidden([{ name, text }], HOUSE_MECHANICS);
    assert.equal(found.length, 1, `« ${text} » aurait dû être vu`);
    assert.equal(found[0].label, label);
  }
  // L'import du module, lui, est vu DEUX FOIS : par le périmètre et par le nom.
  const importFh = [{ name: "derive.mjs", text: 'import { createFhDestinyStat } from "../modules/fh/destiny-stat.mjs";' }];
  assert.equal(inspect(importFh).length, 1, "GARDE 1 voit le répertoire");
  assert.ok(findForbidden(importFh, LAYER_NAMES).length > 0, "et GARDE 4 voit le nom de la couche");

  /* LE PENDANT, sans lequel le garde ne serait qu'un refus universel : le
     vocabulaire du pli passe entier, y compris `fate` là où il n'est pas le
     mot de la maison — et ce dernier cas est celui qui a failli manquer. */
  assert.deepEqual(findForbidden([{
    name: "sain.mjs",
    text: "const stats = []; for (const statModule of modules) { if (!flags.includes(statModule.flag)) continue; }"
  }], HOUSE_MECHANICS.concat(LAYER_NAMES)), [], "un pli qui parle de modules et de drapeaux ne nomme aucune couche");
});

/* ── le garde de dérive schéma ↔ code ───────────────────────────────── */

test("les deux grammaires de chemin sont celles du SCHÉMA, mot pour mot", () => {
  /* Deux copies d'une règle divergent toujours, sauf si quelque chose les
     compare (leçon `layers-document`). Le code en porte une copie parce qu'il
     doit DÉCOUPER un chemin, pas seulement le valider ; ce test est le
     comparateur. */
  const schema = JSON.parse(fs.readFileSync(path.join(here, "..", "schemas", "fh-char.schema.json"), "utf8"));
  assert.equal(CHOICE_PATH.source, schema.$defs.choicePath.pattern);
  assert.equal(OVERRIDE_PATH.source, schema.$defs.overridePath.pattern);

  /* Même raison pour le plafond du texte de sort : la dérivation doit DÉCIDER
     (porter le texte, ou le déclarer trop long), pas seulement valider — elle
     en porte donc une copie. Ce comparateur est ce qui empêche les deux
     nombres de diverger.
     📌 Écrit après coup : une attaque a montré que le commentaire de
     `derive.mjs` promettait ce test alors qu'il n'existait pas. Une promesse
     en commentaire n'est pas une garantie. */
  assert.equal(
    SPELL_TEXT_MAX,
    schema.$defs.resolved.properties.spellcasting.oneOf[1].properties.spells.items.properties.text.maxLength
  );
});
