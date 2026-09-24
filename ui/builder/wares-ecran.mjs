/* ══ L'ÉCRAN WARES — la boutique, dictée par Eric le 2026-09-20 ════════════════
   Trois dalles : le tambour à DEUX étages, la grille de douze, le pied. Les lois vivent dans
   `NORMES.md` (ancres `equipement-wares-*`), les cotes dans `wares-disposition.mjs`.

   ⛔ CET ÉCRAN NE SAIT RIEN DU DOCUMENT, et c'est ce qui le rend regardable au banc : le
   pilote lui passe des catégories, des sous-catégories, une page de jetons et des comptes.
   Il ne lit aucun record, il n'écrit aucune ligne, il ne connaît pas le mot « personnage ».

   ⭐ IL NE REDESSINE RIEN DE CE QUI EXISTE :
     · la roue vient de `roue-tambour.mjs` — module feuille, et Wares en monte DEUX ;
     · le jeton vient de `jeton-objet.mjs` — le nom sur trois lignes, la bande des quatre
       marques. Eric, 20/09 : *« les jetons EXACTEMENT la même règle que dans les menus
       Gear/Backpack »*. ⛔ Pas de prix sur le jeton.
   ⚠️ CE QUI RESTE ÉCRIT TROIS FOIS, ET JE LE NOMME SANS LE CORRIGER ICI : la rangée du pied
   (`data-rangee`, borne | majeurs | borne) est fabriquée par R, par le sac et maintenant par
   Wares. Sa GÉOMÉTRIE n'a qu'un écrivain — la grille de `[data-rangee]`, §6 pré — donc la
   redite est de vingt lignes de structure, pas de cote. Elle appelle son lot ; ce n'est pas
   celui-ci, et un quatrième porteur le rendra nécessaire. */

import {
  DALLE, DALLES, REMBOURRAGE, REMBOURRAGE_GRILLE, ECART, ECART_ETAGES, TOUCH, JETON, ROUE,
  RENDU_GRILLE, PIED, RANGEE, PORTES, PAR_PAGE, COLONNES_GRILLE, RANGEES_GRILLE, FOND, CLEF_DE,
  ORGANES, JOUR,
} from "./wares-disposition.mjs?v=809";
import { monterLeTambour, coteDeLaCale } from "./roue-tambour.mjs?v=809";
/* ⭐ LE TEMPS D'ARRÊT EST CELUI DU SAC, ⛔ PAS UN SECOND : `REPOS_MS` dit au bout de quoi on
   considère que le ruban s'est POSÉ. Deux durées pour un même geste se courraient après. */
import { REPOS_MS } from "./sac-ecran.mjs?v=809";
import { corpsDuJeton, motDuJeton } from "./jeton-objet.mjs?v=809";
import { ORGANES_D_ECHANGE } from "./sac-ecran.mjs?v=809";
/* ⭐ LE POPUP DE LA BOURSE EST CELUI DE R — un seul écrivain pour la bourse du site, sa
   matière et ses quatre champs. ⛔ En refaire un ici serait une seconde bourse à tenir
   d'accord, et elles divergeraient au premier réglage. */
/* 🔴 ET ON PREND SES **RÈGLES** AVEC LUI, ⛔ PAS SEULEMENT SON DOM — Eric, 2026-09-20 :
   *« je veux le popup de la bourse centré sur celle-ci et que son rendu soit idem à Gear et
   backpack »*. J'importais `popupDeLaBourse` sans jamais appeler `reglesDeLaBourse` : le popup
   sortait donc **sans cotes**, dimensionné par son contenu, posé où le flux voulait.
   ⭐ C'EST MOT POUR MOT LA FAUTE DU SAC, RÉPARÉE LE 20/09 ET COMMISE À NOUVEAU ICI : *« un
   organe partagé dont la moitié reste chez son premier hôte n'est pas partagé »*. Un organe
   est un DOM **et** ses cotes ; en prendre la moitié, c'est en refaire un second en creux. */
import { popupDeLaBourse, reglesDeLaBourse, montantDeLaBourse } from "./gear-ecran.mjs?v=809";
/* ⭐ LE GLISSER EST CELUI DE R — un seul écrivain pour le geste, son fantôme et sa sortie. */
import { armerJeton } from "./glisser.mjs?v=809";
import { versionQuery } from "./version.mjs?v=809";

const px = (n) => `${Math.round(n * 1000) / 1000}px`;

/* ⭐ LE NOM DU CRÉNEAU DU COLLECTEUR — écrit UNE fois, lu par la cible et par le dépôt.
   ⛔ Deux chaînes égales dans deux fichiers sont deux chaînes, et elles divergent. */
const CRENEAU_COLLECTEUR = "wares:collecteur";


/* ⭐ LES ROUES DU DERNIER RENDU, EN ATTENTE DE PLACEMENT. ⛔ Un nœud hors du document n'a pas
   de `scrollLeft` utilisable : placer à la construction réussit et ne fait RIEN, en silence.
   C'est le même piège que `poserLesDalles` pour le sac, et il se règle au même endroit —
   après que l'écran est posé. 🔴 Sans ça, la tuile choisie RESSAUTE À L'ORIGINE (Eric, 20/09).
   ⛔ ET LA LISTE SE REMPLACE À CHAQUE RENDU, elle ne s'accumule pas : garder les roues d'un
   écran démonté, c'est poser un ruban dans un nœud que personne ne regarde. */
let rouesEnAttente = [];

/* ══ LE VERROU — LA PLAQUE SUIT LE TAMBOUR, IMAGE PAR IMAGE ════════════════════
   ⚖️ ERIC, 2026-09-19, et c'est la phrase qui commande tout : *« je fais défiler une tuile à
   travers le viseur, je fais défiler une dalle en même temps… ILS SONT LIÉS »*.

   🔴 CE QUE J'AVAIS FAIT À LA PLACE, ET C'ÉTAIT FAUX DE NATURE (v778, retiré le 21/09).
   J'avais écrit une TRANSITION : on tape, le tambour tourne, il se pose *(~400 ms)*, l'étape
   repeint, **et alors** un petit film de ~460 ms se joue. Deux mouvements successifs pour un
   seul geste — et pendant un vrai glissé du tambour, la plaque ne montrait **rien**, puis
   sautait. 📏 Mesuré sur les deux écrans, même sonde, aimantation coupée :

       tuiles   0     0,25   0,5    0,75   1      1,5    2
       SAC      0     106    215    321    427    641    855      ← elle SUIT
       WARES    0     0      0      0      0      0      0        ← elle ne bouge pas

   ⭐ *« On voit une dalle entrer et une dalle sortir »* n'est pas une animation qu'on JOUE —
   c'est la CONSÉQUENCE du fait que la plaque suit le doigt. ⛔ Une animation jouée après coup
   raconte le mouvement ; elle ne le fait pas.

   ⚖️ ET LE SENS INVERSE RESTE COUPÉ — Eric, 21/09 : *« la dalle de Wares ne sera pas swipable
   car elle a plusieurs pages »*. Le sac a DEUX meneurs possibles et un arbitre ; ici le tambour
   mène, toujours, et la piste ne reçoit aucun geste. ⛔ Un seul écrivain, donc pas d'arbitre à
   tenir — c'est la moitié du mécanisme du sac qu'on ne reprend PAS, et je le dis pour qu'on ne
   la cherche pas.
   ⛔ ET LA PISTE N'AIMANTE PAS : *« le suiveur n'aimante pas — sinon il ne peut pas suivre »*
   (mesuré dans le sac le 19/09 : 383 au lieu de 563 à mi-chemin). L'aimantation appartient au
   MENEUR. */

/** ⚖️ OÙ DOIT ÊTRE LA PISTE QUAND LE RUBAN EST À `p` TUILES — la formule du verrou, ⛔ SEULE.
 *
 *  ⭐ ELLE N'EST PAS UNE MULTIPLICATION, et c'est la leçon la plus chère du sac : entre deux
 *  plaques il y a un JOUR, donc `largeur × k` n'est PAS la place de la plaque `k`. On ENCADRE
 *  entre les deux places LUES dans la mise en page, et on interpole avec la fraction.
 *  📏 *« Une cote DONNÉE bat une cote DÉDUITE »* : `clientWidth` rend 374 là où le plan dit 375,
 *  et l'erreur GRANDIT avec le rang.
 *
 *  @param {number} p    la position du ruban, en tuiles — ⭐ FRACTIONNAIRE, c'est tout le « en
 *                       même temps » : à mi-chemin entre deux tuiles, la plaque est à mi-chemin.
 *  @param {number[]} xs les places des plaques, lues dans la mise en page.
 */
