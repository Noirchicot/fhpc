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

  changes["data.destiny"] = destinyOf(entry);
  if (entry.skillPoints) changes["data[skill_points]"] = structuredClone(entry.skillPoints);
  if (entry.fhTraits) changes["data[fh_traits]"] = structuredClone(entry.fhTraits);

  /* Les chemins sont émis TRIÉS, dans l'ordre même où le pli les appliquera
     (`applyChanges` trie ses clefs). Le fichier se lit alors comme il
     s'exécute. */
  const sorted = {};
  for (const path of Object.keys(changes).sort()) sorted[path] = changes[path];
  return { op: "patch", changes: sorted, note: `Fate's Hand — ${entry.fhName}` };
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
  ["data.description", "la prose SRD de l'espèce"],
  ["data.senses", "les sens SRD, en entier"]
];

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
