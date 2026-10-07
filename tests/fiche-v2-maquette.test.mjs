/* ══ LE GARDE DE LA FICHE V2 (MAQUETTE) — lot 395 ══════════════════════════════
   ⚖️ Eric, 2026-10-07 : *« peux-tu implémenter à l'emplacement Sheet dans le builder ? »*,
   périmètre **« Maquette seule »** ; *« Quand on appuie sur Sheet, on garde encore l'ancien belt.
   La fiche est réduite de 10 %, ce qui nous laisse de l'espace pour 3 boutons : list · manage ·
   live »* ; *« l'export peut être un bouton supplémentaire »* ; Live = *« la vraie fiche en jeu
   avec le nouveau belt qui remplace l'ancien »*, et la lune inversée *« ramène à l'ancien belt »*.

   ── CE QUE CES GARDES TIENNENT ─────────────────────────────────────────────
   1. LA TABLE (générée par le vault) tient ses lois : tout organe dans le panneau 375 × 560, le
      tambour dans ses 44, et aucune cible tactile qui en chevauche une autre.
   2. L'APERÇU est la fiche SANS son tambour, à 0,9 — et la rangée du hub tient dans la scène
      de 500, alignée sur les bords de l'aperçu.
   3. LA FEUILLE pose chaque rectangle du plan tel quel (aucun nombre retapé dans le module).
   4. ⛔ AUCUN FAUX MAGASIN : la maquette ne porte AUCUN `<button>` dans l'aperçu, et UN seul en
      jeu — la lune, qui ramène. Le témoin contraire est le Live lui-même : s'il en portait zéro,
      la sortie serait perdue ; s'il en portait plus, la maquette ferait semblant d'agir.
   5. LE HUB porte ses quatre portes dans l'ordre d'Eric, et `List` dit son état.
   6. LA COQUILLE efface l'ancien belt EN JEU, par l'attribut — et la feuille le laisse agir.
   7. L'ÉTAT NEUF s'ouvre sur l'aperçu, hors jeu. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();

const ICI = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(ICI, "..", "ui", "builder");
const D = await import("../ui/builder/fiche-v2-disposition.mjs");
const E = await import("../ui/builder/fiche-v2-ecran.mjs");
const { etatNeuf } = await import("../ui/builder/etat-neuf.mjs");

const recouvre = (a, b) => a.x < b.x + b.l - 0.01 && b.x < a.x + a.l - 0.01 &&
  a.y < b.y + b.h - 0.01 && b.y < a.y + a.h - 0.01;

test("1 — 📐 la table tient ses lois : le panneau, le tambour, les cibles", () => {
  for (const o of D.ORGANES) {
    assert.ok(o.x >= 0 && o.y >= 0 && o.x + o.l <= D.PANNEAU.l + 0.01 && o.y + o.h <= D.PANNEAU.h + 0.01,
      `${o.nom} sort du panneau`);
    if (o.groupe === "Belt") assert.ok(o.y + o.h <= D.BELT_H + 0.01, `${o.nom} sort du tambour`);
  }
  const cibles = D.ORGANES.filter((o) => o.cible);
  assert.ok(cibles.length > 30, "la table porte ses cibles");
  for (let i = 0; i < cibles.length; i++) {
    for (let j = i + 1; j < cibles.length; j++) {
      assert.ok(!recouvre(cibles[i].cible, cibles[j].cible),
        `⛔ deux cibles se chevauchent : ${cibles[i].nom} et ${cibles[j].nom}`);
    }
  }
});

test("2 — 🔍 l'aperçu est la fiche SANS tambour, à 0,9 ; la rangée du hub tient dans la scène", () => {
  const A = D.APERCU;
  assert.equal(A.echelle, 0.9, "Eric : « la fiche est réduite de 10 % »");
  assert.equal(A.l, D.PANNEAU.l * A.echelle);
  assert.ok(Math.abs(A.h - (D.PANNEAU.h - D.BELT_H) * A.echelle) < 1e-9, "l'aperçu ne compte pas le tambour");
  assert.ok(Math.abs(A.x - (D.SCENE.l - A.l) / 2) < 1e-9, "centré dans la scène");
  assert.deepEqual(D.HUB_BOUTONS.map((b) => b.id), ["liste", "manage", "live", "export"],
    "les trois portes d'Eric, puis l'export « en plus »");
  for (const b of D.HUB_BOUTONS) {
    assert.ok(b.cible.y >= A.y + A.h - 0.01, `${b.mot} mord sur l'aperçu`);
    assert.ok(b.cible.y + b.cible.h <= D.SCENE.h + 0.01, `${b.mot} sort de la scène`);
    assert.ok(b.y >= b.cible.y && b.y + b.h <= b.cible.y + b.cible.h + 0.01, `${b.mot} : le dessin sort de sa cible`);
  }
  const [premier] = D.HUB_BOUTONS; const dernier = D.HUB_BOUTONS.at(-1);
  assert.ok(Math.abs(premier.x - A.x) < 0.01 && Math.abs(dernier.x + dernier.l - (A.x + A.l)) < 0.01,
    "la rangée s'aligne sur les bords de l'aperçu");
});

test("3 — 📏 la feuille pose chaque rectangle du plan tel quel", () => {
  const f = E.feuilleDeLaFicheV2();
  const px = (v) => `${Math.round(v * 1000) / 1000}px`;
  D.ORGANES.forEach((o, i) => {
    assert.ok(f.includes(`[data-organe="${i}"]{left:${px(o.x)};top:${px(o.y)};width:${px(o.l)};height:${px(o.h)}}`),
      `${o.nom} n'est pas posé à sa place du plan`);
  });
  assert.ok(f.includes(`scale:${D.APERCU.echelle}`), "l'aperçu se met à l'échelle de la table");
});

test("4 — ⛔ aucun faux magasin : zéro bouton dans l'aperçu, la seule lune en jeu", () => {
  const apercu = E.construireLaFicheV2({ mode: "apercu" });
  assert.equal(apercu.querySelectorAll("button").length, 0, "la maquette ne fait semblant d'aucun geste");
  const duBelt = D.ORGANES.filter(E.estDuBelt).length;
  assert.equal(apercu.querySelectorAll(".fiche-v2-organe").length, D.ORGANES.length - duBelt,
    "l'aperçu ne peint pas le tambour — le belt du builder est au-dessus");

  let ramene = 0;
  const live = E.construireLaFicheV2({ mode: "live", surLune: () => { ramene += 1; } });
  const boutons = live.querySelectorAll("button");
  assert.equal(boutons.length, 1, "en jeu, un seul geste : la lune");
  assert.equal(boutons[0].dataset.sorte, "lune");
  assert.equal(live.querySelectorAll(".fiche-v2-organe").length, D.ORGANES.length, "en jeu, la fiche entière");
  boutons[0].click();
  assert.equal(ramene, 1, "la lune ramène à l'ancien belt");
});

test("5 — 🚪 le hub porte ses quatre portes, et `List` dit son état", () => {
  const appels = [];
  const fiche = E.construireLeHubSheet({ vue: "fiche", surBouton: (id) => appels.push(id) });
  const portes = fiche.querySelectorAll(".fiche-v2-porte");
  assert.deepEqual(portes.map((p) => p.textContent), ["List", "Manage", "Live", "Export"]);
  assert.equal(fiche.querySelectorAll(".fiche-v2-apercu").length, 1, "la vue « fiche » montre l'aperçu");
  assert.equal(fiche.querySelector('[data-hub="liste"]').dataset.lit, "false");
  for (const p of portes) p.click();
  assert.deepEqual(appels, ["liste", "manage", "live", "export"]);

  const contenu = document.createElement("p");
  contenu.textContent = "le contenu d'avant";
  const liste = E.construireLeHubSheet({ vue: "liste", liste: contenu, surBouton: () => {} });
  assert.equal(liste.querySelectorAll(".fiche-v2-apercu").length, 0, "la liste REMPLACE l'aperçu");
  assert.ok(liste.querySelector(".fiche-v2-liste").textContent.includes("le contenu d'avant"),
    "la liste porte le contenu d'avant, tel quel");
  assert.equal(liste.querySelector('[data-hub="liste"]').dataset.lit, "true");
});

test("6 — 🎗️ en jeu, la coquille efface l'ancien belt par l'attribut, et la feuille le laisse agir", () => {
  const shell = fs.readFileSync(path.join(UI, "shell.mjs"), "utf8");
  const css = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
  assert.match(shell, /belt\.racine\.hidden = ficheEnJeu\(\);/, "le belt s'efface exactement quand la fiche le remplace");
  assert.match(css, /\.belt:not\(\[hidden\]\) \{ display: flex; \}/, "le `display` du belt cède à `[hidden]`");
  const blocBelt = css.match(/^\.belt \{([^}]*)\}/m);
  assert.ok(blocBelt && !/display\s*:/.test(blocBelt[1]),
    "⛔ un `display` sans condition sur `.belt` battrait le `[hidden]` : l'ancien belt resterait en jeu");
});

test("7 — 🌱 un personnage neuf s'ouvre sur l'aperçu, hors jeu", () => {
  const neuf = etatNeuf();
  assert.equal(neuf.sheetVue, "fiche");
  assert.equal(neuf.sheetLive, false);
});
