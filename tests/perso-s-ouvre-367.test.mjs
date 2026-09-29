/* ══ LOT 367 — UN PERSO SAUVÉ S'OUVRE TOUJOURS, MÊME APRÈS UNE MISE À JOUR DES RÈGLES ═══
   Mandat : vault `FH-WEB/FHPC/FHPC lot 367 perso s ouvre.md` (ARCHI 35, 30/09).

   Eric, 30/09, les trois réponses (relayées par ARCHI 35) : le perso s'ouvre **« tout seul,
   et sauvé aussitôt »** ; **une ligne au Menu** jusqu'au premier geste ; et les deux mots qui
   restaient muets (la classe disparue, avec `Cancel` sur Class ; ce qui ne suit pas les
   règles, avec `Save character` / `New character`).

   R. LE RECALAGE — l'organe pur, puis le VRAI moteur sur un VRAI document d'avant (l'Ilyra
      commitée à v914, `tests/fixtures/ilyra-v914.fh-char.json`), puis la marque et sa vie.
   M. LES MOTS — plus aucun chemin vers une impasse sans cause ni sortie.
   U. L'IDENTIFIANT D'UN PERSONNAGE NEUF se tire de `crypto.getRandomValues`, jamais de
      `crypto.randomUUID` (absent hors contexte sécurisé : un iPad en `http://` sur l'IP du
      Mac). Décision d'ARCHI 35. */

import { test } from "node:test";
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
const shell = fs.readFileSync(path.join(UI, "shell.mjs"), "utf8");

const { uuidV4DesOctets, uuidDuNavigateur } = await import("../ui/builder/identifiant.mjs");
const { recalageDeLaPile, marqueDuRecalage, marqueVivante } = await import("../ui/builder/recalage.mjs");
const { lireRecalage, ecrireRecalage, oublierRecalage, CLEF_RECALAGE } = await import("../ui/builder/memoire.mjs");
const { renderUniverseStep, MOT_DES_REGLES_MISES_A_JOUR } = await import("../ui/builder/universe-step.mjs");
const { motDeLEcranMort, causeDeLaFicheAbsente, CAUSE_HORS_DES_REGLES, MOT_HORS_DES_REGLES } = await import("../ui/builder/ecran-mort.mjs");
const { refsMortsDeLEtape } = await import("../ui/builder/parcours.mjs");
const { motDesChoixNonResolus } = await import("../ui/builder/ecran-mort.mjs");

const AVANT = readJson("tests/fixtures/ilyra-v914.fh-char.json");

/** Le moteur de la PAGE, monté comme au navigateur (`bootEngine`), le disque servant le site. */
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
const PAGE = await moteurDeLaPage();

/** Un magasin de navigateur en mémoire. */
function magasin() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
}

test("R1 — 🧭 l'organe : rien ne bouge → `null` ; une empreinte a bougé → la pile montée et ce qui a changé ; un livre du joueur absent → `null` (§C34)", () => {
  const c = (id, hash, version = "0.1.0") => ({ id, version, hash });
  const pile = [c("srd-5.2.1-en", "a"), c("fh-species-en", "b")];
  assert.equal(recalageDeLaPile(pile, pile.map((x) => ({ ...x }))), null, "un document à jour ne se recale pas");
  assert.equal(recalageDeLaPile([], pile), null, "une pile vide, `rebuild` l'adopte seul");
  const neuve = [c("srd-5.2.1-en", "a"), c("fh-species-en", "B")];
  const r = recalageDeLaPile(pile, neuve);
  assert.deepEqual(r.layers, neuve, "la pile MONTÉE, telle que `rebuild` l'exige");
  assert.deepEqual(r.changees, ["fh-species-en"]);
  assert.notEqual(r.layers[1], neuve[1], "une copie : l'organe ne partage rien avec la pile");
  assert.deepEqual(recalageDeLaPile(pile, [...neuve, c("fh-lore-en", "l")]).changees, ["fh-species-en", "fh-lore-en"], "une couche apparue compte");
  assert.deepEqual(recalageDeLaPile([...pile, c("fh-retiree-en", "r")], neuve).changees, ["fh-species-en", "fh-retiree-en"], "une couche disparue du produit compte");
  assert.equal(recalageDeLaPile([...pile, c("xdmg-en", "d")], neuve), null,
    "⛔ un livre du joueur absent de cet appareil n'est pas une mise à jour : §C34, le mot est à Eric");
});

