/* ══ LE DOUBLE AFFICHAGE — les décisions d'Eric, gardées ═══════════════════
   📐 Eric, 2026-09-02, croquis `2026-09-02-double-view-belt-deroule.jpg` :
   deux panneaux du builder côte à côte, UN SEUL belt déroulé au-dessus.
   Spec : vault `FH-WEB/FHPC/FHPCv2 double affichage.md`.

   ⭐ CE QUE CE FICHIER GARDE, ET POURQUOI CHAQUE CLAUSE EXISTE : ce sont les
   quatre décisions qu'une relecture ne rattrape pas, parce qu'elles se
   trahissent SANS CASSER — un halo qui prendrait une couleur, un interrupteur
   armé dans une fenêtre qui ne le porte pas, une seconde formule de largeur,
   un prêt de cran qui ne se rend pas. Toutes ont l'air correctes dans le
   diff ; aucune ne l'est.

   ⚠️ CE QU'IL NE FAIT PAS, dit plutôt que masqué : il ne monte pas la
   coquille (elle veut un vrai DOM, un `fetch`, un `window`). La géométrie se
   regarde AU NAVIGATEUR, et elle l'a été — 375 × 812, 758 × 560 au pixel de
   la porte, 1366 × 1024, 1920 × 1080. Ce fichier garde le RAISONNEMENT. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const shellCss = lire("ui/builder/shell.css");
const shellMjs = lire("ui/builder/shell.mjs");
const tokensCss = lire("ui/builder/tokens.css");
const echelleMjs = lire("ui/builder/echelle.mjs");

/** Les règles CSS qui portent l'un des attributs du double affichage. */
function reglesPortant(css, motif) {
  const texte = stripComments(css);
  const out = [];
  for (const [, brut, corps] of texte.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    /* ⚠️ NORMALISER AVANT DE TESTER, et c'est ce garde-ci qui me l'a appris :
       le sélecteur brut porte le saut de ligne et l'indentation qui le
       précèdent, donc `/^\.app$/` ne matchait RIEN et la clause passait au
       vert en ne lisant aucune règle. Un garde qui ne lit rien ne garde rien. */
    const selecteur = brut.replace(/\s+/g, " ").trim();
    if (motif.test(selecteur)) out.push({ selecteur, corps });
  }
  return out;
}

/* ══ 1 — LE HALO EST SANS COULEUR ══════════════════════════════════════════
   Eric, 2026-09-02 : *« un halo fin autour du cran de l'écran inactif, un halo
   épais autour du cran de l'écran actif »*, et *« un halo non coloré autour de
   la dalle active »*.

   🔴 SANS COULEUR N'EST PAS UN GOÛT : le vert, le bleu et le rouge du belt
   sont une ÉCHELLE D'AVANCEMENT (NORMES §6) — rien fait · en cours · validé ·
   problème. Un halo qui emprunterait l'une de ces teintes dirait deux choses
   à la fois sur le même cran, et c'est la couleur qui gagnerait. */

const TEINTES_DE_L_ECHELLE = ["--positive", "--info", "--critical", "--caution", "--accent"];

