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


import { renderChoixGlisses } from "./glisser.mjs?v=190";
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
/* ══ LES DEUX LISTES DÉROULANTES — Eric, 2026-08-19 ═════════════════════════
   *« Gender dropdown, champ à largeur limitée à 80/100 pixels. Alignment
   dropdown limitée à 80/100 pixels, bouton rules. »*

   ⭐ POURQUOI UN `<select>` ET PLUS UN `<input list>` : un champ libre invitait
   à écrire n'importe quoi dans un champ qui n'a que neuf réponses, et la
   `datalist` ne l'empêchait pas — elle SUGGÉRAIT. Le menu, lui, décide.

   ⚠️ ET LA VALEUR DÉJÀ ÉCRITE SURVIT, MÊME HORS LISTE. Un personnage sauvé
   avant ce lot peut porter « chaotic-ish » : la restreindre d'autorité
   l'effacerait au premier rendu, en silence. Elle entre donc dans le menu
   comme une option de plus, et le joueur la remplace s'il le veut. */
const GENRES = ["Man", "Woman", "Something else"];

/* ══ UN CHAMP DE DOCUMENT, RENDU COMME UN CHOIX GLISSÉ — Eric, 2026-08-19 ═══
   *« le drop-down c'est moche. Je préfère avoir du drag and drop quand il y a
   plus de deux choix, on va généraliser ça. »*

   ⛔ LA DIFFICULTÉ EST RÉELLE : `renderChoixGlisses` lit un PLAN du carnet
   (`answered`, `expected`, `options`, `selected`). Or le genre et l'alignement
   ne sont pas des choix de règle — ce sont des champs du document, écrits par
   `describe`. Aucun plan ne les décrit, et il ne DOIT pas y en avoir : le
   carnet juge des règles, pas une préférence de fiche.

   ⭐ ON DONNE DONC AU CHAMP LA FORME D'UN PLAN, ici, en local — et on traduit
   les gestes de l'organe en `describe`. L'organe partagé n'apprend rien du
   document, le document n'apprend rien du carnet, et les deux se rencontrent
   sur dix lignes qu'on lit d'un coup.

   ⚠️ LA RÈGLE D'ERIC A UN SEUIL : *« quand il y a plus de deux choix »*. Un
   champ à deux réponses n'a rien à gagner à un vivier — il a deux boutons. */
function champGlisse({ id, label, value, options, field, onAction }) {
  const courant = typeof value === "string" ? value : "";
  /* La valeur déjà écrite survit même hors liste : un personnage sauvé avant
     ce lot peut porter « Chaotic Good (mostly) », et la restreindre d'autorité
     l'effacerait en silence. */
  const liste = courant.length > 0 && !options.includes(courant) ? [...options, courant] : options;

  const plan = {
    path: id, status: courant ? "answered" : "pending",
    answered: courant ? 1 : 0, expected: 1, options: liste, selected: courant ? [courant] : []
  };
  const slot = { path: id, index: 0, options: liste, selected: courant ? [courant] : [], lock: null };

  /* LA TRADUCTION, ET C'EST TOUTE L'ADAPTATION : `set` écrit le champ, `clear`
     l'efface. Rien d'autre ne passe. */
  const relais = (action) => {
    if (action.kind === "set") onAction({ kind: "describe", field, value: action.value });
    else if (action.kind === "clear") onAction({ kind: "describe", field, value: "" });
  };

  const bloc = renderChoixGlisses({ plan, slots: [slot], titre: label, mot: label, onAction: relais });
  const enveloppe = el("div", "doc-field", []);
  if (bloc) enveloppe.append(bloc);
  return enveloppe;
}

