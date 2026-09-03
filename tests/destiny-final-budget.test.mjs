/* ══ LE GARDE DU GABARIT DE L'ÉCRAN FINAL DE DESTINY — lot 142 ═════════════

   Eric, 2026-09-03 : *« tu mesures tout précisément »* · *« tu figes tout ça »*.
   NORMES §4 quater bis porte le relevé ; ce fichier l'empêche de devenir faux.

   ⭐ CE QU'IL GARDE, ET CE QU'IL NE PEUT PAS GARDER. Il tient les COTES — celles
   que la feuille écrit et que la norme annonce — et il vérifie qu'elles disent
   la même chose. Il ne peut PAS tenir les hauteurs de blocs : elles dépendent du
   texte de chaque carte, et le DOM du banc ne met pas le texte en page. Celles-là
   se REGARDENT au navigateur, et la norme le dit.

   🔴 SA FORME EST CELLE DE `decor.test.mjs` (lot 59), qu'Eric cite comme modèle :
   une valeur écrite dans un seul endroit, relue dans l'autre, et un garde qui
   refuse qu'elles divergent. ⛔ Aucun nombre n'est recopié ici : le garde LIT le
   budget dans NORMES.md et les cotes dans shell.css. Le jour où Eric change une
   cote, il la change à UN endroit et le garde suit.

   ⚠️ POURQUOI LE BUDGET EST DANS LA NORME ET PAS DANS UN JETON : NORMES §1 quater
   le dit — « ces nombres ne sont PAS des jetons CSS et ne doivent pas le
   devenir ». Ce sont les cotes que la page doit TENIR, connues d'avance. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* ⭐ LE LECTEUR EST CELUI DU MODULE PARTAGÉ — pas un quatrième écrit ici. Deux
   des trois lecteurs improvisés ce soir rendaient `null` sur une feuille juste
   (une regex qui rate les listes de sélecteurs, un `matchAll` qui rate une règle
   sur deux). Un lecteur qui ne sait pas lire accuse le mauvais. */
import { stripComments, reglesDeLaFeuille, declarationDe } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const normes = fs.readFileSync(path.join(UI, "NORMES.md"), "utf8");
const css = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));

const REGLES = reglesDeLaFeuille(css);
const corps = (sel) => { const r = REGLES.find((x) => !x.sous && x.parts.includes(sel)); return r ? r.corps : null; };
const declaration = (sel, prop) => declarationDe(REGLES, sel, prop);

test("A — la norme porte le budget, et il se déduit du panneau", () => {
  /* ⛔ UN GARDE QUI NE TROUVE PAS SA SOURCE PASSE TOUJOURS. Si la section
     disparaît de NORMES, les tests suivants compareraient des `null`. */
  assert.match(normes, /## 4 quater bis\./,
    "NORMES.md doit porter la section « LE GABARIT DE L'ÉCRAN FINAL DE DESTINY » — " +
    "c'est elle qui fait foi, ce fichier ne fait que l'empêcher de mentir.");

  const bloc = normes.slice(normes.indexOf("## 4 quater bis."));
  const m = bloc.match(/panneau\s+(\d+) blg[\s\S]{0,120}?ceinture\s+−\s*(\d+)[\s\S]{0,120}?scène\s+(\d+) blg/);
  assert.ok(m, "le budget doit être posé en toutes lettres : panneau − ceinture = scène");
  const [, panneau, ceinture, scene] = m.map(Number);
  assert.equal(panneau - ceinture, scene,
    `la norme annonce ${panneau} − ${ceinture} = ${scene}, et l'arithmétique ne tombe pas. ` +
    "Un budget dont la soustraction est fausse est pire qu'aucun budget : on le croit.");
  assert.equal(scene, 500, "le budget d'un écran vaut 500 blg (560 du panneau moins 60 de ceinture)");
});

test("B — le panneau annoncé par la norme est celui du jeton", () => {
  /* ⭐ LA NORME NE PEUT PAS DÉRIVER DU CODE : si `--panneau-h` bouge, le budget
     de la norme devient faux, et c'est exactement ce que ce test refuse. */
  const tokens = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");
  const jeton = tokens.match(/--panneau-h:\s*(\d+)/);
  assert.ok(jeton, "`--panneau-h` doit exister dans tokens.css");
  const bloc = normes.slice(normes.indexOf("## 4 quater bis."));
  const m = bloc.match(/panneau\s+(\d+) blg/);
  assert.equal(Number(m[1]), Number(jeton[1]),
    `la norme parle d'un panneau de ${m[1]} blg, le jeton en déclare ${jeton[1]}. ` +
    "Le budget de la page se déduit du panneau : les deux ne peuvent pas différer.");
});

