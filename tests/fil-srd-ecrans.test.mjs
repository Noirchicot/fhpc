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
import { makeHarness, manifestOf, fileBytes, PILE_SRD, FH_FICHE_EN } from "./build-harness.mjs";
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

/* ── la pile SRD, et un personnage juste assez complet pour `rebuild()` ──────
   🔴 LOT 196 — CE HARNAIS MONTAIT `SRD_EN` SEUL, ET CE N'ÉTAIT PAS LA PILE DU
   JOUEUR. « SRD » au tableau de commande veut dire trois couches : le livre,
   plus les deux `srfh` (le rangement d'Eric et les mécaniques déclarées) — ce
   qui est AMBIGU monte dans les DEUX piles, la bascule de `shell.mjs` ne
   touche que `FH_LAYER_IDS`. Un fichier qui s'appelle « le fil SRD, écran par
   écran » doit mesurer CE pli-là, sinon il décrit un écran que personne n'a.
   📏 ET ÇA A COÛTÉ QUELQUE CHOSE : jusqu'au 10/09, ce fichier affirmait que
   l'Acolyte n'ouvrait aucune porte de don « en pile SRD ». C'était vrai du
   livre nu, faux du joueur dès que la déclaration est arrivée dans `srfh`.
   ⛔ `PILE_SRD` est LUE, jamais recopiée, et `universe-step.test.mjs` (garde
   A0) la confronte à `[SRD_LAYER_ID, ...SRFH_LAYER_IDS]`. */
const H = makeHarness({ layers: PILE_SRD });
/** Les ids de cette pile, DÉDUITS de la liste des fichiers — jamais réécrits :
 *  c'est la recopie qui laisse deux listes diverger (lot 77). */
