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

import { createLabels, EN_DEPOT_VOISIN, EN_LUNE } from "../../src/labels.mjs?v=926";

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
 *  @param {{ place: boolean, voulue: boolean, etape: string, satellite: boolean }} o
 *    · `place`     — la fenêtre porte deux colonnes (`laPlaceDuDouble`) ;
 *    · `voulue`    — l'interrupteur `Double view` du Menu (la double vue du lot 120) ;
 *    · `etape`     — l'id du cran actif ;
 *    · `satellite` — la fiche principale de l'Équipement a OUVERT un satellite (sa lune).
 *  @returns {{ double: boolean, pages: boolean }}
 *    · `double` — l'app pose deux panneaux ;
 *    · `pages`  — le second est le SATELLITE de la fiche principale, pas une seconde étape.
 *  ⚖️ LA RÈGLE ④ DU 14/09 (artefact « Le belt et la double vue ») : *« Que le double écran ne
 *  soit plus une double navigation, mais qu'il soit ouvert par la fiche principale »*. Dans
 *  l'Équipement, c'est donc la LUNE de la principale qui ouvre — ⛔ plus d'ouverture d'office
 *  (Eric, 27/09 : *« Une commande pour ouvrir le double écran »*), et l'interrupteur du Menu
 *  n'y ouvre pas de satellite : il garde, partout, sa double vue du lot 120.
 *  ⛔ Sans la place, rien — ni satellite ni double vue. */
export function regimeDeLaVue({ place, voulue, etape, satellite } = {}) {
  if (place !== true) return { double: false, pages: false };
  const pages = etape === ETAPE_EN_DEUX_PAGES && satellite === true;
  return { double: pages || voulue === true, pages };
}

/** Les écrans qu'une lune propose — ⚖️ l'ordre des lunes des archives (croquis du 14/09,
 *  `IMG_6321`) : Backpack · Cart · Forge · Equipment, *« Cart »* devenu Tally le 15/09,
 *  *« Equipment »* étant Wares ; plus Gear, que le croquis ne dessine pas parce qu'il était la
 *  principale — ici toute page de l'étape peut l'être. ⛔ La Forge (X5) n'y est pas : elle ne
 *  s'ouvre pas sans un plan. ⏳ À ratifier par Eric. */
export const ECRANS_DE_LA_LUNE = Object.freeze(["sac", "b2", "r", "gear"]);

/** 🔴 OÙ — la principale et son satellite.
 *  @param {{ active: string, voisine: string|null }} o  `active` : la principale ;
 *    `voisine` : le satellite qu'elle a ouvert.
 *  @returns {{ gauche: string, droite: string, active: "droite" }}
 *  ⚖️ La figure ④ du 14/09 et le croquis du 27/09 : la principale À DROITE, sous le belt ; le
 *  satellite À GAUCHE (la flèche ← de la lune). ⛔ Un satellite égal à la principale ne peut
 *  pas être : il cède au défaut (Gear, ou le sac quand la principale EST Gear). */
export function voisineParDefaut(active) {
  return active === PAGE_DU_CORPS ? VOISINE_DU_CORPS : PAGE_DU_CORPS;
}
export function pagesDuDoubleEcran({ active, voisine } = {}) {
  const a = active || PAGE_DU_CORPS;
  const v = voisine && voisine !== a ? voisine : voisineParDefaut(a);
  return { gauche: v, droite: a, active: "droite" };
}

/** Le mot d'une page sur la lune du rail. ⭐ Le satellite se navigue lui-même : il peut montrer
 *  une fiche X ou une branche — elle se nomme par la famille d'où elle vient (X5 = la Forge des
 *  lunes du 14/09 ; X1/X2 = un objet). ⛔ Jamais un id nu : une page inconnue dit « Screen ». */
const FAMILLE_DE_PAGE = Object.freeze({ gear: "gear", x0: "gear", sac: "sac", sb31: "sac", sb33: "sac",
  r: "r", recherche: "r", b2: "b2", sb32: "b2", x5: "x5", "x1-apercu": "x5", x1: "x1", x2: "x1" });
export function motDeLaPage(page) {
  return t(`lune.${FAMILLE_DE_PAGE[page] || "autre"}`);
}

/** Le choix « Close » de la lune — ⚖️ Eric, 27/09 : *« La lune propose un close dans son
 *  dropdown »*. Il ferme le double écran ; il n'existe que si un satellite est ouvert. */
export const FERMER = "fermer";

/** Ce que la lune propose : les écrans des archives, sauf la principale et le satellite déjà
 *  ouvert ; puis « Close » en dernier, si un satellite est ouvert.
 *  ⛔ LA FORGE (X5) N'Y EST JAMAIS — Eric, 27/09 : *« Le forge peut ouvrir, mais ne peux pas être
 *  ouverte »* : `ECRANS_DE_LA_LUNE` ne la porte pas, et un garde le vérifie. */
