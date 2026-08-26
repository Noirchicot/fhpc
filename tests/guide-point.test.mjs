/* ══ LE GARDE DU POINT D'ENTRÉE DU GUIDE — le `?` ═════════════════════════

   CE QU'IL EXISTE POUR EMPÊCHER, ET C'EST MESURÉ AU NAVIGATEUR À 360 (règle
   §0, « Google Headless ») AVANT ce lot :

     · le `?` était posé sur **8 écrans sur 10**, et il n'ouvrait un vrai
       guide sur **AUCUN**. Les huit rallumaient deux préférences de tutoriel
       qu'ils ne rendent pas — donc, vu du joueur, rien. Les deux qui ne le
       portaient pas : Identity (une dalle de tutoriel l'occupe, règle du
       19/08) et l'Équipement, faute d'hôte ;
     · le seul guide écrit dans le dépôt (l'Équipement) était **injoignable** :
       depuis le virage B3 du 23/08, cet écran ne dessine aucune dalle, et le
       chercheur de `renderCard` ne trouvait donc aucun hôte. Trois jours, zéro
       test rouge ;
     · sur DESTINY, la première dalle de l'écran est `button.card-face` — le
       `?` y était un `<button>` DANS un `<button>`, et demander l'aide
       **retournait la carte** ;
     · l'aspect du `?` n'existait pas : `::before` ne dessinait qu'un cercle,
       identique qu'on ait lu le guide ou non.

   ⛔ NORMES §7 l'interdit en toutes lettres : *« borné aux écrans qui ONT un
   guide. Un `?` qui n'ouvre rien apprend à ne plus le regarder »*.

   TROIS PREUVES, PARCE QU'AUCUNE SEULE NE TIENT :

     A. STRUCTURELLE — la table `GUIDES` couvre TOUTES les étapes de `STEPS`,
        et elle n'a qu'UN SEUL lecteur (`guideDeLEtape`). C'est ce lecteur
        unique qui rend impossible la divergence la plus coûteuse : un écran
        qui POSE un `?` que l'action REFUSE d'ouvrir, ou l'inverse. Deux
        lectures séparées ne se contrediraient jamais à voix haute.
     B. DE DÉCOR — le `?` porte bien deux aspects en CSS, le plein est de la
        famille `parchemin`, et ⛔ il n'emprunte AUCUNE couleur de l'échelle
        (le vert avait été envisagé puis écarté : dans l'échelle il dit
        « fini », l'inverse de « jamais vu »).
     C. COMPORTEMENTALE — l'organe RENDU porte l'état qu'on lui passe, et son
        libellé le dit aussi (un parchemin plein ne se voit qu'à l'œil).

   🔴 SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS TOUTE SEULE : A et B
   lisent la SOURCE. Ils prouvent que la table couvre les étapes et que la
   règle CSS est écrite ; ⛔ ils ne prouvent pas qu'un `?` RENDU tombe dans sa
   dalle, ni que le popup s'ouvre. Ça, c'est la règle §0, et elle a été faite
   à la main au navigateur pour ce lot (Chrome 151 headless, 360 px, les dix
   écrans). Le jour où `puppeteer` entre dans les dépendances de dev — §0 le
   demande — ces mesures deviennent un quatrième test, et c'est là qu'elles
   doivent aller. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";
import { createTestDocument } from "./dom-stub.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHELL = path.join(ROOT, "ui", "builder", "shell.mjs");
const CSS = path.join(ROOT, "ui", "builder", "shell.css");

const shell = stripComments(fs.readFileSync(SHELL, "utf8"));
const css = fs.readFileSync(CSS, "utf8");

/** Les `id` déclarés par `STEPS`, lus dans la source de la coquille — la
 *  coquille elle-même ne s'importe pas sous Node (elle monte le cadre au
 *  chargement). ⚠️ On lit la LISTE, pas un compte : un compte juste ne dirait
 *  rien des noms. */
