/* ══ 🗡️ LOT 383 — LES ACTIONS ET LES RESSOURCES, PREMIÈRE MARCHE : CE QUI EST DÉJÀ EN DONNÉES ════
   Mandat d'ARCHI 35 (30/09), tiré de l'étude 382. Décisions : Q1 → a (les dés de vie sont une
   ressource), Q2 → a (les emplacements restent dans `spellcasting.slots`, « un seul endroit par
   genre »), Q4 → a (la recharge partielle est une donnée : `shortRegain`), Q5 → a (catégorie
   `healing`). `current` vaut `max` à chaque dérivation : aucun écrivain tant qu'Eric n'a pas dit où
   vit l'état de jeu.

   LES TEXTES (SRD 5.2.1), déclarés dans `srfh-mecaniques-en` :
   · « Strength — Melee attack with a weapon » · « Dexterity — Ranged attack with a weapon » · « You
     add your Proficiency Bonus to your attack roll when you attack using a weapon you have
     proficiency with » (p.7) · « you add your ability modifier—the same modifier used for the attack
     roll—to the damage roll » (p.16) ;
   · Finesse, Thrown, Range, Versatile, Light — leurs records de propriété ;
   · Unarmed Strike, Opportunity Attacks, Hit Point Dice, Long Rest — leurs glossaires ;
   · Rage, Second Wind, Favored Enemy, Pact Magic — les aptitudes de leur classe.

   ── CE QUE CES GARDES TIENNENT, ET POURQUOI ELLES LISENT LA DONNÉE ─────────────────────────────
   1. Les armes contre les extraits : la dague (Finesse, Light, Thrown), le bâton (Versatile), l'arc
      (Ammunition, Range), une arme non maîtrisée, une arme maîtrisée par un CHOIX (Protector).
   2. Les compteurs : Rage (et sa recharge partielle), Second Wind (et son soin), Hunter's Mark.
   3. La Pact Magic du Warlock ; un lanceur plein garde le défaut.
   4. Les dés de vie.
   5. ⚔️ La donnée, pas le nom : sans la déclaration, pas de Rage ; une pile qui porte les glossaires
      sans leurs déclarations nomme chaque attaque ; une arme magique est déclarée, jamais chiffrée.
   6. Fate's Hand identique au SRD, prouvé par la pile : aucune couche FH ne touche une déclaration
      du lot, et le même personnage rend les mêmes actions et ressources dans les deux piles.
   7. Chaque extrait déclaré existe, à la lettre, dans le record qu'il cite.
   8. `current` = `max`, même quand la tranche d'avant disait autre chose.
   ⚔️ Chacune vue ROUGE sous une mutation (le rapport du lot 383 dit laquelle). */
import test from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";
import { makeHarness, manifestOf, readJson, uneCouche, PILE_SRD, SRD_FR, HOMEBREW } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";
import { PILE as PILE_FH } from "../src/tools/exemple-fh-en.mjs";

const ajv = new Ajv2020({ strict: true, allErrors: true });
const valider = ajv.compile(readJson("schemas/fh-char.schema.json"));
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
const SRD = makeHarness({ layers: PILE_SRD });
const FH = makeHarness({ layers: PILE_FH });

let numero = 0;
/** Un personnage de niveau 1 : une classe, six scores, des armes équipées, et d'autres choix. */
function perso({ h = SRD, classe, scores = {}, armes = [], plus = [], avant = null }) {
  numero += 1;
  const doc = writers.composer({ name: "Témoin", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(h.layers), id: `actions-383-${numero}`, at: "2026-09-30T00:00:00Z" });
  const six = ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: scores[k] ?? 10 }));
  const lignes = armes.flatMap(([id, quantite, extra = {}], i) => [
    { path: `gear[${i}]`, ref: { kind: "weapon", id: `srd:weapon:en:${id}` } },
    { path: `gear[${i}].quantity`, value: quantite },
    { path: `gear[${i}].equipped`, value: true },
    ...Object.entries(extra).map(([k, v]) => ({ path: `gear[${i}].${k}`, value: v }))
  ]);
  const choix = [{ path: "class", ref: { kind: "class", id: `srd:class:en:${classe}` } }, ...six, ...lignes, ...plus];
  const document = { ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...choix] } };
  if (avant) document.resolved = avant;
  const out = h.verbs.rebuild({ document });
  assert.equal(valider(out.document), true, ajv.errorsText(valider.errors));
  return out;
}
const action = (out, id) => out.resolved.actions.find((a) => a.id === id);
const ressource = (out, id) => out.resolved.resources.find((x) => x.id === id);

