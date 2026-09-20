/* ══ LES TESTS DU LOT 49 — L'ÉTAPE EQUIPMENT ═════════════════════════════

   Même patron que `tests/abilities-step.test.mjs`/`tests/destiny-step.test.mjs` :
   ZÉRO plan `decisions[]` pour `gear`/`currency`/`class` (mesuré, commande
   §0.2) — cette suite ne construit donc pas son `ctx` comme
   `class-species-steps.test.mjs` (`decisions`) : elle passe `document` (le
   brut, seule source des lignes `gear[N]` et de la bourse) et `resolved` (la
   fiche dérivée, jamais recalculée par l'écran).

   ⛔ `shell.mjs` N'A AUCUN EXPORT (il exécute son propre `render()` à
   l'import) — les TROIS gestes composites qu'il ajoute pour ce lot
   (`addGearLine`, `removeGearLine`, `addStartingPurse`) ne peuvent donc pas
   être exercés via un vrai harnais de rendu. Même limite, même réponse que
   `abilities-step.test.mjs` (« garde 11 ») : les trois fonctions
   `applyAddGearLine`/`applyRemoveGearLine`/`applyAddStartingPurse`
   ci-dessous sont des COPIES de la logique de `shell.mjs`, écrites pour ce
   test, qui pilotent les VRAIS verbes (`choose`/`set`/`clear`/`rebuild`) —
   elles prouvent le résultat, jamais que `shell.mjs` lui-même est
   correctement câblé. Le garde d'octets, plus bas, couvre ce second point,
   au même patron que « garde 11 » de `tests/ui-jetons.test.mjs`. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { CURRENCY_KEYS } from "../src/build/index.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const UI_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");

const {
  renderEquipmentStep, renderEquipmentBar, whatYouHave, currentGearLines, currentCurrency, nextGearIndex,
  orDeLaProse, orDeLaSource, origineDuDepart, orDuDepart,
  lignesDeSection, grilleDeSection, premierePlaceLibre, rangement, RANGEMENTS, boiteDeSection,
  sectionsDuSac, SECTION_PARTY, SECTION_DEPOT, SECTIONS_DU_SAC, placeNeuveDans,
  rangsDesSections, cheminDuRang, CHEMIN_RANG_PARTY
} = await import("../ui/builder/equipment-step.mjs");
/* ⛔ LA TAILLE D'UNE PAGE NE SE RETAPE PAS : elle se compte dans le plan du sac
   (`sac-disposition.mjs` → `CASES_DU_SAC`). Un 12 écrit ici serait un nombre de plus
   à tenir d'accord avec la grille. */
const { CASES_DU_SAC } = await import("../ui/builder/sac-ecran.mjs");
const { ROUE } = await import("../ui/builder/sac-disposition.mjs");

const fixture = exempleFhEn();
const { build, layers } = fixture;
const query = layers.verbs.query;

function rebuild(document) { return build.verbs.rebuild({ document }); }

/* ── LES TROIS GESTES COMPOSITES DE `shell.mjs` (`applyDecisionAction`),
   REJOUÉS À LA MAIN — voir l'en-tête. Chacune une copie MOT POUR MOT de la
   séquence de verbes que `shell.mjs` exécute. */
function applyAddGearLine(document, { ref, quantity, equipped }) {
  const index = nextGearIndex(document);
  let doc = build.verbs.choose({ document, path: `gear[${index}]`, ref }).document;
  doc = build.verbs.set({ document: doc, path: `gear[${index}].quantity`, value: quantity }).document;
  doc = build.verbs.set({ document: doc, path: `gear[${index}].equipped`, value: equipped }).document;
  return doc;
}
function applyRemoveGearLine(document, index) {
  let doc = document;
  for (const suffix of ["", ".quantity", ".equipped"]) {
    doc = build.verbs.clear({ document: doc, path: `gear[${index}]${suffix}`, kind: "choice" }).document;
  }
  return doc;
}
/** Le personnage d'exemple porte déjà une bourse complète (cp:4, sp:12,
 *  gp:8, pp:0) — les tests du piège/de l'addition partent d'un feuillet
 *  vierge sur `currency.*`, sinon ils mesureraient l'exemple, pas la règle. */
function withoutCurrency(document) {
  let doc = document;
  for (const key of CURRENCY_KEYS) {
    doc = build.verbs.clear({ document: doc, path: `currency.${key}`, kind: "choice" }).document;
  }
  return doc;
}

function applyAddStartingPurse(document) {
  const or = orDuDepart({ query, document });
  if (!or.cout) return document;
  const current = currentCurrency(document);
  let doc = document;
  for (const key of CURRENCY_KEYS) {
    const base = Number.isInteger(current[key]) ? current[key] : 0;
    const value = base + (or.cout[key] || 0);
    doc = build.verbs.set({ document: doc, path: `currency.${key}`, value }).document;
  }
  return doc;
}

/* ── LES SÉLECTEURS DU DOM-STUB, MÊME PATRON QUE `class-species-steps.test.mjs` ── */
function rows(node, selector) { return node.querySelectorAll(selector); }
/* ⏳ LOT 66 — `search: true` PAR DÉFAUT DANS LES TESTS. La barre de
   recherche est REPLIÉE DERRIÈRE LA LOUPE (B8.1) : Eric l'avait posé au
   conditionnel — « si on a la place pour poser une loupe dans les flottants
   pour invoquer la barre de recherche » — et la place existe, ce qui évite
   une CINQUIÈME barre fixe (le cumul que B7.6 signale).
   ⭐ Les tests la demandent donc explicitement : c'est le geste du joueur,
   et ce qu'ils prouvent ne change pas d'une ligne. */
function ctxFrom(document, report, extra) {
  return Object.assign({ document, resolved: report ? report.resolved : null, query, search: true }, extra || {});
}

/* ══ 1 — UNE LIGNE D'ÉQUIPEMENT SE POSE (commande §3, test 1) ═══════════
   ⭐ « C'est le test qui prouve le lot. » */
test("1 — un record choisi produit gear[N] complet, et la ligne apparaît dans resolved.gear après rebuild", () => {
  const doc = applyAddGearLine(fixture.document, {
    ref: { kind: "gear", id: "srd:gear:en:crowbar" }, quantity: 1, equipped: false
  });
  const lines = currentGearLines(doc);
  const newLine = lines[lines.length - 1];
  assert.equal(newLine.ref.id, "srd:gear:en:crowbar");
  assert.equal(newLine.quantity, 1);
  assert.equal(newLine.equipped, false);

  const report = rebuild(doc);
  assert.ok(report.resolved.gear.some((g) => g.id === "crowbar"),
    "la ligne posée par addGearLine doit apparaître dans resolved.gear, pas seulement dans build.choices");
});

/* ══ 2 — ⚔️ LE PIÈGE DE LA BOURSE (commande §3, test 2) ══════════════════ */
test("2 — poser currency.gp SEUL ne produit AUCUNE resolved.currency ; les quatre la produisent", () => {
  const withGpOnly = build.verbs.set({ document: withoutCurrency(fixture.document), path: "currency.gp", value: 99 }).document;
  const reportGpOnly = rebuild(withGpOnly);
  assert.equal(reportGpOnly.resolved.currency, undefined,
    "CURRENCY_KEYS vaut cp/sp/gp/pp — gp seul laisse trois clefs manquantes, et derive.mjs se tait plutôt que d'inventer une bourse");
  assert.ok(reportGpOnly.underived.some((entry) => entry.field === "currency" && entry.key === "underived.currency-incomplete"),
    "le silence est DÉCLARÉ, pas seulement absent — c'est la loi §0.2 de la commande, rendue visible");

  let complete = withGpOnly;
  for (const key of ["cp", "sp", "pp"]) {
    complete = build.verbs.set({ document: complete, path: `currency.${key}`, value: 0 }).document;
  }
  const reportComplete = rebuild(complete);
  assert.deepEqual(reportComplete.resolved.currency, { cp: 0, sp: 0, gp: 99, pp: 0 });
});

/* ══ 3 — L'OR DE DÉPART, POSÉ UNE FOIS, PAS RÉÉCRIT (commande §3, test 3) ═
   ⭐ LOT 182 — LE MONTANT N'EST PLUS ÉCRIT DANS CE TEST NON PLUS : le
   personnage d'exemple est un Wizard (55 GP à l'option B de sa classe) et son
   origine est l'Inheritance (50 GP). 105, donc — et si la donnée change, c'est
   la table du lot 182 plus bas qui rougit, pas ce test-ci. */
