/* ══ LA FICHE PORTE LES TRAITS QUE LA COUCHE FH AJOUTE ════════════════════
 *
 *  Lot 148 bis, 2026-09-03. Décision d'Eric le même jour, en une phrase :
 *  « je veux que ces traits soient présents sur les fiches, il faut corriger
 *  cette erreur. »
 *
 *  ── LE DÉFAUT, MESURÉ AVANT D'ÉCRIRE UNE LIGNE ────────────────────────
 *
 *  Trois espèces portent un trait Fate's Hand, et les trois AGISSAIENT sans
 *  jamais APPARAÎTRE :
 *
 *      Elfe      `splinter-of-anon`  Base de Destinée +2 (donc 4 à la création)
 *      Halfelin  `outlasting`        Avantage aux jets de Chaos
 *      Humain    `twice-born`        2 Points de Destinée au repos long, pas 1
 *
 *  `src/build/derive.mjs` construit `resolved.traits[]` depuis `data.traits`
 *  SEUL. Les traits FH vivent dans `data[fh_traits]` — un CHAMP DE SCHÉMA,
 *  donc insensible à la langue (SOCLE.md, « qui possède quoi — côté
 *  DONNÉES »). Relevé sur la vraie matière avant ce lot : la fiche de l'elfe
 *  d'exemple portait **5 traits**, tous SRD, et pas `Splinter of Anon`.
 *
 *  ⭐ CE QUE ÇA COÛTAIT AU JOUEUR, ET CE N'EST PAS SYMÉTRIQUE. Le trait de
 *  l'Elfe produit un NOMBRE, et ce nombre s'affiche (la ligne « Splinter of
 *  Anon » du Score de Destinée). Ceux du Halfelin et de l'Humain ne
 *  produisent aucun nombre : ce sont des règles à se rappeler À LA TABLE.
 *  Absentes de la fiche, le joueur ne peut pas savoir qu'il les a.
 *
 *  ── ⛔ POURQUOI LA RÉPARATION N'EST PAS DANS `derive.mjs` ──────────────
 *
 *  La loi §0.12 tient la frontière du pli : `src/build/` ne cite AUCUNE
 *  mécanique de la maison et n'importe RIEN de `src/modules/`. Deux gardes de
 *  `tests/build-block.test.mjs` la tiennent, et le second mord jusque sur le
 *  MOT — le motif `/\bfh[A-Z_]/` voit `fh_traits` écrit en toutes lettres.
 *  ⛔ Écrire cette lecture dans le pli demanderait donc de désarmer un garde
 *  pour faire passer une correction : très exactement ce que ce dépôt refuse.
 *
 *  ⭐ Et le canal existait déjà, ouvert au lot 36 : un module rend `traits`,
 *  la dérivation les AJOUTE à `resolved.traits[]` sans savoir d'où ils
 *  viennent. `skill-pool.mjs` s'en sert depuis. Le lot 148 bis n'invente donc
 *  aucun mécanisme — il pose le module qui manquait.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
  makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN
} from "./build-harness.mjs";
import { createFhSpeciesTraits, FH_SPECIES_FLAG } from "../src/modules/fh/species-traits.mjs";

/* Les trois traits FH de la vraie matière, et ce que chacun DOIT dire au
   joueur. ⛔ Le texte n'est pas recopié ici : on vérifie qu'il vient du
   record, pas qu'il ressemble à une phrase qu'on aurait écrite. */
const ATTENDUS = [
  { espece: "srd:species:en:elf", nom: "Elf", trait: "splinter-of-anon", affiche: "Splinter of Anon" },
  { espece: "srd:species:en:halfling", nom: "Halfling", trait: "outlasting", affiche: "Outlasting" },
  { espece: "srd:species:en:human", nom: "Human", trait: "twice-born", affiche: "Twice-Born" }
];

