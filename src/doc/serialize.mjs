/* ══ LES OCTETS D'UN PERSONNAGE ════════════════════════════════════════
   Lot 14-bloc-doc.

   ── UN DOCUMENT ENTRE PAR SES OCTETS, ET IL EN RESSORT LES MÊMES ────────
   La thèse du produit est « le joueur peut se balader partout avec ses
   persos » : la baseline du voyage est le FICHIER (ARCHITECTURE.md). Un
   fichier qu'on ne rend pas tel qu'on l'a reçu n'est plus le fichier de
   personne — d'où la règle de ce lot, tenue par le magasin :

     · ce qui entre en OCTETS est stocké TEL QUEL (`import`) ;
     · ce qui entre en OBJET reçoit des octets canoniques (`save`).

   C'est ce qui rend « exporté, réimporté, byte-identique » vrai plutôt
   qu'approximativement vrai.

   ── LE REFUS EST DANS LE REVIVER, ET LA LISTE VIENT DU SCHÉMA ───────────
   Les clefs dangereuses sont refusées PENDANT `JSON.parse`, avant qu'un seul
   objet du document existe : une passe de nettoyage après coup arriverait
   après la pollution qu'elle prétend empêcher. Même geste qu'au bloc `layers`
   — mais la liste n'est pas recopiée ici : elle est LUE dans
   `$defs/safeKey.not.pattern` du schéma injecté. Une seule copie de la règle.

   ⚠️ Elle s'applique à TOUTE la profondeur du document, là où le schéma ne
   l'impose qu'aux valeurs d'override. C'est délibéré et c'est plus strict :
   une clef nommée `__proto__` n'a rien à faire dans un personnage, où qu'elle
   soit, et l'endroit où on peut l'arrêter sans coût est l'analyse. */

import { createHash } from "node:crypto";

import { canonicalText } from "./canonical.mjs";
import { DocError } from "./errors.mjs";

function fail(what) {
  throw new DocError(`fhpc/doc: ${what}`);
}

/** Octets → `Buffer`. Une chaîne est acceptée et devient ses octets UTF-8 ;
 *  un objet déjà analysé est REFUSÉ — il n'a pas d'octets, donc pas
 *  d'empreinte, et l'empreinte est ce sur quoi tout le reste s'appuie. */
export function asBytes(input, what = "les octets") {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input);
  if (typeof input === "string") return Buffer.from(input, "utf8");
  fail(`${what} : attendu des octets (Buffer, Uint8Array ou chaîne UTF-8), reçu ${
    input === null ? "null" : typeof input}. Un objet déjà analysé n'a pas d'octets, donc pas d'empreinte.`);
}

/** L'empreinte d'un document au repos : SHA-256 de SES octets. C'est elle qui
 *  sert de témoin de collision d'écriture — jamais un horodatage, qu'un
 *  système de fichiers arrondit et qu'une copie remet à zéro. */
export function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Les octets canoniques d'un document en mémoire.
 *
 *  ⚠️ LOT 67 — LE TEXTE EST SORTI D'ICI, dans `canonical.mjs`, et rien
 *  d'autre n'a changé. La raison est le navigateur : le builder doit
 *  exporter LE MÊME fichier (B9.4), et ce module-ci importe `node:crypto`
 *  pour `digest`, donc une page ne peut pas le charger. Sortir le texte
 *  plutôt que le recopier, c'est garder UNE écriture de la forme canonique
 *  — un export de builder qui divergerait ne serait relu par aucune suite. */
export function toBytes(document) {
  return Buffer.from(canonicalText(document), "utf8");
}

/**
 * Analyse des octets en refusant les clefs dangereuses.
 * @param {Buffer|Uint8Array|string} input les octets du document
 * @param {RegExp} forbiddenKey la forme des clefs refusées, LUE dans le schéma
 * @param {string} origin ce qu'on nomme dans le message d'erreur
 */
export function parseDocument(input, forbiddenKey, origin) {
  const bytes = asBytes(input, `${origin} : le document`);
  let document;
  try {
    document = JSON.parse(bytes.toString("utf8"), function (key, value) {
      if (key !== "" && forbiddenKey.test(key)) {
        fail(`${origin} : clef interdite « ${key} » — un personnage est de la DONNÉE, jamais du code, ` +
          "et jamais un vecteur de pollution de prototype ($defs/safeKey).");
      }
      return value;
    });
  } catch (error) {
    if (error instanceof DocError) throw error;
    fail(`${origin} : JSON illisible — ${error.message}. Un refus vaut mieux qu'un document à moitié lu.`);
  }
  if (document === null || typeof document !== "object" || Array.isArray(document)) {
    fail(`${origin} : la racine du document doit être un objet.`);
  }
  return { document, bytes, hash: digest(bytes) };
}
