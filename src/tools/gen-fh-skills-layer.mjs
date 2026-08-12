/* ══ LE GÉNÉRATEUR DE LA COUCHE FH — COMPÉTENCES ET OUTILS ═════════════
   Lot 22-chapitre-4-competences.

   Il prend le canon déclaré (`fh-skills-source.mjs`) et la couche SRD EN
   commitée, et il rend `layers/fh-skills-en.layer.json`.

   ── LES TROIS DISCIPLINES DU LOT 15, REPRISES ICI ─────────────────────
   Elles ne sont pas recopiées par habitude : chacune est un piège déjà payé
   dans ce dépôt (TRAPS.md), et les trois mordent exactement pareil ici.

   1. LA DESTINATION EST UN ARGUMENT. Une suite qui veut observer la
      reproductibilité doit pouvoir générer AILLEURS que dans `layers/` —
      sinon elle écrase ce qu'elle mesure, et deux passes rendent deux
      verdicts sans qu'une ligne ait changé.

   2. LA SOURCE SRD EST UN ARGUMENT AUSSI. C'est ce qui permet de prouver un
      refus sur une PRIVATION DÉLIBÉRÉE — une couche SRD amputée de Perception
      ou du Gaming Set — plutôt que sur une pénurie de circonstance. Une
      preuve qui tient à la pauvreté de sa source cesse de prouver le jour où
      la source s'enrichit, et elle cesse EN RESTANT VERTE.

   3. AUCUN REPLI SILENCIEUX (loi §0.5). Un record qu'on croyait trouver et
      qui n'y est pas fait JETER, en le nommant. Sans quoi la couche perdrait
      un retrait ou un patch en silence, et la table jouerait une fiche fausse.

   ── ET UNE QUATRIÈME, PROPRE À CE LOT ─────────────────────────────────
   4. LE SRD EST RECOMPTÉ, PAS SUPPOSÉ. Le générateur exige que la couche SRD
      porte exactement 18 compétences et 25 outils, et que CHAQUE record qu'il
      y trouve soit classé — conservé, retiré, patché. Un 19ᵉ record de
      compétence apparu dans une régénération de `fh-srd` ferait donc jeter,
      au lieu de se glisser dans les « 26 » sans que personne le remarque.

      ⚠️ C'est le garde qui compte vraiment. Un total de 26 passerait avec 26
      mauvaises compétences ; ce garde-ci attrape le record INCONNU, qui est
      le seul cas où un total juste cache un contenu faux. */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ABILITY_NAMES,
  BACKGROUNDS_EXTINGUISHED,
  CLASS_POOLS,
  EXPECTED,
  TIER_COSTS,
  FH_SKILLS_FLAG,
  LAYER,
  SKILL_CATEGORIES,
  SKILLS_ADDED,
  SKILLS_KEPT_CATEGORIES,
  SKILLS_REMOVED,
  TOOLS_ADDED,
  TOOLS_RECHARACTERISED,
  TOOLS_REMOVED
} from "./fh-skills-source.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT_DIR = join(ROOT, "layers");
const OUT_NAME = "fh-skills-en.layer.json";
const SRD_PATH = join(ROOT, "layers", "srd-5.2.1-en.layer.json");

/** L'erreur du générateur. Nommée, pour qu'une suite puisse exiger CE
 *  refus-là plutôt que « ça a jeté ». */
export class GenError extends Error {
  constructor(message) {
    super(message);
    this.name = "GenError";
  }
}

const fail = (message) => {
  throw new GenError(message);
};

/* ── LES RÉFÉRENCES QUE D'AUTRES COUCHES ONT DÉJÀ PRISES ───────────────
   `layers/fh-species-en.layer.json` a été écrit AVANT celle-ci et pointe déjà
   vers deux de ses records, dans le `granted_skill_choice` de l'Elestu. Ces
   `ref` sont commités : un slug qui bouge les casse.

   ⚠️ Et le `ref` mort ne se verrait PAS ici — il se verrait à la dérivation,
   sur la fiche d'un joueur, trois mois plus tard. D'où ce garde, qui le rend
   visible à la génération. Il est vérifié en le violant (suite : renommer
   `delve` → rouge). */
const CLAIMED_BY_OTHER_LAYERS = ["fh:skill:en:delve", "fh:skill:en:vigilance"];