const IDS_PILE_SRD = PILE_SRD.map((f) => f.replace(/^layers\//, "").replace(/\.layer\.json$/, ""));
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
  assert.deepEqual(H.layers.verbs.stack().map((l) => l.id), IDS_PILE_SRD,
    "la pile SRD du joueur : le livre et les deux `srfh` — aucune couche FH, aucun drapeau");
  assert.equal(IDS_PILE_SRD.length, 3, "et elle en compte trois — si ce chiffre bouge, on veut le savoir ICI");
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
  assert.deepEqual(H.layers.verbs.stack().map((l) => l.id), IDS_PILE_SRD, "aucune couche montée pour obtenir le blurb");
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
  document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
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

/* ══════════════════════════════════════════════════════════════════════════
   LOT 194 — LE FIL SRD, DEUXIÈME PASSE. Eric l'a refait en débutant (v616) et
   a nommé quatre choses, chacune ici avec son garde, chacun éprouvé ROUGE.
   ══════════════════════════════════════════════════════════════════════════ */

const { BACKGROUND_CATALOGUE } = await import("../ui/builder/background-step.mjs");
const { renderBoostGlisse } = await import("../ui/builder/inheritance-step.mjs");
const { porteUneDecisionOuverte } = await import("../ui/builder/parcours.mjs");

const SOLDIER = "srd:background:en:soldier";
const ACOLYTE = "srd:background:en:acolyte";
const fond = (id) => ({ path: "background", ref: { kind: "background", id } });

/* ══ ⑤ SPECIES — « SB skills (moche) » ═════════════════════════════════════
   Eric, 2026-09-10 : *« mets des tokens avec les noms des compétences, avec
   des collecteurs, avec les règles habituelles. »* */

const SLOTS_ESPECE = (decisions) => decisions.filter((p) => /^species\.skills\[\d+\]$/.test(p.path)).map((p) => p.path);
const corpsEspece = (report, act = () => {}) =>
  SPECIES_CATALOGUE.itemCorps({ path: "species.skills" }, ctxDe(report, SPECIES_CATALOGUE), act);

test("🔴 le sous-menu `species.skills` de l'Elfe SRD : les jetons du `from`, UN collecteur, et chaque jeton porte le NOM de son record", () => {
  const report = H.build.verbs.rebuild({ document: docSrd("elf-skills") });
  const d = Q({ kind: "species", id: ELF }).record.data;
  assert.equal(d.granted_skill_choice.count, 1, "témoin : le record dit 1");
  assert.equal(d.granted_skill_choice.from.length, 3, "témoin : parmi 3");
  const bloc = corpsEspece(report);
  assert.ok(bloc, "le sélecteur existe");
  assert.equal(bloc.getAttribute("data-rangs"), "sorts", "le régime du sélecteur de Skills (lot 171)");
  assert.equal(bloc.querySelectorAll(".glisse-jeton").length, 3);
  assert.equal(bloc.querySelectorAll("[data-creneau]").length, 1, "`count` collecteurs, pas un de plus");
  assert.deepEqual([...bloc.querySelectorAll("[data-creneau]")].map((c) => c.getAttribute("data-creneau")),
    SLOTS_ESPECE(report.decisions));
  /* ⚔️ LE MOT — le défaut mesuré dans la page le 10/09 : le plan publie des
     SLUGS, l'écran les résolvait par identifiant, et les trois jetons
     disaient « Insight — not in this ruleset » sur une pile qui porte le
     record. Un seul mot de refus fait rougir ce garde. */
  const mots = [...bloc.querySelectorAll(".glisse-jeton")].map((j) => j.textContent);
  assert.deepEqual(mots.sort(), d.granted_skill_choice.from.map((id) => Q({ kind: "skill", id }).record.name).sort(),
    "les noms des records, lus dans la pile — jamais un slug humanisé plus un refus");
  assert.match(SPECIES_CATALOGUE.itemAiguilleur("species.skills", ctxDe(report, SPECIES_CATALOGUE)), /Tap a skill to read/);
  /* ⛔ et plus AUCUN QCM : ni ici, ni dans le menu de repli (2ᵉ palier) */
  assert.equal(bloc.querySelectorAll(".record-option").length, 0, "le « — » du QCM a disparu avec lui");
});

test("🔴 tap = info sur un jeton de compétence d'espèce : `Close · Select`, et Select pose dans le collecteur", () => {
  const report = H.build.verbs.rebuild({ document: docSrd("elf-tap") });
  const appels = [];
  const bloc = corpsEspece(report, (a) => appels.push(a));
  const jeton = bloc.querySelector(".glisse-jeton");
  const slug = jeton.getAttribute("data-valeur");
  tap(jeton);
  assert.equal(appels.length, 1);
  assert.equal(appels[0].kind, "popup", "au doigt, le tap ouvre l'info — il ne pose pas");
  assert.equal(appels[0].titre, Q({ kind: "skill" }).find((v) => v.record.slug === slug).record.name);
  assert.deepEqual(appels[0].actions.map((a) => a.mot), ["Close", "Select"]);
  appels[0].actions[1].faire();
  assert.deepEqual(appels[1], { kind: "set", path: SLOTS_ESPECE(report.decisions)[0], value: slug },
    "le MÊME chemin qu'avant le lot 194 : le sélecteur change le geste, pas la réponse");
});

test("🔴 un jeton posé → la maîtrise entre dans `resolved.skills`, et le BILAN de l'item la NOMME", () => {
  const slug = Q({ kind: "species", id: ELF }).record.data.granted_skill_choice.from[1].split(":").pop();
  const document = docSrd("elf-pose", [{ path: "species.skills[0]", value: slug }]);
  /* le bilan d'un item ne paraît qu'une fois l'item SIGNÉ (loi du 19/08) */
  document.build.confirmed = ["species.skills"];
  const report = H.build.verbs.rebuild({ document });
  const maitrises = report.resolved.skills.filter((s) => s.proficiency !== "none").map((s) => s.id);
  assert.ok(maitrises.includes(slug), `la compétence posée est maîtrisée (${maitrises.join(", ")})`);

  const item = itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "species" })
    .find((i) => i.path === "species.skills");
  assert.ok(item && item.confirme, "témoin : l'item est signé");
  const appels = [];
  const resume = SPECIES_CATALOGUE.resumeItem(item, ctxDe(report, SPECIES_CATALOGUE), (a) => appels.push(a));
  assert.ok(resume, "l'item a un bilan — il n'en avait AUCUN avant ce lot");
  const nom = Q({ kind: "skill" }).find((v) => v.record.slug === slug).record.name;
  assert.match(resume.textContent, new RegExp(nom), `le bilan nomme la compétence : « ${resume.textContent} »`);
  /* et le nom y est tappable — canon : tap = info */
  const bouton = resume.querySelector(".bilan-nom");
  assert.ok(bouton, "le nom est un bouton");
  bouton.dispatchEvent({ type: "click" });
  assert.equal(appels[0].kind, "popup");
  assert.equal(appels[0].titre, nom);
});

