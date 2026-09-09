/* ══ LOT 190 — LE FIL SRD, ÉCRAN PAR ÉCRAN : SPECIES, CLASS ═══════════════════
   Eric a testé le fil SRD en ligne (v612) et a trouvé, sur ces deux écrans :
     · *« Species, prends l'image Fate's Hand, le même texte de blurb. Pour le
       moment. Les sous-menus sont les mêmes à très peu de choses près. »*
     · *« Class idem Species. »*
     · *« En SRD les compétences sont choisies dans les classes. Il faut un
       sélecteur de compétences en mode choix de jetons (sous-menu, rangées de
       3, avec collecteurs en bas). »*
   (Background a ses gardes dans `background-step.test.mjs`, §5 et §6.)

   Même patron que `background-step.test.mjs` : les FONCTIONS sur le DOM
   minimal, la pile SRD RÉELLE (`SRD_EN` seule), et — pour le blurb — la pile
   Fate's Hand réelle comme TÉMOIN de ce que la fiche de secours doit rendre.
   ⛔ Aucun texte de blurb n'est écrit ici : il est lu deux fois (le pli FH, la
   fiche de secours) et les deux lectures doivent coïncider. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, fileBytes, SRD_EN, FH_FICHE_EN } from "./build-harness.mjs";
import { itemsDeLEtape } from "../ui/builder/parcours.mjs";
import { FH_SKILLS_FLAG } from "../src/modules/fh/skill-pool.mjs";

globalThis.document = createTestDocument();

const { renderCatalogueCards } = await import("../ui/builder/catalogue.mjs");
const { SPECIES_CATALOGUE, renderSpeciesCardBody } = await import("../ui/builder/species-step.mjs");
const { CLASS_CATALOGUE, renderClassCardBody, renderClassChoices } = await import("../ui/builder/class-step.mjs");
/* ⚠️ LA MÊME INSTANCE QUE LES ÉCRANS. `species-step` et `class-step` importent
   `./fiche-secours.mjs?v=<N>` ; un import nu depuis ici serait un SECOND module,
   avec son propre état vide — le témoin ne pourrait jamais accuser. Le <N> se
   LIT dans l'écran (la loi de `version.mjs` : aucune constante recopiée). */
const fsNode = await import("node:fs");
const VERSION_UI = fsNode.readFileSync(new URL("../ui/builder/species-step.mjs", import.meta.url), "utf8").match(/catalogue\.mjs\?v=(\d+)/)[1];
const {
  retenirLaFicheDeSecours, oublierLaFicheDeSecours, blurbDeSecours, etatDeLaFicheDeSecours
} = await import(`../ui/builder/fiche-secours.mjs?v=${VERSION_UI}`);

const ELF = "srd:species:en:elf";
const FIGHTER = "srd:class:en:fighter";

/* ── la pile SRD seule, et un personnage juste assez complet pour `rebuild()` ── */
const H = makeHarness({ layers: [SRD_EN] });
const Q = H.layers.verbs.query;
function docSrd(id, choix = []) {
  return {
    schema: "fh-char/1", id, name: id, lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/fil-srd-ecrans", version: "1.0.0" },
    created: "2026-09-09T00:00:00Z", modified: "2026-09-09T00:00:00Z",
    build: {
      layers: manifestOf(H.layers),
      choices: [
        { path: "level", value: 1 },
        { path: "class", ref: { kind: "class", id: FIGHTER } },
        { path: "species", ref: { kind: "species", id: ELF } },
        ...["str", "dex", "con", "int", "wis", "cha"].map((k) => ({ path: `abilities.${k}`, value: 12 })),
        ...choix
      ],
      budgets: {}, overrides: []
    }
  };
}
const ctxDe = (report, cfg, extra = {}) => ({
  decisions: report.decisions, query: Q, document: report.document,
  path: cfg.path, kind: cfg.kind, label: cfg.label, fiche: true, cursor: 0, drapeaux: H.layers.verbs.flags(), ...extra
});
const carteDe = (report, cfg, body, id) => [...renderCatalogueCards(ctxDe(report, cfg), body).querySelectorAll("[data-snap]")]
  .find((c) => c.getAttribute("data-value") === id);

/* ── le TÉMOIN : ce que la pile Fate's Hand donne comme blurb à ces records ── */
const { exempleFhEn } = await import("../src/tools/exemple-fh-en.mjs");
const FH = exempleFhEn();
const blurbFh = (kind, id) => FH.layers.verbs.query({ kind, id }).record.data.blurb.text;

