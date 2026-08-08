/* ══ LES DEUX GRAMMAIRES DE CHEMIN DU BLOC `build` ═════════════════════
   Lot 9-bloc-build.

   Elles ne sont PAS la même, et le schéma `fh-char/1` les sépare exprès :

   - `choicePath` — un POINT DE DÉCISION dans la construction (`species`,
     `class.skills[0]`, `abilities.int`). La sélection y est un INDICE
     (`[0]`) : un choix est une place dans une liste de décisions, et cette
     place ne bouge pas.
   - `overridePath` — une CIBLE dans la fiche jouable, toujours enracinée dans
     `resolved`. La sélection y est une IDENTITÉ (`[torche]`) : « un index se
     décale à la reconstruction » ($defs/overridePath).

   ⚠️ Ce fichier ne réimplémente pas `src/layers/paths.mjs` par négligence : ce
   dernier applique un patch sur un RECORD DE COUCHE (racines `name`, `slug`,
   `data`) et le bloc `build` n'a pas le droit d'importer `src/layers/` (loi de
   frontière : `query` est le seul chemin). Les deux grammaires se ressemblent
   sans être interchangeables — celle-ci s'enracine dans `resolved`, l'autre
   dans un record. */

import { BuildError } from "./errors.mjs";

/* Les motifs sont RECOPIÉS du schéma, et un test compare les deux chaînes :
   deux copies d'une règle divergent toujours, sauf si quelque chose les
   compare (leçon `layers-document`). */
export const CHOICE_PATH = /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9_-]+|\[[0-9]+\])*$/;
export const OVERRIDE_PATH = /^resolved(\.[a-zA-Z][a-zA-Z0-9]*(\[[a-z][a-z0-9:_-]*\])?)+$/;

const FORBIDDEN_SEGMENTS = new Set([
  "__proto__", "constructor", "prototype", "script", "Script",
  "javascript", "eval", "exec", "function", "Function"
]);

function fail(what) {
  throw new BuildError(`fhpc/build: ${what}`);
}

/** Découpe un chemin de choix en segments `{kind:"name"|"index", value}`.
 *  Rend aussi `root`, la première clef — c'est elle qui dit de QUI le choix
 *  parle (`species`, `class`, `background`, `gear`…). */
export function parseChoicePath(path) {
  if (typeof path !== "string" || !CHOICE_PATH.test(path)) {
    fail(`chemin de choix mal formé « ${path} » — la grammaire est celle de $defs/choicePath.`);
  }
  const segments = [];
  const head = /^[a-z][a-zA-Z0-9]*/.exec(path)[0];
  segments.push({ kind: "name", value: head });
  const token = /\.([a-zA-Z0-9_-]+)|\[([0-9]+)\]/y;
  let pos = head.length;
  while (pos < path.length) {
    token.lastIndex = pos;
    const match = token.exec(path);
    if (match === null) break;
    segments.push(match[1] !== undefined
      ? { kind: "name", value: match[1] }
      : { kind: "index", value: Number(match[2]) });
    pos = token.lastIndex;
  }
  if (pos !== path.length) fail(`chemin de choix mal formé « ${path} ».`);
  for (const segment of segments) {
    if (segment.kind === "name" && FORBIDDEN_SEGMENTS.has(segment.value)) {
      fail(`le segment « ${segment.value} » de « ${path} » est une clef interdite.`);
    }
  }
  return { path, root: head, segments };
}

/** Découpe un chemin d'override. `resolved` est retiré de la tête : il est
 *  dans la grammaire pour dire OÙ un override a le droit de mordre, il n'est
 *  pas un segment à parcourir deux fois. */
export function parseOverridePath(path) {
  if (typeof path !== "string" || !OVERRIDE_PATH.test(path)) {
    fail(`chemin d'override mal formé « ${path} » — un override est TOUJOURS enraciné dans ` +
      "`resolved` et désigne un élément de collection par son identité, jamais par un index.");
  }
  const segments = [];
  const token = /\.([a-zA-Z][a-zA-Z0-9]*)(\[([a-z][a-z0-9:_-]*)\])?/y;
  let pos = "resolved".length;
  while (pos < path.length) {
    token.lastIndex = pos;
    const match = token.exec(path);
    if (match === null) break;
    segments.push({ kind: "name", value: match[1] });
    if (match[3] !== undefined) segments.push({ kind: "id", value: match[3] });
    pos = token.lastIndex;
  }
  if (pos !== path.length) fail(`chemin d'override mal formé « ${path} ».`);
  for (const segment of segments) {
    if (FORBIDDEN_SEGMENTS.has(segment.value)) {
      fail(`le segment « ${segment.value} » de « ${path} » est une clef interdite.`);
    }
  }
  return { path, segments };
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function show(segments, upto) {
  return segments.slice(0, upto + 1)
    .map((segment) => (segment.kind === "id" ? `[${segment.value}]` : `.${segment.value}`))
    .join("");
}

/* Où poser la main. Sur un tableau, la clef est l'INDICE TROUVÉ par identité —
   la seule façon de tenir « jamais par index » tout en sachant écrire. */
function seatOf(container, segment, path, prefix) {
  if (Array.isArray(container)) {
    if (segment.kind !== "id") {
      fail(`« resolved${prefix} » est une collection : on y désigne un élément par son identité entre ` +
        `crochets, pas par « .${segment.value} » (override « ${path} »).`);
    }
    const index = container.findIndex((item) => isObject(item) && item.id === segment.value);
    return { holder: container, key: index, missing: index < 0 };
  }
  if (isObject(container)) {
    if (segment.kind === "id") {
      fail(`« resolved${prefix} » n'est pas une collection : « [${segment.value}] » n'y désigne rien ` +
        `(override « ${path} »).`);
    }
    return { holder: container, key: segment.value, missing: !Object.hasOwn(container, segment.value) };
  }
  fail(`« resolved${prefix} » n'est ni un objet ni une collection : l'override « ${path} » ne peut pas y descendre.`);
}

/** Applique UN override sur une tranche `resolved` déjà clonée.

    ⚠️ UN OVERRIDE NE CRÉE RIEN. Ni une clef, ni un élément de collection.
    C'est la différence avec un patch de couche, et elle est voulue : un patch
    est du CONTENU qu'un homebrew a le droit d'enrichir, un override est un
    TWEAK sur une fiche qui existe. Un override dans le vide veut dire que la
    dérivation n'a pas produit ce que le MJ croyait tweaker — c'est
    exactement le moment où il faut le lui dire (loi §0.5), pas fabriquer la
    case manquante pour que ça passe. */
export function applyOverride(resolved, path, value) {
  const { segments } = parseOverridePath(path);
  let container = resolved;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const step = seatOf(container, segments[i], path, show(segments, i - 1));
    if (step.missing) {
      fail(`l'override « ${path} » vise « resolved${show(segments, i)} », que la dérivation n'a pas produit — ` +
        "un override tweake ce qui existe, il ne fabrique pas la case qui manque.");
    }
    container = step.holder[step.key];
  }
  const last = segments[segments.length - 1];
  const seat = seatOf(container, last, path, show(segments, segments.length - 2));
  if (seat.missing) {
    fail(`l'override « ${path} » vise « resolved${show(segments, segments.length - 1)} », que la dérivation ` +
      "n'a pas produit — un override tweake ce qui existe, il ne fabrique pas la case qui manque.");
  }
  seat.holder[seat.key] = value;
  return { path, value };
}
