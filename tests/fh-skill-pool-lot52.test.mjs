/* ══ LOT 52, DETTE A — LE RETOUR ANTICIPÉ D'`imposedLines()` ═════════════
   Commande `52-dettes-lot-43` §1. Le lot 43 avait déclaré : « `imposedLines()`
   fait un `return` anticipé quand `backgroundRef` est absent … ça ne change
   AUCUN nombre publié … pour un personnage Araag/Humain SANS choix
   `background` posé. » L'architecte a remesuré et élargi la dette : depuis
   que les quatre arrière-plans SRD sont `disable` et que le personnage
   d'exemple ne pose plus AUCUN choix `background`, `backgroundRef` est
   absent pour TOUT LE MONDE — et sous l'ancien ordre, le `return` anticipé
   emportait avec lui deux choses qui NE LISENT PAS `backgroundRef` :
   `skillpool-class-tools-unmechanical` (jamais déclaré) et les DEUX `fail()`
   du bloc espèce (INATTEIGNABLES). Un garde qui ne peut plus mordre est pire
   que pas de garde.

   Le correctif (`src/modules/fh/skill-pool.mjs`, `imposedLines()`) RÉORDONNE
   sans RAYER le `return` : les outils de classe et le net zéro d'espèce
   sortent de dessous lui, `skill_ids`/l'outil d'arrière-plan restent sous
   lui. ⛔ LIGNE ROUGE : aucun nombre publié ne doit changer. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const WIZARD = "srd:class:en:wizard";

function pile(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhSkillPoolStat()]
  }, options));
}

/** Les choix d'un personnage SANS AUCUN choix `background` — ni `path:
 *  "background"`, ni `background.boost.*`, ni `background.originFeat[0]`.
 *  C'est exactement le cas du personnage d'exemple (lot 43, addendums §4) :
 *  `backgroundRef` n'existe nulle part dans ce document. Ce module (le pool)
 *  ne lit ni les boosts ni le don d'origine — les omettre ne prive `rebuild`
 *  d'aucun champ qu'il lui faut pour dériver le pool. */
function choixSansBackground({ level, classId, speciesId, skills = ["arcana", "history"] }) {
  return [
    { path: "level", value: level },
    { path: "class", ref: { kind: "class", id: classId } },
    { path: "species", ref: { kind: "species", id: speciesId } },
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
  ];
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot52-dette-a",
    name: "Dette A",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-skill-pool-lot52", version: "1.0.0" },
    created: "2026-08-13T09:00:00Z",
    modified: "2026-08-13T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const somme = (stat) => stat.breakdown.reduce((total, line) => total + line.value, 0);

/* ══ TEST 1 (commande §1e.1) — LA PAIRE NET ZÉRO SURVIT SANS BACKGROUND ═══
   ⚔️ Doit rougir sur le code d'AVANT ce lot : sous l'ancien `return`, les deux
   lignes de la paire (grant + placement) n'apparaissaient jamais sans
   `backgroundRef`, et le total de l'Araag tombait à 10 au lieu de 12 —
   silencieusement, puisqu'aucun garde ne la réclamait. */
test("DETTE A, test 1 — un Araag SANS choix `background` publie quand même la paire net-zéro de l'espèce, total 12", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "fh:species:en:araag" }))
  });
  const stat = poolDe(out.resolved);
  assert.ok(stat, "le pool publie une entrée même sans background");
  assert.deepEqual(stat.breakdown, [
    { label: "Class Pool · Wizard", value: 12, source: { kind: "class", id: WIZARD } },
    { label: "Fast Learner · Level 1", value: 2, source: { kind: "species", id: "fh:species:en:araag" } },
    { label: "Wizard · 2 imposed choices", value: -2, source: { kind: "class", id: WIZARD } },
    { label: "Araag · 1 granted choice", value: 1, source: { kind: "species", id: "fh:species:en:araag" } },
    { label: "Araag · 1 imposed choice", value: -1, source: { kind: "species", id: "fh:species:en:araag" } }
  ], "les DEUX lignes du net zéro sont là, même sans background posé");
  assert.equal(stat.value, 12, "12 de pool + 2 de Fast Learner + 0 net (le grant s'annule) − 2 d'imposés");
  assert.equal(stat.value, somme(stat));
});

