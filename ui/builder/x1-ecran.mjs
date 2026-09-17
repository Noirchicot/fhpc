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
import * as D from "./x1-disposition.mjs?v=651";
/* ⭐ LES DESTINATIONS SONT CELLES DE L'ÉCRAN R, PAS UNE SECONDE LISTE : le
   dropdown de X1 envoie là où le dropdown de R envoie, et le jour où une
   destination s'ouvre (Tally, Craft) les deux écrans l'apprennent ensemble.
   ⛔ `x1-disposition.mjs` porte SA propre liste, du croquis : elle documente le
   plan, elle ne pilote pas l'écran — un besoin satisfait deux fois est une
   occasion de diverger (NORMES §5). */
import { DESTINATIONS } from "./gear-ecran.mjs?v=651";
/* ⭐ L'INTERRUPTEUR DU MENU, PRIS TEL QUEL — il est descendu dans une feuille sans
   import (lot 213) pour que la fiche le prenne sans traîner `Layers` derrière elle. */
import { pisteDInterrupteur } from "./interrupteur-organe.mjs?v=651";

const { ORGANES, MOTS_ETAT, PARCHEMIN_DEBORD } = D;

/* ══ DU NOM DU PLAN À LA CLEF DU DÉPÔT ═════════════════════════════════════
   Même dispositif que `CLEF_DE` dans `gear-ecran.mjs` : le plan nomme en
   capitales, le dépôt en minuscules à tirets, et cette table est le SEUL
   endroit qui apparie les deux. ⚠️ `LOCKED` garde son nom de plan (l'organe)
   alors que son mot est « Lock » (l'acte) : le plan nomme l'ÉTAT, le bouton
   nomme le GESTE — c'est la distinction qu'Eric a posée le 17/09. */
export const CLEF_DE = Object.freeze({
  "QTE": "qte", "NOM": "nom", "PAGINATION": "pagination",
  "FILET HAUT": "filet-haut", "FILET BAS": "filet-bas",
  "PRECEDENT": "precedent", "SUIVANT": "suivant",
  "PRIX": "prix", "POIDS": "poids", "DESCRIPTION": "description",
  "IS": "is", "IS QUOI": "is-quoi", "COPIER": "copier",
  "EQUIP": "equip", "ATTUNE": "attune", "LOCKED": "lock",
  "EQUIP ON": "equip-on", "ATTUNE ON": "attune-on", "LOCKED ON": "lock-on",
  "SEND": "send", "SEND N": "send-n", "TO": "to", "SEND VERS": "send-vers",
  "BACK": "close", "USE": "use", "SEND !": "envoyer", "TRASH": "trash"
});

/* La clef de document que chaque interrupteur écrit. ⭐ Elle voyage avec
   l'organe : personne n'a à se rappeler que `lock-on` écrit `locked`. */
const ETAT_DE = Object.freeze({ "equip-on": "equipped", "attune-on": "attuned", "lock-on": "locked" });
/* ⚖️ RENVERSÉ LE 17/09 AU SOIR PAR ERIC : *« equip, attune = bouton on/off du menu,
   avec les variations de couleur que je t'ai données »*. ⭐ Les deux reprennent donc
   l'interrupteur de `Layers` — piste 36 × 20, pouce 16, ROUGE à gauche et VERT à
   droite — et la fiche cesse d'inventer un gabarit.
   ⛔ `lock` GARDE SON CORPS NOIR ET SON CADENAS : Eric l'a décrit ainsi le matin et
   ne l'a pas repris dans cette correction, qui ne nomme que les deux autres. ⏳ Un mot
   de lui et il rejoint les deux — c'est signalé dans le rapport, pas décidé ici. */
const SIGNE_DE = Object.freeze({ "equip-on": "plus", "attune-on": "coeur", "lock-on": "cadenas" });

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

/** Une flèche de feuilletage : le gabarit du livre et du `?` — dessin 22 dans
 *  une cible de 44 (NORMES §2, `paire-partout`). ⛔ Elle n'a pas l'habit de la
 *  famille à libellé : un bouton à GLYPHE n'a pas de mot à cadrer. */
