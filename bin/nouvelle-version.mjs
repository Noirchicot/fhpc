#!/usr/bin/env node
/* ══ LE GESTE DE PUBLICATION — lot 75 ═════════════════════════════════════
   `node bin/nouvelle-version.mjs`        → incrémente <N> de 1, PARTOUT.
   `node bin/nouvelle-version.mjs 9`      → pose <N>=9, PARTOUT.

   POURQUOI CE GESTE EXISTE : GitHub Pages cache chaque fichier 10 minutes,
   compteur PAR fichier — sans version commune, une page pouvait mélanger du
   code neuf et du code d'avant (vécu deux fois le 15 août). Chaque import
   relatif de `ui/`, les `href`/`src` d'`index.html` et les `url()` des CSS
   portent donc `?v=<N>`, tous LE MÊME. La loi complète : tête de
   `ui/builder/version.mjs`.

   QUAND LE FAIRE : à CHAQUE publication qui touche `ui/`, `src/`, `layers/`,
   `schemas/` ou `examples/` — avant le commit qu'on va pousser :

       node bin/nouvelle-version.mjs
       npm test        ← le garde `versions-graphe` vérifie qu'aucune ligne
                         ne manque et que tout porte le même <N>
       (commit, puis geste d'Eric : push)

   Oublier le geste n'est PAS le défaut d'origine : les visiteurs des dix
   minutes suivantes gardent l'ANCIEN graphe entier — cohérent, jamais
   mélangé — puis basculent d'un bloc. L'incrément ne sert qu'à percer le
   cache immédiatement, d'un coup, pour tout le monde.

   CE SCRIPT NE SAIT PAS TROUVER UNE LIGNE OUBLIÉE : il ne réécrit que les
   `?v=<chiffres>` déjà posés. C'est le garde qui trouve les oublis — le
   script bête + le garde méchant, jamais l'inverse. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

/* Tous les fichiers porteurs de version : les sources que la page charge.
   (Les tests, eux, n'en portent pas — leurs `?v=888` d'attaque sont des
   fixtures, hors de `ui/`, ce script ne les touche jamais.) */
const fichiers = fs.readdirSync(UI)
  .filter((f) => f.endsWith(".mjs") || f.endsWith(".css") || f.endsWith(".html"))
  .map((f) => path.join(UI, f));

/* <N> courant : lu dans `index.html`, le fichier qui décide du graphe. */
const html = fs.readFileSync(path.join(UI, "index.html"), "utf8");
const courant = html.match(/\?v=(\d+)/);
if (!courant) {
  console.error("Aucun `?v=<N>` dans index.html — le graphe n'est pas versionné ?");
  process.exit(1);
}
const ancien = Number(courant[1]);
const demande = process.argv[2];
const neuf = demande === undefined ? ancien + 1 : Number(demande);
if (!Number.isInteger(neuf) || neuf <= 0) {
  console.error(`« ${demande} » n'est pas un entier positif.`);
  process.exit(1);
}

let lignes = 0;
for (const fichier of fichiers) {
  const avant = fs.readFileSync(fichier, "utf8");
  let n = 0;
  const apres = avant.replace(/\?v=\d+/g, () => { n++; return `?v=${neuf}`; });
  if (n > 0) {
    fs.writeFileSync(fichier, apres);
    console.log(`${path.relative(ROOT, fichier)} : ${n}`);
    lignes += n;
  }
}
console.log(`\n?v=${ancien} → ?v=${neuf} sur ${lignes} occurrences.`);
console.log("Maintenant : npm test (le garde versions-graphe doit rester vert).");
