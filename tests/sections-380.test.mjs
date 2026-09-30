/* ══ LOT 380 — BACKPACK : `/` RENOMME TOUJOURS, `×` FAIT CE QUE SA LÉGENDE DIT ═══════════════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 380 sections.md` (ARCHI 35, 30/09). Règle : NORMES
   `equipement-sections-renommer-et-effacer` — Eric, 30/09, au doigt : *« le "/" est grisé, il faut d'abord faire
   "x" (qui efface le texte) pour ensuite faire / pour taper le nom. illogique. X devrait détruire la tuile pas
   juste enlever son nom. / modifier ou remplacer le nom »* ; puis *« Garde la règle du 19/09 »*. ARCHI 35, 30/09 :
   au-delà de 5, les Storage de base se détruisent aussi (a).

   🔴 LA CAUSE, MESURÉE (v931, 1280, perso neuf) : les poignées étaient calculées pour la section sous le viseur AU
   RENDU, puis le viseur tournait SANS repeindre. Ouvert sur « Backpack dropdown », `/` restait éteint partout.

   CE QUE CE FICHIER GARDE :
     P. LES POIGNÉES — un seul lecteur (`poigneesDeLaSection`) sur la VRAIE liste de la roue, quel que soit son
        ordre ; et ⚔️ elles SUIVENT le viseur qui tourne sans repeindre (le défaut d'Eric, rejoué).
     X. `×` — sous 5 il vide, au-delà il détruit (les Storage de base aussi, par leur marqueur), jamais le Party
        bag ni le dépôt, jamais une section pleine — pleine où qu'elle soit rangée.
     L. LA LÉGENDE — elle dit ce que `/` et `×` font. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
const etape = stripComments(fs.readFileSync(path.join(UI, "equipment-step.mjs"), "utf8"));

const { construireLeSac, poigneesDeLaSection, poserLesDalles, REPOS_MS, CHAMPS_DE_SECTION } = await import("../ui/builder/sac-ecran.mjs");
const D = await import("../ui/builder/sac-disposition.mjs");
const {
  disposerLeSac, sectionsDuSac, gesteDuX, sectionPleine, ecritureDeLaDestruction, sectionsDetruites,
  cheminDeLaDestruction, cheminDuDepot, cheminDuParty, cheminDuDehors, cheminDuRang, SECTION_PARTY, SECTION_DEPOT,
  SECTIONS_DU_SAC
} = await import("../ui/builder/equipment-step.mjs");

async function jusqua(condition, echeance = 3000) {
  const fin = Date.now() + echeance;
  while (Date.now() < fin) {
    if (condition()) return true;
    await new Promise((r) => setTimeout(r, 10));
  }
  return condition();
}

/** UN SAC COMME CELUI D'ERIC, ET PLUS : le Party bag, le dépôt, Storage 1 à 3, un second dropdown (4), un Party
 *  bag 2 (5), une place « Other » (6) — et le Party bag déplacé au MILIEU de la roue (l'ordre ne doit rien changer). */
function docDuSac({ choix = [], rangs = true } = {}) {
  const c = [
    { path: "backpack.sections[4].name", value: "Backpack dropdown 2" }, { path: cheminDuDepot(4), value: 1 },
    { path: "backpack.sections[5].name", value: "Party bag 2" }, { path: cheminDuParty(5), value: 1 },
    { path: "backpack.sections[6].name", value: "Horse" }, { path: cheminDuDehors(6), value: 1 }
  ];
  if (rangs) {
    /* le Party bag au milieu : 0 dépôt · 1 S1 · 2 S2 · 3 PARTY · 4 S3 · … */
    [[SECTION_DEPOT, 0], [1, 1], [2, 2], [SECTION_PARTY.clef, 3], [3, 4], [4, 5], [5, 6], [6, 7]]
      .forEach(([clef, rang]) => c.push({ path: cheminDuRang(clef), value: rang }));
  }
  return { schema: "fh-char/1", id: "sonde-380", name: "Kara", build: { layers: [], choices: [...c, ...choix], budgets: {}, overrides: [] } };
}
const pourLaRoue = (sections) => sections.map((s) => Object.fromEntries(CHAMPS_DE_SECTION.filter((k) => s[k] !== undefined).map((k) => [k, s[k]])));

