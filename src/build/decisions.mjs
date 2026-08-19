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
import { ABILITY_KEYS, allowedSlugs, indexSkills } from "./skills.mjs";

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

/* ══ LOT 71 — QUEL RECORD EST RETENU POUR UN GENRE : UN SEUL ÉCRIVAIN ═════
   ⛔ CETTE FONCTION EXISTE PARCE QUE LA RÉPONSE ÉTAIT ÉCRITE À DEUX ENDROITS,
   ET QUE LES DEUX SE CONTREDISAIENT.

   Le lot 43 a tranché : *« l'inheritance est **livrée, non choisie** »*. Quand
   un genre ne porte plus qu'UN SEUL record — ce que la couche FH fait
   exprès : elle `disable` les quatre backgrounds du SRD et n'en publie qu'un,
   `fh:background:en:inheritance` — ce record EST l'arrière-plan du
   personnage, sans qu'aucun `choose` ne l'ait désigné. `projectDecisions`
   appliquait bien ce repli **pour les sous-plans** (`background.boost`,
   `background.originFeat[0]`), qui sortaient donc « répondus ».

   🔴 **Mais `refPlan` l'ignorait**, et publiait `background` en `0/1` pour
   toujours. Le carnet se contredisait lui-même, et ça se voyait à l'écran :
   Review — qui lit le carnet, fidèlement — affichait « Inheritance : 0 of 1 ·
   done · done », **la seule étape non faite**, pendant que l'écran
   Inheritance montrait ses deux cercles cochés et laissait `Validate`
   avancer. Signalé par Eric le 2026-08-15 : *« inheritance ne se valide
   pas »*.

   ⚠️ LA PORTÉE EST ÉTROITE, ET C'EST VOULU : **un menu à plusieurs options ne
   se résout JAMAIS tout seul.** Avec douze classes ou neuf espèces, ce repli
   ne se déclenche pas — il ne devinerait pas, il choisirait à la place du
   joueur. Il ne vaut que pour un genre réduit à un seul record par sa pile.

   📌 Et le plan le DIT : `delivered: true`. Un écran a le droit de savoir que
   ce record est arrivé avec la pile plutôt que d'avoir été choisi — sans
   quoi il afficherait un menu à une seule entrée, déjà cochée, qui ne sert à
   rien. */
export function resolvedRef(query, choices, kind) {
  const choice = choices.find((entry) => entry && entry.path === kind);
  const options = sorted(viewsOf(query, kind).map((view) => view.id));
  if (choice) return { id: choice.ref && choice.ref.kind === kind ? choice.ref.id : null, options, choice, delivered: false };
  if (options.length === 1) return { id: options[0], options, choice: null, delivered: true };
  return { id: null, options, choice: null, delivered: false };
}

function refPlan(query, choices, kind) {
  const { choice, options, id, delivered } = resolvedRef(query, choices, kind);
  const selected = id === null ? [] : [id];
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
  const plan = { path: kind, options, selected, expected: 1, answered: selected.length };
  if (delivered) plan.delivered = true;
  return finish(plan, lock);
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
  /* LOT 43, §3e-bis — LE COMPTE DE CRÉNEAUX MANQUANTS, CORRIGÉ. AVANT : la
     boucle partait de `selected.length` (les réponses VALIDES seulement), et
     ignorait qu'un candidat INVALIDE occupe déjà un créneau réel (rendu, avec
     son propre chemin) — un document dont une classe plus étroite succède à
     une plus large (rogue reprenant les deux compétences d'un magicien) en
     obtenait CINQ créneaux pour `expected: 4` : les deux candidats existants
     (un valide, un invalide) PLUS `expected − selected.length = 3` neufs, au
     lieu de `expected − candidates.length = 2`. APRÈS : chaque candidat, valide
     ou non, compte comme un créneau déjà occupé — le compte de créneaux
     RENDUS reste `expected`, quel que soit le nombre de candidats invalides
     parmi eux. Un document sans aucun candidat invalide (le cas courant)
     donne `candidates.length === selected.length` : ce chemin ne bouge pas. */
  const missingSlots = Math.max(0, expected - candidates.length);
  for (let missing = 0; missing < missingSlots; missing += 1) {
    while (entries.some((entry) => entry.path === `${basePath}[${next}]`)) next += 1;
    const step = { path: `${basePath}[${next}]`, options, selected: [], expected: 1, answered: 0, provenance: from };
    if (cost !== undefined) step.cost = cost;
    entries.push(finish(step));
    next += 1;
  }
  return entries;
}

