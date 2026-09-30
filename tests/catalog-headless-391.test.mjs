/* ══ LOT 391 — LE SCRIPT HEADLESS : un texte de créateur devient un catalog vérifié ══════════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 391 catalog headless.md` (ARCHI 35, 30/09).
   ⛔ `npm test` n'appelle JAMAIS le vrai Claude : chaque garde passe le FAUX (`tests/faux-claude.mjs`), par un petit
   exécutable posé dans un dossier temporaire.

   🔴 CE QUE CE FICHIER GARDE :
     H1. Un JSON accepté du premier coup est écrit — aux octets que le juge a lus — en UN appel.
     H2. Un JSON fautif puis corrigé est écrit au DEUXIÈME tour ; le second prompt porte les fautes DU JUGE (chemin
         et phrase) et le fichier fautif.
     H3. Trois refus n'écrivent RIEN et sortent en erreur (1), avec les fautes ; jamais un quatrième appel.
     H4. Le JSON se lit même entouré de texte (une phrase, un bloc ```json) ; une réponse sans JSON est un tour raté.
     H5. L'appel : `claude -p`, sans outils, sans session, hors de tout dépôt ; le prompt porte le texte du GUIDE, le
         MODÈLE, la demande (id, auteur) et le livre. Aucune clef, aucun secret.
     H6. La commande : mal appelée → 2 ; une sortie qui existe déjà n'est jamais remplacée ; `claude` qui ne répond pas
         → 3 ; un id ou un auteur changés par Claude ne s'écrivent pas.
     H7. UN SEUL JUGE : le verdict vient de `verifier-catalog --json` ; le script ne porte aucune règle du format.
     H8. Le guide dit le mode d'emploi (« Headless, on your own computer »). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "tools", "catalog-headless.mjs");
const FAUX = path.join(ROOT, "tests", "faux-claude.mjs");
const { extraireLeJson, texteDuGuidePourLIA, TOURS_PERMIS } = await import("../tools/catalog-headless.mjs");
const { verifierUnCatalog } = await import("../src/catalog/juge.mjs");

const ID = "testeur-brumes";
const AUTEUR = "Test Author";
const LIVRE = "# The Mists\n\nA small book. The Fog Lantern is a lantern that sees through mist. Cost 5 GP, weight 2 lb.\n";

/** Un catalog ACCEPTABLE, bâti sur le modèle du 390, à l'id et à l'auteur demandés. */
function bonCatalog() {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "catalog-modele.layer.json"), "utf8"));
  m.id = ID; m.name = "The Mists"; m.attribution.author = AUTEUR;
  for (const g of Object.keys(m.records)) m.records[g] = Object.fromEntries(Object.entries(m.records[g]).map(([k, v]) => [k.replace("example-emberwood", ID), v]));
  m.records.background[`${ID}:background:en:lantern-keeper`].data.feat_id = `${ID}:feat:en:ashen-resolve`;
  return m;
}
const fautif = () => { const m = bonCatalog(); delete m.attribution.license; m.flags = ["fh.destiny"]; return m; };

/** Un banc : un dossier, le faux `claude` en exécutable, ses réponses, le livre. Rend de quoi lancer la commande. */
function banc(reponses) {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "headless-391-"));
  fs.writeFileSync(path.join(dossier, "reponses.json"), JSON.stringify(reponses));
  const claude = path.join(dossier, "claude");
  fs.writeFileSync(claude, `#!/bin/sh\nexec "${process.execPath}" "${FAUX}" "$@"\n`);
  fs.chmodSync(claude, 0o755);
  fs.writeFileSync(path.join(dossier, "livre.md"), LIVRE);
  const sortie = path.join(dossier, "sortie.layer.json");
  const lancer = (extra = []) => spawnSync(process.execPath, [SCRIPT, "--book", path.join(dossier, "livre.md"), "--id", ID, "--author", AUTEUR,
    "--out", sortie, "--claude", claude, ...extra], { encoding: "utf8", env: { ...process.env, FAUX_CLAUDE_DOSSIER: dossier } });
  const appels = () => fs.readdirSync(dossier).filter((f) => f.startsWith("appel-")).sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dossier, f), "utf8")));
  return { dossier, sortie, lancer, appels, fin: () => fs.rmSync(dossier, { recursive: true, force: true }) };
}
const enTexte = (o) => JSON.stringify(o, null, 2);

/* ══ LA BOUCLE ═══════════════════════════════════════════════════════════════════════════════════════ */

test("H1 — ✅ UN JSON ACCEPTÉ DU PREMIER COUP est écrit — aux octets que le juge a lus — en UN appel", () => {
  const b = banc([enTexte(bonCatalog())]);
  try {
    const r = b.lancer();
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.equal(b.appels().length, 1, "un seul appel");
    assert.ok(fs.existsSync(b.sortie), "⭐ écrit");
    const v = verifierUnCatalog(new Uint8Array(fs.readFileSync(b.sortie)));
    assert.equal(v.etat, "valide", "le fichier écrit est celui que le juge accepte");
    assert.equal(v.id, ID);
    assert.match(r.stdout, /Accepted on round 1: "The Mists" by Test Author, 8 records/);
  } finally { b.fin(); }
});

