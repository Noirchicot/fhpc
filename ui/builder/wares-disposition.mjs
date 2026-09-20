/* ═══ ÉCRAN WARES — la disposition, en blg. Dictée par Eric le 2026-09-20. ═══
   ⛔ Un blg = un px de feuille de style UNE FOIS `zoom: var(--echelle)` appliqué sur `.app`.
   ⛔ DESSIN et CIBLE sont DEUX cotes : le dessin rétrécit, la cible ne descend jamais sous --touch.
   ⛔ Aucune de ces valeurs ne se ré-invente : elles viennent de tokens.css, du plan du sac, ou
      d'une cote dictée. Les lois qui les justifient vivent dans NORMES.md, ancres
      `equipement-wares-*`.

   🔴 CE FICHIER SE LIT AUTREMENT QUE `sac-disposition.mjs`, ET C'EST DÉLIBÉRÉ.
   Le plan du sac est une table de coordonnées ABSOLUES que `feuilleDesCotesSac()` traduit en
   `left/top/width/height`. Wares n'en fait rien : 🔒 le SACRÉ N° 3 (*« tout est dans une boîte,
   les boîtes sont sur une grille »*, NORMES:2148) ne cède pas, et Eric l'a rappelé en dictant
   cet écran. Les coordonnées ci-dessous sont donc le **plan coté** — ce qu'un garde relit, ce
   qu'un banc vérifie — et la feuille en déduit des **pistes de grille**, jamais des `left`.
   ⭐ La conséquence qui compte : un centre ne s'écrit nulle part. `135,5`, `71,75`, `303,25`
   apparaissent ici comme des CONSTATS *(« voilà ce que la piste rend »)* et jamais comme des
   valeurs posées — c'est `1fr` qui les produit, et qui les reproduira juste le jour où un
   organe changera de largeur. */

/* ── LA SCÈNE ─────────────────────────────────────────────────────────────── */
export const DALLE = { l: 375, h: 500 };

/* ⚖️ L'EXCEPTION NOMMÉE, ET ELLE EST UNIQUE (NORMES `equipement-wares-rembourrage-quatre`) :
   le rembourrage d'une dalle vaut 4, l'écart entre deux organes garde le 8 du sacré n° 3.
   ⛔ Un écart porte le rythme entre deux organes ; un rembourrage ne sépare rien, il borde. */
export const REMBOURRAGE = 4;
export const ECART = 8;
export const TOUCH = 44;
export const JETON = { l: 87, h: 48 };

/* ⚖️ LE LINE BLEED entre deux dalles — le fond passe entre (CADRES §8 bis). ⛔ C'est la
   COLONNE qui l'écrit, jamais une dalle pour sa voisine. */
export const BLEED = 8;

/* ── LES TROIS DALLES ─────────────────────────────────────────────────────────
   ⭐ 92 + 8 + 232 + 8 + 160 = 500, PILE. Le garde `wares-budget` refait cette somme. */
export const DALLES = Object.freeze([
  { nom: "TAMBOUR", y: 0,   h: 92,  mot: "les deux étages de la roue" },
  { nom: "GRILLE",  y: 100, h: 232, mot: "les douze jetons et les deux gouttières" },
  { nom: "PIED",    y: 340, h: 160, mot: "les Tally, le collecteur, la bourse, Send to, la rangée" },
]);

/* ── DALLE 1 · LE TAMBOUR ─────────────────────────────────────────────────────
   ⚖️ « fonctionnement exactement celui de backpack » (Eric, 20/09) : la roue de Wares REPREND
   les cotes de celle du sac, sans en recopier une seule à la main — elles sont ici parce que
   ce fichier est le plan, pas parce qu'on les redessine.
   ⛔ ÇA NE TOURNE PLUS À L'INFINI : la roue actuelle de Wares porte douze copies de chaque cran
   dans le DOM. Elles disparaissent — navigation identique à celle du sac.
   ⚖️ 5 CRANS PAR LIGNE : 71 (le dominant) + 4 × 57 = 299, dans une piste de 331. */
export const ROUE = {
  piste: 331, budget: 299, dominant: 71, secondaire: 57, margePct: 0.075,
  tuile: 57, pas: 65, loupe: 1.2456, loupeX: 152.0,
  hauteur: 32.11, hauteurDominante: 40,
};

