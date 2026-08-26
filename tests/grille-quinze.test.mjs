/* ══ LE GARDE QUI TIENT LE 15 DU JS ET LA GRILLE DU CSS D'ACCORD ══════════

   CE QU'IL EXISTE POUR EMPÊCHER, ET C'EST MESURÉ : depuis le 26/08 le nombre
   d'items par page vit au socle (`LISTE_PAR_PAGE = 15`, `ui/builder/normes.mjs`)
   et `tests/listes.test.mjs` le garde bien — sa valeur ET l'absence de recopie
   en littéral. ⛔ MAIS IL VIT AUSSI, SOUS UNE AUTRE FORME, DANS `shell.css` :

     grid-template-columns: repeat(3, minmax(0, var(--fhpc-case-w)))
     grid-template-rows:    repeat(5, var(--fhpc-case-h))

   3 × 5 = 15. Le même nombre, écrit en deux endroits, dans deux langages, sans
   que rien ne les tienne d'accord.

   🔴 CE QUI SERAIT ARRIVÉ SANS CE GARDE : le jour où quelqu'un porte le socle
   à 12 (ou 18, ou 9), le JS sert douze objets dans une grille qui en réserve
   quinze — trois cases vides à jamais, et la page qui ne défile pas garde une
   hauteur de quinze. L'INVERSE est pire : un socle à 18 et une grille de 15
   perd trois objets par page, EN SILENCE, sans qu'aucune suite ne rougisse.
   ⭐ Aucun des deux ne casse ; les deux MENTENT. C'est exactement la famille
   « un total juste ne dit rien du contenu ».

   ⭐ ET C'EST LE MODÈLE DU DÉPÔT, une troisième fois : `tests/decor.test.mjs`
   tient les voiles, `tests/listes.test.mjs` tient le nombre, celui-ci tient
   l'ACCORD entre deux écritures d'un même nombre. Une norme qui vit à deux
   endroits a besoin d'un garde qui les regarde ENSEMBLE — les regarder
   séparément, c'est ce qu'on faisait, et ça ne voyait rien.

   ⚖️ CE QU'IL N'AFFIRME PAS : ni que la grille doit faire 3 colonnes, ni
   qu'elle doit faire 5 rangées. Il affirme que leur PRODUIT vaut le socle.
   ⛔ Trois colonnes est une décision d'Eric (« trois colonnes, toujours »,
   26/08) et elle vit dans NORMES §1 quater, pas ici : un garde qui la
   redoublerait ferait deux sources pour une règle.

   🔴 SA LIMITE, DITE PARCE QU'ELLE NE SE VOIT PAS : il lit la FEUILLE. Il
   prouve que les deux déclarations s'accordent ; il ne prouve pas qu'une
   troisième règle plus spécifique n'écrase pas la grille dans la page. Ça,
   c'est §0 « Google Headless », et c'est `tests/tambour-equipement.test.mjs`
   qui compte les `.grille-case` du nœud rendu. Deux regards, pas un. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";
import { LISTE_PAR_PAGE } from "../ui/builder/normes.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8"));

/** Le nombre de pistes qu'une déclaration `repeat(N, …)` réserve.
 *  ⛔ On lit la DÉCLARATION, pas le fichier entier : `repeat(` apparaît des
 *  dizaines de fois dans cette feuille, et compter au hasard donnerait un
 *  nombre juste sur le mauvais objet — la faute n°1 du siège. */
export function pistes(axe) {
  const bloc = CSS.match(new RegExp(`grid-template-${axe}\\s*:\\s*repeat\\(\\s*(\\d+)\\s*,[^;]*var\\(--fhpc-case-[wh]\\)`));
  return bloc ? Number(bloc[1]) : null;
}

test("1 — la grille du tambour est déclarée, et sur les DEUX axes", () => {
  assert.equal(typeof pistes("columns"), "number", "les colonnes de `--fhpc-case-w` doivent être déclarées");
  assert.equal(typeof pistes("rows"), "number", "les rangées de `--fhpc-case-h` doivent être déclarées");
});

test("2 — 🔴 colonnes × rangées === LISTE_PAR_PAGE — le même nombre, deux écritures", () => {
  const c = pistes("columns"), r = pistes("rows");
  assert.equal(c * r, LISTE_PAR_PAGE,
    `la grille réserve ${c} × ${r} = ${c * r} cases, le socle en sert ${LISTE_PAR_PAGE}. ` +
    "⛔ L'un des deux ment, et aucun ne casse : une grille trop grande laisse des cases vides " +
    "à jamais, une grille trop petite PERD des objets EN SILENCE. " +
    "Corriger LES DEUX — `LISTE_PAR_PAGE` dans `ui/builder/normes.mjs` et " +
    "`grid-template-columns/rows` dans `shell.css` — ou la norme (NORMES.md §5).");
});

test("3 — le témoin d'aujourd'hui : 3 colonnes × 5 rangées, et c'est une DÉCISION", () => {
  /* ⭐ Ce test ne défend pas le 3 : il DATE l'état, pour qu'un changement de
     forme se voie ici plutôt que de passer inaperçu. Eric a tranché « trois
     colonnes, toujours » le 26/08 (NORMES §1 quater), et les cinq rangées
     tiennent la hauteur d'une page pleine même quand la dernière est courte
     (`shell.css` : « une dernière page de deux objets doit occuper la même
     hauteur qu'une page pleine, sinon tout ce qui vit dessous remonte »). */
  assert.deepEqual([pistes("columns"), pistes("rows")], [3, 5],
    "si cette paire change, c'est une décision d'Eric — pas un effet de bord. " +
    "Mettre le nouveau couple ici ET dans NORMES §5, ou le test ment à son tour.");
});

/* ══ ⚔️ LES ATTAQUES — un garde qui n'a jamais été attaqué est une intention */

test("⚔️ ATTAQUE 1 — une grille trop PETITE (3 × 4 = 12) est nommée", () => {
  const c = 3, r = 4;
  assert.notEqual(c * r, LISTE_PAR_PAGE,
    "témoin : 12 ≠ 15, le garde doit rougir — trois objets perdus par page, en silence");
});

test("⚔️ ATTAQUE 2 — une grille trop GRANDE (3 × 6 = 18) est nommée aussi", () => {
  const c = 3, r = 6;
  assert.notEqual(c * r, LISTE_PAR_PAGE,
    "témoin : 18 ≠ 15 — trois cases vides à jamais, et une page plus haute que son contenu");
});

test("⚔️ ATTAQUE 3 — le lecteur ne compte PAS un `repeat(` au hasard", () => {
  /* La feuille porte des dizaines de `repeat(`. Un garde qui compterait le
     premier venu donnerait un nombre juste sur le mauvais objet — et c'est la
     faute n°1 du mandat : mesurer le bon objet. */
  const tousLesRepeat = (CSS.match(/repeat\(/g) || []).length;
  assert.ok(tousLesRepeat > 5, `témoin : la feuille porte ${tousLesRepeat} \`repeat(\` — le lecteur doit viser`);
  assert.equal(pistes("columns"), 3, "et il vise bien la grille du tambour, pas une voisine");
});
