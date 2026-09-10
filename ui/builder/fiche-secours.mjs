/* ══ LA FICHE DE SECOURS — le blurb de Fate's Hand, « pour le moment » ═══════
   ⚖️ Eric, 2026-09-09, devant les fiches NUES de la pile SRD : *« Species,
   prends l'image Fate's Hand, le même texte de blurb. Pour le moment. »* et
   *« Class idem Species. »*

   📍 C'EST UN REPLI DÉCLARÉ, PAS UNE ARCHITECTURE. « Pour le moment » : le
   jour où une couche neutre (un blurb SRD, ou un texte écrit pour la pile
   SRD) existe, elle remplace CE fichier — et rien d'autre ne change, parce
   que les deux écrans ne lui demandent qu'une chose : `blurbDeSecours`.

   📏 CE QUE LA PILE SRD NE PORTE PAS, MESURÉ LE 09/09 : `data.blurb` vient de
   la couche `fh-fiche-en` (un `patch` par espèce et par classe, 24 records),
   éteinte en pile SRD. Sans elle, `species-step` et `class-step` servaient le
   corps d'avant le lot 77 — des lignes, pas de fiche, pas de pied, donc **pas
   de `Choose`** (mesuré au lot 187). L'IMAGE, elle, ne manquait pas : elle vit
   dans `assets/fiches/<slug>.webp`, par slug, sans couche — elle n'était
   simplement jamais demandée par ce corps-là.

   ⛔ ON NE MONTE PAS LA COUCHE. `fh-fiche-en` ne lève aucun drapeau (mesuré :
   `flags: []`), mais elle est une couche Fate's Hand (`FH_LAYER_IDS`), et la
   monter en pile SRD serait rallumer FH par la porte de derrière : le garde
   « un personnage SRD pur traverse l'écran sans qu'une ligne de FH
   apparaisse » doit rester vrai. Ce fichier lit les OCTETS du fichier de
   couche — que `engine.mjs` charge déjà pour l'enregistrer — et applique le
   patch d'UN record avec `applyPatch`, l'organe même du pli
   (`src/layers/stack.mjs`). ⭐ Une seule lecture du format de couche au dépôt,
   pas une seconde écrite ici : si le pli lit autrement demain, ce fichier lit
   autrement le même jour.

   ⚠️ IL NE REND QUE LE BLURB. Le patch porte aussi `fiche_stats`,
   `fiche_traits`, `fiche_infos` — et `fiche_traits` de l'Elfe dit « Splinter
   of Anon : +2 Destiny Base », un trait Fate's Hand. Eric a demandé l'image et
   le blurb ; le reste de la fiche SRD vient du record SRD.

   ⛔ LE CHARGEMENT NE JETTE JAMAIS, ET IL NE SE TAIT PAS NON PLUS : un fichier
   absent ou illisible laisse la fiche sans prose (le pied `Choose` y est
   quand même), et `etatDeLaFicheDeSecours()` porte la raison. */

import { readLayer, applyPatch } from "../../src/layers/index.mjs?v=620";
import { versionQuery } from "./version.mjs?v=620";

/* Le fichier, nommé UNE fois. C'est le seul nom de couche que `ui/` porte en
   dehors d'`engine.mjs` et d'`universe-step.mjs`, et il est là parce que le
   repli est nommé — le jour où il part, ce nom part avec lui. */
const FICHIER = "fh-fiche-en.layer.json";

let couche = null;   // le document de couche lu, ou null
let refus = null;    // la raison pour laquelle il ne l'est pas

/** Retient les OCTETS du fichier de fiche — même entrée que `register`
 *  (Buffer, Uint8Array ou chaîne). Rend l'id de la couche lue. */
export function retenirLaFicheDeSecours(bytes) {
  const { document } = readLayer(bytes, FICHIER);
  couche = document;
  refus = null;
  return document.id;
}

/** Oublie la fiche retenue — pour les bancs et les tests, qui doivent pouvoir
 *  mesurer l'écran SANS repli. */
export function oublierLaFicheDeSecours() {
  couche = null;
  refus = null;
}

/** Charge le fichier depuis le site (même chemin et même version que les
 *  couches d'`engine.mjs`). Ne jette jamais : un échec se lit dans
 *  `etatDeLaFicheDeSecours()`. */
export async function chargerLaFicheDeSecours({ root = "../.." } = {}) {
  try {
    const reponse = await fetch(`${root}/layers/${FICHIER}${versionQuery(import.meta.url)}`);
    if (!reponse || !reponse.ok) {
      refus = `${FICHIER} : HTTP ${reponse ? reponse.status : "sans réponse"}`;
      return null;
    }
    return retenirLaFicheDeSecours(new Uint8Array(await reponse.arrayBuffer()));
  } catch (error) {
    refus = `${FICHIER} : ${error && error.message ? error.message : String(error)}`;
    return null;
  }
}

export function etatDeLaFicheDeSecours() {
  return { retenue: couche !== null, refus };
}

/** LE BLURB QUE FATE'S HAND DONNERAIT À CE RECORD — ou `null`.
 *  `kind` est le genre (« species », « class ») ; `view` est la vue que
 *  `query` rend (`{ id, record }`). Le patch s'applique sur une COPIE du
 *  record (`applyPatch` clone), la vue montée ne bouge pas.
 *  ⛔ `null` sans fiche retenue, sans entrée pour ce record, ou si le patch
 *  ne s'applique pas à ce record-là (un chemin qui vise un champ que la pile
 *  SRD n'a pas) : la fiche reste sans prose plutôt que de jeter. */
export function blurbDeSecours(kind, view) {
  if (!couche || !view || !view.record || typeof view.id !== "string") return null;
  const genre = couche.records && couche.records[kind];
  const entree = genre && genre[view.id];
  if (!entree || entree.op !== "patch") return null;
  let record;
  try {
    record = applyPatch(view.record, entree, FICHIER).record;
  } catch (_) {
    return null;
  }
  const blurb = record && record.data ? record.data.blurb : null;
  if (typeof blurb === "string") return blurb.length > 0 ? blurb : null;
  return blurb && typeof blurb.text === "string" && blurb.text.length > 0 ? blurb.text : null;
}
