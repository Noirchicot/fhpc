/* ══ LES TESTS D'ACCEPTATION DU LOT 23 — LE POOL DE POINTS ═══════════
   Le lot 22 a livré la MATIÈRE (douze pools, leur progression, leurs coûts) et
   a refusé la dérivation, sur un trou de contrat que la commande niait. Cette
   suite dit si la dérivation, une fois l'arbitrage rendu, est juste.

   CINQ TESTS, ET LE DEUXIÈME EST CELUI QUI COMPTE :

   1. Rogue 18, Wizard 12, Druide 14 — NOMMÉMENT, terme par terme, jamais un
      total nu. Et le total publié est ce qui RESTE à répartir.
   2. LE BARDE créé AU NIVEAU 5 : les paliers TRAVERSÉS et pas un de plus
      (règle Q15-8 d'Eric). Le nombre se démontre ligne à ligne.
   3. Un Araag et un Humain de même classe et de même niveau n'ont pas le même
      pool, et l'écart CITE le trait d'espèce qui le produit.
   4. LE SRD PUR : `stats` vide, la déclaration le dit, et aucune ligne du
      chemin commun ne cite un pool (loi §0.12).
   5. SANS LA COUCHE : le drapeau levé, la couche des compétences absente — le
      terme se DÉCLARE et AUCUN nombre n'est fabriqué.

   Plus LES ATTAQUES. Un garde qui asserte un COMPTE est le défaut type de ce
   lot : « pool = 18 » passerait avec 18 obtenu de la mauvaise façon. Chaque
   assertion de total est donc doublée d'une assertion sur les TERMES, et les
   gardes sont violés pour de bon.

   ⚠️ AUCUNE ÉCRITURE HORS MÉMOIRE : `tests/tree-immuable.test.mjs` rejoue
   toute la suite entre deux relevés de l'arbre. Les couches de scénario sont
   fabriquées en mémoire et montées par-dessus.

   ⚠️ ET AUCUN DOCUMENT AU-DESSUS DU NIVEAU 1 N'EST VALIDÉ CONTRE `fh-char/1` :
   `vitals.hpMax` n'est dérivable d'aucun champ mécanique du contrat au-delà,
   et il est donc ABSENT — à raison. C'est la même mesure qu'au lot 19. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

import { ROOT, SRD_EN, FH_SPECIES_EN, FH_FEATS_EN, makeHarness, manifestOf, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILLS_FLAG, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";
import { createFhDestinyStat, FH_DESTINY_ID } from "../src/modules/fh/destiny-stat.mjs";
import { statSumViolations } from "../src/build/validate.mjs";
/* LOT 41 — `underived[].reason` → `{key, params}`, deux paquets composés. */
import { createLabels, renderUnderived, FR_UNDERIVED } from "../src/labels.mjs";
import { FH_UNDERIVED_FR } from "../src/modules/fh/labels.mjs";

const frUnderived = createLabels(FR_UNDERIVED, FH_UNDERIVED_FR);

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";

const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateChar = ajv.compile(JSON.parse(readFileSync(join(ROOT, "schemas/fh-char.schema.json"), "utf8")));

/* ── LA PILE ET LE PERSONNAGE ────────────────────────────────────────
   SRD anglais dessous, la couche des espèces (les bumps) et la couche des
   compétences (les pools) par-dessus. Les deux couches FH sont montées
   séparément EXPRÈS : le test 5 en retire une pour prouver la déclaration. */
function pilePool(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhSkillPoolStat()]
  }, options));
}

/** La même pile, avec la couche des DONS montée en plus (lot 24) — c'est elle
 *  qui patche `srd:feat:en:skilled` à +6. Les acceptations 1 à 5 et les
 *  attaques du lot 23 ne la montent pas : elle n'existait pas encore, et un
 *  personnage sans don d'origine choisi n'en a de toute façon rien à lire. */
function pilePoolAvecDons(options = {}) {
  return pilePool(Object.assign({ layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN, FH_FEATS_EN] }, options));
}

/** Les choix d'un personnage. `class`, `species` et `background` sont des
 *  `ref` — c'est par là que le module atteint la classe et l'arrière-plan.
 *
 *  ⚠️ LES MAÎTRISES QUE LES SOURCES FONT CHOISIR SONT RÉPONDUES. Elles ne
 *  servent pas le pool (le module compte le `count` DÉCLARÉ, pas les réponses),
 *  elles servent `validate` : une source qui déclare `{count}` et n'en reçoit
 *  pas autant est une violation préexistante, et elle masquerait la nôtre. */