export function placeDeLaPiste(p, xs) {
  const n = xs.length;
  if (n < 1) return 0;
  const bas = Math.max(0, Math.min(Math.floor(p), n - 1));
  const haut = Math.min(bas + 1, n - 1);
  const f = Math.max(0, Math.min(p - bas, 1));
  return xs[bas] + (xs[haut] - xs[bas]) * f;
}

/* ⭐ LA PISTE DU DERNIER RENDU, EN ATTENTE DE PLACEMENT — même piège que les rubans : la placer
   avant qu'elle soit dans le document RÉUSSIT et ne fait RIEN, en silence. */
let pisteEnAttente = null;

/** Pose les deux rubans sur leur cran visé, ⭐ ET LA PISTE SOUS SA PLAQUE.
 *  À appeler APRÈS que l'écran est dans le document — comme `poserLesDalles()` pour le sac. */
export function poserLesRoues() {
  const roues = rouesEnAttente;
  rouesEnAttente = [];
  let posees = 0;
  for (const r of roues) { if (r.poser && r.poser() === true) posees += 1; }
  const piste = pisteEnAttente;
  pisteEnAttente = null;
  if (piste && piste.poser) piste.poser();
  return posees;
}

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

function bouton(classe, mot, nom, surClic) {
  const b = el("button", classe, mot);
  b.type = "button";
  if (nom) b.setAttribute("aria-label", nom);
  if (surClic) b.addEventListener("click", surClic);
  return b;
}

/* ══ LA FEUILLE — ⛔ DES PISTES, JAMAIS DES `left` ═════════════════════════════
   🔒 SACRÉ N° 3 : *« tout est dans une boîte, les boîtes sont sur une grille — les boutons
   compris — et les espaces valent 8, que la grille écrit seule »* (NORMES:2148).
   🔴 ET C'EST LÀ QUE WARES DIVERGE DU SAC, DÉLIBÉRÉMENT. `feuilleDesCotesSac()` traduit son
   plan en `left/top/width/height` : chaque organe est posé en absolu dans sa dalle. Le sacré
   ne cède pas, et Eric l'a rappelé en dictant cet écran — donc ici le plan devient des
   PISTES, et un centre ne s'écrit nulle part.
   ⭐ CE QUE ÇA COÛTE ET CE QUE ÇA RAPPORTE : on perd la liberté de poser un organe n'importe
   où ; on gagne que `135,5` et `394` n'existent dans aucun fichier. Ils sont ce qu'un `1fr`
   rend, et ils se referont justes le jour où `Send to` changera de largeur. */
