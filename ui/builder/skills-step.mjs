/* ══ L'ÉTAPE SKILLS — LOT 171, le croquis d'Eric du 2026-09-07 ═══════════════
   `fh-phb/croquis/2026-09-07-skills-reconstruction.jpg`, et ses réponses du
   même soir (INVENTAIRE-LOT-171.md §③ et §④). Ce fichier remplace celui du
   lot 39 (26/08, trois bandes) — reconstruit, pas patché.

   LA LOI DU FICHIER N'A PAS CHANGÉ : zéro règle de jeu ici. Le moteur prononce
   (`resolved`, `decisions[]`, `validate().violations`), l'écran affiche et
   émet des verbes (`set` · `clear` · `resetSkills` · `popup`). Jamais un calcul
   de points, jamais un « est-ce que j'ai le droit ».

   L'ÉCRAN, DE HAUT EN BAS (le croquis, mot pour mot) :
     · pas de titre — *« le titre est déjà dans le belt »* ;
     · une DALLE HAUTE fixe : l'AIGUILLEUR (3 lignes T1, le gendarme rouge le
       recouvre en cas de refus, la conclusion verte quand l'étape est signée),
       puis deux colonnes — BOUND POINTS (Skills · Tools · Trainings, en lecture
       seule, un tap ouvre le popup « Bound » par source) et FREE POINTS
       (Budget · Spent, le Spent bleu en cours, vert au compte, rouge au-delà) ;
     · un TAMBOUR de catégories : six crans en boucle, trois en vue, le cran
       central fixe avec son halo, les voisins grisés, deux chevrons ; un glisser
       latéral sur la fenêtre change de page ;
     · une FENÊTRE : UNE PAGE PAR CATÉGORIE — nom · carac · bonus · trois ronds
       (◐ ● ◉) ; le lié porte un halo violet et reste captif, le libre se remplit
       en vert ; vertical scroll si la page déborde ;
     · un PIED fixe, que la coquille garnit : livre · Reset · Done/Next · `?`.

   TOOLS ET TRAININGS ne listent que l'acquis (lié + acheté + ajouté), et un
   bouton « Add » ouvre la liste entière ; l'objet ajouté arrive VIDE et se
   remplit avec des points libres. Les langues sont des trainings.

   ── CE QUI VIT ICI ET MEURT AVEC LA SESSION ─────────────────────────────
   La page courante du tambour et les lignes AJOUTÉES sans point (un outil
   choisi dans la liste, pas encore rempli) sont de l'ÉTAT D'ÉCRAN, comme
   `positionDuTambour` d'Equipment : rien au personnage tant qu'aucun point
   n'est posé. Le jour où un point l'est, le document le porte
   (`fh.skills.spend.<slug>`), et l'écran n'a plus rien à retenir. */

import { planAt, violationAt, markPressed, decisionRefusalWord } from "./carnet.mjs?v=598";
import { lienSkillFhWeb } from "./liens-fh.mjs?v=598";
import { swapContent } from "./socle.mjs?v=598";
import { renderChoixGlisses } from "./glisser.mjs?v=598";

/* ── LES PAGES DU TAMBOUR — un rangement, aucun effet de règle ─────────────
   Les quatre catégories de compétences viennent de la COUCHE (`data.category`
   sur chaque record de skill) ; leur ordre et leurs mots sont du vocabulaire
   d'écran, comme les intitulés d'étape. Une compétence sans catégorie (pile
   SRD nue) tombe dans une page « Skills » unique. Tools et Trainings sont
   toujours les deux dernières pages. */
const CATEGORIES = ["knowledge", "social", "exploration", "physical"];
const CATEGORY_LABEL = { knowledge: "Knowledge", social: "Social", exploration: "Exploration", physical: "Physical" };
const UNSORTED_LABEL = "Skills";
/* « 5 cases, on reste en T2, Tools & Trainings en une case » (Eric, 07/09 05:5x) :
   la cinquième page porte les deux listes, chacune avec sa ligne d'ajout. */
const PAGE_KIT = { id: "kit", label: "Tools & Trainings" };

/* ── LES TROIS RONDS — ◐ ● ◉, et rien de rempli = pas compétent ──────────
   Eric, 07/09 : *« un demi, un plein, un plein entouré, c'est bien »*. Les
   noms viennent du canon (Novice · Adept · Expert) ; les clefs machine sont
   celles du moteur (`tier_costs`), triées par coût croissant — cet écran ne
   sait pas laquelle est la moins chère, il le LIT. */
const TIER_GLYPH = ["◐", "●", "◉"];
const TIER_LABEL = { novice: "Novice", adept: "Adept", expert: "Expert" };
const TIER_RANK = { none: 0, novice: 1, adept: 2, expert: 3 };

/* ── LES MOTS DES REFUS — les clefs du moteur, dites en anglais de joueur ──
   (voir la tête du fichier du lot 39 : `src/labels.mjs` ne porte qu'un paquet
   français d'architecte). EXPORTÉE : le gendarme de n'importe quelle étape
   lit ici (`motDuVerrou`, shell.mjs). */
export const REFUSAL_WORDS = {
  "skill-pool.overspent": (p) => `Overspent by ${p.over} — ${p.spent} of ${p.available} spent.`,
  "skill-spend.option-unavailable": (p) => `“${p.selected}” isn't on the catalogue.`,
  "skill-spend.tier-invalid": (p) => `“${p.value}” isn't a valid tier.`,
  "skill-spend.below-floor": (p) => `Can't drop below the bound floor (${TIER_LABEL[p.floor] || p.floor}).`,
  "skill-spend.tier-locked": (p) => `Expertise unlocks at level ${p.unlockLevel} — this character is ${p.level}.`,
  /* Le plafond du niveau 1 (lot 169, puis 171 : bourse comprise). Ce n'est PAS
     le verrou de niveau — celui-là est ouvert, c'est le COMPTE qui refuse. */
  "skill-spend.expertise-capped": (p) => `Only ${p.max} Expertises at level ${p.throughLevel} — this one is one too many.`,
  /* Le plafond du TRAIT (lot 171 — Eric, 07/09 : « une Expertise grâce à Late
     Bloomer »). Le mot nomme le trait et le niveau où la classe prend le relais. */
  "skill-spend.trait-expertise-capped": (p) => `${p.feature} grants ${p.max} Expertise${p.max === 1 ? "" : "s"} before level ${p.unlockLevel} — this one is one too many.`,
  "skill-trait.value-invalid": () => "A trait is carried or it isn't — true or false.",
  "skill-trait.unknown": (p) => `“${p.selected}” isn't a trait this stack prices.`,
  "skill-train.option-unavailable": (p) => `“${p.selected}” isn't on the catalogue.`,
  "skill-train.value-invalid": () => "A training only takes true or false.",
  "skill-train.level-locked": (p) => `Unlocks at level ${p.unlockLevel} — this character is ${p.level}.`,
  "skill-budget.option-unavailable": (p) => `“${p.selected}” is outside this budget.`,
  "skill-budget.tier-invalid": () => "A captive budget only spends at ½ or Full.",
  "skill-budget.overspent": (p) => `Overspent by ${p.spent - p.points} — ${p.spent} of ${p.points} spent.`
};

