/* ══ LOT 54 — L'ÉTAPE UNIVERSE & LAYERS ═══════════════════════════════════
   Trois sujets, dans l'ordre du §3 de la commande :

     A. `currentStack`/`fhRefChoices` — les deux fonctions PURES qui portent
        toute la connaissance de « quelle pile est active » / « qu'est-ce
        qui pointe vers Fate's Hand ». Testées directement, sans DOM.
     B. `renderUniverseStep` — la fonction de rendu (DOM-stub, comme
        Compétences/Class/Species) : les deux boutons, le champ campagne, la
        confirmation conditionnelle, et l'affichage lang/units.
     C. ⚔️ LE TEST QUI MONTRE CE QUE CHANGER DE PILE FAIT VRAIMENT — rejoue
        EXACTEMENT le geste de `shell.mjs` (`applyLayerStack`) sur la VRAIE
        pile et le VRAI bloc `build`, sans DOM : `layers.enable/disable` +
        `document.build.layers = []` + `rebuild`. C'est la mesure que
        `universe-step.mjs` documente en tête de fichier (« NE PERD RIEN
        dans build.choices… ce qui se dégrade, c'est le PERSONNAGE RÉSOLU »)
        — ce test en est la preuve, pas juste l'affirmation. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, readJson, SRD_EN, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN, FH_FICHE_EN, FH_LORE_EN }
  from "./build-harness.mjs";

globalThis.document = createTestDocument();

const { renderUniverseStep, currentStack, fhRefChoices, SRD_LAYER_ID, FH_LAYER_IDS }
  = await import("../ui/builder/universe-step.mjs");
/* LOT 77 — la pile que le NAVIGATEUR monte, pour la confronter à la pile
   NOMMÉE (test A0). Importée, jamais recopiée : c'est la recopie qui a
   laissé les deux diverger. */
const { LAYER_FILES } = await import("../ui/builder/engine.mjs");

const FT_LB = { distance: "ft", weight: "lb" };
function draftDocument(extra = {}) {
  return {
    schema: "fh-char/1", id: "universe-step-test", name: "Sonde", lang: "en", units: FT_LB,
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: { layers: [], choices: [], budgets: {}, overrides: [] },
    ...extra
  };
}
function manifestFor(ids) {
  return ids.map((id) => ({ id, version: "0.0.0", hash: "x".repeat(64), name: id }));
}

/* ══ A — LES DEUX FONCTIONS PURES ══════════════════════════════════════ */

test("A0 — la pile SRD+FH nommée est EXACTEMENT celle que le moteur monte", () => {
  assert.equal(SRD_LAYER_ID, "srd-5.2.1-en");
  /* ⭐ LOT 77 — LA LISTE N'EST PLUS RECOPIÉE ICI, ELLE EST CONFRONTÉE. Ce
     test portait les quatre noms à la main ; le jour où `engine.mjs` en a
     monté deux de plus (`fh-fiche-en`, `fh-lore-en`), la pile nommée est
     restée à cinq et l'écran Universe a accusé le personnage d'exemple
     d'avoir une pile hors des deux jeux de règles — mesuré au navigateur.
     Une liste écrite deux fois diverge : c'est la loi du dépôt, et elle
     vient de coûter une fois de plus. Le garde compare donc les DEUX
     sources réelles. */
  const duMoteur = LAYER_FILES.map((f) => f.replace(/\.layer\.json$/, ""));
  assert.deepEqual([SRD_LAYER_ID, ...FH_LAYER_IDS], duMoteur,
    "la pile nommée « SRD + FH » doit être la pile que `engine.mjs` monte, dans le même ordre");
});

