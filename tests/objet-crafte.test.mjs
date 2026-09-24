/* ══ L'OBJET CRAFTÉ ENTRE DANS LA FICHE — lot 265 ════════════════════════════

   ⚖️ Eric, 25/09 : *« l'objet crafté va dans l'équipement du personnage et par
   extension il existe à cette table de jeu »* — puis 1 a · 2 a · 3 a : le craft
   se PAIE, l'objet arrive TOUT DE SUITE, le site ne STOCKE rien.

   ⭐ CE QUE CES GARDES TIENNENT : la fiche garde la RECETTE (base + bonus +
   pouvoirs), le moteur en recompose le NOM et la CA, l'écran nomme la ligne par
   la MÊME fonction, et ce que la coquille écrit est exactement ce que le lecteur
   relit. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { makeHarness, manifestOf, readJson, PILE_SRD } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";
import { nomCrafte, lireLeBonus, estCrafte, NOM_MAX } from "../src/build/objet-crafte.mjs";
import { currentGearLines } from "../ui/builder/equipment-step.mjs";
import { enPieces } from "../ui/builder/craft.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => fs.readFileSync(path.join(ROOT, f), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const H = makeHarness({ layers: PILE_SRD });
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
const CLASSE = { path: "class", ref: { kind: "class", id: "srd:class:en:barbarian" } };
const SIX = ABILITY_KEYS.map((clef) => ({ path: `abilities.${clef}`, value: 12 }));
function neuf(id) {
  return writers.composer({ name: "Nodren", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(H.layers), id, at: "2026-09-25T00:00:00Z" });
}
const avec = (doc, choices) => ({ ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...choices] } });
const rebuild = (id, choix) => H.verbs.rebuild({ document: avec(neuf(id), [CLASSE, ...SIX, ...choix]) });

/* La ligne telle que `addGearLine` l'écrit pour un objet crafté. */
const LONGSWORD_CRAFTEE = [
  { path: "gear[0]", ref: { kind: "weapon", id: "srd:weapon:en:longsword" } },
  { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: false },
  { path: "gear[0].bonus", value: "+1" },
  { path: "gear[0].powers[0]", ref: { kind: "item", id: "srd:item:en:flame-tongue" } },
  { path: "gear[0].powers[1]", ref: { kind: "item", id: "srd:item:en:vicious-weapon" } },
  { path: "gear[0].plan", ref: { kind: "item", id: "srd:item:en:weapon-1-2-or-3" } },
  { path: "gear[0].note", value: "Crafted by Nodren" },
];

test("1 — ⭐ LE NOM D'UN OBJET CRAFTÉ : la base, le bonus, les pouvoirs — et il tient dans le schéma", () => {
  assert.equal(nomCrafte({ base: "Longsword", bonus: "+1", pouvoirs: ["Flame Tongue", "Vicious Weapon"] }),
    "Longsword +1 (Flame Tongue, Vicious Weapon)");
  assert.equal(nomCrafte({ base: "Breastplate", bonus: "+2" }), "Breastplate +2");
  assert.equal(nomCrafte({ base: "Dagger", pouvoirs: ["Dagger of Venom"] }), "Dagger (Dagger of Venom)");
  assert.equal(nomCrafte({ base: "Rope" }), "Rope", "⛔ sans bonus ni pouvoir, l'objet garde le nom de sa base");
  const long = nomCrafte({ base: "Longsword", bonus: "+3", pouvoirs: ["x".repeat(80), "y".repeat(80)] });
  assert.ok(long.length <= NOM_MAX, `📏 ${long.length} ≤ ${NOM_MAX} — le schéma refuse au-delà, et un document refusé ne se sauve pas`);
  assert.equal(lireLeBonus("+2"), 2);
  for (const mou of ["+0", "2", "+10", "", null, 1]) assert.equal(lireLeBonus(mou), null, `⛔ « ${mou} » n'est pas un bonus`);
  assert.equal(estCrafte({ bonus: "+1" }), true);
  assert.equal(estCrafte({ pouvoirs: [] }), false);
});

test("2 — 🔴 LA FICHE GARDE LA RECETTE, le moteur la RECOMPOSE — nom, note, rien d'orphelin, document valide", () => {
  const out = rebuild("craft-2", LONGSWORD_CRAFTEE);
  const ligne = out.resolved.gear.find((g) => g.id === "longsword" || /Longsword/.test(g.name));
  assert.ok(ligne, "la Longsword craftée est dans `resolved.gear`");
  assert.equal(ligne.name, "Longsword +1 (Flame Tongue, Vicious Weapon)",
    "⭐ le nom se recompose depuis la recette — ⛔ il n'est écrit nulle part dans `build`");
  assert.equal(ligne.note, "Crafted by Nodren", "⭐ « forgé par » suit l'objet");
  const orphelins = out.unconsumed.filter((p) => p.startsWith("gear[0]"));
  assert.deepEqual(orphelins, [], "⛔ aucun chemin de la recette ne reste orphelin : le moteur les LIT tous");
  assert.doesNotThrow(() => writers.assertValid(out.document, "craft-2"), "⭐ et le document valide `fh-char/1` sans révision");
});

test("3 — ⚖️ UNE ARMURE +1 PORTÉE DONNE +1 À LA CA — le SRD le dit du plan même", () => {
  const plate = (bonus, id) => rebuild(id, [
    { path: "gear[0]", ref: { kind: "armor", id: "srd:armor:en:breastplate" } },
    { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: true },
    ...(bonus ? [{ path: "gear[0].bonus", value: bonus }] : [])]);
  const nue = plate(null, "craft-3a").resolved.ac;
  assert.ok(Number.isInteger(nue), `témoin : la Breastplate seule donne une CA (${nue})`);
  assert.equal(plate("+1", "craft-3b").resolved.ac, nue + 1, "⭐ +1");
  assert.equal(plate("+3", "craft-3c").resolved.ac, nue + 3, "⭐ +3");
  assert.equal(plate("+9", "craft-3d").resolved.ac, nue, "⛔ un bonus illisible n'ajoute RIEN — il ne devine pas");
});

