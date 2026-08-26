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
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

/* Les genres que le CONTRAT fh-layer/1 déclare — importés, jamais recopiés :
   une troisième copie de cette liste serait une troisième chance de dériver. */
import { GENRES as GENRES_DECLARES } from "../layers/document.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const SRD_ROOT = join(homedir(), "tools", "fh-srd", "exports");
export const OUT_DIR = join(REPO_ROOT, "layers");

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

/* ══ LES GENRES NE SONT PAS UNE LISTE, ILS SE DÉRIVENT — 2026-08-23 (lot 93) ══

   🔴 CE FICHIER PORTAIT LA BONNE RÈGLE ET LE CODE FAISAIT L'INVERSE. Le
   commentaire disait, mot pour mot : « ce qui entre ici est un fichier d'export
   `fh-srd`, un point » — et trois lignes plus bas, seize noms écrits en dur.
   Il portait même son propre avertissement : « CE NOMBRE N'EST PAS UNE
   FRONTIÈRE, ET IL A FAILLI LE DEVENIR ». Il l'est redevenu.

   ⛔ MESURE DU DÉFAUT : `exports/srd/en/` portait DIX-SEPT fichiers, la liste en
   nommait SEIZE. `item-value` — le barème des prix par rareté, livré par le lot
   92 de fh-srd, présent dans les deux langues, déjà inscrit au MANIFEST — n'a
   provoqué AUCUNE erreur. Il était simplement absent de la couche, et personne
   ne l'aurait su. Une journée entière.

   ⭐ LA RÉPONSE OPPOSÉE EXISTAIT DÉJÀ, LE MÊME SOIR, DANS LA SOURCE : chez
   fh-srd, `build_web.py` a REFUSÉ le genre neuf tant qu'il n'était pas déclaré
   — deux suites rouges, défaut trouvé en dix secondes. Le même problème, deux
   réponses : on garde celle qui refuse.

   ➡️ Donc la liste vient de la SOURCE, et ce générateur refuse — nommément,
   avec le motif — tout ce qu'il ne doit pas produire. Quatre portes, aucune ne
   se traverse en silence :
     ① un genre MAISON (`arcana`, `training`) : il naît ici, pas chez fh-srd,
       et le produire mélangerait les deux couches (loi §0.12) ;
     ② un fichier d'export non vérifié — présent d'un côté, absent de l'autre
       entre le disque et le MANIFEST ;
     ③ un genre boiteux, publié dans une langue et pas dans l'autre ;
     ④ un genre que le contrat fh-layer/1 ne déclare pas — la couche produite
       ne validerait pas, et l'écrire quand même serait mentir au disque.
   Aucune de ces portes ne compte : elles LISENT. Un nombre gelé aurait refermé
   la porte à la source elle-même, et c'est exactement ce qui vient d'arriver. */

/** Les genres qui n'entrent JAMAIS dans une couche SRD, quoi qu'en dise le
 *  disque (loi §0.12). ⚠️ ILS N'Y SONT PAS TOUS POUR LA MÊME RAISON, et les
 *  confondre reviendrait à en oublier un le jour où la source bouge :
 *
 *  · `arcana`, `training` — ils NAISSENT DANS CE DÉPÔT-CI. fh-srd n'en publie
 *    aucun ; en voir un dans ses exports serait une anomalie de source.
 *  · `shelving` — il naît bien chez fh-srd, mais dans la couche **`srfh`** :
 *    c'est le RANGEMENT d'Eric, pas le livre. Le produire dans la couche SRD
 *    ferait entrer une décision d'Eric dans la copie fidèle — exactement le
 *    mélange que §0.12 interdit, et il ne se verrait nulle part.
 *
 *  🔴 CETTE TROISIÈME LIGNE EST UN TROU REFERMÉ, PAS UNE PRÉCAUTION. Le lot 95
 *  a ouvert `shelving` au contrat pour que la couche `srfh` puisse exister ;
 *  à cette seconde-là, le refus ④ (« un genre que le contrat ne déclare pas »)
 *  a CESSÉ de couvrir ce nom. Ouvrir un genre au contrat DÉSARME donc une des
 *  quatre portes : c'est le geste à ne pas faire seul. */
