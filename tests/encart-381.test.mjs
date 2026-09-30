/* ══ LOT 381 — L'ENCART DU MODE ÉDITION DU SAC TIENT À 375, SANS RIEN PERDRE ═══════════════════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 381 encart.md` (ARCHI 35, 30/09), tiré du relevé du lot 380 : à 375,
   l'encart débordait (387 pour 358) et sa DERNIÈRE ligne — ce qui ne s'efface ni ne se renomme — était coupée.
   ⚖️ Eric, 20/09, le contenu : *« légendes des 4 poignées, explication des couleurs, ce qui s'efface ce qui ne
   s'efface pas »*. ⛔ On ne coupe rien de ce qu'il a dicté ; on cherche ce qui est EN TROP, jamais un défilement.

   ⚠️ CE QUE CE FICHIER NE PEUT PAS FAIRE, ET IL LE DIT : Node n'a pas de mise en page. La garde est donc un BUDGET,
   en deux parts nommées :
     · la STRUCTURE est lue dans le code — le nombre de lignes de la liste (le DOM que l'écran construit), les
       écarts (les jetons de la feuille), les marges des `dd` (les règles de la feuille) ;
     · les hauteurs de TEXTE, qui dépendent des retours à la ligne, sont MESURÉES au banc (30/09, 375 × 812, le
       navigateur du Mac, v933) — une mesure datée, ⛔ pas une déduction.
   📏 Et le budget redonne les DEUX mesures du banc : 386,7 avant le lot, 350,7 après. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const feuille = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
const jetons = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");

const { construireLeSac } = await import("../ui/builder/sac-ecran.mjs");
const PLAN = await import("../ui/builder/sac-disposition.mjs");

/** La valeur d'un jeton d'écart (`--sp-N`), lue dans tokens.css. */
const sp = (n) => Number(new RegExp(`--sp-${n}:\\s*([\\d.]+)px`).exec(jetons)[1]);
/** Le corps d'une règle de la feuille, par son sélecteur exact. */
const regle = (sel) => {
  const b = [...feuille.matchAll(/([^{}]*)\{([^{}]*)\}/g)].map(([, s, c]) => ({ s: s.trim().replace(/\s+/g, " "), c })).find((x) => x.s === sel);
  return b ? b.c : null;
};
/** Un écart écrit `var(--sp-N)` dans une propriété d'une règle. */
const ecart = (sel, prop) => {
  const m = new RegExp(`${prop}:\\s*var\\(--sp-(\\d+)\\)`).exec(regle(sel) || "");
  assert.ok(m, `${sel} { ${prop} } doit être un jeton d'écart`);
  return sp(m[1]);
};

/* 📏 LES HAUTEURS DE TEXTE, MESURÉES AU BANC — 30/09, 375 × 812, v933 : T1 = 10 px, interligne 1,35 → une ligne
   vaut 13,5 ; le titre (T2) 16,2 ; chaque `dd` selon ses retours à la ligne. ⚠️ Si Eric change un mot de l'encart,
   ces mesures se refont au banc — c'est une mesure, pas une règle. */
const MESURE_375 = {
  titre: 16.2,
  ligneDeLaListe: 24,                 // un signe (--sp-24) sur une ligne de texte : la ligne vaut le signe
  deux: { dt: [13.5, 13.5, 13.5], dd: [27, 40.5, 27] },
  figees: { dt: [13.5], dd: [27] },
  fige: 27
};

