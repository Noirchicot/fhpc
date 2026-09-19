/* ══ L'ÉCRAN SB3.1 — LE SAC ═══════════════════════════════════════════════════
   Lot 214. Quatre rangées de trois jetons par SECTION, une roue pour passer de
   l'une à l'autre, et la rangée d'échange de R autour du collecteur.

   🔴 TOUTE LA GÉOMÉTRIE VIENT DE `sac-disposition.mjs`, ET CE FICHIER EST GÉNÉRÉ
   (`Plan-backpack/backpack_gen.py` → `backpack_cotes.json` → la déclaration).
   Ce module PEINT, il ne décide d'aucune cote : il lit la table, pose chaque
   organe à son `x`/`y` du plan. ⛔ Aucun nombre ne s'écrit ici. Un nombre qui
   manque à la table se demande à la table — il ne se retape pas.

   🔴 LES POSITIONS SORTENT DANS UNE FEUILLE CONSTRUITE, PAS EN STYLE EN LIGNE :
   le garde 7 des jetons interdit `.style` dans tout `ui/`. Une valeur qui vient
   de la DONNÉE ne peut pas vivre dans `shell.css` (elle y serait recopiée) —
   elle sort donc dans une feuille que ce module écrit depuis la table, une règle
   par organe. `shell.css` ne porte que l'HABIT : la forme, l'encre, les états.

   ⭐ ET LE JETON N'EST PAS DESSINÉ ICI : il vient de `jeton-objet.mjs`, l'organe
   que l'écran R porte aussi. Deux copies divergeraient à la première marque
   ajoutée — c'est la doctrine payée trois fois (l'interrupteur du menu, les
   chevrons de Destiny, ce jeton).

   ⏳ CE QUE CE PREMIER JET NE FAIT PAS ENCORE, et le dit : le glisser d'une
   section à l'autre, les popups de `Sort` et de `Sections`, la molette du tuner.
   La table les porte, l'écran les POSE — les gestes viendront sur ce socle. */

import { DALLE, DALLES, MARGE, TOUCH, JETON, ROUE, COLONNES, RANGEES, ORGANES, FOND } from "./sac-disposition.mjs?v=743";
import { versionQuery } from "./version.mjs?v=743";
import { corpsDuJeton, motDuJeton } from "./jeton-objet.mjs?v=743";
/* ⭐ LE GLISSER EST CELUI DE R, PAS UN SECOND — `armerJeton` et `fantome` vivent
   dans `glisser.mjs` depuis le carnet, et R les emploie tels quels. ⛔ Sans eux le
   collecteur du sac ne pouvait rien recevoir, donc `Send` et `Drop` n'agissaient
   sur rien : trois organes posés sur l'écran et morts. C'est précisément ce
   qu'Eric a refusé le 18/09 en regardant l'écran en ligne. */
import { armerJeton, fantome } from "./glisser.mjs?v=743";
/* ⭐ LA BOURSE DU SAC EST CELLE DE R — Eric, 19/09 au soir : *« purse »*. Son bouton
   existait ici depuis le 18/09 et n'était câblé NULLE PART : un organe posé sans son
   fil est un organe mort, et c'est la faute que ce lot a déjà payée trois fois.
   ⛔ On importe l'organe, on ne le redessine pas. */
import { popupDeLaBourse } from "./gear-ecran.mjs?v=743";
/* 🔴 LE TROISIÈME PIÈGE DU `zoom`, ET C'EST UN GARDE QUI ME L'A APPRIS : un
   `getBoundingClientRect()` rend des pixels PEINTS (blg × le cran), pendant que
   `offsetWidth` et la mise en page restent en blg. ⛔ Mélanger les deux familles
   donne un résultat juste au cran 1 et faux partout ailleurs — le défaut le plus
   silencieux des trois. ⭐ Le facteur se LIT sur la racine d'échelle, par l'organe
   qui le sait (`facteurZoomCourant`) : ⛔ pas un second calcul à moi. */
import { facteurZoomCourant } from "./echelle.mjs?v=743";

/** La clef DOM de chaque organe de la table. ⛔ Elle ne se devine pas du nom :
 *  une clef est un contrat entre la table, la feuille et le garde. */
export const CLEF_DE = Object.freeze({
  "ROUE": "roue", "TUNER G": "tuner-g", "TUNER D": "tuner-d",
  /* ⭐ UNE LOUPE, PLUS CINQ CRANS — Eric, 20/09 : la roue est devenue un DÉFILEUR, donc
     les crans ne sont plus des places posées ; ils glissent. Ce qui reste au plan est
     le halo fixe sous lequel ils passent. */
  "LOUPE": "loupe",
  /* 🎯 LA BANDE QUI DÉFILE — croquis d'Eric du 19/09 : des trois dalles, c'est la seule
     qui bouge. Elle est l'HÔTE des douze cases au plan, donc leur `top` est déjà relatif
     à elle et une dalle de section n'est qu'un calque de plus à faire glisser. */
  "DALLES": "dalles",
  "TRIER": "trier", "TASSER": "sections",
  "POIDS TOTAL": "poids-total", "POIDS DETAIL": "poids-detail",
  "EFFACER": "effacer", "EDITER": "editer",
  "COLLECTEUR": "collecteur", "TALLY": "tally", "PARTY TALLY": "party-tally", "PURSE": "purse",
  "SEND VERS": "send-vers", "GEAR": "gear", "SEND": "send", "WARES": "wares",
  "RANGEE": "rangee", "livre": "livre", "?": "guide"
});
/* les douze cases prennent leur clef de leur nom : CASE 2.3 → case-2-3 */
const clefDeCase = (nom) => nom.toLowerCase().replace(/\s/g, "-").replace(".", "-");

/* 🔴 LA TAILLE DE LA GRILLE SE COMPTE DANS LA TABLE, ⛔ ELLE NE S'ÉCRIT PAS ICI.
   Je bouclais sur `r < 4` et `c < 3` : deux nombres retapés, dans le seul fichier
   du lot qui a le droit de n'en porter aucun. Le jour où le plan rend sa cinquième
   rangée — elle a été retirée pour le collecteur, elle peut revenir — la boucle
   aurait menti sans que rien ne rougisse.
   ⭐ ET LA GRILLE EST AUSSI LA TAILLE D'UNE PAGE : *« ça va dans la page suivante…
   voire ça crée une page supplémentaire si besoin »* (Eric, 18/09). Le document
   compte des PLACES ; c'est cette cote qui les découpe en pages. `equipment-step`
   l'importe plutôt que d'en tenir une seconde copie. */
const CASE_RE = /^CASE (\d+)\.(\d+)$/;
const cases = ORGANES.map((o) => CASE_RE.exec(o.nom)).filter(Boolean);
export const RANGS_GRILLE = cases.reduce((m, c) => Math.max(m, Number(c[1])), 0);
export const COLS_GRILLE = cases.reduce((m, c) => Math.max(m, Number(c[2])), 0);
/* ⛔ `CASES_DU_SAC`, ET SURTOUT PAS `CASES_PAR_PAGE` : ce nom-là est INTERDIT dans
   `ui/` — c'était l'ancien nom local de la page de listes, et un garde veille à ce
   qu'il ne revienne pas (« deux noms pour un nombre, c'est déjà une recopie »). La
   norme du produit est `LISTE_PAR_PAGE` = 15, au socle.
   ⭐ ET LE SAC A LE DROIT DE FAIRE AUTREMENT, comme Wares : sa grille vaut 12 parce
   que le COLLECTEUR lui a pris une rangée — *« il nous manque un collecteur, il faut
   faire sauter une rangée »* (Eric, 18/09). C'est une DÉROGATION avec une cause
   visible à l'écran, exactement ce que le garde autorise : *« si cet écran a une
   RAISON de faire autrement, il passe SON nombre »*. ⛔ Et il ne l'écrit pas : il le
   COMPTE dans son plan. */
export const CASES_DU_SAC = RANGS_GRILLE * COLS_GRILLE;

const px = (v) => `${Math.round(v * 100) / 100}px`;
/* 🔴 UN ORGANE NICHÉ SE POSE PAR RAPPORT À SON HÔTE, PAS À LA DALLE — faute vue
   au banc, premier rendu : les cinq crans portaient les `x` de la TABLE (32, 93,
   154…) alors qu'ils vivent DANS la roue, elle-même posée à 32. Ils partaient
   donc 32 trop à droite et se tronquaient en « P… ».
   ⭐ La table dit `dans: "ROUE"` : l'écart se calcule, il ne se retape pas.

   🔄 ET CETTE LISTE A ÉTÉ INVERSÉE LE 19/09, APRÈS AVOIR MENTI. Elle nommait les
   ENFANTS — `CRAN 1..5` — et ces cinq-là n'existaient plus depuis que la roue est un
   ruban. Les douze cases, elles, déclaraient bien `dans: "DALLES"` au plan et n'étaient
   pas dans la liste : elles se posaient donc à leur `y` ABSOLU dans une bande déjà
   décalée, et la grille peignait 104 blg trop bas — mesuré à l'écran, la quatrième
   rangée passait sous le collecteur.
   ⭐ UNE LISTE PAR NOM DE CE QUI DOIT Y ÊTRE EST INCOMPLÈTE PAR CONSTRUCTION : on
   nomme maintenant les HÔTES qui sont vraiment des parents au DOM, et les enfants
   suivent de la table. Ajouter une case ne peut plus s'oublier.
   ⛔ ET TOUT `dans` N'EST PAS UN PARENT : la LOUPE dit `dans: "ROUE"` au plan parce
   qu'elle lui APPARTIENT, mais au DOM elle en est la sœur — la nicher la décalerait de
   22. Le plan dit l'appartenance, cette liste dit la parenté. */
const HOTES_AU_DOM = new Set(["DALLES"]);
const hote = (o) => (o.dans && HOTES_AU_DOM.has(o.dans) ? ORGANES.find((p) => p.nom === o.dans) : null);
const pose = (o) => {
  const h = hote(o);
  const dx = h ? (h.cible ? h.cible.x : h.x) : 0;
  const dy = h ? (h.cible ? h.cible.y : h.y) : 0;
  const c = o.cible;
  /* 🔴 LES QUATRE BORDS SE DÉDUISENT DES ÉCARTS RÉELS, ⛔ PLUS D'UNE SYMÉTRIE.
     J'écrivais `(c.l - o.l) / 2` de chaque côté — ce qui suppose le dessin CENTRÉ
     dans sa cible. C'était vrai tant qu'aucune cible n'était rabattue.
     ⚖️ Depuis le 18/09 une cible ne sort plus de la dalle (mesure au téléphone : les
     tuners débordaient de 13, il ne restait que 31 de touchable sous le plancher
     sacré de 44). Les deux tuners ont donc un dessin DÉCENTRÉ dans leur cible — et
     la formule symétrique aurait peint leur chevron 13 blg à côté de sa place.
     ⭐ Écrite ainsi, elle rend exactement les mêmes nombres qu'avant pour toute
     cible centrée : c'est une généralisation, pas un changement de loi. */
  return c
    ? `left:${px(c.x - dx)};top:${px(c.y - dy)};width:${px(c.l)};height:${px(c.h)};` +
      `border-width:${px(o.y - c.y)} ${px((c.x + c.l) - (o.x + o.l))} ` +
      `${px((c.y + c.h) - (o.y + o.h))} ${px(o.x - c.x)}`
    : `left:${px(o.x - dx)};top:${px(o.y - dy)};width:${px(o.l)};height:${px(o.h)}`;
};

/** La feuille qui pose chaque organe à sa place du plan. Exportée pour le garde,
 *  qui la relit contre la table.
 *  · un organe SANS cible reçoit sa boîte telle quelle — on le lit, on ne le tape
 *    pas, et le plancher `--touch` ne s'y applique pas ;
 *  · un organe À CIBLE reçoit la boîte de sa CIBLE, et son dessin en creux : les
 *    bords transparents portent l'écart cible − dessin (NORMES §0). */