export const GENRES_HORS_SRD = ["arcana", "shelving", "training"];

/** @deprecated Ancien nom, gardé le temps qu'aucun appelant ne le lise plus.
 *  Il disait « MAISON », ce qui n'est vrai que de deux des trois. */
export const GENRES_MAISON = GENRES_HORS_SRD;

const JSON_EXT = ".json";

/** Ce que le dossier d'export d'une langue porte VRAIMENT sur le disque. */
function genresSurDisque(root, lang) {
  return readdirSync(join(root, "srd", lang), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(JSON_EXT))
    .map((e) => e.name.slice(0, -JSON_EXT.length));
}

/** Ce que le MANIFEST déclare POUR CETTE LANGUE, et rien d'autre : le même
 *  MANIFEST liste aussi `exclusions.json`, `srd/correspondence.json` et toute
 *  la couche `srfh/` — aucun n'est un genre de la couche SRD. Le préfixe est
 *  donc `srd/<lang>/`, jamais `srd/` seul. */
function genresAuManifest(manifest, lang) {
  const prefixe = `srd/${lang}/`;
  return manifest.files
    .map((f) => f.path)
    .filter((p) => p.startsWith(prefixe) && p.endsWith(JSON_EXT))
    .map((p) => p.slice(prefixe.length, -JSON_EXT.length))
    .filter((g) => g !== "" && !g.includes("/"));
}

/** Dérive la liste des genres d'un INVENTAIRE — `{ <lang>: { disque, manifest } }`.
 *
 *  Fonction PURE (aucun accès disque), comme `assertDigestMatches` : les quatre
 *  refus s'éprouvent sur un inventaire fabriqué, sans salir `fh-srd`. Un garde
 *  qu'on n'a pas vu mordre ne mord pas. */
