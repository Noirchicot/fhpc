/* ══ CE QUE FATE'S HAND CHANGE — L'EXPORT QUI NOURRIT LE RAPPEL ═══════════
   Lot 78. Produit `exports/fh-changes.json`, lu par le générateur du site
   (`~/tools/fh-phb/sync_from_vault.py`) pour écrire, en tête de chaque
   chapitre, le menu « ce que Fate's Hand ajoute · change · retire ».

   🔴 POURQUOI CET EXPORT EXISTE. Eric, le 2026-08-20 : *« j'ai un peu peur de
   voir ma création noyée dans le SRD »*, puis *« peut-on donner ce job de
   rappel des règles FH en tête de chapitre, plus sous forme de menu avec des
   liens qu'un bloc de texte ? »*. La table chapitre ↔ genre a été ratifiée le
   même jour (vault, `0c. Canon/Chapitres et genres`) ; elle dit quel chapitre
   parle de quel genre. Ce fichier-ci dit ce que FH fait À ce genre.

   ⭐ ET LE RAPPEL EST GÉNÉRÉ, PAS ÉCRIT. Un rappel écrit à la main pourrit :
   la journée du 20/08 l'a prouvé deux fois, avec deux clauses dictées de
   mémoire qui restituaient un état qu'Eric avait lui-même corrigé deux jours
   plus tôt. Un rappel DÉRIVÉ ne peut pas mentir — le jour où une couche cesse
   de patcher quelque chose, la ligne disparaît du menu toute seule.

   ── LA MESURE EST UN DIFF DE DEUX PLIS, ET C'EST LE POINT ────────────────
   On monte DEUX fois la vraie machinerie : la pile SRD seule, puis la pile
   complète. Ce que FH change est exactement ce qui diffère entre les deux.

   ⛔ ON NE LIT PAS LES `op:` DES FICHIERS DE COUCHE. C'était la voie courte, et
   elle ment de trois façons : un `add` qui en recouvre un autre compterait
   deux fois ; un record ajouté par FH puis patché par FH se rangerait dans
   « FH change le SRD », ce qui est faux ; et surtout la mesure ne passerait
   plus par le pli — donc l'export pourrait dériver de ce que la PAGE monte
   sans qu'une seule ligne rougisse. Ici la mesure emprunte le même chemin que
   le joueur : `register` puis `query`.

   ── LES TROIS RÈGLES DU CONTRAT (posées par le fil FH WEB, 2026-08-20) ────
   ① DES NOMS, PAS DES COMPTES. Un compte ne se vérifie pas et ne se lit pas ;
     un nom fait les deux, et le jour où le menu voudra des liens ils sont là.
     Le consommateur compte lui-même.
   ② LES TROIS CLEFS TOUJOURS PRÉSENTES, tableau vide si rien. ⛔ Ne JAMAIS
     omettre une clef pour dire « rien » : le lecteur ne pourrait pas
     distinguer « FH ne retire rien » de « la passe n'a pas mesuré les
     retraits ». C'est la leçon du 20/08 dans sa forme la plus pure — une
     absence n'est jamais une réponse.
   ③ LE NOM DU GENRE EST CELUI DE L'EXPORT SRD, plus les deux genres maison
     (`arcana`, `training`) qui n'ont aucune contrepartie SRD.

   ⭐ ET ON DÉCLARE LES DIX-HUIT GENRES, PAS SEULEMENT LES NEUF TOUCHÉS. Le
   consommateur traite un genre absent comme NON MESURÉ, et il a raison. Neuf
   genres sortiraient donc avec trois listes vides « par omission » alors
   qu'ils ont bel et bien été mesurés : les déclarer vides, c'est dire « j'ai
   regardé, il n'y a rien », ce qui est une information, et la même règle ②
   appliquée un cran plus haut.

   ⚠️ ET VOICI CE QUE CET EXPORT NE MESURE PAS — à lire avant de rédiger la
   phrase du menu. Il mesure les RECORDS des couches du builder. Une règle de
   Fate's Hand qui vit dans la PROSE d'un chapitre et dans aucun record est
   invisible ici. Cas vivant, et il est gros : `spell` sort à trois listes
   vides alors que le chapitre `Fate's Hand Spells` compte 737 mots d'Eric.
   Trois listes vides veulent dire « aucune divergence de record », JAMAIS
   « ce chapitre ne contient aucune règle Fate's Hand ». Le champ `$measures`
   porte cette phrase dans le fichier lui-même, pour qu'elle voyage avec lui.

   Usage :  node src/tools/gen-fh-changes.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createLayers } from "../layers/index.mjs";
import { GENRES } from "../layers/document.mjs";
import { sha256Portable } from "../layers/sha256.mjs";
/* LA PILE N'EST PAS RECOPIÉE ICI, ET C'EST DÉLIBÉRÉ. `PILE` est déjà tenue
   par un garde contre `LAYER_FILES` d'`engine.mjs` (fiche-360, garde 3) : une
   quatrième liste serait une quatrième chose à tenir à jour, et celle qui
   diverge est toujours celle que personne ne relit. */
