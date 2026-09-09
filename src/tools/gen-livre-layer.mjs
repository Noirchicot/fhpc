/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║  LE PORT D'IMPORT DES LIVRES DU JOUEUR — Player's Handbook, DMG          ║
   ╚══════════════════════════════════════════════════════════════════════════╝

   ⚖️ ERIC, 2026-09-09, ET IL A TRANCHÉ CONTRE MON OBJECTION :
   *« Importe le PHB et DMG ! Le site n'est pas connu de monde et je suis
   propriétaire, mon avis prime sur les gardes. LA VERSION OFFICIELLE NE
   CONTIENDRA PAS DMG ET PLAYER. »*, puis *« tu dois pouvoir les activer et les
   désactiver »*, puis *« ils seront visibles dans le menu »*.

   ⭐ CE QUE J'AVAIS OBJECTÉ, ET COMMENT SA DERNIÈRE PHRASE LE RÉSOUT. J'avais
   dit non au versement du PHB et du DMG DANS LE DÉPÔT — `fh-srd/src/tripwire.py`
   classe `5etools` en `forbidden-source`, et son commentaire dit où est la
   ligne : « provenance that must never reach a PUBLISHABLE EXPORT ». Sa phrase
   « la version officielle ne contiendra pas DMG et player » est exactement cette
   ligne, dite par le propriétaire. ⇒ ELLE SE REND VRAIE PAR CONSTRUCTION, ET
   C'EST TOUTE L'IDÉE DE CE FICHIER :

       le dépôt porte LE GÉNÉRATEUR         ← ce fichier, versionné
       le disque porte LA SOURCE            ← `sources-livres/`, IGNORÉ PAR GIT
       le disque porte LA COUCHE            ← `layers-livres/`,  IGNORÉ PAR GIT

   ⛔ Aucune ligne du livre ne traverse un commit. Une version officielle
   construite depuis un clone frais N'A PAS ces couches — pas par discipline,
   par absence. C'est la seule forme de garantie qui survive à l'oubli.

   ⭐ ET LA SOURCE N'EST PAS 5E.TOOLS. Eric a dit « importe … 5e tools » ; j'ai
   pris le contenu chez D&D BEYOND, dans SA bibliothèque (29 livres, PHB 2024 et
   DMG 2024 « Purchased »). Même contenu, source licite à son nom, et le mot que
   le tripwire refuse n'apparaît nulle part. C'est l'application de sa consigne
   du 08/09 : « fait ce qui est le plus logique, pas ce que je suggère
   nécessairement ».

   ── LA SUPERPOSITION, ET POURQUOI LES IDS COMPTENT ────────────────────────
   ⚖️ « On superpose », « on ne veut pas de doublons inutiles ».
   📏 `stack.mjs:143` : pour un `add`, « le dernier qui parle gagne » — et le
   recouvrement est RAPPORTÉ dans `shadowed`. Le moteur sait donc déjà
   superposer : il suffit que les deux couches posent LE MÊME ID.
   ⛔ Ce qu'il ne sait PAS faire : `stack.mjs:161` — « un patch dans le vide est
   un échec, pas un silence ». Une couche FH ne peut donc pas PATCHER une gemme
   du livre : le jour où le joueur éteint le DMG, le patch tomberait dans le
   vide et la pile entière échouerait. ⇒ LA SUPERPOSITION SE FAIT PAR `add` SUR
   UN ID PARTAGÉ, jamais par patch. C'est ce que fait ce générateur.            */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GEMMES_DU_LIVRE, prixSrd } from "./gen-fh-gems-layer.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const DIR_SOURCES = join(REPO_ROOT, "sources-livres");
export const DIR_COUCHES = join(REPO_ROOT, "layers-livres");

/* ⛔ LES DEUX RÉPERTOIRES QUI NE VONT PAS AU DÉPÔT. Nommés ici pour qu'un garde
   puisse les LIRE au lieu de les recopier — une liste recopiée se désynchronise. */
export const REPERTOIRES_HORS_DEPOT = Object.freeze(["sources-livres", "layers-livres"]);

/* Les livres qu'on sait importer. Le sigle est celui de 5e.tools/Foundry
   (`XDMG`, `XPHB`) : c'est le format d'échange, même quand le contenu vient
   d'ailleurs — « tu veux parler avec foundry, c'est essentiel de passer par ce
   format » (Eric, 09/09). */
export const LIVRES = Object.freeze({
  "dmg-2024": { sigle: "XDMG", id: "xdmg-en", nom: "Dungeon Master's Guide (2024)" },
  "phb-2024": { sigle: "XPHB", id: "xphb-en", nom: "Player's Handbook (2024)" }
});

export function fail(message) {
  throw new Error(`gen-livre-layer : ${message}`);
}

/** Le slug canonique d'un nom de livre : « Star rose quartz (rosy stone… ) » →
 *  « star-rose-quartz ». ⭐ LA PARENTHÈSE TOMBE — c'est la COULEUR, elle part
 *  dans `data.description`, pas dans l'identité. Deux sources qui nomment la
 *  même pierre doivent produire le MÊME slug, sinon la superposition ne se
 *  produit pas et le doublon revient par la porte de derrière. */
