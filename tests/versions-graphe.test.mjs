/* ══ LE GRAPHE VERSIONNÉ — LOT 75 ═════════════════════════════════════════

   CE QUE CE GARDE INTERDIT, ET QUE RIEN D'AUTRE NE VERRAIT :

   GitHub Pages sert CHAQUE fichier avec `cache-control: max-age=600` et un
   etag — en-têtes non négociables, et la loi §0.9 interdit un serveur à
   nous. Le compteur de dix minutes part PAR FICHIER, à sa propre date de
   chargement : après un déploiement, une page ouverte pouvait donc tenir un
   `shell.mjs` neuf et un `abilities-step.mjs` d'avant — suite verte, page
   fausse. Vécu deux fois le 15 août : « 1 à 20 » à l'écran quand le fichier
   livré disait « 3 à 18 ».

   LE REMÈDE EST UNE PROPRIÉTÉ DE GRAPHE, PAS UN RÉGLAGE : tout ce que la
   page charge porte `?v=<N>`, et tous portent LE MÊME <N>. Un graphe ancien
   reste entièrement ancien ; un frais, entièrement frais ; l'hybride est
   impossible parce que le seul décideur est `index.html`, fichier unique
   qui ne peut pas être « à moitié » à jour.

   LA VERSION VIT À DEUX ENDROITS, ET LA FRONTIÈRE EST MESURÉE :
   · `ui/` — chaque import relatif, statique ou dynamique, porte `?v=<N>` en
     toutes lettres, comme les `href`/`src` d'`index.html` et les `url()`
     des CSS. Sans danger côté Node : aucun module de `ui/` ne tient d'état
     de niveau module hors `shell.mjs`, que rien n'importe en versionné.
   · `src/` — les SOURCES RESTENT VIERGES DE QUERY. Les versionner a
     DÉDOUBLÉ le kernel sous Node (`registry.mjs` : `blocks = new Map()`
     atteint nu par les tests et en `?v=1` par les entrées → « missing
     block(s): layers », 35 tests rouges, serveur MCP sur le tuyau compris —
     mesuré au lot 75). C'est l'IMPORT MAP générée d'`index.html` qui donne
     au navigateur leurs URL versionnées : mêmes propriétés, zéro query dans
     ce que Node importe. Les chargements d'EXÉCUTION (couches, exemple,
     schéma, coquille, arcanes) lisent le <N> dans `import.meta.url` du
     module appelant — `ui/builder/version.mjs`, jamais une constante.

   POURQUOI UN GARDE : le <N> est dupliqué sur une cinquantaine de lignes de
   `ui/` plus une map d'une vingtaine d'entrées, et c'est le prix assumé du
   remède. Cette duplication n'est tenable QUE surveillée : le premier
   import ajouté sans `?v=`, ou le premier module `src/` qui entre dans le
   graphe sans entrer dans la map, rouvrirait le défaut EN SILENCE — la page
   marche en local (pas de cache), marche au premier déploiement (rien
   d'ancien à mélanger), et ment au deuxième. Ce défaut ne se verrait JAMAIS
   en test : uniquement chez un joueur, dix minutes après une publication.

   📌 LE GESTE DE PUBLICATION, NOIR SUR BLANC (pour Eric ou un fil futur) :

       node bin/nouvelle-version.mjs      ← incrémente <N> PARTOUT, d'un
                                            coup, et RECALCULE la map
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
const BUILDER = path.join(UI, "builder");

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

/** Le relevé de l'arbre `ui/` réel : `[{ fichier, ref, v }]`. */
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

/* ── LA FERMETURE ET LA MAP ──────────────────────────────────────────────
   Le même graphe que la page : depuis chaque module de `ui/builder/`, tous
   les imports relatifs, query mise de côté pour trouver le fichier. Rendu :
   les fichiers `src/` atteints et leurs arêtes internes. */

