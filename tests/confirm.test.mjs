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

/* ══ LOT 192 — LA TROISIÈME VOIE, FACULTATIVE ═════════════════════════════
   Eric, 10/09 : *« au moins poser la question : voulez-vous garder une
   sauvegarde de la version FH ? »*. Le composant gagne UNE sortie de plus
   quand l'appelant en donne une — un libellé, un callback sans argument,
   entre annuler et confirmer. Sans elle, il rend exactement ce qu'il rendait. */

test("192-1 — sans `troisiemeVoie`, la boîte a DEUX boutons, comme avant ; avec, TROIS, et la troisième précède la paire", () => {
  const deux = renderConfirmDialog({ title: "x", onConfirm: () => {}, onCancel: () => {} });
  assert.deepEqual(deux.querySelectorAll(".confirm-dialog-actions button").map((b) => b.className), ["confirm-dialog-cancel", "confirm-dialog-confirm"]);
  assert.equal(deux.querySelectorAll(".confirm-dialog-troisieme-voie").length, 0, "témoin : aucune troisième voie sans libellé");
  const trois = renderConfirmDialog({ title: "x", troisiemeVoie: { label: "Save first", onClick: () => {} }, onConfirm: () => {}, onCancel: () => {} });
  assert.deepEqual(trois.querySelectorAll(".confirm-dialog-actions button").map((b) => b.textContent), ["Save first", "Cancel", "Confirm"],
    "la troisième voie d'abord, sur sa ligne ; puis la paire annuler · confirmer, intacte — l'ordre du DOM est l'ordre visuel");
  /* Un libellé vide n'est pas une voie : on ne rend pas un bouton muet. */
  const muet = renderConfirmDialog({ title: "x", troisiemeVoie: { label: "" }, onConfirm: () => {}, onCancel: () => {} });
  assert.equal(muet.querySelectorAll(".confirm-dialog-troisieme-voie").length, 0);
});

test("192-2 — cliquer la troisième voie appelle SON callback, sans argument — jamais `onConfirm`, jamais `onCancel`", () => {
  const calls = [];
  const node = renderConfirmDialog({
    title: "x", items: ["a"],
    troisiemeVoie: { label: "Save first", onClick: (...args) => calls.push(["voie", args.length]) },
    onConfirm: () => calls.push(["confirm"]), onCancel: () => calls.push(["cancel"])
  });
  node.querySelectorAll(".confirm-dialog-troisieme-voie")[0].click();
  assert.deepEqual(calls, [["voie", 0]], "la voie ne sait rien de ce qu'elle déclenche : c'est l'appelant qui sauvegarde puis éteint");
  /* et les deux autres boutons ne la touchent pas */
  node.querySelectorAll(".confirm-dialog-cancel")[0].click();
  node.querySelectorAll(".confirm-dialog-confirm")[0].click();
  assert.deepEqual(calls, [["voie", 0], ["cancel"], ["confirm"]]);
  /* sans callback, un clic ne casse pas */
  const sans = renderConfirmDialog({ title: "x", troisiemeVoie: { label: "Save first" } });
  assert.doesNotThrow(() => sans.querySelectorAll(".confirm-dialog-troisieme-voie")[0].click());
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
