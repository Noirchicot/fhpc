/* ══ LE GARDE DE L'ÉCHELLE DE LA FICHE — lot 143, 2026-09-03 ═══════════════

   🔴 CE QU'IL EXISTE POUR EMPÊCHER, ET C'EST UN DÉFAUT D'ŒIL QU'AUCUN AUTRE
   TEST NE VOYAIT. Eric, en regardant les fiches de species et de classes au
   rang R : *« sur mon iPhone les caractères et les espaces sont homogènes ;
   par contre sur l'iPad et sur le desktop les caractères et les espaces sont
   incohérents, tailles différentes »*.

   La cause, mesurée : `fiche.css` déclarait QUATRE corps en pixels bruts,
   hors de l'échelle des jetons — `18px` (le nombre de `--t5`, mais recopié),
   `13px`, `10.5px`, `11px` — et cinq écarts (`8px`, `4px`) hors des `--sp-*`.

   ⭐ ET VOILÀ POURQUOI ÇA NE SE VOYAIT QUE SUR LES GRANDS ÉCRANS. À l'échelle
   1 un 13 posé entre `--t2` (12) et `--t3` (14) est indiscernable ; le cran
   MULTIPLIE l'écart et fait tomber la valeur ENTRE deux barreaux, au milieu
   d'organes qui, eux, sont dessus (mesuré au navigateur, cran de l'iPad
   ×1,4571 : `--t2` rend 17,5 · le 13 rend 18,9 · `--t3` rend 20,4).

   ── L'INVARIANT, ET C'EST TOUT CE QUE CE FICHIER DIT ─────────────────────
   **Aucune TAILLE de texte ni aucun ESPACE de `ui/builder/fiche.css` n'est
   écrit en littéral : les uns passent par un barreau `--t1..--t7`, les
   autres par un jeton `--sp-*`.**

   ⛔ IL N'ÉPELLE PAS LA LISTE DES QUATRE LIGNES CORRIGÉES CE JOUR-LÀ. Une
   liste par nom ne dit jamais qu'elle est incomplète (la leçon du 24/08) :
   le garde balaie la feuille ENTIÈRE et refuse tout ce qui porte un chiffre
   une fois les exceptions retirées. Une cinquième ligne écrite demain rougit
   sans qu'on ait à l'inscrire ici.

   ⚖️ CE QU'IL N'AFFIRME PAS, ET IL FAUT LE DIRE :
     · il lit la FEUILLE, pas la page. Il prouve que `fiche.css` ne pose que
       des jetons ; il ne prouve pas qu'une AUTRE feuille ne gagne pas dans
       la cascade. Ça, seule une mesure au navigateur le dit — relevée le
       2026-09-03 : les quatre organes de la carte rendent exactement
       18 / 12 / 10 / 10 blg, donc `fiche.css` gagne bien ;
     · il ne dit rien des COTES DU DESSIN (`--carte-w: 269px`, `height:
       440px`, `grid-template-columns: 145px`, `--fiche-image-w: 100px`).
       ⭐ Ce ne sont ni des tailles de texte ni des écarts : ce sont les cotes
       relevées sur la composition qu'Eric a validée le 27/08 (§4 quater), et
       les mettre sur une échelle de TYPE n'aurait aucun sens. Les inscrire
       ici les ferait rougir à tort ;
     · il ne dit rien des RAYONS. Les `999px` / `1px` / `1.5px` de
       `.fiche-livre` dessinent le glyphe du livre, dont Eric a ratifié la
       cote exacte (*« 22 px, la cote exacte du ? »*, 26/08) — un dessin,
       pas un espace. Les rayons de la coquille sont gardés ailleurs
       (`tests/ui-jetons.test.mjs`, clause 2).

   📌 PRÉCÉDENT SUIVI : `tests/ui-jetons.test.mjs` (le même balayage d'octets,
   sur `shell.css`) et `tests/jeton-corps.test.mjs` (le corps d'UN organe).
   Ce fichier est leur troisième porte, sur la feuille de la fiche. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHEMIN = path.join(ROOT, "ui", "builder", "fiche.css");
const FICHE = fs.readFileSync(CHEMIN, "utf8");
/* Le socle des jetons — lu ici depuis le 2026-09-04 : la ligne de la fiche est
   maintenant un multiple d'un jeton de rythme QUI VIT LÀ-BAS, donc le garde ne
   peut plus se contenter de regarder `fiche.css`. Un garde qui ne lit qu'un
   côté d'une dérivation n'en garde aucun. */
