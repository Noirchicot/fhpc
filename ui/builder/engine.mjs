/* ══ LE MOTEUR, CHARGÉ DANS LA PAGE — lot 33 ══════════════════════════
   Prouvé en navigateur au lot 32 : `src/build` et `src/layers` sont du JS
   portable, zéro serveur nécessaire. Ce fichier fait exactement ce que la
   sonde du lot 32 faisait à la main : monter la pile, brancher `build`,
   exposer ses verbes.

   ⛔ AUCUNE RÈGLE ICI. Ce fichier ne fait que charger et brancher — toute
   décision de jeu vient de `rebuild()`, jamais de ce module. */

/* Lot 75 — les `fetch` d'exécution portent la version du graphe, lue dans
   l'URL de CE module : sans elle, un moteur frais pouvait recharger des
   couches de la version d'avant, servies par le cache (max-age=600 PAR
   fichier). Voir la tête de `version.mjs`. */
import { versionQuery } from "./version.mjs?v=510";

/* EXPORTÉE pour `tests/ui-jetons.test.mjs` (§4, test 9) : le garde monte la
   MÊME liste, pas une copie qui pourrait diverger — la fidélité de « la
   pile montée comme la page » tient à cet import, pas à une recopie. */
/* LOT 77 — `fh-fiche-en` et `fh-lore-en` ferment la pile, DANS CET ORDRE, et
   le même que `src/tools/exemple-fh-en.mjs` : les deux couches ne font que
   `patch` des records déjà posés (les 9 espèces du SRD, les 3 de
   `fh-species-en`, les 12 classes), donc elles ne peuvent monter qu'APRÈS
   ceux qui les définissent. ⛔ Les DEUX piles se tiennent à jour ensemble —
   une seule des deux et l'écran et les tests divergeraient en silence. */
export const LAYER_FILES = [
  "srd-5.2.1-en.layer.json",
  /* ⭐ LOT 95 — `srfh` se monte JUSTE AU-DESSUS DU LIVRE, et cette place n'est
     pas un choix d'ici : c'est le RANG 15 que fh-srd lui a donné (SRD 10,
     phb_opt 20, fates_hand 30). Elle porte le rangement d'Eric et n'aplatit
     rien — chaque record a son propre id et un `data.extends` vers l'objet
     SRD qu'il habille. ⚠️ EN seulement, comme la source. */
  "srfh-shelving-en.layer.json",
  "fh-species-en.layer.json",
  "fh-skills-en.layer.json",
  "fh-arcana-en.layer.json",
  "fh-feats-en.layer.json",
  "fh-spells-en.layer.json",
  "fh-fiche-en.layer.json",
  "fh-lore-en.layer.json"
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
  const { createLayers } = await import("../../src/layers/index.mjs?v=510");
  const { createBuild } = await import("../../src/build/index.mjs?v=510");
  const { createFhDestinyStat } = await import("../../src/modules/fh/destiny-stat.mjs?v=510");
  const { createFhSkillPoolStat } = await import("../../src/modules/fh/skill-pool.mjs?v=510");

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
    const bytes = new Uint8Array(await (await fetch(`${root}/layers/${file}${versionQuery(import.meta.url)}`)).arrayBuffer());
    layers.verbs.register({ bytes, origin: file });
  }

  return { build, layers, bus };
}

/** Charge le personnage d'exemple EN+FH — la seule matière réelle
 *  disponible tant que `doc.open` n'est pas branché (voir `contracts/doc.md`,
 *  « Comment le MCP s'y branchera » — hors périmètre de ce lot). À remplacer
 *  par un vrai document ouvert/créé plus tard. */
export async function loadExampleDocument({ root = "../.." } = {}) {
  return (await fetch(`${root}/examples/personnage-fh-en-niveau1.fh-char.json${versionQuery(import.meta.url)}`)).json();
}

/* LOT 54 — Concept/Universe écrivent `document.name`/`.gender`/`.alignment`/
   `.campaign` par `createDocWriters({schema})` (`src/doc/writers.mjs`), PAS
   par `createDoc` : le bloc `doc` refuse de se construire sans magasin, et
   le navigateur n'en a aucun (`src/doc/store.mjs`, tête de fichier). Ces
   écrivains n'ont besoin QUE du schéma — chargé ici, comme les couches et
   l'exemple, jamais recopié dans `ui/`. */
/** Le schéma `fh-char/1`, tel qu'il est sur le disque — même geste que
 *  `loadExampleDocument`. */
export async function loadDocSchema({ root = "../.." } = {}) {
  return (await fetch(`${root}/schemas/fh-char.schema.json${versionQuery(import.meta.url)}`)).json();
}
