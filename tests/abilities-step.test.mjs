/* ══ LES TESTS DU LOT 45 — L'ÉTAPE ABILITIES ══════════════════════════════

   Même patron que `tests/skills-step.test.mjs` : on teste la FONCTION
   (`renderAbilitiesStep`), pas la page — `tests/dom-stub.mjs`, aucun paquet
   de plus.

   ⛔ AUCUN plan `decisions[]` pour ce chemin (mesuré, commande §0) : cette
   suite ne construit donc PAS son `ctx` comme `skills-step.test.mjs`
   (`decisions`, `violations`) — elle passe `document` (le brut, pour lire
   les six valeurs déjà posées et la méthode) et `resolved` (le score final,
   à l'octet). */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const {
  renderAbilitiesStep, rollAbilitySet, ABILITY_METHODS, currentAbilityValue, currentAbilityMode, optionsForRow
} = await import("../ui/builder/abilities-step.mjs");

const fixture = exempleFhEn();
const { build } = fixture;

function rebuild(document) { return build.verbs.rebuild({ document }); }
function set(document, path, value) { return build.verbs.set({ document, path, value }).document; }
function clear(document, path) { return build.verbs.clear({ document, path, kind: "choice" }).document; }

function rows(node) { return node.querySelectorAll(".ability-row"); }
function rowFor(node, key) { return node.querySelectorAll(`.ability-row[data-row="${key}"]`)[0] || null; }
function optionButtons(row) { return row.querySelectorAll(".record-option"); }
function activeOption(row) {
  const active = optionButtons(row).find((btn) => btn.getAttribute("data-active") === "true");
  return active ? active.textContent : null;
}

function ctxFrom(document, resolvedReport, extra) {
  return Object.assign({ document, resolved: resolvedReport.resolved, rollBatch: null }, extra || {});
}

/* ══ 4 — UNE VALEUR ASSIGNÉE NE SE PLACE QU'UNE FOIS ═════════════════════
   Le pool du lot (six valeurs, avec doublons possibles) MOINS ce qui est
   posé ailleurs — la fonction pure qui rend ça vrai, testée directement. */

test("optionsForRow retire, PAR OCCURRENCE, les valeurs déjà posées sur d'autres caractéristiques", () => {
  const kept = [15, 15, 12, 10, 8, 3];
  const assigned = { str: 15, dex: undefined, con: 10, int: undefined, wis: undefined, cha: undefined };
  // Pour "dex" : un des deux 15 est pris par "str", le second reste disponible.
  const forDex = optionsForRow(kept, assigned, "dex");
  assert.deepEqual(forDex.sort((a, b) => a - b), [3, 8, 12, 15]);
  // Pour "str" elle-même : on ne retire QUE "ce qui est posé AILLEURS" — la
  // valeur de "str" reste dans son propre pool (elle n'est jamais retirée
  // par la ligne qui la porte).
  const forStr = optionsForRow(kept, assigned, "str");
  assert.deepEqual(forStr.sort((a, b) => a - b), [3, 8, 12, 15, 15], "10 (posé sur con, AILLEURS que str) est retiré ; les deux 15 restent, str n'en consomme aucun lui-même");
});

