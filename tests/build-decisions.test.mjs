/* Lot 28 — le septième carnet de `rebuild` : des identifiants et des
   compteurs, jamais une seconde dérivation ni un constructeur caché. */

import test from "node:test";
import assert from "node:assert/strict";

import {
  acceptanceDocument, makeHarness, manifestOf, SRD_EN, FH_SPECIES_EN, uneCouche
} from "./build-harness.mjs";
import { renderBuildViolation, createLabels, renderUnderived, FR_UNDERIVED } from "../src/labels.mjs";
/* LOT 74 — la borne de création publiée : les tests comparent le carnet à
   l'export public, jamais à une copie locale des seize valeurs. */
import { projectDecisions, CREATION_SCORES, CREATION_SCORE_MIN, CREATION_SCORE_MAX } from "../src/build/index.mjs";

const frUnderived = createLabels(FR_UNDERIVED);

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";

function byPath(out) {
  return new Map(out.decisions.map((entry) => [entry.path, entry]));
}

function englishDocument(h, speciesId, speciesSkill) {
  const choices = [
    { path: "level", value: 1 },
    { path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } },
    { path: "species", ref: { kind: "species", id: speciesId } },
    /* LOT 43 — plus de choix `background` : l'Inheritance est le seul record
       du genre sous `fh-skills-en`, livrée, jamais choisie (contrat §1a). */
    { path: "class.skills[0]", value: "athletics" },
    { path: "class.skills[1]", value: "perception" },
    { path: "abilities.str", value: 14 }, { path: "abilities.dex", value: 12 },
    { path: "abilities.con", value: 14 }, { path: "abilities.int", value: 10 },
    { path: "abilities.wis", value: 12 }, { path: "abilities.cha", value: 10 }
  ];
  if (speciesSkill) choices.push({ path: "species.granted", value: speciesSkill });
  return {
    schema: "fh-char/1", id: "lot28-decisions", name: "Decisions", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/build-decisions", version: "1.0.0" },
    created: "2026-08-10T08:00:00Z", modified: "2026-08-10T08:00:00Z",
    build: { layers: manifestOf(h.layers), choices, budgets: {}, overrides: [] }
  };
}

