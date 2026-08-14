/* ══ LA FORME CANONIQUE D'UN PERSONNAGE, SANS `node:` ═════════════════════
   Lot 67.

   Ce fichier ne contient RIEN de neuf : c'est le corps de `toBytes`
   (`serialize.mjs`, lot 14), sorti pour une raison précise et une seule —
   **le navigateur en a besoin, et `serialize.mjs` importe `node:crypto`**
   (pour `digest`), donc il ne s'importe pas dans une page.

   ⛔ POURQUOI L'EXTRACTION PLUTÔT QU'UNE COPIE. Le bouton `Export JSON` du
   builder (B9.4) doit rendre **le fichier que le moteur écrirait** — même
   indentation, même saut de ligne final, même ordre de clefs. Recopier
   `JSON.stringify(document, null, 2)` dans `ui/` aurait fait DEUX écritures
   d'une même règle, et le jour où la forme canonique change, l'export du
   builder aurait divergé **en silence** : un fichier exporté n'est pas
   relu par une suite. Une seule fonction, deux appelants.

   ⚠️ Le `DocError` est conservé tel quel : c'est la même faute, elle doit
   porter le même nom des deux côtés. `errors.mjs` n'importe rien de `node:`
   — vérifié, et un garde de ce lot l'exige pour tout ce que la page tire du
   moteur. */

import { DocError } from "./errors.mjs";

/** Le texte canonique d'un document en mémoire : JSON indenté de deux
 *  espaces, terminé par un saut de ligne — la forme des fichiers du dépôt.
 *  L'ORDRE DES CLEFS N'EST PAS TRIÉ : il n'a aucune valeur sémantique en JSON,
 *  et le trier réécrirait silencieusement un fichier que quelqu'un a rangé à
 *  la main. */
export function canonicalText(document) {
  let text;
  try {
    text = JSON.stringify(document, null, 2);
  } catch (cause) {
    throw new DocError(`fhpc/doc: sérialisation impossible — ${cause.message}. ` +
      "Un document de personnage est du JSON pur : ni cycle, ni valeur que JSON ne sait pas écrire.");
  }
  if (text === undefined) {
    throw new DocError("fhpc/doc: sérialisation impossible : la valeur ne produit aucun JSON " +
      "(undefined, fonction ou symbole).");
  }
  return `${text}\n`;
}
