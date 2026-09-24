/* ══ LE PARCHEMIN — LA SILHOUETTE D'UNE FEUILLE, DESSINÉE À SA COTE ═══════════
   Lot 219, mis à nu au lot 252. L'organe qui donne à une surface un bord de
   parchemin : ⭐ un contour irrégulier, et STRICTEMENT rien d'autre.
   ⚖️ Eric, 2026-09-23 : *« je peux juste avoir le fond et c'est tout ? »* — la
   patine, le grain, les fibres, les plis et le fil du bord sont partis.

   ⚖️ CE QU'IL REMPLACE, ET POURQUOI — Eric, 2026-09-21 : *« aucune image
   matricielle de parchemin ne doit être nécessaire »*, *« le panneau doit
   rester entièrement extensible selon son contenu »*.
   📏 LE DÉFAUT EST MESURÉ : `.x1` portait `background: var(--x1-parchemin)
   center / 100% 100% no-repeat` — une image de 806 × 1056 ÉTIRÉE sur la dalle.
   Un grain étiré change d'épaisseur avec le format : la même déchirure rendait
   large sur un panneau court et fine sur un panneau long, et rien dans la
   feuille ne pouvait le dire. ⭐ Un contour CALCULÉ à la cote réelle ne peut pas
   avoir ce défaut — ses accrocs font 4 blg qu'on soit en 375 × 420 ou en
   375 × 640.

   ⛔ ET IL N'EST PAS UNE COPIE DU PROTOTYPE, C'EST SA GÉOMÉTRIE ADAPTÉE.
   Le prototype (`Gpt in FH/Parchemin-CSS/parchment-css-demo.html`, modèle B
   « Feuillet de grimoire ») garnit son SVG par `innerHTML` avec une chaîne, et
   pose ses couleurs dans une feuille à lui. Aucun des deux ne passe ici :
   `tests/socle.test.mjs` garde A refuse tout `innerHTML` dans `ui/builder/`, et
   `tests/ui-jetons.test.mjs` garde 7 refuse tout style en ligne. Les nœuds sont
   donc bâtis par `createElementNS` (le patron de `b3-scene.mjs`) et TOUTES les
   teintes viennent de `tokens.css` par une classe. ⛔ Aucune couleur n'est
   écrite dans ce fichier.

   ⭐ LA SILHOUETTE EST DÉTERMINISTE, ET C'EST UNE PROPRIÉTÉ, PAS UN HASARD
   MAÎTRISÉ : le bruit est un hachage de `Math.sin`, ⛔ jamais `Math.random`.
   Même variante + mêmes cotes ⇒ exactement le même chemin. Un redimensionnement
   qui revient à sa cote d'origine retrouve le dessin d'origine.

   📏 ET LA COTE EST LUE EN `clientWidth`, ⛔ JAMAIS EN `getBoundingClientRect` —
   mesuré le 21/09 sous Chromium 152, sur `.x1` dans un parent à `zoom: 1.8` :
   `clientWidth` rend **375**, `getBoundingClientRect().width` rend **675**.
   ⭐ C'est `clientWidth` qui donne le blg (NORMES §0 bis), donc la silhouette est
   LA MÊME sur l'iPhone et sur l'iPad — seule la peinture grandit. Le rect aurait
   donné deux dessins différents pour un même écran, et c'est exactement la
   famille du piège « `zoom` ne rebase pas `vw` » (TRAPS, lot 121). */

/** ⚖️ QUI PORTE LE PARCHEMIN — LA FAMILLE, NOMMÉE UNE SEULE FOIS.
 *  🔴 LOT 248 — ELLE ÉTAIT ÉCRITE QUATRE FOIS : sept règles de `shell.css` et
 *  TROIS gardes qui recopiaient `:is(.x1, .x2)` à la main. ⛔ Ce n'est pas un
 *  détail de forme : le jour où X2 a rejoint X1 (lot 242), il a fallu retoucher
 *  chaque ancre, et le commentaire du garde 7 bis raconte lui-même l'opération.
 *  Le jour où X0 les rejoint, la même corvée recommençait — et un garde qu'on
 *  répare à la main est un garde qu'on finit par ajuster jusqu'au vert.
 *  ⭐ Désormais la feuille écrit le sélecteur et les gardes le LISENT ici : le
 *  prochain porteur s'ajoute à cette ligne, et rien d'autre ne bouge. */
