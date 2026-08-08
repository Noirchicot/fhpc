/* ══ LA PREMIÈRE COUCHE FATE'S HAND — LES DOUZE ESPÈCES ════════════════
   Lot 15-couche-fh-especes.

   LE TEST D'ACCEPTATION, mot pour mot : les deux couches montées ensemble —
   SRD anglais dessous, FH par-dessus — et `query("species", …)` rend les douze
   espèces d'Eric, chacune avec sa Base de Destinée, ses traits nommés, et les
   trois pouvoirs de Destinée aux bons endroits.

   ⚠️ ON NOMME LES VALEURS, ON NE COMPTE PAS. Un garde qui asserte « douze
   espèces » reste vert quand la pile en rend douze fausses — et ce dépôt a
   déjà payé cette leçon deux fois (TRAPS.md : « un garde qui compte reste vert
   quand on le pointe ailleurs »). Les douze noms sont donc épinglés, et
   l'assertion elle-même est ATTAQUÉE plus bas sur une liste truquée.

   ⚠️ LES REFUS SE PROUVENT SUR UNE PRIVATION DÉLIBÉRÉE. Une couche SRD amputée
   d'un trait, une couche FH montée seule : jamais sur une pénurie de
   circonstance, qui cesserait de prouver le jour où la source s'enrichit — en
   restant verte (TRAPS.md, lots 8→13).

   ⚠️ CETTE SUITE N'ÉCRIT QUE DANS UN RÉPERTOIRE TEMPORAIRE. `layers/` est un
   artefact commité, et `tests/tree-immuable.test.mjs` rejoue toute la suite
   entre deux relevés de l'arbre. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

import { ROOT, SRD_EN, fileBytes, bytes, aLayer, makeBlock } from "./layers-harness.mjs";
import {
  buildLayer, generate, serialize, readSrdLayer, liftTrait, srdSpecies,
  assertSrdLayer, wholesaleRecopies, assertNoWholesale, WHOLESALE_PATHS, OUT_NAME, SRD_PATH
} from "../src/tools/gen-fh-species-layer.mjs";
import { TWELVE_NAMES, KEEN_SENSES_SKILLS, DESTINY_BASE } from "../src/tools/fh-species-source.mjs";

const FH_LAYER_PATH = join(ROOT, "layers", OUT_NAME);
const FH_LAYER_REL = `layers/${OUT_NAME}`;

const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateLayer = ajv.compile(JSON.parse(readFileSync(join(ROOT, "schemas/fh-layer.schema.json"), "utf8")));

const srdDoc = () => readSrdLayer(SRD_PATH);
const fhLayer = () => JSON.parse(readFileSync(FH_LAYER_PATH, "utf8"));

/** La pile réelle du lot : SRD EN dessous, FH par-dessus, dans cet ordre.
 *  ⚠️ Le bloc est construit SANS `ruleValueKeys` — donc une couche portant la
 *  moindre valeur de règle y serait refusée. C'est voulu : c'est la preuve
 *  vivante que la Base de Destinée ne voyage pas par `ruleValues`. */
function pileFH() {
  const block = makeBlock();
  block.verbs.register({ bytes: fileBytes(SRD_EN), origin: SRD_EN });
  block.verbs.register({ bytes: fileBytes(FH_LAYER_REL), origin: FH_LAYER_REL });
  return block;
}

const speciesById = (verbs) => {
  const map = new Map();
  for (const view of verbs.query({ kind: "species" })) map.set(view.id, view);
  return map;
};

const dataOf = (verbs, id) => {
  const view = verbs.query({ kind: "species", id });
  assert.ok(view, `l'espèce « ${id} » devrait être dans la pile`);
  return view.record.data;
};

const traitNames = (data) =>
  [...(data.traits || []), ...(data.fh_traits || [])].map((trait) => trait.name);

/* ══ 1. LA COUCHE TIENT DEBOUT ═════════════════════════════════════════ */

