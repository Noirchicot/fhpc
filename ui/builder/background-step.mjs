/* ══ L'ÉTAPE BACKGROUND — lot 187 ═══════════════════════════════════════════
   ⚖️ Eric, 2026-09-09. À la question *« l'étape Background en pile SRD n'a
   pas d'écran — huit crans, ou un écran ? »*, il a répondu : *« je ne
   comprends pas où est ton problème »*. ⇒ Le joueur SRD a quatre arrière-plans
   dans sa pile : **il lui faut l'écran qui les montre.** Ce n'est pas un
   choix, c'est un lot.

   📏 CE QUI MANQUAIT, MESURÉ DANS LA PAGE LE 09/09 (pile SRD, 375 × 812) : le
   cran 3 disait déjà `Background` — le lot 186 lit les drapeaux montés — mais
   l'écran servait encore le guide d'Inheritance, VIDE (aucun item, puisque le
   genre `background` a quatre records et qu'aucun n'est choisi). La ceinture
   et l'écran ne lisaient pas le même signal.

   ⭐ CE FICHIER EST SPECIES, AVEC SON RECORD À LUI. Le catalogue partagé
   (`catalogue.mjs`) rend les cartes, le rail et la porte ; le parcours d'étape
   (`parcours.mjs`, `parcours-ecrans.mjs`) rend le guide, les items et le
   bilan. Ce fichier ne garde que ce qui appartient à l'arrière-plan : à quoi
   ressemble sa carte, et quels corps d'item il fournit. *« B3 = B2, point »* —
   et B4 aussi.

   ⛔ AUCUNE LISTE D'ARRIÈRE-PLANS ICI. Les options viennent du plan
   `background` (`catalogueOptions`), que le carnet publie depuis le genre
   monté ; les contenus viennent des records par `query`. Un livre du joueur ou
   un homebrew qui ajoute un cinquième arrière-plan le fait apparaître sans
   qu'une ligne change ici — un garde le prouve avec une couche de fixture.

   ── CE QUE LE MOTEUR PUBLIE SOUS LA RACINE, mesuré sur le SRD 5.2.1 ─────
     · `background.boost`         — offert : 3 points sur les 3 caractéristiques
                                    que le record nomme (`ability_keys`) ;
     · `background.originFeat[0]` — REQUIS : le don d'origine du record
                                    (`feat_id`), déjà répondu ;
     · `background.tool`          — REQUIS (`tool_id`, trois records sur quatre)
                                    ou OFFERT (`tool_choice`, le Soldier seul :
                                    un Gaming Set).
   Le glisser des bonus est CELUI de l'Inheritance (`renderBoostGlisse`) : même
   plan, même organe, seules les clefs offertes changent (trois au lieu de
   six). Le rendre deux fois ferait diverger les deux écrans au premier
   réglage.
   🔴 ET IL LIT LE DOCUMENT — lot 190. Eric : *« fantôme marche pas, pas
   possible de poser dans les collecteurs »*. Mesuré : le dépôt écrivait, le
   collecteur restait vide, parce que `renderBoostGlisse` lit la valeur posée
   dans `ctx.document` et que le ctx des catalogues ne le portait pas. C'est
   la coquille qui le donne (`catalogueCtx`, shell.mjs) — pas cet écran.

   🚪 CE QUI EST GRANTED SE MONTRE, IL NE SE CHOISIT PAS — Eric, 2026-09-09,
   lot 190 : *« Pour le feat : Savage Attacker (c'est granted) pas de bouton.
   Les compétences idem, les skills sont granted, y'a pas de choix. Idem que
   pour les lineages. »* Le don, les deux compétences et l'outil fixé sont des
   FAITS du record : le parcours ne les liste plus comme des portes (un plan
   requis n'est pas un item — `parcours.mjs`, NORMES §6 pré quinquies), et
   cette étape les montre sur sa ligne « gagné d'office » (`LIGNE_ACQUIS`),
   exactement la forme des traits d'un lignage. Le nom du don et de l'outil se
   tape pour lire (doigt : tap = info). ⛔ Le lot 187 les listait, avec un
   `Done` qui « prenait acte » : c'était une signature à poser pour rien.

   ⛔ L'ÉQUIPEMENT A/B N'EST PAS CHOISI ICI. `data.equipment` est lu par
   l'étape Equipment (`orDuDepart`, lot 182 : « les 50 gp remplacent le
   paquet »). Une carte qui l'afficherait inviterait à un choix que cet écran
   n'offre pas — le « faux magasin » que ce dépôt interdit. */

