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


/** Les deux seuils de grandeur, en **blg** — donc mesurés APRÈS division par
 *  l'échelle. « La bible §3 » les donne en pixels d'écran ; sous le zoom, un
 *  seuil de mise en page est une quantité de PLACE, pas une taille d'écran. */
const SEUIL_ETROIT = 720;
const SEUIL_LARGE = 1140;

/* ⚖️ LES CRANS MANUELS SONT OBSOLÈTES — Eric, 2026-09-02 : *« si l'auto fait
   bien son travail, effectivement les boutons sont obsolètes, et le
   redimensionnement peut être fait à la main sur la fenêtre du navigateur »*.
   Depuis la règle sacrée (31/08), l'échelle automatique rend déjà le plus
   grand facteur que la fenêtre porte ; un cran choisi à la main ne pouvait
   donc que RAPETISSER le builder — mesuré à 1366 × 1024 : Auto ×1,83,
   « Large » ×1,25. Le libellé mentait dans le sens inverse de celui que la
   note du 30/08 redoutait. La rampe du Menu est partie (lot 118), et avec
   elle `CRANS`, `setCran`, `cranChoisi` et `cranTient`.

   ⛔ UN CHOIX ENREGISTRÉ PAR UNE VERSION ANTÉRIEURE NE DOIT PAS SURVIVRE :
   sans bouton pour le défaire, un joueur resterait figé à ×1 sans savoir
   pourquoi. Les deux clefs — la v1 du 30/08 au matin et la clef 2 du soir —
   sont effacées à chaque application de l'échelle. C'est la loi qui effaçait
   déjà la clef v1, un rang plus haut. */
const CLEFS_MORTES = ["fhpc.echelle.cran", "fhpc.echelle.cran.2"];

/** ⚠️ `localStorage` peut JETER (navigation privée, quota, iframe cloisonnée)
 *  — même loi que `tutoriel.mjs` : effacer une préférence morte n'est jamais
 *  une raison de faire tomber le builder. */
function effacerLesClefsMortes() {
  try {
    for (const clef of CLEFS_MORTES) window.localStorage.removeItem(clef);
  } catch (_) { /* sans mémoire, il n'y a rien à effacer */ }
}

/** Les cotes de l'APP, lues dans les jetons. Elles ne se recopient
 *  pas ici : `--measure` a déjà bougé une fois (migration `ch` → px du 29/08),
 *  et une somme figée dans le JS serait fausse au prochain réglage d'Eric sans
 *  qu'aucun test ne bronche. Le repli n'est qu'un filet pour le stub des tests.
 *  ⚠️ Lues sur `documentElement`, donc HORS du zoom : elles y valent leur
 *  compte de blg, ce qui est justement l'unité de ce calcul.
 *
 *  🔴 DEUX LARGEURS, ET LES CONFONDRE SERAIT LA FAUTE « NOMMER LE TÉMOIN »
 *  (lot 120) :
 *    · `panneau` — la largeur d'UN panneau (375). C'est elle que la GRANDEUR
 *      mesure, et c'est la décision du 31/08 : *« à 1366 blg avec un panneau
 *      de 375, la fenêtre annonçait moyenne et la carte se coupait »* ;
 *    · `largeur` — la largeur de l'APP, un ou deux panneaux plus la gouttière
 *      qui les sépare. C'est elle que l'ÉCHELLE vise, puisque c'est elle qui
 *      doit tenir dans la fenêtre.
 *  ⭐ Une seule formule pour les deux vues : à une colonne elle rend le
 *  panneau nu, à deux `375 × 2 + 8`. Le compte vient de `--colonnes`
 *  (tokens.css), que `data-vue` gouverne — jamais d'un `@media` de largeur
 *  (§0 bis : il ne se réévalue pas sous `zoom`).
 *
 *  `colonnes` : un compte imposé, pour DEMANDER ce que rendrait une autre vue
 *  sans y passer. C'est ce dont la porte du double affichage a besoin —
 *  savoir si deux panneaux tiendraient, alors qu'on n'en affiche qu'un. */
function cotesDeLApp(racine, colonnes) {
  const cs = getComputedStyle(racine);
  const px = (nom, defaut) => {
    const v = parseFloat(cs.getPropertyValue(nom));
    return Number.isFinite(v) && v > 0 ? v : defaut;
  };
  const panneau = px("--panneau-l", 375);
  const gouttiere = px("--sp-8", 8);
  const n = Number.isFinite(colonnes) && colonnes > 0 ? colonnes : px("--colonnes", 1);
  return {
    panneau,
    colonnes: n,
    largeur: panneau * n + gouttiere * (n - 1),
    hauteur: px("--panneau-h", 520)
  };
}

