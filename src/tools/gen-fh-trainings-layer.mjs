/* ══ LE GÉNÉRATEUR DE LA COUCHE FH — LES TRAININGS ═════════════════════
   Lot 184-fh-skills-fendu-en-trois.

   Il prend le canon déclaré (`fh-trainings-source.mjs`) et la couche SRD EN
   commitée, et il rend `layers/fh-trainings-en.layer.json`.

   🔴 POURQUOI CETTE COUCHE EXISTE. Jusqu'au 08/09 les treize trainings étaient
   produits par `gen-fh-skills-layer.mjs`, dans une couche nommée « Skills &
   tools ». Éteindre les langues obligeait donc à éteindre AUSSI le pool de
   points des douze classes. `Trainings` est l'un des six interrupteurs de
   l'écran `Rules` (ARCHITECTURE.md, « La coupe des couches ») : il s'éteint
   seul, ou ce n'est pas un interrupteur.

   ── LES DISCIPLINES DU DÉPÔT, REPRISES ICI ────────────────────────────
   1. LA DESTINATION EST UN ARGUMENT — une suite qui observe la
      reproductibilité doit générer AILLEURS que dans `layers/`, sinon elle
      écrase ce qu'elle mesure.
   2. LA SOURCE SRD EST UN ARGUMENT AUSSI — c'est ce qui permet de prouver un
      refus sur une privation DÉLIBÉRÉE plutôt que sur une pénurie de
      circonstance.
   3. AUCUN REPLI SILENCIEUX (loi §0.5) — ce qu'on croyait trouver et qui n'y
      est pas fait JETER, en le nommant.

   ⚠️ ET CE GÉNÉRATEUR EST LU PAR UN AUTRE. `gen-fh-inheritance-layer.mjs`
   RÉSOUT sa liste de langues sur les trainings que celui-ci produit — jamais
   sur une seconde liste. C'est la dépendance qu'Eric a dictée le 2026-09-08. */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EXPECTED,
  FH_TRAININGS_FLAG,
  LANGUAGE_SPECIES,
  LAYER,
  TRAININGS_ADDED
} from "./fh-trainings-source.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT_DIR = join(ROOT, "layers");
const OUT_NAME = "fh-trainings-en.layer.json";
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

const idOf = (slug) => `fh:training:${LAYER.lang}:${slug}`;

/* ══ LES TRAININGS — LE CATALOGUE, POSÉ ET CONFRONTÉ (lot 82) ═════════
   Douze langues et le Garrot. Ce sont des records NEUFS : aucun n'existe au
   SRD, et ce générateur le VÉRIFIE plutôt que de l'espérer.

   ⛔ LE GARDE QUI COMPTE POUR DE VRAI : les douze langues doivent correspondre
   EXACTEMENT aux douze espèces jouables de la pile. Une espèce ajoutée sans sa
   langue serait un peuple muet, et une langue sans son peuple serait un achat
   qui ne mène nulle part — les deux passeraient sans un mot si on se contentait
   de compter. */
export function buildTrainings(srd, especes = LANGUAGE_SPECIES) {
  /* ⚠️ LE GENRE SRD EST LU, PAS SUPPOSÉ ABSENT. Le SRD 5.2.1 ne porte aucun
     catalogue de langues — mesuré le 2026-08-18 — mais « il n'y en a pas
     aujourd'hui » n'est pas « il n'y en aura jamais » : un `training` arrivé
     au SRD serait ici un AJOUT qui en recouvre un autre, pas une nouveauté. */
  const srdTrainings = (srd.records || {}).training || {};

  const training = {};
  const langues = new Set();

  for (const entry of TRAININGS_ADDED) {
    const id = idOf(entry.slug);
    if (training[id]) fail(`le training « ${id} » est déclaré deux fois par la source.`);
    if (srdTrainings[id]) {
      fail(`le training « ${id} » existe déjà au SRD : ce serait un ajout qui en recouvre un autre, ` +
        "pas une nouveauté.");
    }
    if (!Number.isInteger(entry.cost) || entry.cost < 1) {
      fail(`le training « ${id} » coûte ${entry.cost}, qui n'est pas un nombre entier positif de points. ` +
        "Un training que le moteur ne sait pas tarifer est un training qu'il ne peut pas vendre.");
    }
    if (entry.category === "language") langues.add(entry.slug.replace(/^language-/, ""));
    training[id] = {
      name: entry.name,
      slug: entry.slug,
      data: {
        category: entry.category,
        /* ⛔ LE COÛT VIT ICI, PAS DANS LE MOTEUR. Le jour où Eric passe une
           langue à 2 points, aucun fichier de `src/` ne bouge. */
        cost: entry.cost,
        description: entry.description,
        name: entry.name
        /* PAS de `from_level` : son ABSENCE est la règle générique (niveau 4,
           canon §B.3), et sa PRÉSENCE serait la dérogation. Écrire 4 ici
           rendrait la dérogation indistinguable du défaut. */
      }
    };
  }

  /* LES DOUZE LANGUES CONTRE LES DOUZE ESPÈCES — dans les deux sens. */
  const manquantes = especes.filter((slug) => !langues.has(slug));
  if (manquantes.length > 0) {
    fail(`ces espèces jouables n'ont pas de langue : ${manquantes.join(", ")}. Le canon donne à chaque ` +
      "peuple une langue qui porte son nom ; un peuple muet est du contenu faux, pas du contenu qui manque.");
  }
  const orphelines = [...langues].filter((slug) => !especes.includes(slug));
  if (orphelines.length > 0) {
    fail(`ces langues ne correspondent à aucune espèce jouable : ${orphelines.join(", ")}. Une langue sans ` +
      "son peuple est un achat qui ne mène nulle part.");
  }

  /* ⛔ LES DEUX TOTAUX DÉCLARÉS, CONFRONTÉS SÉPARÉMENT. Le total du genre ne
     dit rien du nombre de LANGUES : treize trainings dont onze langues et deux
     armes passeraient un compte unique sans un mot. */
  const total = Object.keys(training).length;
  if (total !== EXPECTED.trainings) {
    fail(`la couche rend ${total} trainings, la source en attend ${EXPECTED.trainings}. Un training sans ` +
      "chapitre est un achat que le joueur ne peut lire nulle part.");
  }
  if (langues.size !== EXPECTED.languages) {
    fail(`la couche rend ${langues.size} langues, la source en attend ${EXPECTED.languages}.`);
  }

  return { training, total, languages: langues.size };
}

