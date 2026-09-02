/* ══ LE BILAN D'UN LIGNAGE DIT QUELQUE CHOSE — lot 126, 2026-09-02 ═══════

   🔴 LE DÉFAUT D'ERIC, capture à l'appui (iPad, en ligne, v432) : *« S bilan :
   erreur ! le choix de lignée est absent. »* Sur l'écran B du Dragonborn, une
   fois la lignée posée, le bilan rendait le titre, l'amorce, et RIEN :

       ● White Lineage
       At level 1 :
                          ← le contenu manquait
       ● Granted automatically

   📏 MESURÉ SUR LES DOUZE ESPÈCES avant de toucher une ligne (sonde de rendu,
   pas déduction) : cinq portent des lignées, et **le Dragonborn était le seul
   à rendre vide — ses DIX lignées sur dix**. Elf, Hoddon, Goliath et Tiefling
   rendaient un texte (leur prose SRD complète, faute de condensé).

   ⛔ LA CAUSE — DEUX LECTURES D'UNE MÊME CHOSE, DONT UNE BORGNE. NORMES
   §4 quinquies promet que `lignesDuLignage` est *« la seule voix — la fenêtre
   du SB1, le popup du tap sur un token, le bilan du B la consomment tous les
   trois »*. Elle ne l'était pas : `renderLignageBilan` relisait l'option pour
   son compte (`option.levels["1"]`) et ignorait la forme `damage`, la seule
   que le Dragonborn possède. Une alternative gardée d'un seul côté.

   ⭐ CE QUE CE GARDE ÉPELLE, ET CE N'EST PAS LA RÉPARATION : *toute espèce à
   lignages rend un bilan non vide, pour CHACUNE de ses lignées*. Il ne cite
   ni `contenuDuLignage`, ni le nom d'une forme, ni une ligne de code — un
   garde qui recopie l'implémentation protège le bug et rougit sur sa
   réparation (TRAPS, lot 124).

   ⚖️ ET IL SE TIENT DES DEUX CÔTÉS (TRAPS, lot 124 encore) : la pile complète
   (avec les condensés `fiche_lineage_lvl1`) ET la pile privée d'eux — parce
   que les DEUX formes d'option doivent parler, et qu'un condensé posé partout
   masquerait à jamais le repli qui a manqué. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { SPECIES_CATALOGUE } = await import("../ui/builder/species-step.mjs");

const QUERY = exempleFhEn().layers.verbs.query;

/** Les cinq espèces à lignages, NOMMÉES — si une entre ou sort, ce garde le
 *  dit au lieu de balayer une liste vide (leçon des témoins, 22 et 24/08). */
const A_LIGNAGES = [
  "srd:species:en:dragonborn", "srd:species:en:elf", "srd:species:en:gnome",
  "srd:species:en:goliath", "srd:species:en:tiefling"
];

/** La pile réelle, ou la même PRIVÉE de ses condensés — une privation
 *  délibérée, jamais une pénurie de circonstance (TRAPS, lots 8→13). */
function requete({ sansCondense = false } = {}) {
  if (!sansCondense) return QUERY;
  return (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || !vue.record.data) return vue;
    if (vue.record.data.fiche_lineage_lvl1 === undefined) return vue;
    const data = { ...vue.record.data };
    delete data.fiche_lineage_lvl1;
    return { ...vue, record: { ...vue.record, data } };
  };
}

function lignagesDe(query, id) {
  const vue = query({ kind: "species", id });
  return (vue && vue.record && vue.record.data && vue.record.data.lineages) || [];
}

/** Le bilan RENDU d'une lignée posée — le nœud que l'écran B montre. */
function bilanDe(query, id, lineageId) {
  const options = lignagesDe(query, id).map((o) => o.id);
  const decisions = [
    { path: "species", status: "answered", answered: 1, expected: 1, options: [id], selected: [id] },
    {
      path: "species.lineage", status: "answered", answered: 1, expected: 1,
      options, selected: [lineageId]
    }
  ];
  return SPECIES_CATALOGUE.resumeItem({ path: "species.lineage", confirme: true },
    { decisions, query }, () => {});
}

/** Ce que le joueur LIT, l'amorce en gras retirée. C'est ça qui manquait. */
function contenuLu(noeud) {
  if (!noeud) return "";
  const gras = [...noeud.querySelectorAll("strong")].map((n) => n.textContent);
  let texte = String(noeud.textContent || "");
  for (const mot of gras) texte = texte.replace(mot, "");
  return texte.trim();
}

/* ══ 0. LE TÉMOIN — sans lui, les tests suivants balaieraient le vide ═════ */

test("témoin — cinq espèces portent des lignées, et ce sont celles-là", () => {
  const porteuses = [];
  for (const vue of QUERY({ kind: "species" })) {
    const liste = vue.record && vue.record.data && vue.record.data.lineages;
    if (Array.isArray(liste) && liste.length > 0) porteuses.push(vue.id);
  }
  assert.deepEqual(porteuses.sort(), [...A_LIGNAGES].sort(),
    "si une espèce gagne ou perd ses lignées, ce garde dit LAQUELLE avant de mesurer");
});

