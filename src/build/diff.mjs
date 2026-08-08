/* LE DIFF DE `resolved` — ce que `char-rebuilt` transporte.

   L'architecture exige « char-rebuilt (avec diff) ». Le diff est une LISTE DE
   CHEMINS, pas deux documents entiers : un abonné veut savoir ce qui a bougé,
   et lui tendre l'avant et l'après l'oblige à refaire ce travail lui-même.

   LES CHEMINS SONT DES CHEMINS D'OVERRIDE. `resolved.skills[arcanes].bonus`,
   jamais `resolved.skills[1].bonus` : c'est la grammaire de `$defs/overridePath`,
   et un MJ qui lit « voici ce qui a changé » doit pouvoir recopier la ligne
   telle quelle pour la figer par un override. Un index se décale à la
   reconstruction suivante ; une identité, non. */

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function anchorOf(item, index) {
  return isObject(item) && typeof item.id === "string" ? `[${item.id}]` : `[${index}]`;
}

/** @returns {Array<{path:string, from:*, to:*}>} trié par chemin. */
export function diffResolved(before, after) {
  const changes = [];
  walk(before, after, "resolved", changes);
  changes.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return changes;
}

function walk(before, after, path, changes) {
  if (Object.is(before, after)) return;

  if (Array.isArray(before) && Array.isArray(after)) {
    const seen = new Set();
    before.forEach((item, index) => {
      const anchor = anchorOf(item, index);
      seen.add(anchor);
      const twin = findTwin(after, item, index);
      if (twin === undefined) changes.push({ path: path + anchor, from: item, to: undefined });
      else walk(item, twin, path + anchor, changes);
    });
    after.forEach((item, index) => {
      const anchor = anchorOf(item, index);
      if (seen.has(anchor)) return;
      changes.push({ path: path + anchor, from: undefined, to: item });
    });
    return;
  }

  if (isObject(before) && isObject(after)) {
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      walk(before[key], after[key], `${path}.${key}`, changes);
    }
    return;
  }

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    changes.push({ path, from: before, to: after });
  }
}

/* L'appariement se fait par IDENTITÉ quand elle existe, par position sinon —
   un élément sans `id` n'a rien d'autre à quoi se raccrocher. */
function findTwin(list, item, index) {
  if (isObject(item) && typeof item.id === "string") {
    return list.find((candidate) => isObject(candidate) && candidate.id === item.id);
  }
  return list[index];
}
