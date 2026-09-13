/* ══ LE GARDE DES DEUX PORTES DU DÉCOR — lot 205, 2026-09-13 ═════════════

   ⚖️ ERIC, 13/09 : *« Abilities ne marche toujours pas. »*
   ⚠️ ET IL FAUT LE DIRE FRANCHEMENT ICI AUSSI : je ne reproduis PAS sa panne.
   Mon banc — Chromium + swiftshader, WebGL allumé — pose les six scores sans
   broncher. Ce garde ne prétend donc rien réparer : il ferme DEUX portes
   restées ouvertes après le lot 203, et qui sont fautives en elles-mêmes.

   ══ PORTE ① — UN DÉCOR N'EST JAMAIS `draggable` ═════════════════════════

   📏 MESURÉ APRÈS LE LOT 203 (512 × 900, WebGL, Abilities → 4D6 → Flash), les
   DOUZE images que le moteur avait fabriquées :

       img.fh-cd-static-snap ×12    pointer-events: none ✅   draggable: TRUE ⛔

   Le 203 a bien empêché le navigateur de VISER l'image ; il ne lui a pas
   retiré la propriété d'être déplaçable. Une image décorative que le
   navigateur peut arracher est un défaut, `pointer-events` ou pas.

   ══ PORTE ② — UNE SURFACE DE GESTE NE SE SÉLECTIONNE PAS ════════════════

   📏 MESURÉ EN DÉCOUVRANT LES SURFACES ARMÉES PAR LE GESTE (un `pointerdown` +
   `pointermove` sur chaque élément peint, on garde ceux qui répondent — jamais
   une liste écrite) :
       identity ...... 12 × `.glisse-jeton` ............. user-select: none ✅
       boosts SRD .... 2 × `.glisse-jeton` .............. user-select: none ✅
       boosts FH ..... 1 × `.glisse-creneau` rempli ..... user-select: none ✅
       4D6 ........... 6 × `.fs-de` ..................... user-select: none ✅

   ⭐ AUCUNE SURFACE ARMÉE N'ÉTAIT DONC À `auto`, ET C'EST CE QUI RENDAIT LA
   SITUATION TROMPEUSE : la règle tenait par QUATRE déclarations recopiées à la
   main, une par famille d'organe, qui se trouvaient couvrir les quatre appels
   d'`armerJeton`. Une coïncidence entretenue à la main — le cinquième organe
   armé n'aurait rien reçu, et rien ne l'aurait dit.
   ⭐⭐ CE GARDE TIENT DONC LA FORME, PAS LE COMPTE : `armerJeton` pose la
   marque, la feuille lit la marque, et personne d'autre n'écrit cette règle. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const UI = join(dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const lire = (f) => stripComments(readFileSync(join(UI, f), "utf8"));
const DICE = lire("dice3d.mjs");
const SHELL = lire("shell.css");

const { decorInerte } = await import("../ui/builder/dice3d.mjs");
const { armerJeton, renderChoixGlisses } = await import("../ui/builder/glisser.mjs");

/* ══ ① LE DÉCOR ══════════════════════════════════════════════════════════ */

/** Toute fabrication d'image du module — les TROIS formes qu'un module a de
 *  faire naître une image, cherchées ensemble : un garde qui n'en connaîtrait
 *  qu'une déclarerait « zéro » le jour où on change de forme. */