export function feuilleDesCotesWares() {
  const [tambour, grille, pied] = DALLES;
  const r = [];

  /* la colonne des trois dalles — c'est ELLE qui écrit le line bleed, ⛔ jamais une dalle
     pour sa voisine (CADRES §8 bis) */
  r.push(`.wares{display:grid;grid-template-rows:${px(tambour.h)} ${px(grille.h)} ${px(pied.h)};` +
         `gap:${px(ECART)};width:${px(DALLE.l)};height:${px(DALLE.h)}}`);

  /* ── dalle 1 : deux étages, séparés par les 4 blg dictés ── */
  r.push(`.wares-tambour{display:grid;grid-template-rows:${px(ROUE.hauteurDominante)} ${px(ROUE.hauteurDominante)};` +
         `row-gap:${px(ECART_ETAGES)};padding:${px(REMBOURRAGE)} 0;` +
         `grid-template-columns:${px(22)} 1fr ${px(22)}}`);
  /* ⭐ LA ROUE PREND LA COLONNE DU MILIEU, ⛔ PLUS TOUTE LA LARGEUR : `375 − 2 × 22 = 331`, et 331
     est exactement `ROUE.piste` au plan. Les deux bornes de 22 ne sont pas décoratives — ce sont
     les places des tuners, et je les avais laissées vides. */
  r.push(`.wares-etage{grid-column:2;display:block;height:${px(ROUE.hauteurDominante)}}`);
  /* ⛔ ET LE RANG SE DÉCLARE POUR LES QUATRE ORGANES D'UN ÉTAGE — roue, viseur et deux tuners.
     Sans lui, l'auto-placement invente des rangées dès qu'un organe s'ajoute. */
  r.push(`.wares-tambour > [data-etage="1"]{grid-row:1}`);
  r.push(`.wares-tambour > [data-etage="2"]{grid-row:2}`);
  r.push(`.wares-tuner{align-self:center;justify-self:center;` +
         `border:0;background:none;color:var(--text-soft);font:inherit;` +
         `font-size:${px(16)};line-height:1;cursor:pointer;` +
         `min-inline-size:${px(TOUCH)};min-block-size:${px(TOUCH)}}`);
  /* ⛔ ET CHACUN SA COLONNE, NOMMÉE : `grid-auto-flow` les rangerait dans l'ordre du DOM, ce qui
     marche par accident tant que l'ordre ne bouge pas. Une place qui se DÉCLARE ne se découvre
     pas à l'exécution — c'est ce que le sacré n° 3 retire à `flex-wrap`. */
  /* 🔴 ET ILS SE RABATTENT SUR LE BORD, ⛔ ILS NE SE CENTRENT PAS DANS LEUR BORNE — mesuré au
     navigateur : centré dans une borne de 22, un bouton de 44 rend à **x = −11**, donc il SORT
     de la dalle. C'est mot pour mot la faute du 18/09 sur le sac (*« le chevron gauche courait
     de −13 à 31 : il n'en restait que 31 de touchable »*), et ce qui dépasse est CLIPPÉ.
     ⛔ AUCUN GARDE DE FICHIER NE POUVAIT LE VOIR : le plan déclare la cible à x = 0, et elle y
     est — c'est la GRILLE qui la déplace. Un garde lit la boîte déclarée, jamais ce qu'il en
     reste à l'écran. Il a fallu regarder.
     ⭐ Rabattus, ils mordent 22 sur la piste de la roue — ce qu'Eric accepte explicitement
     (*« pas grave si ça dépasse un peu sur la dalle adjacente »*), et le plan le dit déjà par
     `dans: "ROUE …"` : un tuner est le contrôle de sa roue, posé sur son bord. */
  r.push(`.wares-tuner[data-organe$="-g"]{grid-column:1;justify-self:start}`);
  r.push(`.wares-tuner[data-organe$="-d"]{grid-column:3;justify-self:end}`);
  /* la marge du ruban laisse le premier et le dernier cran arriver au centre — c'est elle
     qui rend `scrollLeft = pas × k` exact, et c'est la même que celle du sac */
  /* 🔴 LE RUBAN PREND LA HAUTEUR DE SA ROUE, ET SANS ÇA LES CRANS S'ÉCRASENT — mesuré au banc :
     15,2 blg rendus au lieu de 40. `block-size: 100%` sur un cran se résout sur le RUBAN, et un
     flex en hauteur automatique se réduit à son contenu. ⛔ Aucun garde de fichier ne pouvait le
     voir : c'est une hauteur RENDUE, pas une hauteur déclarée. Il a fallu regarder. */
  r.push(`.wares-ruban{display:flex;block-size:100%;align-items:center;` +
         `gap:${px(ROUE.pas - ROUE.tuile)}}`);
  /* ⭐ LA CALE PORTE LE VIDE DES DEUX BOUTS — ⛔ plus un `padding`, qui ne compte pas dans le
     `scrollWidth` d'un flex en défilement (mesuré : le premier cran ne pouvait pas atteindre le
     viseur, le dernier non plus). Sa largeur vient du plan : `cale + écart + tuile / 2` vaut
     la demi-piste, et c'est ce qui rend `scrollLeft = pas × k` exact.

     🔴 ET ELLE PORTE UNE HAUTEUR, ⛔ SANS QUOI ELLE N'EXISTE PAS POUR LE DÉFILEMENT — Eric,
     2026-09-20 : *« problème de centrage sur les crans de droite, et ça bloque »*.
     📏 TÉMOIN DIRECT, fait au navigateur sur la page servie : la cale est un élément VIDE dans
     un ruban en `align-items: center`, donc sa hauteur rendue vaut **0**. Une boîte de hauteur
     nulle ne crée **aucun débordement** : `scrollWidth` s'arrêtait au dernier CRAN — 527 au lieu
     de 672 — et la course maximale tombait à 196 quand le dernier cran en réclame 325.
     ⭐ En lui donnant une hauteur (n'importe laquelle : `10px`, ou un simple `.` de contenu),
     `scrollWidth` saute de **527 à 672**. C'est le témoin qui a tranché, et il est reproductible.
     ⛔ ET AUCUN GARDE DE FICHIER NE POUVAIT LE DIRE : la cale est DÉCLARÉE avec sa largeur, elle
     est DANS le DOM, la bijection plan ↔ DOM est verte. C'est une hauteur RENDUE qui manquait —
     la même famille que « le ruban prend la hauteur de sa roue », dix lignes plus haut. */
  /* 🔴 ET LA COTE VIENT DU MODULE, ⛔ PLUS DU PLAN — 21/09. Le plan garde `ROUE.cale` comme
     CONSTAT *(un garde le compare à la formule)*, mais c'est `roue-tambour.mjs` qui POSE la cale,
     donc c'est lui qui dit de quelle taille elle est. Deux écrans qui calculeraient chacun leur
     cale finiraient par diverger — c'est exactement ce qui est arrivé au sac, qui n'en calculait
     aucune. ⭐ Et le sélecteur est PORTÉ : `.wares .roue-cale`, sinon deux feuilles écriraient la
     même classe globale. */
  r.push(`.wares .roue-cale{flex:0 0 auto;align-self:stretch;` +
         `inline-size:${px(coteDeLaCale(ROUE))}}`);

  /* ── dalle 2 : LA FENÊTRE, ET DES DALLES ENTIÈRES QUI LA TRAVERSENT ──────────
     🔴 ERIC, 2026-09-21 : *« je veux que TOUTE LA DALLE se déplace vers la droite ou la gauche
     et que la dalle suivante apparaisse dans l'écran ; tout tu me le fais mais À L'INTÉRIEUR
     d'une dalle »*. ⛔ J'avais fait défiler les jetons dans la colonne du milieu (277) en
     laissant le cadre planté. C'est le CADRE qui part.
     ⭐ ET LE SAC L'ÉCRIT DÉJÀ, sur `.sac-dalles` : *« le trait de coupe vit sur CHAQUE DALLE,
     pas ici : une fenêtre encadrée montre un trou fixe, une dalle encadrée voyage avec le
     sien »*. J'avais le croquis ET le code. */
  /* ⚖️ LA FENÊTRE FAIT LA SCÈNE — copie de `.sac-dalles`, dont le plan dit `{x: 0, l: 375}`.
     ⛔ ELLE NE PORTE NI VOILE NI LISERÉ : un seul voile par bande, sinon 35 % sur 35 % — la
     faute qu'Agent Equipment a livrée et qu'Eric a diagnostiquée avant lui.
     🔴 `position: relative` N'EST PAS DÉCORATIF : le verrou lit `offsetLeft`, qui se compte
     depuis le plus proche ancêtre POSITIONNÉ. Sans ce mot, les plaques comptent depuis un
     ancêtre plus haut et la piste se pose à côté — mesuré le 21/09 : 49 · 365 · 681 au lieu
     de 0 · 316 · 632.
     🔴 `touch-action: pan-y`, ⛔ SURTOUT PAS `none` — et la différence confisque un geste.
     J'avais écrit `none` en croyant dire *« je ne prends aucun geste »* ; `none` dit l'inverse :
     **je les prends TOUS et je n'en rends aucun**. Or cette fenêtre fait la scène entière, donc
     l'essentiel de la surface tactile.
     📏 ET LA PAGE DÉFILE VRAIMENT SOUS ELLE : `echelle.mjs` porte `ECHELLE_PLANCHER = 0.96`, avec
     la raison écrite à côté — *« sous le plancher l'app ne rétrécit plus : elle DÉBORDE, et la
     page défile. C'est le choix d'Eric »*. Sur un petit écran, un doigt posé ici ne pourrait donc
     plus faire défiler la page : il serait piégé, et ça glisserait partout **sauf** là.
     ⭐ `pan-y` rend la verticale à la page et ne prend rien de l'horizontal — c'est exactement ce
     qu'on veut d'une dalle qui n'est pas glissable au doigt. Le sac dit la même chose en miroir
     sur `.sac-dalles` : `pan-x`, *« le geste vertical reste à la page, l'horizontal est à nous »*.
     📌 Et `touch-action` s'INTERSECTE avec les ancêtres : un `none` posé haut ne se rattrape pas
     plus bas. ⭐ Repéré par Agent Equipment, vérifié dans `echelle.mjs` avant d'être corrigé.
     ⛔ NI AIMANTATION NI `scroll-behavior: smooth` : *« le suiveur n'aimante pas — sinon il ne
     peut pas suivre »*. 📏 Mesuré dans le sac : 383 au lieu de 563 à mi-chemin, parce qu'une
     aimantation `mandatory` REFUSE toute position intermédiaire. L'aimantation appartient au
     MENEUR, et une inertie ajoutée ferait traîner la plaque derrière le doigt. */
  r.push(`.wares-piste{display:flex;gap:${px(JOUR)};position:relative;` +
         `overflow-x:hidden;overflow-y:hidden;scroll-snap-type:none;touch-action:pan-y}`);
  /* ⭐ CHAQUE DALLE EST UN WAGON : `flex: 0 0 auto` et la largeur de la FENÊTRE — copie de
     `.sac-dalle`, qui fait `inline-size: 100%`. ⛔ Sans `0 0 auto`, six dalles dans une fenêtre
     d'une seule se partagent la place, et il n'y a plus rien à faire traverser.
     ⛔ LES GOUTTIÈRES NE PARTICIPENT PAS AU `gap` de la dalle : si elles le faisaient, la dalle
     vaudrait 2×1fr + 277 + 4×8 = 375 avec un `1fr` de 41, et les colonnes ne tomberaient plus
     sur 49 · 144 · 239. Le `gap` vit dans la SOUS-grille, où il sépare des jetons. */
  r.push(`.wares-grille{flex:0 0 auto;inline-size:100%;block-size:100%;` +
         `display:grid;grid-template-columns:1fr ${px(RENDU_GRILLE.jetons.l)} 1fr;` +
         `padding-block:${px(REMBOURRAGE_GRILLE)}}`);
  r.push(`.wares-cases{display:grid;grid-template-columns:repeat(${COLONNES_GRILLE},${px(JETON.l)});` +
         `grid-template-rows:repeat(${RANGEES_GRILLE},${px(JETON.h)});gap:${px(ECART)}}`);
  /* le filigrane — un MASQUE, pas une image : `background` porte l'encre thématique, donc il
     reste lisible le jour comme la nuit. L'image posée telle quelle (elle est NOIRE)
     s'évanouirait sur le fond de nuit.
     🔴 ET IL EST UN ORGANE DE LA GRILLE, ⛔ PLUS UN ABSOLU — mon propre garde 13 m'a repris :
     je l'avais posé en `left`/`top`, ce que le sacré n° 3 refuse.
     ⭐ ET IL VOYAGE AVEC SA DALLE, puisqu'il est DANS la dalle : chaque boutique a son marchand. */
  const url = `url("./assets/${FOND.image}${versionQuery(import.meta.url)}")`;
  r.push(`.wares-fond{grid-column:2;grid-row:1;place-self:center;` +
         `width:${px(FOND.l)};height:${px(FOND.h)};` +
         `mask-image:${url};-webkit-mask-image:${url}}`);
  r.push(`.wares-cases{grid-column:2;grid-row:1}`);

  /* ── dalle 3 : trois colonnes, trois rangées, les deux côtés qui enjambent ──
     ⭐ ET VOICI TOUT LE CENTRAGE D'ERIC, EN DEUX DÉCLARATIONS : la cellule enjambe les
     rangées 1 à 2 (`grid-row: 1 / 3`, soit 48 + 8 + 44 = 100) et se centre dedans. C'est ce
     qui met la bourse et les Tally *« entre 2 lignes »*, comme il l'avait dit avant de le voir. */
  r.push(`.wares-pied{display:grid;grid-template-columns:1fr ${px(PIED.colonnes[1])} 1fr;` +
         `grid-template-rows:${px(48)} ${px(TOUCH)} ${px(TOUCH)};row-gap:${px(ECART)};` +
         `padding:${px(REMBOURRAGE)} ${px(REMBOURRAGE)}}`);
  /* 🔴 L'ÉCART DE 8 SE MESURE ENTRE LES **DESSINS**, ⛔ PAS ENTRE LES CIBLES — mesuré au banc
     sur cache froid : à `gap: 8` les deux Tally rendaient **12** entre leurs dessins, parce que
     le `gap` sépare des BOÎTES et que chaque boîte porte 2 blg de bord transparent.
     ⭐ Et le sac fait bien 8 entre ses dessins (PARTY 32→72, TALLY 80→120) : le plan de Wares
     aussi (27,75→67,75 puis 75,75). C'est le rendu qui divergeait, pas la cote.
     ⛔ ET LE 4 NE S'ÉCRIT PAS : il se DÉDUIT du plan — l'écart voulu moins les deux bords que
     les boîtes ajoutent. Le jour où un dessin change de creux, il suit tout seul. */
  const [pt, tl] = ["PARTY TALLY", "TALLY"].map((n) => ORGANES.find((o) => o.nom === n));
  const ecartDessins = tl.x - (pt.x + pt.l);
  const bords = ((pt.cible.x + pt.cible.l) - (pt.x + pt.l)) + (tl.x - tl.cible.x);
  r.push(`.wares-cote{grid-row:1 / 3;display:grid;place-self:center;place-items:center;` +
         `grid-auto-flow:column;gap:${px(ecartDessins - bords)}}`);
  /* ⛔ ET CHACUNE DÉCLARE SA COLONNE. Elles tombaient juste par l'ORDRE DU DOM — `colauto` au
     relevé — ce qui marche par accident tant que personne ne réordonne. Le sacré n° 3 retire
     exactement ça : *« une grille dit COMBIEN et OÙ ; un repli le découvre à l'exécution »*.
     ⭐ Et je l'avais déjà écrit pour les tuners dix lignes plus haut, sans le faire ici. */
  r.push(`.wares-cote[data-cote="gauche"]{grid-column:1}`);
  /* ⭐ LES DEUX TALLY GARDENT LEUR RANGÉE, L'ENCOMBREMENT PREND LA SUIVANTE. La cellule reste
     centrée sur ses deux axes : le plan dit 44 pour les cibles et 14 pour le voyant, et l'écart
     de 8 les sépare — ⛔ aucune de ces trois cotes n'est retapée, elles viennent du plan. */
  {
    const enc = ORGANES.find((x) => x.nom === "ENCOMBREMENT");
    r.push(`.wares-cote[data-cote="gauche"]{grid-auto-flow:row;gap:${px(ECART)}}`);
    r.push(`.wares-tallys{display:grid;grid-auto-flow:column;` +
           `gap:${px(ecartDessins - bords)};place-items:center}`);
    /* ⛔ ET IL NE DÉBORDE PAS DE SA COLONNE : une ligne qui ne tient pas se VOIT, elle ne se
       fait pas défiler en douce — la loi d'Eric sur un contenu en trop. */
    r.push(`.wares [data-organe="encombrement"]{inline-size:${px(enc.l)};block-size:${px(enc.h)};` +
           `display:grid;place-items:center;white-space:nowrap;` +
           `font-size:${px(11)};color:var(--text-soft)}`);
  }
  r.push(`.wares-cote[data-cote="droite"]{grid-column:3}`);
  /* ⚖️ LE VOYANT DU MONTANT SE POSE **SUR** LA BOURSE — même cellule, même boîte, et c'est le
     plan qui les donne (`MONTANT`, `dans: "PURSE"`). ⛔ On ne le tape pas : `pointer-events:none`
     laisse le doigt à la bourse dessous. Sans ça le voyant volerait le tap de l'organe qu'il
     annote, et la bourse ne s'ouvrirait plus. */
  {
    const m = ORGANES.find((o) => o.nom === "MONTANT");
    r.push(`.wares-cote[data-cote="droite"] > *{grid-area:1 / 1}`);
    r.push(`.wares [data-organe="montant"]{inline-size:${px(m.l)};block-size:${px(m.h)};` +
           `place-self:center;pointer-events:none}`);
  }
  r.push(`.wares-pied > [data-organe="collecteur"]{grid-column:2;grid-row:1;justify-self:center}`);
  r.push(`.wares-pied > [data-organe="send-vers"]{grid-column:2;grid-row:2;align-self:center}`);
  r.push(`.wares-pied > [data-rangee]{grid-column:1 / -1;grid-row:3}`);

  /* ── LES BOÎTES DES ORGANES, DEPUIS LE PLAN ───────────────────────────────────
     🔴 ELLES ÉTAIENT DANS `shell.css`, ET UN GARDE DE R ME L'A REPRIS : *« shell.css ne
     porte AUCUNE position de l'écran : les cotes sont dans la table »*. Il visait R ; la
     règle vaut pour tout écran à plan, et je l'avais enfreinte dans le fichier dont le
     premier commentaire dit que les cotes vivent au plan. ⭐ Deux écrivains pour une cote,
     c'est deux cotes — et celle de la feuille aurait gagné en silence. */
  /* 🔴 LA BOÎTE EST CELLE DE LA **CIBLE**, ET LE DESSIN VIT EN CREUX DEDANS. J'avais servi le
     DESSIN, et deux organes en sont sortis faux — trouvé en relisant le plan contre le rendu,
     à la demande d'Eric :
       · `Send to` rendait une cible de **40**, ⛔ sous le plancher sacré de 44 ;
       · le Tally rendait **44 × 44** (la taille de la cible) à la position du **dessin**.
     ⭐ C'est la confusion que la tête de `wares-disposition.mjs` interdit en toutes lettres :
     *« DESSIN et CIBLE sont DEUX cotes »*. La formule ci-dessous est celle du sac, reprise
     telle quelle : les quatre bords transparents portent l'écart RÉEL cible − dessin, ⛔ pas
     une symétrie — une cible rabattue a un dessin décentré, et la formule symétrique le
     peindrait à côté de sa place. */
  const boite = (clef, o) => {
    const c = o.cible || o;
    const bords = [o.y - c.y, (c.x + c.l) - (o.x + o.l), (c.y + c.h) - (o.y + o.h), o.x - c.x];
    r.push(`.wares [data-organe="${clef}"]{inline-size:${px(c.l)};block-size:${px(c.h)}` +
      (bords.some((b) => b !== 0)
        ? `;border-style:solid;border-color:transparent;background-clip:padding-box` +
          `;border-width:${bords.map(px).join(" ")}`
        : "") + `}`);
  };
  for (const nom of ["COLLECTEUR", "PURSE", "SEND VERS", "PARTY TALLY", "TALLY"]) {
    const o = ORGANES.find((x) => x.nom === nom);
    if (o) boite(CLEF_DE[nom], o);
  }
  /* la tuile de la roue : un dominant et quatre secondaires, la règle d'Eric du 18/09 */
  /* 🔴 LA TUILE POSE SES DEUX COTES, ET AUCUNE NE VIENT DE SON CONTENANT. Eric, 20/09 :
     *« le rectangle foncé doit remplir uniquement la tuile »*. 📏 Après avoir réparé la
     LARGEUR, la hauteur débordait encore de 13,4 px : le cran prenait `100 %` de la piste (40)
     puis l'échelle le portait à 49,8, quand le viseur en fait 40.
     ⭐ LA MÊME LOI SUR LES DEUX AXES : un cran fait `tuile × hauteur` (57 × 32,11), et
     l'agrandissement le porte à `dominant × hauteurDominante` (71 × 40) — exactement le
     viseur. ⛔ Une cote prise au contenant (`100 %`) est une cote qu'on agrandit deux fois.
     ⭐ Et la marge intérieure est celle du sac, à la lettre : 7,5 % de la largeur DU CRAN
     (Eric, 18/09) — ⛔ jamais un pour-cent de `padding`, qui se résout sur le CONTENANT. */
  r.push(`.wares-cran{inline-size:${px(ROUE.tuile)};block-size:${px(ROUE.hauteur)};` +
         `padding-inline:${px(ROUE.tuile * ROUE.margePct)}}`);
  /* 🔴 LE DOMINANT NE CHANGE PAS DE LARGEUR — C'EST L'ÉCHELLE QUI LE FAIT, ET ELLE SEULE.
     Eric, 2026-09-20 : *« le rectangle foncé doit remplir uniquement la tuile, là tu remplis
     les marges du token principal »*.
     📏 MESURÉ : le cran dominant rendait **120,7 × 68 px** pour un viseur de **96,9 × 54,6** —
     23,8 de trop en largeur, 13,4 en hauteur. Son fond débordait donc du cadre de 12 px de
     chaque côté, et c'est ce débord qu'Eric appelle « les marges du token ».
     ⛔ LA CAUSE EST UNE DOUBLE APPLICATION : j'écrivais `inline-size: 71` (la cote DOMINANTE du
     plan) **et** `scale: 1,2456`. 71 × 1,2456 = 88,4 blg, quand le viseur en fait 71.
     ⭐ LE SAC NE FAIT QUE LA SECONDE : tous ses crans font `ROUE.tuile` (57), et l'échelle porte
     le posé à 57 × 1,2456 = **71** — exactement la largeur du viseur. `ROUE.dominant` au plan
     est donc le RÉSULTAT de l'agrandissement, ⛔ pas une largeur à poser : la poser, c'est
     agrandir deux fois. */
  r.push(`.wares-cran[data-dominant="oui"]{scale:${ROUE.loupe}}`);
  /* ⭐ LE VISEUR SE SUPERPOSE AU REBORD DE LA TUILE POSÉE, et sa règle se GÉNÈRE avec
     l'agrandissement — NORMES `equipement-loupe-se-superpose-au-rebord` (19/09). ⛔ Un rayon
     écrit à la main raterait les coins : la tuile dominante est grossie de ${ROUE.loupe}, donc
     son rayon peint et son liseré le sont aussi. */
  r.push(`.wares-loupe{grid-column:2;place-self:center;` +
         `inline-size:${px(ROUE.dominant)};block-size:${px(ROUE.hauteurDominante)};` +
         `border-radius:calc(var(--radius-md) * ${ROUE.loupe});` +
         `box-shadow:inset 0 0 0 calc(1px * ${ROUE.loupe}) var(--loupe-trait)}`);

  /* ── le popup de la bourse : LES MÊMES RÈGLES QUE R ET LE SAC, pour la portée `.wares` ──
     ⚖️ *« centré sur celle-ci »* (Eric, 20/09) et *« centre-le sur l'emplacement de la bourse »*
     (16/09) sont la même loi, dite deux fois : elle vaut pour les trois écrans.
     ⭐ ON N'ÉCRIT RIEN ICI — on donne à `reglesDeLaBourse` la portée, l'ANCRE (la bourse du
     plan de Wares) et la dalle. Le centrage, le serrage dans la dalle et les quatre cotes du
     popup ont UN écrivain, chez R. ⛔ Recopier `left`/`top` ferait une seconde bourse.
     📌 `hautDeLaDalle` vaut 0 : les `y` du plan de Wares comptent déjà SOUS le belt, contrairement
     à ceux de R. Il se donne, ⛔ il ne se devine pas. */
  r.push(...reglesDeLaBourse(".wares", ORGANES.find((o) => CLEF_DE[o.nom] === "purse"), DALLE, 0));
  return r.join("\n");
}

