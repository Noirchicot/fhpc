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
/* LOT 179 — la pile de la PAGE, pour prouver que le Soulforging a DÉMÉNAGÉ
   et non disparu. Même paire que celle de `fh-spells.test.mjs`. */
import { monter } from "../src/tools/gen-fh-changes.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";
import {
  ROOT,
  SRD_EN,
  FH_SPECIES_EN,
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
  SKILLS_REWRITTEN,
  TOOLS_ADDED,
  TOOLS_REWRITTEN
} from "../src/tools/fh-skills-source.mjs";
/* LOT 185 — la liste des `ref` de Keen Senses, LÀ OÙ ELLE VIT. Le générateur
   la lit au même endroit ; c'est ce qui rend la mutation de son garde
   possible sans en recopier une seconde version ici. */
import { KEEN_SENSES_SKILLS } from "../src/tools/fh-species-source.mjs";

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

/** Les 8 neuves, avec la caractéristique que le chapitre leur donne.
 *  ⛔ VIGILANCE N'Y EST PLUS depuis le lot 185 : elle n'est plus un record
 *  NEUF, elle est `srd:skill:en:perception` RÉÉCRIT. Elle a son garde à elle,
 *  qui vérifie la même chose sur l'autre id. */
const LES_8_NEUVES = [
  ["Might", "str"], ["Appraise", "int"], ["Academics", "int"], ["Tactics", "int"],
  ["Hunting", "wis"], ["Delve", "wis"],
  ["Streetwise", "cha"], ["Leadership", "cha"]
];

/* 🔴 QUATRE NOMS ONT CHANGÉ LE 2026-08-20, et pas pour faire joli : la couche
   et le LIVRE d'Eric en donnaient deux versions (« String Instrument » ici,
   « Instrument (Strings) » dans `Skills & Tools`). Le livre est le manuscrit,
   la couche un dérivé — c'est donc la couche qui s'aligne. Et « Three-Dragon
   Ante » perd le « Set » que ses trois voisins gardent, parce que c'est ce que
   le livre écrit, deux fois, dans deux chapitres qui s'accordent. */