/** Le mot d'un verrou, une seule voix pour les deux tables (lot 125) : la
 *  table d'ici d'abord, le carnet ensuite, et c'est LUI qui porte le repli. */
export function motDuVerrou(violation) {
  if (!violation || typeof violation.key !== "string") return "";
  const mots = REFUSAL_WORDS[violation.key];
  return mots ? mots(violation.params || {}) : decisionRefusalWord(violation);
}

/* ══ L'ÉTAT D'ÉCRAN — la page du tambour, les lignes ajoutées sans point ══ */
const ecran = {
  page: 0, ajout: null,
  ajoutes: { tool: new Set(), training: new Set() },
  /* Les quatre collecteurs du sélecteur (Eric, 07/09 04:1x : *« 4 collecteurs en
     dessous »*) — ce qu'on y pose n'est ajouté qu'au `Done` du sélecteur. */
  collecteurs: { tool: [null, null, null, null], training: [null, null, null, null] }
};
const COLLECTEURS = 4;
const JETONS_PAR_PAGE = 12; // quatre rangées de trois (Eric, 07/09 05:0x : « 4e rangée possible ? » — oui, sans la ligne du compte)

/** Lecture seule, pour les tests et la coquille. */
export function skillsEcran() { return ecran; }

/** `Reset` (Eric, 07/09 : *« tout sauf le bound »*) oublie aussi les lignes
 *  ajoutées sans point — elles ne vivaient qu'ici. La coquille l'appelle. */
export function skillsReinitialiserEcran() {
  ecran.ajout = null;
  ecran.ajoutes.tool.clear();
  ecran.ajoutes.training.clear();
  ecran.collecteurs.tool.fill(null);
  ecran.collecteurs.training.fill(null);
}

/** `Cancel` du sélecteur (verbe `skillsAjoutAnnuler`) : les collecteurs se vident,
 *  rien n'entre dans la page. */
export function skillsAnnulerAjout() {
  const kind = ecran.ajout;
  if (kind && ecran.collecteurs[kind]) ecran.collecteurs[kind].fill(null);
  ecran.ajout = null;
}

/** « Add tool » du sélecteur (la coquille l'exécute, verbe `skillsAjoutFermer`) : ce
 *  qui est dans les collecteurs rejoint la page, vide ; les collecteurs se vident. */
export function skillsFermerAjout() {
  const kind = ecran.ajout;
  if (kind && ecran.collecteurs[kind]) {
    for (const slug of ecran.collecteurs[kind]) if (slug) ecran.ajoutes[kind].add(slug);
    ecran.collecteurs[kind].fill(null);
  }
  ecran.ajout = null;
}

/** Les chemins que `Reset` efface — TOUT ce qui est libre, RIEN de ce qui est
 *  lié : les dépenses (`spend`) et les trainings achetés (`train`), lus dans le
 *  DOCUMENT, jamais devinés d'un catalogue. Le trait (`fh.skills.trait.*`) est
 *  un fait du personnage, pas une dépense : il reste. */
export function skillsCheminsDeReset(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  return choices
    .map((c) => (c && typeof c.path === "string" ? c.path : ""))
    .filter((p) => p.startsWith("fh.skills.spend.") || p.startsWith("fh.skills.train."));
}

/* ══ LES PETITS OUTILS DU DOM ══════════════════════════════════════════════ */
function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }
function bouton(className, children, onClick) {
  const b = el("button", className, children);
  b.type = "button";
  if (onClick) b.addEventListener("click", onClick);
  return b;
}
function abilityLabel(key) { return typeof key === "string" ? key.slice(0, 3).toUpperCase() : "—"; }
function signed(n) { return Number.isInteger(n) ? (n >= 0 ? `+${n}` : String(n)) : "—"; }
function rang(tier) { return TIER_RANK[tier] || 0; }

/* ══ CE QUE LE MOTEUR A DIT — lu, jamais recalculé ════════════════════════ */
function findPoolStat(resolved) {
  const stats = resolved && Array.isArray(resolved.stats) ? resolved.stats : [];
  return stats.find((s) => s.id === "fh:skill-points") || null;
}
function classIdFromBreakdown(poolStat) {
  const line = (poolStat.breakdown || []).find((l) => l.source && l.source.kind === "class");
  return line ? line.source.id : null;
}
/** Les paliers ACHETABLES, triés par coût croissant — jamais une liste en dur. */
function purchasableTiers(pool) {
  if (!pool || !pool.tier_costs || typeof pool.tier_costs !== "object") return [];
  return Object.keys(pool.tier_costs).filter((key) => key !== "imposed").sort((a, b) => pool.tier_costs[a] - pool.tier_costs[b]);
}

/** Le compte des points libres. `left` est le SEUL nombre lu tel quel — un
 *  total menteur s'affiche menteur (attaque du lot 39, gardée). */
function compteur(resolved, decisions) {
  const poolStat = findPoolStat(resolved);
  if (!poolStat) return null;
  const breakdown = Array.isArray(poolStat.breakdown) ? poolStat.breakdown : [];
  const spent = -breakdown
    .filter((line) => line.source && ["skill", "tool", "training"].includes(line.source.kind))
    .reduce((sum, line) => sum + line.value, 0);
  const left = poolStat.value;
  const budget = spent + left;
  return {
    spent, left, budget,
    classPlan: planAt(decisions, "class.skillBudget"),
    speciesPlan: planAt(decisions, "species.skillBudget"),
    languagesPlan: planAt(decisions, "background.languages"),
    achetes: new Set(breakdown.filter((l) => l.source && ["tool", "training"].includes(l.source.kind)).map((l) => l.source.id))
  };
}

/** Le palier que la BOURSE a posé sur un slug (classe ou espèce) — c'est le
 *  plancher lié de la ligne, celui que le halo violet dessine. */
function palierLie(decisions, slug) {
  for (const racine of ["class", "species"]) {
    const plan = planAt(decisions, `${racine}.skillBudget`);
    if (!plan || !Array.isArray(plan.selected) || !plan.selected.includes(slug)) continue;
    const etape = planAt(decisions, `${racine}.skillBudget.${slug}`);
    const tier = etape && Array.isArray(etape.selected) ? etape.selected[0] : null;
    if (rang(tier) > 0) return tier;
  }
  return "none";
}

/* ══ LE CONTEXTE DE LIGNE — composé UNE fois, lu par toute la page ════════ */
function contexte(ctx, act) {
  const resolved = ctx.resolved || {};
  const decisions = ctx.decisions || [];
  const query = typeof ctx.query === "function" ? ctx.query : () => [];
  const poolStat = findPoolStat(resolved);
  let pool = null;
  let classView = null;
  if (poolStat) {
    const classId = classIdFromBreakdown(poolStat);
    classView = classId ? query({ kind: "class", id: classId }) : null;
    pool = classView && classView.record && classView.record.data ? classView.record.data.fh_skill_pool : null;
  }
  return {
    resolved, decisions, violations: ctx.violations || [], query, pool, classView,
    tiers: purchasableTiers(pool), act, signe: Boolean(ctx.signe),
    compte: compteur(resolved, decisions)
  };
}