function choix(especeId, libelle) {
  return [
    { path: "level", value: 1, label: "Level 1" },
    { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" }, label: "Wizard" },
    { path: "species", ref: { kind: "species", id: especeId }, label: libelle },
    { path: "abilities.str", value: 8 },
    { path: "abilities.dex", value: 14 },
    { path: "abilities.con", value: 12 },
    { path: "abilities.int", value: 16 },
    { path: "abilities.wis", value: 12 },
    { path: "abilities.cha", value: 10 },
    { path: "currency.cp", value: 0 },
    { path: "currency.sp", value: 0 },
    { path: "currency.gp", value: 25 },
    { path: "currency.pp", value: 0 }
  ];
}

function plie(h, especeId, libelle) {
  return h.verbs.rebuild({
    document: {
      schema: "fh-char/1",
      id: "lot148bis",
      name: "Sujet",
      lang: "en",
      units: { distance: "ft", weight: "lb" },
      generator: { name: "tests/fiche-porte-les-traits-fh", version: "1.0.0" },
      created: "2026-09-03T09:00:00Z",
      modified: "2026-09-03T09:00:00Z",
      build: { layers: manifestOf(h.layers), choices: choix(especeId, libelle), budgets: {}, overrides: [] }
    }
  });
}

const avecModule = () => makeHarness({
  layers: [SRD_EN, FH_SPECIES_EN],
  modules: [createFhSpeciesTraits()]
});
/* ⛔ AUCUN MODULE — et c'est la loi §0.12 rendue littérale : la MÊME pile,
   le module en moins. C'est le seul témoin qui puisse accuser. */
const sansModule = () => makeHarness({ layers: [SRD_EN, FH_SPECIES_EN], modules: [] });

/* ══ 1. LA VRAIE MATIÈRE, LES TROIS ESPÈCES ═══════════════════════════ */

test("LES TROIS TRAITS FH ARRIVENT SUR LA FICHE — avec leur nom, leur texte et leur source", () => {
  for (const cas of ATTENDUS) {
    const h = avecModule();
    const out = plie(h, cas.espece, cas.nom);
    const rendu = out.resolved.traits.find((entry) => entry.id === cas.trait);

    assert.ok(rendu, `${cas.nom} : « ${cas.affiche} » doit figurer dans resolved.traits[]`);
    assert.equal(rendu.name, cas.affiche, "et son nom est celui du record, pas un mot fabriqué");
    assert.equal(rendu.source, cas.nom,
      "sa SOURCE est l'espèce, comme pour un trait SRD — le joueur doit pouvoir lire d'où il tient ça");

    /* Le TEXTE vient du record. ⛔ On ne le recopie pas ici (la leçon du lot 17 :
       une prose recopiée cesse de suivre sa source sans que personne le voie) —
       on le RELIT dans la couche et on compare. */
    const record = h.layers.verbs.query({ kind: "species", id: cas.espece }).record;
    const source = record.data.fh_traits.find((entry) => entry.id === cas.trait);
    assert.equal(rendu.text, source.text,
      "le texte est celui du record, mot pour mot — une règle que le joueur doit pouvoir LIRE");
    assert.ok(rendu.text.length > 0, "et il n'est pas vide : un trait sans texte est un nom sans règle");
  }
});

test("⛔ LE PENDANT — sans le module, ils n'y sont pas, et le reste ne bouge pas", () => {
  /* Un garde qui n'éprouve qu'une branche laisse l'autre libre de mentir
     (TRAPS, lot 124). Le cas qui doit AJOUTER est au-dessus ; voici le cas qui
     doit S'ABSTENIR — et il prouve deux choses à la fois : que le module est
     bien la cause, et qu'un personnage SRD pur traverse le pli sans rien voir
     de Fate's Hand. */
  for (const cas of ATTENDUS) {
    const out = plie(sansModule(), cas.espece, cas.nom);
    assert.equal(out.resolved.traits.find((entry) => entry.id === cas.trait), undefined,
      `${cas.nom} : sans le module, « ${cas.affiche} » n'a aucune raison d'apparaître`);
  }
});

test("LES TRAITS SRD NE BOUGENT NI EN NOMBRE NI EN ORDRE — la fiche s'AUGMENTE, elle ne se réécrit pas", () => {
  /* ⭐ NOMMER LE TÉMOIN AVANT DE MESURER : le témoin est la MÊME pile sans le
     module, pas une liste écrite à la main. Un trait SRD qui disparaîtrait, ou
     qui changerait de place, serait une régression qu'un simple compte de
     traits ne verrait pas. */
  for (const cas of ATTENDUS) {
    const avant = plie(sansModule(), cas.espece, cas.nom).resolved.traits.map((entry) => entry.id);
    const apres = plie(avecModule(), cas.espece, cas.nom).resolved.traits.map((entry) => entry.id);

    assert.deepEqual(apres.slice(0, avant.length), avant,
      `${cas.nom} : les traits SRD gardent leur ordre, et le trait FH s'ajoute APRÈS`);
    assert.deepEqual(apres, avant.concat([cas.trait]),
      `${cas.nom} : exactement UN trait de plus, et c'est le sien`);
  }
});

test("AUCUN DOUBLON — un trait ne peut pas figurer deux fois sur une fiche", () => {
  /* La préséance (`traitsDeLEspece`, lot 147) existe pour le jour où la route D
     fera porter à `srfh+` l'homologue d'un trait SRD. Ce jour-là, une fusion
     naïve rendrait DEUX entrées de même id. Le garde tient l'invariant
     maintenant, pas le jour où ça arrivera. */
  for (const cas of ATTENDUS) {
    const ids = plie(avecModule(), cas.espece, cas.nom).resolved.traits.map((entry) => entry.id);
    assert.deepEqual([...new Set(ids)], ids, `${cas.nom} : chaque identité une seule fois`);
  }
});

/* ══ 2. LE COMPTE, ET LE JOUR OÙ IL CHANGERA ══════════════════════════ */

test("TROIS ESPÈCES PORTENT UN TRAIT FH — si ce compte change, ce fichier est à refaire", () => {
  /* Même clause que le lot 147 : une liste d'attendus écrite à la main ne dit
     JAMAIS toute seule qu'elle est incomplète. Elle se compare donc à la
     couche, à chaque exécution. */
  const h = avecModule();
  const porteurs = [];
  for (const vue of h.layers.verbs.query({ kind: "species" })) {
    const fh = (vue.record.data || {}).fh_traits;
    if (Array.isArray(fh) && fh.length) porteurs.push(vue.id);
  }
  assert.deepEqual(porteurs.sort(), ATTENDUS.map((cas) => cas.espece).sort(),
    "les espèces à trait FH de la couche sont exactement celles que ce fichier éprouve");
});

test("🔴 ZÉRO COLLISION AUJOURD'HUI — et le jour où il y en aura une, ce garde rougit", () => {
  /* LA FRONTIÈRE DE CE LOT, TENUE PAR UN COMPTE EXACT plutôt que par une
     supposition. Le canal `traits` du lot 36 sait AJOUTER, il ne sait pas
     SUPPLANTER : si `srfh+` portait un jour l'homologue d'un trait SRD (c'est
     très exactement ce que la route D prépare), le pli publierait la version
     SRD et le module sauterait la version FH — la préséance ne se verrait pas
     sur la fiche. ⛔ Ce garde n'est donc pas une redite du compte d'espèces :
     il tient la seule chose qui rendrait ce module FAUX en restant vert. */
  const h = avecModule();
  const collisions = [];
  for (const vue of h.layers.verbs.query({ kind: "species" })) {
    const data = vue.record.data || {};
    const srd = new Set((Array.isArray(data.traits) ? data.traits : []).map((entry) => entry && entry.id));
    for (const trait of (Array.isArray(data.fh_traits) ? data.fh_traits : [])) {
      if (trait && srd.has(trait.id)) collisions.push(`${vue.id} · ${trait.id}`);
    }
  }
  assert.deepEqual(collisions, [],
    "⛔ UN TRAIT FH SUPPLANTE DÉSORMAIS UN TRAIT SRD, et ce module ne sait pas le faire voir : il\n" +
    "   AJOUTE, il ne REMPLACE pas. La réparation est d'ouvrir un canal de remplacement côté pli\n" +
    "   (sur le modèle de `skillTiers`), ⛔ PAS de retirer cette assertion.");
});

test("LE DRAPEAU EST NOMMÉ, ET C'EST LA COUCHE DES ESPÈCES QUI LE LÈVE", () => {
  const h = avecModule();
  assert.ok(h.layers.verbs.flags().includes(FH_SPECIES_FLAG),
    "`fh-species-en` lève le drapeau qui allume le module — sans quoi le module ne servirait jamais");
  assert.equal(createFhSpeciesTraits().flag, FH_SPECIES_FLAG);
});
