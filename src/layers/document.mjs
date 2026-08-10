/* ══ LE DOCUMENT DE COUCHE — les octets, l'empreinte, et le refus ══════
   Lot 7-bloc-layers. Ce fichier lit un `fh-layer/1` et n'en laisse entrer
   AUCUN qui ne tienne debout.

   POURQUOI UNE VALIDATION EN CODE ALORS QUE LE SCHÉMA EXISTE. `ajv` est une
   dépendance de DÉV (loi §0.11) : elle n'est pas là au moment où une couche
   arrive. Or la promesse de la décision Q4 — « charger le homebrew d'un
   inconnu est inoffensif » — est une promesse d'EXÉCUTION, pas de suite de
   tests. Le schéma reste la NORME ; ce fichier en est l'exécution au
   chargement. La dérive entre les deux est tenue par un garde qui lit le
   schéma sur le disque et compare (`tests/layers-document.test.mjs`) : si
   quelqu'un ajoute un quinzième genre au schéma sans le dire ici, la suite
   rougit.

   LE REFUS EST DANS LE REVIVER, ET C'EST DÉLIBÉRÉ. Les clefs dangereuses
   (`__proto__`, `constructor`, …) sont refusées PENDANT `JSON.parse`, avant
   qu'un seul objet du document existe. Une passe de nettoyage APRÈS coup
   arriverait après la pollution qu'elle prétend empêcher — et un « strip »
   silencieux est justement le contre-modèle de la loi §0.5. Ici on jette, en
   nommant la clef.

   L'EMPREINTE EST CELLE DES OCTETS. `build.layers[].hash` du document
   `fh-char/1` est le SHA-256 du FICHIER de couche ; une couche ne contient
   jamais son propre hash (schéma fh-layer/1, $comment (4)). C'est pourquoi ce
   module prend des OCTETS et pas un objet déjà analysé : un objet re-sérialisé
   ne rend pas les octets d'origine, et l'empreinte deviendrait une empreinte
   de rien. */

/* ⚠️ PAS DE `node:crypto`, ET C'EST DÉLIBÉRÉ (lot 32). Ce fichier est le seul
   du chemin `build/decisions` à toucher un module Node — l'engin, sinon, est
   du JS portable pur (aucun `fs`, aucun `process`), ce que le builder v2
   exploite en le chargeant DIRECTEMENT dans la page (loi Q3 : zéro serveur,
   zéro build). `sha256Portable` est un SHA-256 (FIPS 180-4) synchrone,
   dépendance zéro, vérifié BYTE-À-BYTE contre `node:crypto` sur cinq
   vecteurs dont un vrai fichier de couche (INVENTAIRE-LOT-32.md). Il ne
   remplace `node:crypto` que parce que Web Crypto (`crypto.subtle.digest`)
   est ASYNCHRONE et `readLayer`/`register` sont un contrat SYNCHRONE que ce
   lot ne rouvre pas. */
import { sha256Portable } from "./sha256.mjs";

/* Les 15 genres, dans l'ordre du schéma (alphabétique). RÉVISION DU
   2026-08-08 : `skill` et `class-progression` sont les genres 13 et 14, venus
   du lot 6-srd-tables. RÉVISION DU 2026-08-08 : `arcana` est le genre 15 — et
   le PREMIER qui ne vienne pas de fh-srd. Les 14 autres sont les 14 fichiers
   d'export SRD ; celui-ci porte les 22 Arcanes majeurs de Fate's Hand, qui
   n'existent dans aucun SRD. `src/tools/gen-srd-layer.mjs` garde donc sa
   propre liste de 14 et ne doit jamais recevoir `arcana` : un générateur SRD
   qui produirait un genre FH mélangerait les deux couches (loi §0.12).
   Un genre inconnu est un rejet bruyant, jamais une clef acceptée en silence
   — c'est la seule défense contre `spel`. */
export const GENRES = [
  "arcana", "armor", "background", "class", "class-progression", "feat", "gear",
  "glossary", "item", "monster", "skill", "species", "spell", "tool", "weapon"
];
const GENRE_SET = new Set(GENRES);

/* Reprise LITTÉRALE de `$defs/safeKey` du schéma. Le garde de dérive compare
   les deux listes ; les modifier séparément est ce qu'il empêche. */
export const FORBIDDEN_KEYS = [
  "__proto__", "constructor", "prototype", "script", "Script",
  "javascript", "eval", "exec", "function", "Function"
];
const FORBIDDEN_KEY = new Set(FORBIDDEN_KEYS);

