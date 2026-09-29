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

/* ⭐ LOT 315 — LE PIED DE WARES EST CELUI DE PACK : ses cotes se LISENT dans le plan du sac. */
import { ORGANES as ORGANES_DU_SAC } from "./sac-disposition.mjs?v=904";

/* ── LA SCÈNE ─────────────────────────────────────────────────────────────── */
/* ⚖️ LOT 275 — 495 ET NON PLUS 500. Sur l'étape Équipement, la case « Equipment · 8 · Wares » du
   belt porte trois lignes et le belt mesure 65 (📏 mesuré, 420 × 860) : la scène n'offre que 495, et
   Wares, coté 500, se faisait rogner de 4,8 blg en bas (le bord du pied, 0,7 des trois portes).
   ⚖️ Eric, 2026-09-25 : « tu peux récupérer 4 entre les tambours, et après tu récupères là où ça
   impacte le moins » — puis « a ». ⭐ 4 blg entre les tambours (8 → 4), 1 blg au rembourrage BAS
   du pied (4 → 3). Wares tient dans ce que la scène lui donne. */
export const DALLE = { l: 375, h: 495 };

/* ⚖️ L'EXCEPTION NOMMÉE, ET ELLE EST UNIQUE (NORMES `equipement-wares-rembourrage-quatre`) :
   le rembourrage d'une dalle vaut 4, l'écart entre deux organes garde le 8 du sacré n° 3.
   ⛔ Un écart porte le rythme entre deux organes ; un rembourrage ne sépare rien, il borde. */
export const REMBOURRAGE = 4;
/* ⚖️ LOT 275 — L'UNIQUE BLG PRIS AU PIED : son rembourrage BAS vaut 3 (Eric, 25/09 : « là où ça
   impacte le moins »). ⭐ C'est un bord, sous la rangée des portes — ni un organe, ni un écart
   entre deux organes, ni une cible ne bouge. */
export const REMBOURRAGE_PIED_BAS = 3;
export const ECART = 8;
export const TOUCH = 44;
export const JETON = { l: 87, h: 48 };

/* ⚖️ LE LINE BLEED entre deux dalles — le fond passe entre (CADRES §8 bis). ⛔ C'est la
   COLONNE qui l'écrit, jamais une dalle pour sa voisine. */
export const BLEED = 8;

/* ── LES TROIS DALLES ─────────────────────────────────────────────────────────
   ⭐ 92 + 8 + 228 + 8 + 159 = 495, PILE (lot 275). Le garde `wares-budget` refait cette somme.
   ⚖️ LOT 274 — Eric, 2026-09-25 : *« 4-40-8-40-4 »* pour les deux tambours (avant 4-40-4-40-4 = 92),
   puis *« les non zoomées tu fais les calculs pour que ça colle — idem pour les espaces »*. ⭐ Les
   4 blg gagnés par le tambour sont rendus par le rembourrage de la grille (8 → 6, voir plus bas). */
