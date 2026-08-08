/* Le bloc `play` derrière le noyau J0, et les LOIS du lot C.

   Suite neuve : elle n'a pas d'ancêtre v1 parce que la v1 n'avait ni noyau ni
   frontière à tenir. Elle garde ce que le lot promet — les verbes sont le seul
   point d'entrée, ils passent par `dispatch`, et rien dans `src/play/` ne
   touche le DOM, `window` ou le réseau. */

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dispatch, assertBlocks } from "../src/kernel/registry.mjs";
import { registerPlay } from "../src/play/index.mjs";
import { makeHarness, FIXTURE_CHAOS } from "./play-harness.mjs";
import { loadSources } from "./source-scan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, "..", "src");
/* REWRITTEN (lot 5) — le garde inspectait `src/play/*.mjs` à plat. La coupe a
   sorti les mécaniques maison dans `src/modules/fh/`, et elles doivent tenir la
   MÊME loi : zéro DOM, zéro réseau. Le garde marche donc l'arbre.
   REWRITTEN 2026-08-08 (RELECTEUR Adverserial) — l'arpenteur et le dépouilleur
   sont partis dans tests/source-scan.mjs. Ils étaient en trois copies inline,
   et les trois avaient déjà divergé : celle-ci marchait l'arbre, les deux de
   play-srd-only lisaient à plat. Le dépouilleur, lui, effaçait du code réel. */
/* `modules` et non `layers` depuis le 2026-08-08 : l'architecte a déplacé les
   modules moteur de la couche FH vers `src/modules/fh/` pour rendre
   `src/layers/` disponible au BLOC `layers` (celui qui enregistre et interroge
   les documents de couche). Deux choses différentes portaient le même mot.
   📌 Ce garde a détecté le déplacement tout seul, sur son compte de fichiers
   inspectés — c'est exactement ce qu'on lui demande. */
const sources = loadSources([path.join(srcDir, "play"), path.join(srcDir, "modules")], srcDir);

test("le bloc s'enregistre sur le noyau et répond à dispatch", () => {
  registerPlay({ chaosTables: FIXTURE_CHAOS, randomUint32: () => 11, uuid: () => "k-1", now: () => "2026-08-07T00:00:00.000Z" });
  assertBlocks(["play"]);
  // Un verbe atteint bien la fonction, par la route « bloc.verbe ».
  dispatch("play.open", { character: { pb: 3, build: {} }, campaign: "FH1", pseudo: "Harness" });
  const shape = dispatch("play.snapshot");
  /* REWRITTEN (lot 5) — l'assertion disait « open a semé la Destinée ». Elle
     est devenue FAUSSE, et c'est tout le lot : `registerPlay()` sans couche est
     le moteur SRD nu. Rien ne sème la Destinée parce que rien ne la connaît.
     La nouvelle vérité est plus forte que l'ancienne : elle ne dit pas que le
     verbe ne fait rien, elle dit qu'il N'EXISTE PAS (loi §0.6). */
  assert.equal(shape.destiny, undefined, "un moteur SRD nu ne sème aucune tranche de couche");
  assert.equal(typeof dispatch("play.snapshot").vitals, "object", "il sème bien la sienne");
  assert.ok(Array.isArray(shape.history));
  // Et un verbe inconnu jette en le NOMMANT — jamais un échec muet (loi §0.5).
  assert.throws(() => dispatch("play.nonsense"), /unknown verb "nonsense" on block "play"/);
});

test("les verbes sont le seul point d'entrée, et ils portent le vocabulaire data-* v1", () => {
  const h = makeHarness();
  /* La table de correspondance complète vit dans contracts/play.md. Ces
     quatre-là sont ceux que le lot nomme explicitement (KICKOFF §1) : ils
     doivent exister sous ces noms. */
  ["stageDie", "roll", "spendDestiny", "resolvePending"].forEach((verb) => {
    assert.equal(typeof h.verbs[verb], "function", verb + " est un verbe du bloc");
  });
  /* REWRITTEN (lot 5) — deux de ces quatre verbes appartiennent désormais à la
     COUCHE. Ils sont là parce que le harnais la monte ; ils n'existent pas sans
     elle, et c'est la suite `play-srd-only` qui le prouve. */
  ["addDie", "rerollDie", "mountDie", "giveDie", "receiveDie"].forEach((verb) => {
    assert.equal(typeof h.verbs[verb], "function", verb + " est un verbe SRD du bloc (D.1 / D.5)");
  });
  // `roll` est un aiguillage : il route vers le chemin vivant, comme ROLL en v1.
  h.reset(5, [h.die("v-d6", 6, true)]);
  h.verbs.spendDestiny({ dieId: "v-d6" });
  assert.equal(h.state.destinyStaged.dieId, "v-d6");
  h.queueRolls(4);
  h.verbs.roll();
  assert.equal(h.state.history[0].kind, "destiny", "ROLL sur un dé d'or seul le résout seul");
  assert.equal(h.queueEmpty(), 0);
});

