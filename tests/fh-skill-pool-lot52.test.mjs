/* ══ LOT 52, DETTE A — LE RETOUR ANTICIPÉ D'`imposedLines()` ═════════════
   Commande `52-dettes-lot-43` §1. Le lot 43 avait déclaré : « `imposedLines()`
   fait un `return` anticipé quand `backgroundRef` est absent … ça ne change
   AUCUN nombre publié … pour un personnage Araag/Humain SANS choix
   `background` posé. » L'architecte a remesuré et élargi la dette : depuis
   que les quatre arrière-plans SRD sont `disable` et que le personnage
   d'exemple ne pose plus AUCUN choix `background`, `backgroundRef` est
   absent pour TOUT LE MONDE — et sous l'ancien ordre, le `return` anticipé
   emportait avec lui deux choses qui NE LISENT PAS `backgroundRef` :
   `skillpool-class-tools-unmechanical` (jamais déclaré) et les DEUX `fail()`
   du bloc espèce (INATTEIGNABLES). Un garde qui ne peut plus mordre est pire
   que pas de garde.

   Le correctif (`src/modules/fh/skill-pool.mjs`, `imposedLines()`) RÉORDONNE
   sans RAYER le `return` : les outils de classe et le net zéro d'espèce
   sortent de dessous lui, `skill_ids`/l'outil d'arrière-plan restent sous
   lui. ⛔ LIGNE ROUGE : aucun nombre publié ne doit changer. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN, uneCouche } from "./build-harness.mjs";
import { createFhSkillPoolStat, FH_SKILL_POOL_ID } from "../src/modules/fh/skill-pool.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const WIZARD = "srd:class:en:wizard";

function pile(options = {}) {
  return makeHarness(Object.assign({
    layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN],
    modules: [createFhSkillPoolStat()]
  }, options));
}

/** Les choix d'un personnage SANS AUCUN choix `background` — ni `path:
 *  "background"`, ni `background.boost.*`, ni `background.originFeat[0]`.
 *  C'est exactement le cas du personnage d'exemple (lot 43, addendums §4) :
 *  `backgroundRef` n'existe nulle part dans ce document. Ce module (le pool)
 *  ne lit ni les boosts ni le don d'origine — les omettre ne prive `rebuild`
 *  d'aucun champ qu'il lui faut pour dériver le pool. */
function choixSansBackground({ level, classId, speciesId, skills = ["arcana", "history"] }) {
  return [
    { path: "level", value: level },
    { path: "class", ref: { kind: "class", id: classId } },
    { path: "species", ref: { kind: "species", id: speciesId } },
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
    { path: "class.skills[1]", value: skills[1] }
  ];
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot52-dette-a",
    name: "Dette A",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fh-skill-pool-lot52", version: "1.0.0" },
    created: "2026-08-13T09:00:00Z",
    modified: "2026-08-13T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const poolDe = (resolved) => resolved.stats.find((stat) => stat.id === FH_SKILL_POOL_ID);
const somme = (stat) => stat.breakdown.reduce((total, line) => total + line.value, 0);

/* ══ TEST 1 (commande §1e.1) — LA PAIRE NET ZÉRO SURVIT SANS BACKGROUND ═══
   ⚔️ Doit rougir sur le code d'AVANT ce lot : sous l'ancien `return`, les deux
   lignes de la paire (grant + placement) n'apparaissaient jamais sans
   `backgroundRef`, et le total de l'Araag tombait à 10 au lieu de 12 —
   silencieusement, puisqu'aucun garde ne la réclamait. */
test("DETTE A, test 1 — un Araag SANS choix `background` publie son Fast Learner, total 12", () => {
  /* ⚠️ RÉÉCRIT LE 2026-08-17 : l'Araag n'a plus de `granted_skill_choice`, donc
     plus de paire net-zéro. Il l'héritait de l'Humain EN PLUS de son Fast
     Learner, ce qui lui faisait deux dons de compétence. ⭐ ET LE TOTAL NE
     BOUGE PAS — c'est tout le point : la paire s'annulait, la retirer ne
     retranche rien. La ligne rouge du test 5 tient. */
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "fh:species:en:araag" }))
  });
  const stat = poolDe(out.resolved);
  assert.ok(stat, "le pool publie une entrée même sans background");
  assert.deepEqual(stat.breakdown, [
    { label: "Class Pool · Wizard", value: 10, source: { kind: "class", id: WIZARD } },
    { label: "Fast Learner · Level 1", value: 2, source: { kind: "species", id: "fh:species:en:araag" } }
  ], "ni paire net-zéro d'espèce, ni imposés déduits (lot 82) : deux lignes, deux sources");
  assert.equal(stat.value, 12, "10 de free point pool + 2 de Fast Learner — canon §B.1bis, Fast Learner est LIBRE");
  assert.equal(stat.value, somme(stat));
});