test("3 — addStartingPurse pose les quatre clefs et s'AJOUTE à ce qui existe déjà (l'or du paquet, posé avant)", () => {
  /* Option A d'un paquet : « … and 15 GP » — SON propre or, posé par le joueur
     comme n'importe quelle autre valeur de bourse AVANT le geste de la bourse. */
  const withClassGold = build.verbs.set({ document: withoutCurrency(fixture.document), path: "currency.gp", value: 15 }).document;
  const withPurse = applyAddStartingPurse(withClassGold);
  const attendu = orDuDepart({ query, document: withClassGold }).cout.gp;
  assert.equal(attendu, 105, "Wizard 55 + Inheritance 50 — les deux sources, chacune LUE dans sa prose");
  const current = currentCurrency(withPurse);
  assert.deepEqual(current, { cp: 0, sp: 0, gp: 15 + attendu, pp: 0 },
    "15 (l'or du paquet) + l'or de départ — aucune collision, §0.1 de la commande");
});

test("3b — une valeur déjà posée n'est PAS réécrite par un re-rendu de l'étape (aucun onAction pendant render)", () => {
  const withPurse = applyAddStartingPurse(fixture.document);
  /* Le joueur DÉPENSE : gp descend à 10, à la main. */
  const spent = build.verbs.set({ document: withPurse, path: "currency.gp", value: 10 }).document;
  const report = rebuild(spent);
  const calls = [];
  renderEquipmentStep(ctxFrom(report.document, report), (a) => calls.push(a));
  assert.equal(calls.length, 0, "un simple rendu ne doit déclencher AUCUNE action — la bourse ne se repose pas toute seule");
  assert.equal(currentCurrency(report.document).gp, 10, "la valeur dépensée survit au rendu, inchangée");
});

/* ══ 4 — UN PAQUET SE POSE COMME UNE LIGNE, NE SE DÉPLIE PAS (commande §3, test 4) ═ */
test("4 — Explorer's Pack se pose comme UNE ligne de resolved.gear, jamais dépliée en sous-objets", () => {
  const doc = applyAddGearLine(fixture.document, {
    ref: { kind: "gear", id: "srd:gear:en:explorer-s-pack" }, quantity: 1, equipped: false
  });
  const report = rebuild(doc);
  const packLines = report.resolved.gear.filter((g) => g.id === "explorer-s-pack");
  assert.equal(packLines.length, 1);
  assert.equal(packLines[0].name, "Explorer’s Pack");
});

/* ══ 5 — UNE ARMURE `equipped: true` CHANGE resolved.ac (commande §3, test 5) ═ */
test("5 — une armure posée equipped: true change resolved.ac — la preuve que l'écran parle au moteur", () => {
  const before = rebuild(fixture.document);
  const withArmor = applyAddGearLine(fixture.document, {
    ref: { kind: "armor", id: "srd:armor:en:chain-mail" }, quantity: 1, equipped: true
  });
  const after = rebuild(withArmor);
  assert.notEqual(after.resolved.ac, before.resolved.ac);
  assert.equal(after.resolved.ac, 16, "Chain Mail : ac_base 16, ac_dex_cap 0 — le Dex du personnage n'y entre pas");
});

test("7 — clear est SÛR sur gear[N] : rebuild ne jette pas, la ligne disparaît, aucune orpheline ne reste", () => {
  const withLine = applyAddGearLine(fixture.document, {
    ref: { kind: "gear", id: "srd:gear:en:crowbar" }, quantity: 1, equipped: false
  });
  const lines = currentGearLines(withLine);
  const index = lines[lines.length - 1].index;

  assert.doesNotThrow(() => rebuild(withLine));

  const removed = applyRemoveGearLine(withLine, index);
  let report;
  assert.doesNotThrow(() => { report = rebuild(removed); }, "clear sur gear[N] ne doit PAS faire jeter rebuild");
  assert.ok(!report.resolved.gear.some((g) => g.id === "crowbar"), "la ligne retirée ne doit plus apparaître dans resolved.gear");
  assert.ok(!currentGearLines(removed).some((l) => l.index === index), "l'index retiré ne doit laisser aucune trace (ref/quantity/equipped)");
  assert.ok(!report.unconsumed.some((p) => p.startsWith(`gear[${index}]`)),
    "aucun `gear[N].quantity`/`gear[N].equipped` orphelin ne doit rester dans build.choices");
});

/* ══ ⛔ NEUF TESTS ONT ÉTÉ RETIRÉS ICI LE 2026-08-23, ET CE N'EST PAS UN
   ABANDON DE COUVERTURE ═══════════════════════════════════════════════════
   Eric, en regardant l'écran : *« tout ce qu'il y a en dessous dégage »*, puis
   *« dégage tout ce que je vois à l'écran, tu recâbleras après »*. L'étape
   Équipement ne porte plus que la carte de l'écran R.

   Ce qui est parti, et les tests qui l'éprouvaient avec :
     · la phrase de classe ............ tests 6 et 6b
     · le sac et son bouton Remove .... test 7b
     · « what you have » .............. test 8
     · le sac et la bourse sans classe  test 8b
     · le chercheur ................... deux tests
     · la bourse ...................... deux tests

   ⭐ CE QUI EST GARDÉ EST L'ESSENTIEL, ET IL EST INTACT : les tests 1 à 7 et
   les trois gardes d'octets sur `shell.mjs` n'éprouvaient pas des NŒUDS, ils
   éprouvaient le MODÈLE — `gear[N]` complet, `currency` tout ou rien, les
   50 PO du Barbare ajoutés sans écraser, `clear` sûr, l'AC qui bouge quand une
   armure s'équipe. Rien de cela n'a changé : ce sont les écrans qui liront ces
   données qui n'existent pas encore.
   ⛔ Ce qui a disparu, ce sont les tests d'un ÉCRAN, pas d'une règle.

   ⏳ « Tu recâbleras après » : le jour où `B1`, `B2` et `B3` ouvrent, ces
   organes reviennent avec la géométrie du croquis — et leurs tests avec eux.
   Les versions retirées sont dans l'historique ; ⛔ elles ne se recopient pas
   telles quelles, elles éprouvaient une mise en page qu'Eric a écartée. */
test("⛔ l'étape Équipement OUVRE SUR R (Gear), et une seule vue vit à la fois (l'inversion du 24/08)", () => {
  /* 🔴 RÉÉCRIT À LA NOUVELLE VÉRITÉ LE 2026-08-24, ET NON RELÂCHÉ. Ce garde
     exigeait « la carte de R, seule » ; Eric a INVERSÉ les positions le jour
     même (*« inverse les positions de R et de B3 »*) : le personnage équipé
     devient l'écran d'entrée, le catalogue vit derrière sa porte.
     🔴 RÉÉCRIT UNE SECONDE FOIS LE 2026-09-16 (lot 212) : l'écran d'entrée est
     R (Gear), le pantin coté du 15/09, et sa porte vers le catalogue s'appelle
     `Wares` (croquis d'Eric). Ce que le garde tient n'a pas molli : UNE vue à
     la fois, et aucun organe mort ne revient. */
  const node = renderEquipmentStep({
    document: fixture.document, resolved: fixture.resolved, query
  }, () => {});

  assert.equal(rows(node, ".gear").length, 1, "le personnage équipé (R) est l'écran d'entrée");
  assert.equal(rows(node, ".carte-r").length, 0, "et le catalogue n'est PAS monté en même temps — une vue à la fois");

  const porte = node.querySelector('.gear-porte[data-porte="wares"]');
  assert.ok(porte, "la rangée du pied de R porte la porte Wares vers le catalogue");
  porte.click();
  assert.equal(rows(node, ".carte-r").length, 1, "Wares ouvre le catalogue…");
  assert.equal(rows(node, ".gear").length, 0, "…et R s'efface — jamais deux vues empilées");

  const gear = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "GEAR");
  assert.ok(gear, "la carte du catalogue porte GEAR");
  gear.click();
  assert.equal(rows(node, ".gear").length, 1, "GEAR ramène à R — l'aller-retour est complet");

  for (const mort of [".equipment-gear-list", ".equipment-ac-readout", ".equipment-search-block",
                      ".equipment-topbar", ".equipment-catbar", ".equipment-currency-block",
                      ".equipment-heritage", ".equipment-class-phrase"]) {
    assert.equal(rows(node, mort).length, 0, mort + " a dégagé et ne revient pas");
  }
});

/* ══ LE GARDE D'OCTETS SUR shell.mjs (même patron que « garde 11 »,
   tests/ui-jetons.test.mjs) — voir l'en-tête de ce fichier. ══════════════ */
