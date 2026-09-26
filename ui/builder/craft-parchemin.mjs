/* ══ LE PARCHEMIN DE SORT — CE QU'IL OFFRE, CE QU'IL COÛTE — lot 285 ══════════════════
   ⛔ MODULE FEUILLE : aucun DOM, aucune cote. Il ne sait pas sur quel écran il est lu —
   X5 (la fiche Blueprint) et la fiche X1 d'une ligne posée lui posent la même question.

   ⚖️ LA DICTÉE D'ERIC, 2026-09-26 : *« choisir : classe de sort · choisir lvl · 4 étages
   de sorts token, un dropdown · send »*, puis *« toujours mettre rareté prix qté »* et
   *« n'extrapole pas le prix du parchemin par rapport à la rareté, garde les prix SRD »*.

   ⭐ TROIS SOURCES, AUCUNE ÉCRITE ICI :
     · les CLASSES et les NIVEAUX se lisent dans les records de sort (`data.classes`,
       `data.level`) — ⛔ aucune liste de classes : un sort FH (`fh-spells`) entre tout seul ;
     · la RARETÉ se lit dans la table du plan `Spell Scroll` (`raretesDuParchemin`) ;
     · le TEMPS et le COÛT viennent de la table du SRD (`SCRIBING_SRD`, `bareme-srfh.mjs`).
   ⛔ PAS DE PRÉREQUIS : le SRD demande le sort préparé chaque jour de travail et la maîtrise
   d'Arcana ou des Calligrapher's Supplies. Le mandat du lot 285 dit de ne pas les vérifier
   — le builder ne sait pas encore ce qu'un personnage prépare. */

import { raretesDuParchemin, nomDUnParchemin } from "../../src/build/objet-crafte.mjs?v=843";
import { scribingDuNiveau, noteDeScribing } from "./bareme-srfh.mjs?v=843";
import { PLAFOND_QTE, texteDesJours } from "./craft.mjs?v=843";

/** Le niveau d'un sort : 0 pour un cantrip. ⛔ Illisible → `null`, jamais 0 (un cantrip
 *  coûte 15 GP : un niveau inventé serait un prix inventé). */
export function niveauDuSort(sort) {
  const d = (sort && sort.data) || {};
  if (Number.isInteger(d.level) && d.level >= 0 && d.level <= 9) return d.level;
  return d.cantrip === true ? 0 : null;
}

/** « Cantrip », « Level 3 » — le mot du menu LEVEL et de la fiche. */
export function motDuNiveau(n) {
  return n === 0 ? "Cantrip" : `Level ${n}`;
}

const classesDe = (sort) => (Array.isArray(sort && sort.data && sort.data.classes) ? sort.data.classes : [])
  .map((c) => String(c || "").trim()).filter(Boolean);

/** Les classes qui ont au moins un sort, dans l'ordre alphabétique. */
export function classesDesSorts(sorts) {
  return [...new Set((sorts || []).flatMap(classesDe))].sort((a, b) => a.localeCompare(b));
}

/** Les niveaux où la classe a des sorts — ⚖️ « seulement les niveaux où la classe a des sorts ». */
export function niveauxDeLaClasse(sorts, classe) {
  const n = (sorts || []).filter((s) => classesDe(s).includes(classe)).map(niveauDuSort)
    .filter((x) => x !== null);
  return [...new Set(n)].sort((a, b) => a - b);
}

/** Les sorts d'une classe à un niveau, par nom. */
export function sortsDe(sorts, classe, niveau) {
  return (sorts || []).filter((s) => classesDe(s).includes(classe) && niveauDuSort(s) === niveau)
    .sort((a, b) => String(a.data.name).localeCompare(String(b.data.name)));
}

/** ⭐ LA COTE D'UN PARCHEMIN — la MÊME forme que `coteDe` et `coteDUneVariante`, pour que
 *  la bourse et `Send` la lisent sans savoir d'où elle vient.
 *  ⚖️ Le temps et le coût : la table du SRD, ⛔ jamais le palier de la rareté.
 *  ⚖️ La quantité : « je veux pas qu'une tuile puisse sortir du craft avec plus de 10 »
 *  (Eric, 24/09) — chaque parchemin se paie (⛔ pas le lot de dix des munitions).
 *  ⛔ Un niveau hors table ne se crafte pas ; une rareté absente du record reste absente
 *  (`rarete: null`) — le prix, lui, ne dépend pas d'elle. */
export function coteDUnParchemin({ plan, niveau, qte = 1 } = {}) {
  const s = scribingDuNiveau(niveau);
  if (!s) return { legal: false, raison: "niveau-illisible" };
  const ligne = raretesDuParchemin(plan && plan.data).find((l) => l.niveau === niveau) || null;
  const n = Math.max(1, Math.min(PLAFOND_QTE, Math.floor(qte) || 1));
  return {
    legal: true,
    niveau,
    rarete: ligne ? ligne.rarete : null, categorie: ligne ? ligne.rarete : null,
    dc: ligne ? ligne.dc : null, attaque: ligne ? ligne.attaque : null,
    magie: s.valeur, coutBase: 0,
    venteUnitaire: s.valeur, craftUnitaire: s.cout,
    qte: n, lot: 1, paiements: n,
    craftTotal: s.cout * n, venteTotale: s.valeur * n,
    jours: s.jours, temps: texteDesJours(s.jours),
  };
}

/** ⭐ LA VALEUR D'UNE LIGNE « Spell Scroll (Fireball) » POSÉE — pour sa fiche X1 : le prix
 *  (au format que `parseCout` relit), la rareté lue, et la note de craft
 *  (« Crafting: 5 days · 150 GP · Uncommon »). ⛔ Un sort illisible rend `null`. */
export function valeurDUnParchemin(plan, sort) {
  const niveau = niveauDuSort(sort);
  if (niveau === null) return null;
  const cote = coteDUnParchemin({ plan, niveau });
  if (!cote.legal) return null;
  return {
    cout: `${cote.venteUnitaire.toLocaleString("en-US")} GP`,
    rarete: cote.rarete,
    craft: noteDeScribing({ niveau, rarete: cote.rarete }),
  };
}

/** Le nom du parchemin d'un sort — celui du moteur (`nomDUnParchemin`). */
export function nomDuParchemin(plan, sort) {
  return nomDUnParchemin(plan && plan.data && plan.data.name, sort && sort.data && sort.data.name);
}