test("C — le rembourrage de la dalle tient le rang B sur trois côtés, et la droite s'argumente", () => {
  /* ⚖️ CE GARDE A ÉTÉ RESSERRÉ, PAS DÉSARMÉ. Il exigeait l'égalité stricte avec
     la dalle du rang B ; il a rougi le 2026-09-03 quand Eric a demandé de rogner
     la marge DROITE pour agrandir la carte de 10 %. ⛔ La bonne réponse à un
     garde qui rougit sur une décision assumée n'est pas de le retirer — c'est de
     lui apprendre l'exception, et de garder sa morsure sur tout le reste.
     ⭐ CE QUI RESTE TENU : le haut, le bas et la GAUCHE. Seule la droite cède,
     et seulement sur cet écran. Le jour où quelqu'un touche au haut ou à la
     gauche, ce garde le voit encore. */
  const pad = (declaration(".card-final", "padding") || "").split(/\s+/);
  assert.ok(pad.length >= 2, "`.card-final` doit déclarer son rembourrage");
  const temoin = (declaration(".parcours-guide", "padding") || "").split(/\s+/);
  assert.ok(temoin.length >= 2, "la dalle du rang B doit déclarer le sien — c'est le témoin");

  const cote = (p, i) => (p.length === 2 ? [p[0], p[1], p[0], p[1]] : p)[i];
  assert.equal(cote(pad, 0), cote(temoin, 0),
    `le HAUT vaut « ${cote(pad, 0)} » ici et « ${cote(temoin, 0)} » au rang B — il ne cède pas.`);
  /* ⚖️ LE BAS EST LA SECONDE CESSION, ET ELLE VAUT 8 — Eric, 2026-09-03 :
     *« 8 blg sous les boutons stp »*. Le rang B pose 4 ; les boutons rendaient
     donc 4 pendant que le livre, POSÉ par la coquille au bas de la dalle,
     rendait 8. ⭐ Les deux retombent sur la même ligne par arithmétique — c'est
     la dette du lot 138 payée, pas un second réglage.
     ⛔ ET ELLE EST BORNÉE : `var(--sp-8)`, épelé. Une cession sans valeur écrite
     laisse passer la dérive suivante sans rien dire. */
  assert.ok(cote(pad, 2) === cote(temoin, 2) || cote(pad, 2) === "var(--sp-8)",
    `le BAS vaut « ${cote(pad, 2)} » ici, « ${cote(temoin, 2)} » au rang B, et la seule cession ` +
    "admise est `var(--sp-8)` — la cote qu'Eric a dictée le 03/09.");
  assert.equal(cote(pad, 3), cote(temoin, 3),
    `la GAUCHE vaut « ${cote(pad, 3)} » ici et « ${cote(temoin, 3)} » au rang B — elle ne cède pas. ` +
    "Le haut et la gauche ne cèdent jamais ; la droite et le bas sont deux exceptions " +
    "nommées, datées, et toutes deux bornées à `var(--sp-8)`.");
});

test("D — l'écart entre blocs a UN seul écrivain, et c'est le gap", () => {
  /* 🔴 LA LEÇON DE LA SÉANCE, FIGÉE. Chaque fois qu'un écart a été posé en MARGE
     ce soir, il s'est AJOUTÉ au gap : 20 au lieu de 8 sous le titre, 16 avant les
     Vibrations, 40 avant les boutons. Les trois ont dû être défaits. Tant que le
     gap est le seul écrivain, aucune addition n'est possible. */
  const gap = declaration(".card-final-corps", "gap");
  assert.equal(gap, "var(--sp-8)",
    `la grille du corps espace ses rangées en « ${gap} » — ce doit être \`var(--sp-8)\`, ` +
    "le même écart que partout ailleurs sur l'écran.");
  const colonne = declaration(".card-final-texte", "gap");
  assert.equal(colonne, "var(--sp-8)",
    `la colonne de texte espace ses blocs en « ${colonne} » — même cote que la grille.`);

  for (const sel of [".card-final-nom", ".card-final-ligne"]) {
    const marge = declaration(sel, "margin");
    assert.ok(marge === null || /^0$/.test(marge),
      `${sel} déclare « margin: ${marge} ». Un bloc de cette colonne ne pose AUCUNE marge : ` +
      "elle s'ajouterait au `gap` et l'écart voulu à 8 en rendrait 16. Mesuré trois fois le 03/09.");
  }
});

