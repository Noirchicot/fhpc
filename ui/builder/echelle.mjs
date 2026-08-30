/* ══ L'ÉCHELLE — le zoom du builder, et la grandeur qui en découle ═══════════
   📐 Eric, 2026-08-30, en une phrase qui tient tout le module :

     🔴 *« TOUT LE BUILDER SUIT LE ZOOM, LES RATIOS NE CHANGENT NULLE PART.
     Tout grandit de manière proportionnelle. »*

   Le mécanisme vit dans `shell.css` — une déclaration, `zoom: var(--echelle)`
   sur `.app`. Ce fichier ne fait que deux choses : dire QUELLE valeur, et
   dire ce que la fenêtre vaut UNE FOIS zoomée.

   ⭐ LE **blg** — l'unité du dessin (tokens.css la définit). Un blg vaut un
   `px` de feuille une fois le zoom appliqué : `--t4: 16px` se lit « T4 = 16
   blg », et seize blg font 16 pixels au cran 1, 32 au cran 2. Le nombre de
   blg ne change jamais ; c'est le pixel qui bouge sous lui.

   🔴 POURQUOI LA GRANDEUR EST CALCULÉE ICI ET PLUS DANS UN `@media`.
   Mesuré au banc, sur le vrai builder : **une requête média ne se réévalue
   pas sous `zoom`**. À 1024 au cran 1,5 — fenêtre effective 683 blg, donc
   sous le seuil étroit — le drapeau annonçait toujours « wide » ; à 1920 au
   cran 5, `@media (min-width: 1140px)` matchait encore et `--rail-w` rendait
   120 blg, soit **600 pixels réels**. Le seuil ne peut donc plus vivre dans
   la feuille : il vit ici, où l'on connaît l'échelle.

   ⛔ ET C'EST LE SEUL ENDROIT DU DÉPÔT OÙ 720 ET 1140 SONT ÉCRITS. C'est la
   même loi qu'avant (garde 5 des jetons), à l'adresse près : le lot 38
   l'avait mise dans `shell.css` parce qu'un `@media` ne sait pas lire une
   custom property ; il n'y a plus de `@media`, donc plus de raison. */

/** Les cinq crans. Le PLANCHER est 1, et c'est une décision d'Eric —
 *  *« le plancher c'est la taille 360 sur laquelle on travaille »* : rien ne
 *  rétrécit jamais sous le barème ratifié, donc aucun texte ne peut passer
 *  sous T1. Toute la question du « plancher sous 12 px » tombe d'elle-même.
 *
 *  ⏳ LE PLAFOND EST LE SEUL NOMBRE QU'ERIC N'A PAS TRANCHÉ. Il a donné un
 *  ordre de grandeur — *« sur mega écran zoom x5 »* — et la formule ci-dessous
 *  lui donne raison : un 4K non mis à l'échelle demande ×4,94. Trois est posé
 *  ici comme défaut défendable (corps à 48 blg, fenêtre effective de 640 blg
 *  sur un 1920) ; monter à 5 est UN chiffre à changer dans ce tableau, et
 *  rien d'autre. */
export const CRANS = [1, 1.25, 1.5, 2, 3];

/** Les deux seuils de grandeur, en **blg** — donc mesurés APRÈS division par
 *  l'échelle. « La bible §3 » les donne en pixels d'écran ; sous le zoom, un
 *  seuil de mise en page est une quantité de PLACE, pas une taille d'écran. */
const SEUIL_ETROIT = 720;
const SEUIL_LARGE = 1140;

const CLEF_CRAN = "fhpc.echelle.cran";

/** ⚠️ `localStorage` peut JETER (navigation privée, quota, iframe cloisonnée)
 *  — même loi que `tutoriel.mjs` : une préférence d'affichage n'est jamais une
 *  raison de faire tomber le builder. On retombe sur l'automatique, et on le
 *  dit dans le code plutôt que de laisser un `try` muet. */
function lireCran() {
  try {
    const brut = window.localStorage.getItem(CLEF_CRAN);
    if (brut === null) return null;
    const n = Number(brut);
    return CRANS.includes(n) ? n : null;
  } catch (_) { return null; }
}

