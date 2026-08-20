/* ══ L'ÉTAPE DESTINY — lot 45, REFAITE AU LOT 61 (B6) ═════════════════════
   L'écran théâtral du builder. Eric, 2026-08-14, en six lignes : un petit
   texte qu'on chasse d'un OK · UNE carte, grand format, DE DOS, rien d'autre
   à l'écran · ON LA TAPE POUR QU'ELLE SE RETOURNE · le texte arrive UNE
   SECONDE APRÈS · Valid s'allume · deux petits boutons qui restent visibles.

   ⭐ B6.3 — L'EXCEPTION GESTUELLE DE TOUT LE BUILDER, ET ELLE EST
   DÉLIBÉRÉE : c'est le SEUL endroit où l'on TAPE un élément pour déclencher
   quelque chose. Partout ailleurs le choix se fait en défilant (II.1), et
   les seuls autres taps portent sur des boutons. ⛔ NE PAS L'« HARMONISER » :
   c'est le geste de retourner une carte, il n'a pas d'équivalent ailleurs.

   🔴 B6.2 — RIEN N'EST ACTÉ TANT QUE `Validate` N'EST PAS TAPÉ, et c'est un
   changement par rapport au lot 45 : le bouton « Draw » écrivait aussitôt
   `choose({path:"fh.destiny.arcana"})` dans le document. Le tirage vit
   maintenant dans l'état d'écran (`state.destinyDraw`), et `Validate` seul
   le pose. `Draw again` est ILLIMITÉ (Eric) — et comme aucun historique
   n'est conservé (décision du 2026-08-13 : « seul le résultat compte »),
   relancer ne laisse aucune trace.

   ⚠️ LE MODE N'EST TOUJOURS PAS ÉCRIT AU DOCUMENT, et la mesure du lot 45
   tient : `fh.destiny.*` est un namespace STRICT — toute écriture que le
   module ne reconnaît pas fait JETER `rebuild()`. Le mode vit en mémoire
   d'écran, jamais dans `build.choices`. */

import { drawArcana } from "./dice.mjs?v=249";
import { renderCardRows } from "./catalogue.mjs?v=249";
/* Lot 75 — les images d'arcanes sont des chargements d'EXÉCUTION : leurs
   `src` portent la version du graphe, lue dans l'URL de CE module, sinon le
   cache peut servir une image d'avant avec un écran neuf (`version.mjs`). */
import { versionQuery } from "./version.mjs?v=249";

export { drawArcana };

export const DESTINY_ARCANA_PATH = "fh.destiny.arcana";
const DESTINY_STAT_ID = "fh:destiny";

/** Le dossier des 22 faces + le dos. ⛔ Le nom du fichier EST le slug du
 *  moteur — le mapping par NOM est fait à la préparation des images, pas
 *  ici (voir `assets/arcana/arcana.measured.json` : Marseille numérote la
 *  Justice en 8 et la Force en 11, le moteur suit Rider-Waite). */
export const ARCANA_DIR = "./assets/arcana";
export function arcanaImageSrc(id) {
  return `${ARCANA_DIR}/${String(id).replace("fh:arcana:en:", "")}.jpg${versionQuery(import.meta.url)}`;
}
export const ARCANA_BACK_SRC = `${ARCANA_DIR}/back.jpg${versionQuery(import.meta.url)}`;

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

/** L'id posé sur `fh.destiny.arcana`, lu dans `document.build.choices` —
 *  jamais dans `resolved` (le Score ne porte que l'IMPACT, pas l'id). */
export function currentArcanaId(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === DESTINY_ARCANA_PATH);
  return entry && entry.ref ? entry.ref.id : undefined;
}

/** LE SCORE — lu à l'octet sur `resolved.stats`, jamais recalculé (loi du
 *  lot 39 : un Score menteur s'affiche menteur). */
function renderScore(resolved) {
  const stats = resolved && Array.isArray(resolved.stats) ? resolved.stats : [];
  const stat = stats.find((s) => s.id === DESTINY_STAT_ID);
  if (!stat) return null;
  return el("div", "card-score", [
    el("span", "card-score-label", [text("Destiny Score")]),
    el("span", "card-score-value", [text(String(stat.value))])
  ]);
}

/* ══ B6.1a — LE PETIT TEXTE, ET SON OK ═══════════════════════════════════
   « On clique OK, il disparaît — effet théâtral. » Il ne revient pas : la
   scène doit se vider pour que la carte ait tout l'espace (B6.1b). */
function renderIntro(act) {
  const wrap = el("section", "card-intro dalle-intermediaire");
  wrap.append(el("p", null, [text(
    "One card decides your Destiny. Draw it, or pick it — nothing is settled until you validate."
  )]));
  const ok = document.createElement("button");
  ok.type = "button";
  ok.className = "card-ok";
  ok.textContent = "OK";
  ok.addEventListener("click", () => act({ kind: "destinyIntroDone" }));
  wrap.append(ok);
  return wrap;
}

/* ══ B6.1b/c — LA CARTE, ET LE TAP QUI LA RETOURNE ═══════════════════════
   Grand format, un maximum d'espace, flottant sur une dalle MAJEURE. Rien
   d'autre à l'écran tant qu'elle est de dos.

   ⚠️ C'EST UN `<button>`, pas un `<div>` qui écoute le clic : le geste doit
   exister au clavier et s'annoncer à l'oreille. L'exception de B6.3 porte
   sur le GESTE (on tape une image, pas un contrôle nommé), pas sur le droit
   de le rendre inaccessible. */
