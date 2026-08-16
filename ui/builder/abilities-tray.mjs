/* ══ LE PLATEAU DE DÉS D'ABILITIES — croquis B d'Eric, 2026-08-15 ═══════
   La dalle MAJEURE de l'écran Abilities : trois dés 3D, quatre boutons et les
   dix résultats numérotés dont quatre barrés.

   ⌨️ LE TITRE ET LES QUATRE LIBELLÉS SONT D'ERIC (2026-08-15, après avoir vu
   l'écran sur son iPhone SE) : titre **`Roll Options`, centré**, et les
   boutons **centrés** — `3d6` · `10x3D6` · `Flash` · `Reset`.
   ⚠️ Sa liste est POSTÉRIEURE aux précédentes (`CLEAR` du croquis B, puis
   `roll 3d6`/`roll 10 x 3d6`/`flash roll`/`reset`) : c'est elle qui vaut.
   📌 Il écrit `3d6` en minuscule et `10x3D6` en majuscule ; on recopie ses
   chaînes telles quelles plutôt que d'uniformiser — un libellé est à lui.

   ══ 📏 LA LARGEUR, ET LES DEUX FAUTES DE MESURE QU'ELLE A COÛTÉES ═══════

   ⛔ **LA LARGEUR UTILE N'EST PAS 312, ELLE EST 294.** Mesurée dans la page,
   pas déduite du gabarit : `.tray` fait 310 de large à 360 de fenêtre, moins
   son rembourrage de 8×2 → **294**.

   ⛔ **ET UN BOUTON COÛTE SA BORDURE** : 1 px de chaque côté, soit +8 px sur
   les quatre. Oubliés dans le premier calcul.

   Les deux ensemble ont produit un débordement VISIBLE sur l'iPhone SE
   d'Eric — `Reset` coupé au bord droit :

     anciens libellés · T3 : 216,4 (texte) + 64 (rembourrage) + 12 (gouttières)
                             + 8 (bordures) = 300,4  sur 294  →  ❌ déborde de 6,4
     libellés d'Eric  · T3 : 146   + 64 + 12 + 8      = 230    sur 294  →  ✅ 64 de reste

   📌 LA FORME DE LA FAUTE, ET C'EST LA TROISIÈME DE LA SÉANCE : avoir pris le
   nombre THÉORIQUE du gabarit (312) pour la mesure, et oublié un terme
   (les bordures). Le gabarit dit lui-même que ses largeurs sont mesurées « au
   measureText, jamais estimées » — mais la boîte qui les reçoit, elle, n'avait
   jamais été mesurée.
   ⭐ Le remède tenu ici : les 64 px de reste laissent les boutons CENTRÉS à
   leur largeur naturelle, sans jamais s'étirer ni se comprimre.

   ⚠️ CORRECTION D'UNE MESURE FAUSSE, plus tôt le même jour. Cet en-tête
   annonçait `roll 10 x 3d6` à **93 px en T2** et concluait « T3 ne passe dans
   AUCUNE combinaison », en assumant un écart au gabarit. Repris au
   `measureText` : T2 → 69,6 · T3 → 79,3 · T4 → 88,8. **Le 93 correspond à du
   16 px** — la mesure avait été prise au mauvais barreau, et une exception
   documentée et argumentée s'est construite dessus.

   ⭐ Les 44 px de cible tactile restent intacts en hauteur.

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

import { mount, createDieHost, rollDurationMs } from "./dice3d.mjs?v=37";
import { rollThreeD6, markKept, rollAbilitySet } from "./dice.mjs?v=37";
import { swapContent } from "./socle.mjs?v=37";

/* Les réglages d'Eric, mesurés sur son iPhone SE le 2026-08-15.
   ⛔ Pas de valeur en dur ailleurs : c'est ici ou nulle part. */
