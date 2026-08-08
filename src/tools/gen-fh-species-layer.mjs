/* ══ LE GÉNÉRATEUR DE LA COUCHE FH — ESPÈCES ═══════════════════════════
   Lot 15-couche-fh-especes.

   Il prend le canon déclaré (`fh-species-source.mjs`) et la couche SRD EN
   commitée, et il rend `layers/fh-species-en.layer.json`.

   TROIS DISCIPLINES, ET CHACUNE EST UN PIÈGE DÉJÀ PAYÉ DANS CE DÉPÔT :

   1. LA DESTINATION EST UN ARGUMENT, jamais une constante que seul le disque
      peut recevoir. `gen-srd-layer` avait sa destination en dur, et la suite
      qui vérifiait sa reproductibilité n'avait pas d'autre moyen que d'écraser
      `layers/` pour l'observer — deux passes d'affilée rendaient alors deux
      verdicts différents sans qu'une ligne ait changé (TRAPS.md, lot 13).

   2. LA SOURCE SRD EST UN ARGUMENT AUSSI. C'est ce qui permet à la suite de
      prouver un refus sur une PRIVATION DÉLIBÉRÉE — une couche SRD amputée
      d'un trait — au lieu d'une pénurie de circonstance. Une preuve qui ne
      tient qu'à la pauvreté de sa source cesse de prouver le jour où la
      source s'enrichit, et elle cesse EN RESTANT VERTE (TRAPS.md, lots 8→13).

   3. AUCUN REPLI SILENCIEUX. Un trait qu'on croyait trouver dans le SRD et
      qui n'y est pas fait JETER le générateur en le nommant, lui et son
      espèce. Sans quoi une espèce neuve perdrait une aptitude en silence et
      la table jouerait une fiche fausse (loi §0.5).

   ── AJOUT DU LOT 17 : LES DESCRIPTIONS SE RECALCULENT ────────────────
   Eric veut le texte du Hoddon et de l'Elfe corrigés. Patcher
   `data.description`, c'est RECOPIER la prose du SRD — l'architecte l'a dit à
   Eric et l'assume. Le prix se paie donc autrement : la source DÉCLARE des
   substitutions (le motif cherché, le texte posé, et pourquoi), et c'est ICI
   qu'on lit le texte SRD courant pour les appliquer. Aucune phrase du SRD
   n'est écrite à la main nulle part.

   Deux alarmes, et elles ne gardent pas la même chose :
   · une substitution qui NE TROUVE PAS sa cible jette, en nommant le motif —
     c'est ce qui transforme une dérive silencieuse en alarme ;
   · un mot que le résultat NE DOIT PLUS PORTER (`mustNotContain`) est relu sur
     le texte final — parce qu'une phrase NEUVE ajoutée par le SRD laisserait
     tous les motifs déclarés satisfaits et ferait quand même dire « Gnome » au
     Hoddon.

   Usage :  node src/tools/gen-fh-species-layer.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  LAYER, SPECIES, SRD_LAYER_ID, DESTINY_BASE,
  KEEN_SENSES_SKILLS, KEEN_SENSES_TEXT, srdSpeciesId
} from "./fh-species-source.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const OUT_DIR = join(REPO_ROOT, "layers");
export const SRD_PATH = join(REPO_ROOT, "layers", "srd-5.2.1-en.layer.json");
export const OUT_NAME = `${LAYER.id}.layer.json`;

class GenError extends Error {}

function fail(what) {
  throw new GenError(`gen-fh-species-layer : ${what}`);
}

/* ── LA SOURCE SRD ───────────────────────────────────────────────────── */

/** Lit la couche SRD EN commitée. Le chemin est un argument : la suite lui en
 *  donne un autre pour l'attaquer. */
export function readSrdLayer(srdPath = SRD_PATH) {
  return JSON.parse(readFileSync(srdPath, "utf8"));
}

/** Vérifie que la couche fournie est bien celle sous laquelle cette couche-ci
 *  se monte. Une couche d'espèces FH posée sur une autre base ne veut rien
 *  dire, et le silence coûterait plus cher que le refus. */
