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
  PALIERS, LIMITE, UNITE, PLAFOND_QTE, LOT_MUNITION,
  paliterDeRarete, categorieAffichee, pouvoirsDe, coteDe, encorePossibles, prixEnPO,
} from "../ui/builder/craft.mjs";

const query = exempleFhEn().layers.verbs.query;
const armes = query({ kind: "weapon" });
/* ⭐ DES RECORDS, PAS DES VUES — `craft.mjs` est strict, et c'est voulu : un
   organe qui accepte les deux formes accepte aussi la mauvaise. */
const magiques = query({ kind: "item" })
  .map((v) => v.record)
  .filter((r) => String(r?.data?.subtype || "").trim());
const parNom = new Map(armes.map((v) => [v.record.data.name, v.record]));
const R = (r) => ({ data: { rarity: r } });

/* ══ ① L'ÉCHELLE ═══════════════════════════════════════════════════════════ */

test("1 — ⭐ L'ÉCHELLE RETROUVE LE SRD AU GOLD PRÈS, là où le SRD est régulier", () => {
  const srd = { Uncommon: 400, Rare: 4000, "Very Rare": 40000 };
  for (const [nom, valeur] of Object.entries(srd)) {
    assert.equal(PALIERS.find((p) => p.nom === nom).valeur, valeur,
      `⛔ ${nom} doit valoir exactement ce que le record \`srd:item-value\` annonce`);
  }
  assert.equal(UNITE, PALIERS[0].valeur, "⭐ le `÷ 40` de la règle EST le plus petit échelon");
  for (let i = 1; i < PALIERS.length; i += 1) {
    assert.equal(PALIERS[i].valeur, PALIERS[i - 1].valeur * 10,
      "⚖️ « pas de demi crans et basta » — une décade par palier, sans exception");
  }
});

test("2 — ⚔️ LE CLASSEMENT DESCEND, il ne s'approche pas", () => {
  /* 🔴 CE GARDE EXISTE PARCE QUE J'AVAIS ÉCRIT LE CONTRAIRE. J'avais posé « la
     catégorie la plus proche NUMÉRIQUEMENT » ; Eric a corrigé : « tu le classes
     dans le palier INFÉRIEUR ». La proximité aurait fait MONTER 130 000 jusqu'à
     Legendary (200 000, écart 70 000) plutôt que de le laisser à Very Rare. */
  assert.equal(categorieAffichee(130000), "Very Rare",
    "⛔ 130 000 reste Very Rare — la proximité l'aurait monté à Legendary");
  assert.equal(categorieAffichee(4000), "Rare", "un palier exact s'annonce lui-même");
  assert.equal(categorieAffichee(3999), "Uncommon", "⚔️ un gold de moins, et il descend");
  assert.equal(categorieAffichee(4000000), "Legendary",
    "⚠️ l'étiquette SATURE : le SRD n'a pas de palier au-dessus, et le prix reste juste");
  assert.equal(categorieAffichee(39), null, "⛔ sous le plus bas palier du SRD, aucun mot");
});

