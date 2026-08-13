/* ══ L'ÉTAPE ABILITIES — lot 45 ═══════════════════════════════════════
   ⛔ ZÉRO plan `decisions[]` pour ce chemin (mesuré, commande §0) —
   contrairement à Compétences/Class/Species, cet écran ne descend PAS le
   carnet : il lit `document.build.choices` directement (le SEUL endroit où
   vivent les six valeurs et la méthode choisie) et `resolved.abilities`
   (le SEUL endroit où lire le score FINAL, boosts compris, tel que le
   moteur le rend — jamais recalculé ici, même loi que le compteur de
   `skills-step.mjs`).

   ⭐ LE MODE EST UNE LISTE (commande §3a-bis) : `ABILITY_METHODS` porte
   aujourd'hui deux entrées (`roll`, `manual`), et CHAQUE ENTRÉE PORTE SON
   PROPRE `render`. `renderAbilitiesStep` ne branche JAMAIS sur un id de
   méthode — il ne compare QUE `method.id === mode.id` pour savoir laquelle
   est ACTIVE (un état, pas un comportement) et appelle `method.render(...)`
   sans jamais regarder lequel c'est. Une troisième méthode (Standard Array,
   Point Buy, 4d6-garder-3…) est donc UNE ENTRÉE DE PLUS dans ce tableau,
   jamais un `if`/`else if` de plus dans `renderAbilitiesStep` — corrigé sur
   revue d'architecte (voir INVENTAIRE-LOT-45.md, « le branchement était
   dans la boucle, pas dans le tableau ») et PROUVÉ par un test qui ajoute
   une troisième méthode à `ABILITY_METHODS` (une fausse, avec son `render`)
   SANS TOUCHER UNE LIGNE DE CE FICHIER (`tests/abilities-step.test.mjs`).

   ⚠️ LE HASARD VIT ICI, ET C'EST VOULU (commande §3a.4) : la loi « le
   moteur prononce, l'écran affiche » parle des RÈGLES OPPOSABLES
   (validate()), pas de la GÉNÉRATION d'un nombre que le joueur pose
   lui-même avec `set()` — exactement ce que ce fichier fait. Le lot de dix
   dés lui-même ne survit dans AUCUN champ (Eric, 2026-08-13) : `rollBatch`
   vit dans `shell.mjs` (`state.abilityRoll`), jamais dans le document.

   ⛔ LE PLAFOND DE 18 N'EST PAS ICI (commande §3c) : `abilities.str = 20`
   passe aujourd'hui avec ZÉRO refus (mesuré). Ce fichier se contente de
   DÉCLARER l'alerte — une phrase, jamais un blocage, jamais une ligne qui
   empêcherait `onAction` de partir. Tranché par Eric le 2026-08-13,
   POSTÉRIEUR à la commande : l'écran prévient, le moteur laisse. */

import { renderPicker } from "./carnet.mjs";
import { ABILITY_KEYS } from "../../src/build/index.mjs";
import { rollAbilitySet } from "./dice.mjs";

export { rollAbilitySet };

/** La liste des méthodes — voir l'en-tête. `render(ctx)` fabrique le CORPS
 *  de la méthode (au-delà du sélecteur commun) et REND UN TABLEAU DE
 *  NŒUDS — `renderAbilitiesStep` les ajoute avec `block.append(...)`, sans
 *  jamais savoir ce qu'ils contiennent. `summary` est la phrase d'état
 *  quand la méthode N'EST PAS active (§2 du chantier : « rien ne se
 *  cache »). Les deux fonctions `renderRollMethod`/`renderManualMethod`
 *  sont définies plus bas (hissées par la déclaration `function` — l'ordre
 *  du fichier n'a pas d'importance pour ce tableau). */
export const ABILITY_METHODS = [
  { id: "roll", label: "Roll (3d6 × 10, keep 6)", summary: "Not selected — switch to it to draw ten dice.", render: renderRollMethod },
  { id: "manual", label: "Manual entry", summary: "Not selected — switch to it to type six scores directly.", render: renderManualMethod }
];

