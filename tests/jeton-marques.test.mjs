/* ══ LE JETON D'ÉQUIPEMENT ET SES QUATRE MARQUES ═══════════════════════════════

   🔴 CE GARDE EXISTE À CAUSE D'UNE SOIRÉE PRÉCISE — le 2026-09-17. La bande des
   marques valait 10 dans `shell.css` pendant que les marques en demandaient 12 :
   elles se recouvraient de 2 avec le nom. Personne ne rougissait, parce que la
   cote était écrite à DEUX endroits et qu'aucun dessin ne pouvait les départager.
   Eric l'a vu à l'œil, puis a demandé : *« y a-t-il un dessin et des cotes du
   token equipement quelque part ? »* — il n'y en avait pas.

   ⭐ IL Y EN A UN MAINTENANT, ET CE FICHIER EST SA CONTRE-PARTIE DANS LE DÉPÔT :
   `Plan-jeton/jeton_gen.py` (vault) produit `jeton_cotes.json` — recopié ici en
   fixture — et `jeton_figure.svg`, que l'artefact montre. Ce garde vérifie que
   `tokens.css` et `shell.css` disent LA MÊME CHOSE que le plan.
   ⛔ Il ne redécrit aucune cote : il les LIT des deux côtés et les compare. Une
   cote écrite ici serait une troisième source, donc une troisième divergence.

   📌 SA LIMITE, ET IL LA DIT : il compare des DÉCLARATIONS, pas des pixels. Que
   `--jeton-bande` vaille 14 ne prouve pas que le nom commence à 14 — c'est la
   page rendue qui le prouve, et elle a été regardée (NORMES §0). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(ICI, "..", "ui", "builder");
const PLAN = JSON.parse(fs.readFileSync(path.join(ICI, "fixtures", "jeton-cotes.json"), "utf8"));
const tokens = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");
const feuille = fs.readFileSync(path.join(UI, "shell.css"), "utf8");

/** la valeur d'un jeton de `tokens.css`, en px — la PREMIÈRE déclaration, celle
 *  du thème clair ; les thèmes ne redéclarent que des couleurs. */
function px(nom) {
  const m = new RegExp(`--${nom}:\\s*(-?[\\d.]+)px`).exec(tokens);
  assert.ok(m, `\`--${nom}\` manque à tokens.css`);
  return Number(m[1]);
}
/** le corps d'une règle de `shell.css`, sélecteur donné tel qu'il est écrit. */
function regle(selecteur) {
  const i = feuille.indexOf(selecteur + " {");
  assert.ok(i >= 0, `la règle \`${selecteur}\` manque à shell.css`);
  return feuille.slice(i, feuille.indexOf("}", i));
}
const marque = (nom) => PLAN.marques.find((m) => m.nom === nom);

test("1 — le plan est cohérent avec lui-même : les cotes se déduisent, elles ne se posent pas", () => {
  assert.equal(PLAN.interieur.l, PLAN.tuile.l - 2 * PLAN.lisere, "83 = 87 − 2 × 2");
  assert.equal(PLAN.interieur.h, PLAN.tuile.h - 2 * PLAN.lisere, "44 = 48 − 2 × 2");
  assert.equal(PLAN.bande, PLAN.garde + PLAN.marque, "la bande = la garde + la marque");
  assert.equal(PLAN.nom.h, PLAN.nom.lignes * PLAN.nom.interligne, "trois lignes de 10");
  assert.equal(PLAN.nom.y + PLAN.nom.h, PLAN.interieur.h,
    "⭐ LA COTE QUI A TOUT DÉCIDÉ : 14 + 30 = 44, le nom finit EXACTEMENT au bord");
  assert.equal(marque("DISQUE").l, PLAN.marque - 2 * PLAN.encre,
    "« le attuned remplit le transparent » : 12 − 2 × 2 = 8, au blg près");
  for (const m of PLAN.marques) {
    assert.ok(m.y >= PLAN.garde && m.y + m.h <= PLAN.bande, `${m.nom} tient dans la bande`);
    assert.ok(m.x >= 0 && m.x + m.l <= PLAN.interieur.l, `${m.nom} tient dans la largeur`);
    assert.ok(m.y + m.h <= PLAN.nom.y, `⛔ ${m.nom} ne descend pas dans le nom`);
  }
});