test("H2 — 🔁 UN JSON FAUTIF PUIS CORRIGÉ est écrit au DEUXIÈME tour — et le second prompt porte les fautes DU JUGE et le fichier fautif", () => {
  const b = banc([enTexte(fautif()), enTexte(bonCatalog())]);
  try {
    const r = b.lancer();
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const [un, deux] = b.appels();
    assert.equal(b.appels().length, 2);
    assert.ok(fs.existsSync(b.sortie), "⭐ écrit au deuxième tour");
    /* les fautes que le JUGE a dites pour le premier fichier, telles quelles */
    const fautesDuJuge = verifierUnCatalog(new TextEncoder().encode(`${enTexte(fautif())}\n`)).fautes;
    assert.ok(fautesDuJuge.length >= 2);
    for (const f of fautesDuJuge) assert.ok(deux.prompt.includes(`- ${f.chemin} — ${f.phrase}`), `le second prompt porte « ${f.chemin} »`);
    assert.match(deux.prompt, /Your previous answer was refused\. Fix EVERY fault below/);
    assert.ok(deux.prompt.includes("\"fh.destiny\""), "…et le fichier fautif");
    assert.equal(un.prompt.includes("Your previous answer was refused"), false, "le premier prompt ne parle d'aucune faute");
    assert.match(r.stdout, /Round 1: refused, \d+ faults\.[\s\S]*Accepted on round 2/);
  } finally { b.fin(); }
});

test("H3 — ⛔ TROIS REFUS N'ÉCRIVENT RIEN et sortent en erreur, avec les fautes — jamais un quatrième appel", () => {
  const b = banc([enTexte(fautif()), enTexte(fautif()), enTexte(fautif()), enTexte(bonCatalog())]);
  try {
    const r = b.lancer();
    assert.equal(r.status, 1);
    assert.equal(b.appels().length, TOURS_PERMIS, "⛔ au plus 3 tours : le quatrième (qui aurait réussi) n'est jamais demandé");
    assert.equal(TOURS_PERMIS, 3);
    assert.equal(fs.existsSync(b.sortie), false, "⛔ rien n'est écrit");
    assert.match(r.stdout, /Still refused after 3 rounds — nothing was written\. The faults left:/);
    assert.match(r.stdout, /· attribution\.license — Missing\./, "les fautes restantes sont dites");
    assert.match(r.stdout, /· flags — /);
    assert.deepEqual(fs.readdirSync(b.dossier).filter((f) => f.endsWith(".layer.json")), [], "et aucun brouillon laissé à côté");
  } finally { b.fin(); }
});

test("H4 — 🔎 LE JSON SE LIT MÊME ENTOURÉ DE TEXTE ; une réponse sans JSON est un tour raté, dit à Claude", () => {
  const json = enTexte(bonCatalog());
  assert.equal(extraireLeJson(`Here is your catalog:\n\n\`\`\`json\n${json}\n\`\`\`\n\nTell me if you want more.`), json);
  assert.equal(extraireLeJson(`Sure! ${json} Hope it helps {not json}.`), json, "sans bloc : le plus grand objet équilibré qui s'analyse");
  assert.equal(extraireLeJson("I cannot do that."), null);
  assert.equal(JSON.parse(extraireLeJson(`{"a": "}{"} and ${json}`)).id, ID, "une accolade dans une chaîne ne trompe pas le lecteur");
  const b = banc([`Of course! Here it is:\n\`\`\`json\n${json}\n\`\`\`\nEnjoy.`]);
  try {
    assert.equal(b.lancer().status, 0);
    assert.ok(fs.existsSync(b.sortie), "entouré de texte : lu et écrit");
  } finally { b.fin(); }
  const c = banc(["Sorry, I can't.", json]);
  try {
    const r = c.lancer();
    assert.equal(r.status, 0);
    assert.match(c.appels()[1].prompt, /- The answer holds no JSON object\. Answer with the JSON file only\./, "le tour raté est dit à Claude");
  } finally { c.fin(); }
});

/* ══ L'APPEL ET LA COMMANDE ═══════════════════════════════════════════════════════════════════════════ */

