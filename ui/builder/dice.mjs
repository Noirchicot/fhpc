/* ══ LE HASARD DU BUILDER — lot 45 ═══════════════════════════════════
   Mesuré avant d'écrire une ligne (commande, §0) : le « moteur du hasard »
   annoncé par trois passations n'existe pas. `abilities.*` et
   `fh.destiny.arcana` sont déjà des points de décision qui marchent
   (`set`/`choose`, éprouvés par `skills-step.mjs`/`class-step.mjs`) — ce qui
   manque, c'est la PRODUCTION des nombres/de la carte que le joueur pose
   ensuite avec ces mêmes verbes. C'est une affaire d'écran, pas de moteur
   (§3a.4 de la commande) : ce fichier ne connaît AUCUNE règle de jeu, il ne
   fait QUE tirer, sur une source d'aléa qu'on lui INJECTE — jamais
   `Math.random()` appelé ici. C'est ce qui rend la règle de relance
   TESTABLE sans dépendre du hasard réel (commande §4, test 2).

   ⛔ RIEN ICI NE PERSISTE DANS LE DOCUMENT. Eric, 2026-08-13 : « le lot de
   dix dés ne survit pas, seul le résultat compte » — aucun champ neuf, pas
   de graine, pas d'historique. Le lot tiré vit dans la mémoire de l'écran
   (`shell.mjs`, `state.abilityRoll`), le temps que le joueur assigne ses
   six valeurs ; une fois assignées, elles vivent comme n'importe quel choix
   `abilities.<clef>` — la seule chose que `rebuild()` connaît. */

/** Un d6, tiré sur `rng()` → un nombre dans [0, 1) (la même forme que
 *  `Math.random`, injectable). */
function d6(rng) {
  return Math.floor(rng() * 6) + 1;
}

/** Un jet de 3d6 : les TROIS dés ET leur somme — le joueur voit ses dés, pas
 *  seulement un total qui pourrait être n'importe quoi. */
export function rollThreeD6(rng) {
  const dice = [d6(rng), d6(rng), d6(rng)];
  return { dice, total: dice[0] + dice[1] + dice[2] };
}

/** B5.2b — LE 4D6, CONFIRMÉ PAR ERIC : « quatre dés, on ÉCARTE LE PLUS BAS
 *  et on garde les trois meilleurs ». ⚠️ Sa dictée disait « keep one », il
 *  manquait un mot ; la correction est la sienne, pas une déduction.
 *  Les QUATRE dés reviennent, chacun avec `dropped` — le joueur doit voir
 *  lequel a été écarté, sinon le total est une affirmation. */
export function rollFourD6DropLowest(rng) {
  const dice = [d6(rng), d6(rng), d6(rng), d6(rng)];
  let bas = 0;
  for (let i = 1; i < 4; i += 1) if (dice[i] < dice[bas]) bas = i;
  const total = dice.reduce((somme, v, i) => somme + (i === bas ? 0 : v), 0);
  return { dice, dropped: bas, total };
}

/** Les DIX jets d'un lot, sans jugement sur sa validité — `rollAbilitySet`
 *  applique seule la règle de relance. Exportée à part pour que le test
 *  « chaque jet vaut entre 3 et 18 » puisse tirer un grand nombre de jets
 *  sans boucler sur la règle de relance (qui, elle, jette l'exemple qui
 *  l'intéresse). */
export function rollTen(rng) {
  return Array.from({ length: 10 }, () => rollThreeD6(rng));
}

/** Les SIX meilleurs d'un lot de dix, par TOTAL décroissant — égalité
 *  tranchée par l'ordre du jet (le premier jeté gagne), pour un résultat
 *  reproductible sur un lot DONNÉ. Rien n'est retiré de la liste : chaque
 *  entrée revient avec son `index` d'origine et `kept` (true pour les six
 *  retenus) — le lot ENTIER reste visible, gardés et écartés confondus
 *  (ADDENDUMS §4 : « on garde les 6 meilleurs », pas « on jette les 4
 *  pires » — la commande §3a.1 veut les dix affichés). */
