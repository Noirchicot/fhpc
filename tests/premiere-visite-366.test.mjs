/* ══ LOT 366 — LA PREMIÈRE VISITE OUVRE UNE FICHE VIERGE : PLUS D'ILYRA NULLE PART ═══
   ⚖️ Eric, 30/09, à *« Première visite du builder : aujourd'hui, l'exemple Ilyra est chargé en
   silence et traité comme ton perso. Que doit voir un joueur neuf ? »* → **« Fiche vierge »**.
   Puis, à *« dans quelle langue et quelles unités naît la fiche vierge d'une première
   visite ? »* → **« Anglais + pieds/livres »**.
   Mandat : vault `FH-WEB/FHPC/FHPC lot 366 premiere visite.md` (ARCHI 35).

   Ce que ces gardes tiennent — chacune vue ROUGE par mutation :
     1. un stockage VIDE ouvre un document sans aucun choix (le niveau de naissance, rien
        d'autre), né par `personnageNeuf` — jamais l'exemple ;
     2. `New character` y offre `Cancel · Start` : il n'y a rien à effacer ;
     3. éteindre Fate's Hand sur une fiche vierge ne demande aucune sauvegarde ;
     4. aucun code servi au joueur ne charge l'exemple — le graphe des modules de la page,
        arpenté depuis `index.html`, pas une liste de fichiers ;
     5. un banc qui part de l'exemple le POSE lui-même : aucun banc ne compte sur le
        démarrage pour retrouver Ilyra (ARCHI 35, 30/09). */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { makeHarness, readJson, PILE_SRD } from "./build-harness.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

globalThis.document = createTestDocument();

const { personnageEnCours, popupNouveauPersonnage, fhRefChoices, NOM_DU_PERSONNAGE_NEUF, REGLAGES_DE_LA_PREMIERE_VISITE } =
  await import("../ui/builder/universe-step.mjs");
const { createDocWriters, CHOIX_DE_NAISSANCE } = await import("../src/doc/writers.mjs");
const { manifesteDeLaPile } = await import("../ui/builder/layers-ecran.mjs");

const shell = fs.readFileSync(path.join(UI, "shell.mjs"), "utf8");
const { composer } = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });

/** La fiche vierge, telle que la coquille la fait naître à la première visite :
 *  `personnageNeuf(null)` — les réglages DONNÉS, la pile montée (ici la vraie pile SRD). */
function ficheVierge() {
  const h = makeHarness(PILE_SRD);
  return composer({
    name: NOM_DU_PERSONNAGE_NEUF,
    lang: REGLAGES_DE_LA_PREMIERE_VISITE.lang,
    units: { ...REGLAGES_DE_LA_PREMIERE_VISITE.units },
    layers: manifesteDeLaPile(h.layers.verbs.stack()),
    id: "premiere-visite-366", at: "2026-09-30T00:00:00.000Z"
  });
}

test("1 — 🔴 UN STOCKAGE VIDE OUVRE UN DOCUMENT SANS AUCUN CHOIX, né par `personnageNeuf`, jamais l'exemple", () => {
  /* Le câblage : tout ce qui n'est pas « lu » (vide, ou refus nommé) naît vierge. */
  const code = stripComments(shell);
  assert.match(code, /state\.document = garde\.etat === "lu" \? garde\.document : personnageNeuf\(null\);/,
    "rien à reprendre → une fiche vierge, par le MÊME écrivain que New character");
  /* ⚠️ `personnageNeuf` lit `state.docWriters` : il doit être construit AVANT la lecture. */
  const ecrivains = code.indexOf("state.docWriters = createDocWriters({ schema });");
  const lecture = code.indexOf("const garde = lirePersonnage();");
  assert.ok(ecrivains > 0 && lecture > ecrivains, "les écrivains du document existent avant que la fiche vierge naisse");
  assert.equal(code.split("createDocWriters({ schema })").length - 1, 1, "construits UNE fois (lot 54)");
  /* La donnée : le niveau de naissance, rien d'autre. */
  const vierge = ficheVierge();
  assert.deepEqual(vierge.build.choices, CHOIX_DE_NAISSANCE.map((c) => ({ ...c })), "aucun choix au-delà du niveau de naissance");
  assert.equal(vierge.name, NOM_DU_PERSONNAGE_NEUF);
  assert.equal(personnageEnCours(vierge, composer), false, "« pas de perso en cours » : c'est dans la donnée");
  assert.ok(vierge.build.layers.length > 0, "la pile MONTÉE est déclarée (les Layers en place)");
});

test("1 bis — ⚖️ la langue et les unités de la première visite sont le mot d'Eric : « Anglais + pieds/livres »", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(REGLAGES_DE_LA_PREMIERE_VISITE)), { lang: "en", units: { distance: "ft", weight: "lb" } });
  assert.ok(Object.isFrozen(REGLAGES_DE_LA_PREMIERE_VISITE) && Object.isFrozen(REGLAGES_DE_LA_PREMIERE_VISITE.units),
    "un réglage DONNÉ ne se modifie pas en route");
  const vierge = ficheVierge();
  assert.equal(vierge.lang, "en");
  assert.deepEqual(vierge.units, { distance: "ft", weight: "lb" });
});

