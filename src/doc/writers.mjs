/* ══ LES ÉCRIVAINS PURS DE `doc` — SANS MAGASIN ═════════════════════════
   Lot 54-ecrans-concept-univers, §1 de sa commande.

   ── LE TROU QUE CE FICHIER FERME ────────────────────────────────────────
   `doc.rename` (le nom) et `doc.describe` (genre, alignement, nom de code
   de campagne) sont les deux verbes qui écrivent les champs que les écrans
   Concept et Universe doivent poser. Mesuré par l'architecte : ni l'un ni
   l'autre ne touche le magasin (le lot 47 l'écrit noir sur blanc pour
   `rename` — « pur : ne touche ni le magasin ni build.choices » — et
   `describe` est bâti pareil, lot 48) — mais avant ce lot, les deux
   n'existaient QUE dans la fermeture de `createDoc({storage, …})`
   (`store.mjs`), qui REFUSE de se construire sans magasin (`store.mjs:83`).
   Le navigateur n'a aucun magasin `fh-char/1` (voir la tête de
   `store.mjs`, D1) : monter `doc` dans le builder avec un faux magasin en
   mémoire publierait `doc.save` dans une page où enregistrer ne garde
   rien — arbitrage ferme de l'architecte, refusé.

   Ce module extrait donc la PARTIE de `createDoc` qui ne dépend QUE du
   schéma — jamais du magasin, jamais du bus — et la rend importable
   directement : `ui/builder/` peut appeler `createDocWriters({schema}).
   rename`/`.describe` sans jamais construire de bloc `doc`.

   ── LA RÈGLE QUI EMPÊCHE LA DIVERGENCE ──────────────────────────────────
   `store.mjs` n'écrit plus AUCUNE ligne de logique de `rename`/`describe` :
   il importe `createDocWriters` et pose ses fonctions TELLES QUELLES comme
   verbes (`verbs.rename = writers.rename`). Le verbe du bloc et la fonction
   importable par l'écran sont donc LE MÊME OBJET FONCTION — jamais deux
   copies qui pourraient un jour dire des choses différentes sur le même
   payload. C'est `tests/doc-writers.test.mjs` qui le prouve, par identité
   de référence ET par identité de comportement sur un corpus commun,
   refus compris. */

import { DocError } from "./errors.mjs";
import { compileSchema, deriveDraftSchema, describableFields, readFromSchema } from "./schema.mjs";
import { charInvariantViolations } from "../schemas/invariants.mjs";

function fail(what) {
  throw new DocError(`fhpc/doc: ${what}`);
}

/**
 * Construit les deux écrivains PURS de `doc` à partir du seul SCHÉMA —
 * aucun magasin, aucun bus, aucune horloge : `rename`/`describe` n'en ont
 * besoin d'aucun (§1 de la commande du lot 54).
 *
 * @param {object} opts
 * @param {object} opts.schema le document `fh-char/1` (`schemas/fh-char.schema.json`), chargé par l'appelant
 * @returns {{
 *   rename: (payload: {document: object, name: string}) => object,
 *   describe: (payload: {document: object, [field: string]: *}) => object,
 *   assertValid: (document: object, origin: string) => object,
 *   DESCRIBABLE_FIELDS: string[],
 *   SCHEMA_TAG: string
 * }}
 */
