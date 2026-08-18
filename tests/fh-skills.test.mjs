/* ══ LE CHAPITRE 4 — LES 26 COMPÉTENCES ET LES 36 OUTILS ═══════════════
   Lot 22-chapitre-4-competences.

   LES DEUX TESTS D'ACCEPTATION QUE CE LOT PEUT TENIR :

     1 — LE CONTENU. La couche FH montée sur le SRD, `query("skill", …)` rend
         26 compétences NOMMÉMENT, Perception a disparu, et les 9 neuves
         portent chacune leur caractéristique.

     4 — LE SRD PUR TRAVERSE. Couche FH débrayée, un personnage SRD pur se
         construit de bout en bout avec ses 18 compétences, Perception
         comprise, et aucun budget. C'est le test de la loi §0.12, et c'est
         celui qui prouve que la couche est une couche.

   ⚠️ LES TESTS 2 ET 3 (LE POOL) NE SONT PAS ICI, ET CE N'EST PAS UN OUBLI.
   `build.budgets` n'a AUCUN chemin d'écriture : `grep -rn budgets src/` ne
   rend rien, aucun des cinq verbes du bloc `build` ne le touche, et
   l'invariant 4 du contrat interdit à une reconstruction de modifier `build`.
   Écrire ces deux suites demanderait d'inventer ce chemin — loi §0.10 :
   décision non couverte, STOP. La question est posée en tête de
   `INVENTAIRE-LOT-22.md`, avec sa mesure et deux options chiffrées.

   ⚠️ ON NOMME LES VALEURS, ON NE COMPTE PAS. Un garde qui asserte
   « 26 compétences » reste vert quand la pile en rend 26 fausses — ce dépôt a
   déjà payé la leçon deux fois (TRAPS.md). Les 26 noms sont donc épinglés, et
   l'assertion elle-même est ATTAQUÉE plus bas sur une liste truquée.

   ⚠️ CETTE SUITE N'ÉCRIT QUE DANS UN RÉPERTOIRE TEMPORAIRE. `layers/` est un
   artefact commité. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createLayers } from "../src/layers/index.mjs";
import {
  ROOT,
  SRD_EN,
  fileBytes,
  makeBus
} from "./build-harness.mjs";
import {
  buildLayer,
  generate,
  readSrdLayer,
  serialize,
  GenError
} from "../src/tools/gen-fh-skills-layer.mjs";
import {
  BACKGROUND_INHERITANCE,
  BACKGROUNDS_EXTINGUISHED,
  EXPECTED,
  SKILLS_ADDED,
  TOOLS_ADDED
} from "../src/tools/fh-skills-source.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const SRD_PATH = join(ROOT, SRD_EN);

/* ══ LES VALEURS ÉPINGLÉES ═════════════════════════════════════════════
   Écrites à la main, depuis le canon, et JAMAIS calculées depuis la source du
   générateur : une attente tirée de ce qu'elle vérifie ne vérifie rien. */

const LES_26 = [
  ["Athletics", "str"], ["Might", "str"],
  ["Acrobatics", "dex"], ["Sleight of Hand", "dex"], ["Stealth", "dex"],
  ["Academics", "int"], ["Appraise", "int"], ["Arcana", "int"], ["History", "int"],
  ["Investigation", "int"], ["Nature", "int"], ["Religion", "int"], ["Tactics", "int"],
  ["Animal Handling", "wis"], ["Delve", "wis"], ["Hunting", "wis"], ["Insight", "wis"],
  ["Medicine", "wis"], ["Survival", "wis"], ["Vigilance", "wis"],
  ["Deception", "cha"], ["Intimidation", "cha"], ["Leadership", "cha"],
  ["Performance", "cha"], ["Persuasion", "cha"], ["Streetwise", "cha"]
];

/** Les 9 neuves, avec la caractéristique que le chapitre leur donne. */
const LES_9_NEUVES = [
  ["Might", "str"], ["Appraise", "int"], ["Academics", "int"], ["Tactics", "int"],
  ["Hunting", "wis"], ["Vigilance", "wis"], ["Delve", "wis"],
  ["Streetwise", "cha"], ["Leadership", "cha"]
];

const LES_36_OUTILS = [
  "Alchemist’s Supplies", "Brewer’s Supplies", "Calligrapher’s Supplies", "Card Set",
  "Carpenter’s Tools", "Cartographer’s Tools", "Cobbler’s Tools", "Cook’s Utensils",
  "Dice Set", "Disguise Kit", "Dragonchess Set", "Forgery Kit", "Glassblower’s Tools",
  "Herbalism Kit", "Jeweler’s Tools", "Leatherworker’s Tools", "Mason’s Tools",
  "Mount (Air)", "Mount (Land)", "Mount (Water)", "Navigator’s Tools", "Other Instrument",
  "Painter’s Supplies", "Poisoner’s Kit", "Potter’s Tools", "Smith’s Tools",
  "String Instrument", "Thieves’ Tools", "Three-Dragon Ante Set", "Tinker’s Tools",
  "Vehicles (Air)", "Vehicles (Land)", "Vehicles (Water)", "Weaver’s Tools",
  "Wind Instrument", "Woodcarver’s Tools"
];

/** Les 18 du SRD, Perception comprise — la cible du test 4. */
const LES_18_SRD = [
  "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History",
  "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception",
  "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"
];

/** Une pile montée pour de vrai, par les octets, comme en production. */
function pile({ fh = true } = {}) {
  const bus = makeBus();
  const layers = createLayers({ bus });
  layers.verbs.register({ bytes: fileBytes(SRD_EN), origin: SRD_EN });
  if (fh) layers.verbs.register({ bytes: fileBytes(FH_SKILLS_EN), origin: FH_SKILLS_EN });
  return layers.verbs;
}

const nomsTriés = (vues) => vues.map((v) => v.record.name).sort();

/* ══ TEST D'ACCEPTATION 1 — LE CONTENU ═════════════════════════════════ */

test("acceptation 1 — la pile rend les 26 compétences, nommément et avec leur caractéristique", () => {
  const verbs = pile();
  const vues = verbs.query({ kind: "skill" });

  const observé = vues
    .map((v) => [v.record.name, v.record.data.ability_key])
    .sort((a, b) => a[0].localeCompare(b[0]));
  const attendu = [...LES_26].sort((a, b) => a[0].localeCompare(b[0]));

  assert.deepEqual(observé, attendu,
    "les 26 compétences, chacune avec sa caractéristique — pas un compte, une liste");
});

