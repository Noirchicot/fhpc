/* ══ LOT 191 — JAMAIS UN ID NU ═══════════════════════════════════════════════
   Un choix dont le record n'est plus dans la pile montée ne s'affiche JAMAIS
   par son identifiant : il se nomme, et il dit pourquoi il ne se résout pas.

   📏 LE DÉFAUT, VU EN LIGNE (v614) LE 2026-09-09 : le personnage de test d'Eric
   est un Araag (espèce Fate's Hand). Fate's Hand éteint depuis `Layers`,
   l'écran Species affichait

       fh:species:en:araag
       Granted automatically
       This step is settled. Change your mind if you want to start it over.

   ⛔ Un id nu, et un « settled » faux. C'est le défaut du lot 181 (la gemme
   `fh:gem:en:azurite`), réparé alors dans UN écran ; huit autres écrans
   portaient la même copie du même repli (`view.record.name : id`).

   🔴 CE QUE LE MOTEUR FAISAIT VRAIMENT, MESURÉ AVANT D'ÉCRIRE : `derive.mjs`
   lisait l'espèce par `must`, donc un Araag en pile SRD faisait JETER la
   dérivation — `validate()` ne tournait jamais, et `choice.ref-missing`
   n'était nommé nulle part pour ce choix-là (le lot 188 n'avait ouvert
   `maybe` que pour les refs tendus aux modules). La coquille rattrapait
   l'erreur, projetait le carnet sans dériver, et l'écran Species se
   dessinait comme si tout allait bien. Ce fichier commence donc par le
   moteur : il ne jette plus, il nomme.

   ⚠️ LES PHRASES DE JOUEUR SONT DES BROUILLONS EN ATTENTE D'ERIC — ce garde
   lit ce qu'elles PORTENT (le nom, la cause, la sortie), jamais leur
   ponctuation.

   ⚔️ LE PIÈGE DE L'INCLUSION (`TRAPS.md`, « un identifiant qui en contient un
   autre ») : on cherche l'id COMPLET avec ses deux-points, jamais « araag »
   seul — le nom « Araag » est une sous-chaîne LÉGITIME de l'écran. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { makeHarness, manifestOf, SRD_EN } from "./build-harness.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";
import { createFhDestinyStat } from "../src/modules/fh/destiny-stat.mjs";
import { createFhSkillPoolStat } from "../src/modules/fh/skill-pool.mjs";
import { createFhSpeciesTraits } from "../src/modules/fh/species-traits.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

/* `universe-step.mjs` (atteint par `ecran-mort.mjs`) lit `document` au
   montage — même préparation que `tests/ecran-mort-qui-nomme.test.mjs`. */
globalThis.document = createTestDocument();

const { motDuChoix, motDUnRecordAbsent, motHumainDeLId, MOT_HORS_PILE } = await import("../ui/builder/mot-du-choix.mjs");
const { coucheDUnId, interrupteurDUnId, COUCHE_PAR_ID } = await import("../ui/builder/interrupteurs.mjs");
const { FH_LAYER_IDS } = await import("../ui/builder/universe-step.mjs");
const fsSync = await import("../ui/builder/engine.mjs");
const { itemsDeLEtape, etapeAchevee, refusDuDone, refsMortsDeLEtape, estConfirme } = await import("../ui/builder/parcours.mjs");
const { renderGuideSpecifique } = await import("../ui/builder/parcours-ecrans.mjs");
const { motDesChoixNonResolus } = await import("../ui/builder/ecran-mort.mjs");
const { renderReviewStep, etapeFaite } = await import("../ui/builder/review-step.mjs");
const { renderEquipmentStep } = await import("../ui/builder/equipment-step.mjs");
const { decisionRefusalWord } = await import("../ui/builder/carnet.mjs");
const { SPECIES_CATALOGUE } = await import("../ui/builder/species-step.mjs");

const ARAAG = "fh:species:en:araag";
const AUSPICIOUS = "fh:feat:en:auspicious";
const LANGUE_ELF = "fh:training:en:language-elf";
const LANGUE_HUMAN = "fh:training:en:language-human";
const FIGHTER = "srd:class:en:fighter";

