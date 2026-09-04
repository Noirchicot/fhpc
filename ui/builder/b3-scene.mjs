/* ══ LA SCÈNE B3 — LE DRESSING, ET IL N'EN EXISTE QU'UNE ÉCRITURE ════════════
   ⭐ MÊME COUTURE QUE LA CARTE R : le banc (`ecran-b3.html`) et le builder
   (`equipment-step.mjs`) IMPORTENT cette scène — aucun des deux ne la
   redessine. Le banc ne peut donc plus montrer autre chose que le produit.

   ⛔ TOUTE LA GÉOMÉTRIE VIENT DE `b3-disposition.mjs` : ce fichier peint, il
   ne décide d'aucune cote. La scène est rendue à SCENE.l px EXACTEMENT — la
   loi d'Eric (le jeton 87 × 48 partout) fait que 1 unité = 1 px, sur tous
   les écrans : elle se centre, elle ne se dilate pas.

   ⏳ AUCUN CÂBLAGE D'OBJETS : les boîtes sont vides, les pastilles éteintes,
   les compteurs absents. La donnée (`srfh`, champs `slot`/`qty`) arrive avec
   le lot 95. Le seul geste branché : la BARRE — celui qui monte la scène
   reçoit `surBouton(mot)` et décide (le builder : « Equipment » → retour R). */

import { SCENE, SCENE_PIECE, JETON, BOITES, COLLECTEUR, ENVOI, BOURSE, POIDS, BARRE, CORPS_EN_SCENE }
  from "./b3-disposition.mjs?v=527";
import { CORPS } from "./b3-ancrages.mjs?v=527";

const SVG = "http://www.w3.org/2000/svg";

function forme(nom, cl, attrs) {
  const n = document.createElementNS(SVG, nom);
  if (cl) n.setAttribute("class", cl);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}
function texte(cl, x, y, mot, ancre) {
  const t = forme("text", cl, { x, y });
  if (ancre) t.setAttribute("text-anchor", ancre);
  t.textContent = mot;
  return t;
}

/**
 * CONSTRUIT LA SCÈNE DU DRESSING.
 * @param {object} [options]
 * @param {"h"|"f"|"x"} [options.corps]   le filigrane du fond (défaut : monsieur)
 * @param {number} [options.echelle]      taille du corps — défaut : le +20 % ratifié
 * @param {boolean} [options.apercus]     BANC SEULEMENT : de faux ×N pour juger l'allure
 * @param {(mot: string) => void} [options.surBouton]  le clic d'un bouton de la barre
 * @returns {{ noeud: SVGElement, peindre: (o?: {corps?: string, echelle?: number}) => void }}
 */
