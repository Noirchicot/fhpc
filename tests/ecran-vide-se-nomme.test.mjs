/* ══ LOT 201 — UN ÉCRAN VIDE SE NOMME ═══════════════════════════════════════

   📏 LE DÉFAUT, MESURÉ LE 2026-09-13 (Eric, sur le site déployé, v624) :
   Species s'est dessiné VIDE — belt, fond, `?`, et rien. Aucune erreur en
   console, `snaps 0`. L'écran mort (`ecran-mort.mjs`, lot 183) couvre l'écran
   qui REFUSE de se dessiner ; personne ne couvrait l'écran qui se dessine
   sans rien dedans. La cause du jour est fermée ailleurs (deux verrous,
   `premier-pas.test.mjs` G) ; ce fichier garde l'AUTRE moitié : la prochaine
   cause, inconnue, ne pourra plus être muette.

   ⭐ CE QUE CE FICHIER GARDE : `nommerLeVide` écrit dans une carte VIDE ce que
   la coquille sait, et RIEN dans une carte pleine. Les deux moitiés comptent :
   un mot posé sur un écran plein serait un second contenu. Et les BORNES (le
   `?`, le livre) ne comptent pas comme contenu — c'est exactement ce que la
   capture montrait.

   ⚠️ LES PHRASES SONT DES BROUILLONS EN ATTENTE D'ERIC : on teste ce qu'elles
   PORTENT (l'étape, le moteur, le document, la pile, la dérivation, le carnet,
   la sortie), jamais leur ponctuation. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();
const { estVide, nommerLeVide, lignesDeLEcranVide } = await import("../ui/builder/ecran-vide.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.mjs"), "utf8"));

const FAITS = {
  etape: "Species", rang: 2, palier: 1, item: null, lore: false,
  moteur: "loaded", document: true, pile: "srdfh", couches: 9, derivation: "pick a class", plans: 0
};
function carte(...enfants) {
  const c = document.createElement("section");
  c.className = "decision-card";
  for (const e of enfants) c.append(e);
  return c;
}
function borne() {
  const b = document.createElement("button");
  b.className = "guide-borne";
  b.append(document.createTextNode("?"));
  return b;
}
const texte = (mot) => { const p = document.createElement("p"); p.append(document.createTextNode(mot)); return p; };

/* ══ A — VIDE OU PLEIN, LU SUR LES NŒUDS ═══════════════════════════════════ */

test("A1 — une carte sans rien est vide ; une carte avec un mot ne l'est pas", () => {
  assert.equal(estVide(carte()), true);
  assert.equal(estVide(carte(texte("Human"))), false);
  assert.equal(estVide(null), true, "pas de carte du tout : vide");
});

test("A2 — 🔴 les BORNES ne comptent pas : le `?` seul, c'est la capture d'Eric", () => {
  const b = borne();
  const c = carte(b);
  assert.equal(estVide(c, [b]), true, "⛔ le `?` posé par la coquille n'est pas un contenu");
  assert.equal(estVide(c, []), false, "témoin inverse : sans les nommer, le `?` compte — la coquille DOIT passer ses bornes");
});

test("A3 — une image compte, un nœud caché non, un blanc non", () => {
  assert.equal(estVide(carte(document.createElement("img"))), false, "une carte d'image est pleine");
  const cache = texte("Human"); cache.hidden = true;
  assert.equal(estVide(carte(cache)), true, "un nœud `hidden` n'est pas visible");
  assert.equal(estVide(carte(texte("   "))), true, "un blanc n'est pas un mot");
  const profond = document.createElement("div"); profond.append(document.createElement("div")); profond.childNodes[0].append(texte("deep"));
  assert.equal(estVide(carte(profond)), false, "le contenu se cherche en profondeur");
});

/* ══ B — LE MOT, ET LES DEUX MOITIÉS ═══════════════════════════════════════ */

test("B1 — 🔴 une carte vide reçoit le mot, et la carte se déclare (`data-ecran-vide`)", () => {
  const b = borne();
  const c = carte(b);
  assert.equal(nommerLeVide(c, FAITS, { bornes: [b] }), true);
  assert.equal(c.dataset.ecranVide, "true", "par la DONNÉE — le banc et les gardes lisent l'attribut");
  const mot = c.textContent;
  for (const attendu of ["Species", "step 2", "loaded", "srdfh", "9 layers", "pick a class", "0 decision plans", "Menu"]) {
    assert.ok(mot.includes(attendu), `le mot porte « ${attendu} »`);
  }
  assert.ok(c.querySelectorAll("p.placeholder").length >= 5, "une ligne par fait, la classe de l'écran mort — pas un organe neuf");
});

test("B2 — ⚔️ une carte PLEINE ne reçoit RIEN — l'autre moitié", () => {
  const c = carte(texte("Human"), borne());
  const avant = c.childNodes.length;
  assert.equal(nommerLeVide(c, FAITS, { bornes: [] }), false);
  assert.equal(c.childNodes.length, avant, "⛔ pas un nœud de plus sur un écran qui a son contenu");
  assert.notEqual(c.dataset.ecranVide, "true");
});

test("B3 — sans document, le mot le dit et ne parle ni de pile ni de carnet", () => {
  const lignes = lignesDeLEcranVide({ ...FAITS, document: false, pile: null });
  assert.ok(lignes.some((l) => /Character: none/.test(l)));
  assert.ok(!lignes.some((l) => /Rules:|Notebook:|Sheet:/.test(l)), "⛔ une pile inventée pour un document absent serait un mensonge");
  assert.ok(lignes.at(-1).includes("Menu"), "la SORTIE ferme le mot — le geste qui a ramené l'écran à Eric");
});

/* ══ C — UN SEUL ÉCRIVAIN, AU POINT QUE TOUT CONTENU TRAVERSE ══════════════ */

test("C1 — 🔌 la coquille nomme le vide dans `poserLaSortie`, une fois, avec SES bornes", () => {
  assert.equal((shell.match(/nommerLeVide\(/g) || []).length, 1,
    "⛔ un organe que N écrans fabriquent sera oublié : un seul appel, au point commun des deux rendus");
  assert.match(shell, /function poserLaSortie\(contenu, sortie\) \{[\s\S]*?nommerLeVide\(contenu, faitsDeLEcran\(\), \{ bornes: contenu\.querySelectorAll\(BORNES\) \}\);/,
    "les bornes sont CELLES de la coquille (`BORNES`), pas une liste recopiée");
  assert.match(shell, /function faitsDeLEcran\(\) \{[\s\S]*?derivation: state\.derivationImpossible,\s*plans: Array\.isArray\(state\.decisions\) \? state\.decisions\.length : 0/,
    "les faits sont lus sur `state` — la dérivation et le carnet, ceux du défaut du 13/09");
});