test("acceptation 1 — Perception a disparu, et c'est un `disable` : le record SRD est intact", () => {
  const verbs = pile();
  assert.equal(verbs.query({ kind: "skill", id: "srd:skill:en:perception" }), null,
    "Perception ne doit plus être visible de la pile");

  /* Le record d'origine n'est pas modifié : c'est la promesse du `disable`,
     et c'est ce qui permet à une pile SRD pure de le retrouver (test 4). */
  const srd = readSrdLayer(SRD_PATH);
  assert.ok(srd.records.skill["srd:skill:en:perception"],
    "le retrait est une opération de pile, pas une mutation de la couche du dessous");
});

test("acceptation 1 — les 9 neuves portent chacune leur caractéristique", () => {
  const verbs = pile();
  for (const [nom, ability] of LES_9_NEUVES) {
    const slug = nom.toLowerCase();
    const vue = verbs.query({ kind: "skill", id: `fh:skill:en:${slug}` });
    assert.ok(vue, `« ${nom} » doit exister sous l'id fh:skill:en:${slug}`);
    assert.equal(vue.record.name, nom);
    assert.equal(vue.record.data.ability_key, ability, `la caractéristique de « ${nom} »`);
    assert.ok(typeof vue.record.data.example_uses === "string" && vue.record.data.example_uses.length > 0,
      `« ${nom} » doit porter sa description`);
  }
});

/* ══ LE RANGEMENT — QUATRE CATÉGORIES (lot 35) ═══════════════════════ */

const LES_4_CATEGORIES = ["knowledge", "social", "exploration", "physical"];

/** Le classement validé par Eric le 2026-08-12 — voir `fh-skills-source.mjs`,
 *  `SKILLS_KEPT_CATEGORIES` et `SKILLS_ADDED`. Recopié ici comme une donnée
 *  ÉPINGLÉE, jamais recalculée depuis la source qu'elle vérifie. */
const CATEGORIE_ATTENDUE = {
  Academics: "knowledge", Appraise: "knowledge", Arcana: "knowledge", History: "knowledge",
  Medicine: "knowledge", Nature: "knowledge", Religion: "knowledge", Tactics: "knowledge",
  Deception: "social", Insight: "social", Intimidation: "social", Leadership: "social",
  Performance: "social", Persuasion: "social", Streetwise: "social",
  "Animal Handling": "exploration", Delve: "exploration", Hunting: "exploration",
  Investigation: "exploration", Survival: "exploration", Vigilance: "exploration",
  Acrobatics: "physical", Athletics: "physical", Might: "physical",
  "Sleight of Hand": "physical", Stealth: "physical"
};

test("les 26 compétences portent chacune une catégorie, et c'est exactement le classement validé", () => {
  const verbs = pile();
  const vues = verbs.query({ kind: "skill" });
  assert.equal(vues.length, EXPECTED.skills);
  assert.equal(Object.keys(CATEGORIE_ATTENDUE).length, EXPECTED.skills, "la table épinglée couvre les 26");

  const observé = vues
    .map((v) => [v.record.name, v.record.data.category])
    .sort((a, b) => a[0].localeCompare(b[0]));
  const attendu = Object.entries(CATEGORIE_ATTENDUE).sort((a, b) => a[0].localeCompare(b[0]));
  assert.deepEqual(observé, attendu, "chaque compétence, nommément, dans SA catégorie");
});

test("les catégories sont EXACTEMENT les quatre déclarées — Knowledge, Social, Exploration, Physical", () => {
  const verbs = pile();
  const catégories = new Set(verbs.query({ kind: "skill" }).map((v) => v.record.data.category));
  assert.deepEqual([...catégories].sort(), [...LES_4_CATEGORIES].sort(),
    "pas une cinquième — `Tools & Trainings` range un GENRE (`tool`), pas une catégorie de compétence");
});

test("une catégorie est un IDENTIFIANT, jamais un mot affichable (loi §0.13)", () => {
  const verbs = pile();
  for (const vue of verbs.query({ kind: "skill" })) {
    const category = vue.record.data.category;
    assert.match(category, /^[a-z]+$/, `« ${vue.record.name} » : « ${category} » doit être en minuscules, sans espace`);
    assert.equal(category, category.toLowerCase());
    assert.notEqual(category[0], category[0].toUpperCase(), "aucune majuscule — ni « Knowledge » ni un mot de fiche");
  }
});

test("REFUS — une compétence conservée renommée au SRD fait jeter son patch de catégorie, en la nommant", () => {
  /* MÊME MONTAGE QUE « REFUS — une classe du SRD oubliée par la table des
     pools » (buildClasses) : renommer garde le COMPTE des 18 intact — la
     compétence reste CONSERVÉE (ni retirée, ni neuve), donc toujours
     candidate à un patch de catégorie, mais sa cible a disparu. Le générateur
     refuse en la NOMMANT, exactement le sort d'une compétence dont la
     catégorie manquerait (§5 point 10 de la commande). */
  const srd = srdAmputé(renomme("skill", "srd:skill:en:religion", "srd:skill:en:spirituality"));
  assert.throws(() => buildLayer({ srd }), (err) => {
    assert.match(err.message, /srd:skill:en:religion/, "le refus NOMME la compétence dont la catégorie tombe dans le vide");
    return true;
  });
});

test("ATTAQUE — l'assertion des 26 rougit sur une liste truquée", () => {
  /* Le garde qui compte passerait avec 26 mauvaises. Celui-ci ne doit pas :
     on remplace UNE entrée par une compétence plausible et absente. */
  const truqué = LES_26.map(([n, a]) => (n === "Delve" ? ["Spelunking", a] : [n, a]))
    .sort((a, b) => a[0].localeCompare(b[0]));
  const verbs = pile();
  const observé = verbs.query({ kind: "skill" })
    .map((v) => [v.record.name, v.record.data.ability_key])
    .sort((a, b) => a[0].localeCompare(b[0]));

  assert.equal(observé.length, truqué.length, "même compte — c'est bien le piège");
  assert.notDeepEqual(observé, truqué, "et pourtant l'assertion doit les distinguer");
});

test("ATTAQUE — l'assertion rougit aussi sur une caractéristique déplacée", () => {
  /* Le cas le plus vicieux : les 26 bons noms, une seule mauvaise ability. */
  const truqué = LES_26.map(([n, a]) => (n === "Tactics" ? [n, "wis"] : [n, a]))
    .sort((a, b) => a[0].localeCompare(b[0]));
  const verbs = pile();
  const observé = verbs.query({ kind: "skill" })
    .map((v) => [v.record.name, v.record.data.ability_key])
    .sort((a, b) => a[0].localeCompare(b[0]));

  assert.deepEqual(observé.map((e) => e[0]), truqué.map((e) => e[0]), "mêmes 26 noms");
  assert.notDeepEqual(observé, truqué, "et l'assertion doit quand même rougir");
});