/* ══ LA DALLE HAUTE ════════════════════════════════════════════════════════ */

/** Le premier refus de compétences, s'il y en a un — c'est lui que le
 *  gendarme dit. Le dépassement du pool passe avant une ligne : c'est le
 *  total qui est fautif, et c'est lui que le Spent rouge montre déjà. */
function premierRefus(violations) {
  const pool = violations.find((v) => v.key === "skill-pool.overspent");
  return pool || violations.find((v) => typeof v.key === "string" && v.key.startsWith("skill-")) || null;
}

/** L'aiguilleur — trois lignes (Eric, 07/09 : *« oui ces choses-là, il a 3
 *  lignes »*) : la consigne des paliers, le droit d'Expertise du personnage,
 *  l'état du compte. Le gendarme le RECOUVRE en cas de refus (*« l'aiguilleur
 *  s'efface en présence du gendarme »*) ; la conclusion verte le remplace une
 *  fois l'étape signée. Tous les nombres sont LUS sur le record de classe. */
function renderAiguilleur(c) {
  const refus = premierRefus(c.violations);
  if (refus) {
    const rouge = el("p", "guide-mot skills-aiguilleur", [text(motDuVerrou(refus))]);
    rouge.dataset.gendarme = "oui";
    return rouge;
  }
  if (c.signe) {
    const vert = el("p", "guide-mot skills-aiguilleur", [text("Skills are settled. Next moves on — or touch a circle to reopen them.")]);
    vert.dataset.signe = "oui";
    return vert;
  }
  const lignes = [];
  if (c.tiers.length > 0 && c.pool) {
    const prix = c.tiers.map((t) => `${TIER_LABEL[t] || t} ${c.pool.tier_costs[t]}`).join(" · ");
    lignes.push(`Fill the circles with your free points — ${prix}.`);
  } else {
    lignes.push("Skills follow the SRD here — nothing to spend.");
  }
  lignes.push(droitDExpertise(c));
  /* La 3ᵉ ligne : le geste (Eric, 07/09 03:5x : *« tap to add, tap again to remove —
     dans l'aiguilleur »*) ; le compte, lui, est déjà sous les yeux (FREE POINTS ·
     Spent). Au compte exact, la ligne dit la sortie. */
  if (ecran.ajout) {
    /* Le compte des collecteurs vit ICI (Eric, 07/09 05:0x : *« si on dégage le
       0 of 4 picked ? l'aiguilleur en haut peut donner des infos relatives à ce
       choix »*), pas sous le vivier : la ligne gagnée paie la 4ᵉ rangée. */
    const pris = ecran.collecteurs[ecran.ajout].filter(Boolean).length;
    lignes.push(ecran.ajout === "tool"
      ? `Drag a tool onto a slot, tap for details — ${pris} of ${COLLECTEURS} picked.`
      : `Drag a training onto a slot, tap for details — ${pris} of ${COLLECTEURS} picked.`);
  } else if (c.compte) {
    lignes.push(c.compte.left === 0
      ? `All ${c.compte.budget} free points placed — Done to settle.`
      : "Tap a circle to add, tap it again to remove.");
  }
  const p = el("p", "guide-mot skills-aiguilleur");
  lignes.forEach((ligne, i) => { if (i > 0) p.append(document.createElement("br")); p.append(text(ligne)); });
  return p;
}

/** Le droit d'Expertise, dit avec les nombres du RECORD. Le trait ouvert se
 *  reconnaît à sa ligne dans le détail du pool (son `feature`, copié du
 *  record) — l'écran ne connaît le nom d'aucun trait. */
function droitDExpertise(c) {
  const pool = c.pool;
  const level = c.resolved.identity && Number.isInteger(c.resolved.identity.level) ? c.resolved.identity.level : 1;
  if (!pool || !Number.isInteger(pool.expertise_from_level)) return "";
  const cap = pool.expertise_cap && typeof pool.expertise_cap === "object" ? pool.expertise_cap : null;
  if (level >= pool.expertise_from_level) {
    if (cap && level <= cap.through_level) return `Expertise: up to ${cap.max} at level ${cap.through_level}, bound skills included.`;
    return "Expertise: open — your free points decide.";
  }
  const poolStat = findPoolStat(c.resolved);
  const lignes = poolStat && Array.isArray(poolStat.breakdown) ? poolStat.breakdown : [];
  const grants = Array.isArray(pool.trait_grants) ? pool.trait_grants : [];
  const ouvert = grants.find((g) => g && g.unlocksExpertise === true && lignes.some((l) => l.label === g.feature));
  if (ouvert && Number.isInteger(ouvert.maxExpertise)) {
    return `${ouvert.feature}: ${ouvert.maxExpertise} Expertise${ouvert.maxExpertise === 1 ? "" : "s"} before level ${pool.expertise_from_level}.`;
  }
  return `Expertise unlocks at level ${pool.expertise_from_level}.`;
}

/** UNE LIGNE DE COMPTE — l'étiquette (bleu foncé, T2) est le bouton qui ouvre
 *  le popup, les valeurs suivent sur la même ligne (Eric, 07/09 03:3x : *« BOUND
 *  POINTS Skills 4/4 tools 0/0 trainings 2/2 »*, *« tapable pour obtenir plus
 *  d'info, en bleu foncé et en T2 »*). La cible tactile reste 44 : elle déborde
 *  la ligne en dessin sans lui coûter un blg (rembourrage compensé). */
function renderLigneDeCompte({ mot, aria, popup, cellules, c }) {
  /* Les deux lignes partagent UNE grille (Eric, 07/09 03:5x : *« aligne
     verticalement Skills / Budget et Tools / Spent »*) : la ligne est
     `display: contents`, ses cellules sont celles de la grille de la dalle. */
  const ligne = el("div", "skills-ligne-compte");
  const etiquette = bouton("skills-compte-etiquette", [text(mot)], () => c.act({ kind: "popup", titre: popup.titre, texte: popup.texte() }));
  etiquette.setAttribute("aria-label", aria);
  ligne.append(etiquette);
  for (const cellule of cellules) ligne.append(el("span", "skills-compte-cellule", cellule));
  return ligne;
}

/** BOUND POINTS — une ligne informative : Skills · Tools · Trainings. *« On ne
 *  peut pas les bouger dans cette fenêtre »* : le tap OUVRE (le popup par
 *  source), il ne change rien. */
function renderBound(c) {
  return renderLigneDeCompte({
    mot: "Bound points", aria: "Bound points — what your class, species and inheritance already placed",
    popup: { titre: "Bound", texte: () => texteDuBound(c) },
    cellules: comptesLies(c).map((l) => [text(`${l.mot} ${l.place}/${l.total}`)]), c
  });
}

/** D'où viennent les points libres — les lignes POSITIVES du détail du pool,
 *  telles que le moteur les a publiées (classe, paliers, espèce, don, trait). */
function texteDuFree(c) {
  const poolStat = findPoolStat(c.resolved);
  if (!poolStat || !c.compte) return "No free pool on this rule set.";
  const gains = (poolStat.breakdown || []).filter((l) => Number.isInteger(l.value) && l.value > 0)
    .map((l) => `${l.label} +${l.value}`);
  return [
    `Budget ${c.compte.budget} — where it comes from:\n${gains.join(" · ") || "nothing yet"}`,
    `Spent ${c.compte.spent} · left ${c.compte.left}. Free points buy Novice, Adept and Expert on any skill, tool or training. Done needs them all placed.`
  ].join("\n\n");
}

