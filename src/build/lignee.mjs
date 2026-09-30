/* ══ 🧬 LOT 373 — LA LIGNÉE CHOISIE, LUE UNE FOIS ═══════════════════════════════
   ARCHI 35, 30/09 : « les lignées prennent leurs effets, plus la porte “une valeur
   parmi N” ». Le carnet (`decisions.mjs`) publie les portes que la lignée ouvre ; la
   dérivation (`derive.mjs`) applique ce qu'elle donne. ⭐ LES DEUX LISENT ICI : une seule
   réponse à « quelle option ? », « donne-t-elle un sort ? », « quelle bourse ? » — la
   leçon du lot 71 (deux écrivains d'une même réponse divergent, et ça se voit à l'écran).

   ⛔ AUCUN NOM D'ESPÈCE, AUCUN NOM DE LIGNÉE : tout se lit dans la DONNÉE du record
   (`data.lineages[]`, `data.spellcasting_ability_choice`, `data.species_cantrips`). La
   forme est déclarée par `srfh-mecaniques-en` (SRD) et par la source du générateur des
   espèces Fate's Hand ; `tests/lignees-373.test.mjs` relit chaque extrait dans son texte. */
import { ABILITY_KEYS } from "./skills.mjs";

/** Le chemin d'une réponse de lignée : `species.lineage[n]` — ou `species.lineage`, sans indice,
 *  la forme que portent des documents plus anciens (voir `derive.mjs`, « LES DEUX FORMES »). */
export const REPONSE_DE_LIGNEE = /^species\.lineage(\[[0-9]+\])?$/;

/** L'option de lignée que désigne `valeur`, ou `null`. */
export function optionDeLignee(speciesData, valeur) {
  const lignees = speciesData && Array.isArray(speciesData.lineages) ? speciesData.lineages : [];
  return typeof valeur === "string" ? lignees.find((o) => o && o.id === valeur) || null : null;
}

/** Ce que l'option DONNE : `data.lineage_effects[<id d'option>]` — un champ de schéma indexé
 *  par l'id, jamais un chemin de patch par le mot (`tests/chemin-par-le-mot-ferme.test.mjs`). */
export function effetsDeLaLignee(speciesData, option) {
  const carte = speciesData && speciesData.lineage_effects;
  const effets = option && carte && typeof carte === "object" ? carte[option.id] : null;
  return effets && typeof effets === "object" && !Array.isArray(effets) ? effets : {};
}

const listeDeSorts = (x) => (Array.isArray(x) ? x.filter((s) => s && typeof s.id === "string") : []);

/** Les sorts que la lignée DONNE, et ceux que l'espèce donne par un trait qui lance
 *  avec la même caractéristique (Otherworldly Presence) : `{cantrips, spells}` d'ids. */
export function sortsDeLaLignee(speciesData, option) {
  const deLEspece = listeDeSorts(speciesData && speciesData.species_cantrips);
  const effets = effetsDeLaLignee(speciesData, option);
  return {
    cantrips: [...deLEspece, ...listeDeSorts(effets.cantrips)].map((s) => s.id),
    spells: listeDeSorts(effets.spells).map((s) => s.id)
  };
}

/** La lignée (ou l'espèce, par sa lignée) fait-elle lancer un sort ? — c'est ce qui ouvre
 *  la porte de la caractéristique : sans sort, la question ne porte sur rien. */
export function ligneeLanceDesSorts(speciesData, option) {
  const { cantrips, spells } = sortsDeLaLignee(speciesData, option);
  return cantrips.length + spells.length > 0;
}

/** Les options d'un `spellcasting_ability_choice` : ses clefs de caractéristique, légales. */
export function caracteristiquesOffertes(declaration) {
  const from = declaration && Array.isArray(declaration.from) ? declaration.from : [];
  return from.filter((k) => ABILITY_KEYS.includes(k));
}

/** La bourse captive de l'espèce : la sienne (Keen Senses), sinon celle de la lignée
 *  choisie (The Mole People). `{declaration, champ}` ou `null`. */
export function bourseDeLEspece(speciesData, option) {
  if (speciesData && speciesData.granted_skill_budget !== undefined) {
    return { declaration: speciesData.granted_skill_budget, champ: "granted_skill_budget" };
  }
  const effets = effetsDeLaLignee(speciesData, option);
  if (effets.granted_skill_budget !== undefined) {
    return { declaration: effets.granted_skill_budget, champ: "lineage_effects" };
  }
  return null;
}