const ABILITY_MODE_PATH = "abilities.mode";
const ABILITY_CAP = 18; // déclaré, jamais opposé — voir l'en-tête et INVENTAIRE-LOT-45.md
/* La plage de la saisie manuelle : un choix COSMÉTIQUE de widget (jusqu'où
   les boutons vont), PAS une règle. Elle dépasse volontairement le plafond
   de 18 pour que l'alerte ait une chance de se déclencher sans qu'aucun
   bouton ne soit retiré — retirer les valeurs > 18 SERAIT le blocage que
   commande §3c interdit. */
const MANUAL_ENTRY_RANGE = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** La dernière valeur posée sur `abilities.<key>` — lue dans
 *  `document.build.choices`, jamais dans `resolved` (qui inclut les boosts
 *  d'une future Inheritance, hors périmètre de cet écran). `undefined` si
 *  rien n'a encore été posé. */
export function currentAbilityValue(document, key) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === `abilities.${key}`);
  return entry ? entry.value : undefined;
}

/** La méthode actuellement posée sur `abilities.mode`, ou `null` si rien
 *  n'est posé, ou si la valeur posée ne désigne AUCUNE des méthodes que ce
 *  lot construit (cas mesuré : le personnage d'exemple porte déjà
 *  `"standard"`, une méthode SRD que ce lot n'implémente pas — §3a-bis).
 *  Un mode inconnu n'est pas une faute : il retombe simplement sur la
 *  première méthode connue, avec sa propre note « rien ne se cache ». */
export function currentAbilityMode(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === ABILITY_MODE_PATH);
  if (!entry) return { raw: undefined, id: ABILITY_METHODS[0].id, known: true };
  const known = ABILITY_METHODS.some((m) => m.id === entry.value);
  return { raw: entry.value, id: known ? entry.value : ABILITY_METHODS[0].id, known };
}

/** Les valeurs du lot ENCORE disponibles pour la ligne `key` : le lot des
 *  six retenues, MOINS celles déjà posées sur les AUTRES caractéristiques
 *  (multiset — deux jets à 15 restent deux options tant qu'un seul est
 *  posé). La valeur de CETTE ligne, si elle est déjà posée, n'est jamais
 *  retirée : c'est elle que `renderPicker` doit pouvoir montrer active. */
export function optionsForRow(keptValues, assignedByKey, key) {
  const pool = [...keptValues];
  for (const [otherKey, value] of Object.entries(assignedByKey)) {
    if (otherKey === key || value === undefined) continue;
    const index = pool.indexOf(value);
    if (index >= 0) pool.splice(index, 1);
  }
  return pool;
}

function abilityLabel(key) { return key.toUpperCase(); }

function renderModeSwitch(activeId, unknownRaw, onAction) {
  const wrap = el("div", "ability-mode-switch");
  wrap.append(renderPicker({
    options: ABILITY_METHODS.map((m) => m.id),
    selected: [activeId],
    labelOf: (id) => ABILITY_METHODS.find((m) => m.id === id).label,
    onSelect: (id) => onAction({ kind: "set", path: ABILITY_MODE_PATH, value: id })
  }));
  if (unknownRaw !== undefined) {
    wrap.append(el("p", "ability-mode-note", [text(
      `Method “${unknownRaw}” isn't built by this screen yet — showing ${ABILITY_METHODS[0].label} instead.`
    )]));
  }
  return wrap;
}

function renderCapWarning(resolved, key) {
  if (!resolved || !resolved.abilities || !resolved.abilities[key]) return null;
  const score = resolved.abilities[key].score;
  if (typeof score !== "number" || score <= ABILITY_CAP) return null;
  /* ⛔ Alerte seulement — RIEN n'empêche `onAction` de partir plus haut.
     Le moteur laisse ; §4 ADDENDUMS, tranché le 2026-08-13, cité en tête. */
  return el("span", "ability-cap-warning", [text(`> ${ABILITY_CAP} at creation`)]);
}

