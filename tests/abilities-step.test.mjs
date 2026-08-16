/* ══ LES TESTS DES LOTS 45, 50 ET 51 — L'ÉTAPE ABILITIES ═════════════════

   Même patron que `tests/skills-step.test.mjs` : on teste la FONCTION
   (`renderAbilitiesStep`), pas la page — `tests/dom-stub.mjs`, aucun paquet
   de plus.

   ⚠️ LOT 74 : le carnet publie DÉSORMAIS des plans `abilities.<clef>` — la
   borne de création 3–18 (Eric, 2026-08-15), testée dans
   `build-decisions.test.mjs`. L'ÉCRAN, lui, ne descend toujours pas le
   carnet : cette suite passe `document` (le brut, pour lire les six
   valeurs déjà posées et la méthode) et `resolved` (le score final, à
   l'octet) — et depuis le lot 74 l'écran importe `CREATION_SCORES` du
   moteur pour la plage de saisie, jamais une plage à lui.

   ⭐ LOT 50 — LE DÉFAUT : on ne pouvait pas distribuer ses six dés sur ses
   six caractéristiques (commande §0, mesuré sur la page déployée). La
   cause : `optionsForRow` retirait du lot PAR LA VALEUR, jamais par
   l'identité du dé. Corrigé en reprenant la forme de
   `~/tools/fh-skills/fh-skill-builder.html:731` — une caractéristique
   pointe vers l'INDEX d'un dé, jamais vers sa valeur ; la carte vit dans
   `rollBatch.assign` (§2a de la commande), hors document.

   Les DEUX tests ci-dessous (lignes 48-96 de l'ancienne version) testaient
   l'ANCIENNE signature de `optionsForRow` (par VALEUR) — celle-là même que
   le lot 50 remplace. Ils sont retirés ici, pas affaiblis : leur remplaçant
   (« optionsForRow(rollBatch, key) : … ») teste la NOUVELLE signature, par
   INDEX, et les tests qui suivent (§0 de la commande, dés de même valeur,
   valeur hors lot, réassignation, document sans champ neuf) couvrent
   exactement ce que ces deux-là couvraient, plus le défaut lui-même.

   ⭐ LOT 51 — LE DÉFAUT SUIVANT, TROUVÉ EN REGARDANT LA PAGE DÉPLOYÉE JUSTE
   APRÈS LA FUSION DU LOT 50 : une fois les six dés distribués, ZÉRO option
   restait cliquable sur les six rangées (§0 de sa commande). La cause :
   `optionsForRow(rollBatch, key)` retirait du lot les index déjà pris par
   LES AUTRES clefs — juste avant que « toutes distribuées » ne devienne
   VIDE pour tout le monde, l'état NORMAL en fin d'étape. Le test « les dés
   GARDÉS moins les index déjà pris » (ci-dessous, par clef) est retiré à
   son tour : `optionsForRow(rollBatch)` ne prend plus de clef du tout,
   elle rend TOUJOURS les six dés (§1a de la commande d'architecte) — c'est
   `renderPicker` (via `selected`) qui distingue le sien (actif) des cinq
   autres (cliquer ÉCHANGE, §1b, voir `shell.mjs`). Les tests qui suivent
   (marqués « lot 51 ») couvrent le défaut lui-même, l'échange, le cas
   limite d'une rangée non servie, et l'invariant « jamais deux rangées sur
   le même dé ». */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { ABILITY_KEYS, CREATION_SCORES } from "../src/build/index.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

/* LOT 51 — `shell.mjs` n'a AUCUN export et exécute son propre `render()` à
   l'import (voir son bas de fichier) : il ne peut pas être importé ici pour
   appeler `applyDecisionAction` en vrai (même limite que le test 5 plus bas,
   et que « garde 11 » de `tests/ui-jetons.test.mjs`, qui lit ses OCTETS pour
   la même raison). `UI_DIR`/`stripComments` servent au garde de l'échange,
   plus bas — même patron que « garde 11 », posé dans ce fichier-ci parce que
   c'est LUI qui est dans le périmètre de ce lot (`tests/ui-jetons.test.mjs`
   ne l'est pas). */
const UI_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");

const {
  renderAbilitiesStep, rollAbilitySet, ABILITY_METHODS, currentAbilityValue, currentAbilityMode, optionsForRow,
  emptyAbilityAssign, abilitiesValidate, standardArrayBatch, ABILITY_ENTRIES
} = await import("../ui/builder/abilities-step.mjs");

const fixture = exempleFhEn();
const { build } = fixture;

function rebuild(document) { return build.verbs.rebuild({ document }); }
function set(document, path, value) { return build.verbs.set({ document, path, value }).document; }
function clear(document, path) { return build.verbs.clear({ document, path, kind: "choice" }).document; }

/** Rejoue EXACTEMENT ce que `shell.mjs` (`applyDecisionAction`, action
 *  `"assignAbilityRoll"`) fait d'un clic — lot 51, §1b/§1d. `shell.mjs` n'a
 *  aucun harnais de rendu (voir le test 5 plus bas, et « garde 11 » de
 *  `tests/ui-jetons.test.mjs`) : ce test rejoue donc sa logique À LA MAIN,
 *  avec les VRAIS verbes — même patron que le test « après une assignation
 *  complète » plus bas (déjà présent avant ce lot, pour `set` simple). Si
 *  cette fonction diverge un jour de `shell.mjs`, c'est ELLE qu'il faut
 *  corriger pour recoller à la source, jamais l'inverse. */
function applyAssignAbilityRoll(document, assign, rollBatch, action) {
  const prevIndex = assign[action.key] ?? null;
  let holderKey = null;
  for (const [otherKey, otherIndex] of Object.entries(assign)) {
    if (otherKey !== action.key && otherIndex === action.rollIndex) { holderKey = otherKey; break; }
  }
  const newAssign = { ...assign, [action.key]: action.rollIndex };
  if (holderKey) newAssign[holderKey] = prevIndex;
  let newDocument = set(document, `abilities.${action.key}`, action.value);
  if (holderKey && prevIndex !== null) {
    const prevDie = rollBatch.rolls.find((r) => r.index === prevIndex);
    if (prevDie) newDocument = set(newDocument, `abilities.${holderKey}`, prevDie.total);
  }
  return { document: newDocument, assign: newAssign };
}

function rows(node) { return node.querySelectorAll(".ability-row"); }
function rowFor(node, key) { return node.querySelectorAll(`.ability-row[data-row="${key}"]`)[0] || null; }
function optionButtons(row) { return row.querySelectorAll(".record-option"); }
function optionLabels(row) { return optionButtons(row).map((b) => b.textContent); }
function activeOption(row) {
  const active = optionButtons(row).find((btn) => btn.getAttribute("data-active") === "true");
  return active ? active.textContent : null;
}

/* ══ LE PLATEAU QUI SE GLISSE — lot 79, croquis B ════════════════════════
   🔴 CE QUE CES TROIS LIGNES REMPLACENT, ET POURQUOI CE N'EST PAS UN
   AFFAIBLISSEMENT. Les six rangées à molette ont laissé la place aux deux
   panneaux du croquis : UN vivier de six dés, SIX cases, et le glisser entre
   les deux. Les invariants que ce fichier tient — deux dés de même valeur
   restent distincts, un score hors lot ne consomme aucun dé, une case servie
   se reconnaît, l'échange — n'ont pas bougé d'un mot ; ils se LISENT
   ailleurs, et souvent plus directement (le « 16 (DEX) » du lot 51 était une
   prothèse : le panneau 4 montre maintenant qui tient quoi).
   ⛔ Rien n'a été supprimé ici : chaque test réécrit porte sa raison. */
function desGardes(node) { return node.querySelectorAll(".ability-de-garde"); }
function totauxOfferts(node) {
  return desGardes(node).map((j) => j.querySelectorAll(".ability-de-total")[0].textContent);
}
function dePour(node, index) {
  return node.querySelectorAll(`.ability-de-garde[data-valeur="${index}"]`)[0] || null;
}
function creneauPour(node, key) {
  return node.querySelectorAll(`.ability-creneau[data-creneau="${key}"]`)[0] || null;
}
function valeurDe(creneau) { return creneau.querySelectorAll(".glisse-creneau-valeur")[0].textContent; }

