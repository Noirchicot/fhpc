/* ══ LE PLATEAU DE DÉS D'ABILITIES — croquis B d'Eric, 2026-08-15 ═══════
   La dalle MAJEURE de l'écran Abilities : trois dés 3D, `ROLL` / `ROLL 10` /
   `CLEAR`, et les dix résultats numérotés dont quatre barrés.

   ══ CE QUI A DÉCIDÉ DE LA FORME ════════════════════════════════════════

   🔴 LE JOUEUR VOIT LES LOTS RATÉS — Eric, 2026-08-15 : *« il doit voir le
   process, je veux qu'il voie »*. Le plateau tire DIX jets, les révèle un par
   un ; si aucun n'atteint 15, il le DIT, balaie, et recommence. La règle
   (ADDENDUMS §4) reste intacte — le lot entier est rejeté, jamais un jet
   remplacé seul, jamais un jet complété.

   📏 ET C'EST FRÉQUENT, MESURÉ : `P(3d6 ≥ 15) = 20/216`, donc un lot de dix
   échoue avec `p = 0,907¹⁰ ≈ 0,379` — **près de deux sur cinq**. Cacher ça
   jetterait la tension même de l'écran : *est-ce que l'un des dix touchera
   15 ?* ⚠️ Contrepartie assumée : un lot raté coûte une salve entière. À la
   cadence d'Eric (2 500 ms), c'est ~25 s par échec.

   ⛔ ON N'UTILISE DONC NI `rollAbilitySet` NI `rollTen`. La première boucle
   en interne et ne rend que le lot gagnant — ce qu'Eric refuse de cacher. La
   seconde tire les dix D'UN COUP, et c'est l'objection suivante d'Eric :
   *« ça remet en question le hasard, même s'il existe et que la temporalité
   est différée »*.

   ⭐ ET IL A RAISON, PAS SUR LES PROBABILITÉS MAIS SUR LA CONFIANCE. Un
   résultat tiré d'avance et un tiré en direct ont la même distribution ; le
   joueur ne peut pas les distinguer. Mais un dé qui roule doit DÉCIDER, pas
   rejouer une décision déjà prise — sinon l'animation est une
   reconstitution.

   🔴 CHAQUE 3d6 EST DONC TIRÉ À L'INSTANT OÙ SES DÉS QUITTENT LA MAIN
   (`rollThreeD6`, juste avant `poserLesDes`). Rien n'est décidé d'avance.
   ⛔ Et la règle tient : *« jamais un jet complété »* interdit de RÉPARER un
   lot raté — d'y ajouter un onzième jet, d'en remplacer le pire. Elle ne dit
   rien du moment où les dix naissent. Le lot reste dix jets, rejeté en
   entier, jamais rapiécé.

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
import { rollThreeD6, markKept } from "./dice.mjs?v=1";
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

  /* ── LA MENTION DE RELANCE ─────────────────────────────────────────
     ✅ TRANCHÉ PAR ERIC, 2026-08-15 : « le joueur est informé de l'échec des
     dix jets ». INFORMÉ, pas spectateur — on ne lui rejoue pas les lots
     rejetés, ce qui coûterait 25 s de théâtre à jeter par échec. La mention
     dit ce qui s'est passé, et pourquoi.
     📌 Le nœud existe DÈS LE DÉPART, vide : la séquence l'écrit à la main,
     comme les cases, sans jamais reconstruire la dalle. */
  const mention = el("p", "tray-relance");
  mention.hidden = true;
  dalle.append(mention);

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
    ecrisMention(mention, lot);
    for (let i = 0; i < revele; i += 1) ecrisCase(cases[i], lot.rolls[i], lot, revele);
    if (revele > 0) poserLesDes(hote, lot.rolls[revele - 1].dice, false);
  }

  /* ══ LA SÉQUENCE — elle écrit à la main, elle ne redessine JAMAIS ════
     Un `refresh()` ici tuerait les canvas en plein vol. On touche des nœuds
     qui existent déjà, exactement comme le scrollspy touche un attribut. */
  let enCours = false;
  let annule = false;

  /** Le lot courant en cours de révélation, et le compte des rejetés. */
  let tentative = lot ? [...lot.rolls] : null;
  let rejetes = lot ? (lot.rerollCount || 0) : 0;

  async function sequence(combien) {
    if (enCours) return;
    enCours = true; annule = false;
    roll.disabled = roll10.disabled = true;
    let faits = 0;
    while (faits < combien && !annule) {
      if (!tentative) { tentative = []; videLesCases(cases); revele = 0; }
      /* 🔴 LE TIRAGE SE FAIT ICI, une ligne avant l'animation — pas dix jets
         plus tôt. C'est la réponse à l'objection d'Eric sur le hasard
         différé : les dés décident en tombant. */
      const jet = rollThreeD6(Math.random);
      tentative.push(jet);
      poserLesDes(hote, jet.dice, true);
      revele += 1; faits += 1;
      ecrisCase(cases[revele - 1], jet, null, revele);
      await attendre(REGLAGES.pauseMs);
      if (annule) break;
      if (revele < 10) continue;

      /* ── LE DIXIÈME EST TOMBÉ : la règle se prononce ────────────────
         ⛔ Elle porte sur le LOT, jamais sur un jet — c'est pour ça qu'on
         ne peut la lire qu'ici, et jamais au fil de l'eau. */
      if (tentative.some((r) => r.total >= 15)) {
        lot = { rolls: markKept(tentative), rerollCount: rejetes };
        peinsLesGardes(cases, lot);
        ecrisMention(mention, lot);
        onNouveauLot(lot);
        onRevele(10);
        break;
      }
      rejetes += 1;
      annonceEchec(mention, rejetes);
      await attendre(REGLAGES.pauseMs);
      tentative = null;              // un lot neuf au tour suivant
      if (combien === 1) break;      // ROLL simple : on s'arrête sur l'annonce
      faits = 0;                     // ROLL 10 : la salve recommence entière
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

/** Remet les dix cases à vide — un lot rejeté disparaît de l'écran, il ne
 *  se garde nulle part (Eric, 2026-08-13 : aucun historique). */
function videLesCases(cases) {
  for (const c of cases) {
    c.dataset.etat = "vide";
    delete c.dataset.garde;
    c.querySelector(".tray-case-total").textContent = "—";
    c.removeAttribute("title");
  }
}

/** Les six gardés, une fois les dix connus. */
function peinsLesGardes(cases, lot) {
  lot.rolls.forEach((r, i) => { if (cases[i]) cases[i].dataset.garde = String(r.kept); });
}

/** L'annonce d'un lot rejeté, PENDANT la séquence — c'est elle que le joueur
 *  doit voir (Eric : « je veux qu'il voie »). */
function annonceEchec(node, rejetes) {
  node.hidden = false;
  node.dataset.echec = "true";
  node.textContent = rejetes === 1
    ? "None of the ten reached 15 — the whole set is discarded. Rolling again."
    : `None of the ten reached 15 — set ${rejetes} discarded. Rolling again.`;
}

/** La mention de relance. ⛔ ELLE NE S'AFFICHE QUE S'IL Y A EU RELANCE :
 *  une ligne permanente qui dirait « 0 relance » serait du bruit, et la
 *  dalle en paierait la hauteur sur tous les jets normaux. */
function ecrisMention(node, lot) {
  const n = lot.rerollCount || 0;
  delete node.dataset.echec;
  node.hidden = n === 0;
  if (n === 0) return;
  node.textContent = n === 1
    ? "One set of ten was discarded: none of its rolls reached 15. These are the dice you keep."
    : `${n} sets of ten were discarded: none of their rolls reached 15. These are the dice you keep.`;
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