import { planAt, planSlots } from "./carnet.mjs?v=617";
import { renderFicheBody, renderBilanLignes, imageDeFiche, DOS_DE_CARTE } from "./catalogue.mjs?v=617";
import { renderChoixGlisses } from "./glisser.mjs?v=617";
import { renderBoostGlisse, featInfo } from "./inheritance-step.mjs?v=617";
import { STEPS } from "./etapes.mjs?v=617";
/* LOT 194 — « ce plan porte-t-il encore une décision ? ». Le MÊME lecteur que
   celui qui décide s'il y a une porte (`itemsDeLEtape`) : deux réponses à cette
   question-là feraient une porte sans son résumé, ou l'inverse. */
import { porteUneDecisionOuverte } from "./parcours.mjs?v=617";
/* LOT 191 — le mot d'un choix, un seul organe pour tous les écrans. */
import { motDuChoix, motDUnRecordAbsent } from "./mot-du-choix.mjs?v=617";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/* ══ LE SIGNAL — un seul, celui de la ceinture ══════════════════════════════
   Le cran 3 DÉCLARE dans `STEPS` (`etapes.mjs`) sous quel drapeau il change de
   mot (`motSi`) ; ce prédicat lit CETTE déclaration-là : **le cran change
   d'écran quand il change de mot**, sur le même drapeau, écrit une seule fois.
   ⛔ Le drapeau n'est pas recopié ici en littéral : deux écritures divergent
   (la ceinture aurait dit `Background` pendant que l'écran servait
   l'Inheritance — c'est le trou mesuré le 09/09).
   ⛔ Et ce prédicat ne lit pas le nom de la pile (`currentStack`) : c'est la
   faute que le lot 186 a fermée — « SRD + Destiny » n'est ni l'une ni l'autre
   pile, et un aiguillage à deux noms l'enverrait dans l'écran mort. */
export function inheritanceMontee(drapeaux) {
  const cran = STEPS.find((step) => step.id === "background");
  const leves = new Set(Array.isArray(drapeaux) ? drapeaux : []);
  return Boolean(cran) && (cran.motSi || []).some((variante) => leves.has(variante.drapeau));
}

/* ══ LES CHEMINS QUE LE CARNET PUBLIE SOUS LA RACINE ═══════════════════════
   Ce sont ceux de `decisions.mjs` (`backgroundBoostPlan`, `backgroundFeatPlan`,
   `backgroundToolPlan`) — l'Inheritance lit les mêmes. */
const CHEMIN_BOOST = "background.boost";
const CHEMIN_DON = "background.originFeat[0]";
const CHEMIN_OUTIL = "background.tool";
/* ⚠️ LES LANGUES, ET POURQUOI UN ARRIÈRE-PLAN SRD PEUT EN AVOIR UN PLAN.
   📏 Mesuré dans la page le 09/09 : un personnage bâti sous Fate's Hand, dont
   on éteint la couche, garde ses `background.languages[n]` au document (le
   Menu le dit : « they stay saved, and resume as soon as you switch it back
   on ») — et `backgroundLanguagePlans` publie alors un plan SANS options,
   pour que ces choix soient jugés. Le parcours le liste comme un item ; il
   apparaissait sous son chemin brut, « background.languages ». Un écran qui A
   un plan doit le lire : il est nommé, et sa dalle dit ce qu'il est. Un
   arrière-plan qui DÉCLARE des langues (`granted_language_choice`, un homebrew
   demain) obtient le glisser, comme l'Inheritance. */
