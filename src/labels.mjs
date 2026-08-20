/* ══ LE MÉCANISME COMMUN DES LIBELLÉS ═════════════════════════════════
   Une règle rend un identifiant et ses données ; une frontière d'affichage
   applique le paquet de mots. Ce fichier ne porte aucun bloc : il permet à
   `play`, `build` et l'adaptateur MCP de réutiliser la même loi sans créer
   une dépendance de compilation entre leurs blocs. */

export function createLabels(...packs) {
  const table = Object.assign({}, ...packs);
  function t(id, data) {
    const entry = table[id];
    if (entry === undefined) {
      throw new Error('fhpc/labels: no label for "' + id + '" — the engine names ids, a pack must carry the words');
    }
    return typeof entry === "function" ? entry(data || {}) : entry;
  }
  t.has = (id) => table[id] !== undefined;
  t.ids = () => Object.keys(table).sort();
  return t;
}

/* Les phrases de `build.validate`, déplacées ici VERBATIM. Le MCP rend ces
   phrases à un lecteur humain ; `structuredContent` garde simultanément la
   clef, les paramètres et le chemin du refus. */
export const FR_BUILD = {
  "document.invariant-violated": (d) => d.message,
  "choice.query-threw": (d) => `choix « ${d.path} » : ${d.message}`,
  "choice.ref-missing": (d) => `choix « ${d.path} » : la pile ne porte aucun ${d.kind} « ${d.id} ».`,
  "derive.threw": (d) => d.message,
  "skill-grant.count-mismatch": (d) => `« ${d.root} » fait choisir ${d.declared} compétence(s) et les choix en désignent ` +
    `${d.actual} (${d.answers}).`,
  /* LOT 72 — la clef SŒUR pour les sorts : `skill-grant.count-mismatch` dit
     « compétence(s) », et un verrou qui nomme mal ce qu'il compte est un
     mensonge de mot. Même forme, même params, l'objet change. */
  "spell-grant.count-mismatch": (d) => `« ${d.root} » fait choisir ${d.declared} sort(s) et les choix en désignent ` +
    `${d.actual} (${d.answers}).`,
  /* 2026-08-20 — la TROISIÈME sœur : `skill-grant` compte des compétences,
     `spell-grant` des sorts, celle-ci des armes. Une clef qui nomme mal ce
     qu'elle compte est un mensonge de mot, et le joueur le lit. */
  "weapon-grant.count-mismatch": (d) => `« ${d.root} » fait choisir ${d.declared} maîtrise(s) d'arme et les choix ` +
    `en désignent ${d.actual} (${d.answers}).`,
  "background.ability-key-invalid": (d) => `l'arrière-plan « ${d.backgroundId} » porte \`ability_keys\` = ${d.key}, ` +
    `qui n'est pas une clef de caractéristique (${d.abilityKeys}).`,
  "background.boost-disallowed": (d) => `le choix « ${d.path} » augmente une caractéristique que l'arrière-plan ` +
    `« ${d.backgroundId} » ne nomme pas (il nomme : ${d.abilityKeys}).`,
  /* ── LOT 43 — L'INHERITANCE : LES BONUS DE CARACS, ENFIN GARDÉS ──────
     `background.feat-mismatch` a disparu avec `background.feat` (aucun
     consommateur ne lisait ce chemin) — voir `contracts/build.md` §1b. */
  "background.boost-cap-exceeded": (d) => `le choix « ${d.path} » pose ${d.value} point(s) sur une seule ` +
    `caractéristique — le plafond est de ${d.cap} points par caractéristique.`,
  /* LOT 74 — la borne de création des scores de base (Eric, 2026-08-15) :
     elle juge le CHOIX, jamais le score résolu — un 18 boosté à 20 est légal. */
  "abilities.score-out-of-creation-range": (d) => `le choix « ${d.path} » pose ${d.value} — à la création, ` +
    `un score de base se choisit entre ${d.min} et ${d.max}.`,
  "background.boost-total-mismatch": (d) => `l'arrière-plan « ${d.backgroundId} » répartit ${d.total} point(s) ` +
    `de caractéristique au total, et il en faut exactement ${d.expected} (+2/+1 ou +1/+1/+1).`,
  "decision.kind-mismatch": (d) => `la décision « ${d.path} » attend un record de genre ${d.expectedKind}, ` +
    `pas ${d.actualKind}.`,
  "decision.option-unavailable": (d) => `la décision « ${d.path} » porte l'option « ${d.selected} », ` +
    `absente des options disponibles (${d.options}).`,
  "stat.entry-not-stat": (d) => `resolved.stats : une entrée n'est pas une statistique (${d.stat}).`,
  "stat.breakdown-missing": (d) => `resolved.stats[${d.anchor}] : aucun détail — le schéma en exige au moins un terme, ` +
    "et une statistique sans détail est exactement l'objet que cette collection existe pour remplacer.",
  "stat.term-not-integer": (d) => `resolved.stats[${d.anchor}] : le terme ${d.term} ne porte pas de valeur entière — ` +
    "un terme qui ne s'additionne pas rend le total indémontrable.",
  "stat.value-not-integer": (d) => `resolved.stats[${d.anchor}] : \`value\` vaut ${d.value} et le détail somme ` +
    `à ${d.sum} — une statistique dérivée est un entier.`,
  "stat.value-mismatch": (d) => `resolved.stats[${d.anchor}] : \`value\` vaut ${d.value}, et son détail somme à ${d.sum} ` +
    `(${d.terms}). Le schéma le dit et ne sait pas l'additionner : ` +
    "un total que son propre détail contredit est un chiffre faux qui a l'air juste.",

  /* ── LOT 34 — LA GRILLE À QUATRE PALIERS ──────────────────────────── */
  "skill-budget.option-unavailable": (d) => `le choix « ${d.path} » porte la compétence « ${d.selected} », absente ` +
    `du budget captif (${d.options}).`,
  "skill-budget.tier-invalid": (d) => `le choix « ${d.path} » porte le palier « ${d.value} », et un budget captif ` +
    "ne dépense qu'à ½ ou Plein.",
  "skill-budget.overspent": (d) => `le budget captif « ${d.path} » dépense ${d.spent} point(s) pour ${d.points} ` +
    "accordé(s) — la répartition dépasse le budget.",
  "skill-spend.option-unavailable": (d) => `le choix « ${d.path} » désigne la compétence « ${d.selected} », que la ` +
    "pile ne porte pas.",
  "skill-spend.tier-invalid": (d) => `le choix « ${d.path} » porte le palier « ${d.value} », qui n'est ni ½, ni ` +
    "Plein, ni le palier le plus haut.",
  "skill-spend.below-floor": (d) => `le choix « ${d.path} » demande le palier « ${d.value} », sous le plancher ` +
    `« ${d.floor} » déjà imposé — un palier imposé se MONTE, il ne descend pas.`,
  "skill-spend.tier-locked": (d) => `le choix « ${d.path} » achète le palier le plus haut sur « ${d.skillId} » au ` +
    `niveau ${d.level}, alors que la classe ne l'autorise qu'à partir du niveau ${d.unlockLevel}.`,

  /* ── LOT 36 — LES TRAININGS, LA TROISIÈME DÉPENSE DU POOL ─────────── */
  "skill-train.option-unavailable": (d) => `le choix « ${d.path} » désigne le training « ${d.selected} », que la ` +
    "pile ne porte pas.",
  "skill-train.value-invalid": (d) => `le choix « ${d.path} » porte la valeur « ${d.value} », qui n'est ni vrai ni ` +
    "faux — un training n'a pas de palier, sa seule valeur possible est un booléen.",
  "skill-train.level-locked": (d) => `le choix « ${d.path} » achète le training « ${d.trainingId} » au niveau ` +
    `${d.level}, alors qu'il ne s'acquiert qu'à partir du niveau ${d.unlockLevel}.`,

  /* ── LOT 37 — LES DEUX GARDES DU POOL ─────────────────────────────── */
  "skill-pool.overspent": (d) => `le pool dépense ${d.spent} point(s) pour ${d.available} disponible(s) — ` +
    `${d.over} point(s) de trop. La répartition reste possible, mais la sortie de création exige un total ` +
    "positif ou nul."
  /* ⛔ `skill-pool.no-tool` EST MORT (lot 82). Canon §B.1 : « the old "at least
     one point must go into a tool" is DEAD. It existed because tools were a
     separate budget; they are not any more. Nothing forces a tool. » */
};