test("dans l'écran : assigner une valeur du lot à une carac la retire des AUTRES lignes", () => {
  // Totaux choisis pour NE COLLISIONNER avec AUCUN des six scores déjà
  // posés par le personnage d'exemple (8, 14, 13, 15, 12, 10) — sinon la
  // valeur "déjà prise ailleurs" serait le score PRÉEXISTANT de l'exemple,
  // pas celle que ce test pose.
  const rollBatch = {
    rerollCount: 0,
    rolls: [
      { dice: [6, 6, 5], total: 17, index: 0, kept: true },
      { dice: [6, 5, 5], total: 16, index: 1, kept: true },
      { dice: [4, 4, 3], total: 11, index: 2, kept: true },
      { dice: [3, 2, 2], total: 7, index: 3, kept: true },
      { dice: [2, 2, 1], total: 5, index: 4, kept: true },
      { dice: [2, 1, 1], total: 4, index: 5, kept: true },
      { dice: [1, 1, 1], total: 3, index: 6, kept: false },
      { dice: [1, 1, 1], total: 3, index: 7, kept: false },
      { dice: [1, 1, 1], total: 3, index: 8, kept: false },
      { dice: [1, 1, 1], total: 3, index: 9, kept: false }
    ]
  };
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  const strRow = rowFor(node, "str");
  assert.ok(optionButtons(strRow).map((b) => b.textContent).includes("17"), "17 (du lot tiré) est une option pour str, rien du lot n'est encore posé");

  // On pose 17 sur str via le vrai verbe (pas un clic simulé ici : on
  // vérifie l'effet document → écran, séparément du clic lui-même plus bas).
  const withStr = set(report.document, "abilities.str", 17);
  const report2 = rebuild(withStr);
  const node2 = renderAbilitiesStep(ctxFrom(report2.document, report2, { rollBatch }), () => {});
  const dexRow2 = rowFor(node2, "dex");
  assert.ok(!optionButtons(dexRow2).map((b) => b.textContent).includes("17"),
    "17 n'est plus une option pour dex : le seul « 17 » du lot est déjà posé sur str");
  const strRow2 = rowFor(node2, "str");
  assert.equal(activeOption(strRow2), "17", "et la ligne str elle-même montre 17 actif");
});

/* ══ 1 — DIX JETS RENDUS, SIX RETENUS DISTINGUÉS ═════════════════════════ */

test("le lot tiré : dix dés rendus, les six retenus marqués `data-kept=\"true\"`", () => {
  const rollBatch = rollAbilitySet((() => { let n = 0; const seq = [0.9, 0.9, 0.9, 0, 0, 0, 0.5, 0.5, 0.5, 0.4, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0]; return () => seq[n++ % seq.length]; })());
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  const dice = node.querySelectorAll(".ability-die");
  assert.equal(dice.length, 10, "les dix jets sont rendus");
  assert.equal(dice.filter((d) => d.getAttribute("data-kept") === "true").length, 6, "six, et seulement six, sont marqués retenus");
});

test("⚔️ ATTAQUE — la relance mord : un lot rejeté ne laisse AUCUNE trace dans l'écran, seul le résultat rendu s'affiche", () => {
  // Scripte un PREMIER lot sans 15+ (tout à 6) puis un second qui en porte un.
  const rejectedThenAccepted = Array(30).fill(1 / 6).concat([0.999, 0.999, 0.999], Array(27).fill(1 / 6));
  let i = 0;
  const rng = () => rejectedThenAccepted[i++ % rejectedThenAccepted.length];
  const rollBatch = rollAbilitySet(rng);
  assert.equal(rollBatch.rerollCount, 1);
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  const note = node.querySelectorAll(".ability-roll-note")[0];
  assert.ok(note, "la bannière de relance existe — le joueur voit que le lot a changé (§3a.1)");
  assert.match(note.textContent, /1 time/);
  const totals = node.querySelectorAll(".ability-die-total").map((n) => n.textContent);
  assert.equal(totals[0], "18", "le lot RENDU (dont le premier jet vaut 18) est bien celui affiché, jamais le lot rejeté (tout à 6)");
});

/* ══ 5 — LA SAISIE DIRECTE POSE EXACTEMENT LE MÊME CHEMIN ═══════════════ */

test("mode manuel : cliquer une valeur pose exactement `set({path:\"abilities.<clef>\", value})` — même chemin qu'en tirage", () => {
  const manualDoc = set(fixture.document, "abilities.mode", "manual");
  const report = rebuild(manualDoc);
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), (a) => calls.push(a));
  const dexRow = rowFor(node, "dex");
  const btn17 = optionButtons(dexRow).find((b) => b.textContent === "17");
  assert.ok(btn17, "la plage 1..20 porte bien 17 comme option cliquable");
  btn17.click();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { kind: "set", path: "abilities.dex", value: 17 });
});

/* ══ 9 (partie Abilities) — LES DEUX MODES EXISTENT, L'INACTIF DIT SON ÉTAT */