function choixDe({ level, classId, speciesId, backgroundId, skills = [], speciesSkill }) {
  const choices = [
    { path: "level", value: level, label: `Level ${level}` },
    { path: "class", ref: { kind: "class", id: classId }, label: "Class" },
    { path: "species", ref: { kind: "species", id: speciesId }, label: "Species" },
    { path: "background", ref: { kind: "background", id: backgroundId }, label: "Background" },
    { path: "abilities.str", value: 10 },
    { path: "abilities.dex", value: 14 },
    { path: "abilities.con", value: 12 },
    { path: "abilities.int", value: 14 },
    { path: "abilities.wis", value: 12 },
    { path: "abilities.cha", value: 14 },
    { path: "currency.cp", value: 0 },
    { path: "currency.sp", value: 0 },
    { path: "currency.gp", value: 15 },
    { path: "currency.pp", value: 0 },
    /* LOT 43 — l'Inheritance exige exactement 3 points de boost (§1d) ; sans
       eux `validate()` refuse un total absent (0 !== 3), et cette suite ne
       teste pas les boosts eux-mêmes. */
    { path: "background.boost.int", value: 2 },
    { path: "background.boost.con", value: 1 }
  ];
  skills.forEach((slug, index) => choices.push({ path: `class.skills[${index}]`, value: slug }));
  if (speciesSkill) choices.push({ path: "species.granted", value: speciesSkill });
  return choices;
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot23-pool",
    name: "Pool",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-skill-pool", version: "1.0.0" },
    created: "2026-08-09T09:00:00Z",
    modified: "2026-08-09T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

/** Le don d'origine, à SA place (`background.originFeat[n]`), hors du
 *  namespace de ce module — même convention que `fh-arcana.test.mjs` (lot 20),
 *  qui l'a ouverte pour le Score de Destinée. */
const donDe = (id, index = 0) => ({ path: `background.originFeat[${index}]`, ref: { kind: "feat", id }, label: "Origin feat" });

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const somme = (stat) => stat.breakdown.reduce((total, line) => total + line.value, 0);
const terme = (stat, label) => stat.breakdown.find((line) => line.label === label);

/* REWRITTEN 2026-08-12 (lot 35) — L'INHERITANCE reste l'arrière-plan de tous les
   scénarios, mais l'Inheritance (addendums §4, Eric 2026-08-12) a éteint son
   `skill_ids` et son `tool_id` : il n'impose plus rien au pool. Son seul rôle
   ici est de fournir un `ref` de genre `background` valide au module. */
const INHERITANCE = "fh:background:en:inheritance";

/* ══ ACCEPTATION 1 ════════════════════════════════════════════════════
   « Un Rogue niveau 1 publie un pool de 18 ; un Wizard niveau 1, 12 ; un
   Druide, 14. Nommément, pas un compte. »

   ⚠️ CORRECTION MESURÉE DE LA COMMANDE, ET ELLE EST AU CŒUR DU LOT. 18, 12 et
   14 sont les POOLS DE CLASSE — le premier terme du détail. Le total PUBLIÉ est
   ce qui reste après déduction des imposés, parce que le lot dit lui-même que
   les imposés se déduisent. Les deux affirmations ne peuvent pas être vraies du
   même nombre.

   REWRITTEN 2026-08-12 (lot 35) — L'arrière-plan n'impose plus rien
   (addendums §4, « L'arrière-plan n'existe plus en Fate's Hand ») : seuls les
   imposés de CLASSE se déduisent désormais. La fourchette « 7–10 » qu'Eric
   visait au lot 23 décrivait le cas AVEC arrière-plan imposé ; la mesure du
   2026-08-12 la remplace : Wizard 12−2 = 10 (contre 7 avant ce lot), Druide
   14−2 = 12, Rogue 18−4 = 14. Ce test asserte LES DEUX : le terme nommé ET le
   total, terme par terme. */

test("ACCEPTATION 1 — Rogue 18, Wizard 12, Druide 14, chacun NOMMÉ dans son détail", () => {
  /* La table attendue. `imposedSkills` est le `skill_choice.count` de la
     classe, RELU sur la pile plus bas : l'écrire ici et le relire là est ce qui
     empêche le test de se prouver à lui-même. */
  const attendu = [
    { classId: "srd:class:en:rogue", nom: "Rogue", base: 18, imposes: 4, total: 14 },
    { classId: "srd:class:en:wizard", nom: "Wizard", base: 12, imposes: 2, total: 10 },
    { classId: "srd:class:en:druid", nom: "Druid", base: 14, imposes: 2, total: 12 }
  ];

  for (const cas of attendu) {
    const h = pilePool();
    /* Le Halfling ne porte AUCUN `skill_points` : le pool de ce test est donc
       purement de classe et d'arrière-plan, et un bump d'espèce qui s'y
       glisserait ferait rougir le total. */
    const out = h.verbs.rebuild({
      document: documentDe(h, choixDe({
        level: 1, classId: cas.classId, speciesId: "srd:species:en:halfling", backgroundId: INHERITANCE
      }))
    });
    const stat = poolDe(out.resolved);
    assert.ok(stat, `« ${cas.nom} » publie une entrée de pool`);
    assert.equal(stat.flag, FH_SKILLS_FLAG, "elle NOMME le drapeau qui l'a activée");
    assert.equal(stat.name, "Skill Points", "et son nom vient du paquet de mots de la couche, pas du moteur");

    /* ⛔ LE DÉTAIL ENTIER, COMPARÉ COMME UN OBJET — jamais une projection.
       C'est la leçon de la revue du 2026-08-08 : comparer un sous-ensemble
       laisse passer un terme surnuméraire sans rougir.
       REWRITTEN 2026-08-12 (lot 35) — plus de lignes Acolyte : l'Inheritance
       n'impose plus de compétences ni d'outil (addendums §4). */
    assert.deepEqual(stat.breakdown, [
      { label: `Class Pool · ${cas.nom}`, value: cas.base, source: { kind: "class", id: cas.classId } },
      {
        label: `${cas.nom} · ${cas.imposes} imposed choices`,
        value: -cas.imposes,
        source: { kind: "class", id: cas.classId }
      }
    ], `le détail de « ${cas.nom} », terme par terme`);

    /* LE POOL DE CLASSE EST BIEN 18/12/14, NOMMÉMENT. */
    assert.equal(terme(stat, `Class Pool · ${cas.nom}`).value, cas.base,
      `le pool de classe de « ${cas.nom} » vaut ${cas.base}`);
    assert.equal(stat.value, cas.total, `et il reste ${cas.total} points à répartir`);
    assert.equal(stat.value, somme(stat), "`value` EST la somme de son détail");

    /* ⛔ AUCUN NOMBRE N'EST ÉCRIT DANS LE MODULE : les trois valeurs du détail
       sont RELUES sur la pile. Si la couche change, le test change avec elle —
       et un module qui aurait recopié 18 en dur rougirait ici. */
    const classe = h.layers.verbs.query({ kind: "class", id: cas.classId }).record.data;
    assert.equal(classe.fh_skill_pool.base, cas.base, "le pool vient du record de classe");
    assert.equal(classe.skill_choice.count, cas.imposes, "le nombre d'imposés vient du record de classe");
    assert.equal(classe.fh_skill_pool.tier_costs.imposed, 1, "et leur coût unitaire aussi");
    /* REWRITTEN 2026-08-12 (lot 35) — l'arrière-plan n'impose plus rien : ces
       deux champs ont disparu du record avec l'extinction (addendums §4). */
    const fond = h.layers.verbs.query({ kind: "background", id: INHERITANCE }).record.data;
    assert.equal(fond.skill_ids, undefined, "l'Inheritance a éteint les compétences imposées de l'arrière-plan");
    assert.equal(fond.tool_id, undefined, "et l'outil imposé aussi");

    /* Au niveau 1 le document valide, et c'est ce qui prouve que l'ancre
       `fh:skill-points` est adressable et pas seulement plausible. */
    assert.equal(validateChar(out.document), true, ajv.errorsText(validateChar.errors));
    assert.deepEqual(statSumViolations(out.resolved), [], "`validate` n'a rien à redire à la somme");
  }
});

/* ══ ACCEPTATION 2 — LE BARDE, ET C'EST LE TEST QUI COMPTE ════════════ */

test("ACCEPTATION 2 — un BARDE créé AU NIVEAU 5 porte les paliers TRAVERSÉS, et pas un de plus", () => {
  /* RÈGLE Q15-8 D'ERIC : « un personnage créé à un niveau donné reçoit les
     paliers qu'il a TRAVERSÉS. Créé au niveau 5 : il a le palier 1 ET le
     palier 3 — pas celui du niveau 6. » « À la création » ne veut donc PAS dire
     « au niveau 1 », et ce personnage-ci est créé DIRECTEMENT au niveau 5 : il
     n'est pas monté niveau par niveau, aucune tranche précédente n'existe.

     Le barde est le seul cas où la faute se voit : sa progression touche
     CHAQUE niveau. Une dérivation qui ne compterait que le dernier palier lui
     donnerait +1 au lieu de +6 ; une qui compterait tout le tableau lui
     donnerait le +1 du niveau 6 qu'il n'a pas traversé. */
  const h = pilePool();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 5, classId: "srd:class:en:bard", speciesId: "srd:species:en:halfling", backgroundId: INHERITANCE
    }))
  });
  const stat = poolDe(out.resolved);
  assert.ok(stat, "le barde publie son pool");

  /* LE NOMBRE SE DÉMONTRE TERME PAR TERME. Quatre paliers, chacun sur sa
     ligne, chacun avec son niveau — c'est ce qui rend l'absence du sixième
     VISIBLE au lieu d'être une soustraction qu'il faut croire sur parole.
     REWRITTEN 2026-08-12 (lot 35) — plus de lignes Acolyte : l'Inheritance
     n'impose plus rien (addendums §4). */
  assert.deepEqual(stat.breakdown, [
    { label: "Class Pool · Bard", value: 16, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Level 2", value: 1, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Level 3", value: 1, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Level 4", value: 3, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Level 5", value: 1, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Bard · 3 imposed choices", value: -3, source: { kind: "class", id: "srd:class:en:bard" } }
  ]);
  assert.equal(stat.value, 19, "16 de pool + 6 de paliers traversés − 3 d'imposés (lot 35 : l'arrière-plan n'en impose plus)");
  assert.equal(stat.value, somme(stat));

  /* ⛔ LE PALIER DU NIVEAU 6 EXISTE DANS LA COUCHE, ET IL N'EST PAS LÀ. C'est
     l'assertion centrale du lot : sans elle, une dérivation qui prendrait tout
     le tableau donnerait 17 et personne ne verrait d'où vient le point. */
  const progression = h.layers.verbs.query({ kind: "class", id: "srd:class:en:bard" })
    .record.data.fh_skill_pool.by_level;
  assert.equal(progression["6"], 1, "la couche PORTE bien un palier au niveau 6 — il existe, il n'est pas traversé");
  assert.equal(terme(stat, "Level 6"), undefined, "et le personnage créé au niveau 5 ne l'a PAS");
  for (const niveau of [7, 8, 12, 16, 20]) {
    assert.equal(terme(stat, `Level ${niveau}`), undefined, `ni celui du niveau ${niveau}`);
  }

  /* ET LE +1 PAR NIVEAU DU BARDE N'EST PAS RECOMPOSÉ ICI. La couche a déjà
     fusionné son +1 avec le +2 universel du niveau 4 : elle donne 3, et le
     module le recopie. Un moteur qui écrirait « +2 tous les 4 niveaux »
     porterait une règle de jeu — ce que le lot 22 a refusé d'y mettre. */
  assert.equal(progression["4"], 3, "le +3 du niveau 4 est CALCULÉ PAR LA COUCHE (son +1 et le +2 universel)");
  assert.equal(terme(stat, "Level 4").value, progression["4"], "et le module le RECOPIE, il ne le recompose pas");

  /* LA PREUVE PAR LE CONTRASTE : le même barde au niveau 6 gagne exactement
     un point de plus, et c'est la ligne du niveau 6 qui apparaît. */
  const h6 = pilePool();
  const doc6 = documentDe(h6, choixDe({
    level: 6, classId: "srd:class:en:bard", speciesId: "srd:species:en:halfling", backgroundId: INHERITANCE
  }));
  const stat6 = poolDe(h6.verbs.rebuild({ document: doc6 }).resolved);
  assert.equal(stat6.value, 20, "au niveau 6, un point de plus (REWRITTEN 2026-08-12, lot 35 : base 19 + 1)");
  assert.deepEqual(terme(stat6, "Level 6"),
    { label: "Level 6", value: 1, source: { kind: "class", id: "srd:class:en:bard" } },
    "et c'est la ligne du palier 6 qui l'apporte, nommée");

  /* ⚠️ Le magicien de même niveau ne gagne RIEN entre 5 et 6 — la preuve que
     la ligne ci-dessus vient du barde et pas du niveau. */
  const hw = pilePool();
  const wizard5 = poolDe(hw.verbs.rebuild({
    document: documentDe(hw, choixDe({
      level: 5, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling", backgroundId: INHERITANCE
    }))
  }).resolved);
  assert.deepEqual(wizard5.breakdown.filter((line) => line.label.startsWith("Level ")),
    [{ label: "Level 4", value: 2, source: { kind: "class", id: "srd:class:en:wizard" } }],
    "le magicien niveau 5 n'a traversé qu'un palier : le +2 universel du niveau 4");
});

