/* ══ 🗡️ LOT 384 — ACTIONS ET RESSOURCES, DEUXIÈME MARCHE : LA PROSE DU SRD MISE EN DONNÉES ══════
   Mandat d'ARCHI 35 (30/09). Les sources du niveau 1 à économie standard (action, action bonus,
   réaction), chacune par un extrait typé DÉCLARÉ dans `srfh-mecaniques-en` — une forme d'usage lue à
   quatre endroits : la progression (`resource_uses`), l'espèce (`trait_uses`), l'option de lignée
   (`lineage_effects[<id>].uses`), le don (`sheet_uses`, `spell_uses`). Martial Arts a sa propre
   déclaration (`martial_arts`), condition comprise. Ce qui se joue hors des trois cases attend Q3
   (reportée au dessin du Companion V2) et se DÉCLARE avec cette raison, sans chiffre.

   ── CE QUE CES GARDES TIENNENT ────────────────────────────────────────────────────────────────
   1. Chaque source contre son extrait : usages, recharge, économie, dé.
   2. Les formules suivent le personnage : le Charisma (minimum 1), le bonus de maîtrise, le niveau.
   3. Martial Arts, et sa condition : ni armure, ni arme qui ne soit de moine.
   4. Les sources en attente de Q3 : déclarées, sans ressource ni action.
   5. Fate's Hand suit sa pile : l'Humain FH n'a pas Resourceful, parce que sa couche le RETIRE.
   6. ⚔️ La déclaration, pas le nom : une couche de scénario qui retire ou change une déclaration
      change la fiche.
   7. Chaque extrait existe, à la lettre, dans le texte qu'il cite.
   8. La fiche temporaire les montre.
   ⚔️ Chacune vue ROUGE sous une mutation (le rapport du lot 384 dit laquelle). */
import test from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";
import { makeHarness, manifestOf, readJson, uneCouche, PILE_SRD } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";
import { PILE as PILE_FH } from "../src/tools/exemple-fh-en.mjs";

const ajv = new Ajv2020({ strict: true, allErrors: true });
const valider = ajv.compile(readJson("schemas/fh-char.schema.json"));
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
const SRD = makeHarness({ layers: PILE_SRD });
const FH = makeHarness({ layers: PILE_FH });

let numero = 0;
function perso({ h = SRD, classe, espece, lignee, niveau, scores = {}, gear = [], plus = [] }) {
  numero += 1;
  const doc = writers.composer({ name: "Témoin", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(h.layers), id: `actions-384-${numero}`, at: "2026-09-30T00:00:00Z" });
  const choix = [{ path: "class", ref: { kind: "class", id: `srd:class:en:${classe}` } },
    ...ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: scores[k] ?? 12 }))];
  if (espece) choix.push({ path: "species", ref: { kind: "species", id: `srd:species:en:${espece}` } });
  if (lignee) choix.push({ path: "species.lineage[0]", value: lignee });
  gear.forEach(([kind, id], i) => choix.push({ path: `gear[${i}]`, ref: { kind, id } },
    { path: `gear[${i}].quantity`, value: 1 }, { path: `gear[${i}].equipped`, value: true }));
  const base = doc.build.choices.filter((c) => !(niveau && c.path === "level"));
  if (niveau) base.push({ path: "level", value: niveau });
  const out = h.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...base, ...choix, ...plus] } } });
  /* ⚠️ au-delà du niveau 1, les PV des niveaux suivants sont des CHOIX que le Level up n'écrit pas
     encore : le document ne passe pas le schéma (`vitals.hpMax`). Les cas qui montent de niveau ne
     mesurent qu'une formule d'usages ; ils ne valident pas le document. */
  if (!niveau) assert.equal(valider(out.document), true, ajv.errorsText(valider.errors));
  return out;
}
const action = (out, id) => out.resolved.actions.find((a) => a.id === id);
const ressource = (out, id) => out.resolved.resources.find((x) => x.id === id);
const declare = (out, champ) => out.underived.find((u) => u.field === champ);

/* ══ 1 — LES CLASSES ═══════════════════════════════════════════════════════════════════════════ */

