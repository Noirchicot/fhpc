/* ══ LE GARDE DE LA GÉOMÉTRIE DU RELIEF — lot 209, 2026-09-15 ══════════════

   🔴 CE QU'IL PROUVE. `ui/builder/bouton-relief.mjs` recalcule la géométrie du
   bouton à toute largeur, parce que le site en a besoin : il pose `min-width`,
   pas `width`, et HUIT libellés dépassent la place utile du gabarit moyen
   (mesuré au navigateur, police du site, 16/600, place utile 89) —
   `Build a character` 129,31 · `Turn tutorials off` 127,44 · `My characters`
   110,63 · `Export HTML` 100,57 · `Export JSON` 98,44 · `Open a file…` 97,14 ·
   `I understand` 96,64 · `Expert view` 90,16. Deux largeurs figées ne peuvent
   pas habiller ce site.

   ⭐ ET L'ÉPREUVE EST CELLE-CI, LA SEULE QUI VAILLE : le générateur doit
   reproduire À L'OCTET PRÈS les deux SVG d'origine, rangés en témoins sous
   `tests/fixtures/`. Les témoins font foi ; si le générateur s'en écarte d'un
   millième, c'est lui qui est faux. ⛔ Ne jamais régénérer un témoin pour
   faire passer ce test — ce serait effacer la référence pour sauver la copie.

   ⚠️ IL NE DIT RIEN DE L'INTÉGRATION. Aucun bouton ne porte ce dessin ; les
   arbitrages appartiennent à Eric. Ce garde protège la GÉOMÉTRIE, pas une
   décision. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { svg, P, anneau, C, H, HAUT, B, TALON, COURSE, LARGEUR_TUILE, SLICE, borderImage } from "../ui/builder/bouton-relief.mjs";

const temoin = (w) => fs.readFileSync(new URL(`./fixtures/bouton-relief-${w}x44.svg`, import.meta.url), "utf8");

test("🔴 LE GÉNÉRATEUR REPRODUIT LES DEUX SVG D'ORIGINE, À L'OCTET PRÈS", () => {
  for (const [w, octets] of [[77, 3542], [105, 3574]]) {
    const attendu = temoin(w);
    assert.equal(attendu.length, octets, `le témoin ${w} doit rester le fichier d'origine (${octets} o)`);
    assert.equal(svg(w), attendu,
      `la géométrie générée pour ${w} s'écarte du témoin — c'est le GÉNÉRATEUR qui est faux, ` +
      "⛔ ne pas régénérer le témoin pour faire taire ce garde");
  }
});

test("📏 LES COTES NE S'ÉTIRENT PAS AVEC LA LARGEUR — c'est la raison d'être du recalcul", () => {
  /* `Build a character` réclame 129,31 + 2 × 8 de marge : une largeur que le
     dessin livré ne couvre pas, et où un étirement se verrait le plus. */
  for (const w of [77, 105, 146, 200]) {
    const O = P(w, 0), I = P(w, B);
    assert.equal(O[0][0], C, `à ${w}, la coupe du haut-gauche reste ${C}`);
    assert.equal(O[1][0], w - C, `à ${w}, la coupe du haut-droit reste ${C}`);
    assert.equal(O[2][1], C, `à ${w}, la coupe verticale reste ${C}`);
    assert.equal(O[4][1], HAUT, `à ${w}, le dessus s'arrête à ${HAUT} — le talon occupe le reste`);
    assert.equal(I[0][1], B, `à ${w}, le biseau reste ${B}`);
    /* le sommet biseauté suit la diagonale : k = c + i × (√2 − 1) */
    assert.equal(+I[0][0].toFixed(6), +(C + B * (Math.SQRT2 - 1)).toFixed(6),
      `à ${w}, le sommet de la face suit la coupe à épaisseur constante`);
  }
});

test("🔴 LA BOÎTE RESTE 44, ET LE TALON EST DANS LES 44 — la cible tactile ne cède jamais", () => {
  assert.equal(H, 44, "la hauteur extérieure est la cible tactile `--touch`");
  assert.equal(HAUT + TALON, H, "le dessus plus le talon font la boîte, pas davantage");
  assert.equal(COURSE, 2, "la course de l'appui");
  for (const w of [77, 105, 146]) {
    const socle = P(w, 0, TALON);
    assert.equal(socle[4][1], H, `à ${w}, le socle finit à ${H} — le bouton ne dépasse pas sa boîte`);
    const presse = P(w, 0, COURSE);
    assert.equal(presse[0][1], COURSE, "pressé, le dessus descend de la course");
    assert.equal(presse[4][1], HAUT + COURSE, `pressé, le pied du dessus reste dans les ${H}`);
  }
});

