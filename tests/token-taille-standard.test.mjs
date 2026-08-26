import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8");
const sansCommentaires = CSS.replace(/\/\*[\s\S]*?\*\//g, "");

function reglesDe(css) {
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    out.push({ selecteur: m[1].trim().replace(/\s+/g, " "), corps: m[2] });
  }
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
   🔴 LA TAILLE STANDARD — Eric, 2026-08-26, en trois messages :
     · *« les +1/+2/+x sont des tokens »*
     · *« on va les appeler des BONUS TOKENS, taille standard »*
     · *« tous les tokens et leurs collecteurs, taille standard »*

   ⭐ CE GARDE EXISTE PARCE QUE J'AI CASSÉ EXACTEMENT ÇA, ET EN PRODUCTION.
   La v311 a déployé une règle qui donnait à chaque case du vivier
   `flex: 0 1 calc((100% - 2 gouttières) / 3)` avec `min-width: 0`. Mesuré sur
   le site, écran « Ability boosts » : les bonus tokens `+1` et `+2` faisaient
   **12 × 48 px** dans un vivier de 52. Eric l'a vu avant moi.
   ══════════════════════════════════════════════════════════════════════════ */

test("aucune case de vivier ne peut tomber sous son gabarit", () => {
  /* ⛔ LA MÉCANIQUE, PARCE QU'ELLE SE REPRÉSENTERA : le vivier n'a pas de
     largeur imposée — il se mesure sur son contenu, plafonné à trois colonnes.
     Une base en POURCENTAGE dans un conteneur qui se mesure sur son contenu
     est CIRCULAIRE (la case veut un tiers du vivier, le vivier veut la somme
     des cases) ; le navigateur tranche par le contenu, et comme ma base
     autorisait en plus de RÉTRÉCIR (`0 1 …`), la case tombait à 12 px.
     ⛔ CE GARDE NE VISE DONC PAS `min-width: 0`, QUI EST INNOCENT : il vit
     depuis toujours à côté de `flex: 0 0 var(--glisse-case)`, où il ne peut
     rien puisque la case n'a pas le droit de rétrécir. Viser le mauvais
     coupable aurait fait rougir une ligne juste — et laissé passer la faute.

     ⚠️ ET LA RÈGLE FAUSSE PASSAIT SIX MESURES JUSTES : Lineage à 360, 372,
     467, 900, 1100 et 1600 rendait `[3,3,3,3]` partout. Six largeurs, un seul
     témoin — un vivier PLEIN, dont les douze cases se soutiennent. Le cas qui
     casse est le vivier PRESQUE VIDE : deux cases, rien pour les tenir.
     ⭐ **Le nombre de mesures ne rachète pas un témoin unique.** */
  const fautes = [];
  for (const { selecteur, corps } of reglesDe(sansCommentaires)) {
    if (!/\.glisse-vivier\s*>\s*li\b/.test(selecteur)) continue;
    if (/flex(-basis)?\s*:[^;]*%/.test(corps)) fautes.push(`${selecteur} — une base en % est circulaire ici`);
    const flex = corps.match(/(^|;)\s*flex\s*:\s*([^;]+)/);
    if (flex && !/^0\s+0\b/.test(flex[2].trim())) {
      fautes.push(`${selecteur} — flex « ${flex[2].trim()} » : la case doit être 0 0 <gabarit>`);
    }
  }
  assert.deepEqual(fautes, [],
    "une case de vivier ne se dimensionne pas en pourcentage de son vivier, "
    + "et ne perd jamais son plancher : elle porte le gabarit, un point");
});

test("le gabarit du token et celui de son collecteur sont LE MÊME jeton de mesure", () => {
  /* 🔴 Eric : *« taille token = taille collecteur »* (Identity, 26/08), puis
     *« tous les tokens et leurs collecteurs, taille standard »*.
     ⭐ CE QUE CE GARDE VÉRIFIE N'EST PAS QUE DEUX NOMBRES SONT ÉGAUX — deux
     nombres égaux divergent au premier qui bouge. Il vérifie qu'il n'y a
     qu'UN nombre : les deux règles lisent la MÊME variable. */
  const regle = reglesDe(sansCommentaires).find((r) =>
    /\.glisse-vivier\s*>\s*li/.test(r.selecteur) && /\.glisse-creneau\b/.test(r.selecteur));
  assert.ok(regle,
    "la case du vivier et le collecteur doivent être habillés par UNE règle "
    + "qui les nomme tous deux — deux règles séparées sont deux cotes qui "
    + "divergeront, et personne ne verra le jour où elles l'auront fait");
  assert.match(regle.corps, /flex\s*:\s*0\s+0\s+var\(--glisse-case\)/,
    "et la cote est le jeton de mesure partagé, jamais un nombre recopié");
});
