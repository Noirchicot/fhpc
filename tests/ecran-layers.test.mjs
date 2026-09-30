/* ══ LOT 188 — L'ÉCRAN `Layers` : six interrupteurs, un catalogue ═════════

   ⚖️ Eric, 09/09 : *« Comment s'appelle l'écran des six interrupteurs ? »* →
   `Layers`. Le dessin est le sien (artefact « Six interrupteurs, un
   catalogue ») : le socle SRD verrouillé, le maître Fate's Hand, ses six
   enfants qui se coupent un par un, la dépendance Inheritance → Trainings, et
   le catalogue (les livres du joueur, le `+` homebrew inerte).

   🔄 LOT 351 — ERIC A REFAIT L'ÉCRAN LE 29/09 (la dictée de B0) : Fate's Hand en UN
   interrupteur, tout ou rien ; les six sous-unités gardées comme CARTE de qui fait
   quoi ; les éléments actifs en haut, « installed, not active » dessous (caché s'il
   est vide) ; une poubelle par livre ; `Import a book` en place réservée. Les gardes
   sont RÉÉCRITS à cette vérité, pas relâchés : chacun dit ce qu'il tenait.
   🗄️ C1-C4 sont partis avec `couchesApresLeGeste` (le geste d'un enfant) : ils ne
   visaient qu'elle.

   🔴 CE QUE CE FICHIER GARDE, ET SUR QUOI :
     A. les LISTES — l'union des six sous-unités plus le catalogue EST la pile
        Fate's Hand ; les livres portent le même nom partout ;
     B. la COMPOSITION, lue sur le document — un sous-ensemble entier (un perso
        d'avant le lot 351) reste légitime, un ensemble coupé en deux ne l'est pas ;
     D. le RENDU (dom-stub) — la page dictée, ses deux groupes, la poubelle, la
        question avant d'effacer, et le SRD qui ne se clique jamais ;
     E. ⚔️ LA VRAIE PILE (harnais du lot 7) : ce que le moteur fait d'un perso
        d'avant (une sous-unité coupée), l'ordre du manifeste au rallumage, le perso
        d'hier sauvé au rechargement, le livre absent (404) qui ne casse rien, le
        livre présent qui se monte ;
     F. les OCTETS de la coquille — elle câble ce que ce lot lui demande, et elle
        aligne la pile AVANT de dériver.

   ⚠️ ON TESTE LA FONCTION, PAS LA PAGE (`tests/dom-stub.mjs`). La géométrie se
   regarde au navigateur ; ce fichier garde le RAISONNEMENT et le CÂBLAGE. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { makeHarness, manifestOf, readJson, bytesOf } from "./build-harness.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

globalThis.document = createTestDocument();

/* ⚠️ `layers-ecran.mjs` D'ABORD, et c'est voulu : `universe-step.test.mjs`
   importe l'autre bout du cycle en premier. Les deux ordres doivent charger. */
const {
  INTERRUPTEURS, CATALOGUE_FH, LIVRES_DU_JOUEUR, compositionFh, gestesDAlignement, renderLayersEcran,
  interrupteur, voyant, manifesteDeLaPile, MOTS_DE_LAYERS, popupEffacerUnLivre, MOTS_EFFACER_UN_LIVRE
} = await import("../ui/builder/layers-ecran.mjs");
const layersEcran = await import("../ui/builder/layers-ecran.mjs");
const { poubelle, TRAIT_DE_LA_POUBELLE } = await import("../ui/builder/poubelle-organe.mjs");
const { createDocWriters } = await import("../src/doc/writers.mjs");
const { renderUniverseStep, SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS, LIVRE_LAYER_IDS, currentStack, sauvegarderPuisEteindre, NOM_DE_LA_VERSION_FH,
  renderConfirmationPile } = await import("../ui/builder/universe-step.mjs");
const { motDUnRecordAbsent } = await import("../ui/builder/mot-du-choix.mjs");
const { LAYER_FILES, LIVRE_FILES } = await import("../ui/builder/engine.mjs");
const { motDeLEcranMort, MOT_PILE_INCONNUE } = await import("../ui/builder/ecran-mort.mjs");
const { STEPS, cransAlignes } = await import("../ui/builder/etapes.mjs");
const { LIVRES, construireCouche } = await import("../src/tools/gen-livre-layer.mjs");
/* 🔴 LES MODULES DE LA PAGE, PAS UN HARNAIS NU. `engine.mjs` monte trois
   modules ; sans eux la dérivation ne tend aucun `refs` à personne, et le
   défaut E7 (une langue choisie, Trainings coupé → la dérivation JETAIT) ne
   se voyait pas — mesuré au navigateur, après une suite verte. */
const { createFhDestinyStat } = await import("../src/modules/fh/destiny-stat.mjs");
const { createFhSkillPoolStat } = await import("../src/modules/fh/skill-pool.mjs");
const { createFhSpeciesTraits } = await import("../src/modules/fh/species-traits.mjs");
const MODULES_DE_LA_PAGE = () => [createFhDestinyStat(), createFhSkillPoolStat(), createFhSpeciesTraits()];

const FT_LB = { distance: "ft", weight: "lb" };
const manifestFor = (ids) => ids.map((id) => ({ id, version: "0.0.0", hash: "x".repeat(64), name: id }));
function docAvec(ids, extra = {}) {
  return {
    schema: "fh-char/1", id: "ecran-layers-test", name: "Sonde", lang: "en", units: FT_LB,
    created: "2026-09-09T00:00:00Z", modified: "2026-09-09T00:00:00Z",
    build: { layers: manifestFor(ids), choices: [], budgets: {}, overrides: [] },
    ...extra
  };
}
const SOCLE = [SRD_LAYER_ID, ...SRFH_LAYER_IDS];
const PILE_COMPLETE = [...SOCLE, ...FH_LAYER_IDS];
const sw = (id) => INTERRUPTEURS.find((s) => s.id === id);
const sans = (ids, retirees) => ids.filter((id) => !retirees.includes(id));

/* Les organes de l'écran, par leur DONNÉE, jamais par leur position. */
const maitre = (node) => node.querySelectorAll(".interrupteur[data-maitre]")[0];
/* 🔴 LOT 189 — LE SOCLE EST UN VOYANT, PLUS UN INTERRUPTEUR (Eric, 09/09 :
   *« Le bouton SRD est un voyant, pas un bouton — il est toujours actif »*).
   On le trouve par sa DONNÉE (`data-socle`), pas par sa classe : c'est ce qui
   permet à `srdEstUnVoyantF` de juger un socle redevenu interrupteur. */
const socle = (node) => node.querySelectorAll("[data-socle]")[0];
/* ⭐ LOT 351 — la ligne d'un livre monté (son interrupteur + sa poubelle), le
   séparateur « installed, not active », et l'ORDRE des lignes : ce qui est au-dessus
   du séparateur est actif, ce qui est dessous est éteint. */
const ligneLivre = (node, id) => node.querySelectorAll(`.layers-livre[data-ligne-livre="${id}"]`)[0];
const lignesDeLaListe = (node) => node.querySelectorAll(".tdc-lignes")[0].childNodes.filter((n) => n.nodeType === 1);
const separateurDesEteints = (node) => node.querySelectorAll(".tdc-regle").find((p) => p.textContent === MOTS_DE_LAYERS.eteints);
/** Le groupe d'une ligne : « actif » au-dessus du séparateur, « eteint » dessous. */
function groupeDe(node, ligne) {
  const lignes = lignesDeLaListe(node);
  const i = lignes.indexOf(ligne);
  assert.ok(i >= 0, "la ligne est dans la liste");
  const s = lignes.indexOf(separateurDesEteints(node));
  return s >= 0 && i > s ? "eteint" : "actif";
}
/** La ligne qui PORTE un organe dans la liste (l'organe lui-même, ou la ligne de livre) —
 *  en remontant les parents jusqu'à un enfant direct de la liste. */
function porteuse(node, organe) {
  const liste = node.querySelectorAll(".tdc-lignes")[0];
  let n = organe;
  while (n && n.parentNode !== liste) n = n.parentNode;
  return n;
}

/** LA CLAUSE GARDÉE — le SRD est une LAMPE, pas un contrôle. Rend les fautes,
 *  fondées sur ce que l'arbre d'accessibilité annonce, jamais sur une classe. */
function srdEstUnVoyantF(node) {
  const s = socle(node);
  if (!s) return ["<aucun [data-socle]>"];
  const fautes = [];
  if (s.tagName === "BUTTON") fautes.push("le socle est un <button> : il a l'air d'un contrôle");
  if (s.getAttribute("role") === "switch") fautes.push("le socle annonce role=switch : un lecteur d'écran entend « interrupteur »");
  if (s.getAttribute("aria-checked") !== null) fautes.push("le socle porte aria-checked : il prétend avoir deux positions");
  if (s.disabled === true) fautes.push("le socle est disabled : « pas à toi de le toucher » au lieu de « rien à toucher »");
  if (s.getAttribute("role") !== "status") fautes.push("le socle n'est pas une région d'état (role=status)");
  if (s.dataset.on !== "true") fautes.push("le socle n'est pas allumé");
  if (!/always on/.test(s.textContent)) fautes.push("le socle ne dit pas « always on »");
  return fautes;
}
const rendu = (ctx = {}, onAction = () => {}) =>
  renderUniverseStep({ document: docAvec(PILE_COMPLETE), query: () => null, fieldErrors: {}, ecran: "layers", ...ctx }, onAction);
/* Un livre MONTÉ dans le manifeste de la pile (la forme de `layers.verbs.stack()`). */
const livreMonte = (id, nom) => ({ id, version: "1.0.0", hash: "l".repeat(64), name: nom, enabled: false, records: 256 });

/* ══ A — LES LISTES ════════════════════════════════════════════════════════ */

