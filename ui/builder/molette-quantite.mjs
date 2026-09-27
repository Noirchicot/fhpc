/* ══ LA MOLETTE DE QUANTITÉ — l'organe des fiches X1 et X2 — lot 308 ═══════════════════════════
   ⚖️ Eric, 2026-09-27 : *« Dans les fiches x, il faut harmoniser le bouton des quantités, et il faut
   tj que le montant final soit modifié avec l'augmentation en quantité »* · *« un dropdown à 20
   pourrait le faire, existe-t-il un truc plus joli et plus efficace… qui marche aussi bien à la
   souris qu'à la main ; le +/- pour les quantités prend beaucoup de place »* · puis, entre la
   pastille qu'on glisse, la grille et la molette : **« La molette tambour ! »**.
   ⚖️ LE PLAFOND — *« 20 c'est bien »* · *« Partout ailleurs sauf dans x5 »* · *« Pour x5 uniquement
   pas de molette tambour »* : X5 garde son menu Qty ▾ de 1 à 10 (`PLAFOND_QTE`, `craft.mjs`), et
   ⛔ n'importe pas ce module.

   ⭐ CE N'EST PAS UN TROISIÈME TAMBOUR : c'est `roue-tambour.mjs`, le mécanisme du sac et de Wares
   (le ruban qui glisse sous un viseur fixe, les deux cales, le marquage du cran dominant, l'aimant
   au tap). Ce module lui donne ce que le tambour laisse à ses appelants — ce qu'un cran EST (un
   nombre), les deux chevrons, et l'écoute du geste — exactement comme `wares-ecran.mjs` le fait
   pour ses deux étages. Et la PEAU est celle de leurs crans : `.molette-cran` entre dans les
   listes de `.sac-cran, .wares-cran` (`shell.css`), ⛔ elle ne se redessine pas.

   ⚖️ LES GESTES — *« qui marche aussi bien à la souris qu'à la main »* :
     · au doigt  — glisser le ruban (défilement natif, `touch-action: pan-x`) ; le cran posé sous le
                   viseur est choisi quand le ruban s'arrête (`REPOS_MS`, le temps du sac) ;
     · à la souris — la molette (verticale) avance d'un cran par cran ; le trackpad glisse comme le
                   doigt ; les deux chevrons avancent d'un cran ;
     · partout   — un tap sur un cran le choisit ;
     · au clavier — les flèches (← ↓ un de moins, → ↑ un de plus), Début et Fin.
   ⛔ AUCUNE COTE ICI : elles viennent du plan (`MOLETTE`, `X1_gen.py` → `x1-disposition.mjs`), et
   la feuille qui les pose est construite par `feuilleDeLaMolette` — un seul écrivain pour X1 et X2. */
import { monterLeTambour, coteDeLaCale } from "./roue-tambour.mjs?v=855";
/* ⭐ LE TEMPS D'ARRÊT EST CELUI DU SAC, ⛔ PAS UN TROISIÈME — Wares le prend au même endroit. */
import { REPOS_MS } from "./sac-ecran.mjs?v=855";

/** ⚖️ LE PLAFOND DE LA MOLETTE — Eric, 27/09 : *« 20 c'est bien »*, *« Partout ailleurs sauf dans
 *  x5 »*. ⛔ Écrit ICI et nulle part ailleurs (NORMES `x-quantite-molette`). */
export const PLAFOND_MOLETTE = 20;

/** Le plus grand nombre que la molette offre : le stock s'il la borne (X1), jamais plus de 20. */
export function plafondDeLaMolette(stock = PLAFOND_MOLETTE) {
  const n = Math.floor(Number(stock));
  return Math.max(1, Math.min(PLAFOND_MOLETTE, Number.isFinite(n) ? n : PLAFOND_MOLETTE));
}

/** Un nombre ramené dans `1 … plafondDeLaMolette(stock)` — ⭐ la seule borne de X1 et X2. */
export function borneDeLaMolette(v, stock = PLAFOND_MOLETTE) {
  const n = Math.floor(Number(v));
  return Math.max(1, Math.min(plafondDeLaMolette(stock), Number.isFinite(n) && n > 0 ? n : 1));
}

const px = (v) => `${Math.round(v * 100) / 100}px`;

/** ⭐ LA FEUILLE DE LA MOLETTE — sa GÉOMÉTRIE, lue dans les cotes du plan (`M` = `MOLETTE`).
 *  @param portee le sélecteur de la fiche qui la monte (`.x1`, `.x2`) — ⛔ jamais une règle globale.
 *  ⭐ La grille `bord | piste | bord` : les chevrons se rabattent sur le BORD EXTÉRIEUR de leur cible
 *  de 44, qui mord la piste de sa moitié (l'idiome du tuner de Wares) ; leur dessin se centre dans
 *  la part qui dépasse, pour ne pas se peindre sur le cran voisin. */
