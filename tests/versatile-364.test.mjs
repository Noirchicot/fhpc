/* ══ LOT 364 — VERSATILE : LE DON D'ORIGINE EN PLUS ══════════════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 364 versatile.md` (ARCHI 35, 29/09).

   LE DÉFAUT (relevé 360, lignes #6 et #16). En SRD comme en Fate's Hand, le
   Human a droit à « an Origin feat of your choice » (Versatile), la Loroka aussi
   en FH. Le builder ne le proposait nulle part — et l'écran Species promettait
   même « → chosen at step 3, Inheritance », un choix que l'Inheritance ne fait
   pas : son don est le sien. Le personnage sortait avec un don de moins.

   ⭐ CE QUI LE TIENT, PAR LA DONNÉE :
     · l'espèce DÉCLARE Versatile (`data.feat_choice`, la forme même de
       l'Inheritance, plus le trait qu'elle réalise) ; le carnet publie
       `species.originFeat[0]`, et l'étape Species ouvre la porte avec l'organe
       du don de l'Inheritance — un organe, deux lieux ;
     · la REPRISE se lit dans le texte SRD (« Repeatable. ») et se DÉCLARE
       (`data.repeatable`) : un don non reprenable pris d'un côté n'est pas offert
       de l'autre, dans les deux sens ; le second Magic Initiate n'offre pas la
       liste du premier ;
     · Skilled SRD ouvre ses trois choix (compétences ou outils) ; en Fate's Hand,
       ses +6 points se dépensent à Skills ;
     · la fiche nomme les DEUX dons, par un seul compositeur.
   ⛔ Q4 d'ARCHI 35 : les maîtrises de Skilled s'écrivent et se montrent, leur
   effet attend le lot sur `derive`. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createTestDocument } from "./dom-stub.mjs";
import { ROOT, makeHarness, manifestOf, uneCouche, PILE_SRD } from "./build-harness.mjs";
import { stripComments } from "./source-scan.mjs";
import { FR_BUILD } from "../src/labels.mjs";

globalThis.document = createTestDocument();
const { PILE } = await import("../src/tools/exemple-fh-en.mjs");
const { itemsDeLEtape } = await import("../ui/builder/parcours.mjs");
const { SPECIES_CATALOGUE, LIGNE_ACQUIS, CHEMIN_DON_D_ESPECE, detenteurDuDonDEspece } =
  await import("../ui/builder/species-step.mjs");
const { donsDOrigineNommes, detenteurDuDonDArrierePlan, estRacineDeDon, racineDuDon, donABranches } =
  await import("../ui/builder/inheritance-step.mjs");
const { etapeFaite, renderReviewStep } = await import("../ui/builder/review-step.mjs");

const PILES = { SRD: makeHarness({ layers: PILE_SRD }), FH: makeHarness({ layers: PILE }) };
const sp = (s) => (s.includes(":") ? s : `srd:species:en:${s}`);
const don = (s) => `srd:feat:en:${s}`;

function docDe(h, choices) {
  return {
    schema: "fh-char/1", id: "versatile-364", name: "Versatile 364", lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-29T00:00:00Z", modified: "2026-09-29T00:00:00Z",
    build: { layers: manifestOf(h.layers), choices: [{ path: "level", value: 1 }, ...choices], budgets: {}, overrides: [], confirmed: [] }
  };
}
const decisionsDe = (h, choices) => h.verbs.decisions({ document: docDe(h, choices) }).decisions || [];
const plan = (decisions, chemin) => decisions.find((p) => p.path === chemin) || null;
const espece = (id) => ({ path: "species", ref: { kind: "species", id: sp(id) } });
const fond = (id) => ({ path: "background", ref: { kind: "background", id: id.includes(":") ? id : `srd:background:en:${id}` } });
const pris = (racine, id) => ({ path: `${racine}.originFeat[0]`, ref: { kind: "feat", id: don(id) } });
const liste = (racine, classe) => ({ path: `${racine}.originFeat[0].list`, ref: { kind: "class", id: `srd:class:en:${classe}` } });
const court = (id) => String(id).split(":").pop();
const ctxDe = (h, decisions) => ({ decisions, query: h.layers.verbs.query, path: "species", kind: "species", label: "Species", cursor: 0 });

/* ══ LA GARDE DE LA PORTE — par la donnée ═══════════════════════════════════
   Une espèce qui DÉCLARE Versatile a son plan ET sa porte ; une espèce qui ne le
   déclare pas n'en a aucun. Et la déclaration nomme un trait que l'espèce porte. */
