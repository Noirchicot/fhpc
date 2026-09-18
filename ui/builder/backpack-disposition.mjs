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
export const ROUE = { piste: 311, budget: 279, dominant: 67, secondaire: 53, margePct: 0.075 };

/* les trois colonnes et les cinq rangées de la grille — la grille de R au blg près */
export const COLONNES = [49, 144, 239];
export const RANGEES = [100, 156, 212, 268];

export const ORGANES = [
  { nom: "ROUE",        sorte: "roue",     x:     32, y:      4, l:    311, h:    40, cible: { x: 32, y: 2, l: 311, h: 44 }, cran: "T1/600" },
  { nom: "CRAN 1",      sorte: "cran",     x:     32, y:      6, l:     53, h:    36, dans: "ROUE", mot: "Section 1", cran: "T0/600" },
  { nom: "CRAN 2",      sorte: "cran",     x:     93, y:      6, l:     53, h:    36, dans: "ROUE", mot: "Section 2", cran: "T0/600" },
  { nom: "CRAN 3",      sorte: "cran",     x:    154, y:      4, l:     67, h:    40, dans: "ROUE", mot: "Potions", cran: "T1/600", dominant: true },
  { nom: "CRAN 4",      sorte: "cran",     x:    229, y:      6, l:     53, h:    36, dans: "ROUE", mot: "Section 4", cran: "T0/600" },
  { nom: "CRAN 5",      sorte: "cran",     x:    290, y:      6, l:     53, h:    36, dans: "ROUE", mot: "Section 5", cran: "T0/600" },
  { nom: "TUNER G",     sorte: "tuner",    x:      4, y:     14, l:     20, h:    20, cible: { x: -8, y: 2, l: 44, h: 44 }, dans: "ROUE" },
  { nom: "TUNER D",     sorte: "tuner",    x:    351, y:     14, l:     20, h:    20, cible: { x: 339, y: 2, l: 44, h: 44 }, dans: "ROUE" },
  { nom: "TRIER",       sorte: "bouton",   x:      4, y:     52, l:     40, h:    40, cible: { x: 2, y: 50, l: 44, h: 44 }, mot: "Sort", cran: "T1/600" },
  { nom: "TASSER",      sorte: "bouton",   x:    331, y:     52, l:     40, h:    40, cible: { x: 329, y: 50, l: 44, h: 44 }, mot: "Sections", cran: "T1/600" },
  { nom: "POIDS 1",     sorte: "voyant",   x:     52, y:     56, l:    271, h:    10, mot: "Gear — 12 obj. · 34,5 lb", cran: "T0/400" },
  { nom: "POIDS 2",     sorte: "voyant",   x:     52, y:     67, l:    271, h:    10, mot: "Backpack — 8 obj. · 12 lb", cran: "T0/400" },
  { nom: "POIDS 3",     sorte: "voyant",   x:     52, y:     78, l:    271, h:    10, mot: "Encumbrance — 20 obj. · 46,5 lb", cran: "T0/600" },
  { nom: "CASE 1.1",    sorte: "jeton",    x:     49, y:    100, l:     87, h:    48 },
  { nom: "CASE 1.2",    sorte: "jeton",    x:    144, y:    100, l:     87, h:    48 },
  { nom: "CASE 1.3",    sorte: "jeton",    x:    239, y:    100, l:     87, h:    48 },
  { nom: "CASE 2.1",    sorte: "jeton",    x:     49, y:    156, l:     87, h:    48 },
  { nom: "CASE 2.2",    sorte: "jeton",    x:    144, y:    156, l:     87, h:    48 },
  { nom: "CASE 2.3",    sorte: "jeton",    x:    239, y:    156, l:     87, h:    48 },
  { nom: "CASE 3.1",    sorte: "jeton",    x:     49, y:    212, l:     87, h:    48 },
  { nom: "CASE 3.2",    sorte: "jeton",    x:    144, y:    212, l:     87, h:    48 },
  { nom: "CASE 3.3",    sorte: "jeton",    x:    239, y:    212, l:     87, h:    48 },
  { nom: "CASE 4.1",    sorte: "jeton",    x:     49, y:    268, l:     87, h:    48 },
  { nom: "CASE 4.2",    sorte: "jeton",    x:    144, y:    268, l:     87, h:    48 },
  { nom: "CASE 4.3",    sorte: "jeton",    x:    239, y:    268, l:     87, h:    48 },
  { nom: "lune Wares",  sorte: "lune",     x:      4, y:    149, l:     30, h:    30, cible: { x: 0, y: 142, l: 44, h: 44 }, mot: "Wares" },
  { nom: "lune Gear",   sorte: "lune",     x:      4, y:    193, l:     30, h:    30, cible: { x: 0, y: 186, l: 44, h: 44 }, mot: "Gear" },
  { nom: "lune Craft",  sorte: "lune",     x:      4, y:    237, l:     30, h:    30, cible: { x: 0, y: 230, l: 44, h: 44 }, mot: "Craft" },
  { nom: "COLLECTEUR",  sorte: "collecteur", x:    144, y:    348, l:     87, h:    48, cible: { x: 144, y: 348, l: 87, h: 48 }, mot: "SEND COLLECTOR", cran: "T1/600" },
  { nom: "PURSE",       sorte: "bouton",   x:    276, y:    335, l:     50, h:    50, cible: { x: 276, y: 335, l: 50, h: 50 }, mot: "Purse", cran: "T1/600" },
  { nom: "PARTY TALLY", sorte: "bouton",   x:     49, y:    340, l:     40, h:    40, cible: { x: 47, y: 338, l: 44, h: 44 }, mot: "Party Tally", cran: "T1/600" },
  { nom: "TALLY",       sorte: "bouton",   x:     93, y:    340, l:     40, h:    40, cible: { x: 91, y: 338, l: 44, h: 44 }, mot: "Tally", cran: "T1/600" },
  { nom: "SEND VERS",   sorte: "dropdown", x:     49, y:    404, l:    277, h:    40, cible: { x: 49, y: 402, l: 277, h: 44 }, mot: "Send to — Backpack", cran: "T1/600" },
  { nom: "GEAR",        sorte: "porte",    x:     22, y:    452, l:    105, h:    40, cible: { x: 22, y: 450, l: 105, h: 44 }, mot: "Gear", cran: "T1/600" },
  { nom: "SEND",        sorte: "porte",    x:    135, y:    452, l:    105, h:    40, cible: { x: 135, y: 450, l: 105, h: 44 }, mot: "Send", cran: "T1/600" },
  { nom: "WARES",       sorte: "porte",    x:    248, y:    452, l:    105, h:    40, cible: { x: 248, y: 450, l: 105, h: 44 }, mot: "Wares", cran: "T1/600" },
];