export const FAMILLE_DU_PARCHEMIN = Object.freeze([".x1", ".x2", ".x5", ".aiguilleur-carte"]);
export const SELECTEUR_DU_PARCHEMIN = `:is(${FAMILLE_DU_PARCHEMIN.join(", ")})`;

const SVG = "http://www.w3.org/2000/svg";

/** ⚖️ LE MODÈLE B, « FEUILLET DE GRIMOIRE » — la direction retenue par Eric le
 *  2026-09-21. Les six nombres sont ceux du prototype, repris tels quels : ⛔ ils
 *  ne se ré-inventent pas ici, ils viennent du dessin qu'Eric a regardé et
 *  validé. `swell` est la houle lente du bord, `tooth` la fibre courte, `nick`
 *  l'accroc.
 *  ⭐ ET L'ACCROC EST PLUS LARGE QUE LA FIBRE, PAR CONSTRUCTION : la fibre est un
 *  bruit de période 1,5 à 5 blg, l'accroc une gaussienne de 4,4 à 9,2 blg de
 *  large. C'est ce rapport qui évite la dent de scie — ⛔ pas un réglage de
 *  goût, la raison même pour laquelle les deux termes existent séparément. */
export const MODELE_B = Object.freeze({
  /* ⚠️ `fibre`, `accroc` et `patine` NE PILOTENT PLUS RIEN depuis le lot 252 :
     les couches qu'elles réglaient ont été retirées. ⛔ Elles restent quand même,
     et ce n'est pas de la négligence — le MODÈLE B est un artefact RATIFIÉ
     (« Feuillet de grimoire, aux nombres du prototype »), gardé nombre par
     nombre, avec une invariante entre `accroc` et `fibre`. Effacer les chiffres
     d'une spec pour faire propre n'est pas une simplification, c'est une perte.
     ⏳ Les retirer est une question qui appartient à Eric, pas au ménage. */
  graine: 43, houle: 2.5, fibre: .9, accroc: 1.1, patine: 1, coins: [9, 5, 12, 7]
});

/** 📏 L'ÉCHELLE DU BORD — le seul nombre que ce lot CHOISIT, et il est borné par
 *  une mesure. Le prototype dessine sur une page dont le contenu est à 34 blg du
 *  bord ; la fiche X1 a des glyphes à **9,5** (la copie à gauche, l'œil à
 *  droite). ⛔ Transplanter l'amplitude du prototype telle quelle poserait de
 *  l'encre HORS du papier — ce que la spec interdit explicitement.
 *  ⭐ L'échelle est donc calculée, pas réglée : voir `bornerLEchelle()`. */
const ECHELLE_MIN = .18;

/** Le hachage — un bruit reproductible. ⛔ `Math.random` ne peut pas vivre ici :
 *  la silhouette doit être la même à chaque peinture. */
const hache = (i, graine) => {
  const v = Math.sin(i * 127.1 + graine * 311.7) * 43758.5453123;
  return v - Math.floor(v);
};
const bruit = (t, graine) => {
  const i = Math.floor(t), f = t - i, m = f * f * (3 - 2 * f);
  return ((1 - m) * hache(i, graine) + m * hache(i + 1, graine)) * 2 - 1;
};
const n2 = (n) => Number(n.toFixed(2));

/** L'écart du bord à sa ligne moyenne, en blg, au point `t` de l'arête `arete`.
 *  ⭐ POSITIF = VERS L'INTÉRIEUR. Les trois termes s'additionnent : la houle, la
 *  fibre, puis les deux accrocs et leur contre-bosse.
 *  ⚠️ `fondu` éteint l'écart aux DEUX bouts de l'arête : sans lui, deux arêtes
 *  voisines arrivent au coin avec des écarts différents et le coin se fend. */