/* Les grammaires du schéma, reprises telles quelles. Elles sont EXPORTÉES pour
   que le garde de dérive puisse les comparer, une par une, au fichier de
   schéma sur le disque : un garde qui ne voit pas ce qu'il garde ne garde
   rien. */
export const PATTERNS = {
  layerId: /^[a-z0-9][a-z0-9._-]{0,79}$/,
  lang: /^[a-z]{2}(-[A-Z]{2})?$/,
  flag: /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/,
  recordId: /^[a-z0-9][a-z0-9-]*(:[a-z0-9][a-z0-9._-]*){2,3}$/,
  slug: /^[a-z0-9][a-z0-9-]{0,119}$/,
  sha256: /^[0-9a-f]{64}$/,
  changePath: /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*|\[[a-z][a-z0-9:_-]*\])*$/
};
const LAYER_ID = PATTERNS.layerId;
const LANG = PATTERNS.lang;
const FLAG = PATTERNS.flag;
const RECORD_ID = PATTERNS.recordId;
const SLUG = PATTERNS.slug;
const SHA256 = PATTERNS.sha256;
export const CHANGE_PATH = PATTERNS.changePath;

/* Les clefs autorisées par opération. Listes FERMÉES : une clef en trop est un
   rejet, pas un champ ignoré (même discipline que la liste fermée de réglages
   par type de jet, lot 5 exigence A). */
const KEYS_ADD = new Set(["op", "name", "slug", "data", "attribution", "source", "contentHash"]);
/* `remove` est entré le 2026-08-08 (lot 17) : une clef SŒUR de `changes`, une
   liste de chemins de la même grammaire. Les deux peuvent coexister ; au moins
   l'une des deux doit être là, sans quoi le patch ne change rien.
   EXPORTÉE pour le garde de dérive : une clef ajoutée au schéma sans l'être ici
   serait acceptée par la norme et refusée par son exécution — et l'écart ne se
   verrait qu'au chargement d'une vraie couche, chez quelqu'un d'autre. */
export const PATCH_KEYS = ["op", "changes", "remove", "note", "attribution"];
const KEYS_PATCH = new Set(PATCH_KEYS);
const KEYS_DISABLE = new Set(["op", "reason"]);
const KEYS_LAYER = new Set([
  "schema", "id", "version", "name", "lang", "units", "flags", "ruleValues",
  "attribution", "description", "records"
]);
const UNITS = { distance: ["m", "ft"], weight: ["kg", "lb"] };

class LayerError extends Error {}

function fail(origin, what) {
  throw new LayerError(`fhpc/layers: ${origin} — ${what}`);
}

export function sha256(bytes) {
  return sha256Portable(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
}

/* Octets → texte. Une couche arrive en octets (c'est un fichier) ; une chaîne
   est acceptée pour les suites, et son empreinte est celle de son encodage
   UTF-8. Tout le reste est refusé : un objet déjà analysé n'a pas d'octets,
   donc pas d'empreinte (voir l'en-tête).
   ⚠️ Rend un `Uint8Array` NU, pas un `Buffer` Node (lot 32) — `Buffer` EST un
   `Uint8Array`, donc rien qui ne lisait que la forme commune ne casse ; ce
   qui aurait cassé, c'est un appelant qui utilisait une méthode PROPRE à
   `Buffer` (`.toString("utf8")` notamment) — le seul appelant, `readLayer`,
   est corrigé dans le même lot. */
function bytesOf(input, origin) {
  if (typeof input === "string") return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  fail(origin, "register attend les OCTETS du fichier de couche (Buffer, Uint8Array ou chaîne UTF-8), " +
    "pas un document déjà analysé : l'empreinte de build.layers[].hash est celle des octets.");
}

/* L'analyse. Le reviver voit CHAQUE clef, y compris `__proto__` — que
   `JSON.parse` pose bien en propriété propre et soumet au reviver (vérifié,
   Node 24). C'est le seul endroit où une clef dangereuse peut être arrêtée
   avant d'exister. */
function parseSafely(text, origin) {
  let doc;
  try {
    doc = JSON.parse(text, function (key, value) {
      if (FORBIDDEN_KEY.has(key)) {
        fail(origin, `clef interdite « ${key} » dans le document — une couche est de la DONNÉE, ` +
          "jamais du code, et jamais un vecteur de pollution de prototype (décision Q4).");
      }
      return value;
    });
  } catch (error) {
    if (error instanceof LayerError) throw error;
    fail(origin, `JSON illisible — ${error.message}`);
  }
  if (!isPlainObject(doc)) fail(origin, "le document racine doit être un objet fh-layer/1.");
  return doc;
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertString(value, { origin, what, pattern, min = 1, max = Infinity }) {
  if (typeof value !== "string") fail(origin, `${what} doit être une chaîne.`);
  if (value.length < min) fail(origin, `${what} ne peut pas être vide.`);
  if (value.length > max) fail(origin, `${what} dépasse ${max} caractères.`);
  if (pattern && !pattern.test(value)) fail(origin, `${what} ne respecte pas sa forme (« ${value} »).`);
  return value;
}

function assertClosedKeys(object, allowed, { origin, what }) {
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) {
      fail(origin, `${what} porte la clef inconnue « ${key} » — aucune clef n'est ignorée en silence ` +
        `(attendu : ${[...allowed].join(", ")}).`);
    }
  }
}

