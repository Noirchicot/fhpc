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

/** Les six clefs machine de `$defs/ability`. Ce ne sont pas des mots : c'est
 *  l'énumération du schéma, la même dans toutes les langues.
 *
 *  ⚠️ ARBITRAGE DE L'ARCHITECTE, 2026-08-08 : `ability_key` est CANONIQUE dans
 *  toutes les langues. Une couche FR qui dirait `sag` porterait une clef que
 *  `resolved.abilities` ne peut pas adresser — ce dernier est
 *  `additionalProperties: false` sur ces six-là, dans les deux langues. Le mot
 *  affichable reste disponible ailleurs (`skill.data.ability`). */
export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_SET = new Set(ABILITY_KEYS);

/** Une clef de caractéristique HORS des six canoniques est une erreur
 *  bruyante qui NOMME le record — jamais une valeur à rattraper (arbitrage du
 *  2026-08-08). Une table de correspondance ici serait exactement la faute que
 *  ce lot existe pour éviter. Absente, la clef se DÉCLARE ; fausse, elle JETTE :
 *  un champ qui manque est un travail à finir, un champ hors catalogue est un
 *  contenu faux. */
function assertAbilityKey(key, recordId, field) {
  if (key === undefined || key === null) return false;
  if (ABILITY_SET.has(key)) return true;
  fail(`le record « ${recordId} » porte \`${field}\` = ${JSON.stringify(key)}, qui n'est pas une clef de ` +
    `caractéristique (les six, dans toutes les langues : ${ABILITY_KEYS.join(", ")}). ` +
    "Le moteur ne rattrape pas une clef hors catalogue : il la nomme.");
}

/** Les quatre dénominations de `$defs/currency`. */
export const CURRENCY_KEYS = ["cp", "sp", "gp", "pp"];

/** `$defs/resolved.spellcasting.spells[].text.maxLength`. Recopié ici parce
 *  que la dérivation doit DÉCIDER (porter ou déclarer) et non seulement
 *  valider ; un test compare les deux nombres. */
export const SPELL_TEXT_MAX = 4000;

/** Les racines de choix qui FONT CHOISIR une compétence. L'arrière-plan n'y
 *  est pas : le contrat §3 lui donne `skill_ids` (il ACCORDE, il ne fait pas
 *  choisir), et fabriquer ici la branche d'un `granted_skill_choice`
 *  d'arrière-plan serait du code sans besoin (loi §0.6). */
const GRANT_ROOTS = ["species", "class"];

function fail(what) {
  throw new BuildError(`fhpc/build: ${what}`);
}

function modOf(score) {
  return Math.floor((score - 10) / 2);
}

/* ── LE CARNET DES NON-DÉRIVÉS ───────────────────────────────────────
   Il n'accumule pas des chaînes libres : chaque entrée porte le CHAMP visé et
   la RAISON. Une liste de phrases sans champ obligerait à relire le code pour
   savoir quoi réparer. */
