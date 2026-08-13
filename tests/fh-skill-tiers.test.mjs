/* ══ LOT 34 — LA GRILLE À QUATRE PALIERS ═══════════════════════════════
   `contracts/build.md`, § ⭐ THE SKILL POOL. Cette suite prouve les six
   obligations de la commande (§5) qui ne sont couvertes par AUCUNE suite
   existante :

     1. une ligne imposée est MONTABLE au-dessus de son plancher, au coût de
        la différence — et le coût est VISIBLE (débité de `fh:skill-points`).
     2. `resolved.skills[].proficiency` rend `half` ET `expertise`, avec le
        bon bonus.
     3. Keen Senses : les DEUX allocations légales, et une illégale refusée
        (verrou keyé, `decisions.mjs`).
     4. le budget captif NE TOUCHE JAMAIS `fh:skill-points`.
     5. le verrou d'expertise (le palier le plus haut) — refusé avant le
        niveau, accepté après.
     6. loi §0.12 — un personnage SRD pur ne cite aucun mot de FH.

   Les ATTAQUES (§7 de la commande — casser le verrou d'expertise et la
   restriction du budget captif dans le code, prouver qu'ils mordent,
   restaurer, prouver par `git status`) sont un exercice MANUEL, journalisé
   dans `INVENTAIRE-LOT-34.md` : les rejouer en suite automatisée voudrait
   dire modifier le source à l'exécution, ce qu'aucune suite de ce dépôt ne
   fait déjà. Cette suite prouve à la place, en boîte noire, que le verrou
   MORD (§5 point 5) — c'est la preuve observable, permanente, de ce que
   l'attaque manuelle a vérifié une fois. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const INHERITANCE = "fh:background:en:inheritance";

function pile(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhSkillPoolStat()]
  }, options));
}

function choixDe({ level, classId, speciesId, backgroundId, extra = [] }) {
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
    { path: "class.skills[0]", value: "arcana" },
    { path: "class.skills[1]", value: "history" },
    /* LOT 43 — l'Inheritance exige exactement 3 points de boost (§1d) ; sans
       eux `validate()` refuse un total absent (0 !== 3), et cette suite ne
       teste pas les boosts eux-mêmes. */
    { path: "background.boost.int", value: 2 },
    { path: "background.boost.con", value: 1 }
  ].concat(extra);
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot34-tiers",
    name: "Tiers",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-skill-tiers", version: "1.0.0" },
    created: "2026-08-10T09:00:00Z",
    modified: "2026-08-10T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const skillDe = (resolved, id) => resolved.skills.find((skill) => skill.id === id);
const decisionsByPath = (out) => new Map(out.decisions.map((entry) => [entry.path, entry]));

/* ══ 1 — UNE LIGNE IMPOSÉE EST MONTABLE, AU COÛT DE LA DIFFÉRENCE ═══════ */

test("une ligne imposée (½, le plancher) se MONTE à Plein, au coût de la différence — débité et visible", () => {
  const h = pile();
  const sansMontée = h.verbs.rebuild({
    document: documentDe(h, choixDe({ level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE }))
  }).resolved;

  /* « arcana » est imposée par `class.skills[0]` : son PLANCHER est ½, pas
     Plein — c'est le cœur du modèle tranché (§2 de la commande). */
  assert.equal(skillDe(sansMontée, "arcana").proficiency, "half", "le plancher d'un imposé est ½, jamais Plein d'office");
  assert.equal(skillDe(sansMontée, "arcana").bonus, sansMontée.abilities.int.mod + Math.floor(sansMontée.proficiency / 2));
  const poolAvant = poolDe(sansMontée).value;

  const avecMontée = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE,
      extra: [{ path: "fh.skills.spend.arcana", value: "proficient" }]
    }))
  }).resolved;

  assert.equal(skillDe(avecMontée, "arcana").proficiency, "proficient", "monté au-dessus de son plancher");
  assert.equal(skillDe(avecMontée, "arcana").bonus, avecMontée.abilities.int.mod + avecMontée.proficiency,
    "Plein vaut le bonus de maîtrise entier, pas la moitié");

  /* LE COÛT DE LA DIFFÉRENCE, DÉBITÉ ET NOMMÉ : proficient(2) − half(1) = 1,
     visible comme une ligne de plus dans le détail du pool, et le total
     `fh:skill-points` en porte la trace. */
  const poolApres = poolDe(avecMontée);
  assert.equal(poolAvant - poolApres.value, 1, "la montée ½ → Plein coûte exactement la différence (1 point)");
  const ligne = poolApres.breakdown.find((entry) => entry.value === -1 && entry.source && entry.source.id === "srd:skill:en:arcana");
  assert.ok(ligne, "le détail du pool porte une ligne NOMMÉE pour la dépense, pas un total muet");
});

