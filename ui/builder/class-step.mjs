/* ══ L'ÉTAPE CLASS — lot 42, refaite au lot 58 (B2), AMINCIE AU LOT 60 ════
   Même loi que Compétences (lot 39), inchangée : le moteur prononce, l'écran
   affiche. ZÉRO règle de jeu ici.

   ⭐ CE QUI A CHANGÉ AU LOT 60 : le catalogue à défilement aimanté (les douze
   fiches, le rail, les deux paliers) est parti dans `catalogue.mjs`, parce
   que Species est LE MÊME ÉCRAN (Eric : « l'étape 3 va être identique à la
   2 ») et que le recopier aurait produit les deux copies que la loi du dépôt
   interdit. Ce fichier ne garde que **ce qui appartient à Class** : à quoi
   ressemble une fiche de classe, et ce que confirme son 2ᵉ palier.

   🔴 LES INVARIANTS QUE LE LOT 58 A POSÉS TIENNENT TOUJOURS : il n'y a AUCUN
   geste de sélection (II.1 — on défile, le défilement s'aimante, la fiche
   sur laquelle on se pose EST la classe choisie), et AUCUN bouton dans la
   fiche (B2.1e, I.3 — `Validate` est unique et vit dans la barre du haut).

   ── ⚠️ CE QUE LES DONNÉES NE PORTENT PAS, mesuré au lot 58 ───────────────
   B2.1c décrit « image → ambiance → features ». Aucune image de classe
   n'existe dans le dépôt, et `data.description` (622-642 caractères) n'est
   PAS de l'ambiance : c'est de la comptabilité de multiclassage. Ni l'une ni
   l'autre n'est inventée ici — voir INVENTAIRE-LOT-58.md. */

import { planAt, planSlots, renderSlotQcm } from "./carnet.mjs";
import { renderCardRows, renderCardNames } from "./catalogue.mjs";
import { renderConfirmDialog } from "./confirm.mjs";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}

function skillLabel(query, id) {
  const view = query({ kind: "skill", id });
  return view && view.record ? view.record.name : id;
}

/* LOT 72 — le même geste pour un sort : le NOM vient du record, jamais
   recomposé ici (loi §0.13 côté écran : on descend des mots, on n'en
   fabrique pas). */
function spellLabel(query, id) {
  const view = query({ kind: "spell", id });
  return view && view.record ? view.record.name : id;
}

/* LOT 72 — les deux groupes de sorts du 2ᵉ palier. UNE TABLE, pas deux
   copies : le QCM, la confirmation d'effacement et le palier lisent la
   même liste — en ajouter un troisième (un jour : les sorts d'un lignage ?)
   est une ligne ici, pas un écran neuf. */
const SPELL_QCMS = [
  { basePath: "class.cantrips", title: "Cantrips", slotWord: "Cantrip" },
  { basePath: "class.prepared", title: "Prepared spells", slotWord: "Spell" }
];

export const CLASS_CATALOGUE = { path: "class", kind: "class", label: "Classes" };

/** LE CORPS D'UNE FICHE DE CLASSE — les quatre que B2 nomme (« skill pool ·
 *  HP · primary ability · saves »), AFFICHÉES TELLES QUE LE RECORD LES PORTE
 *  (`hit_point_die` est déjà une phrase, `primary_ability` un mot complet),
 *  puis les features de NIVEAU 1 (`features[].level`). */
export function renderClassCardBody(query, id) {
  const view = query({ kind: "class", id });
  const data = (view && view.record && view.record.data) || {};
  /* Le pool vient de la couche FH (`data.fh_skill_pool.base`) : absent d'un
     personnage SRD pur, la ligne ne s'affiche pas — jamais un zéro inventé. */
  const pool = data.fh_skill_pool && data.fh_skill_pool.base;
  const rows = renderCardRows([
    ["Skill pool", Number.isInteger(pool) ? String(pool) : null],
    ["Hit points", data.hit_point_die],
    ["Primary ability", data.primary_ability],
    ["Saving throws", Array.isArray(data.saving_throw_proficiencies) ? data.saving_throw_proficiencies.join(", ") : null]
  ]);
  const level1 = (Array.isArray(data.features) ? data.features : [])
    .filter((f) => f && f.level === 1 && typeof f.name === "string")
    .map((f) => f.name);
  return [rows, renderCardNames("Level 1 features", level1)].filter(Boolean);
}

/* ══ LE MENU DES CHOIX INTRINSÈQUES (B2.3) — LE PALIER 2 ═════════════════
   « La fenêtre majeure disparaît et le menu des choix apparaît. » */
