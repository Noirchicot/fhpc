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
import { makeHarness, manifestOf, readJson, SRD_EN, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN, FH_SPELLS_EN, FH_FICHE_EN, FH_LORE_EN }
  from "./build-harness.mjs";

globalThis.document = createTestDocument();

const { renderUniverseStep, currentStack, fhRefChoices, SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS }
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
  /* ⭐ LOT 95 — LA PILE A TROIS PALIERS, PLUS DEUX. `srfh-shelving-en` n'est
     ni le livre ni Fate's Hand : c'est ce qui est AMBIGU (le rangement
     d'Eric). Elle a donc sa propre liste, et elle est montée dans les DEUX
     piles nommées — la bascule de `shell.mjs` ne touche que `FH_LAYER_IDS`.
     ⛔ La ranger dans l'une des deux aurait été plus court et faux : dans
     `FH_LAYER_IDS` elle serait débrayée en mode SRD et le tambour se
     viderait ; dans le SRD elle ferait passer une décision d'Eric pour du
     livre. */
  const duMoteur = LAYER_FILES.map((f) => f.replace(/\.layer\.json$/, ""));
  assert.deepEqual([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS], duMoteur,
    "la pile nommée « SRD + FH » doit être la pile que `engine.mjs` monte, dans le même ordre");
  assert.deepEqual(SRFH_LAYER_IDS, ["srfh-shelving-en"],
    "la couche srfh est nommée à part — ni SRD, ni FH");
});

test("A1 — currentStack reconnaît « srd » et « srdfh », qui portent TOUTES DEUX la couche srfh", () => {
  /* ⭐ LOT 95 — « SRD » N'EST PLUS « UNE SEULE COUCHE ». Les deux piles portent
     le livre ET le rangement d'Eric (`srfh`, ni l'un ni l'autre) ; seules les
     couches Fate's Hand les distinguent. Les listes sont CONFRONTÉES, pas
     recopiées : un nom écrit à la main ici a déjà coûté le lot 77. */
  assert.equal(currentStack(draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } })), "srd");
  assert.equal(
    currentStack(draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } })),
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

/* ⚠️ `.record-option` → `.bascule-ligne` LE 2026-08-17 : Eric a tranché que les
   deux règles sont des SÉLECTEURS, pas des boutons — deux lignes à interrupteur
   plutôt que deux pastilles. Le contrat testé ne bouge pas d'un mot (deux
   entrées, l'active marquée, un `requestLayerStack` au clic) ; seule la forme
   change, et c'est exactement ce qu'un garde doit survivre. */
function stackButtons(node) { return node.querySelectorAll(".bascule-ligne"); }
function campaignField(node) { return node.querySelectorAll(".doc-field-input")[0]; }

test("B1 — les deux boutons de pile existent, et celui qui correspond à la pile active est marqué", () => {
  const doc = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, () => {});
  const buttons = stackButtons(node);
  assert.equal(buttons.length, 2);
  assert.deepEqual(buttons.map((b) => b.textContent), ["SRD", "SRD + FH"]);
  assert.equal(buttons[0].dataset.active, "true");
  assert.equal(buttons[1].dataset.active, "false");
});

test("B2 — cliquer un bouton dispatche {kind:\"requestLayerStack\", value}, jamais un verbe directement", () => {
  const doc = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  const actions = [];
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, (a) => actions.push(a));
  stackButtons(node)[1].click(); // "SRD + FH"
  assert.deepEqual(actions, [{ kind: "requestLayerStack", value: "srdfh" }]);
});

test("B2 bis — ⚔️ RECLIQUER LA LIGNE DÉJÀ ALLUMÉE NE FAIT RIEN — deux éteintes est un état impossible", () => {
  /* 🔴 CE GARDE NAÎT DE LA FORME NEUVE (Eric, 2026-08-17 : *« quand l'un
     s'allume, l'autre s'éteint »*). Un interrupteur invite à le rappuyer ; s'il
     répondait, il relancerait la CONFIRMATION de bascule pour un changement qui
     n'a pas lieu — et l'idée même d'éteindre les deux laisserait le personnage
     sans pile de règles. L'exclusivité se tient dans le code, elle ne s'espère
     pas. */
  const doc = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  const actions = [];
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, (a) => actions.push(a));
  const lignes = stackButtons(node);
  assert.equal(lignes[0].dataset.active, "true", "témoin : c'est bien la ligne allumée qu'on reclique");
  lignes[0].click();
  assert.deepEqual(actions, [], "aucune action — l'état ne change pas, donc rien n'est demandé");
  lignes[1].click();
  assert.deepEqual(actions, [{ kind: "requestLayerStack", value: "srdfh" }], "et l'AUTRE ligne répond toujours");
});

