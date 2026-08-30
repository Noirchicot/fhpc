/* ══ LE GARDE DES JETONS DU BUILDER — lot 38 ══════════════════════════

   « The lot is done when a test fails if any `font-size` is not a token »
   (fh-phb/UI-TYPOGRAPHY.md, mot pour mot). Cette suite est CE test, et
   quatre autres à côté.

   ⚠️ AUCUN DOM, AUCUN PAQUET DE PLUS : c'est un BALAYAGE D'OCTETS sur
   `ui/builder/shell.css`, exactement comme la loi §0.12 est gardée sur les
   octets de `src/`. Précédent suivi : `tests/source-scan.mjs`
   (`stripComments`, `findForbidden`) et `tests/render-fiche.test.mjs`
   (« elle porte sur la fonction, pas sur la page »).

   ⚠️ LE GARDE NE PORTE QUE SUR `shell.css`. `tokens.css` EST l'endroit où
   les valeurs ont le droit de vivre en dur (§3a de la commande, « la porte
   de l'habillage ») — le scanner sur `tokens.css` reviendrait à interdire
   au fichier de jetons de... porter des jetons.

   ── LES CINQ CLAUSES DU GARDE (commande §4) ──────────────────────────
     1. aucun `font-size` littéral dans `shell.css` — que des `var(--t1..7)` ;
     2. aucun `padding`/`margin`/`gap`/`border-radius` littéral — que des
        `var(--sp-*)` / `var(--radius-*)` ;
     3. aucune couleur littérale (hex, `rgb(`/`rgba(`/`hsl(`/`hsla(`, ou les
        noms `white`/`black`) — que des `var(--…)` ;
     4. aucun `display: none` dans `shell.css` (défaut n°3 : effacer un mot
        au lieu de recomposer) ;
     5. le seuil de bascule (720) n'apparaît qu'UNE fois dans tout
        `ui/builder/`.

   ── LES EXCEPTIONS, CHACUNE AVEC SA RAISON (loi : « une exception sur le
   registre est une décision ; une exception dans la feuille de style est le
   44ᵉ nombre ») ──

     · `0` — une longueur nulle n'est l'expression d'aucun jeton ;
     · `1px` de BORDURE (`border: 1px solid …`) — l'unité minimale visible,
       pas une valeur de l'échelle d'espacement ;
     · `1fr` — une fraction de grille, pas une longueur ;
     · `100vh` — la hauteur de viewport, hors de propos pour une échelle
       d'espacement locale ;
     · les POURCENTAGES (`50%`, `100%`) — relatifs à leur boîte, pas des
       valeurs de jeton (`.belt-index` est un cercle 22×22, 50% le rend
       rond, ça n'a pas de rayon « moyen » ou « petit ») ;
     · `999px` — c'est `--radius-pill` lui-même, la valeur qui LUI DONNE
       son sens (non consommée en dur dans `shell.css` aujourd'hui, gardée
       ici au cas où) ;
     · les stops `transparent`/`black` d'un `mask-image` (et son préfixe
       `-webkit-`) — un masque n'est pas une teinte, c'est un CANAL ALPHA :
       noir/transparent y encodent la visibilité, pas une couleur du
       système. Aucun jeton de la palette ne prétend représenter « une
       opacité de masque ». Portée ÉTROITE : seule la valeur de la
       propriété `mask-image`/`-webkit-mask-image` est exemptée, tout le
       reste de la feuille reste sous le garde. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments, walkSources } from "./source-scan.mjs";
import { createLayers } from "../src/layers/index.mjs";
import { createBuild } from "../src/build/index.mjs";
import { createFhDestinyStat } from "../src/modules/fh/destiny-stat.mjs";
import { createFhSkillPoolStat } from "../src/modules/fh/skill-pool.mjs";
import { LAYER_FILES } from "../ui/builder/engine.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const UI_DIR = path.join(ROOT, "ui", "builder");
const SHELL_CSS_PATH = path.join(UI_DIR, "shell.css");
const TOKENS_CSS_PATH = path.join(UI_DIR, "tokens.css");

const shellCssRaw = fs.readFileSync(SHELL_CSS_PATH, "utf8");
const tokensCssRaw = fs.readFileSync(TOKENS_CSS_PATH, "utf8");

/* ══ LES SCANNERS — fonctions pures, réutilisées par le garde ET par les
   attaques ci-dessous sur du texte SYNTHÉTIQUE. Chacune part du texte BRUT
   (elle dépouille elle-même) pour qu'une attaque n'ait qu'à écrire du CSS
   normal, jamais du CSS déjà dépouillé à la main. */

/** Chaque déclaration `font-size:` dont la valeur n'est pas EXACTEMENT
 *  `var(--t1)`…`var(--t7)`, ou un MULTIPLE écrit de l'un d'eux.
 *
 *  ⚠️ LA SECONDE FORME EST ADMISE DEPUIS LE 2026-08-17, et c'est une
 *  reconnaissance, pas un relâchement. Le garde interdisait `calc(var(--t5) *
 *  1.5)` — une valeur qui ne contient AUCUN nombre de taille et qui suit son
 *  barreau si le barreau bouge. `fiche.css` employait déjà cette forme, avec
 *  sa raison écrite (*« le facteur est écrit comme un CALCUL sur le jeton,
 *  jamais comme un nombre en dur : le jour où `--t5` bouge, le titre suit »*),
 *  et c'est exactement ce que la loi veut. Le garde était donc plus strict que
 *  la loi qu'il protège, et il refusait la bonne écriture.
 *  ⛔ CE QUI RESTE INTERDIT, ET C'EST TOUT CE QUI COMPTE : un nombre de TAILLE
 *  dans la valeur. `calc(var(--t5) + 2px)` reste une violation, `calc(16px *
 *  1.5)` aussi — le facteur est un rapport, pas une cote. L'attaque 2 bis le
 *  prouve plus bas. */
const BARREAU = String.raw`var\(--t[1-7]\)`;
const MULTIPLE_DE_BARREAU = new RegExp(String.raw`^calc\(\s*${BARREAU}\s*\*\s*[\d.]+\s*\)$`);

function fontSizeViolations(cssText) {
  const text = stripComments(cssText);
  const hits = [];
  for (const match of text.matchAll(/font-size\s*:\s*([^;]+);/g)) {
    const value = match[1].trim();
    if (new RegExp(`^${BARREAU}$`).test(value)) continue;
    if (MULTIPLE_DE_BARREAU.test(value)) continue;
    hits.push(value);
  }
  return hits;
}

/* Les tokens de valeur qui n'ont pas besoin d'être enveloppés dans un
   `var(...)` — la liste d'exceptions ci-dessus, sous forme de motifs. */
const SPACING_EXCEPTIONS = [
  /var\(--[\w-]+\)/g,
  /\b0\b/g,
  /\b1fr\b/g,
  /\b100vh\b/g,
  /\b999px\b/g,
  /\b\d+(\.\d+)?%/g
];

/** Chaque déclaration `padding`/`margin`/`gap`/`border-radius` dont la
 *  valeur, une fois les exceptions retirées, porte encore un chiffre. */
function spacingRadiusViolations(cssText) {
  const text = stripComments(cssText);
  const hits = [];
  for (const match of text.matchAll(/\b(padding|margin|gap|border-radius)\s*:\s*([^;]+);/g)) {
    const [, prop, rawValue] = match;
    let remainder = rawValue;
    for (const pattern of SPACING_EXCEPTIONS) remainder = remainder.replace(pattern, " ");
    if (/\d/.test(remainder)) hits.push(`${prop}: ${rawValue.trim()}`);
  }
  return hits;
}

/** Chaque couleur écrite en dur (hex, fonction `rgb*`/`hsl*`, ou les noms
 *  `white`/`black`) — hors des stops d'un `mask-image`, voir l'exception. */
function colorViolations(cssText) {
  const text = stripComments(cssText).replace(/(?:-webkit-)?mask-image\s*:\s*[^;]+;/g, "");
  const hits = [];
  for (const match of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) hits.push(match[0]);
  for (const match of text.matchAll(/\b(rgb|rgba|hsl|hsla)\(/gi)) hits.push(match[0]);
  /* ⚠️ CORRIGÉ LE 2026-08-13 — LE GARDE AVAIT LA FAUTE QU'IL EXISTE POUR
     ATTRAPER. Son motif était `/\b(white|black)\b/` : il matchait `white`
     DANS `white-space: nowrap`, qui est un NOM DE PROPRIÉTÉ et pas une
     couleur. Mesuré en ajoutant une règle légitime — le garde a rougi à tort.
     Le nom de couleur ne se cherche donc plus n'importe où : SEULEMENT dans
     la VALEUR d'une déclaration, après son `:`. C'est la même faute que
     l'architecte a commise quatre fois ce jour-là — chercher une sous-chaîne
     sans l'ancrer à ce qu'on veut vraiment mesurer. */
  for (const declaration of text.matchAll(/:([^;{}]*)/g)) {
    for (const match of declaration[1].matchAll(/\b(white|black)\b/gi)) hits.push(match[0]);
  }
  return hits;
}

/** Chaque `display: none` — le défaut n°3 (effacer des mots).
 *
 *  ══ ⭐ UNE SEULE EXCEPTION, NOMMÉE, ET AJOUTÉE LE 2026-08-16 (lot 80) ══════
 *  `.porte-de .fh-cd-static-die-result` — l'incrustation que le MOTEUR DE DÉS
 *  peint sur la face d'un d6.
 *
 *  🔴 CE N'EST PAS « EFFACER UN MOT », C'EST EN REMPLACER UN FAUX. Le vivier
 *  des caractéristiques pose des SCORES (8 à 18) sur des d6 qui servent de
 *  socle. Le moteur, lui, écrit la FACE du dé — et il a raison de le faire :
 *  un d6 ne peut pas faire 15, et il ne ment pas sur un jet. Les deux
 *  chiffres se superposeraient, et c'est celui du moteur qui serait faux.
 *  L'écran écrit le bon par-dessus (`.valeur`) ; l'autre se tait.
 *  ⛔ CE QUE CETTE EXCEPTION N'AUTORISE PAS : elle est ancrée sur DEUX
 *  classes, dont une du moteur recopié. Aucun libellé du builder n'y entre.
 *  Et le défaut n°3 reste tenu partout ailleurs, y compris dans le reste du
 *  même bloc — c'est la mesure ci-dessous qui le dit.
 *  📌 Même discipline que l'exception `dice3d.mjs` du garde 7 : nommée,
 *  argumentée, et VÉRIFIÉE RÉELLE par un témoin (si la règle disparaissait,
 *  l'exception devrait disparaître avec elle). */
const DISPLAY_NONE_EXCEPTION = /\.porte-de\s+\.fh-cd-static-die-result\s*\{[^}]*\}/g;

