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
    /* ⚠️ 2026-08-26 — `LORE` N'EST PLUS UN MOT, C'EST UN LIVRE. Eric : *« plutôt
       qu'un bouton lore, un bouton de même dimension que `?` mais à gauche, il
       contient un livre… et exit le bouton lore »*. Le garde comptait les
       TEXTES ; un organe dessiné n'en a pas.
       ⭐ CE QU'IL DÉFEND N'A PAS BOUGÉ D'UN POUCE — deux actions par fiche, ni
       plus ni moins, et AUCUNE ne porte l'identité d'un record. On les compte
       donc par leur RÔLE (`data-action`), qui est ce que le catalogue câble,
       plutôt que par leur libellé, qui est du dessin.
       ⛔ Compter des textes revenait à faire tenir un invariant de branchement
       par une chaîne de caractères : le jour où le mot change, le garde tombe
       en criant sur la mauvaise chose. C'est exactement ce qui vient
       d'arriver. */
    const cards = renderCatalogueCards(ctxDe(cfg), cfg.body);
    const boutons = cards.querySelectorAll("button");
    assert.deepEqual(boutons.map((b) => b.dataset.action), Array(12).fill(["lore", "choose"]).flat(),
      "une fiche porte exactement les deux actions du croquis, et rien d'autre");
    const livres = cards.querySelectorAll(".fiche-livre");
    assert.equal(livres.length, 12, "le LORE est dessiné, un livre par fiche");
    for (const l of livres)
      assert.equal(l.getAttribute("aria-label"), "Lore",
        "⛔ un organe sans texte doit se NOMMER pour un lecteur d'écran — sinon il disparaît de la page pour qui ne voit pas le dessin");
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
     `Hit points` → `HP/level`, `Primary ability` → `Ability`.

     ✅ 2026-08-17 — `Sz` REDEVIENT `Size`, ET LA COMPRESSION EST ANNULÉE.
     Eric, ce jour : *« Sz ok, type oui, Size : Small (tout simplement) »*.
     La fourchette en pieds part avec elle (`M (5–6 ft)` → `Medium`), et
     `Type` revient — il avait disparu des douze sans qu'aucun garde le voie.
     📏 Mesuré avec `largeurLigneStats` avant d'écrire : `Size : Medium`
     80,7 px · `Type : Humanoid` 97,4 px, pour 118 disponibles. Seul
     `Size : Medium or Small` dépassait (129,9) — d'où la barre des deux
     espèces à taille au choix (`Medium/Small`, 115,1). */
  assert.ok(classe.has("HP/level") && classe.has("Ability"),
    `une fiche de classe montre son dé de PV et sa caractéristique primaire (lu : ${[...classe].join(", ")})`);
  assert.ok(espece.has("Size") && espece.has("Speed"),
    `une fiche d'espèce montre sa taille et sa vitesse (lu : ${[...espece].join(", ")})`);
  /* ⛔ ET LE TYPE EST GARDÉ, parce qu'il s'est déjà perdu une fois : les
     douze fiches ne le portaient plus alors que le mandat de l'écran
     l'annonce (`Type · Sz · Speed · Lineages`). Une ligne qu'aucun garde ne
     tient est une ligne qui disparaît en silence. */
  assert.ok(espece.has("Type"),
    `une fiche d'espèce montre son type de créature (lu : ${[...espece].join(", ")})`);
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

  test(`CH6 bis — ${cfg.kind} : les DEUX boutons s'allument avec leur destinataire, et pas sans`, () => {
    const avec = renderCatalogueCards(ctxDe(cfg, 0), cfg.body, () => {});
    const sans = renderCatalogueCards(ctxDe(cfg, 0), cfg.body);
    const etat = (cards, role) => cards.querySelectorAll(`[data-action="${role}"]`).map((b) => b.disabled);

    assert.deepEqual(etat(avec, "choose"), Array(12).fill(false),
      "câblé, il répond — un bouton allumé qui ne fait rien est le « faux magasin » interdit");
    assert.deepEqual(etat(sans, "choose"), Array(12).fill(true),
      "sans destinataire, il s'annonce éteint plutôt que de mentir");
    /* ✅ `LORE` S'ALLUME DEPUIS LE LOT 82 — son panneau plein écran existe
       (`ui/builder/lore.mjs`, croquis A). Il est resté éteint cinq lots
       durant, et ce garde était alors ce qui empêchait de le « rallumer vite
       fait » sur un panneau absent. Il tient maintenant l'autre moitié de la
       même promesse : allumé QUAND il mène quelque part, éteint sinon. */
    assert.deepEqual(etat(avec, "lore"), Array(12).fill(false),
      "câblé, LORE répond — son panneau existe depuis le lot 82");
    assert.deepEqual(etat(sans, "lore"), Array(12).fill(true),
      "sans destinataire, il s'annonce éteint plutôt que de mentir");

    /* ⚔️ ET IL PORTE LE RECORD, PAS L'INDEX. `choose` agit sur le curseur du
       catalogue, `lore` ouvre une prose : deux boutons voisins, deux natures.
       Confondre les deux ferait lire la fiche d'à côté. */
    const vus = [];
    const cartes = renderCatalogueCards(ctxDe(cfg, 0), cfg.body, (a) => vus.push(a));
    cartes.querySelectorAll('[data-action="lore"]')[3].click();
    assert.equal(vus.length, 1);
    assert.equal(vus[0].kind, "lore");
    assert.equal(vus[0].ref.kind, cfg.kind);
    assert.ok(typeof vus[0].ref.id === "string" && vus[0].ref.id.length > 0,
      "le record est nommé par son id, jamais par un rang");
  });

  test(`CH6 ter — ${cfg.kind} : l'écran déclare \`fiche: true\`, et c'est ce que shell.mjs lit`, () => {
    assert.equal(cfg.fiche, true,
      "sans ce drapeau, `renderValidation` reposerait un `Validate` à côté de `CHOOSE`");
  });
}

