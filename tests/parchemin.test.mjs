/* ══ LE GARDE DU PARCHEMIN — lot 219, 2026-09-21 ════════════════════════════

   🔴 CE QU'IL DÉFEND, et chaque ligne vient d'une phrase d'Eric du 21/09 :
     · *« aucune image matricielle de parchemin ne doit être nécessaire »* — la
       surface est CALCULÉE, et l'image ne peut pas revenir en silence ;
     · *« le contour est calculé dans les dimensions réelles »* — ⛔ pas un
       rectangle étiré : la matière garde sa taille en blg à toute cote ;
     · *« la silhouette doit être déterministe »* — mêmes cotes ⇒ même chemin ;
     · *« les accrocs doivent être plus larges que les petites fibres »* —
       l'invariante `accroc > fibre`, sans laquelle le bord fait une dent de scie ;
     · *« le contenu et les zones tactiles ne doivent jamais être rognés »* — la
       morsure du bord ne dépasse JAMAIS le dégagement du premier organe peint ;
     · *« les couleurs viennent des variables du thème »* — ⛔ aucune teinte dans
       le JavaScript ;
     · *« la bleutée ne doit pas ressembler à un panneau nocturne recoloré »* —
       elle PRIME, donc elle redéfinit TOUT ce que la nuit touche.

   ⛔ SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS : il calcule des chemins et
   lit des feuilles. Il ne PEINT rien. Le rendu se regarde au navigateur
   (`ui/builder/banc-x1.html`, qui porte la barre des trois palettes) — et c'est
   là, le 21/09, qu'ont été mesurés le débordement nul, les 104 coins d'encre sur
   le papier, et le redessin unique du `ResizeObserver`. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const D = await import("../ui/builder/x1-disposition.mjs");
const { geometrieDuParchemin, bornerLEchelle, MODELE_B } = await import("../ui/builder/parchemin.mjs");
const { budgetDuParchemin } = await import("../ui/builder/x1-ecran.mjs");
const source = stripComments(fs.readFileSync(path.join(UI, "parchemin.mjs"), "utf8"));
const jetons = stripComments(fs.readFileSync(path.join(UI, "tokens.css"), "utf8"));
const shell = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));

/* Les points d'ancrage du chemin — la courbe y passe, donc ils bornent la morsure. */
function pointsDu(d) {
  const n = d.match(/-?\d+\.?\d*/g).map(Number);
  const pts = [];
  for (let i = 0; i < n.length; i += 2) pts.push({ x: n[i], y: n[i + 1] });
  return pts;
}

/* ══ 1 — LE MODÈLE B, ET SON INVARIANTE ══════════════════════════════════ */

test("1 — le modèle retenu est B « Feuillet de grimoire », aux nombres du prototype", () => {
  /* ⛔ CES SIX NOMBRES NE SE RÉ-INVENTENT PAS : ils viennent du prototype
     qu'Eric a regardé et validé le 21/09 (`Gpt in FH/Parchemin-CSS/`). Les
     retaper de mémoire est exactement la faute que ce dépôt appelle « recopier
     une cote ». */
  assert.deepEqual(
    [MODELE_B.graine, MODELE_B.houle, MODELE_B.fibre, MODELE_B.accroc, MODELE_B.patine],
    [43, 2.5, .9, 1.1, 1], "les nombres du modèle B (seed/swell/tooth/nick/patina)");
  assert.deepEqual([...MODELE_B.coins], [9, 5, 12, 7], "les quatre coins INÉGAUX du modèle B");
});

test("1 bis — ⚖️ L'INVARIANTE : l'accroc est plus LARGE que la fibre (sinon, dent de scie)", () => {
  /* Eric, 21/09 : *« les accrocs doivent être plus larges que les petites fibres
     afin d'éviter l'aspect en dents de scie »*.
     ⭐ C'EST UNE INVARIANTE, PAS UN RÉGLAGE — et elle départage les trois modèles
     du prototype : B (1,1 > 0,9) et C (1,65 > 1,2) la tiennent, A (0,3 < 0,48)
     l'inverse. C'est la raison chiffrée pour laquelle A ne pouvait pas être retenu. */
  assert.ok(MODELE_B.accroc > MODELE_B.fibre,
    `⛔ accroc ${MODELE_B.accroc} ≤ fibre ${MODELE_B.fibre} : le bord ferait une dent de scie régulière`);
});

