/* ══ LE GARDE DU GLISSER-DÉPOSER — lot 79, étape 2 ═══════════════════════
   🔴 CE GARDE EXISTE PARCE QUE LE GESTE N'A PAS D'AUTRE JUGE. Un organe qui
   ne se vérifie qu'à l'œil dans un navigateur est un organe qu'on casse sans
   le savoir — et celui-ci vit sous le doigt d'Eric, sur un appareil que la
   suite ne voit jamais.

   CE QU'IL TIENT, et chaque ligne vient d'une décision, pas d'un goût :
     1. le TAP tombe dans le premier créneau LIBRE (Eric, 16/08 : « on peut
        construire les 2 en même temps ») ;
     2. le GLISSER tombe dans le créneau VISÉ, pas dans le premier — c'est
        toute la différence entre les deux gestes ;
     3. ce qui les départage est une DISTANCE (`SEUIL_GLISSER`), pas une
        cible : sous le seuil, un glisser tremblé reste un tap ;
     4. un glisser relâché DANS LE VIDE ne fait rien — annuler doit être
        possible en cours de geste ;
     5. l'action émise est celle du QCM, au mot près : le moteur ne doit pas
        pouvoir distinguer un choix tapé, glissé ou coché.

   ⚠️ CE QU'IL NE TIENT PAS, ET QUI SE REGARDE : que le créneau visé
   s'allume, que le jeton pâlisse, que `touch-action: none` empêche la scène
   de défiler sous le doigt. Ce sont des faits de peinture — ils vivent dans
   la feuille, et le navigateur seul peut les dire. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
globalThis.document = createTestDocument();

const { renderChoixGlisses, armerJeton } = await import("../ui/builder/glisser.mjs");

/* Deux créneaux, trois options — la forme exacte de `class.skills` d'un
   Fighter, en plus petit. `selected` est un TABLEAU, comme `decisions[]` le
   publie : le lot 79 a payé une erreur pour l'avoir supposé scalaire. */
const planDe = (a = 0) => ({ status: a ? "pending" : "pending", answered: a, expected: 2 });
const slotsDe = (s0 = [], s1 = []) => ([
  { path: "class.skills[0]", index: 0, options: ["athletics", "history", "insight"], selected: s0 },
  { path: "class.skills[1]", index: 1, options: ["athletics", "history", "insight"], selected: s1 }
]);

function ecran(slots, actions, plan = planDe()) {
  return renderChoixGlisses({
    plan, slots, titre: "Class skills", mot: "Choice",
    labelOf: (id) => id.toUpperCase(), onAction: (a) => actions.push(a)
  });
}
const jetons = (n) => n.querySelectorAll(".glisse-jeton");
const creneaux = (n) => n.querySelectorAll(".glisse-creneau");

/** Un geste complet : appui, déplacement (facultatif), relâchement. La cible
 *  du dépôt est injectée par `document.elementFromPoint`, comme le navigateur
 *  la donnerait. */
function geste(jeton, { dx = 0, dy = 0, cible = null, maintenir = false } = {}) {
  document.elementFromPoint = () => cible;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "touch" });
  if (maintenir) horloge.ecouler();     // le doigt a attendu : le jeton se soulève
  if (dx || dy) jeton.dispatchEvent({ type: "pointermove", clientX: dx, clientY: dy, pointerId: 1 });
  jeton.dispatchEvent({ type: "pointerup", clientX: dx, clientY: dy, pointerId: 1 });
}

/* ══ L'HORLOGE — lot 79, étape 3 ═════════════════════════════════════════
   ⭐ LE MAINTIEN EST UNE DURÉE, ET UNE DURÉE SE PILOTE OU NE SE TESTE PAS.
   Attendre vraiment 350 ms par cas rendrait ce garde lent ET dépendant de la
   charge de la machine — deux façons de le rendre inutile. `setTimeout` est
   ici ce que `elementFromPoint` est plus haut : une API de navigateur que le
   test FOURNIT, pour pouvoir dire « le doigt a attendu » à la milliseconde.
   ⛔ Elle ne remplace pas le vrai délai : `MAINTIEN_MS` reste dans l'organe,
   et c'est l'appareil d'Eric qui juge s'il est bien réglé. */
const horloge = (() => {
  const attendus = new Map();
  let suivant = 0;
  globalThis.setTimeout = (fn) => { attendus.set(++suivant, fn); return suivant; };
  globalThis.clearTimeout = (id) => { attendus.delete(id); };
  return {
    ecouler() { const tous = [...attendus.values()]; attendus.clear(); for (const fn of tous) fn(); },
    enAttente() { return attendus.size; }
  };
})();

/** Une grille : mêmes plans, même contrat, `grille: true` en plus. */
function ecranGrille(slots, actions, plan = planDe()) {
  return renderChoixGlisses({
    plan, slots, titre: "Cantrips", mot: "Cantrip", grille: true,
    labelOf: (id) => id.toUpperCase(), onAction: (a) => actions.push(a)
  });
}

/* ══ 1 — LE RENDU VIENT DU PLAN, JAMAIS D'UN NOMBRE ÉCRIT ICI ═══════════ */

test("1 — le vivier porte les options du plan, les créneaux viennent des slots", () => {
  const n = ecran(slotsDe(), []);
  assert.deepEqual(jetons(n).map((b) => b.getAttribute("data-valeur")), ["athletics", "history", "insight"]);
  assert.equal(creneaux(n).length, 2, "deux slots publiés, deux créneaux — jamais `expected` en dur");
  assert.equal(n.querySelectorAll(".choix-glisse-compte")[0].textContent, "0 of 2 chosen");
});

