/* ══ LOT 360 — LES PORTES DES CHOIX QUE LE BUILDER TAISAIT ═══════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 360 choix tus.md` (ARCHI 35, 29/09).
   Le relevé (points 1-3 et 7-9) : en SRD, Gnome, Dragonborn et Goliath
   décrivaient leur lignée sans l'offrir ; Cleric, Druid et Fighter rangeaient
   Divine Order, Primal Order et Fighting Style dans « Granted automatically ».
   Cause commune : la couche ne DÉCLARAIT pas le choix. `srfh-mecaniques-en` le
   déclare (`data[lineages]`, `data[feature_choices]`), le carnet publie le plan,
   l'étape ouvre la porte, et la fiche nomme la réponse.
   ⛔ Q1 d'ARCHI 35 : on ÉCRIT et on MONTRE, sans appliquer les effets (armures,
   armes, bonus, le cantrip de plus de Thaumaturge / Magician) — un lot sur
   `derive`. La garde du texte vit dans `choix-du-niveau-1.test.mjs`. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createTestDocument } from "./dom-stub.mjs";
import { ROOT, makeHarness, manifestOf, uneCouche, PILE_SRD } from "./build-harness.mjs";
import { stripComments } from "./source-scan.mjs";
import { FR_BUILD } from "../src/labels.mjs";

globalThis.document = createTestDocument();
const { PILE } = await import("../src/tools/exemple-fh-en.mjs");
const { itemsDeLEtape } = await import("../ui/builder/parcours.mjs");
const { CLASS_CATALOGUE, LIGNE_ACQUIS_CLASSE, renderClassChoices, classPalier2, capacitesChoisies } =
  await import("../ui/builder/class-step.mjs");
const { SPECIES_CATALOGUE, LIGNE_ACQUIS, lignageChoisi } = await import("../ui/builder/species-step.mjs");
const { etapeFaite } = await import("../ui/builder/review-step.mjs");
const { renderFicheTemporaire } = await import("../ui/builder/fiche-temporaire.mjs");

const PILES = { SRD: makeHarness({ layers: PILE_SRD }), FH: makeHarness({ layers: PILE }) };
const cls = (s) => `srd:class:en:${s}`;
const esp = (s) => `srd:species:en:${s}`;

function docDe(h, choices) {
  return {
    schema: "fh-char/1", id: "portes-360", name: "Portes 360", lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-29T00:00:00Z", modified: "2026-09-29T00:00:00Z",
    build: { layers: manifestOf(h.layers), choices: [{ path: "level", value: 1 }, ...choices], budgets: {}, overrides: [], confirmed: [] }
  };
}
const decisionsDe = (h, choices) => h.verbs.decisions({ document: docDe(h, choices) }).decisions || [];
const plan = (decisions, chemin) => decisions.find((p) => p.path === chemin) || null;
const ctxDe = (h, decisions, kind) => ({
  decisions, query: h.layers.verbs.query, path: kind, kind, label: kind, cursor: 0
});
/** Une option-record se pose en `ref` (l'id dit son genre), une option-valeur en `value`. */
function reponse(h, chemin, option) {
  const genre = option.split(":")[1];
  const record = genre && (h.layers.verbs.query({ kind: genre }) || []).some((v) => v.id === option);
  return record ? { path: chemin, ref: { kind: genre, id: option } } : { path: chemin, value: option };
}
/** RÉPOND À TOUT sous la racine — chaque créneau reçoit une option différente — sauf `sauf`. */
function repondreATout(h, choices, racine, sauf) {
  let tous = [...choices];
  for (let tour = 0; tour < 4; tour += 1) {
    const ouverts = decisionsDe(h, tous).filter((p) => /\[\d+\]$/.test(p.path) && p.path.startsWith(`${racine}.`) &&
      !(sauf && p.path.startsWith(sauf)) && p.answered < 1 && Array.isArray(p.options) && p.options.length > 0);
    if (ouverts.length === 0) break;
    tous = [...tous, ...ouverts.map((p) => reponse(h, p.path, p.options[Number(/\[(\d+)\]$/.exec(p.path)[1]) % p.options.length]))];
  }
  return tous;
}
const texteDe = (noeud) => (noeud ? noeud.textContent : "");

