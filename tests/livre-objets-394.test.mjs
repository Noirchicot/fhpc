/* ══ 💍 LOT 394 — LE DMG 2024 : LES OBJETS MAGIQUES ═════════════════════════════════════════════════
   Mandat d'ARCHI 35 (30/09), les lois des lots 387, 389 et 392 inchangées :
   · un objet que le SRD 5.2.1 porte aussi n'est PAS réémis : il est COMPARÉ — même renommé (`srd_name`)
     ou détaché en variante (`variant_of`) — et chaque écart se rapporte pour Eric ;
   · un objet propre au livre entre avec sa rareté et son harmonisation dans la forme du SRD, un résumé
     marqué et le lien de sa page ; il entre dans Wares par un rangement — déduit de la catégorie, ou
     PROPOSÉ par analogie avec la table d'Eric pour un merveilleux (ARCHI 35, décision a), marqué
     provisoire et nommant son modèle ;
   · ce que le moteur sait appliquer (les effets du lot 289) se déclare sur le record, et la fiche le lit ;
   · la couche `xdmg-en` s'ENRICHIT : les trésors du 09/09 y restent ;
   · chaque lien a la forme d'une vraie ancre (la correction du lot 387).

   ── CE QUE CES GARDES TIENNENT (sur une FIXTURE inventée, jamais sur le DMG) ─────────────────────
   1. Un objet propre entre, avec sa rareté, son harmonisation et son rangement ; un merveilleux rangé
      par analogie nomme son modèle, et un modèle rangé ailleurs fait refuser le générateur.
   2. Un objet partagé n'est pas réémis ; le renommé et la variante retrouvent leur frère ; l'écart planté
      se rapporte ; l'instantané complet nomme l'objet du SRD qu'il n'a pas lu.
   3. Les trésors du 09/09 restent dans la couche, octet pour octet, à côté des objets.
   4. Chaque lien d'un livre a la forme d'une vraie ancre.
   5. L'effet déclaré s'applique à la fiche — et ne réécrit jamais l'inventaire du SRD.
   6. Le générateur ne porte ni les noms ni les phrases des objets du DMG.
   ⚔️ Chacune vue ROUGE sous une mutation (le rapport du lot 394 dit laquelle). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import { makeHarness, manifestOf, readJson, PILE_SRD, ROOT } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";
import { construireObjets, construireCouche, generate, ancreDuLivre } from "../src/tools/gen-livre-layer.mjs";
import { effetsDeLaLigne, effetsDeLObjet } from "../src/build/effets-objets.mjs";
import { coucheFixture, pileAvecLivre } from "./fixture-livre-387.mjs";
import { sourceObjets, objetsFixture, sourceTresors, URL_OBJETS } from "./fixture-livre-394.mjs";
import { lienDuLivreDuJoueur } from "../ui/builder/liens-fh.mjs";

const srd = readJson("layers/srd-5.2.1-en.layer.json");
const rangement = readJson("layers/srfh-shelving-en.layer.json");
const { records, ecarts, renommes, comptes, analogies } = objetsFixture();

/* ══ 1 — LE PROPRE ENTRE, AVEC SA RARETÉ ET SON RANGEMENT ══════════════════════════════════════════ */