/** Les trois comptes liés. ⚠️ TOOLS DIT LA VÉRITÉ : le record déclare des
 *  points d'outil liés (le Rogue en a 1), mais AUCUNE étape ne les place
 *  aujourd'hui — `resolved.tools` est vide pour lui (mesuré le 07/09). Écrire
 *  « 1/1 » serait affirmer un placement qui n'existe pas. */
function comptesLies(c) {
  const pool = c.pool || {};
  const cp = c.compte || {};
  const skillsPlace = (cp.classPlan ? cp.classPlan.answered : 0) + (cp.speciesPlan ? cp.speciesPlan.answered : 0);
  const skillsTotal = (cp.classPlan ? cp.classPlan.expected : 0) + (cp.speciesPlan ? cp.speciesPlan.expected : 0)
    || (Number.isInteger(pool.bound_skill_points) ? pool.bound_skill_points : 0);
  const outilsLies = (c.resolved.tools || []).filter((t) => !(cp.achetes && cp.achetes.has(t.id))).length;
  const toolsTotal = Number.isInteger(pool.bound_tool_points) ? pool.bound_tool_points : 0;
  const langues = cp.languagesPlan;
  return [
    { mot: "Skills", place: skillsPlace, total: skillsTotal },
    { mot: "Tools", place: outilsLies, total: toolsTotal },
    { mot: "Trainings", place: langues ? langues.answered : 0, total: langues ? langues.expected : 0 }
  ];
}

/** Le texte du popup « Bound » — par source, avec le palier et son prix. */
function texteDuBound(c) {
  const blocs = [];
  const nomDeSkill = (slug) => {
    const s = (c.resolved.skills || []).find((k) => k.id === slug);
    return s ? s.name : slug;
  };
  const prix = (tier) => (c.pool && c.pool.tier_costs && Number.isInteger(c.pool.tier_costs[tier])) ? ` (${c.pool.tier_costs[tier]})` : "";
  const bourse = (racine, source) => {
    const plan = planAt(c.decisions, `${racine}.skillBudget`);
    if (!plan) return;
    const poses = (plan.selected || []).map((slug) => {
      const etape = planAt(c.decisions, `${racine}.skillBudget.${slug}`);
      const tier = etape && etape.selected ? etape.selected[0] : null;
      return `${nomDeSkill(slug)} ${TIER_LABEL[tier] || tier || "—"}${prix(tier)}`;
    });
    blocs.push(`From ${source} — skills, ${plan.answered} of ${plan.expected} points:\n${poses.length ? poses.join(" · ") : "nothing placed yet — go back to that step"}`);
  };
  const classe = c.classView && c.classView.record ? c.classView.record.name : "your class";
  bourse("class", classe);
  bourse("species", (c.resolved.identity && c.resolved.identity.species) || "your species");
  const langues = c.compte && c.compte.languagesPlan;
  if (langues) {
    const noms = (langues.selected || []).map((id) => {
      const view = c.query({ kind: "training", id });
      return view && view.record ? view.record.name : id;
    });
    blocs.push(`From your inheritance — trainings, ${langues.answered} of ${langues.expected} languages:\n${noms.length ? noms.join(" · ") : "none chosen yet"}`);
  }
  const outils = c.pool && Number.isInteger(c.pool.bound_tool_points) ? c.pool.bound_tool_points : 0;
  if (outils > 0) {
    const places = (c.resolved.tools || []).filter((t) => !(c.compte && c.compte.achetes.has(t.id)));
    blocs.push(places.length
      ? `Tools — ${outils} bound point${outils > 1 ? "s" : ""}: ${places.map((t) => t.name).join(" · ")}`
      : `Tools — ${outils} bound point${outils > 1 ? "s" : ""}, not placed yet: no step places them for now.`);
  }
  blocs.push("Bound points are already spent for you. Change them on the step that placed them.");
  return blocs.join("\n\n");
}

/** FREE POINTS — une ligne : Budget · Spent. Le Spent porte l'échelle : bleu
 *  tant qu'on place, vert au compte exact, rouge au-delà (le croquis). */
function renderFree(c) {
  let cellules;
  if (!c.compte) {
    cellules = [[text("No free pool — the SRD rules apply.")], [], []];
  } else {
    const spent = el("span", "skills-free-nombre skills-free-spent", [text(String(c.compte.spent))]);
    spent.dataset.etat = c.compte.left < 0 ? "trop" : (c.compte.left === 0 ? "compte" : "cours");
    cellules = [[text("Budget "), el("span", "skills-free-nombre", [text(String(c.compte.budget))])], [text("Spent "), spent], []];
  }
  return renderLigneDeCompte({
    mot: "Free points", aria: "Free points — where your budget comes from",
    popup: { titre: "Free points", texte: () => texteDuFree(c) },
    cellules, c
  });
}

/* ══ LE TAMBOUR — six crans en boucle, trois en vue ═══════════════════════ */

/** Les pages réellement rendues, dans l'ordre : les catégories NON VIDES de
 *  la pile, la page « Skills » des sans-catégorie s'il y en a, puis Tools et
 *  Trainings. Le tambour et la fenêtre lisent la MÊME liste. */
function pagesDe(c) {
  const skills = Array.isArray(c.resolved.skills) ? c.resolved.skills : [];
  const catalogue = c.query({ kind: "skill" }) || [];
  const categorieDe = new Map(catalogue.map((v) => [v.record.slug, v.record.data && v.record.data.category]));
  const parCategorie = new Map(CATEGORIES.map((k) => [k, []]));
  const sans = [];
  for (const skill of skills) {
    const cat = categorieDe.get(skill.id);
    if (cat && parCategorie.has(cat)) parCategorie.get(cat).push(skill);
    else sans.push(skill);
  }
  const pages = [];
  for (const key of CATEGORIES) {
    const liste = parCategorie.get(key);
    if (liste.length > 0) pages.push({ id: key, label: CATEGORY_LABEL[key], skills: liste.sort((a, b) => a.name.localeCompare(b.name)) });
  }
  if (sans.length > 0) pages.push({ id: "skills", label: UNSORTED_LABEL, skills: sans.sort((a, b) => a.name.localeCompare(b.name)) });
  pages.push({ ...PAGE_KIT });
  return pages;
}

/** Les libellés des pages, dans l'ordre de la rangée d'onglets. */
export function skillsCategories(ctx) {
  return pagesDe(contexte(ctx, () => {})).map((p) => p.label);
}

/** La page courante, ramenée dans la boucle. */
function pageCourante(pages) {
  const n = pages.length;
  if (n === 0) return 0;
  ecran.page = ((ecran.page % n) + n) % n;
  return ecran.page;
}