export function assertSrdLayer(srd) {
  if (!srd || typeof srd !== "object") fail("la couche SRD attendue est un document fh-layer/1 analysé.");
  if (srd.id !== SRD_LAYER_ID) {
    fail(`la couche SRD fournie a l'id « ${srd.id} », attendu « ${SRD_LAYER_ID} » — ` +
      "cette couche d'espèces se monte sur cette base-là et sur aucune autre.");
  }
  if (!srd.records || !srd.records.species) {
    fail(`la couche « ${srd.id} » ne porte aucun record du genre species — rien à quoi s'accrocher.`);
  }
  return srd;
}

/** Le record d'espèce SRD d'un slug, ou un échec qui le NOMME. */
export function srdSpecies(srd, slug) {
  const id = srdSpeciesId(slug);
  const record = srd.records.species[id];
  if (!record) {
    fail(`l'espèce SRD « ${id} » est absente de la couche « ${srd.id} » — ` +
      "la couche FH ne peut ni la patcher ni y puiser un trait.");
  }
  return record;
}

/** Un trait d'une espèce SRD, CLONÉ, ou un échec qui nomme le trait ET son
 *  espèce. C'est le cœur de la discipline n°3 : une espèce neuve ne perd
 *  jamais une aptitude en silence. */
export function liftTrait(srd, slug, traitId) {
  const record = srdSpecies(srd, slug);
  const traits = (record.data && record.data.traits) || [];
  const found = traits.find((trait) => trait && trait.id === traitId);
  if (!found) {
    fail(`le trait « ${traitId} » est absent de l'espèce SRD « ${srdSpeciesId(slug)} » ` +
      `(traits présents : ${traits.map((t) => t && t.id).join(", ") || "aucun"}) — ` +
      "une espèce FH qui hérite d'un trait SRD ne le recopie pas, elle le prend ; " +
      "s'il n'y est plus, il faut le dire, pas l'inventer.");
  }
  return structuredClone(found);
}

/** Un champ de `data` d'une espèce SRD, CLONÉ, ou un échec qui le nomme. */
export function liftField(srd, slug, field) {
  const record = srdSpecies(srd, slug);
  if (!record.data || !Object.hasOwn(record.data, field)) {
    fail(`le champ « data.${field} » est absent de l'espèce SRD « ${srdSpeciesId(slug)} » — ` +
      "la couche FH y puisait sa valeur plutôt que d'en inventer une.");
  }
  return structuredClone(record.data[field]);
}

/** Le trait visé existe-t-il chez la cible d'un patch ? Sinon, échec nommé.
 *  Le pli le refuserait aussi, mais plus tard et sur une couche déjà écrite :
 *  mieux vaut ne jamais produire un patch qui ne peut pas s'appliquer. */
function assertTargetTrait(srd, target, traitId, why) {
  const record = srd.records.species[target];
  if (!record) {
    fail(`la couche FH patche « ${target} », qui n'est pas dans la couche « ${srd.id} ».`);
  }
  const traits = (record.data && record.data.traits) || [];
  if (!traits.some((trait) => trait && trait.id === traitId)) {
    fail(`${why} : le trait « ${traitId} » est absent de « ${target} » ` +
      `(traits présents : ${traits.map((t) => t && t.id).join(", ") || "aucun"}) — ` +
      "un patch qui vise un trait disparu s'appliquerait dans le vide.");
  }
}

function assertTargetField(srd, target, field, why) {
  const record = srd.records.species[target];
  if (!record) fail(`la couche FH patche « ${target} », qui n'est pas dans la couche « ${srd.id} ».`);
  if (!record.data || !Object.hasOwn(record.data, field)) {
    fail(`${why} : le champ « data.${field} » est absent de « ${target} » — patch dans le vide.`);
  }
}

/* ── LES DESCRIPTIONS, RECALCULÉES ───────────────────────────────────── */

/** Applique une liste de substitutions à un texte. NE JETTE PAS : rend le
 *  texte obtenu et la liste des motifs INTROUVABLES. Séparer le calcul du
 *  refus est ce qui permet au même code de servir au générateur (qui jette) et
 *  au garde anti-recopie (qui rapporte) — et d'être attaqué sans être piégé. */
