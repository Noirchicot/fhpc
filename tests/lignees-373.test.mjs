/* ══ LOT 373 — LES LIGNÉES PRENNENT LEURS EFFETS, ET « UNE VALEUR PARMI N » A SA PORTE ═══
   Mandat : vault `FH-WEB/FHPC/FHPC lot 373 lignees.md` (ARCHI 35, 30/09). Depuis le lot 360,
   le joueur choisissait sa lignée et la fiche n'en appliquait rien ; la caractéristique
   d'incantation (Elf, Gnome/Hoddon, Tiefling, Magic Initiate) et la taille (Human, Tiefling)
   n'avaient pas de porte. ARCHI 35 : Q1 → a) `resolved.spellSources[]` (une source par
   lignée ou don, SA caractéristique, SON DD, SON attaque) ; Q2 → a) The Mole People déclare
   `granted_skill_budget`, la forme de Keen Senses.

   ⭐ CHAQUE GARDE LIT LA COUCHE, JAMAIS UN NOM : elle boucle sur les espèces montées, leurs
   options de lignée et leurs déclarations (`lineage_effects`, `spellcasting_ability_choice`,
   `size_choice`, `lineage_damage`, `species_cantrips`), dans LES DEUX piles. Une lignée
   déclarée demain est gardée sans une ligne de plus ici.
   · L1 — la déclaration ne dit rien que son texte ne dise (extraits, chiffres, sorts) ;
   · L2 — la porte de la caractéristique s'ouvre SOUS une lignée qui fait lancer, et seulement là ;
   · L3 — `derive` applique chaque effet déclaré : trait nommé, vitesse, vision, sorts, dégâts ;
   · L4 — la taille : sa porte, et la fiche la lit ;
   · L5 — Magic Initiate : sa caractéristique, ses sorts hors du bloc de classe, ses deux détenteurs ;
   · L6 — The Mole People : la bourse captive d'un outil, au palier posé ;
   · L7 — l'écran : la porte de lignée porte la sous-porte et retient `Done`, la taille a son
     organe, la fiche montre les sources ;
   · L8 — aucun nom de lignée ni d'espèce dans le code du lot. */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createTestDocument } from "./dom-stub.mjs";
import { ROOT, makeHarness, manifestOf, PILE_SRD } from "./build-harness.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();
const { PILE } = await import("../src/tools/exemple-fh-en.mjs");
const { SPECIES_CATALOGUE } = await import("../ui/builder/species-step.mjs");
const { itemRepondu, itemsDeLEtape } = await import("../ui/builder/parcours.mjs");
const { renderFicheTemporaire } = await import("../ui/builder/fiche-temporaire.mjs");
const { featSousLabel } = await import("../ui/builder/inheritance-step.mjs");
const { renderCaracteristiqueGlisse, NOMS_DE_CARAC } = await import("../ui/builder/caracteristique-glisse.mjs");

