/* ══ LE GARDE DU CATALOGUE — LOT 60 ═══════════════════════════════════════

   LA LOI QU'IL TIENT, et elle est écrite dans ERGONOMIE-BUILDER.md, mot pour
   mot : ⛔ *« Ne recopie pas B2 ici. Une règle écrite deux fois diverge —
   c'est la loi du dépôt, et elle a déjà coûté. B3 = B2, point. »*

   Le lot 58 avait construit le catalogue à défilement aimanté DANS
   `class-step.mjs`. Le lot 60 devait faire Species, « identique à la 2 ». La
   pente naturelle était de recopier — et rien n'aurait rougi. Ce garde rend
   la copie impossible à faire en silence.

   TROIS PREUVES :
     A. STRUCTURELLE — `.catalogue-card` et `.catalogue-rail` ne sont écrits
        QUE par `catalogue.mjs`. *(`data-snap` en a été RETIRÉ au lot 62 : ce
        n'est pas un marqueur du catalogue mais du SOCLE, et Compétences s'en
        sert légitimement sans être un catalogue.)* Même patron que
        `markPressed` (lot 57) : une brique, un écrivain, un garde.
     B. LES DEUX ÉCRANS SONT VRAIMENT LE MÊME — le catalogue rend la même
        FORME pour Class et pour Species, sur de vraies fixtures : même
        nombre de fiches que d'options, même contrat `data-snap`, un seul
        cran courant au rail. Une divergence de forme se verrait ici.
     C. CE QUI LES DISTINGUE EST BIEN DISTINCT — leurs fiches ne montrent
        PAS les mêmes lignes. Sans cette preuve, on pourrait « partager » en
        aplatissant les deux écrans sur un seul contenu, ce qui serait une
        régression déguisée en factorisation.

   🔴 SA LIMITE : il prouve qu'il n'y a qu'une implémentation et qu'elle sert
   les deux écrans. Il ne dit rien de l'aimantation elle-même — ni du rail
   qui suit le doigt : ça n'existe pas dans `tests/dom-stub.mjs` (aucune mise
   en page) et se vérifie à l'œil, dans un navigateur servi. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { loadSources } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const {
  catalogueOptions, catalogueCursor, renderCatalogueRail, renderCatalogueCards
} = await import("../ui/builder/catalogue.mjs");
const { CLASS_CATALOGUE, renderClassCardBody } = await import("../ui/builder/class-step.mjs");
const { SPECIES_CATALOGUE, renderSpeciesCardBody } = await import("../ui/builder/species-step.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI_DIR = path.join(ROOT, "ui", "builder");

const fixture = exempleFhEn();
const query = fixture.layers.verbs.query;
const decisions = fixture.report.decisions;

const ECRANS = [
  { ...CLASS_CATALOGUE, body: renderClassCardBody },
  { ...SPECIES_CATALOGUE, body: renderSpeciesCardBody }
];
const ctxDe = (cfg, cursor = 0) => ({ decisions, query, path: cfg.path, kind: cfg.kind, label: cfg.label, cursor });

/* ══ A — UN SEUL ÉCRIVAIN ═════════════════════════════════════════════════ */

/* ⚠️ CORRIGÉ AU LOT 62, ET C'EST UNE ERREUR DU LOT 60 : `data-snap` était
   dans cette liste. Il n'y avait rien à y faire — SOCLE.md le désigne
   explicitement comme un contrat du SOCLE, pas du catalogue : « `data-snap`
   sur les fiches d'un défilement aimanté. C'est ce que `watchSnap` lit — le
   seul contrat entre un écran et le spy ». Compétences s'aimante sur ses
   catégories sans être un catalogue (pas de records, pas de rail vertical),
   et le garde le lui interdisait à tort.
   ⭐ Ce qui reste interdit est le COMPOSANT : personne d'autre que
   `catalogue.mjs` ne construit une fiche ou un rail de catalogue. C'est ça,
   la loi « B3 = B2, point » — pas le monopole d'un attribut. */