const buildLabels = createLabels(FR_BUILD);

export function renderBuildViolation(violation) {
  if (!violation || typeof violation !== "object") {
    throw new TypeError("fhpc/labels: a build violation must be an object.");
  }
  return buildLabels(violation.key, violation.params);
}

/* ══ LOT 41 — LE MÊME MÉCANISME POUR `underived` ═══════════════════════
   `underived.declare(field, reason)` devenait une phrase française nue.
   Deux sources l'alimentent, et elles ne doivent JAMAIS se compiler l'une
   contre l'autre (§0.12, gardée sur les octets) : `src/build/derive.mjs`
   (et son relais `src/build/skills.mjs`) pour le SRD générique, et les
   modules `src/modules/fh/*.mjs` pour la couche Fate's Hand. Ce fichier ne
   porte donc PAS le paquet FH — celui-là vit dans `src/modules/fh/labels.mjs`,
   à côté du `FH_EN` qui y est déjà. Ce que CE fichier porte, c'est le
   MÉCANISME lui-même (validation, forme, coercition), réutilisable des deux
   côtés sans qu'aucun ne voie le paquet de l'autre — exactement ce que
   `createLabels` fait déjà pour les mots. */

const scalarUnderived = (value) => value === null || ["string", "number", "boolean"].includes(typeof value);
const validUnderivedKey = (key) => typeof key === "string" && /^[a-z][a-z0-9.:_-]{0,79}$/.test(key);