/* ══ 2 — DÉTERMINISME ════════════════════════════════════════════════════ */

test("2 — mêmes cotes ⇒ exactement le même contour ; cotes différentes ⇒ contour différent", () => {
  const a = geometrieDuParchemin(375, 500, 9);
  const b = geometrieDuParchemin(375, 500, 9);
  assert.equal(a.d, b.d, "⛔ deux appels identiques donnent deux chemins différents : la silhouette n'est pas déterministe");
  assert.equal(a.fibres, b.fibres, "les fibres aussi");
  /* ⚔️ ET LE TÉMOIN QUI PROUVE QUE LE GARDE N'EST PAS CREUX : si le chemin ne
     dépendait PAS des cotes, l'égalité ci-dessus serait vraie pour rien. */
  assert.notEqual(a.d, geometrieDuParchemin(375, 501, 9).d,
    "⛔ un blg de plus rend le MÊME chemin — le contour ne suit donc pas la cote réelle");
});

test("2 bis — ⛔ aucun hasard : `Math.random` ne peut pas entrer dans ce fichier", () => {
  assert.ok(!/Math\.random/.test(source),
    "⛔ `Math.random` détruirait le déterminisme — le bruit est un hachage de `Math.sin`, à graine fixe");
  assert.ok(/Math\.sin/.test(source), "⚔️ et le hachage est bien là : sinon la clause ci-dessus ne protège rien");
});

/* ══ 3 — LA COTE RÉELLE, ⛔ PAS UN GABARIT ÉTIRÉ ═════════════════════════ */

test("3 — la matière garde sa taille en blg : un panneau plus haut a PLUS de points, pas des points plus espacés", () => {
  /* ⭐ C'EST LE CŒUR DU LOT. L'image `.webp` était servie en `100% 100%` : à
     hauteur double, son grain était deux fois plus étiré. Un contour calculé à la
     cote réelle, lui, ajoute des points — l'espacement, donc la taille de la
     matière, ne bouge pas. */
  const court = pointsDu(geometrieDuParchemin(375, 400, 9).d);
  const long = pointsDu(geometrieDuParchemin(375, 800, 9).d);
  assert.ok(long.length > court.length * 1.4,
    `⛔ 800 de haut donne ${long.length} points contre ${court.length} à 400 : le contour est ÉTIRÉ, pas recalculé`);
  /* et la densité le long d'une arête verticale reste la même, au pas près */
  const pas = (pts, h) => pts.filter((p) => p.x < 20 && p.y > h * .2 && p.y < h * .8).length / (h * .6);
  const dCourt = pas(court, 400), dLong = pas(long, 800);
  assert.ok(Math.abs(dCourt - dLong) / dCourt < .12,
    `⛔ densité ${dCourt.toFixed(3)} vs ${dLong.toFixed(3)} pt/blg : la matière change d'échelle avec le format`);
});

test("3 bis — ⛔ aucune cote de la dalle n'est écrite dans le module : il MESURE, il ne suppose pas", () => {
  /* ⚠️ 375 et 500 sont la dalle du CHAPITRE — `sac-disposition.mjs`,
     `wares-disposition.mjs` et `x1-disposition.mjs` la portent déjà. Un quatrième
     écrivain serait une cote de plus à tenir d'accord avec trois autres. */
  assert.ok(!/\b(375|500|560)\b/.test(source),
    "⛔ une cote de la dalle est recopiée dans `parchemin.mjs` — il doit lire `clientWidth`/`clientHeight`");
  assert.ok(/clientWidth/.test(source) && /clientHeight/.test(source), "⚔️ et il les lit bien");
  /* ⛔ ET SURTOUT PAS `getBoundingClientRect` : mesuré le 21/09 sous Chromium 152,
     dans un parent à `zoom: 1.8`, `clientWidth` rend 375 (le blg) et le rect 675
     (le pixel peint). Le rect donnerait deux silhouettes pour un même écran. */
  assert.ok(!/getBoundingClientRect/.test(source),
    "⛔ `getBoundingClientRect` est zoomé : sous `zoom` il rend le pixel PEINT, pas le blg (TRAPS, lot 121)");
});

