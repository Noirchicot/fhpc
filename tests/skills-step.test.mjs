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

const { renderSkillsStep, renderSkillsBar, skillsCategories, skillsValidate } =
  await import("../ui/builder/skills-step.mjs");

/* ⚠️ LOT 62 — L'ÉCRAN EST COUPÉ EN DEUX, et les tests suivent.
   B7.1 : la molette de catégories et la LIGNE 1 du pool (`Pool · Invested ·
   Left`, `Reset` compris) **flottent** — elles vivent dans le slot fixe du
   cadre, rendues par `renderSkillsBar`. Seule la LIGNE 2 (le calcul) défile
   avec le contenu.
   ⭐ Les lois que ces tests prouvaient sont TOUTES conservées ; ce qui change
   est OÙ on va lire. `barre()` est la moitié flottante. */
const barre = (ctx) => renderSkillsBar(ctx, ctx.onAction || (() => {}));

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
  /* ⚠️ B7.3b — PLUS DE `<h3>` : « ne pas re-préciser Knowledge en titre, le
     spy et le snap le rendent évident ». Le label voyage en `data-label`,
     que la molette du cadre lit et que l'écran n'affiche pas. */
  const byLabel = new Map(groups.map((g) => [g.getAttribute("data-label"), g.querySelectorAll(".skills-row").length]));
  assert.equal(byLabel.get("Knowledge"), 8);
  assert.equal(byLabel.get("Social"), 7);
  assert.equal(byLabel.get("Exploration"), 6);
  assert.equal(byLabel.get("Physical"), 5);
});

/* ══ 3 — LES 36 OUTILS, ACQUIS OU NON ═══════════════════════════════════ */

test("les 36 outils apparaissent, y compris ceux que le personnage n'a pas", () => {
  const toolCatalog = query({ kind: "tool" });
  assert.equal(toolCatalog.length, 36, "mesure de départ");
  /* ⚠️ Le bloc « Tools & Trainings » a perdu son titre (B7.3b) mais garde ses
     TROIS sous-titres : ils distinguent des choses différentes DANS la même
     dalle, ce que la molette ne dit pas. */
  const node = renderSkillsStep(ctxFrom(fixture.report));
  const toolsBlock = node.querySelectorAll(".skills-tools-block")[0];
  assert.equal(rows(toolsBlock).length, 36);

  /* Un outil non acquis n'est PAS dans `resolved.tools[]` (mesuré, §0) —
     son palier se lit par ABSENCE, et son bonus est le modificateur brut de
     caractéristique (`resolved.abilities[key].mod`), jamais recalculé. */
  assert.equal(fixture.report.resolved.tools.length, 0, "aucun outil acquis sur l'exemple de base");
  const alchemist = rowFor(toolsBlock, "alchemist-s-supplies");
  assert.ok(alchemist, "un outil non acquis a quand même sa ligne");
  /* 🔴 B7.4 — « rien de rempli = 0 ». Le bouton « aucune maîtrise » n'existe
     plus : l'absence de maîtrise est l'ABSENCE de rond allumé. Ce test
     l'affirme positivement, sinon la suppression du 0 pourrait être défaite
     sans que rien ne bronche. */
  assert.equal(activeTier(alchemist), null, "aucun rond allumé — c'est ça, « pas de maîtrise »");
  assert.equal(tierButtons(alchemist).length, 3, "et il reste TROIS ronds, plus quatre");
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
  /* LOT 57 — le repérage se fait sur `data-tier`, la clef MACHINE
     (`dataset.tier`, jamais renommée par ce lot), pas sur `aria-label` :
     ce dernier porte maintenant le MOT humain (« Full proficiency »), et
     un test qui chercherait le bouton par ce mot casserait au premier
     lot qui l'affine sans rien avoir changé au comportement. */
  const proficientBtn = tierButtons(stealth).find((b) => b.dataset.tier === "adept");
  assert.ok(proficientBtn, "le bouton « proficient » existe (lu dans tier_costs, pas en dur)");
  proficientBtn.click();
  assert.equal(calls.length, 1, "exactement un appel");
  assert.deepEqual(calls[0], { kind: "set", path: "fh.skills.spend.stealth", value: "adept" });
});

/* ══ 5/6 — LE REJET : LE POOL DÉPASSÉ ════════════════════════════════════ */