test("1 bis — une option DÉJÀ POSÉE est désactivée, pas « enfoncée »", () => {
  /* ⭐ La distinction n'est pas cosmétique : un bouton à état devrait annoncer
     le sien (`aria-pressed`, garde du lot 57). Celui-ci n'a pas d'état — son
     option est AILLEURS, dans un créneau. `disabled` le dit sans mentir. */
  const n = ecran(slotsDe(["history"]), []);
  const h = jetons(n).find((b) => b.getAttribute("data-valeur") === "history");
  assert.equal(h.disabled, true);
  assert.equal(h.getAttribute("aria-pressed"), null, "aucun état annoncé : il n'en a pas");
  assert.equal(jetons(n).filter((b) => b.disabled).length, 1, "les deux autres restent prenables");
});

/* ══ 2 — LES DEUX GESTES ════════════════════════════════════════════════ */

test("2 — le TAP tombe dans le premier créneau LIBRE", () => {
  const actions = [];
  const n = ecran(slotsDe(), actions);
  geste(jetons(n)[1]);                                   // « history », sans bouger
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[0]", value: "history" }]);
});

test("2 bis — le TAP saute les créneaux déjà remplis", () => {
  const actions = [];
  const n = ecran(slotsDe(["athletics"]), actions);
  geste(jetons(n)[1]);
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[1]", value: "history" }],
    "le premier créneau est pris : le tap va au suivant, il n'écrase rien");
});

test("2 ter — tous les créneaux pleins : le tap ne fait RIEN", () => {
  const actions = [];
  const n = ecran(slotsDe(["athletics"], ["history"]), actions);
  geste(jetons(n)[2]);                                   // « insight », le seul encore actif
  assert.deepEqual(actions, [], "⛔ remplacer un choix au hasard serait pire que ne rien faire");
});

test("3 — le GLISSER tombe dans le créneau VISÉ, pas dans le premier", () => {
  const actions = [];
  const n = ecran(slotsDe(), actions);
  const second = creneaux(n)[1];
  geste(jetons(n)[0], { dx: 40, dy: 0, cible: second });
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[1]", value: "athletics" }],
    "c'est TOUTE la différence entre les deux gestes : le glisser désigne sa case");
});

test("3 bis — sous le seuil, un glisser tremblé reste un TAP", () => {
  const actions = [];
  const n = ecran(slotsDe(), actions);
  geste(jetons(n)[0], { dx: 3, dy: 2, cible: creneaux(n)[1] });   // 3,6 px : sous les 6
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[0]", value: "athletics" }],
    "⭐ un doigt n'est jamais immobile — le seuil est ce qui rend le tap fiable");
});

test("3 ter — relâché DANS LE VIDE, le glisser ne fait rien", () => {
  const actions = [];
  const n = ecran(slotsDe(), actions);
  geste(jetons(n)[0], { dx: 40, dy: 0, cible: null });
  assert.deepEqual(actions, [], "annuler doit rester possible en cours de geste");
});

test("3 quater — un jeton désactivé n'arme aucun geste", () => {
  const actions = [];
  const n = ecran(slotsDe(["athletics"]), actions);
  geste(jetons(n)[0], { dx: 40, dy: 0, cible: creneaux(n)[1] });
  assert.deepEqual(actions, []);
});

/* ══ 3 bis — 🧊 LA GRILLE ET SON MAINTIEN ONT ÉTÉ RETIRÉS (2026-08-20) ═══
   Eric : *« le glisser partout ! »* · *« il ne faut plus d'ascenseurs couplés
   avec des actions drag and drop »*.

   🔴 CE QUE CES QUATRE CAS TENAIENT, ET POURQUOI ILS N'ONT PLUS D'OBJET. Dans
   une grille qui DÉFILE, les cases pavent la boîte : `touch-action: none` la
   rendait indéfilable au doigt, donc le défilement gagnait par défaut et le
   glisser se prenait au MAINTIEN (350 ms). Le partage était invisible à l'œil
   — et c'est exactement ce qu'Eric a constaté sur son téléphone : le glisser
   « marche dans species elf, il ne marche pas dans le wizard ».

   ⭐ L'ASCENSEUR PARTI, LA CAUSE EST PARTIE AVEC. Ces gardes sont donc
   RÉÉCRITS À LA NOUVELLE VÉRITÉ, jamais désarmés : ce qu'ils vérifient
   maintenant, c'est qu'AUCUN écran ne réclame de traitement particulier, et
   qu'aucun vivier ne redevienne un conteneur défilant en douce. */

test("7 — le geste est le MÊME sur tous les viviers : un doigt qui bouge POSE", () => {
  /* ⛔ CE CAS DISAIT L'INVERSE JUSQU'AU 20/08 (« un doigt qui bouge avant le
     maintien ne pose rien »), et c'était juste TANT QUE la grille défilait.
     Aujourd'hui un déplacement est un glisser, partout, sans péage. */
  const actions = [];
  const n = ecran(slotsDe(), actions);
  geste(jetons(n)[0], { dx: 0, dy: 40, cible: creneaux(n)[1] });
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[1]", value: "athletics" }],
    "plus de maintien à payer : le jeton se lève dès le premier pixel");
});

test("7 bis — le TAP pose toujours dans le premier créneau libre", () => {
  /* Le chemin court n'a jamais dépendu du maintien : il ne change pas. */
  const actions = [];
  const n = ecran(slotsDe(), actions);
  geste(jetons(n)[0]);
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[0]", value: "athletics" }]);
});

test("7 ter — AUCUNE horloge n'est armée par un geste (le maintien est bien parti)", () => {
  /* ⚔️ LE GARDE QUI EMPÊCHE LE PÉAGE DE REVENIR SANS QU'ON LE VOIE. Un
     `setTimeout` réapparu dans l'organe rendrait le glisser conditionnel à une
     durée — le défaut même qu'Eric a signalé. L'horloge du banc compte : si
     quelque chose s'y met en attente, c'est qu'un délai est revenu. */
  const actions = [];
  const n = ecran(slotsDe(), actions);
  geste(jetons(n)[0], { dx: 0, dy: 40, cible: creneaux(n)[1] });
  assert.equal(horloge.enAttente(), 0, "aucun minuteur : le geste est immédiat");
});

