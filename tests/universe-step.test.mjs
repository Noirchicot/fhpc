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
import { makeHarness, manifestOf, readJson, SRD_EN, PILE_SRD, FH_SPECIES_EN, FH_ARCANA_EN, FH_FEATS_EN, FH_SPELLS_EN, FH_FICHE_EN, FH_LORE_EN }
  from "./build-harness.mjs";

globalThis.document = createTestDocument();

const { renderUniverseStep, currentStack, currentBooks, currentContent, fhRefChoices, SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS, LIVRE_LAYER_IDS, RULE_LAYER_IDS }
  = await import("../ui/builder/universe-step.mjs");

/** Les organes du tableau de commande. */
const interrupteurs = (node) => node.querySelectorAll(".interrupteur");
const fateSwitch = (node) => node.querySelectorAll(".tdc-regles .interrupteur").find((b) => /Fate/.test(b.textContent));
/* LOT 189 — le SRD est un VOYANT (Eric, 09/09), trouvé par sa donnée. */
const srdVoyant = (node) => node.querySelectorAll(".tdc-regles [data-socle]")[0];
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
  /* ⭐ LOT 196 — ELLES SONT DEUX. `srfh-mecaniques-en` déclare, dans la forme
     que le moteur lit, une mécanique que le texte SRD énonce en prose
     (`data[spell_list_choice]` sur Magic Initiate). Même rang, même raison :
     le texte est du livre, la FORME est une décision d'ici — donc ni l'un ni
     l'autre, donc les deux piles. */
  assert.deepEqual(SRFH_LAYER_IDS, ["srfh-shelving-en", "srfh-mecaniques-en"],
    "les couches srfh sont nommées à part — ni SRD, ni FH");
  /* ⛔ ET LE HARNAIS DES SUITES MONTE LA MÊME PILE SRD QUE L'ÉCRAN. C'est une
     QUATRIÈME liste (`PILE_SRD`, tests/build-harness.mjs) et elle divergerait
     comme les trois autres l'ont fait au lot 77 : une suite qui mesure « ce
     que le joueur a en SRD » sur une pile amputée est verte et ne prouve
     rien. Les deux listes sont donc CONFRONTÉES, jamais recopiées. */
  assert.deepEqual(PILE_SRD.map((f) => f.replace(/^layers\//, "").replace(/\.layer\.json$/, "")),
    [SRD_LAYER_ID, ...SRFH_LAYER_IDS],
    "la pile SRD des suites doit être la pile SRD de l'écran, dans le même ordre");
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
function campaignField(node) { return node.querySelectorAll(".doc-field-input")[0]; }

test("B1 — 🔴 UN SEUL INTERRUPTEUR « Fate's Hand » : éteint sur la pile SRD, allumé sur SRD + FH", () => {
  /* ⚖️ Tranché par Eric le 2026-09-08 — remplace les deux sélecteurs exclusifs
     du 17/08 (📍 `menu-regles-au-selecteur`). Le SRD est TOUJOURS la base ;
     Fate's Hand est une couche qu'on allume. Un seul état suffit à le dire. */
  const srd = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  const nSrd = renderUniverseStep({ document: srd, query: () => null, fieldErrors: {} }, () => {});
  const sw = fateSwitch(nSrd);
  assert.ok(sw, "l'interrupteur des règles existe");
  assert.equal(sw.textContent.replace(/\s+/g, " ").trim(), "Fate's Hand");
  assert.equal(sw.dataset.on, "false", "pile SRD → éteint");
  assert.equal(sw.getAttribute("aria-checked"), "false");
  const fh = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  const nFh = renderUniverseStep({ document: fh, query: () => null, fieldErrors: {} }, () => {});
  assert.equal(fateSwitch(nFh).dataset.on, "true", "pile SRD+FH → allumé");
  assert.equal(nFh.querySelectorAll(".bascule-liste").length, 0, "⛔ les deux anciens sélecteurs n'existent plus");
  /* LOT 189 — UN interrupteur sur la ligne, et un voyant à sa gauche : le SRD
     n'est plus un miroir grisé, c'est une lampe (Eric, 09/09). */
  assert.equal(nFh.querySelectorAll(".tdc-deux .interrupteur").length, 1, "un seul interrupteur sur la ligne : Fate's Hand");
  assert.equal(nFh.querySelectorAll(".tdc-deux .voyant[data-socle]").length, 1, "…et le voyant SRD à côté, sur la même ligne");
});

test("B2 — l'interrupteur dispatche {kind:\"requestLayerStack\"} vers l'AUTRE pile, jamais un verbe directement", () => {
  const srd = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  const a1 = [];
  fateSwitch(renderUniverseStep({ document: srd, query: () => null, fieldErrors: {} }, (a) => a1.push(a))).click();
  assert.deepEqual(a1, [{ kind: "requestLayerStack", value: "srdfh" }], "éteint → on demande SRD + FH");
  const fh = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  const a2 = [];
  fateSwitch(renderUniverseStep({ document: fh, query: () => null, fieldErrors: {} }, (a) => a2.push(a))).click();
  assert.deepEqual(a2, [{ kind: "requestLayerStack", value: "srd" }], "allumé → on demande SRD (la coquille confirmera)");
});

test("B2 bis — ⚔️ DEUX ÉTEINTS EST DEVENU IMPOSSIBLE PAR CONSTRUCTION : un interrupteur n'a que deux positions", () => {
  /* Le garde du 17/08 empêchait de recliquer la ligne allumée pour ne pas
     laisser le personnage sans pile. Avec UN interrupteur, l'état « aucune
     pile » n'existe plus : éteint = SRD, allumé = SRD + FH. Le garde se
     déplace : une pile HORS des deux noms doit toujours se DIRE. */
  const bizarre = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID]), choices: [], budgets: {}, overrides: [] } });
  const node = renderUniverseStep({ document: bizarre, query: () => null, fieldErrors: {} }, () => {});
  assert.equal(fateSwitch(node).dataset.on, "false", "une pile inconnue se montre éteinte, jamais allumée par défaut");
  const mots = node.querySelectorAll(".tdc-regles .doc-field-error").map((p) => p.textContent).join(" ");
  assert.match(mots, /doesn't match either ruleset/, "et l'écran le DIT");
});