const LES_37_OUTILS = [
  "Alchemist’s Supplies", "Brewer’s Supplies", "Calligrapher’s Supplies", "Card Set",
  "Carpenter’s Tools", "Cartographer’s Tools", "Cobbler’s Tools", "Cook’s Utensils",
  "Dice Set", "Disguise Kit", "Dragonchess Set", "Forgery Kit", "Glassblower’s Tools",
  "Herbalism Kit", "Jeweler’s Tools", "Leatherworker’s Tools", "Mason’s Tools",
  "Mount (Air)", "Mount (Land)", "Mount (Water)", "Navigator’s Tools", "Instrument (Other)",
  "Painter’s Supplies", "Poisoner’s Kit", "Potter’s Tools", "Smith’s Tools", "Soulforging",
  "Instrument (Strings)", "Thieves’ Tools", "Three-Dragon Ante", "Tinker’s Tools",
  "Vehicles (Air)", "Vehicles (Land)", "Vehicles (Water)", "Weaver’s Tools",
  "Instrument (Wind)", "Woodcarver’s Tools"
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

/* ══ LA RÉÉCRITURE — LE GARDE QUI PORTE LE LOT 185 ═════════════════════
   🔴 Eric, 2026-09-09 : *« Eh bien au lieu de soustraire, réécrit. »*

   ⚠️ CE GARDE ENCODAIT LA LOI D'HIER, et c'est pour ça qu'il est réécrit et
   pas desserré. Il exigeait que Perception ait DISPARU (`op: "disable"`) ; il
   exige maintenant qu'elle SURVIVE sous le nom de son héritière. L'exigence
   n'a pas faibli d'un cran : elle a changé de cible.

   ⭐ ET C'EST LA SURVIE DE L'ID QUI EST LE SUJET. Un record éteint emporte
   silencieusement toute référence qui le nomme ; un record réécrit n'en casse
   aucune. C'est ce que ce test achète, et rien d'autre. */
test("🔴 LOT 185 — Perception est RÉÉCRITE en Vigilance : le record SRD survit, c'est un `patch`", () => {
  const verbs = pile();
  const vue = verbs.query({ kind: "skill", id: "srd:skill:en:perception" });
  assert.ok(vue, "⛔ le record du SRD doit RESTER dans la pile — c'est lui qui porte Vigilance");
  assert.equal(vue.record.name, "Vigilance", "et il porte le nom de son héritière");
  assert.equal(vue.record.data.name, "Vigilance",
    "⛔ les DEUX noms du record, pas un seul : l'écran lit `data.name` là où le menu lit la racine");
  /* ⚠️ LE SLUG EST LA CLEF DU DOCUMENT (`resolved.skills[].id`,
     `src/build/skills.mjs`). Le laisser sur « perception » imprimerait
     `perception` sur la fiche d'un personnage Fate's Hand. */
  assert.equal(vue.record.slug, "vigilance", "et son slug suit son nom, pas son id");
  assert.equal(vue.record.data.ability_key, "wis");
  assert.equal(vue.record.data.category, "exploration");

  /* ⛔ ET LE GESTE EST BIEN UN `patch`, LU DANS LA COUCHE. Sans cette moitié,
     un `add` qui écraserait le record du SRD passerait aussi — et il aurait
     coupé le lien avec la couche du dessous. */
  const couche = JSON.parse(readFileSync(join(ROOT, FH_SKILLS_EN), "utf8"));
  assert.equal(couche.records.skill["srd:skill:en:perception"].op, "patch",
    "⛔ un `patch`, jamais un `disable` : c'est le geste qui laisse l'id vivant");

  /* Le record d'origine n'est pas modifié : c'est la promesse du `patch`,
     et c'est ce qui permet à une pile SRD pure de retrouver Perception. */
  const srd = readSrdLayer(SRD_PATH);
  assert.equal(srd.records.skill["srd:skill:en:perception"].name, "Perception",
    "la réécriture est une opération de pile, pas une mutation de la couche du dessous");
});

test("🔴 LOT 185 — Vigilance n'existe qu'UNE fois : l'ajout `fh:` a disparu au profit du SRD réécrit", () => {
  /* ⛔ LE PIÈGE CENTRAL DU LOT, ET IL EST INVISIBLE AUX TOTAUX. Vigilance
     vivait dans `SKILLS_ADDED` sous `fh:skill:en:vigilance`. Lui donner le
     record SRD sans l'ôter de la liste des ajouts aurait rendu DEUX records
     pour la même compétence — et le compte serait passé de 26 à 27 sans que
     personne sache lequel des deux le joueur choisit.
     ⚠️ Le total (26) ne dit rien de ça : 18 + 9 = 27 est une arithmétique
     aussi juste que 18 + 8 = 26. C'est le doublon NOMMÉ qui le dit. */
  const verbs = pile();
  assert.equal(verbs.query({ kind: "skill", id: "fh:skill:en:vigilance" }), null,
    "⛔ l'ancien id d'ajout ne doit plus exister — sinon Vigilance serait deux compétences");
  assert.equal(SKILLS_ADDED.some((e) => e.slug === "vigilance" || e.name === "Vigilance"), false,
    "⛔ ni dans la source : la liste des ajouts ne peut pas redéclarer un héritier réécrit");

  const vigilances = verbs.query({ kind: "skill" }).filter((v) => v.record.name === "Vigilance");
  assert.equal(vigilances.length, 1, "une seule Vigilance dans toute la pile");
  assert.equal(vigilances[0].id, "srd:skill:en:perception", "et c'est le record du SRD, réécrit");
});

test("acceptation 1 — les 8 neuves portent chacune leur caractéristique", () => {
  const verbs = pile();
  for (const [nom, ability] of LES_8_NEUVES) {
    const slug = nom.toLowerCase();
    const vue = verbs.query({ kind: "skill", id: `fh:skill:en:${slug}` });
    assert.ok(vue, `« ${nom} » doit exister sous l'id fh:skill:en:${slug}`);
    assert.equal(vue.record.name, nom);
    assert.equal(vue.record.data.ability_key, ability, `la caractéristique de « ${nom} »`);
    assert.ok(typeof vue.record.data.example_uses === "string" && vue.record.data.example_uses.length > 0,
      `« ${nom} » doit porter sa description`);
  }

  /* ⛔ ET L'HÉRITIÈRE RÉÉCRITE PASSE LA MÊME INSPECTION, sur son autre id.
     Sans cette moitié, sortir Vigilance de la liste des neuves l'aurait sortie
     du contrôle en même temps — un garde qu'on allège en déplaçant son sujet
     est un garde qu'on desserre. */
  const vigilance = verbs.query({ kind: "skill", id: "srd:skill:en:perception" });
  assert.equal(vigilance.record.name, "Vigilance");
  assert.equal(vigilance.record.data.ability_key, "wis", "la caractéristique de « Vigilance »");
  assert.match(vigilance.record.data.example_uses, /threat detection/,
    "« Vigilance » porte SA description, pas celle que Perception avait au SRD");
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

test("acceptation 1 — les 36 outils de CETTE couche, nommément ; les deux génériques sont RÉÉCRITS", () => {
  /* 🔴 36 DEPUIS LE LOT 179, ET LE 37ᵉ N'A PAS DISPARU — il a changé de
     couche. `Soulforging` est parti dans `fh-soulforging-en` pour que le
     chapitre `Soulforge Crafting` s'éteigne sans emporter le pool de points
     de compétence des douze espèces. Cette pile-ci ne monte QUE le SRD et
     `fh-skills-en` : elle mesure ce que cette couche porte SEULE, et c'est
     36. Le test suivant tient l'autre bout — les 37 dans la pile réelle. */
  const verbs = pile();
  const vues = verbs.query({ kind: "tool" });
  assert.deepEqual(nomsTriés(vues), LES_37_OUTILS.filter((n) => n !== "Soulforging").sort(),
    "les 36 outils que `fh-skills-en` porte seule");

  assert.equal(verbs.query({ kind: "tool", id: "fh:tool:en:soulforging" }), null,
    "⛔ le Soulforging ne doit plus être dans CETTE couche — sinon il serait dans les deux");

  /* ══ 🔴 LOT 185 — LES DEUX GÉNÉRIQUES NE MEURENT PLUS, ILS DEVIENNENT ═══
     ⚠️ LE GARDE A CHANGÉ DE LOI, PAS DE FORCE. Il exigeait `query(...) === null`
     — le générique éteint. Il exige maintenant que le record SURVIVE sous le
     nom de son héritier : ce qu'il défend est le même (aucun record GÉNÉRIQUE
     à côté de ses héritiers, sans quoi chaque maîtrise doublerait), mais la
     réécriture y arrive sans casser les deux rangements de `srfh-shelving-en`
     qui pointent vers ces ids.
     ⭐ Héritiers tranchés par Eric le 2026-09-09 : les DÉS et les CORDES. */
  const attenduReecrit = [
    ["srd:tool:en:gaming-set", "Dice Set", "gaming-set-dice", "wis"],
    ["srd:tool:en:musical-instrument", "Instrument (Strings)", "instrument-strings", "cha"]
  ];
  for (const [id, nom, slug, ability] of attenduReecrit) {
    const vue = verbs.query({ kind: "tool", id });
    assert.ok(vue, `⛔ « ${id} » doit RESTER dans la pile — c'est lui qui porte « ${nom} »`);
    assert.equal(vue.record.name, nom);
    assert.equal(vue.record.data.name, nom, "les DEUX noms du record, pas un seul");
    assert.equal(vue.record.slug, slug, "et son slug suit son nom, pas son id");
    assert.equal(vue.record.data.ability_key, ability);
    /* ⛔ `variants` EST PARTI. La prose du SRD y énumère les quatre jeux : sur
       un record nommé « Dice Set » elle affirmerait qu'un jeu de dés se décline
       en cartes. C'est du contenu devenu faux, pas une décoration. */
    assert.equal(vue.record.data.variants, undefined,
      `« ${nom} » ne peut plus porter la liste des variantes du générique`);
    /* ⭐ MAIS SON `utilize` RESTE — c'est la phrase du SRD, et l'héritier joue
       toujours au même jeu. C'est elle que les autres héritiers vont lire. */
    assert.ok(typeof vue.record.data.utilize === "string" && vue.record.data.utilize.length > 0);
  }

  /* ⛔ ET LES DEUX ANCIENS AJOUTS N'EXISTENT PLUS — le doublon, mesuré par son
     absence. Deux records du même nom auraient laissé le total à 36 en donnant
     au joueur deux fois les mêmes dés. */
  for (const mort of ["fh:tool:en:gaming-set-dice", "fh:tool:en:instrument-strings"]) {
    assert.equal(verbs.query({ kind: "tool", id: mort }), null,
      `⛔ « ${mort} » ne doit plus exister : son record est celui du SRD, réécrit`);
  }
  for (const nom of ["Dice Set", "Instrument (Strings)"]) {
    assert.equal(verbs.query({ kind: "tool" }).filter((v) => v.record.name === nom).length, 1,
      `un seul « ${nom} » dans toute la couche`);
  }
});

test("🔴 LOT 179 — la PILE RÉELLE porte toujours les 37, et le 37ᵉ vient de `fh-soulforging-en`", () => {
  /* ⭐ CE TEST EST LA MOITIÉ QUI MANQUERAIT. Sans lui, l'assertion du dessus
     passerait de 37 à 36 et personne ne saurait jamais si le Soulforging a
     déménagé ou s'il a été PERDU : un compte qui baisse ne dit pas lequel des
     deux. Il se lit dans l'autre sens que celui qui a fait entrer le
     Soulforging le 20/08 — et c'est ce croisement-là qui l'avait sorti.
     ⛔ Il monte la pile de la PAGE, pas une pile de test : la question posée
     est « le joueur voit-il encore son outil ? », et seule la vraie pile y
     répond. */
  const verbs = monter(PILE).query;
  const vues = verbs({ kind: "tool" });
  assert.deepEqual(nomsTriés(vues), [...LES_37_OUTILS].sort(),
    "les 37 outils du livre d'Eric, désormais répartis sur DEUX couches");

  const vue = verbs({ kind: "tool", id: "fh:tool:en:soulforging" });
  assert.ok(vue, "le Soulforging doit rester interrogeable — le déménagement n'est pas une suppression");
  assert.equal(vue.record.data.ability_key, "cha", "et il garde sa caractéristique, CHA");

  const couche = JSON.parse(readFileSync(join(ROOT, "layers", "fh-soulforging-en.layer.json"), "utf8"));
  assert.ok(couche.records.tool["fh:tool:en:soulforging"],
    "et c'est bien `fh-soulforging-en` qui le porte — pas une troisième couche apparue en route");
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

test("acceptation 1 — les cinq outils éclatés héritent l'usage de leur parent SRD, mot pour mot", () => {
  /* 🔴 CINQ DEPUIS LE LOT 185, ET LES DEUX MANQUANTS NE SONT PAS PERDUS : les
     dés et les cordes SONT leurs parents, réécrits. Ils n'ont pas à hériter
     d'un usage — ils le portent déjà, puisque c'est leur record.
     ⛔ Un compte qui baisse ne dit pas lequel des deux : c'est la seconde
     moitié de ce test qui le dit, en allant chercher les sept usages là où ils
     vivent désormais. */
  const verbs = pile();
  const srd = readSrdLayer(SRD_PATH);
  const hérités = TOOLS_ADDED.filter((e) => e.inherits);
  assert.equal(hérités.length, 5, "trois jeux et deux familles d'instruments");

  for (const entry of hérités) {
    const vue = verbs.query({ kind: "tool", id: `fh:tool:en:${entry.slug}` });
    assert.ok(vue, `« ${entry.name} » doit exister`);
    assert.equal(vue.record.data.utilize, srd.records.tool[entry.inherits].data.utilize,
      `« ${entry.name} » porte l'usage de son parent, LU dans le SRD et jamais recopié à la main`);
  }

  /* ⛔ ET LES SEPT PORTENT LE MÊME USAGE QUE LEUR SOUCHE — les cinq héritiers
     ET les deux réécrits. C'est la garantie de départ, entière : sortir deux
     outils de la liste des ajouts ne peut pas les sortir du contrôle. */
  const familles = [
    ["srd:tool:en:gaming-set", ["fh:tool:en:gaming-set-cards", "fh:tool:en:gaming-set-dragonchess",
      "fh:tool:en:gaming-set-three-dragon"]],
    ["srd:tool:en:musical-instrument", ["fh:tool:en:instrument-wind", "fh:tool:en:instrument-other"]]
  ];
  let comptés = 0;
  for (const [souche, freres] of familles) {
    const usage = srd.records.tool[souche].data.utilize;
    for (const id of [souche, ...freres]) {
      assert.equal(verbs.query({ kind: "tool", id }).record.data.utilize, usage,
        `« ${id} » porte l'usage de sa souche, y compris le record réécrit lui-même`);
      comptés += 1;
    }
  }
  assert.equal(comptés, 7, "quatre jeux et trois familles d'instruments, répartis sur deux gestes");
});

test("acceptation 1 — les six outils Fate's Hand purs n'inventent aucun usage", () => {
  const verbs = pile();
  const purs = TOOLS_ADDED.filter((e) => !e.inherits);
  /* 🔴 SIX depuis le lot 179 (2026-09-08) : `Soulforging` est parti dans
     `fh-soulforging-en`. Il était passé à SEPT le 2026-08-20 en ARRIVANT —
     il manquait à la couche depuis toujours alors que le livre d'Eric le
     porte, trouvé en lisant sa table publiée parce que le croisement
     n'allait que de la couche vers le livre.
     ⚠️ Six ici ne veut pas dire six dans le livre : la règle « un outil pur
     n'invente pas d'usage » vaut aussi pour le Soulforging, et c'est
     l'assertion en fin de test qui va la chercher dans son autre couche. */
  assert.equal(purs.length, 6, "trois véhicules et trois montures");

  for (const entry of purs) {
    const vue = verbs.query({ kind: "tool", id: `fh:tool:en:${entry.slug}` });
    assert.ok(vue, `« ${entry.name} » doit exister`);
    assert.equal(vue.record.data.utilize, undefined,
      `« ${entry.name} » : le canon ne donne pas d'usage, et ce lot n'en invente pas`);
  }

  /* ⛔ ET LE SEPTIÈME, DANS SON AUTRE COUCHE. La règle ne s'est pas arrêtée
     à la frontière de la couche en même temps que l'outil : sans cette
     ligne, `fh-soulforging-en` pourrait inventer un `utilize` que plus
     personne ne regarde — le déménagement aurait AFFAIBLI un garde. */
  const soulforging = monter(PILE).query({ kind: "tool", id: "fh:tool:en:soulforging" });
  assert.ok(soulforging, "« Soulforging » doit exister dans la pile réelle");
  assert.equal(soulforging.record.data.utilize, undefined,
    "« Soulforging » : le canon ne donne pas d'usage, et le déménagement n'en invente pas");
});

test("acceptation 1 — les trois `ref` que la couche des espèces a pris sont vivants", () => {
  /* `fh-species-en` a été écrite AVANT celle-ci et pointe vers trois de ses
     records. Un `ref` mort ne se verrait qu'à la dérivation, sur la fiche d'un
     joueur : on le vérifie ici.
     🔴 LOT 185 — VIGILANCE A CHANGÉ D'ID EN COURS DE ROUTE, et c'est le
     danger que ce lot devait mesurer : elle est passée de `fh:skill:en:vigilance`
     à `srd:skill:en:perception` réécrit. `KEEN_SENSES_SKILLS` l'a suivie, et le
     générateur LIT cette liste là où elle vit au lieu d'en garder une recopie —
     une recopie serait restée verte en désignant l'ancien id. */
  const verbs = pile();
  const elestu = JSON.parse(readFileSync(join(ROOT, "layers/fh-species-en.layer.json"), "utf8"))
    .records.species["fh:species:en:elestu"];
  /* LOT 34 — Keen Senses est un `granted_skill_budget` (budget captif de
     2 points), plus un `granted_skill_choice` compté. */
  const visés = elestu.data.granted_skill_budget.from;
  assert.deepEqual(visés, ["srd:skill:en:survival", "fh:skill:en:delve", "srd:skill:en:perception"],
    "le trio de Keen Senses, tel que la couche des espèces le déclare");

  const noms = [];
  for (const id of visés) {
    const vue = verbs.query({ kind: "skill", id });
    assert.ok(vue, `« ${id} » est désigné par l'Elestu et doit exister`);
    noms.push(vue.record.name);
  }
  /* ⛔ ET CE SONT BIEN LES TROIS QUE LE TEXTE PROMET AU JOUEUR. Un `ref` vivant
     qui pointerait vers la mauvaise compétence est une bijection fausse : elle
     est cohérente, et seule la seconde lecture — le NOM — l'attrape. */
  assert.deepEqual(noms, ["Survival", "Delve", "Vigilance"],
    "le texte de Keen Senses dit « Survival, Delve, or Vigilance » — les ids doivent rendre ces noms-là");
});

/* ══ TEST D'ACCEPTATION 4 — LE SRD PUR TRAVERSE ════════════════════════
   Le plus important des quatre. S'il ne passe pas, Fate's Hand a été tissé
   dans le chemin commun (loi §0.12). */

test("acceptation 4 — couche FH débrayée, la pile rend les 18 du SRD, Perception comprise", () => {
  const verbs = pile({ fh: false });
  assert.deepEqual(nomsTriés(verbs.query({ kind: "skill" })), [...LES_18_SRD].sort(),
    "les 18 compétences du SRD, sans rien de Fate's Hand");
  /* ⛔ ET « DE RETOUR » VEUT DIRE SOUS SON NOM, PAS SEULEMENT SOUS SON ID.
     🔴 LOT 185 — c'est LA moitié que la réécriture rendait nécessaire : depuis
     qu'elle patche le record au lieu de l'éteindre, un `query` non nul ne prouve
     plus rien du tout. Il faut lire le NOM et le SLUG pour savoir de quel côté
     de la couche on se trouve. Sans ça, une réécriture qui aurait fui dans le
     chemin commun (loi §0.12) passerait ce test au vert. */
  const perception = verbs.query({ kind: "skill", id: "srd:skill:en:perception" });
  assert.ok(perception, "Perception est de retour dès que la couche FH n'est plus montée");
  assert.equal(perception.record.name, "Perception", "⛔ sous SON nom, pas sous celui de Vigilance");
  assert.equal(perception.record.slug, "perception", "⛔ et sous son slug d'origine");

  assert.equal(verbs.query({ kind: "tool" }).length, EXPECTED.srdTools,
    "et les 25 outils du SRD, génériques compris");
  const jeux = verbs.query({ kind: "tool", id: "srd:tool:en:gaming-set" });
  assert.ok(jeux, "le Gaming Set générique aussi");
  assert.equal(jeux.record.name, "Gaming Set", "⛔ générique, pas « Dice Set »");
  assert.ok(typeof jeux.record.data.variants === "string" && jeux.record.data.variants.length > 0,
    "⛔ et il retrouve la liste de ses variantes, que la réécriture lui ôte");
  assert.equal(verbs.query({ kind: "tool", id: "srd:tool:en:musical-instrument" }).record.name,
    "Musical Instrument", "⛔ l'instrument générique aussi, pas « Instrument (Strings) »");
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

test("⭐ LES DEUX ÉCHELLES DU BARDE NE FUSIONNENT PLUS (canon §B.1septies)", () => {
  const verbs = pile();
  const barde = verbs.query({ kind: "class", id: "srd:class:en:bard" }).record.data.fh_skill_pool;

  /* 🔴 CE QUI ÉTAIT FAUX : la couche écrivait `bard: {"4": 3}` — silencieusement
     1 (barde) + 2 (tout le monde). Deux règles dans une case, comptées sur
     deux niveaux DIFFÉRENTS : un Barde 4 / Guerrier 4 lisait +11 au lieu de
     +7. Le pli ne dérivant qu'une classe, l'erreur était latente ; la séparer
     pendant qu'elle l'est encore ne coûte rien. */
  assert.deepEqual(barde.by_level, { 4: 2, 8: 2, 12: 2, 16: 2, 20: 2 },
    "l'échelle du PERSONNAGE : +2 aux cinq paliers, et rien d'autre");
  assert.equal(barde.by_level["2"], undefined, "le +1 du barde n'est PLUS dans l'échelle de personnage");
  assert.equal(barde.by_class_level["2"], 1, "il est dans l'échelle de CLASSE, seul");
  assert.equal(barde.by_class_level["4"], 1, "et au niveau 4 il vaut 1, pas 3 : le +2 vit dans l'autre table");

  /* LE CUMUL, et c'est la vérification qui attrape une cadence fausse là où
     les paliers isolés peuvent tous sembler bons. Il additionne LES DEUX
     tables — ce qu'un personnage mono-classe traverse. */
  let cumul = barde.free_point_pool;
  for (let n = 2; n <= 8; n += 1) {
    cumul += barde.by_level[String(n)] || 0;
    cumul += barde.by_class_level[String(n)] || 0;
  }
  assert.equal(cumul, 23, "12 + 7×(+1) + 2×(+2) = 23 free points au niveau 8");

  /* ⛔ ET LES ONZE AUTRES PORTENT UNE ÉCHELLE DE CLASSE VIDE — un fait, pas un
     trou : aucune autre classe ne gagne de points sur ses propres niveaux. */
  for (const [id] of LES_12_POOLS.filter(([id]) => id !== "srd:class:en:bard")) {
    assert.deepEqual(verbs.query({ kind: "class", id }).record.data.fh_skill_pool.by_class_level, {},
      `« ${id} » ne gagne rien sur ses niveaux de classe`);
  }
});

test("une classe sans le +1 du barde ne gagne qu'aux niveaux 4, 8, 12, 16 et 20", () => {
  const verbs = pile();
  const rogue = verbs.query({ kind: "class", id: "srd:class:en:rogue" }).record.data.fh_skill_pool;
  assert.deepEqual(Object.keys(rogue.by_level).map(Number).sort((a, b) => a - b), [4, 8, 12, 16, 20]);
  assert.ok(Object.values(rogue.by_level).every((v) => v === 2), "+2 à chaque palier");

  let cumul = rogue.free_point_pool;
  for (let n = 2; n <= 8; n += 1) cumul += rogue.by_level[String(n)] || 0;
  assert.equal(cumul, 18, "14 + 2 + 2 = 18 free points au niveau 8");

  /* ⛔ ET LES DOUZE PORTENT LA MÊME ÉCHELLE DE PERSONNAGE. C'est ce qui rend
     la séparation vérifiable : le +2 appartient au personnage, pas à sa
     classe — s'il variait d'une classe à l'autre, il ne serait pas universel. */
  for (const [id] of LES_12_POOLS) {
    assert.deepEqual(verbs.query({ kind: "class", id }).record.data.fh_skill_pool.by_level,
      { 4: 2, 8: 2, 12: 2, 16: 2, 20: 2 }, `« ${id} » porte l'échelle universelle, à l'identique`);
  }
});

test("les coûts des paliers voyagent avec le pool qu'ils dépensent", () => {
  const verbs = pile();
  const pool = verbs.query({ kind: "class", id: "srd:class:en:wizard" }).record.data.fh_skill_pool;
  /* ⛔ LOT 82 — `imposed` A DISPARU. Il chiffrait ce qu'un choix imposé
     DÉDUISAIT du pool ; le canon §B.0 supprime la déduction (les points bound
     sont publiés à part et n'ont jamais transité par le pool), donc le nombre
     n'a plus rien à chiffrer. Le laisser en ferait un fantôme relu un jour. */
  assert.deepEqual(pool.tier_costs, { novice: 1, adept: 2, expert: 4 },
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

test("le patch des pools reste ÉTROIT — et la seule chose qu'il touche EN PLUS est la liste, où le trio d'Eric rejoint Vigilance", () => {
  /* 🔴 CE GARDE A ÉTÉ RÉÉCRIT LE 2026-08-20, ET IL DIT PLUS QU'AVANT.
     Il exigeait que `skill_choice` reste INTACT — ce qui était juste tant que
     rien de la liste ne disparaissait. Or cette couche ÉTEINT Perception, et
     cinq listes de classe la nommaient encore : une liste qui désigne un record
     éteint ne provoque AUCUN refus, l'option disparaît simplement. Mesuré sur
     le Rogue : dix compétences déclarées, NEUF offertes, et rien nulle part ne
     disait laquelle manquait.
     ⭐ Eric a tranché le remplacement (*« Delve, Vigilance, Survival »*), et ce
     garde tient maintenant les deux moitiés : le `count` et le reste du record
     ne bougent pas, et AUCUNE liste ne nomme plus un record que la pile a
     éteint. La seconde moitié est la vraie garantie — c'est elle qui empêche le
     trou de revenir par une autre compétence. */
  const verbs = pile();
  const srd = readSrdLayer(SRD_PATH);
  for (const [id] of LES_12_POOLS) {
    const vue = verbs.query({ kind: "class", id });
    const srdChoice = srd.records.class[id].data.skill_choice;
    if (!srdChoice) continue;
    /* 🔴 LE COMPTE TOMBE À ZÉRO, ET C'EST LA MOITIÉ QUI ÉTEINT L'ANCIEN SYSTÈME.
       La classe ne fait plus cocher N maîtrises : elle fait dépenser ses points
       liés (bourse captive). Laisser le compte du SRD aurait gardé DEUX systèmes
       côte à côte — et `validate` refusait par `skill-grant.count-mismatch`, un
       personnage complet restant éternellement en faute.
       ⛔ Mais `skill_choice` NE DISPARAÎT PAS : sa liste `from` est la liste de
       la classe, celle dont la bourse est captive. C'est le COMPTE qui n'a plus
       d'objet, pas la liste. */
    assert.equal(vue.record.data.skill_choice.count, 0,
      `${id} : la classe n'impose plus de maîtrises — elle donne des points liés à placer`);
    assert.ok(Array.isArray(vue.record.data.skill_choice.from) || vue.record.data.skill_choice.from === "any",
      `${id} : sa LISTE survit — c'est elle dont la bourse est captive`);
    assert.equal(vue.record.data.hit_die, srd.records.class[id].data.hit_die);

    /* ⛔ AUCUNE OPTION MORTE. La garantie qui compte, et elle vaut pour toutes
       les compétences éteintes, pas seulement Perception.
       ⚠️ `from` N'EST PAS TOUJOURS UNE LISTE : le Barde déclare le littéral
       « any » — toute compétence. Le parcourir caractère par caractère
       cherchait une compétence nommée « a ». Une garantie qui ne distingue pas
       une liste d'un littéral se trompe de sujet. */
    if (!Array.isArray(vue.record.data.skill_choice.from)) continue;
    for (const skillId of vue.record.data.skill_choice.from) {
      const skill = verbs.query({ kind: "skill", id: skillId });
      assert.ok(skill, `${id} : sa liste offre « ${skillId} », que la pile ne porte pas — l'option se perdrait en silence`);
    }
    /* ⭐ ET LÀ OÙ PERCEPTION ÉTAIT, LE TRIO D'ERIC EST.
       🔴 LOT 185 — L'ID DE PERCEPTION RESTE DANS LA LISTE, et c'est le contraire
       de ce que ce garde exigeait hier. Il exigeait qu'il en SORTE, parce que la
       couche l'éteignait ; il exige maintenant qu'il y RESTE, parce que la couche
       le réécrit en Vigilance. Le sujet n'a pas changé d'un pouce : aucune liste
       de classe ne doit offrir une option morte. */
    if (Array.isArray(srdChoice.from) && srdChoice.from.includes("srd:skill:en:perception")) {
      for (const attendu of ["fh:skill:en:delve", "srd:skill:en:perception", "srd:skill:en:survival"]) {
        assert.ok(vue.record.data.skill_choice.from.includes(attendu),
          `${id} : sa liste nommait Perception, elle doit offrir « ${attendu} »`);
      }
      /* ⛔ ET C'EST LE NOM QU'ON LIT, PAS L'ID. Un id vivant qui rendrait
         « Perception » voudrait dire que la réécriture n'a pas eu lieu et que
         ce garde s'est laissé rassurer par la FORME de la liste. */
      const noms = vue.record.data.skill_choice.from
        .map((skillId) => verbs.query({ kind: "skill", id: skillId }).record.name);
      assert.equal(noms.includes("Perception"), false,
        `${id} : Perception n'existe plus sous ce nom — sa place est tenue par Vigilance`);
      for (const attendu of ["Vigilance", "Delve", "Survival"]) {
        assert.ok(noms.includes(attendu), `${id} : le trio d'Eric, lu par les NOMS — « ${attendu} » manque`);
      }
    }
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

test("le générateur rend bien 18 + 8 et 25 + 11 — l'arithmétique du chapitre", () => {
  /* 🔴 13 NEUFS, PAS 14, DEPUIS LE LOT 179 : le Soulforging est le
     quatorzième et il est parti dans `fh-soulforging-en`. L'arithmétique du
     LIVRE n'a pas bougé (23 + 14 = 37) — c'est celle de CETTE COUCHE qui est
     mesurée ici, et les deux ne se confondent plus depuis que le chapitre
     `Soulforge Crafting` a la sienne. */
  /* 🔴 ET LE PARTAGE A BOUGÉ LE 2026-09-09 SANS QUE LE TOTAL BOUGE — c'est
     exactement le cas où un total juste cache un contenu changé. La couche
     n'ÉTEINT plus rien : les 18 compétences et les 25 outils du SRD sont tous
     conservés, trois d'entre eux réécrits en leur héritier, et les trois
     héritiers ont donc quitté les listes d'ajout (9 → 8, 13 → 11).
     ⛔ Les deux comptes sont vérifiés SÉPARÉMENT du total : c'est le seul
     montage où 26 = 18 + 8 ne peut pas être confondu avec 26 = 17 + 9. */
  const { skills, tools } = buildLayer({ srd: readSrdLayer(SRD_PATH) });
  assert.deepEqual(
    { conservées: skills.kept, réécrites: skills.rewritten, neuves: skills.added, total: skills.total },
    { conservées: 18, réécrites: 1, neuves: 8, total: 26 });
  assert.deepEqual(
    { conservés: tools.kept, réécrits: tools.rewritten, neufs: tools.added, total: tools.total },
    { conservés: 25, réécrits: 2, neufs: 11, total: 36 });
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

/* ══ LES REFUS DE LA RÉÉCRITURE — LOT 185 ══════════════════════════════
   ⚠️ CHAQUE GARDE ÉCRIT CE JOUR-LÀ EST ICI VU ROUGE. Un garde qu'on n'a pas
   vu accuser est une intention, pas une garantie. */

test("⚔️ REFUS — le DOUBLON : redéclarer Vigilance en AJOUT alors qu'elle est réécrite fait jeter", () => {
  /* ⛔ LE PIÈGE CENTRAL DU LOT, JOUÉ POUR DE VRAI. C'est l'état exact du dépôt
     la veille : `fh:skill:en:vigilance` en ajout ET le record SRD réécrit en
     Vigilance. Deux records pour la même compétence, et AUCUN total ne le dit —
     18 + 9 = 27 est une arithmétique aussi juste que 18 + 8 = 26. */
  const srd = readSrdLayer(SRD_PATH);
  SKILLS_ADDED.push({
    slug: "vigilance", name: "Vigilance", ability: "wis", category: "exploration",
    exampleUses: "Immediate threat detection: spotting ambushes or fleeting danger."
  });
  try {
    assert.throws(() => buildLayer({ srd }), (err) => {
      assert.ok(err instanceof GenError);
      assert.match(err.message, /vigilance|Vigilance/, "le refus doit NOMMER l'héritier dupliqué");
      assert.match(err.message, /réécri/i, "…et dire que c'est une réécriture qui le porte déjà");
      return true;
    });
  } finally {
    SKILLS_ADDED.pop();
  }
});

test("⚔️ REFUS — le DOUBLON mord aussi sur les outils, et par le NOM autant que par le slug", () => {
  /* ⚠️ DEUX MOITIÉS, PARCE QU'UN SLUG DIFFÉRENT NE SUFFIT PAS À DÉDOUBLONNER.
     Un « Dice Set » ajouté sous le slug `dice-set` échapperait à un garde qui ne
     regarderait que les slugs, et le joueur verrait deux fois le même outil. */
  const srd = readSrdLayer(SRD_PATH);
  for (const doublon of [
    { slug: "gaming-set-dice", name: "Autre chose", ability: "wis", inherits: "srd:tool:en:gaming-set" },
    { slug: "un-autre-slug", name: "Dice Set", ability: "wis", inherits: "srd:tool:en:gaming-set" }
  ]) {
    TOOLS_ADDED.push(doublon);
    try {
      assert.throws(() => buildLayer({ srd }), (err) => {
        assert.ok(err instanceof GenError);
        assert.match(err.message, /réécri/i);
        return true;
      }, `« ${doublon.name} » / « ${doublon.slug} » aurait dû être refusé`);
    } finally {
      TOOLS_ADDED.pop();
    }
  }
});

test("⚔️ REFUS — un héritier d'une AUTRE caractéristique que le record réécrit fait jeter", () => {
  /* ⛔ Une réécriture n'est pas le lieu pour changer une caractéristique en
     silence. Si les dés devaient être INT plutôt que WIS, c'est une décision
     d'Eric — elle doit être dite, pas glissée dans un patch de nom. */
  const srd = readSrdLayer(SRD_PATH);
  const entry = TOOLS_REWRITTEN.find((e) => e.slug === "gaming-set-dice");
  const sauvegarde = entry.ability;
  entry.ability = "int";
  try {
    assert.throws(() => buildLayer({ srd }), (err) => {
      assert.match(err.message, /gaming-set/, "le refus doit nommer le record");
      assert.match(err.message, /wis/, "…et la caractéristique que le SRD porte VRAIMENT");
      return true;
    });
  } finally {
    entry.ability = sauvegarde;
  }
});

test("⚔️ REFUS — une réécriture qui REPOSE le nom du SRD est un patch sans objet, et fait jeter", () => {
  /* Même doctrine que `was` sur les trois re-caractérisations : un patch qui
     n'a plus d'objet FIGE la valeur contre sa source. */
  const srd = readSrdLayer(SRD_PATH);
  const entry = SKILLS_REWRITTEN[0];
  const sauvegarde = entry.name;
  entry.name = "Perception";
  try {
    assert.throws(() => buildLayer({ srd }), /DÉJÀ|déjà/);
  } finally {
    entry.name = sauvegarde;
  }
});

test("⚔️ REFUS — un id de Keen Senses que cette couche ne produit pas fait jeter, en le nommant", () => {
  /* ⛔ LE POINT LE PLUS DANGEREUX DU LOT 185, GARDÉ. `fh-species-en` désigne le
     trio de Keen Senses ; le jour où l'un des trois change d'id d'un côté
     seulement, le `ref` meurt — et il ne se verrait qu'à la dérivation, sur la
     fiche d'un joueur. C'est l'ancien id de Vigilance qu'on remet ici : celui
     qui aurait survécu dans une recopie. */
  const srd = readSrdLayer(SRD_PATH);
  const index = KEEN_SENSES_SKILLS.indexOf("srd:skill:en:perception");
  assert.ok(index >= 0, "Keen Senses doit désigner le record réécrit — sinon ce test ne prouve rien");
  KEEN_SENSES_SKILLS[index] = "fh:skill:en:vigilance";
  try {
    assert.throws(() => buildLayer({ srd }), (err) => {
      assert.match(err.message, /fh:skill:en:vigilance/, "le refus doit NOMMER le `ref` qui serait mort");
      assert.match(err.message, /Keen Senses/);
      return true;
    });
  } finally {
    KEEN_SENSES_SKILLS[index] = "srd:skill:en:perception";
  }
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

test("⛔ DEUX COUCHES, UN SEUL NOMBRE — et depuis le 20/08 la fiche n'en porte AUCUN", () => {
  /* 🔴 CE GARDE A CHANGÉ DE MÉTIER LE 2026-08-20, ET C'EST UN PROGRÈS.
     Il vérifiait que les DEUX exemplaires du nombre concordaient — la ligne
     « Free points » recopiée à la main dans `fh-fiche-en`, et la vérité de
     `fh-skills-en`. Il faisait bien son travail : douze valeurs, douze
     accords. Mais **garder deux copies d'accord n'est pas la même chose que
     n'en avoir qu'une**, et c'est la seconde qu'on veut.

     ⭐ Eric, 2026-08-20 : *« mets à jour les points de skills dans les
     classes »*. Ce qu'il y avait à mettre à jour n'était aucun nombre — ils
     étaient tous justes — mais leur NOMBRE D'EXEMPLAIRES. L'écran dérive
     désormais les trois totaux du canon §B.1 depuis le pool, une seule source,
     et la couche fiche n'en porte plus aucun.
     ⚠️ Le garde ne se désarme donc pas : il exige l'INVERSE de ce qu'il
     exigeait, et il mord sur ce qui compte vraiment — le retour d'une copie. */
  const fiche = JSON.parse(readFileSync(join(ROOT, "layers/fh-fiche-en.layer.json"), "utf8"));

  const copies = [];
  for (const [id, rec] of Object.entries(fiche.records.class)) {
    for (const valeur of Object.values(rec.changes || {})) {
      if (!Array.isArray(valeur)) continue;
      for (const ligne of valeur) {
        if (ligne && /point|pool/i.test(String(ligne.label))) copies.push(`${id} → « ${ligne.label} »`);
      }
    }
  }
  assert.deepEqual(copies, [],
    "⛔ aucune ligne de POINTS dans la couche fiche : le nombre vit dans `fh-skills-en` et l'écran le DÉRIVE.\n" +
    "Une copie qui revient est une copie qui divergera — c'est exactement ce que la version précédente de ce " +
    "garde surveillait, et qu'on n'a plus à surveiller.");

  /* ⚔️ ET LE TÉMOIN : la vérité, elle, est bien là et complète. Un garde qui
     interdit une copie doit prouver que l'original existe, sinon il serait vert
     sur un builder qui n'affiche plus aucun point. */
  const points = JSON.parse(readFileSync(join(ROOT, FH_SKILLS_EN), "utf8"));
  const pools = Object.entries(points.records.class)
    .map(([id, rec]) => [id, rec.changes["data[fh_skill_pool]"]]);
  assert.equal(pools.length, EXPECTED.classes, "les douze classes portent leur pool");
  for (const [id, pool] of pools) {
    for (const champ of ["bound_skill_points", "bound_tool_points", "free_point_pool"]) {
      assert.equal(Number.isInteger(pool[champ]), true,
        `« ${id} » doit porter les TROIS totaux du canon §B.1 — il manque \`${champ}\``);
    }
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
    { level: 1, feature: "Expertise", points: 0, boundSkill: 0, boundSkillFrom: [], unlocksExpertise: true }
  ], "le rogue reçoit la PERMISSION sans un point : ses deux expertises sont déjà dans son kit (canon §A.5)");

  assert.deepEqual(grantsDe("bard"), [
    { level: 2, feature: "Expertise", points: 4, boundSkill: 0, boundSkillFrom: [], unlocksExpertise: true }
  ], "2 expertises = 4 free points");

  assert.deepEqual(grantsDe("ranger"), [
    { level: 2, feature: "Deft Explorer", points: 2, boundSkill: 0, boundSkillFrom: [], unlocksExpertise: true },
    { level: 9, feature: "Expertise", points: 4, boundSkill: 0, boundSkillFrom: [], unlocksExpertise: true }
  ], "une expertise au 2, deux au 9 — et le rôdeur de niveau 5 n'a que la première");

  /* 🔴 RÈGLE RÉVISÉE PAR ERIC LE 2026-08-20 : *« primal knowledge […] c'est
     plutôt idem Keen Senses : répartition de 2 bound points dans Survival,
     Hunting, Vigilance (j'enlève la composante urbaine de Delve) »*. Le trait
     passe de 1 point « dans la liste de la classe » à 2 points captifs d'une
     liste de TROIS, nommée.
     ⭐ ET LA LISTE EST UNE DONNÉE, PLUS UNE AFFIRMATION. Le message qui publiait
     ce grant disait « l'aptitude NOMME une liste » sans jamais la porter : juste,
     invérifiable, et que rien n'obligeait à rester vraie.
     ⚠️ Elle n'est PAS celle de Keen Senses : l'Elfe a Delve, le Barbare a
     Hunting — Eric écarte Delve pour sa composante urbaine. Deux bourses de même
     forme, de listes différentes. */
  assert.deepEqual(grantsDe("barbarian"), [
    { level: 3, feature: "Primal Knowledge", points: 0, boundSkill: 2,
      boundSkillFrom: ["hunting", "survival", "vigilance"], unlocksExpertise: false }
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


/* ══ LOT 184 — LA COUCHE NE PORTE PLUS QUE CE QUE SON NOM DIT ═════════════
   🔴 CE QU'ERIC A VU LE 08/09, EN UNE PHRASE : *« FH skills contient des feats,
   LOL »*. Cette couche portait TROIS interrupteurs de l'écran `Rules` —
   `Skills & tools`, `Trainings`, `Inheritance` — et on ne pouvait éteindre
   aucun des trois sans les deux autres.

   ⛔ ET LES DEUX GARDES VONT PAR PAIRE. Celui du dessus dit ce que la couche
   ne porte PLUS ; à lui seul, il resterait vert si les records avaient été
   PERDUS au lieu d'être déménagés. Celui du dessous lit la pile RÉELLE, dans
   l'autre sens, et nomme la couche qui les porte maintenant. C'est la leçon
   du lot 179, appliquée à un déménagement deux fois plus gros. */

test("🔴 LOT 184 — `fh-skills-en` ne porte plus QUE `skill`, `tool` et `class`", () => {
  const couche = JSON.parse(readFileSync(join(ROOT, FH_SKILLS_EN), "utf8"));
  /* ⛔ LES GENRES SE LISENT, ILS NE SE CHERCHENT PAS UN PAR UN : une clef
     `feat` ou `spell` apparue demain serait vue par cette égalité, alors
     qu'une liste de deux `assert.equal(records.training, undefined)` ne
     verrait que ce qu'elle nomme. */
  assert.deepEqual(Object.keys(couche.records).sort(), ["class", "skill", "tool"],
    "un genre de plus ici, et la couche recommence à porter plus d'un interrupteur");
  assert.deepEqual(couche.flags, ["fh.skills"],
    "un seul drapeau : les deux autres sont levés par les deux couches sorties");
});

test("🔴 LOT 184 — la PILE RÉELLE porte toujours les 13 trainings et les 5 arrière-plans", () => {
  /* ⭐ CE TEST EST LA MOITIÉ QUI MANQUERAIT. Sans lui, le garde du dessus
     passerait au vert le jour où les records auraient été SUPPRIMÉS plutôt que
     déplacés : « la couche ne les porte plus » est vrai dans les deux cas.
     ⛔ Il monte la pile de la PAGE, pas une pile de test : la question posée
     est « le joueur voit-il encore ses langues et son origine ? ». */
  const verbs = monter(PILE).query;

  const trainings = verbs({ kind: "training" });
  assert.equal(trainings.length, 13, "les treize trainings sont toujours là, dans l'autre couche");
  const backgrounds = verbs({ kind: "background" });
  assert.equal(backgrounds.length, 1,
    "l'Inheritance est toujours le seul arrière-plan : les quatre extinctions ont suivi avec elle");
  assert.equal(backgrounds[0].id, "fh:background:en:inheritance");

  /* ⛔ ET C'EST BIEN LA BONNE COUCHE QUI LES PORTE — pas une troisième apparue
     en route, pas `fh-skills-en` qui les aurait discrètement gardés. */
  const trainingsEn = JSON.parse(readFileSync(join(ROOT, "layers", "fh-trainings-en.layer.json"), "utf8"));
  const inheritanceEn = JSON.parse(readFileSync(join(ROOT, "layers", "fh-inheritance-en.layer.json"), "utf8"));
  assert.equal(Object.keys(trainingsEn.records.training).length, 13);
  assert.equal(Object.keys(inheritanceEn.records.background).length, 5,
    "quatre extinctions du SRD + l'Inheritance");
});
