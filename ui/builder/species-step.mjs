/* ══ L'ÉTAPE SPECIES — lot 42, REFAITE AU LOT 60 (B3 = B2) ════════════════
   Eric, 2026-08-14 : *« l'étape 3 va être identique à la 2 »*. Species est
   donc le MÊME écran que Class — catalogue à défilement aimanté, rail,
   `Validate` à paliers — et tout ça vit dans `catalogue.mjs`, partagé.
   ⛔ ERGONOMIE-BUILDER.md l'exige mot pour mot : *« Ne recopie pas B2 ici.
   Une règle écrite deux fois diverge. B3 = B2, point. »*

   Ce fichier ne garde donc que **ce qui appartient à Species** : à quoi
   ressemble une fiche d'espèce, et ce que confirme son 2ᵉ palier.

   ── LES TROIS ÉTATS D'ESPÈCE (lot 42, §3c) — LE CARNET DIT LEQUEL, jamais
   le nom de l'espèce :
     · `species.skillBudget` publié → LA BOURSE CAPTIVE (Elf, Elestu) : des
       points sur des compétences nommées, palier au choix par compétence ;
     · `species.skills` publié → UN CHOIX IMPOSÉ (Human, Araag) — même QCM
       que `class.skills` ;
     · ni l'un ni l'autre (Loroka, et 8 autres) → RIEN.
   ⭐ ET CE TROISIÈME CAS EST CE QUE LE LOT 60 A DÛ TRANCHER : une espèce qui
   n'accorde rien n'a **QU'UN SEUL PALIER**. Un 2ᵉ appui sur un menu vide
   serait un geste pour rien. I.4 le prévoit : « un écran peut en compter un,
   deux ou trois ».

   ⛔ LE LIGNAGE NE SE CHOISIT TOUJOURS PAS (lot 42, §0.4) : le personnage
   d'exemple porte `species.lineage`, mais AUCUN plan ne l'accompagne — le
   moteur le rend `unconsumed`. Un QCM ici afficherait un choix sans effet. */

import { planAt, renderPicker, renderSlotQcm, decisionRefusalWord } from "./carnet.mjs?v=60";
import { renderFicheBody, renderCardRows, renderCardNames, imageDeFiche, DOS_DE_CARTE } from "./catalogue.mjs?v=60";

/* ✅ LES DOUZE IMAGES SONT ARRIVÉES LE 2026-08-16, et la promesse écrite ici
   est tenue à la lettre : *« le jour où les images arrivent, elles arrivent
   pour les deux écrans AU MÊME ENDROIT »*. `imageDeFiche` et le dos de carte
   vivent maintenant dans `catalogue.mjs`, le fichier que les deux écrans à
   fiche partagent déjà — pas recopiés ici.
   📌 Le record se nomme `gnome` (l'id SRD) et Fate's Hand l'appelle
   **Hoddon** dans sa couche de lore : le fichier posé est donc `gnome.webp`.
   Le dossier ne connaît que des ids, jamais des noms d'affichage. */

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
/* Capitalisation d'AFFICHAGE seulement (« half » → « Half ») — un mot
   d'écran, pas une règle (même famille que `CATEGORY_LABEL`, lot 39). */
function tierLabel(value) {
  return typeof value === "string" && value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}

/* `fiche: true` — même déclaration que Class, même raison (Ch6) : cet écran
   passe par `renderFicheBody`, ses dalles portent `LORE` / `CHOOSE`, et
   `CHOOSE` y remplace le `Validate` générique. « B3 = B2 », jusqu'au bout. */
export const SPECIES_CATALOGUE = { path: "species", kind: "species", label: "Species", fiche: true };

