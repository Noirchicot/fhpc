/* ══ LES TESTS DES LOTS 45, 50 ET 51 — L'ÉTAPE ABILITIES ═════════════════

   Même patron que `tests/skills-step.test.mjs` : on teste la FONCTION
   (`renderAbilitiesStep`), pas la page — `tests/dom-stub.mjs`, aucun paquet
   de plus.

   ⛔ AUCUN plan `decisions[]` pour ce chemin (mesuré, commande §0) : cette
   suite ne construit donc PAS son `ctx` comme `skills-step.test.mjs`
   (`decisions`, `violations`) — elle passe `document` (le brut, pour lire
   les six valeurs déjà posées et la méthode) et `resolved` (le score final,
   à l'octet).

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
import { ABILITY_KEYS } from "../src/build/index.mjs";
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
  emptyAbilityAssign
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

function ctxFrom(document, resolvedReport, extra) {
  return Object.assign({ document, resolved: resolvedReport.resolved, rollBatch: null }, extra || {});
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
  for (const key of ["con", "wis", "cha"]) {
    const labels = optionLabels(rowFor(node, key));
    assert.ok(labels.includes("15"), `${key} : le 15 du lot reste offert — le 15 EXISTANT de INT (hors lot) ne l'a pas volé`);
    assert.equal(labels.filter((l) => l === "14").length, 2, `${key} : les DEUX 14 du lot restent offerts — le 14 EXISTANT de DEX (hors lot) n'en a volé aucun`);
  }
});

/* ══ 2 — DEUX DÉS DE MÊME VALEUR SONT DEUX OPTIONS DISTINCTES ═══════════ */

test("deux dés de même valeur sont deux options distinctes : en assigner un laisse l'autre disponible", () => {
  const rollBatch = makeRollBatch([14, 14, 11, 11, 11, 8], { str: 0, dex: null, con: null, int: null, wis: null, cha: null });
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  const labels = optionLabels(rowFor(node, "dex"));
  assert.equal(labels.filter((l) => l === "14").length, 1, "le second 14 (index 1) reste une option pour dex, bien que le premier (index 0) soit pris par str");
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
  const labels = optionLabels(rowFor(node, "str"));
  assert.equal(labels.filter((l) => l === "14").length, 1, "le 14 tiré (index 0) reste disponible pour str — le 14 de dex (hors lot, jamais assigné) ne l'a pas consommé");
});

/* ══ 4 — UNE RANGÉE DISTRIBUÉE EST RECONNAISSABLE, UNE NON DISTRIBUÉE AUSSI
   (commande §2c) ══════════════════════════════════════════════════════ */

test("une rangée non distribuée est reconnaissable dans le rendu, et une rangée distribuée l'est aussi", () => {
  const rollBatch = makeRollBatch([12, 11, 10, 9, 8, 7], { str: 0, dex: null, con: null, int: null, wis: null, cha: null });
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  const strRow = rowFor(node, "str");
  const dexRow = rowFor(node, "dex");
  assert.equal(strRow.dataset.assigned, "true", "str a reçu un dé (index 0) : la ligne le dit");
  assert.equal(dexRow.dataset.assigned, "false", "dex n'a rien reçu : la ligne le dit aussi — « rien ne se cache » vaut dans les deux sens");
  // Et dex continue de montrer sa valeur COURANTE (14, celle du personnage
  // d'exemple) — « rien ne se cache » (§2) : elle ne disparaît pas pour
  // autant qu'elle ne vienne pas du lot.
  assert.match(dexRow.querySelectorAll(".ability-row-source")[0].textContent, /14/);
  assert.equal(strRow.querySelectorAll(".ability-row-source")[0].textContent, "from this roll");
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

  const node1 = renderAbilitiesStep(ctxFrom(report.document, report, {
    rollBatch: makeRollBatch(keptTotals, { str: 0, dex: null, con: null, int: null, wis: null, cha: null })
  }), () => {});
  assert.equal(optionLabels(rowFor(node1, "dex")).filter((l) => l === "12").length, 0, "str tient le dé 0 (12) : dex le voit nommé « 12 (STR) », jamais comme un 12 libre");

  const node2 = renderAbilitiesStep(ctxFrom(report.document, report, {
    rollBatch: makeRollBatch(keptTotals, { str: 2, dex: null, con: null, int: null, wis: null, cha: null })
  }), () => {});
  assert.equal(optionLabels(rowFor(node2, "dex")).filter((l) => l === "12").length, 1, "str a changé pour le dé 2 (10) : le dé 0 (12) redevient un « 12 » nu pour dex — le précédent est libéré");
  assert.equal(optionLabels(rowFor(node2, "dex")).filter((l) => l === "10").length, 0, "et le dé 2 (10), désormais tenu par str, se nomme « 10 (STR) », plus offert nu à dex");
});

