/* ══ LES TESTS DU LOT 42 — LES ÉTAPES CLASS ET SPECIES ═══════════════════

   Même patron que `tests/skills-step.test.mjs` (lot 39) : on teste les
   FONCTIONS (`renderClassStep`, `renderSpeciesStep`), pas la page — le DOM
   minimal de `tests/dom-stub.mjs`, aucun paquet de plus.

   Les tests 7 (extraction de `planAt` neutre) et 9 (garde des jetons) ne
   sont PAS ici — même choix que `skills-step.test.mjs` pour son propre
   test 13 : « vérifié par la suite complète (`npm test`), pas ici ». Ce
   fichier n'a modifié ni `tokens.css` ni le garde, et
   `tests/skills-step.test.mjs` tourne SANS AVOIR ÉTÉ TOUCHÉ — c'est la
   preuve de neutralité de l'extraction (commande §3a). */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { manifestOf } from "./build-harness.mjs";

globalThis.document = createTestDocument();

const { renderClassStep } = await import("../ui/builder/class-step.mjs");
const { renderSpeciesStep } = await import("../ui/builder/species-step.mjs");

const fixture = exempleFhEn();
const { layers, build } = fixture;
const query = layers.verbs.query;

function rebuild(document) { return build.verbs.rebuild({ document }); }

const BASE_ABILITIES = [
  { path: "abilities.mode", value: "standard", label: "Standard array" },
  { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 15 },
  { path: "abilities.con", value: 13 }, { path: "abilities.int", value: 12 },
  { path: "abilities.wis", value: 10 }, { path: "abilities.cha", value: 8 }
];

function baseDoc(id, choices) {
  return {
    schema: "fh-char/1", id, name: id, lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/class-species-steps", version: "1.0.0" },
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: { layers: manifestOf(layers), choices, budgets: {}, overrides: [] }
  };
}

/** Un personnage minimal, classe + espèce posées, RIEN de plus — juste assez
 *  pour que `rebuild()` ne jette pas (`class` est la seule chose qu'il exige,
 *  mesuré : `derive.mjs`, « aucun choix class »). */
function docWith({ id, classId, speciesId, classSkills }) {
  const choices = [{ path: "level", value: 1 }, { path: "class", ref: { kind: "class", id: classId } }];
  if (speciesId) choices.push({ path: "species", ref: { kind: "species", id: speciesId } });
  (classSkills || []).forEach((slug, i) => choices.push({ path: `class.skills[${i}]`, value: slug }));
  choices.push(...BASE_ABILITIES);
  return baseDoc(id, choices);
}

/* Le tiret (`.record-option-none`) n'est pas une OPTION du catalogue — c'est
 *  le geste « effacer », toujours présent sur un QCM éditable (`carnet.mjs`,
 *  `renderPicker`). Exclu ici (le sélecteur du stub, `tests/dom-stub.mjs`, ne
 *  porte pas `:not()` — filtré en JS) : ces deux lecteurs ne portent que sur
 *  ce que le PLAN a publié dans `options[]`. */
function realOptions(node) {
  return node.querySelectorAll(".record-option").filter((btn) => !(btn.className || "").includes("record-option-none"));
}
/* LOT 53 — ces deux lecteurs cherchaient l'IDENTIFIANT (« srd:class:en:rogue »,
 *  « half »…) dans `aria-label`, un attribut d'accessibilité réquisitionné
 *  comme crochet de test (commande §0.2). L'identifiant machine vit
 *  maintenant dans `data-value` (`carnet.mjs`, `renderPicker`) — MÊME
 *  ASSERTION, autre attribut ; ce que ces deux fonctions PROUVENT ne change
 *  pas (§1b de la commande). */
function optionValues(node) {
  return realOptions(node).map((btn) => btn.getAttribute("data-value"));
}
function activeValues(node) {
  return realOptions(node).filter((btn) => btn.getAttribute("data-active") === "true").map((btn) => btn.getAttribute("data-value"));
}

