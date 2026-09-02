/* ══ L'ÉCRAN DISPLAY — LOT 136, 2026-09-02 ════════════════════════════════

   Eric : *« Menu peut avoir une branche S. On y va via un bouton Display.
   Toutes les résolutions en drop down. Les backgrounds en drop down. »*

   🔴 CE QUE CE FICHIER GARDE, et rien d'autre :

     1. le Menu d'entrée porte UNE PORTE, et plus la rampe de fonds — un
        réglage déménagé qui resterait aussi à son ancienne place ferait deux
        organes pour un choix ;
     2. le sous-écran rend DEUX dropdowns, et l'auto y est la PREMIÈRE ligne —
        *« l'auto reste le défaut, le joueur surcharge »* ;
     3. chaque ligne DIT CE QU'ELLE REND. Une ligne qui n'annoncerait qu'un nom
        de cran laisserait le joueur choisir une fraction abstraite ;
     4. le retour à Auto EXISTE, et il passe par la chaîne vide ;
     5. la coquille est CÂBLÉE aux trois gestes du rang (ouvrir, remonter,
        choisir) — lu dans la source, faute de pouvoir monter la coquille ici.

   ⚠️ ON TESTE LA FONCTION, PAS LA PAGE (`tests/dom-stub.mjs`). La géométrie et
   la lisibilité se regardent au navigateur ; ce fichier garde le RAISONNEMENT
   et le CÂBLAGE. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");

globalThis.document = createTestDocument();
/* `echelle.mjs` (importé par l'écran pour le mot d'un échelon) lit
   `localStorage` — Node n'en a pas, et son `try` retomberait sur `null`. On
   lui en donne un plutôt que de mesurer un repli. */
const MAGASIN = new Map();
globalThis.window = {
  localStorage: {
    getItem: (k) => (MAGASIN.has(k) ? MAGASIN.get(k) : null),
    setItem: (k, v) => MAGASIN.set(k, String(v)),
    removeItem: (k) => MAGASIN.delete(k)
  }
};

const { renderUniverseStep } = await import("../ui/builder/universe-step.mjs");
const { CRANS_OFFERTS, motDeLEchelon } = await import("../ui/builder/echelle.mjs");

/* ── LE DÉCOR ────────────────────────────────────────────────────────────
   Un état d'échelle FABRIQUÉ, pas mesuré : ce qui est mesuré vit dans
   `tests/fraction-d-ecran.test.mjs`, qui garde l'arithmétique. Ici on garde ce
   que l'écran FAIT de ce qu'il reçoit. */
const CRAN_DEMI = CRANS_OFFERTS.find((b) => b.part === 2);
function etatEchelle(choisi = null) {
  const entre = { part: 2.5, barreaux: [CRAN_DEMI, CRANS_OFFERTS.find((b) => b.part === 3)] };
  return {
    auto: entre,
    autoRendu: { largeur: 472, hauteur: 705, facteur: 1.26 },
    choisi,
    effectif: choisi ? { part: choisi.part, barreaux: [choisi] } : entre,
    offres: CRANS_OFFERTS.map((b, i) => ({
      barreau: b,
      echelon: { part: b.part, barreaux: [b] },
      rendu: { largeur: 700 - i * 40, hauteur: 1045 - i * 60, facteur: 1 }
    }))
  };
}
const FONDS = [
  { id: "a", nom: "Amber", jour: "a-day.jpg", nuit: "a-night.jpg" },
  { id: "b", nom: "Mist", jour: "b-day.jpg", nuit: "b-night.jpg" },
  { id: "c", nom: "Slate", jour: "c-day.jpg", nuit: "c-night.jpg" }
];
const DOC = {
  schema: "fh-char/1", id: "display-test", name: "Sonde", lang: "en",
  units: { distance: "ft", weight: "lb" },
  build: { layers: [], choices: [], budgets: {}, overrides: [] }
};

function entree(extra = {}, onAction = () => {}) {
  return renderUniverseStep({
    document: DOC, query: () => null, tutoriel: true,
    vueDouble: false, vueDoublePossible: true,
    fonds: FONDS, fond: "b", echelle: etatEchelle(), memoire: { ok: true },
    ...extra
  }, onAction);
}
function display(extra = {}, onAction = () => {}) {
  return entree({ ecran: "display", ...extra }, onAction);
}
const selects = (node) => node.querySelectorAll(".display-select");
const mots = (select) => select.querySelectorAll("option").map((o) => o.textContent);

