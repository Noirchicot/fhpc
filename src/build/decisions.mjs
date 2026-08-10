/* ══ LA PROJECTION PUBLIQUE DES DÉCISIONS ═══════════════════════════════════
   Ce carnet ne fabrique aucune règle et ne modifie aucun choix. Il relit les
   seules déclarations mécaniques que le contrat de couche porte vraiment,
   puis rend ce que `choose`, `set` et `clear` peuvent faire bouger avant le
   prochain `rebuild`.

   Une décision multiple publie son PLAN (compteurs globaux) et ses ÉTAPES
   consommables. Les chemins déjà choisis sont conservés : un constructeur
   peut donc effacer ou remplacer exactement ce qu'il avait posé. Les places
   manquantes reçoivent un chemin générique valide ; la dérivation juge une
   compétence par sa racine et par la liste `from`, jamais par un nom de trait.

   Aucun mot affichable ne vit ici. `status`, `mode` et les options sont des
   identifiants ; les verrous sont les violations structurées du lot 27. */

import { buildViolation } from "./validate.mjs";
import { allowedSlugs, indexSkills } from "./skills.mjs";

const STATUS = Object.freeze({ pending: "pending", answered: "answered", locked: "locked" });

function sorted(values) {
  return [...new Set(values.filter((value) => typeof value === "string"))].sort();
}

function viewsOf(query, kind) {
  const views = query({ kind });
  return Array.isArray(views) ? views : [];
}

function recordProvenance(mode, kind, view, field) {
  return { mode, kind, id: view.id, field };
}

function finish(entry, lock) {
  entry.remaining = Math.max(0, entry.expected - entry.answered);
  if (lock) {
    entry.status = STATUS.locked;
    entry.lock = lock;
  } else {
    entry.status = entry.remaining === 0 ? STATUS.answered : STATUS.pending;
  }
  return entry;
}

function explicitCost(declaration) {
  return declaration && Number.isInteger(declaration.cost) ? declaration.cost : undefined;
}

function refPlan(query, choices, kind) {
  const choice = choices.find((entry) => entry && entry.path === kind);
  const options = sorted(viewsOf(query, kind).map((view) => view.id));
  const selected = choice && choice.ref && choice.ref.kind === kind ? [choice.ref.id] : [];
  let lock = null;
  if (choice && selected.length === 0) {
    lock = buildViolation("decision.kind-mismatch", {
      path: kind,
      expectedKind: kind,
      actualKind: choice.ref && typeof choice.ref.kind === "string" ? choice.ref.kind : "value"
    }, kind);
  } else if (selected.length > 0 && !options.includes(selected[0])) {
    lock = buildViolation("decision.option-unavailable", {
      path: kind, selected: selected[0], options: options.join(", ") || "none"
    }, kind);
  }
  return finish({ path: kind, options, selected, expected: 1, answered: selected.length }, lock);
}

function skillsIndex(query) {
  return indexSkills(viewsOf(query, "skill"));
}

function skillOptions(declaration, skills) {
  const allowed = allowedSlugs(declaration, skills);
  return allowed === null ? null : sorted([...allowed]);
}

