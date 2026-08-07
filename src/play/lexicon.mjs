/* ══ LE LEXIQUE DE JET ═══════════════════════════════════════════════
   Porté de fh-phb `docs/javascripts/fh-player-sheet.js` (main), §1 « source
   tokens », §3 « badges », §5 « verdicts / Ruling ». UI-ROLL-VOCABULARY.md,
   ratifié 2026-08-02.

   Tout ce qui suit est DÉCLARÉ UNE FOIS et lu par toutes les surfaces. Trois
   surfaces qui dessinent chacune leur badge, ce sont trois vérités sur le même
   jet. C'est la raison d'être de ce fichier, et la raison pour laquelle il ne
   dessine rien lui-même.

   LA LIGNE QUI COUPE CE FICHIER : `verdict` est de l'AFFICHAGE et peut être
   renommé ; les chaînes `outcome` sont LUES PAR DES PROGRAMMES (le fil, les
   docks des autres joueurs, `intentOutcome` qui les regex-match) et ne
   bougent pas. Renommer ce que lit un humain ; geler ce que lit un programme. */

import { signed } from "./utils.mjs";

/* ── §1 Jetons de source ────────────────────────────────────────────
   Chaque dé porte sa provenance. Un jeton par source, ici, une fois.
   LE GLYPHE PORTE L'IDENTITÉ, LA COULEUR NE FAIT QUE LA RENFORCER : à 12px,
   bleu et violet ne se distinguent pas de façon fiable. `tone` ne voyage donc
   jamais sans `glyph`/`letter`. */
export const ROLL_SOURCES = {
  destiny: { key: "destiny", label: "Destiny", tone: "destiny", glyph: "destiny" },
  guidance: { key: "guidance", label: "Guidance", tone: "guidance", glyph: "guidance" },
  bardic: { key: "bardic", label: "Bardic", tone: "bardic", glyph: "bardic" },
  tactical: { key: "tactical", label: "Tactical", tone: "tactical", glyph: "tactical" },
  "other-1": { key: "other-1", label: "Bonus I", tone: "bonus", letter: "I" },
  "other-2": { key: "other-2", label: "Bonus II", tone: "bonus", letter: "II" },
  "other-3": { key: "other-3", label: "Bonus III", tone: "bonus", letter: "III" }
};

export const UNKNOWN_SOURCE = { key: "", label: "Other", tone: "bonus", glyph: "other" };

/* Ce qu'un joueur peut sceller sur un dé BONUS. Destiny est absent exprès :
   un dé de Destinée se prend dans la réserve, ce n'est pas un autocollant. */
export const SEALABLE_SOURCES = ["guidance", "bardic", "tactical", "other-1", "other-2", "other-3"];

export function rollSource(key) {
  return ROLL_SOURCES[String(key || "")] || UNKNOWN_SOURCE;
}

/* Le nom qu'un dé scellé prend, lu sur la table des sources — un nom par
   source, ici comme partout ailleurs. */
export function sealLabel(seal) {
  return ROLL_SOURCES[String(seal || "")] ? ROLL_SOURCES[String(seal)].label : "Bonus";
}

/* ── Le lexique ratifié, en constantes (L88, Eric 2026-08-06) ────────
   Les quatre mots ratifiés écrits UNE FOIS : le prochain renommage est une
   édition, pas un inventaire. La grammaire est « famille + ce qui l'a
   produit » — le nombre est le résultat naturel du d20, l'∞ est le dé de
   Destinée. Rien d'autre ne peut se lire comme un nom de famille. */
export const LEX = {
  crit20: "Crit 20", CRIT20: "CRITICAL 20", crit20Short: "CRIT 20",
  fumble1: "Fumble 1", FUMBLE1: "FUMBLE 1",
  critInf: "∞ critical", CRITINF: "∞ CRITICAL",
  fumbleInf: "∞ fumble", FUMBLEINF: "∞ FUMBLE"
};

export function rollHasDc(entry) {
  return entry.dc !== "" && isFinite(Number(entry.dc));
}

