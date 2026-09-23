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
/* ⭐ LOT 248 — la famille du parchemin se LIT à sa source ; ce garde ne la
   recopie plus (elle était écrite quatre fois, cf. `parchemin.mjs`). */
import { SELECTEUR_DU_PARCHEMIN as PARCH } from "../ui/builder/parchemin.mjs";
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

/* ══ 4 — ⛔ LA SILHOUETTE RENTRE, ET LA DÉCHIRURE SE VOIT ════════════════ */

/** Les ANCRES du chemin, ⛔ pas ses points de contrôle : `M x y`, puis la
 *  troisième paire de chaque `C`. `pointsDu` rend TOUS les nombres appariés —
 *  utile pour borner, ⛔ faux pour un polygone, parce qu'un point de contrôle
 *  n'est pas sur la courbe. Le témoin des zones tactiles a besoin du vrai
 *  contour, donc il a besoin de celui-ci. */
function ancresDu(d) {
  const n = d.match(/-?\d+\.?\d*/g).map(Number);
  const pts = [{ x: n[0], y: n[1] }];
  for (let i = 2; i + 5 < n.length; i += 6) pts.push({ x: n[i + 4], y: n[i + 5] });
  return pts;
}
/** Le point est-il DANS le polygone ? (lancer de rayon, impair = dedans) */
function dansLePolygone(P, x, y) {
  let dedans = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const xi = P[i].x, yi = P[i].y, xj = P[j].x, yj = P[j].y;
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) dedans = !dedans;
  }
  return dedans;
}

test("4 — 📜 LA SILHOUETTE RENTRE DANS LA DALLE, ET ELLE MORD ASSEZ POUR QU'ON LA VOIE", () => {
  /* ⚖️ Eric, 2026-09-21, devant la fiche servie : *« efface la plaque en dessous et
     n'agrandis pas X »*, *« on verra le contour »*, *« juste X et le fond derrière »*.

     🔴 CE QUE CE GARDE DÉFAIT, ET C'EST LE LOT 240. Pendant une nuit il a tenu
     l'inverse : *« LE RECTANGLE VISIBLE EST PLEIN »*, ligne moyenne à `−k·haut`, le
     papier poussé DEHORS et coupé à plat par `overflow: hidden` aux quatre côtés.
     ⛔ Il n'était pas faux — il répondait à une autre phrase d'Eric (*« fais dépasser
     le parchemin »*) et à une lecture de la loi du 18/09. Mais son propre message le
     disait en dernière ligne : *« au budget de 9,5 la déchirure n'est plus lisible
     comme une silhouette — la fiche se lit comme un rectangle »*. Eric a regardé ce
     rectangle, et il tranche l'inverse.

     📏 ET LA « PLAQUE » D'ERIC N'EXISTE PAS — MESURÉ, ⛔ PAS SUPPOSÉ (Chromium,
     21/09, `ui/builder/index.html`, chaîne matérialisée et lue au `getComputedStyle`) :
     `.x1`, `.equipment-step`, `.decision-card`, `.stage`, `.stage-area`,
     `.panneau-contenu`, `.panneau`, `.panneaux`, `.app` et `html` rendent tous
     `rgba(0, 0, 0, 0)` / `background-image: none`. Le seul organe qui peint sous la
     fiche est `body` (`rgb(20, 18, 14)` + `bg-ruins-night`) — *« le fond derrière »*.
     ⭐ La plaque qu'il a vue ÉTAIT le parchemin agrandi. Les deux consignes sont donc
     un seul geste, et c'est le signe de la ligne moyenne.

     ⭐ LE GARDE EST À DEUX CÔTÉS, et c'est ce qui l'empêche d'être tautologique :
       ① aucun point du bord ne SORT du rectangle — sinon `overflow: hidden` le coupe
          à plat et le rectangle du lot 240 revient ;
       ② le point le plus rentrant mord au moins la MOITIÉ du budget — sinon une
          silhouette rentrée d'un dixième de blg passerait ① les doigts dans le nez,
          et il n'y aurait plus rien à voir. C'est le creux qui EST la déchirure. */
  const budget = budgetDuParchemin();
  assert.equal(budget, 9.5, "le dégagement déduit de la table — s'il bouge, c'est que la table a bougé");

  for (const h of [360, 420, 500, 640, 700, 900]) {
    let plusDedans = -Infinity, plusDehors = -Infinity, ou = null;
    for (const p of pointsDu(geometrieDuParchemin(375, h, budget).d)) {
      /* ⭐ POSITIF = DANS le rectangle. Un point dehors a au moins une des quatre
         distances négative, donc son minimum l'est. */
      const dedans = Math.min(p.x, 375 - p.x, p.y, h - p.y);
      if (dedans > plusDedans) { plusDedans = dedans; ou = p; }
      if (-dedans > plusDehors) plusDehors = -dedans;
    }
    assert.ok(plusDehors <= .5,
      `⛔ à ${h} de haut, le bord sort de ${plusDehors.toFixed(2)} blg : la dalle le coupe à plat ` +
      "et la fiche redevient le rectangle du lot 240");
    assert.ok(plusDedans >= budget / 2,
      `⛔ à ${h} de haut, le bord ne rentre que de ${plusDedans.toFixed(2)} blg sur un budget de ` +
      `${budget} : le creux ne se voit pas, donc la déchirure non plus (${JSON.stringify(ou)})`);
  }
});