/**
 * Une entrée de `underived`, structurée. `render` est FACULTATIF et fourni
 * par l'APPELANT (jamais par ce fichier) : `derive.mjs` le lie à la table
 * générique de CE fichier, un module FH le lie à sa propre table — c'est ce
 * qui permet au `toString` non énumérable du lot 27 (`src/build/validate.mjs`)
 * de survivre au fractionnement en deux paquets sans que `src/labels.mjs`
 * importe jamais un mot de couche.
 */
export function underivedEntry(field, key, params, render) {
  if (typeof field !== "string" || field === "") {
    throw new TypeError("fhpc/labels: une entrée underived doit porter un `field` non vide.");
  }
  if (!validUnderivedKey(key)) {
    throw new TypeError(`fhpc/labels: underived key invalide : ${String(key)}.`);
  }
  if (!params || typeof params !== "object" || Array.isArray(params) || Object.values(params).some((value) => !scalarUnderived(value))) {
    throw new TypeError("fhpc/labels: les paramètres d'une entrée underived doivent être plats et scalaires.");
  }
  const entry = { field, key, params };
  if (render !== undefined) {
    if (typeof render !== "function") {
      throw new TypeError("fhpc/labels: `render` doit être une fonction ou absent.");
    }
    Object.defineProperty(entry, "toString", { enumerable: false, value() { return render(entry); } });
  }
  return entry;
}

/** `entry.field`/`entry.key`/`entry.params` restent une donnée sérialisable ;
 *  ceci l'applique contre UNE table (`createLabels(...)`) — jamais fixée ici,
 *  pour que chaque domaine choisisse la sienne (voir l'en-tête). */
export function renderUnderived(entry, labels) {
  if (!entry || typeof entry !== "object") {
    throw new TypeError("fhpc/labels: une entrée underived doit être un objet.");
  }
  return labels(entry.key, entry.params);
}

/* Le paquet FRANÇAIS des 55 clefs génériques (`src/build/derive.mjs` +
   `src/build/skills.mjs`, 58 sites — voir INVENTAIRE-LOT-41.md pour le
   groupement). Chaque mot rend, AU CARACTÈRE PRÈS, la phrase historique du
   site qu'il remplace — c'est le test §4.1/§4.4 de la commande. */
