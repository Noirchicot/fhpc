/* ═══ X1 — LA FICHE D'UN OBJET POSSÉDÉ. Généré depuis X1_cotes.json. ═══
   ⛔ Un blg = un px de feuille de style UNE FOIS `zoom: var(--echelle)` appliqué sur `.app`.
   ⛔ DESSIN et CIBLE sont DEUX cotes : le dessin rétrécit, la cible ne descend jamais sous --touch.
   ⛔ Aucune de ces valeurs ne se ré-invente : elles viennent de tokens.css ou d'une cote donnée.
   ⚖️ LOI DU RANG X (Eric, 16/09) : la fiche recouvre TOUT SAUF LE BELT, et n'écrit JAMAIS
      `state.fenetre` — « les x ne s'inscrivent pas dans le belt ». */

export const DALLE = { l: 375, h: 500, y: 60 };  /* posée SOUS le belt, qui reste visible */
export const MARGE = 4;
/* ⚖️ Eric, 17/09 au soir : « remonte tout ce qui est sous le trait de séparation
   inférieur du texte de 20 blg » — la déchirure du bas mordait dans la rangée des
   portes. Le pied a donc SA marge, et elle n'est pas celle de la page. */
export const MARGE_TETE = 8;
export const MARGE_COTE = 14;
/* la colonne du texte — Eric, 17/09 au soir : « moins de place pour le texte, plus
   pour la marge ! ». C'est le sens de la fiche : la déchirure mord, le texte s'écarte. */
export const MARGE_TEXTE = 39;
export const MARGE_PIED = 11;
/* ⚖️ LOT 332 — le bas des dalles de la trilogie (Gear, Pack, Wares) : la dalle PEINTE de X1 et X2
   s'y arrête, et le pied des portes se cote 8 au-dessus. */
export const TRILOGIE_BAS = 495;
export const TOUCH = 44;                          /* --touch, plancher de toute cible */
export const PETIT = 77, LARGE = 105;             /* --bouton-petit, --bouton-moyen */

/* ⚠️ LA COTE QUE CE PLAN INVENTE, ET ELLE ATTEND ERIC : rien au dépôt ne porte
   d'interrupteur. Le dessin fait 40 × 22 dans la cible de 44 — 40 vient de
   `--bouton-hauteur`, 22 en est la moitié (la proportion 2:1 d'un interrupteur). */
export const INTERRUPTEUR = { l: 36, h: 20 };
export const ROND = 22;   /* la flèche : le gabarit du livre et du `?` de l'écran R */
/* ⚖️ LOT 308 — LA MOLETTE DE QUANTITÉ des fiches X1 et X2 (Eric, 27/09 : « La molette tambour ! »).
   Trois crans vus sur la piste ; les deux chevrons posent la moitié de leur cible de 44 hors
   piste (`bord`). ⭐ `pas` est l'invariant du tambour : `scrollLeft = pas × k`. */
export const MOLETTE = { tuile: 28, hauteur: 28, ecart: 4, pas: 32, vus: 3, piste: 92, bord: 22, chevron: { l: 10, h: 20 } };
/* ⚖️ LE DÉBORD DU PARCHEMIN — mesuré sur l'image d'Eric (17/09) : la déchirure
   rentre de 3,4 % à gauche et 2,8 % à droite, soit 12,9 blg au pire, et le 14 tient.
   ⭐ CE QU'IL COMMANDE À L'ÉCRAN : l'image se dessine PLUS GRANDE que la dalle de
   ce débord de chaque côté, pour que sa partie plate couvre les 375 × 500 et que
   ses bords déchirés mordent au-delà. Sinon tout ce qui est posé à la marge de 4
   tombe DANS la déchirure — vu au banc, le 17/09, au premier rendu. */
export const PARCHEMIN_DEBORD = 0;

