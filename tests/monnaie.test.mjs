/* ══ LA MONNAIE — lot 316, 2026-09-27 ═════════════════════════════════════════════════════════
   ⚖️ Eric, 27/09 : « La bourse doit rendre la monnaie. Lorsqu'il y a une transaction. Qu'une petite
   animation qui persiste 1 seconde qui montre un +34gp & 2sp en vert, - 56gp & 5 sp en rouge. Cette
   animation doit persister d'un écran à l'autre ».
   ⭐ Les cas sont ceux qu'on paie à la table, chiffrés à la main AVANT d'écrire le code. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { payerAvecMonnaie, peutPayer, motDeLEcart, enCuivre, annoncerLEcart, DUREE_ANNONCE_MS } from "../ui/builder/monnaie.mjs";
import { bourseCouvre } from "../ui/builder/equipement-pipeline.mjs";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const net = (b) => Object.fromEntries(Object.entries(b).filter(([, v]) => v));

test("1 — 🔴 LE CAS DU LOT 315 : 114 GP sans argent paient 5 SP, et la monnaie revient", () => {
  assert.equal(bourseCouvre({ gp: 114 }, { sp: 5 }), true, "⛔ la bourse ne cassait pas la pièce d'or");
  assert.deepEqual(net(payerAvecMonnaie({ gp: 114 }, { sp: 5 })), { gp: 113, sp: 5 });
});

test("2 — ⭐ chaque pièce du prix se paie d'abord dans SA pièce — la bourse garde sa composition", () => {
  assert.deepEqual(net(payerAvecMonnaie({ gp: 114, sp: 12 }, { sp: 5 })), { gp: 114, sp: 7 });
  assert.deepEqual(net(payerAvecMonnaie({ gp: 114, sp: 12 }, { gp: 56, sp: 5 })), { gp: 58, sp: 7 });
});

test("3 — ⭐ on casse la plus petite pièce qui couvre le reste ; la monnaie va aux plus petites", () => {
  assert.deepEqual(net(payerAvecMonnaie({ gp: 100 }, { gp: 56, sp: 5 })), { gp: 43, sp: 5 });
  assert.deepEqual(net(payerAvecMonnaie({ gp: 100, sp: 3 }, { sp: 5 })), { gp: 99, sp: 8 });
  assert.deepEqual(net(payerAvecMonnaie({ pp: 1 }, { sp: 5 })), { gp: 9, sp: 5 });
  assert.deepEqual(net(payerAvecMonnaie({ gp: 2, sp: 300 }, { gp: 5 })), { sp: 270 });
});

test("4 — ⛔ le total fait foi, dans les deux sens : ni dette, ni bourse à moitié débitée", () => {
  assert.equal(payerAvecMonnaie({ gp: 1 }, { gp: 2 }), null);
  assert.equal(peutPayer({ gp: 1, sp: 9, cp: 9 }, { gp: 2 }), false);
  assert.equal(peutPayer({ gp: 1, sp: 9, cp: 10 }, { gp: 2 }), true);
  assert.equal(peutPayer({ gp: 5 }, null), false, "un prix inconnu ne se paie pas");
  /* la valeur est conservée : ce qui sort de la bourse est exactement le prix */
  for (const [b, c] of [[{ gp: 114, sp: 12 }, { gp: 56, sp: 5 }], [{ pp: 3, cp: 7 }, { gp: 1, cp: 9 }]]) {
    assert.equal(enCuivre(b) - enCuivre(payerAvecMonnaie(b, c)), enCuivre(c));
  }
});

test("5 — ⚖️ l'écart en mots : « +34 gp & 2 sp », « −56 gp & 5 sp » ; le NET, pas la cuisine", () => {
  assert.equal(motDeLEcart(3420), "+34 gp & 2 sp");
  assert.equal(motDeLEcart(-5650), "−56 gp & 5 sp");
  /* casser une pièce d'or pour payer 5 sp se dit « −5 sp » */
  assert.equal(motDeLEcart(enCuivre({ gp: 113, sp: 5 }) - enCuivre({ gp: 114 })), "−5 sp");
  assert.equal(motDeLEcart(0), null);
});