test("8 — AUCUN vivier ne défile pour son compte, et aucun ne porte de classe à part", () => {
  /* 🔴 LE GARDE D'ERIC, 2026-08-20 : *« il ne faut plus d'ascenseurs couplés
     avec des actions drag and drop »*. Un vivier qui redeviendrait un
     conteneur défilant reprendrait le conflit entre défiler et glisser, et
     ferait revenir le péage pour le résoudre. On vérifie donc les DEUX signes :
     le marqueur que le socle lirait, et la classe qui portait la fenêtre. */
  for (const n of [ecran(slotsDe(), []), ecran(slotsDe(["athletics"]), [])]) {
    for (const v of n.querySelectorAll(".glisse-vivier")) {
      assert.equal(v.getAttribute("data-scroller"), null,
        "un vivier ne se déclare plus conteneur défilant");
      assert.equal(v.className, "glisse-vivier",
        "un vivier est un vivier — plus de variante qui lui donnerait une fenêtre");
    }
  }
});

/* ══ 11 — LES TROIS RAPPELS DU FANTÔME (Eric, 16/08 : « je veux voir
   l'image du dé qui se déplace ») ═══════════════════════════════════════
   ⭐ L'ORGANE NE DESSINE RIEN, IL DIT. Le fantôme appartient à l'écran qui le
   veut ; ce qui se partage, c'est le MOMENT — lever, bouger, poser. */

test("11 — l'organe DIT le geste : lever une fois, bouger à chaque pas, poser une fois", () => {
  const trace = [];
  const n = ecran(slotsDe(), []);
  const jeton = jetons(n)[0];
  /* ⚠️ On rejoue le geste À LA MAIN plutôt que par `geste()` : ce test a
     besoin de PLUSIEURS déplacements pour prouver que `onLever` ne part
     qu'une fois quand `onBouger` en part trois. */
  document.elementFromPoint = () => creneaux(n)[1];
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  jeton.dispatchEvent({ type: "pointermove", clientX: 20, clientY: 0, pointerId: 1 });
  jeton.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 1 });
  jeton.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 0, pointerId: 1 });
  assert.deepEqual(trace, [], "sans rappels, rien n'est appelé — et rien ne casse");

  const t2 = [];
  const n2 = renderChoixGlisses({
    plan: planDe(), slots: slotsDe(), titre: "x", mot: "Choice",
    labelOf: (id) => id, onAction: () => {}
  });
  /* On arme un jeton neuf avec les rappels, directement : c'est le contrat
     que `armerJeton` publie, et il se teste sans passer par un écran. */
  const brut = document.createElement("button");
  armerJeton(brut, {
    onTap: () => t2.push("tap"), onDepot: () => t2.push("depot"),
    onLever: () => t2.push("lever"), onBouger: () => t2.push("bouger"), onPoser: () => t2.push("poser")
  });
  document.elementFromPoint = () => creneaux(n2)[0];
  brut.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  brut.dispatchEvent({ type: "pointermove", clientX: 20, clientY: 0, pointerId: 1 });
  brut.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 1 });
  brut.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 0, pointerId: 1 });
  assert.deepEqual(t2, ["lever", "bouger", "bouger", "poser", "depot"],
    "un seul lever, un bouger par pas, et le fantôme se range AVANT que le dépôt soit décidé");
});

test("11 bis — ⚔️ un geste ANNULÉ range le fantôme aussi : rien ne survit au geste", () => {
  /* 🔴 UN FANTÔME QUI SURVIT À SON GESTE EST PIRE QUE PAS DE FANTÔME : il
     reste collé à l'écran, sous le doigt, et plus rien ne l'enlève. */
  const trace = [];
  const brut = document.createElement("button");
  armerJeton(brut, {
    onTap: () => {}, onDepot: () => trace.push("depot"),
    onLever: () => trace.push("lever"), onPoser: () => trace.push("poser")
  });
  document.elementFromPoint = () => null;          // relâché dans le vide
  brut.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  brut.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 1 });
  brut.dispatchEvent({ type: "pointercancel", clientX: 40, clientY: 0, pointerId: 1 });
  assert.deepEqual(trace, ["lever", "poser"], "levé puis rangé, et AUCUN dépôt");
});

test("11 ter — un TAP ne lève aucun fantôme (il n'y a rien à faire voler)", () => {
  const trace = [];
  const brut = document.createElement("button");
  armerJeton(brut, {
    onTap: () => trace.push("tap"), onDepot: () => {},
    onLever: () => trace.push("lever"), onPoser: () => trace.push("poser")
  });
  document.elementFromPoint = () => null;
  brut.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  brut.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
  assert.deepEqual(trace, ["tap"], "sous le seuil, le fantôme n'existe jamais");
});

/* ══ 11 quater — LE FANTÔME VISE, PAS LE DOIGT ═══════════════════════════
   Eric, 2026-08-16 au soir : *« c'est ce même fantôme que je dois placer dans
   la cible, pas mon doigt »*. Le décalage seul serait de la peinture ; ce qui
   le rend VRAI est que le point interrogé change avec lui.

   🔴 CE GARDE EXISTE PARCE QUE LA PANNE SERAIT MUETTE : sans `viseur`, tout
   continue de fonctionner — un créneau s'allume, un dé se pose — simplement
   pas celui que le joueur recouvre. Aucune erreur, aucun symptôme au test,
   juste un geste qui ment de 34 px en diagonale. */