test("⚔️ ATTAQUE — une compétence hors du `from` est REFUSÉE par le carnet, et le bilan ne l'écrit pas", () => {
  const document = docSrd("elf-hors", [{ path: "species.skills[0]", value: "stealth" }]);
  document.build.confirmed = ["species.skills"];
  const report = H.build.verbs.rebuild({ document });
  const plan = report.decisions.find((p) => p.path === "species.skills");
  assert.ok(!plan.options.includes("stealth"), "témoin : Stealth n'est pas au menu de Keen Senses");
  assert.deepEqual(plan.selected, [], "le carnet ne la retient pas");
  const item = itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "species" })
    .find((i) => i.path === "species.skills");
  const resume = SPECIES_CATALOGUE.resumeItem(item, ctxDe(report, SPECIES_CATALOGUE), () => {});
  assert.equal(resume, null, "un bilan dit ce qu'on A — pas ce qu'on a tenté");
});

/* ══ ⑤ bis — KEEN SENSES N'EST PAS « GAGNÉ D'OFFICE » — lot 196 ════════════
   ⚖️ ERIC, 2026-09-10 : *« Keen Senses, pas granted, choix trois tokens un
   collecteur drop. »*

   📏 CE QUI A ÉTÉ MESURÉ AVANT D'AGIR, sur l'Elfe en pile SRD, écran Species :
   le mot **Keen Senses** paraissait UNE fois, et au mauvais endroit — sur la
   ligne « Granted automatically », c'est-à-dire annoncé comme ACQUIS alors
   que le joueur doit choisir laquelle des trois compétences il prend. La
   cause : `TRAITS_COUVERTS` (species-step.mjs) couvrait la bourse Fate's Hand
   (`species.skillBudget`) et laissait le choix SRD (`species.skills`) à VIDE.
   Une couverture par chemin ne dit jamais toute seule qu'il lui manque un
   chemin — une absence n'est jamais une réponse.

   ⭐ ET LE TRAIT NE DISPARAÎT PAS, IL CHANGE DE PLACE (Eric, 19/08 : *« tu
   aurais pu noter Keen Senses au-dessus de Delve et Vigilance »*). Ce garde
   mesure donc les DEUX états de l'écran et NOMME les deux chiffres :
     · question OUVERTE  → **0** — la porte porte la QUESTION (« Species
       skill »), jamais sa cause. C'est exactement ce que fait la bourse FH,
       dont la porte dit « Skill budget » tant qu'elle n'est pas dépensée.
     · item SIGNÉ        → **1** — la tête du bilan porte le nom du trait qui
       accorde, par le MÊME organe que la bourse (`traitQuiAccorde`).

   ⚠️ ET CE QUI CHANGE N'EST PAS LE COMPTE, C'EST LA PLACE — mesuré, parce que
   je m'étais annoncé le contraire. En remettant `"species.skills": []` dans
   `TRAITS_COUVERTS` (la mutation ⚔️), les chiffres deviennent **1 et 1**, pas
   1 et 2 : le mot ne se DOUBLE jamais, parce que les deux organes lisent la
   MÊME table — couvert, il quitte le bloc accordé et paraît au bilan ; non
   couvert, il reste dans le bloc accordé et le bilan se tait. Un organe unique
   pour les deux, et c'est ce qui rend le doublon impossible par construction.
   ⇒ Le défaut réparé n'est donc pas « deux fois », c'est **« au mauvais
   endroit »** : `Keen Senses` était annoncé comme ACQUIS pendant que le joueur
   avait encore à choisir laquelle des trois compétences il prend.

   ⚔️ ÉPROUVÉ ROUGE : la mutation fait tomber la première moitié du garde,
   `0` attendu, `1` mesuré — « ne doit plus être annoncé comme acquis ». */

/** TOUT CE QUE L'ÉCRAN SPECIES MET SOUS LES YEUX DU JOUEUR, en une chaîne :
 *  les mots de porte, les têtes de bilan, les corps de sélecteur, les
 *  consignes, et le bloc « gagné d'office ». ⛔ On ne cherche pas le mot dans
 *  UN organe choisi d'avance — c'est l'écran entier qui ne doit pas se répéter,
 *  et un relevé qui ne regarde qu'un organe ne pourrait jamais accuser. */
