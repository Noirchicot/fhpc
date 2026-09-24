/* ══ LE MOTEUR DU CRAFT — ce qu'un assemblage COÛTE, et ce qu'il a le droit d'être ══
   ⛔ MODULE FEUILLE : aucun import, aucun DOM, aucune cote. Il ne sait pas sur quel
   écran il est lu, et c'est la condition pour que X5 et la fiche d'un objet posé
   posent la même question au même organe.

   ⚖️ CE QU'ERIC A TRANCHÉ LE 2026-09-24, et chaque règle porte sa phrase :
     · « il te faut effectivement les listes des pouvoirs associés pour le craft —
       différent pour une épée ou une masse »
     · « pour les coûts on ajoute le prix de base de l'arme et son crafting cost
       (pas d'ingrédients) »
     · « il sera coté dans la catégorie la plus proche […] tu le classes dans le
       palier INFÉRIEUR »  ·  « au moins le prix sera juste »
     · « en SRD tu ne parleras pas de PP, mais le calcul est le même »
     · « ok très bien alors PAS DE DEMI CRANS et basta »
     · « on peut crafter plusieurs items donc on garde la qté · pour les projectiles
       on a décidé 10 mais on ne paye qu'une fois le montant · je veux pas qu'une
       tuile puisse sortir du craft avec plus de 10 »

   📐 LE PLAN QUI L'ACCOMPAGNE : `FH-WEB/FHPC/Plan-ecran-X5/X5_gen.py` (vault). Il
   porte la dérivation complète, les mesures au navigateur et les quatre contrôles
   croisés contre le SRD. ⛔ Ce fichier-ci ne les recopie pas : il les applique. */

/* ══ ① L'ÉCHELLE — CINQ PALIERS, UNE DÉCADE CHACUN ═══════════════════════════
   🔴 ET C'EST LE SRD EXTRAPOLÉ, PAS UNE INVENTION. Le record `srd:item-value`
   donne 100 · 400 · 4 000 · 40 000 · 200 000, soit ×4 · ×10 · ×10 · **×5** — une
   progression régulière SAUF au dernier pas. Eric a régularisé ce ×5 en ×10 et
   prolongé d'un palier. ⭐ Là où Wizards est régulier, on retombe exactement sur
   ses nombres : Uncommon 400, Rare 4 000, Very Rare 40 000, au gold près.
   ⚠️ `Common` (40) n'est pas le `Common` du SRD (100) — il est sous son plancher,
   et aucun pouvoir n'y vit (mesuré : les 60 sont sur Uncommon et au-dessus). Il
   n'est là que comme UNITÉ de l'échelle, et c'est lui qui donne le `÷ 40`. */
export const UNITE = 40;
export const PALIERS = Object.freeze([
  { nom: "Common", valeur: 40, srd: false },
  { nom: "Uncommon", valeur: 400, srd: true },
  { nom: "Rare", valeur: 4000, srd: true },
  { nom: "Very Rare", valeur: 40000, srd: true },
  { nom: "Legendary", valeur: 400000, srd: true },
  { nom: "Epic", valeur: 4000000, srd: false },
]);
/** La plus haute valeur qu'un assemblage peut atteindre. Au-delà, il n'existe pas. */
export const LIMITE = PALIERS[PALIERS.length - 1].valeur;

/* ⚖️ LE TEMPS ET LE JET NE VIVENT QU'EN PILE FATE'S HAND — Eric : « colonne de
   gauche inutile en SRD car pas de crafting time · pour FH il y a un crafting
   time ». ⛔ En SRD ces deux colonnes sont ABSENTES, pas grisées ni à zéro.
   📖 Les valeurs sont celles de `Soulforge Crafting.md`, prises à ses paliers
   PLEINS — ⛔ ce fichier ne recalcule rien et n'arrondit rien. */
const TEMPS = ["hours", "1 day", "3 days", "1 week", "1 month", "2 months"];
const DC = [13, 16, 20, 24, 28, 32];

/* ══ ② LES RARETÉS DU SRD — pour classer, et pour lire un record ══════════════
   ⚠️ TOUJOURS COUPER À LA PARENTHÈSE : mesuré sur les 60 pouvoirs composables,
   **aucun** ne porte une rareté nue. Tous s'écrivent « Rare (Requires Attunement) »
   ou énumèrent (« Uncommon (+1), Rare (+2)… »). Lire `rarity` sans couper rend une
   chaîne qui ne correspond à aucun palier, et le prix tomberait silencieusement
   à zéro — ⛔ le genre d'absence qui ne lève aucune erreur. */
export function paliterDeRarete(rarete) {
  const t = String(rarete || "").split("(")[0].trim().toLowerCase();
  return PALIERS.find((p) => p.nom.toLowerCase() === t) || null;
}

