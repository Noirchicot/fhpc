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
import { enPieces, valeurDUnObjetCrafte, recordDUneVariante } from "../ui/builder/craft.mjs";
import { recordProse } from "../ui/builder/equipment-step.mjs";
import { parseCout, enGP, fabriqueDeValeur } from "../ui/builder/equipement-pipeline.mjs";

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
  for (const s of [".bonus", ".powers[${k}]", ".plan", ".note", ".variant"]) {
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
  /* ⭐ LOT 277 — une ligne à VARIANTE se nomme par `nomDUneVariante`, dans la même fonction :
     la fenêtre s'élargit de ce bloc, elle ne s'ouvre pas à une autre fonction. */
  assert.match(ecran, /const nomDeLaLigne = \(l\) => \{[\s\S]{0,400}?return nomDUneVariante\([\s\S]{0,500}?return nomCrafte\(/,
    "⛔ l'écran compose le nom d'une ligne par `nomDUneVariante` puis `nomCrafte`, dans `nomDeLaLigne`");
  assert.match(moteur, /nomDUneVariante\(/, "⛔ le moteur nomme une variante par la même fonction");
  /* ⭐ LOT 277 — le nom passe par une variable (`nom`), variante ou recette : la ligne le prend. */
  assert.match(moteur, /: nomCrafte\(\{ base: view\.record\.name, bonus, pouvoirs \}\);[\s\S]{0,120}?name: nom,/,
    "⛔ le moteur aussi — deux compositions divergeraient au premier pouvoir");
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

/* ══ LOT 266 — LA FICHE X1 D'UN OBJET CRAFTÉ ══════════════════════════════════
   🔴 Eric, 25/09 : *« le texte de la breastplate +1 dit AC 14, pas bon ça »*. La
   fiche recopiait la BASE — son texte, ET son prix. */
const q = H.layers.verbs.query;
const rec = (kind, name) => q({ kind }).find((v) => v.record.name === name).record;

test("9 — 🔴 LE TEXTE D'UNE BREASTPLATE +1 DIT AC 15, et celui d'une arme dit son bonus et ses pouvoirs", () => {
  const plate = { record: rec("armor", "Breastplate") };
  assert.match(recordProse(plate), /^AC: 14$/m, "témoin : la Breastplate nue dit 14");
  const plus1 = recordProse(plate, { kind: "armor", bonus: "+1" });
  assert.match(plus1, /^AC: 15$/m, "⭐ la Breastplate +1 dit 15");
  assert.match(plus1, /^Bonus: \+1 to AC \(included above\)$/m);
  assert.doesNotMatch(plus1, /^AC: 14$/m, "⛔ et plus jamais 14");
  const flamme = rec("item", "Flame Tongue");
  const epee = recordProse({ record: rec("weapon", "Longsword") },
    { kind: "weapon", bonus: "+1", pouvoirs: [flamme], note: "Crafted by Nodren" });
  assert.match(epee, /^Bonus: \+1 to attack and damage rolls$/m);
  assert.match(epee, /^Flame Tongue\. /m, "⭐ chaque pouvoir apporte son propre texte");
  assert.match(epee, /^Crafted by Nodren$/m);
});

test("10 — 💰 LE PRIX D'UN OBJET CRAFTÉ EST SA VALEUR, pas celle de sa base — et `parseCout` le relit", () => {
  const plate = rec("armor", "Breastplate");
  const armure = rec("item", "Armor, +1, +2, or +3");
  const arme = rec("item", "Weapon, +1, +2, or +3");
  const longue = rec("weapon", "Longsword");
  const flamme = rec("item", "Flame Tongue");
  const lu = (x) => enGP(parseCout(x));
  assert.equal(lu(valeurDUnObjetCrafte({ base: plate, plan: armure, bonus: "+1" })), 4000 + 400,
    "⚖️ +1 Armor est RARE (4 000) + la Breastplate (400) — le SRD le dit du plan même");
  assert.equal(lu(valeurDUnObjetCrafte({ base: longue, plan: arme, bonus: "+1" })), 400 + 15, "+1 Weapon est Uncommon");
  assert.equal(lu(valeurDUnObjetCrafte({ base: longue, plan: arme, bonus: "+1", pouvoirs: [flamme] })), 400 * 4000 / 40 + 15,
    "⭐ la règle du craft : 400 × 4 000 ÷ 40, plus la base");
  assert.equal(valeurDUnObjetCrafte({ base: plate, bonus: "+1" }), null,
    "⛔ sans son plan, « +1 » ne dit pas sa rareté — pas de prix plausible");
  /* ⚔️ LE CAS QUI MORD : un bonus sans plan À CÔTÉ d'un pouvoir. Sans le refus, le
     pouvoir seul serait coté et le +1 passerait pour gratuit — un prix plausible et
     faux. (Sans pouvoir, l'assemblage est déjà illégal : ce témoin-là ne prouvait rien.) */
  assert.equal(valeurDUnObjetCrafte({ base: longue, bonus: "+1", pouvoirs: [flamme] }), null,
    "⛔ le +1 sans son plan ne devient pas gratuit à côté d'un pouvoir");
});

test("11 — 🔴 UNE LIGNE D'ÉQUIPEMENT SE LIT PAR ELLE-MÊME, jamais par sa base", () => {
  /* ⛔ Compté dans le code sans commentaires : `cherche.valeur(` ne vit plus que dans
     `valeurDeLaLigne` et dans le panier ; `recordProse(` que dans sa définition, le
     catalogue (un record, pas une ligne) et `proseDeLaLigne`. Un cinquième lecteur de
     ligne relirait la base — la panne de la Breastplate +1. */
  const ecran = lire("ui/builder/equipment-step.mjs");
  assert.equal((ecran.match(/cherche\.valeur\(/g) || []).length, 2, "valeurDeLaLigne + le panier");
  assert.equal((ecran.match(/recordProse\(/g) || []).length, 3, "la définition + le catalogue + proseDeLaLigne");
  assert.match(ecran, /const valeurX1 = valeurDeLaLigne\(ligne\)/);
  assert.match(ecran, /prose: proseDeLaLigne\(ligne\)/);
});

/* ══ LOT 277 — LE PLAN À VARIANTE ═══════════════════════════════════════════════
   ⚖️ Eric, 25/09 : cinq wondrous, « inclue les potions », « et la wand » — un objet, UNE
   variante. La ligne pointe sur le PLAN et porte le mot de sa variante. */

const IOUN = [
  { path: "gear[0]", ref: { kind: "item", id: "srd:item:en:ioun-stone" } },
  { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: false },
  { path: "gear[0].variant", value: "Awareness" },
  { path: "gear[0].note", value: "Crafted by Nodren" },
];

test("12 — ⭐ UNE LIGNE À VARIANTE SE NOMME PAR SA VARIANTE — rien d'orphelin, document valide", () => {
  const out = rebuild("craft-12", IOUN);
  const ligne = out.resolved.gear.find((g) => /Ioun/.test(g.name));
  assert.ok(ligne, "la Ioun Stone est dans `resolved.gear`");
  assert.equal(ligne.name, "Ioun Stone (Awareness)", "⭐ le nom se recompose depuis le plan et le mot");
  assert.deepEqual(out.unconsumed.filter((p) => p.startsWith("gear[0]")), [],
    "⛔ `gear[0].variant` est LU par le moteur — un chemin écrit et jamais relu serait une recette muette");
  assert.doesNotThrow(() => writers.assertValid(out.document, "craft-12"));
  /* ⭐ la potion « Standard » garde le nom de l'Adventuring Gear ; la wand prend son +N collé */
  let n = 0;
  const nom = (id, mot) => rebuild(`craft-12-${++n}`, [
    { path: "gear[0]", ref: { kind: "item", id } },
    { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: false },
    { path: "gear[0].variant", value: mot }]).resolved.gear[0].name;
  assert.equal(nom("srd:item:en:potions-of-healing", "Standard"), "Potion of Healing");
  assert.equal(nom("srd:item:en:potions-of-healing", "Greater"), "Potion of Healing (Greater)");
  assert.equal(nom("srd:item:en:wand-of-the-war-mage-1-2-or-3", "+2"), "Wand of the War Mage +2");
  /* ⛔ un mot que le record ne connaît plus garde son texte — il ne disparaît pas */
  assert.equal(nom("srd:item:en:ioun-stone", "Mystery"), "Ioun Stone (Mystery)");
});

test("13 — 🔴 L'ÉCRAN RELIT LA VARIANTE que la coquille écrit", () => {
  const lignes = currentGearLines({ build: { choices: IOUN } });
  assert.equal(lignes.length, 1);
  assert.equal(lignes[0].variante, "Awareness");
  assert.equal(lignes[0].ref.id, "srd:item:en:ioun-stone", "⭐ la ligne pointe sur le PLAN");
  assert.equal(estCrafte({ variante: "Awareness" }), true, "⭐ une variante est une recette");
  assert.equal(estCrafte({ variante: "  " }), false);
});

test("14 — 💰 LA LIGNE À VARIANTE VAUT L'OBJET FINI — et son texte dit sa variante", () => {
  /* ⭐ La chaîne RÉELLE de la porte `valeurDUneRecette` : `recordDUneVariante` puis l'organe
     de valeur de Wares (`fabriqueDeValeur`, lu par `cherche.valeur`). */
  const valeurDe = fabriqueDeValeur(q);
  const ioun = rec("item", "Ioun Stone");
  const soin = rec("item", "Potions of Healing");
  assert.equal(valeurDe(recordDUneVariante(ioun, "Awareness")).cout, "4,000 GP", "Rare : 4 000");
  assert.equal(valeurDe(recordDUneVariante(ioun, "Regeneration")).cout, "200,000 GP", "Legendary : le barème du SRD");
  assert.equal(valeurDe(recordDUneVariante(soin, "Superior")).cout, "2,000 GP", "⭐ une potion Rare vaut la MOITIÉ");
  assert.equal(valeurDe(ioun).cout, null, "⛔ témoin : le plan seul n'a pas de prix de catalogue");
  assert.equal(recordDUneVariante(ioun, "Mystery"), null, "⛔ un mot inconnu ne désigne aucun objet");
  /* ⚔️ ET LA PORTE LA PREND : dans `valeurDUneRecette`, une variante vaut son objet fini, ou
     RIEN — ⛔ jamais la cote d'un assemblage vide (le chemin de l'arme, qui rendrait `null`
     sans le dire, ou un prix plausible demain). */
  const ecran = lire("ui/builder/equipment-step.mjs");
  assert.match(ecran, /const valeurDUneRecette = \(rec, r\) => \{\s*const fini = r && r\.variante \? recordDUneVariante\(rec, r\.variante\) : null;\s*const v = cherche\.valeur\(fini \|\| rec\);\s*if \(!r\) return v;\s*if \(r\.variante\) return fini \? v : \{ cout: null, poids: v\.poids \};/);
  const texte = recordProse({ record: ioun }, { kind: "item", variante: "Awareness" });
  assert.match(texte, /^Variant: Awareness \(Rare\)$/m);
});

test("15 — ⚖️ LOT 280 : UN OBJET CRAFTÉ POSÉ VAUT SA COTE SRFH — prix, rareté affichée, note de craft", () => {
  /* ⭐ La chaîne de la porte `valeurDUneRecette` pour un objet crafté : `coteDUnObjetCrafte`,
     la même cote que l'encart de X5. */
  const longue = rec("weapon", "Longsword");
  const arme = rec("item", "Weapon, +1, +2, or +3");
  const flamme = rec("item", "Flame Tongue");
  const vicieux = rec("item", "Vicious Weapon");
  const lu = (x) => enGP(parseCout(x));
  assert.equal(lu(valeurDUnObjetCrafte({ base: longue, plan: arme, bonus: "+1", pouvoirs: [flamme] })), 40015,
    "2 + 4 = rang 6, Very Rare 40 000, + la Longsword");
  assert.equal(lu(valeurDUnObjetCrafte({ base: longue, pouvoirs: [flamme, vicieux] })), 200015,
    "4 + 4 = rang 8, Legendary 200 000");
  assert.equal(valeurDUnObjetCrafte({ base: longue, plan: arme, bonus: "+1", pouvoirs: [flamme, vicieux] }), null,
    "⛔ 2 + 4 + 4 = 10 : au-delà de Legendary+, pas de prix");
  const ecran = lire("ui/builder/equipment-step.mjs");
  assert.match(ecran, /const cote = coteDUnObjetCrafte\(\{ base: rec, plan: r\.plan, bonus: r\.bonus, pouvoirs: r\.pouvoirs \}\);[\s\S]{0,400}?rarete: cote\.categorie,\s*craft: \{ jours: cote\.jours, cout: cote\.craftUnitaire, rarete: cote\.categorie \}/,
    "⭐ la ligne craftée prend sa rareté et sa note de la cote");
});
