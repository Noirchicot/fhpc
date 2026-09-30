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
   UN ID PARTAGÉ, jamais par patch. C'est ce que fait ce générateur.

   🧬 LOT 387 (ARCHI 35, 30/09) — POUR LES ORIGINES DU PHB, UN RECORD IDENTIQUE AU
   SRD N'EST PAS RÉÉMIS. Le paragraphe du dessus vaut pour les gemmes du DMG ;
   il ne vaut pas pour les arrière-plans, les espèces et les dons. Les livres se
   montent AU-DESSUS de `srfh-mecaniques-en` (engine.mjs), et un `add` remplace
   le record ENTIER (stack.mjs) : réémettre `srd:species:en:dragonborn` effacerait
   ce que `srfh-mecaniques-en` y déclare — la porte d'ascendance, le compteur du
   souffle, le Draconic Flight daté — et la pile FH, qui patche ces records par
   chemin, jetterait. Le SRD 5.2.1 est tiré du PHB 2024 : les 17 records
   partagés disent la même chose. ⇒ La couche n'AJOUTE que ce que le SRD n'a pas
   (ids `xphb:…`) ; les partagés sont COMPARÉS, fait par fait, et chaque écart
   réel est rapporté pour Eric — jamais tranché ici.
   ⛔ ET AUCUNE PROSE DU LIVRE, NULLE PART. L'instantané (`sources-livres/phb-
   2024-origins.json`) porte des FAITS DE JEU (caractéristiques, compétences,
   outils, dons, nombres), et le texte montré au joueur sur un record propre au
   PHB est un RÉSUMÉ, écrit par le lot et marqué comme tel (`data.summary_of`).
   Une déclaration cite un extrait quand la phrase est celle du SRD 5.2.1 (le
   générateur la CHERCHE dans la couche SRD, il ne la décide pas) ; sinon elle
   porte un POINTEUR vers la page du livre chez D&D Beyond (`source`). Le texte
   entier reste dans le livre d'Eric, à l'adresse que porte le record
   (`data.book_link`, la loi des liens).

   🪄 LOT 389 (ARCHI 35, 30/09) — LES SORTS, MÊMES LOIS. L'instantané `sources-livres/phb-2024-
   spells.json` porte les faits de TOUS les sorts du livre (niveau, école, lettres des composantes,
   temps, portée, durée, concentration, rituel, jet ou sauvegarde) ; un sort que le SRD porte aussi
   n'est pas réémis, il est COMPARÉ — y compris quand le livre le nomme autrement : le nom SRD d'un
   sort renommé est une DONNÉE de l'instantané (`srd_name`), jamais une table écrite ici. Un sort
   propre au livre entre avec ses listes de classes, ses dés et types (`damage`, `healing`, des
   DONNÉES que le moteur ne lit pas encore : il déclare les dégâts de sort non dérivés pour tous),
   son mode de résolution (`cast_type`, le nom ratifié du contrat) et un résumé marqué ; son
   pointeur est son `book_link`. ⛔ La matière d'une composante, l'aire et la montée en niveau ne
   sont que dans le résumé ou dans le livre.

   🎖️ LOT 392 (ARCHI 35, 30/09) — LES DONS GÉNÉRAUX, DE STYLE ET ÉPIQUES, MÊMES LOIS. L'instantané
   `sources-livres/phb-2024-feats.json` porte les faits des 65 dons hors origine (les dix d'origine sont
   à l'instantané du lot 387) : catégorie, prérequis, reprise, augmentation de caractéristique, et les
   effets chiffrés relevés sur la page. Un don que le SRD porte aussi n'est pas réémis : sa catégorie,
   son prérequis et sa reprise sont COMPARÉS. Un don propre entre dans sa catégorie avec son prérequis
   dans la forme du SRD (`Prerequisite: …`) — la PORTE qui l'offre est celle qui lit déjà la catégorie :
   un don de style s'offre au Fighter (lot 360, `options_from.category`), un don général ou épique
   attend la porte de Level up. Ses effets entrent dans les formes que le moteur lit déjà (`senses`,
   `armor_training`, `weapon_proficiencies`, `repeatable`, `sheet_uses`) ; le reste se NOMME, avec sa
   raison, dans `restes`. ⚠️ Le niveau d'un prérequis se LIT dans les dons SRD de la même catégorie,
   il n'est pas écrit ici.                                                                           */

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

/** 🔗 LOT 394 — L'ANCRE D'UNE SECTION CHEZ D&D BEYOND. Le compendium nomme la section d'un titre
 *  par ce titre sans rien d'autre que ses lettres et ses chiffres (relevé sur les ids des titres des
 *  chapitres 5 et 7, 30/09) : un titre inventé « Test Fortune » a l'ancre `#TestFortune`, « Quill-Pen of
 *  the North » `#QuillPenoftheNorth`. ⛔ Le nom tel quel (une espace dans l'ancre : le défaut du lot
 *  387) n'est l'ancre de rien — la page s'ouvre en haut. */