test("🔴 le halo du double affichage n'emprunte AUCUNE teinte de l'échelle d'avancement", () => {
  const regles = [
    ...reglesPortant(shellCss, /data-vue-cran/),
    ...reglesPortant(shellCss, /\.panneau\[data-actif/)
  ];
  assert.ok(regles.length >= 3, `garde-fou de portée : ${regles.length} règles de halo trouvées, au moins 3 attendues`);
  for (const { selecteur, corps } of regles) {
    for (const teinte of TEINTES_DE_L_ECHELLE) {
      assert.ok(!corps.includes(teinte),
        `\`${selecteur}\` emprunte ${teinte} — le halo dit OÙ ON REGARDE, l'échelle dit OÙ ON EN EST (NORMES §6)`);
    }
    assert.ok(corps.includes("--spy-halo"),
      `\`${selecteur}\` doit porter --spy-halo, le jeton neutre du 27/08 — encre le jour, lueur la nuit`);
  }
});

test("⚔️ ATTAQUE — la clause mord : un halo repeint en --positive la fait rougir", () => {
  /* Un garde jamais attaqué n'est pas un garde : on lui montre la violation
     exacte qu'il existe pour refuser, sur du CSS synthétique. */
  const faux = `[data-vue-cran="actif"] { filter: drop-shadow(0 0 3px var(--positive)); }`;
  const regles = reglesPortant(faux, /data-vue-cran/);
  assert.equal(regles.length, 1, "le lecteur doit voir la règle fautive");
  assert.ok(regles[0].corps.includes("--positive"), "et il doit voir la teinte interdite dedans");
  assert.ok(!regles[0].corps.includes("--spy-halo"), "et l'absence du jeton neutre");
});

test("🔴 `--spy-halo` est L'ENCRE le jour et LE BLANC la nuit — jamais une teinte propre", () => {
  /* ⛔ NOMMER UN JETON « HALO » NE LE REND PAS NEUTRE : c'est la leçon du
     violet d'attunement (NORMES §7) — j'avais lu `--accent` et écrit « pas du
     violet » sans lire `#845933`. On lit la VALEUR.

     📏 ET LA MESURE A CORRIGÉ MA PREMIÈRE ÉCRITURE, qui exigeait R = V = B :
     le halo du JOUR vaut `rgba(45, 44, 42, .45)`, c'est-à-dire `--text`
     (`#2d2c2a`) — l'encre du parchemin, très légèrement chaude. NORMES le dit
     déjà en toutes lettres : *« la nuit c'est une lueur, le jour une lueur
     blanche sur parchemin clair serait invisible — le halo s'y fait
     d'encre »*. Exiger trois canaux égaux aurait donc refusé le jeton
     RATIFIÉ. ⭐ La bonne question n'est pas « est-il gris ? » mais
     « emprunte-t-il une teinte à lui ? » — et la réponse tient en deux
     égalités. */
  const jour = tokensCss.match(/--spy-halo:\s*rgba\((\d+),\s*(\d+),\s*(\d+)/);
  const encre = tokensCss.match(/^\s\s--text:\s*#([0-9a-f]{6});/m);
  assert.ok(jour && encre, "les deux jetons doivent être lisibles dans tokens.css");
  const attendu = [0, 2, 4].map((i) => parseInt(encre[1].slice(i, i + 2), 16));
  assert.deepEqual(jour.slice(1, 4).map(Number), attendu,
    "le halo du JOUR est exactement l'encre du thème — pas une couleur de plus dans la palette");
  const nuit = tokensCss.match(/--spy-halo:\s*rgba\(255,\s*255,\s*255/);
  assert.ok(nuit, "et celui de la NUIT est le blanc pur — la lueur qu'Eric a demandée le 27/08");
  for (const teinte of TEINTES_DE_L_ECHELLE) {
    assert.ok(!new RegExp(`--spy-halo:[^;]*${teinte}`).test(tokensCss),
      `le halo ne se dérive pas de ${teinte} — deux sens sur le même signal`);
  }
});

test("🔴 IL N'Y A QUE DEUX ÉPAISSEURS DE HALO, et le FIN est plus fin que l'ÉPAIS", () => {
  /* ⚠️ TROISIÈME DÉFAUT DE LA MÊME FAMILLE, relevé le 02/09 : les gardes
     tenaient la COULEUR du halo et rien d'autre. Or l'épaisseur est
     exactement ce qui distingue l'actif de l'inactif — une main qui les
     égaliserait effacerait la distinction sans qu'aucune couleur ne bouge, et
     aucune suite ne rougirait.
     ⛔ Et le code en posait TROIS (2px, 3px, 6px+2px) pendant que la spec en
     déclarait deux. Une cote hors spec est une cote indéfendable. */
  const tokens = stripComments(tokensCss);
  const fin = tokens.match(/--halo-fin:\s*(\d+(?:\.\d+)?)px/);
  const epais = tokens.match(/--halo-epais:\s*(\d+(?:\.\d+)?)px/);
  assert.ok(fin && epais, "les deux épaisseurs sont NOMMÉES dans les jetons");
  assert.ok(Number(fin[1]) < Number(epais[1]),
    `le fin (${fin[1]}px) doit rester plus fin que l'épais (${epais[1]}px) — c'est TOUTE la distinction`);
  /* Et aucun des trois porteurs ne réécrit une épaisseur en littéral. */
  const porteurs = [
    ...reglesPortant(shellCss, /data-vue-cran/),
    ...reglesPortant(shellCss, /\.panneau\[data-actif/)
  ];
  assert.equal(porteurs.length, 3, "trois porteurs : le cran passif, le cran actif, le panneau actif");
  for (const { selecteur, corps } of porteurs) {
    assert.ok(!/\d+px/.test(corps),
      `\`${selecteur}\` écrit une épaisseur en dur — les trois lisent les deux jetons, et rien d'autre`);
  }
});

test("🔴 le halo du PANNEAU est borné à la vue double — sinon il ne désigne rien", () => {
  /* 📏 CONFIRMÉ À L'ÉCRAN avant correction (375 × 812) : un seul panneau
     visible, et `box-shadow` pourtant peint. Un halo qui marque l'actif
     quand il n'y a pas d'« autre » est du bruit sur les dix écrans. */
  const porteurs = reglesPortant(shellCss, /\.panneau\[data-actif/);
  assert.equal(porteurs.length, 1, "un seul porteur pour le halo du panneau");
  assert.match(porteurs[0].selecteur, /^:root\[data-vue="double"\]/,
    "il se pose sous la condition de la vue double, comme les deux épaisseurs du belt");
});

/* ══ 2 — L'INTERRUPTEUR EST GRISÉ SOUS LA PORTE ════════════════════════════
   Proposition de l'architecte, écrite en « À TRANCHER » dans la spec : le
   double affichage n'est offert que si la fenêtre porte deux panneaux à une
   échelle ≥ 1 (758 × 560 px, mesuré).

   ⛔ NI CACHÉ NI RETIRÉ : un réglage qui disparaît laisse croire qu'il
   n'existe pas. C'est la même loi que le `Done` gris de NORMES §6 — *« le
   joueur doit pouvoir lire ce qu'il n'a pas encore fait »*. */

test("🚪 l'interrupteur `Double view` est PRÉSENT, éteint et DÉSARMÉ sous la porte", () => {
  const universe = lire("ui/builder/universe-step.mjs");
  assert.match(universe, /vueBascule\.disabled\s*=\s*!possible/,
    "sous la porte, il est désarmé — jamais retiré du DOM");
  assert.match(universe, /vueBascule\.dataset\.actif\s*=\s*String\(vueEtat && possible\)/,
    "et il s'affiche ÉTEINT : une préférence gardée mais inapplicable ne doit pas s'annoncer allumée");
  assert.match(universe, /too small for two panels/,
    "et il DIT pourquoi il dort — le gris seul dirait « éteint », pas « pas ici »");
});

test("🚪 le gris du désarmé est `--text-muted`, le jeton ratifié le 26/08", () => {
  const regle = reglesPortant(shellCss, /\.universe-bascule:disabled/);
  assert.equal(regle.length, 1, "une seule règle pour l'état désarmé");
  assert.match(regle[0].corps, /--text-muted/,
    "⛔ pas `--border-strong` (4,09 / 3,73 — hors bande) : le gris lisible du 26/08");
});

test("🚪 la porte se calcule là où l'échelle est connue, jamais dans un `@media`", () => {
  /* NORMES §0 bis : *« jamais un `@media` de largeur — il ne se réévalue pas
     sous zoom »*. La porte est un seuil de PLACE : elle vit dans `echelle.mjs`
     avec les deux autres. */
  assert.match(echelleMjs, /export function laPlaceDuDouble\(/,
    "la porte est exportée par le module de l'échelle");
  assert.match(echelleMjs, /echelleQuiTient\([^)]*,\s*2\)\s*>=\s*1/,
    "et elle demande ce que rendraient DEUX colonnes, pas ce que rend la vue courante");
  const css = stripComments(shellCss) + stripComments(tokensCss);
  assert.ok(!/@media[^{]*\b(min|max)-width/.test(css),
    "aucune requête média de largeur n'a été ajoutée par ce lot");
});

/* ══ 3 — UNE SEULE FORMULE DE LARGEUR ══════════════════════════════════════
   NORMES §1 ter : *« une cote de contenant ne s'écrit pas, elle se déduit
   d'avance »*. La largeur de l'app vaut `--panneau-l × --colonnes + --sp-8 ×
   (--colonnes − 1)` — à une colonne comme à deux. */

test("🔴 la largeur de l'app se DÉDUIT du compte de colonnes, en une seule règle", () => {
  const regles = reglesPortant(shellCss, /^\.app$/);
  assert.equal(regles.length, 1, "une seule règle habille `.app`");
  const corps = regles[0].corps;
  assert.match(corps, /width:\s*calc\([^;]*var\(--panneau-l\)[^;]*var\(--colonnes\)/,
    "la largeur multiplie le panneau par le compte de colonnes");
  assert.match(corps, /var\(--sp-8\)/, "et ajoute la gouttière du dépôt, jamais un 8 littéral");
  assert.ok(!/\b\d+px\b/.test(corps.replace(/\*\s*1px/g, "")),
    "⛔ aucune cote en pixels écrite en dur dans `.app`");
});

test("🔴 `--colonnes` vaut 1 par défaut et n'est porté à 2 QUE par `data-vue`", () => {
  const texte = stripComments(tokensCss);
  const declarations = [...texte.matchAll(/--colonnes:\s*([^;]+);/g)].map((m) => m[1].trim());
  assert.deepEqual(declarations, ["1", "2"],
    "deux déclarations exactement : le défaut, et le double — un troisième régime serait une vue que personne n'a demandée");
  assert.match(texte, /:root\[data-vue="double"\]\s*\{\s*--colonnes:\s*2;\s*\}/,
    "le 2 vit sous `data-vue=\"double\"`, l'attribut que `shell.mjs` pose sur `<html>`");
});

test("⚠️ la GRANDEUR mesure le panneau, l'ÉCHELLE mesure l'app — nommer le témoin", () => {
  /* 🔴 LES CONFONDRE FERAIT BASCULER TOUT LE BUILDER en grandeur « moyenne »
     le jour où l'on ouvre un second panneau (758 ≥ 720), alors qu'aucun écran
     n'a gagné un pixel. C'est la décision du 31/08, et elle ne bouge pas. */
  assert.match(echelleMjs, /grandeurDe\(cotesDeLApp\(html\)\.panneau\)/,
    "la grandeur lit `.panneau` — la place d'UN dessin, 375 blg, toujours");
  assert.match(echelleMjs, /const p = cotesDeLApp\(racine, colonnes\);[\s\S]{0,120}p\.largeur/,
    "l'échelle lit `.largeur` — ce qui doit tenir dans la fenêtre");
});

/* ══ 4 — LE MÉCANISME : DES ATTRIBUTS, ET UN PRÊT QUI SE REND ══════════════ */

test("🔴 le panneau PASSIF est inerte, et son capteur est la seule porte", () => {
  assert.match(shellMjs, /panneau\.contenu\.inert = !actif/,
    "le contenu du passif est `inert` : ni clic, ni focus clavier, ni lecteur d'écran");
  assert.match(shellMjs, /panneau\.eveil\.hidden = actif/,
    "et son capteur d'éveil n'existe que là — sinon aucun chemin clavier vers le second panneau");
  /* ⛔ ET L'INERTIE N'EST PAS SUR LE PANNEAU : le capteur vit dedans, une
     inertie posée plus haut l'emporterait avec elle. */
  assert.ok(!/panneau\.racine\.inert/.test(shellMjs),
    "l'inertie porte sur le CONTENU, jamais sur le panneau — le capteur y vit");
});

test("🔴 le prêt de cran se REND toujours — `finally`, jamais une remise en fin de corps", () => {
  /* ⛔ CE QUE ÇA COÛTERAIT SANS : un écran qui jetterait pendant son rendu
     laisserait le builder entier sur le cran du panneau PASSIF — c'est-à-dire
     que le `Done` du joueur signerait la mauvaise étape. */
  const corps = shellMjs.match(/function rendreLEcranDe\(index\)\s*\{[\s\S]*?\n\}/);
  assert.ok(corps, "`rendreLEcranDe` doit être lisible d'un coup d'œil");
  assert.match(corps[0], /finally\s*\{\s*Object\.assign\(state, avant\);\s*\}/,
    "le cran emprunté se rend dans un `finally`");
});

test("🔴 le belt commande l'ACTIF, et les deux crans ne se superposent jamais", () => {
  /* Eric : *« si je clique sur le belt, c'est l'élément actif qui bouge »*. */
  const corps = shellMjs.match(/function goToStep\(index\)\s*\{[\s\S]*?\n\}/);
  assert.ok(corps, "`goToStep` doit être lisible d'un coup d'œil");
  assert.match(corps[0], /state\.stepSecond = state\.step/,
    "viser le cran du passif fait ÉCHANGER les deux — le passif ne cède pas sa place, sinon les deux montreraient le même écran");
  assert.match(shellMjs, /state\.stepSecond === state\.step\)\s*state\.stepSecond = cranSecondParDefaut\(\)/,
    "et l'allumage rattrape le cas où les deux crans coïncideraient déjà");
});

test("🔴 la vue se règle AVANT l'échelle — l'ordre EST la moitié du mécanisme", () => {
  /* ⚠️ `appliquerEchelle` lit `--colonnes`, que `data-vue` gouverne. Poser la
     vue après le calcul ferait tenir le facteur d'une app de 375 à une app de
     758 : le panneau déborderait de la fenêtre d'un facteur deux. */
  assert.match(shellMjs, /function surRedimensionnement\(\)\s*\{\s*reglerLaVue\(\);\s*appliquerEchelle\(\);\s*refresh\(\);\s*\}/,
    "au redimensionnement : la vue, l'échelle, le rendu — dans cet ordre");
  const regler = shellMjs.match(/function reglerLaVue\(\)\s*\{[\s\S]*?\n\}/);
  assert.ok(regler, "`reglerLaVue` doit être lisible d'un coup d'œil");
  assert.match(regler[0], /if \(document\.documentElement\.dataset\.vue !== avant\) appliquerEchelle\(\)/,
    "et l'échelle se rejoue exactement quand la vue a CHANGÉ, jamais à chaque repeinte");
});