const MODULES = () => [createFhDestinyStat(), createFhSkillPoolStat(), createFhSpeciesTraits()];

/* ── LES DEUX PILES RÉELLES, ET UNE TROISIÈME : FATE'S HAND SANS TRAININGS ──
   ⛔ Aucune liste de couches écrite ici : `PILE` est celle de l'exemple, et
   la pile amputée en RETIRE une (le geste de l'interrupteur `Trainings`). */
const SRD = makeHarness({ layers: [SRD_EN], modules: MODULES() });
const FH = makeHarness({ layers: PILE, modules: MODULES() });
const FH_SANS_TRAININGS = makeHarness({ layers: PILE.filter((f) => !f.includes("fh-trainings-en")), modules: MODULES() });

/** Le personnage d'Eric, réduit à ce qui compte : un Araag, un don FH, deux
 *  langues FH, une classe SRD — et ses signatures, comme s'il avait fini. */
function personnage(h, { confirmed = ["species", "background", "background.languages", "background.originFeat[0]"] } = {}) {
  return {
    schema: "fh-char/1", id: "araag-191", name: "Kessa", lang: "en",
    units: { distance: "ft", weight: "lb" },
    generator: { name: "tests/jamais-un-id-nu", version: "1.0.0" },
    created: "2026-09-09T00:00:00Z", modified: "2026-09-09T00:00:00Z",
    build: {
      layers: manifestOf(h.layers),
      choices: [
        { path: "level", value: 1 },
        { path: "class", ref: { kind: "class", id: FIGHTER } },
        { path: "species", ref: { kind: "species", id: ARAAG } },
        { path: "background.originFeat[0]", ref: { kind: "feat", id: AUSPICIOUS } },
        { path: "background.languages[0]", ref: { kind: "training", id: LANGUE_ELF } },
        { path: "background.languages[1]", ref: { kind: "training", id: LANGUE_HUMAN } },
        ...["str", "dex", "con", "int", "wis", "cha"].map((k) => ({ path: `abilities.${k}`, value: 12 }))
      ],
      budgets: {}, overrides: [], confirmed
    }
  };
}

/** Reconstruit et valide — ce que la coquille fait à chaque `rebuild()`. */
function monter(h, doc) {
  const report = h.verbs.rebuild({ document: doc });
  const violations = h.verbs.validate({ document: report.document }).violations || [];
  return { report, document: report.document, decisions: report.decisions, resolved: report.resolved, violations, query: h.layers.verbs.query };
}

/** LE GUIDE D'UNE ÉTAPE, COMPOSÉ COMME `renderParcoursGuide` (shell.mjs) le
 *  compose — titre, items, `acheve`, `manque`. La coquille n'a pas de harnais
 *  de rendu ; ce qu'elle passe est gardé sur ses octets plus bas (§ E), et ce
 *  qu'elle rend est prouvé ici sur les organes qu'elle appelle. */
function guideDe(cfg, etat) {
  const plan = etat.decisions.find((d) => d && d.path === cfg.path);
  const retenu = plan && Array.isArray(plan.selected) ? plan.selected[0] : null;
  const morts = refsMortsDeLEtape({ violations: etat.violations, racine: cfg.path });
  return renderGuideSpecifique({
    racine: cfg.path,
    titre: motDuChoix(etat.query, cfg.kind, retenu) || cfg.label,
    texte: "Guide text.",
    items: itemsDeLEtape({ decisions: etat.decisions, document: etat.document, racine: cfg.path }),
    labelOf: (item) => (cfg.itemLabel ? cfg.itemLabel(item.path, { ...etat }) : item.path),
    acheve: etapeAchevee({ decisions: etat.decisions, document: etat.document, racine: cfg.path, violations: etat.violations }),
    conclu: estConfirme(etat.document, cfg.path),
    manque: motDesChoixNonResolus(morts),
    onAction: () => {}
  });
}

/** ⛔ L'assertion du lot, en un seul endroit : l'id COMPLET n'est nulle part. */
function aucunIdNu(texte, ...ids) {
  for (const id of ids) {
    assert.equal(texte.includes(id), false, `⛔ un id nu à l'écran : « ${id} » dans « ${texte.slice(0, 200)}… »`);
  }
}