export const ORGANES = [
  { nom: "NOM",           sorte: "voyant",        x:     39, y:      8, l:   297, h:   16, mot: "Winged Helmet", cran: "T4/600" },
  { nom: "RARETE",        sorte: "voyant",        x:     39, y:     32, l:   297, h:   14, mot: "Rare", cran: "T1/400" },
  { nom: "UNITE",         sorte: "voyant",        x:     90, y:     50, l:    65, h:    8, mot: "2 gp · 5 lb", cran: "T1/600" },
  { nom: "QTE",           sorte: "voyant",        x:    155, y:     50, l:    65, h:    8, mot: "×3", cran: "T1/600" },
  { nom: "TOTAL",         sorte: "voyant",        x:    220, y:     50, l:    65, h:    8, mot: "6 gp · 15 lb", cran: "T1/600" },
  { nom: "FILET HAUT",    sorte: "zone",          x:     73, y:     66, l:   229, h:    8, mot: "", cran: "T1/600" },
  { nom: "DESCRIPTION",   sorte: "zone",          x:     39, y:     74, l:   297, h:  215, mot: "Description", cran: "T2/400" },
  { nom: "JAUGE",         sorte: "zone",          x:  345.5, y:    241, l:    20, h:   52, mot: "", cran: "T1/600" },
  { nom: "COPIER",        sorte: "copier",        x:    9.5, y:    257, l:    20, h:   20, cible: { x: 4, y: 245, l: 44, h: 44 }, mot: "", cran: "T1/600" },
  { nom: "OEIL",          sorte: "copier",        x:  345.5, y:    257, l:    20, h:   20, cible: { x: 327, y: 245, l: 44, h: 44 }, mot: "", cran: "T1/600", dans: "JAUGE" },
  { nom: "FILET BAS",     sorte: "zone",          x:     73, y:    289, l:   229, h:    8, mot: "", cran: "T1/600" },
  { nom: "EQUIP",         sorte: "voyant",        x:   47.5, y:    299, l:    40, h:   40, mot: "Equip", cran: "T1/600", sous: "Equipped", cranSous: "T0/600" },
  { nom: "ATTUNE",        sorte: "voyant",        x:  143.5, y:    299, l:    40, h:   40, mot: "Attune", cran: "T1/600", sous: "Attuned", cranSous: "T0/600" },
  { nom: "LOCKED",        sorte: "voyant",        x:  239.5, y:    299, l:    40, h:   40, mot: "Lock", cran: "T1/600", sous: "Locked", cranSous: "T0/600" },
  { nom: "EQUIP ON",      sorte: "interrupteur",  x:   95.5, y:    309, l:    36, h:   20, cible: { x: 91.5, y: 297, l: 44, h: 44 }, etat: "on" },
  { nom: "ATTUNE ON",     sorte: "interrupteur",  x:  191.5, y:    309, l:    36, h:   20, cible: { x: 187.5, y: 297, l: 44, h: 44 }, etat: "on" },
  { nom: "LOCKED ON",     sorte: "interrupteur",  x:  287.5, y:    309, l:    36, h:   20, cible: { x: 283.5, y: 297, l: 44, h: 44 }, etat: "on" },
  { nom: "IS",            sorte: "voyant",        x:  192.5, y:    347, l:    16, h:   40, mot: "is", cran: "T1/600" },
  { nom: "IS QUOI",       sorte: "dropdown",      x:  212.5, y:    347, l:   150, h:   40, cible: { x: 212.5, y: 345, l: 150, h: 44 }, mot: "An attack", cran: "T2/600" },
  { nom: "SEND",          sorte: "voyant",        x:   12.5, y:    395, l:    36, h:   40, mot: "Send", cran: "T1/600" },
  { nom: "SEND N",        sorte: "molette",       x:   52.5, y:    395, l:   136, h:   40, cible: { x: 52.5, y: 393, l: 136, h: 44 }, mot: "20", cran: "T2/600" },
  { nom: "TO",            sorte: "voyant",        x:  192.5, y:    395, l:    16, h:   40, mot: "to", cran: "T1/600" },
  { nom: "SEND VERS",     sorte: "dropdown",      x:  212.5, y:    395, l:   150, h:   40, cible: { x: 212.5, y: 393, l: 150, h: 44 }, mot: "Merchant / NPC", cran: "T2/600" },
  { nom: "BACK",          sorte: "porte",         x:   27.5, y:    447, l:    77, h:   40, cible: { x: 27.5, y: 445, l: 77, h: 44 }, role: "retour", cran: "T2/600" },
  { nom: "USE",           sorte: "porte",         x:  108.5, y:    447, l:    77, h:   40, cible: { x: 108.5, y: 445, l: 77, h: 44 }, mot: "Use", cran: "T2/600" },
  { nom: "SEND !",        sorte: "porte",         x:  189.5, y:    447, l:    77, h:   40, cible: { x: 189.5, y: 445, l: 77, h: 44 }, mot: "Send", cran: "T2/600" },
  { nom: "TRASH",         sorte: "porte",         x:  270.5, y:    447, l:    77, h:   40, cible: { x: 270.5, y: 445, l: 77, h: 44 }, mot: "Trash", cran: "T2/600" },
];

/* ═══ CE QUE LA FICHE COMMANDE, ET QUI N'EXISTE PAS ENCORE ═══
   ⛔ `gear[N]` porte aujourd'hui `quantity`, `equipped`, `location` et `boite`.
   `attuned` et `locked` sont À CRÉER comme choix du personnage — c'est le plus
   gros poste du lot, et il ne se voit pas sur le dessin.
   ⭐ Les NOMS D'ÉTAT sont déjà fixés par le lot 212, qui dessine les trois
   voyants : `equipped` · `attuned` · `locked`. X1 ne les redéfinit pas, il les
   COMMANDE — une seule donnée, deux écrans. */
export const ETATS = ["equipped", "attuned", "locked"];

/* ⚖️ ET LES MOTS QU'ON MONTRE, sous le titre de chaque interrupteur, en oxblood,
   SEULEMENT quand l'état est vrai — Eric, 17/09 : « Equip / Equipped (apparaît en
   oxblood quand c'est le cas) », « tout se passe dans le petit carré, pas en
   dessous ». ⛔ Deux p à « Equipped » : l'anglais, et le nom du champ au dépôt. */
export const MOTS_ETAT = { equipped: "Equipped", attuned: "Attuned", locked: "Locked" };
export const OXBLOOD = "#4a0e13";

/* Les huit destinations du menu `Send n to`, du croquis. `actif: false` = le
   monde que la destination suppose n'existe pas à la CRÉATION (table, DM,
   compagnons). ⛔ La fiche n'offre que ce que le monde courant permet. */
export const DESTINATIONS = [
  { valeur: "backpack", mot: "Backpack",        actif: true },
  { valeur: "self",     mot: "Gear",            actif: true },
  { valeur: "party",    mot: "Party inventory", actif: false },
  { valeur: "companion", mot: "Companion",      actif: false },
  { valeur: "pc",       mot: "Group PC",        actif: false },
  { valeur: "merchant", mot: "Merchant / NPC",  actif: false },
  { valeur: "tally",    mot: "Tally",           actif: false },
  { valeur: "craft",    mot: "Craft",           actif: false }
];

/* Le menu `is` — ce que l'objet EST au combat, du croquis. ⏳ Sa SOURCE reste à
   trancher par Eric : propriété que la règle donne, ou choix du joueur ? */
export const EST = ["action", "bonus action", "reaction", "attack", "spell"];