test("1 — Bardic Inspiration : « equal to your Charisma modifier (minimum of once) », le d6, en action bonus", () => {
  const barde = perso({ classe: "bard", scores: { cha: 16 } });
  assert.deepEqual(ressource(barde, "bardic-inspiration"),
    { id: "bardic-inspiration", name: "Bardic Inspiration", max: 3, current: 3, recharge: "long", die: "d6" });
  assert.deepEqual([action(barde, "bardic-inspiration").economy, action(barde, "bardic-inspiration").resourceId], ["bonus", "bardic-inspiration"]);
  assert.equal(ressource(perso({ classe: "bard", scores: { cha: 8 } }), "bardic-inspiration").max, 1, "« minimum of once »");
});

test("1b — Innate Sorcery (« twice ») et Lay On Hands (« five times your Paladin level », un soin)", () => {
  assert.deepEqual(ressource(perso({ classe: "sorcerer" }), "innate-sorcery"),
    { id: "innate-sorcery", name: "Innate Sorcery", max: 2, current: 2, recharge: "long" });
  const paladin = perso({ classe: "paladin" });
  assert.deepEqual(ressource(paladin, "lay-on-hands"), { id: "lay-on-hands", name: "Lay On Hands", max: 5, current: 5, recharge: "long" });
  assert.deepEqual([action(paladin, "lay-on-hands").economy, action(paladin, "lay-on-hands").category], ["bonus", "healing"]);
  assert.equal(action(paladin, "lay-on-hands").healing, undefined, "la dépense est variable : c'est le jeu qui la choisira");
  assert.equal(ressource(perso({ classe: "paladin", niveau: 3 }), "lay-on-hands").max, 15, "5 × 3");
});

test("1c — Martial Arts : le d6 et la Dextérité sur l'Unarmed Strike, et la même en action bonus", () => {
  const moine = perso({ classe: "monk", scores: { str: 10, dex: 16 } });
  for (const id of ["unarmed-strike", "unarmed-strike:bonus"]) {
    const a = action(moine, id);
    assert.deepEqual([a.ability, a.bonus, a.damage], ["dex", 5, [{ dice: "1d6+3", type: "bludgeoning" }]], id);
  }
  assert.equal(action(moine, "unarmed-strike:bonus").economy, "bonus", "« You can make an Unarmed Strike as a Bonus Action. »");
});

test("1d — Martial Arts ne vaut ni en armure, ni avec une arme qui n'est pas de moine : DÉCLARÉ, jamais chiffré", () => {
  const armure = perso({ classe: "monk", scores: { dex: 16 }, gear: [["armor", "srd:armor:en:leather-armor"]] });
  assert.equal(action(armure, "unarmed-strike:bonus"), undefined);
  assert.equal(action(armure, "unarmed-strike").damage[0].dice, "2", "l'Unarmed Strike garde sa forme de base (1 + For)");
  assert.equal(declare(armure, "actions[unarmed-strike:bonus]").key, "underived.martial-arts-condition-unmet");
  const epee = perso({ classe: "monk", scores: { dex: 16 }, gear: [["weapon", "srd:weapon:en:longsword"]] });
  assert.equal(action(epee, "unarmed-strike:bonus"), undefined, "Longsword : Martial Melee, pas Light");
  const dague = perso({ classe: "monk", scores: { dex: 16 }, gear: [["weapon", "srd:weapon:en:dagger"]] });
  assert.ok(action(dague, "unarmed-strike:bonus"), "une dague est une arme de moine (Simple Melee)");
});

/* ══ 2 — LES ESPÈCES ET LES LIGNÉES ════════════════════════════════════════════════════════════ */

test("2 — Stonecunning, Adrenaline Rush : « equal to your Proficiency Bonus » ; l'Orc récupère au Short Rest", () => {
  const nain = perso({ classe: "fighter", espece: "dwarf" });
  assert.deepEqual(ressource(nain, "stonecunning"), { id: "stonecunning", name: "Stonecunning", max: 2, current: 2, recharge: "long" });
  assert.equal(action(nain, "stonecunning").economy, "bonus");
  assert.equal(ressource(perso({ classe: "fighter", espece: "dwarf", niveau: 5 }), "stonecunning").max, 3, "le bonus de maîtrise du niveau 5");
  const orc = perso({ classe: "fighter", espece: "orc" });
  assert.deepEqual(ressource(orc, "adrenaline-rush"), { id: "adrenaline-rush", name: "Adrenaline Rush", max: 2, current: 2, recharge: "short" },
    "« when you finish a Short or Long Rest »");
  assert.equal(action(orc, "adrenaline-rush").economy, "bonus");
});

