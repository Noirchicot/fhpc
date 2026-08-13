/* ══ L'ÉTAPE INHERITANCE — lot 46 ═════════════════════════════════════
   Même loi que Class/Species/Compétences : le moteur prononce, l'écran
   affiche. ZÉRO règle de jeu ici — le lot 43 a déjà tout construit côté
   moteur (`background.boost`, `background.boost.<clef>`,
   `background.originFeat[0]`) ; ce fichier ne fait que DESCENDRE
   `decisions[]` et `resolved`, jamais recalculer un total ni juger un
   plafond.

   ── LE PLAN `background` À UNE SEULE OPTION (commande §0, tranché par Eric
   le 2026-08-13) ────────────────────────────────────────────────────────
   En Fate's Hand il n'y a plus de choix d'arrière-plan : la couche FH ne
   porte qu'UN SEUL record du genre (`fh:background:en:inheritance`), et
   `projectDecisions` (lot 43) publie déjà les DEUX plans sous lui
   (`background.boost`, `background.originFeat[0]`) SANS qu'un `choose` ait
   jamais été posé sur `background` lui-même — c'est le repli à une option,
   le cœur du lot 43. Un sélecteur à une entrée est une fausse question :
   ⛔ CET ÉCRAN N'EN CONSTRUIT AUCUN. Il pose le nom du record comme un
   TITRE (« ne le cache pas non plus » — commande §0) et s'arrête là ; il
   n'émet AUCUN `choose({path:"background", …})` — voir INVENTAIRE-LOT-46.md
   pour la mesure qui explique pourquoi (un écart entre `decisions.mjs`, qui
   a son propre repli, et `derive.mjs`, qui n'en a pas pour
   `identity.background` : une question moteur, hors du mandat de ce lot).

   Le cas SRD PUR (4 arrière-plans encore vivants sous une pile sans couche
   FH, condition de sortie n°6 du lot 43) N'EST PAS un cadre à une option :
   c'est une VRAIE liste, et ce fichier réutilise `renderRecordChoice`
   (`carnet.mjs`, partagé par Class/Species) plutôt que d'inventer un second
   geste de choix de record. */

import {
  planAt, renderRecordChoice, renderPicker, decisionRefusalWord
} from "./carnet.mjs";
import { renderFinalColumn, currentAbilityValue } from "./abilities-step.mjs";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function featLabel(query, id) {
  const view = query({ kind: "feat", id });
  return view && view.record ? view.record.name : id;
}

/* ══ LE CADRE — le nom du record d'Inheritance, en mention, jamais un
   bouton (voir l'en-tête). */
function renderFrame(query, plan) {
  const view = query({ kind: "background", id: plan.options[0] });
  const name = view && view.record ? view.record.name : plan.options[0];
  return el("p", "inheritance-frame", [text(name)]);
}

/* ══ LES BONUS DE CARACTÉRISTIQUES ═══════════════════════════════════════
   `background.boost` : options = les six clefs (ou les trois d'un
   arrière-plan SRD qui les nomme encore, condition de sortie n°6), publiées
   par le plan — jamais `ABILITY_KEYS` importé ici. `background.boost.<clef>`
   n'existe QUE pour une clef déjà cliquée (même mécanique structurelle que
   `species.skillBudget.<slug>`, voir `species-step.mjs` en tête : un slug
   jamais cliqué ne porte aucune entrée dans `decisions[]`).

   ⚠️ `BOOST_POINT_OPTIONS` — `[1, 2]` — N'EST PAS DU CONTENU (aucun record
   ne le porte, ni `background.boost` ni `background.boost.<clef>` ne
   publient de tiers numériques : leurs deux SEULS champs sont `options`
   = les clefs elles-mêmes, mesuré en lisant `decisions.mjs`,
   `backgroundBoostPlan`). C'est un fait STRUCTUREL du mécanisme (+1 ou +2
   par carac, `BOOST_CAP = 2`) exactement au sens où `species-step.mjs`
   justifie `BUDGET_TIERS` — même loi, mêmes mots. */
const BOOST_POINT_OPTIONS = [1, 2];

/** Le nombre de points déjà posés sur `background.boost.<clef>`, lu dans
 *  `document.build.choices` — AUCUN plan ne le publie (le sous-plan
 *  `background.boost.<clef>` ne porte que la clef elle-même dans son
 *  `selected`, jamais la valeur numérique posée, mesuré). Même geste que
 *  `currentAbilityValue`/`currentArcanaId` (lots 45) pour une valeur brute
 *  que rien d'autre ne republie. */
function currentBoostValue(document, key) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === `background.boost.${key}`);
  return entry ? entry.value : undefined;
}

function renderBoostRow(key, { decisions, document, resolved, onAction }) {
  const path = `background.boost.${key}`;
  const step = planAt(decisions, path);
  const current = currentBoostValue(document, key);
  const row = el("div", "skills-row");
  row.dataset.row = key;
  row.append(el("span", "record-row-label", [text(key.toUpperCase())]));
  row.append(renderPicker({
    options: BOOST_POINT_OPTIONS,
    selected: current !== undefined ? [current] : [],
    labelOf: (value) => `+${value}`,
    onSelect: (value) => onAction({ kind: "set", path, value }),
    onClear: () => onAction({ kind: "clear", path }),
    lock: step ? step.lock : null
  }));
  /* ⭐ « leur effet doit se voir de la même façon » (commande §2a.3) : LA
     MÊME fonction que celle qu'`abilities-step.mjs` a gagnée au lot 45,
     importée telle quelle — jamais une seconde copie qui pourrait diverger.
     `rawValue` reste le score BRUT (avant tout boost d'Inheritance), lu par
     la même `currentAbilityValue` que la ligne Abilities utilise déjà. */
  const final = renderFinalColumn(resolved, key, currentAbilityValue(document, key));
  if (final) row.append(final);
  return row;
}