/* ══════════════════════════════════════════════════════════════════════════ */

test("1 — ⭐ le carnet publie Divine Order, Primal Order et Fighting Style, avec les options de la couche, dans les deux piles", () => {
  for (const [nom, h] of Object.entries(PILES)) {
    const styles = (h.layers.verbs.query({ kind: "feat" }) || [])
      .filter((v) => (v.record.data || {}).category === "fighting-style").map((v) => v.id).sort();
    assert.equal(styles.length, 4, `${nom} : les quatre dons de style du SRD`);
    const attendus = {
      cleric: { chemin: "class.divine-order", options: ["protector", "thaumaturge"] },
      druid: { chemin: "class.primal-order", options: ["magician", "warden"] },
      fighter: { chemin: "class.fighting-style", options: styles }
    };
    for (const [classe, { chemin, options }] of Object.entries(attendus)) {
      const p = plan(decisionsDe(h, [{ path: "class", ref: { kind: "class", id: cls(classe) } }]), chemin);
      assert.ok(p, `${nom} ${classe} : aucun plan « ${chemin} »`);
      assert.deepEqual([...p.options].sort(), options, `${nom} ${classe} : les options de la couche, ni plus ni moins`);
      assert.equal(p.expected, 1);
      assert.equal(p.provenance.field, `feature_choices.${chemin.slice("class.".length)}`);
    }
    const magicien = decisionsDe(h, [{ path: "class", ref: { kind: "class", id: cls("wizard") } }]);
    assert.equal(magicien.filter((p) => String(p.provenance && p.provenance.field).startsWith("feature_choices.")).length, 0,
      `${nom} : une classe qui ne déclare rien ne reçoit aucun plan`);
  }
});

test("2 — une réponse se relit ; une option hors liste est refusée ; deux réponses pour une seule : le verrou a son mot", () => {
  const h = PILES.SRD;
  const druide = { path: "class", ref: { kind: "class", id: cls("druid") } };
  const bon = plan(decisionsDe(h, [druide, { path: "class.primal-order[0]", value: "warden" }]), "class.primal-order");
  assert.deepEqual(bon.selected, ["warden"]);
  assert.equal(bon.answered, 1);
  assert.equal(bon.lock || null, null);
  const faux = plan(decisionsDe(h, [druide, { path: "class.primal-order[0]", value: "archer" }]), "class.primal-order");
  assert.equal(faux.lock && faux.lock.key, "decision.option-unavailable");
  const deux = plan(decisionsDe(h, [druide, { path: "class.primal-order[0]", value: "warden" },
    { path: "class.primal-order[1]", value: "magician" }]), "class.primal-order");
  assert.equal(deux.lock && deux.lock.key, "feature-choice.count-mismatch", "le compte de la déclaration tient");
  const mot = FR_BUILD["feature-choice.count-mismatch"];
  assert.equal(typeof mot, "function", "un verrou neuf a son mot (src/labels.mjs)");
  assert.match(mot({ root: "Primal Order", declared: 1, actual: 2, answers: "warden, magician" }), /Primal Order.*1.*2/);
  const guerrier = plan(decisionsDe(h, [{ path: "class", ref: { kind: "class", id: cls("fighter") } },
    { path: "class.fighting-style[0]", ref: { kind: "feat", id: "srd:feat:en:archery" } }]), "class.fighting-style");
  assert.deepEqual(guerrier.selected, ["srd:feat:en:archery"], "un don de style se pose par son ref");
});

