/* ══ LOT 198 — UN PERSONNAGE NEUF SE CONSTRUIT DE BOUT EN BOUT ══════════════

   ⚖️ Eric, 2026-09-10, sur v621 : *« Fais en sorte que ça soit à zéro à la
   création d'un nouveau. Fais ce qu'il faut pour que le Next mène sur le
   chapitre suivant de manière fluide. Il manque encore Équipement. Réécris
   plutôt que faire des pirouettes. »*

   📏 CE QUI ÉTAIT MESURÉ SUR v621 (pile SRD, personnage neuf, au navigateur) :
   Identity ✅ · Species ✅ · Background ✅ · Class ✅ · **Abilities, Equipment,
   Sheet : écran mort, pour toujours**. Trois causes, une chaîne :
     1. `level` n'était écrit par AUCUN écran — seul le générateur d'exemple le
        posait, et la page partait autrefois d'un exemple complet.
     2. `derive` exige `level`, `class` et les six `abilities.*`.
     3. La coquille tuait six écrans PAR NOM dès que la dérivation refusait —
        dont Abilities, l'écran qui POSE les scores. Le cercle.

   ⭐ LES TROIS RÉPONSES, ET CHACUNE A SON GARDE ICI :
     A. un personnage naît au niveau 1, dans `composer` (writers.mjs), un seul
        écrivain — l'exemple passe par lui ;
     B. le cran DÉCLARE ce qu'il lit (`lit`, etapes.mjs), la coquille tend
        les faits ; plus de liste par nom ;
     C. l'écran mort NOMME la cause et la sortie depuis la DONNÉE (classe,
        scores, niveau — chacun son cran).

   ⚖️ PUIS LA RÈGLE D'ERIC, ARRIVÉE APRÈS LE MANDAT (10/09), devant un premier
   passage qui faisait déclarer TROIS crans (Skills lisait la fiche, Equipment
   la classe, Sheet la fiche) : *« Ce que tu crées dans Sheet est un précurseur
   de la fiche, non ? Pourquoi ne pas dériver tous ces éléments dans le bilan
   de Sheet ? »* — formulée par l'archi : **les chapitres travaillent sur les
   choix ; un seul chapitre déduit : Sheet.** D'où B et D réécrits : UN SEUL
   déclarant, `review` ; Skills VIT sans fiche et NOMME (les mots de l'écran
   mort, un seul écrivain) ; Equipment VIT sans classe et sa bourse NOMME
   (complète, ou nommée, jamais tronquée). Mentir n'est pas permis, tuer non
   plus.

   ⚔️ CHAQUE GARDE A ÉTÉ VU ROUGE : en retirant le niveau du composeur (A), en
   remettant `lit: "fiche"` sur Skills (B1, et le garde central B5), en
   recopiant la phrase dans skills-step au lieu de l'importer (B6), en
   rendant à `orDuDepart` son total sans classe (B7, E2), en faisant rendre
   `MOT_SANS_RAISON` sur un document sans scores (C), en remettant l'ancienne
   liste dans `shell.mjs` (D1). Le détail est dans le rapport du lot. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { makeHarness, manifestOf, readJson, PILE_SRD, uneCouche, ampute } from "./build-harness.mjs";
import { createDocWriters, CHOIX_DE_NAISSANCE, NIVEAU_DE_NAISSANCE } from "../src/doc/index.mjs";
import { ABILITY_KEYS, CURRENCY_KEYS } from "../src/build/index.mjs";
import { PILE as PILE_FH, exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { createFhDestinyStat } from "../src/modules/fh/destiny-stat.mjs";
import { createFhSkillPoolStat } from "../src/modules/fh/skill-pool.mjs";
import { createFhSpeciesTraits } from "../src/modules/fh/species-traits.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
globalThis.document = createTestDocument();
const { STEPS, LECTURES, ceinture, manqueDuCran } = await import("../ui/builder/etapes.mjs");
const {
  motDeLEcranMort, choixExigesManquants, motDuManque, motDuCran,
  MOT_SANS_RAISON, MOT_SANS_CLASSE, MOT_SANS_NIVEAU, MOT_PILE_INCONNUE
} = await import("../ui/builder/ecran-mort.mjs");
const { renderAbilitiesStep } = await import("../ui/builder/abilities-step.mjs");
const { renderEquipmentStep, orDuDepart, motDeLaBourse, equipmentValidate, rayonsEtEtageres } = await import("../ui/builder/equipment-step.mjs");
const { renderInheritanceStep } = await import("../ui/builder/inheritance-step.mjs");
const { renderDestinyStep } = await import("../ui/builder/destiny-step.mjs");
const { renderReviewStep } = await import("../ui/builder/review-step.mjs");
const { renderSkillsStep } = await import("../ui/builder/skills-step.mjs");

/* ── LES DEUX PILES DU JOUEUR, AVEC LES MODULES QUE LA PAGE MONTE ─────────
   `engine.mjs` monte les trois modules quelle que soit la pile ; un harnais
   sans eux mesurerait un pli que personne n'a. `PILE_SRD` et `PILE_FH` sont
   LUES (build-harness, exemple-fh-en), jamais recopiées. */
const modules = () => [createFhDestinyStat(), createFhSkillPoolStat(), createFhSpeciesTraits()];
const PILES = {
  SRD: makeHarness({ layers: PILE_SRD, modules: modules() }),
  FH: makeHarness({ layers: PILE_FH, modules: modules() })
};
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
const FT_LB = { distance: "ft", weight: "lb" };
const CLASSE = { path: "class", ref: { kind: "class", id: "srd:class:en:barbarian" } };
const SIX = ABILITY_KEYS.map((clef) => ({ path: `abilities.${clef}`, value: 12 }));

/** Le personnage tel que `Build a character` le fait naître — par l'écrivain
 *  réel, sur la pile réelle. */
function neuf(H, id) {
  return writers.composer({ name: "Name character", lang: "en", units: FT_LB, layers: manifestOf(H.layers), id, at: "2026-09-10T00:00:00Z" });
}
const avec = (doc, choices) => ({ ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...choices] } });

