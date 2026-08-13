/* ══ LOT 54 — `src/doc/writers.mjs` : LES DEUX ÉCRIVAINS SANS MAGASIN ═══

   Le trou mesuré par l'architecte (§1 de la commande) : `doc.rename` et
   `doc.describe` sont PURS (le lot 47 l'écrit noir sur blanc pour `rename`),
   mais avant ce lot ils n'existaient QUE dans la fermeture de
   `createDoc({storage, …})`, qui REFUSE de se construire sans magasin — et
   le navigateur n'en a aucun. `src/doc/writers.mjs` les extrait ; ce fichier
   prouve DEUX choses, dans l'ordre :

     0. STRUCTUREL — `store.mjs` n'écrit plus lui-même le corps de `rename`/
        `describe` : il les IMPORTE de `writers.mjs` et les pose comme
        verbes PAR RÉFÉRENCE (`rename,` / `describe,` en raccourci de
        propriété) — jamais `rename(payload) { … }` réécrit à la main. Un
        garde d'octets, comme `tests/ui-jetons.test.mjs` (garde 11) : il
        prouve que le câblage est RÉELLEMENT écrit, pas seulement possible.
     1. ⚔️ LE TEST QUI COMPTE LE PLUS (§3, point 1 de la commande) —
        `doc.verbs.rename`/`.describe` (obtenus en construisant un VRAI bloc
        `doc`, magasin en mémoire) et les fonctions rendues par
        `createDocWriters({schema})` APPELÉ SÉPARÉMENT produisent EXACTEMENT
        le même résultat sur les mêmes entrées — succès ET refus. Deux
        constructions indépendantes de `createDocWriters` ne peuvent pas
        être `===` (deux fermetures neuves), donc l'identité qui compte est
        BEHAVIORALE : appelée avec la même entrée, la fonction du bloc et la
        fonction importable rendent LE MÊME document (ou LA MÊME erreur,
        mot pour mot) — parce qu'en production (test 0) c'est LITTÉRALEMENT
        la même fonction des deux côtés. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DocError } from "../src/doc/index.mjs";
import { createDocWriters } from "../src/doc/writers.mjs";
import { charSchema, makeDoc } from "./doc-harness.mjs";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STORE_PATH = path.join(ROOT, "src", "doc", "store.mjs");

const FT_LB = { distance: "ft", weight: "lb" };
const BASE = { name: "Sonde", lang: "en", units: FT_LB, layers: [] };

/* ══ 0 — STRUCTUREL : store.mjs RÉUTILISE writers.mjs, IL NE LE RECOPIE PAS ═ */

test("0 — store.mjs importe createDocWriters de ./writers.mjs, réellement écrit", () => {
  const text = stripComments(fs.readFileSync(STORE_PATH, "utf8"));
  assert.match(text, /import\s*\{\s*createDocWriters\s*\}\s*from\s*"\.\/writers\.mjs"/,
    "store.mjs doit importer createDocWriters — sinon rename/describe ne peuvent venir que d'une copie locale");
  assert.match(text, /const\s*\{\s*assertValid,\s*rename,\s*describe,[^}]*\}\s*=\s*writers/,
    "les fonctions doivent être déstructurées de l'instance de writers, pas redéfinies");
});