export function choixDeLaLune({ principale, satellite = null } = {}) {
  const ecrans = ECRANS_DE_LA_LUNE.filter((e) => e !== principale && e !== satellite)
    .map((valeur) => ({ valeur, mot: t(`lune.${valeur}`) }));
  return satellite ? [...ecrans, { valeur: FERMER, mot: t("lune.fermer") }] : ecrans;
}

/** Les fiches qui ne s'ouvrent JAMAIS dans le satellite : la Forge et son aperçu. ⭐ Si le
 *  satellite y mène (un plan tapé dans Wares à gauche), elles s'ouvrent dans la PRINCIPALE. */
export const PAGES_PRINCIPALES_SEULEMENT = Object.freeze(["x5", "x1-apercu"]);

/** 🌕 LA LUNE UNIQUE → LE SÉLECTEUR — Eric, 27/09 : *« une lune qui propose un dropdown de choix
 *  d'écrans, une lune 30 diam »*, gardée le 27/09 au soir (*« Le concept de la lune unique qui
 *  mène sur un sélecteur on garde »*). ⭐ Un `<select>` NATIF habillé en lune : il s'ouvre au
 *  doigt comme à la souris, iOS le rend dans son propre menu.
 *  · dans la PRINCIPALE (`rail: false`) : Ø 30 dans une cible de 44, posée par le plan de chaque
 *    écran — elle OUVRE ou change le satellite ;
 *  · sur la BARRE DU RAIL (`rail: true`), en double seulement : ⚖️ *« La lune du double écran sera
 *    de taille dominante »* (15/09) — elle NOMME le satellite ouvert (la lune « Backpack » du
 *    croquis, au-dessus du volet gauche), à la cote de la tuile dominante, et permet d'en changer.
 *  @param {{ principale: string, satellite: string|null, rail?: boolean, surChoix }} o */
export function construireLaLune({ principale, satellite = null, rail = false, surChoix = null } = {}) {
  const s = document.createElement("select");
  s.className = "lune-ecrans";
  s.dataset.organe = rail ? "lune-rail" : "lune";
  const vide = document.createElement("option");
  vide.value = "";
  vide.textContent = "";
  vide.disabled = true;
  vide.hidden = true;
  const options = [vide];
  const nomme = rail && satellite;
  if (nomme) {
    const ici = document.createElement("option");
    ici.value = satellite;
    ici.textContent = motDeLaPage(satellite);
    ici.selected = true;
    options.push(ici);
  } else vide.selected = true;
  for (const c of choixDeLaLune({ principale, satellite })) {
    const o = document.createElement("option");
    o.value = c.valeur;
    o.textContent = c.mot;
    options.push(o);
  }
  s.append(...options);
  s.setAttribute("aria-label", nomme ? `${t("lune.titre")} — ${motDeLaPage(satellite)}` : t("lune.titre"));
  if (rail) s.dataset.taille = "dominante";
  /* ⚖️ LOT 319 — « Quand actif halo » (Eric, 27/09) : la lune d'une page porte le halo quand un
     side screen est ouvert. ⛔ La lune du rail, elle, EST sur le side screen : pas de halo. */
  if (!rail && satellite) s.dataset.actif = "true";
  /* ⚖️ LOT 338 — le choix fait, la lune rend le focus : rien ne reste allumé autour d'elle (Eric, 28/09 :
     « rond moche autour de la lune… apparaît quand je sélectionne la lune ») */
  s.addEventListener("change", () => {
    if (typeof s.blur === "function") s.blur();
    if (s.value && surChoix) surChoix(s.value);
  });
  return s;
}

/** Le mot du contrôle de la barre du rail — ⚖️ Eric, 27/09 : *« Il y a une option close double
 *  screen en haut et au milieu, mais plus petit plus discret »* (il remplace « Back to one
 *  screen » de la figure ④). */
export const MOT_UN_SEUL_ECRAN = t("lune.fermer-double");

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
export function popupDuDepotVoisin({ quoi, statut, cible, montant, accepter, annuler, gratuit, crafter } = {}) {
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
    /* ⚖️ LOT 337 — LES GESTES DE X2, DANS LE POPUP. Eric, 28/09 : *« oui tant que le prompt, buy, free,
       craft, cancel est présent »*, puis *« found plutôt que free »*. ⭐ Vers un corps (Gear, Backpack) :
       Buy · Found · Craft · Cancel —
       les boutons de la fiche X2, dans le même ordre. Craft est INERTE (montré, voilé) quand l'objet ne
       se crafte pas, comme sur X2. ⛔ Vers un Tally, rien ne change : le paiement y est différé. */
    if (cible !== "tally" && typeof gratuit === "function") {
      const craft = { mot: t("depot-voisin.bouton.craft"), faire: typeof crafter === "function" ? crafter : () => {} };
      if (typeof crafter !== "function") craft.inerte = true;
      actions = [bouton("buy", accepter), bouton("found", gratuit), craft, annulerB];
    }
  } else {
    return null;
  }
  return { kind: "popup", role: "aiguilleur", titre: null, texte, exigeUneReponse: true, actions };
}

/** Le mot d'un refus du dépôt (un objet sans prix connu). */
export const MOT_SANS_PRIX = t("depot-voisin.sans-prix");
