/* ══ LOT 340 — 🖐️ ARMER PUIS POSER : la grammaire du geste (Eric, 28/09) ═══════════════════════
   NORMES `geste-armer-puis-poser`. Chaque garde porte la réponse d'Eric qu'il tient :
   1a (un clic arme) · 2a (re-clic, vide, Échap désarment) · 3a (un autre objet remplace) ·
   5b (seules les cases libres s'allument) · 6b (un objet sans destination refuse) · « b oui partout »
   (l'appui long au doigt) · tap / clic droit = voir. */
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
const { renderChoixGlisses, eteindreLeDeplacement, objetArme, MAINTIEN_EQUIPEMENT_MS } = await import("../ui/builder/glisser.mjs");

const slots = (s0 = [], s1 = []) => ([
  { path: "x[0]", index: 0, options: ["a", "b", "c"], selected: s0 },
  { path: "x[1]", index: 1, options: ["a", "b", "c"], selected: s1 }
]);
function ecran(sel = [[], []], extra = {}) {
  eteindreLeDeplacement();
  const actions = []; const vus = [];
  const n = renderChoixGlisses({ plan: { status: "pending", answered: 0, expected: 2 }, slots: slots(...sel), titre: "T", mot: "M",
    labelOf: (id) => id, onAction: (a) => actions.push(a), onInfo: (id) => vus.push(id), ...extra });
  return { n, actions, vus, jetons: n.querySelectorAll(".glisse-jeton"), creneaux: n.querySelectorAll(".glisse-creneau") };
}
const cliquer = (el, pointerType = "mouse", pointerId = 1) => {
  el.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId, button: 0, pointerType });
  document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId });
};
const appuyerSur = (target, pointerId = 5) => {
  document.dispatchEvent({ type: "pointerdown", target, clientX: 0, clientY: 0, pointerId, button: 0, pointerType: "mouse" });
  document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId });
};
const allumes = (e) => e.creneaux.filter((c) => c.dataset.destination === "oui");

test("340 · 1a — le clic gauche ARME : liseré sur l'objet, créneaux libres en bleu, rien d'écrit", () => {
  const e = ecran();
  cliquer(e.jetons[0]);
  assert.deepEqual(e.actions, []);
  assert.equal(objetArme(), e.jetons[0]);
  assert.equal(e.jetons[0].dataset.deplacement, "arme");
  assert.equal(allumes(e).length, 2);
});

test("342 — l'habit : un FOND bleu discret sur les destinations, ⛔ plus aucun liseré ajouté (ni outline, ni contour)", async () => {
  const fs = await import("node:fs");
  const css = fs.readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  /* ⚠️ les attributs de la grammaire seulement — `[data-deplacement="oui"]` est le mode édition de Pack */
  const regles = [...css.matchAll(/([^{}]*\[data-(?:destination="oui"|deplacement="arme")\][^{}]*)\{([^}]*)\}/g)];
  assert.ok(regles.length > 0);
  for (const [, sel, corps] of regles) {
    assert.doesNotMatch(corps, /outline|border(-(color|width|style))?\s*:|box-shadow/, `⛔ ${sel.trim()} dessine un contour`);
  }
  assert.match(css, /\[data-destination="oui"\] \{ background-image: linear-gradient\(var\(--destination-fond\), var\(--destination-fond\)\); \}/);
  const jetons = fs.readFileSync(new URL("../ui/builder/tokens.css", import.meta.url), "utf8");
  assert.match(jetons, /--destination-fond: color-mix\(in srgb, var\(--info\) 20%, transparent\);/, "le bleu de la maison, mélangé à 20 %");
});

test("340 · 2a — re-clic sur l'objet, clic dans le vide, ou Échap : désarmé", () => {
  const e = ecran();
  cliquer(e.jetons[0]); cliquer(e.jetons[0]);
  assert.equal(objetArme(), null, "⛔ le re-clic ne désarme pas");
  assert.equal(allumes(e).length, 0);
  cliquer(e.jetons[0]);
  appuyerSur(document.body);
  assert.equal(objetArme(), null, "⛔ le clic dans le vide ne désarme pas");
  cliquer(e.jetons[0]);
  document.dispatchEvent({ type: "keydown", key: "Escape" });
  assert.equal(objetArme(), null, "⛔ Échap ne désarme pas");
  assert.equal(e.jetons[0].dataset.deplacement, undefined);
  assert.deepEqual(e.actions, [], "désarmer n'écrit rien");
});

