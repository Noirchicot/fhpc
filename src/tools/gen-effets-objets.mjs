/* ══ LE GÉNÉRATEUR DE LA COPIE ES DES EFFETS D'OBJETS — lot 289 ══════════════════
   ⚖️ Eric, 2026-09-26 : les objets magiques équipés changent enfin les chiffres de la
   fiche. Le moteur (`src/build/effets-objets.mjs`) doit donc LIRE l'inventaire du lot 282,
   `sources-effets/objets-magiques-srd.effets.json` — dans le navigateur ET sous Node.

   ── LE CHEMIN, ET POURQUOI CELUI-LÀ ──────────────────────────────────────────
   Le dépôt fait voyager des données vers les deux mondes par DEUX chemins, et un seul
   convient ici :
     · les COUCHES (`layers/*.layer.json`) : `fetch` dans la page, `readFileSync` sous
       Node, puis `layers.register` et `query`. ⛔ Pas pour ceci : une couche de plus change
       la PILE, et chaque personnage déjà gardé déclare la sienne (`build.layers`) —
       `rebuild` refuserait tous les personnages d'avant, ou la page éteindrait la couche
       sans rien dire, et les effets avec elle ;
     · la COPIE ES GÉNÉRÉE (`ui/builder/x5-disposition.mjs`, « ⛔ GÉNÉRÉ, NE PAS ÉDITER ») :
       un module qui `export` la donnée, importé tel quel par la page et par Node, sans
       `fetch` ni disque. ⭐ C'est celui-ci : le moteur reste une fonction pure (le garde
       du bloc lui interdit `fetch` et `node:fs`), et la donnée arrive par `import`.

   ⭐ LA COPIE EST SANS PERTE : `export default` + le JSON, rien retiré, rien ajouté. La
   vérité reste le `.json` (les suites et les agents le lisent) ; le `.mjs` n'en est que
   l'emballage, et `tests/effets-objets-fiche.test.mjs` le régénère dans un répertoire
   temporaire et le compare octet pour octet — une copie qui a dérivé rougit le jour même.

   ── LES DISCIPLINES DES GÉNÉRATEURS DU DÉPÔT ────────────────────────────────
   1. LA DESTINATION EST UN ARGUMENT (TRAPS.md, lot 13) : la suite génère ailleurs.
   2. LA SOURCE EST UN ARGUMENT AUSSI : `moduleDesEffets()` est PURE, elle reçoit le texte.
   3. AUCUN REPLI SILENCIEUX : un JSON illisible, ou qui n'est pas cet inventaire, JETTE.

   Usage :  node src/tools/gen-effets-objets.mjs */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const SOURCE_PATH = join(REPO_ROOT, "sources-effets", "objets-magiques-srd.effets.json");
export const OUT_DIR = join(REPO_ROOT, "sources-effets");
export const OUT_NAME = "objets-magiques-srd.effets.mjs";
/** Le schéma que la source doit déclarer — un autre inventaire n'entre pas ici. */
export const SCHEMA_ATTENDU = "fhpc/effets-objets/1";

const TETE = `/* ══ ⛔ GÉNÉRÉ, NE PAS ÉDITER — la copie ES de \`objets-magiques-srd.effets.json\` ══════
   Source : le \`.json\` voisin, SEULE vérité. Une correction se fait LÀ, puis
   \`node src/tools/gen-effets-objets.mjs\`, puis on commite les deux fichiers ensemble.
   ⭐ Pourquoi une copie : le moteur la lit par \`import\`, dans la page comme sous Node, sans
   \`fetch\` ni disque (voir la tête du générateur). Sans perte : le JSON, tel quel.
   🔴 Seul lecteur autorisé : \`src/build/effets-objets.mjs\` (garde 6 de
   \`tests/effets-objets.test.mjs\`). */
`;

/** Le texte du module, depuis le texte du JSON. PURE. */
export function moduleDesEffets(texteJson) {
  let doc;
  try {
    doc = JSON.parse(texteJson);
  } catch (erreur) {
    throw new Error(`gen-effets-objets : la source n'est pas un JSON lisible — ${erreur.message}`);
  }
  if (!doc || doc.schema !== SCHEMA_ATTENDU || !Array.isArray(doc.objets)) {
    throw new Error(`gen-effets-objets : la source ne déclare pas \`${SCHEMA_ATTENDU}\` avec une liste \`objets\` ` +
      "— ce n'est pas l'inventaire des effets d'objets.");
  }
  return `${TETE}export default ${JSON.stringify(doc, null, 1)};\n`;
}

/** Génère la copie et l'ÉCRIT. `outDir` et `sourcePath` sont des arguments. */
export function generate({ outDir = OUT_DIR, sourcePath = SOURCE_PATH } = {}) {
  const texte = moduleDesEffets(readFileSync(sourcePath, "utf8"));
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUT_NAME);
  writeFileSync(outPath, texte);
  return { outPath, octets: Buffer.byteLength(texte) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, octets } = generate();
  console.log(`effets d'objets : ${outPath} (${octets} octets)`);
}
