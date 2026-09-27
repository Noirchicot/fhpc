/* ══ 🪟 LE DOUBLE ÉCRAN DE L'ÉTAPE EQUIPMENT — lot 307, 2026-09-27 ══════════════════
   ⚖️ Eric, 26/09, mot pour mot : *« Si on est en double screen le drop du token dans un
   collecteur de la page voisine. Génère un popup. Varie en fonction »*.
   ⚖️ « sur quel écran ? » → *« c »* : iPad en paysage ET ordinateur.
   ⚖️ « quelles pages ? » → *« gear, equipment, x3, x4 »* ; « Equipment, c'est quel écran ? »
   → *« c »*, toute l'étape (Gear + Backpack + Wares) ; *« x4 c'est group tally, liste
   d'objets achetés par le groupe »*.
   ⚖️ L'exception du Tally (27/09) : *« L'exception le Tally, quand l'item est transféré dans
   un Tally, il est crafté mais le paiement s'il est requis est différé au Tally. Cela doit
   apparaître dans le popup »*, puis *« Le group et le part tally »*.

   ⭐ CE FICHIER EST L'ORGANE UNIQUE DE TROIS QUESTIONS, ET D'AUCUNE AUTRE :
     1. QUAND est-on en double écran de pages (`regimeDeLaVue`) ;
     2. QUELLE page va à gauche, laquelle à droite (`coteDesPages`) ;
     3. QUEL popup ouvre un dépôt dans la page voisine (`popupDuDepotVoisin`).
   ⛔ Il ne sait ni PEINDRE, ni ÉCRIRE au document : la coquille monte les deux panneaux,
   l'étape exécute ses propres gestes. Il répond, les autres font — c'est ce qui le rend
   éprouvable sans navigateur.

   ⚠️ LA LARGEUR N'EST PAS DÉCIDÉE ICI, ET C'EST VOULU : elle l'est déjà, par la porte du
   double affichage (`laPlaceDuDouble`, echelle.mjs, lot 120) — deux colonnes de 375 plus la
   gouttière de la maison (`--sp-8`), soit **758 × 560** à l'échelle 1. Une seconde porte
   pour la même place serait un second écrivain : ce fichier REÇOIT sa réponse (`place`). */

import { createLabels, EN_DEPOT_VOISIN } from "../../src/labels.mjs?v=848";

const t = createLabels(EN_DEPOT_VOISIN);

/** L'étape qui s'ouvre en deux pages quand la place existe — ⚖️ Eric : toute l'étape
 *  Equipment (Gear + Backpack + Wares, et leurs fiches X). */
export const ETAPE_EN_DEUX_PAGES = "equipment";

/** ⚖️ LA PAGE QUI REÇOIT — Gear, le corps du personnage, À DROITE (proposition de
 *  l'architecte du 27/09, non contredite par Eric, à lui montrer). */
export const PAGE_DU_CORPS = "gear";
/** Et quand la page active EST Gear, sa voisine de gauche est le sac. */
export const VOISINE_DU_CORPS = "sac";

/** 🔴 QUAND — la seule réponse de la maison.
 *  @param {{ place: boolean, voulue: boolean, etape: string }} o
 *    · `place`  — la fenêtre porte deux colonnes (`laPlaceDuDouble`) ;
 *    · `voulue` — le joueur a allumé `Double view` (le réglage du lot 120) ;
 *    · `etape`  — l'id du cran actif.
 *  @returns {{ double: boolean, pages: boolean }}
 *    · `double` — l'app pose deux panneaux ;
 *    · `pages`  — ces deux panneaux sont deux PAGES de l'étape, pas deux étapes.
 *  ⭐ SOUS LA PLACE, RIEN : ni réglage ni étape ne rouvrent un second panneau qui ne tient
 *  pas — l'iPhone garde exactement l'écran d'aujourd'hui.
 *  ⚖️ AU-DESSUS, l'étape Equipment s'ouvre en deux pages SANS attendre le réglage : c'est la
 *  réponse « c » d'Eric (iPad couché ET ordinateur), et sa *« proposition de passage en
 *  affichage double d'office »* (NORMES, `panneau-deux-bornes-cran-tablettes`). Les autres
 *  étapes gardent la loi du lot 120 : deux panneaux seulement si le joueur les a demandés. */
export function regimeDeLaVue({ place, voulue, etape } = {}) {
  if (place !== true) return { double: false, pages: false };
  const pages = etape === ETAPE_EN_DEUX_PAGES;
  return { double: voulue === true || pages, pages };
}

/** 🔴 OÙ — la page active et sa voisine, chacune avec son côté.
 *  @param {string} vue la vue courante de l'étape (`vueEquipement`)
 *  @returns {{ gauche: string, droite: string, active: "gauche"|"droite" }}
 *  ⭐ La page d'où l'on PREND est à gauche ; Gear, qui REÇOIT, à droite. Une fiche X
 *  (X1, X2, X5), Wares, le Tally, le sac : toutes à gauche, face au corps. */
export function coteDesPages(vue) {
  if (!vue || vue === PAGE_DU_CORPS) return { gauche: VOISINE_DU_CORPS, droite: PAGE_DU_CORPS, active: "droite" };
  return { gauche: vue, droite: PAGE_DU_CORPS, active: "gauche" };
}

