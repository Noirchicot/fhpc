/* Harnais du bloc `doc` (lot 14).

   IL MONTE LE VRAI SCHÉMA ET LE VRAI PERSONNAGE. Le document d'exemple du
   lot 2 est LU depuis le dépôt, jamais recopié : « une copie qui imite la
   matière finit toujours par diverger d'elle » (layers-harness). Il n'est
   jamais réécrit non plus — c'est la cible d'acceptation de tous les lots, et
   le veilleur d'arbre (`tests/tree-immuable.test.mjs`) le surveille.

   ⚠️ LE MAGASIN DE MÉMOIRE EST LA PREUVE DE LA DÉCISION D1, PAS UNE
   COMMODITÉ. Le bloc reçoit son stockage injecté ; une suite peut donc
   éprouver ouverture, sauvegarde, collision, import et export SANS ÉCRIRE UN
   OCTET sur le disque. Le magasin système de fichiers est éprouvé lui aussi,
   mais dans un répertoire TEMPORAIRE — une suite ne mute jamais l'arbre de
   travail (lot 13). */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createDoc } from "../src/doc/index.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const EXAMPLE_CHAR = "examples/personnage-srd-fr-niveau1.fh-char.json";
export const CHAR_SCHEMA = "schemas/fh-char.schema.json";

export function fileBytes(rel) {
  return readFileSync(join(ROOT, rel));
}
export function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
}

/** Le schéma `fh-char/1`, tel qu'il est sur le disque. C'est l'appelant qui le
 *  charge — `src/doc/` ne lit pas de fichier (décision D1). */
export function charSchema() {
  return readJson(CHAR_SCHEMA);
}

/** Les octets du personnage d'exemple, tels quels. */
export function exampleBytes() {
  return fileBytes(EXAMPLE_CHAR);
}

/** Le personnage d'exemple analysé — une copie fraîche à chaque appel, pour
 *  qu'une suite qui le modifie n'empoisonne pas la suivante. */
export function exampleDocument() {
  return readJson(EXAMPLE_CHAR);
}

/** Un bus qui écoute ET qui note (même forme qu'au harnais du lot 9). */
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
 * Un magasin EN MÉMOIRE, au même port que celui du système de fichiers.
 *
 * `plant` et `forget` sont des gestes de SUITE, pas du port : ils jouent
 * « quelqu'un d'autre a écrit dans le magasin pendant que tu tenais le
 * document », qui est exactement la situation que la garde de collision
 * existe pour voir. Le bloc ne les connaît pas.
 */
export function memoryStorage(initial = {}) {
  const files = new Map(Object.entries(initial).map(([key, value]) => [key, Buffer.from(value)]));
  let writes = 0;
  return {
    files,
    get writes() { return writes; },
    list() { return [...files.keys()]; },
    read(key) { return files.has(key) ? Buffer.from(files.get(key)) : null; },
    write(key, bytes) { writes += 1; files.set(key, Buffer.from(bytes)); },
    /** Pose des octets SANS passer par le bloc. */
    plant(key, bytes) { files.set(key, Buffer.from(bytes)); },
    /** Retire une entrée SANS passer par le bloc. */
    forget(key) { files.delete(key); }
  };
}

/** Une horloge figée, qui avance quand on le lui demande. */
export function fixedClock(start = "2026-08-08T12:00:00Z") {
  let value = start;
  const now = () => value;
  now.set = (next) => { value = next; };
  return now;
}

/** Le bloc monté sur un magasin de mémoire, avec le vrai schéma. */
export function makeDoc({ storage = memoryStorage(), schema = charSchema(), bus = makeBus(), now = fixedClock() } = {}) {
  const doc = createDoc({ storage, schema, bus, now });
  return { doc, verbs: doc.verbs, storage, bus, schema, now };
}

/** Une copie du document d'exemple sous un autre id — de quoi peupler un
 *  magasin sans jamais toucher au fichier du dépôt. */
export function characterNamed(id, name = id) {
  const document = exampleDocument();
  document.id = id;
  document.name = name;
  return document;
}
