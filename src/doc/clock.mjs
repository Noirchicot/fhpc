/* L'HORLOGE DU BLOC, ET LE SEUL ENDROIT QUI LA LIT.

   `duplicate` horodate la copie : un document neuf qui prétend avoir été créé
   avant d'exister est un mensonge. C'est la seule dépendance non déterministe
   du bloc, et elle est INJECTABLE (`createDoc({now})`) exactement comme celle
   du bloc `build` : une suite qui ne peut pas figer l'horloge ne peut pas
   comparer deux documents.

   Ce fichier est le pendant de `src/build/clock.mjs` : il porte le défaut de
   plate-forme, et il est le SEUL fichier de `src/doc/` que le garde structurel
   autorise à nommer `Date`. Partout ailleurs, l'horloge arrive par l'argument
   ou n'arrive pas. */

/** ISO 8601 UTC à la seconde près — la forme que `$defs/timestamp` accepte. */
export function platformNow() {
  return new Date().toISOString().replace(/\.[0-9]{3}Z$/, "Z");
}
