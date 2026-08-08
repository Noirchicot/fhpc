/* ══ LES TROIS TYPES DE JET SRD ══════════════════════════════════════
   Exigence A du lot 5. Eric : « architecture différente selon Skill, Actions
   ou Spells ». Ce ne sont pas trois habillages du même jet :

   - une **compétence** est UN jet contre un seuil ;
   - une **action** en est DEUX, liés : toucher, puis des dégâts dont un coup
     critique double les DÉS (SRD 5.2.1, `srd:glossary:en:critical-hit`, p.179 :
     « Roll all of the attack's damage dice twice ») ;
   - un **sort** est encore autre chose : souvent aucun jet du lanceur mais une
     sauvegarde de la cible contre un DD, plus un emplacement consommé, un
     niveau de lancement, parfois de la concentration.

   Le mécanisme est le MÊME que la séparation SRD/FH : une séquence de phases
   nommées sur laquelle on s'inscrit. C'est la raison d'être du lot de les
   valider ensemble — traités séparément, on construirait deux fois la même
   chose et elles divergeraient.

   ⚠️ LA LISTE DES RÉGLAGES EST FERMÉE **PAR TYPE**, JAMAIS GLOBALEMENT.
   Le verbe `configure` livré par le lot 3 acceptait un patch partiel
   quelconque (`Object.assign(state.rollConfig, p)`) : c'était la forme
   « compétence » prise pour la règle générale, et elle laissait écrire `ac` sur
   une compétence ou `dc` sur un sort à sauvegarde sans que rien ne bronche.
   Ici un réglage inconnu JETTE en se nommant (loi §0.5).

   Aucune mécanique Fate's Hand n'est citée dans ce fichier. Ce que FH ajoute
   (un dé de Destinée monté avant le jet, un +2) s'inscrit sur les moments
   `mount` / `pre-roll` ; les types n'en savent rien. */

import { clamp } from "./utils.mjs";
import { rollMode, ROLL_DIE_SIZES } from "./dice.mjs";

const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const MAX_DAMAGE_DICE = 12;

/* ── Le vocabulaire de validation ────────────────────────────────────
   Un réglage déclare comment il se lit. Une valeur hostile atterrit sur une
   valeur légale ou jette ; elle n'entre jamais telle quelle. */
const AS = {
  text: (value) => String(value == null ? "" : value).slice(0, 120),
  note: (value) => String(value == null ? "" : value).slice(0, 400),
  int: (value) => Math.round(Number(value) || 0),
  mode: (value) => rollMode(value),
  bool: (value) => !!value,
  /* Un seuil est un ENTIER ou la chaîne vide : « pas de DD » est un état
     nommé, pas un zéro déguisé (un DD 0 se réussit toujours, l'absence de DD
     ne se réussit pas du tout). */
  threshold: (value) => (value === "" || value == null ? "" : String(Math.round(Number(value) || 0))),
  ability: (value) => {
    const key = String(value || "").toUpperCase();
    if (!key) return "";
    if (ABILITIES.indexOf(key) < 0) {
      throw new Error('fhpc/play: "' + value + '" is not an ability — one of ' + ABILITIES.join(", "));
    }
    return key;
  },
  level: (value) => clamp(value, 0, 9),
  /* Les dégâts : des dés déclarés, un bonus plat, un type. Le critique double
     les DÉS et jamais le bonus — c'est la règle SRD, et la forme la porte. */
  damage: (value) => {
    if (value == null) return null;
    if (typeof value !== "object") throw new Error("fhpc/play: damage must be an object {dice, bonus, type}");
    const dice = (Array.isArray(value.dice) ? value.dice : []).slice(0, MAX_DAMAGE_DICE).map((die) => {
      const sides = Number(die && die.sides);
      if (ROLL_DIE_SIZES.indexOf(sides) < 0) {
        throw new Error("fhpc/play: damage die d" + die?.sides + " is not a real die");
      }
      return { count: clamp(die.count == null ? 1 : die.count, 1, MAX_DAMAGE_DICE), sides };
    });
    return { dice, bonus: Math.round(Number(value.bonus) || 0), type: String(value.type || "").slice(0, 24) };
  }
};