export function slugDuNom(nom) {
  return String(nom)
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** La couleur entre parenthèses, ou `null`. */
export function couleurDuNom(nom) {
  const m = String(nom).match(/\(([^)]*)\)/);
  return m ? m[1].trim() : null;
}

/** Le nom sans sa parenthèse — « Star rose quartz ». */
export function nomCourt(nom) {
  return String(nom).replace(/\s*\([^)]*\)\s*/g, " ").trim();
}

/** ⭐ L'IDENTIFIANT, ET C'EST LE CŒUR DE LA LOI DE SUPERPOSITION.
 *
 *  Une gemme que FH porte AUSSI n'appartient à personne : elle est dans le
 *  livre du joueur ET dans l'échelle d'Eric. Elle prend donc le préfixe `srfh`,
 *  défini au lot 95 comme « ce qui est AMBIGU, ni SRD ni FH, et qui monte dans
 *  LES DEUX piles ». Les deux couches posent alors le MÊME id, le moteur n'en
 *  garde qu'un record, et `shadowed` dit laquelle a recouvert l'autre.
 *
 *  ⛔ Tout le reste porte le sigle du livre. Un objet que seul le DMG connaît
 *  n'a rien d'ambigu : il disparaît quand le joueur éteint le DMG, et c'est
 *  exactement ce qu'Eric demande — « désactiver dmg player et toujours te
 *  raccrocher au SRD ». */
export function idCanonique(genre, slug, { sigle }) {
  const partage = genre === "gem" && Object.hasOwn(GEMMES_DU_LIVRE, slug);
  return partage ? `srfh:${genre}:en:${slug}` : `${sigle.toLowerCase()}:${genre}:en:${slug}`;
}

/* Le rayon des marchandises — le mot du LIVRE, ratifié par Eric le 09/09
   (« remplace mes valuables par trade goods, même étagère partout »). */
export const RAYON = "trade-goods";

/** Où chaque section du chapitre 7 se range. ⭐ QUATRE ÉTAGÈRES, PAS UNE : le
 *  joueur qui cherche un lingot ne cherche pas parmi 52 pierres. */
export const ETAGERES = Object.freeze({
  gemstones: `${RAYON}:gemstones`,
  art_objects: `${RAYON}:art-objects`,
  trade_goods: `${RAYON}:trade-goods`,
  trade_bars: `${RAYON}:trade-bars`
});

function entreeRangement(slug, etagere, genre, id) {
  const [aisle, shelf] = etagere.split(":");
  return {
    [`${id.split(":")[0]}:shelving:en:${slug}`]: {
      name: slug,
      slug,
      data: {
        extends: id,
        of_kind: genre,
        shelf: { aisle, shelf }
      }
    }
  };
}

/**
 * Construit la couche d'un livre. PURE : ni disque ni horloge.
 * @returns {{layer:object, comptes:object, partages:string[]}}
 */
