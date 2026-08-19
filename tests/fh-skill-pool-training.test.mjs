/* ══ LOT 36 — LE POOL PAIE AUSSI LES TRAININGS ══════════════════════════
   Addendums § « Les TRAININGS » (Eric) : une troisième dépense du pool, à
   côté des compétences et des outils — une langue de plus, une arme
   exotique, le Garrot. NI PALIER NI BONUS : un training débloque, il ne
   bonifie pas, et le canal `fh.skills.train.<slug>` porte un BOOLÉEN, jamais
   un mot de la grille (commande §3a, ARBITRÉ le 2026-08-12).

   Cette suite prouve les obligations de la commande (§4) :

     1. un training s'achète au niveau 4 : la ligne est NOMMÉE, le pool
        baisse de son coût, et le training est publié dans `resolved.traits[]`
        (catégorie `training`) — commande §3d, ARBITRÉ.
     2. REJET — le même achat au niveau 3 : `skill-train.level-locked`,
        nommant le niveau requis.
     3. DÉROGATION — un training dont `data.from_level` est plus bas que le
        plancher générique (4) s'achète plus tôt, sans une ligne de moteur
        en plus : la même fonction lit juste un nombre différent.
     4. REJET — un slug inconnu du genre `training` : `skill-train.option-unavailable`.
     5. REJET — une valeur de palier (« proficient ») sur le canal des
        trainings : `skill-train.value-invalid`, pas une acceptation
        silencieuse.
     6. un training n'ajoute NI ne modifie aucune ligne de `resolved.skills[]`
        ni de `resolved.tools[]` — ces deux collections sont identiques avec
        et sans lui.

   Les records de training n'existent pas encore dans `layers/fh-skills-en`
   (contenu hors périmètre de ce lot, commande §3e) : la suite les fabrique
   dans une couche de scénario, comme `fh-skill-pool-tools.test.mjs` (lot 35)
   le fait déjà pour ses cas de collision. AUCUNE ÉCRITURE HORS MÉMOIRE. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const INHERITANCE = "fh:background:en:inheritance";
const GARROTE = "fh:training:en:garrote";
const EXTRA_LANGUAGE = "fh:training:en:extra-language";
const SILENT_TRAINING = "fh:training:en:scenario-early-unlock";

/* La couche de scénario qui fournit le contenu training pour la suite —
   deux trainings ordinaires (plancher générique 4), un troisième qui porte
   sa PROPRE dérogation (`from_level: 3`), exactement la forme qu'une future
   couche `Silent Blade` donnerait au Garrot (commande §3e, hors périmètre
   ici). */
const TRAININGS_DE_SCENARIO = uneCouche("scenario-trainings-lot36", {
  training: {
    [GARROTE]: { op: "add", slug: "garrote", name: "Garrote", data: { cost: 1 } },
    [EXTRA_LANGUAGE]: { op: "add", slug: "extra-language", name: "Extra Language", data: { cost: 1 } },
    [SILENT_TRAINING]: {
      op: "add", slug: "scenario-early-unlock", name: "Scenario Early Unlock",
      data: { cost: 1, from_level: 3 }
    }
  }
});

function pile(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    extra: TRAININGS_DE_SCENARIO,
    modules: [createFhSkillPoolStat()]
  }, options));
}

function choixDe({ level, classId, speciesId, backgroundId = INHERITANCE, skills = ["arcana", "history"], extra = [] }) {
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
    { path: "class.skills[1]", value: skills[1] },
    /* LOT 43 — l'Inheritance exige exactement 3 points de boost (§1d) ;
       validate() refuse désormais un total absent (0 !== 3). Cette suite ne
       teste pas les boosts : +2/+1 sur deux caracs neutres suffit à rester
       légal sans influencer les mesures du pool. */
    { path: "background.boost.int", value: 2 },
    { path: "background.boost.con", value: 1 }
  ].concat(extra);
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot36-trainings",
    name: "Trainings",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-skill-pool-training", version: "1.0.0" },
    created: "2026-08-12T09:00:00Z",
    modified: "2026-08-12T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const trainingDe = (resolved, id) => resolved.traits.find((trait) => trait.id === id && trait.category === "training");

/* ══ 1 — UN TRAINING S'ACHÈTE AU NIVEAU 4 ═════════════════════════════ */

test("un training s'achète au niveau 4 : la ligne est nommée, le pool baisse, `resolved.traits[]` le porte", () => {
  const h = pile();
  const sans = h.verbs.rebuild({
    document: documentDe(h, choixDe({ level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling" }))
  }).resolved;
  assert.equal(trainingDe(sans, "garrote"), undefined, "sans achat, le training n'apparaît pas");
  const poolAvant = poolDe(sans).value;

  const avec = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: "fh.skills.train.garrote", value: true }]
    }))
  }).resolved;

  const training = trainingDe(avec, "garrote");
  assert.ok(training, "le training apparaît dans `resolved.traits[]`, catégorie `training`");
  assert.equal(training.name, "Garrote", "le nom SUIT le catalogue, pas un mot écrit dans le module");

  const poolApres = poolDe(avec);
  assert.equal(poolAvant - poolApres.value, 1, "l'achat coûte `data.cost` du record, 1 pour le Garrot");
  const ligne = poolApres.breakdown.find((entry) =>
    entry.value === -1 && entry.source && entry.source.kind === "training" && entry.source.id === GARROTE);
  assert.ok(ligne, "le détail du pool porte une ligne NOMMÉE pour le training, pas un total muet");
  assert.match(ligne.label, /Garrote/, "et la ligne porte son nom, recopié du catalogue (loi §0.13)");
});

