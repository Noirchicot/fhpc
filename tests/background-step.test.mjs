/* ══ LOT 187 — L'ARRIÈRE-PLAN DU SRD A SON ÉCRAN ═══════════════════════════

   ⚖️ ERIC, 2026-09-09, à *« l'étape Background en pile SRD n'a pas d'écran —
   huit crans, ou un écran ? »* : *« je ne comprends pas où est ton problème »*.
   ⇒ Quatre arrière-plans dans la pile, donc l'écran qui les montre.

   📏 LE TROU, MESURÉ DANS LA PAGE AVANT CE LOT : le cran 3 disait `Background`
   (lot 186), l'écran servait le guide d'Inheritance, vide.
   `parcoursInheritance()` rendait `INHERITANCE_PARCOURS.parcours` — `true`,
   sans condition. La ceinture lisait les drapeaux, la coquille non.

   Même patron que `class-species-steps.test.mjs` : on teste les FONCTIONS
   (le catalogue partagé et la configuration de l'écran), pas la page — DOM
   minimal de `dom-stub.mjs`. La coquille, elle, est lue sur ses octets, comme
   dans `ceinture-versatile.test.mjs`.

   ⚠️ CE QUI REND CE FICHIER NON TAUTOLOGIQUE : les drapeaux sont RELEVÉS sur
   les couches du dépôt, et les arrière-plans sont LUS dans la couche SRD — ni
   les uns ni les autres ne sont écrits ici. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { makeHarness, manifestOf, uneCouche, SRD_EN } from "./build-harness.mjs";
import { LAYER_FILES } from "./ceinture-versatile.fixture.mjs";
import { STEPS, ceinture } from "../ui/builder/etapes.mjs";
import { itemsDeLEtape } from "../ui/builder/parcours.mjs";

globalThis.document = createTestDocument();

const { catalogueOptions, renderCatalogueCards } = await import("../ui/builder/catalogue.mjs");
const {
  BACKGROUND_CATALOGUE, renderBackgroundCardBody, renderBackgroundChoices, backgroundPalier2, inheritanceMontee, LIGNE_ACQUIS
} = await import("../ui/builder/background-step.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shellText = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8");
const ecranText = fs.readFileSync(path.join(ROOT, "ui", "builder", "background-step.mjs"), "utf8");

/** Le corps d'une fonction, accolades comptées (même outil que le lot 186). */
function corpsDe(source, nom) {
  const debut = source.indexOf(`function ${nom}(`);
  if (debut === -1) return null;
  const ouvre = source.indexOf("{", debut);
  let profondeur = 0;
  for (let i = ouvre; i < source.length; i += 1) {
    if (source[i] === "{") profondeur += 1;
    else if (source[i] === "}") {
      profondeur -= 1;
      if (profondeur === 0) return source.slice(ouvre, i + 1);
    }
  }
  return null;
}

/* ══ 0. LES TÉMOINS — RELEVÉS, PAS ÉCRITS ═════════════════════════════════ */

/** Les drapeaux qu'une pile de couches lève VRAIMENT (même relevé que le lot 186). */
async function drapeauxDe(fichiersEteints = []) {
  const { createLayers } = await import("../src/layers/index.mjs");
  const layers = createLayers({ bus: { emit() {}, on() {} } });
  for (const fichier of LAYER_FILES) {
    layers.verbs.register({ bytes: new Uint8Array(fs.readFileSync(path.join(ROOT, "layers", fichier))), origin: fichier });
  }
  for (const id of [...fichiersEteints].reverse()) layers.verbs.disable({ id });
  return layers.verbs.flags();
}
const { FH_LAYER_IDS } = await import("../ui/builder/universe-step.mjs");
const PILE_FH = await drapeauxDe([]);
const PILE_SRD = await drapeauxDe(FH_LAYER_IDS);
const PILE_SRD_ET_DESTINY = await drapeauxDe(FH_LAYER_IDS.filter((id) => id !== "fh-arcana-en"));

