/* ══ LOT 377 — DROPBOX : LE PREMIER STOCKAGE EN LIGNE, ET LA SYNCHRO D'UN APPAREIL À L'AUTRE ══════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 377 dropbox.md` (ARCHI 35, 30/09).
   ⚖️ § 10 (29/09) : Dropbox en tête, *« la connexion se renouvelle seule »* ; *« le stockage choisi est le
   point de rencontre entre l'iPad, le téléphone et l'ordinateur »* ; *« l'app VÉRIFIE AVANT D'ÉCRIRE »*. Et
   ARCHI 35, 30/09, sur Kara effacée sur le Mac mais changée sur l'iPad : **(b), la question**.

   🔴 CE QUE CE FICHIER GARDE, CONTRE UN FAUX DROPBOX (`faux-dropbox.mjs`, la surface HTTP exacte) :
     K. LA CONNEXION — PKCE S256 tiré de `crypto.getRandomValues`, l'adresse d'autorisation et ses
        paramètres, le `code` qui quitte l'adresse, un `state` faux refusé, un refus du joueur.
     J. LES JETONS — renouvelés seuls, un renouvellement pour deux appels, révoqués → dit ; les
        permissions manquantes → dit sans rien jeter ; le cache vidé ne déconnecte pas ; aucun jeton dans
        le document, ni dans une adresse.
     A. L'ADAPTATEUR — la révision portée à chaque écriture ; un conflit n'écrase rien ; un fichier effacé
        ailleurs n'est pas recréé ; `Save character` garde une version datée ; la poubelle efface chez
        Dropbox (copie et versions), puis dans l'app ; `keepalive` sous son plafond seulement.
     S. LA SYNCHRO — la table de décision, état par état ; deux appareils de bout en bout (l'essai d'Eric,
        rejoué) ; les questions et leurs réponses ; le courrier (jamais deux envois en vol).
     P. LA QUESTION — d'où vient l'autre version, par la donnée ; la forme « effacé ailleurs ».
     C. LA COQUILLE — le retour lu en premier, la table des lieux, les files, la synchro au démarrage et à
        My characters.
   ⛔ PERSONNE NE SE CONNECTE À DROPBOX ICI : tous les jetons sont faux. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { fauxDropbox } from "./faux-dropbox.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const lire = (f) => stripComments(fs.readFileSync(path.join(UI, f), "utf8"));
const shell = lire("shell.mjs");
const dropboxSrc = lire("dropbox.mjs");

const {
  APP_KEY, ADRESSE_AUTORISER, CLEF_JETONS, CLEF_CONNEXION, PLAFOND_KEEPALIVE, DOSSIER_COURANTS, DOSSIER_VERSIONS,
  MOT_DECONNECTE, MOT_ETAT_FAUX, MOT_DECLINE, MOT_SANS_PERMISSION, MOT_DE_DROPBOX, MOT_AILLEURS_DE_DROPBOX,
  adaptateurDropbox, gardienDesJetons, preparerLaConnexion, retirerLeRetour, terminerLaConnexion,
  adresseDeRetour, nomDeLId, idDuNom, httpAvecRepli
} = await import("../ui/builder/dropbox.mjs");
const {
  creerStockage, adaptateurAppareil, sauverDansLesDeux, effacerSelonLeStockage, decisionDeSynchro, synchroniser,
  trancherLaSynchro, lireLesCommuns, poserUnCommun, creerCourrier, repereDe, RAYON_REGLAGES
} = await import("../ui/builder/magasin.mjs");
const { popupDeLaReouverture } = await import("../ui/builder/mes-personnages.mjs");
const { canonicalText } = await import("../src/doc/canonical.mjs");
const { oublierPersonnage, oublierBase, oublierRecalage } = await import("../ui/builder/memoire.mjs");

/* ── LES FIXTURES ──────────────────────────────────────────────────────────────────────────────── */

/** La base de fixture — la forme de la vraie (cinq verbes, `echanger` dans le même tour). */
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
function perso({ id = "sonde-kara", nom = "Kara", modified = "2026-09-30T05:00:00Z", choix = [] } = {}) {
  return {
    schema: "fh-char/1", id, name: nom, lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-30T04:00:00Z", modified,
    build: { layers: [], choices: choix, budgets: {}, overrides: [] }
  };
}
const texteDe = (doc) => canonicalText(doc);
let horloge = 1_000_000;
const maintenant = () => horloge;

/** UN APPAREIL CONNECTÉ — sa base, sa copie de l'app, son Dropbox (le même faux pour tous les appareils). */
async function appareilConnecte(faux, { location = { origin: "https://noirchicot.github.io", pathname: "/fhpc/ui/builder/index.html" } } = {}) {
  const base = baseDeFixture();
  const adresse = await preparerLaConnexion({ crypto: webcrypto, base, location });
  const retour = retirerLeRetour(new URL(faux.autoriser(adresse)), { state: null, replaceState() {} });
  const issue = await terminerLaConnexion({ retour, base, http: faux.http, maintenant });
  assert.equal(issue.etat, "connecte");
  const jetons = gardienDesJetons({ base, http: faux.http, maintenant });
  return {
    base, jetons,
    app: creerStockage(adaptateurAppareil(base)),
    loin: creerStockage(adaptateurDropbox({ http: faux.http, jetons }))
  };
}
const sync = (d) => synchroniser({ appareil: d.app, loin: d.loin, base: d.base, lieu: "dropbox" });
const chemin = (id) => `${DOSSIER_COURANTS}/${nomDeLId(id)}.fh-char.json`;

/* ══ K — LA CONNEXION ═════════════════════════════════════════════════════════════════════════ */

