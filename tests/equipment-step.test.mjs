/* ══ LES TESTS DU LOT 49 — L'ÉTAPE EQUIPMENT ═════════════════════════════

   Même patron que `tests/abilities-step.test.mjs`/`tests/destiny-step.test.mjs` :
   ZÉRO plan `decisions[]` pour `gear`/`currency`/`class` (mesuré, commande
   §0.2) — cette suite ne construit donc pas son `ctx` comme
   `class-species-steps.test.mjs` (`decisions`) : elle passe `document` (le
   brut, seule source des lignes `gear[N]` et de la bourse) et `resolved` (la
   fiche dérivée, jamais recalculée par l'écran).

   ⛔ `shell.mjs` N'A AUCUN EXPORT (il exécute son propre `render()` à
   l'import) — les TROIS gestes composites qu'il ajoute pour ce lot
   (`addGearLine`, `removeGearLine`, `addInheritedPurse`) ne peuvent donc pas
   être exercés via un vrai harnais de rendu. Même limite, même réponse que
   `abilities-step.test.mjs` (« garde 11 ») : les trois fonctions
   `applyAddGearLine`/`applyRemoveGearLine`/`applyAddInheritedPurse`
   ci-dessous sont des COPIES de la logique de `shell.mjs`, écrites pour ce
   test, qui pilotent les VRAIS verbes (`choose`/`set`/`clear`/`rebuild`) —
   elles prouvent le résultat, jamais que `shell.mjs` lui-même est
   correctement câblé. Le garde d'octets, plus bas, couvre ce second point,
   au même patron que « garde 11 » de `tests/ui-jetons.test.mjs`. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { CURRENCY_KEYS } from "../src/build/index.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const UI_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");

const {
  renderEquipmentStep, renderEquipmentBar, whatYouHave, currentGearLines, currentCurrency, nextGearIndex, INHERITED_PURSE_GP
} = await import("../ui/builder/equipment-step.mjs");

const fixture = exempleFhEn();
const { build, layers } = fixture;
const query = layers.verbs.query;

function rebuild(document) { return build.verbs.rebuild({ document }); }

/* ── LES TROIS GESTES COMPOSITES DE `shell.mjs` (`applyDecisionAction`),
   REJOUÉS À LA MAIN — voir l'en-tête. Chacune une copie MOT POUR MOT de la
   séquence de verbes que `shell.mjs` exécute. */
function applyAddGearLine(document, { ref, quantity, equipped }) {
  const index = nextGearIndex(document);
  let doc = build.verbs.choose({ document, path: `gear[${index}]`, ref }).document;
  doc = build.verbs.set({ document: doc, path: `gear[${index}].quantity`, value: quantity }).document;
  doc = build.verbs.set({ document: doc, path: `gear[${index}].equipped`, value: equipped }).document;
  return doc;
}
function applyRemoveGearLine(document, index) {
  let doc = document;
  for (const suffix of ["", ".quantity", ".equipped"]) {
    doc = build.verbs.clear({ document: doc, path: `gear[${index}]${suffix}`, kind: "choice" }).document;
  }
  return doc;
}
/** Le personnage d'exemple porte déjà une bourse complète (cp:4, sp:12,
 *  gp:8, pp:0) — les tests du piège/de l'addition partent d'un feuillet
 *  vierge sur `currency.*`, sinon ils mesureraient l'exemple, pas la règle. */
function withoutCurrency(document) {
  let doc = document;
  for (const key of CURRENCY_KEYS) {
    doc = build.verbs.clear({ document: doc, path: `currency.${key}`, kind: "choice" }).document;
  }
  return doc;
}

function applyAddInheritedPurse(document) {
  const current = currentCurrency(document);
  let doc = document;
  for (const key of CURRENCY_KEYS) {
    const base = Number.isInteger(current[key]) ? current[key] : 0;
    const value = key === "gp" ? base + INHERITED_PURSE_GP : base;
    doc = build.verbs.set({ document: doc, path: `currency.${key}`, value }).document;
  }
  return doc;
}

/* ── LES SÉLECTEURS DU DOM-STUB, MÊME PATRON QUE `class-species-steps.test.mjs` ── */
function rows(node, selector) { return node.querySelectorAll(selector); }
/* ⏳ LOT 66 — `search: true` PAR DÉFAUT DANS LES TESTS. La barre de
   recherche est REPLIÉE DERRIÈRE LA LOUPE (B8.1) : Eric l'avait posé au
   conditionnel — « si on a la place pour poser une loupe dans les flottants
   pour invoquer la barre de recherche » — et la place existe, ce qui évite
   une CINQUIÈME barre fixe (le cumul que B7.6 signale).
   ⭐ Les tests la demandent donc explicitement : c'est le geste du joueur,
   et ce qu'ils prouvent ne change pas d'une ligne. */
