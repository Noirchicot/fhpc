/* ══ LE GARDE DES PORTES CARRÉES — lot 311, 2026-09-27 ═════════════════════════════════════════
   ⚖️ Eric, 27/09, mot pour mot : « Parfait je valide les 3. Dans les 3 écrans. Tu gardes le bouton
   send toujours centré. Tu dégages le livre qui n'a pas d'utilité dans équipement. Tu places les 3
   carrés répartis équitablement à gauche de send », puis « Quand on est sur l'écran en question le
   bouton est grisé » — amendé le soir : « Plutôt que de griser on essaye le halo autour de la fenêtre
   active » et « Modifie l'ordre de gauche à droite Gear/pack/ wares ». NORMES `equipement-portes-carrees`.

   🔴 CE QU'IL DÉFEND, SUR LES TROIS ÉCRANS À LA FOIS — et c'est pour ça qu'il est un fichier à part :
   une loi qui vaut pour trois écrans ne se garde pas dans le test d'un seul.
     1. LE PLAN : trois carrés Gear · Pack · Wares, dans cet ordre, à gauche de Send ; Send centré
        sur la dalle ; quatre gouttières ÉGALES entre les DESSINS ; plus de livre ; cibles ≥ 44,
        dans la dalle, sans chevauchement.
     2. LE DOM : l'organe partagé posé dans le groupe, AVANT Send ; le carré de l'écran où l'on est
        désigné par `aria-current="page"` (⛔ pas `disabled`), cerné du halo, et muet ; les deux autres armés et qui publient
        la même porte que l'ancien bouton à mot ; plus de livre.
     3. LA MATIÈRE : les images, leurs tailles, le mot et son cran sont ceux du banc 310.
   ⛔ SA LIMITE : il lit des plans, un DOM de stub et des feuilles. Le rendu (centre de Send, pas des
   gouttières au navigateur) se mesure à l'écran — c'est dans le rapport du lot. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();
const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");
const SHELL = stripComments(lire("shell.css"));
const TOKENS = stripComments(lire("tokens.css"));
const BANC = lire("banc-portes-imagees.html");

const { PORTES_CARREES, portesCarrees } = await import("../ui/builder/porte-carree.mjs");
const G = await import("../ui/builder/gear-disposition.mjs");
const S = await import("../ui/builder/sac-disposition.mjs");
const W = await import("../ui/builder/wares-disposition.mjs");
const { construireLEcranGear, CLEF_DE: CLEF_G } = await import("../ui/builder/gear-ecran.mjs");
const { construireLeSac, CLEF_DE: CLEF_S } = await import("../ui/builder/sac-ecran.mjs");
const { construireLesWares } = await import("../ui/builder/wares-ecran.mjs");

/* les trois plans, avec ce qui les distingue : leur dalle, leur clef, et l'écran que chacun EST */
const PLANS = [
  { ecran: "Gear", courant: "gear", ORGANES: G.ORGANES, dalle: G.DALLE, marge: G.MARGE, clef: CLEF_G },
  { ecran: "sac", courant: "backpack", ORGANES: S.ORGANES, dalle: S.DALLE, marge: S.MARGE, clef: CLEF_S },
  { ecran: "Wares", courant: "wares", ORGANES: W.ORGANES, dalle: W.DALLE, marge: W.REMBOURRAGE, clef: W.CLEF_DE },
];
const ORDRE = ["gear", "backpack", "wares"];

/* ══ 1 · LE PLAN ═══════════════════════════════════════════════════════════════════════════════ */

