/* ══ L'ÉTAPE EQUIPMENT — lot 49 ═══════════════════════════════════════
   Même loi que Class/Species/Compétences/Inheritance : le moteur prononce,
   l'écran affiche. ZÉRO règle de jeu ici — ce fichier ne calcule ni un
   total, ni un poids, ni une classe d'armure : `derive.mjs:404-445` sait
   déjà tout faire dès qu'une ligne `gear[N]` (ref + quantity + equipped) et
   les quatre clefs de `currency` sont posées (§0.2 de la commande, mesuré).

   ── ⛔ AUCUN PLAN `decisions[]` POUR `gear`/`currency` (mesuré, comme
   Abilities/Destiny) — `decisions.mjs` ne publie rien sous ces deux
   racines : ce fichier lit et pose directement dans
   `document.build.choices`, jamais un `planAt(decisions, "gear")` qui
   n'existerait pas.

   ── ⭐ LE CHOIX D'ARCHITECTE, RATIFIÉ (commande §1a, Eric 2026-08-13) —
   L'ÉCRAN AFFICHE LA PHRASE DE LA CLASSE TELLE QUELLE, IL NE LA STRUCTURE
   PAS. `data.starting_equipment` est UNE SEULE CHAÎNE DE PROSE sur les
   douze classes (« Choose A or B: … », le Fighter en a TROIS — « Choose A,
   B, or C » — §0.4 de la commande, mesuré) ; la structurer en boutons
   créerait une DEUXIÈME écriture de la même règle, à côté du texte SRD, et
   deux copies divergent sauf si quelque chose les compare. Le joueur COMPOSE
   son sac lui-même avec le chercheur plus bas, en lisant la phrase.

   ── LA BOURSE (commande §1b/§1c) — Les 50 PO ADDENDUMS §4 sont une RÈGLE
   que le moteur ne connaît pas : c'est CET ÉCRAN qui les pose, jamais
   automatiquement (`shell.mjs`, action `addInheritedPurse` — un CLIC, pas un
   effet de rendu, pour ne jamais réécrire une bourse déjà dépensée). Le
   nombre est nommé UNE FOIS (`INHERITED_PURSE_GP`, plus bas), jamais un `50`
   nu dans une fonction de rendu.

   ── 🔴 LE PIÈGE DE LA BOURSE, RENDU VISIBLE, PAS CONTOURNÉ — `CURRENCY_KEYS`
   (importé de `src/build/index.mjs`, JAMAIS recopié : même liste que
   `derive.mjs`, zéro divergence possible) vaut quatre clefs, pas d'`ep`.
   Poser `currency.gp` seul ne produit AUCUNE bourse dérivée
   (`derive.mjs:442`) — cet écran ne le cache pas : les quatre champs sont
   TOUJOURS visibles, et `resolved.currency` ne s'affiche QUE quand le
   moteur l'a vraiment produit.

   ── ⚠️ DISCIPLINE DE FICHIER : `document` (le personnage brut, dans les
   `ctx`) SHADOWS le `document` DOM global à l'intérieur des fonctions qui le
   reçoivent — même geste qu'`abilities-step.mjs`/`inheritance-step.mjs`.
   AUCUNE fonction qui reçoit ce paramètre n'appelle `document.createElement`
   directement : tout passe par `el`/`text`/`button`/`numberField`/
   `searchField`, définis en tête de fichier, dont le PROPRE `document`
   référencé est toujours le DOM global (portée de module, jamais ombragée). */

import { renderPicker } from "./carnet.mjs?v=173";
import { CURRENCY_KEYS } from "../../src/build/index.mjs?v=173";
import { swapContent } from "./socle.mjs?v=173";

/* §0.3 de la commande, mesuré : 82 `gear` + 38 `weapon` + 13 `armor` = 133
   records. Bookkeeping d'ÉCRAN (quels genres ce chercheur interroge) — pas
   une règle de jeu : `derive.mjs` accepte n'importe quel `ref` valide sous
   `gear[n]`, cette liste ne fait que dire à QUI `query({kind})` est posée. */
