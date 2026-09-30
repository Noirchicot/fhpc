/* ══ LOT 375 — UN PERSO NE SE RÉÉCRIT PLUS QUAND SEULE UNE ESTAMPILLE A CHANGÉ ══════════════════════
   Mandat d'ARCHI 35 (30/09) : la dérivation réestampille `resolved.derivation.at` à chaque ouverture ;
   *« entre deux onglets, c'est un faux conflit en germe ; pour Dropbox, ce serait un envoi à chaque
   ouverture »*. La règle : on compare sur ce qui fait le personnage (`ceQuiFaitLePersonnage`, lot 350) —
   aucune écriture, aucune révision, aucun envoi quand rien d'autre ne change.

   🔴 CE QUE CE FICHIER GARDE :
     N. LA DÉCISION PURE — `rienNaChange` : même id, même repère → rien à envoyer ; un repère inconnu
        n'est JAMAIS « rien n'a changé ».
     W. LE CÂBLAGE — la coquille la consulte AVANT d'appeler l'organe, retient le repère de ce qu'elle a
        écrit, et celui que la réouverture a lu.
   (L'étage de l'organe — aucune RÉVISION d'une estampille — est gardé par `sauvegarde-374` E1.) */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));
const { rienNaChange } = await import("../ui/builder/magasin.mjs");
const { ceQuiFaitLePersonnage } = await import("../ui/builder/universe-step.mjs");
const { canonicalText } = await import("../src/doc/canonical.mjs");

const repere = (doc) => canonicalText(ceQuiFaitLePersonnage(doc));
const kara = {
  schema: "fh-char/1", id: "k", name: "Kara", lang: "en", units: { distance: "ft", weight: "lb" },
  created: "2026-09-30T04:00:00Z", modified: "2026-09-30T05:00:00Z",
  build: { layers: [], choices: [], budgets: {}, overrides: [] },
  resolved: { derivation: { at: "2026-09-30T05:00:00.000Z" } }
};

test("N1 — ⚖️ UNE ESTAMPILLE SEULE : rien à envoyer ; un vrai changement : on envoie", () => {
  const tenu = { id: "k", repere: repere(kara) };
  const reestampille = { ...kara, modified: "2026-09-30T08:00:00Z", resolved: { derivation: { at: "2026-09-30T08:00:00.000Z" } } };
  assert.notEqual(canonicalText(reestampille), canonicalText(kara), "témoin : le texte entier, LUI, a changé");
  assert.equal(rienNaChange(tenu, { id: "k", repere: repere(reestampille) }), true, "⛔ pas d'envoi pour une estampille");
  assert.equal(rienNaChange(tenu, { id: "k", repere: repere({ ...kara, name: "Kara II" }) }), false, "un nom changé part");
  assert.equal(rienNaChange(tenu, { id: "autre", repere: repere(kara) }), false, "un autre personnage part, même identique");
});

test("N2 — ⛔ UN REPÈRE INCONNU N'EST JAMAIS « RIEN N'A CHANGÉ » — on envoie, et le lieu tranche", () => {
  for (const tenu of [null, undefined, {}, { id: "k" }]) {
    assert.equal(rienNaChange(tenu, { id: "k", repere: repere(kara) }), false, `${JSON.stringify(tenu)} ne dit pas ce que le lieu tient`);
  }
});

test("W1 — 🔌 LA COQUILLE CONSULTE LA DÉCISION AVANT D'APPELER L'ORGANE, et retient ce qu'elle écrit", () => {
  /* 🔄 LOT 377 — `envoyerALApp` prend `{ urgent }` (le passage en arrière-plan, vers Dropbox). */
  const envoi = shell.match(/function envoyerALApp\(\{ urgent = false \} = \{\}\) \{[\s\S]*?\n\}/)[0];
  const rangTest = envoi.indexOf("rienNaChange(repereDeLApp, { id, repere })");
  const rangAppel = envoi.indexOf("state.stockage.appareil.ecrire(");
  assert.ok(rangTest > 0 && rangAppel > rangTest, "⛔ le test vient AVANT l'appel — sinon l'envoi part quand même");
  assert.match(envoi, /const repere = repereDuPersonnage\(state\.document\);/, "le repère, jamais le texte entier");
  assert.match(envoi, /return \{ ok: true, revision, inchange: true \};/, "rien ne part, la révision tenue est rendue");
  assert.match(envoi, /suivreLaCopieDeLApp\(id, issue, repere\)/);
  const suivre = shell.match(/function suivreLaCopieDeLApp\(id, issue, repere\) \{[\s\S]*?\n\}/)[0];
  assert.match(suivre, /if \(issue\.ok && typeof repere === "string"\) repereDeLApp = \{ id, repere \};/, "ce qui est écrit, l'app le tient");
  /* 🔄 LOT 377 — le repère est lu UNE fois en tête de la file (le lieu de rencontre le partage). */
  assert.match(shell, /const repere = repereDuPersonnage\(state\.document\);[\s\S]{0,1200}suivreLaCopieDeLApp\(id, \{ ok: true, revision: verdict\.revision \}, repere\);/,
    "un Save aussi : après lui, l'app tient ce repère");
});

test("W2 — 🧭 LA RÉOUVERTURE RETIENT CE QUE L'APP TIENT — sinon le premier geste réenverrait tout", () => {
  const reouvrir = shell.match(/async function reouvrirLaCopieDeTravail\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(reouvrir, /ecrireBase\(\{ id, revision: decision\.revision \}\);\s*repereDeLApp = \{ id, repere: app\.texte \};/);
  assert.match(reouvrir, /texte: repereDuPersonnage\(lu\.document\)/, "…et ce qu'elle lit EST un repère (lot 374)");
});