/* LOT 43, §1c — UN RECORD QUI NE NOMME PAS SES CLEFS NE LES RESTREINT PAS.
   Règle GÉNÉRIQUE, écrite en vocabulaire de moteur (`ABILITY_KEYS`, lu là où
   le moteur le tient déjà — `skills.mjs` — jamais recopié en dur) : ⛔ aucun
   mot Fate's Hand ici. Avant ce lot, `ability_keys` absent faisait sortir tôt
   avec `[]` — c'était le trou du §0.4 : sans plan, aucun boost ne pouvait
   jamais être jugé, ni compté ni plafonné.

   LOT 43, §1d — `validate()` DOIT REFUSER UNE RÉPARTITION ILLÉGALE. Deux
   fautes possibles, deux clefs : un point posé sur UNE SEULE caractéristique
   au-delà de 2 (`background.boost-cap-exceeded`, jugé par candidat — c'est le
   patron du plafond par carac) et un TOTAL qui ne vaut pas exactement 3
   (`background.boost-total-mismatch`, jugé une fois le reste propre — c'est
   le patron du total, sur celui de `skill-grant.count-mismatch` : un compte
   qui ne correspond pas se nomme, qu'il soit trop haut OU trop bas). */
const BOOST_CAP = 2;
const BOOST_TOTAL = 3;

function backgroundBoostPlan(choices, view) {
  const data = view.record.data || {};
  const restricted = Array.isArray(data.ability_keys);
  const options = sorted(restricted ? data.ability_keys : ABILITY_KEYS);
  const candidates = choices.filter((choice) => choice && /^background\.boost\.[a-z]{3}$/.test(choice.path || ""));
  const selected = [];
  let points = 0;
  let lock = null;
  const stepLocks = new Map();
  for (const choice of candidates) {
    const key = choice.path.slice("background.boost.".length);
    if (!options.includes(key)) {
      const violation = buildViolation("background.boost-disallowed", {
        path: choice.path, backgroundId: view.id, abilityKeys: options.join(", ")
      }, choice.path);
      stepLocks.set(choice.path, violation);
      lock ||= violation;
      continue;
    }
    if (!Number.isInteger(choice.value) || choice.value <= 0) {
      const violation = buildViolation("decision.option-unavailable", {
        path: choice.path, selected: String(choice.value), options: options.join(", ") || "none"
      }, choice.path);
      stepLocks.set(choice.path, violation);
      lock ||= violation;
      continue;
    }
    if (choice.value > BOOST_CAP) {
      const violation = buildViolation("background.boost-cap-exceeded", {
        path: choice.path, value: choice.value, cap: BOOST_CAP
      }, choice.path);
      stepLocks.set(choice.path, violation);
      lock ||= violation;
      continue;
    }
    selected.push(key);
    points += choice.value;
  }
  /* LE TOTAL, JUGÉ UNE FOIS LE RESTE PROPRE. Un candidat déjà en faute (clef
     hors catalogue, valeur illisible, plafond dépassé) a DÉJÀ son verrou — un
     second verrou de total par-dessus accuserait le total d'une faute qui est
     en réalité celle d'un seul candidat (exactement le défaut du §3e-bis). */
  if (!lock && points !== BOOST_TOTAL) {
    lock = buildViolation("background.boost-total-mismatch", {
      backgroundId: view.id, total: points, expected: BOOST_TOTAL
    }, "background.boost");
  }
  const from = recordProvenance("offered", "background", view, "ability_keys");
  const plan = finish({ path: "background.boost", options, selected: sorted(selected), expected: BOOST_TOTAL, answered: points, provenance: from }, lock);
  const entries = [plan];
  for (const choice of candidates) {
    const key = choice.path.slice("background.boost.".length);
    const stepLock = stepLocks.get(choice.path) || null;
    const valid = !stepLock;
    entries.push(finish({
      path: choice.path, options, selected: valid ? [key] : [], expected: 1, answered: valid ? 1 : 0, provenance: from
    }, stepLock));
  }
  return entries;
}