/** LE GESTE DU CROQUIS : on prend un dé, on le lâche sur une case. Sans
 *  `cible`, c'est un TAP (le raccourci vers la première case encore vide). */
function glisser(de, cible) {
  globalThis.document.elementFromPoint = () => cible || null;
  de.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  if (cible) de.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 1 });
  de.dispatchEvent({ type: cible ? "pointerup" : "pointerup", clientX: cible ? 40 : 0, clientY: 0, pointerId: 1 });
}

/* ⚠️ LOT 63 — `method` ENTRE DANS LE `ctx`. B5.1c : « il faut CLIQUER pour
   faire apparaître les rollers/choosers — rien n'est déplié d'avance ». La
   méthode n'est donc plus lue dans le document (`abilities.mode`, qui y
   reste écrit) mais dans l'état d'écran, et sans elle la scène ne montre que
   ses tuiles. Les tests la posent explicitement : c'est le geste du joueur.
   ⭐ Ce qu'ils prouvent n'a pas bougé — seule la porte d'entrée. */
function ctxFrom(document, resolvedReport, extra) {
  const base = { document, resolved: resolvedReport.resolved, rollBatch: null, rollingMethod: "fh3d6" };
  const avec = Object.assign(base, extra || {});
  if (avec.method === undefined) avec.method = avec.rollBatch ? "roll" : "manual";
  return avec;
}

/** Le personnage d'exemple porte une SURCHARGE sur `resolved.vitals.hpMax`
 *  (`src/tools/exemple-fh-en.mjs`, « DEUX SURCHARGES, ET ELLES SONT LÀ POUR
 *  ÊTRE REGARDÉES ») — au-delà du niveau 1, `vitals.hpMax` n'est dérivable
 *  d'aucun champ mécanique (mesuré : `tests/fh-destiny-score.test.mjs`,
 *  « ce document n'est PAS validé... au-delà du niveau 1 »), et un override
 *  sur un champ que la dérivation ne produit plus JETTE (`applyOverride`,
 *  « il ne fabrique pas la case qui manque »). Retirer cette SEULE surcharge
 *  est donc nécessaire pour tester un niveau ≠ 1 avec ce personnage — rien
 *  d'autre du document ne change. */
function withoutHpMaxOverride(document) {
  return { ...document, build: { ...document.build, overrides: document.build.overrides.filter((o) => o.path !== "resolved.vitals.hpMax") } };
}

/** Un lot de dix jets, prêt à poser dans `ctx.rollBatch` — six `keptTotals`
 *  GARDÉS (index 0..5, dans l'ORDRE donné, pour que les tests puissent
 *  parler d'« index 0 » sans recompter), puis quatre écartés (`kept:
 *  false`) dont le détail n'importe à aucun test de ce fichier. `assign`
 *  est la carte `clef → index` (lot 50, §2a) — `null`/omise si le test ne
 *  regarde pas encore la distribution. */
function makeRollBatch(keptTotals, assign) {
  const rolls = keptTotals.map((total, index) => ({ dice: [total], total, index, kept: true }));
  const rejected = [3, 3, 3, 3].map((total, i) => ({ dice: [total], total, index: keptTotals.length + i, kept: false }));
  return { rerollCount: 0, rolls: rolls.concat(rejected), assign: assign || null };
}

/* ══ optionsForRow — LA FONCTION PURE QUE LE LOT 50 REMPLACE ═════════════
   Par INDEX, jamais par VALEUR : le test qui le prouve directement. */

test("optionsForRow(rollBatch) : TOUJOURS les six dés gardés — lot 51, §1a, plus jamais filtré par `assign` ni par clef", () => {
  const rollBatch = makeRollBatch([14, 14, 15, 11, 8, 8], { str: 0, dex: null, con: 4, int: null, wis: null, cha: null });
  // Les six index sont rendus, quelle que soit la clef qui regarde — y
  // compris ceux déjà tenus par UNE AUTRE rangée (0 par str, 4 par con) :
  // c'est la SEULE forme qui laisse un geste possible dans n'importe quel
  // état de distribution (voir « LE TEST QUI PROUVE LE LOT 51 » plus bas —
  // filtrer, comme avant ce lot, tombait à UNE option par rangée une fois
  // les six posées).
  assert.deepEqual(optionsForRow(rollBatch), [0, 1, 2, 3, 4, 5]);
  // Aucun tirage : aucune option, pour personne.
  assert.deepEqual(optionsForRow(null), []);
  assert.deepEqual(optionsForRow({ rolls: [], assign: {} }), []);
});

/* ══ ⚔️ LE TEST QUI PROUVE LE LOT (commande §0 et §3, test 1) ═════════════
   Rejoue le cas mesuré au byte près : le personnage d'exemple porte déjà
   8·14·13·15·12·10 (str·dex·con·int·wis·cha — AUCUNE de ces six valeurs
   n'a été tirée), le lot gardé est 11·15·11·14·14·11, et STR reçoit un dé
   qui n'est NI un 14 NI un 15 (le 11 d'index 0) — pour isoler le défaut :
   sous l'ANCIEN code, le `14` que DEX porte déjà (hors lot) et le `15` que
   INT porte déjà (hors lot) volaient chacun un dé RÉEL aux autres rangées,
   MÊME SANS QU'AUCUN GESTE n'ait touché DEX ou INT. CON, WIS et CHA (non
   distribuées) doivent donc voir encore le 15 ET LES DEUX 14 — ce test
   ROUGIT sur `git show dd2b66e:ui/builder/abilities-step.mjs` (le code
   d'avant ce lot), il est vert ici. */

test("⚔️ LE TEST QUI PROUVE LE LOT — CON, WIS et CHA voient encore le 15 et les deux 14, après que STR (pas eux) a reçu un dé", () => {
  assert.deepEqual(
    ["str", "dex", "con", "int", "wis", "cha"].map((k) => currentAbilityValue(fixture.document, k)),
    [8, 14, 13, 15, 12, 10],
    "mesure de départ : le personnage d'exemple porte bien 8·14·13·15·12·10, aucune de ces six valeurs n'est un dé du lot ci-dessous"
  );
  const rollBatch = makeRollBatch([11, 15, 11, 14, 14, 11], { str: 0, dex: null, con: null, int: null, wis: null, cha: null });
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  /* ⭐ LOT 79 — LA QUESTION EST LA MÊME, POSÉE UNE FOIS AU LIEU DE SIX. Il n'y
     a plus une liste d'options PAR rangée mais UN vivier, commun aux six
     cases : ce que « con, wis et cha voient » est donc, littéralement, ce que
     le vivier porte. Le défaut que ce test a été écrit pour attraper — un
     score DÉJÀ POSÉ hors lot (le 15 de INT, le 14 de DEX) qui volait un dé
     RÉEL au pool — se lit ici d'un seul coup d'œil. */
  const totaux = totauxOfferts(node);
  assert.deepEqual(totaux, ["11", "15", "11", "14", "14", "11"],
    "les six dés gardés, dans l'ordre du lot — ni filtrés, ni fusionnés par valeur");
  assert.ok(totaux.includes("15"), "le 15 du lot reste offert — le 15 EXISTANT de INT (hors lot) ne l'a pas volé");
  assert.equal(totaux.filter((t) => t === "14").length, 2,
    "les DEUX 14 du lot restent offerts — le 14 EXISTANT de DEX (hors lot) n'en a volé aucun");
  for (const key of ["con", "wis", "cha"]) {
    assert.equal(creneauPour(node, key).dataset.rempli, "false", `${key} n'a rien reçu, et sa case le dit`);
  }
});

/* ══ 2 — DEUX DÉS DE MÊME VALEUR SONT DEUX OPTIONS DISTINCTES ═══════════ */

