/* ══ LE GARDE DU DESKTOP FINI — lot 70 ═══════════════════════════════════

   Le lot 69 a construit la grandeur Large en jetons ; ce lot finit ce qui
   demandait du JavaScript ET les quatre clauses CSS qui vont avec. Chacune
   répare un défaut MESURÉ à 1 440 × 900 ou à 360 × 780 :

     1. le cran de la molette d'étapes mesurait 38 px — sous le seuil
        tactile que le cadre s'impose depuis le lot 58 (`--touch`, 44 px
        Apple). Défaut ANTÉRIEUR au lot 69, mesuré identique avant lui ;
     2. les chevrons flottants naissaient VISIBLES (`opacity: 1`) : ils
        flashaient sur des écrans qui ne défilent pas (Universe en Large,
        champ 800/800), et leur hôte mangeait molette et balayages
        (60 × 112 px posés sur la fiche). La polarité s'inverse : cachés
        tant que `socle.mjs` n'a pas dit vrai, hôte transparent au
        pointeur, boutons vivants SEULEMENT quand ils se voient ;
     3. l'amorce de la fiche : `.stage[data-more="true"]` fond son bas dans
        le décor via `--stage-amorce` — l'affordance « il y a une suite »
        que la souris n'avait pas (« pas de snap », Eric) ;
     4. le jeton `--stage-amorce` vaut `none` à la BASE (l'étroit ne bouge
        pas d'un octet — même contrat que le garde 6 du lot 69) et ne
        s'allume que dans le bloc Large, en fondu noir/transparent : un
        masque n'est pas une teinte, le garde des thèmes reste muet à
        raison.

   ⚠️ MÊME MÉTHODE QUE `tests/ui-jetons.test.mjs` : un balayage d'octets,
   pas de DOM, pas de paquet — et des ATTAQUES en mémoire qui prouvent que
   chaque clause mord. La MACHINE À ÉTATS des chevrons, elle, est prouvée
   dans `tests/chevrons.test.mjs`. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI_DIR = path.join(HERE, "..", "ui", "builder");

const shellCssRaw = fs.readFileSync(path.join(UI_DIR, "shell.css"), "utf8");
const tokensCssRaw = fs.readFileSync(path.join(UI_DIR, "tokens.css"), "utf8");

/* ── LES SCANNERS — fonctions pures, réutilisées par les attaques ────── */

/** Clause 1 : le cran de la molette d'étapes est une cible tactile. */
function cranTactile(css) {
  const stripped = stripComments(css);
  const bloc = stripped.match(/(?:^|\})\s*\.belt-item\s*\{([^}]*)\}/);
  if (!bloc) return ["<.belt-item absent>"];
  return /min-height:\s*var\(--touch\)/.test(bloc[1]) ? [] : ["le cran ne porte pas min-height: var(--touch)"];
}

/** Clause 2 : la polarité des chevrons — cachés par défaut, hôte
 *  transparent au pointeur, boutons vivants seulement une fois visibles. */
function polariteChevrons(css) {
  const stripped = stripComments(css);
  const hits = [];
  const hote = stripped.match(/(?:^|\})\s*\.stage-chevrons\s*\{([^}]*)\}/);
  if (!hote) return ["<.stage-chevrons absent>"];
  if (!/opacity:\s*0/.test(hote[1])) hits.push("l'hôte ne naît pas caché (opacity: 0)");
  if (!/pointer-events:\s*none/.test(hote[1])) hits.push("l'hôte prend encore le pointeur — la bande mange molette et balayages");
  if (!/\.stage-chevrons\[data-visible="true"\]\s*\{[^}]*opacity:\s*1/.test(stripped)) {
    hits.push("rien ne les montre quand socle.mjs dit vrai");
  }
  const bouton = stripped.match(/(?:^|\})\s*\.stage-chevron\s*\{([^}]*)\}/);
  if (!bouton || !/pointer-events:\s*none/.test(bouton[1])) {
    hits.push("un bouton invisible resterait cliquable (pointer-events du bouton)");
  }
  if (!/\.stage-chevrons\[data-visible="true"\]\s+\.stage-chevron\s*\{[^}]*pointer-events:\s*auto/.test(stripped)) {
    hits.push("les boutons ne reprennent jamais le pointeur — les chevrons seraient morts partout");
  }
  return hits;
}