function assertAttribution(value, { origin, what }) {
  if (!isPlainObject(value)) fail(origin, `${what} doit être un objet.`);
  assertClosedKeys(value, new Set(["license", "text", "url"]), { origin, what });
  assertString(value.license, { origin, what: `${what}.license`, max: 80 });
  for (const key of ["text", "url"]) {
    if (value[key] !== undefined && typeof value[key] !== "string") {
      fail(origin, `${what}.${key} doit être une chaîne.`);
    }
  }
}

function assertEntry(entry, { origin, genre, id }) {
  const what = `records.${genre}["${id}"]`;
  if (!isPlainObject(entry)) fail(origin, `${what} doit être un objet.`);
  const op = entry.op === undefined ? "add" : entry.op;

  if (op === "add") {
    assertClosedKeys(entry, KEYS_ADD, { origin, what });
    assertString(entry.name, { origin, what: `${what}.name`, max: 200 });
    if (entry.slug !== undefined) assertString(entry.slug, { origin, what: `${what}.slug`, pattern: SLUG });
    if (!isPlainObject(entry.data)) fail(origin, `${what}.data doit être un objet — un record « add » porte son contenu.`);
    if (entry.attribution !== undefined) assertAttribution(entry.attribution, { origin, what: `${what}.attribution` });
    if (entry.source !== undefined) {
      if (!isPlainObject(entry.source)) fail(origin, `${what}.source doit être un objet.`);
      assertClosedKeys(entry.source, new Set(["id", "locator", "version"]), { origin, what: `${what}.source` });
      assertString(entry.source.id, { origin, what: `${what}.source.id`, max: 120 });
    }
    if (entry.contentHash !== undefined) {
      assertString(entry.contentHash, { origin, what: `${what}.contentHash`, pattern: SHA256 });
    }
    return "add";
  }

  if (op === "patch") {
    assertClosedKeys(entry, KEYS_PATCH, { origin, what });
    if (entry.changes === undefined && entry.remove === undefined) {
      fail(origin, `${what} ne porte ni changes ni remove — un patch qui ne change rien n'est pas un patch.`);
    }
    if (entry.changes !== undefined) {
      if (!isPlainObject(entry.changes)) fail(origin, `${what}.changes doit être un objet chemin → valeur.`);
      const paths = Object.keys(entry.changes);
      if (paths.length === 0) fail(origin, `${what}.changes est vide — un patch qui ne change rien n'est pas un patch.`);
      for (const path of paths) {
        if (path.length > 200 || !CHANGE_PATH.test(path)) {
          fail(origin, `${what}.changes : chemin mal formé « ${path} ».`);
        }
      }
    }
    /* `remove` : une LISTE de chemins, de la même grammaire que `changes`.
       Un tableau vide est refusé pour la même raison qu'un `changes` vide —
       une clef posée qui ne fait rien est une intention qu'on croit tenue. */
    if (entry.remove !== undefined) {
      if (!Array.isArray(entry.remove)) {
        fail(origin, `${what}.remove doit être un tableau de chemins — la clef sœur de changes, ` +
          "et jamais une valeur sentinelle posée DANS changes.");
      }
      if (entry.remove.length === 0) {
        fail(origin, `${what}.remove est vide — un retrait qui ne retire rien n'est pas un retrait.`);
      }
      for (const path of entry.remove) {
        if (typeof path !== "string" || path.length > 200 || !CHANGE_PATH.test(path)) {
          fail(origin, `${what}.remove : chemin mal formé « ${path} ».`);
        }
      }
    }
    if (entry.attribution !== undefined) assertAttribution(entry.attribution, { origin, what: `${what}.attribution` });
    if (entry.note !== undefined && typeof entry.note !== "string") fail(origin, `${what}.note doit être une chaîne.`);
    return "patch";
  }

  if (op === "disable") {
    assertClosedKeys(entry, KEYS_DISABLE, { origin, what });
    if (entry.reason !== undefined && typeof entry.reason !== "string") fail(origin, `${what}.reason doit être une chaîne.`);
    return "disable";
  }

  fail(origin, `${what}.op vaut « ${entry.op} » — les trois seules opérations sont add, patch et disable.`);
}