test("acceptation 1 — les 36 outils, nommément ; les deux génériques sont partis", () => {
  const verbs = pile();
  const vues = verbs.query({ kind: "tool" });
  assert.deepEqual(nomsTriés(vues), [...LES_36_OUTILS].sort(),
    "les 36 outils de Fate's Hand");

  assert.equal(verbs.query({ kind: "tool", id: "srd:tool:en:gaming-set" }), null,
    "le Gaming Set générique est éclaté en quatre, il ne doit pas rester à côté d'eux");
  assert.equal(verbs.query({ kind: "tool", id: "srd:tool:en:musical-instrument" }), null,
    "le Musical Instrument générique est éclaté en trois");
});

test("acceptation 1 — les trois outils re-caractérisés le sont, et rien d'autre n'a bougé chez eux", () => {
  const verbs = pile();
  const attendu = [
    ["srd:tool:en:mason-s-tools", "int", "Intelligence"],
    ["srd:tool:en:tinker-s-tools", "int", "Intelligence"],
    ["srd:tool:en:potter-s-tools", "wis", "Wisdom"]
  ];
  const srd = readSrdLayer(SRD_PATH);
  for (const [id, key, nom] of attendu) {
    const vue = verbs.query({ kind: "tool", id });
    assert.equal(vue.record.data.ability_key, key, `${id} : la clef`);
    assert.equal(vue.record.data.ability, nom, `${id} : le nom affichable suit la clef`);

    /* LE PATCH EST ÉTROIT. Coût, poids et usage viennent du SRD et ne doivent
       pas avoir été recopiés — donc pas dérivé non plus. */
    const source = srd.records.tool[id].data;
    assert.equal(vue.record.data.cost, source.cost, `${id} : le coût reste celui du SRD`);
    assert.equal(vue.record.data.weight, source.weight, `${id} : le poids reste celui du SRD`);
    assert.equal(vue.record.data.utilize, source.utilize, `${id} : l'usage reste celui du SRD`);
  }
});

test("acceptation 1 — les sept outils éclatés héritent l'usage de leur parent SRD, mot pour mot", () => {
  const verbs = pile();
  const srd = readSrdLayer(SRD_PATH);
  const hérités = TOOLS_ADDED.filter((e) => e.inherits);
  assert.equal(hérités.length, 7, "quatre jeux et trois familles d'instruments");

  for (const entry of hérités) {
    const vue = verbs.query({ kind: "tool", id: `fh:tool:en:${entry.slug}` });
    assert.ok(vue, `« ${entry.name} » doit exister`);
    assert.equal(vue.record.data.utilize, srd.records.tool[entry.inherits].data.utilize,
      `« ${entry.name} » porte l'usage de son parent, LU dans le SRD et jamais recopié à la main`);
  }
});

test("acceptation 1 — les six outils Fate's Hand purs n'inventent aucun usage", () => {
  const verbs = pile();
  const purs = TOOLS_ADDED.filter((e) => !e.inherits);
  assert.equal(purs.length, 6, "trois véhicules et trois montures");

  for (const entry of purs) {
    const vue = verbs.query({ kind: "tool", id: `fh:tool:en:${entry.slug}` });
    assert.ok(vue, `« ${entry.name} » doit exister`);
    assert.equal(vue.record.data.utilize, undefined,
      `« ${entry.name} » : le canon ne donne pas d'usage, et ce lot n'en invente pas`);
  }
});

test("acceptation 1 — les deux `ref` que la couche des espèces avait déjà pris sont vivants", () => {
  /* `fh-species-en` a été écrite AVANT celle-ci et pointe vers deux de ses
     records. Un `ref` mort ne se verrait qu'à la dérivation, sur la fiche d'un
     joueur : on le vérifie ici. */
  const verbs = pile();
  const elestu = JSON.parse(readFileSync(join(ROOT, "layers/fh-species-en.layer.json"), "utf8"))
    .records.species["fh:species:en:elestu"];
  /* LOT 34 — Keen Senses est un `granted_skill_budget` (budget captif de
     2 points), plus un `granted_skill_choice` compté. */
  const visés = elestu.data.granted_skill_budget.from;
  assert.deepEqual(visés, ["srd:skill:en:survival", "fh:skill:en:delve", "fh:skill:en:vigilance"],
    "le trio de Keen Senses, tel que la couche des espèces le déclare");

  for (const id of visés) {
    assert.ok(verbs.query({ kind: "skill", id }), `« ${id} » est désigné par l'Elestu et doit exister`);
  }
});

/* ══ TEST D'ACCEPTATION 4 — LE SRD PUR TRAVERSE ════════════════════════
   Le plus important des quatre. S'il ne passe pas, Fate's Hand a été tissé
   dans le chemin commun (loi §0.12). */

test("acceptation 4 — couche FH débrayée, la pile rend les 18 du SRD, Perception comprise", () => {
  const verbs = pile({ fh: false });
  assert.deepEqual(nomsTriés(verbs.query({ kind: "skill" })), [...LES_18_SRD].sort(),
    "les 18 compétences du SRD, sans rien de Fate's Hand");
  assert.ok(verbs.query({ kind: "skill", id: "srd:skill:en:perception" }),
    "Perception est de retour dès que la couche FH n'est plus montée");
  assert.equal(verbs.query({ kind: "tool" }).length, EXPECTED.srdTools,
    "et les 25 outils du SRD, génériques compris");
  assert.ok(verbs.query({ kind: "tool", id: "srd:tool:en:gaming-set" }),
    "le Gaming Set générique aussi");
});

test("acceptation 4 — aucune compétence Fate's Hand ne fuit dans une pile SRD pure", () => {
  const verbs = pile({ fh: false });
  for (const entry of SKILLS_ADDED) {
    assert.equal(verbs.query({ kind: "skill", id: `fh:skill:en:${entry.slug}` }), null,
      `« ${entry.name} » ne doit exister que si la couche FH est montée`);
  }
});

test("acceptation 4 — `disable`/`enable` rendent la pile réversible, sans remonter les octets", () => {
  /* La preuve que la couche EST une couche : on la débraye à chaud et le SRD
     revient entier, puis on la rembraye et les 26 reviennent. */
  const bus = makeBus();
  const layers = createLayers({ bus });
  layers.verbs.register({ bytes: fileBytes(SRD_EN), origin: SRD_EN });
  layers.verbs.register({ bytes: fileBytes(FH_SKILLS_EN), origin: FH_SKILLS_EN });

  assert.equal(layers.verbs.query({ kind: "skill" }).length, EXPECTED.skills);

  layers.verbs.disable({ id: "fh-skills-en" });
  assert.deepEqual(nomsTriés(layers.verbs.query({ kind: "skill" })), [...LES_18_SRD].sort(),
    "débrayée, la pile est exactement le SRD");
  assert.deepEqual(layers.verbs.flags(), [], "et elle ne lève plus le drapeau");

  layers.verbs.enable({ id: "fh-skills-en" });
  assert.equal(layers.verbs.query({ kind: "skill" }).length, EXPECTED.skills,
    "rembrayée, les 26 reviennent");
  assert.deepEqual(layers.verbs.flags(), ["fh.skills"]);
});

