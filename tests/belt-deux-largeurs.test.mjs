/* ══ LE BELT SUR DEUX LARGEURS — les décisions du 2026-09-02, gardées ═══════
   📐 Eric, croquis `2026-09-02-belt-etroit-tuiles-egales.jpg` :
   **« TOUTES LES TUILES DU MENU FONT LA MÊME TAILLE »** · *« sur la version
   courte je rajoute ces chevrons cliquables »* · *« quand je suis en bout de
   course le chevron disparaît »* · *« mets le voile à 100 % pour menu et
   sheet »* · **« il doit fonctionner en tactile et en clic souris »**.
   La règle vit dans `ui/builder/NORMES.md` §6 ter.

   ⭐ CE QUE CE FICHIER GARDE : les quatre décisions qui se trahissent SANS
   CASSER — une largeur de tuile qu'on écrirait au lieu de la déduire, une
   cible tactile qu'un dessin dimensionnerait, un voile qui reprendrait une
   teinte, une place de chevron qui bougerait en disparaissant.
   ⚠️ La géométrie, elle, se regarde au navigateur, et elle l'a été (375 × 812
   et 1366 × 1024). Ce fichier garde le RAISONNEMENT. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const shellCss = stripComments(lire("ui/builder/shell.css"));
const tokensCss = stripComments(lire("ui/builder/tokens.css"));
const shellMjs = lire("ui/builder/shell.mjs");

/** Le corps CUMULÉ de toutes les règles qui portent ce sélecteur.
 *
 *  ⚠️ « TOUTES », ET CE GARDE ME L'A APPRIS EN ROUGISSANT : `.belt-item` est
 *  habillé par TROIS règles dans `shell.css` — le dessin, l'aimantation, la
 *  cote. Rendre la PREMIÈRE revenait à jurer que la cote n'existait pas.
 *  ⭐ Lire la cascade est aussi ce qui correspond à la question posée : on
 *  demande ce que l'organe porte, pas où c'est écrit. */
function regle(css, motif) {
  const morceaux = [];
  for (const [, brut, corps] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (motif.test(brut.replace(/\s+/g, " ").trim())) morceaux.push(corps);
  }
  return morceaux.length ? morceaux.join("\n") : null;
}

/* ══ 1 — LA TUILE : DEUX RANGS, ET UNE COTE QUI SE DÉDUIT ══════════════════ */

test("🔴 la tuile du belt empile la pastille et le nom — c'est ce qui rend « la même taille » possible", () => {
  /* ⭐ Côte à côte, la largeur suivait LE MOT (mesuré : `Class` 99 blg contre
     `Inheritance` 142). Empilés, elle ne dépend plus de rien. */
  const corps = regle(shellCss, /^\.belt-item$/);
  assert.ok(corps, "`.belt-item` doit exister");
  assert.match(corps, /flex-direction:\s*column/, "deux rangs, pas deux colonnes côte à côte");
  assert.match(corps, /align-items:\s*center/, "et centrés — le croquis les centre");
});

test("🔴 la largeur d'une tuile se DÉDUIT de la piste, elle ne s'écrit jamais", () => {
  /* §1 ter : *« une cote de contenant ne s'écrit pas, elle se déduit
     d'avance »*. Et §1 ter bis : `flex: 0 0`, jamais `0 1` — un organe ne
     rétrécit pas sous sa cote (les bonus tokens tombés à 12 px le 26/08). */
  const etroit = regle(shellCss, /^\.belt-item$/);
  assert.match(etroit, /flex:\s*0 0 calc\(\(100% - 2 \* var\(--sp-8\)\) \/ 3\)/,
    "en étroit : la piste moins ses deux gouttières, divisée par les TROIS crans du croquis");
  const double = regle(shellCss, /^:root\[data-vue="double"\] \.belt-item$/);
  assert.match(double, /flex:\s*0 0 calc\(\(100% - 7 \* var\(--sp-8\)\) \/ 8\)/,
    "en double : la même formule, avec les HUIT — « une tuile vaut la piste divisée par ce qu'elle montre »");
  /* ⚠️ ON VISE LA LARGEUR, PAS TOUT PIXEL — ce garde a d'abord rougi sur le
     `1px` de l'arête de verre, qui n'est pas une cote de tuile mais l'unité
     minimale visible d'un liseré (la seule que le garde des littéraux excepte
     lui aussi). Chercher une sous-chaîne sans l'ancrer à ce qu'on mesure
     vraiment est la faute que NORMES §0 nomme quatre fois. */
  for (const [nom, corps] of [["étroit", etroit], ["double", double]]) {
    assert.ok(!/(?:^|[;\s])(?:width|min-width|flex-basis)\s*:\s*[^;]*\d+px/.test(corps),
      `⛔ ${nom} : une largeur de tuile écrite en pixels — elle se déduit de la piste (§1 ter)`);
    assert.ok(!/flex:\s*[^;]*\d+px/.test(corps),
      `⛔ ${nom} : une base flex en pixels — même loi`);
  }
});

