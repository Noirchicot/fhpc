/* ══ LA LISTE BLANCHE, GÉNÉRÉE DU SCHÉMA — UNE SEULE COPIE ═════════════
   Lot 14-bloc-doc.

   ── POURQUOI CE FICHIER EXISTE PLUTÔT QU'UNE VALIDATION ÉCRITE À LA MAIN ──
   La leçon n°3 de `ARCHITECTURE.md` (« Persistance ») est sans appel : « une
   seule liste blanche générée du schéma, client ET serveur — jamais de strip
   silencieux ». Le bloc `layers` a résolu le même problème autrement : il
   RECOPIE les règles de `fh-layer/1` en code et tient l'écart par un garde de
   dérive. C'est deux copies plus un comparateur — ça marche tant que le
   comparateur existe, et ce lot ne le refait pas.

   Ici, la règle est LUE. Ce module compile un sous-ensemble de JSON Schema
   2020-12 — celui, et exactement celui, que `fh-char.schema.json` emploie — et
   valide un document contre l'objet de schéma qu'on lui donne. Il n'y a donc
   aucune seconde copie à faire diverger : le fichier de schéma EST la règle,
   à l'exécution comme dans la suite.

   ⚠️ `ajv` ne peut pas jouer ce rôle : c'est une dépendance de DÉV (loi §0.11)
   et elle n'est pas là au moment où un document arrive. Elle sert de JUGE dans
   la suite — les deux validateurs sont confrontés sur un corpus, et un
   désaccord rougit (`tests/doc-schema.test.mjs`).

   ── UN MOT-CLEF NON PRIS EN CHARGE EST UN REFUS, PAS UN SILENCE ─────────
   C'est le point qui rend l'approche tenable. Si quelqu'un ajoute demain
   `uniqueItems` ou `dependentRequired` au schéma, ce module JETTE À LA
   COMPILATION en nommant le mot-clef et son emplacement. Il ne l'ignore pas.
   Sans ce refus, une règle ajoutée au contrat serait silencieusement non
   appliquée à l'exécution — exactement le « strip silencieux derrière un
   200 OK » que la leçon n°3 interdit.

   ── CE QU'IL NE FAIT PAS ────────────────────────────────────────────────
   Il ne prétend pas être un validateur JSON Schema général : pas de `$id`
   distant, pas de `format`, pas d'ancrage dynamique, pas de composition
   `allOf`. Ces mots-clefs ne sont pas dans `fh-char/1` ; le jour où l'un y
   entre, la compilation rougit et c'est ici qu'on l'écrit. */

import { DocError } from "./errors.mjs";

/** Les mots-clefs que ce module SAIT appliquer. Tout le reste jette. */
export const SUPPORTED = new Set([
  /* annotations — sans effet sur la validation, mais reconnues */
  "$schema", "$id", "title", "$comment",
  /* structure */
  "$defs", "$ref",
  /* types et valeurs */
  "type", "const", "enum",
  /* chaînes */
  "pattern", "minLength", "maxLength",
  /* nombres */
  "minimum", "maximum",
  /* tableaux */
  "items", "minItems",
  /* objets */
  "properties", "patternProperties", "additionalProperties", "propertyNames", "required",
  /* combinateurs */
  "oneOf", "anyOf", "not"
]);

const REF_FORM = /^#\/\$defs\/([A-Za-z0-9_-]+)$/;

