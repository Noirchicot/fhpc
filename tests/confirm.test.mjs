/* ══ LES TESTS DU LOT 46 — LE COMPOSANT DE CONFIRMATION (`confirm.mjs`) ══

   ⭐ « La confirmation est un COMPOSANT » (commande §3, test 7) : testé
   SEUL, hors de tout écran — aucun `decisions[]`, aucun `document`, aucun
   `query`. `renderConfirmDialog` ne connaît qu'un titre, une liste de
   choses perdues et deux callbacks ; ce fichier le prouve en ne lui passant
   jamais rien d'autre. Même patron DOM que les autres suites d'écran :
   `tests/dom-stub.mjs`, aucun paquet de plus. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();

const { renderConfirmDialog } = await import("../ui/builder/confirm.mjs");

function items(node) { return node.querySelectorAll(".confirm-dialog-items li").map((li) => li.textContent); }

test("le titre s'affiche tel quel", () => {
  const node = renderConfirmDialog({ title: "These skills are no longer valid:", items: [], onConfirm: () => {}, onCancel: () => {} });
  assert.equal(node.querySelectorAll(".confirm-dialog-title")[0].textContent, "These skills are no longer valid:");
});

test("les choses perdues sont NOMMÉES, une par ligne — jamais un compte", () => {
  const node = renderConfirmDialog({ title: "x", items: ["Arcana", "Investigation"], onConfirm: () => {}, onCancel: () => {} });
  assert.deepEqual(items(node), ["Arcana", "Investigation"]);
});

test("aucune liste n'est rendue quand `items` est vide ou absent — pas de cadre vide", () => {
  const withEmpty = renderConfirmDialog({ title: "x", items: [], onConfirm: () => {}, onCancel: () => {} });
  assert.equal(withEmpty.querySelectorAll(".confirm-dialog-items").length, 0);
  const withoutItems = renderConfirmDialog({ title: "x", onConfirm: () => {}, onCancel: () => {} });
  assert.equal(withoutItems.querySelectorAll(".confirm-dialog-items").length, 0);
});

test("cliquer Confirm appelle `onConfirm`, JAMAIS `onCancel`", () => {
  const calls = [];
  const node = renderConfirmDialog({
    title: "x", items: ["a"], onConfirm: () => calls.push("confirm"), onCancel: () => calls.push("cancel")
  });
  node.querySelectorAll(".confirm-dialog-confirm")[0].click();
  assert.deepEqual(calls, ["confirm"]);
});

test("cliquer Cancel appelle `onCancel`, JAMAIS `onConfirm` — le composant ne sait RIEN d'autre à faire", () => {
  const calls = [];
  const node = renderConfirmDialog({
    title: "x", items: ["a"], onConfirm: () => calls.push("confirm"), onCancel: () => calls.push("cancel")
  });
  node.querySelectorAll(".confirm-dialog-cancel")[0].click();
  assert.deepEqual(calls, ["cancel"]);
});

test("les deux callbacks sont optionnels : un clic sans `onConfirm`/`onCancel` fourni ne casse pas", () => {
  const node = renderConfirmDialog({ title: "x", items: ["a"] });
  assert.doesNotThrow(() => {
    node.querySelectorAll(".confirm-dialog-confirm")[0].click();
    node.querySelectorAll(".confirm-dialog-cancel")[0].click();
  });
});

test("les libellés par défaut sont « Confirm »/« Cancel », remplaçables", () => {
  const withDefaults = renderConfirmDialog({ title: "x", onConfirm: () => {}, onCancel: () => {} });
  assert.equal(withDefaults.querySelectorAll(".confirm-dialog-confirm")[0].textContent, "Confirm");
  assert.equal(withDefaults.querySelectorAll(".confirm-dialog-cancel")[0].textContent, "Cancel");

  const withLabels = renderConfirmDialog({
    title: "x", confirmLabel: "Clear them", cancelLabel: "Keep them locked", onConfirm: () => {}, onCancel: () => {}
  });
  assert.equal(withLabels.querySelectorAll(".confirm-dialog-confirm")[0].textContent, "Clear them");
  assert.equal(withLabels.querySelectorAll(".confirm-dialog-cancel")[0].textContent, "Keep them locked");
});

/* ══ ⛔ CE COMPOSANT NE CONNAÎT AUCUN VERBE ═══════════════════════════════
   Preuve directe : `onConfirm`/`onCancel` sont appelés SANS ARGUMENT — le
   composant ne construit ni `{kind, path}` ni quoi que ce soit qui
   ressemble à une action de document. C'est L'APPELANT (class-step.mjs,
   demain un autre écran) qui décide ce que confirmer/annuler déclenchent. */
test("⛔ `onConfirm`/`onCancel` sont appelés SANS ARGUMENT — le composant ne connaît aucun verbe, aucun chemin", () => {
  const argsSeen = [];
  const node = renderConfirmDialog({
    title: "x", items: ["a"],
    onConfirm: (...args) => argsSeen.push(args),
    onCancel: (...args) => argsSeen.push(args)
  });
  node.querySelectorAll(".confirm-dialog-confirm")[0].click();
  node.querySelectorAll(".confirm-dialog-cancel")[0].click();
  assert.deepEqual(argsSeen, [[], []]);
});
