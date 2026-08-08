/* ══ LE VEILLEUR D'ARBRE ═══════════════════════════════════════════════

   Il relève une empreinte de l'arbre de travail, et il DIT ce qui a bougé
   entre deux relevés. Rien de plus.

   ⚠️ POURQUOI IL EXISTE, ET CE QU'IL A COÛTÉ. Le 2026-08-08, l'architecte a
   mesuré un défaut reproductible dans `tests/gen-srd-layer.test.mjs` : la
   suite appelait `generate()`, qui RÉÉCRIVAIT `layers/srd-5.2.1-{fr,en}.
   layer.json` sur le disque, puis comparait avant/après. Deux conséquences,
   et la seconde est la grave :

     · la suite laissait l'arbre SALE à chaque exécution ;
     · l'exécution SUIVANTE héritait de la mutation. Mesuré, deux passes
       d'affilée sans remettre l'arbre propre : 307 vertes / 1 rouge, puis
       304 vertes / 4 rouges. **La même suite a rendu deux verdicts
       différents sans qu'une ligne ait changé.**

   Un test qui ment dans les deux sens est le pire défaut possible dans ce
   dépôt : vert, il autorise une fusion qu'il n'a pas vérifiée ; rouge, il
   fait chercher un défaut qui n'existe pas.

   Le veilleur est lui-même ATTAQUÉ, sur un arbre sali exprès : voir
   tests/tree-immuable.test.mjs. Un garde qu'on n'a pas vu rougir n'est pas un
   garde, c'est une intention.

   ── LE PÉRIMÈTRE, ET POURQUOI IL EST CE QU'IL EST ────────────────────
   Deux ensembles, et chacun répond à une menace différente :

     · les fichiers SUIVIS PAR GIT — c'est là que vit la menace principale,
       « une suite réécrit un artefact commité ». Une modification ou une
       disparition s'y voit.
     · tout ce qui se trouve sous `layers/`, `examples/`, `schemas/` et
       `contracts/`, SUIVI OU NON — parce qu'une suite qui déposerait un
       fichier NEUF dans `layers/` ne toucherait aucun fichier suivi, et
       passerait à travers le premier ensemble.

   Ce que le veilleur ne regarde PAS, délibérément : les fichiers non suivis
   hors de ces quatre répertoires. `tests/mcp-block.test.mjs` crée et retire
   un `src/mcp/sous/porte-de-sortie.mjs` pour attaquer son propre arpenteur,
   et `node --test` fait tourner les suites EN PARALLÈLE — les surveiller
   ferait battre le garde au hasard de l'ordonnancement. Un garde qui bat se
   fait désactiver, et c'est alors la garantie entière qui est perdue. */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Les répertoires surveillés jusque dans leurs fichiers NON suivis. */
export const ARTEFACT_DIRS = ["layers", "examples", "schemas", "contracts"];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Les chemins suivis par git, relatifs à `root`. Jette en NOMMANT la cause si
 *  git n'est pas là : un veilleur qui se tait faute d'outil serait exactement
 *  le repli silencieux que ce dépôt combat (loi §0.5). */
function trackedPaths(root) {
  let out;
  try {
    out = execFileSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (cause) {
    throw new Error(
      `tree-watch : « git ls-files » a échoué dans ${root} — le veilleur d'arbre ne peut pas ` +
      `établir son périmètre, et il ne devinera pas. Cause : ${cause.message}`
    );
  }
  return out.split("\0").filter((name) => name.length > 0);
}

function walkFiles(dir, base, into) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walkFiles(full, base, into);
    else if (item.isFile()) into.add(path.relative(base, full));
  }
}

/**
 * Relève l'empreinte de l'arbre : `chemin relatif → sha256 du contenu`.
 * @param {string} root la racine du dépôt.
 * @param {object} [options]
 * @param {string[]} [options.names] un périmètre EXPLICITE, qui remplace la
 *   liste git — c'est par là que l'attaque nourrit le veilleur d'un arbre
 *   fabriqué, sans dépendre d'un dépôt.
 * @param {string[]} [options.dirs] les répertoires balayés jusque dans leurs
 *   fichiers non suivis.
 */
export function fingerprintTree(root, options = {}) {
  const names = new Set(options.names || trackedPaths(root));
  for (const dir of options.dirs || ARTEFACT_DIRS) {
    const full = path.join(root, dir);
    if (fs.existsSync(full)) walkFiles(full, root, names);
  }
  const map = new Map();
  for (const name of [...names].sort()) {
    const full = path.join(root, name);
    /* Un chemin suivi mais ABSENT du disque n'est pas sauté : il est relevé
       comme absent, pour qu'une suppression se lise comme un changement et non
       comme un trou dans le relevé. */
    map.set(name, fs.existsSync(full) ? sha256(fs.readFileSync(full)) : null);
  }
  return map;
}

/**
 * Ce qui a bougé entre deux relevés, trié et NOMMÉ — jamais un simple booléen :
 * un garde qui dit « quelque chose a changé » sans dire quoi se fait ignorer.
 * @returns {Array<{name:string, kind:"modifié"|"disparu"|"apparu"}>}
 */
export function treeChanges(before, after) {
  const changes = [];
  for (const [name, digest] of before) {
    if (!after.has(name) || after.get(name) === null) {
      if (digest !== null) changes.push({ name, kind: "disparu" });
      continue;
    }
    if (digest === null) changes.push({ name, kind: "apparu" });
    else if (after.get(name) !== digest) changes.push({ name, kind: "modifié" });
  }
  for (const [name, digest] of after) {
    if (!before.has(name) && digest !== null) changes.push({ name, kind: "apparu" });
  }
  return changes.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/** Une ligne lisible par changement — le message d'échec du garde. */
export function describeChanges(changes) {
  return changes.map(({ name, kind }) => `${name} (${kind})`).join(" ; ");
}
