/* ══ LOT 171 — « C'EST 2 MAX » : LE PLAFOND COMPTE LE KIT LIÉ ═══════════
   Eric, 2026-09-07 à 00:1x, devant le relevé du lot (INVENTAIRE-LOT-171.md) :
   *« pas possible ça, c'est 2 max. Les points de Late Bloomer tu les dépenses
   ailleurs. Plus de limite au-delà du lvl 1 si t'es un Rogue. Les autres
   auront droit à UNE Expertise grâce à Late Bloomer. »*

   Ce que le relevé avait mesuré (cas A, C, G) : le plafond ne comptait que ce
   que le pool pose ; la bourse de classe (`class.skillBudget.*`) n'atteignait
   jamais le module — un Rogue niveau 1 sortait avec TROIS Expertises, et la
   bourse et le pool écrivaient le même slug sans se voir.

   Chaque garde porte son TÉMOIN CONTRAIRE dans le même test (TRAPS.md, « un
   test qui ne couvre qu'une MOITIÉ »). Aucune écriture hors mémoire. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const INHERITANCE = "fh:background:en:inheritance";
const LE_TRAIT = { path: "fh.skills.trait.late-bloomer", value: true };

function pile(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhSkillPoolStat()]
  }, options));
}

/* Les choix tels que le BUILDER les écrit : la bourse de classe sur
   `class.skillBudget.<slug>`, jamais `class.skills[n]` (éteint le 20/08). */
function choixDe({ level = 1, classId, bourse = {}, extra = [] }) {
  return [
    { path: "level", value: level },
    { path: "class", ref: { kind: "class", id: classId } },
    { path: "species", ref: { kind: "species", id: "srd:species:en:halfling" } },
    { path: "background", ref: { kind: "background", id: INHERITANCE } },
    { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 14 }, { path: "abilities.con", value: 12 },
    { path: "abilities.int", value: 14 }, { path: "abilities.wis", value: 12 }, { path: "abilities.cha", value: 14 },
    { path: "currency.cp", value: 0 }, { path: "currency.sp", value: 0 }, { path: "currency.gp", value: 15 },
    { path: "currency.pp", value: 0 },
    { path: "background.boost.int", value: 2 }, { path: "background.boost.con", value: 1 }
  ].concat(Object.entries(bourse).map(([slug, tier]) => ({ path: `class.skillBudget.${slug}`, value: tier })))
    .concat(extra);
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1", id: "lot171-deux-max", name: "Deux max", lang: "en",
    units: { distance: "ft", weight: "lb" }, generator: { name: "tests/lot-171", version: "1.0.0" },
    created: "2026-09-07T00:00:00Z", modified: "2026-09-07T00:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const palierDe = (resolved, slug) => (resolved.skills.find((s) => s.id === slug) || {}).proficiency;
const experts = (resolved) => resolved.skills.filter((s) => s.proficiency === "expert").map((s) => s.id).sort();
const refusDe = (out, key) => out.moduleViolations.filter((v) => v.key === key);
const spend = (slug, tier) => ({ path: `fh.skills.spend.${slug}`, value: tier });

const ROGUE = "srd:class:en:rogue";
const WIZARD = "srd:class:en:wizard";
/* Le kit lié du Rogue tel qu'un joueur le pose : 6 points, un expert dedans. */
const KIT_ROGUE = { stealth: "expert", acrobatics: "novice", athletics: "novice" };

/* ══ 1 — LE PLAFOND COMPTE LA BOURSE : 2 AU TOTAL, PAS 2 AU POOL ═══ */

test("Rogue niveau 1 : un expert lié + un expert au pool = 2, et le TROISIÈME est refusé", () => {
  const h = pile();
  const deux = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: ROGUE, bourse: KIT_ROGUE, extra: [spend("investigation", "expert")] }))
  });
  assert.deepEqual(experts(deux.resolved), ["investigation", "stealth"], "deux Expertises, une de chaque bourse");
  assert.equal(refusDe(deux, "skill-spend.expertise-capped").length, 0, "deux EST le plafond, donc deux passe");

  const trois = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: ROGUE, bourse: KIT_ROGUE, extra: [spend("investigation", "expert"), spend("deception", "expert")]
    }))
  });
  assert.deepEqual(experts(trois.resolved), ["investigation", "stealth"], "la troisième n'est PAS appliquée");
  const refus = refusDe(trois, "skill-spend.expertise-capped");
  assert.equal(refus.length, 1, "un refus, keyé");
  assert.equal(refus[0].params.skillId, "deception", "et il nomme celle qu'il refuse");
  assert.equal(refus[0].params.max, 2);
  assert.ok(poolDe(trois.resolved).value > 0, "le pool suivait — c'est le PLAFOND qui refuse, pas la monnaie");

  /* 🔴 LE TÉMOIN CONTRAIRE : sans expert dans le kit, le pool en pose deux. */
  const kitSansExpert = { stealth: "novice", acrobatics: "novice", athletics: "novice", insight: "novice",
    deception: "novice", survival: "novice" };
  const pool2 = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: ROGUE, bourse: kitSansExpert, extra: [spend("investigation", "expert"), spend("intimidation", "expert")]
    }))
  });
  assert.deepEqual(experts(pool2.resolved), ["intimidation", "investigation"]);
  assert.equal(refusDe(pool2, "skill-spend.expertise-capped").length, 0, "le kit sans expert laisse les deux au pool");
});