export function fautesDeVersatile(h) {
  const fautes = [];
  for (const vue of h.layers.verbs.query({ kind: "species" }) || []) {
    const data = vue.record.data || {};
    const declare = data.feat_choice && typeof data.feat_choice === "object";
    const choices = [{ path: "species", ref: { kind: "species", id: vue.id } }];
    const decisions = decisionsDe(h, choices);
    const p = plan(decisions, CHEMIN_DON_D_ESPECE);
    const portes = new Set(itemsDeLEtape({ decisions, document: docDe(h, choices), racine: "species" }).map((i) => i.path));
    if (declare && !(p && portes.has(CHEMIN_DON_D_ESPECE))) fautes.push(`${vue.id} déclare Versatile sans porte`);
    if (!declare && p) fautes.push(`${vue.id} publie un don d'espèce sans le déclarer`);
    if (declare) {
      const traits = [...(data.traits || []), ...(data.fh_traits || [])].map((t) => t && t.id);
      if (!traits.includes(data.feat_choice.trait)) fautes.push(`${vue.id} : le trait déclaré « ${data.feat_choice.trait} » n'existe pas`);
      if (p && p.options.length === 0) fautes.push(`${vue.id} : une porte sans aucun don`);
    }
  }
  return fautes;
}

/* ══ LA REPRISE, LUE DANS LE TEXTE ══════════════════════════════════════════
   La forme TROUVE le paragraphe « Repeatable. » du texte SRD ; la déclaration
   (`data.repeatable`) tranche. Les deux doivent aller ensemble. */
const REPRISE_DANS_LE_TEXTE = /\bRepeatable\./;
export function fautesDeReprise(vues) {
  const fautes = [];
  for (const vue of vues) {
    const data = vue.record.data || {};
    const texte = typeof data.description === "string" ? data.description : "";
    const declaree = data.repeatable && typeof data.repeatable === "object" ? data.repeatable : null;
    if (REPRISE_DANS_LE_TEXTE.test(texte) && !declaree) fautes.push(`${vue.id} : le texte dit « Repeatable. », rien ne le déclare`);
    if (declaree && !REPRISE_DANS_LE_TEXTE.test(texte)) fautes.push(`${vue.id} : déclaré reprenable, le texte ne le dit pas`);
    if (declaree && (typeof declaree.extrait !== "string" || !texte.includes(declaree.extrait))) {
      fautes.push(`${vue.id} : l'extrait de la reprise ne retrouve pas sa phrase`);
    }
    if (declaree && declaree.distinct !== undefined && !Object.hasOwn(data, declaree.distinct)) {
      fautes.push(`${vue.id} : \`distinct\` nomme « ${declaree.distinct} », que le record ne porte pas`);
    }
  }
  return fautes;
}

/* ══════════════════════════════════════════════════════════════════════════ */

test("1 — ⭐ la porte existe pour CHAQUE espèce qui déclare Versatile, et pour elles seules — dans les deux piles", () => {
  for (const [nom, h] of Object.entries(PILES)) {
    assert.deepEqual(fautesDeVersatile(h), [], nom);
  }
  const declarantes = (h) => (h.layers.verbs.query({ kind: "species" }) || [])
    .filter((v) => v.record.data && v.record.data.feat_choice).map((v) => court(v.id)).sort();
  assert.deepEqual(declarantes(PILES.SRD), ["human"], "témoin SRD : le Human, et lui seul");
  assert.deepEqual(declarantes(PILES.FH), ["human", "loroka"], "témoin FH : le Human et la Loroka");
});

test("1 bis — ⚔️ témoin : une espèce qui déclare Versatile sans pouvoir l'offrir est accusée", () => {
  const h = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-364", {
    species: { [sp("dwarf")]: { op: "patch", changes: { "data[feat_choice]": { from: 42, trait: "stonecunning" } } } }
  }) });
  const fautes = fautesDeVersatile(h);
  assert.ok(fautes.some((f) => f.startsWith(`${sp("dwarf")} déclare Versatile sans porte`)), fautes.join(" | "));
});

test("2 — le trait quitte « Granted automatically » pour la porte, et la fausse ligne verte part avec lui", () => {
  for (const [nom, id] of [["SRD", "human"], ["FH", "human"], ["FH", "fh:species:en:loroka"]]) {
    const h = PILES[nom];
    const ctx = { ...ctxDe(h, decisionsDe(h, [espece(id)])), drapeaux: h.layers.verbs.flags() };
    const acquis = SPECIES_CATALOGUE.resumeItem({ path: LIGNE_ACQUIS.path, confirme: true }, ctx, () => {}).textContent;
    assert.ok(!acquis.includes("Versatile"), `${nom} ${id} : Versatile a sa porte, il n'est plus « acquis »`);
    assert.ok(!acquis.includes("Inheritance"), `${nom} ${id} : ⛔ plus de « → chosen at step 3, Inheritance »`);
  }
});

