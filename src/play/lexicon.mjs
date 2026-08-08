/* ══ LE LEXIQUE DE JET — LA MOITIÉ SRD ═══════════════════════════════
   Porté de fh-phb `docs/javascripts/fh-player-sheet.js` (main), §1 « source
   tokens », §3 « badges », §5 « verdicts / Ruling ». UI-ROLL-VOCABULARY.md,
   ratifié 2026-08-02. RECOUPÉ par le lot 5.

   Tout ce qui suit est DÉCLARÉ UNE FOIS et lu par toutes les surfaces. Trois
   surfaces qui dessinent chacune leur badge, ce sont trois vérités sur le même
   jet. C'est la raison d'être de ce fichier, et la raison pour laquelle il ne
   dessine rien lui-même.

   DEUX LIGNES COUPENT CE FICHIER, ET ELLES SONT DIFFÉRENTES :

   1. **SRD / FH** (loi §0.12). Ce fichier ne déclare QUE des règles SRD. Les
      verdicts et badges de Destinée, de Chaos, d'Éveil et de refus du destin
      sont apportés par la couche (`src/modules/fh/lexicon.mjs`) et insérés par
      PRIORITÉ dans la même table. Un personnage SRD pur produit la table
      courte, et rien dans ce fichier ne cite une mécanique maison.

   2. **Identifiants / mots** (loi §0.13). Une règle porte un `id` et un
      `priority` ; elle ne porte AUCUN mot. Les mots vivent dans un paquet de
      libellés (`labels.mjs`) que `derive` applique à la frontière. Avant le
      lot 5, `verdict: "FATE REFUSED"` était écrit en dur au milieu de
      verdicts qui passaient déjà, eux, par la table.

   CE QUI N'A PAS BOUGÉ, ET NE DOIT PAS : les chaînes `outcome` sont LUES PAR
   DES PROGRAMMES (le fil, les docks des autres joueurs, `intentOutcome` qui
   les regex-match). Elles restent gelées au bit près. Renommer ce que lit un
   humain ; geler ce que lit un programme. */

import { signed } from "./utils.mjs";

/* ── §1 Jetons de source ────────────────────────────────────────────
   Chaque dé porte sa provenance. Un jeton par source, ici, une fois.
   LE GLYPHE PORTE L'IDENTITÉ, LA COULEUR NE FAIT QUE LA RENFORCER : à 12px,
   bleu et violet ne se distinguent pas de façon fiable. `tone` ne voyage donc
   jamais sans `glyph`/`letter`. Le libellé, lui, est devenu un ID (§0.13). */
export const SRD_ROLL_SOURCES = {
  guidance: { key: "guidance", labelId: "source.guidance", tone: "guidance", glyph: "guidance" },
  bardic: { key: "bardic", labelId: "source.bardic", tone: "bardic", glyph: "bardic" },
  tactical: { key: "tactical", labelId: "source.tactical", tone: "tactical", glyph: "tactical" },
  "other-1": { key: "other-1", labelId: "source.other-1", tone: "bonus", letter: "I" },
  "other-2": { key: "other-2", labelId: "source.other-2", tone: "bonus", letter: "II" },
  "other-3": { key: "other-3", labelId: "source.other-3", tone: "bonus", letter: "III" }
};

export const UNKNOWN_SOURCE = { key: "", labelId: "source.unknown", tone: "bonus", glyph: "other" };