const TOKENS = fs.readFileSync(path.join(ROOT, "ui", "builder", "tokens.css"), "utf8");

/* ── LES DEUX FORMES ADMISES POUR UNE TAILLE DE TEXTE ─────────────────────
   Un barreau nu, ou un MULTIPLE écrit du barreau. La seconde forme n'est pas
   un relâchement : `calc(var(--t1) * 1.2)` ne contient AUCUN nombre de
   taille — 1,2 est un rapport, et le jour où `--t1` bouge, la ligne suit.
   ⛔ Ce qui reste interdit est le nombre de TAILLE : `calc(var(--t1) + 2px)`
   et `calc(10px * 1.2)` sont des violations. L'attaque 5 le prouve. */
const BARREAU = String.raw`var\(--t[1-7]\)`;
/* 📌 ANCRE ÉLARGIE LE 2026-09-04 — Eric : *« interligne de la prose on peut
   normer comme pour destiny ? »*. Le multiplicateur d'une ligne était forcément
   un LITTÉRAL (`* 1.2`) ; il peut maintenant être le jeton de rythme partagé
   avec Destiny (`* var(--interligne-texte)`).
   ⭐ CE QUE LE GARDE ASSERTE N'A PAS BOUGÉ : une ligne reste un MULTIPLE de son
   corps, jamais une longueur recopiée — la faute qui a coûté le lot (13.2px, la
   recopie de 11 × 1,2 pour un corps sur aucun barreau) est refusée à
   l'identique. Ce qui change est la forme du facteur.
   ⛔ ET L'ÉLARGISSEMENT SERAIT UN TROU SANS SA SECONDE MOITIÉ : un jeton peut
   porter n'importe quoi, `normal` compris. Le test « le jeton de rythme est un
   RAPPORT sans unité » (plus bas) ferme la porte que celle-ci ouvre — les deux
   se lisent ensemble. */
const FACTEUR = String.raw`(?:[\d.]+|var\(--interligne-texte\))`;
const TAILLE_OK = new RegExp(
  String.raw`^(?:${BARREAU}|calc\(\s*${BARREAU}\s*\*\s*${FACTEUR}\s*\)|inherit)$`
);

/** Chaque `font-size` de la feuille dont la valeur n'est pas un barreau. */
export function taillesHorsEchelle(css) {
  const texte = stripComments(css);
  const hits = [];
  for (const m of texte.matchAll(/font-size\s*:\s*([^;}]+)[;}]/g)) {
    const valeur = m[1].trim();
    if (!TAILLE_OK.test(valeur)) hits.push(`font-size: ${valeur}`);
  }
  return hits;
}

/** L'INTERLIGNE EST UNE TAILLE, et c'est la faute qui a coûté ce lot :
 *  `--fiche-ligne` valait `13.2px` — la recopie de `11 × 1,2`, un corps qui
 *  n'était sur aucun barreau. Une ligne se déclare donc comme un multiple de
 *  son corps, jamais comme le nombre qu'il rendait.
 *  ⚖️ Un `line-height` SANS unité (1,2 · 1,55 · 1,7) est un rapport, pas une
 *  longueur : il est admis tel quel. */
export function interlignesHorsEchelle(css) {
  const texte = stripComments(css);
  const hits = [];
  for (const m of texte.matchAll(/--fiche-ligne\s*:\s*([^;}]+)[;}]/g)) {
    const valeur = m[1].trim();
    if (!TAILLE_OK.test(valeur)) hits.push(`--fiche-ligne: ${valeur}`);
  }
  for (const m of texte.matchAll(/(?:^|[;{\s])line-height\s*:\s*([^;}]+)[;}]/g)) {
    const valeur = m[1].trim();
    if (/var\(--[\w-]+\)/.test(valeur)) continue;      // un jeton, déjà gardé
    if (/^[\d.]+$/.test(valeur)) continue;             // un RAPPORT, sans unité
    hits.push(`line-height: ${valeur}`);
  }
  return hits;
}

/* ── LES EXCEPTIONS D'UN ÉCART, chacune avec sa raison ────────────────────
     · `var(--…)` — le cas normal, c'est ce qu'on veut ;
     · `0` — une longueur nulle n'est l'expression d'aucun jeton ;
     · `auto` — un mot-clef de répartition, pas une longueur ;
     · les POURCENTAGES — relatifs à leur boîte, hors de l'échelle ;
     · `1fr` — une fraction de grille, pas une longueur. */
