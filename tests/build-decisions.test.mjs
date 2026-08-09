/* Lot 28 — le septième carnet de `rebuild` : des identifiants et des
   compteurs, jamais une seconde dérivation ni un constructeur caché. */

import test from "node:test";
import assert from "node:assert/strict";

import {
  acceptanceDocument, makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN
} from "./build-harness.mjs";
import { renderBuildViolation } from "../src/labels.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";

function byPath(out) {
  return new Map(out.decisions.map((entry) => [entry.path, entry]));
}

function englishDocument(h, speciesId, speciesSkill) {
  const choices = [
    { path: "level", value: 1 },
    { path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } },
    { path: "species", ref: { kind: "species", id: speciesId } },
    { path: "background", ref: { kind: "background", id: "srd:background:en:acolyte" } },
    { path: "class.skills[0]", value: "athletics" },
    { path: "class.skills[1]", value: "perception" },
    { path: "abilities.str", value: 14 }, { path: "abilities.dex", value: 12 },
    { path: "abilities.con", value: 14 }, { path: "abilities.int", value: 10 },
    { path: "abilities.wis", value: 12 }, { path: "abilities.cha", value: 10 }
  ];
  if (speciesSkill) choices.push({ path: "species.granted", value: speciesSkill });
  return {
    schema: "fh-char/1", id: "lot28-decisions", name: "Decisions", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/build-decisions", version: "1.0.0" },
    created: "2026-08-10T08:00:00Z", modified: "2026-08-10T08:00:00Z",
    build: { layers: manifestOf(h.layers), choices, budgets: {}, overrides: [] }
  };
}

test("le carnet SRD pur ne projette QUE les sept familles réelles demandées", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const decisions = byPath(out);

  assert.deepEqual([...decisions.keys()], [...decisions.keys()].sort(), "le chemin indexe une liste stable");
  assert.equal(decisions.size, out.decisions.length, "aucun chemin n'apparaît deux fois");
  assert.deepEqual([...decisions.keys()], [
    "background", "background.boost", "background.boost.con", "background.boost.int",
    "background.feat", "background.tool", "class", "class.skills", "class.skills[0]",
    "class.skills[1]", "species", "species.keenSenses", "species.skills"
  ]);
  assert.equal(out.decisions.some((entry) => /spell|gear|level|tier|fh\.skills/.test(entry.path)), false,
    "ni sorts, ni équipement, ni niveau, ni dépense de palier simulée");
  assert.equal(out.decisions.every((entry) => entry.status === "answered"), true,
    "une décision complète reste visible answered, sans fausse étape pending");
  assert.deepEqual(decisions.get("class.skills").provenance, {
    mode: "offered", kind: "class", id: "srd:class:fr:magicien", field: "skill_choice"
  });
  assert.deepEqual(decisions.get("background.feat").provenance, {
    mode: "required", kind: "background", id: "srd:background:fr:sage", field: "feat_id"
  });
});

test("set / clear / rebuild ferment la boucle : partiel, restauration, statut", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  h.verbs.clear({ path: "class.skills[1]", kind: "choice" });
  let out = h.verbs.rebuild({});
  let decisions = byPath(out);
  assert.deepEqual(decisions.get("class.skills"), {
    path: "class.skills",
    options: ["arcanes", "histoire", "intuition", "investigation", "medecine", "nature", "religion"],
    selected: ["investigation"], expected: 2, answered: 1,
    provenance: { mode: "offered", kind: "class", id: "srd:class:fr:magicien", field: "skill_choice" },
    remaining: 1, status: "pending"
  });
  assert.equal(decisions.get("class.skills[0]").status, "answered");
  assert.equal(decisions.get("class.skills[1]").status, "pending");

  h.verbs.set({ path: "class.skills[1]", value: "religion" });
  out = h.verbs.rebuild({});
  decisions = byPath(out);
  assert.equal(decisions.get("class.skills").status, "answered");
  assert.equal(decisions.get("class.skills").remaining, 0);
  assert.equal(decisions.get("class.skills[1]").status, "answered");
});

