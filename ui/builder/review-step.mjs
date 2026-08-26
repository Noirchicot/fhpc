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

   ── LOT 67 — LES TROIS PORTES DU BAS (B9.4, B9.5) ───────────────────────
   Le lot 65 les avait laissées ouvertes, faute de savoir si elles ouvraient
   sur quelque chose. Elles ouvrent — et **aucune des trois ne construit un
   rendu neuf** :

     · **`Expert view`** et **`Export HTML`** rendent la MÊME page :
       `render(document, report)` de `src/tools/render-fiche.mjs`, dans sa
       coquille. ⭐ **C'est exactement ce que cet écran déversait avant le
       lot 65** — chaque valeur avec son chemin, `underived`, `warnings`, les
       ancres d'override. Le masque ne l'a donc pas supprimé : il l'a mis
       derrière une porte. L'une l'ouvre, l'autre l'enregistre.
     · **`Export JSON`** rend le document, dans **les octets canoniques du
       moteur** (`canonicalText`, partagé avec `toBytes` — lot 67).

   ⛔ POURQUOI PAS DE BOUTON `sheet`. B9.5 demande « un accès à `sheet` », et
   `sheet` est **la fiche v2 jouable** — que la charte réserve explicitement
   à une décision d'Eric, et qui n'existe pas. Un bouton vers rien serait le
   « faux magasin » que le mandat interdit deux fois. **Il n'y en a pas, et
   c'est le seul point de B9 qui reste ouvert.**

   📌 ET B9.2 (« QUE DU TEXTE ») N'EST PAS CONTREDIT : il gouverne le
   RÉCAPITULATIF, pas les portes — c'est Eric lui-même qui pose un export et
   deux accès sur cet écran, en B9.4 et B9.5. Les portes sont en bas, dans la
   MÊME dalle (B9.3 : « une dalle majeure UNIQUE, pas plusieurs »). */

import { planAt } from "./carnet.mjs?v=301";

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
  { step: "concept", label: "Biography", paths: [] },
  { step: "abilities", label: "Abilities", paths: [] },
  /* ⚠️ `species.lineage` A ÉTÉ AJOUTÉ LE 2026-08-19, et son absence ici se
     serait vue : cinq espèces sur douze portent un lignage, et sans ce chemin
     un Dragonborn sans ancêtre choisi comptait pour FINI — au récapitulatif
     comme dans la lumière du belt, qui lit la même table. */
  { step: "species", label: "Species", paths: ["species", "species.lineage", "species.skills", "species.skillBudget"] },
  { step: "destiny", label: "Destiny", paths: [] },
  { step: "background", label: "Inheritance", paths: ["background", "background.boost", "background.originFeat[0]"] },
  /* LOT 72 — les sorts entrent au carnet (`class.cantrips`/`class.prepared`,
     decisions.mjs) : Review les montre comme n'importe quelle autre étape.
     Un non-lanceur n'a pas ces plans, `planAt` rend null, la ligne ne change
     pas — même mécanique que les chemins déjà listés. */
  /* ⭐ `class.weaponMastery` AJOUTÉ LE 2026-08-20, et son absence se serait vue
     exactement comme celle de `species.lineage` le 19 : cinq classes sur douze
     portent Weapon Mastery, et sans ce chemin un Roublard sans maîtrise
     choisie comptait pour FINI — au récapitulatif comme dans la lumière du
     belt, qui lit la même table. Un plan absent (un Magicien) ne change rien :
     `planAt` rend `null`, la ligne ne bouge pas. */
  { step: "class", label: "Class",
    paths: ["class", "class.skillBudget", "class.weaponMastery", "class.cantrips", "class.prepared"] },
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
/** ⭐ EST-CE QUE CETTE ÉTAPE EST FINIE ? — LE SEUL JUGE, ET IL EST ICI.
 *
 *  Il existait déjà, fondu dans la boucle de Review. Le belt en avait besoin
 *  à son tour (la lumière verte, Eric 2026-08-19), et le recopier là-bas
 *  aurait fait DEUX réponses à une seule question — la faute que ce dépôt
 *  paie le plus cher (voir la tête de `resolvedRef`, côté moteur). Extrait,
 *  exporté, appelé par les deux.
 *
 *  ⛔ IL NE JUGE RIEN LUI-MÊME : il assemble ce que le carnet a prononcé
 *  (`etatDuPlan`) et ce que le document PORTE (`presences`). Aucun seuil ici.
 *
 *  ⚠️ UNE ÉTAPE SANS AUCUN FAIT N'EST PAS FINIE — `etats.length > 0`. Sans
 *  cette moitié, une étape muette s'allumerait en vert d'entrée de jeu, ce
 *  qui est exactement le mensonge qu'on vient de retirer au belt. */
export function etapeFaite({ decisions, document, resolved }, stepId) {
  const groupe = REVIEW_GROUPS.find((g) => g.step === stepId);
  if (!groupe) return false;
  const etats = groupe.paths
    .map((path) => planAt(decisions || [], path))
    .filter(Boolean)
    .map(etatDuPlan)
    .concat(presences(groupe.step, document || null, resolved || null));
  return etats.length > 0 && etats.every((e) => e.fait);
}

export function renderReviewStep(ctx, onAction) {
  const decisions = ctx.decisions || [];
  const document = ctx.document || null;
  const resolved = ctx.resolved || null;
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "review-step");

  /* B9.3 — UNE DALLE MAJEURE, UNE SEULE. Tout tient dedans. */
  const dalle = el("section", "review-mask dalle-intermediaire");

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

  dalle.append(renderPortes(act));
  section.append(dalle);
  return section;
}

/* ══ LE NOM DU FICHIER QUI SORT ══════════════════════════════════════════
   Il vient du nom du personnage, et de rien d'autre : un horodatage ferait
   deux exports du même personnage se ranger comme deux personnages, et le
   joueur ne saurait plus lequel est à jour. Écraser est le comportement
   voulu — c'est SON fichier.
   ⚠️ `.fh-char.json` est la forme des fichiers du dépôt (`examples/`), pas
   une invention de cet écran. */
export function nomDeFichier(document, suffixe) {
  const brut = document && typeof document.name === "string" ? document.name : "";
  const slug = brut.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug || "character"}.${suffixe}`;
}

/* Les trois portes. ⛔ Elles n'ont AUCUNE condition d'affichage : un
   personnage à peine commencé s'exporte aussi — c'est un brouillon valide
   (schéma dérivé, lot 47), et le cacher jusqu'à « fini » ferait de l'export
   une récompense au lieu d'une sortie. */
function renderPortes(act) {
  const portes = el("div", "review-portes");
  portes.append(bouton("Expert view", "review-porte", () => act({ kind: "expertView" })));
  portes.append(bouton("Export JSON", "review-porte", () => act({ kind: "exportJson" })));
  portes.append(bouton("Export HTML", "review-porte", () => act({ kind: "exportHtml" })));
  return portes;
}

function bouton(libelle, className, onClick) {
  const b = el("button", className, [text(libelle)]);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

/** Review est la DESTINATION : il n'y a pas de pas suivant, donc pas de
 *  palier. `Validate` y reste éteint — c'est déjà ce que faisait le bouton
 *  final depuis le lot 55, et la loi vient de là. */
export function reviewValidate() {
  return { exists: true, ready: false, action: null, next: "step" };
}