function multiPlan({ choices, root, basePath, options, expected, provenance: from, cost }) {
  const prefix = `${basePath}[`;
  const candidates = choices.filter((choice) => choice && choice.path !== root &&
    (choice.path.startsWith(`${root}.`) || choice.path.startsWith(`${root}[`)) &&
    choice.value !== undefined && (options.includes(choice.value) || choice.path === basePath || choice.path.startsWith(prefix)));
  const selected = candidates.filter((choice) => typeof choice.value === "string" && options.includes(choice.value));
  const invalid = candidates.find((choice) => !options.includes(choice.value));
  let lock = invalid ? buildViolation("decision.option-unavailable", {
    path: invalid.path, selected: String(invalid.value), options: options.join(", ") || "none"
  }, invalid.path) : null;
  if (!lock && selected.length > expected) {
    lock = buildViolation("skill-grant.count-mismatch", {
      root, declared: expected, actual: selected.length, answers: selected.map((choice) => choice.value).join(", ") || "none"
    }, root);
  }

  const plan = { path: basePath, options, selected: selected.map((choice) => choice.value), expected, answered: selected.length, provenance: from };
  if (cost !== undefined) plan.cost = cost;
  const entries = [finish(plan, lock)];

  let next = 0;
  for (const choice of candidates) {
    const valid = typeof choice.value === "string" && options.includes(choice.value);
    const step = {
      path: choice.path,
      options,
      selected: valid ? [choice.value] : [],
      expected: 1,
      answered: valid ? 1 : 0,
      provenance: from
    };
    if (cost !== undefined) step.cost = cost;
    entries.push(finish(step, valid ? null : buildViolation("decision.option-unavailable", {
      path: choice.path, selected: String(choice.value), options: options.join(", ") || "none"
    }, choice.path)));
    const match = /\[([0-9]+)\]$/.exec(choice.path);
    if (match) next = Math.max(next, Number(match[1]) + 1);
  }
  for (let missing = selected.length; missing < expected; missing += 1) {
    while (entries.some((entry) => entry.path === `${basePath}[${next}]`)) next += 1;
    const step = { path: `${basePath}[${next}]`, options, selected: [], expected: 1, answered: 0, provenance: from };
    if (cost !== undefined) step.cost = cost;
    entries.push(finish(step));
    next += 1;
  }
  return entries;
}

function backgroundBoostPlan(choices, view) {
  const data = view.record.data || {};
  if (!Array.isArray(data.ability_keys)) return [];
  const options = sorted(data.ability_keys);
  const candidates = choices.filter((choice) => choice && /^background\.boost\.[a-z]{3}$/.test(choice.path || ""));
  const selected = [];
  let points = 0;
  let lock = null;
  for (const choice of candidates) {
    const key = choice.path.slice("background.boost.".length);
    if (!options.includes(key)) {
      lock ||= buildViolation("background.boost-disallowed", {
        path: choice.path, backgroundId: view.id, abilityKeys: options.join(", ")
      }, choice.path);
      continue;
    }
    if (Number.isInteger(choice.value) && choice.value > 0) {
      selected.push(key);
      points += choice.value;
    } else {
      lock ||= buildViolation("decision.option-unavailable", {
        path: choice.path, selected: String(choice.value), options: options.join(", ") || "none"
      }, choice.path);
    }
  }
  const from = recordProvenance("offered", "background", view, "ability_keys");
  const plan = finish({ path: "background.boost", options, selected: sorted(selected), expected: 3, answered: points, provenance: from }, lock);
  const entries = [plan];
  for (const choice of candidates) {
    const key = choice.path.slice("background.boost.".length);
    const valid = options.includes(key) && Number.isInteger(choice.value) && choice.value > 0;
    entries.push(finish({
      path: choice.path, options, selected: valid ? [key] : [], expected: 1, answered: valid ? 1 : 0, provenance: from
    }, valid ? null : (options.includes(key)
      ? buildViolation("decision.option-unavailable", {
          path: choice.path, selected: String(choice.value), options: options.join(", ") || "none"
        }, choice.path)
      : buildViolation("background.boost-disallowed", {
          path: choice.path, backgroundId: view.id, abilityKeys: options.join(", ")
        }, choice.path))));
  }
  return entries;
}

function backgroundFeatPlan(choices, view) {
  const featId = view.record.data && view.record.data.feat_id;
  if (typeof featId !== "string") return [];
  const choice = choices.find((entry) => entry && entry.path === "background.feat");
  const selected = choice && choice.ref && choice.ref.kind === "feat" ? [choice.ref.id] : [];
  const from = recordProvenance("required", "background", view, "feat_id");
  const lock = selected.length > 0 && selected[0] !== featId
    ? buildViolation("background.feat-mismatch", { selectedId: selected[0], backgroundId: view.id, featId }, "background.feat")
    : null;
  return [finish({ path: "background.feat", options: [featId], selected, expected: 1, answered: selected.length, provenance: from }, lock)];
}