test("1 · les trois plans : Gear · Pack · Wares à gauche de Send, Send centré, gouttières égales entre les dessins", () => {
  assert.deepEqual(PORTES_CARREES.map((p) => p.id), ORDRE, "⛔ l'ordre de l'organe : Gear, Pack, Wares");
  assert.deepEqual(PORTES_CARREES.map((p) => p.mot), ["Gear", "Pack", "Wares"], "⛔ les mots du banc");
  for (const P of PLANS) {
    const carres = P.ORGANES.filter((o) => o.sorte === "porte-carree").sort((a, b) => a.x - b.x);
    const send = P.ORGANES.find((o) => P.clef[o.nom] === "send");
    assert.ok(send, `${P.ecran} : Send manque au plan`);
    assert.deepEqual(carres.map((o) => P.clef[o.nom]), ORDRE, `${P.ecran} : trois carrés, dans l'ordre Gear · Pack · Wares`);
    assert.deepEqual(carres.map((o) => o.mot), PORTES_CARREES.map((p) => p.mot), `${P.ecran} : les mots du plan sont ceux de l'organe`);
    assert.ok(carres.every((o) => o.cran === "T0/600"), `${P.ecran} : le mot des carrés est en T0/600`);
    /* Send centré sur la dalle, à sa cote de toujours */
    assert.equal(send.l, 77, `${P.ecran} : Send garde sa cote (77)`);
    assert.equal(send.x + send.l / 2, P.dalle.l / 2, `${P.ecran} : ⛔ Send n'est pas centré sur la dalle`);
    /* les carrés : un dessin de 40 dans une cible de 44, tous à gauche de Send */
    for (const o of carres) {
      assert.deepEqual([o.l, o.h], [40, 40], `${P.ecran} : ${o.nom} dessin 40 × 40`);
      assert.ok(o.cible && o.cible.l === 44 && o.cible.h === 44, `${P.ecran} : ${o.nom} cible 44 × 44`);
      assert.equal(o.cible.x, o.x - 2, `${P.ecran} : ${o.nom} cible centrée sur le dessin`);
      assert.ok(o.cible.x + o.cible.l <= send.x, `${P.ecran} : ⛔ ${o.nom} mord Send`);
      assert.equal(o.y + o.h / 2, send.y + send.h / 2, `${P.ecran} : ${o.nom} sur l'axe de Send`);
    }
    /* ⭐ QUATRE GOUTTIÈRES ÉGALES, ENTRE LES DESSINS : marge → Pack, Pack → Wares, Wares → Gear, Gear → Send */
    const bords = [P.marge, ...carres.flatMap((o) => [o.x, o.x + o.l]), send.x];
    const gouttieres = [];
    for (let i = 0; i < bords.length; i += 2) gouttieres.push(Math.round((bords[i + 1] - bords[i]) * 1000) / 1000);
    assert.equal(gouttieres.length, 4);
    assert.equal(new Set(gouttieres).size, 1, `${P.ecran} : ⛔ gouttières inégales entre les dessins : ${gouttieres.join(" · ")}`);
    /* plus de livre */
    assert.ok(!P.ORGANES.some((o) => /^livre$/i.test(o.nom)), `${P.ecran} : ⛔ le livre est encore au plan`);
    assert.ok(!Object.values(P.clef).includes("livre"), `${P.ecran} : ⛔ le livre a encore sa clef`);
  }
});

test("2 · les cibles du pied : au moins 44, dans la dalle, et aucune ne mord sa voisine", () => {
  for (const P of PLANS) {
    const pied = P.ORGANES.filter((o) => ["porte", "porte-carree", "rond"].includes(o.sorte));
    const cibles = pied.map((o) => ({ nom: o.nom, ...(o.cible || o) }));
    for (const c of cibles) {
      assert.ok(c.l >= 44 && c.h >= 44, `${P.ecran} : ${c.nom} sous le plancher 44`);
      assert.ok(c.x >= 0 && c.x + c.l <= P.dalle.l, `${P.ecran} : ${c.nom} sort de la dalle`);
    }
    for (let i = 0; i < cibles.length; i++) for (let j = i + 1; j < cibles.length; j++) {
      const a = cibles[i], b = cibles[j];
      const secants = a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;
      assert.ok(!secants, `${P.ecran} : ⛔ ${a.nom} et ${b.nom} se chevauchent`);
    }
  }
});

/* ══ 2 · LE DOM ════════════════════════════════════════════════════════════════════════════════ */

