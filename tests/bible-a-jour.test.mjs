/* ══ LA BIBLE DU VAULT EST-ELLE À JOUR ? ═══════════════════════════════════════

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER : qu'une COPIE DE LECTURE mente. Le
   2026-09-06, la Builder Bible du vault avait **112 adresses de retard** sur sa
   source, et **aucun des cinq sacrés posés le jour même** n'y figurait. Un agent
   qui l'aurait lue pour connaître les sacrés — ce que la loi lui ordonne — en
   aurait manqué cinq sur neuf. La copie ne disait pas son âge ; elle le dit
   maintenant, et ce garde le vérifie.

   ⭐ ET LE TÉMOIN VIT DANS LE DÉPÔT, PAS DANS LE VAULT. Un garde qui lirait
   `~/obsidian-vault` serait vert chez Eric et cassé pour quiconque clone `fhpc` —
   il dépendrait d'un chemin absolu qui n'existe pas ailleurs. Le manifeste est
   donc l'empreinte de la SOURCE, commitée à côté d'elle : s'il ne correspond
   plus, c'est que la Bible n'a pas été regénérée depuis la dernière règle écrite.

   ⛔ SA LIMITE, ET IL LA DIT : il ne prouve pas que le vault contient la bonne
   Bible — il prouve que le manifeste correspond à la source. Quelqu'un qui
   effacerait le vault sans toucher au dépôt le laisserait vert. C'est le prix de
   ne pas dépendre d'un chemin hors dépôt, et c'est le bon prix. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { lireCorpus, empreinte, MANIFESTE, PLAN } from "../tools/bible.mjs";

test("le manifeste correspond à la source — sinon la Bible est périmée", () => {
  const attendu = empreinte(lireCorpus());
  assert.ok(fs.existsSync(MANIFESTE),
    "`ui/builder/BIBLE.manifest` manque — lance `node tools/bible.mjs`.");
  const trouve = JSON.parse(fs.readFileSync(MANIFESTE, "utf8"));
  assert.deepEqual(trouve, attendu,
    `LA BIBLE DU VAULT EST PÉRIMÉE. Le corpus porte ${attendu.n} règles, le manifeste ` +
    `en décrit ${trouve.n}. ⛔ Ne corrige pas ce fichier à la main : relance ` +
    "`node tools/bible.mjs`, qui regénère la Bible ET son empreinte. Une règle " +
    "écrite dans le corpus n'existe pour un lecteur qu'une fois la Bible refaite.");
});

test("toute famille du corpus a un chapitre — aucune règle hors plan", () => {
  /* ⚔️ Une famille neuve qui n'entre dans aucun chapitre serait générée nulle
     part : elle disparaîtrait de la Bible sans que rien ne rougisse. */
  const connues = new Set(PLAN.flatMap(([, , , f]) => f));
  const orphelines = [...new Set(lireCorpus().map((r) => r.famille))].filter((f) => !connues.has(f));
  assert.deepEqual(orphelines, [],
    "une famille sans chapitre : ses règles ne seraient publiées nulle part. " +
    "Ajoute-la au PLAN de `tools/bible.mjs`, dans le chapitre qui la porte.");
});