test("0bis — ⚔️ les verbes `rename`/`describe` sont posés PAR RÉFÉRENCE, jamais réécrits", () => {
  const text = stripComments(fs.readFileSync(STORE_PATH, "utf8"));
  /* Le raccourci de propriété ES2015 (`rename,`) POSE LA MÊME FONCTION que
     celle importée — un `rename(payload) { … }` à cet endroit serait une
     SECONDE définition, celle que ce lot existe pour éviter. On cherche donc
     l'ABSENCE d'un corps de fonction nommé `rename`/`describe` dans l'objet
     `verbs`, et la PRÉSENCE du raccourci `rename,`/`describe,`. */
  assert.doesNotMatch(text, /\brename\s*\(\s*payload\s*\)\s*\{/,
    "aucune redéfinition locale de `rename` — le verbe doit venir de writers.mjs, mot pour mot");
  assert.doesNotMatch(text, /\bdescribe\s*\(\s*payload\s*\)\s*\{/,
    "aucune redéfinition locale de `describe` — même raison");
  assert.match(text, /\n\s*rename,\n/, "`rename,` doit apparaître comme raccourci de propriété dans `verbs`");
  assert.match(text, /\n\s*describe,\n/, "`describe,` doit apparaître comme raccourci de propriété dans `verbs`");
});

/* ══ 1 — ⚔️ LE TEST QUI PROUVE LE LOT : MÊME ENTRÉE, MÊME SORTIE ═══════════ */

test("1 — ⚔️ createDocWriters ne demande AUCUN magasin, AUCUN bus", () => {
  /* La preuve directe du §1 : construire les écrivains ne prend QUE le
     schéma — aucun `storage`, aucun `bus`, contrairement à `createDoc`. */
  const writers = createDocWriters({ schema: charSchema() });
  assert.equal(typeof writers.rename, "function");
  assert.equal(typeof writers.describe, "function");
});

test("1bis — ⚔️ createDocWriters SANS schéma refuse, nommant sa raison (même discipline que createDoc)", () => {
  assert.throws(() => createDocWriters({}), /needs a schema/);
  assert.throws(() => createDocWriters(), /needs a schema/);
});

test("2 — ⚔️ rename : le verbe du bloc et l'écrivain importable rendent LE MÊME document", () => {
  const schema = charSchema();
  const { verbs } = makeDoc({ schema });
  const writers = createDocWriters({ schema });

  const draft = verbs.create(BASE);

  const parBloc = verbs.rename({ document: draft, name: "Ilyra" });
  const parEcrivain = writers.rename({ document: draft, name: "Ilyra" });
  assert.deepEqual(parBloc, parEcrivain,
    "même document en entrée, même nom : le bloc et l'écrivain importable rendent des documents identiques");
});

test("2bis — ⚔️ describe : le verbe du bloc et l'écrivain importable rendent LE MÊME document", () => {
  const schema = charSchema();
  const { verbs } = makeDoc({ schema });
  const writers = createDocWriters({ schema });

  const draft = verbs.create(BASE);
  const payload = { document: draft, gender: "iel", alignment: "Chaotic Good (mostly)", campaign: "Nymedes" };

  const parBloc = verbs.describe(payload);
  const parEcrivain = writers.describe(payload);
  assert.deepEqual(parBloc, parEcrivain,
    "mêmes champs décrits : le bloc et l'écrivain importable rendent des documents identiques");
});

test("3 — ⚔️ REFUS COMPRIS : les deux chemins jettent la MÊME erreur, mot pour mot", () => {
  const schema = charSchema();
  const { verbs } = makeDoc({ schema });
  const writers = createDocWriters({ schema });
  const draft = verbs.create(BASE);

  /* Une batterie de refus — chacun rejoué sur les deux chemins. */
  const scenarios = [
    { verb: "rename", payload: { document: draft, name: "" } },                 // nom vide
    { verb: "rename", payload: { document: draft, name: "x".repeat(201) } },    // nom trop long
    { verb: "rename", payload: { document: draft, name: 42 } },                 // pas une chaîne
    { verb: "rename", payload: { document: null, name: "x" } },                 // document absent
    { verb: "describe", payload: { document: draft, gender: "x".repeat(61) } }, // champ trop long
    { verb: "describe", payload: { document: draft, faction: "Les Lames" } },   // hors liste blanche
    { verb: "describe", payload: { document: draft, name: "Vol de nom" } },     // existe, mais requis
    { verb: "describe", payload: { document: draft, generator: { name: "x", version: "1" } } }, // structuré
    { verb: "describe", payload: { document: null } }                          // document absent
  ];

  for (const { verb, payload } of scenarios) {
    let messageBloc = null;
    let messageEcrivain = null;
    let classeBloc = null;
    let classeEcrivain = null;
    try { verbs[verb](payload); } catch (error) { messageBloc = error.message; classeBloc = error.constructor; }
    try { writers[verb](payload); } catch (error) { messageEcrivain = error.message; classeEcrivain = error.constructor; }

    assert.ok(messageBloc !== null, `${verb}(${JSON.stringify(payload)}) doit jeter côté bloc`);
    assert.ok(messageEcrivain !== null, `${verb}(${JSON.stringify(payload)}) doit jeter côté écrivain`);
    assert.equal(messageEcrivain, messageBloc,
      `${verb} : le refus doit être MOT POUR MOT le même des deux côtés`);
    assert.equal(classeBloc, DocError, `${verb} : le refus du bloc est un DocError`);
    assert.equal(classeEcrivain, DocError, `${verb} : le refus de l'écrivain est un DocError`);
  }
});

test("4 — ⚔️ témoins : les bornes exactes qui PASSENT le font aussi des deux côtés", () => {
  const schema = charSchema();
  const { verbs } = makeDoc({ schema });
  const writers = createDocWriters({ schema });
  const draft = verbs.create(BASE);

  const okName = verbs.rename({ document: draft, name: "x".repeat(200) });
  const okNameEcrivain = writers.rename({ document: draft, name: "x".repeat(200) });
  assert.deepEqual(okName, okNameEcrivain);

  const okGender = verbs.describe({ document: draft, gender: "x".repeat(60) });
  const okGenderEcrivain = writers.describe({ document: draft, gender: "x".repeat(60) });
  assert.deepEqual(okGender, okGenderEcrivain);
});
