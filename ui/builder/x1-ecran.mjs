/* ══ X1 — LA FICHE D'UN OBJET POSSÉDÉ — lot 213 ═══════════════════════════════
   Le tap (ou le clic droit) sur un jeton porté de l'écran R ouvre CETTE fiche.
   Elle recouvre toute la dalle, 375 × 500 sous le belt, et rien d'autre.

   ⚖️ LA LOI DU RANG X — Eric, 16/09 : *« les x ne s'inscrivent pas dans le
   belt »*. Une fiche d'objet n'écrit JAMAIS `state.fenetre` : la troisième
   ligne du belt continue de dire le lieu d'où l'on vient (« Gear »). ⛔ X1
   n'entre donc pas dans `FENETRE_DE` (`equipment-step.mjs`), et c'est le seul
   endroit où cette absence se décide — une vue qui s'y ajouterait écrirait le
   belt sans qu'on l'ait voulu.

   ⛔ AUCUNE COTE ICI NI DANS `shell.css`. Chaque organe est posé par une
   feuille CONSTRUITE (`feuilleDesCotesX1`) depuis la table générée
   `x1-disposition.mjs` — sortie de `Plan-ecran-X1/X1_gen.py`, copiée telle
   quelle, jamais retapée. C'est le patron de `gear-ecran.mjs` (lot 212), qui
   est lui-même celui de `fonds.mjs` : une valeur qui vient de la donnée ne se
   recopie pas dans une feuille d'auteur (garde 7 de `ui-jetons.test.mjs` :
   ⛔ aucun style en ligne dans `ui/`, `setProperty` compris).

   ⚖️ CE QUE LE MOT DES PORTES DOIT AU DÉPÔT — le croquis d'Eric (17/09) écrit
   « back · use · send · trash ». ⛔ Mais `Back` est EXCLUSIF à la coquille
   (`tests/shell-wiring.test.mjs` garde 17 : le mot n'existe qu'une fois dans
   tout `ui/`, et c'est `shell.mjs` qui l'écrit ; un écran qui le pose ouvre un
   SECOND chemin de retour, ce que la loi I.5 interdit). ⭐ Le mot ratifié par
   Eric le 07/09 pour une fenêtre qui FERME sans rien défaire est `Close` —
   *« un libellé nomme ce que son bouton FAIT ; celui-ci ferme, il ne recule
   d'aucun écran »*. C'est donc `Close` qui est posé ici, et la question est
   rendue à Eric dans le rapport : un mot de lui et il change.

   ⏳ CE QUE CE LOT NE CÂBLE PAS, ET LE DIT :
     · `Use` — *« une baguette de boule de feu, ça fait une boule de feu »*
       (Eric, 17/09) : au bout du chemin on injecte un ordre dans un VTT.
       Chantier à part. Le bouton est POSÉ et DÉSARMÉ, il ne ment pas.
     · `is` — le menu existe, sa SOURCE n'est pas tranchée (propriété que la
       règle donne, ou choix du joueur ?). Posé, désarmé, pour la même raison.
     · la corbeille détruit la ligne : ⏳ Eric n'a pas tranché entre détruire et
       poser au sol (les deux emplacements GROUND de l'écran R). Le popup de
       confirmation est là parce que le geste est irréversible. */
import * as D from "./x1-disposition.mjs?v=673";
/* ⭐ LES DESTINATIONS SONT CELLES DE L'ÉCRAN R, PAS UNE SECONDE LISTE : le
   dropdown de X1 envoie là où le dropdown de R envoie, et le jour où une
   destination s'ouvre (Tally, Craft) les deux écrans l'apprennent ensemble.
   ⛔ `x1-disposition.mjs` porte SA propre liste, du croquis : elle documente le
   plan, elle ne pilote pas l'écran — un besoin satisfait deux fois est une
   occasion de diverger (NORMES §5). */
import { DESTINATIONS } from "./gear-ecran.mjs?v=673";
/* ⭐ L'INTERRUPTEUR DU MENU, PRIS TEL QUEL — il est descendu dans une feuille sans
   import (lot 213) pour que la fiche le prenne sans traîner `Layers` derrière elle. */
