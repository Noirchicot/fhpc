/* ══ LOT 194 — UN DON *ACCORDÉ* SE CONFIGURE COMME UN DON *CHOISI* ══════════

   ⚖️ ERIC, 2026-09-10, sur l'Acolyte du fil SRD : *« B3 : […] ici le background
   Acolyte est incomplet. Alors attention : **Magic Initiate nécessite un
   bouton, ça doit être configuré — exactement le même chemin que dans FH, tu
   as juste à recopier.** »*

   📏 CE QUI A ÉTÉ MESURÉ LE 10/09, ET QU'IL FAUT DIRE EN ENTIER, parce que la
   moitié de ce lot en dépend :

     ① LE CÂBLAGE ÉTAIT BORNÉ AU DON CHOISI. `featSpellListPlan` et
        `featSpellPlans` cherchaient le don dans un `choose` du DOCUMENT. En
        Fate's Hand le don d'origine se choisit, donc il y en a un ; en SRD
        l'arrière-plan l'IMPOSE (`feat_id`) et aucun `choose` n'existe — les
        deux plans rendaient `[]`, l'Acolyte n'avait ni liste ni sorts. C'est
        ce que ce fichier répare, et ce que ses gardes tiennent.

     ② 🔴 ET LA DÉCLARATION, ELLE, MANQUE À LA PILE SRD — CE N'EST PAS
        RÉPARABLE DANS CE DÉPÔT. `data.spell_list_choice` (les trois listes, 2
        tours mineurs, 1 sort de niveau 1) est portée par `fh-feats-en`, une
        couche Fate's Hand derrière l'interrupteur Destiny. La couche SRD ne la
        porte pas, et elle est GÉNÉRÉE (`src/tools/gen-srd-layer.mjs`) depuis
        les exports du dépôt `fh-srd` : on ne l'y écrit pas à la main.
        ⇒ En pile SRD nue, Magic Initiate n'ouvre donc toujours rien — et
        `tests/fil-srd-ecrans.test.mjs` le MESURE, plutôt que de le taire.
        ⇒ La question « où doit vivre cette déclaration ? » revient à Eric :
        c'est une mécanique du SRD 5.2.1 (elle est dans le texte du don), donc
        sa place est l'export `fh-srd`, pas le convertisseur.

   ⭐ CE FICHIER PROUVE LE MÉCANISME AVEC LA *VRAIE* DÉCLARATION, lue dans
   `fh-feats-en` et montée par une couche de fixture. ⛔ Rien n'est retypé ici :
   si la déclaration change, ce test change avec elle — et le jour où elle
   arrive dans le SRD, l'Acolyte obtient ses écrans sans qu'une ligne bouge. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, uneCouche, readJson, SRD_EN } from "./build-harness.mjs";
import { itemsDeLEtape, porteUneDecisionOuverte } from "../ui/builder/parcours.mjs";

globalThis.document = createTestDocument();

const { BACKGROUND_CATALOGUE } = await import("../ui/builder/background-step.mjs");
const { renderFeatSortsGlisse, featListPlan } = await import("../ui/builder/inheritance-step.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shellText = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8");

const MI = "srd:feat:en:magic-initiate";
const ACOLYTE = "srd:background:en:acolyte";
const SOLDIER = "srd:background:en:soldier";

/** LA DÉCLARATION, LUE — jamais recopiée. C'est l'objet que `fh-feats-en`
 *  patche sur Magic Initiate, et le seul que ce test connaisse. */
const DECLARATION = readJson("layers/fh-feats-en.layer.json")
  .records.feat[MI].changes["data[spell_list_choice]"];

/** La même déclaration, montée SANS Fate's Hand : une couche de fixture qui ne
 *  lève aucun drapeau et n'ajoute rien d'autre. C'est le seul écart avec la
 *  pile SRD que le joueur a aujourd'hui. */
const COUCHE = uneCouche("fixture-194-declaration", {
  feat: { [MI]: { op: "patch", changes: { "data[spell_list_choice]": DECLARATION } } }
});

function pile(avecDeclaration) {
  return avecDeclaration
    ? makeHarness({ layers: [SRD_EN], extra: COUCHE })
    : makeHarness({ layers: [SRD_EN] });
}

function docDe(H, backgroundId, extra = []) {
  return {
    schema: "fh-char/1", id: "lot194", name: "lot194", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/lot194-don-accorde", version: "1.0.0" },
    created: "2026-09-10T00:00:00Z", modified: "2026-09-10T00:00:00Z",
    build: {
      layers: manifestOf(H.layers),
      choices: [
        { path: "level", value: 1 },
        { path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } },
        { path: "species", ref: { kind: "species", id: "srd:species:en:elf" } },
        { path: "background", ref: { kind: "background", id: backgroundId } },
        ...["str", "dex", "con", "int", "wis", "cha"].map((k) => ({ path: `abilities.${k}`, value: 12 })),
        ...extra
      ],
      budgets: {}, overrides: [], confirmed: []
    }
  };
}

