/* ══ CE QU'UN TRAIT ACCORDE SE LIT D'UN COUP D'ŒIL — lot 127, 2026-09-02 ══

   🔴 LE DÉFAUT D'ERIC, capture à l'appui : *« dragonborn S : granted texte pas
   conforme »*. Sous « Granted automatically », l'écran S servait la PROSE DU
   SRD recopiée telle quelle — Breath Weapon 833 caractères, Draconic Flight
   480 — et la fenêtre la coupait en plein mot.

   📏 MESURÉ AU RENDU, SUR LES DOUZE ESPÈCES, avant de toucher une ligne
   (375 × 812, fenêtre du parcours 335 px de large) :

       Dragonborn 614 px de contenu pour 251 de fenêtre — 363 sous le pli
       Dwarf      353 · Orc 332 · Halfling 301 · Elf 283 · Goliath 271
       Araag      231 · Human 206 · Hoddon 171 — rien sous le pli

   ⭐ LE TÉMOIN ÉTAIT DÉJÀ ÉCRIT, ET C'EST ERIC QUI L'AVAIT ÉCRIT. Les traits
   qu'il a rédigés lui-même pour ses espèces tiennent en **39 à 77
   caractères** (Araag : 39, 44, 45, 74 · Human : 46, 57, 77), et les
   condensés de lignée posés au lot 126 en **33 à 102**. Les seules proses qui
   débordent sont celles recopiées du SRD. ⛔ Aucun seuil inventé ici : le
   plafond de ce garde est **102**, et c'est une cote DONNÉE — la longueur du
   plus long condensé déjà au dépôt (`rock-folk`, chez le Hoddon).

   ⚖️ ET LE PLAFOND EST GARDÉ CONTRE SA PROPRE SOURCE : un témoin qui se
   recalculerait sur la donnée ne pourrait jamais accuser (leçon du 22 et du
   24/08). On l'écrit, et on vérifie que la mesure d'où il vient n'a pas bougé.

   ⚠️ CE QUE CE GARDE ÉPELLE : *le texte qu'un trait sert à l'écran tient dans
   la bande — et, privé de son condensé, il sert quand même sa prose.* Les
   DEUX branches du repli, parce qu'une alternative gardée d'un seul côté est
   toujours l'autre qui casse (TRAPS, lot 124 ; lot 126 l'a repayé). */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { SPECIES_CATALOGUE, renderSpeciesChoices } = await import("../ui/builder/species-step.mjs");

const QUERY = exempleFhEn().layers.verbs.query;

/** 📏 LA COTE DONNÉE — la longueur du plus long condensé de lignée du dépôt.
 *  Écrite, pas recalculée : un plafond qui se déduit de la donnée qu'il borne
 *  monte tout seul le jour où quelqu'un écrit un pavé. */
const PLAFOND = 102;

/** Les douze espèces, NOMMÉES — si une entre ou sort, ce garde le dit avant
 *  de mesurer quoi que ce soit (leçon du témoin, 22 et 24/08). */
const LES_DOUZE = [
  "fh:species:en:araag", "fh:species:en:elestu", "fh:species:en:loroka",
  "srd:species:en:dragonborn", "srd:species:en:dwarf", "srd:species:en:elf",
  "srd:species:en:gnome", "srd:species:en:goliath", "srd:species:en:halfling",
  "srd:species:en:human", "srd:species:en:orc", "srd:species:en:tiefling"
];

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

/** La pile réelle, ou la même PRIVÉE des condensés de trait — une privation
 *  DÉLIBÉRÉE, jamais une pénurie de circonstance (TRAPS, lots 8→13). */
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

/** Les décisions d'un écran S : l'espèce retenue, plus les plans que les
 *  autres lignes portent — ce sont eux qui décident quels traits la ligne
 *  « gagné d'office » laisse aux autres (`TRAITS_COUVERTS`). */
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

/** VOIX 1 — la ligne « Granted automatically » du parcours, celle qu'Eric a
 *  photographiée. Rend `[nom, texte]` pour les traits seuls : les cinq
 *  premières lignes (Size, Speed, Creature type, Senses, Destiny) ne sont pas
 *  des traits, et elles ne sont pas toutes présentes partout. */
const FIXES = new Set(["Size", "Speed", "Creature type", "Senses", "Destiny"]);

function ligneAccordee(query, id) {
  const noeud = SPECIES_CATALOGUE.resumeItem(
    { path: "species.granted", confirme: true },
    { decisions: decisionsDe(query, id), query }, () => {}
  );
  if (!noeud) return [];
  return noeud.querySelectorAll("p").map((p) => {
    const fort = p.querySelectorAll("strong")[0];
    const mot = fort ? fort.textContent.replace(/ : $/, "") : "";
    const dit = String(p.textContent).slice(fort ? fort.textContent.length : 0);
    return [mot, dit];
  }).filter(([mot]) => mot && !FIXES.has(mot));
}

