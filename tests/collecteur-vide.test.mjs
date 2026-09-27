/* ══ LOT 335 — LÂCHÉ DANS LE VIDE, L'OBJET QUITTE LE COLLECTEUR ═════════════════════
   ⚖️ Eric, 2026-09-28 : « je ne peux pas vider le collecteur, mettre [le] token dans le vide, ça
   marche pas ». ⭐ Le geste du parchemin de X5, porté aux trois collecteurs d'Equipment (Gear,
   Pack, Wares) : glissé hors de toute cible, l'objet quitte le collecteur. */
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
const { MAINTIEN_EQUIPEMENT_MS } = await import("../ui/builder/glisser.mjs");
const { construireLEcranGear } = await import("../ui/builder/gear-ecran.mjs");
const { construireLeSac } = await import("../ui/builder/sac-ecran.mjs");
const { construireLesWares } = await import("../ui/builder/wares-ecran.mjs");

/** Tenu 500 ms (le péage de l'étape), porté loin, lâché sur RIEN (`elementFromPoint` rend null). */
function lacherDansLeVide(jeton) {
  document.elementFromPoint = () => null;
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 5, button: 0, pointerType: "mouse" });
    mock.timers.tick(MAINTIEN_EQUIPEMENT_MS);
  } finally { mock.timers.reset(); }
  document.dispatchEvent({ type: "pointermove", clientX: 90, clientY: 90, pointerId: 5 });
  document.dispatchEvent({ type: "pointerup", clientX: 90, clientY: 90, pointerId: 5 });
}
const collecteurDe = (n) => n.querySelector('[data-organe="collecteur"]');

test("335 · Gear — le collecteur plein, lâché dans le vide, se vide", () => {
  const vides = [];
  const n = construireLEcranGear({ boites: { tete1: { nom: "Helm", qte: 1, index: 3 } }, collecte: new Set([3]),
    surVider: (i) => vides.push(i) }).noeud;
  lacherDansLeVide(collecteurDe(n));
  assert.deepEqual(vides, [3], "⛔ Gear : l'objet lâché dans le vide reste dans le collecteur");
});

test("335 · Pack — le collecteur plein, lâché dans le vide, se vide", () => {
  const vides = [];
  const n = construireLeSac({ sections: [{ nom: "Camp" }], section: 0, poids: {}, destinations: [],
    objets: [{ index: 4, nom: "Rope", qte: 1 }], retenu: 4, surVider: (i) => vides.push(i) }).noeud;
  lacherDansLeVide(collecteurDe(n));
  assert.deepEqual(vides, [4], "⛔ Pack : l'objet lâché dans le vide reste dans le collecteur");
});

test("335 · Wares — le collecteur plein, lâché dans le vide, se vide ; ⛔ lâché sur lui-même, il garde l'objet", () => {
  let vides = 0;
  const monter = () => construireLesWares({
    categories: [{ nom: "Armory" }], categorie: 0, sousCategories: [{ nom: "Rings" }], sousCategorie: 0,
    objets: [{ ref: "srd:item:en:a", nom: "Rope", qte: 1 }], sections: [{ valeur: "backpack", mot: "Backpack" }],
    destination: "backpack", retenu: { nom: "Rope" }, surVider: () => { vides += 1; },
  }).noeud;
  lacherDansLeVide(collecteurDe(monter()));
  assert.equal(vides, 1, "⛔ Wares : l'objet lâché dans le vide reste dans le collecteur");
  /* lâché sur lui-même : c'est une cible, pas le vide */
  const n = monter();
  const c = collecteurDe(n);
  document.elementFromPoint = () => ({ closest: (sel) => (sel === "[data-creneau]" ? c : null) });
  mock.timers.enable({ apis: ["setTimeout"] });
  try { c.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 6, button: 0, pointerType: "mouse" }); mock.timers.tick(MAINTIEN_EQUIPEMENT_MS); }
  finally { mock.timers.reset(); }
  document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 40, pointerId: 6 });
  document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 40, pointerId: 6 });
  document.elementFromPoint = () => null;
  assert.equal(vides, 1, "⛔ lâché sur lui-même, le collecteur s'est vidé");
});