/* ══ LES POOLS DE CLASSE — LA MATIÈRE, PAS LA DÉRIVATION ═══════════════
   Ces suites vérifient que le CONTENU du chapitre est posé et juste. Elles ne
   vérifient PAS qu'un personnage reçoit son pool : cette dérivation-là est
   suspendue (question 1 de l'inventaire). La distinction est le cœur de ce
   lot — la matière est livrée, la destination du nombre ne l'est pas. */

/* ══ LOT 82 — TROIS TOTAUX, PLUS UN `base` UNIQUE ═════════════════════
   Canon `Skill & Tool Points — Canon (SRD to FH).md` §B.1, ratifié par Eric
   le 2026-08-18. Le `base` unique dont on déduisait les imposés est mort : il
   mélangeait en un nombre ce que le canon sépare en trois, et c'est cette
   confusion qui a laissé vivre six pools faux pendant des mois.

     bound skill points · bound tool points · free point pool

   ⛔ LE JOUEUR NE MANIPULE QUE LE TROISIÈME. Les deux premiers sont déjà
   dépensés quand la feuille lui arrive — jamais dans le pool, jamais
   récupérables (canon §B.0).

   ⚠️ CES DOUZE LIGNES SONT LE CANON RECOPIÉ, PAS UNE DÉRIVATION. La recette
   qui les produit vit en §A.5 du canon (V = 2×maîtrises + 2×expertises,
   moitié bound / moitié free, + 6 arrière-plan + 2 bonus FH, puis les
   ajustements nommés d'Eric). La recopier ici la rendrait vérifiable contre
   elle-même — c'est la table publiée qu'on épingle. */
const LES_12_POOLS = [
  ["srd:class:en:barbarian", { bound_skill_points: 2, bound_tool_points: 0, free_point_pool: 10 }],
  ["srd:class:en:bard", { bound_skill_points: 3, bound_tool_points: 2, free_point_pool: 12 }],
  ["srd:class:en:cleric", { bound_skill_points: 2, bound_tool_points: 0, free_point_pool: 10 }],
  ["srd:class:en:druid", { bound_skill_points: 2, bound_tool_points: 1, free_point_pool: 12 }],
  ["srd:class:en:fighter", { bound_skill_points: 2, bound_tool_points: 0, free_point_pool: 10 }],
  ["srd:class:en:monk", { bound_skill_points: 2, bound_tool_points: 0, free_point_pool: 10 }],
  ["srd:class:en:paladin", { bound_skill_points: 2, bound_tool_points: 0, free_point_pool: 10 }],
  ["srd:class:en:ranger", { bound_skill_points: 3, bound_tool_points: 0, free_point_pool: 12 }],
  ["srd:class:en:rogue", { bound_skill_points: 6, bound_tool_points: 1, free_point_pool: 14 }],
  ["srd:class:en:sorcerer", { bound_skill_points: 2, bound_tool_points: 0, free_point_pool: 10 }],
  ["srd:class:en:warlock", { bound_skill_points: 2, bound_tool_points: 0, free_point_pool: 10 }],
  ["srd:class:en:wizard", { bound_skill_points: 2, bound_tool_points: 0, free_point_pool: 10 }]
];

test("les douze classes portent LEURS TROIS TOTAUX — bound skill, bound tool, free point pool", () => {
  const verbs = pile();
  const observé = LES_12_POOLS.map(([id]) => {
    const vue = verbs.query({ kind: "class", id });
    assert.ok(vue, `« ${id} » doit exister`);
    const pool = vue.record.data.fh_skill_pool;
    return [id, {
      bound_skill_points: pool.bound_skill_points,
      bound_tool_points: pool.bound_tool_points,
      free_point_pool: pool.free_point_pool
    }];
  });
  assert.deepEqual(observé, LES_12_POOLS,
    "canon §B.1 : Rogue 6/1/14 · Bard 3/2/12 · Druid 2/1/12 · Ranger 3/0/12 · Monk 2/0/10 · les sept autres 2/0/10");
});

test("⛔ `base` EST MORT — aucune classe n'en porte plus, et rien ne peut le relire", () => {
  const verbs = pile();
  for (const [id] of LES_12_POOLS) {
    const pool = verbs.query({ kind: "class", id }).record.data.fh_skill_pool;
    assert.equal(pool.base, undefined,
      `« ${id} » porte encore un \`base\` — un lecteur oublié rendrait le pool d'avant le canon, sans un mot`);
  }
  /* Et pas seulement sur les vues montées : dans les OCTETS de la couche. Un
     `base` survivant ailleurs (un record d'une autre couche, un commentaire
     recopié) serait relu par le premier `pool.base` resté dans `src/`. */
  const octets = readFileSync(join(ROOT, FH_SKILLS_EN), "utf8");
  assert.equal(/"base"\s*:/.test(octets), false,
    "la couche compilée ne doit plus porter une seule clef `base` (loi §0.5)");
});

test("le bound n'est JAMAIS dans le pool — les trois totaux ne se recouvrent pas", () => {
  const verbs = pile();
  /* Canon §B.0 : « Bound points are never in the free point pool. They are
     already spent, before the character sheet is handed over. » Le test qui
     mord, c'est le ROGUE : 6 + 1 + 14 = 21, et 21 n'est le `base` d'aucune
     ancienne ligne (il valait 18). Un moteur qui aurait « corrigé » 18 en
     rangeant les imposés dedans passerait le test précédent et échouerait
     ici. */
  const rogue = verbs.query({ kind: "class", id: "srd:class:en:rogue" }).record.data.fh_skill_pool;
  assert.equal(rogue.bound_skill_points + rogue.bound_tool_points + rogue.free_point_pool, 21,
    "canon §B.1, colonne (total) : le rogue reçoit 21 points au total, dont 14 seulement lui appartiennent");

  const bard = verbs.query({ kind: "class", id: "srd:class:en:bard" }).record.data.fh_skill_pool;
  assert.equal(bard.bound_skill_points + bard.bound_tool_points + bard.free_point_pool, 17);
});

