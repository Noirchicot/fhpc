/* ══ 🌱 LATE BLOOMER — L'EFFET, PAS L'ANNONCE (lot 169) ═══════════════════
   Eric, 2026-09-06, mot pour mot : *« le droit de l'acheter »*. Le trait ne
   donne AUCUNE Expertise. Il donne **+2 points libres** et **le DROIT d'acheter
   l'expertise dès le niveau 1**, au pool, au prix normal. Et il ouvre une règle
   NEUVE du même jour : **deux expertises au maximum au niveau 1**, *« pour lui
   comme pour n'importe qui »*.

   🔴 CE QUE CETTE SUITE GARDE, ET POURQUOI CHAQUE GARDE A SON CONTRAIRE DANS LE
   MÊME TEST. Le dépôt a payé deux fois la moitié d'une alternative (TRAPS.md,
   « un test qui ne couvre qu'une MOITIÉ ») : un garde qui ne prouve que le cas
   qui déclenche laisse l'autre libre de mentir, et c'est toujours l'autre qui
   casse. Chaque test ci-dessous porte donc son TÉMOIN CONTRAIRE.

     1 — le trait déclaré donne +2, et le personnage qui ne le déclare pas
         reçoit exactement ZÉRO de plus (même pile, même classe, même niveau).
     2 — le trait ouvre l'achat de l'expertise au niveau 1 pour un Wizard, que
         le verrou refusait ; sans le trait, le même Wizard est toujours refusé.
     3 — RIEN N'EST OFFERT : le personnage qui ne dépense pas ses 2 points garde
         un pool plus GRAND et AUCUNE compétence au palier le plus haut.
     4 — le plafond refuse la TROISIÈME expertise au niveau 1, et il la refuse
         au Rogue AUSSI (qui n'a pas Late Bloomer) — c'est un plafond absolu.
     5 — au-delà du niveau que le plafond borne, il ne mord plus.
     6 — le déclencheur SURVIT au document : un personnage rebâti à partir de
         ses seuls choix — c'est tout ce qu'un fichier sauvegardé contient —
         retrouve ses +2 et sa permission.
     7 — les deux refus de forme du canal : une valeur qui n'est pas un booléen,
         un trait que la couche ne chiffre pas.
     8 — les DEUX nombres du plafond sont LUS : une couche de scénario qui les
         change change le comportement, sans qu'une ligne du moteur bouge.

   ⚠️ AUCUNE ÉCRITURE HORS MÉMOIRE : les couches de scénario sont fabriquées en
   mémoire et montées par-dessus (`tests/tree-immuable.test.mjs`). */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const INHERITANCE = "fh:background:en:inheritance";
/* ⛔ LE CHEMIN EST ÉCRIT ICI EN TOUTES LETTRES, ET C'EST VOULU. Un test qui
   importe la constante de l'écran prouverait que l'écran est cohérent avec
   lui-même ; celui-ci prouve que le MOTEUR répond au chemin qu'Eric verra dans
   un fichier de personnage. Les deux se rencontrent dans `tests/abilities-step`,
   qui vérifie que la coquille écrit bien celui-là. */
const CHEMIN_DU_TRAIT = "fh.skills.trait.late-bloomer";

function pile(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhSkillPoolStat()]
  }, options));
}

function choixDe({ level = 1, classId, speciesId = "srd:species:en:halfling",
  skills = ["arcana", "history"], extra = [] }) {
  return [
    { path: "level", value: level },
    { path: "class", ref: { kind: "class", id: classId } },
    { path: "species", ref: { kind: "species", id: speciesId } },
    { path: "background", ref: { kind: "background", id: INHERITANCE } },
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
    { path: "background.boost.int", value: 2 },
    { path: "background.boost.con", value: 1 }
  ].concat(extra);
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot169-late-bloomer",
    name: "Late Bloomer",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/late-bloomer", version: "1.0.0" },
    created: "2026-09-06T09:00:00Z",
    modified: "2026-09-06T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const palierDe = (resolved, slug) => (resolved.skills.find((s) => s.id === slug) || {}).proficiency;
const LE_TRAIT = { path: CHEMIN_DU_TRAIT, value: true };

/* ══ 1 — +2 POINTS LIBRES, ET ZÉRO SANS LE TRAIT ═════════════════════ */

test("le trait déclaré ajoute +2 au pool, sous son propre nom — et sans lui, rien ne bouge", () => {
  const h = pile();
  const sans = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: "srd:class:en:wizard" }))
  }).resolved;
  const avec = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: "srd:class:en:wizard", extra: [LE_TRAIT] }))
  }).resolved;

  assert.equal(poolDe(avec).value - poolDe(sans).value, 2,
    "le trait vaut exactement DEUX points libres de plus — ni un cadeau d'expertise, ni un pool refait");

  /* LA LIGNE EST NOMMÉE, et son mot vient du record (§0.13) — un joueur qui lit
     son détail doit savoir D'OÙ tombent ces deux points. */
  const ligne = poolDe(avec).breakdown.find((l) => l.label === "Late Bloomer");
  assert.ok(ligne, "la ligne porte le `feature` du grant, pas un identifiant");
  assert.equal(ligne.value, 2);

  /* 🔴 LE TÉMOIN CONTRAIRE — il doit rester à ZÉRO. Sans lui, une ligne posée
     inconditionnellement passerait le test du dessus sans qu'on le sache. */
  assert.equal(poolDe(sans).breakdown.some((l) => l.label === "Late Bloomer"), false,
    "un personnage qui ne déclare pas le trait n'a AUCUNE ligne à son nom");
});