test("B5 — la langue et les unités vivent dans APPEARANCE, en places réservées lisibles (pas les codes bruts)", () => {
  /* Eric, 26/08 : *« on note, on câble après »* — elles se montrent éteintes,
     avec leur valeur d'aujourd'hui. Eric, 08/09 : *« R doit tenir en une page »*
     — elles quittent la racine. */
  const doc = draftDocument({ lang: "en", units: { distance: "ft", weight: "lb" } });
  const racine = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, () => {});
  assert.equal(racine.querySelectorAll(".universe-locale-row").length, 0, "plus rien à la racine");
  const app = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, ecran: "display", fonds: [], echelle: { auto: {}, crans: [] } }, () => {});
  const reservees = app.querySelectorAll(".tdc-ligne[data-reserve]").map((b) => b.textContent.replace(/\s+/g, " ").trim());
  assert.ok(reservees.some((t) => /Language — English/.test(t)), `la langue, lisible — vu : ${reservees.join(" | ")}`);
  assert.ok(reservees.some((t) => /Units — feet · pounds/.test(t)), "les unités, lisibles");
  for (const b of app.querySelectorAll(".tdc-ligne[data-reserve]")) assert.equal(b.disabled, true, "réservée = éteinte");
});

/* ══ C — ⚔️ LE TEST QUI MONTRE CE QUE CHANGER DE PILE FAIT, SUR LA VRAIE
   PILE ET LE VRAI BLOC `build` (§3, test 5 de la commande) ═══════════════ */

