/* ══ LA PAGE — lot 25 ═════════════════════════════════════════════════

   Assemble la coquille et le rendu, et écrit la page sur la SORTIE STANDARD.
   Rien n'est posé dans le dépôt : un outil d'affichage qui salit l'arbre
   ferait rougir `tests/tree-immuable.test.mjs` pour avoir simplement REGARDÉ.

     node src/tools/fiche.mjs > /tmp/fiche.html && open /tmp/fiche.html

   Sans argument, il monte l'exemple Fate's Hand anglais et affiche la fiche
   AVEC son rapport de dérivation — le seul moment où ce rapport existe.
   Avec un chemin de fichier, il affiche ce document-là, et la page DIT que le
   rapport manque : c'est le trou n°1 de l'inventaire, rendu visible à l'œil
   plutôt qu'écrit dans un coin.

     node src/tools/fiche.mjs examples/personnage-srd-fr-niveau1.fh-char.json
*/

import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { render } from "./render-fiche.mjs";
import { exempleFhEn } from "./exemple-fh-en.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MARQUEUR = "<!--FICHE-->";

/** La coquille, avec le fragment à la place du marqueur. */
export function page(fragment) {
  const coquille = readFileSync(join(ROOT, "src/tools/fiche.shell.html"), "utf8");
  if (!coquille.includes(MARQUEUR)) {
    throw new Error(`fiche : la coquille ne porte plus le marqueur « ${MARQUEUR} » — rien n'y serait injecté.`);
  }
  return coquille.replace(MARQUEUR, fragment);
}

const cible = process.argv[2];
if (cible === undefined) {
  const { document, report } = exempleFhEn();
  process.stdout.write(page(render(document, report)));
} else {
  /* AUCUN RAPPORT ICI, ET C'EST LE FAIT : un document lu sur le disque n'en
     porte pas. On ne va pas le reconstruire pour en fabriquer un — ce serait
     masquer précisément ce que ce lot doit montrer. */
  process.stdout.write(page(render(JSON.parse(readFileSync(resolve(cible), "utf8")))));
}
