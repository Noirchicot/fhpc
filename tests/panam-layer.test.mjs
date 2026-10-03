/* ══ LA COUCHE PANAM — le classeur d'Eric devient un catalog (`src/tools/gen-panam-layer.mjs`) ═════════
   ⛔ Aucune ligne du classeur de Panam ici : la fixture est INVENTÉE (mêmes onglets, mêmes colonnes,
   d'autres noms). Le classeur vit dans le vault d'Eric ; la couche, dans `layers-livres/` (ignoré par git).

   🔴 CE QUE CE FICHIER GARDE :
     P1. LE CATALOG PRODUIT EST ACCEPTÉ par le juge des catalogs (celui d'Import a book) et par le montage.
     P2. LA MONNAIE DE PANAM se lit en GP/SP : sou(s) et sous d'argent → GP, denier(s) → SP ; une
         fourchette reste en mots ; le prix d'origine reste sur le record.
     P3. UN RECORD DU SRD N'EST PAS RÉÉMIS : l'arme partagée est comparée et son écart rapporté ; un don au
         même texte n'entre pas ; un don au texte différent entre sous « (Panam) ».
     P4. CE QU'UN CATALOG NE PORTE PAS SE NOMME : une arme de feu (Fire) entre comme équipement, ses dégâts
         écrits ; outils, compétences et véhicules sont dans `restes`.
     P5. LE LECTEUR .xlsx lit un vrai classeur (chaînes partagées, nombres, cellules vides, onglets nommés).
     P6. LE GÉNÉRATEUR écrit la couche, montée et allumée par le moteur ; sans classeur, il le dit. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { construireCatalogPanam, prix, propriete, generate, ID } = await import("../src/tools/gen-panam-layer.mjs");
const { lireXlsx } = await import("../src/tools/lire-xlsx.mjs");
const { verifierUnCatalog } = await import("../src/catalog/juge.mjs");
const { readLayer } = await import("../src/layers/document.mjs");
const { REPERTOIRES_HORS_DEPOT } = await import("../src/tools/gen-livre-layer.mjs");

const SRD = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));
const srdDon = (nom) => Object.values(SRD.records.feat).find((r) => r.name === nom);

/* ── LA FIXTURE : un classeur inventé, onglet par onglet ─────────────────────────────────────────── */
const FEUILLES = {
  "Sommaire et changements": [["Compendium"]],
  "Fighting Styles & Feats": [
    ["Fighting Styles", "Description"],
    ["Defense", srdDon("Defense").data.description],
    ["Lantern Guard", "While you hold a lit lantern, you gain a +1 bonus\nto Armor Class."],
    [],
    ["Fighting Feats", "Description"],
    ["Grappler", "Ability Score Increase. Increase your Strength by 1.\nHold Fast. You never let go."],
    ["Boiler Heart", "General Feat (Prerequisite: Level 4+)\nAbility Score Increase. Increase your Constitution by 1.\nSteam Lungs. You can hold your breath for 1 hour."]
  ],
  "Weapons List": [
    ["Name", "Categories", "Damage & Type", "P1", "P2", "P3", "P4", "P5", "P6", "Mastery ", "Weight", "Cost"],
    ["Gear Pistol (Panam)", "Martial, Ranged", "1d8 Piercing", "Ammunition (Range 30/90, bullet)", "Light / Finesse", "Loading", "—", "Misfire (2)", "Firearm", "Vex", "2 lb.", "120 Sous d'argent"],
    ["Pistol*", "Martial, Ranged", "1d10 Piercing", "Ammunition (Range 30/90; Bullet)", "—", "Loading", "—", "Misfire (2)", "Firearm", "Vex", "3 lb.", "250 Sous d'argent"],
    ["Steam Lance*", "Martial, Ranged", "2d6 fire", "Ammunition (Range 30/90; Flask)", "—", "—", "—", "—", "—", "Slow", "9 lb.", "300 sous"],
    ["Rivets (20)", "—", "Special", "—", "—", "—", "—", "—", "—", "—", "1 lb.", "4 deniers"],
    ["* already exists"]
  ],
  "Armors Properties": [["Armor Properties", "Description"], ["Light", "Light Armor (1 Minute to Don or Doff)"], ["Heavy", "Heavy Armor (10 Minutes to Don and 5 Minutes to Doff)"]],
  "Armors List": [
    ["Armor", "Category", "AC", "Strength", "Stealth", "BR", "DR", "Weight", "Cost"],
    ["Boiler Plate (Panam)", "Heavy Armor", 17, 14, "Disadvantage", "—", 4, "55 lb.", "900 Sous d'argent"],
    ["Brass Vest (Panam)", "Light Armor", "11 + Dex modifier", "—", "—", "+2", "—", "4 lb.", "40 Sous d'argent"],
    ["Cog Shield (Panam)", "Shield", "+2", "—", "—", "+1", "—", "6 lb.", "20 Sous d'argent"],
    [],
    ["Boiler Plate: A suit of riveted plates fed by a small boiler."]
  ],
  "Additional Classes Spells Lists": [
    ["Wizard", "Cantrips (0 Level)", "1st Level"],
    [null, "Spark Rivet", "Steam Veil"],
    [],
    ["Artificer", "Cantrips (0 Level)", "1st Level"],
    [null, null, "Steam Veil"]
  ],
  "Additional Spells": [
    ["Spell", "Level", "School", "Casting Time", "Range", "Components", "Duration", "Description"],
    ["Spark Rivet", "Cantrip", "Evocation", "1 action", "Touch", "S, M (a rivet)", "Instantaneous", "A rivet glows and bites for 1d8 Lightning damage."],
    ["Steam Veil", 1, "Conjuration", "1 bonus action", "Self", "V, S", "Concentration, up to 1 Minute", "Hot steam hides you."]
  ],
  Tools: [["Tools", "Ability"], ["Boilermaker's Tools", "Strength"]],
  Skills: [["Skill", "Ability"], ["Athletics", "Strength"], [], ["Rail Lore", "Intelligence"]],
  "Adventuring Gear": [
    ["Item", "Description", "Weight", "Cost"],
    ["Pocket Gauge", "Reads the pressure of any pipe.", "1/4 lb.", "5 à 20 sous"],
    ["Rail Ticket", null, "-", "3 deniers"]
  ],
  Prostethics: [["Prosthetics", "Type", "Description", "Cost"], ["Piston Arm", "Mechanical", "A steam-driven arm.", "400 sous"]],
  "Firearm addons": [["Firearm Addon", "Properties", "Weight", "Cost"], ["Brass Scope", "Increases ranges by 10 feet.", "1 lb.", "200 Sous"]],
  Vehicles: [["Vehicle", "Description"], ["Rail Car", null]]
};
const classeur = () => ({ feuilles: Object.entries(FEUILLES).map(([nom, lignes]) => ({ nom, lignes: lignes.map((l) => [...l]) })) });
const construire = () => construireCatalogPanam(classeur(), { srd: SRD, edition: 7 });
const rec = (r, genre, nom) => r.layer.records[genre] && r.layer.records[genre][`${ID}:${genre}:en:${nom}`];

