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

     ② 🔴 ET LA DÉCLARATION, ELLE, MANQUAIT À LA PILE SRD — C'EST LE LOT 196
        QUI L'A POSÉE, et il faut lire les deux états pour comprendre ce que ce
        fichier garde. Jusqu'au 10/09, `data.spell_list_choice` (les trois
        listes, 2 tours mineurs, 1 sort de niveau 1) n'était portée que par
        `fh-feats-en`, derrière l'interrupteur Destiny ; ce fichier montait
        donc une couche de FIXTURE pour prouver le câblage, et la question
        « où doit vivre cette déclaration ? » revenait à Eric.

        ⚖️ IL A RÉPONDU LE 10/09 : *« Reproduis exactement dans backgrounds ce
        que tu trouves pour Magic Initiate dans FH, rien ne change. Fais-le ! »*
        La déclaration vit maintenant dans `srfh-mecaniques-en` — le rang du
        lot 95, ce qui est AMBIGU et monte dans LES DEUX piles. ⛔ Ni dans la
        couche SRD (GÉNÉRÉE depuis les exports `fh-srd` : on ne l'y écrit pas à
        la main), ni dans `srfh-shelving-en` (GÉNÉRÉE aussi, et son générateur
        n'accepte que le genre `shelving`).

   ⭐ CE FICHIER NE MONTE DONC PLUS AUCUNE FIXTURE, ET C'EST TOUT LE GAIN : il
   monte `PILE_SRD`, la pile que le joueur a VRAIMENT quand il choisit « SRD »
   au tableau de commande. Ce qu'il mesurait par procuration, il le mesure
   maintenant en vrai. ⛔ Rien n'est retypé ici : la déclaration est LUE dans sa
   couche, donc si elle change, ce test change avec elle.

   ⚔️ LA MUTATION QUI LE FAIT ROUGIR — retirer `data[spell_list_choice]` de
   `layers/srfh-mecaniques-en.layer.json`. Elle a été JOUÉE, et voici ce qu'elle
   a produit, mesuré : **8 gardes rouges sur 51**, dont **5 des 7 de ce
   fichier** (les deux survivants ne touchent pas la déclaration : le routage de
   la coquille, et l'attaque qui vérifie justement l'absence). Les 3 autres sont
   `B0`/`BS` de `fh-arcana.test.mjs` et « UN PLAN REQUIS N'EST PAS UNE PORTE »
   de `fil-srd-ecrans.test.mjs` — l'Acolyte reperd sa porte. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, readJson, SRD_EN, PILE_SRD } from "./build-harness.mjs";
import { itemsDeLEtape, porteUneDecisionOuverte } from "../ui/builder/parcours.mjs";

globalThis.document = createTestDocument();

const { BACKGROUND_CATALOGUE } = await import("../ui/builder/background-step.mjs");
const { renderFeatSortsGlisse, featListPlan } = await import("../ui/builder/inheritance-step.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shellText = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8");

const MI = "srd:feat:en:magic-initiate";
const ACOLYTE = "srd:background:en:acolyte";
const SOLDIER = "srd:background:en:soldier";

/** LA DÉCLARATION, LUE — jamais recopiée. C'est l'objet que
 *  `srfh-mecaniques-en` patche sur Magic Initiate (lot 196), et le seul que ce
 *  test connaisse. ⛔ Il ne sait pas ce qu'elle contient : il sait seulement
 *  que l'écran doit en sortir ce qu'elle dit. */
const DECLARATION = readJson("layers/srfh-mecaniques-en.layer.json")
  .records.feat[MI].changes["data[spell_list_choice]"];

/** ⭐ DEUX PILES, ET LA DIFFÉRENCE ENTRE ELLES EST LE SUJET DU FICHIER :
 *   · `pile(true)`  = `PILE_SRD` — la pile que le joueur a quand il choisit
 *     « SRD » au tableau de commande : le livre, plus les DEUX couches `srfh`.
 *   · `pile(false)` = `SRD_EN` seule — LE LIVRE, et rien d'autre. C'est un
 *     TÉMOIN, pas un pli que quelqu'un monte : il sert à dire « le texte du
 *     SRD, à lui tout seul, ne porte pas cette forme-là ». */
function pile(avecDeclaration) {
  return makeHarness({ layers: avecDeclaration ? PILE_SRD : [SRD_EN] });
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

test("📏 témoin — le LIVRE seul ne déclare aucun `spell_list_choice` ; la PILE SRD, elle, le porte — et sans lever un seul drapeau FH", () => {
  /* ① LE LIVRE NU : le trou est DANS LA DONNÉE, pas dans l'écran. C'est ce qui
     rendait la mesure du lot 194 juste, et c'est toujours vrai du livre. */
  const livre = pile(false);
  const donNu = livre.layers.verbs.query({ kind: "feat", id: MI });
  assert.ok(donNu, "le don existe dans le SRD");
  assert.equal(donNu.record.data.spell_list_choice, undefined,
    "le texte du SRD énonce le choix en prose — il ne porte pas la FORME que le moteur lit");

  /* ② LA PILE SRD DU JOUEUR : elle le porte, et à l'octet près. */
  const srd = pile(true);
  const don = srd.layers.verbs.query({ kind: "feat", id: MI });
  assert.deepEqual(don.record.data.spell_list_choice, DECLARATION,
    "⇒ en pile SRD, il y a de quoi configurer : la déclaration est montée par `srfh-mecaniques-en`");
  assert.deepEqual(Object.keys(DECLARATION).sort(), ["cantrips", "from", "prepared"]);
  assert.equal(DECLARATION.from.length, 3);

  /* ③ 🔴 ET AUCUN DRAPEAU FH NE S'EST LEVÉ. C'est la moitié qui prouve que la
     déclaration est bien du `srfh` et non du Fate's Hand entré par la porte de
     derrière : un drapeau ici allumerait des modules, et « SRD » cesserait de
     vouloir dire SRD. */
  assert.deepEqual([...srd.layers.verbs.flags()], [],
    "la pile SRD ne lève aucun drapeau — `srfh` n'est pas Fate's Hand");
  assert.deepEqual(srd.layers.verbs.stack().map((c) => c.id),
    ["srd-5.2.1-en", "srfh-shelving-en", "srfh-mecaniques-en"],
    "et elle monte trois couches, dans cet ordre — le patch a besoin de son record dessous");

  /* ④ ⛔ UN SEUL ÉCRIVAIN. `fh-feats-en` posait ce champ jusqu'au lot 196 ; s'il
     le reposait, les deux couches diraient la même chose aujourd'hui et
     divergeraient en silence au premier réglage. */
  const fhFeats = readJson("layers/fh-feats-en.layer.json").records.feat[MI].changes;
  assert.deepEqual(Object.keys(fhFeats), ["data.blurb"],
    "`fh-feats-en` ne porte plus que le TEXTE D'ÉCRAN — la mécanique a UN écrivain, et il est plus bas");
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
