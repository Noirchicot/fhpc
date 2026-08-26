/* ══ LES TESTS DU LOT 42 — LES ÉTAPES CLASS ET SPECIES ═══════════════════

   Même patron que `tests/skills-step.test.mjs` (lot 39) : on teste les
   FONCTIONS (le catalogue partagé et ses deux configurations), pas la page — le DOM
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

const {
  catalogueOptions, catalogueCursor, catalogueValidate, renderCatalogueRail, renderCatalogueCards
} = await import("../ui/builder/catalogue.mjs");
const { CLASS_CATALOGUE, renderClassCardBody, renderClassChoices, classPalier2 } =
  await import("../ui/builder/class-step.mjs");
const { SPECIES_CATALOGUE, renderSpeciesCardBody, renderSpeciesChoices, speciesPalier2 } =
  await import("../ui/builder/species-step.mjs");

/* ══ LOT 60 — LES DEUX ÉCRANS SONT LE MÊME (« B3 = B2 ») ══════════════════
   Ces trois fabriques rejouent EXACTEMENT ce que `shell.mjs` compose : le
   catalogue partagé + la configuration de l'écran. Les tourner par une table
   plutôt qu'à la main est le point du lot — si Class et Species divergeaient,
   c'est ici que ça se verrait d'abord. */
const CATALOGUES = {
  class: { ...CLASS_CATALOGUE, body: renderClassCardBody, choices: renderClassChoices, palier2: classPalier2 },
  species: { ...SPECIES_CATALOGUE, body: renderSpeciesCardBody, choices: renderSpeciesChoices, palier2: speciesPalier2 }
};
const ctxDe = (decisions, ecran, cursor = 0) => ({
  decisions, query, path: CATALOGUES[ecran].path, kind: CATALOGUES[ecran].kind,
  label: CATALOGUES[ecran].label, cursor
});
/** Le palier 1 : les douze fiches aimantées. */
const fiches = (decisions, ecran, cursor = 0) =>
  renderCatalogueCards(ctxDe(decisions, ecran, cursor), CATALOGUES[ecran].body);
/** Le palier 2 : le menu des choix intrinsèques. */
const menu = (decisions, ecran, act = () => {}) =>
  CATALOGUES[ecran].choices(ctxDe(decisions, ecran), act);
