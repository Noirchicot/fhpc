/* ══ L'ÉTAPE SPECIES — lot 42 ═════════════════════════════════════════════
   Même loi que Class : le moteur prononce, l'écran affiche. La liste (12
   options, `choose`) est identique en forme à Class — `renderRecordChoice`,
   partagé par `carnet.mjs`, porte les deux.

   ── LES TROIS ÉTATS D'ESPÈCE (§3c, mesuré §0.2 de la commande) — le carnet
   dit LEQUEL une espèce porte, cet écran ne devine jamais sur le nom :
     · `species.skillBudget` publié → LA BOURSE CAPTIVE (Elf, Elestu) : 2
       points sur 3 compétences nommées, palier au choix par compétence
       (`species.skillBudget.<slug>`, options `half`/`proficient` — LUES sur
       le sous-plan, jamais les deux noms écrits en dur : le bug du v1 que
       la commande nomme, §3c).
     · `species.skills` publié → UN CHOIX IMPOSÉ (Human, Araag) : 1 parmi
       les options du plan — MÊME QCM que `class.skills` (`renderSlotQcm`),
       un seul slot ici.
     · ni l'un ni l'autre (Loroka, et 8 autres) → RIEN. Pas un cadre vide :
       aucun des deux blocs n'est même construit.

   ⛔ LE LIGNAGE NE SE CHOISIT PAS (§0.4 de la commande) : le personnage
   d'exemple porte `species.lineage: "high-elf"`, mais AUCUN plan
   `species.lineage` n'existe dans `decisions[]` — le moteur le rend
   `unconsumed` (`underived.lineage-not-composed`). Un QCM ici afficherait
   un choix sans effet ; ce fichier n'en construit aucun. La commande
   autorise, EN OPTION, de montrer la raison du moteur (comme le lot 40
   affiche une rubrique vide) — non fait dans ce lot : ça demanderait de
   faire remonter `report.underived` jusqu'au `ctx` de cet écran, une
   plomberie de plus que ni `shell.mjs` ni aucun des deux autres écrans ne
   portent aujourd'hui. Voir INVENTAIRE-LOT-42.md. */

import { planAt, renderRecordChoice, renderSlotQcm, renderPicker, decisionRefusalWord } from "./carnet.mjs";

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

/* Capitalisation d'affichage seulement (« half » → « Half ») — même famille
 *  que `CATEGORY_LABEL` de `skills-step.mjs` : un mot d'écran, pas une
 *  règle. */
function tierLabel(value) {
  return typeof value === "string" && value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}

/* ⚠️ LA MÊME EXCEPTION QUE `skills-step.mjs` (`BUDGET_TIERS`, tête de
   fichier) — et pour LA MÊME RAISON, mesurée ici de nouveau (attaque jouée
   en écrivant ce test) : un slug JAMAIS CLIQUÉ ne porte AUCUNE entrée dans
   `decisions[]` (`speciesBudgetPlan`, `src/build/decisions.mjs` — les
   sous-plans ne sont générés QUE pour les chemins déjà présents dans
   `build.choices`). Sur une espèce fraîchement choisie, les trois lignes
   n'ont donc PAS de sous-plan avant le premier clic : il n'existe alors
   AUCUN endroit vivant où lire la paire `half`/`proficient`. Ce n'est pas
   du CONTENU (aucun record de coûts, contrairement à `tier_costs`) — c'est
   un fait STRUCTUREL du mécanisme « budget captif » lui-même, câblé dans
   `src/build/derive.mjs` (`BUDGET_TIER_COST`), la même feuille dont dépend
   déjà `species.skillBudget` pour produire ses propres `options`. Un
   fallback à `[]` ferait disparaître les boutons de palier tant que le
   joueur n'a rien cliqué — c'est l'attaque qui a trouvé ce bogue. */
const BUDGET_TIERS = ["half", "proficient"];

/** La bourse captive (Keen Senses…) : `species.skillBudget`, un groupe à
 *  part, ses propres verbes sur `species.skillBudget.<slug>` — même paths
 *  que ceux que `skills-step.mjs` sait déjà lire/écrire (lot 39, resté
 *  inchangé) : les deux écrans opèrent sur le MÊME document, aucune
 *  incohérence possible entre eux. */
function renderSpeciesBudget(ctx, budgetPlan) {
  const { decisions, query } = ctx;
  const act = ctx.onAction;
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

/**
 * @param {object} ctx
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {(action: {kind:"choose"|"set"|"clear", path:string, ref?:object, value?:*}) => void} onAction
 */
export function renderSpeciesStep(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const query = ctx.query;
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "species-step");

  const choice = renderRecordChoice({
    decisions, path: "species", kind: "species", title: "Species", query, onAction: act
  });
  if (!choice) return section; // aucun plan `species` publié
  section.append(choice.node);

  const selectedId = choice.plan.selected[0];
  if (!selectedId) return section; // aucune espèce encore posée

  /* §3c — LE CARNET DIT LEQUEL, PAS LE NOM DE L'ESPÈCE : on regarde quel
     plan `projectDecisions` a publié, jamais `resolved.identity.species`. */
  const budgetPlan = planAt(decisions, "species.skillBudget");
  if (budgetPlan) {
    section.append(renderSpeciesBudget({ decisions, query, onAction: act }, budgetPlan));
    return section;
  }

  const skillsQcm = renderSlotQcm({
    decisions, basePath: "species.skills", title: "Species skill",
    labelOf: (id) => skillLabel(query, id), onAction: act
  });
  if (skillsQcm) section.append(skillsQcm);
  // ni l'un ni l'autre : l'espèce ne donne rien — aucun bloc de plus, pas même un cadre vide.

  return section;
}
