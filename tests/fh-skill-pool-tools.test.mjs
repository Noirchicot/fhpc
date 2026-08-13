/* ══ LOT 35 — LE POOL PAIE AUSSI LES OUTILS ═════════════════════════════
   Addendums §1, « Un pool, deux dépenses » (Eric, 2026-08-12) : les 26
   compétences ET les 36 outils se paient sur le MÊME pool, au MÊME barème de
   paliers. Cette suite prouve les obligations de la commande (§5) propres au
   canal de dépense élargi :

     1. un outil s'achète : la ligne est NOMMÉE, le pool baisse, et
        `resolved.tools[]` porte l'outil au bon palier avec son bonus.
     2. REJET — un slug inconnu des deux genres : `skill-spend.option-unavailable`.
     3. REJET — un slug présent dans les deux genres : échec bruyant qui le
        nomme (fabriqué dans une couche de scénario).
     4. `resolved.tools[]` NE PUBLIE JAMAIS LES 36 — un personnage qui
        n'achète rien et n'en possède qu'un garde UNE seule ligne.
     5. le Rogue achète l'expertise dès le niveau 1 ; les onze autres classes
        restent verrouillées jusqu'au niveau 4 (`skill-spend.tier-locked`).
     6. le Rogue n'a AUCUN plafond de compte : deux expertises niveau 1
        passent si le pool suit — la notification est un travail d'UI, le
        moteur ne refuse que sur le pool.

   ⚠️ AUCUNE ÉCRITURE HORS MÉMOIRE : les couches de scénario sont fabriquées
   en mémoire et montées par-dessus, comme `fh-skill-tiers.test.mjs` (lot 34)
   et `tests/tree-immuable.test.mjs` le veulent. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const INHERITANCE = "fh:background:en:inheritance";

function pile(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhSkillPoolStat()]
  }, options));
}

/* REWRITTEN 2026-08-12 (lot 35) — L'INHERITANCE n'impose plus de compétences ni
   d'outil (addendums §4) : cette fixture sert donc un pool purement de
   classe, exactement comme le reste de la suite du lot 35.

   ⚠️ `skills` doit lister deux slugs LÉGAUX de `skill_choice.from` DE LA
   CLASSE — le Wizard et le Rogue n'ont pas la même liste (arcana/history ne
   sont pas dans celle du Rogue), et un slug hors liste ne devient jamais
   imposé : la dépense partirait du plancher « none », pas « half ». */
function choixDe({ level, classId, speciesId, backgroundId = INHERITANCE, skills = ["arcana", "history"], extra = [] }) {
  return [
    { path: "level", value: level },
    { path: "class", ref: { kind: "class", id: classId } },
    { path: "species", ref: { kind: "species", id: speciesId } },
    { path: "background", ref: { kind: "background", id: backgroundId } },
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
    { path: "class.skills[0]", value: skills[0] },
    { path: "class.skills[1]", value: skills[1] },
    /* LOT 43 — l'Inheritance exige exactement 3 points de boost (§1d) ;
       validate() refuse désormais un total absent (0 !== 3). Cette suite ne
       teste pas les boosts : +2/+1 sur deux caracs neutres suffit à rester
       légal sans influencer les mesures du pool. */
    { path: "background.boost.int", value: 2 },
    { path: "background.boost.con", value: 1 }
  ].concat(extra);
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot35-outils",
    name: "Outils",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-skill-pool-tools", version: "1.0.0" },
    created: "2026-08-12T09:00:00Z",
    modified: "2026-08-12T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const toolDe = (resolved, id) => resolved.tools.find((tool) => tool.id === id);
const CALLIGRAPHER = "calligrapher-s-supplies";

/* ══ 1 — UN OUTIL S'ACHÈTE ═══════════════════════════════════════════ */

test("un outil s'achète au pool : la ligne est nommée, le pool baisse, `resolved.tools[]` le porte", () => {
  const h = pile();
  const sans = h.verbs.rebuild({
    document: documentDe(h, choixDe({ level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling" }))
  }).resolved;
  assert.equal(toolDe(sans, CALLIGRAPHER), undefined, "sans achat, l'outil n'apparaît pas");
  const poolAvant = poolDe(sans).value;

  const avec = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: `fh.skills.spend.${CALLIGRAPHER}`, value: "proficient" }]
    }))
  }).resolved;

  const outil = toolDe(avec, CALLIGRAPHER);
  assert.ok(outil, "l'outil apparaît dans `resolved.tools[]`");
  assert.equal(outil.name, "Calligrapher’s Supplies", "le nom SUIT le catalogue, pas un mot écrit dans le module");
  assert.equal(outil.ability, "dex");
  assert.equal(outil.proficiency, "proficient");
  assert.equal(outil.bonus, avec.abilities.dex.mod + avec.proficiency, "le bonus PLEIN vaut le bonus de maîtrise entier");

  /* Aucun autre outil n'apparaît — un achat n'ouvre pas les 36. */
  assert.equal(avec.tools.length, 1, "une seule ligne, celle achetée");

  /* LE COÛT, DÉBITÉ ET NOMMÉ : rien n'était imposé (plancher « none »), donc
     le plein tarif s'applique — `tier_costs.proficient` (2). */
  const poolApres = poolDe(avec);
  assert.equal(poolAvant - poolApres.value, 2, "l'achat à plein tarif coûte `tier_costs.proficient`");
  const ligne = poolApres.breakdown.find((entry) =>
    entry.value === -2 && entry.source && entry.source.kind === "tool" && entry.source.id === "srd:tool:en:calligrapher-s-supplies");
  assert.ok(ligne, "le détail du pool porte une ligne NOMMÉE pour l'outil, pas un total muet");
  assert.match(ligne.label, /Calligrapher.s Supplies/, "et la ligne porte son nom, recopié du catalogue (loi §0.13)");
});