function renderCard(ctx, act) {
  const { face, drawnId, query } = ctx;
  const retournee = face === "up" && Boolean(drawnId);
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card-face dalle-majeure";
  btn.dataset.face = retournee ? "up" : "down";
  btn.disabled = retournee; // une fois retournée, elle n'est plus un geste
  const img = document.createElement("img");
  img.className = "card-face-img";
  if (retournee) {
    const view = query({ kind: "arcana", id: drawnId });
    const nom = view && view.record ? view.record.name : drawnId;
    img.src = arcanaImageSrc(drawnId);
    img.alt = nom;
    btn.setAttribute("aria-label", nom);
  } else {
    img.src = ARCANA_BACK_SRC;
    img.alt = "";                       // décorative : le nom accessible est celui du bouton
    btn.setAttribute("aria-label", "Turn the card over");
  }
  btn.append(img);
  if (!retournee) btn.addEventListener("click", () => act({ kind: "destinyFlip" }));
  return btn;
}

/* ══ B6.1d — CE QUE FAIT LA CARTE, UNE SECONDE APRÈS ═════════════════════
   Dans une fenêtre SIMPLE, en dessous. Les six champs sont RECOPIÉS du
   record, jamais résumés ni réécrits — ce sont les textes d'Eric.
   ⚠️ Une dalle SIMPLE ne porte que de l'encre `--text` (matrice du lot 59) :
   les libellés y sont donc en `--text`, pas en `--text-muted`. */
function renderReveal(ctx) {
  const view = ctx.query({ kind: "arcana", id: ctx.drawnId });
  if (!view || !view.record) return null;
  const data = view.record.data || {};
  const wrap = el("section", "card-reveal dalle-simple");
  wrap.append(el("h3", null, [text(`${data.numeral || ""} — ${view.record.name}`)]));
  const rows = renderCardRows([
    ["Impact", data.destiny && typeof data.destiny === "object" ? String(data.destiny.impact) : null],
    ["Meaning", data.meaning],
    ["Power", data.power],
    ["Vibration", data.vibration]
  ]);
  if (rows) wrap.append(rows);
  return wrap;
}

/* ══ B6.1f/h — LES DEUX PETITS BOUTONS, ET ILS RESTENT VISIBLES ══════════ */
function renderActions(ctx, act) {
  const wrap = el("div", "card-actions");
  for (const [id, label] of [["again", "Draw again"], ["choose", "Choose yourself"]]) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "card-action dalle-simple";
    b.textContent = label;
    b.dataset.action = id;
    b.addEventListener("click", () => act(id === "again"
      ? { kind: "destinyDraw" }
      : { kind: "destinyMode", value: "choice" }));
    wrap.append(b);
  }
  return wrap;
}

/** LE CORPS D'UNE FICHE DE CARTE, pour le mode « Choose yourself » (B6.1g :
 *  « fait défiler les cartes comme B2/B3, texte explicatif inclus »). Le
 *  catalogue partagé rend le cadre ; ceci en remplit une. */
export function renderArcanaCardBody(query, id) {
  const view = query({ kind: "arcana", id });
  const data = (view && view.record && view.record.data) || {};
  const img = document.createElement("img");
  img.className = "card-choice-img";
  img.src = arcanaImageSrc(id);
  img.alt = "";
  const rows = renderCardRows([
    ["Impact", data.destiny && typeof data.destiny === "object" ? String(data.destiny.impact) : null],
    ["Meaning", data.meaning]
  ]);
  return [img, rows].filter(Boolean);
}

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut — la carte DÉJÀ actée
 * @param {object} ctx.resolved   la fiche dérivée — le Score, à l'octet
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {boolean} ctx.intro     le petit texte est-il encore là (B6.1a)
 * @param {string} [ctx.drawnId]  la carte TIRÉE, pas encore actée (B6.2)
 * @param {"down"|"up"} ctx.face  la carte est-elle retournée (B6.1c)
 */
export function renderDestinyStep(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const query = ctx.query || (() => []);
  const section = el("section", "card-step");

  if (ctx.intro) {
    section.append(renderIntro(act));
    return section; // ⛔ rien d'autre : le texte doit pouvoir être chassé avant que la carte n'entre
  }

  const drawnId = ctx.drawnId || currentArcanaId(ctx.document);
  const retournee = ctx.face === "up" && Boolean(drawnId);

  section.append(renderCard({ face: ctx.face, drawnId, query }, act));

  /* ⛔ B6.1b : « rien d'autre à l'écran que la carte » tant qu'elle est de
     dos. Le Score, le texte et les deux boutons n'apparaissent qu'APRÈS le
     retournement — c'est l'effet théâtral, et il tombe si on les pose
     d'avance. */
  if (!retournee) return section;

  if (ctx.revealed) {
    const reveal = renderReveal({ query, drawnId });
    if (reveal) section.append(reveal);
  }
  const score = renderScore(ctx.resolved);
  if (score) section.append(score);
  section.append(renderActions(ctx, act));
  return section;
}

/** LE PALIER UNIQUE DE DESTINY : `Validate` s'allume quand une carte est
 *  retournée (B6.1e), et c'est lui qui l'ACTE (B6.2). `null` n'existe pas
 *  ici — l'écran a toujours exactement un palier. */
export function destinyValidate(ctx) {
  const drawnId = ctx.drawnId;
  const pret = ctx.face === "up" && Boolean(drawnId);
  return {
    exists: true,
    ready: pret,
    action: pret ? { kind: "choose", path: DESTINY_ARCANA_PATH, ref: { kind: "arcana", id: drawnId } } : null,
    next: "step"
  };
}
