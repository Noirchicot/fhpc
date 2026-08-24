/* ══ LE GARDE DE LA DISPOSITION DU DRESSING (B3) ══════════════════════════════
   🔴 LA LOI QU'IL DÉFEND, D'ERIC MOT POUR MOT (24/08) : *« la base à garder =
   la dimension d'un item normalisé drag and drop. Le reste est secondaire. »*
   Donc : le jeton de la disposition EST celui des tokens (pas une recopie qui
   dérive), chaque boîte tient dans la scène, et aucune n'en chevauche une
   autre — trois choses qu'un œil rate et qu'une mesure attrape. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(ICI, "..", "ui", "builder");

const dispo = await import(path.join(UI, "b3-disposition.mjs"));
const tokens = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");

test("B3 — le jeton de la disposition EST celui des tokens, pas une seconde vérité", () => {
  /* ⛔ `JETON` recopie `--glisse-case`/`--glisse-h` parce qu'un SVG ne lit pas
     une variable CSS dans ses attributs. Une recopie sans garde diverge au
     premier réglage — c'est CE test qui l'en empêche. */
  const [, caseL] = tokens.match(/--glisse-case:\s*(\d+)px/) || [];
  const [, caseH] = tokens.match(/--glisse-h:\s*(\d+)px/) || [];
  assert.equal(dispo.JETON.l, Number(caseL), "la largeur du jeton suit --glisse-case");
  assert.equal(dispo.JETON.h, Number(caseH), "la hauteur du jeton suit --glisse-h");
  /* Et le plancher du doigt est tenu d'office : 48 ≥ 44. Si un réglage faisait
     passer le jeton sous --touch, le POSER ici serait mentir plus longtemps. */
  const [, touche] = tokens.match(/--touch:\s*(\d+)px/) || [];
  assert.ok(dispo.JETON.h >= Number(touche), "le jeton ne descend jamais sous --touch");
});

/** Chaque boîte, résolue en rectangle écran. */
function rectangles() {
  return dispo.BOITES.map((b) => {
    const l = b.l || dispo.JETON.l;
    const x = b.centre ? (dispo.SCENE.l - l) / 2 : b.x;
    return { clef: b.clef, x, y: b.y, l, h: dispo.JETON.h };
  });
}

test("B3 — chaque boîte tient dans la scène, entière", () => {
  for (const r of rectangles()) {
    assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.l <= dispo.SCENE.l && r.y + r.h <= dispo.SCENE.h,
      `⛔ ${r.clef} déborde de la scène (${r.x},${r.y} ${r.l}×${r.h})`);
  }
});

test("B3 — aucune boîte n'en chevauche une autre", () => {
  /* 🔴 POURQUOI CE N'EST PAS DÉCORATIF : le dressing est un écran de DÉPÔT.
     Deux boîtes qui se recouvrent, c'est un lâcher ambigu — le doigt vise
     l'une, l'écran entend l'autre. La zone commune du croquis d'Eric n'en a
     aucune ; ce garde l'empêche d'apparaître par accident de réglage. */
  const rs = rectangles();
  const paires = [];
  for (let i = 0; i < rs.length; i++) {
    for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i], b = rs[j];
      const chevauche = a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;
      if (chevauche) paires.push(`${a.clef} × ${b.clef}`);
    }
  }
  assert.deepEqual(paires, [], "⛔ des boîtes se recouvrent");
});

test("B3 — ⚔️ ATTAQUE : le garde du chevauchement mord vraiment", () => {
  /* Une suite verte ne prouve rien sur ce que personne n'éprouve : on vérifie
     qu'un recouvrement fabriqué serait bien vu par la même géométrie. */
  const a = { x: 10, y: 10, l: 87, h: 48 }, b = { x: 50, y: 30, l: 87, h: 48 };
  const chevauche = a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;
  assert.equal(chevauche, true, "deux rectangles sécants sont bien déclarés sécants");
});

test("B3 — les piles gardent l'écart déclaré (jeton + PILE)", () => {
  /* 📏 Le croquis dit ~10, snappé à 8 — le chiffre récurrent d'Eric. Ce test
     fige la RÈGLE (les piles sont régulières), pas le chiffre : changer PILE
     dans la déclaration suffit, et tout suit. */
  const par = Object.fromEntries(rectangles().map((r) => [r.clef, r]));
  const pas = dispo.JETON.h + dispo.PILE;
  for (const [haut, bas] of [["forge1", "forge2"], ["tete1", "tete2"],
                             ["hilt1", "hilt3"], ["hilt2", "hilt4"],
                             ["pied1", "pied2"], ["poche1", "poche3"], ["poche2", "poche4"]]) {
    assert.equal(par[bas].y - par[haut].y, pas, `la pile ${haut} → ${bas} suit le pas`);
  }
});