/* ══ ACCEPTATION 3 ════════════════════════════════════════════════════ */

test("ACCEPTATION 3 — Araag et Humain de même classe diffèrent, et l'écart CITE le trait", () => {
  /* ⚠️ LE NIVEAU N'EST PAS UN GOÛT. Au niveau 1 les deux espèces donnent +2
     (`Fast Learner` et `Educated` ont toutes deux un palier au niveau 1) : le
     test serait VERT ET AVEUGLE. Au niveau 3, l'Araag a traversé son second
     palier et l'Humain n'en a qu'un — l'écart apparaît, et il vaut exactement
     un palier. */
  const construire = (speciesId) => {
    const h = pilePool();
    const out = h.verbs.rebuild({
      document: documentDe(h, choixDe({
        level: 3, classId: "srd:class:en:fighter", speciesId, backgroundId: INHERITANCE
      }))
    });
    return { h, stat: poolDe(out.resolved), underived: out.underived };
  };
  const araag = construire("fh:species:en:araag");
  const humain = construire("srd:species:en:human");

  /* ⚠️ RÉÉCRIT LE 2026-08-17 — LE NET ZÉRO A DISPARU DES DEUX ESPÈCES. Elles
     portaient un `granted_skill_choice` EN PLUS de leur barème de points ;
     Eric a fait absorber ce don par `Fast Learner` (Araag) et par `Skillful`
     (Humain). ⭐ ET LES DEUX TOTAUX SONT INCHANGÉS — 14 et 12 — parce que la
     paire s'annulait : la retirer ne retranche rien. C'est la meilleure preuve
     que le net zéro faisait bien ce qu'il annonçait. */
  /* REWRITTEN 2026-08-12 (lot 35) — l'arrière-plan n'impose plus rien
     (addendums §4) : seul l'imposé de CLASSE (2, le Fighter) se déduit
     encore, là où 5 se déduisaient avant ce lot (2 classe + 2+1 arrière-plan). */
  assert.notEqual(araag.stat.value, humain.stat.value, "les deux pools DIFFÈRENT");
  assert.equal(araag.stat.value, 14, "Araag : 12 de pool + 2 + 2 des paliers d'espèce − 2 d'imposés");
  assert.equal(humain.stat.value, 12, "Humain : 12 de pool + 2 du seul palier de création − 2 d'imposés");
  assert.equal(araag.stat.value - humain.stat.value, 2, "et l'écart vaut exactement un palier d'espèce, PAS le grant");

  /* L'ÉCART CITE LE TRAIT — et le mot vient du RECORD, recopié (loi §0.13).
     📌 Le trait de l'Humain s'appelle désormais `Skillful`, le nom du SRD :
     Eric l'a préféré au `Educated` maison (*« non, SRD de base si possible »*). */
  const lignesEspece = (stat) => stat.breakdown.filter((line) => line.source && line.source.kind === "species");
  assert.deepEqual(lignesEspece(araag.stat), [
    { label: "Fast Learner · Level 1", value: 2, source: { kind: "species", id: "fh:species:en:araag" } },
    { label: "Fast Learner · Level 3", value: 2, source: { kind: "species", id: "fh:species:en:araag" } }
  ], "l'Araag porte DEUX paliers traversés, et plus aucune paire de net zéro");
  assert.deepEqual(lignesEspece(humain.stat), [
    { label: "Skillful · Level 1", value: 2, source: { kind: "species", id: "srd:species:en:human" } }
  ], "l'Humain porte UN seul palier, sous le nom du SRD — et son trait ne s'appelle pas comme celui de l'Araag");

  /* LE MOT EST CELUI DU RECORD, PAS UN MOT DU MOTEUR. */
  const traitDe = (h, id, champ, traitId) => {
    const data = h.layers.verbs.query({ kind: "species", id }).record.data;
    return (data[champ] || []).find((item) => item.id === traitId);
  };
  assert.equal(traitDe(araag.h, "fh:species:en:araag", "traits", "fast-learner").name, "Fast Learner");
  /* ⚠️ 2026-08-17 : le trait de l'Humain a changé de MAISON en même temps que
     de nom. `Educated` vivait dans `fh_traits` (un ajout FH) ; `Skillful` vit
     dans `data.traits`, parce que c'est un trait du SRD dont Fate's Hand n'a
     changé que la monnaie. Le mot vient toujours du record, jamais du moteur. */
  assert.equal(traitDe(humain.h, "srd:species:en:human", "traits", "skillful").name, "Skillful");

  /* ⛔ ET LE PALIER DU NIVEAU 6 DE L'ARAAG N'EST PAS LÀ — la règle Q15-8 tient
     aussi sur l'espèce, pas seulement sur la classe. */
  const bumps = araag.h.layers.verbs.query({ kind: "species", id: "fh:species:en:araag" }).record.data.skill_points;
  assert.equal(bumps.by_level["6"], 2, "la couche porte bien un palier d'espèce au niveau 6");
  assert.equal(terme(araag.stat, "Fast Learner · Level 6"), undefined, "et l'Araag niveau 3 ne l'a pas traversé");

  /* ⚠️ RÉÉCRIT LE 2026-08-17. L'Araag n'a plus de `granted_skill_choice` : la
     paire de lignes qui remplaçait l'ancienne déclaration `imposed.species` a
     disparu avec lui. Ce qui reste vrai, et que ce test garde, c'est qu'AUCUNE
     déclaration ne revient à sa place — un don retiré ne rouvre pas la
     question que le lot 24 avait fermée. */
  const champ = `stats[${FH_SKILL_POOL_ID}].imposed.species`;
  assert.equal(araag.underived.find((entry) => entry.field === champ), undefined,
    "la déclaration du lot 23 n'a plus lieu d'être : la question qu'elle posait est tranchée");
  assert.equal(araag.stat.breakdown.some((line) => line.value < 0 && line.source.kind === "species"), false,
    "et plus aucune déduction d'espèce n'est publiée : il n'y a plus de grant à placer");
});

