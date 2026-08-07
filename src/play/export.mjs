/* Les deux formats qui sortent du bloc `play`, portés tels quels :

   - `fh-roll/1` — la VUE. Ce qu'un autre dock dessine : titre, total, badges,
     parts, et les dés à plat. Additif par contrat : une vieille ligne à qui
     manque un champ se rend sans lui (dégradation gracieuse), elle ne casse
     pas.
   - `intent` — la MACHINE. « Natural 20 » est de l'affichage ; un programme a
     besoin de `critical-success`. Ce qui est réellement indécis reste `null`
     plutôt que de deviner un verdict : un 20 naturel sans DD est un beau jet,
     pas une réussite déclarée.

   Portés de fh-phb `docs/javascripts/fh-player-sheet.js` (main). L'identité de
   table (campagne, personnage) est passée en argument : elle appartient au
   bloc `table`, pas à `play`. */

export function createExport({ trayDiceFromEntry, rollParts, rollBadges, rollRuling, entryBonusDice }) {
  /* Les dés d'un jet, à plat pour le fil. Le plateau est la surface partagée
     de la table, donc le dock d'un autre joueur les dessine au lieu de
     deviner des dés dans les chaînes d'affichage. */
  function rollExportDice(entry) {
    return trayDiceFromEntry(entry).map((die) => ({
      sides: die.sides || null,
      result: die.result == null ? null : Number(die.result),
      label: die.label || "",
      role: die.kind === "modifier" ? "modifier" : (die.dieRole || "base"),
      source: die.sourceIcon || "",
      dropped: !!die.dropped,
      colour: die.colour || "",
      tone: die.tone || "",
      special: die.special || ""
    }));
  }

  function rollExport(entry, { campaign = "", character = "" } = {}) {
    return {
      schema: "fh-roll/1", id: entry.id, ts: entry.createdAt, campaign, character,
      kind: entry.kind, title: entry.name, ability: entry.ability || null,
      total: entry.total,
      dc: entry.dc === "" || entry.dc == null ? null : Number(entry.dc),
      outcome: entry.outcome || null,
      natural: entry.natural == null ? null : entry.natural,
      bonus: entry.kind === "d20" ? Number(entry.baseBonus) || 0 : null,
      parts: rollParts(entry),
      badges: rollBadges(entry).map((badge) => badge.t),
      /* Les ids des badges et celui du verdict, pour qu'un AUTRE dock
         déduplique une ligne de fil par jeton plutôt que par texte — le même
         correctif que L87, une surface plus loin. */
      badgeIds: rollBadges(entry).map((badge) => badge.id),
      verdictId: rollRuling(entry).verdictId || null,
      dice: rollExportDice(entry)
    };
  }

  function intentOutcome(entry) {
    if (entry.destiny && entry.destiny.criticalFailure) return "critical-failure";
    if (entry.destiny && entry.destiny.criticalSuccess) return "critical-success";
    if (entry.natChoice === "chaos" || entry.natural === 20) return "critical-success";
    if (entry.natural === 1) return entry.natChoice === "accept" ? "critical-failure" : null;
    if (entry.dc !== "" && entry.dc != null && isFinite(Number(entry.dc))) return entry.total >= Number(entry.dc) ? "success" : "failure";
    return null;
  }

  function intentFor(entry) {
    if (entry.kind !== "d20") return null;
    return {
      kind: "check", check: entry.name || null, ability: entry.ability || null,
      total: Number(entry.total) || 0,
      natural: entry.natural == null ? null : entry.natural,
      dc: entry.dc === "" || entry.dc == null ? null : Number(entry.dc),
      outcome: intentOutcome(entry)
    };
  }

  /* La signature de ce que la table peut RÉELLEMENT voir. Un jet ouvert peut
     légitimement se régler plusieurs fois (il accrète des dés stagés), d'où
     les révisions : régler une entrée inchangée ne coûte rien. */
  function rollSignature(entry) {
    return [
      entry.total, entry.outcome || "", entry.natural == null ? "" : entry.natural,
      entry.dc === "" || entry.dc == null ? "" : entry.dc, entry.adjusted ? 1 : 0,
      entry.natChoice || "", entryBonusDice(entry).length,
      entry.destiny ? entry.destiny.result : ""
    ].join("|");
  }

  return { rollExportDice, rollExport, intentOutcome, intentFor, rollSignature };
}
