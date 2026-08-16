/* ══ L'ÉTAPE CONCEPT — lot 54 ═══════════════════════════════════════════
   Le premier des deux derniers placeholders. Trois champs, à la racine du
   document : le nom (`document.name`, REQUIS par le schéma), le genre et
   l'alignement (`document.gender`/`document.alignment`, FACULTATIFS, texte
   libre — commande §2a).

   ── CE QUI ÉCRIT CES CHAMPS, ET POURQUOI CE N'EST PAS `doc.rename`/
   `doc.describe` DIRECTEMENT ────────────────────────────────────────────
   Le bloc `doc` REFUSE de se construire sans magasin (`store.mjs:83`), et le
   navigateur n'en a aucun (§1 de la commande — arbitrage ferme de
   l'architecte : pas de faux magasin en mémoire). `rename`/`describe` sont
   PURS (ni magasin ni bus, lots 47/48) mais vivaient enfermés dans la
   fermeture de `createDoc`. `src/doc/writers.mjs` (lot 54) les rend
   importables SEULS : `ctx.writers` est `createDocWriters({schema})`,
   construit UNE FOIS au boot (`shell.mjs`), jamais un `createDoc` ici — ce
   fichier n'en importe aucun (§3, test 7 de la commande, gardé par
   `tests/ui-writers.test.mjs`).

   ── L'ALIGNEMENT : NEUF SUGGESTIONS, ÉCRITES ICI — PAS DANS LE SCHÉMA
   (commande §2a, ⭐) ─────────────────────────────────────────────────────
   `identity.creatureType` a le même statut : « une chaîne libre EXPRÈS ».
   `<input list="…">` + `<datalist>` PROPOSE les neuf alignements SRD (même
   orthographe que `layers/srd-5.2.1-en.layer.json` : « Neutral », pas
   « True Neutral ») sans jamais les IMPOSER — taper autre chose
   (`Chaotic Good (mostly)`) reste possible, et `describe` ne le refuse pas
   (aucune `enum` au schéma).

   ── COMMIT SUR `change`, PAS SUR CHAQUE FRAPPE ──────────────────────────
   Même patron que `numberField` (`equipment-step.mjs`) : `render()`
   RECONSTRUIT toute la page (`app.innerHTML = ""`), donc un commit sur
   `input` perdrait le focus et la position du curseur à chaque lettre. Un
   champ libre commet sur `change` (perte de focus = validation), jamais
   avant.

   ── LE REFUS EST BRUYANT, JAMAIS UN SILENCE ─────────────────────────────
   `rename`/`describe` VALIDENT (décision D3 du bloc `doc`) : un nom vide,
   un nom de plus de 200 caractères, un genre/alignement de plus de 60
   caractères sont des refus NOMMÉS. `shell.mjs` les attrape et les pose
   dans `ctx.fieldErrors` — ce module les AFFICHE, il ne les invente ni ne
   les reformule (même discipline que `decisionRefusalWord`, `carnet.mjs`).
   Un refus laisse le document INCHANGÉ : le champ revient à sa dernière
   valeur valide au prochain rendu — jamais une valeur à moitié écrite. */

const ALIGNMENTS = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil"
];

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** Un champ texte libre, commis sur `change` — voir la tête de fichier.
 *  `datalistId`/`datalistOptions` sont optionnels (seul l'alignement les
 *  emploie) : un `<datalist>` SUGGÈRE, il ne restreint jamais ce que
 *  `<input>` accepte. */
function textField({ id, label, value, maxLength, ariaDescribedBy, error, datalistId, datalistOptions, onCommit }) {
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
  if (ariaDescribedBy) input.setAttribute("aria-describedby", ariaDescribedBy);
  if (error) input.setAttribute("aria-invalid", "true");
  if (datalistId) input.setAttribute("list", datalistId);
  input.addEventListener("change", () => onCommit(input.value));
  wrap.append(input);

  if (datalistId && Array.isArray(datalistOptions)) {
    const list = document.createElement("datalist");
    list.id = datalistId;
    for (const option of datalistOptions) {
      const opt = document.createElement("option");
      opt.value = option;
      list.append(opt);
    }
    wrap.append(list);
  }

  if (error) {
    const errorNode = el("p", "doc-field-error", [text(error)]);
    if (ariaDescribedBy) errorNode.id = ariaDescribedBy;
    errorNode.setAttribute("role", "alert");
    wrap.append(errorNode);
  }

  return wrap;
}

/**
 * @param {object} ctx
 * @param {object} ctx.document      le document `fh-char/1` courant (brouillon ou complet)
 * @param {object} ctx.writers       `createDocWriters({schema})` — `{rename, describe}`, PUR, aucun magasin
 * @param {object} [ctx.fieldErrors] le dernier refus par champ (`{name, gender, alignment}`), ou `null`/absent
 * @param {(action: {kind:"rename", name:string}|{kind:"describe", field:string, value:string}) => void} onAction
 */
export function renderConceptStep(ctx, onAction) {
  const doc = ctx.document;
  const errors = ctx.fieldErrors || {};
  /* `dalle-intermediaire` — le voile à 50 %, pris à la matrice des dalles
     (lot 59) et jamais réécrit en couleur ici. */
  const section = el("section", "concept-step dalle-intermediaire");
  /* Le pied de la coquille s'accroche au bas de cette dalle (Eric, 2026-08-17 :
     *« Concept — DONE centré en bas au milieu »*). Une DÉCLARATION, pas une
     fabrication : voir `poserLaSortie` dans `shell.mjs`. */
  section.dataset.sortieIci = "true";

  section.append(textField({
    id: "concept-name",
    label: "Name",
    value: doc.name,
    maxLength: 200,
    error: errors.name,
    ariaDescribedBy: errors.name ? "concept-name-error" : null,
    onCommit: (value) => onAction({ kind: "rename", name: value })
  }));

  section.append(textField({
    id: "concept-gender",
    label: "Gender (optional)",
    value: doc.gender,
    maxLength: 60,
    error: errors.gender,
    ariaDescribedBy: errors.gender ? "concept-gender-error" : null,
    onCommit: (value) => onAction({ kind: "describe", field: "gender", value })
  }));

  section.append(textField({
    id: "concept-alignment",
    label: "Alignment (optional)",
    value: doc.alignment,
    maxLength: 60,
    error: errors.alignment,
    ariaDescribedBy: errors.alignment ? "concept-alignment-error" : null,
    datalistId: "concept-alignment-options",
    datalistOptions: ALIGNMENTS,
    onCommit: (value) => onAction({ kind: "describe", field: "alignment", value })
  }));

  return section;
}

export { ALIGNMENTS };