test("R2 — 🔴 UN VRAI DOCUMENT D'AVANT (Ilyra v914) s'ouvre sur les couches d'aujourd'hui, et ses choix restent", () => {
  const { engine, montee } = PAGE;
  const verbs = engine.build.verbs;
  assert.throws(() => verbs.rebuild({ document: structuredClone(AVANT) }), /la pile montée ne correspond pas/,
    "témoin : sans recalage, le moteur refuse — c'est la chaîne du constat");
  const r = recalageDeLaPile(AVANT.build.layers, montee());
  assert.ok(r && r.changees.length >= 4, `des empreintes ont bougé depuis v914 (${r && r.changees.join(", ")})`);
  const recale = { ...structuredClone(AVANT), build: { ...structuredClone(AVANT.build), layers: r.layers } };
  const out = verbs.rebuild({ document: recale });
  assert.ok(out.resolved, "la fiche naît");
  assert.deepEqual(out.document.build.choices, AVANT.build.choices, "⛔ ses choix restent, octet pour octet");
  assert.deepEqual(verbs.validate({ document: out.document }).violations || [], [], "et rien n'accuse");
});

test("R3 — 🔴 CE QUI NE SE RÉSOUT PLUS SE NOMME SUR SON ÉTAPE : une espèce disparue, puis une classe disparue", () => {
  const { engine, montee } = PAGE;
  const verbs = engine.build.verbs;
  const recaler = (doc) => ({ ...doc, build: { ...doc.build, layers: recalageDeLaPile(doc.build.layers, montee()).layers } });
  /* L'espèce : la fiche naît quand même, et Species nomme son choix mort (lots 191, 359). */
  const espece = structuredClone(AVANT);
  espece.build.choices.find((c) => c.path === "species").ref.id += "-disparue";
  const outE = verbs.rebuild({ document: recaler(espece) });
  const mortsE = refsMortsDeLEtape({ violations: verbs.validate({ document: outE.document }).violations, racine: "species" });
  assert.equal(mortsE.length, 1, "le choix mort est relevé sur Species");
  assert.ok(motDesChoixNonResolus(mortsE), "et il a son mot");
  /* La classe : structurelle, la dérivation jette — l'écran mort la NOMME, avec `Cancel` sur Class. */
  const classe = recaler(structuredClone(AVANT));
  classe.build.choices.find((c) => c.path === "class").ref.id += "-disparue";
  assert.throws(() => verbs.rebuild({ document: classe }));
  const violations = verbs.validate({ document: classe }).violations;
  const mot = motDeLEcranMort(classe, violations);
  assert.notEqual(mot, MOT_HORS_DES_REGLES, "⛔ pas le mot de ce qui ne suit pas les règles : la cause est connue");
  assert.match(mot, /On Class, Cancel lets you pick another class\./, "la sortie de Class, sous son mot vivant");
  assert.doesNotMatch(mot, /I changed my mind/, "⛔ libellé mort depuis le 05/09 (« DEUX MOTS, PAS TROIS »)");
});

test("R4 — ⚖️ LA MARQUE vit jusqu'au premier geste : un rechargement ne la tue pas, un geste si", () => {
  const doc = structuredClone(AVANT);
  const marque = marqueDuRecalage({ couches: ["fh-species-en"], at: "2026-09-30T02:00:00Z", document: doc });
  assert.deepEqual(marque.couches, ["fh-species-en"]);
  assert.equal(marque.at, "2026-09-30T02:00:00Z");
  assert.equal(marqueVivante(marque, doc), true);
  const recharge = { ...doc, modified: "2026-09-30T09:00:00Z", resolved: { derivation: { at: "2026-09-30T09:00:00Z" } } };
  assert.equal(marqueVivante(marque, recharge), true, "recharger ne change que ce que la dérivation estampille");
  assert.equal(marqueVivante(marque, { ...doc, gender: "Woman" }), false, "⚔️ un geste (un genre posé) la fait tomber");
  const choisi = structuredClone(doc); choisi.build.choices.push({ path: "alignment", value: "Neutral" });
  assert.equal(marqueVivante(marque, choisi), false, "⚔️ un choix aussi");
  assert.equal(marqueVivante(null, doc), false);
  /* Sa clef, et son seul écrivain. */
  const m = magasin();
  assert.equal(CLEF_RECALAGE, "fhpc.recalage");
  assert.deepEqual(ecrireRecalage(marque, m), { ok: true });
  assert.deepEqual(lireRecalage(m), marque);
  m.setItem(CLEF_RECALAGE, "{pas du json");
  assert.equal(lireRecalage(m), null, "une marque illisible est une ligne qu'on ne montre pas");
  ecrireRecalage(marque, m); oublierRecalage(m);
  assert.equal(lireRecalage(m), null);
});