/* ══ 2 — REJET : UN SLUG INCONNU DES DEUX GENRES ═════════════════════ */

test("REJET — un slug inconnu des deux genres est `skill-spend.option-unavailable`, jamais appliqué", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: "fh.skills.spend.griffon-taming", value: "proficient" }]
    }))
  });
  assert.equal(toolDe(out.resolved, "griffon-taming"), undefined, "aucune ligne fabriquée pour un slug inconnu");
  const violation = out.moduleViolations.find((v) => v.key === "skill-spend.option-unavailable");
  assert.ok(violation, "le refus est KEYÉ (lot 27)");
  assert.equal(violation.params.selected, "griffon-taming", "et il NOMME le slug refusé");
});

/* ══ 3 — REJET : UN SLUG DANS LES DEUX GENRES ════════════════════════ */

test("REJET — un slug présent dans les deux genres (compétence ET outil) fait jeter, nommément", () => {
  /* Une couche de scénario qui ajoute un OUTIL portant le même slug qu'une
     compétence existante (« athletics ») — zéro collision aujourd'hui
     (mesuré), et c'est exactement le cas qu'un garde muet laisserait
     choisir une cible en silence. */
  const h = pile({
    extra: Object.assign(uneCouche("scenario-collision-slug", {
      tool: {
        "fh:tool:fr:athletics-collision": {
          name: "Athletics (outil fabriqué)",
          slug: "athletics",
          data: { ability: "Strength", ability_key: "str" }
        }
      }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: "fh.skills.spend.athletics", value: "proficient" }]
    }))
  }), (erreur) => {
    assert.match(erreur.message, /athletics/, "le refus NOMME le slug qui collisionne");
    assert.match(erreur.message, /srd:skill:en:athletics/, "et la compétence qu'il touche");
    assert.match(erreur.message, /fh:tool:fr:athletics-collision/, "et l'outil qui le touche aussi");
    return true;
  });
});

/* ══ 4 — `resolved.tools[]` NE PUBLIE JAMAIS LES 36 ══════════════════ */

/* REWRITTEN 2026-08-12 (architecte) — ce test passait par `background.tool`,
   le choix d'outil du Soldier. L'architecte a éteint `tool_choice` juste après
   la fusion du lot 35 (décision d'Eric : l'arrière-plan n'impose ET n'offre
   plus rien), donc AUCUNE source d'outil ne subsiste au niveau 1 hors du pool.
   L'assertion est réécrite à la nouvelle vérité, jamais relâchée (loi §0.7) :
   son obligation réelle — `resolved.tools[]` ne publie JAMAIS le catalogue —
   est intacte, et elle est même mieux servie ici, puisque l'unique ligne vient
   maintenant du canal qu'on veut prouver. */
