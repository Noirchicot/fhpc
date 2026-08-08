/* ══ LA SÉQUENCE — le mécanisme d'extension ══════════════════════════
   §L5.2 demandait de VÉRIFIER que les phases existantes suffisent avant d'en
   inventer un. Voici la mesure, faite avant d'écrire une ligne de ce fichier.

   CE QUI EXISTAIT (lot 3, `session.mjs`) : quatorze noms de phase posés sur
   `state.rollSequence.phase` — `remaining`, `destiny`, `destiny-events`,
   `result`, `nat1`, `arcane1`, `roll-choice`, `destiny-choice`,
   `adjustment-choice`, `open`, `open-after-events`, `adjustment`,
   `standalone`, `free-tray`. Ils NOMMENT correctement les moments : sept des
   huit points où le moteur v1 appelait une mécanique FH tombent sur une phase
   déjà nommée.

   CE QUI MANQUAIT, mesuré :
   1. **Aucune répartition.** `phase` est un CHAMP DE STATUT, muté en dix-neuf
      endroits et lu sémantiquement par une seule table (`BLOCKING_PHASES`).
      Rien n'itère sur des gestionnaires enregistrés. Le vocabulaire existait,
      la répartition non — c'est exactement l'hypothèse de l'architecte
      (« un module de couche s'inscrit sur une phase ») qui restait à brancher,
      pas un vocabulaire neuf à inventer.
   2. **Aucun cycle de vie de module.** Le huitième point — semer l'état d'une
      mécanique à l'ouverture de séance et le rendre au `snapshot` — n'est PAS
      un moment de jet et aucune phase ne le nomme. C'est le seul endroit où ce
      fichier ajoute quelque chose que les phases ne portaient pas :
      `session-open` / `session-snapshot`. ⚠️ **À RATIFIER PAR L'ARCHITECTE**
      (loi §0.10) : la DISPOSITION de l'état ne change pas d'un octet — la
      tranche FH reste `state.destiny`, exactement où le lot 3 l'avait laissée
      — seul CHANGE QUI L'ÉCRIT. Aucun contrat de donnée n'est inventé ici.

   TROIS RÈGLES QUE CE FICHIER TIENT :
   - **On s'inscrit, on n'est pas appelé** (§L5.3). Le chemin commun invoque
     un MOMENT ; il ne connaît aucun module. Pas un seul `if (fh)`.
   - **Un module absent est absent** (§L5.4, loi §0.6). Un moment sans
     gestionnaire ne coûte rien et ne laisse aucune trace ; un module non monté
     n'a ni verbe, ni état, ni libellé.
   - **L'ordre est déclaré, jamais accidentel.** Un gestionnaire porte une
     priorité entière ; deux couches montées dans un ordre différent produisent
     la même séquence. */

/* Les MOMENTS que le chemin commun invoque. Un moment inconnu jette : c'est
   une faute de frappe qui, sinon, ne se verrait qu'à la table. */
export const MOMENTS = [
  /* Cycle de vie de module — la seule chose que les phases ne nommaient pas. */
  "session-open",       // la séance s'ouvre : un module sème sa tranche
  "session-snapshot",   // la séance rend au document ce qui lui appartient
  "session-clear",      // CLEAR TRAY : un module retire ce qu'il avait posé

  /* Les moments du jet — un par phase déjà nommée par le lot 3. */
  "mount",              // la console est prête, rien n'est lancé (phase `mount`)
  "pre-roll",           // ce qui se lance AVANT le d20 (phase `destiny`)
  "result",             // le d20 est tombé, son naturel est connu (phase `result`)
  "reopen"              // un dé rejoint un jet déjà réglé (phase `open`)
];

/* Il n'y a PAS de moment `settle`, et c'est délibéré (loi §0.6, pas de code
   mort). Le règlement s'annonce déjà sur le bus (`roll-settled`) : une couche
   qui veut y réagir s'y abonne, comme le bloc `table` le fera. Ajouter un
   moment de plus aurait été un second chemin pour le même fait. */

