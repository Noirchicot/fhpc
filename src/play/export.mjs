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
   bloc `table`, pas à `play`.

   RECOUPÉ PAR LE LOT 5. `intentOutcome` énumérait à la main la Destinée, le
   refus du destin et les naturels — une deuxième table de jugement, tenue
   séparément de celle des verdicts, et donc condamnée à en diverger. Elle a
   été supprimée : chaque règle de verdict déclare désormais son `intent`, et
   ce fichier le LIT. Une couche qui ajoute un verdict apporte son intent avec
   lui, et le chemin commun ne cite aucune de ses mécaniques. */

export function createExport({ trayDiceFromEntry, rollParts, rollBadges, rollRuling, entryBonusDice, rollVerdict, rollThreshold, rollHasThreshold, moduleSignature }) {
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
      kind: entry.kind, rollType: entry.rollType || null, title: entry.name, ability: entry.ability || null,
      total: entry.total,
      dc: rollHasThreshold(entry) ? rollThreshold(entry) : null,
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

  /* Une seule table de jugement, lue deux fois. `intent` est déclaré PAR LA
     RÈGLE DE VERDICT ; un verdict sans intent est un verdict qui ne prétend
     rien, et `null` est alors la bonne réponse — pas une devinette. */
  function intentOutcome(entry) {
    const found = rollVerdict(entry);
    return (found && found.intent) || null;
  }

  function intentFor(entry) {
    if (entry.kind !== "d20") return null;
    return {
      kind: entry.rollType === "attack" ? "attack" : entry.rollType === "spell" ? "spell" : "check",
      check: entry.name || null, ability: entry.ability || null,
      total: Number(entry.total) || 0,
      natural: entry.natural == null ? null : entry.natural,
      dc: rollHasThreshold(entry) ? rollThreshold(entry) : null,
      outcome: intentOutcome(entry)
    };
  }

  /* La signature de ce que la table peut RÉELLEMENT voir. Un jet ouvert peut
     légitimement se régler plusieurs fois (il accrète des dés stagés), d'où
     les révisions : régler une entrée inchangée ne coûte rien.

     Ce que les MODULES ajoutent au jet entre dans la signature par leur propre
     contribution — sans quoi dépenser un dé de Destinée sur un jet déjà réglé
     ne se verrait pas passer sur le fil. */
  function rollSignature(entry) {
    return [
      entry.total, entry.outcome || "", entry.natural == null ? "" : entry.natural,
      rollHasThreshold(entry) ? rollThreshold(entry) : "", entry.adjusted ? 1 : 0,
      entryBonusDice(entry).length, (entry.rerolls || []).length,
      (entry.damageDice || []).length,
      moduleSignature ? moduleSignature(entry) : ""
    ].join("|");
  }

  return { rollExportDice, rollExport, intentOutcome, intentFor, rollSignature };
}
