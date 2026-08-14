/* ══ LE GARDE DE LA GRANDEUR LARGE — lot 69 ═══════════════════════════

   La bible §3 définit TROIS grandeurs (Large ≥ 1140 · Moyenne 720–1140 ·
   Étroite < 720, dessinée à 360). Le lot 69 construit la Large : un bloc
   `@media (min-width: 1140px)` en fin de `tokens.css`, qui ne redéfinit
   QUE des jetons de taille et de mise en page. Ce fichier garde les
   quatre contrats de ce bloc :

     1. le seuil 1140 n'existe qu'UNE fois dans tout `ui/builder/` — même
        loi que le 720 (garde 5 des jetons), même raison : un `@media` CSS
        ne peut pas lire une custom property, le nombre doit donc être
        écrit quelque part, et ce quelque part est unique ;
     2. le bloc Large ne porte JAMAIS une couleur, une image ou un voile —
        la matrice du verre (lot 59, `tests/decor.test.mjs`) est calculée
        par THÈME : un jeton de couleur conditionné à la largeur la
        fausserait sans qu'aucun garde de contraste ne rougisse ;
     3. T1–T4 (micro, mention, libellé, corps) ne bougent pas avec la
        largeur — 16 px se lit pareil à 360 et à 1440 ; seuls les barreaux
        d'AFFICHAGE (T5, T6) montent, et l'échelle recomposée reste
        croissante, aucun barreau à moins de 12,5 % du suivant (la même
        exigence que le garde des sept barreaux sur l'échelle de base) ;
     4. les jetons de grandeur valent, À LA BASE, le comportement d'avant
        le lot — `--panel-w` EST `--measure`, la molette d'Abilities est
        `nowrap` sous amorce : à 360, rien n'a le droit d'avoir bougé.

   ⚠️ MÊME MÉTHODE QUE `tests/ui-jetons.test.mjs` : un balayage d'octets,
   pas de DOM, pas de paquet — et des ATTAQUES en mémoire qui prouvent que
   chaque clause mord. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments, walkSources } from "./source-scan.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const UI_DIR = path.join(ROOT, "ui", "builder");
const TOKENS_CSS_PATH = path.join(UI_DIR, "tokens.css");

const tokensCssRaw = fs.readFileSync(TOKENS_CSS_PATH, "utf8");

/* ── LES SCANNERS — fonctions pures, réutilisées par les attaques ────── */

/** Compte les « 1140 » (hors commentaires) d'un ensemble de fichiers.
 *  Même motif que le garde 5 du lot 38 : `\b1140(?!\d)`. */
function seuilLargeCount(files) {
  let count = 0;
  const where = [];
  for (const [name, text] of files) {
    const matches = stripComments(text).match(/\b1140(?!\d)/g) || [];
    count += matches.length;
    if (matches.length > 0) where.push(`${name} (${matches.length})`);
  }
  return { count, where };
}

/** Le bloc Large de tokens.css : de son `@media` à la fin du fichier (il
 *  est dernier — le garde d'ordre ci-dessous le vérifie avant tout). */
function largeBlock(cssText) {
  const stripped = stripComments(cssText);
  const idx = stripped.indexOf("@media (min-width: 1140px)");
  return idx === -1 ? null : stripped.slice(idx);
}

/** Les `--nom: valeur;` d'un bloc — même extraction à plat que le lot 38. */
function extractCustomProps(cssText) {
  const props = new Map();
  for (const match of cssText.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    props.set(match[1], match[2].trim());
  }
  return props;
}

/* Les jetons de THÈME — ceux que le bloc Large n'a pas le droit de
   toucher par NOM. Liste noire, pas blanche (leçon du lot 56 : une liste
   blanche recopiée reproduit le risque qu'on corrige) : elle nomme ce
   qu'on protège, pas ce qu'on autorise. */