export function construireCouche(source, cle = "dmg-2024") {
  const livre = LIVRES[cle];
  if (!livre) fail(`livre inconnu « ${cle} » — les livres connus sont ${Object.keys(LIVRES).join(", ")}.`);
  if (!source || typeof source !== "object") fail("source absente ou illisible.");

  const gem = {};
  const gear = {};
  const shelving = {};
  const partages = [];
  const vus = new Set();

  const poser = (genre, slug, nom, data, etagere) => {
    const id = idCanonique(genre, slug, livre);
    if (vus.has(id)) fail(`l'id « ${id} » est produit deux fois — deux lignes du livre donnent le même slug.`);
    vus.add(id);
    if (id.startsWith("srfh:")) partages.push(slug);
    (genre === "gem" ? gem : gear)[id] = { name: nom, slug, data };
    Object.assign(shelving, entreeRangement(slug, etagere, genre, id));
    return id;
  };

  /* ── LES GEMMES ── */
  for (const [gp, pierres] of Object.entries(source.gemstones || {})) {
    const valeur = Number(gp);
    if (!Number.isFinite(valeur)) fail(`palier de gemme illisible « ${gp} ».`);
    for (const brut of pierres) {
      const slug = slugDuNom(brut);
      poser("gem", slug, nomCourt(brut), {
        cost: prixSrd(valeur),
        name: nomCourt(brut),
        description: couleurDuNom(brut),
        value_gp: valeur,
        weight: "—",
        source: livre.sigle
      }, ETAGERES.gemstones);
    }
  }

  /* ── LES OBJETS D'ART ── */
  for (const [gp, objets] of Object.entries(source.art_objects || {})) {
    const valeur = Number(gp);
    if (!Number.isFinite(valeur)) fail(`palier d'objet d'art illisible « ${gp} ».`);
    for (const nom of objets) {
      poser("gear", slugDuNom(nom), nom, {
        cost: prixSrd(valeur), name: nom, value_gp: valeur, weight: "—", source: livre.sigle
      }, ETAGERES.art_objects);
    }
  }

  /* ── LES MARCHANDISES ── ⚠️ leur prix n'est PAS en po : « 1 CP », « 5 SP ».
     Il se RECOPIE, il ne se convertit pas — convertir inventerait une précision
     que le livre ne donne pas, et `parseCout` sait déjà lire les trois monnaies. */
  for (const m of source.trade_goods || []) {
    poser("gear", slugDuNom(m.name), m.name, {
      cost: m.cost, name: m.name, unit: m.unit, weight: "—", source: livre.sigle
    }, ETAGERES.trade_goods);
  }

  /* ── LES LINGOTS ── le seul groupe qui ait un VRAI poids en livres. */
  for (const b of source.trade_bars || []) {
    poser("gear", slugDuNom(b.name), b.name, {
      cost: prixSrd(b.gp), name: b.name, value_gp: b.gp,
      weight: `${b.lb} lb.`, weight_lb: b.lb,
      description: b.dimensions, source: livre.sigle
    }, ETAGERES.trade_bars);
  }

  const records = {};
  if (Object.keys(gem).length) records.gem = gem;
  if (Object.keys(gear).length) records.gear = gear;
  if (Object.keys(shelving).length) records.shelving = shelving;

  /* 🔴 LOT 188 — LA COUCHE DOIT SE MONTER PAR LE BLOC `layers`, ET ELLE NE
     LE POUVAIT PAS. Mesuré le 09/09 en tendant le fichier du disque à
     `layers.verbs.register` : « schema vaut « fhpc.layer/1 » — ce bloc ne
     monte que des documents fh-layer/1 », puis `flags` absent, puis
     `attribution` en chaîne là où le lecteur exige `{license, text}`
     (`src/layers/document.mjs`, `assertLayerShape`). L'épreuve des trois
     étages pliait les records à la main, sans jamais passer par le lecteur —
     une bijection fausse est cohérente. Le garde monte désormais la couche
     par le VRAI bloc (`tests/gen-livre-layer.test.mjs`). */
  const layer = {
    schema: "fh-layer/1",
    id: livre.id,
    version: "1.0.0",
    name: livre.nom,
    lang: "en",
    /* Un livre n'allume aucun module moteur : c'est du contenu (« les livres
       rajoutent du homebrew », Eric, 09/09). Le tableau vide est OBLIGATOIRE :
       une couche déclare toujours ses drapeaux, même aucun. */
    flags: [],
    attribution: {
      license: "all-rights-reserved",
      text:
        `${livre.nom} — contenu du livre que le joueur POSSÈDE, importé depuis sa propre ` +
        "bibliothèque D&D Beyond. ⛔ Cette couche ne fait partie d'aucune version publiée : " +
        "elle est produite sur le disque du joueur et n'entre dans aucun commit " +
        "(Eric, 2026-09-09 : « la version officielle ne contiendra pas DMG et player »)."
    },
    description:
      `Chapitre 7 « Treasure » : ${Object.keys(gem).length} gemmes, ` +
      `${Object.keys(gear).length} objets de valeur et marchandises. ` +
      `⚖️ ${partages.length} gemmes portent un id PARTAGÉ avec la couche Fate's Hand ` +
      "(préfixe `srfh`) : c'est la superposition — un seul record, celui de la couche la " +
      "plus haute, jamais deux lignes pour la même pierre.",
    records
  };

  return {
    layer,
    comptes: { gem: Object.keys(gem).length, gear: Object.keys(gear).length, shelving: Object.keys(shelving).length },
    partages: partages.sort()
  };
}

export function generate({ cle = "dmg-2024", dirSources = DIR_SOURCES, dirCouches = DIR_COUCHES } = {}) {
  const livre = LIVRES[cle];
  const chemin = join(dirSources, `${cle}-treasure.json`);
  if (!existsSync(chemin)) {
    fail(`la source « ${chemin} » est absente. ⭐ C'EST NORMAL SUR UN CLONE FRAIS : ` +
      "elle vient de la bibliothèque du JOUEUR et n'est pas versionnée. Rien à réparer, " +
      "rien à combler — il n'y a simplement pas de livre à importer ici.");
  }
  const source = JSON.parse(readFileSync(chemin, "utf8"));
  const { layer, comptes, partages } = construireCouche(source, cle);
  mkdirSync(dirCouches, { recursive: true });
  const sortie = join(dirCouches, `${livre.id}.layer.json`);
  writeFileSync(sortie, `${JSON.stringify(layer, null, 2)}\n`, "utf8");
  return {
    sortie, comptes, partages,
    message:
      `${livre.id} : ${comptes.gem} gemmes + ${comptes.gear} objets, ` +
      `${comptes.shelving} rangements — ⚖️ ${partages.length} ids PARTAGÉS avec Fate's Hand.`
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(generate({ cle: process.argv[2] || "dmg-2024" }).message);
}