/** La pile SRD seule, et un personnage juste assez complet pour `rebuild()`. */
function harnaisSrd(extra) {
  return makeHarness({ layers: [SRD_EN], ...(extra ? { extra } : {}) });
}
function docSrd(h, id, choix = []) {
  return {
    schema: "fh-char/1", id, name: id, lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/background-step", version: "1.0.0" },
    created: "2026-09-09T00:00:00Z", modified: "2026-09-09T00:00:00Z",
    build: {
      layers: manifestOf(h.layers),
      choices: [
        { path: "level", value: 1 },
        { path: "class", ref: { kind: "class", id: "srd:class:en:fighter" } },
        { path: "species", ref: { kind: "species", id: "srd:species:en:human" } },
        ...["str", "dex", "con", "int", "wis", "cha"].map((k) => ({ path: `abilities.${k}`, value: 12 })),
        ...choix
      ],
      budgets: {}, overrides: []
    }
  };
}
const CHOIX_BG = (id) => ({ path: "background", ref: { kind: "background", id } });
const ctxDe = (h, report, cursor = 0) => ({
  decisions: report.decisions, query: h.layers.verbs.query, document: report.document,
  path: BACKGROUND_CATALOGUE.path, kind: BACKGROUND_CATALOGUE.kind, label: BACKGROUND_CATALOGUE.label,
  fiche: true, cursor
});

const H = harnaisSrd();
const Q = H.layers.verbs.query;
const ARRIERE_PLANS = Q({ kind: "background" }) || [];

test("témoin — la pile SRD porte des arrière-plans, et le carnet les publie tels quels", () => {
  assert.ok(ARRIERE_PLANS.length >= 2, `le SRD doit porter plusieurs arrière-plans (lu : ${ARRIERE_PLANS.length})`);
  const report = H.build.verbs.rebuild({ document: docSrd(H, "temoin") });
  assert.deepEqual(catalogueOptions(report.decisions, "background").slice().sort(),
    ARRIERE_PLANS.map((v) => v.id).sort(),
    "les options du plan `background` SONT les records du genre monté");
});

test("témoin — `tool_choice` : lesquels le portent, MESURÉ sur la couche (aucune liste ici)", () => {
  const avecChoix = ARRIERE_PLANS.filter((v) => v.record.data && v.record.data.tool_choice !== undefined);
  const avecOutil = ARRIERE_PLANS.filter((v) => typeof (v.record.data || {}).tool_id === "string");
  assert.equal(avecChoix.length + avecOutil.length, ARRIERE_PLANS.length,
    "chaque arrière-plan SRD accorde un outil OU en fait choisir un — jamais ni l'un ni l'autre");
  assert.ok(avecChoix.length >= 1, "au moins un arrière-plan laisse choisir son outil — sinon le glisser n'a rien à prouver");
  assert.ok(avecOutil.length >= 1, "au moins un l'impose — sinon l'acquis imposé n'a rien à prouver");
});

/* ══ 1. UN SEUL SIGNAL — LE MOT DU CRAN ET L'ÉCRAN, DANS LES DEUX SENS ═════ */

test("🔴 le cran 3 change d'ÉCRAN exactement quand il change de MOT — sur les piles RÉELLES", () => {
  const motDuCran3 = (drapeaux) => ceinture(drapeaux).find((c) => c.id === "background").mot;
  /* la pile complète : le mot est Inheritance, l'écran est Inheritance */
  assert.equal(motDuCran3(PILE_FH), "Inheritance");
  assert.equal(inheritanceMontee(PILE_FH), true);
  /* le SRD seul : le mot est celui du SRD, l'écran est le catalogue */
  assert.equal(motDuCran3(PILE_SRD), "Background");
  assert.equal(inheritanceMontee(PILE_SRD), false);
  /* ⚔️ « SRD + Destiny » — la pile qui n'a pas de nom : ni l'un ni l'autre
     aiguillage par nom de pile n'aurait su quoi faire (lot 186) */
  assert.ok(PILE_SRD_ET_DESTINY.includes("fh.destiny"), "témoin : Destiny est bien allumé seul");
  assert.equal(motDuCran3(PILE_SRD_ET_DESTINY), "Background");
  assert.equal(inheritanceMontee(PILE_SRD_ET_DESTINY), false);
});