test("B3 — pendingStack ouvre la confirmation, NOMME les choix FH affectés, et ses boutons dispatchent confirm/cancel", () => {
  const doc = draftDocument({
    build: {
      layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS]), budgets: {}, overrides: [],
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
  const doc = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
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
  /* ⭐ LOT 95 — `srfh-shelving-en` est dans cette pile parce qu'elle est dans
     les DEUX piles nommées : la bascule n'éteint que les couches FH, donc le
     rangement d'Eric survit au passage en « SRD seul ». Une pile de test qui
     l'oublierait ne serait reconnue NI comme « srd » NI comme « srdfh ». */
  const harness = makeHarness({ layers: [SRD_EN, "layers/srfh-shelving-en.layer.json", FH_SPECIES_EN, "layers/fh-skills-en.layer.json", FH_ARCANA_EN, FH_FEATS_EN, FH_SPELLS_EN, FH_FICHE_EN, FH_LORE_EN] });
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

/* ══ D. OÙ VIT CE PERSONNAGE — la mémoire du navigateur, 2026-08-20 ═══════
   Eric : *« Un perso est enregistré dans le navigateur de tout le monde, et
   disparaît s'il n'est pas enregistré s'il y a un reset. »*

   🔴 CE BLOC EXISTE PARCE QUE LA SAUVEGARDE EST INVISIBLE : pas de bouton, pas
   de message. Une sauvegarde qu'on ne voit pas est une sauvegarde en laquelle
   on ne peut pas avoir confiance — et le jour où elle échoue, le joueur
   travaillerait des heures en se croyant gardé. */

test("D1 — gardé : l'écran le DIT, et nomme la limite", () => {
  const doc = draftDocument();
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true } }, () => {});
  const bloc = node.querySelectorAll(".universe-memoire")[0];
  assert.ok(bloc, "le bloc existe");
  assert.equal(bloc.dataset.garde, "true");
  const mots = bloc.querySelectorAll("p").map((p) => p.textContent).join(" ");
  assert.match(mots, /Kept in this browser/);
  assert.match(mots, /Clearing this browser's site data erases it/,
    "⛔ la limite se dit, elle ne se découvre pas");
});

test("D2 — 🔴 PAS gardé : la raison du navigateur est RECOPIÉE, et la mise en garde disparaît", () => {
  const doc = draftDocument();
  const node = renderUniverseStep({
    document: doc, query: () => null, fieldErrors: {},
    memoire: { ok: false, raison: "QuotaExceededError" }
  }, () => {});
  const bloc = node.querySelectorAll(".universe-memoire")[0];
  assert.equal(bloc.dataset.garde, "false");
  const mots = bloc.querySelectorAll("p").map((p) => p.textContent).join(" ");
  assert.match(mots, /Not being saved: QuotaExceededError/, "le mot du navigateur, pas une prose inventée");
  assert.match(mots, /Export your character/, "et le geste qui reste possible");
  assert.doesNotMatch(mots, /Clearing this browser's site data/,
    "⛔ celui qui n'est pas gardé vient de lire pire — lui répéter la mise en garde noierait son message");
});

test("D3 — 🔴 UNE PERTE SE DIT : un personnage illisible laisse un message, même une fois la sauvegarde repartie", () => {
  /* Sans lui, un joueur dont le personnage gardé est corrompu repart de
     l'exemple en croyant n'avoir jamais rien construit. */
  const doc = draftDocument();
  const node = renderUniverseStep({
    document: doc, query: () => null, fieldErrors: {},
    memoire: { ok: true },
    memoireIgnoree: "the saved character could not be read"
  }, () => {});
  const perdu = node.querySelectorAll(".universe-memoire .doc-field-error")[0];
  assert.ok(perdu, "le message de perte existe");
  assert.match(perdu.textContent, /A character was saved here but could not be reopened/);
  assert.match(perdu.textContent, /could not be read/, "et il porte la raison");
});