const THEME_TOKENS = [
  "bg", "surface", "sunken", "text", "text-soft", "text-muted",
  "border-strong", "border", "accent", "on-accent",
  "positive", "caution", "critical", "info",
  "tier-1", "tier-2", "tier-3",
  "accent-wash", "bg-image", "scrim",
  "voile-simple", "voile-inter", "voile-majeure",
  "dalle-simple", "dalle-inter"
];

/** Chaque redéfinition du bloc Large qui touche un jeton de thème PAR SON
 *  NOM, ou dont la VALEUR a une forme de couleur ou d'image (hex, rgb(),
 *  hsl(), color-mix(), url()) — les deux directions, pour qu'un jeton de
 *  couleur NOUVEAU (hors liste) soit pris par sa valeur. */
function themeViolationsInLarge(cssText) {
  const block = largeBlock(cssText);
  if (block === null) return ["<bloc Large absent>"];
  const hits = [];
  for (const [name, value] of extractCustomProps(block)) {
    if (THEME_TOKENS.includes(name)) hits.push(`--${name} (jeton de thème)`);
    else if (/#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla|color-mix|url)\(/i.test(value)) {
      hits.push(`--${name}: ${value} (forme de couleur/d'image)`);
    }
  }
  return hits;
}

/** Les barreaux de LECTURE (T1–T4) redéfinis dans le bloc Large — interdits :
 *  une taille de lecture ne suit pas la largeur de la fenêtre. */
function readingRungsInLarge(cssText) {
  const block = largeBlock(cssText);
  if (block === null) return ["<bloc Large absent>"];
  return [...extractCustomProps(block).keys()].filter((n) => /^t[1-4]$/.test(n)).map((n) => `--${n}`);
}

/* ── 1 — LE SEUIL EST UNIQUE, ET C'EST tokens.css QUI LE PORTE ───────── */

test("grandeur Large 1 — « 1140 » n'existe qu'une fois dans tout ui/builder/, dans tokens.css", () => {
  const files = [
    ...walkSources(UI_DIR).map((f) => [path.relative(ROOT, f), fs.readFileSync(f, "utf8")]),
    ["ui/builder/shell.css", fs.readFileSync(path.join(UI_DIR, "shell.css"), "utf8")],
    ["ui/builder/tokens.css", tokensCssRaw],
    ["ui/builder/index.html", fs.readFileSync(path.join(UI_DIR, "index.html"), "utf8")]
  ];
  const { count, where } = seuilLargeCount(files);
  assert.equal(count, 1, `« 1140 » doit exister UNE fois — trouvé : ${where.join(", ") || "nulle part"}`);
  assert.deepEqual(where, ["ui/builder/tokens.css (1)"],
    "et c'est le @media de tokens.css qui le porte — tout le régime Large est des jetons, " +
    "shell.css les consomme sans connaître le chiffre (même mécanique que --bp-hint pour 720)");
});

/* ── 2 — LE BLOC LARGE VIT APRÈS LE BLOC SOMBRE ──────────────────────────
   Les gardes du lot 38 et du lot 59 découpent tokens.css au premier
   `@media (prefers-color-scheme: dark)` et lisent l'échelle de base dans
   ce qui le PRÉCÈDE. Un bloc Large placé AVANT le bloc sombre entrerait
   dans leur « bloc jour » : le garde des sept barreaux mesurerait les
   valeurs Large en croyant mesurer la base. L'ordre n'est pas un détail
   d'esthétique, c'est ce qui garde les autres gardes véridiques. */

test("grandeur Large 2 — le bloc Large est APRÈS le bloc sombre (les gardes du jour mesurent la base, pas lui)", () => {
  const stripped = stripComments(tokensCssRaw);
  const darkIdx = stripped.indexOf("@media (prefers-color-scheme: dark)");
  const largeIdx = stripped.indexOf("@media (min-width: 1140px)");
  assert.ok(darkIdx > 0, "le bloc sombre doit exister");
  assert.ok(largeIdx > 0, "le bloc Large doit exister");
  assert.ok(largeIdx > darkIdx,
    "le bloc Large doit suivre le bloc sombre — avant lui, il polluerait le « bloc jour » " +
    "que les gardes des lots 38/59 mesurent");
});

