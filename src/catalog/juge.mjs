/* ══ LE JUGE D'UN CATALOG DE CRÉATEUR — lot 390 ════════════════════════════════════════════════════
   Eric, 30/09 : un joueur qui a créé un livre doit pouvoir en faire un catalog et l'importer — *« le plus
   simple c'est de demander à une IA de produire le json »*. La carte produit (§ 0) : du contenu *« JSON,
   généré par IA ou à la main »*. Les décisions d'ARCHI 35 (mandat du lot 390, et Q1 → a, Q2 → a) :

   ⚖️ UN CATALOG EST UN LIVRE COMME LES AUTRES : un fichier distinct dans `books/` du lieu choisi dans Vault,
   importé par `Import a book`, allumé dans Layers, effacé par sa poubelle.
   ⚖️ IL N'AJOUTE QUE DES RECORDS NEUFS, DANS SON ESPACE DE NOMS : l'id du catalog (`noirchicot-mistlands`)
   préfixe chacun de ses records (`noirchicot-mistlands:spell:en:ember-lance`). Il ne remplace JAMAIS un
   record qui existe — la leçon du lot 387 : un record remplacé fait tomber les déclarations posées sur lui,
   et la pile Fate's Hand au-dessus. Ni `patch`, ni `disable`, ni drapeau, ni valeur de règle : famille
   `catalog` seulement. (La parole du MJ sur un record existant, c'est `overrides` et Campaign items.)
   ⚖️ UN SEUL JUGE. Cette fonction est le juge d'`Import a book` pour un catalog, le juge du MONTAGE d'un
   catalog trouvé dans le lieu (un fichier qu'Eric a posé à la main dans `books/` n'est jamais passé par
   l'import), et la ligne de commande du lot 391 (`tools/verifier-catalog.mjs`). ⛔ Jamais un second juge.

   ⭐ ELLE EST PURE : son verdict ne dépend QUE des octets. Aucun appel à la pile montée — c'est ce qui rend
   le verdict de la ligne de commande et celui de l'app identiques PAR CONSTRUCTION. « Un id déjà pris »
   n'a pas besoin de la pile : tout record de l'app vit sous un espace de noms de l'app (`srd:`, `srfh:`,
   `fh:`, `xphb:`, `xdmg:`), qu'un catalog ne peut pas employer ; et un id pris DANS le fichier même (un
   record écrit deux fois — `JSON.parse` garderait le second en silence) est cherché dans le texte.

   ⭐ ELLE COLLECTE CHAQUE FAUTE, avec son CHEMIN et une phrase qu'un créateur comprend — `readLayer`
   s'arrête à la première, et parle au développeur. Puis, si elle n'en a trouvé aucune, elle passe les
   octets à `readLayer`, le juge du montage : 🔴 ce que ce juge-ci accepte, le montage ne doit jamais le
   refuser. Une garde le tient (`tests/catalog-390.test.mjs`) ; si `readLayer` refusait quand même, sa
   raison devient une faute ici — jamais un catalog accepté qui tomberait au démarrage.

   ⏳ LES PHRASES SONT DES BROUILLONS ANGLAIS : Eric arrête la lettre.

   📍 POURQUOI `src/catalog/` ET PAS `src/layers/` : le bloc des couches est GÉNÉRIQUE — il ne connaît ni une
   langue, ni Fate's Hand (§0.12, garde `tests/layers-block.test.mjs`, qui l'a dit en rouge au premier essai). Ce
   juge-ci est une POLITIQUE de l'app : ses noms réservés, ses mots pour un créateur. Il lit le bloc (`readLayer`,
   les grammaires), il n'y vit pas. JS pur, sans disque ni DOM : la page l'importe, la ligne de commande aussi. */

import { readLayer, GENRES, FORBIDDEN_KEYS, PATTERNS, ATTRIBUTION_KEYS } from "../layers/document.mjs";