/* ── §5 La moitié verdict du Ruling ─────────────────────────────────
   Une table, deux lectures, et c'est tout l'intérêt. `outcome` est la chaîne
   face-machine que le fil et les tons consomment déjà ; `verdict` est ce que
   le Ruling dit à voix haute, et il a le droit d'être plus fort et plus précis.
   Les déclarer CÔTE À CÔTE est ce qui empêche les deux de diverger.

   L'ORDRE EST L'ORDRE DE JUGEMENT et il porte du sens : un critique arcanique
   prime un 20 naturel, et un DD n'est consulté que si rien de plus fort ne
   s'est produit. */
export const ROLL_VERDICTS = [
  { id: "arcane-critical-failure", when: (e) => !!(e.destiny && e.destiny.criticalFailure), outcome: "Critical failure", verdict: LEX.FUMBLEINF },
  { id: "arcane-critical-success", when: (e) => !!(e.destiny && e.destiny.criticalSuccess), outcome: "Critical success", verdict: LEX.CRITINF },
  { id: "fate-refused", when: (e) => e.natChoice === "chaos", outcome: "Critical success · Chaos", verdict: "FATE REFUSED" },
  { id: "natural-20", when: (e) => e.natural === 20, outcome: "Natural 20", verdict: LEX.CRIT20 },
  { id: "natural-1-accepted", when: (e) => e.natural === 1 && e.natChoice === "accept", outcome: "Critical failure · Fate accepted", verdict: LEX.FUMBLE1 },
  /* Un 1 auquel personne n'a encore répondu est indécis, et le Ruling le dit
     plutôt que de choisir à la place du joueur. */
  { id: "natural-1-open", when: (e) => e.natural === 1, outcome: "Natural 1 · choose fate", verdict: LEX.FUMBLE1 + " · CHOOSE" },
  { id: "success", when: (e) => rollHasDc(e) && e.total >= Number(e.dc), outcome: "Success", verdict: "SUCCESS" },
  { id: "failure", when: rollHasDc, outcome: "Failure", verdict: "FAILURE" }
];

export function rollVerdict(entry) {
  if (!entry) return null;
  for (let i = 0; i < ROLL_VERDICTS.length; i++) if (ROLL_VERDICTS[i].when(entry)) return ROLL_VERDICTS[i];
  return null;
}

export function outcomeFor(entry) {
  const found = rollVerdict(entry);
  return found ? found.outcome : "";
}

/* Les badges qui rapportent ce que le jet a DONNÉ, par opposition à la façon
   dont il a été monté : ceux-là, une ligne encore en l'air doit les taire. */
export const SPOILER_BADGE_KINDS = { n20: true, chaos: true, destiny: true };

/* ── §3 Badges : dérivés, pas émis ──────────────────────────────────
   Ces treize-là étaient treize `badges.push(...)` éparpillés dans le rendu.
   Chaque surface les RECALCULAIT, et rien ne garantissait que le plateau et
   le flux disent la même chose du même jet.

   UN BADGE EST UNE PROPRIÉTÉ DU JET, PAS DE SON RENDU. D'où : une table
   condition → badge, évaluée une fois sur l'entrée, et toutes les surfaces
   rendent la même liste parce qu'elles lisent la même liste. Une règle qui
   rend "" n'émet rien. L'ordre est l'ordre de lecture et fait partie de la
   déclaration. */