/* ══ A — LE MOTEUR : IL NE JETTE PLUS, IL NOMME ═══════════════════════════ */

test("A1 — ⚔️ un Araag en pile SRD ne fait plus JETER la dérivation — `validate()` NOMME les trois refs morts", () => {
  let etat;
  assert.doesNotThrow(() => { etat = monter(SRD, personnage(SRD)); },
    "⛔ c'est LE défaut mesuré : `reader.must` sur l'espèce jetait, et `validate` ne tournait jamais");
  assert.ok(etat.resolved, "le personnage dérive, dégradé");
  assert.equal(etat.resolved.identity.species, undefined, "…sans espèce : le manque est porté par la fiche");
  const morts = etat.violations.filter((v) => v.key === "choice.ref-missing").map((v) => v.path).sort();
  assert.deepEqual(morts, ["background.languages[0]", "background.languages[1]", "background.originFeat[0]", "species"],
    "les quatre refs Fate's Hand sont nommés, chacun par son chemin");
  /* ⚔️ le témoin inverse : la pile Fate's Hand résout tout, et ne refuse rien de tel */
  const entier = monter(FH, personnage(FH));
  assert.equal(entier.resolved.identity.species, "Araag");
  assert.deepEqual(entier.violations.filter((v) => v.key === "choice.ref-missing"), []);
});

/* ══ B — L'ORGANE UNIQUE : LE MOT D'UN CHOIX ══════════════════════════════ */

test("B1 — `motDuChoix` : le nom du record quand la pile le porte ; sinon le slug humanisé + L'INTERRUPTEUR qui le porte — jamais l'id, jamais « Fate's Hand » quand Lore suffit", () => {
  assert.equal(motDuChoix(FH.layers.verbs.query, "species", ARAAG), "Araag", "témoin : la pile FH nomme le record");
  const mot = motDuChoix(SRD.layers.verbs.query, "species", ARAAG);
  /* ⚖️ Eric, 09/09, mot pour mot (ARCHITECTURE.md, « LES ESPÈCES FATE'S HAND SONT DU LORE ») */
  assert.equal(mot, "Araag comes with Lore — switch it on in Layers");
  aucunIdNu(mot, ARAAG);
  assert.equal(mot.includes("Fate's Hand"), false, "⛔ jamais « Fate's Hand » en général quand un interrupteur précis suffit");
  assert.equal(motDuChoix(SRD.layers.verbs.query, "species", null), "", "sans id, rien à nommer — le libellé de l'étape prend");
  assert.equal(motHumainDeLId(LANGUE_ELF), "Language elf", "un slug à tiret devient des mots");
  assert.equal(motHumainDeLId("stealth"), "Stealth", "un slug sans deux-points passe tel quel, capitalisé");
  /* Chaque record nomme SON interrupteur : le don → Destiny, la langue → Trainings. */
  assert.equal(motDUnRecordAbsent(AUSPICIOUS), "Auspicious comes with Destiny — switch it on in Layers");
  assert.equal(motDUnRecordAbsent(LANGUE_ELF), "Language elf comes with Trainings — switch it on in Layers");
  /* Une gemme n'a pas d'enfant : le catalogue suit le maître, et c'est lui qu'on nomme. */
  assert.equal(motDUnRecordAbsent("fh:gem:en:azurite"), "Azurite comes with Fate's Hand — switch it on in Layers");
  /* Un préfixe que personne ne connaît : le dernier recours, et il ne ment pas sur l'interrupteur. */
  assert.equal(motDUnRecordAbsent("homebrew:feat:en:x"), `X — ${MOT_HORS_PILE}`);
});

test("B2 — le mot d'un VERROU du carnet ne porte plus l'id, et nomme l'interrupteur : « “Araag” isn't on the catalogue: it comes with Lore »", () => {
  const mot = decisionRefusalWord({ key: "decision.option-unavailable", params: { path: "species", selected: ARAAG, options: "" } });
  aucunIdNu(mot, ARAAG);
  assert.match(mot, /Araag/);
  assert.match(mot, /comes with Lore/, "le verrou dit la même chose que le titre : quelle ligne de Layers pousser");
});

