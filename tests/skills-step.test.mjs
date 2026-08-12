/* ══ LES TESTS DU LOT 39 — L'ÉTAPE COMPÉTENCES ═══════════════════════════

   Même patron que `tests/render-fiche.test.mjs` (commande §4) : on teste la
   FONCTION, pas la page. `renderSkillsStep(ctx, onAction)` rend un nœud —
   elle se teste sans navigateur, avec le DOM minimal de `tests/dom-stub.mjs`
   (aucun paquet de plus, loi Q3).

   La matière est RÉELLE partout où c'est possible : la pile EN Fate's Hand
   montée une seule fois (`exempleFhEn()`, comme `render-fiche.test.mjs`),
   `build.verbs.set/rebuild/validate` pour composer les scénarios (Roublard,
   dépassement, palier verrouillé…) — jamais un `resolved` tapé à la main,
   SAUF pour l'attaque du test 12, où c'est le point même de l'attaque
   (`render-fiche.test.mjs` fait pareil, voir son test 5). */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { makeHarness, manifestOf, uneCouche, SRD_FR, HOMEBREW } from "./build-harness.mjs";

globalThis.document = createTestDocument();

const { renderSkillsStep } = await import("../ui/builder/skills-step.mjs");

/* La pile EN Fate's Hand, montée UNE FOIS (comme render-fiche.test.mjs) : le
   personnage d'exemple est un Magicien Elfe niveau 1 — c'est lui que la
   commande a sondé (§0), et ses nombres mesurés y sont recopiés en
   commentaire pour qu'un futur lecteur puisse comparer d'un coup d'œil. */
const fixture = exempleFhEn();
const { layers, build } = fixture;
const query = layers.verbs.query;

function rebuild(document) {
  return build.verbs.rebuild({ document });
}
function validate(document) {
  return build.verbs.validate({ document });
}
function set(document, path, value) {
  return build.verbs.set({ document, path, value }).document;
}
function clear(document, path) {
  return build.verbs.clear({ document, path, kind: "choice" }).document;
}

/** Un `ctx` complet pour `renderSkillsStep`, à partir d'un `rebuild()`. */
function ctxFrom(report, actions) {
  return {
    resolved: report.resolved,
    decisions: report.decisions,
    violations: validate(report.document).violations,
    query,
    onAction: actions || (() => {})
  };
}

function rows(node) { return node.querySelectorAll(".skills-row"); }
function rowFor(node, slug) { return node.querySelectorAll(`.skills-row[data-row="${slug}"]`)[0] || null; }
function tierButtons(row) { return row.querySelectorAll(".skills-tier-btn"); }
function activeTier(row) {
  const active = tierButtons(row).find((btn) => btn.getAttribute("data-active") === "true");
  return active ? active.getAttribute("aria-label") : null;
}

/* ══ 1 — LES 26 COMPÉTENCES, ET LE COMPTE VIENT DE `resolved.skills` ═══ */

test("les 26 compétences apparaissent, et leur compte est LU dans resolved.skills", () => {
  const node = renderSkillsStep(ctxFrom(fixture.report));
  const skillIds = new Set(fixture.report.resolved.skills.map((s) => s.id));
  assert.equal(fixture.report.resolved.skills.length, 26, "mesure de départ — 26 sur l'exemple EN");
  for (const id of skillIds) assert.ok(rowFor(node, id), `la compétence « ${id} » a sa ligne`);

  /* PREUVE que le compte n'est pas écrit "26" en dur : un `resolved` réduit
     à 5 compétences rend 5 lignes de compétence, pas 26 — scopé à la grille
     de compétences, le catalogue des 36 outils rend aussi ses lignes à lui
     et ne doit pas fausser le compte. */
  const reduit = { ...fixture.report.resolved, skills: fixture.report.resolved.skills.slice(0, 5), stats: [], tools: [] };
  const nodeReduit = renderSkillsStep({ resolved: reduit, decisions: [], violations: [], query, onAction: () => {} });
  const skillRowsOnly = nodeReduit.querySelectorAll(".skills-grid .skills-row");
  assert.equal(skillRowsOnly.length, 5, "5 compétences → 5 lignes, jamais 26");
});

/* ══ 2 — LES QUATRE CATÉGORIES RANGENT LES 26 ═══════════════════════════ */