/* ══ 1 — LES ARMES, CONTRE LES EXTRAITS ════════════════════════════════════════════════════════ */

test("1 — la dague : Finesse (le meilleur de For et Dex), Thrown (sa portée), Light (l'attaque en plus, sans le modificateur)", () => {
  const out = perso({ classe: "fighter", scores: { str: 10, dex: 16 }, armes: [["dagger", 2]] });
  assert.deepEqual(action(out, "dagger"), {
    id: "dagger", name: "Dagger", economy: "action", category: "attack", ability: "dex", bonus: 5,
    damage: [{ dice: "1d4+3", type: "piercing" }], range: "Range 20/60",
    properties: ["Finesse", "Light", "Thrown (Range 20/60)"], gearId: "dagger"
  }, "« use your choice of your Strength or Dexterity modifier » : Dex +3, maîtrise +2 ; « the same modifier » aux dégâts");
  const bonus = action(out, "dagger:light");
  assert.equal(bonus.economy, "bonus", "« one extra attack as a Bonus Action »");
  assert.deepEqual(bonus.damage, [{ dice: "1d4", type: "piercing" }], "« you don’t add your ability modifier to the extra attack’s damage »");
  /* « unless that modifier is negative » */
  const faible = perso({ classe: "fighter", scores: { str: 8, dex: 6 }, armes: [["dagger", 2]] });
  assert.deepEqual(action(faible, "dagger:light").damage, [{ dice: "1d4-1", type: "piercing" }]);
  /* ⭐ une seule dague : pas d'« autre arme Light », pas d'attaque en plus */
  assert.equal(action(perso({ classe: "fighter", armes: [["dagger", 1]] }), "dagger:light"), undefined);
});

test("1b — le bâton (Versatile), l'arc long (Ammunition, portée), et la maîtrise lue en données", () => {
  const out = perso({ classe: "fighter", scores: { str: 16, dex: 14 }, armes: [["quarterstaff", 1], ["longbow", 1]] });
  const baton = action(out, "quarterstaff");
  assert.deepEqual([baton.ability, baton.bonus, baton.damage, baton.twoHandedDamage],
    ["str", 5, [{ dice: "1d6+3", type: "bludgeoning" }], [{ dice: "1d8+3", type: "bludgeoning" }]],
    "« The weapon deals that damage when used with two hands »");
  const arc = action(out, "longbow");
  assert.deepEqual([arc.ability, arc.bonus, arc.damage[0].dice, arc.range], ["dex", 4, "1d8+2", "Range 150/600; Arrow"],
    "« Dexterity — Ranged attack with a weapon »");
  /* une arme martiale NON maîtrisée : pas de bonus de maîtrise */
  const mage = perso({ classe: "wizard", scores: { str: 14 }, armes: [["longsword", 1]] });
  assert.equal(action(mage, "longsword").bonus, 2, "For +2, sans maîtrise : le magicien ne maîtrise pas l'épée longue");
  /* ⭐ maîtrisée par un CHOIX de capacité, lu en données (`weapon_proficiency_categories`) */
  const protecteur = perso({ classe: "cleric", scores: { str: 14 }, armes: [["longsword", 1]],
    plus: [{ path: "class.divine-order", value: "protector" }] });
  assert.equal(action(protecteur, "longsword").bonus, 4, "Protector : « proficiency with Martial weapons »");
  /* la maîtrise d'arme choisie */
  const maitre = perso({ classe: "fighter", armes: [["dagger", 1]],
    plus: [{ path: "class.weaponMastery[0]", ref: { kind: "weapon", id: "srd:weapon:en:dagger" } }] });
  assert.equal(action(maitre, "dagger").mastery, "Nick");
  assert.equal(action(perso({ classe: "fighter", armes: [["dagger", 1]] }), "dagger").mastery, undefined, "sans le choix, pas de maîtrise");
});

