#!/usr/bin/env node
/* ══ LE CATALOG D'UN CRÉATEUR, EN HEADLESS — lot 391 ═════════════════════════════════════════════════
   Eric, 30/09 : *« le plus simple c'est de demander à une IA de produire le json. est-ce que ça peut se faire en
   headless ? »*, puis **« a »** : le socle (lot 390) ET un script sur son Mac. Mandat d'ARCHI 35.

   CE QU'IL FAIT : il reçoit le texte d'un livre écrit par un créateur, demande à Claude (`claude -p`, sans outils,
   sans session) d'en faire un catalog, fait vérifier le résultat par le JUGE du lot 390 (`tools/verifier-catalog.mjs
   --json`), renvoie à Claude SES fautes (chemin et phrase) avec le fichier fautif, et recommence — au plus 3 tours.
   Il n'écrit le catalog que si le juge l'accepte ; sinon il dit les fautes restantes et sort en erreur, sans rien
   écrire.

     node tools/catalog-headless.mjs --book <mon-livre.md> --id <yourname-catalog> --author "<Your Name>" \
       --out <mon-catalog.layer.json> [--license CC-BY-4.0] [--claude <exécutable>] [--tours 3]

   Sorties : 0 le catalog est accepté et écrit · 1 refusé après les tours permis (rien n'est écrit) · 2 la commande
   est mal appelée (ou la sortie existe déjà) · 3 `claude` n'a pas pu répondre.

   ⛔ LE TEXTE DONNÉ EST LE LIVRE DU CRÉATEUR, jamais celui d'un autre éditeur. Le script ne peut pas vérifier
   l'origine d'un texte : il le dit ici, et le guide le dit (`docs/CATALOG.md`).
   ⛔ AUCUN SECRET : il emploie la connexion Claude Code déjà en place sur le Mac (`claude`), jamais une clef.
   ⛔ UN SEUL JUGE : le verdict est celui de `verifier-catalog --json` (`src/catalog/juge.mjs`), jamais un second.
   La commande ne vérifie qu'une chose de son côté, et c'est sa DEMANDE, pas une règle du format : que Claude ait
   gardé l'id et l'auteur qu'on lui a donnés (sinon le fichier écrit ne serait pas celui qu'on a demandé).
   ⭐ Le texte pour l'IA est celui du GUIDE (`docs/CATALOG.md`, « The text to paste into an AI ») et le modèle
   est `examples/catalog-modele.layer.json` : le script les LIT, il n'en garde aucune copie. */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const GUIDE = path.join(RACINE, "docs", "CATALOG.md");
const MODELE = path.join(RACINE, "examples", "catalog-modele.layer.json");
const VERIFICATEUR = path.join(RACINE, "tools", "verifier-catalog.mjs");
export const TOURS_PERMIS = 3;

/** Le texte pour une IA, tel que le guide l'écrit — le bloc de code sous « The text to paste into an AI ». */
export function texteDuGuidePourLIA(guide = fs.readFileSync(GUIDE, "utf8")) {
  const section = guide.split("## The text to paste into an AI")[1];
  const bloc = section && /```\n([\s\S]*?)```/.exec(section);
  if (!bloc) throw new Error("docs/CATALOG.md has no text for an AI (\"## The text to paste into an AI\")");
  return bloc[1].trim();
}

/** LE JSON D'UNE RÉPONSE — même entouré de texte : un bloc ```json d'abord, sinon le plus grand objet `{…}`
 *  équilibré qui s'analyse. `null` s'il n'y en a aucun. Le TEXTE rendu est gardé tel quel : c'est lui que le
 *  juge lira. */
