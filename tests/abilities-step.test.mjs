/* ══ LES TESTS DE L'ÉTAPE ABILITIES — lots 45/50/51/63/74/79, refaits au 80 ═

   Même patron que `tests/skills-step.test.mjs` : on teste la FONCTION
   (`renderAbilitiesStep`), pas la page — `tests/dom-stub.mjs`, aucun paquet
   de plus.

   ══ ⚠️ CE QUE LE LOT 80 A CHANGÉ DANS CE FICHIER, ET CE QU'IL N'A PAS TOUCHÉ

   L'ÉCRAN a changé de forme : quatre méthodes (`FH 3D6`, `4D6`, `ARRAY`,
   `FREE`) sur UN SEUL entonnoir — un sélecteur, un organe, un vivier d'îlots
   FS, un collecteur. Les six rangées à molette, la molette de méthode de jet
   et les pastilles plates de `4d6` ont disparu avec les trois formes qu'elles
   servaient.

   ⛔ LES INVARIANTS, EUX, N'ONT PAS BOUGÉ D'UN MOT, et c'est ce que ce
   fichier existe pour prouver :
   · deux dés de MÊME VALEUR restent DEUX dés distincts (lot 50 — une
     caractéristique pointe vers l'INDEX d'un dé, jamais vers sa valeur) ;
   · un score HORS LOT ne consomme aucun dé (lot 50, le défaut d'origine) ;
   · les dés restent TOUS prenables après une distribution complète, et
     recouvrir ÉCHANGE (lot 51, §1a/§1b) ;
   · le DOCUMENT ne gagne AUCUN champ : au plus deux `set` (lot 51, §1d) ;
   · le choix BRUT et le score FINAL se lisent tous les deux, jamais l'un
     pour l'autre (lot 46) ;
   · le plafond de 18 PRÉVIENT, il ne bloque pas, et il ne parle qu'au
     niveau 1 (lot 50, §2d).
   Ils se lisent simplement ailleurs, et souvent plus directement.

   ⭐ CE QUE LE LOT AJOUTE À GARDER : les deux planchers de la règle de tirage
   (§3), le vivier INÉPUISABLE de `FREE` et son retrait (§5.3), le
   modificateur BRUT sous chaque dé du vivier (§5.2), et le panneau INFO
   (§5.4). */

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

/* `shell.mjs` n'a AUCUN export et exécute son propre rendu à l'import : il ne
   peut pas être importé ici pour appeler `applyDecisionAction` en vrai (même
   limite que « garde 11 » de `tests/ui-jetons.test.mjs`, qui lit ses OCTETS
   pour la même raison). Les gardes d'octets de ce fichier passent par là. */
const UI_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");

const {
  renderAbilitiesStep, rollAbilitySet, currentAbilityValue, emptyAbilityAssign,
  abilitiesValidate, standardArrayBatch, freeBatch, lotSansDes, ABILITY_ENTRIES
} = await import("../ui/builder/abilities-step.mjs");

const fixture = exempleFhEn();
const { build } = fixture;

function rebuild(document) { return build.verbs.rebuild({ document }); }
function set(document, path, value) { return build.verbs.set({ document, path, value }).document; }

/** Rejoue EXACTEMENT ce que `shell.mjs` (`applyDecisionAction`, action
 *  `"assignAbilityRoll"`) fait d'un geste — lot 51, §1b/§1d. Si cette
 *  fonction diverge un jour de `shell.mjs`, c'est ELLE qu'il faut corriger
 *  pour recoller à la source, jamais l'inverse. */
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

/* ══ LES SONDES DU NOUVEL ÉCRAN ══════════════════════════════════════════
   ⚠️ UN DÉ SE CHERCHE DÉSORMAIS DES DEUX CÔTÉS, et il faut les distinguer :
   dans `FREE`, la palette GARDE son dé pendant qu'une cible en porte une
   copie du même index. Une sonde qui ne dirait pas de quel côté elle
   regarde rendrait deux nœuds pour un et mentirait sur l'état. */
function vivier(node) { return node.querySelectorAll(".fs-rangee")[0] || null; }
/* ⚠️ `.fs`, PAS `.fs-rangee > li` : le stub ne connaît pas le combinateur
   enfant (il découpe un sélecteur sur les espaces). Le nom de classe dit la
   même chose, et il le dit dans les deux mondes. */
function ilots(node) { return node.querySelectorAll(".fs"); }
function desDuVivier(node) {
  const rangee = vivier(node);
  return rangee ? rangee.querySelectorAll(".ability-de-garde") : [];
}
/* ⚠️ LA VALEUR SE LIT SUR LA FACE DU DÉ, plus au-dessus de lui : `.valeur` est
   le chiffre que l'écran peint par-dessus l'incrustation du moteur (qui, elle,
   ne sait afficher qu'une face de d6). Le total répété au-dessus est parti le
   2026-08-16 — même nombre, deux fois, à dix pixels d'écart. */
function totauxOfferts(node) {
  return desDuVivier(node).map((j) => j.querySelectorAll(".valeur")[0].textContent);
}
function deDuVivier(node, index) {
  return desDuVivier(node).find((j) => j.dataset.valeur === String(index)) || null;
}
function creneauPour(node, key) {
  return node.querySelectorAll(`.ability-creneau[data-creneau="${key}"]`)[0] || null;
}
function deDeLaCible(node, key) {
  const creneau = creneauPour(node, key);
  return creneau ? (creneau.querySelectorAll(".ability-de-garde")[0] || null) : null;
}
function valeurDe(creneau) {
  const v = creneau.querySelectorAll(".glisse-creneau-valeur")[0];
  return v ? v.textContent : null;
}
function tuiles(node) { return node.querySelectorAll(".ability-entry"); }
/** 🔴 LE LIVRE N'EST PLUS UNE TUILE — Eric, 2026-08-26 : *« info doit devenir
 *  un livre et disparaître »*. Il portait `ability-entry`, donc le gabarit,
 *  l'octogone et le pan coupé des quatre méthodes : un cinquième bouton
 *  identique proposait quelque chose qui n'est pas un choix. Il a maintenant
 *  sa propre classe, et ces suites le cherchent par elle.
 *  ⛔ NE PAS LE REMETTRE DANS `tuiles()` pour « faire passer un test » : c'est
 *  précisément la confusion qu'Eric a fait cesser. */
function livre(node) { return node.querySelectorAll(".fiche-livre")[0]; }

/** LE GESTE DU CROQUIS : on prend un dé, on le lâche sur une cible. Sans
 *  `cible`, c'est un TAP.
 *
 *  ⚠️ `attendreLeMaintien` — LES DÉS DE LA PALETTE NE SE SOULÈVENT PAS TOUT DE
 *  SUITE, et c'est le prix du second défilement (lot 79, `MAINTIEN_MS`). Dans
 *  une grille qui défile, un doigt qui bouge AVANT le soulèvement fait défiler
 *  la grille et le geste RENONCE — c'est exactement ce qu'on veut, et c'est ce
 *  que ce fichier a mesuré en rougissant quand la palette est passée en 4 × 4
 *  plafonnée. Un test qui contournerait l'attente prouverait un geste que
 *  personne ne peut faire.
 *  📌 L'attente est RÉELLE (360 ms) plutôt que simulée : `armerJeton` pose un
 *  `setTimeout` ordinaire, et truquer l'horloge pour trois tests coûterait
 *  plus de fiction que la seconde qu'on économise. */
const MAINTIEN_MS = 350;

async function glisser(de, cible, attendreLeMaintien) {
  globalThis.document.elementFromPoint = () => cible || null;
  de.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  if (attendreLeMaintien) await new Promise((ok) => setTimeout(ok, MAINTIEN_MS + 10));
  if (cible) de.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 1 });
  de.dispatchEvent({ type: "pointerup", clientX: cible ? 40 : 0, clientY: 0, pointerId: 1 });
}

/* ⚠️ `method` VIT DANS LE `ctx`, PAS DANS LE DOCUMENT (B5.1c, lot 63) : « il
   faut CLIQUER pour faire apparaître les rollers/choosers — rien n'est déplié
   d'avance ». Les tests la posent explicitement : c'est le geste du joueur. */
function ctxFrom(document, resolvedReport, extra) {
  const base = { document, resolved: resolvedReport.resolved, rollBatch: null };
  const avec = Object.assign(base, extra || {});
  if (avec.method === undefined) avec.method = avec.rollBatch ? "fh3d6" : null;
  /* ⭐ ET LE PALIER SUIT LA MÉTHODE, parce que c'est ce que fait le joueur
     (Eric, 2026-08-16) : cliquer une tuile OUVRE la page de sa méthode. Un
     `ctx` qui porte une méthode décrit donc quelqu'un qui est SUR cette page
     (palier 2) ; sans méthode, il est sur la racine, où il n'y a que le
     sélecteur. Les tests qui veulent explicitement la racine avec une méthode
     déjà choisie posent `palier: 1` à la main. */
  if (avec.palier === undefined) avec.palier = avec.method ? 2 : 1;
  return avec;
}

/** Le personnage d'exemple porte une SURCHARGE sur `resolved.vitals.hpMax` ;
 *  au-delà du niveau 1 elle n'est plus dérivable et `applyOverride` jette.
 *  La retirer est donc nécessaire pour tester un niveau ≠ 1 avec lui. */
function withoutHpMaxOverride(document) {
  return { ...document, build: { ...document.build, overrides: document.build.overrides.filter((o) => o.path !== "resolved.vitals.hpMax") } };
}

/** Un lot prêt à poser dans `ctx.rollBatch` — les `keptTotals` GARDÉS
 *  (index 0..n, dans l'ORDRE donné), puis quatre écartés. */
function makeRollBatch(keptTotals, assign) {
  const rolls = keptTotals.map((total, index) => ({ dice: [total], total, index, kept: true }));
  const rejected = [3, 3, 3, 3].map((total, i) => ({ dice: [total], total, index: keptTotals.length + i, kept: false }));
  return { rerollCount: 0, method: "fh3d6", rolls: rolls.concat(rejected), assign: assign || emptyAbilityAssign() };
}

/** Un lot de FH 3D6 tiré sur un hasard SCRIPTÉ — dix jets réels de trois dés.
 *  ⛔ Pas `makeRollBatch` quand un test parle des FACES : son fixture porte
 *  `dice: [total]`, un dé par jet. */