test("11 quater — ⚔️ `viseur` déplace le POINT INTERROGÉ, et le seuil reste au doigt", () => {
  const vus = [];
  const brut = document.createElement("button");
  const cible = { closest: () => ({ dataset: { creneau: "abilities.str" } }) };
  const deposes = [];
  armerJeton(brut, {
    onTap: () => deposes.push("tap"), onDepot: (c) => deposes.push(c),
    viseur: (x, y) => [x - 34, y - 34]
  });
  document.elementFromPoint = (x, y) => { vus.push([x, y]); return cible; };
  brut.dispatchEvent({ type: "pointerdown", clientX: 100, clientY: 200, pointerId: 1, button: 0, pointerType: "touch" });
  brut.dispatchEvent({ type: "pointermove", clientX: 140, clientY: 200, pointerId: 1 });
  brut.dispatchEvent({ type: "pointerup", clientX: 140, clientY: 200, pointerId: 1 });
  assert.deepEqual(vus, [[106, 166], [106, 166]],
    "en vol comme au dépôt : le point visé est celui du fantôme, jamais celui du doigt");
  assert.deepEqual(deposes, ["abilities.str"], "et le dépôt part bien de ce point-là");
});

test("11 quinquies — sans `viseur`, RIEN ne bouge : c'est le doigt qui vise", () => {
  /* ⛔ Le rappel est FACULTATIF, comme les trois autres. Les écrans qui ne
     dessinent pas de fantôme (les compétences, étape 2) ne doivent pas payer
     un décalage qu'ils n'ont pas demandé. */
  const vus = [];
  const brut = document.createElement("button");
  armerJeton(brut, { onTap: () => {}, onDepot: () => {} });
  document.elementFromPoint = (x, y) => { vus.push([x, y]); return null; };
  brut.dispatchEvent({ type: "pointerdown", clientX: 100, clientY: 200, pointerId: 1, button: 0, pointerType: "touch" });
  brut.dispatchEvent({ type: "pointermove", clientX: 140, clientY: 200, pointerId: 1 });
  brut.dispatchEvent({ type: "pointerup", clientX: 140, clientY: 200, pointerId: 1 });
  assert.deepEqual(vus, [[140, 200], [140, 200]], "le point de contact, à l'octet");
});

/* ══ 10 — TAP POUR L'INFO, GLISSER POUR CHOISIR (Eric, 16/08 au soir) ════
   *« j'avais prévu tap pour info, drag and drop to select ; sur desktop clic
   droit info, gauche select »*. Quatre cas, deux appareils — et un seul
   endroit où ça se décide. Ces gardes existent parce qu'une inversion ici
   ne se verrait pas : les deux gestes RENDENT quelque chose, simplement pas
   la bonne chose. */

/** Un tap avec l'outil qu'on nomme — le pointeur DIT ce qu'il est. */
function tap(jeton, pointerType) {
  document.elementFromPoint = () => null;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType });
  jeton.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
}

test("10 — AU DOIGT, le tap donne l'info et ne pose RIEN", () => {
  const actions = []; const vus = [];
  const n = renderChoixGlisses({
    plan: planDe(), slots: slotsDe(), titre: "Cantrips", mot: "Cantrip", grille: true,
    labelOf: (id) => id, onAction: (a) => actions.push(a), onInfo: (id) => vus.push(id)
  });
  tap(jetons(n)[0], "touch");
  assert.deepEqual(vus, ["athletics"], "le croquis l'écrit sous la grille : « Tap on cantrip for info »");
  assert.deepEqual(actions, [], "⛔ et il ne choisit pas en même temps — un geste, un effet");
});

test("10 bis — À LA SOURIS, le clic gauche POSE (le pointeur est précis, rien à lever)", () => {
  const actions = []; const vus = [];
  const n = renderChoixGlisses({
    plan: planDe(), slots: slotsDe(), titre: "Cantrips", mot: "Cantrip", grille: true,
    labelOf: (id) => id, onAction: (a) => actions.push(a), onInfo: (id) => vus.push(id)
  });
  tap(jetons(n)[0], "mouse");
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[0]", value: "athletics" }]);
  assert.deepEqual(vus, [], "l'info, à la souris, est sur le clic DROIT");
});

test("10 ter — le clic DROIT donne l'info, et mange le menu du navigateur", () => {
  const vus = []; let empeche = false;
  const n = renderChoixGlisses({
    plan: planDe(), slots: slotsDe(), titre: "Cantrips", mot: "Cantrip", grille: true,
    labelOf: (id) => id, onAction: () => {}, onInfo: (id) => vus.push(id)
  });
  jetons(n)[1].dispatchEvent({ type: "contextmenu", preventDefault: () => { empeche = true; } });
  assert.deepEqual(vus, ["history"]);
  assert.equal(empeche, true,
    "un menu contextuel par-dessus la fiche n'est pas une réponse à « qu'est-ce que ce sort ? »");
});

test("10 quater — SANS `onInfo`, rien ne bouge : l'écran des compétences garde son tap", () => {
  /* 🔴 LA DIVERGENCE EST VOULUE, ET ELLE EST BORNÉE. Le mandat l'annonçait
     (§6.5) : le tap prend l'INFO sur les grilles de sorts et garde la
     SÉLECTION sur les compétences. Ce garde est ce qui empêche la décision
     du soir de déborder sur l'écran livré à l'étape 2. */
  const actions = [];
  const n = ecran(slotsDe(), actions);
  tap(jetons(n)[0], "touch");
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[0]", value: "athletics" }]);
  assert.equal(n.querySelectorAll(".glisse-grille").length, 0, "et ce n'est pas une grille");
});

/* ══ 4 — LE CONTRAT D'ACTION EST CELUI DU QCM ═══════════════════════════ */

test("4 — avec `refKind`, le geste pose un `choose` de record, comme le QCM", () => {
  /* 🔴 LE MOTEUR NE DOIT PAS POUVOIR DISTINGUER un choix tapé, glissé ou
     coché. Si cette forme divergeait, `renderSlotQcm` et cet organe
     écriraient deux documents différents pour le même geste. */
  const actions = [];
  const n = renderChoixGlisses({
    plan: planDe(), slots: slotsDe(), titre: "Cantrips", mot: "Cantrip",
    refKind: "spell", labelOf: (id) => id, onAction: (a) => actions.push(a)
  });
  geste(jetons(n)[0]);
  assert.deepEqual(actions, [{
    kind: "choose", path: "class.skills[0]", ref: { kind: "spell", id: "athletics" }
  }]);
});

