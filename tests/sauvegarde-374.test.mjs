/* ══ LOT 374 — LA SAUVEGARDE, PREMIÈRE MARCHE ═════════════════════════════════════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 374 sauvegarde.md` (ARCHI 35, 30/09).

   ⚖️ Eric, 28/09 : *« une gestion à l'intérieur […] un sauvegarde à la fin du process de création.
   puis le cache est totalement vidé »* ; 30/09 : **« la sauvegarde c'est la suite »**, **« il faut que
   tout puisse être lisible par la nouvelle fiche »**, et, pour la poubelle en stockage « fichier » :
   **« Efface la copie de l'app »**. La carte produit, § 10 : la sauvegarde automatique, et **l'app
   vérifie avant d'écrire**.

   🔴 CE QUE CE FICHIER GARDE, ET SUR QUOI :
     O. L'ORGANE — une interface (lister · lire · écrire · effacer), la RÉVISION exigée par
        l'interface, deux adaptateurs (l'appareil, le fichier) qui disent ce qu'ils savent faire par
        leurs CAPACITÉS. ⚔️ Une écriture sans révision atteint le lieu → rouge ; l'appareil qui écrase
        une révision périmée → rouge.
     S. LES SÉQUENCES À DEUX LIEUX — sauver (l'app, puis le lieu choisi) et effacer (selon le lieu
        choisi). ⚔️ Un fichier qui part alors que l'app a refusé → rouge ; une poubelle qui efface
        l'app quand le lieu choisi a refusé → rouge.
     R. LA RÉOUVERTURE — l'envoi raté repart, un autre onglet déclenche la question (§ 10).
     A. L'ALLER-RETOUR — le document `fh-char/1` lui-même : écrit, relu, identique, validé par le
        schéma, et redérivé par le vrai moteur sans perte.
     P. LA PAGE — My characters tel que dicté ; la question de la poubelle selon le lieu.
     C. LA COQUILLE — un seul écrivain par lieu, la sauvegarde automatique, `Save character` qui vide
        le cache, la réouverture qui attend le moteur.

   ⚠️ CE QUE CE FICHIER NE PEUT PAS ÉPROUVER, ET IL LE DIT : `indexedDB` n'existe pas sous Node. La
   base est donc prouvée par une base de FIXTURE qui a exactement ses cinq verbes (`lire`, `ecrire`,
   `effacer`, `tout`, `echanger`) ; la base réelle (`baseIndexedDb`, magasin.mjs) est le rideau le plus
   fin possible, sans décision, et elle se prouve au navigateur (rapport du lot). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { readJson } from "./build-harness.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));

const {
  creerStockage, adaptateurAppareil, adaptateurFichier, revisionSuivante, sauverDansLesDeux,
  effacerSelonLeStockage, aLaReouverture, reprendreLesAnciennesSauvegardes, dateDeLaClef,
  MOT_SANS_REVISION, MOT_DE_L_APPAREIL, MOT_DU_FICHIER, BASE_VERSION, RAYONS,
  adaptateurDossier, dossierRetenu, choisirUnDossier, clefDeLEntree, MOT_PERMISSION_PERDUE
} = await import("../ui/builder/magasin.mjs");
const { renderMesPersonnages, ligneDuPersonnage, popupEffacerUnPersonnage, popupDeLaReouverture,
  LIGNES_PAR_PAGE, MOTS_DE_MES_PERSONNAGES } = await import("../ui/builder/mes-personnages.mjs");
const { lireBase, ecrireBase, oublierBase, CLEF_BASE, CLEF_PERSONNAGE } = await import("../ui/builder/memoire.mjs");
const { renderUniverseStep, MOTS_DE_L_ENVOI, sauvegarderPuisEteindre, nouveauPersonnageSelonLaVoie }
  = await import("../ui/builder/universe-step.mjs");
const { canonicalText } = await import("../src/doc/canonical.mjs");
const { createDocWriters } = await import("../src/doc/writers.mjs");
const { recalageDeLaPile } = await import("../ui/builder/recalage.mjs");

/* ── LA BASE DE FIXTURE — la forme de la vraie, pas une forme commode ──────────────────────────
   ⭐ `echanger` exécute la décision DANS le même tour que la lecture, comme la transaction
   IndexedDB : c'est ce qui rend « comparer la révision, puis écrire » indivisible. */
function baseDeFixture() {
  /* ⚠️ Une poignée de dossier ne se clone pas en Node (elle porte des fonctions) ; la vraie base la garde
     par clonage structuré. La fixture la garde donc TELLE QUELLE — le reste est cloné, comme IndexedDB. */
  const structuredClone = (v) => { try { return globalThis.structuredClone(v); } catch (_) { return v; } };
  const rayons = new Map();
  const rayon = (nom) => { if (!rayons.has(nom)) rayons.set(nom, new Map()); return rayons.get(nom); };
  return {
    rayons,
    lire: async (nom, clef) => (rayon(nom).has(clef) ? structuredClone(rayon(nom).get(clef)) : null),
    ecrire: async (nom, clef, valeur) => { rayon(nom).set(clef, structuredClone(valeur)); },
    effacer: async (nom, clef) => { rayon(nom).delete(clef); },
    tout: async (nom) => [...rayon(nom).entries()].map(([clef, valeur]) => ({ clef, valeur: structuredClone(valeur) })),
    echanger: async (nom, clef, decider) => {
      const suivante = decider(rayon(nom).has(clef) ? structuredClone(rayon(nom).get(clef)) : null);
      if (suivante !== undefined) rayon(nom).set(clef, structuredClone(suivante));
    }
  };
}

/** Un personnage de sonde — la forme d'un `fh-char/1`, les choix que la ligne lit. */
function perso({ id = "sonde-kara", nom = "Kara", modified = "2026-09-30T05:00:00Z", campagne, choix = [] } = {}) {
  const doc = {
    schema: "fh-char/1", id, name: nom, lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-30T04:00:00Z", modified,
    build: { layers: [], choices: choix, budgets: {}, overrides: [] }
  };
  if (campagne !== undefined) doc.campaign = campagne;
  return doc;
}
const texte = (doc) => JSON.stringify(doc);
const appareil = (base = baseDeFixture()) => creerStockage(adaptateurAppareil(base));
function fichierEspion() {
  const partis = [];
  const s = creerStockage(adaptateurFichier({
    telecharger: (f) => { partis.push(f); },
    nomDuFichier: (doc, version) => `${doc.name.toLowerCase()}.${version ? `${version}.` : ""}fh-char.json`
  }));
  return { s, partis };
}

/* ══ O — L'ORGANE ═══════════════════════════════════════════════════════════════════════════ */

test("O1 — ⭐ LA RÉVISION EST EXIGÉE PAR L'INTERFACE : une écriture qui ne dit pas ce qu'elle remplace n'atteint AUCUN lieu", async () => {
  /* ⚔️ Un espion à la place du lieu : s'il est appelé, l'interface a laissé passer. */
  let appels = 0;
  const s = creerStockage({ capacites: { liste: false, ecrase: true, efface: false, sansGeste: true, possede: false, lieu: "x" },
    ecrire: async () => { appels += 1; return { ok: true, revision: "r1" }; } });
  for (const attendu of [undefined, null, {}, { revisionn: null }]) {
    const issue = await s.ecrire(texte(perso()), attendu);
    assert.deepEqual(issue, { ok: false, raison: MOT_SANS_REVISION }, `⛔ ${JSON.stringify(attendu)} n'annonce aucune révision`);
  }
  assert.equal(appels, 0, "⛔ le lieu n'a jamais été appelé sans révision");
  assert.deepEqual(await s.ecrire(texte(perso()), { revision: null }), { ok: true, revision: "r1" }, "témoin : `{revision: null}` passe");
  assert.equal(appels, 1);
});

