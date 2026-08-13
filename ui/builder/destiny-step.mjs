/* ══ L'ÉTAPE DESTINY — lot 45 ═════════════════════════════════════════
   Même situation qu'Abilities (voir son en-tête) : AUCUN plan `decisions[]`
   pour `fh.destiny.arcana` (mesuré, commande §0). Le point de décision
   marche déjà de bout en bout — `choose({path:"fh.destiny.arcana", ref})`
   change bien le Score sous les yeux (`fh-arcana.test.mjs`) — ce qui manque
   est la PRODUCTION de la carte que « draw » pose ensuite avec ce même
   verbe.

   ⚠️ LE MODE N'EST PAS ÉCRIT AU DOCUMENT, ET C'EST MESURÉ — contrairement à
   `abilities.mode`. `fh.destiny.*` est un namespace STRICT
   (`src/modules/fh/destiny-stat.mjs`) : toute écriture sous ce préfixe que
   le module ne reconnaît pas fait JETER `rebuild()` (sondé en écrivant ce
   lot — `fh.destiny.mode` lève « n'est pas un terme du Score de Destinée,
   la forme est "fh.destiny.<terme>[n]" », voir INVENTAIRE-LOT-45.md). Le
   mode vit donc en mémoire d'écran (`shell.mjs`, `state.destinyMode`),
   jamais dans `build.choices` — un écart mesuré par rapport à la commande,
   qui traitait les deux modes en miroir sans distinguer les deux
   namespaces.

   ⭐ LE MODE EST UNE LISTE (même loi qu'Abilities) : `ARCANA_METHODS`. */

import { renderPicker } from "./carnet.mjs";
import { drawArcana } from "./dice.mjs";

export { drawArcana };

const DESTINY_ARCANA_PATH = "fh.destiny.arcana";
const DESTINY_STAT_ID = "fh:destiny";

export const ARCANA_METHODS = [
  { id: "draw", label: "Draw a card", summary: "Not selected — switch to it to draw a card at random." },
  { id: "choice", label: "Choose a card", summary: "Not selected — switch to it to pick a card from the 22." }
];

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** L'id de la carte posée sur `fh.destiny.arcana`, lu dans
 *  `document.build.choices` — jamais dans `resolved` (le Score ne porte que
 *  l'IMPACT de la carte, pas son id). `undefined` si rien n'est posé. */
export function currentArcanaId(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === DESTINY_ARCANA_PATH);
  return entry && entry.ref ? entry.ref.id : undefined;
}

function renderModeSwitch(activeId, onModeChange) {
  return renderPicker({
    options: ARCANA_METHODS.map((m) => m.id),
    selected: [activeId],
    labelOf: (id) => ARCANA_METHODS.find((m) => m.id === id).label,
    onSelect: (id) => onModeChange(id)
  });
}

/** LE SCORE — lu à l'octet sur `resolved.stats`, jamais recalculé (même loi
 *  que le compteur de `skills-step.mjs`, commande §4 test 8 : un Score
 *  menteur s'affiche menteur). `null` si le module n'a rien publié (couche
 *  FH débrayée). */
function renderScore(resolved) {
  const stats = resolved && Array.isArray(resolved.stats) ? resolved.stats : [];
  const stat = stats.find((s) => s.id === DESTINY_STAT_ID);
  if (!stat) return null;
  return el("div", "card-score", [
    el("span", "card-score-label", [text("Destiny Score")]),
    el("span", "card-score-value", [text(String(stat.value))])
  ]);
}

/** LA CARTE — ses six champs, RECOPIÉS du record, jamais résumés ni
 *  réécrits (commande §3b.3 : « ce sont les textes d'Eric »). */