const ctxDe = (H, report) => ({
  decisions: report.decisions, query: H.layers.verbs.query, document: report.document,
  resolved: report.resolved, drapeaux: H.layers.verbs.flags()
});

/* ══ ① LE TÉMOIN : CE QUE LA PILE SRD PORTE VRAIMENT ═══════════════════════ */

test("📏 témoin — la couche SRD ne déclare AUCUN `spell_list_choice` : c'est `fh-feats-en` qui le porte, derrière un interrupteur", () => {
  const nue = pile(false);
  const don = nue.layers.verbs.query({ kind: "feat", id: MI });
  assert.ok(don, "le don existe dans le SRD");
  assert.equal(don.record.data.spell_list_choice, undefined,
    "⇒ en pile SRD, il n'y a rien à configurer : le trou est DANS LA DONNÉE, pas dans l'écran");
  assert.deepEqual([...nue.layers.verbs.flags()], [], "témoin : aucune couche FH montée");
  /* et la déclaration lue est bien celle de Fate's Hand, entière */
  assert.deepEqual(Object.keys(DECLARATION).sort(), ["cantrips", "from", "prepared"]);
  assert.equal(DECLARATION.from.length, 3);
});

/* ══ ② LE CÂBLAGE — un don IMPOSÉ publie ses branches ══════════════════════ */

test("🔴 l'Acolyte IMPOSE Magic Initiate (Cleric) : la liste sort RÉPONDUE et requise, les sorts s'ouvrent aux MÊMES chemins qu'en Fate's Hand", () => {
  const H = pile(true);
  const report = H.build.verbs.rebuild({ document: docDe(H, ACOLYTE) });
  const plan = (chemin) => report.decisions.find((p) => p.path === chemin);

  const don = plan("background.originFeat[0]");
  assert.equal(don.provenance.mode, "required", "témoin : le don est accordé, pas choisi");
  assert.deepEqual(don.selected, [MI]);
  assert.ok(!report.document.build.choices.some((c) => c.path === "background.originFeat[0]"),
    "⛔ et AUCUN `choose` au document : c'est là que l'ancien câblage perdait le don");

  const liste = plan("background.originFeat[0].list");
  assert.ok(liste, "la liste est publiée");
  const option = H.layers.verbs.query({ kind: "background", id: ACOLYTE }).record.data.feat_option;
  assert.deepEqual(liste.selected, [option.id], "…et RÉPONDUE par le record : « Magic Initiate (Cleric) »");
  assert.equal(liste.provenance.mode, "required", "il n'y a pas de question — donc pas de porte (NORMES §6 pré quinquies)");

  const mineurs = plan("background.originFeat[0].cantrips");
  const niveau1 = plan("background.originFeat[0].prepared");
  assert.equal(mineurs.expected, DECLARATION.cantrips, "le compte vient de la couche, jamais de l'écran");
  assert.equal(niveau1.expected, DECLARATION.prepared);
  assert.ok(mineurs.options.length > 0 && niveau1.options.length > 0, "et leurs options sont peuplées");
  const niveaux = new Set(mineurs.options.map((id) => H.layers.verbs.query({ kind: "spell", id }).record.data.level));
  assert.deepEqual([...niveaux], [0], "les tours mineurs sont de niveau 0");
});

test("🔴 la liste imposée n'ouvre AUCUNE porte, et les sorts ne sont pas des items de l'étape — un seul segment sous la racine", () => {
  const H = pile(true);
  const report = H.build.verbs.rebuild({ document: docDe(H, ACOLYTE) });
  const items = itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "background" })
    .map((i) => i.path);
  assert.deepEqual(items, ["background.boost", "background.originFeat[0]"],
    "les bonus, et LE DON — la liste et les sorts vivent DEDANS");
});

test("🔴 le don configurable prend une PORTE ; l'autre reste sur la ligne « gagné d'office » — jamais les deux", () => {
  const H = pile(true);
  const acolyte = H.build.verbs.rebuild({ document: docDe(H, ACOLYTE) });
  const ctxA = ctxDe(H, acolyte);
  assert.equal(porteUneDecisionOuverte(acolyte.decisions, "background.originFeat[0]"), true);
  const porte = BACKGROUND_CATALOGUE.itemLabel("background.originFeat[0]", ctxA);
  assert.equal(typeof porte, "object", "la porte nomme la réponse et garde sa question en sous-titre");
  assert.equal(porte.sous, "origin feat");
  assert.match(porte.mot, /Magic Initiate \(Cleric\)/, "l'option fixée par l'arrière-plan fait partie du mot");
  const resumeA = BACKGROUND_CATALOGUE.resumeItem({ path: "background.granted" }, ctxA, () => {});
  assert.equal(/Magic Initiate/.test(resumeA.textContent), false,
    "⛔ soit la porte, soit le résumé — Eric, 26/08 : jamais les deux");
  assert.match(resumeA.textContent, /Insight/, "…et le reste du gagné d'office ne bouge pas");

  /* ⚔️ LE DON QUI N'A RIEN À RÉGLER : aucune porte, et il garde sa ligne. */
  const soldier = H.build.verbs.rebuild({ document: docDe(H, SOLDIER) });
  const ctxS = ctxDe(H, soldier);
  assert.equal(porteUneDecisionOuverte(soldier.decisions, "background.originFeat[0]"), false);
  assert.ok(!itemsDeLEtape({ decisions: soldier.decisions, document: soldier.document, racine: "background" })
    .some((i) => i.path === "background.originFeat[0]"), "Savage Attacker n'ouvre rien (lot 190)");
  assert.match(BACKGROUND_CATALOGUE.resumeItem({ path: "background.granted" }, ctxS, () => {}).textContent,
    /Savage Attacker/, "et il reste sur la ligne « gagné d'office », avec sa fenêtre au tap");
});