/* ══ P — LES POIGNÉES ══════════════════════════════════════════════════════════════════════════════ */

test("P1 — 🖐️ `/` ALLUMÉ SUR CHAQUE SECTION RENOMMABLE, ÉTEINT SEULEMENT LÀ OÙ UNE RÈGLE LE DIT — sur la vraie liste, Party bag au milieu", () => {
  for (const rangs of [false, true]) {
    const sections = disposerLeSac(docDuSac({ rangs })).sections;
    const noms = sections.map((s) => s.nom);
    assert.ok(noms.includes("Party bag 2") && noms.includes("Backpack dropdown 2") && noms.includes("Horse"));
    if (rangs) assert.equal(noms.indexOf("Party bag"), 3, "le Party bag n'est plus en tête");
    const lu = sections.map((s, k) => [s.nom, poigneesDeLaSection(pourLaRoue(sections), k).editer]);
    assert.deepEqual(Object.fromEntries(lu), {
      "Party bag": false,             // ⚖️ 19/09 : ni effacé ni renommé
      "Backpack dropdown": false,     // ⚖️ 19/09 : son nom dit où Send range
      "Backpack dropdown 2": false,   // ⚖️ lot 356 : un dropdown ne se renomme pas
      "Party bag 2": true,            // ⚖️ Eric, 29/09 : *« celui-ci reste bleu, mais son nom est éditable »*
      "Storage 1": true, "Storage 2": true, "Storage 3": true, "Horse": true
    }, `ordre ${rangs ? "du joueur" : "naturel"}`);
  }
  /* un dropdown MONTRÉ (le trop-plein, pas encore écrit) ne se renomme ni ne s'efface */
  const montre = { nom: "Backpack dropdown 3", fige: true, renommable: false, depot: true };
  assert.deepEqual(poigneesDeLaSection([{ nom: "A" }, montre], 1), { editer: false, effacer: false, reculer: true, avancer: false });
  assert.deepEqual(poigneesDeLaSection([{ nom: "A" }], 5), { editer: false, effacer: false, reculer: false, avancer: false }, "hors de la liste : tout s'éteint");
});

test("P2 — ⚔️ LES POIGNÉES SUIVENT LE VISEUR QUI TOURNE SANS REPEINDRE — le défaut d'Eric, rejoué", async () => {
  const sections = pourLaRoue(disposerLeSac(docDuSac()).sections);
  const depot = sections.findIndex((s) => s.nom === "Backpack dropdown");
  const vues = [];
  /* ⭐ UN SEUL RENDU, ouvert sur le dépôt — exactement l'écran d'Eric ; ensuite le viseur tourne, et RIEN ne repeint */
  const n = construireLeSac({ sections, section: depot, edition: true, objets: [], poids: {}, destinations: [],
    dalles: sections.map((_, i) => ({ section: i, objets: [] })), dalle: depot, surDalle: (k) => vues.push(k) }).noeud;
  poserLesDalles();
  const roue = n.querySelector(".sac-roue");
  const poignee = (clef) => n.querySelector(`[data-organe="${clef}"]`);
  assert.equal(poignee("editer").disabled, true, "sur le dépôt, `/` est éteint — une règle le dit");
  const releve = [];
  for (let k = 0; k < sections.length; k += 1) {
    if (k === depot) continue;
    const avant = vues.length;
    roue.scrollLeft = D.ROUE.pas * k;
    await jusqua(() => vues.length > avant);
    await new Promise((r) => setTimeout(r, REPOS_MS));
    const attendu = poigneesDeLaSection(sections, k);
    releve.push([sections[k].nom, !poignee("editer").disabled, !poignee("effacer").disabled]);
    assert.equal(poignee("editer").disabled, !attendu.editer, `/ sur ${sections[k].nom}`);
    assert.equal(poignee("effacer").disabled, !attendu.effacer, `× sur ${sections[k].nom}`);
    assert.equal(poignee("reculer").disabled, !attendu.reculer, `← sur ${sections[k].nom}`);
    assert.equal(poignee("avancer").disabled, !attendu.avancer, `→ sur ${sections[k].nom}`);
  }
  const storage1 = releve.find(([nom]) => nom === "Storage 1");
  assert.deepEqual(storage1, ["Storage 1", true, true], "⭐ sur Storage 1, `/` s'allume SANS qu'on touche `×`");
  assert.deepEqual(releve.find(([nom]) => nom === "Party bag"), ["Party bag", false, false], "et le Party bag refuse les deux");
});

