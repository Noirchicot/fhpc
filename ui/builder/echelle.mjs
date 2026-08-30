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

/* ⚖️ LA CLEF v1 EST ABANDONNÉE ET ACTIVEMENT EFFACÉE — 2026-08-30 au soir.
   Pendant sa première heure en ligne, le menu enregistrait sous
   `fhpc.echelle.cran` des choix faits sous une étiquette trompeuse :
   « Standard » se lisait comme « le réglage normal » et figeait en réalité le
   cran de base — mesuré sur l'iPad d'Eric, qui l'a tapé en croyant choisir le
   défaut, puis a cherché pourquoi rien ne grandissait. Un choix recueilli par
   un instrument qui ment n'est pas un choix : la clef est abandonnée, pas
   migrée, et on l'efface au passage pour que personne ne garde un cran qu'il
   n'a jamais voulu. Les choix faits DEPUIS la note corrigée vivent sous la
   clef 2 et sont, eux, dignes de foi. */
const CLEF_CRAN = "fhpc.echelle.cran.2";
const CLEF_MORTE = "fhpc.echelle.cran";

/** ⚠️ `localStorage` peut JETER (navigation privée, quota, iframe cloisonnée)
 *  — même loi que `tutoriel.mjs` : une préférence d'affichage n'est jamais une
 *  raison de faire tomber le builder. On retombe sur l'automatique, et on le
 *  dit dans le code plutôt que de laisser un `try` muet. */
