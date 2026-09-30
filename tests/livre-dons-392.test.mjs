/* ══ 🎖️ LOT 392 — LE PHB 2024, TROISIÈME MARCHE : LES DONS HORS ORIGINE ═══════════════════════════════
   Mandat d'ARCHI 35 (30/09), les lois des lots 387 et 389 inchangées :
   · un don que le SRD 5.2.1 porte aussi n'est PAS réémis : sa catégorie, son prérequis et sa reprise
     sont COMPARÉS, et chaque écart se rapporte pour Eric ;
   · un don propre au livre entre par catégorie, son prérequis en donnée dans la forme du SRD ; un don
     de style s'offre à la porte du Fighter au niveau 1 (lot 360), un don général ou épique attend la
     porte de Level up ;
   · aucune prose du livre : des faits, un résumé marqué (`summary_of`), et le lien vers sa page.

   ── CE QUE CES GARDES TIENNENT (sur une FIXTURE inventée, jamais sur le PHB) ──────────────────────
   1. Un don propre entre avec sa catégorie, son prérequis et ses effets dans les formes connues ; un
      partagé n'est pas réémis ; un écart planté se rapporte ; l'instantané complet nomme le don SRD perdu.
   2. Un don de style du livre s'offre à la porte du Fighter, dans les deux piles, et la fiche le pose ;
      un don général ou épique n'entre à aucune porte de création.
   3. Le générateur refuse plutôt que d'inventer : un don propre sans lien, un prérequis qui ne commence
      pas comme ceux du SRD de sa catégorie, un don d'origine égaré, un id déjà pris par l'origine.
   4. Le générateur ne porte ni les noms ni les phrases des dons du PHB.
   ⚔️ Chacune vue ROUGE sous une mutation (le rapport du lot 392 dit laquelle). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { makeHarness, manifestOf, readJson, ROOT } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";
import { construireDons } from "../src/tools/gen-livre-layer.mjs";
import { pileAvecLivre, PILE_SRD, PILE_FH } from "./fixture-livre-387.mjs";
import { sourceDons, donsFixture, coucheAvecDons, URL_DONS } from "./fixture-livre-392.mjs";
import { lienDuLivreDuJoueur } from "../ui/builder/liens-fh.mjs";

const srd = readJson("layers/srd-5.2.1-en.layer.json");
const { records, ecarts, restes, comptes } = donsFixture();
const couche = coucheAvecDons();
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });

function personnage(pile, choixEnPlus, id) {
  const h = makeHarness({ layers: pileAvecLivre(pile, couche) });
  const doc = writers.composer({ name: "Témoin", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(h.layers), id, at: "2026-09-30T00:00:00Z" });
  const choix = [...ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: 14 })), ...choixEnPlus];
  const out = h.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...choix] } } });
  return { out, portes: h.verbs.decisions({ document: out.document }).decisions };
}
const FIGHTER = { path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } };

/* ══ 1 — LE PROPRE ENTRE PAR CATÉGORIE, LE PARTAGÉ N'EST PAS RÉÉMIS ════════════════════════════════ */