test("garde — shell.mjs pose vraiment les trois gestes du lot 49 et branche l'étape equipment", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  for (const needle of [
    'action.kind === "addGearLine"',
    'action.kind === "removeGearLine"',
    'action.kind === "addStartingPurse"',
    "renderEquipmentStep("
  ]) {
    assert.ok(shellText.includes(needle), `shell.mjs devrait contenir « ${needle} » — sans quoi le lot 49 n'est pas branché`);
  }
  /* 📌 LE CRAN LUI-MÊME A DÉMÉNAGÉ DANS `etapes.mjs` (lot 129) : la liste des
     étapes est partagée depuis que l'écran Species doit nommer l'étape où un
     effet se règle. Ce que ce garde exige n'a pas changé — l'étape equipment
     existe dans la ceinture — seule la source où elle se déclare a bougé. */
  const etapesText = stripComments(fs.readFileSync(path.join(UI_DIR, "etapes.mjs"), "utf8"));
  assert.ok(etapesText.includes('id: "equipment"'),
    "etapes.mjs devrait contenir « id: \"equipment\" » — sans quoi le lot 49 n'est pas branché");
});

/* ⚔️ ATTAQUE MANUELLE JOUÉE SUR CE LOT (commande §3, « une attaque manuelle
   minimum ») : remplacer l'arithmétique de la bourse par `base` dans
   `shell.mjs` (elle pose les quatre clefs et n'ajoute rien) laissait LES 833
   TESTS DE LA SUITE VERTS — le test 3/3b de ce fichier rejoue la logique à
   la MAIN (voir l'en-tête), il ne relit jamais `shell.mjs`, et le garde
   au-dessus ne vérifiait QUE la présence du mot de l'action, jamais son
   arithmétique. Suspecté, mesuré, corrigé ICI plutôt que caché : ce
   garde-ci lit l'EXPRESSION, au même patron que « garde — shell.mjs ÉCHANGE
   vraiment » (tests/abilities-step.test.mjs, lot 51).
   ⭐ LOT 182 — IL LIT MAINTENANT DEUX CHOSES, ET LA SECONDE EST LA PLUS
   IMPORTANTE : que le montant soit AJOUTÉ clef par clef, et qu'il vienne de
   `orDuDepart` — c'est-à-dire de la donnée. Un `shell.mjs` qui reviendrait à
   un nombre écrit à la main passerait la première moitié et échouerait ici. */
test("garde — shell.mjs AJOUTE vraiment l'or LU, clef par clef, et ne le réécrit pas à la main", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /base\s*\+\s*\(or\.cout\[key\]\s*\|\|\s*0\)/,
    "sans cette ligne, addStartingPurse pose les quatre clefs mais AJOUTE zéro PO — mesuré au lot 49 : la suite complète reste verte sans elle");
  assert.match(shellText, /orDuDepart\(\{\s*query:[^}]*document:\s*state\.document\s*\}\)/,
    "le montant doit être LU par `orDuDepart` sur le document courant, jamais écrit dans la coquille");
  assert.equal(/\bINHERITED_PURSE_GP\b/.test(shellText), false,
    "la constante du lot 49 est morte : un écran ne porte pas une valeur de règle");
});

/* Même attaque, sur `removeGearLine` : retirer les deux `.quantity`/
   `.equipped` de la boucle des suffixes laisserait des choix orphelins dans
   `build.choices` — mesuré de la même façon que ci-dessus (aucun garde
   comportemental ne relit `shell.mjs`). */
test("garde — shell.mjs retire VRAIMENT les cinq chemins de removeGearLine (pas seulement le ref)", () => {
  /* LOT 212 : `.location` (pipeline) et `.boite` (l'emplacement choisi sur R)
     partent avec la ligne — deux orphelines de plus, sinon. Réécrit à la
     nouvelle vérité, non relâché : les trois d'avant y sont toujours. */
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /\[""\s*,\s*"\.quantity"\s*,\s*"\.equipped"\s*,\s*"\.location"\s*,\s*"\.boite"\]/,
    "sans les cinq suffixes, un retrait laisserait `gear[N].quantity`/`.equipped`/`.location`/`.boite` orphelins dans build.choices");
});

/* ══ LOT 181 — LES GEMMES, ET LA LISTE DE GENRES QUI AVAIT SURVÉCU ═══════

   🔴 CE QUE CES GARDES DÉFENDENT, ET IL A ÉTÉ MESURÉ AVANT D'ÊTRE ÉCRIT. Le
   lot 95 a retiré `EQUIPMENT_RECORD_KINDS` du tambour en écrivant « plus de
   liste » — et a laissé la MÊME liste, cinq genres en dur, dans
   `fabriquerChercheur`, mille lignes plus bas. Ce chercheur sert TOUT le
   reste : le nom d'une ligne achetée, la recherche, les boîtes du dressing.

   📏 MESURE DU 2026-09-08, avec les 54 gemmes du lot 181 : une azurite
   achetée s'affichait « fh:gem:en:azurite » — SON ID NU — et la recherche ne
   la trouvait pas. L'objet était visible au tambour et introuvable partout
   ailleurs. La liste est remplacée par `genresDuRangement`, qui lit
   `shelving.of_kind` comme le tambour le fait déjà. */
const { genresDuRangement } = await import("../ui/builder/equipment-step.mjs");

test("lot 181 — les genres du chercheur sont LUS dans le rangement, jamais écrits à la main", () => {
  const genres = genresDuRangement(query({ kind: "shelving" }));
  assert.deepEqual(genres, ["armor", "gear", "gem", "item", "tool", "weapon"],
    "six genres rangés par Eric — `gem` est arrivé avec les gemmes, sans qu'une liste soit corrigée");

  /* ⚔️ ATTAQUE — un rangement qui nomme un genre ABSENT du contrat ne doit ni
     entrer ni faire tomber l'écran : `query` JETTE sur un genre inconnu. */
  const bruit = [{ record: { data: { of_kind: "tarot" } } }, { record: { data: {} } }, {}, null];
  assert.deepEqual(genresDuRangement(bruit), [], "un genre hors contrat est écarté, pas propagé à `query`");
  /* ⚔️ ET LE VIDE — sans couche de rangement, aucun genre : l'écran se vide,
     il n'invente pas un repli sur les genres (le défaut retiré au lot 95). */
  assert.deepEqual(genresDuRangement([]), []);
  assert.deepEqual(genresDuRangement(undefined), []);
});

test("lot 181 — 🔴 une gemme ACHETÉE porte SON NOM sur la ligne, jamais son id nu", () => {
  /* ⚔️ C'EST LE TEST QUI ÉTAIT ROUGE AVANT LE CORRECTIF, et il l'a été pour
     de vrai : « la ligne montre l'id nu : true / la ligne montre Azurite :
     false ». Il vaut pour tout genre qu'Eric range et que le chercheur ne
     connaissait pas — les gemmes ne sont que la première occasion. */
  const doc = {
    build: {
      choices: [
        /* ⚖️ 09/09 — `azurite` est l'une des 23 pierres que le DMG porte AUSSI :
           son id est PARTAGÉ (`srfh:`), pour que la couche du livre et celle de
           FH n'en fassent qu'un seul record. Voir `idCanonique`. */
        { path: "gear[0]", ref: { kind: "gem", id: "srfh:gem:en:azurite" } },
        { path: "gear[0].quantity", value: 1 },
        { path: "gear[0].location", value: "backpack" }
      ]
    }
  };
  const node = renderEquipmentStep({ document: doc, resolved: null, query, search: true }, () => {});
  /* lot 212 : la ligne vit dans le sac, derrière la porte Backpack de R */
  node.querySelector('.gear-porte[data-porte="backpack"]').click();
  const texte = node.textContent || "";
  assert.match(texte, /Azurite/, "le nom du record doit arriver jusqu'à la ligne");
  /* ⛔ LE PIÈGE, ET IL EST EXACTEMENT CELUI DE `TRAPS.md` — « un identifiant qui
     en contient un autre ». La chaîne « srfh:gem:en:azurite » CONTIENT
     « fh:gem:en:azurite » : chercher l'ancien id passerait au vert sur le
     nouveau. On cherche donc l'id COMPLET, et le témoin ci-dessous le prouve. */
  assert.equal(texte.includes("srfh:gem:en:azurite"), false,
    "un id nu à l'écran est le symptôme exact d'un genre que le chercheur ne résout pas");
  assert.ok("srfh:gem:en:azurite".includes("fh:gem:en:azurite"),
    "témoin : l'ancien id est une SOUS-CHAÎNE du nouveau — un garde qui cherche l'ancien ne garde rien");
  /* 🔴 ET ON REVIENT À R PAR LA PORTE `Gear`, PLUS PAR UN `BACK` — 18/09, le jour
     où la porte `Backpack` a cessé d'ouvrir l'ancienne liste pour ouvrir le sac B1.
     ⭐ CE GARDE A BIEN FAIT DE TOMBER, ET IL N'A RIEN PERDU DE SES DENTS : les deux
     assertions du dessus (le nom qui arrive, l'id nu qui n'arrive pas) sont passées
     sur le NOUVEAU sac avant qu'il ne bute sur le retour. C'est l'ancien écran qui
     portait un bouton `BACK` ; le pied du sac porte `Gear · Send · Wares`, et §6 dit
     depuis toujours que le mot `Back` n'appartient qu'à la coquille.
     ⛔ La vue est un état de MODULE : sans ce retour, les trois gardes suivants
     rendraient le sac au lieu de R — c'est exactement ce qui vient d'arriver. */
  node.querySelector('.gear-porte[data-porte="gear"]').click();
});