export function substitute(text, substitutions) {
  const misses = [];
  let out = text;
  for (const sub of substitutions) {
    if (!out.includes(sub.find)) {
      misses.push(sub);
      continue;
    }
    out = out.split(sub.find).join(sub.put);
  }
  return { text: out, misses };
}

/** Les mots interdits qui SURVIVENT dans un texte. Le second filet : une
 *  phrase neuve du SRD laisserait tous les motifs déclarés satisfaits et ferait
 *  quand même dire « Gnome » au Hoddon. */
export function survivors(text, mustNotContain = []) {
  return mustNotContain.filter((word) => text.includes(word));
}

/** Le `data.description` du record VISÉ, lu dans le SRD et re-substitué.
 *  Jette en nommant le record, le motif et la RAISON DÉCLARÉE — une alarme qui
 *  ne dit pas pourquoi la substitution existait oblige à retrouver l'intention. */
export function describedBy(srd, target, description, who) {
  const record = srd.records.species[target];
  if (!record) fail(`la couche FH décrit « ${target} », qui n'est pas dans la couche « ${srd.id} ».`);
  const source = record.data && record.data.description;
  if (typeof source !== "string") {
    fail(`« ${target} » n'a pas de data.description dans la couche « ${srd.id} » — ` +
      `la description de « ${who} » se calcule DEPUIS ce texte, elle ne s'invente pas.`);
  }

  const { text, misses } = substitute(source, description.substitutions);
  if (misses.length > 0) {
    fail(`description de « ${who} » (${target}) : ` +
      misses.map((sub) => `le motif « ${sub.find} » est introuvable dans le texte SRD ` +
        `(substitution déclarée parce que : ${sub.why})`).join(" ; ") +
      ". Le SRD a bougé sous la substitution : c'est une dérive, et elle se dit — " +
      "on ne recopie pas la prose, on la recalcule, et une substitution qui rate ne s'ignore pas.");
  }

  const restants = survivors(text, description.mustNotContain);
  if (restants.length > 0) {
    fail(`description de « ${who} » (${target}) : le texte obtenu porte encore ${
      restants.map((word) => `« ${word} »`).join(", ")} — toutes les substitutions déclarées ont ` +
      "pourtant trouvé leur cible, donc le SRD porte une phrase que personne n'avait vue. " +
      "Il faut une substitution de plus, pas un mot fermé les yeux.");
  }
  return text;
}

/* ── LA DESTINÉE D'UN RECORD ─────────────────────────────────────────── */

/** `{base}` pour onze espèces ; l'Elfe y ajoute son bonus, NOMMÉ par le trait
 *  qui le donne. La Base reste 2 partout — sans quoi « Base 2 pour les douze »
 *  serait faux dans les données mêmes qui prétendent le dire. */
function destinyOf(entry) {
  const destiny = { base: DESTINY_BASE };
  if (entry.destinyBaseBonus) {
    destiny.base_bonus = entry.destinyBaseBonus.value;
    destiny.base_bonus_trait = entry.destinyBaseBonus.trait;
  }
  return destiny;
}

/* ── LES TRAITS D'UNE ESPÈCE NEUVE ───────────────────────────────────── */

/** Un trait déclaré tel quel, ou pris dans le SRD (avec, au besoin, le seul
 *  texte que FH change). Triés par id à la fin : c'est la convention de huit
 *  des neuf records d'espèce du SRD, et un ordre stable rend la sortie
 *  reproductible sans qu'on ait à y penser. */
