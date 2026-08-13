/* ══ L'ÉTAPE CLASS — lot 42, REFAITE AU LOT 58 (B2 d'ERGONOMIE-BUILDER.md) ═
   Même loi que Compétences (lot 39), inchangée : le moteur prononce, l'écran
   affiche. ZÉRO règle de jeu ici — pas de compte recalculé, pas de liste
   composée à la main. `decisions[]` publie le choix du RECORD (`class`, 12
   options) et le QCM qui le suit (`class.skills`, compte et options LUS au
   plan — jamais `2` en dur : faux pour Barde/Rôdeur (3) et Roublard (4)).

   ── CE QUI CHANGE AU LOT 58, ET POURQUOI ────────────────────────────────
   🔴 **IL N'Y A PLUS DE GESTE DE SÉLECTION** (invariant II.1, tranché par
   Eric le 2026-08-14) : « avoir fait défiler à l'endroit approprié · pousser
   le bouton de valid 1 ». La rangée de douze boutons du lot 42 disparaît —
   on DÉFILE jusqu'à la classe, le défilement s'aimante sur elle
   (`scroll-snap`, B2.1h), et **la fiche sur laquelle on s'est posé EST la
   classe choisie**. Le scrollspy n'est donc pas un repère : c'est LE
   SÉLECTEUR (II.3).

   ⛔ ET IL N'Y A PAS DE BOUTON DANS LA FICHE (B2.1e, I.3) — pas même pour
   valider. `Validate` est UNIQUE dans toute l'interface, il vit dans la
   barre du haut, et il a DEUX PALIERS ici (B2.4) :
     · palier 1 — confirme la CLASSE ; le menu des choix apparaît ;
     · palier 2 — confirme les FEATURES ; on passe à l'étape suivante.

   ── ⚠️ CE QUE LES DONNÉES NE PORTENT PAS, MESURÉ AVANT DE CONSTRUIRE ─────
   B2.1c décrit une fiche « image → ambiance → features ». Mesuré sur
   `layers/srd-5.2.1-en.layer.json` :
     · AUCUNE image de classe n'existe dans le dépôt — ce lot n'en dessine
       donc pas le cadre vide (« pas de faux magasin », loi du mandat) ;
     · `data.description` (622-642 caractères) N'EST PAS de l'ambiance : c'est
       de la comptabilité de multiclassage (« As a Multiclass Character •
       Gain the Hit Point Die from the Core Wizard Traits table… »). L'appeler
       « ambiance » à l'écran serait une étiquette fausse posée sur du texte
       juste.
   Ce qui EST porté, et qui s'affiche donc : le pool de compétences FH, le dé
   de points de vie, la caractéristique primaire, les jets de sauvegarde
   (les quatre que B2 nomme), et les features de NIVEAU 1 (`features[].level`
   — mesuré présent sur les douze classes). Les descriptions de features
   (jusqu'à 3 994 caractères pour Spellcasting) restent dehors : les couper
   serait effacer des mots (défaut n°3), les afficher en entier referait les
   6 628 px d'Inheritance. */

import { renderSlotQcm, planSlots, planAt } from "./carnet.mjs";
import { renderConfirmDialog } from "./confirm.mjs";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function skillLabel(query, id) {
  const view = query({ kind: "skill", id });
  return view && view.record ? view.record.name : id;
}

/** Les douze classes, DANS L'ORDRE DU PLAN — jamais une liste écrite ici.
 *  C'est cet ordre-là que le rail, les fiches et le curseur partagent : un
 *  seul tableau, donc l'icône surlignée et la fiche validée ne PEUVENT pas
 *  diverger (II.3, « la même chose par construction »). */
export function classOptions(decisions) {
  const plan = planAt(decisions, "class");
  return plan && Array.isArray(plan.options) ? plan.options : [];
}

/** Le cran d'arrivée : la classe DÉJÀ posée si elle l'est, sinon la première.
 *  Arriver sur l'écran doit montrer où on en est, pas repartir de zéro. */
export function initialCursor(decisions) {
  const plan = planAt(decisions, "class");
  const options = classOptions(decisions);
  const selected = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
  const index = options.indexOf(selected);
  return index >= 0 ? index : 0;
}

function recordName(query, id) {
  const view = query({ kind: "class", id });
  return view && view.record ? view.record.name : id;
}