/* ══ 1 — LE COMPTE VIENT DU PLAN : ROUBLARD 4, BARDE 3, MAGICIEN 2 ═══════
   ⛔ §0.1 de la commande : « les 2 imposées » est FAUX pour quatre classes.
   Mesuré directement sur les 12 records (voir la commande) — ce test le
   rejoue à travers l'écran, pour que la régression casse ICI si quelqu'un
   remet `2` en dur un jour. */

test("le compte du QCM de classe vient du plan : Rogue 4, Bard 3, Wizard 2 — jamais 2 en dur", () => {
  const cases = [
    ["srd:class:en:rogue", 4],
    ["srd:class:en:bard", 3],
    ["srd:class:en:wizard", 2]
  ];
  for (const [classId, expected] of cases) {
    const report = rebuild(docWith({ id: `count-${classId}`, classId }));
    const node = renderClassStep({ decisions: report.decisions, query }, () => {});
    const note = node.querySelectorAll(".skills-budget-note")[0];
    assert.ok(note, `${classId} : le QCM de classe est rendu`);
    assert.ok(note.textContent.startsWith(`0 of ${expected} chosen`), `${classId} attend ${expected}, lu : « ${note.textContent} »`);
    assert.equal(node.querySelectorAll(".skills-row").length, expected, `${classId} : ${expected} lignes de slot, pas 2`);
  }
});

test("⚔️ ATTAQUE — un `expected` absurde forcé sur un plan fabriqué : l'écran le SUIT, jamais ne le corrige", () => {
  const decisions = [
    { path: "class", options: ["srd:class:en:wizard"], selected: ["srd:class:en:wizard"], expected: 1, answered: 1, status: "answered" },
    { path: "class.skills", options: ["arcana"], selected: [], expected: 9999, answered: 0, status: "pending" },
    { path: "class.skills[0]", options: ["arcana"], selected: [], expected: 1, answered: 0, status: "pending" }
  ];
  const node = renderClassStep({ decisions, query }, () => {});
  const note = node.querySelectorAll(".skills-budget-note")[0];
  assert.equal(note.textContent, "0 of 9999 chosen", "9999 s'affiche tel quel — l'écran ne sait pas que c'est absurde, et ne doit pas le savoir");
  /* Le nombre de LIGNES, lui, vient des slots RÉELLEMENT publiés par
     `decisions[]` (un seul, ici) — jamais de `expected` : l'écran ne va pas
     fabriquer 9999 lignes pour « corriger » un plan qu'il ne juge pas. */
  assert.equal(node.querySelectorAll(".skills-row").length, 1);
});

/* ══ 2 — LES OPTIONS VIENNENT DU PLAN, JAMAIS D'UNE LISTE LOCALE ═════════ */

test("les options viennent du plan : un plan dont les options sont [\"zzz\"] affiche zzz et rien d'autre", () => {
  const decisions = [
    { path: "class", options: ["srd:class:en:wizard"], selected: ["srd:class:en:wizard"], expected: 1, answered: 1, status: "answered" },
    { path: "class.skills", options: ["zzz"], selected: [], expected: 1, answered: 0, status: "pending" },
    { path: "class.skills[0]", options: ["zzz"], selected: [], expected: 1, answered: 0, status: "pending" }
  ];
  const node = renderClassStep({ decisions, query }, () => {});
  const row = node.querySelectorAll(".skills-row")[0];
  const values = optionValues(row);
  assert.deepEqual(values, ["zzz"], "aucune compétence réelle du catalogue n'apparaît — seulement ce que le plan a dit");
});

/* ══ 3 — LES TROIS ÉTATS D'ESPÈCE ═════════════════════════════════════════
   Bourse captive (Elestu), choix imposé (Araag), rien (Loroka) — le carnet
   dit LEQUEL, cet écran ne devine jamais sur le nom (§0.2/§3c). */

