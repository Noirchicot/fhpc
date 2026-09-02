/* ══ AUCUNE UNITÉ DE CONTENEUR DANS LES FEUILLES DU BUILDER — lot 121 ══════

   🔴 LE DÉFAUT, VU PAR ERIC LE 2026-09-02 SUR SON iPAD, et mesuré sur ses deux
   captures (iPhone et iPad, même version 429 du site déployé, cookies vidés,
   agrandissement de police au défaut) : sur l'écran **Ability boosts**
   d'Inheritance, l'iPhone affiche les six collecteurs `STR DEX CON INT WIS CHA`
   sur une ligne ; l'iPad n'en montre que QUATRE, `STR` et `CHA` coupées aux
   deux bords.

   ⛔ LA CAUSE : sous WebKit, `zoom` NE REBASE PAS les unités de conteneur.
   `100cqw` rend des pixels PEINTS là où tout le dépôt compte en blg
   (NORMES §0 bis). L'arithmétique colle au pixel près :

     iPhone (zoom 1)     100cqw lu 352 → (352 − 40)/6 = 52  → min(87 ; 52)  = 52
     iPad  (zoom 1,83)   100cqw lu 644 → (644 − 40)/6 = 101 → min(87 ; 101) = 87

   Six cases de 87 plus leurs cinq gouttières demandent 562 blg dans 352 :
   rangée centrée, 105 dépassent de chaque côté, donc deux cases sortent.
   C'est exactement la capture.

   📏 ET LE CONTRASTE EST MESURÉ, PAS SUPPOSÉ : une sonde posée dans Chromium,
   sous la même app zoomée à 1,829, avec la formule réelle et un conteneur de
   352, rend **51,996** — c'est-à-dire la valeur en unités de dessin. Chromium
   rebase `cqw`, Safari non. ⭐ Les deux moteurs étant en désaccord, AUCUNE
   formule écrite en unité de conteneur ne peut être juste sur les deux : ce
   n'est pas un réglage à trouver, c'est une unité à retirer.

   ⚠️ CE QUI N'EST PAS MESURÉ, ET LE GARDE NE PRÉTEND PAS LE CONTRAIRE :
   personne n'a mesuré directement sur l'iPad d'Eric. Le comportement de WebKit
   est DÉDUIT de ses captures — et le dépôt sait déjà que le `WKWebView` de
   macOS diverge de WebKit d'iPadOS (logbook du 31/08), donc un banc local ne
   prouverait rien. Ce garde ne juge pas un moteur : il juge une ÉCRITURE dont
   les deux moteurs ne peuvent pas s'accorder.

   ⭐ CE QUI REMPLACE L'UNITÉ, ET C'EST LA PRÉMISSE QUI A CHANGÉ : depuis la
   règle sacrée du 31/08, le panneau vaut TOUJOURS 375 × 560 blg. La largeur
   d'une rangée est donc une CONSTANTE en blg — elle se DÉDUIT (NORMES §1 ter)
   des jetons déjà déclarés, par `--colonne-ecran` / `--colonne-dalle` posées
   sur `.stage`. Une cote déduite est partagée par construction : elle ne
   dépend plus de la boîte de celui qui la lit, ce qui était l'argument même
   du `cqw` (garde `collecteur-jeton`).

   📌 MÊME FAMILLE QUE « `zoom` ne rebase pas `vw`/`vh` » (lot 85, seconde
   passe, `ui-jetons.test.mjs` garde 5 ter). Les deux gardes se lisent
   ensemble : l'un ferme les unités de FENÊTRE, celui-ci les unités de
   CONTENEUR. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui/builder");
const FEUILLES = fs.readdirSync(UI).filter((f) => f.endsWith(".css"));

/** ⚠️ LES COMMENTAIRES SONT RETIRÉS EN PREMIER, ET C'EST INDISPENSABLE : les
 *  notes de `listes.css` et de `shell.css` CITENT `100cqw` une douzaine de
 *  fois pour raconter pourquoi il est tombé. Un garde qui lirait sa propre
 *  explication comme une violation crierait au loup, et un garde qui crie au
 *  loup se fait désactiver — c'est la garantie entière qui part avec lui. */
const sansCommentaires = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Les unités de conteneur, toutes les six. ⛔ La liste se ferme ici : `cqw`
 *  seul aurait laissé passer `cqi`, qui dit la même chose sur l'axe logique. */
