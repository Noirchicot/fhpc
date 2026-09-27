/* ══ LES CHEVRONS FLOTTANTS — LOT 70, invariant I.7 / B0.22 ═══════════════

   🔴 POURQUOI CE FICHIER EXISTE. `mountChevrons` était la dernière pièce du
   socle « qui se vérifie à l'œil » (socle.test.mjs, en-tête d'époque) — et
   l'œil, à 1440 × 900, a trouvé trois mensonges sous 1 026 tests verts :
   des chevrons qui FLASHENT sur un écran qui ne défile pas (Universe,
   champ 800/800), des chevrons IRRÉCUPÉRABLES à la souris une fois effacés
   (pointer-events: none, et rien d'autre qu'une molette pour les réveiller
   — le contrôle mourait SOUS le curseur), et une direction impossible qui
   restait cliquable en apparence (∨ au pied de Wizard, où chaque arrivée
   sur Class se pose).

   Depuis le lot 68, le stub sait émettre `scroll` et poser une colonne ;
   depuis ce lot, il sait dire la hauteur du champ et celle du contenu. Le
   minuteur, lui, se mesure aux horloges factices de node:test — jamais à
   la vraie (1 s de vrai sommeil par clause ferait payer la suite entière).

   ⚠️ CE QUE CES TESTS NE PEUVENT PAS DIRE. Le stub ne connaît ni le CSS
   (l'opacité, la transition, le masque d'amorce se regardent au
   navigateur), ni `pointer-events` (il ne fait pas de hit-testing : qui
   REÇOIT un survol est une affaire de navigateur). Ils prouvent la
   MACHINE À ÉTATS — qui s'allume, qui retient, qui s'éteint, qui dit
   vrai — pas la peinture. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument, poserUneColonne } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
/* Le socle étrangle ses lectures de géométrie par `requestAnimationFrame`
   (« une image, pas un pixel »). On le rend SYNCHRONE : ces tests mesurent
   la logique, pas l'ordonnanceur — même choix que spy.test.mjs. */
globalThis.requestAnimationFrame = (fn) => { fn(); return 0; };

const { mountChevrons, CHEVRON_REST_MS } = await import("../ui/builder/socle.mjs");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI_DIR = path.join(HERE, "..", "ui", "builder");

/** Le cadre tel que `mountFrame` le pose : un hôte, deux boutons dans
 *  l'ordre monter/descendre, et un champ de 800 px — la géométrie réelle
 *  mesurée sur l'écran Class à 1 440 × 900 (12 fiches de 800). */
function monterUnCadre({ nb = 12, hauteur = 800, champ = 800 } = {}) {
  const host = document.createElement("div");
  host.className = "stage-chevrons";
  const monte = document.createElement("button");
  monte.className = "stage-chevron";
  const descend = document.createElement("button");
  descend.className = "stage-chevron";
  host.append(monte, descend);

  const scroller = document.createElement("main");
  for (let i = 0; i < nb; i += 1) {
    const fiche = document.createElement("article");
    fiche.dataset.snap = "";
    scroller.append(fiche);
  }
  poserUneColonne(scroller, { top: 100, hauteurDuChamp: champ, hauteurDesEnfants: hauteur });

  const api = mountChevrons(host, scroller);
  return { host, scroller, monte, descend, api };
}

/* ── A. L'ANNONCE (settle) — la réserve de découvrabilité, servie ─────── */

test("A — settle(annonce) sur une surface qui défile : visibles UNE seconde, puis effacés (B0.22b)", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { host, api } = monterUnCadre();
  assert.equal(host.dataset.visible, "false", "au montage, cachés — la scène n'a encore rien promis");

  api.settle(true);
  assert.equal(host.dataset.visible, "true", "une surface neuve qui défile S'ANNONCE");
  t.mock.timers.tick(CHEVRON_REST_MS - 1);
  assert.equal(host.dataset.visible, "true", "l'annonce dure la seconde d'Eric, pas moins");
  t.mock.timers.tick(1);
  assert.equal(host.dataset.visible, "false", "puis le repos les efface — B0.22b, inchangé");
});

test("A bis — 🔴 RIEN À DÉFILER, RIEN À PROMETTRE : le flash d'Universe à 1440 est mort", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  /* Une seule fiche de 800 dans un champ de 800 — scrollHeight == clientHeight,
     la mesure exacte d'Universe en Large. */
  const { host, scroller, monte, descend, api } = monterUnCadre({ nb: 1 });
  api.settle(true);
  assert.equal(host.dataset.visible, "false",
    "l'ancien montage flashait deux contrôles morts au chargement — une promesse de défilement sans défilement");
  assert.equal(scroller.dataset.more, "false", "et l'amorce n'annonce rien non plus");
  assert.equal(monte.disabled, true, "∧ n'est pas une direction ici");
  assert.equal(descend.disabled, true, "∨ non plus");
});

/* ── B. B0.22c — ils reviennent au défilement, et se reposent ────────── */