test("le carnet SRD pur projette les familles réelles — sorts compris depuis le lot 72", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const decisions = byPath(out);

  assert.deepEqual([...decisions.keys()], [...decisions.keys()].sort(), "le chemin indexe une liste stable");
  assert.equal(decisions.size, out.decisions.length, "aucun chemin n'apparaît deux fois");
  /* LOT 72 — « Elle ne projette ni sorts » est mort : les 7 sorts du magicien
     d'exemple entrent au carnet (2 groupes + 7 étapes). ⚠️ Sur la pile FR, le
     compte n'est PAS lu (les clefs de ressource sont langue-natives,
     `layers/TRADUCTION.md` — la progression FR dit `sorts_mineurs`, pas
     `cantrips`) : le plan JUGE les réponses posées sans inventer de compte,
     donc pas de créneau manquant ici — les neuf chemins sont ceux du
     document. */
  /* LOT 74 — les six scores de base entrent au carnet (borne de création
     3–18, Eric 2026-08-15) : six chemins `abilities.<clef>` de plus, en
     tête de tri. Le document d'acceptation est niveau 1, six scores posés
     dans la borne — six plans `answered`, aucun verrou. */
  assert.deepEqual([...decisions.keys()], [
    "abilities.cha", "abilities.con", "abilities.dex", "abilities.int", "abilities.str", "abilities.wis",
    "background", "background.boost", "background.boost.con", "background.boost.int",
    "background.originFeat[0]", "background.tool", "class",
    "class.cantrips", "class.cantrips[0]", "class.cantrips[1]", "class.cantrips[2]",
    "class.prepared", "class.prepared[0]", "class.prepared[1]", "class.prepared[2]", "class.prepared[3]",
    "class.skills", "class.skills[0]",
    /* 2026-08-18 — `species.lineage` ENTRE AU CARNET. L'Elfe du document
       d'acceptation choisit sa lignée (Drow, Elfe sylvestre, Haut-elfe), et
       ce choix vient du SRD lui-même : la couche française porte
       `data.lineages` sans qu'une ligne de français ait été écrite pour lui.
       ⭐ ET LE CHOIX ÉTAIT DÉJÀ DANS LE DOCUMENT. `species.lineage =
       "haut-elfe"` y est écrit depuis toujours — sans aucun plan pour le
       juger. Ce n'est donc pas un chemin neuf : c'est le plan qui manquait
       sous un chemin que le dépôt écrivait déjà. Il sort `answered`, et sans
       étape `[0]` : une question déjà répondue n'ouvre pas de créneau. */
    "class.skills[1]", "species", "species.keenSenses",
    "species.lineage", "species.skills"
  ]);
  assert.equal(out.decisions.some((entry) => /gear|level|tier|fh\.skills/.test(entry.path)), false,
    "ni équipement, ni niveau, ni dépense de palier simulée");
  assert.equal(out.decisions.every((entry) => entry.status === "answered"), true,
    "une décision complète reste visible answered, sans fausse étape pending");
  assert.deepEqual(decisions.get("class.skills").provenance, {
    mode: "offered", kind: "class", id: "srd:class:fr:magicien", field: "skill_choice"
  });
  /* LOT 43, §1b — `background.feat` a disparu ; le don d'origine se projette
     désormais sur `background.originFeat[0]`, le SEUL chemin que les modules
     lisaient déjà. Un `feat_id` imposé (le cas SRD) reste `required`. */
  assert.deepEqual(decisions.get("background.originFeat[0]").provenance, {
    mode: "required", kind: "background", id: "srd:background:fr:sage", field: "feat_id"
  });
});

test("set / clear / rebuild ferment la boucle : partiel, restauration, statut", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  h.verbs.clear({ path: "class.skills[1]", kind: "choice" });
  let out = h.verbs.rebuild({});
  let decisions = byPath(out);
  assert.deepEqual(decisions.get("class.skills"), {
    path: "class.skills",
    options: ["arcanes", "histoire", "intuition", "investigation", "medecine", "nature", "religion"],
    selected: ["investigation"], expected: 2, answered: 1,
    provenance: { mode: "offered", kind: "class", id: "srd:class:fr:magicien", field: "skill_choice" },
    remaining: 1, status: "pending"
  });
  assert.equal(decisions.get("class.skills[0]").status, "answered");
  assert.equal(decisions.get("class.skills[1]").status, "pending");

  h.verbs.set({ path: "class.skills[1]", value: "religion" });
  out = h.verbs.rebuild({});
  decisions = byPath(out);
  assert.equal(decisions.get("class.skills").status, "answered");
  assert.equal(decisions.get("class.skills").remaining, 0);
  assert.equal(decisions.get("class.skills[1]").status, "answered");
});