test("un personnage qui achète UN outil en publie UN, jamais les 36 du catalogue", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      backgroundId: INHERITANCE, skills: ["stealth", "investigation"],
      extra: [{ path: "fh.skills.spend.gaming-set-dice", value: "proficient" }]
    }))
  });
  assert.equal(out.resolved.tools.length, 1, "un seul outil publié — celui acheté, jamais les 36 du catalogue");
  assert.equal(out.resolved.tools[0].id, "gaming-set-dice");
  assert.equal(out.resolved.tools[0].proficiency, "proficient");
});

/* ⛔ ET LA CONSÉQUENCE DE L'EXTINCTION, mesurée plutôt que supposée : sans
   achat, un personnage d'arrière-plan Soldier n'a PLUS AUCUN outil. C'est le
   test qui tomberait le jour où un arrière-plan se remettrait à en donner. */
test("sans achat, l'arrière-plan ne donne plus aucun outil — `resolved.tools` est vide", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      backgroundId: INHERITANCE, skills: ["stealth", "investigation"]
    }))
  });
  assert.deepEqual(out.resolved.tools, [], "l'Inheritance ne donne ni n'offre d'outil");
  assert.ok(out.underived.some((entry) => entry.field === "tools"),
    "et la collection vide se DÉCLARE, comme les autres refus (règle n°2)");
});

/* ══ 5 — LE ROGUE, DÈS LE NIVEAU 1 ; LES ONZE AUTRES, VERROUILLÉES ═══ */

test("le Rogue achète l'expertise dès le niveau 1, coût 4", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling", skills: ["stealth", "investigation"],
      extra: [{ path: "fh.skills.spend.stealth", value: "expertise" }]
    }))
  });
  assert.equal(out.resolved.skills.find((s) => s.id === "stealth").proficiency, "expertise",
    "le Rogue n'attend pas le niveau 4 (addendums §1, EXCEPTION — LE ROGUE)");
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-spend.tier-locked"), false, "aucun verrou");

  /* Le coût est celui de la GRILLE, monté depuis le plancher imposé (½, 1
     point) jusqu'à l'expertise (4 points) : la différence, 3. */
  const sans = poolDe(h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling", skills: ["stealth", "investigation"]
    }))
  }).resolved).value;
  const avec = poolDe(out.resolved).value;
  assert.equal(sans - avec, 3, "monter un imposé (½) à l'expertise coûte 4 − 1 = 3, pas 4 plein tarif");
});

test("les onze autres classes restent verrouillées au niveau 1 — `skill-spend.tier-locked`", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:wizard", speciesId: "srd:species:en:halfling",
      extra: [{ path: "fh.skills.spend.arcana", value: "expertise" }]
    }))
  });
  assert.equal(out.resolved.skills.find((s) => s.id === "arcana").proficiency, "half",
    "le Wizard reste au plancher — l'expertise n'est pas appliquée");
  const violation = out.moduleViolations.find((v) => v.key === "skill-spend.tier-locked");
  assert.ok(violation, "le refus est KEYÉ");
  assert.equal(violation.params.unlockLevel, 4, "et il nomme le niveau de déverrouillage du Wizard — pas 1");
});

/* ══ 6 — LE ROGUE, SANS PLAFOND DE COMPTE ═══════════════════════════ */

test("le Rogue n'a AUCUN plafond de compte : deux expertises passent au niveau 1 si le pool suit", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: "srd:class:en:rogue", speciesId: "srd:species:en:halfling", skills: ["stealth", "investigation"],
      extra: [
        { path: "fh.skills.spend.stealth", value: "expertise" },
        { path: "fh.skills.spend.investigation", value: "expertise" }
      ]
    }))
  });
  assert.equal(out.resolved.skills.find((s) => s.id === "stealth").proficiency, "expertise");
  assert.equal(out.resolved.skills.find((s) => s.id === "investigation").proficiency, "expertise");
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-spend.tier-locked"), false,
    "aucun verrou de NIVEAU — SRD 5.2.1 limite le Rogue SRD à deux, Fate's Hand n'y met aucun plafond de compte, " +
    "seul le pool arbitre (addendums §1)");
  /* Le pool ARBITRE bel et bien : le Rogue nu a 14 (18 − 4 d'imposés de
     classe, lot 35), et deux montées ½ → expertise coûtent 3 chacune — 6 au
     total, ce qui laisse 8, un nombre positif. Le pool n'est pas contourné,
     il suit. */
  assert.equal(poolDe(out.resolved).value, 14 - 3 - 3, "le pool DÉBITE les deux montées, sans plafond de compte à côté");
});