test("A1 — 🔴 l'union des six interrupteurs et du catalogue EST la pile Fate's Hand, sans trou ni doublon", () => {
  const couvertes = [...INTERRUPTEURS.flatMap((s) => s.couches), ...CATALOGUE_FH];
  assert.equal(new Set(couvertes).size, couvertes.length, "une couche ne peut appartenir qu'à UNE sous-unité de la carte");
  assert.deepEqual([...couvertes].sort(), [...FH_LAYER_IDS].sort(),
    "⛔ une couche montée par `engine.mjs` hors de la carte ne dirait pas qui fait quoi, et `compositionFh` ne saurait pas la juger");
  assert.deepEqual(INTERRUPTEURS.map((s) => s.label),
    ["Trainings", "Skills & tools", "Inheritance", "Destiny", "World", "Soulforging"],
    "l'ordre est celui du dessin d'Eric — et le cinquième s'appelle World depuis le lexique du 10/09 (lot 192)");
  assert.deepEqual(sw("destiny").couches, ["fh-arcana-en", "fh-feats-en", "fh-spells-en"],
    "Destiny est un ENSEMBLE de trois couches (mesuré sur les drapeaux du dépôt)");
  assert.equal(sw("inheritance").exige, "trainings", "Eric, 08/09 : l'Inheritance dépend des Trainings");
  /* ⚖️ LOT 191 — LORE PORTE LES ESPÈCES (Eric, 09/09 : « Il n'y a pas d'Araag
     dans SRD si le bouton Lore n'est pas poussé » ; « Lore rajoute le monde FH
     sans les règles »). Trois couches, dans l'ordre du manifeste — `fh-fiche-en`
     et `fh-lore-en` PATCHENT ce que `fh-species-en` ajoute (lot 77), donc
     species monte d'abord et descend en dernier. Le catalogue n'a plus que les
     gemmes. ⚔️ Remettre `fh-species-en` dans `CATALOGUE_FH` rougit ici. */
  assert.deepEqual(sw("lore").couches, ["fh-species-en", "fh-fiche-en", "fh-lore-en"], "World = les espèces, la fiche, le lore (l'id `lore` est un nom de construction)");
  assert.deepEqual([...CATALOGUE_FH], ["fh-gems-en", "fh-munitions-en"],
    "⭐ le catalogue = les gemmes ET les munitions : ni l'une ni l'autre n'est de l'ambiance");
  assert.deepEqual(sw("lore").couches, FH_LAYER_IDS.filter((id) => sw("lore").couches.includes(id)),
    "…et l'ordre écrit est celui du manifeste : species AVANT fiche AVANT lore");
});

test("A2 — 📚 les livres du joueur portent le MÊME nom partout : écran, moteur, générateur", () => {
  const ids = LIVRES_DU_JOUEUR.map((l) => l.id);
  assert.deepEqual(ids, LIVRE_LAYER_IDS, "l'écran et `universe-step` nomment les mêmes livres, dans le même ordre");
  assert.deepEqual(LIVRE_FILES.map((f) => f.replace(/\.layer\.json$/, "")), ids, "…et `engine.mjs` va chercher exactement ceux-là");
  for (const livre of LIVRES_DU_JOUEUR) {
    const du = Object.values(LIVRES).find((l) => l.id === livre.id);
    assert.ok(du, `le générateur connaît « ${livre.id} »`);
    assert.equal(livre.nom, du.nom, "le nom affiché quand le livre est absent est celui du générateur");
  }
});

/* ══ B — LA COMPOSITION ════════════════════════════════════════════════════ */

test("B1 — les deux piles nommées sont TOUJOURS légitimes, dans les deux sens", () => {
  const fh = compositionFh(docAvec(PILE_COMPLETE));
  assert.equal(currentStack(docAvec(PILE_COMPLETE)), "srdfh", "témoin");
  assert.deepEqual([fh.legitime, fh.maitre, fh.tous, fh.catalogue], [true, true, true, true]);
  const srd = compositionFh(docAvec(SOCLE));
  assert.equal(currentStack(docAvec(SOCLE)), "srd", "témoin");
  assert.deepEqual([srd.legitime, srd.maitre, srd.tous], [true, false, false]);
  assert.deepEqual(Object.values(srd.enfants), [false, false, false, false, false, false]);
});

test("B2 — 🔴 un sous-ensemble entier est LÉGITIME ; un interrupteur coupé en deux ne l'est pas", () => {
  const sansTrainings = compositionFh(docAvec(sans(PILE_COMPLETE, sw("trainings").couches)));
  assert.equal(currentStack(docAvec(sans(PILE_COMPLETE, sw("trainings").couches))), null,
    "témoin : `currentStack` ne sait PAS nommer cette pile — c'est le trou que ce lot comble");
  assert.equal(sansTrainings.legitime, true, "éteindre Trainings est un choix, pas une pile inconnue");
  assert.equal(sansTrainings.enfants.trainings, false);
  assert.equal(sansTrainings.maitre, true, "Fate's Hand reste ENGAGÉ");
  assert.equal(sansTrainings.tous, false);

  /* ⚔️ Destiny privé d'une seule de ses trois couches : aucun interrupteur ne
     produit ça — c'est une couche de RÈGLE qui manque au milieu d'un ensemble. */
  const destinyCoupe = compositionFh(docAvec(sans(PILE_COMPLETE, ["fh-spells-en"])));
  assert.equal(destinyCoupe.legitime, false, "⛔ un ensemble coupé en deux reste innommable");
  /* ⚔️ LOT 191 — Lore privé de sa fiche et de son lore : les trois espèces
     montées nues, ce qu'aucun interrupteur ne produit. (Le « catalogue à
     moitié » du lot 188 — les espèces sans les gemmes — n'existe plus : le
     catalogue n'a qu'une couche, il est entier ou absent.) */
  assert.equal(compositionFh(docAvec(sans(PILE_COMPLETE, ["fh-fiche-en", "fh-lore-en"]))).legitime, false,
    "⛔ Lore coupé en deux reste innommable");
  assert.equal(compositionFh(docAvec(sans(PILE_COMPLETE, sw("lore").couches))).legitime, true,
    "…et Lore ENTIER éteint — les espèces comprises — est un choix");
  assert.equal(compositionFh(docAvec(sans(PILE_COMPLETE, [...CATALOGUE_FH]))).legitime, true,
    "le catalogue ENTIER absent est légitime depuis le lot 188 (« entier ou absent ») — et depuis\n     le 23/09 le catalogue fait DEUX couches : la liste se lit, elle ne se recopie pas");
  /* ⚔️ Le socle absent : le SRD seul, sans `srfh` (le cas B2 bis d'universe-step). */
  assert.equal(compositionFh(docAvec([SRD_LAYER_ID])).legitime, false, "sans `srfh`, rien ne se nomme");
  assert.equal(compositionFh(docAvec([SRD_LAYER_ID])).socle, false);
});

/* ══ C — 🗄️ LE GESTE PUR D'UN ENFANT — parti au lot 351 ══════════════════════
   C1-C4 gardaient `couchesApresLeGeste` (éteindre Trainings retire aussi Inheritance ;
   allumer Inheritance allume Trainings ; allumer un enfant engage le maître ; le maître,
   tout ou rien). Les enfants ne sont plus des gestes (Eric, 29/09 : *« Tout ou rien »*) :
   la fonction n'avait plus d'appelant et elle est partie, ses gardes avec elle. Le
   « tout ou rien » du maître est tenu par F1 (la forme d'`applyLayerStack`) et par E3
   (la vraie pile). */

/* ══ D — LE RENDU : LA PAGE DICTÉE LE 29/09 (lot 351) ═════════════════════════ */

test("D1 — 🎛️ LA PAGE DICTÉE, FATE'S HAND ALLUMÉ : le SRD est une lampe, Fate's Hand UN interrupteur, pas de séparateur des éteints, les options réservées", () => {
  /* ⚖️ Eric, 29/09 (la dictée de B0) : *« SRD (tj actif) engine/catalog (en italique t0) ·
     … FH (bouton activé) engine/world/catalog · ---- éléments installés mais pas actifs ----
     · … ---- Options ---- · Bouton import a book »*. 🗄️ Ce garde tenait « six enfants
     allumés, le catalogue, deux livres réservés » : les six ne sont plus des lignes, et un
     livre absent ne se montre plus (il n'y a rien à régler ni à effacer). */
  const node = rendu();
  assert.equal(node.dataset.ecran, "layers");
  assert.equal(node.dataset.sortieIci, "true", "⛔ l'écran ne pose pas son Back : la coquille le fait (garde 17)");
  assert.equal(node.querySelectorAll(".tdc-titre-b")[0].textContent, "Layers", "le nom d'Eric, 09/09");
  /* 🗄️ LOT 351 — plus de note sous le titre : ni la dictée ni le mandat ne la nomment, et à
     375 × 812 ses quatre lignes faisaient déborder la scène de 9 px (mesuré au banc). */
  assert.equal(node.querySelectorAll(".universe-note").length, 0, "⛔ la page ne porte que ce qu'Eric a dicté");

  /* 🔴 LOT 189 — le SRD est une LAMPE : allumée, et rien à pousser. */
  assert.deepEqual(srdEstUnVoyantF(node), [], "Eric, 09/09 : « un voyant, pas un bouton »");
  assert.equal(socle(node).querySelectorAll(".interrupteur-piste").length, 0, "aucune piste, aucun pouce : ce n'est pas un interrupteur grisé");
  assert.ok(socle(node).querySelectorAll(".voyant-lampe")[0], "…mais une lampe dessinée, que la feuille peint sur data-on");
  assert.equal(socle(node).querySelectorAll(".ligne-familles")[0].textContent, "engine · catalog", "le SRD est le book de base : engine et catalog");
  assert.equal(socle(node).querySelectorAll(".ligne-etiquette")[0].textContent, MOTS_DE_LAYERS.etiquetteSocle);
  assert.doesNotMatch(node.textContent, /core rules/, "⛔ le SRD n'est pas « the core rules » : ce sont les livres WotC (lexique du 29/09)");

  /* ⭐ FATE'S HAND : UN interrupteur, tout ou rien, ses familles lues. */
  assert.equal(maitre(node).dataset.on, "true");
  assert.equal(maitre(node).querySelectorAll(".ligne-familles")[0].textContent, "engine · world · catalog");
  assert.equal(node.querySelectorAll("[data-enfant]").length, 0, "⛔ plus aucune ligne d'enfant : « Tout ou rien »");
  assert.equal(node.querySelectorAll('[role="switch"]').length, 1, "sans livre installé, un seul interrupteur sur la page : Fate's Hand");

  /* ⭐ RIEN D'ÉTEINT, DONC PAS DE SÉPARATEUR (Eric, 29/09 : la rangée vide est cachée). */
  assert.equal(separateurDesEteints(node), undefined, "« installed, not active » est caché quand rien n'est éteint");
  /* ⛔ un livre ni installé ni déclaré ne se montre pas */
  assert.equal(node.querySelectorAll("[data-livre], [data-ligne-livre]").length, 0, "aucun livre sur cet appareil, aucun livre à l'écran");

  /* ⭐ LES OPTIONS : `Import a book`, place réservée au gabarit LARGE, et ⛔ plus de
     `Delete a book` (chaque livre porte sa poubelle). */
  const options = node.querySelectorAll(".layers-options")[0];
  assert.ok(options, "la rangée des options existe");
  /* 🔄 LOT 388 — `Import a book` EST CÂBLÉ : une porte VIVANTE au gabarit large, plus une place réservée. */
  const boutons = options.querySelectorAll("button.menu-porte");
  assert.deepEqual(boutons.map((b) => b.textContent), [MOTS_DE_LAYERS.importer], "la dictée : « Bouton import a book », et lui seul");
  assert.equal(options.querySelectorAll("[data-reserve]").length, 0, "⛔ plus une place réservée");
  assert.ok(node.querySelectorAll("[data-importer]")[0], "sa clef de construction");
  /* 🗄️ `+ TABLE ITEMS` A QUITTÉ LAYERS — Eric, 29/09 : *« table items devient -> campaign items
     (et va dans Dungeon master) »*. La page Dungeon Master le pose (lot 357). ⚔️ Vu rouge : le
     lot 351 portait encore sa place réservée à côté d'`Import a book`. */
  assert.equal(node.querySelectorAll("[data-homebrew]").length, 0, "⛔ plus aucune place de contenu de table sur Layers");
  assert.doesNotMatch(node.textContent, /Table items|Campaign items/i, "⛔ ni l'ancien mot, ni le nouveau : il vit dans Dungeon Master");
  assert.equal("tableItems" in MOTS_DE_LAYERS, false, "le mot est parti de la table des mots de Layers");
  assert.equal(node.querySelectorAll("button").some((b) => /Delete a book/i.test(b.textContent)), false, "⛔ plus de bouton « Delete a book »");
});