test("C — ⚔️ passer de SRD+FH à SRD ne perd RIEN dans build.choices, dégrade le résolu (refus NOMMÉS), et l'aller-retour restaure tout", () => {
  /* ⭐ LOT 95 — `srfh-shelving-en` est dans cette pile parce qu'elle est dans
     les DEUX piles nommées : la bascule n'éteint que les couches FH, donc le
     rangement d'Eric survit au passage en « SRD seul ». Une pile de test qui
     l'oublierait ne serait reconnue NI comme « srd » NI comme « srdfh ». */
  /* 🔴 LOT 179 — CETTE LISTE ÉTAIT ÉCRITE À LA MAIN, ET ELLE A DIVERGÉ LE
     JOUR MÊME OÙ UNE COUCHE EST ENTRÉE. L'arrivée de `fh-soulforging-en`
     dans `engine.mjs` a fait monter à ce test une pile à neuf couches quand
     la page en montait dix : `currentStack` a rendu `null` — « ni srd ni
     srdfh » — et le test a rougi sur un document parfaitement sain.
     ⭐ C'EST EXACTEMENT LA FAUTE QUE LE TEST A0 DÉNONCE QUINZE LIGNES PLUS
     HAUT (« une liste écrite deux fois diverge »), et elle était ici, dans le
     même fichier, sur la même pile. Elle se DÉDUIT donc de `LAYER_FILES`,
     la source que A0 tient déjà pour vraie — la prochaine couche entrera
     dans cette pile de test sans que personne y pense. */
  const harness = makeHarness({ layers: LAYER_FILES.map((fichier) => `layers/${fichier}`) });
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

test("D1 — gardé : la tête de R le DIT (pastille verte), et le geste qui garde un fichier est LÀ", () => {
  /* ⚖️ RÉÉCRIT LE 08/09 : la phrase « Clearing this browser's site data erases
     it » a quitté R — *« R doit tenir en une page »*. La limite ne se dit plus
     en prose : elle se dit par le GESTE juste dessous, `Save`, qui est la seule
     copie qui survit. Un bouton vaut mieux qu'une mise en garde. */
  const doc = draftDocument();
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true } }, () => {});
  const bloc = node.querySelectorAll(".universe-memoire")[0];
  assert.ok(bloc, "le bloc existe");
  assert.equal(bloc.dataset.garde, "true");
  assert.match(bloc.querySelectorAll(".tdc-etat")[0].textContent, /in browser: .*saved/, "« in browser : <nom> · saved » (Eric)");
  assert.ok(bloc.querySelectorAll(".universe-sauver")[0], "et `Save` est là, à côté d'`Open`");
});

test("D2 — 🔴 PAS gardé : la raison du navigateur est RECOPIÉE dans la tête de R", () => {
  const doc = draftDocument();
  const node = renderUniverseStep({
    document: doc, query: () => null, fieldErrors: {},
    memoire: { ok: false, raison: "QuotaExceededError" }
  }, () => {});
  const bloc = node.querySelectorAll(".universe-memoire")[0];
  assert.equal(bloc.dataset.garde, "false");
  assert.match(bloc.textContent, /not saved: QuotaExceededError/, "le mot du navigateur, pas une prose inventée");
  assert.ok(bloc.querySelectorAll(".universe-sauver")[0], "et le geste qui reste possible est là : Save");
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

test("D8 — 🗄️ `Open` OUVRE LA PAGE DU MAGASIN, plus la boîte de fichiers du système", () => {
  /* ⚖️ Eric, 10/09 : *« quand j'appuie sur Open, j'ai une page avec toutes mes
     sauvegardes dedans »*. ⭐ LE GARDE EST RÉÉCRIT À LA NOUVELLE VÉRITÉ, ET IL
     EST PLUS STRICT : il exigeait un verbe quelconque ; il exige maintenant
     LEQUEL — `ouvrirLeMagasin`, jamais `ouvrirUnFichier`. ⚔️ Rebrancher `Open`
     sur la boîte du système → rouge ici.
     ⚠️ La boîte n'a pas disparu : elle vit dans la page (`Open a file…`), et
     c'est `tests/magasin.test.mjs` (P4) qui l'y tient — la loi du 06/09
     (*« je choisis où je range mes persos »*) n'a pas bougé.
     ⛔ ET IL N'EST PAS ROUGE : `--critical` est la teinte de ce qui DÉFAIT.
     La donner à un geste qui ouvre la rendrait illisible partout ailleurs. */
  const doc = draftDocument();
  const gestes = [];
  const node = renderUniverseStep(
    { document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true } },
    (a) => gestes.push(a)
  );
  const bouton = node.querySelectorAll(".universe-memoire .universe-ouvrir")[0];
  assert.ok(bouton, "le bouton d'ouverture vit dans la section « This character »");
  assert.match(bouton.textContent, /Open/, "son mot porte le geste");
  assert.ok(!bouton.className.includes("universe-oubli"),
    "⛔ il ne porte pas la classe de ce qui efface — la teinte suit le verbe");
  bouton.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirLeMagasin" }],
    "⛔ il n'ouvre plus la boîte du système : il ouvre le rang B où sont toutes les saves");
});

