/* Le bloc `play`, branché derrière le noyau J0.

   `createPlay` construit une INSTANCE (les suites en montent une par scénario,
   avec leur propre file de dés déterministe). `registerPlay` en enregistre UNE
   sur le registre du noyau : c'est elle que `dispatch("play.roll", …)` atteint.

   Séparés exprès. Le registre est un singleton et `defineBlock` jette sur un
   double enregistrement — ce qui est la bonne loi pour une application, et
   ingérable pour une suite. */

import { defineBlock } from "../kernel/registry.mjs";
import * as kernelBus from "../kernel/bus.mjs";
import { createPlay } from "./session.mjs";

export { createPlay } from "./session.mjs";
export { createLexicon, LEX, ROLL_SOURCES, ROLL_VERDICTS, SEALABLE_SOURCES, rollSource, sealLabel, rollVerdict, outcomeFor, rollHasDc } from "./lexicon.mjs";
export { createDiceKit, DIE_SEQUENCE, ROLL_DIE_SIZES, MAX_BONUS_DICE, MAX_FREE_DICE, MAX_HISTORY, rollMode, forcedDieResult, dieColour } from "./dice.mjs";
export { createChaos } from "./chaos.mjs";
export { createExport } from "./export.mjs";
export { makeRollDie, clamp, mod, signed } from "./utils.mjs";

export function registerPlay(options = {}) {
  const play = createPlay(Object.assign({ bus: kernelBus }, options));
  defineBlock(play.name, { verbs: play.verbs });
  return play;
}
