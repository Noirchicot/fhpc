/* ══ L'ÉTAPE COMPÉTENCES — lot 39 ═══════════════════════════════════════
   Le plus gros écran du produit, et ZÉRO règle de jeu : le moteur prononce,
   l'écran affiche (loi du lot, §3c de la commande). Ce fichier ne fait que
   descendre `resolved`, `decisions[]` et `validate().violations` — jamais un
   calcul de points, jamais un « est-ce que j'ai le droit ».

   ⭐ LA MESURE QUI CHANGE TOUT (voir la commande, §0) : `resolved.skills` est
   DÉJÀ la grille — 26 lignes, toujours, chacune avec son palier courant et
   son bonus. Ne JAMAIS reconstruire cette liste depuis `decisions[]` — c'est
   le bogue de l'écran du lot 33 (il ne montrait que les imposés). Les
   OUTILS, à l'inverse, sont un ensemble OUVERT : `resolved.tools[]` ne porte
   que les acquis, et le CATALOGUE COMPLET (36) vient de
   `layers.query({kind:"tool"})`.

   ⚠️ LE PALIER D'UN OUTIL NON ACQUIS — sondé pour cette commande (§3a) :
   `resolved.tools[]` ne publie QUE les outils possédés ou dépensés
   (`src/build/derive.mjs`, commentaire au-dessus de la fusion des outils
   achetés au pool). Un outil absent de cette collection n'a donc, par
   construction, AUCUN palier — l'absence EST l'encodage de « none », au même
   titre que `resolved.languages`/`resolved.traits` (catégorie training) sont
   des ensembles ouverts qui ne listent que ce qui est acquis (commande §0).
   Ce n'est pas une supposition : c'est ce que la forme même de `resolved`
   décrit. Voir INVENTAIRE-LOT-39.md pour la mesure complète — cette
   question était la question ouverte nommée par la commande, et elle a une
   réponse qui ne demande pas d'arrêt.

   ── DEUX PORTES NE SONT PAS DANS `decisions[]` (commande §0) ────────────
   La dépense du pool libre (`fh.skills.spend.<slug>`) et un apprentissage
   (`fh.skills.train.<slug>`) ne vivent QUE dans `resolved` — ce fichier ne
   les cherche jamais dans le carnet. Les deux AUTRES portes (les 2 imposés
   de classe, le budget captif d'espèce) VIVENT dans `decisions[]`, et
   c'est de là que ce fichier lit leurs compteurs — jamais recalculés.

   ── LES MOTS DES REFUS, ET POURQUOI ILS NE VIENNENT PAS DE `src/labels.mjs`
   La commande (§3d) dit « le mot vient de src/labels.mjs ». Mesuré : ce
   fichier ne porte qu'un paquet FRANÇAIS (`FR_BUILD`), écrit pour
   l'architecte/le MCP — jamais consommé par un joueur avant ce lot. La table
   d'Eric joue en anglais (arbitrage du 2026-08-10, déjà tenu par `shell.mjs`
   pour les intitulés d'étape). `REFUSAL_WORDS`, plus bas, recompose donc les
   MÊMES clefs et les MÊMES paramètres — que le moteur a déjà produits — en
   anglais. Ce n'est ni une règle inventée (loi §0.13 : « le moteur produit
   des identifiants, l'UI produit des mots » — c'est EXACTEMENT ce rôle) ni
   une réécriture des clefs elles-mêmes. Écart assumé et signalé, voir
   INVENTAIRE-LOT-39.md §« ce qui a changé ». */

/* ── LES CATÉGORIES — rangement seulement (ADDENDUMS §« Le rangement des
   compétences ») : « aucun effet de règle », donc leur ordre et leurs mots
   sont du vocabulaire d'écran, pas un fait à lire dans une couche — au même
   titre que les intitulés d'étape de `shell.mjs`. Un cinquième groupe
   catch-all existe pour tout `category` absent ou inconnu : un personnage
   SRD pur (couche FH débrayée) affiche alors « une liste non rangée »
   (ADDENDUMS), sans jamais casser. */
const CATEGORY_ORDER = ["knowledge", "social", "exploration", "physical"];
const CATEGORY_LABEL = {
  knowledge: "Knowledge",
  social: "Social",
  exploration: "Exploration",
  physical: "Physical"
};
const UNSORTED_LABEL = "Skills";
/* Le sixième cran de la molette (B7.1) — un label, pas un titre affiché. */
const TOOLS_LABEL = "Tools & Trainings";

/* ── LA RAMPE DES PALIERS — trois rangs, trois glyphes, trois jetons. Les
   jetons `tokens.css` sont nommés PAR RANG (`--tier-1/2/3`), pas par nom de
   palier (demi/plein/expertise) — précisément pour que cet écran n'ait
   jamais besoin de connaître ces trois mots. `purchasableTiers()` lit
   `tier_costs` et les TRIE par coût croissant : le rang 0 est toujours le
   moins cher, quel que soit son nom. */
