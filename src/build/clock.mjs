/* L'HORLOGE DU BLOC, ET LE SEUL ENDROIT QUI LA LIT.

   `resolved.derivation.at` est un horodatage : la dérivation a besoin de
   savoir QUAND elle a plié. C'est la seule dépendance non déterministe du
   bloc, et elle est INJECTABLE (`createBuild({now})`) exactement comme le
   hasard du bloc `play` : une suite qui ne peut pas figer l'horloge ne peut
   pas comparer deux documents.

   Ce fichier est le pendant de `src/play/utils.mjs` : il porte le défaut de
   plate-forme, et il est le SEUL fichier de `src/build/` que le garde
   structurel autorise à nommer `Date`. Partout ailleurs, l'horloge arrive par
   l'argument ou n'arrive pas. */

/** ISO 8601 UTC à la seconde près — la forme que `$defs/timestamp` accepte. */
export function platformNow() {
  return new Date().toISOString().replace(/\.[0-9]{3}Z$/, "Z");
}
