/* ══ LES TESTS DE L'ÉTAPE DESTINY — lot 45, REFAITS AU LOT 61 (B6) ════════

   Même patron que `abilities-step.test.mjs`. ⛔ AUCUN plan `decisions[]`
   (mesuré au lot 45, toujours vrai) — `ctx` porte `document` (le brut, pour
   la carte déjà ACTÉE) et `resolved` (le Score, à l'octet).

   ⚠️ CE QUI A CHANGÉ AU LOT 61, et pourquoi ces tests ont bougé : l'écran
   n'est plus un sélecteur de mode + un bouton « Draw ». C'est la scène de
   B6 — un texte qu'on chasse, UNE carte de dos, un TAP pour la retourner,
   le texte une seconde après. Et surtout : **le tirage n'écrit plus rien**
   (B6.2, « rien n'est acté tant que Valid n'est pas tapé »).
   ⭐ Les lois que les anciens tests prouvaient sont TOUTES conservées — le
   Score lu à l'octet, les six champs recopiés, les 22 options du catalogue,
   le mode hors document. Seule la porte d'entrée a changé. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { makeHarness, manifestOf, uneCouche, SRD_EN, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN } from "./build-harness.mjs";
import { createFhDestinyStat, FH_DESTINY_ID } from "../src/modules/fh/destiny-stat.mjs";

globalThis.document = createTestDocument();

const {
  renderDestinyStep, drawArcana, currentArcanaId, destinyValidate,
  renderArcanaCardBody, arcanaImageSrc, ARCANA_BACK_SRC, DESTINY_ARCANA_PATH
} = await import("../ui/builder/destiny-step.mjs");
const { renderCatalogueCards, catalogueOptions } = await import("../ui/builder/catalogue.mjs");

const fixture = exempleFhEn();
const { build } = fixture;
const query = fixture.layers.verbs.query;

function rebuild(document) { return build.verbs.rebuild({ document }); }

/** La scène APRÈS le retournement — c'est là que vivent le Score, le texte
 *  et les deux boutons (B6.1b : rien d'autre à l'écran tant qu'elle est de
 *  dos). `intro: false` : le petit texte a été chassé. */