/* ══ 2 — LA PERMISSION, ET LE VERROU QUI RESTE FERMÉ SANS ELLE ═══════ */

test("le trait ouvre l'achat de l'expertise au niveau 1 — et sans lui, le même achat est refusé", () => {
  const h = pile();
  const avec = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:wizard",
      extra: [LE_TRAIT, { path: "fh.skills.spend.arcana", value: "expert" }]
    }))
  });
  assert.equal(palierDe(avec.resolved, "arcana"), "expert",
    "le verrou du niveau 4 s'ouvre au niveau 1 — c'est la 2ᵉ exception, après le Rogue");
  assert.equal(avec.moduleViolations.some((v) => v.key === "skill-spend.tier-locked"), false, "aucun verrou");

  /* 🔴 LE TÉMOIN CONTRAIRE, dans le même test : le MÊME wizard, le MÊME achat,
     sans le trait. Le verrou doit se refermer, et NOMMER le niveau 4. */
  const sans = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:wizard",
      extra: [{ path: "fh.skills.spend.arcana", value: "expert" }]
    }))
  });
  assert.equal(palierDe(sans.resolved, "arcana"), "novice", "sans le trait, l'expertise n'est PAS appliquée");
  const refus = sans.moduleViolations.find((v) => v.key === "skill-spend.tier-locked");
  assert.ok(refus, "et le refus est keyé");
  assert.equal(refus.params.unlockLevel, 4, "il nomme le niveau du Wizard, que le trait abaissait à 1");
});

/* ══ 3 — RIEN N'EST OFFERT ══════════════════════════════════════════ */

test("RIEN n'est offert : le trait seul ne pose AUCUNE expertise, et les 2 points restent à dépenser", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: "srd:class:en:wizard", extra: [LE_TRAIT] }))
  });
  assert.equal(out.resolved.skills.some((s) => s.proficiency === "expert"), false,
    "Eric, 06/09 : *« le droit de l'acheter »* — le joueur peut dépenser ses 2 points ailleurs et ne jamais " +
    "prendre d'Expertise");
  /* Et les deux points sont bien DISPONIBLES, pas déjà consommés par un cadeau. */
  const sans = h.verbs.rebuild({
    document: documentDe(h, choixDe({ classId: "srd:class:en:wizard" }))
  }).resolved;
  assert.equal(poolDe(out.resolved).value, poolDe(sans).value + 2, "le pool est plus GRAND de 2, pas égal");

  /* ⭐ ET LE PRIX EST LE PRIX NORMAL — pas un tarif de faveur. Sur `arcana`,
     imposé au plancher novice (1), monter à expert (4) coûte la différence : 3.
     Le trait ne touche pas au barème, il ne touche qu'au verrou. */
  const achete = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:wizard",
      extra: [LE_TRAIT, { path: "fh.skills.spend.arcana", value: "expert" }]
    }))
  }).resolved;
  assert.equal(poolDe(out.resolved).value - poolDe(achete).value, 3,
    "4 (expert) − 1 (le plancher imposé) = 3, le même barème que pour tout le monde");
});

/* ══ 4 — LE PLAFOND, ET IL EST ABSOLU ═══════════════════════════════ */

