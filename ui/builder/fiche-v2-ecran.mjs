/* ══ LA FICHE V2 — la maquette de la fiche de jeu, lot 395 ═══════════════════
   ⚖️ Eric, 2026-10-05 → 07 : la fiche de personnage V2, dessinée au croquis puis cotée au blg
   en dix révisions (vault : `FH-WEB/FHPC/Plan-fiche-V2/`). Le 07/10 : *« peux-tu implémenter
   à l'emplacement Sheet dans le builder ? »*, puis, à la question du périmètre :
   **« Maquette seule »**.

   ── CE QUE CE MODULE FAIT, ET CE QU'IL NE FAIT PAS ─────────────────────────
   Il PEINT la fiche du plan, organe par organe, à son `x`/`y` du plan — les mots sont ceux
   du plan (Yedrivel, STR 12, HP 30/30…). ⛔ Il ne lit NI le document NI le moteur : c'est
   une maquette, et elle le dit (`data-maquette`). ⛔ Il ne pose aucun geste sur ses organes,
   sauf UN : la lune du mode Live, qui ramène à l'ancien belt. Un bouton de maquette qui
   ferait semblant d'agir serait le « faux magasin » de B9.5 — ils sont donc PEINTS comme des
   boutons (même famille, même relief) mais ce ne sont pas des `<button>`.

   ── LES DEUX MODES ─────────────────────────────────────────────────────────
   · **aperçu** — Eric : *« quand on appuie sur Sheet, on garde encore l'ancien belt. La fiche
     est réduite de 10 % »*. La fiche SANS son tambour (le belt du builder est au-dessus),
     à l'échelle 0,9 : 337,5 × 464,4, centrée dans la scène.
   · **live** — *« la vraie fiche en jeu avec le nouveau belt qui remplace l'ancien »* : la
     fiche entière, 375 × 560, son tambour en haut. *« La lune sera inversée dans ce nouveau
     belt, majoritairement jour, un croissant de nuit. Rappuyer sur celle-ci ramène à l'ancien
     belt. »* C'est la COQUILLE qui retire l'ancien belt (`paintBelt`) : ce module ne la
     connaît pas.

   🔴 TOUTE LA GÉOMÉTRIE VIENT DE `fiche-v2-disposition.mjs`, GÉNÉRÉ (`fiche_gen.py` →
   `fiche_cotes.json` → `fiche_declaration.js`). ⛔ Aucun nombre ne s'écrit ici. Les positions
   sortent dans une feuille construite depuis la table (le garde 7 interdit `.style`) ;
   `shell.css` ne porte que l'HABIT — et l'habit vient du site : `dalle-intermediaire` (50 %),
   `dalle-simple` (35 %), `--dalle-cran` (20 %), la famille des boutons. ⛔ Aucune valeur de
   voile recopiée (`cadre-regle-par-ressemblance-nomme-sa-source`). */

import { PANNEAU, BELT_H, APERCU, HUB_BOUTONS, ORGANES } from "./fiche-v2-disposition.mjs?v=944";

