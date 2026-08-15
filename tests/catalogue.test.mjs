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

   ⭐ DEUX PREUVES DE PLUS, LE 2026-08-15 (les deux derniers chapitres) :
     CH4. LE RAIL SE TAPE — et taper ne choisit pas. Le cran émet `snapTo`,
        le même déplacement de champ que la molette de Compétences.
     CH6. `CHOOSE` VALIDE LA FICHE — avec l'index de SA fiche, pas celui du
        curseur ; `LORE` reste éteint ; et un écran à pied déclare
        `fiche: true`, faute de quoi `shell.mjs` reposerait un `Validate`
        à côté (ou pire : le retirerait d'un écran qui n'a pas de `CHOOSE`).

   🔴 SA LIMITE : il prouve qu'il n'y a qu'une implémentation et qu'elle sert
   les deux écrans. Il ne dit rien de l'aimantation elle-même — ni du rail
   qui suit le doigt : ça n'existe pas dans `tests/dom-stub.mjs` (aucune mise
   en page) et se vérifie à l'œil, dans un navigateur servi. C'est vrai aussi
   du `Validate` qui disparaît (CH6) : `shell.mjs` n'est pas testé, seul le
   navigateur peut dire qu'il n'y a plus qu'un bouton à l'écran. */

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
       qui compte : aucun bouton de la fiche ne doit PORTER un record.
       ⚠️ CH6, 2026-08-15 — « MENER À » ÉTAIT LE MOT D'AVANT, ET IL A CESSÉ
       D'ÊTRE VRAI : `CHOOSE` mène désormais bel et bien au record, c'est
       l'arbitrage d'Eric (il valide la fiche). Ce qui reste interdit, et que
       ce garde tient, est plus précis : aucun bouton ne porte l'IDENTITÉ
       d'un record. `CHOOSE` ne sait rien de la classe qu'il valide — il
       connaît l'index de sa fiche, et c'est le catalogue qui traduit.
       Remettre les douze options nommées du lot 42 rougirait toujours.
       ⚠️ LOT 77 — LE GARDE S'ÉTAIT DÉJÀ RESSERRÉ, IL NE S'EST PAS RELÂCHÉ. Il
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

/* ══ CH4 — LE RAIL SE TAPE, ET IL NE CHOISIT RIEN ═════════════════════
   ✅ Eric, 2026-08-15 : *« ce serait bien de reporter ce fonctionnement aux
   classes et species »* — le scroll/tap de la ceinture.

   🔴 CE QUE CE GARDE TIENT, ET C'EST LA MOITIÉ QUI COMPTE : le renversement
   de l'invariant II.1 porte sur la CLIQUABILITÉ du rail, PAS sur « le
   défilement est le choix ». Un cran tapé émet `snapTo` — un déplacement de
   champ — et rien d'autre. Le jour où quelqu'un le fera émettre un `choose`
   « pour aller plus vite », ce test rougira, et c'est tout son objet.

   ⚠️ Ce que ce garde ne peut PAS voir : que le cran est bien AMENÉ dans le
   champ. Il n'y a pas de mise en page dans le stub — la géométrie se regarde
   au navigateur, comme le dit la tête de ce fichier. */

for (const cfg of ECRANS) {
  test(`CH4 — ${cfg.kind} : un cran de rail tapé émet {snapTo, index} — et JAMAIS un choix`, () => {
    const vus = [];
    const rail = renderCatalogueRail(ctxDe(cfg, 0), (a) => vus.push(a));
    const crans = rail.querySelectorAll(".catalogue-rail-item");
    assert.equal(crans.length, 12);
    /* Le 5ᵉ cran, pas le premier : un index câblé en dur passerait le test
       sur le zéro et mentirait partout ailleurs. */
    crans[4].click();
    assert.deepEqual(vus, [{ kind: "snapTo", index: 4 }],
      "⛔ un cran est un RACCOURCI DE DÉFILEMENT — s'il acte un record, II.1 est mort");
    assert.equal(crans[4].tagName, "BUTTON",
      "un cran qui se tape est un bouton : au clavier, au lecteur d'écran, et pas seulement à la souris");
    /* La PROPRIÉTÉ, pas l'attribut : le stub ne reflète pas l'une dans
       l'autre (un navigateur, si). C'est la propriété qu'on écrit. */
    assert.equal(crans[4].type, "button", "jamais un `submit` par défaut");
  });

  test(`CH4 bis — ${cfg.kind} : le rail SANS destinataire se rend et se tape sans jeter`, () => {
    /* Les gardes le rendent nu (`renderCatalogueRail(ctx)`), et un écran
       pourrait le faire. Un cran qui jette au clic serait un plantage
       introduit par un argument oublié. */
    const rail = renderCatalogueRail(ctxDe(cfg, 0));
    assert.doesNotThrow(() => rail.querySelectorAll(".catalogue-rail-item")[2].click());
  });
}