/* 🔄 RÉÉCRIT AU LOT 385 (ARCHI 35, point 4 du 384) : la ressource porte l'id de CE QU'ELLE COMPTE,
   l'Heroic Inspiration du glossaire — `resourceful` était l'id de sa source. */
test("2b — Resourceful : Heroic Inspiration, une à chaque Long Rest, nommée par son glossaire", () => {
  assert.deepEqual(ressource(perso({ classe: "fighter", espece: "human" }), "heroic-inspiration"),
    { id: "heroic-inspiration", name: "Heroic Inspiration", max: 1, current: 1, recharge: "long" });
});

test("2c — Forest Gnome : Speak with Animals sans emplacement, relié au sort", () => {
  const gnome = perso({ classe: "wizard", espece: "gnome", lignee: "forest-gnome", plus: [{ path: "species.lineage[0].ability[0]", value: "int" }] });
  assert.deepEqual(ressource(gnome, "gnomish-lineage:forest-gnome"),
    { id: "gnomish-lineage:forest-gnome", name: "Speak with Animals", max: 2, current: 2, recharge: "long" });
  const a = action(gnome, "speak-with-animals");
  assert.deepEqual([a.name, a.economy, a.resourceId], ["Speak with Animals", "action", "gnomish-lineage:forest-gnome"]);
  assert.equal(ressource(perso({ classe: "wizard", espece: "gnome", lignee: "rock-gnome" }), "gnomish-lineage:rock-gnome"), undefined,
    "le Rock Gnome ne lance rien sans emplacement");
});

/* 🔄 RÉÉCRIT AU LOT 385 (ARCHI 35, point 3 du 384) : UNE réserve pour le bienfait choisi, qui porte
   l'id du trait qui déclare le compte (`giant-ancestry`) — elle était par option. */
test("2d — Goliath : Cloud en action bonus, Stone et Storm en réaction ; les usages = le bonus de maîtrise", () => {
  const nuage = perso({ classe: "fighter", espece: "goliath", lignee: "cloud" });
  assert.deepEqual(ressource(nuage, "giant-ancestry"), { id: "giant-ancestry", name: "Cloud’s Jaunt", max: 2, current: 2, recharge: "long" });
  assert.equal(action(nuage, "giant-ancestry").economy, "bonus");
  assert.equal(action(perso({ classe: "fighter", espece: "goliath", lignee: "stone" }), "giant-ancestry").economy, "reaction");
  const orage = action(perso({ classe: "fighter", espece: "goliath", lignee: "storm" }), "giant-ancestry");
  assert.deepEqual([orage.economy, orage.category, orage.damage], ["reaction", "damage", [{ dice: "1d8", type: "thunder" }]],
    "« take a Reaction to deal 1d8 Thunder damage »");
});

/* ══ 3 — LES DONS ══════════════════════════════════════════════════════════════════════════════ */

test("3 — Magic Initiate : son sort de niveau 1, une fois sans emplacement, relié au sort ; les cantrips, rien", () => {
  const out = perso({ classe: "fighter", plus: [
    { path: "background", ref: { kind: "background", id: "srd:background:en:acolyte" } },
    { path: "background.originFeat[0]", ref: { kind: "feat", id: "srd:feat:en:magic-initiate" } },
    { path: "background.originFeat[0].list", ref: { kind: "class", id: "srd:class:en:cleric" } },
    { path: "background.originFeat[0].ability[0]", value: "wis" },
    { path: "background.originFeat[0].cantrips[0]", ref: { kind: "spell", id: "srd:spell:en:guidance" } },
    { path: "background.originFeat[0].cantrips[1]", ref: { kind: "spell", id: "srd:spell:en:light" } },
    { path: "background.originFeat[0].prepared[0]", ref: { kind: "spell", id: "srd:spell:en:cure-wounds" } }] });
  assert.deepEqual(ressource(out, "background:cure-wounds"), { id: "background:cure-wounds", name: "Cure Wounds", max: 1, current: 1, recharge: "long" });
  assert.deepEqual([action(out, "background:cure-wounds").economy, action(out, "background:cure-wounds").resourceId], ["action", "background:cure-wounds"],
    "l'économie est le temps d'incantation du sort (« Action »)");
  assert.equal(ressource(out, "background:guidance"), undefined, "un cantrip ne se compte pas");
});

