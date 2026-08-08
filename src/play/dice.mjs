/* Les dés du moteur : plans de jet, dés libres, dés bonus, et la vue « dés »
   d'une entrée réglée. Porté de fh-phb `docs/javascripts/fh-player-sheet.js`
   (main). Zéro DOM, zéro `window`.

   Le hasard et les identifiants sont INJECTÉS (`createDiceKit`) : c'est ce qui
   remplace les globals `crypto` que les suites v1 truquaient dans leur
   sandbox `vm`. */

import { clamp } from "./utils.mjs";

export const DIE_SEQUENCE = [4, 6, 8, 10, 12];
export const ROLL_DIE_SIZES = [4, 6, 8, 10, 12, 20, 100];
export const MAX_BONUS_DICE = 3;
export const MAX_FREE_DICE = 50;
export const MAX_HISTORY = 20;

/* Les noms de matières admis pour la teinte d'un dé. La v1 validait contre
   `DIE_MATERIAL`, la table de palettes SVG ; ici seule la LISTE fait règle —
   les palettes restent une affaire d'UI (fh-dice-visual.js). `white` est exclu
   par `dieColour` : c'est une matière du moteur, pas une robe qu'un joueur
   choisit.

   REWRITTEN (lot 5) — la liste portait une matière nommée d'après une
   mécanique maison, et `dieColour` l'excluait explicitement juste après. Elle
   est SORTIE de la liste : le résultat est identique au bit près (les deux
   chemins rendaient ""), et `src/play/` cesse de nommer une règle qu'il ne
   possède pas (loi §0.12). Les dés d'une couche portent leur matière par leur
   propre `special`, comme ils l'ont toujours fait. */
export const DIE_MATERIAL_NAMES = [
  "ivory", "gold", "green", "crit", "fumble", "white",
  "crimson", "azure", "violet", "slate", "ash"
];

export function dieColour(value) {
  return DIE_MATERIAL_NAMES.indexOf(value) >= 0 && value !== "white" ? value : "";
}

/* « choice » est l'A/D d'Eric : on lance deux dés, on décide après. Avantage
   et désavantage sont des décisions prises AVANT le jet, donc ils se
   résolvent seuls — offrir un choix par-dessus était l'ancien bug. */
export function rollMode(value) {
  return value === "advantage" || value === "disadvantage" || value === "choice" ? value : "flat";
}

/* Une face de dé est toujours un entier : une valeur fractionnaire ou hostile
   survivant d'un état stocké doit atterrir sur une vraie face, pas entrer
   dans le total sous forme de décimale. */
export function forcedDieResult(value, sides) {
  if (value == null || value === "") return null;
  return clamp(Math.round(Number(value)), 1, Number(sides) || 20);
}

export function chooseDiePlan(plan, index) {
  index = clamp(index, 0, plan.rolls.length - 1);
  plan.chosenIndex = index;
  plan.result = plan.rolls[index];
  return plan;
}

export function entryBonusDice(entry, normalize) {
  if (Array.isArray(entry && entry.bonusDice)) {
    return entry.bonusDice.map(normalize).slice(0, MAX_BONUS_DICE);
  }
  const dice = [];
  if (entry && entry.guidance) {
    dice.push(normalize({
      id: "legacy-guidance", label: "Guidance", sourceIcon: "guidance",
      sides: entry.guidance.sides || 4, result: entry.guidance.result, rolls: entry.guidance.rolls,
      chosenIndex: entry.guidance.chosenIndex, advantageMode: entry.guidance.advantageMode,
      forced: entry.guidance.forced
    }, 0));
  }
  if (entry && entry.bardic) {
    dice.push(normalize({
      id: "legacy-bardic", label: "Bardic", sourceIcon: "bardic",
      sides: entry.bardic.sides || 6, result: entry.bardic.result, rolls: entry.bardic.rolls,
      chosenIndex: entry.bardic.chosenIndex, advantageMode: entry.bardic.advantageMode,
      forced: entry.bardic.forced
    }, 1));
  }
  return dice;
}

export function bonusSourceFor(label, index, source) {
  const known = String(source || "");
  if (known && /^(guidance|bardic|tactical|other-[123])$/.test(known)) return known;
  const name = String(label || "").toLowerCase();
  if (name === "guidance") return "guidance";
  if (name === "bardic") return "bardic";
  if (name === "tactical") return "tactical";
  return "other-" + Math.min(3, Math.max(1, Number(index) + 1 || 1));
}

export function trayDiceForPlan(plan, label, extra) {
  extra = extra || {};
  const rolls = Array.isArray(plan && plan.rolls) && plan.rolls.length ? plan.rolls : [plan && plan.result];
  return rolls.map((result, index) => Object.assign({
    sides: plan.sides, result, label: label + (rolls.length > 1 ? " #" + (index + 1) : ""),
    short: plan.short || "",
    dropped: rolls.length > 1 && plan.chosenIndex != null && index !== Number(plan.chosenIndex),
    choiceMode: rollMode(plan.mode || plan.advantageMode), forced: !!plan.forced,
    sourceIcon: plan.sourceIcon || "", colour: plan.colour || ""
  }, extra));
}

