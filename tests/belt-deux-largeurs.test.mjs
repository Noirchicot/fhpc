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

/** Les règles UNE PAR UNE, sélecteur compris — l'inverse de `regle`, qui les
 *  concatène. ⭐ ET LES DEUX SONT NÉCESSAIRES : `regle` répond à « que porte
 *  l'organe ? » (la cascade), celui-ci à « qui l'écrit ? ». Une question sur
 *  un ÉCRIVAIN ne se pose jamais à une cascade — la cascade contient toujours
 *  la déclaration innocente à côté de la coupable, et le garde jure sur la
 *  mauvaise. C'est exactement ce qui est arrivé ici le 15/09. */
function declarations(css, filtre) {
  const trouvees = [];
  for (const [, brut, corps] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selecteur = brut.replace(/\s+/g, " ").trim();
    if (filtre(selecteur)) trouvees.push([selecteur, corps]);
  }
  return trouvees;
}

/** 🔴 LE SÉLECTEUR DU CRAN PORTE `:not([hidden])` DEPUIS LE LOT 186, et la
 *  garde reste ANCRÉE : `.belt-item` et `.belt-item:not([hidden])`, rien
 *  d'autre. ⛔ Pas un `.belt-item` non ancré — il ramasserait
 *  `.belt-item[data-status]` et toute la famille, et le garde jurerait sur une
 *  cascade qu'on ne lui a pas demandé de lire.
 *  ⚖️ POURQUOI LA CLAUSE EST LÀ : `paintBelt` cache les crans que la pile ne
 *  justifie pas (`item.hidden = true`), et un `display: flex` sans condition
 *  BAT le `[hidden]` de l'agent utilisateur — NORMES §6, la loi payée trois
 *  fois (le panneau, le chevron, la carte R). */
const CRAN = /^\.belt-item(:not\(\[hidden\]\))?$/;

/* ══ 1 — LA TUILE : DEUX RANGS, ET UNE COTE QUI SE DÉDUIT ══════════════════ */

test("🔴 la tuile du belt empile la pastille et le nom — c'est ce qui rend « la même taille » possible", () => {
  /* ⭐ Côte à côte, la largeur suivait LE MOT (mesuré : `Class` 99 blg contre
     `Inheritance` 142). Empilés, elle ne dépend plus de rien. */
  const corps = regle(shellCss, CRAN);
  assert.ok(corps, "`.belt-item` doit exister");
  assert.match(corps, /flex-direction:\s*column/, "deux rangs, pas deux colonnes côte à côte");
  assert.match(corps, /align-items:\s*center/, "et centrés — le croquis les centre");
});

