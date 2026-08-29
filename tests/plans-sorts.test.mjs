/* ══ LES TESTS DU LOT 72 — LES PLANS DE SORTS ═════════════════════════════

   Le moteur consommait déjà `class.cantrips[n]` / `class.prepared[n]`
   (`derive.mjs`, lot 8) sans jamais publier le plan qui les guide ni celui
   qui les juge. Mesuré avant ce lot, sur le personnage d'exemple EN passé de
   Wizard à Rogue : les 7 sorts ressortent `unconsumed`, AUCUN plan ne les
   verrouille, et la confirmation d'effacement (lot 46) n'a rien à lire —
   13 lignes en souffrance dans Review, zéro geste possible.

   Trois familles ici, dans l'ordre du lot :
   1. le GUIDE (pile EN, clefs canoniques) — expected lu dans `resources`,
      options au croisement `spell.classes × spell.level`, plafond par
      `spell_slots` / `slot_level` ;
   2. le JUGEMENT (le changement de classe, et la pile FR dont les clefs de
      ressource sont langue-natives — `layers/TRADUCTION.md`) ;
   3. l'ÉCRAN (QCM partagé, confirmation nommée, palier, Review). */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { makeHarness, acceptanceDocument, manifestOf, uneCouche, readJson, EXAMPLE_CHAR } from "./build-harness.mjs";
import { projectDecisions } from "../src/build/decisions.mjs";
import { renderBuildViolation } from "../src/labels.mjs";

globalThis.document = createTestDocument();

const { renderClassChoices, classPalier2 } = await import("../ui/builder/class-step.mjs");
const { renderReviewStep, REVIEW_GROUPS } = await import("../ui/builder/review-step.mjs");

const fixture = exempleFhEn();
const { layers, build } = fixture;
const query = layers.verbs.query;
const rebuild = (document) => build.verbs.rebuild({ document });
const byPath = (out) => new Map(out.decisions.map((entry) => [entry.path, entry]));

const BASE_ABILITIES = [
  { path: "abilities.str", value: 10 }, { path: "abilities.dex", value: 15 },
  { path: "abilities.con", value: 13 }, { path: "abilities.int", value: 12 },
  { path: "abilities.wis", value: 10 }, { path: "abilities.cha", value: 8 }
];

function docWith({ id, classId, level = 1, extra = [] }) {
  return {
    schema: "fh-char/1", id, name: id, lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/plans-sorts", version: "1.0.0" },
    created: "2026-08-14T00:00:00Z", modified: "2026-08-14T00:00:00Z",
    build: {
      layers: manifestOf(layers),
      choices: [{ path: "level", value: level }, { path: "class", ref: { kind: "class", id: classId } }, ...extra, ...BASE_ABILITIES],
      budgets: {}, overrides: []
    }
  };
}

/* Le niveau d'un sort, RELU AU CATALOGUE — jamais une table locale : quand un
   test affirme « aucune option au-dessus du niveau 1 », c'est le record qui
   répond. */
function spellLevel(id) {
  return query({ kind: "spell", id }).record.data.level;
}

/* ══ 1 — LE GUIDE : expected, options, plafond, provenance ═══════════════ */

test("Wizard niveau 1 : deux plans, comptés par la progression, options au croisement — jamais une liste locale", () => {
  const out = rebuild(docWith({ id: "guide-wizard", classId: "srd:class:en:wizard" }));
  const decisions = byPath(out);

  const cantrips = decisions.get("class.cantrips");
  const prepared = decisions.get("class.prepared");
  assert.ok(cantrips && prepared, "les deux plans existent");
  assert.deepEqual(
    { expected: cantrips.expected, answered: cantrips.answered, status: cantrips.status },
    { expected: 3, answered: 0, status: "pending" },
    "le compte vient de `resources.cantrips` (3), pas d'un chiffre d'écran");
  assert.equal(prepared.expected, 4, "et `resources.prepared_spells` donne 4");

  /* LE CROISEMENT, REJOUÉ CONTRE LE CATALOGUE : chaque option des mineurs
     est un sort de niveau 0 qui liste le NOM du record de classe — recompté
     ici depuis `query`, pas recopié en dur. */
  const className = query({ kind: "class", id: "srd:class:en:wizard" }).record.name;
  const attendues = (query({ kind: "spell" }) || [])
    .filter((view) => {
      const data = view.record.data || {};
      return Array.isArray(data.classes) && data.classes.includes(className) && data.level === 0;
    })
    .map((view) => view.id).sort();
  assert.deepEqual(cantrips.options, attendues, "options mineurs = le croisement, exactement");
  assert.equal(cantrips.options.length, 15, "la mesure de la commande : 15 sorts mineurs de Wizard");
  /* ⭐ 31 DEPUIS LE 2026-08-20, ET LE +1 EST LE POINT DU LOT : `Transfer Essence`
     (niveau 1, Wizard) est entré par `fh-spells-en`. Avant, un magicien de la
     table d'Eric ne pouvait pas préparer un sort que son propre livre décrit —
     le chapitre le portait, le builder l'ignorait. Le compte bouge donc parce
     que la couche fait ce qu'on lui demande, pas parce qu'un seuil a glissé.
     ⚠️ `Devil-Vision` est de niveau 2 : il n'entre pas dans ce compte-ci, et
     c'est la preuve que le filtre de niveau tient toujours. */
  assert.equal(prepared.options.length, 31, "31 sorts de niveau 1 — le plafond de préparation suit `spell_slots`");
  assert.ok(prepared.options.includes("fh:spell:en:transfer-essence"),
    "le sort maison de niveau 1 du magicien est offert");
  assert.equal(prepared.options.includes("fh:spell:en:devil-vision"), false,
    "…et celui de niveau 2 ne l'est pas");
  assert.equal(prepared.options.includes("srd:spell:en:wish"), false,
    "Wish (niveau 9) n'est PAS proposé à un magicien de niveau 1");

  /* LES ÉTAPES MANQUANTES : un créneau par place attendue, chemins indexés. */
  for (const path of ["class.cantrips[0]", "class.cantrips[1]", "class.cantrips[2]",
    "class.prepared[0]", "class.prepared[1]", "class.prepared[2]", "class.prepared[3]"]) {
    assert.ok(decisions.has(path), `le créneau ${path} est publié`);
    assert.equal(decisions.get(path).status, "pending");
  }

  /* LA PROVENANCE : c'est la PROGRESSION qui offre la décision (le compte
     vit chez elle), et elle nomme son champ. */
  assert.deepEqual(cantrips.provenance, {
    mode: "offered", kind: "class-progression", id: "srd:class-progression:en:wizard", field: "resources.cantrips"
  });
});

