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
import * as D from "./x1-disposition.mjs?v=834";
/* ⭐ LES DESTINATIONS SONT CELLES DE L'ÉCRAN R, PAS UNE SECONDE LISTE : le
   dropdown de X1 envoie là où le dropdown de R envoie, et le jour où une
   destination s'ouvre (Tally, Craft) les deux écrans l'apprennent ensemble.
   ⛔ `x1-disposition.mjs` porte SA propre liste, du croquis : elle documente le
   plan, elle ne pilote pas l'écran — un besoin satisfait deux fois est une
   occasion de diverger (NORMES §5). */
import { DESTINATIONS } from "./gear-ecran.mjs?v=834";
/* ⭐ L'INTERRUPTEUR DU MENU, PRIS TEL QUEL — il est descendu dans une feuille sans
   import (lot 213) pour que la fiche le prenne sans traîner `Layers` derrière elle. */
import { pisteDInterrupteur } from "./interrupteur-organe.mjs?v=834";
/* ⭐ ET LA JAUGE DE DÉFILEMENT, du même tiroir : l'organe des fenêtres de prose de
   Destiny (03/09), descendu dans une feuille sans import. Eric a demandé ici la même
   chose dans les mêmes mots — *« des chevrons discrets dans la marge droite pour
   informer le lecteur »* — donc c'est le même organe, pas un second. */
import { veilleLeDebordement } from "./defilement-chevrons.mjs?v=834";
/* ⭐ LOT 219 — LE PARCHEMIN EST UN ORGANE À PART, ET RÉUTILISABLE : la fiche ne
   sait pas dessiner une feuille, elle sait qu'elle en porte une. Le jour où un
   second écran en veut une, il l'importe — ⛔ il ne la recopie pas. */

const { ORGANES, MOTS_ETAT, PARCHEMIN_DEBORD } = D;

/** 📏 CE QUE LA DÉCHIRURE A LE DROIT DE MORDRE — ⛔ UNE COTE DÉDUITE, PAS CHOISIE.
 *  On prend la plus courte distance entre un bord de la dalle et la boîte de
 *  DESSIN d'un organe : c'est le dessin qui peint, donc c'est lui qui doit rester
 *  sur le papier.
 *  📏 Mesuré sur la table du 21/09 : gauche **9,5** (COPIER) · droite **9,5**
 *  (JAUGE) · haut **20** (QTE) · bas **36** (BACK). Le minimum des quatre est
 *  donc **9,5**, et c'est lui qui commande.
 *  ⚖️ UN SEUL BUDGET POUR LES QUATRE CÔTÉS, ET C'EST UN CHOIX ARGUMENTÉ : le bas
 *  en offrirait 36, mais une déchirure quatre fois plus profonde en bas qu'aux
 *  côtés ne se lit pas comme une feuille — elle se lit comme une erreur. ⭐ Eric
 *  demande un fond *« assez uni »* ; l'asymétrie doit venir du BRUIT, pas d'un
 *  budget différent par arête. ⏳ Si Eric veut mordre plus fort en haut et en
 *  bas, le nombre est là et il se desserre par côté sans rien casser.
 *  ⛔ ET IL NE SE RECOPIE PAS : la table bouge, le budget suit. C'est la seule
 *  raison pour laquelle il est calculé et non écrit. */
export function budgetDuParchemin() {
  let budget = Infinity;
  for (const o of ORGANES) {
    budget = Math.min(budget, o.x, o.y,
      D.DALLE.l - (o.x + o.l), D.DALLE.h - (o.y + o.h));
  }
  return Math.max(0, budget);
}

/* ══ DU NOM DU PLAN À LA CLEF DU DÉPÔT ═════════════════════════════════════
   Même dispositif que `CLEF_DE` dans `gear-ecran.mjs` : le plan nomme en
   capitales, le dépôt en minuscules à tirets, et cette table est le SEUL
   endroit qui apparie les deux. ⚠️ `LOCKED` garde son nom de plan (l'organe)
   alors que son mot est « Lock » (l'acte) : le plan nomme l'ÉTAT, le bouton
   nomme le GESTE — c'est la distinction qu'Eric a posée le 17/09. */
