/* ══ L'OBJET CRAFTÉ — CE QUE LA FICHE EN GARDE, ET COMMENT IL SE NOMME ═════════
   Lot 265, 2026-09-25.

   ⚖️ Eric, 25/09 : *« l'objet crafté va dans l'équipement du personnage et par
   extension il existe à cette table de jeu, il peut être échangé avec les autres
   persos »* — puis, aux trois questions : **le craft se paie** (la bourse),
   **l'objet arrive tout de suite** (le temps de craft s'affiche, il ne bloque pas),
   **le site ne stocke rien** (il affiche et recalcule).

   ⭐ LA FICHE GARDE LA RECETTE, JAMAIS LE RÉSULTAT. Une ligne `gear[N]` crafté,
   c'est la ligne d'un objet ordinaire — `gear[N]` pointe sur sa BASE (la Longsword
   du SRD) — plus trois compléments facultatifs :
     · `gear[N].bonus`      — le mot du bonus, `"+1"` ;
     · `gear[N].powers[K]`  — chaque pouvoir, une RÉFÉRENCE au record du SRD ;
     · `gear[N].plan`       — le plan d'où il vient (`Weapon, +1, +2, or +3`) ;
     · `gear[N].note`       — *« Crafted by … »*, une ligne sans effet de jeu.
   ⛔ Aucun nom, aucun prix, aucun poids n'est écrit : ils se RECOMPOSENT à chaque
   ouverture. Un nombre enregistré diverge au premier réglage ; une recette suit.
   📏 Le format l'acceptait déjà, sans révision de `fh-char/1` : un choix est une
   référence OU un scalaire, et `gear[3].powers[0]` passe `choicePath`.

   ⛔ MODULE FEUILLE : aucun import. Le moteur (`derive.mjs`) et l'écran
   (`equipment-step.mjs`) nomment la MÊME ligne par la MÊME fonction — deux copies
   divergeraient au premier pouvoir ajouté. */

/** Le plafond du nom dans `resolved.gear[].name` (`fh-char/1`, `maxLength: 100`). */
export const NOM_MAX = 100;

/** `"+1"` → 1 · `"+3"` → 3 · tout le reste → `null`.
 *  ⚖️ LE SRD S'ARRÊTE À +3 (`Weapon, +1, +2, or +3`). 🔴 La première écriture
 *  acceptait `[1-9]` : le garde 3 l'a vu, une armure « +9 » prenait neuf points
 *  de CA. ⛔ Un bonus illisible n'est pas un zéro : l'appelant n'ajoute rien. */
export function lireLeBonus(valeur) {
  const m = typeof valeur === "string" ? /^\+([1-3])$/.exec(valeur.trim()) : null;
  return m ? Number(m[1]) : null;
}

/** Le nom d'un objet crafté : `Longsword +1 (Flame Tongue, Vicious)`.
 *  ⚖️ LA FORME EST UN DÉFAUT DU LOT 265, pas une règle d'Eric : la base d'abord
 *  (c'est ce qu'on tient en main), le bonus collé, les pouvoirs entre parenthèses
 *  dans l'ordre POWER 1 · POWER 2.
 *  ⛔ Un objet sans bonus ni pouvoir garde le nom de sa base — il n'est pas crafté.
 *  📏 Tronqué à `NOM_MAX` par une ellipse : le schéma refuse au-delà, et un
 *  document refusé ne se sauve pas. */
export function nomCrafte({ base, bonus = null, pouvoirs = [] } = {}) {
  const tete = String(base || "").trim();
  const plus = lireLeBonus(bonus) ? ` +${lireLeBonus(bonus)}` : "";
  const noms = (pouvoirs || []).map((p) => String(p || "").trim()).filter(Boolean);
  const nom = `${tete}${plus}${noms.length ? ` (${noms.join(", ")})` : ""}`;
  return nom.length <= NOM_MAX ? nom : `${nom.slice(0, NOM_MAX - 1)}…`;
}

/** La ligne porte-t-elle une recette ? — un bonus lisible, au moins un pouvoir, ou
 *  (lot 277) une variante, ou (lot 285) le sort d'un parchemin. */
