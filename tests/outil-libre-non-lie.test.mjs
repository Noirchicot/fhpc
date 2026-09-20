/* ══ LOT 217 — L'OUTIL PAYÉ LIBRE N'EST PAS LIÉ ═══════════════════════════
   ⚖️ Eric, 2026-09-20 : *« À la création du perso il y a des bound points,
   qu'on répartit avant même d'arriver dans l'écran skills. Mais quand j'arrive
   dans l'écran skills et que j'ai des free points à dépenser, si je veux un
   tool, je crée la ligne, et je dépense des free points dedans, je répartis
   exactement comme des free points — ILS NE SONT PAS BOUND. »*

   La loi, reformulée et validée le même jour : **`bound` n'est pas une
   propriété de la LIGNE, c'est un PLANCHER posé par l'ORIGINE du point.** Un
   point lié pose un plancher ; un point libre n'en pose aucun. Une ligne créée
   et payée aux points libres a donc un plancher de ZÉRO — elle se défait
   entièrement, comme n'importe quelle dépense libre.

   ── CE QUE CETTE SUITE A ATTRAPÉ, MESURÉ LE 2026-09-20 ──────────────────
   Deux vocabulaires se croisaient en silence. La ligne du pool NOMME sa source
   par l'ID DE RECORD (`srd:tool:en:calligrapher-s-supplies`) — c'est le contrat
   de `source.id`, le même pour `class`, `skill`, `feat`, et `classIdFromBreakdown`
   en dépend. Tout le reste de l'écran Skills parle SLUG : `resolved.tools[].id`,
   le chemin `fh.skills.spend.<slug>`, `ligne.dataset.ligne`. L'écran demandait
   `achetes.has(slug)` à un ensemble d'IDS : la réponse était « non » pour TOUT
   LE MONDE, toujours, sans un mot. Donc `lie = owned && !achetes.has(slug)`
   valait `owned` — **tout outil possédé était lié**, y compris celui que le
   joueur venait de payer de ses propres points libres.

   ⚠️ ET LE COMPTEUR DESCENDAIT QUAND MÊME (mesuré : 10 → 8, « Spent 2 »). Le
   registre ENREGISTRAIT ; il enregistrait sous la MAUVAISE CLEF. Le test
   « est-ce que le compteur baisse ? » aurait donc innocenté le registre à
   tort — une bijection fausse est cohérente, seule une seconde lecture EN SENS
   INVERSE l'attrape. C'est ce que fait la garde n°1 ci-dessous : elle relit la
   ligne du pool DEPUIS le slug de l'écran, au lieu de vérifier que la ligne
   existe sous la forme que l'écrivain lui a donnée.

   ⛔ POURQUOI `tests/fh-skill-pool-tools.test.mjs` NE POUVAIT PAS L'ATTRAPER :
   il affirme `source.id === "srd:tool:en:calligrapher-s-supplies"` ET
   `resolved.tools[0].id === "calligrapher-s-supplies"` dans le MÊME test, sans
   jamais croiser les deux. Il protégeait la forme écrite par l'écrivain — un
   garde qui ne peut pas accuser l'écrivain qu'il relit.

   ── LES DEUX SENS, PARCE QU'UN GARDE QUI NE PEUT JAMAIS ACCUSER EST PIRE ──
   1. l'outil PAYÉ aux points libres n'est PAS lié — il rougissait avant le lot ;
   2. l'outil POSSÉDÉ SANS ACHAT (accordé par l'arrière-plan) EST lié — il
      verdissait avant le lot et doit le rester. Sans lui, un `lie = false`
      écrit en dur passerait la garde n°1 en souriant. */

import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN } from "./build-harness.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

globalThis.document = createTestDocument();
const { renderSkillsStep, skillsReinitialiserEcran, skillsEcran, skillsCategories } =
  await import("../ui/builder/skills-step.mjs");

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const FH_TRAININGS_EN = "layers/fh-trainings-en.layer.json";

/** La page « Tools & Trainings » est la DERNIÈRE de la rangée — lue, jamais
 *  écrite en dur : le jour où une catégorie s'ajoute, ce test suit. */
function surLaPageDesOutils(ctx) {
  skillsReinitialiserEcran();
  skillsEcran().page = skillsCategories(ctx).length - 1;
}