test("K1 — 🔐 PARTIR CHEZ DROPBOX : PKCE S256 tiré de `crypto.getRandomValues`, et l'adresse porte exactement ce qu'il faut", async () => {
  const base = baseDeFixture();
  let tirages = 0;
  const crypto = { getRandomValues: (o) => { tirages += 1; return webcrypto.getRandomValues(o); }, subtle: webcrypto.subtle };
  const hasard = Math.random;
  Math.random = () => { throw new Error("⛔ Math.random appelé"); };
  let adresse;
  try {
    adresse = await preparerLaConnexion({ crypto, base, location: { origin: "https://noirchicot.github.io", pathname: "/fhpc/ui/builder/" } });
  } finally { Math.random = hasard; }
  assert.equal(tirages, 2, "le vérificateur et le `state`");
  const u = new URL(adresse);
  assert.equal(`${u.origin}${u.pathname}`, ADRESSE_AUTORISER);
  assert.equal(ADRESSE_AUTORISER, "https://www.dropbox.com/oauth2/authorize");
  const q = Object.fromEntries(u.searchParams);
  const garde = base.rayons.get(RAYON_REGLAGES).get(CLEF_CONNEXION);
  assert.deepEqual(Object.keys(q).sort(), ["client_id", "code_challenge", "code_challenge_method", "redirect_uri", "response_type", "state", "token_access_type"]);
  assert.equal(q.client_id, APP_KEY);
  assert.equal(APP_KEY, "fa6ljsyakrdv7eu");
  assert.equal(q.response_type, "code");
  assert.equal(q.code_challenge_method, "S256");
  assert.equal(q.token_access_type, "offline", "le jeton qui se renouvelle — § 10");
  assert.equal(q.redirect_uri, "https://noirchicot.github.io/fhpc/ui/builder/index.html", "l'adresse qu'Eric a enregistrée, octet pour octet");
  assert.equal(q.state, garde.etat);
  assert.ok(garde.verificateur.length >= 43 && /^[A-Za-z0-9_-]+$/.test(garde.verificateur), "RFC 7636 : 43 caractères au moins, base64url");
  const h = new Uint8Array(await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(garde.verificateur)));
  assert.equal(q.code_challenge, Buffer.from(h).toString("base64url"), "le défi est S256 du vérificateur gardé");
  assert.equal(adresse.includes(garde.verificateur), false, "⛔ le vérificateur ne quitte jamais l'appareil");
  assert.equal(adresseDeRetour({ origin: "http://localhost:8979", pathname: "/ui/builder/index.html" }), "http://localhost:8979/ui/builder/index.html");
});

test("K2 — 🧹 LE RETOUR : le `code` et le `state` quittent l'adresse, le reste demeure ; une page ordinaire n'est pas touchée", () => {
  const vus = [];
  const history = { state: { x: 1 }, replaceState: (s, t, a) => vus.push([s, t, a]) };
  const retour = retirerLeRetour({ search: "?code=CODE-SECRET&state=ETAT&garde=1", pathname: "/fhpc/ui/builder/index.html", hash: "#vault" }, history);
  assert.deepEqual(retour, { code: "CODE-SECRET", etat: "ETAT", erreur: null });
  assert.deepEqual(vus, [[{ x: 1 }, "", "/fhpc/ui/builder/index.html?garde=1#vault"]]);
  assert.equal(vus[0][2].includes("CODE-SECRET") || vus[0][2].includes("ETAT"), false);
  const refus = retirerLeRetour({ search: "?error=access_denied&state=E&error_description=no", pathname: "/p", hash: "" }, history);
  assert.deepEqual(refus, { code: null, etat: "E", erreur: "access_denied" });
  assert.equal(vus[1][2], "/p");
  assert.equal(retirerLeRetour({ search: "?v=929", pathname: "/p", hash: "" }, history), null, "une page ordinaire");
  assert.equal(vus.length, 2, "⛔ elle n'est pas réécrite");
});

test("K3 — ⛔ UN `STATE` FAUX EST REFUSÉ — aucun échange de jeton, et le `state` attendu ne ressert pas", async () => {
  const faux = fauxDropbox();
  const base = baseDeFixture();
  const adresse = await preparerLaConnexion({ crypto: webcrypto, base, location: { origin: "https://noirchicot.github.io", pathname: "/fhpc/ui/builder/index.html" } });
  const vrai = retirerLeRetour(new URL(faux.autoriser(adresse)), { state: null, replaceState() {} });
  const forge = { ...vrai, etat: "un-autre-state" };
  assert.deepEqual(await terminerLaConnexion({ retour: forge, base, http: faux.http, maintenant }), { etat: "refus", raison: MOT_ETAT_FAUX });
  assert.equal(faux.requetes.length, 0, "⛔ aucune requête : le code n'est pas échangé");
  assert.equal(base.rayons.get(RAYON_REGLAGES).has(CLEF_JETONS), false);
  /* le vrai `state`, APRÈS une tentative : le vérificateur a été effacé — un seul usage */
  assert.equal((await terminerLaConnexion({ retour: vrai, base, http: faux.http, maintenant })).etat, "refus");
  assert.equal(faux.requetes.length, 0);
});

test("K4 — 🙅 LE JOUEUR DIT NON CHEZ DROPBOX : `decline`, un mot, rien d'échangé", async () => {
  const faux = fauxDropbox();
  const base = baseDeFixture();
  const adresse = await preparerLaConnexion({ crypto: webcrypto, base, location: { origin: "https://noirchicot.github.io", pathname: "/fhpc/ui/builder/index.html" } });
  const retour = retirerLeRetour(new URL(faux.autoriser(adresse, { refuser: true })), { state: null, replaceState() {} });
  assert.deepEqual(await terminerLaConnexion({ retour, base, http: faux.http, maintenant }), { etat: "decline", raison: MOT_DECLINE });
  assert.equal(faux.requetes.length, 0);
});

test("K5 — 🔑 LA CONNEXION ENTIÈRE : le `code` contre les jetons, avec le vérificateur — ⛔ aucun secret, nulle part", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const echange = faux.requetes.find((r) => r.url === "https://api.dropboxapi.com/oauth2/token");
  const q = new URLSearchParams(echange.body);
  assert.equal(q.get("grant_type"), "authorization_code");
  assert.equal(q.get("client_id"), APP_KEY);
  assert.ok(q.get("code_verifier"));
  assert.equal(q.has("client_secret"), false);
  const jetons = d.base.rayons.get(RAYON_REGLAGES).get(CLEF_JETONS);
  assert.deepEqual(Object.keys(jetons).sort(), ["acces", "expire", "renouvellement"], "sur l'appareil, dans les réglages");
  assert.equal(d.base.rayons.get(RAYON_REGLAGES).has(CLEF_CONNEXION), false, "le vérificateur est parti");
  for (const f of fs.readdirSync(UI).filter((n) => /\.(mjs|html|js)$/.test(n))) {
    assert.equal(/client_secret|app_secret|appSecret/i.test(fs.readFileSync(path.join(UI, f), "utf8")), false, `⛔ un secret dans ${f}`);
  }
  assert.equal(/Math\.random/.test(dropboxSrc), false, "⛔ jamais Math.random");
  assert.equal(/console\./.test(dropboxSrc), false, "⛔ rien dans la console");
});