/* ══ 4 — CE QUI ATTEND Q3 ══════════════════════════════════════════════════════════════════════ */

/* 🔄 RÉÉCRIT AU LOT 385 (ARCHI 35, point 3 du 384 : « oui, la ressource seule ») : l'ACTION attend
   Q3, et reste déclarée sans chiffre ; la RESSOURCE, elle, se compte quand la source déclare son compte
   de repos — `tests/actions-385.test.mjs` la chiffre. Savage Attacker (« once per turn ») n'en a pas. */
test("4 — Breath Weapon, Relentless Endurance, Fire/Frost/Hill, Savage Attacker, Arcane Recovery : déclarés, sans chiffre", () => {
  const cas = [
    [{ classe: "fighter", espece: "dragonborn", lignee: "black" }, "breath-weapon", true],
    [{ classe: "fighter", espece: "orc" }, "relentless-endurance", true],
    ...["fire", "frost", "hill"].map((g) => [{ classe: "fighter", espece: "goliath", lignee: g }, "giant-ancestry", true]),
    [{ classe: "fighter", plus: [{ path: "background", ref: { kind: "background", id: "srd:background:en:soldier" } },
      { path: "background.originFeat[0]", ref: { kind: "feat", id: "srd:feat:en:savage-attacker" } }] }, "background:savage-attacker", false],
    [{ classe: "wizard" }, "arcane-recovery", true]
  ];
  for (const [options, id, compte] of cas) {
    const out = perso(options);
    const d = declare(out, `actions[${id}]`);
    assert.equal(d && d.key, "underived.awaits-economy-q3", id);
    assert.equal(d.params.question, "Q3");
    assert.equal(action(out, id), undefined, `${id} : aucune action`);
    assert.equal(Boolean(ressource(out, id)), compte, `${id} : ${compte ? "sa réserve se compte" : "aucune ressource"}`);
  }
});

/* ══ 5 — FATE'S HAND SUIT SA PILE ══════════════════════════════════════════════════════════════ */

test("5 — l'Humain FH n'a pas Resourceful : Twice-Born le RETIRE, et c'est la couche qui le dit", () => {
  const retrait = JSON.stringify(readJson("layers/fh-species-en.layer.json").records.species["srd:species:en:human"]);
  assert.ok(retrait.includes("data.traits[resourceful]"), "témoin : `fh-species-en` retire le trait (`remove`)");
  const fh = perso({ h: FH, classe: "fighter", espece: "human" });
  assert.equal(ressource(fh, "resourceful"), undefined);
  assert.equal(fh.underived.some((u) => /resourceful/.test(u.field)), false, "⛔ rien à déclarer : le trait n'existe pas");
  /* le reste de la classe ne bouge pas d'une pile à l'autre */
  for (const classe of ["bard", "paladin", "monk", "sorcerer"]) {
    const srd = perso({ classe, scores: { cha: 14, dex: 14 } });
    const fhc = perso({ h: FH, classe, scores: { cha: 14, dex: 14 } });
    assert.deepEqual(fhc.resolved.resources, srd.resolved.resources, classe);
    assert.deepEqual(fhc.resolved.actions, srd.resolved.actions, classe);
  }
});

/* ══ 6 — LA DÉCLARATION, PAS LE NOM ════════════════════════════════════════════════════════════ */

