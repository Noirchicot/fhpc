/* ══ LOT 388 — LA BASE PASSE DE v2 À v3 SANS RIEN PERDRE ═══════════════════════════════════════
   Demande d'ARCHI 35 (30/09), avant la fusion : Eric a de VRAIES données sur son iPad — Ilyra dans My
   characters, ses versions datées, le réglage de lieu, la connexion Dropbox. La v3 ajoute le rayon
   `livres` ; il faut montrer qu'aucune donnée n'est perdue à la montée, octet pour octet.
   ⚠️ R4 (sauvegarde-374) ne le prouve PAS : il lit deux constantes (`BASE_VERSION`, `RAYONS`), jamais une
   base ouverte. Une montée qui recrée un rayon existant garde les deux constantes et vide Ilyra.

   🔴 CE QUE CE FICHIER GARDE, ET SUR QUOI :
     B0. LE TÉMOIN — la fausse IndexedDB (`fausse-indexeddb.mjs`) a les règles de la vraie qui décident
         d'une montée : les mêmes erreurs, la montée annulée qui rend la base intacte. 📏 Relevées au
         navigateur réel le 30/09 (Chrome du panneau, v938, port 8979, base jetable `fhpc-temoin-388`) :
         `ConstraintError` puis base toujours en v1 avec sa valeur ; `VersionError` ; `NotFoundError`.
     B1. LA MONTÉE — une base v2 REMPLIE PAR LE VRAI CODE (l'appareil, Vault, la connexion Dropbox, la
         synchro, la reprise), bâtie comme sur l'iPad (v1 puis v2), ouverte par le vrai `baseIndexedDb` :
         chaque valeur, relue, a les mêmes octets (`v8.serialize`, le clonage structuré de V8) ; puis les
         vrais lecteurs la relisent ; et le rayon `livres` est là, vide, et tient un livre.
     B2. LA RÉOUVERTURE — le démarrage suivant ne remonte pas : aucune montée, et tout est encore là.
     B4–B6. LES DEUX ONGLETS (ARCHI 35, 30/09 : la réponse (b), dans ce lot) — un onglet ancien qui tient la
         base fait DIRE la cause et la sortie à l'onglet neuf, qui s'ouvre seul ensuite ; une base que demande
         une version plus neuve se FERME et le dit ; la coquille les câble.
   ⚠️ La COPIE DE TRAVAIL (`fhpc.base`) vit dans `localStorage` (memoire.mjs), hors de la base : la montée
   ne peut pas la toucher, et B3 le garde. La poignée de dossier (`destination`) n'est pas dans la
   fixture : elle ne se clone pas sous Node, et l'iPad n'en a pas (Safari n'a pas `showDirectoryPicker`).
   📏 AU NAVIGATEUR RÉEL (30/09, v938, base jetable effacée après) : la même montée, par le vrai
   `baseIndexedDb`, ne perd rien ; la mutation M1 (un rayon recréé) y vide Ilyra et les réglages (0 et 0) ;
   et ⚠️ un onglet resté OUVERT sur la v2 fait attendre l'onglet neuf — la base s'ouvre, Ilyra intacte, dès
   qu'il se ferme. Une attente, pas une perte — mais un écran MORT sans cause ni sortie : ARCHI 35 a tranché (b),
   dans ce lot, et B4 à B6 la gardent.
   ⛔ Les jetons sont ceux du FAUX Dropbox, et aucun message d'échec ne montre une valeur : seulement
   `rayon/clef`. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import v8 from "node:v8";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";

import { stripComments } from "./source-scan.mjs";
import { fauxDropbox } from "./faux-dropbox.mjs";
import { fausseIndexedDb } from "./fausse-indexeddb.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const {
  baseIndexedDb, BASE_NOM, BASE_VERSION, RAYONS, adaptateurAppareil, creerStockage, choisirUnLieu, lieuRetenu,
  synchroniser, reprendreLesAnciennesSauvegardes, lireLesCommuns, creerLibrairie, librairieAppareil,
  MOT_BASE_TENUE_AILLEURS, MOT_BASE_CEDEE, MOT_RIEN_N_EST_PERDU
} = await import("../ui/builder/magasin.mjs");
const { preparerLaConnexion, retirerLeRetour, terminerLaConnexion, gardienDesJetons, adaptateurDropbox }
  = await import("../ui/builder/dropbox.mjs");
const { canonicalText } = await import("../src/doc/canonical.mjs");

/* L'histoire de la base sur l'iPad : la v1 (lots 195/202) tenait `sauvegardes` et `reglages` ; la v2
   (lot 374, main 715716a6) a AJOUTÉ `personnages`. */