/* ══ J — LES JETONS ═════════════════════════════════════════════════════════════════════════════ */

test("J1 — 🔄 UN JETON EXPIRÉ SE RENOUVELLE SEUL — une fois pour deux appels en même temps", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  faux.expirerLesJetons();
  const avant = faux.requetes.filter((r) => r.url.endsWith("/oauth2/token")).length;
  const [a, b] = await Promise.all([d.loin.revisions(), d.loin.revisions()]);
  assert.equal(a.etat, "index");
  assert.equal(b.etat, "index");
  assert.equal(faux.requetes.filter((r) => r.url.endsWith("/oauth2/token")).length - avant, 1, "⭐ un seul renouvellement");
  /* à l'heure : le gardien renouvelle AVANT que le jeton ne meure */
  horloge += 5 * 3600 * 1000;
  assert.equal((await d.loin.revisions()).etat, "index");
  assert.equal(faux.requetes.filter((r) => r.url.endsWith("/oauth2/token")).length - avant, 2);
});

test("J2 — 🚪 RÉVOQUÉ CHEZ DROPBOX : le mot dit ce qui arrive ET la sortie ; les jetons morts partent ; ⛔ aucun repli", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  faux.revoquer();
  const issue = await d.loin.ecrire(texteDe(perso()), { revision: null });
  assert.deepEqual(issue, { ok: false, raison: MOT_DECONNECTE });
  assert.match(MOT_DECONNECTE, /open Vault and touch Dropbox/, "il NOMME la sortie");
  assert.equal(d.base.rayons.get(RAYON_REGLAGES).has(CLEF_JETONS), false);
  assert.equal(await d.jetons.connecte(), false);
  assert.deepEqual(await d.loin.revisions(), { etat: "refus", raison: MOT_DECONNECTE });
});

test("J3 — 🧾 LES PERMISSIONS PAS ENCORE COCHÉES (mesuré par ARCHI 35) : dit, et ⛔ les jetons restent", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  faux.retirerLesPortees();
  assert.deepEqual(await d.loin.ecrire(texteDe(perso()), { revision: null }), { ok: false, raison: MOT_SANS_PERMISSION });
  assert.equal(await d.jetons.connecte(), true, "⛔ un droit manquant n'est pas une déconnexion");
});

test("J4 — 🧹 VIDER LE CACHE APRÈS `Save character` NE DÉCONNECTE PAS DROPBOX", async () => {
  /* ⭐ Le cache, c'est `localStorage` (memoire.mjs) ; les jetons vivent dans la base (IndexedDB). On vide le
     cache PAR LES VRAIES FONCTIONS, et on regarde ce qui reste. */
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const magasin = new Map([["fhpc.personnage", "{}"], ["fhpc.base", "{}"], ["fhpc.recalage", "{}"]]);
  const local = { getItem: (k) => (magasin.has(k) ? magasin.get(k) : null), setItem: (k, v) => magasin.set(k, v), removeItem: (k) => magasin.delete(k) };
  oublierPersonnage(local); oublierBase(local); oublierRecalage(local);
  assert.equal(magasin.size, 0, "le cache est vidé");
  assert.equal(await d.jetons.connecte(), true, "⭐ Dropbox, lui, est toujours là");
  const vider = shell.match(/async function sauverPuisViderLeCache\(\) \{[\s\S]*?\n\}/)[0];
  assert.equal(/jetons|oublier\(\)|CLEF_JETONS|indexedDB|reglages/i.test(vider), false, "⛔ le vidage ne touche pas la base");
  assert.equal(/dropbox|jeton/i.test(lire("memoire.mjs")), false, "le cache ne connaît pas Dropbox");
});

test("J5 — 🔒 AUCUN JETON DANS LE DOCUMENT, NI DANS UNE ADRESSE", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const kara = perso();
  await d.app.ecrire(texteDe(kara), { revision: null });
  await sauverDansLesDeux({ appareil: d.app, choisi: d.loin, texte: texteDe(kara), revisionApp: "r1", revisionLoin: null, quand: "2026-09-30T10:00:00Z" });
  faux.expirerLesJetons();
  await sync(d);
  /* ⚔️ TOUS les jetons jamais donnés — ceux d'avant le renouvellement aussi : ils ont porté des envois. */
  const secrets = [...faux.emis];
  assert.ok(secrets.length >= 3, "le jeton d'accès, son renouvellement, et le jeton renouvelé");
  for (const r of faux.requetes) {
    for (const s of secrets) {
      assert.equal(r.url.includes(s), false, "⛔ un jeton dans une adresse");
      if (r.url.includes("/files/upload")) assert.equal(String(r.body).includes(s), false, "⛔ un jeton dans ce qui s'écrit");
    }
  }
  for (const [, texte] of faux.fichiers) for (const s of secrets) assert.equal(texte.texte.includes(s), false);
  for (const { valeur } of await d.base.tout("personnages")) for (const s of secrets) assert.equal(valeur.texte.includes(s), false);
});

/* ══ A — L'ADAPTATEUR ══════════════════════════════════════════════════════════════════════════ */