function backgroundToolPlan(choices, view) {
  const data = view.record.data || {};
  if (typeof data.tool_id === "string") {
    return [finish({
      path: "background.tool", options: [data.tool_id], selected: [data.tool_id], expected: 1, answered: 1,
      provenance: recordProvenance("required", "background", view, "tool_id")
    })];
  }
  const declaration = data.tool_choice;
  if (!declaration || !Array.isArray(declaration.from)) return [];
  const options = sorted(declaration.from);
  const choice = choices.find((entry) => entry && entry.path.startsWith("background.") && entry.ref && entry.ref.kind === "tool");
  const selected = choice ? [choice.ref.id] : [];
  const path = choice ? choice.path : "background.tool";
  const from = recordProvenance("offered", "background", view, "tool_choice");
  const lock = selected.length > 0 && !options.includes(selected[0])
    ? buildViolation("decision.option-unavailable", { path, selected: selected[0], options: options.join(", ") || "none" }, path)
    : null;
  const entry = { path, options, selected, expected: 1, answered: selected.length, provenance: from };
  const cost = explicitCost(declaration);
  if (cost !== undefined) entry.cost = cost;
  return [finish(entry, lock)];
}

/* ══ LOT 34 — LE BUDGET CAPTIF D'ESPÈCE (Keen Senses) ═══════════════════════
   `granted_skill_budget = {points, from}` n'est pas un `multiPlan` : ce n'est
   pas N maîtrises pleines à choisir, c'est un budget de points, dépensé à
   ½ ou Plein sur une liste fermée. Contrat §4e : « un groupe DISTINCT, pas
   mélangé aux lignes du pool de classe » — c'est un plan à PART, sous
   `species.skillBudget`, jamais fusionné avec `species.skills`. */
const BUDGET_TIER_COST = { half: 1, proficient: 2 };

function speciesBudgetPlan(choices, speciesView, skills) {
  const budget = speciesView.record.data && speciesView.record.data.granted_skill_budget;
  if (!budget || typeof budget !== "object" || Array.isArray(budget) ||
    !Number.isInteger(budget.points) || budget.points <= 0) {
    return [];
  }
  const options = skillOptions(budget, skills); // ne lit que `.from` — la même fonction que le choix compté
  if (options === null) return [];

  const prefix = "species.skillBudget.";
  const candidates = choices.filter((choice) => choice && typeof choice.path === "string" &&
    choice.path.startsWith(prefix) && typeof choice.value === "string");
  const from = recordProvenance("offered", "species", speciesView, "granted_skill_budget");

  let spent = 0;
  const selected = [];
  const steps = [];
  let planLock = null;
  for (const choice of candidates) {
    const slug = choice.path.slice(prefix.length);
    const value = choice.value;
    let lock = null;
    if (!options.includes(slug)) {
      lock = buildViolation("skill-budget.option-unavailable", {
        path: choice.path, selected: slug, options: options.join(", ") || "none"
      }, choice.path);
    } else if (!Object.hasOwn(BUDGET_TIER_COST, value)) {
      lock = buildViolation("skill-budget.tier-invalid", { path: choice.path, value: String(value) }, choice.path);
    } else {
      selected.push(slug);
      spent += BUDGET_TIER_COST[value];
    }
    steps.push(finish({
      path: choice.path, options: Object.keys(BUDGET_TIER_COST), selected: lock ? [] : [value],
      expected: 1, answered: lock ? 0 : 1, provenance: from
    }, lock));
    planLock ||= lock;
  }
  if (!planLock && spent > budget.points) {
    planLock = buildViolation("skill-budget.overspent", {
      path: "species.skillBudget", spent, points: budget.points
    }, "species.skillBudget");
  }
  const plan = finish({
    path: "species.skillBudget", options, selected: sorted(selected), expected: budget.points, answered: spent,
    provenance: from
  }, planLock);
  return [plan, ...steps];
}