export const REGLAGES = {
  tailleMobile: 72,
  tailleBureau: 82,
  ecart: 4,
  pauseMs: 2500,   // « pause 2500 bien » — il a essayé 2000 et a préféré plus lent
  /* ⚡ FLASH ROLL — Eric, 2026-08-15 : « on voit le résultat et c'est tout,
     on ne voit pas le process et les erreurs ».
     ⚠️ CORRECTION D'UNE SUR-LECTURE DE L'ARCHITECTE : j'avais lu « flash »
     comme « vite mais visible », et argumenté que cacher les jets
     contredirait son « je veux qu'il voie ». Faux — les deux coexistent : il
     VEUT voir, et il veut AUSSI pouvoir ne pas voir. Ce sont deux modes, pas
     deux principes qui s'excluent. Le joueur choisit s'il regarde. */
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
  /* ⛔ PAS DE STYLE EN LIGNE ICI — l'écart des dés vit dans `shell.css`
     (`--tray-ecart`). Le DOM des tests (`tests/dom-stub.mjs`) n'a pas de
     `.style` : un `setProperty` posé AU RENDU faisait tomber seize tests
     d'un coup, pour du décor. Le décor va dans la feuille, toujours.
     📌 `REGLAGES.ecart` reste la valeur d'Eric et reste ici : c'est le
     fichier qui la porte, et la feuille la recopie sous son nom. */

  /* ── Le titre, centré (Eric, 2026-08-15, vu sur son iPhone SE) ─────── */
  dalle.append(el("h3", "tray-titre", [texte("Roll Options")]));

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

  const roll = bouton("3d6", "tray-roll", () => sequence(1));
  const roll10 = bouton(`${total}x3D6`, "tray-roll10", () => sequence(reste || total));
  const flash = bouton("Flash", "tray-flash", () => flashRoll());
  const reset = bouton("Reset", "tray-reset", () => { annule = true; onClear(); });
  barre.append(roll, roll10, flash, reset);
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

  /* ── ⭐ UN LOT RANGÉ DANS `state` EST TOUJOURS FINI ────────────────────
     `revele` ne décrit qu'une salve EN COURS — jamais ce qu'on affiche. Un
     lot qui arrive par les props a fini de tomber (le plateau ne le remonte
     qu'au dixième jet, ou d'un coup au flash), donc **il se peint entier**,
     ses six gardés compris. Peindre `revele` cases était la quatrième
     tentative de branchement : au premier redessin — une assignation, un
     tour de molette — la moitié des dix disparaissait.

     ⭐ ET LES TROIS DÉS REPRENNENT LA POSE DU DERNIER JET. `animate: false`
     est fait pour ça, mot pour mot : *« le dé prend la POSE du résultat,
     sans tomber »*. Un redessin ne rejoue donc AUCUNE animation — c'est la
     seule règle qui compte ici, et elle tient.

     ⚠️ CETTE LIGNE AVAIT ÉTÉ RETIRÉE SOUS UNE FAUSSE RÈGLE. « Les dés ne
     naissent que d'un GESTE, jamais au rendu » venait d'un `TypeError` de
     `createDieHost` sous le DOM de test — lequel n'avait pas de `.style`,
     alors que le moteur y pose la taille CALCULÉE de chaque dé. Une limite
     du stub habillée en principe. Mesuré depuis : avec un `.style` honnête,
     `createDieHost` et `mount` passent, et `mount` dégrade proprement sans
     navigateur (c'est son repli prévu quand WebGL manque).

     📌 Deuxième fois dans la même séance qu'une règle bien argumentée repose
     sur une mesure fausse — après « T3 ne passe dans aucune combinaison ».
     Le coût de ne pas la reprendre : le joueur jetait, l'écran se redessinait
     pour lui montrer où poser ses dés, et les dés disparaissaient. */
  if (lot) {
    ecrisMention(mention, lot);
    lot.rolls.forEach((jet, i) => { if (cases[i]) ecrisCase(cases[i], jet); });
    peinsLesGardes(cases, lot);
    const dernier = lot.rolls[lot.rolls.length - 1];
    /* ⛔ `standardArrayBatch` porte des jets SANS dés (`dice: []`) : il n'a
       rien à poser, et le plateau ne le sert pas de toute façon. */
    if (dernier && dernier.dice && dernier.dice.length) poserLesDes(hote, dernier.dice, false);
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
    roll.disabled = roll10.disabled = flash.disabled = true;
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
      ecrisCase(cases[revele - 1], jet);
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
    if (roll.isConnected) roll.disabled = roll10.disabled = flash.disabled = false;
  }

  /* ⚡ LE FLASH — aucun dé ne roule, aucune erreur ne s'annonce.
     `rollAbilitySet` boucle EN INTERNE sur la règle de relance : c'est
     exactement ce qu'on veut ici, et exactement ce qu'on refusait dans les
     deux autres modes. Le lot arrive fait, les dix cases se remplissent d'un
     coup, et les trois dés prennent la POSE du dernier jet sans tomber. */
  function flashRoll() {
    if (enCours) return;
    lot = rollAbilitySet(Math.random);
    tentative = [...lot.rolls];
    revele = 10;
    videLesCases(cases);
    lot.rolls.forEach((jet, i) => ecrisCase(cases[i], jet));
    peinsLesGardes(cases, lot);
    mention.hidden = true;              // ⛔ « on ne voit pas les erreurs »
    delete mention.dataset.echec;
    poserLesDes(hote, lot.rolls[9].dice, false);
    onNouveauLot(lot);
    onRevele(10);
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

/** Écrit UNE case : son total et sa provenance, rien d'autre.
 *
 *  🔴 ELLE NE DÉCIDE PLUS DES GARDÉS, ET C'EST LA CORRECTION DU LOT. La
 *  version d'avant prenait un `lot` et un `revele` pour repeindre les six
 *  retenus quand la dixième case tombait — mais ses TROIS appelants lui
 *  passaient `lot: null`, et elle lisait `lot.rolls.length` à la ligne
 *  suivante. **`TypeError` sur le premier dé, dans les trois modes.** Le
 *  module n'avait jamais tourné : rien ne l'appelait, donc rien ne l'a dit.
 *
 *  📌 La forme de la faute : une fonction qui fait DEUX choses (écrire une
 *  case · trancher sur le lot entier) n'a pas de signature honnête — l'une
 *  des deux finit appelée avec les paramètres de l'autre. Les six gardés se
 *  décident sur le lot entier ; c'est `peinsLesGardes` qui les peint, et
 *  elle seule. Une brique, un écrivain. */
function ecrisCase(box, jet) {
  box.dataset.etat = "plein";
  box.querySelector(".tray-case-total").textContent = String(jet.total);
  box.title = jet.dice.join(" + ");
}

export const ROLL_DURATION_MS = rollDurationMs;