/* ══ ACCEPTATION 4 — LE SRD PUR ═══════════════════════════════════════ */

test("ACCEPTATION 4 — couche FH débrayée : `stats` est VIDE et la déclaration le dit", () => {
  /* La pile ne monte QUE le SRD anglais. Le module est pourtant injecté : c'est
     ce qui rend le test dur — un module qui tournerait sans son drapeau
     publierait un pool sur un personnage qui n'en a pas. */
  const h = makeHarness({ layers: [SRD_EN], modules: [createFhSkillPoolStat()] });
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling",
      backgroundId: "srd:background:en:acolyte" // fh-skills-en n'est pas montée : l'Inheritance n'existe pas ici
    }))
  });

  assert.deepEqual(out.resolved.stats, [], "aucune statistique — pas d'entrée fantôme");
  const declaration = out.underived.find((entry) => entry.field === "stats");
  assert.ok(declaration, "la liste vide se DÉCLARE, comme les autres refus");
  /* LA DÉCLARATION NOMME LES DEUX LISTES. Sans ça, un personnage FH monté sans
     son module rendrait le même carnet qu'un personnage SRD pur. */
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  assert.match(renderUnderived(declaration, frUnderived), /Drapeaux levés par la pile : aucun/);
  assert.match(renderUnderived(declaration, frUnderived), new RegExp(`Drapeaux servis par les modules injectés : ${FH_SKILLS_FLAG}`
    .replace(/\./g, "\\.")));
  /* Et AUCUNE déclaration du module lui-même : il n'a pas tourné. */
  assert.equal(out.underived.some((entry) => entry.field.startsWith(`stats[${FH_SKILL_POOL_ID}]`)), false,
    "le module n'a pas tourné, donc il n'a rien à déclarer sous son propre nom");

  /* ⛔ AUCUNE LIGNE DU CHEMIN COMMUN NE CITE UN POOL (loi §0.12). Le garde du
     bloc interdit déjà `../modules/` ; celui-ci vise le VOCABULAIRE, parce
     qu'un moteur peut nommer une mécanique de couche sans l'importer. */
  const interdits = [/fh_skill_pool/, /skill_points/i, /skillpoint/i, /tier_costs/, /\bimposed\b/,
    /expertise/i, /Fast Learner/i, /\bEducated\b/];
  for (const fichier of readdirSync(join(ROOT, "src/build")).filter((nom) => nom.endsWith(".mjs"))) {
    const source = readFileSync(join(ROOT, "src/build", fichier), "utf8");
    for (const motif of interdits) {
      assert.doesNotMatch(source, motif, `src/build/${fichier} ne doit pas citer ${motif} (loi §0.12)`);
    }
  }
});

