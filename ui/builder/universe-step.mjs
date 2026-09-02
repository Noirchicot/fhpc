/* ══ L'ÉTAPE UNIVERSE & LAYERS — lot 54 ═══════════════════════════════════
   Le second des deux derniers placeholders — et celui qui clôt le builder
   (§0 de la commande : « Concept » porte nom/genre/alignement, « Universe &
   Layers » porte les couches, la langue de la fiche, les unités et le nom
   de code de campagne).

   ⛔ HORS PÉRIMÈTRE, VOULU (commande §0) : « UI · couleurs ». `tokens.css`
   n'a aucun sélecteur `[data-theme]` — la bascule de thème n'existe pas
   encore, et une couleur d'interface n'entrerait de toute façon JAMAIS dans
   le document (`fh-char/1` s'exporte/s'importe ; un thème embarqué
   repeindrait le builder de celui qui importe). Ni l'un ni l'autre n'est
   dans ce fichier.

   ── LES RÈGLES : DEUX PILES NOMMÉES, PAS UN ÉDITEUR (commande §2b) ───────
   Le schéma dit « l'ORDRE EST LA PILE : première entrée = base (SRD),
   dernière = la plus forte ». Cet écran ne compose donc RIEN à la main :
   deux boutons, « SRD » (`srd-5.2.1-en` seule) et « SRD + FH » (les cinq
   couches que `engine.mjs` monte). Changer de pile est un geste à DEUX
   temps dans `layers` (`enable`/`disable` sur les quatre couches FH) suivi
   d'un `document.build.layers = []` : `src/build/block.mjs` (`rebuild`)
   ADOPTE alors la pile montée sans rien écraser — c'est écrit noir sur
   blanc dans son commentaire (« adopter la pile montée n'écrase aucune
   décision »). Aucun verbe `build`/`doc` ne pose `build.layers` : c'est un
   champ STRUCTUREL, pas un point de décision (`build.set` n'écrit que
   `build.choices`) — ce module (via `shell.mjs`) le manipule directement,
   comme le schéma lui-même le permet (« l'écran ne compose pas la pile, il
   CHOISIT parmi deux »).

   ── CE QUE LE CHANGEMENT DE PILE FAIT À UN PERSONNAGE DÉJÀ CONSTRUIT
   (commande §2b, ⚠️ MESURÉ — voir INVENTAIRE-LOT-54.md pour le détail) ─────
   Passer de SRD+FH à SRD NE PERD RIEN dans `document.build.choices` — les
   choix FH (dons, arcanes, budgets d'espèce) restent tels quels sur le
   document, et reviennent exactement comme avant dès qu'on repasse à
   SRD+FH (mesuré : les mêmes `unconsumed` avant/après un aller-retour).
   Ce qui se dégrade, c'est le PERSONNAGE RÉSOLU pendant que la pile est
   réduite : `validate()` nomme alors `choice.ref-missing` (un don ou une
   arcane FH ne pointe plus vers rien) et `skill-grant.count-mismatch`
   (le budget de compétence d'espèce que FH ajoutait disparaît). Ce n'est
   donc pas une PERTE DE DONNÉES (rien n'est effacé, `confirm.mjs` ne sert
   donc PAS à protéger contre une destruction), mais un passage à un état
   dégradé et NOMMABLE — la confirmation ci-dessous NOMME ce qui cesse de
   s'appliquer, dans le même esprit que Class (lot 46) même si la raison
   diffère (là, une perte réelle ; ici, une pause réversible). */

import { renderConfirmDialog } from "./confirm.mjs?v=445";
import { markPressed } from "./carnet.mjs?v=445";

/** Les SEPT couches que `engine.mjs` monte TOUJOURS — la pile « SRD + FH ».
 *  MÊME liste que `LAYER_FILES` de `engine.mjs`, mais ici ce sont les IDs de
 *  couche (`layer.id`), pas des noms de fichier : c'est ce que
 *  `layers.verbs.enable/disable({id})` et `document.build.layers[].id`
 *  emploient.
 *  ⚠️ LOT 77 — `fh-fiche-en` et `fh-lore-en` entrent ici EN MÊME TEMPS que
 *  dans `engine.mjs`, et ce n'est pas un détail de tenue de liste : sans
 *  elles, la pile réelle (7) ne correspondait plus à la pile nommée (5) et
 *  l'écran Universe accusait TOUT personnage d'avoir une pile hors des deux
 *  jeux de règles — mesuré au navigateur, le message rouge s'affichait sur
 *  le personnage d'exemple lui-même. Un garde tient désormais les deux
 *  listes ensemble (`tests/fiche-360.test.mjs`, garde 3). */