export function markKept(rolls) {
  const withIndex = rolls.map((roll, index) => ({ ...roll, index }));
  const bySize = [...withIndex].sort((a, b) => b.total - a.total || a.index - b.index);
  const keptIndexes = new Set(bySize.slice(0, 6).map((roll) => roll.index));
  return withIndex.map((roll) => ({ ...roll, kept: keptIndexes.has(roll.index) }));
}

/* ══ LA RÈGLE DE TIRAGE — ✅ ARRÊTÉE PAR ERIC LE 2026-08-16 ═══════════════
   > **Dix jets de 3d6, on garde les six meilleurs. Si le meilleur n'atteint
   > pas 14, il devient 14. Le plus mauvais devient toujours 8. AUCUNE
   > RELANCE.**

   🔴 L'ANCIENNE RÈGLE EST MORTE, ET C'EST UNE MESURE QUI L'A TUÉE. Elle
   relançait le LOT ENTIER tant qu'aucun des dix n'atteignait 15 : mesuré,
   `P(3d6 ≥ 15) = 20/216`, donc un lot échouait avec `0,907¹⁰ ≈ 38 %` — 0,61
   lot jeté par personnage, et jusqu'à 25 s de théâtre à jeter par échec à la
   cadence du plateau. La nouvelle ne relance JAMAIS : elle GARANTIT au lieu
   de rejeter.

   📏 CE QU'ELLE DONNE, MESURÉ SUR 3 000 000 DE TIRAGES (2026-08-16) : somme
   moyenne **71,8** contre **72,0** pour le tableau standard, et un 18 dans
   **4,5 %** des cas. C'est ce que dit le panneau INFO, aux mêmes chiffres.

   ⚠️ « LE PLUS MAUVAIS DEVIENT TOUJOURS 8 » VA DANS LES DEUX SENS, et c'est
   voulu : un plus mauvais à 12 DESCEND à 8. C'est le prix de la garantie du
   haut — le panneau INFO l'écrit (« A 14 is promised, an 8 is owed ») et la
   ligne « A real weakness : always » de son tableau ne veut rien dire
   d'autre. Sans ça, la méthode serait strictement plus généreuse que le
   tableau standard, et la moyenne ne tomberait pas à 71,8.

   ⛔ LE JET N'EST JAMAIS RÉÉCRIT. Un jet ajusté garde ses trois dés et sa
   somme d'origine dans `brut` ; `ajuste` dit LEQUEL des deux planchers l'a
   touché. Afficher « 14 » au-dessus d'un « 4+4+4 » sans le dire serait un
   total menteur — la faute que le lot 40 a payée ailleurs. */
const PLANCHER_HAUT = 14;
const PLANCHER_BAS = 8;

/** Les deux planchers, appliqués aux SIX GARDÉS d'un lot déjà marqué par
 *  `markKept`. Les quatre écartés ne bougent pas : ils sont barrés à
 *  l'écran, pas comptés.
 *
 *  🔴 LE HAUT ET LE BAS SONT TROUVÉS PAR UN TRI, PAS PAR DEUX COMPARAISONS —
 *  et ce n'est pas du style. Avec deux boucles `>` / `<`, six gardés TOUS
 *  ÉGAUX (six 10, possible) désignent le MÊME jet comme meilleur et comme
 *  pire : un seul des deux planchers s'appliquerait, en silence. Le tri
 *  (total décroissant, puis index — la même règle d'égalité que `markKept`)
 *  rend deux entrées distinctes dès qu'il y en a deux. */
export function appliquerLesPlanchers(rolls) {
  const gardes = rolls.filter((roll) => roll.kept);
  if (gardes.length < 2) return rolls;
  const ordre = [...gardes].sort((a, b) => b.total - a.total || a.index - b.index);
  const haut = ordre[0];
  const bas = ordre[ordre.length - 1];
  return rolls.map((roll) => {
    if (roll === bas) return { ...roll, brut: roll.total, total: PLANCHER_BAS, ajuste: "bas" };
    if (roll === haut && roll.total < PLANCHER_HAUT) {
      return { ...roll, brut: roll.total, total: PLANCHER_HAUT, ajuste: "haut" };
    }
    return roll;
  });
}

