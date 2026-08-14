/* ══ LOT 43 — L'INHERITANCE, ET LES DEUX DÉFAUTS DE `multiPlan` ═══════
   Commande `43-inheritance-moteur`. Cette suite est l'ACCEPTATION du lot,
   test par test, dans l'ordre de son §4 :

     1. Sans record d'arrière-plan CHOISI, la pile FH publie quand même les
        deux plans (`background.boost`, `background.originFeat[0]`) — le
        repli à une option de `projectDecisions` (§1a/§0.1), le cœur du lot.
     2. Les six caractéristiques sont proposées quand `ability_keys` est
        absent (§1c), et un boost sur n'importe laquelle est légal.
     3. Les QUATRE ATTAQUES du §0.4 : chacune produit son refus NOMMÉ.
     4. `+2/+1` et `+1/+1/+1` restent légaux — un garde qui refuse le cas
        normal est pire que pas de garde.
     5. Les dons d'origine proposés sont CINQ, et le compte est DÉRIVÉ du
        contenu de la pile, jamais écrit en dur ici.
     6. Un personnage SRD pur garde son arrière-plan, son `feat_id` imposé et
        ses trois clefs de caractéristiques — condition de sortie n°6.
     7. `background.feat` ne produit plus rien — ni plan, ni refus.
     8. Le refus n'est plus émis deux fois pour un seul choix (§3e-bis), et
        le compte de créneaux suit `expected`, pas le nombre de réponses
        valides.
     9. Le document d'exemple se reconstruit : Destinée 10, pool 10.

   ⚠️ AUCUNE ÉCRITURE HORS MÉMOIRE : `tests/tree-immuable.test.mjs` rejoue
   toute la suite entre deux relevés de l'arbre. */

import test from "node:test";
import assert from "node:assert/strict";

import { makeHarness, manifestOf, SRD_EN, FH_FEATS_EN, acceptanceDocument } from "./build-harness.mjs";
import { ABILITY_KEYS } from "../src/build/skills.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

const FH_SKILLS_EN = "layers/fh-skills-en.layer.json";
const INHERITANCE = "fh:background:en:inheritance";

/** La pile Fate's Hand — SRD anglais, les compétences (l'Inheritance et le
 *  don d'origine libre) et les dons (`Auspicious (fh)`, `category: origin`). */
function pile(options = {}) {
  return makeHarness(Object.assign({ layers: [SRD_EN, FH_SKILLS_EN, FH_FEATS_EN] }, options));
}

/** Les choix communs à presque tous les scénarios : niveau, classe,
 *  caractéristiques neutres, bourse à zéro. `extra` porte tout ce que le
 *  scénario veut ajouter — le `background` n'y est JAMAIS par défaut : c'est
 *  précisément ce que ce lot teste. */
function baseChoices({ classId = "srd:class:en:wizard", extra = [] } = {}) {
  return [
    { path: "level", value: 1 },
    { path: "class", ref: { kind: "class", id: classId } },
    { path: "abilities.str", value: 10 },
    { path: "abilities.dex", value: 10 },
    { path: "abilities.con", value: 10 },
    { path: "abilities.int", value: 10 },
    { path: "abilities.wis", value: 10 },
    { path: "abilities.cha", value: 10 },
    { path: "currency.cp", value: 0 },
    { path: "currency.sp", value: 0 },
    { path: "currency.gp", value: 0 },
    { path: "currency.pp", value: 0 }
  ].concat(extra);
}

function documentDe(h, choices) {
  return {
    schema: "fh-char/1",
    id: "lot43-inheritance",
    name: "Inheritance",
    lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/inheritance-lot43", version: "1.0.0" },
    created: "2026-08-13T09:00:00Z",
    modified: "2026-08-13T09:00:00Z",
    build: { layers: manifestOf(h.layers), choices: structuredClone(choices), budgets: {}, overrides: [] }
  };
}

const byPath = (out) => new Map(out.decisions.map((entry) => [entry.path, entry]));

/* ══ 1 — SANS RECORD D'ARRIÈRE-PLAN, LES DEUX PLANS SE PUBLIENT QUAND MÊME ═
   C'est le cœur du lot (§0.1) : `fh:background:en:inheritance` est le SEUL
   record du genre sous cette pile — jamais choisi (§1a), et pourtant
   `background.boost` et `background.originFeat[0]` doivent apparaître. */

