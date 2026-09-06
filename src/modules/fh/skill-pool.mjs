/* ══ LE POOL DE POINTS DE COMPÉTENCE — LE MODULE QUI LE PUBLIE ════════
   Lot 23-pool-competences. Deuxième consommateur de `resolved.stats[]`, après
   le Score de Destinée (lot 19), et il suit exactement le même chemin.

   ── L'ARBITRAGE QUI DONNE SA FORME À CE FICHIER ──────────────────────
   Le lot 22 a REFUSÉ de construire cette dérivation, et il a eu raison : la
   commande annonçait `build.budgets` comme sa destination, et ce champ n'a
   aucun chemin d'écriture (`required` au schéma, `grep -rn budgets src/` →
   rien, et l'invariant 4 interdit à une reconstruction d'écrire `build`).
   L'arbitrage rendu le 2026-08-09 est au contrat, §« Où vit un POOL DE
   POINTS » : *un pool de points dérivé se publie dans `resolved.stats[]`, par
   un module à drapeau — jamais dans `build.budgets`*.

   L'argument qui tranche est le BARDE : son pool change à CHAQUE niveau. Un
   nombre qui se recalcule à chaque niveau n'est pas une donnée d'entrée, c'est
   une dérivation. ⛔ Ce fichier n'écrit donc rien dans `build`, et il n'a aucun
   moyen de le faire : un module rend `{stat, underived, consumed}`, rien d'autre
   n'est recopié.

   ── CE QUE CE MODULE PUBLIE, ET CE QU'IL NE PUBLIE PAS ───────────────
   Il publie CE DONT LE JOUEUR DISPOSE. Il ne calcule PAS la dépense (quelle
   compétence à quel palier) : c'est de l'interface et du bloc `build`, plus
   tard. `expertise_from_level` et les coûts `half`/`proficient`/`expertise`
   sont lus par personne ici — seul `imposed` sert, parce qu'un imposé se
   DÉDUIT du pool et change donc le nombre publié.

   ── LES TERMES, ET LA SOURCE DE CHACUN ───────────────────────────────
   AUCUN NOMBRE N'EST ÉCRIT DANS CE FICHIER. Tous vivent dans des records —
   c'est exactement ce que `stats[]` existe pour rendre possible, et le lot 20
   s'est fait prendre sur ce point.

     1. LE POOL DE CLASSE — `data[fh_skill_pool].base` du record de classe,
        atteint par `refs` (la classe est hors du namespace de ce module).
        18 pour le Roublard, 16 pour le Barde, 14 pour Druide/Moine/Rôdeur,
        12 pour les huit autres. ARRIÈRE-PLAN INCLUS (décision d'Eric,
        point 9) : il n'y a pas de conversion à ajouter par-dessus.
     2. LES PALIERS TRAVERSÉS — `by_level`, cumulé sur les niveaux ≤ niveau
        courant, UNE LIGNE PAR PALIER. Voir la règle Q15-8 plus bas.
     3. LES BUMPS D'ESPÈCE — `data.skill_points.by_level` du record d'espèce.
        Araag et Elestu portent `Fast Learner` (+2 aux niveaux 1, 3 et 6),
        l'Humain porte `Educated` (+2 au niveau 1 seulement). Le libellé EST
        le nom du trait, recopié du record.
     4. LES CHOIX IMPOSÉS, DÉDUITS — règle d'Eric du 2026-08-08 : « un choix
        imposé ne pose plus 2 points (compétent), il pose 1 point
        (demi-compétence), et ce point se déduit du pool à répartir. Idem pour
        les outils imposés. » Le 1 n'est pas écrit ici : c'est
        `fh_skill_pool.tier_costs.imposed`, lu sur le record de classe.
     5. LE DON D'ORIGINE (lot 24) — `data.skill_points.bonus` sur un record de
        `feat`, tendu par `refs` comme le fait déjà `destiny-stat.mjs` (même
        canal, même raison : le don vit sous `background.originFeat[n]`, hors
        du namespace de ce module). MÊME CHAMP que le bump d'espèce
        (`skill_points`) — la FORME distingue les genres, exactement comme
        `data.destiny` sert `{base}` à une espèce et `{bonus}` à un don. Un
        seul don du SRD le porte aujourd'hui : `Skilled`, à parité SRD
        (3 proficiencies × `tier_costs.adept` = 6).
     6. LE GRANT D'ESPÈCE, EN NET ZÉRO (lot 24, arbitrage d'Eric du
        2026-08-09) — `data.granted_skill_choice` (Araag, Elestu, Elf) SE
        RAJOUTE au pool PUIS SE PLACE au coût d'un imposé : deux lignes, un
        total inchangé. Ça remplace la déclaration que le lot 23 posait sur ce
        champ — la question qu'elle nommait est tranchée.

   📌 LE TOTAL PUBLIÉ EST CE QUI RESTE À RÉPARTIR, pas le pool brut. Un
   Roublard niveau 1 a un POOL DE CLASSE de 18 et publie 11 (4 imposés de
   classe, 2 compétences et 1 outil d'arrière-plan). ⚠️ MESURE QUI LE CONFIRME,
   et elle est indépendante : Eric chiffre le résultat attendu de sa propre
   réforme à « environ 2 points libres à 7–10 » (vault, § « Plus de compétences,
   plus de points »). Magicien 12−5 = 7, Druide 14−5 = 9, Roublard 18−7 = 11.
   Un module qui publierait 18 ne dirait rien de ce que le joueur peut dépenser.

   ── ⚠️ LA RÈGLE Q15-8 D'ERIC, ET C'EST LE PIÈGE DU LOT ────────────────
   « Un personnage créé à un niveau donné reçoit les paliers qu'il a TRAVERSÉS.
   Créé au niveau 5 : il a le palier 1 ET le palier 3 — pas celui du niveau 6. »

   « À la création » ne veut donc PAS dire « au niveau 1 ». Un barde créé
   directement au niveau 5 porte les paliers 2, 3, 4 et 5 — quatre lignes
   distinctes dans le détail, pour que l'absence du palier 6 SE VOIE. Un terme
   unique « paliers traversés : +6 » serait juste et indémontrable, et le bon
   nombre obtenu de la mauvaise façon passerait sans rougir.

   ⚠️ ET L'ARITHMÉTIQUE DU BARDE N'EST PAS ÉCRITE ICI. La couche a déjà fusionné
   son +1 par niveau avec le +2 universel des niveaux 4/8/12/16/20 : elle donne
   `{"2":1,"3":1,"4":3,…}`. Ce module LIT le champ, il ne le recompose pas —
   « +2 tous les 4 niveaux » écrit dans le moteur serait une règle de jeu dans
   le moteur, exactement ce que le lot 22 a refusé d'y mettre.

   ── LES DEUX MANQUES, ET POURQUOI ILS NE SE RESSEMBLENT PAS ──────────
   La distinction est celle que `records(kind)` SANS id rend possible, et elle
   est le cœur de la loi §0.5 pour ce module :

     · AUCUNE classe de la pile ne porte `fh_skill_pool` → la couche des
       compétences n'est pas montée. Le pool se DÉCLARE, et rien n'est publié.
     · D'AUTRES classes en portent un et PAS celle-ci → le record est amputé
       ou vient d'une couche tierce. Ça JETTE : un pool absent d'une seule
       classe est du contenu faux, pas un contenu qui manque.

   ⛔ ET RIEN N'EST PUBLIÉ SANS SON POOL DE CLASSE. Un personnage araag dont la
   couche des compétences n'est pas montée aurait un détail non vide (ses bumps
   d'espèce vivent dans une AUTRE couche) : publier « Skill Points : 4 » serait
   un nombre qui ressemble à un pool et n'en est pas un. La ligne 1 est donc la
   condition de publication, et son absence est une déclaration. */

import { createLabels } from "../../play/labels.mjs";
import { FH_EN, FH_UNDERIVED_FR } from "./labels.mjs";
/* LOT 34 — `buildViolation` est un CONSTRUCTEUR GÉNÉRIQUE (lot 27), pas une
   règle : `{key, params, path?}`, la même forme partout dans le dépôt (voir
   `decisions.mjs`). Ce module l'utilise pour rendre un refus keyé sur un
   choix de dépense qu'il est le SEUL à pouvoir juger — `src/build/` n'a pas
   le droit de connaître le nom de son propre pool (§0.12, mesuré :
   `tests/fh-skill-pool.test.mjs`, ACCEPTATION 4). L'import va du module vers
   `src/build/`, jamais l'inverse : c'est le sens que la loi autorise déjà
   (`derive.mjs` n'importe rien d'ici). LOT 41 : `underivedEntry`/`renderUnderived`
   suivent exactement le même sens — ce module en a déjà l'habitude. */