test("3 — la porte suit la loi de la porte : la question, puis la réponse avec la question dessous", () => {
  const h = PILES.SRD;
  const avant = ctxDe(h, decisionsDe(h, [espece("human")]));
  assert.equal(SPECIES_CATALOGUE.itemLabel(CHEMIN_DON_D_ESPECE, avant), "Versatile", "le nom du trait, lu dans la couche");
  assert.match(SPECIES_CATALOGUE.itemAiguilleur(CHEMIN_DON_D_ESPECE, avant), /drag it into the slot/);
  const apres = ctxDe(h, decisionsDe(h, [espece("human"), pris("species", "magic-initiate")]));
  assert.deepEqual(SPECIES_CATALOGUE.itemLabel(CHEMIN_DON_D_ESPECE, apres), { mot: "Magic Initiate", sous: "versatile" });
  assert.ok(estRacineDeDon(CHEMIN_DON_D_ESPECE) && estRacineDeDon("background.originFeat[0]"));
  assert.ok(!estRacineDeDon("species.originFeat[0].list") && !estRacineDeDon("species.lineage"));
  assert.equal(racineDuDon("species.originFeat[0].cantrips[1]"), CHEMIN_DON_D_ESPECE);
  assert.ok(donABranches(apres.decisions, CHEMIN_DON_D_ESPECE), "Magic Initiate ouvre son B emboîté");
  const alerte = decisionsDe(h, [espece("human"), pris("species", "alert")]);
  assert.ok(!donABranches(alerte, CHEMIN_DON_D_ESPECE), "Alert n'a rien à régler dedans");
});

test("4 — ⛔ un don qui ne se reprend pas n'est pas offert deux fois — dans les deux sens", () => {
  /* SRD : le Criminal IMPOSE Alert ; Versatile ne l'offre pas, et offre les deux dons reprenables. */
  const srd = PILES.SRD;
  const options = plan(decisionsDe(srd, [espece("human"), fond("criminal")]), CHEMIN_DON_D_ESPECE).options.map(court);
  assert.deepEqual(options, ["magic-initiate", "savage-attacker", "skilled"]);
  /* Un document qui les porte déjà deux fois : le verrou nomme la faute, à Versatile. */
  const doublon = plan(decisionsDe(srd, [espece("human"), pris("species", "alert"), fond("criminal")]), CHEMIN_DON_D_ESPECE);
  assert.equal(doublon.lock && doublon.lock.key, "decision.option-unavailable");
  /* FH : Versatile d'abord, l'Inheritance ensuite — puis l'inverse. */
  const fh = PILES.FH;
  const inherit = plan(decisionsDe(fh, [espece("human"), pris("species", "alert")]), "background.originFeat[0]");
  assert.ok(!inherit.options.includes(don("alert")), "l'Inheritance ne réoffre pas l'Alert de Versatile");
  const versatile = plan(decisionsDe(fh, [espece("human"), pris("background", "savage-attacker")]), CHEMIN_DON_D_ESPECE);
  assert.ok(!versatile.options.includes(don("savage-attacker")), "Versatile ne réoffre pas le don de l'Inheritance");
  assert.ok(versatile.options.includes(don("skilled")) && versatile.options.includes(don("magic-initiate")),
    "les dons reprenables restent offerts");
});

test("5 — ♻️ Magic Initiate se reprend, mais avec une AUTRE liste", () => {
  const srd = PILES.SRD;
  /* L'Acolyte impose Magic Initiate (Cleric) : le second n'offre que Druid et Wizard. */
  const acolyte = decisionsDe(srd, [espece("human"), fond("acolyte"), pris("species", "magic-initiate")]);
  assert.deepEqual(plan(acolyte, `${CHEMIN_DON_D_ESPECE}.list`).options.map(court), ["druid", "wizard"]);
  assert.deepEqual(plan(acolyte, "background.originFeat[0].list").selected.map(court), ["cleric"], "l'imposée ne bouge pas");
  /* FH : dans les deux sens. */
  const fh = PILES.FH;
  const deux = decisionsDe(fh, [espece("human"), pris("background", "magic-initiate"), liste("background", "druid"),
    pris("species", "magic-initiate"), liste("species", "wizard")]);
  assert.deepEqual(plan(deux, `${CHEMIN_DON_D_ESPECE}.list`).options.map(court), ["cleric", "wizard"]);
  assert.deepEqual(plan(deux, "background.originFeat[0].list").options.map(court), ["cleric", "druid"]);
  /* La même liste deux fois : refusée. */
  const meme = plan(decisionsDe(fh, [espece("human"), pris("background", "magic-initiate"), liste("background", "druid"),
    pris("species", "magic-initiate"), liste("species", "druid")]), `${CHEMIN_DON_D_ESPECE}.list`);
  assert.equal(meme.lock && meme.lock.key, "decision.option-unavailable");
  /* Et les sorts du second exemplaire vivent sous SA racine. */
  assert.ok(plan(deux, `${CHEMIN_DON_D_ESPECE}.cantrips`) && plan(deux, `${CHEMIN_DON_D_ESPECE}.prepared`));
});