test("témoin — la pile SRD seule ne lève aucun drapeau et ne monte aucune couche FH ; la pile FH porte un blurb sur l'Elfe et le Fighter", () => {
  assert.deepEqual([...H.layers.verbs.flags()], []);
  assert.deepEqual(H.layers.verbs.stack().map((l) => l.id), ["srd-5.2.1-en"]);
  assert.ok(blurbFh("species", ELF).length > 0);
  assert.ok(blurbFh("class", FIGHTER).length > 0);
  assert.equal(Q({ kind: "species", id: ELF }).record.data.blurb, undefined, "témoin : en SRD, le record n'a AUCUN blurb — c'est le trou");
});

/* ══ ③ SPECIES ET CLASS EN SRD — l'image et le blurb de Fate's Hand ═══════════ */

test("🔴 en pile SRD, la fiche de l'Elfe et du Fighter portent l'image, le blurb de Fate's Hand et un Choose — sans qu'aucune couche FH soit montée", () => {
  retenirLaFicheDeSecours(fileBytes(FH_FICHE_EN));
  const report = H.build.verbs.rebuild({ document: docSrd("fiches") });
  for (const [cfg, body, id, kind, slug] of [
    [SPECIES_CATALOGUE, renderSpeciesCardBody, ELF, "species", "elf"],
    [CLASS_CATALOGUE, renderClassCardBody, FIGHTER, "class", "fighter"]
  ]) {
    const carte = carteDe(report, cfg, body, id);
    assert.ok(carte, `${id} : sa carte existe`);
    const img = carte.querySelector("img");
    assert.ok(img && /\/assets\/fiches\/[a-z-]+\.webp/.test(img.src) && img.src.includes(`/${slug}.webp`), `${id} : l'image par slug`);
    const blurb = carte.querySelector(".fiche-blurb");
    assert.ok(blurb && blurb.textContent.length > 0, `${id} : un blurb non vide`);
    assert.equal(blurb.textContent, blurbFh(kind, id), `${id} : LE MÊME texte que la pile Fate's Hand — deux lectures, un seul contenu`);
    assert.equal(carte.querySelectorAll('[data-action="choose"]').length, 1, `${id} : un Choose`);
    assert.equal(carte.querySelectorAll(".fiche-stat-row").length, 0, `${id} : aucune stat compressée de couche — les faits SRD sont des traits`);
  }
  /* ⛔ la porte de derrière est fermée : la pile n'a pas bougé */
  assert.deepEqual(H.layers.verbs.stack().map((l) => l.id), ["srd-5.2.1-en"], "aucune couche montée pour obtenir le blurb");
  assert.deepEqual([...H.layers.verbs.flags()], []);
  assert.equal(Q({ kind: "species", id: ELF }).record.data.blurb, undefined, "la vue montée n'a pas été patchée : le secours travaille sur une copie");
  oublierLaFicheDeSecours();
});

test("🔴 les faits SRD de la fiche sont ceux du record, en forme de traits ; aucun trait Fate's Hand n'y entre", () => {
  retenirLaFicheDeSecours(fileBytes(FH_FICHE_EN));
  const report = H.build.verbs.rebuild({ document: docSrd("faits") });
  const elf = carteDe(report, SPECIES_CATALOGUE, renderSpeciesCardBody, ELF);
  const noms = [...elf.querySelectorAll(".fiche-trait-nom")].map((b) => b.textContent);
  assert.deepEqual(noms, ["Size", "Speed", "Creature type", "Senses"]);
  const d = Q({ kind: "species", id: ELF }).record.data;
  assert.ok(elf.textContent.includes(d.size) && elf.textContent.includes(d.speed) && elf.textContent.includes(d.creature_type));
  assert.ok(!elf.textContent.includes("Splinter of Anon"), "⛔ le `fiche_traits` de la couche (un trait FH) ne passe pas par le secours");
  const fighter = carteDe(report, CLASS_CATALOGUE, renderClassCardBody, FIGHTER);
  const df = Q({ kind: "class", id: FIGHTER }).record.data;
  assert.deepEqual([...fighter.querySelectorAll(".fiche-trait-nom")].map((b) => b.textContent), ["Hit points", "Primary ability", "Saving throws"]);
  assert.ok(fighter.textContent.includes(df.hit_point_die));
  oublierLaFicheDeSecours();
});

test("⚖️ le repli est DÉCLARÉ : sans fiche de secours retenue, la fiche garde son image et son Choose, sa prose est vide — et l'état le dit", () => {
  oublierLaFicheDeSecours();
  assert.deepEqual(etatDeLaFicheDeSecours(), { retenue: false, refus: null });
  const report = H.build.verbs.rebuild({ document: docSrd("sans-secours") });
  const carte = carteDe(report, SPECIES_CATALOGUE, renderSpeciesCardBody, ELF);
  assert.equal(carte.querySelector(".fiche-blurb").textContent, "", "aucune chaîne inventée");
  assert.equal(carte.querySelectorAll('[data-action="choose"]').length, 1);
  assert.ok(carte.querySelector("img").src.includes("/elf.webp"));
  assert.equal(blurbDeSecours("species", Q({ kind: "species", id: ELF })), null);
  retenirLaFicheDeSecours(fileBytes(FH_FICHE_EN));
  assert.equal(etatDeLaFicheDeSecours().retenue, true);
  assert.equal(blurbDeSecours("species", Q({ kind: "species", id: ELF })), blurbFh("species", ELF));
  assert.equal(blurbDeSecours("species", null), null, "une vue absente : null, jamais un plantage");
  assert.equal(blurbDeSecours("background", Q({ kind: "background", id: "srd:background:en:acolyte" })), null, "un genre que la fiche ne patche pas : null");
  oublierLaFicheDeSecours();
});