function renderAssignRow(key, ctx) {
  const { document, resolved, keptValues, assignedByKey, onAction } = ctx;
  const row = el("div", "ability-row");
  row.dataset.row = key;
  row.append(el("span", "ability-row-label", [text(abilityLabel(key))]));
  const current = currentAbilityValue(document, key);
  /* Le pool du lot, MOINS ce qui est posé ailleurs — PLUS la valeur déjà
     posée ICI si elle n'y figure pas (mesuré en servant le builder : le
     personnage d'exemple porte déjà six scores sans qu'aucun lot n'ait
     encore été tiré dans CETTE session — `keptValues` est alors vide, et
     sans ce repêchage la valeur posée disparaîtrait de l'écran au lieu de
     s'y afficher active. Voir INVENTAIRE-LOT-45.md). */
  const options = optionsForRow(keptValues, assignedByKey, key);
  if (current !== undefined && !options.includes(current)) options.unshift(current);
  row.append(renderPicker({
    options,
    selected: current !== undefined ? [current] : [],
    labelOf: (v) => String(v),
    onSelect: (value) => onAction({ kind: "set", path: `abilities.${key}`, value })
    /* ⛔ PAS de `onClear` ICI — mesuré en servant le builder (INVENTAIRE-
       LOT-45.md) : `rebuild()` JETTE si l'une des six manque (« un score ne
       se dérive de rien »), et `applyDecisionAction` (shell.mjs) appelle
       `rebuild()` sans filet après chaque `clear`. Offrir le tiret ferait
       planter tout l'écran au premier clic. Reposer une AUTRE valeur au
       même endroit (`set`, qui REMPLACE — `place()` dans `block.mjs`) est
       la seule façon légale de changer d'avis ici ; cliquer l'option déjà
       active ne fait donc RIEN (pas de second geste à apprendre, pas de
       trou à six). */
  }));
  const mod = resolved && resolved.abilities && resolved.abilities[key]
    ? resolved.abilities[key].mod : undefined;
  if (typeof mod === "number") {
    row.append(el("span", "ability-row-mod", [text(mod >= 0 ? `+${mod}` : String(mod))]));
  }
  const warning = renderCapWarning(resolved, key);
  if (warning) row.append(warning);
  return row;
}

function renderManualRow(key, ctx) {
  const { document, resolved, onAction } = ctx;
  const row = el("div", "ability-row");
  row.dataset.row = key;
  row.append(el("span", "ability-row-label", [text(abilityLabel(key))]));
  const current = currentAbilityValue(document, key);
  row.append(renderPicker({
    options: MANUAL_ENTRY_RANGE,
    selected: current !== undefined ? [current] : [],
    labelOf: (v) => String(v),
    onSelect: (value) => onAction({ kind: "set", path: `abilities.${key}`, value })
    /* ⛔ PAS de `onClear` ICI — mesuré en servant le builder (INVENTAIRE-
       LOT-45.md) : `rebuild()` JETTE si l'une des six manque (« un score ne
       se dérive de rien »), et `applyDecisionAction` (shell.mjs) appelle
       `rebuild()` sans filet après chaque `clear`. Offrir le tiret ferait
       planter tout l'écran au premier clic. Reposer une AUTRE valeur au
       même endroit (`set`, qui REMPLACE — `place()` dans `block.mjs`) est
       la seule façon légale de changer d'avis ici ; cliquer l'option déjà
       active ne fait donc RIEN (pas de second geste à apprendre, pas de
       trou à six). */
  }));
  const mod = resolved && resolved.abilities && resolved.abilities[key]
    ? resolved.abilities[key].mod : undefined;
  if (typeof mod === "number") {
    row.append(el("span", "ability-row-mod", [text(mod >= 0 ? `+${mod}` : String(mod))]));
  }
  const warning = renderCapWarning(resolved, key);
  if (warning) row.append(warning);
  return row;
}

/** LE TIRAGE — dix jets rendus, six distingués (commande §4, test 1), et la
 *  bannière de relance quand `rerollCount > 0` (§3a.1 : le joueur doit
 *  comprendre pourquoi le lot a changé sous ses yeux). */