test("deux dés de même valeur sont deux options distinctes : en assigner un laisse l'autre disponible", () => {
  const rollBatch = makeRollBatch([14, 14, 11, 11, 11, 8], { str: 0, dex: null, con: null, int: null, wis: null, cha: null });
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  /* LOT 79 — DEUX DÉS, DEUX JETONS, DEUX INDEX. La distinction ne tient pas au
     libellé (les deux affichent « 14 ») mais à `data-valeur`, qui porte
     l'INDEX : c'est la même clef que `assign` emploie. Le premier est pris
     par str et le DIT (`data-pris`) ; le second est libre. */
  const quatorzes = desGardes(node).filter((j) => j.querySelectorAll(".ability-de-total")[0].textContent === "14");
  assert.equal(quatorzes.length, 2, "les deux 14 sont deux jetons, jamais fusionnés");
  assert.deepEqual(quatorzes.map((j) => j.getAttribute("data-valeur")), ["0", "1"]);
  assert.deepEqual(quatorzes.map((j) => j.getAttribute("data-pris")), ["true", "false"],
    "le 14 d'index 0 est chez str, celui d'index 1 est encore à prendre");
  assert.equal(quatorzes[1].disabled, false, "et il se prend vraiment — un jeton pris reste prenable (l'échange du lot 51)");
});

/* ══ 3 — UNE VALEUR HORS LOT NE CONSOMME AUCUN DÉ ════════════════════════
   Le cas du `14` de DEX (commande §0) : DEX n'a REÇU aucun dé (`assign`
   absent pour elle) — son `14` de document ne doit rien retirer au pool
   que voit STR. */

test("une valeur hors lot (le 14 que dex porte déjà, jamais tiré) ne consomme aucun dé", () => {
  assert.equal(currentAbilityValue(fixture.document, "dex"), 14, "mesure : dex porte déjà 14 sans qu'aucun dé n'ait été tiré");
  const rollBatch = makeRollBatch([14, 15, 11, 11, 11, 8]); // aucun `assign` : rien n'a encore été distribué
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  assert.equal(totauxOfferts(node).filter((t) => t === "14").length, 1,
    "le 14 tiré (index 0) reste dans le vivier — le 14 de dex (hors lot, jamais assigné) ne l'a pas consommé");
  /* Et la case de dex le dit dans l'autre sens : elle porte bien 14, mais
     `hors-lot` — la valeur ne disparaît pas, elle ne se fait pas passer pour
     un dé posé (« rien ne se cache », §2, vaut toujours). */
  const dex = creneauPour(node, "dex");
  assert.equal(valeurDe(dex), "14");
  assert.equal(dex.dataset.source, "hors-lot");
});

/* ══ 4 — UNE RANGÉE DISTRIBUÉE EST RECONNAISSABLE, UNE NON DISTRIBUÉE AUSSI
   (commande §2c) ══════════════════════════════════════════════════════ */

test("une CASE non distribuée est reconnaissable dans le rendu, et une case distribuée l'est aussi", () => {
  const rollBatch = makeRollBatch([12, 11, 10, 9, 8, 7], { str: 0, dex: null, con: null, int: null, wis: null, cha: null });
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  const str = creneauPour(node, "str");
  const dex = creneauPour(node, "dex");
  assert.equal(str.dataset.rempli, "true", "str a reçu un dé (index 0) : la case le dit");
  assert.equal(str.dataset.source, "lot");
  assert.equal(dex.dataset.rempli, "false", "dex n'a rien reçu : la case le dit aussi — « rien ne se cache » vaut dans les deux sens");
  /* Et dex continue de montrer sa valeur COURANTE (14, celle du personnage
     d'exemple) : elle ne disparaît pas pour autant qu'elle ne vienne pas du
     lot — c'est `data-source` qui fait la différence, et l'`aria-label` qui
     la DIT à qui ne voit pas la feuille. */
  assert.equal(valeurDe(dex), "14");
  assert.equal(dex.dataset.source, "hors-lot");
  assert.match(dex.getAttribute("aria-label"), /not from this roll/);
  assert.match(str.getAttribute("aria-label"), /from this roll/);
});

/* ══ 5 — emptyAbilityAssign() : LA CARTE VIDE QUE shell.mjs POSE À CHAQUE
   NOUVEAU LOT (commande §2b : « un nouveau lot remet toute la carte à
   null ») ═══════════════════════════════════════════════════════════════
   `shell.mjs` (`applyDecisionAction`, action `"roll"`) n'est pas testé
   dans ce fichier — aucun test `shell.mjs` n'existe nulle part dans ce
   dépôt, et le périmètre de ce lot ne demande pas d'en créer un. Ce test
   couvre la fonction PURE que `shell.mjs` appelle ; le VRAI enchaînement
   (relancer efface bien la carte, à l'écran) est vérifié à la main, au
   navigateur — voir INVENTAIRE-LOT-50.md, §4. */

test("emptyAbilityAssign() remet les six clefs à null — la carte que shell.mjs pose à chaque nouveau lot", () => {
  assert.deepEqual(emptyAbilityAssign(), { str: null, dex: null, con: null, int: null, wis: null, cha: null });
});

/* ══ 6 — RÉASSIGNER LIBÈRE LE DÉ PRÉCÉDENT (commande §3, test 6) ═════════
   `shell.mjs` REMPLACE l'entrée de `assign` au lieu de l'ajouter (`{
   ...assign, [key]: newIndex }`) — ce test simule exactement cet effet en
   rendant deux fois avec deux cartes qui ne diffèrent que par l'index de
   str, sans passer par shell.mjs lui-même (hors périmètre, voir test 5).

   ⚠️ LOT 51 — l'assertion tient TOUJOURS, mais plus pour la même raison :
   `optionsForRow` ne filtre plus rien (§1a), donc dex VOIT le dé 0 (12) que
   str tient, mais son LIBELLÉ est « 12 (STR) », jamais « 12 » tout court
   (§1c) — c'est pour ça que `optionLabels(...).filter(l => l === "12")`
   reste à 0 : ce n'est plus une absence d'option, c'est un libellé qui ne
   correspond plus. Voir le test dédié à l'échange plus bas pour la preuve
   directe du libellé. */

test("réassigner une rangée déjà servie libère le dé précédent pour les autres", () => {
  const keptTotals = [12, 11, 10, 9, 8, 7];
  const report = rebuild(fixture.document);

  /* ⭐ LOT 79 — LE LIBELLÉ N'A PLUS À PORTER LE PROPRIÉTAIRE. « 12 (STR) »
     était la prothèse du lot 51 : six rangées répétaient les six dés, et il
     fallait bien dire lequel était pris. Le croquis B les met côte à côte —
     le dé porte `data-pris`, la case porte sa valeur, et l'œil fait le reste.
     La QUESTION de ce test est intacte : réassigner str LIBÈRE le dé qu'elle
     tenait, et prend l'autre. */
  const node1 = renderAbilitiesStep(ctxFrom(report.document, report, {
    rollBatch: makeRollBatch(keptTotals, { str: 0, dex: null, con: null, int: null, wis: null, cha: null })
  }), () => {});
  assert.equal(dePour(node1, 0).dataset.pris, "true", "str tient le dé 0 (12) : le jeton l'annonce");
  assert.equal(dePour(node1, 2).dataset.pris, "false", "le dé 2 (10) est libre");

  const node2 = renderAbilitiesStep(ctxFrom(report.document, report, {
    rollBatch: makeRollBatch(keptTotals, { str: 2, dex: null, con: null, int: null, wis: null, cha: null })
  }), () => {});
  assert.equal(dePour(node2, 0).dataset.pris, "false", "str a changé pour le dé 2 : le dé 0 (12) est libéré");
  assert.equal(dePour(node2, 2).dataset.pris, "true", "et c'est le dé 2 (10) qui est désormais tenu");
});

/* ══ LOT 51 — LE DÉFAUT, L'ÉCHANGE, ET SES CAS LIMITES (§0/§1/§2 de sa
   commande) ═══════════════════════════════════════════════════════════ */

/* ⚔️ LE TEST QUI PROUVE LE LOT 51 — commande §2, test 1 : « ce test doit
   rougir sur le code d'aujourd'hui ». Rejoué sur `git show 33337a4:ui/
   builder/abilities-step.mjs` (le code d'avant ce lot), il donne 1 option,
   0 cliquable, sur les six rangées — exactement la mesure du §0 de la
   commande sur la page déployée. */