test("1c — l'Unarmed Strike et l'Opportunity Attack, lus sur leur glossaire", () => {
  const out = perso({ classe: "wizard", scores: { str: 14 } });
  assert.deepEqual(action(out, "unarmed-strike").damage, [{ dice: "3", type: "bludgeoning" }],
    "« Bludgeoning damage equal to 1 plus your Strength modifier »");
  assert.equal(action(out, "unarmed-strike").bonus, 4, "« your Strength modifier plus your Proficiency Bonus »");
  assert.deepEqual([action(out, "opportunity-attacks").economy, action(out, "opportunity-attacks").name],
    ["reaction", "Opportunity Attacks"], "« take a Reaction to make one melee attack »");
});

/* ══ 2 — LES COMPTEURS DES TABLES DE CLASSE ═════════════════════════════════════════════════════ */

test("2 — Rage : deux usages, un rendu au Short Rest, tous au Long Rest ; l'action en Bonus Action", () => {
  const out = perso({ classe: "barbarian", armes: [["greataxe", 1]] });
  assert.deepEqual(ressource(out, "rages"), { id: "rages", name: "Rages", max: 2, current: 2, recharge: "long", shortRegain: 1 },
    "« You regain one expended use when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest »");
  assert.deepEqual(action(out, "rages"), { id: "rages", name: "Rage", economy: "bonus", category: "utility", resourceId: "rages",
    text: "You can enter it as a Bonus Action if you aren’t wearing Heavy armor." });
});

test("2b — Second Wind : le soin, « 1d10 plus your Fighter level » ; Hunter's Mark du Ranger", () => {
  const out = perso({ classe: "fighter" });
  assert.deepEqual(ressource(out, "second_wind"), { id: "second_wind", name: "Second Wind", max: 2, current: 2, recharge: "long", shortRegain: 1 });
  const sw = action(out, "second_wind");
  assert.deepEqual([sw.economy, sw.category, sw.healing, sw.resourceId], ["bonus", "healing", { dice: "1d10+1" }, "second_wind"]);
  const rodeur = perso({ classe: "ranger" });
  assert.deepEqual(ressource(rodeur, "favored_enemy"), { id: "favored_enemy", name: "Favored Enemy", max: 2, current: 2, recharge: "long" },
    "« you regain all expended uses of this ability when you finish a Long Rest » : pas de recharge partielle");
  assert.deepEqual([action(rodeur, "hunter-s-mark").name, action(rodeur, "hunter-s-mark").resourceId], ["Hunter’s Mark", "favored_enemy"]);
});

/* ══ 3 — LA PACT MAGIC ══════════════════════════════════════════════════════════════════════════ */

test("3 — la Pact Magic du Warlock : un emplacement de niveau 1, rendu au Short Rest", () => {
  const out = perso({ classe: "warlock", scores: { cha: 14 } });
  assert.deepEqual(out.resolved.spellcasting.slots, { 1: { max: 1, current: 1 } });
  assert.equal(out.resolved.spellcasting.slotsRecharge, "short",
    "« You regain all expended Pact Magic spell slots when you finish a Short or Long Rest »");
  assert.equal(out.underived.some((u) => u.field === "spellcasting.slots"), false, "plus de « progression sans emplacements »");
  const mage = perso({ classe: "wizard", scores: { int: 14 } });
  assert.equal("slotsRecharge" in mage.resolved.spellcasting, false, "un lanceur plein garde le défaut du schéma (long)");
});

/* ══ 4 — LES DÉS DE VIE ═════════════════════════════════════════════════════════════════════════ */

test("4 — les dés de vie : une ressource (Q1 → a), le dé de la classe, un au niveau 1, rendus au Long Rest", () => {
  for (const [classe, de] of [["fighter", "d10"], ["barbarian", "d12"], ["wizard", "d6"]]) {
    assert.deepEqual(ressource(perso({ classe }), "hit-point-dice"),
      { id: "hit-point-dice", name: "Hit Point Dice", max: 1, current: 1, recharge: "long", die: de },
      `${classe} : « At level 1, your character has 1 Hit Die » · « all spent Hit Point Dice »`);
  }
});

/* ══ 5 — LA DONNÉE, PAS LE NOM ══════════════════════════════════════════════════════════════════ */

test("5 — ⚔️ sans la déclaration de la table, pas de Rage : la décision est dans la donnée", () => {
  const h = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-sans-compteur", {
    "class-progression": { "srd:class-progression:en:barbarian": { op: "patch", changes: { "data[resource_uses]": [] } } }
  }) });
  const out = perso({ h, classe: "barbarian" });
  assert.equal(ressource(out, "rages"), undefined);
  assert.equal(action(out, "rages"), undefined);
  assert.ok(ressource(out, "hit-point-dice"), "le reste ne bouge pas");
});