test("le plafond refuse la TROISIÈME expertise au niveau 1 — et les deux premières passent", () => {
  const h = pile();
  /* Un Rogue : c'est lui qui a le pool le plus large (14), donc le seul chez qui
     un troisième achat aurait les points de passer. Le refus doit donc venir du
     PLAFOND, jamais du pool — et le test le montre en lisant les deux. */
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:rogue", skills: ["stealth", "investigation"],
      extra: [
        { path: "fh.skills.spend.stealth", value: "expert" },
        { path: "fh.skills.spend.investigation", value: "expert" },
        { path: "fh.skills.spend.acrobatics", value: "expert" }
      ]
    }))
  });
  assert.equal(palierDe(out.resolved, "stealth"), "expert", "la première passe");
  assert.equal(palierDe(out.resolved, "investigation"), "expert", "la deuxième passe");
  assert.equal(palierDe(out.resolved, "acrobatics"), "none", "la TROISIÈME n'est pas appliquée");

  const refus = out.moduleViolations.find((v) => v.key === "skill-spend.expertise-capped");
  assert.ok(refus, "le refus est KEYÉ, jamais un silence");
  assert.equal(refus.params.skillId, "acrobatics", "et il nomme CELLE qu'il refuse");
  assert.equal(refus.params.max, 2);
  assert.equal(refus.params.throughLevel, 1);

  /* ⛔ ET CE N'EST PAS LE VERROU DE NIVEAU : celui-là est grand ouvert pour le
     Rogue. Confondre les deux ferait chercher au joueur un niveau qu'il a. */
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-spend.tier-locked"), false,
    "le verrou de niveau est ouvert — c'est le COMPTE qui ferme");
  /* ⛔ ET CE N'EST PAS LE POOL NON PLUS : le refus arrive alors qu'il reste des
     points. Sans cette assertion, un plafond cassé passerait pour une économie. */
  assert.ok(poolDe(out.resolved).value > 0,
    "le pool suivait encore — donc le refus vient bien du plafond, pas de la monnaie");
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-pool.overspent"), false);
});

test("le plafond mord SANS Late Bloomer — c'est un plafond absolu, pas une clause du trait", () => {
  const h = pile();
  const sansLeTrait = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:rogue", skills: ["stealth", "investigation"],
      extra: [
        { path: "fh.skills.spend.stealth", value: "expert" },
        { path: "fh.skills.spend.investigation", value: "expert" },
        { path: "fh.skills.spend.acrobatics", value: "expert" }
      ]
    }))
  });
  assert.ok(sansLeTrait.moduleViolations.some((v) => v.key === "skill-spend.expertise-capped"),
    "Eric, 06/09 : *« deux expertises max au niveau 1 »*, *« pour lui comme pour n'importe qui »*");

  /* 🔴 LE TÉMOIN CONTRAIRE — DEUX passent, chez le même Rogue, dans le même
     test. Un plafond qui refuserait tout serait vert au-dessus et faux. */
  const deux = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:rogue", skills: ["stealth", "investigation"],
      extra: [
        { path: "fh.skills.spend.stealth", value: "expert" },
        { path: "fh.skills.spend.investigation", value: "expert" }
      ]
    }))
  });
  assert.equal(deux.moduleViolations.some((v) => v.key === "skill-spend.expertise-capped"), false,
    "deux est le maximum, donc deux PASSE");
});

test("au-delà du niveau qu'il borne, le plafond ne mord plus", () => {
  const h = pile();
  /* Niveau 4 : le verrou générique est ouvert pour tout le monde, et le plafond
     ne court que jusqu'au niveau 1. Trois expertises sont donc légales — c'est
     le pool qui arbitre, et lui seul. Un Rogue de niveau 4 a 14 + 2 = 16 points ;
     trois montées coûtent 3 + 3 + 4 = 10. */
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      level: 4, classId: "srd:class:en:rogue", skills: ["stealth", "investigation"],
      extra: [
        { path: "fh.skills.spend.stealth", value: "expert" },
        { path: "fh.skills.spend.investigation", value: "expert" },
        { path: "fh.skills.spend.acrobatics", value: "expert" }
      ]
    }))
  });
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-spend.expertise-capped"), false,
    "le plafond est daté d'un niveau, il ne le déborde pas");
  assert.equal(palierDe(out.resolved, "acrobatics"), "expert", "la troisième passe au niveau 4");
});

/* ══ 6 — LE DÉCLENCHEUR SURVIT AU FICHIER SAUVEGARDÉ ════════════════ */

test("un personnage rebâti de ses seuls choix garde son déclencheur — c'est tout l'objet du champ", () => {
  /* 🔴 LE DÉFAUT QUE CE LOT RÉPARE, MESURÉ AVANT DE COMMENCER : `ajuste: "haut"`
     ne vivait QUE dans l'écran (`abilities-tray.mjs`). Un personnage rouvert
     depuis un fichier a six scores et AUCUNE mémoire de la façon dont ils ont
     été tirés — le moteur ne pouvait donc pas savoir que Late Bloomer s'était
     déclenché. Le champ est la réponse, et ce test est sa preuve : la liste de
     choix est exactement ce qu'un fichier transporte. */
  const h = pile();
  const choix = choixDe({
    classId: "srd:class:en:wizard",
    extra: [LE_TRAIT, { path: "fh.skills.spend.arcana", value: "expert" }]
  });
  const premier = h.verbs.rebuild({ document: documentDe(h, choix) });

  /* La ROUTE DU DISQUE, en une ligne : sérialisé, relu, rebâti. */
  const relu = JSON.parse(JSON.stringify(premier.document));
  const second = h.verbs.rebuild({ document: relu });

  assert.equal(poolDe(second.resolved).value, poolDe(premier.resolved).value, "le pool ne bouge pas d'un point");
  assert.equal(palierDe(second.resolved, "arcana"), "expert", "et la permission tient encore");
  assert.ok(poolDe(second.resolved).breakdown.some((l) => l.label === "Late Bloomer"),
    "la ligne du trait est toujours là — le fichier la portait");
  /* Et le choix n'est pas signalé comme inerte : c'est le module qui le
     consomme, donc `validate` ne dira jamais « il ne change rien à la fiche ». */
  const inertes = h.verbs.validate({ document: second.document }).violations
    .filter((v) => v.path === CHEMIN_DU_TRAIT);
  assert.deepEqual(inertes, [], "le choix est CONSOMMÉ, pas un champ mort de plus");
});