test("🔴 le libellé tient à T2 — parce que ce sont les VIDES qui ont cédé", () => {
  /* ⚖️ ARBITRAGE D'ARCHI 30, 2026-09-02, et il a renversé mon défaut : j'avais
     pris T1 comme une fatalité (`Inheritance` demandait 63,6 blg pour 63
     offerts — il en manquait 0,6). ⛔ *« Avant de faire tomber l'organe le
     plus regardé du builder de T4 à T1, fais céder le VIDE »* — c'est la loi
     du §2 bis : **quand un écran déborde, ce sont les vides qui cèdent,
     jamais les organes.**
     📏 DEUX VIDES ONT CÉDÉ, ET ÇA A SUFFI : le rembourrage latéral (4 → 2) et
     l'interligne (1,2 → 1). Mesuré sur la page rendue : place offerte **67**,
     `Inheritance` en demande **64** — trois blg de reste, et **aucun des huit
     mots ne déborde**. La ceinture reste à 60, la tuile à 71 × 44.
     ⭐ La leçon vaut au-delà : un organe qu'on rétrécit « parce qu'il manque
     un demi-pixel » est presque toujours un vide qu'on n'a pas regardé. */
  const corps = regle(shellCss, /^\.belt-label$/);
  assert.ok(corps, "`.belt-label` doit porter son corps");
  assert.match(corps, /font-size:\s*var\(--t2\)/, "T2 — le corps que les vides ont rendu possible");
  assert.match(corps, /line-height:\s*1(?![.\d])/,
    "et l'interligne à 1 : c'est lui qui garde la tuile à 44 blg, donc la ceinture à 60");
  assert.match(corps, /white-space:\s*nowrap/,
    "⛔ jamais deux lignes : le budget vertical du belt n'en a pas (44 blg, pile)");
});

test("🔴 LE BUDGET VERTICAL DE LA TUILE — les trois vides sont à leur plancher", () => {
  /* ⭐ CE QUE CE GARDE TIENT VRAIMENT, ET CE N'EST PAS LE BELT : un vide se
     paie AILLEURS qu'où on le regarde (NORMES §6 ter, la leçon à part).
     L'interligne du libellé passait pour un réglage de texte ; mesuré, il
     rendait la tuile à 46,4 au lieu de 44, donc la ceinture à 62 au lieu de
     60 — **deux blg pris à la scène**, sur un budget qui n'a que 9 blg de mou
     (31/08).

     📐 LA SOMME QUE CE GARDE PROTÈGE, terme par terme :
         rembourrage --sp-4 .... 4
         pastille .............. 22
         écart --sp-2 ..........  2
         libellé T2, interligne 1  12
         rembourrage --sp-4 ....  4
         ──────────────────────── 44  = --touch  →  ceinture 60
     ⛔ Faire grandir N'IMPORTE LEQUEL des trois vides sort de 44. Le garde les
     nomme donc un par un : une prochaine main qui remonte l'interligne « pour
     aérer » verra l'arithmétique avant de le faire, pas le débordement après. */
  const tuile = regle(shellCss, /^\.belt-item$/);
  const libelle = regle(shellCss, /^\.belt-label$/);
  assert.match(tuile, /padding:\s*var\(--sp-4\) var\(--sp-2\)/,
    "le rembourrage : 4 en hauteur (le budget) et 2 en largeur (la place du mot)");
  assert.match(tuile, /gap:\s*var\(--sp-2\)/, "l'écart entre la pastille et le nom : 2");
  assert.match(libelle, /line-height:\s*1(?![.\d])/,
    "l'interligne : 1. À 1,2 la ceinture rend 62 et la scène perd deux blg");
  assert.match(tuile, /min-height:\s*var\(--touch\)/,
    "et la tuile ne descend jamais sous le plancher tactile");
});