/* ══ B3 — L'INTERRUPTEUR D'UN ID : UN REPLI PAR PRÉFIXE, GARDÉ CONTRE LE DISQUE ══
   📏 Mesuré le 10/09 : le bloc `layers` n'expose aucun verbe qui dise d'où
   vient un id (`query` ne lit que le pli ACTIF ; `stack()` rend le manifeste
   sans les records ; `engine.mjs` jette les octets). L'organe se rabat donc
   sur le PRÉFIXE de l'id — et ce n'est pas une bijection : Soulforging ajoute
   un `fh:tool` et un `fh:spell`. Ce garde relit CHAQUE id ajouté par CHAQUE
   couche Fate's Hand sur le disque : une couche neuve, un préfixe neuf, un
   troisième id partagé → rouge. ⛔ Une liste d'exceptions par nom ne dit pas
   qu'elle est incomplète ; le disque, si. */
test("B3 — 📏 `coucheDUnId` rend, pour CHAQUE id que CHAQUE couche Fate's Hand AJOUTE sur le disque, cette couche-là — et le plancher rend null", () => {
  const { LAYER_FILES } = fsSync;
  const fautes = [];
  let comptes = 0;
  for (const f of LAYER_FILES) {
    const couche = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", f), "utf8"));
    const fh = FH_LAYER_IDS.includes(couche.id);
    for (const [genre, entries] of Object.entries(couche.records || {})) {
      /* Un rangement n'est jamais la cible d'un `ref` de choix, et `srfh:shelving`
         est ajouté par le plancher ET par les gemmes : hors du garde, et dit. */
      if (genre === "shelving") continue;
      for (const [id, entry] of Object.entries(entries)) {
        if (entry.op !== undefined && entry.op !== "add") continue;
        comptes += 1;
        const trouve = coucheDUnId(id);
        if (fh && trouve !== couche.id) fautes.push(`${id} → ${trouve} (ajouté par ${couche.id})`);
        if (!fh && trouve !== null) fautes.push(`${id} → ${trouve} (le plancher ${couche.id} n'a pas d'interrupteur)`);
      }
    }
  }
  assert.ok(comptes > 100, `témoin de portée : ${comptes} ids relus`);
  assert.deepEqual(fautes, [], "chaque id ajouté par une couche FH nomme sa couche");
  /* Les deux exceptions nommées existent bel et bien là où elles disent vivre. */
  for (const [id, couche] of Object.entries(COUCHE_PAR_ID)) {
    const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", `${couche}.layer.json`), "utf8"));
    const genre = id.split(":")[1];
    assert.ok(doc.records[genre] && doc.records[genre][id] && (doc.records[genre][id].op === undefined || doc.records[genre][id].op === "add"),
      `l'exception « ${id} » est bien AJOUTÉE par ${couche} — sinon elle est périmée`);
  }
  /* ⚔️ Le témoin qui accuse : sans les exceptions, le préfixe range l'outil
     Soulforge sous Skills & tools — c'est le mensonge que la table ferme. */
  assert.equal(interrupteurDUnId("fh:tool:en:soulforging").label, "Soulforging");
  assert.equal(interrupteurDUnId("fh:tool:en:smith-s-tools").label, "Skills & tools");
  assert.equal(interrupteurDUnId("srd:species:en:elf"), null, "le SRD n'a pas d'interrupteur : il est toujours là");
  assert.equal(interrupteurDUnId("xdmg:gem:en:obsidian").label, "Dungeon Master's Guide (2024)", "un livre du joueur se nomme par son titre");
});

/* ══ C — TROIS ÉCRANS, ET LE PIED QUI NE DIT PLUS « SETTLED » ═════════════ */