test("⚔️ LE TEST QUI PROUVE LE LOT 51 — après une distribution COMPLÈTE, les six dés restent tous prenables", () => {
  const keptTotals = [8, 9, 10, 11, 12, 13];
  const assign = { str: 0, dex: 1, con: 2, int: 3, wis: 4, cha: 5 };
  const rollBatch = makeRollBatch(keptTotals, assign);
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  /* 🔴 LE DÉFAUT DU LOT 51 EST TOUJOURS CE QU'ON GARDE, ET LA NOUVELLE FORME
     LE TIENT PLUS FORT. Sur le code d'avant le lot 51, une distribution
     complète laissait UNE option par rangée et AUCUNE cliquable : plus aucun
     geste possible. La réponse d'alors était « six options par rangée, cinq
     cliquables » — trente-six boutons. Ici il y a SIX jetons, tous présents,
     AUCUN désactivé : le geste reste possible dans n'importe quel état de
     distribution, et il n'y a plus rien à répéter six fois. */
  const jetons = desGardes(node);
  assert.equal(jetons.length, 6, "les six dés sont là, MÊME tous distribués — c'était le défaut du lot 51");
  assert.deepEqual(jetons.map((j) => j.disabled), [false, false, false, false, false, false],
    "aucun n'est désactivé : lâcher un dé déjà tenu sur une autre case ÉCHANGE les deux");
  assert.deepEqual(jetons.map((j) => j.getAttribute("data-pris")),
    ["true", "true", "true", "true", "true", "true"], "et chacun annonce qu'il est tenu");
  for (const key of ["str", "dex", "con", "int", "wis", "cha"]) {
    assert.equal(creneauPour(node, key).dataset.rempli, "true", `${key} : sa case porte son dé`);
  }
});

/* L'ÉCHANGE (§1b) — commande §2, test 2. */
test("⚔️ L'ÉCHANGE — FOR tient le 10, DEX le 16 ; cliquer le 16 sur la ligne FOR donne FOR=16 ET DEX=10, jamais DEX vide, jamais deux rangées sur le même dé", () => {
  const keptTotals = [10, 16, 11, 12, 13, 14]; // index 0 → 10 (str), index 1 → 16 (dex)
  let assign = { str: 0, dex: 1, con: null, int: null, wis: null, cha: null };
  let document = set(set(fixture.document, "abilities.str", 10), "abilities.dex", 16);
  const rollBatch = makeRollBatch(keptTotals, assign);
  const report = rebuild(document);
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), (a) => calls.push(a));

  /* LOT 79 — LE GESTE EST LE CROQUIS : on prend le 16 (que DEX tient) et on
     le lâche sur la case FOR. Le dé n'a plus besoin de porter « (DEX) » dans
     son libellé — il annonce `data-pris`, et la case de DEX montre 16. */
  const de16 = dePour(node, 1);
  assert.equal(de16.dataset.pris, "true", "le 16 est tenu par DEX, et il le dit — jamais présenté comme libre");
  assert.equal(valeurDe(creneauPour(node, "dex")), "16", "et c'est la case de DEX qui montre lequel");
  glisser(de16, creneauPour(node, "str"));
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { kind: "assignAbilityRoll", key: "str", rollIndex: 1, value: 16 });

  // Ce que shell.mjs ferait de cet appel (§1b/§1d) :
  const applied = applyAssignAbilityRoll(document, assign, rollBatch, calls[0]);
  document = applied.document;
  assign = applied.assign;

  assert.deepEqual(assign, { str: 1, dex: 0, con: null, int: null, wis: null, cha: null },
    "l'échange, à l'octet : str prend l'index que dex tenait, dex reprend celui que str tenait — jamais deux clefs sur le même index");

  const finalReport = rebuild(document);
  assert.equal(currentAbilityValue(finalReport.document, "str"), 16, "FOR vaut maintenant 16");
  assert.equal(currentAbilityValue(finalReport.document, "dex"), 10, "DEX vaut maintenant 10 — jamais vide (§1b)");

  // Commande §2, test 3 — aucun état intermédiaire indérivable.
  const abilityChoices = finalReport.document.build.choices.filter((c) => ABILITY_KEYS.some((k) => c.path === `abilities.${k}`));
  assert.equal(abilityChoices.length, 6, "les six abilities.<clef> restent toutes présentes après l'échange (§1d : le document ne gagne rien, mais ne PERD rien non plus)");
});

/* ⚠️ CE QUE LE TEST CI-DESSUS NE PROUVE PAS, ET POURQUOI UN GARDE SUPPLÉMENTAIRE
   SUIT : `applyAssignAbilityRoll` (plus haut dans ce fichier) est une COPIE de
   la logique de `shell.mjs`, écrite POUR ce test — elle prouve que la logique,
   TELLE QUE RÉÉCRITE ICI, produit le bon résultat, mais ne relit JAMAIS le
   fichier `shell.mjs` lui-même. Mesuré en ATTAQUANT `shell.mjs` (retirer
   `newAssign[holderKey] = prevIndex`, la ligne qui fait l'échange) : LA SUITE
   COMPLÈTE RESTE VERTE — aucun test, dans ce fichier ou ailleurs, n'aurait
   accroché une régression RÉELLE dans `shell.mjs`. Ce n'est pas un trou
   ouvert par ce lot : `shell.mjs` n'a aucun export et exécute son propre
   `render()` à l'import (voir son bas de fichier) — AUCUN lot avant celui-ci
   n'a pu lui donner de harnais de rendu (le test 5 plus haut le dit déjà pour
   `roll`/`reroll`, et « garde 11 » de `tests/ui-jetons.test.mjs` existe
   PRÉCISÉMENT pour cette raison — un garde d'octets, posé par l'architecte,
   parce qu'aucun autre n'était possible).

   Le garde ci-dessous suit le MÊME patron que « garde 11 » : il lit les
   OCTETS de `shell.mjs`, pas son comportement. Il n'a donc PAS la force
   d'un test de rendu — un octet qui a l'air juste peut encore être mal
   branché — mais il accroche au moins l'attaque mesurée ci-dessus (la ligne
   retirée), là où aucun autre test ne le faisait. Signalé plutôt que
   contourné (§⭐ de la commande) : la preuve la plus forte de ce lot reste le
   test manuel au navigateur (§3 de la commande, voir INVENTAIRE-LOT-51.md). */
test("garde — shell.mjs ÉCHANGE vraiment (holderKey reprend l'index que la clef cliquée tenait avant), lot 51 §1b", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /newAssign\[holderKey\]\s*=\s*prevIndex/,
    "sans cette ligne, un dé cliqué déjà tenu écraserait l'ancien titulaire sans jamais le libérer — " +
    "deux clefs pourraient alors pointer vers le même index (mesuré : la suite complète reste verte sans elle)");
});

/* Commande §2, test 4 — l'acquis du lot 50 tient AUSSI à l'échange. */
test("deux dés de même valeur restent distincts À L'ÉCHANGE — l'acquis du lot 50, l'échange ne le casse pas", () => {
  const keptTotals = [14, 14, 11, 11, 11, 8]; // deux 14 : index 0 (tenu par str) et index 1 (libre)
  const assign = { str: 0, dex: null, con: null, int: null, wis: null, cha: null };
  const document = set(fixture.document, "abilities.str", 14);
  const rollBatch = makeRollBatch(keptTotals, assign);
  const report = rebuild(document);
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), (a) => calls.push(a));
  /* Les deux 14 restent DEUX jetons : celui que str tient s'annonce pris,
     l'autre est libre. On lâche le LIBRE (index 1) sur la case de dex. */
  assert.equal(dePour(node, 0).dataset.pris, "true", "le 14 d'index 0 est chez str");
  assert.equal(dePour(node, 1).dataset.pris, "false", "le second 14 (index 1) est libre, et distinct");
  glisser(dePour(node, 1), creneauPour(node, "dex"));
  assert.deepEqual(calls[0], { kind: "assignAbilityRoll", key: "dex", rollIndex: 1, value: 14 },
    "dex pose bien sur le SECOND 14 (index 1), jamais sur celui que str tient (index 0)");
});

/* Commande §2, test 5 — le cas limite §1b : la rangée CIBLE (celle qu'on
   édite) peut ne pas être servie par le lot. Décision mesurée et justifiée
   dans INVENTAIRE-LOT-51.md : elle échange quand même (elle prend le dé),
   mais comme elle n'avait RIEN à rendre, l'ancien titulaire redevient
   simplement « pas de ce tirage », SANS que sa valeur déjà posée ne soit
   effacée ni retouchée (aucun second `set` ne part : rien à y écrire de
   plus vrai que ce qui y est déjà). */
