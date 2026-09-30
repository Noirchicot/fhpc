/* ══ 🧬 LOT 387 — LE PHB 2024 ENTRE, PREMIÈRE MARCHE : LES ORIGINES ════════════════════════════════
   Mandat d'ARCHI 35 (30/09), et ses décisions du même jour :
   · (a) un record que le SRD 5.2.1 porte aussi n'est PAS réémis : il est COMPARÉ, fait par fait, et
     chaque écart se rapporte pour Eric. Réémettre effacerait ce que `srfh-mecaniques-en` déclare
     dessous (les livres se montent au-dessus d'elle, et un `add` remplace le record entier).
   · aucune PROSE du livre : l'instantané porte des faits de jeu ; le texte d'un record propre au livre
     est un résumé marqué (`summary_of`) ; une déclaration cite un extrait quand la phrase est celle
     du SRD, sinon elle porte un POINTEUR vers la page du livre chez D&D Beyond.
   · la loi des liens : un record du livre porte l'adresse de sa page (`book_link`).

   ── CE QUE CES GARDES TIENNENT (sur une FIXTURE, jamais sur le PHB) ─────────────────────────────
   1. Un record identique au SRD n'est pas réémis ; un écart planté se rapporte.
   2. Un record propre au livre entre, à sa place dans les deux piles, et la fiche le lit.
   3. Chaque déclaration du livre porte un extrait de sa pile ou un pointeur — jamais ni l'un ni l'autre.
   4. Aucune prose : tout texte d'un record du livre est un résumé marqué, et le lien mène au livre.
   5. Le générateur ne porte pas le livre.
   ⚔️ Chacune vue ROUGE sous une mutation (le rapport du lot 387 dit laquelle). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { makeHarness, manifestOf, readJson, ROOT } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";
import { construireOrigines } from "../src/tools/gen-livre-layer.mjs";
import { sourceFixture, coucheFixture, pileAvecLivre, PILE_SRD, PILE_FH, URL_FIXTURE } from "./fixture-livre-387.mjs";
import { lienDuLivreDuJoueur } from "../ui/builder/liens-fh.mjs";

const { layer, ecarts, restes } = coucheFixture();
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });

function perso(pile, { espece, fond, niveau }) {
  const h = makeHarness({ layers: pileAvecLivre(pile, layer) });
  const doc = writers.composer({ name: "Témoin", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(h.layers), id: "livre-387", at: "2026-09-30T00:00:00Z" });
  const choix = [{ path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } },
    ...ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: 12 }))];
  if (espece) choix.push({ path: "species", ref: { kind: "species", id: espece } });
  if (fond) choix.push({ path: "background", ref: { kind: "background", id: fond } });
  const base = doc.build.choices.filter((c) => !(niveau && c.path === "level"));
  if (niveau) base.push({ path: "level", value: niveau });
  const out = h.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...base, ...choix] } } });
  return { out, h };
}

/* ══ 1 — LE PARTAGÉ N'EST PAS RÉÉMIS ═══════════════════════════════════════════════════════════════ */

test("1 — un record identique au SRD n'est pas réémis, et un écart planté se rapporte pour Eric", () => {
  const ids = Object.values(layer.records).flatMap((genre) => Object.keys(genre));
  for (const id of ids) assert.ok(id.startsWith("xphb:"), `${id} : la couche n'ajoute que des ids du livre`);
  for (const nom of ["acolyte", "sage"]) assert.ok(!ids.some((id) => id.endsWith(`:background:en:${nom}`)), `${nom} n'est pas réémis`);
  assert.ok(!ids.some((id) => id.endsWith(":feat:en:alert")), "Alert n'est pas réémis");
  /* les écarts : UN par fait planté, et aucun sur le frère identique */
  assert.deepEqual(ecarts.map((e) => e.split(" · ")[0].split(" : ")[0]).sort(), ["Dwarf", "Sage"]);
  assert.match(ecarts.find((e) => e.startsWith("Sage")), /skill_ids/);
  assert.match(ecarts.find((e) => e.startsWith("Dwarf")), /traits/);
});