/* ══ 2 — LA BOURSE EST UN PLANCHER : le pool ne l'écrase ni ne la repaie ══ */

test("un palier posé par la bourse est un PLANCHER pour le pool — il ne descend pas, et monter coûte la différence", () => {
  const h = pile();
  /* Cas G du relevé : la bourse pose expert, le pool pose novice — avant, le
     pool GAGNAIT et Stealth retombait novice, 1 point payé pour perdre 3. */
  const ecrase = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: ROGUE, bourse: KIT_ROGUE, extra: [spend("stealth", "novice")] }))
  });
  assert.equal(palierDe(ecrase.resolved, "stealth"), "expert", "la bourse tient, le pool ne l'écrase pas");
  const refus = refusDe(ecrase, "skill-spend.below-floor");
  assert.equal(refus.length, 1, "et le refus est keyé : sous le plancher");
  assert.equal(refus[0].params.floor, "expert");

  /* Cas E du relevé : la bourse pose novice (1 pt lié), le pool monte à expert
     — la différence est 3, jamais 4 depuis « none ». */
  const nu = poolDe(h.verbs.rebuild({ document: documentDe(h, choixDe({ classId: ROGUE, bourse: KIT_ROGUE })) }).resolved).value;
  const monte = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: ROGUE, bourse: KIT_ROGUE, extra: [spend("acrobatics", "expert")] }))
  });
  assert.equal(palierDe(monte.resolved, "acrobatics"), "expert");
  assert.equal(nu - poolDe(monte.resolved).value, 3, "4 (expert) − 1 (le novice lié, déjà payé) = 3");

  /* Cas C du relevé : reposer au pool le palier que la bourse tient déjà ne
     coûte RIEN — avant, 4 points partaient pour rien. */
  const redit = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: ROGUE, bourse: KIT_ROGUE, extra: [spend("stealth", "expert")] }))
  });
  assert.equal(poolDe(redit.resolved).value, nu, "redire le palier de la bourse ne débite pas le pool");

  /* 🔴 LE TÉMOIN CONTRAIRE : un slug que la bourse n'a PAS posé part bien de
     « none » et coûte les 4 points entiers. */
  const neuf = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: ROGUE, bourse: KIT_ROGUE, extra: [spend("investigation", "expert")] }))
  });
  assert.equal(nu - poolDe(neuf.resolved).value, 4, "hors bourse, un expert vaut ses 4 points");
});