const ligneDe = (node, slug) => node.querySelectorAll(`.skills-ligne[data-ligne="${slug}"]`)[0] || null;
const rondsDe = (l) => [...l.querySelectorAll(".skills-rond")];

/** Le popup du NOM de la ligne, avec ses actions — c'est là que vit `Remove`. */
function popupDuNom(node, slug, actions) {
  const nom = ligneDe(node, slug).querySelectorAll(".skills-ligne-lien")[0];
  assert.ok(nom, `la ligne « ${slug} » porte un nom cliquable`);
  actions.length = 0;
  nom.click();
  const popup = actions.find((a) => a.kind === "popup");
  assert.ok(popup, "le nom ouvre un détail");
  return popup;
}

/* ══ 1 — L'OUTIL PAYÉ AUX POINTS LIBRES N'EST PAS LIÉ ══════════════════════
   Le geste d'Eric, reproduit à l'écran le 20/09 sur le builder servi : Skills →
   Tools & Trainings → « Add a tool » → Calligrapher's Supplies → « Add tool » →
   tap sur le 2ᵉ rond. Mesuré AVANT le lot : « Spent 2 » (les points SONT
   partis), halo violet sur les deux ronds, `data-lie="oui"`, aucun `Remove`, et
   le popup « Bound » qui renvoie le joueur vers *« the step that placed them »*
   — une étape qui n'existe pas. Les 2 points étaient irrécupérables. */
test("un outil créé et payé aux points libres n'est PAS lié : ronds libres, plancher zéro, Remove offert", () => {
  const fixture = exempleFhEn();
  const { build, layers } = fixture;
  const slug = "calligrapher-s-supplies";

  const doc = build.verbs.set({
    document: fixture.report.document, path: `fh.skills.spend.${slug}`, value: "adept"
  }).document;
  const report = build.verbs.rebuild({ document: doc });
  const actions = [];
  const ctx = {
    resolved: report.resolved, decisions: report.decisions,
    violations: build.verbs.validate(report.document).violations,
    query: layers.verbs.query, onAction: (a) => actions.push(a)
  };

  /* ── LE PRÉALABLE : les points libres sont RÉELLEMENT partis ───────────
     Sans ça, le reste ne prouve rien — on testerait une ligne fantôme. */
  const pool = report.resolved.stats.find((s) => s.id === FH_SKILL_POOL_ID);
  assert.equal(pool.value, 8, "10 points libres moins l'achat d'un outil à Adept (2)");
  const outil = report.resolved.tools.find((t) => t.id === slug);
  assert.ok(outil, "l'outil est possédé");
  assert.equal(outil.proficiency, "adept");

  /* ── ⭐ LA SECONDE LECTURE, EN SENS INVERSE ────────────────────────────
     On repart du SLUG que l'écran tient et on cherche la ligne du pool qui le
     paie — le sens que la suite du lot 35 ne faisait jamais. Une bijection
     fausse est cohérente dans son propre sens ; elle ne survit pas à celui-ci. */
  const catalogue = layers.verbs.query({ kind: "tool" }) || [];
  const vue = catalogue.find((v) => v.record.slug === slug);
  assert.ok(vue, "le slug de l'écran retrouve son record au catalogue");
  const payeuse = pool.breakdown.find((l) => l.source && l.source.kind === "tool" && l.source.id === vue.id);
  assert.ok(payeuse, "et la ligne du pool qui la paie se retrouve DEPUIS ce slug, pas seulement depuis l'id");
  assert.equal(payeuse.value, -2);

  /* ── CE QUE LE JOUEUR VOIT ────────────────────────────────────────────── */
  surLaPageDesOutils(ctx);
  const node = renderSkillsStep(ctx);
  const ligne = ligneDe(node, slug);
  assert.ok(ligne, "la ligne de l'outil est sur la page Tools & Trainings");
  assert.equal(ligne.getAttribute("data-lie"), null,
    "⚖️ payé aux points libres : la LIGNE n'est pas liée");
  assert.deepEqual(rondsDe(ligne).map((b) => b.getAttribute("data-lie")), ["non", "non", "non"],
    "et AUCUN rond n'est captif — le plancher d'un point libre est zéro");

  const popup = popupDuNom(node, slug, actions);
  assert.ok((popup.actions || []).some((a) => a.mot === "Remove"),
    "le détail offre « Remove » : une dépense libre se défait entièrement");
  assert.doesNotMatch(popup.texte, /[Bb]ound at/,
    "⛔ et il ne raconte plus « placed by your class or species » d'un outil que le joueur a payé lui-même");
});