import { buildViolation } from "../../build/validate.mjs";
import { traitsDeLEspece } from "./traits.mjs";
import { underivedEntry, renderUnderived } from "../../labels.mjs";

const t = createLabels(FH_EN);
const frUnderivedFh = createLabels(FH_UNDERIVED_FR);
const declareUnderived = (field, key, params) =>
  underivedEntry(field, key, params || {}, (entry) => renderUnderived(entry, frUnderivedFh));

/** Le drapeau qui allume ce module. Levé par `layers/fh-skills-en.layer.json`. */
export const FH_SKILLS_FLAG = "fh.skills";

/** L'ancre de l'entrée dans `resolved.stats[]`.
 *
 *  ⚠️ PAS DE POINT, ET C'EST MESURÉ — le lot 19 a payé ce piège. `stats[].id`
 *  est un `$defs/slug` (`^[a-z][a-z0-9:_-]{0,79}$`) : le point y est refusé, et
 *  il l'est aussi dans le sélecteur d'un chemin d'override. Le deux-points est
 *  le séparateur de namespace du dépôt, le tiret est admis des deux côtés. Un
 *  MJ écrit donc `resolved.stats[fh:skill-points].value`.
 *
 *  ⚠️ Et ce n'est PAS la clef `fh.skillPoints` du `$comment` de `build.budgets`,
 *  que le lot 22 a mesurée comme non conforme à sa propre grammaire (majuscule
 *  refusée par `$defs/flag`). Cette clef-là n'a plus de destination : le pool
 *  ne va pas dans `budgets`. */
export const FH_SKILL_POOL_ID = "fh:skill-points";

/** Le champ que la couche des compétences pose sur les douze records de classe
 *  (lot 22). La convention est celle de `data.destiny` sur les espèces : un
 *  namespace, puis des noms de termes. */
const POOL_FIELD = "fh_skill_pool";

/** Le champ que la couche des espèces pose sur les trois espèces qui donnent
 *  des points — `{trait, by_level}`. Le `trait` est l'id du trait qui les
 *  accorde, et c'est SON nom qui libelle la ligne. */
const SPECIES_FIELD = "skill_points";

/** Le chemin de choix qui désigne la classe, et celui qui désigne
 *  l'arrière-plan. Ce sont ceux du pli (`takeRef("class")`,
 *  `takeRef("background")`), pas une convention inventée ici : un document qui
 *  porterait un `ref` de genre `class` sous un AUTRE chemin ne désigne pas la
 *  classe du personnage, et la compter serait un pool faux. */
const CLASS_PATH = "class";
const BACKGROUND_PATH = "background";

const MAX_LEVEL = 20;

function fail(what) {
  throw new Error(`fhpc/fh: ${what}`);
}

/* ── UN `by_level`, LU ET CUMULÉ SUR LES NIVEAUX TRAVERSÉS ────────────
   Rend la liste `[{level, gain}]` des paliers de niveau ≤ `level`, en ordre de
   niveau. Le même lecteur sert la classe et l'espèce : les deux portent la même
   forme, et en écrire deux les ferait diverger.

   ⚠️ TOUT ÉCART DE FORME JETTE (loi §0.5). Un `by_level` malformé, c'est un
   personnage dont le pool est plus petit que la règle ne le dit, sans un mot.
   `who` nomme le record fautif dans le refus. */
function traversedTiers(byLevel, level, who, field) {
  if (byLevel === undefined) return [];
  if (byLevel === null || typeof byLevel !== "object" || Array.isArray(byLevel)) {
    fail(`the record "${who}" carries \`${field}\` = ${JSON.stringify(byLevel)}, which is not a table of ` +
      "`{level: gain}` — the skill pool progression is enumerated level by level, and a malformed table " +
      "would silently cost the character every tier it holds.");
  }
  const tiers = [];
  for (const key of Object.keys(byLevel)) {
    if (!/^[0-9]+$/.test(key)) {
      fail(`the record "${who}" carries \`${field}\` with the key ${JSON.stringify(key)}, which is not a level — ` +
        "the table is read as `{level: gain}`, and a key the engine cannot compare to the character's level " +
        "is a tier it would drop without a word.");
    }
    const tierLevel = Number(key);
    if (tierLevel < 1 || tierLevel > MAX_LEVEL) {
      fail(`the record "${who}" carries \`${field}\` with the level ${tierLevel}, outside 1–${MAX_LEVEL}.`);
    }
    const gain = byLevel[key];
    if (!Number.isInteger(gain)) {
      fail(`the record "${who}" carries \`${field}["${key}"]\` = ${JSON.stringify(gain)}, which is not a whole ` +
        "number of skill points. A gain the engine cannot add is bad content, not a tier to skip.");
    }
    /* ⚠️ LA RÈGLE Q15-8, ET C'EST LA SEULE LIGNE QUI LA PORTE. `<=`, pas `===` :
       un personnage créé au niveau 5 a TRAVERSÉ les paliers 2, 3, 4 et 5. Un
       `===` ne lui donnerait que le dernier, et le pool serait faux de tous
       les autres — pour un barde niveau 5, faux de 5 points sur 6. */
    if (tierLevel <= level) tiers.push({ level: tierLevel, gain });
  }
  return tiers.sort((a, b) => a.level - b.level);
}

/* ── LE POOL DE CLASSE ────────────────────────────────────────────────
   Rend `{pool, record}` quand il est lisible, `null` quand il se déclare. La
   distinction entre « la couche n'est pas montée » et « ce record est amputé »
   est faite ici, et elle a besoin de la LISTE du genre — voir l'en-tête. */
function readClassPool(classRef, records, underived) {
  if (!classRef) {
    /* Le pli JETTE déjà sans choix `class` (« une dérivation impossible »),
       donc ce cas ne vient pas d'un document : il vient d'un `ref` de classe
       posé sous un autre chemin, ou d'un câblage. On le dit plutôt que de
       supposer. */
    underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}]`, "underived.fh.skillpool-no-class-ref", {}));
    return null;
  }
  const pool = (classRef.data || {})[POOL_FIELD];
  if (pool === undefined) {
    /* LA DISTINCTION, et elle vaut le détour par la liste du genre. */
    const bearers = (typeof records === "function" ? records("class") : [])
      .filter((view) => view && view.data && view.data[POOL_FIELD] !== undefined);
    if (bearers.length > 0) {
      fail(`the class record "${classRef.id}" carries no \`data[${POOL_FIELD}]\`, and ${bearers.length} other ` +
        "class records of the stack do — so the layer IS mounted and this record is amputated, or it comes " +
        "from a third-party layer. A class without a pool is bad content, not missing content: the character " +
        "would silently have no points to spend at all.");
    }
    underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}]`, "underived.fh.skillpool-layer-not-mounted",
      { classId: classRef.id }));
    return null;
  }
  if (pool === null || typeof pool !== "object" || Array.isArray(pool)) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}]\` = ${JSON.stringify(pool)}, which is ` +
      "not an object — the convention of this layer is `{bound_skill_points, bound_tool_points, free_point_pool, " +
      "by_level, tier_costs, expertise_from_level}`, and a scalar there hides which term of the pool it was " +
      "meant to be.");
  }
  /* ⭐ LOT 82 — LES TROIS TOTAUX DU CANON §B.1, ET ILS SE VÉRIFIENT
     SÉPARÉMENT. Le bound peut valoir 0 (sept classes n'ont aucun outil
     imposé) ; le free pool, jamais — une classe sans points libres serait une
     classe sans deuxième étape, et c'est la deuxième étape qui fait le
     personnage (canon §B.1). Une seule plage pour les trois laisserait passer
     un `free_point_pool: 0` sans un mot. */
  for (const champ of ["bound_skill_points", "bound_tool_points"]) {
    if (!Number.isInteger(pool[champ]) || pool[champ] < 0) {
      fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].${champ}\` = ` +
        `${JSON.stringify(pool[champ])}, which is not a whole number of points, zero or more. Bound points are ` +
        "points ALREADY placed when the sheet is handed over (canon §B.0): none is a fact, negative is nonsense.");
    }
  }
  if (!Number.isInteger(pool.free_point_pool) || pool.free_point_pool <= 0) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].free_point_pool\` = ` +
      `${JSON.stringify(pool.free_point_pool)}, which is not a positive whole number — the free point pool is ` +
      "the only thing the player spends, and a class that hands over none has no skills step at all.");
  }
  /* ⛔ ET LE `base` D'AVANT LE CANON NE DOIT PAS SURVIVRE. Il valait « tout,
     imposés compris, à déduire ensuite » — un record qui le porte encore vient
     d'une couche tierce non convertie, et le lire donnerait un pool trop grand
     de tout le bound. Loi §0.5 : ça JETTE, ça ne se répare pas en silence. */
  if (pool.base !== undefined) {
    fail(`the class record "${classRef.id}" still carries \`data[${POOL_FIELD}].base\` = ` +
      `${JSON.stringify(pool.base)}. That field died with the canon of 2026-08-18: it merged into one number ` +
      "what the canon publishes as three (bound skill, bound tool, free pool), and the engine deduced the " +
      "imposed choices back out of it by subtraction. A record still carrying it has not been converted, and " +
      "reading it would overstate the player's pool by exactly the bound.");
  }
  return pool;
}

