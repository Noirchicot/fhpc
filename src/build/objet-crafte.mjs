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
 *  (lot 277) une variante. */
export function estCrafte({ bonus = null, pouvoirs = [], variante = null } = {}) {
  return lireLeBonus(bonus) !== null || (pouvoirs || []).length > 0
    || (typeof variante === "string" && variante.trim() !== "");
}

/* ══ LOT 277 — LE BLUEPRINT À VARIANTE : UN SEUL CHOIX, LA VARIANTE ══════════════
   ⚖️ Eric, 2026-09-25 : *« T'as 127 wondrous en blueprint ? Sur lesquels il y a un
   choix à faire ? »* — non : le SRD en porte CINQ (`Belt of Giant Strength`,
   `Feather Token`, `Figurine of Wondrous Power`, `Horn of Valhalla`, `Ioun Stone`),
   plus les deux potions (*« inclue les potions »*) et la baguette (*« et la wand »*).
   Tous ont la même forme : un objet, une variante à choisir, et c'est la variante
   qui dit la rareté. Puis *« oui c'est ça »* au schéma : `Ioun Stone ▾` · `Variant ▾`.

   ⭐ LES VARIANTES SE LISENT DANS LE RECORD, jamais dans une liste de noms. Le SRD
   les écrit sous TROIS formes, et cette fonction les lit toutes :
     ① dans la RARETÉ, paire par paire — « Rare (Silver or Brass), Very Rare
       (Bronze), or Legendary (Iron) » · « Uncommon (+1), Rare (+2)… » ;
     ② en TABLE dans la description — « Belt of Giant Strength (hill) 21 Rare »,
       « Potion of Healing (greater) 4d4 + 4 Uncommon » : un nom, peut-être une
       parenthèse, une colonne qui commence par un chiffre, la rareté en fin ;
     ③ en PARAGRAPHES — « Awareness (Rare). While this dark-blue rhomboid… ».
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
  return [];
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

  return paras.filter((p, i) => {
    if (proprietaire[i] && proprietaire[i] !== choisie.mot) return false;
    if (rangee.test(p) && !EST_UN_TIRAGE.test(p)) {
      const autre = autres.some((v) => parle(p, v)) && !parle(p, choisie);
      if (autre) return false;
    }
    if (EST_UNE_LIGNE_DE_TIRAGE.test(p) && dansUnTirage(i)) return parle(p, choisie) || !autres.some((v) => parle(p, v));
    return true;
  }).join("\n\n");
}
