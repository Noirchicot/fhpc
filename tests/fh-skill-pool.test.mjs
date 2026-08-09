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

import { ROOT, SRD_EN, FH_SPECIES_EN, makeHarness, manifestOf, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILLS_FLAG, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";
import { createFhDestinyStat, FH_DESTINY_ID } from "../src/modules/fh/destiny-stat.mjs";
import { statSumViolations } from "../src/build/validate.mjs";

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
    { path: "currency.pp", value: 0 }
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

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const somme = (stat) => stat.breakdown.reduce((total, line) => total + line.value, 0);
const terme = (stat, label) => stat.breakdown.find((line) => line.label === label);

/* L'ACOLYTE est l'arrière-plan de tous les scénarios : deux compétences
   accordées (`skill_ids`) et UN outil accordé (`tool_id`). Trois imposés, donc,
   et le nombre est LU sur le record ci-dessous, jamais supposé. */
const ACOLYTE = "srd:background:en:acolyte";

/* ══ ACCEPTATION 1 ════════════════════════════════════════════════════
   « Un Rogue niveau 1 publie un pool de 18 ; un Wizard niveau 1, 12 ; un
   Druide, 14. Nommément, pas un compte. »

   ⚠️ CORRECTION MESURÉE DE LA COMMANDE, ET ELLE EST AU CŒUR DU LOT. 18, 12 et
   14 sont les POOLS DE CLASSE — le premier terme du détail. Le total PUBLIÉ est
   ce qui reste après déduction des imposés, parce que le lot dit lui-même que
   les imposés se déduisent. Les deux affirmations ne peuvent pas être vraies du
   même nombre.

   La mesure qui tranche est d'Eric et elle est indépendante du code : sa
   réforme fait passer un personnage « d'environ 2 points libres à 7–10 »
   (vault, § « Plus de compétences, plus de points »). Magicien 12−5 = 7,
   Druide 14−5 = 9, Roublard 18−7 = 11. C'est le TOTAL qui atterrit dans sa
   fourchette, pas le pool brut. Ce test asserte donc LES DEUX : le terme nommé
   ET le total, terme par terme. */

test("ACCEPTATION 1 — Rogue 18, Wizard 12, Druide 14, chacun NOMMÉ dans son détail", () => {
  /* La table attendue. `imposedSkills` est le `skill_choice.count` de la
     classe, RELU sur la pile plus bas : l'écrire ici et le relire là est ce qui
     empêche le test de se prouver à lui-même. */
  const attendu = [
    { classId: "srd:class:en:rogue", nom: "Rogue", base: 18, imposes: 4, total: 11 },
    { classId: "srd:class:en:wizard", nom: "Wizard", base: 12, imposes: 2, total: 7 },
    { classId: "srd:class:en:druid", nom: "Druid", base: 14, imposes: 2, total: 9 }
  ];

  for (const cas of attendu) {
    const h = pilePool();
    /* Le Halfling ne porte AUCUN `skill_points` : le pool de ce test est donc
       purement de classe et d'arrière-plan, et un bump d'espèce qui s'y
       glisserait ferait rougir le total. */
    const out = h.verbs.rebuild({
      document: documentDe(h, choixDe({
        level: 1, classId: cas.classId, speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
      }))
    });
    const stat = poolDe(out.resolved);
    assert.ok(stat, `« ${cas.nom} » publie une entrée de pool`);
    assert.equal(stat.flag, FH_SKILLS_FLAG, "elle NOMME le drapeau qui l'a activée");
    assert.equal(stat.name, "Skill Points", "et son nom vient du paquet de mots de la couche, pas du moteur");

    /* ⛔ LE DÉTAIL ENTIER, COMPARÉ COMME UN OBJET — jamais une projection.
       C'est la leçon de la revue du 2026-08-08 : comparer un sous-ensemble
       laisse passer un terme surnuméraire sans rougir. */
    assert.deepEqual(stat.breakdown, [
      { label: `Class Pool · ${cas.nom}`, value: cas.base, source: { kind: "class", id: cas.classId } },
      {
        label: `${cas.nom} · ${cas.imposes} imposed choices`,
        value: -cas.imposes,
        source: { kind: "class", id: cas.classId }
      },
      { label: "Acolyte · 2 imposed choices", value: -2, source: { kind: "background", id: ACOLYTE } },
      { label: "Acolyte · 1 imposed choice", value: -1, source: { kind: "background", id: ACOLYTE } }
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
    const fond = h.layers.verbs.query({ kind: "background", id: ACOLYTE }).record.data;
    assert.equal(fond.skill_ids.length, 2, "les deux compétences imposées viennent du record d'arrière-plan");
    assert.equal(typeof fond.tool_id, "string", "et son outil imposé aussi");

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
      level: 5, classId: "srd:class:en:bard", speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
    }))
  });
  const stat = poolDe(out.resolved);
  assert.ok(stat, "le barde publie son pool");

  /* LE NOMBRE SE DÉMONTRE TERME PAR TERME. Quatre paliers, chacun sur sa
     ligne, chacun avec son niveau — c'est ce qui rend l'absence du sixième
     VISIBLE au lieu d'être une soustraction qu'il faut croire sur parole. */
  assert.deepEqual(stat.breakdown, [
    { label: "Class Pool · Bard", value: 16, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Level 2", value: 1, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Level 3", value: 1, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Level 4", value: 3, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Level 5", value: 1, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Bard · 3 imposed choices", value: -3, source: { kind: "class", id: "srd:class:en:bard" } },
    { label: "Acolyte · 2 imposed choices", value: -2, source: { kind: "background", id: ACOLYTE } },
    { label: "Acolyte · 1 imposed choice", value: -1, source: { kind: "background", id: ACOLYTE } }
  ]);
  assert.equal(stat.value, 16, "16 de pool + 6 de paliers traversés − 6 d'imposés");
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
    level: 6, classId: "srd:class:en:bard", speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
  }));
  const stat6 = poolDe(h6.verbs.rebuild({ document: doc6 }).resolved);
  assert.equal(stat6.value, 17, "au niveau 6, un point de plus");
  assert.deepEqual(terme(stat6, "Level 6"),
    { label: "Level 6", value: 1, source: { kind: "class", id: "srd:class:en:bard" } },
    "et c'est la ligne du palier 6 qui l'apporte, nommée");

  /* ⚠️ Le magicien de même niveau ne gagne RIEN entre 5 et 6 — la preuve que
     la ligne ci-dessus vient du barde et pas du niveau. */
  const hw = pilePool();
  const wizard5 = poolDe(hw.verbs.rebuild({
    document: documentDe(hw, choixDe({
      level: 5, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
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
        level: 3, classId: "srd:class:en:fighter", speciesId, backgroundId: ACOLYTE
      }))
    });
    return { h, stat: poolDe(out.resolved), underived: out.underived };
  };
  const araag = construire("fh:species:en:araag");
  const humain = construire("srd:species:en:human");

  assert.notEqual(araag.stat.value, humain.stat.value, "les deux pools DIFFÈRENT");
  assert.equal(araag.stat.value, 11, "Araag : 12 de pool + 2 + 2 des paliers d'espèce − 5 d'imposés");
  assert.equal(humain.stat.value, 9, "Humain : 12 de pool + 2 du seul palier de création − 5 d'imposés");
  assert.equal(araag.stat.value - humain.stat.value, 2, "et l'écart vaut exactement un palier d'espèce");

  /* L'ÉCART CITE LE TRAIT — et le mot vient du RECORD, recopié (loi §0.13). */
  const lignesEspece = (stat) => stat.breakdown.filter((line) => line.source && line.source.kind === "species");
  assert.deepEqual(lignesEspece(araag.stat), [
    { label: "Fast Learner · Level 1", value: 2, source: { kind: "species", id: "fh:species:en:araag" } },
    { label: "Fast Learner · Level 3", value: 2, source: { kind: "species", id: "fh:species:en:araag" } }
  ], "l'Araag porte DEUX paliers traversés, chacun nommé par son trait");
  assert.deepEqual(lignesEspece(humain.stat), [
    { label: "Educated · Level 1", value: 2, source: { kind: "species", id: "srd:species:en:human" } }
  ], "l'Humain n'en porte qu'un, et son trait ne s'appelle pas pareil");

  /* LE MOT EST CELUI DU RECORD, PAS UN MOT DU MOTEUR. */
  const traitDe = (h, id, champ, traitId) => {
    const data = h.layers.verbs.query({ kind: "species", id }).record.data;
    return (data[champ] || []).find((item) => item.id === traitId);
  };
  assert.equal(traitDe(araag.h, "fh:species:en:araag", "traits", "fast-learner").name, "Fast Learner");
  assert.equal(traitDe(humain.h, "srd:species:en:human", "fh_traits", "educated").name, "Educated");

  /* ⛔ ET LE PALIER DU NIVEAU 6 DE L'ARAAG N'EST PAS LÀ — la règle Q15-8 tient
     aussi sur l'espèce, pas seulement sur la classe. */
  const bumps = araag.h.layers.verbs.query({ kind: "species", id: "fh:species:en:araag" }).record.data.skill_points;
  assert.equal(bumps.by_level["6"], 2, "la couche porte bien un palier d'espèce au niveau 6");
  assert.equal(terme(araag.stat, "Fast Learner · Level 6"), undefined, "et l'Araag niveau 3 ne l'a pas traversé");

  /* ⚠️ ET LE `granted_skill_choice` DE L'ARAAG SE DÉCLARE — il n'est ni compté
     ni tu. Aucune décision ne dit si une maîtrise imposée par l'ESPÈCE se
     déduit du pool (la règle d'Eric nomme la classe et l'arrière-plan). */
  const champ = `stats[${FH_SKILL_POOL_ID}].imposed.species`;
  const raison = araag.underived.find((entry) => entry.field === champ);
  assert.ok(raison, "la maîtrise imposée par l'espèce est DÉCLARÉE, pas avalée");
  assert.match(raison.reason, /QUESTION À L'ARCHITECTE/, "et la déclaration dit que c'est une décision non prise");
  assert.equal(araag.stat.breakdown.some((line) => line.value < 0 && line.source.kind === "species"), false,
    "aucune déduction d'espèce n'est publiée — la déclarer, c'est refuser de l'inventer");
});