test("A1 — ⚖️ LA RÉVISION EST PORTÉE À CHAQUE ÉCRITURE — `update` sur le `rev` qu'on croit remplacer, `add` quand on croit qu'il n'y a rien", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const kara = perso();
  const premier = await d.loin.ecrire(texteDe(kara), { revision: null });
  assert.equal(premier.ok, true);
  const second = await d.loin.ecrire(texteDe({ ...kara, name: "Kara II" }), { revision: premier.revision });
  assert.equal(second.ok, true);
  assert.notEqual(second.revision, premier.revision);
  const envois = faux.requetes.filter((r) => r.url.endsWith("/files/upload")).map((r) => JSON.parse(r.headers["Dropbox-API-Arg"]));
  assert.deepEqual(envois[0], { path: chemin(kara.id), mode: "add", autorename: false, mute: true, strict_conflict: false });
  assert.deepEqual(envois[1], { path: chemin(kara.id), mode: { ".tag": "update", update: premier.revision }, autorename: false, mute: true, strict_conflict: true });
});

test("A2 — ⚔️ UN CONFLIT N'ÉCRASE RIEN : l'autre appareil a écrit, notre écriture est refusée avec la révision tenue", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const kara = perso();
  const r1 = (await d.loin.ecrire(texteDe(kara), { revision: null })).revision;
  const r2 = faux.ecrireDirectement(chemin(kara.id), texteDe({ ...kara, name: "Kara du Mac" }));
  const issue = await d.loin.ecrire(texteDe({ ...kara, name: "Kara de l'iPad" }), { revision: r1 });
  assert.deepEqual(issue, { ok: false, conflit: true, revision: r2 });
  assert.equal(JSON.parse(faux.lire(chemin(kara.id))).name, "Kara du Mac", "⛔ rien n'est écrasé");
});

test("A3 — ⚔️ EFFACÉ AILLEURS, JAMAIS RECRÉÉ EN SILENCE (`strict_conflict`) : le conflit rend une révision `null`", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const kara = perso();
  const r1 = (await d.loin.ecrire(texteDe(kara), { revision: null })).revision;
  faux.effacerDirectement(chemin(kara.id));
  assert.deepEqual(await d.loin.ecrire(texteDe({ ...kara, name: "Kara changée" }), { revision: r1 }), { ok: false, conflit: true, revision: null });
  assert.equal(faux.lire(chemin(kara.id)), null, "⛔ Kara n'est pas revenue");
});

test("A4 — 💾 `SAVE CHARACTER` GARDE UNE VERSION DATÉE CHEZ DROPBOX, jamais écrasée — la clef du dossier", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const kara = perso();
  const s1 = await sauverDansLesDeux({ appareil: d.app, choisi: d.loin, texte: texteDe(kara), revisionApp: null, revisionLoin: null, quand: "2026-09-30T10:00:00Z" });
  assert.equal(s1.ok, true);
  assert.equal(typeof s1.revisionLoin, "string", "la révision de Dropbox revient à la coquille");
  /* le même Save dans la même seconde, et un contenu identique : le lieu tient déjà Kara (`loinAJour`) */
  const s2 = await sauverDansLesDeux({ appareil: d.app, choisi: d.loin, texte: texteDe(kara), revisionApp: s1.revision, revisionLoin: s1.revisionLoin, loinAJour: true, quand: "2026-09-30T10:00:00Z" });
  assert.equal(s2.ok, true, "⭐ sans `loinAJour`, `strict_conflict` ferait d'un contenu identique un conflit");
  assert.equal(s2.revisionLoin, s1.revisionLoin, "la copie courante n'a pas bougé");
  const versions = [...faux.fichiers.values()].filter((f) => f.chemin.startsWith(`${DOSSIER_VERSIONS}/${kara.id}/`)).map((f) => f.chemin).sort();
  assert.deepEqual(versions, [
    `${DOSSIER_VERSIONS}/${kara.id}/kara.2026-09-30t10-00-00z.fh-char.json`,
    `${DOSSIER_VERSIONS}/${kara.id}/kara.2026-09-30t10-00-00z~2.fh-char.json`
  ], "deux Save, deux versions — ⛔ rien n'est écrasé");
  /* ⚖️ un Save d'un perso CHANGÉ porte la révision commune — et une révision périmée est refusée */
  const s3 = await sauverDansLesDeux({ appareil: d.app, choisi: d.loin, texte: texteDe({ ...kara, name: "Kara II" }), revisionApp: s2.revision, revisionLoin: s1.revisionLoin, quand: "2026-09-30T11:00:00Z" });
  assert.equal(s3.ok, true);
  const dernier = faux.requetes.filter((r) => r.url.endsWith("/files/upload")).map((r) => JSON.parse(r.headers["Dropbox-API-Arg"])).pop();
  assert.deepEqual(dernier.mode, { ".tag": "update", update: s1.revisionLoin }, "la révision commune, portée");
  const perime = await sauverDansLesDeux({ appareil: d.app, choisi: d.loin, texte: texteDe({ ...kara, name: "Kara III" }), revisionApp: s3.revision, revisionLoin: s1.revisionLoin, quand: "2026-09-30T12:00:00Z" });
  assert.deepEqual([perime.ok, perime.ou, perime.conflit, perime.revisionLoin], [false, "choisi", true, s3.revisionLoin], "⛔ rien n'est écrasé");
  assert.equal(JSON.parse(faux.lire(chemin(kara.id))).name, "Kara II");
  /* la sauvegarde automatique, elle, ne fabrique AUCUNE version */
  const versionsAvant = [...faux.fichiers.values()].filter((f) => f.chemin.startsWith(`${DOSSIER_VERSIONS}/`)).length;
  assert.equal((await d.loin.ecrire(texteDe({ ...kara, name: "Kara IV" }), { revision: s3.revisionLoin })).ok, true);
  assert.equal([...faux.fichiers.values()].filter((f) => f.chemin.startsWith(`${DOSSIER_VERSIONS}/`)).length, versionsAvant);
});