export function feuilleDeLaMolette(portee, M) {
  const cible = 2 * M.bord;
  const cote = (M.bord - M.chevron.l) / 2;
  const p = `${portee} .molette`;
  return [
    `${p}{display:grid;grid-template-columns:${px(M.bord)} ${px(M.piste)} ${px(M.bord)};` +
      `grid-template-rows:100%;align-items:center;justify-content:center}`,
    `${p} > *{grid-row:1}`,
    `${p}-roue{grid-column:2;inline-size:${px(M.piste)};block-size:100%}`,
    `${p}-ruban{display:flex;block-size:100%;align-items:center;gap:${px(M.ecart)}}`,
    /* ⭐ LA CALE : la cote vient du MODULE du tambour (`coteDeLaCale`), ⛔ jamais recalculée ici */
    `${p} .roue-cale{flex:0 0 auto;align-self:stretch;inline-size:${px(coteDeLaCale(M))}}`,
    `${p}-cran{inline-size:${px(M.tuile)};block-size:${px(M.hauteur)}}`,
    `${p}-loupe{grid-column:2;place-self:center;inline-size:${px(M.tuile)};block-size:${px(M.hauteur)};` +
      `border-radius:var(--radius-md);box-shadow:inset 0 0 0 1px var(--loupe-trait)}`,
    `${p}-tuner{inline-size:${px(cible)};block-size:${px(cible)};` +
      `border-width:${px((cible - M.chevron.h) / 2)} ${px(cible - cote - M.chevron.l)} ` +
      `${px((cible - M.chevron.h) / 2)} ${px(cote)}}`,
    `${p}-tuner[data-sens="gauche"]{grid-column:1;justify-self:start}`,
    /* 🔴 LE CHEVRON DROIT EST LE MIROIR DU GAUCHE, ⛔ ET SA CIBLE NE DOIT PAS BOUGER. La peau du tuner
       mire autour du DESSIN (`transform-box: content-box`, `.sac-tuner`) : avec un dessin décentré,
       le miroir DÉPLACE la boîte. 📏 Mesuré au navigateur le 27/09 : la cible du chevron droit
       tombait 22 blg plus à droite, hors de la molette, sur le mot « to ». ⭐ Ici le miroir se prend
       autour de la BOÎTE : le dessin posé côté piste se retrouve côté bord, et la cible reste où la
       grille la pose. Au survol la peau lève le miroir (la flèche circulaire garde son sens) : le
       dessin se repose alors directement côté bord. */
    `${p}-tuner[data-sens="droite"]{grid-column:3;justify-self:end;transform-box:border-box}`,
    `@media (hover: hover){${p}-tuner[data-sens="droite"]:hover{` +
      `border-left-width:${px(cible - cote - M.chevron.l)};border-right-width:${px(cote)}}}`,
  ].join("\n");
}

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

/** ⚖️ LA MOLETTE.
 *  @param {object} o
 *   · `M` — les cotes du plan (`MOLETTE`) : ⭐ `M.pas` est l'invariant `scrollLeft = pas × k` ;
 *   · `valeur` — le nombre choisi ; `stock` — ce qui borne la molette (X1 : la pile), sinon 20 ;
 *   · `surChoix(n)` — reçoit un NOMBRE, une fois par choix ;
 *   · `note` — ce que lit un lecteur d'écran.
 *  @returns {HTMLElement} `.molette` — ⛔ sans `data-organe` : c'est la fiche qui la pose. */
