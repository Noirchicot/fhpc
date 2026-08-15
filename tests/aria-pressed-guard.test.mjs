/* ══ LE GARDE DU LOT 57 — CHAQUE BOUTON À ÉTAT L'ANNONCE ═══════════════════

   La commande (LOT-57-ARIA-ETAT.md, §1.2) mesurait SEPT écritures directes
   de `dataset.active` dans `ui/` (`carnet.mjs` ×2, `skills-step.mjs` ×3,
   `universe-step.mjs` ×1, `inheritance-step.mjs` ×1), toutes lues par le CSS
   (`shell.css:162-165`, `:205`, `:441`) et AUCUNE par `aria-pressed`
   (`grep -rn "aria-pressed" ui/` → 0, gardé lisible depuis le lot 56).

   ⛔ CE LOT N'A PAS ÉCRIT SEPT CORRECTIONS — voir `carnet.mjs`, où
   `markPressed(btn, active)` est devenue la SEULE fonction du dépôt qui pose
   `dataset.active`. Une correction à sept endroits qui divergent est
   EXACTEMENT la faute payée par le lot 53 (`carnet.mjs:108`/`:109`) ; ce
   garde la rend impossible à rouvrir en silence.

   DEUX PREUVES DIFFÉRENTES, PARCE QU'AUCUNE SEULE NE SUFFIT :

     A. STRUCTURELLE — aucun fichier de `ui/builder/` n'écrit
        `.dataset.active = …` HORS de `carnet.mjs`. Sans cette preuve, un
        futur lot pourrait réintroduire une huitième écriture directe (donc
        potentiellement sans `aria-pressed`) sans que rien ne le voie — la
        DIVERGENCE elle-même, pas seulement son symptôme du jour.
        ⚔️ ATTAQUÉE ci-dessous sur une source SYNTHÉTIQUE (jamais le vrai
        dépôt sali, même loi que `tests/tree-immuable.test.mjs`) avant d'être
        vérifiée sur l'arbre réel — un détecteur qu'on n'a jamais vu rougir
        n'est pas un détecteur.

     B. COMPORTEMENTALE — `markPressed` elle-même pose bien LES DEUX
        attributs, avec LA MÊME valeur. La preuve A dit « tout le monde
        appelle cette fonction » ; celle-ci dit « cette fonction fait ce
        qu'elle promet ». Aucune des deux ne suffit sans l'autre : A sans B
        laisserait passer une fonction unique mais fautive ; B sans A
        laisserait passer un neuvième site qui la contournerait.

   UNE TROISIÈME, SUR LE DOM RÉEL — pas la sortie d'un outil qui résume
   (leçon du §3 de la commande, « ne mesure pas à la sortie d'un outil qui
   la résume ») : les écrans sont RENDUS avec de vrais `ctx` (mêmes fixtures
   que `skills-step.test.mjs`/`class-species-steps.test.mjs`/etc.), et
   CHAQUE élément qui porte `data-active` dans l'arbre produit est vérifié
   un par un. Une couverture MINIMALE par écran est exigée (pas seulement
   « au moins un » sur l'ensemble) : un écran qui ne produirait plus AUCUN
   bouton à état passerait sous silence un garde qui ne compte que le total
   — c'est la faute nommée par le lot 49 (« son propre garde creux »).

   🔴 LA LIMITE DE CE GARDE, ÉCRITE ICI PARCE QU'ELLE NE SE VOIT PAS TOUTE
   SEULE (loi du dépôt depuis la nuit du 13) : il prouve que `data-active`
   et `aria-pressed` PORTENT LA MÊME VALEUR, jamais que `aria-pressed` est le
   PATRON ARIA le plus approprié (voir `carnet.mjs`, tête de `markPressed`,
   pour l'arbitrage « bouton à bascule » contre « groupe radio »), ni que le
   TEXTE d'un `aria-label` voisin est juste (ça, c'est le garde des trois
   clefs machine, plus bas dans ce fichier). Et il ne tourne dans AUCUN vrai
   lecteur d'écran — comme tout ce dépôt (`tests/dom-stub.mjs`), c'est un
   DOM minimal, pas un navigateur. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { loadSources } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const { markPressed } = await import("../ui/builder/carnet.mjs");
const { renderAbilitiesStep } = await import("../ui/builder/abilities-step.mjs");
const { renderClassChoices } = await import("../ui/builder/class-step.mjs");
const { renderSpeciesChoices } = await import("../ui/builder/species-step.mjs");
const { renderCatalogueCards } = await import("../ui/builder/catalogue.mjs");
const { renderClassCardBody } = await import("../ui/builder/class-step.mjs");
const { renderSkillsStep } = await import("../ui/builder/skills-step.mjs");
const { renderInheritanceStep } = await import("../ui/builder/inheritance-step.mjs");
const { renderDestinyStep, currentArcanaId } = await import("../ui/builder/destiny-step.mjs");
const { renderEquipmentStep } = await import("../ui/builder/equipment-step.mjs");
const { renderUniverseStep } = await import("../ui/builder/universe-step.mjs");

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "..");
const UI_DIR = path.join(ROOT, "ui", "builder");

/* ══ A — STRUCTURELLE : `carnet.mjs` EST LA SEULE PLUME ═══════════════════ */

