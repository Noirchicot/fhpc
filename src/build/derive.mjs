/* ══ LA DÉRIVATION — LE PLI DES COUCHES ET DES CHOIX VERS `resolved` ═══
   Lot 9-bloc-build, §L9. Deuxième maillon du chemin critique du M2 :
   `layers` → `build` → MCP v0.

   FONCTION PURE. Elle ne connaît ni le noyau, ni le bus, ni le disque, ni
   l'horloge : on lui passe un `query`, une pile, des choix, un instant, et
   elle rend une tranche `resolved` et la LISTE DE CE QU'ELLE N'A PAS PU
   DÉRIVER. C'est cette liste qui fait la différence entre une fiche
   incomplète et une fiche silencieusement fausse.

   ── LES QUATRE RÈGLES DE REFUS, ET POURQUOI ELLES DIFFÈRENT ─────────────

   1. **Un NOMBRE qu'on ne sait pas calculer est ABSENT**, jamais nul, jamais
      zéro. `vitals.hpMax` sans `hit_die` ne vaut pas 0 : il n'existe pas, et
      `underived` le dit avec la raison. Un zéro consolant se joue sans que
      personne le remarque ; une absence saute aux yeux.
   2. **Une COLLECTION que la pile ne sait pas nourrir est VIDE — et la
      déclaration est OBLIGATOIRE.** Le schéma `fh-char/1` exige la présence
      des vingt clefs de `resolved` : omettre `senses` rendrait le document
      invalide, donc injouable, alors qu'une fiche sans sens est parfaitement
      jouable. La règle est donc : liste vide + entrée `underived`, jamais
      l'une sans l'autre. ⚠️ **Invariant testé** (`build-derive`) : aucune
      collection vide n'est rendue sans sa déclaration. ⚠️ Question 1 à
      l'architecte : cette ligne entre nombre et collection est la mienne.
   3. **Une STRUCTURE dont un champ obligatoire manque n'est pas émise à
      moitié.** Une entrée `tools` sans `ability` ne passe pas le schéma : on
      ne la met pas, et on nomme l'outil sauté.
   4. **Ce qui est STRUCTUREL jette.** Sans niveau et sans classe, il n'y a
      pas de personnage à dériver : ce n'est pas une dérivation incomplète,
      c'est une dérivation impossible. Elle jette en nommant le choix qui
      manque.

   ── CE QUI N'EST PAS RECALCULÉ : L'ÉTAT DE JEU ──────────────────────────
   Une reconstruction ne remet pas les points de vie au maximum. `hpCurrent`,
   `tempHp`, `conditions`, le `current` des emplacements et celui des
   ressources sont REPRIS de la tranche précédente quand elle existe. Un MJ
   qui corrige une compétence en pleine séance ne soigne pas la table
   (leçon `fix-panel-persistence` n°4 : les ressources comptées vivent dans
   `resolved` et se décrémentent au règlement).

   ── §0.13 : LE MOTEUR PRODUIT DES IDENTIFIANTS ──────────────────────────
   Aucun mot affichable n'est écrit ici. Tous ceux qui atterrissent dans
   `resolved` — « Magicien », « Perception », « Élfe » — sont le `name` d'un
   RECORD, recopié tel quel. Aucune table `"Sagesse" → wis` : les clefs de
   caractéristique arrivent par les champs `*_key` du contrat
   `contracts/DERIVATION-FIELDS.md`, et si elles n'y sont pas, le champ est
   déclaré non dérivé. Un garde structurel interdit le vocabulaire français
   de jeu dans ce répertoire. */

import { BuildError } from "./errors.mjs";
import { parseChoicePath } from "./paths.mjs";
import { ABILITY_KEYS, allowedSlugs, assertAbilityKey, indexSkills } from "./skills.mjs";
/* LOT 41 — le mécanisme des mots (lot 27), réemployé pour `underived`. Import
   du RACINE de `src/`, jamais de `src/modules/fh/` : c'est la frontière que
   §0.12 garde sur les octets, commentaires compris. */
import { createLabels, underivedEntry, renderUnderived, FR_UNDERIVED } from "../labels.mjs";

export { ABILITY_KEYS };

const ABILITY_SET = new Set(ABILITY_KEYS);
const frUnderivedGeneric = createLabels(FR_UNDERIVED);

/** Les quatre dénominations de `$defs/currency`. */
export const CURRENCY_KEYS = ["cp", "sp", "gp", "pp"];

/** `$defs/resolved.spellcasting.spells[].text.maxLength`. Recopié ici parce
 *  que la dérivation doit DÉCIDER (porter ou déclarer) et non seulement
 *  valider ; un test compare les deux nombres. */
export const SPELL_TEXT_MAX = 4000;

/* ── LES MODULES DE STATISTIQUE, ET LA FRONTIÈRE QU'ILS TIENNENT ──────
   Lot 19. Une statistique dérivée est produite par un MODULE MOTEUR activé
   par un drapeau de couche (décision Q4) — jamais par le pli lui-même. Ce
   fichier ne connaît donc AUCUN module : il reçoit une liste par injection,
   il lit les drapeaux que la pile lève, et il n'appelle que ceux dont le
   drapeau est levé. Le garde de frontière du bloc interdit déjà nommément un
   import de `src/modules/` ici (`tests/build-block.test.mjs`).

   Un module déclare `{flag, id, contribute(input)}` et rend
   `{stat, underived}`. Ce qu'il reçoit est ce que le pli a DÉJÀ su lire — le
   NIVEAU, la maîtrise, le record d'espèce, ses propres choix — et rien du
   document.

   ⚠️ REWRITTEN 2026-08-09 (lot 23) — « la maîtrise, le record d'espèce » était
   la liste complète, et elle est devenue insuffisante. Le NIVEAU s'y ajoute,
   parce que la maîtrise ne le dit pas : les niveaux 5 à 8 la donnent tous à 3.
   Une statistique qui s'accumule par niveau n'était donc pas dérivable, et le
   module n'avait qu'une issue — une table de niveaux EN DUR.

   ── DEUX AJOUTS DU LOT 20, ET ILS SONT DÉLIBÉRÉMENT GÉNÉRIQUES ────────
   Ce fichier ne nomme AUCUNE mécanique de couche (§0.12) : il ouvre un
   chemin, il ne s'en sert pas.

   1. `records` — LE MÊME CHEMIN DE LECTURE QUE LE PLI, pas un second.
      Un module qui recevait un `ref` dans un de ses choix ne pouvait rien en
      faire : il tenait un identifiant et n'avait aucun moyen d'atteindre le
      record. Sa seule issue aurait été d'écrire la valeur EN DUR dans le
      module — très exactement ce que la collection `stats[]` existe pour
      éviter. Il rend la vue APLATIE (`{id, name, slug, data}`), comme
      `species`, pour que la forme interne des couches reste au bloc `layers`.
      ⚠️ SANS `id`, IL REND LA LISTE DU GENRE, et ce n'est pas un confort :
      c'est ce qui distingue « le genre répond VIDE » (le contenu n'est pas
      monté — à DÉCLARER) de « le genre est peuplé et ce record n'y est pas »
      (un `ref` mort — à REFUSER). Un simple `null` confondrait les deux, et
      un contenu manquant se lirait comme un document faux.

   2. `refs` — TOUS les records que le personnage désigne par un `ref` HORS du
      namespace du module, dans l'ordre du document, chacun avec le chemin qui
      l'a nommé et son `kind`. Le module filtre sur le genre qui l'intéresse.

      ⚠️ GÉNÉRALISÉ PAR L'ARCHITECTE LE 2026-08-08, et c'était sa dette, pas
      une amélioration de confort. Le lot 20 avait dû ouvrir un canal
      `feats` — la seule forme que sa section autorisait — parce qu'un don
      d'origine vit sous `background.originFeat[0]`, hors de tout namespace,
      donc invisible à tout module. Il avait raison sur le besoin et il l'a
      signalé. Mais `feats` était le PREMIER d'une série : le chapitre 4 a
      exactement le même besoin pour la CLASSE (le pool vient d'elle) et pour
      l'ARRIÈRE-PLAN (les choix imposés viennent de lui), et on aurait ouvert
      `classes`, `backgrounds`… un champ par genre, à chaque lot.

      L'autre issue — faire déclarer le même don DEUX FOIS au personnage, une
      fois comme don et une fois dans le namespace du module — reste exclue :
      deux places pour un seul fait, et la dérive garantie.

      📌 Un `ref` mort JETTE ici, comme partout ailleurs dans le pli (`class`,
      `species`, `gear[n]`, les sorts passent déjà par `must`). Ce n'est pas ce
      canal qui invente cette règle, c'est lui qui cesse d'y échapper.

   ── ET CE QU'UN MODULE PEUT RÉCLAMER EN RETOUR ───────────────────────
   `consumed` : les chemins que le module a RÉELLEMENT lus hors de son
   namespace. Sans lui, un don qui compte dans une statistique ressortirait
   `unconsumed`, et `validate` dirait de lui « il ne change rien à la fiche »
   — un faux témoignage, pas une omission. Un module ne peut réclamer QUE ce
   que la dérivation lui a tendu : le garde est vérifié en le violant.

   ⚠️ UN DRAPEAU LEVÉ QUE PERSONNE NE SERT SE DÉCLARE. Une couche qui demande
   une capacité qu'aucun module ne fournit produirait sinon une fiche muette
   sur ce qui lui manque. */
function statOwnsPath(flag, path) {
  return path === flag || path.startsWith(`${flag}.`) || path.startsWith(`${flag}[`);
}

/** La vue d'une couche, APLATIE pour un module : il lit un record, il n'a pas
 *  à connaître la forme interne du bloc `layers`. C'est la même forme que le
 *  pli donne déjà à `input.species`. */
function flatView(view) {
  return { id: view.id, name: view.record.name, slug: view.record.slug, data: view.record.data || {} };
}

/** Les racines de choix qui FONT CHOISIR une compétence. L'arrière-plan n'y
 *  est pas : le contrat §3 lui donne `skill_ids` (il ACCORDE, il ne fait pas
 *  choisir), et fabriquer ici la branche d'un `granted_skill_choice`
 *  d'arrière-plan serait du code sans besoin (loi §0.6). */
const GRANT_ROOTS = ["species", "class"];

function fail(what) {
  throw new BuildError(`fhpc/build: ${what}`);
}

