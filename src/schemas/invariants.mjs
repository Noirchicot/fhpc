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

  /* AJOUT 2026-08-08 (RELECTEUR Adverserial) — l'unicité des ancres de
     `resolved`.

     Le schéma dit d'un `id` de collection qu'il « sert d'ancre aux chemins
     d'override : `resolved.skills[arcanes].bonus` » ($comment de `slug`), et
     un override désigne SA cible par cet id, jamais par un index. Deux entrées
     partageant un id rendent donc l'ancre AMBIGUË — exactement le défaut que
     ce module nomme déjà pour `build.choices` et `build.overrides`, et que
     JSON Schema ne sait pas exprimer (`uniqueItems` compare des objets
     entiers, donc deux compétences homonymes aux bonus différents passent).

     Vérifié le 2026-08-08 : deux compétences, deux ressources ou deux traits
     portant le même id étaient acceptés par le schéma ET par ce module. La
     boucle est GÉNÉRIQUE — toute collection de `resolved` est couverte, y
     compris celles qu'une révision future ajoutera. */
  const resolved = (doc.resolved && typeof doc.resolved === "object") ? doc.resolved : {};
  for (const [name, collection] of Object.entries(resolved)) {
    if (!Array.isArray(collection)) continue;
    for (const id of duplicates(collection.map((entry) => entry && entry.id))) {
      violations.push(
        `resolved.${name} : deux entrées portent l'id « ${id} » — l'ancre d'override « resolved.${name}[${id}] » désigne les deux, et aucune ne gagne par défaut.`
      );
    }
  }

  const stack = doc.resolved && doc.resolved.derivation && doc.resolved.derivation.stack;
  if (Array.isArray(stack)) {
    /* `layer && …` plutôt que `layer.…` : une entrée non-objet faisait sortir
       ce module en TypeError au lieu d'une violation NOMMÉE (mesuré le
       2026-08-08 sur `build.layers: [null]`). Un validateur qui plante sur une
       entrée hostile ne valide pas cette entrée. */
    const asKey = (layer) => (layer && typeof layer === "object")
      ? `${layer.id}@${layer.version}#${layer.hash}`
      : `⟨entrée non conforme : ${JSON.stringify(layer)}⟩`;
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