test("🔴 la largeur d'une tuile se DÉDUIT de la piste, elle ne s'écrit jamais", () => {
  /* §1 ter : *« une cote de contenant ne s'écrit pas, elle se déduit
     d'avance »*. Et §1 ter bis : `flex: 0 0`, jamais `0 1` — un organe ne
     rétrécit pas sous sa cote (les bonus tokens tombés à 12 px le 26/08). */
  const etroit = regle(shellCss, CRAN);
  /* ⚖️ LOT 207 — LA PART S'AJOUTE, LA LOI NE BOUGE PAS. Eric, 2026-09-15 :
     *« rapetisse les autres tuiles de 5 %, la tuile dominante grandit de
     5 % »*. La largeur reste DÉDUITE de la piste — elle gagne seulement un
     facteur, `--belt-part` (0,95 par défaut, 1,05 sur la dominante).
     ⛔ CE QUE LE GARDE CONTINUE D'INTERDIRE, et c'est tout son objet : une
     cote ÉCRITE. `101.7px` sur la dominante aurait passé l'ancien motif si
     on l'avait mis ailleurs ; il ne passe pas celui-ci. */
  assert.match(etroit, /flex:\s*0 0 calc\(\(100% - 2 \* var\(--sp-8\)\) \/ 3(\s*\* var\(--belt-part\))?\)/,
    "en étroit : la piste moins ses deux gouttières, divisée par les TROIS crans du croquis");
  assert.doesNotMatch(etroit, /flex:[^;]*\d+(\.\d+)?px/,
    "une largeur de tuile ÉCRITE en pixels — elle se déduit de la piste, toujours");
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

test("🔴 le libellé change de CRAN entre les deux états — T1 dessous, T2 sur la dominante", () => {
  /* ⚖️ ARBITRAGE D'ARCHI 30, 2026-09-02, ET IL TIENT TOUJOURS : j'avais pris T1
     comme une fatalité. ⛔ *« Avant de faire tomber l'organe le plus regardé du
     builder de T4 à T1, fais céder le VIDE »* — la loi du §2 bis : **quand un
     écran déborde, ce sont les vides qui cèdent, jamais les organes.**

     ⚖️ ET ERIC L'A PRÉCISÉ LE 15/09, il n'y a pas renoncé : *« le texte descend
     d'un incrément plutôt que de dézoomer aussi »*, *« idem sur
     l'agrandissement »*. Le corps n'est donc plus UN, il est DEUX — et c'est
     un axe à part entière, pas une conséquence de la taille de la tuile :
     dézoomer le texte de 5 % rendrait 11,4 px, qui n'est aucun barreau.
     ⭐ CE QUE LE GARDE TIENT MAINTENANT, et c'est plus que ce qu'il tenait :
     les deux crans SONT nommés, et le mot doit RENTRER dans les deux états.
     L'ancien garde ne vérifiait que le jeton ; il aurait laissé passer un
     débordement. 📏 Mesuré au `measureText`, police embarquée, piste à 199 :
         place offerte   inactive 55,08   ·   dominante 60,83
         Inheritance     T1 53,01 ✅       ·   T2 63,61 ⛔
         Equipment       T1 50,36 ✅       ·   T2 60,43 ✅
         Background      T1 56,81 ⛔       ·   T2 68,17 ⛔ */
  const corps = regle(shellCss, /^\.belt-label$/);
  assert.ok(corps, "`.belt-label` doit porter son corps");
  assert.match(corps, /font-size:\s*var\(--t1\)/,
    "T1 dessous — le cran du dessous, pas un facteur d'échelle");
  const dominante = regle(shellCss, /^\.belt-item\[data-status="current"\] \.belt-label$/);
  assert.ok(dominante, "la dominante doit porter SON cran, nommément");
  assert.match(dominante, /font-size:\s*var\(--t2\)/,
    "et T2 dessus — un barreau plus haut, pas 5 % de plus");
  assert.ok(!/font-size:\s*calc|font-size:[^;]*%/.test(corps + dominante),
    "⛔ jamais un facteur sur le corps : l'échelle du dépôt a des barreaux, on en saute un");
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
  const tuile = regle(shellCss, CRAN);
  const libelle = regle(shellCss, /^\.belt-label$/);
  assert.match(tuile, /padding:\s*var\(--sp-4\) var\(--sp-2\)/,
    "le rembourrage : 4 en hauteur (le budget) et 2 en largeur (la place du mot)");
  assert.match(tuile, /gap:\s*var\(--sp-2\)/, "l'écart entre la pastille et le nom : 2");
  assert.match(libelle, /line-height:\s*1(?![.\d])/,
    "l'interligne : 1. À 1,2 la ceinture rend 62 et la scène perd deux blg");
  assert.match(tuile, /min-height:\s*var\(--touch\)/,
    "et la tuile ne descend jamais sous le plancher tactile");
});

/* ══ 1 bis — LA LOI DU RAIL : UN SEUL ACTIF, QUATRE AXES ══════════════════
   Eric, 2026-09-15. Ces quatre gardes sont nés d'une nuit où TOUT était écrit
   et où RIEN ne se voyait — c'est la famille de défaut qu'ils surveillent. */

test("🔴 UN SEUL ÉCRIVAIN PEINT LA DALLE — et c'est la `::before`, jamais la boîte", () => {
  /* 🔴 LE DÉFAUT QUE CE GARDE AURAIT ATTRAPÉ, et il a coûté une nuit : la
     boîte `.belt-item` peignait `--dalle-simple` sur ses 44 blg pendant que
     sa `::before` peignait la dalle à la cote (41/45) derrière, en z-index
     -1. Les deux écrivaient la même surface ; celui du dessus gagnait.
     📏 Relevé au navigateur : les huit tuiles rendaient 44 de haut,
     DOMINANTE COMPRISE. L'écart de hauteur était écrit, testé, et invisible.
     ⛔ Et c'est pour ça que le garde regarde QUI PEINT, pas ce qui est écrit :
     une cote juste dans une règle perdante est indiscernable d'une cote juste.
     ⭐ La règle générale : deux organes qui peignent la même surface sont UN
     organe — celui qui la peint. L'autre doit se taire, pas se recouvrir. */
  /* ⛔ ET CE GARDE A DÛ ÊTRE REFAIT — il est né FAUX, sur la faute même qu'il
     surveille. Sa première version lisait `regle(shellCss, CRAN)`, qui
     CONCATÈNE les règles `.belt-item` ET `.belt-item:not([hidden])`. Remettre
     le fond fautif sur l'une laissait le `background: none` de l'autre dans
     le texte lu : le garde restait VERT sur le défaut exact qu'il devait
     tenir. Un témoin qui ne peut jamais accuser est pire qu'aucun témoin.
     ⭐ Il énumère donc les règles UNE PAR UNE, et il accuse celle qui peint. */
  /* ⚠️ LE FILTRE VISE LA TUILE ELLE-MÊME, pas sa descendance : un sélecteur
     qui SE TERMINE par le compound `.belt-item…`. Sans cette précision il
     ramassait `.belt-item[data-fait="true"] .belt-index` — la pastille verte,
     qui a tout droit de peindre son disque. Un garde qui accuse un innocent
     se fait desserrer, et c'est comme ça qu'on perd un garde. */
  const estLaTuile = (sel) => sel.split(",").some((part) => /^\.belt-item[^\s]*$/.test(part.trim()));
  const peintres = declarations(shellCss, (sel) => estLaTuile(sel) && !/::/.test(sel));
  assert.ok(peintres.length >= 2, "les règles de la tuile doivent être lues une par une");
  for (const [selecteur, corps] of peintres) {
    const fond = corps.match(/(?:^|[;{\s])background(?:-color)?:\s*([^;]+)/);
    assert.ok(!fond || /^none$/.test(fond[1].trim()),
      "⛔ `" + selecteur + "` peint un fond (" + (fond && fond[1].trim()) +
      ") — la dalle a UN écrivain, la `::before`, et la boîte fait 44 quand la dalle en fait 41");
    assert.ok(!/box-shadow/.test(corps),
      "⛔ `" + selecteur + "` pose une ombre : elle cerclerait 44 autour d'une dalle de 41");
  }
  const dalle = regle(shellCss, /^\.belt-item:not\(\[hidden\]\)::before$/);
  assert.ok(dalle, "la dalle peinte doit exister, et c'est elle l'écrivain");
  assert.match(dalle, /height:\s*var\(--belt-tuile\)/, "elle porte la cote non active");
  assert.match(dalle, /background:\s*var\(--belt-dalle\)/, "elle porte le voile du belt");
  assert.match(dalle, /box-shadow:\s*inset[^;]*--verre-lisere/,
    "et le liseré, qui borde ce qu'il borde");
});

test("🔴 UN SEUL RATIO POUR LES DEUX DIMENSIONS — la tuile grandit, elle ne se déforme pas", () => {
  /* ⚖️ Eric, 2026-09-15 : *« les tuiles grandissent en largeur ET en hauteur
     aussi, attention ! »*
     🔴 LE PIÈGE, MESURÉ : 41 et 45 sont des HAUTEURS, la largeur est une PART
     de la piste. Écrites séparément (0,95 / 1,05 d'un côté, 41 / 45 de
     l'autre), elles donnaient +10,5 % en largeur et +9,76 % en hauteur. Une
     tuile qui grandit de deux pourcentages selon l'axe n'est pas la même
     tuile en plus grand : c'est une autre forme.
     ⭐ CE QUE LE GARDE TIENT : il n'existe qu'UNE source d'agrandissement, et
     les deux axes la lisent. Un chiffre littéral dans une part le rouvrirait. */
  assert.match(tokensCss, /--belt-ratio-dom:\s*calc\(var\(--belt-cote-dom\) \/ var\(--belt-cote\)\)/,
    "le ratio se DÉDUIT des deux cotes — il ne s'écrit pas");
  for (const jeton of ["--belt-part", "--belt-part-dom"]) {
    const ligne = tokensCss.match(new RegExp(jeton + ":\\s*([^;]+);"));
    assert.ok(ligne, "`" + jeton + "` doit exister en jeton — la piste le lit aussi");
    assert.match(ligne[1], /var\(--belt-ratio-dom\)/,
      "⛔ `" + jeton + "` doit se déduire du ratio, jamais d'un nombre écrit");
  }
  const dominante = regle(shellCss, /^\.belt-item\[data-status="current"\]$/);
  assert.match(dominante, /--belt-part:\s*var\(--belt-part-dom\)/,
    "et la largeur de la dominante lit ce jeton, elle ne le recalcule pas");
  const cote = regle(shellCss, /^\.belt-item\[data-status="current"\]::before$/);
  assert.match(cote, /height:\s*var\(--belt-tuile-dom\)/,
    "pendant que la hauteur lit la cote dont ce même ratio est tiré");
});

test("🔴 LA LOI DU RAIL — un astre s'allume comme une tuile, à la même cote", () => {
  /* ⚖️ Eric, 2026-09-15 : *« soleil actif : augmente la cote du soleil (45),
     qui reste à gauche, mets-lui un halo, tout le reste passe à un voile à
     10 % et rapetisse de 10 %. Idem quand lune active. »*
     ⭐ ET LE MOTEUR LE SAVAIT DÉJÀ : Menu est `STEPS[0]`, Sheet le dernier, et
     `paintBelt` écrit `data-status` sur les DIX items. La loi « un seul actif
     à la fois » n'est pas câblée — elle est la conséquence de `state.step`,
     qui est un nombre unique. Ce garde tient la PEINTURE, pas l'état.
     ⚠️ 45 > 44 : `--touch` est un PLANCHER, pas une cote. L'astre allumé a le
     droit de dépasser son plancher, jamais de passer dessous. */
  const astre = regle(shellCss, /^\.belt-onglet\[data-status="current"\]$/);
  assert.ok(astre, "l'astre allumé doit avoir sa règle — sinon la loi n'est pas peinte");
  assert.match(astre, /width:\s*var\(--belt-tuile-dom\)/, "il prend la cote dominante");
  assert.match(astre, /background-size:\s*var\(--belt-tuile-dom\)/,
    "⛔ et son DESSIN suit sa boîte : à 45 dans une boîte de 44, le disque serait rogné");
  for (const [quoi, corps] of [["l'astre", astre],
       ["la dalle dominante", regle(shellCss, /^\.belt-item\[data-status="current"\]::before$/)]]) {
    assert.match(corps, /var\(--belt-halo\)/, "le halo de " + quoi + " lit `--belt-halo`");
    assert.match(corps, /0 0 var\(--halo-epais\) var\(--halo-fin\)/,
      "⛔ et il a la grammaire du halo de la maison (panneau actif), pas la sienne");
  }
});

test("🔴 LE VOILE DU BELT EST À LUI — le socle n'a pas bougé pour une rangée", () => {
  /* 🔴 LA TENTATION, ET POURQUOI C'EST UN DÉFAUT : Eric demande 10 % pour les
     tuiles éteintes. `--voile-simple` valait 35 et le belt le lisait — le
     descendre à 10 aurait réglé la rangée EN EFFAÇANT LE VERRE DE TOUT LE
     BUILDER, qui l'emploie pour ses choix et ses gros affichages.
     ⭐ Un voile de belt est un voile de belt. Le garde tient les deux bouts :
     le jeton local existe, et le jeton du socle n'a pas bougé.
     📏 Le rapport de matière entre une tuile et la dominante passe de 1,43
     (35/50) à 5 (10/50) — c'est cet écart-là qui manquait, pas des pixels. */
  assert.match(tokensCss, /--belt-voile:\s*10%/, "le belt a SON voile, à 10 %");
  assert.match(tokensCss, /--belt-dalle:\s*color-mix\(in srgb, var\(--surface\) var\(--belt-voile\), transparent\)/,
    "et sa dalle s'en déduit, sur la surface du thème");
  assert.match(tokensCss, /--voile-simple:\s*35%/,
    "⛔ ET LE VOILE DU SOCLE N'A PAS BOUGÉ — il habille tous les panneaux du builder");
  const dominante = regle(shellCss, /^\.belt-item\[data-status="current"\]::before$/);
  assert.match(dominante, /background:\s*var\(--dalle-inter\)/,
    "la dominante, elle, garde le verre moyen du socle (50 %) : c'est un panneau plein");
});

test("🔴 LES DEUX ESPACEURS LISENT LA MÊME PART QUE LES TUILES", () => {
  /* ⚖️ Eric, 2026-09-14 : *« je veux que la fenêtre en cours soit TOUJOURS
     sous la tuile centrale du belt »*.
     📏 `keepInView(…, "x")` centrait déjà juste — mesuré sur les huit crans,
     l'écart au centre valait −0,01 à +0,38 blg pour les six du milieu. Ce qui
     manquait était le MOU aux deux bouts : `Identity` restait à −67,09 du
     centre, `Equipment` à +67,46, la piste au bout de sa course.
     ⭐ Les espaceurs le rendent — une demi-piste moins une demi-dominante. Et
     ils lisent la MÊME part : un espaceur calculé à part décentrerait le jour
     où la part bouge, et il décentrerait SILENCIEUSEMENT.
     📏 Après : les huit crans se centrent entre −0,46 et +0,46 blg. */
  const espaceur = regle(shellCss, /^\.belt-track::before,\s*\.belt-track::after$/);
  assert.ok(espaceur, "les deux espaceurs doivent exister — sans eux, pas de « toujours »");
  assert.match(espaceur, /var\(--belt-part-dom\)/,
    "⛔ ils lisent la part de la dominante, ils ne la recalculent pas");
  assert.match(espaceur, /\(100% - 2 \* var\(--sp-8\)\) \/ 3/,
    "et la même formule de piste que les tuiles — une seule géométrie");
  assert.ok(!/\d+(\.\d+)?px/.test(espaceur.replace(/var\([^)]*\)/g, "")),
    "⛔ aucune cote écrite : le mou se déduit de la piste, comme la tuile");
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
  /* ⚖️ LOT 207 — LE JETON CHANGE, LA LOI NON. L'astre est passé de
     `--onglet-taille` (58, le disque du 19/08) à `--astre-cible` (`--touch`,
     44), et il est désormais posé ENTIER dans la barre au lieu d'en déborder
     de moitié — d'où la formule sans « / 2 ». Ce que ce garde protège reste
     mot pour mot le même : c'est l'ÉCART DE LA PISTE qui réserve la place du
     chevron, par UNE formule valable aux deux formats. */
  assert.match(shellCss, /margin-left:\s*calc\(var\(--astre-cible\) \+ var\(--sp-8\) \+ var\(--belt-chevron-zone\)\)/,
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
  assert.match(tokensCss, /--belt-chevron-zone:\s*calc\(var\(--belt-chevron\) \+ var\(--sp-4\)\)/,
    "le dessin plus sa gouttière — la place que la piste réserve");
  /* ⚖️ 15/09 — LA GOUTTIÈRE EST À 4, ET C'EST L'ÉQUIDISTANCE QUI LA FIXE.
     Eric : *« les chevrons (lorsqu'il y en a) sont à équidistance de l'astre
     et de la tuile »*. 📏 Avant, à 8 : le dessin courait de 52 à 80, l'astre
     finissait à 48, la piste commençait à 88 — 4 d'un côté, 8 de l'autre.
     ⭐ Le garde vérifie L'ÉGALITÉ, pas le chiffre, et il la vérifie sur les
     cotes qui la produisent : marge de piste − (bord + astre + dessin) doit
     se partager en deux parts égales.
        écart gauche = (--sp-4 + --astre-cible) → dessin  = marge − astre-cible − sp-8 ... */
  const zone = (jeton) => {
    const m = tokensCss.match(new RegExp(jeton + ":\\s*([^;]+);"));
    return m && m[1].trim();
  };
  assert.equal(zone("--belt-chevron-zone"), "calc(var(--belt-chevron) + var(--sp-4))",
    "⛔ et la gouttière de la zone vaut --sp-4 : à --sp-8 le chevron colle à l'astre "
    + "et s'éloigne de la tuile — mesuré 4 contre 8, l'équidistance était rompue");
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