test("⛔ DOUZE classes, pas treize — l'Artificier n'est ni au SRD ni dans la couche", () => {
  const verbs = pile();
  const classes = verbs.query({ kind: "class" });
  assert.equal(classes.length, EXPECTED.classes);
  assert.equal(verbs.query({ kind: "class", id: "srd:class:en:artificer" }), null);

  /* Et il n'est mentionné NULLE PART dans la couche, pas même en commentaire :
     le dépôt est public, et l'Artificier est du contenu WotC hors SRD. */
  const octets = readFileSync(join(ROOT, FH_SKILLS_EN), "utf8");
  assert.equal(/artificer/i.test(octets), false,
    "le mot ne doit pas apparaître dans l'artefact publié (loi §0.8)");
});

test("la progression du barde vaut +1 par niveau dès le 2, en plus du +2 universel", () => {
  const verbs = pile();
  const barde = verbs.query({ kind: "class", id: "srd:class:en:bard" }).record.data.fh_skill_pool;

  assert.equal(barde.by_level["2"], 1, "niveau 2 : le +1 du barde seul");
  assert.equal(barde.by_level["3"], 1);
  assert.equal(barde.by_level["4"], 3, "niveau 4 : son +1 ET le +2 universel — le chapitre écrit « +1+2(21) »");

  /* LE CUMUL, et c'est la vérification qui attrape une cadence fausse là où
     les paliers isolés peuvent tous sembler bons. ⚠️ LOT 82 : le point de
     départ est le FREE POINT POOL (12), plus le `base` de 16 — ce que le
     barde cumule, c'est ce qu'il peut DÉPENSER, et son bound n'en a jamais
     fait partie. */
  let cumul = barde.free_point_pool;
  for (let n = 2; n <= 8; n += 1) cumul += barde.by_level[String(n)] || 0;
  assert.equal(cumul, 23, "12 + 7×(+1) + 2×(+2) = 23 free points au niveau 8");
});

test("une classe sans le +1 du barde ne gagne qu'aux niveaux 4, 8, 12, 16 et 20", () => {
  const verbs = pile();
  const rogue = verbs.query({ kind: "class", id: "srd:class:en:rogue" }).record.data.fh_skill_pool;
  assert.deepEqual(Object.keys(rogue.by_level).map(Number).sort((a, b) => a - b), [4, 8, 12, 16, 20]);
  assert.ok(Object.values(rogue.by_level).every((v) => v === 2), "+2 à chaque palier");

  let cumul = rogue.free_point_pool;
  for (let n = 2; n <= 8; n += 1) cumul += rogue.by_level[String(n)] || 0;
  assert.equal(cumul, 18, "14 + 2 + 2 = 18 free points au niveau 8");
});

test("les coûts des paliers voyagent avec le pool qu'ils dépensent", () => {
  const verbs = pile();
  const pool = verbs.query({ kind: "class", id: "srd:class:en:wizard" }).record.data.fh_skill_pool;
  /* ⛔ LOT 82 — `imposed` A DISPARU. Il chiffrait ce qu'un choix imposé
     DÉDUISAIT du pool ; le canon §B.0 supprime la déduction (les points bound
     sont publiés à part et n'ont jamais transité par le pool), donc le nombre
     n'a plus rien à chiffrer. Le laisser en ferait un fantôme relu un jour. */
  assert.deepEqual(pool.tier_costs, { half: 1, proficient: 2, expertise: 4 },
    "canon §A.1 : novice = 1 · adept = 2 · expert = 4, et pas un quatrième palier");
  assert.equal(pool.expertise_from_level, 4, "le magicien reste au défaut du canon §B.2");
});

/* ══ LE VERROU D'EXPERTISE — TROIS CLASSES DÉROGENT (lot 82) ══════════
   Canon §B.1ter, « Class features that grant Expertise → free points + a
   permission ». Un trait qui accorde l'Expertise tend DEUX choses, et la
   seconde est ce verrou : **le droit d'en acheter avant le niveau 4**.

     Rogue  — Expertise, niveau 1  → achète dès le niveau 1
     Bard   — Expertise, niveau 2  → achète dès le niveau 2
     Ranger — Deft Explorer, niv. 2 → achète dès le niveau 2
     les neuf autres                → le défaut, niveau 4 (canon §B.2)

   ⚠️ LE ROGUE EST UN FANTÔME QU'IL NE FAUT PAS « CORRIGER ». Deux
   contrôleurs sur cinq ont signalé son `1` comme faux le 2026-08-18 ; c'est
   le canon qui se contredisait, pas le code. Son trait de niveau 1 EST sa
   permission. Ce qu'il n'a pas, ce sont des free points : ses deux expertises
   sont déjà payées dans son kit (canon §A.5, §B.1ter). */

test("Rogue dès le niveau 1, Bard et Ranger dès le 2, les neuf autres au niveau 4", () => {
  const verbs = pile();
  const dérogent = { "srd:class:en:rogue": 1, "srd:class:en:bard": 2, "srd:class:en:ranger": 2 };

  for (const [id, niveau] of Object.entries(dérogent)) {
    const pool = verbs.query({ kind: "class", id }).record.data.fh_skill_pool;
    assert.equal(pool.expertise_from_level, niveau,
      `« ${id} » ouvre l'expertise au niveau ${niveau} — canon §B.1ter`);
  }

  const lesNeufAutres = LES_12_POOLS.filter(([id]) => !(id in dérogent));
  assert.equal(lesNeufAutres.length, 9, "trois classes dérogent, neuf restent au défaut");
  for (const [id] of lesNeufAutres) {
    const pool = verbs.query({ kind: "class", id }).record.data.fh_skill_pool;
    assert.equal(pool.expertise_from_level, 4, `« ${id} » reste au défaut du canon §B.2`);
  }
});

test("le patch des pools est ÉTROIT — `skill_choice` du SRD n'est pas touché", () => {
  const verbs = pile();
  const srd = readSrdLayer(SRD_PATH);
  for (const [id] of LES_12_POOLS) {
    const vue = verbs.query({ kind: "class", id });
    assert.deepEqual(vue.record.data.skill_choice, srd.records.class[id].data.skill_choice,
      `${id} : les choix imposés de la classe restent ceux du SRD`);
    assert.equal(vue.record.data.hit_die, srd.records.class[id].data.hit_die);
  }
});

test("acceptation 4 — couche débrayée, aucune classe ne porte de pool", () => {
  const verbs = pile({ fh: false });
  for (const [id] of LES_12_POOLS) {
    assert.equal(verbs.query({ kind: "class", id }).record.data.fh_skill_pool, undefined,
      `${id} : un personnage SRD pur n'a pas de pool de points Fate's Hand`);
  }
});

