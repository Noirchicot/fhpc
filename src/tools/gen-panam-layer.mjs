/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║  LA COUCHE PANAM — le classeur d'Eric devient un catalog                 ║
   ╚══════════════════════════════════════════════════════════════════════════╝

   Panam est la campagne steampunk d'Eric. Ses règles vivent dans UN classeur, dans son vault :
   `5.RPG/Panam/Panam Steampunk Rules Compendium_EdNNN.xlsx` (14 onglets : styles et dons, armes, armures,
   sorts et leurs listes de classes, outils, compétences, équipement, prothèses, accessoires d'arme à feu,
   véhicules). Ce fichier en fait une couche du builder, À CÔTÉ du PHB et du DMG.

   ⭐ LE MÊME MODÈLE QUE `gen-livre-layer.mjs`, ET LA FORME D'UN CATALOG (lot 390) :
       le dépôt porte LE GÉNÉRATEUR      ← ce fichier, versionné, sans une ligne du classeur
       le vault porte LA SOURCE          ← le classeur, chez Eric
       le disque porte LA COUCHE         ← `layers-livres/noirchicot-panam.layer.json`, IGNORÉ PAR GIT
   ⚖️ Pourquoi un CATALOG et pas un troisième « livre connu » (`xphb`, `xdmg`) : un livre connu est une
   liste écrite en dur dans quatre fichiers servis (engine, interrupteurs, universe-step, le juge) ; un
   catalog est « un livre comme les autres » (juge.mjs) — importé par Menu › Layers › Import a book, rangé
   dans le lieu choisi dans Vault (Dropbox `Apps/SOWLREACH/books/`, ou l'appareil), allumé dans Layers,
   effacé par sa poubelle. Panam entre donc SANS TOUCHER UN FICHIER SERVI : pas de nouvelle version.
   ⛔ Les trois lois du catalog tiennent : il n'AJOUTE que des records neufs, sous son espace de noms
   (`noirchicot-panam:…`) ; il ne remplace jamais un record du SRD ; il passe le JUGE (`verifierUnCatalog`)
   avant d'être écrit — ce fichier n'écrit rien qu'Import a book refuserait.

   🧬 COMME AU LOT 387 : UN RECORD QUE LE SRD PORTE DÉJÀ N'EST PAS RÉÉMIS. Il est COMPARÉ, et chaque écart
   est RAPPORTÉ pour Eric (le Pistol et le Musket de Panam portent Misfire et Firearm, celui du SRD non) —
   jamais tranché ici. Un don ou un style dont le texte diffère de celui du SRD entre sous son nom suivi de
   « (Panam) » : les deux se lisent côte à côte, aucun ne recouvre l'autre. Si le PHB d'Eric est sur le
   disque (`layers-livres/xphb-en.layer.json`), ses dons sont comparés de la même façon.

   🪙 LA MONNAIE. Le builder lit des prix en GP/SP/CP (`parseCout`). Le classeur écrit en monnaie de Panam ;
   ses propres tables de référence (onglet Weapons List) donnent le Blunderbuss à « 750 Sous d'argent » et
   à « 750 GP », et ses outils (« 20 sous », « 1 sou ») ont les prix du SRD en GP. ⇒ « sou(s) » et « sous
   d'argent » → GP ; « denier(s) » → SP (12 deniers font un sou : le plus proche des 10 SP d'un GP). Le prix
   d'origine reste sur le record (`cost_panam`). Une fourchette (« 5 à 20 sous ») reste en mots : le builder
   la montre sans prix plutôt que d'en inventer un.

   📏 CE QU'UN CATALOG NE SAIT PAS PORTER, ET QUI SE NOMME AU LIEU DE SE TAIRE (`restes`) : les outils, les
   compétences et les véhicules (aucun genre du catalog), une arme dont les dégâts ne sont ni contondants,
   ni perforants, ni tranchants (la liste fermée du juge : elle entre comme équipement, ses dégâts écrits),
   et les règles que le moteur ne lit pas encore (Firearm qui retire le modificateur des dégâts, la
   Ballistic Resistance et la Damage Reduction des armures, portées en données sur le record).

   Usage : node src/tools/gen-panam-layer.mjs ["<chemin du classeur>"] [--out <fichier>]
   Sans chemin : le classeur de la plus haute édition dans ~/obsidian-vault/5.RPG/Panam/.               */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { lireXlsx } from "./lire-xlsx.mjs";
import { verifierUnCatalog, fauteEnLigne } from "../catalog/juge.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, "..", "..");
export const DIR_COUCHES = join(REPO_ROOT, "layers-livres");
export const ID = "noirchicot-panam";
export const DOSSIER_PANAM = join(homedir(), "obsidian-vault", "5.RPG", "Panam");
const MOTIF_DU_CLASSEUR = /^Panam Steampunk Rules Compendium_Ed0*(\d+)\.xlsx$/;