/* ── D.3 — CE QU'UN JOUEUR PEUT SCELLER SUR UN DÉ BONUS ──────────────
   La liste tombe de six à DEUX, et c'est une vraie coupe, pas un ménage.

   Sous la définition tranchée par Eric le 2026-08-08, un dé de correction est
   un dé qu'on dépense APRÈS COUP sur un jet déjà connu comme raté, adossé à
   une ressource comptée. Seuls `bardic` (Barde, SRD) et `tactical` (Guerrier
   niveau 2 — Tactical Mind, SRD) répondent à cette définition.

   Ce qui est parti, et pourquoi :
   - `guidance` : le sort se lance AVANT le jet. C'est un bonus de MONTAGE, pas
     une correction — il a sa propre porte (`mountDie`, D.1 ligne 3). Le
     sceller après coup était précisément la confusion que D.1 existe pour
     empêcher.
   - `other-1`, `other-2`, `other-3` : de l'habillage d'affichage. Un dé bonus
     anonyme garde son jeton de source (il faut bien le nommer sur le plateau),
     mais « sceller un Bonus II » ne décrit aucune mécanique.

   Supprimé, pas désactivé (loi §0.6). `destiny` reste absent pour la raison
   qu'il a toujours eue : un dé de Destinée se prend dans la réserve, ce n'est
   pas un autocollant — et il n'existe qu'avec la couche FH montée. */
export const SEALABLE_SOURCES = ["bardic", "tactical"];

/* Les dés de correction, avec leur fenêtre et leur remboursement. C'est la
   table que `addDie` (D.1, verbe n°1) consulte, et elle est SRD de bout en
   bout : les deux sources citées sont dans `fh-srd/exports/srd/en/class.json`.

   `refundIfStillFails` : Tactical Mind n'est PAS dépensé si le test échoue
   quand même (SRD, Guerrier niv. 2 — « If the check still fails, this use of
   Second Wind isn't expended »). Bardic, lui, « is expended when it's rolled »,
   sans condition. Les deux phrases sont dans la source ; c'est la seule raison
   pour laquelle ce champ existe (D.4). */
export const CORRECTION_DICE = {
  bardic: { key: "bardic", sides: 6, refundIfStillFails: false, appliesTo: ["check", "attack", "spell"] },
  tactical: { key: "tactical", sides: 10, refundIfStillFails: true, appliesTo: ["check"] }
};

/* ── §5 Les verdicts SRD ─────────────────────────────────────────────
   Une table, deux lectures, et c'est tout l'intérêt. `outcome` est la chaîne
   face-machine que le fil et les tons consomment déjà ; le mot que le Ruling
   dit à voix haute est désormais un ID résolu par le paquet de libellés.

   `priority` A REMPLACÉ L'ORDRE DU TABLEAU, et il porte le même sens : c'est
   l'ordre de JUGEMENT. Un critique arcanique prime un 20 naturel, et un DD
   n'est consulté que si rien de plus fort ne s'est produit. Les nombres
   laissent des trous exprès : une couche s'insère entre deux règles SRD sans
   qu'aucune des deux ne bouge. */
export const SRD_VERDICTS = [
  /* Un 20 / un 1 naturel sur un jet d'ATTAQUE sont des règles SRD à part
     entière (`srd:glossary:en:critical-hit`, p.179). Sur les autres tests de
     d20, le SRD ne leur donne aucun effet : les deux règles ci-dessous ne se
     déclenchent donc que sur le type `attack`. */
  { id: "critical-hit", priority: 40, when: (e) => e.rollType === "attack" && e.natural === 20, outcome: "Critical hit", intent: "critical-success" },
  { id: "critical-miss", priority: 45, when: (e) => e.rollType === "attack" && e.natural === 1, outcome: "Critical miss", intent: "critical-failure" },
  /* Sur un test ordinaire, un naturel extrême ne DÉCIDE rien — il RAPPORTE ce
     que le dé a fait. C'est ce qui lui permet de rester SRD : il ne réclame
     aucune conséquence. Le `intent` d'un 20 est gelé depuis la v1 (les docks
     des autres joueurs le lisent) ; un 1 nu, lui, ne prétend rien : `null`. */
  { id: "natural-20", priority: 50, when: (e) => e.natural === 20, outcome: "Natural 20", intent: "critical-success" },
  { id: "natural-1", priority: 60, when: (e) => e.natural === 1, outcome: "Natural 1", intent: null },
  /* ⚠️ `rollWasMade` : un sort à sauvegarde n'a PAS de jet du lanceur — c'est
     la CIBLE qui lance, et son dé n'est pas dans ce document. Comparer le
     total du lanceur (zéro) à son propre DD de sauvegarde donnerait « échec »
     à chaque boule de feu. Le seuil reste affiché ; le verdict, lui, attend un
     dé qui a été lancé. */
  { id: "success", priority: 70, when: (e) => rollWasMade(e) && rollHasThreshold(e) && e.total >= rollThreshold(e), outcome: "Success", intent: "success" },
  { id: "failure", priority: 80, when: (e) => rollWasMade(e) && rollHasThreshold(e), outcome: "Failure", intent: "failure" }
];

