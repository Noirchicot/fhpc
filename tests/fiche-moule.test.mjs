import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FICHE = readFileSync(new URL("../ui/builder/fiche.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const SHELL = readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const TOKENS = readFileSync(new URL("../ui/builder/tokens.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const LAYER = JSON.parse(readFileSync(new URL("../layers/fh-fiche-en.layer.json", import.meta.url), "utf8"));

/* ══════════════════════════════════════════════════════════════════════════
   🔴 LE MOULE DE LA CARTE R — Eric, 2026-08-27 :
   « chaque élément se pose là où il faut et à la bonne proportion : sur iPad,
   sur Mac, sur iPhone » · « si je crée une nouvelle classe tout rentre
   là-dedans et sera joli partout » · « c'est un résumé de classe » ·
   « l'idée serait de pouvoir rapidement transformer un player handbook ou
   homebrew de taille livre en ce petit condensé ».

   La carte est un DESSIN à l'échelle --u ; le moule impose son format au
   CONTENU. Ces gardes tiennent les deux bouts : la géométrie (le pied fixe,
   le nowrap, le halo) et le contenu (une ligne par lineage).
   ══════════════════════════════════════════════════════════════════════════ */

test("une ligne de lineage tient sur sa ligne — ≤ 31 caractères, corpus entier", () => {
  /* 31 = la cote MESURÉE de la boîte (226u) au corps des infos (12u), en
     Inter — relevée au banc le 27/08 sur la ligne la plus large qui tient
     (« Ten lines : breath + resistance », 31 car., 226 px). Le nowrap coupe
     ce qui dépasse : une ligne plus longue serait AMPUTÉE à l'écran, pas
     repliée. ⚠️ Un compte de caractères n'est pas une largeur (NORMES
     §2 bis) — 31 est calibré avec 2 car. de marge sur la vraie limite. */
  const fautifs = [];
  for (const groupe of Object.values(LAYER.records)) {
    for (const [id, rec] of Object.entries(groupe)) {
      const infos = rec && rec.changes && rec.changes["data[fiche_infos]"];
      if (!Array.isArray(infos)) continue;
      for (const ligne of infos) {
        if (!ligne.label) continue;
        /* ⚖️ L'EXCEPTION MESURÉE — Eric, 27/08 : « Rage into Violent fury si
           t'as la place ». 34 caractères, mais MESURÉE au banc : 226 px
           demandés / 226 offerts, au pixel — et la police embarquée (lot 57)
           fige ce rendu sur toutes les machines. Une exception s'argumente
           avec sa mesure ; une deuxième ligne à 34 ne passe PAS sans la
           sienne. */
        if (ligne.label === "Berserker" && ligne.value === "Rage into Violent fury") continue;
        const l = ligne.label.length + 3 + String(ligne.value).length;
        if (l > 31) fautifs.push(`${id} · ${ligne.label} : ${ligne.value} (${l})`);
      }
    }
  }
  assert.deepEqual(fautifs, [], "des lignes de lineage débordent leur boîte");
});

test("le nowrap des lineages est posé — sans lui une ligne trop longue se replie en silence", () => {
  assert.match(
    FICHE,
    /\.fiche-dalle:not\(\[data-dressing="prose"\]\) \.fiche-info-row \{[^}]*white-space:\s*nowrap/s
  );
});

test("le halo du scrollspy existe, et dans les DEUX thèmes", () => {
  /* Eric, 27/08 : « le scrollspy n'est pas assez visible ». Le jeton bascule :
     lueur la nuit, encre le jour — une lueur blanche sur parchemin clair
     serait invisible. Deux déclarations, pas une. */
  const declarations = TOKENS.match(/--spy-halo:/g) || [];
  assert.equal(declarations.length, 2, "un --spy-halo par thème (jour + nuit)");
  assert.match(SHELL, /\.catalogue-rail-item\[aria-current="true"\] \{[^}]*box-shadow:[^}]*var\(--spy-halo\)/s);
});

test("CHOOSE porte le gabarit small — 87, la largeur d'un jeton", () => {
  /* Eric, 27/08 : « choose = petit bouton ». Et la cote se LIT
     (--glisse-case), elle ne se recopie pas : le jour où la rangée change,
     boutons et jetons suivent ensemble (NORMES §6). */
  assert.match(
    FICHE,
    /\.fiche-dalle:not\(\[data-dressing="prose"\]\) \.fiche-action \{[^}]*width:\s*var\(--glisse-case\)/s
  );
});

test("la carte est une COMPOSITION EN BLG — plus une seule échelle locale", () => {
  /* ⚖️ RÉÉCRIT LE 2026-08-30. Ce test exigeait `height: calc(var(--u) * 396 +
     44px)` : la zone dessinée suivait l'échelle LOCALE de la carte, la rangée
     tactile jamais. Eric a retiré cette échelle-là — *« la carte s'adaptait
     car je voulais que ça soit joli sur 2 proportionnalités différentes, donc
     là ça devient hors sujet »* — et la mesure lui donnait raison avant
     l'argument : sous `zoom`, cette homothétie devenait NON MONOTONE (à 1920,
     la dalle rendait 625 → 781 → 937 → 1420 → 920 aux cinq crans).

     🔴 L'INVARIANT QUE CE TEST PROTÈGE N'A PAS CHANGÉ DE NATURE, il a changé
     d'expression : la carte reste le DESSIN de référence, aux cotes du 27/08,
     et le zoom global le fait grandir en bloc. Ce qui est interdit, c'est
     qu'une SECONDE échelle réapparaisse — deux échelles qui se croisent, c'est
     exactement ce que la loi du 30/08 refuse. */
  assert.doesNotMatch(FICHE, /var\(--u\)/,
    "aucune échelle locale ne doit revenir dans la carte : le zoom global est la seule");
  assert.doesNotMatch(FICHE, /\b100cq[wh]\b/,
    "ni requête de conteneur : la carte ne se mesure plus sur sa scène");
  /* La hauteur reste UNE cote, et c'est toujours la même : 396 de dessin plus
     44 de rangée tactile. Elle grandit avec tout le reste, jamais seule. */
  assert.match(FICHE, /height:\s*440px/,
    "la hauteur de la carte reste 440 blg — 396 + 44, les cotes du dessin validé");
  /* Et le pied ne se donne toujours aucun corps à part. */
  const pied = FICHE.match(/\.fiche-dalle:not\(\[data-dressing="prose"\]\) \.fiche-actions \{[^}]*\}/gs) || [];
  for (const regle of pied) {
    assert.doesNotMatch(regle, /font-size:/, "le pied n'invente pas sa taille de texte");
  }
});
