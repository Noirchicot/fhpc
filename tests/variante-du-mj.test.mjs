/* ══ LOT 333 — ④ LA VARIANTE QUE LE MJ CHOISIT ══════════════════════════════════════
   ⚖️ Eric, 2026-09-27 : « Carpet of flying devrait être un blueprint », puis « B et a (sa taille,
   capacité, vitesse) » — tous les objets de même forme, et X5 propose la variante.
   ⭐ Le signal est la phrase du SRD (« The GM chooses the size/type/kind … or determines it
   randomly ») suivie de sa table de tirage ; ⛔ jamais une liste de noms. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { variantesDe, texteDUneVariante, nomDUneVariante } from "../src/build/objet-crafte.mjs";
import { estRecette } from "../ui/builder/equipement-pipeline.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ITEMS = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8")).records.item;
const record = (nom) => Object.values(ITEMS).find((v) => v.name === nom);
const mots = (nom) => variantesDe(record(nom).data).map((v) => `${v.mot}:${v.rarete}`);

test("333 · 1 — le Carpet de Flying est un blueprint, et ses variantes disent taille, capacité et vitesse", () => {
  assert.equal(estRecette(record("Carpet of Flying")), true, "⛔ le Carpet n'est pas un blueprint");
  assert.deepEqual(mots("Carpet of Flying"), [
    "3 ft. × 5 ft.:Very Rare", "4 ft. × 6 ft.:Very Rare", "5 ft. × 7 ft.:Very Rare", "6 ft. × 9 ft.:Very Rare",
  ], "⭐ le mot est la TAILLE — le nom que l'inventaire des effets et `gear[N].variant` portent");
  /* ⭐ et le détail dit capacité et vitesse, pour le menu de X5 */
  assert.deepEqual(variantesDe(record("Carpet of Flying").data).map((v) => v.detail),
    ["200 lb. · 80 feet", "400 lb. · 60 feet", "600 lb. · 40 feet", "800 lb. · 30 feet"]);
  assert.equal(nomDUneVariante(record("Carpet of Flying").data, "4 ft. × 6 ft."), "Carpet of Flying (4 ft. × 6 ft.)");
});

test("333 · 2 — la même forme ailleurs dans le SRD : Manual of Golems, Potion et Ring of Resistance", () => {
  assert.deepEqual(mots("Manual of Golems").map((m) => m.split(":")[0]), ["Clay Golem", "Flesh Golem", "Iron Golem", "Stone Golem"]);
  /* ⭐ une table à DEUX colonnes de tirage se lit en deux, dans l'ordre du dé */
  assert.deepEqual(mots("Potion of Resistance").map((m) => m.split(":")[0]),
    ["Acid", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Poison", "Psychic", "Radiant", "Thunder"]);
  assert.ok(mots("Potion of Resistance").every((m) => m.endsWith(":Uncommon")), "la rareté de l'objet, pour chaque variante");
  assert.equal(mots("Ring of Resistance")[2], "Fire:Rare");
  assert.equal(variantesDe(record("Ring of Resistance").data)[2].detail, "Garnet", "la gemme, en détail");
  for (const n of ["Manual of Golems", "Potion of Resistance", "Ring of Resistance"]) assert.equal(estRecette(record(n)), true, n);
});

test("333 · 3 — ⛔ ce que la phrase laisse dehors : plusieurs éléments tirés, un choix sans table, un effet à l'usage", () => {
  for (const n of ["Necklace of Prayer Beads", "Robe of Useful Items", "Ring of Elemental Command", "Bag of Beans", "Candle of Invocation"]) {
    assert.deepEqual(variantesDe(record(n).data), [], `${n} n'est pas UNE variante à choisir`);
  }
});

test("333 · 4 — la fiche d'une variante récite SA ligne, et une table à deux colonnes ne garde que SA case", () => {
  const carpet = texteDUneVariante(record("Carpet of Flying").data, "5 ft. × 7 ft.");
  assert.match(carpet, /56–80 5 ft\. × 7 ft\. 600 lb\. 40 feet/);
  assert.doesNotMatch(carpet, /3 ft\. × 5 ft\.|6 ft\. × 9 ft\./, "⛔ les autres tailles sont récitées");
  const potion = texteDUneVariante(record("Potion of Resistance").data, "Fire").split("\n\n");
  assert.deepEqual(potion.slice(-2), ["1d10 Damage Type", "3 Fire"], "⛔ l'en-tête doublé, ou la case voisine");
  /* ⛔ et une table à UNE colonne de tirage n'est jamais coupée (le Horn : « 4 Training… » est une colonne) */
  assert.match(texteDUneVariante(record("Horn of Valhalla").data, "Bronze"), /76–90 Bronze 4 Training with all Medium armor/);
});