test("§1b, LE CAS LIMITE — une rangée NON SERVIE échange quand même : l'ancien titulaire redevient « pas de ce tirage » sur sa valeur déjà posée, rien n'est effacé", () => {
  const keptTotals = [7, 12, 9, 15, 3, 6]; // index 1 → 12, tenu par wis
  let assign = { str: null, dex: null, con: null, int: null, wis: 1, cha: null };
  let document = set(fixture.document, "abilities.wis", 12); // wis a RÉELLEMENT reçu ce dé
  const rollBatch = makeRollBatch(keptTotals, assign);
  const report = rebuild(document);
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), (a) => calls.push(a));

  const conCase = creneauPour(node, "con");
  assert.equal(conCase.dataset.rempli, "false", "mesure de départ : con n'a encore rien reçu de ce lot");
  const de12 = dePour(node, 1);
  assert.equal(de12.dataset.pris, "true", "le 12 est tenu par wis, et il l'annonce — jamais présenté comme libre");
  glisser(de12, conCase);
  assert.deepEqual(calls[0], { kind: "assignAbilityRoll", key: "con", rollIndex: 1, value: 12 });

  const applied = applyAssignAbilityRoll(document, assign, rollBatch, calls[0]);
  document = applied.document;
  assign = applied.assign;

  assert.deepEqual(assign, { str: null, dex: null, con: 1, int: null, wis: null, cha: null },
    "con prend l'index de wis ; wis, qui n'a RIEN à recevoir en retour (con n'avait aucun dé), redevient non distribuée — jamais deux clefs sur le même index");

  const finalReport = rebuild(document);
  assert.equal(currentAbilityValue(finalReport.document, "con"), 12, "con vaut maintenant 12");
  assert.equal(currentAbilityValue(finalReport.document, "wis"), 12, "wis GARDE sa valeur déjà posée — rien n'est effacé, même si elle n'est plus « de ce tirage »");

  const finalNode = renderAbilitiesStep(ctxFrom(finalReport.document, finalReport, { rollBatch: { ...rollBatch, assign } }), () => {});
  const wisCase = creneauPour(finalNode, "wis");
  assert.equal(wisCase.dataset.rempli, "false", "wis redevient « non distribuée » — rien ne se cache : la case le dit");
  assert.equal(valeurDe(wisCase), "12", "wis montre encore sa valeur (12)…");
  assert.equal(wisCase.dataset.source, "hors-lot", "…mais dit clairement qu'elle ne vient plus de CE lot");
  assert.match(wisCase.getAttribute("aria-label"), /12, not from this roll/);
});

/* ══ 7 — LE DOCUMENT NE GAGNE AUCUN CHAMP (commande §3, test 7) ══════════
   Assigne les six caractéristiques UNE PAR UNE, par un vrai clic sur le
   picker (donc un vrai appel `onAction`), puis rejoue CE QUE shell.mjs
   ferait de chaque appel (poser l'index dans `assign`, poser la VALEUR au
   document par `set` — voir `applyDecisionAction`). Le geste du clic ET
   son effet documentaire sont donc tous les deux mesurés, jamais supposés. */

test("⚔️ après une assignation complète, le document ne porte QUE six abilities.<key> — aucun index ne s'y glisse", () => {
  const keptTotals = [8, 9, 10, 11, 12, 13]; // six valeurs distinctes, aucune ambiguïté de lecture
  let assign = emptyAbilityAssign();
  let document = fixture.document;

  ABILITY_KEYS.forEach((key, i) => {
    const rollBatch = makeRollBatch(keptTotals, assign);
    const report = rebuild(document);
    const calls = [];
    const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), (a) => calls.push(a));
    const de = dePour(node, i);
    assert.ok(de, `${key} : le dé ${keptTotals[i]} (index ${i}) est dans le vivier`);
    glisser(de, creneauPour(node, key));
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], { kind: "assignAbilityRoll", key, rollIndex: i, value: keptTotals[i] });
    // Ce que shell.mjs ferait de cet appel :
    assign = { ...assign, [key]: i };
    document = set(document, `abilities.${key}`, keptTotals[i]);
  });

  const finalReport = rebuild(document);
  const abilityChoices = finalReport.document.build.choices.filter((c) => ABILITY_KEYS.some((k) => c.path === `abilities.${k}`));
  assert.equal(abilityChoices.length, 6, "exactement six abilities.<key> dans le document, un par caractéristique");
  for (const choice of abilityChoices) {
    assert.equal(typeof choice.value, "number", `${choice.path} : la valeur posée est un NOMBRE — aucun index ne s'est glissé dans le document`);
  }
});

/* ══ 1 — DIX JETS RENDUS, SIX RETENUS DISTINGUÉS ═════════════════════════ */

/* ⚠️ CES DEUX TESTS ONT ÉTÉ REPOINTÉS SUR LE PLATEAU (croquis B d'Eric,
   2026-08-15) — leur VÉRITÉ n'a pas bougé d'un pouce : dix jets rendus, six
   retenus distingués, et un lot rejeté qui ne laisse aucune trace. Seul le
   vocabulaire du DOM change, parce que l'organe change : `.ability-die`
   (les jetons plats de `renderRollBatch`) devient `.tray-case` (les dix
   cases numérotées sous les trois dés 3D).

   📌 `renderRollBatch` n'est pas mort pour autant : il sert toujours `4d6`,
   qui est une AUTRE mécanique (six jets, on retire le plus bas). Le test du
   §aiguillage plus bas le prouve. */

test("le lot tiré : dix cases rendues, les six retenus marqués `data-garde=\"true\"`", () => {
  const rollBatch = rollAbilitySet((() => { let n = 0; const seq = [0.9, 0.9, 0.9, 0, 0, 0, 0.5, 0.5, 0.5, 0.4, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0]; return () => seq[n++ % seq.length]; })());
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  const cases = node.querySelectorAll(".tray-case");
  assert.equal(cases.length, 10, "les dix jets sont rendus");
  assert.equal(cases.filter((c) => c.getAttribute("data-garde") === "true").length, 6, "six, et seulement six, sont marqués retenus");
  /* ⭐ LE GARDE QUI COMPTE VRAIMENT : un lot rangé dans `state` est TOUJOURS
     FINI, donc il se peint ENTIER. La version d'avant ne peignait que
     `revele` cases — et `revele` vaut 0 ici, puisque ce lot n'est pas né
     d'une salve à l'écran. La moitié des dix disparaissait au premier
     redessin (une assignation suffisait). */
  assert.equal(cases.filter((c) => c.getAttribute("data-etat") === "plein").length, 10,
    "les dix sont PLEINES sans qu'aucune salve n'ait tourné — `revele` ne décrit qu'une salve en cours, jamais ce qu'on affiche");
});

test("⚔️ ATTAQUE — la relance mord : un lot rejeté ne laisse AUCUNE trace dans l'écran, seul le résultat rendu s'affiche", () => {
  // Scripte un PREMIER lot sans 15+ (tout à 6) puis un second qui en porte un.
  const rejectedThenAccepted = Array(30).fill(1 / 6).concat([0.999, 0.999, 0.999], Array(27).fill(1 / 6));
  let i = 0;
  const rng = () => rejectedThenAccepted[i++ % rejectedThenAccepted.length];
  const rollBatch = rollAbilitySet(rng);
  assert.equal(rollBatch.rerollCount, 1);
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  const note = node.querySelectorAll(".tray-relance")[0];
  assert.ok(note, "la bannière de relance existe — le joueur voit que le lot a changé (§3a.1)");
  assert.equal(note.hidden, false, "et elle est VISIBLE : `ecrisMention` ne la démasque que si `rerollCount > 0`");
  assert.match(note.textContent, /One set of ten was discarded/);
  const totals = node.querySelectorAll(".tray-case-total").map((n) => n.textContent);
  assert.equal(totals[0], "18", "le lot RENDU (dont le premier jet vaut 18) est bien celui affiché, jamais le lot rejeté (tout à 6)");
});