/* ══ UN ÉTAGE DU TAMBOUR ═══════════════════════════════════════════════════════
   ⚖️ « fonctionnement exactement celui de backpack » (Eric, 20/09) — même roue, même
   navigation, ⛔ et elle ne tourne plus à l'infini. Le second étage n'est pas un second
   mécanisme : c'est le MÊME, monté deux fois. */
/* ⚖️ LES DEUX TUNERS D'UN ÉTAGE — Eric, 18/09 : *« les tuners sont pour la souris »*. Au repos
   c'est un CHEVRON qu'on tape ; au survol il devient la molette. ⭐ Le même organe, deux visages,
   et c'est le visage TAPÉ qui réclame les 44 (NORMES `cadre-le-plancher-tactile-…`).
   🔴 ILS MANQUAIENT, ET AUCUN DE MES QUATORZE GARDES NE L'A VU : le plan en déclarait quatre,
   l'écran n'en posait aucun. C'est la bijection plan ↔ DOM qui l'a attrapé, écrite APRÈS —
   une liste par nom de ce qu'un écran doit porter est incomplète par construction ; seule
   l'INVERSION (partir du plan, demander au DOM) peut accuser une absence. */
function tuner(clef, sens, roue, nb) {
  const b = bouton("wares-tuner", sens < 0 ? "‹" : "›",
    sens < 0 ? "Previous" : "Next",
    () => { const k = Math.round(roue.scrollLeft / ROUE.pas) + sens;
            roue.viser(Math.max(0, Math.min(k, nb - 1))); });
  b.dataset.organe = clef;
  return b;
}