/** LE CORPS D'UNE FICHE D'ESPÈCE — lot 77. ⭐ C'EST EXACTEMENT LA FICHE DE
 *  CLASS, et c'est le point : `renderFicheBody` est écrit une fois, les deux
 *  écrans ne lui passent que LEUR record. Ce qui les distingue tient
 *  entièrement dans la couche (`Type` · `Sz` · `Speed` · `Lineages` chez
 *  l'espèce, `Ability` · `HP` · `Saves` … chez la classe), plus dans le 2ᵉ
 *  palier plus bas — pas dans le dessin.
 *
 *  ✅ TRANCHÉ PAR ERIC, 2026-08-15 (lot 78) : LA MOITIÉ BASSE D'UNE ESPÈCE
 *  PORTE SES TRAITS, comme son croquis A — pas le blurb.
 *
 *  ⭐ DONC *« B3 = B2 »* NE VAUT QUE POUR LA GÉOMÉTRIE. La boîte reste fixe
 *  à 160 px et à la même place ; ce qu'on y met appartient à l'écran. Les
 *  deux croquis d'Eric ne disaient pas la même chose de cette moitié-là, et
 *  le lot 77 avait remonté l'écart au lieu de le trancher.
 *
 *  📏 LA COTE, ET ELLE EST PLUS DURE QUE CELLE DU BLURB (mesurée aux avances
 *  réelles, boîte de 226 px à T2) : une ligne porte 37 caractères, la boîte
 *  en tient 10, et le PIRE CAS est l'Elfe — 5 traits SRD + `Splinter of Anon`
 *  + `Destiny` = **7 entrées**.
 *  ⚠️ Une première cote annonçait 6 : elle comptait les traits SRD seuls et
 *  oubliait les `fh_traits` que la couche FH ajoute (l'`Outlasting` du
 *  halfling, les deux de l'Humain). Un échantillon incomplet, encore.
 *  Le garde tient maintenant la vraie propriété — des LIGNES RENDUES, pas
 *  des caractères (`tests/fiche-360.test.mjs`). */
export function renderSpeciesCardBody(query, id) {
  const view = query({ kind: "species", id });
  const data = (view && view.record && view.record.data) || {};
  if (!Array.isArray(data.fiche_stats)) return renderSpeciesCardBodySrd(data);
  return renderFicheBody({
    stats: data.fiche_stats,
    traits: data.fiche_traits,
    /* `Lineages` a quitté la colonne de stats pour sa propre bande (croquis
       d'Eric) — le TRI est dans la COUCHE, pas ici : une règle du jeu ne vit
       jamais dans un écran. Sept espèces sur douze n'en ont pas, et leur
       fiche centre alors son blurb. */
    infos: data.fiche_infos,
    image: imageDeFiche(id),
    imageSecours: DOS_DE_CARTE,
    imageAlt: ""
  });
}

/** LA FICHE D'ESPÈCE D'UN PERSONNAGE SRD PUR — même raison qu'à Class (loi
 *  §0.12), même geste : le corps d'avant le lot 77, gardé intact, servi
 *  quand la couche `fh-fiche-en` n'est pas montée. */
function renderSpeciesCardBodySrd(data) {
  const sens = Array.isArray(data.senses)
    ? data.senses.map((s) => (s && s.range_ft ? `${s.name} ${s.range_ft} ft` : s && s.name)).filter(Boolean).join(", ")
    : null;
  const destiny = data.destiny && data.destiny.base;
  const bump = data.skill_points && data.skill_points.by_level && data.skill_points.by_level["1"];
  const rows = renderCardRows([
    ["Size", data.size],
    ["Speed", data.speed],
    ["Creature type", data.creature_type],
    ["Senses", sens],
    ["Destiny", Number.isFinite(destiny) ? String(destiny) : null],
    ["Skill points", Number.isFinite(bump) ? `+${bump}` : null]
  ]);
  const traits = (Array.isArray(data.traits) ? data.traits : [])
    .map((t) => t && t.name).filter((n) => typeof n === "string");
  return [rows, renderCardNames("Traits", traits)].filter(Boolean);
}

/* ══ LA BOURSE CAPTIVE (Keen Senses…) ════════════════════════════════════
   `species.skillBudget`, ses propres verbes sur `species.skillBudget.<slug>`
   — les MÊMES chemins que `skills-step.mjs` sait déjà lire et écrire : les
   deux écrans opèrent sur le même document, aucune incohérence possible. */

