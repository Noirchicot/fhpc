/* ══ UN JETON LU SANS REPLI DOIT EXISTER — lot 270 ════════════════════════════
   🔴 LA FAUTE QUI A FAIT NAÎTRE CE GARDE : `gap: var(--sp-1)` dans les règles de X5 (lot
   259, puis recopiée par moi au lot 270). `--sp-1` n'existe pas — l'échelle va de 2 en 2 —,
   donc la déclaration est INVALIDE AU CALCUL et l'écart retombait à zéro, en silence :
   des lignes collées, vues à l'image seulement. C'est la faute que la mémoire du dépôt
   nomme depuis le 15/09 (`--info`, 253 emplois muets).
   ⭐ LE GARDE : tout `var(--x)` SANS REPLI de `shell.css` doit être déclaré quelque part —
   `tokens.css`, `shell.css`, ou un écran qui le pose (`--x0-marge` est écrit par la feuille
   de X0, en JS). ⛔ Un `var(--x, repli)` est un choix, pas une faute : il passe. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const B = path.join(ROOT, "ui", "builder");
const sansCommentaires = (t) => t.replace(/\/\*[\s\S]*?\*\//g, " ");
const shell = sansCommentaires(fs.readFileSync(path.join(B, "shell.css"), "utf8"));
const sources = [fs.readFileSync(path.join(B, "tokens.css"), "utf8"), shell,
  ...fs.readdirSync(B).filter((f) => f.endsWith(".mjs")).map((f) => fs.readFileSync(path.join(B, f), "utf8"))].join("\n");
const declares = new Set([...sources.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

test("un `var(--x)` sans repli de shell.css est DÉCLARÉ quelque part", () => {
  const sansRepli = [...shell.matchAll(/var\((--[\w-]+)\s*\)/g)].map((m) => m[1]);
  assert.ok(sansRepli.length > 100, `témoin : la feuille en lit beaucoup (${sansRepli.length})`);
  const orphelins = [...new Set(sansRepli.filter((v) => !declares.has(v)))];
  assert.deepEqual(orphelins, [],
    `⛔ ${orphelins.join(", ")} — lu sans repli et déclaré nulle part : la règle est invalide, et elle se tait`);
});

test("⚔️ le garde sait accuser : `--sp-1` n'est pas déclaré", () => {
  assert.equal(declares.has("--sp-1"), false, "l'échelle va de 2 en 2");
  assert.equal(declares.has("--sp-2"), true);
});
