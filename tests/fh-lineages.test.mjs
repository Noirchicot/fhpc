/* ══ LES LIGNAGES — LE SECOND CHOIX, DANS L'ESPÈCE ═══════════════════════════
   2026-08-18. Cinq espèces sur douze ne se choisissent pas d'un bloc : l'Elfe
   choisit sa lignée, le Dragonborn son ancêtre draconique, le Goliath son don
   de géant, le Hoddon sa voie, le Tiefling son legs.

   ⛔ CE QUE CETTE SUITE EXISTE POUR EMPÊCHER, ET C'ÉTAIT L'ÉTAT DU DÉPÔT :
   les pages publiées décrivaient les vingt-cinq options, et AUCUN personnage
   ne pouvait en inscrire une. Mesuré le 2026-08-18 : `dragonborn`, `goliath`,
   `gnome` et `tiefling` ne portaient aucun champ de choix ; seul l'Elfe en
   avait un, et il servait ses compétences, pas son lignage.

   ⚠️ ON NOMME, ON NE COMPTE PAS. Un garde qui asserte « dix ancêtres » reste
   vert quand la couche en rend dix faux (TRAPS.md). Les noms sont épinglés.

   ⚠️ DEUX SOURCES, UN SEUL CHAMP. Le SRD monte lui-même les lignages de
   l'Elfe et du Tiefling ; Fate's Hand ajoute ceux des trois autres, sous le
   MÊME nom `data.lineages`. Cette suite vérifie les deux provenances, parce
   que c'est justement là qu'un second champ inventé se serait glissé. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ROOT, SRD_EN, FH_SPECIES_EN, makeHarness, manifestOf } from "./build-harness.mjs";
import { LINEAGES } from "../src/tools/fh-species-source.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";

function couche(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

/** Les cinq espèces à lignage, et l'endroit d'où leur champ descend. */
const ATTENDU = [
  { slug: "dragonborn", source: "fh",  options: ["Black", "Blue", "Brass", "Bronze", "Copper", "Gold", "Green", "Red", "Silver", "White"] },
  { slug: "elf",        source: "srd", options: ["Drow", "High Elf", "Wood Elf"] },
  { slug: "goliath",    source: "fh",  options: ["Cloud's Jaunt", "Fire's Burn", "Frost's Chill", "Hill's Tumble", "Stone's Endurance", "Storm's Thunder"] },
  { slug: "gnome",      source: "fh",  options: ["Forest Folk", "Rock Folk", "The Mole People"] },
  { slug: "tiefling",   source: "srd", options: ["Abyssal", "Chthonic", "Infernal"] }
];

/* ══ 1. LA DONNÉE ═══════════════════════════════════════════════════════ */

test("les CINQ espèces à lignage portent `data.lineages`, et les sept autres n'en portent pas", () => {
  const srd = couche(SRD_EN).records.species;
  const fh = couche(FH_SPECIES_EN).records.species;

  const porteuses = [];
  for (const id of Object.keys(srd)) {
    const natif = srd[id].data && srd[id].data.lineages;
    const ajoute = fh[id] && fh[id].changes && fh[id].changes["data[lineages]"];
    if (natif || ajoute) porteuses.push(id.slice(id.lastIndexOf(":") + 1));
  }
  assert.deepEqual(porteuses.sort(), ATTENDU.map((e) => e.slug).sort(),
    "NOMMÉES : si une espèce gagne ou perd son lignage, ce test dit laquelle");
});

test("chaque lignage vient de la source annoncée — le SRD pour deux, Fate's Hand pour trois", () => {
  const srd = couche(SRD_EN).records.species;
  const fh = couche(FH_SPECIES_EN).records.species;

  for (const { slug, source, options } of ATTENDU) {
    const id = `srd:species:en:${slug}`;
    const natif = srd[id].data && srd[id].data.lineages;
    const ajoute = fh[id] && fh[id].changes && fh[id].changes["data[lineages]"];

    if (source === "srd") {
      assert.ok(natif, `${slug} : le SRD doit monter ses lignages lui-même`);
      assert.equal(ajoute, undefined,
        `${slug} : Fate's Hand NE DOIT PAS le recopier — deux exemplaires divergent`);
      assert.deepEqual(natif.map((o) => o.name), options);
    } else {
      assert.equal(natif, undefined,
        `${slug} : le SRD n'en porte pas — si ça change, notre copie est un doublon`);
      assert.ok(ajoute, `${slug} : Fate's Hand doit combler le trou`);
      assert.deepEqual(ajoute.map((o) => o.name), options);
    }
  }
});

test("une option de lignage porte un id unique, un nom, et de quoi la jouer", () => {
  const srd = couche(SRD_EN).records.species;
  const fh = couche(FH_SPECIES_EN).records.species;

  for (const { slug } of ATTENDU) {
    const id = `srd:species:en:${slug}`;
    const liste = (srd[id].data && srd[id].data.lineages) ||
      fh[id].changes["data[lineages]"];

    const ids = liste.map((o) => o.id);
    assert.deepEqual([...new Set(ids)], ids, `${slug} : deux options ne partagent pas un id`);
    for (const option of liste) {
      assert.match(option.id, /^[a-z][a-z0-9-]*$/, `${slug}/${option.id} : id en minuscules`);
      assert.ok(option.name && option.name.length > 0, `${slug}/${option.id} : un nom`);
      /* ⚠️ SOIT des paliers, SOIT un type de dégâts. Le Dragonborn est la
         seule exception, et sa table la force : choisir « Black » ne donne
         aucun texte de bénéfice, ça donne le dégât que Breath Weapon lira. */
      const jouable = (option.levels && Object.keys(option.levels).length > 0) ||
        (typeof option.damage === "string" && option.damage.length > 0);
      assert.ok(jouable, `${slug}/${option.id} : ni paliers ni dégâts — l'option est vide`);
    }
  }
});

