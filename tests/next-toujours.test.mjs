import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripComments } from "./source-scan.mjs";

const SRC = stripComments(
  readFileSync(new URL("../ui/builder/parcours-ecrans.mjs", import.meta.url), "utf8"));

test("LE BOUTON QUI DÉFAIT N'EST JAMAIS SEUL DANS SA RANGÉE", () => {
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
  /* ⚠️ RÉÉCRIT LE 2026-09-05 — CE GARDE ÉPELAIT UN LIBELLÉ. Il découpait la
     source sur `bouton("I changed my mind"`, donc il rougissait le jour où Eric
     changeait le MOT (« cancel est clair et court ») alors que la propriété
     qu'il défend — *le bouton qui DÉFAIT n'est jamais seul* — n'avait pas
     bougé d'un pouce. C'est la faute que TRAPS nomme : un garde qui décrit
     COMMENT c'est écrit au lieu de ce qui doit RESTER VRAI protège la forme
     d'hier et rougit sur les réparations.
     ⭐ LA FORME SÛRE EST L'IDENTITÉ, PAS LE MOT : `parcours-annuler` est la
     classe que la feuille peint en rouge (`--bouton-fond: var(--critical)`),
     c'est-à-dire la marque de la famille DÉFAIRE. Un libellé se traduit et se
     raccourcit ; une identité, non. */
  const pieds = SRC.split('"parcours-annuler"').slice(1);
  assert.equal(pieds.length, 2, "témoin : deux pieds portent ce bouton (le guide, et Identity)");

  for (const [i, apres] of pieds.entries()) {
    const bloc = apres.slice(0, 700);
    const aNext = /bouton\("Next"/.test(bloc);
    assert.ok(aNext, `pied n°${i + 1} : aucun \`Next\` ne suit le bouton qui DÉFAIT`);
    /* ⛔ ET SI CE PIED TRIE PAR ÉTAT, LE TRI DOIT ÊTRE EXHAUSTIF. */
    if (/\bif \(/.test(bloc)) {
      assert.match(bloc, /\}\s*else\s*\{/,
        `pied n°${i + 1} : un \`if\` sans \`else\` — il existe un état qui ne `
        + `rend NI Next NI Done, et le bouton qui DÉFAIT y reste seul`);
    }
  }
});

test("⚔️ ATTAQUE — rétablir l'ancien `else if` sans `else` fait rougir le garde", () => {
  /* Une exigence qu'on ne voit jamais échouer ne protège rien. */
  /* la forme du pied a changé au lot 68 (le Next se désarme sous gendarme) :
     l'attaque mute la nouvelle forme — `const next = bouton("Next"…)`. */
  const mute = SRC.replace(
    /if \(acheve\) \{\s*const next = bouton\("Next"/,
    'if (acheve && !conclu) {\n    const next = bouton("Next"');
  assert.notEqual(mute, SRC, "témoin : la mutation a bien mordu dans la source");
  const bloc = mute.split('"parcours-annuler"')[1].slice(0, 700);
  assert.match(bloc, /acheve && !conclu/, "l'état non couvert est de retour");
});