function ctxFrom(document, report, extra) {
  return Object.assign({ document, resolved: report ? report.resolved : null, query, search: true }, extra || {});
}

/* ══ 1 — UNE LIGNE D'ÉQUIPEMENT SE POSE (commande §3, test 1) ═══════════
   ⭐ « C'est le test qui prouve le lot. » */
test("1 — un record choisi produit gear[N] complet, et la ligne apparaît dans resolved.gear après rebuild", () => {
  const doc = applyAddGearLine(fixture.document, {
    ref: { kind: "gear", id: "srd:gear:en:crowbar" }, quantity: 1, equipped: false
  });
  const lines = currentGearLines(doc);
  const newLine = lines[lines.length - 1];
  assert.equal(newLine.ref.id, "srd:gear:en:crowbar");
  assert.equal(newLine.quantity, 1);
  assert.equal(newLine.equipped, false);

  const report = rebuild(doc);
  assert.ok(report.resolved.gear.some((g) => g.id === "crowbar"),
    "la ligne posée par addGearLine doit apparaître dans resolved.gear, pas seulement dans build.choices");
});

/* ══ 2 — ⚔️ LE PIÈGE DE LA BOURSE (commande §3, test 2) ══════════════════ */
test("2 — poser currency.gp SEUL ne produit AUCUNE resolved.currency ; les quatre la produisent", () => {
  const withGpOnly = build.verbs.set({ document: withoutCurrency(fixture.document), path: "currency.gp", value: 99 }).document;
  const reportGpOnly = rebuild(withGpOnly);
  assert.equal(reportGpOnly.resolved.currency, undefined,
    "CURRENCY_KEYS vaut cp/sp/gp/pp — gp seul laisse trois clefs manquantes, et derive.mjs se tait plutôt que d'inventer une bourse");
  assert.ok(reportGpOnly.underived.some((entry) => entry.field === "currency" && entry.key === "underived.currency-incomplete"),
    "le silence est DÉCLARÉ, pas seulement absent — c'est la loi §0.2 de la commande, rendue visible");

  let complete = withGpOnly;
  for (const key of ["cp", "sp", "pp"]) {
    complete = build.verbs.set({ document: complete, path: `currency.${key}`, value: 0 }).document;
  }
  const reportComplete = rebuild(complete);
  assert.deepEqual(reportComplete.resolved.currency, { cp: 0, sp: 0, gp: 99, pp: 0 });
});

/* ══ 3 — LES 50 PO, POSÉES UNE FOIS, PAS RÉÉCRITES (commande §3, test 3) ═ */
test("3 — addInheritedPurse pose les quatre clefs, ajoute 50 à gp sans écraser ce qui existe déjà (option A du Barbare)", () => {
  /* Barbare option A : « … and 15 GP » — SON propre or, posé par le joueur
     comme n'importe quelle autre valeur de bourse AVANT le geste des 50 PO. */
  const withClassGold = build.verbs.set({ document: withoutCurrency(fixture.document), path: "currency.gp", value: 15 }).document;
  const withPurse = applyAddInheritedPurse(withClassGold);
  const current = currentCurrency(withPurse);
  assert.deepEqual(current, { cp: 0, sp: 0, gp: 65, pp: 0 },
    "15 (le paquet de classe) + 50 (ADDENDUMS §4) = 65 — aucune collision, §0.1 de la commande");
});

test("3b — une valeur déjà posée n'est PAS réécrite par un re-rendu de l'étape (aucun onAction pendant render)", () => {
  const withPurse = applyAddInheritedPurse(fixture.document);
  /* Le joueur DÉPENSE : gp descend à 10, à la main. */
  const spent = build.verbs.set({ document: withPurse, path: "currency.gp", value: 10 }).document;
  const report = rebuild(spent);
  const calls = [];
  renderEquipmentStep(ctxFrom(report.document, report), (a) => calls.push(a));
  assert.equal(calls.length, 0, "un simple rendu ne doit déclencher AUCUNE action — la bourse ne se repose pas toute seule");
  assert.equal(currentCurrency(report.document).gp, 10, "la valeur dépensée survit au rendu, inchangée");
});