/** LA MÉTHODE D'ERIC, version du 2026-08-16 : dix jets de 3d6, on garde les
 *  six meilleurs, on pose les deux planchers, et ON REND. Pas de boucle, pas
 *  de lot jeté, pas d'historique.
 *
 *  📌 `rerollCount: 0` SURVIT DANS LA FORME RENDUE, et pas par nostalgie :
 *  `rollAbilityBatch` rend la même enveloppe pour les deux méthodes de jet,
 *  et l'écran ne doit pas avoir à savoir laquelle il montre. Un champ à zéro
 *  coûte moins qu'une seconde forme. */
export function rollAbilitySet(rng) {
  return { rolls: appliquerLesPlanchers(markKept(rollTen(rng))), rerollCount: 0 };
}

/** B5.2 — LES DEUX MÉTHODES DE JET, et elles ne se ressemblent pas.
 *  · `fh3d6` : dix jets de 3d6, on garde les six meilleurs, un 14 garanti en
 *    haut et un 8 dû en bas — aucune relance ;
 *  · `4d6`   : SIX jets de 4d6 dont on écarte le plus bas — aucune garantie,
 *    aucun plafond, aucun écarté au niveau du LOT (chaque jet produit un
 *    score, il n'y a donc rien à trier).
 *  ⚠️ La forme rendue est la MÊME des deux côtés (`{rolls, rerollCount}`,
 *  chaque jet portant `kept`) : l'écran n'a pas à savoir laquelle il montre.
 *  C'est ce qui permet au vivier et au collecteur d'être écrits une fois.
 *
 *  ⌨️ `summary` EST LE TEXTE JOUEUR DE L'ÉCRAN, pas une glose interne — il
 *  se pose sous l'organe de la méthode (lot 80, §5 bis). Celui de `fh3d6`
 *  est validé MOT POUR MOT par Eric le 2026-08-16 ; celui de `4d6` est une
 *  proposition, à relire avant d'être figée.
 *
 *  ══ ⭐ CE QUE CE TABLEAU PORTE EN PLUS DEPUIS LE LOT 80 ═══════════════════
 *  Le plateau (`abilities-tray.mjs`) ne branche PLUS sur un id : il LIT ce
 *  tableau. Une mécanique y dit tout ce qui la distingue — combien de dés
 *  par jet, combien de jets, comment on jette, comment on clôt le lot, et
 *  les deux libellés de ses boutons.
 *
 *  🔴 C'EST LA LOI §1 DU MANDAT, APPLIQUÉE À L'ORGANE : *« ne pas écrire
 *  quatre écrans »*. Avant ce lot, `4d6` avait son propre rendu
 *  (`renderRollBatch`, une liste de pastilles sans dés 3D) parce que le
 *  plateau ne savait faire que dix jets de trois dés — deux formes du même
 *  geste, qui divergeaient déjà. Une troisième mécanique est désormais UNE
 *  ENTRÉE DE PLUS ICI, jamais un `if` de plus là-bas.
 *
 *  ⛔ `finir(jets)` REÇOIT LES JETS BRUTS ET REND LE LOT COMPLET (index et
 *  `kept` compris) : c'est le SEUL endroit où une règle de garde s'applique.
 *  Le plateau, lui, ne sait pas ce qu'est un dé gardé. */