/** Valide la forme d'un document fh-layer/1 déjà analysé. Jette au premier
 *  manquement, en NOMMANT le chemin fautif : un rejet qui ne dit pas où oblige
 *  à deviner, et deviner est ce que ce dépôt paye le plus cher. */
export function assertLayerShape(doc, origin = "(couche)") {
  assertClosedKeys(doc, KEYS_LAYER, { origin, what: "le document" });
  if (doc.schema !== "fh-layer/1") {
    fail(origin, `schema vaut « ${doc.schema} » — ce bloc ne monte que des documents fh-layer/1.`);
  }
  assertString(doc.id, { origin, what: "id", pattern: LAYER_ID });
  assertString(doc.version, { origin, what: "version", max: 40 });
  assertString(doc.name, { origin, what: "name", max: 200 });
  assertString(doc.lang, { origin, what: "lang", pattern: LANG });

  if (!Array.isArray(doc.flags)) fail(origin, "flags doit être un tableau (vide autorisé) — une couche déclare toujours ses drapeaux.");
  for (const flag of doc.flags) assertString(flag, { origin, what: "un drapeau de flags", pattern: FLAG, max: 60 });

  if (doc.ruleValues !== undefined) {
    if (!isPlainObject(doc.ruleValues)) fail(origin, "ruleValues doit être un objet.");
    for (const [key, value] of Object.entries(doc.ruleValues)) {
      assertString(key, { origin, what: `la clef de règle « ${key} »`, pattern: FLAG, max: 60 });
      if (typeof value !== "number" && typeof value !== "boolean") {
        fail(origin, `ruleValues["${key}"] doit être un nombre ou un booléen — jamais du texte affichable ` +
          "(loi §0.13), jamais un objet (une couche ne transporte pas de mécanique, décision Q4).");
      }
    }
  }

  assertAttribution(doc.attribution, { origin, what: "attribution" });

  if (doc.description !== undefined && typeof doc.description !== "string") fail(origin, "description doit être une chaîne.");

  if (doc.units !== undefined) {
    if (!isPlainObject(doc.units)) fail(origin, "units doit être un objet.");
    assertClosedKeys(doc.units, new Set(Object.keys(UNITS)), { origin, what: "units" });
    for (const [key, allowed] of Object.entries(UNITS)) {
      if (doc.units[key] !== undefined && !allowed.includes(doc.units[key])) {
        fail(origin, `units.${key} vaut « ${doc.units[key] }» — attendu ${allowed.join(" ou ")}.`);
      }
    }
  }

  if (!isPlainObject(doc.records)) fail(origin, "records doit être un objet de genres.");
  const counts = {};
  let total = 0;
  for (const [genre, entries] of Object.entries(doc.records)) {
    if (!GENRE_SET.has(genre)) {
      fail(origin, `genre inconnu « ${genre} » — les ${GENRES.length} genres sont ${GENRES.join(", ")}. ` +
        "Un genre neuf entre par une révision explicite de fh-layer/1, jamais par une faute de frappe acceptée.");
    }
    if (!isPlainObject(entries)) fail(origin, `records.${genre} doit être un objet id → record.`);
    for (const [id, entry] of Object.entries(entries)) {
      assertString(id, { origin, what: `l'id de record « ${id} » (genre ${genre})`, pattern: RECORD_ID });
      assertEntry(entry, { origin, genre, id });
      total += 1;
    }
    counts[genre] = Object.keys(entries).length;
  }
  return { counts, total };
}

/** Le seul chemin d'entrée d'une couche : des octets → un document validé,
 *  son empreinte, et le compte de ses records. */
export function readLayer(input, origin = "(couche sans nom de fichier)") {
  const bytes = bytesOf(input, origin);
  const hash = sha256(bytes);
  const document = parseSafely(new TextDecoder("utf-8").decode(bytes), origin);
  const named = `${origin} [${typeof document.id === "string" ? document.id : "id illisible"}]`;
  const { counts, total } = assertLayerShape(document, named);
  return { document, hash, counts, total, origin };
}

export function isGenre(kind) {
  return GENRE_SET.has(kind);
}

export function assertGenre(kind) {
  if (typeof kind !== "string" || !GENRE_SET.has(kind)) {
    throw new LayerError(
      `fhpc/layers: genre inconnu « ${kind} » — les ${GENRES.length} genres sont ${GENRES.join(", ")}.`
    );
  }
  return kind;
}

export function isForbiddenKey(key) {
  return FORBIDDEN_KEY.has(key);
}

export { LayerError };
