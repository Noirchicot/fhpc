/* ══ LOT 372 — LES CHOIX DE LA NUIT PRENNENT LEURS EFFETS SUR LA FICHE ══════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 372 effets des choix.md` (ARCHI 35, 30/09).
   Divine Order, Primal Order, Fighting Style et les maîtrises de Skilled s'écrivaient et se
   montraient (lots 360, 364) ; la fiche n'en appliquait rien. ARCHI 35, les trois réponses :
   Q1 → a) `resolved.training { armor[], weapons[] }` (le training de la classe, puis les choix) ;
   Q2 → a) les lignées au lot 373 ; Q3 → a) un effet de table est LU en posant le trait.

   ⭐ CHAQUE GARDE LIT LA COUCHE, JAMAIS UN NOM : elle boucle sur les déclarations
   (`data.feature_choices`, leurs options, les dons de la catégorie déclarée) et exige l'effet
   que la DONNÉE déclare. Une option déclarée demain est gardée sans une ligne de plus ici.
   · E1 — la déclaration ne dit rien que son texte ne dise (les extraits, relus) ;
   · E2 — le training : la classe, puis ce que l'option ajoute ;
   · E3 — le bonus de compétence, avec sa provenance ;
   · E4 — le cantrip en plus : sa porte, dans la porte de la capacité ;
   · E5 — le bonus de CA d'un don de style, en armure seulement ;
   · E6 — plus rien sous « Recorded, but no rule reads them » : chaque réponse est un trait ;
   · E7 — Skilled : les maîtrises choisies ;
   · E8 — la fiche montre « Armor · Weapons ». */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, PILE_SRD } from "./build-harness.mjs";

globalThis.document = createTestDocument();
const { PILE } = await import("../src/tools/exemple-fh-en.mjs");
const { renderClassChoices, classPalier2 } = await import("../ui/builder/class-step.mjs");
const { renderFicheTemporaire } = await import("../ui/builder/fiche-temporaire.mjs");

const PILES = { SRD: makeHarness({ layers: PILE_SRD }), FH: makeHarness({ layers: PILE }) };
const H = PILES.SRD;
const q = (h) => h.layers.verbs.query;
const SCORES = ["str", "dex", "con", "int", "wis", "cha"].map((k, i) => ({ path: `abilities.${k}`, value: [15, 14, 13, 12, 16, 8][i] }));
const doc = (h, choices) => ({
  schema: "fh-char/1", id: "effets-372", name: "Effets 372", lang: "en", units: { distance: "ft", weight: "lb" },
  created: "2026-09-30T00:00:00Z", modified: "2026-09-30T00:00:00Z",
  build: { layers: manifestOf(h.layers), choices: [{ path: "level", value: 1 }, ...SCORES, ...choices], budgets: {}, overrides: [], confirmed: [] }
});
const rebuild = (h, choices) => h.verbs.rebuild({ document: doc(h, choices) });
const plans = (h, choices) => h.verbs.decisions({ document: doc(h, choices) }).decisions || [];
const classe = (id) => ({ path: "class", ref: { kind: "class", id } });
const texteDe = (noeud) => (noeud ? noeud.textContent : "");
const modDe = (score) => Math.floor((score - 10) / 2);

/** Toutes les capacités déclarées, par la donnée : [{classView, declaration}]. */
function capacites(h) {
  return q(h)({ kind: "class" }).flatMap((classView) =>
    (classView.record.data.feature_choices || []).map((declaration) => ({ classView, declaration })));
}
/** Les options-valeurs déclarées : [{classView, declaration, option}]. */
function optionsValeurs(h) {
  return capacites(h).flatMap(({ classView, declaration }) =>
    (declaration.options || []).map((option) => ({ classView, declaration, option })));
}
/** La réponse qui pose une option-valeur. */
const repondre = (declaration, option) => ({ path: `class.${declaration.id}[0]`, value: option.id });