const ECRANS = [
  { ecran: "Gear", courant: "gear", monter: (surPorte) => construireLEcranGear({ surPorte }).noeud },
  { ecran: "sac", courant: "backpack", monter: (surPorte) => construireLeSac({
      sections: [{ nom: "Potions" }], section: 0, objets: [], poids: {}, destinations: [], surPorte }).noeud },
  { ecran: "Wares", courant: "wares", monter: (surPorte) => construireLesWares({
      categories: [{ nom: "Armory" }], categorie: 0, sousCategories: [{ nom: "Rings" }], sousCategorie: 0,
      objets: [], compte: 0, page: 0, pages: 1, sections: [{ valeur: "backpack", mot: "Backpack" }],
      destination: "backpack", surPorte }).noeud },
];

test("3 · les trois écrans posent l'organe partagé, AVANT Send, dans le groupe du pied — et plus de livre", () => {
  for (const E of ECRANS) {
    const n = E.monter(() => {});
    const rangee = n.querySelector('[data-pied="equipement"]');
    assert.ok(rangee && rangee.dataset.rangee, `${E.ecran} : la rangée du pied déclare data-rangee ET data-pied="equipement"`);
    const groupe = [...rangee.children].find((e) => e.className === "rangee-majeurs");
    assert.ok(groupe, `${E.ecran} : le groupe des majeurs manque`);
    const enfants = [...groupe.children];
    assert.equal(enfants.length, 2, `${E.ecran} : le groupe porte les carrés puis Send, rien d'autre`);
    assert.equal(enfants[0].className, "portes-carrees", `${E.ecran} : les carrés d'abord`);
    assert.equal(enfants[1].dataset.porte, "send", `${E.ecran} : Send ensuite`);
    const carres = [...enfants[0].children];
    assert.deepEqual(carres.map((b) => b.dataset.porte), ORDRE, `${E.ecran} : Gear · Pack · Wares`);
    assert.ok(carres.every((b) => b.className === "porte-carree"), `${E.ecran} : la classe de l'organe, et elle seule`);
    assert.equal(n.querySelectorAll(".fiche-livre").length, 0, `${E.ecran} : ⛔ le livre est revenu`);
  }
});

test("4 · ⚖️ le carré de l'écran où l'on est est DÉSIGNÉ (aria-current, pas disabled) et muet ; les deux autres publient leur porte", () => {
  for (const E of ECRANS) {
    const vus = [];
    const n = E.monter((id) => vus.push(id));
    const carres = n.querySelectorAll(".porte-carree");
    for (const b of carres) {
      const courant = b.dataset.porte === E.courant;
      /* ⚖️ « Plutôt que de griser on essaye le halo » : plus AUCUN carré n'est `disabled` */
      assert.equal(b.disabled, false, `${E.ecran} : ${b.dataset.porte} ⛔ n'est plus grisé — le halo le désigne`);
      assert.equal(b.getAttribute("aria-current"), courant ? "page" : null,
        `${E.ecran} : ${b.dataset.porte} — aria-current="page" sur le courant, et sur lui seul`);
      /* ⛔ `dispatchEvent` et non `click()` : ce garde doit prouver qu'il n'y a AUCUN écouteur. */
      b.dispatchEvent({ type: "click", target: b, preventDefault() {} });
    }
    assert.deepEqual(vus, ORDRE.filter((id) => id !== E.courant),
      `${E.ecran} : ⛔ le carré courant publie un geste, ou un carré armé est muet`);
  }
});

