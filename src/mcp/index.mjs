/* Le bloc `mcp`, branché derrière le noyau J0.

   Même partage qu'aux blocs `layers` et `build` : `createMcp` construit une
   INSTANCE (une suite en monte une par scénario, avec son propre `dispatch`),
   `connectMcp` en construit une câblée sur le `dispatch` DU NOYAU — c'est
   elle qu'un vrai serveur fait tourner.

   ⚠️ `connectMcp` ne s'appelle pas `registerMcp` parce qu'il n'enregistre
   rien : le bloc `mcp` n'a **aucun verbe** (`ARCHITECTURE.md`), donc rien à
   poser sur le registre. « Connecter » est le mot que la carte emploie déjà
   pour un bloc de frontière (`connect-ddb`) — aucun vocabulaire neuf.

   ⚠️ Ce fichier importe le NOYAU, et rien d'autre. Ni `src/build/`, ni
   `src/layers/` : c'est la racine de composition (`bin/fhpc-mcp.mjs`) qui
   enregistre les blocs du domaine, pas l'adaptateur. Un adaptateur qui monte
   lui-même le domaine qu'il adapte n'est plus un adaptateur. */

import { dispatch as kernelDispatch } from "../kernel/registry.mjs";
import { createMcp } from "./surface.mjs";

export { createMcp, CHARACTER_URI } from "./surface.mjs";
export { serveStdio } from "./stdio.mjs";
export { PROTOCOL_VERSION, SUPPORTED_VERSIONS, META } from "./protocol.mjs";
export { CODES, McpError, errorKind } from "./errors.mjs";
export { TOOLS, publishedTools } from "./tools.mjs";

export function connectMcp(options = {}) {
  return createMcp(Object.assign({ dispatch: kernelDispatch }, options));
}