export function estCrafte({ bonus = null, pouvoirs = [], variante = null, sort = null } = {}) {
  return lireLeBonus(bonus) !== null || (pouvoirs || []).length > 0
    || (typeof variante === "string" && variante.trim() !== "")
    || Boolean(sort && typeof sort === "object" && sort.id);
}

/* ══ LOT 277 — LE BLUEPRINT À VARIANTE : UN SEUL CHOIX, LA VARIANTE ══════════════
   ⚖️ Eric, 2026-09-25 : *« T'as 127 wondrous en blueprint ? Sur lesquels il y a un
   choix à faire ? »* — non : le SRD en porte CINQ (`Belt of Giant Strength`,
   `Feather Token`, `Figurine of Wondrous Power`, `Horn of Valhalla`, `Ioun Stone`),
   plus les deux potions (*« inclue les potions »*) et la baguette (*« et la wand »*).
   Tous ont la même forme : un objet, une variante à choisir, et c'est la variante
   qui dit la rareté. Puis *« oui c'est ça »* au schéma : `Ioun Stone ▾` · `Variant ▾`.

   ⭐ LES VARIANTES SE LISENT DANS LE RECORD, jamais dans une liste de noms. Le SRD
   les écrit sous CINQ formes, et cette fonction les lit toutes :
     ① dans la RARETÉ, paire par paire — « Rare (Silver or Brass), Very Rare
       (Bronze), or Legendary (Iron) » · « Uncommon (+1), Rare (+2)… » ;
     ② en TABLE dans la description — « Belt of Giant Strength (hill) 21 Rare »,
       « Potion of Healing (greater) 4d4 + 4 Uncommon » : un nom, peut-être une
       parenthèse, une colonne qui commence par un chiffre, la rareté en fin ;
     ③ en PARAGRAPHES — « Awareness (Rare). While this dark-blue rhomboid… » ;
     ④ le CHOIX DU MJ en table de tirage, à une seule rareté (lot 333, plus bas) ;
     ⑤ le CHOIX DU MJ NOMMÉ DANS LE TEXTE, en sections, sans table (lot 354, plus bas).
   ⛔ Moins de deux variantes lues = aucune : il n'y a pas de choix.

   ⚠️ CE MODULE RESTE UNE FEUILLE : le moteur nomme la ligne par `nomDUneVariante`,
   l'écran propose `variantesDe` — la même lecture, un seul écrivain. */