/* ══ 7 — LES DEUX REFUS DE FORME DU CANAL ═══════════════════════════ */

test("un trait qui ne porte pas un booléen, et un trait que la couche ne chiffre pas — deux refus nommés", () => {
  const h = pile();
  const valeur = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:wizard", extra: [{ path: CHEMIN_DU_TRAIT, value: "oui" }]
    }))
  });
  const refusValeur = valeur.moduleViolations.find((v) => v.key === "skill-trait.value-invalid");
  assert.ok(refusValeur, "une valeur qui n'est ni vraie ni fausse est un refus, jamais une acceptation");
  assert.equal(refusValeur.params.path, CHEMIN_DU_TRAIT);

  const inconnu = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:wizard", extra: [{ path: "fh.skills.trait.late-blomer", value: true }]
    }))
  });
  const refusInconnu = inconnu.moduleViolations.find((v) => v.key === "skill-trait.unknown");
  assert.ok(refusInconnu, "une faute de frappe ne coûte pas son trait au joueur en silence");
  assert.equal(refusInconnu.params.selected, "late-blomer");
  assert.match(refusInconnu.params.options, /late-bloomer/, "et le refus NOMME ce que la couche connaît");

  /* 🔴 LE TÉMOIN CONTRAIRE — `false` est LÉGAL et ne refuse rien : c'est
     exactement l'état d'un personnage qui n'a pas déclenché le trait. */
  const faux = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:wizard", extra: [{ path: CHEMIN_DU_TRAIT, value: false }]
    }))
  });
  assert.equal(faux.moduleViolations.length, 0, "`false` ne refuse rien");
  assert.equal(poolDe(faux.resolved).breakdown.some((l) => l.label === "Late Bloomer"), false,
    "et il n'accorde rien non plus");
});

/* ══ 8 — LES NOMBRES SONT LUS, PAS FIGÉS ════════════════════════════ */

test("les deux nombres du plafond viennent du RECORD — une couche qui les change change le comportement", () => {
  /* ⭐ LA MÊME LOI QUE `expertise_from_level` : *« une valeur LUE, jamais
     figée »*. Ce test la PROUVE plutôt que de l'affirmer — une couche de
     scénario porte le plafond à 3, et la troisième expertise passe. Si le 2
     était écrit dans `skill-pool.mjs`, ce test rougirait. */
  const COUCHE = uneCouche("scenario-plafond-a-trois", {
    class: {
      "srd:class:en:rogue": {
        op: "patch",
        changes: { "data[fh_skill_pool][expertise_cap]": { through_level: 1, max: 3 } }
      }
    }
  });
  const h = pile({ extra: COUCHE });
  const out = h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:rogue", skills: ["stealth", "investigation"],
      extra: [
        LE_TRAIT,
        { path: "fh.skills.spend.stealth", value: "expert" },
        { path: "fh.skills.spend.investigation", value: "expert" },
        { path: "fh.skills.spend.acrobatics", value: "expert" }
      ]
    }))
  });
  assert.equal(out.moduleViolations.some((v) => v.key === "skill-spend.expertise-capped"), false,
    "le plafond du record vaut 3 : la troisième passe");
  assert.equal(palierDe(out.resolved, "acrobatics"), "expert");
});

test("un plafond illisible JETTE en le nommant — un contenu faux n'est pas un contenu qui manque", () => {
  const COUCHE = uneCouche("scenario-plafond-casse", {
    class: {
      "srd:class:en:rogue": {
        op: "patch",
        changes: { "data[fh_skill_pool][expertise_cap]": { through_level: 1, max: "deux" } }
      }
    }
  });
  const h = pile({ extra: COUCHE });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixDe({
      classId: "srd:class:en:rogue", skills: ["stealth", "investigation"],
      extra: [{ path: "fh.skills.spend.stealth", value: "expert" }]
    }))
  }), /expertise_cap\.max/, "le refus NOMME le champ — loi §0.5");
});