export function createLexicon({ entryBonusDice }) {
  const ROLL_BADGE_RULES = [
    { id: "natural-20", k: "n20", when: (e) => e.natural === 20, text: () => LEX.CRIT20 },
    { id: "natural-1-accepted", k: "chaos", when: (e) => e.natural === 1 && e.natChoice === "accept", text: () => LEX.fumble1 + " accepted" },
    { id: "fate-refused", k: "chaos", when: (e) => e.natChoice === "chaos", text: () => "Fate refused" },
    { id: "chaos-roll", k: "chaos", when: (e) => !!e.chaosRoll, text: (e) => "Chaos 2d6 = " + (e.chaosRoll[0] + e.chaosRoll[1]) },
    /* La ligne sur laquelle les dés sont tombés, citée plutôt que liée — le
       flux est ce que le joueur relit après la séance. */
    { id: "chaos-row", k: "chaos", when: (e) => !!e.chaosRow, text: (e) => e.chaosRow },
    { id: "exhaustion", k: "manual", when: (e) => !!e.exhaustion, text: (e) => "Exhaustion " + e.exhaustion + " · −" + e.exhaustion },
    {
      id: "destiny-spend", k: "destiny", when: (e) => !!e.destiny,
      text: (e) => {
        const spent = e.destiny;
        const change = Number(spent.pointsAfter) - Number(spent.pointsBefore);
        const head = spent.criticalSuccess ? LEX.critInf : spent.criticalFailure ? LEX.fumbleInf : "Destiny d" + spent.sides + "=" + spent.result;
        return head + (isFinite(change) && change ? " · " + (change > 0 ? "+" : "") + change + " pt → " + spent.pointsAfter : "");
      }
    },
    { id: "arcane-fate-refused", k: "chaos", when: (e) => !!(e.destiny && e.destiny.arcaneChoice === "chaos"), text: (e) => "Arcane fate refused · 1 → " + e.destiny.sides },
    { id: "overreach", k: "chaos", when: (e) => !!(e.destiny && e.destiny.chaos), text: (e) => "Overreach " + e.destiny.chaos.overreach + " · save DC " + e.destiny.chaos.dc },
    { id: "destiny-points", k: "destiny", when: (e) => !!e.destinyPointChange, text: (e) => e.destinyPointChange.reason + " · Destiny " + e.destinyPointChange.after },
    { id: "awakening", k: "n20", when: (e) => !!e.awakening, text: () => "ARCANE AWAKENING" },
    {
      id: "manual", k: "manual",
      when: (e) => !!e.d20Forced || !!(e.destiny && e.destiny.forced)
        || entryBonusDice(e).some((die) => die.forced)
        || (e.dice || []).some((die) => die.forced),
      text: () => "MANUAL"
    },
    { id: "adjusted", k: "adjusted", when: (e) => !!e.adjusted, text: () => "adjusted" }
  ];

  function rollBadges(entry) {
    if (!entry) return [];
    const badges = [];
    ROLL_BADGE_RULES.forEach((rule) => {
      if (!rule.when(entry)) return;
      const text = rule.text(entry);
      if (text == null || text === "") return;
      badges.push({ t: String(text), k: rule.k, id: rule.id, spoiler: !!SPOILER_BADGE_KINDS[rule.k] });
    });
    return badges;
  }

  function entryTotal(entry) {
    /* L'Épuisement est estampillé sur l'entrée au moment du jet, pas lu en
       direct : changer le niveau plus tard ne doit pas réécrire un jet déjà
       dans le flux. */
    let total = (Number(entry.kept) || 0) + (Number(entry.baseBonus) || 0)
      + (entry.plusTwo ? 2 : 0) + (Number(entry.custom) || 0) - (Number(entry.exhaustion) || 0);
    const bonusDice = entryBonusDice(entry);
    if (bonusDice.length) bonusDice.forEach((die) => { total += Number(die.result) || 0; });
    else [entry.guidance, entry.bardic].forEach((die) => { if (die) total += Number(die.result) || 0; });
    if (entry.destiny) total += Number(entry.destiny.result) || 0;
    return total;
  }

  function rollParts(entry) {
    const parts = [];
    if (entry.kind === "d20") {
      const mode = entry.d20Mode && entry.d20Mode !== "flat"
        ? " (" + (entry.d20Mode === "advantage" ? "adv" : entry.d20Mode === "choice" ? "A/D" : "dis") + ")" : "";
      let value = (entry.d20s || []).join(" / ");
      if ((entry.d20s || []).length > 1) value += " → " + entry.kept;
      if (entry.transformed) value = (entry.originalKept != null ? entry.originalKept : 1) + " → Fate refused → 20";
      parts.push({ k: "d20" + mode + (entry.d20Forced ? " · MANUAL" : ""), v: value });
      parts.push({ k: entry.name, v: signed(entry.baseBonus) });
      entryBonusDice(entry).forEach((die) => parts.push({ k: die.label + " d" + die.sides + (die.forced ? " · MANUAL" : ""), v: String(die.result) }));
      if (entry.plusTwo) parts.push({ k: "FH", v: "+2" });
      if (entry.exhaustion) parts.push({ k: "Exhaustion " + entry.exhaustion, v: "−" + entry.exhaustion });
      if (entry.custom) parts.push({ k: "Mod", v: signed(entry.custom) });
      if (entry.destiny) parts.push({ k: "Destiny d" + entry.destiny.sides + (entry.destiny.forced ? " · MANUAL" : ""), v: String(entry.destiny.result) });
    } else if (entry.kind === "tray") {
      (entry.dice || []).forEach((die) => parts.push({ k: "d" + die.sides, v: String(die.result) }));
      if (entry.flatBonus) parts.push({ k: "Overreach", v: signed(entry.flatBonus) });
    } else if (entry.destiny) {
      parts.push({ k: "Destiny d" + entry.destiny.sides, v: String(entry.destiny.result) });
    }
    return parts;
  }

  /* ── §5 Le texte du Ruling ──────────────────────────────────────────
     La ligne au-dessus d'un jet résolu :

       ∞ CRITICAL   Destiny d8 rolled 8 · Lost 1 Destiny Point · Current 5

     Un verdict, puis le COMPTE — ce qui a été lancé, ce que ça a coûté, où ça
     vous laisse. CE N'EST JAMAIS DE LA SAVEUR. Le nom a été choisi contre
     « texte narratif » exactement pour ça : appelez un champ narratif et dans
     six mois quelqu'un y écrit « la lame siffle dans le noir », et le jour où
     il faut vérifier pourquoi on a perdu quatre points de Destinée, le fait
     est noyé dans la prose.

     `account` est le compte COMPLET (avec l'énumération des dés), pour le flux
     et le titre au survol. `display` est le même compte SANS elle : à l'écran
     les dés parlent d'eux-mêmes (lot texte T1). */
  function rollRuling(entry) {
    if (!entry) return { verdict: "", verdictId: "", title: "Roll", account: [], display: [] };
    const found = rollVerdict(entry);
    const verdict = found ? found.verdict : "";
    const title = (entry.name || "Roll") + (entry.total == null ? "" : " " + entry.total);
    const head = verdict ? [title] : [];
    const parts = rollParts(entry).map((part) => part.k + " " + part.v);
    const tail = [];
    const spent = entry.destiny;
    if (spent) {
      const change = Number(spent.pointsAfter) - Number(spent.pointsBefore);
      if (isFinite(change) && change) {
        const moved = Math.abs(change);
        tail.push((change < 0 ? "Lost " : "Gained ") + moved + " Destiny Point" + (moved === 1 ? "" : "s"));
        tail.push("Current " + spent.pointsAfter);
      }
    }
    if (entry.destinyPointChange) tail.push(entry.destinyPointChange.reason + " · Destiny " + entry.destinyPointChange.after);
    if (rollHasDc(entry) && entry.dc != null) tail.push("DC " + entry.dc);
    /* L87 : la déduplication comparait des TEXTES, et le jour où le verdict a
       été renommé sans que son badge le soit, la comparaison a cessé de
       matcher et le flanc a re-énoncé le même fait sous deux noms. L'id de
       règle est le jeton que les deux côtés partagent déjà. */
    return { verdict, verdictId: found ? found.id : "", title, account: head.concat(parts, tail), display: head.concat(tail) };
  }

  /* La seule dérivation que toute surface appelle. Badges et Ruling sortent
     de la même entrée dans la même passe, donc une surface ne peut pas lire
     l'un sans l'autre ni calculer l'un des deux pour son compte. */
  function rollVocabulary(entry) {
    const ruling = rollRuling(entry);
    return { badges: rollBadges(entry), ruling, verdict: ruling.verdict };
  }

  return { ROLL_BADGE_RULES, rollBadges, entryTotal, rollParts, rollRuling, rollVocabulary };
}