test("les quatre catégories rangent les 26 compétences — 8 · 7 · 6 · 5, lues sur la couche", () => {
  const skillCatalog = query({ kind: "skill" });
  const counts = { knowledge: 0, social: 0, exploration: 0, physical: 0 };
  for (const view of skillCatalog) {
    const category = view.record.data && view.record.data.category;
    if (Object.hasOwn(counts, category)) counts[category] += 1;
  }
  assert.deepEqual(counts, { knowledge: 8, social: 7, exploration: 6, physical: 5 }, "mesure de la couche, pas recopiée");

  const node = renderSkillsStep(ctxFrom(fixture.report));
  const groups = node.querySelectorAll(".skills-group");
  const byLabel = new Map(groups.map((g) => [g.querySelector("h3").textContent, g.querySelectorAll(".skills-row").length]));
  assert.equal(byLabel.get("Knowledge"), 8);
  assert.equal(byLabel.get("Social"), 7);
  assert.equal(byLabel.get("Exploration"), 6);
  assert.equal(byLabel.get("Physical"), 5);
});

/* ══ 3 — LES 36 OUTILS, ACQUIS OU NON ═══════════════════════════════════ */

test("les 36 outils apparaissent, y compris ceux que le personnage n'a pas", () => {
  const toolCatalog = query({ kind: "tool" });
  assert.equal(toolCatalog.length, 36, "mesure de départ");
  const node = renderSkillsStep(ctxFrom(fixture.report));
  const toolsBlock = node.querySelectorAll(".skills-tools-block")[0];
  assert.equal(rows(toolsBlock).length, 36);

  /* Un outil non acquis n'est PAS dans `resolved.tools[]` (mesuré, §0) —
     son palier se lit par ABSENCE, et son bonus est le modificateur brut de
     caractéristique (`resolved.abilities[key].mod`), jamais recalculé. */
  assert.equal(fixture.report.resolved.tools.length, 0, "aucun outil acquis sur l'exemple de base");
  const alchemist = rowFor(toolsBlock, "alchemist-s-supplies");
  assert.ok(alchemist, "un outil non acquis a quand même sa ligne");
  assert.equal(activeTier(alchemist), "No proficiency");
  const bonusCell = alchemist.querySelectorAll(".skills-row-bonus")[0];
  const abilityKey = query({ kind: "tool", id: "srd:tool:en:alchemist-s-supplies" }).record.data.ability_key;
  const expected = fixture.report.resolved.abilities[abilityKey].mod;
  assert.equal(bonusCell.textContent, expected >= 0 ? `+${expected}` : String(expected));
});

/* ══ 4 — UN CLIC PRODUIT EXACTEMENT UN APPEL DE VERBE ═══════════════════ */

test("un clic sur un palier produit exactement un appel de verbe, avec le bon chemin et la bonne valeur", () => {
  const calls = [];
  const node = renderSkillsStep(ctxFrom(fixture.report, (action) => calls.push(action)));
  const stealth = rowFor(node, "stealth");
  const proficientBtn = tierButtons(stealth).find((b) => b.getAttribute("aria-label") === "proficient");
  assert.ok(proficientBtn, "le bouton « proficient » existe (lu dans tier_costs, pas en dur)");
  proficientBtn.click();
  assert.equal(calls.length, 1, "exactement un appel");
  assert.deepEqual(calls[0], { kind: "set", path: "fh.skills.spend.stealth", value: "proficient" });
});

/* ══ 5/6 — LE REJET : LE POOL DÉPASSÉ ════════════════════════════════════ */

test("REJET — dépasser le pool : la dépense s'applique, le compteur affiche OVER, et validate() répond ok:false " +
  "— et le refus se pose au COMPTEUR, jamais sur une ligne", () => {
  const slugs = ["religion", "nature", "medicine", "insight", "history", "persuasion", "deception"];
  let doc = fixture.document;
  for (const slug of slugs) doc = set(doc, `fh.skills.spend.${slug}`, "proficient");
  const report = rebuild(doc);
  const validation = validate(report.document);

  const poolStat = report.resolved.stats.find((s) => s.id === "fh:skill-points");
  assert.ok(poolStat.value < 0, "mesure : le total publié est bien négatif — la dépense EST appliquée");
  assert.equal(validation.ok, false);
  assert.ok(validation.violations.some((v) => v.key === "skill-pool.overspent"));

  const node = renderSkillsStep({ resolved: report.resolved, decisions: report.decisions, violations: validation.violations, query, onAction: () => {} });
  const leftLine = node.querySelectorAll(".skills-counter-line[data-over=\"true\"]")[0];
  assert.ok(leftLine, "la ligne « Left » porte le marqueur OVER");
  assert.ok(leftLine.textContent.includes("OVER"));

  /* test 6 : AUCUNE ligne de la grille ne porte de marque pour ce refus —
     `skill-pool.overspent` n'a pas de `.path` (mesuré, §3d). */
  const rowRefusals = node.querySelectorAll(".skills-row .skills-refusal");
  assert.equal(rowRefusals.length, 0, "aucune ligne ne porte le refus du pool");
  const counterRefusal = node.querySelectorAll(".skills-refusal-pool")[0];
  assert.ok(counterRefusal, "le refus est bien affiché, au compteur");
  assert.ok(counterRefusal.textContent.includes("Overspent"));
});