function renderCardDetail(view) {
  if (!view || !view.record) return null;
  const data = view.record.data || {};
  const wrap = el("aside", "card-detail");
  wrap.append(el("h3", null, [text(`${data.numeral || ""} — ${view.record.name}`)]));
  const rows = [
    ["Impact", typeof data.destiny === "object" && data.destiny ? data.destiny.impact : undefined],
    ["Meaning", data.meaning],
    ["Power", data.power],
    ["Vibration", data.vibration]
  ];
  const dl = el("dl", "card-detail-list");
  for (const [label, value] of rows) {
    if (value === undefined || value === null || value === "") continue;
    const row = el("div", "card-detail-row");
    row.append(el("dt", null, [text(label)]));
    row.append(el("dd", null, [text(String(value))]));
    dl.append(row);
  }
  wrap.append(dl);
  return wrap;
}

function renderDrawMode(ctx) {
  const { catalog, rng, onAction } = ctx;
  const wrap = el("div", "card-draw");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card-draw-btn";
  btn.textContent = "Draw a card";
  btn.addEventListener("click", () => {
    const chosen = drawArcana(catalog, rng);
    if (!chosen) return;
    onAction({ kind: "choose", path: DESTINY_ARCANA_PATH, ref: { kind: "arcana", id: chosen.id } });
  });
  wrap.append(btn);
  if (catalog.length === 0) {
    wrap.append(el("p", "card-empty-note", [text(
      "The Major Arcana layer isn't mounted — nothing to draw from."
    )]));
  }
  return wrap;
}

function renderChoiceMode(ctx) {
  const { catalog, currentId, onAction } = ctx;
  return renderPicker({
    options: catalog.map((view) => view.id),
    selected: currentId !== undefined ? [currentId] : [],
    labelOf: (id) => {
      const view = catalog.find((v) => v.id === id);
      return view && view.record ? view.record.name : id;
    },
    onSelect: (id) => onAction({ kind: "choose", path: DESTINY_ARCANA_PATH, ref: { kind: "arcana", id } })
  });
}

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut du dernier `rebuild()` — seule source de la carte déjà posée
 * @param {object} ctx.resolved   la fiche dérivée — le Score, à l'octet
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {string} [ctx.mode]     "draw" (défaut, ADDENDUMS §4) ou "choice" — vit HORS document, voir l'en-tête
 * @param {(id: string) => void} ctx.onModeChange  bascule `mode`, jamais un verbe de document
 * @param {Function} [ctx.rng]    source d'aléa injectable pour `drawArcana` — `Math.random` par défaut
 * @param {(action: {kind:"choose", path:string, ref:object}) => void} onAction
 */
export function renderDestinyStep(ctx, onAction) {
  const document = ctx.document || null;
  const resolved = ctx.resolved || null;
  const query = ctx.query || (() => []);
  const rng = ctx.rng || Math.random;
  const act = onAction || ctx.onAction || (() => {});
  const onModeChange = ctx.onModeChange || (() => {});
  const activeId = ARCANA_METHODS.some((m) => m.id === ctx.mode) ? ctx.mode : ARCANA_METHODS[0].id;

  const section = el("section", "card-step");

  const score = renderScore(resolved);
  if (score) section.append(score);

  section.append(renderModeSwitch(activeId, onModeChange));

  const catalog = query({ kind: "arcana" }) || [];
  const currentId = currentArcanaId(document);

  for (const method of ARCANA_METHODS) {
    const active = method.id === activeId;
    const block = el("div", "card-method-block");
    block.dataset.status = active ? "active" : "inactive";
    block.dataset.method = method.id;
    if (!active) {
      block.append(el("p", "card-mode-summary", [text(method.summary)]));
      section.append(block);
      continue;
    }
    if (method.id === "draw") block.append(renderDrawMode({ catalog, rng, onAction: act }));
    else if (method.id === "choice") block.append(renderChoiceMode({ catalog, currentId, onAction: act }));
    section.append(block);
  }

  if (currentId) {
    const view = query({ kind: "arcana", id: currentId });
    const detail = renderCardDetail(view);
    if (detail) section.append(detail);
  }

  return section;
}
