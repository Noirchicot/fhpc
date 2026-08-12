/* ══ LA COQUILLE DU BUILDER — lots 30/31/33 ═══════════════════════════
   Assistant pur + plan escamotable, forme ratifiée le 2026-08-10. AUCUN
   bandeau permanent (loi du builder) : la seule chose visible en dehors de
   la décision courante est le repère de progression (belt menu) et le
   bouton du plan, fermé par défaut.

   DEPUIS LE LOT 33 : le moteur tourne DANS la page (lot 32, prouvé
   portable) et l'étape Compétences lit le VRAI carnet `decisions[]`
   (lot 28) sur le VRAI document d'exemple EN+FH. Les huit autres étapes
   restent des placeholders — un lot par étape, sur ce même modèle.

   Zéro framework, zéro build (loi Q3 du chantier) : DOM natif, ESM natif. */

import { bootEngine, loadExampleDocument } from "./engine.mjs";
import { renderSkillsStep } from "./skills-step.mjs";
/* LOT 40 — `render()` rend une CHAÎNE HTML (voir src/tools/render-fiche.mjs,
   §« LE HTML »), pas des nœuds : c'est une décision d'architecture du lot 25,
   antérieure à ce lot, mesurée et non rouverte ici (voir INVENTAIRE-LOT-40.md
   §0.1). La coquille est déjà le seul endroit du builder qui pose du HTML en
   chaîne (`item.innerHTML` du repère de progression, `app.innerHTML = ""`
   plus bas) : l'étape Review suit exactement ce précédent, dans `shell.mjs`
   seul — jamais dans un module testé par `tests/dom-stub.mjs`, qui ne connaît
   pas `innerHTML` par construction (son propre commentaire le dit). */
/* Aliasé : `shell.mjs` a déjà son propre `render()` (la fonction de redessin
   de la page, plus bas) — deux fonctions distinctes, un seul nom aurait
   masqué l'une des deux. */
import { render as renderFiche } from "../../src/tools/render-fiche.mjs";

/* Mots d'interface en ANGLAIS (arbitrage d'Eric, 2026-08-10) : la table joue
   en anglais, décidé de longue date pour la couche FH — l'écran réel qui
   servira à la table doit être dans la même langue dès le départ, pas
   traduit après coup. */
const STEPS = [
  { id: "universe",   label: "Universe & Layers" },
  { id: "concept",    label: "Concept" },
  { id: "class",      label: "Class" },
  { id: "species",    label: "Species" },
  { id: "background", label: "Background" },
  { id: "abilities",  label: "Abilities" },
  { id: "destiny",    label: "Destiny" },
  { id: "skills",     label: "Skills" },
  { id: "review",     label: "Review" }
];
/* LOT 40 — trouvé PAR l'id, jamais par la position. `STEPS.length - 1`
   désigne le même index aujourd'hui (review est le dernier pas de la
   ceinture), mais le bouton final (§3c) doit mener à Review PARCE QUE c'est
   Review, pas parce qu'un index de tableau coïncide avec elle. */
const REVIEW_INDEX = STEPS.findIndex((step) => step.id === "review");

const state = {
  step: 0,
  planOpen: false,
  engine: null,       // { build, layers, bus } — set once bootEngine() resolves
  document: null,      // the live fh-char/1 document
  decisions: [],        // the last rebuild()'s carnet
  resolved: null,        // the last rebuild()'s fiche — lot 39 needs it whole, not just decisions[]
  report: null,          // LOT 40 — the whole last rebuild() output: {underived, warnings,
                          // unconsumed, …}, exactly the shape render-fiche.mjs's `report` wants
  violations: [],          // the last validate()'s refusals — {key, params, path?}
  engineError: null
};
const app = document.getElementById("app");

/** Re-runs `rebuild` on the current document and refreshes `decisions`.
 *  The ONLY place that mutates `state.document`/`state.decisions` — every
 *  skill click goes through this, never touches the document by hand.
 *  LOT 39 — also runs `validate()` right after: the Skills step displays its
 *  refusals (§3d of its command), and `validate()` needs the freshly rebuilt
 *  document, not the one before the click.
 *  LOT 40 — also keeps the WHOLE rebuild() output as `state.report`: the
 *  Review step passes it straight to `render()`, unread and unrecomputed. */
