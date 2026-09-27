/* ══ LOT 308 — LA MOLETTE DE QUANTITÉ DES FICHES X1 ET X2 ═══════════════════════════════════════

   ⚖️ Eric, 2026-09-27 : *« Dans les fiches x, il faut harmoniser le bouton des quantités »* · *« La
   molette tambour ! »* · *« 20 c'est bien »* · *« Partout ailleurs sauf dans x5 »* · *« Pour x5
   uniquement pas de molette tambour »*.

   🔴 CE QUE CE GARDE DÉFEND :
   · UN organe, pas deux copies : X1 et X2 montent LA MÊME molette (le même module, la même classe),
     et elle est bâtie sur le tambour de la maison (`roue-tambour.mjs`), ⛔ pas un troisième tambour ;
   · la plage : 1 … min(pile, 20) sur X1, 1 … 20 sur X2 — le 20 écrit UNE fois ;
   · l'exception : X5 garde son menu Qty ▾ de 1 à 10, et ⛔ ne porte pas de molette ;
   · les gestes : tap, chevrons, molette de la souris, clavier, et le ruban qui s'arrête (doigt,
     trackpad) — chacun rend UN choix ;
   · la peau : celle des crans, du viseur, de la roue et des tuners du sac et de Wares, ⛔ pas une
     peau neuve.
   ⛔ SA LIMITE : il lit le DOM du stub, pas un rendu. Le glisser au doigt se regarde au navigateur
   (captures du lot 308). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const lire = (f) => stripComments(fs.readFileSync(path.join(UI, f), "utf8"));

const { construireLaMolette, PLAFOND_MOLETTE, plafondDeLaMolette, borneDeLaMolette, feuilleDeLaMolette } =
  await import("../ui/builder/molette-quantite.mjs");
const { REPOS_MS } = await import("../ui/builder/sac-ecran.mjs");
const { coteDeLaCale } = await import("../ui/builder/roue-tambour.mjs");
const D = await import("../ui/builder/x1-disposition.mjs");
const { construireLaFicheX1 } = await import("../ui/builder/x1-ecran.mjs");
const { construireLaFicheX2 } = await import("../ui/builder/x2-ecran.mjs");
const { construireX5 } = await import("../ui/builder/x5-ecran.mjs");
const { PLAFOND_QTE } = await import("../ui/builder/craft.mjs");

const valeurs = (n) => [...n.querySelectorAll(".molette-cran")].map((c) => Number(c.dataset.valeur));
const suite = (k) => Array.from({ length: k }, (_, i) => i + 1);
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

test("1 — ⚖️ LE PLAFOND EST 20, ÉCRIT UNE FOIS : « 20 c'est bien », « Partout ailleurs sauf dans x5 »", () => {
  assert.equal(PLAFOND_MOLETTE, 20);
  assert.equal(PLAFOND_QTE, 10, "⭐ et X5 garde le sien, 10");
  const ecrits = fs.readdirSync(UI).filter((f) => f.endsWith(".mjs"))
    .filter((f) => /PLAFOND_MOLETTE\s*=/.test(lire(f)));
  assert.deepEqual(ecrits, ["molette-quantite.mjs"], "⛔ le 20 n'a qu'un écrivain");
  assert.equal(plafondDeLaMolette(40), 20, "une pile de 40 : 20 au plus");
  assert.equal(plafondDeLaMolette(5), 5, "une pile de 5 : 5");
  assert.equal(borneDeLaMolette(0, 5), 1);
  assert.equal(borneDeLaMolette(7, 5), 5);
  assert.equal(borneDeLaMolette(33), 20);
});

test("2 — ⭐ X1 ET X2 MONTENT LA MÊME MOLETTE — X1 : 1…min(pile, 20) ; X2 : 1…20", () => {
  const x1 = (pile) => construireLaFicheX1({ objet: { index: 0, nom: "Arrows", qte: 1, pile } }).noeud;
  assert.deepEqual(valeurs(x1(40)), suite(20), "⚖️ une pile de 40 offre 1…20");
  assert.deepEqual(valeurs(x1(5)), suite(5), "une pile de 5 offre 1…5 : le dernier cran dit la pile");
  const organe = x1(5).querySelector('[data-organe="send-n"]');
  const roueX1 = organe.querySelector(".molette-roue");
  assert.ok(roueX1 && organe.querySelector(".molette"), "la molette EST l'organe SEND N");
  assert.equal(roueX1.getAttribute("role"), "slider", "un curseur, pour le lecteur d'écran et le clavier");
  assert.equal(organe.querySelector("input"), null, "⛔ plus de champ « 1/5 »");

  const x2 = construireLaFicheX2({ liste: [{ nom: "Caltrops", coutTexte: "1 GP", poidsTexte: "2 lb." }], index: 0, bourse: {} });
  assert.deepEqual(valeurs(x2), suite(20), "⚖️ X2 : de 1 à 20");
  assert.equal(x2.querySelectorAll(".pipeline-pas").length, 0, "⛔ plus de ±");

  /* ⭐ LE MÊME MODULE, lu dans les sources — ⛔ pas une molette recopiée */
  for (const f of ["x1-ecran.mjs", "x2-ecran.mjs"]) {
    assert.match(lire(f), /import \{[^}]*construireLaMolette[^}]*\} from "\.\/molette-quantite\.mjs\?v=\d+"/, `${f} importe la molette`);
  }
  const molette = lire("molette-quantite.mjs");
  assert.match(molette, /import \{ monterLeTambour, coteDeLaCale \} from "\.\/roue-tambour\.mjs\?v=\d+"/,
    "⭐ la molette est le tambour de la maison");
  assert.match(molette, /monterLeTambour\(\{ roue, ruban, crans,/);
  assert.doesNotMatch(molette, /scroll-snap|ruban\.append\(/, "⛔ elle ne refait ni le ruban ni l'aimant");
});

test("3 — ⚖️ X5 GARDE SON MENU Qty ▾ DE 1 À 10 : « Pour x5 uniquement pas de molette tambour »", () => {
  const query = exempleFhEn().layers.verbs.query;
  const bases = query({ kind: "weapon" }).map((v) => v.record);
  const plan = query({ kind: "item" }).map((v) => v.record).find((r) => r.data.name === "Weapon, +1, +2, or +3");
  const { noeud } = construireX5({ plan, bases, choix: { base: "Longsword" }, surChoix: () => {} });
  const q = noeud.querySelector('[data-organe="QTY"]');
  assert.equal(q.tagName.toLowerCase(), "select", "le menu natif");
  assert.deepEqual([...q.children].map((o) => o.value), suite(10).map(String));
  assert.equal(noeud.querySelector(".molette"), null, "⛔ aucune molette dans X5");
  for (const f of ["x5-ecran.mjs", "x5-parchemin.mjs"]) {
    assert.doesNotMatch(lire(f), /molette-quantite/, `⛔ ${f} n'importe pas la molette`);
  }
});

test("4 — ⚖️ LES GESTES : tap, chevrons, molette de la souris, clavier — un choix chacun", () => {
  const recus = [];
  const m = construireLaMolette({ M: D.MOLETTE, valeur: 3, stock: 5, surChoix: (n) => recus.push(n) });
  const roue = m.querySelector(".molette-roue");
  assert.equal(roue.getAttribute("aria-valuenow"), "3");
  assert.equal(roue.getAttribute("aria-valuemax"), "5");
  /* tap */
  m.querySelector('.molette-cran[data-valeur="5"]').dispatchEvent({ type: "click" });
  assert.deepEqual(recus, [5]);
  /* chevrons — ⛔ jamais au-delà des bornes */
  m.querySelector('.molette-tuner[data-sens="droite"]').dispatchEvent({ type: "click" });
  assert.deepEqual(recus, [5], "au bout, le chevron ne rend rien de plus");
  m.querySelector('.molette-tuner[data-sens="gauche"]').dispatchEvent({ type: "click" });
  assert.deepEqual(recus, [5, 4]);
  /* clavier */
  const touche = (key) => roue.dispatchEvent({ type: "keydown", key, preventDefault() {} });
  touche("ArrowLeft"); touche("Home"); touche("End"); touche("ArrowUp");
  assert.deepEqual(recus, [5, 4, 3, 1, 5], "← · Début · Fin — et ↑ au bout ne rend rien");
  /* molette de la souris : un cran par cran ; les petits pas d'un trackpad s'additionnent */
  const tourne = (deltaY, deltaX = 0) => m.dispatchEvent({ type: "wheel", deltaY, deltaX, deltaMode: 0, preventDefault() {} });
  tourne(-100);
  assert.deepEqual(recus.slice(-1), [4], "un cran de molette vers le haut : un de moins");
  tourne(-10); tourne(-10);
  assert.equal(recus.length, 6, "deux effleurements ne font pas un cran");
  tourne(-10); tourne(-10);
  assert.deepEqual(recus.slice(-1), [3], "quatre en font un");
  tourne(-5, 100);
  assert.equal(recus.length, 7, "⛔ un glissé de côté n'est pas pour la molette : il fait défiler le ruban");
  assert.equal(roue.getAttribute("aria-valuenow"), "3");
});

test("5 — ⚖️ LE RUBAN QUI S'ARRÊTE (doigt, trackpad) CHOISIT LE CRAN SOUS LE VISEUR — une fois", async () => {
  const recus = [];
  const m = construireLaMolette({ M: D.MOLETTE, valeur: 1, stock: 20, surChoix: (n) => recus.push(n) });
  const roue = m.querySelector(".molette-roue");
  await attendre(40);                       /* la pose de départ est passée */
  roue.scrollLeft = D.MOLETTE.pas * 6.4;    /* le doigt lâche entre le 7ᵉ et le 8ᵉ cran */
  roue.scrollLeft = D.MOLETTE.pas * 7.2;
  assert.deepEqual(recus, [], "⛔ rien pendant que le ruban glisse");
  assert.equal(m.querySelector('.molette-cran[data-dominant="oui"]').dataset.valeur, "8", "le viseur suit à chaque image");
  await attendre(REPOS_MS + 60);
  assert.deepEqual(recus, [8], "⭐ posé : le cran sous le viseur est choisi, une fois");
  assert.equal(roue.getAttribute("aria-valuenow"), "8");
});

test("6 — 📐 LA GÉOMÉTRIE VIENT DU PLAN ET DU TAMBOUR — ⛔ aucune cote écrite", () => {
  const M = D.MOLETTE;
  assert.equal(M.piste, M.vus * M.tuile + (M.vus - 1) * M.ecart, "la piste montre trois crans entiers");
  assert.equal(M.pas, M.tuile + M.ecart);
  const css = feuilleDeLaMolette(".x1", M);
  assert.match(css, new RegExp(`\\.x1 \\.molette \\.roue-cale\\{[^}]*inline-size:${coteDeLaCale(M)}px`),
    "⭐ la cale est celle du tambour (`coteDeLaCale`)");
  assert.match(css, new RegExp(`\\.x1 \\.molette-cran\\{inline-size:${M.tuile}px;block-size:${M.hauteur}px\\}`));
  const organe = D.ORGANES.find((o) => o.nom === "SEND N");
  assert.equal(organe.sorte, "molette");
  assert.equal(organe.l, M.piste + 2 * M.bord, "l'organe du plan est la piste et ses deux bords");
  for (const f of ["molette-quantite.mjs"]) {
    assert.doesNotMatch(lire(f), /\b(92|136|28|32)px\b/, "⛔ aucun nombre du plan recopié");
  }
});

test("7 — ⭐ LA PEAU EST CELLE DU SAC ET DE WARES — la molette entre dans LEURS listes", () => {
  const css = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
  const regle = (selecteurs) => new RegExp(selecteurs.map((s) => s.replace(/[.[\]"=()-]/g, "\\$&")).join(",\\s*") + "\\s*\\{");
  assert.match(css, regle([".sac-cran", ".wares-cran", ".molette-cran"]), "le cran");
  assert.match(css, regle(['.sac-cran[data-dominant="oui"]', '.wares-cran[data-dominant="oui"]', '.molette-cran[data-dominant="oui"]']),
    "le cran sous le viseur, et son halo");
  assert.match(css, regle([".wares-roue", ".molette-roue"]), "la roue qui défile (pan-x, aimant)");
  assert.match(css, regle([".wares-loupe", ".molette-loupe"]), "le viseur qui ne reçoit rien");
  /* 🔄 LOT 326 — la liste s'allonge : « Les chevrons latéraux de backpack sont mes préférés […] Applique
     cela partout » (Eric, 27/09) — Wares et le belt entrent dans la peau du chevron de Pack. */
  assert.match(css, regle([".sac-tuner", ".molette-tuner", ".wares-tuner", ".wares-chevron", ".belt-chevron-fleche"]),
    "le chevron et sa flèche circulaire");
  assert.doesNotMatch(css, /\.x1-saisie|\.x2-pas|\.pipeline-qte/, "🗄️ les peaux des contrôles morts sont parties");
});
