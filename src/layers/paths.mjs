/* ══ LE CHEMIN D'UN PATCH — la même grammaire que les overrides ════════
   Lot 7-bloc-layers.

   `patch.changes` est une carte CHEMIN → VALEUR, et la grammaire est celle des
   overrides de `fh-char/1` ($defs/overridePath), enracinée dans le record visé
   au lieu de `resolved` : segments séparés par `.`, sélection dans une
   collection par l'IDENTITÉ entre crochets — **jamais par index** (« un index
   se décale à la reconstruction »).

   POURQUOI UNE CARTE DE CHEMINS ET PAS UN OBJET À FUSIONNER (schéma
   fh-layer/1, $defs/opPatch) : « aucune sémantique de fusion à deviner, aucune
   fusion profonde qui écrase en silence ». Ce fichier tient l'autre bout de la
   promesse — chaque chemin est résolu explicitement, et tout ce qui ne se
   résout pas JETTE.

   TROIS RÈGLES, ET LEUR RAISON :

   1. **Racines autorisées : `name`, `slug`, `data`.** Liste FERMÉE. Ce qui est
      refusé et pourquoi :
      - `attribution` : un patch qui réécrit l'attribution d'un record SRD lui
        retire sa notice CC-BY. Le juridique est de premier rang (loi §0.8) et
        une couche homebrew n'a pas à pouvoir décrocher la licence d'un contenu
        dont elle dérive. ⚠️ Question ouverte n°3 pour l'architecte.
      - `source` : d'où vient le record chez SA source. Un patch ne déplace pas
        un record dans un autre livre.
      - `contentHash` : c'est un certificat SUR le contenu, pas du contenu. On
        ne signe pas soi-même le paquet qu'on vient de modifier.
      - `op` : l'opération n'est pas une donnée du record.

   2. **Un segment intermédiaire doit exister.** Créer un chemin en profondeur
      reviendrait à deviner la forme voulue. Une racine absente ou un
      intermédiaire absent nomme le préfixe qui manque.

   3. **Le DERNIER segment peut créer une clef sur un objet** (un homebrew
      ajoute légitimement un champ), **jamais un élément dans un tableau** —
      un élément créé « par identité » n'aurait pas de place où être mis. Une
      création est RAPPORTÉE (`created`), pas silencieuse : le pli la remonte
      dans `layers-changed`, faute de quoi `data.cst` deviendrait un champ
      fantôme au lieu d'une faute de frappe visible. */

import { CHANGE_PATH, isForbiddenKey, LayerError } from "./document.mjs";

export const PATCHABLE_ROOTS = ["name", "slug", "data"];
const ROOT_SET = new Set(PATCHABLE_ROOTS);

const TOKEN = /\.([a-zA-Z][a-zA-Z0-9]*)|\[([a-z][a-z0-9:_-]*)\]/y;

function fail(where, what) {
  throw new LayerError(`fhpc/layers: ${where} — ${what}`);
}

/** Chemin → segments `{kind: "name"|"key", value}`. Jette sur une forme que la
 *  grammaire refuse, et sur un segment portant une clef dangereuse : la
 *  grammaire du schéma laisse passer `data.constructor`, pas nous. */
