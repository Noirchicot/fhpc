#!/usr/bin/env node
/* ══ QUALIFIER LES CONFLITS DE FUSION — et REFUSER quand il y en a de vrais ═══

   🔴 CE SCRIPT NAÎT D'UNE FAUTE, LE 2026-09-03, ET IL EN PORTE LA FORME.
   Les fusions de `main` dans un lot produisent des dizaines de conflits qui ne
   sont que l'estampille `?v=N` — sur ce dépôt, 62 blocs pour 0 vrai, quatre fois
   de suite. J'avais donc écrit ce comptage en ligne dans mes commandes, et pris
   l'habitude d'enchaîner `git checkout --ours` derrière.
   ⛔ LA CINQUIÈME FOIS IL A DIT « 2 RÉELS » ET J'AI ENCHAÎNÉ QUAND MÊME : le lot
   d'un autre siège (la préséance des couches) est reparti à son état d'avant.
   Son garde l'a vu au premier `npm test` ; sans lui, c'était une régression
   silencieuse sur un fichier qui ne m'appartenait pas.

   ⭐ LA LEÇON, ET C'EST L'ARCHITECTE QUI EN A TIRÉ LA PARADE : un outil qui a
   raison quatre fois achète une confiance qu'il n'a pas méritée pour la
   cinquième. **Il ne doit donc pas AFFICHER le danger, il doit REFUSER.**
   ⛔ Ce script sort en code 1 dès qu'un conflit réel existe. Il ne propose pas
   de continuer, il n'a pas d'option pour passer outre : le seul chemin est de
   les lire. C'est ce qui le sépare de la version qu'on peut ignorer.

   ⚖️ CE QU'IL NE FAIT PAS, ET C'EST VOULU : il ne résout rien. Un conflit
   d'estampille se résout par `--ours` PUIS `bin/nouvelle-version.mjs`, qui
   réécrit toutes les versions ensemble — c'est le bump qui est l'écrivain, pas
   la résolution. Lui ne fait que dire ce qu'on a le droit d'automatiser.

   USAGE
     node bin/conflits-reels.mjs          → qualifie, et sort 1 s'il y en a de vrais
     node bin/conflits-reels.mjs --liste  → montre les blocs réels, côte à côte      */

import { execFileSync } from "node:child_process";
import fs from "node:fs";

/* ⚠️ LE SEUL BRUIT QU'ON SAIT NOMMER. Tout ce qui n'est pas une estampille de
   version est un conflit RÉEL, par défaut — un script de qualification qui
   élargit sa liste de « bruits connus » finit par tout appeler du bruit. */
const ESTAMPILLE = /\?v=\d+/g;
const neutralise = (t) => t.replace(ESTAMPILLE, "?v=N");

const BLOC = /^<<<<<<< [^\n]*\n([\s\S]*?)^=======\n([\s\S]*?)^>>>>>>> [^\n]*\n/gm;

const fichiers = execFileSync("git", ["diff", "--name-only", "--diff-filter=U"], { encoding: "utf8" })
  .split("\n").filter(Boolean);

if (fichiers.length === 0) {
  console.log("aucun conflit en cours");
  process.exit(0);
}

let total = 0;
const reels = [];
for (const f of fichiers) {
  const texte = fs.readFileSync(f, "utf8");
  for (const m of texte.matchAll(BLOC)) {
    total += 1;
    if (neutralise(m[1]) !== neutralise(m[2])) reels.push({ f, moi: m[1], eux: m[2] });
  }
}

console.log(`${fichiers.length} fichier(s) · ${total} bloc(s) · ${reels.length} RÉEL(S)`);

if (reels.length === 0) {
  console.log("✅ que de l'estampille — `git checkout --ours` puis `node bin/nouvelle-version.mjs`");
  process.exit(0);
}

/* 🔴 ET LÀ IL S'ARRÊTE. Le compte est affiché, les fichiers sont nommés, et le
   code de sortie interdit d'enchaîner une résolution automatique dans un `&&`. */
const parFichier = [...new Set(reels.map((r) => r.f))];
console.log("⛔ RÉSOLUTION AUTOMATIQUE INTERDITE — lis ces blocs avant de choisir un côté :");
for (const f of parFichier) console.log(`   ${f} (${reels.filter((r) => r.f === f).length})`);
if (process.argv.includes("--liste")) {
  for (const r of reels) {
    console.log(`\n══ ${r.f}\n── MOI ──\n${r.moi.trimEnd()}\n── EUX ──\n${r.eux.trimEnd()}`);
  }
} else {
  console.log("   (`--liste` pour les voir côte à côte)");
}
console.log("⚠️ Un fichier qui ne t'appartient pas se résout en prenant SON côté, pas le tien.");
process.exit(1);
