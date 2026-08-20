/* Harnais du bloc `build` (lot 9).

   IL MONTE LA VRAIE MATIÈRE, ET RIEN D'AUTRE. La couche SRD et la couche
   d'exemple du lot 2 sont lues depuis le dépôt, jamais recopiées : « une
   copie qui imite la matière finit toujours par diverger d'elle »
   (layers-harness). Depuis la fusion du lot 8, il n'y a plus d'échafaudage —
   les champs mécaniques sont dans la vraie couche.

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

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SRD_FR = "layers/srd-5.2.1-fr.layer.json";
export const HOMEBREW = "examples/layer-homebrew-fr.fh-layer.json";
export const EXAMPLE_CHAR = "examples/personnage-srd-fr-niveau1.fh-char.json";
/* La pile Fate's Hand du lot 15 : SRD anglais dessous, couche FH par-dessus.
   C'est elle qui lève `fh.destiny`, et c'est la seule qui porte les Bases de
   Destinée. Lue depuis le dépôt, jamais recopiée. */
export const SRD_EN = "layers/srd-5.2.1-en.layer.json";
export const FH_SPECIES_EN = "layers/fh-species-en.layer.json";
/* Les deux couches du lot 20. Elles lèvent `fh.destiny` elles aussi — un
   personnage peut donc porter sa carte SANS la couche des espèces, et c'est ce
   qui permet de prouver chaque terme séparément. */
export const FH_ARCANA_EN = "layers/fh-arcana-en.layer.json";
export const FH_FEATS_EN = "layers/fh-feats-en.layer.json";
/* Les deux couches de TEXTE du lot 77 — le blurb et les lignes de fiche
   d'un côté, le lore long de l'autre. Elles ne lèvent aucun drapeau et
   n'allument aucun module : elles ne font que `patch` du contenu sur les 24
   records de classe et d'espèce. Elles ferment la pile « SRD + FH ». */
export const FH_FICHE_EN = "layers/fh-fiche-en.layer.json";
export const FH_SPELLS_EN = "layers/fh-spells-en.layer.json";
export const FH_LORE_EN = "layers/fh-lore-en.layer.json";

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
 * @param {string[]} [options.layers] les couches à monter, dans l'ordre.
 * @param {object} [options.extra] une couche de plus, montée au-dessus.
 * @param {Array}  [options.modules] les modules de statistique injectés dans le bloc (lot 19).
 *   ⚠️ AUCUN PAR DÉFAUT, et c'est la loi §0.12 rendue littérale : le harnais
 *   par défaut monte le pli SRD nu, et un module Fate's Hand n'y entre que si
 *   le scénario le demande.
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
  const build = createBuild({ bus, dispatch, now, modules: options.modules || [] });

  const files = options.layers || [SRD_FR, HOMEBREW];
  for (const file of files) layers.verbs.register({ bytes: fileBytes(file), origin: file });
  /* Une couche SUPPLÉMENTAIRE, fabriquée par le scénario. C'est par là
     qu'entrent les couches AMPUTÉES qui prouvent les refus : depuis la fusion
     du lot 8, la vraie matière porte les champs mécaniques, et un refus ne se
     prouve plus par la pénurie de la source. */
  if (options.extra) layers.verbs.register({ bytes: bytesOf(options.extra), origin: "couche du scénario" });
  return { bus, layers, build, verbs: build.verbs, dispatch, dispatched, files };
}

/* ══ LES COUCHES DE SCÉNARIO ═══════════════════════════════════════════

   ⚠️ POURQUOI ELLES EXISTENT, ET DEPUIS QUAND. Avant la fusion du lot 8, les
   refus de la dérivation se prouvaient tout seuls : la vraie couche ne portait
   aucun champ mécanique, donc il suffisait de la monter pour voir le bloc
   déclarer. **La source s'est enrichie, et ces preuves-là se sont évaporées** —
   `hit_die`, `saving_throw_keys`, `tool.ability_key`, `ac_base` sont arrivés.

   On ne relâche pas une garantie parce que la matière s'est améliorée : on la
   reprouve autrement. Une couche de scénario RECOUVRE un record par un `add`
   (« le dernier qui parle gagne »), en n'y laissant que la prose. L'amputation
   devient alors DÉLIBÉRÉE et LISIBLE, au lieu d'être un accident de la source
   dont personne ne remarquerait la disparition. */

/** Une couche minimale et valide, à monter par-dessus le reste. */
export function uneCouche(id, records) {
  return {
    schema: "fh-layer/1",
    id,
    version: "1.0.0",
    name: `Couche de scénario — ${id}`,
    lang: "fr",
    flags: [],
    attribution: { license: "CC0-1.0" },
    records
  };
}

/** Recouvre un record par un `add` qui ne garde QUE les clefs nommées.
 *  Ce qui n'est pas nommé disparaît — c'est l'amputation. */
export function ampute(genre, id, name, data) {
  return { [genre]: { [id]: { op: "add", name, slug: id.split(":").pop(), data } } };
}

/** La pile telle qu'un document doit la déclarer dans `build.layers`. */
export function manifestOf(layers) {
  return layers.verbs.stack()
    .filter((layer) => layer.enabled)
    .map((layer) => ({ id: layer.id, version: layer.version, hash: layer.hash, name: layer.name }));
}

/* ══ LE PERSONNAGE D'ACCEPTATION ═══════════════════════════════════════

   Le magicien elfe du lot 2 est la cible d'acceptation, et ses `build.choices`
   sont repris MOT POUR MOT — plus rien n'est ajouté ici.

   ⚠️ ÇA N'A PAS TOUJOURS ÉTÉ LE CAS. La première passe de ce lot a dû porter
   un « complément » dans ce harnais, parce que trois familles de décisions
   manquaient au fichier et qu'aucune ne se devine : le NIVEAU (rien ne le
   dérive — ni le bonus de maîtrise, ni les emplacements, ni les points de vie
   ne s'en passent), l'ÉQUIPEMENT et la BOURSE (que le contrat §6 dit pourtant
   nourris par les choix). L'architecte a tranché le 2026-08-08 : le fichier
   est la cible d'acceptation de TOUS les lots suivants, donc il doit être
   constructible tel quel, et le complément a été versé dedans.

   Ce qui reste dehors, et c'est mesuré : les NOTES. `build.choices[].value`
   est plafonné à 200 caractères par le schéma et la note « Histoire » en fait
   déjà 188. Une note appartient au bloc `doc`, pas à la dérivation. */

/** Le document d'acceptation : les choix et les overrides du fichier
 *  d'exemple, tels quels, et la pile RÉELLEMENT montée. */
export function acceptanceDocument(layers) {
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
      choices: structuredClone(example.build.choices),
      budgets: structuredClone(example.build.budgets),
      overrides: structuredClone(example.build.overrides)
    }
  };
}
