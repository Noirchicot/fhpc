import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripComments } from "./source-scan.mjs";

const SHELL = stripComments(readFileSync(new URL("../ui/builder/shell.mjs", import.meta.url), "utf8"));

test("aucun message du NOYAU ne part tel quel à l'écran", () => {
  /* 🔴 Eric, 2026-08-26, capture à l'appui : en effaçant son nom pour le
     retaper, le joueur lisait en rouge, sur cinq lignes —
       « fhpc/doc: rename : le document ne valide pas contre `fh-char/1` —
         1 refus : — « document.name » : 0 caractère(s), au moins 1 attendu(s). »
     ⛔ C'est du français de DÉVELOPPEUR dans un écran que le joueur regarde,
     exactement ce qu'Eric avait fait retirer le 23/08 de l'écran R d'Équipement.
     Et ça coûtait cinq lignes, au moment précis où le joueur tape.

     ⭐ CE GARDE NE LIT PAS LE TEXTE AFFICHÉ, IL FERME LE TUYAU : tant que
     `error.message` ne peut pas atteindre `fieldErrors`, aucune reformulation
     du noyau ne peut ressortir à l'écran. */
  const fautes = [...SHELL.matchAll(/fieldErrors\s*=\s*\{[^}]*\}/g)]
    .map((m) => m[0].replace(/\s+/g, " "))
    .filter((bloc) => /error\.message|err\.message/.test(bloc));
  assert.deepEqual(fautes, [],
    "un message brut du noyau est reversé dans `fieldErrors` — il finira "
    + "affiché tel quel dans la carte du joueur");
});

test("le refus se lit sur la VALEUR, jamais sur les mots du noyau", () => {
  /* ⭐ Renifler « au moins 1 attendu » marcherait aujourd'hui et casserait à la
     première reformulation du noyau, SANS QUE RIEN NE LE DISE. La valeur, elle,
     dit tout : vide, ou trop longue — c'est la même donnée que le noyau a jugée. */
  const i = SHELL.indexOf("function motDuRefus");
  assert.ok(i > -1, "le traducteur doit exister");
  const corps = SHELL.slice(i, SHELL.indexOf("\n}", i));
  assert.match(corps, /valeur|nom/, "il examine la valeur soumise");
  assert.doesNotMatch(corps, /attendu|refus\s*:|fh-char/,
    "⛔ il ne doit renifler AUCUN mot du message du noyau");
  /* ⚠️ Et le repli ne recopie pas le brut : c'est par un repli « au pire on
     affiche l'erreur » que la fuite s'était installée. */
  assert.doesNotMatch(corps, /return\s+error\.message|return\s+`\$\{error/,
    "le repli doit être une phrase honnête, jamais le message brut");
});