function etage(nom, items, actif, surViser, suiveur) {
  const roue = el("div", "wares-roue wares-etage");
  roue.dataset.organe = CLEF_DE[nom];
  roue.setAttribute("role", "tablist");
  roue.setAttribute("aria-label", nom === "ROUE CATEGORIES" ? "Categories" : "Sub-categories");
  const ruban = el("div", "wares-ruban");
  roue.append(ruban);

  /* 🔴 LE VISEUR — IL MANQUAIT, ET ERIC L'A VU EN LIGNE AVANT MOI (*« il n'y a pas de
     viseur »*). ⚖️ Le halo reste CENTRÉ et les items défilent dessous (19/09) : c'est un cadre
     fixe posé sur la place de la tuile dominante, ⛔ pas une décoration qui voyage avec elle.
     ⭐ Il prend le GENRE de ce qu'il cadre — le module feuille s'en charge, par `data-lieu`.
     ⛔ ET ON NE LE TAPE PAS : `aria-hidden` pour qu'il ne se lise pas, `pointer-events: none`
     dans la feuille pour qu'il ne reçoive rien. Un cadre qui intercepte le doigt vole le geste
     du cran qu'il désigne. */
  const loupe = el("div", "wares-loupe");
  loupe.dataset.organe = nom === "ROUE CATEGORIES" ? "loupe-categories" : "loupe-sous-categories";
  loupe.setAttribute("aria-hidden", "true");

  const crans = items.map((it, i) => {
    const c = bouton("wares-cran", it.nom, it.nom);
    c.dataset.snap = "oui";
    c.dataset.position = String(i);
    c.setAttribute("role", "tab");
    c.setAttribute("aria-selected", String(i === actif));
    return c;
  });
  /* ⛔ LE CHOIX N'EST PAS LE TAP : le tambour aimante, et c'est le VISEUR qui choisit — la loi
     du catalogue (II.3). L'écran écoute donc le DÉFILEMENT.
     🔴 ET IL NE REPEINT PLUS SOUS LE DOIGT — Eric, 20/09 : *« la molette ne fonctionne pas
     bien »*. Ma première écriture appelait le pilote à CHAQUE événement de défilement, donc
     soixante reconstructions par seconde : l'écran rebâtissait le ruban pendant qu'on le
     faisait glisser, et le geste se perdait à chaque image. C'est très exactement la boucle
     que le sac nomme — *« deux surfaces qui se commandent l'une l'autre »*, où chacune corrige
     l'autre et l'inertie se perd entre les deux.
     ⭐ LE REMÈDE EST CELUI DE LA MAISON : un compte d'IMMOBILITÉ, pas de temps. Chaque
     événement le réarme ; on ne prévient le pilote qu'une fois le ruban POSÉ. ⛔ Et on marque
     la dominante EN CONTINU, elle, parce que c'est du dessin — aucun rendu ne s'y rejoue. */
  let minuteur = null;
  let suiviEnAttente = false;
  roue.addEventListener("scroll", () => {
    /* ⛔ NOS PROPRES ÉCRITURES NE SONT PAS UN GESTE — le module les marque. Sans ce test, poser
       le ruban au montage se relirait comme un choix du joueur, et l'écran se repeindrait en
       boucle sur sa propre voix. */
    if (roue.estProgrammatique && roue.estProgrammatique()) return;
    /* ⭐ LE VERROU PASSE ICI, ET IL EST DU DESSIN — il se joue à CHAQUE image, comme le
       marquage de la dominante, ⛔ jamais au repos. C'est tout le *« en même temps »* : le
       suiveur reçoit la position FRACTIONNAIRE du ruban.
       ⛔ ET IL NE S'EMPILE PAS : une seule image en vol, comme dans le sac — sans ce garde,
       soixante écritures par seconde se chevauchent et chacune force un recalcul. */
    if (suiveur && !suiviEnAttente) {
      suiviEnAttente = true;
      const frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout;
      frame(() => { suiviEnAttente = false; suiveur(roue.scrollLeft / ROUE.pas); });
    }
    const k = Math.max(0, Math.min(Math.round(roue.scrollLeft / ROUE.pas), items.length - 1));
    roue.marquer(k);
    if (minuteur) clearTimeout(minuteur);
    minuteur = setTimeout(() => { if (k !== actif && surViser) surViser(k); }, REPOS_MS);
  });
  monterLeTambour({ roue, ruban, crans, actif, pas: ROUE.pas, loupe });
  rouesEnAttente.push(roue);
  /* ⭐ L'ÉTAGE EST LES TROIS ENSEMBLE — les deux bornes de 22 et la piste de 331 au milieu.
     ⛔ Un tuner posé « à côté » de la roue serait un organe que la grille du tambour ne place
     pas, et le sacré n° 3 l'interdit : tout est dans une boîte, les boîtes sont sur une grille. */
  const court = nom === "ROUE CATEGORIES" ? "categories" : "sous-categories";
  /* 🔴 CHAQUE ORGANE DE L'ÉTAGE DIT SON RANG, ET J'AI ENFREINT MA PROPRE RÈGLE EN L'OUBLIANT.
     En ajoutant le viseur, le tambour est passé de six enfants à HUIT, et sa grille ne déclare
     que deux rangées : les deux de trop ont créé des rangées IMPLICITES, et tout l'étage a
     glissé — 📏 vu à l'écran, `Adventuring` tombait sur la ligne du bas et `Camp` chevauchait
     la grille.
     ⭐ C'est mot pour mot ce que j'avais écrit dix lignes plus haut pour les tuners : *« une
     place qui se DÉCLARE ne se découvre pas à l'exécution »*. Le sacré n° 3 retire exactement
     ça — un repli le découvre à l'exécution, et le découvre autrement au premier ajout. */
  const rang = nom === "ROUE CATEGORIES" ? "1" : "2";
  const organes = [tuner(`tuner-${court}-g`, -1, roue, items.length), roue, loupe,
                   tuner(`tuner-${court}-d`, +1, roue, items.length)];
  for (const n of organes) n.dataset.etage = rang;
  return organes;
}