export function feuilleDesCotesSac() {
  const regles = [];
  for (const o of ORGANES) {
    if (o.creation === false) continue;          /* ⛔ les lunes : cotées, pas posées */
    const id = CLEF_DE[o.nom] || (o.nom.startsWith("CASE ") ? clefDeCase(o.nom) : null);
    if (!id) continue;
    /* ⛔ LES ENFANTS DE LA RANGÉE NE SE POSENT PAS : c'est la grille partagée des
       rangées de contrôles qui les range (cinq listes de `shell.css` la disent
       ensemble). Leur `x` au plan dit où ils TOMBENT, il ne les y met pas. */
    if (o.sorte === "porte" || o.sorte === "rond") continue;
    /* ⛔ SÉLECTEUR DESCENDANT, JAMAIS `>` : un enfant direct enferme une cote dans
       une STRUCTURE, et la structure bouge dès qu'un organe se loge dans un groupe. */
    regles.push(`.sac [data-organe="${id}"]{${pose(o)}}`);
  }
  /* ⚖️ LA RÈGLE D'ERIC (18/09) : *« il faut que le T0 des petites tuiles
     remplissent idem que le T1 de la grande tuile »*. La marge intérieure vaut
     7,5 % de la largeur DU CRAN — 5 sur le dominant, 4 sur un secondaire.
     🔴 ET ELLE NE PEUT PAS S'ÉCRIRE `padding-inline: 7.5%` — faute vue au banc :
     un pourcentage de `padding` se résout sur la largeur du CONTENANT, pas sur
     celle de l'élément. 7,5 % de la roue (311) faisait 23,3 de chaque côté, et
     il ne restait que 20 pour le mot : tous les crans affichaient « P… ».
     ⭐ Le pourcentage reste donc dans la TABLE, où il est vrai, et la feuille en
     DÉDUIT deux nombres — qui ne sont pas retapés : ils se recalculent si une
     cote bouge. */
  /* ⚖️ LA MARGE D'UNE TUILE VAUT 7,5 % DE SA LARGEUR — la règle d'Eric du 18/09, et elle
     ne change pas parce que la roue défile. ⭐ ELLE NE S'ÉCRIT PLUS CINQ FOIS : toutes
     les tuiles font la MÊME largeur maintenant (c'est la loupe qui agrandit la posée,
     pas sa boîte), donc une seule règle les habille.
     🔴 ET TOUJOURS PAS `padding-inline: 7.5%` — un pour-cent de `padding` se résout sur
     la largeur du CONTENANT, jamais sur celle de l'élément. Faute vue au banc : 7,5 % de
     la roue faisaient 23,3 de chaque côté et tous les crans affichaient « P… ». */
  /* 🔴 ET UNE TUILE A UNE HAUTEUR — ⛔ elle n en avait aucune, et personne ne l a dit.
     📏 Mesuré à l écran le 19/09 : `Party bag` peignait 11 de haut, `Backpack dropdown`
     25 — chaque tuile faisait la hauteur de SON texte. Une rangée de pilules dépareillées
     là où Eric demandait *« une forme plus rectangulaire comme dans le belt »*.
     ⭐ LA COTE EXISTAIT DEPUIS LE DÉBUT, au plan : *« la hauteur des sections = 40 »*
     (19/09). Elle n avait simplement jamais été ÉCRITE — une cote qui vit dans la table
     et que la feuille n emploie pas ne dessine rien. */
  regles.push(`.sac .sac-cran{inline-size:${px(ROUE.tuile)};block-size:${px(ROUE.hauteur)};` +
    `padding-inline:${px(ROUE.tuile * ROUE.margePct)}}`);
  /* ⭐ LA PISTE S'ÉCARTE DE CE QU'IL FAUT POUR QUE LA PREMIÈRE TUILE PUISSE SE CENTRER —
     `(piste − tuile) / 2`. ⛔ C'est cette marge qui rend `scrollLeft = pas × k` exact ;
     sans elle, la première et la dernière ne pourraient jamais atteindre la loupe. */
  regles.push(`.sac .sac-ruban{gap:${px(ROUE.pas - ROUE.tuile)};` +
    `padding-inline:${px((ROUE.piste - ROUE.tuile) / 2)}}`);
  /* ⭐ ET L'AGRANDISSEMENT EST CELUI DU PLAN : `dominant / secondaire`, qui est AUSSI
     `T1 / T0`. Les deux règles dictées le 18/09 sont le même rapport — un seul
     agrandissement les rend toutes les deux, et ⛔ sans toucher à la mise en page. */
  /* ⚖️ LA POSÉE GRANDIT SUR LES DEUX AXES — Eric, 19/09, en regardant le belt : *« tu
     agrandis en hauteur et en largeur, c'est plus joli »*, puis *« la dalle centrale garde
     sa hauteur de 40 et largeur actuelle, les petites seront moins hautes aussi bien que
     moins larges »*.
     ⭐ UN SEUL AGRANDISSEMENT SUFFIT, et c'est le rapport déjà dicté (71/57 = T1/T0) :
     la boîte au repos vaut 57 × 32,11, la posée en peint 71 × 40. ⛔ Rien à compenser,
     rien à taper : les deux nombres sortent du plan, et le cadre de zoom tombe pile sur
     la posée parce qu'il EST sa boîte.
     🔴 CETTE LIGNE A ÉTÉ RETOURNÉE PAR ERIC LUI-MÊME : le matin du 19/09 il avait dicté
     *« 40 pour tout le monde en hauteur »* — j'avais alors compensé la hauteur de la posée
     pour que `scale` ne la grossisse pas. Le soir il a demandé l'inverse. ⛔ C'est lui qui
     a abrogé sa règle, pas le code en passant. */
  regles.push(`.sac .sac-cran[data-dominant="oui"]{scale:${ROUE.loupe}}`);
  /* ⚖️ DU JOUR ENTRE LES DALLES — Eric, 2026-09-19 : *« je veux voir une séparation avec
     le fond visible au-dessus et en dessous de la dalle »*.
     🔴 UN TRAIT NE SUFFISAIT PAS, et il avait raison de le redemander : deux bandes qui se
     touchent restent UNE surface, quel que soit le trait qu'on met entre. Ce qui fait
     qu'une dalle se DÉTACHE, c'est qu'on voie ce qu'il y a derrière.
     ⭐ ON PERCE DONC LE VOILE, ⛔ on ne le repeint pas : un second aplat serait une
     matière recopiée, et deux matières divergent au premier réglage. Le masque retire,
     il n'ajoute rien — `dalle-simple` reste le seul écrivain de la matière.
     📏 ET LE JOUR VAUT 8 — Eric : *« séparation de 8 blg »* — mais ce 8 se DÉDUIT : c'est
     la gouttière de la grille, le pas d'une rangée moins la hauteur d'un jeton. ⛔ Un 8
     tapé ici serait un huitième huit à tenir d'accord avec les sept autres.
     ⭐ ET IL VA DEHORS DU CADRE : de la fin du panneau de poids au bord haut de la bande
     (96 → 104), et du bord bas au pied de la dalle fixe (336 → 344). Son croquis écrit
     « MARGE 8 BLG » DE PART ET D'AUTRE du rectangle, et « 8 blg » encore à l'intérieur —
     deux huit distincts, que j'avais fondus en un seul.
     ⚠️ Un masque coupe aussi les enfants — c'est voulu, et c'est sans effet : ces deux
     bandes-là sont vides par construction. */
  /* 📏 LA GOUTTIÈRE SE DÉDUIT DE LA GRILLE, ⛔ elle ne se tape pas : c'est ce qui sépare
     deux rangées — le pas d'une rangée moins la hauteur d'un jeton. Eric : *« séparation
     de 8 blg »*, et 8 est ce nombre-là, pas un huit de plus. */
  const gouttiere = RANGEES[1] - RANGEES[0] - JETON.h;
  /* 🔴 LE JOUR VA DEHORS DU CADRE, ⛔ pas dedans — c'est le croquis qui tranche, et je
     l'avais lu à l'envers. Il montre un RECTANGLE tracé autour de la grille, tokens
     ENTIERS, avec 8 de respiration à l'intérieur, et « MARGE 8 BLG » écrit DE PART ET
     D'AUTRE de ce rectangle. Deux huit distincts, que j'avais fondus en un seul. */
  const jourHaut = DALLES.y - gouttiere;
  const jourBas = DALLES.y + DALLES.h + gouttiere;
  /* ⭐ LES DEUX BANDES FIXES — leurs boîtes se déduisent de la mobile et du jour. ⛔ Plus
     de masque : la dalle du sac ne porte plus de voile, donc il n'y a plus rien à percer.
     C'était une rustine sur un défaut de structure. */
  regles.push(`.sac > [data-bande="bande-haut"]{left:0;top:0;` +
    `width:${px(DALLE.l)};height:${px(jourHaut)}}`);
  regles.push(`.sac > [data-bande="bande-bas"]{left:0;top:${px(jourBas)};` +
    `width:${px(DALLE.l)};height:${px(DALLE.h - jourBas)}}`);
  /* ⚖️ ET 8 BLG DE JOUR ENTRE DEUX PLAQUES — Eric, 19/09 : *« une marge de 8 blg entre les
     deux dalles qui défilent latéralement »*. ⭐ Pendant la transition on voit le fond
     passer entre celle qui part et celle qui arrive ; au repos il est hors champ.
     ⛔ Le pas d'une plaque n'est donc plus sa largeur : c'est sa largeur PLUS le jour — et
     c'est pour ça que le verrou lit `offsetLeft` au lieu de multiplier. */
  regles.push(`.sac .sac-dalles{gap:${px(gouttiere)}}`);

  /* 🎒 LE SAC EN FILIGRANE — Eric, 2026-09-20 : *« comme avec le bonhomme dans Gear, en
     fond transparent derrière »*. ⭐ C'est le PANTIN de R, même rôle et même place au plan :
     une image qu'on ne tape pas, derrière la grille, dont la cote vit dans `FOND`.
     ⛔ ET SON URL PORTE LA VERSION DU GRAPHE, comme le masque du pantin : une image sans
     `?v=` reste dans le cache dix minutes après un déploiement, et on cherche le défaut
     dans le dessin. */
  if (FOND) {
    regles.push(`.sac > .sac-fond{left:${px(FOND.x)};top:${px(FOND.y)};` +
      `width:${px(FOND.l)};height:${px(FOND.h)};` +
      `mask-image:url(./assets/${FOND.image}${versionQuery(import.meta.url)});` +
      `-webkit-mask-image:url(./assets/${FOND.image}${versionQuery(import.meta.url)})}`);
  }
  return regles.join("\n");
}

function el(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}
function bouton(classe, mot, note, surClic) {
  const b = el("button", classe, mot);
  b.type = "button";
  if (note) b.setAttribute("aria-label", note);
  if (surClic) b.addEventListener("click", surClic);
  return b;
}

/* ══ LES ORGANES ═══════════════════════════════════════════════════════════ */

/** La roue des sections — le tambour d'Équipement à UN étage, sans perspective.
 *  ⚖️ Eric, 18/09 : *« le tambour est mal fait… l'idée est de faire un tambour à un
 *  étage, zoom + halo idem belt sur l'élément actif, les autres en plus petit,
 *  2 de chaque côté »*. ⭐ Le cran sous le viseur NOMME l'écran — NORMES §1
 *  quinquies, *« le tambour désigne »* — donc ⛔ aucun titre n'est dû. */
