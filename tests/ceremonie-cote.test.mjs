/* ══ LE GARDE DE LA COTE DE LA CÉRÉMONIE — lot 140 ════════════════════════

   CE QU'IL EXISTE POUR EMPÊCHER, et il a ROUGI dessus avant d'être écrit :
   que la carte du tirage reprenne une taille qui ne dit pas ce qu'elle vaut,
   ou que les deux séquences en portent deux — ce qui rend le saut qu'Eric a
   vu sur son iPad le 2026-09-02 (*« ça saute un peu »*, *« première partie du
   zoom insuffisante, 2e partie excessive »*).

   ⭐ DEUX INVARIANTS, ET AUCUN DES DEUX N'EST UN CHIFFRE.

   1. LA COTE SE LIT SUR LA DIMENSION QUI DOIT TENIR. La carte est portrait
      (823/480) : c'est sa HAUTEUR qui déborde, jamais sa largeur. Une cote
      écrite sur `width` et bornée en `vh` se fait multiplier par 1,7146 par
      l'`aspect-ratio` — « 74vh » devient 127 % de la hauteur, et le nombre
      écrit cesse de dire ce qu'on voit. Le garde exige donc que la cote soit
      posée sur `height`, sans dire laquelle.

   2. LES DEUX SÉQUENCES PORTENT LA MÊME. Le croquis d'Eric ne dessine qu'une
      taille finale — la séquence 2 finit à « 100 % remplit l'écran », la
      séquence 3 est « zoom max ». Deux cotes là où le dessin en montre une,
      c'est une marche. Le garde compare les deux déclarations SANS connaître
      leur valeur : le jour où Eric change 88 en 95, il suffit de les changer
      toutes les deux, et ce fichier n'a pas à être touché.

   🔴 SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS TOUTE SEULE : il lit des
   DÉCLARATIONS, pas un rendu — leçon payée en production le même jour (une
   règle peut exister et perdre la cascade, lot 139). Ce qu'il garantit est
   qu'on ne peut plus écrire la cote au mauvais endroit ni la désaccorder ;
   que la carte tienne à l'écran se REGARDE au navigateur. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shellCss = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8"));

/** Le corps de la règle d'un sélecteur unique, au premier niveau. */
function corps(selecteur) {
  const m = shellCss.match(new RegExp(`(^|[};])\\s*\\${selecteur}\\s*\\{([^}]*)\\}`, "m"));
  return m ? m[2].replace(/\s+/g, " ").trim() : null;
}

/** La déclaration `height` d'une règle, telle qu'écrite. */
function hauteurDe(selecteur) {
  const c = corps(selecteur);
  if (!c) return null;
  const m = c.match(/(?:^|;)\s*height:\s*([^;}]+)/);
  return m ? m[1].trim().replace(/\s+/g, " ") : null;
}

const LES_DEUX = [".ceremonie-pile", ".ceremonie-flip"];

test("A — les deux séquences existent, et la carte garde son rapport", () => {
  for (const sel of LES_DEUX) {
    const c = corps(sel);
    assert.ok(c, `la règle ${sel} doit exister dans shell.css`);
    assert.match(c, /aspect-ratio:\s*480\s*\/\s*823/,
      `${sel} doit garder \`aspect-ratio: 480 / 823\` — c'est le rapport du dos de carte, ` +
      "et c'est LUI qui fait qu'une cote de largeur devient 1,7146 fois plus haute. " +
      "Sans lui, tout le raisonnement de ce garde tombe.");
  }
});

test("B — la cote se lit sur la HAUTEUR, jamais sur la largeur", () => {
  for (const sel of LES_DEUX) {
    const h = hauteurDe(sel);
    assert.ok(h,
      `${sel} ne déclare pas de \`height\`. La carte est PORTRAIT : c'est sa hauteur qui déborde. ` +
      "Une cote posée sur `width` et bornée en `vh` se fait multiplier par 823/480 = 1,7146 par " +
      "l'`aspect-ratio` — c'est ainsi que « 74vh » rendait 127 % de la hauteur sur l'iPad d'Eric " +
      "(mesuré le 2026-09-02, carte coupée en haut et en bas). Le nombre écrit doit être le nombre vu.");

    const c = corps(sel);
    const largeur = c.match(/(?:^|;)\s*width:\s*([^;}]+)/);
    assert.ok(largeur && /^auto$/i.test(largeur[1].trim()),
      `${sel} déclare \`width: ${largeur ? largeur[1].trim() : "(rien)"}\`. La largeur doit être ` +
      "`auto` : elle SUIT le rapport une fois la hauteur donnée. Une largeur écrite en même temps " +
      "que la hauteur, c'est deux écrivains pour une même boîte, et le rapport arbitre en silence.");

    /* ⭐⭐ AUCUNE UNITÉ DE FENÊTRE, ET C'EST LA LOI D'ERIC : *« tu connais les
       blg ? normalement c'est bon pour un écran c'est bon pour tous les
       écrans »* (2026-09-02). Le panneau vaut 560 blg de haut PARTOUT ; une
       cote écrite contre `--panneau-h` vaut la même fraction sur tout écran,
       par construction — il n'y a plus de calcul à vérifier.
       ⛔ J'AI ESSAYÉ LES DEUX AUTRES VOIES ET ELLES ÉCHOUENT TOUTES DEUX :
       `vh` sans division est refusé par le `garde 5 ter` (zoom ne rebase pas
       les unités de fenêtre, la cérémonie sortait de l'écran dès le cran 2) ;
       `vh` AVEC division rendait 76 % là où j'attendais 88, mesuré sur la page.
       Une cote qui demande une arithmétique pour être crue est une cote qui
       ment un jour. */
    assert.doesNotMatch(h, /\d\s*v[hwi]|\d\s*dv[hw]|\d\s*cq/,
      `${sel} écrit sa hauteur en unités de FENÊTRE (« ${h} »). Le panneau vaut 560 blg de haut ` +
      "sur tous les écrans : la cote se lit sur `--panneau-h`, jamais sur `vh`. C'est déjà " +
      "l'idiome de `.card-final-img` (lot 116) à trente lignes de là.");
    assert.match(h, /var\(--panneau-h\)/,
      `${sel} n'adosse pas sa hauteur à \`--panneau-h\`. C'est le jeton qui porte les 560 blg du ` +
      "panneau — la seule hauteur qui vaille la même chose sur tout écran, à tout cran.");
  }
});