test("une classe que la progression n'appelle pas ne publie RIEN — pas un plan vide", () => {
  for (const classId of ["srd:class:en:rogue", "srd:class:en:fighter", "srd:class:en:barbarian", "srd:class:en:monk"]) {
    const out = rebuild(docWith({ id: `rien-${classId}`, classId }));
    assert.equal(out.decisions.some((entry) => /^class\.(cantrips|prepared)/.test(entry.path)), false,
      `${classId} : aucun chemin de sort au carnet`);
  }
});

test("Paladin : `prepared_spells` sans `cantrips` — un seul plan, jamais un cadre pour rien", () => {
  const out = rebuild(docWith({ id: "guide-paladin", classId: "srd:class:en:paladin" }));
  const decisions = byPath(out);
  assert.equal(decisions.has("class.cantrips"), false, "pas de ressource → pas de plan mineurs");
  assert.equal(decisions.get("class.prepared").expected, 2);
});

test("Warlock : le plafond vient de `resources.slot_level` — la magie de pacte n'a pas de tableau `spell_slots`", () => {
  const out = rebuild(docWith({ id: "guide-warlock", classId: "srd:class:en:warlock" }));
  const prepared = byPath(out).get("class.prepared");
  assert.ok(prepared.options.length > 0);
  assert.equal(prepared.options.every((id) => spellLevel(id) === 1), true,
    "au niveau 1, aucune option au-dessus du niveau d'emplacement de pacte");
});

test("Wizard niveau 5 : le plafond SUIT `spell_slots` (niveaux 1 à 3), le compte suit la ligne de progression", () => {
  const out = rebuild(docWith({ id: "guide-wizard-5", classId: "srd:class:en:wizard", level: 5 }));
  const prepared = byPath(out).get("class.prepared");
  const niveaux = [...new Set(prepared.options.map(spellLevel))].sort();
  assert.deepEqual(niveaux, [1, 2, 3], "les emplacements du niveau 5 s'arrêtent au 3ᵉ cercle");
  assert.equal(prepared.expected, 9, "la ligne de progression du niveau 5 dit 9 sorts préparés");
});

/* ══ 2 — LE JUGEMENT : changement de classe, sur-compte, mauvais genre ═══ */

