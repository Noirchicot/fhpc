/* ══ LE MOTEUR DU CRAFT — et ce qui le tient au SRD ═══════════════════════════

   ⚖️ Les règles éprouvées ici ont toutes été tranchées par Eric le 2026-09-24 ;
   leur dérivation complète vit dans `FH-WEB/FHPC/Plan-ecran-X5/X5_gen.py`.

   ⭐ CE QUI DONNE SA FORCE À CETTE SUITE : le SRD répond lui-même à quatre des
   questions qu'elle pose. Le record `srd:item-value` écrit *« +1 Armor (Plate
   Armor) has a value of 5,500 GP »*, et `Weapon, +1, +2, or +3` annonce ses trois
   raretés. ⛔ Ce ne sont donc pas des attentes que j'ai choisies : ce sont des
   nombres que Wizards a publiés, et que le moteur doit retrouver.

   ── CE QUE LES CINQ FAMILLES TIENNENT ──────────────────────────────────────
     ① L'ÉCHELLE — le SRD retrouvé au gold près, là où il est régulier ;
     ② LES POUVOIRS — dérivés de `subtype`, sur la pile réelle, jamais listés ;
     ③ LA COTE — les quatre contrôles croisés, et la limite ;
     ④ LA QUANTITÉ — le plafond de la tuile, et le lot de dix payé une fois ;
     ⑤ LES REFUS — une rareté illisible, un assemblage hors limite.
*/
import test from "node:test";
import assert from "node:assert/strict";

import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import {
  RANG_MAX, ECHELLE_SOULFORGING, PLAFOND_QTE, LOT_MUNITION,
  paliterDeRarete, categorieAffichee, palierLePlusProche, pouvoirsDe, coteDe, encorePossibles, prixEnPO,
} from "../ui/builder/craft.mjs";
import { PALIERS_SRFH } from "../ui/builder/bareme-srfh.mjs";
import fs from "node:fs";

const query = exempleFhEn().layers.verbs.query;
const armes = query({ kind: "weapon" });
/* ⭐ DES RECORDS, PAS DES VUES — `craft.mjs` est strict, et c'est voulu : un
   organe qui accepte les deux formes accepte aussi la mauvaise. */
const magiques = query({ kind: "item" })
  .map((v) => v.record)
  .filter((r) => String(r?.data?.subtype || "").trim());
const parNom = new Map(armes.map((v) => [v.record.data.name, v.record]));
const R = (r) => ({ data: { rarity: r } });

/* ══ ① LE BARÈME — SRFH (lot 280) ═════════════════════════════════════════════
   ⚖️ Eric, 26/09 : « prix SRD et FH idem · mon échelle uniquement pour le soulforging » ;
   « addition de pp comme dans soulforging, sauf qu'on ne parlera de pp que dans le
   soulforging » ; « on se rabat sur le prix palier le plus proche ». */