/* ══ LOT 215 — UNE FICHE REVIENT D'OÙ ELLE A ÉTÉ OUVERTE ══════════════════

   🔴 CE QUE CE GARDE DÉFEND, ET ERIC L'A VU AVANT LUI (20/09) : *« je visite un
   item et je le referme, je ne reviens pas au point d'origine, je reviens dans
   gear, problématique »*.
   ⛔ LA CAUSE : `surPorte` nommait `"gear"` EN DUR — quatre fois — et les deux
   `surJeton` qui ouvrent la fiche n'enregistraient pas l'origine. L'information
   n'existait pas au moment de fermer.
   ⭐ ET L'IDIOME JUSTE ÉTAIT DÉJÀ DANS LE FICHIER : `renderB1` ferme par
   `montrer(ficheEnCours.retour || "r")` — B1 LIT son appelant. X1, plus récent, ne
   l'a pas hérité. C'est la loi du 19/09 en habit neuf : *un retournement — ou un
   réemploi — hérite du calcul sans hériter de ce qui l'entoure.*

   ⚔️ LE TÉMOIN VISITE LES DEUX CHEMINS, et c'est ce qui le rend capable
   d'accuser : depuis GEAR il était DÉJÀ vert (c'est le seul cas que le code
   servait) ; depuis le SAC il était ROUGE. Un garde qui n'aurait testé que le sac
   aurait pu être « réparé » en cassant Gear sans que rien ne rougisse. */
test("lot 215 — 🔴 la fiche d'un objet revient D'OÙ ELLE VIENT, ⛔ pas toujours dans Gear", () => {
  const doc = {
    build: {
      choices: [
        /* un objet PORTÉ — il se voit depuis Gear */
        { path: "gear[0]", ref: { kind: "gem", id: "srfh:gem:en:azurite" } },
        { path: "gear[0].quantity", value: 1 },
        { path: "gear[0].location", value: "self" },
        /* et un objet RANGÉ — il se voit depuis le sac */
        { path: "gear[1]", ref: { kind: "gem", id: "srfh:gem:en:azurite" } },
        { path: "gear[1].quantity", value: 1 },
        { path: "gear[1].location", value: "backpack" }
      ]
    }
  };
  const node = renderEquipmentStep({ document: doc, resolved: null, query, search: true }, () => {});
  const dansLeSac = () => !!node.querySelector('[data-ecran="SB3.1"]');
  /* ⛔ `armerJeton` ne s'arme que sur le bouton 0 ; le `contextmenu` posé à côté
     ouvre la même fiche, et c'est le chemin que ce banc peut emprunter.
     ⚠️ Ce qu'il ne prouve donc PAS : le tap au DOIGT, qui passe par le pointeur. */
  const ouvrirUneFiche = () => {
    const jeton = node.querySelector('[data-occupe="oui"]');
    assert.ok(jeton, "l'écran doit porter au moins un jeton occupé à ouvrir");
    jeton.dispatchEvent({ type: "contextmenu", target: jeton });
    const close = node.querySelector('.x1-porte[data-porte="close"]');
    assert.ok(close, "la fiche X1 doit être ouverte, avec sa porte Close");
    return close;
  };

  /* ① DEPUIS GEAR — déjà juste avant le correctif, et il doit le rester. */
  assert.equal(dansLeSac(), false, "on démarre sur Gear, pas dans le sac");
  ouvrirUneFiche().click();
  assert.equal(dansLeSac(), false,
    "une fiche ouverte depuis GEAR rend GEAR — ⛔ le correctif ne doit pas l'échanger contre le sac");

  /* ② DEPUIS LE SAC — le chemin d'Eric, et celui qui était rouge. */
  node.querySelector('.gear-porte[data-porte="backpack"]').click();
  assert.ok(dansLeSac(), "témoin de départ : la porte Backpack ouvre bien le sac");
  const close = ouvrirUneFiche();
  assert.equal(dansLeSac(), false, "la fiche a bien remplacé le sac à l'écran");
  close.click();
  assert.ok(dansLeSac(),
    "🔴 fermer une fiche ouverte DEPUIS LE SAC doit rendre LE SAC, jamais Gear");

  /* ⛔ LA VUE EST UN ÉTAT DE MODULE : sans cette sortie, les gardes suivants
     recevraient le sac au lieu de Gear. Avant le correctif le test finissait sur
     Gear PAR LA FAUTE elle-même — c'est exactement le genre de propreté que la
     réparation retire, et qu'il faut donc rendre explicite. */
  node.querySelector('.gear-porte[data-porte="gear"]').click();
  assert.equal(dansLeSac(), false, "la suite hérite de Gear, comme elle l'attend");
});

/* ══ LOT 182 — L'OR DE DÉPART SE LIT DANS LA DONNÉE, DES DEUX CÔTÉS ═══════

   🔴 CE QUE CES GARDES DÉFENDENT, ET IL A ÉTÉ MESURÉ AVANT D'ÊTRE ÉCRIT.
   `equipment-step.mjs` portait `INHERITED_PURSE_GP = 50`, écrit en dur, et sa
   propre ligne 27 déclarait « le nombre est nommé UNE FOIS, jamais un `50` nu
   dans une fonction de rendu ». 📏 Mesuré le 2026-09-09 : `50` apparaissait DIX
   fois dans le fichier, dont DEUX dans la prose lue par le joueur. Conséquence
   sur la table : tout personnage se voyait offrir 50 PO — un Fighter, dont le
   SRD dit 155, lisait 50 et recevait 50.

   ⚠️ LE PIÈGE DE MESURE DE CE LOT, ET IL EST DANS LA DONNÉE : **trois classes
   valent VRAIMENT 50** (Druid, Monk, Sorcerer). Un relevé qui rend 50 ne prouve
   donc RIEN. C'est pour ça que la table ci-dessous nomme les douze montants un
   par un, et que les gardes de rendu se jouent sur le Fighter (155) et le
   Wizard (55) — les deux qui accusent. */

/** La table témoin : les douze montants d'option B, écrits À LA MAIN d'après
 *  `layers/srd-5.2.1-en.layer.json`. ⛔ Elle n'est PAS dérivée de la couche —
 *  un compte tiré de la même source que ce qu'il compte ne prouve rien. Si un
 *  jour la couche change, c'est ce tableau qui rougit, et c'est voulu. */
const OR_DES_CLASSES = {
  "srd:class:en:barbarian": 75, "srd:class:en:bard": 90, "srd:class:en:cleric": 110,
  "srd:class:en:druid": 50, "srd:class:en:fighter": 155, "srd:class:en:monk": 50,
  "srd:class:en:paladin": 150, "srd:class:en:ranger": 150, "srd:class:en:rogue": 100,
  "srd:class:en:sorcerer": 50, "srd:class:en:warlock": 100, "srd:class:en:wizard": 55
};

test("182 — les DOUZE classes rendent l'or de LEUR option B, pas un montant commun", () => {
  const vues = query({ kind: "class" });
  assert.equal(vues.length, 12, "douze classes — si ce compte bouge, l'Artificier est entré");
  const lu = {};
  for (const vue of vues) {
    const or = orDeLaSource(vue, "class");
    assert.equal(or.underived, null, `« ${vue.id} » : son or de départ doit se lire`);
    lu[vue.id] = or.cout.gp;
    /* ⛔ ET IL N'Y A QUE DE L'OR : une option B en PA ou en PC changerait la
       bourse posée sans changer le nombre affiché. */
    assert.deepEqual({ pp: or.cout.pp, sp: or.cout.sp, cp: or.cout.cp }, { pp: 0, sp: 0, cp: 0 });
  }
  assert.deepEqual(lu, OR_DES_CLASSES,
    "chaque classe porte SON montant : 75 · 90 · 110 · 50 · 155 · 50 · 150 · 150 · 100 · 50 · 100 · 55");
  /* ⭐ LA PREUVE QUE CE N'EST PAS UN NOMBRE UNIQUE DÉGUISÉ : HUIT valeurs
     distinctes pour douze classes, et l'écart va de 50 à 155.
     ⚠️ Huit, pas neuf — 50 revient trois fois (Druid · Monk · Sorcerer), 150 et
     100 deux fois chacun. Le premier jet de ce garde disait « neuf » : un
     compte fait de tête sur sa propre table, et c'est la table qui avait
     raison. */
  assert.equal(new Set(Object.values(lu)).size, 8);
});