test("la couche fh-species valide contre fh-layer/1", () => {
  const layer = fhLayer();
  assert.equal(validateLayer(layer), true, ajv.errorsText(validateLayer.errors));
  assert.equal(layer.schema, "fh-layer/1");
  assert.equal(layer.id, "fh-species-en");
  assert.equal(layer.lang, "en", "la table joue en anglais — le français viendra après coup");
});

test("les drapeaux levés sont exactement ceux qu'un contenu de CETTE couche appelle", () => {
  /* `fh.destiny` : les douze portent une Base. `fh.chaos` : « Outlasting »
     donne l'avantage aux jets de Chaos. Les trois autres drapeaux FH ne sont
     pas levés — aucun contenu d'ici ne les appelle. */
  assert.deepEqual(fhLayer().flags, ["fh.chaos", "fh.destiny"]);

  const { verbs } = pileFH();
  assert.deepEqual(verbs.flags(), ["fh.chaos", "fh.destiny"],
    "la pile ne lève que les drapeaux de la couche FH — le SRD n'en lève aucun");
});

test("la couche ne porte AUCUNE valeur de règle, et c'est ce qui lui permet de se monter", () => {
  const layer = fhLayer();
  assert.equal(Object.hasOwn(layer, "ruleValues"), false,
    "la Base de Destinée est une donnée PAR ESPÈCE, pas un réglage global du moteur");

  /* Et la preuve par la privation : la même couche, avec une seule valeur de
     règle ajoutée, est REFUSÉE par le même bloc — parce que le moteur n'a
     déclaré aucune clef. Sans cette attaque, l'absence de `ruleValues`
     passerait pour une commodité au lieu d'une contrainte mesurée. */
  const dopee = Object.assign({}, layer, { ruleValues: { "fh.destiny": 2 } });
  const { verbs } = makeBlock();
  verbs.register({ bytes: fileBytes(SRD_EN), origin: SRD_EN });
  assert.throws(() => verbs.register({ bytes: bytes(dopee), origin: "couche dopée" }),
    /fh\.destiny/, "le refus doit NOMMER la clef de règle inconnue du moteur");
});

/* ══ 2. LE TEST D'ACCEPTATION ══════════════════════════════════════════ */

/** Les douze noms attendus, épinglés ici EN TOUTES LETTRES. La fonction est
 *  extraite pour pouvoir être attaquée : voir l'attaque juste après. */
export function assertLesDouze(noms) {
  const attendus = [
    "Araag", "Dragonborn", "Dwarf", "Elestu", "Elf", "Goliath",
    "Halfling", "Hoddon", "Human", "Loroka", "Orc", "Tiefling"
  ];
  assert.deepEqual([...noms].sort(), attendus,
    "la pile doit rendre LES DOUZE ESPÈCES D'ERIC, nommées — pas douze records quelconques");
}

test("ACCEPTATION — les deux couches montées ensemble rendent les DOUZE espèces d'Eric, nommées", () => {
  const { verbs } = pileFH();
  const vues = verbs.query({ kind: "species" });
  assertLesDouze(vues.map((vue) => vue.record.name));

  /* Et la liste déclarée dans la source dit la même chose : deux copies d'une
     vérité qui divergeraient sans quelque chose pour les comparer. */
  assertLesDouze(TWELVE_NAMES);
});

test("ATTAQUE — le garde des douze noms rougit dès qu'UN nom est faux (il ne compte pas)", () => {
  const douzeMauvaises = [
    "Araag", "Dragonborn", "Dwarf", "Elestu", "Elf", "Goliath",
    "Halfling", "Gnome", "Human", "Loroka", "Orc", "Tiefling"
  ];
  assert.equal(douzeMauvaises.length, 12, "elles sont bien DOUZE — c'est tout le propos");
  assert.throws(() => assertLesDouze(douzeMauvaises), /Gnome|Hoddon/,
    "douze mauvaises espèces doivent faire rougir le garde ; un compte, lui, resterait vert");
});

test("ACCEPTATION — Base de Destinée 2 pour les douze, nommément", () => {
  const { verbs } = pileFH();
  for (const vue of verbs.query({ kind: "species" })) {
    assert.equal(vue.record.data.destiny.base, DESTINY_BASE,
      `${vue.record.name} : Base de Destinée attendue à ${DESTINY_BASE}`);
  }
  assert.equal(DESTINY_BASE, 2);
});

