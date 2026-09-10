/* ══ LOT 188 — L'ÉCRAN `Layers` : six interrupteurs, un catalogue ═════════

   ⚖️ Eric, 09/09 : *« Comment s'appelle l'écran des six interrupteurs ? »* →
   `Layers`. Le dessin est le sien (artefact « Six interrupteurs, un
   catalogue ») : le socle SRD verrouillé, le maître Fate's Hand, ses six
   enfants qui se coupent un par un, la dépendance Inheritance → Trainings, et
   le catalogue (les livres du joueur, le `+` homebrew inerte).

   🔴 CE QUE CE FICHIER GARDE, ET SUR QUOI :
     A. les LISTES — l'union des six plus le catalogue EST la pile Fate's Hand ;
        les livres portent le même nom partout (écran, moteur, générateur) ;
     B. la COMPOSITION, lue sur le document — un sous-ensemble est légitime,
        un ensemble coupé en deux ne l'est pas, et une pile nommée l'est toujours ;
     C. le GESTE pur — ce qui reste monté après « éteindre Trainings » ;
     D. le RENDU (dom-stub) dans les trois états d'Eric : le maître allumé,
        Trainings éteint, le maître éteint — et le SRD qui ne se clique jamais ;
     E. ⚔️ LA VRAIE PILE (harnais du lot 7) : les drapeaux qui tombent, l'ordre
        du manifeste au rallumage, le piège `fh-species-en` réglé, le
        personnage d'hier qui ne tombe plus sur l'écran mort au rechargement,
        le livre absent (404) qui ne casse rien, le livre présent qui se monte ;
     F. les OCTETS de la coquille — elle câble ce que ce lot lui demande, et
        elle aligne la pile AVANT de dériver.

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
  INTERRUPTEURS, CATALOGUE_FH, LIVRES_DU_JOUEUR, compositionFh, couchesApresLeGeste, gestesDAlignement, renderLayersEcran,
  interrupteur, voyant
} = await import("../ui/builder/layers-ecran.mjs");
const { renderUniverseStep, SRD_LAYER_ID, SRFH_LAYER_IDS, FH_LAYER_IDS, LIVRE_LAYER_IDS, currentStack, sauvegarderPuisEteindre, NOM_DE_LA_VERSION_FH }
  = await import("../ui/builder/universe-step.mjs");
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
const enfant = (node, id) => node.querySelectorAll(`.interrupteur[data-enfant="${id}"]`)[0];
const maitre = (node) => node.querySelectorAll(".interrupteur[data-maitre]")[0];
/* 🔴 LOT 189 — LE SOCLE EST UN VOYANT, PLUS UN INTERRUPTEUR (Eric, 09/09 :
   *« Le bouton SRD est un voyant, pas un bouton — il est toujours actif »*).
   On le trouve par sa DONNÉE (`data-socle`), pas par sa classe : c'est ce qui
   permet à `srdEstUnVoyantF` de juger un socle redevenu interrupteur. */
const socle = (node) => node.querySelectorAll("[data-socle]")[0];

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

/* ══ A — LES LISTES ════════════════════════════════════════════════════════ */

test("A1 — 🔴 l'union des six interrupteurs et du catalogue EST la pile Fate's Hand, sans trou ni doublon", () => {
  const couvertes = [...INTERRUPTEURS.flatMap((s) => s.couches), ...CATALOGUE_FH];
  assert.equal(new Set(couvertes).size, couvertes.length, "une couche ne peut appartenir qu'à UN interrupteur");
  assert.deepEqual([...couvertes].sort(), [...FH_LAYER_IDS].sort(),
    "⛔ une couche montée par `engine.mjs` sans interrupteur ne pourrait ni s'éteindre ni se rallumer seule");
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
  assert.deepEqual([...CATALOGUE_FH], ["fh-gems-en"], "le catalogue = les gemmes, et rien d'autre");
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
  assert.equal(compositionFh(docAvec(sans(PILE_COMPLETE, ["fh-gems-en"]))).legitime, true,
    "le catalogue absent est légitime depuis le lot 188 (« entier ou absent ») — inchangé, seulement plus petit");
  /* ⚔️ Le socle absent : le SRD seul, sans `srfh` (le cas B2 bis d'universe-step). */
  assert.equal(compositionFh(docAvec([SRD_LAYER_ID])).legitime, false, "sans `srfh`, rien ne se nomme");
  assert.equal(compositionFh(docAvec([SRD_LAYER_ID])).socle, false);
});

/* ══ C — LE GESTE PUR ══════════════════════════════════════════════════════ */