/* ── LA TABLE DES COÛTS, LUE SUR LE RECORD ───────────────────────────
   ⛔ `imposed` EST MORT (lot 82). Il chiffrait ce qu'un choix imposé DÉDUISAIT
   du pool ; le canon supprime la déduction — les points imposés sont désormais
   PUBLIÉS À PART (`bound_skill_points`, `bound_tool_points`) et n'ont jamais
   transité par le pool (canon §B.0). Ce qui reste de la table, ce sont les
   trois paliers, et ils sont lus au coup par coup par `tierPointCost`. */
function tierCosts(classRef, pool) {
  const costs = pool.tier_costs;
  if (costs === null || typeof costs !== "object" || Array.isArray(costs)) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].tier_costs\` = ` +
      `${JSON.stringify(costs)}, which is not a table of tier costs — the pool cannot price a single tier ` +
      "without it, and assuming 1/2/4 here would restate in the engine a rule that belongs to content.");
  }
  return costs;
}

/* ── LE COÛT D'UN PALIER DE LA GRILLE (lot 34) ───────────────────────
   `none` ne vit dans AUCUN record — c'est l'absence de maîtrise, elle ne
   coûte rien par construction, pas par convention de contenu. Les trois
   autres sont lus sur `tier_costs`, comme `imposedCost` le fait déjà pour
   `imposed` : le nombre vient de la couche, jamais du module. */
function tierPointCost(classRef, costs, tier) {
  if (tier === "none") return 0;
  if (!costs || typeof costs !== "object" || Array.isArray(costs) || !Number.isInteger(costs[tier])) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].tier_costs.${tier}\` = ` +
      `${JSON.stringify(costs && costs[tier])}, which is not a whole number of points — a tier the engine cannot ` +
      "price is a tier it cannot place.");
  }
  return costs[tier];
}

/* ── LE VERROU D'EXPERTISE (lot 34) ──────────────────────────────────
   `expertise_from_level` était lu par personne avant ce lot (mesuré,
   commande du lot). Il vit sur le MÊME record que le reste de la grille —
   pas un nombre de plus dans ce fichier.

   ⭐ LOT 169 — ET IL A UNE SECONDE SOURCE, JAMAIS UN SECOND NOMBRE. Un grant
   de TRAIT ouvert (`trait_grants`, plus bas) peut porter la même permission,
   à son propre niveau : le verrou effectif est le PLUS BAS des deux. Les deux
   niveaux sont lus sur le record ; ce fichier n'en écrit aucun. */
function expertiseFromLevel(classRef, pool, traitGrantsOuverts) {
  const level = pool.expertise_from_level;
  if (!Number.isInteger(level) || level < 1) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].expertise_from_level\` = ` +
      `${JSON.stringify(level)}, which is not a whole level — the expertise lock cannot compare a character's ` +
      "level to a rule it cannot read.");
  }
  const parLeTrait = (Array.isArray(traitGrantsOuverts) ? traitGrantsOuverts : [])
    .filter((grant) => grant.unlocksExpertise === true)
    .map((grant) => grant.level);
  return parLeTrait.length > 0 ? Math.min(level, ...parLeTrait) : level;
}

/* ── LE PLAFOND D'EXPERTISES DU NIVEAU 1 (lot 169) ───────────────────
   Eric, 2026-09-06, en tranchant Late Bloomer : *« deux expertises max au
   niveau 1 »*, *« pour lui comme pour n'importe qui »*. C'est une règle NEUVE
   — elle n'existait pas avant ce jour-là, et le Rogue en achetait trois si son
   pool suivait.

   ⛔ LES DEUX NOMBRES SE LISENT, exactement comme `expertise_from_level` :
   `through_level` est le niveau JUSQU'AUQUEL le plafond mord, `max` le nombre
   toléré. Écrire « 2 » ou « niveau 1 » ici referait la faute que le verrou
   d'à côté répare depuis le lot 34 — *« une valeur LUE, jamais figée »*.

   ⚠️ ET IL N'EST PAS UNE CLAUSE DE LATE BLOOMER : il s'applique à quiconque
   peut acheter l'expertise à ce niveau-là, Late Bloomer ou pas. Le lier au
   trait laisserait le Rogue sans plafond, ce qu'Eric a explicitement refusé. */
function expertiseCap(classRef, pool) {
  const cap = pool.expertise_cap;
  if (cap === null || typeof cap !== "object" || Array.isArray(cap)) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].expertise_cap\` = ` +
      `${JSON.stringify(cap)}, which is not an object — the convention is \`{through_level, max}\`, and a cap ` +
      "the engine cannot read is a character it would let out of creation above the rule, silently.");
  }
  if (!Number.isInteger(cap.through_level) || cap.through_level < 1 || cap.through_level > MAX_LEVEL) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].expertise_cap.through_level\` = ` +
      `${JSON.stringify(cap.through_level)}, which is not a whole level between 1 and ${MAX_LEVEL}.`);
  }
  if (!Number.isInteger(cap.max) || cap.max < 0) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].expertise_cap.max\` = ` +
      `${JSON.stringify(cap.max)}, which is not a whole number of expertises, zero or more.`);
  }
  return cap;
}

/* ── LE COÛT D'UN TRAINING (lot 36) ──────────────────────────────────
   Porté par le record LUI-MÊME, jamais par une table de ce fichier
   (commande §2, « le coût vient du record ») : le Garrot vaut 1, une arme
   exotique plus rare pourrait valoir davantage — ce module ne le sait pas
   et n'a pas à le savoir. */
function trainingCost(view) {
  const cost = view.data ? view.data.cost : undefined;
  if (!Number.isInteger(cost) || cost < 1) {
    fail(`the training record "${view.id}" carries \`data.cost\` = ${JSON.stringify(cost)}, which is not a ` +
      "positive whole number of points — a training the engine cannot price is a training it cannot sell.");
  }
  return cost;
}

/* ── LE VERROU DE NIVEAU D'UN TRAINING (lot 36) ──────────────────────
   MÊME FORME QU'`expertiseFromLevel` (commande §2, ratifié par Eric) : une
   valeur LUE, jamais figée dans le moteur. `data.from_level` est ABSENT
   par défaut — le plancher générique de la commande (4) s'applique alors
   — et SA PRÉSENCE sur le record EST la dérogation : le jour où une couche
   de sous-classe patche le Garrot à `from_level: 3`, ce module lit le
   nombre neuf sans qu'une seule de ses lignes ne bouge. */
const DEFAULT_TRAINING_FROM_LEVEL = 4;
function trainingFromLevel(view) {
  const level = view.data ? view.data.from_level : undefined;
  if (level === undefined) return DEFAULT_TRAINING_FROM_LEVEL;
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
    fail(`the training record "${view.id}" carries \`data.from_level\` = ${JSON.stringify(level)}, which is not ` +
      "a whole level between 1 and " + MAX_LEVEL + " — the training lock cannot compare a character's level to " +
      "a rule it cannot read.");
  }
  return level;
}

/* ── LE BONUS D'UN PALIER (lot 34) ───────────────────────────────────
   Générique au schéma `fh-char/1`, pas une règle de maison : un palier ½
   coupe le bonus de maîtrise en deux (arrondi au sol), un palier plein le
   donne en entier, le palier le plus haut le double — c'est la même
   arithmétique que le SRD applique à l'Expertise du Roublard, non
   réinventée ici. `derive.mjs` reçoit le résultat tout fait (`bonusTerm`) et
   ne connaît donc jamais le nom des trois paliers au-dessus de « aucun ». */
function tierBonusTerm(tier, proficiency) {
  if (!Number.isInteger(proficiency)) return 0;
  if (tier === "novice") return Math.floor(proficiency / 2);
  if (tier === "adept") return proficiency;
  if (tier === "expert") return proficiency * 2;
  return 0;
}

/* ── LES BUMPS D'ESPÈCE ──────────────────────────────────────────────
   Trois espèces sur douze en portent. Une espèce SANS `skill_points` n'est pas
   un trou : c'est un FAIT, et la déclaration le dit ainsi — comme le lot 19 le
   fait pour les dix-sept dons du SRD qui ne touchent pas au Score. */