/* ══ 2 — LE CHEVRON : LA CIBLE COMMANDE, LE DESSIN SUIT ════════════════════ */

test("🔴 la cible du chevron vaut `--touch`, et le DESSIN se déduit d'elle", () => {
  /* ⚖️ RENVERSEMENT DU 02/09 : NORMES §6 portait *« pas besoin d'être efficace
     au tactile — surtout utile pour la souris »* sur cet organe. Eric : *« il
     doit fonctionner en tactile et en clic souris »*. L'exception tombe. */
  const corps = regle(shellCss, /\.belt-chevron:not\(\[hidden\]\)/);
  assert.ok(corps, "`.belt-chevron` doit exister");
  assert.match(corps, /width:\s*var\(--touch\)/,
    "la CIBLE est `--touch`, jamais une largeur de dessin");
  assert.match(tokensCss, /--belt-chevron:\s*calc\(var\(--touch\) - 2 \* var\(--sp-8\)\)/,
    "⛔ et le dessin se déduit de la cible, jamais l'inverse — « un contrôle ne se laisse jamais dimensionner par un dessin »");
});

test("🔴 LA FLÈCHE EST L'ORGANE — pas de tuile sous elle, et c'est ELLE qui porte le 35 %", () => {
  /* ⚖️ RENVERSEMENT DU 2026-09-02, et c'est ma LECTURE qui était fausse, pas
     la consigne d'Eric qui a changé : *« rends sa tuile invisible, voile 0 % ;
     je veux juste voir la flèche, qui flotte au-dessus du background. La
     flèche est un organe et a un voile à 35 %. »*
     ⛔ J'avais lu son « transparence voile 35 % » comme le voile d'une petite
     DALLE posée sous la flèche — une surface de plus dans une rangée qui en
     porte onze, là où son croquis ne dessinait qu'un trait nu.
     ⭐ CE QUI NE BOUGE PAS D'UN BLG, ET C'EST LE POINT : la CIBLE (`--touch`,
     sur le bouton) et la place réservée dans la piste. On retire une PEINTURE,
     pas une COTE — la distinction du collecteur du 26/08. */
  const boite = regle(shellCss, /^\.belt-chevron-fleche$/);
  assert.ok(boite, "la boîte qui centre le trait doit exister");
  assert.ok(!/background/.test(boite),
    "⛔ voile 0 % : la boîte ne peint RIEN — ni fond, ni arête de verre");
  assert.ok(!/box-shadow/.test(boite), "⛔ ni arête de verre : il n'y a plus de tuile à border");
  assert.match(boite, /height:\s*var\(--touch\)/, "et elle garde sa cote, qui n'est pas une peinture");

  /* Et le TRAIT porte le voile — la formule des trois dalles, transposée
     d'un fond à une encre. ⛔ Aucun pourcentage inventé. */
  const trait = regle(shellCss, /\.belt-chevron-fleche::before$/);
  assert.match(trait, /var\(--chevron-trait\)/, "le trait lit son encre voilée");
  assert.match(tokensCss, /--chevron-trait:\s*color-mix\(in srgb, var\(--text\) var\(--voile-simple\), transparent\)/,
    "l'encre du site sous le voile SIMPLE (35 %), dérivée — jamais un littéral");
  for (const teinte of ["--positive", "--info", "--critical", "--caution", "--accent"]) {
    assert.ok(!tokensCss.includes(`--chevron-trait: color-mix(in srgb, var(${teinte})`),
      `⛔ ${teinte} : le chevron ne dit pas où l'on en est`);
  }
});