function idsDesEtapes() {
  const bloc = shell.match(/const STEPS = \[([\s\S]*?)\n\];/);
  assert.ok(bloc, "STEPS introuvable dans shell.mjs — ce garde lit la mauvaise source");
  return [...bloc[1].matchAll(/id:\s*"([a-z]+)"/g)].map((m) => m[1]);
}

/** Les clefs de la table `GUIDES`, lues de la même façon. */
function idsDesGuides() {
  const bloc = shell.match(/const GUIDES = \{([\s\S]*?)\n\};/);
  assert.ok(bloc, "GUIDES introuvable dans shell.mjs");
  return [...bloc[1].matchAll(/^ {2}([a-z]+):\s*\{/gm)].map((m) => m[1]);
}

/* ══ A — LA TABLE COUVRE LES ÉTAPES, ET ELLE N'A QU'UN LECTEUR ════════════ */

test("A1 — chaque étape de STEPS a son guide, et aucun guide ne vise une étape morte", () => {
  const etapes = idsDesEtapes();
  const guides = idsDesGuides();
  assert.ok(etapes.length >= 9, `STEPS mal relu : ${etapes.length} étapes`);
  assert.deepEqual(
    etapes.filter((id) => !guides.includes(id)), [],
    "une étape sans guide n'aura PAS de `?` (c'est le bornage §7, et c'est voulu) — " +
    "mais si c'est un oubli, le joueur perd son aide sans qu'aucun écran ne le dise. " +
    "Ajouter l'entrée dans GUIDES, ou assumer le bornage ici.");
  assert.deepEqual(
    guides.filter((id) => !etapes.includes(id)), [],
    "un guide écrit pour une étape qui n'existe plus : du texte mort que personne ne verra");
});

test("A2 — 🔴 `GUIDES` n'a qu'UN SEUL lecteur, et les deux organes du `?` passent par lui", () => {
  /* Le POSEUR (`renderCard`) et l'OUVREUR (`tutoRouvrir`) doivent lire la même
     chose. S'ils lisaient la table chacun de leur côté, un écran pourrait
     porter un `?` que l'action refuse d'ouvrir — et ⛔ AUCUN COMPTE NE VOIT
     ÇA : les deux lectures seraient cohérentes chacune avec elle-même. */
  const lectures = [...shell.matchAll(/\bGUIDES\b/g)].length;
  assert.equal(lectures, 2, // la déclaration + l'unique lecture dans guideDeLEtape
    `GUIDES est nommée ${lectures} fois dans shell.mjs ; attendu 2 (sa déclaration ` +
    `et l'unique lecture de guideDeLEtape). Une troisième mention est un second ` +
    `lecteur, donc une divergence possible entre le \`?\` posé et l'action qui répond.`);
  assert.match(shell, /function guideDeLEtape\(\)\s*\{[\s\S]*?GUIDES\[etape\]/,
    "guideDeLEtape doit être le lecteur ; s'il a changé de forme, ce garde lit à côté");
  /* Les deux appelants, nommés. */
  assert.ok(shell.includes("const guide = guideDeLEtape();"),
    "au moins un appelant attendu ; les deux le sont ci-dessous");
  assert.equal([...shell.matchAll(/guideDeLEtape\(\)/g)].length, 3,
    "attendu 3 occurrences : la déclaration, l'appel de `tutoRouvrir`, l'appel de `renderCard`");
});

test("A3 — ⛔ le `?` ne se pose JAMAIS dans un bouton (le défaut mesuré sur Destiny)", () => {
  assert.match(shell, /\.dalle-intermediaire\):not\(button\)/,
    "sans `:not(button)`, l'hôte de Destiny redevient `button.card-face` : " +
    "un <button> dans un <button>, et le clic du `?` RETOURNE LA CARTE en remontant");
});

test("A4 — le `?` n'est posé que si l'étape a un guide (§7, le bornage)", () => {
  assert.match(shell, /const guide = guideDeLEtape\(\);\s*\n\s*if \(guide && !card\.querySelector/,
    "la pose du `?` doit être gardée par `guide &&` — sinon un écran sans guide " +
    "reprend un bouton qui n'ouvre rien, et *« un `?` qui n'ouvre rien apprend à " +
    "ne plus le regarder »*");
});

test("A5 — ⛔ le `?` ne rallume plus la préférence de tutoriel, et le menu reste le filet", () => {
  const bloc = shell.match(/if \(action\.kind === "tutoRouvrir"\)\s*\{([\s\S]*?)\n {2}\}/);
  assert.ok(bloc, "l'action `tutoRouvrir` a changé de forme — ce garde lit à côté");
  assert.doesNotMatch(bloc[1], /setTutorielActif|setGeneralVu/,
    "ce geste RALLUMAIT DE FORCE une préférence que le joueur venait d'éteindre. " +
    "`Turn tutorials off` reste réversible par Menu › Tutorials (`tutoBascule`), " +
    "qui existe depuis le 19/08 — c'est LUI le filet de sécurité.");
  assert.match(shell, /action\.kind === "tutoBascule"/,
    "…et si cet interrupteur disparaissait, `Turn tutorials off` deviendrait " +
    "IRRÉVERSIBLE : plus aucun chemin ne rallume le tutoriel.");
});

/* ══ B — LES DEUX ASPECTS, EN DÉCOR ═══════════════════════════════════════ */

test("B1 — le `?` a bien DEUX aspects, et le plein est du parchemin", () => {
  const regle = css.match(/\.tuto-point\[data-vu="non"\]\s*\{([^}]*)\}/);
  assert.ok(regle, "l'aspect « jamais vu » n'est pas déclaré : le `?` n'aurait qu'un seul visage");
  assert.match(regle[1], /var\(--surface\)/,
    "le plein doit être la SURFACE elle-même — c'est ce que « parchemin » nomme, " +
    "et c'est déjà ce que porte `.popup[data-role=\"guide\"]`");
  assert.doesNotMatch(regle[1], /#[0-9a-fA-F]{3,8}|rgba?\(/,
    "⛔ aucune couleur en littéral : elle serait aveugle au thème (loi de tokens.css)");
});

test("B2 — ⛔ le `?` n'emprunte AUCUNE couleur de l'échelle", () => {
  /* §7 : *« le vert avait été envisagé puis écarté : dans l'échelle il dit
     "fini", ce qui est l'INVERSE de "jamais vu" »*. Et il ne crie pas : une
     couleur de signal réclamerait l'attention qu'un guide OPTIONNEL a le droit
     de ne pas prendre. */
  const blocs = [...css.matchAll(/\.tuto-point[^{]*\{([^}]*)\}/g)].map((m) => m[1]).join("\n");
  for (const jeton of ["--positive", "--caution", "--critical", "--info", "--accent"]) {
    assert.ok(!blocs.includes(jeton),
      `le \`?\` porte ${jeton} — c'est une couleur de SIGNAL, et le guide ne signale rien`);
  }
});

test("B3 — le disque est le FOND du bouton, pas le `::before` qui peindrait par-dessus", () => {
  /* Mesure : `::before` est `position: absolute` sans `z-index`, donc il peint
     AU-DESSUS du texte en flux. Un disque opaque posé là aurait effacé le `?`
     lui-même — le bouton serait devenu une pastille muette. */
  const avant = css.match(/\.tuto-point::before\s*\{([^}]*)\}/);
  assert.ok(avant, "le cercle de contour a disparu — c'est lui qui reste dans les DEUX états");
  assert.doesNotMatch(avant[1], /\bbackground(-color)?\s*:/,
    "un fond sur `::before` recouvrirait le glyphe `?`");
  assert.match(avant[1], /box-shadow:\s*inset[^;]*--border-strong/,
    "le liseré du cercle est présent dans les deux états : c'est le cercle qui ne s'en va jamais");
});