function eld(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

const px = (v) => `${Math.round(v * 1000) / 1000}px`;

/** L'habit de chaque sorte du plan — une CLASSE du site quand le site en a une, sinon une
 *  sorte que `shell.css` habille avec des jetons. ⭐ Les voiles se lisent ici d'un coup d'œil :
 *  50 % (dalles, tuile posée), 35 % (gros affichages), 20 % (tuiles au repos). */
export const HABIT = Object.freeze({
  "dalle-fiche": "dalle-intermediaire",
  "onglet-actif": "dalle-intermediaire",
  "affichage": "dalle-simple",
  "bouton": "fiche-v2-bouton",
  "rond-bouton": "fiche-v2-bouton"
});

/** Les organes du TAMBOUR — le belt de la fiche. Absents de l'aperçu : le belt du builder
 *  est au-dessus (Eric : « on garde encore l'ancien belt »). */
export const estDuBelt = (o) => o.groupe === "Belt";

/** La feuille qui pose chaque organe à sa place du plan. Exportée pour le garde : il la relit
 *  contre la table. Un organe `i` porte `data-organe="i"` (son rang dans `ORGANES`) ; l'aperçu
 *  remonte tout de la hauteur du tambour, puisqu'il ne le peint pas. */
export function feuilleDeLaFicheV2() {
  const regles = [];
  ORGANES.forEach((o, i) => {
    regles.push(`.fiche-v2 > [data-organe="${i}"]{left:${px(o.x)};top:${px(o.y)};` +
      `width:${px(o.l)};height:${px(o.h)}}`);
  });
  /* 🌗 LA LUNE DU LIVE pose sa CIBLE (0 → 44) et son dessin en creux, comme la lune de Gear
     (lot 325 : les quatre écarts réels du plan, jamais un bord symétrique supposé). */
  ORGANES.forEach((o, i) => {
    if (o.sorte !== "lune" || !o.cible) return;
    const c = o.cible;
    const bords = [o.y - c.y, (c.x + c.l) - (o.x + o.l), (c.y + c.h) - (o.y + o.h), o.x - c.x];
    regles.push(`.fiche-v2 > .fiche-v2-lune[data-organe="${i}"]{left:${px(c.x)};top:${px(c.y)};` +
      `width:${px(c.l)};height:${px(c.h)};border-width:${bords.map(px).join(" ")}}`);
  });
  regles.push(`.fiche-v2{width:${px(PANNEAU.l)};height:${px(PANNEAU.h)}}`);
  regles.push(`.fiche-v2-liste{left:${px(0)};top:${px(APERCU.y)};width:${px(PANNEAU.l)};height:${px(APERCU.h)}}`);
  /* ⭐ L'APERÇU : la fiche à 0,9, remontée de son tambour (44 × 0,9), dans une fenêtre qui la
     coupe exactement à 337,5 × 464,4. */
  regles.push(`.fiche-v2-apercu{left:${px(APERCU.x)};top:${px(APERCU.y)};` +
    `width:${px(APERCU.l)};height:${px(APERCU.h)}}`);
  regles.push(`.fiche-v2-apercu > .fiche-v2{scale:${APERCU.echelle};top:${px(-BELT_H * APERCU.echelle)}}`);
  HUB_BOUTONS.forEach((b) => {
    regles.push(`.fiche-v2-hub > [data-hub="${b.id}"]{left:${px(b.x)};top:${px(b.cible.y)};` +
      `width:${px(b.l)};height:${px(b.cible.h)};` +
      `border-width:${px(b.y - b.cible.y)} 0 ${px(b.cible.y + b.cible.h - b.y - b.h)} 0}`);
  });
  return regles.join("\n");
}

/** Les lignes de texte d'un organe — chacune porte son CRAN (`t0`…`t3`) et sa graisse ; la
 *  feuille les traduit en `var(--tN)`, jamais en pixels. L'ancre dit la mise en page :
 *  `start`/`car`/`end` sur une ligne (une compétence), ou une seconde ligne (le stream). */
function lignesDe(o) {
  const lignes = o.lignes || [];
  return lignes.map((l) => {
    const s = eld("span", "fiche-v2-mot", l.mot);
    s.dataset.cran = l.cran;
    s.dataset.graisse = String(l.graisse);
    if (l.ancre) s.dataset.ancre = l.ancre;
    if (l.ligne) s.dataset.ligne = String(l.ligne);
    return s;
  });
}

/** Un organe de la maquette : une boîte posée, son habit, ses mots. ⛔ Jamais un `<button>`
 *  (voir la tête) — sauf la lune du Live, posée à part. */
function organe(o, i) {
  const n = eld("div", ["fiche-v2-organe", HABIT[o.sorte]].filter(Boolean).join(" "));
  n.dataset.organe = String(i);
  n.dataset.sorte = o.sorte;
  if (o.forme === "rond") n.dataset.forme = "rond";
  if (o.lignes && o.lignes.some((l) => l.ancre)) n.dataset.disposition = o.lignes.some((l) => l.ligne) ? "stream" : "ligne";
  n.setAttribute("aria-hidden", "true");
  n.append(...lignesDe(o));
  return n;
}

/**
 * La fiche, dans l'un de ses deux modes.
 * @param {object} [options]
 * @param {"apercu"|"live"} [options.mode]   l'aperçu de Sheet, ou la fiche en jeu
 * @param {() => void} [options.surLune]      Live : la lune ramène à l'ancien belt
 * @returns {HTMLElement}
 */
export function construireLaFicheV2(options = {}) {
  const mode = options.mode === "live" ? "live" : "apercu";
  const fiche = eld("section", "fiche-v2");
  fiche.dataset.maquette = "true";
  fiche.dataset.mode = mode;
  ORGANES.forEach((o, i) => {
    if (mode === "apercu" && estDuBelt(o)) return;
    /* 🌗 LA LUNE DU LIVE — le seul geste de la maquette. Eric : « rappuyer sur celle-ci ramène
       à l'ancien belt ». ⭐ Inversée : l'image du croissant, retournée par un filtre — jour
       majoritaire, un croissant de nuit (`shell.css`, `.fiche-v2-lune`). */
    if (mode === "live" && o.sorte === "lune") {
      const lune = eld("button", "fiche-v2-organe fiche-v2-lune");
      lune.type = "button";
      lune.dataset.organe = String(i);
      lune.dataset.sorte = o.sorte;
      lune.setAttribute("aria-label", "Back to the builder");
      lune.title = "Back to the builder";
      if (options.surLune) lune.addEventListener("click", options.surLune);
      fiche.append(lune);
      return;
    }
    fiche.append(organe(o, i));
  });
  return fiche;
}

/**
 * LE HUB DE SHEET — l'aperçu de la fiche (ou la liste), puis la rangée des boutons.
 * ⚖️ Eric, 07/10 : *« ce qui nous laisse de l'espace pour 3 boutons : "list" : liste actuelle
 * recensant tous les éléments · "manage" : l'expert qui permettra de faire les level up ·
 * "live" : la vraie fiche en jeu »* ; *« l'export peut être un bouton supplémentaire »*.
 * ⭐ `List` est un INTERRUPTEUR : allumé, la liste remplace l'aperçu ; touché encore, l'aperçu
 * revient. `Manage` ouvre la vue experte (le seul « expert » qui existe aujourd'hui), `Export`
 * la fiche HTML — deux verbes que la coquille connaît déjà (`expertView`, `exportHtml`).
 * @param {object} o
 * @param {"fiche"|"liste"} o.vue
 * @param {HTMLElement} [o.liste]      le contenu actuel de Sheet, quand `vue === "liste"`
 * @param {(id: "liste"|"manage"|"live"|"export") => void} o.surBouton
 * @returns {HTMLElement}
 */
export function construireLeHubSheet(o) {
  const hub = eld("section", "fiche-v2-hub");
  hub.dataset.vue = o.vue === "liste" ? "liste" : "fiche";
  const feuille = eld("style");
  feuille.setAttribute("data-fhpc", "fiche-v2");
  feuille.textContent = feuilleDeLaFicheV2();
  hub.append(feuille);
  if (hub.dataset.vue === "liste") {
    const liste = eld("div", "fiche-v2-liste");
    if (o.liste) liste.append(o.liste);
    hub.append(liste);
  } else {
    const fenetre = eld("div", "fiche-v2-apercu");
    fenetre.append(construireLaFicheV2({ mode: "apercu" }));
    hub.append(fenetre);
  }
  for (const b of HUB_BOUTONS) {
    const bouton = eld("button", "fiche-v2-bouton fiche-v2-porte", b.mot);
    bouton.type = "button";
    bouton.dataset.hub = b.id;
    if (b.id === "liste") bouton.dataset.lit = String(hub.dataset.vue === "liste");
    bouton.addEventListener("click", () => o.surBouton && o.surBouton(b.id));
    hub.append(bouton);
  }
  return hub;
}

/** LE LIVE — la fiche entière, sa feuille avec elle. La coquille la pose à la place de tout
 *  (elle retire l'ancien belt) ; la lune la referme. */
export function construireLeLive(o = {}) {
  const live = eld("section", "fiche-v2-live");
  const feuille = eld("style");
  feuille.setAttribute("data-fhpc", "fiche-v2");
  feuille.textContent = feuilleDeLaFicheV2();
  live.append(feuille, construireLaFicheV2({ mode: "live", surLune: o.surLune }));
  return live;
}