export const SRD_LAYER_ID = "srd-5.2.1-en";

/** 🔴 LA TROISIÈME COUCHE, ET ELLE N'EST DANS AUCUN DES DEUX CAMPS (lot 95).
 *  `srfh` porte ce qui est AMBIGU — les ajustements de confort qui font
 *  tourner le système sans amputer personne. Le test d'Eric porte sur le NOM :
 *  *« si on change ça, est-ce que ça s'appelle encore le SRD ? »*. Ranger un
 *  objet sur une étagère : **on ne sait pas** — donc `srfh`, ni SRD ni FH.
 *
 *  ⭐ ELLE EST DONC MONTÉE DANS LES DEUX PILES NOMMÉES, et ce n'est pas une
 *  commodité : la bascule de `shell.mjs` n'active/désactive que `FH_LAYER_IDS`,
 *  donc `srfh` ne bouge jamais. Un joueur en « SRD seul » garde son tambour ;
 *  sans elle, l'écran d'équipement serait VIDE dans ce mode — le rangement est
 *  de la NAVIGATION, pas une règle de jeu.
 *
 *  ⏳ ET C'EST UNE DÉCISION QUI PEUT SE RENVERSER, elle est nommée ici pour ça :
 *  si Eric veut qu'« SRD seul » veuille dire « rien qui ne soit dans le livre »,
 *  cette liste sort de la pile `srd` — et il faudra alors répondre à ce que
 *  devient le tambour. */
export const SRFH_LAYER_IDS = ["srfh-shelving-en"];

export const FH_LAYER_IDS = [
  "fh-species-en", "fh-skills-en", "fh-arcana-en", "fh-feats-en", "fh-spells-en",
  "fh-fiche-en", "fh-lore-en"
];

/** La pile que `document.build.layers` DÉCLARE, réduite à l'un des deux noms
 *  de l'écran — ou `null` si elle ne correspond à AUCUN des deux (un
 *  document composé autrement, hors de ce que ce lot propose). Lue sur le
 *  DOCUMENT, jamais sur la pile montée : c'est ce que le joueur a choisi
 *  pour CE personnage, que `rebuild` l'ait déjà adopté ou non. */
export function currentStack(doc) {
  const layers = (doc && doc.build && Array.isArray(doc.build.layers)) ? doc.build.layers : [];
  const ids = new Set(layers.map((layer) => layer.id));
  /* Les deux piles portent le SRD ET `srfh` ; seules les couches FH les
     distinguent. Le compte se DÉDUIT des listes, il ne s'écrit pas à côté —
     un `5` en dur ici a déjà survécu à l'arrivée de deux couches (lot 77). */
  const pileSrd = [SRD_LAYER_ID, ...SRFH_LAYER_IDS];
  if (ids.size === pileSrd.length && pileSrd.every((id) => ids.has(id))) return "srd";
  /* Le compte se DÉDUIT de la liste, il ne se réécrit pas à côté d'elle :
     un `5` en dur ici a survécu à l'arrivée de deux couches et a fait
     accuser le personnage d'exemple (lot 77). */
  const pileFh = [...pileSrd, ...FH_LAYER_IDS];
  if (ids.size === pileFh.length && pileFh.every((id) => ids.has(id))) return "srdfh";
  return null;
}

/** Les choix du document qui pointent vers un record Fate's Hand
 *  (`ref.id` commence par `fh:`) — dons d'origine, arcanes de destinée…
 *  Ce sont ceux que la confirmation NOMME : passer à SRD les laisse en
 *  place dans `build.choices` (rien n'est effacé), mais ils cessent de se
 *  résoudre tant que les couches FH sont débrayées (mesuré, voir tête de
 *  fichier). `query` sert à afficher le NOM du record, jamais son id nu —
 *  même geste que `skillLabel` (`class-step.mjs`). */