test("4 bis — ⭐ LE BORD MORD, ET D'AU PLUS LE BUDGET : l'encre reste sur le papier", () => {
  /* ⛔ L'AUTRE MOITIÉ, ET ELLE COMPTE AUTANT : la morsure ne dépasse JAMAIS le
     dégagement du premier organe peint. Sans elle, la déchirure mange la copie et
     l'œil — et cette contrainte-là n'a jamais changé de signe, ni au lot 219, ni au
     240, ni ici. C'est `m + k·max ≤ budget`.
     ⚠️ ET LA LIGNE MOYENNE EST POSITIVE : c'est ce qui dit que le papier est DEDANS.
     Un `m` négatif est exactement l'état du lot 240. */
  const budget = budgetDuParchemin();
  for (const h of [360, 420, 500, 640, 700, 900]) {
    const { m } = bornerLEchelle(375, h, budget);
    assert.ok(m >= 0,
      `à ${h} de haut, la ligne moyenne vaut ${m.toFixed(2)} : le papier est sorti de la dalle, ` +
      "et l'`overflow` va le couper à plat");
    let pire = 0, ou = null;
    for (const p of pointsDu(geometrieDuParchemin(375, h, budget).d)) {
      const morsure = Math.min(p.x, 375 - p.x, p.y, h - p.y);
      if (morsure > pire) { pire = morsure; ou = p; }
    }
    assert.ok(pire <= budget + .5,
      `⛔ à ${h} de haut, le bord mord ${pire.toFixed(2)} blg alors que l'organe le plus au bord ` +
      `n'en dégage que ${budget} — de l'encre tombe hors du papier (${JSON.stringify(ou)})`);
  }
  /* ⚔️ ET LE GARDE PEUT ACCUSER : à budget desserré, la morsure dépasse. Un garde
     qui ne rougit jamais ne protège rien. */
  let pireLarge = 0;
  for (const p of pointsDu(geometrieDuParchemin(375, 500, 40).d))
    pireLarge = Math.max(pireLarge, Math.min(p.x, 375 - p.x, p.y, 500 - p.y));
  assert.ok(pireLarge > budget,
    "⚔️ à budget desserré la morsure DOIT dépasser le dégagement — sinon ce garde est aveugle");
});