/* ══ 2 — `proficiency` REND `half` ET `expertise`, AVEC LE BON BONUS ═══ */

test("`resolved.skills[].proficiency` rend `half` ET `expertise`, chacun avec son bonus", () => {
  const h = pile();
  const resolved = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE,
      extra: [
        { path: "fh.skills.spend.leadership", value: "half" },
        { path: "fh.skills.spend.tactics", value: "expertise" }
      ]
    }))
  }).resolved;

  assert.equal(resolved.skills.find((s) => s.id === "leadership").proficiency, "half");
  assert.equal(skillDe(resolved, "leadership").bonus, resolved.abilities.cha.mod + Math.floor(resolved.proficiency / 2),
    "le bonus ½ est le bonus de maîtrise coupé au sol, pas arrondi au-dessus");

  assert.equal(skillDe(resolved, "tactics").proficiency, "expertise");
  assert.equal(skillDe(resolved, "tactics").bonus, resolved.abilities.int.mod + resolved.proficiency * 2,
    "l'expertise double le bonus de maîtrise — l'arithmétique standard du SRD, pas réinventée");
});

/* ══ 3 — KEEN SENSES : LES DEUX ALLOCATIONS LÉGALES, ET UNE ILLÉGALE ═══ */

test("Keen Senses — ½ sur deux des trois est légal", () => {
  const h = pile();
  const resolved = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:elf", backgroundId: INHERITANCE,
      extra: [
        { path: "species.skillBudget.survival", value: "half" },
        { path: "species.skillBudget.vigilance", value: "half" }
      ]
    }))
  }).resolved;
  assert.equal(skillDe(resolved, "survival").proficiency, "half");
  assert.equal(skillDe(resolved, "vigilance").proficiency, "half");
  assert.equal(skillDe(resolved, "delve").proficiency, "none", "le troisième n'a rien reçu — le budget est de 2 points");
});

test("Keen Senses — Plein sur une seule est légal AUSSI", () => {
  const h = pile();
  const resolved = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:elf", backgroundId: INHERITANCE,
      extra: [{ path: "species.skillBudget.delve", value: "proficient" }]
    }))
  }).resolved;
  assert.equal(skillDe(resolved, "delve").proficiency, "proficient");
  assert.equal(skillDe(resolved, "survival").proficiency, "none");
  assert.equal(skillDe(resolved, "vigilance").proficiency, "none");
});

test("Keen Senses — une compétence HORS {survival, delve, vigilance} est un refus keyé, et n'est jamais appliquée", () => {
  const h = pile();
  const doc = documentDe(h, choixDe({
    level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:elf", backgroundId: INHERITANCE,
    extra: [{ path: "species.skillBudget.leadership", value: "half" }]
  }));
  const out = h.verbs.rebuild({ document: doc });

  /* NI JETÉ NI AVALÉ EN SILENCE — même discipline qu'un `class.skills[7]`
     illégal (`tests/build-decisions.test.mjs`) : le choix reste UNCONSUMED,
     et `decisions.mjs` le NOMME en verrou keyé (lot 27). */
  assert.equal(skillDe(out.resolved, "leadership").proficiency, "none", "un budget captif hors liste n'est jamais appliqué");
  assert.ok(out.unconsumed.includes("species.skillBudget.leadership"), "le choix illégal reste non consommé");

  const plan = decisionsByPath(out).get("species.skillBudget.leadership");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "skill-budget.option-unavailable", "le refus est KEYÉ, jamais une phrase (lot 27)");
});

/* ══ 4 — LE BUDGET CAPTIF NE TOUCHE JAMAIS `fh:skill-points` ═══════════ */