/* ══ 3 — LATE BLOOMER : UNE Expertise pour les autres, deux pour le Rogue ══ */

test("Wizard niveau 1 avec Late Bloomer : UNE Expertise passe, la seconde est refusée au nom du trait", () => {
  const h = pile();
  const kit = { arcana: "novice", history: "novice" };
  const une = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: WIZARD, bourse: kit, extra: [LE_TRAIT, spend("arcana", "expert")] }))
  });
  assert.equal(palierDe(une.resolved, "arcana"), "expert", "la première passe — c'est le droit que le trait donne");
  assert.equal(une.moduleViolations.some((v) => v.key.startsWith("skill-spend") ), false, "sans un refus");

  const deux = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: WIZARD, bourse: kit, extra: [LE_TRAIT, spend("arcana", "expert"), spend("history", "expert")]
    }))
  });
  assert.deepEqual(experts(deux.resolved), ["arcana"], "la seconde n'est pas appliquée");
  const refus = refusDe(deux, "skill-spend.trait-expertise-capped");
  assert.equal(refus.length, 1, "un refus, keyé au nom du TRAIT — pas le plafond de classe, pas le verrou de niveau");
  assert.equal(refus[0].params.skillId, "history");
  assert.equal(refus[0].params.max, 1);
  assert.equal(refus[0].params.feature, "Late Bloomer", "le mot vient du record (§0.13)");
  assert.equal(refus[0].params.unlockLevel, 4, "et il dit à quel niveau la classe prend le relais");
  assert.ok(poolDe(deux.resolved).value > 0, "le pool suivait — Late Bloomer paie 2, l'expertise en coûte 3 : c'est le compte qui refuse");
  assert.equal(refusDe(deux, "skill-spend.tier-locked").length, 0, "le verrou de niveau est OUVERT par le trait");
  assert.equal(refusDe(deux, "skill-spend.expertise-capped").length, 0, "et le plafond de classe ne parle pas");

  /* 🔴 LE TÉMOIN CONTRAIRE : le Rogue avec le MÊME trait garde ses deux. */
  const rogue = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: ROGUE, bourse: KIT_ROGUE, extra: [LE_TRAIT, spend("investigation", "expert")]
    }))
  });
  assert.deepEqual(experts(rogue.resolved), ["investigation", "stealth"], "le Rogue n'a pas besoin du trait : sa classe ouvre déjà, et son plafond est 2");
  assert.equal(rogue.moduleViolations.some((v) => v.key.endsWith("expertise-capped")), false);
});

test("les 2 points de Late Bloomer se dépensent AILLEURS — ils sont là même sans Expertise, et l'Expertise se paie plein tarif", () => {
  const h = pile();
  const kit = { arcana: "novice", history: "novice" };
  const sans = poolDe(h.verbs.rebuild({ document: documentDe(h, choixDe({ classId: WIZARD, bourse: kit })) }).resolved).value;
  const avec = h.verbs.rebuild({ document: documentDe(h, choixDe({ classId: WIZARD, bourse: kit, extra: [LE_TRAIT] })) });
  assert.equal(poolDe(avec.resolved).value, sans + 2, "+2 au pool libre, à dépenser n'importe où");
  assert.equal(experts(avec.resolved).length, 0, "et aucune Expertise offerte");
  const achete = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: WIZARD, bourse: kit, extra: [LE_TRAIT, spend("arcana", "expert")] }))
  });
  assert.equal(poolDe(avec.resolved).value - poolDe(achete.resolved).value, 3, "4 − 1 (le novice lié) = 3, le barème de tout le monde");
});

/* ══ 4 — AU-DELÀ DU NIVEAU 1, PLUS DE LIMITE POUR LE ROGUE ; LE TRAIT GARDE LA SIENNE ══ */