/** VOIX 2 — la `<dl>` du panneau de choix (`renderSpeciesChoices`). */
function panneauAccorde(query, id) {
  const noeud = renderSpeciesChoices({ decisions: decisionsDe(query, id), query }, () => {});
  const liste = noeud.querySelectorAll("dl.species-traits")[0];
  if (!liste) return [];
  const paires = [];
  let nom = null;
  for (const enfant of liste.childNodes) {
    if (enfant.tagName === "DT") nom = enfant.textContent;
    else if (enfant.tagName === "DD" && nom !== null) { paires.push([nom, enfant.textContent]); nom = null; }
  }
  return paires;
}

/** VOIX 3 — les traits que la LIGNÉE porte, servis par le SB (lot 128,
 *  2026-09-02). Sans elle, ce garde aurait perdu `Breath Weapon` sans le dire
 *  le jour où ce trait a quitté « gagné d'office » : sa couverture aurait
 *  rétréci en silence, et l'invariant (« TOUT trait servi à l'écran tient dans
 *  la bande ») serait devenu faux sans qu'un seul test rougisse.
 *
 *  ⚖️ C'est la forme GÉNÉRALE qui se mesure ici, et c'est la bonne : elle rend
 *  exactement ce que `contenuDuTrait` lit, donc la même chose que les voix 1
 *  et 2. La forme SPÉCIFIQUE ajoute l'élément et son tiret (7 à 12 car.) — une
 *  mise en mots dictée par Eric, pas un texte : elle est gardée pour ce
 *  qu'elle est dans `tests/lignee-porte-ses-traits.test.mjs`. */
function ligneDeLignee(query, id) {
  const noeud = SPECIES_CATALOGUE.itemCorps(
    { path: "species.lineage" }, { decisions: decisionsDe(query, id), query }, () => {}
  );
  if (!noeud) return [];
  return noeud.querySelectorAll(".trait-de-lignee").map((p) => {
    const fort = p.querySelectorAll("strong")[0];
    const mot = fort ? fort.textContent.replace(/ : $/, "") : "";
    const dit = String(p.textContent).slice(fort ? fort.textContent.length : 0);
    return [mot, dit];
  }).filter(([mot]) => mot);
}

/** LES TROIS VOIX D'UN COUP — c'est « servi à l'écran » qui est gardé, pas un
 *  bloc en particulier. Un trait qui déménage d'une voix à l'autre reste
 *  couvert ; un trait qui sort des trois se verrait au témoin de compte. */
function toutCeQuiEstServi(query, id) {
  return [...ligneAccordee(query, id), ...panneauAccorde(query, id), ...ligneDeLignee(query, id)];
}

/* ══ 0. LES TÉMOINS — sans eux, les tests suivants balaieraient le vide ══ */

test("témoin — douze espèces, quarante-sept traits, trente-trois traits distincts", () => {
  const ids = QUERY({ kind: "species" }).map((vue) => vue.id).sort();
  assert.deepEqual(ids, [...LES_DOUZE].sort(),
    "si une espèce entre ou sort, ce garde le DIT avant de mesurer");
  let total = 0;
  const distincts = new Set();
  for (const id of LES_DOUZE) {
    for (const trait of traitsDuRecord(recordDe(QUERY, id))) {
      total += 1;
      distincts.add(trait.id);
      assert.ok(trait.id, `${id} : un trait sans id ne peut porter aucun condensé — ${trait.name}`);
    }
  }
  assert.equal(total, 47, "47 traits sur les douze — mesuré au rendu le 02/09");
  assert.equal(distincts.size, 33, "33 ids distincts : Trance, Versatile, Darkvision… se répètent d'une espèce à l'autre");
});

test("témoin — le plafond 102 est bien la cote du plus long condensé de LIGNÉE du dépôt", () => {
  /* ⚖️ Le plafond est ÉCRIT plus haut. Ici on vérifie qu'il dit encore la
     vérité sur la donnée d'où il vient — sans se laisser recalculer par
     elle. Un témoin qui suit sa mesure ne peut jamais accuser. */
  const longueurs = [];
  for (const id of LES_DOUZE) {
    const courts = (recordDe(QUERY, id).data || {}).fiche_lineage_lvl1;
    if (courts) longueurs.push(...Object.values(courts).map((t) => t.length));
  }
  assert.equal(longueurs.length, 25, "les 25 condensés de lignée posés au lot 126");
  assert.equal(Math.max(...longueurs), PLAFOND,
    "⚠️ le plafond de ce garde vient de LÀ — s'il change, c'est une décision, pas un effet de bord");
});

/* ══ 1. L'INVARIANT ═════════════════════════════════════════════════════ */