const PILES = { SRD: makeHarness({ layers: PILE_SRD }), FH: makeHarness({ layers: PILE }) };
const q = (h) => h.layers.verbs.query;
const SCORES = ["str", "dex", "con", "int", "wis", "cha"].map((k, i) => ({ path: `abilities.${k}`, value: [15, 14, 13, 12, 10, 16][i] }));
const modDe = (score) => Math.floor((score - 10) / 2);
const scoreDe = (cle) => SCORES.find((s) => s.path === `abilities.${cle}`).value;
const doc = (h, choices) => ({
  schema: "fh-char/1", id: "lignees-373", name: "Lignées 373", lang: "en", units: { distance: "ft", weight: "lb" },
  created: "2026-09-30T00:00:00Z", modified: "2026-09-30T00:00:00Z",
  build: { layers: manifestOf(h.layers), choices: [{ path: "level", value: 1 }, ...SCORES, ...choices], budgets: {}, overrides: [], confirmed: [] }
});
const rebuild = (h, choices) => h.verbs.rebuild({ document: doc(h, choices) });
const plans = (h, choices) => h.verbs.decisions({ document: doc(h, choices) }).decisions || [];
const FIGHTER = { path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } };
const espece = (id) => ({ path: "species", ref: { kind: "species", id } });
const texteDe = (noeud) => (noeud ? noeud.textContent : "");
const apostrophes = (s) => String(s).toLowerCase().replace(/[’']/g, "'");

/** Toutes les chaînes d'une donnée — hors déclarations et hors champs typés du lot (un extrait
 *  ne se prouve pas par lui-même). */
const CHAMPS_TYPES = new Set(["lineage_effects", "spellcasting_ability_choice", "size_choice", "lineage_damage", "species_cantrips"]);
function textes(data) {
  const out = [];
  const walk = (v) => { if (typeof v === "string") out.push(v); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
  for (const [k, v] of Object.entries(data || {})) if (!CHAMPS_TYPES.has(k) && !k.startsWith("choix_du_texte:")) walk(v);
  return out.join("\n");
}
/** Les espèces à lignée d'une pile, avec leurs options. */
function lignees(h) {
  const out = [];
  for (const vue of q(h)({ kind: "species" })) {
    const data = vue.record.data || {};
    for (const option of Array.isArray(data.lineages) ? data.lineages : []) out.push({ vue, data, option, effets: (data.lineage_effects || {})[option.id] || {} });
  }
  return out;
}
const sortsDe = (effets) => [...(effets.cantrips || []), ...(effets.spells || [])];

test("L1 — 📜 LA DÉCLARATION NE DIT RIEN QUE SON TEXTE NE DISE : extraits, chiffres, sorts — dans les deux piles", () => {
  let vus = 0;
  for (const [nom, h] of Object.entries(PILES)) {
    for (const { vue, data, option, effets } of lignees(h)) {
      const texte = option.levels && option.levels["1"];
      for (const [champ, valeur] of Object.entries(effets)) {
        const liste = Array.isArray(valeur) ? valeur : [valeur];
        for (const e of liste) {
          vus += 1;
          assert.equal(typeof texte, "string", `${nom} ${vue.id} ${option.id} : un effet sans texte de niveau 1 à relire`);
          assert.ok(texte.includes(e.extrait), `${nom} ${vue.id} ${option.id}.${champ} : « ${e.extrait} » n'est pas dans son texte`);
          if (champ === "darkvision") assert.ok(e.extrait.includes(`${e.range_ft} feet`), `${option.id} : ${e.range_ft} n'est pas le chiffre du texte`);
          if (champ === "speed") assert.ok(e.extrait.includes(`${e.walk_ft} feet`), `${option.id} : ${e.walk_ft} n'est pas le chiffre du texte`);
          if (champ === "cantrips" || champ === "spells") {
            const sort = q(h)({ kind: "spell", id: e.id });
            assert.ok(sort, `${nom} ${option.id} : le sort ${e.id} est dans la pile`);
            assert.ok(e.extrait.includes(sort.record.name), `${option.id} : « ${sort.record.name} » est le sort de la phrase`);
            assert.equal(sort.record.data.level, champ === "cantrips" ? 0 : 1, `${e.id} : un cantrip est de niveau 0, un sort de lignée du niveau 1 est de niveau 1`);
          }
          if (champ === "granted_skill_budget") {
            assert.ok(e.extrait.includes(`${e.points} skill point`), `${option.id} : ${e.points} point(s), comme le texte`);
            for (const id of e.from) {
              const outil = q(h)({ kind: "tool", id }) || q(h)({ kind: "skill", id });
              assert.ok(outil && apostrophes(e.extrait).includes(apostrophes(outil.record.name)), `${option.id} : « ${id} » est nommé par la phrase`);
            }
          }
        }
      }
    }
    for (const vue of q(h)({ kind: "species" })) {
      const data = vue.record.data || {};
      const tout = textes(data);
      const decl = [data.spellcasting_ability_choice, data.size_choice, data.lineage_damage, ...(data.size_choice ? data.size_choice.options : []), ...(data.species_cantrips || [])];
      for (const d of decl.filter(Boolean)) {
        vus += 1;
        assert.ok(tout.includes(d.extrait), `${nom} ${vue.id} : « ${d.extrait} » n'est pas dans le texte de l'espèce`);
      }
      if (data.spellcasting_ability_choice) assert.deepEqual(data.spellcasting_ability_choice.from, ["int", "wis", "cha"], "« Intelligence, Wisdom, or Charisma »");
      if (data.lineage_damage) for (const id of data.lineage_damage.traits) assert.ok(data.traits.some((t) => t.id === id && tout.includes(t.name)), `${id} est un trait nommé par la phrase`);
      if (data.lineage_trait) assert.ok(data.traits.some((t) => t.id === data.lineage_trait), `${vue.id} : le trait de lignée existe`);
      for (const c of data.species_cantrips || []) {
        const trait = data.traits.find((t) => t.id === c.trait);
        assert.ok(trait && trait.text.includes(c.extrait), `${vue.id} : le cantrip vit dans le texte de son trait`);
      }
    }
    for (const feat of q(h)({ kind: "feat" }).filter((v) => v.record.data.spellcasting_ability_choice)) {
      vus += 1;
      assert.ok(feat.record.data.description.includes(feat.record.data.spellcasting_ability_choice.extrait), `${feat.id} : extrait absent`);
    }
  }
  assert.ok(vus >= 40, `témoin : les déclarations sont lues (${vus})`);
});

test("L2 — 🚪 LA CARACTÉRISTIQUE S'OUVRE SOUS UNE LIGNÉE QUI FAIT LANCER — et nulle part ailleurs", () => {
  let ouvertes = 0, fermees = 0;
  for (const [nom, h] of Object.entries(PILES)) {
    for (const { vue, data, option, effets } of lignees(h)) {
      const p = plans(h, [FIGHTER, espece(vue.id), { path: "species.lineage[0]", value: option.id }]);
      const carac = p.find((x) => x.path === "species.lineage[0].ability");
      const lance = sortsDe(effets).length + (data.species_cantrips || []).length > 0;
      if (data.spellcasting_ability_choice && lance) {
        ouvertes += 1;
        assert.ok(carac, `${nom} ${vue.id} ${option.id} : la porte de la caractéristique est publiée`);
        assert.deepEqual(carac.options, data.spellcasting_ability_choice.from);
        assert.equal(carac.expected, 1);
        assert.equal(itemRepondu(p, "species.lineage"), false, `${option.id} : la lignée ne signe pas sans sa caractéristique`);
        const rep = plans(h, [FIGHTER, espece(vue.id), { path: "species.lineage[0]", value: option.id }, { path: "species.lineage[0].ability[0]", value: "wis" }]);
        assert.equal(itemRepondu(rep, "species.lineage"), true, `${option.id} : répondue, elle signe`);
      } else {
        fermees += 1;
        assert.equal(carac, undefined, `${nom} ${vue.id} ${option.id} : aucune question sans sort à lancer`);
      }
      assert.ok(!p.find((x) => x.path === "species.lineage").lock, `${option.id} : la lignée n'est pas verrouillée par sa sous-porte`);
    }
  }
  assert.ok(ouvertes >= 12 && fermees >= 17, `témoin : ${ouvertes} ouvertes, ${fermees} fermées`);
  /* ⚔️ Une réponse qui traîne (la lignée changée pour une qui ne lance rien) se VERROUILLE. */
  const h = PILES.FH;
  const traine = plans(h, [FIGHTER, espece("srd:species:en:gnome"), { path: "species.lineage[0]", value: "mole-people" }, { path: "species.lineage[0].ability[0]", value: "int" }]);
  const plan = traine.find((x) => x.path === "species.lineage[0].ability");
  assert.ok(plan && plan.lock && plan.lock.key === "decision.option-unavailable", "la réponse orpheline est nommée");
});

test("L3 — 🧬 `derive` APPLIQUE CHAQUE EFFET DÉCLARÉ : trait, vitesse, vision, sorts à SA caractéristique, dégâts", () => {
  let vus = 0;
  for (const [nom, h] of Object.entries(PILES)) {
    for (const { vue, data, option, effets } of lignees(h)) {
      const lance = sortsDe(effets).length + (data.species_cantrips || []).length > 0;
      const choix = [FIGHTER, espece(vue.id), { path: "species.lineage[0]", value: option.id },
        ...(lance && data.spellcasting_ability_choice ? [{ path: "species.lineage[0].ability[0]", value: "cha" }] : [])];
      const out = rebuild(h, choix);
      const r = out.resolved;
      vus += 1;
      assert.ok(!out.unconsumed.includes("species.lineage[0]"), `${nom} ${option.id} : la réponse est lue`);
      const trait = data.lineage_trait ? data.traits.find((t) => t.id === data.lineage_trait) : null;
      if (trait) {
        const pose = r.traits.find((t) => t.id === trait.id);
        assert.equal(pose.name, `${trait.name}: ${option.name}`, `${option.id} : le trait se nomme par sa lignée`);
        if (option.levels && typeof option.levels["1"] === "string") assert.equal(pose.text, option.levels["1"], `${option.id} : son texte est le bénéfice de niveau 1`);
      }
      if (effets.speed) assert.equal(r.speeds.walk, effets.speed.walk_ft, `${option.id} : la vitesse`);
      else assert.equal(r.speeds.walk, data.speed_ft, `${option.id} : la vitesse de l'espèce, intacte`);
      if (effets.darkvision) {
        assert.equal(r.senses.find((s) => s.id === "darkvision").value, effets.darkvision.range_ft, `${option.id} : la vision`);
        assert.ok(r.effects.applied.some((a) => a.path === "resolved.senses[darkvision].value"), `${option.id} : sa provenance`);
      }
      const attendus = [...(data.species_cantrips || []), ...sortsDe(effets)].map((s) => q(h)({ kind: "spell", id: s.id }).record.slug).sort();
      if (attendus.length > 0) {
        const source = r.spellSources.find((s) => s.id === `species:${data.lineage_trait}`);
        assert.ok(source, `${nom} ${option.id} : la source de lignée est posée`);
        assert.equal(source.ability, "cha");
        assert.equal(source.dc, 8 + r.proficiency + modDe(scoreDe("cha")), `${option.id} : DD = 8 + maîtrise + Charisme`);
        assert.equal(source.attackBonus, r.proficiency + modDe(scoreDe("cha")));
        assert.deepEqual(source.spells.map((s) => s.id).sort(), attendus, `${option.id} : les sorts que la lignée DONNE, pas un de plus`);
        assert.equal(r.spellcasting, null, "le Fighter n'a pas d'incantation de classe — et la lignée ne s'y mêle pas");
      } else {
        assert.deepEqual(r.spellSources, [], `${option.id} : aucune source`);
      }
      if (data.lineage_damage && typeof option.damage === "string") {
        for (const id of data.lineage_damage.traits) {
          const t = r.traits.find((x) => x.id === id);
          assert.ok(t.name.endsWith(`(${option.damage})`), `${option.id} : « ${t.name} » dit ${option.damage}`);
        }
      }
    }
  }
  assert.ok(vus >= 40, `témoin : ${vus} lignées dérivées`);
  /* ⚔️ Sans caractéristique : pas de chiffre inventé — la source est DÉCLARÉE. */
  const sans = rebuild(PILES.SRD, [FIGHTER, espece("srd:species:en:elf"), { path: "species.lineage[0]", value: "drow" }]);
  assert.deepEqual(sans.resolved.spellSources, []);
  assert.ok(sans.underived.some((u) => u.field === "spellSources[species:elven-lineage]"), "la source attend sa caractéristique, et le dit");
});

test("L4 — 📏 LA TAILLE : une valeur parmi celles du texte, sa porte à Species, et la fiche la lit", () => {
  let vus = 0;
  for (const [nom, h] of Object.entries(PILES)) {
    for (const vue of q(h)({ kind: "species" }).filter((v) => v.record.data.size_choice)) {
      const ids = vue.record.data.size_choice.options.map((o) => o.id);
      const p = plans(h, [FIGHTER, espece(vue.id)]);
      const plan = p.find((x) => x.path === "species.size");
      assert.deepEqual(plan && plan.options, ids, `${nom} ${vue.id} : la porte de taille`);
      assert.ok(itemsDeLEtape({ decisions: p, document: doc(h, []), racine: "species" }).some((i) => i.path === "species.size"), "…est un item de l'étape");
      for (const id of ids) {
        vus += 1;
        const out = rebuild(h, [FIGHTER, espece(vue.id), { path: "species.size[0]", value: id }]);
        assert.equal(out.resolved.identity.size, id, `${vue.id} : identity.size = ${id}`);
      }
      const sans = rebuild(h, [FIGHTER, espece(vue.id)]);
      assert.equal(sans.resolved.identity.size, undefined, "sans réponse, la taille ne se devine pas");
      assert.ok(sans.underived.some((u) => u.field === "identity.size"), "…et c'est dit");
    }
  }
  assert.equal(vus, 8, "Human et Tiefling, Small et Medium, dans les deux piles");
});

test("L5 — ✨ MAGIC INITIATE : SA caractéristique, ses sorts HORS du bloc de classe, pour ses deux détenteurs", () => {
  const MI = "srd:feat:en:magic-initiate";
  const h = PILES.SRD;
  const WIZARD = { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } };
  /* l'arrière-plan qui IMPOSE le don (Acolyte), puis Versatile (Human) */
  const acolyte = [WIZARD, espece("srd:species:en:elf"), { path: "background", ref: { kind: "background", id: "srd:background:en:acolyte" } }];
  const p = plans(h, acolyte);
  const carac = p.find((x) => x.path === "background.originFeat[0].ability");
  assert.deepEqual(carac && carac.options, q(h)({ kind: "feat", id: MI }).record.data.spellcasting_ability_choice.from);
  const avec = rebuild(h, [...acolyte, { path: "background.originFeat[0].ability[0]", value: "wis" },
    { path: "background.originFeat[0].cantrips[0]", ref: { kind: "spell", id: "srd:spell:en:guidance" } }]).resolved;
  const source = avec.spellSources.find((s) => s.id === `background:${MI}`);
  assert.ok(source && source.ability === "wis" && source.source === "Acolyte", "le don de l'Acolyte lance en Sagesse");
  assert.equal(source.dc, 8 + avec.proficiency + modDe(scoreDe("wis")));
  assert.deepEqual(source.spells.map((s) => s.id), ["guidance"]);
  assert.ok(!avec.spellcasting.spells.some((s) => s.id === "guidance"), "⛔ le sort du don n'est PAS un sort du Magicien");
  assert.equal(avec.spellcasting.ability, "int", "le bloc de classe garde SA caractéristique");
  const versatile = [WIZARD, espece("srd:species:en:human"), { path: "species.originFeat[0]", ref: { kind: "feat", id: MI } }];
  assert.ok(plans(h, versatile).some((x) => x.path === "species.originFeat[0].ability"), "Versatile ouvre la même porte");
  assert.equal(featSousLabel("species.originFeat[0].ability"), "Spellcasting ability", "le mot de la branche du B emboîté");
  /* FH : le don d'origine CHOISI à l'Inheritance */
  const fh = PILES.FH;
  const fhDocs = [FIGHTER, espece("srd:species:en:elf"), { path: "background.originFeat[0]", ref: { kind: "feat", id: MI } }];
  assert.ok(plans(fh, fhDocs).some((x) => x.path === "background.originFeat[0].ability"), "FH : la même porte");
});

test("L6 — 🛠️ THE MOLE PEOPLE : la bourse captive d'un OUTIL, au palier posé (ARCHI 35, Q2 → a)", () => {
  const h = PILES.FH;
  for (const { vue, option, effets } of lignees(h).filter((x) => x.effets.granted_skill_budget)) {
    const budget = effets.granted_skill_budget;
    const choix = [FIGHTER, espece(vue.id), { path: "species.lineage[0]", value: option.id }];
    const plan = plans(h, choix).find((x) => x.path === "species.skillBudget");
    const slugs = budget.from.map((id) => q(h)({ kind: "tool", id }).record.slug);
    assert.deepEqual(plan && plan.options, slugs, `${option.id} : la bourse offre l'outil`);
    assert.equal(plan.expected, budget.points);
    const r = rebuild(h, [...choix, { path: `species.skillBudget.${slugs[0]}`, value: "novice" }]).resolved;
    const outil = r.tools.find((t) => t.id === slugs[0]);
    assert.ok(outil && outil.proficiency === "novice", `${option.id} : l'outil au palier Novice`);
    assert.equal(outil.bonus, modDe(scoreDe(outil.ability)) + Math.floor(r.proficiency / 2), "Novice = la moitié de la maîtrise");
    /* 📏 mesuré au banc : le récepteur disait « Tinker s tools — not in this ruleset » — le nom se lit
       dans le catalogue des OUTILS */
    const ctx = { decisions: plans(h, choix), query: q(h), document: doc(h, choix) };
    const porte = texteDe(SPECIES_CATALOGUE.itemCorps({ path: "species.skillBudget" }, ctx, () => {}));
    const nomDeLOutil = q(h)({ kind: "tool", id: budget.from[0] }).record.name;
    assert.ok(porte.toUpperCase().includes(nomDeLOutil.toUpperCase()) && !porte.includes("not in this ruleset"), `le récepteur nomme « ${nomDeLOutil} »`);
    /* ⚔️ une autre lignée n'ouvre aucune bourse */
    const autre = lignees(h).find((x) => x.vue.id === vue.id && !x.effets.granted_skill_budget);
    assert.equal(plans(h, [FIGHTER, espece(vue.id), { path: "species.lineage[0]", value: autre.option.id }]).find((x) => x.path === "species.skillBudget"), undefined);
    return;
  }
  assert.fail("témoin : aucune lignée ne déclare de bourse captive dans la pile FH");
});

test("L7 — 🖐️ L'ÉCRAN : la sous-porte vit DANS la porte de lignée, la taille a son organe, la fiche montre les sources", () => {
  const h = PILES.SRD;
  const choix = [FIGHTER, espece("srd:species:en:elf"), { path: "species.lineage[0]", value: "drow" }];
  const ctx = { decisions: plans(h, choix), query: q(h), document: doc(h, choix) };
  const porte = SPECIES_CATALOGUE.itemCorps({ path: "species.lineage" }, ctx, () => {});
  const t = texteDe(porte);
  assert.ok(t.includes("Spellcasting ability"), "le titre de la sous-porte");
  for (const cle of ["int", "wis", "cha"]) assert.ok(t.includes(NOMS_DE_CARAC[cle]), `le jeton ${NOMS_DE_CARAC[cle]}`);
  assert.equal(renderCaracteristiqueGlisse(ctx, () => {}, "species.lineage[0].size"), null, "⛔ sans plan, rien");
  /* la taille */
  const hum = [FIGHTER, espece("srd:species:en:human")];
  const ctxH = { decisions: plans(h, hum), query: q(h), document: doc(h, hum) };
  const taille = texteDe(SPECIES_CATALOGUE.itemCorps({ path: "species.size" }, ctxH, () => {}));
  assert.ok(taille.includes("Medium") && taille.includes("Small"), "les deux jetons, nommés par la couche");
  assert.equal(SPECIES_CATALOGUE.itemLabel("species.size", ctxH), "Size");
  const posee = [...hum, { path: "species.size[0]", value: "small" }];
  assert.deepEqual(SPECIES_CATALOGUE.itemLabel("species.size", { decisions: plans(h, posee), query: q(h) }), { mot: "Small", sous: "size" });
  /* la fiche */
  const out = rebuild(h, [...choix, { path: "species.lineage[0].ability[0]", value: "cha" }]);
  const fiche = renderFicheTemporaire({ resolved: out.resolved, report: out, flags: [] });
  const bloc = fiche.querySelectorAll("[data-rubrique]").find((n) => n.dataset.rubrique === "spellSources");
  assert.ok(bloc, "la rubrique des autres sources");
  assert.ok(bloc.textContent.includes("Elven Lineage: Drow") && bloc.textContent.includes("CHA") && bloc.textContent.includes("Dancing Lights"));
  const sansSource = rebuild(h, [FIGHTER, espece("srd:species:en:human")]);
  const vide = renderFicheTemporaire({ resolved: sansSource.resolved, report: sansSource, flags: [] });
  assert.ok(!vide.querySelectorAll("[data-rubrique]").some((n) => n.dataset.rubrique === "spellSources"), "⛔ sans source, pas de bloc");
});

test("L8 — ⛔ AUCUN NOM DE LIGNÉE NI D'ESPÈCE DANS LE CODE DU LOT : la donnée seule", () => {
  const noms = new Set();
  for (const h of Object.values(PILES)) {
    for (const vue of q(h)({ kind: "species" })) {
      noms.add(vue.record.slug);
      for (const o of vue.record.data.lineages || []) noms.add(o.id);
    }
  }
  const fichiers = ["src/build/lignee.mjs", "src/build/derive.mjs", "src/build/decisions.mjs", "ui/builder/caracteristique-glisse.mjs"];
  for (const f of fichiers) {
    const code = stripComments(fs.readFileSync(path.join(ROOT, f), "utf8"));
    for (const nom of noms) {
      assert.ok(!new RegExp(`["'\`]${nom}["'\`]`).test(code), `${f} cite « ${nom} » — une règle de lignée se lit dans la couche`);
    }
  }
  assert.ok(noms.size > 30, `témoin : ${noms.size} noms cherchés`);
});