test("D2 — 🎛️ UN PERSO D'AVANT (Trainings coupé au temps des six) : Fate's Hand se montre allumé, aucune ligne d'enfant, aucun mot rouge", () => {
  /* 🗄️ D2 tenait « Trainings éteint, Inheritance dort avec son mot » — l'écran des six. 🔄 Un
     tel perso existe encore (sauvé avant le lot 351) : il est LÉGITIME (B2), Fate's Hand est
     engagé, et l'écran le dit sans l'accuser. L'éteindre puis le rallumer le remet en
     tout-ou-rien. */
  const node = rendu({ document: docAvec(sans(PILE_COMPLETE, ["fh-trainings-en", "fh-inheritance-en"])) });
  assert.equal(maitre(node).dataset.on, "true", "Fate's Hand reste engagé");
  assert.equal(groupeDe(node, maitre(node)), "actif");
  assert.equal(node.querySelectorAll("[data-enfant]").length, 0, "⛔ aucune ligne d'enfant ne revient pour ce cas");
  assert.equal(node.querySelectorAll(".doc-field-error").length, 0, "⛔ aucun mot rouge : ce sous-ensemble est légitime");
});

test("D3 — 🎛️ FATE'S HAND ÉTEINT : il descend sous « installed, not active », et le SRD reste une lampe ALLUMÉE", () => {
  /* ⭐ CHAQUE LIGNE VA OÙ SON ÉTAT LA MET (le plan v10 : actifs en haut, installés éteints
     dessous). 🔴 LE GARDE DU LOT 188 SOUS SA NOUVELLE FORME : « le SRD ne s'éteint JAMAIS ». */
  const node = rendu({ document: docAvec(SOCLE) });
  assert.equal(maitre(node).dataset.on, "false");
  assert.ok(separateurDesEteints(node), "quelque chose est éteint : le séparateur se montre");
  assert.equal(groupeDe(node, maitre(node)), "eteint", "Fate's Hand éteint est sous le séparateur");
  assert.equal(socle(node).dataset.on, "true", "le SRD ne s'éteint JAMAIS");
  assert.equal(groupeDe(node, socle(node)), "actif", "…et il reste en tête");
  assert.deepEqual(srdEstUnVoyantF(node), [], "…et il reste une lampe quand Fate's Hand dort");
});

test("D0 — ⚔️ ATTAQUE (lot 189) — remettre l'interrupteur verrouillé au socle fait ROUGIR la clause", () => {
  /* ⛔ C'EST LE DÉFAUT EXACT DE LA v612, PAS UNE CARICATURE : le socle était
     `interrupteur({ on: true, disabled: true })`. On le refabrique avec le VRAI
     organe, on lui pose `data-socle`, et la clause doit accuser — sur ce que
     l'arbre d'accessibilité annonce. Un garde qui ne peut jamais accuser est
     le pire de tous. */
  const mutant = document.createElement("section");
  const ancien = interrupteur({ label: "SRD 5.2.1", note: "always on", on: true, disabled: true, onChange: () => {} });
  ancien.dataset.socle = "true";
  mutant.append(ancien);
  const fautes = srdEstUnVoyantF(mutant);
  assert.ok(fautes.some((f) => /role=switch/.test(f)), `la clause doit accuser role=switch — ${fautes}`);
  assert.ok(fautes.some((f) => /aria-checked/.test(f)), "…et aria-checked");
  assert.ok(fautes.some((f) => /disabled/.test(f)), "…et disabled");
  assert.ok(fautes.some((f) => /<button>/.test(f)), "…et la nature de bouton");
  /* ⭐ ET LE TÉMOIN INVERSE : le voyant nu, sans écran autour, passe la clause —
     c'est bien l'ORGANE qui est jugé, pas la page. */
  const temoin = document.createElement("section");
  const lampe = voyant({ label: "SRD 5.2.1", familles: "engine · catalog" });
  lampe.dataset.socle = "true";
  temoin.append(lampe);
  assert.deepEqual(srdEstUnVoyantF(temoin), []);
  /* ⛔ ET AUCUN `role=switch` DE L'ÉCRAN NE COMMENCE PAR « SRD » — la moitié
     qui attrape un second écrivain : un interrupteur SRD posé AILLEURS que
     sous `data-socle` passerait la clause du socle. */
  const node = rendu();
  const switches = node.querySelectorAll('[role="switch"]').filter((b) => /^SRD/.test(b.textContent.trim()));
  assert.deepEqual(switches, [], "un interrupteur nommé SRD existe encore dans Layers");
});

test("D4 — 🔌 les gestes : Fate's Hand demande la PILE, un livre demande SON interrupteur, sa poubelle DEMANDE, le socle n'émet rien — et plus aucun enfant", () => {
  /* 🗄️ D4 tenait aussi « un enfant demande SON interrupteur » (`requestLayerSwitch`) : il
     n'y a plus d'enfant. ⚔️ Le garde gagne l'ensemble : chaque contrôle vivant de la page,
     pressé une fois, émet un verbe connu — `requestLayerSwitch` n'en fait plus partie. */
  const vus = [];
  const pile = [...manifestFor(PILE_COMPLETE), livreMonte("xdmg-en", "Dungeon Master's Guide (2024)")];
  const node = rendu({ pile, document: docAvec([...SOCLE, "xdmg-en", ...FH_LAYER_IDS]) }, (a) => vus.push(a));
  socle(node).click();
  assert.deepEqual(vus, [], "⛔ le voyant SRD ne demande rien — il n'a AUCUN écouteur, pas un `disabled` qui retient un clic");
  maitre(node).click();
  assert.deepEqual(vus, [{ kind: "requestLayerStack", value: "srd" }], "Fate's Hand demande la pile : la coquille confirme avant d'éteindre");
  ligneLivre(node, "xdmg-en").querySelectorAll(".interrupteur")[0].click();
  assert.deepEqual(vus[1], { kind: "requestBookSwitch", id: "xdmg-en", value: false });
  /* ⏳ LA POUBELLE EST ÉTEINTE — Eric, 29/09 : « La poubelle d'un livre efface son contenu de son lieu de stockage. Ce lieu de stockage est
     décidé par le bouton vault. » Aucun livre ne vit encore dans ce
     stockage : elle se montre et ne se tape pas. */
  const trash = ligneLivre(node, "xdmg-en").querySelectorAll(".poubelle")[0];
  assert.equal(trash.disabled, true, "éteinte : présente, jamais tapée");
  trash.click();
  assert.equal(vus.length, 2, "⛔ une poubelle éteinte ne demande rien");
  /* …mais son geste reste CÂBLÉ : le jour où elle s'allume, la question l'attend. */
  trash.disabled = false;
  trash.click();
  assert.deepEqual(vus[2], { kind: "demanderEffacerUnLivre", id: "xdmg-en" }, "⛔ la poubelle n'efface rien : elle DEMANDE");
  const off = rendu({ document: docAvec(SOCLE) }, (a) => vus.push(a));
  maitre(off).click();
  assert.deepEqual(vus[3], { kind: "requestLayerStack", value: "srdfh" });
  /* ⚔️ L'ENSEMBLE DES VERBES QU'UN DOIGT PEUT ÉMETTRE, NI PLUS NI MOINS */
  const tous = [];
  const page = rendu({ pile, document: docAvec([...SOCLE, "xdmg-en", ...FH_LAYER_IDS]) }, (a) => tous.push(a.kind));
  for (const b of page.querySelectorAll("button").filter((x) => !x.disabled)) b.click();
  /* 🔄 LOT 388 — `Import a book` émet son verbe ; la poubelle d'un livre qui n'est pas dans le lieu reste éteinte. */
  assert.deepEqual([...new Set(tous)].sort(), ["importerUnLivre", "requestBookSwitch", "requestLayerStack"],
    "⛔ aucun `requestLayerSwitch` : Fate's Hand est tout ou rien ; et la poubelle éteinte n'émet rien");
});

