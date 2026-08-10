/* ══ LA COQUILLE DU BUILDER — lot 30 ══════════════════════════════════
   Assistant pur + plan escamotable, forme ratifiée le 2026-08-10. AUCUN
   bandeau permanent (loi du builder) : la seule chose visible en dehors de
   la décision courante est le repère de progression (belt menu) et le
   bouton du plan, fermé par défaut.

   ⛔ CE FICHIER N'EST PAS BRANCHÉ AU MOTEUR. Il ne connaît ni `build.choices`,
   ni le carnet `decisions` du lot 28, ni le MCP. Il prouve la FORME —
   navigation, ouverture/fermeture du plan, responsive — sur un contenu de
   remplacement. Le branchement au document réel est un lot séparé : chaque
   étape lira alors `decisions[]` (lot 28) pour ses options et ses verrous.

   Zéro framework, zéro build (loi Q3 du chantier) : DOM natif, ESM natif. */

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

const state = { step: 0, planOpen: false };
const app = document.getElementById("app");

function isMobile() {
  return window.matchMedia("(max-width: 720px)").matches;
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
  card.innerHTML = `
    <h1>${step.label}</h1>
    <p class="placeholder">This step will read the <code>decisions[]</code>
      ledger (lot 28) for its options, cost and locks — not wired here.</p>
  `;
  const nav = el("div", "stage-nav", [
    button("Back", () => { state.step = Math.max(0, state.step - 1); render(); }, state.step === 0),
    button(state.step === STEPS.length - 1 ? "Open the sheet" : "Continue",
      () => { state.step = Math.min(STEPS.length - 1, state.step + 1); render(); })
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

function render() {
  app.dataset.plan = state.planOpen ? "open" : "closed";
  app.innerHTML = "";
  const nodes = [renderBelt(), renderStage(), renderPlan()];
  if (isMobile() && state.planOpen) nodes.push(renderScrim());
  app.append(...nodes);
}

window.addEventListener("resize", render);
render();