/* ══ LA RANGÉE D'ONGLETS ═════════════════════════════════════════════════
   Eric, 07/09 05:5x : *« 5 cases, on reste en T2 »* — et *« dans ce cas précis on ne
   serait plus sur un tambour »*. Cinq pages, cinq onglets visibles : rien à faire
   tourner, donc ni chevron, ni boucle, ni centre. L'onglet courant porte le voile
   50 % et le halo blanc ; les autres le voile 35 %. Chaque onglet prend la largeur
   de SON mot (mesuré à T2 : 66 · 36 · 66 · 49 · 101 = 318, + 4 gaps de 4 = 334 dans
   351) — des cases égales ne tiendraient pas (5 × 101). Le tambour à trois crans,
   lui, vit en mémoire et dans l'historique (v598) pour l'étape qui en aura besoin. */
function renderOnglets(c, pages, surChangement) {
  const cur = pageCourante(pages);
  const rangee = el("nav", "skills-onglets");
  rangee.setAttribute("aria-label", "Skill categories");
  pages.forEach((page, index) => {
    const b = bouton("skills-onglet", [el("span", "skills-onglet-mot", [text(page.label)])],
      index === cur ? null : () => { ecran.page = index; ecran.ajout = null; surChangement(); });
    b.dataset.page = page.id;
    b.setAttribute("aria-current", index === cur ? "true" : "false");
    rangee.append(b);
  });
  return rangee;
}

/* ══ LES LIGNES ═══════════════════════════════════════════════════════════ */

/** Les trois ronds d'une ligne. `palier` est le palier ACQUIS (lu dans
 *  `resolved`), `plancher` le palier LIÉ (la bourse) : les ronds jusqu'au
 *  plancher portent le halo violet et sont captifs ; les autres se remplissent
 *  en vert et se vident d'un second tap (Eric, 07/09). Le verbe part au moteur,
 *  qui dira si c'est légal — jamais un calcul ici. */
function renderRonds({ nom, palier, plancher, path, c, violation }) {
  const wrap = el("div", "skills-ronds");
  const acquis = rang(palier);
  const lie = rang(plancher);
  /* Une demande REFUSÉE par le moteur (plafond, verrou, plancher) reste écrite
     au document sans être appliquée : les ronds la montrent en rouge. Le tap sur
     le palier refusé l'EFFACE — sinon le joueur n'aurait aucun geste pour la
     retirer, et le refus lui collerait à la ligne. Le palier refusé se lit sur
     le refus (`value`), ou c'est l'Expert pour les refus qui ne le nomment pas
     (plafond, verrou) : ce sont les seuls qui le visent. */
  const refuse = violation
    ? (violation.params && TIER_RANK[violation.params.value] ? violation.params.value : "expert")
    : null;
  c.tiers.forEach((tierKey, index) => {
    const r = index + 1;
    const b = bouton("skills-rond", [el("span", "skills-rond-marque", [text(TIER_GLYPH[index] || "?")])], () => {
      if (r <= lie) { c.act({ kind: "popup", titre: "Bound", texte: texteDuBound(c) }); return; }
      if (refuse && tierKey === refuse) { c.act({ kind: "clear", path }); return; }
      if (r <= acquis) {
        /* Un second tap vide ce rond ET ceux du dessus : on redescend d'un
           cran ; sous le plancher, on efface la dépense — le lié reste. */
        if (r - 1 <= lie) c.act({ kind: "clear", path });
        else c.act({ kind: "set", path, value: c.tiers[r - 2] });
        return;
      }
      c.act({ kind: "set", path, value: tierKey });
    });
    b.dataset.rang = String(r);
    b.dataset.tier = tierKey;
    b.dataset.lie = r <= lie ? "oui" : "non";
    markPressed(b, r <= acquis);
    b.setAttribute("aria-label", `${nom} — ${TIER_LABEL[tierKey] || tierKey}${r <= lie ? " (bound)" : ""}`);
    wrap.append(b);
  });
  if (violation) wrap.dataset.refus = "oui";
  return wrap;
}

/** LE DÉTAIL D'UNE LIGNE — Eric, 07/09 04:0x : *« lien pour un popup expliquant le
 *  skill en détails, autant de détails que nécessaire »*. Tout vient du record
 *  (`example_uses`, `ability`, et pour un outil `utilize` · `craft` · `cost`) et du
 *  moteur (le palier acquis, le bonus et sa décomposition, le barème du record de
 *  classe, la provenance d'un lié). Rien n'est écrit ici qui ne soit lu. */
function texteDuDetail({ nom, view, acquis, bonus, plancher, c }) {
  const data = (view && view.record && view.record.data) || {};
  const blocs = [];
  const carac = data.ability ? `${data.ability} (${abilityLabel(data.ability_key)})` : abilityLabel(data.ability_key);
  const mod = c.resolved.abilities && data.ability_key && c.resolved.abilities[data.ability_key]
    ? c.resolved.abilities[data.ability_key].mod : null;
  blocs.push(`Ability: ${carac}${Number.isInteger(mod) ? ` — your modifier ${signed(mod)}` : ""}.`);
  if (data.example_uses) blocs.push(data.example_uses);
  if (data.utilize) blocs.push(`Utilize: ${data.utilize}`);
  if (data.craft) blocs.push(`Craft: ${data.craft}`);
  if (data.cost) blocs.push(`Market price: ${data.cost}.`);
  if (data.category) blocs.push(`${CATEGORY_LABEL[data.category] || data.category} skill.`);
  const prof = c.resolved.proficiency;
  if (rang(acquis) > 0 && Number.isInteger(bonus) && Number.isInteger(mod)) {
    blocs.push(`Your tier: ${TIER_LABEL[acquis] || acquis} — bonus ${signed(bonus)} = ${abilityLabel(data.ability_key)} ${signed(mod)} + ${TIER_LABEL[acquis] || acquis} ${signed(bonus - mod)}.`);
  } else if (Number.isInteger(mod)) {
    blocs.push(`Not trained: you roll with your ${abilityLabel(data.ability_key)} modifier alone, ${signed(mod)}.`);
  }
  if (c.pool && c.pool.tier_costs && Number.isInteger(prof)) {
    const t = c.pool.tier_costs;
    const barème = c.tiers.map((k) => {
      const gain = k === "novice" ? Math.floor(prof / 2) : k === "adept" ? prof : k === "expert" ? prof * 2 : null;
      return `${TIER_LABEL[k] || k} ${t[k]} pt${t[k] > 1 ? "s" : ""}${Number.isInteger(gain) ? ` (${signed(gain)})` : ""}`;
    }).join(" · ");
    blocs.push(`Tiers, with your proficiency bonus of ${signed(prof)}: ${barème}. Tap a circle to buy, tap it again to give back.`);
  }
  if (rang(plancher) > 0) {
    blocs.push(`Bound at ${TIER_LABEL[plancher] || plancher}: placed by your class or species, and it stays — change it on that step.`);
  }
  return blocs.join("\n\n");
}

/** Le nom d'une ligne est un LIEN (bleu) qui ouvre son détail. */
function renderNomAvecDetail(nom, ouvrir) {
  const b = bouton("skills-ligne-nom skills-ligne-lien", [text(nom)], ouvrir);
  b.setAttribute("aria-label", `${nom} — details`);
  return b;
}