test("1 — un objet propre entre avec sa rareté et son harmonisation ; un merveilleux nomme son modèle", () => {
  assert.deepEqual(Object.keys(records.item).sort(),
    ["xdmg:item:en:gleaming-test-cloak", "xdmg:item:en:test-cutlass", "xdmg:item:en:test-lantern-rod"]);
  const rod = records.item["xdmg:item:en:test-lantern-rod"].data;
  assert.equal(rod.attunement, true);
  assert.equal(rod.rarity, "Uncommon (+1), Rare (+2), or Very Rare (+3) (Requires Attunement by a Warlock)");
  assert.equal(rod.category, "rod");
  assert.deepEqual(rod.charges, { max: 3, regain: "1d3", recharge: "dawn" });
  const cape = records.item["xdmg:item:en:gleaming-test-cloak"].data;
  assert.deepEqual([cape.attunement, cape.rarity, cape.subtype], [false, "Common", null]);
  /* aucune prose : le résumé marqué, et le lien de la page */
  for (const [id, rec] of Object.entries(records.item)) {
    const f = sourceObjets().items.find((x) => x.name === rec.name);
    assert.equal(rec.data.description, f.resume, `${id} : le texte est le résumé`);
    assert.equal(rec.data.summary_of, "dmg-2024", `${id} : un texte sans la marque du résumé`);
    assert.equal(lienDuLivreDuJoueur(rec), f.url);
  }
  /* le rangement : déduit de la catégorie (relu au SRD), ou proposé par analogie, marqué provisoire */
  const r = (slug) => records.shelving[`xdmg:shelving:en:${slug}`].data;
  assert.deepEqual([r("test-lantern-rod").shelf.aisle, r("test-lantern-rod").shelf.shelf, r("test-lantern-rod").slot.state],
    ["arcana", "wands-rods-staves", "not_worn"]);
  assert.deepEqual([r("test-cutlass").shelf.shelf, r("test-cutlass").slot.state], ["magic-weapons", "from_base"]);
  const c = r("gleaming-test-cloak");
  assert.deepEqual([c.shelf.aisle, c.shelf.shelf, c.shelf.shelf_provisional, c.shelf.like, c.slot.slot],
    ["marvels", "clothing", true, "Cloak of Protection", "back"]);
  assert.match(c.shelf.provenance, /like Cloak of Protection/);
  assert.equal(c.extends, "xdmg:item:en:gleaming-test-cloak");
  assert.deepEqual(analogies, [{ name: "Gleaming Test Cloak", shelf: "marvels:clothing", slot: "back", like: "Cloak of Protection" }]);
  /* ⚔️ un modèle rangé AILLEURS fait refuser : l'analogie se vérifie, elle ne se déclare pas */
  const faux = sourceObjets();
  faux.items.find((x) => x.name === "Gleaming Test Cloak").rangement.like = "Bag of Holding";
  assert.throws(() => construireObjets(faux, { srd, rangement }), /Bag of Holding.*containers-and-vehicles/);
  const sansHarmo = sourceObjets();
  sansHarmo.items.find((x) => x.name === "Test Lantern Rod").rarity = "Uncommon";
  assert.throws(() => construireObjets(sansHarmo, { srd, rangement }), /Test Lantern Rod.*harmonisation/);
});

/* ══ 2 — LE PARTAGÉ N'EST PAS RÉÉMIS ═══════════════════════════════════════════════════════════════ */

test("2 — un objet partagé n'est pas réémis ; le renommé et la variante retrouvent leur frère ; l'écart planté se rapporte", () => {
  for (const slug of ["bag-of-holding", "cloak-of-elvenkind", "handy-haversack", "heward-s-test-haversack", "armor-1"]) {
    assert.ok(!Object.keys(records.item).some((id) => id.endsWith(`:${slug}`)), `${slug} n'est pas réémis`);
  }
  assert.equal(comptes.partages, 4);
  assert.deepEqual(renommes, ["Heward's Test Haversack = Handy Haversack (SRD)"]);
  assert.deepEqual(ecarts, ["Cloak of Elvenkind · rareté : SRD « Uncommon (Requires Attunement) » / DMG « Rare »"]);
  /* ⚔️ l'autre sens : un instantané COMPLET nomme chaque objet du SRD qu'il n'a pas lu */
  const complet = construireObjets(sourceObjets({ complet: true }), { srd, rangement });
  assert.ok(complet.ecarts.includes("Wand of Web : le SRD porte cet objet, l'instantané du livre ne le nomme pas"));
  assert.ok(!complet.ecarts.some((e) => e.startsWith("Bag of Holding : ")), "un objet lu n'est pas perdu");
  assert.ok(!complet.ecarts.some((e) => e.startsWith("Handy Haversack : ")), "le renommé est lu sous son nom SRD");
  /* ⛔ un objet du SRD donné pour propre fait refuser */
  const usurpe = sourceObjets();
  Object.assign(usurpe.items.find((x) => x.name === "Test Cutlass"), { name: "Flame Tongue" });
  assert.throws(() => construireObjets(usurpe, { srd, rangement }), /Flame Tongue.*au SRD/);
});

