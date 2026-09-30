/* ══ ⚖️ LOT 367 — LE RECALAGE : UN PERSO SAUVÉ S'OUVRE TOUJOURS, MÊME APRÈS UNE MISE À JOUR ══
   Eric, 30/09, les trois réponses, chacune avec sa question (relayées par ARCHI 35) :
   · « Comment le perso s'ouvre-t-il ? » → **« Tout seul, et sauvé aussitôt »** ;
   · « Prévenir le joueur ? » → **une ligne au Menu** (`MOT_DES_REGLES_MISES_A_JOUR`,
     universe-step.mjs), fondée sur une MARQUE posée par le recalage, vivante jusqu'au premier
     geste du joueur ;
   · les deux mots qui restaient muets → voir `ecran-mort.mjs`.
   Ce module porte les trois organes PURS du recalage : la pile à adopter
   (`recalageDeLaPile`), la marque (`marqueDuRecalage`), et sa vie (`marqueVivante`). La
   coquille les câble à l'ouverture (démarrage, fichier ouvert) ; `memoire.mjs` garde la
   marque sous sa clef. */

import { canonicalText } from "../../src/doc/canonical.mjs?v=924";
import { ceQuiFaitLePersonnage } from "./universe-step.mjs?v=924";
import { LIVRES_DU_JOUEUR } from "./interrupteurs.mjs?v=924";

/** ⚖️ LOT 367 — LE RECALAGE : UN PERSONNAGE SAUVÉ AVANT UNE MISE À JOUR DES RÈGLES S'OUVRE
 *  SUR LES COUCHES D'AUJOURD'HUI. Eric, 30/09, à « comment le perso s'ouvre-t-il ? » →
 *  **« Tout seul, et sauvé aussitôt »**.
 *  📏 LA CHAÎNE (mesurée sur l'Ilyra de v914, ouverte à v917) : chaque couche déclarée porte
 *  l'empreinte de ses octets (`$defs/layerRef`). Un lot qui édite une couche change son hash
 *  (la version, elle, reste `0.1.0`), et `rebuild` JETTE : « la couche a changé sous le
 *  personnage » (contracts/build.md, invariant 4 — il a raison, c'est à l'appelant de
 *  décider). La coquille avalait ce refus, et l'écran mort disait « it cannot be derived yet ».
 *  ⭐ CE QUI EST RENDU : la pile MONTÉE (celle que `rebuild` exige), et les ids de ce qui a
 *  changé — une couche dont l'empreinte a bougé, une qui a disparu, une qui est apparue.
 *  `null` quand rien n'a bougé : un document à jour ne se recale pas.
 *  ⛔ PUR, ET IL N'EFFACE RIEN : les choix restent, et ce qui ne se résout plus sur les couches
 *  d'aujourd'hui se NOMME sur son étape (`choice.ref-missing`, organes des lots 191 et 359).
 *  ⚠️ APRÈS `gestesDAlignement` : le document dit d'abord quels livres il veut allumés ;
 *  seule l'empreinte de ce qui est allumé se recale.
 *  ⛔ UN LIVRE DU JOUEUR ABSENT DE CET APPAREIL NE SE RECALE PAS : ce n'est pas une mise à jour
 *  des règles, c'est la question ouverte `A-TRANCHER §C34` (le mot est à Eric). Recaler
 *  effacerait sa déclaration de la copie du navigateur, aussitôt réécrite : `null`, et le refus
 *  du moteur se dit comme avant.
 *  @param {Array<{id:string, version:string, hash:string}>} declarees `build.layers`
 *  @param {Array<{id:string, version:string, hash:string}>} montees   la pile montée (`manifesteDeLaPile`)
 *  @returns {{layers: object[], changees: string[]}|null} */
export function recalageDeLaPile(declarees, montees) {
  const decl = Array.isArray(declarees) ? declarees : [];
  const mont = Array.isArray(montees) ? montees : [];
  if (decl.length === 0 || mont.length === 0) return null;   // `rebuild` adopte seul une pile vide
  const cle = (c) => `${c.id}@${c.version}#${c.hash}`;
  if (decl.map(cle).join("|") === mont.map(cle).join("|")) return null;
  const parId = new Map(mont.map((c) => [c.id, c]));
  const livres = new Set(LIVRES_DU_JOUEUR.map((l) => l.id));
  if (decl.some((c) => livres.has(c.id) && !parId.has(c.id))) return null;
  const declares = new Set(decl.map((c) => c.id));
  const changees = [
    ...decl.filter((c) => !parId.has(c.id) || cle(parId.get(c.id)) !== cle(c)).map((c) => c.id),
    ...mont.filter((c) => !declares.has(c.id)).map((c) => c.id)
  ];
  return { layers: mont.map((c) => ({ ...c })), changees };
}

/** LE REPÈRE — ce qui fait le personnage (`ceQuiFaitLePersonnage` : sans `modified` ni
 *  `resolved`, que chaque démarrage réestampille), en texte canonique. Un geste du joueur le
 *  change ; recharger la page, non. */
function repereDe(document) {
  return canonicalText(ceQuiFaitLePersonnage(document));
}

/** LA MARQUE, posée après le recalage ET la dérivation qui le suit : ce qui a changé, quand,
 *  et le personnage tel qu'il était alors.
 *  @param {{couches:string[], at:string, document:object}} */
export function marqueDuRecalage({ couches, at, document }) {
  return { couches: [...couches], at, repere: repereDe(document) };
}

/** LA MARQUE VIT-ELLE ENCORE ? — jusqu'au premier geste du joueur, et pas au-delà. ⭐ Lu dans
 *  la DONNÉE : un geste (un choix, un nom, un livre allumé…) fait diverger le personnage de son
 *  repère. ⛔ Pas une liste des gestes qui comptent : celui qu'on ajoutera demain compte seul.
 *  @returns {boolean} */
export function marqueVivante(marque, document) {
  return Boolean(marque && document && typeof marque.repere === "string" && marque.repere === repereDe(document));
}