/* ⚖️ L'ÉCART ENTRE LES DEUX ÉTAGES VAUT 4 — dicté par Eric le 20/09 (« 4 blg »). C'est une
   exception au 8 du sacré n° 3, et elle est nommée ici, à côté de son argument : les deux
   étages sont UN organe à deux rangs, pas deux organes voisins. */
export const ECART_ETAGES = 4;

/* ── DALLE 2 · LA GRILLE ──────────────────────────────────────────────────────
   ⚖️ QUATRE RANGÉES DE TROIS = DOUZE (NORMES `equipement-wares-douze-par-page`). ⛔ Ce n'est
   pas un goût : à cinq rangées l'écran demande 556 blg pour une scène qui en offre 500.
   ⚖️ LE REMBOURRAGE DE CETTE DALLE-CI VAUT 8, pas 4 — croquis d'Eric du 19/09, « 8 au-dessus
   du premier jeton et 8 sous le dernier ». ⭐ Un croquis d'Eric prime sur une généralisation. */
export const PAR_PAGE = 12;
export const COLONNES_GRILLE = 3;
export const RANGEES_GRILLE = 4;
export const REMBOURRAGE_GRILLE = 8;

/* les cotes que la grille RESTITUE — ⛔ constats, jamais des valeurs posées :
   largeur des jetons  3 × 87 + 2 × 8 = 277, dans 375 → gouttière (375 − 277) / 2 = 49
   hauteur des jetons  4 × 48 + 3 × 8 = 216, + 2 × 8 de rembourrage = 232 */
export const RENDU_GRILLE = Object.freeze({
  jetons: { l: 277, h: 216 },
  gouttiere: 49,
  colonnes: [49, 144, 239],
  rangees: [108, 164, 220, 276],
});

/* ── DALLE 3 · LE PIED ────────────────────────────────────────────────────────
   ⚖️ LA COLONNE DU MILIEU VAUT 96 PARCE QUE `Send to` EST LE PLUS LARGE (NORMES
   `equipement-wares-bourse-et-tally-centres`), ⛔ pas 87, la largeur du collecteur. C'est le
   plus large qui pose la piste ; le collecteur se centre dedans.
   ⚖️ LES DEUX CELLULES DE CÔTÉ ENJAMBENT LES RANGÉES 1 À 3 et portent `place-self: center` —
   d'où les organes « à cheval sur deux lignes », qu'Eric a nommé avant de les voir. */
export const PIED = {
  colonnes: ["1fr", 96, "1fr"],
  rangees: [48, ECART, TOUCH, ECART, TOUCH],   /* collecteur · Send to · la rangée */
};

/* ce que ces pistes RESTITUENT — ⛔ constats, pour le garde et le banc :
   colonne de côté  (375 − 2 × 4 − 96) / 2 = 135,5     centres 71,75 et 303,25
   cellule de côté  48 + 8 + 44 = 100                   centre 394 (abs)
   somme verticale  4 + 48 + 8 + 44 + 8 + 44 + 4 = 160 */
export const RENDU_PIED = Object.freeze({
  cote: { l: 135.5, h: 100 },
  centres: { gauche: 71.75, droite: 303.25, y: 394 },
});

/* ── LA RANGÉE DU PIED ────────────────────────────────────────────────────────
   ⚖️ LE TRIANGLE SE REFERME : chaque écran porte les DEUX portes qu'il n'est pas (NORMES
   `equipement-wares-pied-triangle`). ⛔ `Equipment` est le nom de l'ÉTAPE, jamais d'un écran.
   ⛔ CES TROIS-LÀ NE SE POSENT PAS ICI : c'est la grille partagée des rangées de contrôles
   qui les range — `borne | 1fr | borne`, la même que R et le sac. Leur cote dit ce qu'ils
   MESURENT, pas où on les met. */
export const RANGEE = { l: 367, h: TOUCH, borne: TOUCH, porte: { l: 77, h: TOUCH }, rond: 22 };
export const PORTES = Object.freeze(["gear", "send", "backpack"]);

/* ── LES ORGANES ──────────────────────────────────────────────────────────────
   Le plan coté, dalle par dalle. `y` est ABSOLU dans la scène — c'est ce qu'un garde relit
   et ce qu'un banc mesure. ⛔ La feuille n'en tire aucun `left` : elle en tire des pistes. */
