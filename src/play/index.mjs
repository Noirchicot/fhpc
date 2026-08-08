/* Le bloc `play`, branché derrière le noyau J0.

   `createPlay` construit une INSTANCE (les suites en montent une par scénario,
   avec leur propre file de dés déterministe). `registerPlay` en enregistre UNE
   sur le registre du noyau : c'est elle que `dispatch("play.roll", …)` atteint.

   Séparés exprès. Le registre est un singleton et `defineBlock` jette sur un
   double enregistrement — ce qui est la bonne loi pour une application, et
   ingérable pour une suite.

   ⚠️ AUCUNE COUCHE N'EST MONTÉE PAR DÉFAUT (loi §0.12). `createPlay()` sans
   `layers` est le moteur SRD nu : un personnage SRD pur le traverse de bout en
   bout, et les verbes de Fate's Hand n'existent pas. Monter la couche est un
   geste explicite de l'appelant :

     import { createFhLayer } from "../layers/fh/index.mjs";
     createPlay({ bus, layers: [createFhLayer({ chaosTables })] }); */

import { defineBlock } from "../kernel/registry.mjs";
import * as kernelBus from "../kernel/bus.mjs";
import { createPlay } from "./session.mjs";

export { createPlay } from "./session.mjs";
export {
  createLexicon, SRD_ROLL_SOURCES, SRD_VERDICTS, srdBadgeRules, SEALABLE_SOURCES,
  CORRECTION_DICE, UNKNOWN_SOURCE, rollWasMade,
  rollHasDc, rollHasThreshold, rollThreshold
} from "./lexicon.mjs";
export { createLabels, EN_SRD } from "./labels.mjs";
export { createSequence, MOMENTS } from "./sequence.mjs";
export { ROLL_TYPES, ROLL_TYPE_IDS, rollTypeFor, applySettings, damagePlanFor } from "./rolltypes.mjs";
export { createDiceKit, DIE_SEQUENCE, ROLL_DIE_SIZES, MAX_BONUS_DICE, MAX_FREE_DICE, MAX_HISTORY, rollMode, forcedDieResult, dieColour } from "./dice.mjs";
export { createExport } from "./export.mjs";
export { makeRollDie, clamp, mod, signed } from "./utils.mjs";

export function registerPlay(options = {}) {
  const play = createPlay(Object.assign({ bus: kernelBus }, options));
  defineBlock(play.name, { verbs: play.verbs });
  return play;
}
