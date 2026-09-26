/* ══ LOT 286 — LES POTIONS DE SOIN : LA POTION DE WARES SE FABRIQUE DANS X5 ══════════

   ⚖️ Eric, 26/09 : « les potions de soin ». La tuile « Potion of Healing » de Wares (un
   record `gear`, 50 GP) n'était pas un plan : sa fiche X2 gardait `Craft` grisé, pendant
   que ses trois grandes sœurs (Greater, Superior, Supreme) se fabriquaient dans X5.

   ── CE QUE CES GARDES TIENNENT ────────────────────────────────────────────────
     ① LE LIEN SE LIT DANS LA DONNÉE — la potion est la variante dont le NOM est le sien ;
     ② LA PORTE DE X2 — `Craft` actif pour la potion, inactif pour la Rope ; et la TUILE
       ouvre toujours X2 (on l'achète d'abord), pas X5 ;
     ③ LES QUATRE PRIX ET TEMPS dans X5 — valeur, coût, temps, rareté ;
     ④ LE PILOTE appelle la même porte pour ses deux gestes (actif ? ouvrir ?).
   ⛔ AUCUN PRÉREQUIS (Herbalism Kit…) : Eric n'a pas tranché s'il faut l'afficher. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { construireX5 } = await import("../ui/builder/x5-ecran.mjs");
const { construireLaFicheX2 } = await import("../ui/builder/x2-ecran.mjs");
const { planDUnObjetFini, ouvertureDepuisX2, seCrafteDansX5, estBaseDeMunition } =
  await import("../ui/builder/craft.mjs");
const { variantesDe, nomDUneVariante } = await import("../src/build/objet-crafte.mjs");
const { fabriqueDeValeur } = await import("../ui/builder/equipement-pipeline.mjs");

/* ⭐ LES MATIÈRES TELLES QUE LE PILOTE LES DONNE (`basesDuCraft`, `magiquesDuCraft`,
   `plansAVariante` dans `equipment-step.mjs`) */
const query = exempleFhEn().layers.verbs.query;
const records = (kind) => query({ kind }).map((v) => v.record);
const bases = [...records("weapon"), ...records("armor"), ...records("gear").filter(estBaseDeMunition)];
const items = records("item");
const magiques = items.filter((r) => String(r?.data?.subtype || "").trim());
const PLANS = items.filter((r) => variantesDe(r.data).length >= 2);
const valeurDe = fabriqueDeValeur(query);

const gear = (nom) => records("gear").find((r) => r.data.name === nom);
const POTION = gear("Potion of Healing");
const CORDE = gear("Rope");
const PLAN = items.find((r) => r.data.name === "Potions of Healing");

function avecDocument(f) {
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try { return f(); }
  finally { if (avant === undefined) delete globalThis.document; else globalThis.document = avant; }
}

test("1 — ⭐ LE LIEN SE LIT DANS LA DONNÉE : la potion de Wares est la variante qui porte SON nom", () => {
  assert.ok(POTION && CORDE && PLAN, "les trois records existent dans la pile");
  const o = planDUnObjetFini(POTION, PLANS);
  assert.equal(o.plan, PLAN, "⭐ le plan trouvé est `Potions of Healing`, lu parmi les plans à variante");
  assert.deepEqual(o.choix, { variante: "Standard" }, "⭐ la variante « Standard » est déjà choisie");
  /* ⛔ pas un id écrit à la main : c'est l'égalité des NOMS qui relie les deux records */
  assert.equal(nomDUneVariante(PLAN.data, o.choix.variante), POTION.data.name);
  /* ⛔ ni un objet sans variante, ni un plan lui-même, ni une pile sans plans */
  assert.equal(planDUnObjetFini(CORDE, PLANS), null, "la Rope n'a pas de plan");
  assert.equal(planDUnObjetFini(PLAN, PLANS), null, "un plan n'est pas un objet fini");
  assert.equal(planDUnObjetFini(POTION, []), null, "sans le plan dans la pile, rien ne s'ouvre");
});