test("DETTE A, test 1bis — un Humain SANS choix `background` publie sa propre paire net-zéro (`Skillful`), total 12", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "srd:species:en:human" }))
  });
  const stat = poolDe(out.resolved);
  assert.deepEqual(stat.breakdown, [
    { label: "Class Pool · Wizard", value: 12, source: { kind: "class", id: WIZARD } },
    { label: "Educated · Level 1", value: 2, source: { kind: "species", id: "srd:species:en:human" } },
    { label: "Wizard · 2 imposed choices", value: -2, source: { kind: "class", id: WIZARD } },
    { label: "Human · 1 granted choice", value: 1, source: { kind: "species", id: "srd:species:en:human" } },
    { label: "Human · 1 imposed choice", value: -1, source: { kind: "species", id: "srd:species:en:human" } }
  ]);
  assert.equal(stat.value, 12);
  assert.equal(stat.value, somme(stat));
});

/* ══ TEST 2 (commande §1e.2) — LES OUTILS DE CLASSE, DÉCLARÉS SANS FOND ═══ */
test("DETTE A, test 2 — `skillpool-class-tools-unmechanical` est déclaré pour un personnage sans arrière-plan", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "fh:species:en:araag" }))
  });
  const declaration = out.underived.find((entry) => entry.field === `stats[${FH_SKILL_POOL_ID}].imposed.class-tools`);
  assert.ok(declaration, "la déclaration existe même sans `background` posé");
  assert.equal(declaration.key, "underived.fh.skillpool-class-tools-unmechanical");
  /* Et la déclaration « aucun background » existe aussi, à côté — les deux
     coexistent, l'une ne remplace pas l'autre. */
  const sansFond = out.underived.find((entry) => entry.field === `stats[${FH_SKILL_POOL_ID}].imposed.background`);
  assert.ok(sansFond, "la déclaration « pas de background » existe toujours, elle aussi");
  assert.equal(sansFond.key, "underived.fh.skillpool-no-background-ref");
});

/* ══ TEST 3 (commande §1e.3) — ⚔️ LE TEST QUI COMPTE : LES DEUX `fail()` ═══
   RESSUSCITENT SANS BACKGROUND. Avant ce lot, un `granted_skill_choice`
   malformé sur une espèce ne jetait PLUS dès que `backgroundRef` était
   absent : le `return` anticipé sautait le bloc espèce tout entier, et le
   garde ne mordait jamais sur le cas réel (le personnage d'exemple). */
test("DETTE A, test 3 — ⚔️ un `granted_skill_choice` SCALAIRE fait JETER, même sans background", () => {
  const h = pile({
    extra: Object.assign(uneCouche("scenario-dette-a-grant-scalaire", {
      species: { "fh:species:en:araag": { op: "patch", changes: { "data[granted_skill_choice]": "one" } } }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "fh:species:en:araag" }))
  }), (erreur) => {
    assert.match(erreur.message, /fh:species:en:araag/, "le refus NOMME le record fautif");
    assert.match(erreur.message, /not an object/, "et dit ce qui cloche — un scalaire, pas un objet");
    return true;
  }, "un `granted_skill_choice` scalaire jette, SANS background posé");
});

test("DETTE A, test 3bis — ⚔️ un `granted_skill_choice.count` À ZÉRO fait JETER, même sans background", () => {
  const h = pile({
    extra: Object.assign(uneCouche("scenario-dette-a-grant-zero", {
      species: { "fh:species:en:araag": { op: "patch", changes: { "data[granted_skill_choice].count": 0 } } }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "fh:species:en:araag" }))
  }), (erreur) => {
    assert.match(erreur.message, /fh:species:en:araag/, "le refus NOMME le record fautif");
    assert.match(erreur.message, /not a positive whole number/, "et dit ce qui cloche — un compte non positif");
    return true;
  }, "un `granted_skill_choice.count` de 0 jette, SANS background posé");
});