import { pisteDInterrupteur } from "./interrupteur-organe.mjs?v=673";
/* ⭐ ET LA JAUGE DE DÉFILEMENT, du même tiroir : l'organe des fenêtres de prose de
   Destiny (03/09), descendu dans une feuille sans import. Eric a demandé ici la même
   chose dans les mêmes mots — *« des chevrons discrets dans la marge droite pour
   informer le lecteur »* — donc c'est le même organe, pas un second. */
import { veilleLeDebordement } from "./defilement-chevrons.mjs?v=673";

const { ORGANES, MOTS_ETAT, PARCHEMIN_DEBORD } = D;

/* ══ DU NOM DU PLAN À LA CLEF DU DÉPÔT ═════════════════════════════════════
   Même dispositif que `CLEF_DE` dans `gear-ecran.mjs` : le plan nomme en
   capitales, le dépôt en minuscules à tirets, et cette table est le SEUL
   endroit qui apparie les deux. ⚠️ `LOCKED` garde son nom de plan (l'organe)
   alors que son mot est « Lock » (l'acte) : le plan nomme l'ÉTAT, le bouton
   nomme le GESTE — c'est la distinction qu'Eric a posée le 17/09. */
export const CLEF_DE = Object.freeze({
  "QTE": "qte", "NOM": "nom",
  "FILET HAUT": "filet-haut", "FILET BAS": "filet-bas", "JAUGE": "jauge", "OEIL": "oeil",
  "PRIX": "prix", "POIDS": "poids", "DESCRIPTION": "description",
  "IS": "is", "IS QUOI": "is-quoi", "COPIER": "copier",
  "EQUIP": "equip", "ATTUNE": "attune", "LOCKED": "lock",
  "EQUIP ON": "equip-on", "ATTUNE ON": "attune-on", "LOCKED ON": "lock-on",
  "SEND": "send", "SEND N": "send-n", "TO": "to", "SEND VERS": "send-vers",
  "BACK": "close", "USE": "use", "SEND !": "envoyer", "TRASH": "trash"
});

/** ⚖️ LE PLAFOND D'HARMONISATION DU SRD — Eric, 2026-09-18 : *« a creature can be
 *  attuned to a maximum of 3 magic items at once ; attempting to attune to a 4th
 *  has no effect until one is unattuned »*.
 *  ⛔ ET C'EST LA SEULE PART DE L'HARMONISATION QUE CET ÉCRAN MODÉLISE. Le SRD en
 *  dit bien plus — un repos court d'une heure, des prérequis par objet (*« by a
 *  Wizard »*), la rupture au bout de 24 heures loin de l'objet, la fin quand une
 *  autre créature s'harmonise. ⭐ Tout cela se passe EN JEU, pas à la création :
 *  un créateur de personnage ne fait pas passer le temps. Ce qu'il doit tenir,
 *  c'est le BUDGET — on ne sort pas de la création avec quatre objets harmonisés,
 *  comme on n'en sort pas avec sept compétences. */
export const PLAFOND_HARMONISATION = 3;

/* La clef de document que chaque interrupteur écrit. ⭐ Elle voyage avec
   l'organe : personne n'a à se rappeler que `lock-on` écrit `locked`. */
const ETAT_DE = Object.freeze({ "equip-on": "equipped", "attune-on": "attuned", "lock-on": "locked" });
/* ⚖️ RENVERSÉ LE 17/09 AU SOIR PAR ERIC : *« equip, attune = bouton on/off du menu,
   avec les variations de couleur que je t'ai données »*. ⭐ Les trois reprennent donc
   l'interrupteur de `Layers` — piste 36 × 20, pouce 16 — et la fiche cesse d'inventer
   un gabarit.
   ⚖️ ET LE 18/09, LES SIGNES DEVIENNENT CEUX DE LA TUILE — Eric : *« pour éviter les
   confusions, equip idem que token : cercle noir, centre rond transparent »* · *« attune,
   pas un cœur, un rond violet »* · *« lock, un cadenas »*.
   ⛔ LE `+` ET LE ♥ SONT MORTS. Un même état se disait de deux façons sur deux écrans :
   la tuile montrait un anneau, la fiche un `+` ; la tuile un rond violet, la fiche un
   cœur. ⭐ Un joueur qui apprend qu'un rond violet veut dire « harmonisé » ne doit pas
   l'apprendre deux fois. Le cadenas, lui, ne bougeait pas — il était déjà commun. */
