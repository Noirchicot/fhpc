/* ══ LE GARDE DES LISTES — LE 15 AU SOCLE ════════════════════════════════

   CE QU'IL EXISTE POUR EMPÊCHER, ET C'EST MESURÉ : la règle d'Eric du 23/08
   — *« 15 items glissables max, page non scrollable, flèches horizontales,
   collecteurs juste en dessous. Donc pour la liste des sorts niveau 1 on
   fera ça, pour les maîtrises idem »* — est une règle du PRODUIT ENTIER.
   Or le nombre ne vivait QUE dans `ui/builder/equipment-step.mjs`, sous le
   nom `CASES_PAR_PAGE`, avec zéro emploi ailleurs et zéro test. Sorts,
   Dons, Compétences et Outils ne la connaissaient pas : le premier de ces
   écrans à se construire pouvait poser 12 ou 20, et AUCUNE suite n'aurait
   rougi.

   ⭐ LE MODÈLE COPIÉ EST `tests/decor.test.mjs`, ET C'EST SA PAIRE QUI FAIT
   LE TRAVAIL :
     · test 1 — LA VALEUR : le défaut vaut 15, et il n'est déclaré qu'une
       fois dans tout `ui/` ;
     · test 2 — L'ABSENCE DE RECOPIE : ⛔ aucun littéral `15` ne sert de
       taille de page ailleurs dans `ui/`.
   C'est le SECOND qui interdit de réécrire le nombre en dur — exactement ce
   que « les dalles lisent leur voile, JAMAIS un littéral » fait pour 35 %.

   ⚖️ CE QU'IL N'AFFIRME PAS, ET C'EST DÉLIBÉRÉ (Eric, 2026-08-26 : *« c'est
   pas une dictature, on fait ça par défaut »*) :
     ⛔ jamais « tous les écrans emploient 15 ». Un écran qui dévie passe SON
     nombre en argument, explicitement, et le garde reste muet — c'est
     éprouvé plus bas, sur fixture (« ⚔️ le défaut n'est pas un mur »).

   🔴 ET DEUX CHOSES QU'IL NE DIRA JAMAIS, parce qu'elles tomberaient le jour
   où Eric fait ce qu'il a prévu :
     ⛔ « une étagère fait au plus trois pages ». Le 35 par étagère est une
       CIBLE DE DÉCOUPE, pas un plafond de données — *« un jour y'aura plus
       que 35 s'il y a un homebrew ou de l'équipement en plus, c'est
       prévu »* (23/08) ;
     ✅ `pages = ceil(objets ÷ 15)`, TOUJOURS, sans plafond — éprouvé ici à
       200 objets, 14 pages, sans que rien ne bronche.

   🔴 SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS TOUTE SEULE : il lit la
   SOURCE. Il prouve qu'aucun 15 n'est recopié dans `ui/*.mjs` ; il ne prouve
   pas qu'une page RENDUE porte quinze jetons — ça, c'est la règle §0
   « Google Headless », et c'est `tests/tambour-equipement.test.mjs` (qui
   compte les `.grille-case` du nœud rendu) plus la mesure au navigateur qui
   s'en chargent. Deux regards, pas un. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadSources, findForbidden, stripComments } from "./source-scan.mjs";
import { LISTE_PAR_PAGE, pageDeListe } from "../ui/builder/normes.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui");
const SOCLE = path.join(UI, "builder", "normes.mjs");

/* ══ 1 — LA VALEUR DU DÉFAUT ══════════════════════════════════════════════
   Comme le test 2 de `decor.test.mjs` pour les trois voiles : on affirme le
   NOMBRE ratifié, pour que le changer demande de rouvrir NORMES.md §5. */

test("1 — le défaut de page vaut 15 (NORMES.md §5, Eric 2026-08-23)", () => {
  assert.equal(LISTE_PAR_PAGE, 15,
    "15 jetons par page, en rangées de 3 — le budget vertical de §1 quater en dépend " +
    "(5 × 48 + 4 × 8 = 272 px, et la page entière tient à 508 sur les 553 de Safari)");
});