/* ══ 2 — LE PROPRE ENTRE, À SA PLACE, ET LA FICHE LE LIT ═══════════════════════════════════════════ */

test("2 — un record propre au livre entre dans les deux piles, et la fiche le lit", () => {
  for (const [nom, pile] of [["SRD", PILE_SRD], ["FH", PILE_FH]]) {
    const { out, h } = perso(pile, { espece: "xphb:species:en:glimmerkin", fond: "xphb:background:en:lamplighter" });
    const r = out.resolved;
    assert.deepEqual(r.senses.find((s) => s.id === "darkvision").value, 60, nom);
    assert.deepEqual(r.resources.find((x) => x.id === "mending-spark"),
      { id: "mending-spark", name: "Mending Spark", max: 1, current: 1, recharge: "long" }, nom);
    assert.equal(r.actions.find((a) => a.id === "mending-spark").economy, "action", nom);
    /* le trait daté du niveau 3 attend son niveau (la loi du lot 385 vaut pour un livre) */
    assert.equal(r.traits.find((t) => t.id === "late-bloom"), undefined, `${nom} : Late Bloom au niveau 1`);
    /* la porte de l'arrière-plan : l'outil de sa famille, et le don propre au livre */
    const portes = h.verbs.decisions({ document: out.document }).decisions;
    assert.deepEqual(portes.find((p) => p.path === "background.tool").options, ["srd:tool:en:gaming-set"], nom);
    assert.equal(portes.find((p) => p.path === "species.size").options.length, 2, nom);
  }
  const niveau3 = perso(PILE_SRD, { espece: "xphb:species:en:glimmerkin", niveau: 3 }).out;
  assert.ok(niveau3.resolved.traits.find((t) => t.id === "late-bloom"), "Late Bloom au niveau 3");
  /* le don propre au livre compte ses points par la forme du lot 384 (`sheet_uses`) */
  const fortune = layer.records.feat["xphb:feat:en:test-fortune"].data.sheet_uses[0];
  assert.deepEqual([fortune.max, fortune.recharge], [{ proficiency: 1 }, "long"]);
});

/* ══ 3 — UN EXTRAIT DE SA PILE, OU UN POINTEUR ═════════════════════════════════════════════════════ */

/** Toutes les déclarations d'un record du livre : `{ou, decl}`. */
function declarations(id, data) {
  const out = [];
  for (const u of data.trait_uses || []) { out.push({ ou: `${id} usage ${u.trait}`, decl: u }); if (u.action) out.push({ ou: `${id} action ${u.trait}`, decl: u.action }); }
  for (const n of data.trait_levels || []) out.push({ ou: `${id} niveau ${n.trait}`, decl: n });
  for (const u of data.sheet_uses || []) out.push({ ou: `${id} usage ${u.id}`, decl: u });
  if (data.size_choice) { out.push({ ou: `${id} taille`, decl: data.size_choice }); for (const o of data.size_choice.options) out.push({ ou: `${id} taille ${o.id}`, decl: o }); }
  for (const [cle, valeur] of Object.entries(data)) {
    if (cle.startsWith("choix_du_texte:")) for (const [k, d] of Object.entries(valeur)) out.push({ ou: `${id} choix ${k}`, decl: d });
  }
  return out;
}
const textesDu = (data) => { const t = []; const w = (o) => { if (typeof o === "string") t.push(o); else if (o && typeof o === "object") Object.values(o).forEach(w); }; w(data); return t; };

