/* ══ ⚙️ L'ENGRENAGE DES CHEVRONS — lot 343 (le belt), lot 346 (partout), 2026-09-28 ══════════════════════
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
/* deux chevrons d'une paire, dans le document : l'éclairage et la roue se lisent sur la paire */
function paire(avancer, groupe = "belt") {
  const g = bouton(), d = bouton();
  document.body.append(g, d);
  E.armerEngrenage(g, { groupe, avancer }); E.armerEngrenage(d, { groupe, avancer });
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
  /* 🔄 LOT 344 — « réduit à 30 » : tout le dessin au même rapport (× 0,75) */
  /* 🔄 LOT 345 — « réduit là à 20 blg » : le prototype × 0,5 */
  assert.match(tokens, /--engrenage-d: 20px;/);
  assert.match(tokens, /--engrenage-fleche-d: 14px;/);
  /* 🔴 et la roue tourne sur son CENTRE, pas sur son coin (l'animation CSS d'un élément SVG part de 0, 0) */
  assert.match(css, /\.engrenage-rotor \{ transform-box: view-box; transform-origin: 0 0; \}/, "⛔ une origine qui recentrerait l'attribut déjà centré");
  const src = fs.readFileSync(path.join(UI, "engrenage.mjs"), "utf8");
  assert.match(src, /translate\(20px, 20px\) rotate\(\$\{a\}deg\) translate\(-20px, -20px\)/, "⛔ l'animation pivote autour du coin de la roue");
  for (const j of ["--engrenage-clair", "--engrenage-sombre", "--engrenage-moyeu", "--engrenage-contour", "--engrenage-fleche", "--engrenage-fleche-vive"]) {
    assert.equal((tokens.match(new RegExp(`${j}:`, "g")) || []).length, 2, `${j} : jour ET nuit`);
  }
  for (const [j, v] of [["--engrenage-droite-x", "8px"], ["--engrenage-droite-y", "-4px"], ["--engrenage-gauche-x", "-2px"], ["--engrenage-gauche-y", "10px"]]) {
    assert.match(tokens, new RegExp(`${j}: ${v};`), `${j} : la cote du prototype`);
  }
  assert.match(css, /\.engrenage-fleche\.droite \{ left: var\(--engrenage-droite-x\); top: var\(--engrenage-droite-y\); \}/);
  assert.match(css, /stroke-width: 2\.8;/);
  assert.match(css, /\.belt-chevron\[data-sens="avant"\] > \.engrenage \{ left: calc\(var\(--chevron-belt-bord\) \+ var\(--chevron-lateral-l\) \/ 2\); \}/,
    "⭐ centrée sur la flèche du belt, pas sur la boîte");
  assert.match(css, /\.engrenage \{[^}]*pointer-events: none;[^}]*overflow: visible;/, "⛔ les flèches ne sont pas coupées");
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\) \{\s*\[data-engrenage\]:hover > \.engrenage \{ opacity: 1; visibility: visible; \}/,
    "au survol souris seulement");
  /* 🔴 mesuré : la roue déborde sur les astres, empilés au-dessus du chevron — montrée, elle passe devant */
  assert.match(css, /\[data-engrenage\]:hover \{ z-index: 3; \}/, "⛔ la roue passe sous le soleil du Menu");
});