/* ══ 4 — ⛔ AUCUNE ENCRE HORS DU PAPIER ══════════════════════════════════ */

test("4 — 🔴 LE RECTANGLE VISIBLE EST PLEIN : aucun creux ne laisse voir ce qu'il y a dessous", () => {
  /* ⚖️ Eric, 2026-09-21, en regardant le rendu EN LIGNE : *« fais dépasser le
     parchemin qu'on ne voie pas la fiche sous-jacente »*.
     ✅ ET UNE LOI RATIFIÉE LE COUVRAIT DÉJÀ — `cadre-dechirure-du-parchemin-hors-dalle`,
     vivante depuis le 18/09 : *« On ne voit que le DÉBUT de la déchirure au bord de la
     fiche X1 »*, Eric : *« les 28 de large en moins, c'est ok. On laisse le parchemin
     comme ça. »*

     🔴 CE QUE CE GARDE REMPLACE, ET POURQUOI IL FALLAIT L'INVERSER. Il tenait
     l'inverse : *« la morsure du bord ne dépasse jamais le dégagement du premier
     organe »*, adossé à une contrainte que le lot 219 s'était donnée
     (`m + k·min ≥ 0`, *« aucun bord rogné à plat »*). ⛔ Cette contrainte était un
     GOÛT formulé comme une exigence de qualité, et elle annulait en silence la loi
     du 18/09 — personne ne pouvait le voir, parce qu'elle ne se présentait pas
     comme un changement de loi.

     📏 CE QUI A ÉTÉ MESURÉ AVANT DE LA RETOURNER (banc, fond magenta, 21/09) : ce
     n'était pas *« quelques creux de 2 blg »*. La silhouette tenait ENTIÈREMENT
     dans le rectangle, donc TOUT le pourtour — une bande irrégulière sur les quatre
     côtés — laissait passer ce qu'il y avait derrière.
     ⚠️ ET CE N'ÉTAIT PAS UN AUTRE ÉCRAN : `montrer()` pose la vue par `swapContent`
     → `replaceChildren`, donc X1 REMPLACE Gear ou le sac. Ce qui transparaissait est
     le fond de l'application. Il n'y avait rien à « cacher dessous ».

     ⭐ LE GARDE EST À DEUX CÔTÉS, et c'est ce qui l'empêche d'être tautologique :
       ① aucun point du bord n'est DANS le rectangle → rien ne transparaît ;
       ② un point au moins l'AFFLEURE → le papier n'est pas devenu un rectangle
          géant dont la déchirure serait hors de portée. Sans ②, une implémentation
          qui dessinerait le bord à 100 blg dehors passerait ① les doigts dans le nez,
          et le *« début de la déchirure »* du 18/09 ne se verrait plus jamais. */
  const budget = budgetDuParchemin();
  assert.equal(budget, 9.5, "le dégagement déduit de la table — s'il bouge, c'est que la table a bougé");

  for (const h of [360, 420, 500, 640, 700, 900]) {
    let plusDedans = -Infinity, ou = null;
    for (const p of pointsDu(geometrieDuParchemin(375, h, budget).d)) {
      /* ⭐ POSITIF = DANS le rectangle. Un point dehors a au moins une des quatre
         distances négative, donc son minimum l'est. */
      const dedans = Math.min(p.x, 375 - p.x, p.y, h - p.y);
      if (dedans > plusDedans) { plusDedans = dedans; ou = p; }
    }
    assert.ok(plusDedans <= .5,
      `⛔ à ${h} de haut, le bord rentre de ${plusDedans.toFixed(2)} blg dans le rectangle : ` +
      `ce creux laisse voir le fond de l'application (${JSON.stringify(ou)})`);
    assert.ok(plusDedans >= -1.5,
      `⛔ à ${h} de haut, le bord le plus rentrant reste à ${(-plusDedans).toFixed(2)} blg DEHORS : ` +
      "le papier ne touche plus son arête, et le « début de la déchirure » du 18/09 ne se voit plus");
  }
});