/* ══ 7 — KEEN SENSES PROPOSE LES TROIS, PALIER LIBRE ═══════════════════ */

test("Keen Senses propose les TROIS compétences (survival · delve · vigilance), palier libre — le bogue du v1 ne revient pas", () => {
  const node = renderSkillsStep(ctxFrom(fixture.report));
  const budget = node.querySelectorAll(".skills-budget-block")[0];
  assert.ok(budget, "le budget captif d'espèce est rendu");
  const slugs = budget.querySelectorAll(".skills-row").map((row) => row.getAttribute("data-row"));
  assert.deepEqual(new Set(slugs), new Set(["survival", "delve", "vigilance"]), "les TROIS, pas deux");

  /* Le palier est un CHOIX, pas un ½ forcé : chaque ligne porte deux
     boutons de palier (demi, plein) + le tiret, jamais un seul figé. */
  for (const slug of slugs) {
    const row = rowFor(budget, slug);
    const labels = tierButtons(row).map((b) => b.getAttribute("aria-label"));
    assert.deepEqual(labels, ["No proficiency", "half", "proficient"]);
  }
});

/* ══ 8 — LE BUDGET CAPTIF NE CONTAMINE PAS LE POOL LIBRE ════════════════ */

test("le budget captif ne contamine pas le pool : dépenser dedans laisse fh:skill-points intact", () => {
  const before = fixture.report.resolved.stats.find((s) => s.id === "fh:skill-points").value;
  let doc = clear(fixture.document, "species.skillBudget.survival");
  doc = clear(doc, "species.skillBudget.vigilance");
  doc = set(doc, "species.skillBudget.delve", "proficient"); // 2 points, palier plein, sur UNE seule
  const report = rebuild(doc);
  const after = report.resolved.stats.find((s) => s.id === "fh:skill-points").value;
  assert.equal(after, before, "fh:skill-points ne bouge pas d'un point");

  const node = renderSkillsStep(ctxFrom(report));
  const delveInBudget = rowFor(node.querySelectorAll(".skills-budget-block")[0], "delve");
  assert.equal(activeTier(delveInBudget), "proficient");
});

/* ══ 9 — LA NOTIFICATION DU ROGUE, ET PAS POUR LE MAGICIEN ═════════════ */

function rogueDocument() {
  const rogueClass = query({ kind: "class", id: "srd:class:en:rogue" });
  const choices = [
    { path: "level", value: 1, label: "Level 1" },
    { path: "class", ref: { kind: "class", id: "srd:class:en:rogue" }, label: "Rogue" },
    { path: "background", ref: { kind: "background", id: "srd:background:en:sage" }, label: "Sage" },
    { path: "abilities.mode", value: "standard", label: "Standard array" },
    { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 15 },
    { path: "abilities.con", value: 13 }, { path: "abilities.int", value: 12 },
    { path: "abilities.wis", value: 10 }, { path: "abilities.cha", value: 8 },
    { path: "class.skills[0]", value: "stealth" }, { path: "class.skills[1]", value: "acrobatics" },
    { path: "class.skills[2]", value: "perception" }, { path: "class.skills[3]", value: "insight" }
  ];
  assert.ok(rogueClass, "sonde : le record rogue existe bien dans la pile montée");
  return {
    schema: "fh-char/1", id: "test-rogue", name: "Test Rogue", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/skills-step", version: "1.0.0" },
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: { layers: manifestOf(layers), choices, budgets: {}, overrides: [] }
  };
}

test("la notification du Rogue apparaît pour le rogue, et PAS pour le magicien — le coût est lu dans tier_costs", () => {
  const rogueReport = rebuild(rogueDocument());
  const rogueNode = renderSkillsStep(ctxFrom(rogueReport));
  const notice = rogueNode.querySelectorAll(".skills-rogue-notice")[0];
  assert.ok(notice, "le rogue voit la ligne dès le niveau 1");
  const rogueClass = query({ kind: "class", id: "srd:class:en:rogue" });
  const cost = rogueClass.record.data.fh_skill_pool.tier_costs.expertise;
  assert.ok(notice.textContent.includes(String(cost)), "le coût vient de tier_costs, pas d'un nombre en dur");
  assert.ok(notice.textContent.includes("Rogue"));

  const wizardNode = renderSkillsStep(ctxFrom(fixture.report));
  assert.equal(wizardNode.querySelectorAll(".skills-rogue-notice").length, 0, "le magicien ne la voit pas au niveau 1");
});

