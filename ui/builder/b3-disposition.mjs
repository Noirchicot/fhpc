/* ══ LA DISPOSITION DU DRESSING (B3) — LA DÉCLARATION UNIQUE ═════════════════
   🔴 CES POSITIONS SONT CELLES DU CROQUIS D'ERIC (IMG_6099, 2026-08-23),
   relevées le 2026-08-24 à la grille : chaque boîte y est dessinée à ~230 px
   pour un écran de ~1040, soit EXACTEMENT le jeton standard 87 px sur un
   téléphone de 375. Son dessin était à l'échelle — la mesure l'a confirmé,
   pas supposé (87/230 = 0,378 ; hauteurs 123 × 0,38 = 47).

   ⭐ LA LOI DE CET ÉCRAN, D'ERIC MOT POUR MOT (24/08) : *« la base à garder =
   la dimension d'un item normalisé drag and drop. Le reste est secondaire. »*
   Le jeton 87 × 48 ne se met JAMAIS à l'échelle — c'est le même que le vivier
   des sorts, sur tous les écrans. Conséquence : la scène a une TAILLE FIXE en
   px CSS, et c'est ce qui répond à *« rien ne bouge d'un écran à l'autre »* —
   sur grand écran elle se centre, elle ne se dilate pas.

   ⭐ LE CORPS EST UN REPÈRE, PAS UN CADRE (Eric, 24/08) : *« la forme est un
   repère, je vais la mettre en transparence qu'on la devine, en second plan
   […] je pourrais même l'agrandir de 20 %, ça resterait parlant, ça suggère
   les emplacements. »* Sa taille est donc un RÉGLAGE (voir `CORPS_ECHELLES`),
   jamais une contrainte sur les boîtes.

   ⛔ AUCUN APPARIEMENT boîte ↔ emplacement ICI. Les dix emplacements du corps
   (`b3-ancrages.mjs`) comptent les OBJETS ; les boîtes portent les noms du
   croquis. Qui va dans quoi vit dans la donnée (`srfh`, champ `slot`) — lot 95.
   Écrire la correspondance ici serait la deviner : une absence n'est jamais
   une réponse.

   📌 UNITÉ : le px CSS du jeton. Pas de deuxième repère — la scène EST rendue
   à `SCENE.l` px de large, donc 1 unité = 1 px, partout, par construction.
   ══════════════════════════════════════════════════════════════════════════ */

/** La scène. 397 × 584 = le croquis (1040 × 1528) à l'échelle du jeton. */
export const SCENE = { l: 397, h: 584 };

/** ⛔ CES DEUX NOMBRES NE SONT PAS UNE SOURCE : ils RECOPIENT `--glisse-case`
 *  et `--glisse-h` de `tokens.css`, parce qu'un SVG ne lit pas une variable
 *  CSS dans ses attributs. Le garde `tests/b3-disposition.test.mjs` vérifie
 *  l'égalité — si le jeton change dans les tokens, il rougit ici. */
export const JETON = { l: 87, h: 48 };

/** L'écart vertical d'une pile (Body forging 1→2, Head gear 1→2, …).
 *  📏 Le croquis dit ~10 ; snappé à 8, le chiffre récurrent d'Eric (les jetons
 *  du vivier, les collecteurs). Une cote donnée le remplacera s'il en pose une. */
export const PILE = 8;