test("182 — ⚔️ LE PIÈGE DE LA PHRASE : c'est la DERNIÈRE option qui est l'or, jamais la première", () => {
  /* Le Barbare porte DEUX montants : « … Explorer's Pack, and 15 GP; or (B) 75
     GP ». Le 15 est DANS le paquet — le facturer serait plausible et faux. */
  const barbare = query({ kind: "class", id: "srd:class:en:barbarian" });
  assert.equal(orDeLaSource(barbare, "class").cout.gp, 75, "75, l'option B — pas 15, l'or que le paquet contient");
  /* Le Fighter en porte TROIS (« Choose A, B, or C ») : 4, 11, puis 155. */
  const fighter = query({ kind: "class", id: "srd:class:en:fighter" });
  assert.equal(orDeLaSource(fighter, "class").cout.gp, 155, "155, l'option C — ni 4 ni 11");
});

test("182 — l'Inheritance porte SON or dans la donnée, et les quatre du SRD qu'elle remplace aussi", () => {
  const origines = query({ kind: "background" });
  assert.equal(origines.length, 1, "pile FH : l'Inheritance est la seule origine");
  const or = orDeLaSource(origines[0], "background");
  assert.equal(or.underived, null, "sans ce champ, l'écran réécrirait le montant à la main — c'est le défaut du lot 182");
  assert.equal(or.cout.gp, 50);

  /* ⭐ ET LE MÊME LECTEUR SUR LE SRD NU — l'autre pile, l'autre forme de
     phrase (« Choose A or B: (A) …, 8 GP; or (B) 50 GP »), un seul lecteur. */
  const srd = JSON.parse(fs.readFileSync(path.join(UI_DIR, "..", "..", "layers", "srd-5.2.1-en.layer.json"), "utf8"));
  const arrierePlans = Object.entries(srd.records.background);
  assert.equal(arrierePlans.length, 4);
  for (const [id, record] of arrierePlans) {
    const lu = orDeLaSource({ id, record }, "background");
    assert.equal(lu.underived, null, `« ${id} » : le SRD nomme son or, il doit se lire`);
    assert.equal(lu.cout.gp, 50, `« ${id} » : les quatre arrière-plans du SRD portent le MÊME 50`);
  }
});

test("182 — ⚔️ ce qui ne se lit pas rend `null` : jamais un 0, jamais un 50 de secours", () => {
  /* ⛔ « 1 Sorcery Point » — dix `class-option` portent ça dans un champ de
     coût. C'est l'ancrage de `parseCout` qui le refuse, et il doit le refuser
     ici aussi : un point de sorcellerie n'est pas une monnaie. */
  assert.equal(orDeLaProse("Choose A or B: (A) a staff; or (B) 1 Sorcery Point"), null);
  /* ⛔ Une phrase SANS option chiffrée : le découpage rend la phrase entière,
     que `parseCout` refuse parce qu'il est ancré des deux bouts. */
  assert.equal(orDeLaProse("Choose A or B: (A) Chain Mail and a Greatsword; or (B) a Longbow"), null);
  assert.equal(orDeLaProse("A Greataxe, 4 Handaxes and an Explorer's Pack"), null);
  assert.equal(orDeLaProse(""), null);
  assert.equal(orDeLaProse(null), null);
  assert.equal(orDeLaProse(42), null);
  /* ✅ ET IL NE CRIE PAS SUR CE QUI EST JUSTE — une phrase à UNE seule option
     est sa propre dernière option (c'est la forme de l'Inheritance). */
  assert.equal(orDeLaProse("50 GP").gp, 50);
  assert.equal(orDeLaProse("Choose A or B: (A) a Robe; or (B) 55 GP").gp, 55);

  /* ⛔ Un record SANS le champ : `underived`, et le montant reste `null`. */
  const muet = orDeLaSource({ record: { name: "Muet", data: {} } }, "class");
  assert.equal(muet.cout, null);
  assert.equal(muet.underived, "starting-gold.no-phrase");
  /* ⛔ Un record dont la phrase existe mais ne se lit pas : l'autre raison,
     et elle n'est pas la même — l'écran ne dit pas la même chose au joueur. */
  const illisible = orDeLaSource({ record: { name: "Flou", data: { starting_equipment: "Choose A or B: (A) a cat; or (B) a dog" } } }, "class");
  assert.equal(illisible.cout, null);
  assert.equal(illisible.underived, "starting-gold.phrase-unreadable");
  /* ⛔ Et le mauvais genre ne fabrique pas un champ : un `background` lu comme
     une `class` ne trouve pas `starting_equipment`. */
  assert.equal(orDeLaSource({ record: { data: { equipment: "50 GP" } } }, "class").cout, null);
});

test("182 — l'origine se trouve MÊME sans `choose` : le repli à une option de la pile FH", () => {
  /* ⚠️ `inheritance-step.mjs` n'émet AUCUN `choose({path:"background"})` quand
     le genre n'a qu'une option. Lire seulement `build.choices` rendrait `null`
     sur TOUTE la pile FH — une absence n'est jamais une réponse. */
  const sansChoix = origineDuDepart(query, fixture.document);
  assert.ok(sansChoix, "la pile FH n'a qu'une origine : elle se lit au genre");
  assert.equal(sansChoix.id, "fh:background:en:inheritance");

  /* ⛔ DEUX OPTIONS ET AUCUN CHOIX POSÉ : on ne devine pas. */
  const deux = (arg) => (arg && arg.kind === "background" && !arg.id ? [{ id: "a" }, { id: "b" }] : null);
  assert.equal(origineDuDepart(deux, fixture.document), null);
  /* ✅ ET AVEC UN CHOIX POSÉ, C'EST LUI — jamais le premier de la liste. */
  const pose = build.verbs.choose({
    document: fixture.document, path: "background", ref: { kind: "background", id: "fh:background:en:inheritance" }
  }).document;
  assert.equal(origineDuDepart(query, pose).id, "fh:background:en:inheritance");
});

/* ── LA PILE, TRUQUÉE PAR L'ORIGINE — l'attaque qui accuse un nombre en dur ──
   ⭐ Aucun relevé sur la vraie couche ne peut distinguer « lu » de « écrit en
   dur » pour l'origine : la donnée dit 50, la constante disait 50. Le seul
   témoin qui accuse est une origine qui porte AUTRE CHOSE que 50. */
function queryAvecOrigine(id, equipment) {
  const vue = { id, record: { name: "Inheritance", data: { equipment } } };
  return (arg) => {
    if (arg && arg.kind === "background") return arg.id ? (arg.id === id ? vue : null) : [vue];
    return query(arg);
  };
}

test("182 — 🔴 L'ÉCRAN COMPOSE SON MONTANT : un Fighter lit 155, un Wizard 55, et l'origine n'est plus un 50 en dur", () => {
  const docFighter = build.verbs.choose({
    document: fixture.document, path: "class", ref: { kind: "class", id: "srd:class:en:fighter" }
  }).document;

  const node = renderEquipmentStep(ctxFrom(docFighter, null), () => {});
  const texte = [...node.querySelectorAll(".aiguilleur-texte")].map((p) => p.textContent).join(" ");
  assert.match(texte, /Fighter 155 GP/, "le montant de la classe est LU — hier tout le monde lisait 50");
  assert.match(texte, /Inheritance 50 GP/);
  assert.match(texte, /205 GP in all/, "155 + 50 : chaque source offre SON or, et le total est composé");

  /* ⭐ LE BOUTON ET SON NOM ACCESSIBLE PORTENT LE MÊME NOMBRE — c'est la faute
     réparée la veille (`e01ff19`) : le nom disait l'inverse du texte visible,
     et l'œil ne pouvait pas le voir. */
  const boutons = [...node.querySelectorAll(".aiguilleur-bouton")];
  const bourse = boutons.find((b) => /^Take the/.test(b.textContent));
  assert.equal(bourse.textContent, "Take the 205 GP");
  assert.equal(bourse.getAttribute("aria-label"), "Set the class kit aside and take 205 GP instead");

  /* Le Wizard de l'exemple : 55 + 50. Deux classes, deux phrases. */
  const wizard = renderEquipmentStep(ctxFrom(fixture.document, null), () => {});
  const texteW = [...wizard.querySelectorAll(".aiguilleur-texte")].map((p) => p.textContent).join(" ");
  assert.match(texteW, /Wizard 55 GP/);
  assert.match(texteW, /105 GP in all/);

  /* ⚔️ L'ATTAQUE QUI ACCUSE : une origine qui porte 7 GP. Un `50` resté en dur
     rendrait ici 205 au lieu de 162, et AUCUN autre relevé ne le verrait. */
  const truque = ctxFrom(docFighter, null);
  truque.query = queryAvecOrigine("fh:background:en:inheritance", "7 GP");
  const truqueNode = renderEquipmentStep(truque, () => {});
  const texteT = [...truqueNode.querySelectorAll(".aiguilleur-texte")].map((p) => p.textContent).join(" ");
  assert.match(texteT, /Inheritance 7 GP/, "l'origine est LUE : son montant vient de son record");
  assert.match(texteT, /162 GP in all/);
  assert.equal(/50 GP/.test(texteT), false, "plus aucun 50 n'apparaît quand la donnée n'en porte pas");
});