export const ORGANES = [
  /* dalle 1 — le tambour */
  { nom: "ROUE CATEGORIES",     sorte: "roue",       dalle: "TAMBOUR", x: 22,     y: 4,   l: 331, h: 40, cible: { x: 22, y: 2, l: 331, h: 44 }, cran: "T1/600" },
  { nom: "ROUE SOUS-CATEGORIES", sorte: "roue",      dalle: "TAMBOUR", x: 22,     y: 48,  l: 331, h: 40, cible: { x: 22, y: 46, l: 331, h: 44 }, cran: "T1/600" },
  /* ⚖️ UN TUNER VIT *DANS* SA ROUE, et sa cible mord donc la sienne — c'est déjà vrai dans le
     sac (ROUE cible 22→353, TUNER G cible 0→44). ⭐ Ce n'est PAS un recouvrement fautif : le
     tuner est le contrôle de la roue, posé sur son bord. Le plan le DIT (`dans`), et le garde
     des cibles saute les paires hôte/enfant — mais il vérifie qu'un enfant ne SORT pas de son
     hôte, ⛔ sans quoi il ne pourrait plus rien accuser du tout.
     📌 ET UN TUNER N'A PAS BESOIN DES 44 — Eric, 18/09 : *« les tuners sont pour la souris,
     donc les 44 hors sujet »*. On les lui garde : une cible qui existe ne se retire pas parce
     qu'un geste ne la vise pas, et le chevron qu'il devient au repos, lui, les réclame. */
  /* 🔴 LE VISEUR MANQUAIT AU PLAN *ET* À L'ÉCRAN, ET C'EST POUR ÇA QU'AUCUN GARDE NE L'A VU.
     Eric, 20/09, en regardant l'écran en ligne : *« il n'y a pas de viseur »*. ⭐ Ma bijection
     plan ↔ DOM ne pouvait rien dire : elle compare deux listes, et l'organe manquait DANS LES
     DEUX. Une liste par nom est incomplète par construction — elle ne peut pas nommer ce
     qu'elle ignore. ⛔ Ce qui l'aurait attrapé est la comparaison avec le SAC, qui en a un.
     ⚖️ LE HALO RESTE CENTRÉ, LES ITEMS DÉFILENT DESSOUS (Eric, 19/09) : il ne voyage pas avec
     le cran, c'est un cadre FIXE sur la tuile dominante. Et il garde le GENRE de ce qu'il
     cadre. ⛔ On ne le tape pas : `aria-hidden`, `pointer-events: none`. */
  { nom: "LOUPE CATEGORIES",    sorte: "loupe", dalle: "TAMBOUR", dans: "ROUE CATEGORIES",      x: 152, y: 4,  l: 71, h: 40, cran: "T1/600", dominant: true },
  { nom: "LOUPE SOUS-CAT",      sorte: "loupe", dalle: "TAMBOUR", dans: "ROUE SOUS-CATEGORIES", x: 152, y: 48, l: 71, h: 40, cran: "T1/600", dominant: true },
  { nom: "TUNER CATEGORIES G",  sorte: "tuner", dalle: "TAMBOUR", dans: "ROUE CATEGORIES",      x: 4,   y: 18, l: 10, h: 20, cible: { x: 0, y: 2, l: 44, h: 44 } },
  { nom: "TUNER CATEGORIES D",  sorte: "tuner", dalle: "TAMBOUR", dans: "ROUE CATEGORIES",      x: 361, y: 18, l: 10, h: 20, cible: { x: 331, y: 2, l: 44, h: 44 } },
  { nom: "TUNER SOUS-CAT G",    sorte: "tuner", dalle: "TAMBOUR", dans: "ROUE SOUS-CATEGORIES", x: 4,   y: 62, l: 10, h: 20, cible: { x: 0, y: 46, l: 44, h: 44 } },
  { nom: "TUNER SOUS-CAT D",    sorte: "tuner", dalle: "TAMBOUR", dans: "ROUE SOUS-CATEGORIES", x: 361, y: 62, l: 10, h: 20, cible: { x: 331, y: 46, l: 44, h: 44 } },

  /* dalle 2 — la grille et ses deux gouttières */
  { nom: "CHEVRON G",           sorte: "chevron",    dalle: "GRILLE",  x: 14,     y: 196, l: 21,  h: 40, cible: { x: 2, y: 194, l: 44, h: 44 }, mot: "page précédente" },
  { nom: "CHEVRON D",           sorte: "chevron",    dalle: "GRILLE",  x: 340,    y: 196, l: 21,  h: 40, cible: { x: 329, y: 194, l: 44, h: 44 }, mot: "page suivante" },
  { nom: "COMPTE OBJETS",       sorte: "voyant",     dalle: "GRILLE",  x: 4,      y: 240, l: 41,  h: 14, mot: "33", cran: "T1/600" },
  { nom: "COMPTE PAGES",        sorte: "voyant",     dalle: "GRILLE",  x: 330,    y: 240, l: 41,  h: 14, mot: "1/3", cran: "T1/600" },

  /* dalle 3 — le pied */
  { nom: "PARTY TALLY",         sorte: "bouton",     dalle: "PIED",    x: 27.75,  y: 374, l: 40,  h: 40, cible: { x: 25.75, y: 372, l: 44, h: 44 }, mot: "Party Tally", cran: "T1/600" },
  { nom: "TALLY",               sorte: "bouton",     dalle: "PIED",    x: 75.75,  y: 374, l: 40,  h: 40, cible: { x: 73.75, y: 372, l: 44, h: 44 }, mot: "Tally", cran: "T1/600" },
  { nom: "COLLECTEUR",          sorte: "collecteur", dalle: "PIED",    x: 144,    y: 344, l: 87,  h: 48, cible: { x: 144, y: 344, l: 87, h: 48 }, mot: "SEND COLLECTOR", cran: "T1/600" },
  { nom: "PURSE",               sorte: "bouton",     dalle: "PIED",    x: 278.25, y: 369, l: 50,  h: 50, cible: { x: 278.25, y: 369, l: 50, h: 50 }, mot: "Purse", cran: "T1/600" },
  { nom: "SEND VERS",           sorte: "dropdown",   dalle: "PIED",    x: 139.5,  y: 402, l: 96,  h: 40, cible: { x: 139.5, y: 400, l: 96, h: 44 }, mot: "Send to — Backpack", cran: "T1/600" },
  { nom: "RANGEE",              sorte: "rangee",     dalle: "PIED",    x: 4,      y: 452, l: 367, h: 44, cran: "—" },
  { nom: "livre",               sorte: "rond",       dalle: "PIED",    x: 15,     y: 463, l: 22,  h: 22, cible: { x: 4, y: 452, l: 44, h: 44 }, mot: "livre" },
  { nom: "GEAR",                sorte: "porte",      dalle: "PIED",    x: 64,     y: 452, l: 77,  h: 44, cible: { x: 64, y: 452, l: 77, h: 44 }, mot: "Gear", cran: "T2/600" },
  { nom: "SEND",                sorte: "porte",      dalle: "PIED",    x: 149,    y: 452, l: 77,  h: 44, cible: { x: 149, y: 452, l: 77, h: 44 }, mot: "Send", cran: "T2/600" },
  { nom: "BACKPACK",            sorte: "porte",      dalle: "PIED",    x: 234,    y: 452, l: 77,  h: 44, cible: { x: 234, y: 452, l: 77, h: 44 }, mot: "Backpack", cran: "T2/600" },
  /* ⛔ LE `?` EST POSÉ PAR LA COQUILLE, UNE FOIS, SUR TOUTES LES ÉTAPES — jamais par un écran,
     qui pourrait l'oublier (NORMES). Il est AU PLAN parce qu'il occupe une borne de la rangée
     et que sa place compte ; il n'est pas CONSTRUIT ici, et le garde de la bijection doit le
     savoir, sans quoi il accuserait l'écran d'une absence qui est une loi. */
  { nom: "?",                   sorte: "rond",       dalle: "PIED",    x: 338,    y: 463, l: 22,  h: 22, cible: { x: 327, y: 452, l: 44, h: 44 }, mot: "?", coquille: true },
];