/** LES BOÎTES — noms du croquis, positions relevées puis régularisées :
 *  · x : bord gauche ; `centre: true` = centrée sur la scène ;
 *  · y : bord haut ; les piles sont à exactement JETON.h + PILE l'une de l'autre ;
 *  · l : largeur si ≠ jeton (aucune boîte n'en use aujourd'hui : même le
 *    torse est une paire de jetons pleins, voir sa note) ;
 *  · attunable : la pastille du croquis — un ÉTAT, pas un ornement (Eric,
 *    24/08 : « les points orange = attuned or not ») : éteinte par défaut,
 *    pleine quand l'objet posé est attuné. Sa place (Eric, 24/08) :
 *    « attunements latéraux partout, sauf sur Belt : ce sera supérieur » ;
 *  ⭐ et un SECOND état, la QUANTITÉ (le rond vert « QTY » du croquis) —
 *    Eric, 24/08 : « certains items peuvent être stockés en quantités » et
 *    « un compteur quantités peut apparaître dans POCKETS » : les quatre
 *    Pocket ET les deux hybrides Pocket/Sheath le portent — « les 6 », son
 *    mot — et le badge ×N ne paraît que si l'objet posé en porte plusieurs.
 *    Sa PLACE est de lui aussi (24/08, en deux temps — sa dernière parole
 *    gagne) : « Pocket 1 2 3 4 : MÉDIAL · [Sheath] 3 and 4 : latéralement » —
 *    (⭐ terminologie corrigée par Eric le 24/08 : « c'est pas hilt, c'est
 *    Sheath / fourreau » — le fourreau se PORTE, la poignée non) —
 *    `qte: "medial"` = à cheval sur le flanc INTERNE (vers le corps), à
 *    mi-hauteur ; `qte: "lateral"` = pareil sur le flanc EXTERNE ;
 *  ⛔ le soulignage rouge pointillé du croquis (Body forging, Torso gear 2)
 *    n'existe plus : Eric, 24/08 — « aucun sens, tous les pointillés rouges
 *    peuvent dégager ». C'était un trait de dessin, pas une donnée. */
export const BOITES = [
  { clef: "forge1",  nom: "Body forging",    x: 11,  y: 12,  attunable: true },
  { clef: "forge2",  nom: "Body forging 2",  x: 11,  y: 68,  attunable: true, optionnelle: true },
  { clef: "tete1",   nom: "Head gear 1",     centre: true, y: 36,  attunable: true },
  { clef: "tete2",   nom: "Head gear 2",     centre: true, y: 92,  attunable: true },
  /* la PAIRE du torse : DEUX boîtes pleines de 87, à 4 px (« 4 pixels entre
     torso 1 et 2 »), centrées ENSEMBLE — deux clefs vraies, pour que la
     carte slot → boîte ne vise jamais un fantôme. */
  { clef: "torse1",  nom: "Torso gear 1",    x: 110, y: 165, attunable: true },
  { clef: "torse2",  nom: "Torso gear 2",    x: 201, y: 165, attunable: true },
  { clef: "fourreau1",   nom: "Sheath 1",          x: 59,  y: 224, attunable: true },
  { clef: "fourreau2",   nom: "Sheath 2",          x: 251, y: 224, attunable: true },
  { clef: "ceinture", nom: "Belt",           centre: true, y: 250, attunable: true },
  { clef: "fourreau3",   qte: "lateral", nom: "Pocket/Sheath 3",   x: 59,  y: 280, attunable: true },
  { clef: "fourreau4",   qte: "lateral", nom: "Pocket/Sheath 4",   x: 251, y: 280, attunable: true },
  { clef: "pied1",   nom: "Foot/leg gear 1", centre: true, y: 341, attunable: true },
  { clef: "poche1",  qte: "medial", nom: "Pocket 1",        x: 11,  y: 377, attunable: true },
  { clef: "poche2",  qte: "medial", nom: "Pocket 2",        x: 299, y: 377, attunable: true },
  { clef: "pied2",   nom: "Foot/leg gear 2", centre: true, y: 397, attunable: true },
  { clef: "poche3",  qte: "medial", nom: "Pocket 3",        x: 11,  y: 433, attunable: true },
  { clef: "poche4",  qte: "medial", nom: "Pocket 4",        x: 299, y: 433, attunable: true },
];

/** ⭐ SLOT → BOÎTES — RATIFIÉ PAR ERIC LE 24/08, ligne à ligne : « neck non,
 *  head gear ; eyes headgear ; chapeau head » (les TROIS du haut vont à la
 *  tête) · « torso et back idem, cape et armure » · « forearms sheath +
 *  sheath/pocket, idem pour hands, idem pour anneaux » · « pantalons et
 *  chaussures, bottes = feet ».
 *  🔴 ET LA RÈGLE GÉNÉRALE, DE LUI AUSSI : *« si c'est libre l'item prend son
 *  slot, sinon Pocket, sinon backpack »* — les POCHES sont le débord de TOUT
 *  slot, et quand elles sont pleines l'objet va AU SAC (décidé au moment du
 *  GESTE par le pilote, jamais pendant un rendu — un rendu n'écrit pas). */