export function deriveGenres(inventaire, {
  maison = GENRES_HORS_SRD, declares = GENRES_DECLARES
} = {}) {
  const langs = Object.keys(inventaire);
  if (langs.length === 0) {
    throw new Error("gen-srd-layer : inventaire de source vide — aucune langue à dériver, et un vide n'est pas une réponse.");
  }

  /* ① LA LOI D'ABORD, et sur TOUT ce qui se présente — disque comme MANIFEST.
     Un genre maison inscrit d'un seul côté doit se voir refuser pour SON motif,
     pas pour un défaut d'intégrité qui masquerait la vraie faute. */
  const tousLesNoms = new Set();
  for (const lang of langs) {
    for (const g of inventaire[lang].disque || []) tousLesNoms.add(g);
    for (const g of inventaire[lang].manifest || []) tousLesNoms.add(g);
  }
  const interdits = [...tousLesNoms].filter((g) => maison.includes(g)).sort();
  if (interdits.length) {
    throw new Error(
      `gen-srd-layer : genre(s) qui n'appartiennent PAS à la couche SRD — ${interdits.join(", ")}. ` +
      "Soit ils naissent dans ce dépôt-ci (`arcana`, `training`), soit ils naissent chez fh-srd mais " +
      "dans la couche `srfh` (`shelving` : le rangement d'Eric, pas le livre). Dans les deux cas, les " +
      "produire ici mélangerait la copie fidèle et une décision, et c'est la loi §0.12. Refusé, pas sauté."
    );
  }

  /* ② L'INTÉGRITÉ, langue par langue. Les deux sens comptent : un fichier posé
     sans être inscrit au MANIFEST entrerait dans la couche sans être vérifié ;
     une entrée de MANIFEST sans fichier serait une source disparue. */
  const vus = new Map();
  for (const lang of langs) {
    const surDisque = new Set(inventaire[lang].disque || []);
    const auManifest = new Set(inventaire[lang].manifest || []);

    const nonInscrits = [...surDisque].filter((g) => !auManifest.has(g)).sort();
    if (nonInscrits.length) {
      throw new Error(
        `gen-srd-layer : ${nonInscrits.map((g) => `srd/${lang}/${g}${JSON_EXT}`).join(", ")} — ` +
        "présent(s) dans les exports, ABSENT(S) de exports/MANIFEST.json. Un fichier non vérifié " +
        "n'entre pas dans la couche ; il ne se saute pas non plus. Régénérer le MANIFEST chez " +
        "fh-srd, ou retirer le fichier. Refusé, pas sauté."
      );
    }

    const disparus = [...auManifest].filter((g) => !surDisque.has(g)).sort();
    if (disparus.length) {
      throw new Error(
        `gen-srd-layer : ${disparus.map((g) => `srd/${lang}/${g}${JSON_EXT}`).join(", ")} — ` +
        "inscrit(s) au MANIFEST, INTROUVABLE(S) sur le disque. La source a perdu un export : " +
        "resynchroniser fh-srd. Refusé, pas sauté."
      );
    }

    for (const g of surDisque) {
      if (!vus.has(g)) vus.set(g, new Set());
      vus.get(g).add(lang);
    }
  }

  /* ③ LES DEUX LANGUES OU AUCUNE. Une couche par langue se construit sur la
     MÊME liste de genres : un genre publié d'un seul côté rendrait les deux
     couches asymétriques sans que rien ne le dise. */
  const boiteux = [...vus.entries()]
    .filter(([, ou]) => ou.size !== langs.length)
    .map(([g, ou]) => `${g} (présent en ${[...ou].sort().join(", ")}, absent en ${langs.filter((l) => !ou.has(l)).sort().join(", ")})`)
    .sort();
  if (boiteux.length) {
    throw new Error(
      `gen-srd-layer : genre(s) publié(s) dans une seule langue — ${boiteux.join(" ; ")}. ` +
      "Les deux couches se construisent sur la même liste : une asymétrie se répare à la source, " +
      "elle ne se rattrape pas par une intersection silencieuse. Refusé, pas sauté."
    );
  }

  /* ④ LE CONTRAT. `fh-layer/1` énumère ses genres et ferme la porte au reste
     (`additionalProperties: false`) : produire un genre qu'il ne déclare pas
     écrirait sur le disque une couche que le schéma refuse. */
  const inconnus = [...vus.keys()].filter((g) => !declares.includes(g)).sort();
  if (inconnus.length) {
    throw new Error(
      `gen-srd-layer : genre(s) inconnu(s) du contrat fh-layer/1 — ${inconnus.join(", ")}. ` +
      "La couche produite ne validerait pas. Ouvrir le genre dans schemas/fh-layer.schema.json ET " +
      "dans src/layers/document.mjs — les deux, le garde de dérive compare les listes mot pour mot — " +
      "puis relancer. Refusé, pas sauté."
    );
  }

  const genres = [...vus.keys()].sort();
  if (genres.length === 0) {
    throw new Error(
      `gen-srd-layer : aucun genre dérivé de ${SRD_ROOT} — une source qui ne rend rien n'est pas ` +
      "une source vide, c'est une lecture fausse. Refusé, pas sauté."
    );
  }
  return genres;
}

/** Lit l'inventaire des deux langues sur le disque ET au MANIFEST.
 *
 *  ⚠️ `root` EST UN ARGUMENT, et c'est la leçon du lot 13 rejouée ici : une
 *  attaque qui veut prouver qu'un fichier d'export inconnu est bien VU doit
 *  pouvoir en poser un — et le poser dans `~/tools/fh-srd` serait salir le
 *  dépôt du voisin pour se prouver qu'on sait voir la saleté. Le défaut
 *  `SRD_ROOT` reste la source de PRODUCTION, nommée à un seul endroit. */