test("les refs, le grant d'espèce, les boosts et le don ferment chacun clear / pose / rebuild", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const cases = [
    {
      path: "species", kind: "choice", projected: "species",
      restore: () => h.verbs.choose({ path: "species", ref: { kind: "species", id: "srd:species:fr:elfe" } })
    },
    {
      path: "species.keenSenses", kind: "choice", projected: "species.skills",
      restore: () => h.verbs.set({ path: "species.keenSenses", value: "perception" })
    },
    {
      /* LOT 43, §1d — retirer `background.boost.con` laisse le total à 2, et
         2 ≠ 3 est maintenant un total illégal (`background.boost-total-
         mismatch`), pas un plan simplement incomplet : `pending` décrivait un
         garde qui ne comptait pas encore, avant ce lot. */
      path: "background.boost.con", kind: "choice", projected: "background.boost", statusAfterClear: "locked",
      restore: () => h.verbs.set({ path: "background.boost.con", value: 1 })
    },
    {
      /* LOT 43, §1b/§3d — `srd:background:fr:sage` porte `feat_id` (imposé) :
         le plan l'ANNONCE (`options: [featId], selected: [featId]`) sur le
         patron de `tool_id`, sans jamais lire `choices` — un `clear` n'a donc
         RIEN à retirer, et le statut reste `answered` tout du long. C'est
         `condition de sortie n°6` rendue observable : un SRD pur ne perd rien. */
      path: "background.originFeat[0]", kind: "choice", projected: "background.originFeat[0]", statusAfterClear: "answered",
      restore: () => h.verbs.choose({ path: "background.originFeat[0]", ref: { kind: "feat", id: "srd:feat:fr:initie-a-la-magie" } })
    }
  ];
  for (const scenario of cases) {
    h.verbs.clear({ path: scenario.path, kind: scenario.kind });
    let decisions = byPath(h.verbs.rebuild({}));
    assert.equal(decisions.get(scenario.projected).status, scenario.statusAfterClear || "pending",
      `${scenario.path} retiré devient ${scenario.statusAfterClear || "pending"}`);
    scenario.restore();
    decisions = byPath(h.verbs.rebuild({}));
    assert.equal(decisions.get(scenario.projected).status, "answered", `${scenario.path} restauré redevient answered`);
  }
});

test("un faux choix reste dans le carnet, locked, avec une clef du paquet commun", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  h.verbs.clear({ path: "class.skills[1]", kind: "choice" });
  h.verbs.set({ path: "class.skills[7]", value: "athletisme" });
  let out = h.verbs.rebuild({});
  let decisions = byPath(out);
  const locked = decisions.get("class.skills[7]");
  assert.equal(locked.status, "locked");
  assert.equal(locked.lock.key, "decision.option-unavailable");
  assert.deepEqual(Object.keys(locked.lock).sort(), ["key", "params", "path"]);
  assert.match(renderBuildViolation(locked.lock), /athletisme/,
    "la clef de verrou est disponible dans le mécanisme de libellés existant");
  assert.equal(decisions.get("class.skills").status, "locked",
    "le plan entier ne prétend pas être simplement pending quand une de ses étapes est illégale");

  h.verbs.clear({ path: "class.skills[7]", kind: "choice" });
  h.verbs.set({ path: "class.skills[1]", value: "religion" });
  out = h.verbs.rebuild({});
  decisions = byPath(out);
  assert.equal(decisions.has("class.skills[7]"), false, "le faux chemin ne laisse aucun statut fantôme");
  assert.equal(decisions.get("class.skills").status, "answered");
});

test("une compétence sans `ability_key` reste illégale pour le pli ET pour la projection", () => {
  const h = makeHarness({
    extra: uneCouche("scenario-competence-sans-clef", {
      skill: {
        "srd:skill:fr:arcanes": {
          op: "add", name: "Arcanes sans clef", slug: "arcanes", data: { ability: "Intelligence" }
        }
      }
    })
  });
  let out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  let decisions = byPath(out);
  assert.equal(decisions.get("class.skills").options.includes("arcanes"), false,
    "la projection n'annonce jamais une compétence que le pli doit sauter");
  assert.equal(out.resolved.skills.some((skill) => skill.id === "arcanes"), false,
    "le comportement historique de derive reste le saut de l'entrée incomplète");
  const underived = out.underived.find((entry) => entry.field === "skills[arcanes]");
  /* REWRITTEN 2026-08-13 (lot 41) — `.reason` → `{key, params}` (loi §0.13,
     le moteur produit des identifiants). Le mot se relit via `renderUnderived`. */
  assert.equal(underived.key, "underived.skill-missing-ability-key");
  assert.match(renderUnderived(underived, frUnderived), /ability_key/, "le saut conserve sa raison historique explicite");

  h.verbs.clear({ path: "class.skills[1]", kind: "choice" });
  h.verbs.set({ path: "class.skills[1]", value: "arcanes" });
  out = h.verbs.rebuild({});
  decisions = byPath(out);
  assert.equal(decisions.get("class.skills").status, "locked",
    "un choix devenu illégal ne transforme pas la boucle en faux pending");
  assert.equal(decisions.get("class.skills[1]").lock.key, "decision.option-unavailable");
  assert.equal(out.unconsumed.includes("class.skills[1]"), true,
    "derive continue de laisser honnêtement le choix illégal non consommé");

  h.verbs.clear({ path: "class.skills[1]", kind: "choice" });
  h.verbs.set({ path: "class.skills[1]", value: "religion" });
  out = h.verbs.rebuild({});
  assert.equal(byPath(out).get("class.skills").status, "answered",
    "un choix légal referme toujours la boucle");
});

