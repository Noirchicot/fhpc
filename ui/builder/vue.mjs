/* ══ LA VUE DU BUILDER — un panneau, ou deux ═══════════════════════════════
   📐 Eric, 2026-09-02, croquis `2026-09-02-double-view-belt-deroule.jpg` :
   deux panneaux du builder côte à côte, un seul belt déroulé au-dessus.
   Spec : vault `FH-WEB/FHPC/FHPCv2 double affichage.md`.

   ⛔ CE N'EST PAS UNE DONNÉE DE PERSONNAGE — même loi que `tutoriel.mjs` :
   deux joueurs qui ouvrent le même personnage n'ont pas le même écran. C'est
   une PRÉFÉRENCE, elle vit dans le navigateur et jamais dans `fh-char/1` ; la
   loger au document la ferait voyager avec un export, ce qui n'a aucun sens.

   ⭐ ET LA PRÉFÉRENCE SURVIT À LA FENÊTRE, c'est même tout son intérêt : la
   porte de largeur (`laPlaceDuDouble`, echelle.mjs) décide de ce qui est
   RENDU, jamais de ce qui est VOULU. Rétrécir sa fenêtre replie l'affichage ;
   la rouvrir rend la vue double sans avoir à la redemander. */

const CLEF_DOUBLE = "fhpc.vue.double";

/** ⚠️ `localStorage` peut JETER (mode privé, quota, iframe cloisonnée). Une
 *  préférence d'affichage n'est jamais une raison de faire tomber le
 *  builder : on retombe sur le défaut, et on le dit ici plutôt que de laisser
 *  un `try` muet. */
function lire(clef, defaut) {
  try {
    const valeur = window.localStorage.getItem(clef);
    return valeur === null ? defaut : valeur === "1";
  } catch (_) { return defaut; }
}
function ecrire(clef, valeur) {
  try { window.localStorage.setItem(clef, valeur ? "1" : "0"); } catch (_) { /* sans mémoire, tant pis */ }
}

/** 🔴 ÉTEINT PAR DÉFAUT, et c'est la sobriété qui le veut : le builder a été
 *  dessiné pour un panneau, et un joueur qui ouvre la page pour la première
 *  fois sur un grand écran ne s'attend pas à deux. C'est un réglage qu'on
 *  ALLUME, jamais un régime qu'on subit. */
export function vueDoubleVoulue() { return lire(CLEF_DOUBLE, false); }
export function setVueDoubleVoulue(valeur) { ecrire(CLEF_DOUBLE, valeur); }