function ecart(t, longueur, arete, v) {
  const fondu = Math.min(1, t / 10, (longueur - t) / 10);
  let e = v.houle * (bruit(t / 93, v.graine + arete * 71) * 1.65
                   + bruit(t / 28, v.graine + arete * 71 + 3) * .95);
  e += v.fibre * (bruit(t / 5.2, v.graine + arete * 71 + 9) * 1.2
                + bruit(t / 1.5, v.graine + arete * 71 + 21) * .38);
  /* ⚖️ DEUX ACCROCS PAR ARÊTE, ESPACÉS — Eric : *« quelques accrocs espacés,
     sans dents régulières »*. Leur place vient du hachage de l'arête, donc elle
     n'est la même sur aucun des quatre côtés : c'est ce qui rend le bord
     ASYMÉTRIQUE sans qu'on ait à écrire quatre jeux de nombres. */
  const places = [.18 + hache(arete, v.graine) * .14, .66 + hache(arete + 5, v.graine) * .16];
  for (let j = 0; j < places.length; j++) {
    const d = t - longueur * places[j], large = 4.4 + hache(j + arete, v.graine + 2) * 4.8;
    e += v.accroc * (3.1 + hache(arete + j, v.graine + 11) * 2.9) * Math.exp(-Math.pow(d / large, 2));
    /* la contre-bosse : un accroc arrache de la matière d'un côté et la repousse
       de l'autre. ⛔ Sans elle l'accroc est un trou rond, pas une déchirure. */
    e -= v.accroc * .65 * Math.exp(-Math.pow((d + large * 1.9) / (large * .7), 2));
  }
  return e * fondu;
}

/** 📏 CE QUI BORNE L'ÉCHELLE, ET C'EST UNE MESURE, PAS UN GOÛT.
 *  On balaie les quatre arêtes, on relève l'écart le plus rentrant et le plus
 *  sortant, et on résout l'échelle `k` et la ligne moyenne `m`.
 *
 *  🔴 LOT 243 — LA LIGNE MOYENNE REVIENT DEDANS, ET C'EST ERIC QUI DÉFAIT 240.
 *  ⚖️ Eric, 2026-09-21, devant la fiche servie : *« efface la plaque en dessous
 *  et n'agrandis pas X »*, *« on verra le contour »*, *« juste X et le fond
 *  derrière »*.
 *
 *  ⭐ CE QU'IL DEMANDE EST UNE PILE À DEUX COUCHES, ET RIEN ENTRE : le fond de
 *  l'application, puis le parchemin à sa silhouette RÉELLE. ⛔ Aucune plaque,
 *  aucun remplissage jusqu'aux bords de la dalle. Les creux du pourtour ne sont
 *  pas un défaut à boucher — ils sont le SUJET : c'est par eux qu'on voit que
 *  la feuille est déchirée.
 *
 *  🔴 CE QUE LE LOT 240 AVAIT FAIT, ET POURQUOI ÇA TOMBE. Il posait la ligne
 *  moyenne à `−k·haut` : le point le plus RENTRANT affleurait la bordure, tout
 *  le reste du bord passait DEHORS, et `overflow: hidden` le coupait à plat aux
 *  quatre côtés. ⛔ Plus aucun creux ne laissait voir le fond — et plus aucune
 *  déchirure non plus. 240 l'avait écrit lui-même en dernière ligne de son
 *  message : *« au budget de 9,5 la déchirure n'est plus lisible comme une
 *  silhouette — la fiche se lit comme un rectangle »*. C'est ce rectangle
 *  qu'Eric a regardé, et il tranche l'inverse.
 *
 *  📏 ET LA « PLAQUE » D'ERIC N'EXISTE PAS AU DÉPÔT — MESURÉ, PAS SUPPOSÉ
 *  (Chromium, 21/09, `ui/builder/index.html`, chaîne matérialisée puis lue au
 *  `getComputedStyle`) : `.x1`, `.equipment-step`, `.decision-card`, `.stage`,
 *  `.stage-area`, `.panneau-contenu`, `.panneau`, `.panneaux`, `.app` et `html`
 *  rendent TOUS `rgba(0, 0, 0, 0)` et `background-image: none`. Le seul organe
 *  qui peint sous la fiche est `body` — `rgb(20, 18, 14)` + `bg-ruins-night` —,
 *  et c'est très exactement *« le fond derrière »* qu'Eric veut voir.
 *  ⭐ LA PLAQUE QU'IL A VUE ÉTAIT DONC LE PARCHEMIN LUI-MÊME, poussé jusqu'aux
 *  bords. *« Efface la plaque »* et *« n'agrandis pas X »* ne sont pas deux
 *  gestes : c'est deux fois le même, et il tient dans le signe ci-dessous.
 *
 *  LES DEUX CONTRAINTES, RENDUES À LEUR SENS DU LOT 219 :
 *    · `m + k·max ≤ budget` — ⛔ aucune encre hors du papier. Elle n'a jamais
 *      bougé : c'est elle qui protège la copie, l'œil et les quatre portes.
 *    · `m + k·min = 0`      — ⭐ le point le plus SORTANT affleure la bordure,
 *      et tout le reste du bord est DEDANS. Le pourtour laisse donc voir le
 *      fond de l'application, la déchirure se lit comme une silhouette, et
 *      l'ombre portée (`drop-shadow` sur le SVG) épouse enfin le bord au lieu
 *      de tomber hors de la dalle.
 *  ⛔ `k` NE CHANGE PAS : l'amplitude crête à crête reste bornée par le budget,
 *  la silhouette reste DÉTERMINISTE (graine 43), et l'accroc reste plus large
 *  que la fibre.
 *  @returns {{k: number, m: number}} l'échelle et la ligne moyenne, en blg */
