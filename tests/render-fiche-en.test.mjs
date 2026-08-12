/* ══ LES TESTS D'ACCEPTATION DU LOT 40 — LE PAQUET ANGLAIS ═════════════

   Précédent suivi : tests/render-fiche.test.mjs (lot 25). CE fichier ne
   REJOUE PAS les 20 tests français — ils restent inchangés, verts, et ils
   prouvent déjà toute la mécanique de `modele()`/la marche/les tranches. Ce
   qui est NEUF au lot 40, et qui n'était donc gardé par rien avant lui :

   1. Les 21 rubriques apparaissent en ANGLAIS, le compte lu dans le schéma.
   2. Chaque mot anglais a son identifiant — et un identifiant SANS mot dans
      un paquet JETTE (le mécanisme de src/labels.mjs, réemployé).
   3. Les deux paquets (LIBELLES/LIBELLES_EN, MOTS/MOTS_EN) couvrent le MÊME
      jeu d'identifiants — le jour où l'un gagne une clef, l'autre rougit.
   4. ⚔️ L'ATTAQUE, rejouée en anglais : un total menteur s'affiche menteur.
   5. Une rubrique vide affiche sa RAISON en anglais, jamais un blanc.
   6. Un personnage SRD pur (aucune couche FH montée) rend une fiche
      anglaise complète, sans une ligne de FH.
   7. Le garde du lot 38 (tests/ui-jetons.test.mjs) reste vert — vérifié en
      l'exécutant seul, ci-dessous en commentaire de synthèse ; il fait
      partie de la suite complète (`npm test`) comme n'importe quel autre
      fichier, ce lot n'a touché aucun octet de shell.css. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ROOT, makeHarness, acceptanceDocument } from "./build-harness.mjs";
import { render, rubriqueDe, echappe, LIBELLES, MOTS, LIBELLES_EN, MOTS_EN } from "../src/tools/render-fiche.mjs";
import { createLabels, renderUnderived, EN_UNDERIVED } from "../src/labels.mjs";
import { FH_UNDERIVED_EN } from "../src/modules/fh/labels.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

/* LOT 41 — la même table que `render-fiche.mjs` compose pour `lang="en"`. */
const enUnderived = createLabels(EN_UNDERIVED, FH_UNDERIVED_EN);

const schema = JSON.parse(readFileSync(join(ROOT, "schemas/fh-char.schema.json"), "utf8"));
const RUBRIQUES = schema.$defs.resolved.required;

const exemple = exempleFhEn();

function section(html, cle) {
  const trouve = new RegExp(`<section data-rubrique="${cle}">[\\s\\S]*?</section>`).exec(html);
  return trouve === null ? null : trouve[0];
}

/* ══ 1 — LES 21 RUBRIQUES, EN ANGLAIS ══════════════════════════════════ */

test("les 21 rubriques de `resolved` apparaissent en anglais, et la liste vient du schéma", () => {
  assert.equal(RUBRIQUES.length, 21, "le contrat en déclare 21 — inchangé depuis le lot 25");
  const html = render(exemple.document, exemple.report, "en");
  for (const cle of RUBRIQUES) {
    assert.ok(section(html, cle) !== null, `la rubrique « ${cle} » a sa place à l'écran anglais`);
  }
  const rendues = [...html.matchAll(/<section data-rubrique="([^"]+)">/g)].map((match) => match[1]);
  assert.deepEqual(rendues.slice().sort(), RUBRIQUES.slice().sort(), "ni de plus, ni de moins qu'en français");

  /* Les TITRES eux-mêmes sont ceux de LIBELLES_EN, pas ceux de LIBELLES. */
  for (const cle of RUBRIQUES) {
    const bloc = section(html, cle);
    assert.ok(bloc.includes(echappe(LIBELLES_EN[cle])), `« ${cle} » porte son titre anglais « ${LIBELLES_EN[cle]} »`);
  }
});

/* ══ 2 — CHAQUE MOT ANGLAIS A SON IDENTIFIANT, UN ID SANS MOT JETTE ═══ */