function lotScripte() {
  const seq = [0.9, 0.9, 0.9, 0, 0, 0, 0.5, 0.5, 0.5, 0.4, 0.4, 0.4, 0.3, 0.3, 0.3,
    0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let n = 0;
  return { ...rollAbilitySet(() => seq[n++ % seq.length]), method: "fh3d6", assign: emptyAbilityAssign() };
}

/* ══ 1 — LE VIVIER OFFRE TOUJOURS LES SIX, ET DEUX 14 RESTENT DEUX DÉS ════
   La loi du lot 51 (§1a), lue là où elle vit maintenant : dans le rendu, et
   plus dans une liste d'options. */

test("le vivier porte les six dés gardés, jamais les écartés — et chacun avec son index", () => {
  const rollBatch = makeRollBatch([14, 14, 15, 11, 8, 8]);
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  assert.deepEqual(totauxOfferts(node), ["14", "14", "15", "11", "8", "8"]);
  assert.deepEqual(desDuVivier(node).map((j) => j.dataset.valeur), ["0", "1", "2", "3", "4", "5"],
    "⛔ un dé s'identifie par son INDEX, jamais par sa valeur — c'était la cause du défaut du lot 50");
  assert.equal(ilots(node).length, 6, "six îlots, pas dix : les écartés sont barrés au plateau, pas offerts au vivier");
});

test("⚔️ LE TEST QUI PROUVE LE LOT 50 — deux dés à 14 sont DEUX dés : en poser un laisse l'autre", () => {
  const rollBatch = makeRollBatch([14, 14, 15, 11, 8, 8], { str: 0, dex: null, con: null, int: null, wis: null, cha: null });
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  /* Le 14 d'index 0 est parti chez STR : son îlot est vide, celui du 14
     d'index 1 ne l'est pas. Une comparaison par VALEUR les aurait confondus. */
  assert.equal(deDuVivier(node, 0), null, "le 14 posé a quitté le vivier");
  assert.ok(deDuVivier(node, 1), "l'AUTRE 14 est toujours là — deux index, deux dés");
  assert.equal(ilots(node)[0].dataset.vide, "true", "⛔ et son îlot GARDE SA PLACE : la rangée ne se referme pas sous le doigt");
  assert.equal(deDeLaCible(node, "str").dataset.valeur, "0", "et c'est bien le dé 0 que STR tient");
});

test("une valeur HORS LOT (le 14 que dex porte déjà, jamais tiré) ne consomme aucun dé", () => {
  /* Le défaut d'origine du lot 50, mesuré sur la page déployée : une valeur du
     personnage d'exemple qui « ressemblait » à un dé lui volait sa place. */
  const rollBatch = makeRollBatch([14, 12, 15, 11, 8, 8]);
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  assert.equal(desDuVivier(node).length, 6, "les six dés sont tous au vivier : rien n'a été consommé");
  const dex = creneauPour(node, "dex");
  assert.equal(dex.dataset.rempli, "false", "DEX n'a reçu aucun dé");
  assert.equal(dex.dataset.source, "hors-lot", "…et l'état se dit encore, pour la feuille et pour l'aria");
  /* ⌨️ MAIS PLUS RIEN N'EST ÉCRIT DANS LE CARRÉ — Eric, 2026-08-16 : *« un
     carré avec une cible de la taille du dé, RIEN ÉCRIT DEDANS »*. Une cible
     qui montre déjà un nombre n'invite pas à y poser un dé.
     ⚠️ Ce que ça retire est dit plutôt que tu : la valeur qu'une carac portait
     déjà au document ne s'affiche plus tant qu'aucun dé n'est posé. Elle reste
     dite à qui ne la voit pas. */
  assert.equal(valeurDe(dex), null, "rien d'écrit dans le carré");
  assert.equal(dex.querySelectorAll(".glisse-cible-vide").length, 1, "…rien qu'une cible");
  assert.match(dex.getAttribute("aria-label"), new RegExp(String(currentAbilityValue(fixture.document, "dex"))),
    "et la valeur reste DITE à qui ne la voit pas");
});

test("⚔️ LE TEST QUI PROUVE LE LOT 51 — après une distribution COMPLÈTE, les six dés restent TOUS prenables", () => {
  /* Le défaut : une fois les six posées, ZÉRO geste restait possible. Le
     vivier est alors vide — c'est NORMAL —, et c'est dans les CIBLES que les
     six dés restent prenables. Chacune porte le sien, armé du même geste. */
  const assign = { str: 0, dex: 1, con: 2, int: 3, wis: 4, cha: 5 };
  const rollBatch = makeRollBatch([15, 14, 13, 12, 10, 8], assign);
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), () => {});
  assert.equal(desDuVivier(node).length, 0, "le vivier est vide : les six sont posées");
  assert.equal(ilots(node).filter((i) => i.dataset.vide === "true").length, 6, "et les six îlots gardent leur place");
  for (const key of ABILITY_KEYS) {
    const de = deDeLaCible(node, key);
    assert.ok(de, `${key} porte un dé PRENABLE — sinon on ne peut plus changer d'avis`);
    assert.equal(de.dataset.pris, "true", "…et il s'annonce posé, il ne se retire pas (lot 51)");
  }
});

test("⚔️ L'ÉCHANGE — lâcher sur une cible OCCUPÉE commet le geste que shell.mjs troque", async () => {
  const assign = { str: 4, dex: 1, con: 2, int: 3, wis: 0, cha: 5 };
  const rollBatch = makeRollBatch([16, 14, 13, 12, 10, 8], assign);
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { rollBatch }), (a) => calls.push(a));
  /* Le dé de WIS (index 0, un 16) part sur STR, qui tient déjà le 10. */
  await glisser(deDeLaCible(node, "wis"), creneauPour(node, "str"));
  assert.deepEqual(calls, [{ kind: "assignAbilityRoll", key: "str", rollIndex: 0, value: 16 }]);

  /* Et voici ce que `shell.mjs` en fait — la logique rejouée à la main, avec
     les VRAIS verbes : STR prend le 16, WIS reprend le 10 que STR tenait.
     ⛔ Jamais WIS vide, jamais deux clefs sur le même index. */
  const apres = applyAssignAbilityRoll(fixture.document, assign, rollBatch, calls[0]);
  assert.equal(apres.assign.str, 0, "STR tient maintenant le 16");
  assert.equal(apres.assign.wis, 4, "et WIS a repris le 10 — l'échange, pas un trou");
  assert.equal(currentAbilityValue(apres.document, "str"), 16);
  assert.equal(currentAbilityValue(apres.document, "wis"), 10);
  const index = Object.values(apres.assign);
  assert.equal(new Set(index).size, index.length, "⛔ jamais deux caractéristiques sur le même dé");
});

test("deux dés de MÊME VALEUR restent distincts À L'ÉCHANGE — l'acquis du lot 50 survit au lot 51", () => {
  const assign = { str: 0, dex: 1, con: 2, int: 3, wis: 4, cha: 5 };
  const rollBatch = makeRollBatch([14, 14, 13, 12, 10, 8], assign);
  const apres = applyAssignAbilityRoll(fixture.document, assign, rollBatch,
    { kind: "assignAbilityRoll", key: "str", rollIndex: 1, value: 14 });
  assert.equal(apres.assign.str, 1, "STR prend le SECOND 14");
  assert.equal(apres.assign.dex, 0, "et DEX reprend le PREMIER — deux 14, deux places");
  assert.notEqual(apres.assign.str, apres.assign.dex);
});

test("§1b, LE CAS LIMITE — une cible NON SERVIE échange quand même, et rien n'est effacé", () => {
  const assign = { str: null, dex: 1, con: null, int: null, wis: null, cha: null };
  const rollBatch = makeRollBatch([14, 16, 13, 12, 10, 8], assign);
  const apres = applyAssignAbilityRoll(fixture.document, assign, rollBatch,
    { kind: "assignAbilityRoll", key: "str", rollIndex: 1, value: 16 });
  assert.equal(apres.assign.str, 1, "STR prend le 16");
  assert.equal(apres.assign.dex, null, "DEX n'avait rien à recevoir en retour : elle redevient « pas de ce tirage »");
  assert.equal(currentAbilityValue(apres.document, "dex"), currentAbilityValue(fixture.document, "dex"),
    "⛔ et sa valeur d'avant N'EST PAS EFFACÉE — un second `set` qui réécrirait la même valeur ne prouverait rien");
});

test("⚔️ après une distribution complète, le document ne porte QUE six abilities.<key> — aucun index ne s'y glisse", () => {
  const rollBatch = makeRollBatch([15, 14, 13, 12, 10, 8]);
  let document = fixture.document;
  let assign = emptyAbilityAssign();
  ABILITY_KEYS.forEach((key, i) => {
    const out = applyAssignAbilityRoll(document, assign, rollBatch,
      { kind: "assignAbilityRoll", key, rollIndex: i, value: rollBatch.rolls[i].total });
    document = out.document; assign = out.assign;
  });
  const chemins = document.build.choices.map((c) => c.path).filter((p) => p.startsWith("abilities."));
  assert.deepEqual(chemins.filter((p) => p !== "abilities.mode").sort(),
    ABILITY_KEYS.map((k) => `abilities.${k}`).sort(),
    "⛔ le document ne gagne AUCUN champ : la carte `assign` vit hors document et meurt avec le lot (§2a)");
  assert.deepEqual(ABILITY_KEYS.map((k) => currentAbilityValue(document, k)), [15, 14, 13, 12, 10, 8]);
});

test("emptyAbilityAssign() remet les six clefs à null — la carte que shell.mjs pose à chaque nouveau lot", () => {
  assert.deepEqual(emptyAbilityAssign(), { str: null, dex: null, con: null, int: null, wis: null, cha: null });
});

/* ══ 2 — LE MODIFICATEUR SOUS CHAQUE DÉ (§5.2), ET LES DEUX REGISTRES ════ */

test("⛔ AUCUN MODIFICATEUR SOUS UN DÉ — il n'est celui de personne, et il coûte une ligne", () => {
  /* TRANCHÉ PAR ERIC, 2026-08-16 : *« aucun intérêt de mettre les bonus sous
     chaque dé, seulement en bas dans le collecteur »*. Un brut posé au vivier
     n'est le modificateur de PERSONNE — un dé n'appartient encore à aucune
     caractéristique, et son brut ne survit pas à la pose (les boosts
     d'héritage le changent). Deux nombres pour un dé, dont un qui ne sera
     jamais vrai : la contradiction du lot 46, un étage plus haut.
     📏 ET IL COÛTAIT UNE LIGNE PAR TUILE — 91 px de haut contre 73 sans lui.
     C'est ce qui rendait le 4 × 4 de FREE trop grand pour son champ, et donc
     ce qui avait fait proposer un plafond et un second défilement. */
  const node = renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { rollBatch: makeRollBatch([18, 15, 13, 12, 10, 8]) }), () => {});
  assert.equal(node.querySelectorAll(".ability-de-mod").length, 0,
    "aucun modificateur sous un dé DU VIVIER : il n'y est celui de personne");
  /* ⛔ NI TOTAL AU-DESSUS : le dé porte sa valeur sur sa face, l'écrire deux
     fois coûtait une seconde ligne par tuile. */
  assert.equal(node.querySelectorAll(".ability-de-total").length, 0);
  assert.equal(desDuVivier(node).length, 6, "témoin : les six dés sont bien là, c'est le doublon qui est parti");
  /* ⭐ ET AUCUN BONUS DANS UNE CIBLE VIDE NON PLUS — Eric, 2026-08-16 : le
     bonus n'apparaît QUE quand un dé se pose. Une cible vide n'a rien à
     montrer : le nombre qui produirait ce bonus n'a pas encore été choisi. */
  assert.equal(node.querySelectorAll(".ability-row-final-value").length, 0,
    "rien de posé, donc aucun bonus");
});