test("C — les deux séquences portent la MÊME cote, et c'est ce qui tue le saut", () => {
  const [pile, flip] = LES_DEUX.map(hauteurDe);
  /* ⛔ D'ABORD : DEUX ABSENCES SE RESSEMBLENT. Sans cette ligne, `null === null`
     rendait ce test VERT sur `main`, où aucune des deux ne déclarait de hauteur
     — il aurait certifié l'accord de deux cotes inexistantes. Mesuré en le
     reposant sur `main` avant de le livrer. C'est le même piège qu'un témoin
     muet : une comparaison ne vaut que si les deux termes existent. */
  for (const [sel, h] of [[LES_DEUX[0], pile], [LES_DEUX[1], flip]]) {
    assert.ok(h, `${sel} ne déclare aucune hauteur — il n'y a rien à comparer, ` +
      "et une comparaison entre deux absences ne prouve rien (voir le test B).");
  }
  /* ⭐ AUCUN CHIFFRE ICI, ET C'EST VOULU. Le garde ne sait pas si la carte vaut
     88 % ou 95 % de la hauteur — c'est le dessin d'Eric, il peut bouger. Il sait
     seulement que les DEUX doivent bouger ensemble. */
  assert.equal(pile, flip,
    `le mélange se termine à « ${pile} » et le gros plan ouvre à « ${flip} ». Deux cotes pour la ` +
    "même carte, c'est une MARCHE : les deux séquences sont des nœuds DIFFÉRENTS, l'un remplace " +
    "l'autre, et aucune transition ne peut adoucir un remplacement. Mesuré avant le lot 140 : " +
    "449 px puis 831 px, soit ×1,85 d'un coup — c'est le « ça saute un peu » d'Eric. " +
    "Le croquis ne dessine qu'une taille finale : « 100 % remplit l'écran » et « zoom max » " +
    "nomment le même plein écran.");
});

test("D — le mélange ne paie pas douze ombres pleines", () => {
  /* 📏 Onze des douze copies sont EMPILÉES au centre à l'arrivée : on paierait
     douze flous pour en montrer un seul. Le garde ne fixe pas le rayon — il
     refuse seulement que celui des douze dépasse celui de la carte SEULE, qui
     est le moment où l'ombre se regarde. */
  const dos = corps(".ceremonie-dos");
  const face = corps(".ceremonie-flip-face");
  assert.ok(dos && face, "`.ceremonie-dos` et `.ceremonie-flip-face` doivent exister");

  /* ⚠️ LE `0` DU DÉCALAGE N'A PAS D'UNITÉ, et exiger `px` sur les trois termes
     a fait rougir ce garde sur une feuille parfaitement juste — il ne lisait ni
     `0 14px 40px` ni `0 4px 12px`. Un lecteur qui ne sait pas lire accuse le
     mauvais : même faute que le lecteur de sélecteurs du lot 138, deux heures
     plus tôt. C'est le TROISIÈME terme qui compte, le rayon de flou. */
  const flou = (c) => {
    const m = c.match(/box-shadow:\s*[^;}]*?[\d.]+(?:px)?\s+[\d.]+(?:px)?\s+([\d.]+)px/);
    return m ? Number(m[1]) : null;
  };
  const fDos = flou(dos), fFace = flou(face);
  assert.ok(fDos !== null && fFace !== null, "les deux doivent déclarer une ombre lisible");
  assert.ok(fDos < fFace,
    `les douze dos du mélange portent un flou de ${fDos}px et la carte seule ${fFace}px. ` +
    "Le flou des DOUZE doit rester sous celui de la carte SEULE : ils sont douze à bouger " +
    "ensemble, onze d'entre eux finissent cachés derrière le douzième, et un flou se recalcule " +
    "à chaque image du mouvement. C'est ce qui rendait le mélange saccadé (Eric, 2026-09-02).");

  assert.match(dos, /will-change:\s*transform/,
    "`.ceremonie-dos` doit porter `will-change: transform`. ⚖️ NORMES le refuse pour le cran de " +
    "ceinture, avec sa raison : il promeut en couche composite, et le cran vit toute la session. " +
    "Ces douze-là vivent CINQ SECONDES — le nœud meurt avec la séquence et rend sa couche. " +
    "L'argument de la norme ne porte pas ici ; il porte toujours ailleurs.");
});
