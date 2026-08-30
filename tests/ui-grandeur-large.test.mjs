/* ══ LE GARDE DE LA GRANDEUR — réécrit le 2026-08-30 ═══════════════════

   ⚖️ CE FICHIER GARDAIT UN MÉCANISME QUI N'EXISTE PLUS. Le lot 69 avait
   construit la grandeur Large comme un bloc `@media (min-width: 1140px)` en
   fin de `tokens.css`, qui REHAUSSAIT des jetons de taille. Eric a tranché le
   2026-08-30 :

     🔴 *« TOUT LE BUILDER SUIT LE ZOOM, LES RATIOS NE CHANGENT NULLE PART. »*

   Un bloc qui fait passer `--t6` de 22 à 28 pendant que `--t4` reste à 16 —
   rapport titre/corps de 1,375 à 1,75 — est exactement ce que cette loi
   interdit. Il est supprimé, et la grandeur devient un ATTRIBUT calculé
   (`data-grandeur`, posé par `echelle.mjs` sur la fenêtre divisée par
   l'échelle) qui ne porte plus que des COMPORTEMENTS.

   ⛔ ET LA CLAUSE 3 DE L'ANCIEN GARDE EST MORTE AVEC LUI, délibérément :
   elle exigeait que T1–T4 ne bougent jamais (« 16 px se lit pareil à 360 et
   à 1440 »). La loi du 30/08 dit l'inverse — au cran 5 le corps vaut 80 blg.
   Un lot futur qui voudrait la restaurer doit d'abord rouvrir la ligne avec
   Eric ; ce n'est pas un oubli.

   ── CE QUE CE FICHIER GARDE AUJOURD'HUI ──────────────────────────────────
     1. le bloc de grandeur ne porte JAMAIS une couleur, une image ou un
        voile — inchangé, et pour la raison inchangée : la matrice du verre
        (lot 59) est calculée par THÈME, un jeton de couleur conditionné à la
        place disponible la fausserait sans qu'aucun garde de contraste ne
        rougisse ;
     2. il ne porte AUCUNE cote non plus — plus une seule taille, plus une
        seule largeur : c'est la clause qui remplace l'ancienne clause 3, et
        elle est plus large qu'elle ;
     3. les trois grandeurs sont nommées à un seul endroit (`echelle.mjs`) et
        les feuilles ne connaissent que leurs noms ;
     4. l'échelle ne descend JAMAIS sous 1 — le plancher d'Eric, *« c'est la
        taille 360 sur laquelle on travaille »* : aucun texte ne peut donc
        passer sous le barème ratifié.

   ⚠️ MÊME MÉTHODE QUE `tests/ui-jetons.test.mjs` : un balayage d'octets, pas
   de DOM, pas de paquet — et des ATTAQUES en mémoire qui prouvent que chaque
   clause mord. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const UI_DIR = path.join(ROOT, "ui", "builder");
const tokensCss = fs.readFileSync(path.join(UI_DIR, "tokens.css"), "utf8");
const echelleMjs = fs.readFileSync(path.join(UI_DIR, "echelle.mjs"), "utf8");

/** Le corps de chaque bloc `[data-grandeur=…]` d'une feuille — sur le texte
 *  DÉPOUILLÉ, pour qu'un exemple écrit dans un commentaire ne compte pas. */
function blocsDeGrandeur(cssText) {
  const texte = stripComments(cssText);
  const out = [];
  for (const m of texte.matchAll(/:root\[data-grandeur="([a-z]+)"\]\s*\{([^}]*)\}/g)) {
    out.push({ grandeur: m[1], corps: m[2] });
  }
  return out;
}