export function readSrdLayer(path = SRD_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const idOf = (kind, slug) => `fh:${kind}:en:${slug}`;

/** Le nom affichable d'une caractéristique, refusé s'il sort des cinq que la
 *  source déclare. Une clef inconnue est du contenu faux, pas un champ
 *  manquant — même doctrine que l'invariant 6 du bloc `build`. */
function abilityName(key, who) {
  const name = ABILITY_NAMES[key];
  if (!name) {
    fail(`« ${who} » porte la caractéristique « ${key} », qui n'est pas une des cinq déclarées ` +
      `(${Object.keys(ABILITY_NAMES).join(", ")}). Une clef hors catalogue est du contenu faux.`);
  }
  return name;
}

/** Une catégorie hors des quatre déclarées est du contenu faux — même
 *  doctrine que `abilityName` juste au-dessus. Un mot qui n'est ni
 *  `knowledge`, ni `social`, ni `exploration`, ni `physical` rangerait une
 *  compétence dans une colonne que l'écran ne porte pas. */
function assertCategory(category, who) {
  if (!SKILL_CATEGORIES.includes(category)) {
    fail(`« ${who} » reçoit la catégorie « ${category} », qui n'est pas une des quatre déclarées ` +
      `(${SKILL_CATEGORIES.join(", ")}).`);
  }
  return category;
}

/** Lit un record du SRD, ou jette en le nommant AVEC son rôle. « le record
 *  visé par le retrait de Perception » se corrige ; « record introuvable » se
 *  cherche. */
function srdRecord(srd, kind, id, role) {
  const genre = (srd.records || {})[kind];
  if (!genre) {
    fail(`la couche SRD ne porte aucun genre « ${kind} » — ${role} ne peut pas être écrit.`);
  }
  const record = genre[id];
  if (!record) {
    fail(`la couche SRD ne porte pas « ${id} », visé par ${role}. Une couche ne peut pas retirer ni ` +
      "patcher un record qui n'existe pas : le contrat `layers` en fait un échec bruyant.");
  }
  return record;
}

/* ══ LES COMPÉTENCES ═══════════════════════════════════════════════════ */
function buildSkills(srd) {
  const srdSkills = (srd.records || {}).skill || {};
  const srdIds = Object.keys(srdSkills);
  if (srdIds.length !== EXPECTED.srdSkills) {
    fail(`la couche SRD porte ${srdIds.length} compétences, la source en attend ${EXPECTED.srdSkills}. ` +
      "L'arithmétique du chapitre 4 (17 conservées + 9 neuves = 26) est calculée sur ce nombre : " +
      "il ne peut pas bouger en silence.");
  }

  const skill = {};
  const removed = new Set();

  for (const entry of SKILLS_REMOVED) {
    srdRecord(srd, "skill", entry.target, `le retrait « ${entry.target} »`);
    skill[entry.target] = { op: "disable", reason: entry.reason };
    removed.add(entry.target);
  }

  for (const entry of SKILLS_ADDED) {
    const id = idOf("skill", entry.slug);
    if (skill[id]) fail(`la compétence « ${id} » est déclarée deux fois par la source.`);
    if (srdSkills[id]) fail(`la compétence « ${id} » existe déjà au SRD : ce serait un ajout, pas une nouveauté.`);
    skill[id] = {
      name: entry.name,
      slug: entry.slug,
      data: {
        ability: abilityName(entry.ability, entry.name),
        ability_key: entry.ability,
        category: assertCategory(entry.category, id),
        example_uses: entry.exampleUses,
        name: entry.name
      }
    };
  }

  /* ══ LE RANGEMENT DES COMPÉTENCES (lot 35) ═══════════════════════════
     Les DIX-SEPT conservées reçoivent un `patch` ÉTROIT qui ne pose QUE
     `data.category` — rien d'autre du record SRD n'est touché. Une
     compétence conservée qui n'apparaissait NULLE PART dans cette couche
     avant ce lot y apparaît donc maintenant, mais seulement pour ranger : le
     texte, le coût, tout le reste reste au SRD, inchangé. */
  for (const entry of SKILLS_KEPT_CATEGORIES) {
    srdRecord(srd, "skill", entry.target, `la catégorie de « ${entry.target} »`);
    if (removed.has(entry.target)) {
      fail(`« ${entry.target} » reçoit une catégorie ET un retrait — une compétence RETIRÉE n'a plus de colonne ` +
        "où ranger quoi que ce soit.");
    }
    if (skill[entry.target]) {
      fail(`« ${entry.target} » reçoit un patch de catégorie en plus d'un autre traitement de cette couche — ` +
        "une compétence CONSERVÉE ne devrait porter QUE ce patch.");
    }
    skill[entry.target] = {
      op: "patch",
      changes: { "data.category": assertCategory(entry.category, entry.target) },
      note: `Fate's Hand — category: ${entry.category}`
    };
  }

  /* LE GARDE QUI COMPTE. Toute compétence du SRD est soit retirée, soit
     conservée — et « conservée » veut dire un patch ÉTROIT qui ne pose que
     sa catégorie (lot 35 ; avant ce lot, ABSENTE de cette couche). Ce qu'on
     vérifie ici, c'est qu'aucune n'est arrivée sans qu'on sache quoi en
     faire, ET qu'aucune conservée n'est restée sans catégorie — une
     compétence orpheline disparaîtrait silencieusement de l'écran. */
  const kept = srdIds.filter((id) => !removed.has(id));
  const total = kept.length + SKILLS_ADDED.length;
  if (total !== EXPECTED.skills) {
    fail(`la couche rend ${total} compétences (${kept.length} conservées du SRD + ${SKILLS_ADDED.length} ` +
      `neuves), la source en attend ${EXPECTED.skills}.`);
  }
  const sansCategorie = kept.filter((id) => !skill[id] || skill[id].op !== "patch");
  if (sansCategorie.length > 0) {
    fail(`ces compétences conservées du SRD n'ont pas de catégorie déclarée : ${sansCategorie.join(", ")}. ` +
      "Une compétence sans `category` disparaîtrait silencieusement de l'écran (loi §0.5).");
  }

  for (const id of CLAIMED_BY_OTHER_LAYERS) {
    if (!skill[id]) {
      fail(`« ${id} » est déjà référencé par une autre couche commitée (le \`granted_skill_choice\` de ` +
        "l'Elestu, dans `fh-species-en`), et cette couche-ci ne le produit pas. Le `ref` serait mort — " +
        "et il ne se verrait qu'à la dérivation, sur la fiche d'un joueur.");
    }
  }

  return { skill, kept: kept.length, added: SKILLS_ADDED.length, total };
}

/* ══ LES OUTILS ════════════════════════════════════════════════════════ */
function buildTools(srd) {
  const srdTools = (srd.records || {}).tool || {};
  const srdIds = Object.keys(srdTools);
  if (srdIds.length !== EXPECTED.srdTools) {
    fail(`la couche SRD porte ${srdIds.length} outils, la source en attend ${EXPECTED.srdTools}.`);
  }

  const tool = {};
  const removed = new Set();

  for (const entry of TOOLS_REMOVED) {
    srdRecord(srd, "tool", entry.target, `le retrait « ${entry.target} »`);
    tool[entry.target] = { op: "disable", reason: entry.reason };
    removed.add(entry.target);
  }

  /* LES TROIS RE-CARACTÉRISATIONS. La source déclare `was` — la
     caractéristique que le SRD porte aujourd'hui — et on la VÉRIFIE. Sans ce
     contrôle, une correction de `fh-srd` qui donnerait déjà `int` au Mason
     laisserait ici un patch qui n'a plus d'objet, et personne ne le saurait.

     ⚠️ Un patch qui n'a plus d'objet n'est pas inoffensif : il fige la valeur
     contre la source, et c'est exactement ce qu'une couche ne doit pas faire. */
  for (const entry of TOOLS_RECHARACTERISED) {
    const record = srdRecord(srd, "tool", entry.target, `la re-caractérisation « ${entry.target} »`);
    const current = ((record.data || {}).ability_key) || null;
    if (current !== entry.was) {
      fail(`« ${entry.target} » porte au SRD la caractéristique « ${current} », alors que la source ` +
        `déclare corriger « ${entry.was} » vers « ${entry.ability} ». Le patch n'a plus l'objet qu'il ` +
        "croyait avoir : soit le SRD a changé, soit la source ment.");
    }
    if (entry.ability === entry.was) {
      fail(`« ${entry.target} » serait patché vers la caractéristique qu'il porte déjà (${entry.was}).`);
    }
    tool[entry.target] = {
      op: "patch",
      /* ⚠️ `data[ability_key]`, PAS `data.ability_key`. La grammaire des
         chemins de patch n'admet pas l'underscore après un point
         (`^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*|\[[a-z][a-z0-9:_-]*\])*$`)
         : une clef qui en porte un passe par les crochets. Mesuré en le
         violant — le bloc `layers` a refusé le montage en nommant le chemin,
         et c'est la couche des espèces qui donnait déjà la bonne forme
         (`data[skill_points]`). */
      changes: {
        "data.ability": abilityName(entry.ability, entry.target),
        "data[ability_key]": entry.ability
      },
      note: `Fate's Hand — default ability ${entry.was} → ${entry.ability}`
    };
  }

  for (const entry of TOOLS_ADDED) {
    const id = idOf("tool", entry.slug);
    if (tool[id]) fail(`l'outil « ${id} » est déclaré deux fois par la source.`);

    const data = {
      ability: abilityName(entry.ability, entry.name),
      ability_key: entry.ability,
      name: entry.name
    };

    /* L'HÉRITAGE. Le `utilize` du parent est LU, jamais recopié à la main :
       c'est une phrase du SRD, et la seule façon honnête de la porter est de
       la prendre à sa source à chaque génération.

       ⚠️ Le parent est un record que cette même couche RETIRE. Ce n'est pas
       une contradiction : le retrait vaut pour la pile que le personnage
       monte, la lecture a lieu ici, à la génération, sur la couche SRD brute. */
    if (entry.inherits) {
      const parent = srdRecord(srd, "tool", entry.inherits,
        `l'outil « ${entry.name} », qui hérite son usage de « ${entry.inherits} »`);
      if (!removed.has(entry.inherits)) {
        fail(`« ${entry.name} » éclate « ${entry.inherits} », que la source ne retire pas. Garder le ` +
          "record générique à côté de ses héritiers doublerait chaque maîtrise.");
      }
      const utilize = (parent.data || {}).utilize;
      if (typeof utilize !== "string" || utilize.length === 0) {
        fail(`« ${entry.inherits} » ne porte pas d'\`utilize\` à lire pour « ${entry.name} ». Ce lot ` +
          "n'en invente pas : ce serait écrire une règle que le SRD ne donne pas.");
      }
      data.utilize = utilize;
      data.cost = "Varies";
      data.weight = "Varies";
    }

    tool[id] = { name: entry.name, slug: entry.slug, data };
  }

  const kept = srdIds.filter((id) => !removed.has(id));
  const total = kept.length + TOOLS_ADDED.length;
  if (total !== EXPECTED.tools) {
    fail(`la couche rend ${total} outils (${kept.length} conservés du SRD + ${TOOLS_ADDED.length} ` +
      `neufs), la source en attend ${EXPECTED.tools}.`);
  }

  return { tool, kept: kept.length, added: TOOLS_ADDED.length, total };
}

/* ══ LES POOLS DE POINTS, POSÉS SUR LES DOUZE CLASSES ══════════════════
   Un `patch` étroit par classe : le pool de niveau 1 et sa progression
   énumérée. Rien d'autre du record SRD n'est touché — ni `skill_choice`, qui
   porte déjà les choix imposés de la classe, ni les aptitudes.

   ⛔ ET LE GARDE QUI COMPTE POUR DE VRAI : le SRD doit porter EXACTEMENT 12
   classes, et chacune doit recevoir son pool. Une 13ᵉ classe apparue dans une
   régénération de `fh-srd` — un Artificier qui rentrerait par la porte de
   derrière — ferait jeter ici, et pas trois mois plus tard sur une question
   de licence (loi §0.8, dépôt public). */
function buildClasses(srd) {
  const srdClasses = (srd.records || {}).class || {};
  const srdIds = Object.keys(srdClasses);
  if (srdIds.length !== EXPECTED.classes) {
    fail(`la couche SRD porte ${srdIds.length} classes, la source en attend ${EXPECTED.classes}. ` +
      "Le chapitre 4 donne un pool à chacune des douze classes du SRD ; s'il y en a treize, la " +
      "treizième n'a pas de pool — et si c'est l'Artificier, il n'a rien à faire dans un dépôt public.");
  }

  const klass = {};
  const servis = new Set();

  for (const entry of CLASS_POOLS) {
    srdRecord(srd, "class", entry.target, `le pool de compétences de « ${entry.target} »`);
    if (klass[entry.target]) fail(`la classe « ${entry.target} » reçoit deux pools.`);
    if (!Number.isInteger(entry.base) || entry.base <= 0) {
      fail(`« ${entry.target} » reçoit un pool qui n'est pas un entier positif (${entry.base}).`);
    }
    if (!Number.isInteger(entry.expertiseFromLevel) || entry.expertiseFromLevel <= 0) {
      fail(`« ${entry.target} » reçoit un \`expertiseFromLevel\` qui n'est pas un entier positif ` +
        `(${entry.expertiseFromLevel}).`);
    }
    servis.add(entry.target);
    klass[entry.target] = {
      op: "patch",
      changes: {
        "data[fh_skill_pool]": {
          base: entry.base,
          by_level: entry.byLevel,
          tier_costs: { ...TIER_COSTS },
          /* LOT 35 — PAR CLASSE, plus une constante unique. Le Rogue déroge
             (addendums §1, EXCEPTION — LE ROGUE) : son Expertise SRD de
             niveau 1 est comptée dans son pool, donc `expertiseFromLevel: 1`
             sur son seul record de `CLASS_POOLS` — les onze autres reçoivent
             `DEFAULT_EXPERTISE_FROM_LEVEL` (4) par le `.map` de la source. */
          expertise_from_level: entry.expertiseFromLevel
        }
      },
      note: `Fate's Hand — level-1 skill pool ${entry.base}, background included`
    };
  }

  const oubliées = srdIds.filter((id) => !servis.has(id));
  if (oubliées.length > 0) {
    fail(`ces classes du SRD n'ont pas de pool : ${oubliées.join(", ")}. Un personnage de cette classe ` +
      "n'aurait aucun point à dépenser, et rien ne le dirait (loi §0.5).");
  }

  return { class: klass, total: servis.size };
}

/* ══ L'ARRIÈRE-PLAN, ÉTEINT (lot 35) ═══════════════════════════════════
   Addendums §4 (Eric, 2026-08-12) : l'arrière-plan n'existe plus en Fate's
   Hand. Un `patch` étroit par record — RETRAIT de `skill_ids` (les quatre) et
   de `tool_id` (les trois qui le portent) — et rien d'autre du record SRD
   n'est touché : ni `ability_keys`, ni `feat_id`/`feat_option`, qui sont
   l'Inheritance et restent. `tool_choice` (le Soldier) n'est PAS visé : la
   source ne le déclare pas, et ce générateur ne retire que ce qu'elle nomme.

   ⛔ LE GARDE QUI COMPTE : le SRD doit porter EXACTEMENT quatre arrière-plans,
   et chacun d'eux doit être éteint. Un cinquième apparu dans une régénération
   de `fh-srd` resterait sinon intact en silence — un arrière-plan qui garde
   ses compétences et son outil imposés est un personnage dont le pool est
   faux d'exactement ce qui n'a pas été déduit (loi §0.5). */
function buildBackgrounds(srd) {
  const srdBackgrounds = (srd.records || {}).background || {};
  const srdIds = Object.keys(srdBackgrounds);
  if (srdIds.length !== EXPECTED.backgrounds) {
    fail(`la couche SRD porte ${srdIds.length} arrière-plans, la source en attend ${EXPECTED.backgrounds}. ` +
      "L'Inheritance éteint les quatre du SRD ; un cinquième n'aurait pas d'extinction déclarée.");
  }

  const background = {};
  const servis = new Set();

  for (const entry of BACKGROUNDS_EXTINGUISHED) {
    const record = srdRecord(srd, "background", entry.target, `l'extinction de « ${entry.target} »`);
    if (background[entry.target]) fail(`l'arrière-plan « ${entry.target} » est éteint deux fois.`);

    if (!record.data || !Object.hasOwn(record.data, "skill_ids")) {
      fail(`l'extinction de « ${entry.target} » vise \`data.skill_ids\`, absent du record SRD — un retrait ` +
        "dans le vide reste un échec bruyant.");
    }
    const remove = ["data[skill_ids]"];

    if (entry.hasToolId) {
      if (!record.data || !Object.hasOwn(record.data, "tool_id")) {
        fail(`l'extinction de « ${entry.target} » vise \`data.tool_id\`, absent du record SRD — un retrait ` +
          "dans le vide reste un échec bruyant.");
      }
      remove.push("data[tool_id]");
    } else if (record.data && Object.hasOwn(record.data, "tool_id")) {
      fail(`« ${entry.target} » est déclaré SANS \`tool_id\` par la source, et le SRD lui en donne un — la ` +
        "déclaration n'est plus mesurée sur la réalité de la couche SRD commitée.");
    }

    servis.add(entry.target);
    background[entry.target] = {
      op: "patch",
      remove,
      note: "Fate's Hand — Inheritance replaces Background: no imposed skills, no imposed tool " +
        "(addendums, Eric 2026-08-12)"
    };
  }

  const oubliés = srdIds.filter((id) => !servis.has(id));
  if (oubliés.length > 0) {
    fail(`ces arrière-plans du SRD ne sont pas éteints : ${oubliés.join(", ")}. Un personnage qui les choisit ` +
      "garderait des compétences et un outil imposés que l'Inheritance ne prévoit plus.");
  }

  return { background, total: servis.size };
}

/* ── LE GARDE ANTI-RECOPIE ─────────────────────────────────────────────
   Un record AJOUTÉ par Fate's Hand ne doit pas porter le texte éditorial du
   SRD, sauf par l'héritage déclaré ci-dessus. Le contrôle est fait sur le
   résultat, pas sur l'intention : on relit chaque valeur produite et on
   refuse celle qui se retrouve mot pour mot dans un record SRD du même genre
   qu'on n'a PAS déclaré hériter.

   Pourquoi sur le résultat : une recopie faite par distraction dans la source
   passerait tous les contrôles d'intention du monde. */
function assertNoHandWrittenSrdText(layer, srd) {
  for (const [kind, genre] of Object.entries(layer.records)) {
    const srdGenre = (srd.records || {})[kind] || {};
    const srdText = new Set();
    for (const record of Object.values(srdGenre)) {
      for (const value of Object.values(record.data || {})) {
        if (typeof value === "string" && value.length >= 40) srdText.add(value);
      }
    }
    const inherited = new Set(
      TOOLS_ADDED.filter((e) => e.inherits)
        .map((e) => ((srdGenre[e.inherits] || {}).data || {}).utilize)
        .filter(Boolean)
    );
    for (const [id, entry] of Object.entries(genre)) {
      if (entry.op === "disable" || entry.op === "patch") continue;
      for (const [field, value] of Object.entries(entry.data || {})) {
        if (typeof value !== "string" || value.length < 40) continue;
        if (inherited.has(value)) continue;
        if (srdText.has(value)) {
          fail(`« ${id} » porte dans \`${field}\` une phrase mot pour mot identique à celle d'un record ` +
            "SRD, sans l'avoir déclarée en héritage. Aucune prose du SRD ne s'écrit à la main.");
        }
      }
    }
  }
}

export function buildLayer({ srd }) {
  if (!srd || !srd.records) fail("la couche SRD passée au générateur ne porte pas de `records`.");

  const skills = buildSkills(srd);
  const tools = buildTools(srd);
  const classes = buildClasses(srd);
  const backgrounds = buildBackgrounds(srd);

  const layer = {
    schema: LAYER.schema,
    id: LAYER.id,
    version: LAYER.version,
    name: LAYER.name,
    lang: LAYER.lang,
    flags: [FH_SKILLS_FLAG],
    attribution: {
      license: "all-rights-reserved",
      text: "Original Fate's Hand content: all rights reserved. This layer modifies and extends material " +
        "from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at " +
        "https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution " +
        "4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. " +
        "Portions of the SRD material — including the Perception skill, the Gaming Set and the Musical " +
        "Instrument — have been removed, split or modified for this work."
    },
    description: LAYER.description,
    records: { skill: skills.skill, tool: tools.tool, class: classes.class, background: backgrounds.background }
  };

  assertNoHandWrittenSrdText(layer, srd);

  return { layer, skills, tools, classes, backgrounds };
}

export function serialize(layer) {
  return JSON.stringify(layer, null, 2) + "\n";
}

/** Génère la couche et l'ÉCRIT. `outDir` et `srdPath` sont des arguments : la
 *  suite génère dans un répertoire temporaire et compare là. */
export function generate({ outDir = OUT_DIR, srdPath = SRD_PATH } = {}) {
  const { layer, skills, tools, classes, backgrounds } = buildLayer({ srd: readSrdLayer(srdPath) });
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUT_NAME);
  writeFileSync(outPath, serialize(layer));
  return { outPath, skills, tools, classes, backgrounds };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, skills, tools, classes, backgrounds } = generate();
  console.log(`fh-skills : ${skills.total} compétences (${skills.kept} SRD + ${skills.added} neuves), ` +
    `${tools.total} outils (${tools.kept} SRD + ${tools.added} neufs), ` +
    `${classes.total} pools de classe, ${backgrounds.total} arrière-plans éteints → ${outPath}`);
}

export { OUT_NAME, SRD_PATH };