export function fhRefChoices(doc, query) {
  const choices = (doc && doc.build && Array.isArray(doc.build.choices)) ? doc.build.choices : [];
  return choices
    .filter((choice) => choice && choice.ref && typeof choice.ref.id === "string" && choice.ref.id.startsWith("fh:"))
    .map((choice) => {
      const view = query ? query({ kind: choice.ref.kind, id: choice.ref.id }) : null;
      const name = view && view.record ? view.record.name : choice.ref.id;
      /* Certains choix portent un `label` qui est déjà le NOM du record
         (ex. l'arcane de destinée : `label: "The Hermit"`, record `The
         Hermit`), d'autres un `label` qui décrit le SLOT plutôt que le
         record (ex. le don d'origine : `label: "Origin feat"`, record
         `Auspicious (fh)`) — deux formes réelles de `build.choices`,
         aucune des deux inventée ici. N'affiche le préfixe QUE quand il
         ajoute une information que `name` ne porte pas déjà. */
      return choice.label && choice.label !== name ? `${choice.label}: ${name}` : name;
    });
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** Même patron que `textField` (`concept-step.mjs`) : commis sur `change`,
 *  jamais sur chaque frappe (voir sa tête de fichier — `render()` reconstruit
 *  toute la page). Pas de `datalist` ici : `campaign` est un texte libre
 *  SANS suggestion, contrairement à l'alignement de Concept. */
function textField({ id, label, value, maxLength, error, onCommit }) {
  const wrap = el("div", "doc-field");
  const labelNode = el("label", "doc-field-label", [text(label)]);
  labelNode.setAttribute("for", id);
  wrap.append(labelNode);

  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.className = "doc-field-input";
  input.value = typeof value === "string" ? value : "";
  if (typeof maxLength === "number") input.maxLength = maxLength;
  if (error) input.setAttribute("aria-invalid", "true");
  input.addEventListener("change", () => onCommit(input.value));
  wrap.append(input);

  if (error) wrap.append(el("p", "doc-field-error", [text(error)]));
  return wrap;
}

/** Les DEUX RÈGLES — deux lignes à interrupteur, jamais un éditeur de pile.
 *
 *  ⭐ CE NE SONT PAS DES BOUTONS, CE SONT DES SÉLECTEURS — Eric, 2026-08-17 :
 *  *« SRD et SRD + FH sont des sélecteurs, pas des boutons. Mets-les en texte
 *  l'un au-dessus de l'autre avec un bouton on/off ; quand l'un s'allume,
 *  l'autre s'éteint »*. Deux pastilles côte à côte se lisaient comme deux
 *  actions ; deux lignes à bascule se lisent comme un état, ce qu'elles sont.
 *
 *  🔴 EXCLUSIF, ET LE CODE LE TIENT PLUTÔT QUE DE L'ESPÉRER : cliquer la ligne
 *  DÉJÀ allumée ne fait rien. Sans ce test, un second clic sur `SRD` relancerait
 *  la confirmation de bascule pour un changement qui n'a pas lieu — et rien ne
 *  peut éteindre les deux, ce qui laisserait le personnage sans pile.
 *
 *  ⛔ TOUJOURS PAS `role="radio"`, et la raison n'a pas bougé (voir `carnet.mjs`,
 *  tête de fichier) : ce patron promet la navigation par flèches, que rien ici
 *  n'implémente. Poser le rôle sans le clavier romprait un contrat qu'un lecteur
 *  d'écran tient pour acquis — pire que ne rien poser. On reste sur des boutons
 *  à bascule (`aria-pressed`, WAI-ARIA « Toggle Button »), posés par
 *  `markPressed` — le SEUL écrivain de `data-active` du dépôt, et un garde le
 *  tient. */
function renderStackChoice({ stack, onPick }) {
  const wrap = el("div", "universe-stack-block");
  wrap.append(el("h3", null, [text("Rules")]));
  const list = el("div", "bascule-liste");
  list.setAttribute("role", "group");
  list.setAttribute("aria-label", "Rules");
  for (const [value, label] of [["srd", "SRD"], ["srdfh", "SRD + FH"]]) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bascule-ligne";
    markPressed(btn, stack === value);
    btn.append(el("span", "bascule-mot", [text(label)]));
    /* L'interrupteur est DESSINÉ (une piste, un pouce), jamais un glyphe : un
       glyphe change de forme selon la police installée. Il ne porte aucun mot —
       le nom accessible du bouton vient du texte à sa gauche. */
    btn.append(el("span", "bascule-piste", [el("span", "bascule-pouce")]));
    btn.addEventListener("click", () => { if (stack !== value) onPick(value); });
    list.append(btn);
  }
  wrap.append(list);
  if (stack === null) {
    wrap.append(el("p", "doc-field-error", [
      text("This character's layer stack doesn't match either named ruleset — pick one to realign it.")
    ]));
  }
  return wrap;
}