test("O2 — ⚖️ § 10, VÉRIFIER AVANT D'ÉCRIRE : l'appareil refuse une révision périmée, et RIEN n'est écrasé", async () => {
  const base = baseDeFixture();
  const s = appareil(base);
  const v1 = perso({ nom: "Kara" });
  const r1 = await s.ecrire(texte(v1), { revision: null });
  assert.deepEqual(r1, { ok: true, revision: "r1" }, "une naissance dans l'app : r1");
  const r2 = await s.ecrire(texte({ ...v1, name: "Kara II" }), { revision: "r1" });
  assert.deepEqual(r2, { ok: true, revision: "r2" }, "sur la bonne révision : elle avance");
  /* ⚔️ un autre onglet croyait encore tenir r1 */
  const conflit = await s.ecrire(texte({ ...v1, name: "Kara de l'autre onglet" }), { revision: "r1" });
  assert.deepEqual(conflit, { ok: false, conflit: true, revision: "r2" }, "⛔ refusée, avec la révision que l'app tient");
  const lu = await s.lire(v1.id);
  assert.equal(lu.document.name, "Kara II", "⛔ rien n'est écrasé");
  assert.equal(lu.revision, "r2");
  /* ⚔️ une « naissance » d'un perso qui existe déjà est aussi un conflit */
  assert.equal((await s.ecrire(texte(v1), { revision: null })).conflit, true);
});

test("O3 — 🔑 LA RÉVISION EST UN COMPTEUR, et un compteur illisible ne se « répare » pas en silence", () => {
  assert.equal(revisionSuivante(null), "r1");
  assert.equal(revisionSuivante("r1"), "r2");
  assert.equal(revisionSuivante("r41"), "r42");
  assert.equal(revisionSuivante("zz"), "r1", "une révision qui n'est pas du compteur repart de r1 — et le prochain conflit le dira");
});

