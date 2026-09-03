/* ══ LA PRÉSÉANCE DES TRAITS SE LIT À UN SEUL ENDROIT ═════════════════════
 *
 *  Lot 147, 2026-09-03. Premier morceau de la ROUTE D (Eric : « FH en français
 *  un jour OUI ! », puis « maintenant »).
 *
 *  L'INVARIANT — et c'est l'invariant, ⛔ jamais la liste des appelants :
 *
 *      Personne ne fusionne `data.traits` et `data.fh_traits` à la main.
 *      La préséance vit dans `src/modules/fh/traits.mjs`, et nulle part ailleurs.
 *
 *  ⭐ POURQUOI. Avant ce lot, trois sites fusionnaient à la main, dans DEUX
 *  ORDRES CONTRAIRES — `[...fh, ...base]` deux fois, `[...base, ...fh]` une
 *  fois. Aucun ne se contredisait, parce qu'il n'y a aujourd'hui aucune
 *  collision d'id (mesuré : 3 entrées FH en tout). ⚠️ Le jour où la route D
 *  fera porter à `srfh+` les homologues des traits SRD, chacun de ces trois
 *  aurait rendu DEUX entrées de même identité, et chacun dans un ordre
 *  différent. C'est la maladie que ce dépôt a payée quatre fois : une donnée
 *  lue à plusieurs endroits diverge en silence.
 *
 *  ⛔ CE GARDE NE SE RÉPARE PAS EN AJOUTANT UN NOM À UNE LISTE. S'il rougit,
 *  c'est qu'une lecture locale est revenue : la réparation est d'appeler
 *  `traitsDeLEspece`, pas d'excepter le fichier.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

import { traitsDeLEspece } from "../src/modules/fh/traits.mjs";
import { REPO_ROOT } from "../src/tools/gen-fh-species-layer.mjs";

/** Tous les `.mjs` du dépôt, hors tests et dépendances. */
function sources(dossier, trouves = []) {
  for (const nom of readdirSync(join(REPO_ROOT, dossier))) {
    if (nom === "node_modules" || nom.startsWith(".")) continue;
    const rel = `${dossier}/${nom}`;
    const abs = join(REPO_ROOT, rel);
    try {
      if (extname(nom) === ".mjs") trouves.push(rel);
      else if (!extname(nom)) sources(rel, trouves);
    } catch { /* pas un dossier lisible : on passe */ }
  }
  return trouves;
}

/* Une fusion à la main : `fh_traits` cité dans une expression d'étalement ou
   de concaténation, sur la même ligne ou la suivante. ⛔ On ne cherche pas un
   nom de variable — on cherche le GESTE. */
function fusionsALaMain(texte) {
  const lignes = texte.split("\n");
  const hits = [];
  for (let i = 0; i < lignes.length; i++) {
    const fenetre = `${lignes[i]} ${lignes[i + 1] || ""}`;
    if (!/fh_traits/.test(fenetre)) continue;
    if (/^\s*[*/]/.test(lignes[i])) continue;                    // un commentaire n'est pas un geste
    if (/\.\.\.|concat\(/.test(fenetre)) hits.push(`${i + 1}: ${lignes[i].trim()}`);
  }
  return hits;
}

test("LA PRÉSÉANCE N'A QU'UN SEUL LIEU — personne ne refusionne à la main", () => {
  const coupables = [];
  for (const rel of [...sources("src"), ...sources("ui")]) {
    if (rel === "src/modules/fh/traits.mjs") continue;           // ⭐ le lieu, justement
    const hits = fusionsALaMain(readFileSync(join(REPO_ROOT, rel), "utf8"));
    for (const h of hits) coupables.push(`${rel}  ${h}`);
  }
  assert.deepEqual(coupables, [],
    "⛔ UNE LECTURE LOCALE EST REVENUE. `data.traits` et `data.fh_traits` ne se fusionnent qu'à un\n" +
    "   seul endroit : `src/modules/fh/traits.mjs`, qui applique la PRÉSÉANCE (à identité égale, le trait\n" +
    "   FH supplante le trait SRD en gardant sa place). Une fusion à la main rendrait deux entrées de\n" +
    "   même id le jour où la route D fera porter à `srfh+` les homologues des traits SRD.\n" +
    "   ⛔ La réparation est d'appeler `traitsDeLEspece`, PAS d'ajouter une exception ici.");
});

test("⭐ LA PRÉSÉANCE FAIT CE QU'ELLE DIT — et elle est éprouvée sur une collision FABRIQUÉE", () => {
  /* ⛔ Aujourd'hui aucune collision n'existe dans la vraie matière (mesuré :
     3 traits FH, 0 id commun). Une capacité neuve que rien n'exerce est une
     intention : on lui fabrique donc le cas que la route D rendra courant. */
  const record = {
    data: {
      traits: [
        { id: "darkvision", name: "Darkvision", text: "texte SRD" },
        { id: "keen-senses", name: "Keen Senses", text: "texte SRD" },
        { id: "trance", name: "Trance", text: "texte SRD" }
      ],
      fh_traits: [
        { id: "keen-senses", name: "Keen Senses", text: "TEXTE FH" },   // supplante
        { id: "splinter-of-anon", name: "Splinter of Anon" }             // ajoute
      ]
    }
  };
  const rendu = traitsDeLEspece(record);

  assert.deepEqual(rendu.map((t) => t.id),
    ["darkvision", "keen-senses", "trance", "splinter-of-anon"],
    "⭐ le supplanté GARDE SA PLACE — sans quoi la fiche du joueur se réordonnerait sous ses yeux");
  assert.equal(rendu.filter((t) => t.id === "keen-senses").length, 1,
    "⛔ et il n'apparaît qu'UNE fois : c'est très exactement ce qu'une fusion à la main aurait raté");
  assert.equal(rendu.find((t) => t.id === "keen-senses").text, "TEXTE FH",
    "c'est le trait FH qui gagne — la préséance va dans ce sens et pas dans l'autre");
  assert.equal(rendu.find((t) => t.id === "darkvision").text, "texte SRD",
    "et il n'emporte rien d'autre");
});

test("SUR LA VRAIE MATIÈRE, RIEN NE BOUGE — l'ordre affiché est celui d'avant", () => {
  /* Le critère de réussite du lot : à la fin, RIEN ne change à l'écran. Les
     trois espèces à trait FH sont donc comparées à l'ordre que `traitsDe`
     rendait avant — `base` d'abord, `fh` ensuite. */
  const en = JSON.parse(readFileSync(join(REPO_ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8")).records.species;
  const fh = JSON.parse(readFileSync(join(REPO_ROOT, "layers", "fh-species-en.layer.json"), "utf8")).records.species;

  const avecTraitFh = [];
  for (const [adresse, entree] of Object.entries(fh)) {
    const ajout = (entree.changes || {})["data[fh_traits]"];
    if (!Array.isArray(ajout) || !ajout.length) continue;
    const record = { data: { traits: ((en[adresse] || {}).data || {}).traits || [], fh_traits: ajout } };
    const avant = [...record.data.traits, ...ajout].filter((t) => t && t.name).map((t) => t.id);
    assert.deepEqual(traitsDeLEspece(record).map((t) => t.id), avant,
      `${adresse} : l'ordre affiché doit être identique à celui d'avant le lot 147`);
    avecTraitFh.push(adresse.replace("srd:species:en:", ""));
  }
  assert.deepEqual(avecTraitFh.sort(), ["elf", "halfling", "human"],
    "trois espèces portent un trait FH — si ce compte change, l'affirmation « rien ne bouge » est à refaire");
});