test("⭐ LE BONUS APPARAÎT SOUS LE CARRÉ, ET SEULEMENT QUAND UN DÉ EST POSÉ", () => {
  /* Eric, 2026-08-16 : *« quand un dé se pose sur la cible, en dessous, à
     l'extérieur de ce carré, apparaît le bonus de carac »* — puis, sur mon
     objection : *« je m'en fous, le dé nomme la carac »*.

     🔴 L'OBJECTION EST CONSIGNÉE PARCE QU'ELLE A ÉTÉ TRANCHÉE, pas parce
     qu'elle était fausse : sur le personnage d'exemple, CON porte **13**, un
     boost d'héritage le monte à 14, donc le bonus vaut **+2** — un « +2 » sous
     un dé qui dit « 13 ». C'est la forme de la contradiction du lot 46.
     ⭐ La décision d'Eric se tient : sur CET écran, le dé qu'on pose EST le
     score de base qu'on choisit ; ce que le boost en fait appartient à la
     fiche, pas au geste. Le lot 46 réparait un écran où les deux registres se
     disputaient la MÊME ligne sans qu'un mot les sépare ; ici le dé dit le
     choix, le bonus dit ce qu'il donne, et ils sont à deux endroits.
     ⛔ Ce test existe pour qu'un prochain lot ne « répare » pas ça en
     remettant le score : ce serait rouvrir un arbitrage. */
  const report = rebuild(fixture.document);
  assert.equal(currentAbilityValue(report.document, "con"), 13, "mesure : le brut de CON");
  assert.equal(report.resolved.abilities.con.score, 14, "mesure : le boost le porte à 14");

  /* Rien de posé → aucun bonus, six cibles nues. */
  const vide = renderAbilitiesStep(
    ctxFrom(report.document, report, { method: "standard", rollBatch: standardArrayBatch() }), () => {});
  assert.equal(vide.querySelectorAll(".ability-row-final-value").length, 0);
  assert.equal(vide.querySelectorAll(".ability-creneau .glisse-cible-vide").length, 6);

  /* Un dé posé → le bonus, SEUL, sous le carré. */
  const lot = standardArrayBatch();
  lot.assign = { ...emptyAbilityAssign(), con: 0 };
  const pose = renderAbilitiesStep(ctxFrom(report.document, report, { method: "standard", rollBatch: lot }), () => {});
  const con = creneauPour(pose, "con");
  assert.equal(con.querySelectorAll(".ability-row-final-value")[0].textContent, "+2",
    "le BONUS seul — pas le score, c'est la décision d'Eric");
  assert.equal(con.querySelectorAll(".glisse-cible-vide").length, 0, "et le carré porte le dé, plus la cible");
  /* ⭐ Le bonus vient de `resolved`, à l'octet : il suit la règle du moteur
     (12-13 → +1, 14-15 → +2…) et se met à jour à chaque `rebuild`. */
  assert.equal(motDuModAttendu(report.resolved.abilities.con.mod), "+2");
  /* Les cinq autres restent nues : le bonus ne suit QUE le dé. */
  assert.equal(pose.querySelectorAll(".ability-row-final-value").length, 1);
});

/** Le modificateur écrit comme un joueur l'écrit — recopié du rendu pour que
 *  le test compare une FORME, pas une implémentation. */
function motDuModAttendu(mod) { return mod >= 0 ? `+${mod}` : String(mod); }

/* ══ 3 — LE PLAFOND DE 18 : LA RÈGLE SURVIT, L'AVIS S'EN VA ═════════════
   Eric, 2026-08-17 : *« enlève partout la mention “> 18 at creation”. Ce sera
   rappelé plus tard, là ça fait juste moche »*.

   🔴 CE GARDE CHANGE DE CAMP, IL NE DISPARAÎT PAS. Il tenait « l'alerte parle
   au niveau 1, se tait au niveau 5, et ne bloque jamais » ; il tient désormais
   « l'écran ne dit plus rien ET la règle n'a rien perdu ». Supprimer les deux
   cas aurait laissé partir la mention SANS jamais vérifier que ce qu'elle
   annonçait est encore opposé ailleurs — c'est-à-dire en confondant un avis
   avec la règle qu'il répétait. */

test("⛔ AUCUNE mention de plafond à l'écran, à aucun niveau — l'avis est parti", () => {
  const un = rebuild(set(fixture.document, "abilities.str", 19));
  assert.equal(un.resolved.identity.level, 1, "mesure : niveau 1, celui où l'alerte parlait");
  assert.ok(un.resolved.abilities.str.score > 18, "mesure : le score final dépasse bien 18");
  const nodeUn = renderAbilitiesStep(
    ctxFrom(un.document, un, { method: "standard", rollBatch: standardArrayBatch() }), () => {});
  assert.equal(nodeUn.querySelectorAll(".ability-cap-warning").length, 0, "plus de balise d'alerte");
  assert.doesNotMatch(nodeUn.textContent, /at creation/, "ni le mot, où qu'il soit sur l'écran");
});

test("⭐ ET LA RÈGLE, ELLE, REFUSE TOUJOURS — c'est le moteur qui l'opposait, pas l'écran", () => {
  /* 🔴 LA PREUVE QUE LE RETRAIT NE COÛTE RIEN AU JEU. `decisions.mjs` verrouille
     `abilities.score-out-of-creation-range` hors de 3..18 : un score de 19 posé
     à la création reste refusé, exactement comme avant, et l'écran n'y était
     pour rien (il le disait lui-même : *« alerte seulement »*). */
  const bornes = CREATION_SCORES;
  assert.equal(bornes[bornes.length - 1], 18, "la borne haute de création est bien 18, LUE au moteur");
  assert.ok(!bornes.includes(19), "19 n'est pas une valeur de création offerte");
});

test("un score final > 18 ne bloque toujours AUCUN geste sur cet écran", async () => {
  const report = rebuild(set(fixture.document, "abilities.int", 18));
  assert.ok(report.resolved.abilities.int.score > 18, "mesure : 18 + boost dépasse déjà 18");
  const calls = [];
  const node = renderAbilitiesStep(
    ctxFrom(report.document, report, { rollBatch: makeRollBatch([12, 11, 10, 9, 8, 7]) }), (a) => calls.push(a));
  await glisser(deDuVivier(node, 0), creneauPour(node, "int"));
  assert.equal(calls.length, 1, "le geste produit bien son action");
  assert.equal(calls[0].kind, "assignAbilityRoll");
});

/* ══ 4 — LE SÉLECTEUR : QUATRE MÉTHODES, ET RIEN N'EST DÉPLIÉ D'AVANCE ═══ */

test("🔴 LES QUATRE MÉTHODES DU CROQUIS, plus INFO — et `Point buy` n'est toujours pas offerte", () => {
  assert.deepEqual(ABILITY_ENTRIES.map((e) => e.id), ["fh3d6", "4d6", "standard", "free"]);
  assert.deepEqual(ABILITY_ENTRIES.map((e) => e.label), ["FH 3D6", "4D6", "ARRAY", "FREE"],
    "⌨️ les libellés sont ceux du croquis, mot pour mot");
  /* 🔴 `Point buy` MANQUE, ET PAS PAR OUBLI : son barème n'existe nulle part
     dans le dépôt. L'écrire ici mettrait une règle du jeu dans l'interface et
     publierait des nombres dont on ne sait pas s'ils sont SRD (§0.8). Une
     tuile morte serait un faux magasin. Ce test garde l'absence VOLONTAIRE. */
  assert.equal(ABILITY_ENTRIES.some((e) => /point/i.test(e.id + e.label)), false);
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), () => {});
  assert.deepEqual(tuiles(node).map((t) => t.dataset.entry), ["fh3d6", "4d6", "standard", "free"],
    "QUATRE tuiles — les quatre méthodes, et rien qui leur ressemble sans en être une");
  /* ⭐ Le cinquième bouton existe toujours, mais il ne se déguise plus en
     méthode : c'est le livre, et il se cherche par sa forme. */
  assert.equal(livre(node).dataset.entry, "info", "le livre est là, hors de la famille des méthodes");
});

test("⚔️ le nom accessible d'une tuile est le libellé humain, jamais l'id", () => {
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), () => {});
  const libelles = tuiles(node).map((t) => t.textContent);
  assert.deepEqual(libelles, ["FH 3D6", "4D6", "ARRAY", "FREE"]);
  assert.equal(libelles.some((l) => /^(fh3d6|standard|free|info)$/.test(l)), false, "jamais une clef machine à l'écran");
  /* 🔴 ET LE MOT « INFO » A QUITTÉ L'ÉCRAN — la seconde moitié de la consigne
     d'Eric (*« et disparaître »*). Le livre ne porte plus de libellé visible ;
     son nom vit dans `aria-label`, qui est fait pour ça. */
  assert.equal(livre(node).textContent, "", "le livre ne porte aucun mot");
  /* 🔴 LIBELLÉ RÉÉCRIT LE 2026-09-05, ET LA PROPRIÉTÉ N'A PAS BOUGÉ. Ce garde
     tenait « Compare the methods » — le livre comparait alors les méthodes dans
     un panneau interne. Il MÈNE désormais au chapitre `ability-scores` de FH
     WEB (sacré n° 2 : le livre ne raconte pas la règle, il y mène), donc le nom
     dit la destination, pas un geste qui n'existe plus.
     ⭐ Ce qui est gardé ici est inchangé : un bouton muet à l'écran ne doit pas
     l'être pour un lecteur d'écran. C'est la PROPRIÉTÉ, pas le mot. */
  assert.equal(livre(node).getAttribute("aria-label"), "Ability scores — read the rules on FH Web",
    "⚠️ mais il se NOMME pour qui ne voit pas le dessin — un bouton muet à "
    + "l'écran ne doit pas l'être aussi pour un lecteur d'écran");
  assert.equal(livre(node).hasAttribute("aria-pressed"), false,
    "⛔ et il n'est PLUS un interrupteur : un organe qui ouvre un onglet n'a pas "
    + "d'état à dire, et l'annoncer apprendrait une bascule qui n'existe pas");
});

test("B5.1b/c — une tuile commet `abilityMethod`, et RIEN n'est déplié d'avance", () => {
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), (a) => calls.push(a));
  assert.equal(node.querySelectorAll(".ability-organe").length, 0, "B5.1c : aucun organe déplié");
  assert.equal(vivier(node), null, "aucun vivier");
  assert.equal(node.querySelectorAll(".ability-collecteur").length, 0, "et aucun collecteur");
  tuiles(node).find((t) => t.dataset.entry === "free").click();
  assert.deepEqual(calls, [{ kind: "abilityMethod", value: "free" }]);
});