const RAYONS_V1 = ["sauvegardes", "reglages"];
const RAYONS_V2 = ["personnages", "sauvegardes", "reglages"];
const ID = "ilyra-fixture";

function baseDeFixture() {
  const rayons = new Map();
  const rayon = (nom) => { if (!rayons.has(nom)) rayons.set(nom, new Map()); return rayons.get(nom); };
  const clone = (v) => (v === null || v === undefined ? v : structuredClone(v));
  return {
    rayons,
    lire: async (nom, clef) => (rayon(nom).has(clef) ? clone(rayon(nom).get(clef)) : null),
    ecrire: async (nom, clef, valeur) => { rayon(nom).set(clef, clone(valeur)); },
    effacer: async (nom, clef) => { rayon(nom).delete(clef); },
    tout: async (nom) => [...rayon(nom).entries()].map(([clef, valeur]) => ({ clef, valeur: clone(valeur) })),
    echanger: async (nom, clef, decider) => {
      const suivante = decider(rayon(nom).has(clef) ? clone(rayon(nom).get(clef)) : null);
      if (suivante !== undefined) rayon(nom).set(clef, clone(suivante));
    }
  };
}
function perso({ nom = "Ilyra", modified = "2026-09-30T05:00:00Z" } = {}) {
  return {
    schema: "fh-char/1", id: ID, name: nom, lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-30T04:00:00Z", modified,
    build: { layers: [], choices: [], budgets: {}, overrides: [] }
  };
}
function livre() {
  return new TextEncoder().encode(JSON.stringify({
    schema: "fh-layer/1", id: "xphb-en", version: "0.0.1-fixture", name: "Fixture Handbook — é", lang: "en", flags: [],
    attribution: { license: "fixture — not a real book" }, records: {}
  }, null, 2));
}
const maintenant = () => 1_000_000;

/** ⭐ CE QUE L'IPAD TIENT, écrit par le VRAI code sur une base de fixture : Ilyra sauvée deux fois (deux
 *  versions datées), Dropbox connecté puis choisi dans Vault, une synchro (le commun), la reprise faite. */
async function ceQueLIpadTient() {
  const base = baseDeFixture();
  const appareil = adaptateurAppareil(base);
  const v1 = perso();
  const e1 = await appareil.ecrire(ID, canonicalText(v1), null, v1, { garder: "2026-09-29T20:14:05Z" });
  const v2 = perso({ nom: "Ilyra of Varn", modified: "2026-09-30T09:00:00Z" });
  const e2 = await appareil.ecrire(ID, canonicalText(v2), e1.revision, v2, { garder: "2026-09-30T09:00:12Z" });
  assert.ok(e1.ok && e2.ok, "la fixture : Ilyra est sauvée deux fois");

  const faux = fauxDropbox();
  const adresse = await preparerLaConnexion({ crypto: webcrypto, base, location: { origin: "https://noirchicot.github.io", pathname: "/fhpc/ui/builder/index.html" } });
  const retour = retirerLeRetour(new URL(faux.autoriser(adresse)), { state: null, replaceState() {} });
  assert.equal((await terminerLaConnexion({ retour, base, http: faux.http, maintenant })).etat, "connecte");
  assert.equal((await choisirUnLieu(base, "dropbox", { connecte: true })).etat, "choisi");
  const jetons = gardienDesJetons({ base, http: faux.http, maintenant });
  const s = await synchroniser({ appareil: creerStockage(appareil), loin: creerStockage(adaptateurDropbox({ http: faux.http, jetons })), base, lieu: "dropbox" });
  assert.notEqual(s.etat, "refus", "la fixture : la synchro passe");
  await reprendreLesAnciennesSauvegardes(base);
  return { base, faux };
}

/** Ouvrir la fausse base à une version, en créant les rayons qui manquent — la montée des versions d'AVANT. */
function ouvrir(idb, version, rayons) {
  return new Promise((resoudre, rejeter) => {
    const r = idb.open(BASE_NOM, version);
    r.onupgradeneeded = () => { for (const n of rayons) if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n); };
    r.onsuccess = () => resoudre(r.result);
    r.onerror = () => rejeter(r.error);
  });
}
const fin = (r) => new Promise((resoudre, rejeter) => { r.onsuccess = () => resoudre(r.result); r.onerror = () => rejeter(r.error); });