const CHEMIN_LANGUES = "background.languages";

/** LA LIGNE « GAGNÉ D'OFFICE » — la même que celle des lignages
 *  (`LIGNE_ACQUIS`, species-step) et des classes (`LIGNE_ACQUIS_CLASSE`) :
 *  pas de porte, un voyant vert dès que l'arrière-plan est retenu, et son
 *  résumé sous la tête. ⛔ Aucun `depend` : ce qu'un arrière-plan accorde ne
 *  dépend d'aucun autre choix — il est acquis à l'instant où l'arrière-plan
 *  l'est. */
export const LIGNE_ACQUIS = Object.freeze({
  path: "background.granted",
  sansChoix: true,
  label: "Granted automatically"
});

function nomDuRecord(query, kind, id) {
  return motDuChoix(query, kind, id);
}

/** Les NOMS d'une liste d'ids, résolus par `query` ; à défaut d'ids, les
 *  libellés que le record porte déjà (`skill_proficiencies`…) — un record
 *  homebrew peut ne porter que l'un des deux. Rend `null` quand il n'y a rien :
 *  la ligne n'existe alors pas (jamais un tiret inventé pour remplir). */
function nomsDe(query, kind, ids, libelles) {
  if (Array.isArray(ids) && ids.length > 0) {
    return ids.filter((id) => typeof id === "string").map((id) => nomDuRecord(query, kind, id)).join(", ");
  }
  if (Array.isArray(libelles) && libelles.length > 0) {
    return libelles.filter((l) => typeof l === "string").join(", ");
  }
  return null;
}

/** L'id de l'arrière-plan RETENU — lu dans le carnet, jamais deviné (même
 *  geste que `idEspeceRetenue`, species-step). */
function idRetenu(ctx) {
  const plan = planAt((ctx && ctx.decisions) || [], "background");
  return plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
}

/** Le record retenu, ou `null`. */
export function arrierePlanRetenu(ctx) {
  const id = idRetenu(ctx);
  if (!id || !ctx.query) return null;
  const view = ctx.query({ kind: "background", id });
  return view && view.record ? view.record : null;
}

/** Le mot du don d'un record : son nom, plus l'option que le record fixe
 *  (« Magic Initiate (Cleric) ») — l'option est un record, donc un nom lu, pas
 *  la phrase SRD « (see “Feats”) » qui renvoie à un chapitre absent d'ici. */
function motDuDon(query, data) {
  if (typeof data.feat_id !== "string") {
    return typeof data.feat === "string" ? data.feat : null;
  }
  const nom = nomDuRecord(query, "feat", data.feat_id);
  const option = data.feat_option;
  if (option && typeof option === "object" && typeof option.id === "string" && typeof option.kind === "string") {
    return `${nom} (${nomDuRecord(query, option.kind, option.id)})`;
  }
  return nom;
}

/** Le mot de l'outil d'un record : accordé (`tool_id`) ou à choisir
 *  (`tool_choice.from`). La carte DIT qu'un choix reste ouvert : une carte qui
 *  écrirait « Gaming Set » comme un acquis mentirait sur le Soldier. */
function motDeLOutil(query, data) {
  if (typeof data.tool_id === "string") return nomDuRecord(query, "tool", data.tool_id);
  const choix = data.tool_choice;
  if (choix && Array.isArray(choix.from) && choix.from.length > 0) {
    return `${nomsDe(query, "tool", choix.from, null)} — your pick`;
  }
  return typeof data.tool_proficiency === "string" ? data.tool_proficiency : null;
}

