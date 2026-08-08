/* ══ LES MOTS, EN DONNÉES ════════════════════════════════════════════
   Loi §0.13 : « le moteur produit des IDENTIFIANTS, l'interface produit des
   MOTS ». Avant ce lot, `lexicon.mjs` déclarait `verdict: "FATE REFUSED"` à
   côté de sa règle, et `session.mjs` composait ses lignes d'événement en
   anglais au milieu de la logique. Les deux se lisaient comme du moteur et
   étaient en réalité de l'affichage.

   Ici : une RÈGLE porte un `id`, un PAQUET porte les mots de cet id. Le moteur
   ne connaît que les ids ; `derive` applique le paquet à la frontière. Un
   paquet est une donnée injectable — c'est ce qui « ouvre l'option »
   multilingue demandée le 2026-08-07. Aucune traduction n'est livrée ici : on
   ouvre la porte, on ne livre pas les langues.

   UN ID INCONNU JETTE (loi §0.5). Un libellé manquant qui retomberait
   silencieusement sur son id peindrait « verdict.natural-20 » dans le plateau
   d'une table en séance, et personne ne saurait d'où ça vient.

   Ce paquet-ci est le paquet SRD. La couche FH apporte le sien
   (`src/layers/fh/labels.mjs`) et a le droit d'en PATCHER une entrée — c'est
   ce que fait une couche : elle ajoute et elle patche. */

/* Le paquet SRD anglais. Une entrée est une chaîne, ou une fonction des
   données que le site d'appel lui passe. Rien d'autre. */