test("5b — une pile qui porte les glossaires SANS leurs déclarations (la française) nomme chaque attaque et les dés de vie", () => {
  const out = perso({ h: makeHarness({ layers: [SRD_FR, HOMEBREW] }), classe: "wizard", armes: [["dagger", 1]] });
  assert.deepEqual(out.resolved.actions, [], "⛔ jamais un chiffre deviné");
  const dit = (champ) => out.underived.find((u) => u.field === champ);
  assert.equal(dit("actions[dagger]").key, "underived.weapon-attack-undeclared");
  assert.equal(dit("actions[unarmed-strike]").key, "underived.sheet-action-undeclared");
  assert.equal(dit("resources[hit-point-dice]").key, "underived.sheet-resource-undeclared");
});

test("5c — une arme magique (+1) est DÉCLARÉE, jamais chiffrée sans son bonus", () => {
  const out = perso({ classe: "fighter", armes: [["longsword", 1, { bonus: "+1" }]] });
  assert.equal(action(out, "longsword"), undefined);
  assert.equal(out.underived.find((u) => u.field === "actions[longsword]").key, "underived.magic-weapon-attack");
});

/* ══ 6 — FATE'S HAND IDENTIQUE AU SRD, PROUVÉ PAR LA PILE ═══════════════════════════════════════ */

test("6 — aucune couche Fate's Hand ne touche un record que les déclarations du lot lisent", () => {
  const meca = readJson("layers/srfh-mecaniques-en.layer.json").records;
  const lus = [
    ...["attack-roll", "unarmed-strike", "opportunity-attacks", "hit-point-dice", "long-rest"].map((s) => ["glossary", `srd:glossary:en:${s}`]),
    ...Object.keys(meca["class-progression"]).map((id) => ["class-progression", id])
  ];
  assert.ok(meca["class-progression"]["srd:class-progression:en:warlock"], "témoin : la liste lit la couche");
  const fautes = [];
  for (const fichier of PILE_FH.filter((f) => /\/fh-/.test(f))) {
    const records = readJson(fichier).records || {};
    for (const [genre, id] of lus) if (records[genre] && records[genre][id]) fautes.push(`${fichier} → ${genre}/${id}`);
  }
  assert.deepEqual(fautes, [], "« Fate's Hand changes nothing here » (Equipment) ; les compteurs du niveau 1 non plus (étude 382)");
});

test("6b — le même personnage rend les mêmes actions et ressources dans les deux piles", () => {
  for (const [classe, armes] of [["fighter", [["dagger", 2], ["longbow", 1]]], ["barbarian", [["greataxe", 1]]], ["warlock", [["dagger", 1]]]]) {
    const srd = perso({ classe, armes, scores: { str: 14, dex: 14, cha: 14 } });
    const fh = perso({ h: FH, classe, armes, scores: { str: 14, dex: 14, cha: 14 } });
    assert.deepEqual(fh.resolved.actions, srd.resolved.actions, `${classe} : actions`);
    assert.deepEqual(fh.resolved.resources, srd.resolved.resources, `${classe} : ressources`);
    assert.deepEqual(fh.resolved.spellcasting && fh.resolved.spellcasting.slots, srd.resolved.spellcasting && srd.resolved.spellcasting.slots);
  }
});

/* ══ 7 — CHAQUE EXTRAIT EXISTE, À LA LETTRE ═════════════════════════════════════════════════════ */