test("A5 — 🗑️ LA POUBELLE EFFACE CHEZ DROPBOX (copie ET versions), PUIS DANS L'APP — et un refus de Dropbox garde l'app", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const kara = perso();
  const lea = perso({ id: "sonde-lea", nom: "Léa" });
  for (const p of [kara, lea]) await sauverDansLesDeux({ appareil: d.app, choisi: d.loin, texte: texteDe(p), revisionApp: null, revisionLoin: null, quand: "2026-09-30T10:00:00Z" });
  const issue = await effacerSelonLeStockage({ appareil: d.app, choisi: d.loin, id: kara.id });
  assert.deepEqual(issue, { ok: true, ou: [MOT_DE_DROPBOX, "in this app"] });
  assert.equal([...faux.fichiers.values()].some((f) => f.chemin.includes(kara.id)), false, "copie et versions : parties");
  assert.equal([...faux.fichiers.values()].filter((f) => f.chemin.includes(lea.id)).length, 2, "⛔ Léa n'est pas touchée");
  assert.deepEqual(await d.app.lire(kara.id), { etat: "absent" });
  faux.revoquer();
  assert.equal((await effacerSelonLeStockage({ appareil: d.app, choisi: d.loin, id: lea.id })).ok, false);
  assert.equal((await d.app.lire(lea.id)).etat, "lu", "⛔ l'app garde Léa : on n'efface pas ici ce qu'on n'a pas su effacer là-bas");
});

test("A6 — 📇 L'INDEX : les révisions sans le contenu, page après page ; un `id` à deux-points fait l'aller-retour", async () => {
  const faux = fauxDropbox({ maxParPage: 2 });
  const d = await appareilConnecte(faux);
  const ids = ["a1", "b2", "c3", "urn:fh:d4", "e5"];
  for (const id of ids) await d.loin.ecrire(texteDe(perso({ id, nom: id })), { revision: null });
  const index = await d.loin.revisions();
  assert.equal(index.etat, "index");
  assert.deepEqual(index.entrees.map((e) => e.id).sort(), [...ids].sort());
  assert.ok(faux.requetes.some((r) => r.url.endsWith("/list_folder/continue")), "⭐ la suite des pages est lue");
  assert.equal(faux.requetes.filter((r) => r.url.endsWith("/files/download")).length, 0, "⛔ rien n'est téléchargé pour l'index");
  assert.equal(nomDeLId("urn:fh:d4"), "urn~fh~d4");
  assert.equal(idDuNom("urn~fh~d4.fh-char.json"), "urn:fh:d4");
  assert.throws(() => nomDeLId("../evil"), /usable id/);
  assert.deepEqual(await creerStockage(adaptateurDropbox({ http: fauxDropbox().http, jetons: { jeton: async () => "x", oublier: async () => {} } })).revisions(),
    { etat: "refus", raison: MOT_DECONNECTE }, "un jeton inconnu de Dropbox : dit");
  const vide = await appareilConnecte(fauxDropbox());
  assert.deepEqual(await vide.loin.revisions(), { etat: "index", entrees: [] }, "un dossier jamais créé n'est pas une panne");
});

test("A7 — 📦 `keepalive` AU PASSAGE EN ARRIÈRE-PLAN, sous son plafond seulement — au-delà, l'envoi part sans lui", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const petit = perso();
  await d.loin.ecrire(texteDe(petit), { revision: null, urgent: true });
  const gros = perso({ id: "sonde-gros", nom: "Gros", choix: [{ at: "x", value: "y".repeat(PLAFOND_KEEPALIVE + 10) }] });
  await d.loin.ecrire(texteDe(gros), { revision: null, urgent: true });
  await d.loin.ecrire(texteDe(perso({ id: "sonde-calme", nom: "Calme" })), { revision: null });
  const envois = faux.requetes.filter((r) => r.url.endsWith("/files/upload"));
  assert.deepEqual(envois.map((r) => r.keepalive), [true, false, false]);
  assert.ok(PLAFOND_KEEPALIVE < 64 * 1024, "sous les 64 Kio de la Fetch Standard");
  /* ⚠️ un navigateur qui REFUSE `keepalive` avec une pré-requête jette : l'envoi repart sans lui, une fois */
  const essais = [];
  const http = httpAvecRepli(async (url, init) => { essais.push(init.keepalive === true); if (init.keepalive) throw new TypeError("keepalive preflight"); return { ok: true }; });
  assert.deepEqual(await http("https://content.dropboxapi.com/2/files/upload", { method: "POST", keepalive: true }), { ok: true });
  assert.deepEqual(essais, [true, false]);
  const horsLigne = httpAvecRepli(async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(horsLigne("https://api.dropboxapi.com/2/files/list_folder", { method: "POST" }), /Failed to fetch/, "sans keepalive, la panne remonte telle quelle");
});

/* ══ S — LA SYNCHRO ═══════════════════════════════════════════════════════════════════════════ */

test("S1 — 📋 LA TABLE DE DÉCISION, ÉTAT PAR ÉTAT", () => {
  const A = { repere: "A" };
  const B = { repere: "B" };
  const loin = (revision) => ({ revision });
  const commun = (revision, repere) => ({ revision, repere });
  const lignes = [
    [{ app: null, loin: null, commun: null }, "rien"],
    [{ app: A, loin: null, commun: null }, "envoyer"],
    [{ app: A, loin: null, commun: commun("r1", "A") }, "retirer-ici"],
    [{ app: A, loin: null, commun: commun("r1", "Z") }, "question-efface"],
    [{ app: null, loin: loin("r1"), commun: null }, "recevoir"],
    [{ app: null, loin: loin("r1"), commun: commun("r1", "A") }, "recevoir"],
    [{ app: A, loin: loin("r1"), commun: commun("r1", "A") }, "rien"],
    [{ app: A, loin: loin("r1"), commun: commun("r1", "Z") }, "envoyer"],
    [{ app: A, loin: loin("r2"), commun: commun("r1", "A") }, "lire-le-loin"],
    [{ app: A, loin: loin("r2"), commun: null }, "lire-le-loin"],
    [{ app: A, loin: loin("r2"), commun: commun("r1", "A"), repereLoin: "B" }, "recevoir"],
    [{ app: A, loin: loin("r2"), commun: commun("r1", "Z"), repereLoin: "B" }, "question"],
    [{ app: A, loin: loin("r2"), commun: commun("r1", "Z"), repereLoin: "A" }, "lier"],
    [{ app: A, loin: loin("r2"), commun: null, repereLoin: "A" }, "lier"],
    [{ app: B, loin: loin("r2"), commun: null, repereLoin: "A" }, "question"]
  ];
  for (const [faits, attendu] of lignes) assert.equal(decisionDeSynchro(faits), attendu, JSON.stringify(faits));
});