/* ── 3 — QUE DES TAILLES : jamais une couleur, une image, un voile ───── */

test("grandeur Large 3 — le bloc Large ne redéfinit aucun jeton de thème, par nom ni par forme de valeur", () => {
  assert.deepEqual(themeViolationsInLarge(tokensCssRaw), [],
    "la matrice du verre (lot 59) est calculée par THÈME — une couleur conditionnée " +
    "à la largeur la fausserait sans qu'aucun garde de contraste ne rougisse");
});

/* ── 4 — LA TYPO : T1–T4 immobiles, l'échelle recomposée reste une échelle ── */

test("grandeur Large 4 — T1–T4 (tailles de LECTURE) ne bougent pas avec la largeur", () => {
  assert.deepEqual(readingRungsInLarge(tokensCssRaw), [],
    "micro, mention, libellé et corps se lisent pareil à 360 et à 1440 — " +
    "seuls les barreaux d'affichage (T5, T6) portent la grandeur");
});

test("grandeur Large 5 — l'échelle recomposée en Large reste croissante, aucun barreau à moins de 12,5 % du suivant", () => {
  const stripped = stripComments(tokensCssRaw);
  const darkIdx = stripped.indexOf("@media (prefers-color-scheme: dark)");
  const base = extractCustomProps(stripped.slice(0, darkIdx));
  const large = extractCustomProps(largeBlock(tokensCssRaw) || "");
  const rungs = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((name) => {
    const raw = large.get(name) ?? base.get(name);
    assert.ok(raw, `--${name} doit exister (base ou Large)`);
    const px = Number(raw.replace("px", ""));
    assert.ok(Number.isFinite(px) && px > 0, `--${name} doit être une longueur (lu : "${raw}")`);
    return px;
  });
  assert.deepEqual(rungs, [...rungs].sort((a, b) => a - b), "les sept valeurs recomposées sont croissantes");
  assert.equal(new Set(rungs).size, 7, "et distinctes");
  for (let i = 1; i < rungs.length; i += 1) {
    const ratio = rungs[i] / rungs[i - 1];
    assert.ok(ratio >= 1.125,
      `en Large, T${i + 1} (${rungs[i]}px) est à moins de 12,5 % de T${i} (${rungs[i - 1]}px) — ratio ${ratio.toFixed(4)}`);
  }
});

/* ── 5 — À LA BASE, LES JETONS DE GRANDEUR SONT LE COMPORTEMENT D'AVANT ──
   Le contrat « rien ne bouge à 360 » n'est pas une promesse de prose : il
   est écrit dans les valeurs de base elles-mêmes. Si quelqu'un « répare »
   le desktop en changeant une BASE au lieu du bloc Large, c'est le
   téléphone qui paie — et c'est ici que ça rougit. */

test("grandeur Large 6 — les valeurs de BASE des jetons de grandeur sont celles d'avant le lot (l'étroit est intouché)", () => {
  const stripped = stripComments(tokensCssRaw);
  const darkIdx = stripped.indexOf("@media (prefers-color-scheme: dark)");
  const base = extractCustomProps(stripped.slice(0, darkIdx));
  assert.equal(base.get("card-w"), "var(--measure)", "--card-w de base EST la mesure de prose");
  assert.equal(base.get("panel-w"), "var(--measure)", "--panel-w de base EST la mesure — Abilities ne s'élargit qu'en Large");
  assert.equal(base.get("fiche-w"), "100%", "--fiche-w de base : la fiche de catalogue reste pleine largeur");
  assert.equal(base.get("frame-w"), "100%", "--frame-w de base : la ligne de commande reste sans plafond");
  assert.equal(base.get("card-pad"), "var(--sp-16)", "--card-pad de base : le 16 px de B4.3, pas le 32 du desktop d'avant");
  assert.equal(base.get("wheel-wrap"), "nowrap", "à l'étroit, la molette DÉFILE (B5.5) — elle ne se replie pas");
  assert.match(base.get("wheel-mask") || "", /linear-gradient/,
    "à l'étroit, l'amorce en fondu reste — c'est elle qui dit « il y a du hors-champ »");
  assert.equal(base.get("gutter-frame"), "var(--sp-12)", "--gutter-frame de base = l'ancien padding de .command");
  assert.equal(base.get("gutter-popup"), "var(--sp-16)", "--gutter-popup de base = l'ancienne marge du popup");
});

