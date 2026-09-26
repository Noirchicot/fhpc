/* ══ LE BARÈME SRFH — valeur, coût et temps de craft des objets magiques réguliers ══
   ⚖️ Eric, 2026-09-26 : *« ce sera la référence de FH et SRD pour les objets magiques
   réguliers »* — les MÊMES nombres dans les deux jeux. Publié en page de référence
   (artefact « Barème du craft SRFH ») ; la justification vit au vault, dans FH-WEB.

   ⭐ LE SOCLE EST LE SRD 5.2.1, MOT POUR MOT — vérifié dans le PDF officiel :
     · « Magic Item Crafting Time and Cost » (p. 206) : 5 · 10 · 50 · 125 · 250 jours,
       50 · 200 · 2 000 · 20 000 · 100 000 GP ; *« The time and cost are halved for a
       consumable item other than a Spell Scroll »* ;
     · « Magic Item Rarities and Values » : 100 · 400 · 4 000 · 40 000 · 200 000 GP —
       le coût de craft en est toujours exactement la moitié ;
     · « Brewing Potions of Healing » (p. 103) : la potion de base, 1 jour et 25 GP.
   ⭐ LA SEULE RÈGLE SRFH : des DEMI-PALIERS. Common+, Uncommon+, Rare+, Very Rare+ au
   MILIEU ARITHMÉTIQUE EXACT des deux raretés voisines, pour le temps comme pour le prix ;
   Legendary+, qui n'a pas de voisin au-dessus, reprend le pas de Very Rare+ à Legendary
   (Eric, 26/09 : « on peut atteindre legendary+ », puis « oui » à 313 j · 140 000 · 280 000).
   ⭐ LE RANG (lot 279) : les raretés s'ADDITIONNENT pour un objet à plusieurs propriétés
   (« addition de pp comme dans soulforging, sauf qu'on ne parlera de pp que dans le
   soulforging ») — Common 1 … Legendary+ 9 ; Common+ n'a pas de rang.
   ⚖️ LES JOURS NON ENTIERS S'ARRONDISSENT VERS LE HAUT — Eric, 26/09 : *« arrondis les
   jours qui ne tombent pas juste »* ; la convention est celle que le SRD applique
   lui-même au craft (*« round a fraction up to a day »*).
   ⛔ MODULE FEUILLE : aucun import, aucun DOM. Les jours sont gardés EXACTS ici (7,5) et
   arrondis à la sortie, pour qu'un consommable divise le temps vrai et non l'arrondi. */

export const PALIERS_SRFH = Object.freeze([
  { nom: "Common", rang: 1, jours: 5, cout: 50, valeur: 100, srd: true },
  { nom: "Common+", rang: null, jours: 7.5, cout: 125, valeur: 250, srd: false },
  { nom: "Uncommon", rang: 2, jours: 10, cout: 200, valeur: 400, srd: true },
  { nom: "Uncommon+", rang: 3, jours: 30, cout: 1100, valeur: 2200, srd: false },
  { nom: "Rare", rang: 4, jours: 50, cout: 2000, valeur: 4000, srd: true },
  { nom: "Rare+", rang: 5, jours: 87.5, cout: 11000, valeur: 22000, srd: false },
  { nom: "Very Rare", rang: 6, jours: 125, cout: 20000, valeur: 40000, srd: true },
  { nom: "Very Rare+", rang: 7, jours: 187.5, cout: 60000, valeur: 120000, srd: false },
  { nom: "Legendary", rang: 8, jours: 250, cout: 100000, valeur: 200000, srd: true },
  { nom: "Legendary+", rang: 9, jours: 312.5, cout: 140000, valeur: 280000, srd: false },
]);

/** ⚖️ « Brewing Potions of Healing » — la seule règle de craft du SRD qui nomme UN objet.
 *  ⛔ Ce n'est pas une liste d'exceptions déguisée : c'est la règle telle que le SRD
 *  l'écrit, pour cet objet et aucun autre (Greater, Superior, Supreme suivent la table). */
export const BRASSAGE = Object.freeze({ nom: "Potion of Healing", rarete: "Common", jours: 1, cout: 25 });

export const joursArrondis = (j) => Math.ceil(j - 1e-9);

/** La note de craft d'un objet magique fini.
 *  @param rarete   le nom d'un palier (« Rare », « Uncommon+ »…)
 *  @param consommable  temps et coût divisés par deux (SRD)
 *  @param coutBase le prix de la base qu'il incorpore, en GP : on la fabrique pour la
 *                  MOITIÉ de son prix (SRD, « Crafting Nonmagical Items »)
 *  @param nom      le nom de l'objet — pour la seule règle nommée, le brassage
 *  @returns `{ jours, cout, rarete }`, ou `null` si la rareté n'est pas un palier. */