/* ══ TEST 4 (commande §1e.4) — L'ELFE, INCHANGÉ À L'OCTET ═════════════════
   L'Elfe ne porte plus `granted_skill_choice` (retiré par la couche FH, au
   profit du budget captif `granted_skill_budget` — Keen Senses). Ce test
   prouve que le réordonnancement ne lui ajoute ni ne lui retire RIEN : ni
   ligne, ni déclaration surnuméraire, comparé À L'OCTET (l'objet entier,
   jamais une projection). */
test("DETTE A, test 4 — un Elfe (aucun `granted_skill_choice`) est inchangé, à l'octet", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "srd:species:en:elf" }))
  });
  const stat = poolDe(out.resolved);
  assert.deepEqual(stat.breakdown, [
    { label: "Class Pool · Wizard", value: 12, source: { kind: "class", id: WIZARD } },
    { label: "Wizard · 2 imposed choices", value: -2, source: { kind: "class", id: WIZARD } }
  ], "aucune ligne d'espèce : l'Elfe n'a ni tier ni grant, et son budget captif (Keen Senses) est un plan À PART");
  assert.equal(stat.value, 10);
  assert.equal(stat.value, somme(stat));

  /* Et l'underived entier, comparé lui aussi comme un objet. Deux entrées
     PRÉEXISTAIENT déjà avant ce lot (`.feat` — aucun don d'origine choisi ;
     `.species` — l'Elfe ne porte pas `skill_points`) : ce lot ne les touche
     pas, il ne fait que RESTITUER `.imposed.class-tools`, qui manquait. */
  const champs = out.underived
    .filter((entry) => entry.field.startsWith(`stats[${FH_SKILL_POOL_ID}]`))
    .map((entry) => ({ field: entry.field, key: entry.key }))
    .sort((a, b) => (a.field < b.field ? -1 : 1));
  assert.deepEqual(champs, [
    { field: `stats[${FH_SKILL_POOL_ID}].feat`, key: "underived.fh.skillpool-feat-no-choice" },
    { field: `stats[${FH_SKILL_POOL_ID}].imposed.background`, key: "underived.fh.skillpool-no-background-ref" },
    { field: `stats[${FH_SKILL_POOL_ID}].imposed.class-tools`, key: "underived.fh.skillpool-class-tools-unmechanical" },
    { field: `stats[${FH_SKILL_POOL_ID}].species`, key: "underived.fh.skillpool-species-no-field" }
  ], "exactement ces quatre déclarations pour l'Elfe sans background — pas une de plus, pas une de moins");
});

/* ══ TEST 5 (commande §1e.5) — AUCUN TOTAL NE BOUGE ═══════════════════════
   La ligne rouge de la commande : les quatre espèces mesurées par
   l'architecte (§1b de la commande) gardent EXACTEMENT leur valeur. */
test("DETTE A, test 5 — ⛔ LIGNE ROUGE : aucun total ne bouge — Human et Araag 12, Elf et Loroka 10", () => {
  const attendu = [
    { speciesId: "srd:species:en:human", nom: "Human", total: 12 },
    { speciesId: "fh:species:en:araag", nom: "Araag", total: 12 },
    { speciesId: "srd:species:en:elf", nom: "Elf", total: 10 },
    { speciesId: "fh:species:en:loroka", nom: "Loroka", total: 10 }
  ];
  for (const cas of attendu) {
    const h = pile();
    const out = h.verbs.rebuild({
      document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: cas.speciesId }))
    });
    const stat = poolDe(out.resolved);
    assert.equal(stat.value, cas.total, `« ${cas.nom} » doit toujours publier ${cas.total}`);
    assert.equal(stat.value, somme(stat), `« ${cas.nom} » : \`value\` reste la somme de son détail`);
  }
});
