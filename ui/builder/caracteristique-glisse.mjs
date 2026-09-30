/* ══ 🧬 LOT 373 — « UNE VALEUR PARMI N » : LA CARACTÉRISTIQUE D'INCANTATION ══════════════
   ARCHI 35, 30/09. Le texte : « Intelligence, Wisdom, or Charisma is your spellcasting
   ability for the spells you cast with this trait (choose the ability when you select the
   lineage) » (Elf, Gnome/Hoddon, Tiefling) — et Magic Initiate : « (choose when you select
   this feat) ». Le carnet publie le plan (`species.lineage[0].ability`,
   `<racine>.originFeat[0].ability`) ; cet organe le rend, UNE fois, pour ses deux lieux :
   DANS la porte de la lignée (Species), et en branche du B emboîté du don (Inheritance,
   Background SRD, Versatile).

   ⭐ LE MÊME ORGANE QUE PARTOUT : les jetons (les options DU PLAN, jamais une liste écrite
   ici), un récepteur, le glisser ou le tap-armer-poser. ⛔ Aucun nom d'espèce, de lignée ni
   de don : le plan dit tout. Et il ne rend rien sans plan.

   Les MOTS : les noms des caractéristiques sont ceux d'Abilities (`NOMS_DE_CARAC`, écrits
   une fois ICI et lus par Abilities) ; « Spellcasting ability » est le terme du texte SRD
   lui-même, et « Ability » le mot du récepteur. */
import { planAt, planSlots } from "./carnet.mjs?v=923";
import { renderChoixGlisses } from "./glisser.mjs?v=923";

/** Les noms entiers des six caractéristiques — un seul écrivain (Abilities les lit ici). */
export const NOMS_DE_CARAC = Object.freeze({
  str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma"
});

/** Le titre d'une porte « caractéristique d'incantation » — le terme du texte. */
export const MOT_CARAC_D_INCANTATION = "Spellcasting ability";

/** Le chemin est-il celui d'une caractéristique d'incantation publiée par le carnet ? */
export function estUneCaracDIncantation(chemin) {
  return typeof chemin === "string" && /\.ability$/.test(chemin) &&
    (/^species\.lineage(\[[0-9]+\])?\.ability$/.test(chemin) || /^[a-z]+\.originFeat\[0\]\.ability$/.test(chemin));
}

/** La caractéristique POSÉE sous ce plan, ou `null`. */
export function caracPosee(decisions, basePath) {
  const plan = planAt(decisions || [], basePath);
  const id = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
  return id && NOMS_DE_CARAC[id] ? NOMS_DE_CARAC[id] : null;
}

/** L'organe : les jetons d'options du plan, un récepteur. `null` sans plan. */
export function renderCaracteristiqueGlisse(ctx, act, basePath, { titre = MOT_CARAC_D_INCANTATION } = {}) {
  const decisions = (ctx && ctx.decisions) || [];
  const plan = planAt(decisions, basePath);
  if (!plan) return null;
  const slots = planSlots(decisions, basePath);
  return renderChoixGlisses({
    plan, slots: slots.length > 0 ? slots : [{ ...plan, index: 0 }],
    titre, mot: "Ability",
    labelOf: (id) => NOMS_DE_CARAC[id] || String(id).toUpperCase(),
    onAction: act
  });
}
