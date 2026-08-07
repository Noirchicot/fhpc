/* Le harnais des suites `play`.

   Il remplace, à l'identique de fonction, ce que les suites v1 obtenaient en
   chargeant `fh-player-sheet.js` dans un `vm.runInNewContext` avec un sandbox
   truqué :

     v1                                   → ici
     sandbox.crypto.getRandomValues       → `queueRolls` sur randomUint32
     sandbox.crypto.randomUUID            → un compteur injecté
     sandbox.localStorage / fetch         → rien : `play` ne persiste ni n'appelle
     globalThis.__fhRollMachine (hook)    → `play.engine` / `play.verbs`, déclarés

   Le hasard reste celui de la v1 dans son principe : la file porte des FACES
   voulues, et `rollDie` les retrouve par `(valeur % faces) + 1` — donc on
   pousse `face - 1`. Une file épuisée JETTE : un test qui consomme un dé qu'il
   n'a pas annoncé doit échouer bruyamment, pas tirer au hasard. */

import { createPlay } from "../src/play/index.mjs";

/* Table de Chaos NEUTRE. Les vraies tables sont du contenu Fate's Hand (IP
   d'Eric) et n'entrent pas dans ce dépôt public à ce stade — KICKOFF §0.8 et
   §3. Ce que les suites vérifient ici, c'est la MÉCANIQUE de lecture (bornes,
   plafond, capacité inconnue), pas le texte des lignes. */
export const FIXTURE_CHAOS = {
  max: 12,
  tables: Object.fromEntries(["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((ability) => [
    ability,
    { name: ability, rows: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [String(i + 1), ability + " fixture row " + (i + 1)])) }
  ]))
};

export function makeHarness({ chaosTables = FIXTURE_CHAOS } = {}) {
  const bucket = [];
  let uuidCounter = 0;
  let clock = 0;
  const emitted = [];

  const bus = {
    emit(type, data) {
      const event = Object.assign({}, data, { type, at: clock });
      emitted.push(event);
      return event;
    },
    on() { return () => {}; }
  };

  const play = createPlay({
    bus,
    chaosTables,
    randomUint32: () => {
      if (!bucket.length) throw new Error("Deterministic roll queue exhausted");
      return bucket.shift();
    },
    uuid: () => "roll-" + (++uuidCounter),
    now: () => new Date(1767225600000 + (clock += 1000)).toISOString()
  });

  function queueRolls(...results) {
    bucket.push(...results.map((result) => Number(result) - 1));
  }

  function die(id, sides, available = true) { return { id, sides, available }; }

  /* Le `reset` de la v1, porté : la tranche d'état est replacée à la main pour
     que chaque scénario parte d'une réserve exactement connue. */
  function reset(points = 5, dice = [die("d4", 4, true), die("d6", 6, true), die("d8", 8, true)]) {
    bucket.length = 0;
    emitted.length = 0;
    Object.assign(play.state, {
      campaign: "", pseudo: "",
      destiny: { score: 8, points, dice: JSON.parse(JSON.stringify(dice)), overreach: 0, pending: [], awakeningOwed: 0, lastChange: null },
      history: [], events: [], prefs: { bardicSides: 6 },
      poolResources: [],
      rollConfig: null, trayPrompt: null, diePrompt: null, destinyStaged: null,
      traySelection: [], trayResults: [], trayTitle: "Dice Tray", trayResultText: "", trayVerdict: "", trayQuietTitle: "",
      queueDone: "", rollSequence: null, pendingArmed: null,
      message: "", messageKind: "", settled: {},
      vitals: { current: null, max: null, exhaustion: 0, shortRestUsed: false },
      character: { destinyBuild: { arcana: { name: "The Hermit" } }, build: {} }
    });
  }

  return {
    play, state: play.state, t: play.engine, verbs: play.verbs, derive: play.derive,
    queueRolls, reset, die, emitted,
    queueEmpty: () => bucket.length,
    settledEvents: () => emitted.filter((event) => event.type === "roll-settled"),
    poolEvents: () => emitted.filter((event) => event.type === "pool-changed")
  };
}
