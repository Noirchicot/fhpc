/* ══ LES CRANS DE LA CEINTURE — leur ORDRE, leur MOT, ET CE QU'ILS EXIGENT ══
   Sortis de `shell.mjs` au lot 129, et pour une raison mesurée : le texte
   vert de portage doit NOMMER l'étape où un effet se règle (*« → chosen at
   step 3, Inheritance »*), et l'écran Species n'avait aucun moyen de la lire.
   Recopier « 3 » et « Inheritance » en littéral dans `species-step.mjs`
   aurait donné deux voix pour un même ordre : réordonner la ceinture aurait
   laissé le texte vert mentir, sans un test rouge.

   ⛔ RIEN ICI N'EST LU PAR POSITION AILLEURS QUE DANS LA CEINTURE. Tout le
   pli travaille sur `id` (`STEPS[state.step].id === "skills"`, `findIndex(id
   === "review")`) ; seul l'enchaînement d'étape suit le tableau, et c'est
   exactement ce qui doit rester vrai. Réordonner cette liste réordonne le
   parcours, rien d'autre.

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
   pas un.

   ══ 🔴 LOT 186 — LA CEINTURE EST VERSATILE, ET ELLE NE LIT PAS LE NOM DE LA
      PILE ══════════════════════════════════════════════════════════════════

   ⚖️ Eric, 2026-09-09, trois phrases dans cet ordre :
     *« en pile SRD, que fait le cran Destiny ? »* → **absent, neuf crans**
     *« si j'allume Destiny dans les couches, il réapparaît ? »* → **oui**
     *« ou il faut que tu réécrives le belt pour qu'il soit versatile SRD /
       FH »* → **c'est ce fichier**.

   ⛔ LE PIÈGE QUE LA TROISIÈME PHRASE FERME. Le premier jet disait : « lis
   `currentStack(doc)` ; neuf crans si `"srd"`, dix si `"srdfh"` ». C'est FAUX,
   et la deuxième question le prouve toute seule — allumer la seule couche des
   arcanes donne une pile qui n'est NI l'une NI l'autre : `currentStack` rend
   alors `null` (il compare la pile déclarée aux deux piles NOMMÉES, par
   égalité exacte de l'ensemble), un aiguillage à deux branches ne saurait pas
   quoi faire, et le joueur tomberait dans l'écran mort. 📏 Mesuré le 09/09 sur
   les couches du dépôt : SRD seul lève `[]`, SRD + `fh-arcana-en` lève
   `["fh.destiny"]`, la pile complète en lève huit.

   ⭐ LA FORME JUSTE : **chaque cran DÉCLARE ce dont il a besoin, et la ceinture
   montre ceux dont le besoin est satisfait.** Elle ne connaît aucune pile par
   son nom. Ça vaut pour SRD seul, pour Fate's Hand entier, pour « SRD +
   Destiny », et pour les moteurs qui n'existent pas encore — un `if (stack ===
   "srd")` n'aurait couvert aucun des trois derniers.

   LES DEUX DÉCLARATIONS, ET RIEN D'AUTRE :
   · `exige: "<drapeau>"` — sans lui, le cran N'EXISTE PAS dans la ceinture.
   · `motSi: [{ drapeau, mot }]` — le libellé change seul quand le drapeau est
     levé. C'est le commentaire « LOT 42 §3d » rendu DÉCLARATIF : il disait
     déjà que le mot changeait, mais rien dans le code ne savait quand.

   📌 D'OÙ VIENNENT LES DRAPEAUX : de la pile MONTÉE (`layers.verbs.flags()`),
   jamais du document. Une couche les déclare dans son `flags` ; le pli les
   réunit (`src/layers/stack.mjs`). ⛔ Ce fichier n'en va chercher aucun : il
   les REÇOIT, sinon il faudrait qu'il connaisse le bloc `layers`, et la
   ceinture deviendrait intestable. */

export const STEPS = [
  { id: "universe",   label: "Menu" },       // ⟵ « Universe & Layers », puis « Settings »
  { id: "concept",    label: "Identity" },   // ⟵ « Biography » — Eric, 2026-08-18
  { id: "species",    label: "Species" },
  /* LOT 42 §3d, rendu déclaratif au lot 186 — l'arrière-plan du SRD existe
     tant que Fate's Hand ne l'a pas remplacé ; c'est la couche
     `fh-inheritance-en` qui opère le remplacement, et c'est donc son drapeau
     qui change le mot. ⛔ Le libellé de repli n'est pas une invention : c'est
     le nom SRD du chapitre, celui qu'`equipment-step.mjs` cite déjà (« les
     quatre arrière-plans du SRD »). */
  { id: "background", label: "Background", motSi: [{ drapeau: "fh.inheritance", mot: "Inheritance" }] },
  /* 🔴 LE SEUL CRAN CONDITIONNEL AUJOURD'HUI — Eric, 09/09 : « absent, neuf
     crans ». Les arcanes majeures n'existent que dans Fate's Hand ; sans
     elles, l'écran tirerait dans un paquet vide (mesuré : `drawArcana([])`
     rend `null`, et le bouton `Draw` ne fait rien, en silence). */
  { id: "destiny",    label: "Destiny", exige: "fh.destiny" },
  { id: "class",      label: "Class" },
  { id: "abilities",  label: "Abilities" },
  { id: "skills",     label: "Skills" },
  { id: "equipment",  label: "Equipment" }, // LOT 49 — le paquet de la classe (une phrase, affichée telle quelle) + la bourse
  { id: "review",     label: "Sheet" }      // ⟵ « Review » — le CHAPITRE, lui, s'appelle Character
];