test("⌨️ LE MOT DE LA RACINE — celui d'Eric, dans SA dalle, et il rend LE LIVRE découvrable", () => {
  /* ⚠️ CE TEST A CHANGÉ DE LOI, PAS DE VIGILANCE. Il gardait un APPARIEMENT
     (lot 74) : tant que `DONE` restait éteint au repos, une phrase devait dire
     pourquoi — « un bouton éteint ET muet » était le défaut mesuré.
     🔴 LA RACINE N'A PLUS DE `DONE` DU TOUT (Eric, 2026-08-16) : une note qui
     explique un bouton absent n'explique rien, et l'appariement n'a plus de
     seconde moitié. La phrase reste, mais elle ne décrit plus un ÉTAT — elle
     dit QUOI FAIRE, donc elle est là en permanence.

     ⌨️ Le texte est celui d'Eric, mot pour mot — un libellé est à lui. */
  /* 🔴 LA PHRASE A SUIVI LE BOUTON — 2026-08-26. Elle disait *« click on
     INFO »* ; il n'y a plus d'INFO à cliquer, il y a un livre. Une consigne
     qui nomme un bouton disparu est pire qu'aucune consigne.
     ⭐ ET ELLE EST EN HAUT MAINTENANT : *« ici la barre de texte recouvre la
     zone de boutons ; le texte devait être en haut »* — elle courait sous le
     `?` de la dalle. Une consigne se lit AVANT le geste qu'elle commande. */
  const MOT = "Pick one of the methods below to begin. The book explains the key differences.";
  const racine = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), () => {});
  const note = racine.querySelectorAll(".guide-mot")[0];
  assert.ok(note, "la racine porte son mot");
  assert.equal(note.textContent, MOT);

  /* ⭐ ET IL VIT DANS LA DALLE DU SÉLECTEUR — *« texte à intégrer dedans »*.
     Posé à côté, il flotterait sur le fond au lieu d'appartenir au bloc. */
  const dalle = racine.querySelectorAll(".ability-methodes")[0];
  assert.equal(dalle.querySelectorAll(".guide-mot").length, 1,
    "il est DANS la dalle, pas en dessous d'elle");

  /* ⭐ IL RESTE QUAND UNE MÉTHODE EST DÉJÀ CHOISIE : la racine sert aussi à
     CHANGER d'avis, et « quoi faire » ne cesse pas d'être vrai. */
  const revenu = renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { method: "standard", rollBatch: standardArrayBatch(), palier: 1 }), () => {});
  assert.equal(revenu.querySelectorAll(".guide-mot")[0].textContent, MOT);

  /* ⛔ MAIS PAS SUR LA PAGE D'UNE MÉTHODE : là, le sélecteur n'est plus, et
     son mot part avec lui.

     🔴 CE GARDE A CHANGÉ DE FORME LE 2026-09-05, PAS DE PROPRIÉTÉ. Il exigeait
     **zéro** `.guide-mot` sur la page d'une méthode — ce qui disait la bonne
     chose tant que la racine était la SEULE à en porter un. Eric a désigné la
     prose de B1 comme un aiguilleur (*« Ten rolls of 3d6 … = aiguilleur »*),
     donc la page en porte un désormais, et « zéro » cesserait de défendre la
     règle pour défendre un état du monde.
     ⭐ CE QUI EST GARDÉ RESTE EXACTEMENT LE MÊME : le mot de la RACINE ne fuit
     pas sur la page d'une méthode. On le vérifie donc sur son TEXTE, la seule
     chose qui l'identifie — ⛔ jamais sur un compte, qui confond deux organes
     que rien n'oblige à rester seuls. */
  const page = renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { method: "standard", rollBatch: standardArrayBatch() }), () => {});
  const motsDeLaPage = [...page.querySelectorAll(".guide-mot")].map((n) => n.textContent);
  assert.equal(motsDeLaPage.includes(MOT), false,
    "⛔ le mot de la racine ne suit pas sur la page d'une méthode — le sélecteur parti, sa consigne aussi");
  /* ⭐ ET LA PAGE PORTE BIEN LE SIEN : l'aiguilleur de la méthode, qui dit sa
     règle à elle. Un garde qui n'éprouve qu'une moitié d'alternative laisse
     l'autre libre de mentir (TRAPS, lot 124). */
  assert.equal(motsDeLaPage.length, 1,
    "et elle porte SON aiguilleur, celui de la méthode");

  /* 🔴 ET LE MOT NOMME LE LIVRE, PLUS `INFO` — Eric, 2026-08-26 : *« Abilities :
     info doit disparaître et devenir un bouton livre ! »*
     ⭐ LE TRAVAIL DE CETTE PHRASE N'A PAS CHANGÉ, SON OBJET SI : elle rend le
     bouton DÉCOUVRABLE. Elle était née parce qu'`INFO` portait le gabarit des
     quatre méthodes et ne se distinguait plus par sa forme — elle rattrapait
     une confusion. Le livre, lui, ne ressemble à aucune méthode : la phrase
     n'a plus à réparer, seulement à désigner.
     ⛔ ET LE GARDE APPARIE TOUJOURS LES DEUX MOITIÉS : un mot qui nomme un
     bouton absent est pire qu'aucun mot. Si le livre disparaît, ce test
     rougit — c'est ce que la seconde assertion tient. */
  assert.match(note.textContent, /\bbook\b/i);
  assert.ok(livre(racine), "témoin : le bouton que la phrase nomme existe bien");
  assert.equal(livre(racine).textContent, "", "et il n'écrit pas « INFO » : le mot a disparu de l'écran");
});

test("🔴 SUR DU VERRE, L'AIGUILLEUR ÉCRIT EN `--text` — 2,63:1 mesuré avant", () => {
  /* ⚠️ CE GARDE A CHANGÉ D'OBJET LE 2026-09-04, ET C'EST LA LOI §0.6.
     Il tenait `.ability-methodes-mot`, une classe locale ; cette classe est
     partie avec son balisage quand Eric a nommé l'organe : *« le texte en
     dessous, ça devrait être en bleu : L'AIGUILLEUR »*. Le BESOIN, lui, n'a pas
     bougé d'un mot — il a seulement changé d'adresse.

     📏 ET IL S'EST AVÉRÉ PLUS LARGE QUE SON ANCIEN OBJET. Mesuré sur la page
     rendue, sur le rendu CUMULÉ (fond + voile 35 % + lavis d'info) : l'encre
     de l'organe (`--text-soft`) rendait **2,63:1 le jour** et **2,74:1 la
     nuit**, pour 4,5 exigés — et pas seulement ici : `.guide-mot` vit déjà sur
     une `dalle-simple` à **Destiny R**. La réparation est donc à l'organe,
     conditionnée au voile, et elle répare les deux écrans d'un coup.
     📏 APRÈS : **5,51:1** et **5,68:1**. */
  /* 🔴 CE GARDE CITAIT LE SÉLECTEUR AU CARACTÈRE PRÈS, `>` COMPRIS — et il a
     donc rougi sur sa propre réparation, le 2026-09-05, avec l'air d'avoir
     raison. L'enfant direct ne voyait que les aiguilleurs posés au premier rang
     d'une dalle ; celui de B1 vit un cran plus bas et rendait `--text-soft`,
     **2,63:1**, sous la garde de ce test.
     ⭐ *Un garde décrit ce qui doit RESTER VRAI, jamais comment c'est écrit*
     (TRAPS, lot 124). La promesse est : sur du verre, l'aiguilleur écrit en
     `--text` — à un rang comme à trois. */
  const css = fs.readFileSync(path.join(UI_DIR, "shell.css"), "utf8");
  const regleDuVerre = /:is\(\.dalle-simple, \.dalle-intermediaire\)( >)? \.guide-mot \{ color: var\(--text\); \}/;
  assert.match(css, regleDuVerre,
    "sur du verre, seule --text tient les 4,5:1 (CADRES.md §8)");
  /* ⛔ ET ELLE NE SE LIMITE PAS À L'ENFANT DIRECT : le combinateur `>` encode
     une STRUCTURE là où la règle parle d'un MILIEU, et une structure change au
     premier emboîtement. C'est ce qui a laissé passer le défaut de B1. */
  assert.doesNotMatch(css, /:is\(\.dalle-simple, \.dalle-intermediaire\) > \.guide-mot \{ color: var\(--text\); \}/,
    "⛔ pas `>` : ce qui décide est le FOND de la dalle, pas la profondeur de l'organe dedans");

  /* ⚔️ ATTAQUE — le garde mord-il ? On relit la règle de l'organe NU : si elle
     portait déjà `--text`, la règle ci-dessus serait décorative et sa
     disparition ne se verrait jamais. */
  /* ⚠️ ANCRÉ EN DÉBUT DE LIGNE : `.ability-methodes > .guide-mot` contient la
     même chaîne et arrive AVANT dans le fichier — un `indexOf` naïf lisait la
     règle de marge et croyait l'organe sans encre. */
  const nu = css.slice(css.indexOf("\n.guide-mot {"));
  assert.match(nu.slice(0, nu.indexOf("}")), /color:\s*var\(--text-soft\)/,
    "témoin : l'organe écrit bien en encre douce SUR FOND OPAQUE — c'est ce que la règle du verre corrige");
});