/** La même règle que la preuve réelle plus bas, appliquée à une liste
 *  `{name, text}` fournie — jamais au disque. C'est CE découpage qui permet
 *  à l'attaque de nourrir une source inventée sans toucher un octet du vrai
 *  arbre (même loi que `tests/tree-immuable.test.mjs`, tête de fichier). */
function ecrituresHorsCarnet(sources) {
  const motif = /\.dataset\.active\s*=/;
  return sources
    .filter((s) => path.basename(s.name) !== "carnet.mjs" && motif.test(s.text))
    .map((s) => s.name);
}

test("ATTAQUE — le détecteur voit une écriture de dataset.active hors carnet.mjs, sur une source inventée", () => {
  const source = {
    name: "un-nouveau-fichier.mjs",
    text: 'btn.dataset.active = String(active);\nbtn.textContent = "X";'
  };
  assert.deepEqual(ecrituresHorsCarnet([source]), ["un-nouveau-fichier.mjs"],
    "un détecteur qu'on n'a jamais vu rougir n'est pas un détecteur (leçon du lot 56/57)");
});

test("ATTAQUE — un commentaire qui EN PARLE (comme celui de carnet.mjs, tête de fichier) ne déclenche rien", () => {
  /* `stripComments` (via `loadSources`) retire les commentaires avant que
     le motif ne les voie — sinon le commentaire de tête de `carnet.mjs`,
     qui NOMME `.dataset.active = …` pour expliquer pourquoi il n'est écrit
     qu'ici, se dénoncerait lui-même. Reproduit ici sans DOM ni disque. */
  const source = {
    name: "carnet.mjs",
    text: " un commentaire dépouillé ne contient plus le motif littéral "
  };
  assert.deepEqual(ecrituresHorsCarnet([source]), []);
});

test("LE FAIT — dans le vrai ui/builder/, seul carnet.mjs écrit `.dataset.active =`", () => {
  const sources = loadSources([UI_DIR], ROOT);
  assert.ok(sources.length >= 10, "le périmètre doit couvrir les ~14 fichiers de ui/builder/ (mesure de garde-fou)");
  assert.deepEqual(ecrituresHorsCarnet(sources), [],
    "toute écriture de dataset.active hors carnet.mjs peut oublier aria-pressed — passe par markPressed()");
});

/* ══ B — COMPORTEMENTALE : `markPressed` POSE VRAIMENT LES DEUX ═══════════ */

test("markPressed(btn, true) pose data-active ET aria-pressed à \"true\"", () => {
  const btn = document.createElement("button");
  markPressed(btn, true);
  assert.equal(btn.dataset.active, "true");
  assert.equal(btn.getAttribute("aria-pressed"), "true");
});

test("markPressed(btn, false) pose data-active ET aria-pressed à \"false\" — jamais l'attribut simplement absent", () => {
  const btn = document.createElement("button");
  markPressed(btn, false);
  assert.equal(btn.dataset.active, "false");
  assert.equal(btn.getAttribute("aria-pressed"), "false");
  /* Un `aria-pressed` ABSENT dit « ce n'est pas un bouton à bascule » à un
     lecteur d'écran (sémantique différente d'un `aria-pressed="false"`,
     WAI-ARIA) : la commande veut que le bouton ANNONCE son état, y compris
     quand cet état est « non sélectionné ». */
  assert.ok(btn.hasAttribute("aria-pressed"));
});

/* ══ C — SUR LE DOM RÉEL : CHAQUE data-active RENDU PORTE SON aria-pressed
   ══════════════════════════════════════════════════════════════════════
   Les mêmes fixtures que les suites dédiées de chaque écran
   (`exempleFhEn()`, comme `skills-step.test.mjs`/`class-species-steps
   .test.mjs`/`destiny-step.test.mjs`/`inheritance-step.test.mjs`
   /`equipment-step.test.mjs`) — jamais un DOM composé à la main pour ce
   garde : le défaut mesuré par la commande (§3) est justement de conclure
   depuis autre chose que le DOM réel. */