export const DALLES = Object.freeze([
  { nom: "TAMBOUR", y: 0,   h: 92,  mot: "les deux étages de la roue" },
  { nom: "GRILLE",  y: 100, h: 228, mot: "les douze jetons et les deux gouttières" },
  { nom: "PIED",    y: 336, h: 159, mot: "les Tally, le collecteur, la bourse, Send to, la rangée" },
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
  /* 🔴 LA CALE — ET ELLE VAUT 129, ⛔ PAS 137. Eric, 2026-09-20 : *« problème de centrage sur
     les crans de droite, et ça bloque »*.
     📏 MESURÉ AU NAVIGATEUR, et c'est une identité, pas un goût : le ruban est un flex qui pose
     un ÉCART entre la cale et le premier cran, exactement comme entre deux crans. La cale n'est
     donc pas la moitié du vide — c'est la moitié du vide MOINS cet écart.
     ⭐ CE QUE L'IDENTITÉ DOIT RENDRE : `cale + écart + tuile / 2 = piste / 2`, sans quoi
     `scrollLeft = pas × k` — l'invariant de tout le tambour — désigne le mauvais point.
     À 137 il désignait `8 + pas × k` : le rattrapage venait du `scroll-snap`, donc INVISIBLE
     tant qu'il restait de la course, et faux dès qu'il n'en restait plus. ⛔ Un organe qui n'est
     juste que grâce à un correcteur n'est pas juste : il attend le jour où le correcteur
     n'a plus de marge. */
  cale: 129,
};

/* ⚖️ LOT 275 — IL REVIENT À 4. Eric, 25/09, devant les 5 blg rognés sous le belt de 65 : « tu peux
   récupérer 4 entre les tambours » (option a). ⚠️ Les deux cibles de 44 se retouchent (2 → 46,
   46 → 90) : c'est le prix, et il est choisi. Ce qui suit est l'état du lot 274, gardé pour mémoire.
   🗄️ L'ÉCART ENTRE LES DEUX ÉTAGES VALAIT 8 — Eric, 2026-09-25 : *« pour garder la cible tactile
   propre, mets 8 blg entre les tambours »*, puis *« 4-40-8-40-4 »*. 🗄️ Il valait 4 depuis le 20/09
   (« 4 blg », une exception au 8 du sacré n° 3) : à 4, les deux cibles de 44 se TOUCHAIENT
   (2 → 46 et 46 → 90). ⭐ À 8, elles gardent 4 blg entre elles (2 → 46, 50 → 94) — et l'écart
   rejoint le 8 de la maison. */
export const ECART_ETAGES = 4;

/* ── DALLE 2 · LA GRILLE ──────────────────────────────────────────────────────
   ⚖️ QUATRE RANGÉES DE TROIS = DOUZE (NORMES `equipement-wares-douze-par-page`). ⛔ Ce n'est
   pas un goût : à cinq rangées l'écran demande 556 blg pour une scène qui en offre 500.
   ⚖️ LE REMBOURRAGE DE CETTE DALLE-CI VAUT 6 — AMENDÉ LE 25/09. Le croquis d'Eric du 19/09
   disait 8 (« 8 au-dessus du premier jeton et 8 sous le dernier ») ; le 25/09, en passant les
   tambours à 4-40-8-40-4, il a dit *« idem pour les espaces — tu fais les calculs pour que ça
   colle »*. ⭐ Le tambour prend 4 blg de plus ; la grille les rend ici (2 en haut, 2 en bas) —
   les jetons (48) et leurs écarts (8) ne bougent pas, et la scène reste à 500. */
export const PAR_PAGE = 12;
export const COLONNES_GRILLE = 3;
export const RANGEES_GRILLE = 4;
export const REMBOURRAGE_GRILLE = 6;

/* les cotes que la grille RESTITUE — ⛔ constats, jamais des valeurs posées :
   largeur des jetons  3 × 87 + 2 × 8 = 277, dans 375 → gouttière (375 − 277) / 2 = 49
   hauteur des jetons  4 × 48 + 3 × 8 = 216, + 2 × 6 de rembourrage = 228 */
export const RENDU_GRILLE = Object.freeze({
  jetons: { l: 277, h: 216 },
  gouttiere: 49,
  colonnes: [49, 144, 239],
  rangees: [106, 162, 218, 274],   /* 100 (la dalle) + 6, puis + 56 */
});

/* ── LE JOUR ENTRE DEUX PLAQUES ───────────────────────────────────────────────
   ⚖️ LA LOI DU 19/09 (`budget-le-jour-est-a-la-plaque-ce-que-la-gouttiere-est-a-la-tuile`) :
   *« le jour se DÉDUIT du rapport de la tuile à sa gouttière, ⛔ il ne se choisit pas »* —
   `jour / plaque = écart / tuile`. Dans le sac : `jour / 375 = 8 / 57 ⇒ 52,63`.
   🔴 ET LA PLAQUE EST **LA DALLE ENTIÈRE**, ⛔ PAS SES JETONS — Eric, 2026-09-21, après m'avoir
   montré son croquis deux fois : *« je veux que TOUTE LA DALLE se déplace vers la droite ou la
   gauche et que la dalle suivante apparaisse dans l'écran ; tout tu me le fais mais À L'INTÉRIEUR
   d'une dalle »*. J'avais fait glisser les 12 jetons dans la colonne du milieu *(277)* pendant que
   le cadre restait ; c'est le CADRE qui doit partir, avec sa matière, son liseré, ses gouttières
   et son filigrane. 📏 La plaque vaut donc **375** — la scène — et le jour `375 × 8 / 57 = 52,63`,
   ⭐ exactement celui du sac, parce que c'est exactement le même objet.

   ⚠️ ET JE DIS CE QUI CHANGE, parce que la RAISON de la loi ne s'applique pas ici. Dans le sac,
   le jour doit tomber juste **parce qu'un verrou lie la plaque au ruban** : un doigt qui parcourt
   une tuile doit parcourir exactement une plaque, sinon le suiveur décale. ⛔ Wares n'a **pas** de
   verrou — Eric, 21/09 : *« la dalle de Wares ne sera pas swipable car elle a plusieurs pages »*.
   ⭐ On garde donc la FORME de la loi, pas son obligation : les deux écrans restent la même image
   à deux échelles, et le jour ne devient pas un nombre choisi à la main. */
export const JOUR = Math.round(DALLE.l * (ECART / ROUE.tuile) * 100) / 100;

/* ── DALLE 3 · LE PIED — ⚖️ LOT 315 : CELUI DE PACK, ORGANE POUR ORGANE ───────────
   ⚖️ Eric, 2026-09-27, mot pour mot : *« Harmonise le pied de page pack et wares, prends pack comme
   modèles, déplace encumbrance sous l'or dans wares »*.
   ⭐ LES COTES NE SE RECOPIENT PAS, ELLES SE PRENNENT : le collecteur, la bourse, les deux Tally,
   `Send to` et la lune sont LUS dans le plan du sac (`sac-disposition.mjs`, généré par
   `backpack_gen.py`). Le jour où Pack bouge, Wares bouge avec lui — ⛔ deux plans qui disent la
   même cote sont deux cotes, et la seconde ment dès le premier réglage.
   🗄️ CE QU'IL REMPLACE (`equipement-wares-bourse-et-tally-centres`, 20/09) : trois colonnes
   `1fr | 96 | 1fr`, les Tally et la bourse CENTRÉS dans les cellules de côté. Eric a pris Pack
   pour modèle, et Pack pose ses organes sur SES cotes — les Tally sur la rangée de `Send to`, à
   sa gauche ; la lune au-dessus ; la bourse à droite du collecteur.
   ⛔ ET LE SACRÉ N° 3 NE CÈDE PAS POUR AUTANT : la feuille ne pose toujours aucun `left`. Elle
   trace une grille dont les LIGNES sont les bords des organes du plan (`pistesDuPied`) — chaque
   boîte tombe sur une grille, et la grille se déduit de la table. */
const DU_SAC = Object.freeze(Object.fromEntries(ORGANES_DU_SAC.map((o) => [o.nom, o])));
/** un organe du pied de Pack, pris tel quel et rangé dans la dalle du pied de Wares */
function dePack(nom) {
  const o = DU_SAC[nom];
  if (!o) throw new Error(`wares-disposition : « ${nom} » n'est pas au plan du sac`);
  const { dans, ...reste } = o;
  return { ...reste, dalle: "PIED" };
}

/* ── LA RANGÉE DU PIED ────────────────────────────────────────────────────────
   ⚖️ LOT 311 — LES TROIS CARRÉS, DANS LES TROIS ÉCRANS (NORMES `equipement-portes-carrees`).
   Eric, 27/09, mot pour mot : *« Parfait je valide les 3. Dans les 3 écrans. Tu gardes le bouton
   send toujours centré. Tu dégages le livre qui n'a pas d'utilité dans équipement. Tu places les
   3 carrés répartis équitablement à gauche de send »*, puis *« Quand on est sur l'écran en
   question le bouton est grisé »*.
   🗄️ Ce qu'elle remplace : `Gear · Send · Backpack` (le triangle du 20/09) et le livre à gauche.
   ⭐ `Send` garde sa cote (77) et reste CENTRÉ sur la dalle ; les trois carrés — Gear · Pack ·
   Gear, le même ordre sur les trois écrans — se répartissent à sa gauche, le `?` reste à droite.
   Le carré de Wares est au plan comme les deux autres : c'est l'ÉTAT qui le grise.
   📐 « RÉPARTIS ÉQUITABLEMENT » SE MESURE ENTRE LES DESSINS : de la marge (4) au bord de Send,
   trois dessins de 40 et QUATRE gouttières égales — la formule de `R_gen.py` et de
   `backpack_gen.py`, recopiée ici parce que ce plan est tenu à la main, ⛔ jamais ses résultats.
   ⛔ CE PLAN NE POSE RIEN : c'est la grille du pied (`shell.css`, `[data-pied="equipement"]`)
   qui range la rangée. Ces cotes disent ce qu'elle doit RENDRE — un garde les relit. */
export const RANGEE = { l: 367, h: TOUCH, borne: TOUCH, porte: { l: 77, h: TOUCH }, carre: { l: 40, h: 40 }, rond: 22 };
/* les portes du pied, dans l'ordre de lecture : les trois carrés, puis Send */
export const PORTES = Object.freeze(["gear", "backpack", "wares", "send"]);
const Y_RANGEE = 448;
const X_SEND = (DALLE.l - RANGEE.porte.l) / 2;
const G_CARRES = (X_SEND - REMBOURRAGE - 3 * RANGEE.carre.l) / 4;
/** un carré du pied : son dessin (40) et sa cible (44), déduits de son rang */
function carre(nom, mot, rang) {
  const x = REMBOURRAGE + G_CARRES + rang * (RANGEE.carre.l + G_CARRES);
  const y = Y_RANGEE + (TOUCH - RANGEE.carre.h) / 2;
  return { nom, sorte: "porte-carree", dalle: "PIED", x, y, l: RANGEE.carre.l, h: RANGEE.carre.h,
           cible: { x: x - (TOUCH - RANGEE.carre.l) / 2, y: Y_RANGEE, l: TOUCH, h: TOUCH }, mot, cran: "T0/600" };
}

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

  /* dalle 2 — la grille, sa piste de plaques et ses deux gouttières */
  /* ⚖️ LA PISTE EST LA FENÊTRE DES PLAQUES — l'organe que le tambour MÈNE (Eric, 19/09 :
     *« ils sont liés »*). ⭐ Sa boîte est exactement celle des jetons : c'est la place d'UNE
     plaque, et c'est ce qui fait qu'à l'arrêt on n'en voit qu'une. ⛔ Aucune cible : on ne la
     touche pas — le geste appartient au tambour, jamais à elle. */
  { nom: "PISTE",               sorte: "piste",      dalle: "GRILLE",  x: RENDU_GRILLE.gouttiere, y: RENDU_GRILLE.rangees[0], l: RENDU_GRILLE.jetons.l, h: RENDU_GRILLE.jetons.h },
  { nom: "CHEVRON G",           sorte: "chevron",    dalle: "GRILLE",  x: 14,     y: 194, l: 21,  h: 40, cible: { x: 2, y: 192, l: 44, h: 44 }, mot: "page précédente" },
  { nom: "CHEVRON D",           sorte: "chevron",    dalle: "GRILLE",  x: 340,    y: 194, l: 21,  h: 40, cible: { x: 329, y: 192, l: 44, h: 44 }, mot: "page suivante" },
  { nom: "COMPTE OBJETS",       sorte: "voyant",     dalle: "GRILLE",  x: 4,      y: 238, l: 41,  h: 14, mot: "33", cran: "T1/600" },
  { nom: "COMPTE PAGES",        sorte: "voyant",     dalle: "GRILLE",  x: 330,    y: 238, l: 41,  h: 14, mot: "1/3", cran: "T1/600" },

  /* dalle 3 — le pied, ⚖️ LOT 315 : les organes de Pack, lus dans SON plan (voir `dePack`) */
  dePack("LUNE"),
  dePack("PARTY TALLY"),
  dePack("TALLY"),
  dePack("COLLECTEUR"),
  dePack("PURSE"),
  /* ⚖️ LE MONTANT EST UN VOYANT POSÉ **SUR** LA BOURSE — Eric, 2026-09-21 : *« la bourse
     toujours pas le montant posé dessus »*. ⭐ Même boîte que la bourse, `dans: "PURSE"` : le
     nombre se lit DANS l'image, comme une pièce dessus. ⛔ AUCUNE CIBLE : on ne le tape pas.
     ⭐ LOT 315 — SA BOÎTE EST CELLE DE LA BOURSE DE PACK, ⛔ jamais retapée. */
  { ...(({ x, y, l, h }) => ({ x, y, l, h }))(DU_SAC.PURSE), nom: "MONTANT", sorte: "voyant", dalle: "PIED", dans: "PURSE", mot: "0 gp", cran: "T1/600" },
  /* ⚖️ L'ENCOMBREMENT, SOUS L'OR — Eric, 27/09 : *« déplace encumbrance sous l'or dans wares »*
     (et déjà au lot 307 : *« déplacer encumbrance sous purse »*). ⭐ AUCUN NOMBRE TAPÉ, tout se
     DÉDUIT de Pack :
       · centré sous la bourse — son axe est celui de la bourse ;
       · aussi large que possible sans mordre `Send to` : sa borne gauche est la cible du dropdown
         plus un rembourrage (4), et la droite lui est symétrique autour de l'axe ;
       · centré en hauteur dans la BANDE LIBRE entre le bas de la bourse et la rangée du bas ;
       · deux lignes de 14 au plus (« Encumbrance : 63.2 lb · 1 without weight » ne tient pas
         sur une — le défaut relevé au lot 307).
     ⛔ AUCUNE CIBLE : on le lit, on ne le tape pas. */
  (() => {
    const purse = DU_SAC.PURSE, envoi = DU_SAC["SEND VERS"], rangee = DU_SAC.RANGEE;
    const axe = purse.x + purse.l / 2;
    const gauche = envoi.cible.x + envoi.cible.l + REMBOURRAGE;
    const h = 28;
    const bas = purse.y + purse.h;
    return { nom: "ENCOMBREMENT", sorte: "voyant", dalle: "PIED", x: gauche, y: bas + (rangee.y - bas - h) / 2,
             l: 2 * (axe - gauche), h, mot: "Encumbrance : 0 lb", cran: "T1/600" };
  })(),
  dePack("SEND VERS"),
  { nom: "RANGEE",              sorte: "rangee",     dalle: "PIED",    x: 4,      y: Y_RANGEE, l: 367, h: 44, cran: "—" },
  carre("GEAR", "Gear", 0),
  carre("BACKPACK", "Pack", 1),
  carre("WARES", "Wares", 2),
  { nom: "SEND",                sorte: "porte",      dalle: "PIED",    x: X_SEND, y: Y_RANGEE, l: 77,  h: 44, cible: { x: X_SEND, y: Y_RANGEE, l: 77, h: 44 }, mot: "Send", cran: "T2/600" },
  /* ⛔ LE `?` EST POSÉ PAR LA COQUILLE, UNE FOIS, SUR TOUTES LES ÉTAPES — jamais par un écran,
     qui pourrait l'oublier (NORMES). Il est AU PLAN parce qu'il occupe une borne de la rangée
     et que sa place compte ; il n'est pas CONSTRUIT ici, et le garde de la bijection doit le
     savoir, sans quoi il accuserait l'écran d'une absence qui est une loi. */
  { nom: "?",                   sorte: "rond",       dalle: "PIED",    x: 338,    y: 459, l: 22,  h: 22, cible: { x: 327, y: 448, l: 44, h: 44 }, mot: "?", coquille: true },
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
  /* ⭐ LOT 274 — SE DÉDUIT DE LA GRILLE, ⛔ il était écrit en dur (102) : la grille a bougé de 4
     (le tambour à 4-40-8-40-4), et un `y` recopié serait resté en arrière. Le fond déborde
     autant en haut qu'en bas des jetons. */
  y: DALLES[1].y + REMBOURRAGE_GRILLE - (FOND_H - RENDU_GRILLE.jetons.h) / 2,
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
  "LUNE": "lune",
  "PARTY TALLY": "party-tally",
  "TALLY": "tally",
  "ENCOMBREMENT": "encombrement",
  "COLLECTEUR": "collecteur",
  "PISTE": "piste",
  "PURSE": "purse",
  "MONTANT": "montant",
  "SEND VERS": "send-vers",
  "RANGEE": "rangee",
  "BACKPACK": "backpack",
  "WARES": "wares",
  "GEAR": "gear",
  "SEND": "send",
  "?": "aide",
});