export function pendingTrayDice(sides, label, mode, forced, extra) {
  const manual = forcedDieResult(forced, sides);
  const count = manual != null || rollMode(mode) === "flat" ? 1 : 2;
  const dice = [];
  for (let i = 0; i < count; i++) {
    dice.push(Object.assign({
      sides, result: manual, label: label + (count > 1 ? " #" + (i + 1) : ""),
      pending: true, forced: manual != null
    }, extra || {}));
  }
  return dice;
}

/* Le kit : tout ce qui a besoin de hasard ou d'un identifiant.

   `modules` est ce qui permet à ce fichier de ne citer AUCUNE mécanique
   maison (loi §0.12). Avant le lot 5, `trayDiceFromEntry` connaissait le dé
   de Destinée, le jeton « FH bonus » et la transformation d'un 1 en 20. Les
   trois sont devenus des CONTRIBUTIONS : un module rend les dés de sa
   mécanique, décore la base s'il l'a réécrite, et déclare les sortes d'entrée
   qui lui appartiennent. Sans module monté, rien de tout cela n'existe. */
export function createDiceKit({ rollDie, uuid, labels, modules = [] }) {
  const t = labels;
  const trayHooks = modules.map((m) => m.trayDice).filter(Boolean);
  const baseHooks = modules.map((m) => m.decorateBase).filter(Boolean);
  const kindHooks = modules.map((m) => m.trayDiceForKind).filter(Boolean);
  function newFreeDie(sides, colour) {
    return { id: uuid(), sides: Number(sides), colour: dieColour(colour), advantageMode: "flat", forcedResult: null };
  }

  /* Un dé du plateau libre est un vrai objet, pas un simple nombre : c'est ce
     qui lui permet de garder une couleur à travers le jet et de porter son
     propre Portent. `label`/`poolResourceId` : un dé libre dépensé sur la
     réserve comptée garde son nom et l'id qui re-crédite sa ressource s'il est
     repris avant ROLL. */
  function normalizeFreeDie(raw) {
    const sides = Number(raw && raw.sides != null ? raw.sides : raw);
    if (ROLL_DIE_SIZES.indexOf(sides) < 0) return null;
    raw = raw && typeof raw === "object" ? raw : {};
    return {
      id: raw.id || uuid(), sides, colour: dieColour(raw.colour),
      advantageMode: rollMode(raw.advantageMode), forcedResult: forcedDieResult(raw.forcedResult, sides),
      label: raw.label ? String(raw.label).slice(0, 32) : undefined,
      short: raw.short ? String(raw.short).slice(0, 7) : undefined,
      poolResourceId: raw.poolResourceId || undefined
    };
  }

  function newBonusDie(label, sides, sourceIcon, colour) {
    return {
      id: uuid(), label: String(label || "Other I").slice(0, 32),
      sides: ROLL_DIE_SIZES.indexOf(Number(sides)) >= 0 ? Number(sides) : 6,
      advantageMode: "flat", forcedResult: null,
      sourceIcon: bonusSourceFor(label, 0, sourceIcon), colour: dieColour(colour)
    };
  }

  function normalizeBonusDie(die, index) {
    die = die || {};
    const sides = ROLL_DIE_SIZES.indexOf(Number(die.sides)) >= 0 ? Number(die.sides) : 6;
    const label = String(die.label || "Other I").slice(0, 32);
    return {
      id: die.id || ("bonus-" + index + "-" + uuid()), label, sides,
      advantageMode: rollMode(die.advantageMode || die.mode),
      forcedResult: forcedDieResult(die.forcedResult, sides),
      rolls: Array.isArray(die.rolls) ? die.rolls.map(Number) : undefined,
      result: die.result != null ? Number(die.result) : undefined,
      chosenIndex: die.chosenIndex != null ? Number(die.chosenIndex) : undefined,
      forced: !!die.forced, origin: die.origin || undefined,
      sourceIcon: bonusSourceFor(label, index, die.sourceIcon), colour: dieColour(die.colour),
      short: die.short ? String(die.short).slice(0, 7) : undefined,
      poolResourceId: die.poolResourceId || undefined,
      /* D.4 : la SOURCE de correction voyage avec le dé. Sans elle, le
         règlement ne saurait pas qu'un Tactical Mind se rembourse quand le
         test échoue quand même. */
      correction: die.correction || undefined,
      refunded: die.refunded || undefined
    };
  }

  function makeDiePlan(sides, mode, forced) {
    sides = Number(sides) || 20;
    mode = rollMode(mode);
    const manual = forcedDieResult(forced, sides);
    if (manual != null) return { sides, mode, rolls: [manual], result: manual, chosenIndex: 0, forced: true };
    const rolls = mode === "flat" ? [rollDie(sides)] : [rollDie(sides), rollDie(sides)];
    if (mode === "flat") return { sides, mode, rolls, result: rolls[0], chosenIndex: 0, forced: false };
    if (mode === "choice") return { sides, mode, rolls, result: null, chosenIndex: null, forced: false };
    const pick = mode === "advantage" ? (rolls[0] >= rolls[1] ? 0 : 1) : (rolls[0] <= rolls[1] ? 0 : 1);
    return { sides, mode, rolls, result: rolls[pick], chosenIndex: pick, forced: false };
  }

  const bonusDiceOf = (entry) => entryBonusDice(entry, normalizeBonusDie);

  function mirrorNamedBonusDice(entry) {
    const dice = bonusDiceOf(entry);
    const guidance = dice.find((die) => die.label.toLowerCase() === "guidance");
    const bardic = dice.find((die) => die.label.toLowerCase() === "bardic");
    const mirror = (die) => die
      ? { sides: die.sides, result: die.result, rolls: die.rolls, chosenIndex: die.chosenIndex, advantageMode: die.advantageMode, forced: die.forced }
      : null;
    entry.guidance = mirror(guidance);
    entry.bardic = mirror(bardic);
  }

  /* Les dés qu'une entrée réglée montre — extrait de setTrayFromEntry en v1
     pour que chaque LIGNE du plateau reconstruise ses propres dés, et que
     `rollExport` mette la même liste sur le fil. */
  function trayDiceFromEntry(entry) {
    const results = [];
    /* Une sorte d'entrée qui appartient à un module (un dé de Destinée isolé)
       est rendue par ce module, et par lui seul. Demandé AVANT tout le reste :
       le chemin commun ne connaît que `d20` et `tray`. */
    for (const hook of kindHooks) {
      const own = hook(entry, { trayDiceForPlan, t });
      if (own) return own;
    }
    if (entry.kind === "d20") {
      const d20Plan = entry.d20Roll || {
        sides: 20, rolls: entry.d20s || [entry.kept], result: entry.kept,
        chosenIndex: entry.d20Choice != null ? entry.d20Choice : (entry.d20s || []).indexOf(entry.kept),
        mode: entry.d20Mode, forced: !!entry.d20Forced
      };
      /* Chaque dé tombé porte la clef à laquelle son propre menu répond : un
         Portent posé dessus plus tard atteint cette entrée et aucune autre. */
      const base = trayDiceForPlan(d20Plan, "d20", { dieRole: "base", colour: entry.d20Colour || "", landedKey: "d20", entryId: entry.id });
      base.forEach((die) => { die.natural = die.result; });
      /* Une mécanique qui a RÉÉCRIT le d20 (un 1 qui se lit 20) le dit ici,
         sur les dés qu'elle a réécrits — le chemin commun ne connaît pas sa
         règle, seulement qu'un module a le droit de décorer sa propre base. */
      baseHooks.forEach((hook) => hook(entry, base, { plan: d20Plan, t }));
      base.forEach((die) => results.push(die));
      bonusDiceOf(entry).forEach((die) => {
        trayDiceForPlan(die, die.label, { dieRole: "bonus", landedKey: "bonus:" + die.id, entryId: entry.id })
          .forEach((item) => results.push(item));
      });
      trayHooks.forEach((hook) => (hook(entry, { trayDiceForPlan, t }) || []).forEach((item) => results.push(item)));
      if (Number(entry.custom)) results.push({ kind: "modifier", result: Number(entry.custom), label: t("modifier.manual"), tone: "mod" });
      if (entry.exhaustion) results.push({ kind: "modifier", result: Number(entry.exhaustionPenalty) || -Number(entry.exhaustion), label: t("modifier.exhaustion"), tone: "exhaustion" });
      /* Les dégâts d'une attaque ou d'un sort sont des dés du MÊME jet : ils
         se posent à la suite, pas dans une seconde ligne de flux (exigence A). */
      (entry.damageDice || []).forEach((die, index) => {
        trayDiceForPlan({ sides: die.sides, rolls: [die.result], result: die.result, chosenIndex: 0, mode: "flat", forced: !!die.forced },
          t("tray.damage"), { dieRole: "damage", landedKey: "damage:" + index, entryId: entry.id })
          .forEach((item) => results.push(item));
      });
      if (entry.damage && Number(entry.damage.bonus)) {
        results.push({ kind: "modifier", result: Number(entry.damage.bonus), label: t("modifier.damage-bonus"), tone: "mod" });
      }
    } else if (entry.kind === "tray") {
      /* R31 : un dé libre qui porte un NOM (une ressource de réserve dépensée
         au repos — « Bardic », « Tactical ») le garde sur la ligne tombée,
         exactement comme la main en attente le nommait déjà. */
      (entry.dice || []).forEach((die, index) => {
        trayDiceForPlan({
          sides: die.sides, rolls: die.rolls && die.rolls.length ? die.rolls : [die.result],
          result: die.result, chosenIndex: die.chosenIndex, mode: die.advantageMode,
          forced: die.forced, colour: die.colour
        }, die.label || ("d" + die.sides), { dieRole: "base", landedKey: "free:" + index, entryId: entry.id })
          .forEach((item) => { item.natural = die.sides === 20 ? item.result : null; results.push(item); });
      });
    }
    return results;
  }

  return {
    newFreeDie, normalizeFreeDie, newBonusDie, normalizeBonusDie,
    makeDiePlan, entryBonusDice: bonusDiceOf, mirrorNamedBonusDice, trayDiceFromEntry
  };
}
