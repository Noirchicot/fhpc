/* ══ LE GRAPHE VERSIONNÉ — LOT 75 ═════════════════════════════════════════

   CE QUE CE GARDE INTERDIT, ET QUE RIEN D'AUTRE NE VERRAIT :

   GitHub Pages sert CHAQUE fichier avec `cache-control: max-age=600` et un
   etag — en-têtes non négociables, et la loi §0.9 interdit un serveur à
   nous. Le compteur de dix minutes part PAR FICHIER, à sa propre date de
   chargement : après un déploiement, une page ouverte pouvait donc tenir un
   `shell.mjs` neuf et un `abilities-step.mjs` d'avant — suite verte, page
   fausse. Vécu deux fois le 15 août : « 1 à 20 » à l'écran quand le fichier
   livré disait « 3 à 18 ».

   LE REMÈDE EST UNE PROPRIÉTÉ DE GRAPHE, PAS UN RÉGLAGE : tout ce que `ui/`
   référence en relatif — imports statiques ET dynamiques, `href`/`src`
   d'`index.html`, `url()` des CSS — porte `?v=<N>`, et tous portent LE MÊME
   <N>. Un `shell.mjs` ancien en cache importe `./socle.mjs` ancien ; un
   frais importe du frais ; l'hybride est impossible parce que le seul
   décideur est `index.html`, fichier unique qui ne peut pas être « à
   moitié » à jour. Les chargements d'EXÉCUTION (couches, exemple, schéma,
   coquille de fiche, arcanes) lisent le même <N> dans `import.meta.url` du
   module appelant — `ui/builder/version.mjs` — JAMAIS dans une constante
   recopiée, qui serait une deuxième source de vérité libre de mentir.

   POURQUOI UN GARDE : le <N> est dupliqué sur une cinquantaine de lignes,
   et c'est le prix assumé du remède. Cette duplication n'est tenable QUE
   surveillée : le premier import ajouté sans `?v=` rouvrirait le défaut EN
   SILENCE — la page marche en local (pas de cache), marche au premier
   déploiement (rien d'ancien à mélanger), et ment au deuxième. Ce dépôt a
   déjà payé plusieurs fois ce genre d'oubli ; celui-ci ne se verrait JAMAIS
   en test, uniquement chez un joueur, dix minutes après une publication.

   📌 LE GESTE DE PUBLICATION, NOIR SUR BLANC (pour Eric ou un fil futur) :

       node bin/nouvelle-version.mjs      ← incrémente <N> PARTOUT, d'un coup
       npm test                           ← CE fichier vérifie le résultat
       commit — puis push, geste d'Eric.

   Oublier le geste n'est pas le défaut d'origine : les visiteurs des dix
   minutes suivantes gardent l'ancien graphe ENTIER — cohérent — puis
   basculent d'un bloc. L'incrément ne sert qu'à percer le cache tout de
   suite. En revanche une LIGNE sans version remélange : c'est elle que ce
   fichier traque. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";
import { createTestDocument } from "./dom-stub.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui");

/* ── LES RELEVÉS ──────────────────────────────────────────────────────────
   Ils rendent des listes plutôt que d'asserter sur place : la même fonction
   sert au garde et à ses attaques (patron du lot 67). Chaque entrée :
   `{ ref, v }` — `v` est le <N> lu dans `?v=<N>`, ou `null` si la référence
   n'en porte pas. Tout passe par `stripComments` : une référence citée dans
   un commentaire est de la prose, pas un chargement. */

const lireV = (ref) => {
  const m = ref.match(/\?v=(\d+)$/);
  return m ? { ref, v: m[1] } : { ref, v: null };
};

/** Les spécificateurs d'import RELATIFS d'un module — statiques ET
 *  dynamiques : un `import()` atteint tard charge par le même cache HTTP
 *  que les autres, il mélangerait pareil. */