test("REJET — dépasser le pool : la dépense s'applique, le compteur affiche OVER, et validate() répond ok:false " +
  "— et le refus se pose au COMPTEUR, jamais sur une ligne", () => {
  const slugs = ["religion", "nature", "medicine", "insight", "history", "persuasion", "deception"];
  let doc = fixture.document;
  for (const slug of slugs) doc = set(doc, `fh.skills.spend.${slug}`, "adept");
  const report = rebuild(doc);
  const validation = validate(report.document);

  const poolStat = report.resolved.stats.find((s) => s.id === "fh:skill-points");
  assert.ok(poolStat.value < 0, "mesure : le total publié est bien négatif — la dépense EST appliquée");
  assert.equal(validation.ok, false);
  assert.ok(validation.violations.some((v) => v.key === "skill-pool.overspent"));

  const node = renderSkillsStep({ resolved: report.resolved, decisions: report.decisions, violations: validation.violations, query, onAction: () => {} });
  const leftLine = barre(ctxFrom(report, () => {})).querySelectorAll(".skills-counter-line[data-over=\"true\"]")[0];
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

test("🗑️ Keen Senses n'est plus piloté ICI — et le test qui le prouvait a suivi la bourse", () => {
  /* La bourse captive vit sur l'écran SPECIES depuis le lot 60, et la loi
     qu'elle porte — LES TROIS compétences proposées, Delve compris, palier
     LIBRE (le bogue du v1 qui n'en montrait que deux et forçait le ½) — est
     prouvée là-bas, dans `class-species-steps.test.mjs`.
     ⛔ Ce test ne la reprouve pas ici : il vérifie qu'elle n'y est PLUS, pour
     qu'un futur lot ne réintroduise pas le doublon en silence. */
  const node = renderSkillsStep(ctxFrom(fixture.report));
  assert.equal(node.querySelectorAll(".skills-budget-block").length, 0);
  const slugsDeLaGrille = node.querySelectorAll(".skills-row").map((r) => r.getAttribute("data-row"));
  assert.ok(slugsDeLaGrille.includes("delve"),
    "delve reste dans la GRILLE (c'est une compétence comme une autre) — seule la BOURSE a déménagé");
});

/* ══ 8 — LE BUDGET CAPTIF NE CONTAMINE PAS LE POOL LIBRE ════════════════ */

test("🗑️ B7.2d — le budget captif d'espèce a DÉGAGÉ de cet écran", () => {
  /* Eric, 2026-08-14 : « le tableau Species skill budget DÉGAGE ».
     ⚠️ IL N'EST PAS SUPPRIMÉ DU PRODUIT : depuis le lot 60 il vit sur l'écran
     SPECIES, au 2ᵉ palier de son Validate — là où le choix se prend. Ce qui
     part d'ici, c'est le DOUBLON : la même bourse pilotée depuis deux
     écrans, sur les mêmes chemins, aurait fini par diverger.
     ⭐ Et son COMPTE reste lu ici, en ligne 2 : savoir ce qu'on a investi
     ailleurs n'oblige pas à pouvoir le changer ici. */
  const node = renderSkillsStep(ctxFrom(fixture.report));
  assert.equal(node.querySelectorAll(".skills-budget-block").length, 0);
  const detail = node.querySelectorAll(".skills-pooldetail-line")[0].textContent;
  assert.ok(/Species \d+\/\d+/.test(detail), `mais son compte reste lisible — lu : « ${detail} »`);
});

/* ══ 9 — LA NOTIFICATION DU ROGUE, ET PAS POUR LE MAGICIEN ═════════════ */

function rogueDocument() {
  const rogueClass = query({ kind: "class", id: "srd:class:en:rogue" });
  const choices = [
    { path: "level", value: 1, label: "Level 1" },
    { path: "class", ref: { kind: "class", id: "srd:class:en:rogue" }, label: "Rogue" },
    /* LOT 43 — plus de choix `background` : l'Inheritance est le seul record
       du genre, livrée par la couche FH, jamais choisie (contrat §1a). */
    { path: "background.boost.int", value: 2 },
    { path: "background.boost.con", value: 1 },
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
  const cost = rogueClass.record.data.fh_skill_pool.tier_costs.expert;
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
  let doc = set(fixture.document, "fh.skills.spend.thieves-tools", "novice");
  doc = clear(doc, "species.skillBudget.vigilance");
  const report = rebuild(doc);
  const validation = validate(report.document);
  assert.equal(validation.ok, true, "un budget sous-dépensé n'est pas un refus");
  const budgetPlan = report.decisions.find((entry) => entry.path === "species.skillBudget");
  assert.equal(budgetPlan.status, "pending", "mesure : pending, pas locked");
  assert.equal(budgetPlan.lock, undefined, "un plan incomplet ne porte pas de verrou");
  const node = renderSkillsStep(ctxFrom(report));
  /* ⚠️ Le compte d'espèce a migré en LIGNE 2 (celle qui défile) : B7.1 garde
     au flottant « combien il reste », pas « d'où ça vient ». La ligne 1 ne
     porte donc plus que Pool · Invested · Left. */
  const detail = node.querySelectorAll(".skills-pooldetail-line")[0].textContent;
  assert.ok(detail.includes("Species 1/2"), `le détail doit porter le compte d'espèce — lu : « ${detail} »`);
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
  assert.equal(node.querySelectorAll(".skills-pooldetail").length, 0, "pas de compteur sans fh:skill-points");
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

  const ctxMenteur = { resolved: menteur, decisions: fixture.report.decisions, violations: [], query, onAction: () => {} };
  const node = barre(ctxMenteur);
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

test("⭐ Trainings : le catalogue n'est plus vide — treize lignes, dont les douze langues", () => {
  /* ⚠️ CE TEST A CHANGÉ DE CAMP AU LOT 82, et c'est le bon signe. Il gardait un
     bloc GRISÉ, « catalogue vide » — un état arbitré par Eric le 2026-08-13
     (« on ne s'y attelle pas pour le moment »). Le canon des points §B.3 l'a
     rempli : douze langues, une par peuple, plus le Garrot.

     ⭐ ET L'ÉCRAN N'A RIEN EU À ROUVRIR. Le chemin vivant était écrit et testé
     depuis le lot 39 sur un training synthétique, précisément pour ce jour-là.
     La branche grisée reste testée plus bas : elle sert une pile où
     `fh-skills-en` n'est pas montée. */
  const node = renderSkillsStep(ctxFrom(fixture.report));
  const trainingsBlock = node.querySelectorAll(".skills-trainings-block")[0];
  assert.notEqual(trainingsBlock.getAttribute("data-status"), "locked",
    "avec la couche FH montée, le bloc est VIVANT");
  assert.equal(rows(trainingsBlock).length, 13, "douze langues + le Garrot");

  /* ⛔ ON NOMME, ON NE COMPTE PAS. « 13 lignes » passerait avec treize
     mauvaises — ce dépôt a déjà payé la leçon deux fois (TRAPS.md). */
  const noms = [...rows(trainingsBlock)].map((r) => r.querySelector(".skills-row-name").textContent);
  assert.deepEqual(noms, ["Araag", "Dragonborn", "Dwarf", "Elestu", "Elf", "Garrot", "Goliath",
    "Halfling", "Hoddon", "Human", "Loroka", "Orc", "Tiefling"],
    "les douze peuples donnent leur nom à leur langue, et le Garrot se range parmi elles par ordre alphabétique");

  /* ⛔ LE NIVEAU 4 N'EST TOUJOURS PAS ÉCRIT DANS L'ÉCRAN, alors qu'il a
     désormais une source : elle vit sur le RECORD (l'absence de `from_level`
     EST la règle générique). L'écrire ici en ferait une seconde source. */
  assert.ok(!trainingsBlock.textContent.includes(" 4 "), "le niveau générique vit sur le record, pas ici");

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
  /* ⛔ `.skills-train-btn`, PAS `.skills-tier-btn` (lot 82). Un training n'a ni
     palier ni caractéristique : lui prêter la classe des ronds de palier était
     un mensonge de forme sur le seul point qui justifie que `training` soit un
     genre à part — et le garde d'ARIA, qui exige trois ronds par ligne ou
     aucun, le voyait. Même dessin, classe distincte. */
  assert.equal(rows(liveBlock)[0].querySelectorAll(".skills-tier-btn").length, 0,
    "une ligne de training ne porte AUCUN rond de palier");
  rows(liveBlock)[0].querySelectorAll(".skills-train-btn")[0].click();
  assert.deepEqual(calls[0], { kind: "set", path: "fh.skills.train.garrot", value: true });
});

test("Trainings : la branche GRISÉE survit — une pile sans catalogue le DIT au lieu de se cacher", () => {
  /* ⛔ Décision n°4 (lot 39) : grisé avec sa raison, PAS caché. Un bloc absent
     se lit « cette règle n'existe pas » ; un bloc grisé se lit « elle existe et
     rien n'est encore achetable ». Le catalogue FH est plein depuis le lot 82,
     mais une pile SRD nue n'en a pas — et c'est cette pile-là que ce test
     monte, pour que la branche ne meure pas faute d'être empruntée. */
  const nue = makeHarness({ layers: [SRD_FR, HOMEBREW] });
  const node = renderSkillsStep({
    resolved: { stats: [], skills: [], tools: [], traits: [], languages: [], identity: {} },
    decisions: [], violations: [], query: nue.layers.verbs.query, onAction: () => {}
  });
  const bloc = node.querySelectorAll(".skills-trainings-block")[0];
  assert.equal(bloc.getAttribute("data-status"), "locked");
  assert.equal(rows(bloc).length, 0);
  assert.ok(bloc.textContent.includes("Trainings"), "le bloc reste visible et nommé");
});
