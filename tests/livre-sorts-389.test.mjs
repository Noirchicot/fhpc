/* ══ 🪄 LOT 389 — LE PHB 2024, DEUXIÈME MARCHE : LES SORTS ═════════════════════════════════════════
   Mandat d'ARCHI 35 (30/09), les lois du lot 387 inchangées :
   · un sort que le SRD 5.2.1 porte aussi n'est PAS réémis : il est COMPARÉ, fait par fait — même quand
     le livre le nomme autrement (le nom SRD est une donnée de l'instantané, `srd_name`) — et chaque
     écart se rapporte pour Eric ;
   · un sort propre au livre entre avec ses listes de classes : un lanceur le voit à sa porte de sorts
     quand le livre est allumé, et la fiche le montre ;
   · aucune prose du livre : des faits, un résumé marqué (`summary_of`), et le lien vers sa page.

   ── CE QUE CES GARDES TIENNENT (sur une FIXTURE inventée, jamais sur le PHB) ──────────────────────
   1. Un sort partagé n'est pas réémis ; un écart planté se rapporte ; un renommé retrouve son frère ;
      et l'instantané qui se dit complet fait nommer le sort SRD qu'il aurait perdu.
   2. Un sort propre au livre entre dans les deux piles, s'offre à la porte des classes qu'il liste, et
      la fiche le lit.
   3. Les formes écrites se relisent : ramenées par les règles de comparaison, elles redonnent les faits
      du compendium — et chaque sort du livre porte son résumé marqué et son lien.
   4. Le générateur refuse plutôt que d'inventer : un sort propre sans classes, un nom SRD qui ne
      répond pas.
   5. Le générateur ne porte ni les noms ni les phrases des sorts du PHB.
   ⚔️ Chacune vue ROUGE sous une mutation (le rapport du lot 389 dit laquelle). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { makeHarness, manifestOf, readJson, ROOT } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";
import { construireSorts } from "../src/tools/gen-livre-layer.mjs";
import { pileAvecLivre, PILE_SRD, PILE_FH } from "./fixture-livre-387.mjs";
import { sourceSorts, sortsFixture, coucheAvecSorts, URL_SORTS } from "./fixture-livre-389.mjs";
import { lienDuLivreDuJoueur } from "../ui/builder/liens-fh.mjs";

const srd = readJson("layers/srd-5.2.1-en.layer.json");
const { records, ecarts, renommes, comptes } = sortsFixture();
const couche = coucheAvecSorts();
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });

function magicien(pile, sorts = []) {
  const h = makeHarness({ layers: pileAvecLivre(pile, couche) });
  const doc = writers.composer({ name: "Témoin", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(h.layers), id: "livre-389", at: "2026-09-30T00:00:00Z" });
  const choix = [{ path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
    ...ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: 14 })),
    ...sorts.map(([path, id]) => ({ path, ref: { kind: "spell", id } }))];
  const out = h.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...choix] } } });
  return { out, h };
}

/* ══ 1 — LE PARTAGÉ N'EST PAS RÉÉMIS ═══════════════════════════════════════════════════════════════ */

test("1 — un sort partagé n'est pas réémis, un écart planté se rapporte, un renommé retrouve son frère", () => {
  const ids = Object.keys(records.spell);
  for (const id of ids) assert.ok(id.startsWith("xphb:spell:en:"), `${id} : la couche n'ajoute que des ids du livre`);
  for (const slug of ["fireball", "light", "acid-arrow", "zanthor-s-acid-arrow"]) {
    assert.ok(!ids.some((id) => id.endsWith(`:${slug}`)), `${slug} n'est pas réémis`);
  }
  assert.equal(comptes.partages, 3);
  /* UN écart, celui qui est planté ; aucun sur les frères identiques (Fireball, Acid Arrow) */
  assert.deepEqual(ecarts, ["Light · niveau : SRD « 0 » / PHB « 1 »"]);
  assert.deepEqual(renommes, ["Zanthor's Acid Arrow = Acid Arrow (SRD)"]);
  /* ⚔️ l'autre sens de la bijection : un instantané qui se dit COMPLET nomme le sort SRD qu'il n'a pas */
  const complet = construireSorts(sourceSorts({ complet: true }), { srd });
  assert.ok(complet.ecarts.includes("Wish : le SRD porte ce sort, l'instantané du livre ne le nomme pas"));
  assert.ok(!complet.ecarts.some((e) => e.startsWith("Fireball : ")), "un sort nommé n'est pas perdu");
});