export function noteDeCraft({ rarete, consommable = false, coutBase = 0, nom = "" } = {}) {
  if (String(nom).trim() === BRASSAGE.nom) return { jours: BRASSAGE.jours, cout: BRASSAGE.cout, rarete: BRASSAGE.rarete };
  const p = PALIERS_SRFH.find((x) => x.nom === rarete);
  if (!p) return null;
  const div = consommable ? 2 : 1;
  const base = Number.isFinite(coutBase) && coutBase > 0 ? coutBase / 2 : 0;
  return { jours: joursArrondis(p.jours / div), cout: p.cout / div + base, rarete: p.nom };
}

/** « Crafting: 50 days · 2,001 GP · Rare » — la ligne en italique au pied d'une fiche.
 *  ⭐ L'or s'arrondit à la pièce au-dessus de 1 GP, comme partout dans le craft
 *  (`enPieces`) ; sous 1 GP, en argent. */
export function texteDeLaNote(n) {
  if (!n) return "";
  const jours = `${n.jours} ${n.jours === 1 ? "day" : "days"}`;
  const or = n.cout >= 1 ? `${Math.round(n.cout).toLocaleString("en-US")} GP` : `${Math.round(n.cout * 10)} SP`;
  return `Crafting: ${jours} · ${or} · ${n.rarete}`;
}

/* ══ LOT 285 — LE SCRIBING DES PARCHEMINS : LA TABLE DU SRD, ET RIEN D'AUTRE ══════════
   ⚖️ Eric, 2026-09-26 : *« n'extrapole pas le prix du parchemin par rapport à la rareté,
   garde les prix SRD »*. ⛔ Le parchemin ne passe donc PAS par les paliers ci-dessus : ni
   `noteDeCraft`, ni palier le plus proche, ni demi-palier. Sa rareté (Common … Legendary)
   n'est qu'une ÉTIQUETTE, lue dans la table du record `Spell Scroll` — ⛔ pas ici.
   📏 Un niveau 3 le montre : le SRD dit 5 jours · 150 GP, le palier Uncommon dirait 10 jours
   · 200 GP. Le garde `parchemin` 2 rougit si l'un devient l'autre.
   ⭐ LE SOCLE, MOT POUR MOT — SRD 5.2.1, « Scribing Spell Scrolls » (p. 103), vérifié dans le
   PDF officiel, et recopié par le chapitre Crafting du vault (`0. D&D 5+ Rules/3. Magic &
   Soulforging/Crafting.md`, « Spell Scrolls ») :
     niveau   Cantrip  1   2    3    4      5      6       7       8       9
     temps    1 j      1   3    5    10     25     40      50      60      120
     coût     15 GP    25  100  150  1,000  1,500  10,000  12,500  15,000  50,000
   ⭐ Le parchemin est HORS de la règle du consommable (p. 206 : *« halved for a consumable
   item other than a Spell Scroll »*) : ni ÷ 2 du temps, ni ÷ 2 du coût.
   ⭐ LA VALEUR EST LE DOUBLE DU COÛT — la règle de tout le craft du SRD (le coût est la moitié
   de la valeur), que le chapitre Crafting écrit pour le parchemin : *« A scroll is worth twice
   its scribing cost »*. ⛔ Elle n'est pas écrite dans la table : elle s'en déduit. */
export const SCRIBING_SRD = Object.freeze([
  { niveau: 0, jours: 1, cout: 15 },
  { niveau: 1, jours: 1, cout: 25 },
  { niveau: 2, jours: 3, cout: 100 },
  { niveau: 3, jours: 5, cout: 150 },
  { niveau: 4, jours: 10, cout: 1000 },
  { niveau: 5, jours: 25, cout: 1500 },
  { niveau: 6, jours: 40, cout: 10000 },
  { niveau: 7, jours: 50, cout: 12500 },
  { niveau: 8, jours: 60, cout: 15000 },
  { niveau: 9, jours: 120, cout: 50000 },
].map((l) => Object.freeze(l)));

/** Le scribing d'un niveau de sort : `{ niveau, jours, cout, valeur }`, ou `null`.
 *  ⭐ `valeur` = 2 × `cout`, calculée ici — un seul écrivain. */
export function scribingDuNiveau(niveau) {
  const l = SCRIBING_SRD.find((x) => x.niveau === niveau);
  return l ? { ...l, valeur: 2 * l.cout } : null;
}

/** La note de craft d'un parchemin — la MÊME forme que `noteDeCraft`, pour que
 *  `texteDeLaNote` l'écrive : « Crafting: 5 days · 150 GP · Uncommon ».
 *  @param rarete l'étiquette LUE dans le record (`raretesDuParchemin`) — ⛔ jamais déduite.
 *  ⛔ Un niveau hors table, ou une rareté absente, rend `null` : la note se tait. */
export function noteDeScribing({ niveau, rarete } = {}) {
  const l = scribingDuNiveau(niveau);
  if (!l || typeof rarete !== "string" || !rarete) return null;
  return { jours: l.jours, cout: l.cout, rarete };
}
