/* Lot 95 — génère la couche `srfh` (le RANGEMENT d'Eric) depuis les exports
   fh-srd, en lecture seule.

   `srfh` est la troisième couche du chantier, et elle n'est ni le livre ni
   Fate's Hand : c'est ce qui est AMBIGU — les ajustements de confort qui font
   tourner le système sans amputer personne. Le rangement en fait partie :
   ranger un objet n'est pas une donnée du SRD, et ce n'est pas non plus une
   règle maison.

   ⛔ ELLE HABILLE, ELLE N'APLATIT PAS. Chaque record porte son propre id
   (`srfh:shelving:en:acid`) et un `data.extends` vers le record SRD qu'il
   décrit. Aucun record `srd:` n'est modifié — la couche EMPILE.

   Discipline reprise mot pour mot de `gen-srd-layer.mjs` : le MANIFEST est
   vérifié AVANT tout usage, deux exécutions produisent une sortie
   byte-identique, la sortie est commitée, un re-run laisse l'arbre propre.

   ⚠️ ANGLAIS SEULEMENT, et c'est un FAIT DE LA SOURCE, pas une décision d'ici :
   `exports/srfh/` ne contient qu'un dossier `en`. ⛔ Ne fabrique pas de couche
   française en traduisant — ce serait inventer une source. Une couche FR
   naîtra le jour où fh-srd en publiera une.

   Usage :  node src/tools/gen-srfh-layer.mjs
*/
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

import { GENRES as GENRES_DECLARES } from "../layers/document.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const SRFH_ROOT = join(homedir(), "tools", "fh-srd", "exports");
export const OUT_DIR = join(REPO_ROOT, "layers");

/** Une seule langue, et c'est la source qui le dit. */
export const LANG = "en";
export const LAYER_ID = "srfh-shelving-en";
export const LAYER_VERSION = "0.1.0";

const JSON_EXT = ".json";

/* ══ CE QUE CETTE COUCHE PRODUIT, ET POURQUOI PAS LE RESTE ════════════════

   🔴 `exports/srfh/en/` PORTE DEUX FICHIERS, ET UN SEUL PEUT ÊTRE MONTÉ
   AUJOURD'HUI. Ce n'est pas un choix de périmètre, c'est une mesure :

     shelving.json   416 records, genre `shelving` — un genre à lui, qui
                     n'existe dans aucune autre couche. Il se monte.
     item.json       294 records, genre `item` — LE MÊME GENRE QUE LE SRD.
                     `query({kind:"item"})` rend aujourd'hui 258 vues ; le
                     monter tel quel en rendrait 552, et l'écran d'équipement
                     énumère ce genre. Chaque objet apparaîtrait DEUX FOIS
                     dans le tambour, une fois en `srd:` et une fois en
                     `srfh:`. ⛔ Il lui faut un consommateur qui suive
                     `extends` — c'est un lot, pas une ligne.

   ➡️ DONC LA LISTE EST ÉCRITE, ET ELLE REFUSE AU LIEU DE SAUTER. Un fichier
   `srfh` qui apparaît sans être nommé ici ARRÊTE la génération : c'est
   exactement la faute d'`item-value` (lot 92/93), qui est resté absent d'une
   couche une journée entière parce qu'une liste ne le connaissait pas et
   qu'aucune porte ne s'en plaignait. Une liste qui refuse ne pourrit pas :
   le jour où la source bouge, elle casse et demande une décision. */
export const GENRES_MONTES = ["shelving"];

export const GENRES_AJOURNES = {
  item: "genre déjà porté par la couche SRD (258 vues) — le monter en doublerait " +
        "le catalogue d'équipement. Il lui faut un consommateur qui suive `data.extends`."
};

function readBytes(rel) {
  return readFileSync(join(SRFH_ROOT, rel));
}