/* ── Les trois types ─────────────────────────────────────────────────
   `settings` : la liste FERMÉE, id → lecture.
   `phases`   : la séquence que le moteur parcourt, dans l'ordre. */
export const ROLL_TYPES = {
  check: {
    id: "check",
    label: "check",
    settings: {
      name: AS.text, ability: AS.ability, baseBonus: AS.int,
      d20Mode: AS.mode, dc: AS.threshold, note: AS.note, custom: AS.int
    },
    phases: ["mount", "pre-roll", "d20", "result", "open"]
  },

  attack: {
    id: "attack",
    label: "attack",
    settings: {
      name: AS.text, ability: AS.ability, baseBonus: AS.int,
      d20Mode: AS.mode, ac: AS.threshold, note: AS.note, custom: AS.int,
      damage: AS.damage
    },
    phases: ["mount", "pre-roll", "d20", "result", "damage", "open"]
  },

  spell: {
    id: "spell",
    label: "spell",
    settings: {
      name: AS.text, level: AS.level, slotLevel: AS.level,
      /* Comment le sort se résout : la cible sauvegarde, le lanceur attaque,
         ou personne ne lance rien (une bénédiction, un mur). Trois portes
         nommées — pas un booléen `isAttack` qui laisserait le troisième cas
         sans nom. */
      resolution: (value) => {
        const key = String(value || "save");
        if (["save", "attack", "none"].indexOf(key) < 0) {
          throw new Error('fhpc/play: spell resolution "' + value + '" — one of save, attack, none');
        }
        return key;
      },
      saveAbility: AS.ability, saveDc: AS.threshold,
      ability: AS.ability, baseBonus: AS.int, d20Mode: AS.mode, custom: AS.int,
      concentration: AS.bool, damage: AS.damage, note: AS.note
    },
    phases: ["mount", "slot", "pre-roll", "d20", "result", "damage", "open"]
  }
};

export const ROLL_TYPE_IDS = Object.keys(ROLL_TYPES);

export function rollTypeFor(id) {
  const type = ROLL_TYPES[String(id || "check")];
  if (!type) {
    throw new Error('fhpc/play: unknown roll type "' + id + '" — one of ' + ROLL_TYPE_IDS.join(", "));
  }
  return type;
}

/* ── Le portier de `configure` ───────────────────────────────────────
   La correction demandée par l'exigence A. Un patch est lu réglage par
   réglage contre la liste fermée du type COURANT ; une clef qui n'y est pas
   jette en nommant le type et ce qu'il accepte. C'est ce qui empêche `ac`
   d'atterrir sur une compétence et `dc` sur un sort à sauvegarde. */
export function applySettings(type, target, patch) {
  const settings = type.settings;
  const applied = {};
  Object.keys(patch || {}).forEach((key) => {
    const read = settings[key];
    if (!read) {
      throw new Error(
        'fhpc/play: "' + key + '" is not a setting of a ' + type.label + ' roll — ' +
        Object.keys(settings).sort().join(", ")
      );
    }
    applied[key] = read(patch[key]);
  });
  Object.assign(target, applied);
  return applied;
}

/* Les dés de dégâts d'un type, développés en plans à lancer. Un critique les
   double — les dés, pas le bonus (SRD p.179). */
export function damagePlanFor(damage, { critical = false } = {}) {
  if (!damage) return null;
  const dice = [];
  (damage.dice || []).forEach((die) => {
    const count = die.count * (critical ? 2 : 1);
    for (let i = 0; i < count; i++) dice.push({ sides: die.sides });
  });
  return { dice, bonus: damage.bonus || 0, type: damage.type || "", critical: !!critical };
}
