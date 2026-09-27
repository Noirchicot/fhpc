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
     2. QUELLE page va à gauche, laquelle à droite (`pagesDuDoubleEcran`), et la LUNE qui le commande ;
     3. QUEL popup ouvre un dépôt dans la page voisine (`popupDuDepotVoisin`).
   ⛔ Il ne sait ni PEINDRE, ni ÉCRIRE au document : la coquille monte les deux panneaux,
   l'étape exécute ses propres gestes. Il répond, les autres font — c'est ce qui le rend
   éprouvable sans navigateur.

   ⚠️ LA LARGEUR N'EST PAS DÉCIDÉE ICI, ET C'EST VOULU : elle l'est déjà, par la porte du
   double affichage (`laPlaceDuDouble`, echelle.mjs, lot 120) — deux colonnes de 375 plus la
   gouttière de la maison (`--sp-8`), soit **758 × 560** à l'échelle 1. Une seconde porte
   pour la même place serait un second écrivain : ce fichier REÇOIT sa réponse (`place`). */

import { createLabels, EN_DEPOT_VOISIN, EN_LUNE } from "../../src/labels.mjs?v=848";

const t = createLabels(EN_DEPOT_VOISIN, EN_LUNE);

/** L'étape qui s'ouvre en deux pages quand la place existe — ⚖️ Eric : toute l'étape
 *  Equipment (Gear + Backpack + Wares, et leurs fiches X). */
export const ETAPE_EN_DEUX_PAGES = "equipment";

/** Gear, le corps du personnage — la voisine par défaut de toute page qui n'est pas lui.
 *  🔄 27/09 : il n'est plus « toujours à droite » — le croquis d'Eric pose À GAUCHE l'écran que
 *  la lune a choisi (`pagesDuDoubleEcran`). */
export const PAGE_DU_CORPS = "gear";
/** Et quand la page active EST Gear, sa voisine de gauche est le sac. */
export const VOISINE_DU_CORPS = "sac";

/** 🔴 QUAND — la seule réponse de la maison.
 *  @param {{ place: boolean, voulue: boolean, etape: string }} o
 *    · `place`  — la fenêtre porte deux colonnes (`laPlaceDuDouble`) ;
 *    · `voulue` — le joueur l'a COMMANDÉ : la lune, ou l'interrupteur `Double view` du Menu
 *      (une seule préférence, `vueDoubleVoulue`, lot 120) ;
 *    · `etape`  — l'id du cran actif.
 *  @returns {{ double: boolean, pages: boolean }}
 *    · `double` — l'app pose deux panneaux ;
 *    · `pages`  — ces deux panneaux sont deux PAGES de l'étape, pas deux étapes.
 *  ⛔ PLUS D'OUVERTURE D'OFFICE — Eric, 27/09, devant les captures : *« Une commande pour ouvrir
 *  le double écran »*. Le lot 307 l'ouvrait dès que la place existait ; c'est retiré. Sans
 *  commande, un écran ; sans la place, un écran quoi qu'on ait commandé. */
export function regimeDeLaVue({ place, voulue, etape } = {}) {
  const double = place === true && voulue === true;
  return { double, pages: double && etape === ETAPE_EN_DEUX_PAGES };
}

/** Les écrans qu'une lune propose, dans l'ordre du croquis — ⏳ à ratifier par Eric.
 *  ⚖️ *« Cart »* = le Tally (`b2`). ⛔ La Forge (X5) n'y est pas : elle ne s'ouvre pas seule,
 *  il lui faut un plan. */
export const ECRANS_DE_LA_LUNE = Object.freeze(["gear", "sac", "r", "b2"]);
/** Le choix qui referme le double écran — ⚖️ le « BACK TO ONE SCREEN » du croquis. */
export const UN_SEUL_ECRAN = "un-ecran";

/** La voisine par défaut, quand la commande n'en a pas choisi (l'interrupteur du Menu) :
 *  Gear, ou le sac quand l'active EST Gear. */