function motsDeLEcranEspece(report) {
  const ctx = ctxDe(report, SPECIES_CATALOGUE);
  const items = itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "species" });
  const morceaux = [];
  const dire = (v) => {
    if (!v) return;
    if (typeof v === "string") morceaux.push(v);
    else if (typeof v === "object" && typeof v.mot === "string") morceaux.push(`${v.mot} ${v.sous || ""}`);
    else if (typeof v.textContent === "string") morceaux.push(v.textContent);
  };
  for (const item of items) {
    dire(SPECIES_CATALOGUE.itemLabel(item.path, ctx));
    dire(SPECIES_CATALOGUE.bilanLabel(item.path, ctx));
    dire(SPECIES_CATALOGUE.itemAiguilleur(item.path, ctx));
    dire(SPECIES_CATALOGUE.itemCorps(item, ctx, () => {}));
    dire(SPECIES_CATALOGUE.resumeItem(item, ctx, () => {}));
  }
  for (const ligne of SPECIES_CATALOGUE.lignesEnPlus || []) {
    dire(SPECIES_CATALOGUE.resumeItem({ ...ligne, confirme: true }, ctx, () => {}));
  }
  return morceaux.join("\n");
}

const compter = (texte, mot) => (texte.match(new RegExp(mot, "g")) || []).length;

test("🔴 en SRD, `Keen Senses` a QUITTÉ le bloc « gagné d'office » : 0 fois tant que la question est ouverte, 1 fois au bilan", () => {
  const trait = Q({ kind: "species", id: ELF }).record.data.traits.find((t) => t.id === "keen-senses");
  assert.ok(trait && trait.name === "Keen Senses", "témoin : le record de l'Elfe porte bien ce trait, sous ce nom");

  /* ① LA QUESTION EST OUVERTE — le mot ne paraît nulle part. */
  const ouvert = H.build.verbs.rebuild({ document: docSrd("keen-ouvert") });
  const texteOuvert = motsDeLEcranEspece(ouvert);
  assert.equal(compter(texteOuvert, trait.name), 0,
    `« ${trait.name} » ne doit plus être annoncé comme acquis : le joueur ne l'a pas encore choisi`);
  assert.match(texteOuvert, /Species skill/, "témoin : la porte est bien là, avec sa QUESTION");

  /* ② L'ITEM EST SIGNÉ — le mot revient, une fois, en tête du bilan. */
  const slug = Q({ kind: "species", id: ELF }).record.data.granted_skill_choice.from[1].split(":").pop();
  const doc = docSrd("keen-signe", [{ path: "species.skills[0]", value: slug }]);
  doc.build.confirmed = ["species.skills"];
  const signe = H.build.verbs.rebuild({ document: doc });
  const texteSigne = motsDeLEcranEspece(signe);
  assert.equal(compter(texteSigne, trait.name), 1,
    `« ${trait.name} » dit D'OÙ vient la compétence posée — une fois, et une seule`);
});

test("🔴 la porte `Species skill` de l'Elfe SRD : TROIS jetons, UN collecteur — le sélecteur du lot 194, tel quel", () => {
  const report = H.build.verbs.rebuild({ document: docSrd("keen-selecteur") });
  const bloc = corpsEspece(report);
  assert.ok(bloc && bloc.className === "choix-glisse", "le corps de l'item EST le sélecteur");
  const jetons = bloc.querySelectorAll(".glisse-jeton");
  assert.equal(jetons.length, 3, "trois jetons");
  assert.equal(bloc.querySelectorAll("[data-creneau]").length, 1, "un collecteur");
  /* ⛔ les trois noms viennent du PLAN, jamais d'une liste écrite ici */
  const plan = report.decisions.find((p) => p.path === "species.skills");
  assert.deepEqual(jetons.map((j) => j.getAttribute("data-valeur")).sort(), [...plan.options].sort());
  assert.equal(plan.options.length, 3, "témoin : le record de l'Elfe en offre trois");
});

/* ══ ⑥ BACKGROUND — la porte des caracs, l'outil, le don ═══════════════════ */