export function lireInventaire(root = SRD_ROOT) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(root, "MANIFEST.json"), "utf8"));
  } catch (cause) {
    throw new Error(
      `gen-srd-layer : MANIFEST.json illisible sous ${root} — fh-srd est une ` +
      `dépendance FERME de ce générateur, pas un intrant optionnel. (${cause.message})`
    );
  }
  const inventaire = {};
  for (const lang of LANGS) {
    try {
      inventaire[lang] = { disque: genresSurDisque(root, lang), manifest: genresAuManifest(manifest, lang) };
    } catch (cause) {
      throw new Error(
        `gen-srd-layer : srd/${lang}/ illisible sous ${root} — fh-srd est une ` +
        `dépendance FERME de ce générateur. (${cause.message})`
      );
    }
  }
  return inventaire;
}

/** Les genres de la couche SRD, DÉRIVÉS de la source au chargement du module.
 *  L'ordre est alphabétique — celui du schéma fh-layer/1, celui des dossiers
 *  d'export, et celui des clefs `records` de la couche écrite. */
export const GENRES = deriveGenres(lireInventaire());

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
 *  pas au MANIFEST. Ne vérifie que les fichiers que ce générateur lit —
 *  `GENRES` × `LANGS`, soit 34 au 2026-08-23. ⚠️ CE NOMBRE SE MESURE, IL NE SE
 *  DÉCIDE PAS : il suit la source, et la phrase qui disait « les 28 fichiers »
 *  était déjà fausse de quatre le jour où on l'a relue. `exclusions.json`,
 *  `srd/correspondence.json` et la couche `srfh/` ne sont pas des intrants. */
export function verifyManifest() {
  const manifest = readJson("MANIFEST.json");
  const byPath = new Map(manifest.files.map((f) => [f.path, f]));
  for (const lang of LANGS) {
    for (const genre of GENRES) {
      const rel = relPath(lang, genre);
      assertDigestMatches(rel, sha256(readBytes(rel)), byPath.get(rel));
    }
  }
  // ⛔ LA TABLE DE CONVERSION EST UN INTRANT COMME UN AUTRE depuis que la
  // couche française est un patch : sans elle, un poids français serait rendu
  // en livres. Un fichier non vérifié n'entre pas dans la couche.
  const conv = "srd/conversions.json";
  assertDigestMatches(conv, sha256(readBytes(conv)), byPath.get(conv));
}

/* ══ LA COUCHE FRANÇAISE EST UN PATCH DEPUIS LA TRANSITION À FROID ═════════

   🔴 CE GÉNÉRATEUR LISAIT `doc.records` DES DEUX CÔTÉS, ET C'EST DEVENU UN
   `TypeError` LE 2026-08-24. Chez `fh-srd`, la couche française a cessé d'être
   un embranchement : il n'y a plus qu'UN jeu de records, adressé en anglais, et
   `exports/srd/fr/*.json` porte des **patches** posés dessus.

   ⭐ CE N'EST PAS UNE COUCHE PÉRIMÉE — une couche périmée donnerait des comptes
   faux, pas un « not iterable ». C'est un CHANGEMENT DE FORME de la source, et
   la bonne réponse est de suivre, pas de replâtrer.

   TROIS COUCHES, ET L'ORDRE COMPTE — la même lecture que
   `~/tools/fh-srd/src/french_layer.py`, qui est la référence :

     ① le RECORD anglais    la structure, les clefs, les nombres
     ② la CONVERSION        un nombre français se RECALCULE (`conversions.json`)
     ③ le PATCH             un mot français se PREND dans le livre

   ⭐ Le patch passe en DERNIER exprès : si le livre français écrivait un jour
   autre chose qu'une simple conversion, c'est le LIVRE qui gagnerait.

   ⚠️ Une adresse ADOPTÉE n'a pas de record anglais derrière elle — le livre
   anglais imprime le terme (`Climb Speed`, 15 fois) mais ne lui donne pas
   d'entrée. Sa base est vide et le patch porte tout. C'est prévu. */