test("REFUS — une 13ᵉ classe au SRD ferait jeter, au lieu de rester sans pool", () => {
  const srd = srdAmputé((s) => {
    s.records.class["srd:class:en:artificer"] = { name: "X", slug: "x", data: {} };
  });
  assert.throws(() => buildLayer({ srd }), (err) => {
    assert.match(err.message, /13 classes|douze|Artificier/i);
    return true;
  });
});

test("REFUS — une classe du SRD oubliée par la table des pools fait jeter", () => {
  /* Renommer une classe la rend « non servie » sans changer le compte : c'est
     le seul montage qui atteint CE garde plutôt que celui des douze. */
  const srd = srdAmputé(renomme("class", "srd:class:en:monk", "srd:class:en:mystic"));
  assert.throws(() => buildLayer({ srd }), /srd:class:en:monk/);
});

/* ══ L'ARRIÈRE-PLAN, RETIRÉ — REMPLACÉ PAR L'INHERITANCE (lot 43) ══════
   Addendums §4, réécrit le 2026-08-13 : « IL N'Y A PLUS DE RECORD
   D'ARRIÈRE-PLAN DU TOUT ». Le lot 35 avait seulement PATCHÉ les quatre
   records SRD (retrait de `skill_ids`, `tool_id`/`tool_choice`) : ils
   restaient choisissables. Ce lot les ÉTEINT (`op: "disable"`) et ajoute
   `fh:background:en:inheritance`, le seul arrière-plan de la pile FH,
   livré et jamais choisi (contrat §1a). */

test("les quatre arrière-plans du SRD sont ÉTEINTS — la pile FH ne les rend plus", () => {
  const verbs = pile();
  for (const entry of BACKGROUNDS_EXTINGUISHED) {
    assert.equal(verbs.query({ kind: "background", id: entry.target }), null,
      `« ${entry.target} » : disable() retire le record entier de la pile FH`);
  }
  /* ⛔ Et sous le SRD nu, sans la couche FH, les quatre existent toujours —
     `disable` retire de la PILE, jamais du SRD commité (§L7, `op:"disable"`
     rend « ce qu'elle avait désactivé » quand la couche se retire). */
  const srdSeul = pile({ fh: false });
  for (const entry of BACKGROUNDS_EXTINGUISHED) {
    assert.ok(srdSeul.query({ kind: "background", id: entry.target }),
      `« ${entry.target} » : intact sous le SRD pur, hors de la pile Fate's Hand`);
  }
});

test("l'Inheritance est le SEUL arrière-plan de la pile Fate's Hand", () => {
  const verbs = pile();
  const tous = verbs.query({ kind: "background" });
  assert.equal(tous.length, 1, "les quatre du SRD sont éteints, un seul record les remplace");
  assert.equal(tous[0].id, BACKGROUND_INHERITANCE.id);
  assert.equal(tous[0].record.name, "Inheritance");
});

test("l'Inheritance ne porte NI `ability_keys` NI `feat_id` — c'est la règle, pas un oubli", () => {
  const verbs = pile();
  const data = verbs.query({ kind: "background", id: BACKGROUND_INHERITANCE.id }).record.data;
  /* §1c — l'absence D'`ability_keys` EST la règle : un record qui ne nomme pas
     ses clefs ne les restreint pas, donc les SIX caractéristiques sont
     proposées (`decisions.mjs`, `backgroundBoostPlan`). */
  assert.equal(Object.hasOwn(data, "ability_keys"), false);
  /* §1b/§3d — pas de `feat_id` (imposé) : à la place, `feat_choice.from`, le
     don d'origine libre. */
  assert.equal(Object.hasOwn(data, "feat_id"), false);
  assert.deepEqual(data.feat_choice, { from: "origin" });
});

/* ⚠️ PAS DE TEST SÉPARÉ « disable() vise un record absent du SRD » ICI : le
   supprimer changerait aussi le COMPTE (3 au lieu de 4), et c'est le contrôle
   `EXPECTED.backgrounds` qui mordrait, jamais `srdRecord()`. C'est exactement
   la mesure du commentaire de `renomme()` un peu plus bas. Le test « REFUS —
   un arrière-plan du SRD oublié par la table d'extinction » l'exerce déjà en
   RENOMMANT (compte inchangé, cible introuvable) : ce garde-là, pas un
   nouveau. */

test("REFUS — un cinquième arrière-plan au SRD ferait jeter, au lieu de rester intact en silence", () => {
  const srd = srdAmputé((s) => {
    s.records.background["srd:background:en:hermit"] = {
      name: "Hermit", slug: "hermit", data: { skill_ids: [], ability_keys: ["wis"] }
    };
  });
  assert.throws(() => buildLayer({ srd }), /5 arrière-plans|quatre/i);
});

test("REFUS — un arrière-plan du SRD oublié par la table d'extinction fait jeter", () => {
  const srd = srdAmputé(renomme("background", "srd:background:en:criminal", "srd:background:en:outlaw"));
  assert.throws(() => buildLayer({ srd }), /srd:background:en:criminal/);
});

/* ══ LE GÉNÉRATEUR — REPRODUCTIBILITÉ ET REFUS ═════════════════════════ */

test("le fichier commité est EXACTEMENT ce que le générateur produit", () => {
  const { layer } = buildLayer({ srd: readSrdLayer(SRD_PATH) });
  assert.equal(serialize(layer), readFileSync(join(ROOT, FH_SKILLS_EN), "utf8"),
    "un re-run doit laisser l'arbre propre (loi §0.3)");
});

