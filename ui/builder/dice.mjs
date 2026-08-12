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

/** LA MÉTHODE D'ERIC (ADDENDUMS §4) : dix jets de 3d6, on garde les six
 *  meilleurs, et ON RELANCE LE LOT ENTIER si AUCUN des dix n'atteint 15 —
 *  jamais un jet remplacé seul, jamais un jet complété. `rerollCount` compte
 *  les lots REJETÉS avant celui rendu : c'est ce qui permet à l'écran de
 *  MONTRER que le lot a changé sous les yeux du joueur (commande §3a.1),
 *  sans qu'aucun lot rejeté ne soit gardé nulle part (aucun historique —
 *  Eric, 2026-08-13). */
export function rollAbilitySet(rng) {
  let rerollCount = 0;
  let rolls = rollTen(rng);
  while (!rolls.some((roll) => roll.total >= 15)) {
    rerollCount += 1;
    rolls = rollTen(rng);
  }
  return { rolls: markKept(rolls), rerollCount };
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