/* ══ UN JETON DE LA GRILLE ═════════════════════════════════════════════════════
   ⚖️ Eric, 20/09 : *« les jetons EXACTEMENT la même règle que dans les menus Gear/Backpack.
   Différence une seule : un tap sur token mène à un écran X2 pas X1. »*
   ⛔ PAS DE PRIX ICI. Le prix vit sur la fiche et dans la recherche — *« exactement la même
   règle »* ferme la porte, et c'est la réponse à la question que j'allais poser.
   ⏳ ET LA BANDE DES QUATRE MARQUES DÉCRIT UN OBJET POSSÉDÉ. Sur une étagère de boutique les
   quatre tombent à « non », et `corpsDuJeton` le fait déjà tout seul : la bande rend ses 14
   blg sans rien dire. On garde — dire *« ce que tu possèdes déjà »* serait une règle neuve,
   et elle appartient à Eric. */
function jeton(item, o) {
  const b = bouton("wares-jeton", undefined, motDuJeton(item));
  b.dataset.refId = item.ref;
  b.append(...corpsDuJeton(item));
  /* 🔴 `data-glissable="true"` ÉTAIT POSÉ ET RIEN NE L'ARMAIT — mesuré : zéro appel à
     `armerJeton` dans tout ce fichier. L'attribut PROMETTAIT un geste que personne n'écoutait,
     ce que §6 interdit : un libellé qui ment. Eric l'a vu en ligne — *« l'équipement n'est pas
     totalement branché »*. ⛔ Et aucun de mes gardes ne pouvait le dire : ils lisaient
     l'attribut, pas l'écouteur.
     ⭐ LE GLISSER EST CELUI DE R, PAS UN SECOND — `armerJeton` vit dans `glisser.mjs` et c'est
     lui qui porte le fantôme, la capture du doigt et la sortie de secours d'un geste perdu.
     ⚖️ TAP = INFO, GLISSER = CHOISIR (la loi du geste) : le tap ouvre le X2, le dépôt sur le
     collecteur met au panier — et le panier, c'est le Tally (Eric, 20/09). */
  armerJeton(b, {
    onTap: () => o.surJeton && o.surJeton(item.ref),
    /* ⛔ `onDepot` REÇOIT LE `data-creneau` DE LA CIBLE, ⛔ PAS SON NŒUD — lu dans
       `glisser.mjs` (`onDepot(cible.dataset.creneau)`), pas supposé. Mon premier jet attendait
       un élément et testait `cible.dataset.organe` : il n'aurait JAMAIS déposé, en silence. */
    onDepot: (creneau) => { if (creneau === CRENEAU_COLLECTEUR && o.surDepot) o.surDepot(item.ref); },
  });
  return b;
}

/* ══ LA GOUTTIÈRE — un chevron et un compte ════════════════════════════════════
   ⚖️ `liste-une-seule-page-pas-de-fleches` (26/08) : *« quand il y a 3 tokens, on n'affiche
   que 3 tokens, pas besoin de flèches »*. ⛔ Et surtout PAS par `display: none` — défaut n° 3
   du dépôt : une flèche masquée garde sa place et reste atteignable au clavier. On ne la
   compose pas, c'est tout. */
function gouttiere(sens, compte, actif, surPage) {
  const g = el("div", "wares-gouttiere");
  g.dataset.cote = sens;
  if (actif) {
    const mot = sens === "gauche" ? "‹" : "›";
    const b = bouton("wares-chevron", mot, sens === "gauche" ? "Previous page" : "Next page",
      () => surPage && surPage(sens === "gauche" ? -1 : 1));
    b.dataset.organe = sens === "gauche" ? "page-precedente" : "page-suivante";
    g.append(b);
  }
  const v = el("span", "wares-compte", compte);
  v.dataset.organe = sens === "gauche" ? "compte-objets" : "compte-pages";
  g.append(v);
  return g;
}

/**
 * CONSTRUIT L'ÉCRAN WARES.
 *
 * @param {object} [o]
 * @param {{nom:string}[]} [o.categories]      les crans de l'étage 1
 * @param {number} [o.categorie]               le rang visé à l'étage 1
 * @param {{nom:string}[]} [o.sousCategories]  les crans de l'étage 2
 * @param {number} [o.sousCategorie]           le rang visé à l'étage 2
 * @param {object[]} [o.objets]                la PAGE de jetons — au plus `PAR_PAGE`
 * @param {number} [o.compte]                  les objets de la sous-catégorie (gouttière gauche)
 * @param {number} [o.page] [o.pages]          la page courante et leur nombre (gouttière droite)
 * @param {string} [o.bourse]                  le montant, déjà mis en mots
 * @param {number} [o.compteTally]
 * @param {string} [o.destination]
 * @param {{valeur:string,mot:string}[]} [o.sections]
 * @param {(i:number)=>void} [o.surCategorie] [o.surSousCategorie]
 * @param {(sens:number)=>void} [o.surPage]
 * @param {(ref:string)=>void} [o.surJeton]    ⭐ ouvre un X2
 * @param {(id:string)=>void} [o.surPorte]     gear · send · backpack
 * @param {(id:string)=>void} [o.surBouton]    purse · tally · party-tally
 * @param {(valeur:string)=>void} [o.surDestination]
 * @returns {{ noeud: HTMLElement }}
 */