/* ══ L'ÉCHELLE À BARREAUX — Eric, 2026-09-02 ════════════════════════════════
   🔴 *« Concept. Builder plein écran sur mobile. […] Etc… »* · *« 6 crans »*
   🔴 *« Donc largeur plutôt basée sur la largeur, et un plancher à la
   hauteur ; si ça passe pas on saute un cran en dessous. »*
   🔴 *« Tout passe en mode widget pour desktops. Mobile ça prend toute la
   place. »* · *« iPad tu suggères 1/2 donc, là où petit écran tu suggères
   1/3. »*

   ⭐ CE QUE LA FRACTION DIT VRAIMENT — ⚠️ formule de l'ARCHITECTE (30/08), pas
   d'Eric : l'attribution a été corrigée le 02/09, la phrase est gardée :
   *« combien la fenêtre donne au builder, et combien elle laisse à côté »*.
   Ce n'est pas une taille d'écran, c'est un PARTAGE — 1/4 dit « un quart pour
   le builder, trois pour le décor ». La taille en découle, elle ne se décide
   pas ailleurs.

   ⭐ ET LES SIX PARTS SONT LA SUITE 1, 2, 3, 4, 5, 6 — un barreau, un
   diviseur. C'est ce que « 6 crans » veut dire, et les deux cotes qu'Eric a
   données (`tablette` 1/2, `petit` 1/3) tombent exactement dessus.

   ⭐⭐ ET LE DEMI RÉCONCILIE SES DEUX PHRASES : **deux panneaux au demi font
   exactement cent pour cent de la largeur**, sur les quatre formes d'iPad.
   Son *« 1/2 »* et sa *« proposition de passage en affichage double d'office »*
   sont la MÊME idée par les deux bouts — un panneau prend la moitié, deux
   panneaux prennent l'écran. ⭐ La vue double n'est donc pas une exception au
   partage : elle en est la CONSÉQUENCE au barreau `tablette`.

   🔴 LE PARTAGE SE CALCULE SUR LA FENÊTRE COURANTE. C'est ce qui rend
   l'identité ci-dessus vraie (`2 × W/2 = W`, quel que soit W), et c'est
   l'arithmétique de toutes les cotes qu'Eric a validées : `1366/2 = 683`,
   `1024/2 = 512`, `1180/3 = 393`. ⛔ Une taille figée par barreau la
   casserait — et le seul argument qui la défendait (la bande de 375–430 blg
   mesurée sur l'ancienne table) est mort le 02/09, quand Eric a validé
   **683 blg** sur son iPad couché.

   📏 CE QUE ÇA REND, mesuré (largeur du panneau, puis hauteur d'écran prise) :

       barreau    part   768×1024   1024×1366   1366×1024   1920×1080   2560×1440
       tablette   1/2    384 (56%)  512 (56%)   683 (100%)      —           —
       petit      1/3        —          —           —       (voir moyen)     —
       moyen      1/4        —          —           —       480 (66%)       —
       grand      1/5        —          —           —           —       512 (53%)

   ⚠️ `mini` N'EST PAS UN BARREAU, c'est l'état réduit de `mobile` sur les
   écrans de 360 : `360 / 375 = 0,96` — le QUOTIENT, jamais un 0,96 écrit à la
   main. Eric, 31/08 : *« si tu réduis de 4 % la taille sur mini mobile c'est
   ok, donc ce palier s'appelle mini »*. Il sort tout seul du régime `mobile`,
   qui rend la fenêtre telle quelle.

   ⛔ LE `1/3` POUR L'iPAD EST MORT — il portait le vide de 50 à 67 % sur un
   écran couché et tombait SOUS le panneau nu debout (`1024/3 = 341`). Il n'en
   reste rien ici, et rien dans la norme : une règle qui décrit un état retiré
   est pire qu'une règle absente.

   ⛔ ET C'EST LA SEULE DÉCLARATION DES SIX NOMS. Rien ne les recopie — ni un
   test, ni un libellé, ni un commentaire qui les énumère (le tableau
   ci-dessus est une MESURE, un garde la refait). Un renommage est une seule
   édition ; le réglage joueur du lot 134 les LIRA ici. Et si `mini` devait
   redevenir un barreau, ce serait une ligne de plus, pas une refonte. */