test("deux générations d'affilée rendent le même octet", () => {
  const dir = mkdtempSync(join(tmpdir(), "fh-skills-"));
  try {
    const a = generate({ outDir: dir, srdPath: SRD_PATH });
    const premier = readFileSync(a.outPath, "utf8");
    const b = generate({ outDir: dir, srdPath: SRD_PATH });
    assert.equal(readFileSync(b.outPath, "utf8"), premier, "le générateur est déterministe");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("le générateur rend bien 17 + 9 et 23 + 13 — l'arithmétique du chapitre", () => {
  const { skills, tools } = buildLayer({ srd: readSrdLayer(SRD_PATH) });
  assert.deepEqual(
    { conservées: skills.kept, neuves: skills.added, total: skills.total },
    { conservées: 17, neuves: 9, total: 26 });
  assert.deepEqual(
    { conservés: tools.kept, neufs: tools.added, total: tools.total },
    { conservés: 23, neufs: 13, total: 36 });
});

/** Une couche SRD amputée : la privation est DÉLIBÉRÉE, pas une pénurie de
 *  circonstance qui cesserait de prouver le jour où la source s'enrichit. */
function srdAmputé(mutate) {
  const srd = JSON.parse(JSON.stringify(readSrdLayer(SRD_PATH)));
  mutate(srd);
  return srd;
}

/** RENOMMER plutôt que SUPPRIMER, et c'est une correction de ce lot.
 *
 *  ⚠️ Écrits d'abord avec un `delete`, ces deux tests passaient « au vert du
 *  mauvais garde » : retirer un record change aussi le COMPTE, si bien que
 *  c'est le contrôle des 18/25 qui mordait, et le garde de nommage n'était
 *  jamais atteint. Le renommage garde le compte intact et laisse donc la
 *  cible introuvable — c'est le seul montage qui prouve CE garde-là. */
function renomme(genre, de, vers) {
  return (s) => {
    s.records[genre][vers] = s.records[genre][de];
    delete s.records[genre][de];
  };
}

test("REFUS — un SRD où Perception a changé d'id fait jeter le retrait, en le nommant", () => {
  const srd = srdAmputé(renomme("skill", "srd:skill:en:perception", "srd:skill:en:eyesight"));
  assert.throws(() => buildLayer({ srd }), (err) => {
    assert.ok(err instanceof GenError);
    assert.match(err.message, /srd:skill:en:perception/,
      "le refus doit nommer le record introuvable");
    return true;
  });
});

test("REFUS — un SRD où le Gaming Set a changé d'id fait jeter l'héritage des quatre jeux", () => {
  const srd = srdAmputé(renomme("tool", "srd:tool:en:gaming-set", "srd:tool:en:board-games"));
  assert.throws(() => buildLayer({ srd }), /srd:tool:en:gaming-set/);
});

test("REFUS — un parent SRD privé de son `utilize` : le lot n'en invente pas", () => {
  const srd = srdAmputé((s) => { delete s.records.tool["srd:tool:en:musical-instrument"].data.utilize; });
  assert.throws(() => buildLayer({ srd }), /n'invente pas|utilize/);
});

test("REFUS — une 19ᵉ compétence apparue au SRD ne se glisse pas dans les 26", () => {
  /* Le garde qui compte vraiment : un total juste peut cacher un contenu
     faux, mais un record INCONNU doit toujours faire jeter. */
  const srd = srdAmputé((s) => {
    s.records.skill["srd:skill:en:brewing"] = { name: "Brewing", slug: "brewing", data: { ability_key: "int" } };
  });
  assert.throws(() => buildLayer({ srd }), /19 compétences|18/);
});

test("REFUS — un patch d'ability dont la cible a déjà bougé au SRD fait jeter", () => {
  /* Un patch qui n'a plus d'objet FIGE la valeur contre sa source : c'est
     exactement ce qu'une couche ne doit pas faire. */
  const srd = srdAmputé((s) => { s.records.tool["srd:tool:en:mason-s-tools"].data.ability_key = "int"; });
  assert.throws(() => buildLayer({ srd }), /mason-s-tools/);
});

test("REFUS — une caractéristique hors des cinq est du contenu faux, pas un champ manquant", () => {
  const srd = readSrdLayer(SRD_PATH);
  const source = SKILLS_ADDED.find((e) => e.slug === "might");
  const sauvegarde = source.ability;
  source.ability = "luck";
  try {
    assert.throws(() => buildLayer({ srd }), /luck|cinq/);
  } finally {
    source.ability = sauvegarde;
  }
});

test("REFUS — renommer `delve` casserait le `ref` que la couche des espèces a déjà pris", () => {
  const srd = readSrdLayer(SRD_PATH);
  const source = SKILLS_ADDED.find((e) => e.slug === "delve");
  const sauvegarde = source.slug;
  source.slug = "spelunking";
  try {
    assert.throws(() => buildLayer({ srd }), (err) => {
      assert.match(err.message, /fh:skill:en:delve/, "le refus nomme le `ref` qui mourrait");
      assert.match(err.message, /Elestu|fh-species/, "et il dit qui le tient");
      return true;
    });
  } finally {
    source.slug = sauvegarde;
  }
});

test("REFUS — une prose du SRD recopiée à la main dans un record neuf fait jeter", () => {
  /* Le contrôle porte sur le RÉSULTAT, pas sur l'intention : une recopie
     faite par distraction passerait tous les contrôles d'intention. */
  const srd = readSrdLayer(SRD_PATH);
  const source = SKILLS_ADDED.find((e) => e.slug === "might");
  const sauvegarde = source.exampleUses;
  source.exampleUses = srd.records.skill["srd:skill:en:athletics"].data.example_uses;
  try {
    assert.throws(() => buildLayer({ srd }), /mot pour mot|à la main/);
  } finally {
    source.exampleUses = sauvegarde;
  }
});

/* ══ LA MESURE DE LA QUESTION 1 — LA CASSE DE LA CLEF DE BUDGET ════════
   Ce test ne garde pas mon code : il FIGE une contradiction du dépôt, pour
   que la réponse de l'architecte la trouve mesurée plutôt que racontée.
   Voir INVENTAIRE-LOT-22.md, question 1. */

test("mesure — `fh.skillPoints` est REJETÉ par la grammaire des clefs de budget", () => {
  const schema = JSON.parse(readFileSync(join(ROOT, "schemas/fh-char.schema.json"), "utf8"));
  const grammaire = new RegExp(schema.$defs.flag.pattern);

  assert.equal(grammaire.test("fh.skillPoints"), false,
    "la clef que le `$comment` de `budgets` donne en exemple, et que la commande du lot 22 " +
    "attend dans son test d'acceptation 2, ne passe pas sa propre grammaire : " +
    "`$defs/flag` n'admet aucune majuscule.");
  assert.equal(grammaire.test("fh.skillpoints"), true,
    "la forme tout en minuscules, elle, passe — c'est celle que ce lot propose");
  assert.equal(grammaire.test("fh.destiny"), true,
    "et les drapeaux réellement utilisés dans le dépôt la respectent");
});

test("mesure — aucun verbe n'écrit `build.budgets`, et le document d'exemple le porte vide", () => {
  const exemple = JSON.parse(readFileSync(join(ROOT, "examples/personnage-srd-fr-niveau1.fh-char.json"), "utf8"));
  assert.deepEqual(exemple.build.budgets, {},
    "le seul document d'exemple du dépôt porte un `budgets` vide — personne ne le remplit");

  const schema = JSON.parse(readFileSync(join(ROOT, "schemas/fh-char.schema.json"), "utf8"));
  assert.ok(schema.$defs.build.required.includes("budgets"),
    "et pourtant le champ est REQUIS : requis, vide partout, et sans écrivain");
});

/* ══ LOT 82 — LA FICHE NE PEUT PLUS DÉRIVER DE LA COUCHE DES POINTS ═══
   `fh-fiche-en` est écrite À LA MAIN (aucun générateur ne la produit), et elle
   RECOPIE le pool de chaque classe dans un bloc de texte compressé pour la
   carte à 360 px. Une copie sans garde, c'est une deuxième source de vérité —
   exactement ce que la séance du 2026-08-18 a passé à démolir : les six pools
   faux ont vécu des mois parce que quatre documents se disaient chacun
   autoritaires.

   ⛔ CE TEST NE VÉRIFIE AUCUN NOMBRE. Il vérifie que les deux couches disent
   LE MÊME nombre, quel qu'il soit. Le jour où Eric change un pool, la couche
   des compétences bouge, la fiche ne suit pas, et c'est ici que ça rougit —
   pas trois mois plus tard, sur un écran, devant un joueur. */

test("⛔ DEUX COUCHES, UN SEUL NOMBRE — la fiche recopie le free point pool sans dériver", () => {
  const points = JSON.parse(readFileSync(join(ROOT, FH_SKILLS_EN), "utf8"));
  const fiche = JSON.parse(readFileSync(join(ROOT, "layers/fh-fiche-en.layer.json"), "utf8"));

  const attendu = Object.fromEntries(Object.entries(points.records.class)
    .map(([id, rec]) => [id, rec.changes["data[fh_skill_pool]"].free_point_pool]));

  const observé = {};
  for (const [id, rec] of Object.entries(fiche.records.class)) {
    for (const valeur of Object.values(rec.changes || {})) {
      if (!Array.isArray(valeur)) continue;
      for (const ligne of valeur) {
        if (ligne && ligne.label === "Free points") observé[id] = ligne.value;
      }
    }
  }

  assert.equal(Object.keys(observé).length, EXPECTED.classes,
    "les douze classes portent leur ligne de points sur la fiche — une classe muette est une carte trouée");
  for (const [id, libre] of Object.entries(attendu)) {
    assert.equal(observé[id], `${libre} pts`,
      `« ${id} » : la fiche annonce « ${observé[id]} » et la couche des points en donne ${libre}. ` +
      "Le joueur lit la fiche ; le moteur lit la couche. Deux nombres, un mensonge.");
  }

  /* ⚔️ ET L'ANCIEN LIBELLÉ NE DOIT PLUS EXISTER. « Skill pool » désignait le
     `base` d'avant le canon — tout, imposés compris. Le laisser sur une carte
     ferait lire au joueur un total qu'il ne dépensera jamais. */
  assert.equal(/"Skill pool"/.test(readFileSync(join(ROOT, "layers/fh-fiche-en.layer.json"), "utf8")), false,
    "« Skill pool » nommait le total d'avant le canon ; la carte annonce désormais ce qui se dépense");
});

/* ══ LOT 82 — LES APTITUDES QUI TENDENT DES POINTS (canon §B.1ter) ════
   Une aptitude de classe qui accorde l'Expertise tend DEUX choses, et le
   canon interdit de les fondre : des free points, et le droit de les dépenser
   en expertise avant le niveau 4. */

test("les cinq aptitudes du canon §B.1ter sont posées, chacune sur SON niveau", () => {
  const verbs = pile();
  const grantsDe = (slug) => verbs.query({ kind: "class", id: `srd:class:en:${slug}` })
    .record.data.fh_skill_pool.grants;

  assert.deepEqual(grantsDe("rogue"), [
    { level: 1, feature: "Expertise", points: 0, boundSkill: 0, unlocksExpertise: true }
  ], "le rogue reçoit la PERMISSION sans un point : ses deux expertises sont déjà dans son kit (canon §A.5)");

  assert.deepEqual(grantsDe("bard"), [
    { level: 2, feature: "Expertise", points: 4, boundSkill: 0, unlocksExpertise: true }
  ], "2 expertises = 4 free points");

  assert.deepEqual(grantsDe("ranger"), [
    { level: 2, feature: "Deft Explorer", points: 2, boundSkill: 0, unlocksExpertise: true },
    { level: 9, feature: "Expertise", points: 4, boundSkill: 0, unlocksExpertise: true }
  ], "une expertise au 2, deux au 9 — et le rôdeur de niveau 5 n'a que la première");

  assert.deepEqual(grantsDe("barbarian"), [
    { level: 3, feature: "Primal Knowledge", points: 0, boundSkill: 1, unlocksExpertise: false }
  ], "canon §B.1quater : le trait NOMME une liste, donc il est BOUND — et il tombe au niveau 3");

  /* Les huit autres n'en portent aucune, et c'est un FAIT, pas un trou. */
  for (const slug of ["cleric", "druid", "fighter", "monk", "paladin", "sorcerer", "warlock", "wizard"]) {
    assert.deepEqual(grantsDe(slug), [], `« ${slug} » n'a aucune aptitude qui tende des points`);
  }
});

test("⛔ LA PERMISSION SE DÉDUIT DU GRANT — les deux ne peuvent pas diverger", () => {
  const verbs = pile();
  /* `expertise_from_level` n'est plus écrit à la main nulle part : il est le
     niveau du PREMIER grant qui porte `unlocksExpertise`. Le test le recompose
     depuis les grants publiés — si la déduction cassait, les deux nombres se
     sépareraient ici, et pas dans six mois sur l'écran d'un joueur. */
  for (const [id] of LES_12_POOLS) {
    const pool = verbs.query({ kind: "class", id }).record.data.fh_skill_pool;
    const niveaux = pool.grants.filter((g) => g.unlocksExpertise).map((g) => g.level);
    const attendu = niveaux.length > 0 ? Math.min(...niveaux) : 4;
    assert.equal(pool.expertise_from_level, attendu,
      `« ${id} » : la permission doit venir de l'aptitude qui la porte, jamais d'un second nombre écrit à côté`);
  }
});

test("⚔️ ATTAQUE — un grant accroché à une aptitude que le SRD ne porte PAS fait jeter", () => {
  /* C'est ce garde qui a mesuré que *Bonus Proficiencies* (canon §B.1quater,
     « Bard — Bonus Proficiencies, level 3, +6 ») est une aptitude de
     SOUS-CLASSE (College of Lore) et pas de classe : il l'aurait refusée. */
  const srd = readSrdLayer(SRD_PATH);
  const bard = srd.records.class["srd:class:en:bard"].data.features;
  assert.equal(bard.some((f) => f.name === "Bonus Proficiencies"), false,
    "le SRD ne donne PAS Bonus Proficiencies au barde comme aptitude de classe");
  assert.equal(
    JSON.stringify(srd.records.class["srd:class:en:bard"].data.subclass).includes("Bonus Proficiencies"), true,
    "elle vit dans sa SOUS-CLASSE — la poser sur la classe la donnerait à toute voie de barde");
});