test("1 — un don propre entre avec sa catégorie et son prérequis ; un partagé n'est pas réémis ; l'écart planté se rapporte", () => {
  assert.deepEqual(Object.keys(records.feat).sort(),
    ["xphb:feat:en:boon-of-testing", "xphb:feat:en:lantern-scholar", "xphb:feat:en:test-stance"]);
  assert.deepEqual(comptes.par_categorie, { "fighting-style": 1, general: 1, "epic-boon": 1 });
  assert.equal(comptes.partages, 4);
  /* le prérequis, dans la forme du SRD — une donnée, pas une phrase */
  const d = (slug) => records.feat[`xphb:feat:en:${slug}`].data;
  assert.deepEqual([d("test-stance").category, d("test-stance").prerequisite], ["fighting-style", "Prerequisite: Fighting Style Feature"]);
  assert.deepEqual([d("lantern-scholar").category, d("lantern-scholar").prerequisite], ["general", "Prerequisite: Level 4+, Intelligence 13+"]);
  assert.deepEqual([d("boon-of-testing").category, d("boon-of-testing").prerequisite], ["epic-boon", "Prerequisite: Level 19+"]);
  /* les effets dans les formes que le moteur connaît ; le reste nommé, avec sa raison */
  assert.deepEqual(d("lantern-scholar").ability_increase, { from: ["int"], amount: 1, max: 20 });
  assert.deepEqual(d("lantern-scholar").repeatable, { extrait: "You can take this feat more than once" });
  assert.equal(d("lantern-scholar").armor_training, "Medium armor");
  assert.deepEqual(d("lantern-scholar").sheet_uses.map((u) => [u.id, u.max, u.recharge, u.source.url]),
    [["flash-of-insight", { fixed: 1 }, "short", `${URL_DONS}/lantern-scholar`]]);
  assert.deepEqual(d("test-stance").senses, [{ id: "blindsight", name: "Blindsight", range_ft: 10 }]);
  assert.ok(restes.some((r) => r.startsWith("Lantern Scholar : l'outil")), "l'outil fixe reste en texte, nommé");
  assert.ok(restes.some((r) => r.startsWith("Boon of Testing : le bonus de vitesse")), "la vitesse reste en texte, nommée");
  /* aucune prose : le résumé marqué, et le lien de la page */
  for (const [id, rec] of Object.entries(records.feat)) {
    const f = sourceDons().feats.find((x) => x.name === rec.name);
    assert.equal(rec.data.description, f.resume, `${id} : le texte est le résumé`);
    assert.equal(rec.data.summary_of, "phb-2024", `${id} : un texte sans la marque du résumé`);
    assert.equal(lienDuLivreDuJoueur(rec), f.url);
  }
  /* partagés : ni Archery, ni Grappler, ni ASI, ni Truesight réémis — et UN écart, celui qui est planté */
  for (const slug of ["archery", "grappler", "ability-score-improvement", "boon-of-truesight"]) {
    assert.ok(!Object.keys(records.feat).some((id) => id.endsWith(`:${slug}`)), `${slug} n'est pas réémis`);
  }
  assert.deepEqual(ecarts, ["Grappler · prérequis : SRD « Prerequisite: Level 4+, Strength or Dexterity 13+ » / PHB « Prerequisite: Level 4+, Strength 13+ »"]);
  /* ⚔️ l'autre sens : un instantané COMPLET nomme les dons SRD hors origine qu'il n'a pas lus */
  const complet = construireDons(sourceDons({ complet: true }), { srd });
  assert.ok(complet.ecarts.includes("Defense : le SRD porte ce don, l'instantané du livre ne le nomme pas"));
  assert.ok(!complet.ecarts.some((e) => e.startsWith("Archery : ")), "un don nommé n'est pas perdu");
  assert.ok(!complet.ecarts.some((e) => e.startsWith("Alert : ")), "un don d'origine n'est pas de ce chapitre");
});

/* ══ 2 — LE STYLE DU LIVRE À LA PORTE DU FIGHTER ════════════════════════════════════════════════════ */