test("4 ter — 🔴 AUCUNE ZONE TACTILE SUR LE VIDE : les quatre coins de chaque CIBLE sont sur le papier", () => {
  /* 🔴 LE TÉMOIN QUE LE LOT 243 DEVAIT À ERIC, et il est NOMMÉ AVANT D'ÊTRE MESURÉ.
     Rendre la silhouette à l'intérieur veut dire que le bord RENTRE — jusqu'à 9,04
     blg au plus creux. ⛔ Un bouton dont la boîte tapable déborderait dans ce creux
     serait posé sur le vide, et ce serait pire que le rectangle qu'on répare.

     ⭐ CE QU'IL LIT, ET C'EST LA CIBLE, ⛔ PAS LE DESSIN. Le dessin est protégé par
     construction : le budget EST la plus courte distance du bord d'un organe peint à
     l'arête (garde 4 bis). La CIBLE, elle, descend plus bas que le dessin — `--touch`
     à 44 ne cède jamais (NORMES §0 : *« dessin et cible sont DEUX cotes »*) — et rien
     jusqu'ici ne la confrontait au contour.

     📏 CE QUE ÇA DONNE, À LA COTE QUE LA TABLE IMPOSE (375 × 500) — marge du coin le
     plus exposé de chaque cible au bord du papier :
       · les QUATRE PORTES DU PIED, celles qu'Eric craignait : BACK **23,57** ·
         TRASH **24,32** · SEND ! **28,11** · USE **32,25**. ⭐ Elles ne sont pas
         près du bord : le pied a sa marge propre de 34 depuis le 17/09.
       · les deux organes RÉELLEMENT serrés sont les glyphes de marge, et ce sont eux
         que ce garde surveille : COPIER **0,26** (cible à x = 4) et OEIL **0,97**
         (cible jusqu'à x = 371). ⚠️ Ils tiennent, mais à moins d'un blg — ⛔ et ce
         n'est pas une marge de confort, c'est une marge qu'il faut GARDER.

     ⚠️ LA COTE EST CELLE DE LA TABLE, ET C'EST UNE MESURE, PAS UNE COMMODITÉ : depuis
     le lot 240 la feuille pose `height: D.DALLE.h` sur `.x1`, donc la fiche rend 500
     et rien d'autre. Balayer des hauteurs que le produit ne peut pas rendre ferait
     rougir ce garde sur une géométrie qui n'existe pas (📏 relevé : à 360, 700 et 900
     le coin (4 · 222) de COPIER sort — trois hauteurs mortes depuis le 240). */
  const budget = budgetDuParchemin();
  const contour = ancresDu(geometrieDuParchemin(D.DALLE.l, D.DALLE.h, budget).d);
  const coinsDe = (c) => [[c.x, c.y], [c.x + c.l, c.y], [c.x, c.y + c.h], [c.x + c.l, c.y + c.h]];

  const dehors = [];
  for (const o of D.ORGANES) {
    if (!o.cible) continue;
    for (const [x, y] of coinsDe(o.cible))
      if (!dansLePolygone(contour, x, y)) dehors.push(`${o.nom} (${x} · ${y})`);
  }
  assert.deepEqual(dehors, [],
    "⛔ une zone tactile déborde le papier — le doigt tomberait sur le fond de l'application");

  /* ⚔️ ÉPROUVÉ ROUGE, ⛔ pas supposé : à budget desserré à 20 la déchirure mord plus
     creux, et QUATRE coins sortent — les deux de COPIER et les deux de l'OEIL.
     Un témoin qui ne peut jamais accuser protège sa propre docilité. */
  const large = ancresDu(geometrieDuParchemin(D.DALLE.l, D.DALLE.h, 20).d);
  let sortis = 0;
  for (const o of D.ORGANES) {
    if (!o.cible) continue;
    for (const [x, y] of coinsDe(o.cible)) if (!dansLePolygone(large, x, y)) sortis++;
  }
  assert.ok(sortis > 0,
    "⚔️ à budget desserré des cibles DOIVENT sortir du papier — sinon ce garde est aveugle");
});