test("🔲 R ABILITIES — DEUX RANGÉES, ET LA SECONDE EST UNE RANGÉE DE CONTRÔLES", () => {
  /* 🔴 ERIC, 2026-09-04 : *« 2 rangées de bouton : 1ère rangée nickel ; 2ème
     rangée contient un élément centré avec livre et ? là où il faut. »*

     ⛔ CE QUE ÇA REMPLACE ÉTAIT JUSTE PAR HASARD : une seule rangée en
     `flex-wrap` coupait à trois, et le livre comme le `?` étaient posés en
     `absolute` aux deux coins BAS de la dalle. Mesuré avant — livre y=177,
     `?` y=177, `FREE` y=177 : trois organes alignés par coïncidence de cotes,
     que la moindre ligne de plus dans la dalle aurait séparés. */
  const racine = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), () => {});

  const rang1 = racine.querySelectorAll(".ability-methodes-rang");
  assert.equal(rang1.length, 1, "une première rangée, déclarée");
  const controles = racine.querySelectorAll("[data-rangee]");
  assert.equal(controles.length, 1, "une seconde rangée, et elle DÉCLARE ce qu'elle est");

  /* ⭐ LE DÉCOUPAGE EST DÉDUIT DE LA LARGEUR, PAS COMPTÉ : 3 × 87 + 2 × 8 = 277
     tiennent dans les 351 utiles ; quatre en demanderaient 372. Le garde relit
     donc la SOMME des deux rangées, jamais un nombre écrit ici. */
  const enRang1 = rang1[0].querySelectorAll(".ability-entry").length;
  const enControles = controles[0].querySelectorAll(".ability-entry").length;
  assert.equal(enRang1 + enControles, ABILITY_ENTRIES.length,
    "toutes les méthodes sont rendues, et une seule fois");
  assert.ok(enControles >= 1, "le reste tombe dans la rangée de contrôles — §6 pré la centre sans savoir combien");

  /* 🔴 LE LIVRE EST UNE BORNE DE CETTE RANGÉE, plus une pastille sur un coin. */
  assert.equal(controles[0].querySelectorAll(".fiche-livre").length, 1,
    "le livre est DANS la rangée : une borne a une colonne, jamais une réserve");
  assert.equal(rang1[0].querySelectorAll(".fiche-livre").length, 0,
    "⛔ et pas dans la première : elle ne porte que des méthodes");

  /* ⭐ ET LE COMPTE N'EST ÉCRIT QUE DANS LE DÉCOUPAGE : la feuille ne le
     connaît pas, elle emploie `grid-auto-flow: column`. Le garde le tient à
     l'envers — si un `repeat(N, …)` réapparaissait, le nombre serait écrit deux
     fois et divergerait au premier réglage. */
  const feuille = fs.readFileSync(path.join(UI_DIR, "shell.css"), "utf8");
  const bloc = feuille.slice(feuille.indexOf(".ability-methodes-rang {"));
  assert.match(bloc.slice(0, bloc.indexOf("}")), /grid-auto-flow:\s*column;/,
    "la grille déduit ses colonnes de ses enfants — elle ne compte pas");

  /* ⚔️ ATTAQUE — le garde mord-il ? Si la seconde rangée cessait de déclarer
     `data-rangee`, la coquille ne lui descendrait plus le `?` et ne cadrerait
     plus son groupe : elle redeviendrait une file de boutons. On le prouve en
     relisant les DEUX lecteurs de cet attribut dans la coquille. */
  /* ⚠️ CE QUE CE GARDE VÉRIFIAIT A CHANGÉ D'ADRESSE LE 04/09 — il lisait les
     DEUX sélecteurs que la coquille employait alors. Les deux ont fusionné dans
     une seule constante quand Eric a posé l'absolu (*« livre et `?` toujours
     dans la dernière rangée »*) : une liste recopiée à deux endroits ne peut pas
     tenir un absolu. Le garde lit donc la constante, et la porte qu'elle ouvre. */
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /const RANGEES = "[^"]*\[data-rangee\]";/,
    "`[data-rangee]` est une des cinq rangées du site — sans elle, cette rangée-ci n'en serait pas une");
  assert.match(shellText, /function poserLesBornes\(racine\)/,
    "et c'est un passage UNIQUE qui y descend le livre et le `?` (shell-wiring garde 19)");
});

test("🔲 LA CINQUIÈME PORTE EST OUVERTE PARTOUT — les cinq listes de la feuille", () => {
  /* ⛔ LA RANGÉE DE CONTRÔLES EST ÉNUMÉRÉE À CINQ ENDROITS DANS `shell.css` :
     la géométrie, les deux bornes, le livre, le `?`, le groupe. Une porte
     ouverte dans quatre listes sur cinq ne se voit pas — elle rend juste UN
     organe de travers, et §6 pré dit que ce défaut a déjà coûté trois passes.
     ⭐ D'où un garde qui compte, plutôt qu'un œil qui relit. */
  const css = fs.readFileSync(path.join(UI_DIR, "shell.css"), "utf8");
  const listes = css.match(/\.parcours-pied,\s*\n\.sortie,\s*\n\.fiche-actions,\s*\n\.card-pied,\s*\n\[data-rangee\]|:is\(\.parcours-pied, \.sortie, \.fiche-actions, \.card-pied, \[data-rangee\]\)/g) || [];
  assert.equal(listes.length, 5,
    "les CINQ listes portent la cinquième porte — pas quatre, pas six");

  /* ⚔️ ATTAQUE — et aucune liste des quatre ne survit sans elle. */
  const orphelines = css.match(/:is\(\.parcours-pied, \.sortie, \.fiche-actions, \.card-pied\)/g) || [];
  assert.equal(orphelines.length, 0,
    "⛔ aucune liste n'est restée à quatre : c'est exactement comme ça qu'un organe se retrouve seul de travers");
});

test("🔲 LA DALLE DE R EST UNE GRILLE, ET ELLE SEULE ÉCRIT SES ÉCARTS", () => {
  /* 🔴 ERIC, 2026-09-04 : *« désormais tout est dans une boîte, toutes les
     boîtes sont sur une grille y compris les boutons »* · *« on définit les
     espaces en général 8 blg »*.
     📏 MESURÉ APRÈS : la dalle rend **188 blg** — 8 + 15 + 8 + 45 + 8 + 44 + 8
     + 44 + 8 — et les quatre intervalles valent 8. AVANT le zérotage des marges
     d'enfants, deux d'entre eux rendaient **16** (le `gap` PLUS la marge), et
     la dalle 204. */
  const css = fs.readFileSync(path.join(UI_DIR, "shell.css"), "utf8");
  const dalle = css.slice(css.indexOf(".ability-methodes {"));
  const corps = dalle.slice(0, dalle.indexOf("}"));
  assert.match(corps, /display:\s*grid;/, "la dalle est une grille");
  assert.match(corps, /gap:\s*var\(--sp-8\);/, "et son écart vaut 8 — le général d'Eric");

  /* ⭐ UN SEUL ÉCRIVAIN : les enfants qui portent une marge pour leurs AUTRES
     hôtes la rendent ici, et l'exception est NOMMÉE — jamais un `> *` qui
     parierait sur l'ordre du fichier. */
  assert.match(css, /\.ability-methodes > \.guide-mot \{ margin-block: 0; \}/,
    "l'aiguilleur rend sa marge à la grille, nommément");

  /* ⛔ ET LES BOUTONS SONT SUR UNE GRILLE, À LEUR COTE — jamais des parts. */
  const rang = css.slice(css.indexOf(".ability-methodes-rang {"));
  const rangCorps = rang.slice(0, rang.indexOf("}"));
  assert.match(rangCorps, /grid-auto-columns:\s*var\(--glisse-case\);/,
    "des colonnes à la cote du jeton — jamais une part, jamais un compte écrit");
  assert.equal(/1fr/.test(rangCorps), false,
    "⛔ pas de parts : « une case qui s'étire ne laisse RIEN à centrer »");
  assert.match(rangCorps, /gap:\s*var\(--sp-8\);/);

  /* ⚔️ ATTAQUE — l'ancienne rangée est bien partie AVEC son balisage (§0.6). */
  const ecran = stripComments(fs.readFileSync(path.join(UI_DIR, "abilities-step.mjs"), "utf8"));
  assert.equal(/ability-methodes-boutons|ability-methodes-mot/.test(ecran), false,
    "⛔ le balisage d'avant ne survit pas au lot qui le remplace");
  assert.equal(/"aiguilleur"/.test(ecran), false,
    "⛔ et aucun sosie de l'aiguilleur : `.aiguilleur` est le recouvrement d'Équipement (mesuré : 375 × 500 blg)");
});

test("garde d'octets — la coquille écrit TOUJOURS `abilities.mode` quand la méthode change", () => {
  /* Aucune règle ne consomme ce champ (Review le classe dans « player choices
     no rule consumed »), mais c'est une intention du joueur : cesser de
     l'écrire serait la perdre en silence. ⚠️ L'ÉCRAN, lui, ne le lit plus. */
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /set\(\{ document: state\.document, path: "abilities\.mode", value: action\.value \}\)/);
  const ecran = stripComments(fs.readFileSync(path.join(UI_DIR, "abilities-step.mjs"), "utf8"));
  assert.equal(/abilities\.mode/.test(ecran), false,
    "⛔ et l'écran ne lit plus ce champ : rien n'est déplié d'avance, il n'y a donc pas de méthode à en déduire");
});

/* ══ 5 — LES QUATRE ORGANES, ET UN SEUL PLATEAU ═════════════════════════ */

test("🔴 `FH 3D6` : le PLATEAU est sur le chemin vivant, avec les trois libellés d'Eric — et la scène 1", () => {
  /* Le défaut qui a résisté à quatre branchements : `renderTray` était
     importé et câblé dans une fonction que PERSONNE n'appelait. Ce test passe
     donc par la porte du joueur, jamais par `renderTray` en direct. */
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "fh3d6" }), () => {});
  assert.equal(node.querySelectorAll(".tray").length, 1, "le plateau est sur le chemin vivant de l'écran");
  assert.equal(node.querySelectorAll(".tray-titre")[0].textContent, "Roll Options", "le titre est à Eric");
  const libelles = node.querySelectorAll(".tray-bouton").map((b) => b.textContent);
  /* ⛔ `10x3D6` EST PARTI LE 2026-09-05 — Eric : *« exit 10x3d6 »*. Trois
     libellés, toujours les siens, à sa casse. Un jet par pression, ou `Flash`. */
  assert.deepEqual(libelles, ["3d6", "Flash", "Reset"],
    "les trois libellés sont ceux d'Eric, mot pour mot (2026-08-15, puis « exit 10x3d6 » le 2026-09-05)");
  assert.equal(node.querySelectorAll(".tray-case").length, 10, "les dix cases existent DÈS LE DÉPART, vides");
  assert.deepEqual(node.querySelectorAll(".tray-case-num").map((n) => n.textContent).slice(0, 2), ["roll 1", "roll 2"],
    "⌨️ et chacune dit `roll N` — Eric, 05/09 : « roll 1 (en T1) … roll 10 »");
  assert.equal(node.querySelectorAll(".tray-des")[0].childNodes.length, 0,
    "sans lot, le plateau est vide — il n'invente pas de dés");
  /* 🎬 SCÈNE 1 — sans lot complet : le tapis vert porte les dés, la sortie vit
     sous les résultats, et elle DÉCLARE `Cancel` sans `Done` (rien à valider). */
  assert.equal(node.querySelectorAll(".ability-tapis").length, 1, "scène 1 : le tapis vert est là");
  const hote = node.querySelectorAll(".ability-resultats [data-sortie-ici]")[0];
  assert.ok(hote, "scène 1 : la rangée de contrôles est la dernière cellule des résultats");
  assert.equal(hote.getAttribute("data-sortie-mot"), "Cancel");
  assert.equal(hote.getAttribute("data-sortie-sans-done"), "true");
  assert.equal(hote.querySelectorAll(".livre-de-sortie").length, 1, "et l'écran y DÉPOSE son livre");
  assert.equal(node.querySelectorAll(".ability-collecteur").length, 0, "scène 1 s'arrête aux résultats : pas de sélection");
  assert.equal(node.querySelectorAll(".ability-des-gardes").length, 0, "ni podium");
  /* ⚠️ LE BUDGET DE LARGEUR — `Reset` est parti COUPÉ au bord droit de
     l'iPhone SE d'Eric, et la suite était verte : la largeur ne vivait que
     dans un commentaire. Ce garde est un PROXY (Node n'a pas de
     `measureText`) : il compte des caractères là où le navigateur compte des
     pixels, et il attrape le cas qui a réellement mordu. */
  const totalCar = libelles.join("").length;
  assert.ok(totalCar <= 24, `les trois libellés font ${totalCar} caractères : au-delà de 24, la rangée déborde à 360`);
});