/* ══ 1 — L'ÉCRAN D'ENTRÉE : UNE PORTE, ET PLUS LA RAMPE ══════════════════ */

test("🚪 le Menu d'entrée porte un bouton Display, et il ouvre le sous-écran", () => {
  let vu = null;
  const node = entree({}, (a) => { vu = a; });
  const portes = node.querySelectorAll(".display-porte");
  assert.equal(portes.length, 1, "une porte, une seule");
  assert.equal(portes[0].textContent, "Display", "le mot est celui d'Eric");
  portes[0].dispatchEvent({ type: "click" });
  assert.deepEqual(vu, { kind: "ouvrirDisplay" });
});

test("⛔ le choix de fond a QUITTÉ l'écran d'entrée — il ne reste pas aux deux places", () => {
  /* Un réglage déménagé qui survit à son ancienne adresse fait deux organes
     pour un choix, et le joueur qui en règle un voit l'autre lui répondre. */
  const node = entree();
  assert.equal(selects(node).length, 0, "aucun dropdown à l'entrée du Menu");
  assert.equal(node.querySelectorAll(".bascule-liste").length, 1,
    "il ne reste que la rampe des RÈGLES — celle des fonds est partie");
});

/* ══ 2 — LE SOUS-ÉCRAN ═══════════════════════════════════════════════════ */

test("🪟 le sous-écran rend DEUX dropdowns, et se déclare comme un écran à sortie", () => {
  const node = display();
  assert.equal(node.getAttribute("data-ecran"), "display");
  assert.equal(node.dataset.sortieIci, "true",
    "⛔ il ne fabrique pas son `Back` : il DÉCLARE où la coquille pose la paire");
  assert.equal(selects(node).length, 2, "les résolutions, et les fonds");
  assert.deepEqual(
    node.querySelectorAll("h3").map((h) => h.textContent),
    ["Interface size", "Background"]);
});

test("🔴 l'AUTO est la PREMIÈRE ligne, et elle DIT lequel l'auto a choisi", () => {
  /* ⛔ « Auto » serait sinon le seul libellé de la liste à ne rien dire, et le
     joueur ne saurait pas d'où il part — ni qu'il a atterri ENTRE deux crans. */
  const [taille] = selects(display());
  const premier = mots(taille)[0];
  assert.match(premier, /^Auto — /);
  assert.ok(premier.includes(motDeLEchelon(etatEchelle().auto)),
    `la ligne Auto doit nommer l'échelon choisi — lu : « ${premier} »`);
  assert.ok(premier.includes("472 × 705"), `et dire ce qu'il rend — lu : « ${premier} »`);
});

test("🔴 chaque cran DIT CE QU'IL REND, en pixels — pas une fraction abstraite", () => {
  const [taille] = selects(display());
  const lignes = mots(taille).slice(1);
  assert.equal(lignes.length, CRANS_OFFERTS.length, "un cran offert, une ligne");
  lignes.forEach((mot, i) => {
    const offre = etatEchelle().offres[i];
    assert.ok(mot.startsWith(`${offre.barreau.libelle} — `), `« ${mot} » ne commence pas par son libellé`);
    assert.ok(mot.includes(`${offre.rendu.largeur} × ${offre.rendu.hauteur}`),
      `« ${mot} » n'annonce pas la taille rendue`);
  });
});

test("🎛️ choisir un cran émet son NOM ; revenir à Auto émet la chaîne vide", () => {
  /* ⛔ L'écran n'écrit pas `null` : c'est la coquille qui traduit « rien » en
     « efface la clef ». Deux décideurs pour une préférence, c'est un de trop. */
  const vus = [];
  const [taille] = selects(display({}, (a) => vus.push(a)));
  taille.value = CRAN_DEMI.nom;
  taille.dispatchEvent({ type: "change" });
  const [retour] = selects(display({ echelle: etatEchelle(CRAN_DEMI) }, (a) => vus.push(a)));
  retour.value = "";
  retour.dispatchEvent({ type: "change" });
  assert.deepEqual(vus, [
    { kind: "cranChoisi", value: CRAN_DEMI.nom },
    { kind: "cranChoisi", value: "" }
  ]);
});