test("2 — 🔴 SUR UNE FICHE VIERGE, `New character` OFFRE `Cancel · Start` — rien à effacer", () => {
  const vierge = ficheVierge();
  /* La dérivation du démarrage estampille `modified` et `resolved` : ce n'est pas un choix. */
  const redemarre = { ...vierge, modified: "2026-09-30T08:00:00.000Z", resolved: { derivation: { at: "2026-09-30T08:00:00.000Z" } } };
  for (const doc of [vierge, redemarre]) {
    const popup = popupNouveauPersonnage({ enCours: personnageEnCours(doc, composer), choisir: () => {} });
    assert.deepEqual(popup.actions.map((a) => a.mot), ["Cancel", "Start"]);
    assert.equal(popup.texte.includes("erased"), false, "le troisième avertissement se tait");
  }
  /* ⚔️ Le témoin qui peut accuser : un seul geste, et le perso est à quelqu'un. */
  const nomme = { ...vierge, name: "Nodren" };
  assert.deepEqual(popupNouveauPersonnage({ enCours: personnageEnCours(nomme, composer), choisir: () => {} }).actions.map((a) => a.mot),
    ["Cancel", "Delete", "Save"]);
});

test("3 — 🔴 ÉTEINDRE FATE'S HAND SUR UNE FICHE VIERGE NE DEMANDE AUCUNE SAUVEGARDE", () => {
  /* La question de Layers se lit déjà dans la donnée (un choix `fh:`) : elle n'apparaissait
     à la première visite QUE parce qu'Ilyra en porte. Le garde tient les deux bouts. */
  assert.match(stripComments(shell), /const needsConfirm = action\.value === "srd" && fhRefChoicesPresent\(state\.document\);/);
  assert.match(stripComments(shell), /function fhRefChoicesPresent\(document\) \{\s*return fhRefChoices\(document, state\.engine\.layers\.verbs\.query\)\.length > 0;/);
  assert.deepEqual(fhRefChoices(ficheVierge(), null), [], "une fiche vierge n'a aucun choix Fate's Hand : pas de question");
  const exemple = readJson("examples/personnage-fh-en-niveau1.fh-char.json");
  assert.ok(fhRefChoices(exemple, null).length > 0, "témoin : l'exemple, lui, en porte — c'est lui qui faisait poser la question");
});

/** Le graphe des modules que la PAGE charge, arpenté depuis `index.html` : imports statiques,
 *  `import()` dynamiques, le `src` du module. ⛔ Pas une liste de fichiers : un module ajouté
 *  demain au graphe est lu tout seul. */
function grapheDuJoueur() {
  const vus = new Map();
  const index = path.join(UI, "index.html");
  const html = fs.readFileSync(index, "utf8");
  vus.set(index, html);
  const aVisiter = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map((m) => path.resolve(UI, m[1].split("?")[0]));
  while (aVisiter.length > 0) {
    const fichier = aVisiter.pop();
    if (vus.has(fichier) || !fs.existsSync(fichier)) continue;
    const texte = fs.readFileSync(fichier, "utf8");
    vus.set(fichier, texte);
    const code = stripComments(texte);
    for (const m of code.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g)) {
      if (m[1].startsWith(".")) aVisiter.push(path.resolve(path.dirname(fichier), m[1].split("?")[0]));
    }
  }
  return vus;
}

test("4 — 🔴 AUCUN CODE SERVI AU JOUEUR NE CHARGE L'EXEMPLE", () => {
  const graphe = grapheDuJoueur();
  assert.ok(graphe.has(path.join(UI, "shell.mjs")) && graphe.has(path.join(UI, "engine.mjs")) && graphe.has(path.join(UI, "universe-step.mjs")),
    "témoin : l'arpenteur trouve bien la coquille, le moteur et l'écran Layers");
  assert.ok(graphe.size > 40, `témoin : le graphe entier est lu (${graphe.size} fichiers)`);
  const fautes = [];
  for (const [fichier, texte] of graphe) {
    const code = fichier.endsWith(".html") ? texte.replace(/<!--[\s\S]*?-->/g, "") : stripComments(texte);
    if (/examples\/|personnage-fh-en-niveau1|loadExampleDocument/.test(code)) fautes.push(path.relative(ROOT, fichier));
  }
  assert.deepEqual(fautes, [], "l'exemple reste au dépôt pour les bancs et les tests, jamais pour un joueur");
});

test("5 — 🔴 UN BANC QUI PART DE L'EXEMPLE LE POSE LUI-MÊME : aucun ne compte sur le démarrage pour retrouver Ilyra", async () => {
  /* Tout banc qui monte la page (`index.html` en iframe) doit ÉCRIRE lui-même le personnage
     qu'il joue, sous la clef de la page : un banc qui vide le stockage et attend Ilyra
     jouerait désormais une fiche vierge. */
  const { CLEF_PERSONNAGE } = await import("../ui/builder/memoire.mjs");
  assert.equal(CLEF_PERSONNAGE, "fhpc.personnage", "témoin : la clef de la page, lue chez son écrivain");
  const bancs = fs.readdirSync(UI).filter((f) => f.endsWith(".html") && f !== "index.html")
    .filter((f) => /\.src\s*=\s*["'`]\.\/index\.html/.test(fs.readFileSync(path.join(UI, f), "utf8")));
  assert.ok(bancs.includes("banc-parcours.html") && bancs.includes("banc-listes.html"), `témoin : les bancs qui montent la page (${bancs.join(", ")})`);
  for (const banc of bancs) {
    const code = fs.readFileSync(path.join(UI, banc), "utf8").replace(/<!--[\s\S]*?-->/g, "");
    const echappee = CLEF_PERSONNAGE.replace(".", "\\.");
    const clef = code.match(new RegExp(`const (\\w+) = "${echappee}";`));
    const pose = new RegExp(`localStorage\\.setItem\\((?:"${echappee}"${clef ? `|${clef[1]}` : ""}),`);
    assert.match(code, pose, `${banc} monte la page : il doit POSER son personnage lui-même`);
  }
});
