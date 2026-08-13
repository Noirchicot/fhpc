/* ══ LES TESTS DU LOT 46 — L'ÉTAPE INHERITANCE ═══════════════════════════

   Même patron que `tests/class-species-steps.test.mjs`/`abilities-step.test
   .mjs` : on teste la FONCTION (`renderInheritanceStep`), pas la page —
   `tests/dom-stub.mjs`, aucun paquet de plus.

   Rejoué dans l'ORDRE du §3 de la commande :
     1. les 5 dons viennent du plan (un plan à 2 options affiche 2, pas 5) ;
     2. les six caracs sont proposées au boost, compteur `answered`/`expected` ;
     3. poser un boost appelle `set` sur le bon chemin, et le document rendu
        par le verbe est celui qui repart au `rebuild` ;
     4. ⚔️ les deux refus neufs du moteur s'affichent, SANS être reformulés —
        le même mot que produirait `decisionRefusalWord` (`carnet.mjs`)
        directement, jamais une phrase inventée ici ;
     5. ⚔️ le score final vient de `resolved`, à l'octet — un `resolved`
        menteur s'affiche menteur ;
     6. le plan `background` à une option ne produit pas de sélecteur.
   Les tests 7-9 (le COMPOSANT de confirmation, isolé, et son intégration à
   Class) vivent dans `tests/confirm.test.mjs` et
   `tests/class-species-steps.test.mjs` — voir INVENTAIRE-LOT-46.md. Le
   test 10 (garde des jetons) est vérifié par la suite complète, pas ici
   (même choix que `class-species-steps.test.mjs`, tête de fichier). */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { makeHarness, manifestOf, SRD_EN, FH_FEATS_EN } from "./build-harness.mjs";
import { decisionRefusalWord } from "../ui/builder/carnet.mjs";

globalThis.document = createTestDocument();

const { renderInheritanceStep } = await import("../ui/builder/inheritance-step.mjs");

const fixture = exempleFhEn();
const { build, layers } = fixture;
const query = layers.verbs.query;

function rebuild(document) { return build.verbs.rebuild({ document }); }
function set(document, path, value) { return build.verbs.set({ document, path, value }).document; }

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";

/** La pile Fate's Hand MINIMALE (SRD + compétences + dons) — même harnais
 *  que `tests/inheritance-lot43.test.mjs`, réutilisé pour les scénarios que
 *  le personnage d'exemple ne couvre pas (aucun boost, un boost fautif). */
function pile() {
  return makeHarness({ layers: [SRD_EN, FH_SKILLS_EN, FH_FEATS_EN] });
}

function baseChoices({ classId = "srd:class:en:wizard", extra = [] } = {}) {
  return [
    { path: "level", value: 1 },
    { path: "class", ref: { kind: "class", id: classId } },
    { path: "abilities.str", value: 10 },
    { path: "abilities.dex", value: 10 },
    { path: "abilities.con", value: 10 },
    { path: "abilities.int", value: 10 },
    { path: "abilities.wis", value: 10 },
    { path: "abilities.cha", value: 10 },
    { path: "currency.cp", value: 0 },
    { path: "currency.sp", value: 0 },
    { path: "currency.gp", value: 0 },
    { path: "currency.pp", value: 0 }
  ].concat(extra);
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1", id: "lot46-inheritance-step", name: "Inheritance step", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/inheritance-step", version: "1.0.0" },
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

function ctxFrom(report, extra) {
  return Object.assign({ decisions: report.decisions, document: report.document, resolved: report.resolved, query }, extra || {});
}

function featCards(node) { return node.querySelectorAll(".inheritance-feat-card"); }
function boostRow(node, key) { return node.querySelectorAll(`.skills-row[data-row="${key}"]`)[0] || null; }
function boostButtons(row) { return row.querySelectorAll(".record-option"); }

/* ══ 1 — LES 5 DONS VIENNENT DU PLAN, JAMAIS D'UNE LISTE LOCALE ══════════ */

