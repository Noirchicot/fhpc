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
  const visés = elestu.data.granted_skill_choice.from;
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
