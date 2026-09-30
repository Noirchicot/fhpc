/* ══ 🧬 LOT 387 — UN LIVRE D'ORIGINES POUR LES TESTS, JAMAIS LE PHB ════════════════════════════════
   ARCHI 35 : les gardes se prouvent *« sur une fixture de livre écrite pour le test, jamais sur le
   PHB »*. Cette fixture a la FORME de `sources-livres/phb-2024-origins.json` (des faits de jeu), et
   ses records propres sont INVENTÉS (Lamplighter, Glimmerkin, Test Fortune) : aucun ne vient d'un livre.
   Ses records partagés reprennent des faits du SRD 5.2.1 (CC-BY), pour que la comparaison ait un frère.
   ⛔ Ce fichier n'est pas une suite : il n'a pas le suffixe `.test.mjs`. */
import { writeFileSync, mkdtempSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { construireOrigines } from "../src/tools/gen-livre-layer.mjs";
import { readJson, ROOT, PILE_SRD } from "./build-harness.mjs";
import { PILE as PILE_FH } from "../src/tools/exemple-fh-en.mjs";

export const URL_FIXTURE = "https://www.dndbeyond.com/sources/test-book";

export function sourceFixture() {
  return {
    backgrounds: [
      /* partagés : les faits du SRD, à l'identique (Acolyte) ou avec UN écart planté (Sage) */
      { name: "Acolyte", abilities: ["int", "wis", "cha"], feat: { name: "Magic Initiate", class: "cleric" }, skills: ["insight", "religion"],
        tool: { id: "calligrapher-s-supplies" }, kit: ["Calligrapher’s Supplies", "Book (prayers)", "Holy Symbol", "Parchment (10 sheets)", "Robe"], kit_gp: 8 },
      { name: "Sage", abilities: ["con", "int", "wis"], feat: { name: "Magic Initiate", class: "wizard" }, skills: ["arcana", "nature"],
        tool: { id: "calligrapher-s-supplies" }, kit: ["Quarterstaff", "Calligrapher’s Supplies", "Book (history)", "Parchment (8 sheets)", "Robe"], kit_gp: 8 },
      /* propres, inventés : un outil de famille au SRD (Gaming Set) et un hors du SRD (Musical Instrument) */
      { name: "Lamplighter", abilities: ["dex", "wis", "cha"], feat: { name: "Test Fortune" }, skills: ["perception", "stealth"],
        tool: { family: "gaming-set" }, kit: ["Lamp", "Oil", "Gaming Set (same as above)"], kit_gp: 12 },
      { name: "Busker", abilities: ["str", "dex", "cha"], feat: { name: "Alert" }, skills: ["acrobatics", "performance"],
        tool: { family: "musical-instrument" }, kit: ["Musical Instrument (same as above)", "Costume"], kit_gp: 20 }
    ],
    species_shared: [
      { name: "Human", traits: ["Resourceful", "Skillful", "Versatile"], lu_sur: "fixture" },
      { name: "Dwarf", traits: ["Darkvision", "Dwarven Resilience", "Stonecunning"], lu_sur: "fixture (un trait manquant, planté)" }
    ],
    species_new: [
      { name: "Glimmerkin", url: `${URL_FIXTURE}/glimmerkin`, creature_type: "Humanoid", size: "medium-or-small",
        size_text: "Medium (about 4–7 feet tall) or Small (about 2–4 feet tall), chosen when you select this species",
        speed_ft: 30, darkvision_ft: 60, resume: "An invented test species.",
        traits: [
          { name: "Glow Ward", resistances: ["radiant"], resume: "Resistance to Radiant damage." },
          { name: "Mending Spark", economy: "action", heal: { dice_per_proficiency: "d4" }, uses: { max: 1, recharge: "long" }, resume: "Once per Long Rest, a touch that heals." },
          { name: "Late Bloom", level: 3, economy: "bonus", uses: { max: 1, recharge: "long" }, resume: "From level 3, once per Long Rest, a brief change." }
        ] }
    ],
    feats: [
      { name: "Alert", shared: true },
      { name: "Test Fortune", luck_points: { max: "proficiency", recharge: "long" }, resume: "A small pool of luck, refreshed on a Long Rest." },
      { name: "Test Hardiness", hp_per_level: 2, resume: "More Hit Points." }
    ],
    sections: { background: `${URL_FIXTURE}/origins#`, feat: `${URL_FIXTURE}/feats#` }
  };
}

/** La couche du livre, construite depuis la fixture sur les VRAIES couches SRD et `srfh-mecaniques-en`. */
export function coucheFixture(source = sourceFixture()) {
  return construireOrigines(source, {
    srd: readJson("layers/srd-5.2.1-en.layer.json"),
    meca: readJson("layers/srfh-mecaniques-en.layer.json")
  });
}

/** Une pile avec le livre À SA PLACE, celle d'`engine.mjs` : juste au-dessus de la dernière couche
 *  `srfh`, sous les couches Fate's Hand. Le fichier vit dans un dossier temporaire, hors du dépôt. */
export function pileAvecLivre(pile, layer) {
  const dir = mkdtempSync(join(tmpdir(), "livre-387-"));
  const fichier = join(dir, "xphb-en.layer.json");
  writeFileSync(fichier, `${JSON.stringify(layer, null, 2)}\n`);
  const rel = relative(ROOT, fichier);
  const i = pile.map((f) => f.split("/").pop()).findLastIndex((f) => f.startsWith("srfh-"));
  return [...pile.slice(0, i + 1), rel, ...pile.slice(i + 1)];
}

export { PILE_SRD, PILE_FH };