const EQUIPMENT_RECORD_KINDS = ["gear", "weapon", "armor"];

/* ADDENDUMS §4 (Eric, 2026-08-13), ratifié §0.1 de la commande : « Le
   paquet de la CLASSE, plus une bourse de 50 PO. » HÉRITÉ, pas inventé :
   c'est l'option B des quatre arrière-plans SRD supprimés (« … or 50 GP »).
   Le paquet de classe porte SON PROPRE or (le Barbare option A : « … and 15
   GP ») et les deux s'ADDITIONNENT — aucune collision, vérifié §0.1. Nommé
   UNE SEULE FOIS, ici — jamais un `50` nu au milieu d'une fonction de rendu
   (§1c de la commande). */
export const INHERITED_PURSE_GP = 50;

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function button(label, className, onClick, ariaLabel) {
  const b = document.createElement("button");
  b.type = "button";
  if (className) b.className = className;
  b.textContent = label;
  if (ariaLabel) b.setAttribute("aria-label", ariaLabel);
  b.addEventListener("click", onClick);
  return b;
}

function numberField({ value, min, className, ariaLabel, onChange }) {
  const input = document.createElement("input");
  input.type = "number";
  if (min !== undefined) input.min = String(min);
  if (className) input.className = className;
  input.value = Number.isInteger(value) ? String(value) : "";
  if (ariaLabel) input.setAttribute("aria-label", ariaLabel);
  input.addEventListener("change", () => onChange(input.value));
  return input;
}

function searchField({ placeholder, className, ariaLabel, onInput }) {
  const input = document.createElement("input");
  input.type = "search";
  if (className) input.className = className;
  if (placeholder) input.placeholder = placeholder;
  if (ariaLabel) input.setAttribute("aria-label", ariaLabel);
  input.addEventListener("input", () => onInput(input.value));
  return input;
}

/* ══ LA LECTURE BRUTE, HORS `decisions[]` (aucun plan pour gear/currency) ══ */

/** Le choix `class` brut, lu dans `document.build.choices` — jamais
 *  `resolved` (cette lecture doit marcher MÊME si la dérivation entière n'a
 *  pas encore réussi, test 8 de la commande : « une classe non choisie »). */
function currentClassRef(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === "class");
  return entry && entry.ref ? entry.ref : null;
}

/** Les lignes `gear[N]` déjà posées, indexées par N — aucun plan
 *  `decisions[]` ne les republie (mesuré : `gear` n'apparaît nulle part dans
 *  `decisions.mjs`). Une ligne peut être INCOMPLÈTE (ref sans quantity, ou
 *  l'inverse) : `derive.mjs` la déclare et la saute (`underived.gear-line-
 *  incomplete`) plutôt que de la refuser — ce lecteur rend donc TOUT ce qui
 *  existe, complet ou non, et laisse `renderGearRow` le dire. */