/* Le seuil d'un jet : le DD d'une compétence, la CA d'une attaque, le DD de
   sauvegarde d'un sort. Un seul nom pour la même idée — sans quoi `success`
   devrait citer trois champs et le troisième serait oublié le jour où il
   arriverait. */
export function rollThreshold(entry) {
  if (!entry) return NaN;
  const raw = entry.rollType === "attack" ? entry.ac : entry.rollType === "spell" ? entry.saveDc : entry.dc;
  return Number(raw);
}
export function rollHasThreshold(entry) {
  if (!entry) return false;
  const raw = entry.rollType === "attack" ? entry.ac : entry.rollType === "spell" ? entry.saveDc : entry.dc;
  return raw !== "" && raw != null && isFinite(Number(raw));
}
/* Un jet a-t-il été LANCÉ par celui qui possède cette entrée ? Un sort à
   sauvegarde répond non : le d20 appartient à la cible. */
export function rollWasMade(entry) {
  return !!entry && (entry.kept != null || entry.natural != null);
}

/* Le nom historique, gardé : `dc` reste ce que 90 % des jets utilisent et ce
   que les surfaces appellent déjà. */
export const rollHasDc = rollHasThreshold;

/* ── §3 Badges SRD : dérivés, pas émis ───────────────────────────────
   Ces règles étaient autant de `badges.push(...)` éparpillés dans le rendu.
   Chaque surface les RECALCULAIT, et rien ne garantissait que le plateau et le
   flux disent la même chose du même jet.

   UN BADGE EST UNE PROPRIÉTÉ DU JET, PAS DE SON RENDU. D'où : une table
   condition → badge, évaluée une fois sur l'entrée, et toutes les surfaces
   rendent la même liste parce qu'elles lisent la même liste. Une règle qui
   rend `null` n'émet rien. Le `priority` est l'ordre de lecture et fait partie
   de la déclaration.

   `data` remplace `text` : la règle rend les FAITS, le paquet rend les mots. */
export function srdBadgeRules({ entryBonusDice }) {
  return [
    /* `spoiler` : ce badge rapporte ce que le jet a DONNÉ, par opposition à la
       façon dont il a été monté — une ligne encore en l'air doit le taire.
       REWRITTEN (lot 5) : c'était une table de FAMILLES (`SPOILER_BADGE_KINDS`)
       tenue à côté des règles, et deux de ses trois entrées étaient des noms de
       mécaniques maison — dans le moteur SRD. Le drapeau est descendu SUR la
       règle, où il a toujours voulu être : c'est la règle qui sait si elle
       divulgue un résultat. */
    { id: "natural-20", k: "n20", priority: 10, spoiler: true, when: (e) => e.natural === 20, data: () => ({}) },
    { id: "exhaustion", k: "manual", priority: 60, when: (e) => !!e.exhaustion, data: (e) => ({ level: e.exhaustion, penalty: Math.abs(Number(e.exhaustionPenalty) || Number(e.exhaustion)) }) },
    /* Ce qu'une relance a réellement changé, sur la ligne du jet : sans lui, un
       Point d'inspiration héroïque dépensé serait invisible dans le flux. */
    { id: "rerolled", k: "adjusted", priority: 115, when: (e) => !!(e.rerolls && e.rerolls.length), data: (e) => {
      const last = e.rerolls[e.rerolls.length - 1];
      return { label: last.label, before: last.before, after: last.after };
    } },
    {
      id: "manual", k: "manual", priority: 120,
      when: (e) => !!e.d20Forced
        || entryBonusDice(e).some((die) => die.forced)
        || (e.dice || []).some((die) => die.forced),
      data: () => ({})
    },
    { id: "adjusted", k: "adjusted", priority: 130, when: (e) => !!e.adjusted, data: () => ({}) }
  ];
}