function speciesLines(species, level, lines, underived) {
  if (!species) {
    underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}].species`, "underived.fh.skillpool-species-no-choice", {}));
    return;
  }
  const data = species.data || {};
  const bumps = data[SPECIES_FIELD];
  if (bumps === undefined) {
    underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}].species`, "underived.fh.skillpool-species-no-field",
      { speciesId: species.id }));
    return;
  }
  if (bumps === null || typeof bumps !== "object" || Array.isArray(bumps)) {
    fail(`the species record "${species.id}" carries \`data.${SPECIES_FIELD}\` = ${JSON.stringify(bumps)}, which ` +
      "is not an object — the convention of this layer is `{trait, by_level}`.");
  }
  /* Le libellé EST le nom du trait, recopié (loi §0.13). Le trait vit dans
     `data.traits` pour les espèces neuves et dans `data[fh_traits]` pour les
     espèces SRD que la couche patche — les deux sont lues, comme au lot 19. */
  const traitId = bumps.trait;
  /* REWRITTEN 2026-09-03 (lot 147) — la lecture locale part au pli. Ce qui est
     lu ne change pas ; ce qui est GAGNÉ change, le jour où `srfh+` portera un
     homologue : voir `src/modules/fh/traits.mjs`. */
  const trait = traitsDeLEspece(species).find((item) => item && item.id === traitId);
  if (!trait || typeof trait.name !== "string" || trait.name.trim() === "") {
    fail(`the species record "${species.id}" grants skill points through \`${SPECIES_FIELD}.trait\` = ` +
      `${JSON.stringify(traitId)}, and no trait of that id carries a name. Dropping the lines would leave the ` +
      "pool short by exactly those points, silently; naming them after the id would put an identifier where " +
      "a human reads a reason.");
  }
  const tiers = traversedTiers(bumps.by_level, level, species.id, `${SPECIES_FIELD}.by_level`);
  if (tiers.length === 0) {
    /* Le trait existe et AUCUN de ses paliers n'est traversé — l'Humain au
       niveau 0 n'existe pas, mais l'Araag n'a rien gagné au niveau 2 qu'il
       n'ait déjà au niveau 1. La déclaration nomme le trait ET le niveau :
       sans le niveau, elle se lirait comme « cette espèce ne donne rien ». */
    underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}].species`, "underived.fh.skillpool-species-tier-not-reached",
      { speciesId: species.id, traitName: trait.name, level }));
    return;
  }
  for (const tier of tiers) {
    lines.push({
      label: t("fh.skills.term.species", { trait: trait.name, level: tier.level }),
      value: tier.gain,
      source: { kind: "species", id: species.id }
    });
  }
}

/* ── LES APTITUDES DE CLASSE QUI TENDENT DES POINTS (lot 82) ─────────
   Canon §B.1ter. Une aptitude qui accorde l'Expertise tend DEUX choses : des
   free points, et le droit de les dépenser en expertise avant le niveau 4.

   ⛔ ELLES NE SONT PAS DANS `by_level`, ET C'EST LA RÈGLE. Le barde gagne
   DEUX choses à son niveau 2 — le +1 de l'échelle et son aptitude d'Expertise
   — et le canon interdit nommément de les replier : *« An engine that folds
   them into a single "+N at level 2" loses the permission, and the permission
   is half of what the feature is. »* Deux règles, deux lignes.

   ⚠️ MÊME RÈGLE DES PALIERS TRAVERSÉS (Q15-8) : un personnage créé au niveau 5
   a les aptitudes de niveau ≤ 5, pas celle du 9. Le rôdeur en est le cas
   visible — Deft Explorer au 2, Expertise au 9.

   ⭐ ET UN GRANT PEUT NE PORTER AUCUN POINT. Le rogue reçoit sa PERMISSION au
   niveau 1 sans un point (ses deux expertises sont déjà payées dans son kit,
   canon §A.5) ; le barbare reçoit du BOUND et pas de point (*Primal
   Knowledge* nomme une liste). Ni l'un ni l'autre n'a de ligne dans le pool :
   une ligne à zéro serait du bruit qui ressemble à un gain. */
/* ⭐ LOT 169 — LES QUATRE CONTRÔLES DE FORME D'UN GRANT, PARTAGÉS. Deux listes
   portent désormais la même forme (`grants`, les aptitudes de classe ;
   `trait_grants`, les traits du personnage). En écrire deux jeux de contrôles
   les ferait diverger au premier changement — la faute que `traversedTiers`
   évite déjà en servant la classe ET l'espèce. `quoi` nomme la liste fautive
   dans le refus, pour que le message ne mente pas sur sa provenance. */
function verifierLaFormeDUnGrant(classRef, grant, quoi) {
  if (grant === null || typeof grant !== "object" || Array.isArray(grant)) {
    fail(`the class record "${classRef.id}" carries a ${quoi} that is not an object: ${JSON.stringify(grant)}.`);
  }
  if (!Number.isInteger(grant.level) || grant.level < 1 || grant.level > MAX_LEVEL) {
    fail(`the class record "${classRef.id}" carries a ${quoi} at level ${JSON.stringify(grant.level)}, outside ` +
      `1–${MAX_LEVEL}. A grant the engine cannot date is a grant it cannot know the character has reached.`);
  }
  if (!Number.isInteger(grant.points) || grant.points < 0) {
    fail(`the class record "${classRef.id}" carries a ${quoi} worth ${JSON.stringify(grant.points)} points — not a ` +
      "whole number, zero or more. Zero is a real case (the rogue gets the permission and no point); negative " +
      "is nonsense.");
  }
  if (typeof grant.feature !== "string" || grant.feature.trim() === "") {
    fail(`the class record "${classRef.id}" carries a ${quoi} with no usable \`feature\` name. The breakdown line ` +
      "is labelled with it, copied from the record (loi §0.13) — without it the player would read points " +
      "arriving from nowhere.");
  }
}

