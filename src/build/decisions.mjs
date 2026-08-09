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
  const byRecord = new Map();
  const all = [];
  for (const view of viewsOf(query, "skill")) {
    const slug = view && view.record && view.record.slug;
    if (typeof slug !== "string") continue;
    byRecord.set(view.id, slug);
    all.push(slug);
  }
  return { byRecord, all: sorted(all) };
}

function skillOptions(declaration, skills) {
  if (!declaration || typeof declaration !== "object") return null;
  if (declaration.from === "any") return skills.all;
  if (!Array.isArray(declaration.from)) return null;
  return sorted(declaration.from.map((id) => skills.byRecord.get(id)));
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
