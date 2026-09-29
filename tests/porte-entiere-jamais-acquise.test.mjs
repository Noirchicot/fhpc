/* ══ LOT 365 (a) — UNE CAPACITÉ À PORTE ENTIÈRE N'EST JAMAIS « ACQUISE » ════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 365 trois retouches.md` (ARCHI 35, 29/09).

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER — relevé par le lot 360 sur v913 : Weapon
   Mastery s'affichait à la fois comme porte et dans « Granted automatically », chez les
   cinq classes à maîtrise ; Eldritch Invocations aussi chez le Warlock. Le lot 360
   n'avait sorti que les capacités dont la porte est un `feature_choices` (Divine Order,
   Primal Order, Fighting Style), rapprochées par le NOM de leur déclaration. Eric, 26/08 :
   *« soit la porte, soit le résumé, jamais les deux »*.

   ⭐ LA RÈGLE, PAR LA DONNÉE, ET SA PORTÉE DÉCLARÉE (ARCHI 35, 29/09) : une capacité de
   classe « a une porte » quand une déclaration `creation` d'une couche
   (`data[choix_du_texte:<couche>]`) porte un extrait de SON texte et un chemin de l'étape
   Class. Chaque telle déclaration dit sa `portee` : `entiere` (la porte EST la capacité),
   `partielle` (la porte n'en est qu'une part : Spellcasting, Pact Magic). Ce garde :
   ① exige le champ, et une seule portée par capacité ;
   ② lit « Granted automatically » tel que l'écran le rend : une capacité entière n'y est
     pas, une partielle y est ;
   ③ croise avec le libellé de la porte : un libellé ÉGAL au nom de sa capacité mais une
     portée déclarée partielle accuse.
   ⛔ Aucune liste de noms : les capacités sortent de la donnée, dans les deux piles. Les
   seuls noms écrits ici sont des TÉMOINS (le garde a bien vu Weapon Mastery et
   Spellcasting), jamais la règle. */
import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, PILE_SRD } from "./build-harness.mjs";

globalThis.document = createTestDocument();
const { PILE } = await import("../src/tools/exemple-fh-en.mjs");
const { CLASS_CATALOGUE, LIGNE_ACQUIS_CLASSE } = await import("../ui/builder/class-step.mjs");

const PILES = { SRD: makeHarness({ layers: PILE_SRD }), FH: makeHarness({ layers: PILE }) };
const PORTEES = ["entiere", "partielle"];

function docDe(h, choices) {
  return {
    schema: "fh-char/1", id: "porte-entiere", name: "Porte entière", lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-29T00:00:00Z", modified: "2026-09-29T00:00:00Z",
    build: { layers: manifestOf(h.layers), choices: [{ path: "level", value: 1 }, ...choices], budgets: {}, overrides: [], confirmed: [] }
  };
}
const ctxDeLaClasse = (h, id) => {
  const decisions = h.verbs.decisions({ document: docDe(h, [{ path: "class", ref: { kind: "class", id } }]) }).decisions || [];
  return { decisions, query: h.layers.verbs.query, path: "class", kind: "class", label: "class", cursor: 0 };
};

/** LA DONNÉE, LUE SANS L'ÉCRAN — les capacités de niveau 1 d'une classe qui ont une porte,
 *  avec chacune de leurs déclarations. ⛔ Ce garde ne passe pas par la fonction qu'il juge. */
function capacitesAPorte(record) {
  const data = record.data || {};
  const niveau1 = (Array.isArray(data.features) ? data.features : [])
    .filter((f) => f && f.level === 1 && typeof f.name === "string" && typeof f.description === "string");
  const capacites = new Map();
  for (const [cle, declarations] of Object.entries(data)) {
    if (!cle.startsWith("choix_du_texte:") || !declarations || typeof declarations !== "object") continue;
    for (const [id, d] of Object.entries(declarations)) {
      if (!d || d.nature !== "creation" || typeof d.chemin !== "string" || !d.chemin.startsWith("class.")) continue;
      for (const f of niveau1.filter((x) => typeof d.extrait === "string" && x.description.includes(d.extrait))) {
        if (!capacites.has(f.name)) capacites.set(f.name, []);
        capacites.get(f.name).push({ couche: cle, id, chemin: d.chemin, portee: d.portee });
      }
    }
  }
  return capacites;
}
/** Les têtes de « Granted automatically », telles que l'écran les rend (`.bilan-ligne` › `strong`). */
function tetesDesAcquis(ctx) {
  const bloc = CLASS_CATALOGUE.resumeItem({ path: LIGNE_ACQUIS_CLASSE.path }, ctx, () => {});
  return bloc ? bloc.querySelectorAll(".bilan-ligne").map((l) => l.childNodes[0].textContent.replace(/\s*:\s*$/, "").trim()) : [];
}
/** Les classes de la pile : l'id est porté par la VUE, le nom et la donnée par le record. */
const classesDe = (h) => (h.layers.verbs.query({ kind: "class" }) || [])
  .map((v) => ({ id: v.id, name: v.record.name, data: v.record.data || {} }));