/* ── LE FILIGRANE DE LA DALLE 2 ───────────────────────────────────────────────
   🛒 Eric, 2026-09-20, en déposant l'image : *« dans drop, image à mettre en fond, couleurs
   idem backpack, derrière la dalle 2, suggéré discret mais visible »* · *« il faut un rendu
   similaire à Backpack et Gear »*.
   ⭐ MÊME RÔLE, MÊME PLACE ET MÊME RECETTE QUE LE FOND DU SAC : une image qu'on ne tape pas,
   derrière la grille, dont la cote vit AU PLAN. ⛔ Aucun de ces nombres n'est tapé : la
   hauteur est celle de la grille plus un débord égal en haut et en bas, la largeur suit le
   RAPPORT MESURÉ de l'image détourée, et l'abscisse centre le tout sur la dalle.
   ⛔ ET CE N'EST PAS UNE IMAGE, C'EST UN MASQUE. `background: var(--text-soft)` +
   `mask-image` : l'encre est thématique, donc lisible le jour comme la nuit. L'image posée
   telle quelle (elle est NOIRE) s'évanouirait sur le fond de nuit.
   📏 SA MATIÈRE EST MESURÉE SUR CELLE DU SAC, ⛔ pas choisie : `sac-fond.webp` porte une
   médiane d'alpha de 122, une moyenne de 135, un plafond de 214 — un LAVIS à contours plus
   sombres, pas un trait et pas un aplat. La silhouette d'Eric, plate, a été passée au même
   régime : intérieur à 122, contour à 214.
   ⏳ CE QUE J'AI REGARDÉ ET QUI RESTE À TRANCHER PAR ERIC : à ce poids-là il est bien au
   niveau du sac, mais il se LIT moins — le sac porte des sangles et des boucles qui coupent
   toutes les gouttières, là où un marchand centré passe surtout sous la colonne du milieu,
   et la grille de Wares est TOUJOURS pleine (un catalogue n'a pas de case vide).
   🔴 ET LE RAPPORT NE S'ARRONDIT PAS — un garde l'a attrapé à 0,01 près, et il avait raison :
   j'avais écrit `rapport: 1.0817` au plan et calculé la largeur sur le rapport EXACT. Deux
   écrivains pour un nombre, donc un nombre faux le jour où on relit l'autre. ⭐ La seule
   mesure est celle de l'actif — 649 × 600 px — et tout le reste en DÉCOULE. */