/** Les trois caractéristiques que le record nomme : les mots SRD
 *  (`ability_scores`) quand il les porte, sinon les clefs, en capitales comme
 *  les récepteurs du glisser des bonus. */
function motDesCaracs(data) {
  if (Array.isArray(data.ability_scores) && data.ability_scores.length > 0) {
    return data.ability_scores.filter((s) => typeof s === "string").join(", ");
  }
  if (Array.isArray(data.ability_keys) && data.ability_keys.length > 0) {
    return data.ability_keys.filter((k) => typeof k === "string").map((k) => k.toUpperCase()).join(", ");
  }
  return null;
}

/* ══ LA CARTE — ce qu'Eric a listé : le nom, les 2 compétences, l'outil, le
   don d'origine, les 3 caractéristiques ══════════════════════════════════════
   ⭐ C'EST LA FICHE DE SPECIES ET DE CLASS (`renderFicheBody`) : bloc 1 en haut
   à gauche, image en haut à droite, `LORE` et `CHOOSE` au pied. Les quatre
   lignes prennent la forme des TRAITS (mot fort, effet en italique dessous) —
   la même boîte 1 que l'espèce.
   📏 PAS LA LIGNE DE STATS, ET C'EST MESURÉ (375 × 812, premier rendu du
   09/09) : « Abilities : Intelligence, Wisdom, Charisma » en `fiche-stat-row`
   ne se replie pas — la ligne passait SOUS l'image et se rognait des deux côtés
   (« ities : Intelligence, Wisdom, Ch »). Les stats d'espèce sont courtes
   (« Medium », « 30 feet ») ; celles-ci ne le sont pas. Un trait se replie.
   ⭐ Depuis le lot 190, les fiches SRD de Species et de Class prennent la même
   forme (des traits qui se replient, l'image, le blurb) : ce n'est plus une
   exception de cet écran.

   📌 Aucune image d'arrière-plan n'existe : le dos de carte tient la place,
   comme il l'a fait pour les douze espèces avant leurs images. Le nom du
   fichier attendu est le dernier segment de l'id (`acolyte.webp`), même
   dossier que les fiches — le jour où une image arrive, elle arrive par le
   même chemin. */
export function renderBackgroundCardBody(query, id) {
  const view = query({ kind: "background", id });
  const data = (view && view.record && view.record.data) || {};
  const traits = [
    { name: "Abilities", effect: motDesCaracs(data) },
    { name: "Skills", effect: nomsDe(query, "skill", data.skill_ids, data.skill_proficiencies) },
    { name: "Tool", effect: motDeLOutil(query, data) },
    { name: "Origin feat", effect: motDuDon(query, data) }
  ].filter((t) => typeof t.effect === "string" && t.effect.length > 0);
  return renderFicheBody({
    stats: [],
    traits,
    /* le SRD ne porte aucune prose d'arrière-plan : le bas reste vide plutôt
       que rempli d'une phrase fabriquée (loi §0.13, aucune chaîne inventée) */
    blurb: "",
    image: imageDeFiche(id),
    imageSecours: DOS_DE_CARTE,
    imageAlt: ""
  });
}

/* ══ LES CORPS D'ITEM ═══════════════════════════════════════════════════════ */

/** L'info d'un outil — ce que le SRD dit qu'on en fait. Même fenêtre que le
 *  tap d'un don ou d'un lignage. */
function toolInfo(query, id) {
  const view = query({ kind: "tool", id });
  const data = (view && view.record && view.record.data) || {};
  const lignes = [
    typeof data.utilize === "string" ? `Utilize: ${data.utilize}` : null,
    typeof data.craft === "string" && data.craft !== "None" ? `Craft: ${data.craft}` : null,
    typeof data.variants === "string" && data.variants !== "None" ? `Variants: ${data.variants}` : null,
    typeof data.ability === "string" ? `Ability: ${data.ability}` : null
  ].filter(Boolean);
  if (lignes.length === 0) return null;
  return { kind: "popup", titre: (view && view.record && view.record.name) || motDUnRecordAbsent(id), texte: lignes.join("\n\n") };
}