/* ══ B7.4 — LE BOUTON « 0 » EST SUPPRIMÉ, ET ÇA DÉBLOQUE TOUT ═══════════
   Eric, 2026-08-14 : « le bouton 0 est obsolète. Rien de rempli = 0. »
   Il reste TROIS ronds, aux conventions D&D Beyond : demi-plein · plein ·
   plein entouré. L'état « aucune maîtrise » n'est plus un bouton : c'est
   l'ABSENCE de remplissage.

   📌 Comment revient-on à 0 ? C'était DÉJÀ codé (carnet.mjs, lot 42, et ici
   même) : re-toucher le rond actif l'efface. Rien à inventer.

   ⭐ ET CE N'ÉTAIT PAS UN DÉTAIL D'AFFICHAGE. Mesure de B7.5 : avec QUATRE
   ronds au seuil tactile (44 px), il ne restait que 76 px pour le nom — «
   une ligne » et « touches au doigt » étaient INCOMPATIBLES à 360 px. Avec
   trois, il en reste 124, et les deux passent. La suppression du 0 est ce
   qui rend cet écran faisable au doigt. */
const TIER_GLYPH = ["◐", "●", "◉"];
const NONE_GLYPH = "—";

/* ── LOT 57, §1.3 DE LA COMMANDE — LES TROIS CLEFS MACHINE ═══════════════
   `renderTierButtons` posait `aria-label = tierKey` mot pour mot : un
   lecteur d'écran annonçait « half », « proficient » ou « expertise » — la
   clef que `src/modules/fh/skill-pool.mjs` (`tier_costs`, lignes 335-337)
   utilise en interne, pas un mot pour une oreille humaine. Ces trois clefs
   SONT closes (le moteur les compare littéralement — voir la même fonction,
   `TIER_ORDER`), donc une table en dur ici n'est pas le littéral que la
   commande interdit ailleurs pour du CONTENU (§3a de la commande du lot 39,
   tête de fichier) : c'est du VOCABULAIRE D'ÉCRAN, au même titre que
   `CATEGORY_LABEL` juste au-dessus. Repli sur la clef brute si le moteur
   apprend un quatrième palier demain — même loi que `REFUSAL_WORDS`
   (`refusalWord`, ligne 101) : jamais un écran qui plante sur une clef
   inconnue. Le mot du tiret voisin (« No proficiency », ligne 244 plus bas,
   inchangé) fixe le registre : cette table le prolonge. */
const TIER_LABEL = {
  half: "Half proficiency",
  proficient: "Full proficiency",
  expertise: "Expertise"
};

/* ── LE VOCABULAIRE DU BUDGET CAPTIF — et pourquoi ces deux mots-ci sont
   écrits ici, en dur, sans que ce soit la même faute que « tier_costts en
   dur ». `tier_costs` est du CONTENU (un NOMBRE qu'Eric peut changer par
   classe, lu sur un record). Le budget captif (Keen Senses) n'a PAS de
   record de coûts : sa paire {half, proficient} est un fait STRUCTUREL du
   mécanisme « budget captif » lui-même, câblé dans `src/build/derive.mjs`
   (`BUDGET_TIER_COST`) — la même feuille dont dépend déjà `decisions.mjs`
   pour produire ses propres `options`. Un slug jamais cliqué ne porte
   AUCUNE entrée dans `decisions[]` : il n'existe donc aucun endroit vivant
   où lire cette paire avant le premier clic. Signalé, pas caché — voir
   INVENTAIRE-LOT-39.md. */

const REFUSAL_WORDS = {
  "skill-pool.overspent": (p) => `Overspent by ${p.over} — ${p.spent} of ${p.available} spent.`,
  "skill-pool.no-tool": () => "At least 1 point must go into a tool.",
  "skill-spend.option-unavailable": (p) => `“${p.selected}” isn't on the catalogue.`,
  "skill-spend.tier-invalid": (p) => `“${p.value}” isn't a valid tier.`,
  "skill-spend.below-floor": (p) => `Can't drop below the locked floor (${p.floor}).`,
  "skill-spend.tier-locked": (p) => `Expertise unlocks at level ${p.unlockLevel} — this character is ${p.level}.`,
  "skill-train.option-unavailable": (p) => `“${p.selected}” isn't on the catalogue.`,
  "skill-train.value-invalid": () => "A training only takes true or false.",
  "skill-train.level-locked": (p) => `Unlocks at level ${p.unlockLevel} — this character is ${p.level}.`,
  "skill-budget.option-unavailable": (p) => `“${p.selected}” is outside this budget.`,
  "skill-budget.tier-invalid": () => "A captive budget only spends at ½ or Full.",
  "skill-budget.overspent": (p) => `Overspent by ${p.spent - p.points} — ${p.spent} of ${p.points} spent.`
};

/** Rend le mot d'un refus. Un `key` inconnu retombe sur lui-même — jamais
 *  un écran qui plante sur une clef que le moteur apprendrait demain. */
/** Le mot d'un refus, EXPORTÉ pour la coquille : c'est elle qui réveille le
 *  popup à chaque écart (B7.7c), mais le vocabulaire appartient à l'écran. */