export function parseChangePath(path, where = "un chemin de patch") {
  if (typeof path !== "string" || !CHANGE_PATH.test(path)) {
    fail(where, `chemin mal formé « ${path} ».`);
  }
  const head = /^[a-zA-Z][a-zA-Z0-9]*/.exec(path)[0];
  const segments = [{ kind: "name", value: head }];
  /* `TOKEN` est collant (`y`) : sa position se suit à la main. Un `exec` qui
     échoue REMET `lastIndex` à zéro — s'en servir comme témoin de fin de
     course faisait échouer tous les chemins valides, y compris `data.cost`. */
  let pos = head.length;
  while (pos < path.length) {
    TOKEN.lastIndex = pos;
    const match = TOKEN.exec(path);
    if (match === null) break;
    segments.push(match[1] !== undefined
      ? { kind: "name", value: match[1] }
      : { kind: "key", value: match[2] });
    pos = TOKEN.lastIndex;
  }
  if (pos !== path.length) fail(where, `chemin mal formé « ${path} ».`);
  for (const segment of segments) {
    if (isForbiddenKey(segment.value)) {
      fail(where, `le segment « ${segment.value} » de « ${path} » est une clef interdite.`);
    }
  }
  return segments;
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* Où poser la main : le porteur et la clef par laquelle on le tient. Sur un
   tableau, la clef est l'INDICE TROUVÉ par identité — c'est la seule façon de
   respecter « jamais par index » tout en sachant écrire. */
function locate(container, segment, { path, where, prefix }) {
  if (Array.isArray(container)) {
    if (segment.kind === "name") {
      fail(where, `« ${prefix} » est une collection : on y désigne un élément par son identité ` +
        `entre crochets, pas par « .${segment.value} » (chemin « ${path} »).`);
    }
    const index = container.findIndex((item) =>
      (isObject(item) && (item.id === segment.value || item.slug === segment.value)) ||
      item === segment.value);
    if (index < 0) return { holder: container, key: null, missing: true };
    return { holder: container, key: index, missing: false };
  }
  if (isObject(container)) {
    return { holder: container, key: segment.value, missing: !Object.hasOwn(container, segment.value) };
  }
  fail(where, `« ${prefix} » n'est ni un objet ni une collection : le chemin « ${path} » ne peut pas y descendre.`);
}

function show(segments, upto) {
  return segments.slice(0, upto + 1)
    .map((segment, i) => (i === 0 ? segment.value : segment.kind === "name" ? `.${segment.value}` : `[${segment.value}]`))
    .join("");
}

/** Applique UNE valeur sur un record déjà cloné. Mute le clone, jamais le
 *  record d'origine — le clonage est du ressort de l'appelant (`applyChanges`).
 *  Rend `{path, created}` : `created` vaut vrai quand la clef n'existait pas. */
export function applyChange(target, path, value, where = "un patch") {
  const segments = parseChangePath(path, where);
  if (!ROOT_SET.has(segments[0].value)) {
    fail(where, `« ${segments[0].value} » n'est pas patchable — un patch touche ${PATCHABLE_ROOTS.join(", ")} ` +
      "et rien d'autre : l'attribution, la source et le contentHash d'un record ne se réécrivent pas depuis une couche.");
  }

  let container = target;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const step = locate(container, segments[i], { path, where, prefix: show(segments, i - 1) || "le record" });
    if (step.missing) {
      fail(where, `« ${show(segments, i)} » n'existe pas dans le record — le chemin « ${path} » ne peut pas être créé ` +
        "en profondeur : une couche ne devine pas la forme qu'elle voudrait trouver.");
    }
    container = step.holder[step.key];
  }

  const last = segments[segments.length - 1];
  const seat = locate(container, last, { path, where, prefix: show(segments, segments.length - 2) || "le record" });
  if (seat.missing) {
    if (Array.isArray(seat.holder)) {
      fail(where, `« ${last.value} » n'est dans aucun élément de « ${show(segments, segments.length - 2)} » — ` +
        "on désigne un élément existant par son identité, on n'en crée pas un par un chemin.");
    }
    seat.holder[last.value] = value;
    return { path, created: true };
  }
  seat.holder[seat.key] = value;
  return { path, created: false };
}

/** Applique toute la carte `changes` sur une COPIE du record. Ordre déterminé
 *  (clefs triées) : deux exécutions donnent le même record, même si deux
 *  chemins se recouvrent. */
export function applyChanges(record, changes, where = "un patch") {
  const patched = structuredClone(record);
  const applied = [];
  for (const path of Object.keys(changes).sort()) {
    applied.push(applyChange(patched, path, changes[path], where));
  }
  return { record: patched, applied };
}