export function extraireLeJson(reponse) {
  const texte = String(reponse ?? "");
  const essais = [];
  for (const m of texte.matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)) essais.push(m[1]);
  for (let i = texte.indexOf("{"); i !== -1; i = texte.indexOf("{", i + 1)) {
    let prof = 0; let dansChaine = false; let echap = false;
    for (let j = i; j < texte.length; j += 1) {
      const c = texte[j];
      if (dansChaine) { if (echap) echap = false; else if (c === "\\") echap = true; else if (c === "\"") dansChaine = false; continue; }
      if (c === "\"") dansChaine = true;
      else if (c === "{") prof += 1;
      else if (c === "}") { prof -= 1; if (prof === 0) { essais.push(texte.slice(i, j + 1)); break; } }
    }
  }
  const valides = essais.map((t) => t.trim()).filter((t) => { try { const o = JSON.parse(t); return o && typeof o === "object" && !Array.isArray(o); } catch (_) { return false; } });
  if (valides.length === 0) return null;
  return valides.sort((a, b) => b.length - a.length)[0];
}

/** LE PREMIER PROMPT — le texte du guide, le modèle, la demande, et le livre du créateur. */
export function premierPrompt({ livre, id, auteur, licence }) {
  return [
    texteDuGuidePourLIA(),
    fs.readFileSync(MODELE, "utf8").trim(),
    "",
    "Now make the catalog from the creator's book below.",
    `- "id": "${id}" (every record id begins with "${id}:")`,
    `- "attribution": { "author": "${auteur}", "license": "${licence}" }`,
    "- \"lang\": \"en\". Choose \"name\" from the book.",
    "- Rule 7 is about other people's books: the book below is the creator's own work, so use its content and wording.",
    "- Only what the book describes; one record per thing it describes.",
    "",
    "<<<BOOK",
    livre.trim(),
    "BOOK>>>",
    "",
    "Answer with the JSON file only."
  ].join("\n");
}

/** LE PROMPT DE CORRECTION — les fautes du juge (chemin et phrase), et le fichier fautif. */
export function promptDeCorrection({ livre, id, auteur, licence, fautes, fichier }) {
  return [
    premierPrompt({ livre, id, auteur, licence }),
    "",
    "Your previous answer was refused. Fix EVERY fault below, keep everything else as it is, and answer with the whole corrected JSON file only.",
    "Faults:",
    ...fautes.map((f) => `- ${f.chemin === "(file)" ? f.phrase : `${f.chemin} — ${f.phrase}`}`),
    "",
    "Your previous answer:",
    fichier
  ].join("\n");
}

/** Demander à Claude — `claude -p`, sans outils, sans session, dans un dossier vide (aucun CLAUDE.md d'un dépôt).
 *  @returns {{ok:true, texte:string}|{ok:false, raison:string}} */
export function demanderAClaude(claude, prompt, dossier) {
  const r = spawnSync(claude, ["-p", "--output-format", "text", "--tools", "", "--no-session-persistence"],
    { input: prompt, encoding: "utf8", cwd: dossier, maxBuffer: 64 * 1024 * 1024 });
  if (r.error) return { ok: false, raison: `claude could not run: ${r.error.message}` };
  if (r.status !== 0) return { ok: false, raison: `claude stopped with code ${r.status}: ${(r.stderr || "").trim().slice(0, 500)}` };
  return { ok: true, texte: r.stdout };
}

/** Le verdict du JUGE du lot 390, par sa commande (`verifier-catalog --json`) — jamais un second juge. */
export function verdictDuJuge(fichier) {
  const r = spawnSync(process.execPath, [VERIFICATEUR, "--json", fichier], { encoding: "utf8" });
  const [verdict] = JSON.parse(r.stdout);
  return verdict;
}

/** LA BOUCLE. Rend `{code, tours, fautes?}` et n'écrit `sortie` que si le juge accepte.
 *  `dire` reçoit ce que la commande imprime (une ligne à la fois). */