/** `null` efface le choix et rend la main à l'automatique — c'est le geste
 *  « Auto » du menu, pas une absence de réglage. */
export function setCran(valeur) {
  try {
    if (valeur === null) window.localStorage.removeItem(CLEF_CRAN);
    else window.localStorage.setItem(CLEF_CRAN, String(valeur));
  } catch (_) { /* sans mémoire, l'automatique reprend au rechargement */ }
}

export function cranChoisi() { return lireCran(); }

/** La largeur que le DESSIN veut : le plafond de la fiche, plus le rail, plus
 *  les deux gouttières de scène.
 *
 *  🔴 LUE DANS LES JETONS, JAMAIS ÉCRITE ICI. `--measure` a déjà bougé une
 *  fois (625 depuis la migration `ch` → px du 29/08) et `--rail-w` deux fois
 *  (84 → 78 → 90). Une somme recopiée dans le JS serait fausse au prochain
 *  réglage d'Eric, sans qu'aucun test ne bronche — c'est la famille exacte du
 *  piège « une somme ne se fige pas, elle se déduit » (fiche.css, 16/08).
 *  ⚠️ Lue sur `documentElement`, donc HORS du zoom : ces jetons y valent leur
 *  compte de blg, ce qui est justement l'unité de ce calcul. */
function largeurVoulue(racine) {
  const cs = getComputedStyle(racine);
  const px = (nom, defaut) => {
    const v = parseFloat(cs.getPropertyValue(nom));
    return Number.isFinite(v) && v > 0 ? v : defaut;
  };
  return px("--measure", 625) + px("--rail-w", 90) + 2 * px("--sp-16", 16);
}

/** Le PLANCHER : la place minimale, en blg, sous laquelle l'écran à rail ne
 *  tient plus — le rail, ses deux gouttières de scène, et le plancher de la
 *  fiche.
 *
 *  📏 LES TROIS SONT MESURÉS, PAS CHOISIS, et chacun est cloué par un mot réel
 *  de l'interface : le rail par `Dragonborn` (70,4 blg en gras + 2 × 8 de
 *  rembourrage), la colonne de stats par `Weapons : Smpl+FL` (115,1 pour 118),
 *  l'image parce que c'est un cadre. La somme vaut **340** aujourd'hui, et
 *  CADRES §4 la publie — mais elle se LIT, elle ne se recopie pas : le rail a
 *  déjà bougé deux fois. */
function plancher(racine) {
  const cs = getComputedStyle(racine);
  const px = (nom, defaut) => {
    const v = parseFloat(cs.getPropertyValue(nom));
    return Number.isFinite(v) && v > 0 ? v : defaut;
  };
  return px("--rail-w", 90) + px("--fiche-dalle-w", 242) + 2 * px("--sp-4", 4);
}

/** Ce cran laisse-t-il encore de quoi dessiner ?
 *
 *  ⭐ C'EST CE QUI REMPLACE LA BASCULE QUE CE LOT N'A PAS CONSTRUITE. Plutôt
 *  que de replier le rail quand la place manque — un second régime de mise en
 *  page à dessiner, à mesurer et à garder —, le menu n'OFFRE pas les crans qui
 *  ne tiennent pas. Un réglage qui ne peut pas décevoir n'a pas besoin de
 *  rattrapage.
 *  ⛔ Et on ne CLAMPE PAS en silence : un cran choisi qui se transformerait en
 *  un autre est un réglage qui ment. Il est proposé, ou il ne l'est pas. */
export function cranTient(cran, largeurFenetre, racine) {
  return largeurFenetre / cran >= plancher(racine);
}

/** Le cran automatique : le plus grand qui laisse encore le dessin tenir dans
 *  la fenêtre. En dessous de la largeur voulue on reste au plancher — le
 *  téléphone et la colonne de VTT sont DÉJÀ dessinés pour cette taille-là,
 *  ils n'ont rien à agrandir.
 *
 *  ⭐ LA FORMULE EST LA LIMITE HAUTE ELLE-MÊME, bornée par le tableau des
 *  crans. Un 1920 demande ×2,47 et reçoit le cran 2 ; un 4K non mis à
 *  l'échelle demande ×4,94 et reçoit le plafond. */