/* ══ A — UN PERSONNAGE NAÎT AU NIVEAU 1, ET IL DÉRIVE DÈS QU'IL A SA CLASSE ET
   SES SCORES, DANS LES DEUX PILES ═══════════════════════════════════════════ */

test("A1 — 🌱 `composer` fait naître le niveau, et rien d'autre", () => {
  const doc = neuf(PILES.SRD, "a1");
  assert.deepEqual(doc.build.choices, [{ path: "level", value: NIVEAU_DE_NAISSANCE, label: `Level ${NIVEAU_DE_NAISSANCE}` }],
    "le seul choix d'un document neuf est son niveau de naissance");
  assert.equal(NIVEAU_DE_NAISSANCE, 1, "un personnage naît au niveau 1 — Eric, 10/09 : « à zéro à la création »");
  assert.deepEqual(doc.build.choices, [...CHOIX_DE_NAISSANCE].map((c) => ({ ...c })),
    "et c'est la constante exportée qu'il clone — un garde la lit, il ne la recopie pas");
  /* ⚔️ le clone est un clone : muter le document ne mute pas la naissance */
  doc.build.choices[0].value = 7;
  assert.equal(CHOIX_DE_NAISSANCE[0].value, NIVEAU_DE_NAISSANCE);
});

for (const [nom, H] of Object.entries(PILES)) {
  test(`A2 — 🔴 pile ${nom} : composer + classe + six scores → \`rebuild\` DÉRIVE au niveau de naissance`, () => {
    const doc = avec(neuf(H, `a2-${nom}`), [CLASSE, ...SIX]);
    const out = H.verbs.rebuild({ document: doc });
    assert.equal(out.resolved.identity.level, NIVEAU_DE_NAISSANCE);
    assert.equal(out.resolved.identity.classes[0].name, "Barbarian");
    /* ⚔️ LE TÉMOIN : le MÊME document sans son niveau ne dérive pas — c'est
       exactement v621, et c'est ce qui prouve que le niveau vient du composeur. */
    const sansNiveau = { ...doc, build: { ...doc.build, choices: doc.build.choices.filter((c) => c.path !== "level") } };
    assert.throws(() => H.verbs.rebuild({ document: sansNiveau }),
      (e) => e.name === "BuildError" && /aucun choix `level`/.test(e.message),
      "témoin : sans le niveau de naissance, le refus de v621 revient");
  });
}

test("A3 — 🔴 UN SEUL ÉCRIVAIN DU NIVEAU : l'exemple naît de `composer`, et il ne l'écrit plus lui-même", () => {
  const { document } = exempleFhEn();
  assert.deepEqual(document.build.choices[0], { ...CHOIX_DE_NAISSANCE[0] },
    "le premier choix de l'exemple EST le choix de naissance, à l'octet");
  assert.equal(document.build.choices.filter((c) => c.path === "level").length, 1, "et un seul");
  /* ⚠️ GARDE SUR LA FORME, ET C'EST DIT : ce que ce garde tient est qu'il
     n'existe plus qu'UN écrivain de `{ path: "level" }` — un second, même
     d'accord aujourd'hui, divergerait en silence. Les deux sources sont lues
     sans leurs commentaires : un commentaire qui cite le chemin n'écrit rien. */
  const exemple = stripComments(fs.readFileSync(path.join(ROOT, "src", "tools", "exemple-fh-en.mjs"), "utf8"));
  assert.doesNotMatch(exemple, /path:\s*"level"/, "⛔ l'exemple écrivait `{ path: \"level\" }` — deux écrivains");
  assert.match(exemple, /writers\.composer\(\{/, "il passe par `composer`");
  const writersSrc = stripComments(fs.readFileSync(path.join(ROOT, "src", "doc", "writers.mjs"), "utf8"));
  assert.match(writersSrc, /choices:\s*structuredClone\(CHOIX_DE_NAISSANCE\)/, "et `composer` clone la naissance");
  const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));
  assert.doesNotMatch(shell, /path:\s*"level"/, "⛔ la coquille non plus n'écrit pas le niveau");
});

/* ══ B — UN SEUL CRAN DÉCLARE : SHEET ; TOUT LE RESTE VIT, ET NOMME ═══════ */

test("B1 — 🔴 UN SEUL CRAN DÉCLARE UNE LECTURE, ET C'EST SHEET — sur la donnée : `STEPS.filter(lit)`", () => {
  const declarants = STEPS.filter((s) => s.lit);
  assert.deepEqual(declarants.map((s) => s.id), ["review"],
    "⛔ un second déclarant est un chapitre qui meurt de ce qu'il ne déduit pas — Eric, 10/09 : un seul chapitre déduit, Sheet");
  assert.equal(declarants[0].lit, "fiche");
  assert.deepEqual(Object.keys(LECTURES), ["fiche"], "une seule lecture : la fiche (« classe » du premier passage est partie avec son déclarant)");
  /* tout le reste vit sans fiche — Abilities en tête, l'écran qui POSE les scores */
  const faitsDuNeuf = { derivable: false };
  const vivants = STEPS.filter((s) => manqueDuCran(s, faitsDuNeuf) === null).map((s) => s.id);
  assert.deepEqual(vivants, STEPS.map((s) => s.id).filter((id) => id !== "review"));
  assert.equal(manqueDuCran(declarants[0], faitsDuNeuf), "fiche", "Sheet, lui, manque de la fiche");
  assert.equal(manqueDuCran(declarants[0], { derivable: true }), null, "…et vit dès qu'elle existe");
  /* une lecture inconnue jette, sinon l'écran ne mourrait jamais, en silence */
  assert.throws(() => manqueDuCran({ id: "x", lit: "scores" }, faitsDuNeuf), /lecture inconnue « scores »/);
  assert.throws(() => manqueDuCran({ id: "x", lit: "classe" }, faitsDuNeuf), /lecture inconnue « classe »/, "⛔ « classe » est revenue dans LECTURES");
});

