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

import { renderConfirmDialog } from "./confirm.mjs?v=19";
import { markPressed } from "./carnet.mjs?v=19";

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
export const FH_LAYER_IDS = [
  "fh-species-en", "fh-skills-en", "fh-arcana-en", "fh-feats-en", "fh-fiche-en", "fh-lore-en"
];

/** La pile que `document.build.layers` DÉCLARE, réduite à l'un des deux noms
 *  de l'écran — ou `null` si elle ne correspond à AUCUN des deux (un
 *  document composé autrement, hors de ce que ce lot propose). Lue sur le
 *  DOCUMENT, jamais sur la pile montée : c'est ce que le joueur a choisi
 *  pour CE personnage, que `rebuild` l'ait déjà adopté ou non. */
export function currentStack(doc) {
  const layers = (doc && doc.build && Array.isArray(doc.build.layers)) ? doc.build.layers : [];
  const ids = new Set(layers.map((layer) => layer.id));
  if (ids.size === 1 && ids.has(SRD_LAYER_ID)) return "srd";
  /* Le compte se DÉDUIT de la liste, il ne se réécrit pas à côté d'elle :
     un `5` en dur ici a survécu à l'arrivée de deux couches et a fait
     accuser le personnage d'exemple (lot 77). */
  const pileFh = [SRD_LAYER_ID, ...FH_LAYER_IDS];
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

/** Les DEUX boutons nommés — jamais un éditeur de pile. Réemploie
 *  `.record-list`/`.record-option` (`carnet.mjs`/`shell.css`) : même
 *  famille visuelle qu'un choix de classe/espèce, aucun jeton de plus. */
function renderStackChoice({ stack, onPick }) {
  const wrap = el("div", "universe-stack-block");
  wrap.append(el("h3", null, [text("Rules")]));
  const list = el("div", "record-list");
  for (const [value, label] of [["srd", "SRD"], ["srdfh", "SRD + FH"]]) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "record-option";
    markPressed(btn, stack === value);
    btn.textContent = label;
    btn.addEventListener("click", () => onPick(value));
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
  const section = el("section", "universe-step");

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

  return section;
}