/** LES COLLECTIONS DE FONDS — lot 134, Eric 2026-09-02 : *« On a déjà deux
 *  collections jour nuit, nous en aurons une 3e. Tu vas les stocker pour
 *  qu'on puisse les changer dans le menu. »*
 *
 *  ⭐ UN SÉLECTEUR EXCLUSIF, PAS UNE BASCULE (NORMES §6, et le tableau du
 *  §2325 le range nommément avec `Langue` et `SRD`/`SRD+FH`) : plusieurs
 *  lignes, une seule allumée. Il COPIE `renderStackChoice` à la ligne près —
 *  même liste, même piste, même `markPressed` — parce que c'est la même
 *  espèce d'organe. ⛔ Deux dessins pour une même espèce dans le même écran
 *  serait exactement ce que le double affichage a refusé quinze pixels plus
 *  haut.
 *
 *  🔴 IL EST BÂTI SUR LA LISTE REÇUE, jamais sur des lignes écrites ici :
 *  c'est ce qui fait qu'une troisième collection arrive par les DONNÉES
 *  (`assets/backgrounds.measured.json`) et ne coûte pas une ligne de ce
 *  fichier. Un `for` sur deux paires nommées en dur aurait marché aujourd'hui
 *  et menti au prochain fond.
 *
 *  ⛔ AUCUN BLOC QUAND LA LISTE EST VIDE — registre absent ou illisible : le
 *  builder sert alors la collection de `tokens.css`, et un titre « Background »
 *  suivi de rien serait un réglage qui ment. */
function renderFondChoice({ fonds, fond, onPick }) {
  if (fonds.length === 0) return el("div", "universe-fond-vide");
  const wrap = el("div", "universe-reglages");
  wrap.append(el("h3", null, [text("Background")]));
  const list = el("div", "bascule-liste");
  list.setAttribute("role", "group");
  list.setAttribute("aria-label", "Background");
  for (const collection of fonds) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bascule-ligne";
    markPressed(btn, collection.id === fond);
    btn.append(el("span", "bascule-mot", [text(collection.nom || collection.id)]));
    /* L'interrupteur est DESSINÉ (une piste, un pouce), jamais un glyphe —
       même raison qu'aux règles : un glyphe change de forme selon la police
       installée. Il ne porte aucun mot, le nom accessible vient de sa gauche. */
    btn.append(el("span", "bascule-piste", [el("span", "bascule-pouce")]));
    btn.addEventListener("click", () => { if (collection.id !== fond) onPick(collection.id); });
    list.append(btn);
  }
  wrap.append(list);
  /* ⚠️ CE TEXTE EST LU PAR UN JOUEUR : il dit ce que le réglage fait et ce
     qu'il ne fait PAS — le décor a deux images par collection, et c'est
     l'appareil qui choisit entre elles, pas cette liste. Sans cette phrase, un
     joueur en thème sombre qui choisit « Ruins » croirait avoir choisi
     l'image de nuit qu'il voit, et se demanderait où est passée l'autre. */
  wrap.append(el("p", "universe-note", [
    text("Each background is a pair — one for light, one for dark. Your device picks which of the two you see.")
  ]));
  return wrap;
}

/**
 * @param {object} ctx
 * @param {object} ctx.document            le document `fh-char/1` courant
 * @param {Function} ctx.query             `layers.verbs.query`
 * @param {object} [ctx.fieldErrors]       le dernier refus par champ (`{campaign}`)
 * @param {string|null} [ctx.pendingStack] `"srd"` si une confirmation de passage à SRD est en attente, sinon `null`
 * @param {(action: object) => void} onAction
 *   `{kind:"requestLayerStack", value}` (clic sur un des deux boutons — `shell.mjs`
 *   décide s'il faut confirmer) · `{kind:"confirmLayerStack"}` ·
 *   `{kind:"cancelLayerStack"}` · `{kind:"describe", field:"campaign", value}`.
 */