test("🔴 le prédicat lit la DÉCLARATION du cran, pas un drapeau recopié", () => {
  const cran = STEPS.find((s) => s.id === "background");
  const drapeaux = (cran.motSi || []).map((v) => v.drapeau);
  assert.ok(drapeaux.length >= 1, "témoin : le cran 3 déclare au moins une variante de mot");
  for (const d of drapeaux) assert.equal(inheritanceMontee([d]), true, `le drapeau déclaré « ${d} » change l'écran`);
  assert.equal(inheritanceMontee(["fh.destiny"]), false, "un drapeau étranger ne change rien");
  assert.equal(inheritanceMontee([]), false);
  assert.equal(inheritanceMontee(undefined), false, "sans moteur, aucun drapeau : l'écran SRD, jamais un plantage");
  /* ⛔ aucun littéral de drapeau dans l'écran : la déclaration vit dans etapes.mjs */
  for (const d of drapeaux) {
    assert.ok(!stripComments(ecranText).includes(`"${d}"`), `« ${d} » est recopié en littéral dans background-step.mjs`);
  }
});

/** Ce que la coquille doit faire de ce signal — lu sur ses octets. */
function fautesDeRoutage(source) {
  const propre = stripComments(source);
  const fautes = [];
  const corps = corpsDe(propre, "parcoursInheritance") || "";
  if (!/inheritanceMontee\(drapeauxMontes\(\)\)/.test(corps)) fautes.push("parcoursInheritance ne lit pas les drapeaux montés");
  if (/return true/.test(corps) || /INHERITANCE_PARCOURS\.parcours/.test(corps)) fautes.push("parcoursInheritance rend une constante");
  const courant = corpsDe(propre, "catalogueCourant") || "";
  if (!/"background" && parcoursInheritance\(\)\) return null/.test(courant)) fautes.push("catalogueCourant sert le catalogue sous fh.inheritance");
  if (!/background: \{ \.\.\.BACKGROUND_CATALOGUE/.test(propre)) fautes.push("CATALOGUES n'a pas d'entrée background");
  const chapitre = corpsDe(propre, "parcoursDuChapitre") || "";
  if (!/id === "background" && parcoursInheritance\(\)\) return INHERITANCE_PARCOURS/.test(chapitre)) fautes.push("parcoursDuChapitre ne distingue pas les deux écrans");
  return fautes;
}

test("🔴 la coquille route le cran 3 sur ce signal — et sur rien d'autre", () => {
  assert.deepEqual(fautesDeRoutage(shellText), []);
});

test("⚔️ ATTAQUE — `parcoursInheritance()` remis à `true` fait ROUGIR le garde", () => {
  const mute = shellText.replace(
    "function parcoursInheritance() { return inheritanceMontee(drapeauxMontes()); }",
    "function parcoursInheritance() { return true; }"
  );
  assert.notEqual(mute, shellText, "témoin : la mutation a trouvé sa cible");
  assert.deepEqual(fautesDeRoutage(mute), [
    "parcoursInheritance ne lit pas les drapeaux montés",
    "parcoursInheritance rend une constante"
  ]);
});

/* ══ 2. L'ÉCRAN MONTRE CE QUE LA PILE PORTE ══════════════════════════════════ */

test("🔴 autant de cartes que d'arrière-plans MONTÉS, dans l'ordre du plan — et chacune a son Choose", () => {
  const report = H.build.verbs.rebuild({ document: docSrd(H, "cartes") });
  const cards = renderCatalogueCards(ctxDe(H, report), renderBackgroundCardBody);
  const snaps = cards.querySelectorAll("[data-snap]");
  assert.equal(snaps.length, ARRIERE_PLANS.length, "une carte par record du genre — ni plus ni moins");
  const options = catalogueOptions(report.decisions, "background");
  snaps.forEach((card, i) => {
    assert.equal(card.getAttribute("data-snap"), "background");
    assert.equal(card.getAttribute("data-value"), options[i], "l'ordre des cartes est celui du plan (II.3)");
    /* ⛔ LE TROU DE SPECIES EN PILE SRD N'EST PAS RECOPIÉ — mesuré le 09/09 :
       ses neuf fiches SRD n'ont AUCUN bouton Choose. Ici, chaque carte a le sien. */
    assert.equal(card.querySelectorAll('[data-action="choose"]').length, 1, `${options[i]} : un Choose sur la fiche`);
  });
});