export function fail(message) {
  throw new Error(`gen-panam-layer : ${message}`);
}

/* ── LE TEXTE ─────────────────────────────────────────────────────────────────────────────────────── */

/** Le texte d'une cellule, propre : espaces insécables, retours Windows, et les retours à la ligne que
 *  le tableur a mis AU MILIEU d'une phrase (« reduce the\ndamage ») recollés. Un retour qui suit une fin de
 *  phrase devient un paragraphe — la forme des descriptions du SRD (`\n\n`). */
export function texte(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\r\n?/g, "\n").replace(/[  ]/g, " ");
  const lignes = s.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  let out = "";
  for (const l of lignes) {
    if (!out) { out = l; continue; }
    const paragraphe = (/[.!?:)]$/.test(out) && /^[A-Z•]/.test(l)) || /^•/.test(l) || /^[A-Z][A-Za-z’' -]{1,40}\.\s/.test(l);
    out += paragraphe ? `\n\n${l}` : ` ${l}`;
  }
  return out || null;
}
const vide = (v) => v === null || v === undefined || /^[—–-]?$/.test(String(v).trim());

/** « Cane Pistol (Panam) » → { nom: "Cane Pistol", ddb: "homebrew" } ; « Musket* » → ddb "existing".
 *  La légende est celle du classeur (ED12) : « (Panam) » créé dans le Homebrew D&D Beyond, « * » existe déjà
 *  chez D&D Beyond. */
export function nomPanam(brut) {
  let nom = texte(brut) || "";
  let ddb = null;
  if (/\*\s*$/.test(nom)) { ddb = "existing"; nom = nom.replace(/\s*\*\s*$/, ""); }
  if (/\s*\(Panam\)\s*$/i.test(nom)) { ddb = "homebrew"; nom = nom.replace(/\s*\(Panam\)\s*$/i, ""); }
  return { nom: nom.trim(), ddb };
}

/** Le slug d'un record : « Gaf/Hook Hand » → « gaf-hook-hand », « Bullets (40) » → « bullets-40 ».
 *  ⭐ La parenthèse RESTE (contrairement aux gemmes de `gen-livre-layer`) : « Gunpowder (keg) » et
 *  « Gunpowder (powder horn) » sont deux objets. */
export function slug(nom) {
  return String(nom).normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
const idDe = (genre, nom) => `${ID}:${genre}:en:${slug(nom)}`;
/** Pour comparer deux textes de règle : ni casse, ni ponctuation, ni apostrophe typographique. */
const comparable = (s) => String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9+]+/g, " ").trim();

/* ── LA MONNAIE ET LE POIDS ───────────────────────────────────────────────────────────────────────── */

