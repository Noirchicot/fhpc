/* ══ LE VOCABULAIRE DE LA COUCHE FATE'S HAND ═════════════════════════
   Ce que la couche AJOUTE à la table de jugement SRD : ses verdicts, ses
   badges, son jeton de source, ses parts, sa contribution au total, ses dés
   dans le plateau, et sa part de la signature de règlement.

   Rien ici n'est appelé par le chemin commun : `createLexicon` et
   `createDiceKit` reçoivent ces déclarations comme des DONNÉES et les
   insèrent par priorité. Débranchez la couche et la table redevient courte —
   sans un `if` à retirer nulle part.

   LES PRIORITÉS SONT CELLES DE L'ORDRE V1. La table v1 était un tableau et
   son ordre portait le sens du jugement : un critique arcanique prime un 20
   naturel. Les nombres reproduisent cet ordre exactement, avec des trous entre
   les règles SRD pour que la couche s'y glisse sans qu'aucune ne bouge. */

/* ── §1 Le jeton de source ───────────────────────────────────────────
   `destiny` n'est pas dans SEALABLE_SOURCES et ne doit pas y entrer : un dé de
   Destinée se prend dans la réserve, ce n'est pas un autocollant (D.3). */
export const FH_SOURCES = {
  destiny: { key: "destiny", labelId: "source.destiny", tone: "destiny", glyph: "destiny" }
};

/* ── §5 Les verdicts de la couche ────────────────────────────────────
   Les chaînes `outcome` sont celles de la v1, au bit près : elles sont lues
   par des programmes (le fil, `intentOutcome`, les docks des autres joueurs).
   Ce qui a changé, c'est que le MOT n'est plus ici — il est dans le paquet. */
export const FH_VERDICTS = [
  { id: "arcane-critical-failure", priority: 10, when: (e) => !!(e.destiny && e.destiny.criticalFailure), outcome: "Critical failure", intent: "critical-failure" },
  { id: "arcane-critical-success", priority: 20, when: (e) => !!(e.destiny && e.destiny.criticalSuccess), outcome: "Critical success", intent: "critical-success" },
  { id: "fate-refused", priority: 30, when: (e) => e.natChoice === "chaos", outcome: "Critical success · Chaos", intent: "critical-success" },
  { id: "natural-1-accepted", priority: 55, when: (e) => e.natural === 1 && e.natChoice === "accept", outcome: "Critical failure · Fate accepted", intent: "critical-failure" },
  /* Un 1 auquel personne n'a encore répondu est indécis, et le Ruling le dit
     plutôt que de choisir à la place du joueur. Il passe DEVANT le verdict SRD
     `natural-1` (60), qui se contente de rapporter le dé : tant que la couche
     est montée, c'est elle qui parle d'un 1. */
  { id: "natural-1-open", priority: 57, when: (e) => e.natural === 1, outcome: "Natural 1 · choose fate", intent: null }
];

/* ── §3 Les badges de la couche ──────────────────────────────────────
   `data` rend les FAITS, le paquet rend les mots (§0.13). Une règle qui rend
   `null` n'émet rien. */
export const FH_BADGES = [
  { id: "natural-1-accepted", k: "chaos", spoiler: true, priority: 20, when: (e) => e.natural === 1 && e.natChoice === "accept", data: () => ({}) },
  { id: "fate-refused", k: "chaos", spoiler: true, priority: 30, when: (e) => e.natChoice === "chaos", data: () => ({}) },
  { id: "chaos-roll", k: "chaos", spoiler: true, priority: 40, when: (e) => !!e.chaosRoll, data: (e) => ({ total: e.chaosRoll[0] + e.chaosRoll[1] }) },
  /* La ligne sur laquelle les dés sont tombés, citée plutôt que liée — le flux
     est ce que le joueur relit après la séance. */
  { id: "chaos-row", k: "chaos", spoiler: true, priority: 50, when: (e) => !!e.chaosRow, data: (e) => ({ row: e.chaosRow }) },
  {
    id: "destiny-spend", k: "destiny", spoiler: true, priority: 70, when: (e) => !!e.destiny,
    data: (e) => {
      const spent = e.destiny;
      const change = Number(spent.pointsAfter) - Number(spent.pointsBefore);
      return {
        sides: spent.sides, result: spent.result,
        criticalSuccess: !!spent.criticalSuccess, criticalFailure: !!spent.criticalFailure,
        change: isFinite(change) ? change : 0, pointsAfter: spent.pointsAfter
      };
    }
  },
  { id: "arcane-fate-refused", k: "chaos", spoiler: true, priority: 80, when: (e) => !!(e.destiny && e.destiny.arcaneChoice === "chaos"), data: (e) => ({ sides: e.destiny.sides }) },
  { id: "overreach", k: "chaos", spoiler: true, priority: 90, when: (e) => !!(e.destiny && e.destiny.chaos), data: (e) => ({ overreach: e.destiny.chaos.overreach, dc: e.destiny.chaos.dc }) },
  { id: "destiny-points", k: "destiny", spoiler: true, priority: 100, when: (e) => !!e.destinyPointChange, data: (e) => ({ reason: e.destinyPointChange.reason, after: e.destinyPointChange.after }) },
  { id: "awakening", k: "n20", spoiler: true, priority: 110, when: (e) => !!e.awakening, data: () => ({}) }
];