test("les dons d'origine viennent du plan : un plan à 2 options affiche 2 cartes, pas 5", () => {
  /* Un plan FABRIQUÉ (même geste que l'« ATTAQUE » de class-species-steps.
     test.mjs, test 2) : la preuve que l'écran ne va JAMAIS chercher le
     catalogue complet des dons `origin` lui-même. */
  const decisions = [
    { path: "background", options: ["fh:background:en:inheritance"], selected: [], expected: 1, answered: 0, status: "pending" },
    {
      path: "background.originFeat[0]", options: ["zz:feat:a", "zz:feat:b"], selected: [],
      expected: 1, answered: 0, status: "pending"
    }
  ];
  const node = renderInheritanceStep({ decisions, document: null, resolved: null, query: () => null }, () => {});
  assert.equal(featCards(node).length, 2, "exactement les 2 du plan fabriqué, jamais les 5 réelles");
});

test("le personnage d'exemple (pile FH réelle) offre bien les CINQ dons d'origine", () => {
  const report = rebuild(fixture.document);
  const node = renderInheritanceStep(ctxFrom(report), () => {});
  assert.equal(featCards(node).length, 5);
  const attendu = layers.verbs.query({ kind: "feat" })
    .filter((view) => view.record.data && view.record.data.category === "origin")
    .map((view) => view.id).sort();
  assert.equal(attendu.length, 5, "sonde : quatre du SRD + Auspicious (fh)");
  const rendered = featCards(node).map((card) => card.getAttribute("aria-label")).sort();
  assert.deepEqual(rendered, attendu, "les CINQ ids rendus sont EXACTEMENT ceux du plan, rien composé ici");
});

test("chaque carte de don porte son NOM et sa DESCRIPTION, lus par `query({kind:\"feat\", id})`", () => {
  const report = rebuild(fixture.document);
  const node = renderInheritanceStep(ctxFrom(report), () => {});
  const auspicious = featCards(node).find((card) => card.getAttribute("aria-label") === "fh:feat:en:auspicious");
  assert.ok(auspicious, "la carte Auspicious (fh) existe");
  const name = auspicious.querySelectorAll(".inheritance-feat-name")[0];
  assert.equal(name.textContent, "Auspicious (fh)");
  const desc = auspicious.querySelectorAll(".inheritance-feat-desc");
  assert.ok(desc.length > 0, "la description existe — pas seulement le nom");
  assert.match(desc[0].textContent, /Destiny/, "c'est bien le texte du record, pas un résumé");
  /* Et le don CHOISI (l'exemple porte déjà Auspicious) se voit actif. */
  assert.equal(auspicious.getAttribute("data-active"), "true");
});

/* ══ 2 — LES SIX CARACS SONT PROPOSÉES, LE COMPTEUR LIT answered/expected ══ */

test("les SIX caractéristiques sont les lignes de boost, et le compteur lit answered/expected au plan", () => {
  const report = rebuild(fixture.document); // 2 boosts déjà posés (int+2, con+1) = 3 points, légal
  const node = renderInheritanceStep(ctxFrom(report), () => {});
  const rows = node.querySelectorAll(".skills-budget-block .skills-row");
  assert.equal(rows.length, 6, "les six clefs, pas seulement les deux boostées");
  const note = node.querySelectorAll(".skills-budget-note")[0];
  assert.equal(note.textContent, "3 of 3 points spent");
});

test("⚠️ SURPRISE, trouvée en regardant l'écran — sans AUCUN boost posé, le plan `background.boost` est déjà LOCKED (total-mismatch, 0 ≠ 3) : l'écran l'affiche quand même, tel quel", () => {
  /* Mesuré : contrairement à `class.skills`/`species.skills` (qui restent
     `pending`, jamais `locked`, tant qu'aucun candidat n'existe — voir
     `multiPlan`, `src/build/decisions.mjs`), `background.boost` n'a AUCUN
     état intermédiaire : soit le total vaut EXACTEMENT 3, soit il est
     `locked`, même à zéro candidat. Un personnage tout neuf affiche donc un
     refus AVANT le moindre clic. Voir INVENTAIRE-LOT-46.md — la commande
     interdit d'atténuer ce refus (« tu ne le prévien pas »), cet écran le
     montre donc tel quel, sans idée de « pas encore commencé ». */
  const h = pile();
  const out = h.verbs.rebuild({ document: documentDe(h, baseChoices()) });
  const plan = out.decisions.find((d) => d.path === "background.boost");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "background.boost-total-mismatch");
  assert.equal(plan.lock.params.total, 0);

  const node = renderInheritanceStep({ decisions: out.decisions, document: out.document, resolved: out.resolved, query: h.layers.verbs.query }, () => {});
  const note = node.querySelectorAll(".skills-budget-note")[0];
  assert.equal(note.textContent, "0 of 3 points spent");
  assert.equal(node.querySelectorAll(".skills-budget-block .skills-row").length, 6);
  const refusal = node.querySelectorAll(".skills-budget-block .skills-refusal")[0];
  assert.ok(refusal, "le refus s'affiche dès l'écran vide — le moteur prononce, l'écran ne le tait pas");
  assert.equal(refusal.textContent, "0 points spent, 3 expected.");
});

