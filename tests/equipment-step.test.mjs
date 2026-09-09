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
  orDeLaProse, orDeLaSource, origineDuDepart, orDuDepart
} = await import("../ui/builder/equipment-step.mjs");

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
test("⛔ l'étape Équipement OUVRE SUR B3, et une seule vue vit à la fois (l'inversion du 24/08)", () => {
  /* 🔴 RÉÉCRIT À LA NOUVELLE VÉRITÉ LE 2026-08-24, ET NON RELÂCHÉ. Ce garde
     exigeait « la carte de R, seule » ; Eric a INVERSÉ les positions le jour
     même (*« inverse les positions de R et de B3 »*) : le dressing devient
     l'écran d'entrée, le catalogue vit derrière son bouton Equipment.
     Ce que le garde tient n'a pas molli : UNE vue à la fois, et aucun organe
     mort ne revient. */
  const node = renderEquipmentStep({
    document: fixture.document, resolved: fixture.resolved, query
  }, () => {});

  assert.equal(rows(node, ".b3-scene").length, 1, "le dressing est l'écran d'entrée");
  assert.equal(rows(node, ".carte-r").length, 0, "et le catalogue n'est PAS monté en même temps — une vue à la fois");

  const porte = node.querySelector('[aria-label="Equipment"]');
  assert.ok(porte, "la barre B3 porte la porte vers le catalogue");
  porte.click();
  assert.equal(rows(node, ".carte-r").length, 1, "Equipment ouvre le catalogue…");
  assert.equal(rows(node, ".b3-scene").length, 0, "…et le dressing s'efface — jamais deux vues empilées");

  const gear = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "GEAR");
  assert.ok(gear, "la carte R porte GEAR");
  gear.click();
  assert.equal(rows(node, ".b3-scene").length, 1, "GEAR ramène au dressing — l'aller-retour est complet");

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
test("garde — shell.mjs retire VRAIMENT les trois chemins de removeGearLine (pas seulement le ref)", () => {
  const shellText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(shellText, /\[""\s*,\s*"\.quantity"\s*,\s*"\.equipped"\]/,
    "sans les trois suffixes, un retrait laisserait `gear[N].quantity`/`gear[N].equipped` orphelins dans build.choices");
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