/* ── LA GRILLE DU PIED, DÉDUITE DU PLAN (lot 315) ─────────────────────────────
   ⭐ LES LIGNES DE LA GRILLE SONT LES BORDS DES ORGANES — chaque boîte (la CIBLE si l'organe en a
   une, sinon son dessin) apporte ses deux bords sur chaque axe ; les bords de la dalle ferment la
   grille. Un organe s'étend alors d'une ligne à une autre, sans qu'un seul `left` s'écrive.
   ⛔ LES ENFANTS DE LA RANGÉE N'Y ENTRENT PAS : les trois carrés, `Send` et le `?` sont rangés par la
   grille partagée des rangées (`[data-pied="equipement"]`, shell.css). La règle se lit dans la
   DONNÉE, pas dans une liste de noms : un organe dont la boîte tient dans celle de la rangée est
   son enfant.
   @returns {{ organes: object[], colonnes: number[], rangees: number[] }} — `colonnes` et
   `rangees` sont les LIGNES, en blg, relatives à la dalle du pied (0 → 375, 0 → 159). */
export function pistesDuPied() {
  const dalle = DALLES.find((d) => d.nom === "PIED");
  const rangee = ORGANES.find((o) => o.nom === "RANGEE");
  const boiteDe = (o) => o.cible || o;
  const dansLaRangee = (o) => {
    const b = boiteDe(o);
    return o !== rangee && b.x >= rangee.x && b.y >= rangee.y &&
      b.x + b.l <= rangee.x + rangee.l && b.y + b.h <= rangee.y + rangee.h;
  };
  const organes = ORGANES.filter((o) => o.dalle === "PIED" && o.coquille !== true && !dansLaRangee(o));
  const lignes = (bords) => [...new Set(bords.map((v) => Math.round(v * 1000) / 1000))].sort((a, b) => a - b);
  const colonnes = lignes([0, DALLE.l, ...organes.flatMap((o) => { const b = boiteDe(o); return [b.x, b.x + b.l]; })]);
  const rangees = lignes([0, dalle.h, ...organes.flatMap((o) => { const b = boiteDe(o); return [b.y - dalle.y, b.y + b.h - dalle.y]; })]);
  return { organes, colonnes, rangees };
}

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