test("5 · l'organe partagé seul fabrique la porte carrée — aucun écran ne la recopie", () => {
  for (const f of fs.readdirSync(UI).filter((x) => x.endsWith(".mjs") && x !== "porte-carree.mjs")) {
    const src = stripComments(lire(f));
    /* ⭐ on cherche la FABRICATION (une classe posée sur un nœud), ⛔ pas le mot : la sorte
       `porte-carree` du plan et l'import du module ont le droit de le dire */
    assert.ok(!/(?:\b(?:el|eld|bouton)\(\s*(?:"button"\s*,\s*)?|className\s*=\s*|classList\.add\()["'`][^"'`]*\bporte-carree\b/.test(src),
      `${f} fabrique une porte carrée à la main : l'organe vit dans porte-carree.mjs`);
  }
  /* et l'organe, seul, désigne le carré courant — sans le griser */
  const g = portesCarrees({ courant: "wares" });
  assert.deepEqual([...g.children].map((b) => b.getAttribute("aria-current")), [null, null, "page"]);
  assert.deepEqual([...g.children].map((b) => b.disabled), [false, false, false]);
});

/* ══ 3 · LA MATIÈRE ════════════════════════════════════════════════════════════════════════════ */

test("6 · les images, leurs tailles et le mot sont ceux du banc 310", () => {
  /* les trois images : le fichier du banc, déclaré une fois dans tokens.css */
  for (const [id, fichier] of [["pack", "porte-pack.png"], ["wares", "porte-wares.png"], ["gear", "porte-gear.png"]]) {
    assert.ok(BANC.includes(`./assets/${fichier}`), `le banc peint ${fichier}`);
    assert.match(TOKENS, new RegExp(`--porte-image-${id}:\\s*url\\("\\./assets/${fichier.replace(".", "\\.")}\\?v=\\d+"\\)`),
      `--porte-image-${id} est l'image du banc`);
    assert.ok(fs.existsSync(path.join(UI, "assets", fichier)), `${fichier} est au dépôt`);
  }
  /* les tailles : relues DANS le banc, comparées à la feuille */
  const taille = (re) => { const m = re.exec(BANC); assert.ok(m, `le banc ne dit plus ${re}`); return m[1].trim(); };
  const pack = taille(/\.img-backpack\s*\{[^}]*--taille:\s*([^;]+);/);
  const gear = taille(/\.img-gear\s*\{[^}]*--taille:\s*([^;]+);/);
  const wares = taille(/\.img-wares\s*\{[^}]*mask-size:\s*([^;]+);/);
  assert.match(SHELL, new RegExp(`\\.porte-carree\\[data-porte="backpack"\\]\\s*\\{[^}]*--porte-image:\\s*var\\(--porte-image-pack\\);[^}]*--porte-image-taille:\\s*${pack.replace(/[.%]/g, "\\$&")};`),
    `Pack : ${pack}`);
  assert.match(SHELL, new RegExp(`\\.porte-carree\\[data-porte="gear"\\]\\s*\\{[^}]*--porte-image:\\s*var\\(--porte-image-gear\\);[^}]*--porte-image-taille:\\s*${gear.replace(/[.%]/g, "\\$&")};`),
    `Gear : ${gear}`);
  assert.match(SHELL, new RegExp(`\\.porte-carree\\[data-porte="wares"\\]\\s*\\{[^}]*--porte-image:\\s*var\\(--porte-image-wares\\);[^}]*--porte-image-taille:\\s*${wares.replace(/[.%]/g, "\\$&")};`),
    `Wares : ${wares}`);
  /* l'image : un masque sur l'encre FIXE du bouton (ivoire mêlé au corps) — 🔴 pas `--text-soft`, qui
     bascule avec le thème alors que le corps du bouton ne bascule pas (silhouettes perdues en clair) */
  assert.match(SHELL, /\.porte-carree-image\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--bouton-encre\)[^;]*var\(--bouton-face\)\);[^}]*mask:\s*var\(--porte-image\)/);
  assert.doesNotMatch(SHELL.slice(SHELL.indexOf(".porte-carree-image {"), SHELL.indexOf(".porte-carree-image {") + 900), /--text-soft\)/,
    "⛔ l'encre des silhouettes ne suit pas le thème");
  /* le mot : T0, italique, 600, centré, détaché par un halo du fond */
  const mot = /\.porte-carree-mot\s*\{([^}]*)\}/.exec(SHELL);
  assert.ok(mot, "la règle du mot existe");
  for (const d of [/font-style:\s*italic/, /font-weight:\s*600/, /font-size:\s*var\(--t0\)/, /text-align:\s*center/,
                   /text-shadow:\s*0 0 3px var\(--bouton-face\)/]) {
    assert.match(mot[1], d, `le mot : ${d}`);
  }
  /* le carré : 44 de cible, 40 peints — le retrait sur les QUATRE côtés */
  assert.match(SHELL, /button\.porte-carree\s*\{[^}]*inline-size:\s*var\(--touch\);[^}]*block-size:\s*var\(--touch\)/);
  assert.match(SHELL, /button\.porte-carree::before\s*\{\s*inset:\s*var\(--bouton-retrait-v\);\s*\}/);
  assert.match(SHELL, /button\.porte-carree::after\s*\{\s*inset:\s*calc\(var\(--bouton-retrait-v\) \+ var\(--bouton-lisere-marge\)\);\s*\}/);
  assert.match(SHELL, /button\.porte-carree\s*\{[^}]*--bouton-fond:\s*var\(--info\)/, "liseré bleu : on navigue");
});

