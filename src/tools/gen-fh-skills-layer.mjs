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
  CLASS_POOLS,
  EXPECTED,
  TIER_COSTS,
  FH_SKILLS_FLAG,
  LAYER,
  SKILL_CATEGORIES,
  SKILLS_ADDED,
  SKILLS_KEPT_CATEGORIES,
  SKILLS_REWRITTEN,
  TOOLS_ADDED,
  TOOLS_RECHARACTERISED,
  TOOLS_REWRITTEN
} from "./fh-skills-source.mjs";
/* ⭐ LA LISTE DES `ref` PRIS PAR LA COUCHE DES ESPÈCES EST LUE LÀ OÙ ELLE VIT,
   jamais recopiée ici. Elle en portait une COPIE de deux ids jusqu'au
   2026-09-09 ; le jour où Vigilance a changé d'id, la copie et l'original
   auraient divergé sans qu'une ligne rougisse. Deux écrivains pour une même
   liste, c'est un oubli programmé. */
import { KEEN_SENSES_SKILLS } from "./fh-species-source.mjs";

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
   `layers/fh-species-en.layer.json` a été écrit AVANT celle-ci et pointe vers
   trois de ses records, dans le `granted_skill_budget` de Keen Senses (Elfe et
   Elestu). Ces `ref` sont commités : un id qui bouge les casse.

   ⚠️ Et le `ref` mort ne se verrait PAS ici — il se verrait à la dérivation,
   sur la fiche d'un joueur, trois mois plus tard. D'où ce garde, qui le rend
   visible à la génération. Il est vérifié en le violant (suite : renommer
   `delve` → rouge).

   ⭐ 2026-09-09 — ET C'EST LA LISTE ELLE-MÊME QUI EST LUE, pas sa recopie :
   `KEEN_SENSES_SKILLS` a UN écrivain, `fh-species-source.mjs`. Le jour où
   Vigilance est passée de `fh:skill:en:vigilance` à `srd:skill:en:perception`,
   une recopie serait restée verte en gardant l'ancien id. */
const CLAIMED_BY_OTHER_LAYERS = KEEN_SENSES_SKILLS;

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

/* ══ LA RÉÉCRITURE — LE GESTE CENTRAL DU LOT 185 ═══════════════════════
   🔴 Eric, 2026-09-09 : *« Eh bien au lieu de soustraire, réécrit. »*

   Un record du SRD que Fate's Hand remplaçait par des records plus fins n'est
   plus ÉTEINT : il DEVIENT l'un d'eux. Même id, nom neuf, slug neuf.

   ⭐ POURQUOI C'EST UN `patch` ET PAS UN `disable` + `add`. Un `disable`
   emporte avec lui toute référence qui nomme l'id — et la référence ne
   proteste pas, elle se tait. Un `patch` laisse l'id vivant : les cinq listes
   de classe du SRD, le `granted_skill_choice` de l'Elfe et les deux rangements
   de `srfh-shelving-en` continuent tous de se résoudre, sans qu'aucun d'eux
   n'ait à être réécrit à son tour.

   ── CE QUE CE HELPER VÉRIFIE, ET POURQUOI CHAQUE CONTRÔLE EXISTE ──────
   1. LA CIBLE EXISTE (`srdRecord`) — sinon le patch viserait le vide.
   2. LA CARACTÉRISTIQUE DE L'HÉRITIER EST DÉJÀ CELLE DU RECORD. Un héritier
      d'une autre caractéristique serait une décision qu'Eric n'a pas prise ;
      la patcher en passant la ferait entrer sans être nommée.
   3. LE NOM CHANGE VRAIMENT. Une réécriture qui reposerait le nom du SRD est
      un patch sans objet — il fige la valeur contre sa source, exactement ce
      qu'une couche ne doit pas faire (même doctrine que `was` plus bas).
   4. `data.name` EXISTE DÉJÀ. Les records de compétence et d'outil du SRD
      portent le nom DEUX fois (racine + `data.name`, mesuré sur les 18 et les
      25) ; n'en réécrire qu'un laisserait l'autre afficher l'ancien. */