function roue(options, loupeNoeud, pisteNoeud) {
  const r = el("div", "sac-roue");
  r.dataset.organe = "roue";
  /* ⛔ `tablist` SEULEMENT AU REPOS : en édition la roue porte un champ de saisie et
     un `+`, qui ne sont pas des onglets. Un rôle qui ment sur ce qu'il contient est
     pire qu'aucun rôle. */
  r.setAttribute("role", options.edition === true ? "group" : "tablist");
  r.setAttribute("aria-label", "Sections");

  const sections = options.sections || [];
  const n = sections.length;
  const edition = options.edition === true;
  const deplacement = options.deplacement != null;
  const actif = n ? Math.max(0, Math.min(options.section | 0, n - 1)) : 0;

  /* ⭐ LE RUBAN EST CE QUI DÉFILE ; la roue, elle, est la FENÊTRE. Deux nœuds parce
     que ce sont deux rôles : l'une est clippée et reçoit le geste, l'autre glisse. */
  const ruban = el("div", "sac-ruban");
  r.append(ruban);

  /* 🔴 LE RUBAN NE BOUCLE PLUS, ET C'EST ERIC QUI L'A TRANCHÉ — 2026-09-19 :
     *« que ça tourne à l'infini n'aide pas ; autorise l'absence de tuiles à droite et à
     gauche »*. ⛔ On peignait la liste TROIS fois et on rattrapait le défilement d'une
     longueur quand il quittait la copie du milieu.
     ⭐ CE QUI DISPARAÎT AVEC : la téléportation à l'arrêt, les copies, le tour du milieu,
     et le remarquage de la tuile jumelle qu'elle imposait. Un anneau n'a pas de bout,
     donc il ne pouvait pas dire *« tu es au début »* ni *« tu es à la fin »* — et c'est
     exactement ce qu'Eric veut voir : du VIDE au bout de la liste.
     📌 La marge du ruban `(piste − tuile) / 2` était déjà ce qu'il fallait : elle
     laisse la première et la dernière tuile arriver au centre, et ce qui reste à côté
     d'elles est de la piste nue. Rien à ajouter pour ça, seulement à retirer. */

  /* ⚖️ LES DEUX `+` OCCUPENT LES DEUX BOUTS — croquis d'Eric, 19/09. ⭐ Ils sont DANS le
     ruban et défilent avec lui : c'est ce qui les rend atteignables sans les sortir du
     geste. ⛔ Ils ne paraissent pas en déplacement (*« le x, +, / disparaissent »*). */
  const bout = (dehors) => {
    const p = el("button", "sac-cran");
    p.type = "button";
    p.dataset.role = "ajouter";
    p.dataset.snap = "oui";
    if (dehors) p.dataset.lieu = "dehors";
    p.append(
      el("span", "sac-etage", dehors ? "Other" : "backpack"),
      el("span", "sac-cran-signe", "+"),
      el("span", "sac-etage", "Storage"),
    );
    p.setAttribute("aria-label", dehors ? "New section outside the backpack" : "New backpack section");
    p.addEventListener("click", () => options.surAjouter && options.surAjouter(dehors ? "dehors" : "sac"));
    return p;
  };
  if (edition && !deplacement) ruban.append(bout(false));

  {
    for (let i = 0; i < n; i += 1) {
      const s = sections[i];
      const souslaLoupe = (i === actif);

      /* ⭐ LE CRAN SOUS LA LOUPE DEVIENT UN CHAMP EN RENOMMAGE — *« tap pour modifier »*.
         ⛔ Une section figée ne devient pas un champ : on ne rebaptise pas une place
         qu'on n'a pas faite. */
      if (edition && souslaLoupe && options.renommage === true && s.renommable !== false) {
        const champ = el("input", "sac-cran sac-cran-champ");
        champ.type = "text";
        champ.value = s.nom;
        champ.maxLength = 22;                    /* la cote du cran sur deux étages */
        champ.dataset.dominant = "oui";
        champ.dataset.snap = "oui";
        champ.dataset.position = String(i);
        champ.setAttribute("aria-label", "Section name");
        const valider = () => {
          if (champ.value.trim() === s.nom) return;
          if (options.surRenommer) options.surRenommer(i, champ.value);
        };
        champ.addEventListener("keydown", (ev) => {
          if (ev && ev.key === "Enter") { ev.preventDefault(); valider(); }
          /* ⛔ Échap REND LE NOM D'AVANT : une frappe abandonnée ne laisse pas de trace. */
          if (ev && ev.key === "Escape") { champ.value = s.nom; champ.blur(); }
        });
        champ.addEventListener("blur", valider);
        ruban.append(champ);
        continue;
      }

      const t = el("button", "sac-cran", s.nom);
      t.type = "button";
      t.dataset.snap = "oui";
      t.dataset.position = String(i);
      t.dataset.dominant = souslaLoupe ? "oui" : "non";
      /* ⚖️ TROIS LISERÉS, TROIS GENRES — croquis du 19/09 : blanc = une section du sac,
         BLEU = le party inventory, DORÉ = hors du sac. ⛔ Le blanc est le défaut de la
         maison : il ne se déclare pas. */
      if (s.dehors === true) t.dataset.lieu = "dehors";
      else if (s.party === true) t.dataset.lieu = "party";
      if (!edition) { t.setAttribute("role", "tab"); t.setAttribute("aria-selected", String(souslaLoupe)); }
      if (options.deplacement === i) t.dataset.tenu = "oui";
      /* ⚖️ TAPER UN CRAN NE CHOISIT RIEN — la loi du catalogue (II.3) : il AIMANTE, et
         c'est le viseur qui choisit. ⭐ Le surligné et le choisi sont ainsi le même
         nombre PAR CONSTRUCTION, jamais deux chemins qui doivent rester d'accord. */
      t.addEventListener("click", () => viser(i));
      armerLeDeplacement(t, i, options, pisteNoeud);
      ruban.append(t);
    }
  }
  if (edition && !deplacement) ruban.append(bout(true));

  /* 🔴 LA ROUE N'EST PLUS UN DÉFILEUR — Eric, 2026-09-19 : *« le glisser sur la grille
     change de section »*. Ce sont les DALLES qui portent le geste ; la roue est
     l'affichage qu'elles commandent.
     ⛔ POURQUOI PAS LES DEUX : deux surfaces qui défilent et qui se commandent l'une
     l'autre font une boucle — chacune corrige l'autre, et l'inertie du système se perd
     entre les deux. Un seul maître, un seul mouvement.
     ⭐ CE QUI SURVIT DE L'ANCIENNE : l'arithmétique. Centrer la tuile `k` demande
     `pas × k`, exactement comme avant — seulement c'est un `translate` maintenant, pas
     un `scrollLeft`. */
  const rang = (i) => i + (edition && !deplacement ? 1 : 0);   /* le `+` de gauche décale */
  const vise = rang(actif);
  r.dataset.vise = String(vise);

  let marque = ruban.children[vise] || null;

  /* ⭐ MARQUER, C'EST ÉTEINDRE UN SEUL NŒUD ET EN ALLUMER UN — ⛔ pas parcourir le ruban.
     📏 L'écriture d'avant posait l'attribut sur LES QUINZE tuiles à chaque image, donc
     quinze recalculs de style sur la seule surface qui doit rester fluide — et le prix
     montait avec le contenu. ⭐ Ici deux écritures, quel que soit le nombre de sections. */
  const marquer = (k) => {
    if (marque) marque.dataset.dominant = "non";
    marque = ruban.children[k] || null;
    if (marque) marque.dataset.dominant = "oui";
    habillerLaLoupe(marque);
  };

  /* ⚖️ LE HALO RESTE CENTRÉ — Eric : *« le halo doit rester centré, les items défilent
     dessous »* · *« le halo reste en place comme témoin »*. ⛔ Il ne voyage donc PAS avec
     le cran : c'est un cadre fixe, et les tuiles passent dessous.
     ⭐ MAIS IL GARDE LE GENRE DE CE QU'IL CADRE — la règle des trois liserés du 19/09. */
  function habillerLaLoupe(item) {
    if (!loupeNoeud) return;
    const lieu = item && item.dataset ? item.dataset.lieu : undefined;
    if (lieu) loupeNoeud.dataset.lieu = lieu;
    else delete loupeNoeud.dataset.lieu;
  }
  habillerLaLoupe(ruban.children[vise]);

  /* ⭐ ET VOICI TOUT LE VERROU : une position de ruban, en tuiles, éventuellement
     fractionnaire. `placer(6.4)` met le ruban entre la 6ᵉ et la 7ᵉ tuile — c'est ce qui
     rend le mouvement CONTINU au lieu de cranté, et c'est ce qu'Eric décrit : *« je vois
     les deux défiler en même temps »*.
     ⛔ `translate`, ⛔ pas `left` : une transformation est composée, une position
     rejouerait la mise en page à chaque image.
     ⚠️ ET C'EST ÉCRIT DEPUIS UN ÉCOUTEUR DE DÉFILEMENT, donc au pire une image en retard.
     ⏳ L'étape d'après est de le confier au compositeur (`animation-timeline: scroll()`,
     la technique que la roue d'Équipement emploie déjà) — mais ce lien-ci n'est PAS une
     pente droite (une section peut valoir deux dalles), donc ça demande une image-clé par
     dalle, et ça se pose une fois la forme vue à l'écran. */
  /* ⚖️ TAPER UN CRAN NE CHOISIT RIEN — la loi du catalogue (II.3) : il AIMANTE, et c'est
     le viseur qui choisit. ⭐ Le surligné et le choisi sont ainsi le même nombre PAR
     CONSTRUCTION, jamais deux chemins qui doivent rester d'accord.
     🔴 ET IL AVAIT DISPARU DANS LA CHIRURGIE DU 19/09 : le tap appelait un `viser()` que
     je venais de supprimer. ⛔ Aucun garde de l'écran ne l'a vu — c'est celui des
     ORPHELINS qui l'a attrapé, en cherchant les noms appelés sans être déclarés. Un tap
     de tuile rendait un `ReferenceError` au joueur. */
  const viser = (i) => {
    const x = ROUE.pas * rang(i);
    if (typeof r.scrollTo === "function") r.scrollTo({ left: x, behavior: "smooth" });
    else r.scrollLeft = x;
  };

  /* 📌 GARDÉ POUR LE BANC ET LES GARDES : poser le ruban à une position en tuiles. Le
     produit, lui, passe par `scrollLeft` — la roue EST le défileur. */
  r.placer = (k) => {
    /* ⭐ `scrollLeft`, ⛔ PAS UN `translate` — et ce n'est pas un détail de goût : écrire
       une transformation demanderait un style EN LIGNE, que le garde 7 interdit dans tout
       `ui/`. Un défilement, lui, s'écrit sans toucher au style.
       ⭐ ET LA ROUE NE PREND PLUS LE DOIGT : sa feuille la met en `overflow: hidden`, donc
       elle n'est plus qu'une FENÊTRE qu'on fait glisser. Le geste vit sur les dalles.
       📐 `k` peut être fractionnaire : à mi-chemin entre deux dalles, le ruban est à
       mi-chemin entre deux tuiles. C'est ça, « les deux défilent en même temps ». */
    r.scrollLeft = ROUE.pas * k;
    marquer(Math.round(k));
  };
  /* ⭐ ET LE RANG SORT AVEC LA ROUE : c'est lui qui traduit « section n » en « tuile n »,
     et il porte le décalage du `+` de gauche en mode édition. ⛔ Le recopier dans le
     verrou en ferait une seconde vérité. */
  r.rang = rang;
  /* ⭐ ET SON INVERSE : de quelle section parle la tuile `k` ? ⛔ Le verrou ne peut pas le
     recalculer — le `+` de gauche du mode édition décale tout d'un cran, et deux formules
     pour une seule traduction divergeraient au premier mode. */
  r.section = (k) => k - (edition && !deplacement ? 1 : 0);
  r.marquer = marquer;
  r.vise = vise;
  return r;
}

/* ══ LE DÉPLACEMENT D'UNE SECTION — croquis d'Eric, 19/09 ═══════════════════
   ⚖️ *« hold one section for 1,5 second and this mode comes on ; if you drag up to a
   chevron the selector moves »* · *« le x, +, / disparaissent pour voir l'ordre des
   sections »* · *« edit mode comprenant le déplacement des storage »* (19/09 au soir).
   ⭐ LE MAINTIEN EST LA PORTE, ET IL DOIT L'ÊTRE : un simple glisser sur la roue est
   déjà pris — c'est le BALAYAGE qui tourne les sections. Deux gestes sur la même
   surface se départagent par le TEMPS, pas par la direction.
   ⛔ ET UN MOUVEMENT AVANT L'ARMEMENT ANNULE : qui balaie ne maintient pas. Sans cette
   règle, un balayage un peu lent serait devenu un déplacement, et l'ordre des sections
   aurait bougé sous un geste qui voulait seulement naviguer. */
/** ⏱️ LE TEMPS D'ARRÊT — au bout de quoi on considère que le ruban s'est POSÉ.
 *  ⚖️ Eric, 2026-09-20 : *« un côté magnétique quand ça s'arrête »*. ⭐ C'est ce délai
 *  qui sépare les deux vitesses du viseur : la loupe suit à chaque image, la SÉLECTION
 *  attend le silence. ⛔ Trop court, on repeint en pleine lancée et on la tue ; trop
 *  long, la grille tarde à suivre l'œil. 140 ms : plus long qu'un creux entre deux
 *  images (16 ms) et plus court qu'un battement de paupière. */
export const REPOS_MS = 140;

/** ⭐ LE PLACEMENT EN ATTENTE — le ruban de dalles le dépose ici en se construisant, et
 *  l'écran qui l'insère dans la page l'appelle juste après.
 *  🔄 IL A CHANGÉ DE SUJET LE 19/09, PAS DE QUESTION : c'était la roue qui se plaçait,
 *  c'est le ruban de dalles maintenant — la roue le SUIT. Tout ce que ce commentaire dit
 *  reste vrai mot pour mot, seul l'organe a bougé.
 *  ⛔ IL NE SE REJOUE PAS une fois posé : un second appel ramènerait le ruban à la place
 *  du rendu précédent alors que le doigt l'a déjà déplacé.
 *  🔴 MAIS IL NE SE CONSOMME QUE S'IL A PRIS — il rend `true` quand il se relit. Deux
 *  écrans appellent (l'étape et la coquille) et l'un des deux peint parfois détaché :
 *  là, `scrollLeft` ne lève rien et ne garde rien. Un placement consommé à l'aveugle
 *  serait donc avalé par l'appel qui écrit dans le vide, et le ruban resterait à zéro
 *  — relevé dans l'application, deux fois, avant que cette ligne existe. */
let placementEnAttente = null;

export function poserLesDalles() {
  const f = placementEnAttente;
  if (!f) return;
  if (f() === true) placementEnAttente = null;
}

export const MAINTIEN_MS = 1500;

/** ⏱️ LE PÉAGE DU JETON — Eric, 2026-09-19 : *« 350 ms sur jeton, swipe désactivé, fait
 *  tout passer en mode drag'n'drop… si on n'est pas en mode drag le swipe fonctionne »*.
 *  🧊 ET CE N'EST PAS UNE COTE NEUVE : c'est celle que le jeton portait jusqu'au 20/08,
 *  quand la grille des sorts avait encore un ascenseur. Eric l'avait fait retirer avec sa
 *  cause ; le sac fait revenir la cause, la cote revient avec.
 *  ⭐ ET C'EST LE SPRINGBOARD D'iOS, son autre mot du même soir : on tient une app avant
 *  de pouvoir la porter. Le péage n'est pas une rustine, c'est le prix universel de deux
 *  gestes sur les mêmes pixels. */
export const PEAGE_JETON_MS = 350;

/** ⭐ LE MÊME MINUTEUR QUE LA MARGE — ⛔ pas un second. Tenir un chevron fait défiler la
 *  roue cran par cran, et relâcher l'arrête. La règle « on ne relance rien tant que le
 *  sens ne change pas » est celle de `regardeLaMarge`, et elle vaut ici pour la même
 *  raison : deux minuteurs sur un même geste accélèrent sans que personne l'ait voulu. */
