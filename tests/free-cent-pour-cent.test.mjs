/* ⚖️ `FREE` EST 100 % LIBRE SUR LE CHOIX DES CARACS — Eric, 2026-09-06.

   ⛔ CE GARDE NE RÉPARE RIEN : le code était déjà conforme le jour où la règle
   a été dite. Il existe pour qu'elle ne puisse pas être annulée EN SILENCE —
   un total, un budget, un plancher ajoutés plus tard le feraient rougir.

   ⚠️ LA BORNE QUI RESTE, ET ELLE N'EST PAS UNE CONDITION : chaque score vaut
   3 à 18 (Eric, 2026-08-15). C'est le domaine d'un score, pas une contrainte
   sur le CHOIX — la liberté porte sur quelles valeurs on met où, et combien
   de fois. Les deux ne se confondent pas, et c'est exactement le genre de
   phrase qu'un successeur lira de travers si personne ne l'écrit.

   📌 Et il porte son témoin contraire : sans le cas `19×6`, ce fichier serait
   vert même si le moteur cessait de juger quoi que ce soit. */

import test from "node:test";
import assert from "node:assert/strict";
import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN } from "./build-harness.mjs";

const KEYS = ["str", "dex", "con", "int", "wis", "cha"];
const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN] });

const documentAvec = (scores) => ({
  schema: "fh-char/1", id: "free-100", name: "FREE 100%", lang: "en",
  units: { distance: "ft", weight: "lb" },
  generator: { name: "tests/free-cent-pour-cent", version: "1.0.0" },
  created: "2026-09-06T21:00:00Z", modified: "2026-09-06T21:00:00Z",
  build: {
    layers: manifestOf(h.layers),
    choices: [
      { path: "level", value: 1 },
      { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
      { path: "species", ref: { kind: "species", id: "srd:species:en:human" } },
      { path: "background", ref: { kind: "background", id: "fh:background:en:inheritance" } },
      ...KEYS.map((k) => ({ path: `abilities.${k}`, value: scores[k] })),
      { path: "currency.cp", value: 0 }, { path: "currency.sp", value: 0 },
      { path: "currency.gp", value: 15 }, { path: "currency.pp", value: 0 },
      { path: "class.skills[0]", value: "arcana" }, { path: "class.skills[1]", value: "history" }
    ],
    budgets: {}, overrides: []
  }
});
const tous = (n) => Object.fromEntries(KEYS.map((k) => [k, n]));
const refusSurLesCaracs = (scores) =>
  h.verbs.validate({ document: documentAvec(scores) })
    .violations.filter((v) => String(v.key).startsWith("abilities."));

test("FREE — aucun total, aucun budget, aucun plancher : les six extrêmes passent", () => {
  const temoin = refusSurLesCaracs({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 });
  assert.deepEqual(temoin, [], "le tableau standard doit passer — sinon la mesure ne vaut rien");

  assert.deepEqual(refusSurLesCaracs(tous(18)), [],
    "⛔ 18/18/18/18/18/18 est REFUSÉ. Quelqu'un a posé un total, un budget ou un plafond " +
    "sur les caracs. La règle d'Eric du 2026-09-06 est : « FREE c'est 100 % de liberté sur " +
    "le choix des caracs ». Si elle a changé, c'est CETTE ligne qu'on réécrit — pas le garde " +
    "qu'on désarme.");

  assert.deepEqual(refusSurLesCaracs(tous(3)), [],
    "⛔ 3/3/3/3/3/3 est REFUSÉ. La liberté vaut vers le BAS aussi : un plancher est une " +
    "condition, et FREE n'en a aucune. ⭐ Une alternative se garde des deux côtés.");
});

test("le témoin contraire — la borne 3–18 tient toujours, sinon ce fichier ne prouve rien", () => {
  const horsBorne = refusSurLesCaracs(tous(19));
  assert.equal(horsBorne.length, 6,
    "⛔ 19×6 ne rend plus six refus : le moteur a cessé de juger le domaine d'un score, " +
    "et les assertions ci-dessus sont devenues vertes pour rien.");
  assert.ok(horsBorne.every((v) => v.key === "abilities.score-out-of-creation-range"),
    "et c'est bien le refus de DOMAINE (3–18, Eric 2026-08-15), pas un autre qui le masquerait");
});