test("1 bis — le nombre n'est déclaré QU'UNE FOIS dans ui/, et c'est au socle", () => {
  const sources = loadSources([UI], ROOT);
  const declarations = sources
    .filter((s) => /LISTE_PAR_PAGE\s*=\s*\d+/.test(s.text))
    .map((s) => s.name);
  assert.deepEqual(declarations, ["ui/builder/normes.mjs"],
    "une deuxième déclaration serait une deuxième source de vérité, libre de diverger");
  /* Et le fichier dit bien 15 — la valeur importée ci-dessus pourrait venir
     d'un calcul ; ici c'est le texte du socle qu'on lit. */
  assert.match(stripComments(fs.readFileSync(SOCLE, "utf8")), /export const LISTE_PAR_PAGE = 15;/);
});

/* ══ 2 — ⛔ L'ABSENCE DE RECOPIE ══════════════════════════════════════════
   LE CŒUR DU GARDE. Les formes que prend un « 15 » recopié en taille de
   page, chacune nommée — un rouge doit DIRE quoi corriger.

   ⚠️ POURQUOI DES MOTIFS ET PAS UN `grep 15` : `ui/` porte des dizaines de
   15 parfaitement légitimes — les dates (2026-08-15), le tableau standard
   (`[15, 14, 13, 12, 10, 8]`), l'échelle des fantômes (`1.15`), le seuil du
   relevé (« aucun des dix n'atteint 15 »). Un garde qui crie au loup se
   fait désactiver. Ce qui est traqué, c'est le 15 EN POSITION DE TAILLE DE
   PAGE, et rien d'autre. */

export const RECOPIES_DU_QUINZE = [
  [/\b[\w ]*(par[_ ]?page|page[_ ]?size|per[_ ]?page|items?[_ ]?par[_ ]?page)[\w ]*\s*[:=]\s*15\b/i,
    "une taille de page redéclarée en littéral (elle se LIT au socle : LISTE_PAR_PAGE)"],
  [/pageDeListe\s*\([^()]*,\s*15\s*\)/,
    "15 passé en argument à pageDeListe — le défaut EST 15, on ne le répète pas"],
  [/ceil\s*\([^()]*\/\s*15\b/,
    "un compte de pages calculé sur un 15 littéral (`ceil(n / 15)`)"],
  /* ⚠️ LA TRANCHE : le motif exige un DÉCALAGE (`* 15` ou `+ 15`), c'est-à-dire
     la signature d'une pagination — pas un `slice(0, 15)` nu. Mesuré le
     2026-08-26 : `b3-scene.mjs:103` tronque un NOM à quinze caractères
     (`pose.nom.slice(0, 15) + "…"`), et le motif large le dénonçait. Un garde
     qui crie au loup se fait désactiver. ⭐ Sa limite, dite plutôt que
     masquée : une première page écrite `slice(0, 15)` lui échapperait — mais
     pas au compte de pages (`ceil(n / 15)`) qui l'accompagne forcément. */
  [/slice\s*\([^()]*(\*|\+)\s*15\b[^()]*\)/,
    "une tranche de page découpée sur un 15 littéral"],
  [/\{\s*length\s*:\s*15\s*\}/,
    "une page de 15 cases fabriquée sur un littéral (`Array.from({ length: 15 })`)"]
];

test("2 — ⛔ aucun littéral 15 ne sert de taille de page ailleurs dans ui/", () => {
  /* Le socle est SEUL exempté : c'est lui qui a le droit d'écrire le nombre.
     Tout le reste de `ui/` — y compris les écrans qui n'existent pas encore,
     l'arpenteur est récursif — passe sous les motifs. */
  const sources = loadSources([UI], ROOT).filter((s) => s.name !== "ui/builder/normes.mjs");
  const fautes = findForbidden(sources, RECOPIES_DU_QUINZE)
    .map((h) => `${h.name} → ${h.label} (« ${h.match.trim()} »)`);
  assert.deepEqual(fautes, [],
    "le 15 est une norme du produit entier (NORMES.md §5) : elle se LIT au socle " +
    "(`import { LISTE_PAR_PAGE } from \"./normes.mjs\"`), elle ne se recopie pas. " +
    "Et si cet écran a une RAISON de faire autrement, il passe SON nombre — c'est légal, " +
    "c'est un défaut, pas une dictature.");
  /* Le plancher garde le RELEVÉ : un arpenteur qui ne trouverait plus aucun
     fichier rendrait ce test vert pour toujours. */
  assert.ok(sources.length >= 30, `relevé ui/ suspect : ${sources.length} modules (37 le 2026-08-26)`);
});

test("2 bis — l'écran Équipement LIT la norme, il ne la porte plus", () => {
  const ecran = stripComments(fs.readFileSync(path.join(UI, "builder", "equipment-step.mjs"), "utf8"));
  assert.match(ecran, /import \{[^}]*LISTE_PAR_PAGE[^}]*\} from "\.\/normes\.mjs/,
    "l'écran doit importer la norme du socle");
  assert.doesNotMatch(ecran, /CASES_PAR_PAGE/,
    "l'ancien nom local ne doit plus exister — deux noms pour un nombre, c'est déjà une recopie");
});