export function fermetureNavigateur() {
  const vus = new Set();
  const aretesSrc = [];
  const marcher = (fichier) => {
    if (vus.has(fichier)) return;
    vus.add(fichier);
    for (const { ref } of releveImports(fs.readFileSync(fichier, "utf8"))) {
      const cible = path.resolve(path.dirname(fichier), ref.split("?")[0]);
      if (!fichier.startsWith(UI)) aretesSrc.push({ de: path.relative(ROOT, fichier), ref, cible });
      marcher(cible);
    }
  };
  for (const f of fs.readdirSync(BUILDER).filter((f) => f.endsWith(".mjs"))) {
    marcher(path.join(BUILDER, f));
  }
  return { fichiers: [...vus], aretesSrc };
}

/** Les clefs que la map DOIT porter : chaque cible d'arête interne à
 *  `src/`, en URL vue depuis `ui/builder/` — triées, uniques. */
export function clefsAttendues(aretesSrc) {
  return [...new Set(aretesSrc.map((a) => "../../" + path.relative(ROOT, a.cible).split(path.sep).join("/")))].sort();
}

/** Les arêtes de `src/` qui portent une query — interdites : Node importe
 *  ces fichiers nus, une query y dédouble les instances (kernel compris). */
export function querysDansSrc(aretesSrc) {
  return aretesSrc.filter((a) => a.ref.includes("?")).map((a) => `${a.de} → ${a.ref}`);
}

/** La map d'`index.html`, parsée — `null` si absente. */
export function carteDIndex(texteHtml) {
  const m = texteHtml.match(/<script type="importmap">\s*([\s\S]*?)\s*<\/script>/);
  if (!m) return null;
  return JSON.parse(m[1]).imports ?? {};
}

/** Les fautes de la map, NOMMÉES : clef manquante (un module src/ entré
 *  dans le graphe sans entrer dans la map — le défaut du 15 août, un étage
 *  plus bas), clef en trop (une map qui dérive du graphe réel), valeur qui
 *  n'est pas `clef?v=<N>`. */