/** Les six barreaux, dans l'ordre de l'échelle — du plus GÉNÉREUX au plus
 *  serré, ce qui est aussi l'ordre des écrans qui les posent.
 *
 *  · `depuis` — la largeur de FENÊTRE à partir de laquelle ce barreau est posé ;
 *  · `part`   — le dénominateur du partage, mot pour mot d'Eric.
 *
 *  ⏳ `moyen`, `grand` et `xtra` portent la suite de la série, qu'Eric n'a pas
 *  redonnée après le resserrement du 02/09 ; leurs deux cotes validées
 *  (`tablette` 1/2, `petit` 1/3) la fixent des deux bouts.
 *  ✅ SES DEUX BORNES SONT MESURÉES, PAS CHOISIES, et c'est ce qui fait que le
 *  mot « mini » n'apparaît nulle part dans ce fichier hors du nom d'un cran :
 *    · EN BAS, 768. L'iPad mini debout fait 744 : au demi il rendrait
 *      `744/2 = 372`, soit ×0,99 — **sous le panneau nu**. C'est le seul
 *      appareil de la gamme dans ce cas. La règle ne l'exclut pas par
 *      jugement, elle l'exclut parce qu'il NE PASSE PAS. L'iPad 9,7 juste
 *      au-dessus fait 768. Eric : *« probablement un iPad mini va préférer un
 *      affichage mobile »* · *« du classique au Pro 13 pouces, le 1/2
 *      passera »* ;
 *    · EN HAUT, 1440. `tablette` doit couvrir TOUTES les tablettes couchées,
 *      et la plus large est l'iPad Pro 13 à **1376** ; 1440 est le premier
 *      portable (MacBook Air). ⛔ Un seuil sous 1376 couperait la famille en
 *      deux par la LARGEUR, alors que c'est la HAUTEUR qui doit la couper.
 *  ⭐ ET LE MINI COUCHÉ SE RÈGLE TOUT SEUL : 1133 de large, donc `tablette`,
 *  puis un saut de cran que sa hauteur de 744 impose — il rend 378 × 564.
 *  ⛔ Aucun cas particulier n'est écrit pour lui, et il ne doit jamais l'être. */
/** ⭐ `libelle` — LE MOT QUE LE JOUEUR LIT, et il vit ICI pour la même raison
 *  que `nom` : l'écran Display affiche des crans, et un libellé recopié
 *  ailleurs survivrait à un renommage en mentant. ⛔ Ce n'est PAS une
 *  traduction du nom interne — `nom` est la clef (elle voyage dans
 *  `localStorage`), `libelle` est de l'anglais d'interface. Les deux se
 *  corrigent d'une seule édition, au même endroit. */
export const BARREAUX = Object.freeze([
  { nom: "mini",     depuis: null, part: 1, libelle: "Mini" },
  { nom: "mobile",   depuis: null, part: 1, libelle: "Full screen" },
  { nom: "tablette", depuis:  768, part: 2, libelle: "Half" },
  { nom: "petit",    depuis: 1440, part: 3, libelle: "Third" },
  { nom: "moyen",    depuis: 1680, part: 4, libelle: "Quarter" },
  { nom: "grand",    depuis: 2200, part: 5, libelle: "Fifth" },
  { nom: "xtra",     depuis: 3000, part: 6, libelle: "Sixth" }
].map(Object.freeze));

/** Le barreau que la LARGEUR pose — premier temps du mécanisme, et rien
 *  d'autre n'intervient ici. La hauteur ne parle qu'après. */
export function barreauPour(largeurFenetre, panneau) {
  /* ⭐ `depuis: null` VEUT DIRE « LE PANNEAU NU », lu dans les jetons. C'est
     la frontière `mini` / `mobile`, et elle ne s'écrit pas en chiffre : `mini`
     est exactement la bande où le partage plein écran rend MOINS que le
     dessin, donc où l'échelle passe sous 1. `360 / 375 = 0,96` en sort tout
     seul — le quotient, jamais un littéral.
     ⚠️ `mini` est le premier de la liste, donc le repli naturel : un barreau
     dont le seuil ne peut pas être résolu ne doit pas être choisi. */
  const seuil = (b, i) => (b.depuis === null ? (i === 0 ? 0 : panneau) : b.depuis);
  let choisi = BARREAUX[0];
  BARREAUX.forEach((b, i) => { if (largeurFenetre >= seuil(b, i)) choisi = b; });
  return choisi;
}

/** 🪜 LE VERBE POUR SE DÉPLACER SUR L'ÉCHELLE — un seul, et c'est celui que
 *  le réglage joueur du lot 134 appellera.
 *
 *  🔴 `pas` SE COMPTE EN TAILLE RENDUE, PAS EN INDICE, et c'est le vocabulaire
 *  d'Eric : `-1` est *« un cran en dessous »* — le builder RÉTRÉCIT, donc le
 *  diviseur grandit. ⛔ Le confondre avec l'indice inverserait le saut de cran
 *  et le ferait grossir au lieu de descendre : c'est la faute que ce lot a
 *  failli écrire, et son témoin est l'iPad Air couché (voir `largeurVisee`).
 *  ⛔ Rend `null` aux deux bouts : un appelant au bout n'est pas en erreur. */
export function barreauVoisin(barreau, pas) {
  const i = BARREAUX.indexOf(barreau);
  if (i < 0) return null;
  const j = i - (Number.isFinite(pas) ? pas : 0);
  return j >= 0 && j < BARREAUX.length ? BARREAUX[j] : null;
}