test("O4 — 🔴 CE QUI EST RANGÉ EST BYTE-IDENTIQUE, et l'organe NE RANGE QUE DES PERSONNAGES", async () => {
  const base = baseDeFixture();
  const s = appareil(base);
  const doc = perso();
  await s.ecrire(texte(doc), { revision: null });
  assert.equal(base.rayons.get("personnages").get(doc.id).texte, texte(doc), "les octets reçus, tels quels");
  for (const [mauvais, mot] of [["", /serialised/], ["{", /not JSON/], [JSON.stringify({ schema: "autre/1" }), /not a Fate's Hand character/],
    [JSON.stringify({ ...doc, id: "" }), /no id/]]) {
    const issue = await s.ecrire(mauvais, { revision: null });
    assert.equal(issue.ok, false);
    assert.match(issue.raison, mot, "le refus NOMME ce qui manque");
  }
});

test("O5 — 🗂️ LISTER : le plus récent en tête, un ordre STABLE, et un illisible se dit À PART", async () => {
  const base = baseDeFixture();
  const s = appareil(base);
  await s.ecrire(texte(perso({ id: "a", nom: "Aldo", modified: "2026-09-29T10:00:00Z" })), { revision: null });
  await s.ecrire(texte(perso({ id: "c", nom: "Cyra", modified: "2026-09-30T10:00:00Z" })), { revision: null });
  await s.ecrire(texte(perso({ id: "b", nom: "Bram", modified: "2026-09-30T10:00:00Z" })), { revision: null });
  base.rayons.get("personnages").set("casse", { texte: "{pas du json", revision: "r1" });
  const liste = await s.lister();
  assert.equal(liste.etat, "liste");
  assert.deepEqual(liste.personnages.map((p) => p.id), ["b", "c", "a"], "à date égale, l'id départage — la liste ne bouge pas toute seule");
  assert.deepEqual(liste.illisibles.map((i) => i.id), ["casse"], "⛔ un illisible ne disparaît pas");
  assert.match(liste.illisibles[0].raison, /not JSON/);
});

test("O6 — 📄 LE FICHIER DIT CE QU'IL NE SAIT PAS FAIRE, par ses capacités — jamais par son nom", async () => {
  const { s, partis } = fichierEspion();
  assert.deepEqual({ ...s.capacites }, { liste: false, ecrase: false, efface: false, sansGeste: false, possede: true, lieu: MOT_DU_FICHIER });
  assert.deepEqual(await s.lister(), { etat: "sans-liste" }, "⛔ pas une liste vide : « je ne sais pas lister »");
  assert.equal((await s.lire("x")).etat, "refus");
  assert.equal((await s.effacer("x")).ok, false, "une page web n'efface pas un fichier rangé par le joueur");
  const doc = perso();
  assert.deepEqual(await s.ecrire(texte(doc), { revision: null, version: "fate-s-hand" }), { ok: true, revision: null });
  assert.deepEqual(partis, [{ nom: "kara.fate-s-hand.fh-char.json", type: "application/json", contenu: texte(doc) }],
    "le téléchargement porte les MÊMES octets, et le nom de la version FH (lot 192)");
  /* et l'appareil, lui, sait tout faire sans un geste — c'est ce qui permet la sauvegarde automatique */
  assert.deepEqual({ ...appareil().capacites }, { liste: true, ecrase: true, efface: true, sansGeste: true, possede: false, lieu: MOT_DE_L_APPAREIL });
});

test("O7 — 🚪 ABSENT N'EST PAS UNE PANNE : `lire` le distingue d'un lieu qui ne répond pas", async () => {
  assert.deepEqual(await appareil().lire("personne"), { etat: "absent" });
  const enPanne = creerStockage(adaptateurAppareil({ ...baseDeFixture(), lire: async () => { throw new Error("QuotaExceededError"); } }));
  assert.deepEqual(await enPanne.lire("x"), { etat: "refus", raison: "QuotaExceededError" });
});

/* ══ S — LES SÉQUENCES À DEUX LIEUX ═════════════════════════════════════════════════════════ */

test("S1 — 💾 SAUVER : la copie de l'app d'abord, le lieu choisi ensuite — et un refus de l'app n'envoie AUCUN fichier", async () => {
  const app = appareil();
  const { s: choisi, partis } = fichierEspion();
  const doc = perso();
  const ok = await sauverDansLesDeux({ appareil: app, choisi, texte: texte(doc), revisionApp: null });
  assert.deepEqual(ok, { ok: true, revision: "r1" });
  assert.equal(partis.length, 1, "le fichier est parti");
  assert.equal((await app.lire(doc.id)).revision, "r1", "et le perso est ENTRÉ dans My characters");
  /* ⚔️ l'app refuse (un autre onglet a écrit) → aucun fichier ne part. (Un perso qui a CHANGÉ : le même,
     à l'estampille près, n'est pas un conflit — E1.) */
  const refus = await sauverDansLesDeux({ appareil: app, choisi, texte: texte({ ...doc, name: "Kara changée" }), revisionApp: null });
  assert.deepEqual(refus, { ok: false, ou: "app", conflit: true, revision: "r1", raison: undefined });
  assert.equal(partis.length, 1, "⛔ un fichier d'un côté et une liste qui ne le connaît pas de l'autre");
  /* le lieu choisi refuse → l'app EST rangée, et sa révision revient */
  const loinRefuse = creerStockage({ capacites: { liste: false, ecrase: false, efface: false, sansGeste: false, possede: true, lieu: "y" },
    ecrire: async () => { throw new Error("download blocked"); } });
  const moitie = await sauverDansLesDeux({ appareil: app, choisi: loinRefuse, texte: texte({ ...doc, name: "Kara changée" }), revisionApp: "r1" });
  assert.deepEqual(moitie, { ok: false, ou: "choisi", revision: "r2", raison: "download blocked" });
});

test("S2 — 🗑️ LA POUBELLE SELON LE LIEU CHOISI : le fichier → la copie de l'app seule ; un lieu qui efface → lui, PUIS l'app", async () => {
  const doc = perso();
  /* Eric, 30/09 : « Efface la copie de l'app » */
  const app = appareil();
  await app.ecrire(texte(doc), { revision: null });
  const { s: fichier } = fichierEspion();
  assert.deepEqual(await effacerSelonLeStockage({ appareil: app, choisi: fichier, id: doc.id }), { ok: true, ou: [MOT_DE_L_APPAREIL] });
  assert.deepEqual(await app.lire(doc.id), { etat: "absent" });
  /* la dictée du 29/09, pour un lieu qui sait effacer : « for good » — le lieu, puis l'app */
  const journal = [];
  const loin = creerStockage({ capacites: { liste: true, ecrase: true, efface: true, sansGeste: true, possede: true, lieu: "Dropbox" },
    ecrire: async () => ({ ok: true, revision: "d1" }), effacer: async (id) => { journal.push(`loin:${id}`); } });
  const app2 = appareil();
  await app2.ecrire(texte(doc), { revision: null });
  assert.deepEqual(await effacerSelonLeStockage({ appareil: app2, choisi: loin, id: doc.id }), { ok: true, ou: ["Dropbox", MOT_DE_L_APPAREIL] });
  assert.deepEqual(journal, [`loin:${doc.id}`]);
  /* ⚔️ le lieu refuse → l'app GARDE sa copie */
  const app3 = appareil();
  await app3.ecrire(texte(doc), { revision: null });
  const refuse = creerStockage({ capacites: { liste: true, ecrase: true, efface: true, sansGeste: true, possede: true, lieu: "Dropbox" },
    ecrire: async () => ({ ok: true, revision: "d1" }), effacer: async () => { throw new Error("offline"); } });
  assert.deepEqual(await effacerSelonLeStockage({ appareil: app3, choisi: refuse, id: doc.id }), { ok: false, raison: "offline" });
  assert.equal((await app3.lire(doc.id)).etat, "lu", "⛔ on n'efface pas la ligne d'un perso qu'on n'a pas su effacer là où il vit");
});

test("S3 — ⚔️ LES DEUX SÉQUENCES D'AVANT (192, 350) RANGENT PAR L'ORGANE, et un refus n'efface toujours rien", async () => {
  /* ⭐ Un espion, pas un double : le `sauvegarder` des deux séquences pures est le VRAI
     `sauverDansLesDeux` sur un vrai organe — c'est ce que la coquille câble via `exporterJson`. */
  const app = appareil();
  const { s: choisi, partis } = fichierEspion();
  let revision = null;
  const sauvegarder = async (doc) => {
    const issue = await sauverDansLesDeux({ appareil: app, choisi, texte: texte(doc), revisionApp: revision });
    if (issue.ok) revision = issue.revision;
    return issue.ok;
  };
  let eteint = false;
  assert.equal(await sauvegarderPuisEteindre({ sauvegarder: () => sauvegarder(perso()), eteindre: () => { eteint = true; } }), true);
  assert.equal(eteint, true);
  let nes = 0;
  assert.equal(await nouveauPersonnageSelonLaVoie({ voie: "save", sauvegarder: () => sauvegarder(perso({ nom: "Kara, plus loin" })),
    oublier: () => {}, naitre: () => { nes += 1; } }), true);
  assert.equal(nes, 1);
  assert.equal(partis.length, 2, "deux gestes, deux fichiers");
  assert.equal((await app.lire("sonde-kara")).revision, "r2", "une copie dans l'app, qui AVANCE — une ligne par perso");
  /* ⚔️ un refus de l'app : ni oubli, ni naissance (la règle du 192) */
  let touche = 0;
  assert.equal(await nouveauPersonnageSelonLaVoie({ voie: "save",
    sauvegarder: async () => (await sauverDansLesDeux({ appareil: app, choisi, texte: texte(perso({ nom: "Kara d'un autre onglet" })), revisionApp: "r1" })).ok,
    oublier: () => { touche += 1; }, naitre: () => { touche += 1; } }), false);
  assert.equal(touche, 0);
});

/* ══ R — LA RÉOUVERTURE (§ 10) ══════════════════════════════════════════════════════════════ */

test("R1 — ⚖️ LA TABLE DE LA RÉOUVERTURE : rien · hors-app · renvoyer · question — et chacun sur SA donnée", () => {
  const travail = { id: "k", texte: "v2" };
  assert.deepEqual(aLaReouverture({ travail: null, base: null, app: null }), { geste: "rien", revision: null });
  assert.deepEqual(aLaReouverture({ travail, base: { id: "k", revision: "r3" }, app: null }), { geste: "hors-app", revision: null },
    "sa poubelle l'a sorti de My characters, ou il n'y est jamais entré");
  assert.deepEqual(aLaReouverture({ travail, base: { id: "k", revision: "r3" }, app: { texte: "v2", revision: "r3" } }), { geste: "rien", revision: "r3" });
  assert.deepEqual(aLaReouverture({ travail, base: { id: "k", revision: "r3" }, app: { texte: "v1", revision: "r3" } }), { geste: "renvoyer", revision: "r3" },
    "même révision, texte différent : un envoi a raté — il repart");
  assert.deepEqual(aLaReouverture({ travail, base: { id: "k", revision: "r3" }, app: { texte: "v9", revision: "r4" } }), { geste: "question", revision: "r4" },
    "⚖️ quelqu'un d'autre a écrit : LA QUESTION, jamais un écrasement");
  assert.deepEqual(aLaReouverture({ travail, base: null, app: { texte: "v1", revision: "r1" } }), { geste: "renvoyer", revision: "r1" },
    "⚠️ sans base (la reprise des sauvegardes datées) : la copie de travail est la plus récente");
});

test("R2 — 🗄️ LA REPRISE DES SAUVEGARDES DATÉES : la plus récente de chaque perso, UNE fois, sans rien effacer", async () => {
  const base = baseDeFixture();
  const sauv = base.rayons.set("sauvegardes", new Map()).get("sauvegardes");
  const ilyra = (nom, quand) => texte({ ...perso({ id: "ilyra", nom }), modified: quand });
  sauv.set("ilyra.2026-09-10t14-32-00z.fh-char.json", ilyra("Ilyra v1", "2026-09-10T14:32:00Z"));
  sauv.set("ilyra.2026-09-12t09-00-00z.fh-char.json", ilyra("Ilyra v2", "2026-09-12T09:00:00Z"));
  sauv.set("ilyra.2026-09-11t09-00-00z~2.fh-char.json", ilyra("Ilyra v1b", "2026-09-11T09:00:00Z"));
  sauv.set("une-photo.png", "pas à nous");
  sauv.set("casse.2026-09-13t09-00-00z.fh-char.json", "{");
  assert.equal(dateDeLaClef("ilyra.2026-09-11t09-00-00z~2.fh-char.json"), "2026-09-11T09:00:00Z");
  assert.deepEqual(await reprendreLesAnciennesSauvegardes(base), { repris: 1 });
  const s = appareil(base);
  const lu = await s.lire("ilyra");
  assert.equal(lu.document.name, "Ilyra v2", "la plus récente");
  assert.equal(lu.revision, "r1");
  assert.equal(sauv.size, 5, "⛔ les entrées datées restent, intactes");
  /* une seconde fois : rien — et un perso déjà dans l'app n'est jamais remplacé par une vieille sauvegarde */
  await s.ecrire(texte({ ...perso({ id: "ilyra", nom: "Ilyra du jour" }) }), { revision: "r1" });
  base.rayons.get("reglages").clear();
  assert.deepEqual(await reprendreLesAnciennesSauvegardes(base), { repris: 0 });
  assert.equal((await s.lire("ilyra")).document.name, "Ilyra du jour");
});

test("R3 — 🧷 LA BASE DE LA COPIE DE TRAVAIL vit sous SA clef, jamais dans le personnage", () => {
  const store = new Map();
  const magasin = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  assert.equal(lireBase(magasin), null);
  assert.deepEqual(ecrireBase({ id: "k", revision: "r2", intrus: 1 }, magasin), { ok: true });
  assert.deepEqual(lireBase(magasin), { id: "k", revision: "r2" }, "seulement l'id et la révision");
  assert.notEqual(CLEF_BASE, CLEF_PERSONNAGE, "⛔ une seconde clef, pas un champ du personnage");
  oublierBase(magasin);
  assert.equal(lireBase(magasin), null);
  store.set(CLEF_BASE, "{pas du json");
  assert.equal(lireBase(magasin), null, "une base illisible = aucune base, jamais une panne");
});

test("R4 — 🧱 LA BASE INDEXEDDB passe en version 2 et AJOUTE le rayon des personnages, sans toucher aux deux autres", () => {
  assert.equal(BASE_VERSION, 2);
  assert.deepEqual([...RAYONS], ["personnages", "sauvegardes", "reglages"]);
});

/* ══ A — L'ALLER-RETOUR : « lisible par la nouvelle fiche » ═══════════════════════════════════ */

/** Le moteur de la PAGE, monté comme au navigateur — le patron du lot 367. */
async function moteurDeLaPage() {
  const vraiFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const chemin = String(url).split("?")[0];
    if (!fs.existsSync(chemin)) return { ok: false, status: 404, json: async () => null, arrayBuffer: async () => new ArrayBuffer(0) };
    const o = fs.readFileSync(chemin);
    return { ok: true, status: 200, arrayBuffer: async () => o.buffer.slice(o.byteOffset, o.byteOffset + o.byteLength), json: async () => JSON.parse(o.toString("utf8")) };
  };
  try {
    const { bootEngine } = await import("../ui/builder/engine.mjs");
    const { manifesteDeLaPile } = await import("../ui/builder/layers-ecran.mjs");
    const engine = await bootEngine({ root: ROOT });
    return { engine, montee: () => manifesteDeLaPile(engine.layers.verbs.stack()) };
  } finally {
    globalThis.fetch = vraiFetch;
  }
}