test("182 — ⚔️ UN MONTANT ILLISIBLE N'OFFRE RIEN : pas de bouton, pas de bourse, pas de secours", () => {
  const muet = ctxFrom(fixture.document, null);
  /* Une pile sans aucune source lisible : ni classe, ni origine. */
  muet.query = (arg) => (arg && arg.kind === "background" ? (arg.id ? null : []) : (arg && arg.kind === "class" && arg.id ? null : query(arg)));
  const node = renderEquipmentStep(muet, () => {});
  const boutons = [...node.querySelectorAll(".aiguilleur-bouton")].map((b) => b.textContent);
  assert.deepEqual(boutons, ["I keep my kit"], "aucun bouton de bourse : promettre un or qu'on ne sait pas chiffrer est un mensonge");
  const texte = [...node.querySelectorAll(".aiguilleur-texte")].map((p) => p.textContent).join(" ");
  assert.equal(/\d+ GP/.test(texte), false, "et aucun montant n'est inventé — ni 0, ni 50");
  assert.match(texte, /could not be read|is not named in the data/, "le manque est NOMMÉ au joueur, pas comblé");
});

test("182 — la bourse POSÉE est celle qui a été ANNONCÉE (le même lecteur des deux côtés)", () => {
  const docFighter = build.verbs.choose({
    document: fixture.document, path: "class", ref: { kind: "class", id: "srd:class:en:fighter" }
  }).document;
  const vide = withoutCurrency(docFighter);
  const apres = applyAddStartingPurse(vide);
  assert.deepEqual(currentCurrency(apres), { cp: 0, sp: 0, gp: 205, pp: 0 },
    "155 (Fighter) + 50 (Inheritance) — le montant du bouton, à la pièce près");
});

/* ══ LES PLACES DU SAC — lot 214, seconde passe ═══════════════════════════════
   ⚖️ Eric, 2026-09-18, trois réponses qui ne font qu'un modèle : *« tighten up
   ok »* · *« plus de place, ça va dans la page suivante ou celle d'après, prochain
   emplacement dispo, voire ça crée une page supplémentaire si besoin »* · *« oui,
   évidemment, le rangement fait partie des caracs du perso ; ça doit survivre à la
   session au même titre que les autres changements »*. */

test("P1 — 📏 `gear[N].place` EST MESURÉ CONTRE LE MOTEUR, et la mesure reste un test", () => {
  /* 🔴 CE GARDE EST LE PROTOCOLE LUI-MÊME, DEVENU PERMANENT. Les chemins de ce
     chapitre (`boite`, `attuned`, `locked`) ont tous été mesurés à la main avant
     d'être posés, puis la mesure était perdue. ⭐ Ici elle reste : si une couche ou
     une règle future faisait de `place` un champ VIOLANT, le jour se saurait. */
  const avant = rebuild(fixture.document);
  let doc = fixture.document;
  for (const [i, v] of [[0, 0], [1, 5], [2, 13]]) {
    doc = build.verbs.set({ document: doc, path: `gear[${i}].place`, value: v }).document;
  }
  const apres = rebuild(doc);
  /* ⛔ LE RAPPORT NE PORTE PAS DE CLEF `violations` — mesuré, il en porte onze
     autres. Un garde qui lirait un nom absent comparerait `undefined` à `undefined`
     et serait vert pour toujours : c'est `moduleViolations` et `warnings` qui
     parlent ici, et on les NOMME plutôt que d'inventer le nom qu'on attendait. */
  assert.deepEqual(apres.moduleViolations, avant.moduleViolations,
    "⛔ une place ne fâche aucun module : ce n'est pas une règle de jeu");
  assert.equal(apres.warnings.length, avant.warnings.length,
    "⛔ et elle n'ajoute aucun avertissement");
  assert.equal(apres.underived.length, avant.underived.length,
    "⛔ et elle ne rend aucune dérivation impossible — zéro `underived` NEUF");
  for (const i of [0, 1, 2]) {
    assert.ok(apres.unconsumed.includes(`gear[${i}].place`),
      `gear[${i}].place doit ressortir en \`unconsumed\` : la fiche de personnage ne le lit pas encore, l'écran si`);
  }
  /* ⛔ ET `clear` EST SÛR : un objet qui quitte le sac perd sa place, et rien ne reste. */
  let net = doc;
  for (const i of [0, 1, 2]) {
    net = build.verbs.clear({ document: net, path: `gear[${i}].place`, kind: "choice" }).document;
  }
  const efface = rebuild(net);
  assert.ok(!efface.unconsumed.some((p) => String(p).endsWith(".place")),
    "⛔ `clear` doit ne rien laisser derrière — sinon une place fantôme survit à son objet");
});

test("P2 — ⚖️ LE DÉBORD : la première place libre, et une page de plus s'il le faut", () => {
  const PAR_PAGE = 12;
  const ligne = (index, place) => ({ index, location: "backpack", boite: "s0",
    ...(place === null ? {} : { place }) });
  /* une section pleine, sauf un trou en 4 */
  const pleine = [...Array(PAR_PAGE).keys()].filter((i) => i !== 4).map((i) => ligne(i, i));
  assert.equal(premierePlaceLibre(pleine, PAR_PAGE), 4,
    "⚖️ *« prochain emplacement dispo »* — le trou d'abord, pas la fin");

  /* vraiment pleine : la place suivante ouvre une SECONDE PAGE */
  const bourree = [...Array(PAR_PAGE).keys()].map((i) => ligne(i, i));
  assert.equal(premierePlaceLibre(bourree, PAR_PAGE), PAR_PAGE,
    "⚖️ *« voire ça crée une page supplémentaire si besoin »*");
  const grille = grilleDeSection(bourree.concat(ligne(99, PAR_PAGE)), PAR_PAGE);
  assert.equal(grille.length, PAR_PAGE * 2, "la grille fait deux pages pleines, pas 13 cases");
  assert.equal(grille[PAR_PAGE].index, 99, "et le treizième objet est la 1ʳᵉ case de la page 2");

  /* ⭐ UNE LIGNE SANS PLACE NE SE PERD PAS : les personnages sauvegardés avant ce
     lot n'en ont aucune, et ils doivent s'ouvrir entiers. */
  const ancienne = [ligne(0, null), ligne(1, null), ligne(2, 5)];
  const g = grilleDeSection(ancienne, PAR_PAGE);
  assert.equal(g[5].index, 2, "celle qui a une place la garde");
  assert.deepEqual([g[0].index, g[1].index], [0, 1], "les autres prennent les premières libres");
  assert.equal(g.filter(Boolean).length, 3, "⛔ et aucune ne disparaît");
});

test("P3 — ⚖️ `TIGHTEN UP` FERME LES TROUS SANS RIEN RÉORDONNER, les trois autres rangent", () => {
  /* ⛔ C'EST CE QUI LE DISTINGUE D'UN TRI, et pourquoi il est le premier du popup :
     il respecte le rangement du joueur. Un « tasser » qui trierait au passage
     détruirait ce qu'Eric appelle *« les caracs du perso »*. */
  const l = (index, place, nom, qte, gp) => ({ index, place, nom, quantity: qte, gp });
  const mesures = { nom: (x) => x.nom, valeur: (x) => x.gp * (x.quantity || 1) };
  /* la section arrive DÉJÀ rangée par ses places, avec des trous en 1 et 3 */
  const dedans = [l(7, 0, "Zither", 1, 30), l(3, 2, "Arrow", 20, 0.05), l(5, 4, "Book", 2, 25)];

  assert.deepEqual(rangement(dedans, "tasser", mesures),
    [{ index: 7, place: 0 }, { index: 3, place: 1 }, { index: 5, place: 2 }],
    "⛔ l'ordre ne bouge pas : 0 · 2 · 4 devient 0 · 1 · 2");
  assert.deepEqual(rangement(dedans, "nom", mesures).map((r) => r.index), [3, 5, 7],
    "A → Z : Arrow · Book · Zither");
  assert.deepEqual(rangement(dedans, "qte", mesures).map((r) => r.index), [3, 5, 7],
    "Quantity : 20 · 2 · 1, du plus grand au plus petit");
  assert.deepEqual(rangement(dedans, "valeur", mesures).map((r) => r.index), [5, 7, 3],
    "Value : 50 gp · 30 gp · 1 gp, la quantité comprise");
  /* ⭐ ET LES QUATRE RENDENT UNE SUITE SANS TROU : ranger, c'est aussi tasser. */
  for (const r of RANGEMENTS) {
    assert.deepEqual(rangement(dedans, r.clef, mesures).map((x) => x.place), [0, 1, 2],
      `« ${r.mot} » doit rendre des places contiguës depuis 0`);
  }
  assert.equal(RANGEMENTS[0].clef, "tasser",
    "⭐ et `Tighten up` est le PREMIER : c'est le seul qui respecte le rangement du joueur");
});

