/* ══ LE CARNET, PARTAGÉ — lot 42 ═══════════════════════════════════════
   `planAt` et `violationAt` étaient PRIVÉES dans `skills-step.mjs` (lignes
   118/121, lot 39) — un seul écran les lisait. Trois écrans en ont besoin
   maintenant (Compétences, Class, Species) : sorties ici, importées par les
   trois, jamais recopiées (« la loi du chantier est que deux copies
   divergent sauf si quelque chose les compare » — commande §3a). L'extraction
   est neutre : mêmes deux fonctions, même comportement, `skills-step.mjs` ne
   change que son `import`.

   ── CE QUI S'Y AJOUTE, ET POURQUOI (au-delà des deux fonctions demandées) ─
   Class et Species (ce lot) posent tous les deux UN CHOIX DE RECORD parmi
   une liste (12 options), puis UN QCM par-dessus (`class.skills`,
   `species.skills`) dont chaque case est un slot `<basePath>[n]` publié par
   `decisions.mjs` — EXACTEMENT la même forme des deux côtés. Écrire ce
   geste deux fois (le clic, le verbe qu'il rend, le balisage) aurait été la
   divergence même que ce fichier existe pour éviter. `renderPicker` et
   `renderSlotQcm` sont donc partagés ICI plutôt que dupliqués dans
   `class-step.mjs`/`species-step.mjs` — voir INVENTAIRE-LOT-42.md, « ce que
   j'ai changé de cette commande ».

   ⚠️ Toujours ZÉRO règle de jeu : ce fichier ne fait que lire `decisions[]`
   par chemin et rendre ce qu'il trouve. Aucun compte n'est recalculé, aucune
   liste n'est composée à la main — seulement descendue. */

/** Le carnet, indexé par chemin — jamais par « le dernier segment » (le
 *  bogue nommé en tête de l'ancien fichier, lot 33). */
export function planAt(decisions, path) {
  return (Array.isArray(decisions) ? decisions : []).find((entry) => entry.path === path) || null;
}
export function violationAt(violations, path) {
  return (Array.isArray(violations) ? violations : []).find((v) => v.path === path) || null;
}

/** Les entrées `<basePath>[n]` d'un plan multiple, triées PAR INDEX NUMÉRIQUE
 *  — jamais par ordre alphabétique de chemin (`[10]` < `[2]` en chaîne).
 *  Peut rendre PLUS d'entrées que `plan.expected` : un changement de classe
 *  laisse les anciens slots vivants, verrouillés (§3b.3 de la commande,
 *  mesuré — voir INVENTAIRE-LOT-42.md). Ce fichier ne les cache ni ne les
 *  compte à part : il les rend TOUTES, chacune avec son verrou éventuel —
 *  au joueur de les nettoyer avec le tiret (`onClear`), au moteur de juger. */
export function planSlots(decisions, basePath) {
  const prefix = `${basePath}[`;
  const list = Array.isArray(decisions) ? decisions : [];
  return list
    .filter((entry) => typeof entry.path === "string" && entry.path.startsWith(prefix))
    .map((entry) => {
      const match = /\[(\d+)\]$/.exec(entry.path);
      return { ...entry, index: match ? Number(match[1]) : 0 };
    })
    .sort((a, b) => a.index - b.index);
}

/* ── LES MOTS DES TROIS VERROUS QUE `class`/`species` ET LEURS QCM PEUVENT
   PORTER (`decisions.mjs` : `refPlan`, `multiPlan`) — jamais les refus du
   pool libre (ceux-là restent dans `skills-step.mjs`, REFUSAL_WORDS, sans
   recouvrement de clef avec cette table). Même fallback que là-bas : une
   clef inconnue retombe sur elle-même. */
