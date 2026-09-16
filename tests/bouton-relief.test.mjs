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
