/* ══ L'ASTROLABE — lot 330, 2026-09-27 ═════════════════════════════════════════════════════════════
   ⚖️ Eric : la notice `Gpt in FH/Astrolabe-30px/NOTICE-CLAUDE.md` et, en conversation, « À appliquer
   sur tous les chevrons horizontaux (plutôt 20 blg de diamètre que 30) » · « C'est pour les desktop et
   souris » · « ça se déclenche sur un hover de souris » · « L'astrolabe apparaîtra parfaitement
   au-dessus des chevrons ». */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTestDocument } from "./dom-stub.mjs";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const css = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
const tokens = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");
globalThis.document = globalThis.document || createTestDocument();
const A = await import("../ui/builder/astrolabe.mjs");

const molette = (deltaY, extra = {}) => {
  const ev = { type: "wheel", deltaY, deltaMode: 0, prevented: false, stopped: false,
    preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; }, ...extra };
  return ev;
};
const chevron = () => { const b = document.createElement("button"); b.dataset.sens = "droite"; return b; };

test("1 — ⚖️ un cran de molette = un pas ; un pixel de trackpad n'en est pas un ; Firefox (lignes) aussi", () => {
  assert.equal(A.pasDeLaMolette("t1", molette(100)), 1, "un cran Chrome/Safari");
  assert.equal(A.pasDeLaMolette("t1", molette(1)), 0, "⛔ un pixel n'est pas un cran");
  let pas = 0; for (let i = 0; i < 99; i++) pas += A.pasDeLaMolette("t1", molette(1));
  assert.equal(pas, 1, "⭐ cent petits deltas font UN pas (agrégés)");
  assert.equal(A.pasDeLaMolette("t2", molette(3, { deltaMode: 1 })), 1, "trois lignes Firefox = un cran");
});

test("2 — ⚖️ bas = horaire = suivant (+1) ; haut = antihoraire = précédent ; l'aiguille SEULE tourne, en angle cumulé", () => {
  const vus = [];
  const b = chevron();
  A.armerAstrolabe(b, { groupe: "t3", avancer: (s) => { vus.push(s); } });
  b.dispatchEvent(molette(100));
  b.dispatchEvent(molette(100));
  b.dispatchEvent(molette(-100));
  assert.deepEqual(vus, [1, 1, -1]);
  assert.equal(A.angleDe("t3"), 30, "+30 +30 −30 : cumulé, jamais ramené à 0..360");
  const rotor = b.querySelector(".astrolabe-rotor");
  assert.equal(rotor.getAttribute("transform"), "rotate(30 15 15)", "⭐ l'aiguille tourne autour du centre (15,15)");
  /* l'indice (souris + ↕) et les graduations ne sont PAS dans le rotor */
  assert.equal(rotor.querySelectorAll("rect").length, 0, "⛔ la souris ne tourne pas");
  assert.ok(b.querySelector(".astrolabe-indice"), "l'indice existe, fixe");
});

test("3 — ⛔ une borne refusée ne fait PAS tourner l'aiguille ; le zoom n'est jamais intercepté", () => {
  const b = chevron();
  A.armerAstrolabe(b, { groupe: "t4", avancer: () => false });
  b.dispatchEvent(molette(100));
  assert.equal(A.angleDe("t4"), 0, "⛔ l'aiguille a tourné seule, contre une borne");
  const zoom = molette(100, { ctrlKey: true });
  b.dispatchEvent(zoom);
  assert.equal(zoom.prevented, false, "⛔ Ctrl + molette (le zoom) a été volé");
});

test("4 — ⭐ les deux chevrons d'une paire partagent la navigation ET l'aiguille ; un cran n'est compté qu'une fois", () => {
  const g = chevron(), d = chevron();
  const vus = [];
  const avancer = (s) => { vus.push(s); };
  A.armerAstrolabe(g, { groupe: "t5", avancer });
  A.armerAstrolabe(d, { groupe: "t5", avancer });
  const ev = molette(100);
  g.dispatchEvent(ev);
  assert.deepEqual(vus, [1], "le même sens, quel que soit le côté");
  assert.equal(ev.stopped, true, "⛔ sinon la molette de quantité, qui écoute tout son tambour, compterait deux fois");
  assert.equal(A.angleDe("t5"), 30);
});

test("5 — 📐 20 blg, par-dessus le dessin du chevron, au SURVOL SOURIS seulement, sans rien déplacer", () => {
  assert.match(tokens, /--astrolabe-d: 20px;/, "⚖️ « plutôt 20 blg de diamètre que 30 »");
  for (const j of ["--astrolabe-face", "--astrolabe-laiton", "--astrolabe-encre"]) {
    assert.equal((tokens.match(new RegExp(`${j}:`, "g")) || []).length, 2, `${j} : jour ET nuit`);
  }
  assert.match(css, /\.astrolabe \{[^}]*position: absolute;[^}]*left: 50%; top: 50%;[^}]*translate: -50% -50%;/,
    "⭐ en absolu, centré sur la boîte du dessin — hors du flux, rien ne bouge");
  assert.match(css, /\.astrolabe \{[^}]*pointer-events: none;/, "le cadran ne capte rien : c'est le chevron qui capte");
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\) \{\s*\[data-astrolabe\]:hover > \.astrolabe \{ opacity: 1; visibility: visible; \}/,
    "⚖️ « ça se déclenche sur un hover de souris » — un doigt ne le voit jamais");
});

test("6 — ⭐ les six paires de chevrons horizontaux sont armées", () => {
  const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");
  for (const [f, groupe] of [["shell.mjs", "belt"], ["sac-ecran.mjs", "sac-roue"], ["wares-ecran.mjs", "wares-pages"],
    ["x5-parchemin.mjs", "x5-pages"], ["molette-quantite.mjs", "molette-qte"]]) {
    assert.match(lire(f), new RegExp(`armerAstrolabe\\([^)]*groupe: "${groupe}"`), `${f} : ${groupe}`);
  }
  assert.match(lire("wares-ecran.mjs"), /armerAstrolabe\(b, \{ groupe: clef\.replace/, "les deux tambours de Wares");
  assert.ok(!/b\.addEventListener\("wheel"/.test(lire("sac-ecran.mjs").split("function case_")[0].split("function tuner")[1] || ""),
    "⛔ l'ancien écouteur de molette du tuner de Pack ferait un second pas");
});
