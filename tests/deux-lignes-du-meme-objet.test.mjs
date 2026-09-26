/* ══ DEUX LIGNES DU MÊME OBJET — lot 296 ════════════════════════════════════

   🔴 LE SYMPTÔME, TROUVÉ PAR LE LOT 288. Deux lignes `gear[N]` qui partent du même
   record — deux dagues craftées différemment, une pile de flèches scindée en deux,
   un second achat rangé ailleurs — faisaient JETER `rebuild` :
     *« resolved.gear : deux entrées portent l'id "dagger" — l'ancre d'override …
       désigne les deux, et aucune ne gagne par défaut »*
   La coquille passait alors en `derivationImpossible` : plus de fiche du tout.

   ⭐ LA RÉPARATION n'affaiblit pas l'invariant (il refuse toujours deux ids égaux) :
   elle donne à chaque ligne une ancre unique et STABLE (`src/build/ancre-de-ligne.mjs`).
   La première ligne d'un record garde l'id d'avant (`dagger`) ; les suivantes
   prennent `dagger:gear-N`, où N est LEUR index de document.

   📏 CES GARDES ONT ÉTÉ VUS ROUGES avant la réparation (moteur de `main`, v837) :
   les témoins 2, 3, 4, 5 et 7 jetaient « deux entrées portent l'id », le 6 fondait
   le kit dans la dague +1. */
import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { charInvariantViolations } from "../src/schemas/invariants.mjs";
import { ancresDesLignes, ANCRE_MAX } from "../src/build/ancre-de-ligne.mjs";
import { OVERRIDE_PATH } from "../src/build/paths.mjs";
import { modele } from "../src/tools/render-fiche.mjs";
import { makeHarness, manifestOf, readJson, PILE_SRD } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";

globalThis.document = createTestDocument();
const { currentGearLines, nextGearIndex, scinderLaLigne, retirerLaLigne, butinDuDepart, cheminDuDepart } =
  await import("../ui/builder/equipment-step.mjs");

const fixture = exempleFhEn();
const { build, layers } = fixture;
const query = layers.verbs.query;
const rebuild = (document) => build.verbs.rebuild({ document });
const REF = (kind, id) => ({ kind, id });
const DAGUE = REF("weapon", "srd:weapon:en:dagger");

/** Pose une ligne comme `addGearLine` le fait (recette comprise). */
function poser(doc, ref, { quantity = 1, equipped = false, location, champs = [] } = {}) {
  const index = nextGearIndex(doc);
  doc = build.verbs.choose({ document: doc, path: `gear[${index}]`, ref }).document;
  doc = build.verbs.set({ document: doc, path: `gear[${index}].quantity`, value: quantity }).document;
  doc = build.verbs.set({ document: doc, path: `gear[${index}].equipped`, value: equipped }).document;
  if (location) doc = build.verbs.set({ document: doc, path: `gear[${index}].location`, value: location }).document;
  for (const [suffixe, v] of champs) {
    doc = v && typeof v === "object"
      ? build.verbs.choose({ document: doc, path: `gear[${index}]${suffixe}`, ref: v }).document
      : build.verbs.set({ document: doc, path: `gear[${index}]${suffixe}`, value: v }).document;
  }
  return { doc, index };
}
const PLUS_UN = [[".bonus", "+1"], [".plan", REF("item", "srd:item:en:weapon-1-2-or-3")]];
const VENIN = [[".powers[0]", REF("item", "srd:item:en:dagger-of-venom")]];
const idsDe = (report) => report.resolved.gear.map((g) => g.id);
const unique = (ids) => new Set(ids).size === ids.length;

test("296 · 1 — ⭐ LA RÈGLE, PURE : première ligne = id nu, les autres `<base>:gear-<N>`, et elle résiste aux gestes", () => {
  const avant = ancresDesLignes([{ index: 0, base: "dagger" }, { index: 3, base: "dagger" }, { index: 7, base: "dagger" },
    { index: 1, base: "rope" }]);
  assert.deepEqual([...avant], [[0, "dagger"], [3, "dagger:gear-3"], [7, "dagger:gear-7"], [1, "rope"]]);
  /* ⭐ l'ORDRE d'arrivée ne décide rien : c'est le plus petit INDEX qui garde l'id nu */
  const desordre = ancresDesLignes([{ index: 7, base: "dagger" }, { index: 0, base: "dagger" }, { index: 3, base: "dagger" }]);
  assert.equal(desordre.get(0), "dagger");
  assert.equal(desordre.get(7), "dagger:gear-7");
  /* ⚔️ RETIRER UNE LIGNE AVANT (la 3) : la 7 garde SON id — ⛔ un rang (`~2`) glisserait ici */
  const retrait = ancresDesLignes([{ index: 0, base: "dagger" }, { index: 7, base: "dagger" }]);
  assert.equal(retrait.get(7), avant.get(7), "la ligne 7 ne change pas d'ancre quand la 3 part");
  /* ⚔️ SCINDER la 0 vers 8 : la source garde l'id nu, la part détachée en prend un neuf */
  const scission = ancresDesLignes([{ index: 0, base: "dagger" }, { index: 3, base: "dagger" }, { index: 8, base: "dagger" }]);
  assert.equal(scission.get(0), "dagger");
  assert.equal(scission.get(3), "dagger:gear-3");
  assert.equal(scission.get(8), "dagger:gear-8");
  /* 📏 le plafond d'un slug (80) : on tronque la BASE, jamais le suffixe */
  const long = "a".repeat(79);
  const tronque = ancresDesLignes([{ index: 0, base: long }, { index: 123, base: long }]).get(123);
  assert.ok(tronque.length <= ANCRE_MAX && tronque.endsWith(":gear-123"), tronque);
  assert.match(tronque, /^[a-z][a-z0-9:_-]{0,79}$/, "l'ancre reste un `$defs/slug`");
  for (const id of avant.values()) assert.ok(OVERRIDE_PATH.test(`resolved.gear[${id}].quantity`), `« ${id} » est une ancre d'override`);
});

