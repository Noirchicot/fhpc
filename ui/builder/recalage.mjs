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

import { canonicalText } from "../../src/doc/canonical.mjs?v=941";
import { ceQuiFaitLePersonnage } from "./universe-step.mjs?v=941";
import { LIVRES_DU_JOUEUR } from "./interrupteurs.mjs?v=941";
/* 📚 LOT 390 — UN LIVRE DU JOUEUR, C'EST LE PHB, LE DMG, OU UN CATALOG DE CRÉATEUR, dont l'app ne connaît pas
   l'id d'avance. Sans son fichier sous la main, un catalog se sépare d'une couche RETIRÉE du produit par la
   table des noms réservés de l'app (`estUnNomDeLApp`, le juge du catalog) : aucune couche de l'app n'en sort,
   aucun catalog n'y entre. */
import { estUnNomDeLApp } from "../../src/catalog/juge.mjs?v=941";
const estUnLivreDuJoueur = (id) => LIVRES_DU_JOUEUR.some((l) => l.id === id) || !estUnNomDeLApp(id);

/** 📚 LOT 393 — UN INTERRUPTEUR DE LAYERS NE TOUCHE QUE SON LIVRE. 📏 Vu au banc du lot 390 : un perso déclare le
 *  PHB sur un appareil qui ne l'a pas (« not on this device ») ; on allume UN AUTRE livre (Emberwood) — le geste
 *  vide `build.layers`, `rebuild` adopte la pile MONTÉE, et le PHB, qui n'y est pas, disparaît du perso sans qu'on
 *  y ait touché. Une perte de donnée silencieuse, que la Bible interdit déjà (`socle-perso-sauve-s-ouvre-toujours` :
 *  *« un livre du joueur absent de cet appareil ne se recale pas »*, §C34).
 *  ⭐ LA RÉPARATION, PURE : après le geste, on REPOSE chaque livre du joueur que le document déclarait AVANT et que
 *  l'appareil n'a PAS (absent de toute la pile montée, éteintes comprises), à sa place — juste après ce qui le
 *  précédait et qui est encore déclaré. Un livre MONTÉ qu'on éteint, lui, part : c'est le geste.
 *  @param {Array} declaree  `build.layers` APRÈS le geste (la pile montée, adoptée ou déclarée)
 *  @param {Array} avant     `build.layers` AVANT le geste
 *  @param {Array} montee    le manifeste de toute la pile montée (`layers.verbs.stack()`)
 *  @returns {Array} `declaree`, avec les livres absents reposés — le même tableau s'il n'y en a aucun */
export function garderLesLivresAbsents(declaree, avant, montee) {
  const ici = new Set((Array.isArray(montee) ? montee : []).map((c) => c && c.id));
  const avantListe = Array.isArray(avant) ? avant : [];
  const absents = avantListe.filter((c) => c && estUnLivreDuJoueur(c.id) && !ici.has(c.id));
  if (absents.length === 0) return declaree;
  const out = (Array.isArray(declaree) ? declaree : []).map((c) => ({ ...c }));
  for (const livre of absents) {
    if (out.some((c) => c.id === livre.id)) continue;
    let place = 0;
    for (let j = avantListe.indexOf(livre) - 1; j >= 0; j -= 1) {
      const k = out.findIndex((c) => c.id === avantListe[j].id);
      if (k >= 0) { place = k + 1; break; }
    }
    out.splice(place, 0, { ...livre });
  }
  return out;
}

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
  if (decl.some((c) => estUnLivreDuJoueur(c.id) && !parId.has(c.id))) return null;
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