test("PLUS AUCUNE espèce n'ouvre `species.skills` ; Elestu garde sa bourse de trois", () => {
  /* 🔴 RÉÉCRIT LE 2026-08-17, ET LE RENVERSEMENT EST LA MOITIÉ DU TEST. Ce
     test prouvait qu'un `granted_skill_choice` en `from: "any"` publiait les
     26 compétences du catalogue — l'Araag était son seul témoin d'espèce.
     Eric a fait absorber ce don par `Fast Learner` (*« Fast Learner qui
     recouvre tout »*) parce que l'Araag en portait DEUX ; l'Humain a suivi
     avec `Skillful`. **Aucune espèce ne publie donc plus `species.skills`.**
     ⛔ Le mécanisme `from: "any"` n'est pas mort pour autant — les classes
     l'emploient — mais il n'a plus d'utilisateur côté espèce, et ce test
     l'affirme au lieu de le supposer. */
  const make = (speciesId, answer) => {
    const h = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN] });
    return { h, out: h.verbs.rebuild({ document: englishDocument(h, speciesId, answer) }) };
  };
  const araag = make("fh:species:en:araag");
  assert.equal(byPath(araag.out).has("species.skills"), false,
    "l'Araag n'ouvre plus aucun choix de compétence d'espèce");
  const humain = make("srd:species:en:human");
  assert.equal(byPath(humain.out).has("species.skills"), false,
    "l'Humain non plus — son Skillful donne des points, pas une maîtrise");

  /* LOT 34 — Keen Senses (l'Elestu) n'est plus un `species.skills` compté :
     c'est un `species.skillBudget` captif de 2 points, un groupe DISTINCT
     (contrat §4e). `species.skills` n'existe donc plus du tout pour lui —
     `granted_skill_choice` a été retiré au profit de `granted_skill_budget`. */
  const hElestu = makeHarness({ layers: [SRD_EN, FH_SPECIES_EN, FH_SKILLS_EN] });
  const docElestu = englishDocument(hElestu, "fh:species:en:elestu");
  docElestu.build.choices.push(
    { path: "species.skillBudget.survival", value: "novice" },
    { path: "species.skillBudget.vigilance", value: "novice" }
  );
  const outElestu = hElestu.verbs.rebuild({ document: docElestu });
  const decisionsElestu = byPath(outElestu);
  assert.equal(decisionsElestu.has("species.skills"), false,
    "l'Elestu ne porte plus de `granted_skill_choice` — aucun plan compté à ce chemin");
  const budgetPlan = decisionsElestu.get("species.skillBudget");
  assert.deepEqual(budgetPlan.options, ["delve", "survival", "vigilance"]);
  assert.equal(budgetPlan.expected, 2, "le budget capté est de 2 points (Eric, 2026-08-09)");
  assert.equal(budgetPlan.answered, 2, "½ + ½ = 2 points dépensés");
  assert.deepEqual(budgetPlan.selected, ["survival", "vigilance"]);
  assert.equal(budgetPlan.status, "answered");
  assert.equal(decisionsElestu.get("species.skillBudget.survival").status, "answered");
  assert.equal(decisionsElestu.get("species.skillBudget.vigilance").status, "answered");
});

