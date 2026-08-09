/* ══ LES MOTS DE LA COUCHE FATE'S HAND ═══════════════════════════════
   Loi §0.13. Le paquet SRD (`src/play/labels.mjs`) porte les mots du jeu de
   base ; celui-ci porte ceux de la couche, et il a le droit d'en PATCHER un —
   c'est ce que fait une couche : elle ajoute des records et elle en patche.

   Deux patches ici, et ils sont ratifiés (lexique Eric, 2026-08-05/06) :
   `verdict.natural-20` et `badge.natural-20` disent « CRITICAL 20 » à une
   table Fate's Hand là où le SRD dit « NATURAL 20 ». Le VERDICT ne bouge pas —
   c'est le même `id`, la même règle, la même chaîne `outcome` sur le fil.
   Seul le mot change, et c'est exactement ce que la loi §0.13 rend possible.

   LA FAMILLE ∞. La grammaire ratifiée est « famille + ce qui l'a produit » :
   le nombre est le résultat naturel du d20, l'∞ est le dé de Destinée. Rien
   d'autre ne peut se lire comme un nom de famille. */

const points = (n) => Math.abs(n) + " Destiny Point" + (Math.abs(n) === 1 ? "" : "s");

export const FH_EN = {
  /* ── Le lexique ratifié (L88, Eric 2026-08-06) ────────────────────
     Les quatre mots ratifiés écrits UNE FOIS : le prochain renommage est une
     édition, pas un inventaire. */
  "fh.crit20": "Crit 20",
  "fh.CRIT20": "CRITICAL 20",
  "fh.fumble1": "Fumble 1",
  "fh.FUMBLE1": "FUMBLE 1",
  "fh.critInf": "∞ critical",
  "fh.CRITINF": "∞ CRITICAL",
  "fh.fumbleInf": "∞ fumble",
  "fh.FUMBLEINF": "∞ FUMBLE",

  /* ── Verdicts ─────────────────────────────────────────────────────── */
  "verdict.natural-20": "CRITICAL 20",
  "verdict.arcane-critical-failure": "∞ FUMBLE",
  "verdict.arcane-critical-success": "∞ CRITICAL",
  "verdict.fate-refused": "FATE REFUSED",
  "verdict.natural-1-accepted": "FUMBLE 1",
  "verdict.natural-1-open": "FUMBLE 1 · CHOOSE",

  /* ── Badges ───────────────────────────────────────────────────────── */
  "badge.natural-20": "CRITICAL 20",
  "badge.natural-1-accepted": "Fumble 1 accepted",
  "badge.fate-refused": "Fate refused",
  "badge.chaos-roll": (d) => "Chaos 2d6 = " + d.total,
  "badge.chaos-row": (d) => d.row,
  "badge.destiny-spend": (d) =>
    (d.criticalSuccess ? "∞ critical" : d.criticalFailure ? "∞ fumble" : "Destiny d" + d.sides + "=" + d.result)
    + (d.change ? " · " + (d.change > 0 ? "+" : "") + d.change + " pt → " + d.pointsAfter : ""),
  "badge.vibration": (d) => "Vibration · d" + d.sides + " · spell level " + d.level,
  /* Le Tilt (lot 21). Le badge dit CE QUI A ÉTÉ DÉCLARÉ puis CE QUE ÇA A
     DONNÉ — les deux, parce que la moitié de la règle est justement que la
     seconde ne se devine pas depuis la première. « 2 Tilts · Advantage »,
     « 1 Tilt · disadvantage · cancelled ». */
  "badge.tilt": (d) => d.tilts + " Tilt" + (d.tilts === 1 ? "" : "s")
    + (d.disadvantage ? " · disadvantage" : "")
    + " · " + (d.outcome === "plus-two" ? "+2"
      : d.outcome === "advantage" ? "Advantage"
        : d.outcome === "disadvantage" ? "Disadvantage" : "cancelled"),
  "badge.arcane-fate-refused": (d) => "Arcane fate refused · 1 → " + d.sides,
  "badge.overreach": (d) => "Overreach " + d.overreach + " · save DC " + d.dc,
  "badge.destiny-points": (d) => d.reason + " · Destiny " + d.after,
  "badge.awakening": "ARCANE AWAKENING",

  /* ── Jetons et sceaux ─────────────────────────────────────────────── */
  "source.destiny": "Destiny",

  /* ── Les parts du Ruling ──────────────────────────────────────────── */
  "part.destiny": (d) => "Destiny d" + d.sides + (d.forced ? " · MANUAL" : ""),
  "part.overreach": "Overreach",
  "part.fh-bonus": "FH",
  "part.fate-refused": (d) => d.original + " → Fate refused → 20",

  /* ── Le plateau ───────────────────────────────────────────────────── */
  "fh.tray.destiny": "Destiny",
  "fh.tray.original-d20": "Original d20",
  "fh.tray.fate-1-20": "FATE 1→20",
  "fh.tray.fh-bonus": "FH bonus",
  "fh.tray.chaos": "Chaos",
  "fh.tray.chaos-die": (d) => "Chaos #" + d.index,
  "fh.tray.chaos-prompt": "Roll 2d6 and read the Chaos table",
  "fh.tray.overreach-save": "Overreach save",
  "fh.tray.overreach-prompt": (d) => "DC " + d.dc + " — roll to hold the Weave",
  "fh.tray.destiny-result": (d) => "Destiny d" + d.sides + " = " + d.result,
  "fh.tray.destiny-choose": "Choose the Destiny result",
  "fh.tray.destiny-chosen": "Destiny result selected",
  "fh.tray.save-label": (d) => d.ability + " save",

  /* ── Ce qu'un refus dit au joueur ─────────────────────────────────── */
  "fh.notice.die-unavailable": "That Destiny die is no longer available.",
  "fh.notice.already-carries": "This roll already carries a Destiny die.",
  "fh.notice.no-pool-die": (d) => "No Destiny d" + d.sides + " is available in the pool.",

  /* ── Les sortes d'entrée que la couche possède ────────────────────── */
  "fh.entry.destiny": (d) => "Destiny d" + d.sides,
  "fh.entry.chaos": (d) => "Chaos" + (d.ability ? " · " + d.ability : "") + (d.name ? " · " + d.name : ""),
  "fh.entry.overreach-save": (d) => "Overreach save" + (d.ability ? " · " + d.ability : ""),
  "fh.outcome.arcane-critical-success": "Arcane Critical Success",
  "fh.outcome.arcane-critical-failure": "Arcane Critical Failure",
  "fh.outcome.chaos-risk": "Chaos risk",
  "fh.outcome.destiny-spent": "Destiny spent",
  "fh.outcome.chaos": (d) => "Chaos " + d.total,

  /* ── LE SCORE DE DESTINÉE, ET SES TERMES DÉRIVÉS (lot 19) ──────────
     Deux mots seulement, et ils sont ici pour une raison de loi : les termes
     que la SÉANCE apporte portent le `label` que l'humain a écrit (règle
     d'Eric, transporté tel quel), mais les termes DÉRIVÉS n'ont personne pour
     les nommer. La maîtrise n'est le `name` d'aucun record ; sans un mot ici,
     le moteur devrait en fabriquer un — la faute exacte que §0.13 interdit.
     C'est la couche qui porte ses mots, et c'est ce fichier.

     La Base d'espèce, elle, RECOPIE le nom du record (« Elf ») dans la phrase
     de la couche : le mot vient de la pile, la phrase vient d'ici. Le bonus de
     Base n'a besoin d'aucune clef — son libellé EST le nom du trait qui le
     porte (« Splinter of Anon »), recopié sans un mot ajouté. */
  "fh.destiny.score": "Destiny Score",
  "fh.destiny.term.proficiency": "Proficiency Bonus",
  "fh.destiny.term.base": (d) => "Destiny Base · " + d.species,

  /* ── LE POOL DE POINTS DE COMPÉTENCE, ET SES TERMES (lot 23) ───────
     Même raison de loi qu'au-dessus, et même partage : la PHRASE vient d'ici,
     le NOM vient du record. « Class Pool · Rogue » — « Rogue » est le `name`
     du record de classe, recopié ; aucun des vingt-six noms de compétence
     n'apparaît ici, ni nulle part dans le moteur (loi §0.13).

     ⚠️ UN PALIER PORTE SON NIVEAU, et c'est la règle Q15-8 rendue lisible :
     un personnage créé au niveau 5 montre les paliers 2, 3, 4 et 5 — quatre
     lignes — et l'absence du palier 6 se VOIT. Un terme unique « paliers
     traversés : +6 » serait exact et indémontrable, et le nombre juste
     obtenu de la mauvaise façon passerait sans rougir.

     Le bump d'espèce recopie le nom du TRAIT qui le porte (« Fast Learner »,
     « Educated »), jamais un mot fabriqué : c'est la règle que le lot 19 a
     appliquée au bonus de Base de l'Elfe.

     ⚠️ LE DON D'ORIGINE (lot 24) NE PASSE PAS PAR ICI : sa ligne est nommée
     directement d'après le `name` du record (« Skilled »), exactement comme
     `destiny-stat.mjs` nomme la sienne — aucune clef n'est nécessaire pour un
     libellé qui EST déjà le nom d'un record.

     LE GRANT D'ESPÈCE, LUI, EST UN COUPLE (lot 24) : « Araag · 1 granted
     choice » ENTRE dans le pool, « Araag · 1 imposed choice » en SORT — même
     phrase que l'imposé de classe/arrière-plan, parce que c'en est un une
     fois entré (règle d'Eric du 2026-08-09, net zéro). Le mot source est le
     `name` de l'ESPÈCE, pas du trait : `granted_skill_choice` ne porte aucun
     id de trait à recopier, contrairement à `skill_points.trait`. */
  "fh.skills.pool": "Skill Points",
  "fh.skills.term.class": (d) => "Class Pool · " + d.class,
  "fh.skills.term.level": (d) => "Level " + d.level,
  "fh.skills.term.species": (d) => d.trait + " · Level " + d.level,
  "fh.skills.term.imposed": (d) =>
    d.source + " · " + d.count + " imposed choice" + (d.count === 1 ? "" : "s"),
  "fh.skills.term.granted": (d) =>
    d.source + " · " + d.count + " granted choice" + (d.count === 1 ? "" : "s"),

  /* ── Les raisons portées par `destiny.lastChange` ─────────────────── */
  "fh.reason.arcane-critical-success": (d) => "Arcane Critical Success d" + d.sides,
  "fh.reason.arcane-critical-failure": (d) => "Arcane Critical Failure d" + d.sides,
  "fh.reason.destiny-die": (d) => "Destiny d" + d.sides,
  "fh.reason.manual-pool": (d) => "Manual d" + d.sides + " pool correction",
  "fh.reason.correction": "Correction",
  "fh.reason.manual-correction": "Manual correction",
  "fh.reason.recovery": "Destiny recovery",
  "fh.reason.fate-refused": "Arcane fate refused",
  "fh.reason.fate-accepted": "Fumble 1 accepted",
  "fh.reason.invoked-chaos": "Invoked Chaos",
  "fh.reason.awakening": "Arcane Awakening",
  "fh.reason.overreach-held": "Overreach held",
  "fh.reason.deferred-overreach": "Deferred Overreach",
  "fh.reason.arcane-failure-refused": "Arcane failure refused",
  "fh.reason.defied-roll": "Defied roll",

  /* ── Les lignes du flux ───────────────────────────────────────────── */
  "fh.event.die-gained": (d) => "Gained a Destiny d" + d.sides,
  "fh.event.die-lost": (d) => "Removed a Destiny d" + d.sides,
  "fh.event.points-moved": (d) => (d.change > 0 ? "Gained " : "Lost ") + points(d.change),
  "fh.event.points-current": (d) => "Current " + d.points,
  "fh.event.destiny-rolled": (d) => "Destiny d" + d.sides + " rolled " + d.result,
  "fh.event.arcane-critical": (d) => "∞ CRITICAL · Destiny d" + d.sides + " rolled " + d.result,
  /* La Vibration est un NIVEAU, jamais un sort : le moteur ne connaît aucun
     texte de carte, et ce mot-ci n'en nomme aucun non plus. */
  "fh.event.vibration": (d) => "VIBRATION · d" + d.sides + " · spell level " + d.level + " · optional",
  "fh.event.recovery-capped": (d) =>
    "RECOVERY CAPPED · Destiny Score " + d.score + " · " + points(d.lost) + " not recovered · Current " + d.points,
  "fh.event.arcane-fumble": (d) => "∞ FUMBLE · Destiny d" + d.sides + " rolled 1",
  "fh.event.chaos-risk": (d) =>
    "CHAOS RISK · Overreach " + d.overreach + " · " + (d.ability || "Ability") + " save DC " + d.dc + " · pending",
  "fh.event.arcane-fate-accepted": "∞ FATE ACCEPTED · ∞ fumble",
  "fh.event.arcane-fate-refused": (d) =>
    "∞ FATE REFUSED · The 1 becomes " + d.sides + " · ∞ critical" + (d.hadPoints ? " · Destiny becomes 0" : ""),
  "fh.event.chaos-pending": "CHAOS IS PENDING · 1 fatigue point per round until you face it",
  "fh.event.gained-one-point": "Gained 1 Destiny Point",
  "fh.event.fate-accepted": "FATE ACCEPTED · Fumble 1",
  "fh.event.fate-defied": (d) => "FATE DEFIED · The 1 becomes 20" + (d.hadPoints ? " · Destiny becomes 0" : ""),
  "fh.event.awakening-roll": "ARCANE AWAKENING · Crit 20 at Destiny 0",
  "fh.event.crit20-roll": "CRITICAL 20 · Fate bends in your favor",
  "fh.event.awakening-settled": (d) =>
    "ARCANE AWAKENING · " + (d.card ? "Drew " + d.card + " · " : "")
    + (d.scoreChanged ? "Score " + d.score + " · " : "") + "+" + d.points + " temporary Points"
    + (d.brick ? " · Brick" : ""),
  "fh.event.staged-destiny": (d) => "Destiny d" + d.sides + " waits in the tray · nothing is spent until ROLL",
  "fh.event.chaos-resolved": (d) => "CHAOS RESOLVED · 2d6 = " + d.rolls.join(" + ") + " = " + d.total + " · " + d.verdict,
  "fh.event.weave-held": (d) => "WEAVE HELD · " + (d.ability || "Save") + " " + d.total + " vs DC " + d.dc,
  "fh.event.overreach-breaks": (d) => "OVERREACH BREAKS · " + (d.ability || "Save") + " " + d.total + " vs DC " + d.dc,
  "fh.event.chaos-break": (d) =>
    "CHAOS · d6 " + d.die + (d.overreach ? " + Overreach " + d.overreach : "") + " = " + d.total + " · " + d.verdict,
  "fh.event.debt-expired": (d) => "A pending " + d.label + " debt was never faced and has expired.",
  "fh.event.gift-destiny": (d) => "GAVE A DESTINY DIE · d" + d.sides + " → " + d.to
    + (d.timing === "reaction" ? " · in reaction" : " · to hold until spent"),

  /* ── Les dettes portées ───────────────────────────────────────────── */
  "fh.pending.chaos": "CHAOS",
  "fh.pending.overreach": (d) => "OVERREACH " + d.overreach,
  "fh.pending.note": "NOTE",
  "fh.pending.title.note": "A reminder you pinned yourself. Click to open · right click to rename or cancel it.",
  "fh.pending.title.chaos": "Chaos is pending — 1 fatigue point per round until you face it. Click to resolve · right click to rename or cancel it.",
  "fh.pending.title.overreach": (d) => "An Overreach save is pending, DC " + d.dc
    + " — 1 fatigue point per round until you face it. Click to resolve · right click to rename or cancel it.",

  /* ── Les tables de Chaos ──────────────────────────────────────────── */
  "fh.chaos.unknown-table": (d) => "read the " + (d.ability || "matching") + " Chaos table",
  "fh.chaos.capped": (d) => " (table stops at " + d.max + ")"
};