/** La taille d'un barreau sur une fenêtre donnée, en blg — le partage, tout
 *  simplement.
 *  ⚠️ Le panneau nu est un PLANCHER, et il est LU dans les jetons
 *  (`--panneau-l`) : un partage qui rendrait moins que le dessin ne rendrait
 *  pas un builder plus petit, il rendrait un builder coupé. ⛔ Il ne s'applique
 *  pas à `mobile` : c'est là que vit `mini`, et le 96 % y est légitime. */
export function tailleDuBarreau(barreau, panneau, largeurFenetre) {
  if (barreau.part === 1) return largeurFenetre;   /* plein écran : la fenêtre */
  return Math.max(panneau, largeurFenetre / barreau.part);
}

/* ══ 🪜 LES ÉCHELONS — LE DEMI-CRAN, 2026-09-02 ════════════════════════════
   🔴 CE QUE ÇA CORRIGE, MESURÉ AVANT D'ÊTRE ÉCRIT : quand la hauteur ne porte
   pas la part, on descendait d'un CRAN ENTIER. L'iPad Air couché
   (1180 × 820) manque de **61 px** au demi et reculait de `590` à `393` — une
   marche entière pour un petit décrochage.
   📏 Le demi-cran (`1/2,5`) lui rend **472 × 705**, et il tient (705 ≤ 820).

   📏 CE QUE LE PARTAGE FIN CHANGE, BALAYÉ SUR 66 899 FENÊTRES avant d'agir :
   **5 602 rendent un panneau PLUS GRAND · 0 plus petit · 0 qui déborde alors
   qu'elle ne débordait pas.** Le demi-cran ne peut donc que rendre de la
   place — c'est un raffinement de la DESCENTE, jamais un nouveau régime.

   ⚠️ ET LA PORTÉE EST PLUS LARGE QUE LES TROIS TABLETTES ANNONCÉES. Mesuré,
   par hauteur de fenêtre, les largeurs qui changent :

       720 → 965–1205 · 1447–1679 · 1929–2169 · 2411–2651
       768 → 1029–1285 · 1543–1679 · 2058–2199 · 2572–2828
       820 → 1099–1372 · 1648–1679 · 2197–2199 · 2746–2999
       900 → 1206–1439      1024 → 1372–1439      1080 → AUCUNE

   ⭐ La règle qui en sort : **une fenêtre BASSE change, une fenêtre HAUTE
   non** — parce que seule une fenêtre basse déclenchait la descente. Les
   écrans 4:3 (1024 × 768, 1366 × 1024, 1376 × 1032) ne bougent d'aucun pixel,
   et aucune fenêtre de 1080 de haut ou plus non plus.

   ⛔ ET LE PRIX EST RÉEL, IL N'EST PAS CACHÉ : l'automatique atterrit
   désormais sur une part qui **n'est le nom d'aucun cran** (`1/2,5`). C'est
   l'écran Display qui l'absorbe — il montre où l'on est, y compris entre deux
   barreaux, et c'est pour ça que les deux sont dans le même lot. */

/** Un échelon : une PART, et le ou les barreaux qui la nomment.
 *  · sur un barreau      → `barreaux` en porte UN ;
 *  · entre deux barreaux → il en porte DEUX, dans l'ordre de l'échelle.
 *  ⛔ AUCUN NOM NEUF N'EST INVENTÉ ICI, et c'est la condition pour que la
 *  table des barreaux reste la seule déclaration des noms : un demi-cran
 *  n'a pas de nom à lui, il porte ceux de ses deux voisins. */
function echelonEntre(a, b) {
  return Object.freeze({ part: (a.part + b.part) / 2, barreaux: Object.freeze([a, b]) });
}
function echelonDe(barreau) {
  return Object.freeze({ part: barreau.part, barreaux: Object.freeze([barreau]) });
}

/** 🔴 LES CRANS OFFERTS AU JOUEUR — un par PART distincte.
 *  ⛔ `mini` et `mobile` partagent la part 1 (le plein écran) : deux lignes qui
 *  rendraient exactement la même chose seraient une liste qui ment.
 *  ⭐ ET C'EST LE DERNIER DÉCLARÉ DE CHAQUE PART QUI EST OFFERT, parce que la
 *  table range un ÉTAT RÉDUIT AVANT SON RÉGIME : elle dit elle-même que
 *  *« `mini` n'est pas un barreau, c'est l'état réduit de `mobile` »*, et que
 *  `mini` est *« le premier de la liste, donc le repli naturel »*. Offrir un
 *  repli comme un choix serait proposer au joueur l'état où l'on TOMBE.
 *  ⛔ Ce filtre n'écrit aucun nom : c'est la table qui dit lequel, ici comme
 *  partout. */
export const CRANS_OFFERTS = Object.freeze(
  BARREAUX.filter((b, i) => BARREAUX.findLastIndex((a) => a.part === b.part) === i)
);