test("⚔️ ATTAQUE — la ligne allumée est celle qui est SERVIE, pas la première venue", () => {
  const surAuto = selects(display())[0];
  assert.equal(surAuto.value, "", "sans choix, Auto");
  assert.equal(mots(surAuto).findIndex((_, i) => surAuto.querySelectorAll("option")[i].selected), 0);
  const surCran = selects(display({ echelle: etatEchelle(CRAN_DEMI) }))[0];
  assert.equal(surCran.value, CRAN_DEMI.nom);
  const allumee = surCran.querySelectorAll("option").filter((o) => o.selected);
  assert.equal(allumee.length, 1, "une seule ligne allumée");
  assert.equal(allumee[0].value, CRAN_DEMI.nom);
});

test("🖼️ les fonds sont un dropdown bâti sur la LISTE REÇUE, et il émet l'id choisi", () => {
  /* 🔴 Une quatrième collection doit arriver par les DONNÉES. Un `for` sur
     trois paires nommées ici aurait marché aujourd'hui et menti au prochain. */
  let vu = null;
  const fond = selects(display({}, (a) => { vu = a; }))[1];
  assert.deepEqual(mots(fond), FONDS.map((f) => f.nom));
  assert.equal(fond.value, "b");
  fond.value = "c";
  fond.dispatchEvent({ type: "change" });
  assert.deepEqual(vu, { kind: "fondChoisi", value: "c" });
});

test("⛔ registre absent : PAS de bloc Background — jamais une liste vide présentée comme un choix", () => {
  const node = display({ fonds: [], fond: undefined });
  assert.equal(selects(node).length, 1, "le cran d'interface reste : il ne dépend d'aucun réseau");
  assert.deepEqual(node.querySelectorAll("h3").map((h) => h.textContent), ["Interface size"]);
});

test("⚠️ quand plusieurs crans rendent la MÊME chose, l'écran le DIT", () => {
  /* Sur un téléphone tout retombe sur le panneau nu : six lignes identiques.
     C'est la vérité de la fenêtre — mais un joueur qui choisit deux fois sans
     rien voir changer doit savoir pourquoi. */
  const plat = etatEchelle();
  plat.offres = plat.offres.map((o) => ({ ...o, rendu: { largeur: 375, hauteur: 560, facteur: 1 } }));
  const notes = display({ echelle: plat }).querySelectorAll(".display-note").map((n) => n.textContent);
  assert.equal(notes.filter((n) => /really are:/.test(n)).length, 1);
  assert.equal(
    display().querySelectorAll(".display-note").filter((n) => /really are:/.test(n.textContent)).length,
    0, "et il se tait quand les lignes diffèrent");
});

/* ══ 3 — LE CÂBLAGE DE LA COQUILLE ═══════════════════════════════════════
   Byte-check assumé (patron `shell-wiring`) : la coquille ne se monte pas
   ici, mais la DISCIPLINE se lit. */

test("🔌 la coquille câble les trois gestes du rang, et n'invente aucun compteur", () => {
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  assert.match(shell, /action\.kind === "ouvrirDisplay"[\s\S]{0,120}state\.palier = 2/,
    "ouvrir Display doit passer par `state.palier`, le compteur de rang du dépôt");
  assert.match(shell, /"universe" && state\.palier >= 2[\s\S]{0,160}next: "remonter"/,
    "⛔ `Done` doit REMONTER d'un rang, jamais pousser à l'étape suivante");
  assert.match(shell, /action\.kind === "cranChoisi"[\s\S]{0,400}surRedimensionnement\(\)/,
    "changer le cran doit rejouer la séquence du redimensionnement (vue, échelle, rendu)");
  assert.match(shell, /ecran: state\.palier >= 2 \? "display" : null/,
    "la coquille dit le RANG à l'écran ; elle ne lui passe pas un compteur nu");
});

test("⛔ l'écran Display n'écrit AUCUN nom de cran — il affiche ceux de la table", () => {
  /* Le garde de `fraction-d-ecran` interdit déjà un second lieu pour les noms
     internes ; celui-ci ferme l'autre moitié : les LIBELLÉS non plus ne
     doivent pas être recopiés dans l'écran. */
  const source = stripComments(fs.readFileSync(path.join(UI, "universe-step.mjs"), "utf8"));
  for (const b of CRANS_OFFERTS) {
    assert.ok(!source.includes(`"${b.libelle}"`),
      `« ${b.libelle} » est recopié dans universe-step.mjs — un renommage y survivrait en mentant`);
  }
});