test("A1 — currentStack reconnaît « srd » (une couche) et « srdfh » (les cinq)", () => {
  assert.equal(currentStack(draftDocument({ build: { layers: manifestFor(["srd-5.2.1-en"]), choices: [], budgets: {}, overrides: [] } })), "srd");
  assert.equal(
    currentStack(draftDocument({ build: { layers: manifestFor(["srd-5.2.1-en", ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } })),
    "srdfh"
  );
});

test("A2 — currentStack rend null hors des deux piles nommées (aucune, ou une composition différente)", () => {
  assert.equal(currentStack(draftDocument()), null, "aucune couche déclarée");
  assert.equal(
    currentStack(draftDocument({ build: { layers: manifestFor(["srd-5.2.1-en", "fh-species-en"]), choices: [], budgets: {}, overrides: [] } })),
    null,
    "une composition qui n'est ni SRD seule ni les cinq"
  );
});

test("A3 — fhRefChoices ne retient QUE les choix dont le ref pointe vers fh:, nommés via query", () => {
  const doc = draftDocument({
    build: {
      layers: [], budgets: {}, overrides: [],
      choices: [
        { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
        { path: "background.originFeat[0]", ref: { kind: "feat", id: "fh:feat:en:auspicious" }, label: "Origin feat" },
        { path: "abilities.str", value: 10 }
      ]
    }
  });
  const query = ({ kind, id }) => (id === "fh:feat:en:auspicious" ? { record: { name: "Auspicious (fh)" } } : null);
  assert.deepEqual(fhRefChoices(doc, query), ["Origin feat: Auspicious (fh)"]);
});

test("A3bis — fhRefChoices n'affiche PAS un préfixe qui répète le nom (label === name, ex. les arcanes)", () => {
  const doc = draftDocument({
    build: {
      layers: [], budgets: {}, overrides: [],
      choices: [{ path: "fh.destiny.arcana", ref: { kind: "arcana", id: "fh:arcana:en:the-hermit" }, label: "The Hermit" }]
    }
  });
  const query = () => ({ record: { name: "The Hermit" } });
  assert.deepEqual(fhRefChoices(doc, query), ["The Hermit"], "pas « The Hermit: The Hermit »");
});

test("A4 — fhRefChoices retombe sur l'id nu si query ne rend rien (couche déjà débranchée)", () => {
  const doc = draftDocument({
    build: {
      layers: [], budgets: {}, overrides: [],
      choices: [{ path: "fh.destiny.arcana", ref: { kind: "arcana", id: "fh:arcana:en:the-hermit" } }]
    }
  });
  assert.deepEqual(fhRefChoices(doc, () => null), ["fh:arcana:en:the-hermit"]);
});

/* ══ B — LE RENDU (DOM-stub) ══════════════════════════════════════════ */

function stackButtons(node) { return node.querySelectorAll(".record-option"); }
function campaignField(node) { return node.querySelectorAll(".doc-field-input")[0]; }

test("B1 — les deux boutons de pile existent, et celui qui correspond à la pile active est marqué", () => {
  const doc = draftDocument({ build: { layers: manifestFor(["srd-5.2.1-en"]), choices: [], budgets: {}, overrides: [] } });
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, () => {});
  const buttons = stackButtons(node);
  assert.equal(buttons.length, 2);
  assert.deepEqual(buttons.map((b) => b.textContent), ["SRD", "SRD + FH"]);
  assert.equal(buttons[0].dataset.active, "true");
  assert.equal(buttons[1].dataset.active, "false");
});

test("B2 — cliquer un bouton dispatche {kind:\"requestLayerStack\", value}, jamais un verbe directement", () => {
  const doc = draftDocument({ build: { layers: manifestFor(["srd-5.2.1-en"]), choices: [], budgets: {}, overrides: [] } });
  const actions = [];
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, (a) => actions.push(a));
  stackButtons(node)[1].click(); // "SRD + FH"
  assert.deepEqual(actions, [{ kind: "requestLayerStack", value: "srdfh" }]);
});

test("B3 — pendingStack ouvre la confirmation, NOMME les choix FH affectés, et ses boutons dispatchent confirm/cancel", () => {
  const doc = draftDocument({
    build: {
      layers: manifestFor(["srd-5.2.1-en", ...FH_LAYER_IDS]), budgets: {}, overrides: [],
      choices: [{ path: "background.originFeat[0]", ref: { kind: "feat", id: "fh:feat:en:auspicious" }, label: "Origin feat" }]
    }
  });
  const query = () => ({ record: { name: "Auspicious (fh)" } });
  const actions = [];
  const node = renderUniverseStep(
    { document: doc, query, fieldErrors: {}, pendingStack: "srd" },
    (a) => actions.push(a)
  );
  const dialog = node.querySelectorAll(".confirm-dialog")[0];
  assert.ok(dialog, "la confirmation doit apparaître quand pendingStack est posé");
  const items = node.querySelectorAll(".confirm-dialog-items li");
  assert.deepEqual(items.map((li) => li.textContent), ["Origin feat: Auspicious (fh)"]);

  node.querySelectorAll(".confirm-dialog-confirm")[0].click();
  node.querySelectorAll(".confirm-dialog-cancel")[0].click();
  assert.deepEqual(actions, [{ kind: "confirmLayerStack" }, { kind: "cancelLayerStack" }]);
});

test("B3bis — sans pendingStack, aucune confirmation ne s'affiche", () => {
  const doc = draftDocument({ build: { layers: manifestFor(["srd-5.2.1-en"]), choices: [], budgets: {}, overrides: [] } });
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, pendingStack: null }, () => {});
  assert.equal(node.querySelectorAll(".confirm-dialog").length, 0);
});