test("① la portée est DÉCLARÉE sur toute capacité de classe qui a une porte, et une seule par capacité, dans les deux piles", () => {
  for (const [pile, h] of Object.entries(PILES)) {
    let vues = 0;
    for (const record of classesDe(h)) {
      for (const [nom, declarations] of capacitesAPorte(record)) {
        vues += 1;
        for (const d of declarations) {
          assert.ok(PORTEES.includes(d.portee),
            `${pile} ${record.name} « ${nom} » : la déclaration ${d.couche} › ${d.id} (${d.chemin}) ne dit pas sa portée (${d.portee})`);
        }
        const distinctes = [...new Set(declarations.map((d) => d.portee))];
        assert.equal(distinctes.length, 1, `${pile} ${record.name} « ${nom} » : deux portées pour une capacité (${distinctes.join(", ")})`);
      }
    }
    assert.ok(vues >= 10, `témoin : ${pile} — le garde a lu ${vues} capacités à porte, il doit en voir`);
    const guerrier = classesDe(h).find((r) => r.id === "srd:class:en:fighter");
    assert.equal(capacitesAPorte(guerrier).get("Weapon Mastery")?.[0]?.portee, "entiere", `témoin : ${pile} — Weapon Mastery du Fighter`);
    const magicien = classesDe(h).find((r) => r.id === "srd:class:en:wizard");
    assert.equal(capacitesAPorte(magicien).get("Spellcasting")?.[0]?.portee, "partielle", `témoin : ${pile} — Spellcasting du Wizard`);
  }
});

test("② ⛔ une capacité ENTIÈRE n'est pas dans « Granted automatically » ; une PARTIELLE y est — l'écran lu, dans les deux piles", () => {
  for (const [pile, h] of Object.entries(PILES)) {
    for (const record of classesDe(h)) {
      const capacites = capacitesAPorte(record);
      if (capacites.size === 0) continue;
      const tetes = tetesDesAcquis(ctxDeLaClasse(h, record.id));
      assert.ok(tetes.length > 0, `témoin : ${pile} ${record.name} — le bilan « Granted automatically » a des lignes`);
      for (const [nom, declarations] of capacites) {
        if (declarations[0].portee === "entiere") {
          assert.ok(!tetes.includes(nom), `${pile} ${record.name} : « ${nom} » a sa porte ET figure dans « Granted automatically » — jamais les deux`);
        } else {
          assert.ok(tetes.includes(nom), `${pile} ${record.name} : « ${nom} » n'a qu'une porte PARTIELLE et doit rester dans « Granted automatically »`);
        }
      }
    }
  }
});

test("③ témoin croisé : une porte au libellé ÉGAL au nom de sa capacité ne peut pas être déclarée partielle", () => {
  for (const [pile, h] of Object.entries(PILES)) {
    let croisees = 0;
    for (const record of classesDe(h)) {
      const ctx = ctxDeLaClasse(h, record.id);
      for (const [nom, declarations] of capacitesAPorte(record)) {
        for (const d of declarations) {
          const libelle = String(CLASS_CATALOGUE.itemLabel(d.chemin, ctx) || "").trim().toLowerCase();
          if (libelle !== nom.trim().toLowerCase()) continue;
          croisees += 1;
          assert.equal(d.portee, "entiere",
            `${pile} ${record.name} : la porte « ${CLASS_CATALOGUE.itemLabel(d.chemin, ctx)} » porte le nom de « ${nom} » et se dit partielle`);
        }
      }
    }
    assert.ok(croisees >= 5, `témoin : ${pile} — ${croisees} portes au nom de leur capacité ont été croisées`);
  }
});
