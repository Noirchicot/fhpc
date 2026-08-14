/* ══ LE SPY — LOT 68, invariant II.3 ══════════════════════════════════════

   🔴 POURQUOI CE FICHIER EXISTE. `watchSnap` est la pièce dont l'invariant
   II.3 dit **« le scrollspy EST le sélecteur »** : c'est lui qui décide
   quelle fiche est « la fiche courante », donc lui qui allume le rail. Et au
   soir du 2026-08-14, sous **1 008 tests verts**, il n'en avait **aucun**.

   Son arithmétique en avait cinq (`nearestIndex`, socle.test.mjs, preuves C
   à C quinquies). Mais le CÂBLAGE qui la nourrit — lire le DOM, écouter
   `scroll`, appeler `onSettle` — n'était exercé nulle part, parce que le
   `dom-stub` n'avait **ni rectangle, ni hauteur, ni événement `scroll`**.

   ⭐ C'est la troisième fois de la séance que la même forme de trou se
   présente : *la partie pure est prouvée, la partie qui touche le monde ne
   l'est pas.* (Les deux autres : `shell.mjs` qu'aucun test n'importe — la
   virgule du lot 66 ; et `scroll-snap-type` absent sous 935 verts.)

   ⚠️ CE QUE CES TESTS NE PEUVENT PAS DIRE. Le stub modélise **une colonne**,
   pas un navigateur : ni `scroll-snap`, ni marges, ni hauteurs inégales. Si
   le spy se désynchronise dans un vrai navigateur alors que ces tests
   passent, la cause est dans ce que le stub ne modélise pas — et il faudra
   le dire, pas rougir au hasard. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument, poserUneColonne } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
/* `watchSnap` étrangle ses lectures par `requestAnimationFrame` — « une
   image, pas un pixel ». Sans lui, le module jette à l'import. On le rend
   SYNCHRONE ici : le test veut mesurer la logique, pas l'ordonnanceur. */
globalThis.requestAnimationFrame = (fn) => { fn(); return 0; };

const { watchSnap, nearestIndex } = await import("../ui/builder/socle.mjs");

/** Douze fiches de 800 px dans un champ de 800 px, posé à 100 px du haut —
 *  la géométrie RÉELLE mesurée sur l'écran Class à 1 440 × 900. */
function catalogue({ nb = 12, top = 100, hauteur = 800 } = {}) {
  const scroller = document.createElement("div");
  for (let i = 0; i < nb; i += 1) {
    const carte = document.createElement("article");
    carte.dataset.snap = "";
    carte.textContent = `Fiche ${i}`;
    scroller.append(carte);
  }
  poserUneColonne(scroller, { top, hauteurDuChamp: hauteur, hauteurDesEnfants: hauteur });
  return scroller;
}

test("A — le spy prononce le cran dès qu'on défile, et il prononce le BON", () => {
  const scroller = catalogue();
  const dits = [];
  watchSnap(scroller, (index) => dits.push(index));

  /* Chaque fiche fait exactement la hauteur du champ : la n-ième s'aligne
     sur le haut du champ à `n × 800`. C'est le cas le plus simple, et c'est
     celui de l'écran réel. */
  for (const [defilement, attendu] of [[800, 1], [2400, 3], [8800, 11], [0, 0]]) {
    scroller.scrollTop = defilement;
    assert.equal(dits[dits.length - 1], attendu,
      `à ${defilement} px, la fiche ${attendu} est en haut du champ — le spy doit dire ${attendu}`);
  }
  assert.deepEqual(dits, [1, 3, 11, 0]);
});

test("A bis — 🔴 SANS ÉVÉNEMENT `scroll`, LE SPY EST MUET — et c'est ce que le stub cachait", () => {
  const scroller = catalogue();
  const dits = [];
  watchSnap(scroller, (index) => dits.push(index));
  /* On écrit la position SANS prévenir personne : exactement ce que faisait
     le stub avant ce lot. Le spy ne peut pas deviner. */
  scroller._scrollTop = 4000;
  assert.deepEqual(dits, [],
    "un spy qui n'entend pas `scroll` ne dit rien — le stub d'avant le lot 68 ne prononçait jamais ce mot");
  /* Et dès qu'on le prévient, il rattrape la vérité, sans étape intermédiaire. */
  scroller.scrollTop = 4001;
  assert.deepEqual(dits, [5]);
});