export function skillsRefusalWord(violation) { return refusalWord(violation); }

function refusalWord(violation) {
  const words = REFUSAL_WORDS[violation.key];
  return words ? words(violation.params || {}) : violation.key;
}

/* LOT 42 — `planAt`/`violationAt` étaient définies ICI (lignes 118/121) ;
   trois écrans les lisent maintenant (Compétences, Class, Species) : sorties
   dans `ui/builder/carnet.mjs`, importées telles quelles — extraction
   neutre, aucun comportement changé, voir INVENTAIRE-LOT-42.md. */
import { planAt, violationAt, markPressed } from "./carnet.mjs?v=93";
import { keepInView, scrollParent } from "./socle.mjs?v=93";

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }
function abilityLabel(key) { return typeof key === "string" ? key.slice(0, 3).toUpperCase() : "—"; }
function signed(n) { return Number.isInteger(n) ? (n >= 0 ? `+${n}` : String(n)) : "—"; }

function findPoolStat(resolved) {
  const stats = resolved && Array.isArray(resolved.stats) ? resolved.stats : [];
  return stats.find((s) => s.id === "fh:skill-points") || null;
}

/** L'id de la classe, lu sur la ligne de détail dont la source EST la
 *  classe — jamais un texte de libellé. N'importe quelle ligne de classe
 *  convient : elles désignent toutes le même record. */
function classIdFromBreakdown(poolStat) {
  const line = (poolStat.breakdown || []).find((l) => l.source && l.source.kind === "class");
  return line ? line.source.id : null;
}

/** Les paliers ACHETABLES, triés par coût croissant — jamais une liste en
 *  dur (commande §3a). `imposed` n'est pas un palier qu'on achète : c'est
 *  le coût d'un choix imposé, une mécanique différente. */
function purchasableTiers(pool) {
  if (!pool || !pool.tier_costs || typeof pool.tier_costs !== "object") return [];
  return Object.keys(pool.tier_costs)
    .filter((key) => key !== "imposed")
    .sort((a, b) => pool.tier_costs[a] - pool.tier_costs[b]);
}

/** Les slugs verrouillés par un choix imposé QUE CETTE COMMANDE NE REND PAS
 *  ÉDITABLE ICI (décision n°3 : ce choix se pose à l'étape Class/Species).
 *  Cette grille ne fait que LIRE où ils vivent pour poser le cadenas. */
function lockLabel(decisions, resolved, slug) {
  const classPlan = planAt(decisions, "class.skills");
  if (classPlan && classPlan.selected.includes(slug)) {
    const className = resolved.identity && resolved.identity.classes && resolved.identity.classes[0]
      ? resolved.identity.classes[0].name : "class";
    return `Locked · ${className}`;
  }
  const speciesPlan = planAt(decisions, "species.skills");
  if (speciesPlan && speciesPlan.selected.includes(slug)) {
    const speciesName = (resolved.identity && resolved.identity.species) || "species";
    return `Locked · ${speciesName}`;
  }
  return null;
}

/* ══ LE COMPTEUR — trois bourses qui NE s'additionnent PAS (commande §2b) ═
   `Left` est le SEUL nombre lu tel quel (`resolved.stats['fh:skill-points']
   .value`, sans un octet touché) — c'est lui que porte l'attaque du test 12
   : un total menteur DOIT s'afficher menteur. `Pool` et `Invested`, eux,
   n'existent nulle part comme champ unique : ce sont des ASSEMBLAGES
   d'affichage (ADDENDUMS, même mot, à propos de la 5ᵉ colonne) — chacun
   somme des lignes déjà DÉRIVÉES par le moteur (`breakdown[]`, groupé par
   son `source.kind` déjà publié), jamais une donnée de règle recalculée
   depuis zéro. La forme même de la somme (`spent + Class.answered +
   Species.answered = Invested`) est celle du worked example ratifié par la
   commande, pas une arithmétique inventée ici. */
function computeCounter(resolved, decisions) {
  const poolStat = findPoolStat(resolved);
  if (!poolStat) return null;
  const breakdown = Array.isArray(poolStat.breakdown) ? poolStat.breakdown : [];
  const spentPool = -breakdown
    .filter((line) => line.source && ["skill", "tool", "training"].includes(line.source.kind))
    .reduce((sum, line) => sum + line.value, 0);
  const left = poolStat.value; // ⚠️ RAW — jamais recalculé, même si menteur (test 12)
  const availablePool = spentPool + left;
  const classPlan = planAt(decisions, "class.skills");
  const speciesBudgetPlan = planAt(decisions, "species.skillBudget");
  const invested = spentPool + (classPlan ? classPlan.answered : 0) + (speciesBudgetPlan ? speciesBudgetPlan.answered : 0);
  return { spentPool, availablePool, left, classPlan, speciesBudgetPlan, invested };
}

function counterLine(label, value, over) {
  const line = el("div", "skills-counter-line", [
    el("span", "skills-counter-label", [text(label)]),
    el("span", "skills-counter-value", [text(over ? `${value} · OVER` : value)])
  ]);
  if (over) line.dataset.over = "true";
  return line;
}