test("B4 — le `?` retrouve son hôte, quel que soit l'écran (le défaut Abilities/Skills)", () => {
  /* 📏 MESURÉ À 360 AVANT : Abilities — hôte à y 68, `?` rendu à y 748 ;
     Skills — hôte à y 169, `?` rendu à y 4424. `position: absolute` remonte au
     premier ANCÊTRE POSITIONNÉ, et seuls trois écrans l'étaient. */
  assert.match(css, /\.stage :has\(> \.tuto-point\)\s*\{\s*position: relative;\s*\}/,
    "sans cette règle, le `?` s'ancre sur le premier ancêtre positionné — c'est-à-dire " +
    "n'importe où. La parade est portée par l'ORGANE, pas écran par écran : " +
    "réparer au nom de l'écran fait revenir le défaut au prochain écran neuf.");
});

/* ══ C — L'ORGANE RENDU ═══════════════════════════════════════════════════ */

globalThis.document = createTestDocument();
const { renderPointInterrogation, guideVu, setGuideVu } = await import("../ui/builder/tutoriel.mjs");

test("C1 — le `?` rendu porte l'état qu'on lui passe, et il le PRONONCE", () => {
  const jamais = renderPointInterrogation(() => {}, { vu: false });
  const relu = renderPointInterrogation(() => {}, { vu: true });
  assert.equal(jamais.dataset.vu, "non", "jamais vu → le CSS doit pouvoir peindre le parchemin");
  assert.equal(relu.dataset.vu, "oui", "déjà vu → contour seul");
  assert.notEqual(jamais.getAttribute("aria-label"), relu.getAttribute("aria-label"),
    "⚠️ un parchemin plein ne dit rien à qui ne voit pas l'écran : les deux états " +
    "doivent se prononcer différemment (même exigence qu'au livre, §7 bis)");
  for (const b of [jamais, relu]) {
    assert.equal(b.className, "tuto-point");
    assert.equal(b.type, "button");
  }
});