test("§4.1 — SANS `background` posé, la pile FH publie quand même `background.boost` et `background.originFeat[0]`", () => {
  const h = pile();
  const out = h.verbs.rebuild({ document: documentDe(h, baseChoices()) });
  const decisions = byPath(out);
  /* ⚠️ RENVERSÉ AU LOT 71, ET C'EST LE LOT 43 QUI L'AVAIT ANNONCÉ. Ce test
     exigeait `pending`, avec ce commentaire : « rien n'a changé là, et **ce
     n'est pas ce que ce lot répare** ». Le report était donc conscient. Il a
     fini par coûter, et à l'écran :

       · le repli résout le record → `background.boost` et
         `background.originFeat[0]` sortent « répondus » ;
       · `refPlan` l'ignorait → `background` restait `0/1` POUR TOUJOURS ;
       · Review, qui lit le carnet fidèlement, affichait « Inheritance :
         0 of 1 · done · done » — **la seule étape non faite de tout
         l'écran**, sur CHAQUE personnage de la pile FH.

     Eric, 2026-08-15 : *« inheritance ne se valide pas »*. Un plan qui
     réclame un choix que personne ne peut faire est un moteur qui ment.
     `resolvedRef` répond désormais à la question une seule fois, pour
     `refPlan` comme pour les sous-plans. La portée n'a pas bougé : un menu à
     plusieurs options ne se résout jamais tout seul (test suivant). */
  assert.equal(decisions.get("background").status, "answered");
  assert.equal(decisions.get("background").delivered, true,
    "et le plan DIT qu'il est livré, pas choisi — un écran doit pouvoir le distinguer (lot 43, « livrée, non choisie »)");
  assert.deepEqual(decisions.get("background").selected, [INHERITANCE]);
  assert.deepEqual(decisions.get("background").options, [INHERITANCE]);
  assert.ok(decisions.has("background.boost"), "le plan de boost existe, SANS record choisi");
  assert.ok(decisions.has("background.originFeat[0]"), "le plan de don d'origine existe, SANS record choisi");
  assert.equal(decisions.get("background.boost").provenance.id, INHERITANCE);
  assert.equal(decisions.get("background.originFeat[0]").provenance.id, INHERITANCE);
});

test("§4.1 (repli) — un menu à PLUSIEURS options ne se résout jamais tout seul", () => {
  /* Le repli à une option n'est PAS une manière de deviner : un personnage
     SRD pur (quatre arrière-plans disponibles) qui n'a rien choisi ne publie
     toujours aucun plan de boost — exactement le comportement d'avant ce lot. */
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  doc.build.choices = doc.build.choices.filter((choice) => choice.path !== "background");
  const out = h.verbs.rebuild({ document: doc });
  const decisions = byPath(out);
  assert.equal(decisions.has("background.boost"), false,
    "quatre options SRD, aucune choisie : pas de repli, pas de plan");
});

/* ══ 2 — LES SIX CARACS SONT PROPOSÉES, UN BOOST SUR N'IMPORTE LAQUELLE ═══ */

test("§4.2 — `ability_keys` absent : les SIX caractéristiques sont les options", () => {
  const h = pile();
  const out = h.verbs.rebuild({ document: documentDe(h, baseChoices()) });
  const plan = byPath(out).get("background.boost");
  assert.deepEqual(plan.options, [...ABILITY_KEYS].sort());
});

test("§4.2 — un boost est légal sur N'IMPORTE LAQUELLE des six, pas seulement con/int", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [
        { path: "background.boost.str", value: 2 },
        { path: "background.boost.cha", value: 1 }
      ]
    }))
  });
  const plan = byPath(out).get("background.boost");
  assert.equal(plan.status, "answered");
  assert.equal(plan.lock, undefined);
  assert.deepEqual(plan.selected, ["cha", "str"]);
});

/* ══ 3 — LES QUATRE ATTAQUES DU §0.4, UNE PAR LIGNE ═══════════════════════ */

test("§4.3 — ATTAQUE — `+3` sur une seule caractéristique : `background.boost-cap-exceeded`", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({ extra: [{ path: "background.boost.int", value: 3 }] }))
  });
  const plan = byPath(out).get("background.boost");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "background.boost-cap-exceeded");
  assert.equal(plan.lock.params.value, 3);
  assert.equal(plan.lock.params.cap, 2);
});

test("§4.3 — ATTAQUE — `+2/+2` (4 points) : `background.boost-total-mismatch`, plus taiseux", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [{ path: "background.boost.int", value: 2 }, { path: "background.boost.con", value: 2 }]
    }))
  });
  const plan = byPath(out).get("background.boost");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "background.boost-total-mismatch");
  assert.equal(plan.lock.params.total, 4);
  assert.equal(plan.lock.params.expected, 3);
  assert.equal(plan.answered, 4, "le plan VOIT le total — c'était §0.4, avant ce lot `validate()` se taisait");
});

test("§4.3 — ATTAQUE — `+9` sur une seule : `background.boost-cap-exceeded`, jamais un score de 19 qui passe", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({ extra: [{ path: "background.boost.int", value: 9 }] }))
  });
  const plan = byPath(out).get("background.boost");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "background.boost-cap-exceeded");
  assert.equal(plan.lock.params.value, 9);
});