/* ══ B7.1 — CE QUI FLOTTE, ET CE QUI NE FLOTTE PAS ══════════════════════
   Eric a coupé le compteur en DEUX, et la distinction est fine et voulue :

     🔒 LIGNE 1 — `Pool · Invested · Left`, plus `Reset` : elle FLOTTE.
     📜 LIGNE 2 — le calcul, écrit plus petit (`Class / Species = X`) : elle
        DISPARAÎT dans le défilement.

   ⭐ C'est sa réponse à son propre défaut A-1.1 (« je voudrais un flottant
   pour voir le compte, ça disparaît ») : **on garde sous les yeux COMBIEN IL
   RESTE, pas D'OÙ ÇA VIENT.**

   ⛔ ET `Reset` EST DANS LA LIGNE 1 (B7.8), pas ailleurs. L'architecte avait
   lu « à droite du calcul » comme la ligne 2 et bâti toute une justification
   dessus (« Reset est destructeur, le sortir du champ permanent évite les
   gestes accidentels ») — élégant et faux. Eric : « non, elle est dans la
   barre du pool ». Il reste donc TOUJOURS atteignable, sans remonter. */
function renderPoolBar(counter, poolViolation, ctx) {
  const wrap = el("div", "skills-poolbar");
  wrap.dataset.status = counter.left < 0 ? "over" : "ok";
  wrap.append(counterLine("Pool", `${counter.spentPool}/${counter.availablePool}`));
  wrap.append(counterLine("Invested", String(counter.invested)));
  wrap.append(counterLine("Left", String(counter.left), counter.left < 0));
  wrap.append(renderResetButton(ctx));
  /* ⛔ §3d, MESURÉ : `skill-pool.overspent` ne porte JAMAIS de `.path` — le
     total est fautif, pas une ligne. Il se pose donc sur la barre du pool,
     et nulle part sur la grille. */
  if (poolViolation) wrap.dataset.refus = "true";
  return wrap;
}

/** LIGNE 2 — le calcul, plus petit, et il défile (B7.1). */
function renderPoolDetail(counter, poolViolation) {
  const wrap = el("div", "skills-pooldetail");
  const morceaux = [];
  if (counter.classPlan) morceaux.push(`Class ${counter.classPlan.answered}/${counter.classPlan.expected}`);
  if (counter.speciesBudgetPlan) {
    morceaux.push(`Species ${counter.speciesBudgetPlan.answered}/${counter.speciesBudgetPlan.expected}`);
  }
  morceaux.push(`Spent ${counter.spentPool}`);
  wrap.append(el("p", "skills-pooldetail-line", [text(`${morceaux.join(" · ")} = ${counter.invested} invested`)]));
  if (poolViolation) wrap.append(el("p", "skills-refusal skills-refusal-pool", [text(refusalWord(poolViolation))]));
  return wrap;
}

/* ══ LA NOTIFICATION DU ROGUE — une ligne, générique (commande §3e) ═════
   Ce n'est PAS un test sur le nom de la classe : n'importe quelle classe
   dont `expertise_from_level` est déjà atteint reçoit la même ligne — le
   Rogue la voit dès le niveau 1 parce que SA valeur y est, pas parce que ce
   fichier connaît son nom. */
function renderRogueNotice(pool, classView, level) {
  if (!pool || !classView) return null;
  if (!Number.isInteger(pool.expertise_from_level) || !Number.isInteger(level)) return null;
  if (level < pool.expertise_from_level) return null;
  const cost = pool.tier_costs && pool.tier_costs.expertise;
  if (!Number.isInteger(cost)) return null;
  return el("p", "skills-rogue-notice", [text(
    `${classView.record.name} — you may buy Expertise from level ${pool.expertise_from_level} (${cost} pts)`
  )]);
}

/** Les boutons de palier, communs à la grille libre et au budget captif —
 *  MÊME composant, MÊMES verbes (`set`/`clear`), seule la liste des paliers
 *  et le chemin changent. Le clic REND toujours l'action, jamais un calcul
 *  local (§3c) : cliquer le palier déjà actif efface le choix (bascule),
 *  cliquer le tiret efface aussi — le moteur dira si c'est illégal. */
function renderTierButtons({ currentTier, tiers, path, onAction, violation }) {
  const wrap = el("div", "skills-tiers");
  /* ⛔ PLUS DE TIRET (B7.4) : « rien de rempli = 0 ». Le quatrième bouton a
     disparu, et avec lui les 48 px qui empêchaient la ligne de tenir. */
  tiers.forEach((tierKey, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "skills-tier-btn";
    btn.dataset.rung = String(index + 1);
    btn.dataset.tier = tierKey;
    markPressed(btn, currentTier === tierKey);
    btn.textContent = TIER_GLYPH[index] || "?";
    btn.setAttribute("aria-label", TIER_LABEL[tierKey] || tierKey);
    btn.addEventListener("click", () => {
      if (currentTier === tierKey) onAction({ kind: "clear", path });
      else onAction({ kind: "set", path, value: tierKey });
    });
    wrap.append(btn);
  });
  if (violation) wrap.append(el("p", "skills-refusal", [text(refusalWord(violation))]));
  return wrap;
}