test("4 bis — ⭐ LE PAPIER DÉBORDE, ET D'AU PLUS LE BUDGET : la dalle le rogne, elle ne le dévore pas", () => {
  /* ⛔ L'AUTRE MOITIÉ, ET ELLE COMPTE AUTANT — elle a seulement changé de sens.
     Elle disait *« le bord ne sort jamais de la dalle »* ; elle dit maintenant qu'il
     en sort BORNÉ. ⭐ La contrainte `m + k·max ≤ budget` n'a pas bougé d'un signe :
     c'est elle qui tient l'amplitude, donc le papier ne peut pas s'échapper.
     ⚠️ CE QU'UN DÉBORD NON BORNÉ COÛTERAIT : la silhouette est aussi la COUPE
     (`clipPath`) du grain, des fibres et de la patine. Un bord parti à 200 blg
     dehors étirerait la patine hors de toute arête, et le papier perdrait sa
     tranche — on aurait un aplat, pas une feuille. */
  const budget = budgetDuParchemin();
  for (const h of [360, 420, 500, 640, 700, 900]) {
    const { m } = bornerLEchelle(375, h, budget);
    assert.ok(m <= 0,
      `à ${h} de haut, la ligne moyenne vaut ${m.toFixed(2)} : le papier est rentré dans la dalle, ` +
      "et le pourtour redevient transparent");
    assert.ok(m >= -budget - .5,
      `à ${h} de haut, la ligne moyenne vaut ${m.toFixed(2)} : le débord dépasse le budget de ${budget}`);
    for (const p of pointsDu(geometrieDuParchemin(375, h, budget).d)) {
      assert.ok(p.x >= -budget - .5 && p.x <= 375 + budget + .5 &&
                p.y >= -budget - .5 && p.y <= h + budget + .5,
        `⛔ un point du bord s'échappe de plus que le budget à ${h} de haut : ${JSON.stringify(p)}`);
    }
  }
});

/* ══ 5 — LES COULEURS VIENNENT DU THÈME, ⛔ JAMAIS DU JS ═════════════════ */

test("5 — ⛔ aucune teinte n'est écrite dans `parchemin.mjs` : il ne pose que des classes", () => {
  /* Eric, 21/09 : *« les couleurs viennent des variables du thème ; aucune valeur
     dupliquée dans le JavaScript »*. ⭐ C'est ce qui permet aux trois palettes de
     passer par-dessus une seule géométrie. */
  const teintes = [...source.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/g)].map((m) => m[0]);
  assert.deepEqual(teintes, [],
    `⛔ des teintes vivent dans le module : ${teintes.join(", ")} — elles doivent être des jetons de tokens.css`);
  /* ⚔️ le témoin : le module pose bien des classes, sinon il n'y aurait rien à peindre */
  assert.ok(/parchemin-fond/.test(source) && /parchemin-patine/.test(source),
    "⚔️ le module nomme bien ses classes — sinon la clause ci-dessus protège un fichier vide");
});

test("5 bis — les six classes du dessin ont toutes leur teinte dans shell.css", () => {
  /* ⛔ UNE CLASSE POSÉE SANS RÈGLE EST INVISIBLE, ET RIEN NE LE DIT — la famille
     exacte du jeton CSS inventé (`--info`, 253 emplois muets). */
  for (const classe of ["parchemin-fond", "parchemin-patine", "parchemin-grain",
                        "parchemin-fibres", "parchemin-pli", "parchemin-fil"]) {
    assert.ok(source.includes(classe), `⚔️ ${classe} est bien posée par le module`);
    assert.ok(new RegExp(`\\.${classe}\\b`).test(shell), `⛔ .${classe} n'a AUCUNE règle dans shell.css : elle ne peindra rien`);
  }
});

/* ══ 6 — 🔵 LA BLEUTÉE PRIME SUR LES DEUX THÈMES ═════════════════════════ */