test("D9 — ⚠️ UNE OUVERTURE REFUSÉE SE DIT, avec le mot de la cause — ET LÀ OÙ LE GESTE A ÉTÉ FAIT", () => {
  /* Un fichier choisi qui ne rentre pas et un écran qui ne bouge pas, c'est un
     bouton mort du point de vue du joueur : il ne saura pas s'il a raté son
     geste ou son fichier. Même loi que le personnage illisible du navigateur.
     ⭐ LOT 195 — LE MOT A SUIVI SON BOUTON, ET C'EST UN RESSERREMENT : la boîte
     de fichiers ne s'ouvre plus depuis `R`, donc un mot posé dans la tête de `R`
     parlerait d'un geste que le joueur n'a pas fait SUR CET ÉCRAN. Le garde
     exige désormais les deux moitiés — rien en `R`, et le mot entier dans la
     page du magasin. ⚔️ Remettre le message en tête de `R` → rouge ici. */
  const doc = draftDocument();
  const racineAvecRefus = renderUniverseStep({
    document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true },
    ouvertureRefusee: 'this file says it is "roll20/2", not a Fate\'s Hand character'
  }, () => {});
  assert.equal(racineAvecRefus.querySelectorAll(".tdc-tete .doc-field-error").length, 0,
    "⛔ le tableau de commande ne parle plus d'un fichier : il n'en ouvre plus");

  const sansRefus = renderUniverseStep(
    { document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true }, ecran: "characters" }, () => {});
  assert.equal(sansRefus.querySelectorAll(".doc-field-error").length, 0,
    "⛔ rien à dire tant que rien n'a été refusé — un message permanent ne serait plus un message");

  const avecRefus = renderUniverseStep({
    document: doc, query: () => null, fieldErrors: {}, memoire: { ok: true }, ecran: "characters",
    ouvertureRefusee: 'this file says it is "roll20/2", not a Fate\'s Hand character'
  }, () => {});
  const dit = avecRefus.querySelectorAll(".doc-field-error").map((p) => p.textContent).join(" ");
  assert.match(dit, /not opened/, "l'écran dit que le fichier n'est pas entré");
  assert.match(dit, /roll20\/2/, "et il RECOPIE la cause, il ne la résume pas");
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

/* ══ R — LE TABLEAU DE COMMANDE — Eric, 2026-09-08 ═══════════════════════ */

function racine(ctx = {}, onAction = () => {}) {
  return renderUniverseStep({ document: draftDocument(), query: () => null, fieldErrors: {}, memoire: { ok: true }, ...ctx }, onAction);
}

test("R1 — 🧭 R porte le nom du produit en tête, centré, et son sous-titre", () => {
  const node = racine();
  assert.equal(node.querySelectorAll(".tdc-marque")[0].textContent, "SOWLREACH");
  assert.equal(node.querySelectorAll(".tdc-sous-titre")[0].textContent, "Agnostic SRD 5.2.1 interface");
  assert.match(node.querySelectorAll(".tdc-etat .tdc-nom")[0].textContent, /\S/, "et la ligne d'état porte le nom du personnage");
});