/** La rampe d'une ligne VERROUILLÉE : les trois ronds sont là (le joueur
 *  doit voir ce qu'il a), mais aucun ne pose de verbe — ils réveillent le
 *  popup. ⛔ Ni `disabled` ni retrait : un contrôle absent n'explique rien,
 *  et un contrôle grisé ne se touche pas, donc ne peut rien dire. */
function renderFloorTiers(skill, lock, onAction) {
  const wrap = el("div", "skills-tiers");
  wrap.dataset.floor = "true";
  TIER_GLYPH.forEach((glyph, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "skills-tier-btn";
    btn.dataset.rung = String(index + 1);
    markPressed(btn, index === 0 && skill.proficiency !== "none");
    btn.textContent = glyph;
    btn.setAttribute("aria-label", `${skill.name} — ${lock}`);
    btn.addEventListener("click", () => onAction({ kind: "popup", texte: `${skill.name} — ${lock}. Change it on that step.` }));
    wrap.append(btn);
  });
  return wrap;
}

/* ══ LA GRILLE LIBRE — 3 colonnes, Skill/Tool · Invested · Cost ═════════
   Décision n°2 : pas de colonne Floor — un plancher est un cadenas sur la
   ligne, jamais une saisie. `Cost`, ici, n'est pas un nombre par ligne :
   c'est la RAMPE elle-même (les glyphes portent leur coût par leur rang,
   lu depuis `tier_costs`) — une colonne « Cost » numérique redirait ce que
   la rampe dit déjà, et écrire les nombres 1/2/4 en dehors des jetons de
   rang serait exactement le littéral que la commande interdit (§0). */
/* ══ B7.2 — VERROUILLÉ, MAIS PAS MUET ════════════════════════════════════
   « Species skills est DÉJÀ VERROUILLÉ. Si on y touche, un petit commentaire
   s'affiche, qui REPOSE le choix au joueur s'il veut changer. Une couleur
   spécifique marque le PLANCHER. »

   ⛔ Le cadenas n'est plus un MOT sur la ligne (« Locked · Elf »), il est un
   ÉTAT de la ligne (`data-floor`) que la couleur porte — c'est ce que dit
   « une couleur spécifique marque le plancher », et ça rend au nom les
   pixels que le mot lui prenait (B7.3c : une seule ligne). Le mot, lui,
   revient dans le popup quand on touche. */
function renderSkillRow(skill, ctx) {
  const { resolved, decisions, violations, tiers, onAction } = ctx;
  const row = el("div", "skills-row");
  row.dataset.row = skill.id;
  const lock = lockLabel(decisions, resolved, skill.id);
  if (lock) row.dataset.floor = "true";
  row.append(el("span", "skills-row-name", [text(skill.name)]));
  row.append(el("span", "skills-row-ability", [text(abilityLabel(skill.ability))]));
  row.append(el("span", "skills-row-bonus", [text(signed(skill.bonus))]));
  if (lock) {
    /* Toucher un plancher ne change RIEN au document — ça réveille le popup,
       qui nomme d'où vient le verrou et où le rouvrir (B7.2b). */
    row.append(renderFloorTiers(skill, lock, onAction));
    return row;
  }
  if (tiers.length > 0) {
    const path = `fh.skills.spend.${skill.id}`;
    row.append(renderTierButtons({
      currentTier: skill.proficiency, tiers, path, onAction, violation: violationAt(violations, path)
    }));
  } else {
    row.append(el("span", "skills-row-static", [text(skill.proficiency === "none" ? NONE_GLYPH : "Proficient")]));
  }
  return row;
}

/* ══ B7.3a/b — UNE CATÉGORIE = UNE DALLE MAJEURE, SANS SON TITRE ════════
   « Chaque catégorie flotte sur une dalle MAJEURE pleine largeur. »
   ⛔ « Ne pas re-préciser Knowledge en titre — le spy et le snap le rendent
   évident » : la molette du haut surligne déjà la catégorie courante, et le
   défilement s'y aimante. Un titre de plus redirait ce que deux mécanismes
   disent déjà, et coûterait une ligne par catégorie sur un écran qui en
   compte six.
   📌 `data-snap` est le contrat avec le scrollspy du socle — le MÊME que
   celui des catalogues (SOCLE.md). Le label voyage en `data-label` : la
   molette le lit, l'écran ne l'affiche pas. */
function renderCategoryGroup(label, skills, ctx) {
  const group = el("section", "skills-group dalle-majeure");
  group.dataset.snap = "skills";
  group.dataset.label = label;
  const rows = el("div", "skills-rows");
  for (const skill of skills) rows.append(renderSkillRow(skill, ctx));
  group.append(rows);
  return group;
}