/** Les genres qu'un catalog peut ajouter — ce qu'un créateur écrit, chacun montré par le modèle
 *  (`examples/catalog-modele.layer.json`). ⚠️ La SOUS-CLASSE n'y est pas, et ce n'est pas un oubli : elle
 *  vit dans le record de sa classe (`class.data.subclass`), et l'ajouter serait PATCHER la classe. Un genre
 *  « sous-classe » attaché par référence viendra dans un lot à part (ARCHI 35, 30/09). */
export const GENRES_DU_CATALOG = Object.freeze(["armor", "background", "feat", "gear", "item", "species", "spell", "weapon"]);

/** Les espaces de noms de l'app — un catalog ne s'appelle pas ainsi, et n'écrit aucun record sous eux. Le
 *  mot dit au créateur À QUI l'id appartient. Une garde tient que chaque couche servie par l'app et chaque
 *  livre du joueur y tombe. */
export const ESPACES_DE_L_APP = Object.freeze({
  srd: "the SRD",
  srfh: "the app's own rules",
  fh: "Fate's Hand",
  xphb: "the Player's Handbook",
  xdmg: "the Dungeon Master's Guide"
});

/** UN NOM DE L'APP — un id qui est l'un de ses espaces de noms ou commence par lui suivi d'un tiret (`srd`,
 *  `fh-lore-en`, `xphb-en`). ⭐ Toute couche servie par l'app en porte un, et AUCUN catalog ne peut en porter
 *  (le juge le refuse) : c'est ce qui sépare, sans le fichier sous la main, une couche retirée du produit
 *  (`fh-retiree-en` — elle se recale) d'un catalog de créateur absent de cet appareil (il ne se recale pas).
 *  La table des noms réservés est une RÈGLE du format, pas une forme devinée. */
export function estUnNomDeLApp(id) {
  return typeof id === "string" && Object.keys(ESPACES_DE_L_APP).some((p) => id === p || id.startsWith(`${p}-`));
}

/** LA FORME DE L'ID D'UN CATALOG (Q1 → a) : le créateur, un tiret, le catalog — minuscules, chiffres,
 *  tirets simples, 3 à 60 caractères. Assez étroite pour préfixer un id de record (dont le premier segment
 *  n'admet ni point ni souligné), et c'est pour ça qu'elle l'est. */
export const FORME_DE_L_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ID_MIN = 3;
const ID_MAX = 60;
const FORME_DU_SLUG = /^[a-z0-9][a-z0-9-]*$/;

/** LES CHAMPS QU'UN RECORD DOIT PORTER, PAR GENRE — ce que le builder LIT pour montrer et employer un
 *  record. ⛔ Aucun n'est inventé : une garde tient que CHAQUE champ exigé est porté par TOUS les records du
 *  même genre dans le SRD, avec l'un des types déclarés ici, et que chaque liste fermée est exactement
 *  l'ensemble des valeurs que le SRD emploie. Un créateur peut ajouter d'autres champs ; ceux-ci manquent,
 *  et le record ne se montre pas, ou se montre faux. */