/* ══ 2 — LE PROPRE ENTRE, À LA PORTE DE SES CLASSES, ET LA FICHE LE LIT ════════════════════════════ */

test("2 — un sort propre au livre s'offre à la porte des classes qu'il liste, et la fiche le lit", () => {
  for (const [nom, pile] of [["SRD", PILE_SRD], ["FH", PILE_FH]]) {
    const { out, h } = magicien(pile);
    const portes = h.verbs.decisions({ document: out.document }).decisions;
    const mineurs = portes.find((p) => p.path === "class.cantrips").options;
    const prepares = portes.find((p) => p.path === "class.prepared").options;
    assert.ok(mineurs.includes("xphb:spell:en:test-ember"), `${nom} : le sort mineur du livre à la porte du magicien`);
    assert.ok(prepares.includes("xphb:spell:en:lantern-ward"), `${nom} : le sort de niveau 1 du livre à la porte du magicien`);
    /* le niveau borne toujours : un sort de niveau 2 n'est pas préparable au niveau 1 */
    assert.ok(!prepares.includes("xphb:spell:en:test-bolt"), `${nom} : Test Bolt (niveau 2) hors de portée au niveau 1`);
  }
  /* une classe que le sort ne liste pas ne le voit pas */
  const occ = makeHarness({ layers: pileAvecLivre(PILE_SRD, couche) });
  const docOcc = writers.composer({ name: "Témoin", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(occ.layers), id: "livre-389b", at: "2026-09-30T00:00:00Z" });
  const outOcc = occ.verbs.rebuild({ document: { ...docOcc, build: { ...docOcc.build, choices: [...docOcc.build.choices,
    { path: "class", ref: { kind: "class", id: "srd:class:en:warlock" } }, ...ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: 14 }))] } } });
  const mineursOcc = occ.verbs.decisions({ document: outOcc.document }).decisions.find((p) => p.path === "class.cantrips").options;
  assert.ok(!mineursOcc.includes("xphb:spell:en:test-ember"), "l'occultiste ne voit pas un sort que sa classe n'a pas");
  /* la fiche : le sort choisi, avec ses faits */
  const { out } = magicien(PILE_SRD, [["class.cantrips[0]", "xphb:spell:en:test-ember"], ["class.prepared[0]", "xphb:spell:en:lantern-ward"]]);
  const sorts = out.resolved.spellcasting.spells;
  const ember = sorts.find((s) => s.id === "test-ember");
  assert.deepEqual([ember.level, ember.castType, ember.range, ember.castingTime, ember.concentration],
    [0, "save", "60 feet", "Action", false]);
  const ward = sorts.find((s) => s.id === "lantern-ward");
  assert.deepEqual([ward.castingTime, ward.duration, ward.ritual, ward.concentration, ward.castType],
    ["Action or Ritual", "Concentration, up to 10 minutes", true, true, "none"]);
});

/* ══ 3 — LES FORMES ÉCRITES SE RELISENT, ET RIEN N'EST PROSE ═══════════════════════════════════════ */