/* ══ 4 — UN PAQUET SE POSE COMME UNE LIGNE, NE SE DÉPLIE PAS (commande §3, test 4) ═ */
test("4 — Explorer's Pack se pose comme UNE ligne de resolved.gear, jamais dépliée en sous-objets", () => {
  const doc = applyAddGearLine(fixture.document, {
    ref: { kind: "gear", id: "srd:gear:en:explorer-s-pack" }, quantity: 1, equipped: false
  });
  const report = rebuild(doc);
  const packLines = report.resolved.gear.filter((g) => g.id === "explorer-s-pack");
  assert.equal(packLines.length, 1);
  assert.equal(packLines[0].name, "Explorer’s Pack");
});

/* ══ 5 — UNE ARMURE `equipped: true` CHANGE resolved.ac (commande §3, test 5) ═ */
test("5 — une armure posée equipped: true change resolved.ac — la preuve que l'écran parle au moteur", () => {
  const before = rebuild(fixture.document);
  const withArmor = applyAddGearLine(fixture.document, {
    ref: { kind: "armor", id: "srd:armor:en:chain-mail" }, quantity: 1, equipped: true
  });
  const after = rebuild(withArmor);
  assert.notEqual(after.resolved.ac, before.resolved.ac);
  assert.equal(after.resolved.ac, 16, "Chain Mail : ac_base 16, ac_dex_cap 0 — le Dex du personnage n'y entre pas");
});

/* ══ 6 — LA PHRASE DE CLASSE, TELLE QUELLE, LES DOUZE ═══════════════════
   ⚠️ LOT 66 — ELLE A MIGRÉ DANS « WHAT YOU ALREADY HAVE » (B8.2), et ce
   n'est pas une perte : Eric décrit une FENÊTRE qui « dit ce qu'on possède
   déjà ET EXPLIQUE POURQUOI », qui « apparaît au début », se ferme en
   cliquant dehors, et que le `?` rappelle. Le paquet de la classe est
   exactement ça — un POURQUOI. En bloc permanent, il coûtait de la hauteur
   à un écran qui en manque déjà.
   ⭐ Ce que ces deux tests prouvent est INCHANGÉ : la phrase est recopiée
   TELLE QUELLE, les douze, sans troncature ni « A ou B » supposé. */
test("6 — les douze classes affichent leur phrase EXACTE, aucune troncature, aucun « A ou B » supposé", () => {
  const classes = query({ kind: "class" });
  assert.equal(classes.length, 12);
  for (const view of classes) {
    const phrase = view.record.data.starting_equipment;
    const doc = { build: { choices: [{ path: "class", ref: { kind: "class", id: view.id } }] } };
    const texte = whatYouHave({ document: doc, query });
    assert.ok(texte.includes(phrase), `${view.id} : la phrase doit être recopiée telle quelle`);
  }
});

test("6b — ⚔️ ATTAQUE : le Fighter a TROIS options, la phrase le dit toujours, rien ne suppose deux", () => {
  const fighter = query({ kind: "class", id: "srd:class:en:fighter" });
  const doc = { build: { choices: [{ path: "class", ref: { kind: "class", id: fighter.id } }] } };
  const texte = whatYouHave({ document: doc, query });
  assert.match(texte, /Choose A, B, or C/);
  assert.doesNotMatch(texte, /Choose A or B[^,]/,
    "le Fighter ne doit JAMAIS se lire comme s'il n'avait que deux options");
  assert.ok(texte.includes(fighter.record.data.starting_equipment), "la phrase entière, jamais un extrait");
});

/* ══ 7 — RETIRER UNE LIGNE (commande §3, test 7) ═════════════════════════
   Mesuré (voir INVENTAIRE-LOT-49.md) : `clear` sur `gear[N]` NE FAIT PAS
   jeter `rebuild`, contrairement aux six caractéristiques (lot 45) — le
   geste est donc OFFERT, pas caché derrière une mesure défavorable. */
test("7 — clear est SÛR sur gear[N] : rebuild ne jette pas, la ligne disparaît, aucune orpheline ne reste", () => {
  const withLine = applyAddGearLine(fixture.document, {
    ref: { kind: "gear", id: "srd:gear:en:crowbar" }, quantity: 1, equipped: false
  });
  const lines = currentGearLines(withLine);
  const index = lines[lines.length - 1].index;

  assert.doesNotThrow(() => rebuild(withLine));

  const removed = applyRemoveGearLine(withLine, index);
  let report;
  assert.doesNotThrow(() => { report = rebuild(removed); }, "clear sur gear[N] ne doit PAS faire jeter rebuild");
  assert.ok(!report.resolved.gear.some((g) => g.id === "crowbar"), "la ligne retirée ne doit plus apparaître dans resolved.gear");
  assert.ok(!currentGearLines(removed).some((l) => l.index === index), "l'index retiré ne doit laisser aucune trace (ref/quantity/equipped)");
  assert.ok(!report.unconsumed.some((p) => p.startsWith(`gear[${index}]`)),
    "aucun `gear[N].quantity`/`gear[N].equipped` orphelin ne doit rester dans build.choices");
});