/** L'OUTIL À CHOISIR : un glisser quand le record laisse choisir
 *  (`tool_choice`, plan OFFERT). Un outil IMPOSÉ (`tool_id`, plan REQUIS)
 *  n'est plus un item du parcours (lot 190) : il se lit sur la ligne « gagné
 *  d'office », et ce corps rend `null` — il n'a rien à demander.
 *  ⭐ C'est la PROVENANCE du plan qui tranche — le carnet la publie
 *  (`recordProvenance("offered" | "required")`). Un plan sans provenance se lit
 *  à son compte : reste-t-il quelque chose à répondre ? */
function renderToolItem(ctx, act) {
  const decisions = ctx.decisions || [];
  const plan = planAt(decisions, CHEMIN_OUTIL);
  if (!plan) return null;
  const offert = plan.provenance && typeof plan.provenance.mode === "string"
    ? plan.provenance.mode === "offered"
    : plan.answered < plan.expected;
  if (!offert) return null;
  /* titre: null — la dalle d'item nomme déjà l'écran (§1 quinquies) */
  return renderChoixGlisses({
    plan, slots: [{ ...plan, index: 0, mot: "Tool" }], titre: null, mot: "Tool",
    refKind: "tool", labelOf: (id) => nomDuRecord(ctx.query, "tool", id), onAction: act,
    onInfo: (id) => { const info = toolInfo(ctx.query, id); if (info) act(info); }
  });
}

/** LES LANGUES : le glisser quand le plan offre des options, sinon la dalle
 *  dit d'où viennent les entrées et qu'il n'y a rien à poser ici. */
function renderLanguesItem(ctx, act) {
  const decisions = ctx.decisions || [];
  const plan = planAt(decisions, CHEMIN_LANGUES);
  if (!plan) return null;
  if (!Array.isArray(plan.options) || plan.options.length === 0) {
    return el("section", "background-impose", [el("p", "guide-mot", [text(
      "This background grants no language choice. The entries kept here were made under a rule " +
      "set that is not mounted now — they stay saved, and count again when it is."
    )])]);
  }
  const nom = (id) => nomDuRecord(ctx.query, "training", id);
  return renderChoixGlisses({
    plan, slots: planSlots(decisions, CHEMIN_LANGUES), titre: null, mot: "Language",
    refKind: "training", labelOf: nom, onAction: act,
    consigne: `${plan.answered} of ${plan.expected} chosen.`
  });
}

/** Le corps d'un item, par son chemin — une chose par écran (*« un écran = une
 *  lettre et un chiffre »*). */
function corpsDeLItem(item, ctx, act) {
  if (!item) return null;
  if (item.path === CHEMIN_BOOST) return renderBoostGlisse(ctx, act);
  if (item.path === CHEMIN_OUTIL) return renderToolItem(ctx, act);
  if (item.path === CHEMIN_LANGUES) return renderLanguesItem(ctx, act);
  return null;
}

/* ══ LA LIGNE « GAGNÉ D'OFFICE » — ce que l'arrière-plan donne sans qu'on
   choisisse ═══════════════════════════════════════════════════════════════
   ⭐ LE MÊME ORGANE QUE LA CLASSE (`renderBilanLignes`, « **Mot :** texte »,
   la dictée d'Eric du 27/08) et le même geste que le lignage : un nom qui a
   une fenêtre d'info EST un bouton (le don, l'outil — `featInfo`, `toolInfo`,
   les fenêtres que le tap ouvrait déjà au lot 187), sans bleu (Eric, 28/08 :
   *« pas besoin de mettre le texte des tokens en bleu »*). Les compétences
   restent du texte : le SRD n'a pas de fenêtre de compétence ici.
   ⛔ L'OUTIL N'Y FIGURE QUE S'IL EST IMPOSÉ. Le Soldier choisit le sien : sa
   ligne le dirait avant qu'il l'ait choisi, et la porte `Tool` le dit déjà. */
