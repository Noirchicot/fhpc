/* ══ 🧮 LOT 385 — ACTIONS ET RESSOURCES : LES QUATRE RESTES DE LA DEUXIÈME MARCHE ═══════════════
   Mandat d'ARCHI 35 (30/09), ses décisions sur les points ouverts du lot 384 :
   · point 3 → « oui, la ressource seule » : une source qui attend Q3 et déclare son compte de repos
     pose sa RESSOURCE (le souffle, Relentless Endurance, Arcane Recovery, et UNE réserve pour le
     bienfait de Giant Ancestry) ; son action attend. Savage Attacker (« once per turn ») : rien.
   · point 4 → la ressource s'appelle ce qu'elle COMPTE : l'Heroic Inspiration du glossaire, un seul
     compteur quelle que soit la source.
   · point 7 → un trait d'espèce donné à un niveau supérieur ne s'affiche pas avant ce niveau (le
     Draconic Flight, et son voisin de même forme, le Large Form du Goliath), par la donnée.
   · point 1 → le dé de Martial Arts (et la Dextérité) sur les armes de moine.
   · ET (question du 385, réponse b) : la pile FH déclare SON compte, à l'échelle écrite (« twice —
     plus one more use at character levels 5, 9, 13, and 17 »), jamais le bonus de maîtrise.

   ── CE QUE CES GARDES TIENNENT ────────────────────────────────────────────────────────────────
   1. Les compteurs de ce qui attend Q3, chiffrés, dans les deux piles.
   2. La réserve de Giant Ancestry : une, pour les six bienfaits.
   3. L'Heroic Inspiration : un compteur, nommé et plafonné par son record.
   4. Le trait donné au niveau 5 : absent avant, présent au niveau — par la déclaration.
   5. Martial Arts sur les armes de moine, et sa condition.
   6. ⚔️ La déclaration, pas le nom : une couche de scénario qui change la donnée change la fiche.
   7. La pile FH compte par SA formule.
   8. La fiche temporaire les montre.
   ⚔️ Chacune vue ROUGE sous une mutation (le rapport du lot 385 dit laquelle). */
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
    layers: manifestOf(h.layers), id: `actions-385-${numero}`, at: "2026-09-30T00:00:00Z" });
  const choix = [{ path: "class", ref: { kind: "class", id: `srd:class:en:${classe}` } },
    ...ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: scores[k] ?? 12 }))];
  if (espece) choix.push({ path: "species", ref: { kind: "species", id: `srd:species:en:${espece}` } });
  if (lignee) choix.push({ path: "species.lineage[0]", value: lignee });
  gear.forEach(([kind, id, quantite = 1], i) => choix.push({ path: `gear[${i}]`, ref: { kind, id } },
    { path: `gear[${i}].quantity`, value: quantite }, { path: `gear[${i}].equipped`, value: true }));
  const base = doc.build.choices.filter((c) => !(niveau && c.path === "level"));
  if (niveau) base.push({ path: "level", value: niveau });
  const out = h.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...base, ...choix, ...plus] } } });
  /* ⚠️ au-delà du niveau 1, les PV des niveaux suivants sont des CHOIX que le Level up n'écrit pas
     encore : le document ne passe pas le schéma (`vitals.hpMax`) — même réserve qu'au lot 384. */
  if (!niveau) assert.equal(valider(out.document), true, ajv.errorsText(valider.errors));
  return out;
}
const action = (out, id) => out.resolved.actions.find((a) => a.id === id);
const ressource = (out, id) => out.resolved.resources.find((x) => x.id === id);
const ressources = (out, id) => out.resolved.resources.filter((x) => x.id === id);
const declare = (out, champ) => out.underived.find((u) => u.field === champ);
const trait = (out, id) => out.resolved.traits.find((t) => t.id === id);
const PILES = [["SRD", SRD], ["FH", FH]];
/* le bonus de maîtrise du SRD, niveau par niveau (p.23) — c'est lui que l'échelle FH reproduit */
const PB = (n) => 2 + Math.floor((n - 1) / 4);

/* ══ 1 — CE QUI ATTEND Q3 SE COMPTE ════════════════════════════════════════════════════════════ */