export function renderUniverseStep(ctx, onAction) {
  const doc = ctx.document;
  const query = ctx.query;
  const errors = ctx.fieldErrors || {};
  /* `dalle-intermediaire` — le voile à 50 % qu'Eric a demandé, pris à la
     matrice des dalles (lot 59) et jamais réécrit en couleur ici. */
  const section = el("section", "universe-step dalle-intermediaire");
  /* Il DIT son format, comme les dalles du parcours : un écran qui ne le
     déclare pas oblige à le déduire, et une déduction se trompe. */
  section.dataset.objet = "dalle";
  /* Le pied de la coquille s'accroche au bas de CETTE dalle (Eric, 2026-08-17 :
     *« DONE en bas de dalle, centré »*). Une DÉCLARATION, pas une fabrication :
     l'écran ne produit ni `BACK` ni `DONE` — voir `poserLaSortie`, shell.mjs. */
  section.dataset.sortieIci = "true";

  section.append(renderStackChoice({
    stack: currentStack(doc),
    onPick: (value) => onAction({ kind: "requestLayerStack", value })
  }));

  if (ctx.pendingStack) {
    const affected = fhRefChoices(doc, query);
    section.append(renderConfirmDialog({
      title: affected.length > 0
        ? "Switching to SRD will stop applying these Fate's Hand picks (they stay saved, and resume as soon as you switch back to SRD + FH):"
        : "Switching to SRD may also pause Fate's Hand skill grants tied to species/class — nothing is deleted, and switching back restores them.",
      items: affected,
      confirmLabel: "Switch to SRD",
      cancelLabel: "Keep SRD + FH",
      onConfirm: () => onAction({ kind: "confirmLayerStack" }),
      onCancel: () => onAction({ kind: "cancelLayerStack" })
    }));
  }

  section.append(textField({
    id: "universe-campaign",
    label: "Campaign codename (optional)",
    value: doc.campaign,
    maxLength: 80,
    error: errors.campaign,
    onCommit: (value) => onAction({ kind: "describe", field: "campaign", value })
  }));

  /* ── LA LANGUE DE LA FICHE ET LES UNITÉS — AFFICHÉES, PAS ÉDITABLES ────
     Mesuré (§1 de la commande, étendu ici) : `lang` et `units` sont
     REQUIS par `fh-char/1` (`required`), donc `describableFields` — qui ne
     retient que les propriétés RACINE FACULTATIVES — les exclut par
     construction (`src/doc/schema.mjs`). Ni `rename` ni `describe` ne
     peuvent les écrire, et aucun troisième écrivain n'existe : `create` les
     pose une fois, à la naissance, et rien depuis ne les réécrit (voir
     INVENTAIRE-LOT-54.md, « ce qui m'a surpris » — trou déclaré, pas
     contourné par un nouveau verbe non mandaté par cette commande). */
  const locale = el("div", "universe-locale-block");
  locale.append(el("h3", null, [text("Sheet language & units")]));
  const dl = el("dl", "universe-locale-list");
  const row = (labelText, valueText) => {
    const r = el("div", "universe-locale-row");
    r.append(el("dt", null, [text(labelText)]));
    r.append(el("dd", null, [text(valueText)]));
    return r;
  };
  dl.append(row("Language", doc.lang === "en" ? "English" : doc.lang === "fr" ? "French" : String(doc.lang)));
  const units = doc.units || {};
  dl.append(row("Distance", units.distance === "ft" ? "feet" : units.distance === "m" ? "meters" : String(units.distance)));
  dl.append(row("Weight", units.weight === "lb" ? "pounds" : units.weight === "kg" ? "kilograms" : String(units.weight)));
  locale.append(dl);
  /* ⚠️ CE TEXTE EST LU PAR UN JOUEUR, PAS PAR LE CHANTIER. La première
     rédaction renvoyait à `INVENTAIRE-LOT-54.md` — un document interne — dans
     l'interface publiée ; trouvé à l'œil le 2026-08-14, invisible aux 876
     tests. La référence de chantier reste dans le COMMENTAIRE ci-dessus, où
     elle sert ; elle n'a rien à faire dans la page. */
  locale.append(el("p", "doc-field-note", [
    text("Set when the character is created; not editable here.")
  ]));
  section.append(locale);

  /* ══ L'INTERRUPTEUR DU TUTORIEL — Eric, 2026-08-19 ═══════════════════════
     *« Il est possible de on/off le tutoriel dans le menu. »*

     🔴 C'EST LA SECONDE MOITIÉ DE `Turn tutorials off`. Ce bouton-là éteint
     tout d'un geste, depuis n'importe quelle dalle ; il fallait un endroit
     nommé pour le rallumer autrement qu'en cherchant le « ? ». Le Menu est cet
     endroit — c'est là que vivent les réglages.

     ⛔ CE N'EST PAS UNE DONNÉE DE PERSONNAGE, et l'écran ne le sait pas non
     plus : il reçoit l'état et rend un geste. Le drapeau vit dans
     `tutoriel.mjs`, et personne d'autre ne le lit. */
  const reglages = el("div", "universe-reglages", []);
  reglages.append(el("h3", null, [text("Tutorials")]));
  const etat = ctx.tutoriel === true;
  const bascule = document.createElement("button");
  bascule.type = "button";
  bascule.className = "universe-bascule";
  bascule.dataset.actif = String(etat);
  /* ⚠️ L'ÉTAT EST PRONONCÉ, pas seulement peint : `aria-pressed` dit à un
     lecteur d'écran ce qu'une pastille colorée ne dit qu'à l'œil. */
  bascule.setAttribute("aria-pressed", String(etat));
  bascule.append(text(etat ? "On" : "Off"));
  bascule.addEventListener("click", () => onAction({ kind: "tutoBascule", value: !etat }));
  reglages.append(bascule);
  reglages.append(el("p", "universe-note", [
    text(etat
      ? "Each step opens with a short guide. The ? in the corner of a panel brings it back."
      : "Guides are off everywhere. Turn them back on here, or with the ? in the corner of any panel.")
  ]));
  section.append(reglages);

  /* ══ L'INTERRUPTEUR DU DOUBLE AFFICHAGE — Eric, 2026-09-02 ═══════════════
     Croquis `2026-09-02-double-view-belt-deroule.jpg` : deux panneaux du
     builder côte à côte, un seul belt déroulé au-dessus. Eric : *« accessible
     depuis le Menu »*, et le second écran est *« par défaut Menu, mais
     configurable »*.

     ⭐ IL COPIE `Tutorials`, ET C'EST VOULU : c'est la même espèce d'organe —
     une BASCULE SIMPLE, dont NORMES §6 a ratifié la forme le 26/08 (*« bouton
     On/Off, 72 × 44, liseré vert allumé »*). ⛔ Lui donner la piste-et-pouce du
     SÉLECTEUR EXCLUSIF ferait deux dessins pour une même espèce dans le même
     écran, à quinze pixels l'un de l'autre.

     🚪 LA PORTE DE LARGEUR — il est PRÉSENT mais éteint et GRISÉ quand la
     fenêtre ne porte pas deux panneaux à l'échelle 1 (758 × 560 px, mesuré).
     ⛔ Ni caché, ni retiré : un réglage qui disparaît laisse croire qu'il
     n'existe pas, et le joueur ne saura pas qu'agrandir sa fenêtre le lui
     rend. Il DIT pourquoi il dort, à l'endroit où on le cherche.
     ⚠️ `disabled` ET la note : le gris seul dirait « éteint », pas « pas ici ». */
  const vue = el("div", "universe-reglages", []);
  vue.append(el("h3", null, [text("Double view")]));
  const possible = ctx.vueDoublePossible !== false;
  const vueEtat = ctx.vueDouble === true;
  const vueBascule = document.createElement("button");
  vueBascule.type = "button";
  vueBascule.className = "universe-bascule";
  vueBascule.dataset.actif = String(vueEtat && possible);
  vueBascule.setAttribute("aria-pressed", String(vueEtat && possible));
  vueBascule.disabled = !possible;
  vueBascule.append(text(vueEtat && possible ? "On" : "Off"));
  vueBascule.addEventListener("click", () => onAction({ kind: "vueBascule", value: !vueEtat }));
  vue.append(vueBascule);
  vue.append(el("p", "universe-note", [
    text(!possible
      ? "This window is too small for two panels. Make it wider — at least two panels across — and this comes back."
      : vueEtat
        ? "Two panels side by side, one belt across the top. Click a panel to work in it; the belt moves the panel you are working in."
        : "Show a second panel beside this one — the menu, or any other step. Needs a window wide enough for two panels.")
  ]));
  section.append(vue);

  section.append(renderFondChoice({
    fonds: Array.isArray(ctx.fonds) ? ctx.fonds : [],
    fond: ctx.fond,
    onPick: (value) => onAction({ kind: "fondChoisi", value })
  }));

  /* ⚖️ LA RAMPE « INTERFACE SIZE » A VÉCU DU 30/08 AU 02/09 — retirée au lot
     118. Eric, 2026-09-02 : *« si l'auto fait bien son travail, effectivement
     les boutons sont obsolètes, et le redimensionnement peut être fait à la
     main sur la fenêtre du navigateur »*. Depuis la règle sacrée (31/08),
     l'échelle suit la fenêtre en continu et rend déjà le plus grand facteur
     qu'elle porte : un cran choisi ici ne pouvait que RAPETISSER le builder —
     mesuré à 1366 × 1024, Auto ×1,83 et « Large » ×1,25. Six boutons, dont
     quatre grisés en permanence, pour un réglage qui mentait. Ce que le
     joueur veut plus grand ou plus petit, il l'obtient en redimensionnant sa
     fenêtre ; sur téléphone et tablette, l'appareil décide. */

  /* ══ OÙ VIT CE PERSONNAGE — 2026-08-20 ═══════════════════════════════════
     Eric : *« Un perso est enregistré dans le navigateur de tout le monde, et
     disparaît s'il n'est pas enregistré s'il y a un reset. »*

     🔴 CE BLOC EXISTE PARCE QUE LA SAUVEGARDE EST INVISIBLE. Le builder garde
     désormais le personnage tout seul, sans bouton et sans message — et une
     sauvegarde qu'on ne voit pas est une sauvegarde en laquelle on ne peut pas
     avoir confiance. Pire : le jour où elle échoue (mode privé, quota plein),
     le joueur travaillerait des heures en croyant être gardé. Le Menu dit donc
     l'état, toujours, dans les deux sens.

     ⚠️ ET IL NOMME LA LIMITE PLUTÔT QUE DE LA LAISSER DÉCOUVRIR : ce
     personnage vit dans CE navigateur et meurt avec ses données de site.
     La seule copie durable est l'export, qui existe déjà sur la fiche.

     ⛔ AUCUN GESTE ICI, ET C'EST MESURÉ : il n'y a pas de bouton « nouveau
     personnage », parce que le builder n'a AUCUN personnage vierge — il naît
     du personnage d'exemple commité. Offrir « recommencer » qui rend un
     Magicien tout fait serait un bouton qui ment. Le geste viendra avec le
     personnage vierge, pas avant (loi §0.6 : pas de code mort, pas de porte
     qui ne mène pas là où elle dit). */
  const memoire = ctx.memoire || { ok: true };
  const ou = el("div", "universe-memoire");
  ou.append(el("h3", null, [text("This character")]));
  ou.append(el("p", "universe-note", [text(memoire.ok
    ? "Kept in this browser as you go — reopen the page and you carry on where you left off."
    : `Not being saved: ${memoire.raison}. Export your character from the sheet to keep it.`)]));
  ou.dataset.garde = String(Boolean(memoire.ok));
  /* La limite se dit à qui EST gardé — celui qui ne l'est pas vient de lire
     pire, et lui répéter la mise en garde noierait son message. */
  if (memoire.ok) {
    ou.append(el("p", "doc-field-note", [
      text("Clearing this browser's site data erases it. Export from the sheet to keep a copy.")
    ]));
  }
  /* ⚠️ UNE PERTE SE DIT, ELLE NE SE DEVINE PAS. Ce message survit à la
     première sauvegarde réussie : sans lui, un joueur dont le personnage gardé
     est illisible repartirait de l'exemple en croyant n'avoir jamais rien
     construit. */
  if (ctx.memoireIgnoree) {
    ou.append(el("p", "doc-field-error", [
      text(`A character was saved here but could not be reopened: ${ctx.memoireIgnoree}. This one starts fresh.`)
    ]));
  }
  section.append(ou);

  return section;
}