test("CH6 quater — LES ARCANES PORTENT LEUR `CHOOSE` DEPUIS LE LOT 109", async () => {
  /* 🔴 LA MOITIÉ « DON D'ORIGINE » DE CE GARDE EST MORTE AU LOT 77 — Eric,
     2026-08-28 : *« le choix des feats ça devient un choix de token »*.
     🔴 ET SA SECONDE MOITIÉ EST MORTE AU LOT 109, RETOURNÉE PAR UN CROQUIS :
     la planche « B2 » d'Eric (2026-08-30) dessine `CHOOSE` au pied de la carte
     de tarot, comme sur les fiches d'espèce. Le garde disait « un catalogue
     sans pied garde son Validate » ; Destiny n'est plus ce catalogue-là.
     ⭐ CE QUI RESTE VRAI, ET C'EST LE CŒUR DE CH6 : *« chaque écran valide chez
     lui »*. Un pied de fiche EXISTE ou n'existe pas, mais quand il existe il
     porte le rôle `choose`, et c'est le catalogue — seul à connaître l'index —
     qui l'allume. Ce test mesure cette chaîne de bout en bout.
     ⛔ MESURÉ AVANT DE L'ÉCRIRE (banc, 30/08) : sans ce pied, la branche du
     choix n'avait AUCUNE porte — le `Done` de la coquille restait éteint faute
     de carte tirée, et le joueur regardait vingt-deux cartes sans pouvoir en
     prendre une. */
  /* ⛔ `renderArcanaCardBody` A ÉTÉ RETIRÉ AU LOT 143, et ce test le suit sans
     perdre un mot de sa loi. C'était une SECONDE mise en page de la carte, à
     côté de l'écran final ; la fiche du catalogue est désormais l'écran final
     lui-même, en gabarit « aperçu » (Eric, 2026-09-03).
     ⚠️ Un export que plus personne n'appelle mais que trois tests maintiennent
     en vie est un orphelin : la suite reste verte pendant que le code est mort.
     Le corps de fiche change, la CHAÎNE que ce test mesure ne change pas — le
     `CHOOSE` naît éteint et c'est le catalogue qui l'allume. */
  const { renderDestinyFinal } = await import("../ui/builder/destiny-step.mjs");
  const corpsDeFiche = (query, id) => [renderDestinyFinal({ gabarit: "apercu", query, drawnId: id, document: {}, resolved: null })];

  /* Les arcanes : ⚠️ elles ne lisent pas `decisions[]` (aucun plan ne les
     publie, mesuré au lot 45) — elles passent par la porte étroite
     `ctx.options`, comme dans `shell.mjs`. */
  const arcanes = (query({ kind: "arcana" }) || []).map((v) => v.id);
  assert.ok(arcanes.length >= 20, `garde-fou de portée : les 22 arcanes majeurs (lu : ${arcanes.length})`);
  const appels = [];
  const cartesArcanes = renderCatalogueCards(
    { decisions, query, path: "fh.destiny.arcana", kind: "arcana", cursor: 0, options: arcanes },
    corpsDeFiche, (a) => appels.push(a)
  );
  const choisirs = cartesArcanes.querySelectorAll('[data-action="choose"]');
  assert.equal(choisirs.length, arcanes.length, "chaque fiche d'arcane porte SON `CHOOSE`");
  assert.equal(choisirs[0].disabled, false, "et le catalogue l'a allumé — il naît éteint, faute d'index");
  choisirs[3].click();
  assert.deepEqual(appels, [{ kind: "ficheChoose", index: 3 }],
    "le bouton porte l'index de SA fiche — jamais le curseur du spy, qui peut n'avoir pas relu");
});

