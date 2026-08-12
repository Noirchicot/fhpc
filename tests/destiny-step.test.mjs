/* ══ LES TESTS DU LOT 45 — L'ÉTAPE DESTINY ════════════════════════════════

   Même patron que `abilities-step.test.mjs`. ⛔ AUCUN plan `decisions[]`
   (mesuré, commande §0) — `ctx` porte `document` (le brut, pour la carte
   déjà posée) et `resolved` (le Score, à l'octet). */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { makeHarness, manifestOf, uneCouche, SRD_EN, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN } from "./build-harness.mjs";
import { createFhDestinyStat, FH_DESTINY_ID } from "../src/modules/fh/destiny-stat.mjs";

globalThis.document = createTestDocument();

const { renderDestinyStep, drawArcana, currentArcanaId, ARCANA_METHODS } = await import("../ui/builder/destiny-step.mjs");

const fixture = exempleFhEn();
const { build } = fixture;
const query = fixture.layers.verbs.query;

function rebuild(document) { return build.verbs.rebuild({ document }); }

function ctxFrom(document, report, extra) {
  return Object.assign({ document, resolved: report.resolved, query, mode: "draw", onModeChange: () => {} }, extra || {});
}

/* ══ 8 — LE SCORE AFFICHÉ EST CELUI DU MOTEUR, À L'OCTET ═════════════════ */

test("le Score affiché est resolved.stats['fh:destiny'].value, tel quel", () => {
  const report = rebuild(fixture.document);
  const node = renderDestinyStep(ctxFrom(report.document, report), () => {});
  const value = node.querySelectorAll(".card-score-value")[0];
  const stat = report.resolved.stats.find((s) => s.id === "fh:destiny");
  assert.ok(stat);
  assert.equal(value.textContent, String(stat.value));
});

test("⚔️ ATTAQUE — un Score menteur (value ≠ somme du détail) s'affiche MENTEUR, jamais recalculé", () => {
  const report = rebuild(fixture.document);
  const menteur = structuredClone(report.resolved);
  const stat = menteur.stats.find((s) => s.id === "fh:destiny");
  const vraieSomme = stat.breakdown.reduce((total, line) => total + line.value, 0);
  stat.value = 9999;
  assert.notEqual(9999, vraieSomme, "9999 n'est pas la somme — sinon l'attaque ne prouve rien");
  const node = renderDestinyStep(ctxFrom(report.document, { resolved: menteur }), () => {});
  const value = node.querySelectorAll(".card-score-value")[0];
  assert.equal(value.textContent, "9999", "l'écran affiche ce que `resolved` dit, jamais l'addition refaite");
});

/* ══ 6 — LES 22 ARCANES VIENNENT DE `query`, JAMAIS UN 22 EN DUR ═════════ */

test("mode choix : les options viennent de query({kind:\"arcana\"}) — 22 sur la pile complète", () => {
  const report = rebuild(fixture.document);
  const node = renderDestinyStep(ctxFrom(report.document, report, { mode: "choice" }), () => {});
  const choiceBlock = node.querySelectorAll('.card-method-block[data-status="active"]')[0];
  const options = choiceBlock.querySelectorAll(".record-option");
  assert.equal(options.length, 22, "les 22 Arcanes, lus sur la pile — pas un chiffre écrit ici");
});

test("un catalogue à 3 cartes (pile réduite) n'en affiche QUE 3 — jamais 22 en dur", () => {
  // Pile SRD + une couche d'Arcanes synthétique à TROIS cartes seulement.
  const troisCartes = uneCouche("scenario-lot45-arcana", {
    arcana: {
      "scenario:arcana:en:un": { op: "add", name: "Un", slug: "un", data: { numeral: "I", meaning: "m", power: "p", vibration: "v", destiny: { impact: 1 } } },
      "scenario:arcana:en:deux": { op: "add", name: "Deux", slug: "deux", data: { numeral: "II", meaning: "m", power: "p", vibration: "v", destiny: { impact: 0 } } },
      "scenario:arcana:en:trois": { op: "add", name: "Trois", slug: "trois", data: { numeral: "III", meaning: "m", power: "p", vibration: "v", destiny: { impact: 2 } } }
    }
  });
  const harness = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN, FH_FEATS_EN], modules: [createFhDestinyStat()], extra: troisCartes });
  const catalog = harness.layers.verbs.query({ kind: "arcana" });
  assert.equal(catalog.length, 3, "sonde : la pile réduite porte bien trois cartes, pas 22");

  const node = renderDestinyStep({
    document: fixture.document, resolved: fixture.report.resolved, query: harness.layers.verbs.query,
    mode: "choice", onModeChange: () => {}
  }, () => {});
  const choiceBlock = node.querySelectorAll('.card-method-block[data-status="active"]')[0];
  assert.equal(choiceBlock.querySelectorAll(".record-option").length, 3, "l'écran suit le catalogue REÇU, jamais un 22 câblé");
});

/* ══ 7 — LA CARTE TIRÉE SE POSE PAR `choose`, ET C'EST CE DOCUMENT-LÀ QUI REPART AU rebuild ══ */

