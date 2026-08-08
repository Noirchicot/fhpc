/* Les tables de Chaos — lues, jamais embarquées.

   En v1 la table était un global (`window.FH_CHAOS`, généré par
   sync_from_vault.py) et le dock lisait la ligne à voix haute au lieu de
   pointer le chapitre. Ici elle est INJECTÉE : le moteur sait lire une table,
   il n'en possède aucune. Deux raisons, pas une :

   1. plus de `window` (loi du lot C) ;
   2. le contenu Fate's Hand est l'IP d'Eric et n'entre pas dans le dépôt
      public à ce stade (KICKOFF §0.8, et §3 : « aucun contenu FH, il arrive
      avec Eric au M2 »).

   DÉPLACÉ PAR LE LOT 5 de `src/play/` vers `src/modules/fh/` : le Chaos est une
   mécanique maison, et `src/play/` ne doit plus en porter une seule ligne
   (loi §0.12). Le fichier lui-même n'a pas changé de comportement — seuls ses
   deux textes de dégradation sont passés par le paquet de libellés (§0.13).

   Forme attendue, identique à la v1 :
     { max: 12, tables: { STR: { name, rows: { "1": "…", … "12": "…" } }, … } }

   Une table absente dégrade vers le renvoi (« read the … Chaos table »),
   jamais vers un plantage — et jamais en silence : la phrase le dit. */

import { clamp } from "../../play/utils.mjs";

export function createChaos(chaosTables, labels) {
  const data = chaosTables && typeof chaosTables === "object" ? chaosTables : null;
  const t = labels;

  function chaosTableFor(ability) {
    if (!data || !data.tables) return null;
    return data.tables[String(ability || "").slice(0, 3).toUpperCase()] || null;
  }

  /* La table s'arrête à 12 et les dés non : au-delà, on lit la dernière
     ligne. En deçà de 1, la première. */
  function chaosRowText(ability, total) {
    const table = chaosTableFor(ability);
    if (!table) return "";
    const top = Number(data && data.max) || 12;
    return table.rows[String(clamp(total, 1, top))] || "";
  }

  function chaosVerdict(ability, total) {
    const row = chaosRowText(ability, total);
    const top = Number(data && data.max) || 12;
    const capped = total > top ? t("fh.chaos.capped", { max: top }) : "";
    return row ? row + capped : t("fh.chaos.unknown-table", { ability });
  }

  return { chaosTableFor, chaosRowText, chaosVerdict };
}