test("ACCEPTATION — les TROIS pouvoirs de Destinée, à leurs trois places et nulle part ailleurs", () => {
  const { verbs } = pileFH();

  const elfe = dataOf(verbs, "srd:species:en:elf");
  assert.ok(traitNames(elfe).includes("Splinter of Anon"), "l'Elfe porte Splinter of Anon");
  assert.equal(elfe.destiny.base_bonus, 2);
  assert.equal(elfe.destiny.base_bonus_trait, "splinter-of-anon");
  assert.equal(elfe.destiny.base + elfe.destiny.base_bonus, 4,
    "+2 à la Base → 4 à la création");

  const humain = dataOf(verbs, "srd:species:en:human");
  assert.ok(traitNames(humain).includes("Twice-Born"), "l'Humain porte Twice-Born");

  const halfelin = dataOf(verbs, "srd:species:en:halfling");
  assert.ok(traitNames(halfelin).includes("Outlasting"), "le Halfelin porte Outlasting");
  assert.ok(traitNames(halfelin).includes("Luck"),
    "…et il garde son trait SRD « Luck » : c'est pour ça que « Patient Luck » a été écarté");

  /* AUCUNE AUTRE espèce n'a de pouvoir de Destinée : le bonus de Base est le
     seul chiffre, et il est chez l'Elfe seul. */
  const porteurs = [];
  for (const vue of verbs.query({ kind: "species" })) {
    const noms = traitNames(vue.record.data);
    for (const pouvoir of ["Splinter of Anon", "Twice-Born", "Outlasting"]) {
      if (noms.includes(pouvoir)) porteurs.push(`${vue.record.name}/${pouvoir}`);
    }
    if (vue.record.name !== "Elf") {
      assert.equal(vue.record.data.destiny.base_bonus, undefined,
        `${vue.record.name} ne doit porter aucun bonus de Base — l'Elfe est le seul`);
    }
  }
  assert.deepEqual(porteurs.sort(),
    ["Elf/Splinter of Anon", "Halfling/Outlasting", "Human/Twice-Born"]);
});

test("ACCEPTATION — les points de compétence : Educated à l'Humain, Fast Learner à l'Araag et l'Elestu, zéro ailleurs", () => {
  const { verbs } = pileFH();

  const humain = dataOf(verbs, "srd:species:en:human");
  assert.ok(traitNames(humain).includes("Educated"));
  assert.deepEqual(humain.skill_points, { trait: "educated", by_level: { 1: 2 } },
    "Educated : +2 à la création, ET C'EST TOUT (les chapitres 2 et 4 se contredisaient)");

  const fastLearner = { trait: "fast-learner", by_level: { 1: 2, 3: 2, 6: 2 } };
  for (const id of ["fh:species:en:araag", "fh:species:en:elestu"]) {
    const data = dataOf(verbs, id);
    assert.ok(traitNames(data).includes("Fast Learner"), `${data.name} porte Fast Learner`);
    assert.deepEqual(data.skill_points, fastLearner,
      `${data.name} : +2 aux niveaux 1, 3 ET 6 — le chapitre 2 oubliait le niveau 1`);
  }

  const avec = verbs.query({ kind: "species" })
    .filter((vue) => vue.record.data.skill_points !== undefined)
    .map((vue) => vue.record.name)
    .sort();
  assert.deepEqual(avec, ["Araag", "Elestu", "Human"],
    "toutes les autres espèces sont à zéro point de compétence d'espèce");
});