/* ══ ACCEPTATION 5 — LE DRAPEAU SANS SA COUCHE ════════════════════════ */

/** Une couche qui lève `fh.skills` SANS apporter les pools. C'est le seul moyen
 *  d'obtenir la situation à prouver : le drapeau vient de `fh-skills-en`, et
 *  retirer la couche retirerait le drapeau avec elle. */
function couchePorteDrapeau() {
  return Object.assign(uneCouche("scenario-drapeau-nu", {}), { flags: [FH_SKILLS_FLAG] });
}

test("ACCEPTATION 5 — drapeau levé, couche des compétences absente : le terme se DÉCLARE", () => {
  /* La pile monte SRD + la couche des ESPÈCES (donc les bumps SONT lisibles) et
     une couche qui lève le drapeau à vide. C'est le scénario dur : le module a
     de la matière pour publier un détail non vide, et il doit refuser. */
  const h = makeHarness({
    layers: [SRD_EN, FH_SPECIES_EN],
    extra: couchePorteDrapeau(),
    modules: [createFhSkillPoolStat()]
  });
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 3, classId: "srd:class:en:rogue", speciesId: "fh:species:en:araag",
      backgroundId: "srd:background:en:acolyte" // fh-skills-en n'est pas montée : l'Inheritance n'existe pas ici
    }))
  });

  /* ⛔ AUCUN NOMBRE N'EST FABRIQUÉ. */
  assert.equal(poolDe(out.resolved), undefined, "aucune entrée de pool n'est publiée");
  assert.deepEqual(out.resolved.stats, [], "et rien d'autre ne l'est à sa place");

  const champ = `stats[${FH_SKILL_POOL_ID}]`;
  const declaration = out.underived.find((entry) => entry.field === champ);
  assert.ok(declaration, `« ${champ} » est DÉCLARÉ`);
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
  assert.equal(declaration.key, "underived.fh.skillpool-layer-not-mounted");
  assert.ok(renderUnderived(declaration, frUnderived).length > 40, "et la déclaration dit POURQUOI, pas seulement QUOI");
  /* LA RAISON NOMME LA BONNE CAUSE : c'est le CONTENU qui manque, pas le
     contrat. Une raison qui parlerait de contrat enverrait le lecteur écrire
     un arbitrage déjà rendu. */
  assert.match(renderUnderived(declaration, frUnderived), /fh-skills-en/, "la raison nomme la couche qui manque");
  assert.match(renderUnderived(declaration, frUnderived), /AUCUNE classe de la pile n'en porte/,
    "et elle dit la MESURE qui distingue une couche absente d'un record amputé");
  assert.doesNotMatch(renderUnderived(declaration, frUnderived), /budgets/,
    "elle ne parle plus de `build.budgets` : l'arbitrage du 2026-08-09 a tranché");

  /* ⚠️ LES BUMPS D'ESPÈCE ÉTAIENT LISIBLES, ET RIEN N'A ÉTÉ PUBLIÉ AVEC. Un
     module qui aurait publié « Skill Points : 4 » aurait rendu un nombre qui
     ressemble à un pool sans en être un. */
  const araag = h.layers.verbs.query({ kind: "species", id: "fh:species:en:araag" }).record.data;
  assert.equal(araag.skill_points.by_level["1"], 2, "les bumps d'espèce ÉTAIENT bien montés et lisibles");

  /* Et le drapeau, lui, est bien levé — sinon ce test prouverait le test 4. */
  assert.ok(h.dispatch("layers.flags", {}).includes(FH_SKILLS_FLAG),
    "le drapeau EST levé : c'est ce qui distingue ce scénario du SRD pur");
});

/* ══ ACCEPTATION 6 — LE DON D'ORIGINE (lot 24) ═══════════════════════
   « Un don d'origine doit pouvoir donner des points de compétence. » Même
   canal `refs` que le Score de Destinée (lot 20) : le don vit sous
   `background.originFeat[n]`, hors du namespace de ce module. */