test("un identifiant sans mot dans un paquet JETTE — le mécanisme de src/labels.mjs, réemployé", () => {
  /* Reproduit exactement ce que `packFor("en")` fait à l'intérieur de
     render-fiche.mjs, mais sur un paquet DÉLIBÉRÉMENT amputé — la preuve que
     l'absence d'un mot ne peut pas se glisser en silence jusqu'à l'écran. */
  const { titreRapport, ...amputeEn } = MOTS_EN;
  const t = createLabels(amputeEn);
  assert.throws(
    () => t("titreRapport"),
    /no label for "titreRapport"/,
    "un identifiant sans mot jette, il ne rend ni blanc ni l'id nu"
  );
  /* Le contre-exemple : le paquet COMPLET ne jette sur aucun des ids que
     render() consomme réellement — sinon le test précédent ne prouverait
     que l'amputation, jamais la complétude du vrai paquet. */
  const complet = createLabels(MOTS_EN);
  for (const id of Object.keys(MOTS_EN)) assert.doesNotThrow(() => complet(id));
});

test("render(…, \"en\") ne jette sur aucun mot — la couverture réelle, pas seulement déclarée", () => {
  /* Rejoue les scénarios qui poussent le plus de branches de mots distinctes :
     l'exemple complet (surcharge, adressable/inadressable, listes vides…),
     un document sans rapport, et un document sans `resolved`. Si un seul
     appel à `mots(id)` manquait sa clef, l'un des trois lèverait. */
  assert.doesNotThrow(() => render(exemple.document, exemple.report, "en"));
  assert.doesNotThrow(() => render(exemple.document, undefined, "en"));
  const ampute = structuredClone(exemple.document);
  delete ampute.resolved;
  assert.doesNotThrow(() => render(ampute, exemple.report, "en"));
});

/* ══ 3 — LES DEUX PAQUETS COUVRENT LE MÊME JEU D'IDENTIFIANTS ═════════ */

test("LIBELLES et LIBELLES_EN couvrent le même jeu d'identifiants, tous deux ceux du schéma", () => {
  assert.deepEqual(Object.keys(LIBELLES_EN).slice().sort(), Object.keys(LIBELLES).slice().sort(),
    "le français et l'anglais nomment les mêmes rubriques — le jour où l'un en gagne une, l'autre rougit");
  assert.deepEqual(Object.keys(LIBELLES_EN).slice().sort(), RUBRIQUES.slice().sort());
});

test("MOTS et MOTS_EN couvrent le même jeu d'identifiants", () => {
  assert.deepEqual(Object.keys(MOTS_EN).slice().sort(), Object.keys(MOTS).slice().sort(),
    "le français et l'anglais portent les mêmes ~22 mots d'interface — même ensemble fermé");
});

/* ══ 4 — ⚔️ L'ATTAQUE, REJOUÉE EN ANGLAIS ══════════════════════════════ */

test("⚔️ ATTAQUE (anglais) — un total qui contredit son détail s'affiche MENTEUR, il n'est pas recalculé", () => {
  const menteur = structuredClone(exemple.document);
  const stat = menteur.resolved.stats[0];
  const vraieSomme = stat.breakdown.reduce((total, ligne) => total + ligne.value, 0);
  stat.value = 99;
  assert.notEqual(99, vraieSomme, "et 99 n'est pas la somme — sinon l'attaque ne prouverait rien");

  const bloc = section(render(menteur, exemple.report, "en"), "stats");
  const total = new RegExp(`data-path="resolved\\.stats\\[${stat.id}\\]\\.value"[^>]*>[^<]*</code><b>([^<]*)</b>`)
    .exec(bloc);
  assert.ok(total !== null, "le total est bien rendu");
  assert.equal(total[1], "99", "L'ÉCRAN ANGLAIS AFFICHE CE QUE LE DOCUMENT DIT, comme le français");
  assert.notEqual(total[1], String(vraieSomme), "il n'a pas refait l'addition à la place du moteur");

  /* L'original n'a été touché que par un clone. */
  assert.equal(exemple.document.resolved.stats[0].value, vraieSomme);
});

/* ══ 5 — UNE RUBRIQUE VIDE AFFICHE SA RAISON, EN ANGLAIS ══════════════ */