function displayNoneViolations(cssText) {
  const text = stripComments(cssText).replace(DISPLAY_NONE_EXCEPTION, "");
  return [...text.matchAll(/display\s*:\s*none/g)].map((m) => m[0]);
}

/** Chaque règle qui HABILLE un `<button>` sans lui poser son encre — le
 *  défaut n°4, mesuré sur la page DÉPLOYÉE le 2026-08-13.
 *
 *  ⚠️ POURQUOI CETTE CLAUSE EST ÉTROITE, ET DOIT LE RESTER. La loi générale
 *  « tout fond s'accompagne d'une encre » serait FAUSSE ici : mesuré, 13 des
 *  145 blocs de shell.css posent un fond sans encre, et ils ont raison —
 *  `.decision-card`, `.plan`, `.record-info` héritent `var(--text)` du
 *  `body`, ce qui est exactement le comportement voulu.
 *
 *  ⭐ Ce qui rend le bouton DIFFÉRENT, et c'est tout le fond de l'affaire :
 *  un `<button>` N'HÉRITE PAS de `color`. L'agent utilisateur lui impose
 *  `buttontext` — du noir. Un bouton habillé d'un fond sombre sans encre
 *  déclarée rend donc du noir sur du sombre, quoi qu'en dise le `body`.
 *
 *  📌 Et c'est la forme d'erreur que les cinq autres clauses ne peuvent PAS
 *  voir : elles cherchent une valeur INTERDITE, celle-ci cherche une
 *  déclaration MANQUANTE. Le correctif du défaut n°1 (le `#fff` en dur du
 *  bouton Continue) est passé sous les cinq clauses en laissant le bouton
 *  secondaire sans aucune couleur — il avait mesuré le bouton PRINCIPAL,
 *  pas la paire. Mesure de l'écart : `Back` et `Show plan` à **1,24:1**,
 *  invisibles, avec 765 tests verts.
 *
 *  ⭐ L'ANGLE MORT EST FERMÉ AU LOT 58, ET C'EST CE LOT QUI L'AVAIT ÉLARGI.
 *  L'ancienne clause lisait le TEXTE du sélecteur (`\bbutton\b`) : un
 *  `<button>` habillé par sa SEULE CLASSE lui échappait. Sa propre note le
 *  disait, et citait `.belt-item` comme le cas connu-mais-sans-danger. Le
 *  lot 58 a déplacé la paire de boutons du défaut d'origine (`Back` +
 *  `Show plan`) vers `.command-plan, .command-validate` — deux classes, zéro
 *  « button » dans le sélecteur : L'ATTAQUE 6 EST DEVENUE VERTE À TORT,
 *  mesuré en la rejouant. Un garde qu'un renommage désarme n'est pas un
 *  garde.
 *
 *  LE SECOND CRITÈRE, ET POURQUOI C'EST CELUI-LÀ : `cursor: pointer`. C'est
 *  le marqueur que ce dépôt pose sur TOUT ce qui se clique, sans exception
 *  mesurée — et il ne se pose jamais sur une carte inerte. Il n'y a donc
 *  aucun moyen d'habiller un contrôle sans passer sous l'un des deux
 *  critères.
 *
 *  MESURÉ AVANT DE DURCIR (comme l'exige `tests/source-scan.mjs`) : ZÉRO
 *  violation nouvelle sur le `shell.css` de ce lot — les 13 blocs qui posent
 *  un fond sans encre (`.decision-card`, `.plan`, `.fiche-aside`…) n'ont
 *  aucun `cursor: pointer`, et ils ont raison : ils HÉRITENT `var(--text)`
 *  du `body`, ce qu'un `<button>` ne fait pas.
 *
 *  ⚠️ CE QU'IL NE VOIT TOUJOURS PAS : un contrôle sans `cursor: pointer` ET
 *  sans « button » au sélecteur. Dit plutôt que masqué.
 *
 *  ── L'EXCEPTION DU PSEUDO-ÉLÉMENT (2026-08-26), ET SA RAISON ────────────
 *  ⛔ UN `::before` N'EST PAS UN CONTRÔLE, et le défaut n°4 ne peut pas
 *  l'atteindre : le noir imposé par l'agent utilisateur frappe le `<button>`
 *  lui-même. Un pseudo-élément à `content: ""` ne porte AUCUN texte, et il
 *  hérite de toute façon la `color` de son hôte — lui réclamer une encre,
 *  c'est réclamer une encre pour un rectangle sans lettre.
 *  ⭐ CE QUI L'A RENDUE NÉCESSAIRE : depuis le 26/08, le CORPS du bouton
 *  (fond + biseau + coupe) vit dans un `::before`, parce qu'un `clip-path`
 *  s'applique après un `filter` et rognerait l'ombre portée s'ils étaient sur
 *  le même élément. L'encre, elle, n'a pas bougé : elle est sur la règle du
 *  bouton, juste au-dessus, dans le même bloc de `shell.css`.
 *  🔴 PORTÉE ÉTROITE, ET C'EST CE QUI LA REND SÛRE : le sélecteur doit être
 *  fait ENTIÈREMENT de branches de pseudo-élément. Une seule branche qui
 *  habille un vrai bouton — `.a::before, .b button` — et la règle repasse
 *  sous le garde. L'ATTAQUE 6 bis le mesure. */
const TOUT_EN_PSEUDO = (selector) =>
  selector.split(",").every((branche) => /::(before|after)\b/.test(branche));

function buttonInkViolations(cssText) {
  const text = stripComments(cssText);
  const hits = [];
  for (const [, selector, body] of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (TOUT_EN_PSEUDO(selector)) continue;
    const looksLikeControl = /\bbutton\b/.test(selector) || /(^|[;\s])cursor\s*:\s*pointer/.test(body);
    if (!looksLikeControl) continue;
    const setsBackground = /(^|[;\s])background(-color)?\s*:/.test(body);
    const setsColor = /(^|[;\s])color\s*:/.test(body);
    if (setsBackground && !setsColor) hits.push(selector.trim().replace(/\s+/g, " "));
  }
  return hits;
}

/* ══ 1-4 — LE GARDE, SUR LE VRAI shell.css ═══════════════════════════ */

test("garde 1 — aucun font-size littéral dans shell.css", () => {
  assert.deepEqual(fontSizeViolations(shellCssRaw), []);
});

test("garde 2 — aucun padding/margin/gap/border-radius littéral dans shell.css", () => {
  assert.deepEqual(spacingRadiusViolations(shellCssRaw), []);
});

test("garde 3 — aucune couleur littérale dans shell.css", () => {
  assert.deepEqual(colorViolations(shellCssRaw), []);
});

test("garde 4 — aucun display:none dans shell.css (défaut n°3)", () => {
  assert.deepEqual(displayNoneViolations(shellCssRaw), []);
});

test("garde 4 bis — ⚔️ l'exception du chiffre de dé est RÉELLE, et elle est la SEULE", () => {
  /* Une exception qui ne correspond à rien est une porte ouverte : elle
     laisserait passer le jour où quelqu'un l'élargit, sans que personne ne
     remarque qu'elle ne protégeait plus rien. */
  const trouvees = stripComments(shellCssRaw).match(DISPLAY_NONE_EXCEPTION) || [];
  assert.equal(trouvees.length, 1, "l'exception vise une règle qui existe VRAIMENT — une seule");
  assert.match(trouvees[0], /display\s*:\s*none/, "et cette règle porte bien le `display: none` qu'on exempte");
  /* ⚔️ ET ELLE NE COUVRE QUE CELLE-LÀ : un second `display: none` glissé
     ailleurs dans le fichier rougit, exception en place. */
  const mute = `${shellCssRaw}\n.belt-label { display: none; }\n`;
  assert.deepEqual(displayNoneViolations(mute), ["display: none"],
    "le garde voit le défaut n°3 partout ailleurs — l'exception n'a pas désarmé la clause");
});

/* ══ GARDE 12 — LES ACCOLADES, COMPTÉES AVEC UNE PILE ════════════════════
   🔴 CE GARDE A UNE FACTURE, ET ELLE EST LOURDE. `shell.css` a porté un
   `@media (prefers-reduced-motion: reduce)` OUVERT LIGNE 891 ET JAMAIS
   REFERMÉ : les **205 sélecteurs** écrits en dessous ne s'appliquaient
   qu'aux visiteurs ayant désactivé les animations. La feuille servie rendait
   111 règles au lieu de 318, pendant des jours, sous une suite verte —
   parce que du CSS invalide SE TAIT. Trouvé seulement quand des règles
   neuves, écrites en fin de fichier, n'ont rien rendu du tout.

   ⚠️ ET IL FAUT UNE PILE, PAS UN COMPTEUR. Un compteur `{` contre `}`
   tombe juste dès qu'une fermante ORPHELINE existe ailleurs : elle
   compense celle qui manque, le total s'équilibre, et le fichier reste
   cassé. La pile, elle, dit LAQUELLE n'est pas refermée.
   📌 Ce n'est pas un analyseur CSS : il ne juge ni les propriétés ni les
   valeurs. Il tient l'unique défaut qui a réellement coûté. */