function regardeLeChevron(sens, options, pisteNoeud) {
  if (defilementVivant && defilementVivant.sens === sens) return;
  arreteLeDefilement();
  /* ⭐ IL POUSSE LE RUBAN DE DALLES, comme le chevron tapé — ⛔ pas un second régime.
     🔄 Et c'est bien le ruban de DALLES depuis le 19/09 : la roue ne défile plus d'
     elle-même, elle suit. Pousser la roue directement la désaccorderait des dalles. */
  const agir = (pisteNoeud && typeof pisteNoeud.pousser === "function")
    ? () => pisteNoeud.pousser(sens)
    : (options.surTourner ? () => options.surTourner(sens) : null);
  if (!agir) return;
  agir();
  defilementVivant = { sens, minuteur: setInterval(agir, MARGE_MS) };
}

/** ⭐ LES ÉCOUTEURS VIVENT SUR `document`, PAS SUR LE CRAN — parce qu'entrer en mode
 *  DÉPLACEMENT repeint la roue : le cran qu'on tient disparaît du DOM sous le doigt.
 *  C'est la même loi que le glisser d'un jeton, et elle a déjà été payée ici. */
function armerLeDeplacement(noeud, position, options, pisteNoeud) {
  if (!options.surDeplacer) return;
  noeud.addEventListener("pointerdown", (ev) => {
    if (!ev || (typeof ev.button === "number" && ev.button > 0)) return;
    const depart = { x: ev.clientX, y: ev.clientY };
    let arme = false;
    const fin = () => {
      clearTimeout(minuteur);
      document.removeEventListener("pointermove", bouger);
      document.removeEventListener("pointerup", lacher);
      document.removeEventListener("pointercancel", fin);
    };
    const bouger = (e) => {
      if (!arme) {
        /* ⛔ QUI BALAIE NE MAINTIENT PAS — le seuil est le plancher tactile, pas un
           nombre choisi : en dessous, c'est un doigt qui tremble. */
        if (Math.abs(e.clientX - depart.x) > TOUCH || Math.abs(e.clientY - depart.y) > TOUCH) fin();
        return;
      }
      /* ⭐ LA DÉTECTION EST DU RESSORT DE L'ÉCRAN : c'est lui qui sait ce qu'il y a
         sous le doigt. L'étape, elle, ne reçoit qu'une POSITION — elle n'a pas à
         connaître le DOM. ⛔ `elementFromPoint` et pas la cible de l'événement : la
         capture implicite du tactile renvoie l'élément où le doigt s'est POSÉ, pas
         celui qu'il survole. C'est la faute que le banc au doigt a déjà coûtée. */
      const sous = document.elementFromPoint
        ? document.elementFromPoint(e.clientX, e.clientY) : null;
      if (!sous || typeof sous.closest !== "function") return;
      /* ⚖️ *« if you drag up to a chevron the selector moves »* — porter la section
         jusqu'au bout fait défiler la roue sous elle. ⭐ C'est le MÊME défilement que
         celui de la marge du sac, avec son minuteur : ⛔ pas un second. */
      const chevron = sous.closest(".sac-tuner");
      if (chevron) { regardeLeChevron(chevron.dataset.sens === "droite" ? 1 : -1, options, pisteNoeud); return; }
      arreteLeDefilement();
      const cible = sous.closest('.sac-cran[data-position]');
      if (!cible) return;
      const vers = Number(cible.dataset.position);
      if (Number.isInteger(vers)) options.surDeplacer({ phase: "bouger", vers });
    };
    const lacher = () => { arreteLeDefilement(); if (arme) options.surDeplacer({ phase: "poser" }); fin(); };
    const minuteur = setTimeout(() => { arme = true; options.surDeplacer({ phase: "prendre", position }); }, MAINTIEN_MS);
    document.addEventListener("pointermove", bouger);
    document.addEventListener("pointerup", lacher);
    document.addEventListener("pointercancel", fin);
  });
}

/* ══ LE DÉFILEMENT PAR LA MARGE — Eric, 18/09 ══════════════════════════════
   ⚖️ *« le drag dans la marge fait défiler latéralement les sections en maintenant
   le fantôme, ce qui permet de le déplacer d'une section à l'autre »*.

   ⭐ ET CE GESTE SURVIT AU REPEINT, CE QUI N'ALLAIT PAS DE SOI : tourner une section
   reconstruit toute la grille, donc le jeton qu'on tient QUITTE le DOM en plein
   geste. C'est exactement la panne du lot 205 — *« il reste bloqué là où tu le
   vois »* —, et `glisser.mjs` l'a réglée pour de bon : les écouteurs vivent sur
   `document`, le fantôme sur `document.body`, et la visée passe par
   `elementFromPoint`, donc elle rencontre les cases NEUVES. Le geste ne tient à
   aucun nœud de l'écran. ⛔ Sans cette propriété, ce défilement serait impossible.

   ⭐ ET LE MINUTEUR SE TIENT AU MODULE, PAS DANS UNE FERMETURE — la même loi que le
   `gesteVivant` de `glisser.mjs` : *« ce qui est partagé se tient au module »*.
   🔴 En fermeture il aurait FUI : chaque cran repeint l'écran, donc crée un nouvel
   objet d'écran, pendant que l'ancien minuteur continue de tourner. La roue serait
   partie toute seule et ne se serait plus arrêtée. */
let defilementVivant = null;

/** ⏱️ LA LATENCE DE LA MARGE — ⭐ ET ELLE EST DICTÉE MAINTENANT. Eric, 2026-09-19 :
 *  *« le drag and drop aura une latence de 500 ms avant de sauter d'une dalle à
 *  l'autre »*.
 *  📌 Le commentaire qui vivait ici disait *« aucune donnée ne la dicte… un mot d'Eric
 *  et elle bouge »*. Le mot est venu, et il change DEUX choses, pas une :
 *    · la cote passe de 450 à **500** ;
 *    · ⛔ et le PREMIER saut n'est plus immédiat. J'avais écrit *« le premier cran part
 *      tout de suite, sinon la marge semble morte »* — c'était mon raisonnement, pas le
 *      sien, et il ne tient plus : depuis que les dalles glissent, toucher une marge
 *      ferait fuir tout l'écran sous le doigt qui portait l'objet.
 *  ⭐ UNE SEULE COTE POUR LES DEUX : la même attente avant le premier saut et entre les
 *  suivants. Deux nombres pour une question, c'est la divergence garantie. */
export const MARGE_MS = 500;

/** Le sens du défilement pour une abscisse d'écran : `-1` à gauche de la grille,
 *  `+1` à sa droite, `0` dessus.
 *  ⛔ LA MARGE NE S'INVENTE PAS : c'est tout ce qui est HORS de la largeur de la
 *  grille, et cette largeur vient du plan (`COLONNES`, `JETON`). Un pour-cent écrit
 *  ici serait un nombre de plus à tenir d'accord avec la table. */
function margeDuGlisser(x) {
  const dalle = document.querySelector(".sac");
  if (!dalle || typeof dalle.getBoundingClientRect !== "function") return 0;
  /* ⛔ ON NE LIT DU RECTANGLE QUE SON BORD GAUCHE, et c'est volontaire : `x` vient
     de `clientX`, donc du MÊME repère peint. ⭐ La conversion blg → peint passe par
     le facteur de la racine d'échelle, jamais par une largeur qu'on diviserait soi-
     même — deux lecteurs du zoom finiraient par ne plus dire la même chose. */
  const gauche = dalle.getBoundingClientRect().left;
  const k = facteurZoomCourant(document);
  if (!k) return 0;
  if (x < gauche + COLONNES[0] * k) return -1;
  if (x > gauche + (COLONNES[COLONNES.length - 1] + JETON.l) * k) return 1;
  return 0;
}

/** Arrête le défilement. ⭐ Appelée au dépôt ET au lâcher — un geste qui se termine
 *  n'importe comment doit rendre la roue immobile. */
export function arreteLeDefilement() {
  if (defilementVivant && defilementVivant.minuteur) clearInterval(defilementVivant.minuteur);
  defilementVivant = null;
}

/** Le pointeur a bougé pendant un glisser : entre-t-il, sort-il, ou reste-t-il dans
 *  la même marge ? ⛔ On ne relance rien tant que le sens ne change pas. */
function regardeLaMarge(x, options, pisteNoeud) {
  const sens = margeDuGlisser(x);
  if (defilementVivant && defilementVivant.sens === sens) return;
  arreteLeDefilement();
  if (sens === 0) return;
  /* ⚖️ LE GLISSER D'UN JETON EST LE SEUL GESTE QUI FAIT DÉFILER LES DALLES — Eric,
     2026-09-19 : *« le glissage de token horizontal fait défiler les dalles à 500 ms »*,
     juste après avoir retiré le swipe de dalle (*« donc pas de swipe de dalle »*).
     ⭐ LES DEUX DÉCISIONS SE TIENNENT : la grille ne dispute plus le doigt à l'objet qu'on
     y porte, et porter l'objet au bord reste le chemin pour changer de section en cours
     de route. Une surface, un geste — et le geste sert deux choses à la fois.
     ⭐ ET IL POUSSE LA ROUE, comme les chevrons : c'est elle le maître, les dalles suivent.
     ⛔ Un `surTourner` repeindrait l'écran sous le jeton en l'air — c'est exactement ce
     qu'on vient de retirer de cet écran. */
  const agir = (pisteNoeud && typeof pisteNoeud.pousser === "function")
    ? () => pisteNoeud.pousser(sens)
    : (options.surTourner ? () => options.surTourner(sens) : null);
  if (!agir) return;
  /* ⛔ PLUS DE PREMIER CRAN IMMÉDIAT — Eric, 19/09 : *« une latence de 500 ms AVANT de
     sauter d'une dalle à l'autre »*. Le doigt qui porte un objet passe forcément par la
     marge en chemin ; sans cette attente, l'écran partirait sous lui à chaque fois. */
  defilementVivant = { sens, minuteur: setInterval(agir, MARGE_MS) };
}

/** Le glisser d'un jeton du sac — le même partout : la marge défile, le dépôt pose.
 *  ⭐ Écrit UNE fois et donné aux deux organes qui glissent (une case, le
 *  collecteur) : deux copies divergeraient au premier réglage. */
function glisserDuSac(noeud, index, options, surDepot, pisteNoeud) {
  armerJeton(noeud, {
    /* ⏱️ LE PÉAGE, ET IL N'EST PAS GÉNÉRAL : il vit ici parce que le sac a un ascenseur.
       ⛔ Species et les sorts n'en ont pas, donc pas de péage — la loi du 20/08 tient. */
    maintien: PEAGE_JETON_MS,
    onTap: () => options.surJeton && options.surJeton(index),
    onLever: (x, y) => fantome.lever(noeud, x, y),
    onBouger: (x, y) => { fantome.suivre(x, y); regardeLaMarge(x, options, pisteNoeud); },
    onPoser: () => { fantome.ranger(); arreteLeDefilement(); },
    onDepot: (creneau) => { arreteLeDefilement(); surDepot(creneau); }
  });
}

/* ══ LE BALAYAGE DE LA GRILLE — Eric, 18/09 au soir ════════════════════════
   ⚖️ *« reste le balayage, qui est accessible »* — dit APRÈS avoir tranché que les
   tuners sont une affaire de souris. ⭐ La molette tourne la page à la souris ; le
   balayage la tourne au doigt, et c'est LUI le geste que tout le monde peut faire.
   ⛔ UN GESTE QUI PART D'UN JETON EST UN GLISSER, PAS UN BALAYAGE — c'est la seule
   règle qui les sépare, et elle se lit sur le nœud (`data-glissable`, la marque que
   `armerJeton` pose). Sans elle, prendre un objet pour le déplacer tournerait la
   page sous lui. ⭐ Et c'est la convention du téléphone : on glisse une icône, on
   balaie la page. */

/** ⛔ LE SEUIL NE S'INVENTE PAS : un mouvement plus court qu'une CIBLE TACTILE n'est
 *  pas un balayage, c'est un tap qui a tremblé. `TOUCH` est déjà ce plancher-là. */
const SEUIL_BALAYAGE = TOUCH;

/** ⭐ DEUX SURFACES, DEUX SUJETS, LE MÊME GESTE. Sur la GRILLE il tourne la PAGE ; sur
 *  la ROUE il tourne la SECTION — Eric, 19/09 : *« les sections de sacs, le swipe doit
 *  fonctionner »*. ⛔ Écrit UNE fois : deux copies divergeraient au premier réglage. */
function balayage(noeud, { surface, actif, agit }) {
  let depart = null;
  const oublie = () => { depart = null; };
  noeud.addEventListener("pointerdown", (ev) => {
    oublie();
    if (!actif()) return;
    const cible = ev && ev.target;
    if (!cible || typeof cible.closest !== "function") return;
    if (cible.closest('[data-glissable="true"]')) return;   /* c'est un glisser */
    if (!cible.closest(surface)) return;
    depart = { x: ev.clientX, y: ev.clientY };
  });
  noeud.addEventListener("pointercancel", oublie);
  noeud.addEventListener("pointerup", (ev) => {
    if (!depart) return;
    const dx = ev.clientX - depart.x;
    const dy = ev.clientY - depart.y;
    oublie();
    /* ⛔ ET IL DOIT ÊTRE FRANCHEMENT HORIZONTAL : sur un écran qui défile, un geste
       ambigu appartient au défilement, jamais à nous. */
    if (Math.abs(dx) < SEUIL_BALAYAGE || Math.abs(dx) <= Math.abs(dy)) return;
    /* ⭐ vers la GAUCHE = la SUITE, la convention du téléphone : on pousse ce qu'on
       regarde hors de l'écran pour faire venir la suite. */
    agit(dx < 0 ? 1 : -1);
  });
}