export function bornerLEchelle(l, h, budget, v = MODELE_B) {
  let bas = 0, haut = 0;
  const aretes = [[l, 0], [h, 1], [l, 2], [h, 3]];
  for (const [longueur, arete] of aretes) {
    const pas = Math.ceil(longueur / 1.35);
    for (let i = 0; i <= pas; i++) {
      const e = ecart((i / pas) * longueur, longueur, arete, v);
      if (e < bas) bas = e;
      if (e > haut) haut = e;
    }
  }
  /* `haut − bas` est l'amplitude crête à crête du bord brut. Le budget la
     contient tout entière : k = budget / (haut − bas).
     🔴 LOT 243 — LA LIGNE MOYENNE REVIENT À `−k·bas`, ⛔ PLUS À `−k·haut`.
     ⭐ C'est UN signe, et c'est toute la demande d'Eric du 21/09 : à `−k·haut`
     le point le plus RENTRANT touchait 0, le reste du bord sortait, la dalle le
     coupait à plat, et la fiche se lisait comme un rectangle. À `−k·bas`, c'est
     le point le plus SORTANT qui touche 0 : toute la silhouette rentre, et le
     pourtour laisse voir le fond de l'application — *« juste X et le fond
     derrière »*.
     📏 MESURÉ à 375 × 500, budget 9,5 : k = 0,560 · m = 3,82 · le point le plus
     rentrant rentre de 9,04 blg · le plus sortant affleure à 0,04 blg près. */
  const amplitude = haut - bas;
  const k = amplitude > 0 ? Math.min(1, budget / amplitude) : 1;
  return { k: Math.max(ECHELLE_MIN, k), m: -k * bas };
}

/** Les points du bord, dans l'ordre du tracé. Chaque point porte sa normale
 *  rentrante (`nx`, `ny`). ⚠️ ELLE N'A PLUS DE LECTEUR depuis le lot 252 — la
 *  patine et les fibres s'en servaient pour creuser vers l'intérieur. Elle reste
 *  parce que `bord` la calcule en même temps que le point, pour rien ; ⛔ la
 *  retirer toucherait à la génération du contour, qui, elle, est juste. */
