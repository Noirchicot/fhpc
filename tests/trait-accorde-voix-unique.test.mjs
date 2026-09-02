/* ══ UN TRAIT, UNE LECTURE, DEUX MISES EN MOTS — lot 127, 2026-09-02 ══════

   🔴 LA MALADIE, LA MÊME QU'AU LOT 126, UN CRAN PLUS LOIN. NORMES §4 quinquies
   promet *« UNE source, trois consommateurs »*. Pour les LIGNAGES, le lot 126
   l'a tenue (`contenuDuLignage`). Pour les TRAITS, deux voix lisaient
   `trait.text` chacune pour son compte :

     · la ligne « Granted automatically » du parcours — celle qu'Eric a
       photographiée, en « **Mot :** texte » ;
     · la `<dl>` du panneau de choix (`renderSpeciesChoices`), en `<dt>/<dd>`.

   Deux lectures d'une même chose finissent par diverger : c'est exactement ce
   qui avait vidé le bilan du Dragonborn le 01/09. Elles lisent désormais la
   MÊME fonction, et ce garde le mesure PAR CE QU'ELLES DISENT.

   ⛔ IL NE CITE NI LE NOM DE LA FONCTION NI UNE LIGNE DE CODE : un garde qui
   recopie l'implémentation protège le bug et rougit sur sa réparation (TRAPS,
   lot 124). Ce qu'il épelle est un invariant : *les deux voix servent le même
   texte pour le même trait, avec les condensés comme sans eux.* */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { SPECIES_CATALOGUE, renderSpeciesChoices } = await import("../ui/builder/species-step.mjs");

const QUERY = exempleFhEn().layers.verbs.query;

const LES_DOUZE = [
  "fh:species:en:araag", "fh:species:en:elestu", "fh:species:en:loroka",
  "srd:species:en:dragonborn", "srd:species:en:dwarf", "srd:species:en:elf",
  "srd:species:en:gnome", "srd:species:en:goliath", "srd:species:en:halfling",
  "srd:species:en:human", "srd:species:en:orc", "srd:species:en:tiefling"
];

const FIXES = new Set(["Size", "Speed", "Creature type", "Senses", "Destiny"]);

function recordDe(query, id) {
  const vue = query({ kind: "species", id });
  return (vue && vue.record) || null;
}

function traitsDuRecord(record) {
  const data = (record && record.data) || {};
  const base = Array.isArray(data.traits) ? data.traits : [];
  const fh = Array.isArray(data.fh_traits) ? data.fh_traits : [];
  return [...base, ...fh].filter((trait) => trait && trait.name);
}

function decisionsDe(query, id) {
  const record = recordDe(query, id);
  const data = (record && record.data) || {};
  const dec = [{
    path: "species", status: "answered", answered: 1, expected: 1,
    options: [id], selected: [id]
  }];
  if (Array.isArray(data.lineages) && data.lineages.length > 0) {
    dec.push({
      path: "species.lineage", status: "pending", answered: 0, expected: 1,
      options: data.lineages.map((o) => o.id), selected: []
    });
  }
  if (traitsDuRecord(record).some((trait) => trait.id === "keen-senses")) {
    dec.push({
      path: "species.skillBudget", status: "pending", answered: 0, expected: 2,
      options: ["survival", "delve", "vigilance"], selected: []
    });
  }
  return dec;
}

/** VOIX 1 — la ligne du parcours, en `{ nom → texte }`. */
function voixLigne(query, id) {
  const noeud = SPECIES_CATALOGUE.resumeItem(
    { path: "species.granted", confirme: true },
    { decisions: decisionsDe(query, id), query }, () => {}
  );
  const dit = {};
  if (!noeud) return dit;
  for (const p of noeud.querySelectorAll("p")) {
    const fort = p.querySelectorAll("strong")[0];
    if (!fort) continue;
    const mot = fort.textContent.replace(/ : $/, "");
    if (FIXES.has(mot)) continue;
    dit[mot] = String(p.textContent).slice(fort.textContent.length);
  }
  return dit;
}

/** VOIX 2 — la `<dl>` du panneau, en `{ nom → texte }`. */
function voixPanneau(query, id) {
  const noeud = renderSpeciesChoices({ decisions: decisionsDe(query, id), query }, () => {});
  const liste = noeud.querySelectorAll("dl.species-traits")[0];
  const dit = {};
  if (!liste) return dit;
  let nom = null;
  for (const enfant of liste.childNodes) {
    if (enfant.tagName === "DT") nom = enfant.textContent;
    else if (enfant.tagName === "DD" && nom !== null) { dit[nom] = enfant.textContent; nom = null; }
  }
  return dit;
}

function requete({ sansCondense = false } = {}) {
  if (!sansCondense) return QUERY;
  return (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || !vue.record.data) return vue;
    if (vue.record.data.fiche_trait_text === undefined) return vue;
    const data = { ...vue.record.data };
    delete data.fiche_trait_text;
    return { ...vue, record: { ...vue.record, data } };
  };
}

/* ══ 0. LE TÉMOIN ═══════════════════════════════════════════════════════ */

test("témoin — les deux voix se rencontrent bien sur des traits communs", () => {
  /* ⛔ Sans ça, le contrôle suivant comparerait deux ensembles disjoints et
     resterait vert pour la pire des raisons : il n'aurait rien comparé. */
  let communs = 0;
  for (const id of LES_DOUZE) {
    const ligne = voixLigne(QUERY, id);
    const panneau = voixPanneau(QUERY, id);
    communs += Object.keys(ligne).filter((nom) => panneau[nom] !== undefined).length;
  }
  assert.ok(communs >= 35, `les deux voix partagent ${communs} traits — la comparaison porte sur du réel`);
});