/* ══ 10 — UN PLAN INCOMPLET RESTE VALIDE ════════════════════════════════ */

test("un plan incomplet (budget captif d'espèce pas totalement dépensé) reste valide — un personnage en cours de construction n'est pas une faute", () => {
  /* La fiche de base n'a encore AUCUN point en outil (Sage n'en impose pas) :
     `skill-pool.no-tool` y est TOUJOURS vrai, indépendamment de ce test — il
     faut le satisfaire à part pour isoler ce qu'on veut vraiment mesurer.
     ⚠️ MESURÉ EN ÉCRIVANT CE TEST : retirer UNE des deux compétences
     IMPOSÉES de classe (`class.skills[1]`) N'EST PAS l'exemple qui convient
     — le moteur la refuse déjà (`skill-grant.count-mismatch`, `block.mjs`) :
     une source qui déclare `{count:2}` et n'en reçoit qu'une EST une faute
     rapportée, pas un plan « en cours ». Le budget captif, lui, ne verrouille
     que le DÉPASSEMENT (`spent > points`), jamais le manque — c'est
     l'exemple qui prouve vraiment la phrase de la commande. */
  let doc = set(fixture.document, "fh.skills.spend.thieves-tools", "half");
  doc = clear(doc, "species.skillBudget.vigilance");
  const report = rebuild(doc);
  const validation = validate(report.document);
  assert.equal(validation.ok, true, "un budget sous-dépensé n'est pas un refus");
  const budgetPlan = report.decisions.find((entry) => entry.path === "species.skillBudget");
  assert.equal(budgetPlan.status, "pending", "mesure : pending, pas locked");
  assert.equal(budgetPlan.lock, undefined, "un plan incomplet ne porte pas de verrou");
  const node = renderSkillsStep(ctxFrom(report));
  const speciesLine = node.querySelectorAll(".skills-counter-line")
    .find((line) => line.querySelectorAll(".skills-counter-label")[0].textContent === "Species");
  assert.ok(speciesLine.querySelectorAll(".skills-counter-value")[0].textContent.startsWith("1/2"));
});

/* ══ 11 — UN PERSONNAGE SRD PUR : AUCUNE MÉCANIQUE FH, L'ÉCRAN NE CASSE PAS */

test("un personnage SRD pur (couche FH débrayée) : aucune mécanique FH n'apparaît, l'écran ne casse pas", () => {
  const srdHarness = makeHarness({ layers: [SRD_FR, HOMEBREW] }); // AUCUN module (§0.12) — le pli SRD nu
  const document = {
    schema: "fh-char/1", id: "srd-pur", name: "SRD pur", lang: "fr",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/skills-step", version: "1.0.0" },
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: {
      layers: manifestOf(srdHarness.layers),
      choices: [
        { path: "level", value: 1, label: "Level 1" },
        { path: "class", ref: { kind: "class", id: "srd:class:fr:magicien" }, label: "Magicien" },
        { path: "abilities.mode", value: "standard", label: "Standard array" },
        { path: "abilities.str", value: 8 }, { path: "abilities.dex", value: 14 },
        { path: "abilities.con", value: 13 }, { path: "abilities.int", value: 15 },
        { path: "abilities.wis", value: 12 }, { path: "abilities.cha", value: 10 },
        { path: "class.skills[0]", value: "investigation" }, { path: "class.skills[1]", value: "religion" }
      ],
      budgets: {}, overrides: []
    }
  };
  const report = srdHarness.verbs.rebuild({ document });
  assert.equal(report.resolved.stats.length, 0, "mesure : aucun module monté, aucune stat FH");
  const validation = srdHarness.verbs.validate({ document: report.document });

  const node = renderSkillsStep({
    resolved: report.resolved, decisions: report.decisions, violations: validation.violations,
    query: srdHarness.layers.verbs.query, onAction: () => {}
  });
  assert.equal(node.querySelectorAll(".skills-counter").length, 0, "pas de compteur sans fh:skill-points");
  assert.equal(node.querySelectorAll(".skills-rogue-notice").length, 0);
  assert.equal(node.querySelectorAll(".skills-budget-block").length, 0);
  assert.ok(node.querySelectorAll(".skills-row").length > 0, "la grille de base (SRD) s'affiche quand même");
  /* Chaque compétence, sans palier achetable (aucun `tier_costs` à lire) : le
     texte statique remplace les boutons de palier — l'écran ne plante pas. */
  const oneRow = node.querySelectorAll(".skills-row")[0];
  assert.equal(tierButtons(oneRow).length, 0);
  assert.ok(oneRow.querySelectorAll(".skills-row-static").length === 1);
});