export const CHAMPS_EXIGES = Object.freeze({
  armor: [
    { champ: "armor_category", types: ["string"], valeurs: ["heavy", "light", "medium", "shield"], aide: "light, medium, heavy or shield" },
    { champ: "ac_base", types: ["number", "null"], aide: "the Armor Class it gives, as a number" },
    { champ: "cost", types: ["string"], aide: "a price, like \"50 GP\"" },
    { champ: "weight", types: ["string"], aide: "a weight, like \"20 lb.\"" }
  ],
  background: [
    { champ: "ability_keys", types: ["array"], aide: "the three abilities it raises, like [\"str\", \"dex\", \"con\"]" },
    { champ: "skill_ids", types: ["array"], aide: "the ids of its two skills, like [\"srd:skill:en:athletics\"]" },
    { champ: "feat_id", types: ["string"], aide: "the id of its origin feat" },
    { champ: "equipment", types: ["string"], aide: "its starting equipment, in words" }
  ],
  feat: [
    { champ: "category", types: ["string"], valeurs: ["epic-boon", "fighting-style", "general", "origin"], aide: "origin, general, fighting-style or epic-boon" },
    { champ: "description", types: ["string"], aide: "what the feat does, in words" }
  ],
  gear: [
    { champ: "cost", types: ["string"], aide: "a price, like \"5 SP\"" },
    { champ: "weight", types: ["string"], aide: "a weight, like \"1 lb.\"" }
  ],
  item: [
    { champ: "category", types: ["string"], valeurs: ["armor", "potion", "ring", "rod", "scroll", "staff", "wand", "weapon", "wondrous-item"], aide: "what kind of magic item it is" },
    { champ: "rarity", types: ["string"], aide: "its rarity, like \"Uncommon\" or \"Rare (Requires Attunement)\"" },
    { champ: "attunement", types: ["boolean"], aide: "true if it needs attunement, false otherwise" },
    { champ: "description", types: ["string"], aide: "what the item does, in words" }
  ],
  species: [
    { champ: "description", types: ["string"], aide: "the species and its traits, in words" },
    { champ: "size", types: ["string"], aide: "its size, like \"Medium (about 5 feet tall)\"" },
    { champ: "speed_ft", types: ["number"], aide: "its walking speed in feet, like 30" },
    { champ: "traits", types: ["array"], aide: "its traits, each { \"id\", \"name\", \"text\" }" }
  ],
  spell: [
    { champ: "level", types: ["number"], aide: "a whole number from 0 to 9 (0 is a cantrip)" },
    { champ: "school", types: ["string"], valeurs: ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"], aide: "one of the eight schools of magic" },
    { champ: "casting_time", types: ["string"], aide: "like \"Action\" or \"Bonus Action\"" },
    { champ: "range", types: ["string"], aide: "like \"60 feet\" or \"Self\"" },
    { champ: "components", types: ["string"], aide: "like \"V, S\" or \"V, S, M (a pinch of ash)\"" },
    { champ: "duration", types: ["string"], aide: "like \"Instantaneous\" or \"Concentration, up to 1 minute\"" },
    { champ: "description", types: ["string"], aide: "what the spell does, in words" },
    { champ: "class_keys", types: ["array"], aide: "the classes that can learn it, like [\"Wizard\", \"Sorcerer\"]" }
  ],
  weapon: [
    { champ: "cost", types: ["string"], aide: "a price, like \"15 GP\"" },
    { champ: "weight", types: ["string"], aide: "a weight, like \"3 lb.\"" },
    { champ: "damage", types: ["string"], aide: "its damage in words, like \"1d8 Slashing\"" },
    { champ: "damage_dice", types: ["string", "null"], aide: "its damage dice, like \"1d8\"" },
    { champ: "damage_type_key", types: ["string"], valeurs: ["bludgeoning", "piercing", "slashing"], aide: "bludgeoning, piercing or slashing" },
    { champ: "weapon_category", types: ["string"], valeurs: ["martial", "simple"], aide: "simple or martial" },
    { champ: "weapon_range", types: ["string"], valeurs: ["melee", "ranged"], aide: "melee or ranged" },
    { champ: "property_list", types: ["array"], aide: "its properties, each { \"key\", \"label\" } — [] if it has none" }
  ]
});

/** Les champs de la racine d'un catalog — ceux d'une couche, moins `ruleValues` (un catalog ne change aucune
 *  règle). */
const CLEFS_DE_LA_RACINE = ["schema", "id", "version", "name", "lang", "units", "flags", "attribution", "description", "records"];
const CLEFS_D_UN_RECORD = ["op", "name", "slug", "data", "attribution", "source"];
const FORBIDDEN = new Set(FORBIDDEN_KEYS);

const objet = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const typeDe = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);
const MOT_DU_TYPE = { string: "text in quotes", number: "a number", boolean: "true or false", array: "a list [ … ]", null: "null", object: "an object { … }" };
/** Un chemin lisible : `records.spell["noirchicot-mistlands:spell:en:ember-lance"].data.level`. */
const cle = (id) => `["${id}"]`;
const listeDes = (xs) => xs.join(", ");

