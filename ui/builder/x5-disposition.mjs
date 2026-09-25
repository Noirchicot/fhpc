/* ══ X5 — LA TABLE DES COTES — ⛔ GÉNÉRÉ, NE PAS ÉDITER ═══════════════════
   Source : `FH-WEB/FHPC/Plan-ecran-X5/X5_gen.py` (vault), v3 — la fiche BLUEPRINT.
   Une cote change DANS LA TABLE, puis `python3 X5_gen.py`, puis on recopie ce fichier.
   ⚖️ La dictée qui fait foi : Eric, 2026-09-25 (titre Blueprint, quatre rangées de
   menus, l'encart à deux colonnes, la phrase, le jeton cliquable, le pied à trois).
   📏 470 / 500 blg occupés. Vérifié par le générateur : marges, cibles ≥ 44, aucun
   chevauchement, les trois interstices sur une verticale, la bourse centrée entre le
   jeton et le bord droit, le dernier organe sur la hauteur.
   ⭐ v3 (lot 277) : `famille` — `base` (arme, armure), `variante` (wondrous, potions, wand),
   absente = commun. Une fiche ne pose que sa famille et les organes communs. */
export const DALLE = { l: 375, h: 500, y: 60 };
export const MARGE = 4, MARGE_COTE = 14, TOUCH = 44, H_ORGANE = 40;
export const HAUTEUR = 470;   /* ce que les organes occupent vraiment */

/* ⭐ LES POUVOIRS TIENNENT DANS 169,5 — mesuré au lot 259 : 153,5 utiles une fois le
   chevron retiré, 17 des 18 noms d'armes magiques passent. */
export const L_POUVOIR = 169.5, UTILE_POUVOIR = 153.5;

export const ORGANES = [
  { nom: "TITRE", sorte: "zone", x: 14, y: 4, l: 347, h: 24, mot: "Blueprint", cran: "T3/600" },
  { nom: "TYPE", sorte: "dropdown", x: 112.5, y: 34, l: 150, h: 40, cible: { x: 112.5, y: 32, l: 150, h: 44 }, mot: "Armor", cran: "T2/600", famille: "base" },
  { nom: "PLAN", sorte: "dropdown", x: 57.5, y: 34, l: 260, h: 40, cible: { x: 57.5, y: 32, l: 260, h: 44 }, mot: "Ioun Stone", cran: "T2/600", famille: "variante" },
  { nom: "ITEM", sorte: "dropdown", x: 14, y: 82, l: 169.5, h: 40, cible: { x: 14, y: 80, l: 169.5, h: 44 }, mot: "Breastplate", cran: "T2/600", famille: "base" },
  { nom: "BONUS", sorte: "dropdown", x: 191.5, y: 82, l: 169.5, h: 40, cible: { x: 191.5, y: 80, l: 169.5, h: 44 }, mot: "+1", cran: "T2/600", famille: "base" },
  { nom: "VARIANT", sorte: "dropdown", x: 57.5, y: 82, l: 260, h: 40, cible: { x: 57.5, y: 80, l: 260, h: 44 }, mot: "Awareness", cran: "T2/600", famille: "variante" },
  { nom: "POWER 1", sorte: "dropdown", x: 14, y: 130, l: 169.5, h: 40, cible: { x: 14, y: 128, l: 169.5, h: 44 }, mot: "Flame Tongue", cran: "T2/600", famille: "base" },
  { nom: "POWER 2", sorte: "dropdown", x: 191.5, y: 130, l: 169.5, h: 40, cible: { x: 191.5, y: 128, l: 169.5, h: 44 }, mot: "—", cran: "T2/600", famille: "base" },
  { nom: "STATUS", sorte: "dropdown", x: 73.5, y: 178, l: 110, h: 40, cible: { x: 73.5, y: 176, l: 110, h: 44 }, mot: "Crafting", cran: "T1/600" },
  { nom: "QTY", sorte: "dropdown", x: 191.5, y: 178, l: 77, h: 40, cible: { x: 191.5, y: 176, l: 77, h: 44 }, mot: "1", cran: "T1/600" },
  { nom: "ENCART", sorte: "zone", x: 14, y: 228, l: 347, h: 96, mot: "Crafting · Cost | Crafting time · Qty · Total", cran: "T1/400" },
  { nom: "PHRASE", sorte: "zone", x: 14, y: 328, l: 347, h: 28, mot: "The total is taken from the purse when you tap Send.", cran: "T0/400" },
  { nom: "JETON", sorte: "jeton", x: 144, y: 365, l: 87, h: 48, mot: "Breastplate +1", cran: "T1/600" },
  { nom: "PURSE", sorte: "bouton", x: 271, y: 364, l: 50, h: 50, mot: "Purse", cran: "T1/600" },
  { nom: "MONTANT", sorte: "voyant", x: 276, y: 369, l: 40, h: 40, mot: "999 gp", cran: "T1/400", dans: "PURSE" },
  { nom: "CANCEL", sorte: "porte", x: 14, y: 424, l: 77, h: 40, cible: { x: 14, y: 422, l: 77, h: 44 }, mot: "Cancel", cran: "T2/600", role: "retour" },
  { nom: "SEND TO", sorte: "dropdown", x: 112.5, y: 424, l: 150, h: 40, cible: { x: 112.5, y: 422, l: 150, h: 44 }, mot: "Backpack", cran: "T2/600" },
  { nom: "SEND", sorte: "porte", x: 284, y: 424, l: 77, h: 40, cible: { x: 284, y: 422, l: 77, h: 44 }, mot: "Send", cran: "T2/600" },
];

/* ⚖️ L'ENCART : deux colonnes égales, des lignes de 14 blg (T1). */
export const H_LIGNE_ENCART = 14;

/* ⚖️ Eric, 24/09 : la rangée des pouvoirs DISPARAÎT quand la base n'en offre aucun ;
   tout ce qui la suit remonte de sa hauteur. */
export const H_RANGEE = 48;   /* cible + gouttière */