const DECISION_REFUSAL_WORDS = {
  "decision.kind-mismatch": (p) => `Expected a “${p.expectedKind}”, got “${p.actualKind}”.`,
  "decision.option-unavailable": (p) => `“${p.selected}” isn't on the catalogue.`,
  "skill-grant.count-mismatch": (p) => `${p.actual} chosen, ${p.declared} expected (${p.answers}).`,
  /* LOT 46 — les deux refus neufs de `background.boost` (`decisions.mjs`,
     lot 43) : le moteur prononce, cette table ne fait que RECOMPOSER ses
     propres `params` en anglais — même geste que les trois entrées
     au-dessus, aucun recalcul (`value`/`cap`/`total`/`expected` viennent
     tels quels du `lock`). */
  "background.boost-cap-exceeded": (p) => `+${p.value} on one ability — the cap is +${p.cap}.`,
  "background.boost-total-mismatch": (p) => `${p.total} points spent, ${p.expected} expected.`
};
export function decisionRefusalWord(violation) {
  const words = DECISION_REFUSAL_WORDS[violation.key];
  return words ? words(violation.params || {}) : violation.key;
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** LE PICKER — une rangée de boutons nommés, plus un tiret optionnel qui
 *  efface. MÊME bascule que `skills-step.mjs` (`renderTierButtons`) :
 *  cliquer l'option déjà active l'efface aussi, jamais un second geste à
 *  apprendre. Ce module ne connaît AUCUN verbe : `onSelect`/`onClear`
 *  reçoivent la valeur brute, c'est L'APPELANT qui choisit `choose` ou
 *  `set`/`clear` — Class pose un record, les QCM posent un scalaire. */
export function renderPicker({ options, selected, labelOf, onSelect, onClear, lock }) {
  const wrap = el("div", "record-list");
  const chosen = Array.isArray(selected) ? selected : [];
  if (onClear) {
    const dash = document.createElement("button");
    dash.type = "button";
    dash.className = "record-option record-option-none";
    dash.dataset.active = String(chosen.length === 0);
    dash.textContent = "—";
    /* Cas à part, LOT 53 §1c : « — » ne veut rien dire à l'oreille — cet
       `aria-label` n'est PAS l'identifiant machine (le tiret n'a pas de
       `value`, rien à mettre dans `data-value`), il reste un nom accessible
       à part entière et SURVIT donc, dans les deux issues du §1c. */
    dash.setAttribute("aria-label", "None");
    dash.addEventListener("click", onClear);
    wrap.append(dash);
  }
  for (const value of options || []) {
    const active = chosen.includes(value);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "record-option";
    btn.dataset.active = String(active);
    /* LOT 53 — `data-value` porte l'IDENTIFIANT machine (ce que les tests
       cherchent, §0.2 de la commande) ; `textContent` porte le NOM et EST
       DÉJÀ le nom accessible d'un <button> — aucun `aria-label` ne lui est
       posé ici (§1c, issue « le retirer » : un `aria-label` redondant avec
       le texte visible n'ajoute rien, un `aria-label` qui le contredit,
       comme l'ancien `String(value)` quand `labelOf` existe, est pire que
       rien). Le lecteur d'écran annonce donc toujours ce qui s'affiche. */
    btn.dataset.value = String(value);
    btn.textContent = labelOf ? labelOf(value) : String(value);
    btn.addEventListener("click", () => {
      if (active && onClear) onClear();
      else if (!active) onSelect(value);
    });
    wrap.append(btn);
  }
  if (lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(lock))]));
  return wrap;
}

/** LE QCM PARTAGÉ — `class.skills` et `species.skills` sont LA MÊME forme :
 *  un plan qui publie `answered`/`expected`, et un slot `<basePath>[n]` par
 *  case (§3b.2/§3c de la commande). `null` si le plan n'existe pas encore
 *  (aucune classe/espèce choisie, ou l'espèce n'impose rien) — l'appelant
 *  décide alors de ne rien rendre, jamais un cadre vide (§2, « rien ne se
 *  cache » ⇄ « pas de cadre pour rien »). */
export function renderSlotQcm({ decisions, basePath, title, labelOf, onAction }) {
  const plan = planAt(decisions, basePath);
  if (!plan) return null;
  const wrap = el("section", "skills-budget-block");
  wrap.dataset.status = plan.status;
  wrap.append(el("h3", null, [text(title)]));
  wrap.append(el("p", "skills-budget-note", [text(`${plan.answered} of ${plan.expected} chosen`)]));
  if (plan.lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(plan.lock))]));
  const slots = planSlots(decisions, basePath);
  const rows = el("div", "skills-rows");
  const multi = slots.length > 1;
  for (const slot of slots) {
    const row = el("div", "skills-row");
    row.dataset.row = slot.path;
    row.append(el("span", "record-row-label", [text(multi ? `Skill ${slot.index + 1}` : "Skill")]));
    row.append(renderPicker({
      options: slot.options,
      selected: slot.selected,
      labelOf,
      onSelect: (value) => onAction({ kind: "set", path: slot.path, value }),
      onClear: () => onAction({ kind: "clear", path: slot.path }),
      lock: slot.lock
    }));
    rows.append(row);
  }
  wrap.append(rows);
  return wrap;
}

/** LE CHOIX DE RECORD — 12 classes ou 12 espèces, MÊME forme : la liste des
 *  options du plan `path` (jamais une liste composée ici), chacune nommée
 *  par le catalogue `query({kind})`. Un clic pose `choose` — aucun tiret
 *  (choisir une autre classe REMPLACE, on ne "déchoisit" pas une classe). */
export function renderRecordChoice({ decisions, path, kind, title, query, onAction }) {
  const plan = planAt(decisions, path);
  if (!plan) return null;
  const wrap = el("div", "record-choice-block");
  wrap.append(el("h3", null, [text(title)]));
  wrap.append(renderPicker({
    options: plan.options,
    selected: plan.selected,
    labelOf: (id) => {
      const view = query({ kind, id });
      return view && view.record ? view.record.name : id;
    },
    onSelect: (id) => onAction({ kind: "choose", path, ref: { kind, id } }),
    lock: plan.lock
  }));
  return { node: wrap, plan };
}