test("§4.3 — ATTAQUE — un total de 2 : `background.boost-total-mismatch`", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({ extra: [{ path: "background.boost.int", value: 2 }] }))
  });
  const plan = byPath(out).get("background.boost");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "background.boost-total-mismatch");
  assert.equal(plan.lock.params.total, 2);
});

/* ══ 4 — +2/+1 ET +1/+1/+1 RESTENT LÉGAUX ═════════════════════════════════ */

test("§4.4 — `+2/+1` reste légal", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [{ path: "background.boost.int", value: 2 }, { path: "background.boost.con", value: 1 }]
    }))
  });
  const plan = byPath(out).get("background.boost");
  assert.equal(plan.status, "answered");
  assert.equal(plan.lock, undefined);
});

test("§4.4 — `+1/+1/+1` reste légal", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [
        { path: "background.boost.int", value: 1 },
        { path: "background.boost.con", value: 1 },
        { path: "background.boost.wis", value: 1 }
      ]
    }))
  });
  const plan = byPath(out).get("background.boost");
  assert.equal(plan.status, "answered");
  assert.equal(plan.lock, undefined);
});

/* ══ 5 — LES DONS D'ORIGINE PROPOSÉS SONT CINQ, DÉRIVÉS DU CONTENU ═══════ */

test("§4.5 — les dons d'origine proposés sont CINQ, comptés depuis la pile, jamais écrits en dur", () => {
  const h = pile();
  /* Le compte ATTENDU est lui-même DÉRIVÉ — jamais le littéral `5` : c'est le
     genre `feat` de la pile, filtré sur sa catégorie, comme le fait
     `decisions.mjs`. Un test qui écrirait `5` en dur ne prouverait que la
     mesure d'un jour donné (loi §0.5, prolongée à la suite). */
  const attendu = h.layers.verbs.query({ kind: "feat" })
    .filter((view) => view.record.data && view.record.data.category === "origin")
    .map((view) => view.id).sort();
  assert.equal(attendu.length, 5, "sonde : quatre du SRD + Auspicious (fh)");
  assert.ok(attendu.includes("fh:feat:en:auspicious"), "Auspicious (fh) — category patchée §3b");

  const out = h.verbs.rebuild({ document: documentDe(h, baseChoices()) });
  const plan = byPath(out).get("background.originFeat[0]");
  assert.deepEqual(plan.options, attendu);
});

test("§4.5 — choisir Auspicious (fh) comme don d'origine est légal, offert, pas imposé", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [{ path: "background.originFeat[0]", ref: { kind: "feat", id: "fh:feat:en:auspicious" } }]
    }))
  });
  const plan = byPath(out).get("background.originFeat[0]");
  assert.equal(plan.status, "answered");
  assert.equal(plan.provenance.mode, "offered");
  assert.deepEqual(plan.selected, ["fh:feat:en:auspicious"]);
});

test("§4.5 — REJET — un don hors catégorie `origin` (une compétence de combat) est `decision.option-unavailable`", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      /* `fighting-style` au SRD — la couche en porte au moins un, mesuré au
         §0.3 de la commande (4 `fighting-style`). On en prend un au hasard
         de la pile réelle plutôt que d'en écrire l'id en dur. */
      extra: [{ path: "background.originFeat[0]", ref: { kind: "feat", id: unDonHorsOrigin(h) } }]
    }))
  });
  const plan = byPath(out).get("background.originFeat[0]");
  assert.equal(plan.status, "locked");
  assert.equal(plan.lock.key, "decision.option-unavailable");
});

function unDonHorsOrigin(h) {
  const view = h.layers.verbs.query({ kind: "feat" })
    .find((entry) => entry.record.data && entry.record.data.category && entry.record.data.category !== "origin");
  assert.ok(view, "sonde : la pile porte au moins un don hors catégorie `origin`");
  return view.id;
}

/* ══ 6 — UN PERSONNAGE SRD PUR NE PERD RIEN — CONDITION DE SORTIE N°6 ═════ */

test("§4.6 — un personnage SRD pur garde son arrière-plan, son `feat_id` imposé et ses trois clefs de caracs", () => {
  const h = makeHarness({ layers: [SRD_EN] }); // aucune couche FH : les quatre du SRD sont intacts
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [{ path: "background", ref: { kind: "background", id: "srd:background:en:acolyte" } }]
    }))
  });
  const decisions = byPath(out);

  const boost = decisions.get("background.boost");
  assert.deepEqual(boost.options, ["cha", "int", "wis"], "l'Acolyte NOMME ses trois clefs — elles restent la loi");

  const feat = decisions.get("background.originFeat[0]");
  assert.deepEqual(feat.options, ["srd:feat:en:magic-initiate"], "le don imposé est le SEUL option publiée");
  assert.deepEqual(feat.selected, ["srd:feat:en:magic-initiate"], "et il est ANNONCÉ answered, sans qu'un choix l'ait posé");
  assert.equal(feat.expected, 1);
  assert.equal(feat.answered, 1);
  assert.equal(feat.provenance.mode, "required");
  assert.equal(feat.provenance.field, "feat_id");
});

