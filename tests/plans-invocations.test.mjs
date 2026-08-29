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
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDocWriters } from "../src/doc/writers.mjs";

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

test("la porte du parcours porte un MOT, jamais le chemin brut", async () => {
  /* 🔴 VU À L'ÉCRAN LE JOUR MÊME : la porte affichait « class.invocations » —
     le chemin, pas un nom. `itemLabel` est une table par chemin : tout nouveau
     plan qui n'y entre pas ressort en jargon moteur devant le joueur. */
  const { createTestDocument } = await import("./dom-stub.mjs");
  if (!globalThis.document) globalThis.document = createTestDocument();
  const { CLASS_CATALOGUE } = await import("../ui/builder/class-step.mjs");
  assert.equal(CLASS_CATALOGUE.itemLabel("class.invocations"), "Eldritch invocations",
    "la porte des invocations affiche son chemin : nommer le plan dans itemLabel.");
});

test("l'info d'une invocation parle le contrat du popup — titre/texte, jamais title/body", async () => {
  /* 🔴 MESURÉ LE 30/08, SUR LE DOIGT D'ERIC : « eldritch invocations pas
     cliquables ». Le tap au doigt EST l'info (la seule chose qu'un tap fait
     sur cet écran) — et `invocationInfo` rendait `title`/`body` là où le
     popup lit `titre`/`texte` : il s'ouvrait VIDE, donc invisible, et l'écran
     entier semblait mort. Un contrat se copie de `spellInfo`, il ne se
     réinvente pas en anglais. */
  const { createTestDocument } = await import("./dom-stub.mjs");
  if (!globalThis.document) globalThis.document = createTestDocument();
  const { invocationInfo } = await import("../ui/builder/class-step.mjs");
  const info = invocationInfo(query, "srd:class-option:en:pact-of-the-tome");
  assert.ok(info && typeof info.titre === "string" && info.titre.length > 0,
    "le popup n'a pas de `titre` : il s'ouvre sans nom.");
  assert.ok(typeof info.texte === "string" && info.texte.length > 0,
    "le popup n'a pas de `texte` : il s'ouvre vide — l'écran semble mort au tap.");
  assert.equal(info.title, undefined, "clef anglaise `title` : le popup ne la lit pas.");
  assert.equal(info.body, undefined, "clef anglaise `body` : le popup ne la lit pas.");
});

test("un document qui porte une invocation peut encore être SIGNÉ", () => {
  /* 🔴 LE DÉFAUT LE PLUS SOURNOIS DU LOT — Eric, 30/08 : « drop marche mais
     quand j'appuie sur Done, lumière pas allumée ». La POSE passait (le
     `choose` ne revalide pas le document entier), mais `confirm` le revalide —
     et l'enum `$defs/kind` du SCHÉMA ne connaissait pas `class-option` : le
     registre du moteur l'avait (genre 20, lot 101), le schéma avait pris du
     retard. Dès qu'une invocation était posée, TOUTE signature échouait dans
     un try/catch silencieux : plus aucune lumière, fiche bloquée.
     ⭐ Le test passe par les VRAIS écrivains et le VRAI schéma — c'est le
     chemin qui a menti, c'est lui qu'on tient. */
  const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, "schemas", "fh-char.schema.json"), "utf8"));
  const w = createDocWriters({ schema });
  const doc = {
    schema: "fh-char/1", id: "sig", name: "sig", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/plans-invocations", version: "1.0.0" },
    created: "2026-08-14T00:00:00Z", modified: "2026-08-14T00:00:00Z",
    build: { layers: [], choices: [
      { path: "level", value: 1 },
      { path: "class", ref: { kind: "class", id: WARLOCK } },
      { path: "class.invocations[0]",
        ref: { kind: "class-option", id: "srd:class-option:en:armor-of-shadows" } }
    ], budgets: {}, overrides: [] }
  };
  const out = w.confirm({ document: doc, path: "class.invocations" });
  assert.deepEqual(out.build.confirmed, ["class.invocations"],
    "la signature n'a pas pris : le schéma refuse probablement un ref.kind " +
    "que le moteur accepte — les deux registres ont divergé.");
});

test("le bilan de l'item affiche l'invocation choisie, liée au livre à l'ancre près", async () => {
  /* Eric, 30/08 : « display dans le résumé de fin et lien vers les eldritch
     invocations choisies ». La cible est l'ancre `opt-<nom>` de la page
     Warlock — celle que le générateur fabrique pour nous. */
  const { createTestDocument } = await import("./dom-stub.mjs");
  if (!globalThis.document) globalThis.document = createTestDocument();
  const { CLASS_CATALOGUE } = await import("../ui/builder/class-step.mjs");
  const out = rebuild(docWith({ extra: [{ path: "class.invocations[0]",
    ref: { kind: "class-option", id: "srd:class-option:en:pact-of-the-tome" } }] }));
  const ctx = { decisions: out.decisions, query, document: docWith({}) };
  const noeud = CLASS_CATALOGUE.resumeItem({ path: "class.invocations", confirme: true }, ctx, () => {});
  assert.ok(noeud, "aucune ligne de bilan pour l'invocation choisie.");
  const lien = noeud.querySelector("a.bilan-nom");
  assert.ok(lien, "le nom choisi n'est pas un lien.");
  assert.equal(lien.textContent, "Pact of the Tome");
  /* `.href` en PROPRIÉTÉ : le stub DOM ne la reflète pas dans getAttribute. */
  assert.match(String(lien.href), /chapters\/classes\/warlock\/#opt-pact-of-the-tome$/,
    "le lien ne mène pas à l'ancre opt-<nom> de la page Warlock.");
});

test("au bilan, un sort choisi est un LIEN vers le site — cantrips compris", async () => {
  /* ⚖️ La loi-mère du 30/08 : « dès qu'un spell apparaît, lien vers le site
     FH web » + « cantrips = spells ». Avant : un bouton vers la FF interne. */
  const { createTestDocument } = await import("./dom-stub.mjs");
  if (!globalThis.document) globalThis.document = createTestDocument();
  const { CLASS_CATALOGUE } = await import("../ui/builder/class-step.mjs");
  const out = rebuild(docWith({ extra: [
    { path: "class.cantrips[0]", ref: { kind: "spell", id: "srd:spell:en:eldritch-blast" } }
  ] }));
  const ctx = { decisions: out.decisions, query, document: docWith({}) };
  const noeud = CLASS_CATALOGUE.resumeItem({ path: "class.cantrips", confirme: true }, ctx, () => {});
  const lien = noeud && noeud.querySelector("a.bilan-nom");
  assert.ok(lien, "le cantrip du bilan n'est pas un lien.");
  assert.match(String(lien.href), /chapters\/spells\/#spell-eldritch-blast$/,
    "le lien ne mène pas à l'ancre spell-<slug> du chapitre des sorts.");
});