const RARETE = "(Very Rare|Legendary|Uncommon|Common|Rare)";
const PALIER_DU_MOT = (m) => m.replace(/\b\w/g, (c) => c.toUpperCase()).replace("Very rare", "Very Rare");
/* « frost or stone » → « Frost or Stone » : ⛔ la conjonction reste en minuscule */
const majuscules = (s) => String(s).trim()
  .replace(/(^|[\s(/-])([a-z])/g, (_, a, c) => a + c.toUpperCase()).replace(/\bOr\b/g, "or");

/** @param data `{ name, rarity, description }` — le `data` d'un record d'objet.
 *  @returns `{ mot, rarete, nom }[]` — `mot` pour le menu, `nom` pour la fiche. */
export function variantesDe(data) {
  const d = data || {};
  const nomPlan = String(d.name || "").trim();
  if (!nomPlan) return [];
  /* ⛔ UN PLAN QUI PORTE UNE BASE N'EST PAS UN PLAN À VARIANTE : `Weapon, +1, +2, or +3`
     (`[Any Simple or Martial]`) se compose base + bonus + pouvoirs, et `Ammunition, +1…`
     (`[Any Ammunition]`) attend le lot des munitions. Le `subtype` est le signal. */
  if (typeof d.subtype === "string" && d.subtype.trim()) return [];
  /* le nom d'un plan à bonus perd son énumération : « Wand of the War Mage, +1, +2, or +3 » */
  const racine = nomPlan.replace(/,\s*\+1,\s*\+2,?\s*or\s*\+3\s*$/i, "").trim();

  /* ① LA RARETÉ ÉNUMÈRE */
  const r = String(d.rarity || "");
  const paires = [...r.matchAll(new RegExp(`${RARETE}\\s*\\(([^)]+)\\)`, "gi"))]
    .filter((m) => !/requires/i.test(m[2]));
  if (paires.length >= 2) {
    const out = [];
    for (const m of paires) {
      for (const mot of m[2].split(/\s+or\s+|,\s*/).map((x) => x.trim()).filter(Boolean)) {
        out.push({ mot, rarete: PALIER_DU_MOT(m[1].toLowerCase()),
          nom: /^\+\d$/.test(mot) ? `${racine} ${mot}` : `${racine} (${mot})` });
      }
    }
    return out;
  }

  const paragraphes = paragraphesDe(d.description);
  /* ② LA TABLE — la ligne finit par une rareté, sa 2ᵉ colonne commence par un chiffre */
  const rangee = new RegExp(`^([^\\d()]+?)\\s*(?:\\(([^)]+)\\))?\\s+\\d.*?\\s${RARETE}$`, "i");
  const table = paragraphes.map((p) => rangee.exec(p)).filter(Boolean);
  if (table.length >= 2) {
    return table.map((m) => {
      const mot = m[2] ? majuscules(m[2]) : "Standard";
      return { mot, rarete: PALIER_DU_MOT(m[3].toLowerCase()),
        nom: m[2] ? `${m[1].trim()} (${mot})` : m[1].trim() };
    });
  }

  /* ③ LES PARAGRAPHES « Nom (Rareté). … » */
  const tete = new RegExp(`^([A-Z][^.()\\n]{0,40}?)\\s*\\(${RARETE}\\)\\.\\s`);
  const paras = paragraphes.map((p) => tete.exec(p)).filter(Boolean);
  if (paras.length >= 2) {
    return paras.map((m) => ({ mot: m[1].trim(), rarete: PALIER_DU_MOT(m[2].toLowerCase()),
      nom: `${racine} (${m[1].trim()})` }));
  }

  /* ④ LE CHOIX DU MJ, EN TABLE DE TIRAGE, À UNE SEULE RARETÉ — lot 333 */
  const tirees = variantesDuChoixDuMJ(d, racine, paragraphes);
  if (tirees.length) return tirees;

  /* ⑤ LE CHOIX DU MJ NOMMÉ DANS LE TEXTE, EN SECTIONS — lot 354 */
  return variantesNommees(d, racine, paragraphes);
}

/* ══ LOT 333 — ④ LA VARIANTE QUE LE MJ CHOISIT ════════════════════════════════════
   ⚖️ Eric, 2026-09-27 : *« Carpet of flying devrait être un blueprint »*, puis, aux deux
   questions (le Carpet seul, ou tous les objets de même forme ? X5 demande-t-il la taille ?) :
   *« B et a (sa taille, capacité, vitesse) »*.
   🔴 POURQUOI LES TROIS FORMES NE LE VOYAIENT PAS : ses quatre tailles partagent UNE rareté
   (Very Rare) — la rareté n'énumère rien (①), la table n'a pas de colonne de rareté (②), et il
   n'y a pas de paragraphes « Nom (Rareté). » (③). Le choix existe pourtant, écrit en toutes
   lettres : *« The GM chooses the size of a given carpet or determines it randomly by rolling
   on the following table »*.
   ⭐ LE SIGNAL EST CETTE PHRASE DU SRD, ⛔ PAS UNE LISTE DE NOMS : le MJ choisit la TAILLE, le
   TYPE ou la SORTE d'UN objet, ou la tire. 📏 Mesuré dans la couche : Carpet of Flying, Manual
   of Golems, Potion of Resistance, Ring of Resistance (+ Feather Token et Horn of Valhalla,
   déjà lus par ① et ②).
   ⛔ ET CE QU'ELLE LAISSE DEHORS, VOLONTAIREMENT : un objet fait de PLUSIEURS éléments tirés
   (« the type of EACH bead » — Necklace of Prayer Beads ; « the PATCHES » — Robe of Useful
   Items) n'est pas UNE variante ; un choix sans table (Ring of Elemental Command, « the linked
   plane ») n'a rien à proposer ICI — 🔄 lot 354 : ses variantes sont nommées dans son texte, et
   c'est la forme ⑤ qui les lit ; un effet choisi à l'usage (Bag of Beans, Candle of
   Invocation) n'est pas l'objet.
   ⭐ LA VARIANTE EST LA LIGNE DE LA TABLE, SANS SON DÉ — Eric : *« sa taille, capacité,
   vitesse »* : « 3 ft. × 5 ft. 200 lb. 80 feet ». Toutes ont la rareté de l'objet. Une table
   à deux colonnes de tirage (« 1d10 Damage Type 1d10 Damage Type » — Potion of Resistance) se
   lit en deux, et les variantes se rangent dans l'ordre du dé. */
const CHOIX_DU_MJ = /GM chooses the [^.]*?\b(?:size|type|kind)\b[^.]*?\bdetermines? (?:it|them) randomly|\b(?:size|type|kind), which the GM chooses or determines (?:it )?randomly/i;
const DE_EN_TETE = /\b\d*d\d+\b/gi;
const LIGNE_DE_TIRAGE = /^(\d{1,3})(?:\s*[–-]\s*\d{1,3})?\s+(\S.*)$/;
const COUPE_DE_COLONNE = /\s(?=\d{1,3}(?:\s*[–-]\s*\d{1,3})?\s+[A-Za-z])/;
function variantesDuChoixDuMJ(d, racine, paragraphes) {
  const ou = paragraphes.findIndex((p) => CHOIX_DU_MJ.test(p));
  if (ou < 0) return [];
  const palier = new RegExp(RARETE, "i").exec(String(d.rarity || ""));
  if (!palier) return [];
  const rarete = PALIER_DU_MOT(palier[1].toLowerCase());
  /* la première table de tirage APRÈS la phrase : son en-tête (s'il y en a un), puis ses lignes */
  let colonnes = 1;
  const lignes = [];
  for (const p of paragraphes.slice(ou + 1)) {
    if (/^\d*d\d+\b/i.test(p) && !lignes.length) { colonnes = Math.max(1, (p.match(DE_EN_TETE) || []).length); continue; }
    if (!LIGNE_DE_TIRAGE.test(p)) { if (lignes.length) break; continue; }
    lignes.push(p);
  }
  const cases = lignes.flatMap((l) => (colonnes > 1 ? l.split(COUPE_DE_COLONNE) : [l]))
    .map((c) => LIGNE_DE_TIRAGE.exec(c.trim())).filter(Boolean)
    .map((m) => ({ de: Number(m[1]), mot: m[2].trim() }))
    .sort((a, b) => a.de - b.de);
  if (cases.length < 2) return [];
  return cases.map(({ mot: ligne }) => {
    const { mot, detail } = premiereColonne(ligne);
    return { mot, rarete, nom: `${racine} (${mot})`, ...(detail ? { detail } : {}) };
  });
}

/** LA VARIANTE EST LA PREMIÈRE COLONNE, LE RESTE EST SON DÉTAIL — « 3 ft. × 5 ft. » · « 200 lb. ·
 *  80 feet ». ⭐ Le mot court est le NOM de la variante (celui de l'inventaire des effets, celui de
 *  `gear[N].variant`, celui de la ligne posée) ; le détail est ce qu'Eric veut voir en choisissant
 *  — *« sa taille, capacité, vitesse »*.
 *  📐 La première colonne : une MESURE (« 3 ft. », jointe par « × » à la suivante) quand la ligne
 *  commence par un chiffre ; sinon les MOTS jusqu'au premier chiffre (« Clay Golem ») ; sans chiffre,
 *  le premier mot (« Acid », et « Pearl » est la gemme — Ring of Resistance). ⚠️ Ce dernier cas est
 *  le seul qu'une ligne de mots ne départage pas : `variante-du-mj.test.mjs` le tient. */
const MESURE = /^\d[\d,.]*\s*[A-Za-z.]+(?:\s*×\s*\d[\d,.]*\s*[A-Za-z.]+)?/;
const MORCEAU = /\d[\d,.]*(?:\s*×\s*\d[\d,.]*)?\s*[A-Za-z.]+|[A-Za-z][A-Za-z' -]*[A-Za-z]/g;
function premiereColonne(ligne) {
  const s = String(ligne).trim();
  let mot;
  if (/^\d/.test(s)) mot = (MESURE.exec(s) || [s])[0];
  else if (/\d/.test(s)) mot = s.slice(0, s.search(/\d/)).trim();
  else mot = s.split(/\s+/)[0];
  const reste = s.slice(mot.length).trim();
  const detail = (reste.match(MORCEAU) || []).map((x) => x.trim()).join(" · ");
  return { mot, detail };
}

/* ══ LOT 354 — ⑤ LE CHOIX DU MJ NOMMÉ DANS LE TEXTE, EN SECTIONS ══════════════════════
   ⚖️ Eric, 2026-09-29, à « blueprint aussi ? il a un choix (l'élément) mais pas de table » :
   *« oui blueprint pour le ring »* (NORMES `equipement-blueprint-variante-du-mj`).
   🔴 POURQUOI ④ NE LE VOIT PAS : le Ring of Elemental Command n'a PAS de table de tirage —
   *« The GM chooses or randomly determines the linked plane »* — et ses variantes sont
   NOMMÉES dans son texte, une section chacune : « Air. … Earth. … Fire. … Water. … ».
   ⭐ LE SIGNAL EST LA DONNÉE, EN TROIS MORCEAUX, ⛔ JAMAIS UN NOM :
     · la phrase du choix — le MJ CHOISIT ou TIRE (« GM chooses … randomly determines ») ;
     · l'exemple que le SRD donne lui-même de la forme du nom — « a Ring of Elemental Command
       (air) » : le nom du record, puis un mot entre parenthèses ;
     · un paragraphe fait de SECTIONS titrées d'un mot (« Air. … Earth. … »), dont l'une porte
       le mot de l'exemple — ce paragraphe, et lui seul, énumère les variantes.
   ⛔ Sans sections nommées, aucune variante, même avec la phrase et l'exemple : un choix qui ne
   se nomme nulle part n'a rien à proposer (`variante-du-mj.test.mjs`, vu rouge).
   📏 Relevé sur les 3 298 records des couches, avant et après : le Ring seul bascule.
   ⚠️ La couche française ne bascule pas, comme au lot 333 : sa rareté (« légendaire ») et sa
   phrase (« Le MJ choisit ou laisse le hasard décider ») ne sont pas lues ici. */
const CHOIX_NOMME = /\bGM chooses\b[^.]*?\b(?:randomly determines?|determines? (?:it |them )?randomly)\b/i;
const TITRE_DE_SECTION = /^([A-Z][a-z']+)\.\s+\S/;
const COUPE_DE_SECTION = /(?<=[.!?])\s+(?=[A-Z][a-z']+\.\s)/;
/** Le paragraphe des sections nommées et ses sections — `null` quand l'un des trois signaux
 *  manque. Un seul lecteur pour le menu (`variantesDe`) et pour la fiche (`texteDUneVariante`). */
function sectionsNommees(d, paragraphes) {
  const nom = String(d.name || "").trim();
  const texte = String(d.description || "");
  if (!nom || !CHOIX_NOMME.test(texte)) return null;
  const exemple = new RegExp(`${nom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(([^)]+)\\)`, "i").exec(texte);
  if (!exemple) return null;
  const motDeLExemple = exemple[1].trim().toLowerCase();
  for (let i = 0; i < paragraphes.length; i += 1) {
    const morceaux = paragraphes[i].split(COUPE_DE_SECTION).map((x) => x.trim()).filter(Boolean);
    const titres = morceaux.map((m) => TITRE_DE_SECTION.exec(m));
    /* ⛔ TOUT le paragraphe est fait de sections : une prose qui contient un « Mot. » n'en est pas une */
    if (morceaux.length < 2 || titres.some((t) => !t)) continue;
    if (!titres.some((t) => t[1].toLowerCase() === motDeLExemple)) continue;
    return { index: i, sections: morceaux.map((texteDeSection, k) => ({ mot: titres[k][1], texte: texteDeSection })) };
  }
  return null;
}
/** ⑤ — les variantes sont les sections ; toutes portent la rareté de l'objet (le Ring : Legendary). */
function variantesNommees(d, racine, paragraphes) {
  const nommees = sectionsNommees(d, paragraphes);
  if (!nommees) return [];
  const palier = new RegExp(RARETE, "i").exec(String(d.rarity || ""));
  if (!palier) return [];
  const rarete = PALIER_DU_MOT(palier[1].toLowerCase());
  return nommees.sections.map(({ mot }) => ({ mot, rarete, nom: `${racine} (${mot})` }));
}

/** Les paragraphes d'une description. ⚠️ LOT 282 — UNE TÊTE « Nom (Rareté). » OUVRE UN
 *  PARAGRAPHE, MÊME COLLÉE À LA LIGNE PRÉCÉDENTE. 🔴 Mesuré dans la couche SRD : « Mastery
 *  (Legendary). » est collé au bout du paragraphe de Leadership (un saut de ligne perdu à
 *  l'extraction) — X5 n'offrait que 13 Ioun Stones sur 14, et la fiche de la Leadership
 *  récitait la Mastery. ⛔ On ne corrige pas la couche ici (elle vient de `fh-srd`) : on la
 *  LIT sans se fier à ses sauts de ligne. */
const TETE_COLLEE = /(?<=[.!?])\s+(?=[A-Z][^.()\n]{0,40}?\s*\((?:Very Rare|Legendary|Uncommon|Common|Rare)\)\.\s)/g;
function paragraphesDe(texte) {
  return String(texte || "").split(/\n+/).flatMap((p) => p.split(TETE_COLLEE)).map((x) => x.trim()).filter(Boolean);
}

/** Le nom de la ligne posée : celui de la variante lue, sinon `Plan (mot)` — ⛔ un mot
 *  que le record ne connaît plus garde son texte, il ne disparaît pas. */
export function nomDUneVariante(data, mot) {
  const v = variantesDe(data).find((x) => x.mot === mot);
  const nom = v ? v.nom : `${String((data && data.name) || "").trim()} (${mot})`;
  return nom.length <= NOM_MAX ? nom : `${nom.slice(0, NOM_MAX - 1)}…`;
}

/* ══ LOT 281 — LE TEXTE D'UNE VARIANTE : l'introduction, puis SA part, rien d'autre ══
   🔴 Eric, 26/09 : *« ioun stone of intellect — tu ne fais pas la sélection de texte »* : la
   fiche d'une Ioun Stone (Intellect) récitait les treize pierres.
   ⭐ LA SÉLECTION SUIT LES MÊMES TROIS FORMES QUE `variantesDe` :
     · les PARAGRAPHES « Nom (Rareté). » — on garde celui de la variante ET ce qui le suit
       jusqu'au prochain (le bloc de stats de la Giant Fly appartient à l'Ebony Fly) ;
     · les TABLES dont la ligne finit par la rareté — on garde l'en-tête et SA ligne ;
     · les TABLES DE TIRAGE (« 1d100 … ») — idem : l'en-tête, son titre, SA ligne (le Horn y
       porte le nombre d'esprits et le prérequis de chaque métal).
   ⛔ Tout paragraphe qui n'appartient à AUCUNE variante (l'introduction, les règles communes)
   reste : la sélection retire, elle n'invente rien. Mot inconnu → le texte entier. */
const EST_UN_TIRAGE = /^\d+d\d+\b/i;                       /* « 1d100 Horn Type Spirits … » */
const EST_UNE_LIGNE_DE_TIRAGE = /^\d{1,3}\s*[–-]\s*\d{1,3}\s|^\d{1,3}\s/;
export function texteDUneVariante(data, mot) {
  const d = data || {};
  const texte = String(d.description || "");
  const variantes = variantesDe(d);
  const choisie = variantes.find((v) => v.mot === mot);
  if (!choisie) return texte;
  const autres = variantes.filter((v) => v !== choisie);
  const paras = paragraphesDe(texte);

  /* ⭐ LOT 354 — ⑤ LES SECTIONS NOMMÉES. L'en-tête et les propriétés communes restent ; le
     paragraphe des sections ne garde que CELLE de la variante ; et une table qui dit une ligne
     par variante (les sorts du Ring : « Air Chain Lightning (3 charges), … ») ne garde que SA
     ligne — la loi du lot 281, *l'en-tête et SA ligne*. ⛔ Seulement quand les variantes SONT
     ces sections : les formes ①–④ ne passent pas par ici. */
  const nommees = sectionsNommees(d, paras);
  if (nommees && nommees.sections.length === variantes.length
      && nommees.sections.every((s, k) => s.mot === variantes[k].mot)) {
    const sienne = nommees.sections.find((s) => s.mot === choisie.mot);
    const motsDesAutres = nommees.sections.filter((s) => s !== sienne).map((s) => s.mot);
    return paras.map((p, i) => (i === nommees.index ? sienne.texte : p))
      .filter((p) => !motsDesAutres.some((m) => p.startsWith(`${m} `)))
      .join("\n\n");
  }

  const mots = (v) => v.mot.split(/\s+or\s+/i).map((m) => m.toLowerCase());
  const parle = (p, v) => mots(v).some((m) => new RegExp(`(^|[\\s(])${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([\\s).,]|$)`, "i").test(p));

  /* ① les paragraphes « Nom (Rareté). » : à qui appartient chaque paragraphe ? */
  const tete = new RegExp(`^([A-Z][^.()\\n]{0,40}?)\\s*\\((Very Rare|Legendary|Uncommon|Common|Rare)\\)\\.\\s`);
  const proprietaire = [];
  let courant = null;
  paras.forEach((p, i) => {
    const m = tete.exec(p);
    const suivant = paras[i + 1] || "";
    if (m) courant = m[1].trim();
    /* une table (son titre, son en-tête) referme la section de la variante en cours */
    else if (EST_UN_TIRAGE.test(p) || EST_UN_TIRAGE.test(suivant)) courant = null;
    proprietaire.push(courant);
  });

  /* ② les lignes de table : la ligne d'une AUTRE variante tombe, l'en-tête reste */
  const rangee = new RegExp(`^([^\\d()]+?)\\s*(?:\\(([^)]+)\\))?\\s+\\d.*?\\s(Very Rare|Legendary|Uncommon|Common|Rare)$`, "i");
  const dansUnTirage = (i) => { for (let k = i - 1; k >= 0; k -= 1) { if (EST_UN_TIRAGE.test(paras[k])) return true; if (!EST_UNE_LIGNE_DE_TIRAGE.test(paras[k])) return false; } return false; };

  let deuxColonnes = false;
  return paras.filter((p, i) => {
    if (proprietaire[i] && proprietaire[i] !== choisie.mot) return false;
    if (rangee.test(p) && !EST_UN_TIRAGE.test(p)) {
      const autre = autres.some((v) => parle(p, v)) && !parle(p, choisie);
      if (autre) return false;
    }
    if (EST_UNE_LIGNE_DE_TIRAGE.test(p) && dansUnTirage(i)) return parle(p, choisie) || !autres.some((v) => parle(p, v));
    return true;
  }).map((p) => {
    /* ⭐ LOT 333 — UNE TABLE À DEUX COLONNES DE TIRAGE (« 1d10 Damage Type 1d10 Damage Type »,
       Potion of Resistance) : l'en-tête se dit une fois, et la ligne ne garde que la CASE de la
       variante — « 3 Fire », ⛔ pas « 3 Fire 8 Psychic ».
       ⛔ ET SEULEMENT QUAND L'EN-TÊTE ANNONCE DEUX DÉS : « 76–90 Bronze 4 Proficiency… » (Horn of
       Valhalla) est UNE case dont une colonne commence par un chiffre — la couper la mutilerait. */
    if (EST_UN_TIRAGE.test(p)) {
      const moitie = /^(.+?)\s+\1$/.exec(p);
      deuxColonnes = Boolean(moitie);
      return moitie ? moitie[1] : p;
    }
    if (!deuxColonnes || !EST_UNE_LIGNE_DE_TIRAGE.test(p)) { if (!EST_UNE_LIGNE_DE_TIRAGE.test(p)) deuxColonnes = false; return p; }
    const cases = p.split(COUPE_DE_COLONNE);
    return cases.find((c) => parle(c, choisie)) || p;
  }).join("\n\n");
}

/* ══ LOT 285 — LE PARCHEMIN DE SORT : UN PLAN, UN SORT ═══════════════════════════
   ⚖️ Eric, 2026-09-26, la dictée de X5 : *« choisir : classe de sort · choisir lvl ·
   4 étages de sorts token, un dropdown · send »*. Le `Spell Scroll` du SRD est un plan
   (`Rarity Varies`) : ce qu'on acquiert n'est pas encore l'objet, il faut choisir le SORT.

   ⭐ LA LIGNE POSÉE pointe sur le PLAN (`gear[N]` = `Spell Scroll`), et porte UN complément :
     · `gear[N].spell` — une RÉFÉRENCE au record du sort (`srd:spell:en:fireball`).
   ⛔ Ni niveau, ni rareté, ni prix écrits : le niveau se lit dans le sort, la rareté dans la
   table du plan, le prix dans le barème (`bareme-srfh.mjs`, « Scribing Spell Scrolls »).

   ⭐ LE PLAN SE RECONNAÎT À SA TABLE, jamais à son nom : sa description porte, niveau par
   niveau, « Spell Level · Rarity · Save DC · Attack Bonus » (📏 lu dans la couche SRD :
   « Cantrip Common 13 +5 » … « 9 Legendary 19 +11 », dix lignes, l'en-tête répété au
   milieu). ⛔ Moins de deux lignes lues = ce n'est pas un parchemin. */
const LIGNE_DE_PARCHEMIN = /^(Cantrip|\d)\s+(Very Rare|Legendary|Uncommon|Common|Rare)\s+(\d+)\s+\+(\d+)$/i;
const EN_TETE_DE_PARCHEMIN = /^Spell Level\s+Rarity\s+Save DC\s+Attack Bonus$/i;

/** La table du plan, lue dans sa description.
 *  @returns `{ niveau, rarete, dc, attaque }[]` — `niveau` 0 pour un cantrip ; vide si le
 *  record n'en porte pas. ⚖️ La RARETÉ vient d'ici et de nulle part ailleurs (le mandat du
 *  lot 285 : « la rareté se LIT dans le record »). */
export function raretesDuParchemin(data) {
  const vus = new Map();
  for (const p of paragraphesDe(data && data.description)) {
    const m = LIGNE_DE_PARCHEMIN.exec(p);
    if (!m) continue;
    const niveau = /cantrip/i.test(m[1]) ? 0 : Number(m[1]);
    if (!vus.has(niveau)) {
      vus.set(niveau, { niveau, rarete: PALIER_DU_MOT(m[2].toLowerCase()), dc: Number(m[3]), attaque: Number(m[4]) });
    }
  }
  return [...vus.values()].sort((a, b) => a.niveau - b.niveau);
}

/** Un record est-il un plan de parchemin ? — sa table le dit (⛔ aucun nom testé). */
export function estPlanParchemin(data) {
  return raretesDuParchemin(data).length >= 2;
}

/** Le nom de la ligne posée : « Spell Scroll (Fireball) ». ⛔ Sans sort, le nom du plan. */
export function nomDUnParchemin(nomPlan, nomSort) {
  const tete = String(nomPlan || "").trim();
  const sort = String(nomSort || "").trim();
  const nom = sort ? `${tete} (${sort})` : tete;
  return nom.length <= NOM_MAX ? nom : `${nom.slice(0, NOM_MAX - 1)}…`;
}

/** ⭐ LE TEXTE DU PLAN, POUR UN NIVEAU : l'introduction, l'en-tête de la table et SA ligne —
 *  la leçon du lot 281 (« tu ne fais pas la sélection de texte ») appliquée d'avance.
 *  ⛔ L'en-tête répété au milieu de la table (un saut de page du PDF) tombe ; les lignes des
 *  autres niveaux aussi. Niveau inconnu → le texte entier. */
export function texteDUnParchemin(data, niveau) {
  const texte = String((data && data.description) || "");
  const lignes = raretesDuParchemin(data);
  if (!lignes.some((l) => l.niveau === niveau)) return texte;
  let enTeteVu = false;
  return paragraphesDe(texte).filter((p) => {
    if (EN_TETE_DE_PARCHEMIN.test(p)) { const garde = !enTeteVu; enTeteVu = true; return garde; }
    const m = LIGNE_DE_PARCHEMIN.exec(p);
    if (!m) return true;
    return (/cantrip/i.test(m[1]) ? 0 : Number(m[1])) === niveau;
  }).join("\n\n");
}