const EXCEPTIONS_ECART = [
  /var\(--[\w-]+\)/g,
  /\bauto\b/g,
  /\b0\b/g,
  /\b1fr\b/g,
  /\b\d+(\.\d+)?%/g
];

/** Chaque `padding`/`margin`/`gap` dont la valeur, une fois les exceptions
 *  retirées, porte encore un chiffre. */
export function ecartsHorsJeton(css) {
  const texte = stripComments(css);
  const hits = [];
  for (const m of texte.matchAll(/\b(padding|margin|gap)[\w-]*\s*:\s*([^;}]+)[;}]/g)) {
    const [, prop, brut] = m;
    let reste = brut;
    for (const motif of EXCEPTIONS_ECART) reste = reste.replace(motif, " ");
    if (/\d/.test(reste)) hits.push(`${prop}: ${brut.trim()}`);
  }
  return hits;
}

/* ══ 1 — LA FEUILLE RÉELLE ═══════════════════════════════════════════════ */

test("fiche.css : aucune taille de texte hors des barreaux --t1..--t7", () => {
  assert.deepEqual(taillesHorsEchelle(FICHE), []);
});

test("fiche.css : aucun interligne écrit en dur", () => {
  assert.deepEqual(interlignesHorsEchelle(FICHE), []);
});

/* ⭐ LA SECONDE MOITIÉ DE L'ÉLARGISSEMENT DU 2026-09-04, et sans elle le garde
   du dessus aurait un trou : il accepte désormais `calc(var(--tN) *
   var(--interligne-texte))`, donc il fait CONFIANCE à ce jeton. Un jeton n'est
   pas digne de confiance parce qu'il a un nom — il l'est parce que sa VALEUR
   est vérifiée. ⛔ `--interligne-texte: normal` passerait le premier garde sans
   un mot, et la hauteur de chaque boîte comptée en lignes se mettrait à
   dépendre de la police (1,208 pour Inter, autre chose en repli). C'est
   exactement la panne que Destiny a payée et écrite dans `shell.css`. */
test("le jeton de rythme est un RAPPORT sans unité — sinon les lignes cessent d'être des lignes", () => {
  const m = stripComments(TOKENS).match(/--interligne-texte:\s*([^;]+);/);
  assert.ok(m, "`--interligne-texte` doit exister dans tokens.css : quatre cotes de fiche le multiplient");
  assert.match(m[1].trim(), /^[\d.]+$/,
    "`--interligne-texte` doit être un nombre NU (un rapport). Avec une unité il fige la ligne sur un "
    + "seul barreau ; avec `normal` il la fait dépendre de la police, et une cote qui dépend d'un défaut "
    + "de moteur n'est pas une cote.");
});

test("fiche.css : aucun écart hors des jetons --sp-*", () => {
  assert.deepEqual(ecartsHorsJeton(FICHE), []);
});

/* ⭐ LE PIED RESTE `--touch`, ET IL EST NOMMÉ. La rangée tactile de la carte
   s'écrivait `44px` — le nombre de `--touch`, recopié à côté d'un
   commentaire qui disait déjà *« le pied garde ses 44 : c'est `--touch` »*.
   Une cote recopiée survit à la mort de sa raison ; celle-ci la NOMME. */
test("fiche.css : la rangée tactile de la carte nomme --touch", () => {
  const texte = stripComments(FICHE);
  /* 📌 ANCRE ÉLARGIE LE 2026-09-03 — Eric a fait remonter le blurb à T2, et la
     rangée qui le porte lit désormais `--fiche-ligne-blurb` au lieu de
     `--fiche-ligne`. Le garde épelait ce jeton : il refusait une grille JUSTE.
     ⭐ CE QU'IL ASSERTE N'A PAS BOUGÉ D'UN POUCE — la dernière rangée nomme
     `--touch`. Ce qui change est l'ANCRE qui l'y mène, et elle reste stricte :
     quatre rangées avant la dernière, dont une boîte de HUIT lignes tirée d'un
     jeton nommé. Un `.*` à la place aurait laissé passer n'importe quelle
     grille — élargir une ancre n'est pas l'ouvrir. */
  const m = texte.match(/grid-template-rows:\s*auto minmax\(0, 1fr\) auto calc\(var\((--[a-z-]+)\) \* (\d+)\) ([^;]+);/);
  assert.ok(m, "la grille du portrait n'a plus la forme attendue");
  assert.match(m[1], /^--fiche-ligne/,
    "la boîte du blurb se compte en lignes : sa rangée nomme un jeton de LIGNE, "
    + "jamais une cote en pixels — c'est la loi de ce fichier");
  /* ⛔ ET LE NOMBRE DE LIGNES N'EST PAS ÉPELÉ NON PLUS. Il valait 8, il vaut 9
     depuis que le blurb est monté à T2 (13 fiches sur 24 étaient tronquées
     d'exactement une ligne, mesuré). Ce que le garde exige est qu'il soit un
     COMPTE ENTIER — une ligne ne se coupe pas aux deux tiers, c'est la loi du
     fichier — et non sa valeur du jour. */
  assert.match(m[2], /^[1-9][0-9]*$/,
    "la boîte se compte en lignes ENTIÈRES");
  assert.equal(m[3].trim(), "var(--touch)");
});

