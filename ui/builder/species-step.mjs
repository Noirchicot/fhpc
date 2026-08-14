/* ══ L'ÉTAPE SPECIES — lot 42, REFAITE AU LOT 60 (B3 = B2) ════════════════
   Eric, 2026-08-14 : *« l'étape 3 va être identique à la 2 »*. Species est
   donc le MÊME écran que Class — catalogue à défilement aimanté, rail,
   `Validate` à paliers — et tout ça vit dans `catalogue.mjs`, partagé.
   ⛔ ERGONOMIE-BUILDER.md l'exige mot pour mot : *« Ne recopie pas B2 ici.
   Une règle écrite deux fois diverge. B3 = B2, point. »*

   Ce fichier ne garde donc que **ce qui appartient à Species** : à quoi
   ressemble une fiche d'espèce, et ce que confirme son 2ᵉ palier.

   ── LES TROIS ÉTATS D'ESPÈCE (lot 42, §3c) — LE CARNET DIT LEQUEL, jamais
   le nom de l'espèce :
     · `species.skillBudget` publié → LA BOURSE CAPTIVE (Elf, Elestu) : des
       points sur des compétences nommées, palier au choix par compétence ;
     · `species.skills` publié → UN CHOIX IMPOSÉ (Human, Araag) — même QCM
       que `class.skills` ;
     · ni l'un ni l'autre (Loroka, et 8 autres) → RIEN.
   ⭐ ET CE TROISIÈME CAS EST CE QUE LE LOT 60 A DÛ TRANCHER : une espèce qui
   n'accorde rien n'a **QU'UN SEUL PALIER**. Un 2ᵉ appui sur un menu vide
   serait un geste pour rien. I.4 le prévoit : « un écran peut en compter un,
   deux ou trois ».

   ⛔ LE LIGNAGE NE SE CHOISIT TOUJOURS PAS (lot 42, §0.4) : le personnage
   d'exemple porte `species.lineage`, mais AUCUN plan ne l'accompagne — le
   moteur le rend `unconsumed`. Un QCM ici afficherait un choix sans effet. */

import { planAt, renderPicker, renderSlotQcm, decisionRefusalWord } from "./carnet.mjs?v=1";
import { renderCardRows, renderCardNames } from "./catalogue.mjs?v=1";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function skillLabel(query, id) {
  const view = query({ kind: "skill", id });
  return view && view.record ? view.record.name : id;
}
/* Capitalisation d'AFFICHAGE seulement (« half » → « Half ») — un mot
   d'écran, pas une règle (même famille que `CATEGORY_LABEL`, lot 39). */
function tierLabel(value) {
  return typeof value === "string" && value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}

export const SPECIES_CATALOGUE = { path: "species", kind: "species", label: "Species" };

/** LE CORPS D'UNE FICHE D'ESPÈCE. ⚠️ Ce ne sont PAS les mêmes lignes que
 *  Class, et c'est le point : le catalogue est partagé, la fiche ne l'est
 *  pas. Ici : taille, vitesse, type de créature, sens — puis les deux
 *  apports Fate's Hand (`destiny.base`, `skill_points`), absents d'un
 *  personnage SRD pur, et alors la ligne n'existe simplement pas. */
export function renderSpeciesCardBody(query, id) {
  const view = query({ kind: "species", id });
  const data = (view && view.record && view.record.data) || {};
  const sens = Array.isArray(data.senses)
    ? data.senses.map((s) => (s && s.range_ft ? `${s.name} ${s.range_ft} ft` : s && s.name)).filter(Boolean).join(", ")
    : null;
  const destiny = data.destiny && data.destiny.base;
  /* `skill_points.by_level["1"]` : ce que l'espèce ajoute au pool DÈS le
     niveau 1. Les paliers supérieurs existent dans le record ; les afficher
     ferait lire un personnage qu'on ne construit pas encore. */
  const bump = data.skill_points && data.skill_points.by_level && data.skill_points.by_level["1"];
  const rows = renderCardRows([
    ["Size", data.size],
    ["Speed", data.speed],
    ["Creature type", data.creature_type],
    ["Senses", sens],
    ["Destiny", Number.isFinite(destiny) ? String(destiny) : null],
    ["Skill points", Number.isFinite(bump) ? `+${bump}` : null]
  ]);
  const traits = (Array.isArray(data.traits) ? data.traits : [])
    .map((t) => t && t.name).filter((n) => typeof n === "string");
  return [rows, renderCardNames("Traits", traits)].filter(Boolean);
}