test("le budget captif d'espèce ne change JAMAIS la valeur publiée de `fh:skill-points`", () => {
  const h = pile();
  const sans = h.verbs.rebuild({
    document: documentDe(h, choixDe({ level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:elf", backgroundId: INHERITANCE }))
  }).resolved;
  const avec = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:elf", backgroundId: INHERITANCE,
      extra: [
        { path: "species.skillBudget.survival", value: "half" },
        { path: "species.skillBudget.vigilance", value: "half" }
      ]
    }))
  }).resolved;
  assert.equal(poolDe(avec).value, poolDe(sans).value,
    "un choix accordé par l'espèce est SUPPLÉMENTAIRE (contrat §4e) — il ne déduit ni n'ajoute rien au pool de classe");
  assert.deepEqual(poolDe(avec).breakdown, poolDe(sans).breakdown,
    "le détail lui-même est identique, ligne pour ligne — Keen Senses n'y écrit jamais une ligne");
});

/* ══ 5 — LE VERROU D'EXPERTISE ═══════════════════════════════════════ */

test("le verrou d'expertise refuse AVANT le niveau du record, et accepte APRÈS", () => {
  const h = pile();

  const avant = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE,
      extra: [{ path: "fh.skills.spend.leadership", value: "expertise" }]
    }))
  });
  assert.equal(skillDe(avant.resolved, "leadership").proficiency, "none",
    "au niveau 1, sous `expertise_from_level` (4), la dépense n'est PAS appliquée");
  const lockAvant = decisionsByPath(avant).get("fh.skills.spend.leadership");
  assert.equal(lockAvant, undefined,
    "ce chemin vit dans le namespace du module (`fh.skills.*`), donc HORS de `decisions.mjs` (§0.12, voir INVENTAIRE) — " +
    "le refus keyé vient du module, via `moduleViolations`");
  const violationAvant = avant.moduleViolations.find((v) => v.key === "skill-spend.tier-locked" && v.params.skillId === "leadership");
  assert.ok(violationAvant, "le refus est KEYÉ (lot 27), et nomme la compétence");
  assert.equal(violationAvant.params.level, 1);
  assert.equal(violationAvant.params.unlockLevel, 4);

  const apres = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE,
      extra: [{ path: "fh.skills.spend.leadership", value: "expertise" }]
    }))
  });
  assert.equal(skillDe(apres.resolved, "leadership").proficiency, "expertise", "au niveau 4, la dépense est acceptée");
  assert.equal(apres.moduleViolations.some((v) => v.key === "skill-spend.tier-locked"), false,
    "plus aucun verrou une fois le niveau atteint");
});

/* ══ 6 — LOI §0.12 : LE SRD PUR TRAVERSE SANS UN MOT DE FH ═════════════ */

test("un personnage SRD pur (aucune espèce FH, aucun budget captif) traverse la grille sans un mot de FH", () => {
  /* La pile ne monte QUE le SRD anglais — aucune couche FH, donc aucun
     `fh_skill_pool` sur la classe, aucun `granted_skill_budget` sur
     l'espèce. Le module est pourtant injecté (même discipline qu'ACCEPTATION
     4 de `fh-skill-pool.test.mjs`) : c'est ce qui rend le test dur. */
  const h = makeHarness({ layers: [SRD_EN], modules: [createFhSkillPoolStat()] });
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:elf",
      backgroundId: "srd:background:en:acolyte" // fh-skills-en n'est pas montée : l'Inheritance n'existe pas ici
    }))
  });
  assert.deepEqual(out.resolved.stats, [], "aucun pool — le SRD n'en a pas");
  assert.equal(out.resolved.skills.find((s) => s.id === "arcana").proficiency, "proficient",
    "le modèle SRD reste EXACTEMENT celui d'avant ce lot : un imposé est maîtrisé plein, jamais ½");
  assert.deepEqual(out.moduleViolations, [], "aucun verrou, aucune ligne — le module n'a rien à dire sur un personnage qu'il ne sert pas");
});

/* ══ NON-RÉGRESSION — LE PERSONNAGE SANS FH DE `pilePool` VOIT PAREIL ═══ */

test("un scénario où la couche des compétences n'est pas montée reste inchangé par ce lot", () => {
  const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN], modules: [createFhSkillPoolStat()] });
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "fh:species:en:araag",
      backgroundId: "srd:background:en:acolyte" // fh-skills-en n'est pas montée : l'Inheritance n'existe pas ici
    }))
  });
  assert.equal(out.resolved.skills.find((s) => s.id === "arcana").proficiency, "proficient",
    "sans `fh-skills-en`, la classe ne porte pas `fh_skill_pool` — le plancher ½ ne s'applique pas");
});
