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
export const ROUE = { piste: 331, budget: 299, dominant: 71, secondaire: 57, margePct: 0.075 };

/* les trois colonnes et les cinq rangées de la grille — la grille de R au blg près */
export const COLONNES = [49, 144, 239];
export const RANGEES = [104, 160, 216, 272];

export const ORGANES = [
  { nom: "ROUE",        sorte: "roue",     x:     22, y:      4, l:    331, h:    40, cible: { x: 22, y: 2, l: 331, h: 44 }, cran: "T1/600" },
  { nom: "CRAN 1",      sorte: "cran",     x:     22, y:      4, l:     57, h:    40, dans: "ROUE", mot: "Section 1", cran: "T0/600" },
  { nom: "CRAN 2",      sorte: "cran",     x:     87, y:      4, l:     57, h:    40, dans: "ROUE", mot: "Section 2", cran: "T0/600" },
  { nom: "CRAN 3",      sorte: "cran",     x:    152, y:      4, l:     71, h:    40, dans: "ROUE", mot: "Potions", cran: "T1/600", dominant: true },
  { nom: "CRAN 4",      sorte: "cran",     x:    231, y:      4, l:     57, h:    40, dans: "ROUE", mot: "Section 4", cran: "T0/600" },
  { nom: "CRAN 5",      sorte: "cran",     x:    296, y:      4, l:     57, h:    40, dans: "ROUE", mot: "Section 5", cran: "T0/600" },
  { nom: "EFFACER",     sorte: "bouton",   x:    132, y:      4, l:     40, h:    40, cible: { x: 130, y: 2, l: 44, h: 44 }, mot: "×", cran: "T3/600" },
  { nom: "EDITER",      sorte: "bouton",   x:    203, y:      4, l:     40, h:    40, cible: { x: 201, y: 2, l: 44, h: 44 }, mot: "/", cran: "T3/600" },
  { nom: "TUNER G",     sorte: "tuner",    x:      4, y:     14, l:     10, h:    20, cible: { x: 0, y: 2, l: 44, h: 44 }, dans: "ROUE" },
  { nom: "TUNER D",     sorte: "tuner",    x:    361, y:     14, l:     10, h:    20, cible: { x: 331, y: 2, l: 44, h: 44 }, dans: "ROUE" },
  { nom: "TRIER",       sorte: "bouton",   x:      4, y:     52, l:     40, h:    40, cible: { x: 2, y: 50, l: 44, h: 44 }, mot: "Sort", cran: "T0/600" },
  { nom: "TASSER",      sorte: "bouton",   x:    331, y:     52, l:     40, h:    40, cible: { x: 329, y: 50, l: 44, h: 44 }, mot: "sections", cran: "T0/600" },
  { nom: "POIDS TOTAL", sorte: "voyant",   x:     52, y:     61, l:    271, h:    14, mot: "Encumbrance (Gear + Backpack) 46,5", cran: "T2/600" },
  { nom: "COMPTE",      sorte: "voyant",   x:     52, y:     75, l:     44, h:    12, mot: "23 items", cran: "T0/400" },
  { nom: "POIDS DETAIL", sorte: "voyant",   x:     96, y:     75, l:    203, h:    12, mot: "Gear 34,5   Backpack 12   Other 61", cran: "T1/400" },
  { nom: "PAGE",        sorte: "voyant",   x:    299, y:     75, l:     24, h:    12, mot: "1/2", cran: "T0/400" },
  { nom: "CASE 1.1",    sorte: "jeton",    x:     49, y:    104, l:     87, h:    48 },
  { nom: "CASE 1.2",    sorte: "jeton",    x:    144, y:    104, l:     87, h:    48 },
  { nom: "CASE 1.3",    sorte: "jeton",    x:    239, y:    104, l:     87, h:    48 },
  { nom: "CASE 2.1",    sorte: "jeton",    x:     49, y:    160, l:     87, h:    48 },
  { nom: "CASE 2.2",    sorte: "jeton",    x:    144, y:    160, l:     87, h:    48 },
  { nom: "CASE 2.3",    sorte: "jeton",    x:    239, y:    160, l:     87, h:    48 },
  { nom: "CASE 3.1",    sorte: "jeton",    x:     49, y:    216, l:     87, h:    48 },
  { nom: "CASE 3.2",    sorte: "jeton",    x:    144, y:    216, l:     87, h:    48 },
  { nom: "CASE 3.3",    sorte: "jeton",    x:    239, y:    216, l:     87, h:    48 },
  { nom: "CASE 4.1",    sorte: "jeton",    x:     49, y:    272, l:     87, h:    48 },
  { nom: "CASE 4.2",    sorte: "jeton",    x:    144, y:    272, l:     87, h:    48 },
  { nom: "CASE 4.3",    sorte: "jeton",    x:    239, y:    272, l:     87, h:    48 },
  { nom: "lune Wares",  sorte: "lune",     x:      4, y:    153, l:     30, h:    30, cible: { x: 0, y: 146, l: 44, h: 44 }, mot: "Wares", creation: false },
  { nom: "lune Gear",   sorte: "lune",     x:      4, y:    197, l:     30, h:    30, cible: { x: 0, y: 190, l: 44, h: 44 }, mot: "Gear", creation: false },
  { nom: "lune Craft",  sorte: "lune",     x:      4, y:    241, l:     30, h:    30, cible: { x: 0, y: 234, l: 44, h: 44 }, mot: "Craft", creation: false },
  { nom: "COLLECTEUR",  sorte: "collecteur", x:    144, y:    348, l:     87, h:    48, cible: { x: 144, y: 348, l: 87, h: 48 }, mot: "SEND COLLECTOR", cran: "T1/600" },
  { nom: "PURSE",       sorte: "bouton",   x:    276, y:    341, l:     50, h:    50, cible: { x: 276, y: 341, l: 50, h: 50 }, mot: "Purse", cran: "T1/600" },
  { nom: "PARTY TALLY", sorte: "bouton",   x:     32, y:    346, l:     40, h:    40, cible: { x: 30, y: 344, l: 44, h: 44 }, mot: "Party Tally", cran: "T1/600" },
  { nom: "TALLY",       sorte: "bouton",   x:     80, y:    346, l:     40, h:    40, cible: { x: 78, y: 344, l: 44, h: 44 }, mot: "Tally", cran: "T1/600" },
  { nom: "DROP",        sorte: "bouton",   x:     49, y:    402, l:     77, h:    44, cible: { x: 49, y: 402, l: 77, h: 44 }, mot: "Drop", cran: "T2/600" },
  { nom: "SEND VERS",   sorte: "dropdown", x:    134, y:    404, l:    192, h:    40, cible: { x: 134, y: 402, l: 192, h: 44 }, mot: "Send to — Backpack", cran: "T1/600" },
  { nom: "RANGEE",      sorte: "rangee",   x:      4, y:    448, l:    367, h:    44, cran: "—" },
  { nom: "livre",       sorte: "rond",     x:     15, y:    459, l:     22, h:    22, cible: { x: 4, y: 448, l: 44, h: 44 }, mot: "livre" },
  { nom: "GEAR",        sorte: "porte",    x:     64, y:    448, l:     77, h:    44, cible: { x: 64, y: 448, l: 77, h: 44 }, mot: "Gear", cran: "T2/600" },
  { nom: "SEND",        sorte: "porte",    x:    149, y:    448, l:     77, h:    44, cible: { x: 149, y: 448, l: 77, h: 44 }, mot: "Send", cran: "T2/600" },
  { nom: "WARES",       sorte: "porte",    x:    234, y:    448, l:     77, h:    44, cible: { x: 234, y: 448, l: 77, h: 44 }, mot: "Wares", cran: "T2/600" },
  { nom: "?",           sorte: "rond",     x:    338, y:    459, l:     22, h:    22, cible: { x: 327, y: 448, l: 44, h: 44 }, mot: "?" },
];