test("S2 — 🤝 DEUX APPAREILS, UN DROPBOX — l'essai d'Eric, rejoué : l'iPad sauve, le Mac reçoit, le Mac modifie, l'iPad reçoit", async () => {
  const faux = fauxDropbox();
  const ipad = await appareilConnecte(faux);
  const mac = await appareilConnecte(faux);
  const kara = perso();
  /* ① l'iPad sauve Kara (Save character) */
  const s = await sauverDansLesDeux({ appareil: ipad.app, choisi: ipad.loin, texte: texteDe(kara), revisionApp: null, revisionLoin: null, quand: "2026-09-30T10:00:00Z" });
  await poserUnCommun(ipad.base, "dropbox", kara.id, { revision: s.revisionLoin, repere: repereDe(kara) });
  /* ② le Mac s'ouvre : Kara arrive */
  const vuMac = await sync(mac);
  assert.deepEqual(vuMac.faits.map((f) => [f.id, f.geste, f.ok]), [[kara.id, "recevoir", true]]);
  assert.equal((await mac.app.lire(kara.id)).document.name, "Kara");
  /* ③ le Mac la modifie (sa copie de l'app), la synchro l'envoie */
  const surMac = await mac.app.lire(kara.id);
  await mac.app.ecrire(texteDe({ ...kara, name: "Kara du Mac" }), { revision: surMac.revision });
  assert.deepEqual((await sync(mac)).faits.map((f) => f.geste), ["envoyer"]);
  /* ④ l'iPad s'ouvre : la modification arrive */
  const vuIpad = await sync(ipad);
  assert.deepEqual(vuIpad.faits.map((f) => [f.geste, f.ok]), [["recevoir", true]]);
  assert.equal((await ipad.app.lire(kara.id)).document.name, "Kara du Mac");
  assert.deepEqual(vuIpad.questions, []);
  /* ⑤ et plus rien ne bouge : aucune écriture quand rien n'a changé (375) */
  const avant = faux.requetes.filter((r) => r.url.endsWith("/files/upload")).length;
  assert.deepEqual((await sync(ipad)).faits, []);
  assert.deepEqual((await sync(mac)).faits, []);
  assert.equal(faux.requetes.filter((r) => r.url.endsWith("/files/upload")).length, avant);
});

test("S3 — ❓ MODIFIÉ DES DEUX CÔTÉS : la question, rien d'écrasé ; `This one` envoie, `The other one` reçoit", async () => {
  const faux = fauxDropbox();
  const ipad = await appareilConnecte(faux);
  const mac = await appareilConnecte(faux);
  const kara = perso();
  await ipad.app.ecrire(texteDe(kara), { revision: null });
  await sync(ipad);
  await sync(mac);
  /* les deux changent Kara sans se voir */
  await mac.app.ecrire(texteDe({ ...kara, name: "Kara du Mac" }), { revision: (await mac.app.lire(kara.id)).revision });
  await sync(mac);
  await ipad.app.ecrire(texteDe({ ...kara, name: "Kara de l'iPad" }), { revision: (await ipad.app.lire(kara.id)).revision });
  const vu = await sync(ipad);
  assert.deepEqual(vu.questions, [{ id: kara.id, nom: "Kara de l'iPad", genre: "modifie" }]);
  assert.equal(JSON.parse(faux.lire(chemin(kara.id))).name, "Kara du Mac", "⛔ Dropbox n'a rien perdu");
  assert.equal((await ipad.app.lire(kara.id)).document.name, "Kara de l'iPad", "⛔ l'iPad non plus");
  assert.deepEqual((await sync(ipad)).questions.length, 1, "la question revient tant qu'on n'a pas répondu");
  /* `This one` : la version de l'iPad part */
  assert.deepEqual(await trancherLaSynchro({ appareil: ipad.app, loin: ipad.loin, base: ipad.base, lieu: "dropbox", id: kara.id, genre: "modifie", voie: "ici" }), { ok: true, geste: "envoyer" });
  assert.equal(JSON.parse(faux.lire(chemin(kara.id))).name, "Kara de l'iPad");
  /* sur le Mac, `The other one` : la version de Dropbox remplace la sienne */
  await mac.app.ecrire(texteDe({ ...kara, name: "Kara du Mac II" }), { revision: (await mac.app.lire(kara.id)).revision });
  assert.equal((await sync(mac)).questions.length, 1);
  assert.deepEqual(await trancherLaSynchro({ appareil: mac.app, loin: mac.loin, base: mac.base, lieu: "dropbox", id: kara.id, genre: "modifie", voie: "ailleurs" }), { ok: true, geste: "recevoir" });
  assert.equal((await mac.app.lire(kara.id)).document.name, "Kara de l'iPad");
  assert.deepEqual((await sync(mac)).faits, []);
});