test("7b — le bouton Remove d'une ligne dispatche removeGearLine avec le bon index", () => {
  const withLine = applyAddGearLine(fixture.document, {
    ref: { kind: "gear", id: "srd:gear:en:crowbar" }, quantity: 1, equipped: false
  });
  const report = rebuild(withLine);
  const index = currentGearLines(report.document).slice(-1)[0].index;
  const calls = [];
  const node = renderEquipmentStep(ctxFrom(report.document, report), (a) => calls.push(a));
  const removeBtn = rows(node, ".equipment-gear-remove").slice(-1)[0];
  removeBtn.click();
  assert.deepEqual(calls[0], { kind: "removeGearLine", index });
});

/* ══ 8 — UNE CLASSE NON CHOISIE (commande §3, test 8) ═════════════════════ */
test("8 — sans classe choisie, l'étape ne plante pas, et « what you have » le dit", () => {
  /* ⚠️ Même migration qu'au test 6 : le mot est dans la fenêtre, plus dans un
     bloc permanent. Ce qu'il prouve — l'écran ne plante pas, et il DIT
     l'absence au lieu de la taire — ne bouge pas. */
  const doc = { build: { choices: [] } };
  assert.doesNotThrow(() => {
    renderEquipmentStep(ctxFrom(doc, null), () => {});
    const texte = whatYouHave({ document: doc, query });
    assert.ok(texte.length > 0, "la fenêtre dit quelque chose, jamais rien");
    assert.match(texte, /not added anything yet/i, "et elle nomme l'absence plutôt que de la taire");
  });
});

test("8b — sans classe choisie, le sac et la bourse restent utilisables (gear/currency ne dépendent pas de la classe)", () => {
  const doc = { build: { choices: [] } };
  const node = renderEquipmentStep(ctxFrom(doc, null), () => {});
  assert.ok(rows(node, ".equipment-gear-block").length === 1);
  assert.ok(rows(node, ".equipment-currency-block").length === 1);
});

/* ══ LES GESTES DE L'ÉCRAN, VUS DEPUIS LE DOM ══════════════════════════ */

/* ⏳ LOT 66 — LA BARRE EST REPLIÉE DERRIÈRE LA LOUPE (B8.1), donc les tests
   du chercheur la DEMANDENT (`search: true`). Eric l'avait posé au
   conditionnel — « si on a la place » — et la place existe : c'est ce qui
   évite une CINQUIÈME barre fixe. Ce que ces tests prouvent ne change pas. */
test("chercheur — RIEN n'est rendu tant qu'on n'a pas cherché, puis seuls les résultats", () => {
  /* 🔴 LOT 66 — LE TEST S'INVERSE, ET C'EST UNE MESURE. Il exigeait que les
     133 lignes soient TOUTES rendues puis masquées par `hidden`. Vu à
     l'écran : `[hidden]` NE BAT PAS un `display: flex` d'auteur — les 133
     lignes prenaient **7 054 px** tout en étant « repliées ». Et on ne peut
     pas y répondre par un `display: none`, que le garde des jetons interdit
     (défaut n°3). La bonne réponse est de ne pas les construire.
     ⭐ Ce que le test prouve reste le même : au départ on ne voit rien, et
     après « dagger » on ne voit que des dagues. */
  const report = rebuild(fixture.document);
  const node = renderEquipmentStep(ctxFrom(report.document, report), () => {});
  assert.equal(rows(node, ".equipment-search-result").length, 0,
    "une liste de 133 lignes d'un coup cacherait tout en montrant tout");
  const titre = rows(node, ".equipment-search-block h4")[0].textContent;
  assert.match(titre, /133 records/, "le compte, lui, est annoncé — l'absence n'est pas un silence");

  const input = rows(node, ".equipment-search-input")[0];
  input.value = "dagger";
  input.dispatchEvent({ type: "input" });
  const visible = rows(node, ".equipment-search-result");
  assert.ok(visible.length > 0, "taper « dagger » doit révéler au moins un résultat");
  assert.ok(visible.every((r) => r.textContent.toLowerCase().includes("dagger")));
});