/* ⛔ `abilityModOf` A ÉTÉ PUBLIÉ PUIS RETIRÉ LE MÊME JOUR (lot 80), et c'est
   la loi §0.6 appliquée à sa propre nouveauté. Il servait le modificateur
   BRUT que le vivier des caractéristiques affichait sous chaque dé ; Eric a
   tranché contre (*« aucun intérêt de mettre les bonus sous chaque dé,
   seulement en bas dans le collecteur »*), et l'export s'est retrouvé sans un
   seul appelant.
   ⭐ Le seul modificateur qui compte à l'écran est celui d'un score POSÉ,
   donc DÉRIVÉ (boosts d'espèce et d'héritage compris) : il se lit dans
   `resolved.abilities[clef].mod`, jamais recalculé — la loi du lot 46, et
   `modOf` la sert déjà de l'intérieur. Publier un second chemin vers la même
   règle n'aurait servi qu'à les laisser diverger. */
function modOf(score) {
  return Math.floor((score - 10) / 2);
}

/* ── LE CARNET DES NON-DÉRIVÉS ───────────────────────────────────────
   Il n'accumule pas des chaînes libres : chaque entrée porte le CHAMP visé et
   une RAISON KEYÉE. Une liste de phrases sans champ obligerait à relire le
   code pour savoir quoi réparer — et une phrase nue, avant le lot 41, forçait
   le français jusque dans un personnage anglais (loi §0.13, lot 41).

   `declare(field, key, params)` pousse `{field, key, params}` — la même forme
   que `buildViolation` (lot 27), à ceci près que `field` reste le premier
   champ (invariant de ce carnet depuis le lot 9) et que `path` n'existe pas
   ici : `underived` n'accuse jamais un chemin de choix, il déclare un champ
   du document. Le `toString` non énumérable est lié à la table FRANÇAISE
   GÉNÉRIQUE de `src/labels.mjs` par défaut — jamais à celle d'un module FH,
   pour que `src/build/` ne compile contre aucun mot de couche (§0.12).

   ⚠️ LE QUATRIÈME ARGUMENT, ET POURQUOI IL EXISTE. Un module FH construit
   déjà ses propres entrées avec SON `toString` (lié à SA table, dans
   `src/modules/fh/labels.mjs`) — voir la boucle de recopie, plus bas
   (§ « STATISTIQUES DÉRIVÉES »). Sans ce paramètre, `declare()` les
   RECONSTRUIRAIT en écrasant leur `toString` par la table générique, qui ne
   connaît pas les clefs FH : `renderUnderived` jetterait « no label for » sur
   le premier personnage FH venu. `render` est donc TOUJOURS fourni par
   l'appelant qui sait d'où vient l'entrée ; ce fichier ne choisit une table
   par défaut que pour ses PROPRES déclarations. */
class Underived {
  constructor() { this.entries = []; }
  declare(field, key, params, render) {
    const rendu = typeof render === "function" ? render : (entry) => renderUnderived(entry, frUnderivedGeneric);
    this.entries.push(underivedEntry(field, key, params || {}, rendu));
    return undefined;
  }
  has(field) { return this.entries.some((entry) => entry.field === field); }
  list() {
    return this.entries.slice().sort((a, b) => (a.field < b.field ? -1 : a.field > b.field ? 1 : 0));
  }
}

/* ── L'INDEX DES CHOIX ───────────────────────────────────────────────
   Les choix arrivent en liste ordonnée ; la dérivation en a besoin par chemin
   ET par racine. L'ordre de la liste est CONSERVÉ dans les groupes : c'est lui
   qui ordonne les sorts d'un même niveau et les lignes d'équipement. */
function indexChoices(choices) {
  const byPath = new Map();
  const byRoot = new Map();
  const order = [];
  for (const choice of choices) {
    if (!choice || typeof choice !== "object") {
      fail("build.choices contient une entrée qui n'est pas un choix.");
    }
    const parsed = parseChoicePath(choice.path);
    const hasRef = choice.ref !== undefined;
    const hasValue = choice.value !== undefined;
    if (hasRef === hasValue) {
      fail(`le choix « ${choice.path} » porte ${hasRef ? "à la fois `ref` et `value`" : "ni `ref` ni `value`"} — ` +
        "le schéma en exige exactement un : un choix vide est un rejet, pas un défaut silencieux.");
    }
    if (byPath.has(choice.path)) {
      fail(`deux choix portent le chemin « ${choice.path} » — ambigu, aucun ne gagne par défaut.`);
    }
    const entry = { choice, parsed, consumed: false };
    byPath.set(choice.path, entry);
    if (!byRoot.has(parsed.root)) byRoot.set(parsed.root, []);
    byRoot.get(parsed.root).push(entry);
    order.push(entry);
  }
  return { byPath, byRoot, order };
}

/* ── LE LECTEUR DE COUCHES ───────────────────────────────────────────
   `query` est le SEUL chemin de lecture du contenu (contrat `layers`). Ces
   deux fonctions en sont les deux usages, et la différence entre elles est la
   différence entre « structurel » et « dégradable ». */
function makeReader(query) {
  return {
    /** Le record ou `null`. L'appelant déclare l'absence. */
    maybe(kind, id) {
      return query({ kind, id });
    },
    /** Le record, ou une erreur qui NOMME la couche disparue sous le
     *  personnage — un `null` avalé ici donnerait une fiche vide sans un mot. */
    must(kind, id, why) {
      const view = query({ kind, id });
      if (!view) {
        fail(`${why} : la pile ne porte aucun ${kind} « ${id} ». ` +
          "Le personnage a été construit avec une couche qui n'est pas montée, " +
          "ou avec un record qu'une couche plus haute a désactivé.");
      }
      return view;
    },
    all(kind) {
      return query({ kind });
    }
  };
}

/* ── LES COMPÉTENCES DE LA PILE ──────────────────────────────────────
   L'index et la liste des options légales vivent dans `skills.mjs`, partagés
   avec la projection publique. */
/**
 * Le pli.
 *
 * @param {object} input
 * @param {(payload:{kind:string,id?:string}) => any} input.query  le verbe `layers.query`, seul chemin de lecture
 * @param {Array}  input.stack     `build.layers`, recopié tel quel dans `resolved.derivation.stack`
 * @param {Array}  input.choices   `build.choices`
 * @param {string} input.at        l'horodatage de la dérivation
 * @param {object} [input.units]   les unités du document (`{distance}`)
 * @param {object} [input.previous] la tranche `resolved` précédente — l'état de jeu en est REPRIS
 * @param {string[]} [input.flags] les drapeaux de capacité que la pile lève (`layers.flags`)
 * @param {Array}  [input.modules] les modules de statistique injectés, `{flag, id, contribute}`
 * @returns {{resolved:object, underived:Array<{field:string,key:string,params:object}>, unconsumed:string[]}}
 */
