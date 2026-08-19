/* ══ LE TUTORIEL — général, spécifique, et l'interrupteur ═══════════════════
   📐 Spec d'Eric, 2026-08-19 (étape Identity, mais le mécanisme est global).

     · LE TUTORIEL GÉNÉRAL, sur fond BLEU (FF2) — il explique le builder
       entier. Deux boutons centrés : « I understand » (il s'efface et laisse
       la place au tutoriel spécifique) et « Turn tutorials off ».
     · LE TUTORIEL SPÉCIFIQUE, sur fond VERT (FF3) — il explique CETTE étape,
       et se termine par un line bleed.
     · LE « ? » — un petit rond discret en haut à gauche de toutes les dalles,
       qui rallume le tutoriel.
     · L'INTERRUPTEUR — *« il est possible de on/off le tutoriel dans le
       menu »*, et le bouton « Turn tutorials off » l'éteint partout d'un coup.

   ⛔ CE N'EST PAS UNE DONNÉE DE PERSONNAGE. Deux joueurs qui ouvrent le même
   personnage n'ont pas la même envie d'être guidés : ces deux drapeaux sont des
   PRÉFÉRENCES, elles vivent dans le navigateur et pas dans `fh-char/1`. Les
   loger au document les ferait voyager avec un export, ce qui n'a aucun sens.

   ⚠️ ET ELLES SURVIVENT AU RECHARGEMENT, sinon le tutoriel général
   réapparaîtrait à chaque ouverture — exactement ce que « j'ai compris »
   promet d'éviter. */

const CLEF_ACTIF = "fhpc.tutoriel.actif";
const CLEF_VU = "fhpc.tutoriel.general-vu";

/** ⚠️ `localStorage` peut JETER (mode privé, quota, iframe cloisonnée). Un
 *  tutoriel n'est pas une raison de faire tomber le builder : on retombe alors
 *  sur le comportement par défaut, et on le dit dans le code plutôt que de
 *  laisser un `try` muet. */
function lire(clef, defaut) {
  try {
    const valeur = window.localStorage.getItem(clef);
    return valeur === null ? defaut : valeur === "1";
  } catch (_) { return defaut; }
}
function ecrire(clef, valeur) {
  try { window.localStorage.setItem(clef, valeur ? "1" : "0"); } catch (_) { /* sans mémoire, tant pis */ }
}

/** Le tutoriel est ALLUMÉ par défaut : un joueur qui découvre le builder ne
 *  sait pas encore qu'il existe un tutoriel à allumer. */
export function tutorielActif() { return lire(CLEF_ACTIF, true); }
export function setTutorielActif(valeur) { ecrire(CLEF_ACTIF, valeur); }

/** Le général n'a PAS encore été compris par défaut — c'est lui qui accueille. */
export function generalVu() { return lire(CLEF_VU, false); }
export function setGeneralVu(valeur) { ecrire(CLEF_VU, valeur); }

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function bouton(libelle, className, onClick) {
  const b = el("button", className, [text(libelle)]);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

/** Le bouton « éteindre », présent SUR LES DEUX dalles — Eric : *« à toute
 *  étape du tutoriel on a les deux boutons »*. */
function boutonEteindre(act) {
  return bouton("Turn tutorials off", "tuto-eteindre", () => act({ kind: "tutoDesactiver" }));
}

/* ══ LE « ? » ═══════════════════════════════════════════════════════════════
   *« petit rond discret en haut à gauche de toutes les dalles »*.
   ⚠️ DISCRET NE VEUT PAS DIRE INVISIBLE : il garde sa cible tactile pleine
   (`--touch`) sous un rond peint plus petit — un point de 16 px se rate au
   pouce, et un joueur perdu est précisément celui qui le cherche. */
export function renderPointInterrogation(onAction) {
  const act = onAction || (() => {});
  const b = bouton("?", "tuto-point", () => act({ kind: "tutoRouvrir" }));
  b.setAttribute("aria-label", "Show the tutorial for this step");
  return b;
}

/* ══ LE TUTORIEL GÉNÉRAL — fond bleu, FF2 ══════════════════════════════════ */
export function renderTutorielGeneral({ texte, onAction }) {
  const act = onAction || (() => {});
  const dalle = el("section", "tuto-general dalle-majeure");
  dalle.dataset.cadre = "FF2";
  for (const para of String(texte || "").split(/\n{2,}/)) {
    const ligne = para.trim();
    if (ligne.length > 0) dalle.append(el("p", "tuto-mot", [text(ligne)]));
  }
  /* DEUX BOUTONS CENTRÉS EN BAS — et « I understand » d'abord, parce que c'est
     le geste que 99 joueurs sur 100 vont faire. */
  const pied = el("div", "tuto-pied", [
    bouton("I understand", "tuto-compris", () => act({ kind: "tutoCompris" })),
    boutonEteindre(act)
  ]);
  dalle.append(pied);
  return dalle;
}

/* ══ LE TUTORIEL SPÉCIFIQUE — fond vert, FF3 ═══════════════════════════════
   ⭐ FF3 : il SE TERMINE par un line bleed, parce qu'une autre dalle suit —
   c'est exactement ce que le chiffre 3 nomme (CADRES.md §2 ter bis). */
export function renderTutorielSpecifique({ texte, onAction }) {
  const act = onAction || (() => {});
  const dalle = el("section", "tuto-specifique dalle-majeure");
  dalle.dataset.cadre = "FF3";
  for (const para of String(texte || "").split(/\n{2,}/)) {
    const ligne = para.trim();
    if (ligne.length > 0) dalle.append(el("p", "tuto-mot", [text(ligne)]));
  }
  dalle.append(el("div", "tuto-pied", [boutonEteindre(act)]));
  const filet = el("hr", "saignee");
  filet.setAttribute("aria-hidden", "true");
  dalle.append(filet);
  return dalle;
}