test("ACCEPTATION — le Hoddon s'appelle Hoddon, et plus Gnome, jusque dans ses traits", () => {
  const { verbs } = pileFH();
  const vue = verbs.query({ kind: "species", id: "srd:species:en:gnome" });

  assert.equal(vue.record.name, "Hoddon");
  assert.equal(vue.record.slug, "hoddon");
  assert.equal(vue.record.data.name, "Hoddon");
  assert.ok(traitNames(vue.record.data).includes("Hoddon Cunning"));
  assert.ok(traitNames(vue.record.data).includes("Hoddon Lineage"));

  const noms = verbs.query({ kind: "species" }).map((v) => v.record.name);
  assert.equal(noms.includes("Gnome"), false, "aucune espèce de la pile ne s'appelle plus Gnome");

  /* Les IDS de traits, eux, ne bougent pas : le moteur produit des
     identifiants, l'interface produit des mots (loi §0.13). */
  const ids = vue.record.data.traits.map((t) => t.id);
  assert.deepEqual(ids.sort(), ["darkvision", "gnomish-cunning", "gnomish-lineage"]);

  /* Un record patché PERD son contentHash : le certificat ne décrit plus son
     contenu (contrat `layers`, invariant 9). */
  assert.equal(Object.hasOwn(vue.record, "contentHash"), false);
});

test("ACCEPTATION — Perception n'existe pas en FH : Keen Senses pointe vers Vigilance, Delve et Survival", () => {
  const { verbs } = pileFH();
  const forme = "You have proficiency in the Survival, Delve, or Vigilance skill.";

  for (const id of ["srd:species:en:elf", "fh:species:en:elestu"]) {
    const data = dataOf(verbs, id);
    const keen = [...(data.traits || []), ...(data.fh_traits || [])].find((t) => t.id === "keen-senses");
    assert.ok(keen, `${data.name} devrait porter Keen Senses`);
    assert.equal(keen.text, forme, "et cette forme vaut pour TOUTES les espèces FH qui le portent");
    assert.deepEqual(data.granted_skill_choice.from, KEEN_SENSES_SKILLS);
  }

  assert.deepEqual(perceptionReferences(verbs.query({ kind: "species" })), [],
    "aucune espèce ne doit plus offrir la compétence Perception");
});

/** Les espèces qui offrent encore la compétence Perception, NOMMÉES. Extraite
 *  pour être attaquée : un garde qu'on n'a pas vu rougir est une intention. */
export function perceptionReferences(vues) {
  const hits = [];
  for (const vue of vues) {
    const choix = vue.record.data.granted_skill_choice;
    const from = choix && choix.from;
    if (Array.isArray(from) && from.some((id) => id.endsWith(":perception"))) {
      hits.push(vue.record.name);
    }
  }
  return hits.sort();
}

test("ATTAQUE — le garde « plus de Perception » rougit sur une espèce qui l'offre encore", () => {
  const vues = [
    { record: { name: "Elf", data: { granted_skill_choice: { count: 1, from: ["srd:skill:en:perception"] } } } },
    { record: { name: "Human", data: { granted_skill_choice: { count: 1, from: "any" } } } },
    { record: { name: "Orc", data: {} } }
  ];
  assert.deepEqual(perceptionReferences(vues), ["Elf"],
    "le garde doit NOMMER l'espèce fautive, pas rendre un booléen");
});

test("ACCEPTATION — les trois espèces neuves sont des records de plein droit, les neuf autres restent SRD", () => {
  const { verbs } = pileFH();
  const parId = speciesById(verbs);

  const neuves = [...parId.values()].filter((v) => v.provenance.from === "fh-species-en");
  assert.deepEqual(neuves.map((v) => v.record.name).sort(), ["Araag", "Elestu", "Loroka"],
    "D2 : Araag, Loroka et Elestu sont des espèces à part entière, pas des « construit sur X »");
  assert.deepEqual(neuves.map((v) => v.id).sort(),
    ["fh:species:en:araag", "fh:species:en:elestu", "fh:species:en:loroka"]);

  const patchees = [...parId.values()].filter((v) => v.provenance.from === "srd-5.2.1-en");
  assert.equal(patchees.length, 9);
  for (const vue of patchees) {
    assert.deepEqual(vue.provenance.patchedBy.map((p) => p.by), ["fh-species-en"],
      `${vue.record.name} : le SRD pose, FH modifie — et la provenance le dit`);
  }

  /* Et rien n'a été RECOUVERT : la couche FH ne remplace aucun record SRD par
     un `add` du même id (l'événement `layers-changed` le dirait). */
  const { events } = pileFH();
  assert.deepEqual(events[events.length - 1].shadowed, []);
});