test("DETTE A, test 1bis — un Humain SANS choix `background` publie son Skillful en POINTS, total 12", () => {
  /* ⚠️ RÉÉCRIT LE 2026-08-17 : `Skillful` a changé de monnaie. Il accordait une
     maîtrise (une paire net-zéro) À CÔTÉ d'`Educated` (+2 points) ; il porte
     maintenant les +2 lui-même et `Educated` a disparu. Eric : *« l'humain n'a
     que +2 au lvl 1 »*, puis *« non, SRD de base si possible »* sur le nom.
     ⭐ Le total reste 12 : la paire s'annulait, seul le libellé change. */
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "srd:species:en:human" }))
  });
  const stat = poolDe(out.resolved);
  assert.deepEqual(stat.breakdown, [
    { label: "Class Pool · Wizard", value: 10, source: { kind: "class", id: WIZARD } },
    { label: "Skillful · Level 1", value: 2, source: { kind: "species", id: "srd:species:en:human" } }
  ]);
  assert.equal(stat.value, 12,
    "canon §B.1bis : Skillful ne contraint RIEN (« one skill of your choice »), donc ses points sont LIBRES");
  assert.equal(stat.value, somme(stat));
});

/* ══ TEST 2 — LE BOUND SE DÉCLARE, ET IL EST CHIFFRÉ (réécrit lot 82) ════
   ⭐ CE TEST GARDAIT UN MENSONGE, ET C'EST LE CANON QUI L'A RÉVÉLÉ.
   `skillpool-class-tools-unmechanical` disait « je ne sais pas compter les
   outils que la classe impose : `tool_proficiencies` est une phrase anglaise ».
   Le canon §B.1 les CHIFFRE — barde 2, druide 1, rogue 1, zéro pour les neuf
   autres — et le record les porte désormais en `bound_tool_points`. Une
   déclaration d'ignorance sur une chose qu'on sait est pire qu'une absence de
   déclaration : elle fait croire que la question est ouverte.

   Ce qui la remplace dit la vérité neuve : le bound EXISTE, il est chiffré, il
   n'est PAS dans le pool, et ce module ne conduit pas son placement. */
test("DETTE A, test 2 — le bound de la classe est DÉCLARÉ et CHIFFRÉ, hors du pool", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "fh:species:en:araag" }))
  });
  const declaration = out.underived.find((entry) => entry.field === `stats[${FH_SKILL_POOL_ID}].bound`);
  assert.ok(declaration, "le bound se déclare, il ne reste pas muet");
  assert.equal(declaration.key, "underived.fh.skillpool-bound-not-in-pool");
  assert.equal(declaration.params.skill, 2, "le magicien place 2 points de compétence en bound (canon §B.1)");
  assert.equal(declaration.params.tool, 0, "et aucun point d'outil");

  /* ⛔ LES CINQ DÉCLARATIONS DE LA SOUSTRACTION SONT MORTES AVEC ELLE. */
  const mortes = ["underived.fh.skillpool-class-tools-unmechanical", "underived.fh.skillpool-no-background-ref",
    "underived.fh.skillpool-class-choice-unreadable", "underived.fh.skillpool-background-missing-skill-ids",
    "underived.fh.skillpool-background-missing-tool"];
  for (const clef of mortes) {
    assert.equal(out.underived.some((entry) => entry.key === clef), false,
      `« ${clef} » parlait d'une déduction que le canon a supprimée`);
  }
});

/* ══ TEST 3 (commande §1e.3) — ⚔️ LE TEST QUI COMPTE : LES DEUX `fail()` ═══
   RESSUSCITENT SANS BACKGROUND. Avant ce lot, un `granted_skill_choice`
   malformé sur une espèce ne jetait PLUS dès que `backgroundRef` était
   absent : le `return` anticipé sautait le bloc espèce tout entier, et le
   garde ne mordait jamais sur le cas réel (le personnage d'exemple). */
test("DETTE A, test 3 — ⚔️ un `granted_skill_choice` SCALAIRE fait JETER, même sans background", () => {
  const h = pile({
    extra: Object.assign(uneCouche("scenario-dette-a-grant-scalaire", {
      species: { "fh:species:en:araag": { op: "patch", changes: { "data[granted_skill_choice]": "one" } } }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "fh:species:en:araag" }))
  }), (erreur) => {
    assert.match(erreur.message, /fh:species:en:araag/, "le refus NOMME le record fautif");
    assert.match(erreur.message, /not an object/, "et dit ce qui cloche — un scalaire, pas un objet");
    return true;
  }, "un `granted_skill_choice` scalaire jette, SANS background posé");
});