/* LOT 43, §1b/§3d — LE DON D'ORIGINE, SUR `background.originFeat[0]`.
   ⛔ `background.feat` ET SON REFUS `background.feat-mismatch` DISPARAISSENT :
   aucun consommateur ne lisait ce chemin (`skill-pool.mjs`, `destiny-stat.mjs`
   et le module des arcanes lisent tous `background.originFeat[n]`), et c'était
   la SECONDE source du même refus (avec `block.mjs`, retiré avec lui).

   DEUX FORMES, JAMAIS LES DEUX À LA FOIS sur un même record :
   - `feat_id` (SRD, IMPOSÉ) — même patron que `background.tool` pour
     `tool_id` : la valeur est un FAIT du record, pas un choix à juger. Aucun
     verrou n'est possible ici — un personnage SRD pur ne perd rien (condition
     de sortie n°6), et l'ancien refus de « mismatch » disparaît PARTOUT, pas
     seulement côté Inheritance : ce que le record impose, `refs` l'applique
     déjà (§0.1), ce plan ne fait plus que l'ANNONCER.
   - `feat_choice: {from}` (FH, LIBRE) — `options` = tous les records de genre
     `feat` dont `data.category` vaut la valeur demandée, lus par `query` ;
     `mode: "offered"`, pas `"required"` : le joueur choisit, et un choix hors
     catalogue reste le refus générique `decision.option-unavailable`. */