export function currentGearLines(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const byIndex = new Map();
  const pathRe = /^gear\[(\d+)\](?:\.(quantity|equipped))?$/;
  for (const choice of choices) {
    const match = typeof choice.path === "string" ? pathRe.exec(choice.path) : null;
    if (!match) continue;
    const index = Number(match[1]);
    if (!byIndex.has(index)) byIndex.set(index, { index });
    const line = byIndex.get(index);
    if (match[2] === "quantity") line.quantity = choice.value;
    else if (match[2] === "equipped") line.equipped = choice.value;
    else if (choice.ref) line.ref = choice.ref;
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}

/** Le prochain index `gear[N]` libre — jamais réutilisé après un retrait
 *  (un index qui a existé ne redevient pas anonyme, même loi que
 *  `emptyAbilityAssign`/`ABILITY_METHODS` : une carte simple, exportée pour
 *  que `shell.mjs` l'importe plutôt que d'en tenir une seconde copie). */
export function nextGearIndex(document) {
  return currentGearLines(document).reduce((max, line) => Math.max(max, line.index + 1), 0);
}

/** Les quatre clefs de `currency.*` déjà posées, lues brutes — une clef
 *  absente n'apparaît pas dans l'objet rendu (jamais un `0` inventé ici :
 *  c'est `resolved.currency` qui dit si la bourse est complète, ce lecteur
 *  ne fait que recopier ce que le joueur a VRAIMENT tapé). */
export function currentCurrency(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const out = {};
  for (const key of CURRENCY_KEYS) {
    const entry = choices.find((c) => c.path === `currency.${key}`);
    if (entry) out[key] = entry.value;
  }
  return out;
}

function recordLabel(view) {
  return view && view.record && typeof view.record.name === "string" ? view.record.name : null;
}
function recordCost(view) {
  const data = view && view.record && view.record.data;
  return data && typeof data.cost === "string" ? data.cost : null;
}
function recordWeight(view) {
  const data = view && view.record && view.record.data;
  return data && typeof data.weight === "string" ? data.weight : null;
}

/** Les 133 records — `gear` ∪ `weapon` ∪ `armor`, TELS QUE `query({kind})`
 *  les rend (aucune liste composée à la main). */
function catalogue(query) {
  const items = [];
  for (const kind of EQUIPMENT_RECORD_KINDS) {
    for (const view of query({ kind }) || []) items.push({ kind, view });
  }
  return items;
}

/* ══ LA PHRASE DE CLASSE (§1a) ═══════════════════════════════════════════
   AFFICHÉE TELLE QUELLE — zéro découpage en « A »/« B »/« C », zéro
   supposition sur le nombre d'options (le Fighter en a trois, §0.4). */
function renderClassPhrase(query, classRef) {
  const wrap = el("section", "equipment-class-block");
  wrap.append(el("h3", null, [text("Class starting equipment")]));
  if (!classRef) {
    wrap.append(el("p", "equipment-empty-note", [
      text("Choose a class first — its starting equipment text will show here.")
    ]));
    return wrap;
  }
  const view = query({ kind: classRef.kind, id: classRef.id });
  const name = recordLabel(view);
  if (name) wrap.append(el("p", "equipment-class-name", [text(name)]));
  const phrase = view && view.record && view.record.data && typeof view.record.data.starting_equipment === "string"
    ? view.record.data.starting_equipment
    : null;
  wrap.append(el("p", phrase ? "equipment-class-phrase" : "equipment-empty-note", [
    text(phrase || "No starting equipment text on this class record.")
  ]));
  return wrap;
}

/* ══ UNE LIGNE DE SAC ═════════════════════════════════════════════════════
   Éditable (quantity, equipped), retirable. « Retirable » n'est offert QUE
   parce que c'est MESURÉ sûr — voir INVENTAIRE-LOT-49.md : `clear` sur
   `gear[N]` ne fait PAS jeter `rebuild` (contrairement aux six
   caractéristiques, lot 45), et les trois chemins (`gear[N]`, `.quantity`,
   `.equipped`) sont retirés ensemble par `shell.mjs` (`removeGearLine`) pour
   ne laisser aucune entrée orpheline dans `build.choices`. */
function renderGearRow(line, { query, onAction }) {
  const complete = Boolean(line.ref) && Number.isInteger(line.quantity) && typeof line.equipped === "boolean";
  const row = el("div", "equipment-gear-row");
  row.dataset.onSheet = String(complete);

  const view = line.ref ? query({ kind: line.ref.kind, id: line.ref.id }) : null;
  const name = recordLabel(view) || (line.ref ? line.ref.id : "(no item)");
  row.append(el("span", "equipment-gear-name", [text(name)]));

  const meta = [recordCost(view), recordWeight(view)].filter(Boolean).join(" · ");
  if (meta) row.append(el("span", "equipment-gear-meta", [text(meta)]));

  row.append(numberField({
    value: line.quantity,
    min: 1,
    className: "equipment-gear-qty",
    ariaLabel: `Quantity for ${name}`,
    onChange: (raw) => {
      const n = Number(raw);
      if (Number.isInteger(n) && n > 0) onAction({ kind: "set", path: `gear[${line.index}].quantity`, value: n });
    }
  }));

  row.append(renderPicker({
    options: [true, false],
    selected: typeof line.equipped === "boolean" ? [line.equipped] : [],
    labelOf: (v) => (v ? "Equipped" : "Stowed"),
    onSelect: (v) => onAction({ kind: "set", path: `gear[${line.index}].equipped`, value: v })
  }));

  row.append(button("Remove", "equipment-gear-remove",
    () => onAction({ kind: "removeGearLine", index: line.index }),
    `Remove ${name}`));

  if (!complete) {
    row.append(el("p", "equipment-gear-pending", [
      text("Missing quantity or equipped — this line will not reach the sheet until both are set.")
    ]));
  }

  return row;
}

/* ══ LE CHERCHEUR (§1a) — 133 records, un champ, l'action « Add » ═══════
   Toutes les lignes sont rendues UNE FOIS (pas de reconstruction du DOM à
   chaque frappe) et filtrées par `hidden` — même geste que le plan
   escamotable de `shell.mjs` (`aside.hidden`), jamais `display: none` en
   dur dans la feuille de style (garde `tests/ui-jetons.test.mjs`, clause 4).
   Repliée par défaut (une liste de 133 boutons au premier coup d'œil serait
   le défaut inverse de « rien ne se cache » : tout montrer d'un coup revient
   à ne rien distinguer). */
function renderGearSearch({ query, onAction, category, search }) {
  const wrap = el("section", "equipment-search-block");

  /* ⭐ B8.1 — LA MOLETTE FILTRE VRAIMENT. Sans ça elle serait un décor : les
     133 records s'affichaient tous, et l'écran faisait 7 099 px. Le filtre
     est un `kind`, lu sur l'item — jamais un test sur son nom. */
  const tous = catalogue(query);
  const items = !category || category === "all" ? tous : tous.filter((i) => i.kind === category);
  wrap.append(el("h4", null, [text(`Add from the catalogue — ${items.length} records`)]));
  const emptyNote = el("p", "equipment-empty-note", [
    text(`Type a name to search the ${items.length} gear, weapon and armor records.`)
  ]);
  const resultsWrap = el("div", "equipment-search-results");
  /* 🔴 ON NE REND QUE CE QUI S'AFFICHE, et c'est une mesure : les 133 lignes
     étaient construites puis masquées par `hidden` — sauf qu'`[hidden]` ne
     bat pas un `display: flex` d'auteur. Résultat vu à l'écran : **7 054 px**
     de lignes invisibles mais présentes. Et on ne peut pas y répondre par un
     `display: none` — le garde des jetons l'interdit dans `shell.css`
     (défaut n°3 : effacer des mots). La bonne réponse était de ne pas les
     construire.
     ⛔ Le remplissage passe par `swapContent` (socle.mjs) : le garde du lot
     58 n'autorise `replaceChildren` que là, et il a raison ici aussi. */
  const indexed = items.map((item) => ({
    name: (recordLabel(item.view) || "").toLowerCase(),
    item
  }));

  const MAX_SHOWN = 25;
  const moreNote = el("p", "equipment-search-more", []);
  const afficher = (needle) => {
    const trouves = needle.length === 0 ? [] : indexed.filter((e) => e.name.includes(needle));
    swapContent(resultsWrap, trouves.slice(0, MAX_SHOWN).map((e) => renderSearchResultRow(e.item, onAction)));
    emptyNote.hidden = needle.length > 0;
    moreNote.textContent = trouves.length > MAX_SHOWN
      ? `${trouves.length} matches — showing the first ${MAX_SHOWN}. Refine your search to see the rest.`
      : "";
  };
  const input = searchField({
    placeholder: "Search gear, weapons, armor…",
    className: "equipment-search-input",
    ariaLabel: "Search the equipment catalogue",
    onInput: (raw) => afficher(raw.trim().toLowerCase())
  });

  /* ⏳ B8.1 — la barre de recherche est REPLIÉE DERRIÈRE LA LOUPE, et c'est
     ce qui évite une CINQUIÈME barre fixe (le cumul que B7.6 signale). Eric
     l'a formulé au conditionnel — « si on a la place » : la place existe,
     mesurée, et la loupe la rend. */
  if (search) wrap.append(input);
  wrap.append(emptyNote, resultsWrap, moreNote);
  return wrap;
}

/* ══ B8.3 — CHAQUE ITEM TIENT SUR DEUX LIGNES ════════════════════════════
   « Ligne 1 : le titre. Ligne 2 : prix et poids. `+` et `👁` à droite, et ils
   occupent les deux lignes en hauteur. »

   ⭐ ET LA CONTRAINTE DE B7.3c NE S'APPLIQUE PAS ICI, c'est écrit noir sur
   blanc : Compétences COMPRIME (une ligne), Equipment EMPILE (deux). Les
   deux écrans les plus denses résolvent le même problème de largeur
   différemment, et c'est délibéré — ⛔ ne pas « harmoniser ».
   📌 C'est aussi ce qui règle les trois noms d'outils que Compétences devait
   couper (`Calligrapher's Supplies`…) : ici, ils ont la ligne entière. */
function renderSearchResultRow({ kind, view }, onAction) {
  const row = el("div", "equipment-search-result");
  const name = recordLabel(view) || view.id;
  const texte = el("div", "equipment-item-text");
  texte.append(el("span", "equipment-item-name", [text(name)]));
  const meta = [recordCost(view), recordWeight(view)].filter(Boolean).join(" · ");
  texte.append(el("span", "equipment-item-meta", [text(meta || "—")]));
  row.append(texte);
  row.append(button("+", "equipment-item-add",
    () => onAction({ kind: "addGearLine", ref: { kind, id: view.id }, quantity: 1, equipped: false }),
    `Add ${name}`));
  /* B8.3d/e — « l'œil ouvre une GROSSE fenêtre en overlay avec le texte
     associé », et « elle se ferme si on tape ou clique dehors ». C'est le
     popup partagé (III.4, lot 62) — la troisième de ses trois occurrences
     annoncées, et il n'a pas fallu en écrire une ligne de plus. */
  row.append(button("\u{1F441}", "equipment-item-eye",
    () => onAction({ kind: "popup", titre: name, texte: recordProse(view) }),
    `About ${name}`));
  return row;
}

/** LE TEXTE ASSOCIÉ À UN RECORD — recopié, jamais résumé. Les genres n'ont
 *  pas les mêmes champs : une arme porte ses dégâts et ses propriétés, une
 *  armure sa CA et son malus de discrétion (mesuré au §B8.0). On lit ce qui
 *  existe, dans l'ordre où le record le porte. */
function recordProse(view) {
  const data = (view && view.record && view.record.data) || {};
  const lignes = [];
  if (typeof data.description === "string" && data.description) lignes.push(data.description);
  for (const [label, valeur] of [
    ["Damage", data.damage],
    ["Mastery", data.mastery],
    ["Properties", Array.isArray(data.properties) ? data.properties.join(", ") : data.properties],
    ["AC", data.ac_base],
    ["Strength", data.strength],
    ["Stealth", data.stealth_disadvantage ? "disadvantage" : null]
  ]) {
    if (valeur !== undefined && valeur !== null && valeur !== "") lignes.push(`${label}: ${valeur}`);
  }
  return lignes.length > 0 ? lignes.join("\n") : "No further detail on this record.";
}

/* ══ LE SAC — la liste des lignes déjà posées, plus le chercheur ═════════ */
function renderGearBlock({ document, resolved, query, onAction, category, search }) {
  const wrap = el("section", "equipment-gear-block");
  wrap.append(el("h3", null, [text("Gear")]));

  /* La preuve que l'écran parle au moteur (commande §4, test 5) : l'AC
     affichée ici est LUE dans `resolved.ac`, jamais recalculée — une armure
     posée `equipped: true` la change sous les yeux, ou elle ne change rien
     du tout. */
  if (resolved && Number.isInteger(resolved.ac)) {
    wrap.append(el("p", "equipment-ac-readout", [text(`Armor Class: ${resolved.ac}`)]));
  }

  const lines = currentGearLines(document);
  const list = el("div", "equipment-gear-list");
  if (lines.length === 0) {
    list.append(el("p", "equipment-empty-note", [
      text("No gear yet — search the catalogue below to add a first item.")
    ]));
  } else {
    for (const line of lines) list.append(renderGearRow(line, { query, onAction }));
  }
  wrap.append(list);
  wrap.append(renderGearSearch({ query, onAction, category, search }));
  return wrap;
}

/* ══ LA BOURSE (§1b/§1c) ══════════════════════════════════════════════════
   Quatre champs TOUJOURS visibles (le piège de §0.2 rendu, pas caché) plus
   un geste explicite pour les 50 PO hérités — jamais posé tout seul au
   rendu (§1b : « il ne les repose pas à chaque passage »), seulement au
   clic (`addInheritedPurse`, `shell.mjs`). */
function renderCurrencyBlock({ document, resolved, onAction }) {
  const wrap = el("section", "equipment-currency-block");
  wrap.append(el("h3", null, [text("Purse")]));

  const current = currentCurrency(document);
  const row = el("div", "equipment-currency-row");
  for (const key of CURRENCY_KEYS) {
    row.append(el("label", "equipment-currency-field", [
      el("span", "equipment-currency-label", [text(key.toUpperCase())]),
      numberField({
        value: current[key],
        min: 0,
        className: "equipment-currency-input",
        ariaLabel: `${key.toUpperCase()} coins`,
        onChange: (raw) => {
          const n = Number(raw);
          if (Number.isInteger(n) && n >= 0) onAction({ kind: "set", path: `currency.${key}`, value: n });
        }
      })
    ]));
  }
  wrap.append(row);

  /* 🔴 LE PIÈGE, RENDU VISIBLE : tant que les quatre clefs ne sont pas
     posées (zéros compris), `resolved.currency` n'existe pas — cette ligne
     ne l'invente jamais, elle dit l'état tel quel. */
  if (resolved && resolved.currency) {
    const total = CURRENCY_KEYS.map((key) => `${resolved.currency[key]} ${key}`).join(", ");
    wrap.append(el("p", "equipment-purse-readout", [text(`On the sheet: ${total}`)]));
  } else {
    wrap.append(el("p", "equipment-empty-note", [
      text("All four denominations (cp / sp / gp / pp) must be set — zeros count — before a purse reaches the sheet.")
    ]));
  }

  wrap.append(button(`Add the inherited purse (${INHERITED_PURSE_GP} GP)`, "equipment-purse-btn",
    () => onAction({ kind: "addInheritedPurse" })));
  wrap.append(el("p", "equipment-purse-note", [text(
    "Where this comes from: Fate's Hand dropped the four SRD backgrounds, and with them their " +
    "“or 50 GP” option. These 50 GP are inherited from that option, not invented — they " +
    "add to whatever gold the class package already grants, they never replace it."
  )]));

  return wrap;
}

/**
 * @param {object} ctx
 * @param {object} [ctx.document] le document brut du dernier `rebuild()` — seule source de `class`, `gear[N]`, `currency.*`
 * @param {object} [ctx.resolved] la fiche dérivée — `resolved.ac`, `resolved.gear`, `resolved.currency`, jamais recalculés
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {(action:{kind:string, [key:string]:*}) => void} onAction  `set`/`clear` ordinaires, plus les trois gestes
 *   composites de `shell.mjs` : `addGearLine` ({ref,quantity,equipped}), `removeGearLine` ({index}), `addInheritedPurse` ()
 */
/* ══ B8.1 — LE BANDEAU DU HAUT, ET IL FLOTTE ════════════════════════════
   « Le budget en pièces, SANS TROP PRENDRE DE PLACE » · « une molette
   horizontale qui catégorise les équipements » · « un point d'interrogation
   à côté du budget » qui rappelle « What you already have ».

   ⏳ LA LOUPE — Eric l'a formulée AU CONDITIONNEL : « SI on a la place pour
   poser une loupe dans les flottants pour invoquer la barre de recherche, ce
   serait pas mal ». C'est donc une PRÉFÉRENCE, pas une exigence — et la
   place existe, mesurée : le bandeau tient sur deux lignes de 44 px comme
   celui de Compétences. La loupe est là, et elle évite une CINQUIÈME barre
   fixe (le point que B7.6 signalait). */

export const EQUIPMENT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "weapon", label: "Weapons" },
  { id: "armor", label: "Armor" },
  { id: "gear", label: "Gear" }
];

