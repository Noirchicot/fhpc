/* ══ LE MOTEUR, CHARGÉ DANS LA PAGE — lot 33 ══════════════════════════
   Prouvé en navigateur au lot 32 : `src/build` et `src/layers` sont du JS
   portable, zéro serveur nécessaire. Ce fichier fait exactement ce que la
   sonde du lot 32 faisait à la main : monter la pile, brancher `build`,
   exposer ses verbes.

   ⛔ AUCUNE RÈGLE ICI. Ce fichier ne fait que charger et brancher — toute
   décision de jeu vient de `rebuild()`, jamais de ce module. */

/* EXPORTÉE pour `tests/ui-jetons.test.mjs` (§4, test 9) : le garde monte la
   MÊME liste, pas une copie qui pourrait diverger — la fidélité de « la
   pile montée comme la page » tient à cet import, pas à une recopie. */
export const LAYER_FILES = [
  "srd-5.2.1-en.layer.json",
  "fh-species-en.layer.json",
  "fh-skills-en.layer.json",
  "fh-arcana-en.layer.json",
  "fh-feats-en.layer.json"
];

function makeBus() {
  const listeners = new Map();
  return {
    on(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
      return () => listeners.get(type).delete(fn);
    },
    emit(type, data) {
      const event = Object.assign({ type }, data);
      for (const fn of listeners.get(type) || []) fn(event);
      return event;
    }
  };
}

/* §3h (lot 38) — DÉFAUT n°3, remesuré : sans `modules:`, `resolved.stats`
   revenait VIDE. L'écran ne perdait pas que le pool de compétences, il
   perdait aussi le Score de Destinée — les deux sur le personnage
   d'exemple. Mêmes modules que `src/tools/exemple-fh-en.mjs`, qui monte la
   même pile pour générer l'exemple commité. */
/** Monte la pile réelle et rend `{ build, layers }` — prêt pour `rebuild`. */
export async function bootEngine({ root = "../.." } = {}) {
  const { createLayers } = await import("../../src/layers/index.mjs");
  const { createBuild } = await import("../../src/build/index.mjs");
  const { createFhDestinyStat } = await import("../../src/modules/fh/destiny-stat.mjs");
  const { createFhSkillPoolStat } = await import("../../src/modules/fh/skill-pool.mjs");

  const bus = makeBus();
  const layers = createLayers({ bus });
  const dispatch = (route, payload) => {
    const [block, verb] = route.split(".");
    if (block !== "layers") throw new Error(`engine: unexpected route "${route}"`);
    return layers.verbs[verb](payload);
  };
  const build = createBuild({
    bus,
    dispatch,
    now: () => new Date().toISOString(),
    modules: [createFhDestinyStat(), createFhSkillPoolStat()]
  });

  for (const file of LAYER_FILES) {
    const bytes = new Uint8Array(await (await fetch(`${root}/layers/${file}`)).arrayBuffer());
    layers.verbs.register({ bytes, origin: file });
  }

  return { build, layers, bus };
}

/** Charge le personnage d'exemple EN+FH — la seule matière réelle
 *  disponible tant que l'étape `Universe & Layers` (0) et `doc.open` ne sont
 *  pas branchés. À remplacer par un vrai document ouvert/créé plus tard. */
export async function loadExampleDocument({ root = "../.." } = {}) {
  return (await fetch(`${root}/examples/personnage-fh-en-niveau1.fh-char.json`)).json();
}