function nomQuiOuvre(nom, info, act) {
  if (!info) return text(nom);
  const bouton = el("button", "bilan-nom", [text(nom)]);
  bouton.type = "button";
  bouton.setAttribute("aria-label", `${nom} — details`);
  bouton.addEventListener("click", () => act(info));
  return bouton;
}

/** LE DON D'ORIGINE A-T-IL QUELQUE CHOSE À RÉGLER ? — lot 194.
 *  Le don est IMPOSÉ par l'arrière-plan ; ce qu'il demande ENSUITE (les sorts
 *  de Magic Initiate) vit sous lui, dans le carnet. ⛔ Aucun nom de don ici :
 *  on lit ce que le carnet publie, comme `itemsDeLEtape` — et par le MÊME
 *  lecteur, pour qu'une porte et son résumé ne puissent pas se contredire. */
function donConfigurable(ctx) {
  return porteUneDecisionOuverte((ctx && ctx.decisions) || [], CHEMIN_DON);
}

function resumeDeLItem(item, ctx, act) {
  if (!item || item.path !== LIGNE_ACQUIS.path) return null;
  const record = arrierePlanRetenu(ctx);
  if (!record) return null;
  const data = record.data || {};
  const query = ctx.query;
  const agir = act || (() => {});
  /* ⛔ ET LE DON N'Y FIGURE QUE S'IL N'A RIEN À RÉGLER — lot 194, le même
     argument que l'outil deux lignes plus bas : quand Magic Initiate ouvre sa
     porte, c'est ELLE qui le nomme, et « soit la porte, soit le résumé, jamais
     les deux » (Eric, 26/08). Alert et Savage Attacker ne règlent rien : ils
     restent ici, avec leur fenêtre au tap. */
  const don = donConfigurable(ctx) ? null : motDuDon(query, data);
  const outil = typeof data.tool_id === "string" ? nomDuRecord(query, "tool", data.tool_id) : null;
  const lignes = [
    ["Skills", nomsDe(query, "skill", data.skill_ids, data.skill_proficiencies)],
    ["Tool", outil ? nomQuiOuvre(outil, toolInfo(query, data.tool_id), agir) : null],
    ["Origin feat", don ? nomQuiOuvre(don, typeof data.feat_id === "string" ? featInfo(query, data.feat_id) : null, agir) : null]
  ];
  const corps = renderBilanLignes(lignes);
  return corps ? el("div", "parcours-resume-corps", [corps]) : null;
}

/** LA PORTE DIT CE QU'IL Y A DERRIÈRE (loi de la porte, Eric 27/08) : une
 *  porte résolue nomme la réponse et garde la question en sous-titre. Seul
 *  l'outil À CHOISIR arrive comme une question ; les bonus en sont une
 *  jusqu'au bout (une bourse n'a pas UNE réponse). */
function porteDeLItem(chemin, ctx) {
  const decisions = ctx.decisions || [];
  if (chemin === CHEMIN_BOOST) return "Ability boosts";
  if (chemin === CHEMIN_LANGUES) return "Languages";
  if (chemin === LIGNE_ACQUIS.path) return LIGNE_ACQUIS.label;
  if (chemin === CHEMIN_OUTIL) {
    const plan = planAt(decisions, CHEMIN_OUTIL);
    const id = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
    return id ? { mot: nomDuRecord(ctx.query, "tool", id), sous: "tool" } : "Tool";
  }
  /* 🚪 LOT 194 — LA PORTE DU DON CONFIGURABLE. Le don ne se choisit pas ici
     (l'arrière-plan l'impose) : la porte NOMME donc toujours la réponse, avec
     sa question en sous-titre — « Magic Initiate (Cleric) » / *origin feat*,
     la loi de la porte, et l'option fixée par le record en fait partie. */
  if (chemin === CHEMIN_DON) {
    const record = arrierePlanRetenu(ctx);
    const nom = record ? motDuDon(ctx.query, record.data || {}) : null;
    return nom ? { mot: nom, sous: "origin feat" } : "Origin feat";
  }
  return chemin;
}