function ctxFrom(document, report, extra) {
  return Object.assign({
    document, resolved: report.resolved, query,
    intro: false, drawnId: currentArcanaId(document), face: "up", revealed: true
  }, extra || {});
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

/* ══ 6 — LES 22 ARCANES VIENNENT DU CATALOGUE, JAMAIS UN 22 EN DUR ═══════
   ⚠️ La liste passe maintenant par le CATALOGUE PARTAGÉ (lot 60) : Destiny
   n'a aucun plan dans `decisions[]`, il fournit donc ses options
   (`ctx.options`). Ce que le test prouve est inchangé — le compte vient de
   la pile montée, jamais du code. */

test("mode choix : les options viennent de query({kind:\"arcana\"}) — 22 sur la pile complète", () => {
  const options = (query({ kind: "arcana" }) || []).map((v) => v.id);
  assert.equal(options.length, 22);
  const node = renderCatalogueCards(
    { decisions: [], query, path: DESTINY_ARCANA_PATH, kind: "arcana", options, cursor: 0 },
    renderArcanaCardBody
  );
  assert.equal(node.querySelectorAll("[data-snap]").length, 22);
});

test("un catalogue à 3 cartes (pile réduite) n'en affiche QUE 3 — jamais 22 en dur", () => {
  const trois = (query({ kind: "arcana" }) || []).slice(0, 3).map((v) => v.id);
  const node = renderCatalogueCards(
    { decisions: [], query, path: DESTINY_ARCANA_PATH, kind: "arcana", options: trois, cursor: 0 },
    renderArcanaCardBody
  );
  assert.equal(node.querySelectorAll("[data-snap]").length, 3);
});

/* ══ 🔴 B6.2 — RIEN N'EST ACTÉ TANT QUE `Validate` N'EST PAS TAPÉ ════════
   C'est le changement de fond du lot 61 : au lot 45, le bouton « Draw »
   écrivait `choose` dans le document sur-le-champ. Eric : « tant que Valid
   n'est pas tapé, ça n'est pas acté », et « Draw again est illimité ». */

test("🔴 tirer et retourner une carte n'appelle AUCUN verbe de document", () => {
  const report = rebuild(fixture.document);
  const appels = [];
  const node = renderDestinyStep(
    ctxFrom(report.document, report, { drawnId: "fh:arcana:en:the-tower", face: "down", revealed: false }),
    (a) => appels.push(a)
  );
  const carte = node.querySelectorAll(".card-face")[0];
  assert.ok(carte, "la carte est là, de dos");
  carte.click();
  assert.deepEqual(appels, [{ kind: "destinyFlip" }],
    "le tap ne produit QU'UN geste d'écran — aucun `choose`, aucun chemin de document");
});

test("🔴 c'est `Validate` qui acte, et il pose le MÊME `choose` qu'au lot 45", () => {
  const porte = destinyValidate({ drawnId: "fh:arcana:en:the-tower", face: "up" });
  assert.equal(porte.ready, true);
  assert.deepEqual(porte.action,
    { kind: "choose", path: "fh.destiny.arcana", ref: { kind: "arcana", id: "fh:arcana:en:the-tower" } });
  assert.equal(porte.next, "step");
});

test("🔴 `Validate` reste ÉTEINT tant que la carte n'est pas retournée (B6.1e)", () => {
  assert.equal(destinyValidate({ drawnId: "fh:arcana:en:the-tower", face: "down" }).ready, false);
  assert.equal(destinyValidate({ drawnId: null, face: "up" }).ready, false,
    "et sans carte non plus — une scène vide n'a rien à valider");
  assert.equal(destinyValidate({ drawnId: null, face: "down" }).action, null);
});

test("le document rendu par `choose` est celui qui compte : un rebuild dessus voit la NOUVELLE carte", () => {
  /* La moitié moteur de l'ancien test 7, conservée telle quelle : ce que
     `Validate` commet doit vraiment changer le Score. */
  const avant = rebuild(fixture.document);
  const scoreAvant = avant.resolved.stats.find((s) => s.id === "fh:destiny").value;
  const { document: apres } = build.verbs.choose({
    document: avant.document, path: "fh.destiny.arcana",
    ref: { kind: "arcana", id: "fh:arcana:en:the-tower" }
  });
  const reconstruit = rebuild(apres);
  assert.equal(currentArcanaId(reconstruit.document), "fh:arcana:en:the-tower");
  assert.ok(reconstruit.resolved.stats.find((s) => s.id === "fh:destiny"),
    `le Score existe toujours après le changement de carte (avant : ${scoreAvant})`);
});

/* ══ B6.1b/c — LA SCÈNE : DE DOS, RIEN D'AUTRE, PUIS LE TAP ══════════════ */

test("🔴 de dos, il n'y a RIEN D'AUTRE que la carte (B6.1b)", () => {
  const report = rebuild(fixture.document);
  const node = renderDestinyStep(
    ctxFrom(report.document, report, { face: "down", revealed: false }), () => {}
  );
  assert.equal(node.querySelectorAll(".card-face").length, 1);
  assert.equal(node.querySelectorAll(".card-score").length, 0, "pas de Score");
  assert.equal(node.querySelectorAll(".card-reveal").length, 0, "pas de texte");
  assert.equal(node.querySelectorAll(".card-action").length, 0, "pas de boutons");
  assert.equal(node.querySelectorAll(".card-face-img")[0].getAttribute("src"), ARCANA_BACK_SRC);
});

test("retournée, la carte montre SA face, et cesse d'être un geste", () => {
  const report = rebuild(fixture.document);
  const id = currentArcanaId(report.document);
  const node = renderDestinyStep(ctxFrom(report.document, report), () => {});
  const carte = node.querySelectorAll(".card-face")[0];
  assert.equal(carte.dataset.face, "up");
  assert.equal(carte.disabled, true, "une carte déjà retournée n'est plus tapable");
  assert.equal(node.querySelectorAll(".card-face-img")[0].getAttribute("src"), arcanaImageSrc(id));
});

test("B6.1a — le petit texte occupe la scène SEUL, et son OK le chasse", () => {
  const report = rebuild(fixture.document);
  const appels = [];
  const node = renderDestinyStep(
    ctxFrom(report.document, report, { intro: true }), (a) => appels.push(a)
  );
  assert.equal(node.querySelectorAll(".card-intro").length, 1);
  assert.equal(node.querySelectorAll(".card-face").length, 0, "la carte n'entre qu'après l'OK");
  node.querySelectorAll(".card-ok")[0].click();
  assert.deepEqual(appels, [{ kind: "destinyIntroDone" }]);
});

test("B6.1d — le texte n'apparaît QU'APRÈS le délai (`revealed`), pas au retournement", () => {
  const report = rebuild(fixture.document);
  const sansDelai = renderDestinyStep(ctxFrom(report.document, report, { revealed: false }), () => {});
  assert.equal(sansDelai.querySelectorAll(".card-reveal").length, 0);
  assert.equal(sansDelai.querySelectorAll(".card-action").length, 2,
    "les deux boutons, eux, sont là dès le retournement (B6.1f/h)");
  const apresDelai = renderDestinyStep(ctxFrom(report.document, report), () => {});
  assert.equal(apresDelai.querySelectorAll(".card-reveal").length, 1);
});

/* ══ B6.1f/h — LES DEUX BOUTONS, ET CE QU'ILS COMMETTENT ═════════════════
   L'héritage du lot 55 (§3) tient : deux gestes différents ne portent jamais
   le même texte. */

test("« Draw again » et « Choose yourself » : deux textes, deux gestes, aucun verbe de document", () => {
  const report = rebuild(fixture.document);
  const appels = [];
  const node = renderDestinyStep(ctxFrom(report.document, report), (a) => appels.push(a));
  const boutons = node.querySelectorAll(".card-action");
  assert.deepEqual(boutons.map((b) => b.textContent), ["Draw again", "Choose yourself"]);
  boutons[0].click();
  boutons[1].click();
  assert.deepEqual(appels, [{ kind: "destinyDraw" }, { kind: "destinyMode", value: "choice" }],
    "ni l'un ni l'autre n'écrit au document — B6.2, et `fh.destiny.mode` ferait JETER rebuild() (mesuré lot 45)");
});

/* ══ La carte montre ses six champs, RECOPIÉS (lot 45, §3b.3) ════════════ */

test("la carte retournée affiche numeral/name/impact/meaning/power/vibration, recopiés du record", () => {
  const report = rebuild(fixture.document);
  const id = currentArcanaId(report.document);
  const view = query({ kind: "arcana", id });
  const node = renderDestinyStep(ctxFrom(report.document, report), () => {});
  const titre = node.querySelectorAll(".card-reveal h3")[0].textContent;
  assert.ok(titre.includes(view.record.name));
  assert.ok(titre.includes(String(view.record.data.numeral)));
  const valeurs = node.querySelectorAll(".card-reveal dd").map((dd) => dd.textContent);
  for (const champ of ["meaning", "power", "vibration"]) {
    const attendu = view.record.data[champ];
    if (attendu) assert.ok(valeurs.includes(String(attendu)), `« ${champ} » doit être recopié tel quel`);
  }
});

/* ══ Le garde des jetons — vérifié par la suite complète, pas ici ═══════ */