test("🔴 un CINQUIÈME arrière-plan (couche de fixture) fait une cinquième carte — rien n'est listé en dur", () => {
  const CINQUIEME = "test:background:en:lighthouse-keeper";
  const couche = uneCouche("test-cinquieme-arriere-plan", {
    background: {
      [CINQUIEME]: {
        op: "add", name: "Lighthouse Keeper", slug: "lighthouse-keeper",
        data: {
          ability_keys: ["con", "wis", "cha"], ability_scores: ["Constitution", "Wisdom", "Charisma"],
          skill_ids: ["srd:skill:en:perception", "srd:skill:en:survival"],
          feat_id: "srd:feat:en:alert",
          tool_id: "srd:tool:en:navigator-s-tools",
          equipment: "Choose A or B: (A) Lantern; or (B) 50 GP"
        }
      }
    }
  });
  const h = harnaisSrd(couche);
  const report = h.build.verbs.rebuild({ document: docSrd(h, "cinq") });
  const cards = renderCatalogueCards(ctxDe(h, report), renderBackgroundCardBody);
  const valeurs = [...cards.querySelectorAll("[data-snap]")].map((c) => c.getAttribute("data-value"));
  assert.equal(valeurs.length, ARRIERE_PLANS.length + 1, "quatre du SRD plus celui de la fixture");
  assert.ok(valeurs.includes(CINQUIEME), "la carte de la fixture est là");
  assert.match(cards.textContent, /Lighthouse Keeper/);
});

test("⚔️ TÉMOIN — aucun id d'arrière-plan SRD n'est écrit dans l'écran", () => {
  const propre = stripComments(ecranText);
  for (const v of ARRIERE_PLANS) {
    assert.ok(!propre.includes(v.id), `« ${v.id} » est écrit en dur dans background-step.mjs`);
    assert.ok(!propre.includes(`"${v.record.slug}"`), `« ${v.record.slug} » est écrit en dur dans background-step.mjs`);
  }
});

/* ══ 3. CE QU'UNE CARTE MONTRE — LU DANS LE RECORD ═════════════════════════ */

function carteDe(h, report, id) {
  const cards = renderCatalogueCards(ctxDe(h, report), renderBackgroundCardBody);
  return [...cards.querySelectorAll("[data-snap]")].find((c) => c.getAttribute("data-value") === id);
}

test("🔴 la carte dit le nom, les 2 compétences, l'outil, le don d'origine et les 3 caractéristiques — ceux du record", () => {
  const report = H.build.verbs.rebuild({ document: docSrd(H, "contenu") });
  for (const v of ARRIERE_PLANS) {
    const d = v.record.data;
    const texte = carteDe(H, report, v.id).textContent;
    assert.match(texte, new RegExp(v.record.name), `${v.id} : son nom`);
    for (const sid of d.skill_ids) {
      assert.ok(texte.includes(Q({ kind: "skill", id: sid }).record.name), `${v.id} : la compétence ${sid}`);
    }
    for (const mot of d.ability_scores) assert.ok(texte.includes(mot), `${v.id} : la caractéristique ${mot}`);
    assert.ok(texte.includes(Q({ kind: "feat", id: d.feat_id }).record.name), `${v.id} : le don ${d.feat_id}`);
    if (d.feat_option) {
      assert.ok(texte.includes(`(${Q(d.feat_option).record.name})`), `${v.id} : l'option du don, un nom de record`);
    }
    if (typeof d.tool_id === "string") {
      assert.ok(texte.includes(Q({ kind: "tool", id: d.tool_id }).record.name), `${v.id} : l'outil ${d.tool_id}`);
      assert.ok(!texte.includes("your pick"), `${v.id} : un outil accordé ne se présente pas comme un choix`);
    } else {
      for (const tid of d.tool_choice.from) {
        assert.ok(texte.includes(Q({ kind: "tool", id: tid }).record.name), `${v.id} : l'outil proposé ${tid}`);
      }
      assert.ok(texte.includes("your pick"), `${v.id} : la carte DIT que l'outil reste à choisir`);
    }
    /* ⛔ l'équipement A/B n'est pas ici : c'est l'affaire de l'étape Equipment */
    assert.ok(!texte.includes("Choose A or B"), `${v.id} : le paquet A/B n'est pas proposé sur la carte`);
  }
});