/* ⚠️ LOT 34 — CE QUI N'EST DÉLIBÉRÉMENT PAS ICI. Le canal de dépense du pool
   principal (`class.skillSpend.<slug>`) et son verrou de palier le plus haut
   ne sont PAS projetés par ce carnet. Mesuré, pas oublié : ce fichier vit
   dans `src/build/`, et `tests/fh-skill-pool.test.mjs` y interdit
   littéralement le VOCABULAIRE d'une mécanique de couche (le nom du champ de
   pool, le nom de ses coûts, le nom de son verrou) — la même loi §0.12 qui
   tient `derive.mjs`. Juger cette dépense demande de lire CE champ-là, donc
   ce carnet ne peut pas le faire sans le nommer. Le refus keyé existe quand
   même : `src/modules/fh/skill-pool.mjs` (hors `src/build/`, donc hors du
   garde) le rend via `outcome.violations`, un canal générique de plus dans
   le même protocole que `skillTiers` — `derive.mjs` le recopie tel quel,
   sans jamais nommer ce qu'il transporte. Voir `INVENTAIRE-LOT-34.md`,
   arbitrage n°4 : la frontière est mesurée, pas devinée. */

/** Rend le septième carnet de `rebuild`, trié et sans chemin en double. */
export function projectDecisions({ query, choices }) {
  const list = Array.isArray(choices) ? choices : [];
  const entries = [refPlan(query, list, "class"), refPlan(query, list, "species"), refPlan(query, list, "background")];
  const skills = skillsIndex(query);

  const classChoice = list.find((choice) => choice && choice.path === "class" && choice.ref && choice.ref.kind === "class");
  const classView = classChoice ? query({ kind: "class", id: classChoice.ref.id }) : null;
  if (classView) {
    const declaration = classView.record.data && classView.record.data.skill_choice;
    const options = skillOptions(declaration, skills);
    if (options && Number.isInteger(declaration.count) && declaration.count > 0) {
      entries.push(...multiPlan({
        choices: list, root: "class", basePath: "class.skills", options, expected: declaration.count,
        provenance: recordProvenance("offered", "class", classView, "skill_choice"), cost: explicitCost(declaration)
      }));
    }
  }

  const speciesChoice = list.find((choice) => choice && choice.path === "species" && choice.ref && choice.ref.kind === "species");
  const speciesView = speciesChoice ? query({ kind: "species", id: speciesChoice.ref.id }) : null;
  if (speciesView) {
    const declaration = speciesView.record.data && speciesView.record.data.granted_skill_choice;
    const options = skillOptions(declaration, skills);
    if (options && Number.isInteger(declaration.count) && declaration.count > 0) {
      entries.push(...multiPlan({
        choices: list, root: "species", basePath: "species.skills", options, expected: declaration.count,
        provenance: recordProvenance("offered", "species", speciesView, "granted_skill_choice"), cost: explicitCost(declaration)
      }));
    }
    // LOT 34 — le budget captif (Keen Senses), un groupe DISTINCT (contrat §4e).
    entries.push(...speciesBudgetPlan(list, speciesView, skills));
  }

  const backgroundChoice = list.find((choice) => choice && choice.path === "background" && choice.ref && choice.ref.kind === "background");
  const backgroundView = backgroundChoice ? query({ kind: "background", id: backgroundChoice.ref.id }) : null;
  if (backgroundView) {
    entries.push(...backgroundBoostPlan(list, backgroundView));
    entries.push(...backgroundFeatPlan(list, backgroundView));
    entries.push(...backgroundToolPlan(list, backgroundView));
  }

  const unique = new Map();
  for (const entry of entries) unique.set(entry.path, entry);
  return [...unique.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