function selectField({ id, label, value, options, onCommit, extra }) {
  const wrap = el("div", "doc-field", []);
  const lab = document.createElement("label");
  lab.className = "doc-field-label";
  lab.htmlFor = id;
  lab.append(document.createTextNode(label));
  wrap.append(lab);

  const rangee = el("div", "doc-field-rangee", []);
  const select = document.createElement("select");
  select.id = id;
  select.className = "doc-field-select";

  const courant = typeof value === "string" ? value : "";
  /* Le vide est une réponse : ces deux champs sont facultatifs. */
  const liste = ["", ...options];
  if (courant.length > 0 && !liste.includes(courant)) liste.push(courant);
  for (const option of liste) {
    const node = document.createElement("option");
    node.value = option;
    node.append(document.createTextNode(option === "" ? "—" : option));
    if (option === courant) node.selected = true;
    select.append(node);
  }
  /* ⚠️ LA VALEUR EST POSÉE EXPLICITEMENT, en plus de l'option `selected`. Un
     navigateur déduit l'une de l'autre ; le stub DOM de la suite, non — et
     c'est lui qui avait raison de le signaler : compter sur une déduction du
     moteur de rendu, c'est ne pas dire ce qu'on veut. */
  select.value = courant;
  select.addEventListener("change", () => onCommit(select.value));
  rangee.append(select);
  if (extra) rangee.append(extra);
  wrap.append(rangee);
  return wrap;
}

export function renderConceptStep(ctx, onAction) {
  const doc = ctx.document;
  const errors = ctx.fieldErrors || {};
  /* `dalle-intermediaire` — le voile à 50 %, pris à la matrice des dalles
     (lot 59) et jamais réécrit en couleur ici. */
  const section = el("section", "concept-step dalle-intermediaire");
  /* Il DIT son format, comme les dalles du parcours : un écran qui ne le
     déclare pas oblige à le déduire, et une déduction se trompe. */
  section.dataset.objet = "dalle";
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

  section.append(champGlisse({
    id: "concept-gender", label: "Gender (optional)",
    value: doc.gender, options: GENRES, field: "gender", onAction
  }));

  /* ⏳ LE BOUTON `Rules` OUVRE UN POPUP — CE N'EST PAS SA FORME FINALE, ET
     ELLE EST DÉJÀ DÉCIDÉE. Eric, 2026-08-19, mis de côté par lui-même pour
     plus tard :

       *« rules devra à terme détacher un chapitre entier du player et
       l'afficher en FS avec un bouton de sortie, mais aussi un bouton qui
       permet d'ouvrir le player dans une autre fenêtre »*, et — précision du
       même jour — *« donc rules on recouvre tout »*.

     Donc : un chapitre ENTIER, en **FS**, qui **recouvre toute la scène**,
     avec DEUX portes — sortir (et retomber exactement ici), ou ouvrir le
     Player Companion dans une autre fenêtre.

     ⛔ CE QUI MANQUE POUR L'ÉCRIRE, et c'est pour ça qu'il attend : il
     n'existe aujourd'hui AUCUN chemin hors du builder (question n°1 des
     questions ouvertes — *« vers quoi exactement ? »*), et rien ne sait
     détacher un chapitre du site. Le popup est un pis-aller ASSUMÉ : un
     bouton qui dit la règle vaut mieux qu'un bouton mort ou qu'un lien qui
     perd la place du joueur. */
  const regles = document.createElement("button");
  regles.type = "button";
  regles.className = "doc-field-regles";
  regles.append(document.createTextNode("Rules"));
  regles.addEventListener("click", () => onAction({
    kind: "popup",
    texte: "Alignment is two axes: how you treat law and order, and how you treat others. " +
      "Nothing in Fate's Hand forces you to play it — it is a description, not a leash."
  }));

  const alignement = champGlisse({
    id: "concept-alignment", label: "Alignment (optional)",
    value: doc.alignment, options: ALIGNMENTS, field: "alignment", onAction
  });
  /* Le bouton `Rules` reste avec son champ : il explique CE choix-là. */
  alignement.append(regles);
  section.append(alignement);

  return section;
}

export { ALIGNMENTS };