export const FR_UNDERIVED = {
  "underived.lineage-not-composed": () =>
    "le lignage est un choix, pas un record : le recoller au nom de l'espèce (« Elfe (haut-elfe) ») " +
    "reviendrait à composer un mot affichable dans le moteur (loi §0.13). La composition appartient à l'interface.",
  "underived.species-missing-size-key": () =>
    "le record d'espèce ne porte pas `size_key` (contrat §3, genre `species`) ; `data.size` est une phrase " +
    "(« M (moyenne, entre 1,50 m et 1,80 m) »), pas une clef.",
  "underived.no-choice": (d) => `aucun choix \`${d.root}\`.`,
  "underived.progression-field-missing-at-level": (d) =>
    `la table de progression de « ${d.classId} » ne donne pas de \`${d.field}\` au niveau ${d.level}.`,
  "underived.no-progression-record": (d) =>
    `aucun record \`class-progression\` ne pointe la classe « ${d.classId} » (\`data.class\`).`,
  "underived.choice-not-ref": (d) => `le choix « ${d.path} » porte une valeur, pas un \`ref\` vers un record.`,
  "underived.gear-line-incomplete": (d) =>
    `${d.missing} manque(nt) — la quantité et le port sont des décisions du joueur, ` +
    "et « 1, non équipé » serait un défaut inventé.",
  "underived.no-gear-choices": () =>
    "aucun choix `gear[n]` n'a produit de ligne d'équipement — l'équipement de départ est un CHOIX du joueur, " +
    "pas une dérivation (contrat §6, hors périmètre du M2).",
  "underived.weight-is-phrase": () =>
    "le poids d'un objet est une phrase dans la source (« 0,5 kg ») et le contrat ne nomme aucun champ " +
    "mécanique de masse — on ne parse pas la prose.",
  "underived.currency-incomplete": (d) =>
    `${d.missing} — une bourse vide s'écrit en zéros SI on les a choisis ; on ne les invente pas ` +
    "(contrat §6 : le montant de départ est un choix).",
  "underived.class-missing-hit-die": () =>
    "le record de classe ne porte pas `hit_die` (contrat §3) ; `hit_point_die` est une phrase " +
    "(« d6 par niveau de Magicien »), et on ne parse pas la prose.",
  "underived.hp-progression-unsupported": (d) =>
    `le personnage est de niveau ${d.level} : la progression des points de vie au-delà du niveau 1 n'est ` +
    "portée par aucun champ mécanique du contrat.",
  "underived.no-distance-unit": (d) =>
    `le document ne dit pas son unité de distance (\`units.distance\` = ${d.distanceUnit}) : la couche porte ` +
    "`speed_m` OU `speed_ft`, et choisir pour elle serait deviner.",
  "underived.species-missing-speed-field": (d) =>
    `le record d'espèce ne porte pas \`${d.speedField}\` en entier (contrat §3) ; \`data.speed\` est une phrase (« 9 m »).`,
  "underived.senses-entry-invalid": () => "une entrée de `senses` n'a ni `id` ni `name` exploitable (contrat §5).",
  "underived.senses-missing-range-field": (d) =>
    `l'entrée ne porte pas \`${d.rangeField}\` en entier, et \`resolved.senses[].value\` est obligatoire.`,
  "underived.no-distance-unit-short": (d) =>
    `le document ne dit pas son unité de distance (\`units.distance\` = ${d.distanceUnit}).`,
  "underived.species-no-senses": () =>
    "le record d'espèce ne porte pas de `senses` — trois espèces sur neuf n'en ont aucun, et c'est un fait, pas un trou.",
  "underived.passive-perception-unnamed": () =>
    "la perception passive se calcule (10 + le bonus de la compétence correspondante) mais son NOM ne vit dans " +
    "aucun record — ce n'est pas un sens d'espèce, c'est une ligne de fiche, et l'interface la nomme.",
  "underived.no-language-genre": () =>
    "aucun genre `language` parmi les 14 genres de couche : un slug de langue (`languages[0] = \"draconique\"`) " +
    "ne se résout contre rien, et son nom affichable n'existe nulle part.",
  "underived.proficiency-not-derived-saves": () =>
    "le bonus de maîtrise n'a pas été dérivé : un jet de sauvegarde maîtrisé sans lui vaudrait le jet non " +
    "maîtrisé, en silence.",
  "underived.class-missing-saving-throw-keys": () =>
    "le record de classe ne porte pas `saving_throw_keys` (contrat §3) ; `saving_throw_proficiencies` n'y donne " +
    "que des noms affichables, et le moteur ne les traduit pas en clefs.",
  "underived.background-missing-skill-ids": () =>
    "le record d'arrière-plan ne porte pas `skill_ids` (contrat §3) ; `skill_proficiencies` y donne des noms affichables.",
  "underived.background-grants-unknown-skill": (d) =>
    `l'arrière-plan accorde la compétence « ${d.recordId} », que la pile ne porte pas.`,
  "underived.skill-declaration-unreadable": (d) =>
    `« ${d.recordId} » porte un \`${d.field}\` que la dérivation ne sait pas lire : la forme attendue est ` +
    "`{count, from}` (contrat §3/§5).",
  "underived.no-usable-skills": () =>
    "la pile ne porte aucune compétence exploitable — le genre `skill` est vide ou ses records n'ont pas de `ability_key`.",
  "underived.proficiency-not-derived-skills": () =>
    "le bonus de maîtrise n'a pas été dérivé : rendre dix-huit compétences dont les maîtrisées valent comme les " +
    "autres serait une fiche fausse et jouable.",
  "underived.background-tool-choice-unanswered": () =>
    "l'arrière-plan demande de CHOISIR un outil (`tool_choice`, arbitrage B2) et aucun choix sous " +
    "`background.*` ne désigne un record `tool`.",
  "underived.background-missing-tool-field": () =>
    "le record d'arrière-plan ne porte ni `tool_id` ni `tool_choice` (contrat §3) ; `tool_proficiency` y est une phrase.",
  "underived.tool-missing-ability-key": () =>
    "le record d'outil ne porte pas `ability_key` — ⚠️ CE CHAMP N'EST PAS DANS LE CONTRAT (question 3 à " +
    "l'architecte) ; `data.ability` y est un mot affichable, et `resolved.tools[].ability` exige une clef.",
  "underived.tool-missing-ability-key-pool": () =>
    "le record d'outil acheté au pool ne porte pas `ability_key` — même trou que l'outil d'arrière-plan " +
    "(question 3 à l'architecte).",
  "underived.proficiency-not-derived-tools": () => "le bonus de maîtrise n'a pas été dérivé.",
  "underived.no-tool-granted": () => "aucune maîtrise d'outil accordée par les choix.",
  "underived.no-action-genre": () =>
    "aucun genre `action` parmi les 14 ; composer une attaque depuis une arme demande une règle (Finesse, " +
    "Lancer) que le contrat ne porte pas, et `weapon.properties` est une phrase.",
  "underived.class-missing-spellcasting-key": () =>
    "le record de classe ne porte pas `spellcasting_ability_key` — ⚠️ CE CHAMP N'EST PAS DANS LE CONTRAT " +
    "(question 3) ; `primary_ability` y est un mot affichable, et la caractéristique primaire d'une classe " +
    "n'est de toute façon pas toujours sa caractéristique d'incantation.",
  "underived.proficiency-not-derived-spellcasting": () =>
    "le bonus de maîtrise n'a pas été dérivé : le DD et le bonus d'attaque en dépendent.",
  "underived.progression-missing-spell-slots": (d) =>
    `la table de progression de « ${d.classId} » ne porte pas \`spell_slots\` au niveau demandé — la magie de ` +
    "pacte vit un cran plus bas, en scalaire (schéma, `slotsRecharge`).",
  "underived.spell-record-invalid": () => "le record de sort n'a ni `slug` ni `level` exploitable.",
  "underived.spell-text-too-long": (d) =>
    `la description fait ${d.length} caractères et le schéma en accepte ${d.max} ; tronquer un texte de règle ` +
    "serait un mensonge silencieux.",
  "underived.spell-missing-description": () => "le record de sort ne porte pas de `description`.",
  "underived.no-spell-choices": () =>
    "aucun choix ne désigne de record `spell` — un lanceur sans sort est une liste vide, pas une liste devinée.",
  "underived.spell-damage-unstructured": () =>
    "les dégâts d'un sort ne sont structurés nulle part dans la source : ni dé, ni type, ni progression par " +
    "niveau d'emplacement. Ils ne vivent que dans `description`, en prose, et on ne parse pas la prose.",
  "underived.spells-missing-concentration": (d) =>
    `${d.count} sort(s) sans champ \`concentration\` (${d.ids}) — la dérivation ne le déduit pas de \`duration\`, ` +
    "qui est une phrase.",
  "underived.spells-missing-cast-type": (d) =>
    `${d.count} sort(s) sans champ \`cast_type\` (${d.ids}) — refusé par le lot 8 le 2026-08-08, mesure à ` +
    "l'appui : cinq constructions ressemblent à une sauvegarde et une seule est le fait, et un sort peut être " +
    "génuinement attaque ET sauvegarde. Le sort est émis sans son mode plutôt que sauté : une fiche sans sorts " +
    "serait plus fausse qu'une fiche dont le mode est dit inconnu.",
  "underived.no-resources-field": () =>
    "les ressources du personnage (dés de vie, usages d'aptitude) n'ont pas de champ mécanique dans le contrat ; " +
    "`class-progression.levels[].resources` porte des clefs sans nom affichable, et `resolved.resources[].name` " +
    "est obligatoire.",
  "underived.trait-entry-invalid": () => "un trait d'espèce n'a ni `id` ni `name` exploitable (contrat §5).",
  /* 2026-08-20 — une arme choisie porte le NOM de sa maîtrise, et la pile ne
     porte pas le record qui la définit. La fiche garde le nom (« Topple ») ;
     ce qu'elle ne peut pas dire, c'est ce qu'il FAIT. Cas réel jusqu'à ce
     matin : le genre `weapon-mastery` n'existait pas. */
  "underived.weapon-mastery-text-missing": () =>
    "une maîtrise d'arme choisie n'a que son nom : la pile ne porte pas le genre `weapon-mastery` " +
    "qui la définit. La fiche l'affiche sans son effet.",
  "underived.species-missing-traits": () =>
    "le record d'espèce ne porte pas `traits` : le contrat §5 les attend sous la forme `[{id, name, text}]`, et " +
    "`description` est de la prose dont un parseur approximatif ferait une fiche fausse. La couche SRD, elle, " +
    "les porte depuis la réparation de l'extraction à deux colonnes.",
  "underived.no-trait-field-for-class-feat-background": () =>
    "le contrat ne porte aucun champ de trait pour les genres `class`, `feat` et `background` : " +
    "`features[].description` et `feat.description` sont de la prose.",
  "underived.no-craft-module": () =>
    "une entrée d'artisanat vient d'un module moteur activé par un drapeau (décision Q4) ; aucun module " +
    "d'artisanat n'existe au M2.",
  "underived.no-active-stat-module": (d) =>
    "aucun module de statistique actif n'a publié d'entrée : une statistique dérivée vient d'un module moteur " +
    `activé par un drapeau de couche (décision Q4). Drapeaux levés par la pile : ${d.raisedFlags || "aucun"}. ` +
    `Drapeaux servis par les modules injectés : ${d.servedFlags || "aucun"}.`,
  "underived.notes-not-derivable": () =>
    "une note est du texte saisi à la main, pas une dérivation ; et un choix ne peut pas la porter — " +
    "`build.choices[].value` est plafonné à 200 caractères par le schéma.",
  "underived.armor-missing-ac-fields": (d) =>
    `« ${d.armorId} » est équipé mais son record ne porte ni \`ac_base\` ni \`ac_bonus\` (contrat §3) ; ` +
    "`armor_class` y est une phrase. Rendre 10 + Dex avec une armure sur le dos serait une fiche fausse.",
  "underived.ac-ambiguous-multiple-armor": () =>
    "deux armures de base sont équipées en même temps : laquelle porte la CA n'est pas une question que la " +
    "dérivation a le droit de trancher toute seule.",
  "underived.skill-missing-slug": () =>
    "le record de compétence ne porte pas de `slug`, et `resolved.skills[].id` en est l'ancre d'override.",
  "underived.skill-missing-ability-key": () =>
    "le record ne porte pas de `ability_key` — la caractéristique d'une compétence est un identifiant, jamais " +
    "le mot affichable de `data.ability` (contrat §3, genre `skill`)."
};

