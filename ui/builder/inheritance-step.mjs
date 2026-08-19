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
  planAt, renderRecordChoice, renderPicker, decisionRefusalWord, markPressed
} from "./carnet.mjs?v=207";
import { renderFinalColumn, currentAbilityValue } from "./abilities-step.mjs?v=207";

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
    markPressed(card, active);
    /* LOT 53, TROISIÈME INSTANCE — payée par l'architecte à la revue, parce
       qu'elle était hors du périmètre du lot (elle ne vient pas de
       `renderPicker`, c'est une carte fabriquée à la main ici). Même défaut,
       même patron : l'identifiant va dans `data-value`, sa vraie place, et
       la carte n'a plus d'`aria-label` — son contenu textuelle porte déjà le
       NOM du don (`inheritance-feat-name`), qui est ce qu'un lecteur d'écran
       doit annoncer. Avant : la carte s'annonçait `fh:feat:en:auspicious`. */
    card.dataset.value = id;
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
/* ══════════════════════════════════════════════════════════════════════
   L'ÉCRAN DE B4 — lot 64
   ══════════════════════════════════════════════════════════════════════
   B4.1 : **deux dalles au premier abord, CENTRÉES** — `Ability boost` et
   `Origin feat` — chacune avec un **petit cercle de validation** qui est un
   INDICATEUR D'ÉTAT, pas un bouton. ✅ **L'ORDRE EST LIBRE** (Eric) : le
   parcours de B4.4 en est UN parmi deux, pas une contrainte.

   B4.2 : ouvrir `Ability boost` fait **DISPARAÎTRE** `Origin feat`.

   ⭐ B4.5 — « on peut pousser Validate pour avancer, OU JUSTE FAIRE DÉFILER
   LA MOLETTE ». C'est la première fois qu'Eric le dit explicitement, et ça
   vaut PARTOUT : `Validate` est un raccourci, jamais un passage obligé. Rien
   n'est donc à coder ici pour ça — la molette des étapes marche déjà. */

export const INHERITANCE_PANELS = [
  { id: "boost", label: "Ability boost", plan: "background.boost" },
  { id: "feat", label: "Origin feat", plan: "background.originFeat[0]" }
];

/** Un panneau est COCHÉ quand son plan est répondu — le carnet le dit, on ne
 *  le recompte pas. */
export function inheritancePanelDone(decisions, panelId) {
  const panel = INHERITANCE_PANELS.find((p) => p.id === panelId);
  const plan = planAt(decisions, panel.plan);
  return Boolean(plan) && plan.answered >= plan.expected;
}

/** B4.1 — LES DEUX DALLES, avec leur cercle. Le cercle N'EST PAS un bouton :
 *  c'est la dalle entière qu'on pousse (une cible de 44 px de haut, pas un
 *  point de 12). */
function renderPanels(ctx, act) {
  const wrap = el("div", "inheritance-panels");
  for (const panel of INHERITANCE_PANELS) {
    const fait = inheritancePanelDone(ctx.decisions, panel.id);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "inheritance-panel dalle-simple";
    tile.dataset.panel = panel.id;
    tile.dataset.done = String(fait);
    /* ⛔ Le cercle est décoratif à l'oreille : son sens est déjà porté par
       `aria-pressed` (l'ouverture) et par le mot d'état ci-dessous. */
    const rond = el("span", "inheritance-check");
    rond.setAttribute("aria-hidden", "true");
    tile.append(rond, el("span", "inheritance-panel-label", [text(panel.label)]));
    tile.append(el("span", "inheritance-panel-state", [text(fait ? "done" : "to do")]));
    markPressed(tile, false);
    tile.addEventListener("click", () => act({ kind: "inheritanceOpen", value: panel.id }));
    wrap.append(tile);
  }
  return wrap;
}

/* ══ B4.2 — LES SIX COLONNES, CÔTE À CÔTE ═══════════════════════════════
   « Six petites dalles CÔTE À CÔTE, une par caractéristique, chacune avec
   une MOLETTE VERTICALE » portant exactement trois choix : `0` / `+1` / `+2`.

   🔴 L'ORDRE EST CELUI DU SRD (tranché par Eric — sa dictée disait
   `FOR·DEX·CON·SAG·INT·CHA`, il a corrigé) : STR · DEX · CON · INT · WIS ·
   CHA. ⛔ Le plan, lui, publie ses options en ordre ALPHABÉTIQUE
   (`cha, con, dex, int, str, wis` — mesuré) : on le réordonne pour
   l'affichage, sans jamais rien y ajouter ni retirer.

   📏 B4.3, mesuré par l'architecte : six colonnes tiennent à 360 px, mais
   « tout juste et sans marge » — et le coupable nommé était le padding de
   32 px, « qui mange 18 % de la largeur ». Il est tombé à 16 px au lot 59,
   et cet écran est en plein cadre : la place existe. */
export const SRD_ABILITY_ORDER = ["str", "dex", "con", "int", "wis", "cha"];