test("chercheur — cliquer Add dispatche addGearLine avec quantity:1, equipped:false", () => {
  const report = rebuild(fixture.document);
  const calls = [];
  const node = renderEquipmentStep(ctxFrom(report.document, report), (a) => calls.push(a));
  const input = rows(node, ".equipment-search-input")[0];
  input.value = "crowbar";
  input.dispatchEvent({ type: "input" });
  /* `hidden` est posé sur la RANGÉE (`.equipment-search-result`), jamais sur
     le bouton lui-même — on retrouve le bouton DANS la rangée visible. */
  const visibleRow = rows(node, ".equipment-search-result").find((r) => r.hidden !== true);
  const addBtn = visibleRow.querySelectorAll(".equipment-item-add")[0];
  addBtn.click();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].kind, "addGearLine");
  assert.equal(calls[0].quantity, 1);
  assert.equal(calls[0].equipped, false);
  assert.equal(calls[0].ref.id, "srd:gear:en:crowbar");
});

test("bourse — les champs cp/sp/gp/pp dispatchent set sur le bon chemin", () => {
  const report = rebuild(fixture.document);
  const calls = [];
  const node = renderEquipmentStep(ctxFrom(report.document, report), (a) => calls.push(a));
  const gpInput = rows(node, ".equipment-currency-input")[2]; // ordre CURRENCY_KEYS : cp, sp, gp, pp
  gpInput.value = "42";
  gpInput.dispatchEvent({ type: "change" });
  assert.deepEqual(calls[0], { kind: "set", path: "currency.gp", value: 42 });
});

test("bourse — le bouton nomme les 50 PO et dispatche addInheritedPurse au clic", () => {
  const report = rebuild(fixture.document);
  const calls = [];
  const node = renderEquipmentStep(ctxFrom(report.document, report), (a) => calls.push(a));
  const btn = rows(node, ".equipment-purse-btn")[0];
  assert.match(btn.textContent, /50 GP/);
  btn.click();
  assert.deepEqual(calls[0], { kind: "addInheritedPurse" });
});

/* ══ LE GARDE D'OCTETS SUR shell.mjs (même patron que « garde 11 »,
   tests/ui-jetons.test.mjs) — voir l'en-tête de ce fichier. ══════════════ */
test("garde — shell.mjs pose vraiment les trois gestes du lot 49 et branche l'étape equipment", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  for (const needle of [
    'action.kind === "addGearLine"',
    'action.kind === "removeGearLine"',
    'action.kind === "addInheritedPurse"',
    'id: "equipment"',
    "renderEquipmentStep("
  ]) {
    assert.ok(shellText.includes(needle), `shell.mjs devrait contenir « ${needle} » — sans quoi le lot 49 n'est pas branché`);
  }
});

/* ⚔️ ATTAQUE MANUELLE JOUÉE SUR CE LOT (commande §3, « une attaque manuelle
   minimum ») : remplacer `key === "gp" ? base + INHERITED_PURSE_GP : base`
   par `base` dans `shell.mjs` (neutralise l'ajout des 50 PO) laisse LES 833
   TESTS DE LA SUITE VERTS — le test 3/3b de ce fichier rejoue la logique à
   la MAIN (voir l'en-tête), il ne relit jamais `shell.mjs`, et le garde
   au-dessus ne vérifiait QUE la présence du mot `addInheritedPurse`, jamais
   son arithmétique. Suspecté, mesuré, corrigé ICI plutôt que caché : ce
   garde-ci lit l'EXPRESSION, au même patron que « garde — shell.mjs ÉCHANGE
   vraiment » (tests/abilities-step.test.mjs, lot 51). Restauré et rejoué
   après l'attaque : la suite complète repasse verte, diff byte-à-byte nul. */
test("garde — shell.mjs ajoute VRAIMENT INHERITED_PURSE_GP à gp, jamais aux trois autres clefs", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /key\s*===\s*"gp"\s*\?\s*base\s*\+\s*INHERITED_PURSE_GP\s*:\s*base/,
    "sans cette ligne, addInheritedPurse pose les quatre clefs mais AJOUTE zéro PO — mesuré : la suite complète reste verte sans elle");
});

/* Même attaque, sur `removeGearLine` : retirer les deux `.quantity`/
   `.equipped` de la boucle des suffixes laisserait des choix orphelins dans
   `build.choices` — mesuré de la même façon que ci-dessus (aucun garde
   comportemental ne relit `shell.mjs`). */
test("garde — shell.mjs retire VRAIMENT les trois chemins de removeGearLine (pas seulement le ref)", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /\[""\s*,\s*"\.quantity"\s*,\s*"\.equipped"\]/,
    "sans les trois suffixes, un retrait laisserait `gear[N].quantity`/`gear[N].equipped` orphelins dans build.choices");
});