/* Le paquet ANGLAIS — même jeu de clefs, gardé par
   `tests/underived-labels.test.mjs` (§4.1/§4.3 de la commande). Ce n'est pas
   une traduction mot à mot : c'est la MÊME raison, dans l'autre langue. */
export const EN_UNDERIVED = {
  "underived.lineage-not-composed": () =>
    "lineage is a player choice, not a record: gluing it onto the species name (\"Elf (High Elf)\") would " +
    "compose a display word inside the engine (law §0.13). Composition belongs to the interface.",
  "underived.species-missing-size-key": () =>
    "the species record carries no `size_key` (contract §3, genre `species`); `data.size` is a phrase " +
    "(\"M (Medium, 5 to 6 feet tall)\"), not a key.",
  "underived.no-choice": (d) => `no \`${d.root}\` choice.`,
  "underived.progression-field-missing-at-level": (d) =>
    `the progression table of "${d.classId}" carries no \`${d.field}\` at level ${d.level}.`,
  "underived.no-progression-record": (d) =>
    `no \`class-progression\` record points at the class "${d.classId}" (\`data.class\`).`,
  "underived.choice-not-ref": (d) => `the choice "${d.path}" carries a value, not a \`ref\` to a record.`,
  "underived.gear-line-incomplete": (d) =>
    `${d.missing} missing — quantity and whether it's equipped are player decisions, and "1, not equipped" ` +
    "would be an invented default.",
  "underived.no-gear-choices": () =>
    "no `gear[n]` choice produced an equipment line — starting gear is a player CHOICE, not a derivation " +
    "(contract §6, out of scope for M2).",
  "underived.weight-is-phrase": () =>
    "an item's weight is a phrase in the source (\"0.5 kg\") and the contract names no mechanical mass field — " +
    "prose is not parsed.",
  "underived.currency-incomplete": (d) =>
    `${d.missing} — an empty purse is written as zeros IF they were chosen; they are not invented ` +
    "(contract §6: the starting amount is a choice).",
  "underived.class-missing-hit-die": () =>
    "the class record carries no `hit_die` (contract §3); `hit_point_die` is a phrase (\"d6 per Wizard level\"), " +
    "and prose is not parsed.",
  "underived.hp-progression-unsupported": (d) =>
    `the character is level ${d.level}: hit point progression beyond level 1 is carried by no mechanical field ` +
    "of the contract.",
  "underived.no-distance-unit": (d) =>
    `the document does not say its distance unit (\`units.distance\` = ${d.distanceUnit}): the layer carries ` +
    "`speed_m` OR `speed_ft`, and choosing for it would be guessing.",
  "underived.species-missing-speed-field": (d) =>
    `the species record carries no whole-number \`${d.speedField}\` (contract §3); \`data.speed\` is a phrase ("9 m").`,
  "underived.senses-entry-invalid": () => "a `senses` entry has neither a usable `id` nor `name` (contract §5).",
  "underived.senses-missing-range-field": (d) =>
    `the entry carries no whole-number \`${d.rangeField}\`, and \`resolved.senses[].value\` is required.`,
  "underived.no-distance-unit-short": (d) =>
    `the document does not say its distance unit (\`units.distance\` = ${d.distanceUnit}).`,
  "underived.species-no-senses": () =>
    "the species record carries no `senses` — three of nine species have none, and that is a fact, not a gap.",
  "underived.passive-perception-unnamed": () =>
    "passive perception is computable (10 + the matching skill's bonus) but no record carries a NAME for it — " +
    "it is not a species sense, it is a sheet line, and the interface names it.",
  "underived.no-language-genre": () =>
    "no `language` genre among the 14 layer genres: a language slug (`languages[0] = \"draconic\"`) resolves " +
    "against nothing, and its display name exists nowhere.",
  "underived.proficiency-not-derived-saves": () =>
    "the proficiency bonus was not derived: a proficient saving throw without it would silently equal the " +
    "non-proficient roll.",
  "underived.class-missing-saving-throw-keys": () =>
    "the class record carries no `saving_throw_keys` (contract §3); `saving_throw_proficiencies` there only " +
    "gives display names, and the engine does not translate them into keys.",
  "underived.background-missing-skill-ids": () =>
    "the background record carries no `skill_ids` (contract §3); `skill_proficiencies` there gives display names.",
  "underived.background-grants-unknown-skill": (d) =>
    `the background grants the skill "${d.recordId}", which the stack does not carry.`,
  "underived.skill-declaration-unreadable": (d) =>
    `"${d.recordId}" carries a \`${d.field}\` the derivation cannot read: the expected shape is \`{count, from}\` ` +
    "(contract §3/§5).",
  "underived.no-usable-skills": () =>
    "the stack carries no usable skill — the `skill` genre is empty, or its records carry no `ability_key`.",
  "underived.proficiency-not-derived-skills": () =>
    "the proficiency bonus was not derived: rendering eighteen skills where the proficient ones equal the " +
    "others would be a false, playable sheet.",
  "underived.background-tool-choice-unanswered": () =>
    "the background asks the player to CHOOSE a tool (`tool_choice`, ruling B2) and no choice under " +
    "`background.*` designates a `tool` record.",
  "underived.background-missing-tool-field": () =>
    "the background record carries neither `tool_id` nor `tool_choice` (contract §3); `tool_proficiency` there is a phrase.",
  "underived.tool-missing-ability-key": () =>
    "the tool record carries no `ability_key` — ⚠️ THIS FIELD IS NOT IN THE CONTRACT (question 3 to the " +
    "architect); `data.ability` there is a display word, and `resolved.tools[].ability` requires a key.",
  "underived.tool-missing-ability-key-pool": () =>
    "the tool record bought from the pool carries no `ability_key` — same gap as the background's tool " +
    "(question 3 to the architect).",
  "underived.proficiency-not-derived-tools": () => "the proficiency bonus was not derived.",
  "underived.no-tool-granted": () => "no tool proficiency was granted by the choices.",
  "underived.no-action-genre": () =>
    "no `action` genre among the 14; composing an attack from a weapon needs a rule (Finesse, Thrown) the " +
    "contract does not carry, and `weapon.properties` is a phrase.",
  "underived.class-missing-spellcasting-key": () =>
    "the class record carries no `spellcasting_ability_key` — ⚠️ THIS FIELD IS NOT IN THE CONTRACT (question 3); " +
    "`primary_ability` there is a display word, and a class's primary ability is not always its spellcasting " +
    "ability anyway.",
  "underived.proficiency-not-derived-spellcasting": () =>
    "the proficiency bonus was not derived: the save DC and attack bonus depend on it.",
  "underived.progression-missing-spell-slots": (d) =>
    `the progression table of "${d.classId}" carries no \`spell_slots\` at the requested level — pact magic ` +
    "lives one level down, as a scalar (schema, `slotsRecharge`).",
  "underived.spell-record-invalid": () => "the spell record has neither a usable `slug` nor `level`.",
  "underived.spell-text-too-long": (d) =>
    `the description is ${d.length} characters and the schema accepts ${d.max}; truncating a rules text would ` +
    "be a silent lie.",
  "underived.spell-missing-description": () => "the spell record carries no `description`.",
  "underived.no-spell-choices": () =>
    "no choice designates a `spell` record — a caster with no spell is an empty list, not a guessed one.",
  "underived.spell-damage-unstructured": () =>
    "a spell's damage is structured nowhere in the source: no die, no type, no per-slot-level progression. It " +
    "only lives in `description`, as prose, and prose is not parsed.",
  "underived.spells-missing-concentration": (d) =>
    `${d.count} spell(s) with no \`concentration\` field (${d.ids}) — the derivation does not infer it from ` +
    "`duration`, which is a phrase.",
  "underived.spells-missing-cast-type": (d) =>
    `${d.count} spell(s) with no \`cast_type\` field (${d.ids}) — refused by lot 8 on 2026-08-08, with a ` +
    "measurement to back it: five constructions look like a saving throw and only one is the fact, and a spell " +
    "can genuinely be both an attack AND a save. The spell is emitted without its mode rather than dropped: a " +
    "sheet with no spells would be more false than a sheet whose mode is said to be unknown.",
  "underived.no-resources-field": () =>
    "the character's resources (hit dice, feature uses) carry no mechanical field in the contract; " +
    "`class-progression.levels[].resources` carries keys with no display name, and `resolved.resources[].name` " +
    "is required.",
  "underived.trait-entry-invalid": () => "a species trait has neither a usable `id` nor `name` (contract §5).",
  /* 2026-08-20 — voir la sœur française : l'arme choisie garde le NOM de sa
     maîtrise, la pile ne porte pas le record qui la définit. */
  "underived.weapon-mastery-text-missing": () =>
    "a chosen weapon mastery carries only its name: the stack has no `weapon-mastery` genre to define it. " +
    "The sheet shows it without its effect.",
  "underived.species-missing-traits": () =>
    "the species record carries no `traits`: contract §5 expects them as `[{id, name, text}]`, and " +
    "`description` is prose an approximate parser would turn into a false sheet. The SRD layer, itself, has " +
    "carried them since the two-column extraction was repaired.",
  "underived.no-trait-field-for-class-feat-background": () =>
    "the contract carries no trait field for the `class`, `feat` and `background` genres: " +
    "`features[].description` and `feat.description` are prose.",
  "underived.no-craft-module": () =>
    "a crafting entry comes from an engine module gated by a flag (decision Q4); no crafting module exists at M2.",
  "underived.no-active-stat-module": (d) =>
    "no active stat module published an entry: a derived stat comes from an engine module gated by a layer " +
    `flag (decision Q4). Flags raised by the stack: ${d.raisedFlags || "none"}. Flags served by the injected ` +
    `modules: ${d.servedFlags || "none"}.`,
  "underived.notes-not-derivable": () =>
    "a note is hand-typed text, not a derivation; and a choice cannot carry it — `build.choices[].value` is " +
    "capped at 200 characters by the schema.",
  "underived.armor-missing-ac-fields": (d) =>
    `"${d.armorId}" is equipped but its record carries neither \`ac_base\` nor \`ac_bonus\` (contract §3); ` +
    "`armor_class` there is a phrase. Rendering 10 + Dex with armor worn would be a false sheet.",
  "underived.ac-ambiguous-multiple-armor": () =>
    "two base armors are equipped at once: which one carries the AC is not a question the derivation has the " +
    "right to settle on its own.",
  "underived.skill-missing-slug": () =>
    "the skill record carries no `slug`, and `resolved.skills[].id` is its override anchor.",
  "underived.skill-missing-ability-key": () =>
    "the record carries no `ability_key` — a skill's ability is an identifier, never the display word of " +
    "`data.ability` (contract §3, genre `skill`)."
};