test("E — la grille protège la colonne de texte par un plancher", () => {
  /* ⛔ SANS CE PLANCHER, LA COLONNE TOMBE À ZÉRO. Mesuré le 02/09 : la carte en
     `height: 100%` réclamait une largeur proportionnelle, la colonne `auto` la
     lui donnait, et `1fr` s'écrasait — le texte disparaissait sous l'image. */
  const cols = declaration(".card-final-corps", "grid-template-columns");
  assert.match(cols, /minmax\(\s*\d+px\s*,\s*1fr\s*\)\s+auto/,
    `la grille déclare « ${cols} ». Elle doit être \`minmax(<plancher>, 1fr) auto\` : la hauteur ` +
    "de la carte dépend de celle du texte, qui dépend de sa largeur, qui dépend de ce que la carte " +
    "lui laisse. `minmax()` casse ce cycle par le bas ; sans lui la colonne s'écrase à 0.");
  assert.match(declaration(".card-final-corps", "align-content") || "", /start/,
    "la grille doit poser `align-content: start`. Ses rangées sont en `auto` et elle reçoit une " +
    "hauteur : sans cela elle ÉTIRE ses rangées pour la remplir, et distribue du vide entre les " +
    "blocs — mesuré le 03/09, 242/97/79 pour des contenus de 202/72/38.");
});

test("F — la dalle prend SA hauteur, elle ne se laisse plus étirer", () => {
  /* 🔴 LE GESTE QUI A DÉBLOQUÉ LA SOIRÉE. La dalle était collée à 500 blg, et
     AUCUNE RÈGLE NE LUI DONNAIT CETTE HAUTEUR : elle était étirée par sa chaîne,
     `align-items: stretch` étant le défaut d'un conteneur flexible. Le surplus se
     réglait donc en défilement interne, c'est-à-dire en cachant le bas du Score
     sans que rien ne le signale. */
  assert.equal(declaration(".card-final", "align-self"), "start",
    "`.card-final` doit poser `align-self: start`, sinon sa chaîne l'étire à la hauteur de la " +
    "scène et son contenu se fait couper sans prévenir.");
  const corpsFinal = corps(".card-final-corps") || "";
  assert.doesNotMatch(corpsFinal, /overflow-y:\s*auto/,
    "le corps ne doit plus défiler DANS lui-même : c'est ce défilement qui cachait le bas du " +
    "Score. La dalle grandit, et c'est `.stage` qui défile — la surface qui défile du socle.");
});

test("G — la cote de la carte se lit sur le jeton du panneau, jamais en vh", () => {
  const h = declaration(".card-final-img", "height");
  assert.ok(h, "`.card-final-img` doit déclarer sa hauteur");
  assert.match(h, /var\(--panneau-h\)/,
    `la carte mesure « ${h} » — sa hauteur se lit sur \`--panneau-h\`, le seul repère qui vaille ` +
    "la même chose sur tout écran (Eric : « c'est bon pour un écran, c'est bon pour tous »).");
  assert.doesNotMatch(h, /\d\s*v[hw]/,
    "aucune unité de fenêtre : `zoom` ne les rebase pas, elles sont calculées sur la fenêtre brute " +
    "puis peintes × le cran (garde 5 ter de `ui-jetons.test.mjs`).");
});