export function fabriquerUnCatalog({ livre, id, auteur, licence = "CC-BY-4.0", sortie, claude = "claude", tours = TOURS_PERMIS, dire = () => {} }) {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-headless-"));
  try {
    let fautes = null;
    let fichier = "";
    for (let tour = 1; tour <= tours; tour += 1) {
      const prompt = fautes ? promptDeCorrection({ livre, id, auteur, licence, fautes, fichier }) : premierPrompt({ livre, id, auteur, licence });
      dire(`Round ${tour}/${tours}: asking Claude…`);
      const reponse = demanderAClaude(claude, prompt, dossier);
      if (!reponse.ok) { dire(reponse.raison); return { code: 3, tours: tour }; }
      const json = extraireLeJson(reponse.texte);
      if (json === null) {
        fichier = reponse.texte;
        fautes = [{ chemin: "(file)", phrase: "The answer holds no JSON object. Answer with the JSON file only." }];
        dire(`Round ${tour}: no JSON in the answer.`);
        continue;
      }
      fichier = `${JSON.stringify(JSON.parse(json), null, 2)}\n`;
      const candidat = path.join(dossier, `tour-${tour}.layer.json`);
      fs.writeFileSync(candidat, fichier);
      const verdict = verdictDuJuge(candidat);
      /* LA DEMANDE de la commande (pas une règle du format) : l'id et l'auteur donnés. */
      const doc = JSON.parse(fichier);
      const demande = [];
      if (doc.id !== id) demande.push({ chemin: "id", phrase: `Must be "${id}", the id this catalog was asked with — and every record id begins with "${id}:".` });
      if (!doc.attribution || doc.attribution.author !== auteur) demande.push({ chemin: "attribution.author", phrase: `Must be "${auteur}", the author this catalog was asked with.` });
      if (verdict.etat === "valide" && demande.length === 0) {
        fs.writeFileSync(sortie, fichier);
        dire(`✅ Accepted on round ${tour}: "${verdict.nom}" by ${verdict.auteur}, ${verdict.records} record${verdict.records > 1 ? "s" : ""} — written to ${sortie}`);
        return { code: 0, tours: tour };
      }
      fautes = [...(verdict.etat === "valide" ? [] : verdict.fautes), ...demande];
      dire(`Round ${tour}: refused, ${fautes.length} fault${fautes.length > 1 ? "s" : ""}.`);
    }
    dire(`⛔ Still refused after ${tours} rounds — nothing was written. The faults left:`);
    for (const f of fautes) dire(`   · ${f.chemin === "(file)" ? f.phrase : `${f.chemin} — ${f.phrase}`}`);
    return { code: 1, tours, fautes };
  } finally {
    fs.rmSync(dossier, { recursive: true, force: true });
  }
}

/** Les arguments de la commande. `null` si elle est mal appelée. */
export function lireLesArguments(args) {
  const o = {};
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i]; const v = args[i + 1];
    if (!k.startsWith("--") || v === undefined) return null;
    o[k.slice(2)] = v;
  }
  if (!o.book || !o.id || !o.author || !o.out) return null;
  const tours = o.tours === undefined ? TOURS_PERMIS : Number(o.tours);
  if (!Number.isInteger(tours) || tours < 1 || tours > TOURS_PERMIS) return null;
  return { livre: o.book, id: o.id, auteur: o.author, sortie: o.out, licence: o.license || "CC-BY-4.0", claude: o.claude || "claude", tours };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = lireLesArguments(process.argv.slice(2));
  if (!a) {
    console.error("usage: node tools/catalog-headless.mjs --book <book.md> --id <yourname-catalog> --author \"<Your Name>\" --out <catalog.layer.json> [--license CC-BY-4.0] [--claude <path>] [--tours 1-3]");
    process.exit(2);
  }
  if (fs.existsSync(a.sortie)) { console.error(`${a.sortie} already exists — choose another --out, or move that file away.`); process.exit(2); }
  let livre;
  try { livre = fs.readFileSync(a.livre, "utf8"); } catch (error) { console.error(`The book could not be read: ${error.message}`); process.exit(2); }
  const issue = fabriquerUnCatalog({ ...a, livre, dire: (l) => console.log(l) });
  process.exit(issue.code);
}