function renderLigneSkill(skill, c) {
  const ligne = el("div", "skills-ligne");
  ligne.dataset.ligne = skill.id;
  const plancher = palierLie(c.decisions, skill.id);
  if (rang(plancher) > 0) ligne.dataset.lie = "oui";
  const view = (c.query({ kind: "skill" }) || []).find((v) => v.record.slug === skill.id) || null;
  ligne.append(renderNomAvecDetail(skill.name, () => c.act({
    kind: "popup", titre: skill.name,
    texte: texteDuDetail({ nom: skill.name, view, acquis: skill.proficiency, bonus: skill.bonus, plancher, c })
  })));
  ligne.append(el("span", "skills-ligne-carac", [text(abilityLabel(skill.ability))]));
  ligne.append(el("span", "skills-ligne-bonus", [text(signed(skill.bonus))]));
  if (c.tiers.length > 0) {
    const path = `fh.skills.spend.${skill.id}`;
    ligne.append(renderRonds({ nom: skill.name, palier: skill.proficiency, plancher, path, c, violation: violationAt(c.violations, path) }));
  } else {
    /* Sans palier achetable, la pile est SRD : le mot est celui du SRD (loi §0.12). */
    ligne.append(el("span", "skills-ligne-static", [text(skill.proficiency === "none" ? "—" : "Proficient")]));
  }
  return ligne;
}

/** Les outils LISTÉS : liés (dans `resolved.tools` sans dépense), achetés
 *  (une dépense du pool les y met aussi), ajoutés sans point (état d'écran). */
function outilsListes(c) {
  const catalogue = c.query({ kind: "tool" }) || [];
  const parSlug = new Map(catalogue.map((v) => [v.record.slug, v]));
  const slugs = new Set();
  for (const t of c.resolved.tools || []) slugs.add(t.id);
  for (const s of ecran.ajoutes.tool) slugs.add(s);
  return [...slugs].map((slug) => parSlug.get(slug)).filter(Boolean).sort((a, b) => a.record.name.localeCompare(b.record.name));
}

function renderLigneTool(view, c) {
  const slug = view.record.slug;
  const owned = (c.resolved.tools || []).find((t) => t.id === slug) || null;
  const lie = owned && c.compte && !c.compte.achetes.has(slug);
  const abilityKey = view.record.data && view.record.data.ability_key;
  const ligne = el("div", "skills-ligne");
  ligne.dataset.ligne = slug;
  if (lie) ligne.dataset.lie = "oui";
  /* « Remove » — Eric, 07/09 04:0x : le popup permet d'enlever un outil du tableau ;
     ⛔ jamais un lié (*« au lvl 1 pour trainings c'est bloqué car ils sont bound »*).
     Retirer = rendre sa dépense au pool ET oublier la ligne ajoutée sans point. */
  const path = `fh.skills.spend.${slug}`;
  ligne.append(renderNomAvecDetail(view.record.name, () => c.act({
    kind: "popup", titre: view.record.name,
    texte: texteDuDetail({
      nom: view.record.name, view, acquis: owned ? owned.proficiency : "none", bonus: owned ? owned.bonus : null,
      plancher: lie ? owned.proficiency : "none", c
    }),
    actions: lie ? [] : [{ mot: "Remove", defait: true, faire: () => { ecran.ajoutes.tool.delete(slug); c.act({ kind: "clear", path }); } }]
  })));
  ligne.append(el("span", "skills-ligne-carac", [text(abilityLabel(abilityKey))]));
  const bonus = owned ? signed(owned.bonus)
    : (c.resolved.abilities && abilityKey && c.resolved.abilities[abilityKey]) ? signed(c.resolved.abilities[abilityKey].mod) : "—";
  ligne.append(el("span", "skills-ligne-bonus", [text(bonus)]));
  if (c.tiers.length > 0) {
    const path = `fh.skills.spend.${slug}`;
    ligne.append(renderRonds({
      nom: view.record.name, palier: owned ? owned.proficiency : "none", plancher: lie ? owned.proficiency : "none",
      path, c, violation: violationAt(c.violations, path)
    }));
  } else {
    ligne.append(el("span", "skills-ligne-static", [text(owned ? "Proficient" : "—")]));
  }
  return ligne;
}

/** Les trainings LISTÉS : les langues d'origine (liées), les trainings
 *  achetés (`resolved.traits`, catégorie training), les ajoutés sans point. */
function trainingsListes(c) {
  const catalogue = c.query({ kind: "training" }) || [];
  const parSlug = new Map(catalogue.map((v) => [v.record.slug || v.id, v]));
  const lies = new Set((c.resolved.languages || []).map((l) => (typeof l === "string" ? l : (l.id || l.slug))).filter(Boolean));
  const achetes = new Set((c.resolved.traits || []).filter((t) => t.category === "training").map((t) => t.id));
  const slugs = new Set([...lies, ...achetes, ...ecran.ajoutes.training]);
  const lignes = [];
  for (const slug of slugs) {
    const view = parSlug.get(slug);
    if (view) lignes.push({ view, slug, lie: lies.has(slug), acquis: achetes.has(slug) || lies.has(slug) });
  }
  return lignes.sort((a, b) => a.view.record.name.localeCompare(b.view.record.name));
}

function renderLigneTraining({ view, slug, lie, acquis }, c) {
  const ligne = el("div", "skills-ligne skills-ligne-training");
  ligne.dataset.ligne = slug;
  if (lie) ligne.dataset.lie = "oui";
  const data = view.record.data || {};
  /* Le nom est BLEU et cliquable (Eric, 07/09) : il ouvre le popup de la
     chose — sa description et son prix viennent du record, jamais d'ici. */
  const path = `fh.skills.train.${slug}`;
  const nom = bouton("skills-ligne-nom skills-ligne-lien", [text(view.record.name)], () => c.act({
    kind: "popup", titre: view.record.name,
    texte: `${data.description || ""}${Number.isInteger(data.cost) ? `\n\nCost: ${data.cost} point${data.cost > 1 ? "s" : ""}.` : ""}${lie ? "\n\nBound — granted by your inheritance, it stays." : ""}`,
    /* « Remove » sur un training libre ; un lié n'en a pas (Eric, 07/09). */
    actions: lie ? [] : [{ mot: "Remove", defait: true, faire: () => { ecran.ajoutes.training.delete(slug); c.act({ kind: "clear", path }); } }]
  }));
  ligne.append(nom);
  ligne.append(el("span", "skills-ligne-carac", [text(data.category === "language" ? "LANG" : "")]));
  ligne.append(el("span", "skills-ligne-bonus", [text("")]));
  const ronds = el("div", "skills-ronds");
  const b = bouton("skills-rond", [el("span", "skills-rond-marque", [text("●")])], () => {
    if (lie) { c.act({ kind: "popup", titre: "Bound", texte: texteDuBound(c) }); return; }
    if (acquis) c.act({ kind: "clear", path });
    else c.act({ kind: "set", path, value: true });
  });
  b.dataset.rang = "1";
  b.dataset.lie = lie ? "oui" : "non";
  markPressed(b, acquis);
  b.setAttribute("aria-label", `${view.record.name} — ${acquis ? "trained" : "not trained"}${lie ? " (bound)" : ""}`);
  ronds.append(b);
  const violation = violationAt(c.violations, path);
  if (violation) ronds.dataset.refus = "oui";
  ligne.append(ronds);
  return ligne;
}