test("⭐ LE CAS D'ERIC — Wizard → Rogue : les 7 sorts deviennent `decision.option-unavailable`, et `validate` les remonte", () => {
  /* AVANT ce lot (mesuré, 2026-08-14) : 11 `unconsumed` dont les 7 sorts,
     2 plans verrouillés (les compétences seulement), zéro verrou de sort —
     rien à lire pour une confirmation d'effacement. */
  const out0 = rebuild(structuredClone(fixture.document));
  assert.equal(out0.decisions.filter((d) => /^class\.(cantrips|prepared)/.test(d.path) && d.lock).length, 0,
    "sonde : sur le Wizard, aucun sort n'est en faute");

  const { document } = build.verbs.choose({
    document: out0.document, path: "class", ref: { kind: "class", id: "srd:class:en:rogue" }
  });
  const out = build.verbs.rebuild({ document });

  const verrous = out.decisions.filter((d) => /^class\.(cantrips|prepared)/.test(d.path) && d.lock);
  assert.equal(verrous.length, 9, "2 groupes + 7 étapes, tous verrouillés");
  assert.equal(verrous.every((d) => d.lock.key === "decision.option-unavailable"), true);
  assert.equal(byPath(out).get("class.cantrips").options.length, 0,
    "le croisement d'un Rogue est VIDE — c'est le contenu qui le dit, pas une liste de classes castantes");

  /* Les 7 sorts restent AUSSI `unconsumed` (la dérivation d'un Rogue ne lit
     aucun sort) — signalés des deux côtés, avalés nulle part. */
  const orphelins = out.unconsumed.filter((path) => /^class\.(cantrips|prepared)/.test(path));
  assert.equal(orphelins.length, 7);

  /* Et la sortie de création les refuse UN PAR UN (la boucle du lot 37 lit
     les verrous du carnet), dédupliqués par empreinte : 7 étapes, pas 9
     (le verrou d'un groupe NOMME son premier créneau fautif — même
     empreinte, même refus). */
  const v = build.verbs.validate({ document: out.document });
  const refusSorts = v.violations.filter((violation) => /^class\.(cantrips|prepared)\[/.test(violation.path || ""));
  assert.equal(refusSorts.length, 7);
});

test("Wizard → Cleric : le jugement est PARTIEL — Light et Detect Magic survivent, les cinq autres se verrouillent", () => {
  const out0 = rebuild(structuredClone(fixture.document));
  const { document } = build.verbs.choose({
    document: out0.document, path: "class", ref: { kind: "class", id: "srd:class:en:cleric" }
  });
  const decisions = byPath(build.verbs.rebuild({ document }));

  const attendus = {
    "class.cantrips[0]": "locked",   // Ray of Frost — Sorcerer/Wizard
    "class.cantrips[1]": "answered", // Light — Bard/Cleric/Sorcerer/Wizard
    "class.cantrips[2]": "locked",   // Prestidigitation — pas Cleric
    "class.prepared[0]": "locked",   // Magic Missile
    "class.prepared[1]": "locked",   // Shield
    "class.prepared[2]": "answered", // Detect Magic — huit classes, Cleric compris
    "class.prepared[3]": "locked"    // Sleep
  };
  for (const [path, status] of Object.entries(attendus)) {
    assert.equal(decisions.get(path).status, status, `${path} : ${status}`);
  }
  assert.equal(decisions.get("class.cantrips").status, "locked",
    "le groupe ne prétend pas être simplement pending quand une étape est illégale");
});

test("le sur-compte a SA clef : 4 mineurs posés pour 3 attendus → `spell-grant.count-mismatch`, dit en sorts, pas en compétences", () => {
  const out = rebuild(docWith({
    id: "sur-compte", classId: "srd:class:en:wizard",
    extra: [
      { path: "class.cantrips[0]", ref: { kind: "spell", id: "srd:spell:en:light" } },
      { path: "class.cantrips[1]", ref: { kind: "spell", id: "srd:spell:en:mage-hand" } },
      { path: "class.cantrips[2]", ref: { kind: "spell", id: "srd:spell:en:message" } },
      { path: "class.cantrips[3]", ref: { kind: "spell", id: "srd:spell:en:mending" } }
    ]
  }));
  const plan = byPath(out).get("class.cantrips");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "spell-grant.count-mismatch");
  assert.match(renderBuildViolation(plan.lock), /sort\(s\)/,
    "le mot français compte des SORTS — `skill-grant.count-mismatch` aurait menti sur l'objet");
  /* Chaque étape reste individuellement VALIDE (4 vrais sorts mineurs de
     Wizard) : la faute est le compte, elle vit sur le groupe. */
  assert.equal(out.decisions.filter((d) => /^class\.cantrips\[/.test(d.path) && d.status === "answered").length, 4);
});

test("un contenu qui n'est pas un ref de sort sur un chemin de sort : `decision.kind-mismatch`, en nommant les genres", () => {
  const out = rebuild(docWith({
    id: "mauvais-genre", classId: "srd:class:en:wizard",
    extra: [{ path: "class.cantrips[0]", value: "light" }]
  }));
  const step = byPath(out).get("class.cantrips[0]");
  assert.equal(step.lock.key, "decision.kind-mismatch");
  assert.deepEqual(
    { expectedKind: step.lock.params.expectedKind, actualKind: step.lock.params.actualKind },
    { expectedKind: "spell", actualKind: "value" });
});

test("le croisement se fait par le NOM DU RECORD de classe — prouvé par une classe fabriquée, jamais par une liste en dur", () => {
  /* Une classe « Zzz » qu'aucune table du moteur ne peut connaître : si son
     plan sort quand même, c'est que l'appariement lit le contenu. */
  const h = makeHarness({
    extra: uneCouche("test-sorts-zzz", {
      class: { "test:class:zz:zzz": { op: "add", name: "Zzz", slug: "zzz", data: {} } },
      "class-progression": {
        "test:prog:zz:zzz": {
          op: "add", name: "Zzz — progression", slug: "zzz-progression",
          data: { class: "test:class:zz:zzz", levels: [{ level: 1, resources: { cantrips: 1 }, spell_slots: [1] }] }
        }
      },
      spell: {
        "test:spell:zz:etincelle": {
          op: "add", name: "Étincelle", slug: "etincelle",
          data: { classes: ["Zzz"], level: 0, school: "évocation" }
        }
      }
    })
  });
  const decisions = projectDecisions({
    query: h.layers.verbs.query,
    choices: [{ path: "level", value: 1 }, { path: "class", ref: { kind: "class", id: "test:class:zz:zzz" } }]
  });
  const plan = decisions.find((entry) => entry.path === "class.cantrips");
  assert.ok(plan, "la classe fabriquée publie son plan");
  assert.deepEqual(plan.options, ["test:spell:zz:etincelle"],
    "une seule option : le sort qui liste « Zzz » — les 339 du SRD n'y entrent pas");
  assert.equal(plan.expected, 1);
});

/* ══ 2b — LA PILE FR GUIDE, DEPUIS LE LOT 98 ═════════════════════════════
   🔴 CE BLOC DISAIT L'INVERSE, ET IL AVAIT RAISON JUSQU'AU 2026-08-23. La
   progression FRANÇAISE nommait ses ressources en français — `sorts_mineurs`
   / `sorts_prepares` — et le moteur REFUSE, à juste titre, de porter une
   table `sorts_mineurs → cantrips` (la même faute que `"Sagesse" → wis`).
   Conséquence : sur la pile FR le compte n'existait pas pour lui, il JUGEAIT
   ce qui était posé sans jamais guider.

   ⭐ LE LOT 98 DE fh-srd A MIGRÉ CES 18 CLEFS DE RESSOURCE EN ANGLAIS DES
   DEUX CÔTÉS, et la conséquence dépasse le renommage : la progression FR
   porte maintenant `cantrips: 3` / `prepared_spells: 4`, donc le français
   GUIDE — créneaux vides publiés, provenance nommée, exactement comme
   l'anglais. Ce n'est pas le moteur qui a appris à traduire ; c'est la
   couche qui a cessé de parler une langue qu'il avait interdiction de
   deviner. La règle §1c n'a pas bougé d'une ligne : elle a cessé de mordre
   parce que le record nomme enfin ses clefs. */

test("pile FR — le magicien d'exemple est GUIDÉ comme l'anglais : 3/3 et 4/4, et le record nomme sa provenance", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const decisions = byPath(out);
  const cantrips = decisions.get("class.cantrips");
  assert.deepEqual(
    { expected: cantrips.expected, answered: cantrips.answered, status: cantrips.status },
    { expected: 3, answered: 3, status: "answered" },
    "trois sorts mineurs attendus, trois posés");
  /* ⭐ LE POINT DU LOT 101 : la provenance EXISTE désormais sur la pile FR, et
     elle NOMME le record et le champ qui offrent le compte. Un compte sans
     provenance serait un compte inventé ; celui-ci se laisse vérifier. */
  assert.deepEqual(cantrips.provenance,
    { mode: "offered", kind: "class-progression", id: "srd:class-progression:en:wizard", field: "resources.cantrips" },
    "le compte est OFFERT par un record français qui se nomme — plus aucune devinette");
  assert.equal(decisions.get("class.prepared").provenance.field, "resources.prepared_spells");
  assert.equal(decisions.get("class.prepared").answered, 4);
  /* 16, pas 15 : la couche homebrew du harnais ajoute « Chuchotement des
     pages » (niveau 0, classes ["Magicien"]) — le croisement embarque
     l'homebrew SANS une ligne de moteur en plus, et c'est le point. */
  assert.equal(cantrips.options.length, 16, "le croisement, lui, fonctionne en FR — « Magicien » est le nom du record");
  assert.equal(cantrips.options.includes("exemple:spell:fr:chuchotement-des-pages"), true,
    "le sort homebrew est une option comme les autres");
  assert.equal(decisions.has("class.cantrips[3]"), false, "aucun créneau manquant inventé");
});

