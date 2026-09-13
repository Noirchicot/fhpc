/* ══ LE GARDE DU FANTÔME HORS DU FLUX — lot 205, 2026-09-13 ══════════════

   ⚖️ ERIC, 13/09 : *« Pour les abilities boost le retour de token sur son
   origine, le fantôme n'est plus carré, par contre tout est bleu durant le
   process. »* (le bleu, c'est le lot 204 — il marche.)

   📏 CE QUE LE BANC A DIT, ET C'EST LA MESURE QUI FONDE CE GARDE. Site en
   ligne v628, Chromium 512 × 900 AVEC WebGL (`--use-gl=swiftshader
   --enable-unsafe-swiftshader --ignore-gpu-blocklist`), « Ability boosts »,
   les QUATRE gestes, dans LES DEUX PILES (Fate's Hand et SRD) :

       geste                        fantôme PEINT     `width` calculée   classe du clone
       aller   vivier→collecteur     67,13 × 65,53     49,16px    ✅     glisse-jeton  glisse-fantome
       retour  collecteur→vivier    512,00 × 65,53    375px       ⛔     glisse-creneau glisse-fantome
       creneau→creneau              512,00 × 65,53    375px       ⛔     glisse-creneau glisse-fantome
       lâché dans le vide           512,00 × 65,53    375px       ⛔     glisse-creneau glisse-fantome

   ⭐ LA CAUSE N'EST PAS UNE CLASSE OUBLIÉE, C'EST UNE PHRASE MAL ADRESSÉE. Un
   collecteur REMPLI est lui-même armé — c'est ainsi qu'on ressort un jeton
   (Eric, 19/08 : *« on annule en ressortant l'objet »*) — donc le clone du
   retour est un `.glisse-creneau`. La cascade, LUE au navigateur et non
   supposée, lui donnait :
       `.choix-glisse .glisse-creneau` (0,2,0) ...... width: 100%  ← gagnait
       `.glisse-fantome` (0,1,0) .................... width: var(--case-vive)
   `width: 100%` veut dire *« la largeur de ta CELLULE »*. Un fantôme est
   `position: fixed` : il n'a pas de cellule, son bloc conteneur est la
   FENÊTRE — 100 % valait 375 blg, la largeur sacrée, soit 512 px peints.
   ⛔ ET LE JETON N'EN RÉCHAPPAIT PAS PAR MÉRITE : `.glisse-jeton.glisse-fantome`
   pèse (0,2,0) comme la recette, et se trouve écrite plus bas dans le fichier.
   Une égalité tranchée par l'ordre des lignes, pas une loi.

   ⭐⭐ D'OÙ LA RÉPARATION, ET CE GARDE EN TIENT LA FORME : on ne monte pas la
   voix du fantôme sur un second sélecteur — `.glisse-creneau.glisse-fantome`
   aurait fermé CE cas et laissé dehors le troisième organe armé de demain.
   On cesse de dire *« remplis ta cellule »* à ce qui n'a pas de cellule. La
   cote du fantôme reste déclarée UNE FOIS, chez lui, et n'a plus d'adversaire.

   📏 APRÈS, MESURÉ AU MÊME BANC (quatre gestes × deux piles, captures
   regardées) : écart de largeur **0,00 px** partout sauf un **−0,01** (SRD,
   collecteur→collecteur) ; écart de hauteur **0,00 px** partout. La tolérance
   demandée était 3 px.

   ⚖️ CE QUE CE GARDE N'AFFIRME PAS : il ne mesure aucun pixel — le dépôt n'a
   pas de moteur de mise en page. Il tient la MÉCANIQUE qui produit les pixels
   (qui est saisissable, et quelle déclaration GAGNE pour son clone) ; les
   pixels sont le relevé daté ci-dessus. Deux regards, pas un. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const lire = (f) => stripComments(fs.readFileSync(path.join(UI, f), "utf8"));
const FEUILLES = [["shell.css", lire("shell.css")], ["listes.css", lire("listes.css")]];

const { renderChoixGlisses } = await import("../ui/builder/glisser.mjs");

/* ══ ① LA CASCADE, RÉSOLUE — PAS DEVINÉE ═════════════════════════════════
   🔴 POURQUOI RÉSOUDRE ET NON CHERCHER UN SÉLECTEUR. Chercher
   « `.glisse-fantome` déclare-t-il `--case-vive` ? » répond OUI même quand une
   autre règle le bat — c'est exactement la panne du 13/09, où la feuille
   annonçait la bonne cote et la page en peignait une autre. Un garde qui ne
   regarde que la déclaration qu'il aime ne peut jamais accuser.
   ⭐ On modélise donc l'arbre RÉEL du fantôme — une copie montée en enfant
   DIRECT de son `.choix-glisse` (lot 204) — et on demande à la cascade qui
   gagne : poids d'abord, ordre des lignes ensuite. */