function lireCran() {
  try {
    window.localStorage.removeItem(CLEF_MORTE); // la clef v1, effacée — voir sa note
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

/** Les trois cotes du PANNEAU, lues dans les jetons. Elles ne se recopient
 *  pas ici : `--measure` a déjà bougé une fois (migration `ch` → px du 29/08),
 *  et une somme figée dans le JS serait fausse au prochain réglage d'Eric sans
 *  qu'aucun test ne bronche. Le repli n'est qu'un filet pour le stub des tests.
 *  ⚠️ Lues sur `documentElement`, donc HORS du zoom : elles y valent leur
 *  compte de blg, ce qui est justement l'unité de ce calcul. */
function cotesDuPanneau(racine) {
  const cs = getComputedStyle(racine);
  const px = (nom, defaut) => {
    const v = parseFloat(cs.getPropertyValue(nom));
    return Number.isFinite(v) && v > 0 ? v : defaut;
  };
  return { largeur: px("--panneau-l", 375), hauteur: px("--panneau-h", 520) };
}

/** 🔴 L'ÉCHELLE EST CONTINUE — Eric, 2026-08-31 :
 *  *« ce n'est pas 5 changements de tailles, c'est un redimensionnement qui
 *  suit la fenêtre dans toutes situations. RÈGLE SACRÉE : le builder garde
 *  toujours son ratio. »*
 *
 *  ⭐ CE QUE ÇA SIMPLIFIE, ET C'EST LE CŒUR DU LOT : le panneau ne se serre
 *  plus jamais, ne se coupe plus jamais, ne perd plus jamais sa gouttière. Il
 *  vaut **toujours exactement `--panneau-l` × `--panneau-h` blg** ; c'est le
 *  PIXEL qui grandit ou rapetisse sous lui. La feuille n'a donc plus rien à
 *  arbitrer — plus de `min(100%, …)`, plus de plancher à défendre.
 *
 *  ⛔ ET ÇA RENVERSE « LE PLANCHER EST 1 » (30/08). Sous 375 blg de large,
 *  le facteur descend sous 1 — un 360 rend 0,96. C'est VOULU et c'est mieux
 *  que ce qu'on avait : la règle d'hier faisait perdre 15 blg à la carte sur
 *  un téléphone de 360 (mesuré, et Eric l'avait accepté) ; ici rien n'est
 *  retiré, tout est simplement 4 % plus petit. La proportion, elle, ne cède
 *  jamais — c'est la règle sacrée.
 *  ⚠️ Rien ne borne le haut non plus : sur un mur de 4 000 px l'app suit. Si
 *  un plafond devient nécessaire, il se posera comme une cote d'Eric, pas
 *  comme une prudence d'architecte. */
export function echelleQuiTient(largeurFenetre, hauteurFenetre, racine) {
  const p = cotesDuPanneau(racine);
  const parLargeur = largeurFenetre / p.largeur;
  const parHauteur = hauteurFenetre / p.hauteur;
  const f = Math.min(parLargeur, parHauteur);
  return Number.isFinite(f) && f > 0 ? f : 1;
}

/** Un cran CHOISI à la main tient-il ? Il tient s'il ne demande pas plus que
 *  ce que la fenêtre porte — sinon le panneau sortirait de l'écran.
 *  ⛔ On ne CLAMPE toujours pas en silence : le menu grise, il ne transforme
 *  pas. Un réglage qui se change tout seul est un réglage qui ment. */
export function cranTient(cran, largeurFenetre, hauteurFenetre, racine) {
  return cran <= echelleQuiTient(largeurFenetre, hauteurFenetre, racine) + 1e-9;
}

/** L'échelle automatique — le facteur exact, jamais arrondi à un cran.
 *
 *  📏 Ce qu'elle rend, mesuré, pour un panneau 375 × 560 :
 *      iPhone   375 × 812   → min(1,00 ; 1,45) = **1,00**
 *      iPad ▯  1024 × 1366  → min(2,73 ; 2,44) = **2,44**
 *      iPad ▭  1366 × 1024  → min(3,64 ; 1,83) = **1,83**
 *      360 nu   360 × 640   → min(0,96 ; 1,14) = **0,96**
 *  ⚠️ En paysage c'est la HAUTEUR qui décide, et l'app rapetisse quand on
 *  couche l'appareil. C'est le prix de la proportion, et Eric l'a redemandée
 *  après l'avoir vu chiffré. */
export function cranAuto(largeurFenetre, hauteurFenetre, racine) {
  return echelleQuiTient(largeurFenetre, hauteurFenetre, racine);
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

/** Le facteur du zoom, mesuré sur LA RACINE D'ÉCHELLE (`.app`).
 *
 *  🔴 IL EXISTE PARCE QUE `facteurZoom(n)` NE PEUT PAS CONVERTIR `n` LUI-MÊME,
 *  et j'ai mis une nuit à le voir. `facteurZoom(n)` vaut `rect(n) / offset(n)` ;
 *  écrire `rect(n) / facteurZoom(n)` se simplifie donc en `offset(n)` — un
 *  ENTIER. C'est exactement ce que faisait `centreDe` (equipment-step.mjs)
 *  depuis le lot 85, sous une note qui promettait le contraire : *« c'est lui
 *  qui donne la FRACTION que clientWidth arrondit… diviser garde la
 *  fraction »*. Elle ne la gardait pas. Une note qui affirme ce qui n'est pas
 *  est le défaut le plus grave de ce dépôt.
 *
 *  ⭐ LA SORTIE EST DE MESURER AILLEURS : `.app` porte le zoom, son rapport
 *  est un vrai facteur, et diviser le rectangle d'un AUTRE nœud par lui rend
 *  bien une largeur de mise en page FRACTIONNAIRE.
 *  ⚠️ `keepInView` (socle.mjs) n'a pas ce défaut et n'a pas à changer : il
 *  divise un ÉCART entre deux rectangles distincts, jamais le rectangle du
 *  nœud qui a servi à mesurer le facteur. */
export function facteurZoomCourant(document_) {
  const doc = document_ || (typeof document !== "undefined" ? document : null);
  const racine = doc && doc.querySelector ? doc.querySelector(".app") : null;
  return racine ? facteurZoom(racine) : 1;
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
  const cran = choisi === null ? cranAuto(vue.innerWidth, vue.innerHeight, html) : choisi;
  html.style.setProperty("--echelle", String(cran));
  /* 🔴 LA GRANDEUR SE LIT SUR LE PANNEAU, PLUS SUR LA FENÊTRE — 2026-08-31.
     C'est la suite exacte du défaut que le lot 85 avait trouvé (« un seuil lu
     sur la fenêtre brute est juste au cran 1 et faux à tous les autres ») :
     depuis que `.app` s'arrête à `--panneau-l`, la fenêtre n'est plus ce que
     le dessin occupe. Mesuré au banc : à 1366 blg avec un panneau de 375, la
     fenêtre annonçait « moyenne » et la carte se coupait de 39 blg — forcer
     « etroite » à la main a fait tomber le débordement à 15. Le seuil doit
     donc mesurer LE PANNEAU. */
  const grandeur = grandeurDe(cotesDuPanneau(html).largeur);
  html.dataset.grandeur = grandeur;
  return { cran, grandeur, auto: choisi === null };
}
