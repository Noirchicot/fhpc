/* ══ 🧾 LOT 379 — LA FICHE DIT VRAI : L'INITIATIVE ET LA PERCEPTION PASSIVE ══════════════
   Mandat d'ARCHI 35 (30/09), après l'état des lieux du lot 378 :
   · « FH : aucune Perception passive sur la fiche, ni valeur ni “not derived yet”. La
     décision se lit dans la pile, jamais dans un test sur le nom du maître. »
   · « SRD : la Perception passive et l'Initiative sont calculées par `derive`, depuis le
     texte SRD 5.2.1 cité (don Alert compris). »

   LES TEXTES, À LA LETTRE (déclarés dans `srfh-mecaniques-en`, extrait à l'appui) :
   · Initiative (glossaire) — « Your Initiative score equals 10 plus your Dexterity modifier. »
   · Passive Perception (glossaire) — « A creature’s Passive Perception equals 10 plus the
     creature’s Wisdom (Perception) check bonus. »
   · Alert (don) — « Initiative Proficiency. When you roll Initiative, you can add your
     Proficiency Bonus to the roll. »
   · Fate's Hand, Rules Glossary (ligne 27) — « Passive Perception — Nowhere — Perception does
     not exist in Fate's Hand. It was split into Vigilance, Delve and Survival, each rolled. »
   · Fate's Hand, Battlefield Rules — l'initiative n'y apparaît que sous Surprise (« Advantage
     to players on initiative », « Monsters take a flat 8 on initiative ») : des règles de
     TABLE, pas un chiffre de fiche. Le chapitre ne dit rien du modificateur : la formule SRD
     reste, et le silence est cité ici plutôt que comblé.

   ── CE QUE CES GARDES TIENNENT, ET POURQUOI ELLES LISENT LA COUCHE ─────────────────────
   1. Pile FH : ni sens, ni déclaration, ni ligne de fiche — et c'est la COUCHE qui le décide :
      la même pile SRD, sous une couche de scénario qui éteint le seul record, perd sa
      Perception passive de la même façon. Aucun nom de pile n'entre dans la décision.
   2. Pile SRD, contre les cas du texte : un Elfe qui prend Perception (Keen Senses), un
      Elfe qui ne la prend pas, un Criminal (Alert), un Soldier (Savage Attacker, sans rien).
   3. Alert se lit dans sa DÉCLARATION, pas dans son nom : une couche de scénario pose la même
      déclaration sur Savage Attacker, et le Soldier gagne sa maîtrise à l'Initiative.
   4. Une pile qui porte le glossaire SANS la formule (la pile française) : les deux scores
      sont DÉCLARÉS, et la fiche dit « not derived yet » sous le nom lu dans la pile.
   ⚔️ Chacune vue ROUGE sous une mutation avant d'être crue verte (le rapport du lot le dit). */
import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, readJson, uneCouche, PILE_SRD, SRD_FR, HOMEBREW } from "./build-harness.mjs";

globalThis.document = createTestDocument();
const { exempleFhEn } = await import("../src/tools/exemple-fh-en.mjs");
const { createDocWriters } = await import("../src/doc/index.mjs");
const { ABILITY_KEYS } = await import("../src/build/index.mjs");
const { renderFicheTemporaire, MOTS_FICHE } = await import("../ui/builder/fiche-temporaire.mjs");

const PASSIVE = "srd:glossary:en:passive-perception";
const INITIATIVE = "srd:glossary:en:initiative";
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });

let numero = 0;
/** Un magicien sur une pile donnée : DEX 14, SAG 14 (les autres à 12), et des choix en plus. */
function perso(h, plus = []) {
  numero += 1;
  const doc = writers.composer({ name: "Témoin", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(h.layers), id: `fiche-vraie-${numero}`, at: "2026-09-30T00:00:00Z" });
  const six = ABILITY_KEYS.map((k) => ({ path: `abilities.${k}`, value: k === "dex" || k === "wis" ? 14 : 12 }));
  const choix = [{ path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } }, ...six, ...plus];
  return h.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...choix] } } });
}
const elfe = [{ path: "species", ref: { kind: "species", id: "srd:species:en:elf" } }];
const perception = [...elfe, { path: "species.skills[0]", value: "perception" }];
const arrierePlan = (id, don) => [
  { path: "background", ref: { kind: "background", id: `srd:background:en:${id}` } },
  { path: "background.originFeat[0]", ref: { kind: "feat", id: `srd:feat:en:${don}` } }
];
const sens = (out, id) => (out.resolved.senses || []).find((s) => s.id === id);
const fiche = (out, flags = []) => renderFicheTemporaire({ resolved: out.resolved, report: out, document: out.document, flags });
const lignesNonDerivees = (node, cle) => node.querySelector(`[data-rubrique="${cle}"]`).querySelectorAll('[data-absence="non-derive"]');

/* ══ 1 — FATE'S HAND : AUCUNE PERCEPTION PASSIVE, ET C'EST LA COUCHE QUI LE DIT ══════════ */

