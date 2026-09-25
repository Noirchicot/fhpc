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
/* ⭐ LOT 279 — l'organe rend aussi `rarete` et `craft` : ces gardes-ci tiennent le PRIX et le
   POIDS, ils les comparent seuls (les deux autres ont leurs gardes, 8 à 10). */
const prixEtPoids = (v) => ({ cout: v.cout, poids: v.poids });

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

test("2 — ⭐ PLUSIEURS BASES : C'EST UN PLAN, et un plan n'a pas de prix de catalogue", () => {
  /* ⚖️ LOT 263 — Eric : « les armes magiques / armures classiques […] n'ont pas pour
     autant un type d'arme ou d'armure associé. Donc ça rentre dans la définition du
     blueprint ». Ce garde affirmait au lot 260 que `Sword of Life Stealing` valait
     4 000 GP : ⛔ il faut d'abord choisir l'épée, et le prix en dépend (la base
     s'ajoute). C'est X5 qui le calcule, une fois la base choisie. */
  for (const n of ["Sword of Life Stealing", "Defender", "Dwarven Plate"]) {
    const r = parNom.get(n);
    assert.equal(estRecette(r), true, `${n} demande un choix de base : c'est un plan`);
    assert.deepEqual(prixEtPoids(valeurDe(r)), { cout: null, poids: null },
      `⛔ ${n} n'a ni prix ni poids de catalogue — ni l'un ni l'autre ne s'invente avant la base`);
  }
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

test("4 — 🔴 UNE SEULE BASE : OBJET FINI, AVEC SA VALEUR — et la frontière tient sur toute la pile", () => {
  /* ⭐ LA FRONTIÈRE DU LOT 263 : un `subtype` qui ne nomme QU'UNE base n'a rien à faire
     choisir. 📏 Mesuré : 20 armes et armures magiques dans ce cas — `Dagger of Venom`,
     `Sun Blade`, `Dragon Scale Mail`… Le lot 260 en comptait 48 : il y rangeait les 28
     qui demandent un choix. ⛔ Le compte n'est pas épinglé ; ce qui est tenu, c'est
     que CHAQUE objet fini a un prix ET une base unique. */
  const finis = items.filter((r) => ["weapon", "armor"].includes(r.data.category) && !estRecette(r));
  assert.ok(finis.length >= 10, `il y en a bien (${finis.length})`);
  for (const r of finis) {
    assert.ok(valeurDe(r).cout, `⛔ ${r.data.name} est un objet fini sans prix`);
    const cites = String(r.data.subtype || "").split(/,|\bor\b/).map((x) => x.trim()).filter(Boolean);
    assert.equal(cites.length, 1, `⚔️ ${r.data.name} est fini alors qu'il accepte ${cites.length} bases`);
    assert.ok(!/^any\b/i.test(r.data.subtype), `⚔️ ${r.data.name} : « Any … » est toujours un choix`);
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
  assert.deepEqual(prixEtPoids(valeurDe({ data: { cost: "25 GP", weight: "5 lb.", rarity: "Rare" } })),
    { cout: "25 GP", poids: "5 lb." });
  assert.deepEqual(prixEtPoids(valeurDe(null)), { cout: null, poids: null }, "⛔ et l'absence ne fait pas tomber l'écran");
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

test("8 — 🔴 UN CONSOMMABLE VAUT LA MOITIÉ — la note du SRD, que le lot 260 n'avait pas lue", () => {
  /* ⭐ `srd:item-value` le dit dans `value_footnote` : « Halve the value for a
     consumable item other than a Spell Scroll ». 📏 Déployé à tort le 24/09 :
     `Potion of Flying` à 40 000 GP pour 20 000. ⛔ Un record se lit EN ENTIER — j'avais
     lu `tiers` et `add_base_cost_rule`, pas la note. */
  const table = query({ kind: "item-value" })[0].record.data;
  assert.match(table.value_footnote, /halve the value for a consumable/i,
    "⚠️ si la note change, cette règle doit être relue — ce garde le dira");
  const vol = parNom.get("Potion of Flying");
  assert.equal(vol.data.category, "potion");
  assert.equal(valeurDe(vol).cout, "20,000 GP", "⛔ Very Rare (40 000) ÷ 2");
  const bourse = parNom.get("Bag of Holding");
  assert.equal(valeurDe(bourse).cout, "400 GP", "⚔️ un objet NON consommable garde sa pleine valeur");
});

/* ══ LOT 279 — LA RARETÉ ET LA NOTE DE CRAFT ═════════════════════════════════════
   ⚖️ Eric, 26/09 : « tous les objets magiques, y compris ceux qui ne passent pas par X5,
   devront avoir une référence au prix du craft (une petite note en pied de page en
   italique) », la rareté à côté du prix — et sur la maquette « Dagger of Venom · 4,002 GP ·
   Rare · Crafting: 50 days · 2,001 GP · Rare » : « exact ». */
const { PALIERS_SRFH, noteDeCraft, texteDeLaNote } = await import("../ui/builder/bareme-srfh.mjs");
const { variantesDe } = await import("../src/build/objet-crafte.mjs");
const { recordDUneVariante } = await import("../ui/builder/craft.mjs");

test("8 — ⚖️ LE BARÈME SRFH : le SRD à la lettre, et les demi-paliers à mi-chemin exact", () => {
  /* ⭐ Les paliers pleins DOIVENT retrouver le record `srd:item-value` — ⛔ un seul écart, et
     la « référence » dirait autre chose que le SRD qu'elle prétend porter. */
  const table = query({ kind: "item-value" })[0].record.data.tiers;
  for (const p of PALIERS_SRFH.filter((x) => x.srd)) {
    const t = table.find((x) => x.rarity_label === p.nom);
    assert.equal(p.valeur, t.value_gp, `${p.nom} : la valeur est celle du SRD`);
    assert.equal(p.cout, p.valeur / 2, `${p.nom} : le coût de craft SRD est la moitié de la valeur`);
  }
  assert.deepEqual(PALIERS_SRFH.filter((x) => x.srd).map((p) => p.jours), [5, 10, 50, 125, 250],
    "le temps SRD (« Magic Item Crafting Time and Cost », p. 206)");
  /* les demi-paliers ENCADRÉS : Common+ … Very Rare+ (Legendary+ n'a pas de voisin au-dessus) */
  for (let i = 1; i < PALIERS_SRFH.length - 2; i += 2) {
    const [a, m, b] = [PALIERS_SRFH[i - 1], PALIERS_SRFH[i], PALIERS_SRFH[i + 1]];
    assert.equal(m.srd, false, `${m.nom} est un demi-palier SRFH`);
    for (const k of ["jours", "cout", "valeur"]) {
      assert.equal(m[k], (a[k] + b[k]) / 2, `${m.nom}.${k} est le milieu exact de ${a.nom} et ${b.nom}`);
    }
  }
  /* ⚖️ Legendary+ (Eric, 26/09 : « oui ») reprend le pas de Very Rare+ à Legendary */
  const [vrp, leg, legp] = PALIERS_SRFH.slice(-3);
  for (const k of ["jours", "cout", "valeur"]) {
    assert.equal(legp[k] - leg[k], leg[k] - vrp[k], `Legendary+.${k} : le pas de Very Rare+ → Legendary, une fois de plus`);
  }
  assert.equal(legp.nom, "Legendary+");
  /* ⭐ les rangs : Common 1, puis un rang par palier à partir d'Uncommon ; Common+ n'en a pas */
  assert.deepEqual(PALIERS_SRFH.map((p) => p.rang), [1, null, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("9 — ⚖️ LA MAQUETTE D'ERIC : Dagger of Venom · 4,002 GP · Rare · Crafting: 50 days · 2,001 GP · Rare", () => {
  const v = valeurDe(parNom.get("Dagger of Venom"));
  assert.equal(v.rarete, "Rare");
  assert.equal(texteDeLaNote(v.craft), "Crafting: 50 days · 2,001 GP · Rare",
    "⭐ 2 000 (Rare) + la moitié de la Dagger (1) — la base se fabrique à moitié prix");
  /* ⭐ UN CONSOMMABLE : temps et coût divisés par deux, les jours arrondis VERS LE HAUT */
  const vol = valeurDe(parNom.get("Potion of Flying"));
  assert.equal(vol.rarete, "Very Rare");
  assert.equal(texteDeLaNote(vol.craft), "Crafting: 63 days · 10,000 GP · Very Rare", "125 ÷ 2 = 62,5 → 63");
  /* ⭐ LA SEULE RÈGLE NOMMÉE DU SRD : le brassage de la potion de soin de base */
  const soin = query({ kind: "gear" }).map((x) => x.record).find((r) => r.data.name === "Potion of Healing");
  assert.equal(texteDeLaNote(valeurDe(soin).craft), "Crafting: 1 day · 25 GP · Common");
  /* ⭐ UNE VARIANTE, par son objet fini */
  const ioun = recordDUneVariante(parNom.get("Ioun Stone"), "Awareness");
  assert.equal(texteDeLaNote(valeurDe(ioun).craft), "Crafting: 50 days · 2,000 GP · Rare");
  const greater = recordDUneVariante(parNom.get("Potions of Healing"), "Greater");
  assert.equal(texteDeLaNote(valeurDe(greater).craft), "Crafting: 5 days · 100 GP · Uncommon");
});

test("10 — ⛔ LA NOTE SE TAIT QUAND ELLE NE SAIT PAS — un plan, une rareté illisible, un objet mondain", () => {
  for (const n of ["Sword of Life Stealing", "Ioun Stone", "Spell Scroll", "Weapon, +1, +2, or +3"]) {
    assert.equal(valeurDe(parNom.get(n)).craft, null, `${n} est un plan : pas encore un objet`);
  }
  const corde = query({ kind: "gear" }).map((x) => x.record).find((r) => r.data.name === "Rope");
  if (corde) assert.equal(valeurDe(corde).rarete, null, "⛔ un objet mondain n'a pas de rareté");
  assert.equal(noteDeCraft({ rarete: "Artifact" }), null, "⛔ Artifact : « Priceless »");
  assert.equal(texteDeLaNote(null), "");
  /* 📏 ET ELLE COUVRE LES OBJETS FINIS DU SRD : chaque objet magique qui n'est pas un plan
     a sa note — ⛔ un seul muet serait un trou dans la « référence ». */
  /* 📏 Mesuré : un seul objet fini se tait, `Dragon Orb` — un ARTIFACT, que le SRD dit
     « Priceless ». ⛔ Le garde ne le nomme pas : il tient que seuls les artefacts se taisent. */
  const muets = items.filter((r) => !estRecette(r) && !valeurDe(r).craft);
  const nonArtefacts = muets.filter((r) => !/artifact/i.test(r.data.rarity || "")).map((r) => r.data.name);
  assert.deepEqual(nonArtefacts, [], `objets finis sans note : ${nonArtefacts.join(", ")}`);
  assert.ok(muets.length >= 1, "témoin : l'artefact du SRD est bien muet");
});