/** L'iPad tel qu'il est : une base v1, montée en v2 par le lot 374, puis remplie. */
async function uneBaseV2Remplie() {
  const { base, faux } = await ceQueLIpadTient();
  const idb = fausseIndexedDb();
  (await ouvrir(idb, 1, RAYONS_V1)).close();
  const db = await ouvrir(idb, 2, RAYONS_V2);
  for (const rayon of RAYONS_V2) {
    for (const [clef, valeur] of base.rayons.get(rayon) || []) {
      await fin(db.transaction(rayon, "readwrite").objectStore(rayon).put(valeur, clef));
    }
  }
  db.close();                                  // la page v2 s'est fermée (un rechargement) : rien ne tient la base
  return { idb, avant: base.rayons, faux };
}

/** Octet pour octet : le clonage structuré de V8, sur la valeur tenue AVANT et relue APRÈS. */
async function toutEstLa(v3, avant) {
  for (const rayon of RAYONS_V2) {
    const attendus = [...(avant.get(rayon) || new Map())].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const relus = await v3.tout(rayon);
    assert.deepEqual(relus.map((r) => r.clef), attendus.map(([clef]) => clef), `⛔ ${rayon} : les clefs ont changé`);
    for (const [i, [clef, valeur]] of attendus.entries()) {
      assert.ok(v8.serialize(relus[i].valeur).equals(v8.serialize(valeur)), `⛔ ${rayon}/${clef} n'a plus les mêmes octets`);
    }
  }
}

test("B0 — 📏 LE TÉMOIN : la fausse IndexedDB refuse et annule comme la vraie (relevé au navigateur, 30/09)", async () => {
  const idb = fausseIndexedDb();
  const db = await ouvrir(idb, 1, ["reglages"]);
  await fin(db.transaction("reglages", "readwrite").objectStore("reglages").put({ id: "dropbox" }, "lieu"));
  db.close();
  /* une montée qui crée un rayon EXISTANT : `ConstraintError`, la montée est annulée, la base reste en v1 */
  const r = idb.open(BASE_NOM, 2);
  r.onupgradeneeded = () => { r.result.createObjectStore("reglages"); };
  await assert.rejects(fin(r), (e) => e.name === "AbortError", "createObjectStore d'un rayon existant annule la montée");
  assert.equal(idb.bases.get(BASE_NOM).version, 1, "⛔ la montée annulée rend la base intacte, version comprise");
  assert.deepEqual([...idb.bases.get(BASE_NOM).rayons.keys()], ["reglages"], "et ses rayons");
  assert.deepEqual(idb.bases.get(BASE_NOM).rayons.get("reglages").get("lieu"), { id: "dropbox" }, "et sa valeur");
  /* ouvrir plus bas : `VersionError` ; un rayon absent : `NotFoundError` */
  const trop = fausseIndexedDb();
  (await ouvrir(trop, 3, ["reglages"])).close();
  await assert.rejects(ouvrir(trop, 2, []), (e) => e.name === "VersionError", "ouvrir plus bas que la version tenue");
  const ouverte = await ouvrir(trop, 3, []);
  assert.throws(() => ouverte.transaction("livres", "readonly"), (e) => e.name === "NotFoundError", "un rayon absent");
});

