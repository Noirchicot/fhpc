/* ══ LE PLAN COTÉ DE WARES — les gardes du lot 218 ═════════════════════════════
   Ils tiennent ce que NORMES promet, ⛔ pas ce que le code fait. Chaque assertion se lit
   contre une ancre `equipement-wares-*` de `NORMES.md` ou contre une phrase d'Eric datée.

   🔴 CHAQUE TÉMOIN EST NOMMÉ AVANT D'ÊTRE MESURÉ, et chacun a été éprouvé ROUGE avant
   d'être cru vert — un garde qui ne peut jamais accuser est pire qu'aucun garde.
   ⛔ ET AUCUN NE LIT UN COMMENTAIRE : le sélecteur et la donnée font foi. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(RACINE, "ui", "builder");
const D = await import("../ui/builder/wares-disposition.mjs");
const NORMES = fs.readFileSync(path.join(UI, "NORMES.md"), "utf8");

/* ══ 1 · LE BUDGET VERTICAL ════════════════════════════════════════════════════
   ⭐ TÉMOIN : la somme des trois dalles et des deux line bleeds vaut exactement la scène.
   C'est LE garde du lot : tout le reste du plan a été tranché par lui. */
test("1 · les trois dalles et les deux bleeds font exactement la scène", () => {
  assert.equal(D.sommeVerticale(), D.DALLE.h,
    `⛔ le budget ne tombe plus juste : ${D.sommeVerticale()} pour une scène de ${D.DALLE.h}`);
  assert.equal(D.DALLE.h, 500, "la scène vaut 500 blg (CADRES : 560 dont 500 pour la scène)");
  assert.deepEqual(D.DALLES.map((d) => d.h), [92, 232, 160],
    "⛔ les hauteurs dictées : 92 le tambour, 232 la grille, 160 le pied");
});

/* ⭐ TÉMOIN : les dalles se touchent par un bleed, sans trou ni recouvrement.
   ⛔ Trois hauteurs justes ne disent rien de leur EMPILEMENT — un `y` faux passerait
   sous le garde 1 sans le faire broncher. */
test("2 · chaque dalle commence là où la précédente finit, plus un bleed", () => {
  for (let i = 1; i < D.DALLES.length; i += 1) {
    const avant = D.DALLES[i - 1];
    assert.equal(D.DALLES[i].y, avant.y + avant.h + D.BLEED,
      `⛔ ${D.DALLES[i].nom} ne suit pas ${avant.nom} : attendu ${avant.y + avant.h + D.BLEED}, lu ${D.DALLES[i].y}`);
  }
  assert.equal(D.DALLES[0].y, 0, "la première dalle démarre au haut de la scène");
  const derniere = D.DALLES.at(-1);
  assert.equal(derniere.y + derniere.h, D.DALLE.h, "la dernière dalle finit au bas de la scène");
});

/* ══ 3 · POURQUOI QUATRE RANGÉES ═══════════════════════════════════════════════
   ⭐ TÉMOIN : la fonction qui a tranché rend bien 232 pour quatre et 288 pour cinq,
   et cinq met la somme à 556 — 56 de trop. ⛔ Ce garde ne vérifie pas un goût : il
   refait l'arithmétique qui a fermé la question d'Eric (« 5 rangées SI on a la place »). */
test("3 · cinq rangées ne tiennent pas, et le garde le prouve en chiffres", () => {
  assert.equal(D.hauteurGrille(4), 232, "quatre rangées : 8 + 4×48 + 3×8 + 8");
  assert.equal(D.hauteurGrille(5), 288, "cinq rangées : 8 + 5×48 + 4×8 + 8");
  const aCinq = D.sommeVerticale() - D.hauteurGrille(4) + D.hauteurGrille(5);
  assert.equal(aCinq, 556, "à cinq rangées l'écran demande 556 blg");
  assert.equal(aCinq - D.DALLE.h, 56, "⛔ 56 de trop — c'est ce nombre qui a tranché");
  assert.equal(D.PAR_PAGE, D.COLONNES_GRILLE * D.RANGEES_GRILLE,
    "⛔ le nombre par page est DÉRIVÉ de la grille, jamais écrit à côté d'elle");
  assert.equal(D.PAR_PAGE, 12, "douze jetons par page (Eric, 20/09 : « eh ben 4 rangées alors »)");
  assert.notEqual(D.PAR_PAGE, 15,
    "⛔ Wares dévie de LISTE_PAR_PAGE, et il doit le déclarer — pas le recopier, pas le taire");
});