test("🔴 la porte des caracs ouvre NEUTRE : rien de posé, aucun verrou, aucun refus à l'écran", () => {
  const report = H.build.verbs.rebuild({ document: docSrd("bg-neutre", [fond(SOLDIER)]) });
  const plan = report.decisions.find((p) => p.path === "background.boost");
  assert.equal(plan.status, "pending");
  assert.ok(!plan.lock, "aucun verrou avant le premier geste");
  const bloc = BACKGROUND_CATALOGUE.itemCorps({ path: "background.boost" }, ctxDe(report, BACKGROUND_CATALOGUE), () => {});
  assert.equal(bloc.getAttribute("data-status"), "pending");
  assert.equal(bloc.querySelectorAll(".skills-refusal").length, 0);
  /* les collecteurs sont les TROIS caractéristiques du record, pas six */
  const d = Q({ kind: "background", id: SOLDIER }).record.data;
  assert.deepEqual([...bloc.querySelectorAll("[data-creneau]")].map((c) => c.getAttribute("data-creneau")),
    d.ability_keys.map((k) => `background.boost.${k}`));
});

test("🔴 +2/+1 et +1/+1/+1 sont TOUS DEUX acceptés ; ⚔️ +3 sur une seule et 2 sur 3 sont refusés", () => {
  const boost = (paires) => {
    const report = H.build.verbs.rebuild({ document: docSrd(`bg-${paires.map((p) => p.join("")).join("-")}`,
      [fond(SOLDIER), ...paires.map(([k, v]) => ({ path: `background.boost.${k}`, value: v }))]) });
    return report.decisions.find((p) => p.path === "background.boost");
  };
  const deuxUn = boost([["str", 2], ["dex", 1]]);
  assert.ok(!deuxUn.lock, "+2/+1 passe");
  assert.equal(deuxUn.answered, 3);
  const troisUns = boost([["str", 1], ["dex", 1], ["con", 1]]);
  assert.ok(!troisUns.lock, "+1/+1/+1 passe aussi — le SRD 2024 offre les deux");
  assert.equal(troisUns.answered, 3);
  /* ⚔️ les deux refus, intacts */
  assert.equal(boost([["str", 3]]).lock.key, "background.boost-cap-exceeded");
  assert.equal(boost([["str", 2]]).lock.key, "background.boost-total-mismatch");
});

test("🔴 Soldier porte une porte `Tool`, les trois autres arrière-plans n'en ont pas — c'est `tool_choice` qui tranche", () => {
  const portes = {};
  for (const slug of ["acolyte", "criminal", "sage", "soldier"]) {
    const id = `srd:background:en:${slug}`;
    const report = H.build.verbs.rebuild({ document: docSrd(`porte-${slug}`, [fond(id)]) });
    portes[slug] = itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "background" })
      .map((i) => i.path);
  }
  assert.ok(portes.soldier.includes("background.tool"), `soldier : sa porte d'outil (${portes.soldier.join(", ")})`);
  for (const slug of ["acolyte", "criminal", "sage"]) {
    /* ⛔ ON MESURE LA PORTE D'OUTIL, PAS LA LISTE ENTIÈRE — lot 196. Ce garde
       comparait la liste complète des portes de l'étape, donc il rougissait
       quand un AUTRE item en ouvrait une : depuis que `srfh-mecaniques-en`
       déclare `spell_list_choice`, l'Acolyte porte aussi la porte de son don.
       Un garde qui accuse pour ce qu'il ne mesure pas ne mesure plus rien. */
    assert.ok(!portes[slug].includes("background.tool"),
      `${slug} : son outil est imposé, donc pas de porte d'outil (${portes[slug].join(", ")})`);
    assert.equal(typeof Q({ kind: "background", id: `srd:background:en:${slug}` }).record.data.tool_id, "string",
      "témoin : c'est `tool_id` qui l'impose");
  }
  assert.equal(Q({ kind: "background", id: SOLDIER }).record.data.tool_id, undefined,
    "témoin : le Soldier n'a pas de `tool_id`, il a un `tool_choice`");
});

test("🔴 le don ACCORDÉ se lit sur la ligne « gagné d'office », et son nom tappable donne sa DESCRIPTION", () => {
  const report = H.build.verbs.rebuild({ document: docSrd("bg-granted", [fond(SOLDIER)]) });
  const ctx = ctxDe(report, BACKGROUND_CATALOGUE);
  const appels = [];
  const resume = BACKGROUND_CATALOGUE.resumeItem({ path: "background.granted" }, ctx, (a) => appels.push(a));
  assert.ok(resume, "la ligne a un résumé");
  const boutons = [...resume.querySelectorAll(".bilan-nom")];
  const don = boutons.find((b) => b.textContent === "Savage Attacker");
  assert.ok(don, `le don est un bouton (${boutons.map((b) => b.textContent).join(" · ")})`);
  don.dispatchEvent({ type: "click" });
  assert.equal(appels[0].kind, "popup");
  assert.equal(appels[0].titre, "Savage Attacker");
  assert.equal(appels[0].texte, Q({ kind: "feat", id: "srd:feat:en:savage-attacker" }).record.data.description,
    "la description du record, à l'octet — jamais un résumé fabriqué par l'écran");
});

