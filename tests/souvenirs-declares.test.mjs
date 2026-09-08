/* LES SOUVENIRS DÉCLARÉS SORTENT PAR UNE AUTRE PORTE QUE LES ORPHELINS.

   ⚖️ Eric, 2026-09-08 : un chemin gardé exprès cesse d'être annoncé comme un
   défaut. Ce garde tient l'invariant dans les DEUX SENS — sans sa seconde
   moitié, il resterait vert si `unconsumed` cessait d'accuser quoi que ce soit,
   et c'est exactement le défaut qu'on répare. */

import test from "node:test";
import assert from "node:assert/strict";
import { acceptanceDocument, makeHarness } from "./build-harness.mjs";
import { SOUVENIRS_DECLARES } from "../src/build/derive.mjs";

/* ⚠️ LE HARNAIS PAR DÉFAUT, ET PAS UN AUTRE : `acceptanceDocument` est bâti pour
   SES couches — en monter d'autres fait échouer sur un `gear` introuvable, ce qui
   n'a rien à voir avec ce qu'on mesure ici. Payé en écrivant ce fichier. */
const h = makeHarness();

function rapportAvec(chemins) {
  const doc = acceptanceDocument(h.layers);
  for (const c of chemins) doc.build.choices.push(c);
  /* ⚠️ `rebuild` rend `unconsumed` et `memos` AU PREMIER NIVEAU, pas sous un
     `report` — mesuré, pas supposé. */
  return h.verbs.rebuild({ document: doc });
}

test("un souvenir déclaré sort en `memos`, JAMAIS en `unconsumed`", () => {
  /* ⛔ ON N'AJOUTE PAS `abilities.mode` : le personnage d'acceptation le PORTE
     DÉJÀ, et un second choix au même chemin fait jeter le moteur (« ambigu,
     aucun ne gagne par défaut »). C'est le bon refus, et il prouve au passage
     que ce chemin est bien celui d'un personnage réel. */
  const r = rapportAvec([]);
  const memos = (r.memos || []).map((m) => m.path);

  assert.ok(memos.includes("abilities.mode"),
    "⛔ `abilities.mode` n'est pas dans `memos`. C'est un SOUVENIR déclaré " +
    "(la méthode de tirage) : le moteur ne garde que les six scores, la façon " +
    "de les obtenir n'a aucun effet sur la fiche.");
  assert.ok(!(r.unconsumed || []).includes("abilities.mode"),
    "⛔ `abilities.mode` ressort en `unconsumed` : la liste qui doit ACCUSER " +
    "porte de nouveau un mémo légitime. C'est très exactement le défaut de six " +
    "semaines que ce lot répare — `depart` s'y était caché derrière lui.");

  const raison = (r.memos || []).find((m) => m.path === "abilities.mode");
  assert.ok(raison && typeof raison.raison === "string" && raison.raison.length > 40,
    "⛔ un mémo sans sa RAISON écrite est une exception non argumentée : la table " +
    "ne sert alors qu'à faire taire.");
});

test("le témoin contraire — un orphelin RESTE dans `unconsumed`", () => {
  /* ⭐ Un chemin qu'aucune règle ne lit ET qui n'est pas déclaré : c'est le cas
     qui doit continuer d'accuser. Sans cette moitié, le premier test resterait
     vert même si `unconsumed` rendait toujours la liste vide. */
  const r = rapportAvec([{ path: "zzz.chemin.sans.regle", value: 1 }]);
  assert.ok((r.unconsumed || []).includes("zzz.chemin.sans.regle"),
    "⛔ un chemin NON déclaré et non consommé ne ressort plus en `unconsumed` : " +
    "le témoin est mort, et tout orphelin passera désormais en silence.");
  assert.ok(!(r.memos || []).some((m) => m.path === "zzz.chemin.sans.regle"),
    "⛔ un chemin non déclaré est entré dans `memos` : le filtre ne lit plus la table.");
});

test("la table reste minuscule, et chaque entrée porte sa raison", () => {
  assert.ok(SOUVENIRS_DECLARES.size <= 3,
    `⛔ ${SOUVENIRS_DECLARES.size} souvenirs déclarés. La table est minuscule EXPRÈS : ` +
    "si elle grandit, ce n'est pas qu'il y a plus de souvenirs, c'est qu'on s'en sert " +
    "pour se taire. Un chemin dont la règle reste À ÉCRIRE est un ORPHELIN, pas un mémo.");
  for (const [chemin, raison] of SOUVENIRS_DECLARES) {
    assert.ok(typeof raison === "string" && raison.length > 40,
      `⛔ « ${chemin} » est déclaré sans raison écrite.`);
  }
});
