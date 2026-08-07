/* Invariants de fh-char/1 que JSON Schema 2020-12 ne sait PAS exprimer.

   JSON Schema n'a aucun moyen de dire « unique par champ » : `uniqueItems`
   compare des objets entiers, donc deux overrides sur le même chemin avec des
   valeurs différentes passent la validation alors qu'ils sont ambigus. Ces
   contrôles vivent donc en code — module pur, zéro dépendance — pour que le
   bloc `build` les applique au même endroit que les tests, plutôt que dans une
   suite qui prouverait quelque chose que le produit ne fait pas.

   Chaque violation est NOMMÉE : un rejet muet ou un « dernier gagne » implicite
   est exactement le repli silencieux que l'architecture interdit.
*/

/** @returns {string[]} liste vide = conforme ; sinon une phrase par violation. */
export function charInvariantViolations(doc) {
  const violations = [];
  const build = doc && doc.build;
  if (!build || typeof build !== "object") {
    return ["build absent : un document fh-char/1 porte toujours ses deux étages."];
  }

  for (const [field, label] of [["choices", "choix"], ["overrides", "override"]]) {
    const list = Array.isArray(build[field]) ? build[field] : [];
    for (const path of duplicates(list.map((entry) => entry && entry.path))) {
      violations.push(
        `build.${field} : deux entrées portent le chemin « ${path} » — ambigu, aucun ${label} ne gagne par défaut.`
      );
    }
  }

  const layers = Array.isArray(build.layers) ? build.layers : [];
  for (const id of duplicates(layers.map((layer) => layer && layer.id))) {
    violations.push(`build.layers : la couche « ${id} » apparaît deux fois dans la pile.`);
  }

  const stack = doc.resolved && doc.resolved.derivation && doc.resolved.derivation.stack;
  if (Array.isArray(stack)) {
    const asKey = (layer) => `${layer.id}@${layer.version}#${layer.hash}`;
    const built = layers.map(asKey).join(" | ");
    const derived = stack.map(asKey).join(" | ");
    if (built !== derived) {
      violations.push(
        `resolved.derivation.stack ne correspond pas à build.layers : resolved est périmé (dérivé de « ${derived} », le build dit « ${built} »).`
      );
    }
  }

  return violations;
}

function duplicates(values) {
  const seen = new Set();
  const twice = new Set();
  for (const value of values) {
    if (typeof value !== "string") continue;
    if (seen.has(value)) twice.add(value);
    seen.add(value);
  }
  return [...twice];
}