/* ══ 🔴 LE GARDE DU LOT — LE PLATEAU EST SUR LE CHEMIN VIVANT ════════════
   Le défaut mesuré, et il a résisté à quatre branchements : `renderTray`
   était IMPORTÉ par `abilities-step.mjs` et câblé dans un `renderRollMethod`
   que **personne n'appelait**. `ABILITY_METHODS[].render` n'a jamais eu
   d'appelant ; `renderAbilitiesStep` gardait son propre corps, avec les
   jetons plats. Le plateau était donc écrit, importé, testable — et
   invisible. Une suite verte ne prouve rien sur ce que personne n'importe.

   ⛔ CE TEST PASSE PAR LA PORTE DU JOUEUR (`renderAbilitiesStep`), jamais par
   `renderTray` en direct : c'est précisément le branchement qui manquait, et
   un test qui appellerait le module directement serait resté vert pendant
   tout le temps où l'écran ne le montrait pas. */

test("🔴 `Roll dice` + FH 3d6 : le PLATEAU est rendu, avec les quatre boutons d'Eric", () => {
  const node = renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { method: "roll", rollingMethod: "fh3d6", rollBatch: null }), () => {});
  assert.equal(node.querySelectorAll(".tray").length, 1, "le plateau est sur le chemin vivant de l'écran");
  assert.equal(node.querySelectorAll(".tray-titre")[0].textContent, "Roll Options",
    "le titre est celui d'Eric, et il est à lui");
  const libelles = node.querySelectorAll(".tray-bouton").map((b) => b.textContent);
  assert.deepEqual(libelles, ["3d6", "10x3D6", "Flash", "Reset"],
    "les quatre libellés sont ceux d'Eric, mot pour mot (2026-08-15, après essai sur iPhone SE)");
  assert.equal(node.querySelectorAll(".tray-case").length, 10, "les dix cases existent DÈS LE DÉPART, vides");
  assert.equal(node.querySelectorAll(".ability-roll-batch").length, 0, "et les jetons plats ont cédé la place");
  /* Aucun lot : le plateau est vide, il n'y a rien à poser. */
  assert.equal(node.querySelectorAll(".tray-des")[0].childNodes.length, 0,
    "sans lot, le plateau est vide — il n'invente pas de dés");

  /* ══ 🔴 LE BUDGET DE LARGEUR, ET POURQUOI IL EXISTE ═══════════════════
     `Reset` est parti COUPÉ au bord droit de l'iPhone SE d'Eric, et rien ne
     l'a vu : la suite était verte, et la largeur ne vivait que dans un
     commentaire. Mesuré depuis, dans la page et non dans le gabarit :

       largeur utile de la rangée .......... 294 px  (et NON les 312 théoriques)
       rembourrage 8×2 sur quatre boutons ..  64
       trois gouttières de 4 ...............  12
       bordures 1×2 sur quatre boutons .....   8   ← le terme oublié
       ────────────────────────────────────────
       reste pour le TEXTE ................. 210 px

     Les libellés d'Eric font 146 px pour 19 caractères, soit ~7,7 px/car. en
     T3. ⚠️ CE GARDE EST UN PROXY, et il le dit : Node n'a pas de
     `measureText`, donc il compte des CARACTÈRES là où le navigateur compte
     des pixels. Le plafond est posé à 24 (contre 19 aujourd'hui) en tablant
     sur ~8,7 px/car. — de quoi encaisser des majuscules et des chiffres, qui
     sont les plus larges.
     ⛔ Il ne remplace pas une mesure au navigateur ; il attrape le cas qui a
     réellement mordu : des libellés qui rallongent, et une rangée qui déborde
     en silence sur le plus petit écran. */
  const totalCar = libelles.join("").length;
  assert.ok(totalCar <= 24,
    `les quatre libellés font ${totalCar} caractères : au-delà de 24, la rangée déborde à 360 — c'est arrivé, et Eric l'a vu avant nous`);
});

test("🔴 UN REDESSIN REPOSE LES DÉS, IL NE LES EFFACE PAS — et il n'anime rien", () => {
  /* LE DÉFAUT MESURÉ AU NAVIGATEUR, et que 1 104 tests verts n'ont pas vu :
     le joueur pressait `flash roll`, l'écran se redessinait pour lui montrer
     où poser ses dés — et les trois dés disparaissaient du plateau.

     ⛔ LA FAUSSE RÈGLE QUI L'AVAIT CAUSÉ : « les dés ne naissent que d'un
     GESTE, jamais au rendu ». Elle venait d'un `TypeError` de `createDieHost`
     sous un DOM de test SANS `.style` — le moteur y pose la taille calculée
     de chaque dé. Une limite du stub habillée en principe.

     ⭐ CE QUI RESTE VRAI, ET QUE CE TEST GARDE : un redessin POSE, il
     n'ANIME jamais (`data-animate="0"`). Rejouer dix animations à chaque
     assignation serait le vrai défaut. */
  /* ⛔ PAS `makeRollBatch` ICI : son fixture porte `dice: [total]` — UN dé
     par jet, pas trois. Ce test parle des dés eux-mêmes, il lui faut donc un
     vrai lot de 3d6. (Le fixture n'a pas tort : les autres tests parlent de
     totaux et d'index, jamais de faces.) */
  const rollBatch = rollAbilitySet((() => { let n = 0; const seq = [0.9, 0.9, 0.9, 0, 0, 0, 0.5, 0.5, 0.5, 0.4, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0]; return () => seq[n++ % seq.length]; })());
  assert.equal(rollBatch.rolls[9].dice.length, 3, "mesure : un jet FH porte bien trois dés");
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  const hote = node.querySelectorAll(".tray-des")[0];
  assert.equal(hote.children.length, 3, "les trois dés du dernier jet sont reposés");
  assert.deepEqual(hote.children.map((d) => d.getAttribute("data-animate")), ["0", "0", "0"],
    "et AUCUN ne tombe : un redessin prend la pose, il ne rejoue pas la scène");
  assert.deepEqual(hote.children.map((d) => d.getAttribute("data-result")),
    rollBatch.rolls[9].dice.map(String), "ce sont bien les faces du DERNIER jet du lot");
});

test("⚠️ `4d6` n'est PAS le plateau — c'est une autre mécanique, et elle garde son organe", () => {
  /* Six jets de 4d6 dont on retire le plus bas : ni dix jets, ni lot rejeté,
     ni règle des 15. Le plateau ne saurait pas la rendre, et le gabarit ne la
     décrit pas. La molette échange l'organe ; elle ne le reconfigure pas. */
  const node = renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { method: "roll", rollingMethod: "4d6", rollBatch: null }), () => {});
  assert.equal(node.querySelectorAll(".tray").length, 0, "aucun plateau en 4d6");
  assert.equal(node.querySelectorAll(".ability-roll-batch").length, 1, "`renderRollBatch` reste intact et sert 4d6");
});

test("⚔️ ATTAQUE — le bouton `Roll` de 4d6 lit la MOLETTE, jamais un 3d6 en douce", () => {
  /* Le défaut était couvert par un chemin qu'on vient de supprimer : le
     palier `rollBatch` était method-aware, ce bouton-ci ne l'était pas
     (`rollAbilitySet`, du 3d6, quelle que soit la molette). En retirant le
     palier, ce bouton devient le SEUL chemin de 4d6 — et il aurait servi du
     3d6 en silence. 📌 Un défaut couvert par un chemin qu'on supprime. */
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /rollAbilityBatch\(state\.rollingMethod, Math\.random\)/,
    "le jet lit la méthode choisie");
  assert.equal(/rollAbilitySet\(/.test(shellText), false,
    "et plus aucun jet en dur du 3d6 dans la coquille — c'est la molette qui décide");
  assert.equal(/kind === "rollBatch"/.test(shellText), false,
    "le palier qui jetait a bien disparu : un seul propriétaire du lot");
});

/* ══ 5 — LA SAISIE DIRECTE POSE EXACTEMENT LE MÊME CHEMIN ═══════════════ */

test("mode manuel : cliquer une valeur pose exactement `set({path:\"abilities.<clef>\", value})` — même chemin qu'en tirage", () => {
  const manualDoc = set(fixture.document, "abilities.mode", "manual");
  const report = rebuild(manualDoc);
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), (a) => calls.push(a));
  const dexRow = rowFor(node, "dex");
  const btn17 = optionButtons(dexRow).find((b) => b.textContent === "17");
  assert.ok(btn17, "la plage 3..18 (LOT 74) porte bien 17 comme option cliquable");
  btn17.click();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { kind: "set", path: "abilities.dex", value: 17 });
});

/* ══ 9 (partie Abilities) — LES DEUX MODES EXISTENT, L'INACTIF DIT SON ÉTAT */