export function construireLaSceneB3(options = {}) {
  let corps = options.corps || "h";
  let echelle = options.echelle ?? CORPS_EN_SCENE.echelles[0];
  const apercus = Boolean(options.apercus);
  const surBouton = options.surBouton || null;
  /* ⭐ `piece: true` (26/08, trois bandes — NORMES §1 sexies) : la scène se
     rend comme la PIÈCE du flux — SANS titre (absorbé par la bande haute :
     « on ne nomme pas deux fois ») et SANS barre (extraite vers la bande
     basse), cadrée à SCENE_PIECE. ⛔ Par défaut elle reste l'écran d'hier —
     le pilote (equipment-step, gelé sous 5-VISEUR) la monte encore ainsi ;
     le lot 5 fera basculer la couture, pas ce fichier. */
  const piece = Boolean(options.piece);
  const CADRE = piece ? SCENE_PIECE : SCENE;
  /* ⭐ LE CONTENU (pilote, 24/08) : { boites: {clef → {nom, qte}}, bourse,
     poids: {somme, compte}, surBourse(clef, ±1), surLieu(lieu) }. Sans lui la
     scène reste la maquette du banc — mêmes cotes, rien de vivant. */
  const contenu = options.contenu || null;

  const noeud = forme("svg", "b3-scene", {
    viewBox: `0 0 ${CADRE.l} ${CADRE.h}`, width: CADRE.l, height: CADRE.h,
    "aria-label": piece ? "The dressing piece" : "Le dressing — GEAR",
  });

  function peindre(o = {}) {
    if (o.corps) corps = o.corps;
    if (o.echelle !== undefined) echelle = o.echelle;
    noeud.textContent = "";

    /* ⛔ LES MASQUES VIVENT DANS LA SCÈNE (ids préfixés `b3s-`) : le banc
       garde les siens dans l'atelier, et deux SVG sur la même page ne se
       marchent pas sur les ids. Un masque SVG lit la LUMINANCE — les PNG
       d'Eric au fond blanc opaque font exactement ce travail. */
    const defs = forme("defs", null, {});
    for (const [clef, c] of Object.entries(CORPS)) {
      const m = forme("mask", null, { id: `b3s-masque-${clef === "monsieur" ? "h" : "f"}`,
        maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 1000, height: 1600 });
      m.append(forme("image", null, { href: `./assets/${c.image}?v=527`,
        x: c.x, y: c.y, width: c.largeur, height: c.hauteur }));
      defs.append(m);
    }
    noeud.append(defs);

    noeud.append(forme("rect", "b3-scene-cadre",
      { x: .75, y: .75, width: CADRE.l - 1.5, height: CADRE.h - 1.5, rx: 8 }));

    /* Le corps — un repère en filigrane, SECOND PLAN, grossi sur place. */
    const { k, dx, dy } = CORPS_EN_SCENE;
    const port = forme("g", null, { transform:
      `translate(${SCENE.l / 2} 271.5) scale(${echelle}) translate(${-SCENE.l / 2} -271.5) translate(${dx} ${dy}) scale(${k})` });
    port.append(forme("rect", "b3-scene-corps",
      { x: 0, y: 0, width: 1000, height: 1600, mask: `url(#b3s-masque-${corps === "f" ? "f" : "h"})` }));
    noeud.append(port);

    /* ⛔ en mode pièce le mot est absorbé : le TITRE du dressing devient la
       seule chose qui nomme B3 — il ne pourra plus disparaître (Archi 27). */
    if (!piece) noeud.append(texte("b3-titre", SCENE.l / 2, 20, "GEAR", "middle"));

    for (const b of BOITES) {
      const l = b.l || JETON.l;
      const x = b.centre ? (SCENE.l - l) / 2 : b.x;
      const r = forme("rect", "b3-boite-scene",
        { x, y: b.y, width: l, height: JETON.h, rx: 6 });
      if (b.optionnelle) r.dataset.optionnelle = "oui";
      noeud.append(r);
      noeud.append(texte("b3-nom", x + 5, b.y + 12, b.nom));
      const pose = contenu && contenu.boites && contenu.boites[b.clef];
      if (pose) {
        r.dataset.occupe = "oui";
        noeud.append(texte("b3-objet", x + 5, b.y + 28,
          pose.nom.length > 16 ? pose.nom.slice(0, 15) + "…" : pose.nom));
        if (pose.qte > 1) noeud.append(texte("b3-objet", x + 5, b.y + 41, `×${pose.qte}`));
      }
      /* La pastille d'attunement — Eric, 24/08 : « attunements LATÉRAUX
         partout, sauf sur Belt : ce sera SUPÉRIEUR ». Flanc externe pour les
         colonnes (haut du flanc — le ×N tient le mi-hauteur), côté droit pour
         les centrées (le croquis), et le dessus pour la ceinture. */
      if (b.attunable) {
        const aGauche = !b.centre && x + l / 2 < SCENE.l / 2;
        const cx = b.clef === "ceinture" ? x + l / 2 : (aGauche ? x - 5 : x + l + 5);
        const cy = b.clef === "ceinture" ? b.y : b.y + 5;
        noeud.append(forme("circle", "b3-attune", { cx, cy, r: 3 }));
      }
      /* Le compteur ×N des six poches — Pocket : flanc MÉDIAL · Pocket/Sheath :
         flanc LATÉRAL, à mi-hauteur, à cheval sur le bord (Eric, 24/08).
         ⏳ Sans câblage il n'y a rien à compter : seul le banc en montre. */
      if (apercus && b.qte && (b.clef === "poche1" || b.clef === "fourreau3")) {
        const aGauche = x + l / 2 < SCENE.l / 2;
        const cx = b.qte === "medial" ? (aGauche ? x + l + 4 : x - 4)
                                      : (aGauche ? x - 4 : x + l + 4);
        const cy = b.y + JETON.h / 2;
        noeud.append(forme("circle", "b3-qte", { cx, cy, r: 7 }));
        noeud.append(texte("b3-qte-texte", cx, cy + 3, b.clef === "poche1" ? "×3" : "×2", "middle"));
      }
    }

    /* Le collecteur — double lisière, comme le croquis. */
    const xc = (SCENE.l - JETON.l) / 2;
    noeud.append(forme("rect", "b3-collecteur",
      { x: xc, y: COLLECTEUR.y, width: JETON.l, height: JETON.h, rx: 6 }));
    noeud.append(forme("rect", "b3-collecteur",
      { x: xc + 3, y: COLLECTEUR.y + 3, width: JETON.l - 6, height: JETON.h - 6, rx: 4 }));
    noeud.append(texte("b3-nom", SCENE.l / 2, COLLECTEUR.y + 22, "Send", "middle"));
    noeud.append(texte("b3-nom", SCENE.l / 2, COLLECTEUR.y + 33, "collector", "middle"));

    const xe = (SCENE.l - ENVOI.l) / 2;
    noeud.append(forme("rect", "b3-envoi",
      { x: xe, y: ENVOI.y, width: ENVOI.l, height: ENVOI.h, rx: 4 }));
    noeud.append(texte("b3-nom", SCENE.l / 2, ENVOI.y + 13, "Send to ▾", "middle"));

    /* La bourse : valeurs = INFO · +/− = BOUTONS · saisie = TYPE IN. */
    noeud.append(forme("rect", "b3-info",
      { x: BOURSE.x, y: BOURSE.y, width: BOURSE.l, height: BOURSE.h, rx: 4 }));
    noeud.append(texte("b3-nom", BOURSE.x + BOURSE.l / 2, BOURSE.y + 12, "Purse", "middle"));
    /* Les colonnes se partagent la largeur : 4 monnaies aujourd'hui (l'EP
       est morte le 24/08), et la bourse suivrait sans retouche si la liste
       changeait encore. */
    const pas = (BOURSE.l - 10) / BOURSE.monnaies.length;
    BOURSE.monnaies.forEach((mon, i) => {
      const cx = BOURSE.x + 5 + i * pas;
      const clef = mon.toLowerCase();
      noeud.append(texte("b3-info-texte", cx + (pas - 5) / 2, BOURSE.y + 24, mon, "middle"));
      noeud.append(forme("rect", "b3-envoi",  { x: cx, y: BOURSE.y + 29, width: pas - 5, height: 13, rx: 2 }));
      /* la VALEUR vit dans le document — « — » tant que la clef n'est pas posée */
      const v = contenu && contenu.bourse ? contenu.bourse[clef] : undefined;
      noeud.append(texte("b3-info-texte", cx + (pas - 5) / 2, BOURSE.y + 39,
        Number.isInteger(v) ? String(v) : "—", "middle"));
      const plus = forme("g", "b3-barre-bouton", { role: "button", tabindex: 0, "aria-label": `One more ${mon}` });
      plus.append(forme("rect", "b3-bouton", { x: cx, y: BOURSE.y + 46, width: pas - 5, height: 13, rx: 2 }));
      plus.append(texte("b3-info-texte", cx + (pas - 5) / 2, BOURSE.y + 55, "+", "middle"));
      if (contenu && contenu.surBourse) plus.addEventListener("click", () => contenu.surBourse(clef, 1));
      noeud.append(plus);
      /* ⭐ LE TYPE IN DU CROQUIS, BRANCHÉ (Eric, 24/08 : « le type in de la
         bourse peut être utile ») : un vrai champ par monnaie — la valeur
         ABSOLUE, posée d'un coup (gagner 150 po ne se clique pas 150 fois). */
      if (contenu && contenu.surBourseValeur) {
        const fo = forme("foreignObject", null,
          { x: cx, y: BOURSE.y + 63, width: pas - 5, height: 15 });
        const champ = document.createElement("input");
        champ.className = "b3-typein-champ";
        champ.type = "text"; champ.inputMode = "numeric";
        champ.setAttribute("aria-label", `Set ${mon}`);
        champ.addEventListener("change", () => {
          const v = parseInt(champ.value, 10);
          if (Number.isInteger(v) && v >= 0) contenu.surBourseValeur(clef, v);
          else champ.value = "";
        });
        fo.append(champ);
        noeud.append(fo);
      } else {
        noeud.append(forme("rect", "b3-typein", { x: cx, y: BOURSE.y + 63, width: pas - 5, height: 13, rx: 2 }));
      }
      const moins = forme("g", "b3-barre-bouton", { role: "button", tabindex: 0, "aria-label": `One less ${mon}` });
      moins.append(forme("rect", "b3-bouton", { x: cx, y: BOURSE.y + 80, width: pas - 5, height: 13, rx: 2 }));
      moins.append(texte("b3-info-texte", cx + (pas - 5) / 2, BOURSE.y + 89, "−", "middle"));
      if (contenu && contenu.surBourse) moins.addEventListener("click", () => contenu.surBourse(clef, -1));
      noeud.append(moins);
    });
    noeud.append(texte("b3-info-texte", BOURSE.x + 8, BOURSE.y + 112, "Total in GP"));
    noeud.append(forme("rect", "b3-envoi",
      { x: BOURSE.x + 62, y: BOURSE.y + 103, width: 40, height: 13, rx: 2 }));
    if (contenu && contenu.bourse) {
      const b = contenu.bourse;
      const totalGP = (b.pp || 0) * 10 + (b.gp || 0) + (b.sp || 0) / 10 + (b.cp || 0) / 100;
      noeud.append(texte("b3-info-texte", BOURSE.x + 82, BOURSE.y + 113,
        String(Math.round(totalGP * 100) / 100), "middle"));
    }

    noeud.append(forme("rect", "b3-info",
      { x: POIDS.x, y: POIDS.y, width: POIDS.l, height: POIDS.h, rx: 4 }));
    noeud.append(texte("b3-nom", POIDS.x + POIDS.l / 2, POIDS.y + 12, "Gear weight", "middle"));
    POIDS.lignes.forEach((ligne, i) => {
      const lieu = ligne.toLowerCase();
      const y = POIDS.y + 25 + i * 11;
      const mot = contenu && contenu.poids
        ? `${ligne}  ${contenu.poids.compte[lieu] || 0} · ${Math.round((contenu.poids.somme[lieu] || 0) * 10) / 10} lb`
        : ligne;
      const g = forme("g", "b3-barre-bouton", { role: "button", tabindex: 0, "aria-label": `Open ${ligne}` });
      g.append(texte("b3-info-texte", POIDS.x + 6, y, mot));
      if (contenu && contenu.surLieu) g.addEventListener("click", () => contenu.surLieu(lieu));
      noeud.append(g);
    });

    /* La barre — extraite vers la bande basse en mode pièce. */
    if (!piece) BARRE.noms.forEach((nom, i) => {
      const g = forme("g", "b3-barre-bouton", nom ? { role: "button", tabindex: 0, "aria-label": nom } : {});
      g.append(forme("rect", "b3-bouton",
        { x: BARRE.xs[i], y: BARRE.y, width: BARRE.l, height: BARRE.h, rx: 4 }));
      if (nom) g.append(texte("b3-nom", BARRE.xs[i] + BARRE.l / 2, BARRE.y + 20, nom, "middle"));
      if (nom && surBouton) g.addEventListener("click", () => surBouton(nom));
      noeud.append(g);
    });
  }

  peindre();
  return { noeud, peindre };
}