/** L'échelle FINE, du plus généreux au plus serré : chaque barreau dur, et le
 *  demi-cran entre deux voisins. ⛔ Le plein écran n'y entre pas — il ne
 *  descend jamais (voir `largeurVisee`), il n'a donc pas d'échelon de
 *  descente. */
export const ECHELONS = Object.freeze(CRANS_OFFERTS
  .filter((b) => b.part > 1)
  .flatMap((b, i, durs) => (durs[i + 1] ? [echelonDe(b), echelonEntre(b, durs[i + 1])] : [echelonDe(b)])));

/** Le mot d'un échelon, tel que l'écran Display l'affiche.
 *  ⛔ Il ne fabrique pas de nom : il joint ceux que la table déclare. */
export function motDeLEchelon(echelon) {
  return echelon ? echelon.barreaux.map((b) => b.libelle).join(" – ") : "";
}

/* ══ 🎛️ LA SURCHARGE DU JOUEUR — lot 136, 2026-09-02 ═══════════════════════
   Eric : *« Menu peut avoir une branche S. On y va via un bouton Display.
   Toutes les résolutions en drop down. »*

   🔴 L'AUTO RESTE LE DÉFAUT, ET LE JOUEUR SURCHARGE — il ne remplace pas.
   Une norme se câble en défaut partagé, jamais en mur : sans choix gardé,
   c'est l'automatique qui décide, exactement comme avant ce lot.

   ⛔ ET SURTOUT PAS LES CLEFS `fhpc.echelle.cran*`. Le lot 118 les EFFACE à
   chaque application de l'échelle (`CLEFS_MORTES`, plus haut) : les
   ressusciter mettrait deux mécanismes en travers l'un de l'autre — celui-ci
   écrirait, celui-là effacerait, et le réglage aurait l'air de ne pas tenir.
   Clef neuve, nom neuf, et les mortes restent mortes.

   ⭐ CE QUE LA SURCHARGE REMPLACE, ET CE QU'ELLE NE REMPLACE PAS :
     · elle remplace ① — le barreau que la LARGEUR posait ;
     · elle ne remplace PAS ② — la descente en hauteur, qui reste une
       DÉFENSE. ⛔ Un cran qui ne tient pas en hauteur ne rend pas un builder
       plus grand, il rend un builder COUPÉ. Le joueur qui vise plus grand
       obtient donc le plus grand que sa fenêtre PORTE, et l'écran Display lui
       dit lequel — jamais un libellé qui ment sur ce qu'il rend.

   ⚠️ MÊME MÉCANISME DE PRÉFÉRENCE QUE `fonds.mjs` ET `vue.mjs`, pas un
   second : une clef de navigateur, un `try` qui ne fait jamais tomber le
   builder, et un id gardé qui peut désigner un cran disparu — auquel cas on
   sert l'AUTO sans effacer ce que le joueur a demandé. */
const CLEF_CRAN = "fhpc.affichage.cran";

function lireLaClef(clef) {
  try {
    const valeur = window.localStorage.getItem(clef);
    return typeof valeur === "string" && valeur !== "" ? valeur : null;
  } catch (_) { return null; }
}

/** Le NOM de cran que le joueur a demandé — `null` s'il n'a jamais choisi,
 *  c'est-à-dire s'il est sur Auto. ⛔ Ce n'est pas « le cran servi » : un nom
 *  gardé peut désigner un cran retiré de la table depuis. C'est
 *  `cranSurcharge` qui tranche, et lui seul (même loi que `collectionServie`). */
export function cranVoulu() { return lireLaClef(CLEF_CRAN); }

/** Pose le choix — ⛔ `null` EFFACE et rend la main à l'automatique. C'est le
 *  retour à Auto, et il doit exister : un réglage sans retour est un piège. */
export function setCranVoulu(nom) {
  try {
    if (nom === null || nom === undefined) window.localStorage.removeItem(CLEF_CRAN);
    else window.localStorage.setItem(CLEF_CRAN, String(nom));
  } catch (_) { /* sans mémoire, le choix ne survit pas à la page — tant pis */ }
}

/** Le barreau surchargé, ou `null` (= automatique). Un nom inconnu rend
 *  `null` : on sert l'auto, et ⛔ on n'efface PAS la préférence au passage. */
export function cranSurcharge() {
  const nom = cranVoulu();
  return CRANS_OFFERTS.find((b) => b.nom === nom) || null;
}