test("B — un geste les rallume, le repos les efface, un geste les rallume encore", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { host, scroller } = monterUnCadre();

  scroller.scrollTop = 800;
  assert.equal(host.dataset.visible, "true", "B0.22c : dès qu'on défile");
  t.mock.timers.tick(CHEVRON_REST_MS);
  assert.equal(host.dataset.visible, "false", "B0.22b : ~1 s de repos");
  scroller.scrollTop = 1600;
  assert.equal(host.dataset.visible, "true", "et le cycle reprend — c'est la barre iOS d'Eric");
});

/* ── C. LA SOURIS POSÉE N'EST PAS DU REPOS — le « morts à 1440 » ─────── */

test("C — 🔴 le survol souris RETIENT le minuteur ; le départ du curseur le réarme", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { host, scroller } = monterUnCadre();

  scroller.scrollTop = 800;
  assert.equal(host.dataset.visible, "true");
  host.dispatchEvent({ type: "pointerover", pointerType: "mouse" });
  t.mock.timers.tick(CHEVRON_REST_MS * 5);
  assert.equal(host.dataset.visible, "true",
    "MESURÉ à 1440 : sans ça, le contrôle s'efface SOUS la main qui allait recliquer, " +
    "et seul un geste de molette le réveille — un chevron qu'on ne peut utiliser qu'une fois n'est pas un contrôle");

  host.dispatchEvent({ type: "pointerout", pointerType: "mouse" });
  t.mock.timers.tick(CHEVRON_REST_MS - 1);
  assert.equal(host.dataset.visible, "true", "le départ du curseur réarme la seconde PLEINE");
  t.mock.timers.tick(1);
  assert.equal(host.dataset.visible, "false", "puis le repos reprend ses droits");
});

test("C bis — le doigt n'est PAS une souris : un pointerover tactile ne retient rien (360 inchangé)", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { host, scroller } = monterUnCadre();

  scroller.scrollTop = 800;
  host.dispatchEvent({ type: "pointerover", pointerType: "touch" });
  t.mock.timers.tick(CHEVRON_REST_MS);
  assert.equal(host.dataset.visible, "false",
    "un tap émet pointerover AVANT de partir — s'il retenait, chaque toucher gèlerait les chevrons à l'écran ; " +
    "à 360, le comportement d'Eric (B0.22b) ne bouge pas d'un octet");
});

test("C ter — le focus clavier montre et retient : un contrôle qu'on atteint au Tab doit se voir", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { host } = monterUnCadre();

  host.dispatchEvent({ type: "focusin" });
  assert.equal(host.dataset.visible, "true", "le focus ALLUME — il n'attend pas un défilement");
  t.mock.timers.tick(CHEVRON_REST_MS * 5);
  assert.equal(host.dataset.visible, "true", "et retient tant qu'il est là");
  host.dispatchEvent({ type: "focusout" });
  t.mock.timers.tick(CHEVRON_REST_MS);
  assert.equal(host.dataset.visible, "false");
});

test("C quater — 🔴 le focus de CLIC ne retient pas : après le tap, le repos B0.22b reprend", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { host, scroller, descend } = monterUnCadre();

  /* TROUVÉ EN CLIQUANT POUR DE VRAI, à 1440 : un clic sur ∨ pose AUSSI le
     focus (Chrome, souris ET tap), et la première version de ce montage
     gelait alors les chevrons à l'écran pour toujours — B0.22b mort après
     le premier usage. Un focus dont `:focus-visible` dit « pas clavier »
     ne doit rien retenir. */
  scroller.scrollTop = 800;
  descend.matches = () => false; // un focus posé par un CLIC : `:focus-visible` ne matche pas
  host.dispatchEvent({ type: "focusin", target: descend });
  t.mock.timers.tick(CHEVRON_REST_MS);
  assert.equal(host.dataset.visible, "false",
    "le doigt a tapé, la seconde est passée : les chevrons se reposent — ils ne restent pas gelés à l'écran");
});

/* ── D. L'AMORCE DIT VRAI — data-more, l'interrupteur du masque ──────── */

test("D — data-more : « il reste du contenu plus bas », et il retombe au bout", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { scroller } = monterUnCadre(); // mou = 12 × 800 − 800 = 8 800

  assert.equal(scroller.dataset.more, "true", "au montage, tout est plus bas");
  scroller.scrollTop = 8800;
  assert.equal(scroller.dataset.more, "false",
    "au bout, une amorce qui resterait MENTIRAIT sur la dernière ligne — le fondu s'éteint");
  scroller.scrollTop = 4000;
  assert.equal(scroller.dataset.more, "true", "et se rallume dès qu'il y a de nouveau une suite");
});

/* ── E. LES BOUTS DE COURSE — une direction impossible s'éteint ──────── */

test("E — en haut ∧ s'éteint, au pied ∨ s'éteint, au milieu les deux vivent", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { scroller, monte, descend } = monterUnCadre();

  assert.equal(monte.disabled, true, "en haut, « monter » n'est pas une direction");
  assert.equal(descend.disabled, false);

  scroller.scrollTop = 4000;
  assert.equal(monte.disabled, false, "au milieu, les deux directions existent");
  assert.equal(descend.disabled, false);

  scroller.scrollTop = 8800;
  assert.equal(monte.disabled, false);
  assert.equal(descend.disabled, true,
    "MESURÉ : chaque arrivée sur Class se pose au pied (Wizard, scrollTop 8800/8800) — " +
    "l'ancien ∨ y restait cliquable en apparence, un contrôle mort de plus");
});