test("B2 — 📏 LES DEUX MESURES DU PREMIER PASSAGE RESTENT VRAIES, LEUR CONCLUSION NON : le pool est dérivé, l'or de classe vient de la classe — et ni l'un ni l'autre ne tue", () => {
  const H = PILES.FH;
  const doc = neuf(H, "b2");
  const Q = H.layers.verbs.query;
  /* la mesure : sans fiche il n'y a pas de stat `fh:skill-points` ; sans
     classe, la source de classe est muette et l'Inheritance seule offrirait
     50 PO — la bourse tronquée */
  const or = orDuDepart({ query: Q, document: doc });
  assert.equal(or.sources.find((s) => s.genre === "class").cout, null, "témoin : sans classe, la source de classe est muette");
  assert.ok(or.sources.find((s) => s.genre === "background").cout.gp > 0, "témoin : l'Inheritance seule offrirait un montant…");
  assert.equal(or.cout, null, "⛔ …et ce montant N'EST PAS offert : une bourse sans l'or de la classe est tronquée");
  assert.equal(or.sansClasse, true, "la raison est nommée à l'écran : pas la donnée, la classe");
  /* la conclusion : aucun des deux crans ne déclare */
  assert.equal(STEPS.find((s) => s.id === "skills").lit, undefined, "⛔ Skills déclare une lecture : il mourrait sans fiche");
  assert.equal(STEPS.find((s) => s.id === "equipment").lit, undefined, "⛔ Equipment déclare une lecture : il mourrait sans classe");
  assert.equal(STEPS.find((s) => s.id === "review").lit, "fiche", "Sheet vérifie et exporte la fiche : il la lit");
});

for (const [nom, H] of Object.entries(PILES)) {
  test(`B3 — 🔴 pile ${nom} : sur un personnage neuf DÉRIVABLE, aucun cran de la ceinture n'est mort, et chaque écran rend sans le mot du refus`, () => {
    const doc = avec(neuf(H, `b3-${nom}`), [CLASSE, ...SIX]);
    const out = H.verbs.rebuild({ document: doc });
    const faits = { derivable: true };
    const crans = ceinture([...H.layers.verbs.flags()]);
    assert.ok(crans.length >= 8, `témoin : la ceinture ${nom} a ses crans (${crans.length})`);
    for (const cran of crans) {
      assert.equal(manqueDuCran(STEPS[cran.rang], faits), null, `le cran ${cran.mot} vit`);
    }
    /* et les six écrans de l'ancienne liste rendent avec la fiche réelle, sans
       jeter et sans porter un refus — ni le mot du manque (la fiche est là) */
    const Q = H.layers.verbs.query;
    const ctx = { document: out.document, resolved: out.resolved, decisions: out.decisions, query: Q, report: out, violations: [] };
    const rendus = {
      abilities: () => renderAbilitiesStep({ ...ctx, rollBatch: null, revele: 0, method: null, palier: 1, bilan: false }, () => {}),
      background: () => renderInheritanceStep({ ...ctx, open: null }, () => {}),
      destiny: () => renderDestinyStep({ ...ctx, phase: "porte", drawnId: null, signe: false }, () => {}),
      skills: () => renderSkillsStep({ ...ctx, cursor: 0, signe: false }, () => {}),
      equipment: () => renderEquipmentStep(ctx, () => {}),
      review: () => renderReviewStep(ctx, () => {})
    };
    for (const [id, rendre] of Object.entries(rendus)) {
      const node = rendre();
      assert.ok(node && node.textContent.length > 0, `${id} rend quelque chose`);
      for (const mot of [MOT_SANS_RAISON, MOT_SANS_CLASSE, MOT_SANS_NIVEAU, MOT_PILE_INCONNUE]) {
        assert.ok(!node.textContent.includes(mot), `${id} ne porte pas le refus`);
      }
      assert.ok(!node.textContent.includes("there is no sheet"), `${id} ne nomme aucun manque : la fiche est là`);
    }
  });
}

test("B4 — 🔴 ABILITIES REND SANS FICHE : le sélecteur des méthodes est là, la colonne finale absente, aucune exception", () => {
  for (const [nom, H] of Object.entries(PILES)) {
    const doc = neuf(H, `b4-${nom}`);
    let node;
    assert.doesNotThrow(() => {
      node = renderAbilitiesStep({ document: doc, resolved: null, rollBatch: null, revele: 0, method: null, palier: 1, bilan: false }, () => {});
    }, `pile ${nom} : l'écran ne jette pas sans fiche`);
    const tuiles = node.querySelectorAll(".ability-entry");
    assert.equal(tuiles.length, 4, `pile ${nom} : les quatre méthodes se choisissent`);
    assert.equal(node.querySelectorAll(".ability-row-final").length, 0, `pile ${nom} : pas de colonne finale sans fiche`);
    assert.ok(!node.textContent.includes(MOT_SANS_RAISON) && !node.textContent.includes(MOT_SANS_CLASSE));
  }
});

/* ── LE GARDE CENTRAL DU LOT ── */
for (const [nom, H] of Object.entries(PILES)) {
  test(`B5 — 🔴 pile ${nom} : sur un personnage NEUF, sans classe ni scores, AUCUN cran de la ceinture n'est mort — sauf Sheet, qui nomme`, () => {
    const doc = neuf(H, `b5-${nom}`);
    const faits = { derivable: false };
    const crans = ceinture([...H.layers.verbs.flags()]);
    const morts = crans.filter((cran) => manqueDuCran(STEPS[cran.rang], faits) !== null).map((cran) => cran.id);
    assert.deepEqual(morts, ["review"], `⛔ un cran mort sur un personnage neuf, hors Sheet : ${morts.join(", ")}`);
    /* Sheet nomme — la cause ET les deux crans, un seul voyage (C1) */
    const mot = motDeLEcranMort(doc);
    assert.ok(mot.includes(motDuCran("class")) && mot.includes(motDuCran("abilities")), "Sheet nomme Class et Abilities");
    /* et chaque écran de l'ancienne liste REND sans fiche, sans jeter, sans le
       mot du refus de l'écran mort */
    const Q = H.layers.verbs.query;
    const decisions = H.verbs.decisions({ document: doc }).decisions || [];
    const ctx = { document: doc, resolved: null, decisions, query: Q, report: null, violations: [] };
    const rendus = {
      abilities: () => renderAbilitiesStep({ ...ctx, rollBatch: null, revele: 0, method: null, palier: 1, bilan: false }, () => {}),
      background: () => renderInheritanceStep({ ...ctx, open: null }, () => {}),
      destiny: () => renderDestinyStep({ ...ctx, phase: "porte", drawnId: null, signe: false }, () => {}),
      skills: () => renderSkillsStep({ ...ctx, cursor: 0, signe: false }, () => {}),
      equipment: () => renderEquipmentStep(ctx, () => {})
    };
    for (const [id, rendre] of Object.entries(rendus)) {
      let node;
      assert.doesNotThrow(() => { node = rendre(); }, `${id} ne jette pas sans fiche`);
      assert.ok(node && node.textContent.length > 0, `${id} rend quelque chose`);
      for (const mot of [MOT_SANS_RAISON, MOT_SANS_CLASSE, MOT_SANS_NIVEAU, MOT_PILE_INCONNUE]) {
        assert.ok(!node.textContent.includes(mot), `${id} ne porte pas le refus de l'écran mort`);
      }
    }
  });
}