/** Clause 2 bis : un bout de course s'éteint en ENCRES DE JETONS — jamais
 *  un troisième gris inventé (la porte de l'habillage, lot 38). */
function boutDeCourse(css) {
  const stripped = stripComments(css);
  const bloc = stripped.match(/(?:^|\})\s*\.stage-chevron:disabled\s*\{([^}]*)\}/);
  if (!bloc) return ["<.stage-chevron:disabled absent — une direction impossible resterait pleine encre>"];
  const hits = [];
  if (!/color:\s*var\(--text-muted\)/.test(bloc[1])) hits.push("l'encre éteinte n'est pas la mention (--text-muted)");
  if (!/border-color:\s*var\(--border\)/.test(bloc[1])) hits.push("la bordure éteinte n'est pas celle de carte (--border)");
  return hits;
}

/** Clause 3 : l'amorce est consommée sous data-more, en paire
 *  mask/-webkit-mask — l'interrupteur est au socle, la forme au jeton. */
function amorceConsommee(css) {
  const stripped = stripComments(css);
  const bloc = stripped.match(/(?:^|\})\s*\.stage\[data-more="true"\]\s*\{([^}]*)\}/);
  if (!bloc) return ["<.stage[data-more=\"true\"] absent>"];
  const hits = [];
  if (!/(?:^|;|\s)mask-image:\s*var\(--stage-amorce\)/.test(bloc[1])) hits.push("mask-image ne consomme pas le jeton");
  if (!/-webkit-mask-image:\s*var\(--stage-amorce\)/.test(bloc[1])) hits.push("la jumelle -webkit manque (WebKit ne lit que la sienne)");
  return hits;
}

/** Clause 4 : le jeton — `none` à la base (l'étroit intouché), fondu
 *  noir/transparent en Large, profondeur en jeton d'espacement. */
function amorceJeton(tokensCss) {
  const stripped = stripComments(tokensCss);
  const darkIdx = stripped.indexOf("@media (prefers-color-scheme: dark)");
  const largeIdx = stripped.indexOf("@media (min-width: 1140px)");
  if (darkIdx === -1 || largeIdx === -1) return ["<blocs sombre/Large introuvables>"];
  const hits = [];
  if (!/--stage-amorce:\s*none;/.test(stripped.slice(0, darkIdx))) {
    hits.push("la BASE n'est pas `none` — à 360, l'octet doit rester celui d'avant le lot");
  }
  const large = stripped.slice(largeIdx);
  const enLarge = large.match(/--stage-amorce:\s*([^;]+);/);
  if (!enLarge) hits.push("le bloc Large ne porte pas l'amorce — le desktop resterait « une page sans suite »");
  else {
    if (!/^linear-gradient\(to bottom,\s*black calc\(100% - var\(--sp-\d+\)\),\s*transparent\)$/.test(enLarge[1].trim())) {
      hits.push(`la forme du fondu a dérivé : ${enLarge[1].trim()} — noir/transparent y encodent la VISIBILITÉ, la profondeur vient d'un jeton d'espacement`);
    }
  }
  return hits;
}

/* ── LES CLAUSES ─────────────────────────────────────────────────────── */

test("desktop-fini 1 — le cran de la molette d'étapes porte le seuil tactile (mesuré : 38 px avant ce lot)", () => {
  assert.deepEqual(cranTactile(shellCssRaw), [],
    "44 px là où le doigt agit — le même --touch que le cadre s'impose depuis le lot 58");
});

test("desktop-fini 2 — la polarité des chevrons : cachés sans vérité du socle, hôte transparent au geste", () => {
  assert.deepEqual(polariteChevrons(shellCssRaw), [],
    "mesuré à 1440 : le flash d'Universe (champ 800/800) et la bande de 60 × 112 px morte au geste");
});

test("desktop-fini 2 bis — un bout de course s'éteint en encres de jetons", () => {
  assert.deepEqual(boutDeCourse(shellCssRaw), [],
    "∨ au pied de Wizard restait pleine encre — présent, pas actionnable, et la paire de jetons le dit");
});

test("desktop-fini 3 — l'amorce de la fiche est consommée sous data-more, en paire mask/-webkit-mask", () => {
  assert.deepEqual(amorceConsommee(shellCssRaw), [],
    "« il y a une suite » : le fondu bible §4, la même famille que l'amorce des molettes");
});