test("3 — l'étape Class ouvre la porte, la nomme, et la retire de « Granted automatically »", () => {
  for (const [nom, h] of Object.entries(PILES)) {
    const choices = [{ path: "class", ref: { kind: "class", id: cls("druid") } }];
    const decisions = decisionsDe(h, choices);
    const ctx = ctxDe(h, decisions, "class");
    const portes = itemsDeLEtape({ decisions, document: docDe(h, choices), racine: "class" }).map((i) => i.path);
    assert.ok(portes.includes("class.primal-order"), `${nom} : Primal Order n'a pas de porte (${portes.join(", ")})`);
    assert.equal(CLASS_CATALOGUE.itemLabel("class.primal-order", ctx), "Primal Order", "la porte porte le nom de la capacité");
    assert.match(CLASS_CATALOGUE.itemAiguilleur("class.primal-order", ctx), /drag one into the slot/);
    const bloc = texteDe(renderClassChoices(ctx, () => {}, "class.primal-order"));
    for (const mot of ["Primal Order", "Magician", "Warden"]) assert.ok(bloc.includes(mot), `${nom} : « ${mot} » absent de la porte`);
    const acquis = texteDe(CLASS_CATALOGUE.resumeItem({ path: LIGNE_ACQUIS_CLASSE.path }, ctx, () => {}));
    assert.ok(acquis.includes("Druidic"), `${nom} : les capacités sans choix restent acquises`);
    assert.ok(!acquis.includes("Primal Order"), `${nom} : ⛔ une capacité qui a sa porte n'est plus « acquise »`);
  }
});

test("4 — le Guerrier choisit un DON de style : ses jetons sont les records, nommés par leur nom", () => {
  const h = PILES.SRD;
  const decisions = decisionsDe(h, [{ path: "class", ref: { kind: "class", id: cls("fighter") } }]);
  const bloc = texteDe(renderClassChoices(ctxDe(h, decisions, "class"), () => {}, "class.fighting-style"));
  for (const mot of ["Fighting Style", "Archery", "Defense", "Great Weapon Fighting", "Two-Weapon Fighting"]) {
    assert.ok(bloc.includes(mot), `« ${mot} » absent`);
  }
  assert.ok(!bloc.includes("srd:feat:en:"), "⛔ jamais un id nu");
});

test("5 — la fiche nomme la réponse : « Primal Order: Warden », « Fighting Style: Archery »", () => {
  const h = PILES.SRD;
  const druide = decisionsDe(h, [{ path: "class", ref: { kind: "class", id: cls("druid") } }, { path: "class.primal-order[0]", value: "warden" }]);
  assert.deepEqual(capacitesChoisies(ctxDe(h, druide, "class")), [{ name: "Primal Order: Warden", source: "Druid" }]);
  const guerrier = decisionsDe(h, [{ path: "class", ref: { kind: "class", id: cls("fighter") } },
    { path: "class.fighting-style[0]", ref: { kind: "feat", id: "srd:feat:en:archery" } }]);
  const choix = capacitesChoisies(ctxDe(h, guerrier, "class"));
  assert.deepEqual(choix, [{ name: "Fighting Style: Archery", source: "Fighter" }]);
  assert.deepEqual(capacitesChoisies(ctxDe(h, decisionsDe(h, [{ path: "class", ref: { kind: "class", id: cls("druid") } }]), "class")), [],
    "rien de posé, rien de nommé");
  const fiche = texteDe(renderFicheTemporaire({ resolved: {}, choix }));
  assert.ok(fiche.includes("Fighting Style: Archery"), "la rubrique Traits and features montre le choix");
});

test("6 — un Clerc sans Divine Order n'a pas fini l'étape Class : ni au Sheet, ni au palier 2", () => {
  const h = PILES.SRD;
  const base = repondreATout(h, [{ path: "class", ref: { kind: "class", id: cls("cleric") } }], "class", "class.divine-order");
  const sans = decisionsDe(h, base);
  assert.equal(plan(sans, "class.divine-order").answered, 0);
  assert.ok(sans.filter((p) => p.path.startsWith("class.") && !p.path.startsWith("class.divine-order"))
    .every((p) => p.answered >= p.expected), "tout le reste est répondu");
  assert.equal(etapeFaite({ decisions: sans, document: docDe(h, base) }, "class"), false, "le Sheet ne dit pas « done »");
  assert.equal(classPalier2(sans).ready, false, "le palier 2 ne s'ouvre pas");
  const avec = [...base, { path: "class.divine-order[0]", value: "protector" }];
  assert.equal(etapeFaite({ decisions: decisionsDe(h, avec), document: docDe(h, avec) }, "class"), true);
  assert.equal(classPalier2(decisionsDe(h, avec)).ready, true);
});

