/* ══ LES INVOCATIONS OCCULTES — LE PLAN QUI LES DEMANDE ════════════════════

   Eric, 2026-08-29 : *« choix des eldritch invocations sous forme de token pas
   fait »*. Le sorcier-pacte lisait « You gain one invocation of your choice »
   dans son bilan et n'avait aucun écran pour la choisir : les 28 records
   existaient (`class-option`, catégorie `eldritch-invocation`), rien ne les
   demandait.

   ⚠️ CE QUE CES TESTS FIXENT EN PRIORITÉ, C'EST L'ERREUR QUE J'AI FAITE EN
   ROUTE : mon premier filtre de vivier cherchait la chaîne « Level 2 » dans le
   prérequis. Il laissait passer « Level 5+ », « Level 9+ », « Level 15+ » et
   donnait 19 invocations éligibles au niveau 1 au lieu de 5. Le compte était
   plausible, le contenu faux — exactement le défaut qu'un total ne montre
   jamais. Le test nomme donc les CINQ, il ne les compte pas. */

import test from "node:test";
import assert from "node:assert/strict";

import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { manifestOf } from "./build-harness.mjs";

const { layers, build } = exempleFhEn();
const query = layers.verbs.query;
const rebuild = (document) => build.verbs.rebuild({ document });
const WARLOCK = "srd:class:en:warlock";

const BASE_ABILITIES = [
  { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 15 },
  { path: "abilities.con", value: 13 }, { path: "abilities.int", value: 12 },
  { path: "abilities.wis", value: 10 }, { path: "abilities.cha", value: 8 }
];

function docWith({ classId = WARLOCK, level = 1, extra = [] } = {}) {
  return {
    schema: "fh-char/1", id: "invoc", name: "invoc", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/plans-invocations", version: "1.0.0" },
    created: "2026-08-14T00:00:00Z", modified: "2026-08-14T00:00:00Z",
    build: {
      layers: manifestOf(layers),
      choices: [{ path: "level", value: level },
                { path: "class", ref: { kind: "class", id: classId } },
                ...extra, ...BASE_ABILITIES],
      budgets: {}, overrides: []
    }
  };
}

const planDe = (out, chemin) => out.decisions.find((d) => d.path === chemin);
const nomDe = (id) => query({ kind: "class-option", id }).record.name;

test("le Warlock niveau 1 se voit demander UNE invocation, comptée par la progression", () => {
  const plan = planDe(rebuild(docWith()), "class.invocations");
  assert.ok(plan, "aucun plan `class.invocations` : l'écran n'aurait rien à afficher.");
  assert.equal(plan.expected, 1,
    "le compte ne vient pas de `resources.eldritch_invocations` (1 au niveau 1).");
});

test("le vivier de niveau 1 est CES CINQ invocations, nommées", () => {
  const plan = planDe(rebuild(docWith()), "class.invocations");
  assert.deepEqual(plan.options.map(nomDe).sort(), [
    "Armor of Shadows", "Eldritch Mind",
    "Pact of the Blade", "Pact of the Chain", "Pact of the Tome"
  ], "⛔ le filtre de prérequis lit un NOMBRE (« Level N+ »), jamais la " +
     "présence d'un mot : chercher « Level 2 » laisse passer « Level 5+ » et " +
     "en offre 19 au lieu de 5.");
});

test("le compte suit le niveau au lieu d'être figé", () => {
  /* La progression déclare 1 au niveau 1 puis 3 au niveau 2 : c'est ce qui
     interdit le patron `weapon_mastery_count`, posé à plat sur la classe. */
  assert.equal(planDe(rebuild(docWith({ level: 2 })), "class.invocations").expected, 3,
    "le compte reste figé : il n'est pas relu dans la progression du niveau.");
});

test("le vivier s'ouvre avec le niveau — Devil’s Sight n'apparaît qu'au niveau 2", () => {
  const au1 = planDe(rebuild(docWith()), "class.invocations").options.map(nomDe);
  const au2 = planDe(rebuild(docWith({ level: 2 })), "class.invocations").options.map(nomDe);
  assert.equal(au1.includes("Devil’s Sight"), false, "offerte trop tôt (prérequis Level 2+).");
  assert.equal(au2.includes("Devil’s Sight"), true, "toujours pas offerte au niveau 2.");
  assert.equal(au2.includes("Ascendant Step"), false, "Level 5+ offerte au niveau 2.");
});

test("une classe sans invocation ne publie AUCUN plan — jamais un cadre vide", () => {
  const out = rebuild(docWith({ classId: "srd:class:en:wizard" }));
  assert.equal(planDe(out, "class.invocations"), undefined,
    "le Magicien se voit proposer des invocations occultes.");
});

test("une invocation posée est consommée, pas laissée en souffrance", () => {
  const out = rebuild(docWith({ extra: [{ path: "class.invocations[0]",
    ref: { kind: "class-option", id: "srd:class-option:en:pact-of-the-tome" } }] }));
  const plan = planDe(out, "class.invocations");
  assert.equal(plan.answered, 1, "la réponse posée n'est pas comptée.");
  assert.equal((out.unconsumed || []).includes("class.invocations[0]"), false,
    "le choix ressort `unconsumed` : personne ne le consomme en aval.");
});

test("une invocation hors vivier est verrouillée en le disant", () => {
  const out = rebuild(docWith({ extra: [{ path: "class.invocations[0]",
    ref: { kind: "class-option", id: "srd:class-option:en:witch-sight" } }] }));
  const creneau = out.decisions.find((d) => d.path === "class.invocations[0]");
  assert.ok(creneau && creneau.lock,
    "Witch Sight (Level 15+) est acceptée au niveau 1 sans verrou.");
});
