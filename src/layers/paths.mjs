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
      fantôme au lieu d'une faute de frappe visible.

   ══ LE RETRAIT — lot 17-couche-fh-retrait, 2026-08-08 ═══════════════════

   LE MANQUE, MESURÉ. Un `patch` savait poser et modifier, pas SUPPRIMER. Une
   couche ne pouvait donc pas retirer une aptitude qu'une couche du dessous
   accorde — et le lot 15 a eu raison de refuser de le faire à la main :
   réécrire `data.traits` en entier pour en ôter un élément aurait recopié le
   texte SRD des traits gardés, qui aurait divergé au premier mouvement du SRD.

   LA FORME, DÉCIDÉE PAR L'ARCHITECTE : une clef SŒUR de `changes` dans
   `opPatch`, `remove`, qui porte une LISTE DE CHEMINS de la même grammaire.

     { "op": "patch", "remove": ["data.traits[resourceful]"] }

   POURQUOI CETTE FORME ET PAS UNE AUTRE :
   · **pas de valeur sentinelle**, et surtout pas de `null` qui voudrait dire
     « retire » — `null` est une valeur JSON légitime, et confondre « pose
     null » avec « retire » est l'ambiguïté qui se paye trois mois plus tard ;
   · **une liste de chemins**, symétrique de `changes`, avec la MÊME grammaire
     — donc l'identité, jamais l'index.

   L'ORDRE : LE RETRAIT S'APPLIQUE AVANT `changes`, ET C'EST DÉMONTRABLE.
   Les deux clefs peuvent coexister dans un même patch, et alors l'une des deux
   passe d'abord. Le critère n'est pas le goût : c'est **lequel des deux ordres
   rend une contradiction BRUYANTE**.

     · retrait d'abord — retirer X puis écrire sous X échoue en nommant le
       chemin (l'intermédiaire n'existe plus) ; et créer X par `changes` puis
       le retirer échoue aussi, parce que le retrait passe avant la création et
       ne vise rien. **Les deux sens de la contradiction crient.**
     · `changes` d'abord — les deux mêmes patchs réussissent et s'annulent
       l'un l'autre EN SILENCE. Le patch se contredit, personne ne l'entend.

   Le retrait décrit d'ailleurs l'état de DÉPART (ce que la couche du dessous
   accordait), `changes` l'état d'ARRIVÉE : les lire dans cet ordre, c'est lire
   le patch dans le sens où il a été pensé.

   L'ORDRE INTERNE DES RETRAITS EST CELUI DE LA LISTE, et non un tri. `changes`
   est une CARTE, dont l'ordre ne se lit pas à l'œil : d'où son tri (règle 10 du
   contrat). Un tableau, lui, PORTE déjà un ordre — celui que l'auteur a écrit.
   Le trier serait remplacer une intention lisible par une convention.

   TROIS RÈGLES DE PLUS, ET LEUR RAISON :

   4. **Un retrait qui ne vise rien est un ÉCHEC BRUYANT qui nomme le chemin.**
      Même doctrine que le patch dans le vide (loi §0.5, §L7.2) : sans elle,
      une couche écrite pour une autre pile s'appliquerait à moitié, en
      silence, et la table jouerait une fiche fausse.

   5. **Les interdits du patch valent pour le retrait.** On ne retire ni
      `attribution` (une couche ne décroche pas la notice CC-BY d'un record
      dont elle dérive — loi §0.8), ni `source`, ni `contentHash`. La liste des
      racines est la même, et c'est le point : un interdit qui ne vaudrait que
      pour l'écriture se contournerait par la suppression.

   6. **On ne retire pas une RACINE entière** (`data`, `name`, `slug` seuls).
      Ce n'est pas une préférence : `fh-layer/1` EXIGE `name` et `data` sur un
      record (`$defs/opAdd.required`). Un pli qui les ôterait produirait un
      record que le schéma dont il sort ne saurait pas exprimer. `slug` y est
      joint par symétrie — le refus est réversible vers le laxisme, l'inverse
      ne l'est pas (même raisonnement que l'arbitrage n°2 du contrat). */

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

/* La racine visée est-elle ouverte ? La MÊME liste fermée pour l'écriture et
   pour le retrait : un interdit qui ne vaudrait que pour l'écriture se
   contournerait par la suppression. `verbe` n'est là que pour que le message
   dise ce qu'on essayait de faire. */