test("ACCEPTATION — les traits SRD que FH ne touche pas sont intacts, mot pour mot", () => {
  const { verbs } = pileFH();
  const srd = srdDoc();

  /* Sept des neuf espèces SRD ne reçoivent QUE leur Base : leurs traits
     doivent être ceux du SRD, à l'octet près. C'est la décision D1 rendue
     vérifiable — « la couche ne porte QUE la différence ». */
  for (const slug of ["dragonborn", "dwarf", "goliath", "halfling", "human", "orc", "tiefling"]) {
    const id = `srd:species:en:${slug}`;
    assert.deepEqual(dataOf(verbs, id).traits, srd.records.species[id].data.traits,
      `${slug} : la couche FH ne réécrit AUCUN trait SRD`);
  }

  /* Stonecunning est l'exemple du mandat : le chapitre d'Eric le RÉSUME
     (« Tremorsense 60 ft, a few times per day »), le SRD le porte avec ses
     vrais nombres, et la couche n'y touche pas. */
  const stone = dataOf(verbs, "srd:species:en:dwarf").traits.find((t) => t.id === "stonecunning");
  assert.equal(stone.text, srd.records.species["srd:species:en:dwarf"].data.traits
    .find((t) => t.id === "stonecunning").text);
});

test("ACCEPTATION — retirer la couche FH rend le Gnome, et emporte les trois espèces neuves", () => {
  const { verbs } = pileFH();
  verbs.disable({ id: "fh-species-en" });

  const noms = verbs.query({ kind: "species" }).map((v) => v.record.name).sort();
  assert.deepEqual(noms,
    ["Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Orc", "Tiefling"]);
  assert.equal(verbs.query({ kind: "species", id: "fh:species:en:araag" }), null);
  assert.equal(dataOf(verbs, "srd:species:en:elf").destiny, undefined,
    "un personnage SRD pur ne connaît aucune Destinée (loi §0.12)");

  verbs.enable({ id: "fh-species-en" });
  assertLesDouze(verbs.query({ kind: "species" }).map((v) => v.record.name));
});

/* ══ 3. LA COUCHE NE PORTE QUE LA DIFFÉRENCE (décision D1) ═════════════ */

test("D1 — aucun patch ne remplace un bloc SRD en entier", () => {
  assert.deepEqual(wholesaleRecopies(fhLayer()), []);
  assert.ok(WHOLESALE_PATHS.length >= 3, "la liste des recopies interdites n'est pas vide");
});

test("ATTAQUE — le garde anti-recopie rougit, et NOMME le record et le chemin", () => {
  /* LE TÉMOIN, D'ABORD : sur la vraie couche, le garde se tait. Sans lui,
     l'attaque ne prouverait qu'un garde qui crie tout le temps. */
  assert.doesNotThrow(() => assertNoWholesale(fhLayer()));

  const truquee = fhLayer();
  truquee.records.species["srd:species:en:dwarf"].changes["data.traits"] = [{ id: "x", name: "X", text: "X" }];
  truquee.records.species["srd:species:en:orc"].changes["data.description"] = "réécrite";

  assert.deepEqual(wholesaleRecopies(truquee).map((h) => `${h.id} → ${h.path}`),
    ["srd:species:en:dwarf → data.traits", "srd:species:en:orc → data.description"]);

  /* Et le générateur REFUSE une telle couche, il ne se contente pas de la
     signaler : `buildLayer` passe par ce même garde avant de rendre. */
  assert.throws(() => assertNoWholesale(truquee), (error) => {
    assert.match(error.message, /srd:species:en:dwarf → data\.traits/);
    assert.match(error.message, /srd:species:en:orc → data\.description/);
    return true;
  });
});