function accoladesDesequilibrees(cssText) {
  const sans = stripComments(cssText);
  const pile = [];
  let ligne = 1;
  for (const c of sans) {
    if (c === "\n") ligne += 1;
    else if (c === "{") pile.push(ligne);
    else if (c === "}") {
      if (pile.length === 0) return `fermante orpheline (ligne ${ligne}, commentaires ôtés)`;
      pile.pop();
    }
  }
  return pile.length === 0 ? null : `ouvrante jamais refermée (ligne ${pile[0]}, commentaires ôtés)`;
}

test("garde 12 — chaque feuille de ui/builder/ est équilibrée (205 sélecteurs perdus une fois)", () => {
  const fautes = [];
  for (const nom of fs.readdirSync(UI_DIR).filter((n) => n.endsWith(".css")).sort()) {
    const faute = accoladesDesequilibrees(fs.readFileSync(path.join(UI_DIR, nom), "utf8"));
    if (faute) fautes.push(`${nom} : ${faute}`);
  }
  assert.deepEqual(fautes, [], "du CSS invalide se tait — c'est ce silence que ce garde brise");
});

test("⚔️ ATTAQUE — le garde 12 voit les DEUX formes, et une fermante en trop ne masque plus rien", () => {
  assert.equal(accoladesDesequilibrees(".a { color: red;\n.b { color: blue; }"),
    "ouvrante jamais refermée (ligne 1, commentaires ôtés)");
  assert.equal(accoladesDesequilibrees(".a { color: red; }\n}"),
    "fermante orpheline (ligne 2, commentaires ôtés)");
  /* ⭐ LE CAS QUI A COÛTÉ : une ouvrante manquante ET une fermante en trop.
     Un compteur rend 0 et laisse passer ; la pile voit l'orpheline. */
  assert.notEqual(accoladesDesequilibrees("@media (x) {\n.a { color: red; }\n}\n}"), null,
    "le total s'équilibre, la structure non — c'est exactement le défaut du 16/08");
  assert.equal(accoladesDesequilibrees(".a { color: /* } */ red; }"), null,
    "et une accolade DANS un commentaire ne compte pas : le garde dépouille d'abord");
});

/* ══ GARDE 7 — LE DÉCOR NE REVIENT PAS EN LIGNE ═════════════════════════
   Jusqu'au 2026-08-15, ce qui interdisait un `element.style.…` dans `ui/`
   n'était pas un garde : c'était le stub de test, qui n'avait pas de
   `.style` et jetait. Un interdit par accident.

   ⛔ CE N'EST PAS UN GARDE, C'EST UN EFFET DE BORD. Il a mordu au bon moment
   (un `style.setProperty` posé au rendu du plateau faisait tomber une
   douzaine de tests, pour un écart de 4 px), mais il a AUSSI légiféré à
   tort : `dice3d.mjs` donne à chaque dé sa taille par `.style`, ce qui est
   une valeur CALCULÉE et parfaitement légitime — et le plateau en a déduit
   une fausse règle (« les dés ne naissent que d'un geste »). Le stub a donc
   reçu un `.style` honnête, et l'interdit devient explicite ici.

   MESURÉ AVANT DE DURCIR (comme l'exige `tests/source-scan.mjs`) :
   `dice3d.mjs` est le SEUL fichier de `ui/` qui écrive `.style` — 9
   occurrences. Tous les autres modules sont vierges. Ce garde part donc de
   ZÉRO violation, et il nomme sa seule exception.

   ⭐ POURQUOI `dice3d.mjs` EST EXEMPTÉ, et pourquoi ça ne s'étend pas : ce
   fichier est une COPIE VERBATIM de `fh-phb` (`docs/javascripts/fh-static-dice.js`).
   On n'y ajoute rien ; un défaut s'y corrige EN AMONT, puis on recopie. Lui
   imposer nos règles de feuille de style reviendrait à le forker. */
/* ══ ⭐ LA SECONDE EXCEPTION, ET ELLE ÉTAIT ANNONCÉE ══════════════════════
   `abilities-step.mjs : .style.transform` — la position du FANTÔME, le dé qui
   suit le doigt pendant un glisser (Eric, 2026-08-16 : *« je veux voir
   l'image du dé qui se déplace »*).

   🔴 UNE POSITION QUI SUIT UN DOIGT NE PEUT PAS VIVRE DANS UNE FEUILLE. Elle
   change à chaque image de l'animation, sur une valeur que seul l'événement
   pointeur connaît. Il n'existe aucune forme de CSS qui l'exprime — et
   `setProperty("--x", …)` n'est pas une porte dérobée : le garde le refuse
   aussi, à dessein.

   ⭐ ET CE N'EST PAS UNE ENTORSE IMPROVISÉE : `glisser.mjs` l'a écrite noir
   sur blanc en refusant le fantôme au lot 79 — *« si Eric juge le geste trop
   sec à l'usage, le fantôme se rediscutera avec une exception ARGUMENTÉE au
   garde, pas en le contournant »*. Eric l'a jugé. Voici l'exception.

   ⛔ ELLE EST BORNÉE À UNE FORME, PAS À UN FICHIER, et la différence compte :
   `dice3d.mjs` est exempté EN ENTIER parce qu'il est une copie verbatim qu'on
   ne modifie pas. `abilities-step.mjs`, lui, est du code à nous — n'y passe
   que `.style.transform`. Une taille, une couleur ou un corps posés en ligne
   y rougissent toujours, et c'est bien ce que le garde protège : le fantôme
   ne porte AUCUN décor en ligne (son ombre et son agrandissement vivent dans
   `shell.css`), rien qu'une paire de coordonnées. */
const STYLE_EN_LIGNE_EXCEPTIONS = [
  { fichier: "dice3d.mjs", forme: null },                        // copie verbatim : exempté en entier
  { fichier: "abilities-step.mjs", forme: ".style.transform" },  // le fantôme, et lui seul
  /* ⚠️ ÉLARGI LE 2026-08-19, PAS RELÂCHÉ : le glisser-déposer généralisé a son
     fantôme lui aussi (Eric : « il faut un fantôme identique à l'objet »), et
     il écrit LA MÊME forme unique. Un décor qui se déplace à chaque image ne
     peut PAS vivre dans une feuille de style : sa position change par image,
     et une règle CSS ne se réécrit pas soixante fois par seconde. C'est la
     seule raison qui vaut, et elle est la même que pour le fantôme des dés. */
  { fichier: "glisser.mjs", forme: ".style.transform" },
  /* ⚠️ ÉLARGI LE 2026-08-30, ET C'EST LA MÊME RAISON QUE LES DEUX AU-DESSUS :
     une valeur CALCULÉE ne peut pas vivre dans une feuille. `echelle.mjs`
     pose `--echelle` sur `<html>` — un cran choisi par le joueur, ou déduit
     de la largeur de fenêtre. Aucune règle CSS ne peut porter ça : le
     nombre n'existe qu'à l'exécution.
     ⛔ ET CE N'EST PAS DE L'HABILLAGE, ce que ce garde poursuit. Le décor
     reste entier dans `shell.css` (`zoom: var(--echelle)` sur `.app`, une
     déclaration) ; le JS ne pose qu'un scalaire sans unité. La forme est
     UNIQUE et vérifiée par l'attaque ci-dessous — une taille ou une couleur
     posée en ligne rougirait toujours. */
  { fichier: "echelle.mjs", forme: ".style.setProperty" }
];