test("les deux méthodes sont TOUJOURS rendues ; l'inactive affiche sa phrase d'état, jamais rien", () => {
  assert.deepEqual(ABILITY_METHODS.map((m) => m.id), ["roll", "manual"]);
  const rollModeDoc = set(fixture.document, "abilities.mode", "roll");
  const report = rebuild(rollModeDoc);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), () => {});
  const blocks = node.querySelectorAll(".ability-method-block");
  assert.equal(blocks.length, 2, "les DEUX blocs de méthode existent, quel que soit le mode actif");
  const active = blocks.find((b) => b.getAttribute("data-status") === "active");
  const inactive = blocks.find((b) => b.getAttribute("data-status") === "inactive");
  assert.equal(active.getAttribute("data-method"), "roll");
  assert.equal(inactive.getAttribute("data-method"), "manual");
  const summary = inactive.querySelectorAll(".ability-mode-summary")[0];
  assert.ok(summary, "le mode inactif porte une phrase d'état — il ne disparaît pas");
  assert.match(summary.textContent, /Not selected/);
});

test("basculer de méthode pose `set({path:\"abilities.mode\", value})` — abilities.mode reste ÉCRIT (commande §3a-bis)", () => {
  const report = rebuild(fixture.document);
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), (a) => calls.push(a));
  const switchButtons = node.querySelectorAll(".ability-mode-switch .record-option");
  const manualBtn = switchButtons.find((b) => b.textContent === "Manual entry");
  assert.ok(manualBtn);
  manualBtn.click();
  assert.deepEqual(calls[0], { kind: "set", path: "abilities.mode", value: "manual" });
});

test("un `abilities.mode` inconnu (\"standard\", legs d'un autre outil) ne casse pas l'écran — il retombe sur la première méthode, avec sa note", () => {
  // C'est EXACTEMENT l'état du personnage d'exemple non modifié : mesuré en
  // écrivant ce test (voir INVENTAIRE-LOT-45.md).
  assert.equal(currentAbilityMode(fixture.document).raw, "standard");
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), () => {});
  const note = node.querySelectorAll(".ability-mode-note")[0];
  assert.ok(note, "une note explique le repli — rien ne se cache (§2 du chantier)");
  assert.match(note.textContent, /standard/);
  const active = node.querySelectorAll('.ability-method-block[data-status="active"]')[0];
  assert.equal(active.getAttribute("data-method"), "roll", "repli sur la PREMIÈRE méthode du tableau");
});

/* ══ LE PLAFOND DE 18 — DÉCLARÉ, JAMAIS OPPOSÉ (commande §3c) ═══════════ */

test("un score final > 18 affiche une alerte, et `onAction` PART quand même — l'écran prévient, il ne bloque pas", () => {
  const withHighInt = set(fixture.document, "abilities.int", 18);
  const report = rebuild(withHighInt);
  assert.ok(report.resolved.abilities.int.score > 18, "mesure : 18 + boost d'Inheritance dépasse déjà 18 aujourd'hui");
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), (a) => calls.push(a));
  const intRow = rowFor(node, "int");
  const warning = intRow.querySelectorAll(".ability-cap-warning")[0];
  assert.ok(warning, "l'alerte de plafond s'affiche");
  assert.match(warning.textContent, /18/);
  // Et rien n'empêche de reposer une valeur par-dessus : le clic part.
  const otherBtn = optionButtons(intRow).find((b) => b.textContent !== String(currentAbilityValue(report.document, "int")));
  if (otherBtn) {
    otherBtn.click();
    assert.equal(calls.length, 1, "le clic produit bien un appel — rien ne bloque");
  }
});

