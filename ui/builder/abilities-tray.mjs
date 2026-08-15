/* ══ LE PLATEAU DE DÉS D'ABILITIES — croquis B d'Eric, 2026-08-15 ═══════
   La dalle MAJEURE de l'écran Abilities : trois dés 3D, `ROLL` / `ROLL 10` /
   `CLEAR`, et les dix résultats numérotés dont quatre barrés.

   ══ CE QUI A DÉCIDÉ DE LA FORME ════════════════════════════════════════

   🔴 `ROLL` NE TIRE PAS, IL RÉVÈLE. La règle d'Eric (ADDENDUMS §4, codée
   dans `dice.mjs`) relance le LOT ENTIER si aucun des dix n'atteint 15 —
   *« jamais un jet remplacé seul, jamais un jet complété »*. Un lot construit
   jet par jet SERAIT un lot complété : la règle l'interdit. Les dix jets
   existent donc dès le départ, relance déjà résolue, et le plateau les
   DÉCOUVRE un par un.
   ⭐ C'est aussi ce pour quoi le moteur porté est écrit, mot pour mot :
   *« The roller owns randomness. This module renders a result FHPC has
   already resolved. »*

   🔴 LE PLATEAU NE PASSE JAMAIS PAR `refresh()`. Un redessin remplace tout
   le contenu de la scène (`swapContent`) : les trois canvas WebGL mourraient
   à chaque jet, en pleine animation. La séquence de révélation écrit donc
   dans des nœuds qui existent déjà — c'est la troisième règle du socle, la
   même que celle qui interdit au scrollspy de redessiner.

   🔴 LES BOUTONS SONT SUR LEUR PROPRE RANGÉE (Eric, choix A du 2026-08-15).
   Mesuré : la colonne `ROLL`/`ROLL 10` fait 80 px et `CLEAR` 70, sur 312
   utiles à 360 — les encadrer laisserait 146 px aux dés, soit des dés de
   46 px. Aucune taille acceptable ne tient tant qu'ils bordent le plateau.

   ⭐ `settleSizePx` EST CE QUI REND `ROLL 10` POSSIBLE : à la pose, chaque dé
   se fige en image et LIBÈRE son contexte WebGL. Le navigateur en plafonne
   ~16 ; sans ça, dix jets de trois dés épuisent la réserve et le plateau
   cesse de rendre SANS erreur. Vérifié au banc : après trente dés, zéro
   contexte vivant. */

import { mount, createDieHost, rollDurationMs } from "./dice3d.mjs?v=1";
import { rollAbilitySet } from "./dice.mjs?v=1";
import { swapContent } from "./socle.mjs?v=1";

/* Les réglages d'Eric, mesurés sur son iPhone SE le 2026-08-15.
   ⛔ Pas de valeur en dur ailleurs : c'est ici ou nulle part. */
export const REGLAGES = {
  tailleMobile: 72,
  tailleBureau: 82,
  ecart: 4,
  pauseMs: 2500,   // « pause 2500 bien » — il a essayé 2000 et a préféré plus lent
  seuilBureau: 768
};

function tailleDeDe() {
  const large = typeof window !== "undefined" && window.matchMedia
    && window.matchMedia(`(min-width: ${REGLAGES.seuilBureau}px)`).matches;
  return large ? REGLAGES.tailleBureau : REGLAGES.tailleMobile;
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (children) for (const child of children) node.append(child);
  return node;
}
const texte = (s) => document.createTextNode(s);

/** Les trois dés d'un jet, posés dans l'hôte.
 *  `anime: false` → ils prennent la POSE du résultat sans tomber. C'est ce
 *  qui fait qu'un redessin (après une assignation) ne rejoue pas dix
 *  animations : seul un vrai `ROLL` anime. */
function poserLesDes(hote, des, anime) {
  const taille = tailleDeDe();
  /* ⛔ PAS DE `replaceChildren` ICI — un garde du socle l'a attrapé, et il a
     raison : `swapContent` est le SEUL endroit du dépôt qui remplace le
     contenu d'un nœud (une brique, un écrivain, un garde). Le plateau n'a
     aucune raison d'être une exception : la brique fait exactement ce qu'il
     faut, et il hérite de son comportement au lieu d'en réinventer un. */
  swapContent(hote, des.map((valeur, i) => createDieHost({
    sides: 6, result: valeur, sizePx: taille, index: i,
    animate: anime, settleSizePx: taille
  })));
  mount(hote);
}

/** Une case de résultat, dans la rangée des dix. Elle existe DÈS LE DÉPART,
 *  vide : c'est ce qui permet à la révélation d'écrire dedans sans
 *  reconstruire la rangée (et donc sans toucher aux canvas voisins). */
function caseDeResultat(numero) {
  const box = el("li", "tray-case");
  box.dataset.numero = String(numero);
  box.dataset.etat = "vide";
  box.append(el("span", "tray-case-num", [texte(String(numero))]));
  box.append(el("span", "tray-case-total", [texte("—")]));
  return box;
}