function fail(what) {
  throw new DocError(`fhpc/doc: ${what}`);
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Les types JSON Schema d'une valeur. Un entier est AUSSI un nombre — c'est
 *  la règle du dialecte, et `proficiency` (`integer`) comme `gear[].weight`
 *  (`number`) en dépendent. */
function typesOf(value) {
  if (value === null) return ["null"];
  if (Array.isArray(value)) return ["array"];
  const kind = typeof value;
  if (kind === "number") return Number.isInteger(value) ? ["number", "integer"] : ["number"];
  if (kind === "string") return ["string"];
  if (kind === "boolean") return ["boolean"];
  if (kind === "object") return ["object"];
  return [`⟨${kind}⟩`];
}

/** Longueur en POINTS DE CODE, comme `minLength`/`maxLength` l'exigent (et
 *  comme `ajv` la calcule). `"…".length` compte des unités UTF-16 : un nom
 *  portant un caractère hors du plan de base compterait double, et le refus
 *  tomberait sur un document légitime. */
function codePoints(text) {
  let count = 0;
  for (const _ of text) count += 1;
  return count;
}

/** Un JSON compact pour les messages — jamais la valeur entière si elle est
 *  énorme : un refus illisible ne se lit pas, donc ne se corrige pas. */
function show(value) {
  const text = JSON.stringify(value);
  if (text === undefined) return String(value);
  return text.length <= 80 ? text : `${text.slice(0, 77)}…`;
}

/**
 * Compile un objet de schéma. Jette en NOMMANT le mot-clef et son emplacement
 * dès qu'il rencontre quelque chose qu'il ne saurait pas appliquer.
 *
 * @param {object} schema le document de schéma (celui de `fh-char.schema.json`)
 * @param {string} [where] d'où il vient, pour les messages
 * @returns {{validate: (value: unknown, at?: string) => string[], defs: object, schema: object}}
 */
export function compileSchema(schema, where = "(schéma)") {
  if (!isPlainObject(schema)) fail(`${where} : le schéma doit être un objet.`);
  const defs = isPlainObject(schema.$defs) ? schema.$defs : {};

  /* ── LA PASSE DE COMPILATION ───────────────────────────────────────
     Elle ne valide rien : elle vérifie que TOUT ce que le schéma demande est
     applicable. Un mot-clef inconnu, une référence hors `#/$defs/`, une
     référence vers une définition absente : trois refus, chacun nommé. */
  const compiled = new Set();
  function inspect(node, at) {
    if (node === true || node === false) return;
    if (!isPlainObject(node)) {
      fail(`${where} : « ${at} » n'est ni un objet ni un booléen — un sous-schéma est l'un des deux.`);
    }
    for (const key of Object.keys(node)) {
      if (!SUPPORTED.has(key)) {
        fail(`${where} : mot-clef « ${key} » en « ${at} », que ce validateur ne sait pas appliquer. ` +
          "Un mot-clef ignoré serait une règle du contrat qui ne s'applique qu'aux tests — " +
          "c'est le strip silencieux que la leçon n°3 interdit. Écrire sa règle dans src/doc/schema.mjs, " +
          "ou la retirer du schéma.");
      }
    }
    if (node.$ref !== undefined) {
      const match = REF_FORM.exec(node.$ref);
      if (!match) {
        fail(`${where} : référence « ${node.$ref} » en « ${at} » — seule la forme « #/$defs/<nom> » est ` +
          "prise en charge (aucun schéma distant, aucun ancrage dynamique).");
      }
      if (defs[match[1]] === undefined) {
        fail(`${where} : « ${at} » référence « ${node.$ref} », qui n'est défini nulle part dans $defs.`);
      }
    }
    for (const key of ["properties", "patternProperties"]) {
      if (node[key] === undefined) continue;
      if (!isPlainObject(node[key])) fail(`${where} : « ${at}.${key} » doit être un objet.`);
      for (const [name, sub] of Object.entries(node[key])) inspect(sub, `${at}.${key}.${name}`);
    }
    for (const key of ["items", "additionalProperties", "propertyNames", "not"]) {
      if (node[key] !== undefined) inspect(node[key], `${at}.${key}`);
    }
    for (const key of ["oneOf", "anyOf"]) {
      if (node[key] === undefined) continue;
      if (!Array.isArray(node[key])) fail(`${where} : « ${at}.${key} » doit être un tableau.`);
      node[key].forEach((sub, index) => inspect(sub, `${at}.${key}[${index}]`));
    }
  }

  inspect(schema, "#");
  for (const [name, sub] of Object.entries(defs)) {
    if (compiled.has(name)) continue;
    compiled.add(name);
    inspect(sub, `#/$defs/${name}`);
  }

  /* ── LA PASSE DE VALIDATION ────────────────────────────────────────
     Elle COLLECTE, elle ne s'arrête pas au premier manquement : un document
     recopié à la main a rarement une seule faute, et les découvrir une par
     une coûte un aller-retour chacune. Chaque violation nomme son CHEMIN. */
  function check(node, value, at, out) {
    if (node === true) return;
    if (node === false) {
      out.push(`« ${at} » : aucune valeur n'est admise ici (${show(value)}).`);
      return;
    }

    if (node.$ref !== undefined) {
      check(defs[REF_FORM.exec(node.$ref)[1]], value, at, out);
    }

    const types = typesOf(value);

    if (node.type !== undefined) {
      const wanted = Array.isArray(node.type) ? node.type : [node.type];
      if (!wanted.some((name) => types.includes(name))) {
        out.push(`« ${at} » : attendu ${wanted.join(" ou ")}, reçu ${types[0]} (${show(value)}).`);
        return; // inutile d'appliquer des règles de forme à une valeur de mauvais type
      }
    }

    if (node.const !== undefined && JSON.stringify(value) !== JSON.stringify(node.const)) {
      out.push(`« ${at} » : attendu ${show(node.const)}, reçu ${show(value)}.`);
    }
    if (node.enum !== undefined) {
      const wanted = node.enum.map((item) => JSON.stringify(item));
      if (!wanted.includes(JSON.stringify(value))) {
        out.push(`« ${at} » : ${show(value)} n'est pas dans la liste ${wanted.join(", ")}.`);
      }
    }

    if (types.includes("string")) {
      if (node.minLength !== undefined && codePoints(value) < node.minLength) {
        out.push(`« ${at} » : ${codePoints(value)} caractère(s), au moins ${node.minLength} attendu(s).`);
      }
      if (node.maxLength !== undefined && codePoints(value) > node.maxLength) {
        out.push(`« ${at} » : ${codePoints(value)} caractères, ${node.maxLength} au maximum.`);
      }
      if (node.pattern !== undefined && !new RegExp(node.pattern, "u").test(value)) {
        out.push(`« ${at} » : ${show(value)} ne respecte pas sa forme (/${node.pattern}/).`);
      }
    }

    if (types.includes("number")) {
      if (node.minimum !== undefined && value < node.minimum) {
        out.push(`« ${at} » : ${value} est sous le minimum ${node.minimum}.`);
      }
      if (node.maximum !== undefined && value > node.maximum) {
        out.push(`« ${at} » : ${value} dépasse le maximum ${node.maximum}.`);
      }
    }

    if (types.includes("array")) {
      if (node.minItems !== undefined && value.length < node.minItems) {
        out.push(`« ${at} » : ${value.length} élément(s), au moins ${node.minItems} attendu(s).`);
      }
      if (node.items !== undefined) {
        value.forEach((item, index) => check(node.items, item, `${at}[${index}]`, out));
      }
    }

    if (types.includes("object")) {
      const keys = Object.keys(value);
      for (const name of node.required || []) {
        if (!keys.includes(name)) {
          out.push(`« ${at} » : le champ obligatoire « ${name} » manque.`);
        }
      }
      const patterns = node.patternProperties
        ? Object.entries(node.patternProperties).map(([source, sub]) => [new RegExp(source, "u"), sub, source])
        : [];
      for (const name of keys) {
        if (node.propertyNames !== undefined) {
          check(node.propertyNames, name, `${at} (nom de champ « ${name} »)`, out);
        }
        let matched = false;
        if (node.properties && Object.prototype.hasOwnProperty.call(node.properties, name)) {
          matched = true;
          check(node.properties[name], value[name], `${at}.${name}`, out);
        }
        for (const [regex, sub] of patterns) {
          if (!regex.test(name)) continue;
          matched = true;
          check(sub, value[name], `${at}.${name}`, out);
        }
        if (matched || node.additionalProperties === undefined) continue;
        if (node.additionalProperties === false) {
          /* LE REFUS LE PLUS IMPORTANT DU BLOC, et il porte sa raison entière.
             Tous les objets de `fh-char/1` sont fermés : une clef inconnue est
             un rejet bruyant, jamais un champ avalé. C'est par cette porte
             qu'un document chargé d'état de séance est arrêté (leçon n°4). */
          out.push(`« ${at} » : clef inconnue « ${name} » — tous les objets de fh-char/1 sont fermés ` +
            "(additionalProperties: false), aucune clef n'est ignorée en silence. Si c'est de l'état de " +
            "séance (transaction, main, plateau, sélection, historique), il ne voyage pas : il appartient " +
            "au bloc `play` et ne se persiste nulle part (leçon n°4).");
        } else {
          check(node.additionalProperties, value[name], `${at}.${name}`, out);
        }
      }
    }

    if (node.not !== undefined) {
      const trial = [];
      check(node.not, value, at, trial);
      if (trial.length === 0) out.push(`« ${at} » : ${show(value)} est une valeur explicitement refusée ici.`);
    }

    if (node.anyOf !== undefined) {
      const reasons = node.anyOf.map((sub) => { const trial = []; check(sub, value, at, trial); return trial; });
      if (!reasons.some((trial) => trial.length === 0)) {
        out.push(`« ${at} » : ${show(value)} ne satisfait aucune des ${node.anyOf.length} formes admises — ` +
          reasons.map((trial, index) => `(${index + 1}) ${trial[0]}`).join(" ; "));
      }
    }

    if (node.oneOf !== undefined) {
      const reasons = node.oneOf.map((sub) => { const trial = []; check(sub, value, at, trial); return trial; });
      const passing = reasons.filter((trial) => trial.length === 0).length;
      if (passing === 0) {
        out.push(`« ${at} » : ${show(value)} ne satisfait aucune des ${node.oneOf.length} formes admises — ` +
          reasons.map((trial, index) => `(${index + 1}) ${trial[0]}`).join(" ; "));
      } else if (passing > 1) {
        out.push(`« ${at} » : ${show(value)} satisfait ${passing} formes alors qu'une seule est admise — ` +
          "l'ambiguïté est le refus, pas un ordre de priorité.");
      }
    }
  }

  return {
    schema,
    defs,
    /** @returns {string[]} liste vide = conforme ; sinon une phrase par violation. */
    validate(value, at = "document") {
      const out = [];
      check(schema, value, at, out);
      return out;
    }
  };
}

/* ══ LE SCHÉMA DE BROUILLON — DÉRIVÉ, JAMAIS RECOPIÉ (lot 47) ═══════════
   Décision d'architecte (§1b) : « un brouillon est `fh-char/1` MOINS
   `resolved`. Deux schémas presque identiques, c'est deux copies d'une
   règle — et la loi du dépôt est qu'elles divergent sauf si quelque chose
   les compare. » Donc : pas de second fichier `.schema.json`, pas de copie
   à la main de `required` amputée d'une entrée — une fonction qui LIT le
   `required` réel au moment de l'appel et en rend un DÉRIVÉ.

   ⚠️ CE QUI REND LA DÉRIVATION PROUVABLE : `required` est FILTRÉ, jamais
   réécrit à la main. Ajouter demain une clef au `required` de `fh-char/1`
   la rend donc AUSSITÔT required au brouillon aussi (sauf si cette clef
   est précisément `resolved`) — sans qu'une seule ligne d'ici ne bouge.
   Une liste recopiée n'aurait pas cette propriété.

   ⛔ `fh-char.schema.json` LUI-MÊME n'est pas touché : `resolved` y reste
   `required`, pour toujours (§1b — « rendre resolved facultatif dans
   fh-char/1 est REFUSÉ, ça casserait la loi la plus forte du format »).
   Cette fonction rend un objet DIFFÉRENT qui s'inspire du premier ; elle ne
   mute rien de ce qu'on lui passe. */

/**
 * Le schéma de BROUILLON : `fh-char/1`, `resolved` retiré de `required`.
 * Tout le reste — `$defs`, `properties`, chaque contrainte — est le MÊME
 * objet (une copie superficielle seulement) : un document qui PORTE
 * `resolved` reste jugé aussi strictement qu'avant, seule son ABSENCE
 * cesse d'être un refus.
 * @param {object} schema `fh-char.schema.json`, tel qu'injecté par l'appelant.
 */
export function deriveDraftSchema(schema) {
  const required = readFromSchema(schema, ["required"]);
  return { ...schema, required: required.filter((key) => key !== "resolved") };
}

/**
 * Extrait du schéma une valeur qu'on ne recopie donc PAS en code.
 * Jette en nommant le chemin quand elle n'y est pas : un bloc qui devine ce
 * que son contrat ne dit plus n'applique plus son contrat.
 */
export function readFromSchema(schema, route) {
  let node = schema;
  for (const step of route) {
    if (!isPlainObject(node) || node[step] === undefined) {
      fail(`le schéma ne porte pas « ${route.join(".")} » — ce bloc lit sa règle dans le schéma et n'en ` +
        "invente aucune (loi §0.10).");
    }
    node = node[step];
  }
  return node;
}