/* ══ ⚔️ PREUVE D'EXTENSIBILITÉ (revue d'architecte, 2026-08-13) ══════════
   Le défaut mesuré : `renderAbilitiesStep` branchait sur `method.id`
   ("roll"/"manual") pour choisir QUOI rendre — la boucle lisait bien
   `ABILITY_METHODS`, mais son CORPS décidait, pas le tableau. Corrigé :
   chaque entrée porte maintenant son propre `render(ctx)`, et la boucle ne
   compare `method.id` qu'à `mode.id` (un état, jamais un aiguillage).

   LA SEULE PREUVE QUI VAUT (demandée par l'architecte) : ajouter une
   TROISIÈME méthode ICI, dans ce test SEUL — jamais dans
   `ui/builder/abilities-step.mjs` — et vérifier qu'elle s'affiche. Si ce
   test passe sans qu'une ligne du fichier ait changé, la prochaine méthode
   RÉELLE (Standard Array, Point Buy, 4d6-garder-3) coûtera vraiment une
   entrée de tableau, pas une chirurgie.

   `ABILITY_METHODS` est un tableau EXPORTÉ, donc une RÉFÉRENCE partagée
   avec le module — le muter ici (`push`/`pop`) est vu par
   `renderAbilitiesStep` sans qu'il ait besoin d'un paramètre d'injection
   que la commande ne demande pas. `finally` restaure le tableau même si
   une assertion échoue, pour ne polluer aucun test voisin. */

test("⚔️ PREUVE D'EXTENSIBILITÉ — une troisième méthode ajoutée SEULEMENT ici s'affiche, sans une ligne changée dans abilities-step.mjs", () => {
  const before = ABILITY_METHODS.length;
  const rendered = [];
  const fakeMethod = {
    id: "test-double-fake-method",
    label: "Fake Method (test double)",
    summary: "Not selected — test double for the extensibility proof.",
    render: (ctx) => {
      rendered.push(ctx); // preuve que la boucle appelle bien CE `render`, avec le VRAI ctx
      const marker = document.createElement("div");
      marker.className = "fake-method-marker";
      marker.textContent = "FAKE METHOD RENDERED";
      return [marker];
    }
  };
  ABILITY_METHODS.push(fakeMethod);
  try {
    assert.equal(ABILITY_METHODS.length, before + 1, "l'arrivée d'une méthode : UNE entrée de plus, rien d'autre");

    const doc = set(fixture.document, "abilities.mode", fakeMethod.id);
    const report = rebuild(doc);
    const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), () => {});

    const blocks = node.querySelectorAll(".ability-method-block");
    assert.equal(blocks.length, before + 1, "les TROIS méthodes sont rendues, la fausse comprise");
    const fakeBlock = blocks.find((b) => b.getAttribute("data-method") === fakeMethod.id);
    assert.ok(fakeBlock, "le bloc de la fausse méthode existe");
    assert.equal(fakeBlock.getAttribute("data-status"), "active", "abilities.mode la désigne : elle est ACTIVE");
    const marker = fakeBlock.querySelectorAll(".fake-method-marker")[0];
    assert.ok(marker, "son propre `render` a bien été appelé — jamais celui de \"roll\" ou \"manual\"");
    assert.equal(marker.textContent, "FAKE METHOD RENDERED");
    assert.equal(rendered.length, 1, "le `render` de la fausse méthode est appelé EXACTEMENT une fois");

    // Et les DEUX vraies méthodes restent, elles, INACTIVES — la boucle ne
    // les a pas oubliées pour autant.
    const roll = blocks.find((b) => b.getAttribute("data-method") === "roll");
    const manual = blocks.find((b) => b.getAttribute("data-method") === "manual");
    assert.equal(roll.getAttribute("data-status"), "inactive");
    assert.equal(manual.getAttribute("data-status"), "inactive");
  } finally {
    ABILITY_METHODS.pop();
    assert.equal(ABILITY_METHODS.length, before, "le tableau est restauré — aucun test voisin n'hérite de la fausse méthode");
  }
});

/* ══ ⚔️ ATTAQUE — LE CHOIX BRUT ET LE SCORE FINAL NE SE CONTREDISENT PLUS ═
   Défaut mesuré par l'architecte à l'écran, sur le personnage d'exemple :
   CON affichait « 13 » (le brut) à côté d'un modificateur « +2 » qui était
   en réalité celui du score FINAL (14, `background.boost.con = 1`) — deux
   registres différents, aucun mot pour le dire, et le 14 lui-même
   n'apparaissait nulle part. Idem pour INT (15 brut → 17 final, boost +2).

   Ce test prend le personnage d'exemple TEL QUEL (aucune fixture inventée :
   les deux boosts y sont déjà, mesurés au §0 de la commande d'origine) et
   exige que L'ÉCRAN MONTRE LES DEUX NOMBRES, jamais un seul qui ferait
   croire à l'autre — sans qu'aucun des deux n'ait été recalculé ici : les
   deux viennent directement de `report.resolved.abilities`, comparés au
   choix brut lu par `currentAbilityValue`. */

