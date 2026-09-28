/* ══ ⚙️ L'ENGRENAGE DU BELT — lot 343, 2026-09-28 (remplace l'astrolabe du lot 330) ════════════════════
   ⚖️ Eric : la notice `Gpt in FH/Astrolabe-30px/NOTICE-CLAUDE.md` et le prototype validé
   (`engrenage-40px-source.html`) — « ROULER VERS LE HAUT = DROITE : la flèche qui monte puis vire à droite
   s'illumine ; l'engrenage tourne dans le sens horaire ; les tuiles se déplacent visiblement vers la droite.
   ROULER VERS LE BAS = GAUCHE : … antihoraire … vers la gauche. » · « La bonne flèche doit s'illuminer dès
   le premier mouvement de molette, même en bout de liste. L'autre s'atténue. » · « remplace l'ancien tuner
   par ceci ; vérifie bien qu'ils sont bien placés ». */
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTestDocument } from "./dom-stub.mjs";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const css = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
const tokens = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");
globalThis.document = globalThis.document || createTestDocument();
const E = await import("../ui/builder/engrenage.mjs");

const molette = (deltaY, extra = {}) => ({ type: "wheel", deltaY, deltaMode: 0, prevented: false, stopped: false,
  preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; }, ...extra });
const bouton = () => document.createElement("button");
/* deux chevrons du belt, dans le document : l'éclairage et la roue se lisent sur la paire */
function paire(avancer) {
  const g = bouton(), d = bouton();
  document.body.append(g, d);
  E.armerEngrenage(g, { avancer }); E.armerEngrenage(d, { avancer });
  return [g, d];
}
/* l'horloge de l'accumulateur — `performance.now` piloté, pour dire « 160 ms ont passé » */
let maintenant = 0;
globalThis.performance = { now: () => maintenant };

test("1 — ⚖️ HAUT = DROITE : la flèche droite s'allume dès le premier pixel ; un cran → le ruban vers la droite (−1), la roue +30° (horaire)", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const vus = [];
    const [g, d] = paire((s) => { vus.push(s); });
    const avant = E.angleDeLEngrenage();
    maintenant += 1000;
    g.dispatchEvent(molette(-1));
    assert.equal(g.dataset.direction, "droite", "⛔ la flèche droite ne s'allume pas au premier mouvement");
    assert.equal(d.dataset.direction, "droite", "⛔ l'autre chevron n'éclaire pas la même flèche");
    assert.deepEqual(vus, [], "⛔ un pixel a fait un pas");
    maintenant += 1000;
    g.dispatchEvent(molette(-100));
    assert.deepEqual(vus, [-1], "⛔ haut ne fait pas défiler les tuiles vers la DROITE");
    assert.equal(E.angleDeLEngrenage() - avant, 30, "⛔ la roue ne tourne pas de +30° (horaire)");
    mock.timers.tick(E.LUEUR_ENGRENAGE_MS);
    assert.equal(g.dataset.direction, undefined, "la lueur s'éteint 800 ms après le dernier geste");
  } finally { mock.timers.reset(); document.body.childNodes.splice(0); }
});

test("2 — ⚖️ BAS = GAUCHE : la flèche gauche, le ruban vers la gauche (+1), la roue −30° (antihoraire)", () => {
  const vus = [];
  const [g] = paire((s) => { vus.push(s); });
  const avant = E.angleDeLEngrenage();
  maintenant += 1000;
  g.dispatchEvent(molette(100));
  assert.equal(g.dataset.direction, "gauche");
  assert.deepEqual(vus, [1]);
  assert.equal(E.angleDeLEngrenage() - avant, -30);
  document.body.childNodes.splice(0);
});

test("3 — ⛔ EN BOUT DE LISTE : la flèche s'allume quand même, mais la roue ne tourne pas ; le zoom passe", () => {
  const [g] = paire(() => false);
  const avant = E.angleDeLEngrenage();
  maintenant += 1000;
  g.dispatchEvent(molette(-100));
  assert.equal(g.dataset.direction, "droite", "⛔ en butée, la flèche ne dit plus le geste");
  assert.equal(E.angleDeLEngrenage(), avant, "⛔ la roue tourne seule en butée");
  const zoom = molette(-100, { ctrlKey: true });
  g.dispatchEvent(zoom);
  assert.equal(zoom.prevented, false, "⛔ Ctrl + molette est intercepté");
  document.body.childNodes.splice(0);
});

test("4 — l'accumulateur du prototype : 28 unités ; un pas par cran ; remis à zéro au changement de sens ou après 160 ms", () => {
  const vus = [];
  const [g] = paire((s) => { vus.push(s); });
  maintenant += 1000;
  g.dispatchEvent(molette(15)); maintenant += 50; g.dispatchEvent(molette(15));
  assert.deepEqual(vus, [1], "15 + 15 ≥ 28 : un pas");
  maintenant += 50; g.dispatchEvent(molette(20)); maintenant += 50; g.dispatchEvent(molette(-20));
  assert.deepEqual(vus, [1], "⛔ le changement de sens n'a pas remis l'accumulateur à zéro");
  maintenant += 200; g.dispatchEvent(molette(-20));
  assert.deepEqual(vus, [1], "⛔ 160 ms de pause n'ont pas remis l'accumulateur à zéro");
  maintenant += 10; g.dispatchEvent(molette(-300));
  assert.deepEqual(vus, [1, -1], "⛔ un grand cran a fait plusieurs pas : un cran de souris = un pas");
  document.body.childNodes.splice(0);
});