test("D5 — 📚 un livre : MONTÉ → son interrupteur, ses familles, « your copy », sa poubelle ; DÉCLARÉ mais absent → son mot ; ni l'un ni l'autre → rien ; illisible → sa raison", () => {
  /* ⚖️ Eric, 29/09 : *« juste une poubelle à côté comme My Characters »* ; et PHB, DMG sont
     des EXEMPLES — seuls les livres installés se montrent. */
  const pile = [...manifestFor(PILE_COMPLETE), livreMonte("xdmg-en", "Dungeon Master's Guide (2024)")];
  const eteint = rendu({ pile });
  const ligne = ligneLivre(eteint, "xdmg-en");
  assert.ok(ligne, "le DMG monté a sa ligne");
  const dmg = ligne.querySelectorAll(".interrupteur[data-livre]")[0];
  assert.equal(dmg.dataset.livre, "xdmg-en");
  assert.equal(dmg.dataset.on, "false", "le document ne le déclare pas : éteint");
  assert.equal(groupeDe(eteint, ligne), "eteint", "…donc sous « installed, not active »");
  assert.equal(dmg.querySelectorAll(".ligne-familles")[0].textContent, "catalog", "un livre de règles de base n'apporte que du catalogue");
  assert.equal(dmg.querySelectorAll(".ligne-etiquette")[0].textContent, MOTS_DE_LAYERS.etiquetteLivre);
  const trash = ligne.querySelectorAll(".poubelle");
  assert.equal(trash.length, 1, "une poubelle, sur SA ligne");
  assert.equal(trash[0].getAttribute("aria-label"), "Delete Dungeon Master's Guide (2024)", "elle porte le nom du livre");
  const place = ligne.childNodes.at(-1);
  assert.equal(place.querySelectorAll(".poubelle")[0], trash[0], "…tout à droite de la ligne");
  /* ⏳ éteinte, « soon » sous elle : la forme d'une place réservée (Eric, 29/09 — le stockage
     du Vault ne porte encore aucun livre) */
  assert.equal(trash[0].disabled, true);
  assert.equal(trash[0].dataset.reserve, "true");
  assert.equal(place.querySelectorAll(".tdc-bientot")[0].textContent, "soon", "un mot sous elle, celui de toute place réservée");
  assert.equal(eteint.querySelectorAll("[data-livre]").filter((n) => n.dataset.livre === "xphb-en").length, 0,
    "⛔ le PHB n'est ni installé ni déclaré : il ne se montre pas");

  const vus = [];
  const allume = rendu({ pile, document: docAvec([...SOCLE, "xdmg-en", ...FH_LAYER_IDS]) }, (a) => vus.push(a));
  assert.equal(ligneLivre(allume, "xdmg-en").querySelectorAll(".interrupteur")[0].dataset.on, "true");
  assert.equal(groupeDe(allume, ligneLivre(allume, "xdmg-en")), "actif", "déclaré : en haut, avec le SRD et Fate's Hand");
  assert.equal(separateurDesEteints(allume), undefined, "rien d'éteint : pas de séparateur");

  /* DÉCLARÉ MAIS ABSENT (le perso ouvert sur un autre appareil — A-TRANCHER §C34) : il se
     montre avec son mot, en haut, et ⛔ sans poubelle (rien à effacer ici). */
  const absent = rendu({ document: docAvec([...SOCLE, "xphb-en", ...FH_LAYER_IDS]) });
  const phb = absent.querySelectorAll(".tdc-ligne[data-livre]").find((l) => l.dataset.livre === "xphb-en");
  assert.ok(phb, "le PHB déclaré se montre");
  assert.match(phb.textContent, new RegExp(MOTS_DE_LAYERS.absent));
  assert.equal(groupeDe(absent, phb), "actif");
  assert.equal(absent.querySelectorAll(".poubelle").length, 0, "⛔ pas de poubelle pour un livre qui n'est pas sur l'appareil");

  const refuse = rendu({ pile: manifestFor(PILE_COMPLETE), livresRefuses: [{ id: "xphb-en", raison: "schema vaut « fhpc.layer/1 »" }] });
  const illisible = refuse.querySelectorAll(".tdc-ligne[data-livre]").find((l) => l.dataset.livre === "xphb-en");
  assert.match(illisible.textContent, /unreadable: schema/, "un fichier présent mais illisible ne se tait pas");
});