/* ══ LE SÉLECTEUR — « Add a tool » / « Add a training » ═════════════════════
   Eric, 07/09 04:1x : *« un sélecteur type spells : 3 rangées de 3 superposées = 9
   avec navigation latérale, 4 collecteurs en dessous ; tu recouvres la dalle
   inférieure ; un Done, rajoute le livre et ? »*. C'est l'organe du glisser
   (`renderChoixGlisses`, celui des sorts et des bourses) : un vivier de jetons
   paginé par neuf, quatre collecteurs ; au doigt, tap = info et glisser = choisir,
   à la souris clic gauche = choisir (la loi du 16/08, portée par l'organe).
   ⛔ Rien n'est écrit au personnage : les verbes du glisser sont repris ICI, dans
   l'état d'écran, et le `Done` du pied (verbe `skillsAjoutFermer`, exécuté par
   la coquille) fait entrer les collecteurs dans la page — vides. */
function renderSelecteur(c, kind, surChangement) {
  const catalogue = (c.query({ kind }) || []).slice().sort((a, b) => a.record.name.localeCompare(b.record.name));
  const nomDe = new Map(catalogue.map((v) => [v.record.slug || v.id, v.record.name]));
  const dejaLa = new Set(kind === "tool" ? outilsListes(c).map((v) => v.record.slug) : trainingsListes(c).map((l) => l.slug));
  const options = catalogue.map((v) => v.record.slug || v.id).filter((slug) => !dejaLa.has(slug));
  const col = ecran.collecteurs[kind];
  const poses = col.filter(Boolean);
  const racine = `skills.ajout.${kind}`;
  const plan = { path: racine, options, selected: poses.slice(), answered: poses.length, expected: COLLECTEURS, status: poses.length > 0 ? "partial" : "open" };
  const slots = col.map((slug, index) => ({
    path: `${racine}.${index}`, index, options, selected: slug ? [slug] : [], lock: null,
    mot: `${kind === "tool" ? "Tool" : "Training"} ${index + 1}`
  }));
  const local = (action) => {
    const index = Number(String(action.path).slice(racine.length + 1));
    if (!Number.isInteger(index) || index < 0 || index >= COLLECTEURS) return;
    if (action.kind === "set") {
      const deja = col.indexOf(action.value);
      if (deja >= 0) col[deja] = null; // un jeton ne vit qu'à une place
      col[index] = action.value;
    } else if (action.kind === "clear") {
      col[index] = null;
    }
    surChangement();
  };
  const bloc = renderChoixGlisses({
    plan, slots, titre: null, mot: kind === "tool" ? "Tool" : "Training",
    labelOf: (slug) => nomDe.get(slug) || slug,
    onAction: local, parPage: JETONS_PAR_PAGE, unite: "picked", rangee: "sorts",
    /* La consigne vit dans l'AIGUILLEUR (3ᵉ ligne), pas ici : deux lignes de plus dans
       la dalle faisaient déborder le sélecteur de 22 blg, et « il ne doit pas y avoir de
       scroll » (Eric, 07/09 04:2x). Une voix, un lieu. */
    consigne: null,
    compte: false, // le compte vit dans l'aiguilleur aussi (Eric, 07/09 05:0x)
    onInfo: (slug) => {
      const view = catalogue.find((v) => (v.record.slug || v.id) === slug);
      const data = (view && view.record.data) || {};
      c.act({
        kind: "popup", titre: nomDe.get(slug) || slug,
        texte: kind === "tool"
          ? texteDuDetail({ nom: nomDe.get(slug), view, acquis: "none", bonus: null, plancher: "none", c })
          : `${data.description || ""}${Number.isInteger(data.cost) ? `\n\nCost: ${data.cost} point${data.cost > 1 ? "s" : ""}.` : ""}`
      });
    }
  });
  const page = el("div", "skills-selecteur");
  page.dataset.liste = kind;
  if (bloc) page.append(bloc);
  else page.append(el("p", "skills-vide", [text("Nothing left to add.")]));
  return page;
}

/** La ligne « Add » — Eric, 07/09 : *« un bouton rond de 40 blg de diamètre avec
 *  son petit relief, il est vert. Il occupe une ligne comme un skill : le texte
 *  cadré à gauche, le bouton cadré à droite, 8 blg du bord »*, *« tout en bas »*.
 *  Le disque fait 40 dans une cible de 44 — ce qui rétrécit est le dessin. */
function renderLigneAjout(mot, kind, act) {
  const ligne = el("div", "skills-ligne skills-ligne-ajout");
  ligne.append(el("span", "skills-ligne-nom", [text(mot)]));
  /* Ouvrir le sélecteur change la paire du pied : c'est la coquille qui la fabrique,
     donc c'est elle qui redessine (`skillsRedessiner`), pas un redessin local. */
  const b = bouton("skills-ajout", [el("span", "skills-ajout-signe", [text("+")])], () => { ecran.ajout = kind; act({ kind: "skillsRedessiner" }); });
  b.setAttribute("aria-label", mot);
  ligne.append(b);
  return ligne;
}

/* ══ LA PAGE — une catégorie à la fois ════════════════════════════════════ */
function renderPage(c, pages, surChangement) {
  const cur = pageCourante(pages);
  const page = pages[cur];
  if (!page) return el("p", "placeholder", [text("No skills to spend on yet — pick a class first.")]);
  if (ecran.ajout && page.id === "kit") {
    return renderSelecteur(c, ecran.ajout, surChangement);
  }
  const wrap = el("div", "skills-page");
  wrap.dataset.page = page.id;
  if (page.id === "kit") {
    /* Une page, deux listes (Eric, 07/09 : « Tools & Trainings en une case ») : les
       outils puis leur ligne d'ajout, les trainings puis la leur. */
    const outils = outilsListes(c);
    if (outils.length === 0) wrap.append(el("p", "skills-vide", [text("No tools yet.")]));
    for (const view of outils) wrap.append(renderLigneTool(view, c));
    wrap.append(renderLigneAjout("Add a tool", "tool", c.act));
    const trainings = trainingsListes(c);
    if (trainings.length === 0) wrap.append(el("p", "skills-vide", [text("No trainings yet.")]));
    for (const l of trainings) wrap.append(renderLigneTraining(l, c));
    wrap.append(renderLigneAjout("Add a training", "training", c.act));
    return wrap;
  }
  for (const skill of page.skills) wrap.append(renderLigneSkill(skill, c));
  return wrap;
}

/** Le glisser latéral sur la fenêtre change de page (Eric, 07/09). Seuil de
 *  40 blg, et seulement si le geste est plus large que haut — sinon c'est un
 *  défilement vertical, et il ne nous regarde pas (`touch-action: pan-y`). */