test("296 · 2 — 🔴 DEUX DAGUES CRAFTÉES DIFFÉREMMENT (+1, Dagger of Venom) : la fiche se calcule", () => {
  let { doc } = poser(fixture.document, DAGUE, { champs: PLUS_UN });
  ({ doc } = poser(doc, DAGUE, { champs: VENIN }));
  const r = rebuild(doc);
  const dagues = r.resolved.gear.filter((g) => /^Dagger/.test(g.name));
  assert.deepEqual(dagues.map((g) => g.name), ["Dagger", "Dagger +1", "Dagger (Dagger of Venom)"],
    "trois lignes du même record, trois objets distincts");
  assert.deepEqual(dagues.map((g) => g.id), ["dagger", "dagger:gear-8", "dagger:gear-9"]);
  assert.ok(unique(idsDe(r)), "⛔ aucun id en double dans resolved.gear");
  assert.deepEqual(charInvariantViolations(r.document), [], "l'invariant, rejoué : conforme");
});

test("296 · 3 — 🔴 UNE SCISSION DE 20 FLÈCHES EN 10 + 10, À DEUX ENDROITS : la fiche se calcule", () => {
  const { doc, index } = poser(fixture.document, REF("gear", "srd:gear:en:ammunition"), { quantity: 20, location: "backpack" });
  const source = currentGearLines(doc).find((l) => l.index === index);
  const neuve = nextGearIndex(doc);
  const apres = scinderLaLigne({ document: doc, verbs: build.verbs, source, part: 10, index: neuve, location: "storage" });
  const r = rebuild(apres);
  const [a, b] = [index, neuve].map((i) => r.resolved.gear[currentGearLines(apres).findIndex((l) => l.index === i)]);
  assert.equal(a.quantity + b.quantity, 20);
  assert.equal(a.quantity, 10);
  assert.notEqual(a.id, b.id, "deux ancres");
  assert.equal(b.id, `${a.id}:gear-${neuve}`, "la part détachée prend l'ancre de SON index");
  assert.ok(unique(idsDe(r)));
});

test("296 · 4 — ⭐ UN OVERRIDE ANCRÉ SUR LA PREMIÈRE LIGNE VISE LA MÊME LIGNE APRÈS L'AJOUT D'UNE SECONDE", () => {
  /* la fixture porte `resolved.gear[torch].quantity = 4` (deux torches au choix, quatre au sac) */
  const avant = rebuild(fixture.document).resolved.gear.find((g) => g.id === "torch");
  assert.equal(avant.quantity, 4, "témoin : l'override mord");
  const { doc, index } = poser(fixture.document, REF("gear", "srd:gear:en:torch"), { quantity: 1, location: "storage" });
  const r = rebuild(doc);
  const torches = r.resolved.gear.filter((g) => /^torch/.test(g.id));
  assert.deepEqual(torches.map((g) => [g.id, g.quantity]), [["torch", 4], [`torch:gear-${index}`, 1]],
    "⭐ l'override reste sur la ligne gear[7] ; la seconde ligne garde sa quantité à elle");
  /* et la seconde ligne a SA propre ancre, qu'un override peut viser */
  const vise = build.verbs.override({ document: doc, path: `resolved.gear[torch:gear-${index}].quantity`, value: 6, by: "player" }).document;
  const r2 = rebuild(vise);
  assert.deepEqual(r2.resolved.gear.filter((g) => /^torch/.test(g.id)).map((g) => g.quantity), [4, 6]);
});