test("P3 — 🔌 UN SEUL LECTEUR, APPELÉ AU RENDU ET À CHAQUE ARRÊT DU VISEUR", () => {
  const src = stripComments(fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8"));
  const noticeSrc = src.match(/function notice\(options\) \{[\s\S]*?\n\}/)[0];
  assert.match(noticeSrc, /const permis = poigneesDeLaSection\(options\.sections, options\.section \| 0\);/);
  assert.match(noticeSrc, /const p = poigneesDeLaSection\(options\.sections, rang\);/, "`suivre` lit par le MÊME lecteur");
  assert.equal(/figee\.renommable|figee\.fige/.test(src), false, "⛔ plus aucune lecture de la section du RENDU pour allumer une poignée");
  assert.match(src, /if \(suivreLesPoignees && dalles\[k\]\) suivreLesPoignees\(/);
});

/* ══ X — `×` ═══════════════════════════════════════════════════════════════════════════════════════ */

test("X1 — ✂️ LE GESTE DE `×` : sous 5 il vide, au-delà il détruit ; jamais le Party bag ni le dépôt", () => {
  const de = (n) => [{ index: SECTION_PARTY.clef, nom: "Party bag" }, { index: SECTION_DEPOT, nom: "Backpack dropdown" },
    ...Array.from({ length: n - 2 }, (_, i) => ({ index: i + 1, nom: `Storage ${i + 1}` }))];
  const cinq = de(5);
  const six = de(6);
  assert.equal(gesteDuX(cinq, 2), "vider", "⚖️ 19/09 — cinq sections : la tuile reste, son nom s'efface");
  assert.equal(gesteDuX(six, 2), "detruire", "⚖️ 30/09 — au-delà de cinq : la tuile disparaît (une Storage de BASE aussi)");
  assert.equal(gesteDuX(six, 0), "refus-party");
  assert.equal(gesteDuX(cinq, 0), "refus-party", "même sous cinq");
  assert.equal(gesteDuX(six, 1), "refus-depot");
  assert.equal(gesteDuX(six, 9), null, "hors de la liste : rien");
  /* la roue compte comme on la voit : Party bag et dropdowns compris */
  assert.equal(gesteDuX(disposerLeSac(docDuSac()).sections, disposerLeSac(docDuSac()).sections.findIndex((s) => s.nom === "Storage 1")), "detruire");
});

test("X2 — 🗑️ UNE STORAGE DE BASE DÉTRUITE NE REVIENT PAS — et le dépôt ne se détruit jamais, même si un document le prétend", () => {
  assert.deepEqual(ecritureDeLaDestruction(2), { verbe: "set", path: cheminDeLaDestruction(2), value: 1 }, "une section de base : son marqueur");
  assert.deepEqual(ecritureDeLaDestruction(SECTIONS_DU_SAC + 3), { verbe: "clear", path: `backpack.sections[${SECTIONS_DU_SAC + 3}].name` },
    "une section ajoutée : son nom retiré, comme avant");
  const avant = sectionsDuSac(docDuSac({ rangs: false })).map((s) => s.nom);
  assert.ok(avant.includes("Storage 2"));
  const apres = sectionsDuSac(docDuSac({ rangs: false, choix: [{ path: cheminDeLaDestruction(2), value: 1 }] })).map((s) => s.nom);
  assert.deepEqual(apres, avant.filter((n) => n !== "Storage 2"), "⭐ la tuile disparaît, les autres ne bougent pas");
  const faux = docDuSac({ rangs: false, choix: [{ path: cheminDeLaDestruction(SECTION_DEPOT), value: 1 }] });
  assert.equal(sectionsDetruites(faux).has(SECTION_DEPOT), false);
  assert.ok(sectionsDuSac(faux).some((s) => s.nom === "Backpack dropdown"), "⛔ une destination de Send ne peut pas manquer");
});

test("X3 — 🎒 UNE SECTION PLEINE REFUSE DE PARTIR, OÙ QU'ELLE SOIT RANGÉE — « Other » compris", () => {
  const ligne = (i, lieu, boite) => [{ path: `gear[${i}]`, ref: "srd:item:en:rope" },
    { path: `gear[${i}].location`, value: lieu }, { path: `gear[${i}].boite`, value: boite }];
  assert.equal(sectionPleine(docDuSac(), 2), false, "Storage 2, vide");
  assert.equal(sectionPleine(docDuSac({ choix: ligne(0, "backpack", "s2") }), 2), true, "un objet porté");
  assert.equal(sectionPleine(docDuSac(), 6), false, "Horse, vide");
  assert.equal(sectionPleine(docDuSac({ choix: ligne(0, "storage", "s6") }), 6), true,
    "🔴 un objet rangé DEHORS (« Other ») : l'ancien filtre (`location: backpack`) le laissait partir");
});

test("X4 — 🔌 L'ÉCRAN ET LA COQUILLE LISENT LA MÊME DÉCISION", () => {
  const supprimer = etape.match(/surSupprimer: \(\) => \{[\s\S]*?\n {6}\},/)[0];
  assert.match(supprimer, /const geste = gesteDuX\(sections, sectionSac\);/);
  assert.match(supprimer, /if \(geste === "vider"\) \{ act\(\{ kind: "viderSection", index: s\.index \}\); return; \}/);
  assert.equal(/sections\.length <= 5/.test(supprimer), false, "⛔ plus de seconde copie du plancher");
  const coquille = shell.slice(shell.indexOf('action.kind === "supprimerSection"'), shell.indexOf("VERBES_QUI_DEPLACENT.has(action.kind)"));
  assert.match(coquille, /if \(sectionPleine\(state\.document, action\.index\)\) \{/);
  assert.match(coquille, /const ecriture = ecritureDeLaDestruction\(action\.index\);/);
  assert.equal(/location \|\| "backpack"\) === "backpack"/.test(coquille), false, "⛔ plus le filtre qui oubliait « Other »");
});

/* ══ L — LA LÉGENDE ════════════════════════════════════════════════════════════════════════════════ */

test("L1 — 📖 LA LÉGENDE DIT CE QUE `/` ET `×` FONT", () => {
  const sections = pourLaRoue(disposerLeSac(docDuSac()).sections);
  const n = construireLeSac({ sections, section: 1, edition: true, objets: [], poids: {}, destinations: [] }).noeud;
  const lignes = Object.fromEntries([...n.querySelectorAll(".sac-notice-liste li")].map((li) =>
    [li.querySelector(".sac-notice-signe").dataset.signe, li.querySelector(".sac-notice-quoi").textContent]));
  assert.equal(lignes.effacer, "Delete it once it is empty. Five sections or fewer: clears the name.");
  assert.equal(/comes back to you/.test(lignes.effacer), false, "⛔ la promesse fausse est partie");
  assert.equal(lignes.editer, "Rename it: type to replace the name, or tap in it to fix a letter.", "*« modifier ou remplacer »*, dit");
});