test("pile FR — un magicien SANS sort posé reçoit ses SEPT créneaux vides : le français guide enfin", () => {
  /* 🔴 CE TEST ATTENDAIT `false`, ET C'EST LE RENVERSEMENT LE PLUS PARLANT DU
     LOT 98 : un magicien français qui n'avait rien posé ne recevait AUCUN
     plan — l'écran ne pouvait donc rien lui proposer, faute d'un compte
     lisible. Il en reçoit maintenant NEUF : les deux groupes, plus les 3 + 4
     créneaux vides que la progression déclare. ⛔ Et ce n'est pas un compte
     inventé : chaque plan porte la provenance du record qui l'offre. */
  const h = makeHarness();
  const example = readJson(EXAMPLE_CHAR);
  const document = acceptanceDocument(h.layers);
  document.build.choices = example.build.choices.filter((choice) => !/^class\.(cantrips|prepared)/.test(choice.path));
  const out = h.verbs.rebuild({ document });
  const plans = out.decisions.filter((entry) => /^class\.(cantrips|prepared)/.test(entry.path));
  assert.equal(plans.length, 9, "2 groupes + 3 créneaux de sorts mineurs + 4 de sorts préparés");
  assert.equal(plans.every((plan) => plan.status === "pending" && plan.answered === 0), true,
    "tous en attente : rien n'est posé, et rien n'est inventé à la place du joueur");
  assert.equal(plans.every((plan) => plan.provenance?.id === "srd:class-progression:en:wizard"), true,
    "chaque créneau dit d'où vient son compte");
});