/** LA BARRE FIXE de l'écran : la bourse, le `?`, la loupe, la molette. */
export function renderEquipmentBar(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const wrap = el("div", "equipment-topbar");

  const ligne = el("div", "equipment-purse-bar");
  const purse = currentCurrency(ctx.document);
  const pieces = CURRENCY_KEYS.map((k) => `${purse[k] || 0} ${k.toUpperCase()}`).join(" · ");
  ligne.append(el("span", "equipment-purse-value", [text(pieces)]));
  /* B8.1 — le point d'interrogation, À CÔTÉ DU BUDGET, qui rappelle la
     fenêtre. B8.2d, mot pour mot. */
  ligne.append(button("?", "equipment-help",
    () => act({ kind: "popup", titre: "What you already have", texte: whatYouHave(ctx) }),
    "What you already have"));
  ligne.append(button("\u{1F50D}", "equipment-magnifier",
    () => act({ kind: "equipmentSearch" }), "Search the catalogue"));
  wrap.append(ligne);

  const bar = el("nav", "equipment-catbar");
  bar.setAttribute("aria-label", "Equipment categories");
  for (const cat of EQUIPMENT_CATEGORIES) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "equipment-cat";
    item.dataset.value = cat.id;
    item.setAttribute("aria-current", cat.id === (ctx.category || "all") ? "true" : "false");
    item.textContent = cat.label;
    item.addEventListener("click", () => act({ kind: "equipmentCategory", value: cat.id }));
    bar.append(item);
  }
  wrap.append(bar);
  return wrap;
}