export function releveImports(texteMjs) {
  const texte = stripComments(texteMjs);
  const refs = [];
  for (const m of texte.matchAll(/from\s+["'](\.[^"']+)["']/g)) refs.push(m[1]);
  for (const m of texte.matchAll(/import\(\s*["'](\.[^"']+)["']/g)) refs.push(m[1]);
  return refs.map(lireV);
}

/** Les `href`/`src` relatifs d'une page HTML — c'est `index.html` qui
 *  décide du graphe entier, il n'a droit à aucune ligne nue. */
export function releveHtml(texteHtml) {
  const texte = texteHtml.replace(/<!--[\s\S]*?-->/g, " ");
  const refs = [];
  for (const m of texte.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/g)) {
    if (m[1].startsWith(".")) refs.push(m[1]);
  }
  return refs.map(lireV);
}

/** Les `url()` relatifs d'une feuille de style — les fonds (et tout asset
 *  futur) se chargent par le même cache que les modules. */
export function releveCss(texteCss) {
  const texte = stripComments(texteCss);
  const refs = [];
  for (const m of texte.matchAll(/url\(\s*["']?(\.[^"')]+?)["']?\s*\)/g)) refs.push(m[1]);
  return refs.map(lireV);
}

export function releveFichier(nom, texte) {
  if (nom.endsWith(".mjs")) return releveImports(texte);
  if (nom.endsWith(".html")) return releveHtml(texte);
  if (nom.endsWith(".css")) return releveCss(texte);
  return [];
}

/** Toute `ui/` : les trois familles de fichiers porteurs, récursivement —
 *  un dossier futur sous `ui/` entre dans le garde sans qu'on y pense. */
function fichiersUi() {
  const liste = [];
  const marcher = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { marcher(p); continue; }
      if (/\.(mjs|css|html)$/.test(e.name)) liste.push(p);
    }
  };
  marcher(UI);
  return liste;
}

/** Le relevé de l'arbre réel : `[{ fichier, ref, v }]`. */
function releveArbre() {
  const entrees = [];
  for (const f of fichiersUi()) {
    for (const { ref, v } of releveFichier(f, fs.readFileSync(f, "utf8"))) {
      entrees.push({ fichier: path.relative(ROOT, f), ref, v });
    }
  }
  return entrees;
}

/** Les fautes « référence nue » — rendues nommées, pour que le rouge DISE
 *  la ligne à corriger. */
export function referencesNues(entrees) {
  return entrees.filter((e) => e.v === null)
    .map((e) => `${e.fichier ?? "(fixture)"} → ${e.ref}`);
}

/** Les versions distinctes présentes — la loi en exige EXACTEMENT une. */
export function versionsDistinctes(entrees) {
  return [...new Set(entrees.filter((e) => e.v !== null).map((e) => e.v))];
}

/** Les lignes de `fetch` qui ne lisent pas leur version dans l'URL du
 *  module. Byte-check assumé (patron `shell-wiring`) : `shell.mjs` ne
 *  s'importe pas sous Node, et la DISCIPLINE vaut pour tout fetch futur. */