/** LES CLEFS ÉCRITES DEUX FOIS DANS UN MÊME OBJET — `JSON.parse` garde la seconde et tait la première ; un
 *  créateur (ou une IA) qui a écrit deux sorts sous le même id en perdrait un sans le savoir. Un petit
 *  lecteur du texte JSON, qui ne sert qu'à ça : il suppose un JSON déjà valide (`JSON.parse` a répondu).
 *  @returns {Array<{chemin: string[], clef: string}>} le chemin de l'objet, et la clef en double */
export function clefsEnDouble(texte) {
  const doubles = [];
  let i = 0;
  const blanc = () => { while (i < texte.length && " \t\n\r".includes(texte[i])) i += 1; };
  const chaine = () => {
    let s = "";
    i += 1;                                          // le guillemet ouvrant
    while (texte[i] !== "\"") {
      if (texte[i] === "\\") {
        const c = texte[i + 1];
        if (c === "u") { s += String.fromCharCode(parseInt(texte.slice(i + 2, i + 6), 16)); i += 6; continue; }
        s += ({ n: "\n", t: "\t", r: "\r", b: "\b", f: "\f" })[c] ?? c;
        i += 2;
        continue;
      }
      s += texte[i];
      i += 1;
    }
    i += 1;                                          // le guillemet fermant
    return s;
  };
  const valeur = (chemin) => {
    blanc();
    const c = texte[i];
    if (c === "{") {
      i += 1;
      const vues = new Set();
      blanc();
      if (texte[i] === "}") { i += 1; return; }
      for (;;) {
        blanc();
        const k = chaine();
        if (vues.has(k)) doubles.push({ chemin, clef: k });
        vues.add(k);
        blanc();
        i += 1;                                      // les deux-points
        valeur(chemin.concat(k));
        blanc();
        if (texte[i] === ",") { i += 1; continue; }
        i += 1;                                      // l'accolade fermante
        return;
      }
    }
    if (c === "[") {
      i += 1;
      blanc();
      if (texte[i] === "]") { i += 1; return; }
      let n = 0;
      for (;;) {
        valeur(chemin.concat(String(n)));
        n += 1;
        blanc();
        if (texte[i] === ",") { i += 1; continue; }
        i += 1;
        return;
      }
    }
    if (c === "\"") { chaine(); return; }
    while (i < texte.length && !",]} \t\n\r".includes(texte[i])) i += 1;   // nombre, true, false, null
  };
  valeur([]);
  return doubles;
}

/** LE JUGE. Des octets → un verdict.
 *  @returns {{etat:"valide", id:string, nom:string, auteur:string, version:string, records:number}
 *           | {etat:"refus", fautes: Array<{chemin:string, phrase:string}>}} */