/** ⚖️ « tu le classes dans le palier INFÉRIEUR » — Eric, 24/09, corrigeant ma
 *  « catégorie la plus proche » : la proximité aurait fait MONTER un résultat
 *  intermédiaire, le palier inférieur le laisse où il est.
 *  ⭐ Et seuls les paliers que le SRD connaît peuvent s'afficher : `Epic` n'a pas
 *  de nom chez Wizards, donc un assemblage à 4 M s'annonce `Legendary`.
 *  ⚠️ L'étiquette SATURE, et c'est assumé — « au moins le prix sera juste ». */
export function categorieAffichee(prix) {
  let vu = null;
  for (const p of PALIERS) if (p.srd && p.valeur <= prix) vu = p;
  return vu ? vu.nom : null;
}

/* ══ ③ LES POUVOIRS D'UNE BASE — ⛔ AUCUNE LISTE ÉCRITE À LA MAIN ═════════════
   🔴 J'AI D'ABORD DIT À ERIC QUE « LES POUVOIRS N'EXISTENT PAS », après avoir
   compté deux records. C'était faux : ils existent, dans un champ que je n'avais
   pas lu. `subtype` dit sur QUELLE BASE un objet magique se pose, et il est sur
   chaque record. ⛔ J'ai conclu d'un compte au lieu de mesurer.

   ⭐ LA RÈGLE EST MÉCANIQUE, et c'est ce qui la rend durable :
     `Any Melee Weapon`  → toute arme dont `weapon_range` vaut "melee"
     `Any Ranged Weapon` → idem "ranged"      ·  `Any Weapon` → toutes
     sinon → l'énumération se découpe sur les virgules ET les `or`, et le nom de
             la base doit s'y trouver EXACTEMENT
   ⛔ Un pouvoir ajouté demain entre tout seul. C'est ce qui manquait aux kits
   d'aventurier et aux 23 marchandises : un signal dans la donnée, pas une liste.

   📏 CE QUE ÇA REND, mesuré sur la pile : Longsword 10 · Mace 5 · Warhammer 4 ·
   Dagger 3 · dix armes à 2 · et HUIT armes à ZÉRO (Blowgun, Dart, les trois
   arbalètes, Musket, Pistol, Sling). ⭐ Eric, sur ces huit : « oui voilà » — la
   rangée des pouvoirs DISPARAÎT, ⛔ elle ne se grise pas. */
/* ⚠️ RECORDS, PAS DES VUES — et je l'ai appris en me trompant ici même, pour la
   troisième fois en deux jours. Une vue est `{ id, record: { data } }` ; un record
   est `{ data }`. Passer des vues fait rendre `undefined` à `it.data`, le filtre
   refuse TOUT, et `pouvoirsDe` rend une liste vide pour les 38 armes — ⛔ sans
   lever la moindre erreur. C'est la même faute qui a coûté la diagonale du
   blueprint (lot 256) et que `poseDeWares` isole depuis le lot 257.
   ⭐ CE MODULE EST DONC STRICT : il ne déballe rien, il n'accepte que des records,
   et c'est l'appelant qui choisit ce qu'il donne. Un organe qui accepte les deux
   formes accepte aussi la mauvaise. */
export function pouvoirsDe(recordBase, itemsMagiques) {
  const base = (recordBase && recordBase.data) || {};
  const nom = base.name;
  if (!nom) return [];
  return (itemsMagiques || []).filter((it) => {
    const d = (it && it.data) || {};
    const st = String(d.subtype || "").trim();
    if (!st) return false;
    const b = st.toLowerCase();
    if (b.startsWith("any")) {
      if (b.includes("ammunition")) return base.category === "ammunition";
      if (b.includes("melee")) return base.weapon_range === "melee";
      if (b.includes("ranged")) return base.weapon_range === "ranged";
      return b.includes("weapon") && Boolean(base.weapon_range);
    }
    /* ⛔ `split` sur la virgule ET sur `or` — le SRD écrit « Glaive, Greatsword,
       Longsword, or Scimitar », avec la virgule d'Oxford ET le `or`. */
    return st.split(/,|\bor\b/).map((x) => x.trim()).filter(Boolean).includes(nom);
  });
}

/* ══ ④ LA QUANTITÉ — ERIC A TOUT DIT, ET LE SRD LE CONFIRME ═══════════════════
   ⚖️ « je veux pas qu'une tuile puisse sortir du craft avec plus de 10 · donc on
   refait si on veut un autre lot de 10 flèches ». Le plafond porte sur la TUILE,
   donc sur tout ce qui sort d'un craft — ⛔ pas seulement sur les munitions.
   ⭐ ET LE LOT DE DIX PAYÉ UNE FOIS N'EST PAS UNE ADAPTATION : le SRD l'écrit
   lui-même sur `Ammunition, +1, +2, or +3` — *« Ten pieces of this ammunition are
   equivalent in value to a potion of the same rarity »*. Dix flèches valent UNE
   potion de même rareté ; la règle d'Eric est la règle de Wizards. */
