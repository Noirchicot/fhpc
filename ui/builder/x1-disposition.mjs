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
export const MARGE_TETE = 14;
export const MARGE_COTE = 14;
/* la colonne du texte — Eric, 17/09 au soir : « moins de place pour le texte, plus
   pour la marge ! ». C'est le sens de la fiche : la déchirure mord, le texte s'écarte. */
export const MARGE_TEXTE = 39;
export const MARGE_PIED = 34;
export const TOUCH = 44;                          /* --touch, plancher de toute cible */
export const PETIT = 77, LARGE = 105;             /* --bouton-petit, --bouton-moyen */

/* ⚠️ LA COTE QUE CE PLAN INVENTE, ET ELLE ATTEND ERIC : rien au dépôt ne porte
   d'interrupteur. Le dessin fait 40 × 22 dans la cible de 44 — 40 vient de
   `--bouton-hauteur`, 22 en est la moitié (la proportion 2:1 d'un interrupteur). */
export const INTERRUPTEUR = { l: 36, h: 20 };
export const ROND = 22;   /* la flèche : le gabarit du livre et du `?` de l'écran R */
/* ⚖️ LE DÉBORD DU PARCHEMIN — mesuré sur l'image d'Eric (17/09) : la déchirure
   rentre de 3,4 % à gauche et 2,8 % à droite, soit 12,9 blg au pire, et le 14 tient.
   ⭐ CE QU'IL COMMANDE À L'ÉCRAN : l'image se dessine PLUS GRANDE que la dalle de
   ce débord de chaque côté, pour que sa partie plate couvre les 375 × 500 et que
   ses bords déchirés mordent au-delà. Sinon tout ce qui est posé à la marge de 4
   tombe DANS la déchirure — vu au banc, le 17/09, au premier rendu. */
export const PARCHEMIN_DEBORD = 0;

export const ORGANES = [
  { nom: "QTE",           sorte: "voyant",        x:     14, y:     20, l:    40, h:   40, mot: "×2", cran: "T1/600" },
  { nom: "NOM",           sorte: "voyant",        x:     58, y:     20, l:   259, h:   40, mot: "Winged Helmet", cran: "T4/600" },
  { nom: "PAGINATION",    sorte: "voyant",        x:    321, y:     20, l:    40, h:   40, mot: "1/12", cran: "T1/600" },
  { nom: "PRIX",          sorte: "voyant",        x:     90, y:     62, l:    84, h:    8, mot: "15 gp · ×2 · 30 gp", cran: "T1/600" },
  { nom: "POIDS",         sorte: "voyant",        x:    241, y:     62, l:    44, h:    8, mot: "3 lb · 6 lb", cran: "T1/600" },
  { nom: "FILET HAUT",    sorte: "zone",          x:     73, y:     78, l:   229, h:    8, mot: "", cran: "T1/600" },
  { nom: "DESCRIPTION",   sorte: "zone",          x:     39, y:     86, l:   297, h:  180, mot: "Description", cran: "T2/400" },
  { nom: "JAUGE",         sorte: "zone",          x:  345.5, y:    218, l:    20, h:   52, mot: "", cran: "T1/600" },
  { nom: "COPIER",        sorte: "copier",        x:    9.5, y:    234, l:    20, h:   20, cible: { x: 4, y: 222, l: 44, h: 44 }, mot: "", cran: "T1/600" },
  { nom: "OEIL",          sorte: "copier",        x:  345.5, y:    234, l:    20, h:   20, cible: { x: 327, y: 222, l: 44, h: 44 }, mot: "", cran: "T1/600", dans: "JAUGE" },
  { nom: "FILET BAS",     sorte: "zone",          x:     73, y:    266, l:   229, h:    8, mot: "", cran: "T1/600" },
  { nom: "EQUIP",         sorte: "voyant",        x:   47.5, y:    276, l:    40, h:   40, mot: "Equip", cran: "T1/600", sous: "Equipped", cranSous: "T0/600" },
  { nom: "ATTUNE",        sorte: "voyant",        x:  143.5, y:    276, l:    40, h:   40, mot: "Attune", cran: "T1/600", sous: "Attuned", cranSous: "T0/600" },
  { nom: "LOCKED",        sorte: "voyant",        x:  239.5, y:    276, l:    40, h:   40, mot: "Lock", cran: "T1/600", sous: "Locked", cranSous: "T0/600" },
  { nom: "EQUIP ON",      sorte: "interrupteur",  x:   95.5, y:    286, l:    36, h:   20, cible: { x: 91.5, y: 274, l: 44, h: 44 }, etat: "on" },
  { nom: "ATTUNE ON",     sorte: "interrupteur",  x:  191.5, y:    286, l:    36, h:   20, cible: { x: 187.5, y: 274, l: 44, h: 44 }, etat: "on" },
  { nom: "LOCKED ON",     sorte: "interrupteur",  x:  287.5, y:    286, l:    36, h:   20, cible: { x: 283.5, y: 274, l: 44, h: 44 }, etat: "on" },
  { nom: "IS",            sorte: "voyant",        x:  146.5, y:    324, l:    16, h:   40, mot: "is", cran: "T1/600" },
  { nom: "IS QUOI",       sorte: "dropdown",      x:  166.5, y:    324, l:   150, h:   40, cible: { x: 166.5, y: 322, l: 150, h: 44 }, mot: "An attack", cran: "T2/600" },
  { nom: "SEND",          sorte: "voyant",        x:   58.5, y:    372, l:    36, h:   40, mot: "Send", cran: "T1/600" },
  { nom: "SEND N",        sorte: "champ",         x:   98.5, y:    372, l:    44, h:   40, cible: { x: 98.5, y: 370, l: 44, h: 44 }, mot: "1", cran: "T2/600" },
  { nom: "TO",            sorte: "voyant",        x:  146.5, y:    372, l:    16, h:   40, mot: "to", cran: "T1/600" },
  { nom: "SEND VERS",     sorte: "dropdown",      x:  166.5, y:    372, l:   150, h:   40, cible: { x: 166.5, y: 370, l: 150, h: 44 }, mot: "Merchant / NPC", cran: "T2/600" },
  { nom: "BACK",          sorte: "porte",         x:   27.5, y:    424, l:    77, h:   40, cible: { x: 27.5, y: 422, l: 77, h: 44 }, role: "retour", cran: "T2/600" },
  { nom: "USE",           sorte: "porte",         x:  108.5, y:    424, l:    77, h:   40, cible: { x: 108.5, y: 422, l: 77, h: 44 }, mot: "Use", cran: "T2/600" },
  { nom: "SEND !",        sorte: "porte",         x:  189.5, y:    424, l:    77, h:   40, cible: { x: 189.5, y: 422, l: 77, h: 44 }, mot: "Send", cran: "T2/600" },
  { nom: "TRASH",         sorte: "porte",         x:  270.5, y:    424, l:    77, h:   40, cible: { x: 270.5, y: 422, l: 77, h: 44 }, mot: "Trash", cran: "T2/600" },
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

