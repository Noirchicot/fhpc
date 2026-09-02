import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const TOKENS = fs.readFileSync(new URL("../ui/builder/tokens.css", import.meta.url), "utf8");
const SHELL = fs.readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8");
const CLEAN_SHELL = SHELL.replace(/\/\*[\s\S]*?\*\//g, "");

test("le patron commun porte deux octogones : arête complète puis face en retrait", () => {
  assert.match(TOKENS, /--bouton-biseau-epaisseur:\s*1\.5px/);
  assert.match(TOKENS, /--bouton-bombage:\s*linear-gradient\(to bottom/);

  const faces = [...CLEAN_SHELL.matchAll(/([^{}]+::after[^{}]*)\{([^{}]*background-image:\s*var\(--bouton-bombage\)[^{}]*)\}/g)];
  assert.equal(faces.length, 2, "les deux familles du patron partagent la même face bombée");
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