/** LA CEINTURE TELLE QU'ON LA VOIT — les crans que les drapeaux MONTÉS
 *  justifient, dans l'ordre, mot déjà résolu.
 *
 *  Chaque cran rend `{ id, mot, numero, rang }` :
 *  · `numero` — LA PASTILLE, c'est-à-dire la place dans la ceinture VISIBLE.
 *    C'est le nombre que le joueur lit et que le texte vert cite (« step 3 »).
 *  · `rang`   — la place dans `STEPS`, celle que `state.step` emploie.
 *
 *  🔴 LES DEUX NE SE CONFONDENT QU'EN PILE COMPLÈTE, et c'est tout l'intérêt
 *  de les nommer séparément : ceinture courte, `Class` a le `rang` 5 et le
 *  `numero` 4. Un seul nombre pour les deux, et la moitié du pli lirait
 *  l'autre sens sans qu'aucun test ne puisse le voir.
 *
 *  @param {string[]} drapeaux les drapeaux levés par la pile montée
 */
export function ceinture(drapeaux) {
  const leves = new Set(Array.isArray(drapeaux) ? drapeaux : []);
  const crans = [];
  STEPS.forEach((step, rang) => {
    if (step.exige && !leves.has(step.exige)) return;
    const variante = (step.motSi || []).find((v) => leves.has(v.drapeau));
    crans.push({ id: step.id, mot: variante ? variante.mot : step.label, numero: crans.length, rang });
  });
  return crans;
}

/** ⚖️ LA DÉCISION D'INDEX DU LOT 186, ET C'EST ELLE QU'ON RELIRA DANS SIX MOIS.
 *
 *  **L'index qui peint l'état est celui de `STEPS`, jamais celui de la
 *  ceinture visible.** Cette fonction rend donc TOUJOURS `STEPS.length`
 *  entrées : le cran à cette place, ou `null` s'il n'est pas monté.
 *
 *  🔴 POURQUOI, ET C'EST MESURÉ, PAS PRÉFÉRÉ :
 *  ⑴ `monterBelt` construit ses items UNE FOIS, au chargement du module —
 *     donc AVANT que le moteur ait monté la moindre couche. À cet instant il
 *     n'existe aucun drapeau : une ceinture bâtie sur les crans visibles
 *     serait bâtie sur zéro drapeau, puis à refaire à chaque changement de
 *     pile.
 *  ⑵ `paintBelt` écrit `data-status` PAR INDEX. Un tableau qui rétrécit
 *     décale tout ce qui suit le trou, et l'échec est SILENCIEUX : un cran
 *     peindrait l'état d'un autre, sans erreur, sans page blanche. C'est
 *     l'avertissement que `monterBelt` porte depuis le 2026-08-19 (« les
 *     sortir du tableau les priverait de l'état courant »).
 *  ⑶ Tout le reste de la coquille indexe `STEPS` — `state.step`,
 *     `state.stepSecond`, `REVIEW_INDEX`, les quarante `STEPS[state.step]`.
 *     Un second système de numérotation aurait dérivé du premier.
 *
 *  ⭐ CE QUE ÇA COÛTE, ET C'EST LE PRIX JUSTE : le numéro de la pastille n'est
 *  plus l'index de l'item. Il se LIT sur le cran (`cran.numero`) et s'écrit à
 *  la peinture, pas au montage. Un cran non monté est CACHÉ, jamais retiré.
 *
 *  @param {string[]} drapeaux les drapeaux levés par la pile montée
 *  @returns {Array<{id:string,mot:string,numero:number,rang:number}|null>}
 */
export function cransAlignes(drapeaux) {
  const parRang = new Map(ceinture(drapeaux).map((cran) => [cran.rang, cran]));
  return STEPS.map((step, rang) => parRang.get(rang) || null);
}

/** L'ÉTAPE D'UN ID, TELLE QUE LA CEINTURE LA MONTRE — `{ numero, mot }`, ou
 *  `null` si cet id n'est pas un cran de la ceinture COURANTE.
 *
 *  🔴 LE NUMÉRO EST CELUI DE LA PASTILLE, ET IL SE LIT, IL NE SE RECOPIE PAS.
 *  `paintBelt` écrit `String(cran.numero)` sur chaque cran : le numéro d'une
 *  étape EST sa place dans la ceinture visible. Un écran qui écrirait « step
 *  3 » en toutes lettres dirait la vérité aujourd'hui et mentirait le jour où
 *  l'ordre change — c'est la maladie des voix multiples, une fois de plus.
 *
 *  ⛔ ET IL FAUT LES DRAPEAUX POUR RÉPONDRE, depuis le lot 186 : sans eux, la
 *  fonction dirait « step 5, Class » pendant que l'écran montre « 4 Class ».
 *  Deux voix pour un même ordre, exactement ce que la tête de ce fichier
 *  raconte. Un id d'étape NON MONTÉE rend `null` — l'effet n'a nulle part où
 *  se régler, et une ligne verte qui l'enverrait sur un cran absent serait
 *  pire que pas de ligne du tout. */
export function etapeParId(id, drapeaux) {
  const cran = ceinture(drapeaux).find((step) => step.id === id);
  return cran ? { numero: cran.numero, mot: cran.mot } : null;
}