/** La porte de `Validate`, telle que la coquille l'interroge. */
const porte = (decisions, ecran, { palier = 1, cursor = 0 } = {}) =>
  catalogueValidate({ ...ctxDe(decisions, ecran, cursor), palier }, CATALOGUES[ecran].palier2(decisions));

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
function docWith({ id, classId, speciesId, classSkills, classBudget, masteries }) {
  const choices = [{ path: "level", value: 1 }, { path: "class", ref: { kind: "class", id: classId } }];
  if (speciesId) choices.push({ path: "species", ref: { kind: "species", id: speciesId } });
  (classSkills || []).forEach((slug, i) => choices.push({ path: `class.skills[${i}]`, value: slug }));
  /* ⭐ LES POINTS LIÉS — `{ slug: palier }`. Depuis le 2026-08-20 c'est par là
     que la classe dépense, et non plus par `class.skills[n]` : le QCM ne
     coûtait rien et n'accordait rien. Les deux formes cohabitent dans ce
     harnais parce que le SRD pur garde la première. */
  for (const [slug, palier] of Object.entries(classBudget || {})) {
    choices.push({ path: `class.skillBudget.${slug}`, value: palier });
  }
  /* ⭐ LES MAÎTRISES D'ARME (2026-08-20) — un `ref` vers une ARME, pas une
     valeur : c'est l'arme qu'on choisit, sa propriété vient avec. */
  (masteries || []).forEach((weaponId, i) =>
    choices.push({ path: `class.weaponMastery[${i}]`, ref: { kind: "weapon", id: weaponId } }));
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
  /* LOT 72 — le menu porte maintenant AUSSI les QCM de sorts (Cantrips /
     Prepared spells) : le compte de lignes se lit donc DANS le bloc
     `class.skills` (le premier — l'ordre d'append de `renderClassChoices`),
     plus jamais sur le menu entier. Le nombre de BLOCS devient une assertion
     à part entière : un non-lanceur n'en a qu'un, un lanceur en a trois —
     jamais un cadre vide pour un Rogue. */
  /* 🔴 RÉÉCRIT LE 2026-08-20 — LE COMPTE A CHANGÉ DE NATURE, PAS DE SOURCE.
     Le QCM `class.skills` (cocher N maîtrises) est remplacé par la BOURSE
     CAPTIVE (dépenser N points), parce que les cases du QCM ne coûtaient rien
     au pool et n'accordaient rien : `proficiency: "none"`, mesuré.
     ⭐ Ce que ce test garde n'a pas bougé d'un mot : **le nombre vient du plan,
     jamais d'un chiffre écrit dans l'écran**. Il vaut désormais des POINTS —
     Rogue 6 (2 novices + 1 expert), Bard 3, Wizard 2 — et les créneaux ne
     valent plus `expected` mais LA LISTE DE LA CLASSE : on ne dépense pas un
     point par compétence, on choisit sur quelles compétences dépenser. */
  /* ⭐ RÉVISÉ LE 2026-08-20 — LES MAÎTRISES D'ARME ARRIVENT, et elles changent
     le compte de blocs pour les classes qui en portent. Le Roublard passe de 1
     à 2 (ses points liés, puis ses 2 maîtrises à choisir parmi 19 armes), le
     Barde reste à 3 (il n'a pas la feature), le Magicien aussi.
     📌 C'EST LE COMPTE QUI BOUGE, PAS LA QUESTION : « combien de blocs, et
     pourquoi celui-là et pas un autre ». Un Magicien à 4 blocs rougirait
     toujours — il n'a ni maîtrise d'arme, ni bourse d'outil. */
  const cases = [
    ["srd:class:en:rogue", 6, 2],
    ["srd:class:en:bard", 3, 3],
    ["srd:class:en:wizard", 2, 3]
  ];
  for (const [classId, expected, blocs] of cases) {
    const report = rebuild(docWith({ id: `count-${classId}`, classId }));
    const node = menu(report.decisions, "class");
    /* ⚠️ LOT 79 — LES TROIS BLOCS ONT CHANGÉ DE FORME, PAS DE CONTRAT. Les
       compétences (étape 2) puis les deux groupes de sorts (étapes 3 et 4)
       passent par `renderChoixGlisses` ; le QCM reste pour l'espèce. Ce garde
       compte donc LES DEUX formes, et lit le compte DANS SON BLOC.
       🔴 CORRIGÉ LE 2026-08-16 : il comptait les créneaux sur le menu ENTIER,
       ce qui marchait tant qu'un seul bloc en avait. Un Bard en a maintenant
       trois — 9 créneaux au total, dont 3 pour les compétences. La question
       posée n'a pas bougé d'un mot ; l'endroit où on la pose, si.
       ⛔ Et le compte comme les créneaux viennent du PLAN, jamais d'un nombre
       écrit dans l'écran. */
    const blocsRendus = [...node.querySelectorAll(".choix-glisse"), ...node.querySelectorAll(".skills-budget-block")];
    assert.equal(blocsRendus.length, blocs, `${classId} : ${blocs} bloc(s) de choix — sorts seulement si la progression les appelle`);
    const competences = node.querySelectorAll(".choix-glisse")[0];
    assert.ok(competences, `${classId} : l'écran de compétences est rendu`);
    const note = competences.querySelectorAll(".choix-glisse-compte")[0];
    assert.ok(note.textContent.startsWith(`0 of ${expected} points spent`),
      `${classId} attend ${expected} POINTS, lu : « ${note.textContent} »`);
    /* ⭐ ET LES CRÉNEAUX SONT LES COMPÉTENCES DE LA CLASSE, pas un par point :
       un expert consomme quatre points sur UN créneau. Le compte des créneaux
       vient donc de la LISTE, et cette liste vient du plan. */
    const plan = report.decisions.find((d) => d.path === "class.skillBudget");
    assert.equal(competences.querySelectorAll(".glisse-creneau").length, plan.options.length,
      `${classId} : un créneau par compétence de la classe — jamais un par point`);
    assert.ok(plan.options.length > expected,
      `${classId} : il y a plus de compétences que de points, sinon le choix n'en serait pas un`);
  }
});

test("⚔️ ATTAQUE — un `expected` absurde forcé sur un plan fabriqué : l'écran le SUIT, jamais ne le corrige", () => {
  const decisions = [
    { path: "class", options: ["srd:class:en:wizard"], selected: ["srd:class:en:wizard"], expected: 1, answered: 1, status: "answered" },
    { path: "class.skillBudget", options: ["arcana"], selected: [], expected: 9999, answered: 0, status: "pending" },
    { path: "class.skillBudget.arcana", options: ["novice"], selected: [], expected: 1, answered: 0, status: "pending" }
  ];
  const node = menu(decisions, "class");
  const note = node.querySelectorAll(".choix-glisse-compte")[0];
  assert.equal(note.textContent, "0 of 9999 points spent", "9999 s'affiche tel quel — l'écran ne sait pas que c'est absurde, et ne doit pas le savoir");
  /* Le nombre de LIGNES, lui, vient des slots RÉELLEMENT publiés par
     `decisions[]` (un seul, ici) — jamais de `expected` : l'écran ne va pas
     fabriquer 9999 lignes pour « corriger » un plan qu'il ne juge pas. */
  assert.equal(node.querySelectorAll(".glisse-creneau").length, 1);
});