export const CLEF_DE = Object.freeze({
  "QTE": "qte", "NOM": "nom", "RARETE": "rarete",
  "FILET HAUT": "filet-haut", "FILET BAS": "filet-bas", "JAUGE": "jauge", "OEIL": "oeil",
  "UNITE": "unite", "TOTAL": "total", "DESCRIPTION": "description",
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
/* ══ 🪜 LA COUTURE — LE SECOND FILET, ET CE QU'IL SÉPARE ═══════════
   ⚖️ Eric, 2026-09-21, en décrivant X2 : *« ligne du haut idem X1 · texte idem ·
   TOUT IDEM JUSQU'AU TRAIT BAS DU TEXTE. En dessous place les éléments comme dans
   mon croquis. »* ⭐ La couture a donc un NOM et une COTE, et les deux viennent de
   la table : c'est le pied de `FILET BAS`. ⛔ Elle ne s'écrit pas — le jour où le
   plan descend le filet, la tête descend avec lui.
   🔴 ET LE PARTAGE EST GÉOMÉTRIQUE, ⛔ PAS UNE LISTE DE NOMS. Une liste par nom
   est incomplète par construction : un organe ajouté au plan n'y entrerait jamais,
   et rien ne le dirait. Un organe est de la TÊTE si sa boîte — sa CIBLE quand il en
   a une, sinon son dessin — finit au-dessus de la couture. Le plan seul décide. */
export const BAS_DE_TETE = (() => {
  const filet = ORGANES.find((o) => o.nom === "FILET BAS");
  return filet.y + filet.h;
})();

/** ⭐ LES ORGANES QUE X1 ET X2 PARTAGENT — le titre, la quantité, la ligne du haut
 *  (prix · poids), les deux filets, le texte, sa jauge et les deux ornements.
 *  ⛔ Ils ne sont pas énumérés : ils sont DÉDUITS de la couture. */
export const ORGANES_DE_TETE = Object.freeze(
  ORGANES.filter((o) => { const b = o.cible || o; return b.y + b.h <= BAS_DE_TETE; })
);
/* ⛔ L'APPARTENANCE SE DIT PAR NOM, JAMAIS PAR IDENTITÉ D'OBJET — 📏 mesuré au lot
   242, et c'est un piège du dépôt, pas une précaution : `x1-disposition.mjs` et
   `x1-disposition.mjs?v=834` sont DEUX instances de module. Les mêmes organes y
   portent des références DIFFÉRENTES, donc un `includes(o)` rend `false` dès que
   l'appelant a importé la table sans la version — ce qu'un garde fait naturellement.
   ⭐ Le nom, lui, traverse les deux instances. */
const NOMS_DE_TETE = new Set(ORGANES_DE_TETE.map((o) => o.nom));
export const estDeLaTete = (o) => NOMS_DE_TETE.has(o.nom);

/** La boîte d'un organe, en CSS.
 *  ⛔ SÉLECTEUR DESCENDANT, JAMAIS `>` : la leçon de la bourse (16/09) — un enfant
 *  direct enferme une cote dans une STRUCTURE, et la structure bouge dès qu'un
 *  organe se loge dans un groupe. */
function regleDOrgane(nom, o) {
  const id = CLEF_DE[o.nom];
  if (!id) return null;
  const c = o.cible;
  const corps = c
    ? `left:${px(c.x)};top:${px(c.y)};width:${px(c.l)};height:${px(c.h)};` +
      `border-width:${px((c.h - o.h) / 2)} ${px((c.l - o.l) / 2)}`
    : `left:${px(o.x)};top:${px(o.y)};width:${px(o.l)};height:${px(o.h)}`;
  return `.${nom} [data-organe="${id}"]{${corps}}`;
}

/** ⚖️ LA FEUILLE DE LA TÊTE — celle que les DEUX fiches montent, chacune sous SON
 *  nom. 📌 `basDeLecture` est le haut de la rangée de pied de la fiche appelante :
 *  X1 tend celui de ses portes, X2 celui de ses trois boutons. ⛔ Aucun nombre neuf
 *  — le mode lecture se DÉDUIT, chez l'une comme chez l'autre. */
export function feuilleDesCotesDeTete(nom, basDeLecture) {
  const regles = [`.${nom}[data-objet="${nom}"]{flex:0 0 auto;height:${px(D.DALLE.h)}}`];
  for (const o of ORGANES_DE_TETE) {
    const r = regleDOrgane(nom, o);
    if (r) regles.push(r);
  }
  const filet = ORGANES.find((o) => o.nom === "FILET HAUT");
  const desc = ORGANES.find((o) => o.nom === "DESCRIPTION");
  const basL = basDeLecture - 8;
  const lire = (id, corps) => regles.push(`.${nom}[data-lecture="oui"] [data-organe="${id}"]{${corps}}`);
  lire("description", `height:${px(basL - filet.h - desc.y)}`);
  lire("filet-bas", `top:${px(basL - filet.h)}`);
  return regles.join("\n");
}

/** ⚖️ LA TÊTE, MONTÉE — ⛔ ET C'EST LE SEUL ENDROIT AU DÉPÔT QUI LA FABRIQUE.
 *  ⭐ `parchemin.mjs` le disait déjà en toutes lettres : *« la fiche ne sait pas
 *  dessiner une feuille, elle sait qu'elle en porte une. Le jour où un second écran
 *  en veut une, il l'importe — ⛔ il ne la recopie pas. »* Ce jour est le lot 242,
 *  et la phrase vaut pour TOUTE la tête, pas seulement pour la feuille : un organe
 *  que deux écrans fabriquent séparément finit toujours par diverger (NORMES §5, et
 *  l'incident du patron des boutons du 16/09). */
export function construireLaTeteDeFiche(noeud, objet, options) {
  /* ⚠️ LE PARCHEMIN EST MONTÉ AVANT D'ÊTRE AU DOCUMENT, et c'est voulu :
     `habilleEnParchemin` ne mesure rien tout de suite (`clientWidth` vaudrait 0), il
     attend la première mise en page puis suit la cote avec un `ResizeObserver`.
     ⭐ L'ORDRE EST LE DESSIN : tout est en absolu et sans `z-index`, donc le décor
     entre en PREMIER et passe dessous. */
  /* ⚖️ LOT 273 — PLUS DE PARCHEMIN : Eric, 25/09, *« passer tous les X en dalle 50 % est plus
     joli que le parchemin »*. La fiche est une DALLE, peinte par la feuille (`shell.css`, la
     règle de famille des fiches X) — ⛔ plus rien à monter ici. */
  for (const o of ORGANES_DE_TETE) {
    const id = CLEF_DE[o.nom];
    if (!id) continue;
    if (id === "nom") {
      /* ⭐ CENTRÉ SUR LA PAGE, PAS ENTRE SES VOISINS — Eric, 17/09 : *« le titre reste
         centré par rapport à la page »*. */
      noeud.append(voyant(id, "x1-nom", objet.nom || o.mot));
    } else if (id === "rarete") {
      /* ⚖️ LOT 279 — LA RARETÉ, EN SOUS-TITRE, EN ITALIQUE — Eric, 26/09 :
         « Dagger of Venom / Rare (italique) / 4,002 GP · 1 lb. ×2 8,004 gp · 2 lb ».
         ⛔ Rien quand l'objet n'en a pas (un objet mondain, un plan) : pas de tiret. */
      noeud.append(voyant(id, "x1-rarete", objet.rarete || ""));
    } else if (id === "qte") {
      /* 🔴 LA QUANTITÉ A QUITTÉ LA TÊTE (lot 255) — Eric, 23/09 : *« on dégage le X2
         en haut à gauche »*. ⭐ ELLE NE DISPARAÎT PAS, ELLE DESCEND : son croquis de
         la ligne de coût la met AU CENTRE, entre l'unitaire et le total. Et c'est le
         DOUBLON qui le justifiait — elle était dite deux fois, ici et dans « 15 gp ·
         ×2 · 30 gp » juste dessous. Deux écrivains d'un même fait.
         ⛔ Elle ne s'écrit toujours que si elle dit quelque chose : « ×1 » est du bruit. */
      noeud.append(voyant(id, "x1-chiffres x1-chiffres-qte", objet.qte > 1 ? `×${objet.qte}` : "",
        objet.qte > 1 ? `Quantity ${objet.qte}` : undefined));
    } else if (id === "filet-haut" || id === "filet-bas") {
      /* ⚖️ LES DEUX FILETS QUI DÉLIMITENT LE TEXTE — Eric, 17/09 au soir. Ils ne
         disent rien à un lecteur d'écran : c'est la zone qui porte le sens. */
      const f = eld("div", "x1-filet");
      f.dataset.organe = id;
      f.setAttribute("aria-hidden", "true");
      noeud.append(f);
    } else if (id === "unite") {
      /* ⚖️ « 2gp / 5lg (cadré gauche) » — le prix ET le poids d'UN exemplaire.
         ⚖️ LOT 279 — ET LA RARETÉ À CÔTÉ DU PRIX (Eric, 26/09 : « 4,002 GP · Rare »). */
      noeud.append(voyant(id, "x1-chiffres x1-chiffres-unite", texteDeLUnite(objet), "Each"));
    } else if (id === "total") {
      /* ⚖️ « 6gp / 15lg (cadré droite) » — ⛔ et rien quand il n'y en a qu'un : un
         total qui répète l'unité ne dit pas un total, il dit deux fois l'unité. */
      noeud.append(voyant(id, "x1-chiffres x1-chiffres-total",
        objet.qte > 1 ? cellule(objet.prixTotal, objet.poidsTotal) : "", "Total"));
    } else if (id === "description") {
      const z = eld("div", "x1-description");
      z.dataset.organe = id;
      remplirLaDescription(z, objet);
      noeud.append(z);
      /* ⭐ LA JAUGE VEILLE SUR CETTE ZONE, ⛔ posée À CÔTÉ d'elle, jamais dedans — un
         signe qui défile avec le texte qu'il annonce ne sert à rien. */
      const j = veilleLeDebordement(z);
      if (j) { j.dataset.organe = CLEF_DE["JAUGE"]; noeud.append(j); }
    } else if (id === "jauge") {
      /* posée par la branche de la description, juste au-dessus — elle a besoin d'elle */
    } else if (id === "oeil") {
      /* ⚖️ L'ŒIL EST LE MIROIR DE LA COPIE, et il porte son ÉTAT : allumé, il dit
         qu'on est en lecture, et c'est lui qui en sort. */
      const b = bouton("x1-oeil", "", options.lecture ? "Show the whole sheet" : "More room for the text",
        () => options.surLecture && options.surLecture(!options.lecture));
      b.dataset.organe = id;
      b.dataset.on = options.lecture ? "oui" : "non";
      noeud.append(b);
    } else if (id === "copier") {
      /* ⭐ UN BOUTON À GLYPHE, pas à mot : 40 × 40 dans la cible de 44. */
      const b = bouton("x1-copier", o.mot, "Copy this item", () => options.surCopier && options.surCopier());
      b.dataset.organe = id;
      noeud.append(b);
    }
  }
  return noeud;
}

/** ⚖️ QUI EST POSÉ PAR UNE TABLE D'ORGANES — ⛔ CE N'EST PAS LA FAMILLE DU
 *  PARCHEMIN, et le lot 248 l'a appris de la pire façon utile : les deux tenaient
 *  sous LE MÊME sélecteur `:is(.x1, .x2)`, et rien ne disait qu'il portait deux
 *  faits distincts. X0 a rejoint le parchemin — elle n'a aucun `[data-organe]`,
 *  parce qu'elle n'est pas posée en absolu mais en flux.
 *  🔴 Élargir la famille du parchemin avait donc élargi celle-ci PAR RICOCHET.
 *  ⭐ Le garde 5 de `x2-ecran.test.mjs` a attrapé exactement ça, et il ne l'a pu
 *  que parce qu'il nommait la règle qu'il cherchait. Deux faits, deux noms. */
export const FAMILLE_DES_FICHES = Object.freeze([".x1", ".x2"]);

/** ⚖️ QUI PARTAGE LA BOÎTE DE LA DALLE — la TROISIÈME famille de ce chantier, et
 *  elle se nomme pour la même raison que les deux autres : elle était écrite dans
 *  `shell.css` ET épinglée mot pour mot dans un garde. 🔴 Ajouter `.x0` au lot 254
 *  a fait rougir ce garde — non parce que le fait était faux, mais parce que
 *  DEUX ENDROITS le portaient. C'est la troisième fois en une nuit.
 *  ⭐ La feuille écrit la liste, le garde la LIT ici. Le prochain écran s'ajoute
 *  à cette ligne, et rien d'autre ne bouge. */
export const FAMILLE_DE_LA_DALLE = Object.freeze([".gear", ".x0", ".x1", ".x2", ".x5", ".sac", ".wares"]);
export const SELECTEUR_DE_LA_DALLE = FAMILLE_DE_LA_DALLE.join(", ");
export const SELECTEUR_DES_FICHES = `:is(${FAMILLE_DES_FICHES.join(", ")})`;

export function feuilleDesCotesX1() {
  const regles = [];
  /* ══ 📜 LOT 240 — LA FEUILLE TIENT LA COTE DE LA DALLE : 500, ET PAS LA SCÈNE ══
     Eric, 2026-09-21 : *« le parcho doit faire 500 »*.
     📏 CE QUI ÉTAIT MESURÉ, ET C'EST LUI QUI L'A VU : `.x1` partage la boîte des
     écrans d'équipement (`.gear, .x1, .sac, .wares`), qui est en `flex: 1 1 auto`
     — donc sa hauteur SUIVAIT la scène. Au banc 760 (scène 700), la fiche rendait
     **700**, le bas des portes tombait à **466**, et il restait **234 blg** de
     parchemin vide sous les boutons. ⛔ Ce n'était pas un défaut de dessin : la
     feuille était juste, c'est la BOÎTE qui mentait.
     ⭐ LA FICHE EST UN PLAN FIXE, ET C'EST TOUTE LA DIFFÉRENCE AVEC R : l'écran R
     remplit sa dalle, X1 est une TABLE GÉNÉRÉE de 375 × 500 dont chaque organe est
     posé en absolu. Une boîte élastique sous un plan fixe ne peut qu'ajouter du
     vide — elle n'a rien à donner à personne, puisque rien ne s'étire.
     ⛔ LA COTE NE SE RETAPE PAS — elle a déjà trois écrivains au dépôt (`sac-`,
     `wares-`, la table). Elle se LIT ici, `D.DALLE.h`, et le jour où le plan
     change la boîte suit sans qu'on rouvre ce fichier.
     ⭐ ET C'EST CETTE FEUILLE QUI LA PORTE, ⛔ PAS `shell.css` : la cote vient de
     la donnée, donc elle ne se recopie pas dans une feuille d'auteur (garde 7).
     ⚠️ LE SÉLECTEUR EST QUALIFIÉ (`[data-objet="x1"]`) POUR UNE RAISON MESURABLE :
     `.x1` seul a la même spécificité que la liste partagée de `shell.css`, et ne
     l'emporterait que par l'ORDRE — un ordre qui dépend de l'endroit où cette
     feuille est montée. Un blg de plus de spécificité ne dépend de rien.
     ⛔ ET `ResizeObserver` RESTE, il n'est pas remplacé par ce nombre : la cote
     donne le GABARIT en blg, le zoom change la taille RENDUE (loi
     `panneau-texte-fixe`, 20/09). Le parchemin observe le réel — ⛔ il ne suppose
     jamais 375 × 500 en dur. */
  /* ⭐ LA TÊTE VIENT DE L'ORGANE PARTAGÉ, ⛔ elle n'est plus écrite ici : X1 et X2
     montent la MÊME, chacune sous son nom (lot 242). Le bas de lecture de X1, c'est
     le haut de ses portes — une cote LUE dans la table, jamais retapée. */
  const porte = ORGANES.find((o) => o.nom === "BACK");
  regles.push(feuilleDesCotesDeTete("x1", porte.cible ? porte.cible.y : porte.y));
  /* — et ce qui reste : les trois rangées d'options et les quatre portes, SOUS la
     couture. ⛔ Elles n'appartiennent qu'à X1. */
  for (const o of ORGANES) {
    if (estDeLaTete(o)) continue;
    const r = regleDOrgane("x1", o);
    if (r) regles.push(r);
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
  /* ⛔ LA COPIE, L'ŒIL ET SES DEUX CHEVRONS NE SUIVENT PAS — Eric, 17/09 au soir :
     *« l'œil et le copy restent où ils sont »*. ⭐ Ils vivent dans les MARGES, pas dans
     la zone : trois repères fixes, qu'on retrouve au même endroit qu'on lise ou qu'on
     règle. Un organe qui se déplace à chaque mode demande qu'on le cherche. */
  /* 🔴 LOT 219 — LA RÈGLE DE `background-size` EST PARTIE AVEC L'IMAGE.
     Elle écrivait `.x1{background-size:100% 100%}` (ou `100% + 2×débord`) pour
     étirer `--x1-parchemin` aux cotes de la dalle. ⛔ Il n'y a plus d'image à
     étirer : le contour est un SVG calculé à la cote réelle par `parchemin.mjs`.
     Laisser la règle aurait été un écrivain qui commande un organe mort.
     ⭐ `PARCHEMIN_DEBORD` RESTE DANS LA TABLE, ET ON N'Y TOUCHE PAS : c'est une
     cote GÉNÉRÉE (`X1_gen.py`), et `tests/x1-ecran.test.mjs` garde 1 vérifie
     qu'elle est égale à celle du plan. ⛔ Une valeur générée ne se retire pas
     depuis le dépôt — elle se retire en amont, si Eric le décide. Elle vaut 0
     aujourd'hui, donc elle ne commande rien. */
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
/** ⚖️ UNE CELLULE DE LA LIGNE DE COÛT — lot 255, Eric 23/09 :
 *     « 2gp / 5lg (cadré gauche) · X3 (centre) · 6gp / 15lg (cadré droite) »
 *  🔴 ET DEUX FABRIQUES SONT DEVENUES UNE. Avant, `ligneDeChiffres` et
 *  `ligneDePoids` construisaient chacune une PHRASE de trois moments (unité,
 *  quantité, total), et elles ne les construisaient pas pareil — le prix
 *  répétait la quantité, le poids la taisait, avec un commentaire pour
 *  expliquer l'écart. ⭐ Maintenant chaque COLONNE porte un moment, et le prix
 *  et le poids voyagent ensemble : ce sont les deux façons de peser une même
 *  ligne du sac. Il ne reste donc qu'une forme de cellule, et plus d'écart à
 *  justifier. */
function cellule(...morceaux) {
  return morceaux.filter(Boolean).join(" · ") || "—";
}

/* ══ LOT 279 — LES DEUX TEXTES DE LA TÊTE QUE X2 REPEINT AU FEUILLETAGE ═════════
   ⛔ Un seul écrivain chacun : la tête les pose, X2 les repeint PAR ELLES quand la page
   change. 🔴 Avant, X2 écrivait `textContent` sur la description — ce qui aurait effacé
   la note — et sur des organes `prix` et `poids` que la tête ne fabrique pas. */
/** « 4,002 GP · 1 lb. » — le prix et le poids d'UN exemplaire.
 *  ⚖️ LOT 279 — la rareté n'y est PAS : à côté du prix, elle chevauchait le « ×2 » (105 blg
 *  dans une case de 65) ; Eric l'a mise en sous-titre sous le nom (« le prix unitaire reste »). */
export function texteDeLUnite(objet) {
  return cellule(objet && objet.prixUnite, objet && objet.poidsUnite);
}
/** Le texte de l'objet, puis sa NOTE DE CRAFT en pied, en italique — Eric, 26/09 : « tous
 *  les objets magiques […] devront avoir une référence au prix du craft · une petite note
 *  en pied de page en italique ». ⭐ Dans la zone qui défile : elle se lit APRÈS la
 *  description, ⛔ elle ne prend la place d'aucun organe. */
export function remplirLaDescription(z, objet) {
  z.textContent = (objet && objet.prose) || "";
  if (objet && objet.noteCraft) z.append(eld("p", "x1-note-craft", objet.noteCraft));
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
 *     prose, equipped, attuned, locked, harmonisable, rarete, noteCraft }` — les deux
 *     derniers (lot 279) : la rareté à côté du prix, la note de craft en pied du texte.
 *   · `horsCase` (lot 292) : la raison pour laquelle `Equip` s'éteint — aucune case du
 *     Gear ne convient à l'objet ; `null` quand il en a une
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

  /* ⚖️ LE PARCHEMIN EST POSÉ ICI, ET EN PREMIER — lot 219.
     ⭐ L'ORDRE EST LE DESSIN : tous les organes sont en `position: absolute` et
     sans `z-index`, donc ils peignent dans l'ordre du DOM. Le décor entre avant
     eux, il passe dessous, et ⛔ personne n'a besoin d'un `z-index` — celui qu'on
     aurait posé ici aurait créé un contexte d'empilement à franchir.
     ⛔ ET IL N'INTERCEPTE RIEN : `aria-hidden` et `pointer-events: none` (la
     feuille). Le contenu reste au-dessus, tapable et lisible par un lecteur
     d'écran — la fiche ne gagne pas un nœud de plus à annoncer.
     ⚠️ IL EST MONTÉ AVANT D'ÊTRE AU DOCUMENT, et c'est voulu : `habilleEnParchemin`
     ne mesure rien tout de suite (`clientWidth` vaudrait 0), il attend la première
     mise en page puis suit la cote avec un `ResizeObserver`. */
  construireLaTeteDeFiche(noeud, objet, options);

  /* — et SOUS la couture, ce qui n'est qu'à X1. */
  for (const o of ORGANES) {
    if (estDeLaTete(o)) continue;
    const id = CLEF_DE[o.nom];
    if (!id) continue;
    if (id === "is") {
      noeud.append(voyant(id, "x1-mot", o.mot));
    } else if (id === "is-quoi") {
      /* ⚖️ C'EST UN DROPDOWN — Eric, 17/09 au soir, en deux temps : la question (*« pas
         de dropdown, juste du texte ? »*), puis la réponse (*« is est un dropdown »*).
         ⭐ Il avait raison sur le FAIT — désarmé, le menu portait le voile des 20 % et
         disparaissait — et la réparation n'était pas d'en changer l'organe, mais de
         l'ARMER. Un menu qui s'ouvre se voit. */
      noeud.append(menuIs(id, options));
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
      /* ⚖️ LOT 270 — L'APERÇU D'UN OBJET PAS ENCORE CRAFTÉ : Eric, 25/09 : « options de lock,
         attune, wear grisées ». ⭐ Grisées et parlantes — l'objet n'est pas encore à toi. */
      /* ⚖️ LOT 292 — ET SANS AUCUNE CASE POSSIBLE, `equip` S'ÉTEINT AUSSI — Eric, 26/09 :
         « seul un item sur les cases valide du gear, peuvent porter le symbole équipé ».
         ⭐ Même modèle que le verrou et le plafond : grisé ET parlant. La raison vient de
         l'étape (`options.horsCase`), qui seule connaît le slot de l'objet. Un objet qui A
         une case mais n'y est pas garde l'interrupteur : l'étape la lui cherche.
         ⛔ Elle passe AVANT le verrou : ôter le verrou ne l'équiperait pas. */
      const horsCase = id === "equip-on" && typeof options.horsCase === "string" && options.horsCase
        ? options.horsCase : null;
      noeud.append(options.apercu
        ? bascule(id, false, options, true, "Not yours yet — send it from the blueprint first")
        : bascule(id, Boolean(objet[ETAT_DE[id]]), options,
          (id === "equip-on" && objet.locked === true) || plafond || Boolean(horsCase),
          horsCase || (plafond ? `${PLAFOND_HARMONISATION} items are already attuned — the SRD cap` : null)));
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
  /* ⚖️ LOT 270 — EN APERÇU, « UNIQUEMENT UN BACK » (Eric, 25/09) : la porte qui ferme reste,
     les trois états se grisent (plus haut), et tout le reste se RETIRE — ranger, envoyer,
     utiliser, jeter, copier, lire. ⛔ `hidden`, jamais `display:none` (défaut n°3 du dépôt).
     ⭐ Le mot reste `Close` : `Back` est EXCLUSIF à la coquille (garde 17 de shell-wiring). */
  if (options.apercu) {
    noeud.dataset.apercu = "oui";
    for (const e of [...noeud.children]) {
      const id = e.dataset ? e.dataset.organe : null;
      if (id && ["is", "is-quoi", "send", "send-n", "to", "send-vers", "use", "envoyer", "trash",
                 "oeil", "copier"].includes(id)) e.hidden = true;
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