function renderRollBatch(rollBatch, onAction) {
  const wrap = el("div", "ability-roll-batch");
  const bar = el("div", "ability-roll-bar", [
    (() => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ability-roll-btn";
      btn.textContent = rollBatch ? "Reroll" : "Roll";
      btn.addEventListener("click", () => onAction({ kind: "roll" }));
      return btn;
    })()
  ]);
  wrap.append(bar);
  if (!rollBatch) {
    wrap.append(el("p", "ability-roll-empty", [text("No dice rolled yet.")]));
    return wrap;
  }
  if (rollBatch.rerollCount > 0) {
    wrap.append(el("p", "ability-roll-note", [text(
      `Rerolled the whole set ${rollBatch.rerollCount} time${rollBatch.rerollCount > 1 ? "s" : ""} — ` +
      "none of the ten reached 15 before this one."
    )]));
  }
  const dice = el("div", "ability-dice");
  for (const roll of rollBatch.rolls) {
    const chip = el("div", "ability-die", [
      el("span", "ability-die-detail", [text(roll.dice.join("+"))]),
      el("span", "ability-die-total", [text(String(roll.total))])
    ]);
    chip.dataset.kept = String(roll.kept);
    dice.append(chip);
  }
  wrap.append(dice);
  return wrap;
}

/** LE `render` DE LA MÉTHODE `roll`, dans `ABILITY_METHODS` — le lot de dix
 *  dés puis les six lignes d'assignation. Rend un TABLEAU de nœuds (pas un
 *  seul) : la boucle de `renderAbilitiesStep` ne fait que les ajouter,
 *  elle ne sait pas combien il y en a ni ce qu'ils contiennent. */
function renderRollMethod({ document, resolved, rollBatch, assignedByKey, onAction }) {
  const keptValues = rollBatch ? rollBatch.rolls.filter((r) => r.kept).map((r) => r.total) : [];
  const rows = el("div", "ability-rows");
  for (const key of ABILITY_KEYS) {
    rows.append(renderAssignRow(key, { document, resolved, keptValues, assignedByKey, onAction }));
  }
  return [renderRollBatch(rollBatch, onAction), rows];
}

/** LE `render` DE LA MÉTHODE `manual` — six lignes de saisie, même forme de
 *  retour (un tableau) que `renderRollMethod`, MÊME QUAND IL N'Y A QU'UN
 *  SEUL NŒUD : c'est ce qui rend les deux entrées interchangeables aux yeux
 *  de la boucle. */
function renderManualMethod({ document, resolved, onAction }) {
  const rows = el("div", "ability-rows");
  for (const key of ABILITY_KEYS) {
    rows.append(renderManualRow(key, { document, resolved, onAction }));
  }
  return [rows];
}

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut du dernier `rebuild()` — seule source des valeurs déjà posées
 * @param {object} ctx.resolved   la fiche dérivée du dernier `rebuild()` — score final, mod, plafond
 * @param {object} [ctx.rollBatch] le dernier lot tiré ({rolls, rerollCount}), ou `null` — vit hors document (shell.mjs)
 * @param {(action: {kind:"set"|"clear"|"roll", path?:string, value?:*}) => void} onAction
 */
export function renderAbilitiesStep(ctx, onAction) {
  const document = ctx.document || null;
  const resolved = ctx.resolved || null;
  const rollBatch = ctx.rollBatch || null;
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "abilities-step");

  const mode = currentAbilityMode(document);
  section.append(renderModeSwitch(mode.id, mode.known ? undefined : mode.raw, act));

  const assignedByKey = {};
  for (const key of ABILITY_KEYS) assignedByKey[key] = currentAbilityValue(document, key);

  /* ⭐ AUCUN BRANCHEMENT SUR L'ID ICI (revue d'architecte, voir l'en-tête et
     INVENTAIRE-LOT-45.md) — `method.id === mode.id` compare un ÉTAT
     (active/inactive, légitime), `method.render(...)` délègue TOUT le
     comportement à l'entrée elle-même. Ajouter une méthode n'ajoute jamais
     de branche ici : la boucle est déjà prête pour la troisième. */
  for (const method of ABILITY_METHODS) {
    const active = method.id === mode.id;
    const block = el("div", "ability-method-block");
    block.dataset.status = active ? "active" : "inactive";
    block.dataset.method = method.id;
    if (!active) {
      block.append(el("p", "ability-mode-summary", [text(method.summary)]));
      section.append(block);
      continue;
    }
    block.append(...method.render({ document, resolved, rollBatch, assignedByKey, onAction: act }));
    section.append(block);
  }

  return section;
}
