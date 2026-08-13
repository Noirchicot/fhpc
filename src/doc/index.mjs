/* Le bloc `doc`, branché derrière le noyau J0.

   Même partage qu'aux blocs `layers`, `build` et `play` : `createDoc`
   construit une INSTANCE (les suites en montent une par scénario),
   `registerDoc` en enregistre UNE sur le registre du noyau — c'est elle que
   `dispatch("doc.open", …)` atteint. Le registre est un singleton et
   `defineBlock` jette sur un double enregistrement : bonne loi pour une
   application, ingérable pour une suite.

   ⚠️ `registerDoc` EXIGE toujours son magasin et son schéma. Il n'y a pas de
   défaut : un défaut serait un chemin en dur (décision D2) ou une règle
   devinée (décision D3), et les deux sont interdits. */

import { defineBlock } from "../kernel/registry.mjs";
import * as kernelBus from "../kernel/bus.mjs";
import { createDoc } from "./store.mjs";

export { createDoc } from "./store.mjs";
export { DocError } from "./errors.mjs";
export { compileSchema, deriveDraftSchema, readFromSchema, SUPPORTED } from "./schema.mjs";
export { asBytes, digest, parseDocument, toBytes } from "./serialize.mjs";
export { platformNow } from "./clock.mjs";

export function registerDoc(options = {}) {
  const doc = createDoc(Object.assign({ bus: kernelBus }, options));
  defineBlock(doc.name, { verbs: doc.verbs });
  return doc;
}