function fabricationsDImage(source) {
  const out = [];
  for (const m of source.matchAll(/([A-Za-z_$][\w$]*)\s*=\s*document\.createElement\(\s*["']img["']\s*\)/g))
    out.push({ forme: "createElement", nom: m[1], index: m.index });
  for (const m of source.matchAll(/([A-Za-z_$][\w$]*)\s*=\s*new\s+Image\s*\(/g))
    out.push({ forme: "new Image", nom: m[1], index: m.index });
  for (const m of source.matchAll(/innerHTML\s*[+]?=\s*[^;]*<img/g))
    out.push({ forme: "innerHTML", nom: null, index: m.index });
  return out;
}

test("① a — témoin : `dice3d.mjs` fabrique bien une image (sinon ce garde ne garde rien)", () => {
  const faites = fabricationsDImage(DICE);
  assert.ok(faites.length >= 1,
    "⛔ le moteur ne fabrique plus d'image : ou le chemin instantané a disparu, ou ce garde a cessé de le voir");
  assert.ok(faites.some((f) => f.forme === "createElement"),
    "témoin — c'est bien `mountSnapshot` qui construit l'`<img>` du chemin instantané");
});

test("① b — CHAQUE image fabriquée est désarmée à sa naissance", () => {
  const faites = fabricationsDImage(DICE);
  const nues = faites.filter((f) => {
    if (!f.nom) return true; /* une image écrite en HTML ne peut pas être désarmée : elle est nue par construction */
    const suite = DICE.slice(f.index, f.index + 400);
    return !new RegExp(`decorInerte\\(\\s*${f.nom}\\s*\\)`).test(suite);
  });
  assert.deepEqual(nues.map((f) => `${f.forme} → ${f.nom}`), [],
    "⛔ une image de décor que le navigateur peut arracher est un défaut, `pointer-events` ou pas");
});

test("① c — ⚔️ ATTAQUE : une image neuve, fabriquée sans être désarmée, est NOMMÉE", () => {
  const faux = DICE + '\n  var badge=document.createElement("img");badge.src="x";\n';
  const nues = fabricationsDImage(faux).filter((f) => {
    if (!f.nom) return true;
    const suite = faux.slice(f.index, f.index + 400);
    return !new RegExp(`decorInerte\\(\\s*${f.nom}\\s*\\)`).test(suite);
  });
  assert.equal(nues.length, 1, "l'image ajoutée sans désarmement est vue");
  assert.equal(nues[0].nom, "badge",
    "⭐ et elle est NOMMÉE : un compte juste ne dirait pas laquelle");
});

test("① d — la loi, ÉPROUVÉE SUR UN VRAI NŒUD : la propriété ET l'attribut", () => {
  /* ⚠️ IL EN FAUT DEUX, ET CE N'EST PAS UNE CEINTURE : la PROPRIÉTÉ est ce que
     le navigateur consulte quand il décide d'ouvrir son glisser ; l'ATTRIBUT
     est ce qu'un `cloneNode`, un `outerHTML` et un garde peuvent LIRE. L'un
     sans l'autre laisse la moitié de la porte ouverte. */
  const image = document.createElement("img");
  assert.notEqual(image.draggable, false,
    "témoin — une image NEUVE n'est pas désarmée d'elle-même, sinon cette loi n'aurait rien à faire");
  const rendu = decorInerte(image);
  assert.equal(image.draggable, false, "la propriété que le navigateur consulte");
  assert.equal(image.getAttribute("draggable"), "false", "l'attribut que tout le monde peut lire");
  assert.equal(rendu, image, "la loi rend le nœud, pour s'écrire sur la ligne qui le crée");
  assert.doesNotThrow(() => decorInerte(null), "⛔ et elle ne jette pas sur rien : un décor absent n'est pas une panne");
});

/* ══ ② LA SURFACE DU GESTE ═══════════════════════════════════════════════ */

/** La marque, lue sur un organe RÉELLEMENT armé — jamais recopiée du code. */
function marqueDe(noeud) {
  return noeud.getAttribute("data-glissable");
}

test("② a — armer un organe le DÉCLARE : la marque est posée par le geste", () => {
  const n = document.createElement("button");
  assert.equal(marqueDe(n), null, "témoin — un bouton nu ne se déclare rien");
  armerJeton(n, { onTap: () => {}, onDepot: () => {} });
  assert.equal(marqueDe(n), "true",
    "⭐ c'est l'ARMEMENT qui parle à la feuille, plus la feuille qui devine qui est armé");
});

test("② b — tout organe armé d'un `renderChoixGlisses` porte la marque, et lui seul", () => {
  /* ⭐ On ne nomme aucune classe : on rend un bloc à collecteur rempli, on joue
     un vrai glisser sur CHAQUE nœud, et on compare « qui répond au geste » à
     « qui porte la marque ». Les deux ensembles doivent être le MÊME. */
  const bloc = renderChoixGlisses({
    plan: { status: "pending", answered: 1, expected: 2 },
    slots: [
      { path: "x[0]", index: 0, options: ["a", "b"], selected: ["a"] },
      { path: "x[1]", index: 1, options: ["a", "b"], selected: [] }
    ],
    titre: "Ability boosts", mot: "Ability", rangee: "caracs",
    labelOf: (id) => id, onAction: () => {}
  });
  document.body.append(bloc);
  const repondent = [], marques = [];
  for (const n of bloc.querySelectorAll("*")) {
    if (marqueDe(n) === "true") marques.push(n);
    document.elementFromPoint = () => null;
    try {
      n.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
      document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 40, pointerId: 1 });
    } catch { /* ne pas répondre EST la réponse */ }
    if (document.body.querySelectorAll(".glisse-fantome").length) repondent.push(n);
    document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 40, pointerId: 1 });
  }
  bloc.remove();
  assert.ok(repondent.length >= 2,
    `témoin — le bloc doit avoir au moins deux organes armés (jeton + collecteur rempli), vu ${repondent.length}`);
  /* ⭐ TOUT CE QUI RÉPOND PORTE LA MARQUE — c'est le sens utile de la loi : la
     feuille ne peut pas rater une surface où un geste part. */
  const sansMarque = repondent.filter((n) => marqueDe(n) !== "true");
  assert.deepEqual(sansMarque.map((n) => n.className), [],
    "⛔ un organe qui répond au geste sans porter la marque est une surface où la sélection peut démarrer");
  /* ⚠️ ET L'ÉCART INVERSE EST NOMMÉ, PAS TOLÉRÉ EN SILENCE : un jeton ÉTEINT
     est armé (il le redeviendra) mais refuse l'appui — `armerJeton` sort sur
     `jeton.disabled`. Le garde exige donc que TOUT surplus s'explique par ce
     refus-là, et par aucun autre. Une marque posée ailleurs serait une règle de
     style appliquée à un organe qui n'est pas une surface de geste. */
  const enPlus = marques.filter((n) => !repondent.includes(n));
  assert.deepEqual(enPlus.filter((n) => !n.disabled).map((n) => n.className), [],
    "⛔ marqué, muet, et pas éteint : la marque a été posée ailleurs que par l'armement");
  assert.ok(enPlus.length >= 1 && enPlus.every((n) => n.disabled),
    "témoin — le vivier contient bien un jeton ÉTEINT, armé mais silencieux : c'est ce cas qui distingue les deux ensembles");
});

test("② c — la feuille ne déclare `user-select: none` QUE sur la marque : un seul écrivain", () => {
  /* 🔴 « RÉPARER = SUPPRIMER LE SECOND ÉCRIVAIN. » Le garde n'énumère aucun
     organe : il lit toutes les règles de la feuille qui coupent la sélection et
     exige qu'elles visent la MARQUE. Quatre copies, c'était quatre écrivains
     qui pouvaient diverger — et un cinquième organe sans écrivain du tout. */
  const coupent = [];
  for (const [, sel, corps] of SHELL.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/(?:^|[;\s])(?:-webkit-)?user-select\s*:\s*none/.test(corps)) continue;
    coupent.push(sel.replace(/\s+/g, " ").trim());
  }
  assert.ok(coupent.length >= 1, "témoin — la coupure de sélection existe bien quelque part");
  const horsMarque = coupent.filter((s) => !/\[data-glissable(=|\])/.test(s));
  assert.deepEqual(horsMarque, [],
    "⛔ un second écrivain : cette règle-là coupe la sélection sans passer par l'armement, donc elle peut en oublier un");
});