test("D6 — ⭐ LA QUESTION DU MAÎTRE SE POSE EN FENÊTRE : ni Layers ni R n'en portent de copie ; la coquille la peint depuis `pendingStack`, réponse exigée", () => {
  /* ⚖️ ARCHI 35, 29/09, tranché en architecte : posée sous l'interrupteur (le placement du
     09/09), la question faisait DÉFILER Layers de 127 px à 1280 × 800 (mesuré au banc) — et
     Eric : *« on respecte les hauteurs de dalle, pas de scroll »*. 🗄️ D6 tenait « la question
     se pose sur CET écran, juste sous Fate's Hand ». */
  assert.equal(rendu({ pendingStack: "srd" }).querySelectorAll(".confirm-dialog").length, 0, "Layers n'en porte plus de copie, même en attente");
  const r = renderUniverseStep({ document: docAvec(PILE_COMPLETE), query: () => null, fieldErrors: {}, memoire: { ok: true }, pendingStack: "srd" }, () => {});
  assert.equal(r.querySelectorAll(".confirm-dialog").length, 0, "R non plus (ARCHI 35 : « R perd sa copie en ligne »)");
  /* LA COQUILLE : la fenêtre est la VUE de `pendingStack` — un seul écrivain. */
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  const debut = shell.indexOf("function paintPopup()");
  assert.ok(debut > 0, "témoin : la coquille peint ses fenêtres");
  const peindre = shell.slice(debut, shell.indexOf("\n}\n", debut));
  assert.match(peindre, /if \(!state\.popup && state\.pendingStack/, "la question se peint quand elle attend — et un refus (`state.popup`) passe d'abord");
  assert.ok(peindre.indexOf("state.pendingStack") < peindre.indexOf("popupLayer.hide()"),
    "⛔ l'attente se lit AVANT le « rien à montrer », sinon la question ne s'afficherait jamais");
  assert.match(peindre, /renderConfirmationPile\(state\.document/, "même organe : trois voies intactes");
  assert.match(peindre, /exigeUneReponse: true/, "réponse exigée (lot 201) : ni clic dehors ni Échap");
  assert.doesNotMatch(shell, /pendingStack: state\.pendingStack/, "⛔ aucun écran ne reçoit plus l'attente : la fenêtre en est le seul lecteur");
});

test("D8 — 🗑️ LA POUBELLE, ORGANE AU SOCLE : un bouton carré, DESSINÉ, nommé, qui émet et n'efface pas — jamais sur le SRD ni sur Fate's Hand", () => {
  /* ⚖️ Eric, 29/09 : la poubelle de `Layers` est celle de `My characters` (lot 352) — ⭐ un
     seul organe, une feuille sans import (`poubelle-organe.mjs`). */
  const vus = [];
  const b = poubelle({ mot: "Delete X", onClick: () => vus.push("clic") });
  assert.equal(b.tagName, "BUTTON");
  assert.equal(b.type, "button");
  assert.equal(b.className, "poubelle");
  assert.equal(b.getAttribute("aria-label"), "Delete X", "un bouton sans nom serait muet pour un lecteur d'écran");
  const dessin = b.querySelectorAll("svg")[0];
  assert.ok(dessin, "✏️ DESSINÉE, jamais un glyphe");
  assert.equal(dessin.getAttribute("aria-hidden"), "true", "le dessin se tait : le bouton porte le nom");
  assert.equal(dessin.querySelectorAll("path")[0].getAttribute("d"), TRAIT_DE_LA_POUBELLE, "le trait du plan v10");
  assert.doesNotMatch(b.textContent, /🗑|trash/i, "⛔ ni emoji ni mot à la place du dessin");
  b.click();
  assert.deepEqual(vus, ["clic"]);
  /* ⏳ ÉTEINTE : présente, `disabled`, `data-reserve` — et le clic n'arrive pas. */
  const eteinte = poubelle({ mot: "Delete Y", eteinte: true, onClick: () => vus.push("éteinte") });
  assert.equal(eteinte.disabled, true);
  assert.equal(eteinte.dataset.reserve, "true");
  eteinte.click();
  assert.deepEqual(vus, ["clic"], "une poubelle éteinte ne répond pas");
  assert.equal(b.disabled, false, "témoin : sans `eteinte`, elle s'allume — celle de My characters (lot 352)");
  /* ⛔ jamais sur le SRD ni sur Fate's Hand */
  const pile = [...manifestFor(PILE_COMPLETE), livreMonte("xdmg-en", "Dungeon Master's Guide (2024)")];
  const node = rendu({ pile });
  assert.equal(socle(node).querySelectorAll(".poubelle").length, 0);
  assert.equal(porteuse(node, maitre(node)).querySelectorAll(".poubelle").length, 0, "Fate's Hand vient avec le builder : il ne s'efface pas");
  assert.equal(node.querySelectorAll(".poubelle").length, 1, "une poubelle par livre installé, et c'est tout");
  /* ⭐ UN SEUL ORGANE : `Layers` le prend, il ne le refait pas */
  const source = stripComments(fs.readFileSync(path.join(UI, "layers-ecran.mjs"), "utf8"));
  assert.match(source, /import \{ poubelle \} from "\.\/poubelle-organe\.mjs/, "l'écran importe l'organe");
  assert.doesNotMatch(source, /createElementNS|M4 7h16/, "⛔ l'écran ne redessine pas la poubelle");
});

test("D9 — ❓ « DELETE THIS BOOK? » : la question vient avant l'effacement, elle EXIGE sa réponse, et `Cancel` comme `Delete` portent le rouge de leur mot (lot 371)", () => {
  /* ⚖️ Eric, 29/09 : Delete a book *« demande aussi une confirmation »*. */
  const voies = [];
  const popup = popupEffacerUnLivre({ nom: "Dungeon Master's Guide (2024)", choisir: (v) => voies.push(v) });
  assert.equal(popup.titre, MOTS_EFFACER_UN_LIVRE.titre);
  assert.equal(popup.titre, "Delete this book?");
  /* 🔄 LOT 371 — `popup-question-exige-une-reponse`, `popup-aiguilleur-nom-et-critere`,
     `bouton-deux-mots-retour-et-couleur-se-deduit-mot` : « un tap dehors vaut Cancel » n'était pas d'Eric. */
  assert.equal(popup.role, "aiguilleur", "ce qu'on ne peut pas refuser est un aiguilleur, pas un guide");
  assert.match(popup.texte, /Dungeon Master's Guide \(2024\)/, "elle nomme le livre");
  /* 🔄 LOT 388 — et le lieu qu'il quitte, par la donnée */
  assert.match(popup.texte, /It leaves this device\./);
  assert.match(popupEffacerUnLivre({ nom: "X", lieu: "your Dropbox", choisir() {} }).texte, /It leaves your Dropbox\./);
  assert.deepEqual(popup.actions.map((a) => a.mot), ["Cancel", "Delete"]);
  assert.deepEqual(popup.actions.map((a) => a.defait), [true, true], "`Cancel` rouge par son mot, `Delete` par ce qu'il coûte");
  for (const a of popup.actions) a.faire();
  assert.deepEqual(voies, ["cancel", "delete"], "chaque voie émet son nom — la fenêtre ne sait pas ce qu'elle fait");
  assert.equal(popup.exigeUneReponse, true, "⛔ ni tap dehors, ni Échap");
});

/* ══ G — LOT 192 : WORLD, ET LA SAUVEGARDE AVANT L'EXTINCTION ═════════════
   ⚖️ Eric, 10/09 (ARCHITECTURE.md, § « LE LEXIQUE ») : *« pas Lore mais
   World ? ça me va »* ; et *« il faut que la version FH reste sauvegardée,
   donc ça duplique le perso. Au moins poser la question : voulez-vous garder
   une sauvegarde de la version FH ? »*. */

/** Le mot entier, en respectant la casse : `lore` dans un id (`fh-lore-en`,
 *  `data-enfant="lore"`) n'est pas un mot de joueur ; « Lore » dans un TEXTE
 *  rendu, si. */
const porteLeMotLore = (texte) => /\bLore\b/.test(texte);
/** Les textes RENDUS d'un arbre, un par nœud de texte — ce que le joueur lit.
 *  ⚠️ PAS `textContent` de la racine : il COLLE les nœuds (« World » + « Lore
 *  — … » → « WorldLore — … »), et `\b` ne voit plus le mot. Mesuré au lot 192 :
 *  la mutation « Lore » remis dans la NOTE restait verte sous `textContent`.
 *  Un garde se fonde sur la donnée : chaque texte, tel qu'il est posé. */
function textesRendus(node) {
  if (!node) return [];
  if (node.nodeType === 3) return [node.textContent];
  return (node.childNodes || []).flatMap(textesRendus);
}
const unTexteRenduPorteLore = (node) => textesRendus(node).filter(porteLeMotLore);

test("G1 — 🔴 « Lore » n'est plus un mot du joueur : ni sur Layers, ni sur R, ni dans la confirmation, ni dans le mot d'un choix non résolu", () => {
  const layers = rendu();
  assert.ok(textesRendus(layers).length > 8, "témoin : le balayage lit bien les textes de l'écran");
  assert.deepEqual(unTexteRenduPorteLore(layers), [], "Layers porte encore « Lore »");
  /* 🔄 LOT 351 — World n'est plus une LIGNE à pousser : c'est une FAMILLE de Fate's Hand, lue
     (« engine · world · catalog », la dictée du 29/09). 🗄️ Ce garde tenait « la cinquième
     ligne dit World, sa note dit the world without its rules » : il n'y a plus de cinquième ligne. */
  assert.match(maitre(layers).querySelectorAll(".ligne-familles")[0].textContent, /\bworld\b/, "world se lit, dans les familles de Fate's Hand");
  const r = renderUniverseStep({ document: docAvec(PILE_COMPLETE), query: () => null, fieldErrors: {}, memoire: { ok: true } }, () => {});
  assert.deepEqual(unTexteRenduPorteLore(r), [], "R ne dit pas « Lore »");
  /* 🔄 LOT 351 — la confirmation vit en FENÊTRE (D6) : on la lit à son organe, celui que la
     fenêtre peint, sous ses deux titres. */
  const question = renderConfirmationPile(docAvec(PILE_COMPLETE), () => null, () => {});
  assert.ok(question.querySelectorAll(".confirm-dialog-title")[0], "témoin : c'est bien la question");
  assert.deepEqual(unTexteRenduPorteLore(question), [], "la confirmation ne dit pas « Lore »");
  /* ⚠️ la confirmation a DEUX titres (avec / sans choix Fate's Hand en jeu) :
     un Araag choisi et une pile qui le nomme rendent l'autre — mesuré au lot
     192, une mutation du premier titre restait verte sans ce rendu. */
  const avecAraag = docAvec(PILE_COMPLETE, { build: { layers: manifestFor(PILE_COMPLETE), choices: [{ ref: { kind: "species", id: "fh:species:en:araag" }, label: "Species" }], budgets: {}, overrides: [] } });
  const nomme = () => ({ record: { name: "Araag" } });
  const questionAvec = renderConfirmationPile(avecAraag, nomme, () => {});
  assert.equal(questionAvec.querySelectorAll(".confirm-dialog-items li").length, 1, "témoin : l'autre titre, avec sa liste");
  assert.deepEqual(unTexteRenduPorteLore(questionAvec), [], "la confirmation avec ses choix nommés ne dit pas « Lore »");
  /* le mot d'un choix non résolu nomme L'INTERRUPTEUR QUI EXISTE — 🔄 LOT 351 : Fate's Hand,
     tout ou rien ; « comes with World » enverrait le joueur vers une ligne disparue. */
  assert.equal(motDUnRecordAbsent("fh:species:en:araag"), "Araag comes with Fate's Hand — switch it on in Layers");
  /* l'écran mort, pile inconnue : pas de « Lore » non plus */
  assert.equal(porteLeMotLore(String(motDeLEcranMort(docAvec([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "fh-lore-en"])) || "")), false, "l'écran mort ne dit pas « Lore »");
  /* ⚔️ le témoin du garde : un texte qui porterait le mot ferait rougir — et un id ne le fait pas */
  assert.equal(porteLeMotLore("Lore — the species of Nymedes"), true);
  assert.equal(porteLeMotLore('data-enfant="lore" fh-lore-en'), false, "un id n'est pas un mot de joueur");
});

test("G2 — 💾 la séquence pure : Save D'ABORD, l'extinction ENSUITE ; un Save qui refuse n'éteint pas", async () => {
  /* ⏳ LOT 195 — LA SÉQUENCE ATTEND (le magasin range en différé), et le garde
     attend avec elle. ⛔ LA RÈGLE N'EST PAS DESSERRÉE D'UN CRAN : ce qui suit
     mesure exactement ce qu'il mesurait, plus une chose de plus — une PROMESSE
     de refus est un refus, alors qu'un `await` oublié la rendrait « vraie ». */
  const journal = [];
  const ok = await sauvegarderPuisEteindre({ sauvegarder: () => { journal.push("save"); return true; }, eteindre: () => journal.push("off") });
  assert.equal(ok, true);
  assert.deepEqual(journal, ["save", "off"], "⛔ éteint d'abord, le fichier serait la version SRD");
  /* ⚔️ le Save a refusé (moteur pas chargé, magasin qui jette) — il l'a dit ; on n'éteint pas */
  const refus = [];
  assert.equal(await sauvegarderPuisEteindre({ sauvegarder: () => { refus.push("save"); return false; }, eteindre: () => refus.push("off") }), false);
  assert.deepEqual(refus, ["save"], "la question était de garder la copie, pas de couper coûte que coûte");
  /* et un Save qui ne DIT rien (undefined) compte comme un refus : une absence n'est jamais une réponse */
  const muet = [];
  assert.equal(await sauvegarderPuisEteindre({ sauvegarder: () => { muet.push("save"); }, eteindre: () => muet.push("off") }), false);
  assert.deepEqual(muet, ["save"]);
  /* ⚔️ LOT 195 — UNE PROMESSE QUI REND `false` EST UN REFUS, et une promesse de
     `true` est un accord : c'est la forme réelle depuis que le magasin range en
     différé, et c'est celle qu'un `await` oublié ferait passer pour vraie dans
     les deux sens. */
  const differe = [];
  assert.equal(await sauvegarderPuisEteindre({
    sauvegarder: async () => { differe.push("save"); return false; }, eteindre: () => differe.push("off")
  }), false, "⛔ une promesse n'est pas un accord");
  assert.deepEqual(differe, ["save"]);
  const tenu = [];
  assert.equal(await sauvegarderPuisEteindre({
    sauvegarder: async () => { tenu.push("save"); return true; }, eteindre: () => tenu.push("off")
  }), true);
  assert.deepEqual(tenu, ["save", "off"]);
});

test("G3 — 🎛️ la confirmation du maître (la fenêtre) porte TROIS voies : Keep on n'émet rien qui éteigne, Save… émet la voie qui sauvegarde puis éteint, Switch off éteint sans sauvegarder", () => {
  /* 🔄 LOT 351 — elle ne vit plus sur Layers ni sur R : la coquille la peint en FENÊTRE (D6).
     Le garde lit donc l'organe que la fenêtre peint — les trois voies n'ont pas bougé. */
  for (const [nom, ecran] of [["la fenêtre", (act) => renderConfirmationPile(docAvec(PILE_COMPLETE), () => null, act)]]) {
    const gestes = [];
    const node = ecran((a) => gestes.push(a));
    const boutons = node.querySelectorAll(".confirm-dialog-actions button");
    assert.deepEqual(boutons.map((b) => b.textContent), ["Save the Fate's Hand version first", "Keep on", "Switch off"],
      `${nom} : trois voies — la sauvegarde sur sa ligne, puis la paire d'avant`);
    boutons[1].click();
    assert.deepEqual(gestes, [{ kind: "cancelLayerStack" }], `${nom} : Keep on n'éteint rien`);
    boutons[0].click();
    assert.deepEqual(gestes.at(-1), { kind: "saveAndConfirmLayerStack" }, `${nom} : la troisième voie demande Save PUIS l'extinction à la coquille`);
    boutons[2].click();
    assert.deepEqual(gestes.at(-1), { kind: "confirmLayerStack" }, `${nom} : Switch off éteint sans sauvegarder — le comportement d'avant`);
    assert.equal(gestes.length, 3, "trois clics, trois gestes, aucun double");
  }
  /* le mot de la version, dans le nom du fichier : un slug de l'alphabet de `nomDeFichier` */
  assert.equal(NOM_DE_LA_VERSION_FH, "fates-hand");
});

test("D7 — 🚪 R porte la porte `Layers`, et sa ligne `Rules` lit la COMPOSITION : Fate's Hand même avec une couche coupée", () => {
  /* 🔄 LOT 350 — RÉÉCRIT À LA NOUVELLE VÉRITÉ, PAS RELÂCHÉ. Eric, 29/09 : l'interrupteur quitte R
     (il vit ici, dans `Layers`) ; R LIT la pile sur sa ligne `Rules`. ⭐ Ce que le garde tient ne
     bouge pas d'un mot : un sous-ensemble légitime n'est pas « hors des deux jeux de règles ». */
  const gestes = [];
  const r = renderUniverseStep({ document: docAvec(sans(PILE_COMPLETE, ["fh-trainings-en", "fh-inheritance-en"])), query: () => null, fieldErrors: {}, memoire: { ok: true } }, (a) => gestes.push(a));
  const porte = r.querySelectorAll(".menu-porte").find((b) => b.textContent === "Layers");
  assert.ok(porte, "la porte existe");
  assert.equal(porte.textContent, "Layers");
  porte.click();
  assert.deepEqual(gestes, [{ kind: "ouvrirLayers" }]);
  const regles = r.querySelectorAll('.tdc-ligne-lue[data-ligne="rules"] .tdc-ligne-valeur')[0];
  assert.equal(regles.textContent, "Fate's Hand", "⛔ avant le lot 188, `currentStack` rendait null et la pile se lisait SRD");
  const rouge = (n) => n.querySelectorAll(".doc-field-error").filter((p) => /either ruleset/.test(p.textContent));
  assert.equal(rouge(r).length, 0, "et aucun mot rouge : le sous-ensemble est légitime");
  /* ⚔️ Et le mot rouge SURVIT pour ce qui le mérite : un ensemble coupé en deux. */
  const coupe = renderUniverseStep({ document: docAvec(sans(PILE_COMPLETE, ["fh-spells-en"])), query: () => null, fieldErrors: {}, memoire: { ok: true } }, () => {});
  assert.equal(rouge(coupe).length, 1, "Destiny privé d'une couche : le Menu le DIT toujours");
  assert.match(rouge(coupe)[0].textContent, /open Layers/, "…et il envoie là où l'on répare : l'interrupteur est dans `Layers`");
});

/* ══ E — ⚔️ SUR LA VRAIE PILE ══════════════════════════════════════════════
   Le geste EXACT de `monterLesCouches` (shell.mjs) rejoué sur le vrai bloc
   `layers` et le vrai bloc `build` — c'est le test C du lot 54, étendu aux
   sous-ensembles. */

function pileReelle() {
  return makeHarness({ layers: LAYER_FILES.map((f) => `layers/${f}`), modules: MODULES_DE_LA_PAGE() });
}
/** `monterLesCouches`, tel que la coquille l'écrit : éteindre par le haut,
 *  allumer par le bas, puis `build.layers = []` pour que `rebuild` adopte. */
function monter(h, doc, voulues) {
  const voulu = new Set(voulues);
  for (const id of [...FH_LAYER_IDS].reverse()) if (!voulu.has(id)) h.layers.verbs.disable({ id });
  for (const id of FH_LAYER_IDS) if (voulu.has(id)) h.layers.verbs.enable({ id });
  return h.verbs.rebuild({ document: { ...doc, build: { ...doc.build, layers: [] } } }).document;
}
function exempleSur(h) {
  const ex = readJson("examples/personnage-fh-en-niveau1.fh-char.json");
  return h.verbs.rebuild({ document: { ...ex, build: { ...ex.build, layers: manifestOf(h.layers) } } }).document;
}
const actives = (h) => h.layers.verbs.stack().filter((c) => c.enabled).map((c) => c.id);

test("E1 — ⚔️ UN PERSO D'AVANT, TRAININGS COUPÉ : 2 couches sortent, 9 FH restent, `fh.trainings` et `fh.inheritance` tombent — et l'écran montre Fate's Hand allumé", () => {
  /* 🔄 LOT 351 — ce sous-ensemble ne se PRODUIT plus depuis l'écran (tout ou rien), mais un perso
     sauvé avant le déclare encore, et l'alignement du boot le monte tel quel : c'est ce que le
     moteur en fait que ce garde tient. Le sous-ensemble s'écrit EN CLAIR (la carte), ⛔ plus
     par `couchesApresLeGeste`, partie avec les six interrupteurs. */
  const h = pileReelle();
  let doc = exempleSur(h);
  const avant = h.layers.verbs.flags();
  assert.ok(avant.includes("fh.trainings") && avant.includes("fh.inheritance"), "témoin : les deux drapeaux sont levés au départ");

  doc = monter(h, doc, sans(FH_LAYER_IDS, [...sw("trainings").couches, ...sw("inheritance").couches]));
  const restantes = actives(h).filter((id) => FH_LAYER_IDS.includes(id));
  assert.equal(restantes.length, FH_LAYER_IDS.length - 2, "9 couches Fate's Hand restent");
  assert.deepEqual(restantes, sans(FH_LAYER_IDS, ["fh-trainings-en", "fh-inheritance-en"]));
  const apres = h.layers.verbs.flags();
  assert.equal(apres.includes("fh.trainings"), false);
  assert.equal(apres.includes("fh.inheritance"), false, "Inheritance est partie AVEC Trainings");
  assert.ok(apres.includes("fh.destiny") && apres.includes("fh.skills"), "les autres règles tournent toujours");
  /* La ceinture (lot 186) redonne au cran 3 son nom SRD — sans une branche de plus. */
  assert.equal(cransAlignes(apres)[3].mot, "Background");
  /* Et l'écran, sur le document que `rebuild` vient d'adopter : Fate's Hand engagé, sans enfant. */
  const node = renderLayersEcran({ document: doc, pile: h.layers.verbs.stack() }, () => {});
  assert.equal(maitre(node).dataset.on, "true", "le perso d'avant garde Fate's Hand allumé");
  assert.equal(node.querySelectorAll("[data-enfant]").length, 0, "⛔ aucune ligne d'enfant ne revient");
});

test("E2 — ⚔️ LE PIÈGE `fh-species-en` : Destiny coupé (un perso d'avant) baisse `fh.destiny`, et la ceinture PERD son cran", () => {
  const h = pileReelle();
  let doc = exempleSur(h);
  assert.ok(h.layers.verbs.flags().includes("fh.destiny"), "témoin : levé au départ");
  const iDestiny = STEPS.findIndex((s) => s.id === "destiny");
  assert.ok(cransAlignes(h.layers.verbs.flags())[iDestiny], "témoin : le cran Destiny est sur la ceinture");

  doc = monter(h, doc, sans(FH_LAYER_IDS, sw("destiny").couches));
  assert.ok(actives(h).includes("fh-species-en"), "témoin : les espèces (World, allumé) sont TOUJOURS montées");
  assert.equal(h.layers.verbs.flags().includes("fh.destiny"), false,
    "⛔ AVANT LE LOT 191 : `fh-species-en` levait `fh.destiny`, et le cran restait sur la ceinture, Destiny éteint");
  assert.equal(cransAlignes(h.layers.verbs.flags())[iDestiny], null, "la ceinture n'a plus de cran Destiny");
  assert.equal(compositionFh(doc).legitime, true, "et le personnage n'est pas « hors des deux jeux »");
  assert.notEqual(motDeLEcranMort(doc), MOT_PILE_INCONNUE, "⛔ ni sur l'écran mort");
  /* Le Score de Destinée n'est plus publié : une règle éteinte ne tourne pas. */
  assert.equal((doc.resolved.stats || []).some((s) => s.id === "fh:destiny"), false,
    "sans Destiny, aucun Score de Destinée — la Base d'espèce est un terme, pas la règle");
});

test("E3 — ⚔️ Fate's Hand (`applyLayerStack`) : éteint, tout FH sort ; rallumé, tout FH revient DANS L'ORDRE DU MANIFESTE", () => {
  /* ⭐ C'est le seul geste qui reste sur Fate's Hand : `monterLesCouches(FH_LAYER_IDS)` ou `[]`
     (F1 tient cette forme dans la coquille). */
  const h = pileReelle();
  let doc = exempleSur(h);
  const ordreDuManifeste = LAYER_FILES.map((f) => f.replace(/\.layer\.json$/, ""));
  doc = monter(h, doc, []);
  assert.deepEqual(actives(h), SOCLE, "il ne reste que le plancher");
  assert.equal(currentStack(doc), "srd");
  doc = monter(h, doc, [...FH_LAYER_IDS]);
  assert.deepEqual(actives(h), ordreDuManifeste, "rallumé dans l'ordre où `engine.mjs` monte");
  assert.deepEqual(doc.build.layers.map((l) => l.id), ordreDuManifeste, "…et le document l'a adopté tel quel");
  assert.equal(currentStack(doc), "srdfh");
});

test("E4 — ⚔️ un document « SRD + une sous-unité FH » (un perso d'avant) N'AFFICHE PAS l'écran mort, et il DÉRIVE", () => {
  const h = pileReelle();
  let doc = exempleSur(h);
  /* Soulforging seul + le catalogue : ce que l'écran des six produisait en allumant un enfant
     depuis SRD. Il ne se produit plus ; un perso sauvé ainsi reste LÉGITIME. */
  doc = monter(h, doc, FH_LAYER_IDS.filter((id) => CATALOGUE_FH.includes(id) || sw("soulforging").couches.includes(id)));
  assert.equal(currentStack(doc), null, "témoin : `currentStack` ne sait pas le nommer");
  assert.notEqual(motDeLEcranMort(doc), MOT_PILE_INCONNUE, "⛔ un sous-ensemble est légitime, pas inconnu");
  assert.ok(doc.resolved, "et la dérivation a réussi : le moteur dégrade, il n'échoue pas");
  /* ⚔️ Et l'écran mort accuse ENCORE ce qui le mérite : Destiny privé d'une couche. */
  const coupe = { ...doc, build: { ...doc.build, layers: manifestFor(sans(PILE_COMPLETE, ["fh-spells-en"])) } };
  assert.equal(motDeLEcranMort(coupe), MOT_PILE_INCONNUE);
});

test("E5 — 🔴 LE PERSONNAGE D'HIER : gardé en SRD seul et rechargé, il tombait sur l'écran mort — l'alignement le sauve", () => {
  const h = pileReelle();
  const ex = readJson("examples/personnage-fh-en-niveau1.fh-char.json");
  const hier = { ...ex, build: { ...ex.build, layers: manifestOf(h.layers).slice(0, SOCLE.length) } };
  assert.deepEqual(hier.build.layers.map((l) => l.id), SOCLE, "témoin : un personnage gardé en « SRD seul »");
  /* LE DÉFAUT, tel qu'il était : la pile complète est montée au boot. */
  assert.throws(() => h.verbs.rebuild({ document: structuredClone(hier) }), /ne correspond pas/,
    "témoin du défaut : sans alignement, `rebuild` refuse et les six écrans meurent");
  /* LE REMÈDE : les gestes purs, appliqués comme la coquille les applique. */
  const gestes = gestesDAlignement(h.layers.verbs.stack(), hier.build.layers.map((l) => l.id));
  assert.deepEqual(gestes.allumer, []);
  assert.deepEqual(gestes.eteindre, [...FH_LAYER_IDS].reverse(), "on éteint par le haut — la leçon du lot 77");
  for (const id of gestes.eteindre) h.layers.verbs.disable({ id });
  for (const id of gestes.allumer) h.layers.verbs.enable({ id });
  const out = h.verbs.rebuild({ document: structuredClone(hier) });
  assert.ok(out.resolved, "rechargé, le personnage SRD dérive");
  assert.deepEqual(actives(h), SOCLE);
  /* ⛔ Et le plancher ne se touche JAMAIS, même si un document l'omettait. */
  const bizarre = gestesDAlignement(h.layers.verbs.stack(), ["fh-soulforging-en"]);
  assert.equal(bizarre.eteindre.includes(SRD_LAYER_ID), false, "le SRD n'est pas pilotable");
  assert.deepEqual(bizarre.allumer, ["fh-soulforging-en"]);
});

test("E6 — ⚔️ un livre ABSENT (404) : zéro livre, rien d'autre ne casse ; un livre PRÉSENT se monte par le VRAI bloc, éteint, puis s'allume", () => {
  /* Absent : la pile réelle n'a aucun livre, et tout ce qui précède a tourné
     dessus — c'est le témoin. 🔄 LOT 351 : l'écran ne montre plus un livre absent (ni
     installé ni déclaré : rien à régler, rien à effacer), et il ne dit aucun mot d'erreur. */
  const h = pileReelle();
  const doc = exempleSur(h);
  assert.equal(h.layers.verbs.stack().some((c) => LIVRE_LAYER_IDS.includes(c.id)), false, "témoin : aucun livre monté");
  const sansLivre = renderLayersEcran({ document: doc, pile: h.layers.verbs.stack() }, () => {});
  assert.equal(sansLivre.querySelectorAll("[data-livre], [data-ligne-livre]").length, 0, "aucun livre sur l'appareil, aucun livre à l'écran");
  assert.equal(sansLivre.querySelectorAll(".doc-field-error").length, 0);

  /* Présent : la couche du générateur se monte par `register`, à sa place (au-dessus de
     `srfh`, sous FH), ÉTEINTE. */
  const { layer } = construireCouche({ gemstones: { "10": ["Azurite (mottled deep blue)", "Obsidian (black)"] } });
  const h2 = makeHarness({ layers: LAYER_FILES.slice(0, SOCLE.length).map((f) => `layers/${f}`), modules: MODULES_DE_LA_PAGE() });
  h2.layers.verbs.register({ bytes: bytesOf(layer), origin: "xdmg-en.layer.json" });
  h2.layers.verbs.disable({ id: "xdmg-en" });
  for (const f of LAYER_FILES.slice(SOCLE.length)) {
    h2.layers.verbs.register({ bytes: fs.readFileSync(path.join(ROOT, "layers", f)), origin: f });
  }
  let doc2 = exempleSur(h2);
  assert.equal(doc2.build.layers.some((l) => l.id === "xdmg-en"), false, "éteint : le document ne le déclare pas");
  const ecran = renderLayersEcran({ document: doc2, pile: h2.layers.verbs.stack() }, () => {});
  const dmg = ecran.querySelectorAll(".interrupteur[data-livre]")[0];
  assert.ok(dmg && dmg.dataset.on === "false", "monté et éteint : un interrupteur de catalogue, position OFF");
  assert.equal(groupeDe(ecran, ligneLivre(ecran, "xdmg-en")), "eteint", "…sous « installed, not active »");
  assert.equal(ligneLivre(ecran, "xdmg-en").querySelectorAll(".poubelle").length, 1, "…avec sa poubelle");
  /* `monterLeLivre(id, true)` : */
  h2.layers.verbs.enable({ id: "xdmg-en" });
  doc2 = h2.verbs.rebuild({ document: { ...doc2, build: { ...doc2.build, layers: [] } } }).document;
  const ids = doc2.build.layers.map((l) => l.id);
  assert.equal(ids[SOCLE.length], "xdmg-en", "le livre est au-dessus de `srfh`…");
  assert.equal(ids[SOCLE.length + 1], "fh-species-en", "…et sous Fate's Hand : FH recouvre le livre");
  assert.equal(currentStack(doc2), "srdfh", "le livre ne change pas le jeu de règles");
  assert.equal(compositionFh(doc2).legitime, true);
  assert.deepEqual(h2.verbs.validate({ document: doc2 }).violations, [], "et le personnage reste valide");
  assert.equal(h2.layers.verbs.query({ kind: "gem", id: "xdmg:gem:en:obsidian" }).record.name, "Obsidian",
    "la pierre que FH n'a pas est là, au livre");
});

test("E7 — ⚔️ UNE LANGUE CHOISIE, PUIS TRAININGS COUPÉ (un perso d'avant) : la dérivation DÉGRADE et `validate` NOMME — elle ne jette plus", () => {
  /* 📏 MESURÉ AU NAVIGATEUR LE 09/09, APRÈS UNE SUITE VERTE : Ilyra (l'exemple)
     a choisi deux langues (`background.languages[0..1]` → des trainings).
     Trainings coupé, `derive` tendait ces refs aux modules par `must`, jetait
     « la pile ne porte aucun training », la coquille posait
     `derivationImpossible`, et l'écran `Layers` montrait TOUT éteint — le
     maître compris — sur un document dont `build.layers` était resté `[]`. */
  const h = pileReelle();
  let doc = exempleSur(h);
  assert.ok(doc.build.choices.some((c) => c.path === "background.languages[0]" && c.ref && c.ref.kind === "training"),
    "témoin : l'exemple a bien choisi une langue, qui est un training");
  assert.doesNotThrow(() => { doc = monter(h, doc, sans(FH_LAYER_IDS, [...sw("trainings").couches, ...sw("inheritance").couches])); },
    "⛔ la dérivation ne doit pas JETER sur un ref d'une couche éteinte");
  assert.ok(doc.resolved, "le personnage dérive, dégradé");
  assert.deepEqual(doc.resolved.languages, [], "…sans langue : le manque est porté par la fiche");
  const refus = h.verbs.validate({ document: doc }).violations.filter((v) => v.key === "choice.ref-missing").map((v) => v.path);
  assert.ok(refus.includes("background.languages[0]"), `et NOMMÉ par validate — vu : ${refus.join(", ")}`);
  /* ⚔️ Le symétrique : Fate's Hand RALLUMÉ (tout ou rien), tout revient et plus aucun refus. */
  doc = monter(h, doc, [...FH_LAYER_IDS]);
  assert.deepEqual(h.verbs.validate({ document: doc }).violations, [], "rallumé : le personnage est de nouveau entier");
});

/* ══ E8 — ⚔️ LOT 191 : LORE PORTE LES ESPÈCES, SUR LA VRAIE PILE ══════════
   ⚖️ Eric, 09/09 : *« Il n'y a pas d'Araag dans SRD si le bouton Lore n'est
   pas poussé. »* puis *« Lore rajoute le monde FH sans les règles. »* */
test("E8 — ⚔️ WORLD (ex-Lore) COUPÉ (un perso d'avant) : plus aucune espèce `fh:` ; l'Araag déjà choisi est NOMMÉ par validate ; FATE'S HAND RALLUMÉ : il revient, ses traits se lisent", () => {
  const h = pileReelle();
  const ARAAG = "fh:species:en:araag";
  const kessa = {
    schema: "fh-char/1", id: "araag-e8", name: "Kessa", lang: "en", units: FT_LB,
    generator: { name: "tests/ecran-layers", version: "1.0.0" },
    created: "2026-09-10T00:00:00Z", modified: "2026-09-10T00:00:00Z",
    build: {
      layers: manifestOf(h.layers),
      choices: [
        { path: "level", value: 1 },
        { path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } },
        { path: "species", ref: { kind: "species", id: ARAAG } },
        ...["str", "dex", "con", "int", "wis", "cha"].map((k) => ({ path: `abilities.${k}`, value: 12 }))
      ],
      budgets: {}, overrides: [], confirmed: []
    }
  };
  let doc = h.verbs.rebuild({ document: kessa }).document;
  assert.equal(doc.resolved.identity.species, "Araag", "témoin : pile complète, l'Araag est là");
  const especesFh = () => h.layers.verbs.query({ kind: "species" }).filter((v) => v.id.startsWith("fh:")).map((v) => v.id);
  assert.equal(especesFh().length, 3, "témoin : Araag, Elestu, Loroka sont montées");

  /* WORLD COUPÉ — les trois couches sortent par le haut (lore, fiche, puis species : la fiche
     patche ce que species ajoute, l'ordre inverse jetterait). */
  assert.doesNotThrow(() => { doc = monter(h, doc, sans(FH_LAYER_IDS, sw("lore").couches)); },
    "⛔ couper World ne doit pas jeter — l'ordre de démontage est celui du manifeste à l'envers");
  assert.deepEqual(actives(h).filter((id) => sw("lore").couches.includes(id)), [], "les trois couches de World sont éteintes");
  assert.deepEqual(especesFh(), [], "⛔ « Il n'y a pas d'Araag dans SRD si le bouton Lore n'est pas poussé »");
  assert.equal(h.layers.verbs.query({ kind: "species" }).length, 9, "…et les neuf du SRD restent");
  assert.ok(doc.resolved, "le personnage dérive, dégradé (derive.mjs lit l'espèce par `maybe`)");
  assert.equal(doc.resolved.identity.species, undefined, "…sans espèce");
  const morts = h.verbs.validate({ document: doc }).violations.filter((v) => v.key === "choice.ref-missing");
  assert.deepEqual(morts.map((v) => [v.path, v.params.id]), [["species", ARAAG]], "et `validate` NOMME le choix non résolu");
  /* L'écran : Fate's Hand engagé (World est une sous-unité, pas le catalogue), sans ligne d'enfant. */
  const node = renderLayersEcran({ document: doc, pile: h.layers.verbs.stack() }, () => {});
  assert.equal(maitre(node).dataset.on, "true", "Fate's Hand reste engagé");
  assert.equal(node.querySelectorAll("[data-enfant]").length, 0);

  /* FATE'S HAND RALLUMÉ (tout ou rien) — species d'abord, puis fiche et lore qui la patchent. */
  assert.doesNotThrow(() => { doc = monter(h, doc, [...FH_LAYER_IDS]); });
  assert.equal(doc.resolved.identity.species, "Araag", "l'Araag revient — rien n'avait été effacé");
  assert.deepEqual(h.verbs.validate({ document: doc }).violations.filter((v) => v.key === "choice.ref-missing"), []);
  /* 📏 LE COMPTE SOUS WORLD, MESURÉ AU MANIFESTE : 12 (species) + 24 (fiche) + 24 (lore). 🗄️ L'écran
     l'affichait en note sous la ligne World ; la carte le garde, la page ne le montre plus. */
  const pile = h.layers.verbs.stack();
  const compte = sw("lore").couches.reduce((n, id) => n + pile.find((c) => c.id === id).records, 0);
  assert.equal(compte, 60, "le compte de records sous World — il était 48 quand il n'avait que deux couches");

  /* ⚖️ « LORE RAJOUTE LE MONDE FH SANS LES RÈGLES » — World seul, tout le reste éteint (un perso
     d'avant, là encore) : l'Araag existe, ses traits se LISENT, et aucune règle FH ne tourne. */
  const loreSeul = FH_LAYER_IDS.filter((id) => sw("lore").couches.includes(id));
  doc = monter(h, doc, loreSeul);
  assert.deepEqual(actives(h).filter((id) => FH_LAYER_IDS.includes(id)), loreSeul, "témoin : World seul");
  assert.equal(doc.resolved.identity.species, "Araag", "l'Araag existe avec World seul");
  const traits = (doc.resolved.traits || []).map((t) => t.name);
  assert.ok(traits.some((n) => /Fast Learner/i.test(n)), `le monde se lit : ses traits nommés sont sur la fiche — ${traits.join(", ")}`);
  assert.deepEqual((doc.resolved.stats || []).filter((s) => String(s.id).startsWith("fh:")).map((s) => s.id), [],
    "…et aucune règle ne tourne : pas de pool de compétences, pas de Score de Destinée — inerte, sa règle éteinte");
  const drapeaux = h.layers.verbs.flags();
  assert.equal(drapeaux.includes("fh.skills") || drapeaux.includes("fh.destiny"), false, "les drapeaux de règle sont bas");
});

test("E9 — 🔴 LOT 350 : UN PERSO SANS CLASSE, FATE'S HAND COUPÉ, RESTE EN SRD DÉCLARÉ — le piège, puis l'organe", () => {
  /* 📏 Vu au banc le 29/09 (port 8977) : `New character` → `Layers` → Fate's Hand coupé →
     retour au Menu, et R accusait EN ROUGE « doesn't match either ruleset » un perso
     parfaitement en SRD. Ce test rejoue le piège sur la vraie pile — le geste de
     `monterLesCouches([])` —, puis l'organe qui le répare (`declarerLaPileMontee`). */
  const h = pileReelle();
  const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
  const neuf = writers.composer({ name: "Name character", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(h.layers), id: "e9-sans-classe", at: "2026-09-29T03:21:41Z" });
  for (const id of [...FH_LAYER_IDS].reverse()) h.layers.verbs.disable({ id });
  const vide = { ...neuf, build: { ...neuf.build, layers: [] } };
  assert.throws(() => h.verbs.rebuild({ document: vide }), (e) => e.name === "BuildError",
    "témoin : sans classe, `derive` refuse — et `rebuild` n'adopte rien quand il jette");
  assert.equal(compositionFh(vide).legitime, false,
    "⛔ LE PIÈGE : une pile déclarée vide n'a pas de socle — R accuserait en rouge, et un rechargement remonterait tout");
  /* ⭐ L'ORGANE : déclarer ce que `rebuild` aurait adopté — la pile MONTÉE. */
  const declare = { ...vide, build: { ...vide.build, layers: manifesteDeLaPile(h.layers.verbs.stack()) } };
  const c = compositionFh(declare);
  assert.equal(c.legitime, true, "le perso en SRD seul est légitime");
  assert.equal(c.maitre, false, "…et c'est bien du SRD seul : R lira `Rules: SRD`");
  assert.deepEqual(declare.build.layers.map((l) => l.id), actives(h), "la pile déclarée est la pile montée, dans son ordre");
});

/* ══ F — LES OCTETS DE LA COQUILLE ═════════════════════════════════════════ */

test("F1 — 🔌 la coquille câble Layers : la porte, les gestes (Fate's Hand, un livre, sa poubelle), le manifeste passé à l'écran — et plus aucun geste d'enfant", () => {
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  assert.match(shell, /action\.kind === "ouvrirLayers"[\s\S]{0,120}state\.menuBranche = "layers"/, "la porte ouvre la branche `layers` au rang B");
  /* 🔄 LOT 351 — tout ou rien : ni le geste d'un enfant, ni la fonction qui le calculait. */
  assert.doesNotMatch(shell, /requestLayerSwitch|couchesApresLeGeste/, "⛔ Fate's Hand est tout ou rien (Eric, 29/09)");
  assert.equal(layersEcran.couchesApresLeGeste, undefined, "…et l'écran ne l'exporte plus");
  assert.match(shell, /action\.kind === "requestBookSwitch"[\s\S]{0,120}monterLeLivre\(action\.id/);
  assert.match(shell, /pile: state\.engine\.layers\.verbs\.stack\(\)/, "l'écran reçoit le manifeste, il ne monte rien");
  assert.match(shell, /function applyLayerStack\(value\) \{\s*monterLesCouches\(value === "srdfh" \? FH_LAYER_IDS : \[\]\);/,
    "le geste « tout FH » est le seul geste sur Fate's Hand");
  /* ⭐ LA POUBELLE : la coquille pose la question de l'écran — elle ne fabrique pas la sienne. */
  assert.match(shell, /action\.kind === "demanderEffacerUnLivre"[\s\S]{0,500}state\.popup = popupEffacerUnLivre\(\{/,
    "la question est celle de `layers-ecran.mjs`");
  assert.match(shell, /choisir: \(voie\) => applyDecisionAction\(\{ kind: "effacerUnLivre", id: livre\.id, voie \}\)/,
    "la voie choisie revient à la coquille, qui seule efface");
});

test("F2 — 🔴 la coquille ALIGNE la pile sur le document AVANT de dériver, au boot comme à l'ouverture d'un fichier", () => {
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  /* ⚖️ LOT 367 — entre les deux, le RECALAGE (`recalerSurLaPileMontee`) : aligner les livres, recaler les
     empreintes, PUIS dériver. L'ordre reste la loi ; il gagne un temps. */
  const occurrences = shell.match(/alignerLaPileSurLeDocument\(\);\s*(?:\/\/[^\n]*)?\s*const recalage = recalerSurLaPileMontee\(\);\s*(?:\/\/[^\n]*)?\s*rebuild\(\);/g) || [];
  assert.equal(occurrences.length, 2, "deux chemins montent un document : le boot et `ouvrirUnFichier` sans rechargement");
  assert.match(shell, /const gestes = gestesDAlignement\(layersVerbs\.stack\(\), declares\)/, "…par les gestes purs, testés en E5");
});

test("F3 — 📚 `engine.mjs` va chercher les livres sous `layers-livres/`, et un 404 n'est PAS une erreur", () => {
  const engine = stripComments(fs.readFileSync(path.join(UI, "engine.mjs"), "utf8"));
  assert.match(engine, /layers-livres\/\$\{file\}/);
  assert.match(engine, /if \(!reponse \|\| !reponse\.ok\) return null/, "un 404 rend null : zéro livre");
  /* 🔄 LOT 388 — le lieu du joueur d'abord (voir `tests/livres-388.test.mjs`), puis les fichiers servis. */
  assert.match(engine, /layers\.verbs\.disable\(\{ id: monte\.id \}\)/, "un livre se monte ÉTEINT — le document décide");
  /* 🔄 LOT 390 — le montage rend aussi les catalogs de créateur (`catalogues`), toujours au même endroit. */
  assert.match(engine, /if \(file === SOUS_LES_LIVRES\) \{\s*\(\{ refuses: livresRefuses, lieu: lieuDesLivres, catalogues: cataloguesDuLieu \} = await monterLesLivres\(layers, root, livresDuLieu\)\);/, "…juste au-dessus de `srfh`");
});

test("F4 — 🔴 LOT 350 : LES DEUX GESTES DE COUCHES DÉCLARENT LA PILE MONTÉE — après `rebuild`, jamais avant", () => {
  /* Le chemin du popup (193-201) déclarait ; ceux de `Layers` non (E9). ⚔️ Retirer la
     déclaration, ou la poser AVANT `rebuild` (elle déclarerait la pile d'avant, et
     `rebuild` n'adopterait plus rien) → rouge ici. */
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  for (const nom of ["monterLesCouches", "monterLeLivre"]) {
    const corps = shell.match(new RegExp(`function ${nom}\\([^)]*\\) \\{([\\s\\S]*?)\\n\\}`));
    assert.ok(corps, `\`${nom}\` a changé de forme — ce garde lit à côté`);
    /* 🔄 LOT 393 — puis REPOSER les livres absents (`reposerLesLivresAbsents`) : un interrupteur ne touche que son
       livre, et un livre que l'appareil n'a pas ne quitte pas le perso (`tests/livre-absent-393.test.mjs`). */
    assert.match(corps[1], /layers: \[\] \} \};\s*rebuild\(\);\s*declarerLaPileMontee\(\);\s*reposerLesLivresAbsents\(avant\);\s*$/,
      `\`${nom}\` : vider, dériver, PUIS déclarer, puis reposer les livres absents — sans ça, un perso sans classe perd sa pile (E9)`);
    assert.match(corps[1], /const avant = state\.document\.build\.layers;/, `\`${nom}\` : ce que le perso déclarait, lu AVANT de vider`);
  }
});
