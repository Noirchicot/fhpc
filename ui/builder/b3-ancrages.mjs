/* ══ LES ANCRAGES DU DRESSING (B3) — LA DÉCLARATION UNIQUE ═══════════════════
   🔴 CES DIX COORDONNÉES SONT CELLES D'ERIC, POSÉES À LA MAIN le 2026-08-24 sur
   le banc `ecran-b3.html`. ⛔ Elles ne se recalculent pas, ne s'ajustent pas à
   l'œil et ne se dupliquent nulle part : le banc les lit, l'écran les lira, le
   test les éprouve. Une cote écrite deux fois diverge au premier réglage — la
   nuit du 23 au 24/08 l'a montré quatre fois.

   ⭐ POURQUOI UN REPÈRE ET PAS DES PIXELS. Eric : *« je veux que tout soit placé
   au pixel près sur ce B3 et que rien ne bouge d'un écran à l'autre »*. Trois
   cotes justes, posées en pixels, sont mortes cette nuit-là (`--roue-pas` réglé
   à l'iPad et tombé à 73,8 au téléphone · `--roue-fondu` figé pendant que le
   cran rétrécissait · `--fiche-h`, cote de catalogue posée sur un FF). Un pixel
   n'est pas une adresse portable ; un point dans un repère l'est.

   ⛔ ET LE REPÈRE N'EST PAS DÉCORATIF : le corps, les ancrages et les traits
   vivent dans le MÊME `viewBox`, donc rien ne peut dériver par rapport à rien.
   Deux repères = deux vérités, et 2,5 px d'écart visibles (le tambour et la
   grille de l'écran R, mesuré le 23/08).
   ══════════════════════════════════════════════════════════════════════════ */

/** Le repère. ⛔ Ces deux nombres sont les seuls qui puissent changer sans que
 *  rien d'autre bouge : les ancrages sont exprimés DEDANS, donc ils suivent. */
export const REPERE = { largeur: 1000, hauteur: 1600 };

/** Les deux corps, calés sur leur ENCRE et non sur leur fichier.
 *  📏 Mesuré : le monsieur fait 918 px d'encre, la dame 866, dans des fichiers
 *  de taille IDENTIQUE (422 × 1045). Posés sur la taille du fichier, la dame
 *  aurait été 6 % plus petite et les ancrages seraient tombés à côté sur l'un
 *  des deux. Les largeurs diffèrent — c'est l'anatomie, pas un défaut. */
export const CORPS = {
  monsieur: { image: "pantin-h.png", x: 280, y: 100, largeur: 441, hauteur: 1400 },
  dame:     { image: "pantin-f.png", x: 305, y: 100, largeur: 390, hauteur: 1400 }
};

/** ⭐ LA ZONE COMMUNE — l'intersection des deux corps, calculée pixel à pixel
 *  une fois les deux mis à la même hauteur. 78 % du monsieur, 90 % de la dame.
 *  Un ancrage posé dedans tient sur les deux PAR CONSTRUCTION : c'est la
 *  différence entre « ça a l'air de tomber juste » et « ça ne peut pas tomber
 *  faux ». Le fichier de segments sert au garde. */
export const ZONE_COMMUNE = "./assets/b3-zone-commune.json";

/** LES DIX EMPLACEMENTS — les comptes viennent du vault (`FHPCv2 rangement
 *  equipement`, § « Les 10 emplacements », 77/77), correction du 23/08 comprise :
 *  le bouclier est aux MAINS, donc torse 17 et mains 43.
 *
 *  ⚠️ TROIS ANCRAGES SONT SERRÉS, ET ERIC LE SAIT — il a choisi de les garder
 *  ainsi le 24/08 (*« fige, tu m'as pas encore convaincu mais go »*). Marges
 *  mesurées au bord de la zone commune :
 *      dos 146 · torse 144 · taille 110 · tête 48 · cou 39 · yeux 37 · pieds 36
 *      avant-bras 13 · mains 7 · doigts 0   ← sur le bord même
 *  ⭐ CE N'EST PAS UNE ERREUR DE SA PART, c'est l'anatomie : à cette hauteur, la
 *  fenêtre où les DEUX corps ont un bras ne fait que 16 à 20 unités. Il a visé
 *  au plus juste dans ce qui existait.
 *  ⛔ MAIS ÇA N'A AUCUNE TOLÉRANCE : changer une silhouette peut faire sortir
 *  `doigts` de la zone. D'où le garde `tests/b3-ancrages.test.mjs`, qui le dira
 *  au lieu de laisser l'écran mentir. ⏳ La parade, si le garde rougit un jour :
 *  ramener ces trois-là au bord du TORSE, à la même hauteur — la tolérance passe
 *  de 0 à 110-145 unités, et le trait part du même niveau. */
export const ANCRAGES = [
  { clef: "tete",      nom: "Tête",       n: 8,  x: 496, y: 125 },
  { clef: "yeux",      nom: "Yeux",       n: 4,  x: 525, y: 182 },
  { clef: "cou",       nom: "Cou",        n: 13, x: 500, y: 297 },
  { clef: "dos",       nom: "Dos",        n: 10, x: 501, y: 392 },
  { clef: "torse",     nom: "Torse",      n: 17, x: 503, y: 447 },
  { clef: "taille",    nom: "Taille",     n: 2,  x: 499, y: 664 },
  { clef: "avantbras", nom: "Avant-bras", n: 2,  x: 665, y: 653 },
  { clef: "mains",     nom: "Mains",      n: 43, x: 316, y: 796 },
  { clef: "doigts",    nom: "Doigts",     n: 22, x: 669, y: 840 },
  { clef: "pieds",     nom: "Pieds",      n: 7,  x: 612, y: 1448 }
];