test("C bis — les lignes de fiche s'affichent, et SEULEMENT parce que la couche est montée", () => {
  /* Le pool de classe (`Skill pool`) n'existe que sur la couche FH, et
     TOUTE la fiche à 360 (les lignes compressées comme le blurb) n'existe
     que sur `fh-fiche-en`. Le test 8 de `class-species-steps.test.mjs`
     prouve l'autre moitié : sur un personnage SRD pur, cette fiche-ci
     disparaît au profit du corps SRD — jamais une dalle vide, jamais un
     zéro inventé.
     ⚠️ CETTE LIGNE A ÉTÉ RENVERSÉE DEUX FOIS EN UN JOUR, ET LES DEUX SENS
     SONT D'ERIC. Il faut donc lire les DEUX, pas seulement le dernier :

     · **lot 81, 2026-08-17 (matin)** — *« Destiny reste, et surtout rajoute
       les chosen quand y'en a »*. `Type : Humanoid` partait au motif qu'il
       vaut pour les douze espèces : une ligne qui ne distingue jamais rien.
     · **lot 83, 2026-08-17 (ce fil)** — *« Sz ok, type oui, Size : Small
       (tout simplement) »*, et sur la destinée : *« base 2 n'apporte rien de
       plus, voire même ne pas s'associer à la species : destiny de base =
       2 base + PB + arcane + feat/trait »*.

     ⭐ CE QUI A CHANGÉ N'EST PAS L'AVIS, C'EST L'ARGUMENT. Le motif de la
     destinée n'est plus « ça ne distingue rien » mais **« ce n'est pas une
     propriété d'espèce »** — la destinée de base se compose ailleurs, donc
     l'écrire ici est faux, pas seulement inutile.
     🔴 ET LA CONTREPARTIE EST ASSUMÉE : `Type : Humanoid` est identique sur
     les douze, exactement le motif qui l'avait fait partir le matin même.
     Eric l'a redemandé en connaissance de cause après que ce fil lui a
     remonté la mesure. **Si ce garde regêne, c'est cette ligne-là qu'on
     rediscute — on ne la désarme pas.** */
  /* ⭐ LOT 82 — « Skill pool » → « Free points ». Le libellé nommait le `base`
     d'avant le canon : tout, points déjà placés compris. Le canon §B.1 publie
     trois totaux et le joueur n'en manipule qu'un ; la carte annonce celui-là,
     parce que c'est celui qui aide à choisir sa classe. */
  assert.ok(etiquettesDe(ECRANS[0]).includes("Free points"),
    "les points libres sont un apport FH, et c'est ce que le joueur dépensera");
  const espece = etiquettesDe(ECRANS[1]);
  assert.ok(!espece.includes("Destiny"),
    "la destinée de base se compose hors de l'espèce (2 + PB + arcane + feat/trait) : elle a quitté la fiche");
  for (const attendue of ["Type", "Size", "Speed"])
    assert.ok(espece.includes(attendue),
      `la fiche d'espèce porte ses lignes de couche (${attendue} manque : ${espece.join(", ")})`);
});

test("C ter — les 24 fiches portent leur blurb, et l'espèce porte EN PLUS ses traits", () => {
  /* La boîte est FIXE (10 lignes) : un contenu absent laisserait un trou de
     160 px, un contenu trop long déborderait en silence. Le premier se voit
     ici, le second aux gardes de `tests/fiche-360.test.mjs` (1 pour le
     blurb, 4 pour les traits).

     ⚠️ REPOINTÉ DEUX FOIS, ET LA SECONDE RENVERSE LA PREMIÈRE. Au lot 78 la
     moitié basse d'une ESPÈCE portait ses TRAITS et son blurb n'était affiché
     nulle part. Les trois maquettes qu'Eric a faites à la main le 2026-08-17
     remontent les traits dans le bloc 1, à la suite des stats, et rendent le
     bas à la prose. **Les 24 fiches portent donc un blurb** ; l'espèce porte
     EN PLUS ses traits, ailleurs. */
  for (const cfg of ECRANS) {
    const rendu = renderCatalogueCards(ctxDe(cfg), cfg.body);
    const boites = rendu.querySelectorAll(".fiche-blurb");
    assert.equal(boites.length, 12, `les douze fiches de ${cfg.kind} portent chacune leur blurb`);
    for (const b of boites)
      assert.ok(b.textContent.length > 100,
        `une boîte vide laisserait un trou dans la fiche de ${cfg.kind}`);
    /* Les traits sont propres à l'espèce, et ils vivent DANS le bloc 1 —
       jamais dans la boîte du bas, qui est au blurb. */
    const traits = rendu.querySelectorAll(".fiche-traits");
    assert.equal(traits.length, cfg.kind === "species" ? 12 : 0,
      `seule l'espèce porte des traits (${cfg.kind})`);
    for (const liste of traits)
      assert.ok(liste.closest(".fiche-bloc1"),
        "les traits vivent dans le bloc 1, à la suite des stats (lot 81)");
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