test("les trois états d'espèce : bourse captive (Elestu), choix imposé (Araag), rien (Loroka)", () => {
  const elestu = rebuild(docWith({ id: "elestu", classId: "srd:class:en:fighter", speciesId: "fh:species:en:elestu", classSkills: ["athletics", "history"] }));
  const elestuNode = renderSpeciesStep({ decisions: elestu.decisions, query }, () => {});
  assert.equal(elestuNode.querySelectorAll(".skills-budget-block h3")[0].textContent, "Species skill budget");
  assert.equal(elestuNode.querySelectorAll(".skills-row").length, 3, "les trois compétences de la bourse, pas deux");

  const araag = rebuild(docWith({ id: "araag", classId: "srd:class:en:fighter", speciesId: "fh:species:en:araag", classSkills: ["athletics", "history"] }));
  const araagNode = renderSpeciesStep({ decisions: araag.decisions, query }, () => {});
  assert.equal(araagNode.querySelectorAll(".skills-budget-block h3")[0].textContent, "Species skill");
  assert.equal(araagNode.querySelectorAll(".skills-row").length, 1, "un seul slot imposé");

  const loroka = rebuild(docWith({ id: "loroka", classId: "srd:class:en:fighter", speciesId: "fh:species:en:loroka", classSkills: ["athletics", "history"] }));
  const lorokaNode = renderSpeciesStep({ decisions: loroka.decisions, query }, () => {});
  assert.equal(lorokaNode.querySelectorAll(".skills-budget-block").length, 0, "rien — pas même un cadre vide");
  assert.equal(lorokaNode.querySelectorAll(".skills-row").length, 0);
});

/* ══ 3b — LOT 53, §1c/§2 test 3 : LE TIRET GARDE SON « None » ════════════
   `renderPicker` (`carnet.mjs`) ne pose plus d'`aria-label` brut sur les
   VRAIES options (le nom accessible est déjà `textContent`) — mais le
   tiret « — » de la bourse captive (Elestu, `onClear` posé) n'a pas de
   texte qui parle : son `aria-label="None"` doit survivre tel quel. */

test("le tiret « — » de la bourse Species garde son aria-label « None »", () => {
  const elestu = rebuild(docWith({ id: "elestu-dash", classId: "srd:class:en:fighter", speciesId: "fh:species:en:elestu", classSkills: ["athletics", "history"] }));
  const node = renderSpeciesStep({ decisions: elestu.decisions, query }, () => {});
  const row = node.querySelectorAll(".skills-row")[0];
  const dash = row.querySelectorAll(".record-option-none")[0];
  assert.ok(dash, "le tiret existe (la bourse a un `onClear`)");
  assert.equal(dash.textContent, "—");
  assert.equal(dash.getAttribute("aria-label"), "None", "son nom accessible ne peut pas être le tiret lui-même");
});

/* ══ 4 — LES TROIS COMPÉTENCES DE KEEN SENSES, DELVE COMPRIS ═════════════
   ⚠️ §3c de la commande : « les trois compétences sont dans `options` — le
   builder v1 n'en montrait que deux et forçait le ½. C'est un bug de v1. » */

test("les trois compétences de Keen Senses sont proposées à l'étape Species — Delve compris, palier libre", () => {
  const report = rebuild(docWith({ id: "keen-senses", classId: "srd:class:en:fighter", speciesId: "fh:species:en:elestu", classSkills: ["athletics", "history"] }));
  const node = renderSpeciesStep({ decisions: report.decisions, query }, () => {});
  const rows = node.querySelectorAll(".skills-row");
  const slugs = rows.map((row) => row.getAttribute("data-row"));
  assert.deepEqual(new Set(slugs), new Set(["survival", "delve", "vigilance"]), "les TROIS, Delve compris — pas deux");
  for (const row of rows) {
    const values = optionValues(row);
    assert.deepEqual(new Set(values), new Set(["half", "proficient"]), "palier LIBRE — jamais un seul ½ forcé (bug v1)");
  }
});

/* ══ 5 — UN PLAN NON RÉPONDU SE VOIT ══════════════════════════════════════ */

