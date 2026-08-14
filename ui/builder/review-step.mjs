/* ══ L'ÉTAPE REVIEW — lot 65, B9 ══════════════════════════════════════════
   Eric, 2026-08-14 : **« un masque propre, TRÈS CLAIR »** · 🔴 **« QUE DU
   TEXTE »** · **« sur une DALLE MAJEURE UNIQUE — pas plusieurs »**. Et son
   exigence première, plus ancienne : **« on doit avoir une visibilité de ce
   qui est fait / pas fait »**.

   ── CE QUE ÇA REMPLACE, ET POURQUOI C'ÉTAIT INTENABLE ────────────────────
   L'écran déversait `resolved` en entier : **11 894 px** mesurés sur le
   personnage d'exemple, **27 370** après quelques choix de plus, **538
   lignes dont 464 commençant par `resolved.`**. Et le pire, relevé au
   §3bis : **il GRANDIT AVEC LE PERSONNAGE** — « l'écran devient d'autant
   plus illisible que le personnage est abouti », le contraire exact de ce
   qu'on attend d'un récapitulatif.

   ── ⭐ CE QUE CE MASQUE LIT, ET POURQUOI IL NE PEUT PAS DIVERGER ─────────
   Il ne juge RIEN. « Fait / pas fait » est déjà prononcé par le moteur, dans
   le carnet : chaque plan porte son `answered`, son `expected`, son `status`
   et son `lock`. Ce fichier les GROUPE PAR ÉTAPE et les met en phrases.

   ⛔ C'est délibérément le carnet, et pas une liste de conditions écrite ici
   écran par écran : deux définitions de « terminé » — celle qui allume
   `Validate` et celle qui remplit Review — auraient divergé au premier lot
   suivant. Le carnet est la seule qui existe.

   ⏳ CE QUE CE LOT NE FAIT PAS, ET C'EST NOMMÉ :
     · **B9.4, l'export** — « POSSIBLEMENT un export JSON ou HTML, tout en
       bas ». *Possiblement* n'est pas *décidé*, et le mandat est ferme :
       « pas de faux magasin — ne publier un bouton d'export que s'il exporte
       vraiment ». Aucun bouton n'est posé.
     · **B9.5, `sheet` et `mode expert`** — mentionnés, jamais spécifiés, et
       la charte réserve la fiche jouable à une décision d'Eric. */

import { planAt } from "./carnet.mjs";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/* ⛔ UNE TABLE DE ROUTAGE, PAS DES RÈGLES. Elle dit à quelle ÉTAPE appartient
   un chemin de décision — rien de plus. Aucun seuil, aucun compte, aucune
   condition : ce qui est « fait » reste prononcé par le carnet.
   ⚠️ L'ordre est celui de `STEPS` (shell.mjs) ; les deux tables se lisent
   côte à côte, et le test le vérifie plutôt que de l'espérer. */
export const REVIEW_GROUPS = [
  { step: "universe", label: "Universe & Layers", paths: [] },
  { step: "concept", label: "Concept", paths: [] },
  { step: "abilities", label: "Abilities", paths: [] },
  { step: "species", label: "Species", paths: ["species", "species.skills", "species.skillBudget"] },
  { step: "destiny", label: "Destiny", paths: [] },
  { step: "background", label: "Inheritance", paths: ["background", "background.boost", "background.originFeat[0]"] },
  { step: "class", label: "Class", paths: ["class", "class.skills"] },
  { step: "skills", label: "Skills", paths: [] },
  { step: "equipment", label: "Equipment", paths: [] }
];

/** L'état d'un plan, EN MOTS — et rien d'autre que ce que le carnet dit. */
function etatDuPlan(plan) {
  if (plan.status === "locked") return { fait: false, mot: "needs attention" };
  const attendu = Number.isInteger(plan.expected) ? plan.expected : 1;
  const repondu = Number.isInteger(plan.answered) ? plan.answered : 0;
  if (repondu >= attendu) return { fait: true, mot: "done" };
  return { fait: false, mot: `${repondu} of ${attendu}` };
}

/** Les faits d'une étape qui n'a AUCUN plan — lus au document, jamais jugés.
 *  ⚠️ Ce ne sont pas des règles : ce sont des présences. « Un nom est posé »
 *  n'est pas « le nom est valide » — c'est `validate()` qui prononce ça, et
 *  ses refus s'affichent plus bas, tels quels. */