function fleche(id, mot, note, surClic, eteint, absent) {
  const b = bouton("x1-fleche", mot, note, surClic);
  b.dataset.organe = id;
  if (eteint) b.disabled = true;
  /* ⚖️ UNE SEULE PAGE NE SE FEUILLETTE PAS — Eric, 17/09 : *« la pagination, s'il y a
     plusieurs pages »*, et une flèche sans page où aller dit la même chose qu'un
     « 1/1 ». ⛔ `hidden`, jamais un `display:none` en feuille (défaut n°3) : la PLACE
     reste, donc le nom ne se décale pas quand on feuillette un lieu à deux objets. */
  if (absent) b.hidden = true;
  return b;
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
function bascule(id, allume, options) {
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
  b.append(pisteDInterrupteur());
  if (options.surEtat) b.addEventListener("click", () => options.surEtat(clef, !allume));
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

/** Le champ du nombre à envoyer : une saisie, pas un bouton. Elle est bornée
 *  par la quantité possédée — ⛔ on n'envoie pas ce qu'on n'a pas. */
function champNombre(id, options) {
  const n = eld("input", "x1-saisie");
  n.dataset.organe = id;
  n.type = "number";
  n.min = "1";
  n.max = String(Math.max(1, options.objet && options.objet.qte || 1));
  n.value = String(options.nombre || 1);
  n.setAttribute("aria-label", "How many to send");
  n.addEventListener("change", () => { if (options.surNombre) options.surNombre(Number(n.value) || 1); });
  return n;
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
 *   · `rang` : `{ position, total }` — le feuilletage, dans le lieu courant
 *   · `nombre`, `destination` : l'envoi en cours
 *   · rappels : `surPrecedent` `surSuivant` `surEtat` `surNombre`
 *     `surDestination` `surPorte` `surCopier` */
export function construireLaFicheX1(options = {}) {
  const objet = options.objet || {};
  const rang = options.rang || {};
  const noeud = eld("section", "x1");
  noeud.dataset.objet = "x1";
  noeud.setAttribute("role", "group");
  noeud.setAttribute("aria-label", objet.nom ? `${objet.nom} — item sheet` : "Item sheet");

  const feuille = eld("style");
  feuille.setAttribute("data-fhpc", "x1");
  feuille.textContent = feuilleDesCotesX1();
  noeud.append(feuille);

  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    if (!id) continue;
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
    } else if (id === "pagination") {
      /* ⚖️ UNE PAGE = UN OBJET, et ⛔ la pagination ne paraît QUE s'il y a plusieurs
         pages — Eric, 17/09 au soir. Un « 1/1 » ne dit rien à personne. */
      const plusieurs = rang.total > 1;
      const mot = plusieurs ? `${rang.position}/${rang.total}` : "";
      noeud.append(voyant(id, "x1-pagination", mot, plusieurs ? `Item ${rang.position} of ${rang.total}` : undefined));
    } else if (id === "precedent") {
      noeud.append(fleche(id, "←", "Previous item", options.surPrecedent,
        !options.surPrecedent || rang.position <= 1, !(rang.total > 1)));
    } else if (id === "suivant") {
      noeud.append(fleche(id, "→", "Next item", options.surSuivant,
        !options.surSuivant || rang.position >= rang.total, !(rang.total > 1)));
    } else if (id === "prix") {
      noeud.append(voyant(id, "x1-chiffres", ligneDeChiffres(objet.prixUnite, objet.qte, objet.prixTotal), "Price"));
    } else if (id === "poids") {
      noeud.append(voyant(id, "x1-chiffres", ligneDePoids(objet.poidsUnite, objet.qte, objet.poidsTotal), "Weight"));
    } else if (id === "description") {
      const z = eld("div", "x1-description", objet.prose || "");
      z.dataset.organe = id;
      noeud.append(z);
    } else if (id === "is") {
      noeud.append(voyant(id, "x1-mot", o.mot));
    } else if (id === "is-quoi") {
      /* ⚖️ C'EST UN DROPDOWN — Eric, 17/09 au soir, en deux temps : la question (*« pas
         de dropdown, juste du texte ? »*), puis la réponse (*« is est un dropdown »*).
         ⭐ Il avait raison sur le FAIT — désarmé, le menu portait le voile des 20 % et
         disparaissait — et la réparation n'était pas d'en changer l'organe, mais de
         l'ARMER. Un menu qui s'ouvre se voit. */
      noeud.append(menuIs(id, options));
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
      noeud.append(bascule(id, Boolean(objet[ETAT_DE[id]]), options));
    } else if (id === "send" || id === "to") {
      noeud.append(voyant(id, "x1-mot", o.mot));
    } else if (id === "send-n") {
      noeud.append(champNombre(id, options));
    } else if (id === "send-vers") {
      noeud.append(menuDestination(id, options));
    } else if (id === "close") {
      noeud.append(porte(id, "Close", "Close this sheet", options));
    } else if (id === "use") {
      noeud.append(porte(id, o.mot, "Use — not wired yet", options, true));
    } else if (id === "envoyer") {
      noeud.append(porte(id, o.mot, "Send it", options));
    } else if (id === "trash") {
      noeud.append(porte(id, o.mot, "Throw it away", options));
    }
  }
  return { noeud };
}