test("5 — ⛔ TAPER UN CRÉNEAU NE VIDE PLUS RIEN : on annule en ressortant l'objet", () => {
  /* 🔴 RÈGLE RETOURNÉE PAR ERIC LE 2026-08-19, et sa raison est une PRÉVISION,
     pas un goût : *« clic annule : non, car si on implémente le clic point A /
     clic point B = A va sur B, ça va foutre la merde »*. Le jour où le tap
     sert à DÉSIGNER une cible, un tap qui vide aussi rendrait le même geste
     ambigu selon l'état de la case. On ne construit pas une porte qu'il faudra
     murer.

     ⭐ CE QUI REMPLACE : glisser le contenu HORS de son récepteur le rend au
     vivier — le geste inverse du dépôt, que personne n'a à apprendre. */
  const actions = [];
  const n = ecran(slotsDe(["athletics"]), actions);
  creneaux(n)[0].click();
  assert.deepEqual(actions, [], "un clic sur un créneau rempli ne vide plus rien");
  creneaux(n)[1].click();
  assert.deepEqual(actions, [], "et un créneau vide n'a jamais rien fait");
});

test("5 bis — glisser le contenu HORS de son récepteur le vide", () => {
  const actions = [];
  const n = ecran(slotsDe(["athletics"]), actions);
  const rempli = creneaux(n)[0];
  /* Un glisser franc (au-delà du seuil), relâché sur AUCUNE cible. */
  rempli.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  rempli.dispatchEvent({ type: "pointermove", clientX: 400, clientY: 400, pointerId: 1 });
  rempli.dispatchEvent({ type: "pointerup", clientX: 400, clientY: 400, pointerId: 1 });
  assert.deepEqual(actions, [{ kind: "clear", path: "class.skills[0]" }],
    "le geste inverse du dépôt rend l'objet au vivier");
});

test("6 — ⚔️ ATTAQUE : sans slots, l'organe rend `null` — jamais un cadre vide", () => {
  assert.equal(renderChoixGlisses({ plan: planDe(), slots: [], titre: "x" }), null);
  assert.equal(renderChoixGlisses({ plan: null, slots: slotsDe(), titre: "x" }), null,
    "sans plan, rien — le « faux magasin » que ce dépôt interdit");
});

/* ══ 13 — LA PAGINATION DU VIVIER — NORMES.md §5 ═════════════════════════
   🔴 CE QU'ELLE EXISTE POUR EMPÊCHER, ET C'EST MESURÉ AU NAVIGATEUR LE
   2026-08-26 : les sorts préparés d'un Mage font 31 objets, et le vivier
   rendait une dalle de **608 px** qui poussait tout le reste hors de l'écran.
   La règle d'Eric du 23/08 — *« 15 items glissables max … pour la liste des
   sorts niveau 1 on fera ça »* — vivait au socle (`normes.mjs`) et n'était
   appelée que par l'Équipement.

   ⭐ ET ELLE EST DANS CET ORGANE, PAS DANS LES QUATRE ÉCRANS. Species, Class,
   Inheritance et Identity remettent un plan ; c'est ici que le vivier se
   fabrique. Un seul organe paginé sert les quatre — plus les langues de
   l'Héritage, rendues par la coquille.

   ⛔ CE QUE CES TESTS NE PEUVENT PAS DIRE, et qui a été mesuré à part
   (`ui/builder/banc-listes.html`, Chrome 151, 360 × 553) : que la rangée tient
   TROIS colonnes une fois les deux gouttières posées. C'est un fait de
   peinture — le stub ne fait pas de mise en page. */

/** Une liste de `n` options, avec deux créneaux — la forme des sorts préparés.
 *  ⚠️ LA CLEF EST UN PARAMÈTRE, ET C'EST LA MÉMOIRE DE PAGE QUI L'EXIGE : elle
 *  vit au MODULE (c'est ce qui la fait survivre au `refresh()` de la coquille),
 *  donc deux cas qui partageraient un chemin partageraient leur page — le
 *  second lirait l'état que le premier a laissé. Un test qui dépend de son
 *  voisin ne prouve rien. Chaque cas prend donc SON chemin. */
const slotsLongs = (n, clef = "class.prepared") => {
  const options = Array.from({ length: n }, (_, i) => `sort-${i}`);
  return [
    { path: `${clef}[0]`, index: 0, options, selected: [] },
    { path: `${clef}[1]`, index: 1, options, selected: [] }
  ];
};
const chevrons = (n) => n.querySelectorAll(".grille-fleche");
const comptes = (n) => n.querySelectorAll(".grille-compte").map((c) => c.textContent);

test("13 — au-delà de 15 options, le vivier n'en rend que 15 — la dalle cesse de grandir", () => {
  const n = ecran(slotsLongs(31, "cas.compte"), []);
  assert.equal(jetons(n).length, 15,
    "31 options, 15 jetons : le nombre se LIT au socle (`LISTE_PAR_PAGE`), il n'est pas recopié ici");
  assert.deepEqual(jetons(n).slice(0, 2).map((b) => b.getAttribute("data-valeur")), ["sort-0", "sort-1"],
    "la première page commence au premier objet");
});