test("🔴 UN PLAN REQUIS N'EST PAS UNE PORTE — sauf s'il porte, en dessous, une décision à prendre", () => {
  /* 📏 CE QUI A CHANGÉ LE 10/09, ET IL FAUT LIRE LES DEUX ÉTATS. Jusqu'au lot
     196, les quatre arrière-plans SRD imposaient leur don et AUCUN ne publiait
     de sous-décision : `spell_list_choice` ne vivait que dans `fh-feats-en`,
     derrière l'interrupteur Destiny. Ce fichier le disait, et c'était honnête.
     ⚖️ Eric, 10/09 : *« Reproduis exactement dans backgrounds ce que tu trouves
     pour Magic Initiate dans FH, rien ne change. Fais-le ! »* La déclaration
     est descendue dans `srfh-mecaniques-en`, qui monte dans les DEUX piles.
     ⇒ L'Acolyte OUVRE désormais sa porte en SRD. La ligne de partage n'a pas
     bougé d'un pouce — c'est toujours « y a-t-il une décision dessous ? » — et
     c'est le SOLDIER qui tient maintenant le côté « rien à régler ».
     ⚔️ Ce garde est éprouvé ROUGE en retirant `data[spell_list_choice]` de
     `layers/srfh-mecaniques-en.layer.json` : l'Acolyte reperd sa porte. */
  const report = H.build.verbs.rebuild({ document: docSrd("bg-don", [fond(ACOLYTE)]) });
  const plan = report.decisions.find((p) => p.path === "background.originFeat[0]");
  assert.equal(plan.provenance.mode, "required", "témoin : l'arrière-plan l'impose");
  assert.equal(porteUneDecisionOuverte(report.decisions, "background.originFeat[0]"), true,
    "il y a de quoi régler dessous : la pile SRD déclare `spell_list_choice`");
  assert.ok(itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "background" })
    .some((i) => i.path === "background.originFeat[0]"), "donc une porte, et le don s'y configure");

  /* ⛔ ET LE DON QUI N'A RIEN À RÉGLER N'EN PREND TOUJOURS PAS. Savage Attacker
     ne déclare rien : il reste sur la ligne « gagné d'office ». C'est la
     moitié qui prouve que le critère est la DONNÉE, pas le mode `required`. */
  const soldat = H.build.verbs.rebuild({ document: docSrd("bg-don-sans", [fond(SOLDIER)]) });
  assert.equal(soldat.decisions.find((p) => p.path === "background.originFeat[0]").provenance.mode, "required");
  assert.equal(porteUneDecisionOuverte(soldat.decisions, "background.originFeat[0]"), false,
    "Savage Attacker ne déclare rien — rien à régler dessous");
  assert.ok(!itemsDeLEtape({ decisions: soldat.decisions, document: soldat.document, racine: "background" })
    .some((i) => i.path === "background.originFeat[0]"), "donc aucune porte (lot 190)");

  /* ⚔️ ET LE CONTRAIRE, SUR UN CARNET FABRIQUÉ : un plan requis SOUS lequel le
     carnet publie une décision ouverte redevient une porte. C'est la moitié
     qui prouve que le critère est la DONNÉE, pas le nom du chemin. */
  const carnet = [
    { path: "background.originFeat[0]", options: ["zz:feat:a"], selected: ["zz:feat:a"], expected: 1, answered: 1, status: "answered", provenance: { mode: "required" } },
    { path: "background.originFeat[0].cantrips", options: ["zz:spell:a"], selected: [], expected: 2, answered: 0, status: "pending", provenance: { mode: "offered" } }
  ];
  assert.equal(porteUneDecisionOuverte(carnet, "background.originFeat[0]"), true);
  assert.deepEqual(itemsDeLEtape({ decisions: carnet, document: { build: { confirmed: [] } }, racine: "background" })
    .map((i) => i.path), ["background.originFeat[0]"], "la porte s'ouvre, et une seule — le contenu n'est pas un item de plus");
  /* ⛔ un sous-plan lui-même REQUIS (une liste que l'arrière-plan fixe) ne
     compte pas : il n'y a rien à y répondre. */
  const listeImposee = [carnet[0],
    { path: "background.originFeat[0].list", options: ["zz:class:a"], selected: ["zz:class:a"], expected: 1, answered: 1, status: "answered", provenance: { mode: "required" } }];
  assert.equal(porteUneDecisionOuverte(listeImposee, "background.originFeat[0]"), false);
});