export function cranAuto(largeurFenetre, racine) {
  const voulue = largeurVoulue(racine);
  const vise = largeurFenetre / voulue;
  let cran = CRANS[0];
  /* ⚠️ DEUX CONDITIONS, PAS UNE : le cran doit valoir la peine (`<= vise`) ET
     laisser de quoi dessiner (`cranTient`). La première seule suffisait tant
     que la largeur voulue dépassait le plancher — c'est vrai aujourd'hui (777
     contre 340), ça n'a pas à le rester. Un garde mesure la promesse. */
  for (const c of CRANS) if (c <= vise && cranTient(c, largeurFenetre, racine)) cran = c;
  return cran;
}

/** ⚠️ LE CONVERTISSEUR — 2026-08-30, et il vient d'un défaut MESURÉ.
 *
 *  🔴 SOUS `zoom`, LES LECTURES GÉOMÉTRIQUES SE SÉPARENT EN DEUX FAMILLES, et
 *  elles ne s'accordent plus. Mesuré sur un bloc de 200 px dans `.app` :
 *
 *      cran            1      2      3
 *      offsetWidth    200    200    200     ← la MISE EN PAGE, en blg
 *      clientWidth    200    200    200     ← idem
 *      computed width 200    200    200     ← idem
 *      rect.width     200    400    600     ← ce qui est PEINT, en pixels
 *
 *  ⛔ LES MÉLANGER DONNE UN RÉSULTAT FAUX × LE CRAN, et deux endroits le
 *  faisaient : `keepInView` (socle) calculait un écart en pixels peints et
 *  l'ajoutait à `scrollTop`, qui est en blg ; la roue d'Equipment lisait la
 *  largeur d'un cran en blg et le champ de la piste en pixels peints. Aucun
 *  des deux ne se voyait au cran 1 — c'est pour ça que ce convertisseur existe
 *  plutôt qu'une relecture attentive.
 *
 *  ⭐ IL SE MESURE SUR LE NŒUD, il ne lit aucun jeton : le rapport entre les
 *  deux familles EST le zoom effectif à cet endroit, quel que soit l'empilement.
 *  ⚠️ Repli à 1 si la mise en page n'existe pas — c'est le cas du stub DOM des
 *  tests, qui ne fabrique pas de géométrie et n'a rien à convertir. */
export function facteurZoom(noeud) {
  if (!noeud || typeof noeud.getBoundingClientRect !== "function") return 1;
  const enPage = noeud.offsetWidth;
  if (!enPage) return 1;
  const peint = noeud.getBoundingClientRect().width;
  return peint > 0 ? peint / enPage : 1;
}

/** La grandeur, en blg. C'est ce que `data-grandeur` porte, et les feuilles
 *  n'ont jamais à connaître les deux nombres. */
export function grandeurDe(largeurBlg) {
  if (largeurBlg < SEUIL_ETROIT) return "etroite";
  if (largeurBlg < SEUIL_LARGE) return "moyenne";
  return "large";
}

/** Pose l'échelle et la grandeur sur `<html>`, et rend ce qu'elle a posé.
 *
 *  ⛔ DEUX ATTRIBUTS, AUCUN NŒUD. C'est la règle du socle (SOCLE.md, « le
 *  cadre ») : on écrit des attributs sur des nœuds qui ne meurent pas, jamais
 *  du DOM. Un changement d'échelle ne redessine donc RIEN — le navigateur
 *  remet la page en page tout seul, et le défilement survit. */
export function appliquerEchelle(fenetre, racine) {
  const vue = fenetre || window;
  const html = racine || document.documentElement;
  const choisi = lireCran();
  const cran = choisi === null ? cranAuto(vue.innerWidth, html) : choisi;
  html.style.setProperty("--echelle", String(cran));
  const grandeur = grandeurDe(vue.innerWidth / cran);
  html.dataset.grandeur = grandeur;
  return { cran, grandeur, auto: choisi === null };
}
