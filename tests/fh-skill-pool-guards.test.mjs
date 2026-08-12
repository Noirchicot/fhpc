/* ══ LOT 37 — LES TROIS GARDES DU POOL DE COMPÉTENCES ═══════════════════
   Commande `37-pool-garde` §3 : le mécanisme de refus keyé existe déjà
   (lot 27, mesuré bout en bout par le lot 36) — ce qui manquait, ce sont
   trois contrôles qu'aucun test ne portait :

     3a. le pool ne peut pas finir NÉGATIF — `skill-pool.overspent`, UN SEUL
         refus sur le TOTAL, sans `path` ; le dépassement est TOLÉRÉ pendant
         la répartition (comportement 2a) et REFUSÉ seulement à la sortie
         (`validate()`). Rendu par `src/modules/fh/skill-pool.mjs`.
     3b. au moins un point en OUTILS, TOUJOURS — `skill-pool.no-tool`, une
         propriété du personnage, pas un instant de la création (ARBITRÉ
         §3b). Même module.
     3c. le budget captif d'espèce (Keen Senses) ne dépasse pas son
         plafond — `skill-budget.overspent` EXISTE DÉJÀ dans
         `src/build/decisions.mjs` depuis le lot 34 : le trou mesuré par la
         commande n'était pas l'absence du refus, c'était que `validate()`
         ne projetait jamais le carnet de décisions qui le porte (corrigé
         dans `src/build/block.mjs`, verbe `validate`). Ces deux tests visent
         donc `validate()`, pas `moduleViolations`.

   Chaque clause porte son ACCEPT et son REJET (commande §4). Wizard niveau 1
   sert de base commune : pool de classe 12, deux compétences imposées
   (arcana/history, coût 1 chacune) → 10 points à répartir, tier_costs
   {half:1, proficient:2, expertise:4, imposed:1} (mesuré, `fh-skills-en`). */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const ACOLYTE = "srd:background:en:acolyte";
const CALLIGRAPHER = "calligrapher-s-supplies";
const WIZARD = "srd:class:en:wizard";
const HALFLING = "srd:species:en:halfling";
const ELF = "srd:species:en:elf";

function pile(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhSkillPoolStat()]
  }, options));
}

/* Même fixture que les lots 35/36 : l'Acolyte, patché par `fh-skills-en`,
   n'impose plus rien (addendums §4) — un pool purement de classe. */
function choixDe({ level, classId, speciesId, backgroundId = ACOLYTE, skills = ["arcana", "history"], extra = [] }) {
  return [
    { path: "level", value: level },
    { path: "class", ref: { kind: "class", id: classId } },
    { path: "species", ref: { kind: "species", id: speciesId } },
    { path: "background", ref: { kind: "background", id: backgroundId } },
    { path: "abilities.str", value: 10 },
    { path: "abilities.dex", value: 14 },
    { path: "abilities.con", value: 12 },
    { path: "abilities.int", value: 14 },
    { path: "abilities.wis", value: 12 },
    { path: "abilities.cha", value: 14 },
    { path: "currency.cp", value: 0 },
    { path: "currency.sp", value: 0 },
    { path: "currency.gp", value: 15 },
    { path: "currency.pp", value: 0 },
    { path: "class.skills[0]", value: skills[0] },
    { path: "class.skills[1]", value: skills[1] }
  ].concat(extra);
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot37-garde-pool",
    name: "Garde du pool",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-skill-pool-guards", version: "1.0.0" },
    created: "2026-08-12T09:00:00Z",
    modified: "2026-08-12T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);

/* ══ 1 — LE POOL NE PEUT PAS FINIR NÉGATIF (§3a) ══════════════════════ */

test("ACCEPTÉ — un pool dépensé exactement à zéro : `validate()` passe (la limite n'est pas une erreur)", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: HALFLING,
      extra: [
        /* Tool spend (satisfait aussi §3b) : proficient sur Calligrapher's
           Supplies, coût 2. */
        { path: `fh.skills.spend.${CALLIGRAPHER}`, value: "proficient" },
        /* 4 compétences à proficient (2 chacune) = 8. Total dépensé : 10,
           pour un pool de 10 (12 de classe - 2 d'imposés). */
        { path: "fh.skills.spend.acrobatics", value: "proficient" },
        { path: "fh.skills.spend.athletics", value: "proficient" },
        { path: "fh.skills.spend.stealth", value: "proficient" },
        { path: "fh.skills.spend.survival", value: "proficient" }
      ]
    }))
  });
  const pool = poolDe(out.resolved);
  assert.equal(pool.value, 0, "le pool tombe exactement à zéro");
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-pool.overspent"), false,
    "zéro n'est pas un dépassement");
  assert.equal(h.verbs.validate({ document: out.document }).ok, true, "et `validate()` n'y trouve rien à redire");
});