test("C1 — 🔴 SPECIES : l'Araag en pile SRD se NOMME, dit pourquoi il ne se résout pas, et l'étape n'est PAS « settled »", () => {
  const etat = monter(SRD, personnage(SRD));
  assert.ok(estConfirme(etat.document, "species"), "témoin : l'étape est SIGNÉE — c'est la signature qui faisait dire « settled »");
  const texte = guideDe(SPECIES_CATALOGUE, etat).textContent;
  aucunIdNu(texte, ARAAG);
  assert.match(texte, /Araag/, "le nom humanisé est à l'écran");
  assert.equal(/settled/i.test(texte), false, "⛔ « settled » ne se dit pas d'un choix non résolu");
  assert.match(texte, /Araag comes with Lore/, "la CAUSE nomme L'INTERRUPTEUR qui porte le record — Eric, 09/09");
  assert.equal(texte.includes("Fate's Hand"), false, "⛔ jamais « Fate's Hand » en général quand Lore suffit");
  assert.match(texte, /Layers/, "la SORTIE nomme l'écran de l'interrupteur…");
  assert.match(texte, /change your mind/, "…et le bouton de ce pied, mot pour mot");
  assert.match(texte, /Nothing you chose has been erased/, "et le personnage ne se dissocie pas (Eric, 09/09)");
  /* le juge du pied, isolé : `etapeAchevee` avec les refus retombe à faux */
  assert.equal(etapeAchevee({ decisions: etat.decisions, document: etat.document, racine: "species", violations: etat.violations }), false);
  assert.equal(etapeAchevee({ decisions: etat.decisions, document: etat.document, racine: "species" }), true,
    "témoin : SANS les refus, le même carnet dit « achevée » — c'est bien `validate()` qui tranche");
});

test("C1 bis — ⚔️ TÉMOIN INVERSE : la pile Fate's Hand montée, le même guide dit « Araag » et rien d'autre", () => {
  const etat = monter(FH, personnage(FH));
  const texte = guideDe(SPECIES_CATALOGUE, etat).textContent;
  assert.match(texte, /Araag/);
  assert.equal(texte.includes(MOT_HORS_PILE), false, "aucun refus : le record se résout");
  assert.deepEqual(refsMortsDeLEtape({ violations: etat.violations, racine: "species" }), []);
});

test("C2 — 🔴 BACKGROUND (SRD) avec un DON FH : le don se nomme dans le refus, l'étape n'est pas réglée", () => {
  const etat = monter(SRD, personnage(SRD));
  const morts = refsMortsDeLEtape({ violations: etat.violations, racine: "background" });
  assert.deepEqual(morts.map((m) => m.id).sort(), [AUSPICIOUS, LANGUE_ELF, LANGUE_HUMAN].sort(),
    "les trois refs FH sous `background` — le don ET les deux langues");
  const cfg = { path: "background", kind: "background", label: "Background", itemLabel: (chemin) => chemin };
  const texte = guideDe(cfg, etat).textContent;
  aucunIdNu(texte, AUSPICIOUS, LANGUE_ELF, LANGUE_HUMAN);
  assert.match(texte, /Auspicious comes with Destiny/, "le don se nomme, avec SON interrupteur");
  assert.match(texte, /Language elf and Language human come with Trainings/, "…et les langues avec le LEUR — groupées par interrupteur");
  assert.equal(/settled/i.test(texte), false);
  /* et le `Done` REFUSE, en nommant les non-résolus à côté des items */
  const refus = refusDuDone({ decisions: etat.decisions, document: etat.document, racine: "background", violations: etat.violations });
  assert.ok(refus && refus.nonResolus.length === 3, "le Done refuse à cause des refs morts");
});

test("C3 — 🔴 INHERITANCE (Fate's Hand, Trainings coupé) : les deux langues se nomment, le cadre garde son nom", () => {
  const etat = monter(FH_SANS_TRAININGS, personnage(FH_SANS_TRAININGS));
  assert.equal(etat.query({ kind: "training" }).length, 0, "témoin : plus aucun training sur cette pile");
  const morts = refsMortsDeLEtape({ violations: etat.violations, racine: "background" });
  assert.deepEqual(morts.map((m) => m.path), ["background.languages[0]", "background.languages[1]"]);
  const cfg = { path: "background", kind: "background", label: "Inheritance", itemLabel: (chemin) => chemin };
  const texte = guideDe(cfg, etat).textContent;
  aucunIdNu(texte, LANGUE_ELF, LANGUE_HUMAN);
  assert.match(texte, /Language elf and Language human come with Trainings/, "deux noms, un sujet pluriel, l'interrupteur qui les porte");
  assert.match(texte, /switch them on/, "…et la sortie s'accorde");
  assert.equal(/settled/i.test(texte), false);
  /* ⚔️ le témoin : Trainings rallumé, plus rien à dire */
  const entier = monter(FH, personnage(FH));
  assert.equal(motDesChoixNonResolus(refsMortsDeLEtape({ violations: entier.violations, racine: "background" })), null);
});