test("C1 — éteindre Trainings retire SES couches ET celles d'Inheritance ; les 9 autres restent, dans l'ordre du manifeste", () => {
  const apres = couchesApresLeGeste(docAvec(PILE_COMPLETE), { id: "trainings", on: false });
  assert.deepEqual(apres, sans(FH_LAYER_IDS, ["fh-trainings-en", "fh-inheritance-en"]));
  assert.equal(apres.length, FH_LAYER_IDS.length - 2);
});

test("C2 — allumer Inheritance allume Trainings avec elle (la dépendance tient sans l'organe)", () => {
  const depart = docAvec(sans(PILE_COMPLETE, ["fh-trainings-en", "fh-inheritance-en"]));
  const apres = couchesApresLeGeste(depart, { id: "inheritance", on: true });
  assert.deepEqual(apres, FH_LAYER_IDS);
});

test("C3 — allumer UN enfant depuis SRD engage le maître : le catalogue vient avec", () => {
  const apres = couchesApresLeGeste(docAvec(SOCLE), { id: "destiny", on: true });
  assert.deepEqual(apres, FH_LAYER_IDS.filter((id) => CATALOGUE_FH.includes(id) || sw("destiny").couches.includes(id)));
  const composition = compositionFh(docAvec([...SOCLE, ...apres]));
  assert.deepEqual([composition.legitime, composition.maitre, composition.enfants.destiny], [true, true, true]);
});

test("C4 — le maître : tout ou rien, et l'ordre est celui de `FH_LAYER_IDS`", () => {
  assert.deepEqual(couchesApresLeGeste(docAvec(SOCLE), { id: "maitre", on: true }), FH_LAYER_IDS);
  assert.deepEqual(couchesApresLeGeste(docAvec(PILE_COMPLETE), { id: "maitre", on: false }), []);
  assert.throws(() => couchesApresLeGeste(docAvec(SOCLE), { id: "chaos", on: true }), /aucun interrupteur/,
    "un interrupteur inconnu est un refus bruyant, jamais un ensemble vide");
});

/* ══ D — LE RENDU, DANS LES TROIS ÉTATS D'ERIC ═════════════════════════════ */

test("D1 — 🎛️ LE MAÎTRE ALLUMÉ : le socle est un VOYANT allumé, le maître, six enfants allumés, le catalogue, la sortie déclarée", () => {
  const node = rendu();
  assert.equal(node.dataset.ecran, "layers");
  assert.equal(node.dataset.sortieIci, "true", "⛔ l'écran ne pose pas son Back : la coquille le fait (garde 17)");
  assert.equal(node.querySelectorAll(".tdc-titre-b")[0].textContent, "Layers", "le nom d'Eric, 09/09");

  /* 🔴 LOT 189 — le SRD est une LAMPE : allumée, et rien à pousser. */
  assert.deepEqual(srdEstUnVoyantF(node), [], "Eric, 09/09 : « un voyant, pas un bouton »");
  assert.equal(socle(node).querySelectorAll(".interrupteur-piste").length, 0, "aucune piste, aucun pouce : ce n'est pas un interrupteur grisé");
  assert.ok(socle(node).querySelectorAll(".voyant-lampe")[0], "…mais une lampe dessinée, que la feuille peint sur data-on");
  assert.equal(maitre(node).dataset.on, "true");
  for (const inter of INTERRUPTEURS) {
    const e = enfant(node, inter.id);
    assert.ok(e, `l'enfant « ${inter.id} » existe`);
    assert.equal(e.dataset.on, "true", `${inter.id} est allumé`);
    assert.equal(e.disabled, false, `${inter.id} se coupe seul`);
    assert.equal(e.dataset.couches, inter.couches.join(" "), "il DIT ses couches");
    assert.equal(e.getAttribute("role"), "switch");
  }
  /* Le catalogue : sans pile fournie, aucun livre n'est monté — deux places
     réservées avec leur mot, et le `+` inerte. */
  const livres = node.querySelectorAll(".tdc-ligne[data-livre]");
  assert.equal(livres.length, LIVRES_DU_JOUEUR.length);
  for (const l of livres) {
    assert.equal(l.disabled, true, "un livre absent est PRÉSENT, éteint");
    assert.match(l.textContent, /not on this device/, "…avec son mot — pas une promesse");
  }
  const plus = node.querySelectorAll(".tdc-ligne[data-homebrew]")[0];
  assert.ok(plus, "la porte homebrew est LÀ");
  assert.equal(plus.disabled, true, "…inerte : elle n'ouvre rien tant qu'un lot ne l'a pas câblée");
  assert.match(plus.textContent, /soon/);
});