test("un plan non répondu (answered < expected) se voit, et le dit — sur Class ET Species", () => {
  const report = rebuild(docWith({ id: "unanswered", classId: "srd:class:en:rogue", speciesId: "fh:species:en:araag" }));
  const classNode = renderClassStep({ decisions: report.decisions, query }, () => {});
  const classNote = classNode.querySelectorAll(".skills-budget-note")[0];
  assert.equal(classNote.textContent, "0 of 4 chosen");
  assert.equal(classNode.querySelectorAll(".skills-budget-block")[0].getAttribute("data-status"), "pending");

  const speciesNode = renderSpeciesStep({ decisions: report.decisions, query }, () => {});
  const speciesNote = speciesNode.querySelectorAll(".skills-budget-note")[0];
  assert.equal(speciesNote.textContent, "0 of 1 chosen");
  assert.equal(speciesNode.querySelectorAll(".skills-budget-block")[0].getAttribute("data-status"), "pending");
});

/* ══ 6 — `choose` PASSE PAR LE VERBE : LE DOCUMENT QU'IL REND EST CELUI QUI
   REPART AU `rebuild`, JAMAIS L'ANCIEN ═══════════════════════════════════
   Deux moitiés : (a) un clic sur une classe/espèce produit EXACTEMENT un
   `choose` avec le bon `ref` (ce que `shell.mjs` reçoit) ; (b) le verbe
   `choose` lui-même rend un document dont un `rebuild` REFLÈTE le nouveau
   choix, jamais l'ancien — le contrat exact dont dépend
   `applyDecisionAction` (`shell.mjs`, qui n'a pas de harnais DOM et n'est
   donc pas testable ici, voir `tests/dom-stub.mjs` en tête de fichier). */

test("un clic sur une option de la liste (Class/Species) produit exactement un `choose`, avec le bon ref", () => {
  const report = rebuild(docWith({ id: "click-class", classId: "srd:class:en:wizard" }));
  const calls = [];
  const node = renderClassStep({ decisions: report.decisions, query }, (a) => calls.push(a));
  const rogueBtn = node.querySelectorAll(".record-choice-block .record-option")
    .find((b) => b.getAttribute("data-value") === "srd:class:en:rogue");
  assert.ok(rogueBtn, "le bouton Rogue existe (lu dans les 12 options du plan)");
  assert.equal(rogueBtn.textContent, "Rogue", "§1c — le nom accessible (textContent) est le libellé humain, jamais l'id");
  rogueBtn.click();
  assert.equal(calls.length, 1, "exactement un appel");
  assert.deepEqual(calls[0], { kind: "choose", path: "class", ref: { kind: "class", id: "srd:class:en:rogue" } });
});

test("le document rendu par `choose` est celui qui compte : un `rebuild` dessus reflète le NOUVEAU choix, jamais l'ancien", () => {
  const before = docWith({ id: "choose-contract", classId: "srd:class:en:wizard" });
  const { document: after } = build.verbs.choose({ document: before, path: "class", ref: { kind: "class", id: "srd:class:en:rogue" } });

  const reportAfter = rebuild(after);
  assert.equal(reportAfter.resolved.identity.classes[0].name, "Rogue", "rebuild(after) voit le NOUVEAU choix");

  const reportBefore = rebuild(before);
  assert.equal(reportBefore.resolved.identity.classes[0].name, "Wizard",
    "l'ANCIEN document (jamais muté par choose — contracts/build.md) reste Wizard : la preuve que `after`, pas `before`, doit repartir au rebuild");
});

/* ══ 8 — UN PERSONNAGE SRD PUR TRAVERSE LES DEUX ÉCRANS SANS UNE LIGNE DE FH */