/* ══ 2 — REJET : LE MÊME ACHAT AU NIVEAU 3 ═══════════════════════════ */

test("REJET — le même achat au niveau 3 est `skill-train.level-locked`, nommant le niveau requis", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 3, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: "fh.skills.train.garrote", value: true }]
    }))
  });
  assert.equal(trainingDe(out.resolved, "garrote"), undefined, "aucune ligne fabriquée pour un achat refusé");
  const violation = out.moduleViolations.find((v) => v.key === "skill-train.level-locked");
  assert.ok(violation, "le refus est KEYÉ (lot 27)");
  assert.equal(violation.params.trainingId, "garrote", "et il nomme le training refusé");
  assert.equal(violation.params.level, 3);
  assert.equal(violation.params.unlockLevel, 4, "le plancher générique de la commande (§2)");
});

/* ══ 3 — DÉROGATION : UN CONTENU QUI ABAISSE LE NIVEAU LE FAIT PASSER ═ */

test("DÉROGATION — un training dont `data.from_level` est plus bas s'achète plus tôt, sans ligne de moteur en plus", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 3, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: "fh.skills.train.scenario-early-unlock", value: true }]
    }))
  });
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-train.level-locked"), false,
    "aucun verrou : le record porte sa propre dérogation (`from_level: 3`), lue comme `expertise_from_level` l'est");
  const training = trainingDe(out.resolved, "scenario-early-unlock");
  assert.ok(training, "le training à dérogation est acquis au niveau 3");
});

/* ══ 4 — REJET : UN SLUG INCONNU DU GENRE `training` ══════════════════ */

test("REJET — un slug inconnu du genre `training` est `skill-train.option-unavailable`, jamais appliqué", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: "fh.skills.train.griffon-taming", value: true }]
    }))
  });
  assert.equal(trainingDe(out.resolved, "griffon-taming"), undefined, "aucune ligne fabriquée pour un slug inconnu");
  const violation = out.moduleViolations.find((v) => v.key === "skill-train.option-unavailable");
  assert.ok(violation, "le refus est KEYÉ");
  assert.equal(violation.params.selected, "griffon-taming", "et il NOMME le slug refusé");
});

/* ══ 5 — REJET : UNE VALEUR DE PALIER SUR LE CANAL DES TRAININGS ═════ */

test("REJET — une valeur de palier (« proficient ») sur `train.*` est `skill-train.value-invalid`", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: "fh.skills.train.garrote", value: "adept" }]
    }))
  });
  assert.equal(trainingDe(out.resolved, "garrote"), undefined,
    "un mot de palier n'est PAS une acceptation silencieuse — le training n'est pas acquis");
  const violation = out.moduleViolations.find((v) => v.key === "skill-train.value-invalid");
  assert.ok(violation, "le refus est KEYÉ, pas une acceptation silencieuse (commande §4, test 5)");
  assert.equal(violation.params.value, "adept");
});

test("`false` est une valeur booléenne légale (commande §3a) — même effet que l'absence, aucun refus", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      /* Un point en outils satisfait la garde §3b du lot 37 — ce test ne
         porte QUE sur `false` en training, la garde d'outil n'est pas son
         sujet. */
      extra: [
        { path: "fh.skills.train.garrote", value: false },
        { path: "fh.skills.spend.calligrapher-s-supplies", value: "novice" }
      ]
    }))
  });
  assert.equal(trainingDe(out.resolved, "garrote"), undefined, "`false` n'acquiert rien");
  assert.equal(out.moduleViolations.length, 0, "et ce n'est pas un refus : « booléenne ou absente » couvre les deux");
});

/* ══ 6 — UN TRAINING NE MODIFIE AUCUN JET ═════════════════════════════ */

test("un training ne change RIEN à `resolved.skills[]` ni à `resolved.tools[]`", () => {
  const h = pile();
  const sans = h.verbs.rebuild({
    document: documentDe(h, choixDe({ level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling" }))
  }).resolved;
  const avec = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 4, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [
        { path: "fh.skills.train.garrote", value: true },
        { path: "fh.skills.train.extra-language", value: true }
      ]
    }))
  }).resolved;
  assert.deepEqual(avec.skills, sans.skills, "`resolved.skills[]` est identique avec et sans les trainings");
  assert.deepEqual(avec.tools, sans.tools, "`resolved.tools[]` est identique avec et sans les trainings — " +
    "un training n'a ni palier ni bonus, il ne peut donc pas en ajouter un aux outils non plus");
});