function armerLeGlisser(fenetre, pages, surChangement) {
  let depart = null;
  fenetre.addEventListener("pointerdown", (ev) => { depart = { x: ev.clientX, y: ev.clientY }; });
  fenetre.addEventListener("pointerup", (ev) => {
    if (!depart) return;
    const dx = ev.clientX - depart.x;
    const dy = ev.clientY - depart.y;
    depart = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    const n = pages.length;
    if (n === 0) return;
    /* Une rangée, pas une boucle : au bout, le geste ne fait rien. */
    const vise = pageCourante(pages) + (dx < 0 ? 1 : -1);
    if (vise < 0 || vise >= n) return;
    ecran.page = vise;
    ecran.ajout = null;
    surChangement();
  });
  fenetre.addEventListener("pointercancel", () => { depart = null; });
}

/* ══ L'ÉCRAN ══════════════════════════════════════════════════════════════ */

/**
 * @param {object} ctx
 * @param {object} ctx.resolved   la fiche dérivée du dernier `rebuild()`
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {Array}  [ctx.violations] `validate({document}).violations`
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {boolean} [ctx.signe]   l'étape est signée (la coquille le lit, jamais l'écran)
 * @param {(action: {kind:"set"|"clear"|"popup"|"resetSkills", path?:string, value?:*}) => void} onAction
 */
export function renderSkillsStep(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const c = contexte(ctx, act);
  const section = el("section", "skills-step");
  if (c.signe) section.dataset.signe = "oui";
  const pages = pagesDe(c);

  /* ── LA DALLE HAUTE, FIXE ── */
  /* La coupe d'Eric (07/09 03:3x) : 4 · aiguilleur · 8 · Bound · 4 · Free · 8 —
     les écarts sont ceux de la dalle, écrits une fois dans la feuille. */
  const tete = el("header", "skills-tete dalle-intermediaire");
  const comptes = el("div", "skills-comptes", [renderBound(c), renderFree(c)]);
  tete.append(renderAiguilleur(c), comptes);
  section.append(tete);

  /* ── LE TAMBOUR ET LA FENÊTRE — redessinés ensemble à chaque geste local
     (page, liste entière) ; les comptes de la dalle haute et le pied ne bougent
     pas, et le pied garde la paire que la coquille y a posée. L'AIGUILLEUR, lui,
     se redit : sa 3ᵉ ligne porte le compte des collecteurs en mode sélecteur. ── */
  /* ── LE PIED, FIXE, DÉCLARÉ AVANT TOUT REDESSIN — la coquille le garnit (garde 17).
     La paire déclarée dépend du mode : Reset · Done/Next sur la page ; sur le
     sélecteur un SEUL bouton, large, qui dit ce qu'il fait — « Add tool » / « Add
     training » (Eric, 07/09 04:2x : *« pour éviter la confusion avec la vraie étape
     de validation avec Done »*) — entre le livre et le `?`. ── */
  const pied = el("div", "skills-pied dalle-intermediaire");
  pied.dataset.sortieIci = "true";
  const declarerLePied = () => {
    if (ecran.ajout) {
      /* Eric, 07/09 04:2x : *« Add tool et Cancel »* — Cancel (petit, 77) rend les
         collecteurs ; Add tool (moyen, 105) les fait entrer, vides. */
      pied.dataset.sortieVerbe = "skillsAjoutAnnuler";
      pied.dataset.sortieMot = "Cancel";
      pied.dataset.sortieDoneMot = ecran.ajout === "tool" ? "Add tool" : "Add training";
      pied.dataset.sortieDoneVerbe = "skillsAjoutFermer";
      pied.dataset.selecteur = "oui";
    } else {
      pied.dataset.sortieVerbe = "resetSkills";
      pied.dataset.sortieMot = "Reset";
      delete pied.dataset.sortieDoneVerbe;
      delete pied.dataset.selecteur;
      pied.dataset.sortieDoneMot = c.signe ? "Next" : "Done";
    }
  };
  const tambourHote = el("div", "skills-onglets-hote");
  const fenetre = el("div", "skills-flux dalle-simple");
  /* « LES SKILLS NE SONT JAMAIS COUPÉS » (Eric, 07/09 03:5x) : la dalle garde sa
     hauteur maximale, mais ce qui DÉFILE dedans est une fenêtre dont la hauteur
     est un nombre entier de lignes (la feuille la déduit : `round(down, …)`),
     aimantée ligne à ligne — en haut comme en bas, une ligne est entière ou
     n'est pas là. */
  const defilement = el("div", "skills-fenetre");
  defilement.dataset.scroller = "skills";
  fenetre.append(defilement);
  const redessiner = () => {
    swapContent(tete, [renderAiguilleur(c), comptes]);
    swapContent(tambourHote, [renderOnglets(c, pages, redessiner)]);
    /* En mode sélecteur, la dalle 2 porte le sélecteur lui-même (il défile en
       bloc) ; sinon la fenêtre à lignes entières. Le pied change de paire avec lui. */
    declarerLePied();
    if (ecran.ajout) {
      /* Le sélecteur RECOUVRE la dalle 3 (Eric : *« tu recouvres la dalle inférieure »*,
         *« ça descend jusqu'en bas, de line bleed »*) : la dalle 2 s'étend jusqu'en bas
         et le pied — la rangée que la coquille garnit — vient vivre dedans. */
      fenetre.dataset.ajout = ecran.ajout;
      swapContent(fenetre, [renderPage(c, pages, redessiner), pied]);
    } else {
      delete fenetre.dataset.ajout;
      swapContent(fenetre, [defilement]);
      swapContent(defilement, [renderPage(c, pages, redessiner)]);
      if (typeof defilement.scrollTo === "function") defilement.scrollTo(0, 0);
      section.append(pied);
    }
  };
  section.append(tambourHote, fenetre, pied);
  redessiner();
  armerLeGlisser(fenetre, pages, redessiner);
  /* « SWIPE LATÉRAL SUR LA MOLETTE DOIT ÊTRE ACTIF » (Eric, 07/09 05:4x) : la molette
     tourne du même geste que la fenêtre — un doigt qui part d'un cran et glisse. Un
     glisser qui finit sur un autre cran ne clique pas (pas de `click` sans départ et
     arrivée sur le même bouton). */
  armerLeGlisser(tambourHote, pages, redessiner);

  /* ── LE PIED, FIXE : la coquille le garnit (garde 17). L'hôte DÉCLARE sa
     paire : `Reset` (rouge, tout sauf le lié) à la place du retour, `Done` qui
     devient `Next` une fois l'étape signée (Eric, 07/09 : *« Done on valide…
     Next on part »*). Le livre mène au tableau des 26 (*« chapitre skills sur
     le tableau »*). ── */
  declarerLePied();
  const livre = bouton("fiche-livre livre-de-sortie", [], () => {
    if (typeof window !== "undefined" && typeof window.open === "function") window.open(lienSkillFhWeb(""), "_blank", "noopener");
  });
  livre.setAttribute("aria-label", "Skills — read the table of the 26 skills on FH Web");
  pied.append(livre);
  return section;
}

/** LA PORTE : `Done` exige le compte exact (Eric, 07/09 : *« Done en gris tant
 *  que le compte n'est pas là »*) et aucun refus. Le compte vient du moteur
 *  (`left`), jamais d'ici. */
export function skillsValidate(ctx) {
  const c = contexte(ctx, () => {});
  const ready = Boolean(c.compte) && c.compte.left === 0 && premierRefus(c.violations) === null;
  return { exists: true, ready, action: null, next: "step" };
}
