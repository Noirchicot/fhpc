/* ══ LA VALEUR D'UN OBJET — un seul organe, et ce qui le tient au SRD ═════════

   ⚖️ Eric, 2026-09-24 : *« les autres objets magiques ne sont pas des blueprints
   et sont censés avoir une valeur, même si on n'arrive pas toujours à calculer le
   poids »*.

   🔴 LA PANNE AVAIT DEUX TÊTES, et ces gardes tiennent les deux :
     ① 48 objets magiques FINIS portaient la diagonale des plans (le signal de la
       catégorie, retiré — voir `jeton-recette.test.mjs`, garde 1 retourné) ;
     ② aucun objet magique n'avait de prix, parce que SEPT lecteurs lisaient
       `data.cost` à la main et que le SRD n'en écrit pas sur les objets magiques.

   ⭐ LA RÈGLE DE PRIX N'EST PAS UNE ADAPTATION : c'est celle de `srd:item-value`,
   qui donne la valeur de chaque rareté et écrit *« if a magic item incorporates an
   item that has a purchase cost, add that item's cost »*, avec son exemple chiffré.
*/
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { fabriqueDeValeur, estRecette, parseCout, enGP } from "../ui/builder/equipement-pipeline.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const query = exempleFhEn().layers.verbs.query;
const valeurDe = fabriqueDeValeur(query);
const items = query({ kind: "item" }).map((v) => v.record);
const parNom = new Map(items.map((r) => [r.data.name, r]));
const or = (r) => enGP(parseCout(valeurDe(r).cout));

test("1 — ⚔️ LE SRD DONNE LA RÉPONSE : sa propre règle, sur ses propres records", () => {
  /* ⭐ `Dragon Scale Mail` : Very Rare, sur `Scale Mail` (50 GP, 45 lb.). Le SRD
     dit 40 000 + le coût de la base. ⛔ Ce n'est pas un nombre que j'ai choisi. */
  const d = valeurDe(parNom.get("Dragon Scale Mail"));
  assert.equal(d.cout, "40,050 GP", "⛔ 40 000 (Very Rare) + 50 (Scale Mail)");
  assert.equal(d.poids, "45 lb.", "⭐ et la base unique DONNE son poids");
  const v = valeurDe(parNom.get("Dagger of Venom"));
  assert.equal(v.cout, "4,002 GP", "4 000 (Rare) + 2 (Dagger)");
  assert.equal(v.poids, "1 lb.");
});

test("2 — ⚖️ PLUSIEURS BASES : la valeur seule, et ⛔ AUCUN poids inventé", () => {
  /* ⚖️ « même si on n'arrive pas toujours à calculer le poids ». `Sword of Life
     Stealing` se pose sur six épées différentes : on ne sait pas laquelle, donc
     on n'ajoute AUCUN prix de base et on ne donne AUCUN poids. */
  const s = valeurDe(parNom.get("Sword of Life Stealing"));
  assert.equal(s.cout, "4,000 GP", "la rareté seule — la base est inconnue");
  assert.equal(s.poids, null, "⛔ null, pas 3 lb. deviné sur l'épée la plus probable");
  const def = valeurDe(parNom.get("Defender"));
  assert.equal(def.cout, "200,000 GP", "`Any Melee Weapon` : aucune base, la rareté seule");
  assert.equal(def.poids, null);
});