test("R2 — 🔴 le geste principal est `Build a character`, il émet un verbe de NAVIGATION, et R n'a pas de Done", () => {
  const gestes = [];
  const node = racine({}, (a) => gestes.push(a));
  const b = node.querySelectorAll(".tdc-majeur")[0];
  assert.equal(b.textContent, "Build a character");
  b.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "construireLePersonnage" }]);
  assert.equal(node.dataset.sortieIci, undefined, "⛔ pas de paire de sortie à la racine : un Done doublerait ce bouton");
});

test("R3 — la rangée du fichier est au FORMAT RÉGLEMENTÉ : Open et Save verts, Forget rouge, `Save` = l'export canonique", () => {
  const gestes = [];
  const node = racine({}, (a) => gestes.push(a));
  const trio = node.querySelectorAll(".parcours-pied.tdc-trio")[0];
  assert.ok(trio, "une rangée .parcours-pied : la coquille lui donne la grille et le plancher de 77");
  const boutons = trio.querySelectorAll("button");
  assert.deepEqual(boutons.map((b) => b.textContent), ["Open", "Save", "Forget"]);
  assert.ok(boutons[0].className.includes("tdc-vert") && boutons[1].className.includes("tdc-vert"), "Open et Save en vert (Eric)");
  assert.ok(boutons[2].className.includes("parcours-annuler"), "Forget rouge : il défait");
  boutons[1].dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "exportJson" }], "le MÊME écrivain que Sheet, jamais un second");
});

test("R4 — 💤 LES PLACES RÉSERVÉES : DM · Tools — présentes, éteintes, grises, avec leur mot", () => {
  /* Eric, 08/09 : *« il faut laisser une place à tout ce que j'ai dit »*. Au
     format réglementé (77), le mot « soon » n'a plus la place à côté du
     libellé : il vit dans le titre, et c'est le GRIS qui dit « pas encore »
     (📍 bouton-gris-non-cliquable). */
  const node = racine();
  const reservees = node.querySelectorAll("[data-reserve]");
  assert.deepEqual(reservees.map((b) => b.textContent.trim()), ["DM", "Tools"]);
  for (const b of reservees) {
    assert.equal(b.disabled, true, `${b.textContent} : réservée = éteinte`);
    assert.match(b.getAttribute("title") || "", /soon/, `${b.textContent} : et elle le DIT`);
  }
});

test("R5 — 🚪 LA RANGÉE DU BAS EST LA TRILOGIE : le livre, les trois portes au standard, Appearance vivante", () => {
  const gestes = [];
  const node = racine({}, (a) => gestes.push(a));
  const pied = node.querySelectorAll(".parcours-pied.tdc-pied")[0];
  assert.ok(pied, "la rangée du bas est une .parcours-pied : le ? y sera posé par la coquille");
  assert.ok(pied.querySelectorAll(".fiche-livre")[0], "📖 le livre est là — il manquait (Eric)");
  const portes = pied.querySelectorAll("button.tdc-porte");
  assert.deepEqual(portes.map((b) => b.textContent), ["Display", "DM", "Tools"]);
  const vivantes = portes.filter((b) => !b.disabled);
  assert.equal(vivantes.length, 1);
  vivantes[0].dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirDisplay" }]);
});

test("R6 — 🧑 `My characters` est un bouton VIVANT (bleu, cadré à gauche), et il ouvre LA MÊME PIÈCE QUE `Open`", () => {
  /* ⚖️ DEUX MOTS D'ERIC, VRAIS TOUS LES DEUX, DITS À DEUX JOURS D'ÉCART :
     *« My characters bouton large bleu cadré à gauche »* (08/09) et *« j'appuie
     sur Open, qui est sur R ; dans cette fenêtre, toutes mes saves »* (10/09).
     Depuis le lot 195 c'est le MÊME rang B. ⏳ Lequel des deux boutons reste est
     une question pour Eric (A-TRANCHER §C37) : ⛔ on ne retire pas en silence un
     bouton qu'il a dicté. Ce que ce garde tient, c'est qu'ils ne divergent pas —
     deux portes, une seule pièce, jamais deux pièces qui se ressemblent. */
  const gestes = [];
  const node = racine({}, (a) => gestes.push(a));
  const b = node.querySelectorAll(".tdc-liste")[0];
  assert.equal(b.textContent, "My characters");
  assert.equal(b.disabled, false);
  b.dispatchEvent({ type: "click" });
  const ouvre = node.querySelectorAll(".universe-ouvrir")[0];
  ouvre.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [{ kind: "ouvrirLeMagasin" }, { kind: "ouvrirLeMagasin" }],
    "⛔ deux verbes différents feraient deux pièces qui se ressemblent");
  const b1 = renderUniverseStep({
    document: draftDocument({ name: "Ilyra" }), query: () => null, fieldErrors: {}, memoire: { ok: true },
    ecran: "characters", magasin: { etat: "liste", groupes: [], entrees: [] }
  }, () => {});
  assert.equal(b1.dataset.ecran, "characters");
  assert.equal(b1.dataset.sortieIci, "true", "rang B : la coquille pose Back · Done");
});