function readJson(rel) {
  return JSON.parse(readBytes(rel).toString("utf8"));
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function relPath(genre) {
  return `srfh/${LANG}/${genre}${JSON_EXT}`;
}

/** Ce que le dossier porte VRAIMENT sur le disque. */
export function genresSurDisque(root = SRFH_ROOT) {
  return readdirSync(join(root, "srfh", LANG), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(JSON_EXT))
    .map((e) => e.name.slice(0, -JSON_EXT.length))
    .sort();
}

/** Ce que le MANIFEST déclare sous `srfh/<lang>/`, et rien d'autre. */
export function genresAuManifest(manifest) {
  const prefixe = `srfh/${LANG}/`;
  return manifest.files
    .map((f) => f.path)
    .filter((p) => p.startsWith(prefixe) && p.endsWith(JSON_EXT))
    .map((p) => p.slice(prefixe.length, -JSON_EXT.length))
    .filter((g) => g !== "" && !g.includes("/"))
    .sort();
}

/** Décide ce qui se monte, à partir d'un inventaire — fonction PURE, pour que
 *  les refus s'éprouvent sur un inventaire fabriqué sans salir `fh-srd`.
 *
 *  QUATRE PORTES, aucune ne se traverse en silence. */
export function deriveGenres({ disque, manifest }, {
  montes = GENRES_MONTES, ajournes = GENRES_AJOURNES, declares = GENRES_DECLARES
} = {}) {
  const surDisque = new Set(disque || []);
  const auManifest = new Set(manifest || []);

  /* ① L'INTÉGRITÉ, dans les deux sens. */
  const nonInscrits = [...surDisque].filter((g) => !auManifest.has(g)).sort();
  if (nonInscrits.length) {
    throw new Error(
      `gen-srfh-layer : ${nonInscrits.map(relPath).join(", ")} — présent(s) dans les exports, ` +
      "ABSENT(S) de exports/MANIFEST.json. Un fichier non vérifié n'entre pas dans la couche ; " +
      "il ne se saute pas non plus. Refusé, pas sauté."
    );
  }
  const disparus = [...auManifest].filter((g) => !surDisque.has(g)).sort();
  if (disparus.length) {
    throw new Error(
      `gen-srfh-layer : ${disparus.map(relPath).join(", ")} — inscrit(s) au MANIFEST, ` +
      "INTROUVABLE(S) sur le disque. La source a perdu un export : resynchroniser fh-srd. " +
      "Refusé, pas sauté."
    );
  }

  /* ② RIEN D'INATTENDU. Un fichier `srfh` que personne n'a décidé de monter ni
     d'ajourner arrête tout — c'est la porte qui manquait à `item-value`. */
  const inattendus = [...surDisque]
    .filter((g) => !montes.includes(g) && !Object.hasOwn(ajournes, g))
    .sort();
  if (inattendus.length) {
    throw new Error(
      `gen-srfh-layer : ${inattendus.map(relPath).join(", ")} — fichier(s) srfh que ce générateur ` +
      "ne connaît pas. Décider s'il se monte (l'ajouter à GENRES_MONTES, et ouvrir le genre au " +
      "contrat) ou s'il attend (l'inscrire dans GENRES_AJOURNES avec sa raison). Une liste qui " +
      "refuse ne pourrit pas. Refusé, pas sauté."
    );
  }

  /* ③ CE QU'ON MONTE DOIT EXISTER. Une liste qui nomme un fichier absent
     produirait une couche silencieusement plus pauvre. */
  const manquants = montes.filter((g) => !surDisque.has(g)).sort();
  if (manquants.length) {
    throw new Error(
      `gen-srfh-layer : ${manquants.map(relPath).join(", ")} — attendu(s) par GENRES_MONTES, ` +
      "absent(s) de la source. Refusé, pas sauté."
    );
  }

  /* ④ LE CONTRAT. `fh-layer/1` ferme la porte au reste
     (`additionalProperties: false`) : produire un genre qu'il ne déclare pas
     écrirait une couche que le schéma refuse. */
  const inconnus = montes.filter((g) => !declares.includes(g)).sort();
  if (inconnus.length) {
    throw new Error(
      `gen-srfh-layer : genre(s) inconnu(s) du contrat fh-layer/1 — ${inconnus.join(", ")}. ` +
      "La couche produite ne validerait pas. Ouvrir le genre dans schemas/fh-layer.schema.json ET " +
      "dans src/layers/document.mjs — les deux — puis relancer. Refusé, pas sauté."
    );
  }

  return [...montes].sort();
}

export function lireInventaire(root = SRFH_ROOT) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(root, "MANIFEST.json"), "utf8"));
  } catch (cause) {
    throw new Error(
      `gen-srfh-layer : MANIFEST.json illisible sous ${root} — fh-srd est une dépendance FERME ` +
      `de ce générateur, pas un intrant optionnel. (${cause.message})`
    );
  }
  let disque;
  try {
    disque = genresSurDisque(root);
  } catch (cause) {
    throw new Error(
      `gen-srfh-layer : srfh/${LANG}/ illisible sous ${root} — fh-srd est une dépendance FERME ` +
      `de ce générateur. (${cause.message})`
    );
  }
  return { disque, manifest: genresAuManifest(manifest) };
}

/** Les genres montés, dérivés de la source au chargement du module. */
export const GENRES = deriveGenres(lireInventaire());

export function assertDigestMatches(rel, digest, entry) {
  if (!entry) {
    throw new Error(
      `gen-srfh-layer : ${rel} absent de exports/MANIFEST.json — le MANIFEST doit lister ce fichier avant usage.`
    );
  }
  if (digest !== entry.sha256) {
    throw new Error(
      `gen-srfh-layer : SHA-256 de ${rel} ne correspond pas au MANIFEST ` +
      `(attendu ${entry.sha256}, obtenu ${digest}) — fichier modifié sans régénérer le MANIFEST, ` +
      "ou MANIFEST périmé. Ne pas continuer sur une source non vérifiée."
    );
  }
}