test("D1 — les CINQ espèces sans différence FH ne portent QUE leur Base de Destinée", () => {
  const layer = fhLayer();
  const uneSeuleLigne = [];
  for (const [id, entry] of Object.entries(layer.records.species)) {
    if (entry.op === "patch" && Object.keys(entry.changes).length === 1) uneSeuleLigne.push(id);
  }
  /* NOMMÉES, pas comptées : si un jour l'une d'elles gagnait une différence FH,
     ce test doit dire LAQUELLE a bougé, pas « il y en a quatre ». */
  assert.deepEqual(uneSeuleLigne.sort(), [
    "srd:species:en:dragonborn", "srd:species:en:dwarf", "srd:species:en:goliath",
    "srd:species:en:orc", "srd:species:en:tiefling"
  ]);
  for (const id of uneSeuleLigne) {
    assert.deepEqual(Object.keys(layer.records.species[id].changes), ["data.destiny"],
      `${id} : une seule ligne de différence, et c'est le signe que la couche fait son travail`);
  }
});

/* ══ 4. LES REFUS DU GÉNÉRATEUR, PROUVÉS PAR PRIVATION DÉLIBÉRÉE ═══════ */

test("REFUS — un trait SRD disparu fait JETER le générateur, en nommant le trait et son espèce", () => {
  const srd = srdDoc();
  /* PRIVATION DÉLIBÉRÉE : on ampute l'Elfe de Fey Ancestry, dont l'Elestu
     hérite. Jamais une pénurie de circonstance — celle-ci ne peut pas
     s'évaporer le jour où la source s'enrichit. */
  const elfe = srd.records.species["srd:species:en:elf"];
  elfe.data.traits = elfe.data.traits.filter((t) => t.id !== "fey-ancestry");

  assert.throws(() => buildLayer({ srd }), (error) => {
    assert.match(error.message, /fey-ancestry/, "l'erreur nomme le trait manquant");
    assert.match(error.message, /srd:species:en:elf/, "…et l'espèce où il manque");
    return true;
  });
});

test("REFUS — une espèce SRD disparue fait JETER, en la nommant", () => {
  const srd = srdDoc();
  delete srd.records.species["srd:species:en:orc"];
  assert.throws(() => buildLayer({ srd }), /srd:species:en:orc/);
});

test("REFUS — un trait visé par un renommage et disparu fait JETER, en le nommant", () => {
  const srd = srdDoc();
  const gnome = srd.records.species["srd:species:en:gnome"];
  gnome.data.traits = gnome.data.traits.filter((t) => t.id !== "gnomish-lineage");
  assert.throws(() => buildLayer({ srd }), (error) => {
    assert.match(error.message, /gnomish-lineage/);
    assert.match(error.message, /Hoddon/, "l'erreur dit AUSSI de quel renommage il s'agit");
    return true;
  });
});

test("REFUS — une couche SRD qui n'est pas la bonne base fait JETER, en nommant les deux ids", () => {
  const srd = srdDoc();
  srd.id = "srd-5.2.1-fr";
  assert.throws(() => assertSrdLayer(srd), (error) => {
    assert.match(error.message, /srd-5\.2\.1-fr/);
    assert.match(error.message, /srd-5\.2\.1-en/);
    return true;
  });
});

test("REFUS — un champ SRD disparu fait JETER, en le nommant (Keen Senses sans son choix de compétence)", () => {
  const srd = srdDoc();
  delete srd.records.species["srd:species:en:elf"].data.granted_skill_choice;
  assert.throws(() => buildLayer({ srd }), /granted_skill_choice/);
});

test("REFUS — la couche FH montée SEULE patche dans le vide, et le dit", () => {
  /* PRIVATION DÉLIBÉRÉE : la pile n'a pas de SRD dessous. Le refus est celui
     du pli (§L7.2), et il nomme le record visé. */
  const { verbs } = makeBlock();
  assert.throws(() => verbs.register({ bytes: fileBytes(FH_LAYER_REL), origin: FH_LAYER_REL }),
    /srd:species:en:dragonborn/);
  assert.deepEqual(verbs.stack(), [], "et la pile reste vide : le pli est transactionnel");
});