function gesteDeReecriture(srd, kind, entry, extras = {}) {
  const record = srdRecord(srd, kind, entry.target,
    `la réécriture de « ${entry.target} » en « ${entry.name} »`);

  const current = ((record.data || {}).ability_key) || null;
  if (current !== entry.ability) {
    fail(`« ${entry.target} » porte au SRD la caractéristique « ${current} », alors que son héritier ` +
      `« ${entry.name} » déclare « ${entry.ability} ». Une réécriture n'est pas le lieu pour changer ` +
      "une caractéristique en silence : soit le SRD a bougé, soit l'héritier n'est pas celui qu'Eric a nommé.");
  }
  if (record.name === entry.name) {
    fail(`« ${entry.target} » s'appelle DÉJÀ « ${entry.name} » au SRD — la réécriture n'a plus d'objet, ` +
      "et un patch sans objet fige la valeur contre sa source.");
  }
  if (typeof ((record.data || {}).name) !== "string") {
    fail(`« ${entry.target} » ne porte pas de \`data.name\` au SRD — la réécriture n'en poserait qu'un ` +
      "des deux, et le record afficherait son ancien nom là où l'écran lit l'autre.");
  }

  return {
    op: "patch",
    ...(extras.remove ? { remove: extras.remove } : {}),
    changes: {
      name: entry.name,
      /* ⚠️ LE SLUG SUIT LE NOM. C'est la clef que le DOCUMENT d'un personnage
         écrit (`resolved.skills[].id`, `src/build/skills.mjs`) : la laisser sur
         « perception » imprimerait `perception` sur la fiche d'un personnage
         Fate's Hand, et casserait tous les documents déjà enregistrés qui
         portent « vigilance ». */
      slug: entry.slug,
      "data.name": entry.name,
      ...(extras.changes || {})
    },
    note: `Fate's Hand — ${record.name} rewritten as ${entry.name}`
  };
}

/** Les héritiers d'une réécriture ne peuvent pas exister DEUX FOIS. C'est le
 *  piège central du lot 185 : les trois héritiers vivaient dans les listes
 *  d'ajout sous un id `fh:` avant de recevoir le record du SRD. Rendre les
 *  deux produirait deux records pour la même chose — et le joueur choisirait
 *  deux fois les mêmes dés sans qu'aucun compte ne bouge (18 + 9 = 27 est
 *  aussi juste que 18 + 8 = 26 pour qui ne regarde que le total). */
