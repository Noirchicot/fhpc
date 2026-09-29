/* ══ LOT 365 (b) — LA LIGNE CLASS DE LA SHEET COMPTE TOUS LES PLANS DE CLASS ════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 365 trois retouches.md` (ARCHI 35, 29/09).

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER — relevé par le lot 360 sur v913 : en SRD, un
   Druid sans compétence de classe voyait la ligne Class de la Sheet dire « done ». Le
   carnet publiait bien `class.skills` (« Choose 2 »), mais `REVIEW_GROUPS` ne listait pas
   ce chemin : seul « The engine refuses » le disait, et la lumière du belt (la même
   table) s'allumait.
   ⭐ LA LISTE, INVERSÉE : la table nomme ses chemins un par un, et une liste par nom ne dit
   jamais qu'il lui en manque un. Ce garde part de l'autre bout — de ce que le CARNET publie
   pour l'étape Class, classe par classe, dans les deux piles — et exige que chaque plan
   sans réponse se lise dans la ligne Class. Un plan neuf demain compte, ou ce garde rougit. */
import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, PILE_SRD } from "./build-harness.mjs";

globalThis.document = createTestDocument();
const { PILE } = await import("../src/tools/exemple-fh-en.mjs");
const { renderReviewStep, etapeFaite } = await import("../ui/builder/review-step.mjs");

const PILES = { SRD: makeHarness({ layers: PILE_SRD }), FH: makeHarness({ layers: PILE }) };
const cls = (s) => `srd:class:en:${s}`;

function docDe(h, choices) {
  return {
    schema: "fh-char/1", id: "sheet-class", name: "Sheet Class", lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-29T00:00:00Z", modified: "2026-09-29T00:00:00Z",
    build: { layers: manifestOf(h.layers), choices: [{ path: "level", value: 1 }, ...choices], budgets: {}, overrides: [], confirmed: [] }
  };
}
const decisionsDe = (h, choices) => h.verbs.decisions({ document: docDe(h, choices) }).decisions || [];
/** Une option-record se pose en `ref` (l'id dit son genre), une option-valeur en `value`. */
function reponse(h, chemin, option) {
  const genre = option.split(":")[1];
  const record = genre && (h.layers.verbs.query({ kind: genre }) || []).some((v) => v.id === option);
  return record ? { path: chemin, ref: { kind: genre, id: option } } : { path: chemin, value: option };
}
/** RÉPOND À TOUT sous la racine — chaque créneau reçoit une option différente — sauf `sauf`
 *  (le patron de `portes-360.test.mjs`). */
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
/** La ligne Class de la Sheet, telle que l'écran la rend. */
function ligneClass(h, choices) {
  const decisions = decisionsDe(h, choices);
  const sheet = renderReviewStep({ decisions, document: docDe(h, choices), resolved: {}, violations: [] }, () => {});
  const ligne = sheet.querySelectorAll(".review-line").find((l) => l.dataset.step === "class");
  assert.ok(ligne, "témoin : la Sheet a une ligne Class");
  return { fait: ligne.dataset.done === "true", mots: ligne.querySelectorAll(".review-line-state")[0].textContent.split(" · ") };
}

test("(b) ⛔ un Druid SRD sans compétence de classe : la ligne Class dit le manque, et le belt ne s'allume pas", () => {
  const h = PILES.SRD;
  const sans = repondreATout(h, [{ path: "class", ref: { kind: "class", id: cls("druid") } }], "class", "class.skills");
  const decisions = decisionsDe(h, sans);
  assert.equal(decisions.find((p) => p.path === "class.skills").answered, 0, "témoin : aucune compétence de classe posée");
  assert.ok(decisions.filter((p) => p.path.startsWith("class.") && !p.path.startsWith("class.skills") && !/\[\d+\]$/.test(p.path))
    .every((p) => p.answered >= p.expected), "témoin : tout le reste de Class est répondu");
  const ligne = ligneClass(h, sans);
  assert.equal(ligne.fait, false, "la ligne Class ne dit pas « done »");
  assert.ok(ligne.mots.includes("0 of 2"), `la ligne Class dit ce qui manque (« 0 of 2 ») — elle dit : ${ligne.mots.join(" · ")}`);
  assert.equal(etapeFaite({ decisions, document: docDe(h, sans) }, "class"), false, "la lumière du belt ne s'allume pas");
  const avec = repondreATout(h, sans, "class");
  assert.equal(ligneClass(h, avec).fait, true, "témoin : une fois les compétences posées, la ligne dit « done »");
});

test("(b) liste inversée — tout plan que le carnet publie pour l'étape Class se lit dans la ligne Class, chaque classe, les deux piles", () => {
  for (const [pile, h] of Object.entries(PILES)) {
    let lus = 0;
    for (const vue of h.layers.verbs.query({ kind: "class" }) || []) {
      const choix = [{ path: "class", ref: { kind: "class", id: vue.id } }];
      const attendus = decisionsDe(h, choix)
        .filter((p) => p.path.startsWith("class.") && !/\[\d+\]$/.test(p.path))
        .filter((p) => Number.isInteger(p.expected) && (p.answered || 0) < p.expected)
        .map((p) => ({ chemin: p.path, mot: `${p.answered || 0} of ${p.expected}` }));
      const restants = [...ligneClass(h, choix).mots];
      for (const { chemin, mot } of attendus) {
        const i = restants.indexOf(mot);
        assert.ok(i >= 0, `${pile} ${vue.record.name} : le plan « ${chemin} » (${mot}) ne se lit pas dans la ligne Class`);
        restants.splice(i, 1);
        lus += 1;
      }
    }
    assert.ok(lus >= 24, `témoin : ${pile} — ${lus} plans de Class relus, le garde doit en voir`);
  }
});
