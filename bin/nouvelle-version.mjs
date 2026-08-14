#!/usr/bin/env node
/* ══ LE GESTE DE PUBLICATION — lot 75 ═════════════════════════════════════
   `node bin/nouvelle-version.mjs`        → incrémente <N> de 1, PARTOUT.
   `node bin/nouvelle-version.mjs 9`      → pose <N>=9, PARTOUT.

   POURQUOI CE GESTE EXISTE : GitHub Pages cache chaque fichier 10 minutes,
   compteur PAR fichier — sans version commune, une page pouvait mélanger du
   code neuf et du code d'avant (vécu deux fois le 15 août). La loi
   complète : tête de `ui/builder/version.mjs`.

   LA VERSION VIT À DEUX ENDROITS, PAS TROIS (mesuré, lot 75) :
   · `ui/` : chaque import relatif, les `href`/`src` d'`index.html`, les
     `url()` des CSS portent `?v=<N>` en toutes lettres — ce sont des
     fichiers que Node n'importe jamais en versionné, la query y est sans
     danger (aucun état de niveau module hors `shell.mjs`, jamais dédoublé).
   · `src/` : les SOURCES RESTENT VIERGES — `bin/fhpc-mcp.mjs` et les tests
     les importent nues, et une query dans `src/` a DÉDOUBLÉ le kernel sous
     Node (`registry.mjs`, `blocks = new Map()` : « missing block(s):
     layers », 35 tests rouges, serveur MCP compris — mesuré ici). C'est
     l'IMPORT MAP d'`index.html`, généré ci-dessous, qui donne au navigateur
     leurs URL versionnées. Un seul fichier décide, comme pour le reste.

   QUAND LE FAIRE : à CHAQUE publication qui touche `ui/`, `src/`,
   `layers/`, `schemas/` ou `examples/` — avant le commit qu'on va pousser :

       node bin/nouvelle-version.mjs
       npm test        ← le garde `versions-graphe` vérifie qu'aucune ligne
                         ne manque, que la map couvre TOUTE la fermeture,
                         et que tout porte le même <N>
       (commit, puis geste d'Eric : push)

   Oublier le geste n'est PAS le défaut d'origine : les visiteurs des dix
   minutes suivantes gardent l'ANCIEN graphe entier — cohérent, jamais
   mélangé — puis basculent d'un bloc. L'incrément ne sert qu'à percer le
   cache immédiatement, d'un coup, pour tout le monde.

   CE SCRIPT NE SAIT PAS TROUVER UNE LIGNE OUBLIÉE dans `ui/` : il ne
   réécrit que les `?v=<chiffres>` déjà posés. La MAP, elle, est RECALCULÉE
   depuis le graphe réel à chaque passage — un module `src/` ajouté hier y
   entre sans qu'on y pense. Le garde reste le seul juge : script bête,
   garde méchant, jamais l'inverse. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const INDEX = path.join(UI, "index.html");

/* Le décapeur de commentaires des gardes — un import cité dans une tête de
   fichier est de la prose, pas une arête du graphe. */
const { stripComments } = await import(path.join(ROOT, "tests", "source-scan.mjs"));

const specsOf = (texte) => {
  const s = [];
  for (const m of texte.matchAll(/from\s+["'](\.[^"']+)["']/g)) s.push(m[1]);
  for (const m of texte.matchAll(/import\(\s*["'](\.[^"']+)["']/g)) s.push(m[1]);
  return s;
};

/* ── 1. LA FERMETURE DU GRAPHE NAVIGATEUR, DEPUIS ui/ ──────────────────── */
const vus = new Set();
const marcher = (fichier) => {
  if (vus.has(fichier)) return;
  vus.add(fichier);
  for (const spec of specsOf(stripComments(fs.readFileSync(fichier, "utf8")))) {
    marcher(path.resolve(path.dirname(fichier), spec.split("?")[0]));
  }
};
for (const f of fs.readdirSync(UI).filter((f) => f.endsWith(".mjs"))) marcher(path.join(UI, f));

/* ── 2. LES CLEFS DE LA MAP : tout ce que les fichiers `src/` de la
   fermeture importent en relatif — URL vues depuis `ui/builder/`. ───────── */
const clefs = new Set();
let querysDansSrc = 0;
for (const fichier of [...vus].filter((f) => !f.startsWith(UI))) {
  for (const spec of specsOf(stripComments(fs.readFileSync(fichier, "utf8")))) {
    if (spec.includes("?")) {
      console.error(`⛔ ${path.relative(ROOT, fichier)} importe « ${spec} » — src/ doit rester VIERGE de query (Node dédoublerait, mesuré lot 75).`);
      querysDansSrc++;
      continue;
    }
    const absolu = path.resolve(path.dirname(fichier), spec);
    clefs.add("../../" + path.relative(ROOT, absolu).split(path.sep).join("/"));
  }
}
if (querysDansSrc > 0) process.exit(1);

/* ── 3. <N> : lu dans le tag module d'index.html, le décideur. ──────────── */
const html = fs.readFileSync(INDEX, "utf8");
const courant = html.match(/shell\.mjs\?v=(\d+)/);
if (!courant) {
  console.error("Aucun `shell.mjs?v=<N>` dans index.html — le graphe n'est pas versionné ?");
  process.exit(1);
}
const ancien = Number(courant[1]);
const demande = process.argv[2];
const neuf = demande === undefined ? ancien + 1 : Number(demande);
if (!Number.isInteger(neuf) || neuf <= 0) {
  console.error(`« ${demande} » n'est pas un entier positif.`);
  process.exit(1);
}

/* ── 4. RÉÉCRIRE : les `?v=` de ui/, puis la map recalculée. ────────────── */
let lignes = 0;
for (const nom of fs.readdirSync(UI).filter((f) => /\.(mjs|css|html)$/.test(f))) {
  const fichier = path.join(UI, nom);
  const avant = fs.readFileSync(fichier, "utf8");
  let n = 0;
  const apres = avant.replace(/\?v=\d+/g, () => { n++; return `?v=${neuf}`; });
  if (n > 0) {
    fs.writeFileSync(fichier, apres);
    console.log(`${path.relative(ROOT, fichier)} : ${n}`);
    lignes += n;
  }
}

const corps = [...clefs].sort().map((c) => `    "${c}": "${c}?v=${neuf}"`).join(",\n");
const bloc = `<script type="importmap">\n{\n  "imports": {\n${corps}\n  }\n}\n</script>`;
const html2 = fs.readFileSync(INDEX, "utf8");
if (!/<script type="importmap">[\s\S]*?<\/script>/.test(html2)) {
  console.error("index.html n'a pas de bloc importmap à régénérer — voir la tête de ce script.");
  process.exit(1);
}
fs.writeFileSync(INDEX, html2.replace(/<script type="importmap">[\s\S]*?<\/script>/, bloc));
console.log(`importmap : ${clefs.size} modules src/ épinglés.`);

console.log(`\n?v=${ancien} → ?v=${neuf} sur ${lignes} occurrences + la map.`);
console.log("Maintenant : npm test (le garde versions-graphe doit rester vert).");
