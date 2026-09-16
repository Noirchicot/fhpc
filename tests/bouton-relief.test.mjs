import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const TOKENS = fs.readFileSync(new URL("../ui/builder/tokens.css", import.meta.url), "utf8");
const SHELL = fs.readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8");
const CLEAN_SHELL = SHELL.replace(/\/\*[\s\S]*?\*\//g, "");
const CLEAN_TOKENS = TOKENS.replace(/\/\*[\s\S]*?\*\//g, "");

/* La règle du patron : le corps, puis la face. On les prend par un marqueur que
   seule cette règle porte, jamais par la liste de ses membres — elle change. */
const regle = (marqueur, pseudo) => {
  const re = new RegExp("([^{}]+" + pseudo + "[^{}]*)\\{([^{}]*" + marqueur.replace(/[-()]/g, "\\$&") + "[^{}]*)\\}", "g");
  return [...CLEAN_SHELL.matchAll(re)];
};

/* ══════════════════════════════════════════════════════════════════════════
   🔴 LE PATRON DU BOUTON — DEUX ÉTAGES, ET CE SONT TOUJOURS LES DEUX MÊMES
   ══════════════════════════════════════════════════════════════════════════

   ⚖️ CE FICHIER A CHANGÉ D'OBJET TROIS FOIS EN UN JOUR, ET JAMAIS DE SÉVÉRITÉ.
   Le 02/09 il tenait DEUX OCTOGONES PEINTS (arête complète, face en retrait) ;
   le 16/09 au matin, LA TUILE `border-image` et l'ANNEAU découpé du lot 209 ;
   le 16/09 au soir, ceci — Eric a retiré l'octogone en regardant le rendu :
     *« essaie un bouton rectangulaire angles légèrement arrondis. un peu de
     relief. le liseré à 2 blg du bord »*, puis, devant six essais posés sur les
     deux fonds : *« léger, liseré à 2, est celui qui me convient le mieux, on
     garde celui-ci. donc tous les boutons standards passent à ce format »*.

   ⭐ CE QU'IL A TOUJOURS TENU, ET QUI EST LA SEULE CHOSE QUI COMPTE : le patron
   a DEUX étages, ils portent la MÊME liste de membres, le corps donne la
   hauteur du dessin dans la cible, et la face porte la couleur de RÔLE — rien
   d'autre au monde ne la porte.
   ⛔ Un garde qui figerait le DESSIN aurait rougi trois fois en un jour pour
   rien. Celui-ci n'a rougi que quand une propriété du patron manquait. */

test("le patron porte deux étages : un corps qui donne la matière, une face qui porte le rôle", () => {
  const corps = regle("var(--bouton-corps)", "::before");
  const faces = regle("var(--bouton-lisere-epaisseur)", "::after");
  assert.equal(corps.length, 1,
    "une seule famille porte le corps — un second bloc serait un second écrivain " +
    "pour un seul dessin, et la première repeinture les ferait diverger");
  assert.equal(faces.length, 1, "à ce corps sa face, et une seule");

  const [, , cCorps] = corps[0];
  /* 📐 LA HAUTEUR DU DESSIN NE VIENT QUE D'ICI — 40 dans une cible de 44. Eric,
     16/09 au soir : *« les dimensions actées des boutons standards petit large
     restent les mêmes »* : le changement de forme ne déplace aucune cote. */
  assert.match(cCorps, /inset:\s*var\(--bouton-retrait-v\)\s+0/,
    "le corps fait 40 dans une cible de 44 — c'est ce retrait qui le donne, et lui seul");
  assert.match(cCorps, /border-radius:\s*var\(--bouton-rayon\)/, "le corps porte le rayon de la famille");
  assert.match(cCorps, /background:\s*var\(--bouton-corps\)/, "la matière vient du jeton, pas d'un dégradé recopié");
  assert.match(cCorps, /box-shadow:\s*var\(--bouton-aretes\)/, "les deux arêtes d'un pixel font le relief");
  /* ⭐ CE QUE LE RECTANGLE A RENDU POSSIBLE, ET QUI ÉTAIT INTERDIT DEPUIS LE
     26/08 : sans découpe, un `box-shadow` n'est plus rogné. ⛔ Remettre un
     `clip-path` ici éteindrait les arêtes sans qu'aucune couleur ne change. */
  assert.doesNotMatch(cCorps, /clip-path:/, "⛔ une découpe rognerait les ombres internes qui FONT le relief");
  assert.doesNotMatch(cCorps, /border-image/, "la tuile est morte avec l'octogone — le corps est peint, pas tramé");

  const [, , cFace] = faces[0];
  assert.match(cFace, /border:\s*var\(--bouton-lisere-epaisseur\)\s+solid\s+var\(--bouton-fond\)/,
    "c'est `--bouton-fond` qui colore le liseré — et lui seul, depuis le recâblage du 209");
  /* 📐 LES DEUX COTES DU LISERÉ SONT DÉRIVÉES. ⛔ Les écrire en littéral (4px,
     2px) les décrocherait du corps le jour où le rayon ou le retrait bouge. */
  assert.match(cFace, /inset:\s*calc\(var\(--bouton-retrait-v\)\s*\+\s*var\(--bouton-lisere-marge\)\)\s+var\(--bouton-lisere-marge\)/,
    "le liseré est à la marge du bord DU DESSIN — donc en plus du retrait sur l'axe vertical");
  assert.match(cFace, /border-radius:\s*calc\(var\(--bouton-rayon\)\s*-\s*var\(--bouton-lisere-marge\)\)/,
    "son rayon est celui du corps MOINS la marge — un contour parallèle ne garde pas le rayon extérieur");
});

test("les sept jetons du dessin existent, et la face ne bascule PAS avec le thème", () => {
  for (const j of ["rayon", "face", "encre", "corps", "aretes", "lisere-marge", "lisere-epaisseur"]) {
    assert.match(CLEAN_TOKENS, new RegExp("--bouton-" + j + ":"), `\`--bouton-${j}\` doit être déclaré`);
  }
  /* 🔴 UNE SEULE FACE POUR LES DEUX FONDS — Eric : *« version sombre bien sur
     les 2 fonds »*. ⛔ Une jumelle dans le bloc sombre rendrait le bouton
     dépendant du thème, et c'est précisément ce qu'Eric a écarté : le bouton est
     un objet POSÉ sur l'écran, pas une surface DE l'écran. */
  const nuit = CLEAN_TOKENS.indexOf("@media (prefers-color-scheme: dark)");
  assert.ok(nuit > 0, "le bloc sombre existe");
  for (const j of ["face", "encre", "corps", "aretes", "rayon"]) {
    assert.doesNotMatch(CLEAN_TOKENS.slice(nuit), new RegExp("--bouton-" + j + ":"),
      `⛔ \`--bouton-${j}\` ne se redéclare pas la nuit — la face du bouton ne bascule pas`);
  }

  /* ⚠️ ET C'EST LA FACE UNIQUE QUI INTERDIT `--on-accent` À LA FAMILLE : ce
     jeton bascule (#ffffff le jour, #14120e la nuit) ; sur une face qui ne
     bascule pas, l'encre de nuit serait presque noire sur presque noir. */
  const famille = /([^{}]*\.gear-porte[^{}]*)\{([^{}]*filter:\s*var\(--bouton-ombre\)[^{}]*)\}/.exec(CLEAN_SHELL);
  assert.ok(famille, "la famille des boutons se reconnaît à son filtre d'ombre");
  assert.match(famille[2], /color:\s*var\(--bouton-encre\)/, "la famille prend l'encre fixe du bouton");
  assert.doesNotMatch(famille[2], /color:\s*var\(--on-accent\)/,
    "⛔ `--on-accent` bascule, la face non — le mot disparaîtrait la nuit");

  /* 📏 LES COTES NE BOUGENT PAS AVEC LA FORME — Eric, 16/09 au soir : *« les
     dimensions actées des boutons standards petit large restent les mêmes »*. */
  assert.match(CLEAN_TOKENS, /--bouton-petit:\s*77px/, "le petit reste 77");
  assert.match(CLEAN_TOKENS, /--bouton-moyen:\s*105px/, "le moyen reste 105");
  assert.match(CLEAN_TOKENS, /--bouton-hauteur:\s*40px/, "le dessin reste 40 dans une cible de 44");

  /* 🔴 LE DÉFAUT `transparent` EST CE QUI RETIRE SON LISERÉ AU BOUTON GRIS —
     acquis du 209, et il traverse le changement de forme intact. */
  assert.match(CLEAN_SHELL, /--bouton-fond:\s*transparent/,
    "le défaut transparent EST le recâblage — le gris n'a pas de liseré (Eric, 16/09)");
});

test("⛔ les quatre jetons de l'octogone sont retirés, pas seulement débranchés", () => {
  /* ⚖️ LA DEMANDE D'ARCHI 34, LE 16/09 : *« ne les laisse pas mourir en
     silence — un jeton retiré sans motif écrit revient six semaines plus
     tard »*. Le motif est écrit dans `tokens.css`, en archive datée ; ce garde
     tient l'autre moitié, qu'ils ne soient pas seulement débranchés.
     ⛔ Un jeton déclaré que plus personne ne lit est un piège : le prochain
     dessin le retrouve, le croit vivant, et rebâtit sur une forme abrogée. */
  for (const mort of ["--bouton-coupe", "--bouton-relief", "--bouton-anneau"]) {
    assert.doesNotMatch(CLEAN_TOKENS, new RegExp(mort + ":"),
      `${mort} appartient à l'octogone, qu'Eric a retiré le 16/09 — il ne se redéclare pas`);
    assert.ok(!CLEAN_SHELL.includes("var(" + mort + ")"), `${mort} ne doit plus être lu nulle part`);
  }
  /* ⛔ ET LA TUILE NE DOIT PLUS ÊTRE SERVIE : deux fichiers d'`assets/` et
     leurs deux témoins sont partis avec elle. */
  for (const f of ["../ui/builder/assets/bouton-relief-jour.svg", "../ui/builder/assets/bouton-relief-nuit.svg"]) {
    assert.equal(fs.existsSync(new URL(f, import.meta.url)), false, `${f} est mort avec la forme qu'il habillait`);
  }
});

test("l'ombre reste un filtre et la nuit reste une lueur blanche", () => {
  assert.match(TOKENS, /--bouton-ombre:\s*drop-shadow\([^;]*rgba\(0,0,0,/);
  assert.match(TOKENS, /prefers-color-scheme:\s*dark[\s\S]*--bouton-ombre:\s*drop-shadow\([^;]*rgba\(255,255,255,/);
  /* 🔴 ET L'OMBRE RESTE SUR LE BOUTON, PAS SUR SES PSEUDOS. C'est elle qui crée
     le contexte d'empilement où `z-index: -1` et `-2` tiennent sans fuir
     derrière la dalle — mesuré à la naissance du patron, et toujours vrai. */
  const famille = /([^{}]*\.gear-porte[^{}]*)\{([^{}]*filter:\s*var\(--bouton-ombre\)[^{}]*)\}/.exec(CLEAN_SHELL);
  assert.ok(famille, "le filtre vit sur le bouton lui-même");
});

test("⚔️ ATTAQUE — un liseré écrit en littéral au lieu d'être dérivé est nommé", () => {
  /* ⭐ CE GARDE SE PROUVE LUI-MÊME : on fabrique la faute qu'on prétend voir.
     Un `border-radius: 4px` sur la face rend EXACTEMENT comme la forme dérivée
     aujourd'hui — et se décroche en silence le jour où le rayon du bouton
     bouge. C'est la faute la plus probable, parce qu'elle ne se voit pas. */
  const faux = `.x::after{inset:4px 2px;border-radius:4px;border:var(--bouton-lisere-epaisseur) solid var(--bouton-fond)}`;
  assert.doesNotMatch(faux, /border-radius:\s*calc\(var\(--bouton-rayon\)/,
    "la faute fabriquée doit bien échouer au test que la vraie règle passe");
  assert.match(
    /([^{}]*::after[^{}]*)\{([^{}]*var\(--bouton-lisere-epaisseur\)[^{}]*)\}/.exec(CLEAN_SHELL)[2],
    /border-radius:\s*calc\(var\(--bouton-rayon\)/,
    "la vraie règle, elle, dérive son rayon");
});
