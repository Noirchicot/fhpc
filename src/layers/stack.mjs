/* ══ LE BLOC `layers` — LA PILE DE COUCHES ET SON PLI ═══════════════════
   Lot 7-bloc-layers, §L7. Premier maillon du chemin critique du M2 :
   `layers` → `build` → MCP v0.

   ⚠️ NE PAS CONFONDRE AVEC `src/modules/fh/`. Un MODULE MOTEUR est du code
   activé par un drapeau (décision Q4) ; une COUCHE est un document de données
   qui, entre autres, lève ce drapeau. Le nom `src/layers/` a été libéré exprès
   le 2026-08-08 pour ce bloc-ci ; les modules moteur ne reviennent pas.

   CE QUE LE BLOC POSSÈDE
   - ses VERBES : `register`, `enable`, `disable`, `query`, plus `flags`,
     `ruleValues` et `stack` (voir contracts/layers.md — les trois derniers
     sont soumis à ratification, la table du kickoff se dit « échantillon »).
   - son ÉTAT : le contenu des couches montées et LA PILE ACTIVE. L'ordre
     compte : SRD dessous, FH par-dessus, homebrew au-dessus.
   - son ÉVÉNEMENT : `layers-changed`.

   ⚠️ L'ÉTAT N'A AUCUNE SURFACE. L'instance ne rend que `{name, verbs}` — pas
   de `state`, pas de poignée de rouages. Ce n'est pas de la pudeur : c'est la
   seule forme où « personne ne lit l'état d'un autre bloc » est VÉRIFIABLE
   plutôt que promise, et le test d'acceptation §L7 l'exige mot pour mot
   (« sans qu'aucun autre bloc n'ait lu son état »). Tout ce qui est observable
   passe par un verbe ou par l'événement.

   LE PLI, ET LA RAISON DE SON GROS MARTEAU. À chaque changement de pile, le
   pli est RECALCULÉ DE ZÉRO sur les couches actives. C'est plus cher qu'un pli
   incrémental, et c'est le point : « une couche retirée rend ce qu'elle avait
   désactivé » (schéma, $defs/opDisable) est vrai par construction, sans état
   d'annulation à tenir. Mesuré sur la vraie matière (2 613 records, 5,9 Mo) :
   quelques dizaines de millisecondes.

   LE PLI EST TRANSACTIONNEL. Une couche qui échoue au pli (patch dans le vide,
   clef de règle inconnue, deux couches sur la même valeur de règle) est
   DÉMONTÉE et l'erreur remonte : on ne laisse jamais la pile à moitié pliée.

   POURQUOI DES `Map`. Une carte est immunisée contre la pollution de
   prototype : `map.get("__proto__")` ne rend jamais le prototype. Le refus des
   clefs dangereuses est déjà tenu à la lecture (document.mjs) ; la Map est la
   ceinture qui rend la faute impossible même si la bretelle cède. */

import { readLayer, assertGenre, GENRES } from "./document.mjs";
import { applyChanges } from "./paths.mjs";
import { LayerError } from "./document.mjs";

const RECORD_FIELDS = ["name", "slug", "data", "attribution", "source", "contentHash"];

function fail(what) {
  throw new LayerError(`fhpc/layers: ${what}`);
}

/* Le record tel qu'une requête le rend : le contenu du geste `add`, sans son
   `op` — l'opération est de la grammaire de couche, pas du contenu. */
function recordOf(entry) {
  const record = {};
  for (const field of RECORD_FIELDS) {
    if (entry[field] !== undefined) record[field] = entry[field];
  }
  return record;
}

/* Gel profond, mémorisé. Une requête rend une VUE IMMUABLE : le pli partage
   ses records avec les documents analysés, donc un consommateur qui mute ce
   qu'il a reçu corromprait la pile de tout le monde. Le gel est PARESSEUX
   (à la lecture, pas au pli) : geler 2 613 records dont personne ne lira la
   moitié serait payer plein tarif pour une garantie qu'on ne consomme pas. */