test("Rogue niveau 2 : QUATRE Expertises passent — le plafond de 2 ne court qu'au niveau 1", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 2, classId: ROGUE, bourse: KIT_ROGUE,
      extra: [spend("investigation", "expert"), spend("deception", "expert"), spend("insight", "expert")]
    }))
  });
  assert.deepEqual(experts(out.resolved), ["deception", "insight", "investigation", "stealth"]);
  assert.equal(out.moduleViolations.length, 0, "aucun refus : 12 des 14 points dépensés, le pool arbitre seul");

  /* 🔴 LE TÉMOIN CONTRAIRE : le MÊME document au niveau 1 est refusé deux fois. */
  const niveau1 = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 1, classId: ROGUE, bourse: KIT_ROGUE,
      extra: [spend("investigation", "expert"), spend("deception", "expert"), spend("insight", "expert")]
    }))
  });
  assert.equal(refusDe(niveau1, "skill-spend.expertise-capped").length, 2, "au niveau 1, la 3ᵉ et la 4ᵉ tombent");
});

test("Wizard niveau 3 avec Late Bloomer : toujours UNE — au niveau 4, la classe reprend et n'en compte plus", () => {
  const h = pile();
  const kit = { arcana: "novice", history: "novice" };
  const achats = [LE_TRAIT, spend("arcana", "expert"), spend("history", "expert")];
  const niveau3 = h.verbs.rebuild({ document: documentDe(h, choixDe({ level: 3, classId: WIZARD, bourse: kit, extra: achats })) });
  assert.deepEqual(experts(niveau3.resolved), ["arcana"], "tant que le verrou de classe (4) est fermé, le trait ne donne qu'une Expertise");
  assert.equal(refusDe(niveau3, "skill-spend.trait-expertise-capped").length, 1);

  const niveau4 = h.verbs.rebuild({ document: documentDe(h, choixDe({ level: 4, classId: WIZARD, bourse: kit, extra: achats })) });
  assert.deepEqual(experts(niveau4.resolved), ["arcana", "history"], "au niveau 4 le Wizard achète par sa classe, sans plafond");
  assert.equal(niveau4.moduleViolations.length, 0);
});

/* ══ 5 — LE NOMBRE DU TRAIT EST LU SUR LE RECORD, JAMAIS FIGÉ ═══════ */

test("le « une » de Late Bloomer vient du RECORD — une couche qui le porte à 2 change le comportement, et un record muet JETTE", () => {
  const kit = { arcana: "novice", history: "novice" };
  const achats = [LE_TRAIT, spend("arcana", "expert"), spend("history", "expert")];
  const grantA2 = { trait: "late-bloomer", level: 1, feature: "Late Bloomer", points: 2, boundSkill: 0,
    boundSkillFrom: [], unlocksExpertise: true, maxExpertise: 2 };
  const h2 = pile({ extra: uneCouche("scenario-late-bloomer-a-deux", {
    class: { [WIZARD]: { op: "patch", changes: { "data[fh_skill_pool][trait_grants]": [grantA2] } } }
  }) });
  const out = h2.verbs.rebuild({ document: documentDe(h2, choixDe({ classId: WIZARD, bourse: kit, extra: achats })) });
  assert.deepEqual(experts(out.resolved), ["arcana", "history"], "à 2 sur le record, la seconde passe");
  assert.equal(refusDe(out, "skill-spend.trait-expertise-capped").length, 0);

  /* Un grant qui ouvre l'Expertise SANS dire combien : un contenu faux, pas un
     contenu qui manque (loi §0.5) — le refus nomme le champ. */
  const { maxExpertise, ...muet } = grantA2;
  const h0 = pile({ extra: uneCouche("scenario-late-bloomer-muet", {
    class: { [WIZARD]: { op: "patch", changes: { "data[fh_skill_pool][trait_grants]": [muet] } } }
  }) });
  assert.throws(() => h0.verbs.rebuild({ document: documentDe(h0, choixDe({ classId: WIZARD, bourse: kit, extra: achats })) }),
    /maxExpertise/, "le refus NOMME le champ");
});