test("B6 — 🔴 SKILLS SANS FICHE NOMME : le catalogue présent, le mot du manque présent — celui d'`ecran-mort.mjs`, pas une copie ; avec fiche, le pool présent et le mot absent", () => {
  const H = PILES.FH;
  const Q = H.layers.verbs.query;
  const catalogue = Q({ kind: "skill" }) || [];
  assert.ok(catalogue.length >= 18, `témoin : la pile porte les compétences (${catalogue.length})`);
  const rendre = (doc, resolved) => renderSkillsStep({ document: doc, resolved, decisions: H.verbs.decisions({ document: doc }).decisions || [], violations: [], query: Q, cursor: 0, signe: false }, () => {});
  /* le personnage neuf : ni classe ni scores */
  const neufDoc = neuf(H, "b6");
  const sans = rendre(neufDoc, null);
  const lignes = [...sans.querySelectorAll(".skills-ligne[data-ligne]")].map((l) => l.dataset.ligne);
  const premierePage = catalogue.filter((v) => v.record.data && v.record.data.category === (lignes.length ? (catalogue.find((c) => c.record.slug === lignes[0]) || {}).record.data.category : null));
  assert.ok(lignes.length > 0 && premierePage.length === lignes.length, `le catalogue se montre (${lignes.length} lignes de la première page)`);
  const manque = motDuManque(neufDoc);
  assert.ok(manque && manque.includes(motDuCran("class")) && manque.includes(motDuCran("abilities")), "témoin : le mot du manque nomme les deux crans");
  const cellule = sans.querySelector('.skills-compte-cellule[data-large="oui"]');
  assert.ok(cellule, "à la place du pool, une cellule large");
  assert.equal(cellule.textContent, manque, "…qui porte LE mot d'`ecran-mort.mjs`, à l'octet");
  assert.ok(!sans.textContent.includes("No free pool"), "⛔ le mensonge du 10/09 : « No free pool — the SRD rules apply » sur une pile qui porte le pool");
  assert.ok(!sans.textContent.includes("Skills follow the SRD"), "⛔ l'aiguilleur ne dit rien des règles sans fiche");
  assert.ok(!sans.textContent.includes(MOT_SANS_RAISON), "et pas la tête de l'écran mort : l'écran vit");
  assert.ok(!sans.textContent.includes("Proficient"), "aucun palier inventé sans fiche");
  /* la classe posée, les scores pas encore : le mot nomme Abilities, plus Class */
  const classeSeule = rendre(avec(neufDoc, [CLASSE]), null);
  const motClasse = classeSeule.querySelector('.skills-compte-cellule[data-large="oui"]').textContent;
  assert.equal(motClasse, motDuManque(avec(neufDoc, [CLASSE])));
  assert.ok(motClasse.includes(motDuCran("abilities")) && !motClasse.includes(`on ${motDuCran("class")}`), "la classe est là : on n'y renvoie pas");
  /* la fiche existe : le pool, et plus aucun mot */
  const out = H.verbs.rebuild({ document: avec(neufDoc, [CLASSE, ...SIX]) });
  const avecFiche = renderSkillsStep({ document: out.document, resolved: out.resolved, decisions: out.decisions, violations: [], query: Q, cursor: 0, signe: false }, () => {});
  assert.ok(avecFiche.querySelector(".skills-free-nombre"), "le pool s'affiche (Budget · Spent)");
  assert.equal(avecFiche.querySelector('.skills-compte-cellule[data-large="oui"]'), null, "et le mot du manque a disparu");
  assert.ok(!avecFiche.textContent.includes("there is no sheet"));
  /* ⚠️ GARDE SUR LA FORME, ET C'EST DIT : une COPIE de la phrase dans
     skills-step.mjs serait identique aujourd'hui et divergerait demain, et
     le garde ci-dessus resterait vert tant qu'elle n'a pas divergé. La forme
     est donc la règle : l'écran importe `motDuManque`, il n'écrit pas
     « there is no sheet ». */
  const src = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "skills-step.mjs"), "utf8"));
  assert.doesNotMatch(src, /there is no sheet/, "⛔ la phrase recopiée : deux écrivains");
  assert.match(src, /import \{[^}]*motDuManque[^}]*\} from "\.\/ecran-mort\.mjs/, "l'écran importe le mot");
});