/* ══ 4. UN CHOIX POSÉ — LE MOTEUR LE LIT (le témoin de fin de lot) ═════════ */

test("🔴 un arrière-plan choisi — et RIEN d'autre posé — sort `identity.background` d'`underived` ; ses compétences, son outil et son don sont acquis sans un geste", () => {
  const sans = H.build.verbs.rebuild({ document: docSrd(H, "sans") });
  assert.ok(sans.underived.some((u) => u.field === "identity.background"), "témoin : sans choix, le moteur le DIT");
  for (const v of ARRIERE_PLANS) {
    const d = v.record.data;
    const avec = H.build.verbs.rebuild({ document: docSrd(H, `avec-${v.record.slug}`, [CHOIX_BG(v.id)]) });
    assert.ok(!avec.underived.some((u) => u.field === "identity.background"), `${v.id} : identity.background dérivé`);
    assert.equal(avec.resolved.identity.background, v.record.name);
    for (const sid of d.skill_ids) {
      const slug = sid.split(":").pop();
      const ligne = avec.resolved.skills.find((s) => s.id === slug);
      assert.ok(ligne && ligne.proficiency !== "none", `${v.id} : ${slug} est une maîtrise dans resolved.skills`);
    }
    if (typeof d.tool_id === "string") {
      assert.ok(avec.resolved.tools.some((t) => t.id === d.tool_id.split(":").pop()), `${v.id} : l'outil est dans resolved.tools`);
    } else {
      assert.ok(avec.underived.some((u) => u.key === "underived.background-tool-choice-unanswered"),
        `${v.id} : tant que l'outil n'est pas choisi, le moteur le DIT`);
    }
    const don = avec.decisions.find((p) => p.path === "background.originFeat[0]");
    assert.deepEqual(don && don.selected, [d.feat_id], `${v.id} : le don d'origine est posé au carnet`);
  }
});

test("📏 MESURÉ, PAS CORRIGÉ ICI — en pile SRD, le don ne descend pas dans `resolved.traits` (aucune source de trait pour les dons)", () => {
  /* Le mandat attendait le don dans `resolved`. Il y est au CARNET (test
     précédent), pas dans la fiche : `derive.mjs` déclare
     `underived.no-trait-field-for-class-feat-background` — un état d'avant ce
     lot, qui vaut pour toute la pile SRD, et qui est nommé plutôt que masqué. */
  const v = ARRIERE_PLANS[0];
  const avec = H.build.verbs.rebuild({ document: docSrd(H, "traits", [CHOIX_BG(v.id)]) });
  assert.ok(avec.underived.some((u) => u.key === "underived.no-trait-field-for-class-feat-background"));
});

test("🔴 le `tool_choice` : le choix posé (`choose`, ref tool) est CONSOMMÉ par le moteur", () => {
  const v = ARRIERE_PLANS.find((x) => x.record.data.tool_choice !== undefined);
  const tid = v.record.data.tool_choice.from[0];
  const avec = H.build.verbs.rebuild({ document: docSrd(H, "outil-choisi", [
    CHOIX_BG(v.id), { path: "background.tool", ref: { kind: "tool", id: tid } }
  ]) });
  assert.ok(!avec.underived.some((u) => u.key === "underived.background-tool-choice-unanswered"));
  assert.ok(avec.resolved.tools.some((t) => t.id === tid.split(":").pop()), "l'outil choisi est dans resolved.tools");
  assert.ok(!avec.unconsumed.some((c) => c.path === "background.tool"), "le choix n'est pas tombé en unconsumed");
});

/* ══ 5. LES ITEMS DU PARCOURS — un corps par chemin, la question seulement là où elle se pose ═ */