export const EN_SRD = {
  /* ── Verdicts (§5 du Ruling) ─────────────────────────────────────── */
  "verdict.critical-hit": "CRITICAL HIT",
  "verdict.critical-miss": "CRITICAL MISS",
  "verdict.natural-20": "NATURAL 20",
  "verdict.natural-1": "NATURAL 1",
  "verdict.success": "SUCCESS",
  "verdict.failure": "FAILURE",

  /* ── Badges (§3) ─────────────────────────────────────────────────── */
  "badge.natural-20": "NATURAL 20",
  "badge.exhaustion": (d) => "Exhaustion " + d.level + " · −" + d.penalty,
  "badge.manual": "MANUAL",
  "badge.adjusted": "adjusted",
  "badge.rerolled": (d) => "rerolled " + d.label + " · " + d.before + " → " + d.after,
  "badge.received-die": (d) => d.label + " from " + d.from,

  /* ── Jetons de source (§1) ───────────────────────────────────────── */
  "source.guidance": "Guidance",
  "source.bardic": "Bardic",
  "source.tactical": "Tactical",
  "source.other-1": "Bonus I",
  "source.other-2": "Bonus II",
  "source.other-3": "Bonus III",
  "source.unknown": "Other",
  "seal.unknown": "Bonus",

  /* ── Le plateau ──────────────────────────────────────────────────── */
  "tray.idle": "Dice Tray",
  "tray.ready": "Ready",
  "tray.rolling": "Rolling…",
  "tray.roll": "Roll",
  "tray.free-label": "Damage roll",
  "tray.choose-keep": "Choose which result to keep",
  "tray.choice-recorded": "Choice recorded",
  "tray.d20-locked": "Original d20 locked",
  "tray.d20-locked-choose": "Original d20 locked · choose bonus",
  "tray.staged-count": (d) => d.count + " new " + (d.count === 1 ? "die" : "dice") + " ready",
  "tray.total": (d) => "Total " + d.total + (d.outcome ? " · " + d.outcome : ""),
  "tray.to-hit": "To hit",
  "tray.damage": "Damage",
  "tray.spell": (d) => d.name + (d.slotLevel ? " · level " + d.slotLevel : ""),

  /* ── Modificateurs posés à côté des dés ──────────────────────────── */
  "modifier.manual": "Manual",
  "modifier.exhaustion": "Exhaustion",
  "modifier.damage-bonus": "Damage",

  /* ── Ce qu'un refus dit au joueur ────────────────────────────────── */
  "notice.roll-locked": "Finish the current roll before starting or clearing another one.",
  "notice.d20-is-base": "The d20 is the base die; d% stays a free roll.",
  "notice.bonus-cap": (d) => "A roll carries at most " + d.max + " bonus dice.",
  "notice.free-cap": (d) => "The free-roll tray holds at most " + d.max + " dice",
  "notice.base-die-immovable": "The d20 is the roll — it cannot be removed.",
  "notice.landed-die-immovable": "A die that has fallen stays in its roll.",
  "notice.pool-spent": "That pool resource is spent.",
  "notice.badge-needs-name": "Give the badge a name first.",
  "notice.badge-cap": (d) => d.max + " badges is the most the strip holds.",
  "notice.correction-needs-failure": (d) =>
    d.label + " is spent after a failed D20 Test — this one succeeded.",
  "notice.correction-needs-landed": (d) => d.label + " corrects a roll that has already landed.",
  "notice.reroll-needs-landed": "A reroll takes a die that has already fallen.",
  "notice.reroll-unknown-die": "That die is not part of this roll.",
  "notice.mount-after-roll": (d) => d.label + " is declared before the roll, not after it.",
  "notice.no-such-resource": (d) => "No " + d.label + " is available.",

  /* ── Les lignes du flux, côté SRD ────────────────────────────────── */
  "event.exhaustion": (d) =>
    "EXHAUSTION " + d.level + " · " + d.reason + " · " +
    (d.level >= d.max ? "level " + d.max + " is death" : d.level ? "−" + d.penalty + " on every d20 test" : "clear"),
  "event.reroll": (d) =>
    "REROLL · " + d.source + " · " + d.label + " " + d.before + " → " + d.after,
  "event.refund": (d) => d.label + " was not expended — the check still failed.",
  "event.die-given": (d) =>
    "GAVE A DIE · " + d.label + " d" + d.sides + " → " + d.to +
    (d.timing === "reaction" ? " · in reaction" : " · to hold until spent"),
  "event.die-received": (d) =>
    "RECEIVED A DIE · " + d.label + " d" + d.sides + " from " + d.from +
    (d.timing === "reaction" ? " · in reaction" : " · it waits until spent"),
  "event.natural-20": "NATURAL 20",
  "event.critical-hit": (d) => "CRITICAL HIT · " + d.name + " · damage dice doubled",
  "event.damage": (d) => "DAMAGE · " + d.name + " · " + d.total + (d.type ? " " + d.type : ""),
  "event.slot-spent": (d) => "SLOT SPENT · level " + d.slotLevel + " · " + d.name,
  "event.concentration": (d) => "CONCENTRATION · " + d.name,
  "event.save-dc": (d) => d.name + " · " + d.ability + " save DC " + d.dc,

  /* ── Le compte du Ruling ─────────────────────────────────────────── */
  "ruling.dc": (d) => "DC " + d.dc,
  "ruling.ac": (d) => "AC " + d.ac,
  "part.mode.advantage": "adv",
  "part.mode.disadvantage": "dis",
  "part.mode.choice": "A/D",
  "part.manual": "MANUAL"
};

/* Le paquet est appliqué ICI et nulle part ailleurs. `t` est la seule fonction
   qui transforme un id en mot ; tout ce qui l'appelle est, par définition, une
   frontière d'affichage. */
export function createLabels(...packs) {
  const table = Object.assign({}, ...packs);
  function t(id, data) {
    const entry = table[id];
    if (entry === undefined) {
      throw new Error('fhpc/play: no label for "' + id + '" — the engine names ids, a pack must carry the words');
    }
    return typeof entry === "function" ? entry(data || {}) : entry;
  }
  t.has = (id) => table[id] !== undefined;
  t.ids = () => Object.keys(table).sort();
  return t;
}