function renderMainGrid(ctx) {
  const { resolved, query } = ctx;
  const skills = Array.isArray(resolved.skills) ? resolved.skills : [];
  if (skills.length === 0) {
    return el("p", "placeholder", [text("No skills to spend on yet — pick a class first.")]);
  }
  const skillCatalog = query({ kind: "skill" }) || [];
  const categoryBySlug = new Map(skillCatalog.map((view) => [view.record.slug, view.record.data && view.record.data.category]));
  const byCategory = new Map(CATEGORY_ORDER.map((key) => [key, []]));
  const unsorted = [];
  for (const skill of skills) {
    const category = categoryBySlug.get(skill.id);
    if (category && byCategory.has(category)) byCategory.get(category).push(skill);
    else unsorted.push(skill);
  }
  const wrap = el("div", "skills-grid");
  for (const key of CATEGORY_ORDER) {
    const group = byCategory.get(key);
    if (group.length === 0) continue;
    group.sort((a, b) => a.name.localeCompare(b.name)); // ADDENDUMS : ordre alphabétique dans chaque catégorie
    wrap.append(renderCategoryGroup(CATEGORY_LABEL[key], group, ctx));
  }
  if (unsorted.length > 0) {
    unsorted.sort((a, b) => a.name.localeCompare(b.name));
    wrap.append(renderCategoryGroup(UNSORTED_LABEL, unsorted, ctx));
  }
  return wrap;
}

/* ⛔ B7.2d — LE TABLEAU « SPECIES SKILL BUDGET » A DÉGAGÉ D'ICI, avec son
   balisage (loi §0.6). Eric : « le tableau Species skill budget DÉGAGE ».
   ⚠️ IL N'EST PAS SUPPRIMÉ DU PRODUIT : depuis le lot 60 il vit sur l'écran
   SPECIES, au 2ᵉ palier de son `Validate` — c'est-à-dire à l'endroit où le
   choix se prend. Ce qui part d'ici, c'est le DOUBLON : la même bourse
   pilotée depuis deux écrans, sur les mêmes chemins
   (`species.skillBudget.<slug>`), aurait fini par diverger.
   📌 Son compte reste LU ici, en ligne 2 du compteur — savoir ce qu'on a
   investi ailleurs n'oblige pas à pouvoir le changer ici. */

/* ══ TOOLS & TRAININGS — un intertitre, trois sous-blocs (décision n°4) ═ */
function renderToolRow(view, ctx) {
  const { resolved, violations, tiers, onAction } = ctx;
  const slug = view.record.slug;
  const owned = (resolved.tools || []).find((tool) => tool.id === slug) || null;
  const abilityKey = view.record.data && view.record.data.ability_key;
  const row = el("div", "skills-row");
  row.dataset.row = slug;
  row.append(el("span", "skills-row-name", [text(view.record.name)]));
  row.append(el("span", "skills-row-ability", [text(abilityLabel(abilityKey))]));
  /* Le bonus d'un outil NON acquis n'est publié nulle part (§ tête de
     fichier) : il vaut le modificateur brut de sa caractéristique — un
     champ DÉJÀ dérivé (`resolved.abilities[key].mod`), lu tel quel, jamais
     additionné ici. */
  const bonus = owned ? signed(owned.bonus)
    : (resolved.abilities && abilityKey && resolved.abilities[abilityKey])
      ? signed(resolved.abilities[abilityKey].mod) : "—";
  row.append(el("span", "skills-row-bonus", [text(bonus)]));
  if (tiers.length > 0) {
    const path = `fh.skills.spend.${slug}`;
    row.append(renderTierButtons({
      currentTier: owned ? owned.proficiency : "none", tiers, path, onAction, violation: violationAt(violations, path)
    }));
  } else {
    row.append(el("span", "skills-row-static", [text(owned ? "Proficient" : NONE_GLYPH)]));
  }
  return row;
}

function renderToolsBlock(ctx) {
  const { query } = ctx;
  const catalog = query({ kind: "tool" }) || [];
  const wrap = el("div", "skills-tools-block");
  wrap.append(el("h4", null, [text("Tools")]));
  const rows = el("div", "skills-rows");
  const sorted = [...catalog].sort((a, b) => a.record.name.localeCompare(b.record.name));
  for (const view of sorted) rows.append(renderToolRow(view, ctx));
  wrap.append(rows);
  return wrap;
}

function renderLanguagesBlock(ctx) {
  const { resolved } = ctx;
  const wrap = el("div", "skills-languages-block");
  wrap.append(el("h4", null, [text("Languages")]));
  const languages = Array.isArray(resolved.languages) ? resolved.languages : [];
  if (languages.length === 0) {
    /* ⛔ Aucun sélecteur — arbitrage §2c de la commande, révocable d'un mot :
       aucun genre `language` n'existe dans les 16 de la pile, et rien
       n'accorde de langue au niveau 1. Un sélecteur serait un sélecteur
       sans catalogue — du code mort (loi §0.6). */
    wrap.append(el("p", "skills-languages-note", [text("No languages recorded.")]));
  } else {
    const list = el("ul", "skills-languages-list");
    for (const language of languages) list.append(el("li", null, [text(language.name || language.id)]));
    wrap.append(list);
  }
  return wrap;
}