test("un personnage SRD pur (couche FH débrayée) traverse Class et Species sans qu'une ligne de FH apparaisse, et sans casser", async () => {
  // Même précédent que skills-step.test.mjs, test 11 : le pli SRD nu, AUCUN module FH.
  const { makeHarness, SRD_FR, HOMEBREW } = await import("./build-harness.mjs");
  const srdHarness = makeHarness({ layers: [SRD_FR, HOMEBREW] });
  const document = {
    schema: "fh-char/1", id: "srd-pur-42", name: "SRD pur", lang: "fr",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/class-species-steps", version: "1.0.0" },
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: {
      layers: manifestOf(srdHarness.layers),
      choices: [
        { path: "level", value: 1, label: "Level 1" },
        { path: "class", ref: { kind: "class", id: "srd:class:fr:magicien" }, label: "Magicien" },
        { path: "species", ref: { kind: "species", id: "srd:species:fr:humain" }, label: "Humain" },
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
  assert.equal(report.resolved.stats.length, 0, "mesure : aucun module FH monté");

  const classNode = renderClassStep({ decisions: report.decisions, query: srdHarness.layers.verbs.query }, () => {});
  assert.ok(classNode.querySelectorAll(".record-choice-block").length > 0, "la liste de classe s'affiche quand même");
  assert.equal(classNode.querySelectorAll(".skills-budget-block").length, 1, "le QCM SRD (2 imposées) s'affiche — skill_choice est SRD, pas FH");

  const speciesNode = renderSpeciesStep({ decisions: report.decisions, query: srdHarness.layers.verbs.query }, () => {});
  assert.ok(speciesNode.querySelectorAll(".record-choice-block").length > 0, "la liste d'espèce s'affiche quand même");
  /* MESURÉ (pas l'hypothèse de départ) : Humain porte `granted_skill_choice`
     ({count:1, from:"any"}) DANS LE SRD NU DÉJÀ — ce n'est pas un ajout FH,
     `srd-5.2.1-fr.layer.json` le porte tel quel. Le QCM species s'affiche
     donc, SANS qu'aucune couche FH soit montée — la preuve même que ce lot
     ne devine rien sur le nom de l'espèce, il lit le plan que LE SRD publie. */
  assert.equal(speciesNode.querySelectorAll(".skills-budget-block").length, 1);
  assert.equal(speciesNode.querySelectorAll(".skills-budget-block h3")[0].textContent, "Species skill");
});

/* ══ LOT 46 — LA CONFIRMATION QUAND ON CHANGE DE CLASSE ══════════════════
   Décision d'Eric, 2026-08-13 : les `class.skills[n]` devenus invalides
   après un changement de classe (verrouillés, `decision.option-unavailable`
   — voir l'en-tête de `class-step.mjs`, mesuré au lot 42) s'effacent, MAIS
   seulement après confirmation. Rejoué sur EXACTEMENT la mesure du lot 42/43
   (`class = rogue`, `class.skills[0] = arcana` invalide, `class.skills[1] =
   investigation` valide) : c'est le même document que
   `tests/inheritance-lot43.test.mjs` (`rogueMesure`) exerce côté moteur, ici
   exercé côté écran. */

function rogueAvecArcaneInvalide() {
  return rebuild(docWith({
    id: "rogue-confirm", classId: "srd:class:en:rogue", classSkills: ["arcana", "investigation"]
  }));
}

test("un créneau `class.skills[n]` verrouillé (`decision.option-unavailable`) fait apparaître LA confirmation, nommant le don perdu", () => {
  const report = rogueAvecArcaneInvalide();
  const decisions = report.decisions;
  const slot0 = decisions.find((d) => d.path === "class.skills[0]");
  assert.equal(slot0.status, "locked");
  assert.equal(slot0.lock.key, "decision.option-unavailable");
  assert.equal(slot0.lock.params.selected, "arcana", "sonde : c'est bien ce nom que la confirmation doit citer");

  const node = renderClassStep({ decisions, query }, () => {});
  const dialog = node.querySelectorAll(".confirm-dialog")[0];
  assert.ok(dialog, "la confirmation s'affiche — le carnet a désigné un créneau à perdre");
  const items = dialog.querySelectorAll(".confirm-dialog-items li").map((li) => li.textContent);
  /* ⚠️ MESURÉ EN ÉCRIVANT CE TEST, ET C'EST UN ÉCART PRÉEXISTANT (pas
     introduit par ce lot) : `skillLabel` (`class-step.mjs`, lot 39/42)
     cherche `query({kind:"skill", id})` avec le SLUG brut (« arcana »),
     alors que le catalogue indexe par id COMPLET (« srd:skill:en:arcana »)
     — la recherche échoue donc TOUJOURS et retombe sur le slug lui-même.
     Le même défaut affecte déjà, AUJOURD'HUI, les boutons du QCM de classe
     lui-même (ligne au-dessus). Ce lot ne le corrige pas (`skillLabel`
     n'est pas « le geste de changer de classe », seule raison pour
     laquelle la commande autorise à toucher ce fichier) — voir
     INVENTAIRE-LOT-46.md, « ce qui t'a surpris en regardant l'écran ». */
  assert.deepEqual(items, ["arcana"]);
});

test("« Confirm » efface EXACTEMENT les créneaux verrouillés, et EUX SEULS — jamais le créneau valide, jamais un futur créneau vide", () => {
  const report = rogueAvecArcaneInvalide();
  const calls = [];
  const node = renderClassStep({ decisions: report.decisions, query }, (a) => calls.push(a));
  node.querySelectorAll(".confirm-dialog-confirm")[0].click();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { kind: "resetSkills", paths: ["class.skills[0]"] },
    "SEUL le créneau verrouillé (arcana) part — pas `class.skills[1]` (investigation, valide), pas un créneau neuf vide");

  /* Et l'EFFET RÉEL, joué avec les vrais verbes (même geste que
     `resetSkills` dans `shell.mjs`) : le créneau fautif disparaît du
     carnet (`clear` retire le choix, il ne le remplace pas — le prochain
     `rebuild` republie un slot neuf à un AUTRE index, §3e-bis de la
     commande du lot 43), et le créneau valide n'a pas bougé. */
  let document = report.document;
  for (const path of calls[0].paths) document = build.verbs.clear({ document, path, kind: "choice" }).document;
  const after = rebuild(document);
  const slots = after.decisions.filter((d) => /^class\.skills\[[0-9]+\]$/.test(d.path));
  assert.equal(slots.some((s) => s.selected.includes("arcana")), false, "« arcana » n'est plus posé nulle part");
  const slot1After = after.decisions.find((d) => d.path === "class.skills[1]");
  assert.deepEqual(slot1After.selected, ["investigation"], "le créneau valide n'a JAMAIS été touché — même index, même valeur");
  const groupAfter = after.decisions.find((d) => d.path === "class.skills");
  assert.equal(slots.length, groupAfter.expected, "le compte de créneaux reste EXACTEMENT `expected` (§3e-bis, lot 43) — rien de plus effacé, rien de plus qu'un slot neuf");
});

test("⚔️ « Cancel » NE TOUCHE RIEN — aucun `onAction` n'est appelé, le document reste identique à l'octet", () => {
  const report = rogueAvecArcaneInvalide();
  const before = JSON.stringify(report.document);
  const calls = [];
  const node = renderClassStep({ decisions: report.decisions, query }, (a) => calls.push(a));
  node.querySelectorAll(".confirm-dialog-cancel")[0].click();
  assert.deepEqual(calls, [], "aucun verbe n'est parti — Annuler ne connaît aucun geste de document");
  assert.equal(JSON.stringify(report.document), before, "le document, jamais réassigné, est identique octet pour octet");
});

test("sans créneau verrouillé (le personnage d'exemple, une classe jamais changée) : aucune confirmation ne s'affiche", () => {
  const report = rebuild(fixture.document);
  const node = renderClassStep({ decisions: report.decisions, query }, () => {});
  assert.equal(node.querySelectorAll(".confirm-dialog").length, 0);
});