/* ══ 2 — LES ATTAQUES : le garde doit ROUGIR sur du CSS synthétique ═══════
   ⚠️ Un garde qu'on n'a jamais vu rouge ne prouve rien — il peut être vert
   parce qu'il ne regarde nulle part. Chaque scanner est donc éprouvé sur du
   CSS NORMAL (jamais déjà dépouillé à la main), avec la faute exacte que le
   lot 143 a corrigée. */

test("attaque — un corps en pixels bruts est refusé", () => {
  const faute = `.fiche-dalle:not([data-dressing="prose"]) .fiche-bloc1 { font-size: 13px; }`;
  assert.deepEqual(taillesHorsEchelle(faute), ["font-size: 13px"]);
});

test("attaque — un demi-blg est refusé lui aussi", () => {
  assert.deepEqual(taillesHorsEchelle(`.x { font-size: 10.5px; }`), ["font-size: 10.5px"]);
});

test("attaque — le NOMBRE d'un barreau, écrit en dur, est refusé", () => {
  /* 🔴 `18px` EST la valeur de `--t5`. Un garde qui ne mesurerait que
     « la valeur rendue est-elle sur l'échelle ? » le laisserait passer — et
     c'est exactement ce que la feuille portait. Ce qui est interdit est
     l'ÉCRITURE en littéral, pas seulement le nombre faux. */
  assert.deepEqual(taillesHorsEchelle(`.x { font-size: 18px; }`), ["font-size: 18px"]);
});

test("attaque — un écart en pixels bruts est refusé", () => {
  const faute = `.x { padding: 8px; gap: 8px; margin-left: 8px; margin-bottom: 4px; }`;
  assert.deepEqual(ecartsHorsJeton(faute), [
    "padding: 8px",
    "gap: 8px",
    "margin: 8px",
    "margin: 4px"
  ]);
});

test("attaque — une taille cachée dans un calc est refusée", () => {
  assert.deepEqual(taillesHorsEchelle(`.x { font-size: calc(var(--t5) + 2px); }`), [
    "font-size: calc(var(--t5) + 2px)"
  ]);
  assert.deepEqual(taillesHorsEchelle(`.x { font-size: calc(10px * 1.2); }`), [
    "font-size: calc(10px * 1.2)"
  ]);
});

test("attaque — un interligne recopié en pixels est refusé", () => {
  assert.deepEqual(interlignesHorsEchelle(`.x { --fiche-ligne: 13.2px; }`), [
    "--fiche-ligne: 13.2px"
  ]);
  assert.deepEqual(interlignesHorsEchelle(`.x { line-height: 14.4px; }`), [
    "line-height: 14.4px"
  ]);
});

/* ══ 3 — LE TÉMOIN INVERSE : le garde doit ACCEPTER l'écriture juste ══════
   ⚠️ Un garde qui refuse tout est vert pour la mauvaise raison. Ces trois
   cas sont exactement ce que la feuille porte aujourd'hui. */

test("témoin — l'écriture jetonnée passe, dans les trois familles", () => {
  const bon = `.x { font-size: var(--t2); padding: var(--sp-8); gap: var(--sp-8);
    margin: 0 auto; margin-inline: var(--sp-8); line-height: 1.2;
    --fiche-ligne: calc(var(--t1) * 1.2); width: 50%; }`;
  assert.deepEqual(taillesHorsEchelle(bon), []);
  assert.deepEqual(ecartsHorsJeton(bon), []);
  assert.deepEqual(interlignesHorsEchelle(bon), []);
});

test("témoin — `font-size: inherit` reste légal", () => {
  /* Les organes internes du bloc 1 héritent le corps de leur bloc — c'est la
     règle d'Eric du 27/08 (*« espacement entre les lignes pas homogène »*),
     et `inherit` n'est pas une cote. */
  assert.deepEqual(taillesHorsEchelle(`.x { font-size: inherit; }`), []);
});