test("B5.2c — la fenêtre explicative CHANGE avec la molette (le texte vient de la table)", () => {
  const mot = (m) => renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "roll", rollingMethod: m }), () => {})
    .querySelectorAll(".ability-rolling-blurb p")[0].textContent;
  assert.notEqual(mot("fh3d6"), mot("4d6"), "deux méthodes, deux explications — jamais la même phrase");
  assert.match(mot("fh3d6"), /3d6/);
  assert.match(mot("4d6"), /4d6/);
});

/* ══ ⚔️ LOT 53, §2 test 1 — LE TEST QUI PROUVE LE LOT ═════════════════════
   `.ability-mode-switch` est un `renderPicker` (`carnet.mjs`) dont
   `labelOf` DIVERGE de la valeur : l'option affiche « Roll (3d6 × 10,
   keep 6) » pour la valeur brute `"roll"` (le cas cité en tête de la
   commande du lot). Un lecteur d'écran annonce le NOM ACCESSIBLE d'un
   bouton — `aria-label` s'il existe, sinon `textContent`. Ce test rougit
   sur le code d'avant ce lot (`btn.setAttribute("aria-label",
   String(value))` posait `"roll"`, jamais le libellé) et est vert ici. */

test("⚔️ le nom accessible d'une tuile de méthode est le libellé humain, jamais l'id", () => {
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), () => {});
  const libelles = node.querySelectorAll(".ability-entry").map((t) => t.textContent);
  assert.deepEqual(libelles, ["Roll dice", "Standard array", "Choose yourself"]);
  assert.equal(libelles.some((l) => /^(roll|standard|manual)$/.test(l)), false, "jamais une clef machine à l'écran");
});

test("B5.1b/c — une tuile commet `abilityMethod`, et RIEN n'est déplié d'avance", () => {
  /* ⚠️ LE GESTE A CHANGÉ DE FORME, PAS DE SENS. Au lot 45, la méthode était
     un picker qui posait `set({path:"abilities.mode"})` depuis l'écran. B5.1b
     en fait des DALLES-BOUTONS, et l'écran commet un geste d'écran — c'est la
     COQUILLE qui écrit ensuite `abilities.mode` (garde d'octets plus bas).
     Le champ reste rempli : cesser de l'écrire aurait perdu une intention. */
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), (a) => calls.push(a));
  const tuiles = node.querySelectorAll(".ability-entry");
  assert.equal(tuiles.length, 3, "trois tuiles — `Point buy` n'est pas offerte, voir le test dédié");
  assert.equal(node.querySelectorAll(".ability-rows").length, 0, "B5.1c : aucun roller, aucun chooser déplié");
  tuiles.find((t) => t.dataset.entry === "manual").click();
  assert.deepEqual(calls, [{ kind: "abilityMethod", value: "manual" }]);
});

test("garde — la coquille écrit TOUJOURS `abilities.mode` quand la méthode change", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /set\(\{ document: state\.document, path: "abilities\.mode", value: action\.value \}\)/,
    "aucune règle ne consomme ce champ, mais c'est une intention du joueur — la perdre serait un silence");
});

test("B5.2d — la molette de jet ne JETTE rien ; et depuis le plateau, `Validate` non plus", () => {
  /* Motif d'Eric, mot pour mot : « pour éviter de faire ramer le mobile ».
     ⭐ CE MOTIF EST INTACT — c'est son IMPLÉMENTATION qui a changé. Le test
     d'avant scellait `action: { kind: "rollBatch" }` : `Validate` était le
     jeteur. Le plateau (croquis B) en est un second, et DEUX PROPRIÉTAIRES
     DU MÊME LOT est la cause racine des quatre branchements ratés. Le palier
     a cessé de tirer ; il ne reste qu'un jeteur, celui que le joueur presse. */
  const calls = [];
  const node = renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { method: "roll", rollBatch: null }), (a) => calls.push(a));
  assert.equal(node.querySelectorAll(".ability-rolling").length, 1, "la molette est là");
  assert.equal(node.querySelectorAll(".ability-rows").length, 0, "aucune ligne d'affectation tant qu'aucun lot n'existe");
  node.querySelectorAll(".ability-rolling-pick .record-option")[1].click();
  assert.deepEqual(calls, [{ kind: "rollingMethod", value: "4d6" }], "tourner la molette ne produit AUCUN jet");
  /* 🔴 LE GARDE DU LOT : plus AUCUN palier ne porte d'action de jet. C'est
     une propriété du palier, pas de cet écran — si un futur lot rebranche un
     `{ kind: "rollBatch" }` sur `Validate`, ce test rougit avant que les deux
     jeteurs ne recommencent à se contredire. */
  const gate = abilitiesValidate({ document: fixture.document, method: "roll", rollBatch: null });
  assert.equal(gate.action, null, "le palier ne jette plus — le plateau est le seul jeteur");
  assert.equal(gate.next, "step", "et il n'y a plus qu'un palier : avancer quand les six sont posées");
});

/* ══ LE PLAFOND DE 18 — DÉCLARÉ, JAMAIS OPPOSÉ (commande §3c), ET QUI NE
   PARLE QU'AU NIVEAU 1 (lot 50, §2d) ══════════════════════════════════ */

test("un score final > 18 affiche une alerte, et `onAction` PART quand même — l'écran prévient, il ne bloque pas", () => {
  const withHighInt = set(fixture.document, "abilities.int", 18);
  const report = rebuild(withHighInt);
  assert.ok(report.resolved.abilities.int.score > 18, "mesure : 18 + boost d'Inheritance dépasse déjà 18 aujourd'hui");
  assert.equal(report.resolved.identity.level, 1, "mesure : le personnage d'exemple est niveau 1 — l'alerte doit donc parler (§2d)");
  // Un lot où int n'a encore reçu aucun dé (options garanties : le clic
  // ci-dessous ne dépend donc pas d'un hasard de rendu).
  const rollBatch = makeRollBatch([12, 11, 10, 9, 8, 7]);
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), (a) => calls.push(a));
  /* LOT 79 — L'ALERTE A SUIVI LA VALEUR : elle vit dans la CASE de la
     caractéristique, là où le score se lit, et non plus sur une rangée qui
     n'existe plus. Le fond ne change pas d'un mot : l'écran PRÉVIENT, il ne
     bloque pas. */
  const intCase = creneauPour(node, "int");
  const warning = intCase.querySelectorAll(".ability-cap-warning")[0];
  assert.ok(warning, "l'alerte de plafond s'affiche");
  assert.match(warning.textContent, /18/);
  // Et rien n'empêche de reposer un dé par-dessus : le geste part.
  glisser(dePour(node, 0), intCase);
  assert.equal(calls.length, 1, "le geste produit bien un appel — rien ne bloque");
  assert.equal(calls[0].kind, "assignAbilityRoll");
});