test("R5 — 🔴 LA COQUILLE RECALE AUX DEUX OUVERTURES, AVANT de dériver, écrit la copie AUSSITÔT et pose la marque ; la marque tombe au premier geste", () => {
  const code = stripComments(shell);
  assert.match(code, /alignerLaPileSurLeDocument\(\);\s*const recalage = recalerSurLaPileMontee\(\);\s*rebuild\(\);\s*poserLaMarque\(recalage, lireRecalage\(\)\);/,
    "au démarrage : aligner, recaler, dériver, marquer — dans cet ordre");
  assert.match(code, /alignerLaPileSurLeDocument\(\);\s*const recalage = recalerSurLaPileMontee\(\);\s*rebuild\(\);\s*poserLaMarque\(recalage, null\);\s*refresh\(\);/,
    "à l'ouverture d'un fichier sans rechargement : la même loi");
  assert.match(code, /function recalerSurLaPileMontee\(\) \{\s*const recalage = recalageDeLaPile\(state\.document\.build\.layers, manifesteDeLaPileMontee\(\)\);\s*if \(recalage\) state\.document = \{ \.\.\.state\.document, build: \{ \.\.\.state\.document\.build, layers: recalage\.layers \} \};/);
  assert.match(code, /function poserLaMarque\(recalage, marqueGardee\) \{\s*if \(recalage\) \{\s*state\.recalage = marqueDuRecalage\(\{ couches: recalage\.changees, at: platformNow\(\), document: state\.document \}\);\s*ecrireRecalage\(state\.recalage\);/,
    "le recalage POSE la marque et l'écrit sous sa clef");
  /* « sauvé aussitôt » : `memoriser` écrit tout texte neuf — le document recalé en est un — au rendu qui suit. */
  const memo = /function memoriser\(\) \{([\s\S]*?)\n\}/.exec(code)[1];
  assert.match(memo, /if \(texte === dernierTexteGarde\) return;\s*dernierTexteGarde = texte;\s*const issue = ecrirePersonnage\(texte\);/,
    "la copie du navigateur est réécrite dès que le texte change (Q1 : « sauvé aussitôt »)");
  assert.match(memo, /if \(state\.recalage && !marqueVivante\(state\.recalage, state\.document\)\) \{\s*state\.recalage = null;\s*oublierRecalage\(\);/,
    "la marque tombe au premier geste");
  assert.match(code, /reglesMisesAJour: Boolean\(state\.recalage\)/, "le Menu reçoit la marque");
});

test("R6 — ⚖️ LA LIGNE AU MENU : présente tant que la marque vit, absente sinon ; aucun nom de sous-couche", () => {
  const avec = renderUniverseStep({ document: AVANT, query: () => null, fieldErrors: {}, reglesMisesAJour: true }, () => {});
  const lignes = avec.querySelectorAll("[data-recalage]");
  assert.equal(lignes.length, 1);
  assert.equal(lignes[0].textContent, MOT_DES_REGLES_MISES_A_JOUR);
  assert.doesNotMatch(MOT_DES_REGLES_MISES_A_JOUR, /Species|Feats|Inheritance|Lore|Mechanics|SRFH|fh-|srfh-/, "⛔ pas de sous-couche");
  assert.equal(avec.querySelectorAll(".guide-mot").length, 1, "⛔ pas un second aiguilleur (`aiguilleur-un-seul-par-ecran`)");
  const sans = renderUniverseStep({ document: AVANT, query: () => null, fieldErrors: {} }, () => {});
  assert.equal(sans.querySelectorAll("[data-recalage]").length, 0);
});

test("M1 — 🔴 PLUS AUCUNE IMPASSE SANS CAUSE NI SORTIE : le mot muet est parti, chaque chemin a son mot", () => {
  for (const f of fs.readdirSync(UI).filter((x) => x.endsWith(".mjs"))) {
    assert.doesNotMatch(stripComments(fs.readFileSync(path.join(UI, f), "utf8")), /cannot be derived yet|CAUSE_SANS_RAISON|MOT_SANS_RAISON/, `${f} : le mot muet du premier âge`);
  }
  const complet = structuredClone(AVANT);
  assert.equal(causeDeLaFicheAbsente(complet, []), CAUSE_HORS_DES_REGLES, "tout est posé, rien de mort : ce qui ne suit pas les règles");
  assert.match(CAUSE_HORS_DES_REGLES, /Save character[\s\S]*New character/, "avec ses deux sorties, qui existent");
  for (const doc of [null, {}, { build: { choices: [] } }, complet]) {
    assert.equal(typeof causeDeLaFicheAbsente(doc, undefined), "string", "⛔ jamais `null`, jamais une impasse");
  }
});

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const MOTIF_ID = new RegExp(readJson("schemas/fh-char.schema.json").properties.id.pattern);

test("U1 — 🎲 un UUID v4 se met en forme à partir de 16 octets : version 4, variante RFC, motif du schéma", () => {
  assert.equal(uuidV4DesOctets(new Uint8Array(16).fill(0xff)), "ffffffff-ffff-4fff-bfff-ffffffffffff");
  assert.equal(uuidV4DesOctets(new Uint8Array(16)), "00000000-0000-4000-8000-000000000000");
  const octets = Uint8Array.from({ length: 16 }, (_, i) => i * 17);
  const id = uuidV4DesOctets(octets);
  assert.match(id, UUID_V4);
  assert.match(id, MOTIF_ID, "l'id passe le motif `id` de fh-char/1");
  assert.deepEqual([...octets], Array.from({ length: 16 }, (_, i) => i * 17), "⛔ les octets de l'appelant ne sont pas modifiés");
  assert.throws(() => uuidV4DesOctets(new Uint8Array(15)), /exactly 16/);
});

test("U2 — 🔴 SANS `randomUUID` (une page en http:// sur l'IP du Mac), l'identifiant naît quand même", () => {
  /* Le navigateur non sécurisé : `getRandomValues` seul — c'est exactement ce qu'il a. */
  const nonSecurise = { getRandomValues: (tampon) => globalThis.crypto.getRandomValues(tampon) };
  const vus = new Set();
  for (let i = 0; i < 500; i++) {
    const id = uuidDuNavigateur(nonSecurise);
    assert.match(id, UUID_V4);
    vus.add(id);
  }
  assert.equal(vus.size, 500, "500 tirages, 500 identifiants");
  /* ⛔ Sans générateur cryptographique, le refus est NOMMÉ — jamais `Math.random`. */
  assert.throws(() => uuidDuNavigateur(null), /no CSPRNG available/);
  assert.throws(() => uuidDuNavigateur({ randomUUID: () => "x" }), /no CSPRNG available/);
});

test("U3 — 🔴 `personnageNeuf` tire son id de `uuidDuNavigateur`, et plus aucun module servi ne lit `randomUUID`", () => {
  assert.match(stripComments(shell), /function personnageNeuf\(precedent\) \{[\s\S]*?\bid: uuidDuNavigateur\(\),[\s\S]*?\n\}/);
  const fautes = fs.readdirSync(UI).filter((f) => f.endsWith(".mjs"))
    .filter((f) => /randomUUID|Math\.random\(\)\.toString/.test(stripComments(fs.readFileSync(path.join(UI, f), "utf8"))));
  assert.deepEqual(fautes, [], "⛔ `randomUUID` n'existe pas hors contexte sécurisé");
  const lecteurs = fs.readdirSync(UI).filter((f) => f.endsWith(".mjs"))
    .filter((f) => /globalThis\s*\.\s*crypto/.test(stripComments(fs.readFileSync(path.join(UI, f), "utf8"))));
  assert.deepEqual(lecteurs, ["identifiant.mjs"], "un seul lecteur du hasard de la plate-forme dans le builder");
});