test("3 — chaque sort du livre se relit en ses faits, porte un résumé marqué et le lien de sa page", () => {
  const faits = new Map(sourceSorts().spells.map((s) => [s.name, s]));
  for (const [id, rec] of Object.entries(records.spell)) {
    const d = rec.data;
    const f = faits.get(rec.name);
    /* relu par les règles de la comparaison, l'écrit redonne le compendium */
    const temps = d.casting_time.replace(/ or Ritual$/, "").replace(/^(Action|Bonus Action|Reaction)$/, "1 $1").toLowerCase();
    assert.equal(temps, f.casting_time.replace(/\s*\*$/, "").toLowerCase(), `${id} : temps`);
    assert.equal(d.duration.replace(/^Concentration,? up to /, "").toLowerCase(), f.duration.toLowerCase(), `${id} : durée`);
    assert.equal(d.range.replace(/ feet$/, " ft.").toLowerCase(), f.range.toLowerCase(), `${id} : portée`);
    assert.equal(d.casting_time.endsWith(" or Ritual"), f.ritual, `${id} : le rituel se lit dans le temps, comme au SRD`);
    assert.deepEqual([d.level, d.school, d.concentration, d.ritual, d.components], [f.level, f.school, f.concentration, f.ritual, f.components.join(", ")]);
    assert.deepEqual(d.classes, f.classes, `${id} : classes`);
    assert.equal(d.cantrip, f.level === 0);
    /* aucune prose : le texte est le résumé, marqué ; le lien mène à la page du livre */
    assert.equal(d.description, f.resume);
    assert.equal(d.summary_of, "phb-2024", `${id} : un texte sans la marque du résumé`);
    assert.equal(lienDuLivreDuJoueur(rec), f.url.startsWith("https://www.dndbeyond.com/") ? f.url : null);
  }
  assert.equal(lienDuLivreDuJoueur(records.spell["xphb:spell:en:test-ember"]), `${URL_SORTS}/test-ember`);
  /* le jet ou la sauvegarde, et les dés : des données, telles que le compendium les pose */
  assert.deepEqual([records.spell["xphb:spell:en:test-ember"].data.save_ability, records.spell["xphb:spell:en:test-ember"].data.damage],
    ["dex", [{ types: ["fire"], dice: "1d8" }]]);
  assert.deepEqual([records.spell["xphb:spell:en:test-bolt"].data.cast_type, records.spell["xphb:spell:en:test-bolt"].data.attack_range], ["attack", "ranged"]);
});

/* ══ 4 — LE GÉNÉRATEUR REFUSE PLUTÔT QUE D'INVENTER ════════════════════════════════════════════════ */

test("4 — un sort propre sans classes, ou un nom SRD qui ne répond pas, arrête le générateur", () => {
  const sansClasses = sourceSorts();
  delete sansClasses.spells.find((s) => s.name === "Lantern Ward").classes;
  assert.throws(() => construireSorts(sansClasses, { srd }), /Lantern Ward.*classes/);
  const faux = sourceSorts();
  faux.spells.find((s) => s.name === "Zanthor's Acid Arrow").srd_name = "Acid Sprinkle";
  assert.throws(() => construireSorts(faux, { srd }), /Acid Sprinkle/);
  const classeInconnue = sourceSorts();
  classeInconnue.spells.find((s) => s.name === "Test Bolt").classes = ["Artificer"];
  assert.throws(() => construireSorts(classeInconnue, { srd }), /Artificer/);
});

/* ══ 5 — LE GÉNÉRATEUR NE PORTE PAS LE LIVRE ═══════════════════════════════════════════════════════ */

test("5 — le générateur ne porte ni les noms ni les phrases des sorts du PHB", () => {
  const code = readFileSync(join(ROOT, "src/tools/gen-livre-layer.mjs"), "utf8");
  for (const mot of ["Toll the Dead", "Yolande", "Jallarzi", "Melf", "Bubbling Cauldron", "Arcane Vigor", "Power Word Fortify"]) {
    assert.equal(code.includes(mot), false, `« ${mot} » est un nom du PHB écrit DANS le générateur`);
  }
  /* ⚔️ le témoin : ces noms sont bien de ceux que le générateur sait traiter — depuis une source */
  const src = sourceSorts();
  src.spells.find((s) => s.name === "Test Ember").name = "Toll the Dead";
  assert.ok(construireSorts(src, { srd }).records.spell["xphb:spell:en:toll-the-dead"]);
});
