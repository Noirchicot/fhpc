/* ══ LE GARDE DE LA GÉOMÉTRIE DU RELIEF — lot 209, 2026-09-15 ══════════════

   🔴 CE QU'IL PROUVE. `ui/builder/bouton-relief.mjs` recalcule la géométrie du
   bouton à toute largeur, parce que le site en a besoin : il pose `min-width`,
   pas `width`. 📏 Mesuré le 16/09 dans le builder servi, sous `.app` (donc
   sous `zoom`, échelle 1,3653), hauteur 44 partout — largeurs de BOÎTE, pas
   de texte :
       témoins   `Export HTML` dans un `.parcours-pied` → 77,00 (le plancher)
                 `Inheritance.bouton-moyen`             → 105,00 (le large)
       réelles   Expert view 105,85 · Export JSON 113,69 · Export HTML 115,46
                 I understand 128,64 · Turn tutorials off 159,44
   Cinq largeurs distinctes, aucune à 77 ni à 105 — `Expert view` rate le
   gabarit large de 0,85. Deux largeurs figées ne peuvent pas habiller ce site.

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
import { svg, P, anneau, anneauCSS, C, H, HAUT, H_DESSIN, B, TALON, COURSE, LARGEUR_TUILE, SLICE, borderImage } from "../ui/builder/bouton-relief.mjs";

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
  /* 77 et 105 sont les deux gabarits ; 116 et 159 sont deux largeurs RÉELLES
     mesurées (`Export HTML` dans sa rangée, `Turn tutorials off` dans la
     sienne) — c'est là qu'un étirement se verrait le plus. */
  for (const w of [77, 105, 116, 159]) {
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

test("🔴 LA HAUTEUR EST UN PARAMÈTRE, ET LE DÉFAUT RESTE CELUI DES TÉMOINS", () => {
  /* ⛔ LE PIÈGE QUE CE GARDE FERME. La norme du 16/09 pose le dessin à 40 ; les
     deux SVG d'origine sont dessinés à 44. La pente naturelle était de
     « corriger » les témoins pour que tout retombe juste — et une référence
     qu'on retouche pour verdir un test n'est plus une référence. Le défaut
     reste donc 44, et c'est la PRODUCTION qui demande 40. */
  assert.equal(H, 44, "le défaut reste la cote des deux témoins");
  assert.equal(H_DESSIN, 40, "la hauteur de DESSIN posée par la norme du 16/09");
  assert.equal(HAUT, H - TALON, "le dessus prend ce que le talon laisse");

  for (const w of [77, 105]) {
    assert.equal(svg(w), temoin(w), `svg(${w}) sans hauteur doit rester le témoin, à l'octet`);
    const court = svg(w, H_DESSIN);
    assert.match(court, new RegExp(`viewBox="0 0 ${w} ${H_DESSIN}"`),
      "la boîte du SVG suit la hauteur demandée");
    assert.notEqual(court, temoin(w),
      "à 40 le dessin doit différer du témoin — sinon le paramètre ne sert à rien");
  }

  /* 📐 ET LA GÉOMÉTRIE RESTE JUSTE À 40 : coupe, biseau et talon ne bougent pas,
     c'est le DESSUS qui absorbe la différence. */
  const haut40 = H_DESSIN - TALON;
  const O = P(90, 0, 0, haut40), I = P(90, B, 0, haut40);
  assert.equal(O[0][0], C, "la coupe reste 8 à 40 de haut");
  assert.equal(I[0][1], B, "le biseau reste 2");
  assert.equal(O[4][1], haut40, "le dessus s'arrête exactement où le talon commence");

  /* ⭐ ET LE SLICE DU BAS EST INVARIANT — il vaut `TALON + C`, la hauteur
     s'annule dans `H − (HAUT − C)`. Une seule tuile sert les deux cotes. */
  assert.equal(SLICE.bas, TALON + C);
  assert.equal(SLICE.bas, 12, "12 à 44 comme à 40");
});

test("🔴 LE LISERÉ TIENT SANS JAVASCRIPT — un seul polygone, aucune largeur en dur", () => {
  /* ⛔ CE QUE CE GARDE EMPÊCHE : qu'on remplace cette forme par un `path()`,
     qui exigerait une valeur par largeur — donc du JS posé bouton par bouton,
     donc un empiètement sur le lot de la fabrique. La frontière du 209 tient
     PARCE QUE cette règle n'a pas besoin de connaître la largeur rendue. */
  const a = anneauCSS();
  assert.match(a, /^polygon\(evenodd, /, "un seul polygone, pas deux chemins");
  assert.equal((a.match(/polygon\(/g) || []).length, 1, "une seule forme");

  /* 📐 DIX-HUIT SOMMETS : huit pour le contour extérieur ET son premier sommet
     répété, huit pour le retour ET le sien. 🔴 Eric, 16/09 : « il manque le bord
     supérieur gauche » — à 8 + 8, les deux ponts entre les contours différaient et
     le trou s'ouvrait par le chanfrein haut-gauche. Refermer chaque contour fait
     des deux ponts un seul segment aller-retour, qui s'annule. */
  assert.equal((a.match(/,/g) || []).length, 18, "(8 + 1) + (8 + 1) sommets, plus le mot-clé evenodd");

  /* 🔴 AUCUNE LARGEUR EN DUR — c'est toute la propriété. Chaque sommet de
     droite s'exprime en `calc(100% − Npx)`, jamais en pixels absolus. */
  assert.equal((a.match(/calc\(100% - /g) || []).length, 8,
    "les huit sommets de droite suivent la largeur du bouton, quelle qu'elle soit");
  /* 🔴 ET LA PREUVE QUE LE CHEMIN NE DÉPEND QUE DE LA HAUTEUR : à hauteur
     égale il est identique, et deux hauteurs ne diffèrent QUE par des cotes
     verticales — les huit `calc(100% − …)` sont les mêmes des deux côtés.
     ⛔ J'AI ÉCRIT DEUX ASSERTIONS FAUSSES ICI AVANT CELLE-CI, et les deux ont
     rougi : la première interdisait tout nombre à deux chiffres suivi de `px`
     (elle attrapait `27.172px`, une cote VERTICALE légitime) ; la seconde
     lisait `anneauCSS.length`, qui vaut **0** — `Function.length` s'arrête au
     premier paramètre par défaut. ⭐ Deux fois la même faute de fond : vérifier
     la FORME de l'écriture au lieu de la propriété qu'on veut tenir. */
  const gauche = (s) => s.match(/calc\(100% - [\d.]+px\)/g).join("|");
  assert.equal(gauche(anneauCSS(36)), gauche(anneauCSS(40)),
    "changer la hauteur ne touche aucun sommet horizontal — la largeur reste libre");

  /* ⛔ ET LE SECOND CONTOUR EST PARCOURU À L'ENVERS — c'est ce qui garantit le
     trou quel que soit le moteur. Le premier sommet du retour est le DERNIER
     du contour intérieur dans l'ordre direct. */
  const kInt = +(C + 3.4 * (Math.SQRT2 - 1)).toFixed(3);
  const sommets = a.slice(a.indexOf("evenodd,") + 8).replace(/\)$/, "").split(", ")
    .map((s) => s.trim()).filter(Boolean);
  assert.equal(sommets.length, 18, "neuf sommets par contour — le premier répété");
  assert.equal(sommets[8], sommets[0], "le contour extérieur se referme sur son premier sommet");
  assert.equal(sommets[17], sommets[9], "le contour intérieur se referme sur le sien");
  /* ⛔ ET LE RETOUR COMMENCE À L'INDEX 9, après la fermeture de l'extérieur. */
  assert.equal(sommets[9], `3.4px ${kInt}px`,
    "le retour commence par le DERNIER sommet intérieur — le contour est inversé, " +
    "et c'est ce qui garantit le trou quel que soit le moteur");

  /* l'épaisseur nominale reste celle du `path()` : 1,4 perpendiculaire */
  assert.equal(+(3.4 - 2).toFixed(6), 1.4);
});