test("P4 — ⛔ UNE SECTION NE VOIT QUE SES LIGNES, et elle les voit DANS L'ORDRE DE LEURS PLACES", () => {
  const lignes = [
    { index: 0, location: "backpack", boite: "s0", place: 2 },
    { index: 1, location: "backpack", boite: "s1", place: 0 },
    { index: 2, location: "backpack", boite: "s0", place: 0 },
    { index: 3, location: "self", boite: "tete1" },
    { index: 4, location: "backpack", place: 1 }          /* sans boîte : la section par défaut */
  ];
  assert.deepEqual(lignesDeSection(lignes, "s0", "s0").map((l) => l.index), [2, 4, 0],
    "places 0 · 1 · 2 — et la ligne sans boîte tombe dans la section par défaut");
  assert.deepEqual(lignesDeSection(lignes, "s1", "s0").map((l) => l.index), [1]);
  assert.equal(boiteDeSection(3), "s3", "la clef se déduit de l'index, elle ne se stocke pas");
});

test("P5 — 🔴 LA PORTE `Backpack` OUVRE LE SAC B1, et `Storage` n'est plus offert sans écran", () => {
  /* ⚖️ Eric, 18/09, devant l'ancien écran : *« rassure-moi, ça c'est pas le backpack
     sur lequel t'es en train de bosser ? »*. Non — et la porte a basculé le soir même,
     APRÈS vérification dans la vraie application.
     ⛔ CE GARDE TIENT LES DEUX MOITIÉS DU MÊME GESTE, parce qu'elles ne peuvent pas
     être séparées : la porte qui bascule rend l'ancienne liste injoignable, et
     l'ancienne liste était la SEULE porte au monde vers l'écran de la remise. */
  const ecran = stripComments(fs.readFileSync(path.join(UI_DIR, "equipment-step.mjs"), "utf8"));
  assert.match(ecran, /porte === "backpack"\) montrer\("sac"\)/,
    "la porte `Backpack` ouvre le sac B1");
  assert.doesNotMatch(ecran, /porte === "backpack"\) montrer\("sb31"\)/,
    "⛔ elle ne revient pas sur l'ancienne liste");

  /* ⭐ LA RÈGLE QUI EN SORT, ET ELLE VAUT POUR TOUT LE PRODUIT : *une destination
     n'existe que si son écran existe.* Le dropdown le disait déjà pour `Tally` et
     `Craft` — il les montre `actif: false` plutôt que de laisser choisir. `Storage`
     n'avait pas ce garde-fou : deux écrans l'offraient vers un endroit devenu
     invisible, et un objet envoyé là n'aurait plus jamais pu être regardé. */
  const pipeline = stripComments(fs.readFileSync(path.join(UI_DIR, "equipement-pipeline.mjs"), "utf8"));
  assert.doesNotMatch(pipeline, /\["storage",\s*"Storage"\]/,
    "⛔ `Storage` est offert comme destination alors qu'aucune porte ne mène à son écran : " +
    "c'est un envoi vers l'invisible. Le jour où Eric lui donne une porte, la destination " +
    "revient AVEC elle — pas avant.");
  /* ⛔ ET RIEN N'EST PERDU : le compte de la remise se lit toujours, sur la 4ᵉ ligne
     du panneau de poids. Un objet déjà rangé là est compté, pas effacé. */
  assert.match(ecran, /autre: mot\(p\.compte\.storage/,
    "la ligne `Other` doit continuer de dire ce qui est rangé à la remise");
});
test("P8 — 🔴 UNE SEULE LISTE DE SECTIONS, et c'est CELLE QU'ON REGARDE", () => {
  /* 🔴 LA FAUTE, MESURÉE DANS L'APPLICATION LE 19/09 AU SOIR. Le rendu composait
     `[party, …les miennes]` — le party a pris la tête ce jour-là — pendant que
     `surPlacer` recomposait `[…les miennes, party]` pour retrouver la section visée.
     Or l'index du viseur (`sectionSac`) compte sur ce qu'on VOIT. Les deux listes
     divergeaient donc par leur ORDRE **et** par leur SOURCE (`currentSections` seul
     contre le socle complété), et `Math.min(…, length - 1)` bornait l'écart au lieu
     de le crier.
     📏 CE QUE ÇA FAISAIT : un objet lâché sur une case de `Backpack dropdown` partait
     dans `Party bag`, et de là — sa clef n'étant pas `sN` — ressortait **équipé sur le
     corps**. Trois pas, aucun cri, 2324 témoins verts.
     ⭐ C'EST LA TROISIÈME VICTIME DU MÊME DÉPLACEMENT (après la boîte par défaut des
     envois et le viseur du `+`) : *une position déduite d'une liste qu'on réordonne
     est une bombe à retardement*. On ne la désamorce qu'en n'ayant qu'UNE liste. */

  /* ① LE PARTY OUVRE LA LISTE — Eric, 19/09 */
  const nue = sectionsDuSac({});
  assert.equal(nue[0].index, SECTION_PARTY.clef, "⚖️ *« Party inventory · Backpack dropdown · Storage 1… »*");
  assert.equal(nue[0].party, true);
  assert.equal(nue[0].renommable, false, "⛔ on ne rebaptise pas une place qu'on n'a pas faite");

  /* ② LE DÉPÔT EST LE PREMIER DES MIENNES, ⛔ pas le premier de la liste */
  assert.equal(nue[1].index, SECTION_DEPOT, "c'est là que tombe un envoi sans boîte");
  assert.equal(nue.length, 1 + SECTIONS_DU_SAC, "le party, puis les six du socle");

  /* ③ UNE SECTION AJOUTÉE SE RANGE APRÈS LE SOCLE, et le party garde la tête */
  const avecUne = sectionsDuSac({ build: { choices: [
    { path: `backpack.sections[${SECTIONS_DU_SAC}].name`, value: "Cheval" }] } });
  assert.equal(avecUne[0].index, SECTION_PARTY.clef, "⛔ une section neuve ne détrône pas le party");
  assert.equal(avecUne.length, 1 + SECTIONS_DU_SAC + 1);
  assert.equal(avecUne[avecUne.length - 1].nom, "Cheval");

  /* ④ ET IL N'Y A PLUS DE SECONDE COMPOSITION DANS LE FICHIER — ⛔ c'était ÇA, la faute */
  const source = stripComments(fs.readFileSync(path.join(UI_DIR, "equipment-step.mjs"), "utf8"));
  const compositions = [...source.matchAll(/SECTION_PARTY\.clef,\s*nom:\s*SECTION_PARTY\.nom/g)].length;
  assert.equal(compositions, 1,
    "⛔ le party ne se compose dans une liste qu'à UN endroit : `sectionsDuSac`.\n" +
    "   Une seconde composition rediverge au premier réordonnancement — elle l'a déjà fait.");
});
test("P9 — 🔴 UNE SECTION MONTRE CE QU'ELLE CONTIENT, ⛔ pas seulement ce qui pèse", () => {
  /* 🔴 LA FAUTE, MESURÉE DANS L'APPLICATION LE 19/09 AU SOIR, et elle était SILENCIEUSE
     À MOITIÉ — ce qui est pire qu'un silence entier. Un objet envoyé au `Party bag`
     était rangé POUR DE VRAI : le panneau affichait « Other · 1 item », le sac avait
     perdu sa ligne, rien n'était équipé. ⛔ Et sa section le montrait **vide**, parce
     que le filtre ne retenait que `location: "backpack"`.
     ⭐ UN COMPTE JUSTE NE DIT RIEN DU CONTENU : c'est la règle du corpus, prise en
     défaut par son propre écran.
     ⚠️ ET L'ÉLARGIR NAÏVEMENT RÉVEILLAIT DES FANTÔMES : la REMISE (SB3.3) porte elle
     aussi `storage`, mais SANS boîte — or une ligne sans boîte tombe au DÉPÔT. Toute
     la remise y serait apparue. Le départage est donc fin, et ce garde le tient. */
  const DEPOT = boiteDeSection(SECTION_DEPOT);
  const PARTY = boiteDeSection(SECTION_PARTY.clef);
  const l = (index, location, boite, place) => ({ index, location, ...(boite ? { boite } : {}), ...(place === undefined ? {} : { place }) });

  const lignes = [
    l(1, "backpack", DEPOT, 0),      /* dans le dépôt, nommé */
    l(2, "backpack", undefined, 1),  /* sans boîte → le dépôt, c'est le défaut */
    l(3, "storage", PARTY, 0),       /* 🔴 le sac du groupe : rangé, et il doit SE VOIR */
    l(4, "storage", undefined),      /* ⚠️ LA REMISE : storage SANS boîte */
    l(5, "self", "tete1"),           /* porté */
    l(6, "ground", "sol1"),          /* au sol */
  ];

  assert.deepEqual(lignesDeSection(lignes, DEPOT, DEPOT).map((x) => x.index), [1, 2],
    "⭐ le dépôt prend les siennes ET celles qui ne nomment pas de boîte");
  assert.deepEqual(lignesDeSection(lignes, PARTY, DEPOT).map((x) => x.index), [3],
    "🔴 le party bag montre ce qu'on lui a envoyé — c'est la faute du 19/09");
  assert.ok(!lignesDeSection(lignes, DEPOT, DEPOT).some((x) => x.index === 4),
    "⛔ ET LA REMISE NE TOMBE PAS DANS LE DÉPÔT : elle est `storage` SANS boîte, donc elle n'est d'aucune section");
  assert.deepEqual(lignesDeSection(lignes, boiteDeSection(1), DEPOT).map((x) => x.index), [],
    "une section vide reste vide");
  for (const b of [DEPOT, PARTY]) {
    assert.ok(!lignesDeSection(lignes, b, DEPOT).some((x) => [5, 6].includes(x.index)),
      "⛔ ni le porté ni le sol n'entrent dans une section du sac");
  }
});
test("P10 — 🔴 UNE PLACE NEUVE SE COMPTE DANS SA SECTION, ⛔ pas dans tout le sac", () => {
  /* 🔴 LA FAUTE, MESURÉE À L'ÉCRAN LE 19/09 AU SOIR, et c'est la QUATRIÈME du même
     genre en un jour. `lignesDeSection` prend DEUX boîtes : celle qu'on veut, et celle
     où vivent les lignes qui n'en nomment aucune. La coquille passait la MÊME aux deux
     places. Envoyer un objet vers le `Party bag` faisait donc compter TOUT le sac comme
     étant déjà dans le party — la première place libre tombait à 7, et l'objet
     atterrissait au milieu d'une section vide, sans que rien ne crie.
     ⭐ *Un défaut exprimé par la POSITION d'un argument est un défaut qu'on redonne faux
     un jour.* Le dépôt se NOMME maintenant, dans `placeNeuveDans`, une seule fois. */
  const PARTY = boiteDeSection(SECTION_PARTY.clef);
  /* sept objets du sac qui ne nomment PAS leur boîte : ils vivent au dépôt */
  const sansBoite = [...Array(7).keys()].map((i) => ({ index: i, location: "backpack", place: i }));

  assert.equal(placeNeuveDans(sansBoite, PARTY, CASES_DU_SAC), 0,
    "⭐ le party est VIDE : le premier objet qu'on y envoie va en haut à gauche");
  assert.equal(placeNeuveDans(sansBoite, boiteDeSection(SECTION_DEPOT), CASES_DU_SAC), 7,
    "⛔ et dans le DÉPÔT, les sept comptent bel et bien — c'est là qu'elles vivent");

  /* ⭐ ET UNE SECTION QUI PORTE DÉJÀ COMPTE LES SIENNES, pas celles des voisines */
  const melange = [...sansBoite,
    { index: 20, location: "storage", boite: PARTY, place: 0 },
    { index: 21, location: "storage", boite: PARTY, place: 1 }];
  assert.equal(placeNeuveDans(melange, PARTY, CASES_DU_SAC), 2,
    "deux dans le party → la place 2 ; ⛔ les sept du dépôt n'y sont pour rien");

  /* ⭐ ET LE TROU SE REMPLIT AVANT LA FIN — *« prochain emplacement dispo »* */
  const troue = [{ index: 30, location: "storage", boite: PARTY, place: 0 },
                 { index: 31, location: "storage", boite: PARTY, place: 2 }];
  assert.equal(placeNeuveDans(troue, PARTY, CASES_DU_SAC), 1, "le trou d'abord, pas la fin");
});
test("P11 — ⚖️ L'ORDRE DES SECTIONS SURVIT AU PERSONNAGE, et le party se déplace aussi", () => {
  /* ⚖️ Eric, 19/09 au soir : *« edit mode comprenant le déplacement des storage »*, et
     pour le sac du groupe : *« on peut changer sa position, mais pas l'effacer ni la
     renommer »*. ⭐ Donc l'ordre PORTE le party — et c'est ce qui a forcé la forme.
     📏 MESURÉ CONTRE LE MOTEUR AVANT D'ÊTRE ÉCRIT (protocole P1) : un scalaire par
     section passe propre. ⛔ ET LA LISTE A ÉTÉ REFUSÉE, mot pour mot : *« set n'accepte
     qu'un scalaire — une structure serait une règle déguisée »*. L'ordre est donc N
     scalaires, jamais un tableau, et le party a SON chemin puisqu'il n'a pas d'index. */

  /* ① LES DEUX CHEMINS, ET POURQUOI ILS SONT DEUX */
  assert.equal(cheminDuRang(3), "backpack.sections[3].rang");
  assert.equal(cheminDuRang(SECTION_PARTY.clef), CHEMIN_RANG_PARTY,
    "⛔ la clef du party est un MOT : son rang ne peut pas vivre sous `sections[N]`");

  /* ② LE LECTEUR PREND LES DEUX */
  const doc = { build: { choices: [
    { path: CHEMIN_RANG_PARTY, value: 2 },
    { path: "backpack.sections[0].rang", value: 0 },
    { path: "backpack.sections[1].rang", value: 1 }] } };
  const rangs = rangsDesSections(doc);
  assert.equal(rangs.get(SECTION_PARTY.clef), 2);
  assert.equal(rangs.get(0), 0);

  /* ③ ET LA ROUE OBÉIT — le party n'ouvre plus la liste s'il a été déplacé */
  const vue = sectionsDuSac(doc).map((x) => x.index);
  assert.deepEqual(vue.slice(0, 3), [0, 1, SECTION_PARTY.clef],
    "⚖️ *« on peut changer sa position »* — le party est descendu en 3ᵉ, et la roue le suit");

  /* ④ 🔴 CE QUI N'A PAS DE RANG PASSE APRÈS, DANS SON ORDRE NATUREL — et c'est délibéré.
     ⛔ L'inverse (l'ordre naturel qui reprend la main dès qu'un rang manque) aurait fait
     s'effondrer tout le rangement du joueur à la PREMIÈRE section créée ensuite. */
  /* ⛔ LE RESTE SE DÉDUIT DU SOCLE, il ne se retape pas : j'avais écrit `[2, 3, 4, 5]`
     en croyant le socle à six, et il en porte QUATRE. Un nombre recopié dans un garde
     est un nombre qui ment le jour où la source bouge — ici il a menti tout de suite. */
  const restantes = [...Array(SECTIONS_DU_SAC).keys()].filter((i) => i >= 2);
  assert.deepEqual(vue.slice(3), restantes,
    "les sans-rang suivent, dans leur ordre naturel — une section neuve apparaît au bout");

  /* ⑤ UN SAC VIERGE GARDE L'ORDRE NATUREL : le party ouvre la liste (19/09) */
  assert.equal(sectionsDuSac({})[0].index, SECTION_PARTY.clef);

  /* ⑥ ⛔ ET LE TRI EST TOTAL : à rang égal — ce qui ne devrait pas arriver, puisqu'un
     déplacement RENUMÉROTE tout — c'est la place naturelle qui départage. Un tri qui
     laisse deux éléments interchangeables rend un ordre différent d'un rendu à l'autre,
     et personne ne voit pourquoi l'écran bouge. */
  const exaequo = { build: { choices: [
    { path: "backpack.sections[0].rang", value: 1 },
    { path: "backpack.sections[2].rang", value: 1 }] } };
  const a = sectionsDuSac(exaequo).map((x) => x.index);
  const b = sectionsDuSac(exaequo).map((x) => x.index);
  assert.deepEqual(a, b, "deux rendus, le même ordre");
  assert.ok(a.indexOf(0) < a.indexOf(2), "⭐ à rang égal, la place naturelle tranche");
});