test("A1 — 🔴 L'ALLER-RETOUR DU DOCUMENT `fh-char/1` : écrit, relu, identique, valide, et rouvert par le moteur SANS PERTE", async () => {
  const { engine, montee } = await moteurDeLaPage();
  const verbs = engine.build.verbs;
  /* Un VRAI personnage d'avant (l'Ilyra de v914), recalé et dérivé comme à l'ouverture. */
  const avant = readJson("tests/fixtures/ilyra-v914.fh-char.json");
  const recale = { ...avant, build: { ...avant.build, layers: recalageDeLaPile(avant.build.layers, montee()).layers } };
  const ne = verbs.rebuild({ document: recale });
  const octets = canonicalText(ne.document);
  /* écrit dans les DEUX lieux par la séquence de `Save character` */
  const app = appareil();
  const { s: choisi, partis } = fichierEspion();
  assert.equal((await sauverDansLesDeux({ appareil: app, choisi, texte: octets, revisionApp: null })).ok, true);
  /* relu : les mêmes octets, dans l'app ET dans le fichier */
  const relu = await app.lire(ne.document.id);
  assert.equal(relu.etat, "lu");
  assert.equal(canonicalText(relu.document), octets, "⛔ l'app rend les octets reçus");
  assert.equal(partis[0].contenu, octets, "⛔ le fichier porte les mêmes octets — pas de second format, pas d'export dérivé");
  /* valide : le schéma `fh-char/1` accepte ce qui a été relu */
  const { assertValid } = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
  assert.doesNotThrow(() => assertValid(relu.document), "le document relu est un `fh-char/1` valide");
  assert.equal(relu.document.schema, "fh-char/1");
  /* rouvert dans le builder : le moteur redérive la MÊME fiche, les mêmes choix */
  const rouvert = verbs.rebuild({ document: relu.document });
  assert.deepEqual(rouvert.document.build.choices, ne.document.build.choices, "⛔ aucun choix perdu");
  /* ⚠️ UNE SEULE DIFFÉRENCE EST ADMISE, ET ELLE EST NOMMÉE : l'heure du calcul, que la dérivation
     ESTAMPILLE (`resolved.derivation.at` — le piège mesuré au lot 366). Tout le reste est comparé. */
  const sansHeure = (r) => ({ ...r, derivation: { ...r.derivation, at: "(l'heure du calcul)" } });
  assert.notEqual(rouvert.resolved.derivation.at, undefined, "témoin : l'estampille existe — sinon la neutraliser ne cacherait rien");
  assert.deepEqual(sansHeure(rouvert.resolved), sansHeure(ne.resolved), "⛔ la fiche redérivée est la même, champ pour champ");
  assert.deepEqual(verbs.validate({ document: rouvert.document }).violations || [], [], "et rien n'accuse");
});

/* ══ P — LA PAGE ═══════════════════════════════════════════════════════════════════════════ */

const query = ({ id }) => ({ record: { name: { "srd:species:en:elf": "Elf", "srd:class:en:wizard": "Wizard" }[id] } });
const kara = perso({ id: "k", nom: "Kara", campagne: "Les Chevaliers Noirs", choix: [
  { path: "level", value: 1 },
  { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } },
  { path: "species", ref: { kind: "species", id: "srd:species:en:elf" } }
] });

test("P1 — ⚖️ UNE LIGNE, TELLE QUE DICTÉE : image · nom · espèce classe niveau · campagne", () => {
  const l = ligneDuPersonnage(kara, query, "r3");
  assert.equal(l.nom, "Kara");
  assert.equal(l.quoi, "Elf Wizard lvl 1", "la forme de la dictée : « Humain Guerrier lvl4 »");
  assert.equal(l.campagne, "Les Chevaliers Noirs");
  assert.match(l.image, /assets\/fiches\/elf\.webp/, "l'image de fiche de l'espèce");
  assert.equal(l.revision, "r3");
  const vierge = ligneDuPersonnage(perso({ nom: "Unnamed" }), query);
  assert.equal(vierge.quoi, MOTS_DE_MES_PERSONNAGES.sansEspeceNiClasse);
  assert.equal(vierge.campagne, "none", "`none` — le mot de la ligne Campaign de R");
  assert.match(vierge.image, /arcana\/back\.webp/, "sans espèce, le dos de carte");
});