const SIGNE_DE = Object.freeze({ "equip-on": "anneau", "attune-on": "disque", "lock-on": "cadenas" });

const px = (v) => `${Math.round(v * 100) / 100}px`;

/** La feuille qui pose chaque organe à sa place du plan. Exportée pour le
 *  garde, qui la relit contre la table.
 *  · un organe SANS cible reçoit sa boîte telle quelle — on le lit, on ne le
 *    tape pas, et le plancher `--touch` ne s'y applique pas ;
 *  · un organe À CIBLE reçoit la boîte de sa CIBLE, et son dessin en creux :
 *    la face se peint dans le `padding-box`, les bords transparents portent
 *    l'écart cible − dessin (« dessin et cible sont DEUX cotes », NORMES §0). */
export function feuilleDesCotesX1() {
  const regles = [];
  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    if (!id) continue;
    const c = o.cible;
    const corps = c
      ? `left:${px(c.x)};top:${px(c.y)};width:${px(c.l)};height:${px(c.h)};` +
        `border-width:${px((c.h - o.h) / 2)} ${px((c.l - o.l) / 2)}`
      : `left:${px(o.x)};top:${px(o.y)};width:${px(o.l)};height:${px(o.h)}`;
    /* ⛔ SÉLECTEUR DESCENDANT, JAMAIS `>` : la leçon de la bourse (16/09) — un
       enfant direct enferme une cote dans une STRUCTURE, et la structure bouge
       dès qu'un organe se loge dans un groupe. */
    regles.push(`.x1 [data-organe="${id}"]{${corps}}`);
  }
  /* ⚖️ LE PARCHEMIN TIENT DANS LA DALLE — Eric, 17/09 au soir, en regardant le
     rendu : *« redimensionne ton parchemin pour qu'il corresponde à la cote, pas
     qu'il soit coupé en bas »*, *« et donc qu'on voie les déchirures en bas »*.
     ⛔ CE QUE LE DÉBORD FAISAIT : il poussait les bords hors de la dalle, donc il
     EFFAÇAIT la déchirure — qui est le sujet. C'est le CONTENU qui s'écarte des
     bords (la marge de 20 du texte), pas l'image qui grandit.
     ⭐ Le débord reste une cote de la table : à 0 elle rend `100% 100%`, et le jour
     où il revaut autre chose, la feuille suit sans qu'on la rouvre. */
  /* ══ LE MODE LECTURE — Eric, 17/09 au soir : *« ce symbole permet de cacher tout ce
     qui est au-dessus des boutons pour laisser plus de place au texte »*, puis, précis :
     *« la barre inf de texte descend jusqu'à 8 blg au-dessus des boutons et cache les
     options »* et *« tu laisses la partie supérieure, titre etc., tranquille »*.
     ⭐ CE QUI BOUGE EST DONC LE BAS, ET LUI SEUL : le nom, la quantité, la pagination,
     le prix et le poids restent où ils sont ; ce sont les trois rangées d'OPTIONS qui se
     retirent, et le texte descend prendre leur place.
     ⛔ Pas un second plan : le même, dont on retire des organes. Les cotes de lecture se
     DÉDUISENT de la table (le pied des portes, la hauteur du filet) — aucun nombre neuf. */
  const porte = ORGANES.find((o) => o.nom === "BACK");
  const filet = ORGANES.find((o) => o.nom === "FILET HAUT");
  const desc = ORGANES.find((o) => o.nom === "DESCRIPTION");
  const basL = (porte.cible ? porte.cible.y : porte.y) - 8;
  const lire = (id, corps) => regles.push(`.x1[data-lecture="oui"] [data-organe="${id}"]{${corps}}`);
  lire("description", `height:${px(basL - filet.h - desc.y)}`);
  lire("filet-bas", `top:${px(basL - filet.h)}`);

  /* ⛔ LA COPIE, L'ŒIL ET SES DEUX CHEVRONS NE SUIVENT PAS — Eric, 17/09 au soir :
     *« l'œil et le copy restent où ils sont »*. ⭐ Ils vivent dans les MARGES, pas dans
     la zone : trois repères fixes, qu'on retrouve au même endroit qu'on lise ou qu'on
     règle. Un organe qui se déplace à chaque mode demande qu'on le cherche. */
  const deux = 2 * PARCHEMIN_DEBORD;
  regles.push(deux
    ? `.x1{background-size:calc(100% + ${px(deux)}) calc(100% + ${px(deux)})}`
    : ".x1{background-size:100% 100%}");
  return regles.join("\n");
}