/* ══ ACCEPTATION 4 — LE SRD PUR ═══════════════════════════════════════ */

test("ACCEPTATION 4 — couche FH débrayée : `stats` est VIDE et la déclaration le dit", () => {
  /* La pile ne monte QUE le SRD anglais. Le module est pourtant injecté : c'est
     ce qui rend le test dur — un module qui tournerait sans son drapeau
     publierait un pool sur un personnage qui n'en a pas. */
  const h = makeHarness({ layers: [SRD_EN], modules: [createFhSkillPoolStat()] });
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
    }))
  });

  assert.deepEqual(out.resolved.stats, [], "aucune statistique — pas d'entrée fantôme");
  const declaration = out.underived.find((entry) => entry.field === "stats");
  assert.ok(declaration, "la liste vide se DÉCLARE, comme les autres refus");
  /* LA DÉCLARATION NOMME LES DEUX LISTES. Sans ça, un personnage FH monté sans
     son module rendrait le même carnet qu'un personnage SRD pur. */
  assert.match(declaration.reason, /Drapeaux levés par la pile : aucun/);
  assert.match(declaration.reason, new RegExp(`Drapeaux servis par les modules injectés : ${FH_SKILLS_FLAG}`
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
      level: 3, classId: "srd:class:en:rogue", speciesId: "fh:species:en:araag", backgroundId: ACOLYTE
    }))
  });

  /* ⛔ AUCUN NOMBRE N'EST FABRIQUÉ. */
  assert.equal(poolDe(out.resolved), undefined, "aucune entrée de pool n'est publiée");
  assert.deepEqual(out.resolved.stats, [], "et rien d'autre ne l'est à sa place");

  const champ = `stats[${FH_SKILL_POOL_ID}]`;
  const declaration = out.underived.find((entry) => entry.field === champ);
  assert.ok(declaration, `« ${champ} » est DÉCLARÉ`);
  assert.ok(declaration.reason.length > 40, "et la déclaration dit POURQUOI, pas seulement QUOI");
  /* LA RAISON NOMME LA BONNE CAUSE : c'est le CONTENU qui manque, pas le
     contrat. Une raison qui parlerait de contrat enverrait le lecteur écrire
     un arbitrage déjà rendu. */
  assert.match(declaration.reason, /fh-skills-en/, "la raison nomme la couche qui manque");
  assert.match(declaration.reason, /AUCUNE classe de la pile n'en porte/,
    "et elle dit la MESURE qui distingue une couche absente d'un record amputé");
  assert.doesNotMatch(declaration.reason, /budgets/,
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
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
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
        level: 8, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
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
     l'aurait jamais vu.  Attendu : 13 − (2+2+1)×2 = 3. */
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
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
    }))
  }).resolved);
  assert.equal(terme(stat, "Class Pool · Wizard").value, 13, "le pool SUIT le record — il n'est pas écrit ici");
  assert.equal(terme(stat, "Wizard · 2 imposed choices").value, -4, "deux imposés à 2 points font −4");
  assert.equal(terme(stat, "Acolyte · 2 imposed choices").value, -4);
  assert.equal(terme(stat, "Acolyte · 1 imposed choice").value, -2);
  assert.equal(stat.value, 3, "13 − 10 : les deux nombres sont LUS, aucun n'est dans le module");
});