/* ══ 3 — POSER UN BOOST APPELLE `set`, ET LE DOCUMENT DU VERBE REPART AU
   `rebuild` ═══════════════════════════════════════════════════════════ */

test("cliquer « +1 » sur une carac au repos pose exactement `set({path:\"background.boost.<clef>\", value:1})`", () => {
  const h = pile();
  const before = documentDe(h, baseChoices());
  const out = h.verbs.rebuild({ document: before });
  const calls = [];
  const node = renderInheritanceStep({ decisions: out.decisions, document: out.document, resolved: out.resolved, query: h.layers.verbs.query }, (a) => calls.push(a));
  const row = boostRow(node, "str");
  assert.ok(row, "la ligne STR existe");
  const plusOne = boostButtons(row).find((b) => b.textContent === "+1");
  assert.ok(plusOne, "le bouton +1 existe");
  plusOne.click();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { kind: "set", path: "background.boost.str", value: 1 });
});

test("le document rendu par `set` sur un boost est celui qui compte : un `rebuild` dessus voit le NOUVEAU total", () => {
  const h = pile();
  const before = documentDe(h, baseChoices({ extra: [{ path: "background.boost.int", value: 2 }] }));
  const { document: after } = h.verbs.set({ document: before, path: "background.boost.con", value: 1 });

  const reportAfter = h.verbs.rebuild({ document: after });
  const planAfter = reportAfter.decisions.find((d) => d.path === "background.boost");
  assert.equal(planAfter.answered, 3, "rebuild(after) voit bien LES DEUX boosts (int+2, con+1)");
  assert.equal(planAfter.status, "answered");

  const reportBefore = h.verbs.rebuild({ document: before });
  const planBefore = reportBefore.decisions.find((d) => d.path === "background.boost");
  assert.equal(planBefore.answered, 2, "l'ANCIEN document (jamais muté par `set`) ne voit qu'un seul boost — la preuve que `after`, pas `before`, doit repartir au rebuild");
});

/* ══ 4 — ⚔️ LES DEUX REFUS DU MOTEUR S'AFFICHENT, SANS ÊTRE REFORMULÉS ═══ */

test("⚔️ ATTAQUE — `background.boost-cap-exceeded` s'affiche, mot pour mot ce que `decisionRefusalWord` produit", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({ extra: [{ path: "background.boost.int", value: 3 }] }))
  });
  const plan = out.decisions.find((d) => d.path === "background.boost");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "background.boost-cap-exceeded", "sonde : c'est bien CE refus que ce test attaque");

  const node = renderInheritanceStep({ decisions: out.decisions, document: out.document, resolved: out.resolved, query: h.layers.verbs.query }, () => {});
  const refusal = node.querySelectorAll(".skills-budget-block .skills-refusal")[0];
  assert.ok(refusal, "le refus s'affiche");
  /* ⛔ « sans le reformuler » : l'écran ne fait qu'appeler la MÊME fonction
     partagée que Class/Species/Compétences — la preuve que ce fichier n'a
     écrit AUCUNE phrase à lui, ni recalculé le verrou lui-même. */
  assert.equal(refusal.textContent, decisionRefusalWord(plan.lock));
  assert.equal(refusal.textContent, "+3 on one ability — the cap is +2.");
});