/** Les sélecteurs de la feuille qui déclarent une propriété à une valeur. */
function declarent(source, propriete, valeur) {
  const out = [];
  for (const [, sel, corps] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!new RegExp(`(?:^|[;\\s])${propriete}\\s*:\\s*${valeur}\\s*(?:;|$)`).test(corps)) continue;
    out.push(sel.replace(/\s+/g, " ").trim());
  }
  return out;
}

test("② f — ⚔️ LA LIGNE DONT DÉPEND LE GESTE AU DOIGT N'A QU'UN ÉCRIVAIN — lot 206", () => {
  /* ══ 🔴 POURQUOI CE GARDE N'EXISTAIT PAS AU 205, ET POURQUOI IL EXISTE ICI ══
     Le 205 a déplacé `user-select` sur la marque et a LAISSÉ `touch-action` en
     quatre copies, en écrivant pourquoi : *« c'est LA ligne qui rend le geste
     possible sur mobile — la déplacer se mesure sur un vrai iPad, pas au banc »*.
     ⭐ LA CONDITION A ÉTÉ TENUE : iPad Pro 11 pouces, iOS 26.5, Safari, vrais
     événements tactiles — les trois sens du glisser (podium → carac, carac →
     carac, carac → podium) traversent avec la marque pour seul écrivain.
     ⚠️ ET LA PEUR QUI RESTAIT A ÉTÉ MESURÉE, PAS ARBITRÉE : on craignait de
     couper le défilement sur un créneau VIDE (une zone morte de 144 × 48 px).
     Le cas n'existe pas — l'`armerJeton` du créneau est sous `if (choisi)` dans
     `glisser.mjs`, donc un créneau vide n'est jamais armé et ne porte jamais la
     marque. C'est le garde ② h, plus bas, qui le tient sur la donnée. */
  const coupent = declarent(SHELL, "touch-action", "none");
  assert.ok(coupent.length >= 1, "témoin — la règle qui rend le geste possible au doigt existe bien");
  const horsMarque = coupent.filter((s) => !/\[data-glissable(=|\])/.test(s));
  assert.deepEqual(horsMarque, [],
    "⛔ un second écrivain : cette règle-là verrouille le défilement sans passer par l'armement, donc elle peut en oublier un");
});

