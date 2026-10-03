/* ══ LIRE UN CLASSEUR .xlsx, SANS DÉPENDANCE ══════════════════════════════════════════════════════════
   Le classeur Panam d'Eric (`Panam Steampunk Rules Compendium_EdNNN.xlsx`, dans son vault) est la SOURCE
   de la couche Panam (`gen-panam-layer.mjs`). Le dépôt n'a aucune dépendance d'exécution (CLAUDE.md) : on
   lit donc le format à la main. Un .xlsx est une archive zip de XML ; il suffit de trois choses :
   le répertoire central du zip, `inflateRaw` (node:zlib), et une lecture des cellules.
   ⛔ Ce lecteur ne connaît que ce que le classeur emploie : chaînes partagées, chaînes en ligne, nombres,
   booléens, et la valeur EN CACHE des formules (jamais un calcul). Pas d'images, pas de styles, pas de
   cellules fusionnées — une cellule vide est `null`. */

import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

function failx(message) {
  throw new Error(`lire-xlsx : ${message}`);
}

/** Les entrées d'une archive zip, par nom → octets décompressés à la demande. */
function entreesDuZip(octets) {
  const b = Buffer.from(octets);
  let fin = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i -= 1) {
    if (b.readUInt32LE(i) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) failx("ce n'est pas une archive zip (pas de répertoire central).");
  const total = b.readUInt16LE(fin + 10);
  let p = b.readUInt32LE(fin + 16);
  const entrees = new Map();
  for (let n = 0; n < total; n += 1) {
    if (b.readUInt32LE(p) !== 0x02014b50) failx("répertoire central illisible.");
    const methode = b.readUInt16LE(p + 10);
    const taille = b.readUInt32LE(p + 20);
    const lnom = b.readUInt16LE(p + 28);
    const lextra = b.readUInt16LE(p + 30);
    const lcom = b.readUInt16LE(p + 32);
    const local = b.readUInt32LE(p + 42);
    const nom = b.toString("utf8", p + 46, p + 46 + lnom);
    entrees.set(nom, () => {
      const debut = local + 30 + b.readUInt16LE(local + 26) + b.readUInt16LE(local + 28);
      const brut = b.subarray(debut, debut + taille);
      if (methode === 0) return brut;
      if (methode === 8) return inflateRawSync(brut);
      return failx(`« ${nom} » : méthode de compression ${methode} inconnue.`);
    });
    p += 46 + lnom + lextra + lcom;
  }
  return entrees;
}

const ENTITES = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'" };
function texteXml(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (_, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITES[e]);
}
/** Le texte d'un nœud `<si>` ou `<is>` : la concaténation de ses `<t>` (les morceaux d'un texte riche). */
function texteDesT(xml) {
  let s = "";
  for (const m of xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g)) s += texteXml(m[1] || "");
  return s;
}
const attr = (balise, nom) => {
  const m = balise.match(new RegExp(`\\s${nom}="([^"]*)"`));
  return m ? texteXml(m[1]) : null;
};
/** « BC12 » → index de colonne 54 (0-based). */
function colonne(ref) {
  let n = 0;
  for (const c of ref.match(/^[A-Z]+/)[0]) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1;
}

/**
 * Lit un classeur. PURE quant au disque si l'on passe des octets.
 * @param {string|Uint8Array} source chemin ou octets
 * @returns {{feuilles: Array<{nom: string, lignes: Array<Array<string|number|boolean|null>>}>}}
 *   `lignes[i]` est la ligne i+1 du tableur ; une ligne absente du XML est un tableau vide.
 */
export function lireXlsx(source) {
  const octets = typeof source === "string" ? readFileSync(source) : source;
  const zip = entreesDuZip(octets);
  const lire = (nom) => {
    const f = zip.get(nom);
    if (!f) failx(`l'archive n'a pas « ${nom} » — est-ce bien un classeur .xlsx ?`);
    return f().toString("utf8");
  };
  const partagees = zip.has("xl/sharedStrings.xml")
    ? [...lire("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => texteDesT(m[1]))
    : [];
  const rels = new Map([...lire("xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b[^>]*>/g)]
    .map((m) => [attr(m[0], "Id"), attr(m[0], "Target")]));
  const feuilles = [];
  for (const m of lire("xl/workbook.xml").matchAll(/<sheet\b[^>]*>/g)) {
    const nom = attr(m[0], "name");
    const cible = rels.get(attr(m[0], "r:id"));
    const chemin = cible.startsWith("/") ? cible.slice(1) : `xl/${cible.replace(/^\.\//, "")}`;
    const xml = lire(chemin);
    const lignes = [];
    for (const r of xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>|<row\b([^>]*)\/>/g)) {
      const numero = Number(attr(r[1] || r[3], "r"));
      const ligne = [];
      for (const c of (r[2] || "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const ref = attr(c[1], "r");
        const t = attr(c[1], "t");
        const corps = c[2] || "";
        const v = corps.match(/<v>([\s\S]*?)<\/v>/);
        let valeur = null;
        if (t === "s") valeur = v ? partagees[Number(v[1])] : null;
        else if (t === "inlineStr") valeur = texteDesT(corps);
        else if (t === "str") valeur = v ? texteXml(v[1]) : null;
        else if (t === "b") valeur = v ? v[1] === "1" : null;
        else if (t === "e") valeur = null;
        else if (v) valeur = Number(v[1]);
        if (valeur === "") valeur = null;
        ligne[colonne(ref)] = valeur;
      }
      for (let i = 0; i < ligne.length; i += 1) if (ligne[i] === undefined) ligne[i] = null;
      lignes[numero - 1] = ligne;
    }
    for (let i = 0; i < lignes.length; i += 1) if (lignes[i] === undefined) lignes[i] = [];
    feuilles.push({ nom, lignes });
  }
  return { feuilles };
}
