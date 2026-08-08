/* Le bloc `layers`, branché derrière le noyau J0.

   Même partage qu'au bloc `play` : `createLayers` construit une INSTANCE (les
   suites en montent une par scénario), `registerLayers` en enregistre UNE sur
   le registre du noyau — c'est elle que `dispatch("layers.query", …)` atteint.
   Le registre est un singleton et `defineBlock` jette sur un double
   enregistrement : bonne loi pour une application, ingérable pour une suite.

   ⚠️ Le bloc ne lit pas le disque. Une couche entre par ses OCTETS
   (`register({bytes})`) : c'est l'appelant qui possède le fichier, et
   l'empreinte de `build.layers[].hash` ne survit qu'aux octets d'origine. */

import { defineBlock } from "../kernel/registry.mjs";
import * as kernelBus from "../kernel/bus.mjs";
import { createLayers } from "./stack.mjs";

export { createLayers } from "./stack.mjs";
export { GENRES, FORBIDDEN_KEYS, readLayer, assertLayerShape, sha256, LayerError } from "./document.mjs";
export { PATCHABLE_ROOTS, parseChangePath, applyChanges, applyRemoval, applyPatch } from "./paths.mjs";

export function registerLayers(options = {}) {
  const layers = createLayers(Object.assign({ bus: kernelBus }, options));
  defineBlock(layers.name, { verbs: layers.verbs });
  return layers;
}