/* ══ 2 — LES OPTIONS VIENNENT DU PLAN, JAMAIS D'UNE LISTE LOCALE ═════════ */

test("les options viennent du plan : un plan dont les options sont [\"zzz\"] affiche zzz et rien d'autre", () => {
  const decisions = [
    { path: "class", options: ["srd:class:en:wizard"], selected: ["srd:class:en:wizard"], expected: 1, answered: 1, status: "answered" },
    { path: "class.skillBudget", options: ["zzz"], selected: [], expected: 1, answered: 0, status: "pending" },
    { path: "class.skillBudget.zzz", options: ["novice"], selected: [], expected: 1, answered: 0, status: "pending" }
  ];
  const node = menu(decisions, "class");
  /* 🔴 LA QUESTION S'EST DÉPLACÉE AVEC LA BOURSE, ET C'EST JUSTE. Sur un QCM,
     les OPTIONS du plan étaient les compétences, donc le vivier. Sur une
     bourse, le vivier porte les PRIX (+1/+2/+4) et ce sont les RÉCEPTEURS qui
     portent les compétences. Ce test garde la même règle — l'écran n'affiche
     que ce que le plan a dit — au nœud où elle vit maintenant. */
  const recus = node.querySelectorAll(".glisse-creneau").map((c) => c.getAttribute("data-creneau"));
  assert.deepEqual(recus, ["class.skillBudget.zzz"],
    "aucune compétence réelle du catalogue n'apparaît — seulement ce que le plan a dit");
  /* ⭐ ET LE VIVIER SUIT LE PLAN JUSQU'AU BOUT : ce créneau fabriqué ne déclare
     qu'un seul palier légal, l'écran n'en offre qu'un. Il ne complète pas la
     table du canon de sa propre initiative — c'est la même règle que le 9999
     du test précédent, prise par l'autre bout. */
  const prix = node.querySelectorAll(".glisse-jeton").map((b) => b.getAttribute("data-valeur"));
  assert.deepEqual(prix, ["novice"], "le vivier porte les PRIX que le plan déclare, pas des compétences et pas une table locale");
});

/* ══ 3 — LES TROIS ÉTATS D'ESPÈCE ═════════════════════════════════════════
   Bourse captive (Elestu), choix imposé (Araag), rien (Loroka) — le carnet
   dit LEQUEL, cet écran ne devine jamais sur le nom (§0.2/§3c). */

test("les états d'espèce : bourse captive (Elestu), et RIEN pour les onze autres", () => {
  /* 🔴 IL N'Y EN A PLUS QUE DEUX, ET C'EST LE PRIX D'UNE RÈGLE — 2026-08-17.
     L'état « choix imposé » était porté par `granted_skill_choice`, que seuls
     l'Araag et l'Humain avaient. Eric a fait absorber ce don par `Fast Learner`
     et par `Skillful` (*« Fast Learner qui recouvre tout »*, *« Skillful origine
     SRD écrase Educated »*), parce que les deux espèces recevaient DEUX dons de
     compétence là où le chapitre en annonce un.
     ⛔ La conséquence a été remontée à Eric AVANT d'être payée : cet état-là
     n'a plus aucun utilisateur, donc l'Araag et l'Humain n'ont plus de 2ᵉ
     palier sur l'écran Species. Ce test le CONSTATE au lieu de le supposer —
     le jour où une espèce reprend un `granted_skill_choice`, il rougit. */
  const elestu = rebuild(docWith({ id: "elestu", classId: "srd:class:en:fighter", speciesId: "fh:species:en:elestu", classSkills: ["athletics", "history"] }));
  const elestuNode = menu(elestu.decisions, "species");
  assert.equal(elestuNode.querySelectorAll(".skills-budget-block h3")[0].textContent, "Species skill budget");
  assert.equal(elestuNode.querySelectorAll(".skills-row").length, 3, "les trois compétences de la bourse, pas deux");

  /* L'Araag portait le « choix imposé » ; il n'en a plus, comme les dix autres. */
  const araag = rebuild(docWith({ id: "araag", classId: "srd:class:en:fighter", speciesId: "fh:species:en:araag", classSkills: ["athletics", "history"] }));
  const araagNode = menu(araag.decisions, "species");
  assert.equal(araagNode.querySelectorAll(".skills-budget-block").length, 0,
    "l'Araag n'a plus de choix d'espèce : son Fast Learner donne des points, pas une maîtrise");

  const loroka = rebuild(docWith({ id: "loroka", classId: "srd:class:en:fighter", speciesId: "fh:species:en:loroka", classSkills: ["athletics", "history"] }));
  const lorokaNode = menu(loroka.decisions, "species");
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
  const node = menu(elestu.decisions, "species");
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
  const node = menu(report.decisions, "species");
  const rows = node.querySelectorAll(".skills-row");
  const slugs = rows.map((row) => row.getAttribute("data-row"));
  assert.deepEqual(new Set(slugs), new Set(["survival", "delve", "vigilance"]), "les TROIS, Delve compris — pas deux");
  for (const row of rows) {
    const values = optionValues(row);
    assert.deepEqual(new Set(values), new Set(["novice", "adept"]), "palier LIBRE — jamais un seul ½ forcé (bug v1)");
  }
});