test("D2 — 🎛️ TRAININGS ÉTEINT : lui seul est éteint, Inheritance DORT avec son mot, les quatre autres vivent", () => {
  const node = rendu({ document: docAvec(sans(PILE_COMPLETE, ["fh-trainings-en", "fh-inheritance-en"])) });
  assert.equal(maitre(node).dataset.on, "true", "Fate's Hand reste engagé");
  assert.equal(enfant(node, "trainings").dataset.on, "false");
  assert.equal(enfant(node, "trainings").disabled, false, "…et il se rallume d'un clic");
  const inh = enfant(node, "inheritance");
  assert.equal(inh.disabled, true, "Inheritance dort tant que Trainings dort");
  assert.equal(inh.dataset.on, "false");
  assert.match(inh.querySelectorAll(".interrupteur-note")[0].textContent, /Trainings is off/, "…et il DIT pourquoi");
  for (const id of ["skills", "destiny", "lore", "soulforging"]) {
    assert.equal(enfant(node, id).dataset.on, "true", `${id} n'a pas bougé`);
    assert.equal(enfant(node, id).disabled, false);
  }
  assert.equal(node.querySelectorAll(".doc-field-error").length, 0, "⛔ aucun mot rouge : ce sous-ensemble est légitime");
});

test("D3 — 🎛️ LE MAÎTRE ÉTEINT : six enfants éteints, Inheritance dort, le socle reste un voyant ALLUMÉ", () => {
  const node = rendu({ document: docAvec(SOCLE) });
  assert.equal(maitre(node).dataset.on, "false");
  /* 🔴 LE GARDE DU LOT 188 SOUS SA NOUVELLE FORME : « le SRD ne s'éteint
     JAMAIS » — il ne peut plus s'éteindre parce qu'il n'a plus de position
     éteinte, et la clause le vérifie dans les DEUX états du maître. */
  assert.equal(socle(node).dataset.on, "true", "le SRD ne s'éteint JAMAIS");
  assert.deepEqual(srdEstUnVoyantF(node), [], "…et il reste une lampe quand Fate's Hand dort");
  for (const inter of INTERRUPTEURS) assert.equal(enfant(node, inter.id).dataset.on, "false", `${inter.id} éteint`);
  assert.equal(enfant(node, "inheritance").disabled, true, "Trainings est éteint, donc Inheritance dort");
  assert.equal(enfant(node, "destiny").disabled, false, "un enfant sans dépendance se rallume seul depuis SRD");
});