test("C4 — un JETON ou une PORTE dont le record manque passe par le même organe (le glisser et les portes lisent `motDuChoix`)", () => {
  /* Les libellés des jetons (`labelOf`) sont composés par chaque écran — ce
     garde vérifie l'ORGANE qu'ils appellent : le seul repli possible est le mot
     de l'organe, et il n'est jamais l'id. */
  const q = SRD.layers.verbs.query;
  for (const [kind, id, sw] of [["feat", AUSPICIOUS, "Destiny"], ["training", LANGUE_ELF, "Trainings"], ["species", ARAAG, "Lore"]]) {
    const mot = motDuChoix(q, kind, id);
    aucunIdNu(mot, id);
    assert.ok(mot.endsWith(`comes with ${sw} — switch it on in Layers`), `${id} nomme ${sw} : ${mot}`);
  }
});

/* ══ D — LE SHEET ET L'ÉQUIPEMENT ═════════════════════════════════════════ */

test("D1 — 🔴 LE SHEET : la ligne Species dit « Araag comes with Lore » et n'est pas « done » ; aucun id nu", () => {
  const etat = monter(SRD, personnage(SRD));
  const node = renderReviewStep({ document: etat.document, resolved: etat.resolved, decisions: etat.decisions, report: etat.report, violations: etat.violations }, () => {});
  const texte = node.textContent;
  aucunIdNu(texte, ARAAG, AUSPICIOUS, LANGUE_ELF, LANGUE_HUMAN);
  const ligne = node.querySelector('.review-line[data-step="species"]');
  assert.ok(ligne, "la ligne Species existe");
  assert.equal(ligne.dataset.done, "false", "⛔ elle disait « done » : le plan a une réponse, c'est le record qui manque");
  assert.match(ligne.textContent, /Araag comes with Lore — switch it on in Layers/);
  assert.equal(etapeFaite({ decisions: etat.decisions, document: etat.document, resolved: etat.resolved, violations: etat.violations }, "species"), false,
    "le juge du belt lit les mêmes refus");
  /* témoin : la pile FH montée, la ligne ne porte plus le refus */
  const entier = monter(FH, personnage(FH));
  const nodeFh = renderReviewStep({ document: entier.document, resolved: entier.resolved, decisions: entier.decisions, report: entier.report, violations: entier.violations }, () => {});
  assert.equal(/comes with|not in this ruleset/.test(nodeFh.querySelector('.review-line[data-step="species"]').textContent), false);
  assert.match(nodeFh.querySelector(".review-name").textContent, /Araag/, "et l'identité nomme l'espèce");
});