export const PLAFOND_QTE = 10;
export const LOT_MUNITION = 10;
export function estMunition(recordBase) {
  const d = (recordBase && recordBase.data) || {};
  return d.category === "ammunition"
    || String(d.subtype || "").toLowerCase().includes("ammunition");
}

/* ══ ⑤ LA COTE D'UN ASSEMBLAGE ════════════════════════════════════════════════
   ⭐ LA RÈGLE, NUMÉRIQUE ET SANS UN MOT DE VOCABULAIRE FATE'S HAND :
        prix(A + B) = prix(A) × prix(B) ÷ 40
   où 40 est la valeur du plus petit échelon. ⛔ Elle est EXACTE, pas approchée —
   c'est l'abandon des demi-crans (Eric, 24/09) qui la rend exacte partout au lieu
   de ±8 %. Le bonus est un terme comme les autres : `+1` Uncommon, `+2` Rare,
   `+3` Very Rare.
   📏 QUATRE CONTRÔLES CROISÉS CONTRE LE SRD, aucun écart : `+1` seul rend 400,
   `+2` rend 4 000, `+3` rend 40 000 — exactement ce que le SRD annonce pour
   `Weapon, +1, +2, or +3` — et `+1 Armor (Plate)` rend 5 500, le nombre que le
   record `srd:item-value` écrit en toutes lettres dans son exemple. */
export function coteDe({ base, bonus, pouvoirs, qte = 1, fh = true } = {}) {
  const raretes = [bonus, ...(pouvoirs || [])].filter(Boolean);
  const paliers = raretes.map(paliterDeRarete);
  if (paliers.some((p) => !p)) return { legal: false, raison: "rarete-illisible" };
  if (!paliers.length) return { legal: false, raison: "sans-propriete" };

  /* le produit, ramené à l'unité de l'échelle autant de fois qu'il y a de termes */
  const magie = paliers.reduce((n, p) => n * p.valeur, 1) / UNITE ** (paliers.length - 1);
  if (magie > LIMITE) return { legal: false, raison: "au-dela-de-la-limite", magie };

  const rang = PALIERS.findIndex((p) => p.valeur === magie);
  const coutBase = prixEnPO((base && base.data && base.data.cost) || "");
  /* ⚖️ « on ajoute le prix de base de l'arme et son crafting cost (pas
     d'ingrédients) » — et crafter une base mondaine coûte la moitié de son prix,
     comme le craft d'un objet magique coûte la moitié de sa valeur. */
  const craft = magie / 2 + coutBase / 2;

  /* ⚖️ dix flèches valent une pièce — le lot est l'unité, payé une seule fois. */
  const lot = estMunition(base) ? LOT_MUNITION : 1;
  const n = Math.max(1, Math.min(PLAFOND_QTE, Math.floor(qte) || 1));
  const paiements = Math.ceil(n / lot);

  return {
    legal: true,
    magie,                                    /* la part magique, sans la base */
    coutBase,
    venteUnitaire: magie + coutBase,
    craftUnitaire: craft,
    qte: n, lot, paiements,
    craftTotal: craft * paiements,
    venteTotale: (magie + coutBase) * paiements,
    categorie: categorieAffichee(magie + coutBase),
    /* ⛔ ABSENTS en pile SRD, pas à zéro : le SRD ne porte aucun temps de craft. */
    temps: fh && rang >= 0 ? TEMPS[rang] : null,
    dc: fh && rang >= 0 ? DC[rang] : null,
  };
}

/** ⚖️ Ce qu'un second choix a encore le droit d'être, la limite étant ce qu'elle est.
 *  ⭐ CE N'EST PAS UNE RÈGLE ANTI-DOUBLON : c'est la limite de l'échelle. Prendre
 *  `Defender` (Legendary) en premier ne laisse que les pouvoirs Uncommon pour le
 *  second — tout le reste dépasse 4 M. Le dropdown n'a rien à expliquer, il montre
 *  ce qui reste. ⛔ Et un choix de BONUS réduit la liste de la même façon. */
export function encorePossibles(dejaPris, candidats) {
  const socle = dejaPris.map(paliterDeRarete).filter(Boolean);
  return (candidats || []).filter((c) => {
    const p = paliterDeRarete(c && c.data && c.data.rarity);
    if (!p) return false;
    const tous = [...socle, p];
    return tous.reduce((n, x) => n * x.valeur, 1) / UNITE ** (tous.length - 1) <= LIMITE;
  });
}

/** Un coût du SRD (« 10 GP », « 5 SP », « 2 CP ») en pièces d'or.
 *  ⛔ Une chaîne illisible rend 0, jamais NaN : un prix qui se propage en NaN
 *  empoisonne tout l'affichage en silence. */
export function prixEnPO(cout) {
  const m = /^\s*([\d,.]+)\s*(GP|SP|CP)\b/i.exec(String(cout || ""));
  if (!m) return 0;
  const n = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return 0;
  return n * { gp: 1, sp: 0.1, cp: 0.01 }[m[2].toLowerCase()];
}
