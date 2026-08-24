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
 *  · l : largeur si ≠ jeton (le torse est une DOUBLE boîte, 2 jetons accolés) ;
 *  · attunable : la pastille violette du croquis (● = attuned) ;
 *  · pointille : le soulignage rouge pointillé qu'Eric a dessiné sur DEUX
 *    libellés (Body forging, Torso gear 2) — recopié, pas interprété : son
 *    sens est à lui. */
export const BOITES = [
  { clef: "forge1",  nom: "Body forging",    x: 11,  y: 12,  attunable: true, pointille: true },
  { clef: "forge2",  nom: "Body forging 2",  x: 11,  y: 68,  attunable: true, optionnelle: true },
  { clef: "tete1",   nom: "Head gear 1",     centre: true, y: 36,  attunable: true },
  { clef: "tete2",   nom: "Head gear 2",     centre: true, y: 92,  attunable: true },
  { clef: "torse1",  nom: "Torso gear 1",    centre: true, y: 165, l: 182, double: "Torso gear 2", attunable: true, pointille: true },
  { clef: "hilt1",   nom: "Hilt 1",          x: 59,  y: 224, attunable: true },
  { clef: "hilt2",   nom: "Hilt 2",          x: 251, y: 224, attunable: true },
  { clef: "ceinture", nom: "Belt",           centre: true, y: 250, attunable: true },
  { clef: "hilt3",   nom: "Pocket/Hilt 3",   x: 59,  y: 280, attunable: true },
  { clef: "hilt4",   nom: "Pocket/Hilt 4",   x: 251, y: 280, attunable: true },
  { clef: "pied1",   nom: "Foot/leg gear 1", centre: true, y: 341, attunable: true },
  { clef: "poche1",  nom: "Pocket 1",        x: 11,  y: 377, attunable: true },
  { clef: "poche2",  nom: "Pocket 2",        x: 299, y: 377, attunable: true },
  { clef: "pied2",   nom: "Foot/leg gear 2", centre: true, y: 397, attunable: true },
  { clef: "poche3",  nom: "Pocket 3",        x: 11,  y: 433, attunable: true },
  { clef: "poche4",  nom: "Pocket 4",        x: 299, y: 433, attunable: true },
];

/** Le collecteur (bleu au croquis) : UN jeton, centré — on y dépose, Send le vide. */
export const COLLECTEUR = { centre: true, y: 458 };

/** Send to (vert au croquis = dropdown) : List/Item → Backpack · Party
 *  inventory · Companion · Group PC · Merchant/NPC. Le détail vit au croquis. */
export const ENVOI = { centre: true, y: 517, l: 95, h: 24 };

/** La bourse (coin haut droit) : valeurs = INFO (vert foncé) · `+`/`−` =
 *  BOUTONS (rouge) · la rangée du milieu = TYPE IN (rose) · total en GP = INFO. */
export const BOURSE = { x: 262, y: 7, l: 131, h: 136, monnaies: ["PP", "GP", "SP", "CP", "EP"] };

/** Gear weight (INFO) : Self · Backpack · Storage. */
export const POIDS = { x: 306, y: 153, l: 80, h: 59, lignes: ["Self", "Backpack", "Storage"] };

/** La barre du bas — boutons rouges du croquis. Send : 1 item → vide le
 *  collecteur et envoie ; une liste → SB3.2. Le 5ᵉ cadre est VIDE sur le
 *  croquis : il est réservé, pas oublié. */
export const BARRE = { y: 540, h: 32, l: 66, xs: [11, 88, 166, 243, 320],
  noms: ["Equipment", "Craft", "Send", "Companions", ""] };

/** LE CORPS EN SCÈNE — le filigrane. Calé pour que les ancrages du repère
 *  1000 × 1600 tombent sur les boîtes du croquis (mesuré : mains → rangée
 *  Hilt, taille → Belt, pieds → Foot/leg gear 2).
 *  `k` : 1400 unités d'encre → 303 px (têtes 120, pieds 423 — le croquis).
 *  `echelles` : la taille est un réglage d'Eric, pas une loi — « +20 %, ça
 *  resterait parlant ». */
export const CORPS_EN_SCENE = {
  k: 303 / 1400,
  dx: 90.3,   // repère x=500 (l'axe du corps) → scène 198.5, le milieu
  dy: 98.4,   // repère y=100 (le haut de l'encre) → scène 120
  echelles: [1, 1.2],
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