test("ACCEPTATION 6 — un Human Wizard avec Skilled publie 15, et son détail porte « Skilled » nommé ; sans le don, 9", () => {
  const avecDon = pilePoolAvecDons();
  const out = avecDon.verbs.rebuild({
    document: documentDe(avecDon, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE
    }).concat([donDe("srd:feat:en:skilled")]))
  });
  const stat = poolDe(out.resolved);

  /* LE 6 EST NOMMÉ, PAS UN COMPTE — la ligne porte le nom du don, recopié
     (loi §0.13), exactement comme `destiny-stat.mjs` nomme la sienne. */
  assert.deepEqual(terme(stat, "Skilled"),
    { label: "Skilled", value: 6, source: { kind: "feat", id: "srd:feat:en:skilled" } });
  /* REWRITTEN 2026-08-12 (lot 35) — l'arrière-plan n'impose plus rien
     (addendums §4) : seul l'imposé de classe (2, le Wizard) se déduit. */
  assert.equal(stat.value, 18, "12 de pool + 2 d'Educated + 6 de Skilled − 2 d'imposés (classe seule)");
  assert.equal(stat.value, somme(stat), "`value` EST la somme de son détail");

  /* LE DON EST RÉCLAMÉ : il compte dans le pool, il ne doit pas ressortir
     « il ne change rien à la fiche » (même garde que le lot 20 sur le Score
     de Destinée). */
  assert.equal(out.unconsumed.includes("background.originFeat[0]"), false, "le module l'a lu, donc il l'a réclamé");

  /* SANS LE DON : 9, et aucun terme « Skilled » — la ligne 12 + 2 − 5 du
     Human Wizard nu (test 1, calibré sur le Halfling, redonne le même compte
     une fois l'espèce remplacée par l'Humain). */
  const sansDon = pilePoolAvecDons();
  const statNu = poolDe(sansDon.verbs.rebuild({
    document: documentDe(sansDon, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE
    }))
  }).resolved);
  /* REWRITTEN 2026-08-12 (lot 35) — même correction : 12 + 2 − 2, l'arrière-plan
     n'impose plus rien. */
  assert.equal(statNu.value, 12, "sans le don : 12 de pool + 2 d'Educated − 2 d'imposés (classe seule)");
  assert.equal(terme(statNu, "Skilled"), undefined, "et aucune ligne « Skilled » n'apparaît");
});

test("ACCEPTATION 7 — un Human Rogue avec Skilled publie 22", () => {
  const h = pilePoolAvecDons();
  const stat = poolDe(h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:human", backgroundId: INHERITANCE
    }).concat([donDe("srd:feat:en:skilled")]))
  }).resolved);
  /* REWRITTEN 2026-08-12 (lot 35) — l'arrière-plan n'impose plus rien
     (addendums §4) : seul l'imposé de classe (4, le Rogue) se déduit. */
  assert.equal(stat.value, 22, "18 de pool + 2 d'Educated + 6 de Skilled − 4 d'imposés (classe seule)");
  assert.equal(stat.value, somme(stat));
  assert.equal(terme(stat, "Skilled").value, 6);
});