function rebuild() {
  const verbs = state.engine.build.verbs;
  const out = verbs.rebuild({ document: state.document });
  state.document = out.document;
  state.decisions = out.decisions || [];
  state.resolved = out.resolved;
  state.report = out;
  state.violations = verbs.validate({ document: state.document }).violations || [];
}

function applyDecisionAction(action) {
  const verbs = state.engine.build.verbs;
  /* Chaque verbe REND `{document}` — il ne mute pas en place (contracts/
     build.md). C'est ce document-là qui doit passer à `rebuild`, jamais
     celui d'avant. */
  if (action.kind === "resetSkills") {
    /* LOT 39, décision n°2 — *Reset* ne rend que les points DÉPENSÉS : une
       suite de `clear` sur le MÊME document, un seul `rebuild` à la fin.
       `clear` sur un chemin jamais posé n'est pas une faute (`build.mjs`),
       donc balayer les 62 chemins possibles ne coûte rien de plus qu'un
       clear unique. */
    let document = state.document;
    for (const path of action.paths) {
      document = verbs.clear({ document, path, kind: "choice" }).document;
    }
    state.document = document;
    rebuild();
    render();
    return;
  }
  const out = action.kind === "set"
    ? verbs.set({ document: state.document, path: action.path, value: action.value })
    : verbs.clear({ document: state.document, path: action.path, kind: "choice" });
  state.document = out.document;
  rebuild();
  render();
}

/* ⚠️ LOT 38 : plus de "720" ici. Un `@media` CSS ne peut pas exposer sa
   propre valeur à `var()` — c'est une limite native, pas un choix — donc le
   seuil ne peut vivre qu'à UN endroit : le `@media (max-width: 720px)` de
   `shell.css`, qui pose le drapeau `--bp-hint` ("wide"/"narrow") sur
   `:root`. Cette fonction lit le drapeau, jamais le nombre — voir
   `tokens.css` et INVENTAIRE-LOT-38.md pour la mesure qui a fait diverger
   ce lot de la piste `--bp-mid` suggérée par la commande. */
function isMobile() {
  const hint = getComputedStyle(document.documentElement).getPropertyValue("--bp-hint").trim();
  return hint === "narrow";
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}

function button(label, onClick, disabled) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.disabled = Boolean(disabled);
  b.addEventListener("click", onClick);
  return b;
}

/* ── LE REPÈRE DE PROGRESSION ─────────────────────────────────────────
   PAS un bandeau de fiche : il ne montre aucune valeur du personnage, que
   des étapes et leur statut de navigation (fait / courante / à venir). */
function renderBelt() {
  const belt = el("nav", "belt");
  belt.setAttribute("aria-label", "Character creation steps");
  STEPS.forEach((step, index) => {
    const item = button(
      "",
      () => { state.step = index; render(); }
    );
    item.className = "belt-item";
    item.dataset.status = index < state.step ? "done" : index === state.step ? "current" : "upcoming";
    item.setAttribute("aria-current", index === state.step ? "step" : "false");
    item.innerHTML = `<span class="belt-index">${index}</span><span class="belt-label">${step.label}</span>`;
    belt.append(item);
  });
  return belt;
}

function renderToggle() {
  return el("div", "toggle-bar", [
    button(state.planOpen ? "Hide plan" : "Show plan",
      () => { state.planOpen = !state.planOpen; render(); })
  ]);
}