const PIECE_DE_PANAM = [
  [/^sous?\s+d['’]\s*argent$/i, "GP"],
  [/^sous?$/i, "GP"],
  [/^deniers?$/i, "SP"]
];
function piece(mot) {
  const trouve = PIECE_DE_PANAM.find(([re]) => re.test(mot.trim()));
  return trouve ? trouve[1] : null;
}
/** « 750 Sous d'argent » → « 750 GP » ; « 5 deniers » → « 5 SP » ; « 5 à 20 sous » → « 5–20 GP » (en mots :
 *  le builder n'y lit aucun prix) ; « — » ou vide → « — » ; « Variable » reste. */
export function prix(brut) {
  if (vide(brut)) return "—";
  const s = texte(brut);
  const un = s.match(/^([\d\s.,]+?)\s*([A-Za-z][A-Za-z\s'’]*)$/);
  if (un && piece(un[2])) return `${un[1].replace(/\s+/g, "")} ${piece(un[2])}`;
  const fourchette = s.match(/^([\d\s.,]+?)\s*(?:([A-Za-z][A-Za-z\s'’]*?)\s+)?à\s+([\d\s.,]+?)\s*([A-Za-z][A-Za-z\s'’]*)$/);
  if (fourchette && piece(fourchette[4]) && (!fourchette[2] || piece(fourchette[2]))) {
    const p1 = piece(fourchette[2] || fourchette[4]);
    const p2 = piece(fourchette[4]);
    return `${fourchette[1].trim()}${p1 === p2 ? "" : ` ${p1}`}–${fourchette[3].trim()} ${p2}`;
  }
  return s;
}
const prixLisible = (p) => /^[\d,.]+ (GP|SP|CP)$/.test(p);
export function poids(brut) {
  if (vide(brut)) return "—";
  return texte(brut).replace(/\bTo\b/g, "to");
}

/* ── LES FEUILLES ─────────────────────────────────────────────────────────────────────────────────── */

function feuille(classeur, nom) {
  const f = classeur.feuilles.find((x) => x.nom.trim().toLowerCase() === nom.toLowerCase());
  if (!f) fail(`l'onglet « ${nom} » est introuvable — les onglets sont : ${classeur.feuilles.map((x) => x.nom).join(", ")}.`);
  return f;
}
/** Les lignes d'un tableau : celles qui suivent la ligne d'en-tête (`debut`, 1-based) jusqu'à la première
 *  ligne dont la première cellule est vide. Chaque ligne garde son numéro, pour le pointeur `source`. */
function tableau(f, debut = 1) {
  const out = [];
  for (let i = debut; i < f.lignes.length; i += 1) {
    const l = f.lignes[i];
    if (!l || vide(l[0])) break;
    out.push({ n: i + 1, c: l });
  }
  return out;
}
const source = (edition, f, n) => ({ id: "panam-compendium", locator: `${f.nom}, row ${n}`, version: `Ed${String(edition).padStart(3, "0")}` });

/* ── LES ARMES ────────────────────────────────────────────────────────────────────────────────────── */

const TYPES_D_ARME = ["bludgeoning", "piercing", "slashing"];
const titre = (s) => s.split(/([\s-])/).map((m) => (/^[a-z]/.test(m) ? m[0].toUpperCase() + m.slice(1) : m)).join("");

/** « Ammunition (Range 20/60, shot) » → { key: "ammunition", label: "Ammunition", detail: "Range 20/60; Shot" }.
 *  La forme du SRD (`property_list`) ; une propriété propre à Panam (Firearm, Misfire, Reload, Recoil,
 *  Hidden) prend la même forme — le moteur lit les clefs qu'il connaît et laisse les autres. */
export function propriete(brut) {
  const s = texte(brut);
  const m = s.match(/^([A-Za-z][A-Za-z -]*?)\s*(?:\((.*)\)?)?$/);
  if (!m) return null;
  const label = titre(m[1].trim().toLowerCase());
  let detail = m[2] ? m[2].replace(/\)$/, "").trim() : null;
  if (detail && /^\d+\/\d+/.test(detail)) detail = `Range ${detail}`;
  if (detail) {
    detail = detail.replace(/(\d)\s*[,;]?\s+([A-Za-z])/, "$1; $2").replace(/;\s*([a-z])/, (_, c) => `; ${c.toUpperCase()}`);
  }
  const p = { key: slug(label), label };
  if (detail) p.detail = detail;
  return p;
}

function construireArmes(f, { srd, edition }) {
  const armes = {};
  const equipement = [];
  const ecarts = [];
  const restes = [];
  const partages = [];
  const srdParNom = new Map(Object.values(srd.records.weapon || {}).map((r) => [r.name.toLowerCase(), r]));
  for (const { n, c } of tableau(f)) {
    if (c.slice(1).every(vide)) break;                     // la légende sous le tableau
    const { nom, ddb } = nomPanam(c[0]);
    const categories = vide(c[1]) ? [] : texte(c[1]).toLowerCase().split(/\s*,\s*/);
    const degats = texte(c[2]) || "";
    const props = [];
    for (const cel of c.slice(3, 9)) {
      if (vide(cel)) continue;
      for (const morceau of texte(cel).split(/\s+\/\s+/)) {
        const p = propriete(morceau);
        if (p && !props.some((q) => q.key === p.key)) props.push(p);
      }
    }
    const maitrise = vide(c[9]) ? null : titre(texte(c[9]));
    const ligne = { n, nom, ddb, categories, degats, props, maitrise, poids: poids(c[10]), cout: prix(c[11]), cout_panam: texte(c[11]) };
    const premier = degats.match(/^(\d+d\d+|\d+)\s+([A-Za-z]+)/);
    const type = premier ? premier[2].toLowerCase() : null;
    const categorie = categories.find((x) => x === "simple" || x === "martial");
    const portee = categories.includes("melee") ? "melee" : categories.includes("ranged") ? "ranged" : null;
    if (!categorie || !portee || !TYPES_D_ARME.includes(type)) {
      equipement.push(ligne);
      if (categorie && portee) {
        restes.push(`${nom} : dégâts « ${degats} » — un catalog ne porte une arme que contondante, perforante ou tranchante ; entrée comme équipement, ses dégâts écrits`);
      }
      continue;
    }
    const dejaLa = srdParNom.get(nom.toLowerCase());
    if (dejaLa) {
      partages.push(nom);
      const d = dejaLa.data;
      const cles = (l) => l.map((p) => p.key).sort().join(",");
      const diff = [];
      if (d.damage_dice !== premier[1] || d.damage_type_key !== type) diff.push(`dégâts ${degats} (SRD ${d.damage})`);
      if (cles(d.property_list || []) !== cles(props)) diff.push(`propriétés ${props.map((p) => p.label).join(", ")} (SRD ${(d.property_list || []).map((p) => p.label).join(", ")})`);
      if (d.mastery !== maitrise) diff.push(`maîtrise ${maitrise} (SRD ${d.mastery})`);
      if (d.cost !== ligne.cout) diff.push(`prix ${ligne.cout} (SRD ${d.cost})`);
      if (d.weapon_category !== categorie) diff.push(`catégorie ${categorie} (SRD ${d.weapon_category})`);
      if (diff.length) ecarts.push(`${nom} : ${diff.join(" ; ")}`);
      continue;
    }
    if (categories.includes("melee") && categories.includes("ranged")) {
      restes.push(`${nom} : arme de corps à corps ET à distance (« ${degats} ») — entrée au corps à corps avec ses premiers dégâts, le tir est dans ses propriétés`);
    }
    if (/,|special|on top/i.test(degats.replace(premier[0], ""))) {
      restes.push(`${nom} : dégâts « ${degats} » — seuls les premiers (${premier[1]} ${titre(type)}) sont lus par le moteur`);
    }
    const data = {
      name: nom,
      cost: ligne.cout,
      weight: ligne.poids,
      damage: `${premier[1]} ${titre(type)}`,
      damage_dice: /^\d+d\d+$/.test(premier[1]) ? premier[1] : null,
      damage_type_key: type,
      weapon_category: categorie,
      weapon_range: portee,
      properties: props.map((p) => (p.detail ? `${p.label} (${p.detail})` : p.label)).join(", "),
      property_list: props
    };
    if (maitrise) { data.mastery = maitrise; data.mastery_key = maitrise.replace(/\s*\(.*$/, ""); }
    if (degats !== data.damage) data.damage_panam = degats;
    if (ligne.cout_panam && ligne.cout_panam !== ligne.cout) data.cost_panam = ligne.cout_panam;
    if (ddb) data.ddb = ddb;
    armes[idDe("weapon", nom)] = { name: nom, data, source: source(edition, f, n) };
  }
  return { armes, equipement, ecarts, restes, partages };
}

/* ── LES ARMURES ──────────────────────────────────────────────────────────────────────────────────── */

const CATEGORIE_D_ARMURE = { "light armor": "light", "medium armor": "medium", "heavy armor": "heavy", shield: "shield" };
const bonus = (v) => (vide(v) ? null : Number(String(v).replace(/^\+/, "")));

function construireArmures(f, { proprietes, srd, edition }) {
  const armures = {};
  const restes = [];
  const lignes = tableau(f);
  /* les descriptions, sous le tableau : « Gearplate: Traditional plate armor… » */
  const descriptions = [];
  for (let i = lignes.length + 1; i < f.lignes.length; i += 1) {
    const t = texte((f.lignes[i] || [])[0]);
    const m = t && t.match(/^([^:]{2,40}):\s*(.+)$/s);
    if (m) descriptions.push({ cle: m[1].trim().toLowerCase(), texte: m[2].trim(), prise: false });
  }
  const enfilage = {};
  for (const { c } of tableau(proprietes)) {
    const m = texte(c[1] || "").match(/^(Light|Medium|Heavy) Armor \((.*)\)$/);
    if (m) enfilage[m[1].toLowerCase()] = m[2];
  }
  const bouclierSrd = Object.values(srd.records.armor || {}).find((r) => r.data.armor_category === "shield");
  for (const { n, c } of lignes) {
    const { nom, ddb } = nomPanam(c[0]);
    const categorie = CATEGORIE_D_ARMURE[texte(c[1]).toLowerCase()];
    if (!categorie) { restes.push(`${nom} : catégorie « ${texte(c[1])} » inconnue — non entrée`); continue; }
    const ca = texte(String(c[2]));
    const force = vide(c[3]) ? null : Number(c[3]);
    const data = { name: nom, armor_category: categorie };
    if (categorie === "shield") {
      Object.assign(data, { ac_base: null, ac_bonus: bonus(ca), armor_class: `+${bonus(ca)}` });
    } else {
      const m = ca.match(/^(\d+)(\s*\+\s*Dex modifier(?:\s*\(max (\d+)\))?)?$/i);
      if (!m) { restes.push(`${nom} : classe d'armure « ${ca} » illisible — non entrée`); continue; }
      const cap = m[2] ? (m[3] ? Number(m[3]) : null) : 0;
      Object.assign(data, {
        ac_base: Number(m[1]), ac_dex_cap: cap,
        armor_class: cap === 0 ? `${m[1]}${force ? ` Str ${force}` : ""}` : `${m[1]} + Dex modifier${cap ? ` (max ${cap})` : ""}`
      });
    }
    const discretion = texte(c[4]);
    Object.assign(data, {
      cost: prix(c[8]),
      weight: poids(c[7]),
      stealth_disadvantage: /^disadvantage$/i.test(discretion || ""),
      strength: force ? `Str ${force}` : null,
      strength_min: force,
      don_doff: categorie === "shield" ? (bouclierSrd ? bouclierSrd.data.don_doff : null) : (enfilage[categorie] || null)
    });
    if (/^advantage$/i.test(discretion || "")) {
      data.stealth_advantage = true;
      restes.push(`${nom} : Advantage en Stealth — porté en donnée (stealth_advantage), le moteur ne le lit pas`);
    }
    const br = bonus(c[5]);
    const dr = bonus(c[6]);
    if (br) data.ballistic_resistance = br;
    if (dr) data.damage_reduction = dr;
    const desc = descriptions.find((d) => nom.toLowerCase() === d.cle || nom.toLowerCase().startsWith(`${d.cle} `));
    if (desc) { data.description = desc.texte; desc.prise = true; }
    if (texte(c[8]) && texte(c[8]) !== data.cost) data.cost_panam = texte(c[8]);
    if (ddb) data.ddb = ddb;
    armures[idDe("armor", nom)] = { name: nom, data, source: source(edition, f, n) };
  }
  const avecBr = Object.values(armures).filter((r) => r.data.ballistic_resistance || r.data.damage_reduction).length;
  if (avecBr) restes.push(`${avecBr} armures portent une Ballistic Resistance ou une Damage Reduction — en données (ballistic_resistance, damage_reduction), le moteur ne les applique pas`);
  for (const d of descriptions.filter((x) => !x.prise)) {
    restes.push(`${titre(d.cle)} : décrit sous le tableau des armures, mais sans ligne dans le tableau (ni CA, ni prix) — non entré`);
  }
  return { armures, restes };
}

/* ── LES SORTS ────────────────────────────────────────────────────────────────────────────────────── */

const ECOLES = ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];

/** Les listes de classes : des blocs « Classe | Cantrips | 1st Level … » suivis de leurs lignes. */
function listesDeClasses(f) {
  const classesDe = new Map();
  let classe = null;
  for (const l of f.lignes) {
    if (!l || l.every(vide)) { classe = null; continue; }
    if (!vide(l[0]) && /cantrip/i.test(String(l[1] || ""))) { classe = texte(l[0]); continue; }
    if (!classe) continue;
    for (const cel of l.slice(1, 11)) {
      if (vide(cel)) continue;
      const nom = texte(cel);
      const k = nom.toLowerCase();
      if (!classesDe.has(k)) classesDe.set(k, { nom, classes: [] });
      if (!classesDe.get(k).classes.includes(classe)) classesDe.get(k).classes.push(classe);
    }
  }
  return classesDe;
}

function tempsDIncantation(brut) {
  const s = texte(brut);
  const reaction = s.match(/^1 reaction\s*(.*)$/i);
  if (reaction) return reaction[1] ? `Reaction, which you take ${reaction[1].replace(/^which you take\s*/i, "")}` : "Reaction";
  if (/^1 action$/i.test(s)) return "Action";
  if (/^1 bonus action$/i.test(s)) return "Bonus Action";
  return s.toLowerCase();
}
function duree(brut) {
  return texte(brut).replace(/up to(\d)/i, "up to $1")
    .replace(/\b(Minute|Hour|Round|Day)(s?)\b/g, (_, u, s) => `${u.toLowerCase()}${s}`);
}

function construireSorts(f, listes, { srd, edition }) {
  const sorts = {};
  const restes = [];
  const partages = [];
  const classesDe = listesDeClasses(listes);
  const srdParNom = new Set(Object.values(srd.records.spell || {}).map((r) => r.name.toLowerCase()));
  const vus = new Set();
  for (const { n, c } of tableau(f)) {
    const nom = texte(c[0]);
    vus.add(nom.toLowerCase());
    if (srdParNom.has(nom.toLowerCase())) { partages.push(nom); continue; }
    const niveau = /^cantrip$/i.test(String(c[1]).trim()) ? 0 : Number(c[1]);
    const ecole = texte(c[2]).toLowerCase();
    if (!Number.isInteger(niveau) || !ECOLES.includes(ecole)) { restes.push(`${nom} : niveau « ${c[1]} » ou école « ${c[2]} » illisible — non entré`); continue; }
    const classes = classesDe.has(nom.toLowerCase()) ? classesDe.get(nom.toLowerCase()).classes : [];
    if (classes.length === 0) restes.push(`${nom} : sur aucune liste de classe de l'onglet des listes — entré sans classe`);
    const d = duree(c[6]);
    sorts[idDe("spell", nom)] = {
      name: nom,
      data: {
        name: nom,
        level: niveau,
        cantrip: niveau === 0,
        school: ecole,
        school_key: ecole,
        casting_time: tempsDIncantation(c[3]),
        range: texte(c[4]),
        components: texte(c[5]),
        duration: d,
        concentration: /^concentration/i.test(d),
        ritual: false,
        class_keys: classes,
        classes,
        description: texte(c[7]) || ""
      },
      source: source(edition, f, n)
    };
  }
  for (const [k, { nom, classes }] of classesDe) {
    if (!vus.has(k)) restes.push(`${nom} : sur la liste ${classes.join(", ")}, mais sans ligne dans l'onglet des sorts — non entré`);
  }
  return { sorts, restes, partages };
}

/* ── LES STYLES ET LES DONS ───────────────────────────────────────────────────────────────────────── */

function construireDons(f, { srd, phb, edition }) {
  const dons = {};
  const restes = [];
  const identiques = [];
  const renommes = [];
  const connus = [...Object.values(srd.records.feat || {}).map((r) => ({ r, ou: "SRD" })),
    ...Object.values((phb && phb.records.feat) || {}).map((r) => ({ r, ou: "PHB" }))];
  let categorie = null;
  const textes = new Map();
  for (let i = 0; i < f.lignes.length; i += 1) {
    const l = f.lignes[i] || [];
    if (vide(l[0])) continue;
    const tete = texte(l[0]);
    if (/^description$/i.test(texte(l[1]) || "")) {
      categorie = /style/i.test(tete) ? "fighting-style" : "general";
      continue;
    }
    if (!categorie) continue;
    let nom = tete;
    /* le prérequis est la PREMIÈRE ligne de la cellule quand elle le dit — « General Feat (Prerequisite: Level
       4+) » ou « Prerequisite: Level 12, Gunsmith Initiate » ; lu avant que `texte` ne recolle les lignes */
    const brut = String(l[1] || "").replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").trim();
    const [premiere, ...suite] = brut.split("\n");
    let prerequis = categorie === "fighting-style" ? "Prerequisite: Fighting Style Feature" : null;
    let corps = texte(brut) || "";
    const pre = premiere.match(/^(?:General Feat\s*)?\(?\s*(Prerequisites?:.*?)\)?\s*$/);
    if (pre) {
      prerequis = texte(pre[1]).replace(/^Prerequisites:/, "Prerequisite:");
      corps = texte(suite.join("\n")) || "";
    }
    const egal = textes.get(comparable(corps));
    if (egal) restes.push(`${nom} : même texte que ${egal} dans le classeur — entré quand même, à vérifier`);
    textes.set(comparable(corps), nom);
    const homonyme = connus.find(({ r }) => r.name.toLowerCase() === nom.toLowerCase());
    if (homonyme) {
      if (comparable(homonyme.r.data.description).includes(comparable(corps))) { identiques.push(`${nom} (${homonyme.ou})`); continue; }
      renommes.push(`${nom} → ${nom} (Panam) : le texte diffère de celui du ${homonyme.ou}`);
      nom = `${nom} (Panam)`;
    }
    dons[idDe("feat", nom)] = {
      name: nom,
      data: { name: nom, category: categorie, prerequisite: prerequis, description: corps },
      source: source(edition, f, i + 1)
    };
    if (categorie === "general" && !prerequis) restes.push(`${nom} : don général sans prérequis écrit dans le classeur`);
  }
  return { dons, restes, identiques, renommes };
}

/* ── L'ÉQUIPEMENT ─────────────────────────────────────────────────────────────────────────────────── */

function construireEquipement({ gear, protheses, accessoires, armesRestantes, srd, edition }) {
  const equipement = {};
  const restes = [];
  const partages = [];
  const srdParNom = new Set(Object.values(srd.records.gear || {}).map((r) => r.name.toLowerCase()));
  const sansPrix = [];
  const poser = (nom, data, f, n, ddb) => {
    if (srdParNom.has(nom.toLowerCase())) { partages.push(nom); return; }
    const id = idDe("gear", nom);
    if (equipement[id]) { restes.push(`${nom} : deux lignes du même nom — la seconde (${f.nom}, ligne ${n}) n'est pas entrée`); return; }
    if (!prixLisible(data.cost)) sansPrix.push(`${nom} (« ${data.cost} »)`);
    if (ddb) data.ddb = ddb;
    equipement[id] = { name: nom, data: { name: nom, ...data }, source: source(edition, f, n) };
  };
  const avecPanam = (data, brut) => (texte(brut) && texte(brut) !== data.cost ? { ...data, cost_panam: texte(brut) } : data);
  for (const { n, c } of tableau(gear)) {
    const { nom, ddb } = nomPanam(c[0]);
    const data = { cost: prix(c[3]), weight: poids(c[2]) };
    if (!vide(c[1])) data.description = texte(c[1]);
    poser(nom, avecPanam(data, c[3]), gear, n, ddb);
  }
  for (const { n, c } of tableau(protheses)) {
    const { nom, ddb } = nomPanam(c[0]);
    const data = { cost: prix(c[3]), weight: "—", prosthetic_type: texte(c[1]), description: texte(c[2]) };
    poser(nom, avecPanam(data, c[3]), protheses, n, ddb);
  }
  for (const { n, c } of tableau(accessoires)) {
    if (c.slice(1).every(vide)) break;
    const { nom, ddb } = nomPanam(c[0]);
    const data = { cost: prix(c[3]), weight: poids(c[2]), firearm_addon: true, description: texte(c[1]) };
    poser(nom, avecPanam(data, c[3]), accessoires, n, ddb);
  }
  for (const a of armesRestantes.equipement) {
    const faits = [];
    if (a.degats && !/^special$/i.test(a.degats)) faits.push(`Damage: ${a.degats}.`);
    if (a.categories.length) faits.push(`${a.categories.map(titre).join(", ")} weapon.`);
    if (a.props.length) faits.push(`Properties: ${a.props.map((p) => (p.detail ? `${p.label} (${p.detail})` : p.label)).join(", ")}.`);
    if (a.maitrise) faits.push(`Mastery: ${a.maitrise}.`);
    const data = { cost: a.cout, weight: a.poids };
    if (faits.length) data.description = faits.join(" ");
    if (a.cout_panam && a.cout_panam !== a.cout) data.cost_panam = a.cout_panam;
    poser(a.nom, data, armesRestantes.feuille, a.n, a.ddb);
  }
  if (sansPrix.length) restes.push(`${sansPrix.length} objets sans prix lisible par le builder (montrés sans prix) : ${sansPrix.join(", ")}`);
  return { equipement, restes, partages };
}

/* ── CE QU'UN CATALOG NE PORTE PAS ────────────────────────────────────────────────────────────────── */

function nonPortes(classeur) {
  const restes = [];
  const outils = tableau(feuille(classeur, "Tools")).map(({ c }) => texte(c[0]));
  restes.push(`Outils (${outils.length}) : un catalog n'ajoute pas d'outil — non entrés (${outils.join(", ")})`);
  const comp = feuille(classeur, "Skills");
  const competences = comp.lignes.slice(1).filter((l) => l && !vide(l[0])).map((l) => texte(l[0]));
  const propres = competences.slice(tableau(comp).length);
  restes.push(`Compétences (${competences.length}, dont ${propres.length} propres à Panam : ${propres.join(", ")}) et la table des points de compétence : un catalog n'ajoute pas de compétence — non entrées`);
  const vehicules = tableau(feuille(classeur, "Vehicles")).map(({ c }) => texte(c[0]));
  restes.push(`Véhicules (${vehicules.length}) : un catalog n'ajoute pas de véhicule — non entrés`);
  return restes;
}

/* ── LA COUCHE ────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Construit le catalog Panam. PURE : ni disque ni horloge.
 * @param {{feuilles: Array}} classeur ce que rend `lireXlsx`
 * @param {{srd: object, phb?: object|null, edition?: number}} bases
 * @returns {{layer: object, comptes: object, ecarts: string[], restes: string[], identiques: string[], renommes: string[], partages: string[]}}
 */
export function construireCatalogPanam(classeur, { srd, phb = null, edition = 1 }) {
  const fArmes = feuille(classeur, "Weapons List");
  const armes = construireArmes(fArmes, { srd, edition });
  armes.feuille = fArmes;
  const armures = construireArmures(feuille(classeur, "Armors List"), { proprietes: feuille(classeur, "Armors Properties"), srd, edition });
  const sorts = construireSorts(feuille(classeur, "Additional Spells"), feuille(classeur, "Additional Classes Spells Lists"), { srd, edition });
  const dons = construireDons(feuille(classeur, "Fighting Styles & Feats"), { srd, phb, edition });
  const equipement = construireEquipement({
    gear: feuille(classeur, "Adventuring Gear"),
    protheses: feuille(classeur, "Prostethics"),
    accessoires: feuille(classeur, "Firearm addons"),
    armesRestantes: armes, srd, edition
  });
  const records = {};
  const poser = (genre, recs) => { if (Object.keys(recs).length) records[genre] = recs; };
  poser("feat", dons.dons);
  poser("weapon", armes.armes);
  poser("armor", armures.armures);
  poser("spell", sorts.sorts);
  poser("gear", equipement.equipement);
  const comptes = Object.fromEntries(Object.entries(records).map(([g, r]) => [g, Object.keys(r).length]));
  const styles = Object.values(dons.dons).filter((r) => r.data.category === "fighting-style").length;
  const layer = {
    schema: "fh-layer/1",
    id: ID,
    version: `${edition}.0.0`,
    name: "Panam",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    description: `Panam Steampunk Rules Compendium, edition ${edition}: ${styles} fighting styles and ${(comptes.feat || 0) - styles} feats, ` +
      `${comptes.weapon || 0} weapons, ${comptes.armor || 0} armors, ${comptes.spell || 0} spells with their class lists, ` +
      `${comptes.gear || 0} pieces of gear (adventuring gear, prosthetics, firearm add-ons, ammunition and explosives). ` +
      "Prices in sous and sous d'argent are read as GP, deniers as SP.",
    flags: [],
    attribution: {
      author: "Noirchicot",
      license: "all-rights-reserved",
      text: `Panam Steampunk Rules Compendium (Ed${String(edition).padStart(3, "0")}), the house rules of the Panam campaign.`
    },
    records
  };
  return {
    layer, comptes,
    ecarts: armes.ecarts,
    restes: [...armes.restes, ...armures.restes, ...sorts.restes, ...dons.restes, ...equipement.restes, ...nonPortes(classeur)],
    identiques: dons.identiques,
    renommes: dons.renommes,
    partages: [...armes.partages, ...sorts.partages, ...equipement.partages]
  };
}

/** Le classeur de la plus haute édition dans un dossier, ou null. */
export function dernierClasseur(dossier = DOSSIER_PANAM) {
  if (!existsSync(dossier)) return null;
  const trouves = readdirSync(dossier).map((f) => ({ f, m: f.match(MOTIF_DU_CLASSEUR) })).filter((x) => x.m)
    .sort((a, b) => Number(b.m[1]) - Number(a.m[1]));
  return trouves.length ? join(dossier, trouves[0].f) : null;
}

/** Du classeur au disque : lit, construit, fait JUGER, et n'écrit que si le juge accepte. */
export function generate({ classeur = dernierClasseur(), sortie = join(DIR_COUCHES, `${ID}.layer.json`), dirCouches = DIR_COUCHES } = {}) {
  if (!classeur || !existsSync(classeur)) {
    fail(`le classeur « ${classeur || join(DOSSIER_PANAM, "Panam Steampunk Rules Compendium_EdNNN.xlsx")} » est absent. ` +
      "Il vit dans le vault d'Eric, pas dans ce dépôt : donnez son chemin en premier argument.");
  }
  const m = basename(classeur).match(MOTIF_DU_CLASSEUR);
  const edition = m ? Number(m[1]) : 1;
  const lire = (p) => JSON.parse(readFileSync(p, "utf8"));
  const cheminPhb = join(dirCouches, "xphb-en.layer.json");
  const phb = existsSync(cheminPhb) ? lire(cheminPhb) : null;
  const r = construireCatalogPanam(lireXlsx(classeur), {
    srd: lire(join(REPO_ROOT, "layers", "srd-5.2.1-en.layer.json")), phb, edition
  });
  const octets = `${JSON.stringify(r.layer, null, 2)}\n`;
  const verdict = verifierUnCatalog(octets);
  if (verdict.etat !== "valide") {
    fail(`le juge des catalogs refuse la couche — rien n'est écrit :\n${verdict.fautes.map(fauteEnLigne).join("\n")}`);
  }
  mkdirSync(dirname(sortie), { recursive: true });
  writeFileSync(sortie, octets, "utf8");
  const liste = (titreDeListe, xs) => (xs.length ? `\n${titreDeListe} (${xs.length}) :\n${xs.map((x) => `  - ${x}`).join("\n")}` : "");
  return {
    ...r, sortie, verdict,
    message: `${ID} v${r.layer.version} → ${sortie}\n` +
      `Accepté par le juge des catalogs : ${verdict.records} records ${JSON.stringify(r.comptes)}.` +
      (phb ? "" : "\n⚠️ Le PHB n'est pas sur ce disque (layers-livres/xphb-en.layer.json) : les dons n'ont été comparés qu'au SRD.") +
      liste("Déjà dans le SRD, comparés, pas réémis", r.partages) +
      liste("Écarts avec le SRD, à trancher par Eric", r.ecarts) +
      liste("Dons identiques au SRD ou au PHB, pas réémis", r.identiques) +
      liste("Dons renommés « (Panam) »", r.renommes) +
      liste("Restes", r.restes) +
      "\n\nPour l'avoir dans le builder : Menu › Layers › Import a book, et choisir ce fichier " +
      "(ou le poser dans Dropbox, Apps/SOWLREACH/books/)."
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const iOut = args.indexOf("--out");
  const sortie = iOut >= 0 ? args.splice(iOut, 2)[1] : undefined;
  try {
    console.log(generate({ ...(args[0] ? { classeur: args[0] } : {}), ...(sortie ? { sortie } : {}) }).message);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