test("les outils de levée nomment ce qu'ils ne trouvent pas — attaqués un par un", () => {
  const srd = srdDoc();
  assert.throws(() => srdSpecies(srd, "aasimar"), /srd:species:en:aasimar/);
  assert.throws(() => liftTrait(srd, "orc", "pas-un-trait"), /pas-un-trait/);
  assert.throws(() => liftTrait(srd, "orc", "pas-un-trait"), /srd:species:en:orc/);
  /* Le TÉMOIN : les mêmes appels réussissent sur la vraie matière — un garde
     qui crie tout le temps se fait désactiver. */
  assert.equal(liftTrait(srd, "orc", "relentless-endurance").name, "Relentless Endurance");
  assert.equal(srdSpecies(srd, "elf").name, "Elf");
});

/* ══ 5. LE GÉNÉRATEUR EST DÉTERMINISTE, ET L'ARTEFACT COMMITÉ EST FRAIS ═ */

test("déterminisme — deux générations rendent des octets identiques", () => {
  const srd = srdDoc();
  assert.equal(serialize(buildLayer({ srd }).layer), serialize(buildLayer({ srd: srdDoc() }).layer));
});

test("generate() écrit DANS SA DESTINATION, et le fichier commité est celui-là", () => {
  const tmp = mkdtempSync(join(tmpdir(), "fhpc-gen-fh-species-"));
  const avant = readFileSync(FH_LAYER_PATH, "utf8");
  try {
    const { outPath, total } = generate({ outDir: tmp });
    assert.equal(outPath, join(tmp, OUT_NAME), "le générateur DIT où il a écrit");
    assert.equal(existsSync(outPath), true);
    assert.equal(total, 12);
    assert.equal(readFileSync(outPath, "utf8"), avant,
      "la couche commitée n'est plus celle que le générateur produit — régénérer, ou dire ce qui a bougé. " +
      "Elle dépend de la couche SRD : si le SRD bouge, ce test rougit, et c'est son travail");

    /* ET IL N'A ÉCRIT QUE LÀ. Sans cette assertion, la discipline reposerait
       sur la confiance (TRAPS.md, lot 13). */
    assert.equal(readFileSync(FH_LAYER_PATH, "utf8"), avant,
      "`generate({outDir})` ne doit RIEN écrire dans layers/");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

/* ══ 6. LA PILE COMPLÈTE, VUE DU DEHORS ═══════════════════════════════ */

test("la pile se lit dans l'ordre : SRD dessous, FH par-dessus", () => {
  const { verbs } = pileFH();
  const pile = verbs.stack();
  assert.deepEqual(pile.map((couche) => couche.id), ["srd-5.2.1-en", "fh-species-en"]);
  assert.deepEqual(pile.map((couche) => couche.lang), ["en", "en"]);
  assert.equal(pile[1].records, 12, "la couche FH porte douze gestes d'espèce, et rien d'autre");
  assert.match(pile[1].hash, /^[0-9a-f]{64}$/);
});

test("la couche FH ne touche AUCUN autre genre que species", () => {
  const layer = fhLayer();
  assert.deepEqual(Object.keys(layer.records), ["species"]);

  const { verbs } = pileFH();
  const srd = srdDoc();
  for (const genre of ["skill", "feat", "background", "class"]) {
    assert.equal(verbs.query({ kind: genre }).length, Object.keys(srd.records[genre]).length,
      `${genre} : la couche des espèces ne doit rien y ajouter ni rien y retirer`);
  }
});

test("un exemple de bout en bout : l'Elestu, mi-Araag mi-Elfe, tel qu'il sort de la pile", () => {
  const { verbs } = pileFH();
  const data = dataOf(verbs, "fh:species:en:elestu");
  assert.deepEqual(traitNames(data).sort(),
    ["Darkvision", "Fast Learner", "Fey Ancestry", "Keen Senses", "Trance"]);
  assert.deepEqual(data.senses, [{ id: "darkvision", name: "Darkvision", range_ft: 60 }]);
  assert.equal(data.speed_ft, 30);
  assert.equal(data.size_key, "medium");
  assert.equal(data.destiny.base, 2);
  assert.equal(data.destiny.base_bonus, undefined,
    "l'Elestu dérive de l'Elfe MAIS n'hérite pas de son pouvoir de Destinée — les dons magiques en moins");
  assert.equal(traitNames(data).includes("Elven Lineage"), false,
    "…ni de sa lignée magique");
});