function inlineStyleViolations() {
  const hits = [];
  for (const nom of fs.readdirSync(UI_DIR)) {
    if (!nom.endsWith(".mjs")) continue;
    const exception = STYLE_EN_LIGNE_EXCEPTIONS.find((e) => e.fichier === nom);
    if (exception && exception.forme === null) continue;
    const texte = stripComments(fs.readFileSync(path.join(UI_DIR, nom), "utf8"));
    for (const [ligne] of texte.matchAll(/\.style\s*(\.\w+|\[)/g)) {
      if (exception && ligne.trim() === exception.forme) continue;
      hits.push(`${nom} : ${ligne.trim()}`);
    }
  }
  return hits;
}

test("garde 7 — aucun style EN LIGNE dans ui/, sauf le moteur de dés recopié", () => {
  assert.deepEqual(inlineStyleViolations(), [],
    "le décor va dans la feuille : un style en ligne échappe aux jetons, aux voiles et aux thèmes");
});

test("⚔️ ATTAQUE — le garde 7 mord vraiment (il ne passe pas parce qu'il ne lit rien)", () => {
  /* Un garde qui rend toujours `[]` est un garde creux — ce dépôt en a déjà
     payé deux. On lui donne à manger la seule chose qu'il doit refuser. */
  const faux = stripComments('function f(n) { n.style.setProperty("--x", "1px"); }');
  assert.equal(/\.style\s*(\.\w+|\[)/.test(faux), true, "la forme cherchée est bien celle qu'on interdit");
  const moteur = fs.readFileSync(path.join(UI_DIR, "dice3d.mjs"), "utf8");
  assert.equal(/\.style\s*(\.\w+|\[)/.test(moteur), true,
    "et l'exception est RÉELLE : le moteur recopié écrit bien `.style` — s'il cessait, il faudrait retirer l'exception");
  /* ⚔️ LA SECONDE EXCEPTION EST RÉELLE AUSSI, ET ELLE EST ÉTROITE : le
     fantôme écrit `.style.transform`, et rien d'autre n'y passe. */
  const ecran = stripComments(fs.readFileSync(path.join(UI_DIR, "abilities-step.mjs"), "utf8"));
  const formes = [...ecran.matchAll(/\.style\s*(\.\w+|\[)/g)].map(([forme]) => forme.trim());
  assert.ok(formes.length > 0, "le fantôme écrit bien un style en ligne — sinon l'exception ne protège rien");
  assert.deepEqual([...new Set(formes)], [".style.transform"],
    "et SEULEMENT `.style.transform` : une taille ou une couleur posée en ligne doit rougir, exception en place");
  /* ⚔️ LA TROISIÈME EXCEPTION EST RÉELLE AUSSI, ET PLUS ÉTROITE ENCORE :
     `echelle.mjs` n'écrit QUE `--echelle`, et rien d'autre ne passe par là. */
  const ech = stripComments(fs.readFileSync(path.join(UI_DIR, "echelle.mjs"), "utf8"));
  const formesEch = [...ech.matchAll(/\.style\s*(\.\w+|\[)/g)].map(([f]) => f.trim());
  assert.ok(formesEch.length > 0, "l'échelle écrit bien un style en ligne — sinon l'exception ne protège rien");
  assert.deepEqual([...new Set(formesEch)], [".style.setProperty"],
    "et SEULEMENT `setProperty` : un `.style.width` posé là rougirait");
  assert.equal((ech.match(/setProperty\(/g) || []).length, 1,
    "un SEUL appel : c'est `--echelle`, et le garde du seuil ci-dessous vérifie qu'il n'y en a pas d'autre");
});

test("garde 6 — aucune règle n'habille un bouton sans lui poser son encre (défaut n°4)", () => {
  assert.deepEqual(buttonInkViolations(shellCssRaw), [],
    "un <button> n'hérite pas de `color` : sans encre déclarée, l'agent utilisateur lui impose du noir");
});

test("garde 5 — les DEUX seuils de grandeur n'existent qu'une fois, et dans echelle.mjs", () => {
  /* ⚠️ RÉÉCRIT LE 2026-08-30 — L'INTENTION EST INCHANGÉE, L'ADRESSE A BOUGÉ.
     Le lot 38 exigeait que « 720 » n'existe qu'une fois, et il vivait dans le
     `@media (max-width: 720px)` de `shell.css` : un `@media` ne sait pas lire
     une custom property, donc le nombre devait bien être écrit quelque part.

     🔴 CE QUI A CHANGÉ : il n'y a plus de `@media` de largeur du tout. Sous
     `zoom`, une requête média NE SE RÉÉVALUE PAS — mesuré au banc sur le vrai
     builder : à 1024 au cran 1,5 (fenêtre effective 683 blg, sous le seuil)
     le drapeau annonçait toujours « wide » ; à 1920 au cran 5, `min-width:
     1140px` matchait encore et `--rail-w` rendait 600 pixels réels. Les deux
     seuils vivent donc là où l'on connaît l'échelle : `echelle.mjs`.

     ⭐ LA LOI EST LA MÊME — un nombre, un endroit — et elle couvre maintenant
     les DEUX seuils au lieu d'un. */
  const files = [
    ...walkSources(UI_DIR),
    path.join(UI_DIR, "shell.css"),
    path.join(UI_DIR, "tokens.css"),
    path.join(UI_DIR, "index.html")
  ];
  for (const [seuil, motif] of [["720", /\b720(?!\d)/g], ["1140", /\b1140(?!\d)/g]]) {
    let count = 0;
    const where = [];
    for (const file of files) {
      const text = stripComments(fs.readFileSync(file, "utf8"));
      const matches = text.match(motif) || [];
      count += matches.length;
      if (matches.length > 0) where.push(`${path.relative(ROOT, file)} (${matches.length})`);
    }
    assert.equal(count, 1, `« ${seuil} » doit exister UNE fois — trouvé : ${where.join(", ") || "nulle part"}`);
    assert.deepEqual(where, ["ui/builder/echelle.mjs (1)"],
      `et c'est ${seuil === "720" ? "le seuil étroit" : "le seuil large"} d'echelle.mjs qui le porte`);
  }
});

test("garde 5 bis — 🔴 AUCUNE requête média de LARGEUR dans ui/builder/", () => {
  /* ⛔ LE PIÈGE QUE CE LOT A DÉCOUVERT, ET LE SEUL GARDE QUI L'ATTRAPE.
     `zoom` ne réévalue pas les `@media` : une requête de largeur écrite dans
     ces feuilles serait donc JUSTE au cran 1 et FAUSSE à tous les autres,
     silencieusement — la pire forme de défaut, celle qui passe la relecture.
     Les requêtes de PRÉFÉRENCE (`prefers-color-scheme`, `prefers-reduced-
     motion`) et d'ORIENTATION restent permises : ni le thème ni l'orientation
     ne dépendent de l'échelle. */
  const hits = [];
  for (const nom of fs.readdirSync(UI_DIR)) {
    /* ⚠️ LES `.mjs` AUSSI, DEPUIS LE 30/08 AU SOIR — et c'est un trou qui a
       coûté un défaut réel. Ce garde ne balayait que les feuilles ; un
       `matchMedia("(min-width: 768px)")` survivait donc tranquillement dans
       `abilities-tray.mjs`, où il choisissait une COTE de dé (72 ou 82) — le
       jumeau EXACT du `@media` supprimé le matin même dans `shell.css`, pour
       la raison exacte d'Eric. Une requête de largeur en JS est PIRE que son
       équivalent CSS sous zoom : `matchMedia` interroge la fenêtre BRUTE, donc
       elle ment à tous les crans au lieu de simplement ne pas se réévaluer. */
    if (!nom.endsWith(".css") && !nom.endsWith(".mjs")) continue;
    const texte = stripComments(fs.readFileSync(path.join(UI_DIR, nom), "utf8"));
    const motifs = nom.endsWith(".css")
      ? [/@media[^{]*\{/g]
      : [/matchMedia\s*\(\s*[`"'][^`"']*[`"']/g, /@media[^"'`]*/g];
    for (const motif of motifs) {
      for (const [regle] of texte.matchAll(motif)) {
        if (/\b(min|max)-(width|height)\b|\bwidth\s*[<>=]/.test(regle)) hits.push(`${nom} : ${regle.trim().slice(0, 70)}`);
      }
    }
  }
  assert.deepEqual(hits, [],
    "une requête de largeur ne se réévalue pas sous zoom (CSS) et lit la fenêtre brute (matchMedia) — la grandeur passe par `data-grandeur`");
});

test("garde 5 ter — 🔴 aucune unité de VIEWPORT non divisée par l'échelle", () => {
  /* ⛔ LE SECOND PIÈGE DE `zoom`, ET IL A ÉCHAPPÉ À LA PREMIÈRE PASSE DU LOT.
     `zoom` ne rebase PAS `vw`/`vh` : une valeur en unités de viewport est
     calculée sur la fenêtre BRUTE, puis peinte × le cran. Mesuré à 1440 × 900 :
     `.ceremonie-flip` (`min(64vw, 74vh)`) rendait **1998 px de large dans une
     fenêtre de 1440** au cran 3, et `max-height: 42vh` demandait 1134 px de
     haut dans 900. La cérémonie de Destiny sortait de l'écran dès le cran 2.

     ⭐ LA RÈGLE : dans le sous-arbre zoomé, toute unité de viewport se DIVISE
     par l'échelle. Elle vaut alors la même fraction de la fenêtre réelle à
     tous les crans — ce qui est toujours l'intention quand on écrit `vh`.
     ⚠️ `dvh` sur `html, body` est EXEMPTÉ, et c'est le seul : ces deux-là
     vivent HORS du zoom (il est posé sur `.app`), donc leur `100dvh` vaut déjà
     la vraie fenêtre. C'est même lui qui donne sa taille au reste. */
  const hits = [];
  for (const nom of fs.readdirSync(UI_DIR)) {
    if (!nom.endsWith(".css")) continue;
    const texte = stripComments(fs.readFileSync(path.join(UI_DIR, nom), "utf8"));
    for (const m of texte.matchAll(/([-a-zA-Z]+)\s*:\s*([^;{}]*\d\s*v[hw]\b[^;{}]*)/g)) {
      const [, prop, valeur] = m;
      if (/\bdv[hw]\b/.test(valeur)) continue;
      if (valeur.includes("/ var(--echelle)")) continue;
      hits.push(`${nom} — ${prop}: ${valeur.trim()}`);
    }
  }
  assert.deepEqual(hits, [],
    "zoom ne rebase pas vw/vh : sans division, la valeur est calculée sur la fenêtre brute puis peinte × le cran");
});

test("garde 5 quater — 🔴 tout `getBoundingClientRect` est ramené en unités de mise en page", () => {
  /* ⛔ LE TROISIÈME PIÈGE DE `zoom`, ET LE PLUS SILENCIEUX DES TROIS. Les
     lectures géométriques se séparent en deux familles qui ne s'accordent plus
     — mesuré sur un bloc de 200 blg dans `.app` :

         cran               1     2     3
         offsetWidth       200   200   200    ← la MISE EN PAGE, en blg
         clientWidth       200   200   200    ← idem
         computed width    200   200   200    ← idem
         rect.width        200   400   600    ← ce qui est PEINT

     🔴 DEUX ENDROITS LES MÉLANGEAIENT, et aucun ne se voyait au cran 1 :
     `keepInView` ajoutait un écart de rectangle à `scrollTop` (qui est en
     blg) — mesuré sur le rail de Species à 480×640, viser le 7ᵉ cran sur 12
     posait `scrollTop` à **352 au lieu de 117** au cran 3, trois fois trop
     loin ; et la roue d'Equipment lisait la largeur d'un cran en blg et le
     champ de sa piste en pixels peints.

     ⭐ LA RÈGLE : un rectangle qui va servir à un calcul de MISE EN PAGE se
     divise par `facteurZoom(nœud)`. Un rectangle lu pour lui-même — la taille
     à donner à un canvas, par exemple — n'a rien à convertir. */
  const EXCEPTIONS = [
    /* Le moteur 3D recopié : il dimensionne le TAMPON d'un canvas, et pour ça
       c'est bien la taille PEINTE qu'il faut — plus de pixels d'appareil, un
       dé plus net. Rien n'y est mêlé à une lecture de mise en page. */
    "dice3d.mjs",
    /* Le convertisseur lui-même : c'est lui qui compare les deux familles. */
    "echelle.mjs"
  ];
  const hits = [];
  for (const nom of fs.readdirSync(UI_DIR)) {
    if (!nom.endsWith(".mjs") || EXCEPTIONS.includes(nom)) continue;
    const texte = stripComments(fs.readFileSync(path.join(UI_DIR, nom), "utf8"));
    for (const m of texte.matchAll(/([\w.]*)\.getBoundingClientRect\(\)([^;\n]*)/g)) {
      const ligne = m[0];
      /* Une lecture est SAINE si elle est divisée sur place, ou si le fichier
         ne s'en sert que pour comparer deux rectangles entre eux — auquel cas
         il importe `facteurZoom` et l'applique à l'écart. */
      if (/facteurZoom/.test(texte)) continue;
      hits.push(`${nom} : ${ligne.trim().slice(0, 60)}`);
    }
  }
  assert.deepEqual(hits, [],
    "un rectangle est en pixels PEINTS : mêlé à offsetLeft/clientWidth/scrollTop, il est faux × le cran");
});

test("⚔️ ATTAQUE — le garde 5 ter mord, et il laisse passer ce qu'il doit", () => {
  const voit = (css) => {
    const t = stripComments(css);
    const out = [];
    for (const m of t.matchAll(/([-a-zA-Z]+)\s*:\s*([^;{}]*\d\s*v[hw]\b[^;{}]*)/g)) {
      if (/\bdv[hw]\b/.test(m[2])) continue;
      if (m[2].includes("/ var(--echelle)")) continue;
      out.push(m[0]);
    }
    return out.length;
  };
  assert.equal(voit(".a { max-height: 42vh; }"), 1, "une hauteur de viewport nue est vue");
  assert.equal(voit(".a { --dx: -46vw; }"), 1, "un jeton de trajectoire aussi");
  assert.equal(voit(".a { width: min(64vw, 74vh); }"), 1, "et même caché dans un min()");
  assert.equal(voit(".a { max-height: calc(42vh / var(--echelle)); }"), 0, "divisée, elle passe");
  assert.equal(voit("html, body { height: 100dvh; }"), 0, "et `dvh` hors zoom reste permis");
});

test("⚔️ ATTAQUE — le garde 5 bis mord (il ne passe pas parce qu'il ne lit rien)", () => {
  const voit = (css) => {
    const t = stripComments(css);
    return [...t.matchAll(/@media[^{]*\{/g)]
      .filter(([r]) => /\b(min|max)-(width|height)\b|\bwidth\s*[<>=]/.test(r)).length;
  };
  assert.equal(voit("@media (max-width: 720px) { .a { color: red } }"), 1, "il voit une largeur");
  assert.equal(voit("@media (min-width: 40em) { .a { color: red } }"), 1, "en em aussi");
  assert.equal(voit("@media (prefers-color-scheme: dark) { .a { color: red } }"), 0, "et il laisse passer le thème");
  assert.equal(voit("@media (orientation: landscape) { .a { color: red } }"), 0, "et l'orientation");
  /* ⚔️ ET LA FORME JS, celle qui avait échappé au garde jusqu'au 30/08. */
  const voitJs = (js) => {
    const t = stripComments(js);
    return [...t.matchAll(/matchMedia\s*\(\s*[`"'][^`"']*[`"']/g)]
      .filter(([r]) => /\b(min|max)-(width|height)\b/.test(r)).length;
  };
  assert.equal(voitJs('window.matchMedia("(min-width: 768px)").matches'), 1,
    "un seuil de largeur en matchMedia est vu");
  assert.equal(voitJs("window.matchMedia(`(min-width: ${SEUIL}px)`).matches"), 1,
    "y compris interpolé — c'est la forme exacte qui avait survécu");
  assert.equal(voitJs('window.matchMedia("(prefers-reduced-motion: reduce)").matches'), 0,
    "et une requête de préférence passe : elle ne dépend pas de l'échelle");
});


/* ══ ⚔️ LES CINQ ATTAQUES — un garde jamais attaqué n'est pas un garde ═══

   Chaque attaque prend le VRAI texte de shell.css, y réintroduit EN
   MÉMOIRE le défaut nommé par la commande, et vérifie que LA CLAUSE VISÉE
   ROUGIT — SEULE. Rien n'est écrit sur le disque : la « restauration » est
   automatique, puisque `shellCssRaw` n'est jamais réassigné. */

test("⚔️ ATTAQUE 1 — remettre #fff sur le bouton principal fait rougir SEULEMENT le garde couleur", () => {
  /* ⚠️ CIBLE REPORTÉE AU LOT 58, comme celle de l'ATTAQUE 2 avant elle : la
     règle d'origine (`.stage-nav button:last-child`, le bouton `Continue`)
     N'EXISTE PLUS — `Continue` est devenu l'unique `Validate` de la ligne de
     commande (invariant I.3), lequel a disparu à son tour le 2026-08-16 au
     profit de `DONE` (lot 80, §5.1). `.stage-nav` est parti avec son
     balisage (loi §0.6).
     ⭐ CE QUE L'ATTAQUE PROUVE NE CHANGE PAS D'UN IOTA : le bouton PRINCIPAL
     du builder, celui qui porte l'accent, ne doit pas écrire son encre en
     dur — `#fff` échouait 2,44:1 en thème sombre (défaut n°1, mesuré le
     2026-08-13). C'est la même loi, sur le bouton qui a hérité du rôle.
     ⚠️ CIBLE REPORTÉE UNE TROISIÈME FOIS, LE 2026-08-17 : `DONE` ne porte plus
     l'accent du tout — Eric : *« enlève toute couleur dans Back et Done »*. Le
     bouton à fond plein le plus proche est désormais l'option ACTIVE d'un
     choix de record (`.record-option`), et c'est la même paire accent/encre.
     📌 Une attaque qui perd sa cible ne se supprime pas : elle se REPORTE sur
     ce qui tient le rôle. Une attaque supprimée est une loi qu'on cesse de
     vérifier sans jamais l'avoir abrogée. */
  const before = colorViolations(shellCssRaw);
  assert.deepEqual(before, [], "le vrai fichier est propre avant l'attaque");

  const mutated = shellCssRaw.replace(
    '.record-option[data-active="true"] { background: var(--accent); color: var(--on-accent);',
    '.record-option[data-active="true"] { background: var(--accent); color: #fff;'
  );
  assert.notEqual(mutated, shellCssRaw, "la substitution a bien trouvé sa cible");

  assert.deepEqual(colorViolations(mutated), ["#fff"], "le garde couleur voit EXACTEMENT le défaut réintroduit");
  assert.deepEqual(fontSizeViolations(mutated), fontSizeViolations(shellCssRaw), "le garde de type ne bouge pas");
  assert.deepEqual(spacingRadiusViolations(mutated), spacingRadiusViolations(shellCssRaw), "ni celui d'espacement");
  assert.deepEqual(displayNoneViolations(mutated), displayNoneViolations(shellCssRaw), "ni celui de display:none");
});

test("⚔️ ATTAQUE 6 — retirer l'encre du bouton secondaire fait rougir SEULEMENT le garde du défaut n°4", () => {
  /* ⭐ L'attaque REJOUE le défaut réel, à l'octet : la règle telle qu'elle
     était sur la page déployée le 2026-08-13, avant le correctif. C'est la
     seule forme d'attaque qui prouve quelque chose ici — les cinq autres
     clauses étaient vertes SUR CE FICHIER-LÀ, et c'est bien le problème. */
  /* ⚠️ CIBLE REPORTÉE AU LOT 58 (même raison que l'ATTAQUE 1 ci-dessus) : la
     PAIRE de boutons du défaut d'origine était `Back` + `Show plan`. `Back`
     n'existe plus (invariant I.5, « la molette le remplace ») ; la paire
     d'aujourd'hui est la PAIRE de la sortie d'étape, `BACK` + `DONE` (lot 80,
     §5.1 : *« 1 validate dégage PARTOUT »*), habillée par une règle unique. ⭐ Le défaut rejoué est le MÊME À L'OCTET : un fond posé sans
     encre sur un `<button>`, qui rend alors du noir imposé par l'agent
     utilisateur — 1,24:1, invisible, avec 765 tests verts. */
  const before = buttonInkViolations(shellCssRaw);
  assert.deepEqual(before, [], "le vrai fichier est propre avant l'attaque");

  const mutated = shellCssRaw.replace(
    "  color: var(--text); /* un <button> n'hérite pas de `color` — défaut n°4 */\n",
    ""
  );
  assert.notEqual(mutated, shellCssRaw, "la substitution a bien trouvé sa cible");

  assert.deepEqual(buttonInkViolations(mutated), [".sortie-bouton"],
    "le garde voit EXACTEMENT la règle qui produirait les 1,24:1");
  assert.deepEqual(colorViolations(mutated), colorViolations(shellCssRaw), "le garde couleur ne bouge pas — le défaut est une ABSENCE, pas un littéral");
  assert.deepEqual(fontSizeViolations(mutated), fontSizeViolations(shellCssRaw), "ni le garde de type");
  assert.deepEqual(spacingRadiusViolations(mutated), spacingRadiusViolations(shellCssRaw), "ni celui d'espacement");
  assert.deepEqual(displayNoneViolations(mutated), displayNoneViolations(shellCssRaw), "ni celui de display:none");
});

test("⚔️ ATTAQUE 6 bis — l'exception du pseudo-élément ne couvre QUE des pseudo-éléments", () => {
  /* ⭐ Une exception qui ne dit jamais NON n'est pas une exception, c'est une
     porte. Celle-ci doit laisser passer le corps du bouton (2026-08-26) et
     arrêter tout le reste — on le lui fait dire dans les DEUX sens. */

  /* ① elle laisse passer ce pour quoi elle a été écrite */
  assert.deepEqual(
    buttonInkViolations('.parcours-pied button::before { background-color: var(--bouton-fond); }'),
    [], "un ::before qui peint le corps d'un bouton ne réclame pas d'encre");

  /* ② ⛔ une seule branche sans `::` et TOUT le sélecteur repasse au garde */
  const melange = '.a::before, .parcours-pied button { background-color: var(--bouton-fond); }';
  assert.deepEqual(buttonInkViolations(melange), [".a::before, .parcours-pied button"],
    "un sélecteur MIXTE habille un vrai bouton — l'exception ne doit pas l'abriter");

  /* ③ ⛔ et le défaut n°4 d'origine rougit toujours, à l'octet */
  assert.deepEqual(
    buttonInkViolations('.sortie-bouton { background: var(--surface); cursor: pointer; }'),
    [".sortie-bouton"], "le défaut du 2026-08-13 reste vu — l'exception n'a rien désarmé");
});

test("⚔️ ATTAQUE 2 — remettre font-size: 13px sur .skills-budget-note fait rougir SEULEMENT le garde de type", () => {
  /* La cible d'origine (`.skill-chip`, lot 33) n'existe plus : le lot 39 a
     réécrit l'étape Compétences et retiré les classes du lot 33 qu'elle ne
     consomme plus (loi §0.6 — pas de sélecteur mort). La cible est reportée
     sur une règle du lot 39 qui porte le même jeton `--t3`. */
  const mutated = shellCssRaw.replace(
    ".skills-budget-note { margin: 0 0 var(--sp-8); font-size: var(--t3); color: var(--text-muted); }",
    ".skills-budget-note { margin: 0 0 var(--sp-8); font-size: 13px; color: var(--text-muted); }"
  );
  assert.notEqual(mutated, shellCssRaw);

  assert.deepEqual(fontSizeViolations(mutated), ["13px"]);
  assert.deepEqual(colorViolations(mutated), colorViolations(shellCssRaw));
  assert.deepEqual(spacingRadiusViolations(mutated), spacingRadiusViolations(shellCssRaw));
  assert.deepEqual(displayNoneViolations(mutated), displayNoneViolations(shellCssRaw));
});

test("⚔️ ATTAQUE 2 bis — un multiple de barreau passe, une COTE déguisée en calcul non", () => {
  /* 🔴 CE QUE CETTE ATTAQUE PROTÈGE, ET POURQUOI ELLE NAÎT AVEC L'ASSOUPLISSEMENT
     DU 2026-08-17 : accepter `calc(var(--tN) * k)` ne doit PAS ouvrir la porte
     à un nombre de taille glissé dans un `calc`. Le facteur est un RAPPORT ;
     dès qu'une unité apparaît, c'est une cote, et la loi retombe.
     ⛔ Sans ce cas, l'élargissement du garde serait invérifiable — on saurait
     ce qu'il laisse passer, pas ce qu'il retient encore. */
  assert.deepEqual(fontSizeViolations("a { font-size: calc(var(--t5) * 1.5); }"), [],
    "un multiple écrit d'un barreau : c'est la forme que `fiche.css` emploie depuis le lot 69");
  assert.deepEqual(fontSizeViolations("a { font-size: calc(var(--t5) + 2px); }"), ["calc(var(--t5) + 2px)"],
    "⛔ une cote AJOUTÉE à un barreau reste une violation — 2px ne suit aucun barreau");
  assert.deepEqual(fontSizeViolations("a { font-size: calc(16px * 1.5); }"), ["calc(16px * 1.5)"],
    "⛔ et un calcul qui part d'une cote n'est pas un barreau du tout");
  assert.deepEqual(fontSizeViolations("a { font-size: 1.5rem; }"), ["1.5rem"],
    "⛔ ni une unité relative, qui échappe à l'échelle sans le dire");
});

test("⚔️ ATTAQUE 3 — remettre padding: 10px sur .belt-item fait rougir SEULEMENT le garde d'espacement", () => {
  const mutated = shellCssRaw.replace(
    "padding: var(--sp-8) var(--sp-12); /* 10px → même arrondi */",
    "padding: 10px;"
  );
  assert.notEqual(mutated, shellCssRaw);

  assert.deepEqual(spacingRadiusViolations(mutated), ["padding: 10px"]);
  assert.deepEqual(fontSizeViolations(mutated), fontSizeViolations(shellCssRaw));
  assert.deepEqual(colorViolations(mutated), colorViolations(shellCssRaw));
  assert.deepEqual(displayNoneViolations(mutated), displayNoneViolations(shellCssRaw));
});

test("⚔️ ATTAQUE 4 — remettre display:none sur .belt-label fait rougir SEULEMENT le garde du défaut n°3", () => {
  const mutated = `${shellCssRaw}\n.belt-label { display: none; }\n`;
  assert.notEqual(mutated, shellCssRaw);

  assert.deepEqual(displayNoneViolations(mutated), ["display: none"]);
  assert.deepEqual(fontSizeViolations(mutated), fontSizeViolations(shellCssRaw));
  assert.deepEqual(spacingRadiusViolations(mutated), spacingRadiusViolations(shellCssRaw));
  assert.deepEqual(colorViolations(mutated), colorViolations(shellCssRaw));
});

test("⚔️ ATTAQUE 5 — écrire 720 une seconde fois dans ui/builder/ fait rougir SEULEMENT le garde du seuil", () => {
  /* On simule le défaut d'origine (`shell.mjs:66`, `matchMedia(\"(max-width: 720px)\")`)
     en le réintroduisant dans une COPIE en mémoire du dossier — sans toucher
     au vrai `shell.mjs`, qui ne porte plus le nombre depuis ce lot. */
  const shellMjsPath = path.join(UI_DIR, "shell.mjs");
  const realShellMjs = fs.readFileSync(shellMjsPath, "utf8");
  const files = new Map([
    [SHELL_CSS_PATH, shellCssRaw],
    [shellMjsPath, `${realShellMjs}\n// matchMedia("(max-width: 720px)") — réintroduit pour l'attaque\n`.replace(
      "// matchMedia(\"(max-width: 720px)\") — réintroduit pour l'attaque",
      'const REGRESSION = window.matchMedia("(max-width: 720px)");'
    )]
  ]);

  let count = 0;
  for (const [, text] of files) count += (stripComments(text).match(/\b720(?!\d)/g) || []).length;
  const others = walkSources(UI_DIR).filter((f) => f !== shellMjsPath);
  for (const file of others) count += (stripComments(fs.readFileSync(file, "utf8")).match(/\b720(?!\d)/g) || []).length;
  count += (stripComments(tokensCssRaw).match(/\b720(?!\d)/g) || []).length;

  assert.equal(count, 2, "720 apparaît deux fois dans la copie mutée — shell.css ET le shell.mjs regressé");
  /* Et le VRAI shell.mjs sur disque n'a pas bougé : */
  assert.equal(fs.readFileSync(shellMjsPath, "utf8"), realShellMjs);
  /* Dépouillé, pas brut : le vrai fichier EXPLIQUE en commentaire pourquoi
     720 n'y est plus (prose légitime) — c'est le CODE qui ne doit plus le
     porter, exactement comme le garde 5 le mesure sur shell.css. */
  assert.doesNotMatch(stripComments(realShellMjs), /\b720(?!\d)/, "le vrai fichier ne porte plus jamais 720 en CODE");
});

/* ══ 6 — LES SEPT BARREAUX, DISTINCTS, JAMAIS À MOINS DE 12,5 % ═══════ */

/** Extrait les `--nom: valeur;` d'un bloc de texte donné (un seul niveau,
 *  pas de récursion — suffisant : `tokens.css` déclare tout à plat). */
function extractCustomProps(cssText) {
  const props = new Map();
  for (const match of cssText.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    props.set(match[1], match[2].trim());
  }
  return props;
}

/* ⚠️ CORRIGÉ AU LOT 69 — CE COMMENTAIRE ÉTAIT DEVENU FAUX, ET LE DÉCOUPAGE
   AVEC LUI. Il disait « `tokens.css` n'a qu'un seul `@media` » et prenait
   donc TOUT ce qui suit le bloc sombre comme étant le bloc sombre. Depuis
   que la grandeur Large existe (`@media (min-width: 1140px)`, posée APRÈS le
   bloc sombre pour que ces gardes continuent de mesurer la base), ce
   « tout ce qui suit » avalait aussi Large.

   Aujourd'hui c'est sans conséquence — un garde du lot 69 interdit à Large
   de porter la moindre couleur, et ces mesures-ci sont des couleurs. Mais le
   piège était armé : le jour où Large toucherait un jeton coloré, la matrice
   de contraste du thème sombre aurait mesuré une valeur qui n'est pas la
   sienne, **sans qu'un test bronche**. On coupe donc au `@media` SUIVANT,
   et non à la fin du fichier. */
const strippedTokens = stripComments(tokensCssRaw);
const darkIndex = strippedTokens.indexOf("@media (prefers-color-scheme: dark)");
assert.ok(darkIndex > 0, "tokens.css doit porter le bloc sombre — sinon les tests suivants mesurent du vide");
const apresSombre = strippedTokens.indexOf("@media", darkIndex + 1);
const finDuSombre = apresSombre === -1 ? strippedTokens.length : apresSombre;
const lightBlock = strippedTokens.slice(0, darkIndex);
const darkBlock = strippedTokens.slice(darkIndex, finDuSombre);
const lightTokens = extractCustomProps(lightBlock);
const darkTokens = extractCustomProps(darkBlock);

test("les sept barreaux T1..T7 existent, dans l'ordre, et aucun n'est à moins de 12,5% du suivant", () => {
  const rungs = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((name) => {
    const raw = lightTokens.get(name);
    assert.ok(raw, `--${name} doit exister dans tokens.css`);
    const px = Number(raw.replace("px", ""));
    assert.ok(Number.isFinite(px) && px > 0, `--${name} doit être une longueur positive (lu: "${raw}")`);
    return px;
  });
  assert.deepEqual(rungs, [...rungs].sort((a, b) => a - b), "les sept valeurs sont déjà croissantes dans le fichier");
  assert.equal(new Set(rungs).size, 7, "les sept valeurs sont DISTINCTES");
  for (let i = 1; i < rungs.length; i += 1) {
    const ratio = rungs[i] / rungs[i - 1];
    assert.ok(ratio >= 1.125,
      `T${i + 1} (${rungs[i]}px) est à moins de 12,5% de T${i} (${rungs[i - 1]}px) — ratio mesuré ${ratio.toFixed(4)}`);
  }
});

/* ══ 7 — --on-accent BASCULE ENTRE LES DEUX THÈMES ════════════════════ */

test("--on-accent bascule entre jour et nuit — jamais #fff en dur ailleurs", () => {
  const jour = lightTokens.get("on-accent");
  const nuit = darkTokens.get("on-accent");
  assert.ok(jour && nuit, "--on-accent doit exister dans les deux blocs");
  assert.notEqual(jour.toLowerCase(), nuit.toLowerCase(), "le jeton qui bascule doit vraiment basculer");
  assert.equal(jour.toLowerCase(), "#ffffff");
  assert.equal(nuit.toLowerCase(), "#14120e");
});

/* ══ 8 — LE CONTRASTE, CALCULÉ ICI — pas recopié d'un commentaire ════

   Formule WCAG 2.x standard (relative luminance → ratio). Elle mesure ce
   que `tokens.css` déclare RÉELLEMENT, pas ce que `PALETTE-FHV2.json`
   prétend : c'est ce test qui aurait attrapé la correction du 2026-08-13
   si elle n'avait pas eu lieu. */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}
function relativeLuminance([r, g, b]) {
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [rl, gl, bl] = [r, g, b].map(lin);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}
function contrastRatio(hexA, hexB) {
  const la = relativeLuminance(hexToRgb(hexA));
  const lb = relativeLuminance(hexToRgb(hexB));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* Mélange non-prémultiplié à `weight` (0..1) de `fg` sur `bg` — c'est
   exactement ce que rend `color-mix(in srgb, fg P%, transparent)` composé
   sur `bg`, prémultiplication comprise (alpha de `transparent` = 0, donc le
   canal RGB du mélange prémultiplié survit intact — voir INVENTAIRE-LOT-38.md). */
function mix(hexFg, hexBg, weight) {
  const [r1, g1, b1] = hexToRgb(hexFg);
  const [r2, g2, b2] = hexToRgb(hexBg);
  const blend = [r1, g1, b1].map((c, i) => c * weight + [r2, g2, b2][i] * (1 - weight));
  return `#${blend.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

/* Les 14 jetons de couleur du §3b — LUS DANS tokens.css, jamais recopiés
   à la main une seconde fois. `--bg` est le fond lui-même : hors périmètre
   (rien ne s'affiche "sur la dalle", §3b). */
const COLOR_TOKENS = [
  "surface", "sunken", "text", "text-soft", "text-muted",
  "border-strong", "border", "accent", "on-accent",
  "positive", "caution", "critical", "info"
];

test("les jetons de couleur EXISTENT tous deux fois (jour ET nuit), 14 avec --bg", () => {
  for (const name of ["bg", ...COLOR_TOKENS]) {
    assert.ok(lightTokens.has(name), `--${name} manque au bloc jour`);
    assert.ok(darkTokens.has(name), `--${name} manque au bloc nuit`);
  }
  assert.equal(new Set(["bg", ...COLOR_TOKENS]).size, 14, "14 jetons de couleur, pas 18 (§3b) — les 5 dés restent hors de ce lot");
});

/* ⭐ CE LOT AVAIT RAISON, ET LA CAUSE EST RÉPARÉE À LA SOURCE (revue de
   l'architecte, 2026-08-13). Le lot avait mesuré `--positive` (jour) à
   4,4986:1 sur `--sunken` — sous sa cible de 0,0014 — et avait abaissé SON
   seuil à 4,498 en écrivant le chiffre en clair, faute d'autorité sur la
   palette. C'était le bon geste : la mesure gagne, et elle se voit.

   LA CAUSE ÉTAIT UNE FAUTE DE L'ARCHITECTE, pas un artefact fatal : la
   boucle qui a recalculé la palette le 2026-08-13 comparait un contraste
   ARRONDI À DEUX DÉCIMALES à son seuil, donc 2,9959 passait pour 3,00.
   Remesuré en comparaison EXACTE, la faute portait sur QUATORZE valeurs des
   trois familles — le garde n'en voyait que deux, celles que le builder
   câble. `PALETTE-FHV2.json` est corrigé ; ce seuil redevient donc nominal.

   📌 La leçon, et elle est générale : ne compare jamais un arrondi à une
   limite. Arrondir est un geste d'AFFICHAGE. */

test("chaque encre sémantique tient 4,5:1 sur --sunken, dans les deux thèmes (§3b, le piège du lot)", () => {
  /* --border-strong EXCLU ICI : sa cible est 3:1, pas 4,5:1 (bordure de
     CONTRÔLE, §3b) — elle a son propre test juste après. La confondre avec
     les encres de texte ferait rougir ce test sur une cible qui n'est pas
     la sienne. */
  const semantics = COLOR_TOKENS.filter(
    (name) => !["surface", "sunken", "border", "border-strong", "on-accent"].includes(name)
  );
  for (const theme of ["jour", "nuit"]) {
    const tokens = theme === "jour" ? lightTokens : darkTokens;
    const sunken = tokens.get("sunken");
    for (const name of semantics) {
      const ratio = contrastRatio(tokens.get(name), sunken);
      assert.ok(ratio >= 4.5,
        `--${name} (${theme}) : ${ratio.toFixed(4)}:1 sur --sunken — sous 4,5:1`);
    }
  }
});

test("--border-strong tient 3:1 sur --sunken (bordure de CONTRÔLE, pas 4,5) — §3b", () => {
  /* ⭐ LE LOT AVAIT RAISON, ET LA CAUSE EST RÉPARÉE À LA SOURCE. Il avait
     mesuré #857e6e sur #e0ded7 à 2,9959…:1 — sous 3:1 — et accepté 2,99 en
     écrivant le chiffre en clair, faute d'autorité sur la palette ratifiée.
     C'était le bon geste. L'architecte a corrigé le hex du jour
     (#857e6e → #847d6e, 3,0350:1) : voir la note du test précédent pour la
     cause commune — un contraste ARRONDI comparé à une limite. Le seuil
     redevient nominal, sans exception. */
  const SEUIL_MESURE = 3;
  for (const theme of ["jour", "nuit"]) {
    const tokens = theme === "jour" ? lightTokens : darkTokens;
    const ratio = contrastRatio(tokens.get("border-strong"), tokens.get("sunken"));
    assert.ok(ratio >= SEUIL_MESURE,
      `--border-strong (${theme}) : ${ratio.toFixed(4)}:1 — sous ${SEUIL_MESURE}:1 (cible nominale 3:1)`);
  }
});

test("--on-accent tient son contraste sur --accent, dans les deux thèmes", () => {
  for (const theme of ["jour", "nuit"]) {
    const tokens = theme === "jour" ? lightTokens : darkTokens;
    const ratio = contrastRatio(tokens.get("on-accent"), tokens.get("accent"));
    assert.ok(ratio >= 4.5, `on-accent/accent (${theme}) : ${ratio.toFixed(2)}:1`);
  }
});

test("⭐ --text sur --accent-wash (posé sur --bg à 10%) tient 4,5:1 — la régression que ce lot répare", () => {
  /* `--accent-wash` est un `color-mix(...)`, une formule que Node ne sait
     pas évaluer : ce test rejoue la même arithmétique (mélange 10% accent /
     90% bg), voir la fonction `mix` ci-dessus et sa note sur la
     prémultiplication. Si `tokens.css` change le pourcentage, ce nombre
     doit être changé ICI À LA MAIN — sinon le test mesure un lavis qui n'est
     plus celui du fichier. Vérifié pour ce lot : `tokens.css` déclare 10%. */
  assert.match(tokensCssRaw, /color-mix\(in srgb, var\(--accent\) 10%, transparent\)/,
    "ce test suppose 10% — si tokens.css change ce chiffre, ce test doit changer avec lui");
  for (const theme of ["jour", "nuit"]) {
    const tokens = theme === "jour" ? lightTokens : darkTokens;
    const wash = mix(tokens.get("accent"), tokens.get("bg"), 0.10);
    const ratio = contrastRatio(tokens.get("text"), wash);
    assert.ok(ratio >= 4.5, `--text sur --accent-wash (${theme}) : ${ratio.toFixed(2)}:1 — sous la cible 4,5:1`);
  }
});

test("la rampe des paliers (--tier-1/2/3) tient 4,5:1 sur --sunken, dans les deux thèmes", () => {
  for (const theme of ["jour", "nuit"]) {
    const tokens = theme === "jour" ? lightTokens : darkTokens;
    const sunken = tokens.get("sunken");
    for (const tier of ["tier-1", "tier-2", "tier-3"]) {
      const ratio = contrastRatio(tokens.get(tier), sunken);
      assert.ok(ratio >= 4.5, `--${tier} (${theme}) : ${ratio.toFixed(2)}:1 sur --sunken`);
    }
  }
});

/* ══ 9 — LE POOL EST VISIBLE (défaut n°3, §3h) ════════════════════════ */

test("la pile montée avec les MÊMES modules et fichiers que la page rend fh:skill-points ET fh:destiny non vides", async () => {
  const bus = { on() {}, emit(type, data) { return Object.assign({ type }, data); } };
  const layers = createLayers({ bus });
  const dispatch = (route, payload) => {
    const [block, verb] = route.split(".");
    if (block !== "layers") throw new Error(`route inattendue "${route}"`);
    return layers.verbs[verb](payload);
  };
  const build = createBuild({
    bus, dispatch, now: () => "2026-08-13T00:00:00Z",
    modules: [createFhDestinyStat(), createFhSkillPoolStat()]
  });

  /* MÊME liste que `engine.mjs` (importée, pas recopiée) — lue sur disque
     plutôt que par `fetch`, seule différence avec la page (Node n'a pas de
     serveur ici). */
  for (const file of LAYER_FILES) {
    const bytes = fs.readFileSync(path.join(ROOT, "layers", file));
    layers.verbs.register({ bytes: new Uint8Array(bytes), origin: file });
  }

  const document = JSON.parse(
    fs.readFileSync(path.join(ROOT, "examples", "personnage-fh-en-niveau1.fh-char.json"), "utf8")
  );
  const out = build.verbs.rebuild({ document });
  const stats = out.resolved?.stats || out.document?.resolved?.stats || [];
  const byId = new Map(stats.map((s) => [s.id, s]));

  assert.ok(byId.has("fh:skill-points"), "fh:skill-points doit apparaître — c'est le pool que l'écran doit voir");
  assert.ok(byId.has("fh:destiny"), "fh:destiny doit apparaître aussi — le second défaut trouvé en remesurant");
  assert.ok(byId.get("fh:skill-points").value > 0 || (byId.get("fh:skill-points").breakdown || []).length > 0,
    "le pool n'est pas juste PRÉSENT, il porte une valeur");
});

test("engine.mjs monte bien createFhDestinyStat et createFhSkillPoolStat dans `modules:` — pas seulement possible, réellement écrit", () => {
  /* Le test précédent prouve que la pile PEUT rendre le pool. Celui-ci
     prouve que `engine.mjs`, le fichier que la page charge vraiment, le
     fait — sinon le test au-dessus serait vrai en théorie et faux à
     l'écran, exactement le défaut d'origine. */
  const engineText = stripComments(fs.readFileSync(path.join(UI_DIR, "engine.mjs"), "utf8"));
  assert.match(engineText, /modules\s*:\s*\[\s*createFhDestinyStat\(\)\s*,\s*createFhSkillPoolStat\(\)\s*\]/,
    "createBuild() doit recevoir modules: [createFhDestinyStat(), createFhSkillPoolStat()]");
});

/* ══ 10 — UN PERSONNAGE SRD PUR NE CHANGE PAS DE RENDU ════════════════
   Aucun jeton n'est conditionné à la couche FH : ni tokens.css ni
   shell.css ne nomment une mécanique maison ou un chemin de couche — la
   feuille de style est la même, qu'un personnage porte FH ou non. */

/* ══ ⭐ CE QUE `fh-cd-` N'EST PAS, ET IL FALLAIT LE DISTINGUER ════════════
   Ce garde interdit à la feuille de nommer une COUCHE — `destiny`, `arcana`,
   `tilt`, `fh.*`. Son motif attrapait `\bfh[-_]` en bloc, et il a rougi le
   2026-08-16 sur `.porte-de .fh-cd-static-die-result`.

   🔴 CE N'EST PAS UN NOM DE COUCHE, C'EST LE BALISAGE D'UN MOTEUR TIERS.
   `fh-cd-` est le préfixe du *companion dock* de `fh-phb`, dont `dice3d.mjs`
   et `dice3d.css` sont une COPIE VERBATIM. Une feuille qui doit adresser ce
   balisage n'a pas le choix du sélecteur : c'est le moteur qui le nomme.
   ⛔ ET L'EXCEPTION EST ÉTROITE : `fh-cd-` seulement. `fh-destiny`,
   `fh-tilt`, `fh-skill-pool` — les vrais noms de couche — rougissent
   toujours, et le témoin ci-dessous le prouve plutôt que de le promettre. */
const VOCABULAIRE_DE_COUCHE = /\bdestin(y|ies)|\bchaos|\boverreach|\barcan(a|e|um)|\bawaken|\bfate|\bvibration|\btilt|\bfh[-_](?!cd-)|modules\/fh|layers\/fh/i;

test("aucun vocabulaire Fate's Hand dans tokens.css ni shell.css — la feuille de style ne connaît aucune couche", () => {
  for (const [name, text] of [["tokens.css", stripComments(tokensCssRaw)], ["shell.css", stripComments(shellCssRaw)]]) {
    const found = text.match(VOCABULAIRE_DE_COUCHE);
    assert.equal(found, null, `${name} porte « ${found && found[0]} » — un jeton ne doit jamais nommer une couche`);
  }
});

test("⚔️ ATTAQUE — l'exception `fh-cd-` ne couvre QUE le moteur de dés recopié", () => {
  /* Le geste qu'on redoute : élargir l'exception jusqu'à laisser entrer un
     vrai nom de couche. Trois faux voisins, trois rougeurs attendues. */
  for (const faute of [".fh-destiny-card { color: red; }", ".fh_tilt { color: red; }", ".fh-skill-pool { color: red; }"]) {
    assert.notEqual(faute.match(VOCABULAIRE_DE_COUCHE), null,
      `« ${faute} » nomme une couche : le garde doit le voir malgré l'exception`);
  }
  assert.equal(".porte-de .fh-cd-static-die-result { display: none; }".match(VOCABULAIRE_DE_COUCHE), null,
    "et le balisage du moteur recopié passe — c'est tout ce que l'exception achète");
  /* ⚔️ Le témoin : l'exception sert VRAIMENT à quelque chose aujourd'hui. */
  assert.match(stripComments(shellCssRaw), /\.fh-cd-/,
    "shell.css adresse bien le moteur — si ce n'était plus le cas, l'exception devrait partir");
});

/* ══ 11 — LE CÂBLAGE DE shell.mjs, PAS SEULEMENT SA FONCTION ══════════
   Posé par l'ARCHITECTE à la revue du lot 50, après une attaque qui n'a
   fait rougir AUCUN des 19 tests du lot.

   L'ATTAQUE : remplacer, dans la branche `roll` de `shell.mjs`,
   `assign: emptyAbilityAssign()` par une expression qui CONSERVE la carte
   du lot précédent. Effet réel : une relance garde des index périmés, et
   les six rangées affichent des assignations que le joueur n'a jamais
   faites — pile la famille de défaut qu'Eric a rencontrée. Les 19 tests
   sont restés VERTS.

   POURQUOI ILS NE VOIENT RIEN, et le lot l'avait DÉCLARÉ lui-même
   (`tests/abilities-step.test.mjs`, en tête de sa section 5) : « aucun
   test `shell.mjs` n'existe nulle part dans ce dépôt ». Son test couvre
   la fonction PURE `emptyAbilityAssign()` — elle rend bien six `null` —
   mais rien ne vérifiait que `shell.mjs` l'APPELLE. Déclaré, pas caché :
   c'est le geste qu'on veut d'un lot, et c'est la revue qui paie la
   suite.

   ⭐ LE PATRON EST DÉJÀ DANS CE FICHIER, dix lignes plus haut : le garde
   « engine.mjs monte bien createFhDestinyStat et createFhSkillPoolStat
   dans `modules:` — pas seulement possible, réellement écrit ». Même
   défaut, même parade : une suite qui prouve qu'une chose est POSSIBLE
   sans prouver qu'elle est FAITE laisse le produit faux à l'écran avec
   des tests verts.

   ⚠️ SA LIMITE, DITE PLUTÔT QUE TUE : c'est un garde d'OCTETS, il lit la
   forme du code et non son comportement. Il tient parce que `ui/` n'a
   aucun harnais de rendu ; le jour où `shell.mjs` en aura un, ce garde se
   remplace par un vrai test d'enchaînement — il ne s'ajoute pas. */

test("garde 11 — la branche `roll` de shell.mjs REMET la carte d'assignation à vide (pas seulement possible : réellement écrit)", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));

  /* La forme exacte, sans rien entre `assign:` et l'appel — c'est ce
     « rien » que l'attaque exploitait, en glissant un repli sur la carte
     précédente (`state.abilityRoll.assign || emptyAbilityAssign()`). */
  assert.match(shellText, /assign\s*:\s*emptyAbilityAssign\(\)/,
    "la branche `roll` doit poser `assign: emptyAbilityAssign()` — un nouveau lot invalide l'assignation précédente");

  /* ⚔️ ET LA MOITIÉ QUI MORD : aucun repli ne doit se glisser devant
     l'appel. Sans cette seconde assertion, l'attaque passerait — elle
     laissait `emptyAbilityAssign()` dans la ligne, derrière un `||`. */
  assert.doesNotMatch(shellText, /assign\s*:\s*[^,}]*\|\|\s*emptyAbilityAssign\(\)/,
    "un repli devant l'appel garderait les index du lot précédent : la relance cesserait de remettre à zéro");
});