test("⭐ `4D6` EST LE MÊME PLATEAU, une autre mécanique — plus jamais un second organe", () => {
  /* 🔴 CE QUE CE TEST REMPLACE : `4d6` avait son propre rendu
     (`renderRollBatch`, des pastilles sans dés 3D) parce que le plateau ne
     savait faire que du 3d6 × 10. Deux formes du même geste, qui divergeaient
     déjà. Le §1 du mandat l'interdit : *« ne pas écrire quatre écrans »*. */
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "4d6" }), () => {});
  assert.equal(node.querySelectorAll(".tray").length, 1, "le MÊME plateau sert 4D6");
  assert.equal(node.querySelectorAll(".ability-roll-batch").length, 0, "et les pastilles plates ont disparu");
  assert.deepEqual(node.querySelectorAll(".tray-bouton").map((b) => b.textContent), ["4d6", "Flash", "Reset"],
    "⌨️ son premier libellé vient de SA mécanique, à la casse d'Eric — et `6x4D6` est parti avec `10x3D6` (un seul plateau)");
  assert.equal(node.querySelectorAll(".tray-case").length, 6, "SIX cases : six jets, pas dix");
  assert.equal(node.querySelectorAll(".tray")[0].dataset.des, "4",
    "et la feuille sait combien de dés elle héberge — quatre ne tiennent pas à la cote de trois");
});

test("⚔️ ATTAQUE — plus aucun jet en dur dans la coquille : c'est le plateau qui jette, et lui seul", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.equal(/rollAbilitySet\(/.test(shellText), false, "aucun 3d6 servi en douce par la coquille");
  assert.equal(/rollAbilityBatch\(/.test(shellText), false,
    "ni aucun lot produit par elle — l'action `roll` est morte avec les pastilles plates");
  assert.equal(/kind === "rollBatch"/.test(shellText), false,
    "et le palier qui jetait a bien disparu : un seul propriétaire du lot");
  assert.equal(/rollingMethod/.test(shellText), false,
    "⛔ la molette de méthode de jet n'existe plus : FH 3D6 et 4D6 sont deux TUILES, pas un réglage");
});

test("les quatre explications sont DIFFÉRENTES, et celles des dés viennent de leur mécanique", () => {
  const mot = (m) => renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { method: m, rollBatch: lotSansDes(m) }), () => {})
    .querySelectorAll(".ability-organe-mot")[0].textContent;
  const phrases = ["fh3d6", "4d6", "standard", "free"].map(mot);
  assert.equal(new Set(phrases).size, 4, "quatre méthodes, quatre explications — jamais la même phrase");
  /* ⌨️ Celle de FH 3D6 est validée MOT POUR MOT par Eric le 2026-08-16. */
  assert.equal(phrases[0],
    "Ten rolls of 3d6 — keep the six best. If your highest falls short of 14, it becomes 14; your lowest always becomes 8.");
  /* ⌨️ CELLES DE `4D6` ET `ARRAY` SONT LES FORMULATIONS DU PANNEAU INFO, et
     c'est délibéré : entre deux textes d'agent, on garde celui qui est passé
     sous l'œil d'Eric (il a relu le panneau et en a fait corriger une phrase).
     Les miennes, proposées au mandat §5 bis, n'ont jamais été ratifiées. */
  assert.equal(phrases[1], "Roll four dice six times, drop the lowest die each time.");
  assert.equal(phrases[2], "Six numbers, handed to everyone.");
  assert.match(phrases[3], /never runs out/);
});

test("un redessin REPOSE les dés du plateau, il ne les efface pas — et il n'anime rien", () => {
  /* LE DÉFAUT MESURÉ AU NAVIGATEUR, que 1 104 tests verts n'ont pas vu : le
     joueur pressait `Flash`, l'écran se redessinait pour lui montrer où poser
     ses dés — et les trois dés disparaissaient du plateau. */
  const rollBatch = lotScripte();
  assert.equal(rollBatch.rolls[9].dice.length, 3, "mesure : un jet FH porte bien trois dés");
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "fh3d6", rollBatch }), () => {});
  /* 🎬 SCÈNE 2 — 2026-09-05, Eric : *« disparition de la dalle 3d6 de tirage une
     fois tous les jets effectués »*. Un lot dans `state` est toujours complet :
     le tapis et ses trois dés vivants ne sont PLUS là. Ce que le redessin
     repose, ce sont les DIX instantanés des résultats — et aucun ne tombe :
     un redessin prend la pose, il ne rejoue pas la scène (la propriété d'avant,
     déplacée avec l'organe qu'elle gardait). */
  assert.equal(node.querySelectorAll(".ability-tapis").length, 0, "scène 2 : le tapis de tirage a disparu");
  assert.equal(node.querySelectorAll(".tray-des").length, 0, "et ses dés vivants avec lui");
  const socles = node.querySelectorAll(".tray-case .porte-de");
  assert.equal(socles.length, 10, "les dix résultats portent chacun leur dé-socle");
  assert.ok(node.querySelectorAll(".tray-case .fh-cd-static-die, .tray-case [data-animate]")
    .every((d) => d.getAttribute("data-animate") !== "1"), "et AUCUN ne tombe");
  assert.deepEqual(node.querySelectorAll(".tray-case .valeur").map((v) => v.textContent),
    rollBatch.rolls.map((r) => String(r.total)), "chaque socle porte le total de son jet");
  /* ⭐ ET LA SORTIE A TRANSITÉ : plus d'hôte sous les résultats, la sélection
     déclare `Cancel` qui EFFACE (verbe déclaré) et garde `Done`. */
  assert.equal(node.querySelectorAll(".ability-resultats [data-sortie-ici]").length, 0, "la rangée a quitté les résultats");
  const collecteur = node.querySelectorAll(".ability-collecteur")[0];
  assert.equal(collecteur.getAttribute("data-sortie-mot"), "Cancel");
  assert.equal(collecteur.getAttribute("data-sortie-verbe"), "abilityClear", "en scène 2, `Cancel` efface le lot — il ne recule pas d'un palier");
  assert.equal(collecteur.getAttribute("data-sortie-sans-done"), null, "et `Done` est là : il y a six dés à valider");
  assert.equal(collecteur.querySelectorAll(".livre-de-sortie").length, 1, "le livre a transité avec elle");
  assert.equal(node.querySelectorAll(".ability-des-gardes[data-podium]").length, 1, "le podium est apparu");
  /* 🔒 `Reset` ramène en scène 1 (Eric) ; `3d6` et `Flash` n'ont plus rien à tirer. */
  assert.equal(node.querySelectorAll(".tray-roll")[0].disabled, true, "scène 2 : `3d6` éteint");
  assert.equal(node.querySelectorAll(".tray-flash")[0].disabled, true, "scène 2 : `Flash` éteint");
  assert.equal(node.querySelectorAll(".tray-reset")[0].disabled, false, "scène 2 : `Reset` reste armé — il ramène en scène 1");
});

test("le lot tiré : dix cases PLEINES sans qu'aucune salve n'ait tourné, six marquées gardées", () => {
  const node = renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { method: "fh3d6", rollBatch: lotScripte() }), () => {});
  const cases = node.querySelectorAll(".tray-case");
  assert.equal(cases.length, 10);
  assert.equal(cases.filter((c) => c.getAttribute("data-garde") === "true").length, 6, "six, et seulement six");
  /* ⭐ LE GARDE QUI COMPTE : un lot rangé dans `state` est TOUJOURS FINI, donc
     il se peint ENTIER. La version d'avant ne peignait que `revele` cases — et
     `revele` vaut 0 ici. La moitié des dix disparaissait au premier redessin. */
  /* `plein` est devenu quatre états le 05/09 (garde · ecarte · haut · bas) :
     « pleine » se lit comme « pas vide ». */
  assert.equal(cases.filter((c) => c.getAttribute("data-etat") !== "vide").length, 10,
    "`revele` ne décrit qu'une salve EN COURS, jamais ce qu'on affiche");
});

test("⭐ LES DEUX PLANCHERS SE VOIENT — un jet ajusté ne se fait pas passer pour un jet ordinaire", () => {
  /* ⚠️ IL FAUT UN LOT SANS AUCUN 14 NATUREL pour que les DEUX planchers
     mordent : `lotScripte()` porte un 18 d'entrée, donc seul celui du bas y
     part (mesuré). Ici, dix jets de 3+3+3 = 9 — le meilleur monte à 14, le
     pire descend à 8, et les deux doivent se DIRE — mais PLUS AU VIVIER.

     ⚠️ CE GARDE A CHANGÉ D'ENDROIT LE 2026-08-17, sur arbitrage d'Eric : *« tes
     totaux changent de nomenclature avec le 8 et le 14 ; moi je préfère
     minimaliste »*. La ligne sous le dé disait `3+6+2 → 14` là où sa voisine
     disait `3+2+4` — deux formes pour la même chose. Elle est uniformisée.
     🔴 CE QUE LE GARDE CONTINUE D'EXIGER, ET C'EST L'ESSENTIEL : que l'ajustement
     reste VISIBLE quelque part. Il l'est sur la CASE du plateau (`data-ajuste`,
     qui dit lequel des deux planchers a mordu) et dans l'infobulle du plateau.
     Supprimer la vérification du détail sans reporter l'exigence aurait laissé
     partir la seule preuve que le plancher se voit encore. */
  const rollBatch = { ...rollAbilitySet(() => 0.4), method: "fh3d6", assign: emptyAbilityAssign() };
  assert.deepEqual(rollBatch.rolls[0].dice, [3, 3, 3], "témoin : le hasard scripté donne bien des 3");
  const ajustes = rollBatch.rolls.filter((r) => r.ajuste);
  assert.equal(ajustes.length, 2, "mesure : ce lot déclenche bien les deux planchers");
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "fh3d6", rollBatch }), () => {});
  const marquees = node.querySelectorAll(".tray-case").filter((c) => c.getAttribute("data-ajuste"));
  assert.deepEqual(marquees.map((c) => c.getAttribute("data-ajuste")).sort(), ["bas", "haut"],
    "la case dit LEQUEL des deux planchers l'a touchée");
  /* 🎨 ET L'ÉTAT DIT LA COULEUR — Eric, 05/09 : gris pour les écartés, blanc pour
     les gardés, orange pour le plancher bas (8), bleu pour le 14 garanti. */
  const etats = node.querySelectorAll(".tray-case").map((c) => c.getAttribute("data-etat"));
  assert.deepEqual([...new Set(etats)].sort(), ["bas", "ecarte", "garde", "haut"], "les quatre états sont à l'écran");
  assert.equal(etats.filter((e) => e === "ecarte").length, 4, "quatre écartés en gris");
  assert.equal(node.querySelectorAll(".tray-case .tray-case-detail").length, 10, "et chaque case porte son détail `a+b+c`");
  /* ⛔ ET AU VIVIER, UNE SEULE NOMENCLATURE : ce qui est TOMBÉ, rien d'autre.
     Le test le vérifie sur un jet AJUSTÉ et sur un jet ordinaire, sinon
     « minimaliste » ne serait prouvé que d'un côté. */
  const detailAjuste = deDuVivier(node, ajustes[0].index).querySelectorAll(".ability-de-detail")[0].textContent;
  assert.equal(detailAjuste, "3+3+3", "le jet ajusté s'écrit comme les autres — le dé porte le total");
  const ordinaire = rollBatch.rolls.find((r) => r.kept && !r.ajuste);
  const detailOrdinaire = deDuVivier(node, ordinaire.index).querySelectorAll(".ability-de-detail")[0].textContent;
  assert.doesNotMatch(detailOrdinaire, /→/, "et l'ordinaire n'a jamais eu de flèche : les deux formes sont UNE");
});