const PX = { l: 649, h: 600 };            /* la taille de `wares-fond.webp`, mesurée */
const FOND_H = 228;                       /* la grille (216) plus 6 de débord en haut et en bas */
export const FOND = {
  image: "wares-fond.webp",
  px: PX,
  rapport: PX.l / PX.h,
  h: FOND_H,
  l: FOND_H * (PX.l / PX.h),
  x: (DALLE.l - FOND_H * (PX.l / PX.h)) / 2,
  y: 102,
};

/* ── LA CLEF D'UN ORGANE ──────────────────────────────────────────────────────
   ⭐ Le nom du plan et l'attribut `data-organe` sont DEUX vocabulaires, et cette table est
   la bijection. ⛔ Un garde la relit dans les DEUX sens : une bijection fausse est cohérente,
   et seule la seconde lecture l'attrape. */
export const CLEF_DE = Object.freeze({
  "ROUE CATEGORIES": "roue-categories",
  "ROUE SOUS-CATEGORIES": "roue-sous-categories",
  "LOUPE CATEGORIES": "loupe-categories",
  "LOUPE SOUS-CAT": "loupe-sous-categories",
  "TUNER CATEGORIES G": "tuner-categories-g",
  "TUNER CATEGORIES D": "tuner-categories-d",
  "TUNER SOUS-CAT G": "tuner-sous-categories-g",
  "TUNER SOUS-CAT D": "tuner-sous-categories-d",
  "CHEVRON G": "page-precedente",
  "CHEVRON D": "page-suivante",
  "COMPTE OBJETS": "compte-objets",
  "COMPTE PAGES": "compte-pages",
  "PARTY TALLY": "party-tally",
  "TALLY": "tally",
  "COLLECTEUR": "collecteur",
  "PURSE": "purse",
  "SEND VERS": "send-vers",
  "RANGEE": "rangee",
  "livre": "livre",
  "GEAR": "gear",
  "SEND": "send",
  "BACKPACK": "backpack",
  "?": "aide",
});

/* ── LA SOMME VERTICALE, CALCULÉE ET NON RECOPIÉE ─────────────────────────────
   📐 « Le plancher est défini par construction » (NORMES, Eric 04/09) : la somme s'écrit AVANT
   de dessiner, puis se vérifie sur la page. ⛔ Elle ne se retape pas — elle se calcule depuis
   la table, sans quoi elle dirait « juste » pendant que la table dit autre chose. */
export function sommeVerticale() {
  const dalles = DALLES.reduce((n, d) => n + d.h, 0);
  return dalles + BLEED * (DALLES.length - 1);
}

/** La hauteur qu'une dalle 2 de `n` rangées coûterait. ⭐ C'est CETTE fonction qui a tranché
 *  les quatre rangées : elle rend 232 pour 4 et 288 pour 5, et 5 met la somme à 556. */
export function hauteurGrille(rangees = RANGEES_GRILLE) {
  return REMBOURRAGE_GRILLE * 2 + rangees * JETON.h + (rangees - 1) * ECART;
}
