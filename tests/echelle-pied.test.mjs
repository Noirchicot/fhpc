import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const SHELL_CSS = readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const SHELL_MJS = readFileSync(new URL("../ui/builder/shell.mjs", import.meta.url), "utf8");
const EXEMPLE = JSON.parse(readFileSync(new URL("../examples/personnage-fh-en-niveau1.fh-char.json", import.meta.url), "utf8"));

/* ══════════════════════════════════════════════════════════════════════════
   🔴 L'ÉCHELLE DU PIED (§6) TENAIT SUR LE PAPIER, PAS À L'ÉCRAN — 27/08,
   revue d'Archi 28 confirmée au banc : « I changed my mind » rendait le GRIS
   du défaut (#928c7f). La cause : le défaut de la famille est porté par
   `.parcours-pied button:not(.fiche-livre)` (0,2,1), et les règles d'état
   étaient à (0,2,0) — l'état perdait contre le défaut quel que soit l'ordre.
   ══════════════════════════════════════════════════════════════════════════ */

test("les règles d'état du pied pèsent au moins autant que le défaut de la famille", () => {
  for (const [etat, jeton] of [
    ["parcours-annuler", "--critical"],
    ["parcours-next", "--info"],
    ["sortie-back", "--info"]
  ]) {
    const regle = new RegExp(`\\.parcours-pied button\\.${etat}[^{]*\\{[^}]*--bouton-fond:\\s*var\\(${jeton}\\)`);
    assert.match(SHELL_CSS, regle, `.parcours-pied button.${etat} → ${jeton}`);
  }
});

test("le Done d'un item verdit quand l'item est répondu — canal data-avance", () => {
  /* Archi 28 : « Done reste GRIS à 3 of 3 chosen ». La coquille lit le carnet
     (même expression que itemsDeLEtape : answered ≥ expected, verrou refusé),
     le CSS peint. */
  assert.match(SHELL_MJS, /done\.dataset\.avance = repondu \? "fait" : "en-cours"/);
  assert.match(SHELL_MJS, /plan\.answered >= plan\.expected && !plan\.lock/);
  assert.match(SHELL_CSS, /\.parcours-pied button\.sortie-done\[data-avance="fait"\] \{[^}]*--bouton-fond:\s*var\(--positive\)/);
});

test("CHOOSE est vert — Eric, 27/08 : « bouton grisé choose bizarre, vert mieux non ? »", () => {
  /* la règle vient APRÈS le défaut gris de la famille (même poids 0,1,0 :
     l'ordre tranche) — vérifié par la position des deux dans le fichier. */
  const defaut = SHELL_CSS.indexOf("--bouton-fond: var(--text-muted)");
  const vert = SHELL_CSS.search(/\.fiche-action \{[^}]*--bouton-fond:\s*var\(--positive\)/);
  assert.ok(defaut > -1 && vert > -1, "les deux règles existent");
  assert.ok(vert > defaut, "le vert du CHOOSE est déclaré après le défaut gris");
});

test("le personnage d'exemple est SIGNÉ — un témoin fini porte ses confirmations", () => {
  /* Ilyra affichait ses réponses avec les voyants éteints : remplie, jamais
     signée. Les chemins signés sont ceux que pressDone écrit. */
  const c = EXEMPLE.build.confirmed;
  assert.ok(Array.isArray(c) && c.length > 0, "build.confirmed existe");
  for (const chemin of ["species", "species.lineage", "background", "class"]) {
    assert.ok(c.includes(chemin), `signé : ${chemin}`);
  }
  assert.deepEqual(c, [...new Set(c)].sort(), "uniques et triés — la forme de l'écrivain confirm");
});