test("📏 les 21 espèces et classes du SRD ont chacune un blurb de secours — aucune fiche SRD ne reste nue", () => {
  retenirLaFicheDeSecours(fileBytes(FH_FICHE_EN));
  for (const kind of ["species", "class"]) {
    for (const v of Q({ kind })) {
      const b = blurbDeSecours(kind, v);
      assert.ok(typeof b === "string" && b.length > 0, `${v.id} : un blurb`);
      assert.equal(b, blurbFh(kind, v.id), `${v.id} : le même que le pli FH`);
    }
  }
  assert.equal(Q({ kind: "species" }).length + Q({ kind: "class" }).length, 21, "témoin : 9 espèces + 12 classes SRD");
  oublierLaFicheDeSecours();
});

test("« les sous-menus sont les mêmes à très peu de choses près » — en SRD, l'Elfe garde son lignage et sa compétence accordée, ne gagne ni livre ni bourse", () => {
  const report = H.build.verbs.rebuild({ document: docSrd("sous-menus") });
  const items = itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "species" }).map((i) => i.path);
  assert.deepEqual(items, ["species.lineage", "species.skills"], "les plans SRD du record (lineages, granted_skill_choice)");
  assert.equal(SPECIES_CATALOGUE.livreDe(ctxDe(report, SPECIES_CATALOGUE)), null, "aucun lore sans fh-lore-en : le livre reste éteint");
  assert.ok(!report.decisions.some((p) => p.path === "species.skillBudget"), "aucune bourse FH (Keen Senses) en SRD");
});

/* ══ ④ CLASS EN SRD — le sélecteur de compétences en jetons ═══════════════════ */

const SLOTS = (decisions) => decisions.filter((p) => /^class\.skills\[\d+\]$/.test(p.path)).map((p) => p.path);

test("🔴 le sous-menu `class.skills` du Fighter SRD : neuf jetons en rangées de trois, DEUX collecteurs en bas", () => {
  const report = H.build.verbs.rebuild({ document: docSrd("selecteur") });
  const d = Q({ kind: "class", id: FIGHTER }).record.data;
  assert.equal(d.skill_choice.count, 2, "témoin : le record dit 2");
  assert.equal(d.skill_choice.from.length, 9, "témoin : parmi 9");
  const items = itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "class" }).map((i) => i.path);
  assert.ok(items.includes("class.skills"), `un item du guide de la classe (${items.join(", ")})`);
  const menu = renderClassChoices(ctxDe(report, CLASS_CATALOGUE), () => {}, "class.skills");
  const bloc = menu.querySelector(".choix-glisse");
  assert.ok(bloc, "le sélecteur existe");
  assert.equal(bloc.getAttribute("data-rangs"), "sorts", "rangées de trois — le régime du sélecteur de Skills (lot 171)");
  assert.equal(bloc.querySelectorAll(".glisse-jeton").length, 9);
  assert.equal(bloc.querySelectorAll("[data-creneau]").length, 2, "count collecteurs, pas un de plus");
  assert.deepEqual([...bloc.querySelectorAll("[data-creneau]")].map((c) => c.getAttribute("data-creneau")), SLOTS(report.decisions));
  assert.match(CLASS_CATALOGUE.itemAiguilleur("class.skills"), /Tap a skill to read it/);
});

/** Un tap au doigt sur un jeton (sous le seuil de glisser). */
function tap(jeton, pointerType = "touch") {
  document.elementFromPoint = () => null;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType });
  jeton.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
}