function renderTrainingRow(view, acquiredIds, ctx) {
  const { onAction } = ctx;
  const slug = view.record.slug || view.id;
  const acquired = acquiredIds.has(slug);
  const row = el("div", "skills-row");
  row.dataset.row = slug;
  row.append(el("span", "skills-row-name", [text(view.record.name)]));
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "skills-tier-btn";
  markPressed(btn, acquired);
  btn.textContent = acquired ? "★" : NONE_GLYPH;
  btn.setAttribute("aria-label", acquired ? "Trained" : "Not trained");
  btn.addEventListener("click", () => onAction({
    kind: acquired ? "clear" : "set",
    path: `fh.skills.train.${slug}`,
    value: acquired ? undefined : true
  }));
  row.append(btn);
  return row;
}

/** Le sous-bloc Trainings. Catalogue à 0 record aujourd'hui (ADDENDUMS,
 *  arbitré le 2026-08-13 : « on ne s'y attelle pas pour le moment ») —
 *  ⛔ grisé avec sa raison, PAS caché (décision n°4). Le chemin vivant (une
 *  liste réelle) est écrit et testé (un training synthétique, voir la
 *  suite) pour que le jour où un record existe, cet écran n'ait rien à
 *  rouvrir — mais RIEN n'invente le niveau générique « 4 » : ce nombre n'a
 *  aujourd'hui aucune source vivante (aucun refus ne peut se produire sans
 *  record), donc il n'est écrit nulle part ici. Voir INVENTAIRE-LOT-39.md. */
function renderTrainingsBlock(ctx) {
  const { query, resolved } = ctx;
  const catalog = query({ kind: "training" }) || [];
  const wrap = el("div", "skills-trainings-block");
  wrap.append(el("h4", null, [text("Trainings")]));
  if (catalog.length === 0) {
    wrap.dataset.status = "locked";
    wrap.append(el("p", "skills-trainings-note", [text(
      "Trainings buy in starting at a level set per training, unless a record says otherwise — the catalogue is empty for now."
    )]));
    return wrap;
  }
  const acquiredIds = new Set((resolved.traits || []).filter((t) => t.category === "training").map((t) => t.id));
  const rows = el("div", "skills-rows");
  const sorted = [...catalog].sort((a, b) => a.record.name.localeCompare(b.record.name));
  for (const view of sorted) rows.append(renderTrainingRow(view, acquiredIds, ctx));
  wrap.append(rows);
  return wrap;
}

function renderToolsAndTrainings(ctx) {
  /* Le sixième cran d'aimantation, même contrat que les cinq catégories.
     ⛔ Pas de titre non plus (B7.3b) : la molette le porte déjà. Ses TROIS
     sous-blocs, eux, gardent leurs intertitres — ils distinguent des choses
     différentes DANS la même dalle, ce que la molette ne dit pas. */
  const section = el("section", "skills-group skills-tools-trainings dalle-majeure");
  section.dataset.snap = "skills";
  section.dataset.label = TOOLS_LABEL;
  section.append(renderToolsBlock(ctx));
  section.append(renderLanguagesBlock(ctx));
  section.append(renderTrainingsBlock(ctx));
  return section;
}

/* ══ B7.1 — LA MOLETTE DE CATÉGORIES **FLOTTE** ═════════════════════════
   Elle ne vit plus DANS le contenu (`position: sticky`, lot 39) : elle est
   posée dans le slot horizontal FIXE du cadre (`.stage-topbar`,
   `shell.mjs`). C'est ce que B7.1 demande, et c'est aussi ce qui répond au
   défaut A-1.2 : elle portait la classe `belt` — la même que la ceinture
   d'étapes, qui, elle, CHANGE DE VUE — alors qu'elle ne filtre rien.

   ⭐ ET ELLE N'A PLUS SON PROPRE SCROLLSPY. `IntersectionObserver`
   s'abonnait élément par élément, donc mourait à chaque remplacement de
   contenu (le défaut §0). Le spy du socle (`watchSnap`) relit `[data-snap]`
   à chaque lecture et ne retient aucun nœud : il survit par construction.

   ⚠️ Les items ne sont PAS des boutons de filtre : cliquer AMÈNE la section
   dans le champ, elle ne cache jamais les autres (les six sections sont
   rendues ensemble, mesuré au lot 39). */
export function renderSkillsTopbar(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const bar = el("nav", "skills-catbar");
  bar.setAttribute("aria-label", "Skill categories");
  (ctx.categories || []).forEach((label, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "skills-cat";
    item.dataset.label = label;
    item.setAttribute("aria-current", index === (ctx.cursor || 0) ? "true" : "false");
    item.append(el("span", "skills-cat-label", [text(label)]));
    item.addEventListener("click", () => act({ kind: "snapTo", index }));
    bar.append(item);
  });
  const wrap = el("div", "skills-topbar");
  wrap.append(bar);
  if (ctx.poolBar) wrap.append(ctx.poolBar);
  return wrap;
}