test("desktop-fini 4 — --stage-amorce : none à la base, fondu en Large — l'étroit ne bouge pas d'un octet", () => {
  assert.deepEqual(amorceJeton(tokensCssRaw), [],
    "même contrat que le garde 6 du lot 69 : réparer le desktop en touchant une base ferait payer le téléphone");
});

/* ══ ⚔️ LES ATTAQUES — un garde jamais attaqué n'est pas un garde ═══════
   Chacune mute une COPIE en mémoire et vérifie que LA clause visée rougit,
   seule. Rien n'est écrit sur le disque. */

test("⚔️ ATTAQUE 1 — retirer min-height du cran fait rougir SEULEMENT la clause tactile", () => {
  /* ⚠️ PAS un `replace` de la propriété nue : « min-height: var(--touch) »
     existe TROIS fois dans shell.css (le chevron de ceinture d'abord, ligne
     84) — la première version de cette attaque a mutilé le mauvais bloc et
     la clause a continué de dire vrai. On vise le bloc `.belt-item`. */
  const mutated = shellCssRaw.replace(/(\.belt-item\s*\{[^}]*?)min-height:\s*var\(--touch\);/, "$1");
  assert.notEqual(mutated, shellCssRaw, "la substitution a trouvé sa cible");
  assert.deepEqual(cranTactile(mutated), ["le cran ne porte pas min-height: var(--touch)"]);
  assert.deepEqual(polariteChevrons(mutated), [], "la polarité ne bouge pas");
  assert.deepEqual(amorceConsommee(mutated), [], "l'amorce non plus");
});

test("⚔️ ATTAQUE 2 — remettre les chevrons visibles par défaut (le défaut d'avant) rougit la polarité", () => {
  const mutated = shellCssRaw.replace(/(\.stage-chevrons\s*\{[^}]*?)opacity:\s*0;/, "$1opacity: 1;");
  assert.notEqual(mutated, shellCssRaw);
  assert.deepEqual(polariteChevrons(mutated), ["l'hôte ne naît pas caché (opacity: 0)"],
    "le flash d'Universe reviendrait exactement par cette ligne");
  assert.deepEqual(cranTactile(mutated), [], "la clause tactile ne bouge pas");
});

test("⚔️ ATTAQUE 3 — un hôte qui reprend le pointeur rougit la polarité (la bande morte reviendrait)", () => {
  const mutated = shellCssRaw.replace(/(\.stage-chevrons\s*\{[^}]*?)pointer-events:\s*none;/, "$1");
  assert.notEqual(mutated, shellCssRaw);
  assert.deepEqual(polariteChevrons(mutated),
    ["l'hôte prend encore le pointeur — la bande mange molette et balayages"]);
});

test("⚔️ ATTAQUE 4 — allumer l'amorce À LA BASE rougit le contrat de l'étroit", () => {
  const mutated = tokensCssRaw.replace("--stage-amorce: none;",
    "--stage-amorce: linear-gradient(to bottom, black calc(100% - var(--sp-32)), transparent);");
  assert.notEqual(mutated, tokensCssRaw);
  assert.deepEqual(amorceJeton(mutated),
    ["la BASE n'est pas `none` — à 360, l'octet doit rester celui d'avant le lot"],
    "réparer le desktop en touchant une base : exactement le geste que le garde 6 du lot 69 interdit déjà ailleurs");
});

test("⚔️ ATTAQUE 5 — une amorce en rgb() dans le bloc Large rougit DEUX gardes : la forme ici, le thème au lot 69", () => {
  const mutated = tokensCssRaw.replace(
    /--stage-amorce:\s*linear-gradient\(to bottom,\s*black calc\(100% - var\(--sp-32\)\),\s*transparent\);/,
    "--stage-amorce: linear-gradient(to bottom, rgb(0 0 0) calc(100% - var(--sp-32)), transparent);"
  );
  assert.notEqual(mutated, tokensCssRaw);
  assert.equal(amorceJeton(mutated).length, 1, "la forme a dérivé — ce garde-ci le dit");
  /* Et la forme rgb() est EXACTEMENT ce que le scanner des thèmes du lot 69
     attrape (`themeViolationsInLarge`, forme de couleur) : le noir du masque
     n'est toléré que parce qu'il encode une visibilité, pas une teinte. */
  assert.match(mutated.slice(stripComments(mutated).indexOf("@media (min-width: 1140px)")), /\brgb\(/,
    "la mutation vit bien dans le bloc Large, là où le garde des thèmes balaie");
});