test("REJET — un point de trop : UN SEUL refus keyé, `validate().ok === false`", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: HALFLING,
      extra: [
        { path: `fh.skills.spend.${CALLIGRAPHER}`, value: "proficient" },
        { path: "fh.skills.spend.acrobatics", value: "proficient" },
        { path: "fh.skills.spend.athletics", value: "proficient" },
        { path: "fh.skills.spend.stealth", value: "proficient" },
        { path: "fh.skills.spend.survival", value: "proficient" },
        /* Le point de trop : une cinquième compétence, à ½. Total dépensé
           11 pour un pool de 10 → -1. */
        { path: "fh.skills.spend.insight", value: "half" }
      ]
    }))
  });
  const pool = poolDe(out.resolved);
  assert.equal(pool.value, -1, "le pool publie bien le total NÉGATIF — le dépassement est toléré ici (2a)");
  const overspent = out.moduleViolations.filter((v) => v.key === "skill-pool.overspent");
  assert.equal(overspent.length, 1, "UN SEUL refus, pas un par ligne");
  assert.equal(overspent[0].path, undefined, "aucun chemin — aucune dépense n'est « la » fautive (commande §3a)");
  assert.deepEqual(overspent[0].params, { available: 10, spent: 11, over: 1 });
  assert.equal(h.verbs.validate({ document: out.document }).ok, false, "`validate()` refuse à la SORTIE");
});

test("le refus ne bloque PAS la dépense : le palier acheté reste appliqué dans `resolved` (comportement 2a)", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: HALFLING,
      extra: [
        { path: `fh.skills.spend.${CALLIGRAPHER}`, value: "proficient" },
        { path: "fh.skills.spend.acrobatics", value: "proficient" },
        { path: "fh.skills.spend.athletics", value: "proficient" },
        { path: "fh.skills.spend.stealth", value: "proficient" },
        { path: "fh.skills.spend.survival", value: "proficient" },
        { path: "fh.skills.spend.insight", value: "half" }
      ]
    }))
  });
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-pool.overspent"), true,
    "ce document EST en refus");
  assert.equal(out.resolved.skills.find((s) => s.id === "insight").proficiency, "half",
    "et pourtant le palier acheté est bien appliqué — le refus se prononce, il ne défait rien");
});

/* ══ 2 — AU MOINS UN POINT EN OUTILS (§3b) ════════════════════════════ */

test("ACCEPTÉ — un personnage avec UN outil à ½ : `validate()` passe", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: HALFLING,
      extra: [{ path: `fh.skills.spend.${CALLIGRAPHER}`, value: "half" }]
    }))
  });
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-pool.no-tool"), false);
  assert.equal(h.verbs.validate({ document: out.document }).ok, true);
});

test("REJET — aucun outil à un palier autre que « aucun » : `skill-pool.no-tool`", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: HALFLING,
      extra: [{ path: "fh.skills.spend.acrobatics", value: "proficient" }]
    }))
  });
  const violation = out.moduleViolations.find((v) => v.key === "skill-pool.no-tool");
  assert.ok(violation, "le refus est KEYÉ, pas un silence");
  assert.equal(h.verbs.validate({ document: out.document }).ok, false);
});