test("6 — 🔵 la palette Party Tally redéfinit TOUT ce que la nuit touche (sinon la nuit fuit)", () => {
  /* ⚖️ Eric, 21/09 : *« le bleu est un contexte hors jour nuit, il PRIME »*, et
     *« elle ne doit pas ressembler à un panneau nocturne simplement recoloré »*.
     🔴 CE QUE CE GARDE ATTRAPE, ET QU'AUCUN GARDE DE COULEUR N'ATTRAPERAIT :
     « primer » est une affirmation sur QUI GAGNE. Si la nuit redéfinissait demain
     un jeton que la bleutée ne redéfinit pas, ce jeton-là passerait en nuit SOUS
     la palette bleue — un panneau bleu avec une encre de nuit, exactement ce
     qu'Eric refuse — et aucun test de teinte ne broncherait.
     ⭐ La bleutée doit donc être COMPLÈTE, pas seulement présente. */
  const bloc = (re) => { const m = re.exec(jetons); return m ? m[1] : null; };
  const nuit = bloc(/@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\n  \}/);
  const bleu = bloc(/\.x1\[data-parchemin="party-tally"\] \{([\s\S]*?)\n\}/);
  assert.ok(nuit, "le bloc de nuit existe");
  assert.ok(bleu, "le bloc Party Tally existe");
  const jetonsDe = (t) => new Set([...t.matchAll(/(--x1-[\w-]+)\s*:/g)].map((m) => m[1]));
  const deNuit = jetonsDe(nuit), deBleu = jetonsDe(bleu);
  assert.ok(deNuit.size > 0, "⚔️ la nuit redéfinit bien des jetons de X1 — sinon ce garde ne protège rien");
  const oublies = [...deNuit].filter((j) => !deBleu.has(j));
  assert.deepEqual(oublies, [],
    `⛔ la bleutée ne redéfinit pas ${oublies.join(", ")} : la NUIT gagnera sur ces jetons-là, sous un papier bleu`);
});

test("6 bis — ⛔ et elle n'est pas un thème : elle se pose sur la FICHE, pas sur `:root`", () => {
  /* Eric : le bleu est un CONTEXTE (*« la fiche relève du Party Tally »*), pas une
     préférence. Un `:root[data-parchemin]` en ferait un réglage global. */
  assert.ok(/\.x1\[data-parchemin="party-tally"\]/.test(jetons),
    "la bleutée se déclare sur la fiche");
  assert.ok(!/:root\[data-parchemin/.test(jetons),
    "⛔ la bleutée est posée sur `:root` : elle deviendrait un troisième thème, ce qu'Eric a écarté");
});

/* ══ 7 — LE REPLI, ET L'ABSENCE DE MOUVEMENT ════════════════════════════ */

test("7 — ⛔ rien n'est mesuré en synchrone : là où il n'y a pas de mise en page, le repli tient", () => {
  /* 📏 Mesuré le 21/09 : un appel synchrone faisait rougir huit tests de
     `x1-ecran.test.mjs` — le `dom-stub` refuse `clientHeight` sans géométrie, et
     il a raison. ⭐ Le repli est un `<rect>` en POUR-CENT : juste à toute cote,
     sans qu'on ait rien à mesurer. */
  assert.ok(/requestAnimationFrame/.test(source), "la première mesure attend la mise en page");
  assert.ok(/parchemin-repli/.test(source), "le repli existe");
  assert.ok(/width: "100%", height: "100%"/.test(source) || /width: "100%"/.test(source),
    "⛔ le repli doit être en POUR-CENT : un repli coté serait faux dès que la dalle change");
  assert.ok(/typeof ResizeObserver === "function"/.test(source),
    "⛔ l'absence de `ResizeObserver` doit être prévue, pas supposée");
});

test("7 bis — ⛔ le parchemin ne bouge pas : `prefers-reduced-motion` n'a rien à éteindre", () => {
  /* ⭐ CE N'EST PAS UNE INTENTION, C'EST UNE PROPRIÉTÉ VÉRIFIÉE : la feuille est
     REDESSINÉE, jamais animée. Une transition posée ici s'animerait à chaque
     redimensionnement — et un mouvement qu'aucune règle n'éteint est exactement
     ce que `prefers-reduced-motion` existe pour interdire. */
  const debut = shell.indexOf(".x1 .parchemin {");
  assert.ok(debut > 0, "le bloc existe");
  const bloc = shell.slice(debut, shell.indexOf("}", shell.indexOf(".parchemin-fil")));
  assert.ok(!/\b(transition|animation)\s*:/.test(bloc),
    "⛔ une transition ou une animation vit dans le bloc du parchemin : elle jouerait à chaque redessin");
});