test("R7 — 💡 LE SRD EST UN VOYANT : même ligne, TOUJOURS allumé, et il n'est pas un contrôle", () => {
  /* ⚖️ RÉÉCRIT LE 09/09 À LA NOUVELLE VÉRITÉ, ET NON RELÂCHÉ. Eric, 08/09 :
     *« un switch pour SRD même s'il est inactif, même ligne, donc off »* ; puis,
     devant la v612 : *« Le bouton SRD est un VOYANT, pas un bouton — il est
     toujours actif. »* Le second mot corrige le premier sur deux points :
     · la FORME — plus un interrupteur grisé (qui a l'air d'un bouton qu'on ne
       peut pas pousser), une lampe ;
     · le SENS — plus un miroir INVERSÉ de Fate's Hand (« quand l'un s'allume,
       l'autre s'éteint », 17/08) : le SRD est allumé dans les DEUX piles.
     ⛔ Le garde d'avant exigeait `on` opposé à Fate's Hand ; celui-ci exige
     `on` dans les deux états — c'est là qu'il diverge, et c'est là qu'on
     l'éprouve. */
  const srd = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  const fh = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  for (const [doc, fate] of [[srd, "false"], [fh, "true"]]) {
    const gestes = [];
    const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, (a) => gestes.push(a));
    const lampe = srdVoyant(node);
    assert.ok(lampe, "le voyant SRD existe, sur la ligne des règles");
    assert.equal(fateSwitch(node).dataset.on, fate, `témoin : Fate's Hand est ${fate === "true" ? "allumé" : "éteint"}`);
    assert.equal(lampe.dataset.on, "true", `le SRD est allumé quand Fate's Hand est ${fate === "true" ? "allumé" : "éteint"} — « il est toujours actif »`);
    assert.match(lampe.textContent, /always on/, "…et il le DIT");
    /* ⛔ PAS UN CONTRÔLE — sur ce que l'arbre d'accessibilité annonce. */
    assert.notEqual(lampe.tagName, "BUTTON", "un voyant n'est pas un bouton");
    assert.equal(lampe.getAttribute("role"), "status", "une région d'état, lue comme du texte");
    assert.notEqual(lampe.getAttribute("role"), "switch");
    assert.equal(lampe.getAttribute("aria-checked"), null, "aucun aria-checked : il n'a pas deux positions");
    assert.notEqual(lampe.disabled, true, "et pas `disabled` : il n'y a rien à retenir");
    lampe.click();
    assert.deepEqual(gestes, [], "le cliquer n'émet RIEN — il n'a aucun écouteur");
    /* ⛔ ET AUCUN `role=switch` DU MENU NE S'APPELLE SRD : la moitié qui attrape
       un interrupteur SRD reposé ailleurs que sur `data-socle`. */
    const reste = node.querySelectorAll('[role="switch"]').filter((b) => /^SRD/.test(b.textContent.trim()));
    assert.deepEqual(reste, [], "un interrupteur nommé SRD existe encore au Menu");
  }
});