const fixture = exempleFhEn();
const { report, layers } = fixture;
const query = layers.verbs.query;

/** Marche l'arbre entier (le dom-stub n'a pas de sélecteur universel `*`
 *  fiable pour TOUT nœud sans tag) et rend chaque élément qui porte
 *  `data-active` — vérifié directement sur l'ATTRIBUT, jamais sur le texte
 *  ni sur la sortie d'un outil d'inspection (leçon du §3 de la commande). */
function elementsActifs(node) {
  return node.querySelectorAll("[data-active]");
}

function assertToutBoutonActifAnnonceSonEtat(node, ecran, minimum) {
  const actifs = elementsActifs(node);
  assert.ok(actifs.length >= minimum,
    `${ecran} : attendu au moins ${minimum} élément(s) [data-active], trouvé ${actifs.length} — ` +
    "un écran qui n'en produit plus aucun rendrait ce garde creux sans le dire (lot 49)");
  for (const el of actifs) {
    assert.ok(el.hasAttribute("aria-pressed"),
      `${ecran} : un bouton [data-active] sans aria-pressed — ${el.className || el.tagName}`);
    assert.equal(el.getAttribute("aria-pressed"), el.dataset.active,
      `${ecran} : aria-pressed doit porter EXACTEMENT la même valeur que data-active — ${el.className || el.tagName}`);
  }
}

test("Abilities — chaque bouton actif de la molette de mode et des rangées de dés s'annonce", () => {
  const node = renderAbilitiesStep({ document: report.document, resolved: report.resolved, rollBatch: null }, () => {});
  assertToutBoutonActifAnnonceSonEtat(node, "Abilities", 1);
});

test("Class — les molettes du menu des choix (palier 2) s'annoncent", () => {
  /* ⚠️ PALIER 2, ET C'EST UN DÉPLACEMENT, PAS UN AFFAIBLISSEMENT (lot 58).
     Le palier 1 de Class n'a PLUS AUCUN BOUTON : la rangée de douze options
     du lot 42 a disparu, parce que l'invariant II.1 supprime le geste de
     sélection — on défile jusqu'à la classe, le défilement s'aimante, et
     `Validate` (unique, dans la barre du haut) confirme. Les boutons à état
     de cet écran vivent maintenant au palier 2, le menu des choix
     intrinsèques (B2.3) : c'est là qu'il faut aller les chercher.
     ⭐ Le garde garde donc EXACTEMENT la même force — il exige toujours au
     moins un `[data-active]` sur cet écran, à l'endroit où l'écran en
     produit. Un palier 2 qui n'en produirait plus aucun le ferait rougir. */
  const node = renderClassChoices({ decisions: report.decisions, query }, () => {});
  assertToutBoutonActifAnnonceSonEtat(node, "Class", 1);
});

test("Class — le palier 1 ne produit AUCUN bouton À ÉTAT : c'est l'invariant II.1, mesuré", () => {
  /* Le pendant du test au-dessus, et il vaut mieux que sa parole : si un
     futur lot remettait des boutons de sélection dans les douze fiches, le
     « défilement EST le choix » d'Eric serait mort sans qu'un seul test
     bronche. Celui-ci bronche.
     ⚠️ LOT 77 — le pied de fiche porte `Lore` et `Choose` (croquis du
     2026-08-15, cotés par le gabarit). Ce ne sont pas des boutons à ÉTAT :
     ils ne portent ni `data-active`, ni `aria-pressed`, ni valeur de record.
     C'est cette propriété-là qui est gardée ici — la seule qui dise « aucun
     geste de sélection », et elle est plus stricte que le compte de boutons
     qu'elle remplace.
     ⭐ CH6, 2026-08-15 — `CHOOSE` EST MAINTENANT CÂBLÉ (il valide l'écran) ET
     CE GARDE N'A PAS BOUGÉ D'UN OCTET, ce qui est exactement le signe qu'il
     gardait la bonne chose : il n'a jamais parlé de ce qu'un bouton FAIT,
     seulement de ce qu'il PORTE. Un bouton qui porterait `srd:class:en:bard`
     serait un cran de sélection ; `CHOOSE` porte un rôle et un index. */
  const node = renderCatalogueCards({ decisions: report.decisions, query, path: "class", kind: "class" }, renderClassCardBody);
  for (const bouton of node.querySelectorAll("button")) {
    assert.equal(bouton.getAttribute("data-active"), null,
      "aucun bouton à état dans la fiche (B2.1e, I.3)");
    assert.equal(bouton.getAttribute("aria-pressed"), null, "idem : rien qui s'annonce enfoncé");
    assert.equal(bouton.getAttribute("data-value"), null, "et rien qui porte un record : ce serait une sélection");
  }
  assert.ok(node.querySelectorAll("[data-snap]").length >= 12,
    "et les douze fiches portent bien leur point d'aimantation, le seul contrat avec le scrollspy");
});

