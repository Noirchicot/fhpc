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

  assert.match(TOKENS, /--bouton-bombage:\s*linear-gradient\(to bottom/);

  const faces = [...CLEAN_SHELL.matchAll(/([^{}]+::after[^{}]*)\{([^{}]*background-image:\s*var\(--bouton-bombage\)[^{}]*)\}/g)];
  /* 🔴 UNE SEULE FAMILLE DEPUIS LE 16/09 — Eric : *« 2 oui une seule apparence
     partout »*. Ce garde attendait DEUX faces, parce que le chapitre Équipement
     portait une copie du patron ; elle est retirée, ses six sélecteurs sont
     entrés dans le patron. ⛔ « une seule » est PLUS strict que « deux » : une
     copie qui reparaîtrait ferait rougir ce garde, alors que l'ancienne
     écriture l'aurait accueillie sans rien dire. */
  assert.equal(faces.length, 1,
    "une seule famille porte la face bombée — un second bloc serait un second " +
    "écrivain pour un seul dessin, et la première repeinture les ferait diverger");
  for (const [, selecteur, corps] of faces) {
    assert.ok(selecteur.split(",").every((branche) => /::after\s*$/.test(branche.trim())),
      "la face ne doit atteindre que les pseudo-éléments du patron");
    assert.match(corps, /inset:\s*var\(--bouton-biseau-epaisseur\)/);
    assert.equal((corps.match(/var\(--bouton-coupe\)/g) || []).length, 8,
      "l'octogone intérieur conserve les huit sommets du patron");
  }
});

test("l'ombre reste un filtre et la nuit reste une lueur blanche", () => {
  assert.match(TOKENS, /--bouton-ombre:\s*drop-shadow\([^;]*rgba\(0,0,0,/);
  assert.match(TOKENS, /prefers-color-scheme:\s*dark[\s\S]*--bouton-ombre:\s*drop-shadow\([^;]*rgba\(255,255,255,/);
  const pseudoBlocks = [...CLEAN_SHELL.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selecteur, corps]) => /::(?:before|after)/.test(selecteur)
      && /--bouton-(?:biseau|bombage)/.test(corps));
  for (const [, , corps] of pseudoBlocks) assert.doesNotMatch(corps, /box-shadow:/);
});