/** Toute déclaration du corps qui porte une COULEUR, par nom ou par forme. */
function couleursDuBloc(corps) {
  const hits = [];
  for (const m of corps.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const [, nom, valeur] = m;
    if (/^(bg|surface|sunken|text|text-soft|text-muted|border|border-strong|accent|on-accent|positive|caution|critical|info|lien|magie)$/.test(nom)) {
      hits.push(`${nom} (par le nom)`);
      continue;
    }
    /* La FORME suffit à trahir un jeton neuf : un hex, une fonction de
       couleur, un mélange, une image. ⛔ `black`/`transparent` d'un masque
       sont exemptés — un masque encode une VISIBILITÉ, pas une teinte (même
       doctrine que le garde des couleurs des jetons). */
    const sansMasque = /gradient\(/.test(valeur) && /\b(black|transparent|white)\b/.test(valeur)
      ? valeur.replace(/\b(black|transparent|white)\b/g, "")
      : valeur;
    if (/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|color-mix|url)\(/.test(sansMasque)) {
      hits.push(`${nom} (par la forme : ${valeur.trim()})`);
    }
  }
  return hits;
}

/** Toute déclaration du corps qui porte une COTE — une longueur chiffrée. */
function cotesDuBloc(corps) {
  const hits = [];
  for (const m of corps.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const [, nom, valeur] = m;
    /* Un masque porte des longueurs (`calc(100% - var(--sp-32))`) sans être
       une cote : ce sont des positions d'arrêt dans un dégradé, pas une
       taille d'organe. Elles ne sortent jamais de leur image. */
    if (/gradient\(/.test(valeur)) continue;
    if (/\d+(\.\d+)?(px|em|rem|ch|vh|vw|%)/.test(valeur)) hits.push(`${nom}: ${valeur.trim()}`);
  }
  return hits;
}

/* ══ 1 — LE BLOC DE GRANDEUR NE PORTE AUCUNE COULEUR ══════════════════ */

test("grandeur 1 — aucun bloc [data-grandeur] ne redéfinit une couleur, par nom ni par forme", () => {
  for (const bloc of blocsDeGrandeur(tokensCss)) {
    assert.deepEqual(couleursDuBloc(bloc.corps), [],
      `[data-grandeur="${bloc.grandeur}"] porte une couleur — la matrice du verre est mesurée par THÈME, pas par place disponible`);
  }
});

test("⚔️ ATTAQUE A — glisser --text: #ff0000 dans un bloc de grandeur le fait rougir", () => {
  const faux = ':root[data-grandeur="large"] { --text: #ff0000; }';
  const [bloc] = blocsDeGrandeur(faux);
  assert.ok(bloc, "le scanner voit bien le bloc synthétique — sinon l'attaque ne prouve rien");
  assert.equal(couleursDuBloc(bloc.corps).length, 1, "il mord par le nom");
});

test("⚔️ ATTAQUE B — un jeton NEUF à valeur de couleur rougit par sa FORME", () => {
  const faux = ':root[data-grandeur="large"] { --lueur-du-large: color-mix(in srgb, #123456 20%, transparent); }';
  const [bloc] = blocsDeGrandeur(faux);
  assert.equal(couleursDuBloc(bloc.corps).length, 1,
    "un nom inconnu ne protège rien : c'est la forme de la valeur qui trahit");
});

test("⚔️ ATTAQUE B bis — et il laisse passer un MASQUE, qui n'est pas une teinte", () => {
  const vrai = ':root[data-grandeur="large"] { --stage-amorce: linear-gradient(to bottom, black calc(100% - var(--sp-32)), transparent); }';
  const [bloc] = blocsDeGrandeur(vrai);
  assert.deepEqual(couleursDuBloc(bloc.corps), [],
    "noir/transparent dans un dégradé encodent une VISIBILITÉ — aucun jeton de palette ne prétend dire ça");
});

/* ══ 2 — NI AUCUNE COTE (la clause qui remplace « T1–T4 ne bougent pas ») ══ */

test("grandeur 2 — 🔴 aucun bloc [data-grandeur] ne porte de COTE", () => {
  /* ⛔ LA CLAUSE CENTRALE DE CE LOT. Une cote conditionnée à la place
     disponible EST un changement de ratio : c'est ce que faisait l'ancien
     bloc Large (`--t6` 22 → 28, `--rail-w` 90 → 120), et c'est ce que la loi
     du 30/08 interdit. Une grandeur ne peut porter que des COMPORTEMENTS. */
  for (const bloc of blocsDeGrandeur(tokensCss)) {
    assert.deepEqual(cotesDuBloc(bloc.corps), [],
      `[data-grandeur="${bloc.grandeur}"] porte une cote — elle changerait un rapport, ce que la loi du zoom interdit`);
  }
});

test("⚔️ ATTAQUE C — redéfinir --t4 dans un bloc de grandeur fait rougir SEULEMENT le garde des cotes", () => {
  const faux = ':root[data-grandeur="large"] { --t4: 20px; }';
  const [bloc] = blocsDeGrandeur(faux);
  assert.equal(cotesDuBloc(bloc.corps).length, 1, "la cote est vue");
  assert.deepEqual(couleursDuBloc(bloc.corps), [], "et le garde des couleurs reste muet — chacun son métier");
});

test("⚔️ ATTAQUE C bis — un rehaussement de largeur rougit aussi, c'est la même faute", () => {
  const faux = ':root[data-grandeur="large"] { --rail-w: 120px; }';
  const [bloc] = blocsDeGrandeur(faux);
  assert.equal(cotesDuBloc(bloc.corps).length, 1,
    "90 → 120 pendant que --sp-8 ne bouge pas : le rapport rail/gouttière saute de 11,25 à 15");
});

/* ══ 3 — LES TROIS GRANDEURS SONT NOMMÉES À UN SEUL ENDROIT ═══════════ */

test("grandeur 3 — les trois noms vivent dans echelle.mjs, et les feuilles n'en connaissent pas d'autres", () => {
  const source = stripComments(echelleMjs);
  for (const nom of ["etroite", "moyenne", "large"]) {
    assert.match(source, new RegExp(`"${nom}"`), `echelle.mjs doit nommer la grandeur « ${nom} »`);
  }
  const employees = new Set();
  for (const nom of fs.readdirSync(UI_DIR)) {
    if (!nom.endsWith(".css")) continue;
    const texte = stripComments(fs.readFileSync(path.join(UI_DIR, nom), "utf8"));
    for (const m of texte.matchAll(/data-grandeur="([a-z]+)"/g)) employees.add(m[1]);
  }
  for (const nom of employees) {
    assert.ok(["etroite", "moyenne", "large"].includes(nom),
      `« ${nom} » n'est pas une grandeur connue — une feuille a inventé un nom que personne ne pose`);
  }
});

/* ══ 4 — L'ÉCHELLE NE DESCEND JAMAIS SOUS 1 ═══════════════════════════ */

test("grandeur 4 — 🔴 le plancher de l'échelle est 1 (la décision d'Eric : « la taille 360 »)", async () => {
  const { CRANS } = await import("../ui/builder/echelle.mjs");
  assert.ok(Array.isArray(CRANS) && CRANS.length > 0, "les crans existent");
  assert.equal(CRANS[0], 1, "le premier cran EST la base — rien ne rétrécit sous le barème ratifié");
  assert.deepEqual(CRANS, [...CRANS].sort((a, b) => a - b), "les crans sont croissants");
  assert.equal(new Set(CRANS).size, CRANS.length, "et distincts");
  for (const c of CRANS) {
    assert.ok(c >= 1, `le cran ${c} descend sous le plancher — un texte y passerait sous T1`);
  }
});

test("grandeur 4 bis — la cible tactile ne peut pas tomber sous 44, et c'est une CONSÉQUENCE", async () => {
  /* ⭐ CE TEST N'A PAS DE CODE À PROTÉGER, IL A UN RAISONNEMENT À FIGER.
     `--touch: 44px` n'a plus de `max()` : sous une échelle qui ne descend
     jamais sous 1, 44 blg valent toujours au moins 44 pixels. La loi d'Apple
     et la loi d'Eric disent la même chose — mais seulement TANT QUE le
     plancher tient. Si un lot futur ajoutait un cran à 0,875, ce test
     tomberait, et c'est exactement ce qu'on lui demande. */
  const { CRANS } = await import("../ui/builder/echelle.mjs");
  const touch = 44;
  for (const c of CRANS) {
    assert.ok(touch * c >= 44,
      `au cran ${c}, la cible tactile rendrait ${touch * c} px — sous le seuil d'Apple. Il faudrait rendre son max() à --touch`);
  }
});