function renderResetButton(ctx) {
  const { resolved, query, onAction } = ctx;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "skills-reset";
  btn.textContent = "Reset spent points";
  btn.addEventListener("click", () => {
    const paths = [];
    for (const skill of resolved.skills || []) paths.push(`fh.skills.spend.${skill.id}`);
    for (const view of query({ kind: "tool" }) || []) paths.push(`fh.skills.spend.${view.record.slug}`);
    for (const trait of (resolved.traits || []).filter((t) => t.category === "training")) {
      paths.push(`fh.skills.train.${trait.id}`);
    }
    onAction({ kind: "resetSkills", paths });
  });
  return btn;
}

/**
 * @param {object} ctx
 * @param {object} ctx.resolved   la fiche dérivée du dernier `rebuild()`
 * @param {Array}  ctx.decisions  le carnet du dernier `rebuild()`
 * @param {Array}  [ctx.violations] `validate({document}).violations`
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {(action: {kind:"set"|"clear"|"resetSkills", path?:string, value?:*, paths?:string[]}) => void} onAction
 */
export function renderSkillsStep(ctx, onAction) {
  const resolved = ctx.resolved || {};
  const decisions = ctx.decisions || [];
  const violations = ctx.violations || [];
  const query = ctx.query;
  /* Deux conventions d'appel cohabitent (lot 39) : la coquille passe le
     verbe en second argument, les tests peuvent le porter dans `ctx`. */
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "skills-step");

  const rowCtx = skillsRowCtx(ctx, act);
  const counter = computeCounter(resolved, decisions);

  /* 📜 LIGNE 2 — le calcul, et il DÉFILE (B7.1). La ligne 1 est ailleurs :
     elle flotte dans le slot fixe du cadre, avec `Reset` (B7.8). */
  if (counter) {
    const poolViolation = violations.find((v) => v.key === "skill-pool.overspent" || v.key === "skill-pool.no-tool") || null;
    section.append(renderPoolDetail(counter, poolViolation));
    const notice = renderRogueNotice(rowCtx.pool, rowCtx.classView, resolved.identity && resolved.identity.level);
    if (notice) section.append(notice);
  }

  section.append(renderMainGrid(rowCtx));
  section.append(renderToolsAndTrainings(rowCtx));
  return section;
}

/** Le `ctx` de ligne, composé UNE FOIS et partagé par le contenu ET la barre
 *  fixe — les deux doivent lire le même pool, sinon la barre pourrait
 *  afficher un compte que la grille contredit. */
function skillsRowCtx(ctx, act) {
  const resolved = ctx.resolved || {};
  const query = ctx.query;
  const poolStat = findPoolStat(resolved);
  let pool = null;
  let classView = null;
  let tiers = [];
  if (poolStat) {
    const classId = classIdFromBreakdown(poolStat);
    classView = classId ? query({ kind: "class", id: classId }) : null;
    pool = classView && classView.record.data ? classView.record.data.fh_skill_pool : null;
    tiers = purchasableTiers(pool);
  }
  return {
    resolved, decisions: ctx.decisions || [], violations: ctx.violations || [],
    tiers, query, pool, classView, onAction: act
  };
}

/** LES CATÉGORIES RÉELLEMENT RENDUES, dans l'ordre — la molette du cadre en
 *  a besoin, et elle doit lire EXACTEMENT la même liste que la grille (une
 *  catégorie vide ne reçoit pas de raccourci vers rien, loi du lot 39). */
export function skillsCategories(ctx) {
  const grille = renderMainGrid(skillsRowCtx(ctx, () => {}));
  const groupes = grille.querySelectorAll ? grille.querySelectorAll("[data-snap]") : [];
  const labels = [...groupes].map((n) => n.getAttribute("data-label"));
  return labels.concat(TOOLS_LABEL);
}

/** LA BARRE FIXE de l'écran (B7.1) : la molette de catégories + la ligne 1
 *  du pool, `Reset` compris. C'est `shell.mjs` qui la pose dans le slot
 *  horizontal du cadre — elle ne défile jamais. */
export function renderSkillsBar(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const rowCtx = skillsRowCtx(ctx, act);
  const counter = computeCounter(ctx.resolved || {}, ctx.decisions || []);
  const violations = ctx.violations || [];
  const poolViolation = violations.find((v) => v.key === "skill-pool.overspent" || v.key === "skill-pool.no-tool") || null;
  return renderSkillsTopbar({
    categories: skillsCategories(ctx),
    cursor: ctx.cursor || 0,
    poolBar: counter ? renderPoolBar(counter, poolViolation, rowCtx) : null
  }, act);
}

/** LE PALIER UNIQUE DE COMPÉTENCES — B7.3d : « Valid s'illumine quand le
 *  compte est bon ». Le compte vient du moteur (`Left`), jamais d'ici : un
 *  pool négatif est un dépassement, et `validate()` le refuse déjà. */
export function skillsValidate(ctx) {
  const counter = computeCounter(ctx.resolved || {}, ctx.decisions || []);
  return {
    exists: true,
    ready: Boolean(counter) && counter.left >= 0,
    action: null,
    next: "step"
  };
}
