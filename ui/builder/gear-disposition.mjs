/* ═══ ÉCRAN R (Gear) — la disposition, en blg. Généré depuis R_cotes.json. ═══
   ⛔ Un blg = un px de feuille de style UNE FOIS `zoom: var(--echelle)` appliqué sur `.app`.
   ⛔ DESSIN et CIBLE sont DEUX cotes : le dessin rétrécit, la cible ne descend jamais sous --touch.
   ⛔ Aucune de ces valeurs ne se ré-invente : elles viennent de tokens.css ou d'une cote donnée. */

export const DALLE  = { l: 375, h: 560 };   /* la dalle utile, belt compris */
export const BELT_H = 60;                    /* le rail, en haut, pleine largeur */
export const MARGE  = 4;                     /* rien ne s'approche à moins de 4 d'un bord */
export const TOUCH  = 44;                    /* --touch — plancher de toute cible, jamais un dessin */
export const JETON  = { l: 87, h: 48 };      /* --glisse-case ; un collecteur = un jeton */
export const PETIT  = 77;                    /* --bouton-petit  */
export const MOYEN  = 105;                   /* --bouton-moyen  */
export const SP4 = 4, SP8 = 8;               /* les deux seules gouttières */

/* les huit rangées : le y du HAUT de chaque rangée de jetons */
export const LIGNES = [64, 120, 176, 232, 284, 336];
export const ECARTS = [8, 8, 8, 4, 4];   /* entre rangée n et n+1 */
export const BARRE  = { y: 508, h: 44 };   /* la rangée du bas */

/* ⚖️ LOT 318 — LA CÉSURE (Eric, 27/09 : « On fait une césure entre dalle 1 et 2 comme dans wares
   et pack ») : deux dalles, le CORPS sous le belt et le PIED, séparées de 8. */
export const DALLES = [{ nom: "CORPS", y: 60, h: 328 }, { nom: "PIED", y: 396, h: 159 }];

/* le pantin en filigrane — sa cote vit dans R_cotes.json, jamais dans le code du dessin.
   ⛔ `rendu_h` est le produit de `h` par `echelle` : ne pas le retaper, il est généré. */
export const PANTIN = { image: "pantin-h-contour.png", l: 441, h: 1400, echelle: 0.20714, x: 141.82, y: 85, rendu_h: 290 };

