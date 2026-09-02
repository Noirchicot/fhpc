/* ══ LES DIX CRANS DE LA CEINTURE — leur ORDRE et leur MOT ════════════════
   Sortis de `shell.mjs` au lot 129, et pour une raison mesurée : le texte
   vert de portage doit NOMMER l'étape où un effet se règle (*« → chosen at
   step 3, Inheritance »*), et l'écran Species n'avait aucun moyen de la lire.
   Recopier « 3 » et « Inheritance » en littéral dans `species-step.mjs`
   aurait donné deux voix pour un même ordre : réordonner la ceinture aurait
   laissé le texte vert mentir, sans un test rouge.

   ⛔ RIEN ICI N'EST LU PAR POSITION AILLEURS QUE DANS LA CEINTURE. Tout le
   pli travaille sur `id` (`STEPS[state.step].id === "skills"`, `findIndex(id
   === "review")`) ; seul l'enchaînement `state.step + 1` suit le tableau, et
   c'est exactement ce qui doit rester vrai. Réordonner cette liste réordonne
   le parcours, rien d'autre.

   📌 LES DEUX BOUTS NE SONT PAS DES ÉTAPES (voir `monterBelt`) : le premier et
   le dernier sortent de la ceinture et deviennent des onglets.

   ⭐ ET ILS N'ONT QU'UN SEUL NOM CHACUN — corrigé le 2026-08-19, quand Eric a
   dit ce qu'ils CONTIENNENT :

     Menu  — retour au menu · réglages d'interface et de connexions · le site
             Fate's Hand · les réglages du MJ
     Sheet — l'état d'avancement ET la vérification des fichiers, en même
             temps · les fonctions d'export · le mode expert · l'accès à la
             fiche interactive

   « Settings » était donc faux : c'est un MENU qui contient des réglages, pas
   des réglages. Et « Character » désigne le CHAPITRE du site, pas cet écran-ci
   — l'écran montre l'état d'un dossier, le chapitre explique un personnage.
   Deux noms pour un écran est un défaut ; deux noms pour deux choses n'en est
   pas un. */
export const STEPS = [
  { id: "universe",   label: "Menu" },       // ⟵ « Universe & Layers », puis « Settings »
  { id: "concept",    label: "Identity" },   // ⟵ « Biography » — Eric, 2026-08-18
  { id: "species",    label: "Species" },
  { id: "background", label: "Inheritance" }, // LOT 42, §3d — l'arrière-plan n'existe plus en Fate's Hand ; le libellé change seul
  { id: "destiny",    label: "Destiny" },
  { id: "class",      label: "Class" },
  { id: "abilities",  label: "Abilities" },
  { id: "skills",     label: "Skills" },
  { id: "equipment",  label: "Equipment" }, // LOT 49 — le paquet de la classe (une phrase, affichée telle quelle) + la bourse
  { id: "review",     label: "Sheet" }      // ⟵ « Review » — le CHAPITRE, lui, s'appelle Character
];

/** L'ÉTAPE D'UN ID, TELLE QUE LA CEINTURE LA MONTRE — `{ numero, mot }`, ou
 *  `null` si cet id n'est pas une étape.
 *
 *  🔴 LE NUMÉRO EST CELUI DE LA PASTILLE, ET IL SE LIT, IL NE SE RECOPIE PAS.
 *  `monterBelt` écrit `String(index)` sur chaque cran : le numéro d'une étape
 *  EST son index dans cette liste. Un écran qui écrirait « step 3 » en toutes
 *  lettres dirait la vérité aujourd'hui et mentirait le jour où l'ordre
 *  change — c'est la maladie des voix multiples, une fois de plus. */
export function etapeParId(id) {
  const index = STEPS.findIndex((step) => step.id === id);
  return index === -1 ? null : { numero: index, mot: STEPS[index].label };
}