/* ══ 6 — `ARRAY` : SIX VALEURS, SANS DÉS ════════════════════════════════ */

test("B5.7 — `ARRAY` : six valeurs, SANS dés, par la MÊME machinerie", () => {
  const lot = standardArrayBatch();
  assert.deepEqual(lot.rolls.map((r) => r.total), [15, 14, 13, 12, 10, 8]);
  assert.ok(lot.rolls.every((r) => r.kept), "aucun écarté : il n'y a rien à trier");
  assert.deepEqual(lot.assign, emptyAbilityAssign(), "et la carte part vide — le remède au piège des deux 14");
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "standard", rollBatch: lot }), () => {});
  assert.equal(node.querySelectorAll(".tray").length, 0, "PAS de plateau : il n'y a rien à jeter");
  assert.equal(node.querySelectorAll(".ability-creneau").length, 6, "mais les six cibles, oui");
  assert.deepEqual(totauxOfferts(node), ["15", "14", "13", "12", "10", "8"], "et les six valeurs à poser");
  assert.equal(node.querySelectorAll(".ability-de-detail").length, 0,
    "⭐ aucun détail de dés : il n'y a pas eu de jet, et rien n'invente une ligne vide");
});

/* ══ 7 — `FREE` : UNE PALETTE, PAS UN STOCK (§5.3) ══════════════════════ */

/* ══ 7 — `FREE` : UNE PALETTE QUI COMPOSE LE VIVIER ═════════════════════
   ✅ TRANCHÉ PAR ERIC LE 2026-08-16, sur son croquis : la rangée de six carrés
   entre la dalle et le collecteur porte **ses six valeurs choisies**, et la
   palette les y dépose.

   ⭐ CE QUE ÇA SIMPLIFIE, ET POURQUOI CES TESTS ONT CHANGÉ DE LOI. FREE avait
   deux verbes à lui, une porte à lui, et une carte `assign` qui pointait vers
   une palette SANS ÉTAT — le piège que le §4.4 du mandat annonçait comme « ce
   que ça casse, et il faut le dire avant de commencer ». Tout ça disparaît :
   la palette remplit un vivier, le vivier nourrit le collecteur, exactement
   comme le plateau le fait pour `FH 3D6`. **FREE devient la quatrième
   méthode, plus l'exception.**
   🔴 Et le piège du §4.4 tombe de lui-même : `assign` associe une clef à un
   INDEX, et l'index d'un CRÉNEAU est parfaitement défini — même quand deux
   créneaux portent la même valeur. Le problème n'était pas l'index, c'était de
   le faire pointer vers une palette qui n'en avait pas. */

test("🔴 `FREE` — DEUX dalles, et aucune rangée d'îlots entre les deux", () => {
  /* ✅ REPRIS PAR ERIC LE 2026-08-16 : *« les îlots vont être utiles dans 4D6
     et 3D6 mais pas ici ; garde ce code et mets-le de côté »*, et *« en
     dessous du premier îlot il y a un deuxième îlot, et il contient la zone de
     réception des dés »*. Sa page FREE a DEUX dalles, pas trois.
     ⭐ Le code des îlots ne bouge pas d'une ligne pour autant : il sert
     toujours `FH 3D6`, `4D6` et `ARRAY`. Ce n'est pas du code « mis de côté »
     au sens où il dormirait — il est sur le chemin vivant de trois méthodes
     sur quatre, et le test du bas le prouve. */
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "free", rollBatch: freeBatch() }), () => {});
  assert.equal(node.querySelectorAll(".ability-organe").length, 1, "la dalle FF1");
  assert.equal(node.querySelectorAll(".ability-collecteur").length, 1, "…et la zone de réception dessous");
  assert.equal(node.querySelectorAll(".fs-rangee").length, 1,
    "⛔ UNE seule rangée FS, et c'est la palette — aucune rangée d'îlots entre les deux dalles");
  assert.equal(node.querySelectorAll(".ability-palette").length, 1);

  /* LA PALETTE — seize valeurs, celles PUBLIÉES par le moteur (lot 74), jamais
     un `for (let i = 3; i <= 18; …)` réécrit dans l'écran. Et elle vit DANS la
     dalle FF1, avec le mot qui l'explique (« CHOOSE EXPLICATION »). */
  const palette = node.querySelectorAll(".ability-palette .ability-de-garde");
  assert.equal(palette.length, 16);
  assert.deepEqual(palette.map((j) => j.querySelectorAll(".valeur")[0].textContent), CREATION_SCORES.map(String));
  assert.equal(node.querySelectorAll(".ability-organe")[0].querySelectorAll(".ability-palette").length, 1);

  /* ⚔️ LE TÉMOIN — les trois autres méthodes GARDENT leur rangée d'îlots. */
  const array = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "standard", rollBatch: standardArrayBatch() }), () => {});
  assert.equal(array.querySelectorAll(".fs-rangee").length, 1);
  assert.equal(desDuVivier(array).length, 6, "ARRAY pose bien ses six valeurs dans une rangée d'îlots");
});

test("⭐ §4.4 RÈGLE 1 — LA PALETTE NE S'ÉPUISE PAS : on peut poser 12 trois fois", () => {
  const lot = freeBatch();
  lot.rolls[0].total = 12; lot.rolls[1].total = 12; lot.rolls[2].total = 12;
  lot.assign = { ...emptyAbilityAssign(), str: 0, dex: 1, con: 2 };
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "free", rollBatch: lot }), () => {});
  assert.equal(node.querySelectorAll(".ability-palette .ability-de-garde").length, 16,
    "⛔ la palette n'a AUCUN état : prendre un 12 n'enlève pas le 12 (§4.4, règle 3)");
  assert.deepEqual(["str", "dex", "con"].map((k) => deDeLaCible(node, k).querySelectorAll(".valeur")[0].textContent),
    ["12", "12", "12"], "et trois caractéristiques portent bien le même nombre");
});

test("⭐ LA PALETTE POSE DIRECTEMENT SUR UNE CARACTÉRISTIQUE — sans étape intermédiaire", async () => {
  const lot = freeBatch();
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "free", rollBatch: lot }), (a) => calls.push(a));
  const seize = node.querySelectorAll(".ability-palette .ability-de-garde")
    .find((j) => j.querySelectorAll(".valeur")[0].textContent === "16");
  await glisser(seize, creneauPour(node, "cha"));
  assert.deepEqual(calls, [{ kind: "abilityFreeDirect", key: "cha", value: 16 }]);

  /* ⭐ ET LA COQUILLE FAIT LES DEUX D'UN COUP — le créneau (hors document) ET
     le `set` ORDINAIRE. `assignAbilityRoll` ne pouvait pas servir : il suppose
     qu'un dé EXISTE déjà dans le lot, alors qu'ici la valeur NAÎT du geste.
     ⛔ Aucun champ nouveau pour autant : c'est la saisie manuelle avec la peau
     du glisser-déposer, comme le §4.4 l'annonçait. */
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  /* ⚠️ On coupe à l'action SUIVANTE, pas au premier `return;` : le bloc en a
     deux gardes en tête (`if (!lot) return;`), et s'arrêter au premier ne
     lisait que trois lignes — un garde qui mesure du vide passe toujours. */
  const bloc = shellText.slice(shellText.indexOf('action.kind === "abilityFreeDirect"'));
  const corps = bloc.slice(0, bloc.indexOf('action.kind === "abilityLot"'));
  assert.match(corps, /path: `abilities\.\$\{action\.key\}`, value: action\.value/,
    "la valeur atteint le document par le `set` ordinaire");
  assert.match(corps, /ABILITY_KEYS\.indexOf\(action\.key\)/,
    "📌 le créneau d'une clef est son RANG — chacune a le sien, donc jamais deux sur le même index");
});

test("⭐ RECOUVRIR REMPLACE, là où les trois autres ÉCHANGENT (§5.3)", async () => {
  /* Un ÉCHANGE n'a de sens qu'entre dés en NOMBRE FINI : chacun doit retrouver
     une place. La palette étant inépuisable, il n'y a rien à rendre — déplacer
     un dé posé le RECOPIE, et la source garde le sien. */
  const lot = freeBatch();
  lot.rolls[0].total = 15;
  lot.assign = { ...emptyAbilityAssign(), str: 0 };
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "free", rollBatch: lot }), (a) => calls.push(a));
  await glisser(deDeLaCible(node, "str"), creneauPour(node, "wis"));
  assert.deepEqual(calls, [{ kind: "abilityFreeDirect", key: "wis", value: 15 }],
    "⛔ pas d'`assignAbilityRoll` : en FREE on recopie, on n'échange pas");
});

test("⛔ AUCUN RETRAIT, DANS AUCUNE MÉTHODE — et le geste d'Eric a changé d'étage", async () => {
  /* `rebuild()` jette si l'une des six valeurs manque au document
     (`derive.mjs`), et il n'existe aucune action qui VIDE une cible sans en
     remplir une autre. On réarrange en posant, jamais en vidant.
     ⭐ En FREE, ce qu'Eric décrivait (*« tu peux dégager les dés posés »*) se
     fait maintenant là où ça ne casse rien : on RECOUVRE un créneau du vivier
     depuis la palette. */
  const lot = freeBatch();
  lot.rolls.forEach((r, i) => { r.total = [15, 14, 13, 12, 10, 8][i]; });
  lot.assign = Object.fromEntries(ABILITY_KEYS.map((k, i) => [k, i]));
  const calls = [];
  const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: "free", rollBatch: lot }), (a) => calls.push(a));
  await glisser(deDeLaCible(node, "str"), node.querySelectorAll(".fs-rangee")[1]);
  assert.deepEqual(calls, [], "ramener un dé sur le vivier ne commet rien, dans aucune méthode");
});

test("⭐ UNE SEULE PORTE POUR LES QUATRE MÉTHODES — l'exception de FREE est tombée", () => {
  /* Elle comptait les POSES au lieu de lire le document, et il le fallait tant
     que sa palette écrivait directement sur les caractéristiques. Depuis
     qu'il COMPOSE un vivier, il n'écrit qu'à l'affectation — la porte commune
     redit la vérité pour lui aussi. Une exception qui tombe parce que sa cause
     a disparu, pas parce qu'on l'a désarmée. */
  for (const m of ["fh3d6", "4d6", "standard", "free"]) {
    assert.equal(abilitiesValidate({ document: fixture.document, method: m, rollBatch: lotSansDes(m) }).ready, true,
      `${m} : les six scores du personnage d'exemple sont posés, la porte s'ouvre`);
  }
  assert.equal(abilitiesValidate({ document: fixture.document, method: null, rollBatch: null }).ready, false,
    "…et aucune méthode choisie la referme");
});