/* ══ CH6 — `CHOOSE` EST LA VALIDATION DE LA FICHE ═════════════════════
   L'arbitrage délégué par Eric le 2026-08-15 : des deux boutons qui ouvrent
   la même porte, c'est `CHOOSE` qui reste (les croquis A et C ne dessinent
   aucun `Validate` sur la fiche). `shell.mjs` retire le `Validate` générique
   des écrans qui déclarent `fiche: true` — ce garde-ci tient les deux bouts
   de cette dépendance, parce qu'un seul bout est un piège :
     · un écran à pied SANS le drapeau → deux boutons pour une porte ;
     · un écran AVEC le drapeau et SANS pied → un écran qu'on ne peut plus
       valider du tout. C'est la faute qui coûte le plus cher des deux, et
       elle est silencieuse (`shell.mjs` n'est pas testé : voir §RENDU). */

for (const cfg of ECRANS) {
  test(`CH6 — ${cfg.kind} : le CHOOSE d'une fiche émet {ficheChoose, index} — l'index de SA fiche`, () => {
    const vus = [];
    const cards = renderCatalogueCards(ctxDe(cfg, 0), cfg.body, (a) => vus.push(a));
    const pieds = cards.querySelectorAll(".fiche-actions");
    assert.equal(pieds.length, 12, "chaque fiche porte son pied");
    /* La 8ᵉ fiche, curseur laissé à 0 : c'est LE point du chapitre — le
       bouton pressé appartient à une fiche, et c'est cette fiche-là qui est
       choisie, pas celle que le curseur du spy croit tenir. */
    const choose = cards.querySelectorAll('[data-action="choose"]');
    choose[7].click();
    assert.deepEqual(vus, [{ kind: "ficheChoose", index: 7 }]);
  });

  test(`CH6 bis — ${cfg.kind} : CHOOSE s'allume avec son destinataire, LORE reste éteint`, () => {
    const avec = renderCatalogueCards(ctxDe(cfg, 0), cfg.body, () => {});
    const sans = renderCatalogueCards(ctxDe(cfg, 0), cfg.body);
    const etat = (cards, role) => cards.querySelectorAll(`[data-action="${role}"]`).map((b) => b.disabled);

    assert.deepEqual(etat(avec, "choose"), Array(12).fill(false),
      "câblé, il répond — un bouton allumé qui ne fait rien est le « faux magasin » interdit");
    assert.deepEqual(etat(sans, "choose"), Array(12).fill(true),
      "sans destinataire, il s'annonce éteint plutôt que de mentir");
    /* ⏳ `LORE` demande le panneau plein écran et son `copier` — un organe
       partagé par trois écrans, qui a son propre lot. Il reste éteint MÊME
       câblé, et ce garde est ce qui empêche de le « rallumer vite fait »
       sur un panneau qui n'existe pas. */
    assert.deepEqual(etat(avec, "lore"), Array(12).fill(true),
      "LORE reste éteint tant que le panneau plein écran n'existe pas");
  });

  test(`CH6 ter — ${cfg.kind} : l'écran déclare \`fiche: true\`, et c'est ce que shell.mjs lit`, () => {
    assert.equal(cfg.fiche, true,
      "sans ce drapeau, `renderValidation` reposerait un `Validate` à côté de `CHOOSE`");
  });
}

test("CH6 quater — ⚔️ un catalogue SANS pied ne déclare pas `fiche`, et garde son Validate", async () => {
  /* Les deux autres catalogues (le don d'origine, les arcanes de Destiny)
     ne passent pas par `renderFicheBody` : leurs cartes n'ont AUCUN pied,
     donc aucun `CHOOSE`, donc leur `Validate` générique doit rester. C'est
     la réciproque, et sans elle le drapeau pourrait se poser au hasard. */
  const { renderFeatCardBody } = await import("../ui/builder/inheritance-step.mjs");
  const { renderArcanaCardBody } = await import("../ui/builder/destiny-step.mjs");
  const feats = fixture.report.decisions.find((d) => d.path === "background.originFeat[0]");
  assert.ok(feats && feats.options.length > 0, "garde-fou de portée : le plan des dons publie ses options");

  const cartes = renderCatalogueCards(
    { decisions, query, path: "background.originFeat[0]", kind: "feat", cursor: 0 },
    renderFeatCardBody, () => {}
  );
  assert.ok(cartes.querySelectorAll("[data-snap]").length > 0, "garde-fou : les cartes de dons sont bien rendues");
  assert.equal(cartes.querySelectorAll(".fiche-actions").length, 0,
    "le don d'origine n'a pas de pied — s'il en gagne un, il lui faut son drapeau, sinon deux boutons pour une porte");

  /* Les arcanes : mêmes cartes, mêmes conclusions. ⚠️ Elles ne lisent pas
     `decisions[]` (aucun plan ne les publie, mesuré au lot 45) — elles
     passent par la porte étroite `ctx.options`, comme dans `shell.mjs`. */
  const arcanes = (query({ kind: "arcana" }) || []).map((v) => v.id);
  assert.ok(arcanes.length >= 20, `garde-fou de portée : les 22 arcanes majeurs (lu : ${arcanes.length})`);
  const cartesArcanes = renderCatalogueCards(
    { decisions, query, path: "fh.destiny.arcana", kind: "arcana", cursor: 0, options: arcanes },
    renderArcanaCardBody, () => {}
  );
  assert.equal(cartesArcanes.querySelectorAll(".fiche-actions").length, 0,
    "les arcanes non plus — leur écran garde son Validate générique");
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
