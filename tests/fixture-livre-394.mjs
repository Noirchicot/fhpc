/* ══ 💍 LOT 394 — UN CHAPITRE D'OBJETS MAGIQUES POUR LES TESTS, JAMAIS LE DMG ═══════════════════════
   ARCHI 35 : les gardes se prouvent *« sur une fixture inventée »*. Cette fixture a la FORME de
   `sources-livres/dmg-2024-magic-items.json` (des faits de jeu relevés sur le compendium) ; ses objets
   propres sont INVENTÉS (Test Lantern Rod, Gleaming Test Cloak, Test Cutlass). Ses objets partagés
   reprennent les faits de la couche SRD 5.2.1 (CC-BY), pour que la comparaison ait un frère — un écart
   y est planté (Cloak of Elvenkind, rare au lieu d'uncommon), un nom y est changé (« Heward's Test
   Haversack » pour le Handy Haversack du SRD), et une variante y est détachée (Armor, +1).
   ⛔ Ce fichier n'est pas une suite : il n'a pas le suffixe `.test.mjs`. */
import { readJson } from "./build-harness.mjs";
import { construireObjets } from "../src/tools/gen-livre-layer.mjs";

export const URL_OBJETS = "https://www.dndbeyond.com/magic-items/test";

export function sourceObjets({ complet = false } = {}) {
  return {
    meta: { livre: "test", complet },
    items: [
      { name: "Bag of Holding", category: "wondrous-item", rarity: "Uncommon", attunement: false, shared: true },
      { name: "Cloak of Elvenkind", category: "wondrous-item", rarity: "Rare", attunement: true, shared: true },
      { name: "Heward's Test Haversack", srd_name: "Handy Haversack", category: "wondrous-item", rarity: "Rare", attunement: false, shared: true },
      { name: "Armor, +1", variant_of: "Armor, +1, +2, or +3", category: "armor", rarity: "Rare", attunement: false, shared: true },
      { name: "Test Lantern Rod", category: "rod", subtype: null, attunement: true,
        rarity: "Uncommon (+1), Rare (+2), or Very Rare (+3) (Requires Attunement by a Warlock)",
        url: `${URL_OBJETS}/test-lantern-rod`, resume: "An invented rod: +1 to +3 to a warlock's spell attacks and save DCs while held.",
        charges: { max: 3, regain: "1d3", recharge: "dawn" },
        effects: [1, 2, 3].flatMap((n) => ["attack.spell", "dc.spell"].map((cible) => ({
          famille: "chiffre", cible, mode: "bonus", valeur: n, plafond: null, condition: "harmonise+tenu", variante: `+${n}`, section: "Spell bonus"
        }))) },
      { name: "Gleaming Test Cloak", category: "wondrous-item", subtype: null, attunement: false, rarity: "Common",
        url: `${URL_OBJETS}/gleaming-test-cloak`, resume: "An invented cloak that glitters in moonlight.",
        rangement: { shelf: "marvels:clothing", slot: "back", like: "Cloak of Protection" } },
      { name: "Test Cutlass", category: "weapon", subtype: "Any Sword", attunement: false, rarity: "Uncommon",
        url: `${URL_OBJETS}/test-cutlass`, resume: "An invented blade that hums at sea." }
    ]
  };
}

export function objetsFixture(options) {
  return construireObjets(sourceObjets(options), {
    srd: readJson("layers/srd-5.2.1-en.layer.json"),
    rangement: readJson("layers/srfh-shelving-en.layer.json")
  });
}

/** Les trésors du 09/09, en petit : ce que la couche portait AVANT les objets magiques. */
export function sourceTresors() {
  return {
    gemstones: { 10: ["Azurite (mottled deep blue)"] },
    art_objects: { 25: ["Silver ewer"] },
    trade_goods: [{ name: "Wheat", cost: "1 CP", unit: "1 lb." }],
    trade_bars: []
  };
}