/* ── L'ASSEMBLAGE ────────────────────────────────────────────────────
   Le lexique d'une séance est le lexique SRD PLUS ce que les modules montés
   apportent, trié par priorité. Une couche ne remplace jamais la table : elle
   s'y insère. Deux règles sur la même priorité est une ambiguïté, et elle
   jette ici plutôt que de dépendre de l'ordre de montage. */
function assemble(base, extra, what) {
  const all = base.concat(extra || []);
  const seen = new Map();
  all.forEach((rule) => {
    if (seen.has(rule.priority)) {
      throw new Error(
        "fhpc/play: two " + what + ' rules share priority ' + rule.priority +
        ' ("' + seen.get(rule.priority) + '" and "' + rule.id + '") — the judgement order must not depend on mount order'
      );
    }
    seen.set(rule.priority, rule.id);
  });
  return all.sort((a, b) => a.priority - b.priority);
}

export function createLexicon({ entryBonusDice, labels, modules = [] }) {
  const t = labels;

  const ROLL_SOURCES = Object.assign({}, SRD_ROLL_SOURCES);
  modules.forEach((module) => Object.assign(ROLL_SOURCES, module.sources || {}));

  const ROLL_VERDICTS = assemble(SRD_VERDICTS, modules.flatMap((m) => m.verdicts || []), "verdict");
  const ROLL_BADGE_RULES = assemble(srdBadgeRules({ entryBonusDice }), modules.flatMap((m) => m.badges || []), "badge");
  /* Ce que les modules ajoutent au TOTAL, aux PARTS, aux DÉS du plateau et à
     la SIGNATURE de règlement. Le chemin commun ne cite ainsi jamais un dé de
     Destinée ni un +2 maison : il additionne ce qu'on lui donne. */
  const totalHooks = modules.map((m) => m.total).filter(Boolean);
  const partHooks = modules.map((m) => m.parts).filter(Boolean);
  const tailHooks = modules.map((m) => m.rulingTail).filter(Boolean);
  /* Une mécanique qui a RÉÉCRIT le d20 dit ici comment il se lit. Sans ce
     crochet, le chemin commun devrait porter la phrase « 1 → Fate refused →
     20 », c'est-à-dire citer une règle maison dans sa propre dérivation. */
  const baseValueHooks = modules.map((m) => m.baseValue).filter(Boolean);
  const signatureHooks = modules.map((m) => m.signature).filter(Boolean);

  function rollSource(key) { return ROLL_SOURCES[String(key || "")] || UNKNOWN_SOURCE; }
  function sourceLabel(key) { return t(rollSource(key).labelId); }
  /* Le nom qu'un dé scellé prend, lu sur la table des sources — un nom par
     source, ici comme partout ailleurs. */
  function sealLabel(seal) {
    const source = ROLL_SOURCES[String(seal || "")];
    return source ? t(source.labelId) : t("seal.unknown");
  }

  function rollVerdict(entry) {
    if (!entry) return null;
    for (let i = 0; i < ROLL_VERDICTS.length; i++) if (ROLL_VERDICTS[i].when(entry)) return ROLL_VERDICTS[i];
    return null;
  }
  function outcomeFor(entry) {
    const found = rollVerdict(entry);
    return found ? found.outcome : "";
  }
  function verdictText(entry) {
    const found = rollVerdict(entry);
    return found ? t("verdict." + found.id) : "";
  }

  function rollBadges(entry) {
    if (!entry) return [];
    const badges = [];
    ROLL_BADGE_RULES.forEach((rule) => {
      if (!rule.when(entry)) return;
      const data = rule.data(entry);
      if (data == null) return;
      const text = t("badge." + rule.id, data);
      if (text == null || text === "") return;
      badges.push({ t: String(text), k: rule.k, id: rule.id, spoiler: !!rule.spoiler });
    });
    return badges;
  }

  function entryTotal(entry) {
    /* L'Épuisement est estampillé sur l'entrée au moment du jet, pas lu en
       direct : changer le niveau plus tard ne doit pas réécrire un jet déjà
       dans le flux. */
    let total = (Number(entry.kept) || 0) + (Number(entry.baseBonus) || 0)
      + (Number(entry.custom) || 0) + (Number(entry.exhaustionPenalty) || 0);
    entryBonusDice(entry).forEach((die) => { total += Number(die.result) || 0; });
    totalHooks.forEach((hook) => { total += Number(hook(entry)) || 0; });
    return total;
  }

  function rollParts(entry) {
    const parts = [];
    if (entry.kind === "d20") {
      const mode = entry.d20Mode && entry.d20Mode !== "flat"
        ? " (" + t("part.mode." + entry.d20Mode) + ")" : "";
      let value = (entry.d20s || []).join(" / ");
      if ((entry.d20s || []).length > 1) value += " → " + entry.kept;
      baseValueHooks.forEach((hook) => { const own = hook(entry, t); if (own != null) value = own; });
      parts.push({ k: "d20" + mode + (entry.d20Forced ? " · " + t("part.manual") : ""), v: value });
      parts.push({ k: entry.name, v: signed(entry.baseBonus) });
      entryBonusDice(entry).forEach((die) => parts.push({ k: die.label + " d" + die.sides + (die.forced ? " · " + t("part.manual") : ""), v: String(die.result) }));
      if (entry.exhaustion) parts.push({ k: t("modifier.exhaustion") + " " + entry.exhaustion, v: String(entry.exhaustionPenalty) });
      if (entry.custom) parts.push({ k: t("modifier.manual"), v: signed(entry.custom) });
    } else if (entry.kind === "tray") {
      (entry.dice || []).forEach((die) => parts.push({ k: "d" + die.sides, v: String(die.result) }));
    }
    partHooks.forEach((hook) => (hook(entry, t) || []).forEach((part) => parts.push(part)));
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
    if (!entry) return { verdict: "", verdictId: "", title: t("tray.roll"), account: [], display: [] };
    const verdict = verdictText(entry);
    const found = rollVerdict(entry);
    const title = (entry.name || t("tray.roll")) + (entry.total == null ? "" : " " + entry.total);
    const head = verdict ? [title] : [];
    const parts = rollParts(entry).map((part) => part.k + " " + part.v);
    const tail = [];
    tailHooks.forEach((hook) => (hook(entry, t) || []).forEach((line) => tail.push(line)));
    if (rollHasThreshold(entry)) {
      tail.push(entry.rollType === "attack" ? t("ruling.ac", { ac: entry.ac }) : t("ruling.dc", { dc: rollThreshold(entry) }));
    }
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

  function moduleSignature(entry) {
    return signatureHooks.map((hook) => String(hook(entry) == null ? "" : hook(entry))).join("|");
  }

  return {
    ROLL_SOURCES, ROLL_VERDICTS, ROLL_BADGE_RULES, SEALABLE_SOURCES,
    rollSource, sourceLabel, sealLabel, rollVerdict, outcomeFor, verdictText,
    rollBadges, entryTotal, rollParts, rollRuling, rollVocabulary, moduleSignature,
    rollHasThreshold, rollThreshold
  };
}