test("1 — pile Fate's Hand : ni sens, ni déclaration, ni ligne « not derived yet »", () => {
  const { document, report } = exempleFhEn();
  assert.equal(document.resolved.senses.some((s) => s.id === "perception-passive"), false, "aucun sens calculé");
  assert.equal(report.underived.some((u) => u.field.startsWith("senses[perception-passive]")), false,
    "⛔ ni déclaration : un score qui n'existe pas n'est pas « pas encore dérivé »");
  const node = renderFicheTemporaire({ resolved: document.resolved, report, document, flags: ["fh.skills"] });
  assert.equal(lignesNonDerivees(node, "senses").length, 0, "⛔ aucune ligne « not derived yet » dans les sens");
  /* ⭐ L'Initiative, elle, reste : le chapitre FH est muet sur son modificateur (Battlefield Rules :
     la surprise seule), la formule SRD s'applique. */
  assert.equal(document.resolved.initiative.bonus, document.resolved.abilities.dex.mod);
  /* ⭐ LA DÉCISION EST DANS `fh-skills-en`, avec la raison du Rules Glossary. */
  const couche = readJson("layers/fh-skills-en.layer.json");
  assert.equal(couche.records.glossary[PASSIVE].op, "disable");
  assert.match(couche.records.glossary[PASSIVE].reason, /Perception does not exist in Fate's Hand/);
});

test("1b — ⚔️ LA COUCHE, PAS LE NOM : la pile SRD perd sa Perception passive sous une couche qui éteint le record", () => {
  const avant = perso(makeHarness({ layers: PILE_SRD }), perception);
  assert.ok(sens(avant, "perception-passive"), "témoin : la pile SRD la calcule");
  const eteinte = makeHarness({ layers: PILE_SRD,
    extra: uneCouche("scenario-sans-passive", { glossary: { [PASSIVE]: { op: "disable", reason: "scénario" } } }) });
  const apres = perso(eteinte, perception);
  assert.equal(sens(apres, "perception-passive"), undefined, "éteinte, elle ne se calcule plus");
  assert.equal(apres.underived.some((u) => u.field.startsWith("senses[perception-passive]")), false, "et ne se déclare pas");
  assert.equal(lignesNonDerivees(fiche(apres), "senses").length, 0, "et la fiche ne la montre pas");
  /* la même couche ne touche à RIEN d'autre : l'Initiative est identique */
  assert.deepEqual(apres.resolved.initiative, avant.resolved.initiative);
});

/* ══ 2 — SRD : LES CAS DU TEXTE ═══════════════════════════════════════════════════════════ */

test("2 — Perception passive SRD : 10 + le bonus de Sagesse (Perception), maîtrisée ou non", () => {
  const h = makeHarness({ layers: PILE_SRD });
  /* SAG 14 → +2 ; niveau 1 → maîtrise +2. */
  const maitrisee = perso(h, perception);
  const skill = maitrisee.resolved.skills.find((s) => s.id === "perception");
  assert.equal(skill.bonus, 4, "témoin : Perception maîtrisée, +2 SAG +2 maîtrise");
  assert.deepEqual(sens(maitrisee, "perception-passive"), { id: "perception-passive", name: "Passive Perception", value: 14 },
    "« 10 plus the creature’s Wisdom (Perception) check bonus » : 10 + 4");
  const simple = perso(h, elfe);
  assert.equal(sens(simple, "perception-passive").value, 12, "sans la maîtrise : 10 + 2");
  /* ⭐ un score, pas une portée : aucune unité (le contrat : « `unit` absent = score sans unité ») */
  assert.equal("unit" in sens(maitrisee, "perception-passive"), false);
  const ligne = [...fiche(maitrisee).querySelector('[data-rubrique="senses"]').querySelectorAll(".perso-ligne")]
    .find((li) => li.querySelector(".perso-ligne-nom").textContent === "Passive Perception");
  assert.equal(ligne.querySelector(".perso-ligne-valeur").textContent, "14", "⛔ jamais « 14 ft »");
});

test("2b — Initiative SRD : 10 + DEX pour le score, et Alert ajoute la maîtrise au JET", () => {
  const h = makeHarness({ layers: PILE_SRD });
  const soldat = perso(h, arrierePlan("soldier", "savage-attacker"));
  assert.deepEqual(soldat.resolved.initiative,
    { name: "Initiative", bonus: 2, score: 12, parts: [{ name: "DEX", value: 2 }] }, "DEX 14 : +2, score 12");
  const criminel = perso(h, arrierePlan("criminal", "alert"));
  assert.deepEqual(criminel.resolved.initiative,
    { name: "Initiative", bonus: 4, score: 12, parts: [{ name: "DEX", value: 2 }, { name: "Alert", value: 2 }] },
    "« you can add your Proficiency Bonus to the roll » : le jet +4 ; le score reste « 10 plus your Dexterity modifier »");
  const node = fiche(criminel);
  const c = node.querySelector('[data-path="resolved.initiative.bonus"]');
  assert.equal(c.querySelector(".perso-cellule-valeur").textContent, "+4");
  assert.equal(c.querySelector(".perso-cellule-note").textContent, "DEX +2 · Alert +2", "le détail, lu dans `parts`");
});

test("3 — ⚔️ ALERT SE LIT DANS SA DÉCLARATION : posée sur Savage Attacker, le Soldier gagne sa maîtrise", () => {
  const h = makeHarness({ layers: PILE_SRD, extra: uneCouche("scenario-attaquant-vigilant", {
    feat: { "srd:feat:en:savage-attacker": { op: "patch", changes: { "data[initiative_bonus]": { add: "proficiency" } } } }
  }) });
  const soldat = perso(h, arrierePlan("soldier", "savage-attacker"));
  assert.deepEqual(soldat.resolved.initiative.parts, [{ name: "DEX", value: 2 }, { name: "Savage Attacker", value: 2 }]);
  assert.equal(soldat.resolved.initiative.bonus, 4);
});

/* ══ 4 — LE GLOSSAIRE SANS SA FORMULE : DÉCLARÉ, ET NOMMÉ PAR LA PILE ════════════════════ */

test("4 — pile française (glossaire sans formule) : les deux scores DÉCLARÉS, la fiche les nomme par la pile", () => {
  const h = makeHarness({ layers: [SRD_FR, HOMEBREW] });
  const out = perso(h, elfe);
  assert.equal(out.resolved.initiative, undefined, "⛔ jamais un chiffre deviné");
  assert.equal(sens(out, "perception-passive"), undefined);
  const decl = out.underived.filter((u) => u.field === "initiative" || u.field === "senses[perception-passive]");
  assert.deepEqual(decl.map((u) => [u.field, u.key, u.params.record]), [
    ["initiative", "underived.sheet-score-undeclared", INITIATIVE],
    ["senses[perception-passive]", "underived.sheet-score-undeclared", PASSIVE]
  ]);
  /* ⭐ le nom de la ligne vient du record de la pile (ici, le glossaire de la couche française) */
  const noms = Object.fromEntries(decl.map((u) => [u.field, u.params.name]));
  const node = fiche(out);
  const ini = node.querySelector('[data-path="resolved.initiative.bonus"]');
  assert.equal(ini.querySelector(".perso-cellule-etiquette").textContent, noms.initiative);
  assert.equal(ini.querySelector(".perso-cellule-valeur").textContent, MOTS_FICHE.pasDerive);
  const lignes = [...lignesNonDerivees(node, "senses")].filter((x) => x.tagName === "LI" || x.tagName === "li").map((li) => li.querySelector(".perso-ligne-nom").textContent);
  assert.deepEqual(lignes, [noms["senses[perception-passive]"]]);
});

/* ══ 5 — UN CHOIX QUI NE SE RÉSOUT PLUS SE NOMME AVEC SON ÉTAPE (point 3 du mandat) ════════
   📏 Le cas mesuré : l'exemple SRD du dépôt, recalé sur la pile SRD montée (ce que fait
   `Open a file…`, `socle-perso-sauve-s-ouvre-toujours`). ⚖️ ARCHI 35, 30/09 : le contrat ne bouge pas
   (« ref mort → jette ») ; le chemin du refus mène à son étape. */
const { motDeLEcranMort, causeDesChoixMorts, CAUSE_HORS_DES_REGLES } = await import("../ui/builder/ecran-mort.mjs");
const { refusSansFiche } = await import("../ui/builder/parcours.mjs");
const { etapeDuChemin, etapeParId, STEPS } = await import("../ui/builder/etapes.mjs");

function exempleRecale() {
  const h = makeHarness({ layers: PILE_SRD });
  const doc = readJson("examples/personnage-srd-fr-niveau1.fh-char.json");
  doc.build.layers = manifestOf(h.layers);
  assert.throws(() => h.verbs.rebuild({ document: doc }), /gear\[8\]/, "témoin : le contrat tient, `rebuild` jette");
  return { doc, violations: refusSansFiche(h.verbs.validate({ document: doc }).violations) };
}

test("5 — le cas mesuré : Sheet nomme chaque choix mort, avec l'étape qui le pose", () => {
  const { doc, violations } = exempleRecale();
  const morts = violations.filter((v) => v.key === "choice.ref-missing").map((v) => v.path).sort();
  assert.deepEqual(morts, ["feat.extra", "feat.magicInitiate.cantrip", "gear[8]"], "témoin : trois refs morts, nommés par `validate`");
  const mot = motDeLEcranMort(doc, violations, []);
  assert.notEqual(mot.endsWith(CAUSE_HORS_DES_REGLES), true, "⛔ plus le mot général : la cause est connue");
  /* ⭐ l'étape se LIT sur la ceinture, jamais écrite ici */
  assert.ok(mot.includes(`Lanterne pliante on ${etapeParId("equipment", []).mot}`), mot);
  assert.match(mot, /Chuchotement des pages and Lecteur de marges, which no step asks any more/);
  assert.match(mot, /Change it on that step; Save character keeps it safe, New character starts over\./);
  assert.equal(/exemple:|srd:/.test(mot), false, "⛔ jamais un id nu");
});

test("5b — le mot de l'étape suit la pile : un don d'arrière-plan mort se dit « Inheritance » sous Fate's Hand", () => {
  const refus = [{ key: "choice.ref-missing", path: "background.originFeat[0]", params: { kind: "feat", id: "fh:feat:en:auspicious" } }];
  assert.match(causeDesChoixMorts(refus, []), /Auspicious on Background/);
  assert.match(causeDesChoixMorts(refus, ["fh.inheritance"]), /Auspicious on Inheritance/);
  /* un cran NON MONTÉ ne reçoit personne : sans `fh.destiny`, la carte tirée n'a plus d'étape */
  const carte = [{ key: "choice.ref-missing", path: "fh.destiny.arcana", params: { kind: "arcana", id: "fh:arcana:en:the-tower" } }];
  assert.match(causeDesChoixMorts(carte, []), /The tower, which no step asks any more/);
  assert.match(causeDesChoixMorts(carte, ["fh.destiny"]), /The tower on Destiny/);
});

test("5c — ⚔️ CHAQUE CHEMIN QU'UN ÉCRAN ÉCRIT A SON ÉTAPE — relu dans les sources, pas dans une liste", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const dossier = path.join(process.cwd(), "ui/builder");
  const racines = new Set();
  for (const f of fs.readdirSync(dossier).filter((n) => n.endsWith(".mjs"))) {
    const src = fs.readFileSync(path.join(dossier, f), "utf8");
    /* les chemins LITTÉRAUX qu'un verbe `choose`/`set` reçoit : `path: "x.…"` ou `path: \`x[…` */
    /* le chemin LITTÉRAL, jusqu'à sa première interpolation (`gear[${i}]` → `gear[`) */
    for (const m of src.matchAll(/(?:path: |_PATH = )[`"]([a-z][^`"$]*)/g)) racines.add(m[1].replace(/[.[]$/, ""));
  }
  assert.ok(racines.has("gear") && racines.has("fh.destiny.arcana"), `témoin : la lecture trouve les chemins (${[...racines].join(", ")})`);
  const tous = [...new Set(STEPS.map((s) => s.exige).filter(Boolean)), "fh.inheritance"];
  const orphelines = [...racines].filter((r) => etapeDuChemin(r, tous) === null);
  assert.deepEqual(orphelines, [], "une racine qu'un écran écrit et qu'aucune étape ne déclare serait nommée « no step asks »");
});

/* ══ 6 — L'EXEMPLE SRD ANGLAIS, GÉNÉRÉ (point 4, voie c d'ARCHI 35) ══════════════════════ */
const { exempleSrdEn, SORTIE: SORTIE_SRD, PILE: PILE_EXEMPLE_SRD } = await import("../src/tools/exemple-srd-en.mjs");
const { octetsDe } = await import("../src/tools/exemple-fh-en.mjs");
const { SRD_LAYER_ID, SRFH_LAYER_IDS } = await import("../ui/builder/universe-step.mjs");

test("6 — l'exemple SRD commité est EXACTEMENT ce que son générateur produit, sur la pile SRD de l'app", async () => {
  const fs = await import("node:fs");
  const { document } = exempleSrdEn();
  assert.ok(octetsDe(document).equals(fs.readFileSync(SORTIE_SRD)),
    `${SORTIE_SRD} a divergé de son générateur — rejouer « node src/tools/exemple-srd-en.mjs »`);
  /* ⭐ la pile est celle que l'app monte en SRD : le fichier s'ouvre sans recalage */
  assert.deepEqual(document.build.layers.map((c) => c.id), [SRD_LAYER_ID, ...SRFH_LAYER_IDS]);
  assert.deepEqual(PILE_EXEMPLE_SRD.map((f) => f.replace(/^layers\/|\.layer\.json$/g, "")), [SRD_LAYER_ID, ...SRFH_LAYER_IDS]);
});

test("6b — l'exemple SRD porte les trois phrases du texte, calculées", () => {
  const { document, report } = exempleSrdEn();
  const r = document.resolved;
  assert.deepEqual(report.unconsumed, [], "aucun choix sans effet");
  assert.equal(r.abilities.dex.mod, 2, "témoin : DEX 14 + 1 (Criminal) = 15");
  assert.deepEqual(r.initiative, { name: "Initiative", bonus: 4, score: 12,
    parts: [{ name: "DEX", value: 2 }, { name: "Alert", value: 2 }] });
  const perception = r.skills.find((s) => s.id === "perception");
  assert.notEqual(perception.proficiency, "none", "témoin : Keen Senses sur Perception (maîtrisée)");
  assert.deepEqual(sens({ resolved: r }, "perception-passive"),
    { id: "perception-passive", name: "Passive Perception", value: 10 + perception.bonus });
});
