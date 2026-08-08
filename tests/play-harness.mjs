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
import { createFhLayer } from "../src/modules/fh/index.mjs";

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

/* REWRITTEN (lot 5) — le harnais monte désormais la couche Fate's Hand
   EXPLICITEMENT. Avant la coupe, le moteur ÉTAIT Fate's Hand et il n'y avait
   rien à monter ; depuis, `createPlay()` nu est le moteur SRD et les verbes de
   la couche n'existent pas tant qu'elle n'est pas montée. Les suites portées
   testent le comportement Fate's Hand : elles montent la couche, et c'est ce
   qui rend la suite `play-srd-only` intéressante — elle, ne la monte pas. */
export function makeHarness({ chaosTables = FIXTURE_CHAOS, layers } = {}) {
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
    layers: layers === undefined ? [createFhLayer({ chaosTables })] : layers,
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
    play, state: play.state, verbs: play.verbs, derive: play.derive,
    /* `t` reste le hublot sur les rouages, comme le hook `__fhRollMachine` de
       la v1. Depuis la coupe il en a DEUX : ceux du moteur SRD, et ceux de la
       couche montée — qui n'existent que si elle l'est. */
    t: Object.assign({}, play.engine, play.engine.layers.fh || {}),
    engine: play.engine, fh: play.engine.layers.fh || null,
    queueRolls, reset, die, emitted,
    queueEmpty: () => bucket.length,
    settledEvents: () => emitted.filter((event) => event.type === "roll-settled"),
    poolEvents: () => emitted.filter((event) => event.type === "pool-changed")
  };
}
