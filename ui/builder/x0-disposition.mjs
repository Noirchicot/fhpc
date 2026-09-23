/* ══ LA TABLE DE X0 — L'ÉCRAN DU DÉPART, lot 248, 2026-09-23 ════════════════
   ⚖️ Eric, 23/09 : *« on peut l'appeler X0 à la rigueur »*. C'est l'écran qui
   précède X1 et X2, il porte leur parchemin et leur filet.

   🔴 POURQUOI UNE TABLE ET PAS SEPT NOMBRES DANS `shell.css` : le garde
   `x1-ecran.test.mjs` §7 l'a dit avant moi — *« shell.css ne porte AUCUNE
   position de la fiche : les cotes sont dans la table »*. Un `22px` posé dans
   la feuille est une cote sans propriétaire : personne ne sait d'où elle sort,
   et le jour où la marge bouge, il faut la retrouver à la main.
   ⭐ La feuille lit donc `var(--x0-…)`, et c'est l'écran qui pose ces jetons
   depuis ici. Un seul écrivain par cote.

   ⛔ ET CETTE TABLE N'EST PAS GÉNÉRÉE — ⭐ le test du dépôt est le NUMÉRO :
   `x1-disposition.mjs` sort de `X1_cotes.json` par `X1_gen.py` et ne se touche
   pas à la main ; celle-ci est écrite, comme `b3-disposition.mjs`. */
import * as X1 from "./x1-disposition.mjs?v=799";

/** ⚖️ *« marge autour de la dalle 8 blg (je veux que ça recouvre totalement la
 *  Fiche R Gear) »* — la feuille est posée à 8 blg du bord de la dalle. */
export const MARGE_DALLE = 8;

/** ⚖️ *« marges sur la dalle de 30 blg à gauche et à droite »*.
 *  🔴 ET LES DEUX MARGES SE COMPTENT DEPUIS LA DALLE, pas l'une depuis l'autre :
 *  le retrait INTERNE de la feuille vaut donc 30 − 8, et non 30. Une cote juste
 *  mesurée depuis le mauvais bord aurait poussé le texte à 38 du bord réel —
 *  c'est la faute « un chiffre juste sur le mauvais organe ». */
export const MARGE_TEXTE = 30;
export const RETRAIT = MARGE_TEXTE - MARGE_DALLE;

/** ⚖️ Le corps du bouton de choix — la seconde cote ratifiée le 21/09.
 *  ⛔ SA CIBLE, ELLE, RESTE `--touch` ET NE SE CONVERTIT PAS : 44 est une cote
 *  DONNÉE, elle ne se déduit pas d'un dessin et elle ne cède jamais. */
export const BOUTON = 30;
export const CIBLE = 44;

/** 🔴 L'ÉCART QU'ERIC VOIT N'EST PAS L'ÉCART QUE LE CSS DÉCLARE — et c'est la
 *  faute que ce lot répare. Eric, 23/09 : *« je veux 15 entre les boutons, t'as
 *  mis 30 »*, puis *« voire plus que 30 »*. Le CSS déclarait **16**. Les deux
 *  ont raison : entre deux CARRÉS visibles il y a la demi-cible morte du bas
 *  (7), l'écart déclaré (16), puis la demi-cible morte du haut (7) — soit **30**.
 *  ⛔ Un carré de 30 dans une cible de 44 laisse 14 blg d'air que personne
 *  n'avait comptés, et aucune règle CSS ne porte ce nombre : il naît de la
 *  rencontre de deux cotes.
 *  ⭐ ON DÉCLARE DONC CE QUI SE VOIT, et la marge s'en DÉDUIT. Le jour où le
 *  corps ou la cible bouge, l'écart vu ne bouge pas — il est la consigne. */
export const ECART_VU = 15;
export const ECART_OPTIONS = Math.max(0, ECART_VU - (CIBLE - BOUTON));

/** 📏 LE FILET EST CELUI DES FICHES X, ET SES COTES SE LISENT DANS LEUR TABLE —
 *  ⛔ jamais recopiées : `.x1-filet` est l'organe, `FILET HAUT` en est la cote.
 *  ⭐ Le jour où l'ornement change de hauteur dans X1, X0 suit sans un geste. */
const FILET = X1.ORGANES.find((o) => o.nom === "FILET HAUT");
export const FILET_H = FILET.h;
export const FILET_L = FILET.l;

/** LA FEUILLE DES COTES DE X0 — ⭐ L'IDIOME DU DÉPÔT, celui de X1, de Wares, du
 *  sac et de Gear : une `<style data-fhpc>` CONSTRUITE depuis la table.
 *  ⛔ PAS `style.setProperty` : le garde 7 (*« aucun style EN LIGNE dans ui/ »*)
 *  l'interdit, et il a raison — un style en ligne bat toute feuille, y compris
 *  celle qu'un thème voudrait poser, et il ne se lit dans aucun fichier.
 *  ⭐ Les six jetons sont écrits UNE fois, ici, à côté des cotes qui les font. */
export function feuilleDesCotesX0() {
  /* ⭐ LES JETONS SE POSENT SUR LE VOILE, ⛔ PAS SUR LA CARTE : c'est le voile
     qui porte la marge de 8 blg (elle est SA marge intérieure), et la carte hérite
     des mêmes jetons par la cascade. Les poser sur la carte laissait le voile sans
     marge — 📏 mesuré au navigateur : la carte rendait 375 × 496, soit la dalle
     ENTIÈRE, bord à bord, au lieu de 359 × 484. */
  return ".aiguilleur{"
    + `--x0-marge:${MARGE_DALLE}px;`
    + `--x0-retrait:${RETRAIT}px;`
    + `--x0-ecart:${ECART_OPTIONS}px;`
    + `--x0-bouton:${BOUTON}px;`
    + `--x0-filet-h:${FILET_H}px;`
    + `--x0-filet-l:${FILET_L}px}`;
}