test("🔴 les items sous la racine : les bonus SEULS quand l'outil est imposé — le don et l'outil ne sont pas des portes (lot 190)", () => {
  const v = ARRIERE_PLANS.find((x) => typeof x.record.data.tool_id === "string");
  const report = H.build.verbs.rebuild({ document: docSrd(H, "items", [CHOIX_BG(v.id)]) });
  const ctx = ctxDe(H, report);
  const items = itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "background" });
  /* ⚖️ Eric, 09/09 : « Savage Attacker (c'est granted) pas de bouton … les
     skills sont granted, y'a pas de choix. Idem que pour les lineages. » —
     les plans REQUIS du carnet (feat_id, tool_id) ne sont plus des items. */
  assert.deepEqual(items.map((i) => i.path), ["background.boost"]);
  for (const chemin of ["background.originFeat[0]", "background.tool"]) {
    const plan = report.decisions.find((p) => p.path === chemin);
    assert.equal(plan && plan.provenance && plan.provenance.mode, "required", `témoin : ${chemin} est bien publié REQUIS par le carnet`);
  }

  const boost = BACKGROUND_CATALOGUE.itemCorps({ path: "background.boost" }, ctx, () => {});
  assert.ok(boost, "le glisser des bonus existe");
  assert.equal(boost.querySelectorAll(".glisse-creneau").length, v.record.data.ability_keys.length,
    "un récepteur par caractéristique que le record nomme — trois, pas six");

  /* ⛔ un item imposé n'a plus de corps : rien à ouvrir, rien à signer */
  assert.equal(BACKGROUND_CATALOGUE.itemCorps({ path: "background.tool" }, ctx, () => {}), null);
  assert.equal(BACKGROUND_CATALOGUE.itemCorps({ path: "background.originFeat[0]" }, ctx, () => {}), null);
  assert.equal(BACKGROUND_CATALOGUE.itemLabel("background.boost", ctx), "Ability boosts");
});

test("🔴 la ligne « gagné d'office » — la forme des lignages : les compétences, l'outil imposé, le don ; le nom du don et de l'outil se tape pour lire", () => {
  const v = ARRIERE_PLANS.find((x) => typeof x.record.data.tool_id === "string");
  const d = v.record.data;
  const report = H.build.verbs.rebuild({ document: docSrd(H, "acquis", [CHOIX_BG(v.id)]) });
  const ctx = ctxDe(H, report);
  assert.deepEqual(BACKGROUND_CATALOGUE.lignesEnPlus, [LIGNE_ACQUIS], "une ligne sans porte, comme `species.granted`");
  assert.equal(LIGNE_ACQUIS.sansChoix, true);
  assert.equal(LIGNE_ACQUIS.depend, undefined, "elle ne dépend d'aucun autre choix : verte dès que l'arrière-plan est retenu");
  assert.equal(BACKGROUND_CATALOGUE.itemLabel(LIGNE_ACQUIS.path, ctx), LIGNE_ACQUIS.label);

  const appels = [];
  const resume = BACKGROUND_CATALOGUE.resumeItem({ path: LIGNE_ACQUIS.path }, ctx, (a) => appels.push(a));
  assert.ok(resume, "le résumé existe dès que l'arrière-plan est retenu");
  const texte = resume.textContent;
  for (const sid of d.skill_ids) assert.ok(texte.includes(Q({ kind: "skill", id: sid }).record.name), `la compétence ${sid}`);
  assert.ok(texte.includes(Q({ kind: "tool", id: d.tool_id }).record.name), "l'outil imposé");
  assert.ok(texte.includes(Q({ kind: "feat", id: d.feat_id }).record.name), "le don d'origine");
  assert.equal(resume.querySelectorAll(".glisse-vivier").length, 0, "⛔ rien à glisser sur un acquis");

  const boutons = [...resume.querySelectorAll("button.bilan-nom")];
  assert.equal(boutons.length, 2, "deux noms qui ouvrent une fenêtre : l'outil et le don");
  for (const b of boutons) b.dispatchEvent({ type: "click" });
  assert.deepEqual(appels.map((a) => a.kind), ["popup", "popup"], "tap sur le nom = info (doigt : tap = info)");
  assert.deepEqual(appels.map((a) => a.titre).sort(),
    [Q({ kind: "feat", id: d.feat_id }).record.name, Q({ kind: "tool", id: d.tool_id }).record.name].sort());

  /* le Soldier CHOISIT son outil : sa ligne ne le nomme pas, la porte `Tool` le demande */
  const s = ARRIERE_PLANS.find((x) => x.record.data.tool_choice !== undefined);
  const rs = H.build.verbs.rebuild({ document: docSrd(H, "acquis-soldier", [CHOIX_BG(s.id)]) });
  const resumeS = BACKGROUND_CATALOGUE.resumeItem({ path: LIGNE_ACQUIS.path }, ctxDe(H, rs), () => {});
  for (const tid of s.record.data.tool_choice.from) {
    assert.ok(!resumeS.textContent.includes(Q({ kind: "tool", id: tid }).record.name), `${tid} n'est pas annoncé comme acquis`);
  }
  assert.deepEqual(itemsDeLEtape({ decisions: rs.decisions, document: rs.document, racine: "background" }).map((i) => i.path),
    ["background.boost", "background.tool"], "l'outil À CHOISIR reste une porte");
});