test("P2 — 🗂️ LA PAGE : `Open` (menu-porte, bleu) et la poubelle (l'organe du 351), tout à droite", () => {
  const acts = [];
  const page = renderMesPersonnages({ personnages: { etat: "liste", personnages: [{ id: "k", revision: "r1", document: kara }], illisibles: [] }, query }, (a) => acts.push(a));
  assert.equal(page.dataset.ecran, "characters");
  assert.equal(page.dataset.sortieIci, "true", "⛔ elle ne porte pas sa sortie : la coquille pose `Back`");
  assert.equal(page.querySelector(".tdc-titre-b").textContent, "My characters");
  const ligne = page.querySelector(".mes-personnages-ligne");
  const enfants = [...ligne.children].map((n) => n.className);
  assert.deepEqual(enfants, ["mes-personnages-image", "mes-personnages-texte", "menu-porte mes-personnages-ouvrir", "poubelle"],
    "l'ordre de la dictée : la poubelle TOUT à droite");
  ligne.querySelector(".mes-personnages-ouvrir").dispatchEvent({ type: "click", target: ligne });
  ligne.querySelector(".poubelle").dispatchEvent({ type: "click", target: ligne });
  assert.deepEqual(acts, [{ kind: "ouvrirUnPersonnage", id: "k" }, { kind: "demanderEffacerUnPersonnage", id: "k" }],
    "l'écran ÉMET des verbes — il ne touche jamais l'organe");
  assert.equal(page.querySelector(".mes-personnages-fichier").textContent, "Open a file…", "⚖️ la porte du fichier reste (loi du 06/09)");
});

test("P3 — ⚠️ « JE CHERCHE » · « IL N'Y A RIEN » · « REFUS » ne se disent pas pareil, et un illisible garde SA poubelle", () => {
  const mot = (liste) => renderMesPersonnages({ personnages: liste }, () => {}).querySelector("p").textContent;
  const cherche = mot({ etat: "chargement" });
  const rien = mot({ etat: "liste", personnages: [], illisibles: [] });
  const refus = mot({ etat: "refus", raison: "QuotaExceededError" });
  assert.equal(new Set([cherche, rien, refus]).size, 3);
  assert.match(refus, /QuotaExceededError/);
  const page = renderMesPersonnages({ personnages: { etat: "liste", personnages: [], illisibles: [{ id: "x", raison: "this file is not JSON" }] } }, () => {});
  const ligne = page.querySelector(".mes-personnages-ligne");
  assert.equal(ligne.dataset.illisible, "true");
  assert.equal(ligne.querySelector(".mes-personnages-ouvrir"), null, "⛔ pas d'`Open` sur ce qu'on ne sait pas lire");
  assert.ok(ligne.querySelector(".poubelle"), "…mais sa poubelle, la seule sortie");
});

test("P4 — ⛔ AUCUNE PAGE NE DÉFILE : la liste PAGINE, et la rangée des pages n'existe que s'il y en a plusieurs", () => {
  const n = (k) => Array.from({ length: k }, (_, i) => ({ id: `p${i}`, revision: "r1", document: perso({ id: `p${i}`, nom: `P${i}` }) }));
  const une = renderMesPersonnages({ personnages: { etat: "liste", personnages: n(LIGNES_PAR_PAGE), illisibles: [] } }, () => {});
  assert.equal(une.querySelectorAll(".mes-personnages-ligne").length, LIGNES_PAR_PAGE);
  assert.equal(une.querySelector(".mes-personnages-pages"), null, "une seule page, pas de flèches");
  const deux = renderMesPersonnages({ personnages: { etat: "liste", personnages: n(LIGNES_PAR_PAGE + 1), illisibles: [] } }, () => {});
  assert.equal(deux.querySelectorAll(".mes-personnages-ligne").length, LIGNES_PAR_PAGE, "la page tient ses lignes, jamais une de plus");
  const rangee = deux.querySelector(".mes-personnages-pages");
  assert.ok(rangee);
  assert.deepEqual([...rangee.querySelectorAll(".wares-chevron")].map((b) => b.dataset.sens), ["gauche", "droite"],
    "⭐ les chevrons de page de Wares et de X5 — un seul organe de page");
  assert.equal(deux.querySelector(".mes-personnages-compte").textContent, "1/2");
});

test("P5 — ❓ LA QUESTION DE LA POUBELLE SUIT LE LIEU CHOISI, par sa donnée — et elle EXIGE sa réponse", () => {
  const voies = [];
  const fichier = popupEffacerUnPersonnage({ nom: "Kara", lieuEfface: false, lieu: MOT_DU_FICHIER, choisir: (v) => voies.push(v) });
  assert.equal(fichier.titre, "Delete this character?");
  assert.match(fichier.texte, /removes Kara and every saved version from My characters\. Your files stay where you saved them\./,
    "⚖️ « Efface la copie de l'app » — le perso ENTIER (Q1 b), et la question le dit");
  const loin = popupEffacerUnPersonnage({ nom: "Kara", lieuEfface: true, lieu: "Dropbox", choisir: () => {} });
  assert.equal(loin.titre, "Delete this character for good?", "⚖️ la dictée du 29/09, pour un lieu qui sait effacer");
  assert.match(loin.texte, /every saved version — from Dropbox and from this app/);
  for (const p of [fichier, loin]) {
    assert.equal(p.role, "aiguilleur");
    assert.equal(p.exigeUneReponse, true, "⛔ ni tap dehors, ni Échap (`popup-question-exige-une-reponse`)");
    assert.deepEqual(p.actions.map((a) => [a.mot, a.defait]), [["Cancel", true], ["Delete", true]], "la famille DÉFAIRE, rouge");
  }
  fichier.actions[0].faire(); fichier.actions[1].faire();
  assert.deepEqual(voies, ["cancel", "delete"]);
});

test("P6 — ⚖️ LA QUESTION DE LA RÉOUVERTURE : deux voies, réponse exigée, et aucune ne se peint en rouge (C40 ouverte)", () => {
  const voies = [];
  const p = popupDeLaReouverture({ nom: "Kara", choisir: (v) => voies.push(v) });
  assert.equal(p.role, "aiguilleur");
  assert.equal(p.exigeUneReponse, true);
  assert.match(p.texte, /Kara was also changed in another window.*Nothing was overwritten/);
  assert.deepEqual(p.actions.map((a) => a.defait), [undefined, undefined], "⛔ un lot ne tranche pas C40 en repeignant une voie");
  p.actions.forEach((a) => a.faire());
  assert.deepEqual(voies, ["ici", "ailleurs"]);
});

test("P7 — 🔔 LE MENU DIT L'ENVOI : rouge s'il a raté, une note s'il est reparti, RIEN quand tout est arrivé", async () => {
  const { engine } = await moteurDeLaPage();
  const ctx = (envoi) => ({ ecran: null, document: perso(), query: engine.layers.verbs.query, pile: engine.layers.verbs.stack(),
    memoire: { ok: true }, envoi });
  const tete = (envoi) => renderUniverseStep(ctx(envoi), () => {}).querySelector(".tdc-tete");
  assert.equal(tete({ etat: "a-jour" }).querySelector(".tdc-envoi"), null, "⛔ pas de « saved » (`menu-r-ligne-d-etat-retiree`)");
  const refus = tete({ etat: "refus", raison: "QuotaExceededError" }).querySelector(".tdc-envoi");
  assert.equal(refus.className, "doc-field-error tdc-envoi");
  assert.equal(refus.textContent, MOTS_DE_L_ENVOI.refus("QuotaExceededError"));
  const repris = tete({ etat: "repris" }).querySelector(".tdc-envoi");
  assert.equal(repris.className, "universe-note tdc-envoi");
  assert.equal(repris.textContent, MOTS_DE_L_ENVOI.repris);
});

/* ══ C — LA COQUILLE ═════════════════════════════════════════════════════════════════════════ */