test("7 — chaque extrait déclaré par le lot est recopié du record qu'il cite", () => {
  const srd = readJson("layers/srd-5.2.1-en.layer.json").records;
  const meca = readJson("layers/srfh-mecaniques-en.layer.json").records;
  const texte = (genre, id) => JSON.stringify(srd[genre][id].data);
  const verifies = [];
  const wa = meca.glossary["srd:glossary:en:attack-roll"].changes["data[weapon_attack]"];
  for (const decl of Object.values(wa.properties).flatMap((p) => Object.values(p))) {
    assert.ok(texte("weapon-property", decl.record).includes(JSON.stringify(decl.extrait).slice(1, -1)), decl.record);
    verifies.push(decl.record);
  }
  for (const slug of ["unarmed-strike", "opportunity-attacks"]) {
    const d = meca.glossary[`srd:glossary:en:${slug}`].changes["data[sheet_action]"];
    assert.ok(srd.glossary[`srd:glossary:en:${slug}`].data.description.includes(d.extrait), slug);
    verifies.push(slug);
  }
  const hd = meca.glossary["srd:glossary:en:hit-point-dice"].changes["data[sheet_resource]"];
  for (const e of hd.extraits.filter((x) => x.record)) assert.ok(srd.glossary[e.record].data.description.includes(e.text), e.record);
  for (const [id, entree] of Object.entries(meca["class-progression"])) {
    const classe = srd.class[srd["class-progression"][id].data.class].data.features;
    for (const [cle, valeur] of Object.entries(entree.changes)) {
      for (const u of Array.isArray(valeur) ? valeur : [valeur]) {
        const f = classe.find((x) => x.name === u.feature);
        assert.ok(f, `${id} : l'aptitude « ${u.feature} » existe`);
        assert.ok(f.description.includes(u.extrait), `${id} ${cle} : ${u.extrait}`);
        if (u.action && !u.action.spell) assert.ok(f.description.includes(u.action.extrait), `${id} : ${u.action.extrait}`);
        if (u.action && u.action.spell) {
          assert.ok(f.description.includes(u.action.extrait), `${id} : ${u.action.extrait}`);
          assert.equal(srd.spell[u.action.spell].data.casting_time, u.action.economy_extrait);
        }
        verifies.push(`${id} ${u.feature}`);
      }
    }
  }
  assert.equal(verifies.length, 11, `témoin : ${verifies.join(" · ")}`);
});

/* ══ 8 — `current` = `max` ══════════════════════════════════════════════════════════════════════ */

test("8 — ⏳ `current` vaut `max` à chaque dérivation, même si la tranche d'avant disait autre chose", () => {
  const premier = perso({ classe: "barbarian" });
  const avant = structuredClone(premier.resolved);
  for (const r of avant.resources) r.current = 0;
  const second = perso({ classe: "barbarian", avant });
  for (const r of second.resolved.resources) assert.equal(r.current, r.max, `${r.id} : aucun écrivain de \`current\` (ARCHI 35)`);
});

/* ══ 9 — LA FICHE TEMPORAIRE LES MONTRE, SANS UN CALCUL ═════════════════════════════════════════ */

test("9 — la fiche montre chaque action et chaque ressource avec les chiffres du moteur", async () => {
  const { createTestDocument } = await import("./dom-stub.mjs");
  globalThis.document = createTestDocument();
  const { renderFicheTemporaire } = await import("../ui/builder/fiche-temporaire.mjs");
  const out = perso({ classe: "fighter", scores: { str: 10, dex: 16 }, armes: [["dagger", 2], ["quarterstaff", 1]] });
  const node = renderFicheTemporaire({ resolved: out.resolved, report: out, document: out.document, flags: [] });
  const lignes = (cle) => node.querySelector(`[data-rubrique="${cle}"]`).querySelectorAll(".perso-ligne")
    .map((li) => `${li.querySelector(".perso-ligne-nom").textContent} | ${li.querySelector(".perso-ligne-valeur")?.textContent ?? ""}`);
  const actions = lignes("actions");
  assert.ok(actions.includes("Dagger | Action · +5 · 1d4+3 piercing · Range 20/60"), actions.join("\n"));
  assert.ok(actions.includes("Dagger | Bonus Action · +5 · 1d4 piercing · Range 20/60"), actions.join("\n"));
  assert.ok(actions.includes("Quarterstaff | Action · +2 · 1d6 bludgeoning · 1d8 bludgeoning two-handed"), actions.join("\n"));
  assert.ok(actions.includes("Second Wind | Bonus Action · heals 1d10+1"), actions.join("\n"));
  const ressources = lignes("resources");
  assert.deepEqual(ressources, [
    "Hit Point Dice | 1 of 1 · d10 · long rest",
    "Second Wind | 2 of 2 · long rest · 1 back on a short rest"
  ]);
  /* ce qui reste en prose se dit : la rubrique est partielle, pas complète */
  assert.equal(node.querySelector('[data-rubrique="actions"]').querySelector('[data-absence="partielle"]') !== null, true);
});
