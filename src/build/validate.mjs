/* ══ LES INVARIANTS QUE LE SCHÉMA ÉCRIT SANS SAVOIR LES EXÉCUTER ══════
   Lot 19-score-destinee.

   `$defs/resolved.stats[].value` porte, en `$comment`, la phrase suivante :
   « ⚠️ INVARIANT NON TENU PAR CE SCHÉMA : `value` est la somme des
   `breakdown[].value`. JSON Schema ne sait pas additionner. L'invariant est
   donc à la charge de `build.validate`, et un invariant écrit ici sans être
   exécuté là-bas ne serait qu'une INTENTION. »

   Ce fichier est le là-bas. Il est séparé de `block.mjs` pour une raison de
   test : la fonction est PURE, donc elle peut être ATTAQUÉE directement sur
   une somme fabriquée fausse, sans monter un document ni une pile. Un
   invariant écrit et jamais violé pour de bon ne vaut pas ce qu'il coûte.

   ── OÙ IL MORD, ET POURQUOI PAS AU MÊME ENDROIT DES DEUX CÔTÉS ────────
   · `rebuild` l'applique sur la tranche que la DÉRIVATION vient de produire,
     AVANT les overrides : un module ne doit jamais pouvoir écrire un Score
     faux qui a l'air juste, et le refus est bruyant.
   · `validate` l'applique sur la tranche que le personnage JOUE, overrides
     compris : la parole du MJ bat le JSON (invariant n°2), elle ne se fait
     donc pas jeter — mais un `value` qu'aucun détail ne justifie est NOMMÉ,
     jamais avalé. Le MJ qui veut monter le Score ajoute un terme motivé ;
     celui qui écrase `value` tout seul l'apprend de `validate`. */

/** Le détail d'un terme, tel qu'il se lit dans un message d'erreur. */
function showTerm(term) {
  if (!term || typeof term !== "object") return JSON.stringify(term);
  return `${JSON.stringify(term.label)} = ${JSON.stringify(term.value)}`;
}

/**
 * `value` est-il la somme de son détail, pour chaque statistique dérivée ?
 *
 * @param {object} resolved la tranche `resolved` à juger (peut être absente)
 * @returns {string[]} liste vide = conforme ; sinon une phrase par violation.
 */
export function statSumViolations(resolved) {
  const violations = [];
  const stats = (resolved && Array.isArray(resolved.stats)) ? resolved.stats : [];

  for (const stat of stats) {
    if (!stat || typeof stat !== "object") {
      violations.push(`resolved.stats : une entrée n'est pas une statistique (${JSON.stringify(stat)}).`);
      continue;
    }
    const anchor = typeof stat.id === "string" ? stat.id : JSON.stringify(stat.id);
    const terms = Array.isArray(stat.breakdown) ? stat.breakdown : null;
    if (terms === null || terms.length === 0) {
      violations.push(`resolved.stats[${anchor}] : aucun détail — le schéma en exige au moins un terme, ` +
        "et une statistique sans détail est exactement l'objet que cette collection existe pour remplacer.");
      continue;
    }
    let sum = 0;
    let addable = true;
    for (const term of terms) {
      if (!term || typeof term !== "object" || !Number.isInteger(term.value)) {
        violations.push(`resolved.stats[${anchor}] : le terme ${showTerm(term)} ne porte pas de valeur entière — ` +
          "un terme qui ne s'additionne pas rend le total indémontrable.");
        addable = false;
        continue;
      }
      sum += term.value;
    }
    if (!addable) continue;
    if (!Number.isInteger(stat.value)) {
      violations.push(`resolved.stats[${anchor}] : \`value\` vaut ${JSON.stringify(stat.value)} et le détail somme ` +
        `à ${sum} — une statistique dérivée est un entier.`);
      continue;
    }
    if (stat.value !== sum) {
      violations.push(`resolved.stats[${anchor}] : \`value\` vaut ${stat.value}, et son détail somme à ${sum} ` +
        `(${terms.map(showTerm).join(" ; ")}). Le schéma le dit et ne sait pas l'additionner : ` +
        "un total que son propre détail contredit est un chiffre faux qui a l'air juste.");
    }
  }

  return violations;
}