/* ── Ce que la couche ajoute au TOTAL ────────────────────────────────
   Le chemin commun additionne ce qu'on lui donne : il ne sait pas qu'un dé de
   Destinée ou un +2 maison existent. */
export function fhTotal(entry) {
  let extra = 0;
  if (entry.plusTwo) extra += 2;
  if (entry.destiny) extra += Number(entry.destiny.result) || 0;
  return extra;
}

/* ── Ce que la couche ajoute aux PARTS et au compte du Ruling ───────── */
export function fhParts(entry, t) {
  const parts = [];
  if (entry.plusTwo) parts.push({ k: t("part.fh-bonus"), v: "+2" });
  if (entry.destiny && entry.kind !== "destiny") {
    parts.push({ k: t("part.destiny", { sides: entry.destiny.sides, forced: !!entry.destiny.forced }), v: String(entry.destiny.result) });
  }
  if (entry.kind === "destiny" && entry.destiny) {
    parts.push({ k: t("part.destiny", { sides: entry.destiny.sides, forced: false }), v: String(entry.destiny.result) });
  }
  if (entry.kind === "tray" && entry.flatBonus) {
    parts.push({ k: t("part.overreach"), v: (entry.flatBonus >= 0 ? "+" : "") + entry.flatBonus });
  }
  return parts;
}

/* Comment se lit un d20 que la couche a réécrit : « 1 → Fate refused → 20 ».
   Le chemin commun ne connaît pas cette phrase, il demande. */
export function fhBaseValue(entry, t) {
  if (!entry.transformed) return null;
  return t("part.fate-refused", { original: entry.originalKept != null ? entry.originalKept : 1 });
}

export function fhRulingTail(entry, t) {
  const tail = [];
  const spent = entry.destiny;
  if (spent) {
    const change = Number(spent.pointsAfter) - Number(spent.pointsBefore);
    if (isFinite(change) && change) {
      tail.push(t("fh.event.points-moved", { change }));
      tail.push(t("fh.event.points-current", { points: spent.pointsAfter }));
    }
  }
  if (entry.destinyPointChange) {
    tail.push(t("badge.destiny-points", { reason: entry.destinyPointChange.reason, after: entry.destinyPointChange.after }));
  }
  return tail;
}

/* ── Ce que la couche met dans le PLATEAU ────────────────────────────
   Trois contributions, une par forme :
   - `trayDice`   : les dés qu'elle ajoute à un jet de d20 ;
   - `decorateBase` : la réécriture d'un d20 déjà tombé (le 1 qui se lit 20) ;
   - `trayDiceForKind` : les sortes d'entrée qui lui appartiennent en propre. */
export function fhTrayDice(entry, { trayDiceForPlan, t }) {
  const dice = [];
  if (entry.destiny) {
    trayDiceForPlan(entry.destiny, t("fh.tray.destiny"), {
      dieRole: "destiny",
      special: entry.destiny.criticalSuccess ? "arcane-critical-success" : entry.destiny.criticalFailure ? "arcane-critical-failure" : ""
    }).forEach((item) => dice.push(item));
  }
  if (entry.plusTwo) dice.push({ kind: "modifier", result: 2, label: t("fh.tray.fh-bonus") });
  return dice;
}

export function fhDecorateBase(entry, base, { plan, t }) {
  if (!entry.transformed) return;
  base.forEach((die, index) => {
    if (index === Number(plan.chosenIndex)) { die.label = t("fh.tray.original-d20"); die.dropped = true; }
  });
  base.push({ sides: 20, result: 20, label: t("fh.tray.fate-1-20"), natural: 20, special: "transformed" });
}

export function fhTrayDiceForKind(entry, { trayDiceForPlan, t }) {
  if (entry.kind !== "destiny") return null;
  return trayDiceForPlan(entry.destiny, t("fh.tray.destiny"), {
    dieRole: "destiny",
    special: entry.destiny.criticalSuccess ? "arcane-critical-success" : entry.destiny.criticalFailure ? "arcane-critical-failure" : ""
  });
}

/* Ce que la couche met dans la SIGNATURE de règlement : sans elle, dépenser
   un dé de Destinée sur un jet déjà réglé ne se verrait pas passer sur le fil. */
export function fhSignature(entry) {
  return [
    entry.natChoice || "",
    entry.destiny ? entry.destiny.result : "",
    entry.destiny && entry.destiny.arcaneChoice ? entry.destiny.arcaneChoice : ""
  ].join(",");
}