test("6 — 📋 la reprise est LUE dans le texte : chaque « Repeatable. » a sa déclaration, chaque déclaration sa phrase", () => {
  for (const [nom, h] of Object.entries(PILES)) {
    assert.deepEqual(fautesDeReprise(h.layers.verbs.query({ kind: "feat" }) || []), [], nom);
  }
  const reprenables = (PILES.SRD.layers.verbs.query({ kind: "feat" }) || [])
    .filter((v) => v.record.data && v.record.data.repeatable).map((v) => court(v.id)).sort();
  assert.deepEqual(reprenables, ["ability-score-improvement", "magic-initiate", "skilled"],
    "témoin : les trois dons que le texte SRD dit reprenables (le premier attend le lot Level up)");
  /* ⚔️ témoins : un texte qui le dit sans déclaration, une déclaration que le texte ne porte pas. */
  const faux = [
    { id: "x:feat:en:a", record: { data: { description: "Repeatable. You can take this feat more than once." } } },
    { id: "x:feat:en:b", record: { data: { description: "Once per turn.", repeatable: { extrait: "Once per turn" } } } }
  ];
  assert.equal(fautesDeReprise(faux).length, 2);
});

test("7 — 🎯 Skilled en SRD ouvre ses trois choix, compétences OU outils ; en FH, ses points vont à Skills", () => {
  const h = PILES.SRD;
  const base = [espece("human"), pris("species", "skilled")];
  const chemin = `${CHEMIN_DON_D_ESPECE}.proficiencies`;
  const p = plan(decisionsDe(h, base), chemin);
  assert.equal(p.expected, 3, "trois, comme le texte SRD");
  const catalogue = (kind) => (h.layers.verbs.query({ kind }) || []).map((v) => v.id);
  assert.deepEqual([...p.options].sort(), [...catalogue("skill"), ...catalogue("tool")].sort(), "toutes les compétences et tous les outils");
  const reponses = decisionsDe(h, [...base,
    { path: `${chemin}[0]`, ref: { kind: "skill", id: "srd:skill:en:athletics" } },
    { path: `${chemin}[1]`, ref: { kind: "tool", id: catalogue("tool")[0] } }]);
  assert.deepEqual(plan(reponses, chemin).selected.length, 2, "une compétence et un outil se posent au même plan");
  const sort = plan(decisionsDe(h, [...base, { path: `${chemin}[0]`, ref: { kind: "spell", id: "srd:spell:en:light" } }]), `${chemin}[0]`);
  assert.equal(sort.lock && sort.lock.key, "decision.kind-mismatch", "un sort n'est pas une maîtrise");
  const quatre = plan(decisionsDe(h, [...base, ...catalogue("skill").slice(0, 4).map((id, i) => ({ path: `${chemin}[${i}]`, ref: { kind: "skill", id } }))]), chemin);
  assert.equal(quatre.lock && quatre.lock.key, "feat-proficiency.count-mismatch");
  assert.equal(typeof FR_BUILD["feat-proficiency.count-mismatch"], "function", "le verrou neuf a son mot");
  for (const id of ["human", "fh:species:en:loroka"]) {
    assert.equal(plan(decisionsDe(PILES.FH, [espece(id), pris("species", "skilled")]), chemin), null,
      `FH ${id} : Skilled donne ses +6 points à Skills, il n'ouvre pas les trois choix`);
  }
});