/** 🔴 CE QUI EST AMENDÉ, ET CE QUI NE L'EST PAS — 2026-09-02.
 *
 *  La règle sacrée du 31/08 disait `min(largeur/375, hauteur/560)` : *« ce
 *  n'est pas 5 changements de tailles, c'est un redimensionnement qui suit la
 *  fenêtre dans toutes situations »*. Elle rendait ×1,93 sur un 1920 × 1080 —
 *  un panneau de 723 × 1080, **89 % de la hauteur d'écran**, une bande haute
 *  et étroite. C'est ce qu'Eric a vu et appelé *« plus du tout respectée »*.
 *
 *  ⭐ ELLE TIENT ENCORE, INTACTE, LÀ OÙ ERIC L'A LAISSÉE :
 *    · sous `mobile` — *« sur téléphone et tablette, l'appareil décide »* ;
 *    · en vue DOUBLE, quel que soit l'écran : le partage d'Eric parle de
 *      l'*« affichage simple »*, et la vue double a son propre compte de
 *      colonnes. On ne la casse pas.
 *  ⛔ ELLE EST AMENDÉE POUR LA VUE SIMPLE À PARTIR DE `tablette` : la largeur
 *  vient du barreau, et la hauteur ne rabote plus rien (voir `largeurVisee`).
 *
 *  ⛔ ET C'EST BIEN UN RENVERSEMENT DE LA CONTINUITÉ, PAS UN RÉGLAGE : au
 *  delà de 768 l'échelle est DISCRÈTE. C'est ce que « six crans » veut dire,
 *  et c'est ce qui rend le réglage joueur possible — il est construit, c'est
 *  `Menu › Display` (lot 136). ⚠️ Les quatre valeurs de bureau qui étaient
 *  citées ici (×1,00 · ×1,02 · ×1,14 · ×1,31) ne sont plus la mesure du jour :
 *  le demi-cran en a ajouté. Le compte se relit, il ne se recopie pas. */

/** La largeur que le builder VISE, en blg — le mécanisme d'Eric en deux temps.
 *
 *  ① LA LARGEUR POSE LE BARREAU. L'écran choisit son barreau, le barreau
 *     donne sa taille. Rien d'autre n'intervient à ce stade.
 *  ② LA HAUTEUR NE FAIT QUE DESCENDRE. Si la place en hauteur ne porte pas la
 *     taille (`taille × 560/375`), ⛔ on ne rabote pas la largeur d'un
 *     continuum : on descend d'un ÉCHELON, autant de fois qu'il le faut.
 *
 *  🪜 ET UN ÉCHELON EST UN DEMI-CRAN DEPUIS LE LOT 136 — voir la table des
 *  `ECHELONS`. La descente était d'un barreau entier jusqu'au 02/09 ; elle
 *  faisait reculer l'iPad Air couché de 590 à 393 pour 61 px manquants.
 *  ⚠️ « EN DESSOUS » SE COMPTE SUR L'ÉCHELLE, ⛔ jamais « le partage du palier
 *  d'en dessous appliqué à cet écran-ci » : sur un 3440, `grand` appliqué à la
 *  fenêtre rendrait 573 contre 491 — la seconde lecture MONTE, et elle
 *  casserait tout.
 *  ⛔ La descente ENJAMBE un échelon qui ne rend pas moins — le plancher du
 *  panneau nu peut en rattraper deux — et elle s'arrête sous le dernier :
 *  là, il n'y a rien.
 *  ⚠️ SI MÊME LE DERNIER NE PASSE PAS EN HAUTEUR — une fenêtre de bureau de
 *  moins de 560 de haut — le builder garde 375 et déborde. C'est un cas à
 *  signaler à Eric, pas un huitième barreau à inventer. */
function largeurVisee(largeurFenetre, hauteurFenetre, p, impose) {
  return viseeEtEchelon(largeurFenetre, hauteurFenetre, p, impose).taille;
}

/** La largeur visée ET l'échelon qui l'a produite — deux réponses à la même
 *  lecture, parce que l'écran Display doit NOMMER où l'on a atterri, et qu'un
 *  second parcours de l'échelle pour retrouver le nom pourrait diverger du
 *  premier. Une lecture, deux sorties.
 *
 *  `impose` — le barreau que le JOUEUR a choisi, ou `null` pour l'automatique.
 *  Il remplace le premier temps (la largeur pose le barreau) et rien d'autre. */