test("296 · 5 — ⚔️ RETIRER UNE LIGNE AVANT ne fait pas glisser l'override d'une ligne suivante", () => {
  let { doc } = poser(fixture.document, DAGUE, { champs: PLUS_UN });           // gear[8]
  const venin = poser(doc, DAGUE, { champs: VENIN });                              // gear[9]
  doc = build.verbs.override({ document: venin.doc, path: `resolved.gear[dagger:gear-${venin.index}].quantity`, value: 3, by: "gm" }).document;
  const sans = retirerLaLigne({ document: doc, verbs: build.verbs, index: 8 });
  const r = rebuild(sans);
  const cible = r.resolved.gear.find((g) => g.id === `dagger:gear-${venin.index}`);
  assert.equal(cible.name, "Dagger (Dagger of Venom)", "l'override vise toujours la dague de venin");
  assert.equal(cible.quantity, 3);
  /* ⚠️ LE SEUL GLISSEMENT DE LA RÈGLE, ET IL EST BRUYANT : retirer la ligne à l'id nu fait
     de la suivante la première. Un override sur son ancre `:gear-N` devient orphelin, et
     `rebuild` le DIT au lieu de le reporter sur une autre ligne. */
  const sansLaPremiere = retirerLaLigne({ document: doc, verbs: build.verbs, index: 0 });
  const sansLes2 = retirerLaLigne({ document: sansLaPremiere, verbs: build.verbs, index: 8 });
  assert.throws(() => rebuild(sansLes2), /que la dérivation n'a pas produit/);
});

test("296 · 6 — ⚖️ LE KIT NE FUSIONNE QU'AVEC LE MÊME OBJET AU MÊME ENDROIT", () => {
  const rogue = build.verbs.choose({ document: fixture.document, path: "class", ref: REF("class", "srd:class:en:rogue") }).document;
  const poserLeKit = (doc) => {
    const butin = butinDuDepart({ query, document: doc, reponses: { class: "A" } });
    assert.ok(butin.complet);
    for (const { genre, valeur } of butin.aEcrire) doc = build.verbs.set({ document: doc, path: cheminDuDepart(genre), value: valeur }).document;
    for (const pose of butin.aPoser) {
      if (pose.neuve) doc = build.verbs.choose({ document: doc, path: `gear[${pose.index}]`, ref: pose.ref }).document;
      doc = build.verbs.set({ document: doc, path: `gear[${pose.index}].quantity`, value: pose.quantity }).document;
      if (pose.neuve) doc = build.verbs.set({ document: doc, path: `gear[${pose.index}].equipped`, value: false }).document;
    }
    return doc;
  };
  const dagues = (doc) => rebuild(doc).resolved.gear.filter((g) => /^dagger/.test(g.id)).map((g) => [g.name, g.quantity]);
  /* témoin : la dague d'Ilyra, sans recette et sans lieu (= au sac) → le kit s'y FOND, comme avant */
  assert.deepEqual(dagues(poserLeKit(rogue)), [["Dagger", 3]]);
  /* ⛔ une dague +1 n'est pas une dague : le kit ouvre sa ligne, la +1 reste à 1 */
  let crafte = rogue;
  for (const [s, v] of PLUS_UN) {
    crafte = v && typeof v === "object"
      ? build.verbs.choose({ document: crafte, path: `gear[0]${s}`, ref: v }).document
      : build.verbs.set({ document: crafte, path: `gear[0]${s}`, value: v }).document;
  }
  assert.deepEqual(dagues(poserLeKit(crafte)), [["Dagger +1", 1], ["Dagger", 2]]);
  /* ⛔ une dague rangée au coffre n'est pas au même endroit : le kit arrive au sac */
  const auCoffre = build.verbs.set({ document: rogue, path: "gear[0].location", value: "storage" }).document;
  assert.deepEqual(dagues(poserLeKit(auCoffre)), [["Dagger", 1], ["Dagger", 2]]);
});

test("296 · 7 — 📄 LE DOCUMENT À DEUX LIGNES EST VALIDE, ET LA VUE EXPERTE ADRESSE LES DEUX", () => {
  const H = makeHarness({ layers: PILE_SRD });
  const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
  const neuf = writers.composer({ name: "Nodren", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(H.layers), id: "lot-296", at: "2026-09-26T00:00:00Z" });
  const choix = [{ path: "class", ref: REF("class", "srd:class:en:barbarian") },
    ...ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: 12 })),
    { path: "gear[0]", ref: DAGUE }, { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: true },
    { path: "gear[0].bonus", value: "+1" },
    { path: "gear[1]", ref: DAGUE }, { path: "gear[1].quantity", value: 1 }, { path: "gear[1].equipped", value: false },
    { path: "gear[1].powers[0]", ref: REF("item", "srd:item:en:dagger-of-venom") }];
  const out = H.verbs.rebuild({ document: { ...neuf, build: { ...neuf.build, choices: [...neuf.build.choices, ...choix] } } });
  assert.doesNotThrow(() => writers.assertValid(out.document, "lot-296"), "fh-char/1 accepte l'ancre `dagger:gear-1`");
  const gear = modele(out.document, out).rubriques.find((r) => r.cle === "gear");
  assert.deepEqual(gear.racine.enfants.map((e) => [e.chemin, e.adressable, e.sansIdentite === true]),
    [["resolved.gear[dagger]", true, false], ["resolved.gear[dagger:gear-1]", true, false]],
    "⭐ la vue experte (render-fiche) ancre chaque ligne par SON id, et chaque chemin est une ancre d'override");
});