test("4 — ⛔ UN POUVOIR ABSENT DE LA PILE NE FAIT PAS TOMBER LE PERSONNAGE", () => {
  /* Le personnage voyage : une table qui n'a pas la couche d'un pouvoir doit
     quand même l'ouvrir. Le pouvoir garde son id, le reste de la fiche joue. */
  const out = rebuild("craft-4", [
    { path: "gear[0]", ref: { kind: "weapon", id: "srd:weapon:en:longsword" } },
    { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: false },
    { path: "gear[0].powers[0]", ref: { kind: "item", id: "homebrew:item:en:absent" } }]);
  const ligne = out.resolved.gear[0];
  assert.match(ligne.name, /^Longsword \(homebrew:item:en:absent\)$/);
});

test("5 — 🔴 CE QUE LA COQUILLE ÉCRIT EST CE QUE LE LECTEUR RELIT — la paire se lit dans le code", () => {
  /* ⚠️ `addGearLine` vit dans `shell.mjs`, qui n'exporte rien. Ce garde lit donc
     les chemins QU'IL ÉCRIT, puis les donne au lecteur réel de l'écran : un chemin
     écrit et jamais relu serait une recette muette sur la fiche. */
  const shell = lire("ui/builder/shell.mjs");
  const bloc = shell.slice(shell.indexOf('action.kind === "addGearLine"'), shell.indexOf('action.kind === "placerGearLine"'));
  const ecrits = [...bloc.matchAll(/path: `gear\[\$\{index\}\]([^`]*)`/g)].map((m) => m[1]);
  for (const s of [".bonus", ".powers[${k}]", ".plan", ".note"]) {
    assert.ok(ecrits.includes(s), `⛔ addGearLine n'écrit plus « ${s} » — ${ecrits.join(" · ")}`);
  }
  const lignes = currentGearLines({ build: { choices: LONGSWORD_CRAFTEE } });
  assert.equal(lignes.length, 1);
  assert.equal(lignes[0].bonus, "+1");
  assert.deepEqual(lignes[0].pouvoirs.map((r) => r.id), ["srd:item:en:flame-tongue", "srd:item:en:vicious-weapon"]);
  assert.equal(lignes[0].plan.id, "srd:item:en:weapon-1-2-or-3");
  assert.equal(lignes[0].note, "Crafted by Nodren");
  assert.equal(lignes[0].ref.id, "srd:weapon:en:longsword", "⛔ un pouvoir ne remplace PAS la base de la ligne");
});

test("6 — ⭐ L'ÉCRAN ET LE MOTEUR NOMMENT LA LIGNE PAR LA MÊME FONCTION", () => {
  const ecran = lire("ui/builder/equipment-step.mjs");
  const moteur = lire("src/build/derive.mjs");
  assert.match(ecran, /const nomDeLaLigne = \(l\) => \{[\s\S]{0,400}?return nomCrafte\(/,
    "⛔ l'écran compose le nom d'une ligne par `nomCrafte`, dans `nomDeLaLigne`");
  assert.match(moteur, /name: nomCrafte\(/, "⛔ le moteur aussi — deux compositions divergeraient au premier pouvoir");
});

test("7 — 💰 CE QUE LA BOURSE PAIE EST CE QUE L'ÉCRAN AFFICHE", () => {
  assert.deepEqual(enPieces(4007.5), { pp: 0, gp: 4008, sp: 0, cp: 0 }, "⭐ l'arrondi de l'écran (« 4,008 GP »)");
  assert.deepEqual(enPieces(0.5), { pp: 0, gp: 0, sp: 5, cp: 0 });
  assert.deepEqual(enPieces(0.02), { pp: 0, gp: 0, sp: 0, cp: 2 });
  for (const rien of [0, -3, NaN, Infinity]) assert.equal(enPieces(rien), null, `⛔ ${rien} ne se paie pas`);
});

test("8 — 🔴 UNE LIGNE D'ÉQUIPEMENT N'A QU'UN ÉCRIVAIN DE NOM — l'écran R, le sac et le tri", () => {
  /* 🔴 Vu au navigateur, lot 265 : la Breastplate +1 craftée s'appelait « Breastplate »
     dans le sac, parce que le sac nommait la ligne par `rec.name`, à côté. ⛔ Une liste
     par nom des écrans serait incomplète par construction : ce garde compte les
     FABRICATIONS du nom d'une ligne `gear` (le repli `motDUnRecordAbsent(l.ref.id)`),
     et n'en tolère qu'une hors panier — celle de `nomDeLaLigne`. */
  const ecran = lire("ui/builder/equipment-step.mjs");
  const fabriques = (ecran.match(/motDUnRecordAbsent\(l\.ref\.id\)/g) || []).length;
  const panier = (ecran.match(/currentCartLines\(docu\)\.map\(\(l\) => \{[\s\S]{0,160}?motDUnRecordAbsent\(l\.ref\.id\)/g) || []).length;
  assert.equal(panier, 1, "témoin : le panier (des lignes `cart`, pas `gear`) nomme les siennes");
  assert.equal(fabriques - panier, 1, `⛔ ${fabriques - panier} fabrications du nom d'une ligne gear — une seule doit rester, dans \`nomDeLaLigne\``);
  assert.ok((ecran.match(/nomDeLaLigne\b/g) || []).length >= 4, "⭐ défini une fois, appelé par R, le sac et le tri");
});