test("S1 — 🔴 L'INTERRUPTEUR : role=switch, aria-checked = data-on, et cliquer INVERSE", () => {
  /* Trois canaux pour un état — la couleur (feuille, sur data-on), la position
     (feuille), et aria-checked. L'écran n'écrit aucune couleur. */
  /* ⚠️ ÉPROUVÉ SUR LES DEUX ÉTATS — vu vert à tort le 08/09 : testé sur la seule
     pile SRD (éteint), un `aria-checked` figé à "false" coïncidait avec `data-on`
     et le garde ne voyait rien. Un garde d'égalité se teste là où les deux
     valeurs DIVERGENT si l'une est fausse. */
  const fhDoc = draftDocument({ build: { layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: [] } });
  for (const node of [racine(), racine({ document: fhDoc })]) {
    for (const sw of node.querySelectorAll(".interrupteur")) {
      assert.equal(sw.getAttribute("role"), "switch");
      assert.equal(sw.getAttribute("aria-checked"), sw.dataset.on, "aria-checked porte EXACTEMENT data-on");
      assert.ok(sw.querySelectorAll(".interrupteur-piste .interrupteur-pouce")[0], "une piste, un pouce — dessinés, jamais un glyphe");
    }
  }
  assert.equal(fateSwitch(racine({ document: fhDoc })).dataset.on, "true", "témoin : le second écran est bien ALLUMÉ");
  const vus = [];
  const sw = fateSwitch(racine({}, (a) => vus.push(a)));
  const avant = sw.dataset.on === "true";
  sw.click();
  assert.equal(vus.length, 1);
  assert.equal(vus[0].value, avant ? "srd" : "srdfh", "le clic demande l'INVERSE de l'état affiché");
});

test("S2 — APPEARANCE : Tutorials et Double view sont des interrupteurs ; Double view grisé quand la fenêtre ne le porte pas", () => {
  const app = (ctx) => renderUniverseStep({ document: draftDocument(), query: () => null, fieldErrors: {}, ecran: "display", fonds: [], echelle: { auto: {}, crans: [] }, ...ctx }, () => {});
  const n1 = app({ tutoriel: true, vueDouble: true, vueDoublePossible: true });
  const sws = n1.querySelectorAll(".interrupteur");
  const mots = sws.map((b) => b.querySelectorAll(".interrupteur-mot")[0].textContent);
  assert.deepEqual(mots, ["Tutorials", "Double view"]);
  assert.deepEqual(sws.map((b) => b.dataset.on), ["true", "true"]);
  const n2 = app({ tutoriel: false, vueDouble: true, vueDoublePossible: false });
  const vue = n2.querySelectorAll(".interrupteur")[1];
  assert.equal(vue.disabled, true, "sous la porte : désarmé, jamais retiré");
  assert.equal(vue.dataset.on, "false", "et il s'affiche ÉTEINT : une préférence gardée mais inapplicable ne s'annonce pas allumée");
  assert.match(n2.textContent, /too small for two panels/, "et il DIT pourquoi il dort");
});

/* ══════════════════════════════════════════════════════════════════════════
   ⚖️ LES LIVRES DU JOUEUR — un axe orthogonal aux règles (Eric, 09/09)
   « que tu puisses désactiver dmg player et toujours te raccrocher au SRD »,
   « tu dois pouvoir les activer et les désactiver ».
   ══════════════════════════════════════════════════════════════════════════ */

test("A5 — ⛔ LA MINE : un livre allumé ne doit PAS rendre la pile inconnue", () => {
  /* 🔴 SANS LE CORRECTIF, CE TEST EST ROUGE ET L'ÉCRAN MORT S'AFFICHE POUR
     TOUT LE MONDE. `currentStack` comparait la pile déclarée par ÉGALITÉ
     EXACTE de l'ensemble ; `ecran-mort.mjs:97` rend « pile inconnue » dès que
     `currentStack` est `null` sur un document qui porte des couches. Allumer
     le DMG suffisait donc à condamner tous les personnages. */
  const avecLivre = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xdmg-en"]),
    choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(avecLivre), "srd",
    "un personnage SRD qui allume son DMG joue TOUJOURS en SRD — le livre apporte du contenu, pas des règles");

  const fhAvecDeuxLivres = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xphb-en", "xdmg-en", ...FH_LAYER_IDS]),
    choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(fhAvecDeuxLivres), "srdfh",
    "et Fate's Hand avec les deux livres reste Fate's Hand");
});