function eld(balise, classe, texte) {
  const n = document.createElement(balise);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}
function bouton(classe, texte, note, surClic) {
  const b = eld("button", classe, texte);
  b.type = "button";
  if (note) b.setAttribute("aria-label", note);
  if (surClic) b.addEventListener("click", surClic);
  return b;
}

/** Le mot d'une ligne de chiffres : « 15 gp · ×2 · 30 gp ». ⭐ Les points
 *  médians viennent du croquis d'Eric, et la quantité ne s'écrit que si elle
 *  dit quelque chose — « ×1 » est du bruit. */
function ligneDeChiffres(unite, qte, total) {
  const bouts = [unite || "—"];
  if (qte > 1) bouts.push(`×${qte}`, total || "");
  return bouts.filter(Boolean).join(" · ");
}
/** Le POIDS ne répète pas la quantité : « 3 lb · 6 lb » (le croquis d'Eric).
 *  ⭐ Elle est déjà dite une ligne plus haut, et la boîte du plan est taillée sur
 *  ce mot-là — 43,73 à T1/600 dans 44. L'y remettre la fait déborder, mesuré. */
function ligneDePoids(unite, qte, total) {
  if (!unite) return "—";
  return qte > 1 && total ? `${unite} · ${total}` : unite;
}

/* ══ LES ORGANES ══════════════════════════════════════════════════════════ */

function voyant(id, classe, texte, note) {
  const n = eld("span", classe, texte);
  n.dataset.organe = id;
  if (note) n.setAttribute("aria-label", note);
  return n;
}

/** Le petit carré d'un état : son titre, et SOUS lui le mot de l'état, en
 *  oxblood, qui n'apparaît que s'il est vrai — Eric, 17/09 : *« Equip /
 *  Equipped (apparaît en oxblood quand c'est le cas) »*, puis *« tout se passe
 *  dans le petit carré, pas en dessous »*.
 *  ⛔ LE MOT N'EST PAS UNE LÉGENDE : trois états éteints ne donnent aucune
 *  ligne. C'est une PHRASE D'ÉTAT, elle ne dit que ce qui est. */
function carreDEtat(id, o, allume) {
  const boite = eld("div", "x1-etat");
  boite.dataset.organe = id;
  boite.append(eld("span", "x1-etat-titre", o.mot));
  /* ⛔ `hidden`, jamais un `display:none` en feuille (défaut n°3 du dépôt) : la
     place du mot reste, donc le titre ne saute pas quand l'état s'allume. */
  const mot = eld("span", "x1-etat-mot", o.sous || "");
  if (!allume) mot.hidden = true;
  boite.append(mot);
  return boite;
}

/** Un interrupteur : ⛔ CE N'EST PAS UN DESSIN DE LA FICHE, c'est CELUI DU MENU.
 *  La fiche pose la CIBLE de 44 du plan et y centre `pisteDInterrupteur()` —
 *  l'organe de `Layers`, pris tel quel (Eric, 17/09 au soir : *« bouton du menu,
 *  la base de laquelle tu dois partir ! »*).
 *  ⚖️ `role="switch"` ET PAS `aria-pressed` — la loi de l'organe : un interrupteur
 *  est un état vrai ou faux, pas un bouton qu'on enfonce. C'est `data-on` que la
 *  feuille lit, et il est posé ici comme il l'est là-bas. */