/* ── F. step() — un cran = une hauteur de champ, et il rallume ───────── */

test("F — step(±1) défile d'exactement un champ (II.1 : un cran = une fiche) et rallume", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { host, scroller, api } = monterUnCadre();

  api.step(1);
  assert.equal(scroller.scrollTop, 800, "descendre d'un cran = descendre d'un champ");
  assert.equal(host.dataset.visible, "true", "le geste rallume — B0.22c");
  api.step(1);
  assert.equal(scroller.scrollTop, 1600);
  api.step(-1);
  assert.equal(scroller.scrollTop, 800, "et remonter est le même cran, en face");
});

/* ── G. LE RATTRAPAGE APRÈS RESIZE/CONTENU — et l'hygiène du minuteur ── */

test("G — le champ grandit jusqu'à tout montrer : settle() éteint TOUT, sans minuteur qui traîne", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { host, scroller, monte, descend, api } = monterUnCadre();

  scroller.scrollTop = 800;
  assert.equal(host.dataset.visible, "true");
  t.mock.timers.tick(400); // le minuteur de B0.22b court encore (reste 600 ms)

  /* La fenêtre grandit : les 12 fiches tiennent d'un coup (9 600 = 9 600).
     C'est le chemin réel — `resize` → `refresh()` → `settle()`. */
  poserUneColonne(scroller, { top: 100, hauteurDuChamp: 9600, hauteurDesEnfants: 800 });
  api.settle();
  assert.equal(host.dataset.visible, "false", "plus de mou, plus de chevrons");
  assert.equal(scroller.dataset.more, "false", "plus d'amorce non plus");
  assert.equal(monte.disabled, true);
  assert.equal(descend.disabled, true);

  /* Et le minuteur d'avant est bien MORT : la fenêtre se resserre, la
     surface s'annonce — si l'ancien réveil (posé à t+1 000, il en reste
     600) avait survécu, il éteindrait l'annonce neuve 400 ms trop tôt. */
  poserUneColonne(scroller, { top: 100, hauteurDuChamp: 800, hauteurDesEnfants: 800 });
  api.settle(true);
  assert.equal(host.dataset.visible, "true");
  t.mock.timers.tick(CHEVRON_REST_MS - 1);
  assert.equal(host.dataset.visible, "true",
    "l'annonce neuve vit sa seconde PLEINE — aucun minuteur fantôme ne l'écourte");
  t.mock.timers.tick(1);
  assert.equal(host.dataset.visible, "false");
});

/* ══ ⚔️ LES ATTAQUES ═════════════════════════════════════════════════════ */

test("⚔️ ATTAQUE — sans géométrie déclarée, le montage JETTE : pas de garde creux sur du vide", () => {
  const host = document.createElement("div");
  const nu = document.createElement("main");
  assert.throws(() => mountChevrons(host, nu), /sans géométrie déclarée/,
    "un scrollHeight de zéros dirait « rien à défiler » à un test qui a oublié sa colonne — " +
    "la famille de garde creux que ce dépôt a payée deux fois (le scroll-snap mort sous 935 verts, la virgule sous 993)");
});

/* Le patron `markPressed()` (lot 57) : une brique, UN écrivain, UN garde.
   `data-visible` (l'hôte) et `data-more` (la scène) n'ont qu'un écrivain —
   `socle.mjs`. Un écran qui les écrirait ferait mentir le minuteur ou
   l'amorce sans qu'aucun test de l'écran ne le voie. */
function ecrivainsInterdits(fichiers) {
  const hits = [];
  for (const [nom, texte] of fichiers) {
    if (nom.endsWith("socle.mjs")) continue;
    for (const motif of [/dataset\.visible\s*=/, /dataset\.more\s*=/, /setAttribute\(\s*["']data-(?:visible|more)["']/]) {
      if (motif.test(texte)) hits.push(`${nom} : ${motif}`);
    }
  }
  return hits;
}

test("⚔️ GARDE — data-visible et data-more n'ont qu'UN écrivain : socle.mjs", () => {
  const fichiers = fs.readdirSync(UI_DIR)
    .filter((f) => f.endsWith(".mjs"))
    .map((f) => [f, fs.readFileSync(path.join(UI_DIR, f), "utf8")]);
  assert.deepEqual(ecrivainsInterdits(fichiers), [],
    "le minuteur et l'amorce n'ont de sens que si personne d'autre ne pose leur vérité");

  /* L'attaque en mémoire : un écran qui s'écrirait data-more rougit. */
  const mutes = [...fichiers, ["class-step.mjs (muté)", "node.dataset.more = \"true\";"]];
  assert.equal(ecrivainsInterdits(mutes).length, 1, "le scanner voit l'écran fautif");
});