test("13 bis — les chevrons flanquent la liste, et SOUS chacun un compte (NORMES §6)", () => {
  const n = ecran(slotsLongs(31, "cas.chevrons"), []);
  const rang = n.querySelectorAll(".grille-rang");
  assert.equal(rang.length, 1, "une rangée, et le vivier est son enfant du MILIEU");
  assert.deepEqual([...rang[0].children].map((c) => c.className),
    ["grille-gouttiere", "glisse-vivier", "grille-gouttiere"],
    "🔴 à GAUCHE et à DROITE — ⛔ pas au-dessus (NORMES.md §6)");
  assert.deepEqual(chevrons(n).map((b) => b.getAttribute("aria-label")), ["Previous page", "Next page"]);
  /* ⛔ LE TOTAL EST CELUI DE LA LISTE, PAS DE LA PAGE : c'est ce qui attend le
     joueur. Écriture d'Équipement au mot près — le total à gauche, la page à
     droite. */
  assert.deepEqual(comptes(n), ["31", "1/3"], "combien il y en a · où l'on est");
});

test("13 ter — `pages = ceil(objets ÷ 15)` jusqu'au bout, et la DERNIÈRE page est partielle", () => {
  const n = ecran(slotsLongs(31, "cas.tranches"), []);
  const suivante = chevrons(n)[1];
  suivante.click();
  assert.deepEqual(comptes(n), ["31", "2/3"]);
  assert.equal(jetons(n).length, 15);
  assert.equal(jetons(n)[0].getAttribute("data-valeur"), "sort-15", "la deuxième page commence au seizième");
  suivante.click();
  assert.deepEqual(comptes(n), ["31", "3/3"]);
  assert.equal(jetons(n).length, 1, "31 − 2 × 15 = 1 — et on ne fabrique pas de case vide pour combler");
});

test("13 quater — la page BOUCLE : au-delà de la dernière on revient à la première", () => {
  /* Une flèche qui ne fait rien au bout serait une cible tactile morte. */
  const n = ecran(slotsLongs(31, "cas.boucle"), []);
  for (let i = 0; i < 3; i += 1) chevrons(n)[1].click();
  assert.deepEqual(comptes(n), ["31", "1/3"]);
  chevrons(n)[0].click();
  assert.deepEqual(comptes(n), ["31", "3/3"], "en deçà de la première, on va à la dernière");
});

test("13 quinquies — ⛔ TOURNER UNE PAGE N'EST PAS UNE DÉCISION : aucune action n'est émise", () => {
  /* 🔴 Et ce n'est pas une élégance : la coquille répond à toute action par un
     `refresh()` qui reconstruit la carte entière — une page tournée qui
     dispatcherait ferait démonter le vivier sous le doigt. */
  const actions = [];
  const n = ecran(slotsLongs(31, "cas.muet"), actions);
  chevrons(n)[1].click();
  chevrons(n)[0].click();
  assert.deepEqual(actions, [], "un numéro de page ne va pas au carnet — ce n'est pas un choix de personnage");
});

test("13 sexies — 🔴 LA PAGE SURVIT AU RE-RENDU, sinon le joueur est renvoyé au début à chaque sort", () => {
  /* Mesuré au navigateur le 2026-08-26 : poser un sort de la page 3 laisse
     l'écran sur « 3/3 ». Sans mémoire au module, le `refresh()` de la coquille
     ramènerait « 1/3 » — sur la liste même où l'on fait quinze choix. */
  const n = ecran(slotsLongs(31, "cas.memoire"), []);
  chevrons(n)[1].click();
  assert.deepEqual(comptes(n), ["31", "2/3"]);
  const rejoue = ecran(slotsLongs(31, "cas.memoire"), []);   // ce que fait `refresh()`
  assert.deepEqual(comptes(rejoue), ["31", "2/3"], "la page est retrouvée, pas recommencée");
  assert.equal(jetons(rejoue)[0].getAttribute("data-valeur"), "sort-15");
  /* ⛔ ET ELLE EST PROPRE À SON CHEMIN : deux viviers ne se marchent pas
     dessus. `slots[0].path` est la clef — `class.prepared[0]` ici. */
  const autre = renderChoixGlisses({
    plan: planDe(), slots: [{ path: "cas.voisin[0]", index: 0, options: slotsLongs(31)[0].options, selected: [] }],
    titre: "Cantrips", mot: "Cantrip", onAction: () => {}
  });
  assert.deepEqual(comptes(autre), ["31", "1/3"], "un autre chemin, une autre page — jamais celle du voisin");
});

test("13 septies — ⏳ À UNE SEULE PAGE, PAS DE CHEVRONS — choix SOBRE, non tranché par Eric", () => {
  /* 🔴 NORMES.md §5 le range dans « CE QUI N'EST TOUJOURS PAS TRANCHÉ » :
     *« les flèches quand il n'y a qu'une page : disparaissent-elles ? »*. Le
     choix pris ici est le plus sobre, et il est dit plutôt que masqué : deux
     flèches qui ne mènent nulle part sont deux cibles tactiles mortes, et
     surtout elles coûtent 96 px de largeur (deux `--touch` et deux `--sp-4`) à
     une rangée qui n'en a que 20 de reste — mesuré au navigateur à 360.
     ⭐ Sa conséquence : sept des neuf viviers du personnage-témoin ne changent
     pas d'un pixel. ⚠️ UN MOT D'ERIC LE RENVERSE, et alors c'est CE test qu'il
     faudra corriger, pas l'organe. */
  for (const combien of [1, 3, 14, 15]) {
    const n = ecran(slotsLongs(combien, `cas.une-page-${combien}`), []);
    assert.equal(n.querySelectorAll(".grille-rang").length, 0, `${combien} options tiennent sur une page`);
    assert.equal(chevrons(n).length, 0, "pas de chevron sans page à tourner");
    assert.equal(jetons(n).length, combien);
    assert.equal(n.querySelectorAll(".glisse-vivier").length, 1,
      "et le vivier reste l'enfant direct du bloc, exactement comme avant ce lot");
  }
  /* La frontière, nommément : 15 tient, 16 pagine. */
  assert.equal(ecran(slotsLongs(16, "cas.seize"), []).querySelectorAll(".grille-rang").length, 1);
});

