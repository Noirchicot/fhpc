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

/* ══════════════════════════════════════════════════════════════════════════
   🔴 LA LIGNE DE TITRE REPLIÉE — Eric, 2026-09-03, croquis de la Tiefling :
   *« Fiendish Legacies (gras) · resistance and spells (corps) »*, quatre lignes
   au lieu de cinq. `renderFicheInfos` replie donc la valeur de l'entrée `All`
   sur la ligne du titre.

   ⚠️ CE GARDE EXISTE PARCE QUE LE PRÉCÉDENT NE VOYAIT PAS CETTE LIGNE. Celui
   du dessus mesure `label + " : " + value` et saute les entrées à `title` :
   la ligne la plus large de la bande — celle du titre replié, 39 caractères —
   passait sous son radar, verte, pendant qu'elle s'amputait à l'écran. Un
   garde aveugle à la ligne qu'il est censé protéger n'est pas un garde.

   📏 MESURÉ AU BANC (portrait 375, bande à 179,3 blg, corps T2) : les deux
   lignes repliées demandent 222 (Elf) et 224 (Tiefling) — **−43 et −45**.
   L'ellipsis les coupe, et c'est le régime tranché par Eric le 28/08 : un
   dépassement est un défaut de CONTENU, le raccourci lui appartient.

   ⭐ CE N'EST DONC PAS UNE EXCEPTION, C'EST UN REGISTRE DE DETTE, et il est
   fermé des DEUX côtés : la liste est nommée ET plafonnée au compte exact.
   Une TROISIÈME ligne repliée trop longue rougit ; une de ces deux raccourcie
   par Eric rougit aussi, pour qu'on vienne la rayer d'ici. ⛔ Une liste
   d'exceptions par nom ne dit jamais toute seule qu'elle est incomplète —
   c'est le compte exact qui le dit.
   ══════════════════════════════════════════════════════════════════════════ */
test("la ligne de titre repliée est mesurée, et sa dette est nommée au compte exact", () => {
  /* Même cote que le garde du dessus (31 caractères), pour la même raison :
     c'est la même boîte et le même corps. Le repli remplace le « : » par une
     simple espace — un caractère de séparation au lieu de trois. */
  const CAP = 31;
  const DETTE = [
    "srd:species:en:elf · Elven Lineages grant a thread of spells (39)",
    "srd:species:en:tiefling · Fiendish Legacies a resistance + spells (39)",
  ];
  const trop = [];
  let repliees = 0;
  for (const groupe of Object.values(LAYER.records)) {
    for (const [id, rec] of Object.entries(groupe)) {
      const infos = rec && rec.changes && rec.changes["data[fiche_infos]"];
      if (!Array.isArray(infos)) continue;
      /* Le MÊME repérage que `renderFicheInfos` : par le NOM de l'étiquette,
         jamais par sa position — rien ne garantit que le `All` soit la
         première entrée après le titre, et une bande dont on replierait la
         mauvaise ligne resterait parfaitement cohérente. */
      const tout = infos.find(
        (l) => l && typeof l.label === "string" && typeof l.value === "string"
          && l.label.trim().toLowerCase() === "all",
      );
      const titre = infos.find((l) => l && typeof l.title === "string");
      if (!tout || !titre) continue;
      repliees += 1;
      const ligne = `${titre.title} ${tout.value}`;
      if (ligne.length > CAP) trop.push(`${id} · ${ligne} (${ligne.length})`);
    }
  }
  /* 📏 5 bandes sur 12 espèces, et **2 seulement** portent un `All` (compté
     dans la couche, pas supposé) : Dragonborn, Hoddon et Goliath n'en ont
     pas et ne replient rien. Ce compte tient le garde en vie — le jour où une
     bande neuve gagne un `All`, il faudra passer ici. */
  assert.equal(repliees, 2, "exactement deux bandes replient un `All`");
  assert.deepEqual(trop, DETTE, "la dette des lignes repliées a changé — mesurer, puis rayer ou inscrire");
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