test("8 — 🧬 la fiche nomme les DEUX dons, par le même compositeur", () => {
  const h = PILES.SRD;
  const decisions = decisionsDe(h, [espece("human"), fond("acolyte"), pris("species", "magic-initiate"), liste("species", "wizard")]);
  const ctx = ctxDe(h, decisions);
  const detenteurs = [detenteurDuDonDArrierePlan(ctx), detenteurDuDonDEspece(ctx)].filter(Boolean);
  assert.deepEqual(donsDOrigineNommes(ctx, detenteurs), [
    /* 🔄 LOT 372 — chaque ligne porte l'`id` du don : `derive` en pose le trait, la Sheet le nomme ainsi. */
    { id: "background:srd:feat:en:magic-initiate", name: "Origin feat: Magic Initiate (Cleric)", source: "Acolyte" },
    { id: "species:srd:feat:en:magic-initiate", name: "Versatile: Magic Initiate (Wizard)", source: "Human" }
  ]);
  const skilled = decisionsDe(h, [espece("human"), pris("species", "skilled"),
    { path: `${CHEMIN_DON_D_ESPECE}.proficiencies[0]`, ref: { kind: "skill", id: "srd:skill:en:athletics" } }]);
  const ctx2 = ctxDe(h, skilled);
  assert.deepEqual(donsDOrigineNommes(ctx2, [detenteurDuDonDEspece(ctx2)]), [
    { id: "species:srd:feat:en:skilled", name: "Versatile: Skilled (Athletics)", source: "Human" }
  ]);
  const fh = PILES.FH;
  const ctx3 = ctxDe(fh, decisionsDe(fh, [espece("fh:species:en:loroka"), pris("species", "alert"), pris("background", "savage-attacker")]));
  assert.deepEqual(donsDOrigineNommes(ctx3, [detenteurDuDonDArrierePlan(ctx3), detenteurDuDonDEspece(ctx3)].filter(Boolean)), [
    { id: "background:srd:feat:en:savage-attacker", name: "Origin feat: Savage Attacker", source: "Inheritance" },
    { id: "species:srd:feat:en:alert", name: "Versatile: Alert", source: "Loroka" }
  ]);
});

test("9 — la Sheet ne dit pas « done » pour Species tant que Versatile n'a pas son don", () => {
  const h = PILES.SRD;
  const skillful = { path: "species.skills[0]", value: "athletics" };
  const sans = [espece("human"), skillful];
  assert.equal(etapeFaite({ decisions: decisionsDe(h, sans), document: docDe(h, sans) }, "species"), false);
  const avec = [...sans, pris("species", "alert")];
  assert.equal(etapeFaite({ decisions: decisionsDe(h, avec), document: docDe(h, avec) }, "species"), true);
});

test("10 — la Sheet REND les deux dons — le compositeur est branché, pas seulement écrit", () => {
  const h = PILES.SRD;
  const choices = [espece("human"), fond("acolyte"), pris("species", "magic-initiate"), liste("species", "wizard")];
  const document = docDe(h, choices);
  const texte = renderReviewStep({
    document, resolved: {}, decisions: decisionsDe(h, choices), report: {}, violations: [],
    query: h.layers.verbs.query, flags: []
  }, () => {}).textContent;
  for (const ligne of ["Origin feat: Magic Initiate (Cleric)", "Versatile: Magic Initiate (Wizard)"]) {
    assert.ok(texte.includes(ligne), `« ${ligne} » absent de la Sheet`);
  }
});

test("11 — la coquille route le B emboîté du don pour TOUTE racine de don, jamais pour la seule de l'arrière-plan", () => {
  /* ⛔ Source : ce routage lit l'état de module de la coquille, il n'est pas exportable.
     Ce qui se garde : chaque branche décide par la GRAMMAIRE (`estRacineDeDon`, `donABranches`),
     et plus aucune ne compare au seul chemin de l'arrière-plan. */
  const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui/builder/shell.mjs"), "utf8"));
  assert.equal((shell.match(/estRacineDeDon\(state\.parcoursItem\.racine\)/g) || []).length, 2, "les deux branches du SB");
  assert.equal((shell.match(/estRacineDeDon\(state\.parcoursItem\.path\)/g) || []).length, 3, "les deux branches du B, et son pied");
  assert.equal((shell.match(/donABranches\(state\.decisions, state\.parcoursItem\.path\)/g) || []).length, 3);
  assert.doesNotMatch(shell, /parcoursItem\.racine === FEAT_RACINE/,
    "⛔ aucun SB de don ne compare à la seule racine de l'arrière-plan");
  assert.doesNotMatch(shell, /featListPlan\(/,
    "⛔ le B emboîté ne s'ouvre plus sur la seule LISTE de l'arrière-plan : `donABranches` lit toute branche, sous toute racine");
  assert.match(shell, /action\.kind === "choose" && estRacineDeDon\(action\.path\)/,
    "changer de don efface ses branches, sous SA racine");
});
