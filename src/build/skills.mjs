/* ══ LA LÉGALITÉ COMMUNE DES COMPÉTENCES ═════════════════════════════
   Le pli et le carnet public doivent annoncer exactement les mêmes options.
   Cet index est donc leur source commune : une compétence sans `slug` ou
   sans `ability_key` n'est légale d'aucun côté, et une clef hors catalogue
   reste le refus bruyant historique du pli. */

import { BuildError } from "./errors.mjs";

function fail(what) {
  throw new BuildError(`fhpc/build: ${what}`);
}

/** Les six clefs machine de `$defs/ability`. Ce ne sont pas des mots : c'est
 *  l'énumération du schéma, la même dans toutes les langues.
 *
 *  ⚠️ ARBITRAGE DE L'ARCHITECTE, 2026-08-08 : `ability_key` est CANONIQUE dans
 *  toutes les langues. Une couche FR qui dirait `sag` porterait une clef que
 *  `resolved.abilities` ne peut pas adresser — ce dernier est
 *  `additionalProperties: false` sur ces six-là, dans les deux langues. Le mot
 *  affichable reste disponible ailleurs (`skill.data.ability`). */
export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_SET = new Set(ABILITY_KEYS);

/** Une clef de caractéristique HORS des six canoniques est une erreur
 *  bruyante qui NOMME le record — jamais une valeur à rattraper (arbitrage du
 *  2026-08-08). Une table de correspondance ici serait exactement la faute que
 *  ce lot existe pour éviter. Absente, la clef se DÉCLARE ; fausse, elle JETTE :
 *  un champ qui manque est un travail à finir, un champ hors catalogue est un
 *  contenu faux. */
export function assertAbilityKey(key, recordId, field) {
  if (key === undefined || key === null) return false;
  if (ABILITY_SET.has(key)) return true;
  fail(`le record « ${recordId} » porte \`${field}\` = ${JSON.stringify(key)}, qui n'est pas une clef de ` +
    `caractéristique (les six, dans toutes les langues : ${ABILITY_KEYS.join(", ")}). ` +
    "Le moteur ne rattrape pas une clef hors catalogue : il la nomme.");
}

/* Un index par id de record ET par slug : le contrat désigne les compétences
   par id (`skill_ids`, `skill_choice.from`), tandis que les choix du joueur
   les nomment par slug (`class.skills[0] = "investigation"`) et que
   `resolved.skills[].id` est ce même slug. Sans les deux entrées, il faudrait
   deviner de quel côté on se trouve.

   `underived` est facultatif parce que la projection ne produit pas ce carnet ;
   le pli lui passe son vrai collecteur et conserve ses deux raisons historiques
   mot pour mot. La légalité, elle, ne varie pas. */
export function indexSkills(views, underived) {
  const declare = underived && typeof underived.declare === "function"
    ? (field, key, params) => underived.declare(field, key, params)
    : () => undefined;
  const byId = new Map();
  const bySlug = new Map();
  const list = [];
  for (const view of Array.isArray(views) ? views : []) {
    const abilityKey = view.record.data && view.record.data.ability_key;
    const slug = view.record.slug;
    if (typeof slug !== "string") {
      declare(`skills[${view.id}]`, "underived.skill-missing-slug", {});
      continue;
    }
    if (!assertAbilityKey(abilityKey, view.id, "data.ability_key")) {
      declare(`skills[${slug}]`, "underived.skill-missing-ability-key", {});
      continue;
    }
    const entry = { id: slug, name: view.record.name, ability: abilityKey, recordId: view.id };
    byId.set(view.id, entry);
    bySlug.set(slug, entry);
    list.push(entry);
  }
  list.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { byId, bySlug, list };
}

/* Une déclaration de choix de compétence (`skill_choice`,
   `granted_skill_choice`) → l'ensemble des slugs légaux. `"any"` est le cas
   B1 du contrat, arbitré : le barde choisit parmi TOUTES les compétences, et
   la source ne donne pas de liste — on ne lui en fabrique pas une. */
export function allowedSlugs(declaration, skills) {
  if (!declaration || typeof declaration !== "object") return null;
  const from = declaration.from;
  if (from === "any") return new Set(skills.list.map((entry) => entry.id));
  if (!Array.isArray(from)) return null;
  const slugs = new Set();
  for (const recordId of from) {
    const entry = skills.byId.get(recordId);
    if (entry) slugs.add(entry.id);
  }
  return slugs;
}
