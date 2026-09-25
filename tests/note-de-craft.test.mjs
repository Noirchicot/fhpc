/* ══ LA NOTE DE CRAFT ET LA RARETÉ, SUR LES FICHES X1 ET X2 — lot 279 ══════════════

   ⚖️ Eric, 2026-09-26 : « tous les objets magiques, y compris ceux qui ne passent pas
   par X5, devront avoir une référence au prix du craft (une petite note en pied de page
   en italique) » — la rareté à côté du prix. Maquette validée (« exact ») :
        Dagger of Venom
        4,002 GP · Rare
        …texte…
        Crafting: 50 days · 2,001 GP · Rare        (italique, en pied)

   ⭐ CES GARDES MONTENT LES VRAIES FICHES : la tête commune (X1) et X2, avec son
   feuilletage — le repeint de page est l'endroit où la note se serait perdue. */
import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";

const { construireLaFicheX1 } = await import("../ui/builder/x1-ecran.mjs");
const { construireLaFicheX2 } = await import("../ui/builder/x2-ecran.mjs");

function avecDocument(f) {
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try { return f(); } finally { if (avant === undefined) delete globalThis.document; else globalThis.document = avant; }
}
const organe = (n, id) => n.querySelector(`[data-organe="${id}"]`);

const DAGUE = { nom: "Dagger of Venom", prixUnite: "4,002 GP", poidsUnite: "1 lb.", rarete: "Rare",
  prose: "You can use a Bonus Action to coat the blade in poison.",
  noteCraft: "Crafting: 50 days · 2,001 GP · Rare" };

test("1 — ⚖️ X1 : la rareté À CÔTÉ DU PRIX, la note EN PIED du texte, en italique", () => avecDocument(() => {
  const { noeud } = construireLaFicheX1({ objet: { index: 0, qte: 1, ...DAGUE } });
  assert.equal(organe(noeud, "unite").textContent, "4,002 GP · 1 lb. · Rare");
  const desc = organe(noeud, "description");
  const note = desc.querySelector(".x1-note-craft");
  assert.ok(note, "⭐ la note est DANS la zone du texte, au pied");
  assert.equal(note.textContent, "Crafting: 50 days · 2,001 GP · Rare");
  assert.ok(desc.textContent.startsWith(DAGUE.prose), "⭐ le texte d'abord, la note ensuite");
  /* ⛔ un objet mondain : ni rareté, ni note — rien d'inventé */
  const { noeud: corde } = construireLaFicheX1({ objet: { index: 0, qte: 1, nom: "Rope", prixUnite: "1 gp",
    poidsUnite: "5 lb.", prose: "Rope." } });
  assert.equal(organe(corde, "unite").textContent, "1 gp · 5 lb.");
  assert.equal(organe(corde, "description").querySelector(".x1-note-craft"), null);
}));

test("2 — 🔴 X2 : LE FEUILLETAGE REPEINT LA RARETÉ ET LA NOTE — il ne les efface pas", () => avecDocument(() => {
  /* 🔴 Le repeint écrivait `textContent` sur la description : une note posée par la tête
     aurait disparu à la première page tournée. */
  const fiche = (o) => ({ ref: { kind: "item", id: o.nom }, nom: o.nom, coutTexte: o.prixUnite, cout: null,
    poidsTexte: o.poidsUnite, prose: o.prose, rarete: o.rarete || "", noteCraft: o.noteCraft || "" });
  const FLYING = { nom: "Potion of Flying", prixUnite: "20,000 GP", poidsUnite: "", rarete: "Very Rare",
    prose: "When you drink this potion…", noteCraft: "Crafting: 63 days · 10,000 GP · Very Rare" };
  let tourner = null;
  const noeud = construireLaFicheX2({ liste: [fiche(DAGUE), fiche(FLYING)], index: 0,
    naviguer: ({ vers }) => { tourner = vers; } });
  assert.equal(organe(noeud, "unite").textContent, "4,002 GP · 1 lb. · Rare");
  assert.equal(organe(noeud, "description").querySelector(".x1-note-craft").textContent,
    "Crafting: 50 days · 2,001 GP · Rare");
  tourner(1);
  assert.equal(organe(noeud, "unite").textContent, "20,000 GP · Very Rare", "⭐ la page suivante a SA rareté");
  const note = organe(noeud, "description").querySelector(".x1-note-craft");
  assert.ok(note, "⛔ la note survit au repeint");
  assert.equal(note.textContent, "Crafting: 63 days · 10,000 GP · Very Rare");
}));