test("The Mole People est la SEULE option de lignage créée par Fate's Hand", () => {
  const inventees = [];
  for (const [slug, liste] of Object.entries(LINEAGES)) {
    for (const option of liste) if (option.fh) inventees.push(`${slug}/${option.id}`);
  }
  assert.deepEqual(inventees, ["hoddon/mole-people"],
    "toute autre option inventée doit être décidée, pas glissée");
});

/* ══ 2. LE CARNET — LE LIGNAGE ENTRE DANS LES DÉCISIONS ═════════════════ */

function documentAvec(h, speciesId, lineage) {
  const choices = [
    { path: "level", value: 1 },
    { path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } },
    { path: "species", ref: { kind: "species", id: speciesId } },
    { path: "class.skills[0]", value: "athletics" },
    { path: "class.skills[1]", value: "perception" },
    { path: "abilities.str", value: 14 }, { path: "abilities.dex", value: 12 },
    { path: "abilities.con", value: 14 }, { path: "abilities.int", value: 10 },
    { path: "abilities.wis", value: 12 }, { path: "abilities.cha", value: 10 }
  ];
  if (lineage !== undefined) choices.push({ path: "species.lineage[0]", value: lineage });
  return {
    schema: "fh-char/1", id: "lignages", name: "Lineages", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-lineages", version: "1.0.0" },
    created: "2026-08-18T08:00:00Z", modified: "2026-08-18T08:00:00Z",
    build: { layers: manifestOf(h.layers), choices, budgets: {}, overrides: [] }
  };
}

function carnet(speciesId, lineage) {
  const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN] });
  const out = h.verbs.rebuild({ document: documentAvec(h, speciesId, lineage) });
  return new Map(out.decisions.map((entry) => [entry.path, entry]));
}

test("les cinq espèces à lignage OUVRENT un créneau au carnet — les autres n'en ouvrent aucun", () => {
  for (const { slug, options } of ATTENDU) {
    const plans = carnet(`srd:species:en:${slug}`);
    const etape = plans.get("species.lineage[0]");
    assert.ok(etape, `${slug} : le carnet doit demander le lignage`);
    assert.equal(etape.options.length, options.length,
      `${slug} : autant d'options offertes que la table en porte`);
    assert.equal(etape.answered, 0, `${slug} : rien n'est répondu tant que rien n'est posé`);
  }

  for (const slug of ["dwarf", "halfling", "human", "orc"]) {
    const plans = carnet(`srd:species:en:${slug}`);
    assert.equal(plans.get("species.lineage[0]"), undefined,
      `${slug} : aucun lignage à choisir, donc aucun créneau — un créneau vide est une question sans réponse`);
    assert.equal(plans.get("species.lineage"), undefined, `${slug} : ni groupe`);
  }
});

test("un lignage posé est RETENU, et il vient de l'espèce choisie", () => {
  const plans = carnet("srd:species:en:dragonborn", "red");
  const etape = plans.get("species.lineage[0]");
  assert.equal(etape.answered, 1, "la réponse est comptée");
  assert.deepEqual(etape.selected, ["red"], "et c'est celle qui a été posée");
  assert.equal(etape.lock, undefined, "une option du menu ne verrouille rien");
});

test("un lignage qui n'est PAS au menu de l'espèce VERROUILLE, en nommant le chemin", () => {
  /* PRIVATION DÉLIBÉRÉE : « drow » est un vrai lignage — celui de l'Elfe.
     Posé sur un Dragonborn, il doit être refusé. Un simple identifiant
     inventé prouverait moins : celui-ci prouve que le menu est lu ESPÈCE PAR
     ESPÈCE, et pas globalement. */
  const plans = carnet("srd:species:en:dragonborn", "drow");
  const etape = plans.get("species.lineage[0]");
  assert.ok(etape.lock, "un lignage d'une autre espèce ne passe pas");
  assert.match(JSON.stringify(etape.lock), /species\.lineage/, "le verrou nomme le chemin fautif");
});

test("le lignage est DONNÉ, jamais acheté — aucun coût n'entre au carnet", () => {
  const plans = carnet("srd:species:en:elf", "wood-elf");
  const etape = plans.get("species.lineage[0]");
  assert.equal(etape.cost, undefined,
    "un lignage vient avec l'espèce ; un coût ici le ferait payer deux fois");
});

/* ══ 3. LE REFUS, PROUVÉ PAR PRIVATION DÉLIBÉRÉE ═══════════════════════ */

test("REFUS — si le SRD se met à porter les lignages, le générateur CRIE au lieu de doubler", async () => {
  const { buildLayer } = await import("../src/tools/gen-fh-species-layer.mjs");
  const srd = couche(SRD_EN);
  /* PRIVATION À L'ENVERS : on ENRICHIT la source, comme le fera un jour
     `fh-srd`. Notre copie devient alors un doublon qui diverge en silence —
     la faute la plus chère de ce dépôt. On veut l'apprendre par un cri. */
  srd.records.species["srd:species:en:dragonborn"].data.lineages = [
    { id: "black", name: "Black", damage: "Acid" }
  ];

  assert.throws(() => buildLayer({ srd }), (error) => {
    assert.match(error.message, /Dragonborn/, "l'erreur nomme l'espèce");
    assert.match(error.message, /doublon/i, "…et dit que notre copie en est devenue un");
    assert.match(error.message, /LINEAGES/, "…et où supprimer la copie");
    return true;
  });
});
