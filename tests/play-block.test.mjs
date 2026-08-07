/* Le bloc `play` derrière le noyau J0, et les LOIS du lot C.

   Suite neuve : elle n'a pas d'ancêtre v1 parce que la v1 n'avait ni noyau ni
   frontière à tenir. Elle garde ce que le lot promet — les verbes sont le seul
   point d'entrée, ils passent par `dispatch`, et rien dans `src/play/` ne
   touche le DOM, `window` ou le réseau. */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dispatch, assertBlocks } from "../src/kernel/registry.mjs";
import { registerPlay } from "../src/play/index.mjs";
import { makeHarness, FIXTURE_CHAOS } from "./play-harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const playDir = path.join(here, "..", "src", "play");
/* Les commentaires sont retirés avant l'inspection : ils NOMMENT ce qui a été
   remplacé (« plus de `window` », « remplace localStorage »), et un garde qui
   les lit interdirait d'expliquer la frontière qu'il défend. Ce qui est jugé
   ici, c'est du code. */
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
const sources = fs.readdirSync(playDir)
  .filter((name) => name.endsWith(".mjs"))
  .map((name) => {
    const raw = fs.readFileSync(path.join(playDir, name), "utf8");
    return { name, raw, text: stripComments(raw) };
  });

test("le bloc s'enregistre sur le noyau et répond à dispatch", () => {
  registerPlay({ chaosTables: FIXTURE_CHAOS, randomUint32: () => 11, uuid: () => "k-1", now: () => "2026-08-07T00:00:00.000Z" });
  assertBlocks(["play"]);
  // Un verbe atteint bien la fonction, par la route « bloc.verbe ».
  dispatch("play.open", { character: { pb: 3, build: {} }, campaign: "FH1", pseudo: "Harness" });
  const shape = dispatch("play.snapshot");
  assert.ok(shape.destiny, "open a semé la Destinée");
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
      assert.equal(pattern.test(text), false, "src/play/" + name + " ne doit pas contenir « " + label + " »");
    });
  });
  assert.ok(sources.length >= 6, "les modules du bloc sont bien tous inspectés");
});

test("le hasard et l'horloge sont injectés — aucun module ne va les chercher", () => {
  /* `platformRandomUint32` et `platformUuid` (utils.mjs) sont les défauts, et
     ils sont le SEUL endroit qui lit `globalThis.crypto`. Un module qui le
     lirait ailleurs rendrait une suite non déterministe sans le dire. */
  sources.filter(({ name }) => name !== "utils.mjs").forEach(({ name, text }) => {
    assert.equal(/globalThis\s*\.\s*crypto/.test(text), false, "src/play/" + name + " ne lit pas crypto directement");
    assert.equal(/Math\.random/.test(text), false, "src/play/" + name + " ne tire pas de Math.random");
  });
  // Et sans CSPRNG du tout, on JETTE plutôt que de rouler des dés prévisibles.
  const utils = sources.find((s) => s.name === "utils.mjs").raw;
  assert.match(utils, /no CSPRNG available/, "l'absence de source de hasard est une erreur nommée, pas un repli sur Math.random");
});

test("createPlay refuse de se construire sans bus — un règlement qui ne s'annonce pas est un règlement perdu", async () => {
  const { createPlay } = await import("../src/play/session.mjs");
  assert.throws(() => createPlay({}), /needs a bus/);
  assert.throws(() => createPlay({ bus: {} }), /needs a bus/);
});
