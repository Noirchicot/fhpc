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

   🔴 LA DETTE A ÉTÉ PAYÉE LE 2026-09-04, ET PAR ERIC, PAS PAR LE CODE. Ce
   garde a été écrit la veille avec DEUX lignes inscrites : à 179,3 blg (les 2/3
   de la dalle), les lignes repliées demandaient 222 (Elf) et 224 (Tiefling) —
   −43 et −45, coupées par l'ellipsis. Mis devant la mesure, Eric a donné la
   pleine largeur : *« on prend donc toute la largeur avec ce bloc lineages
   species »*. La bande offre 253, les deux lignes repassent entières.
   ⭐ LE REGISTRE RESTE, VIDE, et c'est là tout son intérêt : c'est maintenant
   un garde qui dit *« aucune ligne repliée ne déborde »*, et il rougira à la
   première qui le fera. Un registre qu'on supprime le jour où il se vide est
   un garde qu'on retire au moment exact où il devient utile.
   ══════════════════════════════════════════════════════════════════════════ */
test("aucune ligne de titre repliée ne déborde sa bande, et le compte des replis est exact", () => {
  /* 📏 42 ET NON 31, ET LE CHIFFRE SE DÉRIVE D'UNE BOÎTE, PAS D'UN GOÛT. Le 31
     du garde au-dessus est calibré sur 226 blg — la colonne de l'habit PAYSAGE,
     ⚠️ qui a été retiré de la feuille le 2026-08-31 (« PLUS DE @media »). Il
     est donc, aujourd'hui, plus strict que la seule boîte qui existe.
     La bande rend 253 (mesuré au banc, sur les 24 fiches). Les lignes repliées
     les plus longues font 39 caractères pour 222 et 224 blg — soit ~5,7 blg par
     caractère. 42 caractères ≈ 240 blg : il reste ~13 blg de marge sous les 253,
     la même prudence que le « 2 caractères de marge » du garde voisin.
     ⛔ Ce n'est pas un relâchement du 31 : c'est une AUTRE boîte (la bande
     pleine largeur) mesurée pour ce qu'elle est. Le 31 n'est pas touché. */
  const CAP = 42;
  const DETTE = [];
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

test("CHOOSE porte le gabarit PETIT — et `fiche.css` n'en \u00e9crit plus la cote", () => {
  /* Eric, 27/08 : *\u00ab choose = petit bouton \u00bb* \u00b7 06/09 : *\u00ab la cote 77 comme
     standard petit \u00bb*. \U0001f4cd `bouton-deux-largeurs` (NORMES \u00a76).

     \u26a0\ufe0f \u26d4 CE GARDE A CHANG\u00c9 DE SENS LE 06/09, ET IL FAUT DIRE POURQUOI.
     Il exigeait `width: var(--glisse-case)` ICI — c'est-\u00e0-dire qu'il exigeait le
     SECOND \u00c9CRIVAIN. Tant qu'87 \u00e9tait la cote du petit, le garde et la loi
     disaient la m\u00eame chose ; le jour o\u00f9 Eric a tranch\u00e9 77, le garde a d\u00e9fendu
     la cote morte — et il l'aurait d\u00e9fendue en VERT, sans un mot.
     \u2b50 D'o\u00f9 la r\u00e9\u00e9criture : ce qu'on garde n'est plus un NOMBRE \u00e9crit ici, c'est
     qu'AUCUN nombre ne soit \u00e9crit ici. La cote a un seul lieu, `shell.css`.

     \U0001f4cf CE QUE LA MESURE A DIT, au banc le 06/09 \u00e0 14:48 : `Choose` rendait
     **87 \u00d7 44** quand les huit autres petits du d\u00e9p\u00f4t rendaient d\u00e9j\u00e0 77. Et le
     plancher de `shell.css` \u00e9tait bien appliqu\u00e9 — il ne pouvait simplement rien,
     parce qu'un `width` et un `min-width` sont DEUX PROPRI\u00c9T\u00c9S, que nulle
     sp\u00e9cificit\u00e9 ne d\u00e9partage. \u26d4 Un garde qui lit la sp\u00e9cificit\u00e9 n'aurait rien vu. */
  assert.doesNotMatch(
    FICHE,
    /\.fiche-action\s*\{[^}]*(?:^|[^-])(?:min-)?width\s*:/s,
    "\u26d4 `fiche.css` ne d\u00e9clare plus AUCUNE largeur pour CHOOSE : la cote du gabarit "
    + "petit vit dans `shell.css` (`--bouton-petit`), et un second \u00e9crivain la rendrait "
    + "increvable le jour o\u00f9 elle bouge"
  );

  /* \u2b50 ET CE QUI DOIT RESTER RESTE : `.fiche-action` d\u00e9clare `flex: 1 1 0` plus
     haut dans cette m\u00eame feuille. Sans un refus explicite de s'\u00e9tirer, CHOOSE
     prendrait toute la rang\u00e9e et le plancher ne se verrait jamais — un bouton
     trop LARGE passe tous les gardes de cote, puisqu'il les respecte tous. */
  assert.match(
    FICHE,
    /\.fiche-dalle:not\(\[data-dressing="prose"\]\) \.fiche-action \{[^}]*flex:\s*0 0 auto/s,
    "CHOOSE doit refuser de s'\u00e9tirer (`flex: 0 0 auto`), sinon le `flex: 1 1 0` "
    + "d\u00e9clar\u00e9 plus haut lui fait remplir la rang\u00e9e"
  );

  /* \U0001f534 ET LA COTE EXISTE VRAIMENT, dans son seul lieu. Sans cette clause, le
     garde passerait au vert sur une feuille o\u00f9 PERSONNE ne cote le petit bouton —
     une absence lue comme une r\u00e9ponse, exactement ce qu'on refuse ailleurs. */
  assert.match(
    SHELL,
    /min-width:\s*var\(--bouton-petit\)/,
    "`shell.css` doit poser le plancher du gabarit petit sur la famille \u00e0 mot"
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
  /* 🔴 ~~LA HAUTEUR RESTE 440~~ — LEVÉE PAR ERIC LE 2026-09-04 : *« on peut
     laisser la hauteur de la dalle se calculer d'elle-même »*. Les 24 fiches
     rendent maintenant de 371,6 (Loroka) à 429,6 (Elf, Hoddon).

     ⚖️ ET CE QUE CE TEST PROTÉGEAIT NE DISPARAÎT PAS AVEC ELLE — il change de
     porteur. La cote fixe servait DEUX choses : que la carte soit portable, et
     que le pas de l'aimant soit régulier. La seconde n'a jamais dépendu d'elle
     (c'est `grid-auto-rows: 100%` qui fait le pas, mesuré : 500 constant sur
     les 24, écart au centre nul sur les 24) ; la première est devenue sans
     objet le jour où Eric a demandé des fiches qui s'adaptent.

     ⭐ CE QUI REMPLACE L'ASSERTION, ET QUI EST PLUS STRICT QUE CE QU'ELLE
     DISAIT : plus AUCUNE hauteur en pixels bruts dans la feuille. L'ancienne
     laissait passer n'importe quel autre `height: <n>px` du moment que 440 était
     présent quelque part — elle cherchait une chaîne, pas une propriété.
     ⛔ Le `440px` était d'ailleurs le SECOND écrivain de cette cote : la fiche
     portait déjà `height: var(--fiche-h)`. C'est cette duplication que
     l'assertion figeait. */
  /* ⚠️ VISÉE SUR LA DALLE, PAS SUR LA FEUILLE. Ma première écriture cherchait
     tout `height: <n>px` du fichier : elle attrapait les 22 et 10 px du halo du
     scrollspy, qui sont un DESSIN de 22 blg de rond et n'ont jamais été une
     cote de carte. Un garde qui crie au loup se fait retirer — on vise la
     propriété de l'organe, pas une chaîne dans un fichier.
     FICHE est déjà dépouillée de ses commentaires en tête de fichier. */
  const portrait = FICHE.match(/\.fiche-dalle:not\(\[data-dressing="prose"\]\) \{([^}]*)\}/s);
  assert.ok(portrait, "la règle de la carte n'a plus la forme attendue");
  assert.match(portrait[1], /height:\s*auto/,
    "la carte calcule sa hauteur (Eric, 2026-09-04 : « on peut laisser la hauteur de la dalle se "
    + "calculer d'elle-même »)");
  assert.doesNotMatch(portrait[1], /height:\s*\d/,
    "une hauteur en pixels bruts est revenue sur la carte : une cote se NOMME (--fiche-h) ou se "
    + "calcule (auto). Le 440px retiré le 2026-09-04 doublait déjà `height: var(--fiche-h)`.");
  /* Et le pied ne se donne toujours aucun corps à part. */
  const pied = FICHE.match(/\.fiche-dalle:not\(\[data-dressing="prose"\]\) \.fiche-actions \{[^}]*\}/gs) || [];
  for (const regle of pied) {
    assert.doesNotMatch(regle, /font-size:/, "le pied n'invente pas sa taille de texte");
  }
});