test("DETTE A, test 3bis — ⚔️ un `granted_skill_choice.count` À ZÉRO fait JETER, même sans background", () => {
  const h = pile({
    extra: Object.assign(uneCouche("scenario-dette-a-grant-zero", {
      /* ⚠️ LE CHAMP EST POSÉ EN ENTIER DEPUIS LE 2026-08-17, plus retouché
         par sa sous-clef : l'Araag n'a plus de `granted_skill_choice` du tout
         (Fast Learner l'a absorbé), donc `…​.count` viserait le vide. Ce que
         l'attaque prouve n'a pas bougé — un compte non positif JETTE — et
         elle le prouve désormais sur un champ que la couche d'essai fabrique
         elle-même, ce qui la rend indépendante du canon. */
      species: { "fh:species:en:araag": { op: "patch", changes: { "data[granted_skill_choice]": { count: 0, from: "any" } } } }
    }), { flags: [] })
  });
  assert.throws(() => h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "fh:species:en:araag" }))
  }), (erreur) => {
    assert.match(erreur.message, /fh:species:en:araag/, "le refus NOMME le record fautif");
    assert.match(erreur.message, /not a positive whole number/, "et dit ce qui cloche — un compte non positif");
    return true;
  }, "un `granted_skill_choice.count` de 0 jette, SANS background posé");
});

/* ══ TEST 4 (commande §1e.4) — L'ELFE, INCHANGÉ À L'OCTET ═════════════════
   L'Elfe ne porte plus `granted_skill_choice` (retiré par la couche FH, au
   profit du budget captif `granted_skill_budget` — Keen Senses). Ce test
   prouve que le réordonnancement ne lui ajoute ni ne lui retire RIEN : ni
   ligne, ni déclaration surnuméraire, comparé À L'OCTET (l'objet entier,
   jamais une projection). */
test("DETTE A, test 4 — un Elfe (aucun `granted_skill_choice`) est inchangé, à l'octet", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: "srd:species:en:elf" }))
  });
  const stat = poolDe(out.resolved);
  assert.deepEqual(stat.breakdown, [
    { label: "Class Pool · Wizard", value: 10, source: { kind: "class", id: WIZARD } }
  ], "UNE ligne : l'Elfe n'a ni palier ni grant libre, et son budget captif (Keen Senses) est du BOUND");
  assert.equal(stat.value, 10);
  assert.equal(stat.value, somme(stat));

  /* Et l'underived entier, comparé lui aussi comme un objet. ⭐ LOT 82 : la
     déclaration des outils de classe et celle de l'arrière-plan absent ont
     disparu avec la soustraction ; celle du bound les remplace, et elle
     CHIFFRE au lieu de s'excuser. */
  const champs = out.underived
    .filter((entry) => entry.field.startsWith(`stats[${FH_SKILL_POOL_ID}]`))
    .map((entry) => ({ field: entry.field, key: entry.key }))
    .sort((a, b) => (a.field < b.field ? -1 : 1));
  assert.deepEqual(champs, [
    { field: `stats[${FH_SKILL_POOL_ID}].bound`, key: "underived.fh.skillpool-bound-not-in-pool" },
    { field: `stats[${FH_SKILL_POOL_ID}].feat`, key: "underived.fh.skillpool-feat-no-choice" },
    { field: `stats[${FH_SKILL_POOL_ID}].species`, key: "underived.fh.skillpool-species-no-field" }
  ], "exactement ces quatre déclarations pour l'Elfe sans background — pas une de plus, pas une de moins");
});

/* ══ TEST 5 (commande §1e.5) — AUCUN TOTAL NE BOUGE ═══════════════════════
   La ligne rouge de la commande : les quatre espèces mesurées par
   l'architecte (§1b de la commande) gardent EXACTEMENT leur valeur. */
test("DETTE A, test 5 — ⛔ LIGNE ROUGE : aucun total ne bouge — Human et Araag 12, Elf et Loroka 10", () => {
  const attendu = [
    { speciesId: "srd:species:en:human", nom: "Human", total: 12 },
    { speciesId: "fh:species:en:araag", nom: "Araag", total: 12 },
    { speciesId: "srd:species:en:elf", nom: "Elf", total: 10 },
    { speciesId: "fh:species:en:loroka", nom: "Loroka", total: 10 }
  ];
  for (const cas of attendu) {
    const h = pile();
    const out = h.verbs.rebuild({
      document: documentDe(h, choixSansBackground({ level: 1, classId: WIZARD, speciesId: cas.speciesId }))
    });
    const stat = poolDe(out.resolved);
    assert.equal(stat.value, cas.total, `« ${cas.nom} » doit toujours publier ${cas.total}`);
    assert.equal(stat.value, somme(stat), `« ${cas.nom} » : \`value\` reste la somme de son détail`);
  }
});