test("D4 — ⛔ AUCUNE PORTE ICI NE PROMET UN PERSONNAGE NEUF", () => {
  /* 🔴 CE GARDE A ÉTÉ RÉÉCRIT LE 2026-09-06, ET IL EST PLUS STRICT QU'AVANT,
     PAS PLUS LÂCHE. Il comptait les boutons (« zéro ») ; il nomme maintenant
     le DANGER. La décision du 20/08 n'a pas bougé d'un mot : le builder n'a
     AUCUN personnage vierge — il naît de l'exemple commité — donc « Start
     over » rendrait un Magicien tout fait, et une porte qui ne mène pas là où
     elle dit est pire que pas de porte (loi §0.6).
     ⭐ CE QUI A CHANGÉ, C'EST QU'UN AUTRE GESTE EXISTE : « oublier ce que ce
     navigateur garde » ne promet aucun personnage neuf. Compter les organes
     l'interdisait par accident ; nommer la promesse l'autorise sans rien
     relâcher. ⛔ Un garde qui compte protège la forme du jour où il a été
     écrit ; un garde qui nomme protège la décision. */
  const doc = draftDocument();
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true } }, () => {});
  const menteurs = node.querySelectorAll(".universe-memoire button")
    .map((b) => b.textContent.trim())
    .filter((mot) => /\b(new|start over|restart|reset|fresh|blank)\b/i.test(mot));
  assert.deepEqual(menteurs, [],
    "ces libellés promettent un personnage neuf, que le builder ne sait pas fabriquer : " + menteurs.join(", "));
});

test("D6 — 🔴 LA SORTIE DE SECOURS EXISTE, et elle dit le geste, pas une promesse", () => {
  /* Eric, 2026-09-06 : *« un bouton reset du perso, dans le menu, qui permet
     de vider le cache quand ça bloque »*. Mesuré le même jour sur le site
     déployé : un personnage gardé avant un changement de couche de données
     rend SIX écrans sur huit muets, et rien dans l'interface n'en sortait. */
  const doc = draftDocument();
  const gestes = [];
  const node = renderUniverseStep(
    { document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true } },
    (a) => gestes.push(a)
  );
  const bouton = node.querySelectorAll(".universe-memoire .universe-oubli")[0];
  assert.ok(bouton, "le bouton d'oubli vit dans la section « This character »");
  assert.match(bouton.textContent, /Forget/, "son mot porte le geste");
  bouton.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "oublierPersonnage" }],
    "il émet un verbe, il n'efface pas lui-même — l'écran ne touche jamais le magasin");
});

test("D7 — ⛔ ET IL N'EST JAMAIS GRISÉ, même quand la mémoire refuse", () => {
  /* 🔴 `memoire.ok` dit si la dernière ÉCRITURE a réussi, jamais s'il y a
     quelque chose à jeter. Un magasin qui refuse d'écrire peut très bien
     garder un personnage périmé — c'est le cas exact qu'on répare. Le griser
     là-dessus retirerait la sortie de secours au moment précis où elle sert. */
  const doc = draftDocument();
  for (const memoire of [{ ok: true }, { ok: false, raison: "QuotaExceededError" }]) {
    const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, memoire }, () => {});
    const bouton = node.querySelectorAll(".universe-memoire .universe-oubli")[0];
    assert.ok(bouton, `le bouton existe aussi quand ok=${memoire.ok}`);
    assert.notEqual(bouton.disabled, true, `il reste pressable quand ok=${memoire.ok}`);
  }
});

test("D5 — sans `memoire` dans le ctx, l'écran ne ment pas : il se tait sur l'échec", () => {
  /* Repli DÉCLARÉ : un appelant qui n'a pas encore d'état de mémoire (aucun
     aujourd'hui) ne fait pas clignoter une alerte rouge. */
  const doc = draftDocument();
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, () => {});
  assert.equal(node.querySelectorAll(".universe-memoire")[0].dataset.garde, "true");
});
