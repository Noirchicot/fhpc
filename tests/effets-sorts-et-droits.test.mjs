/* ══ L'INVENTAIRE, COMPLÉTÉ — les sorts qui changent la fiche, et les droits chiffrés ══ lot 287
   ⚖️ Eric, 2026-09-26 : « donc tu as la liste de tous les éléments du perso de 1 à 8 ? » — pas
   tout ; puis « 1 2 3 oui » : les droits des classes et de l'héritage, les armes et armures, les
   sorts qui changent la fiche. ⭐ Deux fichiers de plus, même méthode : complets, prouvés, et
   ⛔ lus par aucun code tant que la fiche n'a pas décidé comment les appliquer. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { entreesDesSorts } from "../src/tools/entrees-effets.mjs";
import { droitsDuPersonnage } from "../src/tools/droits-du-personnage.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "sources-effets", f), "utf8"));
const Q = exempleFhEn().layers.verbs.query;
const SORTS = lire("sorts.effets.json");
const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();

test("1 — ⭐ LES SORTS : chacun des sorts de la pile, trié, et ses effets prouvés", () => {
  const E = entreesDesSorts(Q);
  assert.deepEqual(SORTS.sorts.map((s) => s.id), E.map((e) => e.id), "⛔ un sort ajouté à la pile doit être trié");
  const parId = new Map(E.map((e) => [e.id, e]));
  const fautes = [];
  for (const s of SORTS.sorts) {
    assert.equal(typeof s.change_la_fiche, "boolean", `${s.name} : trié`);
    assert.equal(s.change_la_fiche, s.effets.length > 0, `${s.name} : des effets si et seulement s'il change la fiche`);
    assert.equal(s.duree, parId.get(s.id).duree, `${s.name} : la durée est celle du record`);
    for (const e of s.effets) if (!norm(parId.get(s.id).text).includes(norm(e.citation))) fautes.push(`${s.name} :: ${e.citation}`);
  }
  assert.deepEqual(fautes, [], "⛔ une citation introuvable est un effet inventé");
});

test("2 — ⚔️ LES TÉMOINS DES SORTS : Mage Armor, Aid, Shield, Bless — et Fireball ne touche pas la fiche", () => {
  const un = (n) => SORTS.sorts.find((s) => s.name === n);
  assert.ok(un("Mage Armor").effets.some((e) => e.cible === "ac"), "Mage Armor : la CA");
  assert.ok(un("Aid").effets.some((e) => e.cible === "hp.max"), "Aid : les PV max");
  assert.ok(un("Shield").effets.some((e) => e.cible === "ac"), "Shield : la CA");
  assert.equal(un("Fireball").change_la_fiche, false, "⛔ un sort de dégâts ne change pas la fiche du lanceur");
});

test("3 — ⭐ LES DROITS CHIFFRÉS : le fichier EST ce que la pile donne, sans une main", () => {
  const f = lire("droits-personnage.json");
  const d = droitsDuPersonnage(Q);
  for (const k of ["classes", "heritages", "armes", "armures"]) assert.deepEqual(f[k], d[k], `⛔ ${k} : régénère le fichier depuis la pile`);
  const guerrier = d.classes.find((c) => c.name === "Fighter");
  assert.deepEqual([guerrier.hit_die, guerrier.saves, guerrier.subclass], [10, ["str", "con"], "Champion"]);
  assert.equal(d.armures.find((a) => a.name === "Breastplate").ac_base, 14);
  assert.equal(d.classes.length, 12);
});