test("1 — ⭐ UNE RARETÉ SRD SE LIT EN PALIER SRFH, avec son RANG — et l'échelle d'Eric n'est plus lue", () => {
  assert.deepEqual(["Common", "Uncommon", "Rare", "Very Rare", "Legendary"].map((n) => paliterDeRarete(n).rang),
    [1, 2, 4, 6, 8], "les rangs des cinq raretés SRD");
  assert.equal(paliterDeRarete("Rare (Requires Attunement)").valeur, 4000);
  assert.equal(paliterDeRarete("Legendary").valeur, 200000, "⭐ Legendary vaut 200 000 — le SRD, plus 400 000");
  assert.equal(RANG_MAX, 9, "Legendary+ est le dernier rang");
  /* ⛔ L'ÉCHELLE DU SOULFORGING reste écrite (une loi tranchée) mais n'a AUCUN lecteur dans le
     craft ordinaire : sa seule mention dans le code est sa déclaration. */
  assert.equal(ECHELLE_SOULFORGING.find((p) => p.nom === "Legendary").valeur, 400000);
  const src = fs.readFileSync(new URL("../ui/builder/craft.mjs", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ");
  assert.equal((src.match(/ECHELLE_SOULFORGING/g) || []).length, 1, "⛔ déclarée, jamais lue");
});

test("2 — ⚖️ LA RARETÉ AFFICHÉE SE RABAT SUR LE PALIER LE PLUS PROCHE — demi-paliers compris", () => {
  /* ⚖️ « on se rabat sur le prix palier le plus proche pour déterminer la rareté » (26/09).
     🔴 La règle du 24/09 disait « le palier INFÉRIEUR » : elle ne garde que l'égalité. */
  assert.equal(categorieAffichee(1900), "Uncommon+", "Plate + Mithral : 1 900 est plus près de 2 200 que de 400");
  assert.equal(categorieAffichee(4400), "Rare", "Breastplate +1 : 4 400, près de 4 000");
  assert.equal(categorieAffichee(130000), "Very Rare+", "130 000 : près de 120 000");
  assert.equal(categorieAffichee(1300), "Uncommon", "⚖️ à égalité (400 ↔ 2 200), le palier inférieur");
  assert.equal(categorieAffichee(9e9), "Legendary+", "au-delà, le dernier palier");
  assert.equal(palierLePlusProche(0), null, "⛔ rien à classer");
});

test("3 — ⚠️ LA RARETÉ SE COUPE À LA PARENTHÈSE, et c'est vital", () => {
  /* 📏 Mesuré sur la pile : AUCUN des pouvoirs composables ne porte une rareté
     nue — tous s'écrivent « Rare (Requires Attunement) ». Lire `rarity` sans
     couper rendrait `null`, et le prix tomberait à zéro sans lever d'erreur. */
  assert.equal(paliterDeRarete("Rare (Requires Attunement)").valeur, 4000);
  assert.equal(paliterDeRarete("Legendary (Requires Attunement)").valeur, 200000, "le SRD (lot 280)");
  assert.equal(paliterDeRarete("Rarity Varies"), null, "⛔ un marqueur de famille n'est pas un palier");
  assert.equal(paliterDeRarete(""), null);
  assert.equal(paliterDeRarete(null), null, "⛔ et l'absence ne fait pas tomber l'écran");

  const sansParenthese = magiques.filter((r) => !String(r.data.rarity || "").includes("("));
  const composables = magiques.filter((r) => /^any/i.test(r.data.subtype || ""));
  assert.ok(composables.length > 0, "la pile porte bien des pouvoirs composables");
  assert.ok(sansParenthese.length < magiques.length,
    "⚠️ si un jour TOUTES les raretés étaient nues, ce garde ne prouverait plus rien");
});

/* ══ ② LES POUVOIRS — SUR LA PILE RÉELLE ═══════════════════════════════════ */

test("4 — ⭐ LES POUVOIRS SE DÉRIVENT DE `subtype` — une épée et une masse diffèrent", () => {
  /* ⚖️ Eric : « différent pour une épée ou une masse ». ⛔ AUCUN NOM DE POUVOIR
     N'EST ÉCRIT ICI : on compare deux bases entre elles, pas à une liste. */
  const dague = pouvoirsDe(parNom.get("Dagger"), magiques).map((r) => r.data.name);
  const masse = pouvoirsDe(parNom.get("Mace"), magiques).map((r) => r.data.name);
  const longue = pouvoirsDe(parNom.get("Longsword"), magiques).map((r) => r.data.name);

  assert.ok(longue.length > masse.length && masse.length > dague.length,
    `⛔ Longsword (${longue.length}) > Mace (${masse.length}) > Dagger (${dague.length}) — `
    + "si ces trois comptes s'égalisent, le filtrage par base ne filtre plus rien");
  for (const l of [dague, masse, longue]) {
    assert.ok(l.length > 0, "chacune de ces trois bases reçoit au moins un pouvoir");
  }
  /* ⚔️ ET LE FILTRE REFUSE : le SRD limite `Vorpal Sword` à quatre bases nommées,
     et la dague n'en fait pas partie. Le croquis d'Eric montrait pourtant
     `Dagger + Vorpal` — la donnée l'interdit, et c'est elle qui tranche. */
  assert.ok(!dague.includes("Vorpal Sword"),
    "⛔ Vorpal est [Glaive, Greatsword, Longsword, or Scimitar] — pas sur une dague");
  assert.ok(longue.includes("Vorpal Sword"), "⭐ mais bien sur une épée longue");

  /* 🔴 ET CE BLOC EXISTE PARCE QUE LE GARDE NE MORDAIT PAS. Éprouvé en cassant le
     découpage — `split(/,/)` au lieu de `split(/,|\bor\b/)` — le test est RESTÉ
     VERT. La raison : « Glaive, Greatsword, Longsword, or Scimitar » se coupe
     alors en [..., "Longsword", "or Scimitar"], et Longsword s'en tire indemne.
     ⭐ SEUL LE DERNIER ÉLÉMENT D'UNE ÉNUMÉRATION DÉNONCE UN `or` OUBLIÉ, parce
     qu'il est le seul que le `or` précède. Un garde qui n'interroge que le milieu
     d'une liste ne tient pas ses bords. */
  const cimeterre = pouvoirsDe(parNom.get("Scimitar"), magiques).map((r) => r.data.name);
  assert.ok(cimeterre.includes("Vorpal Sword"),
    "⛔ Scimitar est le DERNIER de « …, Longsword, or Scimitar » — s'il manque, "
    + "c'est le `or` qui n'a pas été découpé, et la moitié des énumérations du SRD "
    + "perdent leur dernière base en silence");
});

test("5 — 🔴 AUCUNE BASE DU SRD N'EST SANS POUVOIR — et la règle tient quand même", () => {
  /* 🔴 CE GARDE AFFIRMAIT « HUIT ARMES N'OFFRENT AUCUN POUVOIR ». C'était faux : la
     règle du lot 258 ne lisait qu'une forme « Any … » sur cinq. Il avait écrit,
     d'avance, ce qui arriverait : « si plus aucune arme n'est vide, la règle de la
     rangée qui disparaît n'a plus de cas — elle devient du code mort qu'un lecteur
     croira encore vivant ». ⭐ Il a rougi exactement pour ça, le 24/09.
     ⚖️ LA RÈGLE D'ERIC TIENT (« oui voilà » : la rangée disparaît, elle ne se grise
     pas) — mais elle n'a AUJOURD'HUI AUCUN CAS dans le SRD. Ce garde ne peut donc
     plus exiger qu'un cas existe : il le DIT, et le mécanisme est tenu sur un cas
     construit (garde 3 de `x5-ecran.test.mjs`). */
  const bases = [...query({ kind: "weapon" }), ...query({ kind: "armor" })].map((v) => v.record);
  const vides = bases.filter((r) => pouvoirsDe(r, magiques).length === 0);
  assert.deepEqual(vides.map((r) => r.data.name), [],
    "📏 mesuré le 24/09 : les 51 bases portent toutes au moins un pouvoir. Si ce garde "
    + "rougit, une base est devenue vide — et la règle de la rangée qui disparaît a "
    + "retrouvé un cas réel, à REGARDER dans le banc.");
});

test("5 bis — ⚔️ LES CINQ FORMES « Any … » DU SRD SONT TOUTES LUES", () => {
  /* ⭐ CELUI-CI AURAIT ATTRAPÉ LE TROU DU LOT 258. Ses gardes interrogeaient des
     bases (Dagger, Mace, Longsword) — jamais les FORMES d'écriture. Or trois des
     cinq formes rendaient zéro base, et rien ne rougissait.
     ⛔ Il ÉNUMÈRE LES SUBTYPES RÉELS de la pile, il ne les liste pas : une forme
     ajoutée demain sera interrogée sans qu'on touche ce fichier. */
  const bases = [...query({ kind: "weapon" }), ...query({ kind: "armor" })].map((v) => v.record);
  const formes = [...new Set(magiques.map((r) => r.data.subtype))].filter((st) => /^any\b/i.test(st));
  assert.ok(formes.length >= 4, `la pile porte bien plusieurs formes « Any … » (${formes.length})`);
  for (const st of formes) {
    const n = bases.filter((b) => pouvoirsDe(b, [{ data: { subtype: st, rarity: "Rare" } }]).length).length;
    if (/ammunition/i.test(st)) {
      assert.equal(n, 0, "⏳ `Any Ammunition` reste à zéro, DÉCLARÉ — il ira avec le lot des munitions");
      continue;
    }
    assert.ok(n > 0, `🔴 [${st}] ne trouve AUCUNE base — c'est exactement le trou du lot 258`);
  }
});

test("5 quater — ⚔️ « EXCEPT » RETIRE LA BASE QU'IL NOMME, et seulement elle", () => {
  /* 🔴 CE GARDE EST NÉ D'UNE ÉPREUVE RESTÉE VERTE : en supprimant l'exclusion, rien
     n'a rougi. `Adamantine Armor` et `Mithral Armor` sont `[Any Medium or Heavy,
     Except Hide Armor]` — la seule exclusion du SRD, et aucun garde ne l'interrogeait. */
  const armures = new Map(query({ kind: "armor" }).map((v) => [v.record.data.name, v.record]));
  const adamantine = magiques.find((r) => r.data.name === "Adamantine Armor");
  assert.ok(adamantine, "l'objet est dans la pile");
  assert.equal(pouvoirsDe(armures.get("Hide Armor"), [adamantine]).length, 0,
    "⛔ Hide Armor est MOYENNE — elle passerait le filtre de famille, c'est l'exclusion qui la retire");
  assert.equal(pouvoirsDe(armures.get("Chain Mail"), [adamantine]).length, 1,
    "⭐ mais une autre armure lourde reste acceptée — l'exclusion ne vide pas la famille");
  assert.equal(armures.get("Hide Armor").data.armor_category, "medium",
    "⚠️ si Hide Armor cessait d'être moyenne, ce garde ne prouverait plus l'exclusion");
});

test("5 ter — ⛔ UN PLAN N'EST JAMAIS UN POUVOIR", () => {
  /* 🔴 Dès que la règle a su lire `Any Light, Medium, or Heavy`, `Armor, +1, +2, or +3`
     est arrivé dans les pouvoirs — c'est le rôle de BONUS. Et le filtre que j'avais
     écrit pour l'empêcher NE FILTRAIT RIEN : `paliterDeRarete` coupait à la première
     parenthèse et rendait « Uncommon » pour une énumération entière. */
  assert.equal(paliterDeRarete("Uncommon (+1), Rare (+2), or Very Rare (+3)"), null,
    "⛔ une énumération n'est pas un palier");
  assert.equal(paliterDeRarete("Very Rare (Requires Attunement)").nom, "Very Rare",
    "⚠️ et « Very Rare » n'est pas compté deux fois parce qu'il contient « Rare »");
  const bases = [...query({ kind: "weapon" }), ...query({ kind: "armor" })].map((v) => v.record);
  const plans = bases.flatMap((b) => pouvoirsDe(b, magiques))
    .filter((r) => /\+1, \+2, or \+3/.test(r.data.name));
  assert.deepEqual(plans.map((r) => r.data.name), [], "⛔ aucun plan parmi les pouvoirs");
});


/* ══ ③ LA COTE — LES CONTRÔLES CROISÉS DU SRD ══════════════════════════════ */

test("6 — ⚔️ LE SRD DONNE LA RÉPONSE : +1 Armor (Plate) vaut 5 500 GP", () => {
  /* ⭐ Le record `srd:item-value` l'écrit en toutes lettres dans son exemple.
     ⛔ Ce n'est pas une attente que j'ai choisie — c'est un nombre publié. */
  const plate = { data: { cost: "1,500 GP" } };
  const c = coteDe({ base: plate, bonus: "Rare", pouvoirs: [] });
  assert.equal(c.legal, true);
  assert.equal(c.venteUnitaire, 5500,
    "🔴 4 000 (la rareté) + 1 500 (la plate) = 5 500 — le nombre du SRD");
  assert.equal(c.craftUnitaire, 2750, "⭐ et le craft en est exactement la moitié");
});

test("7 — ⚔️ LE SRD DONNE TROIS AUTRES RÉPONSES : les raretés de `Weapon, +1, +2, or +3`", () => {
  /* Sans aucun pouvoir, l'objet ne vaut que son bonus. Le SRD annonce
     « Uncommon (+1), Rare (+2), or Very Rare (+3) » : le moteur doit retomber
     sur les valeurs de ces trois raretés, à l'unité près. */
  const nu = { data: { cost: "0 GP" } };
  for (const [bonus, attendu] of [["Uncommon", 400], ["Rare", 4000], ["Very Rare", 40000]]) {
    const c = coteDe({ base: nu, bonus, pouvoirs: [] });
    assert.equal(c.venteUnitaire, attendu, `⛔ un bonus ${bonus} seul vaut ${attendu} GP`);
    assert.equal(c.categorie, bonus, "⭐ et il s'annonce sous son propre nom");
  }
});

test("8 — ⚖️ LES RANGS S'ADDITIONNENT, et la valeur est celle du palier du total", () => {
  /* ⚖️ « addition de pp comme dans soulforging » — on ne dit pas PP ici, on dit rang. */
  const nu = { data: { cost: "0 GP" } };
  const cas = [
    [["Common", "Uncommon"], 3, 2200, "Uncommon+"],
    [["Uncommon", "Uncommon"], 4, 4000, "Rare"],
    [["Uncommon", "Rare"], 6, 40000, "Very Rare"],
    [["Rare", "Rare"], 8, 200000, "Legendary"],
    [["Legendary", "Common"], 9, 280000, "Legendary+"],
  ];
  for (const [[a, b], rang, valeur, nom] of cas) {
    const c = coteDe({ base: nu, bonus: a, pouvoirs: [b] });
    assert.equal(c.rang, rang, `${a} + ${b} = rang ${rang}`);
    assert.equal(c.magie, valeur, `⛔ ${a} + ${b} vaut ${valeur}, la valeur du palier du rang ${rang}`);
    assert.equal(c.categorie, nom);
    assert.equal(c.magie, PALIERS_SRFH.find((p) => p.rang === rang).valeur, "⭐ lu dans le barème, pas recalculé");
  }
});

test("9 — ⚖️ LEGENDARY+ S'ATTEINT, ET RIEN AU-DELÀ", () => {
  /* ⚖️ « on peut atteindre legendary+ » — rang 9. Au-delà, aucun artisan. */
  const nu = { data: { cost: "0 GP" } };
  const c = coteDe({ base: nu, bonus: "Uncommon", pouvoirs: ["Rare", "Rare"] });
  assert.equal(c.legal, false, "+1 · Flame Tongue · Vicious : 2 + 4 + 4 = 10");
  assert.equal(c.raison, "au-dela-de-la-limite");
  assert.equal(c.rang, 10);
  const pile = coteDe({ base: nu, bonus: "Legendary", pouvoirs: ["Common"] });
  assert.equal(pile.legal, true, "⭐ 8 + 1 = 9 tombe PILE sur Legendary+");
  assert.equal(pile.categorie, "Legendary+");
});

test("10 — ⚖️ LA BASE S'AJOUTE, ET LE TEMPS SUIT LA RARETÉ AFFICHÉE — le même dans les deux piles", () => {
  /* ⚖️ « on rajoute le prix de l'objet original » ; le temps d'Uncommon+ pour une plate,
     « c'est long de fabriquer une plate ». Et « prix SRD et FH idem » : plus de pile muette. */
  const plate = { data: { cost: "1,500 GP" } };
  const c = coteDe({ base: plate, bonus: null, pouvoirs: ["Uncommon"] });
  assert.equal(c.venteUnitaire, 1900);
  assert.equal(c.categorie, "Uncommon+", "la base fait monter la rareté affichée");
  assert.equal(c.temps, "30 days", "⭐ le temps d'Uncommon+, pas celui d'Uncommon (10)");
  assert.equal(c.craftUnitaire, 950, "la moitié de la valeur, base comprise");
  assert.equal(c.dc, undefined, "⛔ plus de jet ni de DC");
});

test("11 — ⚖️ UNE TUILE NE SORT JAMAIS DU CRAFT AVEC PLUS DE DIX", () => {
  const nu = { data: { cost: "0 GP" } };
  assert.equal(coteDe({ base: nu, bonus: "Uncommon", qte: 99 }).qte, PLAFOND_QTE,
    "⚖️ « je veux pas qu'une tuile puisse sortir du craft avec plus de 10 »");
  assert.equal(coteDe({ base: nu, bonus: "Uncommon", qte: 0 }).qte, 1, "⛔ ni avec moins de un");
  assert.equal(coteDe({ base: nu, bonus: "Uncommon", qte: 3.7 }).qte, 3, "une quantité est entière");
});

test("12 — ⭐ DIX FLÈCHES SE PAIENT UNE FOIS — et c'est le SRD qui le dit", () => {
  /* ⭐ `Ammunition, +1, +2, or +3` porte, dans sa propre prose : *« Ten pieces of
     this ammunition are equivalent in value to a potion of the same rarity »*.
     ⛔ La règle d'Eric n'est donc pas une adaptation, c'est celle de Wizards. */
  const fleche = { data: { cost: "1 CP", category: "ammunition" } };
  const epee = { data: { cost: "15 GP", weapon_range: "melee" } };

  const dix = coteDe({ base: fleche, bonus: "Uncommon", qte: 10 });
  const une = coteDe({ base: fleche, bonus: "Uncommon", qte: 1 });
  assert.equal(dix.lot, LOT_MUNITION);
  assert.equal(dix.paiements, 1, "⛔ dix flèches = UN paiement");
  assert.equal(dix.craftTotal, une.craftTotal, "⭐ et dix coûtent exactement ce que coûte une");

  const troisEpees = coteDe({ base: epee, bonus: "Uncommon", qte: 3 });
  assert.equal(troisEpees.lot, 1, "⚔️ mais une épée n'est pas une munition");
  assert.equal(troisEpees.paiements, 3, "⛔ trois épées se paient trois fois");
});

/* ══ ⑤ LES REFUS, ET CE QUE LE SECOND CHOIX PEUT ENCORE ÊTRE ═══════════════ */

test("13 — ⚔️ UNE RARETÉ ILLISIBLE EST REFUSÉE, elle ne vaut pas zéro", () => {
  /* 🔴 LE DANGER EXACT : un prix qui tombe silencieusement à 0 est pire qu'une
     erreur — il s'affiche, il est plausible, et personne ne le vérifie. */
  const nu = { data: { cost: "0 GP" } };
  const c = coteDe({ base: nu, bonus: "Rarity Varies", pouvoirs: [] });
  assert.equal(c.legal, false);
  assert.equal(c.raison, "rarete-illisible");
  assert.equal(coteDe({ base: nu, pouvoirs: [] }).raison, "sans-propriete",
    "⛔ et un objet sans aucune propriété n'est pas un craft à zéro gold");
});

test("14 — ⭐ LE SECOND CHOIX NE PROPOSE QUE CE QUI TIENT SOUS LEGENDARY+", () => {
  /* ⛔ CE N'EST PAS UNE RÈGLE ANTI-DOUBLON, c'est la limite du barème : la somme des rangs
     ne passe pas 9. */
  const inventaire = ["Uncommon", "Rare", "Very Rare", "Legendary"]
    .map((r) => ({ data: { rarity: `${r} (Requires Attunement)` } }));
  const noms = (l) => l.map((c) => c.data.rarity.split(" (")[0]);
  assert.deepEqual(noms(encorePossibles(["Legendary"], inventaire)), [],
    "⛔ après un Legendary (8), même un Uncommon (2) passe 9");
  assert.deepEqual(noms(encorePossibles(["Rare"], inventaire)), ["Uncommon", "Rare"],
    "après un Rare (4) : Uncommon (6) et Rare (8) tiennent, Very Rare (10) non");
  assert.deepEqual(noms(encorePossibles(["Uncommon", "Rare"], inventaire)), ["Uncommon"],
    "+1 et Flame Tongue (6) : il ne reste que 3 — un Uncommon");
  assert.equal(encorePossibles([], inventaire).length, 4, "et sans rien, tout est ouvert");
});

test("15 — ⚠️ UN COÛT ILLISIBLE REND ZÉRO, JAMAIS NaN", () => {
  /* 🔴 Un NaN se propage dans toute l'addition et s'affiche « NaN GP » — mais
     seulement après avoir traversé trois organes sans que rien ne rougisse. */
  assert.equal(prixEnPO("10 GP"), 10);
  assert.equal(prixEnPO("5 SP"), 0.5);
  assert.equal(prixEnPO("1,500 GP"), 1500, "⭐ la virgule des milliers du SRD");
  for (const mauvais of ["Varies", "", null, undefined, "abc GP", "GP"]) {
    const v = prixEnPO(mauvais);
    assert.equal(v, 0, `« ${mauvais} » rend 0`);
    assert.ok(Number.isFinite(v), "⛔ et surtout : un nombre fini");
  }
});