test("E1 — 📜 LA DÉCLARATION NE DIT RIEN QUE SON TEXTE NE DISE : chaque extrait se relit, chaque cible existe", () => {
  let vus = 0;
  for (const { option } of optionsValeurs(H)) {
    for (const champ of ["armor_training", "weapon_proficiencies"]) {
      if (option[champ] === undefined) continue;
      vus += 1;
      assert.ok(option.text.includes(option[champ]), `${option.id}.${champ} « ${option[champ]} » n'est pas dans son texte`);
    }
    for (const champ of ["extra_cantrips", "check_bonus"]) {
      if (option[champ] === undefined) continue;
      vus += 1;
      assert.ok(option.text.includes(option[champ].extrait), `${option.id}.${champ} : extrait absent du texte`);
    }
    if (option.extra_cantrips) assert.ok(q(H)({ kind: "class", id: option.extra_cantrips.list }), "la liste nommée est une classe");
    if (option.check_bonus) {
      for (const id of option.check_bonus.skills) assert.ok(q(H)({ kind: "skill", id }), `« ${id} » est une compétence`);
      assert.ok(["str", "dex", "con", "int", "wis", "cha"].includes(option.check_bonus.ability));
    }
  }
  for (const feat of q(H)({ kind: "feat" }).filter((v) => v.record.data.armor_class_bonus)) {
    vus += 1;
    assert.ok(feat.record.data.description.includes(feat.record.data.armor_class_bonus.extrait), `${feat.id} : extrait absent`);
  }
  assert.ok(vus >= 9, `témoin : les déclarations sont lues (${vus})`);
});

test("E2 — 🛡️ LE TRAINING : celui de la CLASSE, tel que la source l'écrit, puis ce que l'option ajoute — dans les deux piles", () => {
  for (const [nom, h] of Object.entries(PILES)) {
    for (const classView of q(h)({ kind: "class" })) {
      const r = rebuild(h, [classe(classView.id)]).resolved;
      const d = classView.record.data;
      assert.deepEqual(r.training.armor.filter((e) => e.id === "class").map((e) => e.text), [d.armor_training],
        `${nom} ${classView.id} : l'armure de la classe, mot pour mot`);
      assert.deepEqual(r.training.weapons.filter((e) => e.id === "class").map((e) => e.text), [d.weapon_proficiencies]);
    }
    let options = 0;
    for (const { classView, declaration, option } of optionsValeurs(h).filter((o) => o.option.armor_training || o.option.weapon_proficiencies)) {
      options += 1;
      const r = rebuild(h, [classe(classView.id), repondre(declaration, option)]).resolved;
      const id = `${declaration.id}:${option.id}`;
      const source = `${declaration.name}: ${option.name}`;
      if (option.armor_training) assert.deepEqual(r.training.armor.find((e) => e.id === id), { id, text: option.armor_training, source });
      if (option.weapon_proficiencies) assert.deepEqual(r.training.weapons.find((e) => e.id === id), { id, text: option.weapon_proficiencies, source });
    }
    assert.ok(options >= 2, `${nom} : témoin — Protector et Warden sont lus (${options})`);
  }
});

test("E3 — 🎓 LE BONUS DE COMPÉTENCE : la caractéristique, son plancher, et sa provenance sous le chiffre", () => {
  let vus = 0;
  for (const { classView, declaration, option } of optionsValeurs(H).filter((o) => o.option.check_bonus)) {
    const cb = option.check_bonus;
    const sans = rebuild(H, [classe(classView.id)]).resolved;
    const avec = rebuild(H, [classe(classView.id), repondre(declaration, option)]).resolved;
    const score = SCORES.find((s) => s.path === `abilities.${cb.ability}`).value;
    const attendu = Math.max(cb.minimum, modDe(score));
    for (const skillId of cb.skills) {
      const slug = q(H)({ kind: "skill", id: skillId }).record.slug || skillId.split(":").pop();
      const avant = sans.skills.find((s) => s.id === slug).bonus;
      assert.equal(avec.skills.find((s) => s.id === slug).bonus, avant + attendu, `${option.id} → ${slug}`);
      const note = avec.effects.applied.find((a) => a.path === `resolved.skills[${slug}].bonus`);
      assert.ok(note && note.object === `${declaration.name}: ${option.name}` && note.value === attendu, `${slug} : la provenance`);
      vus += 1;
    }
  }
  assert.ok(vus >= 4, `témoin : Thaumaturge et Magician, deux compétences chacun (${vus})`);
  /* ⚔️ Le plancher : une Sagesse à 8 (−1) donne quand même +1. */
  const { classView, declaration, option } = optionsValeurs(H).find((o) => o.option.check_bonus);
  const basse = SCORES.map((s) => (s.path === `abilities.${option.check_bonus.ability}` ? { ...s, value: 8 } : s));
  const d = doc(H, [classe(classView.id), repondre(declaration, option)]);
  d.build.choices = [{ path: "level", value: 1 }, ...basse, classe(classView.id), repondre(declaration, option)];
  const r = H.verbs.rebuild({ document: d }).resolved;
  const note = r.effects.applied.find((a) => a.object === `${declaration.name}: ${option.name}`);
  assert.equal(note.value, option.check_bonus.minimum, "le plancher de la déclaration tient");
});