/* ══ 3 — LA DÉRIVATION : ceil, TOUJOURS, ET SANS PLAFOND ═════════════════
   ⛔ Ce bloc n'affirme AUCUN maximum. Le 35 par étagère est une cible de
   découpe : le jour où un homebrew la fait déborder, l'écran pagine plus,
   c'est tout. Un garde qui aurait écrit « au plus 3 pages » serait tombé ce
   jour-là, et il aurait eu tort. */

test("3 — pages = ceil(objets ÷ 15), sur toute la plage — et un contenant à 200 objets fait 14 pages", () => {
  const liste = (n) => Array.from({ length: n }, (_, i) => i);
  for (const n of [0, 1, 14, 15, 16, 33, 35, 36, 100, 200, 1000]) {
    const attendu = Math.max(1, Math.ceil(n / LISTE_PAR_PAGE));
    assert.equal(pageDeListe(liste(n), 0).pages, attendu, `${n} objets → ${attendu} pages`);
  }
  /* Nommément, parce que c'est LE cas qu'Eric a annoncé : au-delà des 35
     visés, rien ne se plafonne. */
  assert.equal(pageDeListe(liste(200), 0).pages, 14, "200 objets = 14 pages, et l'écran ne bronche pas");
  assert.equal(pageDeListe(liste(200), 13).objets.length, 5, "200 − 13 × 15 = 5 — dernière page partielle");
});

test("3 bis — une liste vide fait UNE page, jamais zéro : « 1/0 » serait un compte impossible", () => {
  assert.deepEqual(pageDeListe([], 0), { page: 0, pages: 1, objets: [] });
});

/* ══ 4 — ⚖️ LE DÉFAUT N'EST PAS UN MUR ═══════════════════════════════════ */

test("4 — un écran peut passer SON nombre, explicitement — et c'est légal", () => {
  const douze = pageDeListe(Array.from({ length: 30 }, (_, i) => i), 1, 12);
  assert.equal(douze.pages, 3, "ceil(30 / 12) = 3 — la fonction obéit à l'écran, elle ne le refuse pas");
  assert.equal(douze.objets.length, 12);
  assert.equal(douze.objets[0], 12, "la deuxième page de douze commence au treizième");
});