export function derive({ query, stack, choices, at, units, previous, flags, modules }) {
  if (typeof query !== "function") fail("la dérivation a besoin du verbe `layers.query` — c'est son seul chemin de lecture.");
  const reader = makeReader(query);
  const underived = new Underived();
  const picked = indexChoices(Array.isArray(choices) ? choices : []);
  const before = (previous && typeof previous === "object") ? previous : {};

  const take = (path) => {
    const entry = picked.byPath.get(path);
    if (!entry) return undefined;
    entry.consumed = true;
    return entry.choice;
  };
  const takeValue = (path) => {
    const choice = take(path);
    return choice === undefined ? undefined : choice.value;
  };
  const takeRef = (path) => {
    const choice = take(path);
    return choice === undefined ? undefined : choice.ref;
  };

  /* ── STRUCTUREL : le niveau et la classe ────────────────────────── */

  const level = takeValue("level");
  if (!Number.isInteger(level) || level < 1 || level > 20) {
    fail("aucun choix `level` entier entre 1 et 20 — le niveau n'est dérivable de rien " +
      "(ni le bonus de maîtrise, ni les emplacements, ni les points de vie ne s'en passent). " +
      `Reçu : ${JSON.stringify(level)}.`);
  }

  const classRef = takeRef("class");
  if (!classRef) fail("aucun choix `class` — un personnage sans classe n'est pas une dérivation incomplète, c'est une dérivation impossible.");
  const classView = reader.must(classRef.kind, classRef.id, "le choix `class`");
  const classData = classView.record.data || {};

  const speciesRef = takeRef("species");
  const speciesView = speciesRef ? reader.must(speciesRef.kind, speciesRef.id, "le choix `species`") : null;
  const speciesData = speciesView ? (speciesView.record.data || {}) : {};

  const backgroundRef = takeRef("background");
  const backgroundView = backgroundRef ? reader.must(backgroundRef.kind, backgroundRef.id, "le choix `background`") : null;
  const backgroundData = backgroundView ? (backgroundView.record.data || {}) : {};

  /* ── LA PROGRESSION DE CLASSE ───────────────────────────────────────
     Le genre `class-progression` pointe SA classe (`data.class`) ; on cherche
     donc par ce lien, jamais par une convention de nommage d'identifiant. */
  let progression = null;
  for (const view of reader.all("class-progression")) {
    if (view.record.data && view.record.data.class === classView.id) { progression = view; break; }
  }
  const levelRow = progression && Array.isArray(progression.record.data.levels)
    ? progression.record.data.levels.find((row) => row && row.level === level) || null
    : null;

  /* ── IDENTITÉ ──────────────────────────────────────────────────────
     Les mots viennent des records. Le LIGNAGE n'est PAS recollé au nom de
     l'espèce : composer « Elfe (haut-elfe) » serait fabriquer une chaîne
     affichable dans le moteur (loi §0.13), et le lignage est un choix, pas un
     record. Il est déclaré. */
  const identity = { level, classes: [{ name: classView.record.name, level }] };
  if (speciesView) {
    identity.species = speciesView.record.name;
    if (picked.byPath.has("species.lineage")) {
      underived.declare("identity.species (lignage)", "underived.lineage-not-composed", {});
    }
    const sizeKey = speciesData.size_key;
    if (typeof sizeKey === "string") identity.size = sizeKey;
    else underived.declare("identity.size", "underived.species-missing-size-key", {});
  } else {
    underived.declare("identity.species", "underived.no-choice", { root: "species" });
    underived.declare("identity.size", "underived.no-choice", { root: "species" });
  }
  if (backgroundView) identity.background = backgroundView.record.name;
  else underived.declare("identity.background", "underived.no-choice", { root: "background" });

  /* ── CARACTÉRISTIQUES ──────────────────────────────────────────────
     Les scores de base sont des choix ; les augmentations d'arrière-plan sont
     des choix aussi (2024 : c'est le joueur qui répartit +2/+1). La règle qui
     dit LESQUELLES sont légales vit dans `background.ability_keys` et elle est
     vérifiée par `validate`, pas ici : dériver et juger sont deux gestes. */
  const scores = {};
  const missingScores = [];
  for (const key of ABILITY_KEYS) {
    const value = takeValue(`abilities.${key}`);
    if (!Number.isInteger(value)) missingScores.push(`abilities.${key}`);
    else scores[key] = value;
  }
  if (missingScores.length > 0) {
    fail(`les six scores de caractéristique sont des CHOIX, et ceux-ci manquent : ${missingScores.join(", ")}. ` +
      "Un score ne se dérive de rien — il n'y a pas de valeur par défaut à lui donner.");
  }
  for (const entry of picked.order) {
    const segments = entry.parsed.segments;
    if (segments.length !== 3 || segments[1].value !== "boost") continue;
    const key = segments[2].value;
    if (!ABILITY_SET.has(key)) continue;
    if (!Number.isInteger(entry.choice.value)) {
      fail(`le choix « ${entry.choice.path} » n'est pas un entier — une augmentation de caractéristique est un nombre.`);
    }
    entry.consumed = true;
    scores[key] += entry.choice.value;
  }
  const abilities = {};
  for (const key of ABILITY_KEYS) abilities[key] = { score: scores[key], mod: modOf(scores[key]) };

  /* ── BONUS DE MAÎTRISE ─────────────────────────────────────────────
     `class-progression` le porte en nombre depuis le lot 6. Absent : c'est un
     NOMBRE, donc il est absent de `resolved` — pas un +2 consolant. */
  const resolved = { derivation: { at, stack: structuredClone(stack) }, identity, abilities };
  let proficiency = null;
  if (levelRow && Number.isInteger(levelRow.proficiency_bonus)) {
    proficiency = levelRow.proficiency_bonus;
    resolved.proficiency = proficiency;
  } else {
    underived.declare("proficiency", ...(progression
      ? ["underived.progression-field-missing-at-level", { classId: classView.id, field: "proficiency_bonus", level }]
      : ["underived.no-progression-record", { classId: classView.id }]));
  }

  /* ── CLASSE D'ARMURE ───────────────────────────────────────────────
     Calculée APRÈS l'équipement (une armure portée change tout), mais posée
     ici dans l'ordre du schéma. Le calcul est plus bas. */

  /* ── ÉQUIPEMENT ET BOURSE ──────────────────────────────────────────
     Décision d'architecte (contrat §6) : l'équipement de départ NE SE DÉRIVE
     PAS au M2 — la source le donne en phrases (« Choisissez A ou B : … »).
     `resolved.gear` et `resolved.currency` sont nourris par des choix qui
     nomment directement des records et des montants. */
  const gear = [];
  const armorPieces = [];
  const gearChoices = (picked.byRoot.get("gear") || [])
    .filter((entry) => entry.parsed.segments.length === 2 && entry.parsed.segments[1].kind === "index");
  for (const entry of gearChoices) {
    const index = entry.parsed.segments[1].value;
    entry.consumed = true;
    const ref = entry.choice.ref;
    if (!ref) {
      underived.declare(`gear[${index}]`, "underived.choice-not-ref", { path: entry.choice.path });
      continue;
    }
    const view = reader.must(ref.kind, ref.id, `le choix « ${entry.choice.path} »`);
    const quantity = takeValue(`gear[${index}].quantity`);
    const equipped = takeValue(`gear[${index}].equipped`);
    const missing = [];
    if (!Number.isInteger(quantity)) missing.push(`gear[${index}].quantity`);
    if (typeof equipped !== "boolean") missing.push(`gear[${index}].equipped`);
    if (missing.length > 0) {
      underived.declare(`gear[${view.record.slug || ref.id}]`, "underived.gear-line-incomplete", { missing: missing.join(" et ") });
      continue;
    }
    gear.push({ id: view.record.slug || ref.id, name: view.record.name, quantity, equipped });
    if (ref.kind === "armor" && equipped) armorPieces.push(view);
  }
  if (gear.length === 0) {
    underived.declare("gear", "underived.no-gear-choices", {});
  } else {
    underived.declare("gear[].weight", "underived.weight-is-phrase", {});
  }

  const currency = {};
  const missingCurrency = [];
  for (const key of CURRENCY_KEYS) {
    const value = takeValue(`currency.${key}`);
    if (Number.isInteger(value)) currency[key] = value;
    else missingCurrency.push(`currency.${key}`);
  }
  if (missingCurrency.length === 0) resolved.currency = currency;
  else {
    underived.declare("currency", "underived.currency-incomplete", { missing: missingCurrency.join(", ") });
  }

  /* ── POINTS DE VIE ─────────────────────────────────────────────────
     Niveau 1 : dé de vie + modificateur de Constitution. Au-delà, la règle
     d'accroissement n'est portée par AUCUN champ mécanique du contrat, et
     l'inventer donnerait une fiche silencieusement fausse. */
  const hitDie = classData.hit_die;
  const vitals = {};
  if (!Number.isInteger(hitDie)) {
    underived.declare("vitals.hpMax", "underived.class-missing-hit-die", {});
  } else if (level > 1) {
    underived.declare("vitals.hpMax", "underived.hp-progression-unsupported", { level });
  } else {
    vitals.hpMax = hitDie + abilities.con.mod;
  }
  /* L'ÉTAT DE JEU N'EST PAS RECALCULÉ : une reconstruction ne soigne personne. */
  const beforeVitals = (before.vitals && typeof before.vitals === "object") ? before.vitals : {};
  vitals.hpCurrent = Number.isInteger(beforeVitals.hpCurrent) ? beforeVitals.hpCurrent
    : (Number.isInteger(vitals.hpMax) ? vitals.hpMax : 0);
  vitals.tempHp = Number.isInteger(beforeVitals.tempHp) ? beforeVitals.tempHp : 0;
  vitals.conditions = Array.isArray(beforeVitals.conditions) ? beforeVitals.conditions.slice() : [];
  resolved.vitals = vitals;

  /* ── VITESSES ──────────────────────────────────────────────────────
     La couche FR porte les mètres, la couche EN les pieds (contrat §3). Le
     document dit dans quelle unité il vit (`units.distance`) : la dérivation
     LIT ce réglage, elle ne le devine pas et ne nomme aucune langue. */
  const distanceUnit = (units && units.distance) || null;
  const speedField = distanceUnit === "m" ? "speed_m" : distanceUnit === "ft" ? "speed_ft" : null;
  /* 🔴 LA RUBRIQUE EST PUBLIÉE MÊME VIDE — corrigé le 2026-08-20, et c'est la
     LOI 2 DE CE FICHIER appliquée à elle-même : *« une collection que la pile
     ne sait pas nourrir est VIDE — et la déclaration est OBLIGATOIRE »*, parce
     que `fh-char/1` exige les 21 rubriques de `resolved`.

     📏 CE QUE L'OMISSION COÛTAIT, MESURÉ DANS LA PAGE : `I changed my mind` sur
     Species laisse un personnage SANS ESPÈCE — état légitime d'une création en
     cours. `speeds` disparaissait alors du document, qui cessait de valider ; le
     `revoke` du geste SUIVANT (`assertValid`, bloc `doc`) refusait, jetait, et
     la coquille se figeait sans un mot. Le premier `I changed my mind`
     réussissait, le second mourait — c'est exactement ce qu'Eric a vu.

     ⛔ ET SURTOUT PAS `{ walk: 0 }` : ce serait le « zéro consolant » que la
     loi 1 refuse — une fiche annoncerait une vitesse de 0 pied au lieu de dire
     qu'elle n'en connaît aucune. L'objet VIDE ne console personne, et la
     déclaration `underived` juste à côté nomme le manque.
     ⚠️ `speeds.walk` a donc cessé d'être exigé par le schéma. Sa raison y est
     écrite, en toutes lettres, à côté de la propriété. */
  resolved.speeds = {};
  if (!speciesView) {
    underived.declare("speeds", "underived.no-choice", { root: "species" });
  } else if (!speedField) {
    underived.declare("speeds", "underived.no-distance-unit", { distanceUnit: JSON.stringify(distanceUnit) });
  } else if (!Number.isInteger(speciesData[speedField])) {
    underived.declare("speeds", "underived.species-missing-speed-field", { speedField });
  } else {
    resolved.speeds = { walk: speciesData[speedField] };
  }

  /* ── SENS ──────────────────────────────────────────────────────────
     REWRITTEN 2026-08-08 (fusion du lot 8) — les sens SONT dérivés maintenant.
     La première passe rendait une liste vide, à raison : la forme du contrat
     §5 était `{id, range_m}` SANS `name`, que le schéma exige. La
     sous-question a été retenue, `senses[].name` est entré au contrat, et le
     lot 8 livre `{id, name, range_m}` sur 6 espèces / 9. Le moteur recopie ce
     nom, il ne le fabrique pas.

     La PORTÉE suit la même règle que la vitesse : la couche porte `range_m` ou
     `range_ft`, le document dit dans quelle unité il vit, et la dérivation LIT
     ce réglage au lieu de le deviner. */
  const senses = [];
  const rangeField = distanceUnit === "m" ? "range_m" : distanceUnit === "ft" ? "range_ft" : null;
  if (speciesView && Array.isArray(speciesData.senses) && rangeField) {
    for (const sense of speciesData.senses) {
      if (!sense || typeof sense.id !== "string" || typeof sense.name !== "string") {
        underived.declare("senses (espèce)", "underived.senses-entry-invalid", {});
        continue;
      }
      if (!Number.isInteger(sense[rangeField])) {
        underived.declare(`senses[${sense.id}]`, "underived.senses-missing-range-field", { rangeField });
        continue;
      }
      senses.push({ id: sense.id, name: sense.name, value: sense[rangeField], unit: distanceUnit });
    }
  } else if (speciesView && speciesData.senses !== undefined && !rangeField) {
    underived.declare("senses", "underived.no-distance-unit-short", { distanceUnit: JSON.stringify(distanceUnit) });
  }
  resolved.senses = senses;
  if (senses.length === 0 && !underived.has("senses")) {
    underived.declare(...(speciesView
      ? ["senses", "underived.species-no-senses", {}]
      : ["senses", "underived.no-choice", { root: "species" }]));
  }
  /* La PERCEPTION PASSIVE est calculable (10 + bonus de Perception) mais elle
     n'a de nom dans AUCUN record : ce n'est pas un sens d'espèce, c'est une
     ligne de fiche. La nommer ici violerait la loi §0.13. */
  underived.declare("senses[perception-passive]", "underived.passive-perception-unnamed", {});

  /* ── LANGUES ───────────────────────────────────────────────────────
     🔴 UN REFUS QUI AVAIT VIEILLI, RETIRÉ LE 2026-08-20. Il disait : « il
     n'existe pas de genre `language` parmi les 14 ; un slug de langue ne se
     résout nulle part ». C'était VRAI le jour où il a été écrit, et faux depuis
     le lot 36 : le genre `training` est arrivé (genre 16) et il porte douze
     records de `category: "language"`.

     ⚠️ ET RIEN NE POUVAIT LE SIGNALER. Un refus déclaré est un comportement
     LÉGITIME : la fiche disait « pas de langues » avec assurance, aucune suite
     ne rougissait, et la règle du livre — deux langues offertes par l'Héritage —
     était inapplicable sans que personne le voie. Une absence n'est jamais une
     réponse ; un refus daté non plus.

     ⭐ CE QUI SE LIT MAINTENANT : les langues sont des trainings acquis, et
     elles arrivent par le même chemin que les autres — le module du pool les
     publie dans `resolved.traits[]` avec `category: "training"`. Ce sont donc
     les mêmes records, lus deux fois pour deux rubriques : la liste des langues
     ici, l'acquis là-bas.
     ⛔ ET ON NE FABRIQUE AUCUN NOM : c'est le `name` du record, recopié. */
  /* ⚠️ ET LA FORME EST CELLE DU SCHÉMA, LUE AVANT D'ÉCRIRE : `{id, name}`, pas
     une chaîne. Mon premier jet publiait des noms nus et `validate` l'a refusé
     — « languages/0 must be object ». Une septième fois la même leçon : j'ai
     supposé la forme d'un champ que je n'avais jamais rempli.
     📌 `id` EST UN SLUG (`$defs/slug`), pas l'identifiant complet du record :
     c'est `language-elf`, pas `fh:training:en:language-elf`. */
  const langueDeTraining = (id) => {
    const view = reader.maybe("training", id);
    const data = view && view.record.data;
    if (!data || data.category !== "language") return null;
    return { id: view.record.slug || String(view.id).split(":").pop(), name: view.record.name };
  };
  const languesChoisies = picked.order
    .filter((entry) => entry.choice.ref && entry.choice.ref.kind === "training" &&
      typeof entry.choice.path === "string" && entry.choice.path.startsWith("background.languages["))
    .map((entry) => {
      const langue = langueDeTraining(entry.choice.ref.id);
      if (langue) entry.consumed = true;
      return langue;
    })
    .filter(Boolean);
  resolved.languages = languesChoisies;
  /* ⛔ ET LE REFUS RESTE, MAIS SUR SON VRAI MOTIF : un personnage sans langue
     n'en a pas parce qu'il n'en a pas choisi, pas parce que la pile serait
     incapable d'en résoudre une. Le distinguer est tout l'intérêt. */
  if (languesChoisies.length === 0) {
    underived.declare("languages", "underived.no-language-chosen", {});
  }

  /* ── JETS DE SAUVEGARDE ────────────────────────────────────────────
     `saving_throw_keys` est un jeu FERMÉ de deux clefs (contrat §3, 12/12).
     Absent, on n'émet pas six sauvegardes non maîtrisées : ce serait une
     fiche fausse et jouable, le pire des deux. */
  const saveKeys = classData.saving_throw_keys;
  if (Array.isArray(saveKeys)) {
    for (const key of saveKeys) assertAbilityKey(key, classView.id, "data.saving_throw_keys[]");
  }
  if (Array.isArray(saveKeys) && saveKeys.every((key) => ABILITY_SET.has(key))) {
    if (proficiency === null) {
      underived.declare("saves", "underived.proficiency-not-derived-saves", {});
    } else {
      const saves = {};
      const proficientSaves = new Set(saveKeys);
      for (const key of ABILITY_KEYS) {
        const isProficient = proficientSaves.has(key);
        saves[key] = { bonus: abilities[key].mod + (isProficient ? proficiency : 0), proficient: isProficient };
      }
      resolved.saves = saves;
    }
  } else {
    underived.declare("saves", "underived.class-missing-saving-throw-keys", {});
  }

  /* ── COMPÉTENCES ───────────────────────────────────────────────────
     Les DIX-HUIT (vingt-six en Fate's Hand), chacune avec son bonus,
     maîtrisée ou non. Les maîtrises viennent de trois sources : l'arrière-
     plan les ACCORDE (`skill_ids`), la classe et l'espèce en font CHOISIR
     (`skill_choice`, `granted_skill_choice`).

     ⚠️ LOT 34 : CE BLOC RESTE SRD-GÉNÉRIQUE (loi §0.12 — deux gardes
     littéraux, mot par mot, le vérifient : `tests/build-block.test.mjs` ET
     `tests/fh-skill-pool.test.mjs`, qui interdit même le VOCABULAIRE d'une
     mécanique de couche dans `src/build/`, en commentaire compris). Ce bloc
     rend « maîtrisé plein » pour tout imposé, exactement comme avant ce lot
     — aucun champ de couche propre à une classe n'est lu ici, aucun mot qui
     le nommerait n'est écrit ici. Une grille de paliers plus fine EST une
     MÉCANIQUE (décision Q4) : elle vit dans un module à part, activé par un
     drapeau, et elle CORRIGE `resolved.skills[]` après coup, plus bas
     (§ « STATISTIQUES DÉRIVÉES »), via le canal générique `outcome.skillTiers`
     que tout module peut rendre — la même discipline que
     `outcome.stat`/`outcome.underived`/`outcome.consumed`. Un personnage dont
     la pile ne lève aucun drapeau (SRD pur) ne voit donc STRICTEMENT RIEN
     bouger ici. */
  const skills = indexSkills(reader.all("skill"), underived);
  const proficientSkills = new Map(); // slug → la racine qui l'accorde

  const grantSlugs = (recordIds, sourceRoot) => {
    for (const recordId of recordIds) {
      const entry = skills.byId.get(recordId);
      if (!entry) {
        underived.declare(`skills[${recordId}]`, "underived.background-grants-unknown-skill", { recordId });
        continue;
      }
      proficientSkills.set(entry.id, sourceRoot);
    }
  };
  if (Array.isArray(backgroundData.skill_ids)) grantSlugs(backgroundData.skill_ids, "background");
  else if (backgroundView) {
    underived.declare("skills (arrière-plan)", "underived.background-missing-skill-ids", {});
  }

  /* Les choix. ⚠️ RÈGLE DE CE LOT, à ratifier (question 2) : un choix est un
     choix de compétence quand sa RACINE est celle d'une source qui en déclare
     un ET que sa valeur est un slug LÉGAL de la liste `from`. On ne se fie pas
     au dernier segment du chemin : le personnage d'exemple répond au choix
     d'espèce sous `species.keenSenses`, un chemin propre à l'Elfe, tandis que
     la classe répond sous `class.skills[0]`. Une source qui déclare
     `{count, from}` sait déjà ce qui est légal — c'est elle qu'on écoute, pas
     la forme du chemin.

     ⚠️ LOT 34 : `granted_skill_choice` D'ESPÈCE NE PORTE PLUS KEEN SENSES —
     seuls l'Araag et l'Humain (Skillful, `{count, from:"any"}`, un choix
     plein et non restreint par palier) le portent encore. L'Elfe et
     l'Elestu (Keen Senses) portent `granted_skill_budget` désormais, traité
     plus bas, séparément — un budget CAPTIF n'est pas un choix compté. */
  const declarations = {
    species: { data: speciesData.granted_skill_choice, view: speciesView, key: "granted_skill_choice" },
    class: { data: classData.skill_choice, view: classView, key: "skill_choice" }
  };
  const chosenBy = {};
  for (const root of GRANT_ROOTS) {
    const declaration = declarations[root];
    const allowed = allowedSlugs(declaration.data, skills);
    if (allowed === null) {
      if (declaration.view && declaration.data !== undefined) {
        underived.declare(`skills (${root})`, "underived.skill-declaration-unreadable",
          { recordId: declaration.view.id, field: declaration.key });
      }
      chosenBy[root] = [];
      continue;
    }
    const answers = [];
    for (const entry of picked.byRoot.get(root) || []) {
      const value = entry.choice.value;
      if (typeof value !== "string" || !allowed.has(value)) continue;
      entry.consumed = true;
      answers.push(value);
      proficientSkills.set(value, root);
    }
    chosenBy[root] = answers;
  }

  /* Les imposés, GÉNÉRIQUEMENT (aucun mot de FH) : la liste plate des slugs
     que ce bloc vient de placer, tous root confondus. C'est l'unique donnée
     qu'un module a besoin de recevoir pour savoir OÙ poser un plancher — la
     RÈGLE du plancher (demi-compétence, montable) reste de son ressort. */
  const imposedSkillSlugs = [...proficientSkills.keys()];

  /* ── LE BUDGET CAPTIF D'ESPÈCE (Keen Senses, lot 34) ─────────────────
     `granted_skill_budget = {points, from}` — des points CAPTIFS d'une
     liste, dépensés par le joueur sur `species.skillBudget.<slug>` =
     "novice"|"adept". Ce champ, comme `granted_skill_choice`, est du
     CONTENU générique (aucune racine de son nom ne cite une mécanique de
     couche) : le lire ici est la même discipline que la ligne juste
     au-dessus. Ne touche JAMAIS `fh:skill-points` (contrat §4e : « un choix
     accordé par l'espèce est supplémentaire ») — ce bloc ne lui ajoute ni ne
     lui retire une ligne, et le pool de classe est identique avec ou sans ce
     budget dépensé.

     Un choix illégal (compétence hors liste, palier hors {half,
     proficient}, budget dépassé) est IGNORÉ ici — même discipline que la
     boucle juste au-dessus pour un choix de classe hors catalogue : ce bloc
     ne dérive jamais une intention illégale, il la laisse `unconsumed`.
     `decisions.mjs` la NOMME en verrou keyé (lot 27), il ne jette pas pour
     un choix de joueur. */
  /* 🔴 `expert` ENTRE DANS LA TABLE — la table n'en connaissait que deux, et
     c'est le canon qui en publie trois (novice 1 · adept 2 · expert 4). Le
     Rogue place un EXPERT dans ses points liés : sans le palier, son placement
     était illégal et silencieusement ignoré. ⛔ Cette table-ci ne dit que les
     paliers LÉGAUX — ce que chacun COÛTE appartient à la couche, et ce fichier
     n'a pas à le savoir. */
  const TIER_COST = { novice: 1, adept: 2, expert: 4 };
  const budgetTier = new Map(); // slug → "novice"|"adept"|"expert"

  /* ══ LE BUDGET CAPTIF DE CLASSE — 2026-08-20 ═══════════════════════════════
     🔴 CE QUE ÇA RÉPARE, ET C'ÉTAIT UN FAUX MAGASIN. Eric : *« pourquoi le
     rogue a toujours 4 skills à placer ? »*. Mesuré : le choix `class.skills[n]`
     ne coûtait RIEN au pool et n'accordait RIEN — la compétence choisie
     ressortait `proficiency: "none"`. L'écran demandait quatre décisions que le
     moteur ignorait.

     ⭐ LA CAUSE : la couche FH n'a jamais éteint le système SRD des classes. Elle
     a AJOUTÉ le pool (canon §B.1) à côté de `skill_choice`, alors qu'il le
     REMPLACE — et pour l'arrière-plan, le lot 35 avait bien éteint l'ancien.
     Les classes sont restées avec deux systèmes côte à côte, dont un mort.

     ⭐ ET LA MÉCANIQUE EXISTAIT DÉJÀ, SOUS UN AUTRE NOM : le budget captif
     d'espèce (Keen Senses) est *« du BOUND sous son nom de moteur »* — le module
     `skill-pool.mjs` l'écrit en toutes lettres. On ne construit donc rien de
     neuf : on tend au même organe la paire de la classe.

     ⛔ ET AUCUN CONTENU N'EST AJOUTÉ NULLE PART. Les deux moitiés existent déjà
     sur le record : les POINTS que la couche déclare (canon §B.1), la LISTE
     dans `skill_choice.from` — qui EST « votre liste de classe »,
     celle que le canon nomme (*« only inside your class list »*). Recopier l'une
     ou l'autre aurait fait une seconde vérité à tenir d'accord ; c'est ce que la
     nuit vient justement de retirer de la couche des fiches.

     ⛔ ET LE NOM DU CHAMP EST GÉNÉRIQUE, PARCE QU'UN GARDE L'EXIGE. La loi
     §0.12 interdit à `src/build/` de citer une mécanique de la couche maison —
     j'ai d'abord nommé ici son champ de pool, et le garde a mordu dans la
     minute, **jusque dans le commentaire**. Il a raison deux fois : ce bloc ne
     doit pas savoir que cette couche existe, et une prose qui la nomme apprend
     son vocabulaire au lecteur suivant. Le budget se
     déclare donc sous le MÊME nom que celui de l'espèce, `granted_skill_budget`,
     dont l'en-tête du module dit déjà qu'il est « du bound sous son nom de
     moteur ».
     ⭐ ET SA LISTE N'EST PAS RECOPIÉE : un budget captif de CLASSE est, par
     définition, captif de la liste de la classe — `skill_choice.from`, un champ
     SRD que ce fichier lit déjà. Une couche qui voudrait une autre liste passe
     son propre `from` ; sans ça, la liste est celle du record.
     📌 ET UN PERSONNAGE SRD PUR NE BOUGE PAS D'UN POUCE (loi §0.12) : sans
     couche qui déclare le budget, il n'y en a pas, et `skill_choice` garde son
     ancien rôle. C'est la COUCHE qui remplace, jamais le moteur qui décide. */
  const declarationClasse = classData.granted_skill_budget;
  const budgetDeClasse = declarationClasse && typeof declarationClasse === "object" &&
    !Array.isArray(declarationClasse) && Number.isInteger(declarationClasse.points) &&
    declarationClasse.points > 0
    ? {
      points: declarationClasse.points,
      from: declarationClasse.from !== undefined ? declarationClasse.from
        : (classData.skill_choice && classData.skill_choice.from)
    }
    : null;
  if (budgetDeClasse) {
    const allowedClasse = allowedSlugs(budgetDeClasse, skills);
    if (allowedClasse !== null) {
      const prefixeClasse = "class.skillBudget.";
      for (const entry of picked.byRoot.get("class") || []) {
        const path = entry.choice.path;
        if (typeof path !== "string" || !path.startsWith(prefixeClasse)) continue;
        const slug = path.slice(prefixeClasse.length);
        const value = entry.choice.value;
        if (!allowedClasse.has(slug) || !Object.hasOwn(TIER_COST, value)) continue; // decisions.mjs le NOMME
        entry.consumed = true;
        budgetTier.set(slug, value);
      }
    }
  }

  const budget = speciesData.granted_skill_budget;
  if (budget !== undefined) {
    if (budget === null || typeof budget !== "object" || Array.isArray(budget) ||
      !Number.isInteger(budget.points) || budget.points <= 0) {
      fail(`the species record "${speciesView.id}" carries \`data.granted_skill_budget\` = ` +
        `${JSON.stringify(budget)}, which is not a \`{points, from}\` table with a positive whole number of ` +
        "points — a captive budget the engine cannot count would place a floor it cannot justify.");
    }
    const allowedBudget = allowedSlugs(budget, skills);
    if (allowedBudget === null) {
      fail(`the species record "${speciesView.id}" carries \`data.granted_skill_budget.from\` = ` +
        `${JSON.stringify(budget.from)}, which is not a list of skill ids (or "any") — a captive budget with no ` +
        "legal list would let the player spend its points anywhere, erasing the restriction the grant exists to carry.");
    }
    const budgetPrefix = "species.skillBudget.";
    for (const entry of picked.byRoot.get("species") || []) {
      const path = entry.choice.path;
      if (typeof path !== "string" || !path.startsWith(budgetPrefix)) continue;
      const slug = path.slice(budgetPrefix.length);
      const value = entry.choice.value;
      if (!allowedBudget.has(slug) || !Object.hasOwn(TIER_COST, value)) continue; // decisions.mjs le NOMME
      entry.consumed = true;
      budgetTier.set(slug, value);
    }
  }

  if (skills.list.length === 0) {
    underived.declare("skills", "underived.no-usable-skills", {});
    resolved.skills = [];
  } else if (proficiency === null) {
    underived.declare("skills", "underived.proficiency-not-derived-skills", {});
    resolved.skills = [];
  } else {
    /* `half` n'existe QUE par le budget captif à ce stade (aucun palier SRD
       n'en produit, et `budgetTier` ne rend jamais que « half » ou
       « proficient » — sa légalité est vérifiée plus haut). La formule est
       générique au schéma (`resolved.skills[].proficiency`), pas une règle
       de maison. */
    const skillTierBonus = (tier) => {
      if (tier === "novice") return Math.floor(proficiency / 2);
      if (tier === "adept") return proficiency;
      /* ⭐ `expert` DOUBLE, et c'est le canon §A.1 : *« Expert · 4 pts · double
         your proficiency bonus »*. Il n'existait pas ici parce qu'aucun palier
         SRD n'en produit — le budget captif de classe en produit un. */
      if (tier === "expert") return proficiency * 2;
      return 0;
    };
    resolved.skills = skills.list.map((entry) => {
      const tier = budgetTier.get(entry.id) || (proficientSkills.has(entry.id) ? "adept" : "none");
      return {
        id: entry.id,
        name: entry.name,
        ability: entry.ability,
        bonus: abilities[entry.ability].mod + skillTierBonus(tier),
        proficiency: tier
      };
    });
  }

  /* ── OUTILS ────────────────────────────────────────────────────────
     L'arrière-plan accorde un outil (`tool_id`) ou en fait choisir un
     (`tool_choice`) — c'est l'arbitrage B2 du contrat, et un choix n'est pas
     une maîtrise accordée. */
  const tools = [];
  const toolViews = [];
  if (backgroundView) {
    if (typeof backgroundData.tool_id === "string") {
      toolViews.push(reader.must("tool", backgroundData.tool_id, "l'arrière-plan `tool_id`"));
    } else if (backgroundData.tool_choice !== undefined) {
      const answer = (picked.byRoot.get("background") || [])
        .find((entry) => entry.choice.ref && entry.choice.ref.kind === "tool");
      if (answer) {
        answer.consumed = true;
        toolViews.push(reader.must("tool", answer.choice.ref.id, `le choix « ${answer.choice.path} »`));
      } else {
        underived.declare("tools", "underived.background-tool-choice-unanswered", {});
      }
    } else {
      underived.declare("tools", "underived.background-missing-tool-field", {});
    }
  }
  for (const view of toolViews) {
    const abilityKey = view.record.data && view.record.data.ability_key;
    if (!assertAbilityKey(abilityKey, view.id, "data.ability_key")) {
      underived.declare(`tools[${view.record.slug || view.id}]`, "underived.tool-missing-ability-key", {});
      continue;
    }
    if (proficiency === null) {
      underived.declare(`tools[${view.record.slug || view.id}]`, "underived.proficiency-not-derived-tools", {});
      continue;
    }
    tools.push({
      id: view.record.slug || view.id,
      name: view.record.name,
      ability: abilityKey,
      bonus: abilities[abilityKey].mod + proficiency,
      proficiency: "adept"
    });
  }
  /* LOT 35 — LA DÉCLARATION « AUCUN OUTIL » EST DIFFÉRÉE, PLUS BAS. `tools`
     ne porte ici que les outils POSSÉDÉS (l'arrière-plan) ; le pool de points
     peut encore lui en AJOUTER un (§ « STATISTIQUES DÉRIVÉES », le même canal
     générique `outcome.skillTiers` que les compétences). Déclarer maintenant
     dirait « aucune maîtrise » sur une collection pas encore finale — même
     tableau, RÉFÉRENCE PARTAGÉE avec `resolved.tools`, pour que l'ajout d'un
     outil acheté plus tard s'y voie sans réassignation. */
  resolved.tools = tools;

  /* ── ACTIONS ───────────────────────────────────────────────────────
     Il n'existe pas de genre `action`. Composer une attaque à partir d'une
     arme (dé de dégâts + caractéristique + propriétés Finesse/Lancer) est une
     RÈGLE, et le contrat n'en porte aucune : `weapon.properties` est une
     phrase (« Finesse, Lancer (portée 6/18), Légère »). Quant à Esquive et à
     l'Attaque d'opportunité, leur texte ne vit que dans le glossaire, en
     prose. */
  resolved.actions = [];
  underived.declare("actions", "underived.no-action-genre", {});

  /* ── INCANTATION ───────────────────────────────────────────────────
     `dc` = 8 + maîtrise + modificateur ; `attackBonus` = maîtrise +
     modificateur. Ces deux-là sont des règles du SRD, universelles, et elles
     ne nomment aucune classe : elles ont leur place ici. La CARACTÉRISTIQUE,
     elle, est une donnée de la classe. */
  const spellRefs = picked.order.filter((entry) => entry.choice.ref && entry.choice.ref.kind === "spell");
  const castingKey = classData.spellcasting_ability_key;
  const slotRow = levelRow && Array.isArray(levelRow.spell_slots) ? levelRow.spell_slots : null;
  const beforeSlots = (before.spellcasting && before.spellcasting.slots) || {};

  if (!assertAbilityKey(castingKey, classView.id, "data.spellcasting_ability_key")) {
    if (spellRefs.length > 0 || (slotRow && slotRow.some((count) => count > 0))) {
      underived.declare("spellcasting", "underived.class-missing-spellcasting-key", {});
    } else {
      resolved.spellcasting = null; // Dérivé, pas consolant : ni sort choisi, ni emplacement.
    }
  } else if (proficiency === null) {
    underived.declare("spellcasting", "underived.proficiency-not-derived-spellcasting", {});
  } else {
    const mod = abilities[castingKey].mod;
    const slots = {};
    if (slotRow) {
      slotRow.forEach((count, index) => {
        if (!Number.isInteger(count) || count <= 0) return;
        const key = String(index + 1);
        const kept = beforeSlots[key];
        slots[key] = { max: count, current: (kept && Number.isInteger(kept.current)) ? kept.current : count };
      });
    } else {
      underived.declare("spellcasting.slots", "underived.progression-missing-spell-slots", { classId: classView.id });
    }
    const spells = [];
    const spellsSansConcentration = [];
    const spellsSansCastType = [];
    for (const entry of spellRefs) {
      entry.consumed = true;
      const view = reader.must("spell", entry.choice.ref.id, `le choix « ${entry.choice.path} »`);
      const data = view.record.data || {};
      const slug = view.record.slug;
      if (typeof slug !== "string" || !Number.isInteger(data.level)) {
        underived.declare(`spellcasting.spells[${view.id}]`, "underived.spell-record-invalid", {});
        continue;
      }
      const spell = { id: slug, name: view.record.name, level: data.level, prepared: true };
      /* REWRITTEN 2026-08-08 (fusion du lot 8) — `castType` ne fait PLUS sauter
         l'entrée. Le lot 8 a refusé le champ avec sa mesure, et l'architecte
         lui a donné raison contre son propre schéma : cinq constructions
         ressemblent à une sauvegarde et une seule est le fait, *Couteau de
         glace* est génuinement attaque ET sauvegarde, et l'énumération ne sait
         pas le dire. `castType` est donc devenu FACULTATIF — le mode de
         résolution se DÉCLARE inconnu. Une fiche de magicien sans aucun sort
         serait plus fausse qu'une fiche dont on dit ne pas connaître le mode. */
      if (typeof data.cast_type === "string") spell.castType = data.cast_type;
      else spellsSansCastType.push(slug);
      if (typeof data.range === "string") spell.range = data.range;
      if (typeof data.casting_time === "string") spell.castingTime = data.casting_time;
      if (typeof data.duration === "string") spell.duration = data.duration;
      if (typeof data.ritual === "boolean") spell.ritual = data.ritual;
      /* LE TEXTE DU SORT vient de `description`, tel quel. Il était laissé
         tomber par la première passe de ce lot SANS AUCUNE RAISON DE DONNÉES —
         défaut trouvé par l'architecte au comparateur intégral, là où mes
         assertions ne regardaient que cinq champs sur douze. Mesuré avant de
         le porter : les 339 sorts de la pile en ont une, la plus longue fait
         3 967 caractères, et `resolved.spellcasting.spells[].text` en accepte
         4 000. Un texte plus long ne serait pas TRONQUÉ — tronquer un texte de
         règle est un mensonge silencieux : il est sauté et déclaré. */
      if (typeof data.description === "string") {
        if (data.description.length > SPELL_TEXT_MAX) {
          underived.declare(`spellcasting.spells[${slug}].text`, "underived.spell-text-too-long",
            { length: data.description.length, max: SPELL_TEXT_MAX });
        } else {
          spell.text = data.description;
        }
      } else {
        underived.declare(`spellcasting.spells[${slug}].text`, "underived.spell-missing-description", {});
      }
      /* `concentration` est un BOOLÉEN de la couche, commandé au lot 8. La
         dérivation ne le déduit PAS de `duration` : « Concentration, jusqu'à
         10 minutes » est une phrase, et la lire serait un parseur de prose. */
      if (typeof data.concentration === "boolean") spell.concentration = data.concentration;
      else spellsSansConcentration.push(slug);
      spells.push(spell);
    }
    /* Tri STABLE par niveau : les sorts mineurs d'abord, puis les sorts de
       niveau 1, chacun dans l'ordre où le joueur les a choisis. */
    spells.sort((a, b) => a.level - b.level);
    if (spells.length === 0) {
      underived.declare("spellcasting.spells", "underived.no-spell-choices", {});
    }
    resolved.spellcasting = {
      id: classView.record.slug || classView.id,
      name: classView.record.name,
      ability: castingKey,
      dc: 8 + proficiency + mod,
      attackBonus: proficiency + mod,
      slots,
      spells
    };
    /* LES DÉGÂTS : le seul des trois qui soit RÉELLEMENT hors d'atteinte. Ils
       ne sont structurés nulle part dans la source — ni dé, ni type, ni
       échelle par niveau d'emplacement. Le contrat ne les nomme pas et le lot
       8 ne peut pas les émettre : ils se déclarent, à chaque pli. */
    underived.declare("spellcasting.spells[].damage", "underived.spell-damage-unstructured", {});
    if (spellsSansConcentration.length > 0) {
      underived.declare("spellcasting.spells[].concentration", "underived.spells-missing-concentration",
        { count: spellsSansConcentration.length, ids: spellsSansConcentration.join(", ") });
    }
    /* Le MODE DE RÉSOLUTION. Refusé par le lot 8 avec sa mesure, et
       l'architecte lui a donné raison : le champ est facultatif au schéma
       depuis le 2026-08-08. Un sort sans `cast_type` est émis quand même, et
       c'est le mode qui se déclare inconnu. */
    if (spellsSansCastType.length > 0) {
      underived.declare("spellcasting.spells[].castType", "underived.spells-missing-cast-type",
        { count: spellsSansCastType.length, ids: spellsSansCastType.join(", ") });
    }
  }

  /* ── RESSOURCES ────────────────────────────────────────────────────
     Les dés de vie et les usages d'aptitude n'ont AUCUNE source mécanique.
     `class-progression.levels[].resources` donne bien des nombres — mais des
     clefs sans nom affichable (`sorts_mineurs: 3`), et `resolved.resources[]`
     exige un `name`. */
  resolved.resources = [];
  underived.declare("resources", "underived.no-resources-field", {});

  /* ── TRAITS ────────────────────────────────────────────────────────
     Le contrat §5 (GROUPE B, refusable) porte les traits d'espèce sous la
     forme `[{id, name, text}]`. Les aptitudes de CLASSE, les dons et les
     traits d'arrière-plan n'y sont pas — `class.features[]` porte de la prose
     et des tables aplaties. */
  const traits = [];
  if (speciesView && Array.isArray(speciesData.traits)) {
    for (const trait of speciesData.traits) {
      if (!trait || typeof trait.id !== "string" || typeof trait.name !== "string") {
        underived.declare("traits (espèce)", "underived.trait-entry-invalid", {});
        continue;
      }
      const entry = { id: trait.id, name: trait.name, source: speciesView.record.name };
      if (typeof trait.text === "string") entry.text = trait.text;
      traits.push(entry);
    }
  } else if (speciesView) {
    /* REWRITTEN 2026-08-08 (lot 13) — LE REFUS DU LOT 8 EST LEVÉ, ET SA RAISON
       AVEC. Le lot 8 avait refusé les traits d'espèce avec sa mesure : la mise
       en page à deux colonnes du PDF était aplatie dans `description`, et la
       description anglaise de l'Humain finissait sur le tableau du Tieffelin.
       Il avait nommé son préalable — réparer l'extraction à deux colonnes dans
       `fh-srd`. Le lot 11 l'a fait, la couche porte les traits, et le refus
       n'a plus de raison d'être : il aurait menti.

       Ce qui reste ici est la déclaration résiduelle, et elle est étroite : un
       record d'espèce qui ne porte PAS de `traits`. Ce n'est plus l'état de la
       couche SRD — c'est une couche tierce ou amputée, et la privation qui le
       prouve est délibérée (tests/build-derive.test.mjs, `COUCHE_AMPUTEE`). */
    underived.declare("traits (espèce)", "underived.species-missing-traits", {});
  }
  /* ══ LES MAÎTRISES D'ARME CHOISIES — 2026-08-20 ═══════════════════════
     Le joueur choisit une ARME ; ce qu'il gagne est la propriété de maîtrise
     que cette arme porte. Les deux se lisent, aucun ne se fabrique : le nom de
     l'arme vient du record d'arme, le texte vient du record de maîtrise que
     `data.mastery` DÉSIGNE PAR SON NOM.

     ⭐ `traits[]` PORTE DÉJÀ LA BONNE PHRASE — « aptitudes, dons, traits
     d'espèce » — et un training y entre depuis le lot 36 pour exactement la
     même raison qu'une maîtrise : ni palier, ni bonus, ni caractéristique. La
     loger dans `skills[]` ou `tools[]` l'obligerait à mentir sur des colonnes
     qu'elle n'a pas.

     ⛔ ET LA RÉSOLUTION EST PAR NOM, PAS PAR IDENTIFIANT, parce que c'est ce
     que la source publie : chaque arme porte `mastery: "Topple"`, une chaîne.
     Composer `srd:weapon-mastery:en:topple` marcherait aujourd'hui et se
     tromperait le jour où un nom porte un espace ou une apostrophe. On cherche
     dans le catalogue, qui sait.
     ⚠️ ET UNE MAÎTRISE INTROUVABLE NE SE TAIT PAS : l'arme reste sur la fiche
     avec son nom de propriété, et le manque est DÉCLARÉ. Sans ça, une couche
     SRD sans le genre `weapon-mastery` (elles ont existé jusqu'à ce matin)
     ferait disparaître le choix du joueur sans un mot. */
  const masteryChoices = picked.order.filter((entry) => entry.choice.ref &&
    entry.choice.ref.kind === "weapon" &&
    typeof entry.choice.path === "string" &&
    entry.choice.path.startsWith("class.weaponMastery["));
  const masteryDefs = reader.all("weapon-mastery");
  let masteryTextMissing = false;
  for (const entry of masteryChoices) {
    const view = reader.maybe("weapon", entry.choice.ref.id);
    if (!view) continue;                       /* un choix illégal reste `unconsumed` */
    entry.consumed = true;
    const data = view.record.data || {};
    const trait = { id: view.id, name: view.record.name, category: "weapon-mastery" };
    const propriete = typeof data.mastery === "string" ? data.mastery : null;
    const def = propriete ? masteryDefs.find((v) => v.record.name === propriete) : null;
    if (def && typeof def.record.data.description === "string") {
      trait.text = `${propriete} — ${def.record.data.description}`;
    } else if (propriete) {
      trait.text = propriete;
      masteryTextMissing = true;
    }
    traits.push(trait);
  }
  if (masteryTextMissing) {
    underived.declare("traits (maîtrises d'arme)", "underived.weapon-mastery-text-missing", {});
  }

  /* ── LES INVOCATIONS OCCULTES ──────────────────────────────────────────
     🔴 SANS CECI, LE CHOIX N'ARRIVE NULLE PART : le plan `class.invocations`
     peut demander l'invocation et l'écran peut la faire poser, elle ressort
     `unconsumed` — le joueur choisit Pact of the Tome et sa fiche n'en porte
     aucune trace. C'est un garde qui me l'a dit, pas une relecture : les six
     autres tests du lot passaient au vert avec ce trou grand ouvert.

     ⭐ ET ELLES ENTRENT COMME LES MAÎTRISES D'ARME — un trait porteur de sa
     catégorie. Une invocation n'est ni une compétence, ni un sort, ni un
     équipement : elle accorde « an abiding magical ability ». `traits[]` est
     la seule colonne qui ne l'oblige pas à mentir sur ce qu'elle est.
     ⛔ Un choix introuvable au catalogue reste `unconsumed` — même règle
     qu'au-dessus : on ne fabrique pas un trait à partir d'un identifiant. */
  const invocationChoices = picked.order.filter((entry) => entry.choice.ref &&
    entry.choice.ref.kind === "class-option" &&
    typeof entry.choice.path === "string" &&
    entry.choice.path.startsWith("class.invocations["));
  for (const entry of invocationChoices) {
    const view = reader.maybe("class-option", entry.choice.ref.id);
    if (!view) continue;
    entry.consumed = true;
    const data = view.record.data || {};
    const trait = { id: view.id, name: view.record.name, category: "eldritch-invocation" };
    if (typeof data.description === "string") trait.text = data.description;
    traits.push(trait);
  }

  resolved.traits = traits;
  underived.declare("traits (classe, don, arrière-plan)", "underived.no-trait-field-for-class-feat-background", {});

  resolved.gear = gear;

  /* ── ARTISANAT ─────────────────────────────────────────────────────
     Décision Q4 : les mécaniques nouvelles sont des MODULES MOTEUR activés par
     un drapeau de couche, jamais du contenu de couche. Aucun module
     d'artisanat n'existe au M2 — la collection est vide, et c'est dit. */
  resolved.craft = [];
  underived.declare("craft", "underived.no-craft-module", {});

  /* ── STATISTIQUES DÉRIVÉES DE COUCHE ───────────────────────────────
     REWRITTEN 2026-08-08 (lot 19) — LA PREMIÈRE EST PUBLIÉE. L'ancienne
     déclaration disait « aucun module n'en publie au M2 », et c'était vrai le
     jour où elle a été écrite ; elle est devenue FAUSSE dès qu'un module a été
     injecté, et une déclaration fausse est pire qu'aucune.

     La forme, elle, n'a pas bougé et c'est la décision Q4 : une statistique
     dérivée est produite par un MODULE activé par un DRAPEAU, jamais par le
     pli lui-même. Ce fichier n'en nomme aucun — il lit les drapeaux que la
     pile lève, appelle les modules dont le drapeau y est, et RECOPIE ce qu'ils
     rendent. Les termes qu'un module ne peut pas dériver reviennent dans le
     même carnet que les nôtres, avec leur raison.

     ⚠️ LES CHOIX D'UN MODULE LUI APPARTIENNENT. Ceux dont le chemin est
     enraciné dans son drapeau (`fh.destiny.glory[0]`) lui sont passés ET
     marqués consommés : c'est lui qui les juge, et un chemin qu'il ne sait pas
     lire est un refus qui le nomme — jamais une ligne ignorée (loi §0.5). Un
     drapeau ÉTEINT ne consomme rien : les choix restent alors `unconsumed`, et
     `validate` dit qu'ils ne changent rien à la fiche. */
  const raisedFlags = Array.isArray(flags) ? flags : [];
  const statModules = Array.isArray(modules) ? modules : [];
  const stats = [];
  const servedFlags = new Set();
  let anyModuleActive = false;

  /* Le chemin de lecture tendu aux modules. Avec `id` : la vue aplatie ou
     `null` ; sans : la liste du genre — la différence entre un genre vide et
     un record absent, voir l'en-tête. */
  const moduleRecords = (kind, id) => {
    if (id === undefined) return reader.all(kind).map(flatView);
    const view = reader.maybe(kind, id);
    return view === null || view === undefined ? null : flatView(view);
  };

  /* LES DONS QUE LES CHOIX DÉSIGNENT. Ils ne sont PAS marqués consommés ici :
     ce fichier n'en tire rien pour `resolved` (les traits d'un don sont de la
     prose, déclarée plus haut). Un module qui en lit un le RÉCLAME, et c'est
     à ce moment-là seulement que le choix cesse d'être signalé comme inerte.
     Le `ref` mort, lui, JETTE comme partout ailleurs : `class`, `species`,
     `gear[n]` et les sorts se lisent déjà par `must`. */
  /* Les `ref` du document, NON résolus ici — c'est délibéré et ça a été
     mesuré : résoudre d'avance avec `must` VOLERAIT au module sa distinction
     entre « la couche n'est pas montée » (le genre répond vide → à DÉCLARER)
     et « le record n'existe pas » (un `ref` mort → à REFUSER). Un module lit
     ses PROPRES `ref` par `records(kind, id)`, et c'est cette lecture-là qui
     porte la nuance. La résolution n'a donc lieu que pour ce qu'on TEND au
     module — hors de son namespace — et elle est faite par module, plus bas. */
  const refEntries = picked.order.filter((entry) => entry.choice.ref);
  /* LOT 34 — LES PALIERS DE COMPÉTENCE, RENDUS PAR UN MODULE, APPLIQUÉS ICI.
     Un module peut rendre `skillTiers: {slug: {proficiency, bonusTerm}}` en
     plus de `{stat, underived, consumed}` — la MÊME discipline générique, un
     canal de plus dans le même protocole. `proficiency` est le mot du schéma
     que la ligne doit porter, `bonusTerm` est CE QUE CE PALIER AJOUTE au
     bonus — le module le calcule (il en connaît la règle), ce fichier ne fait
     que l'ADDITIONNER au modificateur de caractéristique, exactement comme il
     additionne déjà `proficiency` pour `resolved.saves`/`resolved.tools`.
     Fusionné dans l'ordre des modules (le dernier qui parle gagne, comme un
     override), puis appliqué à `resolved.skills[]` juste après la boucle :
     c'est ce qui permet à un module FLAG-GATÉ de corriger une collection que
     le pli construit sans lui, sans que ce fichier ait besoin de nommer sa
     mécanique — ni même le VOCABULAIRE de ses paliers — pour le lire (loi
     §0.12, deux gardes littéraux : `tests/build-block.test.mjs` et
     `tests/fh-skill-pool.test.mjs`). */
  const skillTierOverrides = new Map();
  const moduleViolations = [];
  for (const statModule of statModules) {
    if (!statModule || typeof statModule.contribute !== "function" || typeof statModule.flag !== "string") {
      fail("un module de statistique doit déclarer `{flag, contribute}` — un module que la dérivation ne sait " +
        "pas appeler est un refus, pas un module qu'on saute.");
    }
    servedFlags.add(statModule.flag);
    if (!raisedFlags.includes(statModule.flag)) continue;
    anyModuleActive = true;
    const own = picked.order.filter((entry) => statOwnsPath(statModule.flag, entry.choice.path));
    for (const entry of own) entry.consumed = true;
    const outsideRefs = refEntries.filter((entry) => !statOwnsPath(statModule.flag, entry.choice.path));
    const outcome = statModule.contribute({
      proficiency,
      /* AJOUT DU LOT 23, et il n'est pas de confort : `proficiency` NE DIT PAS
         le niveau. Les niveaux 5 à 8 la donnent tous à 3, et une statistique
         qui s'accumule PAR NIVEAU — un pool de points, une ressource de
         progression — vaut des choses différentes aux deux bouts de cette
         tranche. Sans ce champ, un module n'a qu'une issue : écrire une table
         de niveaux EN DUR, exactement ce que `stats[]` existe pour éviter.
         C'est un nombre que le pli a DÉJÀ su lire, comme la maîtrise, et ce
         fichier ne nomme toujours aucune mécanique de couche (§0.12). */
      level,
      records: moduleRecords,
      /* HORS de son namespace : ce qu'il y voit déjà lui arrive par `choices`,
         et le lui tendre deux fois inviterait à le compter deux fois. */
      refs: outsideRefs.map((entry) => Object.assign(
        { path: entry.choice.path, kind: entry.choice.ref.kind },
        flatView(reader.must(entry.choice.ref.kind, entry.choice.ref.id, `le choix « ${entry.choice.path} »`))
      )),
      species: speciesView
        ? { id: speciesView.id, name: speciesView.record.name, slug: speciesView.record.slug, data: speciesData }
        : null,
      /* LOT 34, GÉNÉRIQUE : les slugs que le pli a DÉJÀ placés en maîtrise
         pleine (arrière-plan, classe, espèce — voir § « COMPÉTENCES »
         au-dessus). Un module qui gère une grille de paliers en a besoin
         pour savoir OÙ poser un plancher ; ce fichier ne dit toujours pas
         CE QUE le plancher vaut. */
      imposedSkillSlugs: imposedSkillSlugs.slice(),
      /* LOT 171, GÉNÉRIQUE : les paliers que le pli a DÉJÀ posés par une
         bourse captive (classe, espèce). Un module qui gère une grille de
         paliers en fait des planchers et les compte ; ce fichier ne dit
         toujours pas ce qu'un palier VAUT ni combien on en tolère. */
      placedSkillTiers: Object.fromEntries(budgetTier),
      choices: own.map((entry) => ({
        path: entry.choice.path,
        /* Le chemin PRIVÉ DE SON PRÉFIXE. Le point de séparation est retiré
           quand il y en a un, et pas autrement : `fh.destiny[0]` est dans le
           namespace lui aussi, et lui couper un caractère de trop donnerait au
           module un `tail` tronqué à refuser pour la mauvaise raison. */
        tail: entry.choice.path.slice(statModule.flag.length).replace(/^\./, ""),
        value: entry.choice.value,
        ref: entry.choice.ref,
        label: entry.choice.label
      }))
    });
    if (outcome && outcome.stat) stats.push(outcome.stat);
    if (outcome && Array.isArray(outcome.underived)) {
      /* Le module a DÉJÀ lié son propre `toString` (sa propre table, dans
         `src/modules/fh/labels.mjs`) au moment où il a construit `entry` —
         on le TRANSMET, on ne le RECONSTRUIT pas (voir le commentaire de
         `Underived.declare`, plus haut). */
      for (const entry of outcome.underived) underived.declare(entry.field, entry.key, entry.params, () => entry.toString());
    }
    if (outcome && outcome.skillTiers && typeof outcome.skillTiers === "object") {
      for (const [slug, entry] of Object.entries(outcome.skillTiers)) {
        if (entry && typeof entry.proficiency === "string" && Number.isInteger(entry.bonusTerm)) {
          skillTierOverrides.set(slug, entry);
        }
      }
    }
    /* CANAL GÉNÉRIQUE DE PLUS (lot 36) : un module peut rendre `traits`,
       une liste d'entrées à AJOUTER à `resolved.traits[]` — même
       discipline que `skillTiers` : ce fichier ne connaît ni la mécanique
       ni le vocabulaire qui les a produites (§0.12), il recopie une forme
       que le schéma gouverne, pas lui. `resolved.traits` existe déjà (les
       traits d'espèce, plus haut) : ceci s'y AJOUTE, ça ne le remplace pas. */
    if (outcome && Array.isArray(outcome.traits)) {
      for (const entry of outcome.traits) {
        if (entry && typeof entry.id === "string" && typeof entry.name === "string") {
          resolved.traits.push(entry);
        }
      }
    }
    /* CANAL GÉNÉRIQUE DE PLUS (lot 34) : un module peut rendre `violations`,
       une liste de `{key, params, path?}` (lot 27) — un choix de joueur que
       ce module a jugé illégal SANS jeter (loi §0.5, même discipline que le
       reste de `derive`). Recopié tel quel : ce fichier ne nomme jamais la
       mécanique qui l'a produit. */
    if (outcome && Array.isArray(outcome.violations)) {
      moduleViolations.push(...outcome.violations);
    }
    /* CE QUE LE MODULE A RÉCLAMÉ HORS DE SON NAMESPACE — et le garde qui
       l'empêche d'en réclamer plus. Sans lui, un module pourrait faire taire
       n'importe quel choix du document en le nommant. */
    if (outcome && outcome.consumed !== undefined) {
      if (!Array.isArray(outcome.consumed)) {
        fail(`le module « ${statModule.flag} » rend un \`consumed\` qui n'est pas une liste de chemins.`);
      }
      for (const path of outcome.consumed) {
        const claimed = outsideRefs.find((entry) => entry.choice.path === path);
        if (!claimed) {
          fail(`le module « ${statModule.flag} » déclare avoir lu le choix « ${path} », que la dérivation ne lui a ` +
            "pas tendu. Un module ne réclame que ce qu'il a reçu : sinon il pourrait faire passer pour lu " +
            "n'importe quel choix du document, et `validate` cesserait de dire qu'il ne change rien à la fiche.");
        }
        claimed.consumed = true;
      }
    }
  }
  resolved.stats = stats;

  /* LOT 34 — LA CORRECTION DES PALIERS, APPLIQUÉE APRÈS COUP. `resolved.skills`
     a déjà été construit (§ « COMPÉTENCES », en SRD générique — maîtrisé ou
     pas). Un module actif peut avoir rendu `skillTiers` : on corrige alors
     `proficiency` ET `bonus` des lignes visées — le `bonusTerm` est déjà
     calculé par le module, ce fichier ne fait que l'ADDITIONNER au
     modificateur de caractéristique. Une entrée dont le module ne parle pas
     garde exactement ce que le pli lui avait donné. */
  const skillTierMatched = new Set();
  if (skillTierOverrides.size > 0 && Array.isArray(resolved.skills)) {
    resolved.skills = resolved.skills.map((skill) => {
      const override = skillTierOverrides.get(skill.id);
      if (!override) return skill;
      skillTierMatched.add(skill.id);
      if (proficiency === null) return skill;
      return {
        ...skill,
        proficiency: override.proficiency,
        bonus: abilities[skill.ability].mod + override.bonusTerm
      };
    });
  }

  /* LOT 35 — LE MÊME CANAL, ÉTENDU AUX OUTILS. Un slug que `skillTierOverrides`
     porte et qu'AUCUNE compétence ne réclame est un outil acheté au pool —
     `derive.mjs` ne nomme toujours aucune mécanique FH (§0.12) : il cherche le
     slug dans `resolved.skills[]` PUIS dans `resolved.tools[]`, une recherche
     générique dans deux collections du contrat, pas une règle de couche. `tool`
     est un genre du schéma comme `class` ou `background` (contrat `layers`,
     déjà lu par ce fichier pour l'arrière-plan) — le lire ici n'ouvre aucune
     brèche à §0.12.

     ⛔ `resolved.tools[]` NE PUBLIE QUE LES OUTILS POSSÉDÉS OU DÉPENSÉS, jamais
     les 36 du catalogue (commande §4b). Un slug déjà présent (l'outil
     d'arrière-plan, avant ce lot) est CORRIGÉ en place ; un slug absent des
     deux collections est un outil neuf, et son nom/sa caractéristique se
     LISENT dans le catalogue `tool` — exactement comme ce fichier le fait déjà
     pour l'outil d'arrière-plan, quelques lignes plus haut. */
  if (skillTierOverrides.size > 0 && proficiency !== null && Array.isArray(resolved.tools)) {
    for (const [slug, override] of skillTierOverrides) {
      if (skillTierMatched.has(slug)) continue;
      const existingIndex = tools.findIndex((tool) => tool.id === slug);
      if (existingIndex !== -1) {
        const existing = tools[existingIndex];
        tools[existingIndex] = {
          ...existing,
          proficiency: override.proficiency,
          bonus: abilities[existing.ability].mod + override.bonusTerm
        };
        continue;
      }
      const view = reader.all("tool").find((candidate) => (candidate.record.slug || candidate.id) === slug);
      if (!view) continue; // le module a déjà refusé un slug hors catalogue (skill-spend.option-unavailable)
      const abilityKey = view.record.data && view.record.data.ability_key;
      if (!assertAbilityKey(abilityKey, view.id, "data.ability_key")) {
        underived.declare(`tools[${slug}]`, "underived.tool-missing-ability-key-pool", {});
        continue;
      }
      tools.push({
        id: view.record.slug || view.id,
        name: view.record.name,
        ability: abilityKey,
        bonus: abilities[abilityKey].mod + override.bonusTerm,
        proficiency: override.proficiency
      });
    }
  }

  if (resolved.tools.length === 0 && !underived.has("tools")) {
    underived.declare("tools", "underived.no-tool-granted", {});
  }

  /* La collection est vide et AUCUN module n'a tourné : c'est le cas du
     personnage SRD pur, et la liste vide doit se déclarer comme les autres
     (règle de refus n°2). Un module qui a tourné sans rien publier, lui, a
     déjà dit pourquoi sous son propre nom — le redire ici serait un doublon.

     ⚠️ LA RAISON NOMME LES DEUX LISTES, et ce n'est pas de la décoration :
     « aucune statistique » a deux causes opposées — la pile ne lève rien, ou
     elle lève un drapeau que personne n'a injecté. Sans les deux listes, un
     personnage FH monté sans son module rendrait exactement le même carnet
     qu'un personnage SRD pur, et l'oubli serait invisible. */
  if (stats.length === 0 && !anyModuleActive) {
    const served = [...servedFlags].sort();
    underived.declare("stats", "underived.no-active-stat-module",
      { raisedFlags: raisedFlags.join(", "), servedFlags: served.join(", ") });
  }

  /* ── NOTES ─────────────────────────────────────────────────────────
     ⚠️ MESURE DU LOT 9. On aurait pu les faire entrer par des choix — sauf que
     `$defs/build.choices.items.value` plafonne une valeur de choix à 200
     caractères, et qu'une note de personnage en fait couramment plusieurs
     centaines. Les notes appartiennent donc à un verbe d'édition de la fiche
     (l'override, ou un verbe du bloc `doc`), pas à la dérivation. */
  resolved.notes = [];
  underived.declare("notes", "underived.notes-not-derivable", {});

  /* ── CLASSE D'ARMURE, une fois l'équipement connu ──────────────────
     Sans armure : 10 + Dex. Avec : `ac_base` + Dex plafonné par `ac_dex_cap`,
     plus les `ac_bonus` (le bouclier — arbitrage B4 : « +2 » est un
     modificateur, pas une base). */
  const acBases = [];
  let acBonus = 0;
  let acRefusedArmorId = null;
  for (const view of armorPieces) {
    const data = view.record.data || {};
    const hasBase = Number.isInteger(data.ac_base);
    const hasBonus = Number.isInteger(data.ac_bonus);
    if (!hasBase && !hasBonus) {
      acRefusedArmorId = view.id;
      break;
    }
    if (hasBase) acBases.push({ base: data.ac_base, cap: data.ac_dex_cap });
    if (hasBonus) acBonus += data.ac_bonus;
  }
  if (acRefusedArmorId) {
    underived.declare("ac", "underived.armor-missing-ac-fields", { armorId: acRefusedArmorId });
  } else if (acBases.length > 1) {
    underived.declare("ac", "underived.ac-ambiguous-multiple-armor", {});
  } else if (acBases.length === 1) {
    const { base, cap } = acBases[0];
    const dex = cap === null || cap === undefined ? abilities.dex.mod : Math.min(abilities.dex.mod, cap);
    resolved.ac = base + dex + acBonus;
  } else {
    resolved.ac = 10 + abilities.dex.mod + acBonus;
  }

  /* Remise dans l'ordre du schéma : un document se relit à l'œil. */
  const ordered = {};
  for (const key of ["derivation", "identity", "abilities", "proficiency", "ac", "vitals", "speeds", "senses",
    "languages", "saves", "skills", "tools", "actions", "spellcasting", "resources", "traits", "gear",
    "currency", "craft", "stats", "notes"]) {
    if (Object.hasOwn(resolved, key)) ordered[key] = resolved[key];
  }

  return {
    resolved: ordered,
    underived: underived.list(),
    unconsumed: picked.order.filter((entry) => !entry.consumed).map((entry) => entry.choice.path),
    /* Ce que la dérivation a LU dans les déclarations de choix — `validate` en
       a besoin pour dire « tu devais en choisir 2, tu en as choisi 1 ». */
    grants: { chosenBy, declarations: Object.fromEntries(GRANT_ROOTS.map((root) => [root, declarations[root].data])) },
    /* LOT 34 — CE QU'UN MODULE A JUGÉ ILLÉGAL, SANS JETER. Recopié tel quel
       depuis `outcome.violations` (canal générique) ; vide quand aucun module
       n'en a rendu. */
    violations: moduleViolations
  };
}