test("7 — ⭐ LE PÉRIMÈTRE (lot 346 : « partout où il y a des chevrons ») : les six paires portent l'engrenage, chacune son groupe ; la molette sans cadran est morte", () => {
  const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");
  assert.ok(!fs.existsSync(path.join(UI, "astrolabe.mjs")), "⛔ l'astrolabe est encore là");
  assert.match(lire("shell.mjs"), /armerEngrenage\(bouton, \{ groupe: "belt", avancer: \(sens\) => decalerLeBelt\(sens, \{ siLibre: true \}\) \}\)/);
  for (const [f, groupe] of [["sac-ecran.mjs", '"sac-roue"'], ["wares-ecran.mjs", '"wares-pages"'], ["wares-ecran.mjs", 'clef\\.replace'],
    ["x5-parchemin.mjs", '"x5-pages"'], ["molette-quantite.mjs", '"molette-qte"']]) {
    assert.match(lire(f), new RegExp(`armerEngrenage\\([^)]*groupe: ${groupe}`), `⛔ ${f} : la paire ${groupe} n'a pas d'engrenage`);
  }
  assert.equal(E.armerLaMolette, undefined, "⛔ la molette sans cadran survit : deux organes pour un geste");
  for (const f of fs.readdirSync(UI).filter((n) => n.endsWith(".mjs"))) {
    assert.doesNotMatch(lire(f).replace(/\/\*[\s\S]*?\*\//g, ""), /armerLaMolette\(/, `⛔ ${f} arme encore une molette sans cadran`);
  }
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ""), /\.astrolabe|data-astrolabe/, "⛔ une règle de l'astrolabe survit");
});

test("8 — 🔴 LE CHEVRON LATÉRAL SE TAIT, ET IL EST L'HÔTE (mesuré au banc) : sans masque, voile ni miroir au survol ; Wares et la molette de quantité positionnés", () => {
  const nu = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const survol = nu.match(/:is\(\.sac-tuner, \.molette-tuner, \.wares-tuner, \.wares-chevron\)\[data-engrenage\]:hover \{([^}]*)\}/);
  assert.ok(survol, "⛔ le chevron latéral ne se tait pas au survol : son masque découperait la roue");
  for (const d of [/mask-image: none/, /opacity: 1/, /transform: none/, /overflow: visible/, /color: transparent/]) {
    assert.match(survol[1], d, `⛔ au survol, le chevron garde ${d}`);
  }
  /* 📏 mesuré : les tuners de Wares et de la molette étaient STATIQUES — la roue partait au milieu de l'écran */
  assert.match(nu, /\.molette-tuner, \.wares-tuner, \.wares-gouttiere > \.wares-chevron \{ position: relative; \}/,
    "⛔ la roue s'ancre à un ancêtre lointain");
  assert.match(nu, /\.engrenage \{[^}]*left: 50%; top: 50%;/, "la roue au centre de la boîte de remplissage, qui EST le dessin");
});

test("9 — ⭐ CHAQUE PAIRE A SON ÉTAT : l'autre paire ne s'éclaire ni ne tourne ; un chevron repeint reprend la lueur de sa paire", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const [a] = paire(() => {}, "t-a");
    const [b] = paire(() => {}, "t-b");
    const angleB = E.angleDeLEngrenage("t-b");
    maintenant += 1000;
    a.dispatchEvent(molette(100));
    assert.equal(a.dataset.direction, "gauche");
    assert.equal(b.dataset.direction, undefined, "⛔ la molette d'une paire éclaire l'autre");
    assert.equal(E.angleDeLEngrenage("t-a"), -30);
    assert.equal(E.angleDeLEngrenage("t-b"), angleB, "⛔ la roue d'une autre paire tourne");
    assert.equal(b.querySelector(".engrenage-rotor").getAttribute("transform"), `rotate(${angleB} 20 20)`);
    /* 🔴 mesuré au banc : un tambour de Wares repeint ses chevrons — les neufs naissaient éteints */
    const neuf = bouton();
    document.body.append(neuf);
    E.armerEngrenage(neuf, { groupe: "t-a", avancer: () => {} });
    assert.equal(neuf.dataset.direction, "gauche", "⛔ un chevron repeint pendant la lueur naît éteint");
    assert.equal(neuf.querySelector(".engrenage-rotor").getAttribute("transform"), "rotate(-30 20 20)", "⛔ un chevron repeint perd l'angle de sa paire");
    mock.timers.tick(E.LUEUR_ENGRENAGE_MS);
    assert.equal(neuf.dataset.direction, undefined, "la lueur s'éteint aussi sur lui");
  } finally { mock.timers.reset(); document.body.childNodes.splice(0); }
});