test("A6 — `currentBooks` dit QUELS livres sont allumés, dans un ordre STABLE", () => {
  const aucun = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS]), choices: [], budgets: {}, overrides: []
  } });
  assert.deepEqual(currentBooks(aucun), [], "aucun livre : la liste est vide, pas nulle");
  /* ⚔️ L'ORDRE EST CELUI DE `LIVRE_LAYER_IDS`, PAS CELUI DU DOCUMENT — deux
     documents qui portent les mêmes livres doivent rendre la MÊME liste, sinon
     le Menu afficherait ses interrupteurs dans un ordre qui change tout seul. */
  const inverse = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xdmg-en", "xphb-en"]),
    choices: [], budgets: {}, overrides: []
  } });
  assert.deepEqual(currentBooks(inverse), LIVRE_LAYER_IDS,
    "l'ordre vient de la liste, jamais du document");
  assert.deepEqual(currentBooks(null), [], "un document absent n'est pas une erreur, c'est zéro livre");
});

test("A7 — ⚔️ CE QUI REND UNE PILE INNOMMABLE, C'EST UNE RÈGLE QUI MANQUE — PAS DU CONTENU EN TROP", () => {
  /* ⛔ LE RISQUE DU CORRECTIF : à force d'ignorer des couches, `currentStack`
     pourrait finir par tout accepter. Il doit continuer à refuser ce qui l'a
     toujours mérité — une pile FH amputée d'une de ses couches de RÈGLES. */
  const fhIncomplete = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xdmg-en", ...FH_LAYER_IDS.slice(1)]),
    choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(fhIncomplete), null,
    "il manque une couche FH : la pile reste innommable, et le livre n'y change rien");
  const sansSrfh = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...FH_LAYER_IDS]), choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(sansSrfh), null, "sans `srfh`, aucune des deux piles nommées ne colle");
});

test("A8 — ⚖️ « SI ON A BIEN FAIT NOTRE BOULOT, LES LIVRES RAJOUTENT DU HOMEBREW » (Eric, 09/09)", () => {
  /* 🔴 C'EST UNE ÉPREUVE, PAS UNE PHRASE. Elle dit : un livre ne doit être
     qu'un cas de homebrew. Si le code doit CONNAÎTRE le nom d'un livre pour
     que la pile tienne, on a mal fait le travail — et c'était le cas une heure
     plus tôt, avec une liste `LIVRE_LAYER_IDS` en dur consultée par
     `currentStack`. Ce test est ce qui empêche ce cas particulier de revenir. */
  const inconnue = "la-classe-que-mon-ami-a-ecrite";
  assert.equal(RULE_LAYER_IDS.includes(inconnue), false, "témoin : personne n'a jamais entendu parler de cette couche");
  assert.equal(LIVRE_LAYER_IDS.includes(inconnue), false, "témoin : ce n'est pas un livre non plus");
  const doc = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, inconnue]), choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(doc), "srd",
    "⛔ un homebrew que personne n'a listé ne doit PAS envoyer le personnage sur l'écran mort");
  assert.deepEqual(currentContent(doc), [inconnue], "il est vu, nommé, et rangé du côté du CONTENU");

  /* ⚔️ ET LA MÊME CHOSE POUR UN LIVRE — la preuve qu'il n'a rien de spécial :
     les deux passent par le MÊME chemin, et rendent le MÊME résultat. */
  const avecLivre = draftDocument({ build: {
    layers: manifestFor([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "xdmg-en"]), choices: [], budgets: {}, overrides: []
  } });
  assert.equal(currentStack(avecLivre), currentStack(doc),
    "un livre et un homebrew inconnu doivent donner EXACTEMENT le même nom de pile");
  assert.equal(currentContent(avecLivre).length, currentContent(doc).length,
    "et être comptés du même côté");
});