test("2 — ⚖️ X2 : `Craft` ACTIF pour la potion, INACTIF pour la Rope — et il ouvre le plan, Standard choisie", () => {
  /* ⭐ l'appel est CELUI du pilote (garde 4) : `ouvertureDepuisX2` pour les deux gestes */
  const peutCrafter = (ref) => Boolean(ouvertureDepuisX2(gear(ref.id), magiques, bases, PLANS));
  const fiche = (r) => ({ ref: { kind: "gear", id: r.data.name }, nom: r.data.name, coutTexte: r.data.cost,
    cout: null, poidsTexte: "", prose: "" });
  const optionCraft = (n) => [...n.querySelectorAll("option")].find((o) => o.value === "craft");
  avecDocument(() => {
    const ouverts = [];
    const monte = (r) => construireLaFicheX2({ liste: [fiche(r)], index: 0, peutCrafter,
      ouvrirCraft: (ref) => ouverts.push(ouvertureDepuisX2(gear(ref.id), magiques, bases, PLANS)) });
    const n = monte(POTION);
    assert.equal(optionCraft(n).disabled, false, "⭐ Potion of Healing : Craft s'ouvre");
    const sel = optionCraft(n).parentNode;
    sel.value = "craft";
    sel.dispatchEvent(new Event("change"));
    assert.equal(ouverts.at(-1).plan, PLAN, "⭐ choisir Craft ouvre X5 sur `Potions of Healing`");
    assert.equal(ouverts.at(-1).choix.variante, "Standard");
    assert.equal(optionCraft(monte(CORDE)).disabled, true, "⛔ Rope : un gear ordinaire ne se crafte pas");
  });
  /* ⚠️ ET LA TUILE OUVRE TOUJOURS X2 : la porte du tap (`ouvrirLObjet`) demande
     `seCrafteDansX5` — un PLAN. ⛔ Même avec TOUS les items, la potion n'en est pas un :
     elle s'achète d'abord (lot 267 : c'est le blueprint qui mène droit à X5). */
  assert.equal(seCrafteDansX5(POTION, bases, items), false);
  assert.equal(seCrafteDansX5(PLAN, bases, magiques), true, "le plan, lui, va droit à X5");
});

test("3 — ⚖️ LES QUATRE POTIONS DANS X5 : valeur · coût · temps · rareté", () => {
  /* ⭐ Lots 279–280 : Standard = le brassage du SRD (25 GP, 1 jour) ; les autres = la MOITIÉ du
     barème SRFH (un consommable), jours arrondis vers le haut. La valeur est celle de Wares. */
  const attendu = [
    { mot: "Standard", valeur: 50, cout: 25, temps: "1 day", rarete: "Common", encart: /Enchanting25 GP/ },
    { mot: "Greater", valeur: 200, cout: 100, temps: "5 days", rarete: "Uncommon", encart: /Enchanting100 GP/ },
    { mot: "Superior", valeur: 2000, cout: 1000, temps: "25 days", rarete: "Rare", encart: /Enchanting1,000 GP/ },
    { mot: "Supreme", valeur: 20000, cout: 10000, temps: "63 days", rarete: "Very Rare", encart: /Enchanting10,000 GP/ },
  ];
  for (const a of attendu) {
    const { noeud, cote } = avecDocument(() => construireX5({ plan: PLAN, plansFreres: PLANS, valeurDe,
      choix: { variante: a.mot } }));
    assert.equal(cote.venteUnitaire, a.valeur, `${a.mot} : valeur ${a.valeur} GP`);
    assert.equal(cote.craftUnitaire, a.cout, `${a.mot} : fabriquée ${a.cout} GP`);
    assert.equal(cote.temps, a.temps, `${a.mot} : ${a.temps}`);
    assert.equal(cote.rarete, a.rarete, `${a.mot} : ${a.rarete}`);
    const encart = noeud.querySelector('[data-organe="ENCART"]').textContent;
    assert.match(encart, a.encart, `${a.mot} : l'encart dit le coût`);
    assert.match(encart, new RegExp(`${a.rarete} potion`), `${a.mot} : l'encart dit la rareté`);
    assert.match(encart, new RegExp(a.temps), `${a.mot} : l'encart dit le temps`);
  }
  /* ⭐ ET LA POTION OUVERTE DEPUIS WARES arrive sur la ligne Standard : 50 · 25 · 1 jour */
  const o = planDUnObjetFini(POTION, PLANS);
  const { noeud, cote } = avecDocument(() => construireX5({ plan: o.plan, plansFreres: PLANS, valeurDe, choix: o.choix }));
  const choisie = [...noeud.querySelector('[data-organe="VARIANT"]').querySelectorAll("option")].find((x) => x.selected);
  assert.equal(choisie.value, "Standard");
  assert.equal(cote.venteUnitaire, 50, "⭐ le prix même de la tuile de Wares");
  assert.equal(POTION.data.cost, "50 GP");
});

test("4 — ⭐ LE PILOTE : les deux gestes de X2 passent par `ouvertureDepuisX2`, la tuile par `seCrafteDansX5`", () => {
  /* ⛔ Ce garde lit le code SANS ses commentaires (comme le garde 16 de X5). */
  const src = fs.readFileSync(path.join(ROOT, "ui", "builder", "equipment-step.mjs"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  assert.match(src, /peutCrafter: \(ref\) => Boolean\(ouvertureDepuisX2\(cherche\.record\(ref\), magiquesDuCraft, basesDuCraft, plansAVariante\)\)/,
    "⭐ `Craft` s'allume par la porte de X2");
  assert.match(src, /ouvrirCraft: \(ref\) => \{\s*const o = ouvertureDepuisX2\(cherche\.record\(ref\), magiquesDuCraft, basesDuCraft, plansAVariante\);/,
    "⭐ et il ouvre par la MÊME porte — ⛔ sinon Craft s'allumerait sans rien ouvrir");
  const porte = src.slice(src.indexOf("function ouvrirLObjet("), src.indexOf("piloteEquipement = {"));
  assert.doesNotMatch(porte, /ouvertureDepuisX2/, "⛔ la tuile d'un objet fini ouvre X2 : on l'achète d'abord");
});