test("⚔️ TÉMOIN — l'Inheritance de Fate's Hand n'a aucun plan requis : ses trois items ne bougent pas", async () => {
  const { exempleFhEn } = await import("../src/tools/exemple-fh-en.mjs");
  const fh = exempleFhEn();
  const report = fh.build.verbs.rebuild({ document: fh.document });
  assert.ok(report.decisions.filter((p) => p.path.startsWith("background.")).every((p) => !p.provenance || p.provenance.mode !== "required"));
  assert.deepEqual(itemsDeLEtape({ decisions: report.decisions, document: report.document, racine: "background" }).map((i) => i.path),
    ["background.boost", "background.languages", "background.originFeat[0]"]);
});

test("🔴 l'outil À CHOISIR (tool_choice) : un glisser, et LUI SEUL pose la question", () => {
  const v = ARRIERE_PLANS.find((x) => x.record.data.tool_choice !== undefined);
  const report = H.build.verbs.rebuild({ document: docSrd(H, "outil-glisser", [CHOIX_BG(v.id)]) });
  const ctx = ctxDe(H, report);
  const outil = BACKGROUND_CATALOGUE.itemCorps({ path: "background.tool" }, ctx, () => {});
  assert.ok(outil && outil.querySelector(".glisse-vivier"), "un collecteur : il y a quelque chose à poser");
  const jetons = [...outil.querySelectorAll(".glisse-vivier button")].map((b) => b.textContent);
  for (const tid of v.record.data.tool_choice.from) {
    assert.ok(jetons.some((j) => j.includes(Q({ kind: "tool", id: tid }).record.name)), `le jeton ${tid}`);
  }
  assert.equal(BACKGROUND_CATALOGUE.itemLabel("background.tool", ctx), "Tool", "porte non résolue : la question");
  assert.match(BACKGROUND_CATALOGUE.itemAiguilleur("background.tool", ctx), /drag it into the slot/);

  /* une fois choisi : la porte nomme, le palier est prêt quand les bonus le sont aussi */
  const tid = v.record.data.tool_choice.from[0];
  const boosts = v.record.data.ability_keys.map((k, i) => ({ path: `background.boost.${k}`, value: i === 0 ? 2 : (i === 1 ? 1 : 0) }))
    .filter((c) => c.value > 0);
  const apres = H.build.verbs.rebuild({ document: docSrd(H, "outil-pose", [
    CHOIX_BG(v.id), { path: "background.tool", ref: { kind: "tool", id: tid } }, ...boosts
  ]) });
  assert.deepEqual(BACKGROUND_CATALOGUE.itemLabel("background.tool", ctxDe(H, apres)),
    { mot: Q({ kind: "tool", id: tid }).record.name, sous: "tool" });
  assert.deepEqual(backgroundPalier2(report.decisions), { ready: false }, "avant : l'outil et les bonus manquent");
  assert.deepEqual(backgroundPalier2(apres.decisions), { ready: true }, "après : tout ce que le carnet publie est répondu");
});

test("le menu des choix (repli) empile les corps, et rend un nœud même sans arrière-plan retenu", () => {
  const sans = H.build.verbs.rebuild({ document: docSrd(H, "menu-sans") });
  const vide = renderBackgroundChoices(ctxDe(H, sans), () => {});
  assert.equal(vide.className, "catalogue-choices");
  assert.equal(vide.children.length, 0, "aucun plan sous la racine : rien à empiler");
  assert.equal(backgroundPalier2(sans.decisions), null, "aucun plan : un seul palier (I.4)");
  /* le menu n'empile que ce qui reste À CHOISIR (lot 190) : les bonus pour
     un outil imposé, les bonus ET l'outil pour le Soldier */
  const impose = ARRIERE_PLANS.find((x) => typeof x.record.data.tool_id === "string");
  const avec = H.build.verbs.rebuild({ document: docSrd(H, "menu-avec", [CHOIX_BG(impose.id)]) });
  assert.equal(renderBackgroundChoices(ctxDe(H, avec), () => {}).children.length, 1);
  const choisit = ARRIERE_PLANS.find((x) => x.record.data.tool_choice !== undefined);
  const soldier = H.build.verbs.rebuild({ document: docSrd(H, "menu-soldier", [CHOIX_BG(choisit.id)]) });
  assert.equal(renderBackgroundChoices(ctxDe(H, soldier), () => {}).children.length, 2);
});