test("🔴 tap = info : la fenêtre de la compétence, avec Close · Select ; Select pose dans le PREMIER collecteur libre — et disparaît quand tout est pris", () => {
  const report = H.build.verbs.rebuild({ document: docSrd("tap") });
  const appels = [];
  const menu = renderClassChoices(ctxDe(report, CLASS_CATALOGUE), (a) => appels.push(a), "class.skills");
  const jeton = menu.querySelector(".glisse-jeton");
  const slug = jeton.getAttribute("data-valeur");
  tap(jeton);
  assert.equal(appels.length, 1);
  assert.equal(appels[0].kind, "popup", "au doigt, le tap ouvre l'info — il ne pose pas");
  assert.equal(appels[0].titre, Q({ kind: "skill" }).find((v) => v.record.slug === slug).record.name);
  assert.match(appels[0].texte, /Ability: /, "ce que le SRD dit de la compétence");
  assert.deepEqual(appels[0].actions.map((a) => a.mot), ["Close", "Select"]);
  appels[0].actions[1].faire();
  assert.equal(appels.length, 2);
  assert.deepEqual(appels[1], { kind: "set", path: SLOTS(report.decisions)[0], value: slug }, "Select pose dans le premier collecteur libre");

  /* tout pris : Select n'est plus là (un bouton qui ne ferait rien mentirait) */
  const [a, b] = Q({ kind: "class", id: FIGHTER }).record.data.skill_choice.from.map((id) => id.split(":").pop());
  const plein = H.build.verbs.rebuild({ document: docSrd("plein", [{ path: "class.skills[0]", value: a }, { path: "class.skills[1]", value: b }]) });
  const appelsPlein = [];
  const menuPlein = renderClassChoices(ctxDe(plein, CLASS_CATALOGUE), (x) => appelsPlein.push(x), "class.skills");
  const libre = [...menuPlein.querySelectorAll(".glisse-jeton")].find((j) => !j.disabled);
  assert.ok(libre, "témoin : il reste des jetons non posés");
  tap(libre);
  assert.deepEqual(appelsPlein[0].actions.map((x) => x.mot), ["Close"]);
  /* et à la souris, le clic gauche pose (la loi du 16/08, portée par l'organe) */
  const appelsSouris = [];
  tap(renderClassChoices(ctxDe(report, CLASS_CATALOGUE), (x) => appelsSouris.push(x), "class.skills").querySelector(".glisse-jeton"), "mouse");
  assert.equal(appelsSouris[0].kind, "set");
});

test("🔴 deux jetons posés → deux maîtrises dans `resolved.skills` ; un troisième est REFUSÉ par le carnet", () => {
  const [a, b, c] = Q({ kind: "class", id: FIGHTER }).record.data.skill_choice.from.map((id) => id.split(":").pop());
  const deux = H.build.verbs.rebuild({ document: docSrd("deux", [{ path: "class.skills[0]", value: a }, { path: "class.skills[1]", value: b }]) });
  const maitrises = deux.resolved.skills.filter((s) => s.proficiency !== "none").map((s) => s.id).sort();
  assert.deepEqual(maitrises, [a, b].sort());
  const plan = deux.decisions.find((p) => p.path === "class.skills");
  assert.equal(plan.status, "answered");
  assert.equal(SLOTS(deux.decisions).length, 2, "l'écran n'offre que deux collecteurs : pas de troisième à viser");
  const trois = H.build.verbs.rebuild({ document: docSrd("trois", [
    { path: "class.skills[0]", value: a }, { path: "class.skills[1]", value: b }, { path: "class.skills[2]", value: c }
  ]) });
  const verrou = trois.decisions.find((p) => p.path === "class.skills").lock;
  assert.ok(verrou && verrou.key === "skill-grant.count-mismatch", `le carnet refuse le troisième (${verrou && verrou.key})`);
  assert.equal(verrou.params.declared, 2);
  assert.equal(verrou.params.actual, 3);
});

test("🔴 en pile Fate's Hand, le sous-menu N'EXISTE PAS : aucun plan `class.skills`, et le drapeau `fh.skills` l'éteint même si un plan existait", () => {
  const rep = FH.build.verbs.rebuild({ document: FH.document });
  assert.ok(FH.layers.verbs.flags().includes(FH_SKILLS_FLAG), "témoin : la pile FH lève fh.skills");
  assert.ok(!rep.decisions.some((p) => p.path === "class.skills"), "aucun plan de compétences de classe : elles se prennent au cran Skills");
  assert.ok(!itemsDeLEtape({ decisions: rep.decisions, document: rep.document, racine: "class" }).some((i) => i.path === "class.skills"));
  /* ⚔️ le drapeau seul suffit : la pile SRD avec le drapeau levé n'affiche pas le sélecteur */
  const report = H.build.verbs.rebuild({ document: docSrd("drapeau") });
  const menu = renderClassChoices(ctxDe(report, CLASS_CATALOGUE, { drapeaux: [FH_SKILLS_FLAG] }), () => {}, "class.skills");
  assert.equal(menu.querySelectorAll(".choix-glisse").length, 0, "le drapeau, pas l'absence d'une bourse, décide");
  /* et sans le drapeau (ctx sans `drapeaux` du tout — les bancs) : le sélecteur est là */
  assert.equal(renderClassChoices({ decisions: report.decisions, query: Q }, () => {}, "class.skills").querySelectorAll(".choix-glisse").length, 1);
});