test("1 — le souffle, Relentless Endurance, Arcane Recovery : leur réserve se compte, leur action attend", () => {
  for (const [pile, h] of PILES) {
    const souffle = perso({ h, classe: "fighter", espece: "dragonborn", lignee: "black" });
    assert.deepEqual(ressource(souffle, "breath-weapon"),
      { id: "breath-weapon", name: "Breath Weapon", max: 2, current: 2, recharge: "long" }, pile);
    assert.equal(ressource(perso({ h, classe: "fighter", espece: "dragonborn", lignee: "black", niveau: 5 }), "breath-weapon").max, 3, pile);
    assert.equal(declare(souffle, "actions[breath-weapon]").key, "underived.awaits-economy-q3", pile);
    assert.equal(action(souffle, "breath-weapon"), undefined, pile);
    /* « Once you use this trait, you can’t do so again until you finish a Long Rest. » */
    assert.deepEqual(ressource(perso({ h, classe: "fighter", espece: "orc" }), "relentless-endurance"),
      { id: "relentless-endurance", name: "Relentless Endurance", max: 1, current: 1, recharge: "long" }, pile);
    /* « Once you use this feature, you can’t do so again until you finish a Long Rest. » */
    const mage = perso({ h, classe: "wizard" });
    assert.deepEqual(ressource(mage, "arcane-recovery"),
      { id: "arcane-recovery", name: "Arcane Recovery", max: 1, current: 1, recharge: "long" }, pile);
    assert.equal(action(mage, "arcane-recovery"), undefined, pile);
  }
  /* « once per turn » n'est pas un compte de repos : Savage Attacker ne pose rien */
  const sauvage = perso({ classe: "fighter", plus: [{ path: "background", ref: { kind: "background", id: "srd:background:en:soldier" } },
    { path: "background.originFeat[0]", ref: { kind: "feat", id: "srd:feat:en:savage-attacker" } }] });
  assert.equal(ressource(sauvage, "background:savage-attacker"), undefined);
});

/* ══ 2 — UNE RÉSERVE DE GÉANT ══════════════════════════════════════════════════════════════════ */

test("2 — Giant Ancestry : UNE réserve pour le bienfait choisi, quelle que soit son économie", () => {
  const economies = { cloud: "bonus", stone: "reaction", storm: "reaction", fire: null, frost: null, hill: null };
  for (const [pile, h] of PILES) {
    for (const [bienfait, economie] of Object.entries(economies)) {
      const out = perso({ h, classe: "fighter", espece: "goliath", lignee: bienfait });
      const reserve = ressources(out, "giant-ancestry");
      assert.equal(reserve.length, 1, `${pile} ${bienfait} : une réserve`);
      assert.equal(reserve[0].max, 2, `${pile} ${bienfait}`);
      assert.equal(out.resolved.resources.filter((r) => r.id.startsWith("giant-ancestry")).length, 1, `${pile} ${bienfait} : une seule`);
      const a = action(out, "giant-ancestry");
      assert.equal(a ? a.economy : null, economie, `${pile} ${bienfait}`);
      if (a) assert.equal(a.resourceId, "giant-ancestry");
      else assert.equal(declare(out, "actions[giant-ancestry]").key, "underived.awaits-economy-q3");
    }
    assert.equal(ressource(perso({ h, classe: "fighter", espece: "goliath", lignee: "fire", niveau: 9 }), "giant-ancestry").max, 4, pile);
  }
});

/* ══ 3 — UN COMPTEUR D'HEROIC INSPIRATION ══════════════════════════════════════════════════════ */

test("3 — l'Heroic Inspiration : l'id et le nom de son record, son plafond, un seul compteur", () => {
  const humain = perso({ classe: "fighter", espece: "human" });
  assert.deepEqual(ressource(humain, "heroic-inspiration"),
    { id: "heroic-inspiration", name: "Heroic Inspiration", max: 1, current: 1, recharge: "long" });
  assert.equal(ressource(humain, "resourceful"), undefined, "la source n'est pas ce qu'on compte");
  /* une seconde source du MÊME record (demain, le MJ) : toujours un compteur */
  const deux = makeHarness({ layers: PILE_SRD, extra: uneCouche("deux-sources", { species: { "srd:species:en:human": { op: "patch", changes: {
    "data[trait_uses]": [
      { trait: "resourceful", counts: "srd:glossary:en:heroic-inspiration", recharge: "long" },
      { trait: "skillful", counts: "srd:glossary:en:heroic-inspiration", recharge: "long" }] } } } }) });
  assert.equal(ressources(perso({ h: deux, classe: "fighter", espece: "human" }), "heroic-inspiration").length, 1);
  /* le plafond vit sur le record compté : sans formule lisible, une déclaration, pas un chiffre */
  const sansPlafond = makeHarness({ layers: PILE_SRD, extra: uneCouche("sans-plafond", { glossary: {
    "srd:glossary:en:heroic-inspiration": { op: "patch", changes: { "data[sheet_counter]": { extrait: "x" } } } } }) });
  const out = perso({ h: sansPlafond, classe: "fighter", espece: "human" });
  assert.equal(ressource(out, "heroic-inspiration"), undefined);
  assert.equal(declare(out, "resources[resourceful]").key, "underived.usage-counter-missing");
  /* Fate's Hand : Twice-Born retire Resourceful — aucun compteur */
  assert.equal(ressource(perso({ h: FH, classe: "fighter", espece: "human" }), "heroic-inspiration"), undefined);
});