const UNITES = String.raw`cqw|cqh|cqi|cqb|cqmin|cqmax`;

/** LE JUGE — les DÉCLARATIONS (`propriété: valeur`) qui portent une unité de
 *  conteneur. On exige un CHIFFRE devant l'unité (`100cqw`, `1.5cqi`) et une
 *  frontière de mot derrière : sans ça, `--acqwis` ou `bloc-cqi` seraient pris
 *  pour des cotes. */
export function unitesDeConteneur(css) {
  const texte = sansCommentaires(css);
  const prises = [];
  const motif = new RegExp(String.raw`([-a-zA-Z]+)\s*:\s*([^;{}]*\d\s*(?:${UNITES})\b[^;{}]*)`, "g");
  for (const [, propriete, valeur] of texte.matchAll(motif)) {
    prises.push(`${propriete}: ${valeur.replace(/\s+/g, " ").trim()}`);
  }
  return prises;
}

/** Les règles qui déclarent un conteneur de requête (`container-type`). */
export function conteneursDeclares(css) {
  const texte = sansCommentaires(css);
  const prises = [];
  for (const m of texte.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/container-type\s*:/.test(m[2])) prises.push(m[1].replace(/\s+/g, " ").trim());
  }
  return prises;
}

/* ══ §A — LE GARDE SUR LE DÉPÔT ═══════════════════════════════════════════ */

test("A — AUCUNE DÉCLARATION D'`ui/builder/` NE PORTE D'UNITÉ DE CONTENEUR", () => {
  assert.ok(FEUILLES.length >= 4, `${FEUILLES.length} feuilles lues — la portée n'est pas vide`);
  const prises = [];
  for (const feuille of FEUILLES) {
    const css = fs.readFileSync(path.join(UI, feuille), "utf8");
    for (const d of unitesDeConteneur(css)) prises.push(`${feuille} — ${d}`);
  }
  assert.deepEqual(prises, [],
    "sous WebKit, `zoom` ne rebase pas les unités de conteneur : elles rendent " +
    "des pixels PEINTS là où le dépôt compte en blg (mesuré le 02/09 sur " +
    "Ability boosts — six caracs, quatre visibles sur iPad). Une cote de " +
    "contenant se DÉDUIT (NORMES §1 ter) : lire `--colonne-dalle`.");
});