export const ROLLING_METHODS = [
  {
    id: "fh3d6", label: "FH 3D6",
    des: 3, jets: 10,
    boutonUn: "3d6",   /* ⛔ `10x3D6` retiré le 2026-09-05 — Eric : « exit 10x3d6 » */
    jeter: rollThreeD6,
    finir: (jets) => appliquerLesPlanchers(markKept(jets)),
    summary: "Ten rolls of 3d6 — keep the six best. If your highest falls short of 14, "
      + "it becomes 14; your lowest always becomes 8."
  },
  {
    id: "4d6", label: "4D6",
    des: 4, jets: 6,
    boutonUn: "4d6",   /* `6x4D6` parti avec lui : un seul plateau, une seule rangée */
    jeter: rollFourD6DropLowest,
    /* ⛔ AUCUNE RÈGLE DE GARDE ICI, ET C'EST LA MÉTHODE : six jets, six
       scores, rien à trier et rien à rattraper (§4.2 du mandat). `kept: true`
       partout n'est donc pas une facilité — c'est la vérité de la mécanique. */
    finir: (jets) => jets.map((jet, index) => ({ ...jet, index, kept: true })),
    /* ⌨️ LA FORMULATION DU PANNEAU INFO, ET C'EST DÉLIBÉRÉ. La mienne disait
       « Six rolls of 4d6 — drop the lowest die of each roll. Nothing is
       guaranteed here, and nothing is capped. » — une PROPOSITION du mandat
       §5 bis, jamais ratifiée. Celle-ci est celle du panneau, qu'Eric a lue de
       près (il en a fait corriger une phrase). Entre deux textes d'agent, on
       garde celui qui est passé sous un œil humain.
       🔴 IL Y AVAIT UN SECOND LECTEUR, ET IL A DÉMÉNAGÉ (2026-09-05) : le
       panneau INFO de R Abilities lisait cette chaîne, pour que la règle ne
       soit pas écrite deux fois dans le même écran. Le panneau est parti au
       chapitre `ability-scores` de FH WEB, où le livre mène maintenant.
       ⭐ La raison d'être de cette chaîne ne change pas : elle reste LA
       formulation de la règle côté builder, et c'est elle que l'écran affiche.
       ⛔ Si un jour quelqu'un veut la redire ailleurs, il la LIT ici — il ne la
       recopie pas. C'est ce qui a évité la divergence, pas le panneau. */
    summary: "Roll four dice six times, drop the lowest die each time."
  }
];

/** La mécanique nommée, ou la première. ⛔ Le plateau et l'écran passent tous
 *  les deux par ici : un id inconnu ne doit pas rendre `undefined` à un
 *  appelant qui va lire `.des` à la ligne suivante. */
export function mecaniqueDeJet(id) {
  return ROLLING_METHODS.find((m) => m.id === id) || ROLLING_METHODS[0];
}

/** UN LOT COMPLET, D'UN COUP — c'est le `FLASH` du plateau, et le seul
 *  chemin qui produise un lot sans le faire tomber sous les yeux du joueur.
 *  ⭐ IL NE BRANCHE PLUS SUR UN ID : il lit la mécanique et l'applique. Les
 *  deux moitiés (`jeter` × `jets`, puis `finir`) sont exactement celles que
 *  la séquence du plateau déroule au ralenti — une seule définition de « ce
 *  qu'est un lot », donc aucune divergence possible entre le mode lent et le
 *  mode éclair. */
export function rollAbilityBatch(methodId, rng) {
  const mecanique = mecaniqueDeJet(methodId);
  const jets = Array.from({ length: mecanique.jets }, () => mecanique.jeter(rng));
  return { rolls: mecanique.finir(jets), rerollCount: 0, method: mecanique.id };
}

/** LE TIRAGE D'UNE CARTE DE DESTINÉE — une parmi le CATALOGUE REÇU, jamais
 *  une liste en dur (commande §3b.1, test 6 : une pile qui n'en porte que 3
 *  n'en tire que parmi ces 3). `catalog` est déjà le résultat de
 *  `query({kind:"arcana"})` — ce fichier ne connaît pas `layers/`, il ne
 *  fait que choisir un index dedans. */
export function drawArcana(catalog, rng) {
  if (!Array.isArray(catalog) || catalog.length === 0) return null;
  const index = Math.min(Math.floor(rng() * catalog.length), catalog.length - 1);
  return catalog[index];
}
