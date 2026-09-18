/* ══ L'ÉCRAN SB3.1 — LE SAC ════════════════════════════════════════════════════
   Les gardes du lot 214. Ils tiennent ce que le plan promet, ⛔ pas ce que le
   code fait : chaque assertion se lit contre `sac-disposition.mjs`, la table
   générée, ou contre une phrase d'Eric datée. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTestDocument } from "./dom-stub.mjs";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
globalThis.document = createTestDocument();
const D = await import("../ui/builder/sac-disposition.mjs");
const { construireLeSac, feuilleDesCotesSac, CLEF_DE } = await import("../ui/builder/sac-ecran.mjs");
const feuille = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
const PLAN = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "sac-cotes.json"), "utf8"));

const tous = (n, sel) => [...n.querySelectorAll(sel)];
const rendu = (o = {}) => construireLeSac({
  sections: [{ nom: "Potions" }, { nom: "Camp" }, { nom: "Trésor" }],
  section: 0, objets: [], poids: {}, destinations: [], ...o
}).noeud;

test("1 — la déclaration EST la table du plan, au blg près", () => {
  assert.deepEqual(D.ORGANES.map((o) => o.nom), PLAN.organes.map((o) => o.nom),
    "⛔ la déclaration se recopie du générateur, elle ne se retape pas");
  assert.equal(D.DALLE.h, PLAN.dalle.h);
  assert.equal(D.ROUE.dominant, PLAN.roue.dominant);
  assert.equal(D.ROUE.secondaire, PLAN.roue.secondaire);
});

test("2 — 🔴 LA RÈGLE D'ERIC (18/09) se vérifie sur la table, elle ne se déclare pas", () => {
  /* ⚖️ *« il faut que le T0 des petites tuiles remplissent idem que le T1 de la
     grande tuile »* · *« il faut qté en largeur idem en T1 et T0 »*.
     ⭐ Le critère est le NOMBRE DE SIGNES, donc le rapport des largeurs utiles
     doit valoir celui des polices : 8/10. */
  const m = D.ROUE.margePct;
  const utile = (L) => L * (1 - 2 * m);
  const rapport = utile(D.ROUE.secondaire) / utile(D.ROUE.dominant);
  assert.ok(Math.abs(rapport - 0.8) < 0.02,
    `le rapport des textes utiles vaut ${rapport.toFixed(3)}, il devrait valoir 0,800`);
  /* ⛔ et le budget de la piste tombe juste : D + 4W = 279 */
  assert.equal(D.ROUE.dominant + 4 * D.ROUE.secondaire, D.ROUE.budget);
});

test("3 — 🔴 LA MARGE D'UN CRAN SE DÉDUIT DE SA LARGEUR, ⛔ jamais d'un pour-cent CSS", () => {
  /* 🔴 FAUTE VUE AU BANC, premier rendu : `padding-inline: 7.5%` se résout sur la
     largeur du CONTENANT (la roue, 311), pas sur celle du cran — 23,3 de chaque
     côté, et tous les crans affichaient « P… ». ⭐ Le pourcentage reste dans la
     table, la feuille en DÉDUIT deux nombres. */
  const css = feuilleDesCotesSac();
  assert.doesNotMatch(css, /padding-inline:\s*[\d.]+%/,
    "⛔ un pour-cent de padding se résout chez le CONTENANT : il ne peut pas porter cette règle");
  for (const nom of ["CRAN 3", "CRAN 1"]) {
    const o = D.ORGANES.find((x) => x.nom === nom);
    const attendu = Math.round(o.l * D.ROUE.margePct * 100) / 100;
    assert.ok(css.includes(`[data-organe="${CLEF_DE[nom]}"]{padding-inline:${attendu}px}`),
      `${nom} : la marge devrait valoir ${attendu}`);
  }
});

test("4 — 🔴 UN ORGANE NICHÉ SE POSE PAR RAPPORT À SON HÔTE", () => {
  /* 🔴 FAUTE VUE AU BANC : les crans portaient les `x` de la table alors qu'ils
     vivent DANS la roue, elle-même posée à 32. Ils partaient 32 trop à droite. */
  const css = feuilleDesCotesSac();
  const roue = D.ORGANES.find((o) => o.nom === "ROUE");
  const cran = D.ORGANES.find((o) => o.nom === "CRAN 1");
  const attendu = cran.x - (roue.cible ? roue.cible.x : roue.x);
  assert.ok(css.includes(`[data-organe="cran-1"]{left:${attendu}px`),
    `le premier cran devrait se poser à ${attendu} DANS sa roue, pas à ${cran.x}`);
});

test("5 — ⛔ `shell.css` ne porte AUCUNE cote du sac : elles vivent dans la feuille construite", () => {
  const i = feuille.indexOf("/* ══ L'ÉCRAN SB3.1 — LE SAC");
  assert.ok(i > 0, "le bloc du sac existe dans la feuille");
  const bloc = feuille.slice(i);
  assert.doesNotMatch(bloc, /\n\s*(left|top):\s*[\d.]+px/,
    "⛔ une position écrite ici serait une cote recopiée — elles sortent de la table");
});

