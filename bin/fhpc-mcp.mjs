#!/usr/bin/env node
/* ══ LA RACINE DE COMPOSITION DU SERVEUR MCP ═══════════════════════════
   Lot 10-mcp-v0.   Lancement :  node bin/fhpc-mcp.mjs

   ── POURQUOI CE FICHIER N'EST PAS DANS `src/mcp/` ──────────────────────
   Parce qu'il enregistre les blocs du domaine, et que l'adaptateur n'a pas le
   droit de les connaître (décision D3 : `src/mcp/` n'importe jamais
   `src/build/` ni `src/layers/`). Quelqu'un doit pourtant les monter avant
   que le premier `dispatch` parte : c'est le rôle d'une racine de
   composition, et c'est ici. Elle est aussi le SEUL fichier du chemin MCP qui
   nomme `process` et le SEUL qui lise le disque — les deux sont interdits
   dans `src/mcp/`, gardes à l'appui.

   ── L'ORDRE DE MONTAGE COMPTE ──────────────────────────────────────────
   `registerLayers` puis `registerBuild` : le bloc `build` s'abonne à
   `layers-changed` à sa construction. Construit APRÈS un `register`, il
   aurait manqué l'annonce et ne connaîtrait pas les recouvrements de la pile.
   Ici aucune couche n'est montée au démarrage — c'est l'appelant qui les
   monte, par l'outil `layers.register` — donc les deux blocs sont debout
   avant le premier message. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { registerLayers } from "../src/layers/index.mjs";
import { registerBuild } from "../src/build/index.mjs";
import { connectMcp, serveStdio, PROTOCOL_VERSION } from "../src/mcp/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

registerLayers();
registerBuild();

const mcp = connectMcp({ serverInfo: { name: manifest.name, version: manifest.version } });

/* ⚠️ `stdout` NE PORTE QUE DES MESSAGES MCP. Toute la journalisation part sur
   `stderr` : un seul `console.log` ici casserait le cadrage du client pour
   tout ce qui suit, et il n'existe aucune resynchronisation. */
process.stderr.write(
  `fhpc/mcp: ${manifest.name} ${manifest.version}, protocole MCP ${PROTOCOL_VERSION}, transport stdio.\n`
);

serveStdio({
  input: process.stdin,
  output: process.stdout,
  log: process.stderr,
  mcp,
  /* « Servers SHOULD exit promptly when their standard input is closed. »
     On ne force rien : plus aucune poignée n'est ouverte une fois l'entrée
     terminée, donc Node rend la main de lui-même — et `stdout` finit d'être
     vidé, ce qu'un `process.exit()` tronquerait. */
  onClose() { process.exitCode = 0; }
});
