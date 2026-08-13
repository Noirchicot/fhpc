/* ══ LE GARDE DU CATALOGUE — LOT 60 ═══════════════════════════════════════

   LA LOI QU'IL TIENT, et elle est écrite dans ERGONOMIE-BUILDER.md, mot pour
   mot : ⛔ *« Ne recopie pas B2 ici. Une règle écrite deux fois diverge —
   c'est la loi du dépôt, et elle a déjà coûté. B3 = B2, point. »*

   Le lot 58 avait construit le catalogue à défilement aimanté DANS
   `class-step.mjs`. Le lot 60 devait faire Species, « identique à la 2 ». La
   pente naturelle était de recopier — et rien n'aurait rougi. Ce garde rend
   la copie impossible à faire en silence.

   TROIS PREUVES :
     A. STRUCTURELLE — `data-snap`, `.catalogue-card` et `.catalogue-rail`
        ne sont écrits QUE par `catalogue.mjs`. Même patron que
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

const MARQUEURS = [
  [/\.dataset\.snap\s*=/, "data-snap — le contrat avec le scrollspy"],
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
    text: 'const card = el("section", "catalogue-card dalle-majeure");\ncard.dataset.snap = "feat";'
  };
  assert.deepEqual(ecrivainsHorsCatalogue([source]), [
    "inheritance-step.mjs : data-snap — le contrat avec le scrollspy",
    "inheritance-step.mjs : la fiche du catalogue"
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

  test(`B ter — ${cfg.kind} : le palier 1 ne produit AUCUN bouton (II.1)`, () => {
    /* Le défilement EST le choix. Si un futur lot remettait un bouton dans
       une fiche, l'invariant mourrait sans qu'un test bronche — celui-ci
       bronche, et pour LES DEUX écrans à la fois. */
    const cards = renderCatalogueCards(ctxDe(cfg), cfg.body);
    assert.equal(cards.querySelectorAll("button").length, 0);
  });

  test(`B quater — ${cfg.kind} : le curseur d'arrivée est le record DÉJÀ posé`, () => {
    const options = catalogueOptions(decisions, cfg.path);
    const pose = fixture.report.decisions.find((d) => d.path === cfg.path).selected[0];
    assert.equal(options[catalogueCursor(decisions, cfg.path)], pose,
      "s'ouvrir ailleurs ferait écraser le choix en silence — le défilement EST le choix");
  });
}

/* ══ C — ET CE QUI LES DISTINGUE RESTE DISTINCT ═══════════════════════════ */

test("C — les deux fiches ne montrent PAS les mêmes lignes : le catalogue est partagé, la fiche non", () => {
  const lignesDe = (cfg) => renderCatalogueCards(ctxDe(cfg), cfg.body)
    .querySelectorAll(".catalogue-card-row dt").map((dt) => dt.textContent);
  const classe = new Set(lignesDe(ECRANS[0]));
  const espece = new Set(lignesDe(ECRANS[1]));

  assert.ok(classe.has("Hit points") && classe.has("Primary ability"),
    `une fiche de classe montre son dé de PV et sa caractéristique primaire (lu : ${[...classe].join(", ")})`);
  assert.ok(espece.has("Size") && espece.has("Speed"),
    `une fiche d'espèce montre sa taille et sa vitesse (lu : ${[...espece].join(", ")})`);
  /* ⛔ La preuve qui compte : aucune des deux ne s'est aplatie sur l'autre.
     « Partager » en supprimant ce qui distingue serait une régression
     déguisée en factorisation. */
  assert.equal([...classe].some((l) => espece.has(l)), false,
    `aucune ligne commune attendue — classe: ${[...classe].join(", ")} / espèce: ${[...espece].join(", ")}`);
});

test("C bis — les apports Fate's Hand s'affichent, et SEULEMENT parce que la couche est montée", () => {
  /* Le pool de classe (`fh_skill_pool`) et la Destinée d'espèce (`destiny`)
     n'existent que sur la couche FH. Le test 8 de
     `class-species-steps.test.mjs` prouve l'autre moitié : sur un personnage
     SRD pur, ces lignes DISPARAISSENT — jamais un zéro inventé. */
  const lignesDe = (cfg) => renderCatalogueCards(ctxDe(cfg), cfg.body)
    .querySelectorAll(".catalogue-card-row dt").map((dt) => dt.textContent);
  assert.ok(lignesDe(ECRANS[0]).includes("Skill pool"));
  assert.ok(lignesDe(ECRANS[1]).includes("Destiny"));
});

/* ══ D — LE CÂBLAGE DE shell.mjs, SUR LES OCTETS ══════════════════════════ */

test("D — shell.mjs branche les DEUX écrans sur la MÊME table de catalogues", () => {
  const shellText = fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8");
  assert.match(shellText, /const CATALOGUES = \{[\s\S]*?\bclass:[\s\S]*?\bspecies:[\s\S]*?\};/,
    "les deux écrans doivent être deux lignes d'une même table — pas deux branches");
  assert.doesNotMatch(shellText, /step\.id === "species" &&/,
    "plus aucune branche propre à Species : « B3 = B2 » vaut aussi dans la coquille");
});