test("7 — ⭐ Gnome, Dragonborn, Goliath en SRD : la porte de lignée, avec les options du texte ; Fate's Hand garde les siennes", () => {
  const COMPTES = { SRD: { gnome: 2, dragonborn: 10, goliath: 6 }, FH: { gnome: 3, dragonborn: 10, goliath: 6 } };
  for (const [nom, h] of Object.entries(PILES)) {
    for (const [espece, n] of Object.entries(COMPTES[nom])) {
      const choices = [{ path: "species", ref: { kind: "species", id: esp(espece) } }];
      const decisions = decisionsDe(h, choices);
      const p = plan(decisions, "species.lineage");
      assert.ok(p, `${nom} ${espece} : aucun plan de lignée`);
      assert.equal(p.options.length, n, `${nom} ${espece} : ${p.options.length} options`);
      const portes = itemsDeLEtape({ decisions, document: docDe(h, choices), racine: "species" }).map((i) => i.path);
      assert.ok(portes.includes("species.lineage"), `${nom} ${espece} : la lignée n'a pas de porte`);
    }
  }
  assert.deepEqual(plan(decisionsDe(PILES.FH, [{ path: "species", ref: { kind: "species", id: esp("gnome") } }]), "species.lineage").options,
    ["forest-folk", "rock-folk", "mole-people"], "en FH, le Hoddon garde ses trois voies (fh-species-en, montée après)");
  const h = PILES.SRD;
  const gnome = [{ path: "species", ref: { kind: "species", id: esp("gnome") } }];
  const ctx = ctxDe(h, decisionsDe(h, gnome), "species");
  const acquis = texteDe(SPECIES_CATALOGUE.resumeItem({ path: LIGNE_ACQUIS.path }, ctx, () => {}));
  assert.ok(!acquis.includes("Gnomish Lineage"), "⛔ la lignée a sa porte : elle n'est plus « Granted automatically »");
  const pose = decisionsDe(h, [...gnome, { path: "species.lineage", value: "forest-gnome" }]);
  assert.equal(lignageChoisi({ decisions: pose, query: h.layers.verbs.query }), "Forest Gnome");
});

test("8 — la coquille tend la pile à la Sheet — sans elle la fiche ne nommait ni la lignée ni la capacité", () => {
  const source = stripComments(fs.readFileSync(path.join(ROOT, "ui/builder/shell.mjs"), "utf8"));
  const debut = source.indexOf("card.append(renderReviewStep({");
  assert.ok(debut >= 0, "l'appel de la Sheet a changé de forme — relis ce garde");
  const appel = source.slice(debut, source.indexOf("}, applyDecisionAction)", debut));
  assert.match(appel, /\bquery:\s*state\.engine\s*\?\s*state\.engine\.layers\.verbs\.query/,
    "la Sheet reçoit la pile montée : `lignageChoisi` et `capacitesChoisies` en ont besoin");
});

test("9 — deux déclarations d'une même classe ne se comptent pas l'une l'autre, même avec un id d'option commun", () => {
  /* Le témoin du durcissement : `multiPlan` compte, sous sa racine, tout choix dont la VALEUR est
     une de ses options. Une seconde déclaration qui offrirait aussi « warden » verrait la réponse
     de Primal Order comme la sienne — sauf à ne lui passer que SES choix. */
  const druide = PILES.SRD.layers.verbs.query({ kind: "class", id: cls("druid") }).record.data.feature_choices;
  const seconde = { id: "second-order", name: "Second Order", level: 1, count: 1,
    options: [{ id: "warden", name: "Warden", text: "Scénario." }, { id: "sage", name: "Sage", text: "Scénario." }] };
  const h = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-360", {
    class: { [cls("druid")]: { op: "patch", changes: { "data[feature_choices]": [...druide, seconde] } } }
  }) });
  const decisions = decisionsDe(h, [{ path: "class", ref: { kind: "class", id: cls("druid") } },
    { path: "class.primal-order[0]", value: "warden" }]);
  assert.equal(plan(decisions, "class.primal-order").answered, 1);
  assert.equal(plan(decisions, "class.second-order").answered, 0, "⛔ la réponse de Primal Order n'est pas celle de Second Order");
  assert.equal(plan(decisions, "class.second-order").lock || null, null);
});