test("6 — ⚔️ une couche de scénario qui retire la déclaration du Nain retire Stonecunning ; qui la met en Q3, la déclare", () => {
  const sans = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-sans-usage", {
    species: { "srd:species:en:dwarf": { op: "patch", changes: { "data[trait_uses]": [] } } } }) });
  const nain = perso({ h: sans, classe: "fighter", espece: "dwarf" });
  assert.equal(ressource(nain, "stonecunning"), undefined);
  const q3 = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-q3", {
    species: { "srd:species:en:dwarf": { op: "patch", changes: { "data[trait_uses]": [{ trait: "stonecunning", awaits: { question: "Q3", extrait: "x" } }] } } } }) });
  assert.equal(declare(perso({ h: q3, classe: "fighter", espece: "dwarf" }), "actions[stonecunning]").key, "underived.awaits-economy-q3");
});

/* ══ 7 — CHAQUE EXTRAIT, À LA LETTRE ═══════════════════════════════════════════════════════════ */

test("7 — chaque extrait d'espèce, de lignée et de don est recopié du texte qu'il cite", () => {
  const srd = readJson("layers/srd-5.2.1-en.layer.json").records;
  const meca = readJson("layers/srfh-mecaniques-en.layer.json").records;
  const vus = [];
  const textes = (u) => [u.extrait, u.action && u.action.extrait, u.awaits && u.awaits.extrait].filter((x) => typeof x === "string");
  for (const [id, entree] of Object.entries(meca.species)) {
    const data = srd.species[id].data;
    for (const u of entree.changes["data[trait_uses]"] || []) {
      const trait = data.traits.find((t) => t.id === u.trait);
      assert.ok(trait, `${id} : le trait « ${u.trait} » existe`);
      for (const e of textes(u)) assert.ok(trait.text.includes(e), `${id} ${u.trait} : ${e}`);
      if (u.counts) assert.ok(srd.glossary[u.counts], u.counts);   // lot 385 : `counts` remplace `name_from`
      vus.push(u.trait);
    }
    const lignees = entree.changes["data[lineages]"] || [];
    for (const [option, effets] of Object.entries(entree.changes["data[lineage_effects]"] || {})) {
      if (!effets.uses) continue;
      const texte = lignees.find((o) => o.id === option).levels["1"];
      for (const e of textes(effets.uses)) assert.ok(texte.includes(e), `${id} ${option} : ${e}`);
      if (effets.uses.count_extrait) {
        assert.ok(data.traits.find((t) => t.id === effets.uses.count_trait).text.includes(effets.uses.count_extrait), `${id} ${option} : le compte`);
      }
      vus.push(`${id.split(":").pop()}:${option}`);
    }
  }
  for (const [id, entree] of Object.entries(meca.feat)) {
    const description = srd.feat[id].data.description;
    for (const u of [...(entree.changes["data[sheet_uses]"] || []), ...(entree.changes["data[spell_uses]"] ? [entree.changes["data[spell_uses]"]] : [])]) {
      for (const e of textes(u)) assert.ok(description.includes(e), `${id} : ${e}`);
      vus.push(id.split(":").pop());
    }
  }
  assert.equal(vus.length, 14, `témoin : ${vus.join(" · ")}`);
});

/* ══ 8 — LA FICHE TEMPORAIRE ═══════════════════════════════════════════════════════════════════ */

test("8 — la fiche montre Bardic Inspiration et son dé, Lay On Hands et son soin", async () => {
  const { createTestDocument } = await import("./dom-stub.mjs");
  globalThis.document = createTestDocument();
  const { renderFicheTemporaire } = await import("../ui/builder/fiche-temporaire.mjs");
  const lignes = (out, cle) => renderFicheTemporaire({ resolved: out.resolved, report: out, document: out.document, flags: [] })
    .querySelector(`[data-rubrique="${cle}"]`).querySelectorAll(".perso-ligne")
    .map((li) => `${li.querySelector(".perso-ligne-nom").textContent} | ${li.querySelector(".perso-ligne-valeur")?.textContent ?? ""}`);
  const barde = perso({ classe: "bard", scores: { cha: 16 } });
  assert.ok(lignes(barde, "resources").includes("Bardic Inspiration | 3 of 3 · d6 · long rest"));
  assert.ok(lignes(barde, "actions").includes("Bardic Inspiration | Bonus Action"));
  const paladin = perso({ classe: "paladin" });
  assert.ok(lignes(paladin, "resources").includes("Lay On Hands | 5 of 5 · long rest"));
});