let conversionsCache = null;

function conversions() {
  if (conversionsCache === null) {
    conversionsCache = readJson("srd/conversions.json").fields;
  }
  return conversionsCache;
}

/** Les records d'un fichier d'export, reconstitués si c'est un patch.
 *
 *  ⛔ Un fichier qui ne porte NI `records` NI `patches` n'est pas un fichier
 *  vide : c'est une forme qu'on ne connaît pas. On refuse en la nommant, plutôt
 *  que de rendre une liste vide qui ressemblerait à une réponse.
 */
function recordsOf(doc, genre, lang) {
  if (Array.isArray(doc.records)) return doc.records;
  if (!Array.isArray(doc.patches)) {
    throw new Error(
      `gen-srd-layer : ${relPath(lang, genre)} ne porte ni \`records\` ni ` +
      "`patches` — forme inconnue, rien n'est produit. Refusé, pas sauté.");
  }
  const anglais = new Map(
    readJson(relPath("en", genre)).records.map((r) => [r.id, r]));
  const table = conversions();
  return doc.patches.map((patch) => {
    const base = anglais.get(patch.id);
    const data = base ? structuredClone(base.data) : {};

    // ② les conversions, AVANT le patch
    for (const [champ, valeur] of Object.entries(data)) {
      if (typeof valeur !== "string") continue;
      const fr = table[champ] && table[champ][valeur];
      if (fr !== undefined) data[champ] = fr;
    }
    // ③ les mots du livre français
    Object.assign(data, patch.data);

    const record = base ? structuredClone(base) : {};
    Object.assign(record, {
      id: patch.id, lang: "fr", name: patch.name, data,
      kind: (base && base.kind) || genre,
      slug: (base && base.slug) || patch.id.split(":").pop(),
    });
    for (const champ of ["license", "attribution", "source_id",
                         "source_locator", "srd_version", "content_hash"]) {
      if (patch[champ] !== undefined) record[champ] = patch[champ];
    }
    return record;
  });
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
    for (const record of recordsOf(doc, genre, lang)) {
      if (Object.hasOwn(genreRecords, record.id)) {
        throw new Error(`gen-srd-layer : id de record dupliqué "${record.id}" dans ${rel}.`);
      }
      genreRecords[record.id] = toAddEntry(record);
    }
    const lus = recordsOf(doc, genre, lang);
    records[genre] = genreRecords;
    countsByGenre[genre] = lus.length;
    total += lus.length;
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

/** Génère les deux couches et les ÉCRIT.
 *
 *  `outDir` est la destination, et elle est un ARGUMENT depuis le lot 13. Elle
 *  ne l'était pas : la destination était `OUT_DIR` en dur, et la suite qui
 *  vérifiait la reproductibilité du générateur n'avait donc pas d'autre moyen
 *  que d'écraser `layers/` pour l'observer. Le défaut mesuré est décrit dans
 *  tests/gen-srd-layer.test.mjs — un test qui mutait un artefact commité, et
 *  dont l'exécution suivante héritait de la mutation.
 *
 *  Le défaut `OUT_DIR` reste la destination de PRODUCTION, celle de l'appel en
 *  ligne de commande ci-dessous : ce n'est pas un repli, c'est la destination
 *  documentée du générateur, et elle est nommée à un seul endroit. */
export function generate({ outDir = OUT_DIR } = {}) {
  verifyManifest();
  mkdirSync(outDir, { recursive: true });
  const results = {};
  for (const lang of LANGS) {
    const { layer, total, countsByGenre } = buildLayer(lang);
    const outPath = join(outDir, `srd-${SRD_VERSION}-${lang}.layer.json`);
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