class Underived {
  constructor() { this.entries = []; }
  declare(field, reason) {
    this.entries.push({ field, reason });
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
   Un index par id de record ET par slug : le contrat désigne les compétences
   par id (`skill_ids`, `skill_choice.from`), tandis que les choix du joueur
   les nomment par slug (`class.skills[0] = "investigation"`) et que
   `resolved.skills[].id` est ce même slug. Sans les deux entrées, il faudrait
   deviner de quel côté on se trouve. */
function indexSkills(reader, underived) {
  const byId = new Map();
  const bySlug = new Map();
  const list = [];
  for (const view of reader.all("skill")) {
    const abilityKey = view.record.data && view.record.data.ability_key;
    const slug = view.record.slug;
    if (typeof slug !== "string") {
      underived.declare(`skills[${view.id}]`,
        "le record de compétence ne porte pas de `slug`, et `resolved.skills[].id` en est l'ancre d'override.");
      continue;
    }
    if (!assertAbilityKey(abilityKey, view.id, "data.ability_key")) {
      underived.declare(`skills[${slug}]`,
        "le record ne porte pas de `ability_key` — la caractéristique d'une compétence est un identifiant, " +
        "jamais le mot affichable de `data.ability` (contrat §3, genre `skill`).");
      continue;
    }
    const entry = { id: slug, name: view.record.name, ability: abilityKey, recordId: view.id };
    byId.set(view.id, entry);
    bySlug.set(slug, entry);
    list.push(entry);
  }
  list.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { byId, bySlug, list };
}

/* Une déclaration de choix de compétence (`skill_choice`,
   `granted_skill_choice`) → l'ensemble des slugs légaux. `"any"` est le cas
   B1 du contrat, arbitré : le barde choisit parmi TOUTES les compétences, et
   la source ne donne pas de liste — on ne lui en fabrique pas une. */
function allowedSlugs(declaration, skills) {
  if (!declaration || typeof declaration !== "object") return null;
  const from = declaration.from;
  if (from === "any") return new Set(skills.list.map((entry) => entry.id));
  if (!Array.isArray(from)) return null;
  const slugs = new Set();
  for (const recordId of from) {
    const entry = skills.byId.get(recordId);
    if (entry) slugs.add(entry.id);
  }
  return slugs;
}

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
 * @returns {{resolved:object, underived:Array<{field:string,reason:string}>, unconsumed:string[]}}
 */
export function derive({ query, stack, choices, at, units, previous }) {
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
      underived.declare("identity.species (lignage)",
        "le lignage est un choix, pas un record : le recoller au nom de l'espèce (« Elfe (haut-elfe) ») " +
        "reviendrait à composer un mot affichable dans le moteur (loi §0.13). La composition appartient à l'interface.");
    }
    const sizeKey = speciesData.size_key;
    if (typeof sizeKey === "string") identity.size = sizeKey;
    else underived.declare("identity.size", "le record d'espèce ne porte pas `size_key` (contrat §3, genre `species`) ; " +
      "`data.size` est une phrase (« M (moyenne, entre 1,50 m et 1,80 m) »), pas une clef.");
  } else {
    underived.declare("identity.species", "aucun choix `species`.");
    underived.declare("identity.size", "aucun choix `species`.");
  }
  if (backgroundView) identity.background = backgroundView.record.name;
  else underived.declare("identity.background", "aucun choix `background`.");

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
    underived.declare("proficiency", progression
      ? `la table de progression de « ${classView.id} » ne donne pas de \`proficiency_bonus\` au niveau ${level}.`
      : `aucun record \`class-progression\` ne pointe la classe « ${classView.id} » (\`data.class\`).`);
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
      underived.declare(`gear[${index}]`, `le choix « ${entry.choice.path} » porte une valeur, pas un \`ref\` vers un record.`);
      continue;
    }
    const view = reader.must(ref.kind, ref.id, `le choix « ${entry.choice.path} »`);
    const quantity = takeValue(`gear[${index}].quantity`);
    const equipped = takeValue(`gear[${index}].equipped`);
    const missing = [];
    if (!Number.isInteger(quantity)) missing.push(`gear[${index}].quantity`);
    if (typeof equipped !== "boolean") missing.push(`gear[${index}].equipped`);
    if (missing.length > 0) {
      underived.declare(`gear[${view.record.slug || ref.id}]`,
        `${missing.join(" et ")} manque(nt) — la quantité et le port sont des décisions du joueur, ` +
        "et « 1, non équipé » serait un défaut inventé.");
      continue;
    }
    gear.push({ id: view.record.slug || ref.id, name: view.record.name, quantity, equipped });
    if (ref.kind === "armor" && equipped) armorPieces.push(view);
  }
  if (gear.length === 0) {
    underived.declare("gear", "aucun choix `gear[n]` n'a produit de ligne d'équipement — l'équipement de départ est " +
      "un CHOIX du joueur, pas une dérivation (contrat §6, hors périmètre du M2).");
  } else {
    underived.declare("gear[].weight", "le poids d'un objet est une phrase dans la source (« 0,5 kg ») et le contrat " +
      "ne nomme aucun champ mécanique de masse — on ne parse pas la prose.");
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
    underived.declare("currency", `${missingCurrency.join(", ")} — une bourse vide s'écrit en zéros SI on les a choisis ; ` +
      "on ne les invente pas (contrat §6 : le montant de départ est un choix).");
  }

  /* ── POINTS DE VIE ─────────────────────────────────────────────────
     Niveau 1 : dé de vie + modificateur de Constitution. Au-delà, la règle
     d'accroissement n'est portée par AUCUN champ mécanique du contrat, et
     l'inventer donnerait une fiche silencieusement fausse. */
  const hitDie = classData.hit_die;
  const vitals = {};
  if (!Number.isInteger(hitDie)) {
    underived.declare("vitals.hpMax", "le record de classe ne porte pas `hit_die` (contrat §3) ; `hit_point_die` " +
      "est une phrase (« d6 par niveau de Magicien »), et on ne parse pas la prose.");
  } else if (level > 1) {
    underived.declare("vitals.hpMax", `le personnage est de niveau ${level} : la progression des points de vie ` +
      "au-delà du niveau 1 n'est portée par aucun champ mécanique du contrat.");
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
  if (!speciesView) {
    underived.declare("speeds", "aucun choix `species`.");
  } else if (!speedField) {
    underived.declare("speeds", `le document ne dit pas son unité de distance (\`units.distance\` = ${JSON.stringify(distanceUnit)}) : ` +
      "la couche porte `speed_m` OU `speed_ft`, et choisir pour elle serait deviner.");
  } else if (!Number.isInteger(speciesData[speedField])) {
    underived.declare("speeds", `le record d'espèce ne porte pas \`${speedField}\` en entier (contrat §3) ; ` +
      "`data.speed` est une phrase (« 9 m »).");
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
        underived.declare("senses (espèce)", "une entrée de `senses` n'a ni `id` ni `name` exploitable (contrat §5).");
        continue;
      }
      if (!Number.isInteger(sense[rangeField])) {
        underived.declare(`senses[${sense.id}]`,
          `l'entrée ne porte pas \`${rangeField}\` en entier, et \`resolved.senses[].value\` est obligatoire.`);
        continue;
      }
      senses.push({ id: sense.id, name: sense.name, value: sense[rangeField], unit: distanceUnit });
    }
  } else if (speciesView && speciesData.senses !== undefined && !rangeField) {
    underived.declare("senses", `le document ne dit pas son unité de distance (\`units.distance\` = ${JSON.stringify(distanceUnit)}).`);
  }
  resolved.senses = senses;
  if (senses.length === 0 && !underived.has("senses")) {
    underived.declare("senses", speciesView
      ? "le record d'espèce ne porte pas de `senses` — trois espèces sur neuf n'en ont aucun, et c'est un fait, pas un trou."
      : "aucun choix `species`.");
  }
  /* La PERCEPTION PASSIVE est calculable (10 + bonus de Perception) mais elle
     n'a de nom dans AUCUN record : ce n'est pas un sens d'espèce, c'est une
     ligne de fiche. La nommer ici violerait la loi §0.13. */
  underived.declare("senses[perception-passive]",
    "la perception passive se calcule (10 + le bonus de la compétence correspondante) mais son NOM ne vit dans " +
    "aucun record — ce n'est pas un sens d'espèce, c'est une ligne de fiche, et l'interface la nomme.");

  /* ── LANGUES ───────────────────────────────────────────────────────
     Il n'existe pas de genre `language` parmi les 14. Le choix `languages[0]`
     nomme un slug que rien dans la pile ne peut résoudre. */
  resolved.languages = [];
  underived.declare("languages", "aucun genre `language` parmi les 14 genres de couche : un slug de langue " +
    "(`languages[0] = \"draconique\"`) ne se résout contre rien, et son nom affichable n'existe nulle part.");

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
      underived.declare("saves", "le bonus de maîtrise n'a pas été dérivé : un jet de sauvegarde maîtrisé sans lui " +
        "vaudrait le jet non maîtrisé, en silence.");
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
    underived.declare("saves", "le record de classe ne porte pas `saving_throw_keys` (contrat §3) ; " +
      "`saving_throw_proficiencies` n'y donne que des noms affichables, et le moteur ne les traduit pas en clefs.");
  }

  /* ── COMPÉTENCES ───────────────────────────────────────────────────
     Les DIX-HUIT, chacune avec son bonus, maîtrisée ou non. Les maîtrises
     viennent de trois sources : l'arrière-plan les ACCORDE (`skill_ids`), la
     classe et l'espèce en font CHOISIR (`skill_choice`,
     `granted_skill_choice`). */
  const skills = indexSkills(reader, underived);
  const proficientSkills = new Map(); // slug → la racine qui l'accorde

  const grantSlugs = (recordIds, sourceRoot) => {
    for (const recordId of recordIds) {
      const entry = skills.byId.get(recordId);
      if (!entry) {
        underived.declare(`skills[${recordId}]`,
          `l'arrière-plan accorde la compétence « ${recordId} », que la pile ne porte pas.`);
        continue;
      }
      proficientSkills.set(entry.id, sourceRoot);
    }
  };
  if (Array.isArray(backgroundData.skill_ids)) grantSlugs(backgroundData.skill_ids, "background");
  else if (backgroundView) {
    underived.declare("skills (arrière-plan)", "le record d'arrière-plan ne porte pas `skill_ids` (contrat §3) ; " +
      "`skill_proficiencies` y donne des noms affichables.");
  }

  /* Les choix. ⚠️ RÈGLE DE CE LOT, à ratifier (question 2) : un choix est un
     choix de compétence quand sa RACINE est celle d'une source qui en déclare
     un ET que sa valeur est un slug LÉGAL de la liste `from`. On ne se fie pas
     au dernier segment du chemin : le personnage d'exemple répond au choix
     d'espèce sous `species.keenSenses`, un chemin propre à l'Elfe, tandis que
     la classe répond sous `class.skills[0]`. Une source qui déclare
     `{count, from}` sait déjà ce qui est légal — c'est elle qu'on écoute, pas
     la forme du chemin. */
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
        underived.declare(`skills (${root})`, `« ${declaration.view.id} » porte un \`${declaration.key}\` que la ` +
          "dérivation ne sait pas lire : la forme attendue est `{count, from}` (contrat §3/§5).");
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

  if (skills.list.length === 0) {
    underived.declare("skills", "la pile ne porte aucune compétence exploitable — le genre `skill` est vide ou " +
      "ses records n'ont pas de `ability_key`.");
    resolved.skills = [];
  } else if (proficiency === null) {
    underived.declare("skills", "le bonus de maîtrise n'a pas été dérivé : rendre dix-huit compétences dont les " +
      "maîtrisées valent comme les autres serait une fiche fausse et jouable.");
    resolved.skills = [];
  } else {
    resolved.skills = skills.list.map((entry) => {
      const isProficient = proficientSkills.has(entry.id);
      return {
        id: entry.id,
        name: entry.name,
        ability: entry.ability,
        bonus: abilities[entry.ability].mod + (isProficient ? proficiency : 0),
        proficiency: isProficient ? "proficient" : "none"
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
        underived.declare("tools", "l'arrière-plan demande de CHOISIR un outil (`tool_choice`, arbitrage B2) et " +
          "aucun choix sous `background.*` ne désigne un record `tool`.");
      }
    } else {
      underived.declare("tools", "le record d'arrière-plan ne porte ni `tool_id` ni `tool_choice` (contrat §3) ; " +
        "`tool_proficiency` y est une phrase.");
    }
  }
  for (const view of toolViews) {
    const abilityKey = view.record.data && view.record.data.ability_key;
    if (!assertAbilityKey(abilityKey, view.id, "data.ability_key")) {
      underived.declare(`tools[${view.record.slug || view.id}]`,
        "le record d'outil ne porte pas `ability_key` — ⚠️ CE CHAMP N'EST PAS DANS LE CONTRAT " +
        "(question 3 à l'architecte) ; `data.ability` y est un mot affichable, et " +
        "`resolved.tools[].ability` exige une clef.");
      continue;
    }
    if (proficiency === null) {
      underived.declare(`tools[${view.record.slug || view.id}]`, "le bonus de maîtrise n'a pas été dérivé.");
      continue;
    }
    tools.push({
      id: view.record.slug || view.id,
      name: view.record.name,
      ability: abilityKey,
      bonus: abilities[abilityKey].mod + proficiency,
      proficiency: "proficient"
    });
  }
  resolved.tools = tools;
  if (tools.length === 0 && !underived.has("tools")) {
    underived.declare("tools", "aucune maîtrise d'outil accordée par les choix.");
  }

  /* ── ACTIONS ───────────────────────────────────────────────────────
     Il n'existe pas de genre `action`. Composer une attaque à partir d'une
     arme (dé de dégâts + caractéristique + propriétés Finesse/Lancer) est une
     RÈGLE, et le contrat n'en porte aucune : `weapon.properties` est une
     phrase (« Finesse, Lancer (portée 6/18), Légère »). Quant à Esquive et à
     l'Attaque d'opportunité, leur texte ne vit que dans le glossaire, en
     prose. */
  resolved.actions = [];
  underived.declare("actions", "aucun genre `action` parmi les 14 ; composer une attaque depuis une arme demande " +
    "une règle (Finesse, Lancer) que le contrat ne porte pas, et `weapon.properties` est une phrase.");

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
      underived.declare("spellcasting", "le record de classe ne porte pas `spellcasting_ability_key` — ⚠️ CE CHAMP " +
        "N'EST PAS DANS LE CONTRAT (question 3) ; `primary_ability` y est un mot affichable, et la caractéristique " +
        "primaire d'une classe n'est de toute façon pas toujours sa caractéristique d'incantation.");
    } else {
      resolved.spellcasting = null; // Dérivé, pas consolant : ni sort choisi, ni emplacement.
    }
  } else if (proficiency === null) {
    underived.declare("spellcasting", "le bonus de maîtrise n'a pas été dérivé : le DD et le bonus d'attaque en dépendent.");
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
      underived.declare("spellcasting.slots", `la table de progression de « ${classView.id} » ne porte pas ` +
        "`spell_slots` au niveau demandé — la magie de pacte vit un cran plus bas, en scalaire (schéma, `slotsRecharge`).");
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
        underived.declare(`spellcasting.spells[${view.id}]`, "le record de sort n'a ni `slug` ni `level` exploitable.");
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
          underived.declare(`spellcasting.spells[${slug}].text`,
            `la description fait ${data.description.length} caractères et le schéma en accepte ${SPELL_TEXT_MAX} ; ` +
            "tronquer un texte de règle serait un mensonge silencieux.");
        } else {
          spell.text = data.description;
        }
      } else {
        underived.declare(`spellcasting.spells[${slug}].text`, "le record de sort ne porte pas de `description`.");
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
      underived.declare("spellcasting.spells", "aucun choix ne désigne de record `spell` — un lanceur sans sort est " +
        "une liste vide, pas une liste devinée.");
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
    underived.declare("spellcasting.spells[].damage",
      "les dégâts d'un sort ne sont structurés nulle part dans la source : ni dé, ni type, ni progression par " +
      "niveau d'emplacement. Ils ne vivent que dans `description`, en prose, et on ne parse pas la prose.");
    if (spellsSansConcentration.length > 0) {
      underived.declare("spellcasting.spells[].concentration",
        `${spellsSansConcentration.length} sort(s) sans champ \`concentration\` (${spellsSansConcentration.join(", ")}) — ` +
        "la dérivation ne le déduit pas de `duration`, qui est une phrase.");
    }
    /* Le MODE DE RÉSOLUTION. Refusé par le lot 8 avec sa mesure, et
       l'architecte lui a donné raison : le champ est facultatif au schéma
       depuis le 2026-08-08. Un sort sans `cast_type` est émis quand même, et
       c'est le mode qui se déclare inconnu. */
    if (spellsSansCastType.length > 0) {
      underived.declare("spellcasting.spells[].castType",
        `${spellsSansCastType.length} sort(s) sans champ \`cast_type\` (${spellsSansCastType.join(", ")}) — ` +
        "refusé par le lot 8 le 2026-08-08, mesure à l'appui : cinq constructions ressemblent à une sauvegarde et " +
        "une seule est le fait, et un sort peut être génuinement attaque ET sauvegarde. Le sort est émis sans son " +
        "mode plutôt que sauté : une fiche sans sorts serait plus fausse qu'une fiche dont le mode est dit inconnu.");
    }
  }

  /* ── RESSOURCES ────────────────────────────────────────────────────
     Les dés de vie et les usages d'aptitude n'ont AUCUNE source mécanique.
     `class-progression.levels[].resources` donne bien des nombres — mais des
     clefs sans nom affichable (`sorts_mineurs: 3`), et `resolved.resources[]`
     exige un `name`. */
  resolved.resources = [];
  underived.declare("resources", "les ressources du personnage (dés de vie, usages d'aptitude) n'ont pas de champ " +
    "mécanique dans le contrat ; `class-progression.levels[].resources` porte des clefs sans nom affichable, et " +
    "`resolved.resources[].name` est obligatoire.");

  /* ── TRAITS ────────────────────────────────────────────────────────
     Le contrat §5 (GROUPE B, refusable) porte les traits d'espèce sous la
     forme `[{id, name, text}]`. Les aptitudes de CLASSE, les dons et les
     traits d'arrière-plan n'y sont pas — `class.features[]` porte de la prose
     et des tables aplaties. */
  const traits = [];
  if (speciesView && Array.isArray(speciesData.traits)) {
    for (const trait of speciesData.traits) {
      if (!trait || typeof trait.id !== "string" || typeof trait.name !== "string") {
        underived.declare("traits (espèce)", "un trait d'espèce n'a ni `id` ni `name` exploitable (contrat §5).");
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
    underived.declare("traits (espèce)", "le record d'espèce ne porte pas `traits` : le contrat §5 les attend " +
      "sous la forme `[{id, name, text}]`, et `description` est de la prose dont un parseur approximatif ferait " +
      "une fiche fausse. La couche SRD, elle, les porte depuis la réparation de l'extraction à deux colonnes.");
  }
  resolved.traits = traits;
  underived.declare("traits (classe, don, arrière-plan)", "le contrat ne porte aucun champ de trait pour les genres " +
    "`class`, `feat` et `background` : `features[].description` et `feat.description` sont de la prose.");

  resolved.gear = gear;

  /* ── ARTISANAT ─────────────────────────────────────────────────────
     Décision Q4 : les mécaniques nouvelles sont des MODULES MOTEUR activés par
     un drapeau de couche, jamais du contenu de couche. Aucun module
     d'artisanat n'existe au M2 — la collection est vide, et c'est dit. */
  resolved.craft = [];
  underived.declare("craft", "une entrée d'artisanat vient d'un module moteur activé par un drapeau (décision Q4) ; " +
    "aucun module d'artisanat n'existe au M2.");

  /* ── STATISTIQUES DÉRIVÉES DE COUCHE ───────────────────────────────
     Même raison que l'artisanat, et même forme : une statistique dérivée est
     produite par un MODULE MOTEUR activé par un drapeau (décision Q4), pas par
     le pli des couches. Le Score de Destinée en est la première — et il n'est
     PAS une fonction de la construction : deux de ses termes naissent en
     séance (la Gloire, décidée par le MJ ; le +1 de chaque Éveil arcanique
     majeur, décidé par les dés). La dérivation ne peut donc pas les inventer,
     et une reconstruction ne doit pas les effacer : ils entrent par `build`,
     comme tout ce qui doit survivre à un `rebuild`. */
  resolved.stats = [];
  underived.declare("stats", "une statistique dérivée de couche vient d'un module moteur activé par un drapeau " +
    "(décision Q4) ; aucun module n'en publie au M2. ⚠️ Le Score de Destinée n'est PAS dérivable de la seule " +
    "construction : la Gloire et les Éveils naissent en séance.");

  /* ── NOTES ─────────────────────────────────────────────────────────
     ⚠️ MESURE DU LOT 9. On aurait pu les faire entrer par des choix — sauf que
     `$defs/build.choices.items.value` plafonne une valeur de choix à 200
     caractères, et qu'une note de personnage en fait couramment plusieurs
     centaines. Les notes appartiennent donc à un verbe d'édition de la fiche
     (l'override, ou un verbe du bloc `doc`), pas à la dérivation. */
  resolved.notes = [];
  underived.declare("notes", "une note est du texte saisi à la main, pas une dérivation ; et un choix ne peut pas " +
    "la porter — `build.choices[].value` est plafonné à 200 caractères par le schéma.");

  /* ── CLASSE D'ARMURE, une fois l'équipement connu ──────────────────
     Sans armure : 10 + Dex. Avec : `ac_base` + Dex plafonné par `ac_dex_cap`,
     plus les `ac_bonus` (le bouclier — arbitrage B4 : « +2 » est un
     modificateur, pas une base). */
  const acBases = [];
  let acBonus = 0;
  let acRefused = null;
  for (const view of armorPieces) {
    const data = view.record.data || {};
    const hasBase = Number.isInteger(data.ac_base);
    const hasBonus = Number.isInteger(data.ac_bonus);
    if (!hasBase && !hasBonus) {
      acRefused = `« ${view.id} » est équipé mais son record ne porte ni \`ac_base\` ni \`ac_bonus\` (contrat §3) ; ` +
        "`armor_class` y est une phrase. Rendre 10 + Dex avec une armure sur le dos serait une fiche fausse.";
      break;
    }
    if (hasBase) acBases.push({ base: data.ac_base, cap: data.ac_dex_cap });
    if (hasBonus) acBonus += data.ac_bonus;
  }
  if (acRefused) {
    underived.declare("ac", acRefused);
  } else if (acBases.length > 1) {
    underived.declare("ac", "deux armures de base sont équipées en même temps : laquelle porte la CA n'est pas " +
      "une question que la dérivation a le droit de trancher toute seule.");
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
    grants: { chosenBy, declarations: Object.fromEntries(GRANT_ROOTS.map((root) => [root, declarations[root].data])) }
  };
}