test("l'alerte de plafond ne parle qu'au niveau 1 — même score, même carac, rien au niveau 5", () => {
  const highAtOne = set(fixture.document, "abilities.str", 19);
  const reportOne = rebuild(highAtOne);
  assert.equal(reportOne.resolved.identity.level, 1);
  const nodeOne = renderAbilitiesStep(ctxFrom(reportOne.document, reportOne, { rollBatch: null }), () => {});
  assert.ok(rowFor(nodeOne, "str").querySelectorAll(".ability-cap-warning")[0], "niveau 1, 19 en FOR : l'alerte parle");

  const highAtFive = withoutHpMaxOverride(set(set(fixture.document, "abilities.str", 20), "level", 5));
  const reportFive = rebuild(highAtFive);
  assert.equal(reportFive.resolved.identity.level, 5, "mesure : le niveau posé est bien repris par resolved.identity.level");
  assert.ok(reportFive.resolved.abilities.str.score >= 20, "mesure : le score final dépasse bien 18 aussi à ce niveau");
  const nodeFive = renderAbilitiesStep(ctxFrom(reportFive.document, reportFive, { rollBatch: null }), () => {});
  assert.equal(rowFor(nodeFive, "str").querySelectorAll(".ability-cap-warning").length, 0, "niveau 5, 20 en FOR : rien ne se déclenche — le SRD reprend la main (§2d)");
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

test("🔴 `Point buy` N'EST PAS OFFERTE, et c'est mesuré — son barème n'existe nulle part", () => {
  /* B5.1b en nomme QUATRE. La quatrième manque, et pas par oubli : le budget
     de points et ses coûts non linéaires ne sont ni dans
     `layers/srd-5.2.1-en.layer.json` ni dans le moteur. Les écrire ici
     mettrait une règle du jeu dans l'interface, et publierait des nombres
     dont on ne sait pas s'ils sont SRD — ce que §0.8 interdit.
     ⛔ Une tuile morte serait un faux magasin. Ce test garde l'absence
     VOLONTAIRE, pour qu'on ne la prenne pas un jour pour un oubli. */
  assert.deepEqual(ABILITY_ENTRIES.map((e) => e.id), ["roll", "standard", "manual"]);
  assert.equal(ABILITY_ENTRIES.some((e) => /point/i.test(e.id + e.label)), false);
});

test("B5.7 — `Standard array` : six valeurs, SANS dés, par la même machinerie", () => {
  const lot = standardArrayBatch();
  assert.deepEqual(lot.rolls.map((r) => r.total), [15, 14, 13, 12, 10, 8]);
  assert.ok(lot.rolls.every((r) => r.kept), "aucun écarté : il n'y a rien à trier");
  assert.deepEqual(lot.assign, emptyAbilityAssign(), "et la carte d'affectation part vide — le remède au piège des deux 14");
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "standard", rollBatch: lot }), () => {});
  assert.equal(node.querySelectorAll(".ability-roll-batch").length, 0, "PAS de dés affichés (B5.7)");
  /* LOT 79 — LES SIX MOLETTES SONT DEVENUES LES SIX CASES DU CROQUIS B, et le
     tableau standard passe par la MÊME machinerie que le tirage : six valeurs
     à poser, six cases où les poser. ⭐ Un jeton sans dés n'affiche pas de
     détail (« 5+5+6 ») — il n'y en a pas, et rien n'invente une ligne vide. */
  assert.equal(node.querySelectorAll(".ability-creneau").length, 6, "mais les six cases, oui");
  assert.equal(desGardes(node).length, 6, "et les six valeurs à poser");
  assert.deepEqual(totauxOfferts(node), ["15", "14", "13", "12", "10", "8"]);
  assert.equal(node.querySelectorAll(".ability-de-detail").length, 0,
    "aucun détail de dés : il n'y a pas eu de jet");
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

  /* ⚠️ LOT 63 — L'ÉTAT QUE CE TEST EXERÇAIT N'EXISTE PLUS. Il rendait des
     rangées d'affectation avec `rollBatch: null` ; depuis B5.2d, il n'y a
     plus d'état où l'on voit les rangées SANS lot — la molette précède le
     jet, et `Validate` jette. On lui donne donc le lot le plus neutre qui
     soit : celui de `Standard array`, dont la carte d'affectation part vide.
     ⭐ Ce que l'attaque prouve est INCHANGÉ : rien n'est distribué, le choix
     BRUT reste lisible dans la note, et le score FINAL (boosté) s'affiche à
     côté sans jamais l'écraser. */
  const node = renderAbilitiesStep(
    ctxFrom(report.document, report, { method: "standard", rollBatch: standardArrayBatch() }), () => {});

  for (const [key, rawExpected, finalExpected, modExpected] of [
    ["con", "13", "14 (+2)", true],
    ["int", "15", "17 (+3)", true]
  ]) {
    /* LOT 79 — LA CELLULE « FINAL » A SUIVI LA VALEUR : elle vit dans la CASE
       de la caractéristique. Ce que ce test exige n'a pas bougé — les DEUX
       nombres lisibles à la fois, et l'écart annoncé. */
    const row = creneauPour(node, key);
    // 1) LE CHOIX BRUT RESTE VISIBLE, ET C'EST LUI QUE `set()` ÉCRIRAIT —
    //    jamais inversé par cette correction (contrainte ferme n°1). Depuis
    //    le lot 50, sans lot tiré (`rollBatch: null`), le picker n'a AUCUNE
    //    option (aucun dé n'existe pour l'offrir) — le brut n'est donc plus
    //    montré comme une option ACTIVE du picker, mais par la note « pas
    //    du tirage » (§2c) : « rien ne se cache » est tenu par un AUTRE
    //    élément, jamais par une option qui n'existe pas. Un test séparé
    //    (« mode manuel : cliquer une valeur pose exactement set(...) »)
    //    prouve déjà que le geste de clic écrit bien le CHEMIN brut.
    assert.equal(row.dataset.rempli, "false", `${key} : aucun dé posé, rien n'est « distribué »`);
    assert.equal(valeurDe(row), rawExpected,
      `${key} : le CHOIX BRUT (${rawExpected}) reste visible dans la case, jamais absent`);

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
    const row = creneauPour(node, key);
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

/* ══ LOT 74 — LA BORNE 3–18 EST LUE, JAMAIS RÉÉCRITE ; L'ATTENTE SE DIT ══
   Deux défauts rencontrés par Eric sur le déployé (2026-08-15) :
   `Choose yourself` proposait 1..20 (la borne est 3–18), et `Validate`
   arrivait éteint sur cet écran sans qu'un mot ne dise pourquoi. */

test("LOT 74 — la saisie manuelle offre EXACTEMENT la liste publiée par le moteur, pas une plage à elle", () => {
  const manualDoc = set(fixture.document, "abilities.mode", "manual");
  const report = rebuild(manualDoc);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), () => {});
  for (const key of ABILITY_KEYS) {
    const labels = optionLabels(rowFor(node, key));
    /* La référence est L'IMPORT `CREATION_SCORES` — les seize chiffres ne
       s'écrivent qu'une fois dans toute la suite (build-decisions.test.mjs) :
       si la borne change au moteur, ce test suit sans qu'on le retouche. */
    assert.deepEqual(labels, CREATION_SCORES.map(String),
      `${key} : les options du picker SONT la liste publiée — un écran qui écrirait sa propre plage aurait déplacé la faute`);
  }
  const strLabels = optionLabels(rowFor(node, "str"));
  assert.equal(strLabels.length, 16, "seize valeurs offertes — mesuré, c'était 20 avant ce lot");
  for (const hors of ["1", "2", "19", "20"]) {
    assert.equal(strLabels.includes(hors), false, `${hors} n'est plus offert à la création`);
  }
});

test("LOT 74 — l'attente SE DIT : tant que `Validate` n'a rien à faire à l'arrivée, l'écran écrit pourquoi", () => {
  /* L'APPARIEMENT est le garde : si un futur lot allume `Validate` au repos
     (il ne doit pas — B5.1c) OU retire la phrase, l'un des deux asserts
     rougit. Un bouton éteint ET muet est exactement le défaut mesuré. */
  const gate = abilitiesValidate({ document: fixture.document, method: null, rollBatch: null });
  assert.equal(gate.ready, false, "mesure : à l'arrivée (aucune méthode), le palier n'est pas prêt — c'est voulu (B5.1c)");
  const auRepos = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), () => {});
  const note = auRepos.querySelectorAll(".ability-gate-note")[0];
  assert.ok(note, "la phrase d'attente existe — un `Validate` éteint sans un mot était le défaut");
  assert.match(note.textContent, /pick one of the methods above/i, "elle dit QUOI faire, pas un état interne");

  /* Dès qu'une méthode est choisie, la phrase disparaît : elle décrit
     l'attente, pas l'écran — la laisser mentirait sur l'état. */
  const enManuel = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "manual" }), () => {});
  assert.equal(enManuel.querySelectorAll(".ability-gate-note").length, 0,
    "méthode choisie : plus de phrase d'attente");
  /* Et une fois la méthode choisie, `Validate` est PRÊT : pas d'attente à
     dire là non plus. ⚠️ LA RAISON A CHANGÉ, PAS LE RÉSULTAT — il s'allumait
     parce qu'il allait JETER ; il s'allume maintenant parce que les six
     scores du personnage d'exemple sont déjà posés. Le jet appartient au
     plateau (voir le test B5.2d). */
  const gateRoll = abilitiesValidate({ document: fixture.document, method: "roll", rollBatch: null });
  assert.equal(gateRoll.ready, true, "mesure : les six sont posées, donc le palier s'illumine — l'attente muette n'existait qu'à l'arrivée");
});