test("ZÉRO DOM, ZÉRO window, ZÉRO réseau dans src/play/", () => {
  /* La loi du lot, tenue par le fichier plutôt que par la bonne volonté. Elle
     est structurelle exprès : c'est la seule forme qui survit au prochain qui
     éditera ces fichiers sans avoir lu le kickoff. */
  const forbidden = [
    [/\bdocument\b/, "document"],
    [/\bwindow\b/, "window"],
    [/\blocalStorage\b/, "localStorage"],
    [/\bfetch\s*\(/, "fetch("],
    [/\bXMLHttpRequest\b/, "XMLHttpRequest"],
    [/\bWebSocket\b/, "WebSocket"],
    [/\bsetTimeout\b/, "setTimeout"],
    [/\bsetInterval\b/, "setInterval"],
    [/\binnerHTML\b/, "innerHTML"],
    [/querySelector/, "querySelector"]
  ];
  sources.forEach(({ name, text }) => {
    forbidden.forEach(([pattern, label]) => {
      assert.equal(pattern.test(text), false, "src/" + name + " ne doit pas contenir « " + label + " »");
    });
  });
  /* ⚠️ DURCI LE 2026-08-08 par l'architecte, après l'avoir attaqué. L'assertion
     ne comptait que les fichiers (`>= 10`) : pointée sur `src/kernel` au lieu
     des modules de couche, elle restait VERTE, parce que le compte tenait
     quand même. Le garde croyait donc vérifier les modules FH et ne vérifiait
     qu'un nombre — un déplacement de répertoire les aurait sortis de la loi
     zéro-DOM sans un mot. On nomme maintenant ce qui doit être là. */
  assert.ok(sources.length >= 10, "les modules du bloc ET de ses couches sont bien tous inspectés");
  assert.ok(sources.some((s) => /^play\//.test(s.name)), "le bloc play est dans le périmètre");
  assert.ok(sources.some((s) => /^modules\/fh\//.test(s.name)),
    "les modules de la couche FH sont dans le périmètre — s'ils ont bougé, ce garde doit bouger avec eux, pas les perdre");
});

test("le hasard et l'horloge sont injectés — aucun module ne va les chercher", () => {
  /* `platformRandomUint32` et `platformUuid` (utils.mjs) sont les défauts, et
     ils sont le SEUL endroit qui lit `globalThis.crypto`. Un module qui le
     lirait ailleurs rendrait une suite non déterministe sans le dire. */
  sources.filter(({ name }) => !name.endsWith("utils.mjs")).forEach(({ name, text }) => {
    assert.equal(/globalThis\s*\.\s*crypto/.test(text), false, "src/" + name + " ne lit pas crypto directement");
    assert.equal(/Math\.random/.test(text), false, "src/" + name + " ne tire pas de Math.random");
  });
  // Et sans CSPRNG du tout, on JETTE plutôt que de rouler des dés prévisibles.
  const utils = sources.find((s) => s.name.endsWith("utils.mjs")).raw;
  assert.match(utils, /no CSPRNG available/, "l'absence de source de hasard est une erreur nommée, pas un repli sur Math.random");
});

test("createPlay refuse de se construire sans bus — un règlement qui ne s'annonce pas est un règlement perdu", async () => {
  const { createPlay } = await import("../src/play/session.mjs");
  assert.throws(() => createPlay({}), /needs a bus/);
  assert.throws(() => createPlay({ bus: {} }), /needs a bus/);
});