export function ancreDuLivre(nom) {
  return String(nom).replace(/[’']/g, "").replace(/[^A-Za-z0-9]/g, "");
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

/* ══ 🧬 LOT 387 — LES ORIGINES DU PHB : arrière-plans, espèces, dons d'origine ══════════════════ */

const NOMS_DE_CARAC = Object.freeze({ str: "Strength", dex: "Dexterity", con: "Constitution",
  int: "Intelligence", wis: "Wisdom", cha: "Charisma" });
/** La famille d'outils que la pile SRD sait nommer par une RACINE (`data.inherits`, lot 247) : l'id de
 *  la racine, et le mot que le livre emploie pour elle. ⛔ Ce ne sont pas des phrases du livre : ce
 *  sont les noms de règle des familles, écrits au SRD (Monk) et dans `srfh-mecaniques-en`. */
const RACINE_ARTISAN = "srfh:tool:en:artisan-s-tools";

/** Toutes les chaînes de texte des records d'origine de la couche SRD — là où le générateur CHERCHE
 *  si une phrase est celle du SRD 5.2.1. */
function textesDuSrd(srd) {
  const textes = [];
  const walk = (o) => {
    if (typeof o === "string") textes.push(o);
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") Object.values(o).forEach(walk);
  };
  for (const genre of ["background", "species", "feat"]) walk(srd.records[genre] || {});
  return textes;
}

/**
 * Construit la couche des ORIGINES du PHB. PURE : ni disque ni horloge.
 * @param {object} source l'instantané des faits (`sources-livres/phb-2024-origins.json`)
 * @param {{srd: object, meca: object}} base les couches SRD et `srfh-mecaniques-en`, lues telles quelles
 * @returns {{layer:object, comptes:object, ecarts:string[], restes:string[]}}
 */
export function construireOrigines(source, { srd, meca }) {
  const livre = LIVRES["phb-2024"];
  if (!source || typeof source !== "object") fail("source des origines absente ou illisible.");
  if (!srd || !srd.records) fail("la couche SRD est requise : c'est elle qu'on compare et qu'on cite.");
  const R = srd.records;
  const sigle = livre.sigle.toLowerCase();
  const sections = source.sections || {};
  const textes = textesDuSrd(srd);
  const phraseDuSrd = (p) => textes.some((t) => t.includes(p));
  const ecarts = [];
  const restes = [];

  const pointeur = (section, url) => ({ livre: "phb-2024", section, url });
  /* une déclaration porte un EXTRAIT quand la phrase est celle du SRD, sinon un POINTEUR */
  const citer = (phrase, section, url) => (phraseDuSrd(phrase) ? { extrait: phrase } : { source: pointeur(section, url) });
  const nomDe = (genre, id) => {
    const r = R[genre] && R[genre][id];
    if (!r) fail(`« ${id} » n'est pas dans la couche SRD — le livre le nomme, la pile ne le connaît pas.`);
    return r.name;
  };
  const idDeDon = (nom) => {
    const srdId = `srd:feat:en:${slugDuNom(nom)}`;
    if (R.feat && R.feat[srdId]) return srdId;
    const propre = (source.feats || []).find((f) => f.name === nom && !f.shared);
    if (!propre) fail(`le don « ${nom} » n'est ni au SRD ni dans l'instantané.`);
    return `${sigle}:feat:en:${slugDuNom(nom)}`;
  };
  /* la famille d'artisanat : les outils que `srfh-mecaniques-en` rattache à la racine (`data.inherits`) */
  const artisans = Object.entries((meca && meca.records && meca.records.tool) || {})
    .filter(([, e]) => e && e.changes && e.changes["data.inherits"] === RACINE_ARTISAN).map(([id]) => id).sort();

  /* ── LES ARRIÈRE-PLANS ── */
  const background = {};
  for (const b of source.backgrounds || []) {
    const slug = slugDuNom(b.name);
    const url = `${sections.background || ""}${ancreDuLivre(b.name)}`;
    const data = {
      ability_keys: b.abilities.slice(),
      ability_scores: b.abilities.map((k) => NOMS_DE_CARAC[k] || fail(`caractéristique inconnue « ${k} » (${b.name}).`)),
      book_link: url,
      equipment: `Choose A or B: (A) ${[...b.kit, `${b.kit_gp} GP`].join(", ")}; or (B) 50 GP`,
      feat: `${b.feat.name}${b.feat.class ? ` (${nomDe("class", `srd:class:en:${b.feat.class}`)})` : ""} (see “Feats”)`,
      feat_id: idDeDon(b.feat.name),
      name: b.name,
      skill_ids: b.skills.map((s) => `srd:skill:en:${s}`),
      skill_proficiencies: b.skills.map((s) => nomDe("skill", `srd:skill:en:${s}`))
    };
    if (b.feat.class) data.feat_option = { id: `srd:class:en:${b.feat.class}`, kind: "class" };
    const choix = { equipement: { ...citer("Choose A or B:", b.name, url), nature: "creation", etape: "equipment", chemin: "depart.background" } };
    if (b.tool.id) {
      data.tool_id = `srd:tool:en:${b.tool.id}`;
      data.tool_proficiency = nomDe("tool", data.tool_id);
    } else {
      const racine = b.tool.family === "artisan" ? null : `srd:tool:en:${b.tool.family}`;
      const nomFamille = racine ? nomDe("tool", racine) : "Artisan’s Tools";
      data.tool_choice = { from: racine ? [racine] : artisans.slice() };
      if (data.tool_choice.from.length === 0) fail(`« ${b.name} » : la famille d'outils « ${b.tool.family} » n'a aucun membre dans la pile.`);
      const phrase = `Choose one kind of ${nomFamille}`;
      data.tool_proficiency = `${phrase} (see “Equipment”)`;
      choix.outil = { ...citer(phrase, b.name, url), nature: "creation", etape: "background", chemin: "background.tool" };
    }
    data[`choix_du_texte:${livre.id}`] = choix;

    const srdId = `srd:background:en:${slug}`;
    const frere = R.background && R.background[srdId];
    if (frere) {
      /* ⭐ PARTAGÉ : pas réémis — comparé, fait par fait */
      const d = frere.data || {};
      const comparer = (champ, a, b2) => {
        if (JSON.stringify(a) !== JSON.stringify(b2)) ecarts.push(`${b.name} · ${champ} : PHB ${JSON.stringify(a)} ≠ SRD ${JSON.stringify(b2)}`);
      };
      comparer("ability_keys", data.ability_keys, d.ability_keys);
      comparer("skill_ids", [...data.skill_ids].sort(), [...(d.skill_ids || [])].sort());
      comparer("feat_id", data.feat_id, d.feat_id);
      comparer("feat_option", data.feat_option || null, d.feat_option || null);
      comparer("outil", data.tool_id || data.tool_choice, d.tool_id || d.tool_choice);
      comparer("equipment", data.equipment, d.equipment);
      continue;
    }
    background[`${sigle}:background:en:${slug}`] = { name: b.name, slug, data };
  }

  /* ── LES ESPÈCES PARTAGÉES : comparées par les noms de leurs traits ── */
  for (const s of source.species_shared || []) {
    const frere = R.species && R.species[`srd:species:en:${slugDuNom(s.name)}`];
    if (!frere) { ecarts.push(`${s.name} : le SRD ne porte pas cette espèce`); continue; }
    const srdTraits = (frere.data.traits || []).map((t) => t.name).sort();
    const phb = [...s.traits].sort();
    if (JSON.stringify(srdTraits) !== JSON.stringify(phb)) {
      ecarts.push(`${s.name} · traits : PHB ${JSON.stringify(phb)} ≠ SRD ${JSON.stringify(srdTraits)} (lu sur : ${s.lu_sur})`);
    }
  }

  /* ── LES ESPÈCES PROPRES AU PHB ── */
  const species = {};
  for (const s of source.species_new || []) {
    const slug = slugDuNom(s.name);
    const ptr = (section) => pointeur(`${s.name} · ${section}`, s.url);
    const traits = s.traits.map((t) => ({ id: slugDuNom(t.name), name: t.name, slug: slugDuNom(t.name), text: t.resume }));
    const data = {
      book_link: s.url,
      creature_type: s.creature_type,
      description: s.resume,
      name: s.name,
      senses: s.darkvision_ft ? [{ id: "darkvision", name: "Darkvision", range_ft: s.darkvision_ft }] : [],
      size: s.size_text,
      speed: `${s.speed_ft} feet`,
      speed_ft: s.speed_ft,
      summary_of: "phb-2024",
      traits
    };
    const choix = {};
    /* la taille à choisir : la forme de la phrase SRD (« Medium (…) or Small (…), chosen when you
       select this species »), trouvée par sa FORME, jamais recopiée ici */
    const taille = typeof s.size_text === "string" && s.size_text.match(/^(Medium \([^)]*\)) or (Small \([^)]*\)), (chosen when you select this species)$/);
    if (taille) {
      data.size_choice = { ...citer(taille[3], s.name, s.url), options: [
        { id: "medium", name: "Medium", ...citer(taille[1], s.name, s.url) },
        { id: "small", name: "Small", ...citer(taille[2], s.name, s.url) }] };
      choix.taille = { ...citer(taille[3], s.name, s.url), nature: "creation", etape: "species", chemin: "species.size" };
    }
    const usages = [];
    const niveaux = [];
    for (const t of s.traits) {
      const id = slugDuNom(t.name);
      if (Number.isInteger(t.level) && t.level > 1) niveaux.push({ trait: id, level: t.level, source: ptr(t.name) });
      if (t.uses && Number.isInteger(t.uses.max)) {
        const u = { trait: id, max: { fixed: t.uses.max }, recharge: t.uses.recharge, source: ptr(t.name) };
        if (t.economy) u.action = { economy: t.economy, category: t.heal ? "healing" : "utility", source: ptr(t.name) };
        usages.push(u);
      }
      if (t.heal) restes.push(`${s.name} · ${t.name} : les dés de soin (un d4 par point du bonus de maîtrise) — la forme n'existe pas au moteur`);
      if (t.resistances) restes.push(`${s.name} · ${t.name} : les résistances — le moteur ne lit pas de résistance d'espèce (celles du SRD sont dans le texte aussi)`);
      if (t.cantrip) restes.push(`${s.name} · ${t.name} : le sort de trait à caractéristique FIXE — le moteur ne rattache un sort d'espèce qu'à une lignée choisie`);
      if (t.options) restes.push(`${s.name} · ${t.name} : les formes au choix et leurs effets — hors des trois cases, et au niveau ${t.level}`);
    }
    if (usages.length) data.trait_uses = usages;
    if (niveaux.length) data.trait_levels = niveaux;
    if (Object.keys(choix).length) data[`choix_du_texte:${livre.id}`] = choix;
    species[`${sigle}:species:en:${slug}`] = { name: s.name, slug, data };
  }

  /* ── LES DONS D'ORIGINE ── */
  const feat = {};
  for (const f of source.feats || []) {
    const slug = slugDuNom(f.name);
    if (f.shared) {
      const frere = R.feat && R.feat[`srd:feat:en:${slug}`];
      if (!frere) ecarts.push(`${f.name} : le SRD ne porte pas ce don`);
      else if (frere.data.category !== "origin") ecarts.push(`${f.name} · catégorie : SRD « ${frere.data.category} »`);
      continue;
    }
    const url = `${sections.feat || ""}${ancreDuLivre(f.name)}`;
    const data = { book_link: url, category: "origin", description: f.resume, name: f.name, prerequisite: null, summary_of: "phb-2024" };
    if (f.luck_points && f.luck_points.max === "proficiency") {
      data.sheet_uses = [{ id: slugDuNom(`${f.name} points`), max: { proficiency: 1 }, recharge: f.luck_points.recharge, source: pointeur(f.name, url) }];
    }
    for (const [cle2, raison] of [["tools", "trois outils d'une FAMILLE au choix — le moteur ne sait pas borner un choix d'outils à une famille"],
      ["discount_pct", "une remise d'achat — l'Équipement ne porte aucune règle de jeu"],
      ["unarmed_damage", "les dégâts de l'Unarmed Strike — le moteur lit ceux du glossaire, pas ceux d'un don"],
      ["hp_per_level", "les points de vie par niveau — la fiche ne dérive pas encore les PV d'un don"]]) {
      if (f[cle2] !== undefined) restes.push(`${f.name} : ${raison}`);
    }
    feat[`${sigle}:feat:en:${slug}`] = { name: f.name, slug, data };
  }

  const records = {};
  if (Object.keys(background).length) records.background = background;
  if (Object.keys(species).length) records.species = species;
  if (Object.keys(feat).length) records.feat = feat;
  const layer = {
    schema: "fh-layer/1",
    id: livre.id,
    version: "1.0.0",
    name: livre.nom,
    lang: "en",
    flags: [],
    attribution: {
      license: "all-rights-reserved",
      text:
        `${livre.nom} — faits de jeu du livre que le joueur POSSÈDE, relevés dans sa propre ` +
        "bibliothèque D&D Beyond ; les textes sont des RÉSUMÉS, le texte entier reste chez D&D Beyond. " +
        "⛔ Cette couche ne fait partie d'aucune version publiée : elle est produite sur le disque du " +
        "joueur et n'entre dans aucun commit (Eric, 2026-09-09 : « la version officielle ne contiendra " +
        "pas DMG et player »)."
    },
    description:
      `Chapitres 4 et 5 « Character Origins » et « Feats » (origines) : ${Object.keys(background).length} arrière-plans, ` +
      `${Object.keys(species).length} espèce(s), ${Object.keys(feat).length} dons d'origine PROPRES au livre. ` +
      "⚖️ Les records que le SRD 5.2.1 porte aussi ne sont PAS réémis : ils sont comparés (lot 387).",
    records
  };
  return {
    layer,
    comptes: { background: Object.keys(background).length, species: Object.keys(species).length, feat: Object.keys(feat).length },
    ecarts,
    restes
  };
}

/* ══ 🪄 LOT 389 — LES SORTS DU PHB ═════════════════════════════════════════════════════════════════ */

/** Les formes du compendium, ramenées à celles de la couche SRD. ⛔ Ce sont des RÈGLES d'écriture
 *  (« 1 Action » s'écrit « Action » au SRD, « 60 ft. » s'écrit « 60 feet »), pas des phrases du livre. */
const apostrophe = (s) => String(s).replace(/’/g, "'");
const tempsDuSrd = (t) => String(t).replace(/ or Ritual$/, "").replace(/,.*$/s, "").replace(/^(Action|Bonus Action|Reaction)$/, "1 $1").toLowerCase();
const tempsDuLivre = (t) => String(t).replace(/\s*\*$/, "").toLowerCase();
const dureeDuSrd = (d) => String(d).replace(/^Concentration,? up to /, "").replace(/^Up to /, "").toLowerCase();
const porteeDuSrd = (p) => String(p).replace(/ feet$/, " ft.").toLowerCase();
const lettresDuSrd = (c) => String(c).replace(/\s*\(.*$/s, "");
/** et dans l'autre sens : la forme du compendium écrite comme la couche SRD écrit ses sorts */
const tempsEcrit = (t, rituel) => {
  const base = String(t).replace(/\s*\*$/, "").replace(/^1 (Action|Bonus Action|Reaction)$/, "$1")
    .replace(/^(\d+) (Minute|Hour)s?$/, (m, n, u) => `${n} ${u.toLowerCase()}${n === "1" ? "" : "s"}`);
  return rituel ? `${base} or Ritual` : base;
};
const dureeEcrite = (d, concentration) => {
  const base = /^(\d+) (Round|Minute|Hour|Day)s?$/.test(d) ? d.toLowerCase() : d.replace(/^Until Dispelled/, "Until dispelled");
  return concentration ? `Concentration, up to ${base}` : base;
};
const porteeEcrite = (p) => String(p).replace(/^(\d+) ft\.$/, "$1 feet");
const CARAC_DE_SAUVEGARDE = /^(STR|DEX|CON|INT|WIS|CHA) Save$/;

/**
 * Construit les SORTS du PHB. PURE : ni disque ni horloge.
 * @param {object} source l'instantané des faits (`sources-livres/phb-2024-spells.json`)
 * @param {{srd: object}} base la couche SRD, lue telle quelle
 * @returns {{records:object, comptes:object, ecarts:string[], renommes:string[], restes:string[]}}
 */
export function construireSorts(source, { srd }) {
  const livre = LIVRES["phb-2024"];
  if (!source || !Array.isArray(source.spells)) fail("source des sorts absente ou illisible.");
  if (!srd || !srd.records || !srd.records.spell) fail("la couche SRD est requise : c'est elle qu'on compare.");
  const sigle = livre.sigle.toLowerCase();
  const parNom = new Map(Object.values(srd.records.spell).map((r) => [apostrophe(r.name), r]));
  const nomsDeClasse = new Set(Object.values(srd.records.class || {}).map((c) => c.name));
  const ecarts = [];
  const renommes = [];
  const vus = new Set();
  const spell = {};
  const parNiveau = {};
  let sansDes = 0;
  for (const s of source.spells) {
    const nomSrd = apostrophe(s.srd_name || s.name);
    const frere = parNom.get(nomSrd);
    if (frere) {
      /* ⭐ PARTAGÉ : pas réémis — comparé, fait par fait */
      if (vus.has(nomSrd)) fail(`deux sorts du livre répondent au même sort SRD « ${nomSrd} ».`);
      vus.add(nomSrd);
      if (s.srd_name) renommes.push(`${s.name} = ${frere.name} (SRD)`);
      const d = frere.data || {};
      const E = (champ, srdV, phbV) => { if (srdV !== phbV) ecarts.push(`${s.name} · ${champ} : SRD « ${srdV} » / PHB « ${phbV} »`); };
      E("niveau", d.level, s.level);
      E("école", d.school, s.school);
      E("concentration", d.concentration, s.concentration);
      E("rituel", d.ritual, s.ritual);
      E("composantes", lettresDuSrd(d.components), s.components.join(", "));
      /* « Special * » : le compendium abrège un temps conditionnel — rien à comparer */
      if (!/^Special/.test(s.casting_time)) E("temps d'incantation", tempsDuSrd(d.casting_time), tempsDuLivre(s.casting_time));
      E("durée", dureeDuSrd(d.duration), String(s.duration).toLowerCase());
      E("portée", porteeDuSrd(d.range), String(s.range).toLowerCase());
      continue;
    }
    if (s.srd_name) fail(`« ${s.name} » dit s'appeler « ${s.srd_name} » au SRD, qui ne porte pas ce nom.`);
    for (const champ of ["url", "classes", "resume"]) {
      if (!s[champ] || (Array.isArray(s[champ]) && s[champ].length === 0)) fail(`le sort propre au livre « ${s.name} » n'a pas de « ${champ} » dans l'instantané.`);
    }
    for (const c of s.classes) if (!nomsDeClasse.has(c)) fail(`« ${s.name} » : la classe « ${c} » n'est pas une classe de la pile.`);
    const slug = slugDuNom(s.name);
    const sauvegarde = typeof s.attack_save === "string" && s.attack_save.match(CARAC_DE_SAUVEGARDE);
    const data = {
      book_link: s.url,
      cantrip: s.level === 0,
      cast_type: sauvegarde ? "save" : (s.attack_save === "Melee" || s.attack_save === "Ranged") ? "attack" : "none",
      casting_time: tempsEcrit(s.casting_time, s.ritual),
      class_keys: s.classes.slice(),
      classes: s.classes.slice(),
      components: s.components.join(", "),
      concentration: s.concentration,
      description: s.resume,
      duration: dureeEcrite(s.duration, s.concentration),
      level: s.level,
      name: s.name,
      range: porteeEcrite(s.range),
      ritual: s.ritual,
      school: s.school,
      school_key: s.school,
      summary_of: "phb-2024"
    };
    if (sauvegarde) data.save_ability = sauvegarde[1].toLowerCase();
    if (s.attack_save === "Melee" || s.attack_save === "Ranged") data.attack_range = s.attack_save.toLowerCase();
    if (s.damage) data.damage = s.damage.map((x) => ({ ...x }));
    if (s.healing) data.healing = { ...s.healing };
    if (!s.damage && !s.healing) sansDes += 1;
    spell[`${sigle}:spell:en:${slug}`] = { name: s.name, slug, data };
    parNiveau[s.level] = (parNiveau[s.level] || 0) + 1;
  }
  /* ⚔️ la bijection se relit dans l'autre sens : quand l'instantané DÉCLARE couvrir tout le chapitre
     (`meta.complet`), chaque sort SRD doit y avoir son frère — un sort perdu à la lecture se nomme */
  if (source.meta && source.meta.complet === true) {
    for (const nom of parNom.keys()) if (!vus.has(nom)) ecarts.push(`${nom} : le SRD porte ce sort, l'instantané du livre ne le nomme pas`);
  }
  const restes = [
    `les dés et types de dégâts ou de soin de ${Object.keys(spell).length - sansDes} sorts : posés en données (damage, healing), le moteur ne les lit pas — il déclare les dégâts de sort non dérivés, pour tous les sorts`,
    "l'aire d'effet, la matière des composantes et la montée en niveau : dans le résumé ou dans le livre, jamais en champ",
    "le déclencheur d'un temps d'incantation conditionnel (« juste après avoir touché… ») : dans le résumé"
  ];
  return { records: { spell }, comptes: { spell: Object.keys(spell).length, par_niveau: parNiveau, partages: vus.size }, ecarts, renommes, restes };
}

/* ══ 🎖️ LOT 392 — LES DONS DU PHB HORS ORIGINE ═══════════════════════════════════════════════════════ */

/** Les faits d'un don qui n'ont pas de forme au moteur, et pourquoi. ⛔ Des NOMS de faits et des
 *  raisons, jamais une phrase du livre. */
const FAITS_SANS_FORME = Object.freeze({
  speed_bonus_ft: "le bonus de vitesse — le moteur ne lit la vitesse que sur l'espèce",
  climb_speed: "la vitesse d'escalade — le moteur ne lit la vitesse que sur l'espèce",
  hp_max_bonus: "le bonus de points de vie maximum — la fiche ne dérive pas encore les PV d'un don",
  tool: "l'outil maîtrisé d'office — aucune forme de maîtrise d'outil fixe sur un don",
  spells: "les sorts que le don donne, et leur lancement sans emplacement — les formes de sorts d'un don (`spell_list_choice`, `spell_uses`) ne vivent que sous un don d'origine",
  skill_or_expertise: "la compétence ou l'Expertise au choix — aucune forme d'Expertise conditionnelle",
  skill_choice: "la compétence au choix — la forme `proficiency_choice` ne s'ouvre que sous un don d'origine",
  expertise: "l'Expertise au choix — aucune forme d'Expertise sur un don",
  all_skills: "la maîtrise de toutes les compétences — aucune forme",
  save_proficiency: "la maîtrise de sauvegarde au choix — aucune forme",
  resistance_choice: "les résistances au choix — le moteur ne lit pas de résistance"
});

/**
 * Construit les DONS du PHB hors origine. PURE : ni disque ni horloge.
 * @param {object} source l'instantané des faits (`sources-livres/phb-2024-feats.json`)
 * @param {{srd: object, origines?: object}} base la couche SRD, et les dons d'origine déjà construits
 * @returns {{records:object, comptes:object, ecarts:string[], restes:string[]}}
 */
export function construireDons(source, { srd, origines = {} }) {
  const livre = LIVRES["phb-2024"];
  if (!source || !Array.isArray(source.feats)) fail("source des dons absente ou illisible.");
  if (!srd || !srd.records || !srd.records.feat) fail("la couche SRD est requise : c'est elle qu'on compare.");
  const sigle = livre.sigle.toLowerCase();
  const parNom = new Map(Object.values(srd.records.feat).map((r) => [apostrophe(r.name), r]));
  /* le prérequis de chaque catégorie, LU dans les dons SRD : « Level 4+ » (general), « Level 19+ »
     (epic-boon), « Fighting Style Feature » (fighting-style) — la tête commune de leurs prérequis */
  const tetes = new Map();
  for (const r of parNom.values()) {
    const p = r.data.prerequisite;
    if (typeof p !== "string") continue;
    const tete = p.replace(/^Prerequisite: /, "").split(/[,;]/)[0].trim();
    tetes.set(r.data.category, [...(tetes.get(r.data.category) || []), tete]);
  }
  const teteDe = (categorie) => {
    const t = [...new Set(tetes.get(categorie) || [])];
    return t.length === 1 ? t[0] : null;
  };
  const textes = textesDuSrd(srd);
  const phraseDuSrd = (p) => textes.some((t) => t.includes(p));
  const REPRISE = "You can take this feat more than once";
  const ecarts = [];
  const restes = [];
  const vus = new Set();
  const feat = {};
  const parCategorie = {};
  for (const f of source.feats) {
    if (f.category === "origin") fail(`« ${f.name} » : un don d'origine vit dans l'instantané des origines (lot 387).`);
    if (!teteDe(f.category)) fail(`« ${f.name} » : la catégorie « ${f.category} » n'a pas de prérequis unique au SRD.`);
    const frere = parNom.get(apostrophe(f.name));
    if (frere) {
      /* ⭐ PARTAGÉ : pas réémis — comparé, fait par fait */
      vus.add(apostrophe(f.name));
      const d = frere.data || {};
      const E = (champ, srdV, phbV) => { if (JSON.stringify(srdV) !== JSON.stringify(phbV)) ecarts.push(`${f.name} · ${champ} : SRD « ${srdV} » / PHB « ${phbV} »`); };
      E("catégorie", d.category, f.category);
      E("prérequis", d.prerequisite || null, f.prerequisite ? `Prerequisite: ${f.prerequisite}` : null);
      E("reprise", /Repeatable\./.test(d.description || ""), f.repeatable === true);
      continue;
    }
    for (const champ of ["url", "resume", "prerequisite"]) {
      if (typeof f[champ] !== "string" || f[champ] === "") fail(`le don propre au livre « ${f.name} » n'a pas de « ${champ} » dans l'instantané.`);
    }
    const tete = teteDe(f.category);
    if (f.prerequisite.split(/[,;]/)[0].trim() !== tete) {
      fail(`« ${f.name} » (${f.category}) : le prérequis « ${f.prerequisite} » ne commence pas par « ${tete} », comme ceux du SRD.`);
    }
    const slug = slugDuNom(f.name);
    const id = `${sigle}:feat:en:${slug}`;
    if (origines[id]) fail(`« ${f.name} » : l'id ${id} est déjà un don d'origine du livre.`);
    const ptr = (section) => ({ livre: "phb-2024", section: `${f.name} · ${section}`, url: f.url });
    const data = {
      book_link: f.url,
      category: f.category,
      description: f.resume,
      name: f.name,
      prerequisite: `Prerequisite: ${f.prerequisite}`,
      summary_of: "phb-2024"
    };
    if (f.ability_increase) {
      const a = f.ability_increase;
      if (!Array.isArray(a.from) || a.from.length === 0 || a.from.some((k) => !NOMS_DE_CARAC[k])) fail(`« ${f.name} » : augmentation de caractéristique illisible.`);
      data.ability_increase = { ...a, from: a.from.slice() };
    }
    if (f.repeatable === true) {
      if (!phraseDuSrd(REPRISE)) fail("la phrase de reprise n'est plus au SRD : la déclaration ne peut pas la citer.");
      data.repeatable = { extrait: REPRISE };
    }
    const F = f.faits || {};
    if (Array.isArray(F.senses)) data.senses = F.senses.map((s) => ({ ...s }));
    if (typeof F.armor_training === "string") data.armor_training = F.armor_training;
    if (typeof F.weapon_proficiencies === "string") data.weapon_proficiencies = F.weapon_proficiencies;
    if (Array.isArray(F.weapon_proficiency_categories)) data.weapon_proficiency_categories = F.weapon_proficiency_categories.slice();
    if (Array.isArray(F.uses)) {
      data.sheet_uses = F.uses.map((u) => ({ id: u.id, max: { fixed: u.max }, recharge: u.recharge, source: ptr(u.name) }));
    }
    for (const [cle2, raison] of Object.entries(FAITS_SANS_FORME)) {
      if (F[cle2] !== undefined) restes.push(`${f.name} : ${raison}`);
    }
    feat[id] = { name: f.name, slug, data };
    parCategorie[f.category] = (parCategorie[f.category] || 0) + 1;
  }
  /* ⚔️ la bijection se relit dans l'autre sens : un instantané COMPLET nomme chaque don SRD hors origine */
  if (source.meta && source.meta.complet === true) {
    for (const [nom, r] of parNom) if (r.data.category !== "origin" && !vus.has(nom)) ecarts.push(`${nom} : le SRD porte ce don, l'instantané du livre ne le nomme pas`);
  }
  restes.push(
    "l'augmentation de caractéristique (`ability_increase`) : posée en donnée, aucune porte ne la lit — un don général ou épique ne se prend qu'au Level up",
    "les dons généraux et épiques : au catalogue, aucune porte ne les offre avant le lot Level up",
    "les effets de combat des dons de style (dégâts, réactions, vision) : le trait se pose avec son résumé, la fiche ne chiffre rien"
  );
  return { records: { feat }, comptes: { feat: Object.keys(feat).length, par_categorie: parCategorie, partages: vus.size }, ecarts, restes };
}

/* ══ 💍 LOT 394 — LES OBJETS MAGIQUES DU DMG ═════════════════════════════════════════════════════════ */

/** Les conditions d'un effet d'objet, telles que l'inventaire du lot 289 les nomme — relues dans le
 *  moteur (`effets-objets.mjs`), jamais inventées ici. */
const CONDITIONS_D_EFFET = new Set(["porte", "tenu", "harmonise+porte", "harmonise+tenu", "harmonise", "active", "consomme", "toujours"]);

/** La rareté d'un objet partagé ramenée à la forme de la liste du compendium : le SRD y ajoute
 *  l'harmonisation entre parenthèses, et écrit « Rarity Varies » ou l'énumération des variantes. */
const rareteDuSrd = (r) => {
  const base = String(r || "").replace(/\s*\(Requires Attunement[^)]*\)\s*$/, "").trim();
  return /Varies|, or /.test(base) ? "varies" : base.toLowerCase();
};

/**
 * Construit les OBJETS MAGIQUES du DMG qui ne sont pas au SRD, et leur rangement. PURE.
 * @param {object} source l'instantané des faits (`sources-livres/dmg-2024-magic-items.json`)
 * @param {{srd: object, rangement: object}} base la couche SRD et la couche de rangement (`srfh-shelving-en`)
 * @returns {{records:object, comptes:object, ecarts:string[], renommes:string[], restes:string[], analogies:object[]}}
 */
export function construireObjets(source, { srd, rangement }) {
  const livre = LIVRES["dmg-2024"];
  if (!source || !Array.isArray(source.items)) fail("source des objets magiques absente ou illisible.");
  if (!srd || !srd.records || !srd.records.item) fail("la couche SRD est requise : c'est elle qu'on compare.");
  if (!rangement || !rangement.records || !rangement.records.shelving) fail("la couche de rangement est requise : c'est elle qui dit où va un objet.");
  const sigle = livre.sigle.toLowerCase();
  const parNom = new Map(Object.values(srd.records.item).map((r) => [apostrophe(r.name), r]));
  const idParNom = new Map(Object.entries(srd.records.item).map(([id, r]) => [apostrophe(r.name), id]));
  /* le rangement SRD de chaque objet, par son id ; et, par catégorie hors merveilleux, le rangement
     unique que la table déduit de la catégorie (`derived:item.category`) — LU, jamais écrit ici */
  const rangementDe = new Map();
  for (const r of Object.values(rangement.records.shelving)) {
    if (r && r.data && r.data.of_kind === "item") rangementDe.set(r.data.extends, r.data);
  }
  const parCategorie = new Map();
  for (const [id, r] of Object.entries(srd.records.item)) {
    const cat = r.data.category;
    const rg = rangementDe.get(id);
    if (cat === "wondrous-item" || !rg) continue;
    const cle = JSON.stringify([rg.shelf.aisle, rg.shelf.shelf, rg.slot && rg.slot.state, rg.slot && rg.slot.slot]);
    parCategorie.set(cat, [...(parCategorie.get(cat) || []), cle]);
  }
  const rangementDeLaCategorie = (cat) => {
    const vus = [...new Set(parCategorie.get(cat) || [])];
    if (vus.length !== 1) fail(`la catégorie « ${cat} » n'a pas un rangement unique au SRD (${vus.length}) : pas de déduction possible.`);
    const [aisle, shelf, state, slot] = JSON.parse(vus[0]);
    return { aisle, shelf, state, slot };
  };

  const ecarts = [];
  const renommes = [];
  const restes = [];
  const analogies = [];
  const vus = new Set();
  const item = {};
  const shelving = {};
  const parCat = {};
  for (const o of source.items) {
    const nomSrd = apostrophe(o.srd_name || o.variant_of || o.name);
    const frere = parNom.get(nomSrd);
    if (o.shared) {
      /* ⭐ PARTAGÉ : pas réémis — comparé, fait par fait */
      if (!frere) fail(`« ${o.name} » se dit partagé, mais le SRD ne porte pas « ${nomSrd} ».`);
      vus.add(nomSrd);
      if (o.srd_name) renommes.push(`${o.name} = ${frere.name} (SRD)`);
      const d = frere.data;
      if (d.category !== o.category) ecarts.push(`${o.name} · catégorie : SRD « ${d.category} » / DMG « ${o.category} »`);
      const attSrd = d.attunement === true || /Requires Attunement/.test(d.rarity || "");
      if (attSrd !== (o.attunement === true)) ecarts.push(`${o.name} · harmonisation : SRD « ${attSrd} » / DMG « ${o.attunement === true} »`);
      if (o.variant_of) {
        /* une variante (« Armor, +1 ») : sa rareté est l'un des paliers que le SRD énumère */
        const plus = (o.name.match(/\+(\d)$/) || [])[1];
        if (plus && !new RegExp(`${o.rarity}\\s*\\(\\+${plus}\\)`, "i").test(d.rarity || "") && !/Varies/i.test(d.rarity || "")) {
          ecarts.push(`${o.name} · rareté : SRD « ${d.rarity} » / DMG « ${o.rarity} »`);
        }
      } else if (rareteDuSrd(d.rarity) !== String(o.rarity).toLowerCase()) {
        ecarts.push(`${o.name} · rareté : SRD « ${d.rarity} » / DMG « ${o.rarity} »`);
      }
      continue;
    }
    if (frere) fail(`« ${o.name} » est au SRD : il ne peut pas être propre au livre.`);
    for (const champ of ["url", "resume", "rarity", "category"]) {
      if (typeof o[champ] !== "string" || o[champ] === "") fail(`l'objet propre au livre « ${o.name} » n'a pas de « ${champ} » dans l'instantané.`);
    }
    if (o.attunement === true && !/Requires Attunement/.test(o.rarity)) fail(`« ${o.name} » : l'harmonisation n'est pas écrite dans sa rareté, comme au SRD.`);
    if (o.attunement !== true && /Requires Attunement/.test(o.rarity)) fail(`« ${o.name} » : une rareté qui demande l'harmonisation sur un objet qui ne la demande pas.`);
    const slug = slugDuNom(o.name);
    const id = `${sigle}:item:en:${slug}`;
    if (item[id]) fail(`l'id « ${id} » est produit deux fois.`);
    const ptr = (section) => ({ livre: "dmg-2024", section: `${o.name} · ${section}`, url: o.url });
    const data = {
      attunement: o.attunement === true,
      book_link: o.url,
      category: o.category,
      description: o.resume,
      name: o.name,
      rarity: o.rarity,
      subtype: o.subtype || null,
      summary_of: "dmg-2024"
    };
    if (o.charges) data.charges = { ...o.charges };
    if (Array.isArray(o.effects) && o.effects.length) {
      data.effects = o.effects.map((e) => {
        if (!CONDITIONS_D_EFFET.has(e.condition)) fail(`« ${o.name} » : condition d'effet inconnue « ${e.condition} ».`);
        if (e.famille !== "chiffre" || typeof e.cible !== "string" || typeof e.mode !== "string" || !Number.isInteger(e.valeur)) {
          fail(`« ${o.name} » : un effet déclaré n'a pas la forme de l'inventaire du lot 289.`);
        }
        const { section, ...forme } = e;
        return { ...forme, source: ptr(section || "effect") };
      });
    }
    if (o.reste) restes.push(`${o.name} : ${o.reste}`);
    item[id] = { name: o.name, slug, data };
    parCat[o.category] = (parCat[o.category] || 0) + 1;

    /* ── LE RANGEMENT ── déduit de la catégorie, ou PROPOSÉ par analogie pour un merveilleux */
    let shelf;
    let slot;
    if (o.category === "wondrous-item") {
      const r = o.rangement;
      if (!r || typeof r.like !== "string" || typeof r.shelf !== "string") fail(`« ${o.name} » : un objet merveilleux sans rangement proposé ni modèle.`);
      const modele = idParNom.get(apostrophe(r.like));
      const rg = modele && rangementDe.get(modele);
      if (!rg) fail(`« ${o.name} » : le modèle « ${r.like} » n'est pas un objet rangé du SRD.`);
      const [aisle, etagere] = r.shelf.split(":");
      if (rg.shelf.aisle !== aisle || rg.shelf.shelf !== etagere) {
        fail(`« ${o.name} » : rangé « comme ${r.like} », mais ${r.like} est sur ${rg.shelf.aisle}:${rg.shelf.shelf}, pas sur ${r.shelf}.`);
      }
      const place = rg.slot && rg.slot.state === "worn" ? rg.slot.slot : "not_worn";
      if (place !== r.slot) fail(`« ${o.name} » : emplacement « ${r.slot} », mais ${r.like} est « ${place} ».`);
      const comme = `proposed:like ${r.like} (Eric's marvels table, 21/08) — lot 394, to validate`;
      shelf = { aisle, like: r.like, provenance: comme, shelf: etagere, shelf_provisional: true };
      slot = r.slot === "not_worn"
        ? { like: r.like, provenance: comme, state: "not_worn", worn: false }
        : { like: r.like, provenance: comme, slot: r.slot, state: "worn", worn: true };
      analogies.push({ name: o.name, shelf: r.shelf, slot: r.slot, like: r.like });
    } else {
      const c = rangementDeLaCategorie(o.category);
      shelf = { aisle: c.aisle, provenance: "derived:item.category (lot 394, read in srfh-shelving)", shelf: c.shelf };
      slot = c.state === "worn" ? { provenance: "derived:item.category", slot: c.slot, state: "worn", worn: true }
        : c.state === "from_base" ? { from_base: true, provenance: "derived:item.category; the slot is the base's, chosen at purchase", state: "from_base", worn: true }
        : { provenance: `derived:item.category = ${o.category}`, state: "not_worn", worn: false };
    }
    shelving[`${sigle}:shelving:en:${slug}`] = {
      name: o.name,
      slug,
      data: { craftable: { provenance: "derived:record kind item", value: false }, extends: id, name: o.name, of_kind: "item", shelf, slot }
    };
  }
  /* ⚔️ la bijection relue dans l'autre sens : un instantané COMPLET nomme chaque objet du SRD */
  if (source.meta && source.meta.complet === true) {
    for (const nom of parNom.keys()) if (!vus.has(nom)) ecarts.push(`${nom} : le SRD porte cet objet, l'instantané du livre ne le nomme pas`);
  }
  restes.push(
    "les charges et leur recharge (`charges`) : posées en donnée quand le livre les chiffre, aucun organe ne les lit — le reste des usages est dans le résumé",
    "les bonus d'attaque et de dégâts des armes magiques (+1 à +3) et leurs dégâts en plus : le moteur ne chiffre pas encore un effet d'objet sur une attaque",
    "les sens, résistances, immunités, sorts et actions des objets : dans le résumé ou dans le livre"
  );
  return {
    records: { item, shelving },
    comptes: { item: Object.keys(item).length, par_categorie: parCat, partages: vus.size, analogies: analogies.length },
    ecarts, renommes, restes, analogies
  };
}

export function generate({ cle = "dmg-2024", dirSources = DIR_SOURCES, dirCouches = DIR_COUCHES } = {}) {
  const livre = LIVRES[cle];
  if (cle === "phb-2024") return genererOrigines({ dirSources, dirCouches });
  const chemin = join(dirSources, `${cle}-treasure.json`);
  if (!existsSync(chemin)) {
    fail(`la source « ${chemin} » est absente. ⭐ C'EST NORMAL SUR UN CLONE FRAIS : ` +
      "elle vient de la bibliothèque du JOUEUR et n'est pas versionnée. Rien à réparer, " +
      "rien à combler — il n'y a simplement pas de livre à importer ici.");
  }
  const source = JSON.parse(readFileSync(chemin, "utf8"));
  const { layer, comptes, partages } = construireCouche(source, cle);
  /* 💍 LOT 394 — les objets magiques du DMG entrent dans la MÊME couche que ses trésors (un livre, un
     fichier). Leur instantané absent se DIT dans le message ; il n'efface pas les trésors. */
  const cheminObjets = join(dirSources, `${cle}-magic-items.json`);
  let objets = null;
  if (cle === "dmg-2024" && existsSync(cheminObjets)) {
    const lire = (p) => JSON.parse(readFileSync(p, "utf8"));
    objets = construireObjets(lire(cheminObjets), {
      srd: lire(join(REPO_ROOT, "layers", "srd-5.2.1-en.layer.json")),
      rangement: lire(join(REPO_ROOT, "layers", "srfh-shelving-en.layer.json"))
    });
    for (const id of Object.keys(objets.records.shelving)) {
      if (layer.records.shelving && layer.records.shelving[id]) fail(`le rangement « ${id} » existe déjà parmi les trésors.`);
    }
    layer.records.item = objets.records.item;
    layer.records.shelving = { ...(layer.records.shelving || {}), ...objets.records.shelving };
    layer.description += ` Chapitre 7, « Magic Items A–Z » : ${objets.comptes.item} objets magiques PROPRES au livre ` +
      `(${objets.comptes.analogies} objets merveilleux rangés PAR ANALOGIE avec la table d'Eric, marqués provisoires) ; ` +
      `${objets.comptes.partages} objets du SRD comparés, pas réémis (lot 394).`;
  }
  mkdirSync(dirCouches, { recursive: true });
  const sortie = join(dirCouches, `${livre.id}.layer.json`);
  writeFileSync(sortie, `${JSON.stringify(layer, null, 2)}\n`, "utf8");
  return {
    sortie, comptes, partages, objets,
    message:
      `${livre.id} : ${comptes.gem} gemmes + ${comptes.gear} objets, ` +
      `${comptes.shelving} rangements — ⚖️ ${partages.length} ids PARTAGÉS avec Fate's Hand.` +
      (objets
        ? ` Objets magiques : ${objets.comptes.item} propres au livre (${JSON.stringify(objets.comptes.par_categorie)}), ` +
          `${objets.comptes.partages} du SRD comparés, ${objets.ecarts.length} écart(s)${objets.ecarts.length ? ` — ${objets.ecarts.join(" ; ")}` : ""}, ` +
          `${objets.renommes.length} renommés, ${objets.restes.length} faits restés en texte.`
        : cle === "dmg-2024" ? " Objets magiques : l'instantané « dmg-2024-magic-items.json » est absent." : "")
  };
}

/** Les origines du PHB, du disque au disque : l'instantané des faits, les deux couches de base
 *  lues dans le dépôt, la couche du livre écrite hors du dépôt. */
function genererOrigines({ dirSources, dirCouches }) {
  const livre = LIVRES["phb-2024"];
  const chemin = join(dirSources, "phb-2024-origins.json");
  if (!existsSync(chemin)) {
    fail(`la source « ${chemin} » est absente. ⭐ C'EST NORMAL SUR UN CLONE FRAIS : ` +
      "elle vient de la bibliothèque du JOUEUR et n'est pas versionnée.");
  }
  const lire = (p) => JSON.parse(readFileSync(p, "utf8"));
  const srd = lire(join(REPO_ROOT, "layers", "srd-5.2.1-en.layer.json"));
  const { layer, comptes, ecarts, restes } = construireOrigines(lire(chemin), {
    srd, meca: lire(join(REPO_ROOT, "layers", "srfh-mecaniques-en.layer.json"))
  });
  /* 🪄 LOT 389 — les sorts entrent dans la MÊME couche : un livre, un fichier. Leur instantané absent
     se DIT dans le message ; il n'efface pas les origines. */
  const cheminSorts = join(dirSources, "phb-2024-spells.json");
  let sorts = null;
  if (existsSync(cheminSorts)) {
    sorts = construireSorts(lire(cheminSorts), { srd });
    layer.records.spell = sorts.records.spell;
    layer.description += ` Chapitre 7 « Spells » : ${sorts.comptes.spell} sorts PROPRES au livre, avec leurs listes de classes ` +
      `(chapitre 3) ; ${sorts.comptes.partages} sorts partagés avec le SRD comparés, pas réémis (lot 389).`;
  }
  /* 🎖️ LOT 392 — les dons hors origine rejoignent les dons d'origine, dans le même genre `feat`. */
  const cheminDons = join(dirSources, "phb-2024-feats.json");
  let dons = null;
  if (existsSync(cheminDons)) {
    dons = construireDons(lire(cheminDons), { srd, origines: layer.records.feat || {} });
    layer.records.feat = { ...(layer.records.feat || {}), ...dons.records.feat };
    const c = dons.comptes.par_categorie;
    layer.description += ` Chapitre 5 « Feats », hors origine : ${dons.comptes.feat} dons PROPRES au livre ` +
      `(${c.general || 0} généraux, ${c["fighting-style"] || 0} de style de combat, ${c["epic-boon"] || 0} épiques) ; ` +
      `${dons.comptes.partages} dons partagés avec le SRD comparés, pas réémis (lot 392).`;
  }
  mkdirSync(dirCouches, { recursive: true });
  const sortie = join(dirCouches, `${livre.id}.layer.json`);
  writeFileSync(sortie, `${JSON.stringify(layer, null, 2)}\n`, "utf8");
  return {
    sortie, comptes, ecarts, restes, sorts, dons,
    message:
      `${livre.id} : ${comptes.background} arrière-plans + ${comptes.species} espèce(s) + ${comptes.feat} dons, propres au livre. ` +
      `Partagés comparés : ${ecarts.length} écart(s)${ecarts.length ? ` — ${ecarts.join(" ; ")}` : ""}. ` +
      `Resté en texte : ${restes.length}. ` +
      (sorts
        ? `Sorts : ${sorts.comptes.spell} propres au livre, ${sorts.comptes.partages} partagés comparés, ${sorts.ecarts.length} écart(s)` +
          `${sorts.ecarts.length ? ` — ${sorts.ecarts.join(" ; ")}` : ""}, ${sorts.renommes.length} renommés par le SRD.`
        : "Sorts : l'instantané « phb-2024-spells.json » est absent — la couche ne porte que les origines.") +
      (dons
        ? ` Dons hors origine : ${dons.comptes.feat} propres au livre (${JSON.stringify(dons.comptes.par_categorie)}), ` +
          `${dons.comptes.partages} partagés comparés, ${dons.ecarts.length} écart(s)${dons.ecarts.length ? ` — ${dons.ecarts.join(" ; ")}` : ""}, ` +
          `${dons.restes.length} faits restés en texte.`
        : " Dons hors origine : l'instantané « phb-2024-feats.json » est absent.")
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(generate({ cle: process.argv[2] || "dmg-2024" }).message);
}