/* ══ 4 · LES CONSTATS SONT DES CONSTATS ════════════════════════════════════════
   ⭐ TÉMOIN : tout ce que `RENDU_*` annonce se recalcule depuis les pistes. ⛔ Un
   nombre à virgule recopié à la main deviendrait faux en silence le jour où un organe
   changerait de largeur — c'est exactement ce que le sacré n° 3 interdit. */
test("4 · ce que la grille RESTITUE se recalcule, il ne se recopie pas", () => {
  const large = D.COLONNES_GRILLE * D.JETON.l + (D.COLONNES_GRILLE - 1) * D.ECART;
  assert.equal(large, D.RENDU_GRILLE.jetons.l, "3 × 87 + 2 × 8 = 277");
  assert.equal((D.DALLE.l - large) / 2, D.RENDU_GRILLE.gouttiere, "les deux gouttières : (375 − 277) / 2 = 49");
  const haut = D.RANGEES_GRILLE * D.JETON.h + (D.RANGEES_GRILLE - 1) * D.ECART;
  assert.equal(haut, D.RENDU_GRILLE.jetons.h, "4 × 48 + 3 × 8 = 216");
  assert.equal(haut + 2 * D.REMBOURRAGE_GRILLE, D.hauteurGrille(), "la dalle 2 = les jetons + ses deux 8");

  /* la dalle 3 : deux colonnes de côté, ce qui reste une fois la plus large posée au milieu */
  const centre = D.PIED.colonnes[1];
  const cote = (D.DALLE.l - 2 * D.REMBOURRAGE - centre) / 2;
  assert.equal(cote, D.RENDU_PIED.cote.l, "(375 − 2×4 − 96) / 2 = 135,5");
  assert.equal(D.REMBOURRAGE + cote / 2, D.RENDU_PIED.centres.gauche, "le centre gauche tombe à 71,75");
  assert.equal(D.DALLE.l - D.REMBOURRAGE - cote / 2, D.RENDU_PIED.centres.droite, "et le droit à 303,25, symétrique");

  /* la cellule de côté enjambe les rangées 1 à 3 — d'où « entre 2 lignes » (Eric, 20/09) */
  const [r1, g1, r3] = D.PIED.rangees;
  assert.equal(r1 + g1 + r3, D.RENDU_PIED.cote.h, "la cellule de côté : 48 + 8 + 44 = 100");
  const pied = D.DALLES.find((d) => d.nom === "PIED");
  assert.equal(pied.y + D.REMBOURRAGE + D.RENDU_PIED.cote.h / 2, D.RENDU_PIED.centres.y,
    "son centre vertical tombe à 394 — dans l'écart de 8 entre le collecteur et Send to");
  assert.equal(D.PIED.rangees.reduce((n, v) => n + v, 0) + 2 * D.REMBOURRAGE, pied.h,
    "⛔ les pistes du pied doivent faire sa hauteur : 4 + 48 + 8 + 44 + 8 + 44 + 4 = 160");
});

/* ══ 5 · LE PLANCHER TACTILE ═══════════════════════════════════════════════════
   🔒 TÉMOIN : aucune cible sous 44, et aucune cible hors de la dalle. ⛔ Le second est
   le piège payé le 18/09 : `.sac` porte `overflow: hidden`, donc une cible qui sort est
   CLIPPÉE — un garde qui ne lit que la boîte déclarée ne peut pas le voir. */
test("5 · toute cible tient son plancher de 44 ET reste dans la dalle", () => {
  const tapes = new Set(["bouton", "porte", "rond", "collecteur", "dropdown", "chevron", "roue"]);
  for (const o of D.ORGANES) {
    if (!tapes.has(o.sorte)) continue;
    const c = o.cible || o;
    assert.ok(c.h >= D.TOUCH, `⛔ ${o.nom} : cible haute de ${c.h}, le plancher est ${D.TOUCH}`);
    assert.ok(c.l >= D.TOUCH, `⛔ ${o.nom} : cible large de ${c.l}, le plancher est ${D.TOUCH}`);
    assert.ok(c.x >= 0, `⛔ ${o.nom} : sa cible démarre à ${c.x}, hors de la dalle — elle serait clippée`);
    assert.ok(c.x + c.l <= D.DALLE.l, `⛔ ${o.nom} : sa cible finit à ${c.x + c.l}, hors des ${D.DALLE.l}`);
  }
});

