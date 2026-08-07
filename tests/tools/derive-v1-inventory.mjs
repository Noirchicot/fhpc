/* Dérive tests/fixtures/v1-build-field-inventory.json depuis les sept personnages
   FH v1 réels de ~/tools/fh-phb/builds/*.fh.json (kickoff §7).

   Pourquoi une fixture et pas une lecture directe dans les tests : les sept
   fichiers vivent hors du dépôt et contiennent du contenu Fate's Hand, qui n'a
   rien à faire dans un dépôt public (loi §0.8). L'inventaire ne retient que les
   CHEMINS et les TYPES — jamais une valeur — ce qui suffit au test d'acceptation
   du schéma et ne reproduit aucun contenu.

   Usage :  node tests/tools/derive-v1-inventory.mjs [dossier-des-builds]
   Sans argument : ~/tools/fh-phb/builds. Échec bruyant si le dossier est absent
   ou vide — cet outil ne devine pas.
*/
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "fixtures", "v1-build-field-inventory.json");
const DEFAULT_DIR = join(homedir(), "tools", "fh-phb", "builds");

/* Cartes à clefs libres : la clef est une donnée (un nom de compétence), pas un
   champ de schéma. On la normalise pour que l'inventaire reste un inventaire de
   FORME, et pour ne pas transporter la liste des compétences FH. */
const FREE_KEY_MAPS = new Set(["nativeSkillTiers", "builderState.tiers"]);

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value === "number" ? "number" : typeof value;
}

function walk(node, prefix, acc, file) {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return;
  for (const [rawKey, value] of Object.entries(node)) {
    const key = FREE_KEY_MAPS.has(prefix) ? "<clef>" : rawKey;
    const path = prefix ? `${prefix}.${key}` : key;
    record(acc, path, typeOf(value), file);
    if (Array.isArray(value)) {
      const itemPath = `${path}[]`;
      if (value.length === 0) record(acc, itemPath, "array", file);
      for (const item of value) {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          walk(item, itemPath, acc, file);
        } else {
          record(acc, itemPath, typeOf(item), file);
        }
      }
    } else {
      walk(value, path, acc, file);
    }
  }
}

function record(acc, path, type, file) {
  let entry = acc.get(path);
  if (!entry) {
    entry = { types: new Set(), files: new Set() };
    acc.set(path, entry);
  }
  entry.types.add(type);
  entry.files.add(file);
}

const dir = process.argv[2] || DEFAULT_DIR;
if (!existsSync(dir)) {
  throw new Error(`Dossier des builds v1 introuvable : ${dir}`);
}
const files = readdirSync(dir).filter((f) => f.endsWith(".fh.json")).sort();
if (files.length === 0) {
  throw new Error(`Aucun *.fh.json dans ${dir}`);
}

const acc = new Map();
for (const file of files) {
  walk(JSON.parse(readFileSync(join(dir, file), "utf8")), "", acc, file);
}

const fields = [...acc.keys()].sort().map((path) => ({
  path,
  types: [...acc.get(path).types].sort(),
  files: acc.get(path).files.size
}));

const doc = {
  $generated:
    "INVENTAIRE DE CHAMPS — chemins et types SEULEMENT, aucune valeur. Produit par tests/tools/derive-v1-inventory.mjs à partir de ~/tools/fh-phb/builds/*.fh.json (sept personnages FH v1 réels, lecture seule). Aucun contenu Fate's Hand n'est reproduit ici : un chemin comme destiny.arcana.name est une clef, pas du contenu.",
  source: "~/tools/fh-phb/builds/*.fh.json",
  buildCount: files.length,
  note: "Les clefs des cartes libres (nativeSkillTiers, builderState.tiers) sont normalisées en <clef>.",
  fields
};

writeFileSync(OUT, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
process.stdout.write(`${fields.length} chemins écrits dans ${OUT}\n`);