/* ══ 6. LOT 190 — LE FANTÔME QUI « NE POSAIT PAS » ══════════════════════════
   Eric, 09/09 : *« fantôme marche pas, pas possible de poser dans les
   collecteurs »*. 📏 Mesuré dans la page (375 × 812, Acolyte, +1 glissé sur
   INT) : le dépôt ÉCRIVAIT `background.boost.int = 1` et l'écran comptait
   « 1 of 3 chosen » — mais le collecteur restait « drop here ».
   ⛔ LE TÉMOIN DU LOT 187 NE POUVAIT PAS ACCUSER : son `ctxDe` portait
   `document`, celui de la coquille (`catalogueCtx`) ne le portait pas. Les
   deux gardes ci-dessous ferment les deux moitiés : l'organe LIT le document
   (donnée), et la coquille le DONNE (lu sur ses octets, comme le routage). */

test("🔴 le récepteur d'un bonus lit sa valeur DANS LE DOCUMENT : avec, il est rempli ; sans, il dit « drop here »", () => {
  const v = ARRIERE_PLANS[0];
  const key = v.record.data.ability_keys[0];
  const report = H.build.verbs.rebuild({ document: docSrd(H, "boost-pose", [CHOIX_BG(v.id), { path: `background.boost.${key}`, value: 2 }]) });
  const creneau = (ctx) => [...BACKGROUND_CATALOGUE.itemCorps({ path: "background.boost" }, ctx, () => {})
    .querySelectorAll("[data-creneau]")].find((c) => c.getAttribute("data-creneau") === `background.boost.${key}`);
  const avec = creneau(ctxDe(H, report));
  assert.equal(avec.getAttribute("data-rempli"), "true", "avec le document : le collecteur montre le bonus posé");
  assert.match(avec.textContent, /\+2/);
  const { document: _sans, ...sansDocument } = ctxDe(H, report);
  const sans = creneau(sansDocument);
  assert.equal(sans.getAttribute("data-rempli"), "false", "témoin : sans document, l'organe ne voit rien — c'était l'écran d'Eric");
  assert.match(sans.textContent, /drop here/);
  /* et le moteur CONSOMME le bonus : +2 sur la caractéristique, base 12 */
  assert.equal(report.resolved.abilities[key].score, 14, "le boost d'arrière-plan SRD est lu par derive.mjs — ce n'est pas un trou de moteur");
  assert.ok(!report.unconsumed.some((c) => c.path === `background.boost.${key}`));
});

/** Ce que la coquille doit donner au ctx des catalogues — lu sur ses octets. */
function fautesDuCtx(source) {
  const corps = corpsDe(stripComments(source), "catalogueCtx") || "";
  return /document: state\.document/.test(corps) ? [] : ["catalogueCtx ne porte pas le document"];
}

test("🔴 `catalogueCtx` (shell.mjs) porte le document — comme `inheritanceCtx` l'a toujours fait", () => {
  assert.deepEqual(fautesDuCtx(shellText), []);
  assert.match(corpsDe(stripComments(shellText), "inheritanceCtx") || "", /document: state\.document/, "témoin : l'autre ctx du même organe");
});

test("⚔️ ATTAQUE — retirer `document` du ctx des catalogues fait ROUGIR le garde", () => {
  const corps = corpsDe(shellText, "catalogueCtx");
  const mute = shellText.replace(corps, corps.replace("document: state.document,", ""));
  assert.notEqual(mute, shellText, "témoin : la mutation a trouvé sa cible");
  assert.deepEqual(fautesDuCtx(mute), ["catalogueCtx ne porte pas le document"]);
});