test("⚔️ L'ANNEAU DU LISERÉ A DEUX CONTOURS ET GARDE SON ÉPAISSEUR DANS LES COINS", () => {
  /* ⛔ Une `border` sur un rectangle découpé perd son épaisseur aux angles :
     l'anneau se fait par DEUX octogones et `evenodd`, jamais par une bordure. */
  const a = anneau(105);
  assert.equal((a.match(/Z/g) || []).length, 2, "deux contours : l'extérieur et l'intérieur");
  const ext = P(105, 2), int = P(105, 3.4);

  /* sur un BORD DROIT, l'épaisseur est la différence des retraits */
  assert.equal(+(int[0][1] - ext[0][1]).toFixed(6), 1.4, "l'épaisseur nominale du liseré");

  /* 🔴 SUR UNE DIAGONALE, IL FAUT LA MESURER PERPENDICULAIREMENT — ⛔ et pas
     la distance entre les deux SOMMETS, qui vaut 1,515 et ne prouve rien :
     deux bords parallèles peuvent avoir des sommets plus écartés que leur
     écart réel. Ce garde a rougi sur cette confusion avant d'être juste.
     Le bord haut-gauche va de P7 = (i, C + i·r) à P0 = (C + i·r, i) : son
     vecteur est (d, −d), donc il reste à 45° quel que soit le retrait, et sa
     droite est x + y = C + i·√2. L'écart perpendiculaire entre deux retraits
     vaut alors (i2 − i1)·√2 / √2 = i2 − i1 — la MÊME valeur que sur un bord
     droit. C'est exactement ce qu'une bordure ne sait pas faire. */
  for (const [i, p] of [[2, ext[7]], [3.4, int[7]]]) {
    assert.equal(+(p[0] + p[1]).toFixed(6), +(C + i * Math.SQRT2).toFixed(6),
      "le bord diagonal au retrait " + i + " suit la droite x + y = C + i·√2");
  }
  const ecart = ((int[7][0] + int[7][1]) - (ext[7][0] + ext[7][1])) / Math.SQRT2;
  assert.ok(Math.abs(ecart - 1.4) < 1e-9,
    "l'épaisseur se conserve dans le coin coupé — mesurée " + ecart);
});

test("📐 LA TUILE `border-image` NE DÉFORME RIEN — les slices ne se recouvrent pas", () => {
  /* ⛔ Sous 2×C + 1, les découpes gauche et droite se chevaucheraient et le
     centre n'existerait plus : le navigateur abandonne alors la peinture. */
  assert.ok(LARGEUR_TUILE > 2 * C, `la tuile (${LARGEUR_TUILE}) doit laisser un centre au-delà de 2 × ${C}`);
  assert.equal(SLICE.haut, C);
  assert.equal(SLICE.gauche, C);
  assert.equal(SLICE.droite, C);
  /* 📏 la seule cote qui ne se devine pas : le coin bas porte la coupe DU
     DESSUS (qui finit à HAUT) ET le talon (qui court jusqu'à H). */
  assert.equal(SLICE.bas, H - (HAUT - C), "le bas doit inclure le talon — 12, pas 8");
  assert.equal(SLICE.bas, 12);

  /* le centre restant, dans les deux sens */
  assert.ok(LARGEUR_TUILE - SLICE.gauche - SLICE.droite > 0, "il reste un centre horizontal");
  assert.ok(H - SLICE.haut - SLICE.bas > 0, "il reste un centre vertical");

  /* 🔴 CHAQUE BORD DOIT ÊTRE UNIFORME DANS LA DIRECTION OÙ IL S'ÉTIRE, sinon
     l'étirement se verrait. Le bord haut est un dégradé VERTICAL : ses deux
     points de gradient partagent la même abscisse ? non — ils partagent la
     même ABSCISSE de milieu, donc x1 === x2, et c'est ça qu'on vérifie. */
  const s = svg(LARGEUR_TUILE);
  const f0 = /id="f0"[^>]*x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/.exec(s);
  assert.ok(f0, "le gradient du bord haut doit rester trouvable");
  assert.equal(f0[1], f0[3], "le bord HAUT s'étire en x : son dégradé doit être purement vertical");
  const f2 = /id="f2"[^>]*x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/.exec(s);
  assert.equal(f2[2], f2[4], "le bord DROIT s'étire en y : son dégradé doit être purement horizontal");
});

test("⚔️ LE `border-image` EST COMPLET — source, slice, width, style, couleur", () => {
  const d = borderImage();
  assert.equal(d.length, 5, "cinq déclarations : sans `border-style`, rien ne se peint");
  assert.match(d[0], /^border-image-source: url\("data:image\/svg\+xml,%3Csvg/);
  assert.match(d[1], /fill$/, "sans `fill`, le CENTRE reste vide — la face disparaîtrait");
  assert.ok(!/base64/.test(d[0]), "le SVG reste en clair : lisible dans la feuille, et compresse mieux");
  /* le data-URI doit être réellement décodable, et redonner la tuile */
  const uri = /url\("([^"]+)"\)/.exec(d[0])[1];
  assert.equal(decodeURIComponent(uri.slice("data:image/svg+xml,".length)), svg(LARGEUR_TUILE));
});