test("C1 — ⚔️ UN SEUL ÉCRIVAIN PAR LIEU : la copie de l'app dans la FILE de la coquille, le lieu choisi par `exporterJson` seul", () => {
  const ecrituresApp = [...shell.matchAll(/state\.stockage\.appareil\.ecrire\(/g)].length;
  assert.equal(ecrituresApp, 2, "`envoyerALApp` (le perso courant) et `ouvrirUnDocumentVenuDAilleurs` (un fichier qui entre) — pas un de plus");
  const envoi = shell.match(/function envoyerALApp\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(envoi, /return enFileDeLApp\(async \(\) => \{[\s\S]*const revision = state\.copieDeLApp\.etat === "dans-l-app"/,
    "⚔️ la révision annoncée se lit DANS la file, après l'écriture précédente");
  assert.equal([...shell.matchAll(/sauverDansLesDeux\(/g)].length, 1, "la séquence des deux lieux a UN appelant");
  assert.equal([...shell.matchAll(/state\.stockage\.choisi\.ecrire\(/g)].length, 0, "⛔ personne n'écrit au lieu choisi hors de la séquence");
  assert.equal([...shell.matchAll(/nomDeFichier\(document, "fh-char\.json"/g)].length, 1, "le nom du fichier de perso, à UN endroit : le lieu choisi");
});

test("C2 — ⚖️ § 10, LA SAUVEGARDE AUTOMATIQUE : à chaque modification (différée), et au passage en arrière-plan (tout de suite)", () => {
  const memoriser = shell.match(/function memoriser\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(memoriser, /const issue = ecrirePersonnage\(texte\);[\s\S]*planifierLEnvoi\(\);/, "la copie de travail d'abord, l'envoi ensuite");
  const planifier = shell.match(/function planifierLEnvoi\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(planifier, /if \(state\.copieDeLApp\.etat !== "dans-l-app"\) return;/,
    "⚖️ Q3 — un perso jamais sauvé n'entre pas tout seul dans My characters");
  assert.match(shell, /document\.addEventListener\("visibilitychange", \(\) => \{ if \(document\.visibilityState === "hidden"\) envoyerMaintenant\(\); \}\);/);
  assert.match(shell, /window\.addEventListener\("pagehide", envoyerMaintenant\);/);
});

test("C3 — ⚖️ `Save character` RANGE, PUIS VIDE LE CACHE — et un Save refusé ne vide RIEN", () => {
  assert.match(shell, /action\.kind === "exportJson"\) \{ void sauverPuisViderLeCache\(\); return; \}/);
  const vider = shell.match(/async function sauverPuisViderLeCache\(\) \{[\s\S]*?\n\}/)[0];
  const rang = (mot) => vider.indexOf(mot);
  assert.match(vider, /^async function sauverPuisViderLeCache\(\) \{\s*if \(!\(await exporterJson\(\)\)\) return false;/,
    "le verdict du Save est la PREMIÈRE chose attendue");
  for (const oubli of ["oublierPersonnage();", "oublierBase();", "oublierRecalage();", "window.location.reload()"]) {
    assert.ok(rang(oubli) > rang("if (!(await exporterJson())) return false;"), `⛔ ${oubli} AVANT le verdict du Save`);
  }
  /* ⭐ les deux autres écrivains ne vident pas : ils ont leur propre suite */
  assert.match(shell, /sauvegarder: \(\) => exporterJson\(\{ quoi: "New character" \}\)/);
  assert.match(shell, /sauvegarder: \(\) => exporterJson\(\{ version: NOM_DE_LA_VERSION_FH \}\)/);
});

test("C4 — 🗑️ LA POUBELLE DE LA COQUILLE : la question sur la DONNÉE du lieu choisi, puis la séquence pure", () => {
  const demande = shell.slice(shell.indexOf('action.kind === "demanderEffacerUnPersonnage"'), shell.indexOf('action.kind === "effacerUnPersonnage"'));
  assert.match(demande, /const lieu = state\.stockage\.choisi\.capacites;/);
  assert.match(demande, /lieuEfface: lieu\.efface, lieu: lieu\.lieu,/, "⛔ jamais « es-tu le fichier ? »");
  const efface = shell.slice(shell.indexOf('action.kind === "effacerUnPersonnage"'), shell.indexOf('action.kind === "trancherLaReouverture"'));
  assert.match(efface, /if \(action\.voie !== "delete" \|\| !state\.stockage\) \{ refresh\(\); return; \}/, "`Cancel` ne fait que repeindre");
  assert.match(efface, /effacerSelonLeStockage\(\{ appareil: state\.stockage\.appareil, choisi: state\.stockage\.choisi, id: action\.id \}\)/);
});

test("C5 — 🧭 LA RÉOUVERTURE ATTEND LE MOTEUR, et le stockage monte sans lui ; sa panne ne tue pas le builder", () => {
  const monter = shell.match(/async function monterLeStockage\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(monter, /await rafraichirLesPersonnages\(\);\s*await moteurPret;\s*await reouvrirLaCopieDeTravail\(\);/,
    "la liste d'abord (elle n'a pas besoin du moteur), la réouverture après lui");
  assert.match(shell, /refresh\(\);\s*signalerMoteurPret\(\);\s*\}\)\(\);/, "le moteur tient sa promesse, même en panne");
  assert.match(shell, /try \{ await monterLeStockage\(\); \} catch \(cause\) \{\s*state\.personnagesListe = \{ etat: "refus"/,
    "⛔ une panne du stockage se DIT dans My characters");
  const reouvrir = shell.match(/async function reouvrirLaCopieDeTravail\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(reouvrir, /const base = lireBase\(\);\s*const decision = aLaReouverture\(\{ travail: travailAuDemarrage === null \? null : \{ id, texte: travailAuDemarrage \}, base, app \}\)/,
    "⭐ le texte GARDÉ avant que le démarrage ne le retouche — c'est lui qui dit si un envoi avait raté");
  assert.match(reouvrir, /const unEnvoiAvaitRate = decision\.geste === "renvoyer" && base !== null && base\.id === id;\s*if \(issue\.ok && unEnvoiAvaitRate\) state\.envoi = \{ etat: "repris" \};/,
    "⛔ le Menu ne dit « reparti » que d'un envoi qui avait RATÉ — pas de la reprise des sauvegardes datées");
  assert.match(reouvrir, /state\.popup = popupDeLaReouverture\(/, "⚖️ la question, à la réouverture");
});

test("C6 — ⛔ L'ÉCRAN NE REÇOIT JAMAIS L'ORGANE — il reçoit des faits", () => {
  const ctx = shell.slice(shell.indexOf('step.id === "universe" && state.engine'), shell.indexOf('} else if (step.id === "universe" && state.engineError)'));
  assert.match(ctx, /personnages: state\.personnagesListe,/);
  assert.match(ctx, /envoi: state\.envoi/);
  /* ⚖️ Q2 → a — le lieu entre comme DEUX FAITS lus sur l'organe (son mot, ce que le navigateur peut
     choisir) ; ⛔ jamais l'organe lui-même, ni un de ses verbes. */
  assert.match(ctx, /lieu: state\.stockage \? \{ mot: state\.stockage\.choisi\.capacites\.lieu, choisissable: state\.stockage\.choisissable \} : null,/);
  const sansLeLieu = ctx.replace(/lieu: state\.stockage \? \{[^}]*\} : null,/, "");
  assert.equal(/state\.stockage/.test(sansLeLieu), false, "⛔ l'organe n'entre pas dans un écran");
});

/* ══ V — Q1 → b : LES VERSIONS DATÉES RESTENT (Eric, 10/09 : « une entrée datée à chaque Save — rien
   n'est écrasé ») ══════════════════════════════════════════════════════════════════════════════ */

test("V1 — ⚖️ UN SAVE GARDE UNE VERSION DATÉE, la sauvegarde automatique N'EN GARDE PAS, et rien n'est jamais écrasé", async () => {
  const base = baseDeFixture();
  const ad = adaptateurAppareil(base);
  const s = creerStockage(ad);
  const doc = perso({ id: "k", nom: "Kara" });
  /* un Save : la copie courante ET une version */
  assert.equal((await s.ecrire(texte(doc), { revision: null, garder: "2026-09-30T05:00:00Z" })).ok, true);
  /* trois modifications automatiques : la copie avance, aucune version */
  for (const [i, r] of [["a", "r1"], ["b", "r2"], ["c", "r3"]]) await s.ecrire(texte({ ...doc, name: `Kara ${i}` }), { revision: r });
  assert.equal((await s.lire("k")).revision, "r4");
  assert.deepEqual((await ad.versions("k")).map((v) => v.date), ["2026-09-30T05:00:00Z"], "⛔ une version par Save, pas par lettre tapée");
  /* ⚔️ ET LE RAYON BRUT LE CONFIRME — `versions()` ne voit que les clefs DATÉES : une version fabriquée
     sans heure lui serait invisible (un garde ne peut pas accuser l'extracteur par lequel il lit). */
  assert.equal(base.rayons.get("sauvegardes").size, 1, "⛔ la sauvegarde automatique n'a rien rangé dans le rayon des versions");
  /* deux Save dans la même seconde : deux versions */
  await s.ecrire(texte({ ...doc, name: "Kara" }), { revision: "r4", garder: "2026-09-30T06:00:00Z" });
  await s.ecrire(texte({ ...doc, name: "Kara" }), { revision: "r5", garder: "2026-09-30T06:00:00Z" });
  const v = await ad.versions("k");
  assert.equal(v.length, 3, "⚖️ rien n'est écrasé — même la même seconde");
  assert.deepEqual(v.map((x) => x.clef), ["kara.2026-09-30t06-00-00z.fh-char.json", "kara.2026-09-30t06-00-00z~2.fh-char.json", "kara.2026-09-30t05-00-00z.fh-char.json"],
    "la plus récente en tête, la clef du lot 195");
  /* ⚖️ la ligne montre la version LA PLUS RÉCENTE : la copie courante */
  const liste = await s.lister();
  assert.equal(liste.personnages.length, 1, "une LIGNE par perso, pas une par version");
});

test("V2 — 🗑️ LA POUBELLE RETIRE LE PERSO ENTIER DE L'APP — sa copie et TOUTES ses versions, et celles de personne d'autre", async () => {
  const base = baseDeFixture();
  const ad = adaptateurAppareil(base);
  const s = creerStockage(ad);
  const kara = perso({ id: "k", nom: "Kara" });
  const homonyme = perso({ id: "h", nom: "Kara" });
  await s.ecrire(texte(kara), { revision: null, garder: "2026-09-30T05:00:00Z" });
  await s.ecrire(texte({ ...kara, name: "Kara renommée" }), { revision: "r1", garder: "2026-09-30T06:00:00Z" });
  await s.ecrire(texte(homonyme), { revision: null, garder: "2026-09-30T05:00:00Z" });
  base.rayons.get("sauvegardes").set("photo.png", "pas à nous");
  assert.equal((await ad.versions("k")).length, 2);
  assert.deepEqual(await s.effacer("k"), { ok: true });
  assert.deepEqual(await s.lire("k"), { etat: "absent" });
  assert.deepEqual(await ad.versions("k"), [], "⛔ ses versions partent avec lui — même celle d'un autre nom");
  assert.equal((await ad.versions("h")).length, 1, "⛔ l'homonyme garde la sienne : on reconnaît par l'`id`, jamais par le nom");
  assert.equal(base.rayons.get("sauvegardes").get("photo.png"), "pas à nous");
});

test("V3 — 💾 LA SÉQUENCE DU SAVE DATE SA VERSION, l'heure étant PASSÉE par l'appelant (aucune horloge dans l'organe)", async () => {
  const base = baseDeFixture();
  const ad = adaptateurAppareil(base);
  const { s: choisi } = fichierEspion();
  await sauverDansLesDeux({ appareil: creerStockage(ad), choisi, texte: texte(perso({ id: "k" })), revisionApp: null, quand: "2026-09-30T07:00:00Z" });
  assert.deepEqual((await ad.versions("k")).map((v) => v.date), ["2026-09-30T07:00:00Z"]);
  assert.match(shell, /version,\s*quand: platformNow\(\)\s*\}\);/, "la coquille passe l'heure du Save");
  assert.equal(/new Date|Date\.now/.test(fs.readFileSync(path.join(UI, "magasin.mjs"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")), false,
    "⛔ pas d'horloge dans l'organe");
});

/* ══ D — Q2 → a : LE DOSSIER DE CHROME ET D'EDGE (lots 195 et 202) ══════════════════════════════
   ⭐ Une poignée de FIXTURE qui a la surface exacte que l'adaptateur touche. */
function poigneeDeFixture({ nom = "FH saves", permission = "granted", accorde = "granted" } = {}) {
  const fichiers = new Map();
  const demandes = [];
  return {
    fichiers, demandes, name: nom,
    queryPermission: async () => permission,
    requestPermission: async () => { demandes.push("demande"); permission = accorde; return accorde; },
    async *entries() {
      for (const clef of fichiers.keys()) yield [clef, { kind: "file" }];
      yield ["un-sous-dossier", { kind: "directory" }];
    },
    async getFileHandle(clef, options) {
      if (!fichiers.has(clef)) { if (!options || !options.create) throw new Error("NotFoundError"); fichiers.set(clef, ""); }
      return {
        getFile: async () => ({ text: async () => fichiers.get(clef) }),
        createWritable: async () => ({ write: async (t) => { fichiers.set(clef, t); }, close: async () => {} })
      };
    },
    removeEntry: async (clef) => { fichiers.delete(clef); }
  };
}

test("D1 — 📁 LE DOSSIER : un fichier par Save, jamais écrasé ; il sait effacer, et n'efface QUE le perso visé", async () => {
  const p = poigneeDeFixture();
  const s = creerStockage(adaptateurDossier(p));
  assert.deepEqual({ ...s.capacites }, { liste: false, ecrase: false, efface: true, sansGeste: false, possede: true, lieu: "FH saves" });
  const kara = perso({ id: "k", nom: "Kara" });
  await s.ecrire(texte(kara), { revision: null, garder: "2026-09-30T05:00:00Z" });
  await s.ecrire(texte(kara), { revision: null, garder: "2026-09-30T05:00:00Z" });
  await s.ecrire(texte(perso({ id: "h", nom: "Kara" })), { revision: null, garder: "2026-09-30T05:00:00Z" });
  p.fichiers.set("une-photo.png", "à Eric");
  assert.deepEqual([...p.fichiers.keys()].sort(), ["kara.2026-09-30t05-00-00z.fh-char.json", "kara.2026-09-30t05-00-00z~2.fh-char.json",
    "kara.2026-09-30t05-00-00z~3.fh-char.json", "une-photo.png"], "⚖️ rien n'est écrasé");
  assert.equal(p.fichiers.get("kara.2026-09-30t05-00-00z.fh-char.json"), texte(kara), "les octets reçus");
  assert.deepEqual(await s.effacer("k"), { ok: true });
  assert.deepEqual([...p.fichiers.keys()].sort(), ["kara.2026-09-30t05-00-00z~3.fh-char.json", "une-photo.png"],
    "⛔ l'homonyme et la photo restent : on efface par `id`, et jamais ce qui n'est pas à nous");
});

test("D2 — 🔑 LOT 202 : À AUTORISER → le Save DEMANDE (il est dans un clic) ; refusé → le mot NOMME la sortie, et RIEN n'est écrit", async () => {
  const p = poigneeDeFixture({ permission: "prompt", accorde: "granted" });
  const s = creerStockage(adaptateurDossier(p));
  assert.equal((await s.ecrire(texte(perso()), { revision: null, garder: "2026-09-30T05:00:00Z" })).ok, true);
  assert.deepEqual(p.demandes, ["demande"], "une demande, dans le geste");
  const q = poigneeDeFixture({ permission: "prompt", accorde: "denied" });
  const refus = await creerStockage(adaptateurDossier(q)).ecrire(texte(perso()), { revision: null, garder: "2026-09-30T05:00:00Z" });
  assert.deepEqual(refus, { ok: false, raison: MOT_PERMISSION_PERDUE });
  assert.match(MOT_PERMISSION_PERDUE, /Save location/, "⛔ le refus nomme la sortie d'un clic");
  assert.equal(q.fichiers.size, 0, "⛔ jamais un repli silencieux ailleurs");
});

test("D3 — 🧭 LE DOSSIER RETENU se relit de la base, SEULEMENT si le navigateur sait s'en servir ; le choisir est une réponse", async () => {
  const base = baseDeFixture();
  assert.equal(await dossierRetenu({ base, possible: true }), null, "rien de choisi");
  const p = poigneeDeFixture();
  assert.deepEqual(await choisirUnDossier({ base, showDirectoryPicker: async () => p }), { etat: "choisi" });
  assert.equal(await dossierRetenu({ base, possible: true }), p);
  assert.equal(await dossierRetenu({ base, possible: false }), null, "⛔ Safari ne se voit jamais servir une poignée qu'il ne sait pas ouvrir");
  assert.deepEqual(await choisirUnDossier({ base, showDirectoryPicker: async () => { throw new Error("AbortError"); } }), { etat: "decline" },
    "fermer la boîte n'est pas une panne");
  assert.equal((await choisirUnDossier({ base, showDirectoryPicker: undefined })).etat, "refus");
  assert.equal(clefDeLEntree(perso({ nom: "Kara" }), "2026-09-30T05:00:00Z", []), "kara.2026-09-30t05-00-00z.fh-char.json");
});

test("D4 — 🗂️ `SAVE LOCATION` SUR MY CHARACTERS : présent partout, allumé là où l'on peut choisir, et le mot du lieu dessous", () => {
  const acts = [];
  const page = (lieu) => renderMesPersonnages({ personnages: { etat: "liste", personnages: [], illisibles: [] }, lieu }, (a) => acts.push(a));
  const peut = page({ mot: "FH saves", choisissable: true });
  const b = peut.querySelector(".mes-personnages-lieu");
  assert.equal(b.textContent, "Save location");
  assert.equal(peut.querySelector(".mes-personnages-lieu-mot").textContent, "FH saves");
  b.dispatchEvent({ type: "click", target: b });
  assert.deepEqual(acts, [{ kind: "choisirLeLieu" }]);
  const neSaitPas = page({ mot: MOT_DU_FICHIER, choisissable: false }).querySelector(".mes-personnages-lieu");
  assert.equal(neSaitPas.disabled, true, "⛔ jamais caché : présent, éteint (`menu-reglage-impossible-reste-visible`)");
  assert.match(neSaitPas.title, /cannot pick a folder/, "…et il dit pourquoi");
});

test("D5 — 🔌 LA COQUILLE : le lieu choisi est le dossier RETENU, sinon le fichier ; `Save location` rechoisit puis REMONTE", () => {
  const lieu = shell.match(/async function lieuChoisi\(base\) \{[\s\S]*?\n\}/)[0];
  assert.match(lieu, /const poignee = await dossierRetenu\(\{ base, possible: dossierPossible\(fenetreDuStockage\(\)\) \}\);\s*if \(poignee\) return creerStockage\(adaptateurDossier\(poignee\)\);/);
  assert.match(lieu, /return creerStockage\(adaptateurFichier\(\{/);
  const geste = shell.slice(shell.indexOf('action.kind === "choisirLeLieu"'), shell.indexOf('action.kind === "trancherLaReouverture"'));
  assert.match(geste, /if \(issue\.etat === "choisi"\) state\.stockage\.choisi = await lieuChoisi\(state\.stockage\.base\);/,
    "⛔ remonté par l'organe, jamais rapiécé");
});

/* ══ E — AUCUNE RÉVISION NE NAÎT D'UNE ESTAMPILLE (ARCHI 35, 30/09 — sinon chaque ouverture ferait
   une version fantôme) ══════════════════════════════════════════════════════════════════════ */

test("E1 — ⚖️ L'APPAREIL COMPARE CE QUI FAIT LE PERSONNAGE : une estampille seule ne fait naître AUCUNE révision", async () => {
  const base = baseDeFixture();
  const ad = adaptateurAppareil(base);
  const s = creerStockage(ad);
  const doc = { ...perso({ id: "k" }), resolved: { derivation: { at: "2026-09-30T05:00:00.000Z" } } };
  assert.equal((await s.ecrire(texte(doc), { revision: null })).revision, "r1");
  /* la réouverture : la dérivation a réestampillé `modified` et `resolved.derivation.at` — rien d'autre */
  const reestampille = { ...doc, modified: "2026-09-30T08:00:00Z", resolved: { derivation: { at: "2026-09-30T08:00:00.000Z" } } };
  assert.deepEqual(await s.ecrire(texte(reestampille), { revision: "r1" }), { ok: true, revision: "r1" }, "⛔ pas de r2 fantôme");
  assert.equal(base.rayons.get("personnages").get("k").texte, texte(doc), "et rien n'est réécrit");
  /* ⭐ même sur une révision PÉRIMÉE : le même personnage n'est pas un conflit */
  assert.deepEqual(await s.ecrire(texte(reestampille), { revision: null }), { ok: true, revision: "r1" });
  /* un vrai changement, lui, fait naître sa révision */
  assert.equal((await s.ecrire(texte({ ...reestampille, name: "Kara II" }), { revision: "r1" })).revision, "r2");
  /* ⚖️ et un Save EXPLICITE garde sa version datée même sans changement (10/09 : « à chaque Save ») */
  await s.ecrire(texte({ ...reestampille, name: "Kara II" }), { revision: "r2", garder: "2026-09-30T09:00:00Z" });
  assert.equal((await s.lire("k")).revision, "r2");
  assert.deepEqual((await ad.versions("k")).map((v) => v.date), ["2026-09-30T09:00:00Z"]);
});

test("E2 — 🔌 LA COQUILLE COMPARE SUR LE MÊME REPÈRE à la réouverture — sinon chaque ouverture serait un « envoi raté » dit à tort", () => {
  assert.match(shell, /function repereDuPersonnage\(document\) \{ return canonicalText\(ceQuiFaitLePersonnage\(document\)\); \}/);
  assert.match(shell, /if \(garde\.etat === "lu"\) travailAuDemarrage = repereDuPersonnage\(garde\.document\);/);
  const reouvrir = shell.match(/async function reouvrirLaCopieDeTravail\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(reouvrir, /texte: repereDuPersonnage\(lu\.document\)/);
  assert.match(reouvrir, /const aEnvoyer = repereDuPersonnage\(state\.document\) !== \(app \? app\.texte : null\);/);
  assert.equal(/canonicalText\(lu\.document\)|canonicalText\(state\.document\) !==/.test(reouvrir), false, "⛔ plus aucune comparaison du texte entier");
});
