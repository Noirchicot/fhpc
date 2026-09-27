/* ══ LES CHEVRONS — lots 326 et 327, 2026-09-27 ═══════════════════════════════════════════════════
   ⚖️ Eric : « Les chevrons latéraux de backpack sont mes préférés […] Applique cela partout […] Même au
   belt » (326), puis « Éloigne tous les chevrons de 8 blg des bords, repasse globalement à un voile de
   50 % sur tous les chevrons » (327). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const css = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
const tokens = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");

test("1 — ⚖️ le bord : 8 du bord extérieur, pour le jeton comme pour le plan de Pack", async () => {
  assert.match(tokens, /--chevron-lateral-bord: var\(--sp-8\);/, "⛔ le jeton du bord n'est pas 8");
  const P = await import("../ui/builder/sac-disposition.mjs");
  const g = P.ORGANES.find((o) => o.nom === "TUNER G"), d = P.ORGANES.find((o) => o.nom === "TUNER D");
  assert.equal(g.x - g.cible.x, 8, "⛔ le chevron gauche de Pack n'est pas à 8 du bord");
  assert.equal((d.cible.x + d.cible.l) - (d.x + d.l), 8, "⛔ le chevron droit de Pack n'est pas à 8 du bord");
});

test("2 — ⚖️ le voile : 50 % sur TOUS les chevrons, par un seul jeton", () => {
  assert.match(tokens, /--chevron-voile: \.5;/);
  /* la peinture latérale partagée (Pack, molette, Wares, X5, belt) */
  assert.match(css, /\.belt-chevron-fleche \{[^}]*opacity: var\(--chevron-voile\);/, "⛔ les chevrons latéraux ne sont pas voilés");
  /* les barrettes ∧ ∨ des écrans, et la jauge de défilement allumée */
  assert.match(css, /\.stage-chevron \{[^}]*opacity: var\(--chevron-voile\);/, "⛔ les barrettes ∧ ∨ ne sont pas voilées");
  assert.match(css, /\.jauge-defile > \.vers-le-bas  \{ opacity: var\(--chevron-voile\); \}/, "⛔ la jauge allumée n'est pas voilée");
});
