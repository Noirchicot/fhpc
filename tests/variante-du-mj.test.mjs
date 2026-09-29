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

test("333 · 3 — ⛔ ce que la phrase laisse dehors : plusieurs éléments tirés, un effet à l'usage", () => {
  /* 🔄 LOT 354 — LE RING OF ELEMENTAL COMMAND A QUITTÉ CETTE LISTE. Eric, 29/09 : « oui blueprint
     pour le ring » — ses variantes sont nommées dans son texte, et la forme ⑤ les lit (354 · 1).
     Les quatre autres restent dehors, et ce garde les tient toujours. */
  for (const n of ["Necklace of Prayer Beads", "Robe of Useful Items", "Bag of Beans", "Candle of Invocation"]) {
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

/* ══ LOT 354 — ⑤ LE CHOIX DU MJ NOMMÉ DANS LE TEXTE, EN SECTIONS ══════════════════════════
   ⚖️ Eric, 2026-09-29 : « oui blueprint pour le ring » — un choix (l'élément), mais pas de table.
   ⭐ Trois signaux de la donnée, tous nécessaires : la phrase du choix (« The GM chooses or
   randomly determines »), l'exemple que le SRD donne du nom (« a Ring of Elemental Command
   (air) »), et un paragraphe fait de sections titrées d'un mot, dont l'une porte ce mot. */
const RING = "Ring of Elemental Command";
const ring = () => record(RING).data;

test("354 · 1 — le Ring of Elemental Command est un blueprint : Air · Earth · Fire · Water, Legendary", () => {
  assert.equal(estRecette(record(RING)), true, "⛔ le Ring n'est pas un blueprint");
  assert.deepEqual(mots(RING), ["Air:Legendary", "Earth:Legendary", "Fire:Legendary", "Water:Legendary"],
    "⭐ les quatre sections de son texte, dans leur ordre, à la rareté de l'objet");
  assert.equal(nomDUneVariante(ring(), "Air"), "Ring of Elemental Command (Air)",
    "⭐ le nom posé est la forme que le SRD donne lui-même en exemple");
  /* ⛔ aucun détail inventé : le menu de X5 dit l'élément, et rien d'autre */
  assert.deepEqual(variantesDe(ring()).map((v) => v.detail), [undefined, undefined, undefined, undefined]);
});

test("354 · 2 — la fiche d'une variante : l'en-tête, les propriétés communes, SA section et SA ligne de sorts", () => {
  const sections = { Air: /^Air\. You know Auran/, Earth: /^Earth\. You know Terran/, Fire: /^Fire\. You know Ignan/, Water: /^Water\. You know Aquan/ };
  const lignes = { Air: /^Air Chain Lightning/, Earth: /^Earth Earthquake/, Fire: /^Fire Burning Hands/, Water: /^Water Create or Destroy Water/ };
  for (const mot of Object.keys(sections)) {
    const paras = texteDUneVariante(ring(), mot).split("\n\n");
    /* ⭐ ce qui est commun reste */
    assert.match(paras[0], /The GM chooses or randomly determines the linked plane/, `${mot} : l'en-tête`);
    assert.ok(paras.some((p) => /^Elemental Bane\..*Elemental Compulsion\./.test(p)), `${mot} : les deux propriétés communes`);
    assert.ok(paras.some((p) => /^Spellcasting\..*Plane Spells \(Charges\)$/.test(p)), `${mot} : l'en-tête de la table des sorts`);
    /* ⭐ SA section et SA ligne, une fois chacune ; ⛔ celles des trois autres, jamais */
    for (const [autre, motif] of Object.entries(sections)) {
      assert.equal(paras.filter((p) => motif.test(p)).length, autre === mot ? 1 : 0, `${mot} : la section ${autre}`);
    }
    for (const [autre, motif] of Object.entries(lignes)) {
      assert.equal(paras.filter((p) => motif.test(p)).length, autre === mot ? 1 : 0, `${mot} : la ligne de sorts ${autre}`);
    }
  }
});

test("354 · 3 — ⛔ LES TROIS SIGNAUX, UN PAR UN : sans la phrase, sans l'exemple ou sans sections nommées, le Ring ne bascule pas", () => {
  /* ⭐ PRIVATION DÉLIBÉRÉE (TRAPS : « un test qui montre un refus s'appuie sur une privation
     délibérée ») — on ampute le vrai record d'UN signal à la fois. Chaque amputation est d'abord
     prouvée (le texte a bien changé), sinon le refus mesurerait du vide. */
  const d = ring();
  assert.equal(variantesDe(d).length, 4, "témoin : intact, il bascule");
  const ampute = (texte) => ({ ...d, description: texte });
  const sansPhrase = d.description.replace("The GM chooses or randomly determines the linked plane. ", "");
  const sansExemple = d.description.replace(/ For example, a Ring of Elemental Command \(air\)[^.]*\./, "");
  const sansSections = d.description.split("\n\n").filter((p) => !/^Air\. /.test(p)).join("\n\n");
  for (const [nom, texte] of [["la phrase", sansPhrase], ["l'exemple", sansExemple], ["les sections nommées", sansSections]]) {
    assert.notEqual(texte, d.description, `témoin : la privation de ${nom} n'a rien retiré`);
    assert.deepEqual(variantesDe(ampute(texte)), [], `⛔ sans ${nom}, le Ring a basculé`);
  }
  /* ⛔ ET SURTOUT PAS SES PROPRIÉTÉS COMMUNES : « Elemental Bane. … Elemental Compulsion. » sont
     aussi des sections titrées — un lecteur trop large les proposerait comme variantes. */
  assert.equal(estRecette({ data: ampute(sansSections) }), false, "⛔ sans sections nommées, un plan quand même");
});

test("354 · 4 — ⛔ AUCUN AUTRE OBJET NE BASCULE : des sections sans choix du MJ ne sont pas des variantes", () => {
  /* 📏 Relevé du lot 354 sur les 3 298 records des couches : le Ring seul change. Ce garde en
     tient la moitié qui compte — les objets du SRD qui proposent une variante, NOMMÉS : un de
     plus ou un de moins, et il rougit. */
  const aVariantes = Object.values(ITEMS).filter((v) => variantesDe(v.data).length >= 2).map((v) => v.data.name).sort();
  assert.deepEqual(aVariantes, [
    "Belt of Giant Strength", "Carpet of Flying", "Feather Token", "Figurine of Wondrous Power", "Horn of Valhalla",
    "Ioun Stone", "Manual of Golems", "Potion of Giant Strength", "Potion of Resistance", "Potions of Healing",
    "Ring of Elemental Command", "Ring of Resistance", "Wand of the War Mage, +1, +2, or +3",
  ]);
  /* ⭐ les trois témoins de la donnée : des sections nommées d'un mot, mais pas de choix du MJ — un
     mode d'usage (Splash · Fountain · Geyser), des propriétés, des cartes */
  for (const n of ["Decanter of Endless Water", "Belt of Dwarvenkind", "Mysterious Deck"]) {
    assert.deepEqual(variantesDe(record(n).data), [], `⛔ ${n} a basculé : ses sections ne sont pas des variantes`);
  }
});