import { PILE } from "./exemple-fh-en.mjs";
import { SRD_LAYER_ID } from "./fh-species-source.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const OUT_DIR = join(REPO_ROOT, "exports");
export const OUT_NAME = "fh-changes.json";
export const CONTRAT = "fh-changes/1";

export const GENERATED =
  "GENERATED — produit par `node src/tools/gen-fh-changes.mjs` depuis les couches de fhpc. " +
  "Ne pas éditer : la passe suivante écrase. Une correction se fait dans la COUCHE, jamais ici.";

/* La phrase qui voyage avec le fichier. Elle est ici et pas seulement dans la
   tête du module parce que le consommateur est un AUTRE dépôt : un
   avertissement resté dans mes commentaires ne l'atteindrait pas. */
export const MEASURES =
  "Chaque genre porte ce que les COUCHES du builder déclarent : des records ajoutés, patchés, éteints. " +
  "Trois listes vides signifient « aucune divergence de RECORD entre la pile SRD et la pile Fate's Hand » — " +
  "PAS « ce chapitre ne contient aucune règle Fate's Hand ». Une règle qui vit dans la prose d'un chapitre " +
  "et dans aucun record est invisible ici (cas vivant : `spell`, trois listes vides, 737 mots d'Eric).";

class GenError extends Error {}

function fail(what) {
  throw new GenError(`gen-fh-changes : ${what}`);
}

/* ── LE PLI, DEUX FOIS ────────────────────────────────────────────────── */

function bus() {
  const ecoute = new Map();
  return {
    on(type, fn) {
      if (!ecoute.has(type)) ecoute.set(type, new Set());
      ecoute.get(type).add(fn);
      return () => ecoute.get(type).delete(fn);
    },
    emit(type, data) {
      const event = Object.assign({ type }, data);
      const set = ecoute.get(type);
      if (set) for (const fn of set) fn(event);
      return event;
    }
  };
}

/** Monte des fichiers de couche et rend les verbes. Le `root` est un argument :
 *  la suite monte des piles fabriquées ailleurs pour attaquer les gardes. */
export function monter(fichiers, { root = REPO_ROOT } = {}) {
  const layers = createLayers({ bus: bus() });
  for (const fichier of fichiers) {
    layers.verbs.register({ bytes: readFileSync(join(root, fichier)), origin: fichier });
  }
  return layers.verbs;
}

/* ── LE NOM D'UN RECORD, OU UN REFUS ──────────────────────────────────── */

