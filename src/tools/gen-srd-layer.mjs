/* Lot 4-couche-srd — génère les deux couches fh-layer/1 du SRD 5.2.1 (FR, EN)
   depuis les exports fh-srd (lecture seule, jamais modifiés).

   Discipline reprise de fh-srd (kickoff §L4.3) : deux exécutions produisent
   une sortie byte-identique, la sortie est commitée, un re-run laisse l'arbre
   propre. Le MANIFEST est vérifié avant tout usage — un mismatch nomme le
   fichier fautif et jette, il ne se corrige pas en silence (loi §0.5).

   ⚠️ Les deux langues du SRD n'ont AUCUNE clé de jointure (kickoff §L4, mesuré
   par l'architecte) : aucune correspondance FR↔EN n'est inventée ici. Les deux
   couches restent strictement autonomes, chacune déclarant sa langue. Voir
   layers/TRADUCTION.md.

   Usage :  node src/tools/gen-srd-layer.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const SRD_ROOT = join(homedir(), "tools", "fh-srd", "exports");
export const OUT_DIR = join(REPO_ROOT, "layers");

/* Les 14 genres fh-srd (kickoff §L4 : 12 + `skill` + `class-progression`
   ajoutés par le lot 6-srd-tables). Ordre alphabétique — celui du schéma
   fh-layer/1 et des dossiers d'export. */
export const GENRES = [
  "armor", "background", "class", "class-progression", "feat", "gear",
  "glossary", "item", "monster", "skill", "species", "spell", "tool", "weapon"
];
export const LANGS = ["fr", "en"];
const SRD_VERSION = "5.2.1";

function relPath(lang, genre) {
  return `srd/${lang}/${genre}.json`;
}

function readBytes(rel) {
  return readFileSync(join(SRD_ROOT, rel));
}

function readJson(rel) {
  return JSON.parse(readBytes(rel).toString("utf8"));
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Vérifie un digest contre son entrée MANIFEST et jette, en NOMMANT le
 *  fichier, si l'entrée manque ou si le SHA-256 diverge. Fonction pure
 *  (aucun accès disque) pour rester testable sans dépendre de fh-srd. */
export function assertDigestMatches(rel, digest, entry) {
  if (!entry) {
    throw new Error(
      `gen-srd-layer : ${rel} absent de exports/MANIFEST.json — le MANIFEST doit lister ce fichier avant usage.`
    );
  }
  if (digest !== entry.sha256) {
    throw new Error(
      `gen-srd-layer : SHA-256 de ${rel} ne correspond pas au MANIFEST ` +
      `(attendu ${entry.sha256}, obtenu ${digest}) — fichier modifié sans régénérer le MANIFEST, ` +
      `ou MANIFEST périmé. Ne pas continuer sur une source non vérifiée.`
    );
  }
}

/** Jette bruyamment, en nommant le fichier, au premier SHA-256 qui ne colle
 *  pas au MANIFEST. Ne vérifie que les 28 fichiers que ce générateur lit —
 *  `exclusions.json` n'est pas un intrant de ce lot. */
export function verifyManifest() {
  const manifest = readJson("MANIFEST.json");
  const byPath = new Map(manifest.files.map((f) => [f.path, f]));
  for (const lang of LANGS) {
    for (const genre of GENRES) {
      const rel = relPath(lang, genre);
      assertDigestMatches(rel, sha256(readBytes(rel)), byPath.get(rel));
    }
  }
}

/** Transporte un record fh-srd tel quel dans un geste `add` de fh-layer/1. */
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

/** Construit la couche fh-layer/1 d'une langue. Ne mélange jamais deux
 *  langues (invariant fh-layer/1 §$comment lang). */
export function buildLayer(lang) {
  const records = {};
  const countsByGenre = {};
  let total = 0;
  let sourceMeta = null;

  for (const genre of GENRES) {
    const rel = relPath(lang, genre);
    const doc = readJson(rel);
    if (doc.kind !== genre) {
      throw new Error(`gen-srd-layer : ${rel} annonce kind="${doc.kind}", attendu "${genre}".`);
    }
    if (doc.lang !== lang) {
      throw new Error(`gen-srd-layer : ${rel} annonce lang="${doc.lang}", attendu "${lang}".`);
    }
    if (!sourceMeta) sourceMeta = doc.source;

    const genreRecords = {};
    for (const record of doc.records) {
      if (Object.hasOwn(genreRecords, record.id)) {
        throw new Error(`gen-srd-layer : id de record dupliqué "${record.id}" dans ${rel}.`);
      }
      genreRecords[record.id] = toAddEntry(record);
    }
    records[genre] = genreRecords;
    countsByGenre[genre] = doc.records.length;
    total += doc.records.length;
  }

  const layer = {
    schema: "fh-layer/1",
    id: `srd-${SRD_VERSION}-${lang}`,
    version: SRD_VERSION,
    name: `SRD ${SRD_VERSION} (${lang.toUpperCase()})`,
    lang,
    flags: [],
    attribution: {
      license: sourceMeta.license,
      text: sourceMeta.attribution,
      url: sourceMeta.license_url
    },
    records
  };

  return { layer, total, countsByGenre };
}

function serialize(layer) {
  return JSON.stringify(layer, null, 2) + "\n";
}

export function generate() {
  verifyManifest();
  mkdirSync(OUT_DIR, { recursive: true });
  const results = {};
  for (const lang of LANGS) {
    const { layer, total, countsByGenre } = buildLayer(lang);
    const outPath = join(OUT_DIR, `srd-${SRD_VERSION}-${lang}.layer.json`);
    writeFileSync(outPath, serialize(layer));
    results[lang] = { outPath, total, countsByGenre };
  }
  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = generate();
  for (const [lang, { outPath, total }] of Object.entries(results)) {
    console.log(`${lang} : ${total} records → ${outPath}`);
  }
}