export function voisineParDefaut(active) {
  return active === PAGE_DU_CORPS ? VOISINE_DU_CORPS : PAGE_DU_CORPS;
}

/** 🔴 OÙ — la page active et sa voisine.
 *  @param {{ active: string, voisine: string|null }} o
 *  @returns {{ gauche: string, droite: string, active: "droite" }}
 *  ⚖️ LE CROQUIS DU 27/09 FAIT FOI (`2026-09-27-double-screen-option.jpg`) : la lune porte une
 *  flèche ←, l'écran choisi se pose À GAUCHE ; l'écran d'où l'on a commandé reste à droite.
 *  ⛔ Une voisine égale à l'active ne peut pas être : elle cède au défaut. */
export function pagesDuDoubleEcran({ active, voisine } = {}) {
  const a = active || PAGE_DU_CORPS;
  const v = voisine && voisine !== a ? voisine : voisineParDefaut(a);
  return { gauche: v, droite: a, active: "droite" };
}

/** Ce que la lune d'une page propose.
 *  @param {{ page: string, autre: string|null, enDouble: boolean }} o
 *    `page` : l'écran qui porte la lune ; `autre` : l'écran de l'autre moitié, en double.
 *  ⭐ Jamais l'écran où l'on est, jamais celui d'en face ; en double, « Back to one screen »
 *  en DERNIER — le croquis le dessine au-dessus du belt, où le belt déroulé ne laisse rien. */
export function choixDeLaLune({ page, autre = null, enDouble = false } = {}) {
  const ecrans = ECRANS_DE_LA_LUNE.filter((e) => e !== page && e !== autre)
    .map((valeur) => ({ valeur, mot: t(`lune.${valeur}`) }));
  return enDouble ? [...ecrans, { valeur: UN_SEUL_ECRAN, mot: t("lune.un-ecran") }] : ecrans;
}

/** 🌕 LA LUNE — Eric, 27/09 : *« une lune qui propose un dropdown de choix d'écrans, une lune
 *  30 diam »*. ⭐ C'EST UN `<select>` NATIF habillé en lune : il s'ouvre au doigt comme à la
 *  souris, et iOS le rend dans son propre menu (la même raison que le `SEND TO` de X5).
 *  ⭐ Sa boîte est la CIBLE (44), le dessin (30) se creuse par les bords transparents que la
 *  feuille de chaque écran pose depuis son plan — ⛔ aucune cote ici.
 *  ⭐ En double écran, la lune de la page VOISINE porte le nom de ce qu'elle montre (la lune
 *  « Backpack » du croquis) : c'est l'option choisie, écrite sur l'astre.
 *  @param {{ page, autre, enDouble, estVoisine, surChoix }} o */
export function construireLaLune({ page, autre = null, enDouble = false, estVoisine = false, surChoix = null } = {}) {
  const s = document.createElement("select");
  s.className = "lune-ecrans";
  s.dataset.organe = "lune";
  const vide = document.createElement("option");
  vide.value = "";
  vide.textContent = "";
  vide.disabled = true;
  vide.hidden = true;
  const options = [vide];
  if (estVoisine) {
    const ici = document.createElement("option");
    ici.value = page;
    ici.textContent = t(`lune.${page}`);
    ici.selected = true;
    options.push(ici);
  } else vide.selected = true;
  for (const c of choixDeLaLune({ page, autre, enDouble })) {
    const o = document.createElement("option");
    o.value = c.valeur;
    o.textContent = c.mot;
    options.push(o);
  }
  s.append(...options);
  s.setAttribute("aria-label", estVoisine ? `${t("lune.titre")} — ${t(`lune.${page}`)}` : t("lune.titre"));
  if (estVoisine) s.dataset.voisine = "oui";
  s.addEventListener("change", () => { if (s.value && surChoix) surChoix(s.value); });
  return s;
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