test("S4 — 🗑️ EFFACÉE SUR LE MAC : inchangée sur l'iPad → elle part ; CHANGÉE → la question (ARCHI 35 : (b)) ; `Keep` la renvoie, `Delete` la retire", async () => {
  const faux = fauxDropbox();
  const ipad = await appareilConnecte(faux);
  const mac = await appareilConnecte(faux);
  const kara = perso();
  const lea = perso({ id: "sonde-lea", nom: "Léa" });
  for (const p of [kara, lea]) await ipad.app.ecrire(texteDe(p), { revision: null });
  await sync(ipad);
  await sync(mac);
  /* le Mac met les deux à la poubelle */
  for (const p of [kara, lea]) assert.equal((await effacerSelonLeStockage({ appareil: mac.app, choisi: mac.loin, id: p.id })).ok, true);
  /* l'iPad a changé Kara entre-temps, pas Léa */
  await ipad.app.ecrire(texteDe({ ...kara, name: "Kara changée" }), { revision: (await ipad.app.lire(kara.id)).revision });
  const vu = await sync(ipad);
  assert.deepEqual(vu.faits.map((f) => [f.id, f.geste]), [[lea.id, "retirer-ici"]]);
  assert.deepEqual(vu.questions, [{ id: kara.id, nom: "Kara changée", genre: "efface" }]);
  assert.equal((await ipad.app.lire(kara.id)).etat, "lu", "⛔ Kara reste tant que le joueur n'a pas répondu");
  assert.deepEqual(await ipad.app.lire(lea.id), { etat: "absent" });
  /* `Keep` */
  assert.deepEqual(await trancherLaSynchro({ appareil: ipad.app, loin: ipad.loin, base: ipad.base, lieu: "dropbox", id: kara.id, genre: "efface", voie: "garder" }), { ok: true, geste: "envoyer" });
  assert.equal(JSON.parse(faux.lire(chemin(kara.id))).name, "Kara changée", "elle repart vers Dropbox");
  /* et `Delete`, sur un second tour */
  faux.effacerDirectement(chemin(kara.id));
  await ipad.app.ecrire(texteDe({ ...kara, name: "Kara encore" }), { revision: (await ipad.app.lire(kara.id)).revision });
  assert.equal((await sync(ipad)).questions[0].genre, "efface");
  assert.deepEqual(await trancherLaSynchro({ appareil: ipad.app, loin: ipad.loin, base: ipad.base, lieu: "dropbox", id: kara.id, genre: "efface", voie: "effacer" }), { ok: true, geste: "retirer-ici" });
  assert.deepEqual(await ipad.app.lire(kara.id), { etat: "absent" });
  assert.deepEqual(await lireLesCommuns(ipad.base, "dropbox"), {});
});

test("S5 — 🔗 JAMAIS RAPPROCHÉS : même personnage des deux côtés → `lier` ; différent → la question ; nouveau ici → envoyé", async () => {
  const faux = fauxDropbox();
  const d = await appareilConnecte(faux);
  const kara = perso();
  const lea = perso({ id: "sonde-lea", nom: "Léa" });
  const mia = perso({ id: "sonde-mia", nom: "Mia" });
  faux.ecrireDirectement(chemin(kara.id), texteDe({ ...kara, modified: "2026-09-30T09:00:00Z" }));   // à l'estampille près
  faux.ecrireDirectement(chemin(lea.id), texteDe({ ...lea, name: "Léa d'ailleurs" }));
  for (const p of [kara, lea, mia]) await d.app.ecrire(texteDe(p), { revision: null });
  const vu = await sync(d);
  assert.deepEqual(vu.faits.map((f) => [f.id, f.geste]).sort(), [[kara.id, "lier"], [mia.id, "envoyer"]].sort());
  assert.deepEqual(vu.questions.map((q) => [q.id, q.genre]), [[lea.id, "modifie"]]);
  assert.equal(JSON.parse(faux.lire(chemin(mia.id))).name, "Mia");
});

test("S6 — ✉️ LE COURRIER : jamais deux envois en vol pour le même perso — le plus récent gagne", async () => {
  const lances = [];
  let enVol = 0;
  let maxEnVol = 0;
  let version = 0;
  const liberer = [];
  const courrier = creerCourrier(async (id, options) => {
    enVol += 1; maxEnVol = Math.max(maxEnVol, enVol);
    lances.push({ id, version, urgent: options.urgent === true });
    await new Promise((r) => liberer.push(r));
    enVol -= 1;
    return { ok: true };
  });
  version = 1; const p1 = courrier.poster("kara");
  version = 2; courrier.poster("kara");
  version = 3; courrier.poster("kara", { urgent: true });
  courrier.poster("lea");
  assert.deepEqual(lances.map((l) => [l.id, l.version]), [["kara", 1], ["lea", 3]], "Léa ne fait pas la queue derrière Kara");
  liberer.shift()();                           // le premier vol de Kara se pose
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(lances.filter((l) => l.id === "kara").map((l) => [l.version, l.urgent]), [[1, false], [3, true]],
    "⭐ UN seul envoi de plus, qui lit le plus récent, et garde l'urgence");
  while (liberer.length) { liberer.shift()(); await new Promise((r) => setImmediate(r)); }
  assert.deepEqual(await p1, { ok: true });
  assert.equal(courrier.enVol("kara"), false);
  assert.ok(maxEnVol <= 2, "un par perso");
});

/* ══ P — LA QUESTION ═══════════════════════════════════════════════════════════════════════════ */

test("P1 — 🗣️ LA QUESTION DIT D'OÙ VIENT L'AUTRE VERSION, PAR LA DONNÉE ; « effacé ailleurs » : `Keep` · `Delete` en rouge", () => {
  const faits = [];
  const modifie = popupDeLaReouverture({ nom: "Kara", ailleurs: MOT_AILLEURS_DE_DROPBOX, choisir: (v) => faits.push(v) });
  assert.equal(modifie.titre, "Which version do you keep?");
  assert.match(modifie.texte, /^Kara was also changed on another device after you opened it here\. Nothing was overwritten\.$/);
  assert.deepEqual(modifie.actions.map((a) => a.mot), ["This one", "The other one"]);
  assert.equal(modifie.exigeUneReponse, true);
  const efface = popupDeLaReouverture({ nom: "Kara", ailleurs: MOT_AILLEURS_DE_DROPBOX, genre: "efface", choisir: (v) => faits.push(v) });
  assert.equal(efface.titre, "Keep this character?");
  assert.match(efface.texte, /^Kara was deleted on another device, but was changed here since\. Nothing was deleted here\.$/);
  assert.deepEqual(efface.actions.map((a) => [a.mot, a.defait === true]), [["Keep", false], ["Delete", true]]);
  assert.equal(efface.exigeUneReponse, true);
  efface.actions.forEach((a) => a.faire());
  assert.deepEqual(faits, ["garder", "effacer"]);
  /* l'autre onglet garde son mot d'avant */
  assert.match(popupDeLaReouverture({ nom: "Kara", choisir() {} }).texte, /changed in another window/);
  /* ⛔ la coquille passe la DONNÉE, jamais un nom */
  assert.match(shell, /ailleurs: state\.stockage\.choisi\.capacites\.ailleurs,/);
  assert.match(shell, /ailleurs: state\.stockage\.appareil\.capacites\.ailleurs,/);
  assert.equal(/=== "dropbox"|"dropbox" ===/.test(shell), false, "⛔ aucun test sur le nom d'un lieu");
});

