/* ══ LE MAGASIN SYSTÈME DE FICHIERS — HORS DU BLOC, ET C'EST LE POINT ══
   Lot 14-bloc-doc.

   ── POURQUOI CE FICHIER N'EST PAS DANS `src/doc/` ───────────────────────
   Parce qu'il touche le disque, et que le bloc n'en a pas le droit (décision
   D1). C'est le même partage que `bin/fhpc-mcp.mjs`, seul fichier du chemin
   MCP à nommer `process` et à lire un fichier : quelqu'un doit bien parler au
   monde, et ce quelqu'un vit à la frontière, pas dans le domaine.

   Ce fichier est donc le SEUL du chemin `doc` qui nomme `node:fs`, `node:path`,
   un séparateur de chemin ou une extension de fichier. Le garde structurel de
   `tests/doc-block.test.mjs` inspecte `src/doc/` et rougit sur chacun de ces
   mots ; ici ils sont le métier.

   ── LA RACINE VIENT DE L'APPELANT, TOUJOURS (décision D2) ───────────────
   Aucun défaut, aucun `~/.fhpc`, aucun répertoire deviné. *Le personnage
   appartient au joueur, il héberge ses propres données* : un magasin qui
   choisit où vivent les fichiers de quelqu'un a déjà décidé à sa place. Un
   appel sans racine est un refus, pas un dossier créé quelque part.

   ── LA CORRESPONDANCE CLEF ↔ FICHIER, ET SON REFUS ──────────────────────
   `<clef>.fh-char.json`, à plat dans la racine. La clef est l'id du document
   (le bloc le garantit aux deux bouts), et ce magasin la vérifie QUAND MÊME
   avant d'en faire un nom de fichier : un magasin qui fait confiance à son
   appelant pour ne pas lui passer `../../etc/passwd` est un magasin qui
   attend son tour. Ce contrôle-ci est une règle de SYSTÈME DE FICHIERS
   (aucun séparateur, aucun point en tête, longueur bornée), pas une seconde
   copie de la règle d'identité du document : les deux peuvent durcir
   séparément sans se contredire. */

import fs from "node:fs";
import path from "node:path";

import { DocError } from "../doc/errors.mjs";

/** Le suffixe des fichiers de personnage, celui du dépôt
 *  (`examples/personnage-srd-fr-niveau1.fh-char.json`). */
export const SUFFIX = ".fh-char.json";

/** Ce qu'une clef doit être pour devenir un nom de fichier sans surprise. */
const SAFE_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function fail(what) {
  throw new DocError(`fhpc/storage-fs: ${what}`);
}

/**
 * Un magasin de personnages posé sur un répertoire.
 *
 * @param {object} options
 * @param {string} options.root le répertoire, **obligatoire** : il vient de
 *   l'appelant, jamais d'un défaut (décision D2).
 * @param {boolean} [options.create] créer le répertoire s'il manque. `false`
 *   par défaut : fabriquer un dossier chez quelqu'un sans le lui dire est le
 *   contraire de « le joueur héberge ses propres données ».
 * @returns {{list: () => string[], read: (key: string) => Buffer|null, write: (key: string, bytes: Uint8Array) => void, root: string}}
 */
export function createFsStorage({ root, create = false } = {}) {
  if (typeof root !== "string" || root.length === 0) {
    fail("createFsStorage attend `{root}` — le répertoire où vivent les personnages. Il n'y a pas de " +
      "répertoire par défaut : le personnage appartient au joueur, et choisir où il l'héberge serait " +
      "décider à sa place (décision D2).");
  }
  const base = path.resolve(root);
  if (create) fs.mkdirSync(base, { recursive: true });
  if (!fs.existsSync(base)) {
    fail(`le répertoire « ${base} » n'existe pas. Le magasin ne le crée pas de lui-même — passer ` +
      "`{create: true}` est un geste explicite, en fabriquer un en silence n'en est pas un.");
  }
  if (!fs.statSync(base).isDirectory()) {
    fail(`« ${base} » n'est pas un répertoire.`);
  }

  function fileOf(key, verb) {
    if (typeof key !== "string" || !SAFE_KEY.test(key)) {
      fail(`${verb} : « ${key === undefined ? "(absente)" : String(key)} » n'est pas une clef de magasin ` +
        "utilisable comme nom de fichier (ni séparateur, ni point en tête, 128 caractères au plus).");
    }
    return path.join(base, `${key}${SUFFIX}`);
  }

  return {
    root: base,

    /** Les clefs présentes. Les fichiers qui ne portent pas le suffixe sont
     *  ignorés — ce répertoire est celui du joueur, il a le droit d'y garder
     *  autre chose, et un magasin qui prétendrait lire ses notes serait un
     *  magasin trop bavard. */
    list() {
      return fs.readdirSync(base, { withFileTypes: true })
        .filter((item) => item.isFile() && item.name.endsWith(SUFFIX))
        .map((item) => item.name.slice(0, -SUFFIX.length))
        .filter((key) => SAFE_KEY.test(key))
        .sort();
    },

    read(key) {
      const file = fileOf(key, "read");
      if (!fs.existsSync(file)) return null;
      return fs.readFileSync(file);
    },

    /** ÉCRITURE ATOMIQUE. Un fichier temporaire puis un `rename` : sur une
     *  écriture interrompue (processus tué, disque plein), le joueur garde son
     *  personnage précédent ENTIER au lieu d'un fichier tronqué qui ne valide
     *  plus. Le témoin d'empreinte du bloc ne protège que des écritures qui se
     *  croisent ; celle-ci protège des écritures qui n'aboutissent pas. */
    write(key, bytes) {
      const file = fileOf(key, "write");
      const temporary = `${file}.${process.pid}.partiel`;
      try {
        fs.writeFileSync(temporary, bytes);
        fs.renameSync(temporary, file);
      } catch (cause) {
        try { fs.rmSync(temporary, { force: true }); } catch { /* le nettoyage ne masque jamais la cause */ }
        fail(`write « ${key} » : ${cause.message}`);
      }
    }
  };
}