/* ══ 3 — LE BUDGET CAPTIF D'ESPÈCE (Keen Senses, §3c) ═════════════════
   ⚠️ RÉÉCRIT APRÈS MESURE DE L'ARCHITECTE (2026-08-12) : le refus keyé
   `skill-budget.overspent` existe DÉJÀ, dans `decisions.mjs` depuis le
   lot 34 (`speciesBudgetPlan`). Le trou n'était pas l'absence d'un contrôle
   — c'était que `validate()` ne lisait jamais le carnet de décisions
   (`projectDecisions`) qui le porte. Ces deux tests visent donc `validate()`
   directement, pas `moduleViolations` : le refus est un VERROU DE PLAN
   (`.lock`), pas une `outcome.violations` de module — les deux canaux sont
   distincts (voir `block.mjs`, verbe `validate`). */

test("ACCEPTÉ — un budget captif dépensé DANS son plafond : passe, et `fh:skill-points` ne bouge pas d'un point", () => {
  const h = pile();
  const sansBudget = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: ELF,
      extra: [{ path: `fh.skills.spend.${CALLIGRAPHER}`, value: "half" }]
    }))
  }).resolved;
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: ELF,
      extra: [
        { path: `fh.skills.spend.${CALLIGRAPHER}`, value: "half" },
        /* Keen Senses : 2 points captifs, ½ sur deux des trois — DANS le
           plafond de 2 (addendums § « Keen Senses »). */
        { path: "species.skillBudget.survival", value: "half" },
        { path: "species.skillBudget.vigilance", value: "half" }
      ]
    }))
  });
  const verdict = h.verbs.validate({ document: out.document });
  assert.equal(verdict.violations.some((v) => v.key === "skill-budget.overspent"), false);
  assert.equal(poolDe(out.resolved).value, poolDe(sansBudget).value,
    "le budget captif est une bourse À PART : le pool principal ne bouge pas d'un point");
  assert.equal(verdict.ok, true);
});

test("REJET — un budget captif dépassé : refus keyé (déjà posé par `decisions.mjs`), et le pool principal reste intact", () => {
  const h = pile();
  const sansBudget = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: ELF,
      extra: [{ path: `fh.skills.spend.${CALLIGRAPHER}`, value: "half" }]
    }))
  }).resolved;
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: WIZARD, speciesId: ELF,
      extra: [
        { path: `fh.skills.spend.${CALLIGRAPHER}`, value: "half" },
        /* Trois paliers PLEINS sur les trois compétences captives : coût 6
           pour un budget de 2 (mesuré, commande §3c — le trou trouvé le
           2026-08-12, et déjà verrouillé par `decisions.mjs` depuis le
           lot 34 — seul `validate()` ne le lisait pas). */
        { path: "species.skillBudget.survival", value: "proficient" },
        { path: "species.skillBudget.vigilance", value: "proficient" },
        { path: "species.skillBudget.delve", value: "proficient" }
      ]
    }))
  });
  const verdict = h.verbs.validate({ document: out.document });
  const violation = verdict.violations.find((v) => v.key === "skill-budget.overspent");
  assert.ok(violation, "le refus est KEYÉ");
  assert.equal(violation.params.points, 2);
  assert.equal(violation.params.spent, 6);
  assert.equal(poolDe(out.resolved).value, poolDe(sansBudget).value,
    "le dépassement du budget captif ne touche PAS `fh:skill-points`");
  assert.equal(verdict.ok, false);
});

/* ══ 4 — LE SRD PUR N'EST JAMAIS TOUCHÉ ═══════════════════════════════ */

test("un personnage SRD pur, sans la couche FH : aucun des trois refus ne peut apparaître", () => {
  const h = makeHarness({ layers: [SRD_EN], modules: [createFhSkillPoolStat()] });
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({ level: 1, classId: WIZARD, speciesId: HALFLING }))
  });
  const cles = new Set(["skill-pool.overspent", "skill-pool.no-tool"]);
  assert.equal(out.moduleViolations.some((v) => cles.has(v.key)), false,
    "sans la couche FH, le module ne publie même pas de pool — rien à refuser");
  /* Un halfling SRD ne porte pas `granted_skill_budget` : le carnet de
     décisions ne peut donc pas non plus lever `skill-budget.overspent`. */
  assert.equal(h.verbs.validate({ document: out.document }).violations
    .some((v) => v.key === "skill-budget.overspent"), false);
});