test("B1 — 🔴 UNE BASE v2 REMPLIE, OUVERTE EN v3 : tout est là, octet pour octet, et relu par les vrais lecteurs", async () => {
  assert.equal(BASE_VERSION, 3);
  const { idb, avant, faux } = await uneBaseV2Remplie();
  /* 📏 TÉMOIN : la fixture tient bien ce que l'iPad tient — par NOM, pas par compte */
  assert.deepEqual([...avant.get("personnages").keys()], [ID], "Ilyra dans My characters");
  assert.equal(avant.get("sauvegardes").size, 2, "ses deux versions datées");
  assert.deepEqual([...avant.get("reglages").keys()].sort(), ["dropbox", "lieu", "reprise-374", "synchro-dropbox"],
    "les jetons Dropbox, le lieu, la reprise, le commun de synchro");
  assert.equal(idb.bases.get(BASE_NOM).version, 2, "la base de départ est bien en v2");
  assert.deepEqual([...idb.bases.get(BASE_NOM).rayons.keys()].sort(), [...RAYONS_V2].sort());

  const v3 = baseIndexedDb(idb);
  await toutEstLa(v3, avant);
  assert.equal(idb.bases.get(BASE_NOM).version, 3, "la base est montée en v3");
  assert.deepEqual(idb.montees.at(-1), { nom: BASE_NOM, de: 2, a: 3 });
  assert.deepEqual([...idb.bases.get(BASE_NOM).rayons.keys()].sort(), [...RAYONS].sort(), "les quatre rayons, pas un de plus");

  /* et les VRAIS lecteurs relisent ce que le joueur voit */
  const appareil = adaptateurAppareil(v3);
  const ilyra = await appareil.lire(ID);
  assert.equal(ilyra.texte, avant.get("personnages").get(ID).texte, "Ilyra, sa copie courante");
  assert.equal(JSON.parse(ilyra.texte).name, "Ilyra of Varn");
  assert.equal((await appareil.versions(ID)).length, 2, "ses deux versions datées");
  assert.equal(await lieuRetenu(v3), "dropbox", "le lieu choisi dans Vault");
  assert.equal(await gardienDesJetons({ base: v3, http: faux.http, maintenant }).connecte(), true, "Dropbox toujours connecté");
  assert.ok((await lireLesCommuns(v3, "dropbox"))[ID], "le commun de synchro d'Ilyra");

  /* le rayon neuf est là, VIDE, et tient un livre */
  assert.deepEqual(await v3.tout("livres"), [], "le rayon des livres naît vide");
  const librairie = creerLibrairie(librairieAppareil(v3));
  assert.equal((await librairie.ranger(livre())).ok, true);
  assert.deepEqual((await librairie.lister()).ids, ["xphb-en"]);
  await toutEstLa(v3, avant);
});

test("B2 — 🔁 LE DÉMARRAGE SUIVANT ne remonte pas : aucune montée, et tout est encore là", async () => {
  const { idb, avant } = await uneBaseV2Remplie();
  await toutEstLa(baseIndexedDb(idb), avant);
  const montees = idb.montees.length;
  await toutEstLa(baseIndexedDb(idb), avant);
  assert.equal(idb.montees.length, montees, "⛔ une base déjà en v3 ne remonte pas");
});

test("B3 — 🗂️ LA MONTÉE NE TOUCHE QUE LA BASE : la copie de travail (`localStorage`) est hors de sa portée", () => {
  const magasin = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "magasin.mjs"), "utf8"));
  const i = magasin.indexOf("export function baseIndexedDb(");
  assert.ok(i > 0);
  const corps = magasin.slice(i, magasin.indexOf("\nfunction ", i));
  assert.equal(/localStorage|sessionStorage/.test(corps), false, "⛔ la base n'écrit pas la copie de travail");
  /* ⭐ et la montée ne fait qu'AJOUTER : aucun effacement de rayon, aucun vidage */
  assert.equal(/deleteObjectStore|\.clear\(/.test(corps), false, "⛔ la montée n'efface ni ne vide aucun rayon");
});

/* ══ LES DEUX ONGLETS ═══════════════════════════════════════════════════════════════════════════════ */

/** Une promesse encore en attente après `ms` ? (jamais une garde qui pend : elle dit « en attente »). */
const enAttente = (p, ms = 30) => Promise.race([p.then(() => false, () => false), new Promise((ok) => setTimeout(() => ok(true), ms))]);

test("B4 — 🔒 UN ONGLET ANCIEN TIENT LA BASE : l'onglet neuf DIT la cause et la sortie, puis s'ouvre SEUL, Ilyra intacte", async () => {
  const { idb, avant } = await uneBaseV2Remplie();
  /* l'onglet d'hier, en v2 : sa connexion reste ouverte, et il n'écoute pas `versionchange` (le code v937) */
  const ancien = await ouvrir(idb, 2, []);
  const signaux = [];
  const v3 = baseIndexedDb(idb, { signaler: (e) => signaux.push(e) });
  const lecture = v3.tout("personnages");
  assert.equal(await enAttente(lecture), true, "la montée attend l'onglet ancien (le navigateur réel aussi)");
  assert.deepEqual(signaux, ["bloquee"], "⛔ l'attente se DIT — jamais un « Loading… » muet");
  assert.match(MOT_BASE_TENUE_AILLEURS, /another tab/, "la cause");
  assert.match(MOT_BASE_TENUE_AILLEURS, /Close the other SOWLREACH tabs/, "la sortie");
  assert.match(MOT_BASE_TENUE_AILLEURS, /by itself/, "et ce qui suit : la page s'ouvre seule");
  ancien.close();                              // Eric ferme l'onglet d'hier
  assert.deepEqual((await lecture).map((r) => r.clef), [ID], "⭐ la page s'ouvre seule, Ilyra là");
  assert.deepEqual(signaux, ["bloquee", "ouverte"], "et le dit : le mot tombe");
  await toutEstLa(v3, avant);
});

