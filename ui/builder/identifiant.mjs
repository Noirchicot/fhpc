/* ══ L'IDENTIFIANT D'UN PERSONNAGE NÉ DANS LE NAVIGATEUR — LOT 367 ══════════════
   ⚖️ Décision d'ARCHI 35, 30/09 (mandat 367, point 4) : `crypto.randomUUID` n'existe qu'en
   contexte SÉCURISÉ (https, ou localhost). Une page servie en `http://` par l'IP du Mac — un
   iPad sur le réseau local — n'en a pas, et la première visite échouait (lot 366). Ce module
   tire l'UUID v4 de `crypto.getRandomValues`, disponible dans tout navigateur, sécurisé ou
   non. ⭐ CE N'EST PAS UN REPLI DÉGRADÉ : c'est LE MÊME hasard (le générateur cryptographique
   de la plate-forme), mis en forme par RFC 9562 §5.4 — la version (4) et la variante (10xx)
   posées sur 122 bits tirés.
   ⛔ Aucun repli sur `Math.random` : sans générateur cryptographique, le refus est NOMMÉ
   (même loi que `platformRandomUint32`, src/play/utils.mjs).
   Deux fonctions, pour qu'un garde lise la forme sans hasard : `uuidV4DesOctets` est PURE,
   `uuidDuNavigateur` est le SEUL lecteur de `crypto` du builder. */

/** Un UUID v4 à partir de 16 octets tirés. PURE : les mêmes octets donnent le même texte.
 *  @param {Uint8Array} octets  16 octets aléatoires */
export function uuidV4DesOctets(octets) {
  if (!octets || octets.length !== 16) {
    throw new Error("fhpc/identifiant: an UUID v4 is made of exactly 16 random bytes");
  }
  const b = Uint8Array.from(octets);
  b[6] = (b[6] & 0x0f) | 0x40;   // version 4
  b[8] = (b[8] & 0x3f) | 0x80;   // variante RFC (10xx)
  const hex = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** L'identifiant d'un document neuf, tiré du générateur cryptographique de la plate-forme.
 *  @param {{getRandomValues: Function}} [source]  `globalThis.crypto` par défaut (injectable) */
export function uuidDuNavigateur(source = globalThis.crypto) {
  if (!source || typeof source.getRandomValues !== "function") {
    throw new Error("fhpc/identifiant: no CSPRNG available (crypto.getRandomValues) — a character id is never guessed");
  }
  return uuidV4DesOctets(source.getRandomValues(new Uint8Array(16)));
}
