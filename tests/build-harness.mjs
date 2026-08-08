/* Harnais du bloc `build` (lot 9).

   IL MONTE LA VRAIE MATIÈRE. Les deux couches SRD (2 613 records) et la couche
   d'exemple du lot 2 sont lues depuis le dépôt, jamais recopiées : « une
   fixture qui imite la matière finit toujours par diverger d'elle »
   (layers-harness). Par-dessus, une SEULE couche d'échafaudage — la fixture
   mécanique — porte les champs que le lot 8 écrit en parallèle.

   LE BLOC NE PARLE À LA PILE QUE PAR `dispatch`. Le harnais fabrique donc un
   `dispatch` local qui route `layers.*` vers l'INSTANCE de la pile montée ici,
   sans passer par le registre du noyau (qui est un singleton, et qu'une suite
   ne peut pas réenregistrer). C'est le même chemin qu'en production, avec un
   aiguillage différent — pas un raccourci. */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createLayers } from "../src/layers/index.mjs";
import { createBuild } from "../src/build/index.mjs";
import { fixtureLayer, FIXTURE_ID } from "./build-fixture-mecanique.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SRD_FR = "layers/srd-5.2.1-fr.layer.json";
export const HOMEBREW = "examples/layer-homebrew-fr.fh-layer.json";
export const EXAMPLE_CHAR = "examples/personnage-srd-fr-niveau1.fh-char.json";

export function fileBytes(rel) {
  return readFileSync(join(ROOT, rel));
}
export function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}
export function bytesOf(document) {
  return Buffer.from(JSON.stringify(document, null, 2) + "\n", "utf8");
}

/** Un bus qui écoute ET qui note. `layers` n'a besoin que d'`emit`, `build`
 *  a besoin d'`on` : le même bus sert les deux, comme le noyau. */
export function makeBus() {
  const events = [];
  const listeners = new Map();
  return {
    events,
    on(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
      return () => listeners.get(type).delete(fn);
    },
    emit(type, data) {
      const event = Object.assign({ type }, data);
      events.push(event);
      const set = listeners.get(type);
      if (set) for (const fn of set) fn(event);
      return event;
    },
    of(type) { return events.filter((event) => event.type === type); },
    last(type) { const list = this.of(type); return list[list.length - 1]; }
  };
}

/**
 * Monte la pile et branche un bloc `build` dessus.
 * @param {object} [options]
 * @param {boolean} [options.fixture=true] monter la fixture mécanique du lot 8.
 * @param {string[]} [options.layers] les couches à monter, dans l'ordre.
 */
export function makeHarness(options = {}) {
  const bus = makeBus();
  const layers = createLayers({ bus });

  const dispatched = [];
  const dispatch = (route, payload) => {
    dispatched.push(route);
    const [block, verb] = route.split(".");
    if (block !== "layers") throw new Error(`harnais : route inattendue « ${route} »`);
    return layers.verbs[verb](payload);
  };

  let tick = 0;
  const now = () => `2026-08-08T12:00:${String(tick++).padStart(2, "0")}Z`;
  /* ⚠️ LE BLOC EST CONSTRUIT AVANT QUE LES COUCHES SOIENT MONTÉES, et c'est
     l'ordre de production : on branche les blocs, PUIS on charge. Un bloc
     construit après coup a manqué les `layers-changed` déjà émis, et il ne
     connaît donc pas les recouvrements de la pile — `rebuild` le DIT alors,
     dans ses `warnings` (une suite le vérifie). */
  const build = createBuild({ bus, dispatch, now });

  const files = options.layers || [SRD_FR, HOMEBREW];
  const fixtureOptions = Object.assign(
    { sansHomebrew: !files.includes(HOMEBREW) },
    options.fixtureOptions || {}
  );
  for (const file of files) layers.verbs.register({ bytes: fileBytes(file), origin: file });
  if (options.fixture !== false) {
    layers.verbs.register({
      bytes: bytesOf(fixtureLayer(fixtureOptions)),
      origin: "tests/build-fixture-mecanique.mjs"
    });
  }
  return { bus, layers, build, verbs: build.verbs, dispatch, dispatched, files, fixtureId: FIXTURE_ID };
}

/** La pile telle qu'un document doit la déclarer dans `build.layers`. */
export function manifestOf(layers) {
  return layers.verbs.stack()
    .filter((layer) => layer.enabled)
    .map((layer) => ({ id: layer.id, version: layer.version, hash: layer.hash, name: layer.name }));
}