function classGrantLines(classRef, pool, level, lines, underived) {
  const grants = pool.grants;
  if (grants === undefined) return;
  if (!Array.isArray(grants)) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].grants\` = ${JSON.stringify(grants)}, ` +
      "which is not a list — the convention is a list of `{level, feature, points, boundSkill, unlocksExpertise}`, " +
      "one entry per class feature that hands over points or bound placements (canon §B.1ter).");
  }
  for (const grant of grants) {
    verifierLaFormeDUnGrant(classRef, grant, "grant");
    /* LA RÈGLE Q15-8, la même ligne que pour les paliers. */
    if (grant.level > level) continue;
    if (grant.points > 0) {
      lines.push({
        label: t("fh.skills.term.feature", { feature: grant.feature, level: grant.level }),
        value: grant.points,
        source: { kind: "class", id: classRef.id }
      });
    }
    if (Number.isInteger(grant.boundSkill) && grant.boundSkill > 0) {
      /* LE BOUND QUI POUSSE APRÈS LE NIVEAU 1 — il ne rejoint pas le pool, il
         s'ajoute au bound. Publié comme une déclaration parce que ce module ne
         conduit pas son placement (le joueur choisit dans la liste de classe). */
      /* ⭐ LA LISTE EST NOMMÉE, PLUS SEULEMENT AFFIRMÉE — 2026-08-20. Ce message
         disait « l'aptitude NOMME une liste » sans jamais la porter : une phrase
         juste, invérifiable, et que rien n'obligeait à rester vraie. Elle est
         désormais une donnée qui vient de la couche. */
      const from = Array.isArray(grant.boundSkillFrom) ? grant.boundSkillFrom : [];
      underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}].bound.${grant.level}`,
        "underived.fh.skillpool-bound-grows", {
          classId: classRef.id, feature: grant.feature, level: grant.level, points: grant.boundSkill,
          from: from.join(", ")
        }));
    }
  }
}

/* ── 🌱 LES GRANTS D'UN TRAIT (lot 169) ──────────────────────────────
   Canon §B.1ter, appliqué à un trait plutôt qu'à une aptitude de classe. Un
   grant de trait tend les MÊMES deux choses — des points, et la permission
   d'acheter l'expertise avant l'heure — et il porte une clef de plus : `trait`,
   le slug que le DOCUMENT doit déclarer pour que le grant s'ouvre.

   🔴 CE QUE CE BLOC NE FAIT PAS, ET C'EST TOUT SON INTÉRÊT : il ne connaît le
   nom d'AUCUN trait. « late-bloomer » n'est écrit nulle part dans ce fichier —
   le document le nomme (`fh.skills.trait.<slug>`), la couche le chiffre
   (`trait_grants`), et ce module apparie les deux. Le jour où Eric ajoute un
   second trait à points, il n'y a pas une ligne à changer ici.

   ⛔ UN TRAIT DÉCLARÉ QUE LA COUCHE NE CONNAÎT PAS EST UN REFUS QUI LE NOMME,
   jamais une ligne silencieusement sautée (loi §0.5) : sinon une faute de
   frappe dans un document coûterait au joueur son trait entier, sans un mot.

   ⚠️ ET LA DISTINCTION DES DEUX MANQUES EST LA MÊME QU'EN TÊTE DE FICHIER :
   AUCUNE classe ne porte `trait_grants` → la couche qui les pose n'est pas
   montée, ça se DÉCLARE. D'autres en portent et pas celle-ci → le record est
   amputé, ça JETTE.

   Rend la liste des grants OUVERTS (trait déclaré ET niveau atteint) : le
   verrou d'expertise la relit, elle n'est donc pas seulement une source de
   lignes. */
function traitGrantsOuverts(classRef, pool, records, traitsDeclares, level, underived, violations) {
  const grants = pool.trait_grants;
  if (grants === undefined) {
    if (traitsDeclares.size === 0) return [];
    const porteurs = (typeof records === "function" ? records("class") : [])
      .filter((view) => view && view.data && view.data[POOL_FIELD]
        && view.data[POOL_FIELD].trait_grants !== undefined);
    if (porteurs.length > 0) {
      fail(`the class record "${classRef.id}" carries no \`data[${POOL_FIELD}].trait_grants\`, and ` +
        `${porteurs.length} other class records of the stack do — so the layer IS mounted and this record is ` +
        "amputated. A character who declares a trait would silently lose everything that trait hands over.");
    }
    underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}].traits`, "underived.fh.skillpool-trait-grants-absent",
      { classId: classRef.id, traits: [...traitsDeclares.keys()].sort().join(", ") }));
    return [];
  }
  if (!Array.isArray(grants)) {
    fail(`the class record "${classRef.id}" carries \`data[${POOL_FIELD}].trait_grants\` = ` +
      `${JSON.stringify(grants)}, which is not a list — the convention is a list of \`{trait, level, feature, ` +
      "points, boundSkill, unlocksExpertise}`, one entry per trait that hands over points or a permission.");
  }
  const parTrait = new Map();
  for (const grant of grants) {
    verifierLaFormeDUnGrant(classRef, grant, "trait grant");
    if (typeof grant.trait !== "string" || grant.trait.trim() === "") {
      fail(`the class record "${classRef.id}" carries a trait grant with no usable \`trait\` key ` +
        `(${JSON.stringify(grant.trait)}) — that key IS what a character's choice names, and a grant nothing can ` +
        "name is a grant nothing can open.");
    }
    if (parTrait.has(grant.trait)) {
      fail(`the class record "${classRef.id}" carries TWO trait grants for "${grant.trait}" — the character ` +
        "would receive its points twice.");
    }
    parTrait.set(grant.trait, grant);
  }
  const ouverts = [];
  for (const { slug, path } of traitsDeclares.values()) {
    const grant = parTrait.get(slug);
    /* Un slug que la couche ne connaît pas : NOMMÉ, avec la liste de ce qu'elle
       connaît — le même patron que `skill-spend.option-unavailable`. Ce module
       ne JETTE pas pour un choix de joueur. */
    if (!grant) {
      violations.push(buildViolation("skill-trait.unknown",
        { path, selected: slug, options: [...parTrait.keys()].sort().join(", ") }, path));
      continue;
    }
    /* LA RÈGLE Q15-8, la même ligne que partout ailleurs : un grant daté d'un
       niveau que le personnage n'a pas atteint ne s'ouvre pas. */
    if (grant.level > level) continue;
    ouverts.push(grant);
  }
  return ouverts;
}

/* Les lignes de pool que les grants ouverts tendent. Séparé de la lecture
   ci-dessus parce que le verrou d'expertise a besoin des grants AVANT que la
   dépense commence, et que les lignes, elles, se posent une seule fois.
   ⭐ ET UN GRANT PEUT NE PORTER AUCUN POINT — la même loi que pour le rogue :
   une ligne à zéro serait du bruit qui ressemble à un gain. */
function traitGrantLines(classRef, ouverts, lines) {
  for (const grant of ouverts) {
    if (grant.points > 0) {
      lines.push({
        label: t("fh.skills.term.trait", { trait: grant.feature }),
        value: grant.points,
        source: { kind: "class", id: classRef.id }
      });
    }
  }
}

/* ── LE BOUND, ET IL N'ENTRE JAMAIS DANS LE POOL (lot 82) ────────────
   ⭐ CE BLOC NE SOUSTRAIT PLUS RIEN, et c'est tout le changement du canon.

   AVANT : le pool valait « tout, imposés compris », et ce module déduisait
   les choix imposés un par un — classe, arrière-plan, outil d'arrière-plan —
   plus un NET ZÉRO pour le grant d'espèce (ajouter au pool, puis dépenser au
   même coût : deux lignes pour dire qu'il ne se passe rien).

   APRÈS (canon §B.0, ratifié par Eric le 2026-08-18) : « Bound points are
   never in the free point pool. They are already spent, before the character
   sheet is handed over. » Le record publie les trois totaux ; le pool publié
   EST le free point pool, et il n'a rien à retrancher.

   ⛔ CE QUI DISPARAÎT AVEC LA SOUSTRACTION :
     · la déduction des `skill_choice.count` de la classe ;
     · la déduction des `skill_ids` et de l'outil d'arrière-plan — l'arrière-
       plan est éteint depuis le lot 43, ces lignes ne mordaient déjà plus ;
     · le net zéro d'espèce.

   ⭐ ET LE NET ZÉRO ÉTAIT DÉJÀ MORT DANS LA PILE FH, MESURÉ : la couche des
   espèces RETIRE `granted_skill_choice` de l'Elfe et de l'Humain
   (`remove: ["data[granted_skill_choice]"]`) et le remplace par deux formes
   qui disent déjà exactement ce que le canon demande —
     · `skill_points` (Skillful, Fast Learner) → des points LIBRES ;
     · `granted_skill_budget {points, from}` (Keen Senses) → des points
       CAPTIFS d'une liste, c'est-à-dire du BOUND sous son nom de moteur.
   Le vocabulaire diffère du canon, la mécanique est la même. `derive.mjs` et
   `decisions.mjs` la portent déjà.

   ── CE QUI RESTE À FAIRE ICI : LE TEST DU CANON SUR `granted_skill_choice`
   Une pile SANS la couche des espèces (SRD nu + couche des compétences) voit
   encore le champ SRD. Le canon §B.1quater donne le test, et il est déjà
   lisible dans la donnée — aucun champ à ajouter :

       from: ["insight","perception","survival"]  → une liste  → BOUND
       from: "any"                                → le littéral → FREE

   Un grant LIBRE vaut une maîtrise pleine (canon §A.2 : une maîtrise SRD =
   adepte), au coût que le record porte. Un grant CAPTIF ne touche pas au
   pool. */
function boundLines(classRef, pool, species, lines, underived) {
  /* LE BOUND DE LA CLASSE — publié, jamais soustrait. Il se DÉCLARE plutôt
     que de rester muet : le joueur place ses points bound dans la liste de sa
     classe, au palier novice, et ce module ne conduit pas ce placement. */
  underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}].bound`, "underived.fh.skillpool-bound-not-in-pool",
    { classId: classRef.id, skill: pool.bound_skill_points, tool: pool.bound_tool_points }));

  if (!species) return;
  const grant = (species.data || {}).granted_skill_choice;
  if (grant === undefined) return;
  if (grant === null || typeof grant !== "object" || Array.isArray(grant)) {
    fail(`the species record "${species.id}" carries \`data.granted_skill_choice\` = ${JSON.stringify(grant)}, ` +
      "which is not an object — the convention is `{count, from}`, and a scalar there hides how many choices " +
      "the species grants.");
  }
  if (!Number.isInteger(grant.count) || grant.count <= 0) {
    fail(`the species record "${species.id}" carries \`data.granted_skill_choice.count\` = ` +
      `${JSON.stringify(grant.count)}, which is not a positive whole number — a grant the engine cannot count ` +
      "is bad content, not a grant to skip.");
  }

  /* 🔴 LE TEST DU CANON, ET C'EST LA DONNÉE QUI LE PORTE. Une liste contraint,
     le littéral `"any"` ne contraint pas. Tout autre forme n'est ni l'un ni
     l'autre : la taire choisirait un camp au hasard, et l'un des deux camps
     est faux de `count × adepte` points. */
  if (Array.isArray(grant.from)) {
    underived.push(declareUnderived(`stats[${FH_SKILL_POOL_ID}].species.granted`,
      "underived.fh.skillpool-species-grant-bound", { speciesId: species.id, count: grant.count }));
    return;
  }
  if (grant.from !== "any") {
    fail(`the species record "${species.id}" carries \`data.granted_skill_choice.from\` = ` +
      `${JSON.stringify(grant.from)}, which is neither a list of skill ids nor the literal "any". That field IS ` +
      "the canon's bound/free test (§B.1quater): a list constrains the grant, \"any\" does not. A third form " +
      "would have to be sorted into one of the two camps by guess, and the wrong guess costs the character " +
      "exactly that grant.");
  }
  const adepte = pool.tier_costs && pool.tier_costs.adept;
  if (!Number.isInteger(adepte)) {
    fail(`the class record "${classRef.id}" prices no adept tier (\`tier_costs.adept\`), and the ` +
      `species "${species.id}" grants ${grant.count} unconstrained one(s). An SRD proficiency is worth an adept ` +
      "(canon §A.2); without its price the grant cannot enter the pool.");
  }
  lines.push({
    label: t("fh.skills.term.granted", { source: species.name, count: grant.count }),
    value: grant.count * adepte,
    source: { kind: "species", id: species.id }
  });
}