/* ⚠️ L'EXCEPTION DU LOT 42, CONSERVÉE TELLE QUELLE, et sa raison : un slug
   JAMAIS CLIQUÉ ne porte AUCUNE entrée dans `decisions[]` (les sous-plans ne
   sont générés que pour les chemins déjà présents dans `build.choices`). Sur
   une espèce fraîchement choisie, il n'existe donc AUCUN endroit vivant où
   lire la paire `half`/`proficient`. Un repli à `[]` ferait disparaître les
   boutons de palier tant que le joueur n'a rien cliqué — c'est l'attaque qui
   avait trouvé ce bogue au lot 42. */
const BUDGET_TIERS = ["half", "proficient"];

function renderSpeciesBudget(ctx, budgetPlan, act) {
  const { decisions, query } = ctx;
  const wrap = el("section", "skills-budget-block");
  wrap.dataset.status = budgetPlan.status;
  wrap.append(el("h3", null, [text("Species skill budget")]));
  wrap.append(el("p", "skills-budget-note", [text(`${budgetPlan.answered} of ${budgetPlan.expected} points spent`)]));
  if (budgetPlan.lock) wrap.append(el("p", "skills-refusal", [text(decisionRefusalWord(budgetPlan.lock))]));
  const rows = el("div", "skills-rows");
  for (const slug of budgetPlan.options) {
    const path = `species.skillBudget.${slug}`;
    const step = planAt(decisions, path);
    const row = el("div", "skills-row");
    row.dataset.row = slug;
    row.append(el("span", "record-row-label", [text(skillLabel(query, slug))]));
    row.append(renderPicker({
      options: step ? step.options : BUDGET_TIERS,
      selected: step ? step.selected : [],
      labelOf: tierLabel,
      onSelect: (value) => act({ kind: "set", path, value }),
      onClear: () => act({ kind: "clear", path }),
      lock: step ? step.lock : null
    }));
    rows.append(row);
  }
  wrap.append(rows);
  return wrap;
}

/** LE MENU DU 2ᵉ PALIER — la bourse OU le QCM, jamais les deux, jamais rien
 *  (si c'était rien, il n'y aurait pas de 2ᵉ palier : voir `speciesPalier2`). */
export function renderSpeciesChoices(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const act = onAction || ctx.onAction || (() => {});
  const menu = el("div", "catalogue-choices");
  const budget = planAt(decisions, "species.skillBudget");
  if (budget) {
    menu.append(renderSpeciesBudget(ctx, budget, act));
    return menu;
  }
  const qcm = renderSlotQcm({
    decisions, basePath: "species.skills", title: "Species skill",
    labelOf: (id) => skillLabel(ctx.query, id), onAction: act
  });
  if (qcm) menu.append(qcm);
  return menu;
}

/** LE 2ᵉ PALIER DE SPECIES — `null` quand l'espèce n'accorde rien.
 *
 *  ⚠️ CE QU'ERIC N'A PAS DIT, ET QUI EST DONC INFÉRÉ : ERGONOMIE-BUILDER.md
 *  le signale lui-même — « le 2ᵉ palier de Validate est-il ce budget ? Sur
 *  Class, Validate 2 = features choisis. L'équivalent ici serait le budget
 *  d'espèce — inféré, pas dit par Eric ». C'est la lecture retenue : elle
 *  découle de « B3 = B2 », et elle est la seule qui donne un sens au 2ᵉ
 *  appui. Signalée ici plutôt que fondue dans le code. */
export function speciesPalier2(decisions) {
  const budget = planAt(decisions, "species.skillBudget");
  if (budget) return { ready: budget.answered >= budget.expected };
  const qcm = planAt(decisions, "species.skills");
  if (qcm) return { ready: qcm.answered >= qcm.expected };
  return null; // Loroka & co : un seul palier
}
