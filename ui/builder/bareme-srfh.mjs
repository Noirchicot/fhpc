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
   ⭐ LA SEULE RÈGLE SRFH : quatre DEMI-PALIERS (Common+, Uncommon+, Rare+, Very Rare+),
   au MILIEU ARITHMÉTIQUE EXACT des deux raretés voisines, pour le temps comme pour le
   prix. ⛔ Pas de Legendary+ : le SRD n'a aucun palier chiffré au-dessus (Artifact est
   « Priceless »).
   ⚖️ LES JOURS NON ENTIERS S'ARRONDISSENT VERS LE HAUT — Eric, 26/09 : *« arrondis les
   jours qui ne tombent pas juste »* ; la convention est celle que le SRD applique
   lui-même au craft (*« round a fraction up to a day »*).
   ⛔ MODULE FEUILLE : aucun import, aucun DOM. Les jours sont gardés EXACTS ici (7,5) et
   arrondis à la sortie, pour qu'un consommable divise le temps vrai et non l'arrondi. */

export const PALIERS_SRFH = Object.freeze([
  { nom: "Common", jours: 5, cout: 50, valeur: 100, srd: true },
  { nom: "Common+", jours: 7.5, cout: 125, valeur: 250, srd: false },
  { nom: "Uncommon", jours: 10, cout: 200, valeur: 400, srd: true },
  { nom: "Uncommon+", jours: 30, cout: 1100, valeur: 2200, srd: false },
  { nom: "Rare", jours: 50, cout: 2000, valeur: 4000, srd: true },
  { nom: "Rare+", jours: 87.5, cout: 11000, valeur: 22000, srd: false },
  { nom: "Very Rare", jours: 125, cout: 20000, valeur: 40000, srd: true },
  { nom: "Very Rare+", jours: 187.5, cout: 60000, valeur: 120000, srd: false },
  { nom: "Legendary", jours: 250, cout: 100000, valeur: 200000, srd: true },
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
