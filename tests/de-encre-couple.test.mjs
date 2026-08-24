/* ══ LE COUPLE DE L'ENCRE DU DÉ ═══════════════════════════════════════════

   CE QUE CE GARDE PROTÈGE, ET QUE RIEN D'AUTRE NE VERRAIT :

   Le chiffre d'un dé est peint DEUX FOIS, de part et d'autre d'une frontière
   que le CSS ne traverse pas :

     · en CSS       `shell.css` → `color: var(--de-encre)`  (le chiffre posé
                    en HTML sur la face d'un dé statique) ;
     · en WebGL     `dice3d.mjs` → la table de matériaux, `gold.num` et
                    `crit.num` (le chiffre cuit dans la texture du dé 3D).

   ⭐ LA TABLE GL NE PEUT PAS LIRE `var(--de-encre)`, ET CE N'EST PAS UN
   OUBLI : `dice3d.mjs` peint dans un contexte `getContext("webgl")`, où les
   variables CSS n'existent tout simplement pas. La duplication est donc
   NÉCESSAIRE — elle ne se corrige pas, elle se surveille.

   🔴 LE DÉFAUT QU'IL ATTRAPE : quelqu'un ajuste l'encre du dé d'un côté et
   l'autre reste. Rien ne rougit, aucune coquille, aucun test — et le joueur
   voit deux chiffres de teintes différentes selon que son navigateur a WebGL
   ou non. Le repli statique et le dé 3D cesseraient d'être le même objet.

   ⛔ ET CE N'EST PAS UN GARDE « CHERCHE UN DOUBLON ». Trois formes de ce
   garde-là ont été essayées le 2026-08-24 et ont échoué de la même façon :

     · toute couleur égale à un jeton .......... 15 faux positifs, 0 vrai
     · les cotes à domicile unique (87/48) ..... faux, `48px` est aussi
                                                 `--roue-cran-h`
     · un jeton redéclaré ailleurs ............. faux, `--bp-hint: narrow`
                                                 est le mécanisme du seuil

   ⭐ LA RAISON, ET ELLE VAUT POUR TOUT GARDE FUTUR ICI : deux jetons peuvent
   partager une VALEUR, jamais un SENS. La maison partage ses valeurs à
   dessein — un garde qui cherche une ressemblance de nombre criera toujours
   au loup. Celui-ci ne cherche rien : il VÉRIFIE UNE PROMESSE déclarée
   ci-dessous. Casser le couple exprès reste possible — il faut alors éditer
   la déclaration, et c'est précisément le geste qu'on veut rendre visible.

   📌 Écrit par le siège Design le 2026-08-24, sur une idée d'ARCHI 26. La
   norme des organes est au vault : `FH-WEB/FHPC/FHPC norme des organes.md`. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (p) => readFileSync(join(RACINE, p), "utf8");
const sansCommentaires = (t) => t.replace(/\/\*[\s\S]*?\*\//g, " ");

/* ══ LA DÉCLARATION — le couple, et sa raison ═════════════════════════════
   Un matériau de dé qui doit porter EXACTEMENT la valeur d'un jeton CSS.
   Ajouter une ligne ici, c'est promettre ; en retirer une, c'est délier. */
const COUPLE = [
  { jeton: "--de-encre", materiau: "gold", champ: "num",
    raison: "le chiffre du dé d'or, peint en GL, doit égaler celui du repli CSS" },
  { jeton: "--de-encre", materiau: "crit", champ: "num",
    raison: "le dé de réussite critique porte la même encre que l'or" },
];

/* ── lecture des deux côtés ─────────────────────────────────────────────── */
function jetonCSS(nom) {
  const css = sansCommentaires(lire("ui/builder/tokens.css"));
  const m = css.match(new RegExp(`${nom}\\s*:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
  return m ? m[1].toLowerCase() : null;
}

function champMateriau(materiau, champ) {
  const js = sansCommentaires(lire("ui/builder/dice3d.mjs"));
  const bloc = js.match(new RegExp(`\\b${materiau}\\s*:\\s*\\{([^}]*)\\}`));
  if (!bloc) return null;
  const m = bloc[1].match(new RegExp(`${champ}\\s*:\\s*"(#[0-9a-fA-F]{3,8})"`));
  return m ? m[1].toLowerCase() : null;
}

/* ══ 1 — LA PRÉMISSE : la frontière existe vraiment ═══════════════════════
   Si `dice3d` cessait un jour de peindre en WebGL, la duplication n'aurait
   plus de raison d'être et ce garde deviendrait un mensonge poli. On vérifie
   donc la RAISON, pas seulement le fait. */
test("1 — le dé est bien peint en WebGL, donc il ne peut pas lire une variable CSS", () => {
  const js = lire("ui/builder/dice3d.mjs");
  assert.ok(/getContext\(\s*["']webgl/.test(js),
    "dice3d.mjs ne demande plus de contexte WebGL : la duplication de l'encre n'a plus " +
    "de justification, et ce garde doit être revu plutôt que satisfait.");
});

/* ══ 2 — LE CÔTÉ CSS EXISTE ET EST LU ═════════════════════════════════════ */
test("2 — `--de-encre` est déclaré, et quelqu'un le lit", () => {
  assert.ok(jetonCSS("--de-encre"),
    "`--de-encre` a disparu de tokens.css : le couple n'a plus de côté CSS.");
  const shell = sansCommentaires(lire("ui/builder/shell.css"));
  assert.ok(/var\(\s*--de-encre\s*\)/.test(shell),
    "plus personne ne lit `--de-encre` : soit le chiffre statique a changé d'encre, " +
    "soit le jeton est devenu mort. Dans les deux cas le couple est à revoir.");
});

/* ══ 3 — LE COUPLE TIENT, dans les deux sens ══════════════════════════════ */
for (const { jeton, materiau, champ, raison } of COUPLE) {
  test(`3 — ${materiau}.${champ} porte encore ${jeton}`, () => {
    const cote = jetonCSS(jeton);
    const gl = champMateriau(materiau, champ);
    assert.ok(gl,
      `le matériau « ${materiau} » ou son champ « ${champ} » n'existe plus dans ` +
      `dice3d.mjs. Si le dé a changé de nom, la déclaration de COUPLE doit suivre.`);
    assert.equal(gl, cote,
      `LE COUPLE A DÉRIVÉ.\n` +
      `  ${jeton} (tokens.css) vaut ${cote}\n` +
      `  ${materiau}.${champ} (dice3d.mjs) vaut ${gl}\n` +
      `  raison du lien : ${raison}\n` +
      `  ⛔ Le CSS ne peut pas atteindre une table WebGL : les deux valeurs se ` +
      `tiennent à la main, ou le joueur voit deux chiffres différents selon que son ` +
      `navigateur a WebGL ou non.`);
  });
}