/* ══ 2 — LE TÉMOIN CONTRAIRE : POSSÉDÉ SANS ACHAT, DONC LIÉ ════════════════
   ⚠️ IL LUI FAUT UNE PILE SANS `fh-inheritance-en` : mesuré le 20/09, l'héritage
   Fate's Hand retire l'outil d'arrière-plan (addendums §4), donc sur la pile FH
   complète AUCUN arrière-plan n'accorde d'outil — `resolved.tools[]` n'y est
   rempli QUE par la dépense du pool. C'est ce qui rendait le défaut TOTAL et non
   marginal : dans le produit d'Eric, tout outil listé est un outil payé, et tous
   étaient liés. Le Criminal du SRD, lui, accorde encore ses Thieves' Tools : ce
   test-ci est le seul endroit où un outil possédé-sans-achat existe. */
test("TÉMOIN CONTRAIRE — un outil accordé par l'arrière-plan, jamais acheté, RESTE lié", () => {
  const h = makeHarness({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN, FH_TRAININGS_EN],
    modules: [createFhSkillPoolStat()]
  });
  const choices = [
    { path: "level", value: 1 },
    { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
    { path: "species", ref: { kind: "species", id: "srd:species:en:halfling" } },
    { path: "background", ref: { kind: "background", id: "srd:background:en:criminal" } },
    { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 14 },
    { path: "abilities.con", value: 12 }, { path: "abilities.int", value: 14 },
    { path: "abilities.wis", value: 12 }, { path: "abilities.cha", value: 14 },
    { path: "currency.cp", value: 0 }, { path: "currency.sp", value: 0 },
    { path: "currency.gp", value: 15 }, { path: "currency.pp", value: 0 },
    { path: "class.skills[0]", value: "arcana" }, { path: "class.skills[1]", value: "history" },
    { path: "background.boost.int", value: 2 }, { path: "background.boost.con", value: 1 }
  ];
  const document = {
    schema: "fh-char/1", id: "lot217-temoin", name: "Témoin", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/outil-libre-non-lie", version: "1.0.0" },
    created: "2026-09-20T09:00:00Z", modified: "2026-09-20T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices, budgets: {}, overrides: [] }
  };
  const report = h.verbs.rebuild({ document });
  const actions = [];
  const ctx = {
    resolved: report.resolved, decisions: report.decisions,
    violations: h.verbs.validate(report.document).violations,
    query: h.layers.verbs.query, onAction: (a) => actions.push(a)
  };

  const slug = "thieves-tools";
  const outil = report.resolved.tools.find((t) => t.id === slug);
  assert.ok(outil, "l'arrière-plan Criminal accorde ses Thieves' Tools");
  const pool = report.resolved.stats.find((s) => s.id === FH_SKILL_POOL_ID);
  assert.equal(pool.breakdown.some((l) => l.source && l.source.kind === "tool"), false,
    "⭐ et AUCUNE ligne du pool ne le paie — c'est tout le sens de ce témoin");

  surLaPageDesOutils(ctx);
  const node = renderSkillsStep(ctx);
  const ligne = ligneDe(node, slug);
  assert.ok(ligne, "la ligne de l'outil accordé est là");
  assert.equal(ligne.getAttribute("data-lie"), "oui",
    "possédé sans dépense : le plancher vient de l'ORIGINE du point, la ligne est liée");
  assert.equal(rondsDe(ligne).filter((b) => b.getAttribute("data-lie") === "oui").length, 2,
    "et les ronds jusqu'à son palier (Adept) sont captifs");

  const popup = popupDuNom(node, slug, actions);
  assert.equal((popup.actions || []).some((a) => a.mot === "Remove"), false,
    "⛔ pas de « Remove » sur un lié : il se change à l'étape qui l'a posé");
});