test("mode tirage : cliquer « Draw » pose EXACTEMENT un `choose({path:\"fh.destiny.arcana\", ref})`", () => {
  const catalog = query({ kind: "arcana" });
  const report = rebuild(fixture.document);
  const calls = [];
  // rng fixe : drawArcana(catalog, rng) doit tirer un id du catalogue REÇU.
  const rng = () => 0.5;
  const node = renderDestinyStep(ctxFrom(report.document, report, { rng }), (a) => calls.push(a));
  const drawBtn = node.querySelectorAll(".card-draw-btn")[0];
  assert.ok(drawBtn);
  drawBtn.click();
  assert.equal(calls.length, 1, "exactement un appel");
  assert.equal(calls[0].kind, "choose");
  assert.equal(calls[0].path, "fh.destiny.arcana");
  const expected = drawArcana(catalog, rng);
  assert.deepEqual(calls[0].ref, { kind: "arcana", id: expected.id });

  // ET le document que ce `choose` rend est bien celui qui repart au
  // `rebuild` suivant — même chemin que la fixture montre déjà pour
  // `fh.destiny.arcana` (fh-arcana.test.mjs, ACCEPTATION 1) : on le
  // rejoue ici pour ce lot-ci, sur l'id EFFECTIVEMENT tiré par l'écran.
  const chosen = build.verbs.choose({ document: report.document, path: "fh.destiny.arcana", ref: calls[0].ref }).document;
  const after = rebuild(chosen);
  assert.equal(currentArcanaId(after.document), expected.id);
  const stat = after.resolved.stats.find((s) => s.id === FH_DESTINY_ID);
  assert.ok(stat, "le Score se recalcule bien avec la carte tirée");
});

test("mode choix : cliquer une carte pose le MÊME `choose` que le tirage", () => {
  const report = rebuild(fixture.document);
  const calls = [];
  const node = renderDestinyStep(ctxFrom(report.document, report, { mode: "choice" }), (a) => calls.push(a));
  const choiceBlock = node.querySelectorAll('.card-method-block[data-status="active"]')[0];
  const btn = choiceBlock.querySelectorAll(".record-option")[0];
  const clickedName = btn.textContent;
  btn.click();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].kind, "choose");
  assert.equal(calls[0].path, "fh.destiny.arcana");
  const view = query({ kind: "arcana", id: calls[0].ref.id });
  assert.equal(view.record.name, clickedName);
});

/* ══ La carte montre ses six champs, RECOPIÉS (commande §3b.3) ═══════════ */

test("la carte posée affiche numeral/name/impact/meaning/power/vibration, recopiés du record", () => {
  const report = rebuild(fixture.document);
  const node = renderDestinyStep(ctxFrom(report.document, report), () => {});
  const detail = node.querySelectorAll(".card-detail")[0];
  assert.ok(detail, "une carte est déjà posée sur le personnage d'exemple");
  const view = query({ kind: "arcana", id: currentArcanaId(report.document) });
  assert.match(detail.querySelectorAll("h3")[0].textContent, new RegExp(view.record.data.numeral.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(detail.querySelectorAll("h3")[0].textContent, new RegExp(view.record.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const text = detail.textContent;
  assert.match(text, new RegExp(String(view.record.data.destiny.impact)));
  assert.match(text, new RegExp(view.record.data.meaning.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(text, new RegExp(view.record.data.power.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(text, new RegExp(view.record.data.vibration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

/* ══ 9 (partie Destiny) — LES DEUX MODES EXISTENT, L'INACTIF DIT SON ÉTAT */

test("les deux méthodes existent TOUJOURS ; l'inactive dit son état, ne disparaît pas", () => {
  assert.deepEqual(ARCANA_METHODS.map((m) => m.id), ["draw", "choice"]);
  const report = rebuild(fixture.document);
  const node = renderDestinyStep(ctxFrom(report.document, report, { mode: "draw" }), () => {});
  const blocks = node.querySelectorAll(".card-method-block");
  assert.equal(blocks.length, 2);
  const inactive = blocks.find((b) => b.getAttribute("data-status") === "inactive");
  assert.equal(inactive.getAttribute("data-method"), "choice");
  const summary = inactive.querySelectorAll(".card-mode-summary")[0];
  assert.ok(summary);
  assert.match(summary.textContent, /Not selected/);
});

test("basculer de mode appelle `onModeChange`, JAMAIS un verbe de document — fh.destiny.mode ferait jeter rebuild()", () => {
  // Mesure citée par destiny-step.mjs : `set({path:"fh.destiny.mode", …})`
  // fait ÉCHOUER rebuild() (le namespace fh.destiny.* est strict). Sondé une
  // fois ici pour que la raison du choix reste VÉRIFIÉE, pas seulement écrite.
  assert.throws(() => {
    const doc = build.verbs.set({ document: fixture.document, path: "fh.destiny.mode", value: "draw" }).document;
    rebuild(doc);
  }, /is not a Destiny Score term/);

  const report = rebuild(fixture.document);
  let modeChanges = [];
  const calls = [];
  const node = renderDestinyStep(
    Object.assign(ctxFrom(report.document, report), { onModeChange: (id) => modeChanges.push(id) }),
    (a) => calls.push(a)
  );
  const modeButtons = node.querySelectorAll(".record-option").filter((b) => ["Draw a card", "Choose a card"].includes(b.textContent));
  const choiceBtn = modeButtons.find((b) => b.textContent === "Choose a card");
  choiceBtn.click();
  assert.deepEqual(modeChanges, ["choice"]);
  assert.equal(calls.length, 0, "basculer de mode ne pose AUCUN verbe de document");
});

/* ══ Le garde des jetons — vérifié par la suite complète, pas ici ═══════ */