test("6 — ⭐ l'annonce vit sur BODY — hors de l'application, qu'aucun repeint d'écran ne jette", () => {
  const poses = [];
  const faux = {
    body: { append: (n) => poses.push(n) },
    createElement: () => ({ dataset: {}, style: {}, setAttribute(k, v) { this[k] = v; }, remove() {} }),
  };
  const a = annoncerLEcart(-5650, faux);
  assert.equal(poses.length, 1, "⛔ l'annonce n'est pas posée sur body");
  assert.equal(a.textContent, "−56 gp & 5 sp");
  assert.equal(a.dataset.sens, "perte");
  assert.equal(a.role, "status");
  assert.equal(annoncerLEcart(3420, faux).dataset.sens, "gain");
  assert.equal(annoncerLEcart(0, faux), null, "un écart nul ne s'annonce pas");
  /* ⚖️ « qui persiste 1 seconde » — la feuille dit la même durée que le module */
  assert.equal(DUREE_ANNONCE_MS, 1000);
  const shell = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
  assert.match(shell, /\.bourse-ecart\s*\{[^}]*animation:\s*bourse-ecart 1000ms/);
  assert.match(shell, /\.bourse-ecart\[data-sens="gain"\]\s*\{\s*color:\s*var\(--positive\)/);
  assert.match(shell, /\.bourse-ecart\[data-sens="perte"\]\s*\{\s*color:\s*var\(--critical\)/);
});

test("7 — ⭐ la coquille annonce au SEUL point d'entrée des décisions, et paie par la monnaie", () => {
  const src = fs.readFileSync(path.join(UI, "shell.mjs"), "utf8");
  const entree = src.slice(src.indexOf("function applyDecisionAction(action) {"), src.indexOf("function appliquerLaDecision(action) {"));
  assert.ok(entree.includes("annoncerLEcart(ecart)"), "⛔ l'annonce n'est pas au point d'entrée");
  assert.ok(entree.includes('action.kind !== "setCurrency"'), "⛔ le réglage au +/− ne doit pas s'annoncer");
  assert.ok(entree.includes("profondeurDesDecisions === 0"), "⛔ une décision imbriquée s'annoncerait deux fois");
  const payer = src.slice(src.indexOf('if (action.kind === "payer") {'), src.indexOf('if (action.kind === "cartAdd") {'));
  assert.ok(payer.includes("payerAvecMonnaie("), "⛔ `payer` ne rend pas la monnaie");
});

/* ══ LOT 317 — SOUS LA BOURSE ══════════════════════════════════════════════════════════════════
   ⚖️ Eric, 27/09 : « Fait arriver la notification de transaction sous la bourse ». L'annonce est un
   ÉTAT ; le MONTANT de la bourse (l'organe partagé de Gear, Pack, Wares, X2, X5) la peint quand il
   naît — c'est ce qui la fait traverser les écrans ET se poser sous la bourse de chacun. */
import { createTestDocument } from "./dom-stub.mjs";
const { montantDeLaBourse } = await import("../ui/builder/gear-ecran.mjs");
/* ⚠️ L'ÉTAT DE L'ANNONCE VIT DANS LE MODULE : il faut la MÊME instance que celle de l'écran, donc la
   même URL, `?v=` compris (dans le navigateur, tout le graphe porte le même). */
const V = fs.readFileSync(path.join(UI, "gear-ecran.mjs"), "utf8").match(/monnaie\.mjs(\?v=\d+)/)[1];
const Mi = await import(`../ui/builder/monnaie.mjs${V}`);

test("8 — ⚖️ un montant qui naît pendant la seconde porte l'annonce ; après, plus rien", () => {
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try {
    const m0 = montantDeLaBourse({ bourse: { gp: 12 } });
    Mi.annoncerLEcart(-5650, globalThis.document);
    /* ⭐ l'écran d'APRÈS : un montant construit maintenant, ailleurs, porte l'annonce */
    const m = montantDeLaBourse({ bourse: { gp: 43, sp: 5 } });
    const a = m.querySelector(".bourse-ecart");
    assert.ok(a, "⛔ le montant d'un écran neuf ne montre pas l'annonce en cours");
    assert.equal(a.textContent, "−56 gp & 5 sp");
    assert.equal(a.dataset.sens, "perte");
    assert.equal(m0.querySelector(".bourse-ecart"), null, "un montant né AVANT la transaction n'est pas repeint par magie");
    assert.equal(Mi.annonceEnCours(Date.now() + DUREE_ANNONCE_MS + 1), null, "⛔ la seconde passée, l'annonce n'existe plus");
  } finally {
    if (avant === undefined) delete globalThis.document; else globalThis.document = avant;
  }
});

test("9 — 📐 l'annonce se pose SOUS son montant, et le repli sans bourse garde la place du 316", () => {
  const shell = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
  const regle = shell.match(/\n\.bourse-ecart\s*\{([^}]*)\}/)[1];
  assert.match(regle, /position:\s*absolute/);
  assert.match(regle, /top:\s*100%/, "⛔ sous le montant, pas par-dessus");
  assert.match(shell, /\.bourse-ecart\[data-place="haut"\]\s*\{\s*position:\s*fixed/);
  /* ⭐ et le montant de Wares est un REPÈRE — sans ça l'annonce partait à x 164 pour une bourse à 276 */
  const wares = fs.readFileSync(path.join(UI, "wares-ecran.mjs"), "utf8");
  assert.match(wares, /\.wares \[data-organe="montant"\]\{[^`]*`\s*\+\s*`[^`]*position:relative\}/);
});