/* ══ LA BOURSE CAPTIVE (Keen Senses…) ════════════════════════════════════
   `species.skillBudget`, ses propres verbes sur `species.skillBudget.<slug>`
   — les MÊMES chemins que `skills-step.mjs` sait déjà lire et écrire : les
   deux écrans opèrent sur le même document, aucune incohérence possible. */

/* ⚠️ L'EXCEPTION DU LOT 42, CONSERVÉE TELLE QUELLE, et sa raison : un slug
   JAMAIS CLIQUÉ ne porte AUCUNE entrée dans `decisions[]` (les sous-plans ne
   sont générés que pour les chemins déjà présents dans `build.choices`). Sur
   une espèce fraîchement choisie, il n'existe donc AUCUN endroit vivant où
   lire la paire `half`/`proficient`. Un repli à `[]` ferait disparaître les
   boutons de palier tant que le joueur n'a rien cliqué — c'est l'attaque qui
   avait trouvé ce bogue au lot 42. */
const BUDGET_TIERS = ["half", "proficient"];

function renderSpeciesBudget(ctx, budgetPlan, act) {
  const { decisions, query } = ctx;
  const wrap = el("section", "skills-budget-block");
  wrap.dataset.status = budgetPlan.status;
  wrap.append(el("h3", null, [text("Species skill budget")]));
  wrap.append(el("p", "skills-budget-note", [text(`${budgetPlan.answered} of ${budgetPlan.expected} points spent`)]));
  if (budgetPlan.lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(budgetPlan.lock))]));
  const rows = el("div", "skills-rows");
  for (const slug of budgetPlan.options) {
    const path = `species.skillBudget.${slug}`;
    const step = planAt(decisions, path);
    const row = el("div", "skills-row");
    row.dataset.row = slug;
    row.append(el("span", "record-row-label", [text(skillLabel(query, slug))]));
    row.append(renderPicker({
      options: step ? step.options : BUDGET_TIERS,
      selected: step ? step.selected : [],
      labelOf: tierLabel,
      onSelect: (value) => act({ kind: "set", path, value }),
      onClear: () => act({ kind: "clear", path }),
      lock: step ? step.lock : null
    }));
    rows.append(row);
  }
  wrap.append(rows);
  return wrap;
}

/** LE MENU DU 2ᵉ PALIER — la bourse OU le QCM, jamais les deux, jamais rien
 *  (si c'était rien, il n'y aurait pas de 2ᵉ palier : voir `speciesPalier2`). */
export function renderSpeciesChoices(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const act = onAction || ctx.onAction || (() => {});
  const menu = el("div", "catalogue-choices");
  const budget = planAt(decisions, "species.skillBudget");
  if (budget) {
    menu.append(renderSpeciesBudget(ctx, budget, act));
    return menu;
  }
  const qcm = renderSlotQcm({
    decisions, basePath: "species.skills", title: "Species skill",
    labelOf: (id) => skillLabel(ctx.query, id), onAction: act
  });
  if (qcm) menu.append(qcm);
  return menu;
}

/** LE 2ᵉ PALIER DE SPECIES — `null` quand l'espèce n'accorde rien.
 *
 *  ⚠️ CE QU'ERIC N'A PAS DIT, ET QUI EST DONC INFÉRÉ : ERGONOMIE-BUILDER.md
 *  le signale lui-même — « le 2ᵉ palier de Validate est-il ce budget ? Sur
 *  Class, Validate 2 = features choisis. L'équivalent ici serait le budget
 *  d'espèce — inféré, pas dit par Eric ». C'est la lecture retenue : elle
 *  découle de « B3 = B2 », et elle est la seule qui donne un sens au 2ᵉ
 *  appui. Signalée ici plutôt que fondue dans le code. */
export function speciesPalier2(decisions) {
  const budget = planAt(decisions, "species.skillBudget");
  if (budget) return { ready: budget.answered >= budget.expected };
  const qcm = planAt(decisions, "species.skills");
  if (qcm) return { ready: qcm.answered >= qcm.expected };
  return null; // Loroka & co : un seul palier
}