/* ══ 12 — ⚔️ L'ATTAQUE : UN resolved.stats MENTEUR S'AFFICHE MENTEUR ═══ */

test("⚔️ ATTAQUE — un fh:skill-points menteur (value ≠ somme du détail) s'affiche MENTEUR, jamais recalculé", () => {
  const menteur = structuredClone(fixture.report.resolved);
  const stat = menteur.stats.find((s) => s.id === "fh:skill-points");
  const vraieSomme = stat.breakdown.reduce((total, line) => total + line.value, 0);
  assert.equal(stat.value, vraieSomme, "au départ, le document est honnête");
  stat.value = 9999;
  assert.notEqual(9999, vraieSomme, "et 9999 n'est pas la somme — sinon l'attaque ne prouve rien");

  const node = renderSkillsStep({ resolved: menteur, decisions: fixture.report.decisions, violations: [], query, onAction: () => {} });
  const leftLine = node.querySelectorAll(".skills-counter-line")
    .find((line) => line.querySelectorAll(".skills-counter-label")[0].textContent === "Left");
  assert.equal(leftLine.querySelectorAll(".skills-counter-value")[0].textContent, "9999", "L'ÉCRAN AFFICHE CE QUE resolved DIT");
  assert.notEqual(leftLine.querySelectorAll(".skills-counter-value")[0].textContent, String(vraieSomme),
    "il n'a pas refait l'addition à la place du moteur");

  /* L'attaque n'a touché qu'un clone. */
  assert.equal(fixture.report.resolved.stats.find((s) => s.id === "fh:skill-points").value, vraieSomme);
});

/* ══ 13 — LE GARDE DU LOT 38 RESTE VERT ══════════════════════════════════
   Vérifié par la suite complète (`npm test`), pas ici — ce fichier n'a
   modifié ni `tokens.css` ni le garde. Voir INVENTAIRE-LOT-39.md. */

/* ══ LE CHEMIN VIVANT DES TRAININGS (0 record aujourd'hui, mais testé) ══
   ADDENDUMS : « le mécanisme est fait, le catalogue est vide ». Ce test
   MONTE un record synthétique pour prouver que le sous-bloc bascule de
   « grisé, sans catalogue » à « une liste réelle, cliquable » sans qu'une
   ligne de `skills-step.mjs` ait besoin de changer — la garantie que la
   commande demande (§2c) sans jamais l'exercer en pratique. */

test("Trainings : grisé avec sa raison quand le catalogue est vide, une vraie ligne cliquable dès qu'un record existe", () => {
  const node = renderSkillsStep(ctxFrom(fixture.report));
  const trainingsBlock = node.querySelectorAll(".skills-trainings-block")[0];
  assert.equal(trainingsBlock.getAttribute("data-status"), "locked");
  assert.equal(rows(trainingsBlock).length, 0);
  assert.ok(!trainingsBlock.textContent.includes(" 4 "), "le niveau 4 n'est écrit nulle part — aucune source vivante");

  const withTraining = makeHarness({
    layers: [SRD_FR, HOMEBREW],
    extra: uneCouche("scenario-training", {
      training: { "scenario:training:fr:garrot": { op: "add", name: "Garrot", slug: "garrot", data: { cost: 1 } } }
    })
  });
  const catalog = withTraining.layers.verbs.query({ kind: "training" });
  assert.equal(catalog.length, 1, "le record synthétique est bien monté");

  const calls = [];
  const liveNode = renderSkillsStep({
    resolved: { stats: [], skills: [], tools: [], traits: [], languages: [], identity: {} },
    decisions: [], violations: [], query: withTraining.layers.verbs.query,
    onAction: (a) => calls.push(a)
  });
  const liveBlock = liveNode.querySelectorAll(".skills-trainings-block")[0];
  assert.notEqual(liveBlock.getAttribute("data-status"), "locked");
  assert.equal(rows(liveBlock).length, 1);
  rows(liveBlock)[0].querySelectorAll(".skills-tier-btn")[0].click();
  assert.deepEqual(calls[0], { kind: "set", path: "fh.skills.train.garrot", value: true });
});