test("3 — ⚠️ LA RARETÉ SE COUPE À LA PARENTHÈSE, et c'est vital", () => {
  /* 📏 Mesuré sur la pile : AUCUN des pouvoirs composables ne porte une rareté
     nue — tous s'écrivent « Rare (Requires Attunement) ». Lire `rarity` sans
     couper rendrait `null`, et le prix tomberait à zéro sans lever d'erreur. */
  assert.equal(paliterDeRarete("Rare (Requires Attunement)").valeur, 4000);
  assert.equal(paliterDeRarete("Legendary (Requires Attunement)").valeur, 400000);
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

test("5 — 🔴 HUIT ARMES N'OFFRENT AUCUN POUVOIR, et la rangée doit disparaître", () => {
  /* ⚖️ Eric, à « les faire disparaître, pas les griser ? » : « oui voilà ».
     ⛔ Le compte n'est pas épinglé à 8 : un pouvoir ajouté demain peut en sauver
     une, et ce garde ne doit pas rougir pour ça. Ce qu'il tient, c'est qu'il en
     EXISTE, et que ce sont bien des armes à distance. */
  const vides = armes.filter((v) => pouvoirsDe(v.record, magiques).length === 0);
  assert.ok(vides.length > 0,
    "⛔ si plus aucune arme n'est vide, la règle de la rangée qui disparaît n'a plus de cas — "
    + "elle devient du code mort qu'un lecteur croira encore vivant");
  for (const v of vides) {
    assert.equal(v.record.data.weapon_range, "ranged",
      `⚠️ ${v.record.data.name} est une arme de MÊLÉE sans pouvoir — or \`Any Melee Weapon\` `
      + "devrait toutes les couvrir. Si ce garde rougit, c'est le filtre qui a cassé.");
  }
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

test("8 — ⭐ LA RÈGLE EST « PRODUIT ÷ 40 », et elle est EXACTE, pas approchée", () => {
  /* ⚖️ « ok très bien alors pas de demi crans et basta » — c'est cet abandon qui
     rend la formule exacte partout au lieu de ±8 %. */
  const nu = { data: { cost: "0 GP" } };
  const cas = [
    [["Uncommon", "Uncommon"], 4000, "Rare"],
    [["Uncommon", "Rare"], 40000, "Very Rare"],
    [["Rare", "Rare"], 400000, "Legendary"],
    [["Rare", "Very Rare"], 4000000, "Legendary"],
  ];
  for (const [[a, b], attendu, categorie] of cas) {
    const c = coteDe({ base: nu, bonus: a, pouvoirs: [b] });
    assert.equal(c.magie, attendu, `⛔ ${a} + ${b} = ${a === b ? "" : ""}produit ÷ 40 = ${attendu}`);
    assert.equal(c.magie, PALIERS.find((p) => p.nom === a).valeur
      * PALIERS.find((p) => p.nom === b).valeur / UNITE,
      "⭐ et c'est littéralement le produit des deux prix divisé par l'unité");
    assert.equal(c.categorie, categorie);
  }
});

test("9 — ⚔️ LA LIMITE REFUSE, et elle refuse ce qu'Eric a dessiné", () => {
  /* ⚠️ Le croquis montre `Dagger + Flame Tongue + Vorpal`. Flame Tongue est Rare,
     Vorpal Legendary : 4 000 × 400 000 ÷ 40 = 40 000 000, dix fois la limite.
     ⛔ Le moteur refuse — et c'est la loi d'équilibre, pas un caprice. */
  const nu = { data: { cost: "0 GP" } };
  const c = coteDe({ base: nu, bonus: "Rare", pouvoirs: ["Legendary"] });
  assert.equal(c.legal, false);
  assert.equal(c.raison, "au-dela-de-la-limite");
  assert.ok(c.magie > LIMITE, `${c.magie} dépasse bien ${LIMITE}`);

  const passe = coteDe({ base: nu, bonus: "Uncommon", pouvoirs: ["Legendary"] });
  assert.equal(passe.legal, true, "⭐ mais Uncommon + Legendary tombe PILE sur la limite");
  assert.equal(passe.magie, LIMITE);
});

test("10 — ⚖️ LE TEMPS ET LE JET N'EXISTENT PAS EN PILE SRD", () => {
  /* ⚖️ Eric : « colonne de gauche inutile en SRD car pas de crafting time ».
     ⛔ ABSENTS, pas à zéro : un `0` se lirait « ça ne prend aucun temps », un
     `null` se lit « cette pile ne connaît pas cette règle ». C'est la même loi
     que les cinq gemmes à 10 po — une option absente, jamais grisée. */
  const nu = { data: { cost: "0 GP" } };
  const fh = coteDe({ base: nu, bonus: "Rare", pouvoirs: [], fh: true });
  const srd = coteDe({ base: nu, bonus: "Rare", pouvoirs: [], fh: false });
  assert.ok(fh.temps && fh.dc, "en Fate's Hand, les deux sont donnés");
  assert.equal(srd.temps, null, "⛔ en SRD, ABSENT");
  assert.equal(srd.dc, null);
  assert.equal(srd.craftUnitaire, fh.craftUnitaire, "⭐ et le PRIX, lui, est le même dans les deux piles");
});

/* ══ ④ LA QUANTITÉ ═════════════════════════════════════════════════════════ */

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

test("14 — ⭐ LE SECOND CHOIX NE PROPOSE QUE CE QUI TIENT", () => {
  /* ⛔ CE N'EST PAS UNE RÈGLE ANTI-DOUBLON, c'est la limite de l'échelle : prendre
     Legendary en premier ne laisse que les Uncommon pour le second. */
  const inventaire = ["Uncommon", "Rare", "Very Rare", "Legendary"]
    .map((r) => ({ data: { rarity: `${r} (Requires Attunement)` } }));
  const apresLeg = encorePossibles(["Legendary"], inventaire).map((c) => c.data.rarity);
  assert.deepEqual(apresLeg, ["Uncommon (Requires Attunement)"],
    "⛔ après un Legendary, tout sauf Uncommon dépasse la limite");
  const apresUnc = encorePossibles(["Uncommon"], inventaire);
  assert.equal(apresUnc.length, 4, "⭐ après un Uncommon, les quatre restent ouverts");
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
