#!/usr/bin/env node
/* ══ LE VÉRIFICATEUR D'UN CATALOG, EN LIGNE DE COMMANDE — lot 390 ═══════════════════════════════════
   ⚖️ UN SEUL JUGE (ARCHI 35, mandat du lot 390) : cette commande appelle `verifierUnCatalog`
   (`src/catalog/juge.mjs`), la MÊME fonction que le juge d'`Import a book` et du montage. Elle n'ajoute
   rien, elle ne retire rien : elle lit les fichiers et imprime le verdict. Le script du lot 391 (un créateur
   demande un catalog à une IA, puis le fait vérifier sans ouvrir l'app) s'appuie dessus.

     node tools/verifier-catalog.mjs <catalog.json> [autres…]          un verdict lisible par fichier
     node tools/verifier-catalog.mjs --json <catalog.json> [autres…]   le verdict en JSON, pour un script

   Code de sortie : 0 si chaque fichier est accepté, 1 si l'un est refusé, 2 si la commande est mal appelée. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifierUnCatalog, fauteEnLigne } from "../src/catalog/juge.mjs";

/** Le verdict d'un fichier : celui du juge, et le chemin lu. Un fichier illisible est un refus nommé. */
export function verdictDuFichier(fichier) {
  let octets;
  try { octets = new Uint8Array(fs.readFileSync(fichier)); } catch (error) {
    return { fichier, etat: "refus", fautes: [{ chemin: "(file)", phrase: `This file could not be read: ${error.message}` }] };
  }
  return { fichier, ...verifierUnCatalog(octets) };
}

/** Le texte que la commande imprime pour un verdict. */
export function verdictEnTexte(v) {
  if (v.etat === "valide") return `✅ ${v.fichier} — accepted: "${v.nom}" by ${v.auteur}, version ${v.version}, ${v.records} record${v.records > 1 ? "s" : ""} (id ${v.id}).`;
  return [`⛔ ${v.fichier} — refused, ${v.fautes.length} fault${v.fautes.length > 1 ? "s" : ""}:`, ...v.fautes.map((f) => `   · ${fauteEnLigne(f)}`)].join("\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const fichiers = args.filter((a) => a !== "--json");
  if (fichiers.length === 0) {
    console.error("usage: node tools/verifier-catalog.mjs [--json] <catalog.json> [more files…]");
    process.exit(2);
  }
  const verdicts = fichiers.map(verdictDuFichier);
  if (json) console.log(JSON.stringify(verdicts, null, 2));
  else console.log(verdicts.map(verdictEnTexte).join("\n\n"));
  process.exit(verdicts.every((v) => v.etat === "valide") ? 0 : 1);
}