test("pile FR — magicien → roublard : les 7 sorts sont verrouillés quand même, le jugement ne dépend pas du compte", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  h.verbs.choose({ path: "class", ref: { kind: "class", id: "srd:class:en:rogue" } });
  const out = h.verbs.rebuild({});
  const verrous = out.decisions.filter((d) => /^class\.(cantrips|prepared)/.test(d.path) && d.lock);
  assert.equal(verrous.length, 9, "2 groupes + 7 étapes");
  assert.equal(verrous.every((d) => d.lock.key === "decision.option-unavailable"), true);
});

/* ══ 3 — L'ÉCRAN : le QCM partagé, la confirmation nommée, le palier, Review ═ */

function menuDe(decisions, act = () => {}) {
  return renderClassChoices({ decisions, query }, act);
}

test("le 2ᵉ palier d'un Wizard porte TROIS blocs — compétences, mineurs, préparés — et les cases posent des `choose` de records", () => {
  const out = rebuild(docWith({ id: "ecran-wizard", classId: "srd:class:en:wizard" }));
  const calls = [];
  const node = menuDe(out.decisions, (action) => calls.push(action));

  /* ⚠️ LOT 79 — LES TROIS BLOCS SONT DÉSORMAIS DES ÉCRANS À CRÉNEAUX. Les
     compétences y sont passées à l'étape 2, les sorts mineurs à l'étape 3,
     les sorts préparés à l'étape 4 : plus aucun QCM au 2ᵉ palier de Class.
     ⭐ CE QUE CE GARDE VÉRIFIE N'A PAS CHANGÉ D'UN MOT — l'ORDRE des trois
     titres (compétences, mineurs, préparés), le fait que les options soient
     NOMMÉES par le record, et que le geste pose un `choose` de record. C'est
     la FORME qui a bougé, pas la question. */
  const blocs = node.querySelectorAll(".choix-glisse");
  assert.equal(blocs.length, 3, "trois blocs à créneaux — et plus un seul QCM ici");
  assert.equal(node.querySelectorAll(".skills-budget-block").length, 0,
    "le QCM a quitté cet écran (il sert encore l'espèce et le don d'origine)");
  /* ⭐ « Class skills » EST DEVENU « Skill points » — la classe ne fait plus
     cocher des maîtrises, elle fait DÉPENSER des points liés. Le titre suit le
     geste, comme partout ici. */
  assert.deepEqual(blocs.map((b) => b.querySelectorAll("h3")[0].textContent),
    ["Skill points", "Cantrips", "Prepared spells"]);

  /* Le bloc des mineurs : 3 créneaux (« Cantrip 1 »…), 15 jetons dans le
     vivier, nommés par le RECORD (« Ray of Frost ») et identifiés par
     `data-valeur` (l'id complet). */
  const mineurs = blocs[1];
  assert.equal(mineurs.querySelectorAll(".glisse-creneau").length, 3);
  assert.equal(mineurs.querySelectorAll(".glisse-creneau-nom")[0].textContent, "Cantrip 1");
  /* 🧊 CE CAS EXIGEAIT `.glisse-grille` — la fenêtre défilante du croquis C —
     jusqu'au 2026-08-20. Eric l'a retirée : *« plus d'ascenseurs couplés avec
     des actions drag and drop »*. Ce qu'on garde, c'est que les sorts passent
     par le MÊME vivier que partout ailleurs, et surtout PAS par l'ancien QCM :
     c'était l'autre moitié de ce que le drapeau `grille` commandait, et la
     retirer sans regarder aurait renvoyé les trente sorts au QCM. */
  assert.equal(mineurs.querySelectorAll(".glisse-vivier").length, 1,
    "les sorts se glissent, comme partout — un seul vivier, aucune variante");
  assert.equal(mineurs.querySelectorAll(".glisse-grille").length, 0,
    "et plus aucune fenêtre défilante sous un glisser");
  const jetons = mineurs.querySelectorAll(".glisse-jeton");
  assert.equal(jetons.length, 15);
  const rayOfFrost = jetons.find((b) => b.getAttribute("data-valeur") === "srd:spell:en:ray-of-frost");
  assert.equal(rayOfFrost.textContent, "Ray of Frost", "le nom vient du record — l'id de sort est un id COMPLET, `query` le trouve");

  /* Le geste pose un RECORD — `choose` + ref, jamais un `set` scalaire.
     ⚠️ À LA SOURIS : depuis la décision d'Eric du 16/08 au soir, le tap d'un
     DOIGT ouvre l'info sur ces grilles. Le contrat d'action, lui, est le même
     quel que soit l'outil — c'est ce qu'on vérifie ici. */
  document.elementFromPoint = () => null;
  rayOfFrost.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  rayOfFrost.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
  assert.deepEqual(calls, [{
    kind: "choose", path: "class.cantrips[0]", ref: { kind: "spell", id: "srd:spell:en:ray-of-frost" }
  }]);
});

