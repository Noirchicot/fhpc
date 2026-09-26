/* ══ LE MOTEUR DU CRAFT — ce qu'un assemblage COÛTE, et ce qu'il a le droit d'être ══
   ⛔ MODULE FEUILLE : aucun DOM, aucune cote — et un seul import, une autre feuille :
   la lecture des variantes du moteur (lot 277), pour que l'écran et `resolved.gear`
   lisent la même chose. Il ne sait pas sur quel
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
   ⚖️ PUIS LE 2026-09-26, qui REMPLACE l'échelle pour le craft ordinaire (lot 280) :
     · « prix SRD et FH idem · mon échelle uniquement pour le soulforging »
     · « on va implémenter dans le SRD la règle des demi paliers de FH »
     · « addition de pp comme dans soulforging, sauf qu'on ne parlera de pp que dans
       le soulforging » · « on peut atteindre legendary+ »
     · « on rajoute le prix de l'objet original […] on se rabat sur le prix palier le
       plus proche pour déterminer la rareté » · le temps suit cette rareté
     · « on peut crafter plusieurs items donc on garde la qté · pour les projectiles
       on a décidé 10 mais on ne paye qu'une fois le montant · je veux pas qu'une
       tuile puisse sortir du craft avec plus de 10 »

   📐 LE PLAN QUI L'ACCOMPAGNE : `FH-WEB/FHPC/Plan-ecran-X5/X5_gen.py` (vault). Il
   porte la dérivation complète, les mesures au navigateur et les quatre contrôles
   croisés contre le SRD. ⛔ Ce fichier-ci ne les recopie pas : il les applique. */

import { variantesDe } from "../../src/build/objet-crafte.mjs?v=835";
import { PALIERS_SRFH, joursArrondis, noteDeCraft } from "./bareme-srfh.mjs?v=835";
/* ⭐ LOT 285 — le plan de parchemin se reconnaît à sa table (`estPlanParchemin`, le moteur). */
import { estPlanParchemin } from "../../src/build/objet-crafte.mjs?v=835";

/* ══ ① LE BARÈME — SRFH, LU DANS `bareme-srfh.mjs` (lot 280) ═══════════════════════
   ⭐ Le craft d'un objet ordinaire suit la RÉFÉRENCE SRD + FH : les cinq paliers du SRD
   5.2.1 et les demi-paliers SRFH, chacun avec son RANG (Common 1, Uncommon 2, Uncommon+ 3,
   Rare 4 … Legendary 8, Legendary+ 9). ⛔ Aucun prix de rareté n'est écrit ici.
   🔴 CE QUE LES LOTS 258 → 279 FAISAIENT : l'échelle d'Eric (40 · 400 · … · 4 M), un
   PRODUIT ÷ 40 et une limite à Epic — la règle du SOULFORGING appliquée au craft ordinaire.
   Legendary y valait 400 000 au lieu de 200 000. */
export const RANG_MAX = Math.max(...PALIERS_SRFH.map((p) => p.rang || 0));   /* Legendary+ */

/* ⚖️ L'ÉCHELLE D'ERIC — RÉSERVÉE AU SOULFORGING (Eric, 25/09 : « mon échelle uniquement
   pour le soulforging »). Gardée écrite parce que c'est une loi tranchée (24/09 : « pas de
   demi crans et basta ») ; ⛔ AUCUN LECTEUR AUJOURD'HUI : le soulforging n'a pas d'écran. */
export const ECHELLE_SOULFORGING = Object.freeze([
  { nom: "Common", valeur: 40 }, { nom: "Uncommon", valeur: 400 }, { nom: "Rare", valeur: 4000 },
  { nom: "Very Rare", valeur: 40000 }, { nom: "Legendary", valeur: 400000 }, { nom: "Epic", valeur: 4000000 },
]);

/* ══ ② LES RARETÉS DU SRD — pour lire un record ═════════════════════════════════════
   ⚠️ TOUJOURS COUPER À LA PARENTHÈSE : mesuré sur les 60 pouvoirs composables,
   **aucun** ne porte une rareté nue. Tous s'écrivent « Rare (Requires Attunement) »
   ou énumèrent (« Uncommon (+1), Rare (+2)… »).
   🔴 UNE ÉNUMÉRATION N'EST PAS UN PALIER : couper à la première parenthèse rendait
   « Uncommon » pour « Uncommon (+1), Rare (+2), or Very Rare (+3) » (📏 mesuré le 24/09 :
   les 51 plans `…, +1, +2, or +3` arrivaient ainsi dans les pouvoirs).
   ⭐ On COMPTE donc les paliers nommés. Un seul → c'est lui. Plusieurs → `null`.
   ⚠️ `very rare` AVANT `rare`, `uncommon` AVANT `common` — sinon « Very Rare » compterait
   deux paliers. */
const NOMME_UN_PALIER = /very rare|legendary|uncommon|common|rare/gi;
/** @returns le palier SRFH (`{ nom, rang, jours, cout, valeur }`) de l'UNIQUE rareté SRD
 *  nommée, sinon `null`. */
export function paliterDeRarete(rarete) {
  const vus = new Set((String(rarete || "").match(NOMME_UN_PALIER) || []).map((m) => m.toLowerCase()));
  if (vus.size !== 1) return null;
  const [seul] = vus;
  return PALIERS_SRFH.find((p) => p.srd && p.nom.toLowerCase() === seul) || null;
}