test("340 · 3a — armer un autre objet remplace le premier", () => {
  const e = ecran();
  cliquer(e.jetons[0]); cliquer(e.jetons[1]);
  assert.equal(objetArme(), e.jetons[1]);
  assert.equal(e.jetons[0].dataset.deplacement, undefined, "⛔ l'ancien garde son liseré");
  appuyerSur(e.creneaux[0]);
  assert.deepEqual(e.actions, [{ kind: "set", path: "x[0]", value: "b" }], "c'est le NOUVEAU qui se pose");
});

test("340 · 5b · 342 — un créneau rempli REMPLAÇABLE est une destination ; l'objet flashe à l'activation", () => {
  /* ⚖️ Eric, 28/09 : « destinations remplies potentiellement remplissables par autre chose » · « un flash
     sur le token pour indiquer l'activation » */
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const e = ecran([["a"], []]);
    cliquer(e.jetons[1]);
    assert.equal(e.jetons[1].dataset.flash, "halo", "⛔ l'activation au clic gauche ne flashe pas");
    assert.deepEqual(allumes(e).map((c) => c.dataset.creneau), ["x[0]", "x[1]"]);
  } finally { mock.timers.reset(); }
});

test("340 · 6b — sans destination, l'objet REFUSE : un bref halo rouge, et il ne s'arme pas", () => {
  /* une portée sans aucun créneau : rien où le poser */
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const e = ecran([[], []], {});
    for (const c of e.creneaux) delete c.dataset.creneau;
    cliquer(e.jetons[2]);
    assert.equal(objetArme(), null, "⛔ un objet sans destination s'est armé");
    assert.equal(e.jetons[2].dataset.flash, "refus", "⛔ aucun refus visible");
    mock.timers.tick(1000);
    assert.equal(e.jetons[2].dataset.flash, undefined, "le refus est bref");
  } finally { mock.timers.reset(); }
});

test("340 · doigt — le tap VOIT ; l'appui long ARME (flash), puis un tap sur un créneau y pose", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const e = ecran();
    cliquer(e.jetons[0], "touch", 2);
    assert.deepEqual(e.vus, ["a"], "⛔ au doigt, le tap ne voit pas");
    assert.equal(objetArme(), null, "⛔ un tap court a armé");
    e.jetons[1].dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 3, button: 0, pointerType: "touch" });
    mock.timers.tick(MAINTIEN_EQUIPEMENT_MS);
    assert.equal(e.jetons[1].dataset.flash, "halo", "⛔ l'appui long ne fait pas son flash");
    assert.equal(objetArme(), e.jetons[1], "⛔ l'appui long n'arme pas");
    document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 3 });
    assert.equal(objetArme(), e.jetons[1], "⛔ relâcher l'appui long désarme : l'objet doit attendre sa destination");
    assert.deepEqual(e.vus, ["a"], "⛔ relâcher l'appui long a ouvert l'info");
    appuyerSur(e.creneaux[1]);
    assert.deepEqual(e.actions, [{ kind: "set", path: "x[1]", value: "b" }]);
  } finally { mock.timers.reset(); }
});

test("340 · voir — le clic droit voit à la souris ; ⛔ le `contextmenu` d'un appui long au doigt (Android) ne voit pas", () => {
  const e = ecran();
  e.jetons[0].dispatchEvent({ type: "contextmenu", pointerType: "mouse", preventDefault() {} });
  assert.deepEqual(e.vus, ["a"]);
  e.jetons[1].dispatchEvent({ type: "contextmenu", pointerType: "touch", preventDefault() {} });
  assert.deepEqual(e.vus, ["a"], "⛔ un appui long au doigt a ouvert l'info");
  /* ⚠️ et quand le `contextmenu` ne dit pas son pointeur (MouseEvent nu) : c'est le dernier appui qui parle */
  e.jetons[2].dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 6, button: 0, pointerType: "touch" });
  e.jetons[2].dispatchEvent({ type: "contextmenu", preventDefault() {} });
  document.dispatchEvent({ type: "pointercancel", clientX: 0, clientY: 0, pointerId: 6 });
  assert.deepEqual(e.vus, ["a"], "⛔ un `contextmenu` né d'un doigt a ouvert l'info");
});