/* ⭐ TÉMOIN : deux cibles VOISINES ne se recouvrent jamais. ⛔ Un plancher tenu par chaque
   organe pris SEUL ne dit rien de la paire — deux cibles de 44 côte à côte dans 90 blg se
   mordent, et c'est le doigt qui le découvre.
   🔴 ET CE GARDE A MORDU SUR SA PREMIÈRE VERSION, À RAISON DE SON CÔTÉ ET À TORT DU MIEN :
   il accusait les tuners de recouvrir leur roue. Ils le font, et c'est leur place — un tuner
   est le contrôle de la roue, posé sur son bord. ⛔ La correction n'est PAS de lever le garde :
   c'est de lui apprendre la différence entre VOISIN et ENFANT, et de lui donner, pour les
   enfants, l'assertion qui peut encore accuser — un enfant qui sort de son hôte. */
test("6 · deux cibles voisines ne se mordent pas, et un enfant reste chez son hôte", () => {
  const boites = D.ORGANES.filter((o) => o.cible).map((o) => ({ nom: o.nom, dans: o.dans, ...o.cible }));
  const parente = (a, b) => a.dans === b.nom || b.dans === a.nom;
  for (let i = 0; i < boites.length; i += 1) {
    for (let j = i + 1; j < boites.length; j += 1) {
      const a = boites[i], b = boites[j];
      if (parente(a, b)) continue;
      const seCroisent = a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;
      assert.ok(!seCroisent, `⛔ les cibles de ${a.nom} et ${b.nom} se recouvrent`);
    }
  }
  /* l'assertion qui garde son mordant sur les paires qu'on vient d'exempter */
  for (const o of boites.filter((x) => x.dans)) {
    const h = boites.find((x) => x.nom === o.dans) || D.ORGANES.find((x) => x.nom === o.dans);
    assert.ok(h, `⛔ ${o.nom} déclare l'hôte « ${o.dans} », qui n'existe pas`);
    const c = h.cible || h;
    assert.ok(o.y >= c.y && o.y + o.h <= c.y + c.h,
      `⛔ ${o.nom} sort verticalement de ${o.dans} — il serait clippé`);
  }
});

/* ══ 7 · LA BIJECTION, LUE DANS LES DEUX SENS ══════════════════════════════════
   ⭐ TÉMOIN : chaque organe du plan a sa clef, et chaque clef a son organe. ⛔ Une
   bijection fausse est COHÉRENTE : seule la seconde lecture, en sens inverse, l'attrape. */
test("7 · plan et clefs se répondent dans les deux sens", () => {
  for (const o of D.ORGANES) {
    assert.ok(D.CLEF_DE[o.nom], `⛔ ${o.nom} est au plan et n'a pas de clef`);
  }
  const noms = new Set(D.ORGANES.map((o) => o.nom));
  for (const nom of Object.keys(D.CLEF_DE)) {
    assert.ok(noms.has(nom), `⛔ la clef « ${nom} » ne désigne aucun organe du plan`);
  }
  const clefs = Object.values(D.CLEF_DE);
  assert.equal(new Set(clefs).size, clefs.length, "⛔ deux organes partagent une clef");
  assert.equal(new Set(D.ORGANES.map((o) => o.nom)).size, D.ORGANES.length, "⛔ deux organes partagent un nom");
});

/* ⭐ TÉMOIN : chaque organe vit dans la dalle qu'il déclare. ⛔ Un `y` juste dans une
   dalle fausse est la faute du 19/09 sur le sac — la grille peignait 104 blg trop bas. */
test("8 · chaque organe tient dans la dalle qu'il nomme", () => {
  const parNom = new Map(D.DALLES.map((d) => [d.nom, d]));
  for (const o of D.ORGANES) {
    const d = parNom.get(o.dalle);
    assert.ok(d, `⛔ ${o.nom} déclare la dalle « ${o.dalle} », qui n'existe pas`);
    const c = o.cible || o;
    assert.ok(c.y >= d.y, `⛔ ${o.nom} démarre à ${c.y}, au-dessus de sa dalle (${d.y})`);
    assert.ok(c.y + c.h <= d.y + d.h, `⛔ ${o.nom} finit à ${c.y + c.h}, sous sa dalle (${d.y + d.h})`);
  }
});