function bascule(id, allume, options, eteint, pourquoi) {
  const b = eld("button", "x1-bascule");
  b.type = "button";
  b.dataset.organe = id;
  b.setAttribute("role", "switch");
  b.setAttribute("aria-checked", String(Boolean(allume)));
  b.dataset.on = String(Boolean(allume));
  const signe = SIGNE_DE[id];
  if (signe) b.dataset.signe = signe;
  const clef = ETAT_DE[id];
  b.setAttribute("aria-label", MOTS_ETAT[clef] || clef);
  /* ⛔ ÉTEINT PAR LE VERROU, ET IL LE DIT — un contrôle désarmé sans raison est
     une panne pour qui le regarde. Le titre porte la raison ET le remède. */
  if (eteint) { b.disabled = true; b.title = pourquoi || "Locked — turn Lock off first"; }
  b.append(pisteDInterrupteur());
  if (!eteint && options.surEtat) b.addEventListener("click", () => options.surEtat(clef, !allume));
  return b;
}

/** Le menu `is` — où l'objet se range dans la fiche de personnage.
 *  ⏳ SA LISTE EST CELLE DU CROQUIS, portée par la table générée ; ⛔ sa SOURCE — une
 *  propriété que la règle donne, ou un choix du joueur ? — n'est pas tranchée. Le lot
 *  l'écrit donc comme un choix (`gear[N].is`), qui est ce qu'un menu FAIT, et la
 *  question reste au rapport. */