function assertPatchableRoot(segments, { path, where, verbe }) {
  if (!ROOT_SET.has(segments[0].value)) {
    fail(where, `« ${segments[0].value} » n'est pas patchable — un patch ${verbe} ${PATCHABLE_ROOTS.join(", ")} ` +
      "et rien d'autre : l'attribution, la source et le contentHash d'un record ne se réécrivent pas " +
      `et ne se retirent pas depuis une couche (chemin « ${path} »).`);
  }
}

/* Descend jusqu'au PORTEUR du dernier segment. `missing` fabrique le message :
   un intermédiaire absent ne veut pas dire la même chose selon qu'on écrivait
   ou qu'on retirait, et un rejet qui oblige à deviner coûte le prix qu'il
   prétend économiser. */
function descend(target, segments, { path, where, missing }) {
  let container = target;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const step = locate(container, segments[i], { path, where, prefix: show(segments, i - 1) || "le record" });
    if (step.missing) fail(where, missing(show(segments, i)));
    container = step.holder[step.key];
  }
  return container;
}

/** Applique UNE valeur sur un record déjà cloné. Mute le clone, jamais le
 *  record d'origine — le clonage est du ressort de l'appelant (`applyPatch`).
 *  Rend `{path, created}` : `created` vaut vrai quand la clef n'existait pas. */
export function applyChange(target, path, value, where = "un patch") {
  const segments = parseChangePath(path, where);
  assertPatchableRoot(segments, { path, where, verbe: "touche" });

  const container = descend(target, segments, {
    path, where,
    missing: (prefix) => `« ${prefix} » n'existe pas dans le record — le chemin « ${path} » ne peut pas être créé ` +
      "en profondeur : une couche ne devine pas la forme qu'elle voudrait trouver."
  });

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

/** RETIRE ce qu'un chemin désigne, sur un record déjà cloné. Rend `{path}`.
 *
 *  Sur un objet, la clef part (`delete`). Sur une collection, l'élément TROUVÉ
 *  PAR IDENTITÉ est ôté (`splice`) : c'est la même règle que partout ici — on
 *  désigne par l'identité, jamais par le rang. Retirer plusieurs éléments d'une
 *  même liste marche donc sans surprise, puisque aucun retrait ne s'appuie sur
 *  la position d'un autre.
 *
 *  Ce qui ne vise RIEN jette, en nommant le chemin. C'est la seule façon qu'une
 *  couche écrite pour une autre pile a d'être vue avant la table. */
export function applyRemoval(target, path, where = "un retrait") {
  const segments = parseChangePath(path, where);
  assertPatchableRoot(segments, { path, where, verbe: "retire dans" });

  if (segments.length === 1) {
    fail(where, `« ${path} » retirerait une racine entière du record — ` +
      `un retrait vise ce qui est DANS le record, pas le record : fh-layer/1 exige name et data ` +
      "sur tout record, et un pli qui les ôterait produirait un record que son propre schéma " +
      "ne saurait pas exprimer.");
  }

  const container = descend(target, segments, {
    path, where,
    missing: (prefix) => `« ${prefix} » n'existe pas dans le record — le retrait « ${path} » ne vise rien, ` +
      "et un retrait dans le vide est un échec, pas un silence (§L7.2)."
  });

  const last = segments[segments.length - 1];
  const seat = locate(container, last, { path, where, prefix: show(segments, segments.length - 2) || "le record" });
  if (seat.missing) {
    fail(where, `« ${path} » ne vise rien dans le record — un retrait dans le vide est un échec, ` +
      "pas un silence (§L7.2) : une couche qui retire une aptitude déjà absente a été écrite pour " +
      "une autre pile, et il vaut mieux l'apprendre ici qu'à la table.");
  }
  if (Array.isArray(seat.holder)) seat.holder.splice(seat.key, 1);
  else delete seat.holder[last.value];
  return { path };
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

/** UN PATCH ENTIER sur une COPIE du record : ses retraits, PUIS ses
 *  modifications. L'ordre est démontré dans l'en-tête de ce fichier — c'est le
 *  seul des deux qui fasse crier un patch qui se contredit, dans les deux sens.
 *
 *  Rend `{record, applied, removed}`. `removed` est toujours présent, vide
 *  compris : une forme de provenance qui apparaît et disparaît selon le contenu
 *  oblige chaque lecteur à la tester avant de la lire. */
export function applyPatch(record, entry, where = "un patch") {
  const patched = structuredClone(record);
  const removed = [];
  for (const path of entry.remove || []) removed.push(applyRemoval(patched, path, where).path);
  const applied = [];
  const changes = entry.changes || {};
  for (const path of Object.keys(changes).sort()) {
    applied.push(applyChange(patched, path, changes[path], where));
  }
  return { record: patched, applied, removed };
}