/* ══ 4 — LE TRAIT DU NIVEAU 5 ══════════════════════════════════════════════════════════════════ */

test("4 — Draconic Flight et Large Form : absents au niveau 1, présents au niveau 5", () => {
  for (const [pile, h] of PILES) {
    for (const [espece, lignee, id] of [["dragonborn", "black", "draconic-flight"], ["goliath", "cloud", "large-form"]]) {
      assert.equal(trait(perso({ h, classe: "fighter", espece, lignee }), id), undefined, `${pile} ${id} au niveau 1`);
      assert.equal(trait(perso({ h, classe: "fighter", espece, lignee, niveau: 4 }), id), undefined, `${pile} ${id} au niveau 4`);
      assert.ok(trait(perso({ h, classe: "fighter", espece, lignee, niveau: 5 }), id), `${pile} ${id} au niveau 5`);
    }
    /* les autres traits restent : seul celui que la pile date attend */
    assert.ok(trait(perso({ h, classe: "fighter", espece: "dragonborn", lignee: "black" }), "breath-weapon"), pile);
  }
});

/* ══ 5 — MARTIAL ARTS SUR LES ARMES DE MOINE ═══════════════════════════════════════════════════ */

test("5 — le bâton du moine prend la Dextérité et le dé de Martial Arts quand il vaut mieux", () => {
  const baton = [["weapon", "srd:weapon:en:quarterstaff"]];
  for (const [pile, h] of PILES) {
    /* niveau 1 : 1d6 contre 1d6 — le dé ne change rien, la Dextérité si (« instead of your Strength ») */
    const n1 = action(perso({ h, classe: "monk", scores: { str: 10, dex: 16 }, gear: baton }), "quarterstaff");
    assert.deepEqual([n1.ability, n1.bonus, n1.damage[0].dice, n1.twoHandedDamage[0].dice], ["dex", 5, "1d6+3", "1d8+3"], pile);
    /* niveau 5 : la colonne dit 1d8 — « in place of the normal damage » */
    const n5 = action(perso({ h, classe: "monk", scores: { str: 10, dex: 16 }, niveau: 5, gear: baton }), "quarterstaff");
    assert.deepEqual([n5.damage[0].dice, n5.twoHandedDamage[0].dice], ["1d8+3", "1d8+3"], pile);
  }
  /* deux dagues : 1d4 → 1d6, et l'attaque Light en plus prend le même dé, sans le modificateur */
  const dagues = perso({ classe: "monk", scores: { str: 10, dex: 16 }, gear: [["weapon", "srd:weapon:en:dagger", 2]] });
  assert.equal(action(dagues, "dagger").damage[0].dice, "1d6+3");
  assert.equal(action(dagues, "dagger:light").damage[0].dice, "1d6");
  /* la condition : en armure, ou avec une arme qui n'est pas de moine, le bâton reste un bâton */
  const armure = action(perso({ classe: "monk", scores: { str: 10, dex: 16 }, gear: [...baton, ["armor", "srd:armor:en:leather-armor"]] }), "quarterstaff");
  assert.deepEqual([armure.ability, armure.damage[0].dice], ["str", "1d6"]);
  const epee = perso({ classe: "monk", scores: { str: 10, dex: 16 }, gear: [...baton, ["weapon", "srd:weapon:en:longsword"]] });
  assert.equal(action(epee, "quarterstaff").ability, "str");
  /* un guerrier au bâton n'a pas Martial Arts */
  assert.equal(action(perso({ classe: "fighter", scores: { str: 10, dex: 16 }, gear: baton }), "quarterstaff").ability, "str");
});

/* ══ 6 — ⚔️ LA DÉCLARATION, PAS LE NOM ═════════════════════════════════════════════════════════ */