/** Les vues de l'étape qui SONT un Tally — ⚖️ Eric, 27/09 : *« Le group et le part
 *  tally »*. `b2` est le Tally de Wares (le panier), `sb32` celui de Gear (la liste
 *  d'envoi). ⏳ Le Group/Party Tally (X4) n'a aucune vue : il n'est pas dans la liste. */
export const VUES_TALLY = Object.freeze(["b2", "sb32"]);

/** Le genre de la page qui reçoit : `"tally"` ou `"corps"`. Lu sur la moitié d'écran de la
 *  cible (`data-vue-equipement`), jamais deviné d'après le créneau. */
export function genreDeLaCible(vue) {
  return VUES_TALLY.includes(vue) ? "tally" : "corps";
}

/** ⭐ LE TALLY PORTE-T-IL UN OBJET CRAFTÉ ? — mesuré le 27/09, pas supposé : une ligne
 *  `cart[N]` ne porte que `ref`, `quantity` et `gratuit` (`currentCartLines`,
 *  equipement-pipeline.mjs), et `Buy` du Tally pose des lignes SANS recette. Un objet de X5
 *  (bonus, pouvoirs, variante, sort) y perdrait tout ce qui le fait crafté, et un coût
 *  différé n'a nulle part où s'écrire. ⛔ Donc NON, et le cas reste désactivé
 *  (`popupDuDepotVoisin` rend `null`) — la consigne d'Eric est écrite, pas inventée. Le garde
 *  `double-ecran.test.mjs` relit les champs du panier : le jour où il porte une recette, il
 *  rougit et demande qu'on rallume ce cas. */
export const LE_TALLY_PORTE_UN_OBJET_CRAFTE = false;

/** Un montant LU, dit comme l'écran d'où il vient le dit : `2,001 GP`, `5 SP`.
 *  ⛔ Il ne recalcule rien : il reçoit les pièces que le geste débitera
 *  (`{ pp, gp, sp, cp }`) et les écrit, dans l'ordre des dénominations. */
export function motDuMontant(cout) {
  if (!cout) return "";
  const morceaux = ["pp", "gp", "sp", "cp"].filter((k) => cout[k])
    .map((k) => `${Number(cout[k]).toLocaleString("en-US")} ${k.toUpperCase()}`);
  return morceaux.length ? morceaux.join(" ") : "0 GP";
}

/** 🔴 QUEL POPUP — la seule fonction qui choisit le texte et les boutons.
 *  @param {object} o
 *   · `quoi`     — `"craft"` (un jeton de X5) ou `"achat"` (un jeton de Wares) ;
 *   · `statut`   — pour X5 : `"Crafting"`, `"Found"` ou `"Buying"` ;
 *   · `cible`    — `"corps"` (Gear) ou `"tally"` (un Tally) ;
 *   · `montant`  — les pièces que le geste débite, LUES (le Total de X5, le prix de Wares) ;
 *   · `accepter` — le geste EXISTANT (Craft & Send, l'achat, mettre au panier) ;
 *   · `annuler`  — fermer sans rien écrire.
 *  @returns {object|null} l'action `popup` de la coquille, ou `null` quand le cas est
 *  désactivé (un objet crafté vers un Tally, voir `LE_TALLY_PORTE_UN_OBJET_CRAFTE`).
 *  ⭐ Le popup EXIGE une réponse (`popup-question-exige-une-reponse`) : un dépôt est une
 *  intention, il ne se referme pas d'un clic à côté. Il est AIGUILLEUR — il prévient de ce
 *  qui va se passer (`popup-trois-roles-trois-couleurs`). */
export function popupDuDepotVoisin({ quoi, statut, cible, montant, accepter, annuler } = {}) {
  const m = motDuMontant(montant);
  const bouton = (id, faire) => ({ mot: t(`depot-voisin.bouton.${id}`), faire });
  const annulerB = bouton("cancel", annuler);
  let texte = null;
  let actions = null;
  if (quoi === "craft") {
    if (cible === "tally" && !LE_TALLY_PORTE_UN_OBJET_CRAFTE) return null;
    if (statut === "Found") {
      texte = t(cible === "tally" ? "depot-voisin.trouve-au-tally" : "depot-voisin.trouve");
      actions = [bouton("ok", accepter)];
    } else if (statut === "Buying") {
      /* ⚠️ Le statut `Buying` de X5 n'a pas de texte ratifié : c'est un ACHAT, il prend
         donc celui de l'achat — dit au rapport du lot 307, à confirmer par Eric. */
      texte = t(cible === "tally" ? "depot-voisin.achat-au-tally" : "depot-voisin.achat", { montant: m });
      actions = [bouton(cible === "tally" ? "add" : "buy", accepter), annulerB];
    } else {
      texte = t(cible === "tally" ? "depot-voisin.craft-au-tally" : "depot-voisin.craft", { montant: m });
      actions = [bouton(cible === "tally" ? "craft" : "craft-pay", accepter), annulerB];
    }
  } else if (quoi === "achat") {
    texte = t(cible === "tally" ? "depot-voisin.achat-au-tally" : "depot-voisin.achat", { montant: m });
    actions = [bouton(cible === "tally" ? "add" : "buy", accepter), annulerB];
  } else {
    return null;
  }
  return { kind: "popup", role: "aiguilleur", titre: null, texte, exigeUneReponse: true, actions };
}

/** Le mot d'un refus du dépôt (un objet sans prix connu). */
export const MOT_SANS_PRIX = t("depot-voisin.sans-prix");