test("B7 — 🔴 EQUIPMENT SANS CLASSE VIT ET SA BOURSE NOMME : la boutique présente, « My gold » porte le mot ; avec classe, l'or de départ et le mot absent", () => {
  for (const [nom, H] of Object.entries(PILES)) {
    const Q = H.layers.verbs.query;
    const doc = neuf(H, `b7-${nom}`);
    const mot = motDeLaBourse(doc);
    assert.ok(mot && mot.includes(motDuCran("class")), `pile ${nom} : le mot de la bourse nomme le cran Class`);
    const node = renderEquipmentStep({ document: doc, resolved: null, query: Q }, () => {});
    assert.equal(node.querySelector(".aiguilleur"), null, `pile ${nom} : sans classe, la question kit/or n'a pas d'objet — aucun aiguilleur, aucun « Take the »`);
    /* la boutique : le dressing → Equipment → R, ses rayons et ses boutons */
    const versR = [...node.querySelectorAll("button")].find((b) => b.textContent.trim() === "Equipment");
    assert.ok(versR, `pile ${nom} : le dressing porte le bouton Equipment`);
    versR.dispatchEvent({ type: "click", preventDefault() {} });
    assert.ok(node.querySelector('.carte-r-bouton[data-mot="CART"]'), `pile ${nom} : la carte R est là`);
    /* le panier (B2) porte « My gold » : le mot, pas quatre tirets */
    node.querySelector('.carte-r-bouton[data-mot="CART"]').dispatchEvent({ type: "click", preventDefault() {} });
    const myGold = node.querySelector(".pipeline-mygold");
    assert.ok(myGold, `pile ${nom} : B2 porte My gold`);
    assert.equal(myGold.querySelector(".pipeline-mygold-mot").textContent, mot, `pile ${nom} : My gold porte LE mot`);
    assert.equal(myGold.querySelector(".pipeline-mygold-rang"), null, `pile ${nom} : et pas une bourse tronquée à côté`);
    /* la vue de l'étape est un état d'écran (module) : on la ramène au
       dressing par les boutons — BACK (→ R), GEAR (→ B3) — pour le rendu
       suivant et pour F1 */
    [...node.querySelectorAll("button")].find((b) => b.textContent.trim() === "BACK").dispatchEvent({ type: "click", preventDefault() {} });
    node.querySelector('.carte-r-bouton[data-mot="GEAR"]').dispatchEvent({ type: "click", preventDefault() {} });
    assert.ok([...node.querySelectorAll("button")].some((b) => b.textContent.trim() === "Equipment"), `pile ${nom} : retour au dressing`);
    /* avec classe : l'or de départ vient du record, le mot n'existe plus */
    const avecClasse = avec(doc, [CLASSE, ...SIX]);
    assert.equal(motDeLaBourse(avecClasse), null, `pile ${nom} : avec classe, aucun mot`);
    const or = orDuDepart({ query: Q, document: avecClasse });
    assert.equal(or.sansClasse, false);
    assert.equal(or.sources.find((s) => s.genre === "class").cout.gp, 75, `pile ${nom} : le Barbare part avec 75 PO`);
    const out = H.verbs.rebuild({ document: avecClasse });
    const node2 = renderEquipmentStep({ document: out.document, resolved: out.resolved, query: Q }, () => {});
    assert.ok(node2.querySelector(".aiguilleur"), `pile ${nom} : la question kit/or se pose dès que la classe est là`);
    assert.ok([...node2.querySelectorAll(".aiguilleur-bouton")].some((b) => /^Take the/.test(b.textContent)), `pile ${nom} : …et l'or est offert`);
    assert.equal(node2.querySelector(".pipeline-mygold-mot"), null, `pile ${nom} : aucun mot de bourse avec une classe`);
  }
});

/* ══ C — L'ÉCRAN MORT NOMME LA CAUSE ET LA SORTIE, DEPUIS LA DONNÉE ═════════ */

test("C1 — 🔴 sans classe → le mot dit Class ; sans scores → le mot dit Abilities ; les deux → les deux, et jamais la phrase muette", () => {
  const H = PILES.SRD;
  const motClass = ceinture([]).find((c) => c.id === "class").mot;
  const motAbilities = ceinture([]).find((c) => c.id === "abilities").mot;
  /* le personnage NEUF : ni classe, ni scores */
  const neufMot = motDeLEcranMort(neuf(H, "c1"));
  assert.notEqual(neufMot, MOT_SANS_RAISON, "⛔ c'est le défaut de v621 : la phrase muette sur un personnage neuf");
  assert.ok(neufMot.includes(motClass) && neufMot.includes(motAbilities), "les deux crans sont nommés ensemble : un seul voyage");
  /* la classe posée, les scores pas encore : c'est l'état du joueur qui arrive sur Abilities */
  const classeSeule = motDeLEcranMort(avec(neuf(H, "c1b"), [CLASSE]));
  assert.notEqual(classeSeule, MOT_SANS_RAISON);
  assert.notEqual(classeSeule, MOT_SANS_CLASSE, "la classe est là — l'accuser enverrait faire un geste pour rien");
  assert.ok(classeSeule.includes(motAbilities), "la sortie nomme le cran qui pose les scores");
  for (const clef of ABILITY_KEYS) assert.ok(classeSeule.includes(clef.toUpperCase()), `la cause nomme ${clef}`);
  /* quatre posés, deux manquent : seuls les deux sont nommés */
  const deux = motDeLEcranMort(avec(neuf(H, "c1c"), [CLASSE, ...SIX.slice(0, 4)]));
  assert.ok(deux.includes("WIS") && deux.includes("CHA") && !deux.includes("STR"), "seuls les manquants sont nommés");
  /* les scores posés, la classe retirée (`I changed my mind` sur Class) : le mot du 2026-08-20, à la lettre */
  assert.equal(motDeLEcranMort(avec(neuf(H, "c1d"), SIX)), MOT_SANS_CLASSE);
});

test("C2 — ⚔️ JAMAIS `MOT_SANS_RAISON` QUAND UN CHOIX EXIGÉ MANQUE — sur tous les sous-ensembles ; et il reste pour ce que le document ne sait pas nommer", () => {
  const H = PILES.SRD;
  const exiges = [CLASSE, ...SIX];
  let muets = 0;
  for (let masque = 0; masque < (1 << exiges.length); masque += 1) {
    const choix = exiges.filter((_, i) => masque & (1 << i));
    const mot = motDeLEcranMort(avec(neuf(H, `c2-${masque}`), choix));
    if (choix.length < exiges.length) assert.notEqual(mot, MOT_SANS_RAISON, `masque ${masque} : un choix exigé manque, la phrase ne peut pas être muette`);
    else { assert.equal(mot, MOT_SANS_RAISON); muets += 1; }
  }
  assert.equal(muets, 1, "un seul état reste muet : tout est posé, et la cause est ailleurs (record absent, invariant)");
  assert.doesNotMatch(MOT_SANS_RAISON, /Menu|Class|Abilities|switch/, "et elle ne prétend pas donner une sortie — c'est ce qui la rend repérable");
});