export function createDocWriters({ schema } = {}) {
  if (!schema || typeof schema !== "object") {
    fail("createDocWriters needs a schema — le document `fh-char/1`, chargé par l'appelant. Ni `rename` ni " +
      "`describe` ne touchent le magasin, mais tous deux VALIDENT ce qu'ils écrivent (décision D3), et un " +
      "validateur sans schéma ne saurait pas ce qu'il accepte.");
  }

  /* MÊME DÉRIVATION QUE `store.mjs` (lot 47, §1b/§2c) : le validateur admet
     un document `fh-char/1` COMPLET comme un BROUILLON (sans `resolved`) —
     un seul validateur pour les deux formes, parce que « brouillon » est un
     sur-ensemble strict de `required`, jamais un allègement d'un champ
     présent. `rename`/`describe` doivent accepter les deux formes : un
     joueur peut renommer son personnage avant que `build.rebuild` n'ait
     jamais réussi. */
  const compiled = compileSchema(deriveDraftSchema(schema), "fh-char/1 (brouillon dérivé, §1b)");
  const SCHEMA_TAG = readFromSchema(schema, ["properties", "schema", "const"]);
  /* LOT 48, §1b — LA LISTE BLANCHE DE `describe`, LUE UNE FOIS, JAMAIS
     RECOPIÉE : voir `describableFields`, `src/doc/schema.mjs`. */
  const DESCRIBABLE_FIELDS = describableFields(schema);

  /** LE SEUL CHEMIN D'ADMISSION — identique à celui de `store.mjs` (même
   *  raison d'être : « rien n'entre dans un document sans valider `fh-char/1`
   *  », invariant 2 du contrat). Un refus NOMME toutes ses raisons d'un coup. */
  function assertValid(document, origin) {
    if (document === null || typeof document !== "object" || Array.isArray(document)) {
      fail(`${origin} : un document \`${SCHEMA_TAG}\` est un objet.`);
    }
    if (document.schema !== SCHEMA_TAG) {
      fail(`${origin} : le document déclare \`schema\` = ${JSON.stringify(document.schema)} — ce bloc ` +
        `n'ouvre que des documents \`${SCHEMA_TAG}\`. Un schéma inconnu n'est pas un document à moitié ` +
        "compatible : c'est un document dont on ne sait rien.");
    }
    const violations = compiled.validate(document, "document")
      .concat(charInvariantViolations(document));
    if (violations.length > 0) {
      fail(`${origin} : le document ne valide pas contre \`${SCHEMA_TAG}\` — ${violations.length} refus :\n- ` +
        violations.join("\n- "));
    }
    return document;
  }

  /** LOT 47, §2b/§1d — `document.name` s'écrit ICI, PAS par `build.set` :
   *  `name` n'est pas un point de décision de `build.choices` (rien ne le
   *  « consomme » jamais). Pure : ne touche ni le magasin ni `build.choices`.
   *  `document` peut être un brouillon ou un personnage complet (§2c) ; la
   *  sortie est validée comme toute admission — un nom vide ou de plus de
   *  200 caractères est un refus NOMMÉ, jamais un silence. */
  function rename(payload) {
    const options = payload || {};
    const { document, name } = options;
    if (document === null || typeof document !== "object" || Array.isArray(document)) {
      fail("rename attend `{document, name}` — un document `fh-char/1` (brouillon ou complet) et le nom à " +
        "écrire à sa racine.");
    }
    if (typeof name !== "string") {
      fail(`rename : \`name\` doit être une chaîne, reçu ${name === undefined ? "(absent)" : typeof name}.`);
    }
    const renamed = structuredClone(document);
    renamed.name = name;
    assertValid(renamed, "rename");
    return structuredClone(renamed);
  }

  /** LOT 48, §1b — les champs d'IDENTITÉ que `rename` ne porte pas (genre,
   *  alignement, nom de code de campagne), et tout autre champ que le
   *  schéma déclarera demain facultatif et descriptif à la racine, SANS
   *  qu'une ligne d'ici ne bouge (`DESCRIBABLE_FIELDS`, lue dans le schéma).
   *  ⚔️ Toute clef HORS de cette liste est un refus NOMMÉ. Un champ omis du
   *  payload n'est PAS effacé. Pure comme `rename`. */
  function describe(payload) {
    const options = payload || {};
    const { document, ...fields } = options;
    if (document === null || typeof document !== "object" || Array.isArray(document)) {
      fail("describe attend `{document, ...}` — un document `fh-char/1` (brouillon ou complet) et les " +
        "champs descriptifs à écrire à sa racine.");
    }
    const unknown = Object.keys(fields).filter((key) => !DESCRIBABLE_FIELDS.includes(key));
    if (unknown.length > 0) {
      fail(`describe : ${unknown.map((key) => `« ${key} »`).join(", ")} — le schéma ne déclare ` +
        `${unknown.length > 1 ? "aucun de ces champs" : "pas ce champ"} facultatif et descriptif à la ` +
        "racine (§1b : la liste blanche mord dans les deux sens). Champs acceptés aujourd'hui : " +
        `${DESCRIBABLE_FIELDS.length > 0 ? DESCRIBABLE_FIELDS.join(", ") : "aucun"}.`);
    }
    const described = structuredClone(document);
    for (const key of DESCRIBABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) described[key] = fields[key];
    }
    assertValid(described, "describe");
    return structuredClone(described);
  }

  /* ══ LES CONFIRMATIONS — Eric, 2026-08-19 ═════════════════════════════════
     *« Si je fais back sur un item, ça ne valide pas l'item […]. Il faut faire
     done pour valider un item. Il faut faire le done du guide spécifique pour
     tout valider. »*

     ⭐ POSER UNE VALEUR ET LA CONFIRMER SONT DEUX GESTES. Un lignage peut être
     choisi et l'item rester éteint : le joueur est reparti par `Back`. Les
     deux faits vivent donc à deux endroits — la valeur dans `build.choices`,
     la confirmation dans `build.confirmed` — et rien ne les synchronise, parce
     que leur divergence EST l'information.

     ⛔ CES DEUX VERBES NE TOUCHENT JAMAIS `build.choices`. Annuler un choix est
     le travail du bloc `build` (`clear`), qui sait ce qu'un choix entraîne.
     Ici on ne fait qu'écrire, ou effacer, une signature.

     ⚠️ L'UNICITÉ EST TENUE ICI, ET PAS DANS LE SCHÉMA : le validateur maison
     refuse `uniqueItems`, qu'il n'implémente pas — et il a raison de refuser
     plutôt que de l'ignorer. Ce verbe est le seul chemin d'écriture, donc le
     seul endroit où l'unicité peut se tenir. */

  function lireConfirmes(document) {
    const build = document && document.build;
    return build && Array.isArray(build.confirmed) ? build.confirmed : [];
  }

  function ecrireConfirmes(document, chemins, origine) {
    const suivant = structuredClone(document);
    suivant.build = { ...suivant.build };
    /* TRIÉS. Deux sessions qui confirment dans un ordre différent doivent
       produire le MÊME document — sinon l'octet du fichier bouge sans qu'une
       seule décision ait changé, et tout garde d'empreinte devient du bruit. */
    suivant.build.confirmed = [...new Set(chemins)].sort();
    assertValid(suivant, origine);
    return structuredClone(suivant);
  }

  /** Le joueur a cliqué `Done` sur ce chemin. Idempotent : re-confirmer ne
   *  change rien, et surtout ne duplique pas. */
  function confirm(payload) {
    const { document, path } = payload || {};
    if (document === null || typeof document !== "object" || Array.isArray(document)) {
      fail("confirm attend `{document, path}` — un document `fh-char/1` et le chemin que le joueur vient de " +
        "valider (`species`, `species.lineage`…).");
    }
    if (typeof path !== "string" || path.length === 0) {
      fail(`confirm : \`path\` doit être une chaîne non vide, reçu ${path === undefined ? "(absent)" : typeof path}.`);
    }
    return ecrireConfirmes(document, [...lireConfirmes(document), path], "confirm");
  }

  /** `I changed my mind` — la signature du chemin ET de tout ce qui vit
   *  dessous s'efface d'un coup.
   *
   *  ⚠️ LA MÊME GRAMMAIRE DE PRÉFIXE QUE LE CARNET (`multiPlan`, décisions) :
   *  `species` emporte `species.lineage` et `species.skills[0]`, jamais
   *  `speciesXYZ`. Un préfixe qui mordrait sur un voisin effacerait la
   *  confirmation d'une AUTRE étape — silencieusement. */
  function revoke(payload) {
    const { document, path } = payload || {};
    if (document === null || typeof document !== "object" || Array.isArray(document)) {
      fail("revoke attend `{document, path}` — un document `fh-char/1` et la racine à effacer.");
    }
    if (typeof path !== "string" || path.length === 0) {
      fail(`revoke : \`path\` doit être une chaîne non vide, reçu ${path === undefined ? "(absent)" : typeof path}.`);
    }
    const sous = (chemin) => chemin === path ||
      chemin.startsWith(`${path}.`) || chemin.startsWith(`${path}[`);
    return ecrireConfirmes(document, lireConfirmes(document).filter((c) => !sous(c)), "revoke");
  }

  /** Ce chemin porte-t-il la signature du joueur ? Lu, jamais déduit. */
  function isConfirmed(document, path) {
    return lireConfirmes(document).includes(path);
  }

  return { rename, describe, confirm, revoke, isConfirmed, assertValid, DESCRIBABLE_FIELDS, SCHEMA_TAG, compiled };
}