/**
 * Le plateau entier. Rend un nœud, et ne connaît ni la coquille ni les
 * verbes du moteur (loi des lots 39/42).
 *
 * @param {object} o
 * @param {object|null} o.lot        le lot de dix, ou `null` si rien n'est tiré
 * @param {number} o.revele          combien de jets sont déjà découverts
 * @param {(n:number)=>void} o.onRevele  appelé quand la séquence avance
 * @param {(lot:object)=>void} o.onNouveauLot  ⚠️ LE PLATEAU PRODUIT SON LOT
 *        LUI-MÊME et le REMONTE — il ne le demande pas. Sans ça, le premier
 *        `ROLL` passerait par le shell, déclencherait un redessin, et le
 *        joueur devrait presser deux fois pour voir une animation. Le shell
 *        se contente de le RANGER dans `state`, SANS redessiner.
 * @param {()=>void} o.onClear       remet les tirages à zéro
 */
export function renderTray({ lot: lotInitial, revele = 0, onRevele, onNouveauLot, onClear }) {
  const dalle = el("section", "tray dalle-majeure");
  dalle.style.setProperty("--tray-ecart", `${REGLAGES.ecart}px`);

  /* ── La rangée des boutons, SEULE sur sa ligne (choix A d'Eric) ────── */
  const barre = el("div", "tray-boutons");
  const bouton = (libelle, classe, onClick) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = `tray-bouton ${classe}`;
    b.textContent = libelle;
    b.addEventListener("click", onClick);
    return b;
  };
  let lot = lotInitial;
  const total = 10;   // la méthode d'Eric : dix jets, toujours
  const reste = total - revele;

  const roll = bouton("ROLL", "tray-roll", () => sequence(1));
  const roll10 = bouton(`ROLL ${total}`, "tray-roll10", () => sequence(reste || total));
  const clear = bouton("CLEAR", "tray-clear", () => { annule = true; onClear(); });
  barre.append(roll, roll10, clear);
  dalle.append(barre);

  /* ── Le plateau : trois dés, au centre ─────────────────────────────── */
  const hote = el("div", "tray-des");
  dalle.append(hote);

  /* ── Les dix cases, créées vides et remplies par la révélation ─────── */
  const rangee = el("ol", "tray-cases");
  const cases = Array.from({ length: total }, (_, i) => {
    const c = caseDeResultat(i + 1);
    rangee.append(c);
    return c;
  });
  dalle.append(rangee);

  /* ── L'ÉTAT DÉJÀ DÉCOUVERT, repeint sans animation ─────────────────── */
  if (lot) {
    for (let i = 0; i < revele; i += 1) ecrisCase(cases[i], lot.rolls[i], lot, revele);
    if (revele > 0) poserLesDes(hote, lot.rolls[revele - 1].dice, false);
  }

  /* ══ LA SÉQUENCE — elle écrit à la main, elle ne redessine JAMAIS ════
     Un `refresh()` ici tuerait les canvas en plein vol. On touche des nœuds
     qui existent déjà, exactement comme le scrollspy touche un attribut. */
  let enCours = false;
  let annule = false;

  async function sequence(combien) {
    if (enCours) return;
    /* Premier ROLL : on produit le lot ICI, on le remonte, et on enchaîne
       dans la foulée. `rollAbilitySet` applique déjà la règle de relance —
       le lot arrive donc valide, dix jets, relance résolue. */
    if (!lot) {
      lot = rollAbilitySet(Math.random);
      onNouveauLot(lot);
    }
    enCours = true; annule = false;
    roll.disabled = roll10.disabled = true;
    for (let n = 0; n < combien; n += 1) {
      if (annule || revele >= total) break;
      const jet = lot.rolls[revele];
      poserLesDes(hote, jet.dice, true);
      revele += 1;
      ecrisCase(cases[revele - 1], jet, lot, revele);
      onRevele(revele);
      /* La pause d'Eric COURT PENDANT l'animation (960 ms) : 2 500 ms de
         cadence, pas 2 500 de plus. Dix jets ≈ 25 s, ce qu'il a voulu. */
      await attendre(REGLAGES.pauseMs);
    }
    enCours = false;
    if (roll.isConnected) roll.disabled = roll10.disabled = false;
  }

  function attendre(ms) {
    return new Promise((ok) => {
      const t = setTimeout(ok, ms);
      /* CLEAR « même en plein milieu » (Eric) : le minuteur doit être
         ANNULABLE, sinon la salve continue après la remise à zéro. */
      minuteurs.push(() => { clearTimeout(t); ok(); });
    });
  }
  const minuteurs = [];
  dalle.addEventListener("tray:stop", () => { annule = true; minuteurs.forEach((f) => f()); });

  return dalle;
}

/** Écrit UNE case — et remet à jour les « barrés », qui ne se connaissent
 *  qu'une fois les dix découverts (les six gardés se décident sur le lot
 *  entier, pas au fil de l'eau). */
function ecrisCase(box, jet, lot, revele) {
  box.dataset.etat = "plein";
  box.querySelector(".tray-case-total").textContent = String(jet.total);
  box.title = jet.dice.join(" + ");
  if (revele < lot.rolls.length) return;
  const rangee = box.parentElement;
  lot.rolls.forEach((r, i) => {
    const c = rangee.children[i];
    if (c) c.dataset.garde = String(r.kept);
  });
}

export const ROLL_DURATION_MS = rollDurationMs;
