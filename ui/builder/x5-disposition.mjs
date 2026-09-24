/* ══ X5 — LA TABLE DES COTES — ⛔ GÉNÉRÉ, NE PAS ÉDITER ═══════════════════
   Source : `FH-WEB/FHPC/Plan-ecran-X5/X5_gen.py` (vault). Une cote change
   DANS LA TABLE, puis `python3 X5_gen.py`, puis on recopie ce fichier.
   ⚖️ Le croquis qui fait foi : `Croquis/2026-09-23-X5-recipe-and-craft.jpg`.
   📏 456 / 500 blg occupés, 44 libres. Vérifié par le générateur : tout
   organe dans les marges, toute cible ≥ 44, le dernier tombe sur la
   hauteur calculée. */
export const DALLE = { l: 375, h: 500, y: 60 };
export const MARGE = 4, MARGE_COTE = 14, TOUCH = 44, H_ORGANE = 40;
export const HAUTEUR = 456;   /* ce que les organes occupent vraiment */

/* ⭐ LES POUVOIRS TIENNENT DANS 169,5 — mesuré au navigateur (600 12px Inter) :
   153,5 utiles une fois le chevron retiré, et 17 des 18 noms d'armes magiques
   passent. ⛔ À trois colonnes (94,3 utiles) cinq d'entre eux débordaient. */
export const L_POUVOIR = 169.5, UTILE_POUVOIR = 153.5;

export const ORGANES = [
  { nom: "TYPE", sorte: "dropdown", x: 14, y: 6, l: 90, h: 40, cible: { x: 14, y: 4, l: 90, h: 44 }, mot: "Weapon", cran: "T2/600" },
  { nom: "ITEM", sorte: "dropdown", x: 112, y: 6, l: 249, h: 40, cible: { x: 112, y: 4, l: 249, h: 44 }, mot: "Dagger", cran: "T2/600" },
  { nom: "BONUS", sorte: "dropdown", x: 14, y: 54, l: 169.5, h: 40, cible: { x: 14, y: 52, l: 169.5, h: 44 }, mot: "+1", cran: "T2/600" },
  { nom: "POWER 1", sorte: "dropdown", x: 14, y: 102, l: 169.5, h: 40, cible: { x: 14, y: 100, l: 169.5, h: 44 }, mot: "Flame Tongue", cran: "T2/600" },
  { nom: "POWER 2", sorte: "dropdown", x: 191.5, y: 102, l: 169.5, h: 40, cible: { x: 191.5, y: 100, l: 169.5, h: 44 }, mot: "Vorpal", cran: "T2/600" },
  { nom: "FILET", sorte: "zone", x: 73, y: 148, l: 229, h: 8, cran: "T1/600" },
  { nom: "STATUS", sorte: "dropdown", x: 112.5, y: 162, l: 150, h: 40, cible: { x: 112.5, y: 160, l: 150, h: 44 }, mot: "Crafting", cran: "T2/600" },
  { nom: "PANNEAU", sorte: "zone", x: 14, y: 208, l: 347, h: 136, mot: "Prerequisites · costs", cran: "T1/400", partageAvec: "JETON" },
  { nom: "FILET", sorte: "zone", x: 73, y: 348, l: 229, h: 8, cran: "T1/600" },
  { nom: "SEND TO", sorte: "dropdown", x: 112.5, y: 362, l: 150, h: 40, cible: { x: 112.5, y: 360, l: 150, h: 44 }, mot: "Backpack", cran: "T2/600" },
  { nom: "CANCEL", sorte: "porte", x: 106.5, y: 410, l: 77, h: 40, cible: { x: 106.5, y: 408, l: 77, h: 44 }, mot: "Cancel", cran: "T2/600", role: "retour" },
  { nom: "SEND", sorte: "porte", x: 191.5, y: 410, l: 77, h: 40, cible: { x: 191.5, y: 408, l: 77, h: 44 }, mot: "Send", cran: "T2/600" },
];

/* ⚖️ LE PANNEAU A DEUX RÉGIMES : sa colonne gauche (temps, DC, ROLL) n'existe
   qu'en pile Fate's Hand — ⛔ en SRD elle est ABSENTE, pas grisée. */
export const LIGNES_ARGENT = ["BASE ITEM COST", "CRAFTING COST", "UNIT PRICE", "QTY · TOTAL"];
export const H_LIGNE_ARGENT = 24, H_PREREQ = 20;

/* ⚖️ Eric, 24/09 : la rangée des pouvoirs DISPARAÎT quand la base n'en offre
   aucun — huit armes sont dans ce cas. Elle rend alors ses 48 blg. */
export const H_RANGEE = 48;   /* cible + gouttière */