/* ══ 9 · LE PIED DIT LE TRIANGLE ═══════════════════════════════════════════════
   ⭐ TÉMOIN : les trois portes sont Gear, Send, Backpack — dans cet ordre, et Wares
   n'ouvre pas une porte vers lui-même. ⛔ `Equipment` est le nom de l'ÉTAPE. */
test("9 · le pied dit Gear · Send · Backpack, et rien d'autre", () => {
  const portes = D.ORGANES.filter((o) => o.sorte === "porte");
  assert.deepEqual(portes.map((o) => D.CLEF_DE[o.nom]), [...D.PORTES],
    "⛔ le pied de Wares : Gear · Send · Backpack (Eric, 20/09)");
  assert.deepEqual([...D.PORTES].sort(), ["backpack", "gear", "send"], "aucune porte vers Wares lui-même");
  assert.ok(!D.PORTES.includes("equipment"), "⛔ « Equipment » est le nom de l'ÉTAPE, jamais d'un écran");
  /* les trois portes ont la même boîte : une rangée de contrôles ne fait pas de favori */
  const largeurs = new Set(portes.map((o) => o.l));
  assert.equal(largeurs.size, 1, "⛔ les trois portes n'ont pas la même largeur");
  assert.equal(portes[0].l, D.RANGEE.porte.l, "et c'est celle que le plan déclare");
});

/* ══ 10 · LES EXCEPTIONS SE NOMMENT ════════════════════════════════════════════
   ⭐ TÉMOIN : les deux écarts qui dévient du 8 sacré existent bien dans le plan ET dans
   le corpus. ⛔ Une exception qui ne vit que dans le code est une exception qui n'existe
   pas — et une règle orale n'existe pas non plus. */
test("10 · les deux écarts qui dévient du 8 sont nommés dans NORMES", () => {
  assert.equal(D.ECART, 8, "l'écart par défaut est celui du sacré n° 3");
  assert.equal(D.ECART_ETAGES, 4, "l'écart entre les deux étages du tambour (Eric, 20/09 : « 4 blg »)");
  assert.equal(D.REMBOURRAGE, 4, "le rembourrage d'une dalle de Wares");
  assert.equal(D.REMBOURRAGE_GRILLE, 8, "⛔ sauf la dalle 2 : son croquis du 19/09 fixe ses 8");
  for (const ancre of ["equipement-wares-trois-dalles", "equipement-wares-swipe-pagine",
                       "equipement-wares-douze-par-page", "equipement-wares-rembourrage-quatre",
                       "equipement-wares-jeton-et-x2", "equipement-la-fiche-du-catalogue-est-un-x2",
                       "equipement-wares-bourse-et-tally-centres", "equipement-wares-pied-triangle"]) {
    assert.ok(NORMES.includes(ancre), `⛔ la loi « ${ancre} » n'est pas dans NORMES.md`);
  }
});

/* ══ 11 · LA ROUE PORTE CINQ CRANS ═════════════════════════════════════════════
   ⭐ TÉMOIN : le budget de la piste est exactement un dominant et quatre secondaires.
   ⛔ Un cinquième cran qui ne tiendrait pas se verrait au banc, pas ici — mais une piste
   dont le budget ne tombe plus juste se verra ICI, avant le banc. */
test("11 · la piste du tambour tient un dominant et quatre secondaires", () => {
  assert.equal(D.ROUE.dominant + 4 * D.ROUE.secondaire, D.ROUE.budget, "71 + 4 × 57 = 299");
  assert.ok(D.ROUE.budget <= D.ROUE.piste, "⛔ le budget déborde de la piste");
  assert.equal(D.ROUE.pas, D.ROUE.secondaire + D.ECART, "le pas d'un cran : 57 + 8");
  const etages = D.ORGANES.filter((o) => o.sorte === "roue");
  assert.equal(etages.length, 2, "⛔ le tambour de Wares a DEUX étages (Eric, 20/09)");
  assert.equal(etages[1].y - (etages[0].y + etages[0].h), D.ECART_ETAGES,
    "et ils sont séparés par les 4 blg dictés, pas par le 8 par défaut");
  /* chaque étage a ses deux tuners — un étage muet serait un étage qu'on ne peut pas tourner */
  assert.equal(D.ORGANES.filter((o) => o.sorte === "tuner").length, 2 * etages.length,
    "⛔ il manque une paire de tuners : un étage ne se tourne pas");
});