function renderBoostColumns(ctx, plan, act) {
  /* ⛔ NE PAS DÉSTRUCTURER `document` DE `ctx` ICI : le document du
     PERSONNAGE masquerait le `document` GLOBAL, et `createElement`
     disparaîtrait. Mesuré en écrivant ce lot — le fichier s'en sortait
     jusqu'ici parce que seul `el()` créait des nœuds, et `el()` ferme sur le
     global. Dès qu'on crée un bouton à la main, le piège mord. */
  const { decisions, resolved } = ctx;
  const perso = ctx.document;
  const wrap = el("div", "inheritance-boosts");
  const ordre = SRD_ABILITY_ORDER.filter((k) => plan.options.includes(k));
  for (const key of ordre) {
    const path = `background.boost.${key}`;
    const step = planAt(decisions, path);
    const current = currentBoostValue(perso, key);
    const col = el("section", "inheritance-boost dalle-intermediaire");
    col.dataset.row = key;
    col.append(el("span", "inheritance-boost-key", [text(key.toUpperCase())]));
    const molette = el("div", "inheritance-wheel");
    /* Trois choix, et TROIS SEULEMENT (B4.2). `0` n'est pas une valeur du
       moteur : c'est l'ABSENCE de boost, donc un `clear` — même geste que le
       rond éteint de Compétences (B7.4). */
    for (const valeur of [0, 1, 2]) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inheritance-notch";
      btn.dataset.value = String(valeur);
      markPressed(btn, valeur === 0 ? current === undefined : current === valeur);
      btn.textContent = valeur === 0 ? "0" : `+${valeur}`;
      btn.setAttribute("aria-label", `${key.toUpperCase()} ${valeur === 0 ? "no boost" : `+${valeur}`}`);
      btn.addEventListener("click", () => act(valeur === 0
        ? { kind: "clear", path }
        : { kind: "set", path, value: valeur }));
      molette.append(btn);
    }
    col.append(molette);
    if (step && step.lock) col.append(el("p", "skills-refusal", [text(decisionRefusalWord(step.lock))]));
    const final = renderFinalColumn(resolved, key, currentAbilityValue(perso, key));
    if (final) col.append(final);
    wrap.append(col);
  }
  return wrap;
}

/**
 * @param {object} ctx
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {object} ctx.document   le document brut
 * @param {object} ctx.resolved   la fiche dérivée
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {string} [ctx.open]     le panneau ouvert : "boost" | "feat" | null
 */
export function renderInheritanceStep(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "inheritance-step");

  /* ⚠️ DEUX FORMES, SELON CE QUE LE PLAN PUBLIE (lot 46, conservé tel quel) :
     un seul arrière-plan (pile FH) → une simple MENTION ; plusieurs (SRD pur,
     quatre) → une VRAIE liste, même geste que Class/Species. Les avoir
     confondues aurait fait disparaître un choix réel sur un personnage SRD. */
  const backgroundPlan = planAt(decisions, "background");
  if (backgroundPlan && backgroundPlan.options.length > 1) {
    const choix = renderRecordChoice({
      decisions, path: "background", kind: "background", title: "Background", query: ctx.query, onAction: act
    });
    if (choix) section.append(choix.node);
  } else if (backgroundPlan) {
    section.append(renderFrame(ctx.query, backgroundPlan));
  }

  /* ⛔ B4.2 — QUAND UN PANNEAU EST OUVERT, L'AUTRE DISPARAÎT. Pas grisé,
     pas replié : absent. C'est ce qui rend la scène lisible sur 360 px. */
  if (ctx.open === "boost") {
    const plan = planAt(decisions, "background.boost");
    if (!plan) return section;
    section.append(el("section", "inheritance-explain dalle-intermediaire", [
      el("h3", null, [text("Ability boost")]),
      el("p", null, [text(`Spread ${plan.expected} point${plan.expected > 1 ? "s" : ""} across your abilities.`)])
    ]));
    if (plan.lock) section.append(el("p", "skills-refusal", [text(decisionRefusalWord(plan.lock))]));
    section.append(renderBoostColumns(ctx, plan, act));
    return section;
  }
  if (ctx.open === "feat") return section; // le catalogue le rend (B4.4, « comme Class et Species »)

  section.append(renderPanels(ctx, act));
  return section;
}

/** LE CORPS D'UNE FICHE DE DON, pour le catalogue partagé (B4.4 : « comme
 *  Class et Species »). Le don porte sa DESCRIPTION, que la commande du lot
 *  46 exigeait déjà — c'est ce que la fiche plein écran offre enfin. */
export function renderFeatCardBody(query, id) {
  const view = query({ kind: "feat", id });
  const data = (view && view.record && view.record.data) || {};
  const noeuds = [];
  const desc = typeof data.description === "string" ? data.description : null;
  if (desc) noeuds.push(el("p", "catalogue-card-prose", [text(desc)]));
  /* Le bonus de pool que certains dons accordent (`skill_points.bonus`) —
     lu au record, jamais recalculé. */
  const bonus = data.skill_points && data.skill_points.bonus;
  if (Number.isInteger(bonus)) {
    noeuds.push(el("p", "catalogue-card-prose", [text(`+${bonus} skill points`)]));
  }
  return noeuds;
}

/** LE PALIER — un seul, et il ferme le panneau ouvert (B4.4 étape 2 :
 *  « toutes les fenêtres intermédiaires disparaissent »). Panneaux fermés :
 *  `Validate` avance quand LES DEUX cercles sont cochés (B4.4 étape 6). */
export function inheritanceValidate(ctx) {
  const decisions = ctx.decisions || [];
  if (ctx.open) {
    return {
      exists: true,
      ready: inheritancePanelDone(decisions, ctx.open),
      action: null,
      next: "close"
    };
  }
  const tout = INHERITANCE_PANELS.every((p) => inheritancePanelDone(decisions, p.id));
  return { exists: true, ready: tout, action: null, next: "step" };
}
