/* ══ LE GARDE DE LA SYNTAXE DES FEUILLES — lot 207, 2026-09-15 ═════════════

   🔴 LA FAUTE QUI L'A FAIT NAÎTRE, ET ELLE EST PASSÉE SOUS 2225 TESTS VERTS.
   En insérant une note datée dans `tokens.css`, j'ai fermé le commentaire
   TROP TÔT : le delimiteur de fin de mon texte a coupé le bloc, et les six lignes de
   l'ancienne note se sont retrouvées NUES dans la feuille, suivies d'un
   second delimiteur de fin, orphelin.

   📏 CE QUE ÇA A COÛTÉ, mesuré au navigateur : le moteur CSS, tombant sur de
   la prose, saute jusqu'au prochain `;` — et ce `;` était celui de
   `--chevron-trait`. Le jeton a donc DISPARU. `border-top: var(--sp-2) solid
   var(--chevron-trait)` est devenu invalide, sa `border-style` est retombée à
   `none`, et **les deux chevrons du belt ont cessé d'être dessinés**. Le
   symptôme était à trois organes de la cause.

   ⛔ ET AUCUN GARDE NE POUVAIT LE DIRE. Toute la suite lit les feuilles avec
   des expressions régulières sur les accolades : elles ne parsent
   pas les commentaires, donc elles ne voient pas qu'une feuille est CASSÉE.
   Elles répondent à « que dit la règle ? », jamais à « la feuille est-elle
   une feuille ? ». Une suite entière peut être verte sur un fichier que le
   navigateur refuse à moitié.

   ⭐ LA LEÇON, ET ELLE DÉPASSE LE CSS : quand tous les gardes lisent un
   fichier À TRAVERS le même extracteur, aucun ne peut accuser l'extracteur.
   Il faut un garde qui lise les OCTETS, en amont de toute interprétation. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOSSIER = path.join(ROOT, "ui", "builder");
const FEUILLES = fs.readdirSync(DOSSIER).filter((n) => n.endsWith(".css")).sort();

/** Retire les commentaires en MARCHANT le texte, et rend ce qui reste avec la
 *  position de chaque incident. ⛔ Pas une regex gourmande-paresseuse : elle avale
 *  silencieusement un commentaire mal fermé en le recollant au suivant —
 *  c'est-à-dire qu'elle CACHE exactement la faute qu'on cherche. */
function marcher(css) {
  const incidents = [];
  let reste = "";
  let i = 0;
  while (i < css.length) {
    if (css[i] === "/" && css[i + 1] === "*") {
      const fin = css.indexOf("*/", i + 2);
      if (fin === -1) {
        incidents.push({ quoi: "commentaire jamais refermé", ligne: ligneDe(css, i) });
        break;
      }
      i = fin + 2;
      continue;
    }
    if (css[i] === "*" && css[i + 1] === "/") {
      incidents.push({ quoi: "délimiteur de fin orphelin — un commentaire a été refermé deux fois", ligne: ligneDe(css, i) });
      i += 2;
      continue;
    }
    reste += css[i];
    i += 1;
  }
  return { reste, incidents };
}

const ligneDe = (texte, index) => texte.slice(0, index).split("\n").length;

test("🔴 LES COMMENTAIRES SONT ÉQUILIBRÉS — une feuille à moitié refusée reste verte sous tous les autres gardes", () => {
  for (const nom of FEUILLES) {
    const css = fs.readFileSync(path.join(DOSSIER, nom), "utf8");
    const { incidents } = marcher(css);
    assert.deepEqual(incidents, [],
      "⛔ `" + nom + "` : " + incidents.map((x) => x.quoi + " (ligne " + x.ligne + ")").join(" · ") +
      "\n   Le moteur CSS saute alors jusqu'au prochain `;` et MANGE la déclaration suivante." +
      "\n   Symptôme typique : un jeton qui disparaît, et un organe sans rapport qui cesse d'être peint.");
  }
});

test("🔴 CE QUI RESTE HORS COMMENTAIRE EST DU CSS — pas de la prose", () => {
  /* ⭐ LE SECOND FILET, et il attrape l'autre moitié du même accident : une
     note qui s'ouvre sans delimiteur d'ouverture. Le premier garde ne verrait rien (les
     compteurs restent équilibrés), et pourtant la prose serait dans la
     feuille. Ici on regarde ce que CHAQUE bloc contient : une déclaration
     porte un `:`, une règle imbriquée porte une accolade. Rien d'autre. */
  for (const nom of FEUILLES) {
    const { reste } = marcher(fs.readFileSync(path.join(DOSSIER, nom), "utf8"));
    for (const [, selecteur, corps] of reste.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      /* Un at-rule (`@media`, `@font-face`, `@supports`) porte des blocs
         imbriqués : son « corps » vu par cette expression est déjà le bloc
         intérieur, donc la règle vaut pour lui aussi. */
      for (const morceau of corps.split(";")) {
        const net = morceau.trim();
        if (!net) continue;
        assert.ok(net.includes(":"),
          "⛔ `" + nom + "` porte du texte qui n'est pas une déclaration, dans `" +
          selecteur.trim().split("\n").pop().slice(0, 60) + "` :\n   « " + net.slice(0, 90) + " »");
      }
    }
  }
});

test("🔴 LES ACCOLADES SONT ÉQUILIBRÉES", () => {
  for (const nom of FEUILLES) {
    const { reste } = marcher(fs.readFileSync(path.join(DOSSIER, nom), "utf8"));
    let profondeur = 0;
    for (const c of reste) {
      if (c === "{") profondeur += 1;
      else if (c === "}") profondeur -= 1;
      assert.ok(profondeur >= 0, "⛔ `" + nom + "` ferme une accolade qui n'était pas ouverte");
    }
    assert.equal(profondeur, 0, "⛔ `" + nom + "` laisse " + profondeur + " accolade(s) ouverte(s)");
  }
});