/* ══ 7 — `background.feat` NE PRODUIT PLUS RIEN, NULLE PART ═══════════════ */

test("§4.7 — `background.feat` ne produit plus rien : ni plan, ni refus", () => {
  const h = pile();
  const out = h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      extra: [{ path: "background.feat", ref: { kind: "feat", id: "fh:feat:en:auspicious" } }]
    }))
  });
  const decisions = byPath(out);
  assert.equal(decisions.has("background.feat"), false, "aucun plan n'est projeté à ce chemin");

  const verdict = h.verbs.validate({ document: out.document });
  assert.equal(verdict.violations.some((v) => v.key === "background.feat-mismatch"), false,
    "la clef n'existe plus — elle ne peut donc plus être rendue");
  assert.equal(verdict.violations.some((v) => typeof v.path === "string" && v.path === "background.feat"), false);
  /* Et le choix reste UNCONSUMED : personne ne le lit, donc `derive` ne
     prétend jamais l'avoir appliqué. */
  assert.equal(out.unconsumed.includes("background.feat"), true);
});

/* ══ 8 — LES DEUX DÉFAUTS DE `multiPlan` (§3e-bis) ═════════════════════════
   Rejoué EXACTEMENT sur la mesure de la commande : `class = rogue`,
   `class.skills[0] = arcana` (invalide pour le Rogue), `class.skills[1] =
   investigation` (valide), `skill_choice.count = 4`. */

function rogueMesure(h) {
  return h.verbs.rebuild({
    document: documentDe(h, baseChoices({
      classId: "srd:class:en:rogue",
      extra: [
        { path: "class.skills[0]", value: "arcana" },
        { path: "class.skills[1]", value: "investigation" }
      ]
    }))
  });
}

test("§4.8 — une classe plus étroite succède à une plus large : EXACTEMENT `expected` créneaux, pas un de plus", () => {
  const h = pile();
  const out = rogueMesure(h);
  const decisions = byPath(out);
  const creneaux = [...decisions.keys()].filter((path) => /^class\.skills\[[0-9]+\]$/.test(path));
  assert.equal(decisions.get("class.skills").expected, 4);
  assert.equal(creneaux.length, 4, "AVANT ce lot : cinq créneaux pour `expected: 4` (§0, mesuré)");
  assert.deepEqual(creneaux.sort(), ["class.skills[0]", "class.skills[1]", "class.skills[2]", "class.skills[3]"]);
});

test("§4.8 — un choix devenu illégal produit UN refus, pas deux — et aucun créneau valide ne le porte", () => {
  const h = pile();
  const out = rogueMesure(h);
  const decisions = byPath(out);

  assert.equal(decisions.get("class.skills[0]").status, "locked", "le créneau fautif (arcana) EST locked");
  assert.equal(decisions.get("class.skills[0]").lock.key, "decision.option-unavailable");
  assert.equal(decisions.get("class.skills[1]").status, "answered", "investigation reste valide — aucun refus emprunté");
  assert.equal(decisions.get("class.skills").status, "locked", "le groupe entier se montre locked, pas pending");

  /* LA MESURE QUI COMPTE : `validate()` ne publie ce refus qu'UNE FOIS. */
  const verdict = h.verbs.validate({ document: out.document });
  const memes = verdict.violations.filter((v) =>
    v.key === "decision.option-unavailable" && v.params && v.params.selected === "arcana");
  assert.equal(memes.length, 1, "AVANT ce lot : le même refus deux fois (le groupe, puis le créneau)");
});

/* ══ 9 — LE DOCUMENT D'EXEMPLE : DESTINÉE 10, POOL 10 ═════════════════════ */

test("§4.9 — le document d'exemple (FH, anglais) se reconstruit : Destinée 10, pool 10", () => {
  const { document } = exempleFhEn();
  const destiny = document.resolved.stats.find((s) => s.id === "fh:destiny");
  const pool = document.resolved.stats.find((s) => s.id === "fh:skill-points");
  assert.equal(destiny.value, 10, "mesuré avant migration (§0.5) — inchangé par le retrait du choix `background`");
  assert.equal(pool.value, 10);
  /* Et le `ref` mort qui faisait JETER `rebuild` (§0.5) est bien parti : la
     migration a RETIRÉ le choix, elle ne l'a pas remplacé. */
  assert.equal(document.build.choices.some((choice) => choice.path === "background"), false);
  assert.ok(document.build.choices.some((choice) => choice.path === "background.originFeat[0]"));
});
