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
  /* LOT 82 — l'échelle qui se compte sur les niveaux DE CETTE CLASSE (canon
     §B.1septies). Le nom de la classe est dans le libellé, et il y est pour
     une raison : c'est ce qui rendra visible, le jour du multiclassage, que
     le +1 du barde ne suit pas les niveaux de guerrier. */
  "fh.skills.term.class-level": (d) => d.class + " Level " + d.level,
  "fh.skills.term.species": (d) => d.trait + " · Level " + d.level,
  /* LOT 82 — une aptitude de classe qui tend des points (canon §B.1ter).
     MÊME FORME que le trait d'espèce : le nom de ce qui donne, puis le niveau
     où il donne. Le niveau n'est pas décoratif — c'est lui qui rend visible
     qu'un rôdeur de niveau 5 n'a pas encore son Expertise du niveau 9. */
  "fh.skills.term.feature": (d) => d.feature + " · Level " + d.level,
  "fh.skills.term.imposed": (d) =>
    d.source + " · " + d.count + " imposed choice" + (d.count === 1 ? "" : "s"),
  "fh.skills.term.granted": (d) =>
    d.source + " · " + d.count + " granted choice" + (d.count === 1 ? "" : "s"),
  /* LOT 34 — le canal de dépense (`fh.skills.spend.<slug>`). Le mot source
     est le `name` de la COMPÉTENCE, jamais son slug — même règle §0.13 que
     les autres lignes de ce détail. */
  "fh.skills.term.spend": (d) => d.skill + " · spent to " + d.tier,
  /* LOT 36 — le canal des trainings (`fh.skills.train.<slug>`). Pas de
     palier à afficher : un training est acquis, un point. Le mot source
     est le `name` du record, comme tous les autres (§0.13). */
  "fh.skills.term.train": (d) => d.training,

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

/* ══ LOT 41 — LES CLEFS `underived` DE LA COUCHE FH ═══════════════════
   `destiny-stat.mjs` et `skill-pool.mjs` poussaient `{field, reason}`
   directement sur le tableau `underived` que la dérivation leur tend —
   jamais par `underived.declare(`, ce qui a fait manquer ces 19 sites au
   premier comptage de la commande (voir INVENTAIRE-LOT-41.md, §2). Ce sont
   les mêmes clefs, mêmes raisons, deux langues — le mécanisme de
   `src/labels.mjs` (`underivedEntry`, `renderUnderived`), réemployé. Ce
   paquet vit ICI, pas dans `src/labels.mjs` : les deux modules connaissent
   déjà leur propre vocabulaire (`FH_EN` ci-dessus), et `src/build/` ne
   l'importe JAMAIS (§0.12, gardée sur les octets). */