test("un Rogue n'affiche NI bloc de sorts NI confirmation quand rien ne traîne", () => {
  const out = rebuild(docWith({ id: "ecran-rogue", classId: "srd:class:en:rogue" }));
  const node = menuDe(out.decisions);
  assert.equal(node.querySelectorAll(".skills-budget-block").length, 0, "aucun QCM : un Rogue n'a pas de sorts");
  /* ⭐ RÉVISÉ LE 2026-08-20 — DEUX BLOCS, ET AUCUN N'EST DES SORTS : les points
     liés, puis les maîtrises d'arme (le Roublard porte Weapon Mastery au niveau
     1). Ce que ce garde prouve n'a pas bougé d'un mot — « un Roublard n'affiche
     pas de sorts » — mais le compter par « il n'y a qu'un bloc » liait la
     question à un état qui pouvait changer, et il a changé. On compte donc
     désormais ce qui est VRAIMENT en cause. */
  assert.equal(node.querySelectorAll(".choix-glisse").length, 2,
    "les points liés et les maîtrises d'arme — et rien d'autre");
  const titres = node.querySelectorAll(".choix-glisse h3").map((h) => h.textContent);
  assert.deepEqual(titres.filter((t) => /cantrip|spell/i.test(t)), [],
    "⛔ AUCUN titre de sorts : c'est ÇA que ce test protège");
  assert.equal(node.querySelectorAll(".confirm-dialog").length, 0);
});

test("⭐ Wizard → Rogue : la confirmation NOMME les 7 sorts perdus, et « Clear them » efface EXACTEMENT leurs chemins", () => {
  const out0 = rebuild(structuredClone(fixture.document));
  const { document } = build.verbs.choose({
    document: out0.document, path: "class", ref: { kind: "class", id: "srd:class:en:rogue" }
  });
  const out = build.verbs.rebuild({ document });

  const calls = [];
  const node = menuDe(out.decisions, (action) => calls.push(action));
  const dialogs = node.querySelectorAll(".confirm-dialog");
  assert.equal(dialogs.length, 2, "celle des compétences (lot 46) ET celle des sorts (ce lot) — chacune nomme SES pertes");

  const sorts = dialogs[1];
  assert.equal(sorts.querySelectorAll(".confirm-dialog-title")[0].textContent,
    "These spells are no longer valid for this class:");
  assert.deepEqual(sorts.querySelectorAll(".confirm-dialog-items li").map((li) => li.textContent),
    ["Ray of Frost", "Light", "Prestidigitation", "Magic Missile", "Shield", "Detect Magic", "Sleep"],
    "les pertes sont NOMMÉES — jamais un compte, jamais « êtes-vous sûr ? »");

  sorts.querySelectorAll(".confirm-dialog-confirm")[0].click();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].kind, "resetSkills", "le même geste que les compétences : « efface ces chemins, un rebuild »");
  assert.deepEqual(calls[0].paths, [
    "class.cantrips[0]", "class.cantrips[1]", "class.cantrips[2]",
    "class.prepared[0]", "class.prepared[1]", "class.prepared[2]", "class.prepared[3]"
  ]);

  /* L'EFFET RÉEL, joué avec les vrais verbes (le geste de `resetSkills` dans
     `shell.mjs`) : après l'effacement, plus AUCUN chemin de sort au carnet
     (un Rogue ne publie rien), plus aucun sort dans `unconsumed` — et le
     personnage repasse de 13 lignes en souffrance à ce que les compétences
     seules justifient. */
  let cleaned = out.document;
  for (const path of calls[0].paths) cleaned = build.verbs.clear({ document: cleaned, path, kind: "choice" }).document;
  const after = build.verbs.rebuild({ document: cleaned });
  assert.equal(after.decisions.some((d) => /^class\.(cantrips|prepared)/.test(d.path)), false);
  assert.equal(after.unconsumed.some((path) => /^class\.(cantrips|prepared)/.test(path)), false);
});

test("⚔️ « Keep them locked » ne touche rien : aucun verbe ne part, le document reste identique à l'octet", () => {
  const out0 = rebuild(structuredClone(fixture.document));
  const { document } = build.verbs.choose({
    document: out0.document, path: "class", ref: { kind: "class", id: "srd:class:en:rogue" }
  });
  const out = build.verbs.rebuild({ document });
  const before = JSON.stringify(out.document);
  const calls = [];
  const node = menuDe(out.decisions, (action) => calls.push(action));
  node.querySelectorAll(".confirm-dialog")[1].querySelectorAll(".confirm-dialog-cancel")[0].click();
  assert.deepEqual(calls, []);
  assert.equal(JSON.stringify(out.document), before);
});