/* ── P1 ───────────────────────────────────────────────────────────────────────────────────────────── */
test("P1 — 📐 le catalog Panam est accepté par le juge d'Import a book ET par le montage", () => {
  const r = construire();
  const octets = JSON.stringify(r.layer);
  const v = verifierUnCatalog(octets);
  assert.equal(v.etat, "valide", JSON.stringify(v.fautes));
  assert.equal(v.id, "noirchicot-panam");
  assert.equal(r.layer.version, "7.0.0", "la version suit l'édition du classeur");
  assert.doesNotThrow(() => readLayer(new TextEncoder().encode(octets), "panam"));
  assert.deepEqual(Object.keys(r.layer.records).sort(), ["armor", "feat", "gear", "spell", "weapon"]);
  assert.equal(rec(r, "spell", "steam-veil").data.casting_time, "Bonus Action");
  assert.deepEqual(rec(r, "spell", "steam-veil").data.class_keys, ["Wizard", "Artificer"], "les listes de classes de l'onglet");
  assert.equal(rec(r, "spell", "steam-veil").data.duration, "Concentration, up to 1 minute");
  assert.equal(rec(r, "spell", "spark-rivet").data.level, 0);
  assert.equal(rec(r, "feat", "boiler-heart").data.prerequisite, "Prerequisite: Level 4+", "le prérequis lu sur la première ligne");
  assert.match(rec(r, "feat", "boiler-heart").data.description, /^Ability Score Increase\..*\n\nSteam Lungs\./s, "un paragraphe par titre");
  assert.equal(rec(r, "feat", "lantern-guard").data.description, "While you hold a lit lantern, you gain a +1 bonus to Armor Class.", "la ligne coupée du tableur recollée");
  const plate = rec(r, "armor", "boiler-plate").data;
  assert.deepEqual([plate.ac_base, plate.ac_dex_cap, plate.strength_min, plate.stealth_disadvantage, plate.damage_reduction], [17, 0, 14, true, 4]);
  assert.equal(plate.don_doff, "10 Minutes to Don and 5 Minutes to Doff");
  assert.equal(plate.description, "A suit of riveted plates fed by a small boiler.");
  assert.deepEqual([rec(r, "armor", "brass-vest").data.ac_dex_cap, rec(r, "armor", "brass-vest").data.ballistic_resistance], [null, 2]);
  assert.deepEqual([rec(r, "armor", "cog-shield").data.ac_bonus, rec(r, "armor", "cog-shield").data.ac_base], [2, null]);
});