test("3 — chaque déclaration du livre porte un extrait de sa pile ou un pointeur, jamais ni l'un ni l'autre", () => {
  const vues = [];
  for (const [genre, records] of Object.entries(layer.records)) {
    for (const [id, rec] of Object.entries(records)) {
      /* le texte du record : tout ce qui n'est pas une déclaration */
      const textes = textesDu(Object.fromEntries(Object.entries(rec.data)
        .filter(([k]) => !k.startsWith("choix_du_texte:") && !["trait_uses", "trait_levels", "sheet_uses", "size_choice"].includes(k))));
      for (const { ou, decl } of declarations(id, rec.data)) {
        const extrait = typeof decl.extrait === "string" && textes.some((t) => t.includes(decl.extrait));
        const pointeur = decl.source && typeof decl.source.url === "string" && decl.source.url.startsWith("https://www.dndbeyond.com/");
        assert.ok(extrait || pointeur, `${ou} : ni extrait de sa pile, ni pointeur (${genre})`);
        assert.ok(!(typeof decl.extrait === "string" && decl.source), `${ou} : extrait ET pointeur — un seul des deux`);
        vues.push(`${ou}:${extrait ? "extrait" : "pointeur"}`);
      }
    }
  }
  /* ⭐ l'extrait n'est posé que quand la phrase est CELLE DU SRD : « Choose one kind of Gaming Set »
     y est (Soldier), « Choose one kind of Musical Instrument » n'y est pas */
  assert.ok(vues.includes("xphb:background:en:lamplighter choix outil:extrait"));
  assert.ok(vues.includes("xphb:background:en:busker choix outil:pointeur"));
  assert.ok(vues.includes("xphb:species:en:glimmerkin usage mending-spark:pointeur"));
  /* 14, relevées une à une le 30/09 : 2 × 2 choix d'arrière-plan, 5 usages/actions/niveaux et 4 tailles
     de la Glimmerkin, 1 usage de Test Fortune */
  assert.equal(vues.length, 14, `témoin : ${vues.join(" · ")}`);
});

/* ══ 4 — AUCUNE PROSE, ET LE LIEN MÈNE AU LIVRE ════════════════════════════════════════════════════ */

test("4 — tout texte d'un record du livre est un résumé marqué, et son lien mène à sa page", () => {
  for (const [genre, records] of Object.entries(layer.records)) {
    for (const [id, rec] of Object.entries(records)) {
      const prose = typeof rec.data.description === "string" || (rec.data.traits || []).some((t) => typeof t.text === "string");
      if (prose) assert.equal(rec.data.summary_of, "phb-2024", `${id} : un texte sans la marque du résumé`);
      assert.ok(lienDuLivreDuJoueur(rec), `${id} (${genre}) : pas d'adresse chez D&D Beyond`);
    }
  }
  assert.equal(lienDuLivreDuJoueur(layer.records.species["xphb:species:en:glimmerkin"]), `${URL_FIXTURE}/glimmerkin`);
  assert.equal(lienDuLivreDuJoueur({ data: { book_link: "https://example.com/x" } }), null, "une adresse hors de D&D Beyond n'ouvre rien");
  assert.match(layer.attribution.text, /RÉSUMÉS/);
  /* et ce qui ne se met pas en données est rapporté avec sa raison, jamais inventé */
  assert.ok(restes.some((r) => r.startsWith("Glimmerkin · Glow Ward : les résistances")));
  assert.ok(restes.some((r) => r.startsWith("Test Hardiness : les points de vie")));
});

/* ══ 5 — LE GÉNÉRATEUR NE PORTE PAS LE LIVRE ═══════════════════════════════════════════════════════ */

test("5 — le générateur ne porte ni les noms ni les phrases du PHB", () => {
  const code = readFileSync(join(ROOT, "src/tools/gen-livre-layer.mjs"), "utf8");
  for (const mot of ["Aasimar", "Wayfarer", "Celestial Revelation", "Tavern Brawler", "Healing Hands", "Crafter"]) {
    assert.equal(code.includes(mot), false, `« ${mot} » est un nom du PHB écrit DANS le générateur`);
  }
  /* ⚔️ le témoin : ces noms sont bien de ceux que le générateur sait traiter — depuis une source */
  const src = sourceFixture();
  src.species_new[0].name = "Aasimar";
  assert.ok(construireOrigines(src, { srd: readJson("layers/srd-5.2.1-en.layer.json"), meca: readJson("layers/srfh-mecaniques-en.layer.json") })
    .layer.records.species["xphb:species:en:aasimar"]);
});