test("5 — 📐 le dessin : une roue de 40 à douze dents, le moyeu FIXE, deux flèches Lucide fixes", () => {
  const e = E.construireLEngrenage(document);
  assert.equal(E.POINTS_DES_DENTS.split(" ").length, 60, "douze dents, cinq points chacune");
  const rotor = e.querySelector(".engrenage-rotor");
  assert.ok(rotor.querySelector(".engrenage-dents"), "la roue dentée est DANS le rotor");
  assert.equal(rotor.querySelectorAll(".engrenage-moyeu").length, 0, "⛔ le moyeu tourne : il est fixe");
  assert.equal(e.querySelectorAll(".engrenage-fleche").length, 2);
  assert.equal(e.querySelectorAll(".engrenage-rotor .engrenage-fleche").length, 0, "⛔ une flèche tourne avec la roue");
});

test("6 — 📐 les cotes et les encres du prototype, jour ET nuit ; la roue centrée sur le DESSIN du chevron ; rien ne coupe les flèches", () => {
  assert.match(tokens, /--engrenage-d: 40px;/);
  assert.match(tokens, /--engrenage-fleche-d: 28px;/);
  for (const j of ["--engrenage-clair", "--engrenage-sombre", "--engrenage-moyeu", "--engrenage-contour", "--engrenage-fleche", "--engrenage-fleche-vive"]) {
    assert.equal((tokens.match(new RegExp(`${j}:`, "g")) || []).length, 2, `${j} : jour ET nuit`);
  }
  for (const [j, v] of [["--engrenage-droite-x", "16px"], ["--engrenage-droite-y", "-8px"], ["--engrenage-gauche-x", "-4px"], ["--engrenage-gauche-y", "20px"]]) {
    assert.match(tokens, new RegExp(`${j}: ${v};`), `${j} : la cote du prototype`);
  }
  assert.match(css, /\.engrenage-fleche\.droite \{ left: var\(--engrenage-droite-x\); top: var\(--engrenage-droite-y\); \}/);
  assert.match(css, /stroke-width: 2\.8;/);
  assert.match(css, /\.belt-chevron\[data-sens="avant"\] > \.engrenage \{ left: calc\(var\(--chevron-belt-bord\) \+ var\(--chevron-lateral-l\) \/ 2\); \}/,
    "⭐ centrée sur la flèche du belt, pas sur la boîte");
  assert.match(css, /\.engrenage \{[^}]*pointer-events: none;[^}]*overflow: visible;/, "⛔ les flèches ne sont pas coupées");
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.belt-chevron\[data-engrenage\]:hover > \.engrenage \{ opacity: 1; visibility: visible; \}/,
    "au survol souris seulement");
  /* 🔴 mesuré : la roue déborde sur les astres, empilés au-dessus du chevron — montrée, elle passe devant */
  assert.match(css, /\.belt-chevron\[data-engrenage\]:hover \{ z-index: 3; \}/, "⛔ la roue passe sous le soleil du Menu");
});

test("7 — ⭐ LE PÉRIMÈTRE : l'engrenage sur le belt SEUL ; les autres chevrons gardent leur molette, sans cadran ; l'astrolabe est parti", () => {
  const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");
  assert.ok(!fs.existsSync(path.join(UI, "astrolabe.mjs")), "⛔ l'astrolabe est encore là");
  assert.match(lire("shell.mjs"), /armerEngrenage\(bouton, \{ avancer: \(sens\) => decalerLeBelt\(sens, \{ siLibre: true \}\) \}\)/);
  for (const [f, groupe] of [["sac-ecran.mjs", "sac-roue"], ["wares-ecran.mjs", "wares-pages"], ["x5-parchemin.mjs", "x5-pages"], ["molette-quantite.mjs", "molette-qte"]]) {
    assert.match(lire(f), new RegExp(`armerLaMolette\\([^)]*groupe: "${groupe}"`), `${f} : ${groupe}`);
    assert.doesNotMatch(lire(f), /armerEngrenage|armerAstrolabe/, `⛔ ${f} porte un cadran`);
  }
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ""), /\.astrolabe|data-astrolabe/, "⛔ une règle de l'astrolabe survit");
});

test("8 — la molette d'un chevron ordinaire : un cran = un pas, un pixel non ; bas = +1 ; une borne remet le reste à zéro", () => {
  const vus = [];
  const b = bouton();
  E.armerLaMolette(b, { groupe: "t-ord", avancer: (s) => { vus.push(s); } });
  b.dispatchEvent(molette(1));
  assert.deepEqual(vus, []);
  const ev = molette(99);
  b.dispatchEvent(ev);
  assert.deepEqual(vus, [1]);
  assert.equal(ev.stopped, true, "⛔ la molette de quantité compterait deux fois");
  b.dispatchEvent(molette(-3, { deltaMode: 1 }));
  assert.deepEqual(vus, [1, -1], "Firefox : trois lignes = un cran");
});