/* ══ LE PERSONNAGE D'ACCEPTATION ═══════════════════════════════════════

   ⚠️ LE COMPLÉMENT, ET POURQUOI IL EXISTE. Le magicien elfe du lot 2 est la
   cible d'acceptation ; ses `build.choices` sont repris MOT POUR MOT. Mais
   trois familles de décisions manquent à sa liste, et aucune ne se devine :

   1. **le NIVEAU** — aucun choix ne le porte, et rien ne le dérive (ni le
      bonus de maîtrise, ni les emplacements, ni les points de vie ne s'en
      passent) ;
   2. **l'ÉQUIPEMENT et la BOURSE** — le contrat §6 dit que `resolved.gear` et
      `resolved.currency` sont « nourris par `build.choices` qui nomment
      directement des ids d'objets et un montant » ; ces choix-là ne sont pas
      dans le fichier ;
   3. rien pour les **notes** — et c'est mesuré : `build.choices[].value` est
      plafonné à 200 caractères par le schéma, donc un choix ne PEUT PAS
      porter une note de personnage. Elles restent non dérivées.

   Le complément est nommé, isolé, et une suite tourne SANS lui pour prouver
   que la dérivation refuse platement au lieu de combler. Les trois manques
   sont remontés à l'architecte (QUESTIONS-ARCHITECTE.md, question 5). */

export const COMPLEMENT_NIVEAU = [
  { path: "level", value: 1 }
];

/* Le sac du magicien, tel que `resolved.gear` du fichier le liste. Chaque
   ligne cite un record de la pile ; « Livre de sorts » n'existe PAS dans le
   SRD exporté (le genre `gear` porte « Livre »), et cette ligne-là est donc
   la seule divergence assumée avec le fichier — elle est nommée dans la suite
   d'acceptation plutôt que maquillée. */
const SAC = [
  ["weapon", "srd:weapon:fr:dague", 1, true],
  ["weapon", "srd:weapon:fr:baton-de-combat", 1, true],
  ["gear", "srd:gear:fr:livre", 1, false],
  ["gear", "srd:gear:fr:sacoche-a-composantes", 1, true],
  ["tool", "srd:tool:fr:materiel-de-calligraphe", 1, false],
  ["gear", "srd:gear:fr:sac-a-dos", 1, true],
  ["gear", "srd:gear:fr:rations", 5, false],
  /* Deux torches au départ : l'override du MJ en fera quatre, et c'est ce qui
     prouve que les overrides passent APRÈS la dérivation. */
  ["gear", "srd:gear:fr:torche", 2, false],
  ["gear", "exemple:gear:fr:lanterne-pliante", 1, false]
];

export const COMPLEMENT_EQUIPEMENT = SAC.flatMap(([kind, id, quantity, equipped], index) => [
  { path: `gear[${index}]`, ref: { kind, id } },
  { path: `gear[${index}].quantity`, value: quantity },
  { path: `gear[${index}].equipped`, value: equipped }
]);

export const COMPLEMENT_BOURSE = [
  { path: "currency.cp", value: 4 },
  { path: "currency.sp", value: 12 },
  { path: "currency.gp", value: 8 },
  { path: "currency.pp", value: 0 }
];

export const COMPLEMENT = [...COMPLEMENT_NIVEAU, ...COMPLEMENT_EQUIPEMENT, ...COMPLEMENT_BOURSE];

/** Le document d'acceptation : les choix et les overrides du fichier
 *  d'exemple, le complément nommé ci-dessus, et la pile RÉELLEMENT montée. */
export function acceptanceDocument(layers, { complement = COMPLEMENT } = {}) {
  const example = readJson(EXAMPLE_CHAR);
  return {
    schema: example.schema,
    id: example.id,
    name: example.name,
    lang: example.lang,
    units: example.units,
    generator: { name: "tests/build-harness", version: "1.0.0" },
    created: example.created,
    modified: example.modified,
    /* `resolved` est volontairement ABSENT : l'acceptation demande que la
       fiche soit reconstruite depuis les choix SEULS. Un `resolved` recopié
       aurait pu être confondu avec un résultat. */
    build: {
      external: example.build.external,
      layers: manifestOf(layers),
      choices: [...structuredClone(example.build.choices), ...structuredClone(complement)],
      overrides: structuredClone(example.build.overrides)
    }
  };
}