/* ══ ⑥ bis — LE PIED D'UNE DALLE D'ITEM ════════════════════════════════════
   Eric, 2026-09-10 : *« B1 : […] pas de bouton Back / Done. »*

   📏 MESURÉ DANS LA PAGE (375 × 812, pile SRD, personnage d'exemple dont
   l'étape est SIGNÉE) : la dalle de l'item rendait son hôte `[data-sortie-ici]`
   avec le seul livre, éteint — ni `Cancel` ni `Done`. Le cran le plus
   intérieur du parcours n'avait plus AUCUNE porte, dans les deux sens.

   ⛔ CE GARDE LIT LA SOURCE, ET IL LE DIT : `renderSortieEtape` n'est pas
   exportée et ne lit que l'état de module de la coquille — la même façon de
   garder que `shell-wiring.test.mjs` pour le producteur unique du pied. Ce
   qu'il tient est la CONDITION, pas une mise en forme. */

const shellSource = fsNode.readFileSync(new URL("../ui/builder/shell.mjs", import.meta.url), "utf8");

/** La ligne de retour anticipé qui lit la signature de l'étape. */
function gardeDuPied(source) {
  const ligne = source.split("\n").find((l) => l.includes("estConfirme(state.document, STEPS[state.step].id)") && l.includes("return null"));
  return ligne === undefined ? null : ligne;
}

test("🔴 une étape SIGNÉE ne retire pas son pied à une dalle d'ITEM — la paire est sa seule sortie", () => {
  const ligne = gardeDuPied(shellSource);
  assert.ok(ligne, "le retour anticipé existe toujours");
  assert.match(ligne, /!state\.parcoursItem/,
    "l'exception de la dalle d'item est écrite ICI aussi — la ceinture ne remonte qu'entre ÉTAPES");
  /* ⚔️ ATTAQUE — la retirer rend le garde ROUGE (c'est l'état mesuré le 10/09) */
  const mutee = shellSource.replace(" && !state.parcoursItem) return null;", ") return null;");
  assert.notEqual(mutee, shellSource, "témoin : la mutation a bien mordu");
  assert.doesNotMatch(gardeDuPied(mutee), /!state\.parcoursItem/,
    "sans elle, un item ouvert sur une étape signée n'a ni Cancel ni Done");
});

test("🔴 …et un item qui n'a PAS RÉPONDU ne se signe pas : le compte désarme le `Done`, comme le verrou le faisait", () => {
  /* 📏 MESURÉ DANS LA PAGE LE 10/09, en vérifiant ce lot : `Species skill`
     ouvert sans rien poser, `Done` pressé → l'item était SIGNÉ, le voyant
     verdissait et l'étape annonçait « This step is settled » sur une
     compétence jamais choisie. Ancien et général : `done.disabled` ne lisait
     que la porte du PALIER.
     ⚠️ ET `background.boost` EN ÉTAIT PROTÉGÉ PAR ACCIDENT — son verrou de
     total partait dès zéro (le rouge que ce lot fait tomber), et c'est lui qui
     désarmait le bouton. Sans cette ligne, le lot échangeait un faux rouge
     contre un faux « settled ». */
  const corps = shellSource.slice(shellSource.indexOf("function renderSortieEtape("));
  assert.match(corps, /if \(plan && !repondu && done && !done\.dataset\.verrou\) \{/,
    "le compte de l'item désarme le `Done`");
  /* et `repondu` est bien le compte du carnet, pas un état d'écran */
  assert.match(corps, /plan\.answered >= plan\.expected && !plan\.lock/);
  /* ⛔ `Cancel` n'est jamais touché — la sortie reste ouverte (Eric, 29/08) */
  assert.doesNotMatch(corps.slice(corps.indexOf("if (plan && !repondu")), /back\.disabled/);
  /* ⚔️ ATTAQUE — la retirer rend le garde ROUGE */
  const mutee = corps.replace("if (plan && !repondu && done && !done.dataset.verrou) {", "if (false) {");
  assert.doesNotMatch(mutee, /if \(plan && !repondu && done && !done\.dataset\.verrou\) \{/);
});