test("13 octies — un jeton de page 2 est ARMÉ comme les autres : le tap pose toujours", () => {
  /* ⛔ Une page tournée dont les jetons ne répondent plus au doigt serait pire
     qu'une liste sans fin — c'est la raison d'être de `faireJeton`. */
  const actions = [];
  const n = ecran(slotsLongs(31, "cas.arme"), actions);
  chevrons(n)[1].click();
  geste(jetons(n)[0], { cible: null });
  assert.deepEqual(actions, [{ kind: "set", path: "cas.arme[0]", value: "sort-15" }],
    "le jeton de la deuxième page pose dans le premier créneau libre, comme celui de la première");
});

/* ══ 9 — LA COTE DE HAUTEUR, DANS LA FEUILLE ════════════════════════════
   🔴 CE GARDE TIENT UNE PHRASE DU CROQUIS, PAS UN GOÛT : *« 30 1st level
   spells, scrollable, MUST BE THE SAME HEIGHT AS CANTRIPS »*. Deux grilles,
   une hauteur. Le seul moyen de les faire diverger serait un sélecteur qui
   distingue l'une de l'autre — c'est exactement ce qu'on refuse ici.
   ⚠️ ET IL LIT LES OCTETS DE LA FEUILLE, comme les gardes de jetons : la
   hauteur d'une grille est un fait de peinture, aucun test de rendu ne peut
   la dire hors navigateur. */
/* 🔴 TOUTES LES FEUILLES QUI PARLENT D'UN VIVIER, PAS SEULEMENT `shell.css`.
   Le 2026-08-26, `listes.css` est entrée avec la pagination et porte des
   sélecteurs `.glisse-vivier` : un garde resté sur une seule feuille aurait
   laissé la fenêtre revenir par la porte d'à côté, en silence. ⛔ Le garde
   suit la RÈGLE, pas le fichier où elle campait le jour de sa naissance. */
const BUILDER_CSS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const FEUILLES_DE_VIVIER = ["shell.css", "listes.css"];
const shellCss = FEUILLES_DE_VIVIER
  .map((nom) => fs.readFileSync(path.join(BUILDER_CSS, nom), "utf8"))
  .join("\n");

/** Chaque règle dont le sélecteur parle d'un VIVIER, avec son corps —
 *  commentaires ôtés (un `height` cité dans un commentaire n'habille rien). */
function reglesDeVivier(css) {
  const sans = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...sans.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selecteur]) => /glisse-vivier|glisse-grille/.test(selecteur))
    .map(([, selecteur, corps]) => ({ selecteur: selecteur.trim().replace(/\s+/g, " "), corps }));
}

/* ══ 9 — 🧊 PLUS AUCUN ASCENSEUR SOUS UN GLISSER ═════════════════════════
   Eric, 2026-08-20 : *« il ne faut plus d'ascenseurs couplés avec des actions
   drag and drop »*.

   🔴 CE QUE CETTE FAMILLE GARDAIT AVANT : que les DEUX grilles de sorts
   partagent une seule hauteur de fenêtre, et que leur case porte
   `touch-action: pan-y`. Les deux sont devenus faux le même jour — la fenêtre
   est retirée, et `pan-y` avec elle.
   ⭐ CE QU'ELLE GARDE MAINTENANT, ET C'EST PLUS FORT : que la fenêtre ne
   revienne pas. Un vivier qui reprendrait une hauteur ou un `overflow`
   rouvrirait le conflit entre défiler et glisser — et il faudrait un péage
   pour le trancher, c'est-à-dire le défaut qu'Eric a signalé. */
test("9 — aucune règle de la feuille ne fabrique une fenêtre défilante sous un glisser", () => {
  const fautes = reglesDeVivier(shellCss).filter(({ corps }) =>
    /(?:^|;)\s*(?:height|max-height|overflow|overflow-y)\s*:/.test(corps));
  assert.deepEqual(fautes.map((f) => f.selecteur), [],
    "un vivier ne se borne pas et ne défile pas : c'est la page qui défile");
});

test("9 bis — ⚔️ ATTAQUE : une fenêtre réintroduite est VUE", () => {
  /* Un garde qu'on n'attaque pas n'est pas un garde. */
  const faux = shellCss + '\n.glisse-vivier[data-plan="prepared"] { height: 400px; overflow-y: auto; }\n';
  assert.equal(reglesDeVivier(faux).filter(({ corps }) => /height|overflow/.test(corps)).length, 1,
    "la fenêtre réintroduite doit être vue — sinon ce garde ne lit rien");
});

test("9 ter — la case porte `touch-action: none`, jamais `pan-y`", () => {
  /* 🔴 `pan-y` ÉTAIT LA CONTREPARTIE DE LA FENÊTRE, et il coûtait le geste :
     le doigt défilait d'abord, et le glisser ne se prenait qu'après 350 ms
     d'appui. C'est ce qui faisait dire à Eric que le glisser « marche dans
     species elf, il ne marche pas dans le wizard ».
     ⛔ Son retour serait le retour du péage, en silence : aucun test de rendu
     ne le verrait, et personne ne le découvrirait avant un téléphone. */
  const sans = shellCss.replace(/\/\*[\s\S]*?\*\//g, "");
  const regles = [...sans.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, sel]) => /glisse-jeton|glisse-creneau/.test(sel));
  const corps = regles.map(([, , c]) => c).join(" ");
  assert.doesNotMatch(corps, /touch-action\s*:\s*pan-y/,
    "plus rien ne dispute le geste au glisser — le jeton ne cède plus le doigt");
  assert.match(corps, /touch-action\s*:\s*none/,
    "et il verrouille le défilement pour toute la durée du geste");
});