/* ── P2 ───────────────────────────────────────────────────────────────────────────────────────────── */
test("P2 — 🪙 la monnaie de Panam se lit en GP et SP, sans rien inventer", () => {
  assert.equal(prix("750 Sous d'argent"), "750 GP");
  assert.equal(prix("1500 sous d'Argent"), "1500 GP");
  assert.equal(prix("1 sou"), "1 GP");
  assert.equal(prix("12000 Sous"), "12000 GP");
  assert.equal(prix("5 deniers"), "5 SP");
  assert.equal(prix("5 à 20 sous"), "5–20 GP", "une fourchette reste en mots");
  assert.equal(prix("1  denier à 1 sou"), "1 SP–1 GP");
  assert.equal(prix("—"), "—");
  assert.equal(prix("Variable"), "Variable");
  const r = construire();
  const pistolet = rec(r, "weapon", "gear-pistol").data;
  assert.equal(pistolet.cost, "120 GP");
  assert.equal(pistolet.cost_panam, "120 Sous d'argent", "le prix d'origine reste sur le record");
  assert.equal(rec(r, "gear", "rivets-20").data.cost, "4 SP");
  assert.match(r.restes.join("\n"), /sans prix lisible.*Pocket Gauge/);
});

/* ── P3 ───────────────────────────────────────────────────────────────────────────────────────────── */
test("P3 — 🧬 un record du SRD n'est pas réémis : comparé, et l'écart rapporté", () => {
  const r = construire();
  assert.equal(rec(r, "weapon", "pistol"), undefined, "⛔ le Pistol du SRD n'est pas réémis");
  assert.deepEqual(r.partages.includes("Pistol"), true);
  assert.match(r.ecarts.join("\n"), /^Pistol : propriétés .*Misfire, Firearm \(SRD Ammunition, Loading\)/m);
  assert.equal(rec(r, "feat", "defense"), undefined, "le style au texte du SRD n'entre pas");
  assert.deepEqual(r.identiques, ["Defense (SRD)"]);
  assert.equal(rec(r, "feat", "grappler"), undefined);
  assert.equal(rec(r, "feat", "grappler-panam").name, "Grappler (Panam)", "le texte diffère : il entre à côté, sous son nom");
  for (const id of Object.values(r.layer.records).flatMap((g) => Object.keys(g))) assert.ok(id.startsWith(`${ID}:`), id);
  const gp = rec(r, "weapon", "gear-pistol").data;
  assert.deepEqual(gp.property_list.map((p) => p.key), ["ammunition", "light", "finesse", "loading", "misfire", "firearm"]);
  assert.deepEqual(propriete("Ammunition (Range 30/90, bullet)"), { key: "ammunition", label: "Ammunition", detail: "Range 30/90; Bullet" });
  assert.deepEqual(propriete("Ammunition (60/240; bullet)"), { key: "ammunition", label: "Ammunition", detail: "Range 60/240; Bullet" });
  assert.equal(gp.ddb, "homebrew");
});