test("C3 — 📂 un fichier d'avant le lot, sans niveau, est NOMMÉ avec sa sortie — pas muet", () => {
  const H = PILES.SRD;
  const doc = avec(neuf(H, "c3"), [CLASSE, ...SIX]);
  const sansNiveau = { ...doc, build: { ...doc.build, choices: doc.build.choices.filter((c) => c.path !== "level") } };
  assert.equal(motDeLEcranMort(sansNiveau), MOT_SANS_NIVEAU);
  assert.match(MOT_SANS_NIVEAU, /no level/, "la cause");
  assert.match(MOT_SANS_NIVEAU, /Build a character/, "la sortie : le seul geste du builder qui pose un niveau");
  assert.match(MOT_SANS_NIVEAU, /Menu/, "…et où il se trouve");
  assert.deepEqual(choixExigesManquants(sansNiveau), { niveau: true, classe: false, scores: [] });
});

/* ══ E — LE DOCUMENT QUE `build` ÉCRIT, `doc` L'ACCEPTE — même sans bourse ══
   📏 TROUVÉ AU NAVIGATEUR LE 10/09, une fois Abilities vivant : `Done` sur la
   page ARRAY jetait `DocError: confirm : le champ obligatoire « currency »
   manque`. Le moteur OMET `resolved.currency` tant que les quatre choix
   `currency.*` ne sont pas posés (et le déclare, `underived.currency-
   incomplete` : « on ne les invente pas ») ; le schéma la disait `required`.
   Deux contrats, et le bloc `doc` refusait ce que le bloc `build` venait
   d'écrire — pour TOUT personnage dérivé avant sa bourse, c'est-à-dire tout
   personnage neuf entre Abilities et Equipment. Jamais vu avant : l'exemple a
   une bourse, et aucun personnage neuf n'atteignait Abilities. */
for (const [nom, H] of Object.entries(PILES)) {
  test(`E1 — 🔴 pile ${nom} : un personnage dérivé SANS bourse se signe (\`confirm\`) et valide — le moteur déclare la bourse, le schéma ne l'exige plus`, () => {
    const out = H.verbs.rebuild({ document: avec(neuf(H, `e1-${nom}`), [CLASSE, ...SIX]) });
    assert.equal(Object.hasOwn(out.resolved, "currency"), false, "témoin : sans choix `currency.*`, le moteur OMET la bourse…");
    assert.ok(out.underived.some((u) => u.key === "underived.currency-incomplete"), "…et le DÉCLARE — rien n'est inventé");
    assert.doesNotThrow(() => writers.assertValid(out.document, "e1"), "le document du bloc `build` valide au bloc `doc`");
    const signe = writers.confirm({ document: out.document, path: "abilities" });
    assert.ok(signe.build.confirmed.includes("abilities"), "et `Done` sur Abilities peut signer");
  });
}

test("E2 — ⚔️ ET LA BOURSE RESTE « COMPLÈTE OU NOMMÉE » : une bourse partielle n'est pas une bourse, une bourse de départ sans classe n'est pas offerte, et une bourse posée reste exigée entière", () => {
  const H = PILES.SRD;
  /* 🌱 lot 198, second passage : « tronquée » n'est ni « complète » ni
     « nommée » — sans classe, l'or de départ n'a pas de total, et l'écran
     nomme la sortie (B7). Ici la DONNÉE : `orDuDepart` et la bourse posée. */
  const sansClasse = neuf(H, "e2-sans-classe");
  assert.equal(orDuDepart({ query: H.layers.verbs.query, document: sansClasse }).cout, null, "sans classe, aucun total à prendre");
  assert.deepEqual(CURRENCY_KEYS.filter((k) => sansClasse.build.choices.some((c) => c.path === `currency.${k}`)), [], "et aucune clef posée : rien n'est tronqué");
  const partielle = H.verbs.rebuild({ document: avec(neuf(H, "e2"), [CLASSE, ...SIX, { path: "currency.gp", value: 75 }]) });
  assert.equal(Object.hasOwn(partielle.resolved, "currency"), false, "gp seul ne produit aucune bourse (equipment-step, tête)");
  assert.ok(partielle.underived.some((u) => u.key === "underived.currency-incomplete"));
  const entiere = H.verbs.rebuild({ document: avec(neuf(H, "e2b"), [CLASSE, ...SIX,
    ...["cp", "sp", "gp", "pp"].map((k) => ({ path: `currency.${k}`, value: k === "gp" ? 75 : 0 }))]) });
  assert.deepEqual(entiere.resolved.currency, { cp: 0, sp: 0, gp: 75, pp: 0 }, "quatre choix → une bourse, zéros compris");
  /* le schéma, lu : la rubrique est facultative, ses quatre clefs ne le sont pas */
  const schema = readJson("schemas/fh-char.schema.json");
  const resolved = schema.$defs[schema.properties.resolved.$ref.split("/").pop()];
  assert.ok(!resolved.required.includes("currency"), "⛔ `currency` redevenue `required` : `doc` refuserait `build` à nouveau");
  assert.deepEqual(resolved.properties.currency.required, ["cp", "sp", "gp", "pp"], "…mais une bourse présente porte ses quatre dénominations");
  assert.throws(() => writers.assertValid({ ...entiere.document, resolved: { ...entiere.resolved, currency: { gp: 75 } } }, "e2"),
    /currency/, "témoin rouge : une bourse à une clef ne valide pas");
});