export function renderClassChoices(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const query = ctx.query;
  const act = onAction || ctx.onAction || (() => {});
  const menu = el("div", "catalogue-choices");

  const qcm = renderSlotQcm({
    decisions, basePath: "class.skills", title: "Class skills",
    labelOf: (id) => skillLabel(query, id), onAction: act
  });
  if (qcm) menu.append(qcm);

  /* ══ LOT 72 — LES SORTS, LE MÊME QCM ═══════════════════════════════════
     `renderSlotQcm` rend `null` sans plan : un Rogue n'affiche RIEN ici —
     jamais un cadre vide. `refKind: "spell"` fait poser un `choose` (un sort
     est un record), le reste est mot pour mot le geste de `class.skills`. */
  for (const groupe of SPELL_QCMS) {
    const bloc = renderSlotQcm({
      decisions, basePath: groupe.basePath, title: groupe.title, slotWord: groupe.slotWord,
      refKind: "spell", labelOf: (id) => spellLabel(query, id), onAction: act
    });
    if (bloc) menu.append(bloc);
  }

  /* ══ LOT 46 — LA CONFIRMATION, INCHANGÉE ═══════════════════════════════
     Les anciens `class.skills[n]` que le `choose` ne nettoie pas
     (verrouillés) DOIVENT s'effacer — après confirmation, en NOMMANT ce qui
     part (décision d'Eric, 2026-08-13).
     ⛔ C'EST LE CARNET QUI DÉSIGNE QUOI EFFACER : cette ligne ne refait
     aucune comparaison, elle FILTRE sur le verrou déjà posé. */
  const orphelins = planSlots(decisions, "class.skills")
    .filter((slot) => slot.lock && slot.lock.key === "decision.option-unavailable");
  if (orphelins.length > 0) {
    menu.append(renderConfirmDialog({
      title: "These skills are no longer valid for this class:",
      items: orphelins.map((slot) => skillLabel(query, slot.lock.params.selected)),
      confirmLabel: "Clear them",
      cancelLabel: "Keep them locked",
      onConfirm: () => act({ kind: "resetSkills", paths: orphelins.map((slot) => slot.path) }),
      onCancel: () => {}
    }));
  }

  /* ══ LOT 72 — LA MÊME CONFIRMATION POUR LES SORTS — jamais un effacement
     silencieux : on NOMME ce qui part, et on demande (le patron du lot 46,
     étendu, pas un mécanisme neuf). C'était le trou mesuré par Eric le
     2026-08-14 : Wizard → Rogue, 7 sorts orphelins listés dans Review, aucun
     moyen de s'en débarrasser. Le carnet les verrouille désormais (lot 72,
     `decisions.mjs`) ; cette boîte ne fait que LIRE le verrou — une boîte À
     PART de celle des compétences, parce qu'elle nomme d'autres pertes, pas
     parce que le geste diffère (`resetSkills` = « efface ces chemins, un
     seul rebuild », il n'a jamais su ce qu'est une compétence). */
  const sortsOrphelins = SPELL_QCMS.flatMap((groupe) => planSlots(decisions, groupe.basePath))
    .filter((slot) => slot.lock && slot.lock.key === "decision.option-unavailable");
  if (sortsOrphelins.length > 0) {
    menu.append(renderConfirmDialog({
      title: "These spells are no longer valid for this class:",
      items: sortsOrphelins.map((slot) => spellLabel(query, slot.lock.params.selected)),
      confirmLabel: "Clear them",
      cancelLabel: "Keep them locked",
      onConfirm: () => act({ kind: "resetSkills", paths: sortsOrphelins.map((slot) => slot.path) }),
      onCancel: () => {}
    }));
  }
  return menu;
}

/** LE 2ᵉ PALIER DE CLASS : « Validate 2 = features choisis » (B2.4). Le plan
 *  dit combien sont attendus et combien sont répondus — jamais un compte
 *  refait ici. `null` si la classe ne publie aucun choix : elle n'a alors
 *  qu'UN palier (voir `catalogueValidate`).
 *
 *  LOT 72 — le palier lit TOUS les plans du menu (compétences ET sorts) :
 *  un magicien à 3/3 compétences mais 0/3 sorts mineurs n'est pas prêt.
 *  Même règle qu'avant pour chacun (`answered >= expected`), appliquée à
 *  chaque plan présent — un plan absent (Rogue : pas de sorts) ne compte
 *  pas, et une classe sans AUCUN plan garde son palier unique. */
export function classPalier2(decisions) {
  const plans = ["class.skills", ...SPELL_QCMS.map((groupe) => groupe.basePath)]
    .map((path) => planAt(decisions, path))
    .filter(Boolean);
  if (plans.length === 0) return null;
  return { ready: plans.every((plan) => plan.answered >= plan.expected) };
}