/* ── P4 ───────────────────────────────────────────────────────────────────────────────────────────── */
test("P4 — 📏 ce qu'un catalog ne porte pas se nomme, il ne se tait pas", () => {
  const r = construire();
  const lance = rec(r, "gear", "steam-lance");
  assert.ok(lance, "une arme de feu entre comme équipement");
  assert.match(lance.data.description, /^Damage: 2d6 fire\. Martial, Ranged weapon\./);
  const restes = r.restes.join("\n");
  assert.match(restes, /Steam Lance : dégâts « 2d6 fire »/);
  assert.match(restes, /Outils \(1\).*Boilermaker's Tools/);
  assert.match(restes, /Compétences \(2, dont 1 propres à Panam : Rail Lore\)/);
  assert.match(restes, /Véhicules \(1\)/);
  assert.match(restes, /Ballistic Resistance ou une Damage Reduction/);
});

/* ── P5 : un classeur .xlsx minimal, fabriqué ici (zip « stored ») ─────────────────────────────────── */
function zip(fichiers) {
  const locaux = [];
  const centraux = [];
  let decalage = 0;
  for (const [nom, contenu] of Object.entries(fichiers)) {
    const n = Buffer.from(nom);
    const d = Buffer.from(contenu);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4);
    local.writeUInt32LE(d.length, 18); local.writeUInt32LE(d.length, 22); local.writeUInt16LE(n.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt32LE(d.length, 20); central.writeUInt32LE(d.length, 24); central.writeUInt16LE(n.length, 28);
    central.writeUInt32LE(decalage, 42);
    locaux.push(local, n, d);
    centraux.push(central, n);
    decalage += 30 + n.length + d.length;
  }
  const cd = Buffer.concat(centraux);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(Object.keys(fichiers).length, 8); fin.writeUInt16LE(Object.keys(fichiers).length, 10);
  fin.writeUInt32LE(cd.length, 12); fin.writeUInt32LE(decalage, 16);
  return Buffer.concat([...locaux, cd, fin]);
}
const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function xlsx(feuilles) {
  const partagees = [];
  const idx = (s) => { if (!partagees.includes(s)) partagees.push(s); return partagees.indexOf(s); };
  const fichiers = {};
  const noms = Object.keys(feuilles);
  noms.forEach((nom, k) => {
    const lignes = feuilles[nom].map((l, i) => `<row r="${i + 1}">${l.map((v, j) => {
      if (v === null || v === undefined) return "";
      const ref = `${String.fromCharCode(65 + j)}${i + 1}`;
      return typeof v === "number" ? `<c r="${ref}"><v>${v}</v></c>` : `<c r="${ref}" t="s"><v>${idx(v)}</v></c>`;
    }).join("")}</row>`).join("");
    fichiers[`xl/worksheets/sheet${k + 1}.xml`] = `<?xml version="1.0"?><worksheet><sheetData>${lignes}</sheetData></worksheet>`;
  });
  fichiers["xl/workbook.xml"] = `<?xml version="1.0"?><workbook><sheets>${noms.map((n, k) => `<sheet name="${xml(n)}" sheetId="${k + 1}" r:id="rId${k + 1}"/>`).join("")}</sheets></workbook>`;
  fichiers["xl/_rels/workbook.xml.rels"] = `<?xml version="1.0"?><Relationships>${noms.map((_, k) => `<Relationship Id="rId${k + 1}" Target="worksheets/sheet${k + 1}.xml"/>`).join("")}</Relationships>`;
  fichiers["xl/sharedStrings.xml"] = `<?xml version="1.0"?><sst>${partagees.map((s) => `<si><t xml:space="preserve">${xml(s)}</t></si>`).join("")}</sst>`;
  return zip(fichiers);
}

test("P5 — 📗 le lecteur .xlsx lit un classeur : onglets nommés, chaînes partagées, nombres, cellules vides", () => {
  const w = lireXlsx(xlsx({ Un: [["a", null, 3], [], ["Ü & <b>"]], "Deux & trois": [["x"]] }));
  assert.deepEqual(w.feuilles.map((f) => f.nom), ["Un", "Deux & trois"]);
  assert.deepEqual(w.feuilles[0].lignes, [["a", null, 3], [], ["Ü & <b>"]]);
});

/* ── P6 ───────────────────────────────────────────────────────────────────────────────────────────── */
test("P6 — 🔌 le générateur écrit une couche que le moteur monte et allume ; sans classeur, il le dit", async () => {
  assert.ok(REPERTOIRES_HORS_DEPOT.includes("layers-livres"), "la sortie par défaut est hors du dépôt");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "panam-"));
  assert.throws(() => generate({ classeur: path.join(dir, "absent.xlsx"), sortie: path.join(dir, "x.json"), dirCouches: dir }), /est absent/);
  const chemin = path.join(dir, "Panam Steampunk Rules Compendium_Ed009.xlsx");
  fs.writeFileSync(chemin, xlsx(FEUILLES));
  const sortie = path.join(dir, "out", `${ID}.layer.json`);
  const r = generate({ classeur: chemin, sortie, dirCouches: dir });
  assert.equal(r.verdict.etat, "valide");
  assert.equal(JSON.parse(fs.readFileSync(sortie, "utf8")).version, "9.0.0");
  assert.match(r.message, /Import a book/);

  const { createTestDocument } = await import("./dom-stub.mjs");
  globalThis.document = createTestDocument();
  const { creerLibrairie, librairieAppareil, livresDuLieu } = await import("../ui/builder/magasin.mjs");
  const rayons = new Map();
  const rayon = (nom) => { if (!rayons.has(nom)) rayons.set(nom, new Map()); return rayons.get(nom); };
  const base = {
    lire: async (n, c) => (rayon(n).has(c) ? rayon(n).get(c) : null),
    ecrire: async (n, c, v) => { rayon(n).set(c, v); },
    effacer: async (n, c) => { rayon(n).delete(c); },
    tout: async (n) => [...rayon(n).entries()].map(([clef, valeur]) => ({ clef, valeur })),
    echanger: async (n, c, d) => { const s = d(rayon(n).has(c) ? rayon(n).get(c) : null); if (s !== undefined) rayon(n).set(c, s); }
  };
  const librairie = creerLibrairie(librairieAppareil(base));
  assert.deepEqual(await librairie.ranger(new Uint8Array(fs.readFileSync(sortie))), { ok: true, id: ID, nom: "Panam", auteur: "Noirchicot" });
  const vraiFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const p = String(url).split("?")[0];
    if (!fs.existsSync(p)) return { ok: false, status: 404, json: async () => null, arrayBuffer: async () => new ArrayBuffer(0) };
    const o = fs.readFileSync(p);
    return { ok: true, status: 200, arrayBuffer: async () => o.buffer.slice(o.byteOffset, o.byteOffset + o.byteLength), json: async () => JSON.parse(o.toString("utf8")) };
  };
  let engine;
  try {
    const { bootEngine } = await import("../ui/builder/engine.mjs");
    engine = await bootEngine({ root: ROOT, livresDuLieu: () => livresDuLieu(librairie) });
  } finally {
    globalThis.fetch = vraiFetch;
  }
  const pile = engine.layers.verbs.stack();
  assert.equal(pile.find((c) => c.id === ID).enabled, false, "monté ÉTEINT, comme tout livre");
  assert.ok(pile.findIndex((c) => c.id === ID) < pile.findIndex((c) => c.id === "fh-species-en"), "sous Fate's Hand");
  engine.layers.verbs.enable({ id: ID });
  assert.equal(engine.layers.verbs.query({ kind: "weapon", id: `${ID}:weapon:en:gear-pistol` }).record.name, "Gear Pistol");
  const styles = engine.layers.verbs.query({ kind: "feat" }).filter((v) => v.record.data.category === "fighting-style").map((v) => v.record.name);
  assert.ok(styles.includes("Lantern Guard") && styles.includes("Defense"), "le style de Panam rejoint ceux du SRD");
  fs.rmSync(dir, { recursive: true, force: true });
});