export function construireLesWares(o = {}) {
  const noeud = el("div", "wares");
  noeud.dataset.ecran = "wares";
  rouesEnAttente = [];   /* ⛔ un rendu neuf remplace les roues du précédent */
  pisteEnAttente = null;
  /* ⭐ LES COTES VOYAGENT AVEC L'ÉCRAN, comme celles du sac : une feuille posée dans le nœud,
     écrite depuis le PLAN. ⛔ Elles ne vivent pas dans `shell.css` — un lot qui y toucherait
     les ferait diverger de la table, et c'est la table qui fait foi. La feuille du site, elle,
     porte la PEAU (matières, encres, reliefs) ; ici, seule la géométrie. */
  const feuille = el("style");
  feuille.dataset.fhpc = "wares";
  feuille.textContent = feuilleDesCotesWares();
  noeud.append(feuille);
  /* ⛔ AUCUN TITRE. Eric, 20/09 : *« Equipment browser dégage »*. Le cran sous le viseur NOMME
     l'écran (NORMES §1 quinquies, « le tambour désigne »), et la 3ᵉ ligne du belt dit déjà
     `Wares`. Deux noms pour un écran sont un libellé qui ment, en plus discret. */

  /* 🔴 LA PISTE NAÎT AVANT LE TAMBOUR, ET CE N'EST PAS UN DÉTAIL D'ORDRE.
     Mon premier jet faisait passer le suiveur par une VARIABLE DE MODULE, parce que le tambour
     se construit avant la dalle 2. 📏 Mesuré, sonde à l'appui : le suiveur était bien appelé
     (`p = 0,507`) mais sa piste rendait `isConnected: false` — la variable avait déjà été
     réassignée par le rendu suivant, et le tambour d'un écran écrivait dans la piste d'un autre.
     ⛔ UNE INDIRECTION PAR L'ÉTAT DU MODULE EST UN TROU PAR CONSTRUCTION : rien ne garantit que
     les deux bouts appartiennent au même rendu.
     ⭐ LA PARADE EST STRUCTURELLE : on crée la piste ICI, et le tambour reçoit une fermeture qui
     la tient directement. Les deux naissent et meurent ensemble — il n'y a plus rien à tenir
     d'accord. C'est la même leçon que `rouesEnAttente` : *« un rendu neuf remplace ceux du
     précédent »*, mais obtenue sans mémoire du tout. */
  const piste = el("div", "wares-piste");
  piste.dataset.organe = "piste";
  /* ⭐ LE VERROU — il ne lit QUE la position du ruban, et il écrit dans CETTE piste-ci.
     ⛔ Plus de « train » intermédiaire : la piste EST le flex, comme `.sac-dalles`. */
  const suivre = (p) => {
    if (piste.isConnected === false) return;
    const xs = [];
    for (const n of piste.children) xs.push(typeof n.offsetLeft === "number" ? n.offsetLeft : 0);
    if (xs.length) piste.scrollLeft = placeDeLaPiste(p, xs);
  };

  /* ── DALLE 1 ─────────────────────────────────────────────────────────────── */
  /* 🔴 LE TAMBOUR N'EST PLUS UNE DALLE — Eric, 20/09 : *« il faut aussi dégager le fond
     sombre »*. 📏 Mesuré : dans le SAC, la roue et TOUS ses ancêtres sont transparents — elle
     flotte sur le fond de scène, et c'est ce qui fait que son viseur et son cran dominant se
     détachent. Wares portait `--dalle-simple` à 35 % derrière la roue : le cadre du viseur s'y
     noyait, et l'aura avec. ⭐ La dictée du 20/09 disait « Voile 35 % » ; elle vaut pour les
     dalles qui portent du CONTENU (la grille, le pied), ⛔ pas pour la bande où passe la roue. */
  /* ⚖️ ET LE TAMBOUR A SA DALLE — Eric, 2026-09-20 : *« il doit y avoir une dalle sous les 2
     tambours »*. ⭐ `wares-dalle` est la MÊME classe que la grille et le pied : le voile à 35 %
     et le liseré qui attrape la lumière. ⛔ Rien de neuf — les trois dalles de l'écran se
     ressemblent parce qu'elles sont la même matière, pas parce qu'on les a accordées. */
  const tambour = el("div", "wares-tambour wares-dalle");
  tambour.append(
    ...etage("ROUE CATEGORIES", o.categories || [], o.categorie | 0, o.surCategorie),
    /* ⭐ ET C'EST CET ÉTAGE-LÀ QUI MÈNE LA PLAQUE — le 1ᵉʳ ne mène rien : changer de catégorie
       REFAIT la liste des sous-catégories, donc refait le train. Il n'y a rien à faire suivre
       entre deux trains qui n'ont pas les mêmes wagons. */
    ...etage("ROUE SOUS-CATEGORIES", o.sousCategories || [], o.sousCategorie | 0, o.surSousCategorie,
             suivre),
  );

  /* ── DALLE 2 — ⭐ ET C'EST LA DALLE ELLE-MÊME QUI TRAVERSE L'ÉCRAN ────────────
     🔴 ERIC, 2026-09-21, après le croquis et deux explications : *« je veux que TOUTE LA DALLE
     se déplace vers la droite ou la gauche et que la dalle suivante apparaisse dans l'écran ;
     tout tu me le fais mais À L'INTÉRIEUR d'une dalle »*.
     ⛔ CE QUE J'AVAIS FAIT, ET C'EST LA FAUTE : j'avais fait glisser les 12 jetons dans la
     colonne du milieu *(277)* pendant que le cadre — voile, liseré, gouttières, filigrane —
     restait planté. Le cadre ne reste pas : **il part avec sa plaque**.
     ⭐ ET LE SAC LE DIT EN TOUTES LETTRES dans `shell.css`, sur `.sac-dalles` : *« le trait de
     coupe vit sur CHAQUE DALLE, pas ici : une fenêtre encadrée montre un trou fixe, une dalle
     encadrée voyage avec le sien »*. C'est exactement la même phrase, et j'avais le code.
     📌 LA PLAQUE VAUT DONC LA SCÈNE (375), et le jour `375 × 8 / 57 = 52,63` — celui du sac au
     centième, parce que c'est le même objet. */
  const plaques = Array.isArray(o.plaques) && o.plaques.length
    ? o.plaques
    : [{ nom: "", objets: o.objets || [], compte: o.compte, pages: o.pages }];
  const courante = Math.max(0, Math.min(o.sousCategorie | 0, plaques.length - 1));
  const pages = Math.max(1, (plaques[courante] || {}).pages | 0 || 1);

  for (let k = 0; k < plaques.length; k += 1) {
    const p = plaques[k] || { objets: [] };
    /* ⭐ UNE DALLE COMPLÈTE : sa matière, son liseré, son filigrane et ses deux gouttières.
       ⛔ Aucune de ces trois choses ne reste derrière — c'est ça, « toute la dalle ». */
    const grille = el("div", "wares-grille wares-dalle");
    grille.dataset.plaque = String(k);
    /* ⛔ ET CE QUI N'EST PAS SOUS LE VISEUR NE SE TABULE PAS : six dalles hors champ, c'est
       72 boutons invisibles sur le chemin de la touche Tab. */
    if (k !== courante) grille.setAttribute("inert", "");

    const fond = el("div", "wares-fond");
    fond.setAttribute("aria-hidden", "true");
    grille.append(fond);

    const cases = el("div", "wares-cases");
    cases.setAttribute("role", "list");
    for (const item of (p.objets || []).slice(0, PAR_PAGE)) {
      const c = el("div", "wares-case");
      c.setAttribute("role", "listitem");
      c.append(jeton(item, o));
      cases.append(c);
    }
    /* ⭐ LES GOUTTIÈRES VOYAGENT AVEC LEUR DALLE, et c'est ce qui les rend justes : chaque
       plaque annonce SON compte et SA page. ⛔ Une gouttière restée dans un cadre fixe dirait
       les chiffres d'une dalle pendant qu'on en regarde une autre. */
    const pagesDeK = Math.max(1, p.pages | 0 || 1);
    const pageDeK = k === courante ? (o.page | 0) : 0;
    grille.append(
      gouttiere("gauche", String(p.compte ?? (p.objets || []).length), pagesDeK > 1, k === courante ? o.surPage : null),
      cases,
      gouttiere("droite", `${pageDeK + 1}/${pagesDeK}`, pagesDeK > 1, k === courante ? o.surPage : null),
    );
    piste.append(grille);
  }

  /* ⭐ LA PISTE SE POSE APRÈS LE MONTAGE, et sa place se LIT — `offsetLeft` de la dalle
     courante. ⛔ Pas `largeur × k` : entre deux dalles il y a un jour, et l'erreur d'un pas
     déduit GRANDIT avec le rang. */
  pisteEnAttente = {
    poser() {
      if (piste.isConnected === false) return false;
      const n = piste.children[courante];
      if (n && typeof n.offsetLeft === "number") piste.scrollLeft = n.offsetLeft;
      return true;
    },
  };

  /* ── DALLE 3 ─────────────────────────────────────────────────────────────── */
  const pied = el("div", "wares-pied wares-dalle");

  /* les deux Tally, à gauche — centrés dans la cellule par la grille, ⛔ pas par un calcul */
  /* 🔴 LES TROIS ORGANES D'ÉCHANGE SONT CEUX DE R, ET LE DÉPÔT ME L'AVAIT ÉCRIT D'AVANCE.
     `sac-ecran.mjs` porte ce commentaire depuis le 19/09 : *« LES TROIS ORGANES D'ÉCHANGE SONT
     CEUX DE R (`gear-bouton`), et ils portent DÉJÀ leurs images : `--icone-bourse`,
     `--icone-parchemin` et `--icone-parchemin-party`, déposées par Eric le 16/09. ⛔ J'en avais
     fait trois rectangles bruns, sans image »*.
     ⛔ J'AI REFAIT EXACTEMENT CETTE FAUTE — `.wares-tally` et `.wares-purse`, trois rectangles
     bruns sans image — dans un lot dont le premier commentaire dit « il ne redessine rien de ce
     qui existe ». Eric l'a vu en ligne : *« tally les images le branchement · la bourse le
     branchement »*.
     ⭐ `ORGANES_D_ECHANGE` est la LISTE, et elle vient du sac : un quatrième organe la
     traverserait tout seul. ⛔ La recopier ici en ferait une seconde vérité. */
  const gauche = el("div", "wares-cote");
  gauche.dataset.cote = "gauche";
  /* ⭐ LA CELLULE DE GAUCHE DEVIENT UNE PILE À DEUX RANGS — les deux Tally, puis l'encombrement
     dessous. ⛔ Sans ce rang déclaré, le `grid-auto-flow: column` de la cellule poserait le
     voyant À CÔTÉ des Tally : une place découverte à l'exécution, ce que le sacré n° 3 retire. */
  const tallys = el("div", "wares-tallys");
  const compteurs = { "party-tally": 0, tally: o.compteTally || 0 };
  for (const { id, mot, inerte } of ORGANES_D_ECHANGE) {
    if (id === "purse") continue;                 /* elle vit dans la cellule de DROITE */
    const b = bouton("gear-bouton", "", mot, () => o.surBouton && o.surBouton(id));
    b.dataset.organe = id;
    b.dataset.compte = String(compteurs[id] || 0);
    /* ⚖️ ET LE PARTY TALLY SE MONTRE INERTE, il ne fait pas SEMBLANT — la loi du produit :
       une place réservée se montre inerte. Un bouton qui accepte le doigt et ne répond jamais
       apprend à ne plus toucher. */
    if (inerte) b.disabled = true;
    tallys.append(b);
  }
  gauche.append(tallys);
  /* ⚖️ L'ENCOMBREMENT — Eric, 2026-09-21 : *« rajoute l'unité d'encombrement »*, puis *« dans le
     pied, entre les Tally et le collecteur »*. ⭐ Le mot vient du pilote, qui l'a fait dire par
     `motDeLEncombrement` — l'écran ne calcule rien et ne connaît aucune unité.
     ⛔ ET IL EST DANS LE PIED, pas dans la dalle qui traverse : il décrit le PERSONNAGE, pas la
     sous-catégorie qu'on regarde. */
  /* ⛔ IL SE POSE TOUJOURS, MÊME SANS MOT — et c'est mon garde de bijection qui me l'a appris :
     un organe qui n'apparaît QUE si la donnée arrive n'est pas au plan la moitié du temps, et la
     FORME de l'écran se met à dépendre de son contenu. ⭐ La place est réservée par le plan ; ce
     qui vient du pilote est le MOT, pas l'existence. */
  const poids = el("div", "wares-encombrement", o.encombrement || "");
  poids.dataset.organe = "encombrement";
  gauche.append(poids);
  pied.append(gauche);

  const collecteur = el("div", "wares-collecteur", "SEND COLLECTOR");
  collecteur.dataset.organe = "collecteur";
  /* ⭐ IL DIT QU'IL EST UNE CIBLE — `glisser.mjs` lit cet attribut pour savoir où un jeton peut
     se poser. ⛔ Un creux qui n'annonce pas qu'il accueille est un creux qui refuse en silence. */
  /* ⭐ IL DIT QU'IL EST UNE CIBLE, et il le dit dans le vocabulaire de `glisser.mjs` :
     `data-creneau`. ⛔ Un creux qui n'annonce pas qu'il accueille refuse en silence — et
     `creneauSous` cherche exactement cet attribut, rien d'autre. */
  collecteur.dataset.creneau = CRENEAU_COLLECTEUR;
  pied.append(collecteur);

  /* la bourse, à droite — symétrique des Tally, et centrée par la même déclaration */
  const droite = el("div", "wares-cote");
  droite.dataset.cote = "droite";
  /* ⚖️ RIEN D'ÉCRIT DANS LE BOUTON — la loi de R, tenue par son garde 5 quinquies :
     *« le montant est le voyant posé DESSUS »*. ⛔ Le mot va au nom accessible, pas au corps.
     🔴 ET LE VOYANT EST LÀ DEPUIS LE 21/09 — la dette écrite trois lignes plus bas est payée.
     Eric : *« la bourse toujours pas le montant posé dessus »*. ⭐ C'est `montantDeLaBourse`,
     l'organe de R, importé — ⛔ pas un second qui dirait le même nombre. */
  /* ⭐ ET LA BOURSE EST LE MÊME ORGANE, avec son image (`--icone-bourse`). ⛔ Rien d'écrit
     dans son corps : le montant va au nom accessible, et le voyant qui le PEINT appartient à R
     (loi du 16/09 : *« le montant est le voyant posé DESSUS »*). */
  /* 🔴 LE NOM DE LA BOURSE EST CELUI DE LA LISTE, ⛔ PLUS UNE PHRASE FABRIQUÉE ICI — 21/09.
     Il disait `Purse — ${o.bourse}`, ce qui a rendu **« Purse — [object Object] »** à la minute
     où `o.bourse` est devenue la donnée (les quatre monnaies) au lieu d'une chaîne.
     ⭐ ET LA RÉPARATION N'EST PAS DE REFORMATER LE NOMBRE ICI : le sac dit `Purse` tout court et
     laisse le VOYANT dire le montant — un organe, un message. Deux endroits qui annoncent la
     même somme divergeraient au premier arrondi. `ORGANES_D_ECHANGE` porte déjà ce mot. */
  const motDeLOrgane = (ORGANES_D_ECHANGE.find((x) => x.id === "purse") || {}).mot || "Purse";
  const purse = bouton("gear-bouton", "", motDeLOrgane,
    () => o.surBouton && o.surBouton("purse"));
  purse.dataset.organe = "purse";
  /* ⭐ LES DEUX DANS LA MÊME CELLULE — la feuille les y déclare (`grid-area: 1 / 1`), donc le
     voyant se pose SUR la bourse sans qu'aucun `left` ne soit écrit. ⛔ C'est la réponse du
     sacré n° 3 à ce que R et le sac font en absolu : la superposition est une GRILLE à une
     cellule, pas une position. */
  const montant = montantDeLaBourse(o);
  montant.dataset.organe = "montant";
  droite.append(purse, montant);
  pied.append(droite);

  const envoi = el("select", "wares-send-vers");
  envoi.dataset.organe = "send-vers";
  envoi.setAttribute("aria-label", "Send to");
  for (const s of (o.sections || [])) {
    const opt = el("option", undefined, s.mot);
    opt.value = s.valeur;
    if (s.valeur === o.destination) opt.selected = true;
    envoi.append(opt);
  }
  envoi.addEventListener("change", () => o.surDestination && o.surDestination(envoi.value));
  pied.append(envoi);

  pied.append(rangeeDuPied(o));

  noeud.append(tambour, piste, pied);
  /* ⚖️ LA BOURSE EST UN POPUP, PAS UNE VUE — Eric, 16/09 : *« ça prend la place que ça doit,
     c'est un popup »*. ⛔ Elle ne passe donc pas par `montrer()` : une vue remplacerait l'écran
     et écrirait la 3ᵉ ligne du belt. Un popup recouvre et n'écrit rien. */
  if (o.bourseOuverte) noeud.append(popupDeLaBourse(o));
  return { noeud };
}