test("choose / clear / rebuild pilotent aussi le `tool_choice` réel du Soldat", () => {
  const h = makeHarness();
  let doc = acceptanceDocument(h.layers);
  doc.build.choices = doc.build.choices.filter((choice) => choice.path !== "background" && choice.path !== "background.feat" &&
    !choice.path.startsWith("background.boost."));
  doc.build.choices.push({ path: "background", ref: { kind: "background", id: "srd:background:fr:soldat" } });
  let out = h.verbs.rebuild({ document: doc });
  let tool = byPath(out).get("background.tool");
  assert.equal(tool.status, "pending");
  assert.deepEqual(tool.options, ["srd:tool:fr:boite-de-jeux"]);

  h.verbs.choose({ path: "background.tool", ref: { kind: "tool", id: "srd:tool:fr:boite-de-jeux" } });
  out = h.verbs.rebuild({});
  assert.equal(byPath(out).get("background.tool").status, "answered");
  h.verbs.clear({ path: "background.tool", kind: "choice" });
  out = h.verbs.rebuild({});
  assert.equal(byPath(out).get("background.tool").status, "pending");
});

test("`validate` ne publie jamais le carnet de projection", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const verdict = h.verbs.validate({ document: out.document });
  assert.equal(Object.hasOwn(verdict, "decisions"), false);
  assert.deepEqual(Object.keys(verdict).sort(), ["ok", "violations", "warnings"]);
});

/* ══ LOT 74 — LA BORNE DE CRÉATION DES SCORES DE BASE : 3–18 ═════════════
   Tranchée par Eric le 2026-08-15 (« Choose yourself proposait 1 à 20 —
   la borne est 3 à 18 »). Ces tests sont le GARDE de la décision et de sa
   CONDITION — pas des commentaires : si le modèle de niveau ou le sens du
   choix de base bougent, c'est ici que ça rougit. */

test("LOT 74 — le carnet publie SEIZE valeurs, 3..18, et c'est la même liste que l'export public", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const plan = byPath(out).get("abilities.str");
  assert.ok(plan, "le plan `abilities.str` existe au carnet d'un document de création");
  /* LE SEUL endroit de la suite où la borne s'écrit en chiffres : partout
     ailleurs on compare à `CREATION_SCORES` — un seul écrivain. */
  assert.deepEqual([...plan.options], [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    "seize valeurs, de 3 à 18 — jamais 1..20");
  assert.equal(plan.options.length, 16);
  assert.equal(CREATION_SCORE_MIN, 3);
  assert.equal(CREATION_SCORE_MAX, 18);
  assert.deepEqual([...CREATION_SCORES], [...plan.options],
    "l'écran lit `CREATION_SCORES` : ce que le carnet oppose et ce que l'export publie sont LA MÊME liste");
  assert.equal(Object.isFrozen(CREATION_SCORES), true,
    "la liste publiée est gelée — la muter jette en ESM, personne ne la corrige en douce");
  assert.equal(plan.status, "answered", "le document d'acceptation (six scores dans la borne) ne porte aucun verrou");
});