test("7 — DÉPASSER LE BUDGET rend le bloc rouge, et il cesse d'être « complet »", () => {
  /* 🔴 CAS D'ERIC, 2026-08-19, sur capture : trois « +1 » posés sur un budget
     de DEUX — compteur « 3 of 2 » — et tout l'écran en VERT, `Done` offert.
     Le rouge existait et ne se levait jamais : il attendait un `lock`, que
     rien ne produit ici.
     ⭐ L'ÉCRAN NE JUGE PAS : il COMPARE deux nombres que le plan lui donne. */
  const plan = { ...planDe(), answered: 3, expected: 2 };
  const n = renderChoixGlisses({ plan, slots: slotsDe(["athletics"]), titre: "Budget" });
  assert.equal(n.dataset.trop, "true", "le dépassement est lu sur le plan");
  assert.equal(n.dataset.complet, "false",
    "⛔ un `Done` vert sur un budget explosé inviterait à valider une faute");
});

test("7 bis — ⚔️ dans le budget, rien ne rougit", () => {
  const plan = { ...planDe(), answered: 2, expected: 2 };
  const n = renderChoixGlisses({ plan, slots: slotsDe(["athletics"]), titre: "Budget" });
  assert.equal(n.dataset.trop, "false", "sans dépassement, le garde ne doit pas mordre");
});

/* ══ 12 — LA CAPTURE NE SE PREND QU'AU SOULÈVEMENT (incident du 22/08) ════
   🔴 CE GARDE EXISTE PARCE QUE LA PANNE ÉTAIT MUETTE ET LOIN DE SA CAUSE.
   Eric, iPhone : *« défilement vertical toujours bloqué »* sur une liste dont
   chaque ligne est un jeton. Rien ne rougissait : les cinq écrans qui
   emploient cet organe posent leurs jetons sur des surfaces qui NE DÉFILENT
   PAS, donc aucun ne pouvait sentir la différence.

   CE QU'IL TIENT, et c'est en deux moitiés parce que le défaut l'était :
     · AVANT le seuil, AUCUNE capture — sur iOS, capturer un pointeur annule le
       défilement natif pour ce geste, et `touch-action: pan-y` n'a plus sa
       chance. C'est la moitié qui manquait.
     · APRÈS le soulèvement, capture PRISE — sans elle, `pointerup` se perd dès
       que le doigt sort de la boîte du jeton. C'est la moitié qu'on garde, et
       la retirer casserait le glisser au lieu de réparer le défilement.

   ⚠️ LE `document` DE TEST N'A PAS `setPointerCapture` : c'est le test qui le
   FOURNIT, exactement comme il fournit `elementFromPoint` et `setTimeout` plus
   haut. Une API de navigateur qu'on injecte pour pouvoir la juger. */

/** Un jeton armé qui NOTE ses captures, sans en faire quoi que ce soit. */
function jetonMouchard(rappels = {}) {
  const brut = document.createElement("button");
  const captures = [];
  brut.setPointerCapture = (id) => captures.push(id);
  armerJeton(brut, { onTap: () => {}, onDepot: () => {}, ...rappels });
  return { brut, captures };
}

test("12 — ⚔️ AUCUNE capture tant que le seuil n'est pas franchi : le doigt doit pouvoir défiler", () => {
  const { brut, captures } = jetonMouchard();
  document.elementFromPoint = () => null;
  brut.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 7, button: 0, pointerType: "touch" });
  assert.deepEqual(captures, [], "capturer à l'appui annule le défilement natif d'iOS — c'est le défaut du 22/08");

  /* Un doigt qui descend de 5 px n'a rien décidé : sous `SEUIL_GLISSER`, le
     navigateur doit rester libre de faire défiler. */
  brut.dispatchEvent({ type: "pointermove", clientX: 0, clientY: 5, pointerId: 7 });
  assert.deepEqual(captures, [], "sous le seuil, l'organe OBSERVE — il ne prend rien");

  brut.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 5, pointerId: 7 });
  assert.deepEqual(captures, [], "et un tap tremblé n'aura jamais rien capturé du tout");
});

test("12 bis — ⚔️ la capture EST prise au soulèvement, une seule fois, avec le bon pointeur", () => {
  const trace = [];
  const { brut, captures } = jetonMouchard({ onLever: () => trace.push("lever") });
  document.elementFromPoint = () => null;
  brut.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 7, button: 0, pointerType: "touch" });
  brut.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 7 });
  assert.deepEqual(captures, [7], "franchi le seuil : sans capture, `pointerup` se perdrait hors de la boîte");
  assert.deepEqual(trace, ["lever"], "et elle tombe au MÊME instant que le soulèvement, pas avant, pas après");

  /* ⛔ Une capture par geste, pas une par image : `bouge` court à chaque
     pixel, et seul le passage à `glisse` doit la prendre. */
  brut.dispatchEvent({ type: "pointermove", clientX: 80, clientY: 0, pointerId: 7 });
  brut.dispatchEvent({ type: "pointermove", clientX: 120, clientY: 0, pointerId: 7 });
  assert.deepEqual(captures, [7], "une seule capture pour tout le geste");
});

test("12 ter — un jeton SANS `setPointerCapture` glisse quand même (le rappel reste facultatif)", () => {
  /* ⛔ La garde `typeof … === "function"` n'est pas de la prudence décorative :
     elle est ce qui rend cet organe éprouvable hors navigateur, et c'est à ce
     titre que les onze tests au-dessus existent. Déplacer la capture ne doit
     pas l'avoir rendue obligatoire en douce. */
  const deposes = [];
  const brut = document.createElement("button");
  armerJeton(brut, { onTap: () => deposes.push("tap"), onDepot: (c) => deposes.push(c) });
  document.elementFromPoint = () => ({ closest: () => ({ dataset: { creneau: "bag" } }) });
  brut.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  brut.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 1 });
  brut.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 0, pointerId: 1 });
  assert.deepEqual(deposes, ["bag"], "aucune capture disponible, et le dépôt tombe quand même");
});