/* REWRITTEN 2026-08-13 (lot 41) — LE TITRE ET LA PREUVE ONT CHANGÉ DE SENS,
   PAS SEULEMENT LA FORME. Avant ce lot, « le moteur ne traduit rien » disait
   une vérité gênante : le moteur ne parlait QUE français, donc l'écran
   anglais affichait une raison française au milieu d'une fiche anglaise —
   exactement le défaut qu'Eric a tranché de corriger le 2026-08-13 (« je veux
   que les persos soient en anglais »). Le moteur rend maintenant `{key,
   params}` ; c'est CETTE page qui choisit le mot, dans la langue demandée.
   La preuve n'est donc plus « le texte français traverse tel quel » mais
   « le texte ANGLAIS du paquet EN_UNDERIVED apparaît, jamais le français ». */
test("privé d'une rubrique, l'écran anglais affiche la RAISON en anglais — jamais un blanc, jamais du français", () => {
  const h = makeHarness();
  const sortie = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.deepEqual(sortie.resolved.stats, [], "la privation a bien eu lieu : `stats` est vide");

  const declaration = sortie.underived.find((entree) => entree.field === "stats");
  assert.ok(declaration, "et le moteur, lui, dit pourquoi — avec une clef, pas une phrase");

  const html = render(sortie.document, sortie, "en");
  const bloc = section(html, "stats");
  const raisonEn = renderUnderived(declaration, enUnderived);
  assert.ok(bloc.includes(echappe(MOTS_EN.nonDerive)), "la rubrique porte l'en-tête anglais des déclarations");
  assert.ok(bloc.includes(echappe(raisonEn)), "et la RAISON est le mot ANGLAIS du paquet EN_UNDERIVED");
  assert.doesNotMatch(raisonEn, /[«»]|aucun module de statistique/,
    "ce n'est plus la phrase française — un mot anglais authentique, pas une citation");
  assert.ok(!bloc.includes(echappe(MOTS_EN.videSansRaison)), "elle n'est donc pas signalée comme vide sans raison");

  const sansRapport = section(render(sortie.document, undefined, "en"), "stats");
  assert.ok(!sansRapport.includes(echappe(raisonEn)), "sans rapport, la raison a disparu du monde");
  assert.ok(sansRapport.includes(echappe(MOTS_EN.videSansRaison)), "et l'écran anglais le DIT au lieu de laisser une case vide");
});

/* ══ 6 — UN PERSONNAGE SRD PUR, SANS UNE LIGNE DE FH ═══════════════════ */

test("un personnage SRD pur (aucune couche FH montée) rend une fiche anglaise complète, sans une ligne de FH", () => {
  /* `makeHarness()` par défaut ne monte QUE le SRD (+ une couche homebrew de
     scénario) — aucun module `fh:*` n'est branché (`options.modules`
     absent). C'est le MÊME harnais que le test §5 : ici, on vérifie la forme
     entière de la sortie plutôt qu'une seule rubrique privée. */
  const h = makeHarness();
  const sortie = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });

  const html = render(sortie.document, sortie, "en");
  for (const cle of RUBRIQUES) {
    assert.ok(section(html, cle) !== null, `« ${cle} » est rendue même sans couche FH`);
  }
  /* Sans une ligne de FH : ni les identifiants de stat `fh:destiny` /
     `fh:skill-points` (aucun module FH n'a tourné, donc `resolved.stats`
     est vide — voir §5), ni un mot d'interface français ne fuient dans une
     page qui se dit anglaise. */
  assert.equal(html.includes("fh:"), false, "aucun identifiant de stat FH ne peut apparaître : aucun module FH n'a dérivé");
  assert.equal(sortie.resolved.stats.length, 0, "confirme la privation : rien de FH n'a été dérivé");
  assert.ok(html.includes(echappe(MOTS_EN.titreRapport)), "le bloc rapport porte son titre anglais");
  assert.equal(html.includes(MOTS.titreRapport), false, "et jamais le titre français à sa place");
});

/* ══ 7 — LE GARDE DU LOT 38 ═════════════════════════════════════════════
   Pas de test dupliqué ici : tests/ui-jetons.test.mjs fait déjà partie de la
   suite complète (`npm test`), et ce lot n'a touché aucun octet de
   `ui/builder/shell.css` — seul `src/tools/render-fiche.mjs` (§3b) et
   `ui/builder/shell.mjs` (§3a/3c, hors périmètre CSS) ont bougé. Le garder
   ici en double aurait été une copie qui diverge le jour où l'un des deux
   fichiers change sans l'autre — voir tests/render-fiche.test.mjs, même
   discipline pour « la coquille porte encore le marqueur ». */