/* ── LE DON QUI PORTE DES POINTS DE COMPÉTENCE ───────────────────────
   Lot 24. Même canal que le Score de Destinée (lot 20, `destiny-stat.mjs`) :
   le don d'origine vit sous `background.originFeat[n]`, hors du namespace de
   ce module, donc la dérivation le tend par `refs` et ce module RÉCLAME ceux
   qu'il a lus.

   MÊME CHAMP QUE LE BUMP D'ESPÈCE (`SPECIES_FIELD`, "skill_points") — la
   FORME distingue les genres, comme `data.destiny` sert déjà `{base}` à une
   espèce, `{bonus}` à un don et `{impact}` à une Arcane. Un don SANS
   `data.skill_points` n'est pas un refus : c'est le cas des seize autres dons
   du SRD (et de tous ceux à venir) — le champ absent dit « ce don ne donne
   aucun point », et c'est un fait, pas un trou. */
function featLines(feats, lines, underived, consumed) {
  const bearers = [];
  for (const feat of Array.isArray(feats) ? feats : []) {
    const bonus = feat && feat.data ? feat.data[SPECIES_FIELD] : undefined;
    if (bonus === undefined) continue;
    if (bonus === null || typeof bonus !== "object" || Array.isArray(bonus)) {
      fail(`the feat record "${feat.id}" carries \`data.${SPECIES_FIELD}\` = ${JSON.stringify(bonus)}, which is ` +
        `not an object — the convention of this layer is \`data.${SPECIES_FIELD}.bonus\`, and a scalar there ` +
        "hides which term of the pool it was meant to be.");
    }
    if (!Number.isInteger(bonus.bonus)) {
      fail(`the feat record "${feat.id}" carries \`data.${SPECIES_FIELD}.bonus\` = ${JSON.stringify(bonus.bonus)}, ` +
        "which is not a whole number of skill points. A feat that announces a pool bonus and cannot state it is " +
        "bad content, not a feat to skip: skipping it would leave the pool short by exactly it, silently.");
    }
    if (typeof feat.name !== "string" || feat.name.trim() === "") {
      fail(`the feat record "${feat.id}" grants ${bonus.bonus} skill points and carries no usable \`name\` — the ` +
        "breakdown line is labelled with it, copied from the record (loi §0.13).");
    }
    bearers.push({ feat, bonus: bonus.bonus });
  }
  if (bearers.length === 0) {
    const chosen = (Array.isArray(feats) ? feats : []).map((feat) => feat.id);
    underived.push(...(chosen.length === 0
      ? [declareUnderived(`stats[${FH_SKILL_POOL_ID}].feat`, "underived.fh.skillpool-feat-no-choice", {})]
      : [declareUnderived(`stats[${FH_SKILL_POOL_ID}].feat`, "underived.fh.skillpool-feat-no-bonus", { featIds: chosen.join(", ") })]));
    return;
  }
  for (const { feat, bonus } of bearers) {
    lines.push({ label: feat.name, value: bonus, source: { kind: "feat", id: feat.id } });
    if (typeof feat.path === "string") consumed.push(feat.path);
  }
}

/**
 * Le module de statistique dérivée que le bloc `build` reçoit par injection.
 *
 * Même forme que `createFhDestinyStat()` : on lui passe ce que le pli a déjà su
 * lire, il rend UNE entrée `resolved.stats[]` et la liste de ce qu'il n'a pas
 * pu dériver.
 */
