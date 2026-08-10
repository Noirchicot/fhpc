/* ══ LE MÉCANISME COMMUN DES LIBELLÉS ═════════════════════════════════
   Une règle rend un identifiant et ses données ; une frontière d'affichage
   applique le paquet de mots. Ce fichier ne porte aucun bloc : il permet à
   `play`, `build` et l'adaptateur MCP de réutiliser la même loi sans créer
   une dépendance de compilation entre leurs blocs. */

export function createLabels(...packs) {
  const table = Object.assign({}, ...packs);
  function t(id, data) {
    const entry = table[id];
    if (entry === undefined) {
      throw new Error('fhpc/labels: no label for "' + id + '" — the engine names ids, a pack must carry the words');
    }
    return typeof entry === "function" ? entry(data || {}) : entry;
  }
  t.has = (id) => table[id] !== undefined;
  t.ids = () => Object.keys(table).sort();
  return t;
}

/* Les phrases de `build.validate`, déplacées ici VERBATIM. Le MCP rend ces
   phrases à un lecteur humain ; `structuredContent` garde simultanément la
   clef, les paramètres et le chemin du refus. */
export const FR_BUILD = {
  "document.invariant-violated": (d) => d.message,
  "choice.query-threw": (d) => `choix « ${d.path} » : ${d.message}`,
  "choice.ref-missing": (d) => `choix « ${d.path} » : la pile ne porte aucun ${d.kind} « ${d.id} ».`,
  "derive.threw": (d) => d.message,
  "skill-grant.count-mismatch": (d) => `« ${d.root} » fait choisir ${d.declared} compétence(s) et les choix en désignent ` +
    `${d.actual} (${d.answers}).`,
  "background.ability-key-invalid": (d) => `l'arrière-plan « ${d.backgroundId} » porte \`ability_keys\` = ${d.key}, ` +
    `qui n'est pas une clef de caractéristique (${d.abilityKeys}).`,
  "background.boost-disallowed": (d) => `le choix « ${d.path} » augmente une caractéristique que l'arrière-plan ` +
    `« ${d.backgroundId} » ne nomme pas (il nomme : ${d.abilityKeys}).`,
  "background.feat-mismatch": (d) => `le choix « background.feat » désigne « ${d.selectedId} », alors que l'arrière-plan ` +
    `« ${d.backgroundId} » accorde « ${d.featId} ».`,
  "decision.kind-mismatch": (d) => `la décision « ${d.path} » attend un record de genre ${d.expectedKind}, ` +
    `pas ${d.actualKind}.`,
  "decision.option-unavailable": (d) => `la décision « ${d.path} » porte l'option « ${d.selected} », ` +
    `absente des options disponibles (${d.options}).`,
  "stat.entry-not-stat": (d) => `resolved.stats : une entrée n'est pas une statistique (${d.stat}).`,
  "stat.breakdown-missing": (d) => `resolved.stats[${d.anchor}] : aucun détail — le schéma en exige au moins un terme, ` +
    "et une statistique sans détail est exactement l'objet que cette collection existe pour remplacer.",
  "stat.term-not-integer": (d) => `resolved.stats[${d.anchor}] : le terme ${d.term} ne porte pas de valeur entière — ` +
    "un terme qui ne s'additionne pas rend le total indémontrable.",
  "stat.value-not-integer": (d) => `resolved.stats[${d.anchor}] : \`value\` vaut ${d.value} et le détail somme ` +
    `à ${d.sum} — une statistique dérivée est un entier.`,
  "stat.value-mismatch": (d) => `resolved.stats[${d.anchor}] : \`value\` vaut ${d.value}, et son détail somme à ${d.sum} ` +
    `(${d.terms}). Le schéma le dit et ne sait pas l'additionner : ` +
    "un total que son propre détail contredit est un chiffre faux qui a l'air juste.",

  /* ── LOT 34 — LA GRILLE À QUATRE PALIERS ──────────────────────────── */
  "skill-budget.option-unavailable": (d) => `le choix « ${d.path} » porte la compétence « ${d.selected} », absente ` +
    `du budget captif (${d.options}).`,
  "skill-budget.tier-invalid": (d) => `le choix « ${d.path} » porte le palier « ${d.value} », et un budget captif ` +
    "ne dépense qu'à ½ ou Plein.",
  "skill-budget.overspent": (d) => `le budget captif « ${d.path} » dépense ${d.spent} point(s) pour ${d.points} ` +
    "accordé(s) — la répartition dépasse le budget.",
  "skill-spend.option-unavailable": (d) => `le choix « ${d.path} » désigne la compétence « ${d.selected} », que la ` +
    "pile ne porte pas.",
  "skill-spend.tier-invalid": (d) => `le choix « ${d.path} » porte le palier « ${d.value} », qui n'est ni ½, ni ` +
    "Plein, ni le palier le plus haut.",
  "skill-spend.below-floor": (d) => `le choix « ${d.path} » demande le palier « ${d.value} », sous le plancher ` +
    `« ${d.floor} » déjà imposé — un palier imposé se MONTE, il ne descend pas.`,
  "skill-spend.tier-locked": (d) => `le choix « ${d.path} » achète le palier le plus haut sur « ${d.skillId} » au ` +
    `niveau ${d.level}, alors que la classe ne l'autorise qu'à partir du niveau ${d.unlockLevel}.`
};

const buildLabels = createLabels(FR_BUILD);

export function renderBuildViolation(violation) {
  if (!violation || typeof violation !== "object") {
    throw new TypeError("fhpc/labels: a build violation must be an object.");
  }
  return buildLabels(violation.key, violation.params);
}