const frozen = new WeakSet();
function deepFreeze(value) {
  if (value === null || typeof value !== "object" || frozen.has(value)) return value;
  frozen.add(value);
  for (const item of Array.isArray(value) ? value : Object.values(value)) deepFreeze(item);
  return Object.freeze(value);
}

export function createLayers({ bus, ruleValueKeys } = {}) {
  if (!bus || typeof bus.emit !== "function") {
    fail("createLayers needs a bus — une pile qui change sans l'annoncer est un changement que " +
      "personne ne peut suivre, et `layers-changed` est le seul moyen pour les autres blocs de savoir.");
  }
  /* Les clefs de `ruleValues` que le MOTEUR déclare savoir lire. `null` = rien
     n'a été déclaré, et alors une couche qui porte des valeurs de règle est
     REFUSÉE — refuser ce qu'on ne sait pas vérifier vaut mieux que l'accepter
     sans le vérifier (loi §0.5). ⚠️ Question ouverte n°4 : la correspondance
     entre une clef pointée de couche (`fh.exhaustion`) et une clef de règle du
     moteur (`exhaustionPerLevel`) n'est écrite NULLE PART aujourd'hui, et ce
     lot n'en invente pas (loi §0.10). */
  const declaredRuleKeys = ruleValueKeys === undefined || ruleValueKeys === null
    ? null
    : new Set(ruleValueKeys);

  /* L'état privé du bloc. Aucune de ces trois variables ne sort d'ici. */
  let mountedLayers = [];
  let folded = fold([]);

  /* ── LE PLI ──────────────────────────────────────────────────────────
     Le dernier qui parle gagne. `add` pose, `patch` modifie par id, `disable`
     retire. Un `patch` ou un `disable` qui vise un record absent est un ÉCHEC
     BRUYANT (§L7.2) : sans lui, une couche homebrew écrite pour une autre pile
     s'appliquerait à moitié, en silence, et la table jouerait une fiche fausse. */
  function fold(active) {
    const byGenre = new Map();
    const shadowed = [];
    const flags = [];
    const ruleValues = {};
    const ruleOwner = new Map();

    for (const layer of active) {
      for (const flag of layer.document.flags) {
        if (!flags.includes(flag)) flags.push(flag);
      }

      for (const [key, value] of Object.entries(layer.document.ruleValues || {})) {
        if (declaredRuleKeys === null) {
          fail(`la couche « ${layer.id} » porte la valeur de règle « ${key} », et le moteur n'a déclaré ` +
            "AUCUNE clef de règle (createLayers({ruleValueKeys})) — un réglage qu'on ne sait pas vérifier " +
            "est un réglage qu'on ne peut pas accepter.");
        }
        if (!declaredRuleKeys.has(key)) {
          fail(`la couche « ${layer.id} » règle « ${key} », que le moteur ne connaît pas ` +
            `(clefs déclarées : ${[...declaredRuleKeys].join(", ") || "aucune"}) — une faute de frappe dans un ` +
            "homebrew ne devient pas un réglage ignoré en silence.");
        }
        if (ruleOwner.has(key)) {
          fail(`« ${ruleOwner.get(key)} » et « ${layer.id} » règlent toutes deux « ${key} » — ` +
            "deux couches sur la même valeur de règle est une ambiguïté, pas un ordre de priorité.");
        }
        ruleOwner.set(key, layer.id);
        ruleValues[key] = value;
      }

      for (const [genre, entries] of Object.entries(layer.document.records)) {
        let records = byGenre.get(genre);
        if (!records) {
          records = new Map();
          byGenre.set(genre, records);
        }
        for (const [id, entry] of Object.entries(entries)) {
          const op = entry.op === undefined ? "add" : entry.op;
          const current = records.get(id);

          if (op === "add") {
            /* « Le dernier qui parle gagne » vaut aussi ici — mais un `add` qui
               en recouvre un autre est RAPPORTÉ dans `layers-changed`. Un
               recouvrement qu'on n'aurait pas voulu doit être visible sans
               qu'on ait à le deviner. ⚠️ Question ouverte n°2. */
            if (current) {
              shadowed.push({ kind: genre, id, by: layer.id, over: current.provenance.from });
            }
            records.set(id, {
              kind: genre, id,
              record: recordOf(entry),
              provenance: { from: layer.id, patchedBy: [] }
            });
            continue;
          }

          if (op === "patch") {
            if (!current) {
              fail(`la couche « ${layer.id} » patche ${genre} « ${id} », qui n'est dans aucune couche ` +
                "sous elle — un patch dans le vide est un échec, pas un silence (§L7.2).");
            }
            const where = `la couche « ${layer.id} », patch de ${genre} « ${id} »`;
            const { record, applied } = applyChanges(current.record, entry.changes, where);
            /* Le contentHash certifie le contenu CHEZ SA SOURCE. Le record
               vient d'être modifié : le certificat ne le décrit plus, il tombe.
               Le laisser serait affirmer une intégrité qu'on vient de rompre. */
            delete record.contentHash;
            records.set(id, {
              kind: genre, id,
              record,
              provenance: {
                from: current.provenance.from,
                patchedBy: current.provenance.patchedBy.concat({ by: layer.id, applied })
              }
            });
            continue;
          }

          /* disable */
          if (!current) {
            fail(`la couche « ${layer.id} » désactive ${genre} « ${id} », qui n'est dans aucune couche ` +
              "sous elle — désactiver ce qui n'existe pas est une faute de frappe, et elle se dit.");
          }
          records.delete(id);
        }
      }
    }

    const counts = {};
    let total = 0;
    for (const [genre, records] of byGenre) {
      if (records.size === 0) continue;
      counts[genre] = records.size;
      total += records.size;
    }
    return { byGenre, shadowed, flags: flags.slice().sort(), ruleValues, counts, total };
  }

  /* ── LA PILE ─────────────────────────────────────────────────────────
     L'ORDRE EST CELUI DE L'ENREGISTREMENT. `register` empile ; `enable` et
     `disable` ne déplacent rien, ils font seulement participer ou non une
     couche à sa place. ⚠️ Question ouverte n°1 : le kickoff dit que l'ordre
     compte sans dire qui le pose ; ce lot ne fabrique pas de verbe de
     réordonnancement pour un besoin que personne n'a encore formulé (§0.6). */
  function activeLayers() {
    return mountedLayers.filter((layer) => layer.enabled);
  }

  function manifest() {
    return mountedLayers.map((layer) => ({
      id: layer.id,
      version: layer.document.version,
      hash: layer.hash,
      name: layer.document.name,
      lang: layer.document.lang,
      enabled: layer.enabled,
      flags: layer.document.flags.slice(),
      records: layer.total
    }));
  }

  /* Recalcule, et ne COMMET que si le pli tient. Sur un échec, la pile revient
     exactement où elle était : jamais de pile à moitié pliée. */
  function commit(nextLayers) {
    const previous = mountedLayers;
    mountedLayers = nextLayers;
    try {
      folded = fold(activeLayers());
    } catch (error) {
      mountedLayers = previous;
      throw error;
    }
  }

  function announce(reason) {
    bus.emit("layers-changed", {
      reason,
      stack: manifest(),
      counts: Object.assign({}, folded.counts),
      total: folded.total,
      flags: folded.flags.slice(),
      ruleValues: Object.assign({}, folded.ruleValues),
      shadowed: folded.shadowed.slice()
    });
  }

  function layerAt(id, verb) {
    const layer = mountedLayers.find((item) => item.id === id);
    if (!layer) {
      fail(`${verb} : aucune couche « ${id} » n'est montée (pile : ${
        mountedLayers.map((item) => item.id).join(", ") || "vide"}).`);
    }
    return layer;
  }

  /* ── LES VERBES ──────────────────────────────────────────────────── */

  const verbs = {
    /* Monte une couche depuis SES OCTETS. L'empreinte rendue est le SHA-256 de
       ces octets : c'est elle, et rien d'autre, que `build.layers[].hash`
       transporte (schéma fh-char/1). */
    register(payload) {
      const options = payload || {};
      if (options.bytes === undefined) {
        fail("register attend `{bytes}` — les octets du fichier de couche. " +
          "Le bloc ne lit pas le disque : lire un fichier appartient à qui le possède, " +
          "et l'empreinte ne survit qu'aux octets d'origine.");
      }
      const origin = options.origin || "(couche sans nom de fichier)";
      const { document, hash, total, counts } = readLayer(options.bytes, origin);

      const twice = mountedLayers.find((layer) => layer.id === document.id);
      if (twice) {
        fail(`la couche « ${document.id} » est déjà montée (empreinte ${twice.hash.slice(0, 12)}…) — ` +
          "monter deux fois la même couche est ce que `charInvariantViolations` refuse dans un document, " +
          "et la pile ne le tolère pas davantage.");
      }

      commit(mountedLayers.concat({ id: document.id, document, hash, origin, total, counts, enabled: true }));
      announce("register");
      return { id: document.id, version: document.version, hash, name: document.name, lang: document.lang, records: total };
    },

    enable(payload) {
      const id = (payload || {}).id;
      const layer = layerAt(id, "enable");
      if (layer.enabled) return { id, enabled: true, changed: false };
      commit(mountedLayers.map((item) => (item === layer ? Object.assign({}, item, { enabled: true }) : item)));
      announce("enable");
      return { id, enabled: true, changed: true };
    },

    /* ⚠️ `disable` LE VERBE retire une COUCHE de la pile active ; `op:"disable"`
       DANS une couche retire un RECORD. Deux gestes, un seul mot — la
       confusion se paye, donc elle se nomme ici et dans le contrat. */
    disable(payload) {
      const id = (payload || {}).id;
      const layer = layerAt(id, "disable");
      if (!layer.enabled) return { id, enabled: false, changed: false };
      commit(mountedLayers.map((item) => (item === layer ? Object.assign({}, item, { enabled: false }) : item)));
      announce("disable");
      return { id, enabled: false, changed: true };
    },

    /* LE SEUL CHEMIN DE LECTURE DU CONTENU (§L7.1).
       `{kind, id}` → une vue immuable, ou `null`. `{kind}` → toutes les vues du
       genre. Un genre hors des 14 JETTE : une requête sur `spel` rendrait une
       liste vide, et une liste vide ressemble à une réponse. */
    query(payload) {
      const { kind, id } = payload || {};
      assertGenre(kind);
      const records = folded.byGenre.get(kind);
      if (id === undefined || id === null) {
        /* La LISTE est gelée elle aussi. Trouvé en attaquant ce garde : les
           vues étaient immuables et le tableau qui les portait ne l'était pas.
           Un tableau frais à chaque appel rendait la faute inoffensive — mais
           « immuable » qui vaut à moitié n'est pas une promesse, c'est un
           usage qu'on découvre en le violant. */
        return deepFreeze(records ? [...records.values()].map(deepFreeze) : []);
      }
      if (typeof id !== "string") fail(`query : l'id doit être une chaîne (reçu ${typeof id}).`);
      const view = records && records.get(id);
      return view ? deepFreeze(view) : null;
    },

    /* Les DRAPEAUX levés par la pile active : « ce module tourne-t-il ? ».
       Séparés des valeurs de règle exprès (révision du 2026-08-08). */
    flags() {
      return deepFreeze(folded.flags.slice());
    },

    /* Les VALEURS DE RÈGLE : « quel nombre le moteur applique-t-il ? ». */
    ruleValues() {
      return deepFreeze(Object.assign({}, folded.ruleValues));
    },

    /* La pile telle qu'elle est montée, dans l'ordre. C'est ce que le bloc
       `build` recopiera dans `build.layers[]` — `{id, version, hash}` y sont
       exactement les trois champs requis par fh-char/1. */
    stack() {
      return deepFreeze(manifest());
    }
  };

  return { name: "layers", verbs };
}

export { GENRES };