function menuIs(id, options) {
  const boite = eld("div", "x1-destination");
  boite.dataset.organe = id;
  const s = eld("select", "pipeline-dropdown x1-select");
  s.setAttribute("aria-label", "Is — where this item sits on the character sheet");
  for (const mot of D.EST) {
    const opt = eld("option", null, mot);
    opt.value = mot;
    if (mot === options.est) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener("change", () => { if (options.surEst) options.surEst(s.value); });
  boite.append(s);
  return boite;
}

/** Le menu d'une destination — même organe que sur l'écran R : une boîte qui
 *  porte le mot « destination » (on n'écrit rien DANS un `<select>`) et le
 *  select natif, qui garde son rôle et son clavier. */
function menuDestination(id, options) {
  /* ⛔ PAS DE MOT « destination » AU-DESSUS — Eric, 17/09 au soir : *« pas besoin de
     destination au-dessus de backpack »*. ⭐ Sur l'écran R le mot sert : le menu y est
     seul, sans phrase autour. Ici il est DANS une phrase — « Send 1 to Backpack » —
     et la phrase dit déjà ce que le menu choisit. Le même organe, deux contextes, et
     c'est le contexte qui décide. */
  const boite = eld("div", "x1-destination");
  boite.dataset.organe = id;
  const s = eld("select", "pipeline-dropdown x1-select");
  s.setAttribute("aria-label", "Send to");
  for (const d of DESTINATIONS) {
    const opt = eld("option", null, d.mot);
    opt.value = d.valeur;
    if (!d.actif) opt.disabled = true;
    if (d.valeur === options.destination) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener("change", () => { if (options.surDestination) options.surDestination(s.value); });
  boite.append(s);
  return boite;
}

/** Le champ du nombre à envoyer : ⚖️ **« 1/2 », et le 1 est modifiable** — Eric,
 *  17/09 au soir. ⭐ CE QUE LE DÉNOMINATEUR APPORTE : on ne tape pas un nombre dans le
 *  vide, on prélève sur un STOCK qu'on a sous les yeux. Le champ dit à la fois ce
 *  qu'on envoie et ce qu'on a — et il dit donc aussi, sans un mot, pourquoi 3 est
 *  refusé quand on en possède 2.
 *  ⛔ UN `<input type="number">` NE PEUT PAS CONTENIR « /2 » : le nombre est la saisie,
 *  le reste est un voyant à côté de lui, dans la même boîte. Le lecteur d'écran, lui,
 *  entend la phrase entière par l'étiquette. */
function champNombre(id, options) {
  const qte = Math.max(1, (options.objet && options.objet.qte) || 1);
  const boite = eld("div", "x1-saisie");
  boite.dataset.organe = id;
  const n = eld("input", "x1-saisie-nombre");
  n.type = "number";
  n.min = "1";
  n.max = String(qte);
  n.value = String(options.nombre || 1);
  n.setAttribute("aria-label", `How many to send, out of ${qte}`);
  n.addEventListener("change", () => { if (options.surNombre) options.surNombre(Number(n.value) || 1); });
  const sur = eld("span", "x1-saisie-sur", `/${qte}`);
  sur.setAttribute("aria-hidden", "true");   /* l'étiquette du champ le dit déjà */
  boite.append(n, sur);
  return boite;
}

/** Une porte : le gabarit PETIT de la famille (77 × 40 dans 44), et son liseré
 *  dit son verbe — bleu on navigue, vert on agit, rouge on défait (NORMES §6,
 *  et Eric le 16/09 sur la rangée de R : *« Send a un liseré vert, les autres
 *  sont juste de la navigation »*). ⛔ La teinte ne s'écrit pas ici : la feuille
 *  la déduit de `data-porte`. */
function porte(id, mot, note, options, eteint) {
  const b = bouton("x1-porte", mot, note, () => options.surPorte && options.surPorte(id));
  b.dataset.organe = id;
  b.dataset.porte = id;
  if (eteint) b.disabled = true;
  return b;
}

/* ══ LA FICHE ═════════════════════════════════════════════════════════════ */

/** @param {object} options
 *   · `objet` : `{ index, nom, qte, prixUnite, prixTotal, poidsUnite, poidsTotal,
 *     prose, equipped, attuned, locked, harmonisable }`
 *   · `nombre`, `destination` : l'envoi en cours
 *   · rappels : `surEtat` `surNombre` `surEst` `surDestination` `surPorte` `surCopier` */
export function construireLaFicheX1(options = {}) {
  const objet = options.objet || {};
  const noeud = eld("section", "x1");
  noeud.dataset.objet = "x1";
  noeud.setAttribute("role", "group");
  noeud.setAttribute("aria-label", objet.nom ? `${objet.nom} — item sheet` : "Item sheet");
  /* ⚖️ LE MODE LECTURE SE DIT SUR LA FICHE, et la feuille en tire les cotes : un seul
     attribut, et tout ce qui doit se retirer se retire (⛔ `hidden`, jamais
     `display:none` — défaut n°3 du dépôt). */
  if (options.lecture) noeud.dataset.lecture = "oui";

  const feuille = eld("style");
  feuille.setAttribute("data-fhpc", "x1");
  feuille.textContent = feuilleDesCotesX1();
  noeud.append(feuille);

  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    if (!id) continue;
    /* ⛔ CE QUE LA LECTURE RETIRE : tout sauf le texte, ses deux filets, sa jauge, les
       deux glyphes de sa marge et les quatre portes. Les organes restent POSÉS — leur
       place attend leur retour. */
    if (id === "nom") {
      /* ⭐ CENTRÉ SUR LA PAGE, PAS ENTRE SES VOISINS — Eric, 17/09 : *« le titre reste
         centré par rapport à la page »*. Sa boîte est posée par la table, au centre de
         la dalle : ce qui l'entoure peut grandir, le nom ne bouge pas. */
      noeud.append(voyant(id, "x1-nom", objet.nom || o.mot));
    } else if (id === "qte") {
      /* ⚖️ LA QUANTITÉ À GAUCHE DU TITRE — Eric, 17/09 au soir. ⛔ Et elle ne s'écrit
         que si elle dit quelque chose : « ×1 » est du bruit, la place reste vide. */
      noeud.append(voyant(id, "x1-qte", objet.qte > 1 ? `×${objet.qte}` : "",
        objet.qte > 1 ? `Quantity ${objet.qte}` : undefined));
    } else if (id === "filet-haut" || id === "filet-bas") {
      /* ⚖️ LES DEUX FILETS QUI DÉLIMITENT LE TEXTE — Eric, 17/09 au soir : *« délimite
         la zone descriptive du texte par des traits, comme l'image donnée »*. Ils ne
         disent rien à un lecteur d'écran : c'est la zone qui porte le sens. */
      const f = eld("div", "x1-filet");
      f.dataset.organe = id;
      f.setAttribute("aria-hidden", "true");
      noeud.append(f);
    } else if (id === "prix") {
      noeud.append(voyant(id, "x1-chiffres", ligneDeChiffres(objet.prixUnite, objet.qte, objet.prixTotal), "Price"));
    } else if (id === "poids") {
      noeud.append(voyant(id, "x1-chiffres", ligneDePoids(objet.poidsUnite, objet.qte, objet.poidsTotal), "Weight"));
    } else if (id === "description") {
      const z = eld("div", "x1-description", objet.prose || "");
      z.dataset.organe = id;
      noeud.append(z);
      /* ⭐ LA JAUGE VEILLE SUR CETTE ZONE : elle lit son débordement et allume ses
         chevrons. ⛔ Elle est posée À CÔTÉ d'elle, jamais dedans — un signe qui défile
         avec le texte qu'il annonce ne sert à rien.
         ⚠️ Et elle est posée ICI, dans la boucle, parce qu'elle a besoin du nœud du
         texte : la table la déclare (`JAUGE`), l'écran la branche. */
      const j = veilleLeDebordement(z);
      if (j) { j.dataset.organe = CLEF_DE["JAUGE"]; noeud.append(j); }
    } else if (id === "jauge") {
      /* posée par la branche de la description, juste au-dessus — elle a besoin d'elle */
    } else if (id === "is") {
      noeud.append(voyant(id, "x1-mot", o.mot));
    } else if (id === "is-quoi") {
      /* ⚖️ C'EST UN DROPDOWN — Eric, 17/09 au soir, en deux temps : la question (*« pas
         de dropdown, juste du texte ? »*), puis la réponse (*« is est un dropdown »*).
         ⭐ Il avait raison sur le FAIT — désarmé, le menu portait le voile des 20 % et
         disparaissait — et la réparation n'était pas d'en changer l'organe, mais de
         l'ARMER. Un menu qui s'ouvre se voit. */
      noeud.append(menuIs(id, options));
    } else if (id === "oeil") {
      /* ⚖️ L'ŒIL EST LE MIROIR DE LA COPIE — même dessin de 20, même cible calée contre
         le bord, même pied de zone, l'autre marge. ⭐ Et il porte son ÉTAT : allumé, il
         dit qu'on est en lecture, et c'est lui qui en sort. */
      const b = bouton("x1-oeil", "", options.lecture ? "Show the whole sheet" : "More room for the text",
        () => options.surLecture && options.surLecture(!options.lecture));
      b.dataset.organe = id;
      b.dataset.on = options.lecture ? "oui" : "non";
      noeud.append(b);
    } else if (id === "copier") {
      /* ⭐ UN BOUTON À GLYPHE, pas à mot : 40 × 40 dans la cible de 44, et il ne
         porte ni l'habit de la famille ni son liseré de rôle (la loi des `+`/`−`
         de la bourse). Sa teinte est l'oxblood — Eric, 17/09 : *« on est sur un
         fond plein, oxblood passe »*. */
      const b = bouton("x1-copier", o.mot, "Copy this item", () => options.surCopier && options.surCopier());
      b.dataset.organe = id;
      noeud.append(b);
    } else if (id === "equip" || id === "attune" || id === "lock") {
      const clef = id === "equip" ? "equipped" : id === "attune" ? "attuned" : "locked";
      noeud.append(carreDEtat(id, o, Boolean(objet[clef])));
    } else if (id === "equip-on" || id === "attune-on" || id === "lock-on") {
      /* ⚖️ LE VERROU DÉSARME `equip`, ET LUI SEUL — Eric, 18/09 : *« l'item reste
         collé à son collecteur, ne bouge pas »*. ⭐ Porter ou dévêtir DÉPLACE
         (l'état suit le lieu, `moveGearLine`) : c'est donc un mouvement, et le
         verrou l'interdit. ⛔ `attune` n'est pas concerné — harmoniser ne déplace
         rien ; et `lock` encore moins, sinon on ne pourrait plus l'ouvrir. */
      /* ⛔ ET LA QUATRIÈME HARMONISATION NE SE PROPOSE PAS : trois sont posées,
         celle-ci ne l'est pas, l'interrupteur s'éteint et dit le plafond. ⭐ Un
         objet DÉJÀ harmonisé garde le sien — sinon on ne pourrait plus en défaire
         un, et le plafond deviendrait un piège au lieu d'un budget. */
      const plafond = id === "attune-on" && objet.attuned !== true
        && Number(options.harmonises) >= PLAFOND_HARMONISATION;
      noeud.append(bascule(id, Boolean(objet[ETAT_DE[id]]), options,
        (id === "equip-on" && objet.locked === true) || plafond,
        plafond ? `${PLAFOND_HARMONISATION} items are already attuned — the SRD cap` : null));
    } else if (id === "send" || id === "to") {
      noeud.append(voyant(id, "x1-mot", o.mot));
    } else if (id === "send-n") {
      noeud.append(champNombre(id, options));
    } else if (id === "send-vers") {
      noeud.append(menuDestination(id, options));
    } else if (id === "close") {
      noeud.append(porte(id, "Close", "Close this sheet", options));
    } else if (id === "use") {
      /* ⚖️ `Use` RESTE, ET IL RESTE DÉSARMÉ — Eric, 18/09 : *« le use va varier d'un
         objet à l'autre ; il ne sert à rien en création. Il sera très utile pour
         utiliser un anneau d'invisibilité, une baguette de boule de feu, etc. Laisse
         le bouton qu'on oublie pas de le traiter quand c'est utile. »*
         ⭐ IL N'EST DONC PAS UN BOUTON MORT, C'EST UN RENDEZ-VOUS : sa place est
         tenue au pied de la fiche pour le miroir « Équipement en jeu ». ⛔ Et sa note
         le DIT au joueur — *« not wired yet »* laissait croire à une panne, alors que
         rien ne manque : ce geste n'appartient pas à la création.
         ⛔ ET LE VERROU NE L'ÉTEINT JAMAIS : verrouiller empêche de DÉPLACER, pas
         d'utiliser (Eric, 18/09 : *« surtout l'utiliser »*). */
      noeud.append(porte(id, o.mot, "Use happens in play, not while building", options, true));
    } else if (id === "envoyer") {
      noeud.append(objet.locked === true
        ? porte(id, o.mot, "Locked — turn Lock off first", options, true)
        : porte(id, o.mot, "Send it", options));
    } else if (id === "trash") {
      /* ⛔ *« ne peut être vendu, ni détruit tant qu'il est locked »* (Eric, 18/09) :
         la corbeille s'éteint avant le popup rouge, pas après. ⭐ Un geste qu'on
         DOIT refuser ne se laisse pas commencer — la coquille refuse encore
         derrière, mais elle ne devrait jamais avoir à le faire depuis cet écran. */
      noeud.append(objet.locked === true
        ? porte(id, o.mot, "Locked — turn Lock off first", options, true)
        : porte(id, o.mot, "Throw it away", options));
    }
  }
  if (options.lecture) {
    for (const e of [...noeud.children]) {
      const id = e.dataset ? e.dataset.organe : null;
      /* ⛔ LES OPTIONS, ET ELLES SEULES : les trois rangées qui vivent sous le texte.
         La tête reste tranquille (Eric, 17/09 au soir), et les quatre portes aussi. */
      if (id && ["is", "is-quoi", "equip", "attune", "lock", "equip-on", "attune-on",
                 "lock-on", "send", "send-n", "to", "send-vers"].includes(id)) e.hidden = true;
    }
  }
  return { noeud };
}
