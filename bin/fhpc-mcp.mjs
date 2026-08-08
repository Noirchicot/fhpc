#!/usr/bin/env node
/* ══ LA RACINE DE COMPOSITION DU SERVEUR MCP ═══════════════════════════
   Lot 10-mcp-v0, câblage du bloc `doc` le 2026-08-08.

   Lancement :  node bin/fhpc-mcp.mjs
                node bin/fhpc-mcp.mjs --store <dossier>     (avec magasin)
                node bin/fhpc-mcp.mjs --store <dossier> --create

   ── LE MAGASIN VIENT DE LA LIGNE DE COMMANDE, ET DE NULLE PART AILLEURS ─
   Décision D2 du bloc `doc`, appliquée telle quelle : *le personnage
   appartient au joueur, il héberge ses propres données.* Il n'y a donc AUCUN
   défaut — pas de `~/.fhpc`, pas de dossier courant, pas de répertoire
   deviné. Un magasin qui choisit où vivent les fichiers de quelqu'un a déjà
   décidé à sa place.

   Sans `--store`, le bloc `doc` n'est pas monté DU TOUT et le serveur ne
   publie pas ses outils : il ne promet pas une porte qui n'ouvre sur rien.
   C'est la même honnêteté que « jamais de repli silencieux » (loi §0.5), vue
   depuis le catalogue.

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
import { registerDoc } from "../src/doc/index.mjs";
import { createFsStorage } from "../src/storage/fs.mjs";
import { connectMcp, serveStdio, PROTOCOL_VERSION } from "../src/mcp/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

/** L'unique lecture d'arguments du chemin MCP. Une option inconnue est un
 *  REFUS : un serveur lancé avec `--stroe /tmp/x` qui démarre sans magasin
 *  ferait croire que le magasin est là, et l'erreur n'apparaîtrait qu'au
 *  premier `doc.save` — c'est-à-dire quand quelqu'un croit enregistrer. */
function readArguments(argv) {
  const options = { store: null, create: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--store") {
      options.store = argv[index + 1];
      index += 1;
      if (options.store === undefined || options.store.startsWith("--")) {
        throw new Error("--store attend un dossier : `--store <dossier>`. Le magasin n'a aucun défaut — " +
          "le personnage appartient au joueur, et choisir où vivent ses fichiers serait décider à sa place.");
      }
    } else if (argument === "--create") {
      options.create = true;
    } else {
      throw new Error(`Option inconnue « ${argument} ». Ce serveur accepte --store <dossier> et --create.`);
    }
  }
  if (options.create && options.store === null) {
    throw new Error("--create n'a de sens qu'avec --store : il autorise la création du dossier du magasin.");
  }
  return options;
}

let options;
try {
  options = readArguments(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`fhpc/mcp: ${error.message}\n`);
  process.exit(2);
}

registerLayers();
registerBuild();

/* L'ORDRE : `doc` n'écoute personne et personne ne l'écoute au démarrage —
   il peut donc être monté en dernier sans rien manquer, contrairement à
   `build` qui doit exister avant le premier `layers-changed`. */
const blocks = ["layers", "build"];
if (options.store !== null) {
  registerDoc({
    storage: createFsStorage({ root: options.store, create: options.create }),
    schema: JSON.parse(readFileSync(join(root, "schemas", "fh-char.schema.json"), "utf8"))
  });
  blocks.push("doc");
}

const mcp = connectMcp({ serverInfo: { name: manifest.name, version: manifest.version }, blocks });

/* ⚠️ `stdout` NE PORTE QUE DES MESSAGES MCP. Toute la journalisation part sur
   `stderr` : un seul `console.log` ici casserait le cadrage du client pour
   tout ce qui suit, et il n'existe aucune resynchronisation. */
process.stderr.write(
  `fhpc/mcp: ${manifest.name} ${manifest.version}, protocole MCP ${PROTOCOL_VERSION}, transport stdio.\n` +
  (options.store === null
    ? "fhpc/mcp: aucun magasin (--store absent) — les outils doc.* ne sont pas publiés, rien n'est enregistré.\n"
    : `fhpc/mcp: magasin « ${options.store} » — doc.list, doc.open et doc.save sont publiés.\n`)
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