test("4 bis — mais une taille de page impossible est NOMMÉE, pas remplacée en douce", () => {
  /* Une absence n'est jamais une réponse : replier 0 sur le défaut ferait
     dire au code autre chose que ce que l'appelant a écrit, et
     `ceil(n / 0)` vaudrait Infinity — un compte de pages infini. */
  for (const mauvais of [0, -3, 1.5, null, "15"]) {
    assert.throws(() => pageDeListe([1, 2, 3], 0, mauvais), /parPage/,
      `parPage = ${String(mauvais)} doit être refusé en nommant la faute`);
  }
});

/* ══ ⚔️ LES ATTAQUES — un garde qui n'a jamais été attaqué est une intention
   Fixtures en chaînes pures, hors de `ui/` : `bin/nouvelle-version.mjs` ne
   les réécrira jamais, et les motifs travaillent sur du texte. */

const attaque = (code) => findForbidden([{ name: "(fixture)", raw: code, text: stripComments(code) }],
  RECOPIES_DU_QUINZE).map((h) => h.label);

test("⚔️ ATTAQUE 1 — l'écran Sorts qui se redéclare une taille de page est nommé", () => {
  assert.deepEqual(attaque("const SORTS_PAR_PAGE = 15;"),
    ["une taille de page redéclarée en littéral (elle se LIT au socle : LISTE_PAR_PAGE)"]);
  /* La même faute en objet de réglages, et en anglais — deux écritures que
     le dépôt emploie vraiment. */
  assert.equal(attaque("const REGLAGES = { parPage: 15 };").length, 1);
  assert.equal(attaque("const opts = { pageSize: 15 };").length, 1);
});

test("⚔️ ATTAQUE 2 — l'arithmétique réécrite à la main (ceil, slice, Array.from) est vue", () => {
  assert.equal(attaque("const pages = Math.ceil(items.length / 15);").length, 1);
  assert.equal(attaque("const vue = items.slice(p * 15, p * 15 + 15);").length, 1);
  assert.equal(attaque("const cases = Array.from({ length: 15 }, () => vide());").length, 1);
});

test("⚔️ ATTAQUE 3 — le 15 repassé au socle « pour être sûr » est vu aussi", () => {
  assert.deepEqual(attaque("const vue = pageDeListe(sorts, page, 15);"),
    ["15 passé en argument à pageDeListe — le défaut EST 15, on ne le répète pas"]);
});

test("⚔️ LE DÉFAUT N'EST PAS UN MUR — la déviation explicite et la lecture du socle passent MUETTES", () => {
  /* ⚖️ Les quatre écritures LÉGALES. Si l'une d'elles rougissait un jour,
     c'est le garde qu'il faudrait corriger, pas l'écran. */
  assert.deepEqual(attaque('import { LISTE_PAR_PAGE } from "./normes.mjs";'), []);
  assert.deepEqual(attaque("const symboles = symbolesDAttente(LISTE_PAR_PAGE);"), []);
  assert.deepEqual(attaque("const SORTS_PAR_PAGE = LISTE_PAR_PAGE;"), []);
  assert.deepEqual(attaque("const vue = pageDeListe(sorts, page, 12); // le dressing en met douze"), []);
});

test("⚔️ LES 15 LÉGITIMES DE ui/ RESTENT MUETS — un garde qui crie au loup se fait désactiver", () => {
  /* Les quatre formes réellement présentes dans `ui/`, mesurées le
     2026-08-26 : la date, le tableau standard, l'échelle du fantôme, le
     seuil du relevé. */
  assert.deepEqual(attaque('/* Eric, 2026-08-15 */ const d = "2026-08-15";'), []);
  assert.deepEqual(attaque("const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];"), []);
  assert.deepEqual(attaque("const FANTOME_ECHELLE = 1.15;"), []);
  assert.deepEqual(attaque('const phrase = "None of the ten reached 15";'), []);
  /* Et le faux positif RÉEL qui a formé le motif de la tranche : b3-scene
     tronque un nom trop long à quinze caractères. Ce n'est pas une page. */
  assert.deepEqual(attaque('const court = pose.nom.slice(0, 15) + "…";'), []);
});
