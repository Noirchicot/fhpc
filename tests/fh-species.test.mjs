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
  assertSrdLayer, wholesaleRecopies, assertNoWholesale, WHOLESALE_PATHS, OUT_NAME, SRD_PATH,
  substitute, survivors, handWrittenDescriptions, assertNoHandWritten
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

test("ACCEPTATION — les points de compétence : Skillful à l'Humain, Fast Learner à l'Araag et l'Elestu, zéro ailleurs", () => {
  const { verbs } = pileFH();

  /* ⚠️ RÉÉCRIT LE 2026-08-17, PAS DÉSARMÉ. Ce test affirmait « Educated à
     l'Humain ». Eric a tranché que le nom SRD absorbe le trait maison —
     *« skillful origine SRD écrase educated »*, puis *« non, SRD de base si
     possible »*. Le nombre ne bouge pas, le porteur oui. */
  const humain = dataOf(verbs, "srd:species:en:human");
  assert.ok(traitNames(humain).includes("Skillful"), "l'Humain porte Skillful");
  assert.ok(!traitNames(humain).includes("Educated"),
    "`Educated` a été absorbé — il ne doit plus exister nulle part");
  assert.deepEqual(humain.skill_points, { trait: "skillful", by_level: { 1: 2 } },
    "Skillful : +2 au niveau 1, ET C'EST TOUT");
  assert.equal(humain.granted_skill_choice, undefined,
    "et l'ancienne monnaie est partie : sans ça l'Humain reçoit une maîtrise ET deux points");

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

test("GARDE — une espèce n'a JAMAIS deux dons de compétence LIBRES", () => {
  /* 🔴 LE DÉFAUT QUE CE GARDE EXISTE POUR EMPÊCHER, ET IL A VÉCU LONGTEMPS.
     Le 2026-08-17, Eric a vu sur le site publié : *« je vois skillful + fast
     learner »*. Mesuré : l'Humain portait `granted_skill_choice` (une maîtrise
     pleine, donc 2 points au coût plein) EN PLUS de `Educated` (+2), et
     l'Araag portait le même `granted_skill_choice`, hérité de l'Humain, EN
     PLUS de `Fast Learner`. Les deux recevaient l'équivalent de 4 points au
     niveau 1 là où le chapitre en annonce 2.

     ⛔ POURQUOI PERSONNE NE L'AVAIT VU : les deux dons ont des FORMES
     différentes — un choix de maîtrise (`granted_skill_choice`) et un barème
     par niveau (`skill_points`). Aucun total ne les additionnait, ni dans le
     moteur, ni à l'écran, ni dans les tests. Un cumul entre deux formes est
     invisible tant que rien ne compte les FORMES ELLES-MÊMES.

     ⭐ CE QUE CE GARDE COMPTE, ET LA DISTINCTION EST LA BONNE : les dons
     LIBRES (dépensables où l'on veut). `granted_skill_budget` en est EXCLU
     à dessein — Keen Senses est un budget CAPTIF de trois compétences, et
     l'Elestu le porte légitimement à côté de son Fast Learner. Interdire tout
     cumul serait faux ; c'est le cumul de LIBERTÉS qui ne va pas.

     ⛔ CE QUE LE RETRAIT A COÛTÉ, ET C'EST DIT PLUTÔT QUE CACHÉ : l'Humain et
     l'Araag perdent leur `granted_skill_choice`, donc leur 2ᵉ palier de choix
     d'espèce — et l'état « choix imposé » de `species-step.mjs` n'a plus aucun
     utilisateur. Le prix a été remonté à Eric AVANT d'être payé, et il a
     confirmé deux fois.

     📌 Eric, le 2026-08-17 : *« j'en ai plein le cul de voir cette règle pas
     figée remonter »*. Un commentaire ne fige rien — ce garde si. */
  const { verbs } = pileFH();
  const cumuls = [];
  for (const vue of verbs.query({ kind: "species" })) {
    const data = vue.record.data;
    const libres = [];
    if (data.skill_points !== undefined) libres.push(`skill_points(${data.skill_points.trait})`);
    if (data.granted_skill_choice !== undefined) libres.push("granted_skill_choice");
    if (libres.length > 1) cumuls.push(`${vue.record.name} : ${libres.join(" + ")}`);
  }
  assert.deepEqual(cumuls, [],
    "chaque espèce n'accorde qu'UN don de compétence libre — les budgets captifs (Keen Senses) ne comptent pas");
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
    /* LOT 34 — Keen Senses n'est plus un `granted_skill_choice` (« une
       maîtrise pleine au choix parmi trois ») : c'est un `granted_skill_budget`
       captif de 2 points sur la même liste, dépensable à ½ ou Plein. Voir
       `INVENTAIRE-LOT-34.md`. */
    assert.equal(data.granted_skill_choice, undefined,
      `${data.name} ne doit plus porter \`granted_skill_choice\` — c'est un budget maintenant`);
    assert.deepEqual(data.granted_skill_budget.from, KEEN_SENSES_SKILLS);
    assert.equal(data.granted_skill_budget.points, 2);
  }

  assert.deepEqual(perceptionReferences(verbs.query({ kind: "species" })), [],
    "aucune espèce ne doit plus offrir la compétence Perception");
});

/** Les espèces qui offrent encore la compétence Perception, NOMMÉES. Extraite
 *  pour être attaquée : un garde qu'on n'a pas vu rougir est une intention.
 *  LOT 34 : Keen Senses est passé de `granted_skill_choice` à
 *  `granted_skill_budget` — les DEUX champs sont regardés, sans quoi le
 *  garde deviendrait aveugle au budget captif qui porte la même liste. */
export function perceptionReferences(vues) {
  const hits = [];
  for (const vue of vues) {
    const froms = [vue.record.data.granted_skill_choice, vue.record.data.granted_skill_budget]
      .map((declaration) => declaration && declaration.from)
      .filter((from) => Array.isArray(from));
    if (froms.some((from) => from.some((id) => id.endsWith(":perception")))) {
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

test("ATTAQUE (lot 34) — le garde mord AUSSI sur `granted_skill_budget`, pas seulement `granted_skill_choice`", () => {
  const vues = [
    { record: { name: "Elestu", data: { granted_skill_budget: { points: 2, from: ["srd:skill:en:perception"] } } } },
    { record: { name: "Elf", data: { granted_skill_budget: { points: 2, from: ["fh:skill:en:vigilance"] } } } }
  ];
  assert.deepEqual(perceptionReferences(vues), ["Elestu"],
    "un garde qui ne regarderait que `granted_skill_choice` deviendrait aveugle depuis que Keen Senses est un budget");
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

  /* ⚠️ RÉÉCRIT PAR LE LOT 17, et non relâché. L'Humain était dans cette liste,
     et l'assertion « ses traits sont ceux du SRD » est devenue FAUSSE le jour
     où Eric lui a retiré Resourceful. Elle est donc réécrite à la nouvelle
     vérité juste en dessous, avec ce qu'elle doit maintenant prouver — jamais
     supprimée, jamais élargie (TRAPS.md : une note en milieu de ligne avait
     déjà rendu une suite verte sur un garde qui ne tournait plus).
     Six des neuf espèces SRD ne reçoivent QUE leur Base : leurs traits doivent
     être ceux du SRD, à l'octet près. C'est la décision D1 rendue vérifiable. */
  for (const slug of ["dragonborn", "dwarf", "goliath", "halfling", "orc", "tiefling"]) {
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
  /* ⚠️ RÉÉCRIT PAR LE LOT 17, et DURCI au passage. L'assertion disait
     « au moins trois chemins », c'est-à-dire un COMPTE — et un compte reste
     vert quand on le pointe ailleurs (TRAPS.md). Elle NOMME maintenant les
     chemins, ce qui dit aussi lequel a bougé : `data.description` a quitté
     cette liste pour passer sous un garde plus serré
     (`handWrittenDescriptions`), et ce test est l'endroit où ce déplacement
     se lit. */
  assert.deepEqual(WHOLESALE_PATHS.map(([path]) => path), ["data.traits", "data.senses"]);
});

test("ATTAQUE — le garde anti-recopie rougit, et NOMME le record et le chemin", () => {
  /* LE TÉMOIN, D'ABORD : sur la vraie couche, le garde se tait. Sans lui,
     l'attaque ne prouverait qu'un garde qui crie tout le temps. */
  assert.doesNotThrow(() => assertNoWholesale(fhLayer()));

  /* ⚠️ RÉÉCRIT PAR LE LOT 17. `data.description` a QUITTÉ cette liste — pas
     par relâchement, mais parce qu'un garde plus serré l'a reprise
     (`handWrittenDescriptions`, attaqué plus bas) : l'ancien interdit disait
     « n'écris pas ce chemin » et empêchait donc la correction qu'Eric
     demandait. L'attaque porte maintenant sur les deux chemins qui restent. */
  const truquee = fhLayer();
  truquee.records.species["srd:species:en:dwarf"].changes["data.traits"] = [{ id: "x", name: "X", text: "X" }];
  truquee.records.species["srd:species:en:orc"].changes["data.senses"] = [{ id: "y" }];

  assert.deepEqual(wholesaleRecopies(truquee).map((h) => `${h.id} → ${h.path}`),
    ["srd:species:en:dwarf → data.traits", "srd:species:en:orc → data.senses"]);

  /* Et le générateur REFUSE une telle couche, il ne se contente pas de la
     signaler : `buildLayer` passe par ce même garde avant de rendre. */
  assert.throws(() => assertNoWholesale(truquee), (error) => {
    assert.match(error.message, /srd:species:en:dwarf → data\.traits/);
    assert.match(error.message, /srd:species:en:orc → data\.senses/);
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

/* ══ 7. LE LOT 17 — CE QUE L'HUMAIN PERD, ET CE QUE LA PROSE DIT ═══════
   Deux demandes d'Eric du 2026-08-08 : « l'humain perd Resourceful, il a
   Educated à la place », et les descriptions du Hoddon et de l'Elfe
   corrigées. La première a attendu que la grammaire sache RETIRER (lot 17,
   `opPatch.remove`) ; la seconde a attendu qu'on sache corriger une prose
   sans la recopier. */

/** OÙ un mot survit dans un record plié, chemin par chemin. Un garde qui rend
 *  « oui/non » oblige à rechercher ce qu'il vient de trouver ; celui-ci NOMME
 *  les endroits, et c'est ce qui permet de distinguer « c'est réparé » de
 *  « il reste ceci, et on sait quoi ». */
export function whereSurvives(value, word, prefix = "data") {
  if (typeof value === "string") return value.includes(word) ? [prefix] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => whereSurvives(item, word,
      `${prefix}[${item && typeof item === "object" && item.id ? item.id : i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, v]) => whereSurvives(v, word, `${prefix}.${key}`));
  }
  return [];
}

test("ACCEPTATION B1 — l'Humain NE PORTE PLUS Resourceful, et son Skillful vaut 2 points", () => {
  const { verbs } = pileFH();
  const humain = dataOf(verbs, "srd:species:en:human");

  /* NOMMÉ, PAS COMPTÉ : « deux traits SRD » resterait vert si la pile en
     rendait deux mauvais. */
  assert.deepEqual(humain.traits.map((trait) => trait.id), ["skillful", "versatile"],
    "Resourceful est parti ; Skillful et Versatile sont restés");
  assert.deepEqual(traitNames(humain).sort(), ["Skillful", "Twice-Born", "Versatile"],
    "`Educated` a été absorbé par Skillful (Eric, 2026-08-17) — trois noms, plus quatre");

  /* ⚠️ RÉÉCRIT LE 2026-08-17. Ce test affirmait que les deux traits gardés
     étaient le SRD MOT POUR MOT. Ce n'est plus vrai, et c'est délibéré :
     `Skillful` change de monnaie, donc son texte est réécrit. La promesse
     n'est pas abandonnée, elle est RESSERRÉE sur ce qu'on n'a pas touché — et
     elle vaut plus ainsi, parce qu'elle distingue l'écart VOULU de la copie
     accidentelle. */
  const srd = srdDoc().records.species["srd:species:en:human"].data.traits;
  const srdParId = Object.fromEntries(srd.map((trait) => [trait.id, trait]));
  assert.deepEqual(humain.traits.find((x) => x.id === "versatile"), srdParId.versatile,
    "Versatile n'a aucune raison de bouger : il reste le SRD mot pour mot");
  const skillful = humain.traits.find((x) => x.id === "skillful");
  assert.equal(skillful.name, srdParId.skillful.name,
    "Skillful garde son NOM SRD — c'est sa monnaie qui change, pas son identité");
  assert.notEqual(skillful.text, srdParId.skillful.text,
    "et l'écart est RÉEL : si ce texte redevenait celui du SRD, la règle aurait dérivé sans bruit");

  /* Et la couche le fait par la GRAMMAIRE, pas par une réécriture du tableau. */
  const entry = fhLayer().records.species["srd:species:en:human"];
  assert.deepEqual(entry.remove, ["data.traits[resourceful]", "data[granted_skill_choice]"],
    "deux retraits, tous deux désignés par leur identité");
  assert.equal(entry.changes["data.traits[skillful].text"], skillful.text,
    "le texte est repris À L'ÉLÉMENT, pas en réécrivant la liste");
  assert.equal(Object.hasOwn(entry.changes, "data.traits"), false,
    "le tableau des traits n'est jamais réécrit — c'est l'élément qui est désigné, par son identité");
});

test("ACCEPTATION B1 — retirer la couche FH REND Resourceful à l'Humain", () => {
  const { verbs } = pileFH();
  verbs.disable({ id: "fh-species-en" });
  assert.deepEqual(dataOf(verbs, "srd:species:en:human").traits.map((t) => t.id),
    ["resourceful", "skillful", "versatile"],
    "« une couche retirée rend ce qu'elle avait retiré » — vrai par reconstruction du pli");
  verbs.enable({ id: "fh-species-en" });
  assert.deepEqual(dataOf(verbs, "srd:species:en:human").traits.map((t) => t.id), ["skillful", "versatile"]);
});

test("ACCEPTATION B2 — la description du Hoddon ne dit plus Gnome, celle de l'Elfe ne dit plus Perception", () => {
  const { verbs } = pileFH();

  const hoddon = dataOf(verbs, "srd:species:en:gnome");
  assert.equal(hoddon.description.includes("Gnome"), false, "le Hoddon ne se dit plus Gnome");
  assert.equal(hoddon.description.includes("Gnomish"), false, "…ni Gnomish, qui ne contient pas « Gnome »");
  assert.match(hoddon.description, /^As a Hoddon, you have these special traits\./);
  assert.match(hoddon.description, /Hoddon Cunning\./);
  assert.match(hoddon.description, /Hoddon Lineage\./);

  const elfe = dataOf(verbs, "srd:species:en:elf");
  assert.equal(elfe.description.includes("Perception"), false,
    "Perception n'existe pas dans Fate's Hand — la prose ne peut pas continuer à l'offrir");
  for (const skill of ["Vigilance", "Delve", "Survival"]) {
    assert.ok(elfe.description.includes(skill), `la description de l'Elfe doit citer ${skill}`);
  }
  assert.ok(elfe.description.includes("Keen Senses. You have proficiency in the Survival, Delve, or Vigilance skill."),
    "et elle dit exactement la même chose que data.traits[keen-senses].text — une seule forme, un seul endroit");

  /* CONSÉQUENCE DU RETRAIT, et non demande d'Eric : la prose de l'Humain
     décrivait Resourceful. La laisser aurait fait dire au record, dans le même
     souffle, qu'il n'a pas le trait et qu'il l'a. */
  const humain = dataOf(verbs, "srd:species:en:human");
  assert.equal(humain.description.includes("Resourceful"), false);
  assert.equal(humain.description.includes("\n\n\n"), false, "et pas de trou laissé par la phrase ôtée");
  assert.ok(humain.description.includes("Skillful."), "les deux traits gardés sont toujours décrits");
  assert.ok(humain.description.includes("Versatile."));
});

test("ACCEPTATION B2 — les mots interdits qui SURVIVENT encore sont nommés, un par un", () => {
  /* Un « plus aucune occurrence » global serait faux, et un silence serait
     pire. On NOMME donc les endroits, ce qui distingue « c'est réparé » de
     « il reste ceci, et on sait quoi ». */
  const { verbs } = pileFH();

  assert.deepEqual(whereSurvives(dataOf(verbs, "srd:species:en:elf"), "Perception"), [],
    "l'Elfe : plus une seule Perception, nulle part dans le record plié");
  assert.deepEqual(whereSurvives(dataOf(verbs, "srd:species:en:human"), "Resourceful"), [],
    "l'Humain : le trait est parti et la prose qui le décrivait aussi");

  /* ⚠️ LE RÉSIDU CONNU, ÉCRIT PLUTÔT QUE MASQUÉ. Le texte du trait
     `gnomish-lineage` nomme encore les deux sous-lignées « Forest Gnome » et
     « Rock Gnome ». Eric a demandé les DESCRIPTIONS ; renommer deux
     sous-lignées dans le texte d'un trait est une décision qu'il n'a pas
     prise (question Q17-3). Le jour où elle sera prise, c'est CE test qui
     dira que la liste a changé. */
  assert.deepEqual(whereSurvives(dataOf(verbs, "srd:species:en:gnome"), "Gnome"),
    ["data.traits[gnomish-lineage].text"],
    "un seul résidu, nommé — la description, elle, est propre");
});

test("ROUGIT — si le texte SRD change SOUS la substitution, la génération jette en nommant le motif", () => {
  /* LA PREUVE DEMANDÉE, et c'est elle qui justifie tout le dispositif : une
     copie figée aurait survécu à ce changement SANS RIEN DIRE, et la table
     aurait joué une fiche qui contredit sa source. */
  const srd = srdDoc();
  const elfe = srd.records.species["srd:species:en:elf"];
  elfe.data.description = elfe.data.description.replace(
    "You have proficiency in the Insight, Perception, or Survival skill.",
    "You have proficiency in the Insight, Perception, or Nature skill.");

  assert.throws(() => buildLayer({ srd }), (error) => {
    assert.match(error.message, /Insight, Perception, or Survival/, "l'erreur nomme le MOTIF introuvable");
    assert.match(error.message, /srd:species:en:elf/, "…le record où il manque");
    assert.match(error.message, /Elf/, "…et l'espèce");
    assert.match(error.message, /Vigilance/, "…et la RAISON déclarée de la substitution");
    return true;
  });

  /* LE TÉMOIN : sur le SRD intact, la même génération passe. Sans lui, on ne
     prouverait qu'un générateur qui refuse tout. */
  assert.doesNotThrow(() => buildLayer({ srd: srdDoc() }));
});

test("ROUGIT — une phrase NEUVE du SRD qui redit le mot interdit est attrapée par le second filet", () => {
  /* Le trou que les substitutions seules ne peuvent pas voir : tous les motifs
     déclarés trouvent encore leur cible, et le mot survit quand même. */
  const srd = srdDoc();
  const gnome = srd.records.species["srd:species:en:gnome"];
  gnome.data.description += "\n\nGnomes are famously curious.";

  assert.throws(() => buildLayer({ srd }), (error) => {
    assert.match(error.message, /« Gnome »/, "l'erreur nomme le mot qui a survécu");
    assert.match(error.message, /Hoddon/, "…et l'espèce concernée");
    assert.match(error.message, /substitution de plus/, "…et ce qu'il faut faire : une substitution, pas un silence");
    return true;
  });
});

test("ROUGIT — une description SRD disparue, et un trait visé par un retrait qui n'y est plus", () => {
  const sansProse = srdDoc();
  delete sansProse.records.species["srd:species:en:gnome"].data.description;
  assert.throws(() => buildLayer({ srd: sansProse }), (error) => {
    assert.match(error.message, /data\.description/);
    assert.match(error.message, /Hoddon/);
    return true;
  });

  /* Et le retrait est vérifié À LA GÉNÉRATION, pas seulement au pli : mieux
     vaut ne jamais produire un retrait qui ne pourra pas s'appliquer. */
  const sansTrait = srdDoc();
  const humain = sansTrait.records.species["srd:species:en:human"];
  humain.data.traits = humain.data.traits.filter((trait) => trait.id !== "resourceful");
  assert.throws(() => buildLayer({ srd: sansTrait }), (error) => {
    assert.match(error.message, /resourceful/, "l'erreur nomme le trait qu'on voulait retirer");
    assert.match(error.message, /Human/, "…et l'espèce");
    return true;
  });
});

test("ATTAQUE — le garde « aucune prose écrite à la main » rougit, et nomme le record", () => {
  const srd = srdDoc();
  /* LE TÉMOIN, D'ABORD : la vraie couche est entièrement re-dérivable. */
  assert.deepEqual(handWrittenDescriptions(fhLayer(), srd), []);
  assert.doesNotThrow(() => assertNoHandWritten(fhLayer(), srd));

  /* (a) une prose posée à la main sur un record pour lequel AUCUNE
     substitution n'est déclarée — le cas que ce garde existe pour attraper. */
  const aLaMain = fhLayer();
  aLaMain.records.species["srd:species:en:orc"].changes["data.description"] =
    "As an Orc, you have these special traits.";

  /* (b) une copie FIGÉE : les substitutions sont bien déclarées, mais le texte
     commité n'est plus celui qu'elles produisent. C'est la dérive silencieuse
     qu'une recopie ordinaire aurait offerte. */
  aLaMain.records.species["srd:species:en:elf"].changes["data.description"] += " (vieille copie)";

  assert.deepEqual(handWrittenDescriptions(aLaMain, srd).map((hit) => hit.id).sort(),
    ["srd:species:en:elf", "srd:species:en:orc"]);
  assert.throws(() => assertNoHandWritten(aLaMain, srd), (error) => {
    assert.match(error.message, /srd:species:en:orc : aucune substitution/);
    assert.match(error.message, /srd:species:en:elf : le texte de la couche n'est pas celui/);
    return true;
  });

  /* (c) et le SRD qui bouge sous une couche COMMITÉE et par ailleurs saine :
     le garde le voit sans qu'on ait touché à la couche. */
  const bouge = srdDoc();
  const gnome = bouge.records.species["srd:species:en:gnome"];
  gnome.data.description = gnome.data.description.replace("As a Gnome", "As a gnome");
  assert.deepEqual(handWrittenDescriptions(fhLayer(), bouge).map((hit) => hit.id),
    ["srd:species:en:gnome"]);
});

test("les deux moteurs de substitution, nus et attaqués", () => {
  /* Un test qui mesure un trou doit passer par LE GARDE, pas par une regex qui
     imiterait son verdict — d'où l'appel direct aux deux fonctions. */
  const subs = [{ find: "Gnome", put: "Hoddon", why: "renommage" }];
  assert.deepEqual(substitute("A Gnome and a Gnome.", subs),
    { text: "A Hoddon and a Hoddon.", misses: [] }, "TOUTES les occurrences, pas la première");
  assert.deepEqual(substitute("A Dwarf.", subs).misses, subs, "un motif introuvable est RENDU, pas avalé");
  assert.deepEqual(survivors("A Hoddon.", ["Gnome"]), [], "rien ne survit");
  assert.deepEqual(survivors("A Gnome and Gnomish things.", ["Gnome", "Gnomish"]), ["Gnome", "Gnomish"],
    "et les deux formes sont rendues — « Gnomish » ne contient pas « Gnome »");
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