/** Les règles d'une feuille, un sélecteur par entrée, dans l'ordre du fichier. */
function reglesDe(nom, css) {
  const out = [];
  for (const [, sel, corps] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const propre = sel.replace(/\s+/g, " ").trim();
    if (propre.startsWith("@") || !propre) continue;
    for (const un of propre.split(",")) out.push({ feuille: nom, sel: un.trim(), corps, rang: out.length });
  }
  return out;
}

/** La valeur d'une propriété dans un corps de règle — `null` si absente. */
function declaration(corps, prop) {
  const m = corps.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`));
  return m ? m[1].trim() : null;
}

/** Le poids d'un sélecteur : [classes+attributs+pseudo-classes, éléments].
 *  ⚠️ `:not(X)` / `:has(X)` / `:is(X)` ne pèsent PAS eux-mêmes : ils pèsent ce
 *  qu'on met dedans — la règle de la spécification, et c'est elle qui fait que
 *  `:not(.glisse-fantome)` monte la recette de (0,2,0) à (0,3,0). */
function poids(sel) {
  let b = 0, c = 0;
  let reste = sel;
  for (const [, dedans] of sel.matchAll(/:(?:not|is|has|where)\(([^()]*)\)/g)) {
    if (!/^:where/.test(sel)) { const [pb, pc] = poids(dedans); b += pb; c += pc; }
  }
  reste = reste.replace(/:(?:not|is|has|where)\([^()]*\)/g, "");
  b += (reste.match(/\.[A-Za-z0-9_-]+/g) || []).length;
  b += (reste.match(/\[[^\]]*\]/g) || []).length;
  reste = reste.replace(/\.[A-Za-z0-9_-]+/g, "").replace(/\[[^\]]*\]/g, "");
  b += (reste.match(/:[A-Za-z-]+/g) || []).length;
  c += (reste.replace(/:[A-Za-z-]+/g, "").match(/[A-Za-z][A-Za-z0-9_-]*/g) || []).length;
  return [b, c];
}

/** Un nœud du modèle : `{ tag, classes, attrs }`. */
const noeud = (tag, classes, attrs = {}) => ({ tag, classes, attrs });

/** Un composé (`button.glisse-jeton[data-x="y"]:not(.z)`) mord-il ce nœud ? */
function composeMord(compose, n, inconnus) {
  let reste = compose;
  for (const [tout, dedans] of compose.matchAll(/:not\(([^()]*)\)/g)) {
    if (composeMord(dedans, n, inconnus)) return false;
    reste = reste.replace(tout, "");
  }
  for (const [tout, nom, , val] of reste.matchAll(/\[([A-Za-z0-9_-]+)(=("([^"]*)"|[^\]]*))?\]/g)) {
    if (!(nom in n.attrs)) return false;
    if (val !== undefined && n.attrs[nom] !== val) return false;
    reste = reste.replace(tout, "");
  }
  for (const cls of reste.match(/\.[A-Za-z0-9_-]+/g) || []) {
    if (!n.classes.includes(cls.slice(1))) return false;
  }
  reste = reste.replace(/\.[A-Za-z0-9_-]+/g, "");
  /* ⚠️ TOUT CE QUE JE NE MODÉLISE PAS EST NOMMÉ, JAMAIS IGNORÉ EN SILENCE :
     une pseudo-classe d'état (`:hover`, `:disabled`…) ou un `:has()` que ce
     garde ne sait pas juger deviendrait un concurrent invisible. */
  for (const pseudo of reste.match(/::?[A-Za-z-]+(\([^()]*\))?/g) || []) {
    inconnus.push(pseudo);
    reste = reste.replace(pseudo, "");
  }
  const tag = reste.trim();
  if (tag && tag !== "*" && tag !== n.tag) return false;
  return true;
}

/** Le sélecteur mord-il la FEUILLE de la chaîne (`chaine[0]` = la racine) ? */
function selecteurMord(sel, chaine, inconnus) {
  const morceaux = sel.trim().split(/\s+/);
  let i = chaine.length - 1;
  let attendDirect = false;
  for (let k = morceaux.length - 1; k >= 0; k--) {
    const m = morceaux[k];
    if (m === ">") { attendDirect = true; continue; }
    if (k === morceaux.length - 1) {
      if (!composeMord(m, chaine[i], inconnus)) return false;
      i -= 1; attendDirect = false; continue;
    }
    if (attendDirect) {
      if (i < 0 || !composeMord(m, chaine[i], inconnus)) return false;
      i -= 1; attendDirect = false; continue;
    }
    let trouve = false;
    while (i >= 0) { if (composeMord(m, chaine[i], inconnus)) { trouve = true; i -= 1; break; } i -= 1; }
    if (!trouve) return false;
  }
  return true;
}

/** Qui gagne `prop` sur la feuille de cette chaîne — et contre qui. */
function gagnant(chaine, prop) {
  const inconnus = [];
  const candidats = [];
  let rang = 0;
  for (const [nom, css] of FEUILLES) {
    for (const r of reglesDe(nom, css)) {
      rang += 1;
      const v = declaration(r.corps, prop);
      if (v === null) continue;
      if (!selecteurMord(r.sel, chaine, inconnus)) continue;
      candidats.push({ ...r, valeur: v, rang, p: poids(r.sel) });
    }
  }
  const trie = [...candidats].sort((a, b) =>
    (a.p[0] - b.p[0]) || (a.p[1] - b.p[1]) || (a.rang - b.rang));
  return { vainqueur: trie[trie.length - 1] || null, candidats, inconnus };
}

/* ══ ② CE QUI EST SAISISSABLE — DÉCOUVERT PAR LE GESTE, JAMAIS NOMMÉ ══════
   ⭐ La liste des organes armés ne s'écrit pas ici : on rend un vrai bloc, on
   joue un vrai glisser sur CHACUN de ses nœuds, et on garde ceux qui font
   naître un fantôme. Un troisième organe armé demain entre tout seul. */

const planDe = () => ({ status: "pending", answered: 1, expected: 2 });
const slotsDe = () => ([
  { path: "x[0]", index: 0, options: ["a", "b"], selected: ["a"] },
  { path: "x[1]", index: 1, options: ["a", "b"], selected: [] }
]);

function tenterLeGeste(n) {
  document.elementFromPoint = () => null;
  try {
    n.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
    document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 40, pointerId: 1 });
  } catch { /* un nœud qui ne répond pas n'est pas armé : c'est la réponse */ }
  const f = document.body.querySelectorAll(".glisse-fantome")[0] || null;
  const classe = f ? String(f.className) : null;
  document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 40, pointerId: 1 });
  return classe;
}

/** Les classes de clone que ce bloc sait produire — par le geste. */
function clonesDuBloc() {
  const bloc = renderChoixGlisses({
    plan: planDe(), slots: slotsDe(), titre: "Ability boosts", mot: "Ability",
    rangee: "caracs", labelOf: (id) => id, onAction: () => {}
  });
  document.body.append(bloc);
  const vues = new Set();
  for (const n of bloc.querySelectorAll("*")) {
    const classe = tenterLeGeste(n);
    if (classe) vues.add(classe);
  }
  bloc.remove();
  return [...vues];
}

/** La chaîne modélisée d'un clone : son bloc, puis lui. */
function chaineDuClone(classe) {
  return [
    noeud("SECTION", ["choix-glisse"], { "data-rangs": "caracs", "data-dense": "6" }),
    noeud("BUTTON", classe.split(/\s+/), { "aria-hidden": "true" })
  ];
}

/* ══ 1 — LE TÉMOIN : LE BLOC PRODUIT BIEN PLUS D'UN CLONE ════════════════ */

test("1 — deux organes du même bloc sont saisissables, et le geste le DIT", () => {
  const clones = clonesDuBloc();
  assert.ok(clones.length >= 2,
    `témoin — un bloc à collecteur rempli doit savoir produire au moins deux clones, vu : ${JSON.stringify(clones)}`);
  assert.ok(clones.some((c) => /\bglisse-jeton\b/.test(c)), "le jeton du vivier est saisissable");
  assert.ok(clones.some((c) => /\bglisse-creneau\b/.test(c)),
    "⭐ ET LE COLLECTEUR REMPLI AUSSI — c'est le geste d'annulation d'Eric, et c'est lui que le lot 204 n'avait pas vu");
  for (const c of clones) assert.match(c, /\bglisse-fantome\b/, "tout clone se nomme fantôme");
});

/* ══ 2 — LA LOI : LE FANTÔME A LA BOÎTE DE CE QU'IL COPIE, QUOI QU'IL COPIE */

test("2 — pour CHAQUE chose saisissable, la cascade donne au fantôme `--case-vive` et `--glisse-h`", () => {
  const clones = clonesDuBloc();
  for (const classe of clones) {
    const chaine = chaineDuClone(classe);
    const l = gagnant(chaine, "width");
    assert.deepEqual(l.inconnus, [], `⚠️ sélecteur non modélisé rencontré pour «${classe}» — ce garde ne doit rien ignorer en silence`);
    assert.ok(l.vainqueur, `témoin — une déclaration de largeur doit gagner pour «${classe}»`);
    assert.match(l.vainqueur.valeur, /var\(\s*--case-vive\s*\)/,
      `⛔ «${classe}» — la largeur gagnante est « ${l.vainqueur.valeur} » posée par « ${l.vainqueur.sel} » (${l.vainqueur.feuille}) ; 512 px peints pour une case de 67 le 13/09`);
    const h = gagnant(chaine, "height");
    assert.ok(h.vainqueur && /var\(\s*--glisse-h\s*\)/.test(h.vainqueur.valeur),
      `«${classe}» — la hauteur du fantôme est celle du gabarit`);
  }
});

test("2 bis — le garde SAIT accuser : la recette de la cellule est bien un concurrent, et elle PERD", () => {
  /* 🔴 « UN GARDE QUI NE PEUT JAMAIS ACCUSER EST LE PIRE. » On vérifie donc
     que `width: 100%` est bien dans la course pour l'ORGANE EN FLUX (il doit
     y être, c'est lui qui remplit la cellule) et qu'il n'y est PLUS pour le
     clone. Si la recette disparaissait du fichier, ce test tomberait — et on
     saurait que le vert du test 2 ne prouve plus rien. */
  const enFlux = [
    noeud("SECTION", ["choix-glisse"], { "data-rangs": "caracs" }),
    noeud("DIV", ["glisse-creneaux"], {}),
    noeud("BUTTON", ["glisse-creneau"], { "data-rempli": "true" })
  ];
  const course = gagnant(enFlux, "width");
  assert.ok(course.candidats.some((c) => /100%/.test(c.valeur)),
    "témoin — « remplis ta cellule » existe bien, et vise l'organe POSÉ DANS UNE RANGÉE");

  const clone = gagnant(chaineDuClone("glisse-creneau glisse-fantome"), "width");
  assert.equal(clone.candidats.filter((c) => /100%/.test(c.valeur)).length, 0,
    "⛔ et elle ne s'adresse PLUS au clone : un fantôme n'a pas de cellule à remplir");
});

test("2 ter — ⚔️ ATTAQUE : la recette rendue au clone, et le fantôme du RETOUR reprend l'écran entier", () => {
  /* On remet le texte d'avant le lot 205 — la recette sans son `:not()` — et
     on redemande à la cascade. ⛔ Si elle ne rougit pas, c'est que la loi du
     test 2 tient par autre chose que par cette réparation. */
  const mute = FEUILLES.map(([nom, css]) => [nom,
    css.replace(/\.choix-glisse \.glisse-jeton:not\(\.glisse-fantome\),\s*\.choix-glisse \.glisse-creneau:not\(\.glisse-fantome\)/,
      ".choix-glisse .glisse-jeton,\n.choix-glisse .glisse-creneau")]);
  assert.notEqual(mute[0][1], FEUILLES[0][1], "témoin — la mutation a bien mordu sur le texte de la feuille");

  const sauve = FEUILLES.splice(0, FEUILLES.length, ...mute);
  try {
    for (const classe of ["glisse-creneau glisse-fantome", "glisse-jeton glisse-fantome"]) {
      const l = gagnant(chaineDuClone(classe), "width");
      const cent = l.candidats.filter((c) => /100%/.test(c.valeur));
      assert.equal(cent.length, 1, `⚔️ «${classe}» — la recette redevient un concurrent du clone`);
    }
    /* ⭐ ET LE CRÉNEAU LA LAISSE GAGNER — c'est LUI que la panne d'Eric visait.
       Le jeton, lui, s'en sortait par l'ordre des lignes : une égalité de
       poids tranchée par la position dans le fichier, pas une loi. */
    const creneau = gagnant(chaineDuClone("glisse-creneau glisse-fantome"), "width");
    assert.match(creneau.vainqueur.valeur, /100%/,
      "⚔️ ROUGE ATTENDU : sans la réparation, le clone du RETOUR reprend la largeur de la fenêtre (375 blg = 512 px peints, mesuré)");
  } finally { FEUILLES.splice(0, FEUILLES.length, ...sauve); }
});

/* ══ 3 — LE REPLI : HORS D'UN BLOC, LA COTE EXISTE ENCORE ════════════════ */

test("3 — un clone monté HORS d'un `.choix-glisse` garde une cote (le repli du socle)", () => {
  /* ⚠️ `fantomeLever` retombe sur `.app` puis `<body>` quand le jeton n'a plus
     de bloc (garde 3 bis du lot 204). Là, aucune recette de cellule ne mord —
     mais la déclaration du fantôme, elle, doit toujours mordre, sinon la
     largeur serait `auto`, c'est-à-dire la largeur du MOT. */
  for (const classe of ["glisse-jeton glisse-fantome", "glisse-creneau glisse-fantome"]) {
    const chaine = [noeud("DIV", ["app"], {}), noeud("BUTTON", classe.split(/\s+/), {})];
    const l = gagnant(chaine, "width");
    assert.ok(l.vainqueur && /var\(\s*--case-vive\s*\)/.test(l.vainqueur.valeur),
      `«${classe}» hors bloc — la cote reste déclarée (repli du socle : --case-vive = --glisse-case)`);
  }
});