export function verifierUnCatalog(octets) {
  const fautes = [];
  const faute = (chemin, phrase) => { fautes.push({ chemin, phrase }); };
  const refus = () => ({ etat: "refus", fautes });

  const bytes = typeof octets === "string" ? new TextEncoder().encode(octets) : octets;
  if (!(bytes instanceof Uint8Array)) { faute("(file)", "The catalog must be a file."); return refus(); }
  if (bytes.length === 0) { faute("(file)", "The file is empty."); return refus(); }
  let texte;
  try { texte = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch (_) {
    faute("(file)", "The file is not text in UTF-8. Save it as UTF-8 JSON."); return refus();
  }

  /* L'ANALYSE — les clefs interdites se relèvent pendant `JSON.parse`, avec leur chemin. */
  let doc;
  const interdites = [];
  try {
    doc = JSON.parse(texte, function (key, value) {
      if (FORBIDDEN.has(key)) interdites.push(key);
      return value;
    });
  } catch (error) {
    faute("(file)", `This is not valid JSON (${error.message}). Look for a missing comma, quote or bracket near that place.`);
    return refus();
  }
  for (const k of [...new Set(interdites)]) faute(k, `"${k}" is not allowed as a field name: a catalog is data, never code.`);
  if (!objet(doc)) {
    faute("(file)", "The file must hold one JSON object that begins with { \"schema\": \"fh-layer/1\", … }.");
    return refus();
  }

  /* LA RACINE */
  for (const k of Object.keys(doc)) {
    if (k === "ruleValues") faute("ruleValues", "A catalog adds records; it cannot change a rule of the game. Remove \"ruleValues\".");
    else if (!CLEFS_DE_LA_RACINE.includes(k) && !FORBIDDEN.has(k)) {
      faute(k, `"${k}" is not a field of a catalog. Its fields are: ${listeDes(CLEFS_DE_LA_RACINE)}.`);
    }
  }
  if (doc.schema !== "fh-layer/1") faute("schema", "Must be \"fh-layer/1\" — it tells the app what kind of file this is.");

  const id = doc.id;
  let idSain = false;
  if (typeof id !== "string" || id === "") {
    faute("id", "Missing. Give your catalog an id: your name, a dash, the catalog's name — for example \"noirchicot-mistlands\".");
  } else if (!FORME_DE_L_ID.test(id) || id.length < ID_MIN || id.length > ID_MAX) {
    faute("id", `"${id}" is not a valid catalog id. Use lowercase letters, digits and single dashes (${ID_MIN} to ${ID_MAX} characters), like "noirchicot-mistlands".`);
  } else {
    const espace = estUnNomDeLApp(id) ? Object.keys(ESPACES_DE_L_APP).find((p) => id === p || id.startsWith(`${p}-`)) : null;
    if (espace) faute("id", `"${id}" is a name the app keeps for ${ESPACES_DE_L_APP[espace]}. Choose your own, like "yourname-${id.replace(/^[a-z0-9]+-?/, "") || "catalog"}".`);
    else idSain = true;
  }
  if (typeof doc.version !== "string" || doc.version === "" || doc.version.length > 40) {
    faute("version", "Missing. Give your catalog a version, like \"1.0.0\" — raise it when you change the catalog.");
  }
  if (typeof doc.name !== "string" || doc.name.trim() === "" || doc.name.length > 200) {
    faute("name", "Missing. Give your catalog the name players will read in Layers, like \"Mistlands\".");
  }
  const lang = doc.lang;
  const langSaine = typeof lang === "string" && PATTERNS.lang.test(lang);
  if (!langSaine) faute("lang", "Missing or not a language code. Write the language of your records, like \"en\".");
  if (doc.units !== undefined) {
    const ok = objet(doc.units) && Object.entries(doc.units).every(([k, v]) =>
      (k === "distance" && ["m", "ft"].includes(v)) || (k === "weight" && ["kg", "lb"].includes(v)));
    if (!ok) faute("units", "Write { \"distance\": \"ft\", \"weight\": \"lb\" } (or \"m\" and \"kg\"), or leave \"units\" out.");
  }
  if (!Array.isArray(doc.flags)) faute("flags", "Missing. Write \"flags\": [] — a catalog switches on no rule.");
  else if (doc.flags.length > 0) faute("flags", "A catalog adds records only; it cannot switch on a rule of the game. Leave it empty: [].");
  if (doc.description !== undefined && typeof doc.description !== "string") faute("description", "Must be text in quotes.");

  /* L'ATTRIBUTION — qui l'a fait, et sous quelle licence (Q2 → a : l'auteur est exigé ici). */
  const a = doc.attribution;
  if (!objet(a)) {
    faute("attribution", "Missing. Say who made the catalog and under which licence: { \"author\": \"Your Name\", \"license\": \"CC-BY-4.0\" }.");
  } else {
    for (const k of Object.keys(a)) {
      if (!ATTRIBUTION_KEYS.includes(k)) faute(`attribution.${k}`, `"${k}" is not a field of the attribution. Its fields are: ${listeDes(ATTRIBUTION_KEYS)}.`);
    }
    if (typeof a.author !== "string" || a.author.trim() === "" || a.author.length > 200) {
      faute("attribution.author", "Missing. Write your name: Layers shows it as \"by <author>\".");
    }
    if (typeof a.license !== "string" || a.license.trim() === "" || a.license.length > 80) {
      faute("attribution.license", "Missing. Say which licence your catalog is under, like \"CC-BY-4.0\" or \"all-rights-reserved\".");
    }
    for (const k of ["text", "url"]) if (a[k] !== undefined && typeof a[k] !== "string") faute(`attribution.${k}`, "Must be text in quotes.");
  }

  /* LES RECORDS — et d'abord ce qui est écrit DEUX FOIS : `JSON.parse` garde le second et tait le premier. Un
     id de record en double se dit sous son genre (plus bas) ; toute autre clef en double — deux blocs `"gear"`,
     deux `"attribution"` — se dit ici, à son chemin. */
  const doubles = clefsEnDouble(texte);
  for (const d of doubles) {
    if (d.chemin.length === 2 && d.chemin[0] === "records") continue;
    const ou = d.chemin.reduce((acc, seg, i) => (i === 0 ? seg : /^[A-Za-z_][A-Za-z0-9_]*$/.test(seg) ? `${acc}.${seg}` : `${acc}${cle(seg)}`), "");
    faute(ou ? `${ou}.${d.clef}` : d.clef, `"${d.clef}" is written twice here. The second one would silently replace the first: merge them into one.`);
  }
  const recs = doc.records;
  let total = 0;
  if (!objet(recs)) {
    faute("records", "Missing. Put your records in \"records\", by type: { \"spell\": { … }, \"feat\": { … } }.");
  } else {
    if (Object.keys(recs).length === 0) faute("records", "The catalog has no record. Add at least one.");
    for (const [genre, entrees] of Object.entries(recs)) {
      const cg = `records.${genre}`;
      if (!GENRES.includes(genre)) {
        faute(cg, `"${genre}" is not a type of record. A catalog can add: ${listeDes(GENRES_DU_CATALOG)}.`);
        continue;
      }
      if (!GENRES_DU_CATALOG.includes(genre)) {
        faute(cg, `A catalog cannot add a "${genre}" yet. It can add: ${listeDes(GENRES_DU_CATALOG)}.`);
        continue;
      }
      if (!objet(entrees)) { faute(cg, "Must be an object: { \"<record id>\": { \"name\": …, \"data\": { … } } }."); continue; }
      for (const d of doubles) {
        if (d.chemin.length === 2 && d.chemin[0] === "records" && d.chemin[1] === genre) {
          faute(`${cg}${cle(d.clef)}`, `"${d.clef}" is written twice in this file. Each record needs its own id — the second one would silently replace the first.`);
        }
      }
      for (const [rid, e] of Object.entries(entrees)) {
        total += 1;
        const cr = `${cg}${cle(rid)}`;
        const segments = rid.split(":");
        const slug = segments[segments.length - 1];
        const conseil = `"${idSain ? id : "<catalog id>"}:${genre}:${langSaine ? lang : "en"}:${FORME_DU_SLUG.test(slug || "") ? slug : "your-record"}"`;
        const espace = segments[0] in ESPACES_DE_L_APP ? segments[0] : null;
        if (espace) {
          faute(cr, `"${rid}" is an id of ${ESPACES_DE_L_APP[espace]}. A catalog never replaces a record that already exists — it only adds new ones. Give yours its own id: ${conseil}.`);
        } else if (!PATTERNS.recordId.test(rid) || segments.length !== 4 || !FORME_DU_SLUG.test(slug)) {
          faute(cr, `"${rid}" is not a valid record id. Write it ${conseil}: your catalog id, the type, the language and a name in lowercase with dashes.`);
        } else if (idSain && segments[0] !== id) {
          faute(cr, `"${rid}" must begin with your catalog's id: ${conseil}. A catalog only writes records under its own name.`);
        } else if (segments[1] !== genre) {
          faute(cr, `"${rid}" is filed under "${genre}" but its id says "${segments[1]}". Write ${conseil}.`);
        } else if (langSaine && segments[2] !== lang) {
          faute(cr, `"${rid}" says "${segments[2]}" but the catalog's language is "${lang}". Write ${conseil}.`);
        }
        if (!objet(e)) { faute(cr, "Must be an object: { \"name\": \"…\", \"data\": { … } }."); continue; }
        if (e.op !== undefined && e.op !== "add") {
          const quoi = e.op === "patch" ? "would change a record that already exists"
            : e.op === "disable" ? "would remove a record that already exists" : "is not something a catalog can do";
          faute(`${cr}.op`, `"${e.op}" ${quoi}. A catalog only adds new records: remove "op", or write "add".`);
        }
        for (const k of Object.keys(e)) {
          if (!CLEFS_D_UN_RECORD.includes(k) && !FORBIDDEN.has(k) && !(e.op === "patch" && (k === "changes" || k === "remove" || k === "note"))
            && !(e.op === "disable" && k === "reason")) {
            faute(`${cr}.${k}`, `"${k}" is not a field of a record. Its fields are: name, data, and optionally slug, attribution, source.`);
          }
        }
        if (e.op !== undefined && e.op !== "add") continue;
        if (typeof e.name !== "string" || e.name.trim() === "" || e.name.length > 200) faute(`${cr}.name`, "Missing. Give the record the name players will read.");
        if (e.slug !== undefined && (typeof e.slug !== "string" || !PATTERNS.slug.test(e.slug))) {
          faute(`${cr}.slug`, "Must be lowercase letters, digits and dashes — or leave \"slug\" out.");
        }
        if (e.attribution !== undefined) {
          const ra = e.attribution;
          if (!objet(ra) || typeof ra.license !== "string" || ra.license.trim() === "" || ra.license.length > 80
            || Object.keys(ra).some((k) => !ATTRIBUTION_KEYS.includes(k))
            || ["author", "text", "url"].some((k) => ra[k] !== undefined && (typeof ra[k] !== "string" || (k === "author" && (ra[k] === "" || ra[k].length > 200))))) {
            faute(`${cr}.attribution`, `A record's own attribution needs a "license", and only these fields: ${listeDes(ATTRIBUTION_KEYS)} — or leave it out: the catalog's attribution applies.`);
          }
        }
        if (e.source !== undefined) {
          const rs = e.source;
          if (!objet(rs) || typeof rs.id !== "string" || rs.id === "" || rs.id.length > 120
            || Object.keys(rs).some((k) => !["id", "locator", "version"].includes(k))
            || ["locator", "version"].some((k) => rs[k] !== undefined && typeof rs[k] !== "string")) {
            faute(`${cr}.source`, "A source is { \"id\": where the record comes from, optionally \"locator\" and \"version\" } — or leave \"source\" out.");
          }
        }
        if (!objet(e.data)) { faute(`${cr}.data`, "Missing. The record's content goes in \"data\": { … }."); continue; }
        for (const { champ, types, valeurs, aide } of CHAMPS_EXIGES[genre]) {
          const cc = `${cr}.data.${champ}`;
          if (!(champ in e.data)) { faute(cc, `Missing. A ${genre} needs "${champ}": ${aide}.`); continue; }
          const v = e.data[champ];
          if (!types.includes(typeDe(v))) { faute(cc, `Must be ${types.map((t) => MOT_DU_TYPE[t]).join(" or ")}: ${aide}.`); continue; }
          if (valeurs && !valeurs.includes(v)) { faute(cc, `"${v}" is not one of: ${listeDes(valeurs)}.`); continue; }
          if (genre === "spell" && champ === "level" && !(Number.isInteger(v) && v >= 0 && v <= 9)) faute(cc, `${v} is not a spell level: ${aide}.`);
        }
      }
    }
  }

  if (fautes.length > 0) return refus();

  /* 🔴 LE JUGE DU MONTAGE, EN DERNIER — ce que ce juge-ci accepte, le montage ne le refuse jamais. */
  try {
    readLayer(bytes, `catalog:${id}`);
  } catch (error) {
    faute("(file)", `The app could not read this file: ${error && error.message ? error.message : String(error)}`);
    return refus();
  }
  return { etat: "valide", id, nom: doc.name, auteur: doc.attribution.author, version: doc.version, records: total };
}

/** Une ligne par faute : `chemin — phrase`. Le même texte partout où un refus se lit (la fenêtre d'Import a
 *  book, la ligne de commande). */
export function fauteEnLigne({ chemin, phrase }) {
  return chemin === "(file)" ? phrase : `${chemin} — ${phrase}`;
}