export function construireLaMolette({ M, valeur = 1, stock = PLAFOND_MOLETTE, surChoix = null, note = "Quantity" } = {}) {
  const plafond = plafondDeLaMolette(stock);
  let courant = borneDeLaMolette(valeur, plafond);

  const molette = el("div", "molette");
  molette.setAttribute("role", "group");
  molette.setAttribute("aria-label", note);

  const roue = el("div", "molette-roue");
  roue.tabIndex = 0;
  roue.setAttribute("role", "slider");
  roue.setAttribute("aria-label", note);
  roue.setAttribute("aria-valuemin", "1");
  roue.setAttribute("aria-valuemax", String(plafond));
  roue.setAttribute("aria-valuenow", String(courant));
  const ruban = el("div", "molette-ruban");
  roue.append(ruban);
  /* ⭐ UN CRAN PAR NOMBRE. ⛔ Ils ne se lisent pas un par un (`aria-hidden`) : le lecteur d'écran
     entend la molette, un curseur de 1 à `plafond`, et sa valeur. */
  const crans = Array.from({ length: plafond }, (_, i) => {
    const c = el("span", "molette-cran", String(i + 1));
    c.dataset.valeur = String(i + 1);
    c.setAttribute("aria-hidden", "true");
    return c;
  });
  /* ⚖️ LE VISEUR RESTE CENTRÉ, les nombres défilent dessous (la loi du tambour, 19/09). ⛔ Il ne
     reçoit rien : `pointer-events: none` (la feuille). */
  const loupe = el("div", "molette-loupe");
  loupe.setAttribute("aria-hidden", "true");

  monterLeTambour({ roue, ruban, crans, actif: courant - 1, pas: M.pas, loupe });

  /** ⭐ CHOISIR — le chemin unique des chevrons, du tap, de la molette et du clavier : le ruban
   *  va au cran, la valeur change, l'appelant l'apprend UNE fois. */
  function choisir(k) {
    const i = Math.max(0, Math.min(plafond - 1, k));
    roue.viser(i);
    roue.marquer(i);
    if (i + 1 === courant) return;
    courant = i + 1;
    roue.setAttribute("aria-valuenow", String(courant));
    if (surChoix) surChoix(courant);
  }
  /* ⚖️ UN TAP SUR UN CRAN LE CHOISIT — le tambour l'aimante déjà (`monterLeTambour`) ; ici il
     devient le choix tout de suite, sans attendre que le ruban se pose. */
  crans.forEach((c, i) => c.addEventListener("click", () => choisir(i)));

  /* ⭐ LE DOIGT ET LE TRACKPAD : le ruban glisse nativement ; le cran sous le viseur se marque à
     chaque image, et il est CHOISI quand le ruban s'arrête — le compte d'immobilité du sac et de
     Wares. ⛔ Nos propres écritures ne sont pas un geste (`estProgrammatique`). */
  let minuteur = null;
  roue.addEventListener("scroll", () => {
    if (roue.estProgrammatique && roue.estProgrammatique()) return;
    const k = Math.max(0, Math.min(plafond - 1, Math.round(roue.scrollLeft / M.pas)));
    roue.marquer(k);
    if (minuteur) clearTimeout(minuteur);
    minuteur = setTimeout(() => {
      if (k + 1 === courant) return;
      courant = k + 1;
      roue.setAttribute("aria-valuenow", String(courant));
      if (surChoix) surChoix(courant);
    }, REPOS_MS);
  });

  /* ⚖️ LA MOLETTE DE LA SOURIS — un cran par cran, comme le tuner du sac. ⭐ Seul le geste VERTICAL
     est pris : un trackpad qui glisse de côté fait défiler le ruban nativement. Les petits pas d'un
     trackpad s'additionnent jusqu'à un cran (`PAS_DE_MOLETTE`), sinon un effleurement en sauterait
     dix. ⛔ `passive: false` : sans lui, la page défilerait derrière la molette. */
  let cumul = 0;
  molette.addEventListener("wheel", (ev) => {
    const dy = Number(ev && ev.deltaY) || 0;
    const dx = Number(ev && ev.deltaX) || 0;
    if (Math.abs(dy) <= Math.abs(dx)) return;
    if (typeof ev.preventDefault === "function") ev.preventDefault();
    cumul += dy * (ev.deltaMode === 1 ? LIGNE_EN_PX : 1);
    if (Math.abs(cumul) < PAS_DE_MOLETTE) return;
    const sens = cumul > 0 ? 1 : -1;
    cumul = 0;
    choisir(courant - 1 + sens);
  }, { passive: false });

  /* ⚖️ LE CLAVIER — les flèches, Début, Fin : la conduite d'un curseur (`role="slider"`). */
  roue.addEventListener("keydown", (ev) => {
    const pas = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
    let cible = null;
    if (pas) cible = courant - 1 + pas;
    else if (ev.key === "Home") cible = 0;
    else if (ev.key === "End") cible = plafond - 1;
    if (cible === null) return;
    if (typeof ev.preventDefault === "function") ev.preventDefault();
    choisir(cible);
  });

  /* ⚖️ LES DEUX CHEVRONS — la peau du tuner du sac (`.sac-tuner`, flèche circulaire au survol),
     un cran par tap. */
  const tuner = (sens) => {
    const b = el("button", "molette-tuner");
    b.type = "button";
    b.dataset.sens = sens < 0 ? "gauche" : "droite";
    b.setAttribute("aria-label", sens < 0 ? "One less" : "One more");
    b.addEventListener("click", () => choisir(courant - 1 + sens));
    return b;
  };
  molette.append(roue, loupe, tuner(-1), tuner(1));

  /* ⭐ LE PLACEMENT DE DÉPART SE FAIT QUAND LA MOLETTE EST AU DOCUMENT — un ruban détaché n'a pas de
     `scrollLeft` utilisable (`roue.poser` le refuse). La fiche est bâtie détachée puis insérée : on
     réessaie à l'image suivante, quelques fois, ⛔ sans jamais boucler. */
  const image = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (f) => setTimeout(f, 16);
  const poser = (essais) => { if (!roue.poser() && essais > 0) image(() => poser(essais - 1)); };
  image(() => poser(ESSAIS_DE_POSE));

  molette.valeur = () => courant;
  molette.choisir = (n) => choisir(borneDeLaMolette(n, plafond) - 1);
  return molette;
}

/* Les trois nombres du geste — ⛔ ce ne sont pas des cotes : un seuil de molette, une ligne de
   texte (le `deltaMode` 1 de Firefox), et un nombre d'essais. */
const PAS_DE_MOLETTE = 40;
const LIGNE_EN_PX = 16;
const ESSAIS_DE_POSE = 10;