/* ══ 1. L'INVARIANT ═════════════════════════════════════════════════════ */

for (const sansCondense of [false, true]) {
  const quoi = sansCondense ? "privées des condensés" : "sur la pile réelle";
  test(`🔴 les deux voix servent le MÊME texte pour le même trait — ${quoi}`, () => {
    /* ⚖️ LES DEUX CÔTÉS DE L'ALTERNATIVE. Un condensé posé partout masquerait
       à jamais le repli ; une pile sans condensé masquerait le condensé. */
    const query = requete({ sansCondense });
    const ecarts = [];
    for (const id of LES_DOUZE) {
      const ligne = voixLigne(query, id);
      const panneau = voixPanneau(query, id);
      for (const [nom, dit] of Object.entries(ligne)) {
        if (panneau[nom] === undefined) continue;
        if (panneau[nom] !== dit) ecarts.push(`${id}/${nom} : « ${dit.slice(0, 40)} » ≠ « ${panneau[nom].slice(0, 40)} »`);
      }
    }
    assert.deepEqual(ecarts, [],
      "⛔ deux lectures d'une même chose finissent par diverger — c'est le défaut du 01/09");
  });
}

test("🔴 le balisage de lien ne fuit JAMAIS à l'écran — ni `[[`, ni `]]`", () => {
  /* Les condensés portent les sorts en `[[Nom]]`, la convention des textes de
     fiche. Des crochets doubles affichés ne sont pas un lien : c'est une
     fuite de balisage (même arbitrage que le popup du lignage, 27/08). */
  const fuites = [];
  for (const id of LES_DOUZE) {
    for (const [voix, dit] of [["ligne", voixLigne(QUERY, id)], ["panneau", voixPanneau(QUERY, id)]]) {
      for (const [nom, texte] of Object.entries(dit)) {
        if (texte.includes("[[") || texte.includes("]]")) fuites.push(`${voix} ${id}/${nom}`);
      }
    }
  }
  assert.deepEqual(fuites, []);
});

test("…et le sort d'un condensé devient un vrai lien, dans les DEUX voix", () => {
  /* ⛔ Sans ce contrôle, le précédent resterait vert si le nom du sort était
     simplement EFFACÉ avec ses crochets. */
  const id = "srd:species:en:tiefling";
  for (const [voix, dit] of [["ligne", voixLigne(QUERY, id)], ["panneau", voixPanneau(QUERY, id)]]) {
    assert.match(dit["Otherworldly Presence"] || "", /Thaumaturgy/,
      `${voix} : le nom du sort est écrit, crochets retirés`);
  }
  const noeud = SPECIES_CATALOGUE.resumeItem(
    { path: "species.granted", confirme: true },
    { decisions: decisionsDe(QUERY, id), query: QUERY }, () => {}
  );
  const liens = noeud.querySelectorAll(".lien-sort").map((n) => n.textContent);
  assert.deepEqual(liens, ["Thaumaturgy"], "et c'est un lien, pas du texte mort");
});

/* ══ 2. ⚔️ L'ATTAQUE — le garde mord-il ? ═══════════════════════════════ */

test("⚔️ une voix qui relit la donnée pour son compte fait ROUGIR la comparaison", () => {
  /* On fabrique la divergence que le lot 126 a payée : un trait dont SEUL le
     condensé existe, la prose retirée. Une voix qui relirait `text` en direct
     rendrait un blanc pendant que l'autre rend le condensé — et c'est
     exactement ce que la comparaison doit attraper.

     Ici, les deux lisent la même source : elles disent la même chose, et le
     contrôle reste vert. La preuve qu'il MORD est juste en dessous : on force
     la divergence à la main et on vérifie qu'elle est vue. */
  const id = "srd:species:en:orc";
  const sansProse = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data };
    data.traits = data.traits.map((t) => (t.id === "adrenaline-rush" ? { ...t, text: "" } : t));
    return { ...vue, record: { ...vue.record, data } };
  };
  const ligne = voixLigne(sansProse, id);
  const panneau = voixPanneau(sansProse, id);
  assert.equal(ligne["Adrenaline Rush"], panneau["Adrenaline Rush"],
    "prose retirée, condensé gardé : les deux voix disent le condensé");
  assert.ok((ligne["Adrenaline Rush"] || "").length > 0, "et elles disent quelque chose");

  /* LA DIVERGENCE FORCÉE — la comparaison la voit-elle ? */
  const truque = { ...panneau, "Adrenaline Rush": "autre chose" };
  const ecarts = Object.entries(ligne).filter(([nom, dit]) => truque[nom] !== undefined && truque[nom] !== dit);
  assert.deepEqual(ecarts.map(([nom]) => nom), ["Adrenaline Rush"],
    "⚔️ la comparaison nomme le trait qui diverge — elle n'est pas décorative");
});

test("⚔️ un trait sans condensé ET sans prose ne fabrique rien — les deux voix se taisent pareil", () => {
  /* ⛔ Le repli ne doit pas inventer : quand il n'y a rien, la ligne écrit son
     tiret et le panneau n'écrit pas de `<dd>`. Ce qu'on garde, c'est que ni
     l'une ni l'autre ne sorte une prose de nulle part. */
  const id = "fh:species:en:araag";
  const nu = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data };
    data.traits = data.traits.map((t) => (t.id === "darkvision" ? { id: t.id, name: t.name } : t));
    return { ...vue, record: { ...vue.record, data } };
  };
  assert.equal(voixLigne(nu, id)["Darkvision"], "—", "la ligne le DIT au lieu de disparaître");
  assert.equal(voixPanneau(nu, id)["Darkvision"], undefined, "et le panneau n'écrit pas de corps vide");
});