test("le palier 2 attend AUSSI les sorts : 2/2 compétences ne suffisent plus à un Wizard", () => {
  const sansSorts = rebuild(docWith({
    id: "palier-sans-sorts", classId: "srd:class:en:wizard",
    extra: [
      { path: "class.skillBudget.arcana", value: "novice" },
      { path: "class.skillBudget.investigation", value: "novice" }
    ]
  }));
  assert.deepEqual(classPalier2(sansSorts.decisions), { ready: false },
    "compétences faites, sorts à 0/3 et 0/4 : pas prêt");

  const complet = rebuild(structuredClone(fixture.document));
  assert.deepEqual(classPalier2(complet.decisions), { ready: true },
    "le personnage d'exemple a tout choisi : prêt");

  /* ⭐ RÉVISÉ LE 2026-08-20 — UN NON-LANCEUR N'EST PAS UN PERSONNAGE SANS
     CHOIX. Ce garde disait « aucun plan de sorts : ils ne bloquent pas un
     Rogue », et il le prouvait en montrant le Roublard PRÊT avec ses seules
     compétences. Depuis les maîtrises d'arme, il lui manque autre chose — et
     la conclusion « prêt » deviendrait fausse pour une raison qui n'a rien à
     voir avec les sorts.
     ⛔ ON NE RELÂCHE PAS LE GARDE, ON POSE SA VRAIE QUESTION : les SORTS ne
     bloquent pas un Roublard. Cela se prouve en le rendant prêt une fois TOUS
     ses plans remplis — et en montrant qu'aucun d'eux n'est un plan de sorts. */
  const rogue = rebuild(docWith({
    id: "palier-rogue", classId: "srd:class:en:rogue",
    extra: [
      /* SIX POINTS : deux novices et un expert — la répartition du canon. */
      { path: "class.skillBudget.acrobatics", value: "novice" },
      { path: "class.skillBudget.athletics", value: "novice" },
      { path: "class.skillBudget.stealth", value: "expert" },
      /* DEUX MAÎTRISES : le Roublard porte Weapon Mastery au niveau 1. */
      { path: "class.weaponMastery[0]", ref: { kind: "weapon", id: "srd:weapon:en:dagger" } },
      { path: "class.weaponMastery[1]", ref: { kind: "weapon", id: "srd:weapon:en:shortsword" } }
    ]
  }));
  const cheminsDuRogue = rogue.decisions.map((d) => d.path).filter((c) => c.startsWith("class."));
  assert.deepEqual(cheminsDuRogue.filter((c) => /cantrips|prepared/.test(c)), [],
    "⛔ LE FAIT QUE CE GARDE PROTÈGE : aucun plan de sorts pour un Roublard");
  assert.deepEqual(classPalier2(rogue.decisions), { ready: true },
    "tous ses plans remplis — et aucun n'est un plan de sorts");
});

test("Review route les deux chemins de sorts vers l'étape Class, et les montre comme n'importe quelle décision", () => {
  const groupe = REVIEW_GROUPS.find((entry) => entry.step === "class");
  /* ⭐ `class.skillBudget` REMPLACE `class.skills` — 2026-08-20. Review montre
     les décisions de l'étape ; celle des compétences a changé de chemin avec le
     système. La laisser sur l'ancien aurait fait une ligne muette : Review
     n'aurait plus rien trouvé à router, et la décision aurait disparu du bilan
     sans que personne la voie partir. */
  /* ⭐ `class.weaponMastery` ENTRE LE 2026-08-20, pour la même raison exacte :
     cinq classes sur douze la portent, et sans ce chemin un Roublard sans
     maîtrise choisie compterait pour FINI — au récapitulatif comme dans la
     lumière du belt, qui lit la même table. */
  /* ⭐ `class.invocations` ENTRE LE 2026-08-29 — Eric : *« choix des eldritch
     invocations sous forme de token pas fait »*. Troisième fois que cette
     liste s'allonge pour la même raison, et c'est le signe que le garde sert :
     un chemin non recensé fait compter FINI une étape inachevée. */
  assert.deepEqual(groupe.paths,
    ["class", "class.skillBudget", "class.weaponMastery", "class.invocations",
     "class.cantrips", "class.prepared"]);

  /* Sur le personnage d'exemple : la ligne Class est FAITE, quatre états
     « done ». Sur le même passé Rogue sans nettoyage : elle crie. */
  const complet = rebuild(structuredClone(fixture.document));
  let review = renderReviewStep({
    document: complet.document, resolved: complet.resolved, decisions: complet.decisions,
    report: complet, violations: []
  });
  let ligne = review.querySelectorAll(".review-line").find((li) => li.getAttribute("data-step") === "class");
  assert.equal(ligne.getAttribute("data-done"), "true");
  assert.equal(ligne.querySelectorAll(".review-line-state")[0].textContent, "done · done · done · done");

  const { document } = build.verbs.choose({
    document: complet.document, path: "class", ref: { kind: "class", id: "srd:class:en:rogue" }
  });
  const casse = build.verbs.rebuild({ document });
  review = renderReviewStep({
    document: casse.document, resolved: casse.resolved, decisions: casse.decisions,
    report: casse, violations: []
  });
  ligne = review.querySelectorAll(".review-line").find((li) => li.getAttribute("data-step") === "class");
  assert.equal(ligne.getAttribute("data-done"), "false");
  assert.match(ligne.querySelectorAll(".review-line-state")[0].textContent, /needs attention/,
    "les sorts orphelins se voient dans Review — c'était la moitié du problème d'Eric");
});

/* ══ LES MAÎTRISES D'ARME — le plan, ses options, son verrou ════════════════
   2026-08-20. Eric : *« mais il n'y a pas les weapon masteries dans les
   classes ? »*. Il a fallu descendre jusqu'au SRD pour que la donnée existe.
   Ces gardes tiennent le côté MOTEUR : ce que le carnet publie, et ce qu'il
   refuse. L'écran est gardé ailleurs. */