test("⚔️ ATTAQUE — `background.boost-total-mismatch` s'affiche, mot pour mot ce que `decisionRefusalWord` produit", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [{ path: "background.boost.int", value: 2 }, { path: "background.boost.con", value: 2 }]
    }))
  });
  const plan = out.decisions.find((d) => d.path === "background.boost");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "background.boost-total-mismatch", "sonde : c'est bien CE refus que ce test attaque");

  const node = renderInheritanceStep({ decisions: out.decisions, document: out.document, resolved: out.resolved, query: h.layers.verbs.query }, () => {});
  const refusal = node.querySelectorAll(".skills-budget-block .skills-refusal")[0];
  assert.ok(refusal);
  assert.equal(refusal.textContent, decisionRefusalWord(plan.lock));
  assert.equal(refusal.textContent, "4 points spent, 3 expected.");
});

/* ══ 5 — ⚔️ LE SCORE FINAL VIENT DE `resolved`, À L'OCTET ════════════════ */

test("⚔️ ATTAQUE — un `resolved` MENTEUR s'affiche menteur : la cellule Final ne recalcule rien", () => {
  const report = rebuild(fixture.document);
  const menteur = structuredClone(report.resolved);
  menteur.abilities.int = { score: 999, mod: 42 };
  const node = renderInheritanceStep(ctxFrom(report, { resolved: menteur }), () => {});
  const row = boostRow(node, "int");
  const finalValue = row.querySelectorAll(".ability-row-final-value")[0];
  assert.ok(finalValue, "la cellule Final existe sur une ligne de boost — même composant qu'Abilities (lot 45)");
  assert.equal(finalValue.textContent, "999 (+42)", "le mensonge de `resolved` s'affiche tel quel, rien n'est recalculé");
});

test("la ligne CON (boostée par l'exemple) montre le score final RÉEL, à l'octet de `resolved`", () => {
  const report = rebuild(fixture.document);
  assert.equal(report.resolved.abilities.con.score, 14, "mesure : le boost d'Inheritance porte CON à 14 (13 brut +1)");
  const node = renderInheritanceStep(ctxFrom(report), () => {});
  const row = boostRow(node, "con");
  const finalValue = row.querySelectorAll(".ability-row-final-value")[0];
  assert.equal(finalValue.textContent, "14 (+2)");
  const finalCell = row.querySelectorAll(".ability-row-final")[0];
  assert.equal(finalCell.getAttribute("data-boosted"), "true");
});

/* ══ 6 — LE PLAN `background` À UNE OPTION NE PRODUIT PAS DE SÉLECTEUR ═══ */

test("le plan `background` à une option (pile FH) : le nom s'affiche en mention, AUCUN `.record-option` pour ce chemin", () => {
  const report = rebuild(fixture.document);
  const plan = report.decisions.find((d) => d.path === "background");
  assert.equal(plan.options.length, 1, "sonde : un seul record du genre sous la pile FH");
  assert.equal(plan.status, "pending", "et il reste `pending` — aucun `choose` n'a jamais été posé (lot 43)");

  const node = renderInheritanceStep(ctxFrom(report), () => {});
  const frame = node.querySelectorAll(".inheritance-frame")[0];
  assert.ok(frame, "le cadre s'affiche — « ne le cache pas » (commande §0)");
  assert.equal(frame.textContent, "Inheritance", "le nom du record, lu par query()");
  assert.equal(node.querySelectorAll(".record-choice-block").length, 0, "aucune liste, aucun bouton — « ne le montre pas comme un choix »");
});

test("un personnage SRD pur (4 arrière-plans, aucun repli) : le lot 46 réutilise `renderRecordChoice`, une VRAIE liste", () => {
  const h = makeHarness({ layers: [SRD_EN] }); // aucune couche FH — les quatre arrière-plans SRD sont intacts
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [{ path: "background", ref: { kind: "background", id: "srd:background:en:acolyte" } }]
    }))
  });
  const plan = out.decisions.find((d) => d.path === "background");
  assert.equal(plan.options.length, 4, "sonde : les quatre arrière-plans SRD, pas de repli à un seul");

  const node = renderInheritanceStep({ decisions: out.decisions, document: out.document, resolved: out.resolved, query: h.layers.verbs.query }, () => {});
  assert.equal(node.querySelectorAll(".inheritance-frame").length, 0, "pas de mention silencieuse ici — c'est une VRAIE liste");
  const list = node.querySelectorAll(".record-choice-block")[0];
  assert.ok(list, "la liste des 4 arrière-plans s'affiche, même geste que Class/Species");
  assert.equal(list.querySelectorAll(".record-option").filter((b) => !(b.className || "").includes("record-option-none")).length, 4);
});