/** Les identifiants des trainings de catégorie `language`, tels que CE
 *  générateur vient de les produire — jamais une seconde liste. C'est la
 *  porte par laquelle `gen-fh-inheritance-layer.mjs` prend sa liste.
 *  ⛔ Zéro langue est un refus : l'octroi de l'Héritage porterait un menu vide,
 *  et le joueur lirait « choisis deux langues » sans en avoir une seule. */
export function languesProduites(training) {
  const ids = Object.entries(training)
    .filter(([, record]) => record.data && record.data.category === "language")
    .map(([id]) => id)
    .sort();
  if (ids.length === 0) {
    fail("aucun training de catégorie `language` n'a été produit : l'octroi de l'Inheritance " +
      "offrirait un menu vide. Une règle qui ne s'applique à rien est pire qu'une règle absente.");
  }
  return ids;
}

/* ── LE GARDE ANTI-RECOPIE ─────────────────────────────────────────────
   Un record AJOUTÉ par Fate's Hand ne doit pas porter le texte éditorial du
   SRD. Le contrôle est fait sur le RÉSULTAT, pas sur l'intention : une
   recopie faite par distraction dans la source passerait tous les contrôles
   d'intention du monde.

   🔴 ET IL LIT TOUT LE SRD, PAS LE SEUL GENRE DE LA COUCHE — écrit d'abord
   genre contre genre (le patron de `gen-fh-skills-layer.mjs`, où les genres se
   correspondent), il était ici INCAPABLE D'ACCUSER : le SRD 5.2.1 ne porte
   aucun record de genre `training`, donc l'ensemble comparé était VIDE et le
   garde restait vert quoi qu'on écrive. Mesuré en lui tendant une vraie phrase
   du SRD : il ne l'a pas vue. Un garde qui ne peut jamais accuser est le pire
   de tous ; celui-ci lit désormais la prose de TOUS les genres du SRD. */
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

  const trainings = buildTrainings(srd);

  const layer = {
    schema: LAYER.schema,
    id: LAYER.id,
    version: LAYER.version,
    name: LAYER.name,
    lang: LAYER.lang,
    flags: [FH_TRAININGS_FLAG],
    /* ⭐ CETTE COUCHE NE TOUCHE À AUCUN RECORD DU SRD — ni retrait, ni patch,
       ni prose reprise. Son attribution le DIT plutôt que de recopier celle de
       `fh-skills-en`, qui, elle, retire Perception et le Gaming Set. */
    attribution: {
      license: "all-rights-reserved",
      text: "Original Fate's Hand content: all rights reserved. This layer adds thirteen records of its " +
        "own and modifies NO material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards " +
        "of the Coast LLC, available at https://www.dndbeyond.com/srd: it rewrites no SRD text, patches " +
        "no SRD record and disables none. The SRD 5.2.1 carries no language catalogue at all — there was " +
        "nothing to take from it, even willingly."
    },
    description: LAYER.description,
    records: {
      training: trainings.training
    }
  };

  assertNoHandWrittenSrdText(layer, srd);

  return { layer, trainings };
}

export function serialize(layer) {
  return JSON.stringify(layer, null, 2) + "\n";
}

/** Génère la couche et l'ÉCRIT. `outDir` et `srdPath` sont des arguments : la
 *  suite génère dans un répertoire temporaire et compare là. */
export function generate({ outDir = OUT_DIR, srdPath = SRD_PATH } = {}) {
  const { layer, trainings } = buildLayer({ srd: readSrdLayer(srdPath) });
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUT_NAME);
  writeFileSync(outPath, serialize(layer));
  return { outPath, trainings };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, trainings } = generate();
  console.log(`fh-trainings : ${trainings.total} trainings (${trainings.languages} langues) → ${outPath}`);
}

export { OUT_NAME, SRD_PATH };