function budget({ lignesDeListe, margeFinale }) {
  const gE = ecart(".sac-encart", "gap");
  const gL = ecart(".sac-notice-liste", "gap");
  const gD = ecart(".sac-encart-deux, .sac-encart-figees", "gap");
  const mDD = Number(/margin:\s*0 0 var\(--sp-(\d+)\)/.exec(regle(".sac-encart-deux dd, .sac-encart-figees dd"))[1]);
  const liste = lignesDeListe * MESURE_375.ligneDeLaListe + (lignesDeListe - 1) * gL;
  const dl = ({ dt, dd }) => {
    const enfants = dt.length + dd.length;
    const marges = dd.length * sp(mDD) - (margeFinale ? 0 : sp(mDD));
    return [...dt, ...dd].reduce((a, b) => a + b, 0) + (enfants - 1) * gD + marges;
  };
  const blocs = [MESURE_375.titre, liste, dl(MESURE_375.deux), dl(MESURE_375.figees), MESURE_375.fige];
  return Math.round((blocs.reduce((a, b) => a + b, 0) + (blocs.length - 1) * gE) * 10) / 10;
}

test("E1 — 📏 À 375, L'ENCART TIENT DANS SA BOÎTE, SA DERNIÈRE LIGNE COMPRISE", () => {
  const boite = PLAN.ORGANES.find((o) => o.nom === "ENCART").h;
  assert.equal(boite, 358, "la boîte de l'encart, au plan");
  /* la structure, lue dans le DOM que l'écran construit */
  const n = construireLeSac({ sections: [{ nom: "A" }, { nom: "B" }], section: 0, edition: true, objets: [], poids: {}, destinations: [] }).noeud;
  const lignesDeListe = n.querySelectorAll(".sac-notice-liste li").length;
  /* et la marge sous le dernier `dd`, lue dans la feuille */
  const margeFinale = !/margin-block-end:\s*0/.test(regle(".sac-encart-deux dd:last-child, .sac-encart-figees dd:last-child") || "");
  /* 📏 TÉMOIN : le même budget, sur la structure d'AVANT le lot, redonne la mesure d'avant (386,7) — sinon le budget
     ne mesure pas ce qu'il prétend. */
  assert.equal(budget({ lignesDeListe: 4, margeFinale: true }), 386.7, "⚖️ le budget redonne la mesure du banc d'avant");
  const tient = budget({ lignesDeListe, margeFinale });
  assert.equal(tient, 350.7, "⭐ et celle d'après (350,7, mesurée au banc)");
  assert.ok(tient <= boite, `⛔ l'encart déborde : ${tient} pour ${boite}`);
});

test("E2 — ✂️ RIEN N'EST PERDU : les quatre poignées ont leur légende, `←` et `→` la partagent, dans l'ordre de leur pose", () => {
  const n = construireLeSac({ sections: [{ nom: "A" }, { nom: "B" }], section: 0, edition: true, objets: [], poids: {}, destinations: [] }).noeud;
  const lignes = [...n.querySelectorAll(".sac-notice-liste li")].map((li) => ({
    signes: [...li.querySelectorAll(".sac-notice-signe")].map((s) => `${s.dataset.signe}:${s.textContent}`),
    quoi: li.querySelector(".sac-notice-quoi").textContent
  }));
  assert.deepEqual(lignes, [
    { signes: ["editer:/"], quoi: "Rename it: type to replace the name, or tap in it to fix a letter." },
    { signes: ["effacer:×"], quoi: "Delete it once it is empty. Five sections or fewer: clears the name." },
    { signes: ["reculer:←", "avancer:→"], quoi: "Move it one place left… or one place right." }
  ], "⭐ les mots d'avant, joints — ⛔ aucun perdu");
  /* et le reste de l'encart est là, bloc par bloc */
  assert.equal(n.querySelectorAll(".sac-encart-deux dt").length, 3, "les trois créations");
  assert.ok(n.querySelector(".sac-encart-fige"), "la dernière ligne : ce qui ne s'efface ni ne se renomme");
  /* le texte commence au même x sur les trois lignes : une seule colonne de signes, large de deux */
  assert.match(regle(".sac-notice-liste li") || "", /grid-template-columns:\s*calc\(var\(--sp-24\) \* 2 \+ var\(--sp-2\)\) 1fr;/);
  assert.match(regle(".sac-notice-signes") || "", /gap:\s*var\(--sp-2\)/);
});