export function verifyManifest() {
  const manifest = readJson("MANIFEST.json");
  const byPath = new Map(manifest.files.map((f) => [f.path, f]));
  for (const genre of GENRES) {
    const rel = relPath(genre);
    assertDigestMatches(rel, sha256(readBytes(rel)), byPath.get(rel));
  }
}

/** Transporte un record fh-srd tel quel dans un geste `add` de fh-layer/1.
 *  ⛔ Identique à celui de `gen-srd-layer` : la licence et l'attribution se
 *  COPIENT depuis la source, jamais retapées ni décidées ici. La couche srfh
 *  se déclare `license: "undecided"` avec sa raison, et c'est fh-srd qui
 *  tranchera — pas ce générateur, et pas en silence. */
function toAddEntry(record) {
  const entry = { name: record.name, data: record.data };
  if (record.slug) entry.slug = record.slug;
  entry.attribution = { license: record.license };
  if (record.attribution) entry.attribution.text = record.attribution;
  if (record.source_id) {
    entry.source = { id: record.source_id };
    if (record.source_locator) entry.source.locator = record.source_locator;
    if (record.srd_version) entry.source.version = record.srd_version;
  }
  if (record.content_hash) entry.contentHash = record.content_hash;
  return entry;
}

export function buildLayer() {
  const records = {};
  const countsByGenre = {};
  let total = 0;
  let meta = null;

  for (const genre of GENRES) {
    const rel = relPath(genre);
    const doc = readJson(rel);
    if (doc.kind !== genre) {
      throw new Error(`gen-srfh-layer : ${rel} annonce kind="${doc.kind}", attendu "${genre}".`);
    }
    if (doc.lang !== LANG) {
      throw new Error(`gen-srfh-layer : ${rel} annonce lang="${doc.lang}", attendu "${LANG}".`);
    }
    if (doc.layer !== "srfh") {
      throw new Error(
        `gen-srfh-layer : ${rel} annonce layer="${doc.layer}", attendu "srfh" — ce générateur ` +
        "ne produit QUE la couche srfh, et un fichier d'une autre couche n'y entre pas."
      );
    }
    if (!meta) meta = doc;

    const genreRecords = {};
    for (const record of doc.records) {
      if (Object.hasOwn(genreRecords, record.id)) {
        throw new Error(`gen-srfh-layer : id de record dupliqué "${record.id}" dans ${rel}.`);
      }
      genreRecords[record.id] = toAddEntry(record);
    }
    records[genre] = genreRecords;
    countsByGenre[genre] = doc.records.length;
    total += doc.records.length;
  }

  const layer = {
    schema: "fh-layer/1",
    id: LAYER_ID,
    version: LAYER_VERSION,
    name: "SRFH — Shelving (EN)",
    lang: LANG,
    flags: [],
    attribution: {
      /* COPIÉE de la source, jamais décidée ici. `undecided` est un FAIT
         porté par la donnée (lot 87 de fh-srd) : ces valeurs ne sont pas dans
         le SRD, donc la licence amont ne les couvre pas, et c'est Eric qui
         tranchera. La « ranger » en `proprietary` répondrait à sa place. */
      license: meta.license,
      text: "Fate's Hand (Eric) — shelving decisions layered over the System Reference " +
            "Document 5.2.1 by Wizards of the Coast LLC. The classification is not part of the SRD.",
      ...(meta.license_url ? { url: meta.license_url } : {})
    },
    description:
      "Le rangement d'Eric : chaque record dit sur quel RAYON et quelle ÉTAGÈRE se trouve " +
      "l'objet SRD qu'il habille (`data.extends`). Couche `srfh` — ni le livre, ni Fate's Hand : " +
      "ce qui est ambigu. EN seulement, comme la source.",
    records
  };

  return { layer, total, countsByGenre };
}

function serialize(layer) {
  return JSON.stringify(layer, null, 2) + "\n";
}

export function generate({ outDir = OUT_DIR } = {}) {
  verifyManifest();
  mkdirSync(outDir, { recursive: true });
  const { layer, total, countsByGenre } = buildLayer();
  const outPath = join(outDir, `${LAYER_ID}.layer.json`);
  writeFileSync(outPath, serialize(layer));
  return { outPath, total, countsByGenre };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, total, countsByGenre } = generate();
  console.log(`${LANG} : ${total} records → ${outPath}`);
  for (const [genre, n] of Object.entries(countsByGenre)) console.log(`   ${genre} : ${n}`);
  for (const [genre, raison] of Object.entries(GENRES_AJOURNES)) {
    console.log(`   ⏳ ajourné — ${genre} : ${raison}`);
  }
}