test("C2 — sans option, le `?` appelle : un guide jamais ouvert est le cas par défaut", () => {
  assert.equal(renderPointInterrogation(() => {}).dataset.vu, "non",
    "⛔ le défaut sûr est « jamais vu » : un `?` muet par défaut cacherait l'aide " +
    "à celui qui ne l'a jamais lue. Une absence n'est jamais une réponse.");
});

test("C3 — l'état du guide est UNE CLEF PAR ÉTAPE, jamais un drapeau global", () => {
  /* ⛔ Un seul drapeau aurait éteint les neuf autres `?` au premier clic —
     c'est-à-dire qu'il aurait menti huit fois sur dix. */
  const memoire = new Map();
  globalThis.window = { localStorage: {
    getItem: (k) => (memoire.has(k) ? memoire.get(k) : null),
    setItem: (k, v) => memoire.set(k, String(v))
  } };
  assert.equal(guideVu("species"), false, "rien n'a été lu : le défaut est « jamais vu »");
  setGuideVu("species");
  assert.equal(guideVu("species"), true);
  assert.equal(guideVu("skills"), false,
    "avoir lu le guide de Species ne dit RIEN de celui des Compétences");
  assert.ok([...memoire.keys()].every((k) => k.startsWith("fhpc.guide.vu.")),
    "les clefs doivent rester nommées par étape");
});

test("C4 — ⚔️ ATTAQUE : un `localStorage` qui JETTE ne fait pas tomber le `?`", () => {
  /* Mode privé, quota, iframe cloisonnée. Un guide n'est pas une raison de
     faire tomber le builder — même loi qu'aux deux drapeaux du tutoriel. */
  globalThis.window = { localStorage: {
    getItem() { throw new Error("SecurityError"); },
    setItem() { throw new Error("SecurityError"); }
  } };
  assert.equal(guideVu("class"), false, "on retombe sur le défaut, on ne jette pas");
  assert.doesNotThrow(() => setGuideVu("class"), "sans mémoire, tant pis — mais pas d'exception");
});