test("les refs, le grant d'espèce, les boosts et le don ferment chacun clear / pose / rebuild", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const cases = [
    {
      path: "species", kind: "choice", projected: "species",
      restore: () => h.verbs.choose({ path: "species", ref: { kind: "species", id: "srd:species:fr:elfe" } })
    },
    {
      path: "species.keenSenses", kind: "choice", projected: "species.skills",
      restore: () => h.verbs.set({ path: "species.keenSenses", value: "perception" })
    },
    {
      path: "background.boost.con", kind: "choice", projected: "background.boost",
      restore: () => h.verbs.set({ path: "background.boost.con", value: 1 })
    },
    {
      path: "background.feat", kind: "choice", projected: "background.feat",
      restore: () => h.verbs.choose({ path: "background.feat", ref: { kind: "feat", id: "srd:feat:fr:initie-a-la-magie" } })
    }
  ];
  for (const scenario of cases) {
    h.verbs.clear({ path: scenario.path, kind: scenario.kind });
    let decisions = byPath(h.verbs.rebuild({}));
    assert.equal(decisions.get(scenario.projected).status, "pending", `${scenario.path} retiré devient pending`);
    scenario.restore();
    decisions = byPath(h.verbs.rebuild({}));
    assert.equal(decisions.get(scenario.projected).status, "answered", `${scenario.path} restauré redevient answered`);
  }
});

test("un faux choix reste dans le carnet, locked, avec une clef du paquet commun", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  h.verbs.clear({ path: "class.skills[1]", kind: "choice" });
  h.verbs.set({ path: "class.skills[7]", value: "athletisme" });
  let out = h.verbs.rebuild({});
  let decisions = byPath(out);
  const locked = decisions.get("class.skills[7]");
  assert.equal(locked.status, "locked");
  assert.equal(locked.lock.key, "decision.option-unavailable");
  assert.deepEqual(Object.keys(locked.lock).sort(), ["key", "params", "path"]);
  assert.match(renderBuildViolation(locked.lock), /athletisme/,
    "la clef de verrou est disponible dans le mécanisme de libellés existant");
  assert.equal(decisions.get("class.skills").status, "locked",
    "le plan entier ne prétend pas être simplement pending quand une de ses étapes est illégale");

  h.verbs.clear({ path: "class.skills[7]", kind: "choice" });
  h.verbs.set({ path: "class.skills[1]", value: "religion" });
  out = h.verbs.rebuild({});
  decisions = byPath(out);
  assert.equal(decisions.has("class.skills[7]"), false, "le faux chemin ne laisse aucun statut fantôme");
  assert.equal(decisions.get("class.skills").status, "answered");
});

test("Araag `any` ouvre tout le catalogue ; Elestu garde sa liste de trois", () => {
  const make = (speciesId, answer) => {
    const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN] });
    return { h, out: h.verbs.rebuild({ document: englishDocument(h, speciesId, answer) }) };
  };
  const araag = make("fh:species:en:araag");
  const araagPlan = byPath(araag.out).get("species.skills");
  const skillSlugs = araag.h.layers.verbs.query({ kind: "skill" }).map((view) => view.record.slug).sort();
  assert.deepEqual(araagPlan.options, skillSlugs, "`from: any` signifie bien tous les identifiants posables");
  assert.equal(araagPlan.options.length, 26);
  assert.equal(araagPlan.status, "pending");

  const elestu = make("fh:species:en:elestu", "delve");
  const elestuPlan = byPath(elestu.out).get("species.skills");
  assert.deepEqual(elestuPlan.options, ["delve", "survival", "vigilance"]);
  assert.equal(elestuPlan.status, "answered");
  assert.equal(byPath(elestu.out).get("species.granted").status, "answered",
    "le chemin consommable déjà pris reste adressable pour clear/set");
});

test("choose / clear / rebuild pilotent aussi le `tool_choice` réel du Soldat", () => {
  const h = makeHarness();
  let doc = acceptanceDocument(h.layers);
  doc.build.choices = doc.build.choices.filter((choice) => choice.path !== "background" && choice.path !== "background.feat" &&
    !choice.path.startsWith("background.boost."));
  doc.build.choices.push({ path: "background", ref: { kind: "background", id: "srd:background:fr:soldat" } });
  let out = h.verbs.rebuild({ document: doc });
  let tool = byPath(out).get("background.tool");
  assert.equal(tool.status, "pending");
  assert.deepEqual(tool.options, ["srd:tool:fr:boite-de-jeux"]);

  h.verbs.choose({ path: "background.tool", ref: { kind: "tool", id: "srd:tool:fr:boite-de-jeux" } });
  out = h.verbs.rebuild({});
  assert.equal(byPath(out).get("background.tool").status, "answered");
  h.verbs.clear({ path: "background.tool", kind: "choice" });
  out = h.verbs.rebuild({});
  assert.equal(byPath(out).get("background.tool").status, "pending");
});

test("`validate` ne publie jamais le carnet de projection", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const verdict = h.verbs.validate({ document: out.document });
  assert.equal(Object.hasOwn(verdict, "decisions"), false);
  assert.deepEqual(Object.keys(verdict).sort(), ["ok", "violations", "warnings"]);
});