test("LOT 74 — un score de base hors borne porte le verrou, dans les DEUX sens (2 et 20)", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  doc.build.choices = doc.build.choices.map((choice) =>
    choice.path === "abilities.str" ? { path: "abilities.str", value: 2 }
      : choice.path === "abilities.dex" ? { path: "abilities.dex", value: 20 }
        : choice);
  const out = h.verbs.rebuild({ document: doc });
  const decisions = byPath(out);

  const bas = decisions.get("abilities.str");
  assert.equal(bas.status, "locked", "2 est SOUS la borne : verrouillé");
  assert.equal(bas.lock.key, "abilities.score-out-of-creation-range");
  assert.deepEqual(bas.lock.params, { path: "abilities.str", value: 2, min: 3, max: 18 });

  const haut = decisions.get("abilities.dex");
  assert.equal(haut.status, "locked", "20 est AU-DESSUS de la borne : verrouillé");
  assert.equal(haut.lock.params.value, 20);

  /* Le libellé parle français et nomme la borne — même circuit que
     `background.boost-cap-exceeded` (labels.mjs). */
  assert.match(renderBuildViolation(bas.lock), /entre 3 et 18/);

  /* Et le verrou VOYAGE jusqu'à `validate()` — le fil du lot 37, prouvé
     pour cette clef, jamais supposé. */
  const verdict = h.verbs.validate({ document: out.document });
  const refus = verdict.violations.filter((v) => v.key === "abilities.score-out-of-creation-range");
  assert.equal(refus.length, 2, "deux scores hors borne → deux refus nommés, pas un silence");
  assert.equal(verdict.ok, false);
});

test("LOT 74 — la borne juge le CHOIX, jamais le résolu : base 18 + boost = 20, et c'est LÉGAL", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  /* Le document d'acceptation porte `background.boost.int = 2` : une base
     de 18 fait donc un score FINAL de 20 — exactement ce que la commande
     du lot interdit de casser (« si tu bornes le mauvais nombre, tu casses
     des personnages valides »). */
  h.verbs.set({ path: "abilities.int", value: 18 });
  const out = h.verbs.rebuild({});
  assert.equal(out.resolved.abilities.int.score, 20, "mesure : 18 de base + 2 de boost = 20 au résolu");
  const plan = byPath(out).get("abilities.int");
  assert.equal(plan.status, "answered", "la base 18 est DANS la borne — aucun verrou, boost ou pas");
  assert.deepEqual(plan.selected, [18]);
  const verdict = h.verbs.validate({ document: out.document });
  assert.equal(verdict.violations.some((v) => v.key === "abilities.score-out-of-creation-range"), false,
    "un final de 20 par boost ne déclenche JAMAIS la borne de création — elle ne lit pas `resolved`");
});

test("LOT 74 — le GARDE de la condition : la borne parle à la création, se tait au-delà du niveau 1", () => {
  const h = makeHarness();
  const query = (payload) => h.layers.verbs.query(payload);

  /* Niveau 5 posé : PLUS AUCUN plan `abilities.*` — « au-delà, le SRD
     reprend la main (plafond 20) » (Eric, 2026-08-13). Un str de 20 y est
     l'affaire du SRD, pas de cette borne. */
  const auNiveau5 = projectDecisions({
    query,
    choices: [{ path: "level", value: 5 }, { path: "abilities.str", value: 20 }]
  });
  assert.equal(auNiveau5.some((entry) => entry.path.startsWith("abilities.")), false,
    "niveau 5 : la borne de création a disparu du carnet, elle n'a pas seulement ravalé son verrou");

  /* Niveau ABSENT : un document sans `level` est un document en création —
     la borne y parle. */
  const sansNiveau = projectDecisions({
    query,
    choices: [{ path: "abilities.str", value: 25 }]
  });
  const plan = sansNiveau.find((entry) => entry.path === "abilities.str");
  assert.ok(plan, "sans niveau posé, le plan existe : la création est l'état par défaut");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "abilities.score-out-of-creation-range");

  /* Et les clefs jamais posées restent des plans EN ATTENTE, pas des
     fautes : un personnage en cours de répartition est valide (lot 37). */
  const attente = sansNiveau.find((entry) => entry.path === "abilities.dex");
  assert.equal(attente.status, "pending");
  assert.equal(attente.lock, undefined, "aucun verrou sur un score simplement pas encore posé");
});