/** La rangée du pied — `Gear · Send · Backpack`, le triangle qui se referme.
 *  ⚖️ NORMES `equipement-wares-pied-triangle` : chaque écran porte les DEUX portes qu'il n'est
 *  pas. ⛔ `Equipment` est le nom de l'ÉTAPE, jamais d'un écran.
 *  ⭐ LE GROUPE `rangee-majeurs` N'EST PAS DÉCORATIF, et R l'a payé sur deux appareils : sans
 *  lui les trois portes se placent une par une, la première prend tout le `1fr` et les
 *  suivantes passent à la ligne. */
function rangeeDuPied(o) {
  const r = el("div", "wares-rangee");
  r.dataset.rangee = "wares";
  r.dataset.organe = "rangee";
  const livre = bouton("fiche-livre wares-livre", undefined, "Rules");
  livre.dataset.organe = "livre";
  if (o.livreDe && o.livreDe.href) {
    livre.addEventListener("click", () => { window.open(o.livreDe.href, "_blank", "noopener"); });
  } else {
    livre.disabled = true;
  }
  r.append(livre);
  const majeurs = el("div", "rangee-majeurs");
  for (const id of PORTES) {
    const mot = id === "gear" ? "Gear" : id === "send" ? "Send" : "Backpack";
    const note = id === "send" ? "Send — clears the collector and sends" : mot;
    const b = bouton("wares-porte", mot, note, () => o.surPorte && o.surPorte(id));
    b.dataset.porte = id;
    /* ⭐ ET IL PORTE AUSSI SA CLEF DU PLAN. ⛔ `data-porte` dit son RÔLE dans la rangée ;
       `data-organe` dit QUI il est au plan. Sans le second, la bijection plan ↔ DOM ne peut
       pas le trouver, et une absence se lirait comme un choix. */
    b.dataset.organe = id;
    majeurs.append(b);
  }
  r.append(majeurs);
  return r;
}

export { PAR_PAGE, RANGEE };
