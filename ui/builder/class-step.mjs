/* ══ L'ÉTAPE CLASS — lot 42 ══════════════════════════════════════════════
   Même loi que Compétences (lot 39) : le moteur prononce, l'écran affiche.
   ZÉRO règle de jeu ici — pas de compte recalculé, pas de liste composée à
   la main. `decisions[]` publie déjà le choix du RECORD lui-même comme un
   plan (`class`, 12 options), et le QCM qui le suit (`class.skills`,
   compte et options LUS au plan — jamais `2` écrit en dur : c'est faux pour
   Barde/Rôdeur (3) et Roublard (4), mesuré §0 de la commande).

   ── CE QUI SE PASSE QUAND ON CHANGE DE CLASSE (§3b.3, mesuré) ────────────
   Les anciens `class.skills[n]` NE sont PAS nettoyés par un `choose` sur
   `class` : ils restent dans `build.choices`, et le carnet les republie au
   prochain slot (`class.skills[0]`, `[1]`…) VERROUILLÉS
   (`decision.option-unavailable`, leur valeur n'est plus dans les options
   de la nouvelle classe) — PENDANT que le moteur ouvre EN PLUS de nouveaux
   slots vides pour combler le compte `expected` de la nouvelle classe.
   Mesuré : Magicien (2, arcana/investigation) → Guerrier (2) laisse 4
   entrées `class.skills[n]` (2 verrouillées + 2 vides), pas 2. Voir
   INVENTAIRE-LOT-42.md pour le JSON exact et la proposition — CET écran ne
   tranche pas : il rend les quatre lignes, chacune avec son verrou éventuel,
   et le tiret de chaque ligne (`renderPicker`) suffit au joueur pour nettoyer
   lui-même l'ancien choix. Rien n'est cousu, rien n'est caché. */

import { renderRecordChoice, renderSlotQcm, planSlots } from "./carnet.mjs";
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

/* ══ LA BOÎTE D'INFO — UNE SEULE DES DEUX (§3b.4) ═══════════════════════
   Le schéma d'Eric (vault, §1) prévoit *technical info* ET *lore info*
   côte à côte. Ce lot n'en pose qu'une : LA TECHNIQUE — `hit_point_die`
   (déjà une PHRASE sur le record, « D6 per Wizard level », pas le nombre
   brut `hit_die` qu'il aurait fallu préfixer « d » soi-même), `primary_
   ability` (déjà un mot complet), `saving_throw_proficiencies` (déjà les
   noms complets, pas `saving_throw_keys` qu'il aurait fallu abréger). Les
   TROIS sont donc affichés TELS QUE LE RECORD LES PORTE — zéro mot composé
   ici, contrairement à ce qu'aurait demandé `hit_die`/`saving_throw_keys`.
   `description` (la lore) reste dehors : c'est une prose SRD brute de
   plusieurs milliers de caractères (tables de fonctionnalités comprises,
   non mises en forme) — l'afficher proprement est un travail de mise en
   page à part, hors du périmètre "afficher, pas calculer" de ce lot. Voir
   INVENTAIRE-LOT-42.md, « quelle boîte d'info tu as retenue et pourquoi ». */
function renderClassInfo(view) {
  const data = (view.record && view.record.data) || {};
  const wrap = el("aside", "record-info");
  wrap.append(el("h3", null, [text(view.record.name)]));
  const dl = el("dl", "record-info-list");
  const rows = [
    ["Hit points", data.hit_point_die],
    ["Primary ability", data.primary_ability],
    ["Saving throws", Array.isArray(data.saving_throw_proficiencies) ? data.saving_throw_proficiencies.join(", ") : null]
  ];
  for (const [label, value] of rows) {
    if (typeof value !== "string" || value === "") continue;
    const row = el("div", "record-info-row");
    row.append(el("dt", null, [text(label)]));
    row.append(el("dd", null, [text(value)]));
    dl.append(row);
  }
  wrap.append(dl);
  return wrap;
}

/**
 * @param {object} ctx
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {(action: {kind:"choose"|"set"|"clear", path:string, ref?:object, value?:*}) => void} onAction
 */
export function renderClassStep(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const query = ctx.query;
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "class-step");

  const choice = renderRecordChoice({
    decisions, path: "class", kind: "class", title: "Class", query, onAction: act
  });
  if (!choice) return section; // aucun plan `class` publié — rien à afficher (personnage sans couche de classe)
  section.append(choice.node);

  const selectedId = choice.plan.selected[0];
  if (!selectedId) return section; // aucune classe encore posée — pas de QCM, pas de boîte d'info

  const view = query({ kind: "class", id: selectedId });
  if (view) section.append(renderClassInfo(view));

  const qcm = renderSlotQcm({
    decisions, basePath: "class.skills", title: "Class skills",
    labelOf: (id) => skillLabel(query, id), onAction: act
  });
  if (qcm) section.append(qcm); // absent si la classe n'a aucun skill_choice publié (aucune classe SRD/FH aujourd'hui, mais un futur record pourrait)

  /* ══ LOT 46 — LA PREMIÈRE CONFIRMATION DU BUILDER (voir confirm.mjs) ═══
     Décision d'Eric, 2026-08-13 : les anciens `class.skills[n]` que le
     paragraphe ci-dessus décrit (verrouillés, PAS nettoyés par le `choose`
     qui change de classe) DOIVENT s'effacer — mais seulement APRÈS
     confirmation, et en NOMMANT ce qui part (jamais un « êtes-vous sûr ? »).
     ⛔ C'EST LE CARNET QUI DÉSIGNE QUOI EFFACER : un créneau porte
     `decision.option-unavailable` si et seulement si son ancien choix n'est
     plus dans les options de la nouvelle classe — cette ligne ne refait
     AUCUNE comparaison, elle ne fait que FILTRER sur le verrou déjà posé. */
  const orphanedSkills = planSlots(decisions, "class.skills")
    .filter((slot) => slot.lock && slot.lock.key === "decision.option-unavailable");
  if (orphanedSkills.length > 0) {
    section.append(renderConfirmDialog({
      title: "These skills are no longer valid for this class:",
      items: orphanedSkills.map((slot) => skillLabel(query, slot.lock.params.selected)),
      confirmLabel: "Clear them",
      cancelLabel: "Keep them locked",
      /* `resetSkills` existe déjà dans `shell.mjs` (lot 39, pour le bouton
         Reset de Compétences) : générique, il ne fait qu'un `clear` par
         chemin puis UN SEUL `rebuild` — exactement ce qu'il faut ici,
         SANS toucher `shell.mjs`. */
      onConfirm: () => act({ kind: "resetSkills", paths: orphanedSkills.map((slot) => slot.path) }),
      /* Annuler NE TOUCHE RIEN — aucun `onAction`, donc aucun verbe, donc
         aucune mutation du document (commande §3, test 8). */
      onCancel: () => {}
    }));
  }

  return section;
}