test("6 — ⚔️ une couche de scénario qui change la donnée change la fiche", () => {
  const patch = (kind, id, changes) => makeHarness({ layers: PILE_SRD,
    extra: uneCouche("scenario-385", { [kind]: { [id]: { op: "patch", changes } } }) });
  /* le niveau du trait est une donnée : daté 1, il paraît au niveau 1 ; sans date, aussi */
  const tot = patch("species", "srd:species:en:dragonborn", { "data[trait_levels]": [{ trait: "draconic-flight", level: 1, extrait: "x" }] });
  assert.ok(trait(perso({ h: tot, classe: "fighter", espece: "dragonborn", lignee: "black" }), "draconic-flight"));
  const sansDate = patch("species", "srd:species:en:dragonborn", { "data[trait_levels]": [] });
  assert.ok(trait(perso({ h: sansDate, classe: "fighter", espece: "dragonborn", lignee: "black" }), "draconic-flight"));
  /* Martial Arts sans `weapon_attacks` : le bâton reste un bâton, l'Unarmed Strike garde son dé */
  const sansArmes = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-385b", { "class-progression": { "srd:class-progression:en:monk": { op: "patch",
    changes: { "data[martial_arts]": { ...readJson("layers/srfh-mecaniques-en.layer.json").records["class-progression"]["srd:class-progression:en:monk"].changes["data[martial_arts]"], weapon_attacks: undefined } } } } }) });
  const moine = perso({ h: sansArmes, classe: "monk", scores: { str: 10, dex: 16 }, gear: [["weapon", "srd:weapon:en:quarterstaff"]] });
  assert.equal(action(moine, "quarterstaff").ability, "str");
  assert.equal(action(moine, "unarmed-strike").damage[0].dice, "1d6+3");
});

/* ══ 7 — LA PILE FH COMPTE PAR SA FORMULE ══════════════════════════════════════════════════════ */

test("7 — la pile FH compte à l'échelle écrite, et c'est sa couche qui le déclare", () => {
  const nain = FH.layers.verbs.query({ kind: "species" }).find((v) => v.id === "srd:species:en:dwarf");
  const u = nain.record.data.trait_uses.find((x) => x.trait === "stonecunning");
  assert.deepEqual(u.max, { base: 2, plus_one_at_levels: [5, 9, 13, 17] });
  /* l'échelle rend les chiffres du SRD à TOUS les niveaux (conversion du 27/08) — et la pile FH les
     lit dans sa formule, pas dans le bonus de maîtrise */
  for (const niveau of [1, 4, 5, 8, 9, 12, 13, 16, 17, 20]) {
    for (const [espece, id] of [["dwarf", "stonecunning"], ["orc", "adrenaline-rush"]]) {
      assert.equal(ressource(perso({ h: FH, classe: "fighter", espece, niveau: niveau > 1 ? niveau : undefined }), id).max, PB(niveau), `${id} ${niveau}`);
    }
  }
  /* le Forest Folk du Hoddon a désormais son compteur (il n'en avait pas : lot 384) */
  const hoddon = perso({ h: FH, classe: "fighter", espece: "gnome", lignee: "forest-folk" });
  assert.deepEqual(ressource(hoddon, "gnomish-lineage:forest-folk"),
    { id: "gnomish-lineage:forest-folk", name: "Speak with Animals", max: 2, current: 2, recharge: "long" });
  assert.equal(action(hoddon, "speak-with-animals").resourceId, "gnomish-lineage:forest-folk");
});

/* ══ 8 — LA FICHE TEMPORAIRE ═══════════════════════════════════════════════════════════════════ */

test("8 — la fiche montre les réserves, l'Heroic Inspiration, et tait le Draconic Flight au niveau 1", async () => {
  const { createTestDocument } = await import("./dom-stub.mjs");
  globalThis.document = createTestDocument();
  const { renderFicheTemporaire } = await import("../ui/builder/fiche-temporaire.mjs");
  const lignes = (out, cle) => renderFicheTemporaire({ resolved: out.resolved, report: out, document: out.document, flags: [] })
    .querySelector(`[data-rubrique="${cle}"]`).querySelectorAll(".perso-ligne")
    .map((li) => `${li.querySelector(".perso-ligne-nom").textContent} | ${li.querySelector(".perso-ligne-valeur")?.textContent ?? ""}`);
  const dragon = perso({ classe: "fighter", espece: "dragonborn", lignee: "black" });
  assert.ok(lignes(dragon, "resources").includes("Breath Weapon | 2 of 2 · long rest"));
  assert.ok(!lignes(dragon, "traits").some((l) => l.startsWith("Draconic Flight")));
  assert.ok(lignes(perso({ classe: "fighter", espece: "goliath", lignee: "fire" }), "resources").includes("Fire’s Burn | 2 of 2 · long rest"));
  assert.ok(lignes(perso({ classe: "fighter", espece: "human" }), "resources").includes("Heroic Inspiration | 1 of 1 · long rest"));
  const baton = lignes(perso({ classe: "monk", scores: { str: 10, dex: 16 }, gear: [["weapon", "srd:weapon:en:quarterstaff"]] }), "actions")
    .find((l) => l.startsWith("Quarterstaff"));
  assert.ok(baton && baton.includes("+5") && baton.includes("1d6+3"), baton);
});