test("2 — un don de style du livre s'offre à la porte du Fighter au niveau 1, et la fiche le pose", () => {
  for (const [nom, pile] of [["SRD", PILE_SRD], ["FH", PILE_FH]]) {
    const { portes } = personnage(pile, [FIGHTER], `livre-392-${nom}`);
    const porte = portes.find((p) => p.path === "class.fighting-style[0]");
    assert.ok(porte, `${nom} : la porte du style de combat existe`);
    assert.ok(porte.options.includes("xphb:feat:en:test-stance"), `${nom} : le style du livre est offert`);
    assert.ok(porte.options.includes("srd:feat:en:archery"), `${nom} : les styles SRD restent offerts`);
    /* un don général ou épique n'est pas un style */
    assert.ok(!porte.options.includes("xphb:feat:en:lantern-scholar"), `${nom} : un don général n'est pas un style`);
    assert.ok(!porte.options.includes("xphb:feat:en:boon-of-testing"), `${nom} : un don épique n'est pas un style`);
    /* ⛔ aucune porte de création n'offre un don général ou épique du livre */
    for (const p of portes) {
      for (const id of ["xphb:feat:en:lantern-scholar", "xphb:feat:en:boon-of-testing"]) {
        assert.ok(!(p.options || []).includes(id), `${nom} : ${id} offert à la porte ${p.path}`);
      }
    }
  }
  /* la fiche : le style choisi devient un trait, avec son résumé, sous la capacité du Fighter */
  const { out } = personnage(PILE_SRD, [FIGHTER, { path: "class.fighting-style[0]", ref: { kind: "feat", id: "xphb:feat:en:test-stance" } }], "livre-392-fiche");
  const trait = out.resolved.traits.find((t) => t.id === "xphb:feat:en:test-stance");
  assert.ok(trait, "le style du livre est sur la fiche");
  assert.equal(trait.text, records.feat["xphb:feat:en:test-stance"].data.description);
  assert.match(trait.source, /Fighting Style/);
  assert.ok(!out.unconsumed.some((u) => u.path === "class.fighting-style[0]"), "le choix est consommé");
});

/* ══ 3 — LE GÉNÉRATEUR REFUSE PLUTÔT QUE D'INVENTER ════════════════════════════════════════════════ */

test("3 — un don sans lien, un prérequis hors de sa catégorie, un don d'origine égaré ou un id pris arrêtent le générateur", () => {
  const sansLien = sourceDons();
  delete sansLien.feats.find((f) => f.name === "Lantern Scholar").url;
  assert.throws(() => construireDons(sansLien, { srd }), /Lantern Scholar.*url/);
  /* le prérequis d'un style commence comme ceux des styles SRD — la tête est LUE au SRD */
  const horsCategorie = sourceDons();
  horsCategorie.feats.find((f) => f.name === "Test Stance").prerequisite = "Level 4+";
  assert.throws(() => construireDons(horsCategorie, { srd }), /Test Stance.*Fighting Style Feature/);
  const epiqueTropTot = sourceDons();
  epiqueTropTot.feats.find((f) => f.name === "Boon of Testing").prerequisite = "Level 4+";
  assert.throws(() => construireDons(epiqueTropTot, { srd }), /Boon of Testing.*Level 19\+/);
  const origine = sourceDons();
  origine.feats.find((f) => f.name === "Lantern Scholar").category = "origin";
  assert.throws(() => construireDons(origine, { srd }), /Lantern Scholar.*origine/);
  assert.throws(() => construireDons(sourceDons(), { srd, origines: { "xphb:feat:en:test-stance": {} } }), /Test Stance.*d'origine/);
});

/* ══ 4 — LE GÉNÉRATEUR NE PORTE PAS LE LIVRE ═══════════════════════════════════════════════════════ */

test("4 — le générateur ne porte ni les noms ni les phrases des dons du PHB", () => {
  const code = readFileSync(join(ROOT, "src/tools/gen-livre-layer.mjs"), "utf8");
  const noms = ["Great Weapon Master", "Polearm Master", "Fey Touched", "Boon of Fortitude", "Interception", "Unarmed Fighting", "Crossbow Expert"];
  for (const mot of noms) assert.equal(code.includes(mot), false, `« ${mot} » est un nom du PHB écrit DANS le générateur`);
  /* ⚔️ le témoin : ces noms sont bien de ceux que le générateur sait traiter — depuis une source */
  const src = sourceDons();
  src.feats.find((f) => f.name === "Test Stance").name = "Interception";
  assert.ok(construireDons(src, { srd }).records.feat["xphb:feat:en:interception"], "le nom vient de la source, pas du code");
});