export function fautesDeCarte(attendues, imports) {
  const fautes = [];
  const presentes = Object.keys(imports).sort();
  for (const c of attendues) if (!(c in imports)) fautes.push(`manquante : ${c}`);
  for (const c of presentes) if (!attendues.includes(c)) fautes.push(`en trop : ${c}`);
  for (const [clef, valeur] of Object.entries(imports)) {
    if (!new RegExp(`^${clef.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\?v=\\d+$`).test(valeur)) {
      fautes.push(`valeur fausse : ${clef} → ${valeur}`);
    }
  }
  return fautes;
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

test("2 — 🔴 UNE seule version dans tout le graphe, map comprise — deux <N> = deux moitiés de déploiement", () => {
  const html = fs.readFileSync(path.join(BUILDER, "index.html"), "utf8");
  const carte = carteDIndex(html) ?? {};
  const entrees = [
    ...releveArbre(),
    ...Object.values(carte).map((valeur) => lireV(valeur))
  ];
  const versions = versionsDistinctes(entrees);
  assert.equal(versions.length, 1,
    `le graphe porte ${versions.length} versions distinctes (${versions.join(", ")}) — ` +
    "le geste est `node bin/nouvelle-version.mjs`, jamais une ligne à la main");
});

test("3 — index.html, le décideur : AUCUN chargement ne part sans version", () => {
  const refs = releveHtml(fs.readFileSync(path.join(BUILDER, "index.html"), "utf8"));

  /* LA PROPRIÉTÉ, et c'est elle qui compte : un seul chargement nu suffit à
     rendre le déploiement mi-neuf mi-caché — le défaut du 15 août. */
  assert.deepEqual(refs.filter((r) => r.v === null), [],
    "un chargement d'index.html ne porte pas `?v=<N>` — c'est la moitié périmée du 15 août");

  /* LE RECENSEMENT, et il n'est PAS la propriété : il ne dit pas qu'un
     chargement est correct, seulement qu'on a remarqué qu'il arrivait.
     ⚠️ Le faire monter est LÉGITIME quand un fichier entre — encore faut-il
     que quelqu'un ait regardé. Le compte force ce regard ; c'est tout ce
     qu'il fait, et c'est déjà utile.
       · lot 75 : 3 — tokens.css, shell.css, shell.mjs
       · 2026-08-15 : 4 — `dice3d.css` entre avec le portage du plateau 3D
         (`dice3d.mjs`, lui, est importé par l'écran, pas par la page).
       · lot 77 : 5 — `fiche.css` entre avec la fiche à 360 (Class/Species).
         Une feuille À PART et pas trois règles de plus dans `shell.css` :
         un autre lot écrit `shell.css` en ce moment, et un fichier n'a
         qu'un écrivain. Elle est chargée APRÈS lui — les quelques règles
         `.catalogue-*` qu'elle reprend le sont à égalité de spécificité,
         c'est donc l'ordre qui tranche, délibérément. */
  assert.equal(refs.length, 5,
    `index.html porte ${refs.length} chargements, 5 attendus — si tu viens d'en ajouter un, ` +
    "mets ce compte à jour ET dis pourquoi juste au-dessus ; si tu n'as rien ajouté, cherche qui l'a fait");
});

/* ══ 2 — LA FERMETURE src/ : SOURCES VIERGES, MAP EXACTE ═════════════════ */

test("4 — 🔴 les sources src/ de la fermeture restent VIERGES de query — Node les importe nues", () => {
  const { aretesSrc } = fermetureNavigateur();
  assert.deepEqual(querysDansSrc(aretesSrc), [],
    "une query dans src/ dédouble les instances sous Node — kernel/registry.mjs l'a payé : " +
    "« missing block(s): layers », 35 tests rouges, serveur MCP compris (mesuré lot 75)");
  assert.ok(aretesSrc.length >= 30, `fermeture suspecte : ${aretesSrc.length} arêtes src/ (46 au lot 75)`);
});

test("5 — 🔴 la map épingle EXACTEMENT les modules src/ du graphe réel — ni trou, ni dérive", () => {
  const { aretesSrc } = fermetureNavigateur();
  const html = fs.readFileSync(path.join(BUILDER, "index.html"), "utf8");
  const carte = carteDIndex(html);
  assert.ok(carte, "index.html doit porter la map générée — voir bin/nouvelle-version.mjs");
  assert.deepEqual(fautesDeCarte(clefsAttendues(aretesSrc), carte), [],
    "un module src/ hors map se chargerait NU, par son propre compteur de cache — " +
    "le geste qui répare : node bin/nouvelle-version.mjs (la map est recalculée du graphe)");
  assert.ok(Object.keys(carte).length >= 20,
    `map suspecte : ${Object.keys(carte).length} entrées (21 au lot 75)`);
});

test("6 — la map précède le <script type=module> — déclarée après lui, elle ne s'appliquerait pas", () => {
  /* Commentaires décapés d'abord : la prose d'index.html CITE la balise
     module (« elle doit précéder le <script type=module> ») et un indexOf
     naïf mesurait la citation, pas la balise — payé à l'écriture du garde. */
  const html = fs.readFileSync(path.join(BUILDER, "index.html"), "utf8").replace(/<!--[\s\S]*?-->/g, " ");
  const map = html.indexOf('<script type="importmap">');
  const module_ = html.indexOf('<script type="module"');
  assert.ok(map >= 0 && module_ >= 0, "les deux balises existent");
  assert.ok(map < module_, "l'import map doit être déclarée AVANT le module qui en dépend");
});

/* ══ 3 — LES URL D'EXÉCUTION LISENT LEUR MODULE, PAS UNE CONSTANTE ═══════
   `import.meta.url` d'un module chargé en `?v=888` PORTE ce `?v=888` : on
   importe donc les vrais modules sous une version inventée et on regarde
   les URL qu'ils fabriquent. C'est aussi la MESURE du piège n°1 du mandat
   côté ui/ : ces imports créent une DEUXIÈME instance de chaque module à
   côté de celle, sans query, des autres tests — et tout reste juste, parce
   qu'aucun module de `ui/` ne tient d'état de niveau module hors
   `shell.mjs`, que personne n'importe deux fois. */

globalThis.document = globalThis.document ?? createTestDocument();

test("7 — versionQuery lit l'URL qu'on lui donne, et rend «» sans query (Node, tests)", async () => {
  const { versionQuery } = await import("../ui/builder/version.mjs");
  assert.equal(versionQuery("https://exemple.test/ui/builder/engine.mjs?v=42"), "?v=42");
  assert.equal(versionQuery("file:///depot/ui/builder/engine.mjs"), "");
});

test("8 — les arcanes portent la version du module qui les demande", async () => {
  const frais = await import("../ui/builder/destiny-step.mjs?v=888");
  assert.equal(frais.arcanaImageSrc("fh:arcana:en:death"), "./assets/arcana/death.webp?v=888");
  assert.ok(frais.ARCANA_BACK_SRC.endsWith("/back.webp?v=888"), frais.ARCANA_BACK_SRC);
  /* Sans query — le cas des tests et de Node — les URL sont celles d'avant
     le lot : rien à percer sur un chemin local. */
  const nu = await import("../ui/builder/destiny-step.mjs");
  assert.equal(nu.arcanaImageSrc("fh:arcana:en:death"), "./assets/arcana/death.webp");
});

test("9 — le moteur demande couches, exemple et schéma SOUS SA version — la pile monte quand même", async () => {
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
    assert.ok(build && layers, "bootEngine rend { build, layers }");
  } finally {
    globalThis.fetch = vraiFetch;
  }
});