/* ⛔ AUCUN REPLI SUR L'ID, ET CE GARDE N'EST PAS DÉCORATIF — le trou a été
   MESURÉ en écrivant sa suite. Un geste `add` ne peut pas être sans nom : le
   lecteur de couche l'exige (`assertString`, min 1). Le pli refuse aussi
   `remove: ["name"]`, qui ôterait une racine entière du record. Mais
   `changes: {"name": ""}` PASSE : le nom n'est validé qu'à la lecture du geste
   `add`, jamais sur le RÉSULTAT d'un patch. Un nom vide traverserait donc tout
   le moteur pour n'apparaître que dans le menu d'un chapitre publié, sous la
   forme d'une virgule solitaire. Ici on jette en nommant le genre ET l'id : la
   faute est dans la couche, c'est là qu'elle se corrige (loi §0.5). */
function nomDe(vue, ou) {
  const nom = vue.record && vue.record.name;
  if (typeof nom !== "string" || nom.trim() === "") {
    fail(`${ou} : ${vue.kind} « ${vue.id} » n'a pas de nom lisible (${JSON.stringify(nom)}) — ` +
      "le menu d'un chapitre afficherait son identifiant technique.");
  }
  return nom;
}

/** Tri par point de code, jamais `localeCompare` : le fichier est commité, et
 *  une passe qui rendrait deux ordres selon la locale de la machine ferait
 *  rougir le garde de déterminisme chez l'un et pas chez l'autre. */
const trier = (liste) => liste.slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

/* ── LA MESURE ────────────────────────────────────────────────────────── */

/** Mesure un genre entre les deux plis. Rend les trois listes du contrat, plus
 *  `renamed` — voir la note ci-dessous. */
export function mesurerGenre(genre, srd, fh) {
  const avant = new Map(srd.query({ kind: genre }).map((vue) => [vue.id, vue]));
  const apres = new Map(fh.query({ kind: genre }).map((vue) => [vue.id, vue]));

  const added = [], patched = [], removed = [], renamed = [];

  for (const [id, vue] of apres) {
    /* Un record dont la PROVENANCE n'est pas la couche SRD a été posé par
       Fate's Hand — même s'il a été patché ensuite par une autre couche FH.
       C'est un AJOUT, pas un changement du SRD : le SRD n'a jamais rien dit
       de lui. */
    if (vue.provenance.from !== SRD_LAYER_ID) {
      added.push(nomDe(vue, "ajout"));
      continue;
    }
    if (vue.provenance.patchedBy.length === 0) continue;

    const nom = nomDe(vue, "patch");
    patched.push(nom);

    /* ⭐ LE RENOMMAGE SE DÉCLARE, IL NE SE NOIE PAS. Un seul cas aujourd'hui,
       et c'est le plus fort du livre : `srd:species:en:gnome` est patché en
       « Hoddon ». Le ranger dans `patched` sous son seul nom d'arrivée ferait
       croire au lecteur que le Hoddon est une espèce du SRD que FH retouche,
       et le Gnome disparaîtrait du fichier sans qu'une ligne le dise. Or
       « Fate's Hand remplace le Gnome par le Hoddon » est exactement la phrase
       qu'Eric craignait de voir noyée.
       ⚠️ La clef est présente sur TOUS les genres, vide compris : sans quoi on
       rouvrirait, un cran plus bas, le trou que la règle ② vient de fermer. */
    const vueAvant = avant.get(id);
    if (vueAvant && nomDe(vueAvant, "patch (état SRD)") !== nom) {
      renamed.push({ from: nomDe(vueAvant, "patch (état SRD)"), to: nom });
    }
  }

  for (const [id, vue] of avant) {
    if (!apres.has(id)) removed.push(nomDe(vue, "retrait"));
  }

  return {
    added: trier(added),
    patched: trier(patched),
    removed: trier(removed),
    renamed: renamed.slice().sort((a, b) => (a.to < b.to ? -1 : a.to > b.to ? 1 : 0))
  };
}