/** Un tuner — chevron au repos, flèche circulaire au survol *(la feuille le peint)*,
 *  et la molette le fait tourner. ⚖️ Eric, 18/09 : *« le chevron devient un bouton
 *  tuner avec une flèche circulaire »* · *« hover avec souris le déclenche »*.
 *  ⛔ LA MOLETTE S'AJOUTE, elle ne remplace rien : le tuner se TAPE toujours. */
function tuner(sens, options, pisteNoeud) {
  /* ⚖️ ERIC, 2026-09-20 : *« ils font défiler d'une tuile »*. ⛔ PLUS UN SAUT : le chevron
     POUSSE le ruban du même pas aimanté que le doigt. Deux régimes de mouvement sur une
     seule surface — l'un qui glisse, l'autre qui téléporte — rendent un écran illisible
     au doigt, et c'est précisément ce que « fluide comme le belt » interdit. */
  const pousse = () => {
    if (pisteNoeud && typeof pisteNoeud.pousser === "function") pisteNoeud.pousser(sens);
    else if (options.surTourner) options.surTourner(sens);
  };
  const b = bouton("sac-tuner", "", sens < 0 ? "Previous section" : "Next section", pousse);
  b.dataset.organe = sens < 0 ? "tuner-g" : "tuner-d";
  b.dataset.sens = sens < 0 ? "gauche" : "droite";
  /* ⛔ `passive: false` — sans lui le navigateur refuse le `preventDefault`, et la
     page défilerait DERRIÈRE la roue pendant qu'on la tourne. */
  b.addEventListener("wheel", (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (pisteNoeud && typeof pisteNoeud.pousser === "function") pisteNoeud.pousser((ev && ev.deltaY < 0) ? -1 : 1);
    else if (options.surTourner) options.surTourner((ev && ev.deltaY < 0) ? -1 : 1);
  }, { passive: false });
  return b;
}

/** Une case de la grille — vide elle attend, occupée elle porte le jeton.
 *  ⭐ LE CORPS DU JETON VIENT DE SON ORGANE (`jeton-objet.mjs`), celui de R. */
function case_(id, objet, options, pisteNoeud) {
  const c = el("div", "sac-case");
  c.dataset.organe = id;
  /* ⚖️ LA MOLETTE SUR LA GRILLE TOURNE LA PAGE — Eric, 18/09 : *« plus de place, ça
     va dans la page suivante… voire ça crée une page supplémentaire si besoin »*,
     donc une section a des pages et il faut pouvoir les atteindre.
     ⭐ C'EST L'IDIOME DU TUNER, celui qu'Eric a demandé pour la roue : *« utiliser le
     scroll de la souris peut aider le défilement »*. La roue tourne les SECTIONS, la
     grille tourne les PAGES — deux surfaces, deux sujets, le même geste.
     ⏳ ET LE GESTE TACTILE N'EST PAS TRANCHÉ : à la souris on y est, au doigt il
     manque un balayage. ⛔ Je ne l'invente pas — question posée à Eric. */
  c.addEventListener("wheel", (ev) => {
    if (!options.pages || options.pages < 2) return;
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (options.surPage) options.surPage((ev && ev.deltaY < 0) ? -1 : 1);
  }, { passive: false });
  if (!objet) {
    c.dataset.creneau = id;
    c.dataset.vise = "false";
    c.setAttribute("aria-label", "Empty");
    return c;
  }
  c.dataset.occupe = "oui";
  c.append(...corpsDuJeton(objet));
  c.setAttribute("aria-label", motDuJeton(objet));
  /* ⛔ `armerJeton` NE VOIT PAS LE CLIC DROIT (il ne s'arme que sur le bouton 0) :
     le `contextmenu` se pose donc à côté, sur le même nœud — comme sur R. */
  const ouvrirLaFiche = (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (options.surJeton) options.surJeton(objet.index);
  };
  c.addEventListener("contextmenu", ouvrirLaFiche);
  /* ⚖️ VERROUILLÉ, IL NE SE LÈVE PAS — Eric, 18/09 : *« l'item reste collé à son
     collecteur, ne bouge pas »*. ⛔ Le glisser n'est pas ARMÉ : pas de fantôme, pas
     de cible qui s'allume, rien qui promette un dépôt qui sera refusé.
     ⭐ MAIS IL S'OUVRE TOUJOURS : c'est dans sa fiche qu'on le déverrouille, sans
     quoi le verrou serait une impasse. */
  if (objet.locked === true) {
    c.dataset.verrouille = "oui";
    c.addEventListener("click", ouvrirLaFiche);
  } else {
    glisserDuSac(c, objet.index, options, (creneau) => {
      if (creneau === "collecteur") { if (options.surCollecte) options.surCollecte(objet.index); }
      else if (options.surPlacer) options.surPlacer(objet.index, creneau);
    }, pisteNoeud);
  }
  return c;
}

/** Le collecteur d'envoi — UN jeton (loi du 29/08), et il ne retient qu'UN objet :
 *  Eric, 16/09 — *« un item dans le collecteur, pas 2 ; si on veut plus c'est un
 *  Tally »*. Plein, il cesse d'être une cible : un second dépôt ne fait rien.
 *  ⭐ IL PORTE LA CLASSE DE R (`gear-collecteur`), pas une copie de son habit : le
 *  creux, le relief, le liseré d'info quand il retient — tout vient de là.
 *  ⏳ DETTE DE NOM, ET ELLE EST NOMMÉE : `gear-collecteur` dit encore l'écran qui
 *  l'a porté le premier. Le jour où Wares le prendra — il est au programme — il
 *  descendra dans un organe au nom neutre, comme l'interrupteur et le jeton. */
function collecteur(options, retenu, pisteNoeud) {
  const c = el("div", "gear-collecteur");
  c.dataset.organe = "collecteur";
  if (!retenu) { c.dataset.creneau = "collecteur"; c.dataset.vise = "false"; }
  c.dataset.compte = String(retenu ? 1 : 0);
  if (!retenu) {
    c.append(el("span", "gear-nom", "Send collector"));
    c.setAttribute("aria-label", "Send collector — empty");
    return c;
  }
  /* ⚖️ PLEIN, IL PORTE L'OBJET LUI-MÊME — Eric, 16/09 au soir : *« lorsqu'un token va
     dans le collecteur, il ne doit pas rester à sa place initiale »*. ⛔ MAIS PAS SA
     BANDE : *« il n'y a pas de token dans le collecteur, juste le nom »*. */
  c.dataset.occupe = "oui";
  const objet = el("span", "jeton-nom", retenu.nom);
  if (retenu.qte > 1) objet.append(" ", el("span", "gear-qte", `×${retenu.qte}`));
  c.append(objet);
  c.setAttribute("aria-label", `Send collector — ${retenu.nom}`);
  /* ⚖️ ET IL EN RESSORT PAR LE MÊME GESTE QU'IL Y EST ENTRÉ — Eric, 16/09 au soir :
     *« un token dans le collecteur doit pouvoir en ressortir »*. ⛔ Un dépôt sur le
     collecteur lui-même ne fait rien : il est déjà là. */
  const ouvrirLaFiche = (ev) => {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (options.surJeton) options.surJeton(retenu.index);
  };
  c.addEventListener("contextmenu", ouvrirLaFiche);
  glisserDuSac(c, retenu.index, options, (creneau) => {
    if (creneau === "collecteur") return;       /* il est déjà là */
    if (options.surPlacer) options.surPlacer(retenu.index, creneau);
  }, pisteNoeud);
  return c;
}

/** ⚖️ LES TROIS ORGANES D'ÉCHANGE, DÉCLARÉS UNE FOIS — et c'est ce qui permet de
 *  les TENIR. 🔴 Le 19/09 au soir, les trois publiaient `surPorte(id)` et l'écouteur
 *  n'en connaissait aucun : cliquer la bourse du sac ne produisait RIEN. Un garde qui
 *  regardait l'écran était vert — l'écran, lui, faisait son travail.
 *  ⭐ LA TABLE EST DONC EXPORTÉE : le témoin la lit et exige que CHAQUE organe qui a un
 *  destinataire soit écouté. Un quatrième organe ajouté ici étend le garde tout seul.
 *  ⛔ `inerte` n'est pas « désactivé pour l'instant » : c'est *« une place réservée se
 *  montre inerte »* — le Group Tally n'existe qu'EN JEU, la donnée ne le porte pas à la
 *  création, et un bouton qui accepte le doigt sans jamais répondre apprend à ne plus
 *  toucher. */
export const ORGANES_D_ECHANGE = Object.freeze([
  Object.freeze({ id: "party-tally", mot: "Party Tally", inerte: true }),
  Object.freeze({ id: "tally", mot: "Tally" }),
  Object.freeze({ id: "purse", mot: "Purse" })
]);

/* ══ L'ÉCRAN ══════════════════════════════════════════════════════════════ */

/** @param {object} options
 *   · `sections` : `[{ nom, fige?, renommable?, dehors? }]` — celles que le joueur a
 *     créées, plus celles qui sont là d'entrée de jeu (`fige` : pas supprimable ·
 *     `renommable: false` : pas renommable · `dehors` : liseré doré, hors du sac) ;
 *   · `section`  : l'index de celle qu'on regarde ;
 *   · `edition`  : la roue est-elle en mode édition (le bouton `sections`) ;
 *   · `renommage`: le champ est-il ouvert sur la boîte regardée (la poignée `/`) ;
 *   · `objets`   : les douze places, `null` pour une case vide ;
 *   · `poids`    : `{ gear, backpack, encombrement }`, déjà mis en mots ;
 *   · `compteurs`: `{ tally, "party-tally" }` — ce que chaque parchemin porte ;
 *   · `page` / `pages` : la fraction déjà en mots, et le NOMBRE de pages — la
 *     molette ET le balayage ne tournent que s'il y en a plus d'une ;
 *   · les gestes : `surTourner`, `surSection`, `surJeton`, `surTrier`,
 *     `surSections`, `surAjouter`, `surRenommer`, `surSupprimer`, `surEditer`, `surPage`,
 *     `surCollecte`, `surPlacer`, `surDrop`, `surDestination`, `surPorte`.
 *  @returns {{noeud: HTMLElement}} */