export function fetchsSansVersion(texteMjs) {
  return stripComments(texteMjs).split("\n")
    .filter((l) => /\bfetch\s*\(/.test(l) && !/versionQuery\(import\.meta\.url\)/.test(l));
}

/* ══ 1 — LA LOI, SUR L'ARBRE RÉEL ════════════════════════════════════════ */

test("1 — 🔴 TOUT ce que ui/ référence en relatif porte `?v=<N>` — une ligne nue rouvre le mélange", () => {
  const entrees = releveArbre();
  assert.deepEqual(referencesNues(entrees), [],
    "chaque référence nommée ici se chargerait par SON propre compteur de cache — c'est le défaut du 15 août");
  /* Les planchers gardent le RELEVÉ lui-même : un regex qui ne trouverait
     plus rien rendrait ce test vert pour toujours. Mesuré au lot 75 :
     50 imports, 3 lignes d'index.html, 2 url() de tokens.css. */
  const parFamille = {
    mjs: entrees.filter((e) => e.fichier.endsWith(".mjs")).length,
    html: entrees.filter((e) => e.fichier.endsWith(".html")).length,
    css: entrees.filter((e) => e.fichier.endsWith(".css")).length
  };
  assert.ok(parFamille.mjs >= 40, `relevé .mjs suspect : ${parFamille.mjs} imports (50 au lot 75)`);
  assert.ok(parFamille.html >= 3, `relevé .html suspect : ${parFamille.html} références (3 au lot 75)`);
  assert.ok(parFamille.css >= 2, `relevé .css suspect : ${parFamille.css} url() (2 au lot 75)`);
});

test("2 — 🔴 UNE seule version dans tout le graphe — deux <N> = deux moitiés de déploiement", () => {
  const versions = versionsDistinctes(releveArbre());
  assert.equal(versions.length, 1,
    `le graphe porte ${versions.length} versions distinctes (${versions.join(", ")}) — ` +
    "le geste est `node bin/nouvelle-version.mjs`, jamais une ligne à la main");
});

test("3 — index.html, le décideur, porte la version sur ses trois chargements", () => {
  const refs = releveHtml(fs.readFileSync(path.join(UI, "builder", "index.html"), "utf8"));
  assert.equal(refs.length, 3, "deux feuilles de style + un module (mesuré au lot 75)");
  assert.deepEqual(refs.filter((r) => r.v === null), []);
});

/* ══ 2 — LES URL D'EXÉCUTION LISENT LEUR MODULE, PAS UNE CONSTANTE ═══════
   `import.meta.url` d'un module chargé en `?v=888` PORTE ce `?v=888` : on
   importe donc les vrais modules sous une version inventée et on regarde
   les URL qu'ils fabriquent. C'est aussi la MESURE du piège n°1 du mandat
   (double chargement sous Node) : ces imports créent une DEUXIÈME instance
   de chaque module à côté de celle, sans query, des autres tests — et tout
   reste juste, parce qu'aucun module de `ui/` ne tient d'état de niveau
   module hors `shell.mjs`, que personne n'importe deux fois. */

globalThis.document = globalThis.document ?? createTestDocument();

test("4 — versionQuery lit l'URL qu'on lui donne, et rend «» sans query (Node, tests)", async () => {
  const { versionQuery } = await import("../ui/builder/version.mjs");
  assert.equal(versionQuery("https://exemple.test/ui/builder/engine.mjs?v=42"), "?v=42");
  assert.equal(versionQuery("file:///depot/ui/builder/engine.mjs"), "");
});

test("5 — les arcanes portent la version du module qui les demande", async () => {
  const frais = await import("../ui/builder/destiny-step.mjs?v=888");
  assert.equal(frais.arcanaImageSrc("fh:arcana:en:death"), "./assets/arcana/death.jpg?v=888");
  assert.ok(frais.ARCANA_BACK_SRC.endsWith("/back.jpg?v=888"), frais.ARCANA_BACK_SRC);
  /* Sans query — le cas des tests et de Node — les URL sont celles d'avant
     le lot : rien à percer sur un chemin local. */
  const nu = await import("../ui/builder/destiny-step.mjs");
  assert.equal(nu.arcanaImageSrc("fh:arcana:en:death"), "./assets/arcana/death.jpg");
});

test("6 — le moteur demande couches, exemple et schéma SOUS SA version — la pile monte quand même", async () => {
  const vraiFetch = globalThis.fetch;
  const demandees = [];
  globalThis.fetch = async (url) => {
    demandees.push(String(url));
    const octets = fs.readFileSync(String(url).split("?")[0]);
    return {
      ok: true,
      status: 200,
      arrayBuffer: async () => octets.buffer.slice(octets.byteOffset, octets.byteOffset + octets.byteLength),
      json: async () => JSON.parse(octets.toString("utf8"))
    };
  };
  try {
    const { bootEngine, loadExampleDocument, loadDocSchema, LAYER_FILES } =
      await import("../ui/builder/engine.mjs?v=888");
    /* `root` absolu : le stub lit le disque là où la page lirait le site. */
    const { build, layers } = await bootEngine({ root: ROOT });
    await loadExampleDocument({ root: ROOT });
    await loadDocSchema({ root: ROOT });
    assert.equal(demandees.length, LAYER_FILES.length + 2, "cinq couches + l'exemple + le schéma");
    assert.deepEqual(demandees.filter((u) => !u.endsWith("?v=888")), [],
      "une URL d'exécution sans la version du module rechargerait la pièce d'AVANT depuis le cache");
    /* La pile a réellement monté — avec des modules `src` dédoublés par la
       query (piège n°1) : des fabriques pures, instanciées par appel. */
    assert.ok(build && layers, "bootEngine rend { build, layers }");
  } finally {
    globalThis.fetch = vraiFetch;
  }
});

test("7 — toute ligne `fetch(` de ui/ lit sa version — la coquille de fiche comprise", () => {
  const fautes = [];
  for (const f of fichiersUi().filter((f) => f.endsWith(".mjs"))) {
    for (const ligne of fetchsSansVersion(fs.readFileSync(f, "utf8"))) {
      fautes.push(`${path.relative(ROOT, f)} → ${ligne.trim()}`);
    }
  }
  assert.deepEqual(fautes, [],
    "un fetch nu se charge par son propre compteur de cache — même famille que l'import nu");
  /* Et la coquille, nommément : `new URL(relatif, base)` JETTE la query de
     la base (mesuré lot 75) — la version doit être DANS le chemin. */
  const shell = stripComments(fs.readFileSync(path.join(UI, "builder", "shell.mjs"), "utf8"));
  assert.match(shell, /fiche\.shell\.html\$\{versionQuery\(import\.meta\.url\)\}/,
    "la coquille doit porter la version dans son CHEMIN, import.meta.url en base ne la transmet pas");
});

/* ══ 3 — ⚔️ LES ATTAQUES : chaque famille d'oubli, nommée par le garde ═══
   Fixtures en chaînes pures — aucun fichier temporaire : les relevés
   travaillent sur du texte, on les attaque sur du texte. Les `?v=888` de
   ce fichier vivent hors de `ui/` : `bin/nouvelle-version.mjs` ne les
   réécrira jamais. */

test("⚔️ ATTAQUE 1 — un import ajouté sans `?v=` est nommé, statique ou dynamique", () => {
  const texte = [
    'import { a } from "./carnet.mjs?v=7";',
    'import { b } from "./oubli.mjs";',
    'const { c } = await import("../../src/oubli-tardif.mjs");'
  ].join("\n");
  assert.deepEqual(referencesNues(releveImports(texte)),
    ["(fixture) → ./oubli.mjs", "(fixture) → ../../src/oubli-tardif.mjs"]);
});

test("⚔️ ATTAQUE 2 — deux <N> dans le graphe (le déploiement à moitié incrémenté) rougissent", () => {
  const entrees = [
    ...releveImports('import { a } from "./socle.mjs?v=7";'),
    ...releveImports('import { b } from "./carnet.mjs?v=8";')
  ];
  assert.deepEqual(versionsDistinctes(entrees).sort(), ["7", "8"]);
});

test("⚔️ ATTAQUE 3 — dans index.html, le script oublié est vu même quand les styles sont bons", () => {
  const html = '<link rel="stylesheet" href="./tokens.css?v=7">\n' +
    '<link rel="stylesheet" href="./shell.css?v=7">\n' +
    '<script type="module" src="./shell.mjs"></script>';
  assert.deepEqual(referencesNues(releveHtml(html)), ["(fixture) → ./shell.mjs"]);
});

test("⚔️ ATTAQUE 4 — un `url()` nu en CSS est vu ; cité en commentaire, il ne compte pas", () => {
  const css = '/* l\'ancien monde : url("./assets/bg-day.jpg") */\n' +
    ':root { --bg-image: url("./assets/bg-night.jpg"); }';
  assert.deepEqual(referencesNues(releveCss(css)), ["(fixture) → ./assets/bg-night.jpg"]);
});

test("⚔️ ATTAQUE 5 — un fetch qui ne lit pas sa version est nommé, celui qui la lit passe", () => {
  const texte = 'const a = await fetch(`${root}/layers/x.json`);\n' +
    'const b = await fetch(`${root}/layers/y.json${versionQuery(import.meta.url)}`);';
  assert.deepEqual(fetchsSansVersion(texte), ["const a = await fetch(`${root}/layers/x.json`);"]);
});

test("⚔️ ATTAQUE 6 — une version qui n'est pas un entier (`?v=beta`) compte comme NUE", () => {
  assert.deepEqual(referencesNues(releveImports('import { a } from "./socle.mjs?v=beta";')),
    ["(fixture) → ./socle.mjs?v=beta"]);
});