/** B8.2 — « une fenêtre qui dit ce qu'on POSSÈDE DÉJÀ, et explique
 *  POURQUOI ». Le pourquoi vient du document : le paquet de la classe et les
 *  50 PO d'héritage sont deux origines distinctes, et le joueur doit savoir
 *  laquelle lui a donné quoi. */
export function whatYouHave(ctx) {
  const doc = ctx.document;
  const lignes = currentGearLines(doc);
  const purse = currentCurrency(doc);
  const morceaux = [];
  const classRef = currentClassRef(doc);
  if (classRef) {
    const view = ctx.query({ kind: "class", id: classRef.id });
    const phrase = view && view.record && view.record.data && view.record.data.starting_equipment;
    if (phrase) morceaux.push(`From your class:\n${phrase}`);
  }
  morceaux.push(`In your purse: ${CURRENCY_KEYS.map((k) => `${purse[k] || 0} ${k.toUpperCase()}`).join(" · ")}`);
  morceaux.push(lignes.length > 0
    ? `You have added ${lignes.length} line${lignes.length === 1 ? "" : "s"} of gear.`
    : "You have not added anything yet.");
  return morceaux.join("\n\n");
}

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut
 * @param {object} ctx.resolved   la fiche dérivée — l'AC et la bourse
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {string} [ctx.category] le filtre courant de la molette
 * @param {boolean} [ctx.search]  la barre de recherche est-elle invoquée
 */
export function renderEquipmentStep(ctx, onAction) {
  const doc = ctx.document || null;
  const resolved = ctx.resolved || null;
  const query = ctx.query || (() => []);
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "equipment-step");

  section.append(renderGearBlock({ document: doc, resolved, query, onAction: act, category: ctx.category, search: ctx.search }));
  section.append(renderCurrencyBlock({ document: doc, resolved, onAction: act }));
  return section;
}

/** LE PALIER — un seul, et il est toujours prêt : **rien n'est obligatoire
 *  ici**. Un personnage sans équipement est incomplet, pas fautif — et le
 *  moteur ne refuse rien sur ce chemin (mesuré : aucune violation
 *  `gear.*`). */
export function equipmentValidate() {
  return { exists: true, ready: true, action: null, next: "step" };
}