test("H5 — 📞 L'APPEL : `claude -p`, sans outils, sans session, hors de tout dépôt ; le prompt porte le guide, le modèle, la demande et le livre", () => {
  const b = banc([enTexte(bonCatalog())]);
  try {
    b.lancer(["--license", "CC0-1.0"]);
    const [appel] = b.appels();
    assert.deepEqual(appel.args, ["-p", "--output-format", "text", "--tools", "", "--no-session-persistence"]);
    assert.ok(appel.cwd.startsWith(fs.realpathSync(os.tmpdir())) && !appel.cwd.startsWith(ROOT), "⛔ jamais dans le dépôt : aucun CLAUDE.md d'un projet");
    assert.equal(fs.existsSync(appel.cwd), false, "et ce dossier de travail est effacé à la fin");
    assert.ok(appel.prompt.startsWith(texteDuGuidePourLIA()), "⭐ le texte pour l'IA, tel que le GUIDE l'écrit");
    assert.ok(appel.prompt.includes("\"id\": \"example-emberwood\""), "le modèle");
    assert.ok(appel.prompt.includes(`- "id": "${ID}"`) && appel.prompt.includes(`"author": "${AUTEUR}", "license": "CC0-1.0"`), "la demande");
    assert.ok(appel.prompt.includes(`<<<BOOK\n${LIVRE.trim()}\nBOOK>>>`), "le livre, entier");
  } finally { b.fin(); }
  const source = stripComments(fs.readFileSync(SCRIPT, "utf8"));
  assert.equal(/ANTHROPIC_API_KEY|api[_-]?key|sk-ant|Bearer/i.test(source), false, "⛔ aucune clef : la connexion Claude Code du Mac");
});

test("H6 — 🧰 LA COMMANDE : mal appelée → 2 ; une sortie existante n'est jamais remplacée ; `claude` muet → 3 ; un id changé ne s'écrit pas", () => {
  const usage = spawnSync(process.execPath, [SCRIPT, "--book", "x.md"], { encoding: "utf8" });
  assert.equal(usage.status, 2);
  assert.match(usage.stderr, /^usage: node tools\/catalog-headless\.mjs/);
  const b = banc([enTexte(bonCatalog())]);
  try {
    fs.writeFileSync(b.sortie, "le fichier d'avant");
    const r = b.lancer();
    assert.equal(r.status, 2);
    assert.equal(fs.readFileSync(b.sortie, "utf8"), "le fichier d'avant", "⛔ jamais remplacé");
    assert.equal(b.appels().length, 0, "et Claude n'est même pas appelé");
  } finally { b.fin(); }
  const muet = banc([null]);
  try {
    assert.equal(muet.lancer().status, 3);
    assert.equal(fs.existsSync(muet.sortie), false);
  } finally { muet.fin(); }
  const autre = bonCatalog();
  autre.id = "someone-else";
  for (const g of Object.keys(autre.records)) autre.records[g] = Object.fromEntries(Object.entries(autre.records[g]).map(([k, v]) => [k.replace(ID, "someone-else"), v]));
  autre.records.background["someone-else:background:en:lantern-keeper"].data.feat_id = "someone-else:feat:en:ashen-resolve";
  const c = banc([enTexte(autre), enTexte(autre), enTexte(autre)]);
  try {
    assert.equal(verifierUnCatalog(new TextEncoder().encode(enTexte(autre))).etat, "valide", "témoin : le juge l'accepte");
    const r = c.lancer();
    assert.equal(r.status, 1, "…mais ce n'est pas le catalog demandé : il ne s'écrit pas");
    assert.equal(fs.existsSync(c.sortie), false);
    assert.match(c.appels()[1].prompt, /- id — Must be "testeur-brumes", the id this catalog was asked with/);
  } finally { c.fin(); }
});

test("H7 — ⚖️ UN SEUL JUGE : le verdict vient de `verifier-catalog --json` ; le script ne porte aucune règle du format", () => {
  const source = stripComments(fs.readFileSync(SCRIPT, "utf8"));
  assert.match(source, /spawnSync\(process\.execPath, \[VERIFICATEUR, "--json", fichier\]/);
  assert.equal(/from "\.\.\/src\//.test(source), false, "⛔ il n'importe pas le juge pour le réécrire : il appelle sa commande");
  for (const regle of ["CHAMPS_EXIGES", "GENRES_DU_CATALOG", "ESPACES_DE_L_APP", "readLayer", "fh-layer/1\" &&"]) {
    assert.equal(source.includes(regle), false, `⛔ aucune règle du format ici (${regle})`);
  }
});

test("H8 — 📖 LE GUIDE dit le mode d'emploi : la commande, le livre du créateur, les 3 tours, rien d'écrit sans accord du juge", () => {
  const guide = fs.readFileSync(path.join(ROOT, "docs", "CATALOG.md"), "utf8");
  const section = guide.split("## Headless, on your own computer")[1].split("\n## ")[0];
  assert.match(section, /node tools\/catalog-headless\.mjs --book my-book\.md --id yourname-mistlands --author "Your Name" --out mistlands\.layer\.json/);
  assert.match(section, /\*\*your own book\*\*, never someone else's/);
  assert.match(section, /\*\*3 rounds at most\*\*/);
  assert.match(section, /\*\*only if the judge accepts\*\*/);
  assert.match(section, /there is no key to type anywhere/);
});