test("② g — ⚔️ ATTAQUE : une copie de `touch-action` écrite à la main est NOMMÉE", () => {
  const faux = SHELL + "\n.mon-organe-glissant { touch-action: none; }\n";
  const hors = declarent(faux, "touch-action", "none").filter((s) => !/\[data-glissable(=|\])/.test(s));
  assert.deepEqual(hors, [".mon-organe-glissant"],
    "⭐ NOMMÉE, pas comptée — et c'est ce qui manquait au cinquième organe armé");
});

test("② h — ⚔️ UN CRÉNEAU VIDE N'EST PAS ARMÉ : la zone morte que le 205 craignait n'existe pas", () => {
  /* ⭐ SUR LA DONNÉE, PAS SUR LE SOURCE : on rend un bloc avec un créneau REMPLI
     et un créneau VIDE, et on demande à chacun s'il porte la marque. Lire
     `if (choisi)` dans le code aurait été lire une intention ; ceci lit le
     résultat. C'est la différence qui autorise le déplacement du ② f. */
  const bloc = renderChoixGlisses({
    plan: { status: "pending", answered: 1, expected: 2 },
    slots: [
      { path: "y[0]", index: 0, options: ["a", "b"], selected: ["a"] },
      { path: "y[1]", index: 1, options: ["a", "b"], selected: [] }
    ],
    titre: "Ability boosts", mot: "Ability", labelOf: (id) => id, onAction: () => {}
  });
  document.body.append(bloc);
  const creneaux = [...bloc.querySelectorAll(".glisse-creneau")];
  const remplis = creneaux.filter((c) => c.getAttribute("data-rempli") === "true");
  const vides = creneaux.filter((c) => c.getAttribute("data-rempli") !== "true");
  assert.ok(remplis.length >= 1 && vides.length >= 1,
    `témoin — il faut un créneau de chaque pour que ce garde tranche (rempli ${remplis.length}, vide ${vides.length})`);
  assert.deepEqual(remplis.filter((c) => marqueDe(c) !== "true").map((c) => c.className), [],
    "⛔ un créneau REMPLI est une source de glisser : sans la marque, le doigt qui en part fait défiler (Eric, 19/08)");
  assert.deepEqual(vides.filter((c) => marqueDe(c) === "true").map((c) => c.className), [],
    "⛔ un créneau VIDE marqué perdrait son défilement pour rien : on paierait un bug par un autre");
  bloc.remove();
});

test("② d — ⚔️ ATTAQUE : une cinquième copie écrite à la main est NOMMÉE", () => {
  const faux = SHELL + "\n.mon-organe { -webkit-user-select: none; user-select: none; }\n";
  const hors = [];
  for (const [, sel, corps] of faux.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/(?:^|[;\s])(?:-webkit-)?user-select\s*:\s*none/.test(corps)) continue;
    const s = sel.replace(/\s+/g, " ").trim();
    if (!/\[data-glissable(=|\])/.test(s)) hors.push(s);
  }
  assert.deepEqual(hors, [".mon-organe"],
    "⭐ NOMMÉE, pas comptée : la leçon du total juste dont le contenu est faux");
});

test("② e — le FANTÔME ne porte aucun attribut du geste : il n'est pas armé, il EST le glissé", () => {
  /* 🔵 La loi du lot 203 étendue à la marque du 205 : un attribut décrit ce
     qu'un élément EST. Le clone n'est ni armé ni en train d'être glissé. */
  const bloc = renderChoixGlisses({
    plan: { status: "pending", answered: 0, expected: 2 },
    slots: [
      { path: "x[0]", index: 0, options: ["a", "b"], selected: [] },
      { path: "x[1]", index: 1, options: ["a", "b"], selected: [] }
    ],
    titre: "x", mot: "Choice", labelOf: (id) => id, onAction: () => {}
  });
  document.body.append(bloc);
  const jeton = bloc.querySelectorAll(".glisse-jeton")[0];
  assert.equal(jeton.getAttribute("data-glissable"), "true", "témoin — l'original, lui, est bien armé");
  document.elementFromPoint = () => null;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 40, pointerId: 1 });

  const fantome = bloc.querySelectorAll(".glisse-fantome")[0];
  assert.ok(fantome, "sonde — le fantôme existe, sinon ce garde ne garde rien");
  assert.equal(fantome.getAttribute("data-glissable"), null, "la copie ne se dit pas armée");
  assert.equal(fantome.getAttribute("data-glisse"), null, "ni en train d'être glissée (lot 203)");
  assert.equal(jeton.getAttribute("data-glisse"), "true", "⭐ et le geste appartient bien à l'ORIGINAL");
  document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 40, pointerId: 1 });
  bloc.remove();
});
