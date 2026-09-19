/* ═══ ÉCRAN SB3.1 (le sac) — la disposition, en blg. Généré depuis backpack_cotes.json. ═══
   ⛔ Un blg = un px de feuille de style UNE FOIS `zoom: var(--echelle)` appliqué sur `.app`.
   ⛔ DESSIN et CIBLE sont DEUX cotes : le dessin rétrécit, la cible ne descend jamais sous --touch.
   ⛔ Aucune de ces valeurs ne se ré-invente : elles viennent de tokens.css ou d'une cote dictée. */

export const DALLE = { l: 375, h: 500 };
export const MARGE = 4;
export const TOUCH = 44;
export const JETON = { l: 87, h: 48 };

/* ⚖️ LA RÈGLE D'ERIC (18/09) : « il faut que le T0 des petites tuiles remplissent idem que le T1
   de la grande tuile » — donc W/D = T0/T1 = 0,8 — et « la proportionnalité en largeur prime, on a
   amplement la place en hauteur ». La marge intérieure s'écrit en POUR-CENT : deux nombres fixes
   deviendraient faux au premier ajustement. */
export const ROUE = { piste: 331, budget: 299, dominant: 71, secondaire: 57, margePct: 0.075,
                      tuile: 57, pas: 65, loupe: 1.2456, loupeX: 152.0,
                      hauteur: 32.11, hauteurDominante: 40 };

/* les trois colonnes et les cinq rangées de la grille — la grille de R au blg près */
/* 🎯 LA BANDE QUI DEFILE — une dalle de douze jetons par section, et elles glissent
   ensemble sous la roue. ⛔ Ses bords ne s inventent pas : la grille, plus 8 au-dessus du
   premier jeton et 8 sous le dernier (croquis d Eric, 19/09). */
export const DALLES = { x: 0, y: 104, l: 375, h: 232, jour: 52.63 };

export const COLONNES = [49, 144, 239];
export const RANGEES = [112, 168, 224, 280];

/* ✏️ LE MODE EDIT — et il n'y en a plus qu'UN (Eric, 2026-09-20). Le mode déplacement,
   qui s'ouvrait par un maintien de 1,5 s, a disparu : les deux flèches bleues font son
   travail. ⭐ ET LE PANNEAU COUVRE TOUT CE QUI EST SOUS LE SÉLECTEUR — *« on recouvre toute
   la section sous le sélecteur »* : ses deux bornes SONT celles des organes qu'il
   recouvre, de la rangée d'outils au bas de la plaque. */
export const EDITION = { notice: { x: 0, y: 44, l: 375, h: 456 } };