/** L'empreinte de la passe. C'est celle des OCTETS des couches montées, dans
 *  l'ordre — la même matière que `build.layers[].hash` du document `fh-char/1`.
 *  ⭐ Elle est AUDITABLE parce que `stack` publie ses entrées juste à côté :
 *  une empreinte dont personne ne peut retrouver les ingrédients ne prouve
 *  rien, elle rassure. */
export function empreinte(pile) {
  const texte = pile.map((couche) => `${couche.id}@${couche.version}:${couche.hash}`).join("\n");
  return sha256Portable(new TextEncoder().encode(texte));
}

export function build({ root = REPO_ROOT, pile = PILE } = {}) {
  /* ⚔️ LE GARDE QUI COMPTE LE PLUS, ET IL EST EN PREMIER. Toute la mesure
     repose sur « le SRD est la couche du bas » : si la pile était réordonnée,
     `provenance.from` cesserait de désigner le SRD et le fichier sortirait en
     déclarant que Fate's Hand AJOUTE 1 093 records — 330 monstres compris —
     tout en restant parfaitement vert. Une bêtise énorme, muette, et publiée
     en tête de chaque chapitre du livre d'Eric. */
  const bas = pile[0] || "";
  if (!bas.endsWith(`${SRD_LAYER_ID}.layer.json`)) {
    fail(`la couche du bas devrait être « ${SRD_LAYER_ID} », la pile commence par « ${bas} » — ` +
      "toute la mesure compare la pile complète à CELLE-LÀ ; l'inverser rendrait le SRD entier " +
      "« ajouté par Fate's Hand », en silence.");
  }

  const srd = monter([pile[0]], { root });
  const fh = monter(pile, { root });

  const genres = {};
  for (const genre of GENRES) genres[genre] = mesurerGenre(genre, srd, fh);

  /* Le garde de la règle ② relu sur notre PROPRE sortie. Il ne peut pas
     échouer aujourd'hui — et c'est bien pour ça qu'il est ici : le jour où
     quelqu'un ajoutera une branche à `mesurerGenre`, c'est ce test-là qui
     dira que le contrat a été rompu, pas le consommateur d'un autre dépôt. */
  for (const [genre, mesure] of Object.entries(genres)) {
    for (const clef of ["added", "patched", "removed", "renamed"]) {
      if (!Array.isArray(mesure[clef])) {
        fail(`le genre « ${genre} » sort sans sa clef « ${clef} » — une clef manquante se lit ` +
          "« non mesuré », jamais « zéro » (règle ② du contrat).");
      }
    }
  }

  const stack = fh.stack().map((couche) => ({
    id: couche.id, version: couche.version, hash: couche.hash
  }));

  return {
    $generated: GENERATED,
    $measures: MEASURES,
    contract: CONTRAT,
    lang: "en",
    layer_run: empreinte(stack),
    stack,
    genres
  };
}

export function serialize(doc) {
  return JSON.stringify(doc, null, 2) + "\n";
}

/** Génère et ÉCRIT. `outDir` est un argument : la suite génère dans un dossier
 *  temporaire et compare au fichier commité, sans jamais l'écraser pour
 *  l'observer (leçon du lot 13, TRAPS.md). */
export function generate({ outDir = OUT_DIR, root = REPO_ROOT, pile = PILE } = {}) {
  const doc = build({ root, pile });
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUT_NAME);
  writeFileSync(outPath, serialize(doc));
  return { outPath, doc };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, doc } = generate();
  const touches = Object.entries(doc.genres)
    .filter(([, m]) => m.added.length || m.patched.length || m.removed.length);
  console.log(`fh-changes : ${touches.length} genres touchés sur ${Object.keys(doc.genres).length} → ${outPath}`);
  for (const [genre, m] of touches) {
    console.log(`  ${genre.padEnd(18)} +${m.added.length} ~${m.patched.length} -${m.removed.length}` +
      (m.renamed.length ? `  (renommé : ${m.renamed.map((r) => `${r.from} → ${r.to}`).join(", ")})` : ""));
  }
}

export { GenError };