/* ══ 3 — LES TRÉSORS DU 09/09 RESTENT ══════════════════════════════════════════════════════════════ */

test("3 — la couche xdmg s'enrichit : les trésors du 09/09 restent, octet pour octet, à côté des objets", () => {
  const dir = mkdtempSync(join(os.tmpdir(), "livre-394-"));
  try {
    writeFileSync(join(dir, "dmg-2024-treasure.json"), JSON.stringify(sourceTresors()));
    writeFileSync(join(dir, "dmg-2024-magic-items.json"), JSON.stringify(sourceObjets()));
    const { sortie } = generate({ cle: "dmg-2024", dirSources: dir, dirCouches: dir });
    const couche = JSON.parse(readFileSync(sortie, "utf8"));
    const { layer: tresors } = construireCouche(sourceTresors(), "dmg-2024");
    for (const genre of ["gem", "gear"]) assert.deepEqual(couche.records[genre], tresors.records[genre], `${genre} : les trésors restent`);
    for (const [id, r] of Object.entries(tresors.records.shelving)) assert.deepEqual(couche.records.shelving[id], r, `${id} : leur rangement reste`);
    assert.equal(Object.keys(couche.records.item).length, 3, "et les objets magiques sont là");
    assert.ok(couche.records.shelving["xdmg:shelving:en:test-lantern-rod"], "avec leur rangement");
    /* sans instantané d'objets, la couche est celle des trésors seuls — rien ne se perd */
    rmSync(join(dir, "dmg-2024-magic-items.json"));
    const seule = JSON.parse(readFileSync(generate({ cle: "dmg-2024", dirSources: dir, dirCouches: dir }).sortie, "utf8"));
    assert.deepEqual(seule.records, tresors.records);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

/* ══ 4 — CHAQUE LIEN A LA FORME D'UNE VRAIE ANCRE ══════════════════════════════════════════════════ */

test("4 — chaque lien d'un livre a la forme d'une vraie ancre (la correction du lot 387)", () => {
  assert.equal(ancreDuLivre("Tavern Brawler"), "TavernBrawler");
  assert.equal(ancreDuLivre("Two-Weapon Fighting"), "TwoWeaponFighting");
  assert.equal(ancreDuLivre("Heward’s Handy Haversack"), "HewardsHandyHaversack");
  const liens = (o) => JSON.stringify(o).match(/https?:[^"]*/g) || [];
  const tous = [...liens(coucheFixture().layer), ...liens(records)];
  assert.ok(tous.some((u) => u.includes("#")), "le témoin : les liens d'origine portent une ancre");
  for (const u of tous) {
    assert.ok(!/\s/.test(u), `« ${u} » : un lien ne porte pas d'espace`);
    const [, ancre] = u.split("#");
    if (ancre !== undefined) assert.match(ancre, /^[A-Za-z0-9]+$/, `« ${u} » : l'ancre n'a pas la forme d'un id de titre`);
  }
  /* le don d'origine inventé au nom composé du lot 387 mène à SA section */
  assert.ok(tous.includes("https://www.dndbeyond.com/sources/test-book/feats#TestFortune"));
});

/* ══ 5 — L'EFFET DÉCLARÉ S'APPLIQUE, ET L'INVENTAIRE GAGNE ═════════════════════════════════════════ */

test("5 — l'effet déclaré sur un objet du livre s'applique à la fiche ; l'inventaire du SRD n'est jamais réécrit", () => {
  const couche = { schema: "fh-layer/1", id: "xdmg-en", version: "1.0.0", name: "Test DMG", lang: "en", flags: [],
    attribution: { license: "all-rights-reserved", text: "test" }, records: { item: records.item } };
  const H = makeHarness({ layers: pileAvecLivre(PILE_SRD, couche) });
  const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
  let n = 0;
  const warlock = (gear) => {
    n += 1;
    const doc = writers.composer({ name: "Témoin", lang: "en", units: { distance: "ft", weight: "lb" },
      layers: manifestOf(H.layers), id: `livre-394-${n}`, at: "2026-09-30T00:00:00Z" });
    const choix = [{ path: "class", ref: { kind: "class", id: "srd:class:en:warlock" } },
      ...ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: k === "cha" ? 15 : 12 })), ...gear];
    return H.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...choix] } } });
  };
  const ligne = (extra) => [{ path: "gear[0]", ref: { kind: "item", id: "xdmg:item:en:test-lantern-rod" } },
    { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: true }, ...extra];
  const temoin = warlock([]);
  const harmonise = warlock(ligne([{ path: "gear[0].attuned", value: true }, { path: "gear[0].variant", value: "+2" }]));
  assert.equal(harmonise.resolved.spellcasting.attackBonus, temoin.resolved.spellcasting.attackBonus + 2, "⭐ le jet de sort prend +2");
  assert.equal(harmonise.resolved.spellcasting.dc, temoin.resolved.spellcasting.dc + 2, "⭐ le DD prend +2");
  assert.equal(harmonise.resolved.gear[0].name, "Test Lantern Rod +2", "la variante se nomme comme au SRD");
  assert.deepEqual(harmonise.resolved.effects.applied.map((e) => [e.target, e.value, e.variant]).sort(),
    [["attack.spell", 2, "+2"], ["dc.spell", 2, "+2"]]);
  /* non harmonisé : rien ne s'applique, et la fiche dit pourquoi */
  const libre = warlock(ligne([{ path: "gear[0].variant", value: "+2" }]));
  assert.equal(libre.resolved.spellcasting.attackBonus, temoin.resolved.spellcasting.attackBonus);
  assert.deepEqual(libre.resolved.effects.pending.map((e) => e.reason), ["attunement", "attunement"]);
  /* ⭐ l'inventaire gagne : un record ne réécrit pas les effets d'un objet du SRD */
  const cape = "srd:item:en:cloak-of-protection";
  const faux = [{ famille: "chiffre", cible: "ac", mode: "bonus", valeur: 9, condition: "porte" }];
  assert.deepEqual(effetsDeLaLigne({ id: cape, effetsDeclares: faux }), effetsDeLObjet(cape));
  /* ⛔ un effet déclaré sans condition connue n'est pas lu */
  assert.deepEqual(effetsDeLaLigne({ id: "xdmg:item:en:x", effetsDeclares: [{ ...faux[0], condition: "quand il pleut" }] }), []);
});

/* ══ 6 — LE GÉNÉRATEUR NE PORTE PAS LE LIVRE ═══════════════════════════════════════════════════════ */

test("6 — le générateur ne porte ni les noms ni les phrases des objets du DMG", () => {
  const code = readFileSync(join(ROOT, "src/tools/gen-livre-layer.mjs"), "utf8");
  for (const mot of ["Alchemy Jug", "Blackrazor", "Rod of the Pact Keeper", "Hat of Vermin", "Wand of Orcus", "Mayonnaise"]) {
    assert.equal(code.includes(mot), false, `« ${mot} » est un nom du DMG écrit DANS le générateur`);
  }
  /* ⚔️ le témoin : ces noms sont de ceux que le générateur sait traiter — depuis une source */
  const src = sourceObjets();
  src.items.find((x) => x.name === "Test Cutlass").name = "Blackrazor";
  assert.ok(construireObjets(src, { srd, rangement }).records.item["xdmg:item:en:blackrazor"], "le nom vient de la source");
  assert.ok(URL_OBJETS.startsWith("https://www.dndbeyond.com/"));
});
