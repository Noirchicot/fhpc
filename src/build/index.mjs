/* Le bloc `build`, branché derrière le noyau J0.

   Même partage qu'aux blocs `play` et `layers` : `createBuild` construit une
   INSTANCE (les suites en montent une par scénario), `registerBuild` en
   enregistre UNE sur le registre du noyau — c'est elle que
   `dispatch("build.rebuild", …)` atteint. Le registre est un singleton et
   `defineBlock` jette sur un double enregistrement : bonne loi pour une
   application, ingérable pour une suite.

   ⚠️ `registerBuild` branche le bloc sur le `dispatch` DU NOYAU : c'est par
   lui qu'il atteint `layers.query` et `layers.stack`, sans jamais importer
   `src/layers/`. Une instance de test peut recevoir son propre `dispatch`
   pour parler à une instance de `layers` qui n'est pas celle du noyau. */

import { defineBlock, dispatch as kernelDispatch } from "../kernel/registry.mjs";
import * as kernelBus from "../kernel/bus.mjs";
import { createBuild } from "./block.mjs";

export { createBuild } from "./block.mjs";
export { derive, ABILITY_KEYS, CURRENCY_KEYS } from "./derive.mjs";
export { statSumViolations } from "./validate.mjs";
export { diffResolved } from "./diff.mjs";
export { BuildError } from "./errors.mjs";
export { CHOICE_PATH, OVERRIDE_PATH, parseChoicePath, parseOverridePath, applyOverride } from "./paths.mjs";

export function registerBuild(options = {}) {
  const build = createBuild(Object.assign({ bus: kernelBus, dispatch: kernelDispatch }, options));
  defineBlock(build.name, { verbs: build.verbs });
  return build;
}
