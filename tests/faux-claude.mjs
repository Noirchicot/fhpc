/* ══ UN FAUX `claude` — lot 391 ═══════════════════════════════════════════════════════════════════════
   ⛔ `npm test` n'appelle JAMAIS le vrai Claude (mandat du lot 391). Ce script tient sa place : la garde
   (`tests/catalog-headless-391.test.mjs`) le lance par un petit exécutable, et le script headless l'appelle comme
   il appellerait `claude -p`.
   ⭐ Il NOTE chaque appel — ses arguments et le prompt reçu sur l'entrée standard — dans `appel-<n>.json`, et rend
   la n-ième réponse de `reponses.json`, dans le dossier que donne `FAUX_CLAUDE_DOSSIER`. Une réponse `null` le
   fait sortir en erreur (code 7), comme un `claude` qui ne répond pas. */

import fs from "node:fs";
import path from "node:path";

const dossier = process.env.FAUX_CLAUDE_DOSSIER;
const prompt = fs.readFileSync(0, "utf8");
const n = fs.readdirSync(dossier).filter((f) => f.startsWith("appel-")).length + 1;
fs.writeFileSync(path.join(dossier, `appel-${n}.json`), JSON.stringify({ args: process.argv.slice(2), prompt, cwd: process.cwd() }));
const reponses = JSON.parse(fs.readFileSync(path.join(dossier, "reponses.json"), "utf8"));
const r = reponses[Math.min(n, reponses.length) - 1];
if (r === null) { process.stderr.write("faux claude : pas de réponse\n"); process.exit(7); }
process.stdout.write(r);
