import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const SHELL = readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const STEP = readFileSync(new URL("../ui/builder/species-step.mjs", import.meta.url), "utf8");
const LAYER = JSON.parse(readFileSync(new URL("../layers/fh-species-en.layer.json", import.meta.url), "utf8"));

/* ══════════════════════════════════════════════════════════════════════════
   🔴 LE TABLEAU DES LIGNÉES SE COMPOSE ET S'EXPLIQUE — Eric, 27/08 :
   « Tu t'es foutu de ma gueule pour le tableau du dragonborn sérieux » —
   la v351 étirait la table à 100 % (noms collés au bord, valeurs perdues au
   milieu d'un blanc) et la livrait SANS phrase d'entrée. Puis la dictée :
   « un peu de texte en intro, pour dire que c'est des souffles, le cône,
   les dégâts, la résistance — et après le tableau pour chaque élément » ;
   « un petit texte pour expliquer le tableau c'est bien » (Goliath).
   ══════════════════════════════════════════════════════════════════════════ */

test("la table se dimensionne sur son contenu et se centre — jamais étirée à 100 %", () => {
  const regle = SHELL.match(/\.species-lignage-table \{[^}]*\}/s);
  assert.ok(regle, "la règle .species-lignage-table existe");
  assert.match(regle[0], /width:\s*auto/, "width: auto — la table épouse ses colonnes");
  assert.match(regle[0], /margin-inline:\s*auto/, "centrée dans la fenêtre");
  assert.doesNotMatch(regle[0], /[^-]width:\s*100%/, "⛔ le 100 % écartelait les couples nom-valeur");
});

test("les intros existent dans la couche — et portent la règle commune dictée", () => {
  const db = LAYER.records.species["srd:species:en:dragonborn"].changes["data[lineage_intro]"];
  assert.ok(db, "dragonborn : data[lineage_intro] posé");
  for (const mot of ["Breath Weapon", "Cone", "Resistance", "1d10"]) {
    assert.ok(db.includes(mot), `l'intro du souffle nomme « ${mot} »`);
  }
  const go = LAYER.records.species["srd:species:en:goliath"].changes["data[lineage_intro]"];
  assert.ok(go, "goliath : data[lineage_intro] posé");
  assert.ok(/boon/i.test(go), "l'intro du Goliath nomme le boon");
});

test("l'écran LIT l'intro depuis les données — il ne l'invente pas", () => {
  assert.match(STEP, /data\.lineage_intro/, "species-step lit record.data.lineage_intro");
  assert.match(STEP, /species-lignage-intro/, "et la pose sous sa classe");
});