function viseeEtEchelon(largeurFenetre, hauteurFenetre, p, impose) {
  /* ⛔ LA VUE DOUBLE NE PASSE PAS PAR LES BARREAUX : le partage d'Eric parle
     de l'*« affichage simple »*, et deux panneaux au demi font déjà la
     largeur de l'écran. La règle sacrée du 31/08 la gouverne, intacte — c'est
     elle que `laPlaceDuDouble` interroge, et ce lot ne la referme pas. */
  if (p.colonnes !== 1) return { taille: largeurFenetre, echelon: null };
  const barreau = impose || barreauPour(largeurFenetre, p.panneau);
  /* ⛔ `mini` ET `mobile` NE SAUTENT PAS DE CRAN : ils prennent toute la place
     et c'est la règle sacrée du 31/08 qui plafonne leur hauteur, en continu —
     *« sur téléphone et tablette, l'appareil décide »*. Un saut de cran ici
     rendrait un panneau de 375 sur un téléphone de 700, ce qui n'est plus
     « plein écran ». */
  if (barreau.part === 1) return { taille: largeurFenetre, echelon: echelonDe(barreau) };
  let i = ECHELONS.findIndex((e) => e.part === barreau.part);
  /* ⚠️ Un barreau hors de l'échelle fine n'existe pas — mais `findIndex` rend
     −1 plutôt que de crier, et un −1 lu comme un indice sauterait au dernier
     échelon. On retombe sur le premier, jamais sur un indice négatif. */
  if (i < 0) i = 0;
  let echelon = ECHELONS[i];
  let taille = tailleDuBarreau(echelon, p.panneau, largeurFenetre);
  const parHauteur = p.hauteur / p.panneau;   /* le ratio sacré, par l'autre bout */
  while (taille * parHauteur > hauteurFenetre) {
    const dessous = ECHELONS[i + 1];
    if (!dessous) break;                       /* passé le dernier, il n'y a rien */
    i += 1;
    const moindre = tailleDuBarreau(dessous, p.panneau, largeurFenetre);
    /* ⭐ UN ÉCHELON QUI NE RÉTRÉCIT PAS EST ENJAMBÉ, PAS UN POINT D'ARRÊT : le
       plancher du panneau nu peut rattraper deux échelons voisins, et un cran
       qui rend la même chose ne sert à rien. Descendre veut dire RÉTRÉCIR.
       ⛔ Et l'échelon RETENU est celui qui a produit la taille servie, jamais
       celui qu'on vient d'enjamber : nommer un cran qui n'a rien changé
       serait exactement le libellé qui ment. */
    if (moindre < taille) { taille = moindre; echelon = dessous; }
  }
  return { taille, echelon };
}

/** Le régime : sur les barreaux, ou sous la règle sacrée du 31/08 ?
 *  ⛔ Les deux conditions sont NÉCESSAIRES, et les confondre casserait la vue
 *  double : elle garde la règle sacrée sur tous les écrans.
 *  ⚠️ ET LE CRAN IMPOSÉ COMPTE ICI AUSSI : un joueur qui choisit le plein
 *  écran sur un bureau doit retomber sous la règle sacrée, sinon son panneau
 *  prendrait 1920 blg de large. */
function surLesBarreaux(largeurFenetre, p, impose) {
  const barreau = impose || barreauPour(largeurFenetre, p.panneau);
  return p.colonnes === 1 && barreau.part !== 1;
}

export function echelleQuiTient(largeurFenetre, hauteurFenetre, racine, colonnes, impose) {
  const p = cotesDeLApp(racine, colonnes);
  const parLargeur = largeurVisee(largeurFenetre, hauteurFenetre, p, impose) / p.largeur;
  /* 🔴 PAS DE `min` SUR LES BARREAUX, ET C'EST LE CŒUR DE L'AMENDEMENT : la
     hauteur a DÉJÀ parlé, en faisant descendre d'un cran. La reprendre ici en
     rapport continu ramènerait exactement la bande haute et étroite qu'Eric
     refuse — et ferait passer un 1920 × 1080 de ×1,02 à ×1,93. */
  const f = surLesBarreaux(largeurFenetre, p, impose)
    ? parLargeur
    : Math.min(parLargeur, hauteurFenetre / p.hauteur);
  return Number.isFinite(f) && f > 0 ? f : 1;
}

/** 🚪 LA PORTE DU DOUBLE AFFICHAGE — lot 120.
 *
 *  Le double affichage n'est offert que si la fenêtre porte DEUX panneaux à
 *  une échelle d'au moins 1 : sous ce seuil, deux panneaux ne tiendraient
 *  qu'en rapetissant le dessin sous sa taille de lecture, ce qui est
 *  exactement ce que la règle sacrée refuse de faire subir aux organes.
 *
 *  📏 CE QUE ÇA VAUT, mesuré sur les cotes du jour (375 × 560, gouttière 8) :
 *  la fenêtre doit faire au moins **758 × 560 px**. Un iPad couché
 *  (1366 × 1024) rend ×1,80 et REMPLIT l'écran ; un iPhone debout
 *  (375 × 812) rend ×0,49 et reste donc en vue simple.
 *
 *  ⛔ ELLE NE SE LIT PAS DANS UN `@media` (§0 bis), et elle ne se lit pas non
 *  plus sur `--colonnes` : on demande ce que rendraient DEUX colonnes pendant
 *  qu'on en affiche peut-être une. C'est à ça que sert le compte imposé. */