/* ══ LOT 51 — LE DÉFAUT, L'ÉCHANGE, ET SES CAS LIMITES (§0/§1/§2 de sa
   commande) ═══════════════════════════════════════════════════════════ */

/* ⚔️ LE TEST QUI PROUVE LE LOT 51 — commande §2, test 1 : « ce test doit
   rougir sur le code d'aujourd'hui ». Rejoué sur `git show 33337a4:ui/
   builder/abilities-step.mjs` (le code d'avant ce lot), il donne 1 option,
   0 cliquable, sur les six rangées — exactement la mesure du §0 de la
   commande sur la page déployée. */
test("⚔️ LE TEST QUI PROUVE LE LOT 51 — après une distribution COMPLÈTE des six dés, chaque rangée offre encore six options, dont cinq cliquables", () => {
  const keptTotals = [8, 9, 10, 11, 12, 13];
  const assign = { str: 0, dex: 1, con: 2, int: 3, wis: 4, cha: 5 };
  const rollBatch = makeRollBatch(keptTotals, assign);
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch }), () => {});
  for (const key of ["str", "dex", "con", "int", "wis", "cha"]) {
    const row = rowFor(node, key);
    const options = optionButtons(row);
    assert.equal(options.length, 6, `${key} : six options, MÊME toutes distribuées — c'était 1 sur le code d'avant ce lot (§0)`);
    const clickable = options.filter((b) => b.getAttribute("data-active") !== "true");
    assert.equal(clickable.length, 5, `${key} : cinq cliquables — la sienne reste active (cliquer ne fait rien), les cinq autres échangent`);
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

  const strRow = rowFor(node, "str");
  const btn16 = optionButtons(strRow).find((b) => b.textContent === "16 (DEX)");
  assert.ok(btn16, "le 16 tenu par DEX se présente sur la ligne FOR, NOMMÉ comme tel (§1c) — jamais comme un dé libre");
  btn16.click();
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
  const dexRow = rowFor(node, "dex");
  const labels = optionLabels(dexRow);
  assert.ok(labels.includes("14 (STR)"), "le 14 tenu par str se nomme sur la ligne dex — jamais confondu avec le second");
  assert.ok(labels.includes("14"), "le second 14 (index 1), libre, reste une option NUE, distincte de « 14 (STR) »");
  const freeBtn = optionButtons(dexRow).find((b) => b.textContent === "14");
  freeBtn.click();
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

  const conRow = rowFor(node, "con");
  assert.equal(conRow.dataset.assigned, "false", "mesure de départ : con n'a encore rien reçu de ce lot");
  const btn12 = optionButtons(conRow).find((b) => b.textContent === "12 (WIS)");
  assert.ok(btn12, "le 12 tenu par wis se nomme sur la ligne con, jamais présenté comme un dé libre");
  btn12.click();
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
  const wisRow = rowFor(finalNode, "wis");
  assert.equal(wisRow.dataset.assigned, "false", "wis redevient « non distribuée » — rien ne se cache : la ligne le dit");
  assert.match(wisRow.querySelectorAll(".ability-row-source")[0].textContent, /^12 — not from this roll$/,
    "wis montre encore sa valeur (12), mais dit clairement qu'elle ne vient plus de CE lot");
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
    const btn = optionButtons(rowFor(node, key)).find((b) => b.textContent === String(keptTotals[i]));
    assert.ok(btn, `${key} : le dé ${keptTotals[i]} (index ${i}) est offert`);
    btn.click();
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

/* ══ ⚔️ LOT 53, §2 test 1 — LE TEST QUI PROUVE LE LOT ═════════════════════
   `.ability-mode-switch` est un `renderPicker` (`carnet.mjs`) dont
   `labelOf` DIVERGE de la valeur : l'option affiche « Roll (3d6 × 10,
   keep 6) » pour la valeur brute `"roll"` (le cas cité en tête de la
   commande du lot). Un lecteur d'écran annonce le NOM ACCESSIBLE d'un
   bouton — `aria-label` s'il existe, sinon `textContent`. Ce test rougit
   sur le code d'avant ce lot (`btn.setAttribute("aria-label",
   String(value))` posait `"roll"`, jamais le libellé) et est vert ici. */

test("⚔️ LE TEST QUI PROUVE LE LOT — le nom accessible du bouton « Roll » est le libellé humain, jamais l'id `roll`", () => {
  const report = rebuild(fixture.document);
  const node = renderAbilitiesStep(ctxFrom(report.document, report, { rollBatch: null }), () => {});
  const rollBtn = node.querySelectorAll(".ability-mode-switch .record-option")
    .find((b) => b.dataset.value === "roll");
  assert.ok(rollBtn, "le bouton de la méthode `roll` existe (lu dans ABILITY_METHODS via data-value)");
  const accessibleName = rollBtn.getAttribute("aria-label") || rollBtn.textContent;
  assert.equal(accessibleName, "Roll (3d6 × 10, keep 6)", "le nom accessible EST le libellé humain — jamais l'identifiant brut");
  assert.notEqual(accessibleName, "roll", "l'identifiant machine ne doit plus jamais être ce qu'un lecteur d'écran annonce");
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
  const intRow = rowFor(node, "int");
  const warning = intRow.querySelectorAll(".ability-cap-warning")[0];
  assert.ok(warning, "l'alerte de plafond s'affiche");
  assert.match(warning.textContent, /18/);
  // Et rien n'empêche de reposer un dé par-dessus : le clic part.
  const otherBtn = optionButtons(intRow)[0];
  assert.ok(otherBtn, "int n'a encore reçu aucun dé dans ce lot : au moins une option existe");
  otherBtn.click();
  assert.equal(calls.length, 1, "le clic produit bien un appel — rien ne bloque");
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
    // 1) LE CHOIX BRUT RESTE VISIBLE, ET C'EST LUI QUE `set()` ÉCRIRAIT —
    //    jamais inversé par cette correction (contrainte ferme n°1). Depuis
    //    le lot 50, sans lot tiré (`rollBatch: null`), le picker n'a AUCUNE
    //    option (aucun dé n'existe pour l'offrir) — le brut n'est donc plus
    //    montré comme une option ACTIVE du picker, mais par la note « pas
    //    du tirage » (§2c) : « rien ne se cache » est tenu par un AUTRE
    //    élément, jamais par une option qui n'existe pas. Un test séparé
    //    (« mode manuel : cliquer une valeur pose exactement set(...) »)
    //    prouve déjà que le geste de clic écrit bien le CHEMIN brut.
    assert.equal(row.dataset.assigned, "false", `${key} : sans lot tiré, rien n'est « distribué »`);
    assert.match(row.querySelectorAll(".ability-row-source")[0].textContent, new RegExp(`^${rawExpected} `),
      `${key} : le CHOIX BRUT (${rawExpected}) reste visible dans la note, jamais absent`);

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
