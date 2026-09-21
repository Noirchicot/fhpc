/* ══ LE PARCHEMIN — LA SILHOUETTE D'UNE FEUILLE, DESSINÉE À SA COTE ═══════════
   Lot 219. L'organe qui donne à une surface un bord de parchemin : un contour
   irrégulier, une patine sur la tranche, quelques fibres, et rien d'autre.

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
 *  sortant, et on résout l'échelle `k` et la ligne moyenne `m` qui font tenir
 *  TOUT le bord dans `[0, budget]` depuis la bordure de la dalle :
 *    · `m + k·max ≤ budget` — ⛔ aucune encre hors du papier ;
 *    · `m + k·min ≥ 0`      — ⛔ aucun bord rogné à plat par l'`overflow` de la dalle.
 *  ⭐ LES DEUX COMPTENT AUTANT. Sans la première, la déchirure mange la copie et
 *  l'œil ; sans la seconde, le papier déborde la dalle, `overflow: hidden` le
 *  coupe AU COUTEAU, et on obtient précisément le bord droit qu'on fuit.
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
     contient tout entière : k = budget / (haut − bas), et la ligne moyenne se
     pose à `−k·bas` pour que le point le plus SORTANT touche exactement 0. */
  const amplitude = haut - bas;
  const k = amplitude > 0 ? Math.min(1, budget / amplitude) : 1;
  return { k: Math.max(ECHELLE_MIN, k), m: -k * bas };
}

/** Les points du bord, dans l'ordre du tracé. Chaque point porte sa normale
 *  rentrante (`nx`, `ny`), dont la patine et les fibres se servent pour creuser
 *  vers l'intérieur sans avoir à redécouvrir de quel côté elles sont. */
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
     coin en biais — ⛔ un arrondi régulier y remettrait la symétrie qu'on retire. */
  arete(hg, 0, l - hd, 0, 0, 1, 0);
  pose(l - hd * .40, hd * .15, -.6, .8, -1);
  pose(l - hd * .12, hd * .57, -.9, .4, -1);
  arete(l, hd, l, h - bd, -1, 0, 1);
  pose(l - bd * .2, h - bd * .32, -.8, -.6, -1);
  pose(l - bd * .64, h - bd * .08, -.4, -.9, -1);
  arete(l - bd, h, bg, h, 0, -1, 2);
  pose(bg * .34, h - bg * .13, .6, -.8, -1);
  pose(bg * .08, h - bg * .56, .9, -.4, -1);
  arete(0, h - bg, 0, hg, 1, 0, 3);
  pose(hg * .16, hg * .47, .8, .6, -1);
  pose(hg * .61, hg * .10, .4, .9, -1);
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
 *  @returns {{d: string, tranche: string, lisiere: string, fibres: string, plis: string}}
 */
export function geometrieDuParchemin(l, h, budget, v = MODELE_B) {
  const { points, k } = bord(l, h, budget, v);
  /* La patine se creuse en décalant chaque point le long de sa normale, d'une
     profondeur qui ONDULE. ⛔ Une profondeur constante ferait une seconde
     bordure nette — exactement ce que la spec refuse. C'est l'ondulation qui la
     rend « douce et discontinue ». */
  const creuse = (profondeur) => trace(points.map((p, i) => {
    const w = profondeur * (.85 + bruit(i / 27, v.graine + 13) * .55 + bruit(i / 7, v.graine + 12) * .22);
    return { x: p.x + p.nx * w, y: p.y + p.ny * w };
  }));
  let fibres = "", plis = "";
  /* ⭐ UNE FIBRE SUR SEPT POINTS, ET SEULEMENT SUR LES ARÊTES : les points des
     coins (`arete < 0`) n'en portent pas — une barbe sur un coin coupé en biais
     se lit comme un défaut de tracé, pas comme du papier. */
  for (let i = 3; i < points.length; i += 7) {
    const p = points[i], r = hache(i, v.graine + 8);
    if (p.arete < 0 || r < .3) continue;
    const portee = (.5 + r * 2.8 * v.fibre) * k;
    const tang = (hache(i, v.graine + 81) - .5) * 2.4 * k;
    fibres += `M${n2(p.x + p.nx * .2)} ${n2(p.y + p.ny * .2)}`
            + `q${n2(p.nx * portee * .6 + p.ny * tang)} ${n2(p.ny * portee * .6 - p.nx * tang)}`
            + ` ${n2(p.nx * portee + p.ny * tang * .5)} ${n2(p.ny * portee - p.nx * tang * .5)}`;
  }
  /* Deux plis, sur les deux arêtes verticales — le modèle B en porte, le modèle A
     non. Ils partent du bord vers l'intérieur : c'est la marque d'une feuille
     qu'on a pliée, pas d'un bord qui s'effiloche. */
  for (const [index, j] of [[1, 0], [3, 1]]) {
    const surLArete = points.filter((p) => p.arete === index);
    if (!surLArete.length) continue;
    const p = surLArete[Math.round((.18 + hache(index, v.graine) * .14) * (surLArete.length - 1))];
    const portee = 4.2 * v.accroc * k;
    plis += `M${n2(p.x)} ${n2(p.y)}q${n2(p.nx * portee * .8)} ${n2((1.1 + j) * k)}`
          + ` ${n2(p.nx * portee)} ${n2((3 + j * 2) * k)}`;
  }
  return {
    d: trace(points),
    tranche: creuse(6.5 * v.patine * k),   /* la nappe large et floue */
    lisiere: creuse(2.5 * v.patine * k),   /* le liseré serré, presque effacé */
    fibres, plis
  };
}