/* ══ 5 — UN PLAN NON RÉPONDU SE VOIT ══════════════════════════════════════ */

test("un plan non répondu (answered < expected) se voit, et le dit — sur Class ET Species", () => {
  /* ⚠️ L'ESPÈCE TÉMOIN A CHANGÉ LE 2026-08-17 : l'Araag n'a plus de plan
     d'espèce du tout (voir le test des états, plus haut). C'est l'Elestu, dont
     la bourse captive est intacte, qui porte désormais la démonstration —
     l'assertion, elle, est la même. */
  const report = rebuild(docWith({ id: "unanswered", classId: "srd:class:en:rogue", speciesId: "fh:species:en:elestu" }));
  const classNode = menu(report.decisions, "class");
  const classNote = classNode.querySelectorAll(".choix-glisse-compte")[0];
  assert.equal(classNote.textContent, "0 of 6 points spent",
    "le Rogue a SIX points liés à placer (2 novices + 1 expert), pas quatre maîtrises à cocher");
  assert.equal(classNode.querySelectorAll(".choix-glisse")[0].getAttribute("data-status"), "pending");

  const speciesNode = menu(report.decisions, "species");
  const speciesNote = speciesNode.querySelectorAll(".skills-budget-note")[0];
  assert.equal(speciesNote.textContent, "0 of 2 points spent");
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

/* ══ LOT 60 — SPECIES SUIT CLASS : LE GESTE A CHANGÉ, PAS LE VERBE ═══════
   Le picker de douze boutons du lot 42 a disparu de Species aussi. « B3 = B2 »,
   donc l'invariant II.1 s'y applique : on défile, le défilement s'aimante, et
   `Validate` confirme la fiche sur laquelle on s'est posé. ⭐ Le `choose` qui
   part est identique, à l'octet, à celui que produisait le clic. */

test("SPECIES — `Validate 1` sur le cran d'aimantation produit LE MÊME `choose` que le clic d'avant", () => {
  const report = rebuild(docWith({ id: "validate-species", classId: "srd:class:en:fighter", speciesId: "fh:species:en:araag" }));
  const options = catalogueOptions(report.decisions, "species");
  const loroka = options.indexOf("fh:species:en:loroka");
  assert.ok(loroka >= 0, "sonde : Loroka est bien dans les options du plan");

  const gate = porte(report.decisions, "species", { palier: 1, cursor: loroka });
  assert.equal(gate.ready, true);
  assert.deepEqual(gate.action,
    { kind: "choose", path: "species", ref: { kind: "species", id: "fh:species:en:loroka" } });
  assert.equal(gate.next, "palier");
});

test("🔴 SPECIES — une espèce qui n'accorde RIEN n'a QU'UN SEUL palier", () => {
  /* Loroka ne publie ni bourse ni QCM. Un 2ᵉ appui sur un menu vide serait un
     geste pour rien — I.4 le prévoit : « un écran peut en compter un, deux ou
     trois ». C'est `exists: false` qui le dit à la coquille, et c'est le seul
     endroit du builder où un palier s'efface. */
  const loroka = rebuild(docWith({
    id: "loroka-1-palier", classId: "srd:class:en:fighter", speciesId: "fh:species:en:loroka",
    classSkills: ["athletics", "history"]
  }));
  assert.equal(speciesPalier2(loroka.decisions), null, "sonde : le carnet ne publie rien pour Loroka");
  assert.equal(porte(loroka.decisions, "species", { palier: 2 }).exists, false);
  assert.equal(menu(loroka.decisions, "species").querySelectorAll(".skills-row").length, 0,
    "et son menu serait vide — c'est exactement ce qu'on refuse d'afficher");
});

test("SPECIES — une espèce à BOURSE a bien un 2ᵉ palier, prêt seulement quand la bourse est dépensée", () => {
  const elestu = rebuild(docWith({
    id: "elestu-palier2", classId: "srd:class:en:fighter", speciesId: "fh:species:en:elestu",
    classSkills: ["athletics", "history"]
  }));
  const gate = porte(elestu.decisions, "species", { palier: 2 });
  assert.equal(gate.exists, true, "la bourse EST le 2ᵉ palier (inféré de « B3 = B2 » — voir speciesPalier2)");
  const plan = elestu.decisions.find((d) => d.path === "species.skillBudget");
  assert.equal(gate.ready, plan.answered >= plan.expected,
    "prêt ou non, la réponse vient du PLAN — jamais d'un compte refait ici");
});

/* ══ LOT 58 — SUR CLASS, LE GESTE A CHANGÉ, PAS LE VERBE ═════════════════
   🔴 « Il n'y a AUCUN geste de sélection » (invariant II.1, tranché par
   Eric le 2026-08-14) : on défile jusqu'à la classe, le défilement
   s'aimante, et `Validate` — l'unique, celui de la barre du haut — confirme
   la fiche sur laquelle on s'est posé.

   ⭐ CE QUE CES TESTS PROUVENT EST EXACTEMENT CE QUE PROUVAIT LE CLIC
   D'AVANT : le `choose` qui part porte le bon `ref`, et il est unique. Le
   verbe du moteur n'a pas bougé d'un octet — c'est le geste qui a changé,
   et c'est tout le sens de II.1. */

test("CLASS — `Validate 1` sur le cran d'aimantation produit LE MÊME `choose` que le clic d'avant", () => {
  const report = rebuild(docWith({ id: "validate-class", classId: "srd:class:en:wizard" }));
  const options = catalogueOptions(report.decisions, "class");
  const rogue = options.indexOf("srd:class:en:rogue");
  assert.ok(rogue >= 0, "sonde : Rogue est bien dans les 12 options du plan");

  const gate = porte(report.decisions, "class", { palier: 1, cursor: rogue });
  assert.equal(gate.ready, true, "une fiche est toujours sous le doigt : un choix est toujours possible (B2.4)");
  assert.deepEqual(gate.action, { kind: "choose", path: "class", ref: { kind: "class", id: "srd:class:en:rogue" } },
    "l'action est identique, à l'octet, à celle que produisait le clic du lot 42");
  assert.equal(gate.next, "palier", "le 1ᵉʳ appui NE change pas d'étape : il ouvre le menu des choix (B2.2)");
});

test("CLASS — le curseur d'arrivée est la classe DÉJÀ posée, jamais la première de la liste", () => {
  /* Arriver sur l'écran doit montrer où on en est. Un curseur qui repartait
     de zéro ferait confirmer Barbarian à un magicien qui pousse Validate
     sans regarder — un choix silencieusement écrasé. */
  const report = rebuild(docWith({ id: "cursor-arrival", classId: "srd:class:en:rogue" }));
  const options = catalogueOptions(report.decisions, "class");
  assert.equal(options[catalogueCursor(report.decisions, "class")], "srd:class:en:rogue");
});

test("CLASS — le rail suit le curseur, et un seul cran est courant à la fois (II.3)", () => {
  const report = rebuild(docWith({ id: "rail", classId: "srd:class:en:wizard" }));
  const rail = renderCatalogueRail(ctxDe(report.decisions, "class", 4));
  const items = rail.querySelectorAll(".catalogue-rail-item");
  assert.equal(items.length, 12, "les douze classes, dans l'ordre du plan");
  const courants = items.filter((li) => li.getAttribute("aria-current") === "true");
  assert.equal(courants.length, 1, "un seul cran courant — jamais deux, jamais zéro");
  assert.equal(courants[0].getAttribute("data-value"), catalogueOptions(report.decisions, "class")[4],
    "et c'est le MÊME tableau d'options que les fiches : l'icône surlignée et la fiche validée ne peuvent pas diverger");
});

test("CLASS — la fiche du curseur et l'action de Validate désignent le même record, par construction", () => {
  /* ⭐ C'EST L'INVARIANT II.3 RENDU MESURABLE : « l'icône surlignée à gauche
     et la fiche validée sont la même chose par construction ». Le test le
     vérifie en croisant les DEUX chemins — le DOM rendu et la porte de
     Validate — sur le même curseur. */
  const report = rebuild(docWith({ id: "spy-selector", classId: "srd:class:en:wizard" }));
  const cursor = 7;
  const node = fiches(report.decisions, "class", cursor);
  const cards = node.querySelectorAll("[data-snap]");
  const gate = porte(report.decisions, "class", { palier: 1, cursor });
  assert.equal(cards[cursor].getAttribute("data-value"), gate.action.ref.id);
});

test("CLASS — `Validate 2` n'est prêt QUE quand le plan dit que les choix sont faits", () => {
  /* « Validate 2 = features choisis » (B2.4). Le compte vient du plan, jamais
     d'un recomptage ici — même loi que le QCM lui-même. */
  const rogueVide = rebuild(docWith({ id: "v2-pending", classId: "srd:class:en:rogue" }));
  assert.equal(porte(rogueVide.decisions, "class", { palier: 2 }).ready, false,
    "0 point sur 6 : le palier n'est pas prêt");

  /* ⭐ SIX POINTS, TROIS COMPÉTENCES — 2 novices (1 chacun) + 1 expert (4).
     C'est la répartition que le canon écrit pour le Rogue, et elle montre au
     passage pourquoi le compte est en POINTS : trois placements valent six. */
  const budgetPlein = { acrobatics: "novice", athletics: "novice", stealth: "expert" };

  /* 🔴 RÉVISÉ LE 2026-08-20 — LES POINTS SEULS NE SUFFISENT PLUS. Le Roublard
     porte Weapon Mastery au niveau 1 : 6 points sur 6 mais 0 maîtrise sur 2,
     et le palier doit REFUSER. C'est la moitié neuve de ce garde, et elle vaut
     mieux que l'ancienne — elle prouve que le palier compte TOUS les plans
     publiés, pas ceux qu'il connaissait quand il a été écrit. */
  const rogueSansMaitrise = rebuild(docWith({
    id: "v2-no-mastery", classId: "srd:class:en:rogue", classBudget: budgetPlein
  }));
  assert.equal(porte(rogueSansMaitrise.decisions, "class", { palier: 2 }).ready, false,
    "6/6 points mais 0/2 maîtrise : le palier n'est pas prêt");

  const roguePlein = rebuild(docWith({
    id: "v2-ready", classId: "srd:class:en:rogue", classBudget: budgetPlein,
    masteries: ["srd:weapon:en:dagger", "srd:weapon:en:shortsword"]
  }));
  const plan = roguePlein.decisions.find((d) => d.path === "class.skillBudget");
  assert.equal(plan.answered, plan.expected, "sonde : le plan lui-même dit que le compte y est");
  const maitrises = roguePlein.decisions.find((d) => d.path === "class.weaponMastery");
  assert.equal(maitrises.answered, maitrises.expected, "sonde : les deux maîtrises sont posées");
  assert.equal(maitrises.options.length, 19, "et le vivier du Roublard est bien celui du SRD");
  const gate = porte(roguePlein.decisions, "class", { palier: 2 });
  assert.equal(gate.ready, true);
  assert.equal(gate.action, null, "le 2ᵉ appui ne pose AUCUN verbe : les choix sont déjà écrits, il ne fait qu'avancer");
  assert.equal(gate.next, "step");
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
        { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" }, label: "Magicien" },
        { path: "species", ref: { kind: "species", id: "srd:species:en:human" }, label: "Humain" },
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

  const srdQuery = srdHarness.layers.verbs.query;
  const classNode = renderCatalogueCards({ ...ctxDe(report.decisions, "class"), query: srdQuery }, renderClassCardBody);
  assert.equal(classNode.querySelectorAll("[data-snap]").length, 12, "les douze fiches de classe s'affichent quand même");
  /* ⭐ MESURE DU LOT 58, ET ELLE NE POUVAIT PAS EXISTER AVANT : la ligne
     « Skill pool » d'une fiche vient de `data.fh_skill_pool.base`, que SEULE
     la couche FH pose. Sur un personnage SRD pur, elle ne s'affiche pas —
     jamais un zéro inventé pour remplir la ligne. C'est la question §0.12
     posée à un écran neuf : « un personnage SRD pur le traverse-t-il de bout
     en bout ? » Oui, et il y perd exactement ce que FH lui donnait. */
  /* ⭐ LOT 77 — LA MESURE S'EST DÉDOUBLÉE, ET C'EST TOUT L'INTÉRÊT. La fiche
     à 360 (lignes compressées + blurb + image) vient ENTIÈREMENT de
     `fh-fiche-en` : sans cette couche, elle n'existe pas, et l'écran servirait
     douze dalles vides. `renderClassCardBody` retombe donc sur le corps SRD
     d'avant le lot 77 — c'est la loi §0.12 (« un personnage SRD pur
     traverse-t-il l'écran de bout en bout ? ») rendue exécutable, et pas un
     repli décoratif. Les deux moitiés se vérifient ici : aucune trace de la
     fiche FH, et les lignes SRD bien présentes. */
  assert.equal(classNode.querySelectorAll(".fiche-blurb").length, 0,
    "aucun blurb sans la couche qui le porte — le blurb est du contenu Fate's Hand");
  assert.equal(classNode.querySelectorAll(".fiche-stat-row").length, 0,
    "aucune ligne de fiche compressée sans sa couche");
  const libelles = classNode.querySelectorAll(".catalogue-card-row dt").map((dt) => dt.textContent);
  assert.equal(libelles.includes("Skill pool"), false, "aucune ligne de pool sans la couche qui la porte");
  assert.ok(libelles.includes("Points de vie") || libelles.includes("Hit points"), "les lignes SRD, elles, sont bien là");

  const classMenu = renderClassChoices({ decisions: report.decisions, query: srdQuery }, () => {});
  /* ⚠️ LOT 79 — l'écran des compétences a changé de FORME (vivier + créneaux),
     pas de nature : la question posée reste « le choix SRD s'affiche-t-il sans
     la couche FH ? », puisque `skill_choice` est du SRD. */
  /* ⭐ MESURE DU LOT 101 — CE COMPTE ÉTAIT 1, ET LE 3 EST UNE RÉPARATION, PAS
     UNE FUITE. Le magicien SRD nu ne publiait qu'un groupe (les compétences)
     parce que la progression FRANÇAISE nommait ses ressources en français —
     `sorts_mineurs` / `sorts_prepares` — et que `decisions.mjs` REFUSE, à
     juste titre, d'inventer une table `sorts_mineurs → cantrips` (§1c : une
     pile qui ne nomme pas ses clefs ne déclare pas de compte lisible). Le lot
     98 de fh-srd a migré ces 18 clefs de ressource en anglais des deux côtés :
     la progression FR porte désormais `cantrips: 3` et `prepared_spells: 4`,
     et les deux plans de sorts s'ouvrent enfin EN FRANÇAIS. Trois groupes :
     compétences, sorts mineurs, sorts préparés. ⛔ Le commentaire du lot 72
     qui annonce « la progression FR porte `sorts_mineurs` » décrit donc un
     état RÉVOLU — il disait vrai le jour où il a été écrit. */
  assert.equal(classMenu.querySelectorAll(".choix-glisse").length, 3,
    "compétences + sorts mineurs + sorts préparés — les trois sont du SRD, et le français sait enfin les compter (lot 98)");
  assert.equal(classMenu.querySelectorAll(".skills-budget-block").length, 0,
    "et toujours aucun QCM de budget de compétences : celui-là, c'est bien la couche Fate's Hand qui le pose");

  /* LOT 60 — le picker d'espèce a disparu comme celui de Class : ce sont les
     fiches aimantées qui portent la liste. */
  const speciesCards = renderCatalogueCards({ ...ctxDe(report.decisions, "species"), query: srdQuery }, renderSpeciesCardBody);
  assert.ok(speciesCards.querySelectorAll("[data-snap]").length > 0, "les fiches d'espèce s'affichent quand même");
  const libellesEspece = speciesCards.querySelectorAll(".catalogue-card-row dt").map((dt) => dt.textContent);
  assert.equal(libellesEspece.includes("Destiny"), false, "aucune ligne de Destinée sans la couche qui la porte");
  assert.ok(libellesEspece.includes("Taille") || libellesEspece.includes("Size"), "les lignes SRD, elles, sont bien là");

  const speciesNode = renderSpeciesChoices({ decisions: report.decisions, query: srdQuery }, () => {});
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

/* 🔴 RÉÉCRIT LE 2026-08-20 — MÊME MESURE, AUTRE SYSTÈME. Le document du lot
   42/43 posait `class.skills[0] = arcana` (hors liste du Rogue) et
   `class.skills[1] = investigation` (dedans). Depuis la bascule, la classe
   dépense des POINTS LIÉS : la même situation s'écrit avec un point posé sur
   une compétence que le Rogue n'offre pas, et un autre sur une qu'il offre.
   ⭐ CE QUE LA CONFIRMATION GARDE N'A PAS BOUGÉ D'UN MOT : un choix devenu
   illégal ne s'efface JAMAIS en silence — on le NOMME, et on demande. */
function rogueAvecArcaneInvalide() {
  return rebuild(docWith({
    id: "rogue-confirm", classId: "srd:class:en:rogue",
    classBudget: { arcana: "novice", investigation: "novice" }
  }));
}

test("un créneau `class.skills[n]` verrouillé (`decision.option-unavailable`) fait apparaître LA confirmation, nommant le don perdu", () => {
  const report = rogueAvecArcaneInvalide();
  const decisions = report.decisions;
  const slot0 = decisions.find((d) => d.path === "class.skillBudget.arcana");
  assert.equal(slot0.status, "locked");
  assert.match(slot0.lock.key, /option-unavailable$/,
    "une bourse refuse par `skill-budget.option-unavailable`, un QCM par `decision.…` — l'écran accepte les deux");
  assert.equal(slot0.lock.params.selected, "arcana", "sonde : c'est bien ce nom que la confirmation doit citer");

  const node = menu(decisions, "class");
  const dialog = node.querySelectorAll(".confirm-dialog")[0];
  assert.ok(dialog, "la confirmation s'affiche — le carnet a désigné un créneau à perdre");
  const items = dialog.querySelectorAll(".confirm-dialog-items li").map((li) => li.textContent);
  /* ✅ L'ÉCART EST REFERMÉ — 2026-08-20, et ce test en garde la trace parce
     qu'il l'avait DOCUMENTÉ sans le corriger. `skillLabel` cherchait
     `query({kind:"skill", id})` avec le SLUG brut (« arcana ») alors que le
     catalogue indexe par identifiant COMPLET (« srd:skill:en:arcana ») : la
     recherche échouait TOUJOURS et retombait sur le slug. La bourse l'a rendu
     visible en grand — douze récepteurs affichaient « sleight-of-han » — et il
     a été réparé en CHERCHANT dans le catalogue plutôt qu'en devinant un
     préfixe (« stealth » est au SRD, « delve » est maison).
     ⭐ Le nom vient toujours du RECORD, recopié : ce qui change est qu'on le
     trouve. */
  assert.deepEqual(items, ["Arcana"], "la confirmation NOMME la compétence perdue — son nom, plus son slug");
});

test("« Confirm » efface EXACTEMENT les créneaux verrouillés, et EUX SEULS — jamais le créneau valide, jamais un futur créneau vide", () => {
  const report = rogueAvecArcaneInvalide();
  const calls = [];
  const node = menu(report.decisions, "class", (a) => calls.push(a));
  node.querySelectorAll(".confirm-dialog-confirm")[0].click();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { kind: "resetSkills", paths: ["class.skillBudget.arcana"] },
    "SEUL le point verrouillé (arcana) part — pas celui d'investigation, qui est valide, et pas un créneau vide");

  /* Et l'EFFET RÉEL, joué avec les vrais verbes (même geste que
     `resetSkills` dans `shell.mjs`) : le créneau fautif disparaît du
     carnet (`clear` retire le choix, il ne le remplace pas — le prochain
     `rebuild` republie un slot neuf à un AUTRE index, §3e-bis de la
     commande du lot 43), et le créneau valide n'a pas bougé. */
  let document = report.document;
  for (const path of calls[0].paths) document = build.verbs.clear({ document, path, kind: "choice" }).document;
  const after = rebuild(document);
  /* ⭐ UNE BOURSE N'A PAS DE CRÉNEAUX INDEXÉS : ses points vivent sur
     `class.skillBudget.<slug>`, un par compétence touchée. Le §3e-bis du lot 43
     (« exactement `expected` créneaux, pas un de plus ») parlait d'un QCM à
     index ; ici la question devient plus simple et plus forte — le point fautif
     n'existe plus, le valide n'a pas bougé, et le COMPTE DE POINTS retombe à ce
     qui reste posé. */
  assert.equal(after.decisions.some((d) => d.path === "class.skillBudget.arcana"), false,
    "« arcana » n'est plus posé nulle part");
  const valide = after.decisions.find((d) => d.path === "class.skillBudget.investigation");
  assert.deepEqual(valide.selected, ["novice"], "le point valide n'a JAMAIS été touché — même compétence, même palier");
  const groupAfter = after.decisions.find((d) => d.path === "class.skillBudget");
  assert.equal(groupAfter.answered, 1, "il reste UN point posé sur les six — celui qui était légal");
});

test("⚔️ « Cancel » NE TOUCHE RIEN — aucun `onAction` n'est appelé, le document reste identique à l'octet", () => {
  const report = rogueAvecArcaneInvalide();
  const before = JSON.stringify(report.document);
  const calls = [];
  const node = menu(report.decisions, "class", (a) => calls.push(a));
  node.querySelectorAll(".confirm-dialog-cancel")[0].click();
  assert.deepEqual(calls, [], "aucun verbe n'est parti — Annuler ne connaît aucun geste de document");
  assert.equal(JSON.stringify(report.document), before, "le document, jamais réassigné, est identique octet pour octet");
});

test("sans créneau verrouillé (le personnage d'exemple, une classe jamais changée) : aucune confirmation ne s'affiche", () => {
  const report = rebuild(fixture.document);
  const node = menu(report.decisions, "class");
  assert.equal(node.querySelectorAll(".confirm-dialog").length, 0);
});