test("E4 — ✨ LE CANTRIP EN PLUS A SA PORTE, DANS LA PORTE DE LA CAPACITÉ — et elle retient le `Done`", () => {
  let vus = 0;
  for (const [nom, h] of Object.entries(PILES)) {
    for (const { classView, declaration, option } of optionsValeurs(h).filter((o) => o.option.extra_cantrips)) {
      vus += 1;
      const g = option.extra_cantrips;
      const liste = q(h)({ kind: "class", id: g.list }).record.name;
      const base = [classe(classView.id), repondre(declaration, option)];
      const chemin = `class.${declaration.id}[0].cantrips`;
      const p = plans(h, base).find((x) => x.path === chemin);
      assert.ok(p, `${nom} ${option.id} : le plan ${chemin} est publié`);
      assert.equal(p.expected, g.count);
      const attendus = q(h)({ kind: "spell" }).filter((v) => (v.record.data.classes || []).includes(liste) && v.record.data.level === 0).map((v) => v.id).sort();
      assert.deepEqual([...p.options].sort(), attendus, "les options : les cantrips de la liste nommée, rien d'autre");
      assert.ok(p.provenance.field.startsWith("feature_choices."), "rangé avec les choix de capacité");
      /* ⛔ il retient le Done de l'étape (classPalier2 lit la provenance), puis le libère. */
      const avant = plans(h, base);
      assert.equal(classPalier2(avant).ready, false, `${nom} : sans son cantrip, la porte n'est pas prête`);
      const cantrip = { path: `${chemin}[0]`, ref: { kind: "spell", id: attendus[0] } };
      const apres = plans(h, [...base, cantrip]);
      assert.equal(apres.find((x) => x.path === chemin).answered, g.count);
      /* Le sous-choix (un ref) ne compte pas comme une réponse à la capacité (des valeurs). */
      assert.equal(apres.find((x) => x.path === `class.${declaration.id}`).answered, 1, "une réponse, pas deux");
      /* La porte : le même organe, les mots ratifiés. */
      const ctx = { decisions: apres, query: q(h), path: "class", kind: "class", label: "class", cursor: 0 };
      const porte = texteDe(renderClassChoices(ctx, () => {}, `class.${declaration.id}`));
      assert.ok(porte.includes(declaration.name) && porte.includes("Cantrip"), `${nom} : la porte porte le cantrip`);
      /* La fiche : le sort choisi entre dans l'incantation. */
      const r = rebuild(h, [...base, cantrip]);
      assert.ok(r.resolved.spellcasting.spells.some((s) => s.name === q(h)({ kind: "spell", id: attendus[0] }).record.name));
      assert.ok(!r.unconsumed.includes(cantrip.path));
      /* ⚔️ Une option changée : le cantrip qui traîne est JUGÉ, pas gardé en silence. */
      const autre = declaration.options.find((o) => o.id !== option.id);
      const traine = plans(h, [classe(classView.id), repondre(declaration, autre), cantrip]).find((x) => x.path === `${chemin}[0]`);
      assert.equal(traine && traine.lock && traine.lock.key, "decision.option-unavailable", `${nom} : le cantrip orphelin se nomme`);
    }
  }
  assert.ok(vus >= 4, `témoin : Thaumaturge et Magician, dans les deux piles (${vus})`);
});

test("E5 — 🛡️ LE BONUS DE CA D'UN DON DE STYLE : en armure, noté ; sans armure, il dort", () => {
  const armure = q(H)({ kind: "armor" }).find((v) => Number.isInteger(v.record.data.ac_base) && v.record.data.ac_dex_cap === 0);
  const porte = [{ path: "gear[0]", ref: { kind: "armor", id: armure.id } }, { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: true }];
  let vus = 0;
  for (const { classView, declaration } of capacites(H).filter((c) => c.declaration.options_from)) {
    const src = declaration.options_from;
    for (const feat of q(H)({ kind: src.kind }).filter((v) => v.record.data.category === src.category && v.record.data.armor_class_bonus)) {
      vus += 1;
      const b = feat.record.data.armor_class_bonus;
      const reponse = { path: `class.${declaration.id}[0]`, ref: { kind: src.kind, id: feat.id } };
      const base = rebuild(H, [classe(classView.id), ...porte]).resolved.ac;
      const avec = rebuild(H, [classe(classView.id), reponse, ...porte]).resolved;
      assert.equal(avec.ac, base + b.value, `${feat.id} en armure`);
      assert.ok(avec.effects.applied.some((a) => a.path === "resolved.ac" && a.object === feat.record.name && a.value === b.value));
      const nu = rebuild(H, [classe(classView.id)]).resolved.ac;
      assert.equal(rebuild(H, [classe(classView.id), reponse]).resolved.ac, nu, `${feat.id} sans armure : rien`);
    }
  }
  assert.ok(vus >= 1, `témoin : Defense (${vus})`);
});