const MARQUEURS = [
  [/"catalogue-card /, "la fiche du catalogue"],
  [/"catalogue-rail"/, "le rail du catalogue"]
];

function ecrivainsHorsCatalogue(sources) {
  const hits = [];
  for (const source of sources) {
    if (path.basename(source.name) === "catalogue.mjs") continue;
    for (const [motif, libelle] of MARQUEURS) {
      if (motif.test(source.text)) hits.push(`${source.name} : ${libelle}`);
    }
  }
  return hits;
}

test("A — dans le vrai ui/builder/, seul catalogue.mjs construit un catalogue", () => {
  const sources = loadSources([UI_DIR], ROOT);
  assert.ok(sources.length >= 10, "garde-fou de portée : le balayage doit voir tout ui/builder/");
  assert.deepEqual(ecrivainsHorsCatalogue(sources), [],
    "un second catalogue divergerait du premier — c'est ce que « B3 = B2, point » interdit");
});

test("⚔️ ATTAQUE A — un écran qui recopierait le catalogue est vu, sur une source inventée", () => {
  const source = {
    name: "inheritance-step.mjs",
    text: 'const card = el("section", "catalogue-card dalle-majeure");\nconst rail = el("ol", "catalogue-rail");'
  };
  assert.deepEqual(ecrivainsHorsCatalogue([source]), [
    "inheritance-step.mjs : la fiche du catalogue",
    "inheritance-step.mjs : le rail du catalogue"
  ]);
});

/* ══ B — LES DEUX ÉCRANS RENDENT LA MÊME FORME ════════════════════════════ */

for (const cfg of ECRANS) {
  test(`B — ${cfg.kind} : autant de fiches que d'options, chacune avec son point d'aimantation`, () => {
    const options = catalogueOptions(decisions, cfg.path);
    assert.ok(options.length >= 9, `${cfg.kind} : le plan doit publier ses options (lu : ${options.length})`);
    const cards = renderCatalogueCards(ctxDe(cfg), cfg.body);
    const snaps = cards.querySelectorAll("[data-snap]");
    assert.equal(snaps.length, options.length, "une fiche par option, ni plus ni moins");
    snaps.forEach((card, i) => {
      assert.equal(card.getAttribute("data-snap"), cfg.kind);
      assert.equal(card.getAttribute("data-value"), options[i],
        "⭐ L'ORDRE DES FICHES EST CELUI DU PLAN — c'est ce qui rend le curseur, le rail et Validate " +
        "incapables de diverger (II.3, « la même chose par construction »)");
    });
  });

  test(`B bis — ${cfg.kind} : le rail suit le même tableau, un seul cran courant`, () => {
    const options = catalogueOptions(decisions, cfg.path);
    const rail = renderCatalogueRail(ctxDe(cfg, 3));
    const items = rail.querySelectorAll(".catalogue-rail-item");
    assert.equal(items.length, options.length);
    const courants = items.filter((li) => li.getAttribute("aria-current") === "true");
    assert.equal(courants.length, 1, "un seul cran courant — jamais deux, jamais zéro");
    assert.equal(courants[0].getAttribute("data-value"), options[3]);
  });

  test(`B ter — ${cfg.kind} : le palier 1 ne produit AUCUN bouton de SÉLECTION (II.1)`, () => {
    /* Le défilement EST le choix, et c'est CETTE moitié-là de l'invariant
       qui compte : aucun bouton de la fiche ne doit MENER à un record.
       ⚠️ LOT 77 — LE GARDE S'EST RESSERRÉ, IL NE S'EST PAS RELÂCHÉ. Il
       exigeait « zéro bouton » ; les croquis du 2026-08-15 mettent `Lore` et
       `Choose` au pied de la fiche, et le gabarit leur donne T3 et la cible
       de 44 px. « Zéro bouton » ne pouvait donc plus rester la formulation.
       Ce qu'on garde à la place est plus exact : les SEULS boutons tolérés
       sont ces deux-là, nommés, et AUCUN ne porte de valeur de record —
       remettre les douze options du lot 42 rougirait toujours. */
    const cards = renderCatalogueCards(ctxDe(cfg), cfg.body);
    const boutons = cards.querySelectorAll("button");
    assert.deepEqual(boutons.map((b) => b.textContent), Array(12).fill(["Lore", "Choose"]).flat(),
      "une fiche porte exactement les deux actions du croquis, et rien d'autre");
    for (const b of boutons)
      assert.equal(b.getAttribute("data-value"), null,
        "⛔ un bouton qui porte un record est un geste de SÉLECTION — II.1 le supprime : on défile");
  });

  test(`B quater — ${cfg.kind} : le curseur d'arrivée est le record DÉJÀ posé`, () => {
    const options = catalogueOptions(decisions, cfg.path);
    const pose = fixture.report.decisions.find((d) => d.path === cfg.path).selected[0];
    assert.equal(options[catalogueCursor(decisions, cfg.path)], pose,
      "s'ouvrir ailleurs ferait écraser le choix en silence — le défilement EST le choix");
  });
}

/* ══ C — ET CE QUI LES DISTINGUE RESTE DISTINCT ═══════════════════════════ */

/** Les étiquettes de la colonne de stats d'une fiche. ⚠️ LOT 77 — le
 *  sélecteur a changé (`.fiche-stat-row`, la fiche à 360) mais la question
 *  posée est la même, et le deux-points fait maintenant partie de
 *  l'étiquette : c'est LUI qui coûte les 4 px de gras que le gabarit a
 *  mesurés, donc il est rendu, pas ajouté par la feuille de style. */
const etiquettesDe = (cfg) => renderCatalogueCards(ctxDe(cfg), cfg.body)
  .querySelectorAll(".fiche-stat-row dt").map((dt) => dt.textContent.replace(/ :$/, ""));

test("C — les deux fiches ne montrent PAS les mêmes lignes : le catalogue est partagé, la fiche non", () => {
  const classe = new Set(etiquettesDe(ECRANS[0]));
  const espece = new Set(etiquettesDe(ECRANS[1]));

  /* ⚠️ LOT 77 — LES ÉTIQUETTES ONT ÉTÉ COMPRESSÉES, PAS SUPPRIMÉES. Elles
     viennent désormais de `fh-fiche-en`, taillées pour la colonne de 118 px :
     `Hit points` → `HP/level`, `Primary ability` → `Ability`, `Creature
     type` → `Type`, `Size` → `Sz` (154 px devenaient 98). Le fait vérifié
     est le même : chaque fiche montre ce qui lui appartient. */
  assert.ok(classe.has("HP/level") && classe.has("Ability"),
    `une fiche de classe montre son dé de PV et sa caractéristique primaire (lu : ${[...classe].join(", ")})`);
  assert.ok(espece.has("Sz") && espece.has("Speed"),
    `une fiche d'espèce montre sa taille et sa vitesse (lu : ${[...espece].join(", ")})`);
  /* ⛔ La preuve qui compte : aucune des deux ne s'est aplatie sur l'autre.
     « Partager » en supprimant ce qui distingue serait une régression
     déguisée en factorisation — et le lot 77 partage désormais jusqu'au
     DESSIN de la fiche, ce qui rend cette preuve-ci plus utile qu'avant. */
  assert.equal([...classe].some((l) => espece.has(l)), false,
    `aucune ligne commune attendue — classe: ${[...classe].join(", ")} / espèce: ${[...espece].join(", ")}`);
});

test("C bis — les lignes de fiche s'affichent, et SEULEMENT parce que la couche est montée", () => {
  /* Le pool de classe (`Skill pool`) n'existe que sur la couche FH, et
     TOUTE la fiche à 360 (les lignes compressées comme le blurb) n'existe
     que sur `fh-fiche-en`. Le test 8 de `class-species-steps.test.mjs`
     prouve l'autre moitié : sur un personnage SRD pur, cette fiche-ci
     disparaît au profit du corps SRD — jamais une dalle vide, jamais un
     zéro inventé.
     ⚠️ LOT 77 — LA DESTINÉE A QUITTÉ LA FICHE D'ESPÈCE. `fh-fiche-en` ne
     porte pour l'espèce que `Type · Sz · Speed · Lineages` : ni `Destiny`
     ni `Skill points`, que l'ancienne fiche affichait, et le croquis
     d'espèce range la Destinée dans les TRAITS, tombés eux aussi. C'est
     remonté à Eric (INVENTAIRE-LOT-77.md) et non tranché ici. */
  assert.ok(etiquettesDe(ECRANS[0]).includes("Skill pool"),
    "le pool de compétences est un apport FH, et il est sur la fiche de classe");
  const espece = etiquettesDe(ECRANS[1]);
  for (const attendue of ["Type", "Sz", "Speed"])
    assert.ok(espece.includes(attendue),
      `la fiche d'espèce porte ses lignes de couche (${attendue} manque : ${espece.join(", ")})`);
});

test("C ter — les 24 fiches remplissent leur boîte fixe : blurb chez la CLASSE, traits chez l'ESPÈCE", () => {
  /* La boîte est FIXE (10 lignes) : un contenu absent laisserait un trou de
     160 px, un contenu trop long déborderait en silence. Le premier se voit
     ici, le second aux gardes de `tests/fiche-360.test.mjs` (1 pour le
     blurb, 4 pour les traits).

     ⚠️ CE TEST A ÉTÉ REPOINTÉ LE 2026-08-15 (lot 78), et sa vérité n'a pas
     bougé : *la boîte n'est jamais vide*. Ce qui a changé, c'est ce qu'Eric
     y met — son croquis A donne la moitié basse d'une ESPÈCE à ses TRAITS,
     là où le croquis C du Wizard y met le blurb. *« B3 = B2 »* ne vaut donc
     que pour la GÉOMÉTRIE : même boîte, même place, deux contenus. */
  const attendu = { class: ".fiche-blurb", species: ".fiche-traits" };
  for (const cfg of ECRANS) {
    const sel = attendu[cfg.kind];
    const rendu = renderCatalogueCards(ctxDe(cfg), cfg.body);
    const boites = rendu.querySelectorAll(sel);
    assert.equal(boites.length, 12, `les douze fiches de ${cfg.kind} portent chacune leur ${sel}`);
    for (const b of boites)
      assert.ok(b.textContent.length > 100,
        `une boîte vide laisserait 160 px de trou dans la fiche de ${cfg.kind}`);
    /* ⛔ ET L'AUTRE FORME N'APPARAÎT PAS : une fiche qui porterait les deux
       demanderait 20 lignes dans une boîte qui en tient 10. */
    const autre = cfg.kind === "class" ? ".fiche-traits" : ".fiche-blurb";
    assert.equal(rendu.querySelectorAll(autre).length, 0,
      `une fiche de ${cfg.kind} ne porte QUE ${sel} — les deux ne tiennent pas dans 160 px`);
  }
});

/* ══ D — LE CÂBLAGE DE shell.mjs, SUR LES OCTETS ══════════════════════════ */

test("D — shell.mjs branche les DEUX écrans sur la MÊME table de catalogues", () => {
  const shellText = fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8");
  assert.match(shellText, /const CATALOGUES = \{[\s\S]*?\bclass:[\s\S]*?\bspecies:[\s\S]*?\};/,
    "les deux écrans doivent être deux lignes d'une même table — pas deux branches");
  assert.doesNotMatch(shellText, /step\.id === "species" &&/,
    "plus aucune branche propre à Species : « B3 = B2 » vaut aussi dans la coquille");
});