function renderStage() {
  const step = STEPS[state.step];
  const card = el("section", "decision-card");
  const heading = el("h1", null, [document.createTextNode(step.label)]);
  card.append(heading);

  if (step.id === "skills" && state.engine) {
    card.append(renderSkillsStep({
      resolved: state.resolved,
      decisions: state.decisions,
      violations: state.violations,
      query: state.engine.layers.verbs.query
    }, applyDecisionAction));
  } else if (step.id === "skills" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "skills") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "review" && state.document && state.report) {
    /* LOT 40 — §3a. `render()` rend une CHAÎNE, jamais recalculée : la loi
       que ses 27+8 tests gardent (« un total menteur s'affiche MENTEUR »)
       tient tant que ce module ne fait qu'AFFICHER `state.document`/
       `state.report`, sans y toucher. Mots en anglais (§3b) : c'est la
       langue du builder, pas celle par défaut de `render()`. */
    const fiche = el("div", "review-fiche", []);
    fiche.innerHTML = renderFiche(state.document, state.report, "en");
    card.append(fiche);
  } else if (step.id === "review" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "review") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else {
    card.append(el("p", "placeholder", [document.createTextNode(
      "This step will read the decisions[] ledger (lot 28) for its options, cost and locks — not wired yet.")]));
  }

  const nav = el("div", "stage-nav", [
    button("Back", () => { state.step = Math.max(0, state.step - 1); render(); }, state.step === 0),
    /* §3c — le pas final MÈNE À REVIEW, par id (`REVIEW_INDEX`), jamais par
       une coïncidence de longueur de tableau. Aucun autre effet : la
       sauvegarde et l'export appartiennent au bloc `doc`, pas à ce lot. */
    button(state.step === STEPS.length - 1 ? "Open the sheet" : "Continue",
      () => {
        state.step = state.step === STEPS.length - 1 ? REVIEW_INDEX : Math.min(STEPS.length - 1, state.step + 1);
        render();
      })
  ]);
  return el("main", "stage", [renderToggle(), card, nav]);
}

/* ── LE PLAN ESCAMOTABLE ──────────────────────────────────────────────
   Desktop : colonne. Téléphone : surface temporaire plein écran. Même
   contenu, même verbes des deux côtés — jamais un second builder. */
function renderPlan() {
  const aside = el("aside", "plan");
  aside.setAttribute("aria-label", "Decision plan");
  aside.hidden = !state.planOpen;

  const header = el("div", "plan-header", [el("h2", null, [document.createTextNode("Plan")])]);
  header.append(button("Close", () => { state.planOpen = false; render(); }));

  const list = el("ol", "plan-list");
  STEPS.forEach((step, index) => {
    const li = document.createElement("li");
    li.dataset.status = index < state.step ? "done" : index === state.step ? "current" : "upcoming";
    li.textContent = step.label;
    list.append(li);
  });

  aside.append(header, list);
  return aside;
}

function renderScrim() {
  const scrim = el("div", "scrim");
  scrim.addEventListener("click", () => { state.planOpen = false; render(); });
  return scrim;
}

/* La garantie qui rend la molette sûre (bible §4) : l'étape courante
   REVIENT dans le champ à chaque changement d'étape, sinon la ceinture
   peut cacher le cran allumé — la seule chose qu'elle existe pour montrer.
   `scrollIntoView` évite le piège connu de `offsetLeft` (il remonte au
   premier parent positionné) : le navigateur calcule le centrage lui-même,
   rien à mesurer à la main. `block: "nearest"` empêche un défilement
   VERTICAL parasite sur desktop, où la ceinture n'a jamais besoin de
   défiler — `inline: "center"` n'agit que si elle déborde horizontalement.
   La vitesse (animée ou instantanée) suit `--bp-hint`-independent
   `scroll-behavior` posé en CSS, qui obéit déjà à `prefers-reduced-motion`. */
function recenterBelt() {
  const current = app.querySelector('.belt-item[data-status="current"]');
  if (current) current.scrollIntoView({ inline: "center", block: "nearest" });
}

function render() {
  app.dataset.plan = state.planOpen ? "open" : "closed";
  app.innerHTML = "";
  const nodes = [renderBelt(), renderStage(), renderPlan()];
  if (isMobile() && state.planOpen) nodes.push(renderScrim());
  app.append(...nodes);
  recenterBelt();
}

window.addEventListener("resize", render);
render();

/* Le moteur charge en tâche de fond ; l'écran s'affiche immédiatement
   (placeholder « Loading… » sur l'étape Compétences) et se corrige une
   fois la pile montée et le premier `rebuild` fait. */
(async () => {
  try {
    const engine = await bootEngine();
    const document = await loadExampleDocument();
    state.engine = engine;
    state.document = document;
    rebuild();
  } catch (error) {
    state.engineError = error.message;
  }
  render();
})();