test("6 — la roue porte CINQ crans, un seul dominant, et deux tuners", () => {
  const n = rendu();
  const crans = tous(n, ".sac-cran");
  assert.equal(crans.length, 5, "deux de chaque côté du dominant (Eric, 18/09)");
  assert.deepEqual(crans.map((c) => c.dataset.dominant), ["non", "non", "oui", "non", "non"]);
  assert.equal(crans[2].getAttribute("aria-selected"), "true", "le dominant est celui qu'on regarde");
  assert.equal(tous(n, ".sac-tuner").length, 2);
  /* ⛔ ET LA ROUE NOMME L'ÉCRAN — NORMES §1 quinquies, « le tambour désigne » :
     aucun titre n'est dû, donc aucun n'est posé. */
  assert.equal(n.querySelector("h1, h2"), null, "⛔ pas de titre : la roue désigne");
});

test("7 — la grille porte DOUZE places, et une case vide est une CIBLE", () => {
  /* ⚖️ Eric, 18/09 : *« un compartiment = 5 rangées de 3 »*, puis *« il nous manque
     un collecteur, il faut faire sauter une rangée »* → 4 × 3 = 12. */
  const n = rendu({ objets: [{ index: 1, nom: "Dagger", qte: 2, locked: true }] });
  const cases = tous(n, ".sac-case");
  assert.equal(cases.length, 12);
  assert.equal(cases[0].dataset.occupe, "oui");
  assert.equal(cases[0].querySelector(".jeton-nom").textContent, "Dagger",
    "⭐ le corps du jeton vient de son organe, il n'est pas redessiné ici");
  assert.equal(cases[0].dataset.verrouille, "oui", "le verrou se dit sur le nœud");
  assert.equal(cases[1].dataset.creneau, "case-1-2", "une case vide est une cible de dépôt");
  assert.equal(cases[1].dataset.occupe, undefined);
});

test("8 — la rangée d'échange porte les DEUX Tally, le collecteur et la bourse", () => {
  /* ⚖️ Eric, 18/09 : *« mets le Tally à gauche du collecteur, et la bourse à droite
     de celui-ci, idem Gear »*, puis *« cotes idem mais emplacement différent »*. */
  const n = rendu();
  for (const id of ["party-tally", "tally", "collecteur", "purse"]) {
    assert.ok(n.querySelector(`[data-organe="${id}"]`), `${id} est posé`);
  }
  const purse = D.ORGANES.find((o) => o.nom === "PURSE");
  assert.equal(purse.l, 50, "la bourse garde la cote de R");
  assert.equal(purse.x + purse.l, D.COLONNES[2] + D.JETON.l,
    "⭐ et son bord droit se cale sur la ligne de la 3ᵉ colonne (« tout reste sur une grille »)");
  /* ⚖️ ET LA PAIRE EST COTÉE AU BORD, PLUS À LA COLONNE — Eric, 18/09 : *« le
     premier à 24 du bord gauche, 8, le second Tally qui est à 24 du collecteur »*.
     🔴 Ses trois nombres ne fermaient pas : 24 + 40 + 8 + 40 + 24 = 136 quand le
     collecteur commence à 144. ⭐ Le premier a cédé — 32 — parce que c'était le
     moins coûteux : la gouttière reste légale et le « 24 du collecteur » tient. */
  const party = D.ORGANES.find((o) => o.nom === "PARTY TALLY");
  const tally = D.ORGANES.find((o) => o.nom === "TALLY");
  assert.equal(tally.x - (party.x + party.l), 8, "la gouttière entre les deux vaut 8");
  assert.equal(D.COLONNES[1] - (tally.x + tally.l), 24, "et le second est à 24 du collecteur");
});

test("9 — ⛔ les lunes sont cotées et NON POSÉES", () => {
  /* ⚖️ Eric, 16/09 : *« les lunes sont pour les écrans plus grands »* — même régime
     que sur R : le plan les dessine, la déclaration dit de ne pas les poser. */
  const lunes = D.ORGANES.filter((o) => o.sorte === "lune");
  assert.equal(lunes.length, 3, "Wares · Gear · Craft");
  assert.ok(lunes.every((l) => l.creation === false));
  const n = rendu();
  for (const l of lunes) {
    assert.equal(n.querySelector(`[data-organe="${(CLEF_DE[l.nom] || l.nom)}"]`), null,
      `${l.nom} ne se pose pas à la création`);
  }
  assert.doesNotMatch(feuilleDesCotesSac(), /lune/, "⛔ et la feuille ne leur fait pas de place");
});

test("10 — le tuner écoute la MOLETTE en plus du tap, et il l'empêche de défiler la page", () => {
  /* ⚖️ Eric, 18/09 : *« utiliser le scroll de la souris sur un chevron peut aider
     le défilement »*. ⛔ Et la molette S'AJOUTE : le tap marche toujours. */
  const tours = [];
  const n = rendu({ surTourner: (s) => tours.push(s) });
  const g = n.querySelector('[data-organe="tuner-g"]');
  g.dispatchEvent({ type: "click" });
  let empeche = false;
  g.dispatchEvent({ type: "wheel", deltaY: -1, preventDefault: () => { empeche = true; } });
  assert.deepEqual(tours, [-1, -1], "le tap et la molette tournent tous les deux");
  assert.equal(empeche, true, "⛔ sinon la page défilerait DERRIÈRE la roue");
  const source = fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8");
  assert.match(source, /passive:\s*false/, "sans lui le navigateur refuse le preventDefault");
});
