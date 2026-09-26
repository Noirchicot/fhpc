/* ══ L'INVENTAIRE DES EFFETS DES RÈGLES DU PERSONNAGE — lot 284 ══════════════════
   ⚖️ Eric, 2026-09-26 : « est-ce que tous les éléments des 8 étapes du personnage savent
   s'appliquer ? » — non (audit : lignage non lu, dons Alert / Savage Attacker sans effet,
   capacités de classe absentes, Dwarven Toughness sans PV…). Puis « la liste déjà »,
   « idem que pour équipement objets mag » : un PRÉCURSEUR, comme l'inventaire des objets.
   ⭐ `sources-effets/regles-personnage.effets.json` : pour chaque trait d'espèce, lignage,
   don, capacité de classe (à son niveau), option de classe, arcane et training, ses effets et
   la CITATION exacte qui les prouve. Extrait par quatre agents, fusionné et relu par l'archi.
   ⛔ Aucun code ne le lit encore — la fiche décidera. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { entreesDesEffets } from "../src/tools/entrees-effets.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOC = JSON.parse(fs.readFileSync(path.join(ROOT, "sources-effets", "regles-personnage.effets.json"), "utf8"));
const ENTREES = entreesDesEffets(exempleFhEn().layers.verbs.query);
const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();

test("1 — ⭐ COMPLET : chaque entrée de la pile y est, une seule fois, dans l'ordre", () => {
  const ids = DOC.entrees.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, "⛔ aucun doublon (le NIVEAU distingue « Improved Brutal Strike » 13 et 17)");
  assert.deepEqual(ids, ENTREES.map((e) => e.id), "⛔ un record ajouté à la pile doit être inventorié");
  const sources = [...new Set(ENTREES.map((e) => e.source))].sort();
  assert.deepEqual(sources, ["arcana", "class-feature", "class-option", "feat", "lineage", "species-trait", "training"]);
});

test("2 — 🔴 VRAI : chaque effet cite le texte de son entrée, mot pour mot", () => {
  const parId = new Map(ENTREES.map((e) => [e.id, e]));
  const fautes = [];
  for (const s of DOC.entrees) for (const e of s.effets) {
    if (!e.citation || !norm(parId.get(s.id).text).includes(norm(e.citation))) fautes.push(`${s.name} :: ${e.citation}`);
  }
  assert.deepEqual(fautes, [], "⛔ une citation introuvable est un effet inventé");
});

test("3 — ⭐ UN VOCABULAIRE FERMÉ : familles, conditions, modes, forme des cibles", () => {
  const familles = Object.keys(DOC.familles);
  for (const s of DOC.entrees) for (const e of s.effets) {
    assert.ok(familles.includes(e.famille), `${s.name} : famille « ${e.famille} »`);
    assert.ok(DOC.conditions.includes(e.condition), `${s.name} : condition « ${e.condition} »`);
    assert.ok(DOC.modes.includes(e.mode), `${s.name} : mode « ${e.mode} »`);
    assert.match(e.cible, /^[a-z]+(\.[a-z0-9+-]+)*$/, `${s.name} : cible « ${e.cible} »`);
    if (e.condition === "etat") assert.ok(norm(e.etat), `${s.name} : un effet d'état dit son état`);
  }
});

test("4 — ⚔️ LES TÉMOINS DE L'AUDIT : ce qui manquait sur la fiche est inventorié", () => {
  const un = (nom, f) => (DOC.entrees.find((s) => s.name === nom) || { effets: [] }).effets.find(f);
  const robuste = un("Dwarf — Dwarven Toughness", (e) => e.cible === "hp.max");
  assert.ok(robuste, "⭐ le Nain : +1 PV max par niveau (vu à 9 PV comme un Elfe, le 26/09)");
  assert.equal(robuste.mode, "bonus");
  assert.ok(un("Alert", (e) => e.cible === "initiative"), "⭐ Alert : l'initiative (le don ne faisait rien)");
  const defense = un("Barbarian — Unarmored Defense", (e) => e.cible === "ac");
  assert.deepEqual([defense.mode, defense.condition], ["fixe", "etat"], "⭐ 10 + Dex + Con, sans armure");
  assert.ok(DOC.entrees.some((s) => s.source === "lineage" && s.effets.length), "⭐ les lignages ont leurs effets");
});