export const FH_UNDERIVED_FR = {
  "underived.fh.destiny-base-no-species": () =>
    "aucun choix `species` : la Base de Destinée est une donnée de l'espèce (`data.destiny.base`), et un " +
    "personnage sans espèce n'en a aucune à lire. Poser 2 par défaut ferait passer la valeur des douze espèces " +
    "d'Eric pour une règle du moteur.",
  "underived.fh.destiny-base-missing-data": (d) =>
    `le record d'espèce « ${d.speciesId} » ne porte pas \`data.destiny\` : la couche FH le pose sur les douze ` +
    "espèces (lot 15), et une espèce qui n'en a pas vient d'une couche tierce ou amputée. Le moteur ne lui " +
    "invente pas de Base.",
  "underived.fh.destiny-arcana-no-choice": () =>
    "aucun choix `fh.destiny.arcana` : l'impact de l'Arcane majeur est une donnée de LA CARTE " +
    "(`data.destiny.impact`), et un personnage qui n'en nomme aucune n'en a aucune à lire. L'impact vaut 0, 1 " +
    "ou 2 selon la carte — jamais codable en dur, donc jamais supposé non plus.",
  "underived.fh.destiny-arcana-layer-not-mounted": (d) =>
    `le personnage nomme la carte « ${d.cardId} » et AUCUNE couche montée ne porte de record \`arcana\`. Le ` +
    "genre, lui, EXISTE depuis la révision du 2026-08-08 (trou GAP-KIND clos) : il répond, et il répond VIDE. " +
    "Ce qui manque est le CONTENU — la couche des 22 cartes (`fh-arcana-en`) n'est pas montée. L'impact vaut " +
    "0, 1 ou 2 selon la carte : un nombre posé ici serait inventé.",
  "underived.fh.destiny-feat-no-choice": () =>
    "aucun choix ne désigne de record `feat` : la valeur de Destinée d'un don est portée par le don " +
    "(`data.destiny.bonus`), et un personnage sans don n'en a aucune à lire. Le +2 d'Auspicious (fh) est une " +
    "règle connue, mais elle appartient à son record — pas à une constante du moteur.",
  "underived.fh.destiny-feat-no-bonus": (d) =>
    `aucun des dons choisis ne porte \`data.destiny.bonus\` (${d.featIds}) : les dons du SRD n'ont aucune ` +
    "valeur de Destinée, et c'est un FAIT, pas un trou. Le don qui en porte une est `fh:feat:en:auspicious`, " +
    "dans la couche `fh-feats-en` — si le personnage le joue, c'est que la couche n'est pas montée ou que le " +
    "choix ne le désigne pas.",
  "underived.fh.destiny-proficiency-not-derived": () =>
    "le bonus de maîtrise n'a pas été dérivé, et il est un terme du Score : le compter pour 0 rendrait un " +
    "Score plus bas de 2 à 6 points sans que rien ne le dise.",
  "underived.fh.destiny-other-undecided": () =>
    "la ligne « Other » du builder v1 recouvre trois familles — objet magique, boon, sous-classe — et aucune " +
    "ne porte de valeur de Destinée dans un champ que ce module pourrait lire. Ce n'est donc pas une couche qui " +
    "manque, comme pour l'Arcane et le don : c'est une décision qui n'a pas été prise. Un MJ qui veut la " +
    "porter aujourd'hui l'écrit comme un terme de séance motivé, pas comme une dérivation.",
  "underived.fh.destiny-no-terms": () =>
    "aucun terme du Score n'a pu être établi — ni la maîtrise, ni la Base d'espèce, ni l'Arcane, ni un don, et " +
    "la table n'a inscrit aucun terme de séance. Le schéma exige au moins un terme de détail, et un Score sans " +
    "détail est exactement ce que cette collection existe pour remplacer.",
  "underived.fh.skillpool-no-class-ref": () =>
    "aucun `ref` de genre `class` sous le chemin « class » : le pool de points vient de la CLASSE " +
    "(`data[fh_skill_pool].base`), et un personnage dont la classe n'est pas désignée là où le pli la lit n'en " +
    "a aucun à lire.",
  "underived.fh.skillpool-layer-not-mounted": (d) =>
    `la classe « ${d.classId} » ne porte pas \`data[fh_skill_pool]\`, et AUCUNE classe de la pile n'en porte : ` +
    "la couche des compétences (`fh-skills-en`) n'est pas montée. Ce qui manque est le CONTENU — le drapeau " +
    "`fh.skills` est levé par une couche qui ne l'apporte pas. Les douze pools valent 12, 14, 16 ou 18 selon " +
    "la classe : un nombre posé ici serait inventé.",
  "underived.fh.skillpool-species-no-choice": () =>
    "aucun choix `species` : les points de compétence d'espèce sont une donnée de l'espèce " +
    "(`data.skill_points`), et un personnage sans espèce n'en a aucune à lire.",
  "underived.fh.skillpool-species-no-field": (d) =>
    `l'espèce « ${d.speciesId} » ne porte pas \`data.skill_points\`, et c'est un FAIT, pas un trou : neuf des ` +
    "douze espèces ne donnent aucun point de compétence. Les trois qui en donnent sont l'Araag et l'Elestu " +
    "(`fast-learner`) et l'Humain (`educated`), dans la couche `fh-species-en`.",
  "underived.fh.skillpool-species-tier-not-reached": (d) =>
    `l'espèce « ${d.speciesId} » accorde des points par « ${d.traitName} », et AUCUN de ses paliers n'est ` +
    `atteint au niveau ${d.level} (règle Q15-8 : seuls comptent les paliers TRAVERSÉS).`,
  /* ⭐ LOT 82 — LES DEUX DÉCLARATIONS DU BOUND. Cinq clefs sont mortes ici :
     elles disaient toutes la MÊME chose sous cinq formes — « voilà ce que je
     déduis du pool » — et le canon du 2026-08-18 a supprimé la déduction. */
  "underived.fh.skillpool-bound-grows": (d) =>
    `« ${d.feature} » (niveau ${d.level}) ajoute ${d.points} point(s) de compétence au BOUND de ` +
    `« ${d.classId} » : l'aptitude NOMME une liste, donc elle contraint (canon §B.1quater). Le bound n'est ` +
    "donc pas figé à la création — mais il ne grandit JAMAIS par un point d'échelle, seulement quand une " +
    "aptitude nomme une liste, à quelque niveau qu'elle tombe.",
  "underived.fh.skillpool-bound-not-in-pool": (d) =>
    `la classe « ${d.classId} » place ${d.skill} point(s) de compétence et ${d.tool} point(s) d'outil en BOUND. ` +
    "Ils ne sont PAS dans le pool publié et ne s'en déduisent pas non plus : ce sont des points déjà dépensés " +
    "quand la feuille arrive au joueur (canon §B.0). Le joueur les PLACE — dans la liste de sa classe, au " +
    "palier novice — et ce module ne conduit pas ce placement.",
  "underived.fh.skillpool-species-grant-bound": (d) =>
    `l'espèce « ${d.speciesId} » accorde ${d.count} maîtrise(s) CONTRAINTE(S) par une liste : c'est du bound ` +
    "(canon §B.1quater — une liste contraint, le littéral « any » ne contraint pas). Le grant ne rejoint donc " +
    "pas le pool, et le convertir en points libres transformerait un choix restreint en points dépensables " +
    "partout.",
  "underived.fh.skillpool-feat-no-choice": () =>
    "aucun choix ne désigne de record `feat` : les points de compétence d'un don d'origine sont portés par le " +
    "don (`data.skill_points.bonus`), et un personnage sans don n'en a aucun à lire.",
  "underived.fh.skillpool-feat-no-bonus": (d) =>
    `aucun des dons choisis ne porte \`data.skill_points.bonus\` (${d.featIds}) : seul \`srd:feat:en:skilled\` ` +
    "en porte un, patché par la couche `fh-feats-en` — les autres dons du SRD n'en donnent aucun, et c'est un " +
    "FAIT, pas un trou."
};