export const ORGANES = [
  { nom: "ROUE",        sorte: "roue",     x:     22, y:      4, l:    331, h:    40, cible: { x: 22, y: 2, l: 331, h: 44 }, cran: "T1/600" },
  { nom: "LOUPE",       sorte: "loupe",    x:    152, y:      4, l:     71, h:    40, dans: "ROUE", mot: "Potions", cran: "T1/600", dominant: true },
  { nom: "EDITER",      sorte: "bouton",   x:  153.5, y:      7, l:     30, h:    30, cible: { x: 146.5, y: 0, l: 44, h: 44 }, dans: "NOTICE", mot: "/", cran: "T3/600" },
  { nom: "EFFACER",     sorte: "bouton",   x:  191.5, y:      7, l:     30, h:    30, cible: { x: 184.5, y: 0, l: 44, h: 44 }, dans: "NOTICE", mot: "×", cran: "T3/600" },
  { nom: "RECULER",     sorte: "bouton",   x:  153.5, y:     45, l:     30, h:    30, cible: { x: 146.5, y: 38, l: 44, h: 44 }, dans: "NOTICE", mot: "←", cran: "T3/600" },
  { nom: "AVANCER",     sorte: "bouton",   x:  191.5, y:     45, l:     30, h:    30, cible: { x: 184.5, y: 38, l: 44, h: 44 }, dans: "NOTICE", mot: "→", cran: "T3/600" },
  { nom: "ENCART",      sorte: "bande",    x:      4, y:     83, l:    367, h:   369, dans: "NOTICE", mot: "les explications detaillees" },
  { nom: "AJOUT SAC",   sorte: "bouton",   x:   58.5, y:      0, l:     87, h:    44, cible: { x: 58.5, y: 0, l: 87, h: 44 }, dans: "NOTICE", mot: "+ Storage", cran: "T0/600" },
  { nom: "AJOUT DEHORS", sorte: "bouton",   x:  229.5, y:      0, l:     87, h:    44, cible: { x: 229.5, y: 0, l: 87, h: 44 }, dans: "NOTICE", mot: "+ Storage", cran: "T0/600" },
  { nom: "TUNER G",     sorte: "tuner",    x:      4, y:     14, l:     10, h:    20, cible: { x: 0, y: 2, l: 44, h: 44 }, dans: "ROUE" },
  { nom: "TUNER D",     sorte: "tuner",    x:    361, y:     14, l:     10, h:    20, cible: { x: 331, y: 2, l: 44, h: 44 }, dans: "ROUE" },
  { nom: "TRIER",       sorte: "bouton",   x:      8, y:     52, l:     40, h:    40, cible: { x: 6, y: 50, l: 44, h: 44 }, mot: "Sort", cran: "T0/600" },
  { nom: "TASSER",      sorte: "bouton",   x:    327, y:     52, l:     40, h:    40, cible: { x: 325, y: 50, l: 44, h: 44 }, mot: "sections", cran: "T0/600" },
  { nom: "POIDS TOTAL", sorte: "voyant",   x:     56, y:     60, l:    263, h:    14, mot: "Encumbrance : 46,5", cran: "T2/600" },
  { nom: "POIDS DETAIL", sorte: "voyant",   x:     56, y:     74, l:    263, h:    22, mot: "Gear 34,5   Backpack 12   Other 61", cran: "T1/400" },
  { nom: "DALLES",      sorte: "bande",    x:      0, y:    104, l:    375, h:   232, mot: "une dalle par section" },
  { nom: "CASE 1.1",    sorte: "jeton",    x:     49, y:    112, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 1.2",    sorte: "jeton",    x:    144, y:    112, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 1.3",    sorte: "jeton",    x:    239, y:    112, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 2.1",    sorte: "jeton",    x:     49, y:    168, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 2.2",    sorte: "jeton",    x:    144, y:    168, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 2.3",    sorte: "jeton",    x:    239, y:    168, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 3.1",    sorte: "jeton",    x:     49, y:    224, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 3.2",    sorte: "jeton",    x:    144, y:    224, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 3.3",    sorte: "jeton",    x:    239, y:    224, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 4.1",    sorte: "jeton",    x:     49, y:    280, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 4.2",    sorte: "jeton",    x:    144, y:    280, l:     87, h:    48, dans: "DALLES" },
  { nom: "CASE 4.3",    sorte: "jeton",    x:    239, y:    280, l:     87, h:    48, dans: "DALLES" },
  { nom: "NOTICE",      sorte: "bande",    x:      0, y:     44, l:    375, h:   456, mot: "le panneau du mode edit" },
  { nom: "lune Wares",  sorte: "lune",     x:      4, y:    161, l:     30, h:    30, cible: { x: 0, y: 154, l: 44, h: 44 }, mot: "Wares", creation: false },
  { nom: "lune Gear",   sorte: "lune",     x:      4, y:    205, l:     30, h:    30, cible: { x: 0, y: 198, l: 44, h: 44 }, mot: "Gear", creation: false },
  { nom: "lune Craft",  sorte: "lune",     x:      4, y:    249, l:     30, h:    30, cible: { x: 0, y: 242, l: 44, h: 44 }, mot: "Craft", creation: false },
  { nom: "COLLECTEUR",  sorte: "collecteur", x:    144, y:    348, l:     87, h:    48, cible: { x: 144, y: 348, l: 87, h: 48 }, mot: "SEND COLLECTOR", cran: "T1/600" },
  { nom: "PURSE",       sorte: "bouton",   x:    276, y:    345, l:     50, h:    50, cible: { x: 276, y: 345, l: 50, h: 50 }, mot: "Purse", cran: "T1/600" },
  { nom: "PARTY TALLY", sorte: "bouton",   x:     32, y:    350, l:     40, h:    40, cible: { x: 30, y: 348, l: 44, h: 44 }, mot: "Party Tally", cran: "T1/600" },
  { nom: "TALLY",       sorte: "bouton",   x:     80, y:    350, l:     40, h:    40, cible: { x: 78, y: 348, l: 44, h: 44 }, mot: "Tally", cran: "T1/600" },
  { nom: "SEND VERS",   sorte: "dropdown", x:  139.5, y:    404, l:     96, h:    40, cible: { x: 139.5, y: 402, l: 96, h: 44 }, mot: "Send to — Backpack", cran: "T1/600" },
  { nom: "RANGEE",      sorte: "rangee",   x:      4, y:    448, l:    367, h:    44, cran: "—" },
  { nom: "livre",       sorte: "rond",     x:     15, y:    459, l:     22, h:    22, cible: { x: 4, y: 448, l: 44, h: 44 }, mot: "livre" },
  { nom: "GEAR",        sorte: "porte",    x:     64, y:    448, l:     77, h:    44, cible: { x: 64, y: 448, l: 77, h: 44 }, mot: "Gear", cran: "T2/600" },
  { nom: "SEND",        sorte: "porte",    x:    149, y:    448, l:     77, h:    44, cible: { x: 149, y: 448, l: 77, h: 44 }, mot: "Send", cran: "T2/600" },
  { nom: "WARES",       sorte: "porte",    x:    234, y:    448, l:     77, h:    44, cible: { x: 234, y: 448, l: 77, h: 44 }, mot: "Wares", cran: "T2/600" },
  { nom: "?",           sorte: "rond",     x:    338, y:    459, l:     22, h:    22, cible: { x: 327, y: 448, l: 44, h: 44 }, mot: "?" },
];

/* 🎒 LE SAC EN FILIGRANE — Eric, 2026-09-20 : *« comme avec le bonhomme dans Gear, en fond
   transparent derrière »*. ⭐ MÊME RÔLE ET MÊME PLACE QUE LE PANTIN DE R : une image qu'on ne
   tape pas, derrière la grille, et dont la cote vit AU PLAN.
   ⛔ AUCUN DE CES NOMBRES N'EST TAPÉ : la hauteur est celle de la grille plus un débord égal
   en haut et en bas, la largeur suit le RAPPORT MESURÉ de l'image détourée, et l'abscisse
   centre le tout sur la dalle. Une rangée qui bouge emmène le fond avec elle. */
export const FOND = { image: "sac-fond.webp", x: 90.48, y: 106, l: 194.03, h: 228, rapport: 0.851 };