const MOMENT_SET = new Set(MOMENTS);

export function createSequence() {
  /* moment → [{priority, module, handler}], trié à l'inscription. */
  const handlers = new Map();
  const modules = new Map();

  function on(moment, handler, { priority = 100, module = "" } = {}) {
    if (!MOMENT_SET.has(moment)) {
      throw new Error('fhpc/play: unknown sequence moment "' + moment + '" — see MOMENTS');
    }
    if (typeof handler !== "function") {
      throw new Error('fhpc/play: a handler on "' + moment + '" must be a function');
    }
    const list = handlers.get(moment) || [];
    list.push({ priority, module, handler });
    list.sort((a, b) => a.priority - b.priority);
    handlers.set(moment, list);
  }

  /* Invoquer un moment. Chaque gestionnaire reçoit le contexte et rend, s'il a
     quelque chose à dire, `{events?, decision?, settled?, done?}`. Les
     résultats sont AGRÉGÉS dans l'ordre de priorité — le chemin commun décide
     quoi en faire, aucun module ne pilote un autre module.

     UNE SEULE DÉCISION peut être ouverte à la fois : deux modules qui
     voudraient poser une question sur le même moment est un bug de découpage,
     et il jette ici plutôt que d'en perdre une en silence (loi §0.5). */
  function run(moment, context) {
    if (!MOMENT_SET.has(moment)) {
      throw new Error('fhpc/play: unknown sequence moment "' + moment + '"');
    }
    const list = handlers.get(moment);
    /* `claimed` : un module a PRIS la suite de la séquence (il a un dé à
       lancer avant le d20) et la rendra lui-même. Le chemin commun s'arrête
       alors — sans savoir ce que le module fait, seulement qu'il a la main. */
    const result = { events: [], decision: null, settled: false, claimed: false, contributions: {} };
    if (!list || !list.length) return result;
    for (const item of list) {
      const answer = item.handler(context) || null;
      if (!answer) continue;
      if (Array.isArray(answer.events)) result.events = result.events.concat(answer.events);
      if (answer.decision) {
        if (result.decision) {
          throw new Error(
            'fhpc/play: two modules opened a decision on "' + moment + '" (' +
            result.decision.by + " and " + item.module + ") — that is a cut-line bug, not a race"
          );
        }
        result.decision = Object.assign({ by: item.module }, answer.decision);
      }
      if (answer.settled) result.settled = true;
      if (answer.claimed) {
        if (result.claimed) {
          throw new Error('fhpc/play: two modules claimed the sequence on "' + moment + '" — that is a cut-line bug');
        }
        result.claimed = true;
      }
      if (answer.contribute && item.module) result.contributions[item.module] = answer.contribute;
    }
    return result;
  }

  /* Monter un module. Il déclare son nom, ses drapeaux, ses verbes, ses
     libellés, ses règles de verdict et de badge, et s'inscrit sur les moments
     qui l'intéressent. RIEN de tout cela n'existe s'il n'est pas monté. */
  function mount(module) {
    if (!module || !module.name) throw new Error("fhpc/play: a sequence module needs a name");
    if (modules.has(module.name)) throw new Error('fhpc/play: module "' + module.name + '" is already mounted');
    modules.set(module.name, module);
    (module.register || []).forEach(({ moment, handler, priority }) => {
      on(moment, handler, { priority, module: module.name });
    });
    return module;
  }

  function mounted(name) { return modules.has(name); }
  function list() { return Array.from(modules.values()); }

  /* Les drapeaux LEVÉS par les modules montés. Le chemin commun ne les lit
     jamais pour décider quoi faire ; ils sont là pour que le document sache
     quelles capacités ont servi (`fh-char/1` §defs/flag). */
  function flags() {
    const raised = [];
    modules.forEach((module) => (module.flags || []).forEach((flag) => {
      if (raised.indexOf(flag) < 0) raised.push(flag);
    }));
    return raised.sort();
  }

  return { on, run, mount, mounted, list, flags, MOMENTS };
}