/* ══ ⚔️ LES ATTAQUES — un garde jamais attaqué n'est pas un garde ═══════
   Chacune mute une COPIE en mémoire et vérifie que LA clause visée rougit,
   seule. Rien n'est écrit sur le disque. */

test("⚔️ ATTAQUE A — glisser --text: #ff0000 dans le bloc Large fait rougir SEULEMENT le garde des thèmes", () => {
  assert.deepEqual(themeViolationsInLarge(tokensCssRaw), [], "le vrai fichier est propre avant l'attaque");
  const mutated = tokensCssRaw.replace("    --t5: 20px;", "    --text: #ff0000;\n    --t5: 20px;");
  assert.notEqual(mutated, tokensCssRaw, "la substitution a trouvé sa cible");
  assert.deepEqual(themeViolationsInLarge(mutated), ["--text (jeton de thème)"],
    "le garde voit EXACTEMENT le jeton de thème passé en douce");
  assert.deepEqual(readingRungsInLarge(mutated), [], "le garde des barreaux de lecture ne bouge pas");
});

test("⚔️ ATTAQUE B — un jeton NOUVEAU à valeur de couleur dans le bloc Large rougit par sa FORME", () => {
  const mutated = tokensCssRaw.replace("    --t5: 20px;", "    --halo-desktop: rgb(255 0 0);\n    --t5: 20px;");
  assert.notEqual(mutated, tokensCssRaw);
  assert.deepEqual(themeViolationsInLarge(mutated), ["--halo-desktop: rgb(255 0 0) (forme de couleur/d'image)"],
    "un nom hors liste noire est quand même pris — par la forme de sa valeur");
});

test("⚔️ ATTAQUE C — redéfinir --t4 en Large fait rougir SEULEMENT le garde des tailles de lecture", () => {
  const mutated = tokensCssRaw.replace("    --t5: 20px;", "    --t4: 18px;\n    --t5: 20px;");
  assert.notEqual(mutated, tokensCssRaw);
  assert.deepEqual(readingRungsInLarge(mutated), ["--t4"], "le corps ne grandit pas avec la fenêtre");
  assert.deepEqual(themeViolationsInLarge(mutated), [], "le garde des thèmes ne bouge pas — 18px n'est pas une couleur");
});

test("⚔️ ATTAQUE D — écrire 1140 une seconde fois (le défaut 720 rejoué) fait rougir le compte du seuil", () => {
  /* Le défaut d'origine du seuil 720 était un matchMedia dans shell.mjs
     (garde 5 du lot 38, attaque 5). On rejoue le MÊME geste sur 1140 :
     un fichier de ui/builder qui écrirait le chiffre en code. */
  const shellCssPath = path.join(UI_DIR, "shell.css");
  const realShellCss = fs.readFileSync(shellCssPath, "utf8");
  const files = [
    ["ui/builder/tokens.css", tokensCssRaw],
    ["ui/builder/shell.css", `${realShellCss}\n@media (min-width: 1140px) { .decision-card { min-width: 0; } }\n`]
  ];
  const { count } = seuilLargeCount(files);
  assert.equal(count, 2, "la copie mutée porte deux 1140 — le garde 1 rougirait");
  /* Et le vrai shell.css sur disque n'a jamais porté le chiffre : */
  assert.doesNotMatch(stripComments(realShellCss), /\b1140(?!\d)/,
    "shell.css ne connaît pas le seuil Large — il consomme des jetons");
});