export function laPlaceDuDouble(largeurFenetre, hauteurFenetre, racine) {
  return echelleQuiTient(largeurFenetre, hauteurFenetre, racine, 2) >= 1;
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

/** L'échelle RÉELLEMENT SERVIE — l'automatique, surchargé par le choix du
 *  joueur s'il en a un. ⛔ Deux fonctions et pas une, délibérément : `cranAuto`
 *  doit rester la réponse de l'AUTOMATIQUE SEUL, parce que l'écran Display
 *  affiche les deux côte à côte (*« elle dit lequel l'auto a choisi »*). Les
 *  confondre rendrait le tableau tautologique — l'auto dirait toujours ce que
 *  le joueur vient de demander. */
export function cranEffectif(largeurFenetre, hauteurFenetre, racine) {
  return echelleQuiTient(largeurFenetre, hauteurFenetre, racine, undefined, cranSurcharge());
}

/** 📋 CE QUE L'ÉCRAN DISPLAY AFFICHE — tout lu ici, rien recalculé là-bas.
 *
 *  🔴 UN ÉCRAN NE REFAIT PAS L'ARITHMÉTIQUE DE L'ÉCHELLE. C'est la loi des
 *  écrans du dépôt (« un écran REÇOIT l'état, il ne va pas le chercher ») et
 *  c'est aussi la seule façon d'être sûr que la ligne « Auto » et le panneau
 *  affiché parlent du même calcul.
 *
 *  Rend :
 *   · `auto`     — l'échelon que l'automatique choisit sur cette fenêtre ;
 *   · `choisi`   — le barreau surchargé, ou `null` (le joueur est sur Auto) ;
 *   · `effectif` — l'échelon réellement servi (l'un ou l'autre, descendu) ;
 *   · `offres`   — une ligne par cran offert : le barreau, l'échelon où il
 *     atterrit sur CETTE fenêtre, et la taille peinte en pixels.
 *
 *  ⭐ `rendu` EST CE QUE L'ŒIL RECEVRA, pas la part demandée : c'est
 *  `--panneau-l` × l'échelle, donc la descente de hauteur y est déjà. Un
 *  tableau qui afficherait la part demandée mentirait précisément là où la
 *  descente mord — c'est-à-dire là où le joueur a besoin d'être informé. */
export function etatDeLEchelle(fenetre, racine) {
  const vue = fenetre || window;
  const html = racine || document.documentElement;
  const l = vue.innerWidth;
  const h = vue.innerHeight;
  const p = cotesDeLApp(html);
  const rendu = (impose) => {
    const f = echelleQuiTient(l, h, html, undefined, impose);
    return { largeur: p.panneau * f, hauteur: p.hauteur * f, facteur: f };
  };
  const choisi = cranSurcharge();
  return {
    auto: viseeEtEchelon(l, h, p, null).echelon,
    autoRendu: rendu(null),
    choisi,
    effectif: viseeEtEchelon(l, h, p, choisi).echelon,
    offres: CRANS_OFFERTS.map((b) => ({
      barreau: b,
      echelon: viseeEtEchelon(l, h, p, b).echelon,
      rendu: rendu(b)
    }))
  };
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
  effacerLesClefsMortes();
  /* 🔴 L'EFFECTIF, PAS L'AUTO — depuis le lot 136 le joueur peut surcharger le
     cran depuis Menu › Display. ⛔ Et `effacerLesClefsMortes` reste au-dessus :
     il efface les clefs du lot 118, jamais celle de la surcharge (autre nom,
     autre mécanisme). Les mettre dans la même liste rendrait le réglage
     inopérant sans qu'aucun test ne bronche. */
  const cran = cranEffectif(vue.innerWidth, vue.innerHeight, html);
  html.style.setProperty("--echelle", String(cran));
  /* 🔴 LA GRANDEUR SE LIT SUR LE PANNEAU, PLUS SUR LA FENÊTRE — 2026-08-31.
     C'est la suite exacte du défaut que le lot 85 avait trouvé (« un seuil lu
     sur la fenêtre brute est juste au cran 1 et faux à tous les autres ») :
     depuis que `.app` s'arrête à `--panneau-l`, la fenêtre n'est plus ce que
     le dessin occupe. Mesuré au banc : à 1366 blg avec un panneau de 375, la
     fenêtre annonçait « moyenne » et la carte se coupait de 39 blg — forcer
     « etroite » à la main a fait tomber le débordement à 15. Le seuil doit
     donc mesurer LE PANNEAU. */
  /* ⚠️ ET C'EST LE PANNEAU QU'ON MESURE, PAS L'APP — lot 120, « nommer le
     témoin ». La grandeur dit la place d'un DESSIN (375 blg, toujours) ; la
     largeur de l'app dit ce qui doit tenir dans la fenêtre (375 ou 758). Les
     confondre ferait basculer tout le builder en grandeur « moyenne » le jour
     où l'on ouvre un second panneau, alors qu'aucun écran n'a gagné un pixel. */
  const grandeur = grandeurDe(cotesDeLApp(html).panneau);
  html.dataset.grandeur = grandeur;
  return { cran, grandeur };
}