/* ══ ③ L'ORGANE — celui d'Inheritance, pas un double ═══════════════════════ */

test("🔴 les sorts du don accordé passent par L'ORGANE D'INHERITANCE (`renderFeatSortsGlisse`), sur le plan que le carnet publie", () => {
  const H = pile(true);
  const report = H.build.verbs.rebuild({ document: docDe(H, ACOLYTE) });
  const ctx = ctxDe(H, report);
  assert.ok(featListPlan(report.decisions), "le B emboîté a de quoi s'ouvrir");
  const bloc = renderFeatSortsGlisse(ctx, () => {}, "background.originFeat[0].cantrips");
  assert.ok(bloc, "l'organe rend l'écran des tours mineurs");
  const plan = report.decisions.find((p) => p.path === "background.originFeat[0].cantrips");
  assert.equal(bloc.querySelectorAll("[data-creneau]").length, plan.expected, "deux collecteurs, comme le record le dit");
  const valeurs = [...bloc.querySelectorAll(".glisse-jeton")].map((j) => j.getAttribute("data-valeur"));
  assert.ok(valeurs.length > 0 && valeurs.every((v) => plan.options.includes(v)),
    "chaque jeton vient du plan — aucune liste de sorts écrite dans un écran");
});

test("🔴 la coquille route le B du don par LE MÊME `FEAT_PARCOURS`, dans les deux branches — pas un second cfg", () => {
  /* ⛔ Source, et le fichier le dit : ce routage lit l'état de module de la
     coquille et n'est pas exportable. Ce qui se garde est qu'il n'existe qu'UN
     cfg pour le don — un second serait deux écrans à tenir d'accord. */
  const occurrences = shellText.match(/renderParcoursItem\(FEAT_PARCOURS, ctx\)/g) || [];
  assert.equal(occurrences.length, 2, "la branche des catalogues (SRD) et celle de l'Inheritance, le MÊME cfg");
  assert.equal((shellText.match(/renderParcoursGuide\(FEAT_PARCOURS, ctx\)/g) || []).length, 2);
  assert.equal((shellText.match(/const FEAT_PARCOURS = \{/g) || []).length, 1,
    "⛔ un seul FEAT_PARCOURS dans toute la coquille");
  /* ⚔️ ATTAQUE — retirer la branche SRD laisse l'Acolyte sans écran */
  const mutee = shellText.replace("      section.append(renderParcoursItem(FEAT_PARCOURS, ctx));\n", "");
  assert.notEqual(mutee, shellText, "témoin : la mutation a mordu");
  assert.equal((mutee.match(/renderParcoursItem\(FEAT_PARCOURS, ctx\)/g) || []).length, 1,
    "sans elle, seule l'Inheritance sait ouvrir les sorts d'un don");
});

/* ══ ④ ET SANS LA DÉCLARATION, RIEN — la moitié qui prouve qu'aucun id de don
   n'est écrit dans le moteur ═══════════════════════════════════════════════ */

test("⚔️ ATTAQUE — la même pile SANS la déclaration : l'Acolyte n'ouvre ni liste ni sorts, et n'a pas de porte de don", () => {
  const H = pile(false);
  const report = H.build.verbs.rebuild({ document: docDe(H, ACOLYTE) });
  for (const chemin of ["background.originFeat[0].list", "background.originFeat[0].cantrips", "background.originFeat[0].prepared"]) {
    assert.equal(report.decisions.find((p) => p.path === chemin), undefined, `${chemin} : rien`);
  }
  assert.deepEqual(itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "background" })
    .map((i) => i.path), ["background.boost"], "aucune porte de don — c'est l'état que le joueur a aujourd'hui");
  assert.match(BACKGROUND_CATALOGUE.resumeItem({ path: "background.granted" }, ctxDe(H, report), () => {}).textContent,
    /Magic Initiate/, "le don retombe sur la ligne « gagné d'office », et le joueur ne choisit pas ses sorts");
});