function traitsOf(srd, entry) {
  const traits = entry.traits.map((declared) => {
    if (!declared.lift) return structuredClone(declared);
    const trait = liftTrait(srd, declared.lift.from, declared.lift.trait);
    if (declared.text !== undefined) trait.text = declared.text;
    return trait;
  });
  return traits.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/* ── LES DEUX GESTES ─────────────────────────────────────────────────── */

/** Une espèce neuve : un record `add` qui se tient tout seul.
 *  Les clefs de `data` sont posées dans l'ordre alphabétique du SRD — la
 *  sortie de `gen-srd-layer` l'est aussi, et deux artefacts du même genre qui
 *  se lisent pareil s'auditent ensemble. */
function addEntry(srd, entry) {
  const data = {};
  const lifted = {};
  for (const field of entry.lift.fields) lifted[field] = liftField(srd, entry.lift.from, field);

  data.creature_type = lifted.creature_type;
  if (entry.grantedSkillChoice) data.granted_skill_choice = structuredClone(entry.grantedSkillChoice);
  else if (lifted.granted_skill_choice) data.granted_skill_choice = lifted.granted_skill_choice;
  data.name = entry.fhName;
  data.senses = liftField(srd, entry.senses.from, "senses");
  data.size = entry.size;
  data.size_key = entry.size_key;
  data.speed = lifted.speed;
  data.speed_ft = lifted.speed_ft;
  data.traits = traitsOf(srd, entry);
  if (entry.skillPoints) data.skill_points = structuredClone(entry.skillPoints);
  data.destiny = destinyOf(entry);

  return { name: entry.fhName, slug: entry.slug, data };
}

/** Une espèce SRD : un `patch` qui ne porte QUE la différence.
 *
 *  ⚠️ POURQUOI LES TRAITS FH NE VONT PAS DANS `data.traits`. Un chemin de
 *  patch désigne un élément de collection par son IDENTITÉ, et il n'en crée
 *  jamais un (`paths.mjs` : « on désigne un élément existant, on n'en crée pas
 *  un par un chemin »). Ajouter un trait à un record SRD supposerait donc de
 *  RÉÉCRIRE tout le tableau — c'est-à-dire de recopier le texte SRD des traits
 *  qu'on ne touche pas, et de le laisser diverger. La couche pose ses traits
 *  dans `data.fh_traits`, et la règle de lecture est totale et sans exception :
 *  **les traits d'une espèce sont `data.traits` puis `data.fh_traits`.**
 *
 *  `data[fh_traits]` s'écrit entre crochets parce que la grammaire de chemin
 *  n'admet pas le souligné dans un segment pointé (contracts/layers.md,
 *  point ouvert n°5, ajourné). Idem pour `skill_points` et
 *  `granted_skill_choice`. */
function patchEntry(srd, entry) {
  const changes = {};
  /* LES RETRAITS. Ils sortent dans l'ordre déclaré par la source — un tableau
     porte déjà l'ordre que son auteur a écrit, là où `changes` est une carte
     qu'on trie (contrat `layers`, invariant 10). Chaque trait visé est vérifié
     PRÉSENT ici : le pli le refuserait aussi, mais plus tard et sur une couche
     déjà écrite. */
  const remove = [];
  for (const traitId of entry.removeTraits || []) {
    assertTargetTrait(srd, entry.target, traitId, `retrait de « ${entry.fhName} »`);
    remove.push(`data.traits[${traitId}]`);
  }

  if (entry.rename) {
    changes["name"] = entry.rename.name;
    changes["slug"] = entry.rename.slug;
    changes["data.name"] = entry.rename.name;
    for (const [traitId, traitName] of Object.entries(entry.rename.traits || {})) {
      assertTargetTrait(srd, entry.target, traitId, `renommage de « ${entry.fhName} »`);
      changes[`data.traits[${traitId}].name`] = traitName;
    }
  }

  if (entry.keenSenses) {
    assertTargetTrait(srd, entry.target, "keen-senses", `Keen Senses de « ${entry.fhName} »`);
    assertTargetField(srd, entry.target, "granted_skill_choice", `Keen Senses de « ${entry.fhName} »`);
    changes["data.traits[keen-senses].text"] = KEEN_SENSES_TEXT;
    changes["data[granted_skill_choice].from"] = KEEN_SENSES_SKILLS.slice();
  }

  /* LA DESCRIPTION. Elle n'est jamais écrite ici : elle est LUE dans le SRD et
     re-substituée (voir `describedBy`). Le jour où le SRD retouche ce texte,
     la substitution le suit — ou elle rate, et alors elle crie. */
  if (entry.description) {
    changes["data.description"] = describedBy(srd, entry.target, entry.description, entry.fhName);
  }

  changes["data.destiny"] = destinyOf(entry);
  if (entry.skillPoints) changes["data[skill_points]"] = structuredClone(entry.skillPoints);
  if (entry.fhTraits) changes["data[fh_traits]"] = structuredClone(entry.fhTraits);

  /* Les chemins sont émis TRIÉS, dans l'ordre même où le pli les appliquera
     (`applyPatch` trie les clefs de `changes`). Le fichier se lit alors comme
     il s'exécute — et `remove`, qui passe AVANT dans le pli, est écrit avant. */
  const sorted = {};
  for (const path of Object.keys(changes).sort()) sorted[path] = changes[path];
  const patch = { op: "patch" };
  if (remove.length > 0) patch.remove = remove;
  patch.changes = sorted;
  patch.note = `Fate's Hand — ${entry.fhName}`;
  return patch;
}

/* ── LE GARDE « ON NE RECOPIE PAS LE SRD » (décision D1) ─────────────── */

/** Les chemins qu'un patch de CETTE couche n'a pas le droit d'écrire : ceux
 *  qui remplaceraient un bloc SRD entier au lieu d'en changer un détail. Une
 *  règle recopiée diverge un jour de son original ; ici la faute se voit.
 *
 *  Rendre la LISTE plutôt qu'asserter sur place, pour que la même fonction
 *  serve au garde et à l'attaque du garde. */
export const WHOLESALE_PATHS = [
  ["data.traits", "le tableau des traits SRD, en entier"],
  ["data.senses", "les sens SRD, en entier"]
];

/* ⚠️ `data.description` ÉTAIT DANS CETTE LISTE, ET N'Y EST PLUS (lot 17).
   Ce n'est pas un relâchement : c'est un déplacement vers un garde PLUS
   SERRÉ. L'interdit d'origine disait « n'écris pas ce chemin » ; il empêchait
   la recopie en interdisant la correction, et Eric voulait la correction.
   Le garde qui le remplace (`handWrittenDescriptions`) ne demande pas si le
   chemin est écrit — il demande si le texte écrit est bien CELUI QUE LES
   SUBSTITUTIONS DÉCLARÉES PRODUISENT à partir du SRD courant. Une phrase
   posée à la main dans un fichier de couche échoue à cette question, et une
   copie figée qui ne suit plus le SRD y échoue aussi. */

export function wholesaleRecopies(layer) {
  const hits = [];
  for (const [id, entry] of Object.entries(layer.records.species)) {
    if (entry.op !== "patch") continue;
    for (const path of Object.keys(entry.changes)) {
      for (const [forbidden, label] of WHOLESALE_PATHS) {
        if (path === forbidden) hits.push({ id, path, label });
      }
    }
  }
  return hits;
}

/** Le refus, séparé de la détection — pour que la suite puisse ATTAQUER l'un
 *  et l'autre. Le générateur d'aujourd'hui ne peut pas produire une recopie ;
 *  un garde qu'on ne peut donc jamais voir rougir ne serait qu'une intention,
 *  et ce dépôt en a déjà payé le prix. Le garde est donc nourri d'une couche
 *  truquée dans la suite, et il doit jeter en nommant le record ET le chemin. */
export function assertNoWholesale(layer) {
  const recopies = wholesaleRecopies(layer);
  if (recopies.length > 0) {
    fail("cette couche recopierait le SRD au lieu de le patcher — " +
      recopies.map((hit) => `${hit.id} → ${hit.path} (${hit.label})`).join(" ; ") +
      ". Une règle recopiée diverge un jour de son original (décision D1).");
  }
  return layer;
}

/* ── LE GARDE « AUCUNE PROSE ÉCRITE À LA MAIN » (lot 17) ─────────────── */

/** L'index des substitutions déclarées, par record visé. */
function declaredDescriptions() {
  const byTarget = new Map();
  for (const entry of SPECIES) {
    if (entry.description) byTarget.set(entry.target, entry);
  }
  return byTarget;
}

/** Les descriptions d'une couche qui NE SONT PAS re-dérivables du SRD courant
 *  par les substitutions déclarées. Rend la LISTE plutôt que d'asserter sur
 *  place, pour que la même fonction serve au garde et à l'attaque du garde.
 *
 *  Trois façons d'y figurer, et chacune est une vraie faute :
 *  · un record décrit sans qu'aucune substitution soit déclarée pour lui —
 *    quelqu'un a écrit de la prose à la main ;
 *  · une substitution qui ne trouve plus sa cible dans le SRD ;
 *  · un texte qui n'est pas celui que les substitutions produisent — une copie
 *    figée qui a cessé de suivre sa source. */
export function handWrittenDescriptions(layer, srd) {
  const declared = declaredDescriptions();
  const hits = [];
  for (const [id, entry] of Object.entries(layer.records.species)) {
    if (entry.op !== "patch" || !entry.changes) continue;
    if (!Object.hasOwn(entry.changes, "data.description")) continue;

    const source = declared.get(id);
    if (!source) {
      hits.push({ id, why: "aucune substitution n'est déclarée pour ce record — cette prose a été écrite à la main" });
      continue;
    }
    const record = srd.records.species[id];
    const srdText = record && record.data && record.data.description;
    if (typeof srdText !== "string") {
      hits.push({ id, why: `le SRD n'a plus de data.description pour ce record — rien d'où re-dériver` });
      continue;
    }
    const { text, misses } = substitute(srdText, source.description.substitutions);
    if (misses.length > 0) {
      hits.push({ id, why: `substitution introuvable dans le SRD : ${misses.map((s) => `« ${s.find} »`).join(", ")}` });
      continue;
    }
    if (entry.changes["data.description"] !== text) {
      hits.push({ id, why: "le texte de la couche n'est pas celui que les substitutions déclarées produisent" });
    }
  }
  return hits;
}

/** Le refus, séparé de la détection — même discipline que `assertNoWholesale`. */
export function assertNoHandWritten(layer, srd) {
  const hits = handWrittenDescriptions(layer, srd);
  if (hits.length > 0) {
    fail("une description de cette couche n'est pas re-dérivable du SRD — " +
      hits.map((hit) => `${hit.id} : ${hit.why}`).join(" ; ") +
      ". On ne recopie pas la prose du SRD, on déclare la substitution et on la recalcule.");
  }
  return layer;
}

/* ── LA COUCHE ───────────────────────────────────────────────────────── */

/** Construit le document `fh-layer/1`. `srd` est la couche SRD EN ANALYSÉE :
 *  c'est un argument pour que la suite puisse en fournir une amputée. */
export function buildLayer({ srd } = {}) {
  assertSrdLayer(srd);

  const species = {};
  for (const entry of SPECIES) {
    if (entry.op === "add") {
      if (Object.hasOwn(species, entry.id)) fail(`id de record dupliqué « ${entry.id} ».`);
      species[entry.id] = addEntry(srd, entry);
      continue;
    }
    if (Object.hasOwn(species, entry.target)) fail(`id de record dupliqué « ${entry.target} ».`);
    species[entry.target] = patchEntry(srd, entry);
  }

  const layer = {
    schema: "fh-layer/1",
    id: LAYER.id,
    version: LAYER.version,
    name: LAYER.name,
    lang: LAYER.lang,
    flags: LAYER.flags.slice().sort(),
    attribution: structuredClone(LAYER.attribution),
    description: LAYER.description,
    records: { species }
  };

  assertNoWholesale(layer);
  assertNoHandWritten(layer, srd);

  return { layer, total: Object.keys(species).length };
}

export function serialize(layer) {
  return JSON.stringify(layer, null, 2) + "\n";
}

/** Génère la couche et l'ÉCRIT. `outDir` et `srdPath` sont des arguments : la
 *  suite génère dans un répertoire temporaire et compare là. */
export function generate({ outDir = OUT_DIR, srdPath = SRD_PATH } = {}) {
  const { layer, total } = buildLayer({ srd: readSrdLayer(srdPath) });
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUT_NAME);
  writeFileSync(outPath, serialize(layer));
  return { outPath, total };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, total } = generate();
  console.log(`fh-species : ${total} records → ${outPath}`);
}

export { GenError };