test("🔴 tout trait servi à l'écran tient dans la bande — les douze espèces, trait par trait", () => {
  const trop = [];
  for (const id of LES_DOUZE) {
    for (const [nom, dit] of toutCeQuiEstServi(QUERY, id)) {
      if (dit.length > PLAFOND) trop.push(`${id}/${nom} (${dit.length})`);
    }
  }
  assert.deepEqual(trop, [],
    "⛔ une prose SRD recopiée telle quelle est le défaut du 02/09 — le contrôle doit NOMMER les coupables");
});

test("🔴 …et privé des condensés, chaque trait sert quand même sa PROSE : le repli", () => {
  /* ⚖️ L'AUTRE MOITIÉ DE L'ALTERNATIVE. Un blanc serait pire que le pavé
     (lot 126, même arbitrage) : le condensé qui manque n'efface rien. */
  const query = requete({ sansCondense: true });
  const vides = [];
  for (const id of LES_DOUZE) {
    for (const [nom, dit] of toutCeQuiEstServi(query, id)) {
      if (dit.trim().length === 0 || dit.trim() === "—") vides.push(`${id}/${nom}`);
    }
  }
  assert.deepEqual(vides, [], "⛔ sans condensé, la prose du record prend le relais — jamais un blanc");
});

test("les deux branches sont bien EXERCÉES — sinon les deux tests précédents n'en prouvent qu'une", () => {
  /* ⛔ Un garde qui balaie douze espèces sans savoir laquelle porte un
     condensé resterait vert le jour où `fiche_trait_text` disparaîtrait. */
  const avec = [];
  const sans = [];
  for (const id of LES_DOUZE) {
    const courts = (recordDe(QUERY, id).data || {}).fiche_trait_text || {};
    for (const trait of traitsDuRecord(recordDe(QUERY, id))) {
      (courts[trait.id] ? avec : sans).push(`${id}/${trait.id}`);
    }
  }
  assert.equal(avec.length, 19, "19 traits portent un condensé — écrits le 02/09");
  assert.ok(sans.length >= 20, `et ${sans.length} servent leur prose : le repli est vraiment emprunté`);
});

/* ══ 2. ⚔️ L'ATTAQUE — le garde mord-il ? ═══════════════════════════════ */

test("⚔️ un trait rendu à sa prose SRD fait bien ROUGIR le contrôle de bande", () => {
  /* On rejoue exactement le défaut du 02/09 sur UNE espèce : le Dragonborn
     privé de ses condensés resert ses 833 caractères, et le MÊME contrôle
     doit le nommer — sans que ses voisines bougent. */
  const id = "srd:species:en:dragonborn";
  const ampute = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data };
    delete data.fiche_trait_text;
    return { ...vue, record: { ...vue.record, data } };
  };
  /* ⚠️ SUR LES TROIS VOIX, ET C'EST LE POINT (lot 128) : `Breath Weapon` a
     quitté « gagné d'office » pour la lignée qui le porte. Mesuré sur la
     seule voix 1, ce contrôle n'aurait plus attendu qu'un pavé au lieu de
     deux — vert, et aveugle sur le plus gros des deux (833 car.). */
  const trop = [...new Set(toutCeQuiEstServi(ampute, id)
    .filter(([, dit]) => dit.length > PLAFOND).map(([nom]) => nom))].sort();
  /* ⭐ TROIS, PAS DEUX — et le troisième était là depuis toujours. Ce contrôle
     n'attendait que deux noms parce qu'il ne regardait que la voix 1 ; la voix
     2 (la `<dl>` du panneau) ne filtre PAS le trait porteur, et resert donc
     `Draconic Ancestry` en entier (386 car. de prose SRD) dès qu'on lui retire
     son condensé. Sur la pile réelle il tient dans la bande (85 car.) — le
     test d'invariant ci-dessus le vérifie —, donc rien n'est cassé à l'écran :
     ce qui était faux, c'était le COMPTE de ce garde. */
  assert.deepEqual(trop, ["Breath Weapon", "Draconic Ancestry", "Draconic Flight"],
    "privé de ses condensés, le Dragonborn resert ses pavés — c'est CE cas que l'invariant refuse");
  const voisine = toutCeQuiEstServi(ampute, "srd:species:en:orc").filter(([, dit]) => dit.length > PLAFOND);
  assert.deepEqual(voisine, [], "et l'Orc intact reste dans la bande : l'amputation est bornée, pas globale");
});

test("⚔️ un condensé trop long fait rougir le contrôle, même s'il est bien posé", () => {
  /* ⛔ Le condensé n'est pas un laissez-passer : c'est la LONGUEUR SERVIE qui
     est gardée, d'où qu'elle vienne. */
  const id = "fh:species:en:araag";
  const gonfle = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data, fiche_trait_text: { darkvision: "x".repeat(PLAFOND + 1) } };
    return { ...vue, record: { ...vue.record, data } };
  };
  const trop = ligneAccordee(gonfle, id).filter(([, dit]) => dit.length > PLAFOND).map(([nom]) => nom);
  assert.deepEqual(trop, ["Darkvision"]);
});
