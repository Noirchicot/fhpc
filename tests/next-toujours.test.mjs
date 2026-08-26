import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripComments } from "./source-scan.mjs";

const SRC = stripComments(
  readFileSync(new URL("../ui/builder/parcours-ecrans.mjs", import.meta.url), "utf8"));

test("`I changed my mind` n'est JAMAIS seul dans sa rangée", () => {
  /* 🔴 Eric, 2026-08-26 : *« la bonne chose à faire, toujours un Next à côté de
     I changed my mind »*.

     ⛔ CE QUI MANQUAIT ÉTAIT UN QUATRIÈME ÉTAT, ET IL NE SE VOYAIT PAS. Le pied
     traitait `acheve && !conclu` (→ Next) et `!acheve` (→ Done). Le cas
     `acheve && conclu` — l'étape réglée ET déjà conclue, celui où le joueur
     REVIENT sur un chapitre fini — ne tombait dans aucune branche : sa rangée
     ne portait que le bouton qui DÉFAIT. La seule porte offerte à qui relit une
     étape achevée était de la démolir.
     ⚠️ **Un `else if` sans `else` ne prévient jamais qu'il ne couvre pas
     tout** — il rend simplement moins que prévu, et se tait. C'est la même
     famille que « une absence n'est jamais une réponse ».

     ⭐ CE GARDE NE COMPTE PAS LES BOUTONS, IL REFUSE LE TROU : il exige que la
     branche qui suit `I changed my mind` soit un `if/else` complet. Compter
     deux boutons dans un état donné laisserait entrer un cinquième état non
     couvert le jour où quelqu'un en ajoute un. */
  const pieds = SRC.split('bouton("I changed my mind"').slice(1);
  assert.equal(pieds.length, 2, "témoin : deux pieds portent ce bouton (le guide, et Identity)");

  for (const [i, apres] of pieds.entries()) {
    const bloc = apres.slice(0, 700);
    const aNext = /bouton\("Next"/.test(bloc);
    assert.ok(aNext, `pied n°${i + 1} : aucun \`Next\` ne suit \`I changed my mind\``);
    /* ⛔ ET SI CE PIED TRIE PAR ÉTAT, LE TRI DOIT ÊTRE EXHAUSTIF. */
    if (/\bif \(/.test(bloc)) {
      assert.match(bloc, /\}\s*else\s*\{/,
        `pied n°${i + 1} : un \`if\` sans \`else\` — il existe un état qui ne `
        + `rend NI Next NI Done, et « I changed my mind » y reste seul`);
    }
  }
});

test("⚔️ ATTAQUE — rétablir l'ancien `else if` sans `else` fait rougir le garde", () => {
  /* Une exigence qu'on ne voit jamais échouer ne protège rien. */
  const mute = SRC.replace(
    /if \(acheve\) \{\s*pied\.append\(bouton\("Next"/,
    'if (acheve && !conclu) {\n    pied.append(bouton("Next"');
  assert.notEqual(mute, SRC, "témoin : la mutation a bien mordu dans la source");
  const bloc = mute.split('bouton("I changed my mind"')[1].slice(0, 700);
  assert.match(bloc, /acheve && !conclu/, "l'état non couvert est de retour");
});
