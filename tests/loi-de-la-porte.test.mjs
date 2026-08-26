import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripComments } from "./source-scan.mjs";

const PARCOURS = stripComments(
  readFileSync(new URL("../ui/builder/parcours-ecrans.mjs", import.meta.url), "utf8"));

test("une porte ne montre sa RÉSOLUTION que si l'item est confirmé", () => {
  /* 🔴 Eric, 2026-08-27, en deux lignes : *« condition remplie → voyant vert /
     texte de RÉSOLUTION »* · *« condition non remplie → voyant vide / texte de
     PROPOSITION »*.

     ⛔ LE DÉFAUT QUI A FAIT ÉCRIRE CETTE LOI : les portes annonçaient « High
     Elf » et « spent » pendant que LES VOYANTS À LEUR GAUCHE ÉTAIENT VIDES.
     Deux signaux contradictoires sur la même ligne, et c'est la capture qui l'a
     dit — aucun test ne pouvait le voir, puisque chacun des deux était juste
     de son côté.

     🔴 LA CAUSE ÉTAIT UNE CONFUSION DE NOTIONS : l'écran d'appel sait ce qui est
     POSÉ (`answered >= expected`), le voyant dit ce qui est CONFIRMÉ (passé par
     son `Done`). **On peut poser un lignage sans valider son écran.**

     ⭐ CE GARDE TIENT LE PARTAGE DES RÔLES : quoi que l'appelant rende, seul
     `item.confirme` autorise la forme à deux lignes. */
  assert.match(PARCOURS, /item\.confirme\s*\?\s*libelleBrut/,
    "la résolution (le libellé riche) doit être conditionnée par `item.confirme`");
  assert.match(PARCOURS, /motDe\(libelleBrut\)/,
    "et tant qu'elle n'est pas confirmée, le libellé s'aplatit en proposition");
});

test("⚔️ ATTAQUE — rendre la résolution inconditionnelle fait rougir le garde", () => {
  /* Une loi qu'on ne voit jamais mordre ne protège rien. */
  const mute = PARCOURS.replace(/const libelle = item\.confirme \? libelleBrut[^;]*;/,
    "const libelle = libelleBrut;");
  assert.notEqual(mute, PARCOURS, "témoin : la mutation a bien mordu dans la source");
  assert.doesNotMatch(mute, /item\.confirme\s*\?\s*libelleBrut/,
    "et le garde ne trouverait plus la condition qu'il exige");
});