test("D0 — ⚔️ ATTAQUE (lot 189) — remettre l'interrupteur verrouillé au socle fait ROUGIR la clause", () => {
  /* ⛔ C'EST LE DÉFAUT EXACT DE LA v612, PAS UNE CARICATURE : le socle était
     `interrupteur({ on: true, disabled: true })`. On le refabrique avec le VRAI
     organe, on lui pose `data-socle`, et la clause doit accuser — sur ce que
     l'arbre d'accessibilité annonce. Un garde qui ne peut jamais accuser est
     le pire de tous. */
  const mutant = document.createElement("section");
  const ancien = interrupteur({ label: "SRD 5.2.1", note: "the core rules — always on", on: true, disabled: true, onChange: () => {} });
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
  const lampe = voyant({ label: "SRD 5.2.1", note: "the core rules" });
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

test("D4 — 🔌 les gestes : le maître demande la PILE (la coquille confirme), un enfant demande SON interrupteur, le socle n'émet rien", () => {
  const vus = [];
  const node = rendu({}, (a) => vus.push(a));
  socle(node).click();
  assert.deepEqual(vus, [], "⛔ le voyant SRD ne demande rien — il n'a AUCUN écouteur, pas un `disabled` qui retient un clic");
  maitre(node).click();
  assert.deepEqual(vus, [{ kind: "requestLayerStack", value: "srd" }], "le MÊME geste que l'interrupteur de R");
  enfant(node, "trainings").click();
  assert.deepEqual(vus[1], { kind: "requestLayerSwitch", id: "trainings", value: false });
  const off = rendu({ document: docAvec(SOCLE) }, (a) => vus.push(a));
  maitre(off).click();
  assert.deepEqual(vus[2], { kind: "requestLayerStack", value: "srdfh" });
  enfant(off, "destiny").click();
  assert.deepEqual(vus[3], { kind: "requestLayerSwitch", id: "destiny", value: true });
});

test("D5 — 📚 un livre MONTÉ est un interrupteur de catalogue, allumé si le document le déclare ; un livre REFUSÉ dit sa raison", () => {
  const pile = [...manifestFor(PILE_COMPLETE), { id: "xdmg-en", name: "Dungeon Master's Guide (2024)", enabled: false, records: 256 }];
  const eteint = rendu({ pile });
  const dmg = eteint.querySelectorAll(".interrupteur[data-livre]")[0];
  assert.ok(dmg, "le DMG monté est un interrupteur");
  assert.equal(dmg.dataset.livre, "xdmg-en");
  assert.equal(dmg.dataset.on, "false", "le document ne le déclare pas : éteint");
  assert.match(dmg.textContent, /256 records/, "il dit ce qu'il apporte");
  assert.equal(eteint.querySelectorAll(".tdc-ligne[data-livre]").length, 1, "le PHB, lui, reste une place réservée");
  const vus = [];
  eteint.querySelectorAll(".interrupteur[data-livre]")[0].click();
  assert.deepEqual(vus, [], "témoin : rien sans onAction");
  const allume = rendu({ pile, document: docAvec([...SOCLE, "xdmg-en", ...FH_LAYER_IDS]) }, (a) => vus.push(a));
  assert.equal(allume.querySelectorAll(".interrupteur[data-livre]")[0].dataset.on, "true");
  allume.querySelectorAll(".interrupteur[data-livre]")[0].click();
  assert.deepEqual(vus, [{ kind: "requestBookSwitch", id: "xdmg-en", value: false }]);

  const refuse = rendu({ pile: manifestFor(PILE_COMPLETE), livresRefuses: [{ id: "xphb-en", raison: "schema vaut « fhpc.layer/1 »" }] });
  const phb = refuse.querySelectorAll(".tdc-ligne[data-livre]").find((l) => l.dataset.livre === "xphb-en");
  assert.match(phb.textContent, /unreadable: schema/, "un fichier présent mais illisible ne se tait pas");
});

test("D6 — la confirmation du maître se pose sur CET écran quand elle est en attente", () => {
  const node = rendu({ pendingStack: "srd" });
  assert.equal(node.querySelectorAll(".confirm-dialog").length, 1,
    "le joueur qui a basculé le maître depuis Layers doit voir la question ici, pas sur R");
  assert.equal(rendu().querySelectorAll(".confirm-dialog").length, 0, "témoin : sans attente, pas de question");
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

test("G1 — 🔴 « Lore » n'est plus un mot du joueur : ni sur Layers, ni sur R, ni dans la confirmation, ni dans le mot d'un choix non résolu — c'est World", () => {
  const layers = rendu({ pendingStack: "srd" });
  assert.ok(textesRendus(layers).length > 20, "témoin : le balayage lit bien les textes de l'écran");
  assert.deepEqual(unTexteRenduPorteLore(layers), [], "Layers (confirmation comprise) porte encore « Lore »");
  assert.equal(enfant(layers, "lore").querySelectorAll(".interrupteur-mot")[0].childNodes[0].textContent, "World", "la cinquième ligne dit World");
  assert.match(enfant(layers, "lore").querySelectorAll(".interrupteur-note")[0].textContent, /the world without its rules/,
    "sa note : « Lore rajoute le monde FH sans les règles » (Eric, 09/09), en un mot de joueur");
  const r = renderUniverseStep({ document: docAvec(PILE_COMPLETE), query: () => null, fieldErrors: {}, memoire: { ok: true }, pendingStack: "srd" }, () => {});
  assert.deepEqual(unTexteRenduPorteLore(r), [], "R (confirmation comprise) ne dit pas « Lore »");
  /* ⚠️ la confirmation a DEUX titres (avec / sans choix Fate's Hand en jeu) :
     un Araag choisi et une pile qui le nomme rendent l'autre — mesuré au lot
     192, une mutation du premier titre restait verte sans ce rendu. */
  const avecAraag = docAvec(PILE_COMPLETE, { build: { layers: manifestFor(PILE_COMPLETE), choices: [{ ref: { kind: "species", id: "fh:species:en:araag" }, label: "Species" }], budgets: {}, overrides: [] } });
  const nomme = () => ({ record: { name: "Araag" } });
  const layersAvec = rendu({ document: avecAraag, query: nomme, pendingStack: "srd" });
  assert.equal(layersAvec.querySelectorAll(".confirm-dialog-items li").length, 1, "témoin : l'autre titre, avec sa liste");
  assert.deepEqual(unTexteRenduPorteLore(layersAvec), [], "la confirmation avec ses choix nommés ne dit pas « Lore »");
  /* le mot d'un choix non résolu suit le LABEL : un seul écrivain */
  assert.equal(motDUnRecordAbsent("fh:species:en:araag"), "Araag comes with World — switch it on in Layers");
  /* l'écran mort, pile inconnue : pas de « Lore » non plus */
  assert.equal(porteLeMotLore(String(motDeLEcranMort(docAvec([SRD_LAYER_ID, ...SRFH_LAYER_IDS, "fh-lore-en"])) || "")), false, "l'écran mort ne dit pas « Lore »");
  /* ⚔️ le témoin du garde : un texte qui porterait le mot ferait rougir — et un id ne le fait pas */
  assert.equal(porteLeMotLore("Lore — the species of Nymedes"), true);
  assert.equal(porteLeMotLore('data-enfant="lore" fh-lore-en'), false, "un id n'est pas un mot de joueur");
});

test("G2 — 💾 la séquence pure : Save D'ABORD, l'extinction ENSUITE ; un Save qui refuse n'éteint pas", () => {
  const journal = [];
  const ok = sauvegarderPuisEteindre({ sauvegarder: () => { journal.push("save"); return true; }, eteindre: () => journal.push("off") });
  assert.equal(ok, true);
  assert.deepEqual(journal, ["save", "off"], "⛔ éteint d'abord, le fichier serait la version SRD");
  /* ⚔️ le Save a refusé (moteur pas chargé, navigateur qui jette) — il l'a dit ; on n'éteint pas */
  const refus = [];
  assert.equal(sauvegarderPuisEteindre({ sauvegarder: () => { refus.push("save"); return false; }, eteindre: () => refus.push("off") }), false);
  assert.deepEqual(refus, ["save"], "la question était de garder la copie, pas de couper coûte que coûte");
  /* et un Save qui ne DIT rien (undefined) compte comme un refus : une absence n'est jamais une réponse */
  const muet = [];
  assert.equal(sauvegarderPuisEteindre({ sauvegarder: () => { muet.push("save"); }, eteindre: () => muet.push("off") }), false);
  assert.deepEqual(muet, ["save"]);
});

test("G3 — 🎛️ la confirmation du maître porte TROIS voies, sur Layers comme sur R : Keep on n'émet rien qui éteigne, Save… émet la voie qui sauvegarde puis éteint, Switch off éteint sans sauvegarder", () => {
  for (const [nom, ecran] of [["Layers", (act) => rendu({ pendingStack: "srd" }, act)],
    ["R", (act) => renderUniverseStep({ document: docAvec(PILE_COMPLETE), query: () => null, fieldErrors: {}, memoire: { ok: true }, pendingStack: "srd" }, act)]]) {
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

test("D7 — 🚪 R porte la porte `Layers`, et son interrupteur Fate's Hand lit la COMPOSITION : engagé même avec une couche coupée", () => {
  const gestes = [];
  const r = renderUniverseStep({ document: docAvec(sans(PILE_COMPLETE, ["fh-trainings-en", "fh-inheritance-en"])), query: () => null, fieldErrors: {}, memoire: { ok: true } }, (a) => gestes.push(a));
  const porte = r.querySelectorAll(".tdc-couches")[0];
  assert.ok(porte, "la porte existe");
  assert.equal(porte.textContent, "Layers");
  porte.click();
  assert.deepEqual(gestes, [{ kind: "ouvrirLayers" }]);
  const fh = r.querySelectorAll(".tdc-regles .interrupteur").find((b) => /Fate/.test(b.textContent));
  assert.equal(fh.dataset.on, "true", "⛔ avant ce lot, `currentStack` rendait null et le maître se montrait ÉTEINT");
  assert.equal(r.querySelectorAll(".tdc-regles .doc-field-error").length, 0, "et aucun mot rouge : le sous-ensemble est légitime");
  /* ⚔️ Et le mot rouge SURVIT pour ce qui le mérite : un ensemble coupé en deux. */
  const coupe = renderUniverseStep({ document: docAvec(sans(PILE_COMPLETE, ["fh-spells-en"])), query: () => null, fieldErrors: {}, memoire: { ok: true } }, () => {});
  assert.equal(coupe.querySelectorAll(".tdc-regles .doc-field-error").length, 1, "Destiny privé d'une couche : le Menu le DIT toujours");
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

test("E1 — ⚔️ éteindre Trainings seul : 2 couches sortent, 9 FH restent, `fh.trainings` et `fh.inheritance` tombent, Inheritance dort à l'écran", () => {
  const h = pileReelle();
  let doc = exempleSur(h);
  const avant = h.layers.verbs.flags();
  assert.ok(avant.includes("fh.trainings") && avant.includes("fh.inheritance"), "témoin : les deux drapeaux sont levés au départ");

  doc = monter(h, doc, couchesApresLeGeste(doc, { id: "trainings", on: false }));
  const restantes = actives(h).filter((id) => FH_LAYER_IDS.includes(id));
  assert.equal(restantes.length, FH_LAYER_IDS.length - 2, "9 couches Fate's Hand restent");
  assert.deepEqual(restantes, sans(FH_LAYER_IDS, ["fh-trainings-en", "fh-inheritance-en"]));
  const apres = h.layers.verbs.flags();
  assert.equal(apres.includes("fh.trainings"), false);
  assert.equal(apres.includes("fh.inheritance"), false, "Inheritance est partie AVEC Trainings");
  assert.ok(apres.includes("fh.destiny") && apres.includes("fh.skills"), "les autres règles tournent toujours");
  /* La ceinture (lot 186) redonne au cran 3 son nom SRD — sans une branche de plus. */
  assert.equal(cransAlignes(apres)[3].mot, "Background");
  /* Et l'écran, sur le document que `rebuild` vient d'adopter : */
  const node = renderLayersEcran({ document: doc, pile: h.layers.verbs.stack() }, () => {});
  assert.equal(enfant(node, "inheritance").disabled, true);
  assert.equal(enfant(node, "trainings").dataset.on, "false");
  assert.match(enfant(node, "destiny").querySelectorAll(".interrupteur-note")[0].textContent, /\d+ records/, "le compte vient du manifeste");
});

test("E2 — ⚔️ LE PIÈGE `fh-species-en` : éteindre Destiny baisse `fh.destiny`, et la ceinture PERD son cran", () => {
  const h = pileReelle();
  let doc = exempleSur(h);
  assert.ok(h.layers.verbs.flags().includes("fh.destiny"), "témoin : levé au départ");
  const iDestiny = STEPS.findIndex((s) => s.id === "destiny");
  assert.ok(cransAlignes(h.layers.verbs.flags())[iDestiny], "témoin : le cran Destiny est sur la ceinture");

  doc = monter(h, doc, couchesApresLeGeste(doc, { id: "destiny", on: false }));
  assert.ok(actives(h).includes("fh-species-en"), "témoin : les espèces (Lore, allumé) sont TOUJOURS montées");
  assert.equal(h.layers.verbs.flags().includes("fh.destiny"), false,
    "⛔ AVANT CE LOT : `fh-species-en` levait `fh.destiny`, et le cran restait sur la ceinture, Destiny éteint");
  assert.equal(cransAlignes(h.layers.verbs.flags())[iDestiny], null, "la ceinture n'a plus de cran Destiny");
  assert.equal(compositionFh(doc).legitime, true, "et le personnage n'est pas « hors des deux jeux »");
  assert.notEqual(motDeLEcranMort(doc), MOT_PILE_INCONNUE, "⛔ ni sur l'écran mort");
  /* Le Score de Destinée n'est plus publié : une règle éteinte ne tourne pas. */
  assert.equal((doc.resolved.stats || []).some((s) => s.id === "fh:destiny"), false,
    "sans Destiny, aucun Score de Destinée — la Base d'espèce est un terme, pas la règle");
});

test("E3 — ⚔️ le maître : éteint, tout FH sort ; rallumé, tout FH revient DANS L'ORDRE DU MANIFESTE", () => {
  const h = pileReelle();
  let doc = exempleSur(h);
  const ordreDuManifeste = LAYER_FILES.map((f) => f.replace(/\.layer\.json$/, ""));
  doc = monter(h, doc, couchesApresLeGeste(doc, { id: "maitre", on: false }));
  assert.deepEqual(actives(h), SOCLE, "il ne reste que le plancher");
  assert.equal(currentStack(doc), "srd");
  doc = monter(h, doc, couchesApresLeGeste(doc, { id: "maitre", on: true }));
  assert.deepEqual(actives(h), ordreDuManifeste, "rallumé dans l'ordre où `engine.mjs` monte");
  assert.deepEqual(doc.build.layers.map((l) => l.id), ordreDuManifeste, "…et le document l'a adopté tel quel");
  assert.equal(currentStack(doc), "srdfh");
});

test("E4 — ⚔️ un document « SRD + une couche FH » N'AFFICHE PAS l'écran mort, et il DÉRIVE", () => {
  const h = pileReelle();
  let doc = exempleSur(h);
  doc = monter(h, doc, couchesApresLeGeste({ ...doc, build: { ...doc.build, layers: manifestFor(SOCLE) } }, { id: "soulforging", on: true }));
  /* Soulforging seul + le catalogue : c'est ce que « allumer un enfant depuis SRD » produit. */
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
     dessus — c'est le témoin. L'écran le dit sans un mot d'erreur. */
  const h = pileReelle();
  const doc = exempleSur(h);
  assert.equal(h.layers.verbs.stack().some((c) => LIVRE_LAYER_IDS.includes(c.id)), false, "témoin : aucun livre monté");
  const sansLivre = renderLayersEcran({ document: doc, pile: h.layers.verbs.stack() }, () => {});
  assert.equal(sansLivre.querySelectorAll(".tdc-ligne[data-livre]").length, 2);
  assert.equal(sansLivre.querySelectorAll(".doc-field-error").length, 0);

  /* Présent : la couche du générateur — corrigée par ce lot — se monte par
     `register`, à sa place (au-dessus de `srfh`, sous FH), ÉTEINTE. */
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

test("E7 — ⚔️ UNE LANGUE CHOISIE, PUIS TRAININGS COUPÉ : la dérivation DÉGRADE et `validate` NOMME — elle ne jette plus", () => {
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
  assert.doesNotThrow(() => { doc = monter(h, doc, couchesApresLeGeste(doc, { id: "trainings", on: false })); },
    "⛔ la dérivation ne doit pas JETER sur un ref d'une couche que le joueur a éteinte");
  assert.ok(doc.resolved, "le personnage dérive, dégradé");
  assert.deepEqual(doc.resolved.languages, [], "…sans langue : le manque est porté par la fiche");
  const refus = h.verbs.validate({ document: doc }).violations.filter((v) => v.key === "choice.ref-missing").map((v) => v.path);
  assert.ok(refus.includes("background.languages[0]"), `et NOMMÉ par validate — vu : ${refus.join(", ")}`);
  /* ⚔️ Le symétrique : le maître RALLUMÉ, tout revient et plus aucun refus. */
  doc = monter(h, doc, couchesApresLeGeste(doc, { id: "maitre", on: true }));
  assert.deepEqual(h.verbs.validate({ document: doc }).violations, [], "rallumé : le personnage est de nouveau entier");
});

/* ══ E8 — ⚔️ LOT 191 : LORE PORTE LES ESPÈCES, SUR LA VRAIE PILE ══════════
   ⚖️ Eric, 09/09 : *« Il n'y a pas d'Araag dans SRD si le bouton Lore n'est
   pas poussé. »* puis *« Lore rajoute le monde FH sans les règles. »* */
test("E8 — ⚔️ WORLD (ex-Lore) ÉTEINT : plus aucune espèce `fh:` ; l'Araag déjà choisi est NOMMÉ par validate ; WORLD RALLUMÉ : il revient, ses traits se lisent, inertes sans leur règle", () => {
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

  /* LORE ÉTEINT — les trois couches sortent par le haut (lore, fiche, puis
     species : la fiche patche ce que species ajoute, l'ordre inverse jetterait). */
  assert.doesNotThrow(() => { doc = monter(h, doc, couchesApresLeGeste(doc, { id: "lore", on: false })); },
    "⛔ éteindre Lore ne doit pas jeter — l'ordre de démontage est celui du manifeste à l'envers");
  assert.deepEqual(actives(h).filter((id) => sw("lore").couches.includes(id)), [], "les trois couches de Lore sont éteintes");
  assert.deepEqual(especesFh(), [], "⛔ « Il n'y a pas d'Araag dans SRD si le bouton Lore n'est pas poussé »");
  assert.equal(h.layers.verbs.query({ kind: "species" }).length, 9, "…et les neuf du SRD restent");
  assert.ok(doc.resolved, "le personnage dérive, dégradé (derive.mjs lit l'espèce par `maybe`)");
  assert.equal(doc.resolved.identity.species, undefined, "…sans espèce");
  const morts = h.verbs.validate({ document: doc }).violations.filter((v) => v.key === "choice.ref-missing");
  assert.deepEqual(morts.map((v) => [v.path, v.params.id]), [["species", ARAAG]], "et `validate` NOMME le choix non résolu");
  /* L'écran : Lore éteint, ses trois couches dites, le maître toujours engagé. */
  const node = renderLayersEcran({ document: doc, pile: h.layers.verbs.stack() }, () => {});
  assert.equal(enfant(node, "lore").dataset.on, "false");
  assert.equal(enfant(node, "lore").dataset.couches, "fh-species-en fh-fiche-en fh-lore-en");
  assert.equal(maitre(node).dataset.on, "true", "Fate's Hand reste engagé : Lore est un enfant, pas le catalogue");

  /* LORE RALLUMÉ — species d'abord, puis fiche et lore qui la patchent. */
  assert.doesNotThrow(() => { doc = monter(h, doc, couchesApresLeGeste(doc, { id: "lore", on: true })); });
  assert.equal(doc.resolved.identity.species, "Araag", "l'Araag revient — rien n'avait été effacé");
  assert.deepEqual(h.verbs.validate({ document: doc }).violations.filter((v) => v.key === "choice.ref-missing"), []);
  /* 📏 LE COMPTE SOUS LORE, MESURÉ AU MANIFESTE : 12 (species) + 24 (fiche) + 24 (lore). */
  const pile = h.layers.verbs.stack();
  const compte = sw("lore").couches.reduce((n, id) => n + pile.find((c) => c.id === id).records, 0);
  assert.equal(compte, 60, "le compte de records sous Lore — il était 48 quand Lore n'avait que deux couches");
  const rallume = renderLayersEcran({ document: doc, pile }, () => {});
  assert.match(enfant(rallume, "lore").querySelectorAll(".interrupteur-note")[0].textContent, /60 records/, "l'écran l'affiche");

  /* ⚖️ « LORE RAJOUTE LE MONDE FH SANS LES RÈGLES » — Lore seul, tout le
     reste éteint : l'Araag existe, ses traits se LISENT, et aucune règle FH ne
     tourne (aucune stat `fh:` publiée, aucun drapeau de règle levé). */
  const loreSeul = FH_LAYER_IDS.filter((id) => sw("lore").couches.includes(id));
  doc = monter(h, doc, loreSeul);
  assert.deepEqual(actives(h).filter((id) => FH_LAYER_IDS.includes(id)), loreSeul, "témoin : Lore seul");
  assert.equal(doc.resolved.identity.species, "Araag", "l'Araag existe avec Lore seul");
  const traits = (doc.resolved.traits || []).map((t) => t.name);
  assert.ok(traits.some((n) => /Fast Learner/i.test(n)), `le monde se lit : ses traits nommés sont sur la fiche — ${traits.join(", ")}`);
  assert.deepEqual((doc.resolved.stats || []).filter((s) => String(s.id).startsWith("fh:")).map((s) => s.id), [],
    "…et aucune règle ne tourne : pas de pool de compétences, pas de Score de Destinée — inerte, sa règle éteinte");
  const drapeaux = h.layers.verbs.flags();
  assert.equal(drapeaux.includes("fh.skills") || drapeaux.includes("fh.destiny"), false, "les drapeaux de règle sont bas");
});

/* ══ F — LES OCTETS DE LA COQUILLE ═════════════════════════════════════════ */

test("F1 — 🔌 la coquille câble Layers : la porte, les deux gestes, le manifeste passé à l'écran", () => {
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  assert.match(shell, /action\.kind === "ouvrirLayers"[\s\S]{0,120}state\.menuBranche = "layers"/, "la porte ouvre la branche `layers` au rang B");
  assert.match(shell, /action\.kind === "requestLayerSwitch"[\s\S]{0,200}monterLesCouches\(couchesApresLeGeste\(state\.document/,
    "un enfant passe par le geste PUR, jamais par une liste écrite dans la coquille");
  assert.match(shell, /action\.kind === "requestBookSwitch"[\s\S]{0,120}monterLeLivre\(action\.id/);
  assert.match(shell, /pile: state\.engine\.layers\.verbs\.stack\(\)/, "l'écran reçoit le manifeste, il ne monte rien");
  assert.match(shell, /function applyLayerStack\(value\) \{\s*monterLesCouches\(value === "srdfh" \? FH_LAYER_IDS : \[\]\);/,
    "le geste « tout FH » est un cas du geste général, pas une seconde boucle");
});

test("F2 — 🔴 la coquille ALIGNE la pile sur le document AVANT de dériver, au boot comme à l'ouverture d'un fichier", () => {
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  const occurrences = shell.match(/alignerLaPileSurLeDocument\(\);\s*(?:\/\/[^\n]*)?\s*rebuild\(\);/g) || [];
  assert.equal(occurrences.length, 2, "deux chemins montent un document : le boot et `ouvrirUnFichier` sans rechargement");
  assert.match(shell, /const gestes = gestesDAlignement\(layersVerbs\.stack\(\), declares\)/, "…par les gestes purs, testés en E5");
});

test("F3 — 📚 `engine.mjs` va chercher les livres sous `layers-livres/`, et un 404 n'est PAS une erreur", () => {
  const engine = stripComments(fs.readFileSync(path.join(UI, "engine.mjs"), "utf8"));
  assert.match(engine, /layers-livres\/\$\{file\}/);
  assert.match(engine, /if \(!reponse \|\| !reponse\.ok\) return null/, "un 404 rend null : zéro livre");
  assert.match(engine, /layers\.verbs\.disable\(\{ id \}\)/, "un livre se monte ÉTEINT — le document décide");
  assert.match(engine, /if \(file === SOUS_LES_LIVRES\) livresRefuses = await monterLesLivres/, "…juste au-dessus de `srfh`");
});
