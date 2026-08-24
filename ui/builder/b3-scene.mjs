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

import { SCENE, JETON, BOITES, COLLECTEUR, ENVOI, BOURSE, POIDS, BARRE, CORPS_EN_SCENE }
  from "./b3-disposition.mjs?v=288";
import { CORPS } from "./b3-ancrages.mjs?v=288";

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

  const noeud = forme("svg", "b3-scene", {
    viewBox: `0 0 ${SCENE.l} ${SCENE.h}`, width: SCENE.l, height: SCENE.h,
    "aria-label": "Le dressing — GEAR",
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
      m.append(forme("image", null, { href: `./assets/${c.image}?v=288`,
        x: c.x, y: c.y, width: c.largeur, height: c.hauteur }));
      defs.append(m);
    }
    noeud.append(defs);

    noeud.append(forme("rect", "b3-scene-cadre",
      { x: .75, y: .75, width: SCENE.l - 1.5, height: SCENE.h - 1.5, rx: 8 }));

    /* Le corps — un repère en filigrane, SECOND PLAN, grossi sur place. */
    const { k, dx, dy } = CORPS_EN_SCENE;
    const port = forme("g", null, { transform:
      `translate(198.5 271.5) scale(${echelle}) translate(-198.5 -271.5) translate(${dx} ${dy}) scale(${k})` });
    port.append(forme("rect", "b3-scene-corps",
      { x: 0, y: 0, width: 1000, height: 1600, mask: `url(#b3s-masque-${corps === "f" ? "f" : "h"})` }));
    noeud.append(port);

    noeud.append(texte("b3-titre", SCENE.l / 2, 20, "GEAR", "middle"));

    for (const b of BOITES) {
      const l = b.l || JETON.l;
      const x = b.centre ? (SCENE.l - l) / 2 : b.x;
      if (b.double) {
        /* La PAIRE du torse : deux jetons PLEINS de 87, séparés de `ecart`
           (« 4 pixels entre torso 1 et 2 », Eric) — pas une boîte fendue. */
        const g = b.ecart || 0;
        const l1 = (l - g) / 2;
        for (const [dxp, nom] of [[0, b.nom], [l1 + g, b.double]]) {
          noeud.append(forme("rect", "b3-boite-scene",
            { x: x + dxp, y: b.y, width: l1, height: JETON.h, rx: 6 }));
          noeud.append(texte("b3-nom", x + dxp + 5, b.y + 12, nom));
        }
        noeud.append(forme("circle", "b3-attune", { cx: x - 5, cy: b.y + 5, r: 3 }));
        noeud.append(forme("circle", "b3-attune", { cx: x + l + 5, cy: b.y + 5, r: 3 }));
        continue;
      }
      const r = forme("rect", "b3-boite-scene",
        { x, y: b.y, width: l, height: JETON.h, rx: 6 });
      if (b.optionnelle) r.dataset.optionnelle = "oui";
      noeud.append(r);
      noeud.append(texte("b3-nom", x + 5, b.y + 12, b.nom));
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
      noeud.append(texte("b3-info-texte", cx + (pas - 5) / 2, BOURSE.y + 24, mon, "middle"));
      noeud.append(forme("rect", "b3-envoi",  { x: cx, y: BOURSE.y + 29, width: pas - 5, height: 13, rx: 2 }));
      noeud.append(forme("rect", "b3-bouton", { x: cx, y: BOURSE.y + 46, width: pas - 5, height: 13, rx: 2 }));
      noeud.append(texte("b3-info-texte", cx + (pas - 5) / 2, BOURSE.y + 55, "+", "middle"));
      noeud.append(forme("rect", "b3-typein", { x: cx, y: BOURSE.y + 63, width: pas - 5, height: 13, rx: 2 }));
      noeud.append(forme("rect", "b3-bouton", { x: cx, y: BOURSE.y + 80, width: pas - 5, height: 13, rx: 2 }));
      noeud.append(texte("b3-info-texte", cx + (pas - 5) / 2, BOURSE.y + 89, "−", "middle"));
    });
    noeud.append(texte("b3-info-texte", BOURSE.x + 8, BOURSE.y + 112, "Total in GP"));
    noeud.append(forme("rect", "b3-envoi",
      { x: BOURSE.x + 62, y: BOURSE.y + 103, width: 40, height: 13, rx: 2 }));

    noeud.append(forme("rect", "b3-info",
      { x: POIDS.x, y: POIDS.y, width: POIDS.l, height: POIDS.h, rx: 4 }));
    noeud.append(texte("b3-nom", POIDS.x + POIDS.l / 2, POIDS.y + 12, "Gear weight", "middle"));
    POIDS.lignes.forEach((ligne, i) => {
      noeud.append(texte("b3-info-texte", POIDS.x + 6, POIDS.y + 25 + i * 11, ligne));
    });

    /* La barre — le seul geste branché de la scène : `surBouton(mot)`. */
    BARRE.noms.forEach((nom, i) => {
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