test("A bis — ET PLUS AUCUN CONTENEUR DE REQUÊTE N'EST DÉCLARÉ, NI ORPHELIN DE `@container`", () => {
  /* 📏 MESURÉ EN POSANT CE GARDE : les trois `container-type: inline-size` du
     dépôt (`listes.css` ×2, `.equipment-drum`) n'existaient QUE pour donner
     une base aux `100cqw`. Les unités parties, ils ne servaient plus rien —
     et une déclaration qui ne sert plus est un mensonge qui attend son
     lecteur. Ils sont retirés.
     ⛔ ET LA CONSÉQUENCE SE GARDE AUSSI : un bloc `@container` sans aucun
     conteneur déclaré n'a rien à interroger, donc il ne s'applique JAMAIS —
     en silence, exactement le défaut du 30/08 que le lot 116 a payé. Tant
     qu'aucune feuille ne déclare de conteneur, aucune ne peut porter de
     `@container`. Le jour où l'un revient légitimement, les deux reviennent
     ensemble, et ce garde le dira. */
  const conteneurs = [];
  const requetes = [];
  for (const feuille of FEUILLES) {
    const texte = sansCommentaires(fs.readFileSync(path.join(UI, feuille), "utf8"));
    for (const sel of conteneursDeclares(texte)) conteneurs.push(`${feuille} — ${sel}`);
    for (const [entete] of texte.matchAll(/@container[^{]*\{/g)) requetes.push(`${feuille} — ${entete.trim()}`);
  }
  if (conteneurs.length === 0) {
    assert.deepEqual(requetes, [],
      "un bloc `@container` sans aucun `container-type` dans le builder n'a " +
      "aucun ancêtre à interroger : il ne s'appliquera jamais, sans rien dire.");
  }
  assert.deepEqual(conteneurs, [],
    "les conteneurs de requête n'existaient que pour les `cqw` : s'il en " +
    "revient un, il doit servir un `@container`, et ce garde doit être rouvert.");
});

/* ══ §B — L'ATTAQUE : le garde doit ROUGIR, puis se TAIRE ══════════════════ */

/** ⛔ LA LIGNE EXACTE D'AUJOURD'HUI — `listes.css` avant ce lot, telle quelle. */
const LIGNE_DU_02_09 = `
.choix-glisse[data-rangs]:not(:has(.grille-rang)) {
  container-type: inline-size;
  --rangee-dense: var(--par-rangee);
  --collecteur-case: min(var(--glisse-case),
    calc((100cqw - (var(--rangee-dense) - 1) * var(--sp-8)) / var(--rangee-dense)));
}
`;

/** ✅ LA FORME CORRIGÉE — celle que le lot pose. */
const LIGNE_CORRIGEE = `
.choix-glisse[data-rangs]:not(:has(.grille-rang)) {
  --rangee-dense: var(--par-rangee);
  --collecteur-case: min(var(--glisse-case),
    calc((var(--colonne-dalle) - (var(--rangee-dense) - 1) * var(--sp-8)) / var(--rangee-dense)));
}
`;

test("B1 — LE GARDE ROUGIT SUR LA LIGNE FAUTIVE DU 02/09", () => {
  assert.deepEqual(unitesDeConteneur(LIGNE_DU_02_09), [
    "--collecteur-case: min(var(--glisse-case), calc((100cqw - (var(--rangee-dense) - 1) * var(--sp-8)) / var(--rangee-dense)))"
  ]);
  assert.deepEqual(conteneursDeclares(LIGNE_DU_02_09),
    [".choix-glisse[data-rangs]:not(:has(.grille-rang))"]);
});

test("B2 — ET IL SE TAIT SUR LA FORME CORRIGÉE", () => {
  assert.deepEqual(unitesDeConteneur(LIGNE_CORRIGEE), []);
  assert.deepEqual(conteneursDeclares(LIGNE_CORRIGEE), []);
});

test("B3 — LES DEUX AUTRES SITES DU DÉPÔT ROUGISSENT AUSSI, chacun avec son unité", () => {
  /* ⭐ Les trois sites avaient le même défaut ; Eric n'a vu que le deuxième
     parce qu'il faut être sur l'écran précis. Le garde ne connaît pas les
     écrans — il connaît l'unité. */
  const roue = `.equipment-drum { --roue-pas: min(121px, calc((100cqw - 88px) / 3)); }`;
  const cedee = `.choix-glisse:has(.grille-rang) { --case-cedee: min(87px, calc((100cqw - 96px) / 3)); }`;
  assert.equal(unitesDeConteneur(roue).length, 1);
  assert.equal(unitesDeConteneur(cedee).length, 1);
  /* Les six unités, pas seulement `cqw` — `cqi` dit la même chose sur l'axe
     logique, et une liste d'exceptions par NOM ne dit jamais qu'elle est
     incomplète. */
  for (const u of ["cqw", "cqh", "cqi", "cqb", "cqmin", "cqmax"]) {
    assert.equal(unitesDeConteneur(`.x { width: calc(100${u} / 3); }`).length, 1, `${u} doit rougir`);
  }
});

test("B4 — ET IL NE CRIE PAS AU LOUP : ni sur un commentaire, ni sur un nom qui contient l'unité", () => {
  /* ⚠️ L'ATTAQUE QUI COMPTE VRAIMENT, parce que le dépôt la porte : les notes
     de `listes.css` citent `100cqw` une douzaine de fois pour expliquer
     pourquoi il est tombé. Un garde qui lirait son propre exposé des motifs
     comme une violation serait désactivé la semaine suivante. */
  const commente = `
/* 🔴 POURQUOI c'est tombé : \`100cqw\` rend des pixels peints —
   min(87px, calc((100cqw - 40px) / 6)) valait 87 au lieu de 52. */
.choix-glisse { --collecteur-case: min(var(--glisse-case), calc(var(--colonne-dalle) / 6)); }
`;
  assert.deepEqual(unitesDeConteneur(commente), []);
  /* Un identifiant qui CONTIENT les trois lettres n'est pas une cote. */
  assert.deepEqual(unitesDeConteneur(`.x { --acqwis: 3px; font-family: "cqi 100"; }`), []);
  /* Et une unité sans chiffre devant n'est pas une longueur. */
  assert.deepEqual(unitesDeConteneur(`.x { --nom: cqw; }`), []);
});