export const ORGANES = [
  { nom: "BODY FORGING",     sorte: "jeton",  x:      4, y:     64, l:    87, h:   48 },
  { nom: "HEAD/NECK 1",      sorte: "jeton",  x:     99, y:     64, l:    87, h:   48 },
  { nom: "HEAD/NECK 2",      sorte: "jeton",  x:    190, y:     64, l:    87, h:   48 },
  { nom: "BODY FORGING opt", sorte: "jeton",  x:    284, y:     64, l:    87, h:   48 },
  { nom: "TORSO/BACK 1",     sorte: "jeton",  x:     49, y:    120, l:    87, h:   48 },
  { nom: "TORSO/BACK 2",     sorte: "jeton",  x:    144, y:    120, l:    87, h:   48 },
  { nom: "TORSO/BACK 3",     sorte: "jeton",  x:    239, y:    120, l:    87, h:   48 },
  { nom: "ARM/HAND 1",       sorte: "jeton",  x:     49, y:    176, l:    87, h:   48 },
  { nom: "BELT",             sorte: "jeton",  x:    144, y:    176, l:    87, h:   48 },
  { nom: "ARM/HAND 2",       sorte: "jeton",  x:    239, y:    176, l:    87, h:   48 },
  { nom: "POCKET/WEAPON 1",  sorte: "jeton",  x:     61, y:    232, l:    87, h:   48 },
  { nom: "POCKET/WEAPON 2",  sorte: "jeton",  x:    227, y:    232, l:    87, h:   48 },
  { nom: "EXTRA STORAGE 1",  sorte: "jeton",  x:      4, y:    284, l:    87, h:   48 },
  { nom: "FOOT/LEG 1",       sorte: "jeton",  x:     99, y:    284, l:    87, h:   48 },
  { nom: "FOOT/LEG 2",       sorte: "jeton",  x:    190, y:    284, l:    87, h:   48 },
  { nom: "EXTRA STORAGE 3",  sorte: "jeton",  x:    284, y:    284, l:    87, h:   48 },
  { nom: "EXTRA STORAGE 2",  sorte: "jeton",  x:      4, y:    336, l:    87, h:   48 },
  { nom: "GROUND 1",         sorte: "jeton",  x:     99, y:    336, l:    87, h:   48 },
  { nom: "GROUND 2",         sorte: "jeton",  x:    190, y:    336, l:    87, h:   48 },
  { nom: "EXTRA STORAGE 4",  sorte: "jeton",  x:    284, y:    336, l:    87, h:   48 },
  { nom: "PURSE",            sorte: "bouton", x:    276, y:    405, l:    50, h:   50, mot: "Purse", cran: "T1/600" },
  { nom: "SEND COLLECTOR",   sorte: "jeton",  x:    144, y:    408, l:    87, h:   48 },
  { nom: "MONTANT",          sorte: "voyant", x:    281, y:    410, l:    40, h:   40, mot: "999 gp", cran: "T1/400", dans: "PURSE", lignes: 2 },
  { nom: "LUNE",             sorte: "lune",   x:      4, y:    415, l:    30, h:   30, cible: { x: 0, y: 408, l: 44, h: 44 }, grandEcran: true },
  { nom: "PARTY TALLY",      sorte: "bouton", x:     32, y:    464, l:    40, h:   40, cible: { x: 30, y: 462, l: 44, h: 44 }, mot: "Party Tally", cran: "T1/600", creation: false, lignes: 2 },
  { nom: "TALLY",            sorte: "bouton", x:     80, y:    464, l:    40, h:   40, cible: { x: 78, y: 462, l: 44, h: 44 }, mot: "Tally", cran: "T1/600" },
  { nom: "SEND TO",          sorte: "bouton", x:  139.5, y:    464, l:    96, h:   40, cible: { x: 139.5, y: 462, l: 96, h: 44 }, mot: "Send to", cran: "T1/600" },
  { nom: "SEND",             sorte: "porte",  x:    149, y:    508, l:    77, h:   44, mot: "Send", cran: "T2/600" },
  { nom: "GEAR",             sorte: "porte-carree", x:  10.25, y:    510, l:    40, h:   40, cible: { x: 8.25, y: 508, l: 44, h: 44 }, mot: "Gear", cran: "T0/600" },
  { nom: "BACKPACK",         sorte: "porte-carree", x:   56.5, y:    510, l:    40, h:   40, cible: { x: 54.5, y: 508, l: 44, h: 44 }, mot: "Pack", cran: "T0/600" },
  { nom: "WARES",            sorte: "porte-carree", x: 102.75, y:    510, l:    40, h:   40, cible: { x: 100.75, y: 508, l: 44, h: 44 }, mot: "Wares", cran: "T0/600" },
  { nom: "COMPANIONS",       sorte: "bouton", x:  243.5, y:    510, l:    77, h:   40, cible: { x: 243.5, y: 508, l: 77, h: 44 }, mot: "Companions", cran: "T1/600" },
  { nom: "?",                sorte: "rond",   x:    338, y:    519, l:    22, h:   22, cible: { x: 327, y: 508, l: 44, h: 44 } },
];

/* ═══ LES CRANS DE TEXTE — mesurés sur le site, police Inter ═══
   nom d'un slot sur un jeton ......... --t1 10px / 400   (.b3-nom)
   nom de l'objet posé ................ --t2 12px / 600   (.b3-objet)
   quantité sur un jeton .............. --t1 10px / 400   (.b3-qte-texte)
   Send, la porte du bas .............. --t2 12px / 600   (voir la note ci-dessous)
   Gear · Pack · Wares, les carrés ..... --t0  8px / 600, italique (lot 311, banc 310)
   Purse · Tally · Companions ......... --t1 10px / 600   (le sur-mesure d'Eric)
   ⚖️ Le gabarit du dépôt rend **16 px / 600** — tranché par Eric le 15/09
      (« garde 16 et corrige la règle » : la loi disait 14, le code rendait 16).
      `Backpack` y demande 75,46 pour 61 de place utile : il DÉBORDE de 14,46.
      La rangée descend donc à --t2 12px/600, où il tient à 56,95 dans 61 — et
      cette exception est NOMMÉE, elle ne se déduit pas. ⛔ Ne jamais tronquer ni rétrécir la
      police d'un bouton pour le faire tenir — lui rendre son rembourrage, ou
      changer le mot (tokens.css, loi du 06/09).
   rembourrage : --sp-8 sur les portes et SEND TO, --sp-4 sur le sur-mesure. */