test("E3 — 🔴 CE QUE LE MOTEUR PEUT DÉCLARER NON DÉRIVÉ, LE SCHÉMA NE L'EXIGE PAS — les cinq omissions, provoquées une à une, valident au bloc `doc`", () => {
  /* 📏 TROUVÉ AU NAVIGATEUR EN DEUX TEMPS le 10/09 : `currency` d'abord (tout
     personnage neuf), puis `spellcasting` (le Barbare-Acolyte : Magic Initiate
     pose des sorts, la classe n'a pas de caractéristique d'incantation). La loi
     de `derive` — absent ET déclaré, jamais consolant — vaut pour cinq
     rubriques ; le schéma les exigeait toutes. Ici chaque omission est
     PROVOQUÉE (jamais supposée) et le document qui en sort doit valider. */
  const schema = readJson("schemas/fh-char.schema.json");
  const requis = schema.$defs[schema.properties.resolved.$ref.split("/").pop()].required;
  const SIX_SORTS = [
    { path: "background", ref: { kind: "background", id: "srd:background:en:acolyte" } },
    { path: "background.originFeat[0].cantrips[0]", ref: { kind: "spell", id: "srd:spell:en:guidance" } },
    { path: "background.originFeat[0].cantrips[1]", ref: { kind: "spell", id: "srd:spell:en:light" } },
    { path: "background.originFeat[0].prepared[0]", ref: { kind: "spell", id: "srd:spell:en:bless" } }
  ];
  const CUIR = [
    { path: "gear[0]", ref: { kind: "armor", id: "srd:armor:en:leather-armor" } },
    { path: "gear[0].quantity", value: 1 }, { path: "gear[0].equipped", value: true }
  ];
  /* une progression sans `proficiency_bonus` : le bonus de maîtrise ne se
     dérive plus, et les jets de sauvegarde avec lui */
  const sansBonus = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-progression-sans-bonus",
    ampute("class-progression", "srd:class-progression:en:barbarian", "Barbarian", { class: "srd:class:en:barbarian", levels: [{ level: 1 }] })) });
  /* une armure sans ses champs de CA : l'AC ne se dérive plus */
  const sansCa = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-armure-sans-ca",
    ampute("armor", "srd:armor:en:leather-armor", "Leather Armor", { armor_class: "11 + Dex modifier" })) });
  const scenarios = [
    ["currency", PILES.SRD, []],
    ["spellcasting", PILES.SRD, SIX_SORTS],
    ["proficiency", sansBonus, []],
    ["saves", sansBonus, []],
    ["ac", sansCa, CUIR]
  ];
  for (const [rubrique, H, choix] of scenarios) {
    const out = H.verbs.rebuild({ document: avec(neuf(H, `e3-${rubrique}`), [CLASSE, ...SIX, ...choix]) });
    assert.equal(Object.hasOwn(out.resolved, rubrique), false, `témoin : le moteur OMET « ${rubrique} » dans ce scénario…`);
    assert.ok(out.underived.some((u) => u.field === rubrique), `…et le DÉCLARE (underived.field === « ${rubrique} »)`);
    assert.ok(!requis.includes(rubrique), `⛔ « ${rubrique} » est \`required\` : \`doc\` refuserait ce que \`build\` écrit`);
    assert.doesNotThrow(() => writers.assertValid(out.document, `e3-${rubrique}`), `le document sans « ${rubrique} » valide`);
    assert.doesNotThrow(() => writers.confirm({ document: out.document, path: "abilities" }), `…et se signe`);
  }
  /* ⚔️ et le témoin inverse : ce que le moteur écrit TOUJOURS reste exigé —
     un `resolved` sans `abilities` ne valide pas */
  const out = PILES.SRD.verbs.rebuild({ document: avec(neuf(PILES.SRD, "e3-temoin"), [CLASSE, ...SIX]) });
  const { abilities, ...sansAbilities } = out.resolved;
  assert.throws(() => writers.assertValid({ ...out.document, resolved: sansAbilities }, "e3"), /abilities/);
  assert.ok(requis.includes("abilities") && requis.includes("identity") && requis.includes("gear"), "les rubriques toujours écrites restent exigées");
});

/* ══ F — LE `Next` MÈNE AU CHAPITRE SUIVANT, DE BOUT EN BOUT ═════════════════
   📏 DEUX TROUS TROUVÉS AU NAVIGATEUR LE 10/09, une fois Abilities et
   Equipment vivants : le `NEXT` de l'écran R d'Equipment ne faisait RIEN
   (l'écran disait « il appartient à la coquille », la coquille disait « l'écran
   R porte son propre NEXT » — personne ne le câblait ; Eric : *« Il manque
   encore Équipement »*), et le bilan d'Abilities promettait *« Next moves on
   to Skills »* en pile SRD, où `Next` mène à Equipment. */
test("F1 — 🔴 le `NEXT` de l'écran R d'Equipment DÉCLARE `done` — la coquille avance, l'écran ne saute pas d'étape lui-même", () => {
  const H = PILES.SRD;
  const out = H.verbs.rebuild({ document: avec(neuf(H, "f1"), [CLASSE, ...SIX]) });
  const actions = [];
  const node = renderEquipmentStep({ document: out.document, resolved: out.resolved, query: H.layers.verbs.query }, (a) => actions.push(a));
  /* le dressing (B3) ouvre l'écran ; son bouton `Equipment` mène à R */
  const versR = [...node.querySelectorAll("button")].find((b) => b.textContent.trim() === "Equipment");
  assert.ok(versR, "témoin : le dressing porte le bouton Equipment (→ R)");
  versR.dispatchEvent({ type: "click", preventDefault() {} });
  const next = node.querySelector('.carte-r-bouton[data-mot="NEXT"]');
  assert.ok(next, "témoin : R porte son NEXT (croquis : GEAR CART CRAFT NEXT)");
  next.dispatchEvent({ type: "click", preventDefault() {} });
  assert.deepEqual(actions, [{ kind: "done" }], "⛔ NEXT ne fait rien, ou fait autre chose que le verbe `done` de l'étape");
  /* et le verbe est celui que toute étape emploie pour avancer, par la
     coquille : `pressDone` → `equipmentValidate` (toujours prête, `next:
     "step"`) → `cranVoisin(1)` */
  assert.deepEqual(equipmentValidate(), { exists: true, ready: true, action: null, next: "step" });
});