test("🔴 le plan des maîtrises lit la CLASSE — compte ET vivier, jamais la progression", () => {
  const rogue = rebuild(docWith({ id: "wm-rogue", classId: "srd:class:en:rogue" }));
  const plan = rogue.decisions.find((d) => d.path === "class.weaponMastery");
  assert.ok(plan, "un Roublard porte Weapon Mastery au niveau 1");
  assert.equal(plan.expected, 2, "le compte vient de `class.weapon_mastery_count`");
  assert.equal(plan.options.length, 19, "et le vivier de `class.weapon_mastery_from`");
  assert.equal(plan.answered, 0);
  /* ⚔️ LE TÉMOIN QUI REND CE GARDE UTILE : le Roublard n'a AUCUNE colonne
     « Weapon Mastery » dans sa progression. Un plan écrit sur le patron des
     sorts — qui, lui, lit la progression — ne trouverait rien ici et
     n'existerait pas. C'est le piège que ce test tient fermé. */
  assert.equal(plan.expected, 2, "…et il existe, donc la lecture ne passe pas par la progression");
});

test("un Magicien ne publie AUCUN plan de maîtrises — pas un plan vide", () => {
  const wizard = rebuild(docWith({ id: "wm-wizard", classId: "srd:class:en:wizard" }));
  assert.equal(wizard.decisions.find((d) => d.path === "class.weaponMastery"), undefined,
    "aucune feature, aucun plan — un cadre vide serait une invitation mensongère");
});

test("⚔️ une arme HORS du vivier est verrouillée, et le verrou la NOMME", () => {
  /* La Greataxe est martiale de mêlée : elle est dans le vivier du barbare et
     PAS dans celui du roublard (ni Finesse ni Légère). */
  const out = rebuild(docWith({
    id: "wm-illegal", classId: "srd:class:en:rogue",
    extra: [{ path: "class.weaponMastery[0]", ref: { kind: "weapon", id: "srd:weapon:en:greataxe" } }]
  }));
  const creneau = out.decisions.find((d) => d.path === "class.weaponMastery[0]");
  assert.ok(creneau.lock, "le créneau est verrouillé");
  assert.equal(creneau.lock.key, "decision.option-unavailable");
  assert.match(creneau.lock.params.selected, /greataxe/);
});

test("⚔️ un SORT posé sur un créneau de maîtrise est refusé par le GENRE", () => {
  /* L'organe des créneaux était câblé sur « spell » en dur ; sa généralisation
     ne vaut que si le genre attendu suit vraiment le chemin. */
  const out = rebuild(docWith({
    id: "wm-kind", classId: "srd:class:en:rogue",
    extra: [{ path: "class.weaponMastery[0]", ref: { kind: "spell", id: "srd:spell:en:fireball" } }]
  }));
  const creneau = out.decisions.find((d) => d.path === "class.weaponMastery[0]");
  assert.equal(creneau.lock.key, "decision.kind-mismatch");
  assert.equal(creneau.lock.params.expectedKind, "weapon", "et il attend une ARME, pas un sort");
});

test("⚔️ le sur-compte a SA clef : 3 maîtrises pour 2 → `weapon-grant.count-mismatch`", () => {
  const out = rebuild(docWith({
    id: "wm-trop", classId: "srd:class:en:rogue",
    extra: [
      { path: "class.weaponMastery[0]", ref: { kind: "weapon", id: "srd:weapon:en:dagger" } },
      { path: "class.weaponMastery[1]", ref: { kind: "weapon", id: "srd:weapon:en:shortsword" } },
      { path: "class.weaponMastery[2]", ref: { kind: "weapon", id: "srd:weapon:en:rapier" } }
    ]
  }));
  const plan = out.decisions.find((d) => d.path === "class.weaponMastery");
  assert.equal(plan.lock.key, "weapon-grant.count-mismatch",
    "dit en maîtrises d'arme, pas en sorts ni en compétences");
});

test("⭐ LA CHAÎNE ENTIÈRE : l'arme choisie devient un trait qui EXPLIQUE sa maîtrise", () => {
  const out = rebuild(docWith({
    id: "wm-derive", classId: "srd:class:en:rogue",
    extra: [{ path: "class.weaponMastery[0]", ref: { kind: "weapon", id: "srd:weapon:en:dagger" } }]
  }));
  const trait = (out.resolved.traits || []).find((t) => t.category === "weapon-mastery");
  assert.ok(trait, "le choix arrive sur la fiche");
  assert.equal(trait.name, "Dagger", "sous le nom de l'ARME — c'est elle qu'on a choisie");
  assert.match(trait.text, /^Nick — /, "et son texte porte la PROPRIÉTÉ, puis ce qu'elle fait");
  assert.match(trait.text, /extra attack of the Light property/,
    "le texte du SRD, verbatim — pas une paraphrase de l'écran");
  /* ⛔ ET LE CHOIX EST CONSOMMÉ : sans ça il ressortirait `unconsumed`, et
     `validate` dirait du personnage qu'il porte une intention sans effet. */
  assert.equal((out.unconsumed || []).includes("class.weaponMastery[0]"), false);
});