test("4 quater — ⛔ LE BISEAU DE COIN NE FAIT PAS DE MARCHE : il suit la ligne moyenne", () => {
  /* 🔴 LE TROU QUE CE GARDE BOUCHE, ET IL A ÉTÉ TROUVÉ EN ÉPROUVANT LES AUTRES.
     Le lot 240 avait corrigé les douze points de biseau — posés en coordonnées
     ABSOLUES depuis l'angle, ils ne suivaient pas `m`. ⭐ La correction est juste
     dans les deux sens et le lot 243 la GARDE, mais le garde qui l'attrapait ne
     marche plus : il lisait *« aucun point DANS le rectangle »*, et un coin resté
     en absolu est désormais dedans comme tout le reste. ⚔️ Mutant passé au vert le
     21/09 — c'est ce vert-là qui a demandé ce test.

     ⭐ CE QU'IL MESURE EST UNE PROPRIÉTÉ, ⛔ PAS UNE RECOPIE DU CODE : la
     CONTINUITÉ du tracé. Les arêtes posent une ancre tous les 1,35 blg, et `ecart`
     s'éteint à leurs deux bouts (`fondu`), donc une arête arrive au coin très
     exactement sur la ligne moyenne. Si le biseau la suit, la jonction est un pas
     ordinaire ; s'il reste en absolu, elle saute de `m`.
     📏 MESURÉ aux six hauteurs : écart maximal entre deux ancres **2,35** blg quand
     le biseau suit, **5,20** quand il ne suit pas. Le seuil est posé entre les deux
     et il ne touche ni l'un ni l'autre. */
  const budget = budgetDuParchemin();
  for (const h of [360, 420, 500, 640, 700, 900]) {
    const P = ancresDu(geometrieDuParchemin(375, h, budget).d);
    let pire = 0, ou = null;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      const saut = Math.hypot(b.x - a.x, b.y - a.y);
      if (saut > pire) { pire = saut; ou = [a, b]; }
    }
    assert.ok(pire <= 3.5,
      `⛔ à ${h} de haut, le tracé saute de ${pire.toFixed(2)} blg entre deux ancres : ` +
      `le biseau de coin ne suit plus la ligne moyenne (${JSON.stringify(ou)})`);
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
  /* ⚠️ L'ANCRE A SUIVI LE SÉLECTEUR AU LOT 242 : la bleutée se déclare désormais
     `:is(.x1, .x2)[data-parchemin=…]`, parce que X2 monte le MÊME parchemin que X1 et
     doit donc porter la MÊME troisième palette. ⛔ La réparation n'était pas d'ajouter
     un second bloc pour X2 — onze teintes écrites deux fois, et le garde n'aurait plus
     vérifié que la moitié d'entre elles. ⭐ CE QUE LE GARDE DIT NE CHANGE PAS : la
     bleutée doit être COMPLÈTE, sinon la nuit fuit dessous. */
  const bleu = bloc(/:is\(\.x1, \.x2\)\[data-parchemin="party-tally"\] \{([\s\S]*?)\n\}/);
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
  assert.ok(/:is\(\.x1, \.x2\)\[data-parchemin="party-tally"\]/.test(jetons),
    "la bleutée se déclare sur les FICHES (X1 et X2), ⛔ jamais sur `:root`");
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
  /* ⚠️ L'ANCRE A SUIVI LE SÉLECTEUR AU LOT 242 : la règle est devenue
     `:is(.x1, .x2) .parchemin` le jour où X2 a monté le MÊME parchemin. ⛔ La
     réparation n'était PAS d'ajouter un second bloc `.x2 .parchemin` pour que
     cette ancre retombe sur ses pieds — ça aurait été deux écrivains pour un
     organe unique, et le garde aurait alors gardé la MOITIÉ de la vérité. */
  const debut = shell.indexOf(`${PARCH} .parchemin {`);
  assert.ok(debut > 0, "le bloc existe");
  const bloc = shell.slice(debut, shell.indexOf("}", shell.indexOf(".parchemin-fil")));
  assert.ok(!/\b(transition|animation)\s*:/.test(bloc),
    "⛔ une transition ou une animation vit dans le bloc du parchemin : elle jouerait à chaque redessin");
});
