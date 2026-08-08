/* Harnais du bloc `layers` (lot 7).

   Une couche entre par ses OCTETS. Le harnais fabrique donc de vrais octets à
   partir d'un objet : ce n'est pas un raccourci de test, c'est le même chemin
   que celui d'un fichier — même analyse, même empreinte, mêmes refus.

   La VRAIE MATIÈRE (les deux couches SRD, 2 613 records, et la couche
   d'exemple du lot 2) est lue depuis le dépôt, jamais recopiée en fixture :
   une fixture qui imite la matière finit toujours par diverger d'elle. */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createLayers } from "../src/layers/index.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const SRD_FR = "layers/srd-5.2.1-fr.layer.json";
export const SRD_EN = "layers/srd-5.2.1-en.layer.json";
export const HOMEBREW = "examples/layer-homebrew-fr.fh-layer.json";

export function fileBytes(rel) {
  return readFileSync(join(ROOT, rel));
}

export function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

/** Objet → octets, comme un fichier de couche sur le disque. */
export function bytes(layer) {
  return Buffer.from(JSON.stringify(layer, null, 2) + "\n", "utf8");
}

/** Une couche minimale et valide, à décorer par chaque scénario. */
export function aLayer(patch = {}) {
  return Object.assign({
    schema: "fh-layer/1",
    id: "test-couche",
    version: "1.0.0",
    name: "Couche de test",
    lang: "fr",
    flags: [],
    attribution: { license: "CC0-1.0" },
    records: {}
  }, patch);
}

/** Un record `add` minimal et valide. */
export function anAdd(name, data = {}) {
  return { name, data };
}

/** Une instance du bloc, avec son bus espionné. Chaque scénario a la sienne :
 *  le bloc n'a aucun état global, et deux suites ne doivent jamais se voir. */
export function makeBlock(options = {}) {
  const events = [];
  const bus = {
    emit(type, data) {
      const event = Object.assign({ type }, data);
      events.push(event);
      return event;
    }
  };
  const block = createLayers(Object.assign({ bus }, options));
  return { block, verbs: block.verbs, events, bus, last: () => events[events.length - 1] };
}