function presences(step, document, resolved) {
  const choix = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const pose = (path) => choix.some((c) => c.path === path);
  if (step === "concept") {
    return [{ fait: Boolean(document && document.name), mot: document && document.name ? document.name : "no name yet" }];
  }
  if (step === "abilities") {
    const clefs = ["str", "dex", "con", "int", "wis", "cha"];
    const posees = clefs.filter((k) => pose(`abilities.${k}`)).length;
    return [{ fait: posees === clefs.length, mot: posees === clefs.length ? "six scores set" : `${posees} of 6 scores` }];
  }
  if (step === "destiny") {
    const carte = pose("fh.destiny.arcana");
    return [{ fait: carte, mot: carte ? "card drawn" : "no card yet" }];
  }
  if (step === "universe") {
    const couches = document && document.build && Array.isArray(document.build.layers) ? document.build.layers.length : 0;
    return [{ fait: couches > 0, mot: `${couches} layer${couches === 1 ? "" : "s"}` }];
  }
  if (step === "skills") {
    const stat = (resolved && Array.isArray(resolved.stats) ? resolved.stats : []).find((s) => s.id === "fh:skill-points");
    if (!stat) return [{ fait: true, mot: "no pool on this stack" }];
    return [{ fait: stat.value >= 0, mot: stat.value >= 0 ? `${stat.value} left` : `${stat.value} — overspent` }];
  }
  if (step === "equipment") {
    const lignes = choix.filter((c) => /^gear\[\d+\]$/.test(c.path)).length;
    return [{ fait: true, mot: `${lignes} item${lignes === 1 ? "" : "s"}` }]; // rien n'est obligatoire ici
  }
  return [];
}

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut
 * @param {object} ctx.resolved   la fiche dérivée
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {object} [ctx.report]   la sortie complète de `rebuild()` (warnings…)
 * @param {Array}  [ctx.violations] les refus de `validate()`
 */
export function renderReviewStep(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const document = ctx.document || null;
  const resolved = ctx.resolved || null;
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "review-step");

  /* B9.3 — UNE DALLE MAJEURE, UNE SEULE. Tout tient dedans. */
  const dalle = el("section", "review-mask dalle-majeure");

  const identite = resolved && resolved.identity ? resolved.identity : {};
  const classe = Array.isArray(identite.classes) && identite.classes[0] ? identite.classes[0].name : null;
  const titre = [document && document.name, identite.species, classe].filter(Boolean).join(" · ");
  dalle.append(el("h2", "review-name", [text(titre || "Unnamed character")]));

  const liste = el("ol", "review-steps");
  for (const groupe of REVIEW_GROUPS) {
    const etats = groupe.paths
      .map((path) => planAt(decisions, path))
      .filter(Boolean)
      .map(etatDuPlan)
      .concat(presences(groupe.step, document, resolved));
    /* Une étape sans plan NI présence ne se montre pas « à moitié » : elle
       n'a rien à dire, et on le dit. */
    const fait = etats.length > 0 && etats.every((e) => e.fait);
    const ligne = el("li", "review-line");
    ligne.dataset.step = groupe.step;
    ligne.dataset.done = String(fait);
    ligne.append(el("span", "review-line-label", [text(groupe.label)]));
    ligne.append(el("span", "review-line-state", [text(
      etats.length === 0 ? "—" : etats.map((e) => e.mot).join(" · ")
    )]));
    /* ⛔ CLIQUABLE, ET C'EST LE POINT DE L'ÉCRAN : voir qu'il manque quelque
       chose sans pouvoir y aller ferait de Review un constat, pas un
       récapitulatif. */
    ligne.addEventListener("click", () => act({ kind: "goToStepId", value: groupe.step }));
    liste.append(ligne);
  }
  dalle.append(liste);

  /* LES REFUS DU MOTEUR, TELS QUELS — jamais reformulés ici. S'il n'y en a
     pas, la rubrique n'existe pas (pas de cadre vide). */
  const refus = ctx.violations || [];
  if (refus.length > 0) {
    dalle.append(el("h3", "review-heading", [text("The engine refuses")]));
    const ul = el("ul", "review-refusals");
    for (const v of refus) ul.append(el("li", null, [text(v.path ? `${v.path} — ${v.key}` : v.key)]));
    dalle.append(ul);
  }

  /* Les choix qu'AUCUNE RÈGLE NE CONSOMME : ils ne laissent aucune trace sur
     la fiche, et le joueur a le droit de le savoir avant de s'étonner. */
  const orphelins = (ctx.report && Array.isArray(ctx.report.unconsumed) ? ctx.report.unconsumed : [])
    .map((u) => (typeof u === "string" ? u : u && u.path)).filter(Boolean);
  if (orphelins.length > 0) {
    dalle.append(el("h3", "review-heading", [text("Recorded, but no rule reads them")]));
    const ul = el("ul", "review-refusals");
    for (const p of orphelins) ul.append(el("li", null, [text(p)]));
    dalle.append(ul);
  }

  section.append(dalle);
  return section;
}

/** Review est la DESTINATION : il n'y a pas de pas suivant, donc pas de
 *  palier. `Validate` y reste éteint — c'est déjà ce que faisait le bouton
 *  final depuis le lot 55, et la loi vient de là. */
export function reviewValidate() {
  return { exists: true, ready: false, action: null, next: "step" };
}