test("D2 — ÉQUIPEMENT : une ligne dont le record manque porte le mot de l'organe, jamais `ref.id` (le repli du lot 181 est parti)", () => {
  const doc = { build: { choices: [
    { path: "gear[0]", ref: { kind: "gem", id: "fh:gem:en:nulle-part" } },
    { path: "gear[0].quantity", value: 1 },
    { path: "gear[0].location", value: "backpack" }
  ] } };
  const node = renderEquipmentStep({ document: doc, resolved: null, query: SRD.layers.verbs.query, search: true }, () => {});
  const texte = node.textContent || "";
  aucunIdNu(texte, "fh:gem:en:nulle-part");
  /* Une gemme est du catalogue : pas d'enfant, c'est le maître qu'on nomme. */
  assert.match(texte, /Nulle part comes with Fate's Hand — switch it on in Layers/);
});

/* ══ E — LA COQUILLE, SUR SES OCTETS (elle n'a pas de harnais de rendu) ═══ */

test("E1 — 🔌 `shell.mjs` passe `violations` au juge du pied et au belt, pose `manque`, et ne connaît plus `recordName`", () => {
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  assert.equal(/\brecordName\b/.test(shell), false, "⛔ `recordName` rendait l'id nu — il n'existe plus");
  assert.match(shell, /import \{ motDuChoix, motDUnRecordAbsent \} from "\.\/mot-du-choix\.mjs\?v=\d+"/);
  assert.match(shell, /return motDuChoix\(ctx\.query, cfg\.kind, resolvedRefId\(cfg\)\) \|\| cfg\.label/, "le titre du parcours passe par l'organe");
  assert.match(shell, /acheve: etapeAchevee\(\{[^}]*violations: state\.violations/, "le pied du guide lit `validate()`");
  assert.match(shell, /manque: motDesChoixNonResolus\(nonResolus\)/, "et la bande dit pourquoi");
  assert.match(shell, /refsMortsDeLEtape\(\{ violations: state\.violations, racine: chapitre\.path \}\)\.length > 0/, "la lumière du belt aussi");
  assert.match(shell, /const nom = \(id\) => motDuChoix\(ctx\.query, "training", id\)/, "les langues de l'Héritage, au jeton");
});

test("E2 — 🧩 UN SEUL ORGANE : aucun écran de `ui/builder/` ne recopie le repli « le nom du record, sinon l'id »", () => {
  /* ⚠️ Ce garde lit une FORME, et il le dit : il est le second témoin, pas le
     premier — les rendus ci-dessus accusent sur la DONNÉE. Il existe parce que
     la forme recopiée est EXACTEMENT ce que le lot 191 a trouvé neuf fois. */
  const formes = [/\.record\.name : id\b/, /\.record\.name\) \|\| id\b/, /\|\| l\.ref\.id\b/, /\? view\.record\.name : plan\.options\[0\]/];
  for (const f of fs.readdirSync(UI).filter((n) => n.endsWith(".mjs"))) {
    const texte = stripComments(fs.readFileSync(path.join(UI, f), "utf8"));
    for (const forme of formes) assert.equal(forme.test(texte), false, `${f} recopie le repli sur l'id (${forme})`);
  }
  /* et l'organe, lui, ne lit qu'UNE feuille — la table des interrupteurs, qui
     n'importe rien — c'est ce qui lui permet de servir `carnet.mjs` comme
     `catalogue.mjs` sans cycle */
  const organe = stripComments(fs.readFileSync(path.join(UI, "mot-du-choix.mjs"), "utf8"));
  const imports = [...organe.matchAll(/^\s*import\b[^"]*"([^"]+)"/gm)].map((m) => m[1].replace(/\?v=\d+$/, ""));
  assert.deepEqual(imports, ["./interrupteurs.mjs"], "`mot-du-choix.mjs` n'importe que la feuille des interrupteurs");
  const feuille = stripComments(fs.readFileSync(path.join(UI, "interrupteurs.mjs"), "utf8"));
  assert.equal(/^\s*import\b/m.test(feuille), false, "…et `interrupteurs.mjs` n'importe rien : c'est une feuille");
});

/* ══ F — ⚔️ LES MUTATIONS : chaque garde a été vu ROUGE ═══════════════════ */

test("F1 — ⚔️ remettre `ref.id` dans le titre de Species fait rougir `aucunIdNu` ; remettre « settled » sans `manque` fait rougir le garde du pied", () => {
  const etat = monter(SRD, personnage(SRD));
  const plan = etat.decisions.find((d) => d.path === "species");
  /* la mutation ① : le titre d'avant le lot — l'id nu */
  const mute = renderGuideSpecifique({
    racine: "species", titre: plan.selected[0], texte: "Guide text.",
    items: [], acheve: true, conclu: true, manque: null, onAction: () => {}
  }).textContent;
  assert.throws(() => aucunIdNu(mute, ARAAG), /un id nu à l'écran/, "le garde accuse l'id");
  /* la mutation ② : le pied d'avant le lot — « settled » sur un choix non résolu */
  assert.match(mute, /settled/i, "sans `manque` et avec `acheve`, la bande redit « settled » — c'est ce que le garde C1 refuse");
  /* la mutation ③ : `etapeAchevee` privé des refus redit « achevée » — C1 le tient en témoin */
  assert.equal(etapeAchevee({ decisions: etat.decisions, document: etat.document, racine: "species" }), true);
});