test("B5 — 🚪 UNE VERSION PLUS NEUVE DEMANDE LA BASE : l'onglet se FERME (il ne la bloque pas), le dit, et ses verbes refusent avec ce mot", async () => {
  const { idb, avant } = await uneBaseV2Remplie();
  const signaux = [];
  const ici = baseIndexedDb(idb, { signaler: (e) => signaux.push(e) });
  await toutEstLa(ici, avant);
  /* un autre onglet, d'une version encore plus neuve, demande la base */
  const r = idb.open(BASE_NOM, 4);
  r.onupgradeneeded = () => {};
  const neuve = fin(r);
  assert.equal(await enAttente(neuve, 200), false, "⛔ l'onglet ne bloque pas la version plus neuve : il s'est fermé");
  (await neuve).close();
  assert.deepEqual(signaux, ["ouverte", "cedee"], "il le DIT");
  await assert.rejects(ici.tout("personnages"), (e) => e.message === MOT_BASE_CEDEE, "⭐ chaque verbe refuse avec le mot — jamais un InvalidStateError");
  assert.match(MOT_BASE_CEDEE, /another tab/, "la cause");
  assert.match(MOT_BASE_CEDEE, /reload this page/, "la sortie");
  assert.match(MOT_RIEN_N_EST_PERDU, /Nothing is lost/);
  /* ⭐ et rien n'est perdu : la base, en v4, tient tout (relue à SA version : un code v3 y serait refusé) */
  await toutEstLa(baseIndexedDb({ open: (nom) => idb.open(nom) }), avant);
});

test("B6 — 🧷 LA COQUILLE LES CÂBLE : la fenêtre du blocage, qui tombe seule ; la fenêtre de la base cédée, et My characters", () => {
  const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));
  assert.match(shell, /baseIndexedDb\(fenetre \? fenetre\.indexedDB : undefined, \{ signaler: quandLaBaseSignale \}\)/, "la base de la page signale à la coquille");
  const i = shell.indexOf("function quandLaBaseSignale(etat) {");
  assert.ok(i > 0);
  const corps = shell.slice(i, shell.indexOf("\n}\n", i));
  const branche = (etat) => { const j = corps.indexOf(`etat === "${etat}"`); assert.ok(j > 0, etat); const k = corps.indexOf("} else if", j + 1); return corps.slice(j, k > 0 ? k : undefined); };
  const bloquee = branche("bloquee");
  assert.match(bloquee, /fenetreDuBlocage = \{ titre: "My characters", role: "gendarme", texte: MOT_BASE_TENUE_AILLEURS \}/);
  assert.match(bloquee, /state\.popup = fenetreDuBlocage;/);
  assert.match(bloquee, /refresh\(\)/, "la fenêtre se montre tout de suite");
  const ouverte = branche("ouverte");
  assert.match(ouverte, /if \(state\.popup === fenetreDuBlocage\) state\.popup = null;/, "⛔ la fenêtre tombe seule — seulement si c'est encore LA SIENNE");
  const cedee = branche("cedee");
  assert.match(cedee, /state\.popup = \{ titre: "My characters", role: "gendarme", texte: `\$\{enPhrase\(MOT_BASE_CEDEE\)\}\\n\\n\$\{MOT_RIEN_N_EST_PERDU\}` \}/);
  assert.match(cedee, /state\.personnagesListe = \{ etat: "refus", raison: MOT_BASE_CEDEE \}/, "My characters le dit aussi");
  /* ⏳ les mots sont des brouillons, et NORMES les porte tels quels */
  const normes = fs.readFileSync(path.join(ROOT, "ui", "builder", "NORMES.md"), "utf8");
  for (const mot of [MOT_BASE_TENUE_AILLEURS, MOT_BASE_CEDEE, MOT_RIEN_N_EST_PERDU]) assert.ok(normes.includes(mot), `NORMES porte : ${mot.slice(0, 40)}…`);
});
