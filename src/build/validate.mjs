import { renderBuildViolation } from "../labels.mjs";

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

function shown(value) {
  const text = JSON.stringify(value);
  return text === undefined ? String(value) : text;
}

function scalar(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function validKey(key) {
  return typeof key === "string" && /^[a-z][a-z0-9.:_-]{0,79}$/.test(key);
}

/** Une violation reste une donnée sérialisable. Sa coercition textuelle est
 *  non énumérable : elle conserve les cinq assertions historiques, tandis que
 *  JSON/MCP ne publient que {key, params, path?}. */
export function buildViolation(key, params, path) {
  if (!validKey(key)) {
    throw new TypeError(`fhpc/build: violation key invalide : ${String(key)}.`);
  }
  if (!params || typeof params !== "object" || Array.isArray(params) ||
    Object.values(params).some((value) => !scalar(value))) {
    throw new TypeError("fhpc/build: les paramètres d'une violation doivent être plats et scalaires.");
  }
  if (path !== undefined && typeof path !== "string") {
    throw new TypeError("fhpc/build: le chemin d'une violation doit être une chaîne ou absent.");
  }
  const violation = path === undefined ? { key, params } : { key, params, path };
  Object.defineProperty(violation, "toString", {
    enumerable: false,
    value() { return renderBuildViolation(violation); }
  });
  return violation;
}

/** Le garde de collection : aucune chaîne nue ne rejoint `validate`. */
export function buildViolationList() {
  const entries = [];
  function add(violation) {
    if (!violation || typeof violation !== "object" || Array.isArray(violation) ||
      !validKey(violation.key) || !violation.params || typeof violation.params !== "object" ||
      Array.isArray(violation.params) || Object.values(violation.params).some((value) => !scalar(value)) ||
      (violation.path !== undefined && typeof violation.path !== "string")) {
      throw new TypeError("fhpc/build: une violation doit être {key, params, path?}, jamais une chaîne.");
    }
    entries.push(violation);
  }
  return {
    add,
    addMany(list) {
      for (const violation of list) add(violation);
    },
    values() { return entries.slice(); }
  };
}

/**
 * `value` est-il la somme de son détail, pour chaque statistique dérivée ?
 *
 * @param {object} resolved la tranche `resolved` à juger (peut être absente)
 * @returns {object[]} liste vide = conforme ; sinon une violation structurée.
 */
export function statSumViolations(resolved) {
  const violations = [];
  const stats = (resolved && Array.isArray(resolved.stats)) ? resolved.stats : [];

  for (const stat of stats) {
    if (!stat || typeof stat !== "object") {
      violations.push(buildViolation("stat.entry-not-stat", { stat: shown(stat) }, "resolved.stats"));
      continue;
    }
    const anchor = typeof stat.id === "string" ? stat.id : shown(stat.id);
    const terms = Array.isArray(stat.breakdown) ? stat.breakdown : null;
    if (terms === null || terms.length === 0) {
      violations.push(buildViolation("stat.breakdown-missing", { anchor }, `resolved.stats[${anchor}]`));
      continue;
    }
    let sum = 0;
    let addable = true;
    for (const term of terms) {
      if (!term || typeof term !== "object" || !Number.isInteger(term.value)) {
        violations.push(buildViolation("stat.term-not-integer", { anchor, term: showTerm(term) }, `resolved.stats[${anchor}]`));
        addable = false;
        continue;
      }
      sum += term.value;
    }
    if (!addable) continue;
    if (!Number.isInteger(stat.value)) {
      violations.push(buildViolation("stat.value-not-integer", {
        anchor, value: shown(stat.value), sum
      }, `resolved.stats[${anchor}]`));
      continue;
    }
    if (stat.value !== sum) {
      violations.push(buildViolation("stat.value-mismatch", {
        anchor, value: stat.value, sum, terms: terms.map(showTerm).join(" ; ")
      }, `resolved.stats[${anchor}]`));
    }
  }

  return violations;
}