export function createFhSkillPoolStat() {
  return {
    flag: FH_SKILLS_FLAG,
    id: FH_SKILL_POOL_ID,

    /**
     * @param {object} input
     * @param {number} input.level    `resolved.identity.level` — le niveau du personnage
     * @param {object|null} input.species le record d'espèce choisi : `{id, name, slug, data}`
     * @param {Array}  input.choices  les choix sous `fh.skills.*`, dans l'ordre du document
     * @param {Function} input.records `(kind, id?) => vue aplatie | null | liste du genre`
     * @param {Array}  input.refs     les records que le personnage désigne HORS de ce namespace — ce module lit la CLASSE et l'ARRIÈRE-PLAN
     * @param {string[]} [input.imposedSkillSlugs] les slugs que le pli a déjà placés en maîtrise pleine
     *   (arrière-plan, classe, espèce) — lot 34, le PLANCHER de la grille à quatre paliers.
     * @returns {{stat: object|null, underived: Array, consumed: string[], skillTiers?: object, traits?: Array}}
     */
    contribute({ level, species, choices, records, refs, imposedSkillSlugs, proficiency }) {
      const underived = [];
      const lines = [];
      /* REWRITTEN 2026-09-06 (lot 169) — `violations` était déclaré au §5, juste
         avant la dépense. Il l'est maintenant en tête : la LECTURE des choix (§0)
         peut déjà refuser — un `trait.<slug>` qui ne porte pas un booléen — et un
         refus n'attend pas son tour. */
      const violations = [];
      /* Les chemins HORS namespace que ce module a réellement lus — seul le
         don d'origine (lot 24) alimente cette liste : `class`, `species` et
         `background` sont déjà consommés par le pli lui-même (`takeRef`), les
         réclamer ici ajouterait du bruit sans changer aucun témoignage. */
      const consumed = [];

      /* ⚠️ `level` EST UN AJOUT DE CE LOT AU PROTOCOLE D'INJECTION, et il est
         indispensable : les paliers se cumulent sur les niveaux TRAVERSÉS, et
         `proficiency` ne dit pas le niveau — 5 et 8 valent 3 tous les deux, et
         un barde n'a pas le même pool aux deux. Voir `contracts/build.md`
         §« Ce qu'il reçoit », et l'inventaire du lot pour la ratification. */
      if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
        fail(`the derivation handed this module a level of ${JSON.stringify(level)} — the skill pool accumulates ` +
          `the tiers the character has TRAVERSED (Eric's rule Q15-8), so it cannot be computed without one. ` +
          "This is a wiring failure, not missing content.");
      }

      /* LES CHOIX DE CE NAMESPACE (lot 34) — LE CANAL DE DÉPENSE.
         `fh.skills.spend.<slug>` = "novice"|"adept"|"expert" MONTE un
         imposé au-dessus de son plancher, ou achète une ligne neuve, au coût
         de la DIFFÉRENCE (contrat §⭐ THE SKILL POOL). Tout AUTRE chemin de ce
         namespace reste un refus qui le nomme (loi §0.5) : ce module ne porte
         toujours qu'UN terme de choix. */
      const SPEND_PREFIX = "spend.";
      /* LOT 36 — LA TROISIÈME DÉPENSE DU POOL. `train.<slug>` porte un
         BOOLÉEN, jamais un palier (commande §3a, ARBITRÉ) : un training
         n'a ni demi, ni plein, ni expertise, et le faire transiter par
         `spend.*` accepterait un mot de la grille sur un objet qui n'en a
         pas — un mensonge de forme que la commande interdit nommément. */
      const TRAIN_PREFIX = "train.";
      /* 🌱 LOT 169 — LE QUATRIÈME TERME, ET IL N'EST PAS UNE DÉPENSE. `trait.<slug>`
         porte un BOOLÉEN et ne coûte rien : il DÉCLARE ce que le personnage porte,
         là où `spend.*` et `train.*` disent ce qu'il achète. C'est le seul canal par
         lequel un fait établi ailleurs (ici : le plancher haut a dû rattraper le
         tirage des caractéristiques) peut atteindre ce module — un module ne voit
         que son propre namespace, et le document ne garde du tirage que les six
         scores finaux, jamais le lot de dés. */
      const TRAIT_PREFIX = "trait.";
      const TIER_ORDER = ["none", "novice", "adept", "expert"];
      const tierRank = (tier) => TIER_ORDER.indexOf(tier);
      const spendEntries = [];
      const trainEntries = [];
      const traitsDeclares = new Map();
      for (const entry of Array.isArray(choices) ? choices : []) {
        if (typeof entry.tail === "string" && entry.tail.startsWith(SPEND_PREFIX)) {
          spendEntries.push({ slug: entry.tail.slice(SPEND_PREFIX.length), value: entry.value, path: entry.path });
          continue;
        }
        if (typeof entry.tail === "string" && entry.tail.startsWith(TRAIN_PREFIX)) {
          trainEntries.push({ slug: entry.tail.slice(TRAIN_PREFIX.length), value: entry.value, path: entry.path });
          continue;
        }
        if (typeof entry.tail === "string" && entry.tail.startsWith(TRAIT_PREFIX)) {
          const slug = entry.tail.slice(TRAIT_PREFIX.length);
          /* Même discipline que `train.*` : `true` ET `false` sont légaux —
             `false` a le même effet que l'absence du choix —, tout le reste est
             un refus nommé, jamais une acceptation silencieuse. */
          if (typeof entry.value !== "boolean") {
            violations.push(buildViolation("skill-trait.value-invalid",
              { path: entry.path, value: String(entry.value) }, entry.path));
            continue;
          }
          if (entry.value === true) traitsDeclares.set(slug, { slug, path: entry.path });
          continue;
        }
        fail(`the choice "${entry.path}" is in the "${FH_SKILLS_FLAG}" namespace, and this module only carries three ` +
          `terms a choice can set: "${FH_SKILLS_FLAG}.spend.<skill>" (half, proficient or expertise), ` +
          `"${FH_SKILLS_FLAG}.train.<training>" (true) or "${FH_SKILLS_FLAG}.trait.<trait>" (true). A path it ` +
          "cannot read is a refusal, not a line it quietly drops.");
      }

      const outside = Array.isArray(refs) ? refs : [];
      const classRef = outside.find((ref) => ref.path === CLASS_PATH && ref.kind === "class") || null;
      const backgroundRef = outside.find((ref) => ref.path === BACKGROUND_PATH && ref.kind === "background") || null;

      /* 1. LE POOL DE CLASSE — la condition de publication. */
      const pool = readClassPool(classRef, records, underived);
      if (pool === null) {
        /* ⛔ RIEN N'EST PUBLIÉ. Les bumps d'espèce vivent dans une AUTRE couche
           et seraient donc lisibles ici : publier « Skill Points : 4 » sans son
           pool de classe donnerait un nombre qui ressemble à un pool. */
        return { stat: null, underived, consumed: [] };
      }
      /* ⭐ LOT 82 — LE FREE POINT POOL, PUBLIÉ TEL QUEL. C'est ce que le
         joueur dépense, et il n'y a plus rien à en retrancher : le bound est
         publié à part et n'y est jamais entré (canon §B.0). */
      lines.push({
        label: t("fh.skills.term.class", { class: classRef.name }),
        value: pool.free_point_pool,
        source: { kind: "class", id: classRef.id }
      });

      /* 2. LES PALIERS TRAVERSÉS — une ligne chacun (règle Q15-8).

         ⭐ LOT 82 — DEUX ÉCHELLES, ET ELLES NE SE COMPTENT PAS SUR LE MÊME
         NIVEAU (canon §B.1septies). `by_level` suit le niveau DU PERSONNAGE ;
         `by_class_level` suit les niveaux DANS CETTE CLASSE. Le pli ne dérive
         qu'une classe aujourd'hui, donc les deux nombres sont égaux et la
         séparation est à somme nulle — mais les DEUX lectures existent, et le
         jour où le multiclassage arrive, le +1 du barde ne suivra pas les
         niveaux de guerrier. La table fusionnée d'avant rendait +11 là où la
         vérité est +7, pour un Barde 4 / Guerrier 4. */
      for (const tier of traversedTiers(pool.by_level, level, classRef.id, `data[${POOL_FIELD}].by_level`)) {
        lines.push({
          label: t("fh.skills.term.level", { level: tier.level }),
          value: tier.gain,
          source: { kind: "class", id: classRef.id }
        });
      }
      /* ⏳ `niveauDeClasse` VAUT `level` TANT QUE LE PLI NE DÉRIVE QU'UNE
         CLASSE (`takeRef("class")`, mesuré). Ce n'est pas une approximation :
         pour un personnage mono-classe, son niveau de classe EST son niveau.
         La ligne existe pour que le jour où le pli tend un niveau par classe,
         il n'y ait qu'un argument à changer — pas une règle à retrouver. */
      const niveauDeClasse = level;
      for (const tier of traversedTiers(pool.by_class_level, niveauDeClasse, classRef.id,
        `data[${POOL_FIELD}].by_class_level`)) {
        lines.push({
          label: t("fh.skills.term.class-level", { class: classRef.name, level: tier.level }),
          value: tier.gain,
          source: { kind: "class", id: classRef.id }
        });
      }

      /* 3. LES BUMPS D'ESPÈCE. */
      speciesLines(species, level, lines, underived);

      /* 3b. LE DON D'ORIGINE (lot 24) — même canal `refs` que le Score de
         Destinée, filtré sur son propre genre. */
      featLines(outside.filter((ref) => ref.kind === "feat"), lines, underived, consumed);

      /* 4. LE BOUND — PUBLIÉ, JAMAIS SOUSTRAIT (lot 82, canon §B.0). Et le
         grant d'espèce trié par la contrainte qu'il porte, pas par sa source. */
      tierCosts(classRef, pool);
      classGrantLines(classRef, pool, level, lines, underived);
      /* 🌱 4b. LES GRANTS DE TRAIT (lot 169) — lus AVANT la dépense, parce que
         le verrou d'expertise les relit ; leurs lignes se posent ici, avec les
         autres gains, pour que `preSpendTotal` les compte. */
      const ouverts = traitGrantsOuverts(classRef, pool, records, traitsDeclares, level, underived, violations);
      traitGrantLines(classRef, ouverts, lines);
      boundLines(classRef, pool, species, lines, underived);

      /* 5. LA GRILLE À QUATRE PALIERS (lot 34) — le plancher, puis la dépense.
         ⚠️ Le plancher (« half ») N'EST PAS écrit dans `resolved.skills[]`
         comme un fait acquis : ce bloc rend « proficient » pour un imposé
         tant qu'aucun module ne le corrige (§0.12, voir `derive.mjs`). C'est
         CE module, activé par le drapeau, qui republie le bon palier pour
         chaque slug — le plancher d'abord, la dépense du joueur ensuite. */
      const tierBySlug = {}; // slug → nom de palier, USAGE INTERNE seulement
      for (const slug of Array.isArray(imposedSkillSlugs) ? imposedSkillSlugs : []) tierBySlug[slug] = "novice";
      /* LOT 36 — les trainings acquis, à publier dans `resolved.traits[]`
         par le canal générique que `derive.mjs` recopie sans jamais nommer
         la mécanique qui l'a produit (§0.12, même discipline que
         `skillTiers`). */
      const acquiredTraits = [];

      /* LOT 37, §3a — LE POINT DE DÉPART DE LA GARDE DE NÉGATIF. Tout ce qui
         est publié JUSQU'ICI (classe, paliers, espèce, don, imposés) est ce
         que le joueur a À RÉPARTIR ; `spentTotal` accumule ce que les deux
         dépenses libres (`spend.*`, `train.*`) lui coûtent. La somme finale
         des lignes est TOUJOURS `preSpendTotal - spentTotal` — aucune ligne
         n'est ajoutée par un autre canal après ce point. */
      const preSpendTotal = lines.reduce((total, line) => total + line.value, 0);
      let spentTotal = 0;

      /* LOT 37, §3b — LE CATALOGUE DES OUTILS, LU ICI, INCONDITIONNELLEMENT.
         Le contrôle « au moins un outil » ne dépend pas de la présence de
         `spend.*` dans les choix : un personnage qui n'a RIEN dépensé sur un
         outil est justement le cas que ce contrôle doit refuser. */
      const toolCatalog = typeof records === "function" ? records("tool") : [];
      const toolSlugs = new Set(toolCatalog.map((view) => view.slug));

      if (spendEntries.length > 0) {
        /* LOT 35 — LE MÊME CANAL PORTE LES DEUX GENRES. `skillTiers` rend déjà
           `{slug: {proficiency, bonusTerm}}`, et les slugs des deux genres ne
           collisionnent PAS (mesuré, `INVENTAIRE-LOT-35.md`) : nul besoin d'un
           champ neuf ni d'une distinction de genre dans le pli — `derive.mjs`
           cherche le slug dans `resolved.skills[]` PUIS `resolved.tools[]`,
           une recherche générique qui ne nomme aucune mécanique FH. Les DEUX
           genres se paient au MÊME barème (`pool.tier_costs`, décision
           d'Eric) : aucune branche de coût séparée n'est nécessaire ici. */
        const skillCatalog = typeof records === "function" ? records("skill") : [];
        const catalogBySlug = new Map();
        for (const view of skillCatalog) catalogBySlug.set(view.slug, { view, genre: "skill" });
        /* ⛔ LE GARDE DE COLLISION, ET IL EST BRUYANT. Zéro collision entre les
           26 compétences et les 36 outils aujourd'hui (mesuré) — mais une
           couche homebrew tierce en créerait une, et un canal muet choisirait
           alors une cible en silence (loi §0.5). */
        for (const view of toolCatalog) {
          const existing = catalogBySlug.get(view.slug);
          if (existing) {
            fail(`le slug « ${view.slug} » est porté à la fois par la compétence « ${existing.view.id} » et par ` +
              `l'outil « ${view.id} » — le canal de dépense ne saurait pas choisir sa cible sans le dire.`);
          }
          catalogBySlug.set(view.slug, { view, genre: "tool" });
        }
        for (const { slug, value, path } of spendEntries) {
          const entry = catalogBySlug.get(slug);
          const target = entry ? entry.view : null;
          /* Un slug inconnu ou un palier illégal N'EST PAS APPLIQUÉ — le canal
             ne fabrique pas une ligne fausse pour un choix que le catalogue ne
             reconnaît pas — MAIS il est NOMMÉ en verrou keyé (lot 27), ici,
             parce que `src/build/` n'a pas le droit de connaître le nom de ce
             champ (§0.12, voir `INVENTAIRE-LOT-34.md`) : ce module est le seul
             endroit qui peut juger cette dépense, donc le seul qui peut le
             dire. Ce module, lui, ne JETTE pas pour un choix de joueur. */
          if (!target) {
            violations.push(buildViolation("skill-spend.option-unavailable", { path, selected: slug, options: "" }, path));
            continue;
          }
          if (typeof value !== "string" || !TIER_ORDER.includes(value) || value === "none") {
            violations.push(buildViolation("skill-spend.tier-invalid", { path, value: String(value) }, path));
            continue;
          }
          const floor = tierBySlug[slug] || "none";
          if (tierRank(value) < tierRank(floor)) {
            violations.push(buildViolation("skill-spend.below-floor", { path, value, floor }, path));
            continue;
          }
          if (value === "expert" && level < expertiseFromLevel(classRef, pool, ouverts)) {
            violations.push(buildViolation("skill-spend.tier-locked", {
              path, skillId: slug, level, unlockLevel: expertiseFromLevel(classRef, pool, ouverts)
            }, path));
            continue;
          }
          /* 🌱 LE PLAFOND (lot 169), APRÈS LE VERROU ET JAMAIS AVANT : un achat
             que le verrou refuse déjà n'a pas à être compté, et le compter
             ferait refuser le SUIVANT pour une expertise qui n'existe pas.
             ⛔ Il ne compte que ce que ce module a RÉELLEMENT posé — le bound
             ne passe jamais par `expert`, et un refus a déjà `continue`. */
          if (value === "expert") {
            const cap = expertiseCap(classRef, pool);
            const deja = Object.values(tierBySlug).filter((tier) => tier === "expert").length;
            if (level <= cap.through_level && tierBySlug[slug] !== "expert" && deja >= cap.max) {
              violations.push(buildViolation("skill-spend.expertise-capped", {
                path, skillId: slug, level, max: cap.max, throughLevel: cap.through_level
              }, path));
              continue;
            }
          }
          tierBySlug[slug] = value;
          const costs = pool.tier_costs;
          const delta = tierPointCost(classRef, costs, value) - tierPointCost(classRef, costs, floor);
          if (delta === 0) continue;
          spentTotal += delta; // §3a — ce qui est RÉELLEMENT appliqué : les refus ont déjà `continue`
          lines.push({
            label: t("fh.skills.term.spend", { skill: target.name, tier: value }),
            value: -delta,
            source: { kind: entry.genre, id: target.id }
          });
        }
      }

      /* 6. LES TRAININGS (lot 36) — la troisième dépense. Catalogue à part :
         le genre `training` a son propre espace de slugs, et le canal
         `train.*` ne partage rien avec `spend.*` — pas de garde de
         collision à écrire ici, il n'y a qu'un seul genre candidat. */
      if (trainEntries.length > 0) {
        const trainingCatalog = typeof records === "function" ? records("training") : [];
        const trainingBySlug = new Map();
        for (const view of trainingCatalog) trainingBySlug.set(view.slug, view);
        for (const { slug, value, path } of trainEntries) {
          const target = trainingBySlug.get(slug);
          /* Même discipline que le canal `spend.*` : un slug inconnu ou une
             valeur illisible N'EST PAS APPLIQUÉ, mais NOMMÉ en verrou keyé —
             `src/build/` n'a pas le droit de connaître le nom de ce canal
             (§0.12), donc c'est ce module qui le dit. */
          if (!target) {
            violations.push(buildViolation("skill-train.option-unavailable", { path, selected: slug }, path));
            continue;
          }
          /* « valeur booléenne ou absente » (commande §3a) : `true` ET
             `false` sont légaux — `false` ne fait rien, le même effet que
             l'absence du choix — tout le reste (un mot de palier comme
             "adept", un nombre) est un refus nommé, pas une
             acceptation silencieuse (commande §4, test 5). */
          if (typeof value !== "boolean") {
            violations.push(buildViolation("skill-train.value-invalid", { path, value: String(value) }, path));
            continue;
          }
          if (value === false) continue;
          const unlockLevel = trainingFromLevel(target);
          if (level < unlockLevel) {
            violations.push(buildViolation("skill-train.level-locked", {
              path, trainingId: slug, level, unlockLevel
            }, path));
            continue;
          }
          const cost = trainingCost(target);
          spentTotal += cost; // §3a — même comptage que le canal `spend.*`
          lines.push({
            label: t("fh.skills.term.train", { training: target.name }),
            value: -cost,
            source: { kind: "training", id: target.id }
          });
          /* `resolved.traits[]` (commande §3d, ARBITRÉ) : pas de rubrique
             neuve, pas de champ de plus — le prix est déjà tracé dans le
             choix et dans la ligne ci-dessus, une troisième copie ici
             mentirait sur ce que `traits[]` porte. */
          acquiredTraits.push({ id: target.slug || target.id, name: target.name, category: "training" });
        }
      }

      /* LA FORME PUBLIÉE : `{proficiency, bonusTerm}`. `derive.mjs` ne connaît
         pas le vocabulaire d'un palier (§0.12, deux gardes littéraux) — il
         additionne `bonusTerm` au modificateur de caractéristique, un point
         c'est tout. Ce module, lui, connaît la formule (le palier double la
         maîtrise, la demi-compétence la coupe en deux) et la calcule ici, à
         partir du `proficiency` que la dérivation lui a déjà tendu. */
      const skillTiers = {};
      for (const [slug, tier] of Object.entries(tierBySlug)) {
        skillTiers[slug] = { proficiency: tier, bonusTerm: tierBonusTerm(tier, proficiency) };
      }

      /* 7. LES DEUX GARDES DU LOT 37 QUE CE MODULE PORTE (contrat §3, §3a et
         §3b — le §3c vit dans `decisions.mjs` depuis le lot 34 ; ce qui
         manquait n'était pas le refus, c'est que `validate()` ne le lisait
         pas, voir `block.mjs`). APRÈS les deux dépenses libres, jamais avant :
         elles jugent ce qui a été RÉELLEMENT appliqué, dépense refusée
         comprise (comportement 2a — le refus ne bloque rien, `validate()`
         refuse à la SORTIE). */

      /* §3a — LE POOL NE PEUT PAS FINIR NÉGATIF. UN SEUL refus sur le TOTAL :
         aucune dépense n'est « la » fautive, donc AUCUN chemin (ARBITRÉ,
         commande §3a — révocable, à signaler dans l'inventaire). */
      if (preSpendTotal - spentTotal < 0) {
        violations.push(buildViolation("skill-pool.overspent",
          { available: preSpendTotal, spent: spentTotal, over: spentTotal - preSpendTotal }));
      }

      /* ⛔ §3b EST MORT — « AU MOINS UN POINT EN OUTILS » N'EXISTE PLUS.
         Canon §B.1 : « And the old "at least one point must go into a tool" is
         DEAD. It existed because tools were a separate budget; they are not any
         more. Nothing forces a tool. » Il n'y a plus qu'UN pool, dépensable
         indifféremment en compétences ou en outils (canon §B.2) — un refus qui
         force un outil imposerait au joueur une dépense que la règle ne
         demande plus. Le refus, sa phrase anglaise et sa phrase française
         partent avec lui. */

      return {
        stat: {
          id: FH_SKILL_POOL_ID,
          flag: FH_SKILLS_FLAG,
          name: t("fh.skills.pool"),
          value: lines.reduce((total, line) => total + line.value, 0),
          breakdown: lines
        },
        underived,
        consumed,
        skillTiers,
        violations,
        traits: acquiredTraits
      };
    }
  };
}