function backgroundFeatPlan(query, choices, view) {
  const data = view.record.data || {};
  const PATH = "background.originFeat[0]";
  const choice = choices.find((entry) => entry && entry.path === PATH);
  const selected = choice && choice.ref && choice.ref.kind === "feat" ? [choice.ref.id] : [];

  if (typeof data.feat_id === "string") {
    const from = recordProvenance("required", "background", view, "feat_id");
    return [finish({
      path: PATH, options: [data.feat_id], selected: [data.feat_id], expected: 1, answered: 1, provenance: from
    })];
  }

  const declaration = data.feat_choice;
  if (!declaration || typeof declaration !== "object" || typeof declaration.from !== "string") return [];
  const options = sorted(viewsOf(query, "feat")
    .filter((featView) => featView.record.data && featView.record.data.category === declaration.from)
    .map((featView) => featView.id));
  const from = recordProvenance("offered", "background", view, "feat_choice");
  const lock = selected.length > 0 && !options.includes(selected[0])
    ? buildViolation("decision.option-unavailable", { path: PATH, selected: selected[0], options: options.join(", ") || "none" }, PATH)
    : null;
  return [finish({ path: PATH, options, selected, expected: 1, answered: selected.length, provenance: from }, lock)];
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
const BUDGET_TIER_COST = { novice: 1, adept: 2 };

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

/* ══ LOT 74 — LA BORNE DE CRÉATION DES SCORES DE BASE : 3–18 ═══════════════
   Tranchée par ERIC (2026-08-15) : « Choose yourself proposait 1 à 20 —
   c'est n'importe quoi. La borne est 3 à 18. » Une règle du jeu arbitrée,
   écrite ICI sur le patron de `BOOST_CAP`/`BOOST_TOTAL` ci-dessus : le
   moteur la prononce, l'écran la LIT (`CREATION_SCORES` est exporté via
   `src/build/index.mjs`) — la liste ne se réécrit dans AUCUN écran, sinon
   la faute serait seulement déplacée.

   ⚠️ CE QUI EST JUGÉ, ET CE QUI NE L'EST PAS — mesuré avant d'écrire :
   · la borne juge le CHOIX `abilities.<clef>` (le score de BASE), jamais
     `resolved.abilities` : `derive.mjs` additionne les boosts PAR-DESSUS la
     base (`scores[key] += entry.choice.value`), et le personnage d'exemple
     a un INT final de 17 (+3) pour une base de 15. Une base de 18 boostée à
     20 reste donc LÉGALE ici — borner le résolu casserait des personnages
     valides. Le plafond de SORTIE de création (ADDENDUMS §5 n°1, « toutes
     sources, à la fin ») est une AUTRE règle, toujours pas ici.
   · la borne parle À LA CRÉATION : silence dès qu'un `level` ENTIER > 1
     est posé — « au-delà, le SRD reprend la main (plafond 20) » (Eric,
     2026-08-13, le même arbitrage que l'alerte de l'écran Abilities). Un
     document SANS niveau est un document en création : la borne y parle.
     ⭐ Cette condition est un GARDE testé (tests/build-decisions.test.mjs),
     pas un commentaire — si le modèle de montée de niveau change un jour la
     signification du choix de base, c'est le test qui rougira. */
export const CREATION_SCORE_MIN = 3;
export const CREATION_SCORE_MAX = 18;
/** Les seize valeurs qu'un score de base peut prendre à la création — LA
 *  liste que l'écran affiche et que ce plan oppose : un seul écrivain. */
export const CREATION_SCORES = Object.freeze(Array.from(
  { length: CREATION_SCORE_MAX - CREATION_SCORE_MIN + 1 },
  (_, i) => CREATION_SCORE_MIN + i
));

function abilityScorePlans(choices) {
  const levelChoice = choices.find((choice) => choice && choice.path === "level");
  const level = levelChoice ? levelChoice.value : undefined;
  if (Number.isInteger(level) && level > 1) return []; // au-delà de la création : pas arbitré ici
  const entries = [];
  for (const key of ABILITY_KEYS) {
    const path = `abilities.${key}`;
    const choice = choices.find((entry) => entry && entry.path === path);
    let lock = null;
    let selected = [];
    if (choice !== undefined) {
      if (CREATION_SCORES.includes(choice.value)) {
        selected = [choice.value];
      } else {
        lock = buildViolation("abilities.score-out-of-creation-range", {
          path,
          value: typeof choice.value === "number" ? choice.value : String(choice.value),
          min: CREATION_SCORE_MIN,
          max: CREATION_SCORE_MAX
        }, path);
      }
    }
    entries.push(finish({
      path, options: CREATION_SCORES, selected, expected: 1, answered: selected.length
    }, lock));
  }
  return entries;
}

/* ══ LOT 72 — LES PLANS DE SORTS : `class.cantrips[n]` / `class.prepared[n]` ═
   Le côté LECTURE existait en entier (`derive.mjs` : tout choix
   `ref {kind: "spell"}` devient `resolved.spellcasting.spells[]`, et un
   lanceur sans sort déclare `underived.no-spell-choices`). Ce qui manquait
   était le côté « QUOI choisir » : aucun plan publié, donc aucun écran
   possible, aucun jugement — et les sorts d'une ancienne classe traînaient
   dans `unconsumed` sans qu'aucune confirmation puisse les nommer (mesuré,
   2026-08-14 : Wizard → Rogue sur le personnage d'exemple EN, les 7 sorts
   ressortent `unconsumed` et AUCUN plan ne les verrouille).

   CE QUI EST LU, ET RIEN D'AUTRE :
   · le COMPTE attendu — `class-progression.levels[<niveau>].resources.cantrips`
     et `.prepared_spells`, les clefs mécaniques que RECORD-SHAPES documente
     pour la couche EN. ⚠️ Ces clefs de ressource sont LANGUE-NATIVES
     (`layers/TRADUCTION.md`, mesuré : la progression FR porte `sorts_mineurs`
     / `sorts_prepares`) et AUCUNE correspondance FR↔EN n'est inventée ici —
     une table `sorts_mineurs → cantrips` serait la même faute que
     `"Sagesse" → wis` (dépendances interdites du contrat). Une pile qui ne
     déclare pas ces clefs-là ne déclare donc PAS de compte lisible : §1c, un
     record qui ne nomme pas ses clefs ne restreint pas — le plan JUGE les
     réponses posées (options, verrous) mais ne GUIDE pas le compte (pas de
     créneau manquant inventé, pas de verrou de compte, `expected` = les
     réponses valides).
   · les OPTIONS — le croisement `spell.classes × spell.level`. ⚠️ FRAGILITÉ
     NOMMÉE : `spell.classes` liste des NOMS D'AFFICHAGE (« Wizard »,
     « Magicien »), pas des ids. L'appariement se fait contre le nom du
     record de classe (`classView.record.name`), JAMAIS contre une chaîne
     écrite en dur — les deux couches sont cohérentes chacune dans sa langue
     (mesuré : 8 classes castantes × 2 langues), et c'est le record qui parle.
   · le PLAFOND de niveau préparable — `levels[].spell_slots` (tableau,
     langue-neutre : l'index le plus haut à compte > 0), à défaut
     `resources.slot_level` (la magie de pacte vit en scalaire — schéma,
     `slotsRecharge`). Ni l'un ni l'autre déclaré → pas de plafond : même
     règle §1c, on ne restreint pas à la place de la couche.

   UNE CLASSE QUE LA PROGRESSION N'APPELLE PAS NE PUBLIE RIEN — pas un plan
   vide (Rogue, Fighter, Barbarian, Monk : aucune des deux ressources). MAIS
   des réponses qui TRAÎNENT sur ces chemins publient quand même le plan qui
   les juge : c'est lui qui porte les `decision.option-unavailable` que la
   confirmation d'effacement lit (`ui/builder/class-step.mjs`) — sans lui,
   l'ancien Wizard passé Rogue garde ses 7 sorts pour toujours, signalés
   nulle part ailleurs que dans `unconsumed`.

   LES CANDIDATS SONT PRIS PAR CHEMIN (`class.cantrips[n]`), JAMAIS par
   valeur comme `multiPlan` : un sort est un `ref`, pas un scalaire, et les
   options des deux groupes se recouvrent assez peu pour qu'une capture par
   contenu re-range en silence un choix mal posé — le chemin nomme la
   décision, le contenu s'y juge. Un chemin NON indexé (`class.cantrips` nu)
   n'est pas un candidat : son étape écraserait le plan du groupe dans la
   projection dédupliquée par chemin (le même piège existe dans `multiPlan`,
   hérité, pas imité). */
const SPELL_GROUPS = Object.freeze([
  { basePath: "class.cantrips", resource: "cantrips", cantrip: true },
  { basePath: "class.prepared", resource: "prepared_spells", cantrip: false }
]);

function classSpellPlans(query, choices, classView) {
  const levelChoice = choices.find((choice) => choice && choice.path === "level");
  const level = levelChoice && Number.isInteger(levelChoice.value) ? levelChoice.value : null;

  /* La progression pointe SA classe (`data.class`) — le même lien que
     `derive.mjs`, jamais une convention de nommage d'identifiant. */
  const progression = viewsOf(query, "class-progression")
    .find((view) => view.record.data && view.record.data.class === classView.id) || null;
  const row = progression && level !== null && Array.isArray(progression.record.data.levels)
    ? progression.record.data.levels.find((entry) => entry && entry.level === level) || null
    : null;
  const resources = row && row.resources && typeof row.resources === "object" && !Array.isArray(row.resources)
    ? row.resources
    : {};

  /* Le plafond de niveau préparable, lu — jamais déduit d'une table à moi. */
  let slotCap = null;
  if (row && Array.isArray(row.spell_slots)) {
    slotCap = 0;
    row.spell_slots.forEach((count, index) => {
      if (Number.isInteger(count) && count > 0) slotCap = index + 1;
    });
  } else if (Number.isInteger(resources.slot_level) && resources.slot_level > 0) {
    slotCap = resources.slot_level;
  }

  const className = classView.record.name;
  const spellViews = viewsOf(query, "spell").filter((view) => {
    const data = view.record.data || {};
    return Array.isArray(data.classes) && data.classes.includes(className) && Number.isInteger(data.level);
  });

  const entries = [];
  for (const group of SPELL_GROUPS) {
    const declared = resources[group.resource];
    const expected = Number.isInteger(declared) && declared > 0 ? declared : null;

    const prefix = `${group.basePath}[`;
    const candidates = choices.filter((choice) => choice && typeof choice.path === "string" &&
      choice.path.startsWith(prefix));
    if (expected === null && candidates.length === 0) continue; // rien à guider, rien à juger

    const options = sorted(spellViews
      .filter((view) => {
        const spellLevel = view.record.data.level;
        if (group.cantrip) return spellLevel === 0;
        return spellLevel >= 1 && (slotCap === null || spellLevel <= slotCap);
      })
      .map((view) => view.id));

    const from = expected !== null && progression
      ? recordProvenance("offered", "class-progression", progression, `resources.${group.resource}`)
      : null;

    const selected = [];
    const steps = [];
    let planLock = null;
    let next = 0;
    for (const choice of candidates) {
      const ref = choice.ref;
      let lock = null;
      if (!ref || ref.kind !== "spell") {
        lock = buildViolation("decision.kind-mismatch", {
          path: choice.path, expectedKind: "spell",
          actualKind: ref && typeof ref.kind === "string" ? ref.kind : "value"
        }, choice.path);
      } else if (!options.includes(ref.id)) {
        lock = buildViolation("decision.option-unavailable", {
          path: choice.path, selected: ref.id, options: options.join(", ") || "none"
        }, choice.path);
      } else {
        selected.push(ref.id);
      }
      const step = {
        path: choice.path, options, selected: lock ? [] : [ref.id],
        expected: 1, answered: lock ? 0 : 1
      };
      if (from) step.provenance = from;
      steps.push(finish(step, lock));
      planLock ||= lock;
      const match = /\[([0-9]+)\]$/.exec(choice.path);
      if (match) next = Math.max(next, Number(match[1]) + 1);
    }
    if (!planLock && expected !== null && selected.length > expected) {
      planLock = buildViolation("spell-grant.count-mismatch", {
        root: group.basePath, declared: expected, actual: selected.length,
        answers: selected.join(", ") || "none"
      }, group.basePath);
    }

    const plan = {
      path: group.basePath, options, selected: selected.slice(),
      expected: expected !== null ? expected : selected.length,
      answered: selected.length
    };
    if (from) plan.provenance = from;
    entries.push(finish(plan, planLock), ...steps);

    /* Les créneaux MANQUANTS — seulement quand la couche déclare le compte :
       sans déclaration, en inventer serait guider avec un chiffre deviné.
       Même règle que `multiPlan` §3e-bis : chaque candidat, valide ou non,
       occupe un créneau réel. */
    if (expected !== null) {
      const missingSlots = Math.max(0, expected - candidates.length);
      for (let missing = 0; missing < missingSlots; missing += 1) {
        while (entries.some((entry) => entry.path === `${group.basePath}[${next}]`)) next += 1;
        const step = { path: `${group.basePath}[${next}]`, options, selected: [], expected: 1, answered: 0 };
        if (from) step.provenance = from;
        entries.push(finish(step));
        next += 1;
      }
    }
  }
  return entries;
}

/** Rend le septième carnet de `rebuild`, trié et sans chemin en double. */
export function projectDecisions({ query, choices }) {
  const list = Array.isArray(choices) ? choices : [];
  const entries = [refPlan(query, list, "class"), refPlan(query, list, "species"), refPlan(query, list, "background")];
  /* LOT 74 — les six scores de base entrent au carnet : la borne de création
     3–18 (Eric, 2026-08-15) se juge ici, jamais dans un écran. */
  entries.push(...abilityScorePlans(list));
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
    /* LOT 72 — les sorts lisent LE MÊME `classView` que `class.skills` :
       une seule réponse à « quelle est la classe ? » (leçon du lot 71,
       `resolvedRef` — deux écrivains divergent, et ça se voit à l'écran). */
    entries.push(...classSpellPlans(query, list, classView));
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
    /* ══ LE LIGNAGE — un second choix, DANS l'espèce ════════════════════
       Cinq espèces sur douze en portent un : l'Elfe et le Tiefling le
       tiennent du SRD, le Dragonborn, le Goliath et le Hoddon de la couche
       Fate's Hand. Un seul champ pour les cinq — `data.lineages` — donc un
       seul plan.

       ⭐ C'EST `multiPlan` AVEC `expected: 1`, ET PAS UN CHEMIN NEUF. Le
       dépôt a déjà payé d'avoir deux écrivains pour une même question (voir
       la tête de `resolvedRef`). Un lignage se pose comme une compétence
       d'espèce se pose : `species.lineage[0]`, même grammaire, même
       validation d'option, même verrou quand la valeur n'est pas au menu.

       ⛔ SANS COÛT. Le lignage est DONNÉ avec l'espèce, il ne s'achète pas —
       `explicitCost` n'est donc pas appelé, et l'absence de `cost` ici est
       une affirmation, pas un oubli. */
    const lineages = speciesView.record.data && speciesView.record.data.lineages;
    if (Array.isArray(lineages) && lineages.length > 0) {
      entries.push(...multiPlan({
        choices: list, root: "species", basePath: "species.lineage",
        options: lineages.map((option) => option && option.id).filter((id) => typeof id === "string"),
        expected: 1,
        provenance: recordProvenance("offered", "species", speciesView, "lineages")
      }));
    }

    // LOT 34 — le budget captif (Keen Senses), un groupe DISTINCT (contrat §4e).
    entries.push(...speciesBudgetPlan(list, speciesView, skills));
  }

  /* ⭐ LOT 71 — LE MÊME ÉCRIVAIN QUE `refPlan` : `resolvedRef`. Ces deux
     endroits répondaient séparément à « quel est l'arrière-plan ? », et ils
     divergeaient — voir la tête de `resolvedRef`. Le repli du lot 43 est
     conservé mot pour mot dans sa portée ; il a simplement cessé d'exister
     en deux exemplaires. */
  /* LOT 43, §1a/§0.1 — L'INHERITANCE EST « livrée, non choisie ». Sans
     `background` posé, ET quand le genre ne porte plus qu'UN SEUL record
     (les quatre du SRD éteints par la couche FH), ce record-là EST
     l'arrière-plan du personnage sans qu'un `choose` l'ait jamais désigné.
     C'était le cœur du lot 43 (§4, test 1) : sans ce repli, un personnage FH
     publie ses boosts SANS le plan qui les juge.
     ⭐ LOT 71 — le repli n'est plus écrit ici : il vit dans `resolvedRef`,
     qui répond à cette question POUR TOUT LE MONDE, `refPlan` compris. Les
     deux exemplaires divergeaient, et ça se voyait à l'écran (voir la tête
     de `resolvedRef`). La portée n'a pas bougé d'un pouce : un menu à
     PLUSIEURS options ne se résout jamais tout seul. */
  const fond = resolvedRef(query, list, "background");
  const backgroundView = fond.id ? query({ kind: "background", id: fond.id }) : null;
  if (backgroundView) {
    entries.push(...backgroundBoostPlan(list, backgroundView));
    entries.push(...backgroundFeatPlan(query, list, backgroundView));
    entries.push(...backgroundToolPlan(list, backgroundView));
  }

  const unique = new Map();
  for (const entry of entries) unique.set(entry.path, entry);
  return [...unique.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