/* ══ LE DESSIN ════════════════════════════════════════════════════════════ */

let compteur = 0;

function forme(nom, classe, attrs) {
  const n = document.createElementNS(SVG, nom);
  if (classe) n.setAttribute("class", classe);
  for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
  return n;
}

/** Le grain : 90 taches minuscules dans une tuile de 128 blg, répétée en
 *  `userSpaceOnUse`. ⭐ C'EST LA TUILE QUI GARANTIT LE « FOND ASSEZ UNI »
 *  qu'Eric demande : elle ne s'étire jamais, donc le grain a la même finesse sur
 *  un panneau court et sur un panneau long. */
function tuileDeGrain(id) {
  const p = forme("pattern", null, { id, width: 128, height: 128, patternUnits: "userSpaceOnUse" });
  const g = forme("g", "parchemin-grain");
  for (let i = 0; i < 90; i++) {
    g.append(forme("ellipse", null, {
      cx: n2(hache(i, 11) * 128), cy: n2(hache(i, 18) * 128),
      rx: n2(.2 + hache(i, 72) * .3), ry: .22
    }));
  }
  p.append(g);
  return p;
}

function flou(id, ecartType) {
  /* ⚠️ LA RÉGION DU FILTRE EST DÉCLARÉE, ET C'EST POUR SAFARI : sans `x/y/width/
     height`, WebKit rogne le flou à la boîte de l'objet et la patine s'arrête net
     sur une ligne droite — l'inverse exact de ce qu'on lui demande. */
  const f = forme("filter", null, { id, x: "-12%", y: "-12%", width: "124%", height: "124%" });
  f.append(forme("feGaussianBlur", null, { stdDeviation: ecartType }));
  return f;
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

  const defs = forme("defs");
  const coupe = forme("clipPath", null, { id: `${id}-coupe` });
  /* ⛔ LE CHEMIN EST RECOPIÉ, ⛔ PAS RÉFÉRENCÉ PAR `<use href>` : le prototype
     partage une `<path id>` entre le fond, la coupe et le fil. Safari a une
     histoire longue avec `use` dans un `clipPath`, et le coût d'une chaîne
     répétée trois fois est nul devant celui d'un moteur qui rend une page vide. */
  coupe.append(forme("path", null, { d: g.d }));
  defs.append(coupe, flou(`${id}-flou`, 3.8), flou(`${id}-flou-fin`, 1.3), tuileDeGrain(`${id}-grain`));
  racine.append(defs);

  racine.append(forme("path", "parchemin-fond", { d: g.d }));

  const dedans = forme("g", null, { "clip-path": `url(#${id}-coupe)` });
  /* ⚖️ LA PATINE EST UN ANNEAU, PAS UNE BORDURE : `evenodd` entre le bord et sa
     copie creusée ne peint QUE la tranche. Floutée, elle s'éteint vers le centre
     — ⛔ une bordure, elle, aurait deux arêtes nettes. */
  dedans.append(forme("path", "parchemin-patine", {
    d: g.d + g.tranche, "fill-rule": "evenodd", opacity: ".20", filter: `url(#${id}-flou)`
  }));
  dedans.append(forme("path", "parchemin-patine", {
    d: g.d + g.lisiere, "fill-rule": "evenodd", opacity: ".07", filter: `url(#${id}-flou-fin)`
  }));
  dedans.append(forme("rect", null, { width: l, height: h, fill: `url(#${id}-grain)`, opacity: ".6" }));
  dedans.append(forme("path", "parchemin-fibres", {
    d: g.fibres, "stroke-width": ".42", "stroke-linecap": "round", opacity: ".32"
  }));
  dedans.append(forme("path", "parchemin-pli", {
    d: g.plis, "stroke-width": ".5", "stroke-linecap": "round", opacity: ".24"
  }));
  dedans.append(forme("path", "parchemin-fil", {
    d: g.d, "stroke-width": ".58", opacity: ".55"
  }));
  racine.append(dedans);

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
