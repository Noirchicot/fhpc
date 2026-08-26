import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const TOKENS = readFileSync(new URL("../ui/builder/tokens.css", import.meta.url), "utf8");
const sansCommentaires = TOKENS.replace(/\/\*[\s\S]*?\*\//g, "");

/* ══════════════════════════════════════════════════════════════════════════
   🔴 LA POLICE EST EMBARQUÉE — Eric, 2026-08-27 :
     · *« je voudrais que les blocs gardent leurs proportions d'un écran à
       l'autre »* · *« donc en gros stabiliser tout ça d'un appareil à
       l'autre »*.

   LE DÉFAUT QUE ÇA FERME : la pile système (`-apple-system … Segoe UI`)
   rendait un texte différent par machine. Sur le PC d'un ami d'Eric, les
   blocs texte 2 et 3 de la carte d'espèce sortaient du cadre — glyphes plus
   larges, lignes en plus, et la dalle (hauteur imposée, overflow visible)
   laissait tout sortir. Une police servie par le dépôt rend les mêmes
   retours à la ligne partout ; c'est le socle du gabarit proportionnel.

   ⛔ CE QUE CE GARDE REFUSE : que la pile retombe au système (le jour où
   quelqu'un « simplifie » le jeton --font), ou qu'un des deux fichiers
   disparaisse pendant que la feuille continue de le citer — la feuille
   mentirait en silence, chaque navigateur reprendrait sa propre police.
   ══════════════════════════════════════════════════════════════════════════ */

test("le jeton --font nomme Inter en premier", () => {
  const m = sansCommentaires.match(/--font:\s*([^;]+);/);
  assert.ok(m, "le jeton --font existe dans tokens.css");
  assert.match(m[1].trim(), /^"Inter"/, "la police embarquée passe avant toute pile système");
});

test("les deux visages d'Inter sont déclarés et présents sur le disque", () => {
  for (const [style, fichier] of [
    ["normal", "InterVariable.woff2"],
    ["italic", "InterVariable-Italic.woff2"]
  ]) {
    /* la déclaration : un @font-face qui cite CE fichier et CE style */
    const face = new RegExp(
      `@font-face\\s*\\{[^}]*src:\\s*url\\("assets/fonts/${fichier}"\\)[^}]*font-style:\\s*${style}`,
      "s"
    );
    assert.match(sansCommentaires, face, `@font-face ${style} → ${fichier}`);

    /* le fichier : présent, et pas un reste vide d'un curl raté */
    const chemin = new URL(`../ui/builder/assets/fonts/${fichier}`, import.meta.url);
    const taille = statSync(chemin).size;
    assert.ok(taille > 100_000, `${fichier} pèse ${taille} octets — une vraie fonte, pas un débris`);
  }
});

test("les @font-face couvrent toute l'échelle des graisses", () => {
  /* la fonte est VARIABLE (100 900) : un @font-face borné à une seule graisse
     ferait synthétiser les gras par le navigateur — et le rendu redeviendrait
     différent d'une machine à l'autre, le défaut qu'on vient de fermer. */
  const poids = [...sansCommentaires.matchAll(/@font-face\s*\{[^}]*font-weight:\s*([^;]+);/gs)].map((m) => m[1].trim());
  assert.equal(poids.length, 2, "exactement deux @font-face (normal + italique)");
  for (const p of poids) assert.equal(p, "100 900", "la plage variable complète");
});