function assertPasDeDoublon(reecritures, ajouts, kind) {
  const parSlug = new Map(reecritures.map((e) => [e.slug, e]));
  const parNom = new Map(reecritures.map((e) => [e.name, e]));
  for (const ajout of ajouts) {
    const parSlugHit = parSlug.get(ajout.slug);
    if (parSlugHit) {
      fail(`« fh:${kind}:en:${ajout.slug} » est AJOUTÉ alors que « ${parSlugHit.target} » est déjà ` +
        `réécrit sous ce slug. Un héritier n'existe qu'une fois : c'est le sens du mot « réécrire ».`);
    }
    const parNomHit = parNom.get(ajout.name);
    if (parNomHit) {
      fail(`« ${ajout.name} » est AJOUTÉ alors que « ${parNomHit.target} » porte déjà ce nom après ` +
        "réécriture. Deux records du même nom, c'est le doublon que la réécriture doit supprimer, " +
        "pas déplacer.");
    }
  }
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
  const reecrits = new Set();

  assertPasDeDoublon(SKILLS_REWRITTEN, SKILLS_ADDED, "skill");

  for (const entry of SKILLS_REWRITTEN) {
    skill[entry.target] = gesteDeReecriture(srd, "skill", entry, {
      changes: {
        "data.category": assertCategory(entry.category, entry.target),
        /* `data[example_uses]`, PAS `data.example_uses` : la grammaire des
           chemins n'admet pas l'underscore après un point (voir la note des
           trois re-caractérisations plus bas). */
        "data[example_uses]": entry.exampleUses
      }
    });
    reecrits.add(entry.target);
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
    if (reecrits.has(entry.target)) {
      fail(`« ${entry.target} » reçoit une catégorie ICI ET une réécriture — sa catégorie est posée par ` +
        "la réécriture, qui la déclare avec son nom. Deux écrivains pour la même case.");
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

  /* LE GARDE QUI COMPTE. Toute compétence du SRD est soit RÉÉCRITE en son
     héritière, soit conservée — et « conservée » veut dire un patch ÉTROIT
     qui ne pose que sa catégorie (lot 35 ; avant ce lot, ABSENTE de cette
     couche). Ce qu'on vérifie ici, c'est qu'aucune n'est arrivée sans qu'on
     sache quoi en faire, ET qu'aucune n'est restée sans catégorie — une
     compétence orpheline disparaîtrait silencieusement de l'écran.
     ⭐ 2026-09-09 — AUCUNE N'EST PLUS RETIRÉE : les 18 records du SRD sont
     tous dans la pile, et `kept` vaut donc 18. Le total ne bouge pas (26),
     parce que Vigilance a changé de côté : elle est passée des ajouts aux
     conservées. Un total juste ne dit rien du contenu — c'est la liste
     nommée, dans la suite, qui le dit. */
  const kept = [...srdIds];
  const total = kept.length + SKILLS_ADDED.length;
  if (total !== EXPECTED.skills) {
    fail(`la couche rend ${total} compétences (${kept.length} conservées du SRD + ${SKILLS_ADDED.length} ` +
      `neuves), la source en attend ${EXPECTED.skills}.`);
  }
  /* ⛔ LE GARDE LIT LA DONNÉE, PAS LA FORME. Il vérifiait `op === "patch"` :
     un patch qui ne posait AUCUNE catégorie serait passé, et la compétence
     aurait disparu de l'écran avec un garde vert. On regarde donc la case
     elle-même — c'est elle qui décide de la colonne. */
  const sansCategorie = kept.filter((id) => {
    const geste = skill[id];
    if (!geste || geste.op !== "patch") return true;
    return !SKILL_CATEGORIES.includes((geste.changes || {})["data.category"]);
  });
  if (sansCategorie.length > 0) {
    fail(`ces compétences conservées du SRD n'ont pas de catégorie déclarée : ${sansCategorie.join(", ")}. ` +
      "Une compétence sans `category` disparaîtrait silencieusement de l'écran (loi §0.5).");
  }

  /* ⛔ ET LE GARDE REFUSE AUSSI UN RECORD ÉTEINT, pas seulement un record
     absent. Un `disable` posé ici sur l'un des trois ids de Keen Senses
     laisserait `skill[id]` défini et le garde vert, pendant que le `ref` de
     l'Elfe tomberait dans le vide à la dérivation — la faute exacte que ce
     lot répare, réinstallée dans son propre garde. */
  for (const id of CLAIMED_BY_OTHER_LAYERS) {
    const geste = skill[id];
    if (!geste || geste.op === "disable") {
      fail(`« ${id} » est déjà référencé par une autre couche commitée (le \`granted_skill_budget\` de ` +
        `Keen Senses, dans \`fh-species-en\`), et cette couche-ci ${geste ? "l'ÉTEINT" : "ne le produit pas"}. ` +
        "Le `ref` serait mort — et il ne se verrait qu'à la dérivation, sur la fiche d'un joueur.");
    }
  }

  return { skill, kept: kept.length, added: SKILLS_ADDED.length, total, rewritten: reecrits.size };
}

/* ══ LES OUTILS ════════════════════════════════════════════════════════ */
function buildTools(srd) {
  const srdTools = (srd.records || {}).tool || {};
  const srdIds = Object.keys(srdTools);
  if (srdIds.length !== EXPECTED.srdTools) {
    fail(`la couche SRD porte ${srdIds.length} outils, la source en attend ${EXPECTED.srdTools}.`);
  }

  const tool = {};
  const reecrits = new Set();

  assertPasDeDoublon(TOOLS_REWRITTEN, TOOLS_ADDED, "tool");

  for (const entry of TOOLS_REWRITTEN) {
    tool[entry.target] = gesteDeReecriture(srd, "tool", entry, {
      /* ⛔ `variants` PART. C'est la prose du SRD qui énumère les quatre jeux
         (ou les dix instruments) : sur un record qui s'appelle désormais
         « Dice Set », elle affirmerait qu'un jeu de dés se décline en cartes.
         Un retrait dans le vide est un échec bruyant (§L7.2), donc cette
         ligne tient AUSSI lieu de garde sur la forme du record SRD. */
      remove: ["data[variants]"]
    });
    reecrits.add(entry.target);
  }

  /* LES TROIS RE-CARACTÉRISATIONS. La source déclare `was` — la
     caractéristique que le SRD porte aujourd'hui — et on la VÉRIFIE. Sans ce
     contrôle, une correction de `fh-srd` qui donnerait déjà `int` au Mason
     laisserait ici un patch qui n'a plus d'objet, et personne ne le saurait.

     ⚠️ Un patch qui n'a plus d'objet n'est pas inoffensif : il fige la valeur
     contre la source, et c'est exactement ce qu'une couche ne doit pas faire. */
  for (const entry of TOOLS_RECHARACTERISED) {
    const record = srdRecord(srd, "tool", entry.target, `la re-caractérisation « ${entry.target} »`);
    if (reecrits.has(entry.target)) {
      fail(`« ${entry.target} » est RÉÉCRIT et re-caractérisé — deux gestes de cette couche sur le même ` +
        "record, et le second écraserait la note du premier sans qu'on sache lequel a gagné.");
    }
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

       ⭐ 2026-09-09 — LE PARENT SURVIT, ET IL EST DEVENU L'UN D'EUX. La lecture
       a toujours lieu ici, sur la couche SRD brute ; ce qui a changé, c'est que
       le record lu reste dans la pile sous le nom de son héritier. */
    if (entry.inherits) {
      const parent = srdRecord(srd, "tool", entry.inherits,
        `l'outil « ${entry.name} », qui hérite son usage de « ${entry.inherits} »`);
      /* ⛔ LE GARDE A CHANGÉ DE LOI, PAS DE FORCE. Il exigeait que le parent
         soit RETIRÉ ; il exige maintenant qu'il soit RÉÉCRIT. Ce qu'il défend
         est identique : un record GÉNÉRIQUE laissé à côté de ses héritiers
         doublerait chaque maîtrise — un personnage compétent au Dice Set le
         serait aussi au « Gaming Set ». La réécriture est la seule autre façon
         de faire disparaître le générique, et elle a l'avantage de ne casser
         aucune référence. */
      if (!reecrits.has(entry.inherits)) {
        fail(`« ${entry.name} » éclate « ${entry.inherits} », que la source ne réécrit pas en l'un de ses ` +
          "héritiers. Garder le record générique à côté d'eux doublerait chaque maîtrise.");
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

  /* ⭐ 2026-09-09 — LES 25 OUTILS DU SRD SONT TOUS DANS LA PILE : aucun n'est
     plus éteint, deux sont réécrits. Le total ne bouge pas (36), parce que les
     deux héritiers ont changé de côté. */
  const kept = [...srdIds];
  const total = kept.length + TOOLS_ADDED.length;
  if (total !== EXPECTED.tools) {
    fail(`la couche rend ${total} outils (${kept.length} conservés du SRD + ${TOOLS_ADDED.length} ` +
      `neufs), la source en attend ${EXPECTED.tools}.`);
  }

  return { tool, kept: kept.length, added: TOOLS_ADDED.length, total, rewritten: reecrits.size };
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
/* 🔴 LE TRIO QUI REMPLACE PERCEPTION DANS UNE LISTE DE CLASSE — Eric,
   2026-08-20 : *« Delve, Vigilance, Survival »*.
   ⚠️ CE N'EST PAS LA SPLIT. La description de cette couche dit que Perception
   se scinde en *Vigilance, Delve et Hunting* — c'est ce que devient la
   COMPÉTENCE. Ce que devient sa place dans une LISTE DE CLASSE est une autre
   question, et Eric la tranche autrement : Survival plutôt que Hunting, le même
   trio que la bourse captive de Keen Senses. Les confondre serait croire qu'une
   liste de classe est une table de conversion ; elle dit ce qu'une classe sait
   faire. */
/* ══ LES LISTES DICTÉES — Eric écrit la liste d'une classe, elle prime ═════
   🔴 Eric, 2026-08-28, pour le barde : *« bound skills : 3 — history,
   performance, academics, persuasion, déception, streetwise »*.

   ⭐ CE QUE ÇA OUVRE, ET C'ÉTAIT LE TROU N°1 DU CHAPITRE : jusqu'ici une liste
   FH ne pouvait naître que d'un REMPLACEMENT mécanique — la classe dont la
   liste SRD nommait Perception recevait le trio. Cinq classes l'ont eu ; les
   sept autres gardaient la liste du SRD, et six d'entre elles ne pouvaient
   atteindre AUCUNE des neuf compétences neuves de Fate's Hand. Une liste
   dictée n'est pas un remplacement : c'est Eric qui dit ce qu'une classe sait
   faire, et elle bat la mécanique.
   ⛔ CHAQUE ID EST CONFRONTÉ À LA PILE comme le trio l'est déjà : une liste qui
   nommerait une compétence éteinte perdrait l'option EN SILENCE — c'est le
   défaut exact que le remplacement de Perception a refermé. */
const LISTES_DICTEES = Object.freeze({
  "srd:class:en:bard": Object.freeze([
    "srd:skill:en:history", "srd:skill:en:performance", "fh:skill:en:academics",
    "srd:skill:en:persuasion", "srd:skill:en:deception", "fh:skill:en:streetwise"
  ])
});

/* ⭐ 2026-09-09 — CET ID EST DEVENU CELUI DE VIGILANCE. Il ne quitte plus la
   liste d'une classe : il y reste, sous son nouveau nom. Ce qui s'ajoute
   autour de lui, ce sont les DEUX AUTRES membres du trio d'Eric. Le nom de la
   constante dit d'où l'id vient ; le commentaire dit ce qu'il porte. */
const PERCEPTION_ID = "srd:skill:en:perception";
const TRIO_DE_CLASSE = Object.freeze(["fh:skill:en:delve", PERCEPTION_ID, "srd:skill:en:survival"]);

function buildClasses(srd, skillIdsDeLaPile) {
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

    /* ⛔ LOT 82 — TROIS TOTAUX, ET LES TROIS SONT VÉRIFIÉS SÉPARÉMENT. Le
       bound peut valoir 0 (sept classes n'ont pas d'outil imposé) ; le free
       pool, jamais — une classe sans points libres serait une classe sans
       jeu. Les deux plages sont donc différentes, et les confondre laisserait
       passer un `free: 0` en silence. */
    for (const [champ, valeur] of [["boundSkill", entry.boundSkill], ["boundTool", entry.boundTool]]) {
      if (!Number.isInteger(valeur) || valeur < 0) {
        fail(`« ${entry.target} » reçoit un \`${champ}\` qui n'est pas un entier positif ou nul (${valeur}). ` +
          "Le bound est un nombre de points DÉJÀ placés : il peut être nul, jamais négatif.");
      }
    }
    if (!Number.isInteger(entry.free) || entry.free <= 0) {
      fail(`« ${entry.target} » reçoit un \`free\` qui n'est pas un entier strictement positif (${entry.free}). ` +
        "Le free point pool est la seule chose que le joueur dépense — à zéro, l'étape des compétences " +
        "n'aurait plus rien à proposer.");
    }
    if (!Number.isInteger(entry.expertiseFromLevel) || entry.expertiseFromLevel <= 0) {
      fail(`« ${entry.target} » reçoit un \`expertiseFromLevel\` qui n'est pas un entier positif ` +
        `(${entry.expertiseFromLevel}).`);
    }
    /* 🌱 LE PLAFOND D'EXPERTISES (2026-09-06) — deux nombres, vérifiés SÉPARÉMENT
       comme les trois totaux plus haut. `through_level` doit être un niveau ;
       `max` peut valoir 0 (un plafond qui interdit tout est une règle possible),
       jamais un négatif ni un flottant. Un plafond illisible laisserait passer un
       personnage hors règle sans un mot. */
    const cap = entry.expertiseCap;
    if (cap === null || typeof cap !== "object" || Array.isArray(cap)) {
      fail(`« ${entry.target} » reçoit un \`expertiseCap\` qui n'est pas un objet ` +
        `(${JSON.stringify(cap)}) — la convention est \`{through_level, max}\`.`);
    }
    if (!Number.isInteger(cap.through_level) || cap.through_level < 1 || cap.through_level > 20) {
      fail(`« ${entry.target} » reçoit un \`expertiseCap.through_level\` qui n'est pas un niveau 1–20 ` +
        `(${JSON.stringify(cap.through_level)}).`);
    }
    if (!Number.isInteger(cap.max) || cap.max < 0) {
      fail(`« ${entry.target} » reçoit un \`expertiseCap.max\` qui n'est pas un entier positif ou nul ` +
        `(${JSON.stringify(cap.max)}).`);
    }
    /* 🌱 LES GRANTS DE TRAIT — ils ne se confrontent PAS au SRD (un trait n'est
       l'aptitude d'aucune classe), mais leur FORME se vérifie ici, et surtout
       leur clef : deux grants pour le même trait donneraient les points deux
       fois, et un `trait` illisible donnerait un grant que rien n'ouvre. */
    if (!Array.isArray(entry.traitGrants)) {
      fail(`« ${entry.target} » reçoit un \`traitGrants\` qui n'est pas une liste ` +
        `(${JSON.stringify(entry.traitGrants)}).`);
    }
    const vusParTrait = new Set();
    for (const grant of entry.traitGrants) {
      if (typeof grant.trait !== "string" || !/^[a-z][a-z0-9-]*$/.test(grant.trait)) {
        fail(`« ${entry.target} » porte un grant de trait dont la clef \`trait\` n'est pas un slug ` +
          `(${JSON.stringify(grant.trait)}) — c'est elle que le document nomme, elle ne peut pas être libre.`);
      }
      if (vusParTrait.has(grant.trait)) {
        fail(`« ${entry.target} » porte DEUX grants pour le trait « ${grant.trait} » — le personnage recevrait ` +
          "ses points deux fois.");
      }
      vusParTrait.add(grant.trait);
      if (!Number.isInteger(grant.level) || grant.level < 1 || grant.level > 20) {
        fail(`le grant de trait « ${grant.trait} » porte un niveau illisible (${JSON.stringify(grant.level)}).`);
      }
      if (!Number.isInteger(grant.points) || grant.points < 0) {
        fail(`le grant de trait « ${grant.trait} » porte un \`points\` qui n'est pas un entier positif ou nul ` +
          `(${JSON.stringify(grant.points)}). Zéro est un cas réel — un grant peut ne porter QUE la permission.`);
      }
      if (typeof grant.feature !== "string" || grant.feature.trim() === "") {
        fail(`le grant de trait « ${grant.trait} » n'a pas de \`feature\` utilisable — c'est le mot que le ` +
          "joueur lira dans le détail de son pool (loi §0.13).");
      }
      /* 🔒 LOT 171 — un trait qui OUVRE l'Expertise dit COMBIEN (Eric, 07/09 :
         *« une Expertise grâce à Late Bloomer »*). Un grant qui ouvre sans
         compter laisserait un Wizard de niveau 1 en acheter autant que son pool
         en paie — et rien ne le dirait. */
      if (grant.unlocksExpertise === true && (!Number.isInteger(grant.maxExpertise) || grant.maxExpertise < 0)) {
        fail(`le grant de trait « ${grant.trait} » ouvre l'Expertise sans porter un \`maxExpertise\` entier ` +
          `positif ou nul (${JSON.stringify(grant.maxExpertise)}) — une permission sans compte est un plafond absent.`);
      }
    }
    /* ⛔ CHAQUE GRANT EST CONFRONTÉ AU SRD, JAMAIS CRU SUR PAROLE (lot 82).
       Le canon nomme une aptitude et un niveau ; la couche SRD les porte tous
       les deux. Un grant qui viserait une aptitude inexistante — ou la bonne
       aptitude au mauvais niveau — donnerait des points au personnage au nom
       d'une chose qu'il n'a pas, et rien ne le dirait. C'est aussi ce garde
       qui a mesuré que *Bonus Proficiencies* est une aptitude de SOUS-CLASSE
       et pas de classe : il l'aurait refusée. */
    const recordDeClasse = srdRecord(srd, "class", entry.target, "les aptitudes");
    const aptitudes = (recordDeClasse.data || {}).features;
    for (const grant of entry.grants) {
      const trouvée = (Array.isArray(aptitudes) ? aptitudes : [])
        .some((f) => f && f.name === grant.feature && f.level === grant.level);
      if (!trouvée) {
        const proches = (Array.isArray(aptitudes) ? aptitudes : [])
          .filter((f) => f && f.name === grant.feature).map((f) => f.level);
        fail(`« ${entry.target} » reçoit un grant sur l'aptitude « ${grant.feature} » au niveau ${grant.level}, ` +
          `et le SRD ne la porte pas à ce niveau${proches.length ? ` (il la porte au niveau ${proches.join(", ")})` : ""}. ` +
          "Un grant accroché à une aptitude que le personnage n'a pas lui donnerait des points au nom de rien.");
      }
    }

    /* ══ LÀ OÙ LA LISTE DE CLASSE NOMMAIT PERCEPTION — Eric, 2026-08-20,
       en une ligne : *« Delve, Vigilance, Survival »*.

       🔴 CE QUE ÇA RÉPARAIT, ET C'ÉTAIT UN TROU SILENCIEUX. Cette couche
       ÉTEIGNAIT Perception, et cinq listes de classe du SRD la NOMMAIENT
       encore — une liste qui désigne un record éteint ne provoque aucun refus :
       l'option disparaît, simplement. Mesuré sur le Rogue : dix compétences
       déclarées, NEUF offertes, et rien nulle part ne disait laquelle manquait.

       ⭐ 2026-09-09 — LE TROU S'EST REFERMÉ TOUT SEUL, ET C'EST LE LOT 185.
       `srd:skill:en:perception` n'est plus éteint : il est RÉÉCRIT en Vigilance.
       Les cinq listes le nomment donc toujours, et il désigne toujours quelque
       chose. Ce qui reste à faire ici n'est plus un remplacement, c'est un
       AJOUT : les deux autres membres du trio d'Eric viennent se poser à côté
       de lui. Le garde qui confronte chaque membre à la pile reste, entier —
       Delve, lui, est bien un record neuf, et il peut toujours manquer.

       ⭐ ET LE TRIO EST CELUI D'ERIC, PAS CELUI DE LA SPLIT. La description de
       cette couche dit que Perception se scinde en *Vigilance, Delve et
       Hunting* ; pour une LISTE DE CLASSE il tranche autrement — Delve,
       Vigilance, **Survival** — et c'est le même trio que la bourse captive de
       Keen Senses. Une liste de classe n'est pas une table de conversion : elle
       dit ce qu'une classe sait faire.

       ⛔ SANS DOUBLON ET SANS DÉPLACEMENT : Survival est DÉJÀ dans quatre des
       cinq listes ; elle y garde sa place, et seul le Rogue la gagne. Vigilance
       garde la place que Perception occupait — c'est le même record —, et Delve
       se pose juste après elle.
       ⚠️ CHAQUE MEMBRE DU TRIO EST CONFRONTÉ À LA COUCHE, jamais cru sur parole
       — même discipline que les grants juste au-dessus : une liste qui offrirait
       une compétence inexistante rejouerait exactement le trou qu'on referme. */
    const listeSrd = ((recordDeClasse.data || {}).skill_choice || {}).from;
    let listeFh = null;
    /* ⭐ LA LISTE DICTÉE PASSE AVANT LA MÉCANIQUE (voir LISTES_DICTEES) : quand
       Eric a écrit la liste d'une classe, il n'y a plus rien à déduire. */
    const dictee = LISTES_DICTEES[entry.target];
    if (dictee) {
      for (const id of dictee) {
        if (!skillIdsDeLaPile.has(id)) {
          fail(`« ${entry.target} » verrait sa liste DICTÉE offrir « ${id} », que la pile ne porte pas. ` +
            "Une liste qui nomme une compétence inexistante perd l'option en silence.");
        }
      }
      listeFh = [...dictee];
    } else if (Array.isArray(listeSrd) && listeSrd.includes(PERCEPTION_ID)) {
      for (const id of TRIO_DE_CLASSE) {
        if (!skillIdsDeLaPile.has(id)) {
          fail(`« ${entry.target} » verrait sa liste offrir « ${id} », que la pile ne porte pas. ` +
            "Une liste de classe qui nomme une compétence inexistante perd l'option en silence — " +
            "c'est le défaut même que ce remplacement referme.");
        }
      }
      listeFh = [];
      for (const id of listeSrd) {
        if (!listeFh.includes(id)) listeFh.push(id);
        /* ⭐ L'ID DE PERCEPTION RESTE À SA PLACE — il porte Vigilance depuis la
           réécriture. Ce sont les DEUX AUTRES membres du trio qui s'insèrent
           juste après lui, et seulement s'ils ne sont pas déjà dans la liste
           du SRD (Survival y est dans quatre listes sur cinq). */
        if (id === PERCEPTION_ID) {
          for (const neuf of TRIO_DE_CLASSE) {
            if (!listeFh.includes(neuf) && !listeSrd.includes(neuf)) listeFh.push(neuf);
          }
        }
      }
      for (const neuf of TRIO_DE_CLASSE) if (!listeFh.includes(neuf)) listeFh.push(neuf);
    }

    servis.add(entry.target);
    klass[entry.target] = {
      op: "patch",
      changes: {
        ...(listeFh ? { "data[skill_choice][from]": listeFh } : {}),
        /* ══ LES POINTS LIÉS DEVIENNENT UNE BOURSE CAPTIVE — 2026-08-20 ══════
           🔴 CE QUE ÇA REMPLACE, ET C'ÉTAIT UN FAUX MAGASIN. Le choix SRD
           `class.skills[n]` ne coûtait RIEN au pool et n'accordait RIEN : la
           compétence choisie ressortait `proficiency: "none"`. Cette couche
           avait AJOUTÉ son pool à côté du système SRD au lieu de le remplacer —
           pour l'arrière-plan, le lot 35 avait bien éteint l'ancien ; les
           classes étaient restées avec deux systèmes côte à côte, dont un mort.

           ⭐ ET LA MÉCANIQUE EXISTAIT DÉJÀ SOUS UN AUTRE NOM : la bourse captive
           de l'espèce (Keen Senses) est « du bound sous son nom de moteur ».
           Elle est générique depuis ce jour ; la classe la porte à son tour.
           ⛔ AUCUNE LISTE RECOPIÉE : un budget captif de CLASSE est captif de la
           liste de sa classe (`skill_choice.from`, juste au-dessus). Le moteur
           la lit là où elle vit. */
        "data[granted_skill_budget]": { points: entry.boundSkill },
        /* 🔴 ET LE COMPTE SRD TOMBE À ZÉRO — c'est la moitié qui ÉTEINT l'ancien
           système, et sans elle la bascule est un doublon, pas un remplacement.
           📏 Mesuré : `validate` refusait par `skill-grant.count-mismatch` — la
           classe déclarait deux maîtrises à choisir et le personnage n'en
           répondait aucune, puisqu'il dépense désormais des points. Un
           personnage complet restait donc éternellement en faute.
           ⛔ ON NE RETIRE PAS `skill_choice` POUR AUTANT : sa liste `from` EST
           la liste de la classe, celle dont la bourse est captive (*« only
           inside your class list »*, canon §B.1). C'est le COMPTE qui n'a plus
           d'objet, pas la liste. */
        "data[skill_choice][count]": 0,
        "data[fh_skill_pool]": {
          /* ⭐ LOT 82 — LES TROIS TOTAUX DU CANON §B.1, publiés tels quels.
             Le `base` unique est mort : il forçait le moteur à déduire les
             imposés par soustraction, et cette soustraction est ce qui a
             laissé six pools faux vivre des mois. ⛔ Le bound n'entre JAMAIS
             dans le pool (canon §B.0) — ce sont des points déjà dépensés. */
          bound_skill_points: entry.boundSkill,
          bound_tool_points: entry.boundTool,
          free_point_pool: entry.free,
          /* ⭐ LOT 82 — DEUX ÉCHELLES, JAMAIS FUSIONNÉES (canon §B.1septies).
             `by_level` se compte sur le niveau DU PERSONNAGE, `by_class_level`
             sur les niveaux DANS CETTE CLASSE. Les additionner rendait un
             Barde 4 / Guerrier 4 trop riche de quatre points. */
          by_level: entry.byLevel,
          by_class_level: entry.byClassLevel,
          /* ⭐ LES APTITUDES QUI TENDENT DES POINTS (canon §B.1ter), À PART
             DE L'ÉCHELLE. Les fondre dans `by_level` perdrait la PERMISSION
             qu'elles portent, et la permission est la moitié de ce qu'elles
             sont. Le barde en est la preuve : à son niveau 2 il gagne le +1
             de l'échelle ET son aptitude d'Expertise — deux règles, deux
             lignes, jamais un « +5 » qui les avale. */
          grants: entry.grants,
          /* 🌱 LES GRANTS D'UN TRAIT (2026-09-06) — même forme que `grants`, plus
             la clef `trait` qui NOMME ce que le document doit déclarer pour que
             le grant s'ouvre. Aujourd'hui un seul : Late Bloomer, +2 points
             libres et la permission d'acheter l'expertise au niveau 1.
             ⛔ Ils ne sont pas dans `grants` : celle-ci se dit « une entrée par
             aptitude de classe » et chacune est confrontée au SRD. Un trait n'est
             l'aptitude d'aucune classe. */
          trait_grants: entry.traitGrants,
          tier_costs: { ...TIER_COSTS },
          /* 🌱 LE PLAFOND DU NIVEAU 1 (Eric, 06/09 : *« deux expertises max au
             niveau 1 »*, *« pour lui comme pour n'importe qui »*). Deux nombres
             LUS, comme `expertise_from_level` juste dessous — figer le 2 dans le
             moteur referait la faute que celui-ci répare. */
          expertise_cap: entry.expertiseCap,
          /* PAR CLASSE, jamais une constante unique. TROIS classes dérogent
             depuis le lot 82 (canon §B.1ter — un trait qui accorde
             l'Expertise tend aussi la permission de l'acheter tôt) : Rogue 1,
             Bard 2, Ranger 2. Les neuf autres reçoivent
             `DEFAULT_EXPERTISE_FROM_LEVEL` (4) par le `.map` de la source. */
          expertise_from_level: entry.expertiseFromLevel
        }
      },
      note: "Fate's Hand — canon §B.1: bound " + entry.boundSkill + " skill / " + entry.boundTool +
        " tool points already placed, " + entry.free + " free points to spend"
    };
  }

  const oubliées = srdIds.filter((id) => !servis.has(id));
  if (oubliées.length > 0) {
    fail(`ces classes du SRD n'ont pas de pool : ${oubliées.join(", ")}. Un personnage de cette classe ` +
      "n'aurait aucun point à dépenser, et rien ne le dirait (loi §0.5).");
  }

  return { class: klass, total: servis.size };
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
  /* ⭐ LES CLASSES REÇOIVENT LA LISTE DES COMPÉTENCES QUE LA PILE PORTE. Sans
     elle, la liste d'une classe pourrait nommer une compétence éteinte, et
     l'option disparaîtrait sans un mot — c'est exactement le trou que le trio
     de classe referme. */
  const idsDesCompetences = new Set(Object.entries(skills.skill)
    .filter(([, rec]) => rec.op !== "disable")
    .map(([id]) => id)
    .concat(Object.keys(srd.records.skill || {})
      .filter((id) => !skills.skill[id] || skills.skill[id].op !== "disable")));
  const classes = buildClasses(srd, idsDesCompetences);

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
        "Instrument — have been renamed, split or modified for this work."
    },
    description: LAYER.description,
    records: {
      skill: skills.skill,
      tool: tools.tool,
      class: classes.class
    }
  };

  assertNoHandWrittenSrdText(layer, srd);

  return { layer, skills, tools, classes };
}

export function serialize(layer) {
  return JSON.stringify(layer, null, 2) + "\n";
}

/** Génère la couche et l'ÉCRIT. `outDir` et `srdPath` sont des arguments : la
 *  suite génère dans un répertoire temporaire et compare là. */
export function generate({ outDir = OUT_DIR, srdPath = SRD_PATH } = {}) {
  const { layer, skills, tools, classes } = buildLayer({ srd: readSrdLayer(srdPath) });
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUT_NAME);
  writeFileSync(outPath, serialize(layer));
  return { outPath, skills, tools, classes };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { outPath, skills, tools, classes } = generate();
  console.log(`fh-skills : ${skills.total} compétences (${skills.kept} SRD dont ${skills.rewritten} réécrite(s) ` +
    `+ ${skills.added} neuves), ${tools.total} outils (${tools.kept} SRD dont ${tools.rewritten} réécrits ` +
    `+ ${tools.added} neufs), ${classes.total} pools de classe → ${outPath}`);
}

export { OUT_NAME, SRD_PATH };