/** ⚖️ « on se rabat sur le prix palier le plus proche pour déterminer la rareté » — Eric,
 *  26/09. ⭐ Tous les paliers SRFH sont candidats, demi-paliers compris (une Plate Armor
 *  + Mithral, 1 900, tombe sur Uncommon+ à 2 200 plutôt qu'Uncommon à 400).
 *  ⚠️ À égalité, le palier INFÉRIEUR — la règle du 24/09 (« tu le classes dans le palier
 *  inférieur ») garde la dernière voix. */
export function palierLePlusProche(valeur) {
  if (!Number.isFinite(valeur) || valeur <= 0) return null;
  let vu = null;
  for (const p of PALIERS_SRFH) {
    if (!vu || Math.abs(p.valeur - valeur) < Math.abs(vu.valeur - valeur)) vu = p;
  }
  return vu;
}
/** Le nom du palier le plus proche d'une valeur — ce que l'encart affiche. */
export function categorieAffichee(valeur) {
  const p = palierLePlusProche(valeur);
  return p ? p.nom : null;
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

   🔴 CE QUE CET EN-TÊTE AFFIRMAIT ÉTAIT FAUX, et je le laisse lisible barré plutôt
   que de l'effacer : « Longsword 10 · Mace 5 · Dagger 3 · dix armes à 2 · et HUIT
   armes à ZÉRO ». La règle ne comprenait alors qu'une forme « Any … » sur cinq
   (voir ③ bis). 📏 RECOMPTÉ LE 2026-09-24, cinq formes lues : Longsword 17 ·
   Scimitar 17 · Greatsword 16 · minimum 7 — et ⛔ AUCUNE des 51 bases du SRD
   n'est sans pouvoir. `Giant Slayer` et `Vicious Weapon` (`Any Simple or
   Martial`) se posent sur toutes les armes, arbalètes comprises.
   ⚖️ Eric avait tranché, sur la foi des « huit armes à zéro » : la rangée des
   pouvoirs DISPARAÎT quand la base n'en offre aucun, ⛔ elle ne se grise pas. La
   règle reste juste — mais elle n'a AUJOURD'HUI AUCUN CAS dans le SRD. Elle vit
   pour une base qu'une couche ajouterait demain. */
/* ⚠️ RECORDS, PAS DES VUES — et je l'ai appris en me trompant ici même, pour la
   troisième fois en deux jours. Une vue est `{ id, record: { data } }` ; un record
   est `{ data }`. Passer des vues fait rendre `undefined` à `it.data`, le filtre
   refuse TOUT, et `pouvoirsDe` rend une liste vide pour les 38 armes — ⛔ sans
   lever la moindre erreur. C'est la même faute qui a coûté la diagonale du
   blueprint (lot 256) et que `poseDeWares` isole depuis le lot 257.
   ⭐ CE MODULE EST DONC STRICT : il ne déballe rien, il n'accepte que des records,
   et c'est l'appelant qui choisit ce qu'il donne. Un organe qui accepte les deux
   formes accepte aussi la mauvaise. */
/** ⭐ LA LECTURE DU SUBTYPE, SEULE — partagée par les POUVOIRS d'une base et les
 *  BASES d'un plan. ⛔ Deux lecteurs du même champ, un seul écrivain de la règle. */
export function subtypeAccepte(subtype, base) {
  const st = String(subtype || "").trim();
  if (!st || !base || !base.name) return false;
  if (/^any\b/i.test(st)) return accepteUneFamille(st, base);
  /* ⛔ `split` sur la virgule ET sur `or` — le SRD écrit « Glaive, Greatsword,
     Longsword, or Scimitar », avec la virgule d'Oxford ET le `or`. */
  return st.split(/,|\bor\b/).map((x) => x.trim()).filter(Boolean).includes(base.name);
}

export function pouvoirsDe(recordBase, itemsMagiques) {
  const base = (recordBase && recordBase.data) || {};
  const nom = base.name;
  if (!nom) return [];
  return (itemsMagiques || []).filter((it) => {
    const d = (it && it.data) || {};
    const st = String(d.subtype || "").trim();
    if (!st) return false;
    /* 🔴 UN PLAN N'EST PAS UN POUVOIR — et la règle du lot 258 les rangeait
       parmi eux dès qu'elle a su lire `Any Light, Medium, or Heavy` : `Armor, +1,
       +2, or +3` arrivait dans `POWER 1`, alors que c'est exactement le rôle de
       `BONUS`. ⭐ Le critère est la RARETÉ : un pouvoir a UN palier lisible, donc
       un prix ; un plan en énumère plusieurs (ou dit « Varies »), et
       `paliterDeRarete` rend `null`. ⛔ Aucune liste de noms, et aucun import :
       ce module reste une feuille. */
    if (!paliterDeRarete(d.rarity)) return false;
    return subtypeAccepte(st, base);
  });
}

/* ══ ③ ter — CE QU'UN PLAN OFFRE, LU DANS LE PLAN ══════════════════════════════
   ⚖️ Eric, 2026-09-24 : *« impossible pour moi d'arriver au blueprint, tu vois bien
   que craft n'est pas sélectionnable »*. Pour ouvrir X5 depuis un plan, il faut
   savoir ce que ce plan offre — et ⛔ aucune de ces deux listes ne s'écrit à la main.

   ⭐ LES BASES : celles que le `subtype` du plan accepte — la MÊME lecture que les
   pouvoirs, dans l'autre sens. `Weapon, +1, +2, or +3` est `[Any Simple or
   Martial]` → les 38 armes. `Shield, +1, +2, or +3` est `[Shield]` → le bouclier.

   🔴 LES BONUS : lus dans la RARETÉ du plan, paire par paire — et c'est ce qui a
   évité un bug avant qu'il n'atteigne l'écran. X5 portait en dur `Uncommon → +1,
   Rare → +2, Very Rare → +3`. Or le SRD écrit :
     `Weapon, +1, +2, or +3` → « Uncommon (+1), Rare (+2), or Very Rare (+3) »
     `Armor, +1, +2, or +3`  → « Rare (+1), Very Rare (+2), or Legendary (+3) »
   ⛔ UN +1 D'ARMURE EST RARE. La table en dur l'aurait affiché « +2 » et coté à
   400 GP au lieu de 4 000. Lire le plan, c'est lire ce que Wizards a écrit. */
export function basesDe(plan, bases) {
  const st = plan && plan.data && plan.data.subtype;
  return (bases || []).filter((b) => subtypeAccepte(st, b && b.data));
}

const UN_BONUS = /(very rare|legendary|uncommon|common|rare)\s*\((\+\d)\)/gi;
/** @returns {{ rarete: string, mot: string }[]} — dans l'ordre du SRD. */
export function bonusDe(plan) {
  const r = String((plan && plan.data && plan.data.rarity) || "");
  return [...r.matchAll(UN_BONUS)].map((m) => ({
    rarete: (PALIERS_SRFH.find((p) => p.srd && p.nom.toLowerCase() === m[1].toLowerCase()) || {}).nom,
    mot: m[2],
  })).filter((b) => b.rarete);
}

/** ⭐ LOT 266 — LA VALEUR D'UN OBJET CRAFTÉ, pour sa fiche : le prix d'achat que X5
 *  affiche en `Buying` (base + part magique), au format que `parseCout` relit.
 *  🔴 Eric, 25/09, devant la fiche X1 d'une Breastplate +1 : le texte disait la base.
 *  Le prix aussi — celui de la Breastplate nue. ⛔ Un bonus dont le plan est absent
 *  ne se cote pas (le mot « +1 » ne dit pas sa rareté : +1 Armor est Rare, +1 Weapon
 *  Uncommon) : `null`, jamais un prix plausible. */
export function valeurDUnObjetCrafte(recette = {}) {
  const cote = coteDUnObjetCrafte(recette);
  return cote && cote.legal ? `${cote.venteUnitaire.toLocaleString("en-US")} GP` : null;
}
/** ⭐ LOT 280 — la COTE entière d'un objet crafté posé (valeur, rareté affichée, temps) :
 *  la fiche X1 d'une ligne craftée en tire son prix, sa rareté et sa note de craft.
 *  ⛔ `null` quand le bonus n'a pas son plan — le mot « +1 » ne dit pas sa rareté. */
export function coteDUnObjetCrafte({ base, plan = null, bonus = null, pouvoirs = [] } = {}) {
  const palier = bonus ? (bonusDe(plan).find((b) => b.mot === bonus) || {}).rarete : null;
  if (bonus && !palier) return null;
  return coteDe({ base, bonus: palier, pouvoirs: (pouvoirs || []).map((p) => p && p.data && p.data.rarity) });
}

/* ══ ③ quater — PAR OÙ X5 S'OUVRE : UNE SEULE SOURCE ══════════════════════════
   Deux sortes de plans ouvrent X5, et c'est cette fonction qui les distingue :
     · un plan À BONUS (`Weapon, +1, +2, or +3`) — il porte ses bases et ses bonus ;
       X5 s'ouvre sur lui, rien de choisi ;
     · ⭐ un POUVOIR À BASE MULTIPLE (`Flame Tongue [Any Melee Weapon]`, lot 263) —
       il n'a pas de bonus à lui. X5 s'ouvre sur le plan à bonus de SA famille, avec
       ce pouvoir déjà posé en `POWER 1` et la première base qu'il accepte.
       ⛔ Le plan de la famille n'est pas nommé : c'est celui, parmi les plans à
       bonus de la même catégorie, qui accepte cette base.
   ⛔ Sans cette seconde porte, les 28 pouvoirs devenus plans au lot 263 auraient
   porté la diagonale sans pouvoir s'ouvrir — le bug même qu'Eric a montré le 24/09
   sur `Weapon, +1…` (« impossible pour moi d'arriver au blueprint »).
   @returns `{ plan, choix }` ou `null` si X5 ne sait pas composer cet objet. */
export function ouvertureX5(record, items, bases) {
  if (!record || !record.data) return null;
  /* ⭐ LOT 277 — UN PLAN À VARIANTE (`Ioun Stone`, les potions, la wand) ouvre X5 sur
     lui-même, rien de choisi : sa variante se lit dans son record (`variantesDe`). */
  if (estPlanAVariante(record)) return { plan: record, choix: {} };
  /* ⭐ LOT 285 — LE PARCHEMIN DE SORT (`Spell Scroll`) ouvre X5 sur lui-même, rien de choisi :
     sa table (niveau → rareté) se lit dans son record. ⚖️ Eric, 26/09 : « choisir : classe de
     sort · choisir lvl · 4 étages de sorts token, un dropdown · send ». */
  if (estPlanParchemin(record.data)) return { plan: record, choix: {} };
  if (basesDe(record, bases).length && bonusDe(record).length) return { plan: record, choix: {} };
  if (!paliterDeRarete(record.data.rarity)) return null;
  const siennes = basesDe(record, bases);
  /* ⛔ une seule base NOMMÉE (`Sun Blade [Longsword]`) : rien à choisir, c'est un objet fini.
     ⭐ LOT 288 — MAIS UN POUVOIR DE FAMILLE (`Any …`) RESTE UNE COMPOSITION, même quand la
     pile ne lui offre qu'une base : ⚖️ Eric, 26/09, « pile SRD sans munitions nominatives,
     mais munitions magiques si » — en pile SRD, `Ammunition of Slaying [Any Ammunition]` n'a
     que la munition générique, et il s'ouvre quand même. 📏 Mesuré le 26/09 : dans les deux
     piles, Slaying est le SEUL pouvoir « Any … » à moins de deux bases. */
  const famille = /^any\b/i.test(String(record.data.subtype || "").trim());
  if (!siennes.length || (siennes.length < 2 && !famille)) return null;
  const base = siennes[0];
  const planDeFamille = (items || []).find((i) => i && i.data
    && i.data.category === record.data.category
    && bonusDe(i).length && subtypeAccepte(i.data.subtype, base.data));
  if (!planDeFamille) return null;
  return { plan: planDeFamille, choix: { base: base.data.name, pouvoirs: [record.data.name] } };
}

/* ══ ③ quinquies — LE PLAN À VARIANTE (lot 277) ══════════════════════════════════
   ⚖️ Eric, 25/09 : *« T'as 127 wondrous en blueprint ? Sur lesquels il y a un choix à
   faire ? »* — cinq, plus les deux potions et la wand. Un objet, UNE variante, et
   c'est la variante qui dit la rareté.
   ⭐ LA VALEUR N'EST PAS CELLE DE L'ÉCHELLE DU CRAFT : une variante n'est pas un
   ASSEMBLAGE, c'est un objet FINI du SRD (`Ioun Stone (Awareness)` est Rare). Elle vaut
   donc ce que Wares affiche pour un objet fini — `srd:item-value`, la potion à moitié
   (`fabriqueDeValeur`, le seul écrivain de cette règle) — et la fabriquer coûte la
   MOITIÉ de sa valeur, comme tout craft ici. ⛔ Cette fonction ne recalcule pas la
   valeur : l'appelant la lit par `recordDUneVariante`, et la lui donne. */
export function estPlanAVariante(record) {
  return variantesDe(record && record.data).length >= 2;
}

/** L'objet fini d'une variante, en RECORD — ce que `fabriqueDeValeur` sait coter. */
export function recordDUneVariante(plan, mot) {
  const d = (plan && plan.data) || {};
  const v = variantesDe(d).find((x) => x.mot === mot);
  if (!v) return null;
  return { name: v.nom, data: { name: v.nom, rarity: v.rarete, category: d.category } };
}

/** La cote d'une variante — la MÊME forme que `coteDe`, pour que l'encart, `Send` et la
 *  bourse la lisent sans savoir d'où elle vient. `valeur` : la valeur de l'objet fini, en
 *  pièces d'or. ⛔ Une valeur illisible n'est pas un zéro : l'objet ne se crafte pas. */
export function coteDUneVariante({ variante, valeur, qte = 1 } = {}) {
  if (!variante || !Number.isFinite(valeur) || valeur <= 0) return { legal: false, raison: "rarete-illisible" };
  /* ⭐ LOT 280 — le temps est celui de la NOTE DE CRAFT de l'objet fini (`noteDeCraft`, le
     seul écrivain) : le barème SRFH, ÷ 2 pour un consommable, et le brassage de la potion de
     soin de base (1 jour). 🔴 Calculé ici à part, il aurait dit 3 jours pour la potion
     « Standard » pendant que sa fiche en disait 1. */
  const note = noteDeCraft({ rarete: variante.rarete, consommable: /potion/i.test(String(variante.nom || "")),
    nom: variante.nom });
  const n = Math.max(1, Math.min(PLAFOND_QTE, Math.floor(qte) || 1));
  return {
    legal: true,
    magie: valeur, coutBase: 0,
    venteUnitaire: valeur, craftUnitaire: valeur / 2,
    qte: n, lot: 1, paiements: n,
    craftTotal: (valeur / 2) * n, venteTotale: valeur * n,
    /* ⭐ LA RARETÉ EST CELLE DE LA VARIANTE, lue — ⛔ pas déduite du prix : une potion Rare
       vaut 2 000 et `categorieAffichee` l'aurait dite Uncommon. */
    categorie: variante.rarete, rarete: variante.rarete,
    temps: note ? texteDesJours(note.jours) : null,
  };
}

/** « 50 days », « 1 day » — la durée telle que l'encart et la note l'écrivent. */
export function texteDesJours(n) {
  return Number.isFinite(n) ? `${n} ${n === 1 ? "day" : "days"}` : null;
}

/** ⭐ Un objet se crafte dans X5 si `ouvertureX5` sait l'ouvrir — ⛔ pas de liste :
 *  `Spell Scroll` l'ouvre depuis le lot 285, par sa table — aucun nom n'a été écrit pour ça.
 *  ⭐ LOT 283 — `Ammunition, +1…` et `Ammunition of Slaying` l'ouvrent dès que la pile porte
 *  des bases de munition (`estBaseDeMunition`).
 *  🔄 LOT 288 — DANS LES DEUX PILES : en SRD seule, la base est la munition GÉNÉRIQUE
 *  (`estMunitionGenerique`) — ⚖️ Eric, 26/09 : « munitions magiques si ». */
export function seCrafteDansX5(record, bases, items = []) {
  return Boolean(ouvertureX5(record, items, bases));
}

/* ══ ③ sexies — L'OBJET FINI QUI A SON PLAN : LA POTION DE SOIN (lot 286) ═════════════
   ⚖️ Eric, 26/09 : « les potions de soin » — la Potion of Healing de l'Adventuring Gear
   (un record `gear`, 50 GP) se fabrique dans X5 comme ses trois grandes sœurs.
   ⭐ LE LIEN SE LIT DANS LA DONNÉE : l'objet fini est la variante d'un plan dont le NOM
   (`variantesDe(…).nom`) est exactement le sien — la table du SRD écrit « Potion of
   Healing 2d4 + 2 Common », et c'est la variante « Standard ». ⛔ Aucun id écrit ici.
   ⚠️ CE N'EST PAS UNE OUVERTURE DE PLAN (`ouvertureX5`) : un plan mène droit à X5 (lot 267),
   un objet fini s'ACHÈTE d'abord — sa tuile ouvre X2, qui garde Buy, et c'est `Craft` qui
   mène à son plan. Mis dans `ouvertureX5`, le tap sur la tuile aurait sauté l'achat.
   @returns `{ plan, choix: { variante } }` ou `null`. */
export function planDUnObjetFini(record, plansAVariante = []) {
  const nom = String((record && record.data && record.data.name) || "").trim();
  if (!nom || estPlanAVariante(record)) return null;       /* ⛔ un plan n'est pas un objet fini */
  for (const plan of plansAVariante || []) {
    const v = variantesDe(plan && plan.data).find((x) => x.nom === nom);
    if (v) return { plan, choix: { variante: v.mot } };
  }
  return null;
}

/** ⭐ LA PORTE DU MENU `Craft` DE X2 — un plan que X5 sait composer, OU l'objet fini d'une
 *  variante. ⛔ Un seul écrivain pour les deux gestes de X2 (actif ? ouvrir ?) : sinon
 *  `Craft` s'allumerait sur une tuile qu'il ne sait pas ouvrir. */
export function ouvertureDepuisX2(record, items, bases, plansAVariante = []) {
  return ouvertureX5(record, items, bases) || planDUnObjetFini(record, plansAVariante);
}

/* ══ ③ bis — « ANY … » : LA FAMILLE D'UNE BASE, LUE DANS SES PROPRES CHAMPS ════
   🔴 LE LOT 258 NE COMPRENAIT QU'UNE FORME SUR CINQ, et je l'ai affirmé juste.
   Sa règle testait `melee`, `ranged` et `weapon` — or le SRD écrit aussi :
     `Any Simple or Martial`              → Dragon Slayer, Giant Slayer, Holy Avenger,
                                            Nine Lives Stealer, Vicious Weapon, Weapon
                                            of Warning, et le plan `Weapon, +1, +2, or +3`
     `Any Light, Medium, or Heavy`        → Armor of Resistance, Armor of Vulnerability,
                                            Demon Armor, et le plan `Armor, +1, +2, or +3`
     `Any Medium or Heavy, Except Hide Armor` → Adamantine Armor, Mithral Armor
   📏 Mesuré le 2026-09-24 : ces trois formes trouvaient ZÉRO base. Six pouvoirs
   n'étaient proposés sur aucune arme, et les chiffres du lot 258 (« Longsword 10,
   Dagger 3, huit armes à zéro ») étaient FAUX, écrits dans son en-tête, dans le
   plan au vault et dans le message de commit.
   ⛔ ET SES GARDES NE POUVAIENT PAS LE VOIR : ils interrogeaient Dagger, Mace,
   Longsword et le bord « or Scimitar » — jamais une forme « Any … » autre que
   `Any Melee Weapon`. Un garde qui n'interroge qu'une forme d'écriture tient
   cette forme-là, et rien d'autre.

   ⭐ LA RÈGLE, MÉCANIQUE : chaque mot du subtype nomme une valeur d'un champ que
   la BASE porte déjà — ⛔ aucune liste de noms d'armes ou d'armures.
     simple · martial        → `weapon_category`
     melee · ranged          → `weapon_range`
     light · medium · heavy  → `armor_category`   (⛔ `shield` n'y est jamais : un
                                                    bouclier n'est pas une armure)
     « Except X »            → X est retiré par son NOM, tel que le SRD l'écrit
   Les mots d'une même famille s'unissent (`Simple or Martial` = l'une OU l'autre).

   🗄️ `Any Ammunition` EST RESTÉ À ZÉRO JUSQU'AU LOT 283, et c'était déclaré : les
   munitions de base étaient des `gear` sans marqueur, et `Case, Crossbow Bolt` — un
   ÉTUI — tombait dans un filtre naïf sur « Bolt ».
   ⭐ LOT 283 — LE MARQUEUR EXISTE, ET IL EST DANS LA DONNÉE : `pack`, posé par la couche
   `fh-munitions-en` sur les cinq munitions typées (Eric, 23/09 : « tu achètes un item avec
   un ×10 marqué dessus »). `ammunition` → une base qui porte `pack` ET un prix lisible
   (`estDonneeDeMunition`). ⛔ Aucun nom : l'étui n'a pas de `pack`, le carquois non plus.
   📏 Mesuré le 26/09, pile FH : 5 bases (Arrows · Crossbow Bolts · Firearm Bullets ·
   Sling Bullets · Blowgun Needles) ; le garde croise leurs noms avec les munitions que
   NOMMENT les armes à distance, dans les deux sens.
   🔄 EN PILE SRD SEULE — CE QUE LE LOT 283 FERMAIT, LE LOT 288 L'OUVRE. Le 283 disait :
   « zéro base, et c'est voulu : `Ammunition, +1…` reste hors de X5 dans cette pile ».
   ⚖️ Eric, 26/09 : « pile SRD sans munitions nominatives, mais munitions magiques si ».
   ⭐ LA LECTURE : le SRD n'a qu'UNE munition, la générique — `Ammunition`, au prix
   « Varies ». Elle ne porte le nom d'aucun projectile (⛔ on n'invente ni flèche ni carreau),
   elle porte le NOM MÊME DE LA FAMILLE que `Any Ammunition` désigne. C'est elle, la base :
   `estMunitionGenerique`. Son prix de lot vaut ZÉRO (`prixDUnLot`) — ⛔ pas un prix inventé :
   le SRD n'en donne pas, et la munition magique vaut alors sa seule colonne consommable.
   📏 Ammunition +1 en pile SRD : 400 / 2 + 0 = 200 GP · craft 100 GP · Uncommon · 5 jours. */
const FAMILLES = [
  { champ: "weapon_category", mots: ["simple", "martial"] },
  { champ: "weapon_range", mots: ["melee", "ranged"] },
  { champ: "armor_category", mots: ["light", "medium", "heavy"] },
];
export function accepteUneFamille(subtype, base) {
  let corps = String(subtype || "").replace(/^any\s+/i, "");
  const sauf = /,?\s*except\s+(.+)$/i.exec(corps);
  if (sauf) {
    const exclus = sauf[1].split(/,|\bor\b|\band\b/).map((x) => x.trim()).filter(Boolean);
    if (exclus.includes(base.name)) return false;
    corps = corps.slice(0, sauf.index);
  }
  const mots = corps.toLowerCase().split(/[\s,]+|\bor\b/).map((x) => x.trim()).filter(Boolean);
  if (mots.includes(MOT_DE_LA_FAMILLE_MUNITION)) return estDonneeDeMunition(base);   /* ⭐ lots 283 · 288, voir l'en-tête */
  for (const { champ, mots: valeurs } of FAMILLES) {
    const voulus = mots.filter((m) => valeurs.includes(m));
    if (voulus.length) return voulus.includes(base[champ]);
  }
  /* « Any Weapon » tout court : toute arme — mais jamais une armure. */
  if (mots.includes("weapon")) return Boolean(base.weapon_range);
  return false;
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

/** ⭐ LOT 283 — UNE BASE DE MUNITION, LUE DANS SES PROPRES CHAMPS (des `data`) : la marque
 *  de son paquet (`pack`, un entier ≥ 1) ET un prix lisible. ⛔ Un prix « Varies » n'est pas
 *  un zéro : sans lui, dix pièces n'ont pas de prix, et une munition TYPÉE n'est pas une base.
 *  ⭐ LOT 288 — OU LA MUNITION GÉNÉRIQUE du SRD (`estMunitionGenerique`), la seule exception,
 *  et elle est nommée par la donnée : elle ne PRÉTEND pas avoir un prix. */
export function estDonneeDeMunition(d) {
  if (estMunitionGenerique(d)) return true;
  return Boolean(d) && Number.isInteger(d.pack) && d.pack >= 1 && prixEnPO(d.cost) > 0;
}
/** Le mot de la famille, tel que le SRD l'écrit dans `Any Ammunition`. */
const MOT_DE_LA_FAMILLE_MUNITION = "ammunition";
/** ⭐ LOT 288 — LA MUNITION GÉNÉRIQUE : le record qui porte le NOM MÊME de la famille
 *  (`Ammunition`), sans paquet. ⚖️ Eric, 26/09 : « pile SRD sans munitions nominatives, mais
 *  munitions magiques si ». ⛔ CE N'EST PAS UNE LISTE DE NOMS : c'est la lecture de
 *  `subtypeAccepte` (une base se reconnaît à son nom EXACT dans le subtype), appliquée au seul
 *  mot que `Any Ammunition` porte. En pile FH, `fh-munitions-en` la réécrit en `Arrows` (un
 *  paquet) : 📏 mesuré le 26/09, AUCUN `gear` nommé `Ammunition` n'y reste — pas de double.
 *  ⚠️ `srd:weapon-property:en:ammunition` porte le même nom : ce n'est jamais une base (les
 *  bases sont des `weapon`, `armor` et `gear`). */
export function estMunitionGenerique(d) {
  return Boolean(d) && !Number.isInteger(d.pack)
    && String(d.name || "").trim().toLowerCase() === MOT_DE_LA_FAMILLE_MUNITION;
}
/** La même question, posée à un RECORD — ce que l'étape donne à `basesDuCraft`. */
export function estBaseDeMunition(record) {
  return estDonneeDeMunition(record && record.data);
}
export function estMunition(recordBase) {
  const d = (recordBase && recordBase.data) || {};
  return d.category === "ammunition" || estDonneeDeMunition(d)
    || String(d.subtype || "").toLowerCase().includes("ammunition");
}

/** ⚖️ LE PRIX DE LA BASE D'UN LOT — « on ajoute le prix de la base » (Eric, 26/09), et la
 *  base d'un lot, ce sont DIX projectiles. ⭐ Le record dit pour combien de pièces il est
 *  coté (`pack`) : `5 SP` le paquet de dix → 5 SP. Sans `pack`, le prix est à la pièce. */
export function prixDUnLot(recordBase) {
  const d = (recordBase && recordBase.data) || {};
  /* ⭐ LOT 288 — LA MUNITION GÉNÉRIQUE N'A PAS DE PRIX (« Varies ») : son lot vaut ZÉRO, dit
     ici en toutes lettres — ⛔ pas par le zéro de repli de `prixEnPO`, qui sert l'illisible. */
  if (estMunitionGenerique(d)) return 0;
  const paquet = Number.isInteger(d.pack) && d.pack >= 1 ? d.pack : 1;
  return prixEnPO(d.cost || "") * LOT_MUNITION / paquet;
}

/** ⚖️ COMBIEN DE LOTS FONT `qte` pièces de cette base — « on ne paye qu'une fois le
 *  montant » (Eric, 24/09) : une munition se compte PAR LOT DE DIX, tout le reste à la pièce.
 *  ⚖️ LOT 288 — ET LE LOT EST AUSSI CE QU'ON PORTE : « poids par lot » (Eric, 26/09), en réponse
 *  à « 10 flèches craftées pèsent 15 lb […] `pack` est-il une marque ou une quantité ? ». Le
 *  poids du catalogue est celui d'un paquet ; le sac pèse des lots, pas des pièces.
 *  ⭐ UN SEUL ÉCRIVAIN pour les trois lecteurs : la cote de X5, la fiche X1 d'une ligne (prix et
 *  poids totaux) et l'encombrement (`poidsParLieu`). La quantité d'une ligne compte des PIÈCES
 *  — craftées (10), de départ (« 20 Arrows »), achetées (`piecesDUnAchat`).
 *  ⛔ Pas de plafond ici : il porte sur ce qui SORT du craft (`coteDe`), pas sur une ligne. */
export function paiementsDe(recordBase, qte) {
  const n = Math.max(1, Math.floor(qte) || 1);
  return Math.ceil(n / (estMunition(recordBase) ? LOT_MUNITION : 1));
}

/** ⭐ LOT 288 — CE QU'UN ACHAT POSE, EN PIÈCES. ⚖️ « tu achètes un item avec un ×10 marqué
 *  dessus » (Eric, 23/09) : UN JETON = UN PAQUET. Wares compte des jetons ; la ligne posée compte
 *  des pièces, comme la ligne craftée et celle du départ — sinon `paiementsDe` lirait trois
 *  paquets achetés comme trois flèches, donc UN lot.
 *  ⛔ Seule une base de munition typée multiplie (`pack` ET un prix) : un plan qui porte `pack`
 *  (`Ammunition, +1…` en pile FH) reste un plan, la munition générique n'a pas de paquet. */
export function piecesDUnAchat(record, jetons) {
  const n = Math.max(1, Math.floor(jetons) || 1);
  const d = (record && record.data) || {};
  return estBaseDeMunition(record) && Number.isInteger(d.pack) && d.pack >= 1 ? n * d.pack : n;
}

/* ══ ⑤ LA COTE D'UN ASSEMBLAGE — LE BARÈME SRFH (lot 280) ════════════════════════
   ⚖️ Eric, 26/09 :
     1. les RANGS des propriétés S'ADDITIONNENT (« addition de pp comme dans soulforging »)
        — un +1 d'arme (Uncommon, 2) et une Flame Tongue (Rare, 4) font 6, Very Rare ;
     2. la valeur est celle du palier de ce rang ;
     3. « on rajoute le prix de l'objet original » — la base ;
     4. « on se rabat sur le prix palier le plus proche pour déterminer la rareté » ;
     5. le temps est celui de cette rareté (« c'est long de fabriquer une plate ») ;
     6. « on peut atteindre legendary+ » — rang 9, et RIEN au-delà.
   ⭐ Le coût de craft reste la moitié de la valeur, base comprise (la base se fabrique
   pour la moitié de son prix — SRD, « Crafting Nonmagical Items »).
   ⭐ LE MÊME PRIX ET LE MÊME TEMPS EN PILE SRD ET EN PILE FH (« prix SRD et FH idem » ; le
   SRD porte lui-même ses temps, p. 206). 🔴 Le 24/09 disait « pas de crafting time en
   SRD » : c'était faux, le SRD en a un. ⛔ Plus de jet ni de DC (« pas de jets pour
   produire les regular magic items »). */
export function coteDe({ base, bonus, pouvoirs, qte = 1 } = {}) {
  const raretes = [bonus, ...(pouvoirs || [])].filter(Boolean);
  const paliers = raretes.map(paliterDeRarete);
  if (paliers.some((p) => !p)) return { legal: false, raison: "rarete-illisible" };
  if (!paliers.length) return { legal: false, raison: "sans-propriete" };

  const rang = paliers.reduce((n, p) => n + p.rang, 0);
  if (rang > RANG_MAX) return { legal: false, raison: "au-dela-de-la-limite", rang };
  const palier = PALIERS_SRFH.find((p) => p.rang === rang);
  /* ⚖️ LOT 283 — UN LOT DE DIX PROJECTILES EST UN CONSOMMABLE. Le SRD, sur `Ammunition, +1,
     +2, or +3` : « Ten pieces of this ammunition are equivalent in value to a potion of the
     same rarity » — et une potion vaut la MOITIÉ de son palier (colonne consommable du
     barème, la règle de `fabriqueDeValeur`). La base est le prix de DIX pièces
     (`prixDUnLot`), et le temps est celui d'un consommable (`noteDeCraft`, ÷ 2).
     📏 Arrows +1 : 400 / 2 + 5 SP = 200,5 GP · craft 100 GP · Uncommon · 5 jours. */
  const consommable = estMunition(base);
  const magie = consommable ? palier.valeur / 2 : palier.valeur;
  const coutBase = consommable ? prixDUnLot(base) : prixEnPO((base && base.data && base.data.cost) || "");
  const vente = magie + coutBase;
  /* ⚖️ la rareté affichée — et avec elle le temps — se rabat sur le palier le plus proche.
     ⭐ Un consommable se compare à la colonne consommable (la moitié) : 200,5 est un Uncommon
     de munition, ⛔ pas un Common+ (250) d'objet durable. */
  const affiche = palierLePlusProche(consommable ? vente * 2 : vente);
  const jours = noteDeCraft({ rarete: affiche.nom, consommable }).jours;
  const craft = vente / 2;

  /* ⚖️ dix flèches valent une pièce — le lot est l'unité, payé une seule fois. */
  const lot = consommable ? LOT_MUNITION : 1;
  const n = Math.max(1, Math.min(PLAFOND_QTE, Math.floor(qte) || 1));
  const paiements = paiementsDe(base, n);

  return {
    legal: true,
    rang,
    magie,                                    /* la part magique, sans la base */
    coutBase,
    venteUnitaire: vente,
    craftUnitaire: craft,
    qte: n, lot, paiements,
    craftTotal: craft * paiements,
    venteTotale: vente * paiements,
    categorie: affiche.nom,
    jours,
    temps: texteDesJours(jours),
  };
}

/** ⚖️ Ce qu'un second choix a encore le droit d'être : la somme des rangs ne dépasse pas
 *  Legendary+ (rang 9). ⭐ CE N'EST PAS UNE RÈGLE ANTI-DOUBLON : prendre un pouvoir Rare
 *  (4) après un +1 d'arme (2) ne laisse que ce qui tient en 3 — un Uncommon, pas un Rare.
 *  Le dropdown n'a rien à expliquer, il montre ce qui reste. */
export function encorePossibles(dejaPris, candidats) {
  const socle = dejaPris.map(paliterDeRarete).filter(Boolean).reduce((n, p) => n + p.rang, 0);
  return (candidats || []).filter((c) => {
    const p = paliterDeRarete(c && c.data && c.data.rarity);
    return Boolean(p) && socle + p.rang <= RANG_MAX;
  });
}

/** Un coût du SRD (« 10 GP », « 5 SP », « 2 CP ») en pièces d'or.
 *  ⛔ Une chaîne illisible rend 0, jamais NaN : un prix qui se propage en NaN
 *  empoisonne tout l'affichage en silence. */
/** ⭐ LOT 265 — CE QUE LA BOURSE PAIE, et c'est EXACTEMENT ce que l'écran affiche.
 *  ⚖️ Eric, 25/09 : « `Send` retire le prix total de la bourse ». L'écran arrondit
 *  à la pièce d'or au-dessus de 1 GP (`4,008 GP` pour 4 007,5) : payer 4 007 GP 5 SP
 *  facturerait un nombre que le joueur n'a pas vu — ⛔ et `bourseCouvre` ne fait
 *  pas la monnaie, donc une bourse sans pièce d'argent refuserait un prix qu'elle
 *  couvre à l'œil. Une seule fonction arrondit : `x5-ecran` AFFICHE par elle.
 *  ⛔ Rien à payer (0, négatif, illisible) rend `null`, pas une bourse de zéros. */
export function enPieces(po) {
  if (!Number.isFinite(po) || po <= 0) return null;
  const c = { pp: 0, gp: 0, sp: 0, cp: 0 };
  if (po >= 1) c.gp = Math.round(po);
  else if (po >= 0.1) c.sp = Math.round(po * 10);
  else c.cp = Math.max(1, Math.round(po * 100));
  return c;
}

/** ⭐ LOT 269 — LE PRIX TAPÉ À LA MAIN dans X5 (Eric, 25/09 : *« il faut aussi dans X5
 *  qu'une case puisse modifier le prix manuellement »*). Un nombre nu est de l'or
 *  (`1000`, `1,000`, `7.5`) ; `250 GP`, `5 SP` se lisent par `prixEnPO`.
 *  ⛔ Vide ou illisible rend `null` — le prix calculé reste —, jamais 0 : un zéro
 *  tapé par erreur ne rend pas un objet gratuit en silence. `0` tapé exprès vaut 0. */
export function prixSaisi(texte) {
  const t = String(texte ?? "").trim();
  if (!t) return null;
  if (/^\d[\d,]*(\.\d+)?$/.test(t)) {
    const n = Number(t.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  const v = prixEnPO(t);
  if (v > 0) return v;
  return /^0+(\.0+)?\s*(gp|sp|cp)\b/i.test(t) ? 0 : null;
}

export function prixEnPO(cout) {
  const m = /^\s*([\d,.]+)\s*(GP|SP|CP)\b/i.exec(String(cout || ""));
  if (!m) return 0;
  const n = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return 0;
  return n * { gp: 1, sp: 0.1, cp: 0.01 }[m[2].toLowerCase()];
}