test("F2 — 🔴 le bilan d'Abilities nomme le cran que `Next` atteindra, tel que la coquille le tend — jamais « Skills » écrit en dur", () => {
  const H = PILES.SRD;
  const out = H.verbs.rebuild({ document: avec(neuf(H, "f2"), [CLASSE, ...SIX, { path: "abilities.mode", value: "standard" }]) });
  const rendre = (suivant) => renderAbilitiesStep({ document: out.document, resolved: out.resolved, rollBatch: null, revele: 0, method: "standard", palier: 1, bilan: true, suivant }, () => {}).textContent;
  const motEquipment = ceinture([]).find((c) => c.id === "equipment").mot;
  const motSkills = STEPS.find((s) => s.id === "skills").label;
  assert.match(rendre(motEquipment), /moves on to Equipment/, "pile SRD : le cran voisin d'Abilities est Equipment");
  assert.match(rendre(motSkills), /moves on to Skills/, "pile Fate's Hand : Skills");
  assert.doesNotMatch(rendre(null), /moves on to/, "sans voisin, la phrase ne promet aucun cran");
  assert.doesNotMatch(rendre(motEquipment), /Skills/, "⛔ « Skills » écrit en dur : la seconde voix");
  /* ⚠️ garde sur la forme, et c'est dit : le libellé n'a plus le droit de vivre
     dans l'écran — c'est `etapes.mjs` qui le possède */
  const src = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "abilities-step.mjs"), "utf8"));
  assert.doesNotMatch(src, /moves on to Skills/);
  const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));
  assert.match(shell, /suivant:\s*motDuCranVoisin\(1\)/, "la coquille tend le mot du cran voisin, lu sur la ceinture");
});

/* ══ G — LA BOUTIQUE SRD A DE LA MARCHANDISE ET L'OR DE DÉPART DE LA CLASSE ═══
   📏 Regardé au navigateur le 10/09 (pile SRD, Barbare Acolyte) : l'aiguilleur
   d'Equipment dit *« Barbarian 75 GP, Acolyte 50 GP, 125 GP in all »*, `Take
   the 125 GP` pose la bourse à 125 GP, et le R ouvre l'Equipment Browser sur
   six rayons. La grille attend qu'on tourne le tambour (« vierge ») : ce que ce
   garde mesure est la MATIÈRE derrière le tambour, sur la donnée. */
test("G1 — 🔴 pile SRD : la boutique porte des items SRD sur six rayons, et l'or de départ vient du record de classe", () => {
  const H = PILES.SRD;
  const rayons = rayonsEtEtageres(H.layers.verbs.query);
  const total = rayons.reduce((n, r) => n + r.etageres.reduce((m, e) => m + e.objets.length, 0), 0);
  assert.ok(rayons.length >= 6, `six rayons attendus, ${rayons.length} mesurés`);
  assert.ok(total > 300, `la boutique SRD porte des centaines d'items (${total} mesurés le 10/09 : 416)`);
  const armures = rayons.flatMap((r) => r.etageres).find((e) => e.label === "Armor");
  assert.ok(armures && armures.objets.length === 13, "l'étagère Armor porte les 13 armures du SRD (mesuré : 13 `armor`)");
  /* l'or de départ : lu dans `class.data.starting_equipment`, jamais écrit */
  const doc = avec(neuf(H, "g1"), [CLASSE, ...SIX]);
  const or = orDuDepart({ query: H.layers.verbs.query, document: doc });
  const classe = or.sources.find((s) => s.genre === "class");
  assert.equal(classe.nom, "Barbarian");
  assert.deepEqual(classe.cout, { pp: 0, gp: 75, sp: 0, cp: 0 }, "le Barbare part avec 75 PO (phrase B de son record)");
  assert.match(classe.prose, /75 GP/, "…et la phrase d'où le montant est lu le porte");
});

/* ══ D — LA COQUILLE NE PORTE PLUS DE LISTE D'ÉCRANS PAR NOM ═══════════════
   ⚠️ GARDE SUR LA FORME, ET C'EST DIT : `shell.mjs` ne se monte pas sous Node
   (aucun harnais, depuis le lot 50). Ce qu'il tient est que la LOI vit au
   cran (`lit`) et que la coquille la LIT — une liste par nom revenue ici
   redeviendrait le second écrivain de « qui meurt », et c'est elle qui
   gagnerait, puisque c'est elle qui est posée dans le DOM. La forme, ici,
   EST la règle. */
test("D1 — 🔴 `shell.mjs` : plus de liste d'écrans par nom ; il demande `manqueDuCran` sur UN fait, et pose `motDeLEcranMort`", () => {
  const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));
  assert.ok(!shell.includes("ECRANS_QUI_LISENT_LA_FICHE"), "⛔ la liste par nom est revenue");
  assert.doesNotMatch(shell, /new Set\(\[\s*"(background|abilities|destiny|skills|equipment|review)"/,
    "⛔ un ensemble d'ids d'écran dans la coquille est une liste par nom, quel que soit son nom");
  assert.match(shell, /manqueDuCran\(step, faitsDuPersonnage\(\)\)/, "la coquille demande au cran ce qui lui manque");
  assert.match(shell, /motDeLEcranMort\(state\.document\)/, "et pose le mot du module, sur le document vivant");
  assert.match(shell, /derivable:\s*!state\.derivationImpossible/, "le fait est lu sur le refus de `rebuild`…");
  assert.doesNotMatch(shell, /classeChoisie/, "…et c'est le SEUL fait : le second (la classe, pour Equipment) est parti avec son lecteur");
  /* et la source de la loi porte UNE déclaration — celle de Sheet */
  const etapes = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "etapes.mjs"), "utf8"));
  assert.equal((etapes.match(/\blit:\s*"/g) || []).length, 1, "⛔ un cran de plus déclare une lecture");
  assert.match(etapes, /id:\s*"review"[^}]*lit:\s*"fiche"/, "et c'est `review`");
  /* Skills reçoit le document de la coquille : sans lui, il ne saurait pas nommer */
  assert.match(shell, /function skillsCtx\(\)\s*\{[\s\S]*?document:\s*state\.document/, "skillsCtx tend le document");
});
