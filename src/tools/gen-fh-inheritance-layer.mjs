/* ══ LE GÉNÉRATEUR DE LA COUCHE FH — L'INHERITANCE ═════════════════════
   Lot 184-fh-skills-fendu-en-trois.

   Il prend le canon déclaré (`fh-inheritance-source.mjs`), la couche SRD EN
   commitée et le catalogue des trainings, et il rend
   `layers/fh-inheritance-en.layer.json`.

   🔴 POURQUOI CETTE COUCHE EXISTE. Jusqu'au 08/09 l'origine de Fate's Hand —
   un don gratuit, deux langues, 50 GP — était produite par
   `gen-fh-skills-layer.mjs`, dans une couche nommée « Skills & tools ». Eric,
   en la lisant : *« FH skills contient des feats, LOL »*. `Inheritance` est
   l'un des six interrupteurs de l'écran `Rules` (ARCHITECTURE.md, « La coupe
   des couches ») : l'éteindre doit RENDRE au joueur les quatre arrière-plans
   du SRD, pas lui retirer ses compétences.

   ⚖️ LA DÉPENDANCE, DICTÉE PAR ERIC LE 2026-09-08 : l'Inheritance DÉPEND des
   Trainings. Les deux langues qu'elle offre sont des records de l'autre
   couche, et la liste est RÉSOLUE sur ce que `gen-fh-trainings-layer.mjs`
   produit — jamais recopiée ici. Une treizième langue ajoutée là-bas entre
   dans l'octroi le jour même.
   ⚠️ ET LA DÉPENDANCE SE VOIT AUSSI AU MONTAGE : sans `fh-trainings-en` dans
   la pile, les douze `ref` de l'octroi ne désignent plus rien. Le moteur
   DÉGRADE — `derive.mjs` lit chaque langue par `reader.maybe("training", …)`,
   n'en résout aucune, et déclare `underived.no-language-chosen`. Il ne
   refuse pas le personnage. Mesuré, pas supposé : `tests/fh-inheritance.test.mjs`,
   témoin « l'Inheritance seule ». */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  BACKGROUND_INHERITANCE,
  BACKGROUNDS_EXTINGUISHED,
  EXPECTED,
  FH_INHERITANCE_FLAG,
  LAYER
} from "./fh-inheritance-source.mjs";
/* ⭐ LA LISTE DES LANGUES SE PREND À SA SOURCE, PAS À UNE COPIE. C'est l'autre
   générateur qui les fabrique ; celui-ci les LIT. Deux listes divergeraient le
   jour où une treizième langue arrive — et celle qui diverge est toujours
   celle que personne ne relit. */
import {
  buildLayer as buildTrainingsLayer,
  languesProduites
} from "./gen-fh-trainings-layer.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT_DIR = join(ROOT, "layers");
const OUT_NAME = "fh-inheritance-en.layer.json";
const SRD_PATH = join(ROOT, "layers", "srd-5.2.1-en.layer.json");

/** L'erreur du générateur. Nommée, pour qu'une suite puisse exiger CE
 *  refus-là plutôt que « ça a jeté ». */
export class GenError extends Error {
  constructor(message) {
    super(message);
    this.name = "GenError";
  }
}

const fail = (message) => {
  throw new GenError(message);
};