/* ══ LE RAIL — la colonne étroite de gauche (B2.1a/d/g) ═══════════════════
   ⛔ CE NE SONT PAS DES BOUTONS, et c'est une décision de ce lot : les
   rendre cliquables poserait un geste qui MÈNE à une classe en un tap —
   très près d'une sélection, que l'invariant II.1 supprime. La commande
   laissait le point ouvert ; la lecture stricte de B2.1d (« un scrollspy
   relie les deux : la gauche SUIT ce qu'on regarde à droite ») dit un
   indicateur, pas un contrôle. C'est donc un indicateur, et la question
   remonte à Eric plutôt que d'être tranchée par déduction — voir
   INVENTAIRE-LOT-58.md, la faute nommée deux fois dans ERGONOMIE-BUILDER.md
   étant justement d'avoir bâti une justification élégante sur une lecture
   ambiguë au lieu de demander.

   B2.1g : « environ 4 icônes d'un coup » — une fenêtre glissante sur les
   douze. Ce n'est pas un compte figé ici (Eric dit « probablement ») : le
   rail défile, et `keepInView` (socle.mjs) y amène le cran courant SANS
   toucher au défilement de la fiche. */
export function renderClassRail(ctx) {
  const options = classOptions(ctx.decisions);
  if (options.length === 0) return null;
  const cursor = Number.isInteger(ctx.cursor) ? ctx.cursor : 0;
  const list = el("ol", "class-rail");
  list.setAttribute("aria-label", "Classes");
  options.forEach((id, index) => {
    const item = el("li", "class-rail-item");
    item.dataset.value = id;
    item.setAttribute("aria-current", index === cursor ? "true" : "false");
    item.append(text(recordName(ctx.query, id)));
    list.append(item);
  });
  return list;
}

/* ══ UNE FICHE DE CLASSE — une DALLE MAJEURE (III.2), plein écran ════════
   `data-snap` est le SEUL contrat entre cet écran et le scrollspy du socle
   (voir SOCLE.md, « le contrat d'un écran »). */
function renderClassCard(query, id) {
  const view = query({ kind: "class", id });
  const data = (view && view.record && view.record.data) || {};
  const card = el("section", "class-card dalle-majeure");
  card.dataset.snap = "class";
  card.dataset.value = id;
  card.append(el("h2", "class-card-name", [text(recordName(query, id))]));

  /* Les quatre que B2 nomme (« skill pool · HP · primary ability · saves »),
     AFFICHÉES TELLES QUE LE RECORD LES PORTE — `hit_point_die` est déjà une
     phrase (« D6 per Wizard level »), `primary_ability` déjà un mot complet,
     `saving_throw_proficiencies` déjà des noms complets. Zéro mot composé
     ici (arbitrage du lot 42, conservé). Le pool vient de la couche FH
     (`data.fh_skill_pool.base`) : absent d'un personnage SRD pur, la ligne
     ne s'affiche simplement pas — jamais un zéro inventé. */
  const pool = data.fh_skill_pool && data.fh_skill_pool.base;
  const rows = [
    ["Skill pool", Number.isInteger(pool) ? String(pool) : null],
    ["Hit points", data.hit_point_die],
    ["Primary ability", data.primary_ability],
    ["Saving throws", Array.isArray(data.saving_throw_proficiencies) ? data.saving_throw_proficiencies.join(", ") : null]
  ];
  const dl = el("dl", "class-card-list");
  for (const [label, value] of rows) {
    if (typeof value !== "string" || value === "") continue;
    const row = el("div", "class-card-row");
    row.append(el("dt", null, [text(label)]));
    row.append(el("dd", null, [text(value)]));
    dl.append(row);
  }
  card.append(dl);

  /* « other features » (B2) — les NOMS des features de niveau 1, lus sur
     `features[].level`. Le niveau 1 est le seul que le builder construit
     (`level` = 1 partout dans ce dépôt) ; afficher les vingt niveaux ferait
     défiler une classe sur plusieurs écrans, ce que B2.1f interdit. */
  const level1 = (Array.isArray(data.features) ? data.features : [])
    .filter((feature) => feature && feature.level === 1 && typeof feature.name === "string");
  if (level1.length > 0) {
    const block = el("div", "class-card-features");
    block.append(el("h3", null, [text("Level 1 features")]));
    const ul = el("ul", "class-card-feature-list");
    for (const feature of level1) ul.append(el("li", null, [text(feature.name)]));
    block.append(ul);
    card.append(block);
  }
  return card;
}

/* ══ LE MENU DES CHOIX INTRINSÈQUES (B2.3) — le PALIER 2 ═════════════════
   « La fenêtre majeure disparaît et le menu des choix apparaît. » Les douze
   fiches ne sont plus là : seules les molettes de choix restent, une par
   `class.skills[n]`. */