test("3 — ⚔️ UNE BASE EN PIÈCES D'ARGENT NE VAUT PAS ZÉRO", () => {
  /* 🔴 LE PIÈGE EXACT, et je l'ai commis dans ma première mesure : ne lire que
     `.gp` d'un coût « 5 SP » rend 0 — ou, dans mon script de relevé, `parseFloat`
     rendait 5 au lieu de 0,5, et j'ai lu « 405 » pour un javelot magique qui vaut
     400,5. `enGP` convertit ; ce garde le tient. */
  const j = valeurDe(parNom.get("Javelin of Lightning"));
  assert.equal(or(parNom.get("Javelin of Lightning")), 400.5,
    "⛔ 400 (Uncommon) + 0,5 (un javelot coûte 5 SP) — ni 400, ni 405");
  assert.equal(j.cout, "400.5 GP",
    "⭐ LE DÉCIMAL EST LE SEUL FORMAT QUI SE RELIT : « 400 GP 5 SP » rend `null` à `parseCout`");
  assert.equal(parseCout("400 GP 5 SP"), null,
    "⚠️ et c'est pour ça qu'on n'écrit pas ce format-là — ce garde rougira le jour où il se relira");
});

test("4 — 🔴 LES 48 ARMES ET ARMURES MAGIQUES FINIES ONT TOUTES UNE VALEUR", () => {
  /* ⛔ Le compte n'est pas épinglé à 48 : un objet ajouté demain doit être tenu
     lui aussi. Ce qui est tenu, c'est que AUCUN ne reste sans prix. */
  const finis = items.filter((r) => ["weapon", "armor"].includes(r.data.category) && !estRecette(r));
  assert.ok(finis.length > 20, `il y en a bien (${finis.length})`);
  const sansPrix = finis.filter((r) => !valeurDe(r).cout);
  assert.deepEqual(sansPrix.map((r) => r.data.name), [],
    "⛔ un objet magique fini sans prix est exactement la panne d'origine");
  for (const r of finis) {
    assert.equal(estRecette(r), false, `${r.data.name} ne porte plus la diagonale`);
  }
});

test("5 — ⛔ UN PLAN N'A PAS DE PRIX DE CATALOGUE — c'est X5 qui le calcule", () => {
  /* `Weapon, +1, +2, or +3` n'est pas encore un objet : sa valeur dépend du bonus
     et de la base qu'on choisira. Lui donner un prix ici serait coter un objet
     qui n'existe pas. */
  for (const n of ["Weapon, +1, +2, or +3", "Armor, +1, +2, or +3", "Spell Scroll", "Figurine of Wondrous Power"]) {
    const r = parNom.get(n);
    assert.ok(r, `${n} est dans la pile`);
    assert.equal(estRecette(r), true, `${n} est un plan`);
    assert.equal(valeurDe(r).cout, null, `⛔ ${n} n'a pas de prix de catalogue`);
  }
});

test("6 — ⭐ UN PRIX ÉCRIT GAGNE TOUJOURS", () => {
  /* L'organe ne recalcule pas ce que le record dit déjà : un `cost` du SRD est
     rendu tel quel, même sur un objet qui aurait aussi une rareté. */
  assert.deepEqual(valeurDe({ data: { cost: "25 GP", weight: "5 lb.", rarity: "Rare" } }),
    { cout: "25 GP", poids: "5 lb." });
  assert.deepEqual(valeurDe(null), { cout: null, poids: null }, "⛔ et l'absence ne fait pas tomber l'écran");
});

test("7 — 🔴 SEPT LECTEURS, UN ORGANE : plus personne ne lit `data.cost` à la main", () => {
  /* ⚠️ GARDE DE SOURCE, et je l'écris plutôt que de le laisser croire fort. La
     panne d'origine était SEPT lecteurs écrits à la main ; en réparer un aurait
     laissé les six autres muets — le lot 256 l'a payé sur la diagonale. Ce garde
     tient qu'aucun ne revient. ⛔ Les commentaires sortent avant la mesure : un mot
     compté compte aussi la phrase qui le nie. */
  const src = fs.readFileSync(path.join(ROOT, "ui", "builder", "equipment-step.mjs"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
  const lecteurs = src.match(/\bdata\.(cost|weight)\b/g) || [];
  assert.deepEqual(lecteurs, [],
    `⛔ ${lecteurs.length} lecture(s) directe(s) de data.cost/data.weight — elles contournent `
    + "`fabriqueDeValeur`, et un objet magique y affichera « — »");
});