export const SLOT_VERS_BOITES = {
  head:     ["tete1", "tete2"],
  eyes:     ["tete1", "tete2"],
  neck:     ["tete1", "tete2"],
  torso:    ["torse1", "torse2"],
  back:     ["torse1", "torse2"],
  waist:    ["ceinture"],
  forearms: ["fourreau1", "fourreau2", "fourreau3", "fourreau4"],
  hands:    ["fourreau1", "fourreau2", "fourreau3", "fourreau4"],
  fingers:  ["fourreau1", "fourreau2", "fourreau3", "fourreau4"],
  feet:     ["pied1", "pied2"],
};

/** Le débord ratifié : « sinon Pocket » — pour tous les slots. */
export const POCHES_DEBORD = ["poche1", "poche2", "poche3", "poche4"];

/** Le collecteur (bleu au croquis) : UN jeton, centré — on y dépose, Send le vide. */
export const COLLECTEUR = { centre: true, y: 458 };

/** Send to (vert au croquis = dropdown) : List/Item → Backpack · Party
 *  inventory · Companion · Group PC · Merchant/NPC. Le détail vit au croquis.
 *  📏 Eric, 24/08 : « un peu trop bas » — mesuré : à h 24 il touchait la barre
 *  à 1 px. Repris du croquis (h ≈ 18) et calé à PILE (8) du collecteur ET de
 *  la barre : 506 + 8 = 514, 514 + 18 + 8 = 540. */
export const ENVOI = { centre: true, y: 514, l: 95, h: 18 };

/** La bourse (coin haut droit) : valeurs = INFO (vert foncé) · `+`/`−` =
 *  BOUTONS (rouge) · la rangée du milieu = TYPE IN (rose) · total en GP = INFO.
 *  ⭐ QUATRE monnaies, pas cinq — Eric, 24/08 : « j'ai fait une erreur sur la
 *  monnaie, pas d'electrum lol ». Et ça RÉCONCILIE l'écran avec le moteur :
 *  `CURRENCY_KEYS` (src/build) n'a que quatre clefs, `ep` n'y a jamais été. */
export const BOURSE = { x: 262, y: 7, l: 131, h: 136, monnaies: ["PP", "GP", "SP", "CP"] };

/** Gear weight (INFO) : Self · Backpack · Storage. */
export const POIDS = { x: 306, y: 153, l: 80, h: 59, lignes: ["Self", "Backpack", "Storage"] };

/** La barre du bas — boutons rouges du croquis. Send : 1 item → vide le
 *  collecteur et envoie ; une liste → SB3.2. Le 5ᵉ cadre est VIDE sur le
 *  croquis : il est réservé, pas oublié. */
export const BARRE = { y: 540, h: 32, l: 66, xs: [11, 88, 166, 243, 320],
  noms: ["Equipment", "Craft", "Send", "Companions", ""] };

/** LE CORPS EN SCÈNE — le filigrane. Calé pour que les ancrages du repère
 *  1000 × 1600 tombent sur les boîtes du croquis (mesuré : mains → rangée
 *  Sheath, taille → Belt, pieds → Foot/leg gear 2).
 *  `k` : 1400 unités d'encre → 303 px (têtes 120, pieds 423 — le croquis).
 *  `echelles` : la taille est un réglage d'Eric — et il a TRANCHÉ le 24/08 :
 *  *« +20 % parfait ! »*. Le 1,2 est donc le DÉFAUT ; la taille croquis reste
 *  disponible au banc pour comparer, jamais pour livrer. */
export const CORPS_EN_SCENE = {
  k: 303 / 1400,
  dx: 90.3,   // repère x=500 (l'axe du corps) → scène 198.5, le milieu
  dy: 98.4,   // repère y=100 (le haut de l'encre) → scène 120
  echelles: [1.2, 1],
};

/** Du point du repère (1000 × 1600) au px de la scène, à l'échelle `e`,
 *  autour de l'axe du corps (le grandissement n'écarte pas le corps de l'axe :
 *  il grossit SUR PLACE, ancré au milieu de son encre). */
export function versLaScene(x, y, e = 1) {
  const { k, dx, dy } = CORPS_EN_SCENE;
  const cx = 198.5, cy = 271.5;           // le centre de l'encre en scène
  return {
    x: cx + (dx + x * k - cx) * e,
    y: cy + (dy + y * k - cy) * e,
  };
}