test("Species — le menu du 2ᵉ palier (bourse captive ou QCM) s'annonce", () => {
  const node = renderSpeciesChoices({ decisions: report.decisions, query }, () => {});
  assertToutBoutonActifAnnonceSonEtat(node, "Species", 1);
});

test("Skills — chaque rond de palier s'annonce, et il n'y en a plus que trois par ligne", () => {
  const node = renderSkillsStep({
    resolved: report.resolved, decisions: report.decisions, violations: [], query, onAction: () => {}
  }, () => {});
  /* ⚠️ LOT 62 — LE PLANCHER A BAISSÉ, ET C'EST UNE MESURE, PAS UN
     RELÂCHEMENT. Le seuil valait 200 quand chaque ligne portait QUATRE ronds
     (le tiret compris) et que la bourse captive s'affichait ici. B7.4 a
     retiré le tiret, B7.2d a déménagé la bourse : le compte baisse
     mécaniquement d'un quart. Le plancher suit la mesure, il ne la précède
     pas — et il reste un plancher LARGE, pas un compte exact. */
  assertToutBoutonActifAnnonceSonEtat(node, "Skills", 150);
  const lignes = node.querySelectorAll(".skills-row");
  assert.ok(lignes.length > 50, `témoin : la grille est bien peuplée (${lignes.length} lignes)`);
  for (const ligne of lignes) {
    const ronds = ligne.querySelectorAll(".skills-tier-btn");
    assert.ok(ronds.length === 0 || ronds.length === 3,
      `B7.4 : une ligne porte TROIS ronds, ou aucun (lignes sans palier achetable) — trouvé ${ronds.length}`);
  }
});

test("Inheritance — la carte de don d'origine (fabriquée à la main, TROISIÈME instance du lot 53) s'annonce", () => {
  const node = renderInheritanceStep({
    decisions: report.decisions, document: report.document, resolved: report.resolved, query
  }, () => {});
  assertToutBoutonActifAnnonceSonEtat(node, "Inheritance", 1);
});

test("Destiny — ⛔ l'écran à carte ne produit AUCUN bouton à état, et c'est voulu", () => {
  /* ⚠️ LOT 61 — CE TEST S'INVERSE, ET C'EST UNE DÉCISION. L'écran de B6 n'a
     plus de sélecteur de mode à deux boutons : il a UNE carte qu'on tape, et
     deux boutons d'ACTION (`Draw again`, `Choose yourself`) qui ne portent
     aucun état — ils font, ils ne représentent pas. Un `aria-pressed` sur
     eux mentirait : rien n'y reste « enfoncé ».
     ⭐ Le garde reste utile en s'inversant : si quelqu'un remettait un état
     sur ces boutons sans l'annoncer, `data-active` apparaîtrait ici et le
     compte cesserait d'être zéro. */
  const node = renderDestinyStep({
    document: report.document, resolved: report.resolved, query,
    intro: false, drawnId: currentArcanaId(report.document), face: "up", revealed: true
  }, () => {});
  assert.equal(node.querySelectorAll("[data-active]").length, 0,
    "aucun bouton à état sur cet écran — la carte est un geste, pas une bascule");
  assert.equal(node.querySelectorAll(".card-action").length, 2, "témoin : les deux boutons d'action SONT là");
});

test("Equipment — les pickers de gear (renderPicker) s'annoncent", () => {
  const node = renderEquipmentStep({ document: report.document, resolved: report.resolved, query }, () => {});
  assertToutBoutonActifAnnonceSonEtat(node, "Equipment", 1);
});

test("Universe & Layers — les deux boutons de pile (SRD / SRD + FH) s'annoncent", () => {
  const doc = {
    schema: "fh-char/1", id: "aria-guard-universe", name: "Sonde", lang: "en",
    units: { distance: "ft", weight: "lb" },
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: { layers: report.document.build.layers, choices: [], budgets: {}, overrides: [] }
  };
  const node = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {} }, () => {});
  assertToutBoutonActifAnnonceSonEtat(node, "Universe & Layers", 2);
});