function bord(l, h, budget, v) {
  const { k, m } = bornerLEchelle(l, h, budget, v);
  const [hg, hd, bd, bg] = v.coins.map((c) => c * k);
  const points = [];
  const pose = (x, y, nx, ny, arete) => points.push({ x, y, nx, ny, arete });
  const arete = (ax, ay, bx, by, nx, ny, index) => {
    const longueur = Math.hypot(bx - ax, by - ay);
    const pas = Math.ceil(longueur / 1.35);
    for (let i = 0; i <= pas; i++) {
      const f = i / pas;
      /* ⛔ LE PAS EST EN BLG, PAS EN FRACTION : `longueur / 1,35` donne un point
         tous les 1,35 blg quelle que soit la cote. C'est ce qui fait que la
         matière ne s'étire pas — un panneau deux fois plus haut a deux fois plus
         de points, pas les mêmes points deux fois plus espacés. */
      const e = m + k * ecart(f * longueur, longueur, index, v);
      pose(ax + (bx - ax) * f + nx * e, ay + (by - ay) * f + ny * e, nx, ny, index);
    }
  };
  /* ⚖️ LES QUATRE COINS SONT INÉGAUX (9 · 5 · 12 · 7 du modèle B) : c'est la
     première chose qui dit « feuille » plutôt que « rectangle aux angles
     arrondis ». Les deux points posés à la main entre deux arêtes coupent le
     coin en biais — ⛔ un arrondi régulier y remettrait la symétrie qu'on retire.
     ⭐ ET LE BISEAU SUIT LA LIGNE MOYENNE, comme les arêtes — acquis du lot 240,
     ⛔ GARDÉ PAR LE LOT 243 alors que le reste de 240 est défait, parce qu'il est
     juste DANS LES DEUX SENS. Les douze points de coin étaient posés en
     coordonnées ABSOLUES depuis l'angle du rectangle, donc ils ne bougeaient pas
     d'un blg quoi que fasse `m` : quand 240 a envoyé les quatre arêtes dehors,
     les coins sont restés dedans et il restait quatre encoches transparentes
     (📏 1,82 blg au point (1,86 · 1,82), à 360 de haut — invisible sur une
     capture, mesurable dans un balayage). ⭐ La faute était la même à l'endroit :
     maintenant que `m` est POSITIF et que les arêtes rentrent, un coin laissé en
     absolu ferait au contraire quatre BOSSES de 3,82 blg par-dessus la ligne
     moyenne, et la feuille aurait des oreilles.
     ⭐ CHAQUE POINT DE COIN EST DONC DÉCALÉ DE `m` LE LONG DE SA PROPRE NORMALE
     — la même translation que l'arête qu'il prolonge, et rien de plus. Un coin
     qui se décalerait d'une autre quantité ferait une marche à la jonction. */
  const coin = (x, y, nx, ny) => pose(x + nx * m, y + ny * m, nx, ny, -1);
  arete(hg, 0, l - hd, 0, 0, 1, 0);
  coin(l - hd * .40, hd * .15, -.6, .8);
  coin(l - hd * .12, hd * .57, -.9, .4);
  arete(l, hd, l, h - bd, -1, 0, 1);
  coin(l - bd * .2, h - bd * .32, -.8, -.6);
  coin(l - bd * .64, h - bd * .08, -.4, -.9);
  arete(l - bd, h, bg, h, 0, -1, 2);
  coin(bg * .34, h - bg * .13, .6, -.8);
  coin(bg * .08, h - bg * .56, .9, -.4);
  arete(0, h - bg, 0, hg, 1, 0, 3);
  coin(hg * .16, hg * .47, .8, .6);
  coin(hg * .61, hg * .10, .4, .9);
  return { points, k };
}