test("la porte ne JETTE plus rien — le plateau est le seul jeteur", () => {
  /* DEUX PROPRIÉTAIRES DU MÊME LOT est la cause racine des quatre
     branchements ratés du lot 79. Si un futur lot rebranche un
     `{ kind: "rollBatch" }` sur la porte, ce test rougit avant qu'ils ne
     recommencent à se contredire. */
  const gate = abilitiesValidate({ document: fixture.document, method: "fh3d6", rollBatch: null });
  assert.equal(gate.action, null);
  assert.equal(gate.next, "step", "un seul palier : avancer quand les six sont posées");
});

/* ══ 8 — LE PANNEAU INFO (§5.4) ═════════════════════════════════════════ */

test("📖 LE LIVRE SORT DU BUILDER — il ouvre le chapitre `ability-scores` de FH WEB", () => {
  /* 🔴 CE QUE CE GARDE REMPLACE, ET POURQUOI IL NE LE PROLONGE PAS.
     Deux gardes tenaient ici le PANNEAU INFO : *« `INFO` ouvre le panneau »* et
     *« le panneau porte les chiffres mesurés »*. Leur objet n'existe plus —
     Eric, 2026-09-05 : *« le livre doit emmener vers le site FH WEB »* · *« en
     tout cas ton livre doit pointer là »*.
     ⛔ Ils ne sont pas relâchés, ils sont RÉÉCRITS À LA NOUVELLE VÉRITÉ (TRAPS,
     la note `// REWRITTEN`). La propriété qu'ils servaient — *le livre donne
     accès à l'argumentaire des méthodes* — n'est pas abandonnée : elle a changé
     d'adresse. Ce qu'ils gardaient EN PLUS (les chiffres de la simulation de
     3 000 000 de tirages) part avec le texte au chapitre, et c'est là qu'il
     faudra le garder — ⛔ un garde d'ici ne peut rien dire d'une page publiée
     par un autre dépôt, et prétendre le contraire serait un garde qui ment.

     ⭐ CE QU'IL TIENT MAINTENANT : la SORTIE. C'est la moitié du sacré n° 2 que
     rien ne gardait — le livre parle du JEU et sort, le `?` parle de l'ÉCRAN et
     reste. Deux organes ronds de même cote aux deux bouts d'une rangée : rien
     dans leur géométrie ne les distingue, seul un garde le peut. */
  const ouvertures = [];
  const avant = globalThis.window;
  globalThis.window = { open: (...args) => ouvertures.push(args) };
  try {
    const calls = [];
    const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), (a) => calls.push(a));
    assert.equal(node.querySelectorAll(".ability-info").length, 0,
      "⛔ plus aucun panneau interne : le texte de règle a quitté l'interface");
    livre(node).click();
    assert.equal(ouvertures.length, 1, "le livre ouvre, une fois");
    assert.equal(ouvertures[0][0], "https://noirchicot.github.io/fh-phb/chapters/ability-scores/",
      "⛔ et il ouvre LE chapitre des caractéristiques — l'adresse vient de "
      + "`lienAbilityScoresFhWeb`, jamais d'une URL recopiée ici");
    assert.equal(ouvertures[0][2], "noopener",
      "⛔ `noopener` : sans lui la page ouverte reçoit `window.opener` sur le "
      + "builder et peut le renaviguer (même note qu'à `destiny-step.mjs`)");
    assert.deepEqual(calls, [],
      "⛔ et il ne commet AUCUNE action : sortir n'est pas changer l'état de l'écran");
  } finally {
    if (avant === undefined) delete globalThis.window; else globalThis.window = avant;
  }
});

test("🔴 LES TROIS ÉTAGES SONT LES MÊMES POUR LES QUATRE MÉTHODES — c'est ce qui rend le lot faisable", () => {
  /* ⛔ Si un jour une méthode gagne son propre collecteur, ce test rougit — et
     c'est exactement ce qu'il existe pour empêcher (§1 du mandat : *« ne pas
     écrire quatre écrans »*). */
  for (const id of ["fh3d6", "4d6", "standard", "free"]) {
    const lot = lotSansDes(id) || makeRollBatch([15, 14, 13, 12, 10, 8]);
    const node = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: id, rollBatch: lot }), () => {});
    /* ⛔ PLUS DE SÉLECTEUR SUR UNE PAGE DE MÉTHODE — il est DÉTACHÉ, à la
       racine (Eric, 2026-08-16). Ce que les quatre pages partagent est ce qui
       est en dessous, et c'est ça que ce test garde. */
    assert.equal(node.querySelectorAll(".ability-methodes").length, 0, `${id} : le sélecteur est resté à la racine`);
    /* ⭐ LE TITRE EST DANS LA DALLE, PAS AU-DESSUS (Eric, 2026-08-17) — et
       c'est cette APPARTENANCE que le test garde, pas seulement le mot : on
       le cherche SOUS l'organe, sinon un titre qui ressortirait dans le vide
       repasserait vert. */
    const organe = node.querySelectorAll(".ability-organe")[0];
    assert.equal(organe.querySelectorAll(".ability-dalle-titre")[0].textContent,
      ABILITY_ENTRIES.find((e) => e.id === id).label, `${id} : la dalle dit de quelle méthode elle est`);
    assert.equal(node.querySelectorAll(".ability-organe").length, 1, `${id} : un organe`);
    assert.ok(vivier(node), `${id} : un vivier`);
    assert.equal(node.querySelectorAll(".ability-collecteur").length, 1, `${id} : un collecteur`);
    assert.equal(node.querySelectorAll(".ability-creneau").length, 6, `${id} : six cibles, dans l'ordre SRD`);
    assert.deepEqual(node.querySelectorAll(".glisse-creneau-nom").map((n) => n.textContent),
      ABILITY_KEYS.map((k) => k.toUpperCase()), `${id} : et l'ordre est celui du SRD`);
  }
});

test("🔴 LA RACINE NE PORTE QUE LE SÉLECTEUR — et la page d'une méthode ne le porte plus", () => {
  /* Eric, 2026-08-16, en regardant l'écran : *« ceci doit être détaché et être
     à la racine de Abilities. On arrive sur FREE quand on clique sur le bouton
     FREE, qui est une AUTRE page »*. Deux pages, pas une page qui s'allonge. */
  const racine = renderAbilitiesStep(ctxFrom(fixture.document, fixture.report, { method: null }), () => {});
  assert.equal(racine.querySelectorAll(".ability-methodes").length, 1, "la racine porte le sélecteur");
  assert.equal(racine.querySelectorAll(".ability-organe").length, 0, "…et RIEN d'autre : aucun organe");
  assert.equal(vivier(racine), null, "aucun vivier");
  assert.equal(racine.querySelectorAll(".ability-collecteur").length, 0, "aucun collecteur");

  /* ⭐ ET LA RACINE RESTE LA RACINE MÊME QUAND UNE MÉTHODE EST DÉJÀ CHOISIE :
     c'est le PALIER qui décide de la page, jamais la méthode. Sans ça,
     revenir en arrière rouvrirait la page qu'on vient de quitter. */
  const revenu = renderAbilitiesStep(
    ctxFrom(fixture.document, fixture.report, { method: "free", rollBatch: freeBatch(), palier: 1 }), () => {});
  assert.equal(revenu.querySelectorAll(".ability-methodes").length, 1);
  assert.equal(vivier(revenu), null, "la palette appartient à la PAGE de FREE, pas à la racine");
  assert.equal(revenu.querySelectorAll(".ability-entry[data-active=\"true\"]")[0].textContent, "FREE",
    "…et le sélecteur montre ce qu'on avait choisi");
});

test("🔴 REVENIR À LA RACINE N'INTERROMPT RIEN — rouvrir la MÊME méthode ne jette pas son lot", () => {
  /* Eric, 2026-08-16 : *« à cette racine je n'interromps rien en revenant en
     arrière »*. ⛔ Ce n'était PAS vrai quand il l'a dit : l'action remettait le
     lot à zéro à chaque clic de tuile, y compris sur celle qu'on venait de
     quitter — `BACK` puis `FREE` effaçait les dés posés, en silence.
     ⭐ Le remède : seul un CHANGEMENT de méthode jette le lot. Garde d'octets,
     faute de harnais de rendu sur `shell.mjs`. */
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /const memeMethode = state\.abilityMethod === action\.value;\s*if \(!memeMethode\) \{/,
    "rouvrir la même méthode ne retouche à rien");
  /* Et ce qui est DANS la garde est bien tout ce qui jette : le lot, le compte
     de révélation, et l'écriture au document. */
  const bloc = shellText.slice(shellText.indexOf("const memeMethode"));
  const corps = bloc.slice(0, bloc.indexOf("state.palier = 2;"));
  for (const jette of ["state.abilityRoll = lotSansDes(action.value);", "state.abilityRevele = 0;", "abilities.mode"]) {
    assert.ok(corps.includes(jette), `« ${jette} » doit être SOUS la garde — sinon il repart à chaque clic`);
  }
  /* ⭐ Et le palier, LUI, est HORS de la garde : rouvrir la même méthode doit
     quand même ouvrir sa page. C'est la moitié qu'on casserait en déplaçant
     l'accolade d'une ligne. */
  assert.equal(corps.includes("state.palier = 2;"), false,
    "⛔ le palier s'avance TOUJOURS — sinon reclíquer sa méthode ne mènerait nulle part");
});

test("garde d'octets — c'est la COQUILLE qui ouvre la page d'une méthode, pas l'écran", () => {
  /* L'enchaînement appartient à `shell.mjs` (I.4, et l'arbitrage du lot 79
     §4.1). L'écran ne fait que LIRE le palier — deux propriétaires d'une même
     porte est la faute que `rollBatch` a payée. */
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /action\.kind === "abilityMethod"[\s\S]{0,900}state\.palier = 2;/,
    "choisir une méthode avance le palier, dans la coquille");
  const ecran = stripComments(fs.readFileSync(path.join(UI_DIR, "abilities-step.mjs"), "utf8"));
  assert.equal(/state\.palier/.test(ecran), false, "⛔ et l'écran ne l'écrit jamais : il le lit dans son ctx");
});

test("`lotSansDes` ne connaît que les deux méthodes qui n'en jettent pas", () => {
  assert.equal(lotSansDes("standard").method, "standard");
  assert.equal(lotSansDes("free").method, "free");
  assert.equal(lotSansDes("fh3d6"), null, "FH 3D6 attend son plateau — pas de lot posé d'avance");
  assert.equal(lotSansDes("4d6"), null);
});