function renderBoostBlock(ctx, plan) {
  const { decisions, document, resolved, onAction } = ctx;
  const wrap = el("section", "skills-budget-block");
  wrap.dataset.status = plan.status;
  wrap.append(el("h3", null, [text("Ability boosts")]));
  wrap.append(el("p", "skills-budget-note", [text(`${plan.answered} of ${plan.expected} points spent`)]));
  /* Les deux refus neufs du lot 43 (`background.boost-cap-exceeded`,
     `background.boost-total-mismatch`) tombent ICI, sur le plan de groupe —
     ⛔ ni recalculés ni prévenus, seulement lus au `lock` et recomposés en
     mots par `decisionRefusalWord` (carnet.mjs), même geste que les QCM de
     Class/Species. */
  if (plan.lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(plan.lock))]));
  const rows = el("div", "skills-rows");
  for (const key of plan.options) rows.append(renderBoostRow(key, { decisions, document, resolved, onAction }));
  wrap.append(rows);
  return wrap;
}

/* ══ LE DON D'ORIGINE ═════════════════════════════════════════════════════
   `background.originFeat[0]` pose un RECORD (`choose`, un `ref` — jamais un
   `set`, mesuré en lisant `backgroundFeatPlan` : il lit `choice.ref`, pas
   `choice.value`). `renderRecordChoice`/`renderPicker` ne conviennent donc
   pas TELS QUELS (ils suffiraient pour le nom, mais la commande §2a.1 exige
   aussi la DESCRIPTION de chacune des cinq options, que `renderPicker` — une
   rangée de petits boutons nommés — n'a pas la place de porter). C'est une
   forme différente, propre à cet écran, pas une recopie de carnet.mjs. */
function renderOriginFeat(ctx, plan) {
  const { query, onAction } = ctx;
  const wrap = el("section", "inheritance-feat-block");
  wrap.append(el("h3", null, [text("Origin feat")]));
  wrap.append(el("p", "skills-budget-note", [text(`${plan.answered} of ${plan.expected} chosen`)]));
  if (plan.lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(plan.lock))]));

  const list = el("div", "inheritance-feat-list");
  for (const id of plan.options) {
    const view = query({ kind: "feat", id });
    const description = view && view.record && view.record.data && typeof view.record.data.description === "string"
      ? view.record.data.description
      : "";
    const active = plan.selected.includes(id);

    const card = document.createElement("button");
    card.type = "button";
    card.className = "inheritance-feat-card";
    card.dataset.active = String(active);
    card.setAttribute("aria-label", id);
    card.append(el("span", "inheritance-feat-name", [text(featLabel(query, id))]));
    /* La prose SRD est parfois multi-paragraphes (`\n\n`) — un simple
       découpage en `<p>`, ZÉRO mise en forme de plus (pas de résumé, pas de
       troncature : « chacune avec … sa description », commande §2a.1, mot
       pour mot). */
    for (const paragraph of description.split("\n\n").filter((p) => p.length > 0)) {
      card.append(el("p", "inheritance-feat-desc", [text(paragraph)]));
    }
    /* Un choix REMPLACE (même loi que `renderRecordChoice` : « choisir une
       autre classe REMPLACE, on ne "déchoisit" pas une classe » —
       class-step.mjs, tête de fichier) — aucun tiret ici non plus. */
    card.addEventListener("click", () => {
      if (!active) onAction({ kind: "choose", path: plan.path, ref: { kind: "feat", id } });
    });
    list.append(card);
  }
  wrap.append(list);
  return wrap;
}

/**
 * @param {object} ctx
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {object} [ctx.document] le document brut du dernier `rebuild()` — seule source des points de boost déjà posés
 * @param {object} [ctx.resolved] la fiche dérivée — le score final des caracs, à l'octet
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {(action: {kind:"choose"|"set"|"clear", path:string, ref?:object, value?:*}) => void} onAction
 */
export function renderInheritanceStep(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const document = ctx.document || null;
  const resolved = ctx.resolved || null;
  const query = ctx.query || (() => null);
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "inheritance-step");

  const backgroundPlan = planAt(decisions, "background");
  if (backgroundPlan && backgroundPlan.options.length === 1) {
    section.append(renderFrame(query, backgroundPlan));
  } else if (backgroundPlan) {
    /* Le cas SRD pur (4 options, aucun repli — condition de sortie n°6 du
       lot 43) : une vraie liste, le MÊME geste que Class/Species. */
    const choice = renderRecordChoice({
      decisions, path: "background", kind: "background", title: "Background", query, onAction: act
    });
    if (choice) section.append(choice.node);
  }

  const boostPlan = planAt(decisions, "background.boost");
  if (boostPlan) section.append(renderBoostBlock({ decisions, document, resolved, onAction: act }, boostPlan));

  const featPlan = planAt(decisions, "background.originFeat[0]");
  if (featPlan) section.append(renderOriginFeat({ query, onAction: act }, featPlan));

  return section;
}
