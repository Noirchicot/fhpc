/* ══ OÙ VIT LE VOISIN `fh-srd` — UNE ENTRÉE DÉCLARÉE, PAS UN CHEMIN DEVINÉ ══
   Lot 241 — 2026-09-21.

   🔴 CE QUE CE FICHIER RÉPARE. Deux générateurs portaient, chacun de son côté,
   la MÊME ligne :

     export const SRD_ROOT  = join(homedir(), "tools", "fh-srd", "exports");
     export const SRFH_ROOT = join(homedir(), "tools", "fh-srd", "exports");

   Un chemin deviné sur l'arborescence d'UNE machine. Chez Eric, `~/tools/`
   porte `fhpc` et `fh-srd` côte à côte, donc ça marchait — et c'est
   exactement pour ça que personne ne l'a su. Sur la machine vierge, la suite
   était ROUGE DÈS SON PREMIER TOUR : `gen-srd-layer.test.mjs` jetait avant
   d'avoir posé une seule question, et `tree-immuable` refusait ensuite de
   conclure quoi que ce soit d'une suite rouge. Deux échecs, une cause, et
   aucun des deux ne parlait du vrai sujet.

   ⭐ LE DÉFAUT N'ÉTAIT PAS DANS LE TEST, IL ÉTAIT DANS LE GÉNÉRATEUR. Le test
   ne faisait que constater. Déplacer le constat (un `skip`, une exception
   pour la machine vierge) aurait éteint le témoin en laissant le défaut :
   le générateur serait resté inexécutable ailleurs que chez son auteur.

   ── POURQUOI UN FICHIER À PART, ET PAS LA CONSTANTE D'UN DES DEUX ────────
   ⛔ Faire importer `SRD_ROOT` à `gen-srfh-layer` depuis `gen-srd-layer` aurait
   été le geste court et le mauvais : `gen-srd-layer` LIT LE DISQUE AU
   CHARGEMENT DU MODULE (`export const GENRES = deriveGenres(lireInventaire())`),
   donc l'importer pour un chemin ferait jeter `gen-srfh-layer` à l'import quand
   le voisin manque — une panne neuve, offerte par la réparation.
   ➡️ Ce module-ci ne fait RIEN : il déclare. Aucun accès disque, aucun effet.

   ⚖️ ET UNE SEULE VARIABLE POUR LES DEUX, C'EST LA CONDITION. Si l'entrée
   n'avait été câblée que sur `gen-srd-layer`, la pointer aurait déplacé UN
   générateur et pas l'autre : les deux auraient lu DEUX voisins différents
   sans le dire. La règle du corpus est de supprimer le second écrivain, pas
   d'en synchroniser deux.

   ── LE NOM DIT CE QU'IL VAUT ────────────────────────────────────────────
   ⚠️ La valeur est le répertoire `exports/`, PAS la racine du dépôt fh-srd.
   D'où `FH_SRD_EXPORTS` et non `FH_SRD_ROOT` : une variable nommée « ROOT »
   qu'on pointe sur la racine du dépôt — ce que son nom demande — échouerait
   sur un `MANIFEST.json illisible`, et la faute viendrait du nom.
*/
import { join } from "node:path";
import { homedir } from "node:os";

/** Le nom de l'entrée, écrit UNE fois : les messages d'échec le citent depuis
 *  ici plutôt que de le recopier. Une variable dont le message d'erreur
 *  écorche le nom ne se pointe jamais. */
export const VARIABLE = "FH_SRD_EXPORTS";

/** ⛔ LE DÉFAUT NE BOUGE PAS, ET C'EST LA CONDITION DU LOT. Sans la variable,
 *  le chemin résolu est au octet près celui d'avant — rien ne change sur le
 *  Mac d'Eric, ni pour un worktree, ni pour un script déjà écrit. */
export const DEFAUT = join(homedir(), "tools", "fh-srd", "exports");

/* ⚠️ UNE VARIABLE VIDE COMPTE COMME ABSENTE, et c'est dit plutôt que subi :
   `FH_SRD_EXPORTS=` dans un script est une main qui a glissé, pas une
   intention de lire la racine du système de fichiers. On retombe donc sur le
   défaut — le même silence que « pas de variable du tout », qui est le
   comportement exigé. */
const declare = (process.env[VARIABLE] ?? "").trim();

/** Le répertoire `exports/` du voisin `fh-srd`, déclaré ou par défaut. */
export const SRD_EXPORTS = declare || DEFAUT;

/** Le geste à faire quand le voisin manque.
 *
 *  ⭐ UN MESSAGE D'ÉCHEC QUI NOMME LE GESTE CORRECT EST LA MEILLEURE
 *  DOCUMENTATION D'UN DÉPÔT, PARCE QU'ELLE EST EXÉCUTÉE. L'ancien message
 *  disait « fh-srd est une dépendance FERME » — vrai, et inutile : il ne
 *  disait ni où mettre le dépôt, ni comment l'y pointer, ni qu'il est public.
 *  Celui-ci dit les trois, et il dit aussi où la valeur courante a été prise :
 *  « le défaut » et « la variable » ne se réparent pas du même geste. */
export function ouTrouverLeVoisin(root = SRD_EXPORTS) {
  const origine = declare
    ? `${VARIABLE}=${declare}`
    : `le défaut (${VARIABLE} n'est pas posée)`;
  return (
    `Cherché sous ${root}, d'après ${origine}. ` +
    `fh-srd est une dépendance FERME de ce générateur, pas un intrant optionnel. ` +
    `Le dépôt est PUBLIC : git clone --depth 1 https://github.com/Noirchicot/fh-srd ` +
    `puis ${VARIABLE}=<ce-clone>/exports — la variable veut le répertoire ` +
    `« exports », pas la racine du dépôt.`
  );
}