export function readSrdLayer(path = SRD_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Lit un record du SRD, ou jette en le nommant AVEC son rôle. « le record
 *  visé par l'extinction de l'Acolyte » se corrige ; « record introuvable »
 *  se cherche. */
function srdRecord(srd, kind, id, role) {
  const genre = (srd.records || {})[kind];
  if (!genre) {
    fail(`la couche SRD ne porte aucun genre « ${kind} » — ${role} ne peut pas être écrit.`);
  }
  const record = genre[id];
  if (!record) {
    fail(`la couche SRD ne porte pas « ${id} », visé par ${role}. Une couche ne peut pas retirer ni ` +
      "patcher un record qui n'existe pas : le contrat `layers` en fait un échec bruyant.");
  }
  return record;
}

/* ══ L'ARRIÈRE-PLAN, RETIRÉ — REMPLACÉ PAR L'INHERITANCE (lot 43) ══════
   ⭐ RÉVISÉ 2026-08-13. Le lot 35 avait seulement PATCHÉ les quatre records
   SRD (retrait de `skill_ids`, `tool_id`/`tool_choice`) : ils restaient
   choisissables, avec `ability_keys` et `feat_id` intacts. Addendums §4,
   réécrit le 2026-08-13 : « IL N'Y A PLUS DE RECORD D'ARRIÈRE-PLAN DU TOUT ».
   Les quatre sont donc ÉTEINTS (`op: "disable"`), et la couche EN AJOUTE un
   cinquième : `fh:background:en:inheritance`, le seul arrière-plan de la pile
   Fate's Hand.

   ⛔ LE GARDE QUI COMPTE : le SRD doit porter EXACTEMENT quatre arrière-plans,
   et chacun d'eux doit être éteint. Un cinquième apparu dans une régénération
   de `fh-srd` resterait sinon intact en silence — un arrière-plan choisissable
   de plus est exactement l'arrière-plan que l'Inheritance devait remplacer. */
export function buildBackgrounds(srd, langues) {
  const srdBackgrounds = (srd.records || {}).background || {};
  const srdIds = Object.keys(srdBackgrounds);
  if (srdIds.length !== EXPECTED.backgrounds) {
    fail(`la couche SRD porte ${srdIds.length} arrière-plans, la source en attend ${EXPECTED.backgrounds}. ` +
      "L'Inheritance éteint les quatre du SRD ; un cinquième n'aurait pas d'extinction déclarée.");
  }

  const background = {};
  const servis = new Set();

  for (const entry of BACKGROUNDS_EXTINGUISHED) {
    srdRecord(srd, "background", entry.target, `l'extinction de « ${entry.target} »`);
    if (background[entry.target]) fail(`l'arrière-plan « ${entry.target} » est éteint deux fois.`);
    servis.add(entry.target);
    background[entry.target] = { op: "disable", reason: entry.reason };
  }

  const oubliés = srdIds.filter((id) => !servis.has(id));
  if (oubliés.length > 0) {
    fail(`ces arrière-plans du SRD ne sont pas éteints : ${oubliés.join(", ")}. Un personnage qui les choisit ` +
      "resterait sur un arrière-plan que l'Inheritance devait remplacer.");
  }

  /* ⭐ LOT 182 — CE QUI REMPLACE DOIT PORTER L'OR DE CE QU'IL REMPLACE.
     Les quatre arrière-plans éteints portent chacun `data.equipment`, et son
     option B est l'or de départ de l'origine. L'Inheritance les remplace : si
     elle n'en porte pas, ce montant n'existe plus nulle part dans la donnée et
     un écran finira par le réécrire à la main — c'est EXACTEMENT ce qui s'est
     passé pendant vingt-sept jours (`INHERITED_PURSE_GP = 50`).
     ⛔ Le garde ne vise QUE ce champ, et c'est délibéré : §4 a retiré les
     CHOIX d'arrière-plan (compétences, outil, don imposé, clefs), pas la bourse
     de départ. Exiger `ability_keys` ou `feat_id` contredirait la règle ; exiger
     l'or la sert. ⚠️ Et il se fonde sur la DONNÉE : c'est la couche SRD lue qui
     dit que ce champ existe, pas une liste écrite ici. */
  const sansOr = servis.size > 0
    ? [...servis].filter((id) => typeof ((srdBackgrounds[id] || {}).data || {}).equipment !== "string")
    : [];
  if (sansOr.length === 0 && typeof BACKGROUND_INHERITANCE.equipment !== "string") {
    fail("les quatre arrière-plans éteints portent tous `data.equipment` (leur option B est l'or de départ), " +
      "et `BACKGROUND_INHERITANCE.equipment` n'existe pas. L'Inheritance les remplace : sans ce champ, " +
      "l'or de l'origine ne vit plus dans aucune couche et un écran le réécrira en dur.");
  }

  /* L'INHERITANCE, LA SEULE ADDITION. Pas d'`ability_keys` (§1c : absent =
     les six caractéristiques) ; pas de `feat_id` (imposé) mais un
     `feat_choice.from: "origin"` (libre parmi les dons de cette catégorie). */
  const inheritanceId = BACKGROUND_INHERITANCE.id;
  if (background[inheritanceId]) fail(`« ${inheritanceId} » est déjà un identifiant du SRD — collision.`);
  background[inheritanceId] = {
    name: BACKGROUND_INHERITANCE.name,
    slug: BACKGROUND_INHERITANCE.slug,
    data: {
      name: BACKGROUND_INHERITANCE.name,
      feat_choice: { from: "origin" },
      /* ⭐ LES DEUX LANGUES — la liste est RÉSOLUE, jamais recopiée. Elle vient
         des trainings que `gen-fh-trainings-layer.mjs` produit, dans l'AUTRE
         couche : une treizième langue ajoutée là-bas entre dans l'octroi le
         jour même, sans qu'une seconde liste ait à suivre.
         ⛔ ET LE GARDE EST DANS LE COMPTE : zéro langue produite ferait un
         octroi vide, c'est-à-dire une règle qui ne s'applique à rien. */
      granted_language_choice: {
        ...BACKGROUND_INHERITANCE.languageGrant,
        from: langues
      },
      /* L'or de départ de l'origine, MÊME CHAMP que les quatre du SRD — c'est
         ce qui permet à l'écran de n'avoir qu'un lecteur pour les deux piles. */
      equipment: BACKGROUND_INHERITANCE.equipment,
      description: BACKGROUND_INHERITANCE.description
    }
  };

  return { background, extinguished: servis.size, total: servis.size + 1 };
}

/* ── LE GARDE ANTI-RECOPIE ─────────────────────────────────────────────
   Un record AJOUTÉ par Fate's Hand ne doit pas porter le texte éditorial du
   SRD. Le contrôle est fait sur le RÉSULTAT, pas sur l'intention : une
   recopie faite par distraction dans la source passerait tous les contrôles
   d'intention du monde.

   🔴 ET IL LIT TOUT LE SRD, PAS LE SEUL GENRE DE LA COUCHE — écrit d'abord
   genre contre genre (le patron de `gen-fh-skills-layer.mjs`, où les genres se
   correspondent), il était ici INCAPABLE D'ACCUSER : le SRD 5.2.1 ne porte
   aucun record de genre `training`, et la couche voisine
   (`gen-fh-trainings-layer.mjs`) y était donc AVEUGLE — mesuré en lui tendant
   une vraie phrase du SRD : il ne l'a pas vue. Le même élargissement vaut ici,
   où une phrase d'un `feat` ou d'un `gear` recopiée dans l'Inheritance passait
   sous le radar du seul genre `background`. Un garde qui ne peut jamais accuser est le pire
   de tous ; celui-ci lit désormais la prose de TOUS les genres du SRD.
   ⚠️ ET IL MORD ICI PLUS QU'AILLEURS : les quatre records que cette couche
   éteint sont exactement ceux dont elle reprend l'or. Recopier leur prose en
   même temps que leur montant serait le geste naturel. */
function assertNoHandWrittenSrdText(layer, srd) {
  const srdText = new Set();
  for (const genreSrd of Object.values(srd.records || {})) {
    for (const record of Object.values(genreSrd)) {
      for (const value of Object.values(record.data || {})) {
        if (typeof value === "string" && value.length >= 40) srdText.add(value);
      }
    }
  }
  for (const genre of Object.values(layer.records)) {
    for (const [id, entry] of Object.entries(genre)) {
      if (entry.op === "disable" || entry.op === "patch") continue;
      for (const [field, value] of Object.entries(entry.data || {})) {
        if (typeof value !== "string" || value.length < 40) continue;
        if (srdText.has(value)) {
          fail(`« ${id} » porte dans \`${field}\` une phrase mot pour mot identique à celle d'un record ` +
            "SRD, sans l'avoir déclarée en héritage. Aucune prose du SRD ne s'écrit à la main.");
        }
      }
    }
  }
}

export function buildLayer({ srd }) {
  if (!srd || !srd.records) fail("la couche SRD passée au générateur ne porte pas de `records`.");

  /* ⚠️ LES TRAININGS D'ABORD, ET C'EST UNE DÉPENDANCE RÉELLE, PAS UN GOÛT :
     l'octroi de langues RÉSOUT sa liste sur les trainings produits. Les
     construire après ferait lire un objet vide — et un octroi vide est une
     règle qui ne s'applique à rien. */
  const { trainings } = buildTrainingsLayer({ srd });
  const langues = languesProduites(trainings.training);
  const backgrounds = buildBackgrounds(srd, langues);

  const layer = {
    schema: LAYER.schema,
    id: LAYER.id,
    version: LAYER.version,
    name: LAYER.name,
    lang: LAYER.lang,
    flags: [FH_INHERITANCE_FLAG],
    attribution: {
      license: "all-rights-reserved",
      text: "Original Fate's Hand content: all rights reserved. This layer modifies material from the " +
        "System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at " +
        "https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution " +
        "4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. " +
        "The four SRD backgrounds — Acolyte, Criminal, Sage and Soldier — have been removed from the " +
        "stack and replaced by a single original record, Inheritance."
    },
    description: LAYER.description,
    records: {
      background: backgrounds.background
    }
  };

  assertNoHandWrittenSrdText(layer, srd);

  return { layer, backgrounds, langues };
}

export function serialize(layer) {
  return JSON.stringify(layer, null, 2) + "\n";
}

/** Génère la couche et l'ÉCRIT. `outDir` et `srdPath` sont des arguments : la
 *  suite génère dans un répertoire temporaire et compare là. */
export function generate({ outDir = OUT_DIR, srdPath = SRD_PATH } = {}) {
  const { layer, backgrounds, langues } = buildLayer({ srd: readSrdLayer(srdPath) });
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUT_NAME);
  writeFileSync(outPath, serialize(layer));
  return { outPath, backgrounds, langues };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, backgrounds, langues } = generate();
  console.log(`fh-inheritance : ${backgrounds.extinguished} arrière-plans éteints + l'Inheritance ` +
    `(${backgrounds.total} au genre), ${langues.length} langues offertes → ${outPath}`);
}

export { OUT_NAME, SRD_PATH };