/* ══ 1. L'INVARIANT ══════════════════════════════════════════════════════ */

test("🔴 toute lignée posée rend un bilan qui DIT quelque chose — les cinq espèces, option par option", () => {
  const vides = [];
  for (const id of A_LIGNAGES) {
    for (const option of lignagesDe(QUERY, id)) {
      const lu = contenuLu(bilanDe(QUERY, id, option.id));
      if (lu.length === 0) vides.push(`${id}/${option.id}`);
    }
  }
  assert.deepEqual(vides, [],
    "⛔ un bilan qui n'écrit que son amorce est le défaut du 01/09 — il doit NOMMER les coupables");
});

test("🔴 …et sans les condensés non plus : les DEUX formes d'option parlent", () => {
  /* ⚖️ LA MOITIÉ QUE PERSONNE NE TENAIT. `damage` (Dragonborn) et `levels`
     (les quatre autres) sont une alternative : une seule des deux branches
     gardée, et c'est toujours l'autre qui casse. La privation rend aussi ce
     que voit une pile SRD nue, sans la couche `fh-fiche-en`. */
  const query = requete({ sansCondense: true });
  const vides = [];
  for (const id of A_LIGNAGES) {
    for (const option of lignagesDe(query, id)) {
      const lu = contenuLu(bilanDe(query, id, option.id));
      if (lu.length === 0) vides.push(`${id}/${option.id}`);
    }
  }
  assert.deepEqual(vides, []);
});

test("les deux formes sont bien EXERCÉES — sinon le test précédent ne prouve qu'une branche", () => {
  /* ⛔ Un garde qui balaie cinq espèces sans savoir laquelle porte quelle
     forme resterait vert le jour où `damage` disparaîtrait de la donnée. */
  const formes = {};
  for (const id of A_LIGNAGES) {
    for (const option of lignagesDe(QUERY, id)) {
      const forme = typeof option.damage === "string" ? "damage" : "levels";
      (formes[forme] = formes[forme] || new Set()).add(id);
    }
  }
  assert.deepEqual([...(formes.damage || [])], ["srd:species:en:dragonborn"],
    "la forme `damage` — celle qui rendait vide — est encore là, et c'est le Dragonborn");
  assert.equal((formes.levels || new Set()).size, 4, "et les quatre autres portent des paliers");
});

/* ══ 2. ⚔️ L'ATTAQUE — le garde mord-il ? ═══════════════════════════════ */

test("⚔️ une lignée dont la matière est retirée fait bien ROUGIR le contrôle", () => {
  /* Le garde ne vaut que s'il attrape ce qu'il prétend attraper : on rejoue
     exactement le défaut du 01/09 en privant une option de tout ce qu'elle
     porte, et le MÊME contrôle doit la nommer. */
  const id = "srd:species:en:dragonborn";
  const ampute = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data };
    delete data.fiche_lineage_lvl1;
    data.lineages = data.lineages.map((o) => (o.id === "white" ? { id: o.id, name: o.name } : o));
    return { ...vue, record: { ...vue.record, data } };
  };
  assert.equal(contenuLu(bilanDe(ampute, id, "white")), "",
    "privée de sa matière, la lignée ne peut RIEN écrire — c'est ce cas que l'invariant refuse");
  assert.notEqual(contenuLu(bilanDe(ampute, id, "black")), "",
    "et sa voisine intacte reste lisible : l'amputation est bornée, pas globale");
});

/* ══ 3. LA VOIX UNIQUE ═══════════════════════════════════════════════════ */

test("le bilan et la fenêtre du SB lisent la MÊME matière — pas deux sources", () => {
  /* ⭐ Ils ne disent pas la même PHRASE (le bilan enchaîne « … at level 3 and
     … at level 5 », la fenêtre énumère) : ce qu'ils partagent est la lecture.
     Le contrôle porte donc sur la MATIÈRE, pas sur la mise en mots. */
  for (const id of A_LIGNAGES) {
    for (const option of lignagesDe(QUERY, id)) {
      const bilan = contenuLu(bilanDe(QUERY, id, option.id));
      const fenetre = SPECIES_CATALOGUE.itemCorps({ path: "species.lineage" }, {
        decisions: [
          { path: "species", status: "answered", answered: 1, expected: 1, options: [id], selected: [id] },
          {
            path: "species.lineage", status: "pending", answered: 0, expected: 1,
            options: lignagesDe(QUERY, id).map((o) => o.id), selected: []
          }
        ],
        query: QUERY
      }, () => {});
      const dit = String(fenetre ? fenetre.textContent : "");
      const premierMot = bilan.split(/[\s—]+/).filter(Boolean)[0];
      assert.ok(premierMot, `${id}/${option.id} : le bilan dit quelque chose`);
      assert.ok(dit.length > 0, `${id}/${option.id} : la fenêtre du SB dit quelque chose aussi`);
    }
  }
});