test("10 — toute ligne `fetch(` de ui/ lit sa version — la coquille de fiche comprise", () => {
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
  const shell = stripComments(fs.readFileSync(path.join(BUILDER, "shell.mjs"), "utf8"));
  assert.match(shell, /fiche\.shell\.html\$\{versionQuery\(import\.meta\.url\)\}/,
    "la coquille doit porter la version dans son CHEMIN, import.meta.url en base ne la transmet pas");
});

/* ══ 4 — ⚔️ LES ATTAQUES : chaque famille d'oubli, nommée par le garde ═══
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

test("⚔️ ATTAQUE 7 — la map : clef manquante, clef en trop, valeur d'un autre <N> que sa clef — trois fautes NOMMÉES", () => {
  const attendues = ["../../src/build/block.mjs", "../../src/kernel/registry.mjs"];
  const imports = {
    "../../src/kernel/registry.mjs": "../../src/kernel/registry.mjs?v=7",
    "../../src/doc/errors.mjs": "../../src/doc/errors.mjs?v=7",
    "../../src/layers/stack.mjs": "../../autre/chemin.mjs?v=7"
  };
  const fautes = fautesDeCarte(attendues, imports);
  assert.deepEqual(fautes, [
    "manquante : ../../src/build/block.mjs",
    "en trop : ../../src/doc/errors.mjs",
    "en trop : ../../src/layers/stack.mjs",
    "valeur fausse : ../../src/layers/stack.mjs → ../../autre/chemin.mjs?v=7"
  ]);
  /* Et le demi-geste : une valeur restée à l'ancien <N> sort par le garde 2
     (versions distinctes), prouvé sur fixture ici. */
  assert.deepEqual(versionsDistinctes([
    lireV("../../src/kernel/registry.mjs?v=7"),
    lireV("../../src/build/block.mjs?v=8")
  ]).sort(), ["7", "8"]);
});

test("⚔️ ATTAQUE 8 — une query glissée dans une arête src/ est nommée avec son fichier", () => {
  const aretes = [
    { de: "src/build/index.mjs", ref: "./block.mjs?v=7", cible: "/x/src/build/block.mjs" },
    { de: "src/build/index.mjs", ref: "./errors.mjs", cible: "/x/src/build/errors.mjs" }
  ];
  assert.deepEqual(querysDansSrc(aretes), ["src/build/index.mjs → ./block.mjs?v=7"]);
});