test("B4 — le champ campagne s'affiche et commet {kind:\"describe\", field:\"campaign\", value}", () => {
  const doc = draftDocument({ campaign: "Nymedes" });
  const actions = [];
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, (a) => actions.push(a));
  const input = campaignField(node);
  assert.equal(input.value, "Nymedes");
  input.value = "Obvious Mimic";
  input.dispatchEvent({ type: "change" });
  assert.deepEqual(actions, [{ kind: "describe", field: "campaign", value: "Obvious Mimic" }]);
});

test("B5 — la langue de la fiche et les unités s'affichent, lisibles (pas les codes bruts)", () => {
  const doc = draftDocument({ lang: "en", units: { distance: "ft", weight: "lb" } });
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, () => {});
  const rows = node.querySelectorAll(".universe-locale-row dd");
  assert.deepEqual(rows.map((dd) => dd.textContent), ["English", "feet", "pounds"]);
});

/* ══ C — ⚔️ LE TEST QUI MONTRE CE QUE CHANGER DE PILE FAIT, SUR LA VRAIE
   PILE ET LE VRAI BLOC `build` (§3, test 5 de la commande) ═══════════════ */

test("C — ⚔️ passer de SRD+FH à SRD ne perd RIEN dans build.choices, dégrade le résolu (refus NOMMÉS), et l'aller-retour restaure tout", () => {
  const harness = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN, "layers/fh-skills-en.layer.json", FH_ARCANA_EN, FH_FEATS_EN, FH_FICHE_EN, FH_LORE_EN] });
  /* Le personnage d'exemple EN+FH DU DÉPÔT (`examples/personnage-fh-en-
     niveau1.fh-char.json`, lot 20) — celui que `engine.mjs`/`shell.mjs`
     chargent réellement au boot du builder, jamais recopié à la main. */
  const example = readJson("examples/personnage-fh-en-niveau1.fh-char.json");
  let doc = {
    schema: example.schema, id: example.id, name: example.name, lang: example.lang, units: example.units,
    generator: { name: "tests/universe-step", version: "1.0.0" },
    created: example.created, modified: example.modified,
    build: {
      layers: manifestOf(harness.layers),
      choices: structuredClone(example.build.choices),
      budgets: structuredClone(example.build.budgets),
      overrides: structuredClone(example.build.overrides)
    }
  };

  const before = harness.verbs.rebuild({ document: doc });
  doc = before.document;
  assert.deepEqual(currentStackViaModule(doc), "srdfh");
  const choicesBefore = structuredClone(doc.build.choices);
  const affectedBefore = fhRefChoices(doc, harness.layers.verbs.query);
  assert.ok(affectedBefore.length > 0, "témoin : ce personnage porte bien des choix Fate's Hand nommables");

  /* ── LE GESTE EXACT DE shell.mjs (`applyLayerStack("srd")`) ─────────── */
  /* 🔴 LOT 77 — PAR LE HAUT. `applyLayerStack` éteint la pile à l'envers de
     la liste, et ce test rejoue le geste EXACT : `fh-fiche-en` patche les
     trois espèces que `fh-species-en` ajoute, donc éteindre la base d'abord
     fait jeter la pile (§L7.2). C'est ce test qui a trouvé le défaut. */
  for (const id of [...FH_LAYER_IDS].reverse()) harness.layers.verbs.disable({ id });
  doc = { ...doc, build: { ...doc.build, layers: [] } };
  const degraded = harness.verbs.rebuild({ document: doc });
  doc = degraded.document;

  assert.deepEqual(doc.build.choices, choicesBefore, "AUCUN choix n'a bougé — rien n'est effacé de build.choices");
  assert.deepEqual(currentStackViaModule(doc), "srd");

  const violations = harness.verbs.validate({ document: doc }).violations;
  const keys = violations.map((v) => v.key);
  assert.ok(keys.includes("choice.ref-missing"), `un ref FH mort doit être NOMMÉ : ${keys.join(", ")}`);
  assert.ok(keys.includes("skill-grant.count-mismatch"), `le budget de compétence FH doit être NOMMÉ : ${keys.join(", ")}`);

  /* ── L'ALLER-RETOUR : rien n'a été perdu, tout redevient consommé ────── */
  for (const id of FH_LAYER_IDS) harness.layers.verbs.enable({ id });
  doc = { ...doc, build: { ...doc.build, layers: [] } };
  const restored = harness.verbs.rebuild({ document: doc });
  assert.deepEqual(restored.unconsumed, before.unconsumed, "après l'aller-retour, exactement les mêmes chemins non consommés qu'avant");
  assert.deepEqual(
    harness.verbs.validate({ document: restored.document }).violations,
    [],
    "et plus aucun refus : le personnage restauré est de nouveau valide"
  );
});

function currentStackViaModule(doc) { return currentStack(doc); }
