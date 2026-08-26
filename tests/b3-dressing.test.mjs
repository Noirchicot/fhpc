/* ══ LE GARDE DES TROIS BANDES (NORMES §1 sexies — « un dressing qui
   scrolle, des boutons fixes », Eric 26/08) ══════════════════════════════════
   Au stub on garde la STRUCTURE (le défilement, lui, se juge au banc de
   parcours #dressing — GOOGLE HEADLESS) : le titre nomme B3 une fois et une
   seule, la pièce est cadrée SANS titre ni barre, le flux porte sac et
   remise, la barre porte la porte Equipment — et SB3.1/SB3.3 ne sont PAS
   supprimés (décision d'Eric en attente, posée par Archi 27). */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
globalThis.document = createTestDocument();

import { construireLeDressing } from "../ui/builder/b3-dressing.mjs";
import { construireLaSceneB3 } from "../ui/builder/b3-scene.mjs";
import { SCENE, SCENE_PIECE } from "../ui/builder/b3-disposition.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LIGNES = [
  { index: 0, ref: { id: "a" }, nomAffiche: "Rope", quantity: 1, location: "backpack" },
  { index: 1, ref: { id: "b" }, nomAffiche: "Tent", quantity: 1, location: "storage" },
];

test("trois bandes — titre · flux · barre, dans cet ordre, et UNE seule nomination", () => {
  const { noeud, flux } = construireLeDressing({ lignes: LIGNES, onAction: () => {} });
  const enfants = noeud.children.map((c) => c.className);
  assert.deepEqual(enfants, ["dressing-titre", "dressing-flux", "dressing-barre"],
    "l'ordre des bandes est la forme des écrans qui défilent (Seuil, dressing)");
  /* ⛔ depuis l'absorption, le titre est la SEULE chose qui nomme B3 : la
     pièce ne porte plus le mot — deux « Gear » seraient un retour en arrière. */
  const textes = [];
  (function ramasse(n) { for (const c of n.childNodes || []) { if (c.textContent && !c.childNodes?.length) textes.push(c.textContent); ramasse(c); } })(noeud);
  assert.equal(textes.filter((t) => /^gear$/i.test(t.trim())).length, 1,
    "« Gear » paraît UNE fois — le titre, et rien d'autre");
  assert.ok(flux.querySelector('[data-lieu="backpack"]'), "le flux porte le sac");
  assert.ok(flux.querySelector('[data-lieu="storage"]'), "et la remise");
});

test("la pièce — cadrée à SCENE_PIECE, sans titre ni barre ; l'écran d'hier garde les siens", () => {
  const piece = construireLaSceneB3({ piece: true });
  assert.equal(piece.noeud.getAttribute("height"), String(SCENE_PIECE.h), "la pièce s'arrête au Send-to");
  assert.equal(piece.noeud.querySelectorAll(".b3-titre").length, 0, "le mot est absorbé");
  assert.equal([...piece.noeud.querySelectorAll('[aria-label="Equipment"]')].length, 0, "la barre est extraite");

  /* ⛔ le produit d'AUJOURD'HUI (pilote gelé sous 5-VISEUR) monte la scène
     sans option : il garde titre et barre jusqu'à la couture du lot 5. */
  const ecran = construireLaSceneB3({});
  assert.equal(ecran.noeud.getAttribute("height"), String(SCENE.h));
  assert.equal(ecran.noeud.querySelectorAll(".b3-titre").length, 1);
  assert.ok(ecran.noeud.querySelector('[aria-label="Equipment"]'), "la porte du produit vivant ne casse pas");
});