test("ACCEPTATION 8 — un don SANS `data.skill_points` ne casse rien : seize dons du SRD traversent muets", () => {
  /* LES SEIZE AUTRES DONS DU SRD — `Skilled` est le dix-septième, et c'est
     le SEUL patché. Un don muet ne doit ni jeter, ni ajouter de terme, ni
     changer le total : il est un fait, pas un trou. */
  const autresDons = [
    "srd:feat:en:ability-score-improvement", "srd:feat:en:alert", "srd:feat:en:archery",
    "srd:feat:en:boon-of-combat-prowess", "srd:feat:en:boon-of-dimensional-travel",
    "srd:feat:en:boon-of-fate", "srd:feat:en:boon-of-irresistible-offense",
    "srd:feat:en:boon-of-spell-recall", "srd:feat:en:boon-of-the-night-spirit",
    "srd:feat:en:boon-of-truesight", "srd:feat:en:defense", "srd:feat:en:grappler",
    "srd:feat:en:great-weapon-fighting", "srd:feat:en:magic-initiate",
    "srd:feat:en:savage-attacker", "srd:feat:en:two-weapon-fighting"
  ];
  assert.equal(autresDons.length, 16, "et ils sont bien seize — le dix-septième feat du SRD est `Skilled`");

  for (const id of autresDons) {
    const h = pilePoolAvecDons();
    const out = h.verbs.rebuild({
      document: documentDe(h, choixDe({
        level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE
      }).concat([donDe(id)]))
    });
    const stat = poolDe(out.resolved);
    /* REWRITTEN 2026-08-12 (lot 35) — 12 + 2 − 2 depuis l'extinction de
       l'arrière-plan (addendums §4), comme ACCEPTATION 6. */
    assert.equal(stat.value, 12, `« ${id} » ne change rien au total`);
    assert.equal(stat.breakdown.some((line) => line.source && line.source.kind === "feat"), false,
      `« ${id} » n'ajoute aucun terme`);

    /* ET LA DÉCLARATION NOMME LE DON REGARDÉ — pas un vague « aucun don ». */
    const declaration = out.underived.find((entry) => entry.field === `stats[${FH_SKILL_POOL_ID}].feat`);
    assert.ok(declaration, `« ${id} » : la déclaration existe`);
    /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}`. */
    assert.match(renderUnderived(declaration, frUnderived), new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `« ${id} » : la déclaration le NOMME`);
  }
});

test("ACCEPTATION 9 — un don qui annonce une valeur de points illisible JETTE", () => {
  const h = pilePoolAvecDons({
    extra: Object.assign(uneCouche("scenario-don-valeur-illisible", {
      feat: {
        "srd:feat:en:skilled": { op: "patch", changes: { "data[skill_points]": { bonus: "six" } } }
      }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE
    }).concat([donDe("srd:feat:en:skilled")]))
  }), (erreur) => {
    assert.match(erreur.message, /srd:feat:en:skilled/, "le refus NOMME le don fautif");
    assert.match(erreur.message, /not a whole number/, "et il dit ce qui cloche");
    return true;
  });
});

/* ══ LES ATTAQUES ═════════════════════════════════════════════════════
   « Un garde qui asserte un COMPTE est le défaut type. » On les viole. */

test("ATTAQUE — une classe amputée de son pool JETTE, elle ne se déclare pas", () => {
  /* LA DISTINCTION QUE `records(kind)` SANS ID REND POSSIBLE. Ici la couche EST
     montée (onze classes portent leur pool) et le Roublard est recouvert par un
     record qui n'en a plus. Ce n'est pas du contenu qui manque : c'est du
     contenu FAUX, et un pool qui se déclarerait laisserait le personnage sans
     un point sans que rien ne le dise. */
  const h = pilePool({
    extra: Object.assign(uneCouche("scenario-rogue-ampute", {
      class: {
        "srd:class:en:rogue": {
          op: "patch",
          remove: ["data[fh_skill_pool]"],
          changes: { "data.name": "Rogue" }
        }
      }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling", backgroundId: INHERITANCE
    }))
  }), (erreur) => {
    assert.match(erreur.message, /srd:class:en:rogue/, "le refus NOMME le record fautif");
    assert.match(erreur.message, /other class records of the stack do/,
      "et il dit la mesure : la couche est montée, c'est CE record qui est amputé");
    return true;
  });
});

test("ATTAQUE — un `by_level` malformé JETTE au lieu de coûter des paliers en silence", () => {
  for (const [nom, table] of [
    ["une valeur qui n'est pas un nombre", { 4: "deux" }],
    ["une clef qui n'est pas un niveau", { "level-4": 2 }],
    ["un niveau hors 1–20", { 42: 2 }],
    ["une liste au lieu d'une table", [2, 2]]
  ]) {
    const h = pilePool({
      extra: Object.assign(uneCouche(`scenario-by-level-${nom.length}`, {
        class: {
          "srd:class:en:wizard": {
            op: "patch",
            changes: {
              "data[fh_skill_pool]": {
                base: 12, by_level: table,
                tier_costs: { half: 1, proficient: 2, expertise: 4, imposed: 1 },
                expertise_from_level: 4
              }
            }
          }
        }
      }), { flags: [] })
    });
    assert.throws(() => h.verbs.rebuild({
      document: documentDe(h, choixDe({
        level: 8, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling", backgroundId: INHERITANCE
      }))
    }), /srd:class:en:wizard/, `« ${nom} » doit JETER en nommant le record`);
  }
});

test("ATTAQUE — ni le pool ni le coût d'un imposé ne sont écrits dans le code : ils viennent du record", () => {
  /* LE GARDE QUI ATTRAPE LE NOMBRE EN DUR, et c'est le défaut nommé par le
     lot 20. On change DEUX nombres dans la couche : le pool du magicien passe
     de 12 à 13, et un imposé de 1 à 2 points. Un module qui porterait une
     table « wizard → 12 » ou un coût « 1 » écrit dans son source rendrait
     exactement les mêmes nombres qu'avant, et l'assertion de total seule ne
     l'aurait jamais vu.
     REWRITTEN 2026-08-12 (lot 35) — l'arrière-plan n'impose plus rien
     (addendums §4) : seul l'imposé de classe compte désormais. Attendu :
     13 − 2×2 = 9. */
  const h = pilePool({
    extra: Object.assign(uneCouche("scenario-pool-et-couts-changes", {
      class: {
        "srd:class:en:wizard": {
          op: "patch",
          changes: { "data[fh_skill_pool]": {
            base: 13, by_level: {},
            tier_costs: { half: 1, proficient: 2, expertise: 4, imposed: 2 },
            expertise_from_level: 4
          } }
        }
      }
    }), { flags: [] })
  });
  const stat = poolDe(h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling", backgroundId: INHERITANCE
    }))
  }).resolved);
  assert.equal(terme(stat, "Class Pool · Wizard").value, 13, "le pool SUIT le record — il n'est pas écrit ici");
  assert.equal(terme(stat, "Wizard · 2 imposed choices").value, -4, "deux imposés à 2 points font −4");
  assert.equal(terme(stat, "Acolyte · 2 imposed choices"), undefined, "l'arrière-plan n'impose plus rien (lot 35)");
  assert.equal(stat.value, 9, "13 − 4 : les deux nombres sont LUS, aucun n'est dans le module");
});

test("ATTAQUE — un trait d'espèce sans nom JETTE : la ligne ne disparaît pas en silence", () => {
  /* Le NOMBRE est connu et le MOT manque. Sauter la ligne rendrait un pool
     court d'exactement ce bump, et personne ne verrait de quoi. */
  /* ⚠️ L'ESPÈCE TÉMOIN A CHANGÉ LE 2026-08-17. L'attaque amputait le
     `fh_traits` de l'Humain ; son barème de points pointe désormais vers
     `Skillful`, un trait SRD de `data.traits`, donc le `fh_traits` truqué
     n'était plus jamais lu et l'attaque ne mordait plus dans le vide — elle
     restait VERTE en ne prouvant rien. L'Araag porte toujours son `Fast
     Learner` dans `fh_traits` : c'est lui qui la porte maintenant. */
  const h = pilePool({
    extra: Object.assign(uneCouche("scenario-trait-sans-nom", {
      species: {
        "fh:species:en:araag": {
          op: "patch",
          changes: { "data[fh_traits]": [{ id: "fast-learner", text: "no name here" }] }
        }
      }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "fh:species:en:araag", backgroundId: INHERITANCE
    }))
  }), /fh:species:en:araag/, "le refus nomme l'espèce dont le trait n'a pas de nom");
});

test("ATTAQUE — un choix posé dans le namespace du module est REFUSÉ, jamais avalé", () => {
  /* Ce module ne porte aucun terme qu'un choix puisse poser : la dépense n'est
     pas de ce lot. Un chemin qu'on ne sait pas lire est un refus qui le nomme
     (loi §0.5) — sinon un builder croirait avoir dépensé des points. */
  const h = pilePool();
  const choices = choixDe({
    level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling", backgroundId: INHERITANCE
  }).concat([{ path: "fh.skills.spend[0]", value: 4, label: "Stealth expertise" }]);
  assert.throws(() => h.verbs.rebuild({ document: documentDe(h, choices) }),
    /fh\.skills\.spend\[0\]/, "le refus NOMME le chemin fautif");
});

test("ATTAQUE — sans le NIVEAU, le module refuse au lieu de supposer 1", () => {
  /* `level` est l'ajout de ce lot au protocole d'injection. Un module appelé
     sans lui ne doit pas retomber sur le niveau 1 : ce serait un pool faux de
     tous les paliers traversés, et il aurait l'air juste. */
  const module = createFhSkillPoolStat();
  for (const niveau of [undefined, null, 0, 21, "5", 5.5]) {
    assert.throws(() => module.contribute({ level: niveau, species: null, choices: [], records: () => [], refs: [] }),
      /wiring failure/, `un niveau ${JSON.stringify(niveau)} est un refus, pas un repli sur 1`);
  }
});

test("LE MODULE DÉCLARE `{flag, contribute}` — sans quoi la dérivation le REFUSE", () => {
  const module = createFhSkillPoolStat();
  assert.equal(module.flag, FH_SKILLS_FLAG);
  assert.equal(typeof module.contribute, "function");
  assert.equal(module.id, FH_SKILL_POOL_ID);
  /* ⚠️ L'ANCRE N'ADMET PAS LE POINT — c'est un `$defs/slug`, et le lot 19 a
     payé ce piège. Le test le vérifie contre le motif du SCHÉMA, relu, et non
     contre une copie de ce motif écrite ici. */
  const schema = JSON.parse(readFileSync(join(ROOT, "schemas/fh-char.schema.json"), "utf8"));
  assert.match(FH_SKILL_POOL_ID, new RegExp(schema.$defs.slug.pattern),
    "`stats[].id` doit passer la grammaire du schéma");
  assert.doesNotMatch(FH_SKILL_POOL_ID, /\./, "et le point y serait rejeté des deux côtés");
});

test("DEUX MODULES COHABITENT — le pool ne remplace pas le Score de Destinée", () => {
  /* Le pli appelle tous les modules dont le drapeau est levé. Ce test dit que
     `stats[]` en porte bien DEUX, chacun sous son ancre et son drapeau. */
  const h = makeHarness({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhDestinyStat(), createFhSkillPoolStat()]
  });
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:human", backgroundId: INHERITANCE
    }))
  });
  assert.deepEqual(out.resolved.stats.map((stat) => stat.id).sort(), [FH_DESTINY_ID, FH_SKILL_POOL_ID].sort());
  assert.deepEqual(statSumViolations(out.resolved), [], "les deux totaux se démontrent");
});

/* ══ LES ATTAQUES DU LOT 24 ═══════════════════════════════════════════ */

test("ATTAQUE — le +6 de Skilled vient du record, pas du module : on le change dans la couche et le total suit", () => {
  /* MÊME DÉFAUT NOMMÉ QU'AU LOT 20 : un module qui porterait « Skilled → 6 »
     écrit dans son source rendrait exactement le même nombre qu'avant, et
     l'assertion de total seule ne l'aurait jamais vu. On change la valeur à 9
     DANS LA COUCHE, rien dans `src/`. */
  const h = pilePoolAvecDons({
    extra: Object.assign(uneCouche("scenario-skilled-vaut-neuf", {
      feat: {
        "srd:feat:en:skilled": { op: "patch", changes: { "data[skill_points]": { bonus: 9 } } }
      }
    }), { flags: [] })
  });
  const stat = poolDe(h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE
    }).concat([donDe("srd:feat:en:skilled")]))
  }).resolved);
  assert.equal(terme(stat, "Skilled").value, 9, "la ligne SUIT le record — elle n'est pas écrite dans le module");
  /* REWRITTEN 2026-08-12 (lot 35) — l'arrière-plan n'impose plus rien
     (addendums §4) : 12 + 2 + 9 − 2, pas − 5. */
  assert.equal(stat.value, 21, "12 + 2 + 9 − 2 : le total suit le record, lui aussi");
});

test("ATTAQUE — un don sans nom JETTE : la ligne ne disparaît pas en silence", () => {
  /* LE NOMBRE est connu et le MOT manque — même garde que pour un trait
     d'espèce sans nom (ACCEPTATION 3). Sauter la ligne rendrait un pool court
     d'exactement ce bonus, sans un mot. */
  const h = pilePoolAvecDons({
    extra: Object.assign(uneCouche("scenario-don-sans-nom", {
      feat: {
        "srd:feat:en:skilled": { op: "patch", changes: { name: "", "data[skill_points]": { bonus: 6 } } }
      }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: INHERITANCE
    }).concat([donDe("srd:feat:en:skilled")]))
  }), /srd:feat:en:skilled/, "le refus nomme le don dont la ligne ne peut pas se libeller");
});

test("ATTAQUE — un `granted_skill_choice.count` illisible JETTE au lieu de fausser le net zéro", () => {
  /* SANS CE GARDE, un `count` non entier romprait le net zéro : la ligne de
     grant et celle de placement ne s'annuleraient plus, et le pool serait
     faux d'un nombre que rien n'expliquerait. */
  const cas = [["une chaîne", "un"], ["zéro", 0], ["négatif", -1]];
  for (const [index, [nom, count]] of cas.entries()) {
    const h = pilePool({
      extra: Object.assign(uneCouche(`scenario-grant-illisible-${index}`, {
        species: {
          /* ⚠️ POSÉ EN ENTIER DEPUIS LE 2026-08-17 : l'Araag n'a plus de
             `granted_skill_choice`, donc `…​.count` viserait le vide. Ce que
             l'attaque prouve ne bouge pas — un compte illisible JETTE — et
             elle le prouve sur un champ que la couche d'essai fabrique. */
          "fh:species:en:araag": { op: "patch", changes: { "data[granted_skill_choice]": { count, from: "any" } } }
        }
      }), { flags: [] })
    });
    assert.throws(() => h.verbs.rebuild({
      document: documentDe(h, choixDe({
        level: 1, classId: "srd:class:en:fighter", speciesId: "fh:species:en:araag", backgroundId: INHERITANCE
      }))
    }), /fh:species:en:araag/, `« ${nom} » doit JETER en nommant le record`);
  }
});