test("⚔️ ATTAQUE — CON et INT (boostés par l'Inheritance) affichent un score FINAL différent du choix brut, et les deux sont lisibles à la fois", () => {
  const report = rebuild(fixture.document);

  // Mesure de départ, sur le VRAI document — si ceci casse, l'attaque ne
  // prouve plus rien (elle testerait un personnage qui n'a plus de boost).
  assert.equal(currentAbilityValue(report.document, "con"), 13);
  assert.equal(currentAbilityValue(report.document, "int"), 15);
  assert.equal(report.resolved.abilities.con.score, 14, "mesure : le boost d'Inheritance porte bien CON à 14");
  assert.equal(report.resolved.abilities.int.score, 17, "mesure : le boost d'Inheritance porte bien INT à 17");

  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), () => {});

  for (const [key, rawExpected, finalExpected, modExpected] of [
    ["con", "13", "14 (+2)", true],
    ["int", "15", "17 (+3)", true]
  ]) {
    const row = rowFor(node, key);
    // 1) LE CHOIX BRUT RESTE ÉDITABLE, ET C'EST LUI QUE `set()` ÉCRIRAIT —
    //    jamais inversé par cette correction (contrainte ferme n°1). Un
    //    test séparé (« mode manuel : cliquer une valeur pose exactement
    //    set(...) ») prouve déjà que le geste de clic sur le picker écrit
    //    bien le CHEMIN brut ; celui-ci vérifie que le picker continue de
    //    montrer le brut comme actif, jamais le final.
    assert.equal(activeOption(row), rawExpected, `${key} : le picker montre encore le CHOIX BRUT, actif`);

    // 2) LE SCORE FINAL EST LISIBLE — jamais absent, jamais recalculé.
    const finalValue = row.querySelectorAll(".ability-row-final-value")[0];
    assert.ok(finalValue, `${key} : la cellule « Final » existe`);
    assert.equal(finalValue.textContent, finalExpected, `${key} : le final vient de resolved.abilities, à l'octet`);

    // 3) LES DEUX NOMBRES NE SE CONTREDISENT PLUS : le brut affiché et le
    //    nombre entre parenthèses de la cellule Final ne sont plus lus côte
    //    à côte comme SI c'était le même registre — l'écart est ANNONCÉ.
    const finalCell = row.querySelectorAll(".ability-row-final")[0];
    assert.equal(finalCell.getAttribute("data-boosted"), String(modExpected), `${key} : l'écart brut/final est signalé`);
  }

  // ET LA RÉCIPROQUE : une carac SANS boost (STR, DEX, WIS, CHA) affiche le
  // MÊME nombre des deux côtés, et `data-boosted` dit "false" — l'absence
  // de boost est aussi lisible que sa présence, pas une case qui disparaît.
  for (const key of ["str", "dex", "wis", "cha"]) {
    const row = rowFor(node, key);
    const raw = currentAbilityValue(report.document, key);
    const finalCell = row.querySelectorAll(".ability-row-final")[0];
    assert.ok(finalCell, `${key} : la cellule Final existe aussi sans boost`);
    assert.equal(finalCell.getAttribute("data-boosted"), "false", `${key} : aucun écart, correctement signalé`);
    assert.match(finalCell.querySelectorAll(".ability-row-final-value")[0].textContent, new RegExp(`^${raw} \\(`),
      `${key} : sans boost, le final commence par le même nombre que le brut`);
  }
});

test("mode manuel : la colonne Final apparaît aussi (même corps de ligne que le tirage)", () => {
  const manualDoc = set(fixture.document, "abilities.mode", "manual");
  const report = rebuild(manualDoc);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), () => {});
  const conRow = rowFor(node, "con");
  assert.equal(conRow.querySelectorAll(".ability-row-final-value")[0].textContent, "14 (+2)");
});

/* ══ Le garde des jetons — vérifié par la suite complète, pas ici ═══════ */