test("la barre — Equipment publie son geste, le 5ᵉ cadre est un espace réservé, pas un bouton mort", () => {
  const gestes = [];
  const { noeud } = construireLeDressing({ lignes: [], onAction: () => {}, surBouton: (m) => gestes.push(m) });
  const equipment = noeud.querySelector('.dressing-barre [aria-label="Equipment"]');
  assert.ok(equipment, "la porte vers le catalogue vit dans la bande basse");
  equipment.click();
  assert.deepEqual(gestes, ["Equipment"]);
  assert.equal(noeud.querySelectorAll(".dressing-reserve").length, 1, "le cadre vide du croquis reste un espace");
  assert.equal(noeud.querySelectorAll(".dressing-bouton").length, 4, "quatre boutons nommés, pas cinq");
});

test("⚔️ ATTAQUE — les rangées du flux sont les MÊMES que celles des écrans SB3.x (une écriture)", async () => {
  /* Si quelqu'un redessine une rangée locale au dressing, les deux gestes
     d'échange divergeront en silence. On prouve l'identité par l'usage :
     la rangée du flux publie moveGearLine comme celle des écrans. */
  const actions = [];
  const { flux } = construireLeDressing({ lignes: LIGNES, onAction: (a) => actions.push(a) });
  /* ⚠️ le sélecteur du stub coupe à l'espace (combinateur descendant) — un
     aria-label à espaces se cherche à la main, pas en CSS. */
  const versWorn = [...flux.querySelectorAll("button")]
    .find((b) => b.getAttribute("aria-label") === "Move Rope to Worn");
  assert.ok(versWorn, "la rangée du sac porte ses destinations");
  versWorn.click();
  assert.deepEqual(actions, [{ kind: "moveGearLine", index: 0, location: "self" }]);
});

test("🔮 --magie — le violet existe aux DEUX thèmes, la pastille le porte, et il tient 3:1 sur sa surface", () => {
  /* NORMES §7 : violet = MAGIE, le croquis prime, et `tokens.css` n'avait
     AUCUN violet (la pastille portait --accent, un brun mesuré à 28°). Ce
     garde calcule le CONTRASTE depuis les valeurs déclarées — et le banc de
     parcours (#magie) mesure la même chose sur la page RENDUE (§0). */
  const ICI = path.dirname(fileURLToPath(import.meta.url));
  const tokens = fs.readFileSync(path.join(ICI, "..", "ui", "builder", "tokens.css"), "utf8");
  const shell = fs.readFileSync(path.join(ICI, "..", "ui", "builder", "shell.css"), "utf8");

  /* ⚠️ l'en-tête de tokens.css CITE « @media » dans sa prose — on ancre sur
     un début de ligne, pas sur la première occurrence (payé : un découpage
     qui s'arrêtait au commentaire et jurait que le violet n'existait pas). */
  const coupe = tokens.search(/^@media/m);
  const jour = tokens.slice(0, coupe);
  const nuit = tokens.slice(coupe);
  const lit = (bloc, jeton) => (bloc.match(new RegExp(`${jeton}:\\s*(#[0-9a-fA-F]{6})`)) || [])[1];

  const magieJour = lit(jour, "--magie"), surfaceJour = lit(jour, "--surface");
  const magieNuit = lit(nuit, "--magie"), surfaceNuit = lit(nuit, "--surface");
  assert.ok(magieJour && magieNuit, "le violet est déclaré aux deux thèmes");

  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contraste = (a, b) => {
    const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (h + 0.05) / (l + 0.05);
  };
  const cJour = contraste(magieJour, surfaceJour);
  const cNuit = contraste(magieNuit, surfaceNuit);
  assert.ok(cJour >= 3, `jour : ${cJour.toFixed(2)}:1 — un signal non textuel tient 3:1`);
  assert.ok(cNuit >= 3, `nuit : ${cNuit.toFixed(2)}:1`);

  /* la pastille porte la magie, plus jamais le brun */
  const bloc = shell.slice(shell.indexOf(".b3-attune"), shell.indexOf(".b3-attune[data-etat") + 80);
  assert.ok(bloc.includes("var(--magie)"), "la pastille lit --magie");
  assert.ok(!bloc.includes("var(--accent)"), "et plus jamais --accent — l'écart que §7 nommait");
});