test("ATTAQUE — un trait d'espèce sans nom JETTE : la ligne ne disparaît pas en silence", () => {
  /* Le NOMBRE est connu et le MOT manque. Sauter la ligne rendrait un pool
     court d'exactement ce bump, et personne ne verrait de quoi. */
  const h = pilePool({
    extra: Object.assign(uneCouche("scenario-trait-sans-nom", {
      species: {
        "srd:species:en:human": {
          op: "patch",
          changes: { "data[fh_traits]": [{ id: "educated", text: "no name here" }] }
        }
      }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:human", backgroundId: ACOLYTE
    }))
  }), /srd:species:en:human/, "le refus nomme l'espèce dont le trait n'a pas de nom");
});

test("ATTAQUE — un choix posé dans le namespace du module est REFUSÉ, jamais avalé", () => {
  /* Ce module ne porte aucun terme qu'un choix puisse poser : la dépense n'est
     pas de ce lot. Un chemin qu'on ne sait pas lire est un refus qui le nomme
     (loi §0.5) — sinon un builder croirait avoir dépensé des points. */
  const h = pilePool();
  const choices = choixDe({
    level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling", backgroundId: ACOLYTE
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
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:human", backgroundId: ACOLYTE
    }))
  });
  assert.deepEqual(out.resolved.stats.map((stat) => stat.id).sort(), [FH_DESTINY_ID, FH_SKILL_POOL_ID].sort());
  assert.deepEqual(statSumViolations(out.resolved), [], "les deux totaux se démontrent");
});