/** Le chemin fermé qui passe par tous les points, en Catmull-Rom converti en
 *  Bézier. ⛔ Pas de `L` entre les points : une ligne brisée sur un pas de
 *  1,35 blg rend une dent de scie dès qu'on zoome, et l'iPad zoome. */
function trace(points) {
  let d = `M${n2(points[0].x)} ${n2(points[0].y)}`;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length];
    const b = points[i], c = points[(i + 1) % points.length];
    const e = points[(i + 2) % points.length], t = .72 / 6;
    d += `C${n2(b.x + (c.x - a.x) * t)} ${n2(b.y + (c.y - a.y) * t)}`
       + ` ${n2(c.x - (e.x - b.x) * t)} ${n2(c.y - (e.y - b.y) * t)}`
       + ` ${n2(c.x)} ${n2(c.y)}`;
  }
  return `${d}Z`;
}

/** LA GÉOMÉTRIE COMPLÈTE d'une feuille de `l` × `h` blg.
 *  @param {number} l largeur en blg · @param {number} h hauteur en blg
 *  @param {number} budget la profondeur MAXIMALE que le bord a le droit de mordre
 *  @returns {{d: string}} le contour, ⛔ plus rien d'autre depuis le 23/09
 */
export function geometrieDuParchemin(l, h, budget, v = MODELE_B) {
  const { points } = bord(l, h, budget, v);
  /* ⛔ IL N'Y A PLUS QU'UNE CHOSE À RENDRE. `creuse`, les fibres et les deux plis
     sont partis avec les couches qu'ils nourrissaient : les garder aurait laissé
     trois générateurs dont personne ne lit le résultat — et un orphelin qui
     survit à l'architecture qui le justifiait finit par être recopié par
     quelqu'un qui le croit vivant. */
  return { d: trace(points) };
}

/* ══ LE DESSIN ════════════════════════════════════════════════════════════ */

let compteur = 0;

function forme(nom, classe, attrs) {
  const n = document.createElementNS(SVG, nom);
  if (classe) n.setAttribute("class", classe);
  for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
  return n;
}

/** PEINT LA FEUILLE dans un `<svg>` déjà posé.
 *  ⛔ Ce SVG est DÉCORATIF : `aria-hidden`, et il n'intercepte aucun événement
 *  (`pointer-events: none`, dans la feuille). Le contenu reste au-dessus et
 *  accessible — c'est la condition pour qu'un décor n'attrape pas un geste
 *  (`tests/decor-ne-se-laisse-pas-saisir.test.mjs`). */
export function peindreLeParchemin(svg, l, h, budget) {
  const id = `parchemin-${++compteur}`;
  const g = geometrieDuParchemin(l, h, budget);
  const racine = forme("g", "parchemin-dessin");

  /* ⚖️ LE PARCHEMIN EST NU — Eric, 2026-09-23 : *« je peux juste avoir le fond
     et c'est tout ? »*, puis, entre les trois degrés proposés, **« 2 »** : le
     fond et sa déchirure, ⛔ rien d'autre.
     🔴 CE QUI A DISPARU N'ÉTAIT PAS DU DÉCOR GRATUIT : deux nappes de patine
     (l'anneau large à .20, le liseré serré à .07), la tuile de grain, les
     fibres, les deux plis et le fil du bord. Elles donnaient au bord son
     ÉPAISSEUR — sans elles, la déchirure devient une arête nette entre le
     papier et le décor. C'était la réserve posée avant qu'Eric tranche.
     ⭐ ET UN SEUL ORGANE CHANGE POUR TROIS ÉCRANS : X0, X1 et X2 montent le même
     parchemin, par le même `habilleEnParchemin`. ⛔ C'est pour ça qu'on n'en
     avait pas fait deux. */
  racine.append(forme("path", "parchemin-fond", { d: g.d }));

  /* ⛔ ON RETIRE APRÈS AVOIR BÂTI, jamais avant : si `geometrieDuParchemin` jetait,
     la feuille resterait celle d'avant plutôt que de disparaître. Et ⛔ ni
     `innerHTML` ni `replaceChildren` — `tests/socle.test.mjs` garde A les refuse
     hors de `socle.mjs`. */
  for (const vieux of [...svg.childNodes]) if (vieux.remove) vieux.remove();
  svg.setAttribute("viewBox", `0 0 ${l} ${h}`);
  svg.append(racine);
}