test("E6 — 📋 PLUS RIEN SOUS « Recorded, but no rule reads them » : chaque réponse est un trait nommé, avec son texte", () => {
  for (const [nom, h] of Object.entries(PILES)) {
    let vus = 0;
    for (const { classView, declaration } of capacites(h)) {
      const reponses = declaration.options_from
        ? q(h)({ kind: declaration.options_from.kind }).filter((v) => v.record.data.category === declaration.options_from.category)
          .map((v) => ({ choix: { path: `class.${declaration.id}[0]`, ref: { kind: v.record.kind || declaration.options_from.kind, id: v.id } }, nom: v.record.name, cat: "feat" }))
        : declaration.options.map((o) => ({ choix: repondre(declaration, o), nom: `${declaration.name}: ${o.name}`, cat: "class-feature" }));
      for (const { choix, nom: attendu, cat } of reponses) {
        vus += 1;
        const out = rebuild(h, [classe(classView.id), choix]);
        assert.ok(!out.unconsumed.includes(choix.path), `${nom} ${choix.path} → ${attendu} reste non lu`);
        const trait = out.resolved.traits.find((t) => t.name === attendu);
        assert.ok(trait && trait.category === cat && typeof trait.text === "string" && trait.text.length > 0, `${nom} : le trait « ${attendu} »`);
      }
    }
    assert.ok(vus >= 8, `${nom} : témoin — 2 + 2 options et 4 dons de style (${vus})`);
  }
});

test("E7 — 🧰 SKILLED : les maîtrises choisies — la compétence maîtrisée, l'outil possédé, le don en trait", () => {
  const skilled = q(H)({ kind: "feat" }).find((v) => v.record.data.proficiency_choice && v.record.data.proficiency_choice.count > 0);
  const choix = [classe("srd:class:en:fighter"), { path: "species", ref: { kind: "species", id: "srd:species:en:human" } },
    { path: "species.originFeat[0]", ref: { kind: "feat", id: skilled.id } }];
  const p = plans(H, choix).find((x) => x.path === "species.originFeat[0].proficiencies");
  const skill = p.options.find((id) => id.includes(":skill:"));
  const tool = p.options.find((id) => id.includes(":tool:"));
  const reps = [{ path: "species.originFeat[0].proficiencies[0]", ref: { kind: "skill", id: skill } },
    { path: "species.originFeat[0].proficiencies[1]", ref: { kind: "tool", id: tool } }];
  const out = rebuild(H, [...choix, ...reps]);
  for (const r of reps) assert.ok(!out.unconsumed.includes(r.path), `${r.path} est lu`);
  assert.ok(!out.unconsumed.includes("species.originFeat[0]"), "le don lui-même est lu");
  const slug = q(H)({ kind: "skill", id: skill }).record.slug;
  assert.equal(out.resolved.skills.find((s) => s.id === slug).proficiency, "adept", "la compétence est maîtrisée");
  assert.ok(out.resolved.tools.some((t) => t.id === q(H)({ kind: "tool", id: tool }).record.slug), "l'outil entre avec les outils");
  assert.ok(out.resolved.traits.some((t) => t.id === skilled.id && t.category === "feat"), "le don en trait");
});

test("E8 — 🧾 LA FICHE MONTRE « Armor · Weapons » : une ligne par entrée, le texte du moteur, sa source dessous", () => {
  const { classView, declaration, option } = optionsValeurs(H).find((o) => o.option.armor_training);
  const out = rebuild(H, [classe(classView.id), repondre(declaration, option)]);
  const fiche = renderFicheTemporaire({ resolved: out.resolved, report: out, flags: [] });
  const bloc = fiche.querySelectorAll("[data-rubrique]").find((n) => n.dataset.rubrique === "training");
  assert.ok(bloc, "la rubrique `training` est peinte");
  const t = bloc.textContent;
  assert.ok(t.includes("Armor · Weapons"), "son titre");
  for (const e of [...out.resolved.training.armor, ...out.resolved.training.weapons]) {
    assert.ok(t.includes(e.text) && t.includes(e.source), `« ${e.text} » et « ${e.source} »`);
  }
});