test("2 — `tokens.css` porte les cotes du plan, au chiffre près", () => {
  assert.equal(px("glisse-case"), PLAN.tuile.l);
  assert.equal(px("glisse-h"), PLAN.tuile.h);
  assert.equal(px("creneau-lisere-rempli"), PLAN.lisere);
  assert.equal(px("jeton-marque"), PLAN.marque, "la hauteur COMMUNE aux quatre marques");
  assert.equal(px("jeton-bande"), PLAN.bande, "là où le nom commence");
  assert.equal(px("sp-2"), PLAN.encre, "l'encre de l'anneau EST --sp-2 ; le plan ne l'invente pas");
  assert.equal(px("t1"), PLAN.nom.interligne, "l'interligne du nom est sa taille : 3 × 10 = 30");
});

test("3 — `shell.css` pose la bande, et le nom commence dessous", () => {
  assert.match(regle('.gear-emplacement[data-occupe]'), /padding-top:\s*var\(--jeton-bande\)/,
    "⛔ jamais un calc recopié : la bande a UN nom, et quatre organes le lisent");
  const nom = regle(".gear-objet");
  assert.match(nom, /line-height:\s*1\b/,
    "⭐ l'interligne paie la bande : à 1.1 les trois lignes débordent de 3");
  assert.match(nom, new RegExp(`-webkit-line-clamp:\\s*${PLAN.nom.lignes}`),
    "les trois lignes d'Eric (16/09) tiennent toujours");
  /* ⛔ ET LE COLLECTEUR N'A PAS DE BANDE — « il n'y a pas de token dans le
     collecteur, juste le nom » : son mot ne descend pas de 4 pour rien. */
  assert.doesNotMatch(regle('.gear-collecteur[data-occupe]'), /var\(--jeton-bande\)/);
});

test("4 — les quatre marques sont dessinées aux cotes du plan", () => {
  const anneau = regle('.gear-voyant[data-voyant="equipe"]');
  assert.match(anneau, /width:\s*var\(--jeton-marque\);\s*height:\s*var\(--jeton-marque\)/);
  assert.match(anneau, /box-shadow:\s*inset 0 0 0 var\(--sp-2\) var\(--text\)/,
    "« un cercle NOIR (pas vert) » — l'encre du thème, jamais --positive");
  assert.doesNotMatch(anneau, /background(-color)?:/,
    "⛔ « centre rond transparent » — Eric s'est repris deux fois pour ce mot");

  const disque = regle('.gear-voyant[data-voyant="harmonise"]');
  assert.match(disque, /background:\s*var\(--magie\)/, "« le rond violet pour attuned »");
  assert.match(disque, /border-radius:\s*50%/);
  assert.ok(!feuille.includes('.gear-voyant[data-voyant="harmonise"]::before'),
    "⛔ ET LE CŒUR EST MORT : « on lâche le cœur ». Un ::before qui le redessine serait le survivant");

  const verrou = regle('.gear-voyant[data-voyant="verrou"]');
  assert.match(verrou, /width:\s*calc\(var\(--sp-8\) \+ var\(--sp-2\)\);\s*height:\s*var\(--sp-8\)/,
    `le corps du verrou d'Eric : ${marque("VERROU").cran}`);

  const qte = regle(".gear-voyants .gear-qte");
  assert.match(qte, /height:\s*var\(--jeton-marque\)/, "la quantité fait la hauteur des trois autres");
  assert.match(qte, /font-size:\s*var\(--t0\)/, "« un x99 en t0 »");
  assert.match(qte, /border:\s*1px solid var\(--text\)/, "« encadrée »");
});

test("5 — la fixture est la COPIE du plan, pas une seconde table", () => {
  /* ⚔️ Le jour où quelqu'un corrige une cote ici plutôt que dans le générateur,
     les deux divergent en silence — c'est exactement ce qui est arrivé au croquis
     de R (`ARM/HANDS` avec S a survécu deux jours dans l'artefact). Le plan porte
     donc sa provenance, et ce garde la vérifie. */
  assert.deepEqual(Object.keys(PLAN).sort(),
    ["bande", "encre", "garde", "interieur", "lisere", "marque", "marques", "nom", "tuile"],
    "la forme de la table du générateur — un champ de plus ici serait une invention locale");
  assert.equal(PLAN.marques.length, 4, "quatre marques, pas une de plus (Eric, 17/09)");
  assert.deepEqual(PLAN.marques.map((m) => m.dit), ["locked", "qty > 1", "equipped", "attuned"]);
});