/* ══ C — LA COQUILLE ══════════════════════════════════════════════════════════════════════════ */

test("C1 — 🔒 LE RETOUR EST LU EN PREMIER : la première instruction de la coquille retire le `code` de l'adresse", () => {
  const brut = fs.readFileSync(path.join(UI, "shell.mjs"), "utf8");
  const sansImports = stripComments(brut).replace(/^import[\s\S]*?from\s+"[^"]+";/gm, "").replace(/^import\s+"[^"]+";/gm, "");
  const premiere = sansImports.split("\n").map((l) => l.trim()).find((l) => l !== "");
  assert.equal(premiere, "const RETOUR_DE_CONNEXION = typeof window !== \"undefined\" && window.location && window.history");
  assert.match(shell, /\? retirerLeRetour\(window\.location, window\.history\) : null;/);
});

test("C2 — 🔌 DROPBOX ENTRE PAR UNE LIGNE DE TABLE ET UN ADAPTATEUR ; le lieu de rencontre se lit dans sa DONNÉE", () => {
  assert.match(shell, /dropbox: async \(base\) => creerStockage\(adaptateurDropbox\(\{ http: httpDuNavigateur, jetons: jetonsDe\(base\) \}\)\),/);
  assert.match(shell, /function lieuDeRencontre\(\) \{ return Boolean\(state\.stockage && state\.stockage\.choisi && state\.stockage\.choisi\.capacites\.rencontre\); \}/);
  const choisir = shell.slice(shell.indexOf('action.kind === "choisirUnLieu"'), shell.indexOf('action.kind === "choisirLeLieu"'));
  assert.match(choisir, /LIEUX\.some\(\(l\) => l\.id === action\.id && l\.connexion === true\)/, "la connexion se lit dans la table");
  const partir = shell.match(/async function partirSeConnecter\(connexion\) \{[\s\S]*?\n\}/)[0];
  const rangEnvoi = partir.indexOf("await envoyerMaintenant();");
  assert.ok(rangEnvoi > 0 && rangEnvoi < partir.indexOf("location.assign("), "⭐ la sauvegarde en attente part AVANT de quitter la page");
});

test("C3 — 🔄 LA SYNCHRO AU DÉMARRAGE ET À L'OUVERTURE DE MY CHARACTERS ; les files dans un ordre fixe", () => {
  const monter = shell.match(/async function monterLeStockage\(\) \{[\s\S]*?\n\}/)[0];
  assert.match(monter, /await reouvrirLaCopieDeTravail\(\);\s*await synchroniserLeLieu\(\);/);
  const magasin = shell.slice(shell.indexOf('action.kind === "ouvrirLeMagasin"'), shell.indexOf('action.kind === "ouvrirUnPersonnage"'));
  assert.match(magasin, /void synchroniserLeLieu\(\{ clic: true \}\)\.then\(\(\) => rafraichirLesPersonnages\(\)\);/);
  assert.match(shell, /const issue = await enFileDuLoin\(\(\) => enFileDeLApp\(async \(\) => \{/, "Save : le lieu DEHORS, l'app dedans");
  assert.equal(/enFileDeLApp\(\s*(async )?\(\) => enFileDuLoin/.test(shell), false, "⛔ jamais l'ordre inverse");
  const synchro = shell.match(/async function synchroniserLeLieu\(\{ clic = false \} = \{\}\) \{[\s\S]*?\n\}/)[0];
  assert.match(synchro, /const issue = await enFileDuLoin\(\(\) => \{/);
});

test("C4 — ✉️ L'ENVOI AUTOMATIQUE VERS DROPBOX : après une vraie écriture de l'app, rien quand rien n'a changé (375), sur la révision commune", () => {
  const envoi = shell.match(/function envoyerALApp\(\{ urgent = false \} = \{\}\) \{[\s\S]*?\n\}/)[0];
  assert.match(envoi, /if \(issue\.ok && lieuDeRencontre\(\)\) void courrier\.poster\(id, \{ urgent \}\)/);
  const loin = shell.match(/async function envoyerAuLoin\(id, \{ urgent = false \} = \{\}\) \{[\s\S]*?\n\}/)[0];
  const rang = (m) => loin.indexOf(m);
  assert.ok(rang("if (commun && commun.repere === repere) return { ok: true, inchange: true };") > 0);
  assert.ok(rang("if (commun && commun.repere === repere)") < rang("choisi.ecrire("), "⛔ le test AVANT l'envoi");
  assert.match(loin, /choisi\.ecrire\(canonicalText\(document\), \{ revision: commun \? commun\.revision : null, urgent \}\)/);
  assert.match(loin, /await poserUnCommun\(base, lieu, id, \{ revision: issue\.revision, repere \}\);/);
  assert.match(loin, /state\.envoi = \{ etat: "refus", raison: issue\.conflit \? MOT_CHANGE_SUR_UN_AUTRE_APPAREIL : issue\.raison, lieu: mot \};/,
    "un envoi raté se DIT, et le lieu se nomme par sa donnée");
});

test("C5 — 💾 `SAVE CHARACTER` PORTE LA RÉVISION COMMUNE, et pose la nouvelle ; un conflit vu dans le clic pose la question tout de suite", () => {
  const organe = shell.match(/async function exporterJson\([\s\S]{0,4000}?\n\}\n/)[0];
  assert.match(organe, /revisionLoin: commun \? commun\.revision : null,/);
  assert.match(organe, /loinAJour: Boolean\(commun && commun\.repere === repere\),/);
  assert.match(organe, /if \(verdict\.ok && rencontre\) await poserUnCommun\(base, lieu, id, \{ revision: verdict\.revisionLoin, repere \}\);/);
  assert.match(organe, /if \(issue\.conflit && rencontre\) \{ void synchroniserLeLieu\(\{ clic: true \}\); return false; \}/);
  const efface = shell.slice(shell.indexOf('action.kind === "effacerUnPersonnage"'), shell.indexOf('action.kind === "ouvrirVault"'));
  assert.match(efface, /if \(lieuDeRencontre\(\)\) await poserUnCommun\(state\.stockage\.base, state\.stockage\.lieu, action\.id, null\);/);
});