test("7 · ⚖️ le carré de l'écran courant porte le HALO de l'actif — ⛔ plus de gris, ⛔ pas de box-shadow", () => {
  /* ⚖️ Eric, 27/09 au soir : « Plutôt que de griser on essaye le halo autour de la fenêtre active ». */
  const m = SHELL.match(/button\.porte-carree\[aria-current="page"\]::before\s*\{([^}]*)\}/);
  assert.ok(m, "⛔ le carré courant n'a pas de halo");
  /* ⭐ le halo de la maison : `--belt-halo` (la tuile dominante), l'épais repassé TROIS fois —
     regardé le 27/09 : `--spy-halo` se perdait en thème clair */
  const passes = [...m[1].matchAll(/drop-shadow\(0 0 var\(--halo-epais\) var\(--belt-halo\)\)/g)].length;
  assert.equal(passes, 3, `le halo repasse ${passes} fois, pas 3`);
  assert.match(m[1], /^\s*filter:/);
  /* 🔴 un `box-shadow` écraserait les arêtes du relief (`--bouton-aretes`, sur le même pseudo) */
  assert.ok(!/box-shadow/.test(m[1]), "⛔ halo en box-shadow : il effacerait le relief");
  /* ⛔ et plus aucun gris : ni `:disabled` du carré, ni voile éteint */
  assert.ok(!/\.porte-carree[^{}]*:disabled/.test(SHELL), "⛔ le gris du carré est revenu");
});

test("8 · 📐 la grille du pied : Send au centre par construction, les carrés répartis sur leur DESSIN", () => {
  const rangee = /\[data-rangee\]\[data-pied="equipement"\]\s*\{([^}]*)\}/.exec(SHELL);
  assert.ok(rangee, "la rangée du pied d'Équipement a sa grille");
  assert.match(rangee[1], /--pied-centre:\s*var\(--bouton-petit\)/, "la colonne du milieu vaut la cote de Send");
  assert.match(rangee[1], /grid-template-columns:\s*minmax\(0, 1fr\) var\(--pied-centre\) minmax\(0, 1fr\)/,
    "⛔ deux colonnes de côté ÉGALES — sinon Send n'est plus au centre");
  const groupe = /\[data-rangee\]\[data-pied="equipement"\] > \.rangee-majeurs\s*\{([^}]*)\}/.exec(SHELL);
  assert.ok(groupe, "le groupe des majeurs a sa règle");
  assert.match(groupe[1], /grid-column:\s*1 \/ span 2/);
  assert.match(groupe[1], /grid-template-columns:\s*minmax\(0, 1fr\) var\(--pied-centre\)/, "ses deux pistes tombent sur celles de la rangée");
  assert.match(SHELL, /\.portes-carrees\s*\{[^}]*justify-content:\s*space-evenly/, "répartis équitablement");
  assert.match(SHELL, /\.portes-carrees > \.porte-carree\s*\{\s*margin-inline:\s*calc\(-1 \* var\(--bouton-retrait-v\)\);\s*\}/,
    "⛔ sans la marge négative, la répartition se ferait sur les CIBLES, pas sur les dessins");
});