/** MONTE LE PARCHEMIN sur une boîte et le garde à sa cote.
 *  @param {Element} boite la surface à habiller — c'est SA cote qui fait foi
 *  @param {() => number} budgetDe ce que le bord a le droit de mordre, en blg
 *  @returns {SVGElement} le SVG décoratif, à poser en PREMIER enfant de la boîte
 */
export function habilleEnParchemin(boite, budgetDe) {
  const svg = forme("svg", "parchemin", { preserveAspectRatio: "none", focusable: "false" });
  svg.setAttribute("aria-hidden", "true");
  /* ⭐ LE REPLI, ET IL NE DEMANDE NI JS NI `ResizeObserver` : un rectangle en
     POUR-CENT, donc juste à toute cote sans que personne ne le redessine. Si le
     module ne tourne jamais — script en échec, moteur sans observateur au premier
     souffle — la fiche a quand même un fond de parchemin opaque, son encre porte,
     et tous ses contrôles restent lisibles. ⛔ Un panneau transparent, lui, aurait
     mis le texte sur le décor du site. */
  const repli = forme("rect", "parchemin-fond parchemin-repli",
    { x: 0, y: 0, width: "100%", height: "100%", rx: 3 });
  svg.append(repli);

  let derniere = "";
  const redessiner = () => {
    /* 📏 `clientWidth`, ⛔ JAMAIS `getBoundingClientRect` — voir l'en-tête : le
       premier donne le blg, le second le pixel peint, et sous `zoom` ils diffèrent
       d'un facteur 1,83 sur l'iPad. */
    const l = boite.clientWidth, h = boite.clientHeight;
    if (!Number.isFinite(l) || !Number.isFinite(h)) return;
    /* ⛔ ET LA GARDE CONTRE LA BOUCLE EST ICI, PAS AILLEURS : on ne redessine que
       si la COTE a changé. Le SVG est en `position: absolute; inset: 0`, donc il
       ne pèse sur la taille de personne — mais un redessin inconditionnel à
       chaque notification resterait un gouffre, et un observateur qui se
       redéclenche lui-même est la panne classique de cet organe. */
    const cote = `${l}×${h}`;
    if (l < 8 || h < 8 || cote === derniere) return;
    derniere = cote;
    peindreLeParchemin(svg, l, h, budgetDe());
  };

  /* ⚠️ RIEN N'EST MESURABLE AVANT LA MISE EN PAGE — la leçon de
     `defilement-chevrons.mjs` : au moment où ce nœud est fabriqué il n'est pas
     encore au document, et `clientWidth` vaut 0. D'où les deux temps.
     ⛔ ET ON NE MESURE JAMAIS EN SYNCHRONE — c'est le repli, pas une précaution :
     là où il n'y a pas de `requestAnimationFrame`, il n'y a pas de mise en page,
     donc il n'y a rien à mesurer. ⭐ Le rectangle en pour-cent tient alors tout
     seul, et il est JUSTE : 100 % × 100 % de la dalle, sans un nombre.
     📏 Mesuré le 21/09 : un appel synchrone ici faisait rougir huit tests de
     `x1-ecran.test.mjs` — le `dom-stub` du dépôt refuse `clientHeight` quand
     aucune géométrie n'est déclarée, et il a raison de le refuser. Une mesure
     prise là où rien n'est mis en page n'est pas une mesure. */
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(redessiner);
  if (typeof ResizeObserver === "function") new ResizeObserver(redessiner).observe(boite);
  else if (typeof addEventListener === "function") addEventListener("resize", redessiner, { passive: true });
  return svg;
}