const PREVENTION = "Leaving this open marks nothing — only Done records the choice.";

function aiguilleurDeLItem(chemin) {
  if (chemin === CHEMIN_OUTIL) {
    return `Tap a tool to read what it covers — drag it into the slot to choose. ${PREVENTION}`;
  }
  /* LOT 194 — la porte du don mène à SON menu (le B emboîté, `FEAT_PARCOURS`) :
     la bande dit ce qui attend derrière, pas un geste qui n'est pas là. */
  if (chemin === CHEMIN_DON) {
    return `This feat still asks you something — open it and settle each line. ${PREVENTION}`;
  }
  return null;
}

/* `fiche: true` — même déclaration que Species et Class, même raison (Ch6) :
   cet écran passe par `renderFicheBody`, ses dalles portent `LORE` / `CHOOSE`,
   et `CHOOSE` y remplace le `Validate` générique.
   `parcours: true` — le guide, ses items, son bilan : la coquille fait le
   reste, comme pour Species (Eric, 2026-08-19). */
export const BACKGROUND_CATALOGUE = {
  path: "background", kind: "background", label: "Background", fiche: true, parcours: true,
  itemCorps: corpsDeLItem,
  itemLabel: porteDeLItem,
  itemAiguilleur: aiguilleurDeLItem,
  /* la ligne « gagné d'office » et son résumé — la forme des lignages */
  lignesEnPlus: [LIGNE_ACQUIS],
  resumeItem: resumeDeLItem,
  /* ⏳ LE TEXTE EST UN BROUILLON — le mien, pas celui d'Eric. Il dit ce que
     l'écran ATTEND, et il se corrige ICI, à un seul endroit. Le compte n'est
     pas écrit : la pile dit combien elle en porte. */
  guideGeneral: {
    titre: "Choosing a background",
    texte: "Your background is where the character comes from: it grants two skills, a tool, " +
      "an origin feat, and names the three abilities you may raise.\n\n" +
      "Scroll through the backgrounds below and read what each one gives. When one fits, press " +
      "Choose — the next screen lists what that background still leaves you to settle."
  }
};

/** LE MENU DES CHOIX (2ᵉ palier hors parcours, et le repli d'un item sans
 *  corps) : les corps de ce qui reste À CHOISIR, empilés. Même contrat que
 *  `renderSpeciesChoices`. Ce que le record impose n'y est pas : ce n'est
 *  pas un choix. */
export function renderBackgroundChoices(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const menu = el("div", "catalogue-choices");
  for (const chemin of [CHEMIN_BOOST, CHEMIN_OUTIL, CHEMIN_LANGUES]) {
    const corps = corpsDeLItem({ path: chemin }, ctx, act);
    if (corps) menu.append(corps);
  }
  return menu;
}

/** La porte du 2ᵉ palier : prête quand tout ce que le carnet publie sous la
 *  racine est répondu — les plans requis y sont, déjà répondus : ils ne
 *  retiennent jamais la porte. `null` sans plan — un arrière-plan qui ne
 *  demanderait rien n'aurait qu'un palier (I.4). */
export function backgroundPalier2(decisions) {
  const plans = [CHEMIN_BOOST, CHEMIN_OUTIL, CHEMIN_DON, CHEMIN_LANGUES]
    .map((chemin) => planAt(decisions, chemin))
    .filter(Boolean);
  if (plans.length === 0) return null;
  return { ready: plans.every((plan) => plan.answered >= plan.expected) };
}
