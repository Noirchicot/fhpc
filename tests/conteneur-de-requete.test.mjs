/* ══ UNE REQUÊTE DE CONTENEUR NE VOIT JAMAIS SON PROPRE CONTENEUR — lot 116 ══

   📏 LE DÉFAUT, MESURÉ AU BANC LE 2026-09-02 (Chromium, v425, quatre fenêtres
   de 375 × 812 à 1024 × 1366) : la carte tirée de Destiny rendait DEUX colonnes
   dans un panneau de 375 blg — la colonne de texte tombait à ~40 blg, un mot
   par ligne, avec une barre de défilement horizontale. Identique à toutes les
   tailles, puisque le panneau vaut toujours 375 blg.

   🔴 LA CAUSE, dans `shell.css` depuis le 30/08 :

       .card-final-corps { container-type: inline-size; display: grid;
                           grid-template-columns: 1fr 1fr; }
       @container (max-width: 34em) {
         .card-final-corps { grid-template-columns: 1fr; }   ← jamais appliquée
       }

   Une règle `@container` interroge l'ANCÊTRE conteneur le plus proche de
   l'élément qu'elle cible — jamais l'élément lui-même. Écrite sur le
   conteneur, la règle « une colonne » n'avait aucun conteneur à interroger :
   elle ne s'est jamais appliquée, et rien ne le disait. Le commentaire
   au-dessus expliquait même pourquoi c'était la bonne forme.

   ⭐ CE QUE CE GARDE JUGE, ET C'EST TOUTE LA FAMILLE : dans chaque feuille de
   `ui/builder/`, pour chaque bloc `@container`, aucune règle intérieure ne
   doit porter EXACTEMENT le sélecteur d'une règle qui déclare
   `container-type`. Le jour où quelqu'un réécrit ce piège, la suite rougit
   avec le sélecteur fautif et le fichier.

   ⚠️ CE QU'IL NE JUGE PAS, dit plutôt que masqué : un sélecteur qui vise le
   conteneur par une AUTRE écriture (`div.card-final-corps`, `[class~=…]`).
   Comparer deux sélecteurs sans les résoudre serait deviner ; on compare des
   textes normalisés, et c'est un silence, jamais un cri. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FEUILLES = fs.readdirSync(path.join(ROOT, "ui/builder")).filter((f) => f.endsWith(".css"));

const sansCommentaires = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const normalise = (selecteur) => selecteur.replace(/\s+/g, " ").trim();

/** Les règles `sélecteur { corps }` d'un texte CSS PLAT (sans blocs `@`). */
function regles(texte) {
  const out = [];
  const motif = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = motif.exec(texte))) {
    for (const sel of m[1].split(",")) out.push({ selecteur: normalise(sel), corps: m[2] });
  }
  return out;
}

/** Les blocs `@container … { … }` d'une feuille, avec leur intérieur. */
function blocsContainer(texte) {
  const out = [];
  const motif = /@container[^{]*\{/g;
  let m;
  while ((m = motif.exec(texte))) {
    let profondeur = 0;
    let i = m.index + m[0].length - 1;
    for (; i < texte.length; i += 1) {
      if (texte[i] === "{") profondeur += 1;
      else if (texte[i] === "}") { profondeur -= 1; if (profondeur === 0) break; }
    }
    out.push({ entete: normalise(m[0]), interieur: texte.slice(m.index + m[0].length, i) });
  }
  return out;
}

/** LE JUGE : les règles d'un `@container` qui portent le sélecteur exact d'un
 *  conteneur déclaré dans la même feuille. */
export function requetesSurLeurConteneur(css) {
  const texte = sansCommentaires(css);
  const conteneurs = new Set(
    regles(texte.replace(/@container[^{]*\{[\s\S]*?\n\}/g, ""))
      .filter((r) => /container-type\s*:/.test(r.corps))
      .map((r) => r.selecteur)
  );
  const prises = [];
  for (const bloc of blocsContainer(texte)) {
    for (const r of regles(bloc.interieur)) {
      if (conteneurs.has(r.selecteur)) prises.push({ bloc: bloc.entete, selecteur: r.selecteur });
    }
  }
  return prises;
}

test("A — AUCUN `@container` D'`ui/builder/` NE VISE SON PROPRE CONTENEUR", () => {
  assert.ok(FEUILLES.length >= 4, `${FEUILLES.length} feuilles trouvées — la portée n'est pas vide`);
  const prises = [];
  for (const feuille of FEUILLES) {
    const css = fs.readFileSync(path.join(ROOT, "ui/builder", feuille), "utf8");
    for (const p of requetesSurLeurConteneur(css)) prises.push(`${feuille} › ${p.bloc} … } cible \`${p.selecteur}\`, qui EST le conteneur`);
  }
  assert.deepEqual(prises, [],
    "une règle @container vise l'élément qui porte container-type — elle ne s'appliquera jamais, en silence :\n  " + prises.join("\n  "));
});

test("A bis — ET LES CONTENEURS DE LA MAISON SONT BIEN VUS (le garde n'est pas vide)", () => {
  /* 📏 MESURÉ EN POSANT CE GARDE : `listes.css` et `shell.css` déclarent des
     conteneurs pour leurs unités `cqw`, et AUCUNE feuille ne porte plus de
     bloc `@container` — le seul qui existait était le fautif du 30/08, retiré
     par ce lot. Le garde A est donc vide aujourd'hui, et c'est voulu : il
     attend le prochain `@container`. Ce qu'on vérifie ici, c'est que le
     lecteur VOIT les conteneurs — un garde qui ne lirait rien serait vert
     pour toujours. */
  const css = fs.readFileSync(path.join(ROOT, "ui/builder/listes.css"), "utf8");
  const texte = sansCommentaires(css);
  const conteneurs = regles(texte.replace(/@container[^{]*\{[\s\S]*?\n\}/g, "")).filter((r) => /container-type\s*:/.test(r.corps));
  assert.ok(conteneurs.length >= 1, "listes.css déclare au moins un conteneur de requête — sinon ce garde ne mesure rien");
});

/* ══ §C — L'ATTAQUE ═══════════════════════════════════════════════════════ */

const VIOLATION_DU_30_08 = `
.card-final-corps {
  container-type: inline-size;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}
.card-final-carte { display: grid; }
@container (max-width: 34em) {
  .card-final-corps { grid-template-columns: minmax(0, 1fr); }
  .card-final-carte { max-height: 42vh; }
}
`;

test("C1 — LE GARDE VOIT LA VIOLATION DU 30/08", () => {
  assert.deepEqual(requetesSurLeurConteneur(VIOLATION_DU_30_08), [
    { bloc: "@container (max-width: 34em) {", selecteur: ".card-final-corps" }
  ]);
});

test("C2 — ET IL SE TAIT QUAND LA REQUÊTE VISE UN DESCENDANT", () => {
  const juste = `
.choix-glisse { container-type: inline-size; }
@container (max-width: 34em) {
  .choix-glisse .glisse-creneau { flex: 0 0 auto; }
  .choix-glisse > li { min-width: 0; }
}
`;
  assert.deepEqual(requetesSurLeurConteneur(juste), []);
});