test("🔴 en bout de course le chevron disparaît — et sa PLACE reste", () => {
  /* Les deux moitiés comptent : sans la seconde, les trois tuiles sauteraient
     d'un cran chaque fois qu'on atteint un bout. */
  assert.match(shellMjs, /belt\.avant\.hidden = mou <= 0 \|\| auDebut/, "au début, plus de chevron gauche");
  assert.match(shellMjs, /belt\.apres\.hidden = mou <= 0 \|\| aLaFin/, "à la fin, plus de chevron droit");
  const corps = regle(shellCss, /\.belt-chevron:not\(\[hidden\]\)/);
  assert.match(corps, /position:\s*absolute/,
    "il est posé en ABSOLU sur une zone réservée : le retirer ne déplace aucune tuile");
  const piste = regle(shellCss, /^\.belt-track$/) + (regle(shellCss, /^\.belt-track$/) || "");
  assert.match(shellCss, /margin-left:\s*calc\(var\(--onglet-taille\) \/ 2 \+ var\(--sp-8\) \+ var\(--belt-chevron-zone\)\)/,
    "et c'est l'écart de la piste qui la réserve — une seule formule pour les deux formats");
  assert.ok(piste !== null, "la piste doit être lisible");
});

test("⚔️ ATTAQUE — une règle d'auteur sans `:not([hidden])` rendrait le `hidden` MENSONGER", () => {
  /* 📏 Mesuré le 02/09 sur ce lot même : `display: grid` écrit sans condition
     BAT le `[hidden] { display: none }` de l'agent utilisateur, et le chevron
     restait peint en annonçant qu'il n'y était plus. */
  assert.ok(!/\n\.belt-chevron\s*\{/.test(shellCss),
    "aucune règle `.belt-chevron` inconditionnelle ne doit poser un `display`");
  assert.match(shellCss, /\.belt-chevron:not\(\[hidden\]\)\s*\{[^}]*display:\s*grid/,
    "la règle qui pose le `display` se borne à l'état visible");
});

/* ══ 3 — LES DEUX BOUTS SORTENT DE LA RANGÉE ═══════════════════════════════ */

test("🔴 `Menu` et `Sheet` sont OPAQUES — Eric, 2026-09-02", () => {
  /* ⭐ Un seul geste, deux moitiés : le chevron prend le voile de la rangée
     (35 %) parce qu'il en fait partie ; les deux bouts passent à 100 % parce
     qu'ils n'en font pas partie. */
  assert.match(tokensCss, /--onglet-fond:\s*var\(--surface\);/,
    "voile 100 % — ils valaient 80 % depuis leur naissance, c'est un renversement daté");
  assert.ok(!/--onglet-fond:\s*color-mix/.test(tokensCss),
    "⛔ plus aucun mélange : « à 100 % » ne se règle pas, il se pose");
});

/* ══ 4 — DEUX FORMATS, UNE SEULE FORMULE ═══════════════════════════════════ */

test("🔴 la zone du chevron est le SEUL interrupteur entre les deux formats", () => {
  assert.match(tokensCss, /--belt-chevron-zone:\s*calc\(var\(--belt-chevron\) \+ var\(--sp-8\)\)/,
    "le dessin plus sa gouttière — la place que la piste réserve");
  assert.match(tokensCss, /:root\[data-vue="double"\]\s*\{[^}]*--belt-chevron-zone:\s*0px/,
    "et elle tombe à zéro en vue double : le belt y est déroulé, il n'y a pas de course");
  /* ⛔ Le format ne se lit PAS dans un `@media` de largeur — §0 bis : il ne se
     réévalue pas sous `zoom`. C'est `data-vue`, posé là où l'échelle est connue. */
  assert.ok(!/@media[^{]*\b(min|max)-width/.test(shellCss + tokensCss),
    "aucune requête média de largeur n'a été ajoutée par ce lot");
});

test("🔴 le pas d'un chevron SE MESURE — une tuile plus sa gouttière", () => {
  /* §1 ter : un `79 + 8` en dur mentirait au premier réglage. Et l'écart entre
     deux crans voisins EST cette somme, quelles que soient leurs cotes. */
  assert.match(shellMjs, /const pas = crans\[1\]\.offsetLeft - crans\[0\]\.offsetLeft;/,
    "l'écart entre deux crans voisins, lu dans la mise en page");
  assert.ok(!/scrollBy\(\{ left: sens \* pas, behavior/.test(shellMjs),
    "⛔ aucun `behavior` en dur : un geste laisse le CSS trancher, `prefers-reduced-motion` compris");
});