function renderChoiceMenu(ctx, act) {
  const decisions = ctx.decisions || [];
  const query = ctx.query;
  const menu = el("div", "class-choices");

  const qcm = renderSlotQcm({
    decisions, basePath: "class.skills", title: "Class skills",
    labelOf: (id) => skillLabel(query, id), onAction: act
  });
  if (qcm) menu.append(qcm); // absent si la classe n'a aucun skill_choice publié

  /* ══ LOT 46 — LA CONFIRMATION (voir confirm.mjs), INCHANGÉE ════════════
     Décision d'Eric, 2026-08-13 : les anciens `class.skills[n]` que le
     `choose` ne nettoie pas (verrouillés) DOIVENT s'effacer — mais après
     confirmation, en NOMMANT ce qui part.
     ⛔ C'EST LE CARNET QUI DÉSIGNE QUOI EFFACER : un créneau porte
     `decision.option-unavailable` si et seulement si son ancien choix n'est
     plus dans les options de la nouvelle classe — cette ligne ne refait
     AUCUNE comparaison, elle FILTRE sur le verrou déjà posé.
     📌 Elle vit au palier 2, et c'est plus juste qu'avant : le verrou
     n'apparaît qu'APRÈS le `choose` du palier 1, donc au moment exact où le
     joueur arrive ici. */
  const orphanedSkills = planSlots(decisions, "class.skills")
    .filter((slot) => slot.lock && slot.lock.key === "decision.option-unavailable");
  if (orphanedSkills.length > 0) {
    menu.append(renderConfirmDialog({
      title: "These skills are no longer valid for this class:",
      items: orphanedSkills.map((slot) => skillLabel(query, slot.lock.params.selected)),
      confirmLabel: "Clear them",
      cancelLabel: "Keep them locked",
      onConfirm: () => act({ kind: "resetSkills", paths: orphanedSkills.map((slot) => slot.path) }),
      onCancel: () => {}
    }));
  }
  return menu;
}

/**
 * @param {object} ctx
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {number} [ctx.palier]   1 = les douze fiches · 2 = le menu des choix
 * @param {number} [ctx.cursor]   le cran d'aimantation, écrit par le scrollspy
 * @param {(action: {kind:string, …}) => void} onAction
 */
export function renderClassStep(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "class-step");
  section.dataset.palier = String(ctx.palier === 2 ? 2 : 1);

  if (ctx.palier === 2) {
    section.append(renderChoiceMenu(ctx, act));
    return section;
  }

  const options = classOptions(ctx.decisions);
  if (options.length === 0) return section; // aucun plan `class` publié — rien à afficher
  const cards = el("div", "class-cards");
  for (const id of options) cards.append(renderClassCard(ctx.query, id));
  section.append(cards);
  return section;
}

/* ══ LES DEUX PALIERS DE `Validate` (I.4, B2.4) ══════════════════════════
   Ce que l'ÉCRAN sait, et rien de plus : ce que le palier courant confirme,
   et s'il est prêt. C'est `shell.mjs` qui possède l'enchaînement (SOCLE.md,
   « les trois verbes ») — cette fonction ne bouge rien, elle décrit.

   `action` est passé tel quel à `applyDecisionAction` : la MÊME forme de
   `choose` que le lot 42 produisait au clic (`{kind:"choose", path:"class",
   ref:{kind:"class", id}}`). Le verbe ne change pas ; c'est le GESTE qui a
   changé, et c'est tout le sens de II.1. */
export function classValidate(ctx) {
  const decisions = ctx.decisions || [];
  if (ctx.palier === 2) {
    /* « Validate 2 = features choisis. » Le plan dit combien sont attendus
       et combien sont répondus — jamais un compte refait ici. Une classe
       sans `skill_choice` n'a rien à répondre : le palier est prêt d'emblée. */
    const plan = planAt(decisions, "class.skills");
    return { ready: !plan || plan.answered >= plan.expected, action: null, next: "step" };
  }
  const options = classOptions(decisions);
  const cursor = Number.isInteger(ctx.cursor) ? ctx.cursor : 0;
  const id = options[cursor];
  if (!id) return { ready: false, action: null, next: "palier" };
  return {
    ready: true, // une fiche est toujours sous le doigt : un choix est toujours possible (B2.4)
    action: { kind: "choose", path: "class", ref: { kind: "class", id } },
    next: "palier"
  };
}
