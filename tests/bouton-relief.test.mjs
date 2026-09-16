import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { B, C } from "../ui/builder/bouton-relief.mjs";

const TOKENS = fs.readFileSync(new URL("../ui/builder/tokens.css", import.meta.url), "utf8");
const SHELL = fs.readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8");
const CLEAN_SHELL = SHELL.replace(/\/\*[\s\S]*?\*\//g, "");

/* 🔴 CE GARDE A ÉTÉ ROUGE LE 16/09, ET IL AVAIT RAISON. Il exigeait
   `--bouton-biseau-epaisseur: 1.5px` en dur ; le lot 209 pose le rebord du
   dessin d'Eric, qui vaut 2. Sa LOI n'a pas changé — « le patron porte deux
   octogones : arête complète puis face en retrait » — seule son EXPRESSION
   est réécrite. ⛔ Et elle n'est pas desserrée : là où il figeait UN nombre,
   il exige maintenant que les deux sources du dessin soient D'ACCORD, ce qui
   est plus strict. La feuille et `bouton-relief.mjs` ne peuvent plus diverger.
   ⭐ Il gagne aussi la COUPE, qu'il ne regardait pas du tout. */
test("le patron commun porte deux octogones : arête complète puis face en retrait", () => {
  /* 📐 LES DEUX COTES DU DESSIN VIENNENT DE LA MÊME SOURCE — le générateur.
     Les recopier ici en littéral rendrait possible qu'une des deux bouge
     seule, et c'est exactement ce qu'on veut interdire. */
  const cote = (nom) => {
    const m = new RegExp("--" + nom + ":\\s*([\\d.]+)px").exec(TOKENS);
    assert.ok(m, `\`--${nom}\` doit rester déclarée dans tokens.css`);
    return Number(m[1]);
  };
  assert.equal(cote("bouton-biseau-epaisseur"), B,
    "le rebord de la feuille doit valoir celui du dessin (`B` dans bouton-relief.mjs) — " +
    "deux sources pour une cote, c'est une divergence qui attend son tour");
  assert.equal(cote("bouton-coupe"), C,
    "la coupe de la feuille doit valoir celle du dessin (`C` dans bouton-relief.mjs)");
  /* ⛔ ET LA VALEUR D'AVANT NE DOIT PAS REVENIR PAR LA PORTE DE DERRIÈRE :
     10 et 1,5 sont ANTÉRIEURS au relief (voir NORMES §6, corrigé le 16/09). */
  assert.notEqual(cote("bouton-coupe"), 10, "la coupe 10 est antérieure au dessin — elle ne revient pas");
  assert.notEqual(cote("bouton-biseau-epaisseur"), 1.5, "le rebord 1,5 est antérieur au dessin");

  /* 🔴 LE MÉDIUM A CHANGÉ LE 16/09, ET LA LOI RESTE. Le patron peignait deux
     octogones en CSS ; il porte maintenant le RELIEF d'Eric en `border-image`
     sur le corps, et l'ANNEAU du liseré sur la face. ⛔ Le garde ne s'est pas
     desserré en suivant : il exige désormais que les deux jetons du dessin
     existent, qu'une SEULE famille les porte, et que le corps n'ait plus de
     `clip-path` — l'octogone est DANS l'image, un clip ici la rognerait. */
  assert.match(TOKENS, /--bouton-relief:\s*url\(/, "la tuile du relief est un jeton");
  assert.match(TOKENS, /--bouton-anneau:\s*polygon\(evenodd,/, "l'anneau du liseré est un jeton");

  const corpsRegles = [...CLEAN_SHELL.matchAll(/([^{}]+::before[^{}]*)\{([^{}]*border-image-source:\s*var\(--bouton-relief\)[^{}]*)\}/g)];
  assert.equal(corpsRegles.length, 1,
    "une seule famille porte le relief — un second bloc serait un second écrivain " +
    "pour un seul dessin, et la première repeinture les ferait diverger");
  for (const [, , corps] of corpsRegles) {
    assert.match(corps, /border-image-slice:[^;]*fill/,
      "sans `fill`, le centre reste vide et la face du bouton disparaît");
    assert.match(corps, /border-style:\s*solid/, "sans `border-style`, rien ne se peint");
    assert.match(corps, /inset:\s*var\(--bouton-retrait-v\)\s+0/,
      "le corps fait 40 dans une cible de 44 — c'est ce retrait qui donne la hauteur");
    assert.doesNotMatch(corps, /clip-path:/,
      "⛔ l'octogone est DANS la tuile : un `clip-path` ici la rognerait");
  }

  const faces = [...CLEAN_SHELL.matchAll(/([^{}]+::after[^{}]*)\{([^{}]*clip-path:\s*var\(--bouton-anneau\)[^{}]*)\}/g)];
  assert.equal(faces.length, 1, "à ce corps son anneau, et un seul");
  for (const [, selecteur, corps] of faces) {
    assert.ok(selecteur.split(",").every((branche) => /::after\s*$/.test(branche.trim())),
      "l'anneau ne doit atteindre que les pseudo-éléments du patron");
    /* ⭐ L'ANNEAU PARTAGE EXACTEMENT LA BOÎTE DU CORPS — ses sommets sont
       dessinés dans le repère de la tuile (2 et 3,4 depuis le bord), donc un
       retrait supplémentaire le décalerait de son propre dessin. */
    assert.match(corps, /inset:\s*var\(--bouton-retrait-v\)\s+0/,
      "l'anneau est aligné sur le corps, pas en retrait de son biseau");
    assert.match(corps, /background:\s*var\(--bouton-fond\)/,
      "c'est `--bouton-fond` qui colore l'anneau — il ne peint plus le corps");
  }

  /* 🔴 ET LE DÉFAUT DE `--bouton-fond` EST `transparent` : c'est lui qui retire
     son liseré au bouton gris, sans qu'aucune des 24 déclarations bouge. */
  assert.match(CLEAN_SHELL, /--bouton-fond:\s*transparent/,
     "le défaut transparent EST le recâblage — le gris n'a pas de liseré (Eric, 16/09)");
});

test("l'ombre reste un filtre et la nuit reste une lueur blanche", () => {
  assert.match(TOKENS, /--bouton-ombre:\s*drop-shadow\([^;]*rgba\(0,0,0,/);
  assert.match(TOKENS, /prefers-color-scheme:\s*dark[\s\S]*--bouton-ombre:\s*drop-shadow\([^;]*rgba\(255,255,255,/);
  const pseudoBlocks = [...CLEAN_SHELL.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selecteur, corps]) => /::(?:before|after)/.test(selecteur)
      && /--bouton-(?:biseau|bombage)/.test(corps));
  for (const [, , corps] of pseudoBlocks) assert.doesNotMatch(corps, /box-shadow:/);
});

/* ══ 16/09 SOIR — LES DEUX TUILES LIVRÉES, GARDÉES À L'OCTET ══════════════
   Eric : « 3D moche », « ivoire pour nuit et terracotta pour jour ». Les tuiles ne
   sortent plus du générateur : elles sont LIVRÉES (ChatGPT, sur le prompt d'Eric,
   couleurs arrêtées) et collées telles quelles. Un témoin par tuile sous
   `tests/fixtures/` ; le jour lit l'une, la nuit l'autre ; les coupes du 9-zones
   suivent la géométrie de la tuile, pas l'inverse. */
test("les tuiles servies sont celles livrées — jour terracotta, nuit ivoire — et les coupes les contiennent", () => {
  const lire = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
  for (const t of ["jour", "nuit"]) {
    assert.equal(lire(`../ui/builder/assets/bouton-relief-${t}.svg`), lire(`./fixtures/bouton-relief-${t}.svg`),
      `bouton-relief-${t}.svg a dérivé de son témoin — la tuile est livrée, jamais retouchée`);
  }
  const jour = lire("../ui/builder/assets/bouton-relief-jour.svg");
  const m = /viewBox="0 0 (\d+) (\d+)"/.exec(jour);
  assert.ok(m, "la tuile déclare son viewBox");
  const [L, H] = [Number(m[1]), Number(m[2])];
  /* le jour sur `:root`, la nuit dans le bloc sombre — et pas l'inverse */
  /* ⛔ la RÈGLE, pas sa première mention : un commentaire de tokens.css cite le
     bloc sombre bien avant lui (ligne 683), et l'indexOf naïf s'y arrêtait */
  const nuitIdx = TOKENS.indexOf("@media (prefers-color-scheme: dark)");
  assert.ok(nuitIdx > 0, "le bloc sombre existe");
  assert.ok(TOKENS.slice(0, nuitIdx).includes('--bouton-relief: url("./assets/bouton-relief-jour.svg'), "le jour lit la terracotta");
  assert.ok(TOKENS.slice(nuitIdx).includes('--bouton-relief: url("./assets/bouton-relief-nuit.svg'), "la nuit lit l'ivoire");
  /* les coupes : le chanfrein va jusqu'à C + B(√2 − 1) = 8,828 — un coin de 8 le coupait */
  const s = /border-image-slice:\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+fill/.exec(CLEAN_SHELL);
  assert.ok(s, "les quatre coupes sont écrites");
  const [haut, droite, bas, gauche] = s.slice(1, 5).map(Number);
  const chanfrein = C + B * (Math.SQRT2 - 1);
  for (const c of [haut, droite, gauche]) assert.ok(c >= chanfrein, `une coupe de ${c} couperait le chanfrein (${chanfrein.toFixed(3)})`);
  assert.ok(bas >= chanfrein + 4, "le coin bas contient le chanfrein ET le talon de 4");
  assert.ok(L - gauche - droite > 0 && H - haut - bas > 0, "il reste un centre à étirer");
  assert.match(CLEAN_SHELL, new RegExp(`border-image-width:\\s*${haut}px\\s+${droite}px\\s+${bas}px\\s+${gauche}px`), "largeurs = coupes, en px");
  /* la nuit garde son halo blanc EN PREMIER, puis une ombre de contact */
  assert.match(TOKENS.slice(nuitIdx), /--bouton-ombre:\s*drop-shadow\(0 0 3px rgba\(255,255,255,[^)]*\)\)\s*drop-shadow\([^)]*rgba\(0,0,0,/);
});