test("B — il ne se répète pas : rester sur la même fiche ne produit AUCUN cran", () => {
  const scroller = catalogue();
  const dits = [];
  watchSnap(scroller, (index) => dits.push(index));
  scroller.scrollTop = 2400;
  scroller.scrollTop = 2500; // même fiche, on a juste bougé un peu
  scroller.scrollTop = 2600;
  assert.deepEqual(dits, [3],
    "III — un spy qui reprononce à chaque pixel ferait clignoter le rail, et ramerait sur mobile");
});

test("C — `settle()` rattrape un changement de CONTENU, que rien n'annonce", () => {
  const scroller = catalogue();
  const dits = [];
  const spy = watchSnap(scroller, (index) => dits.push(index));
  scroller.scrollTop = 2400;
  assert.deepEqual(dits, [3]);
  /* Un remplacement de contenu n'émet aucun `scroll` : c'est la seule chose
     que l'écouteur ne peut pas voir tout seul, et la raison d'être de
     `settle()` (socle.mjs). Ici la même fiche redevient courante — sans
     `settle()`, le rail garderait le cran d'avant pour toujours. */
  spy.settle();
  assert.deepEqual(dits, [3, 3], "après un remplacement, le spy REPRONONCE, même à l'identique");
});

test("D — aucune fiche : le spy se tait, il ne dit jamais « la première »", () => {
  const scroller = document.createElement("div");
  poserUneColonne(scroller, { top: 100 });
  const dits = [];
  watchSnap(scroller, (index) => dits.push(index));
  scroller.scrollTop = 500;
  assert.deepEqual(dits, [], "-1 n'est pas 0 — c'est déjà la loi de `nearestIndex` (socle.test.mjs, preuve C quater)");
});

test("E — le spy ne RETIENT aucun nœud : il relit `[data-snap]` à chaque fois", () => {
  const scroller = catalogue({ nb: 3 });
  const dits = [];
  watchSnap(scroller, (index) => dits.push(index));
  scroller.scrollTop = 1600;
  assert.deepEqual(dits, [2]);
  /* On remplace les trois fiches par douze — ce que fait `swapContent`. Un
     spy qui aurait gardé la liste d'avant compterait encore jusqu'à 2. */
  scroller.replaceChildren(...Array.from({ length: 12 }, (_, i) => {
    const c = document.createElement("article");
    c.dataset.snap = "";
    c.textContent = `Neuve ${i}`;
    return c;
  }));
  poserUneColonne(scroller, { top: 100 });
  scroller.scrollTop = 8800;
  assert.equal(dits[dits.length - 1], 11, "il a relu les douze, il n'a pas plafonné à l'ancienne liste");
});

/* ══ LE GARDE QUI EMPÊCHE CE TROU DE REVENIR ═════════════════════════════ */

test("⚔️ GARDE — le stub JETTE si on lui demande un rectangle sans avoir posé de géométrie", () => {
  const nu = document.createElement("div");
  assert.throws(() => nu.getBoundingClientRect(), /sans géométrie déclarée/,
    "un rectangle de zéros ferait passer un test du spy en mesurant du vide — c'est " +
    "exactement la famille de garde creux que ce dépôt a déjà payée deux fois");
});

test("⚔️ GARDE — la colonne du stub tient l'arithmétique que `nearestIndex` attend", () => {
  /* Les deux pièces doivent parler de la même chose : le spy passe au
     calcul les `top` que la colonne produit. Si l'un des deux dérive, ce
     test le dit avant que le rail ne mente à l'écran. */
  const scroller = catalogue();
  scroller._scrollTop = 2400;
  const tops = scroller.querySelectorAll("[data-snap]").map((c) => c.getBoundingClientRect().top);
  assert.deepEqual(tops.slice(0, 5), [-2300, -1500, -700, 100, 900],
    "mesuré au navigateur le 2026-08-14 sur l'écran Class à 1 440 × 900 : les mêmes cinq nombres");
  assert.equal(nearestIndex(tops, scroller.getBoundingClientRect().top), 3);
});