/* Le paquet ANGLAIS — même jeu de clefs (gardé par `tests/underived-fh-labels.test.mjs`). */
export const FH_UNDERIVED_EN = {
  "underived.fh.destiny-base-no-species": () =>
    "no `species` choice: the Destiny Base is a species datum (`data.destiny.base`), and a character with no " +
    "species has none to read. Defaulting to 2 would pass off the value of Eric's twelve species as an engine rule.",
  "underived.fh.destiny-base-missing-data": (d) =>
    `the species record "${d.speciesId}" carries no \`data.destiny\`: the FH layer sets it on the twelve ` +
    "species (lot 15), and a species without one comes from a third-party or amputated layer. The engine does " +
    "not invent a Base for it.",
  "underived.fh.destiny-arcana-no-choice": () =>
    "no `fh.destiny.arcana` choice: the Major Arcana's impact is a datum of THE CARD (`data.destiny.impact`), " +
    "and a character naming none has none to read. The impact is 0, 1 or 2 depending on the card — never " +
    "hard-coded, so never assumed either.",
  "underived.fh.destiny-arcana-layer-not-mounted": (d) =>
    `the character names the card "${d.cardId}" and NO mounted layer carries an \`arcana\` record. The genre ` +
    "itself HAS EXISTED since the 2026-08-08 revision (the GAP-KIND hole is closed): it answers, and it " +
    "answers EMPTY. What is missing is the CONTENT — the layer of 22 cards (`fh-arcana-en`) is not mounted. " +
    "The impact is 0, 1 or 2 depending on the card: a number written here would be invented.",
  "underived.fh.destiny-feat-no-choice": () =>
    "no choice designates a `feat` record: a feat's Destiny value is carried by the feat (`data.destiny.bonus`), " +
    "and a character with no feat has none to read. Auspicious (fh)'s +2 is a known rule, but it belongs to " +
    "its record — not to an engine constant.",
  "underived.fh.destiny-feat-no-bonus": (d) =>
    `none of the chosen feats carries \`data.destiny.bonus\` (${d.featIds}): SRD feats carry no Destiny value ` +
    "at all, and that is a FACT, not a gap. The feat that carries one is `fh:feat:en:auspicious`, in the " +
    "`fh-feats-en` layer — if the character plays it, the layer is not mounted or the choice does not designate it.",
  "underived.fh.destiny-proficiency-not-derived": () =>
    "the proficiency bonus was not derived, and it is a term of the Score: counting it as 0 would lower the " +
    "Score by 2 to 6 points without saying so.",
  "underived.fh.destiny-other-undecided": () =>
    "the v1 builder's \"Other\" line covers three families — magic item, boon, subclass — and none carries a " +
    "Destiny value in a field this module could read. This is not a missing layer, unlike the Arcana and the " +
    "feat: it is a decision that has not been made. A GM who wants to carry it today writes it as a motivated " +
    "session term, not as a derivation.",
  "underived.fh.destiny-no-terms": () =>
    "no term of the Score could be established — not the proficiency, not the species Base, not the Arcana, " +
    "not a feat, and the table logged no session term. The schema requires at least one detail term, and a " +
    "Score with no detail is exactly what this collection exists to replace.",
  "underived.fh.skillpool-no-class-ref": () =>
    "no `class`-genre `ref` under the path \"class\": the points pool comes from the CLASS " +
    "(`data[fh_skill_pool].base`), and a character whose class is not designated where the fold reads it has " +
    "none to read.",
  "underived.fh.skillpool-layer-not-mounted": (d) =>
    `the class "${d.classId}" carries no \`data[fh_skill_pool]\`, and NO class in the stack does: the skills ` +
    "layer (`fh-skills-en`) is not mounted. What is missing is the CONTENT — the `fh.skills` flag is raised by " +
    "a layer that does not carry it. The twelve pools are worth 12, 14, 16 or 18 depending on the class: a " +
    "number written here would be invented.",
  "underived.fh.skillpool-species-no-choice": () =>
    "no `species` choice: species skill points are a species datum (`data.skill_points`), and a character with " +
    "no species has none to read.",
  "underived.fh.skillpool-species-no-field": (d) =>
    `the species "${d.speciesId}" carries no \`data.skill_points\`, and that is a FACT, not a gap: nine of the ` +
    "twelve species grant no skill points at all. The three that do are the Araag and Elestu (`fast-learner`) " +
    "and the Human (`educated`), in the `fh-species-en` layer.",
  "underived.fh.skillpool-species-tier-not-reached": (d) =>
    `the species "${d.speciesId}" grants points through "${d.traitName}", and NONE of its tiers is reached at ` +
    `level ${d.level} (rule Q15-8: only TRAVERSED tiers count).`,
  /* LOT 82 — see the French table above: five keys died with the deduction. */
  "underived.fh.skillpool-bound-grows": (d) =>
    `« ${d.feature} » (niveau ${d.level}) ajoute ${d.points} point(s) de compétence au BOUND de ` +
    `« ${d.classId} » : l'aptitude NOMME une liste, donc elle contraint (canon §B.1quater). Le bound n'est ` +
    "donc pas figé à la création — mais il ne grandit JAMAIS par un point d'échelle, seulement quand une " +
    "aptitude nomme une liste, à quelque niveau qu'elle tombe.",
  "underived.fh.skillpool-bound-grows": (d) =>
    `"${d.feature}" (level ${d.level}) adds ${d.points} bound skill point(s) to "${d.classId}": the feature ` +
    "NAMES a list, so it constrains (canon §B.1quater). Bound is therefore not frozen at creation — but it " +
    "never grows from a ladder point, only when a feature names a list, at whatever level it fires.",
  "underived.fh.skillpool-bound-not-in-pool": (d) =>
    `the class "${d.classId}" places ${d.skill} bound skill point(s) and ${d.tool} bound tool point(s). They ` +
    "are NOT in the published pool, and they are not deducted from it either: they are already spent when the " +
    "sheet reaches the player (canon §B.0). The player PLACES them — inside the class list, at novice — and " +
    "this module does not drive that placement.",
  "underived.fh.skillpool-species-grant-bound": (d) =>
    `the species "${d.speciesId}" grants ${d.count} proficiency(ies) CONSTRAINED by a list: that is bound ` +
    "(canon §B.1quater — a list constrains, the literal \"any\" does not). The grant therefore never joins the " +
    "pool; converting it into free points would turn a restricted choice into points spendable anywhere.",
  "underived.fh.skillpool-feat-no-choice": () =>
    "no choice designates a `feat` record: an origin feat's skill points are carried by the feat " +
    "(`data.skill_points.bonus`), and a character with no feat has none to read.",
  "underived.fh.skillpool-feat-no-bonus": (d) =>
    `none of the chosen feats carries \`data.skill_points.bonus\` (${d.featIds}): only \`srd:feat:en:skilled\` ` +
    "carries one, patched by the `fh-feats-en` layer — the other SRD feats grant none, and that is a FACT, not a gap."
};