export function construireLeSac(options = {}) {
  /* 🔴 `dalle-simple` — LE VOILE D'UN RANG B, ET J'AVAIS PRIS CELUI DE R. Eric,
     18/09, en regardant l'écran en ligne : *« la dalle de fond 35 % de voile
     pfffff »*.
     ⛔ CE QUE J'AVAIS LU, ET POURQUOI C'ÉTAIT FAUX : `cadre-voile-du-fond` (26/08)
     écrit *« la DALLE = 50 % »* — j'ai lu le mot « dalle » sans regarder DE QUELLE
     dalle il parle. Les 50 % sont ceux de la dalle d'un écran de PARCOURS ; le sac
     est un rang B, posé DANS la dalle de R, donc il relève de la ligne du dessous :
     **35 %, le voile des blocs intérieurs**.
     ⭐ ET LE TÉMOIN EST DANS LE DÉPÔT : `.parcours-guide` — « la dalle du rang B
     qui rend Species, Inheritance et Class » (`tests/dalle-du-rang.test.mjs`) —
     porte `dalle-simple`. Une dalle ne peint pas sa matière : elle porte la classe
     qui la lui donne, et le rang décide de la classe.
     ⚠️ J'avais d'abord peint un `--surface` OPAQUE, puis copié `dalle-intermediaire`
     « parce que R l'a ». Les deux fautes sont la même : copier un voisin au lieu de
     lire la loi de son propre rang. */
  const noeud = el("section", "sac");
  /* 🎯 LE RUBAN DE DALLES NAÎT ICI, avant la roue, parce que c'est LUI que les chevrons
     poussent et que la roue suit. ⛔ Il se remplit plus bas, à la place de la grille. */
  const piste = el("div", "sac-dalles");
  piste.dataset.organe = "dalles";
  noeud.dataset.ecran = "SB3.1";
  /* ⭐ LE MODE VIT SUR LA DALLE, PAS DANS CINQ ORGANES : un seul attribut, et la
     roue, les deux outils et les tuners s'y accordent par la feuille. Un état
     recopié sur chaque organe diverge au premier ajout. */
  const edition = options.edition === true;
  noeud.dataset.mode = edition ? "edition" : "repos";

  const feuille = el("style");
  feuille.dataset.fhpc = "sac";
  feuille.textContent = feuilleDesCotesSac();
  noeud.append(feuille);
  /* ⚖️ LES TROIS BANDES PORTENT LA MÊME MATIÈRE — Eric, 2026-09-19 : *« une transparence
     identique entre les dalles fixes et mobiles »*.
     🔴 ET ELLE NE L'ÉTAIT PAS : `.sac` portait déjà `dalle-simple`, et je venais d'en poser
     un SECOND sur la plaque mobile. 35 % sur 35 % — la plaque était plus sombre que ses
     voisines, et c'est exactement ce qu'il a vu. ⛔ Un voile qui se superpose à lui-même
     n'est pas un réglage à corriger, c'est deux écrivains pour une matière.
     ⭐ LA DALLE DU SAC NE PORTE DONC PLUS RIEN, et les trois bandes en portent une chacune.
     Le jour entre elles montre le fond tout seul — plus besoin du masque qui perçait le
     voile, il n'y a plus de voile à percer.
     📐 Leurs boîtes se DÉDUISENT de la bande mobile : la fixe du haut va du bord au jour
     qui précède, celle du bas du jour qui suit au bord de la dalle. */
  for (const clef of ["bande-haut", "bande-bas"]) {
    const bande = el("div", "sac-bande dalle-simple");
    bande.dataset.bande = clef;
    bande.setAttribute("aria-hidden", "true");
    noeud.append(bande);
  }

  /* 🎒 LE FILIGRANE, POSÉ EN PREMIER — c'est l'ordre du document qui le met DESSOUS :
     tous les organes qui suivent sont absolus comme lui et se peignent par-dessus.
     ⛔ Pas de `z-index` : un empilement déclaré serait un nombre de plus à tenir
     d'accord avec un ordre qui le dit déjà.
     ⛔ ET IL NE PREND PAS LE DOIGT (`pointer-events: none`, à la feuille) ni la parole
     (`aria-hidden`) : c'est un repère, pas un organe — exactement comme le pantin. */
  if (FOND) {
    const f = el("div", "sac-fond");
    f.setAttribute("aria-hidden", "true");
    noeud.append(f);
  }

  /* ⭐ LES DEUX BALAYAGES ÉCOUTENT SUR LA DALLE, PAS SUR CHAQUE ORGANE : douze
     écouteurs pour un seul geste, c'est douze occasions d'en oublier un. La
     délégation lit la cible, et c'est ELLE qui dit de quel sujet il s'agit. */
  balayage(noeud, { surface: ".sac-case",
    actif: () => options.pages > 1,
    agit: (sens) => options.surPage && options.surPage(sens) });
  /* ⛔ PLUS DE BALAYAGE MAISON SUR LA ROUE — Eric, 20/09 : *« aussi fluide que dans le
     belt »*. Le défilement est NATIF maintenant ; un balayage écrit à la main par-dessus
     se battrait avec lui, et c'est l'inertie du système qu'on perdrait — exactement ce
     qu'on cherchait à gagner. ⭐ Celui de la GRILLE reste : elle, ne défile pas. */

  /* ⛔ LES TUNERS SONT POSÉS SUR LA DALLE, pas dans la roue : la table les
     déclare `dans: "ROUE"` pour dire qu'ils LUI APPARTIENNENT — un voyant dans
     un bouton, la seule inclusion admise — mais au DOM ils sont frères d'elle,
     sinon leur cible déborderait de sa boîte. */
  /* ⚖️ LA LOUPE — Eric, 2026-09-20 : *« le halo doit rester centré, les items défilent
     dessous et s'agrandissent »* · *« le halo qui est comme une loupe »*.
     ⭐ C'EST UN CADRE FIXE, sœur de la roue et non sa fille : dans le ruban elle aurait
     défilé avec lui. Sa cote vient du plan (`LOUPE`), à la place exacte qu'occupait le
     cran dominant — donc les deux poignées, qui s'y accrochent, n'ont pas bougé d'un blg.
     ⛔ Elle ne prend pas le doigt et ne dit rien : ce qu'on tape, ce sont les tuiles. */
  const loupe = el("div", "sac-loupe");
  loupe.dataset.organe = "loupe";
  loupe.setAttribute("aria-hidden", "true");
  const r = roue(options, loupe, piste);
  noeud.append(r, loupe, tuner(-1, options, piste), tuner(1, options, piste));

  /* ⭐ LA BOÎTE SOUS LE VISEUR — celle dont parlent les deux poignées. ⛔ `undefined`
     quand le viseur est sur le `+` : la liste des sections ne le porte pas, et c'est
     par cette forme-là que les poignées savent se taire, pas par un test de plus. */
  /* ⚖️ LE MODE DÉPLACEMENT VIT SUR LA DALLE, comme le mode édition — ⛔ pas dans cinq
     organes. C'est LUI qui efface les poignées et qui rend la roue opaque : *« le x, +,
     / disparaissent pour voir l'ordre des sections »*, et le croquis montre toute la
     roue sur un fond crème. ⭐ `--surface` EST ce crème (`#ebe8e1`), et il bascule tout
     seul la nuit — la roue sort du verre, ce qui dit exactement le geste en cours. */
  const deplacementVu = options.deplacement != null;
  if (deplacementVu) noeud.dataset.deplacement = "oui";
  const sectionsVues = options.sections || [];
  /* ⛔ ET ON NE BORNE PAS L'INDEX : borné, le viseur posé sur le `+` retombait sur la
     DERNIÈRE section, et les deux poignées paraissaient en proposant de renommer une
     boîte qu'on ne regardait pas. ⭐ Hors liste = `undefined`, et les poignées se
     taisent par la forme des données, pas par un test de plus. */
  const figee = sectionsVues[Math.max(0, options.section | 0)];

  /* ⚖️ LES DEUX POIGNÉES DU MODE ÉDITION — Eric, 2026-09-19 : *« dans le mode edit
     mettre un x (carré 40 × 40 à gauche, À CHEVAL) et un / (carré 40 × 40 à droite)
     de la boîte sélectionnée : on peut l'éditer ou l'effacer. Le swipe et les
     chevrons permettent de naviguer. »*
     ⭐ À CHEVAL, ET C'EST LE MOT QUI COMPTE : elles sont centrées sur les deux arêtes
     du cran dominant, donc à moitié dessus. Elles disent ainsi de QUELLE boîte elles
     parlent — posées à côté, elles auraient pu désigner la voisine.
     ⛔ ELLES NE SONT PAS DES ORGANES DE LA ROUE : la roue défile, elles non. Elles
     restent accrochées au VISEUR, qui ne bouge jamais.
     ⛔ ET ELLES NE PARAISSENT PAS SUR LE `+` : il n'y a rien à renommer ni à effacer
     dans une place qui n'existe pas encore. ⭐ Rien à écrire pour ça — la liste des
     sections ne porte pas le `+`, donc `figee` est absente quand le viseur est
     dessus. Un cas qui se règle par la forme des données ne se règle pas deux fois. */
  if (edition && !deplacementVu && figee) {
    const effacer = bouton("sac-poignee", "×", "Delete this section",
      () => options.surSupprimer && options.surSupprimer());
    effacer.dataset.organe = "effacer";
    if (figee.fige === true) effacer.disabled = true;
    const editer = bouton("sac-poignee", "/", "Rename this section",
      () => options.surEditer && options.surEditer());
    editer.dataset.organe = "editer";
    if (figee.renommable === false) editer.disabled = true;
    noeud.append(effacer, editer);
  }

  /* ⚖️ LES DEUX OUTILS — Eric, 18/09 : *« un petit bouton 40 × 40 à droite du titre
     de section qui ressemble à un cadrillage ; un autre à gauche qui fait un
     rangement local »*.
     ⭐ ET LE GAUCHE CHANGE DE MÉTIER EN ÉDITION : trier une section pendant qu'on
     édite la LISTE des sections n'a pas de sens, et sa place est la seule libre.
     Il devient le `−` — *« le bouton − supprime »*. Le droit, lui, ne bouge pas :
     c'est l'interrupteur du mode, et un interrupteur qui se déplace n'en est plus
     un. Il s'allume (`data-on`), comme les bascules de X1. */
  /* ⚖️ DES MOTS, PLUS DES GLYPHES — Eric, 19/09 : *« le bouton d'édition est trop
     grossier ; je préfère un carré vert simple : edit / sections. Et un autre bouton
     classique vert : Sort. »*
     ⛔ LES DEUX GLYPHES SONT MORTS AVEC EUX : un cadrillage et une flèche de tri ne
     disaient pas assez ce qu'ils font. ⭐ Et les deux boutons reprennent `gear-porte`,
     la famille des boutons à verbe — ⛔ pas une troisième famille à habiller. Le
     liseré dit le verbe (§6), et Eric les veut VERTS : on agit. */
  /* ⛔ `Sort` RESTE `Sort`, DANS LES DEUX MODES — Eric, 19/09, a sorti la suppression
     de cette place en lui donnant la sienne : *« un x (carré 40 × 40 à gauche, à
     cheval) et un / (carré 40 × 40 à droite) de la boîte sélectionnée »*.
     ⭐ Un outil qui change de métier selon le mode est un outil qu'on relit à chaque
     fois. Celui-ci ne change plus. */
  const trier = bouton("bouton gear-porte sac-outil", "Sort", "Sort this section",
    () => options.surTrier && options.surTrier());
  trier.dataset.organe = "trier";
  trier.dataset.porte = "trier";
  /* ⭐ LE CARRÉ PORTE SON MOT SUR DEUX ÉTAGES — c'est ce qu'Eric a dessiné : `edit`
     au-dessus de `sections`. ⛔ Le retour à la ligne n'est PAS dans le texte : deux
     nœuds, sinon un `\n` se retrouverait dans l'`aria-label`. */
  /* ⚖️ *« carré vert = bouton classique »* — Eric, 19/09, en tranchant sa propre
     phrase de la veille. ⭐ Les deux outils sont donc du MÊME gabarit, le PETIT, et
     le mot « carré » désignait le vert, pas la forme.
     📏 ET C'EST LA MESURE QUI A RENDU CE MOT NÉCESSAIRE : mis à 44 de large, ce
     bouton rendait quand même 77 — la famille impose `min-width: var(--bouton-petit)`
     sous un sélecteur à (0,3,1), et il SORTAIT de la dalle. Le plan lui donne
     maintenant ses 77, et la rangée s'est redisposée autour. */
  const sections = bouton("bouton gear-porte sac-outil", "",
    edition ? "Done editing sections" : "Edit sections",
    () => options.surSections && options.surSections());
  sections.append(el("span", "sac-etage", edition ? "done" : "edit"),
                  el("span", "sac-etage", "sections"));
  sections.dataset.organe = "sections";
  sections.dataset.porte = "sections";
  sections.dataset.on = edition ? "true" : "false";
  sections.setAttribute("aria-pressed", edition ? "true" : "false");
  noeud.append(trier, sections);

  /* ⚖️ QUATRE LIGNES DE POIDS — LA SOURCE DU CHAPITRE (16/09) : *« l'encart passe
     donc de trois à quatre lignes, sur R et sur B1 »* — SELF · BACKPACK · TOTAL ·
     OTHER. Eric, 18/09, nomme les trois premières *« Gear / Backpack / Encumbrance
     = (Gear + Backpack) »*, puis tranche la quatrième : *« other storage ne rentre
     pas dans encumbrance »*. ⭐ C'est parce qu'il NE COMPTE PAS qu'il doit se lire :
     sans sa ligne, un objet rangé à la remise disparaît de l'écran sans qu'un mot
     dise où il est passé.
     ⛔ CE SONT DES VOYANTS : on les lit, on ne les tape pas. */
  const p = options.poids || {};
  const total = el("p", "sac-poids", p.encombrement || "");
  total.dataset.organe = "poids-total";
  /* ⭐ LE DÉTAIL EST UNE LIGNE À TROIS PARTS, et chacune se centre dans la sienne :
     Eric écrit *« Gear xxxx  Backpack xxxx  other xxxx (centrés) »*. ⛔ Trois nœuds,
     pas une chaîne avec des espaces — des espaces ne se centrent pas. */
  const detail = el("p", "sac-poids");
  detail.dataset.organe = "poids-detail";
  /* ⚖️ CHAQUE PART SUR DEUX LIGNES — croquis d'Eric, 19/09 : *« GEAR : X / 5 ITEMS »*,
     *« BACKPACK X / 22 ITEMS »*, *« OTHER X / 7 ITEMS »*. ⭐ Le compte d'objets quitte
     le bout de la ligne pour rejoindre le poids qu'il accompagne : chaque part dit
     désormais SON poids et SON compte, au lieu d'un seul compte pour tout le sac.
     ⛔ Deux nœuds par part, pas un `\n` : un saut de ligne dans le texte finirait
     dans l'`aria-label`. */
  for (const part of [p.gear, p.backpack, p.autre]) {
    const n = el("span", "sac-poids-part");
    n.append(el("span", "sac-poids-mesure", (part && part.poids) || ""),
             el("span", "sac-poids-compte", (part && part.compte) || ""));
    detail.append(n);
  }
  noeud.append(total, detail);

  /* ⚖️ LE COMPTE ET LA PAGE ENCADRENT CE DÉTAIL — Eric, 19/09 : *« si tu mets les
     pages et le nombre d'items au même niveau que la deuxième ligne de
     l'encumbrance »*. ⭐ Trois mesures du même sac, sur une seule ligne, lues d'un
     regard — au lieu d'une rangée de plus sous la grille. ⛔ Deux voyants, pas deux
     contrôles : on ne tourne pas la page en tapant la fraction (le balayage et la
     molette le font). */
  /* ⛔ NI COMPTE GLOBAL NI COMPTEUR DE PAGES — Eric, 19/09 : *« j'ai mis le nombre
     d'items sous les Gear, Back, Other »* · *« inutile de compter les pages »*.
     ⭐ Le compte du sac EST « Backpack 22 items » : un chiffre écrit deux fois diverge
     au premier réglage. Ce que la source du chapitre demandait (*« le compte total à
     gauche »*) est donc tenu, et mieux — trois comptes au lieu d'un.
     ⭐ ET LES PAGES EXISTENT TOUJOURS : la grille déborde, le balayage et la molette la
     tournent. C'est le COMPTEUR qui s'en va, pas la pagination. */

  /* ⭐ UN OBJET RETENU A QUITTÉ SA CASE, et on le retire ICI plutôt que de demander
     à la case de se taire — Eric, 16/09 : *« il doit quitter l'emplacement et rester
     dans le collecteur »*. La place redevient vide, donc une CIBLE, sans qu'aucune
     règle d'affichage ait à connaître la collecte. */
  /* 🎯 LE RUBAN DE DALLES — Eric, 2026-09-19 : *« je fais défiler une tuile à travers le
     viseur, je fais défiler une dalle en même temps… ils sont liés »*.
     ⭐ UNE DALLE PAR (SECTION, PAGE), toutes posées côte à côte dans un défileur. Ce qui
     disparaît avec : le repeint complet à chaque changement de section — c'est lui qui
     coûtait, et c'est de lui que venaient les fantômes du 19/09. Tout est déjà posé ;
     changer de section ne reconstruit plus rien, ça glisse.
     ⛔ ET LE COMPTE DES DALLES N'EST PAS CELUI DES SECTIONS : une section qui déborde de
     douze en reçoit une seconde. C'est pour ça que le lien roue ↔ dalles ne peut pas être
     une simple multiplication (voir `surDalle`). */
  const dalles = options.dalles || [{ objets: options.objets || [] }];
  for (let d = 0; d < dalles.length; d += 1) {
    /* ⚖️ UNE PLAQUE, ⛔ PAS UN ESPACE VIDE — Eric, 2026-09-19, schéma à l'appui : sa
       *« zone mouvante »* est un objet GRIS qui traverse le champ visible, pas une case où
       des jetons se remplacent.
       🔴 C'EST LE DÉFAUT QUI M'A COÛTÉ LA SOIRÉE, ET IL TIENT EN UN MOT : mes dalles
       n'avaient PAS DE MATIÈRE. Transparentes, rien ne « part » et rien n'« arrive » — on
       voyait des jetons se substituer, jamais une plaque glisser. C'est pour ça qu'il a dit
       *« la dalle ne se détache pas »*, puis *« dalles identiquement délimitées »* : il
       demandait une PLAQUE, je répondais par un TRAIT dessiné sur la fenêtre.
       ⭐ ET ELLE PORTE LA CLASSE, ⛔ pas une copie de ses déclarations : `dalle-simple` est
       le voile des blocs intérieurs, et il reste son seul écrivain. Le cadre que j'avais
       tracé disparaît avec — ce qui délimite une plaque, c'est la plaque. */
    const dalle = el("div", "sac-dalle dalle-simple");
    dalle.dataset.snap = "oui";
    dalle.dataset.dalle = String(d);
    const objets = dalles[d].objets || [];
    const retenu = objets.find((o) => o && o.index === options.retenu) || null;
    for (let r = 0; r < RANGS_GRILLE; r += 1) {
      for (let c = 0; c < COLS_GRILLE; c += 1) {
        const o = objets[r * COLS_GRILLE + c] || null;
        dalle.append(case_(`case-${r + 1}-${c + 1}`, o && o === retenu ? null : o, options, piste));
      }
    }
    piste.append(dalle);
  }
  noeud.append(piste);

  /* ══ LE VERROU — Eric, 2026-09-19 : *« le swipe fait bouger les tuiles, LES DALLES
     SUIVENT »* ══════════════════════════════════════════════════════════════════
     ⭐ UNE SEULE SURFACE PORTE LE GESTE — la roue — et les dalles s'y accrochent. La
     position du ruban de dalles est une FONCTION du défilement de la roue, pas un second
     état qu'il faudrait tenir d'accord.
     🔴 J'AVAIS MIS LE MAÎTRE DE L'AUTRE CÔTÉ une heure plus tôt, sur la foi de sa réponse
     précédente (*« le glisser sur la grille change de section »*). Les deux phrases
     répondent à deux questions : l'une dit qu'on peut agir depuis la grille, l'autre dit
     qui COMMANDE. ⛔ C'est la seconde qui décide de l'architecture.
     ⛔ ET CE N'EST PAS UNE MULTIPLICATION : une section peut valoir deux dalles (sa page
     2), donc on cherche la PREMIÈRE dalle de chaque section et on interpole entre les
     deux voisines. Un rapport fixe dériverait dès la première section qui déborde. */
  /* 🔴 LA LARGEUR SE LIT UNE FOIS, ⛔ PAS À CHAQUE IMAGE — et ce n'est pas de l'avarice.
     `clientWidth` est une LECTURE DE MISE EN PAGE : tant que rien n'écrit dans la même
     image, elle est gratuite ; le jour où un voisin écrit, elle force un recalcul
     synchrone et le prix explose d'un coup, pendant un défilement. ⭐ La cote, elle, ne
     bouge pas : une dalle fait une largeur d'écran, et l'écran ne change pas de largeur
     au milieu d'un geste.
     📏 Mesuré : le verrou coûte 0,003 ms par image — il n'a aucune raison d'aller
     chercher une mesure qu'il connaît déjà. */
  let largeurCache = 0;
  const largeurDalle = () => (largeurCache || (largeurCache = piste.clientWidth || DALLE.l));

  /* 🔴 LA PLACE D'UNE DALLE SE LIT, ⛔ ELLE NE SE MULTIPLIE PAS — Eric, 19/09 : *« à
     l'arrêt on ne voit qu'une dalle »*.
     📏 CE QUE LA MULTIPLICATION COÛTAIT, MESURÉ À L'ÉCRAN : `clientWidth` rend **374** là
     où le plan dit 375 — le zoom de la maison arrondit vers le bas. Deux dalles plus loin,
     `374 × 2 = 748` au lieu de 750, et une lichette de **2 blg** de la dalle précédente
     traînait à gauche, À L'ARRÊT. ⛔ Et l'erreur GRANDIT avec le rang : au dixième cran
     elle vaudrait 10.
     ⭐ La mise en page connaît la réponse exacte : on la lui DEMANDE. C'est la loi du pas
     du belt, lu dans la mise en page et jamais recopié — *une cote DONNÉE bat une cote
     DÉDUITE*.
     📌 Le repli sur la multiplication reste pour les bancs : hors navigateur il n'y a pas
     de mise en page, et `offsetLeft` n'existe pas. */
  const xDeLaDalle = (k) => {
    const n = piste.children[Math.max(0, Math.min(piste.children.length - 1, k))];
    return (n && typeof n.offsetLeft === "number") ? n.offsetLeft : largeurDalle() * k;
  };
  /* ⭐ LA PREMIÈRE DALLE D'UNE SECTION — une LECTURE, ⛔ pas un calcul : c'est la dalle
     elle-même qui dit à quelle section elle appartient. */
  const premiereDalleDe = (section) => {
    const k = dalles.findIndex((d) => (d.section | 0) === section);
    return k < 0 ? 0 : k;
  };
  const dalleDuCran = (cran) => premiereDalleDe(Math.max(0, r.section(cran)));
  /* ⭐ ET SA RÉCIPROQUE : de quelle section parle la dalle `k` ? ⛔ Une LECTURE — c'est la
     dalle elle-même qui le dit, parce qu'une section peut en valoir deux. */
  const sectionDeLaDalle = (k) => {
    const d = dalles[Math.max(0, Math.min(dalles.length - 1, k))];
    return d ? (d.section | 0) : 0;
  };

  let enAttente = false;
  let enAttenteDalles = false;
  let repos = null;
  let derniereDalle = options.dalle | 0;

  /* ══ 🎚️ L'ARBITRE — un maître par geste, ⛔ jamais deux ═══════════════════════
     ⚖️ Eric, 2026-09-19 : *« si on n'est pas en mode drag le swipe fonctionne »* — donc
     les DEUX surfaces défilent au doigt, la roue et les dalles.
     🔴 ET DEUX DÉFILEURS VERROUILLÉS L'UN À L'AUTRE OSCILLENT : chacun lit l'autre et le
     corrige à l'image suivante, indéfiniment. ⛔ Ce n'est pas une question de réglage,
     c'est une boucle.
     ⭐ LA PARADE TIENT EN UN MOT : celui que le doigt a TOUCHÉ mène, et il n'écrit que
     dans l'autre. Le `pointerdown` le désigne, et rien d'autre ne le change — donc il n'y
     a jamais deux écrivains en même temps, par construction et pas par réglage. */
  /* 🔴 ET LE SUIVEUR N'AIMANTE PAS — sinon il ne peut pas suivre, et c'est MESURÉ.
     📏 Relevé à l'écran le 19/09, roue immobilisée à mi-chemin (97 = 65 × 1,5) : les dalles
     rendaient **383** au lieu de 563. Une aimantation `mandatory` REFUSE toute position
     intermédiaire — le navigateur la corrige à l'image suivante. Le suiveur sautait donc
     de cran en cran pendant que le meneur, lui, glissait.
     ⛔ ET MON BANC NE POUVAIT PAS LE VOIR : tous mes relevés tombaient sur des positions
     DÉJÀ alignées (65 × 3, 375 × 3), où l'aimantation ne corrige rien. Une mesure qui ne
     visite que les crans ne dit rien de l'entre-deux — c'est Eric qui l'a vu, à l'œil.
     ⭐ L'aimantation appartient donc au MENEUR, et elle se coupe chez l'autre. C'est
     l'idiome du belt (`data-couture`), à un mot près. */
  let maitre = "roue";
  const mener = (qui) => {
    maitre = qui;
    r.dataset.mene = qui === "roue" ? "oui" : "non";
    piste.dataset.mene = qui === "dalles" ? "oui" : "non";
  };
  mener("roue");
  r.addEventListener("pointerdown", () => mener("roue"), { passive: true });
  piste.addEventListener("pointerdown", () => mener("dalles"), { passive: true });

  const suivre = () => {
    enAttente = false;
    if (maitre !== "roue") return;
    const l = largeurDalle();
    if (!(l > 0)) return;
    const p = r.scrollLeft / ROUE.pas;          /* la position du ruban, en tuiles */
    const bas = Math.floor(p);
    const f = p - bas;
    /* ⭐ L'INTERPOLATION EST TOUT LE « EN MÊME TEMPS » : à mi-chemin entre deux tuiles, la
       dalle est à mi-chemin entre deux dalles. Sans elle, les dalles sauteraient d'un cran
       à l'autre pendant que le ruban, lui, glisserait. */
    const a = dalleDuCran(bas);
    const b = dalleDuCran(bas + 1);
    piste.scrollLeft = xDeLaDalle(a) + (xDeLaDalle(b) - xDeLaDalle(a)) * f;
    r.marquer(Math.round(p));
  };

  const arrete = () => {
    repos = null;
    /* 👻 ⛔ UNE ROUE QUI N'EST PLUS À L'ÉCRAN NE PARLE PAS. Un défileur détaché voit son
       `scrollLeft` retomber à zéro, cette retombée émet un `scroll`, et un minuteur
       survivant commettrait la première section — relevé le 19/09, deux fois. */
    if (r.isConnected === false) return;
    const k = dalleDuCran(Math.round(r.scrollLeft / ROUE.pas));
    if (k === derniereDalle || !dalles[k]) return;
    derniereDalle = k;
    if (options.surDalle) options.surDalle(k);
  };

  r.addEventListener("scroll", () => {
    if (!enAttente) {
      enAttente = true;
      (typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout)(suivre);
    }
    if (repos) clearTimeout(repos);
    repos = setTimeout(arrete, REPOS_MS);
  }, { passive: true });

  /* ⭐ ET LE CHEMIN INVERSE : quand c'est la DALLE qu'on pousse, c'est la roue qui suit.
     ⛔ Le même calcul lu à l'envers — on cherche la tuile de la dalle courante, et on
     interpole entre elle et sa voisine. Une seconde formule dériverait de la première. */
  const suivreLesTuiles = () => {
    enAttenteDalles = false;
    if (maitre !== "dalles") return;
    const l = largeurDalle();
    if (!(l > 0) || typeof r.placer !== "function") return;
    const p = piste.scrollLeft / l;
    const bas = Math.floor(p);
    const f = p - bas;
    const a = r.rang(sectionDeLaDalle(bas));
    const b = r.rang(sectionDeLaDalle(bas + 1));
    r.scrollLeft = ROUE.pas * (a + (b - a) * f);
    r.marquer(Math.round(a + (b - a) * f));
  };

  const arreteLesDalles = () => {
    repos = null;
    if (piste.isConnected === false || maitre !== "dalles") return;
    const k = Math.round(piste.scrollLeft / largeurDalle());
    if (k === derniereDalle || !dalles[k]) return;
    derniereDalle = k;
    if (options.surDalle) options.surDalle(k);
  };

  piste.addEventListener("scroll", () => {
    if (!enAttenteDalles) {
      enAttenteDalles = true;
      (typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout)(suivreLesTuiles);
    }
    if (repos) clearTimeout(repos);
    repos = setTimeout(maitre === "dalles" ? arreteLesDalles : arrete, REPOS_MS);
  }, { passive: true });

  /* ⭐ ET LES CHEVRONS POUSSENT LA ROUE D'UNE TUILE — du MÊME mouvement aimanté que le
     doigt. ⛔ Pas un saut : deux régimes sur une seule surface la rendent illisible. */
  piste.pousser = (sens) => {
    const x = (Math.round(r.scrollLeft / ROUE.pas) + sens) * ROUE.pas;
    if (typeof r.scrollTo === "function") r.scrollTo({ left: x, behavior: "smooth" });
    else r.scrollLeft = x;
  };

  /* ⛔ ON NE PEUT PAS POSER LE DÉFILEMENT SUR UN NŒUD DÉTACHÉ, et pas davantage attendre
     une image — voir `poserLesDalles`. Le placement se publie, et il ne se consomme que
     s'il se relit. ⭐ Poser la ROUE suffit : les dalles suivent par le même chemin que
     sous le doigt, donc il n'y a qu'un seul placement à écrire. */
  placementEnAttente = () => {
    const x = ROUE.pas * r.vise;
    if (typeof r.scrollTo === "function") r.scrollTo({ left: x, behavior: "auto" });
    else r.scrollLeft = x;
    const pris = Math.round(r.scrollLeft) === Math.round(x);
    if (pris) { piste.scrollLeft = xDeLaDalle(options.dalle | 0); r.marquer(r.vise); }
    return pris;
  };

  const objets = (dalles[options.dalle | 0] || dalles[0] || {}).objets || [];
  const retenu = objets.find((o) => o && o.index === options.retenu) || null;

  noeud.append(collecteur(options, retenu, piste));

  /* 🔴 LES TROIS ORGANES D'ÉCHANGE SONT DES IMAGES, ET J'AVAIS LIVRÉ TROIS
     RECTANGLES NUS — Eric, 18/09, en regardant l'écran en ligne : *« les images de
     la bourse, des Tally »*.
     ⭐ ELLES EXISTENT DÉJÀ, ET DEPUIS LE 16/09 : `--icone-bourse`,
     `--icone-parchemin` et `--icone-parchemin-party` sont trois `.webp` du dépôt,
     qu'Eric a lui-même déposées. ⛔ On ne les redessine pas, et on ne recopie pas
     leur habit : les trois boutons REPRENNENT `gear-bouton`, la classe de R, qui
     porte déjà l'image, l'opacité du tally vide (`--organe-eteint`) et l'encre
     fixe des astres. Une seconde famille (`.sac-echange`) était un habit recopié
     — et deux habits divergent au premier réglage.
     ⭐ C'est la quatrième fois que la doctrine d'organe s'applique dans ce lot,
     après l'interrupteur, les chevrons de Destiny et le jeton.
     📌 `data-compte` porte l'état du parchemin : à `"0"` il s'efface (Eric, 16/09 :
     le tally vide ne s'entoure pas, il RECULE). */
  const compteurs = options.compteurs || {};
  for (const { id, mot } of ORGANES_D_ECHANGE) {
    const b = bouton("gear-bouton", "", mot, () => options.surPorte && options.surPorte(id));
    b.dataset.organe = id;
    if (id !== "purse") b.dataset.compte = String(compteurs[id] || 0);
    /* ⚖️ ET LE GROUP TALLY SE MONTRE INERTE, il ne fait pas SEMBLANT — la loi du
       produit : *« une place réservée se montre inerte »*. ⛔ Il n'existe qu'EN JEU ;
       à la création la donnée ne le porte pas. Un bouton qui accepte le doigt et ne
       répond jamais apprend à ne plus toucher — c'est pire qu'un bouton éteint. */
    if (ORGANES_D_ECHANGE.find((o) => o.id === id).inerte) b.disabled = true;
    noeud.append(b);
  }
  /* ⛔ ET PAS DE BOUTON `party inventory` DANS CETTE RANGÉE — Eric l'a demandé le
     19/09 puis retiré dans la même heure : *« stop pour party inventory le bouton ;
     pour la SECTION faut le faire »*. ⭐ Et c'est cohérent avec sa propre définition —
     *« imagine le party inventory comme un autre backpack »* : on y entre par un CRAN
     de la roue, comme dans n'importe quelle autre section. Deux portes pour un seul
     lieu, c'est une porte de trop. */

  /* ⛔ PAS DE BOUTON `Drop` — Eric, 2026-09-19 : *« le bouton drop est inutile »*.
     ⚠️ ET LA SOURCE DU CHAPITRE LE PORTE, je le signale plutôt que de le taire : elle
     range `DROP` parmi les organes de B1 et le définit — *« sort l'objet du conteneur,
     sur place »*. ⭐ Mais l'écran a changé depuis : le `Send to` porte `Gear` parmi ses
     destinations, donc sortir un objet du sac se fait DÉJÀ, par le même geste que tout
     le reste. Un second bouton pour un verbe que le dropdown tient est un bouton de
     trop. ⏳ L'artefact est à mettre à jour. */

  const envoi = el("div", "sac-destination");
  envoi.dataset.organe = "send-vers";
  const s = el("select", "pipeline-dropdown");
  s.setAttribute("aria-label", "Send to");
  for (const d of options.destinations || []) {
    const opt = el("option", null, d.mot);
    opt.value = d.valeur;
    if (!d.actif) opt.disabled = true;
    if (d.valeur === options.destination) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener("change", () => options.surDestination && options.surDestination(s.value));
  envoi.append(s);
  noeud.append(envoi);

  /* ⚖️ LA BARRE DU BAS EST CELLE DE R, ORGANE COMPRIS — Eric, 18/09 : *« et ici on
     veut le livre et le ? »*, puis *« ce sont des petits boutons »*.
     ⛔ ET ELLE CORRIGE UNE NON-CONFORMITÉ DE MON PREMIER JET : mes portes faisaient
     105 × 40 (le gabarit MOYEN) quand celles de R font **77 × 44**, le PETIT. Trois
     portes du même chapitre, au même endroit, ne peuvent pas avoir deux tailles :
     un joueur qui passe de R au sac verrait la rangée bouger sous lui.
     ⭐ ELLES REPRENNENT `gear-porte`, LA CLASSE DE R — pas une copie de son habit :
     la même, donc les mêmes cotes et les mêmes teintes par construction. Le liseré
     dit le verbe (§6) : bleu on navigue, vert on agit — `Send` est le seul à porter
     une conséquence, et c'est la règle d'Eric du 16/09.
     ⏳ DETTE DE NOM, ET ELLE EST NOMMÉE : `gear-porte` dit encore l'écran qui l'a
     portée la première. Le jour où Wares la prendra — il est au programme — elle
     descendra dans un organe au nom neutre, comme l'interrupteur et le jeton. */
  /* ⭐ LA RANGÉE DU BAS EST UN ORGANE, comme sur R : elle porte `data-rangee`, et
     c'est LUI qui donne au livre et au `?` leur habit — il est déclaré pour un
     enfant direct d'une rangée. ⛔ Les poser à même la dalle les laissait nus :
     un disque blanc au lieu d'un livre.

     🔴 ET AUCUN DE SES ENFANTS NE PORTE `data-organe` — C'EST LA FAUTE QU'ERIC A
     VUE, ET ELLE ÉTAIT DÉJÀ ÉCRITE DANS `shell.css`. Eric, 18/09 : *« le livre et
     le ? qui sont mal centrés »*.
     ⛔ CE QUI SE PASSAIT : `.sac [data-organe]` pose `position: absolute`, j'avais
     donc écrit `.sac-rangee [data-organe] { position: static }` pour rendre les
     cinq boutons à la grille. Les deux bornes en font partie — et `shell.css:7017`
     dit en toutes lettres pourquoi c'est mortel : *« `relative`, JAMAIS `static` —
     et ça a coûté une livraison. Ces deux bornes portent leur cercle en `::before`
     ABSOLU. Passées en `static`, elles cessent d'être son bloc conteneur : le
     cercle va s'ancrer sur l'ancêtre positionné le plus proche et se dessine À CÔTÉ
     du glyphe. »*
     📏 MESURÉ AU NAVIGATEUR AVANT DE CORRIGER : le `::before` du livre rendait
     `left: 11px` dans une rangée de 367 — soit son cercle collé au bord GAUCHE de
     la rangée — et celui du `?` `left: 334px`, collé au bord DROIT. Les deux
     cercles étaient à ~300 blg de leur glyphe.
     ⛔ ET POURQUOI MA VÉRIFICATION D'HIER NE L'A PAS VU : j'ai mesuré les BOÎTES
     (44 × 44, colonnes 44 / 279 / 44) et conclu « identique à R ». Les boîtes
     étaient identiques ; c'est le DESSIN qui s'était décroché. La même feuille le
     dit, deux lignes plus bas : *« une mesure de POSITION ne voit pas un dessin qui
     se décroche »*.
     ⭐ LA PARADE EST DE TUER LA CAUSE, PAS DE POSER UNE EXCEPTION : R ne marque
     AUCUN enfant de sa rangée avec `data-organe` — ses portes portent `data-porte`,
     ses bornes ne portent rien. Le sac fait pareil, et la règle `.sac-rangee
     [data-organe]` disparaît de `shell.css` avec sa raison d'être. */
  const rangee = el("div", "sac-rangee");
  rangee.dataset.organe = "rangee";
  rangee.dataset.rangee = "sac";
  noeud.append(rangee);
  /* le livre — la classe de R, et sa cible FH WEB est une décision d'Eric : sans
     `livreDe`, il est GRISÉ, jamais muet (NORMES, « chaque conversion demande une
     CIBLE »). C'est exactement ce que fait `gear-ecran.mjs`. */
  const livre = bouton("fiche-livre", undefined, "Rules");
  if (options.livreDe && options.livreDe.href) {
    livre.addEventListener("click", () => { window.open(options.livreDe.href, "_blank", "noopener"); });
  } else {
    livre.disabled = true;
  }
  rangee.append(livre);
  /* 🔴 LES TROIS PORTES VIVENT DANS UN GROUPE, ET CE N'EST PAS UN ENVELOPPEUR DE
     CONFORT — la faute est déjà écrite dans R : la grille du pied a TROIS colonnes
     (borne | 1fr | borne), et c'est `.rangee-majeurs` qui occupe celle du milieu.
     ⛔ Sans lui, la première porte prend tout le `1fr` et les suivantes passent à
     la ligne : Eric l'avait vu sur deux appareils le 16/09. Je l'ai refait ici. */
  const majeurs = el("div", "rangee-majeurs");
  rangee.append(majeurs);
  for (const [id, mot] of [["gear", "Gear"], ["send", "Send"], ["wares", "Wares"]]) {
    const note = id === "send" ? "Send — clears the collector and sends" : mot;
    const b = bouton("bouton gear-porte", mot, note, () => options.surPorte && options.surPorte(id));
    b.dataset.porte = id;
    majeurs.append(b);
  }
  /* ⛔ LE `?` NE S'ÉCRIT PAS ICI, ET C'EST L'ARTEFACT DU CHAPITRE QUI LE DIT :
     *« `.tuto-point`, posé par la coquille, pas par l'écran — rien à écrire ici »*.
     ⭐ La coquille en pose UN par étape (`GUIDES.equipment` existe), le place dans
     la DERNIÈRE rangée (`poserLesBornes`) et lui donne son `data-vu` — l'attribut
     qui décide du parchemin plein ou du cercle creux (§7, 26/08). Le mien n'en
     avait pas : il rendait un cercle nu, et il aurait fait DOUBLON en production.
     ⛔ C'est aussi ce que fait R, qui ne pose que son livre.
     ⚠️ Conséquence assumée : au banc la rangée n'a pas de `?`, parce que le banc
     n'a pas de coquille. Un banc qui en fabriquerait un mentirait dans l'autre
     sens — il montrerait un organe que l'écran ne porte pas. */

  /* ⚖️ LA BOURSE EST UN POPUP, PAS UNE VUE — Eric, 16/09 : *« ça prend la place que ça
     doit, c'est un popup »*. ⛔ Elle ne passe donc pas par une vue : une vue
     remplacerait l'écran et écrirait la 3ᵉ ligne du belt ; un popup recouvre et
     n'écrit rien. ⭐ ET C'EST L'ORGANE DE R, importé — le sac n'a pas sa bourse à lui.
     📌 EN DERNIER DANS LE NŒUD, comme sur R : il recouvre, donc il vient après. */
  if (options.bourseOuverte) noeud.append(popupDeLaBourse(options));
  return { noeud };
}