test("H — les deux fenêtres de prose défilent, et l'exception est BORNÉE", () => {
  /* ⚖️ CECI EST UNE EXCEPTION À UNE LOI D'ERIC, ET C'EST LUI QUI L'A OUVERTE :
     *« si c'est mécaniquement possible on passe à 4 lignes scrollable, on fait
     une exception à la règle du non scrollable ici »* (2026-09-03).
     La loi : *« un contenu qui ne tient pas : demander ce qu'il porte EN TROP,
     jamais un défilement interne »* (palette FREE, 91 → 56 blg).
     ⭐ POURQUOI ELLE CÈDE ICI ET NULLE PART AILLEURS : dans la palette, ce qui
     était en trop était de la DÉCORATION. Ici c'est une **règle du jeu** —
     mesuré, *The Devil* perdait SEPT lignes sur onze à la coupe, soit 64 % de
     son pouvoir. La loi dit de retirer ce qui est en trop ; rien n'est en trop
     dans un texte de règle.
     🔴 CE QUE CE GARDE TIENT, DU COUP : que l'exception reste BORNÉE à ces deux
     fenêtres-là, et qu'elle garde ses deux conditions — 4 lignes exactement, et
     un signe visible. Une exception sans borne n'est plus une exception. */
  const clef = ".aire-power .card-final-cadre";

  /* 📏 4 LIGNES, ET L'INTERLIGNE DOIT ÊTRE ÉCRIT POUR QUE ÇA VEUILLE DIRE
     QUELQUE CHOSE. `line-height: normal` rend 1,208 pour Inter — une valeur que
     personne n'a écrite et qui change avec la police. Le jour où Inter tombe en
     repli, « 4 lignes » cesse de valoir 4 lignes, et le budget des 22 cartes
     avec. ⛔ Une cote qui dépend d'un défaut de moteur n'est pas une cote. */
  const interligne = declaration(clef, "line-height");
  assert.ok(interligne && /^[\d.]+$/.test(interligne),
    `l'interligne des fenêtres vaut « ${interligne} ». Il doit être un NOMBRE écrit : ` +
    "`normal` dépend de la police (1,208 pour Inter, autre chose en repli), et la hauteur de la " +
    "fenêtre se calcule dessus. Une cote qui dépend d'un défaut de moteur n'est pas une cote.");

  const plafond = declaration(clef, "max-height");
  assert.ok(plafond && plafond.includes(interligne) && /\b4\b/.test(plafond),
    `la fenêtre plafonne à « ${plafond} ». Elle doit valoir 4 × l'interligne écrit (${interligne}) — ` +
    "c'est le nombre de lignes qu'Eric a dicté le 2026-09-03, et c'est LUI qui fait tenir les 22 " +
    "cartes dans les 500 blg (mesuré : 449 / 463 / 478 / 492).");

  const corpsProse = corps(clef) || "";
  assert.match(corpsProse, /overflow-y:\s*auto/,
    "la fenêtre doit DÉFILER — c'est l'exception qu'Eric a ouverte, et sans elle le texte est coupé.");
  assert.match(corpsProse, /overscroll-behavior:\s*contain/,
    "⛔ SANS `contain`, LE GESTE FUIT VERS LA SCÈNE : arrivé au bas de la fenêtre, le doigt " +
    "continue et emporte la page. Sur un écran qui ne défile PAS, ça se lit comme un défaut.");

  /* 🔴 ET LE DÉFILEMENT DOIT SE VOIR — c'est la moitié de la décision. Un joueur
     qui ne sait pas qu'il manque du texte croit avoir lu la règle entière, ce qui
     est PIRE que la coupe visible qu'on vient de retirer.
     ⛔ L'ASCENSEUR N'EST PAS LE SIGNE : Eric l'a refusé (*« pas des barres »*), et
     sur iOS il n'apparaît qu'en surimpression PENDANT le geste. */
  assert.ok(css.includes(".card-final-chevron"),
    "les chevrons doivent exister : ils sont le seul signe qui dit « il y en a encore » AVANT " +
    "qu'on touche. Eric, 2026-09-03 : « des chevrons », « dans la marge gauche », « entre le bloc " +
    "et le bord de la dalle ».");
  const jauge = corps(".card-final-defile") || "";
  assert.match(jauge, /margin-left:\s*-/,
    "la jauge doit sortir vers la GAUCHE par une marge négative : elle vit dans une colonne de " +
    "largeur NULLE et déborde dans le rembourrage de la dalle. C'est ce qui lui évite de prendre " +
    "de la largeur au texte — donc de recomposer les lignes d'une carte à l'autre.");
  assert.doesNotMatch(jauge, /display:\s*none/,
    "⛔ pas de `display: none` : le garde 4 des jetons l'interdit dans cette feuille, et l'opacité " +
    "rend ici exactement le même service sans demander d'exception.");
});
