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

/* ══ 3 bis — LA GRILLE ET SON MAINTIEN (lot 79, étape 3) ════════════════
   🔴 CE QUE CES QUATRE CAS TIENNENT, ET POURQUOI ILS EXISTENT. Dans une
   grille, les cases PAVENT la boîte : `touch-action: none` la rendrait
   indéfilable au doigt (le pouce tombe toujours sur une case). Le
   défilement gagne donc par défaut, et le glisser se prend au MAINTIEN.
   Ce partage est invisible à l'œil — il ne se voit qu'en le jouant. */

test("7 — dans une grille, un doigt qui BOUGE avant le maintien ne pose rien", () => {
  /* C'est un DÉFILEMENT, et un défilement n'est pas un dépôt hésitant : le
     geste renonce pour de bon, même s'il se relâche sur un créneau. */
  const actions = [];
  const n = ecranGrille(slotsDe(), actions);
  geste(jetons(n)[0], { dx: 0, dy: 40, cible: creneaux(n)[1] });
  assert.deepEqual(actions, [], "le doigt partait défiler la grille — rien ne se pose");
});

test("7 bis — MAINTENU, puis glissé : le jeton se dépose dans le créneau visé", () => {
  const actions = [];
  const n = ecranGrille(slotsDe(), actions);
  geste(jetons(n)[0], { dx: 0, dy: 40, cible: creneaux(n)[1], maintenir: true });
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[1]", value: "athletics" }],
    "le maintien est le péage du glisser dans une grille, pas un interdit");
});

test("7 ter — le TAP ne paie AUCUN péage, même dans une grille", () => {
  /* ⭐ C'est ce qui rend le maintien acceptable sur un SE : le geste court
     reste immédiat, et il suffit à choisir. Le maintien ne sert qu'à VISER. */
  const actions = [];
  const n = ecranGrille(slotsDe(), actions);
  geste(jetons(n)[0]);
  assert.deepEqual(actions, [{ kind: "set", path: "class.skills[0]", value: "athletics" }]);
});

test("7 quater — le minuteur ne SURVIT pas au geste (aucune fuite d'horloge)", () => {
  /* ⚔️ Un minuteur oublié soulèverait un jeton APRÈS le relâchement, donc au
     milieu du geste suivant. Il se nettoie des deux côtés : quand le doigt
     renonce, et quand il se relâche. */
  const actions = [];
  const n = ecranGrille(slotsDe(), actions);
  geste(jetons(n)[0]);
  assert.equal(horloge.enAttente(), 0, "relâché : plus rien en attente");
  geste(jetons(n)[1], { dx: 0, dy: 40, cible: null });
  assert.equal(horloge.enAttente(), 0, "renoncé : plus rien en attente non plus");
});

test("8 — la grille DÉCLARE qu'elle défile, et ne se distingue pas par une classe à elle", () => {
  /* 📐 Croquis C : *« 30 1st level spells… MUST BE THE SAME HEIGHT AS
     CANTRIPS »*. L'égalité tient parce que les deux grilles portent LA MÊME
     classe — si l'une gagnait la sienne, la feuille pourrait les séparer
     sans que personne le voie. Et le second défilement se DÉCLARE : le socle
     trouve un conteneur qui défile par son marqueur, jamais en devinant. */
  const grille = ecranGrille(slotsDe(), []).querySelectorAll(".glisse-grille")[0];
  assert.equal(grille.getAttribute("data-scroller"), "grille");
  assert.equal(grille.className, "glisse-vivier glisse-grille",
    "la grille est un vivier DE PLUS, pas un vivier À PART");
  const plat = ecran(slotsDe(), []).querySelectorAll(".glisse-vivier")[0];
  assert.equal(plat.className, "glisse-vivier", "hors grille, rien n'a changé");
  assert.equal(plat.getAttribute("data-scroller"), null, "et rien n'y défile");
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

test("5 — taper un créneau REMPLI le vide ; un créneau vide ne fait rien", () => {
  const actions = [];
  const n = ecran(slotsDe(["athletics"]), actions);
  creneaux(n)[0].click();
  assert.deepEqual(actions, [{ kind: "clear", path: "class.skills[0]" }],
    "c'est le SEUL geste de retrait, et il est à l'endroit qu'on regarde");
  creneaux(n)[1].click();
  assert.equal(actions.length, 1, "un créneau vide n'a rien à vider");
});

test("6 — ⚔️ ATTAQUE : sans slots, l'organe rend `null` — jamais un cadre vide", () => {
  assert.equal(renderChoixGlisses({ plan: planDe(), slots: [], titre: "x" }), null);
  assert.equal(renderChoixGlisses({ plan: null, slots: slotsDe(), titre: "x" }), null,
    "sans plan, rien — le « faux magasin » que ce dépôt interdit");
});

/* ══ 9 — LA COTE DE HAUTEUR, DANS LA FEUILLE ════════════════════════════
   🔴 CE GARDE TIENT UNE PHRASE DU CROQUIS, PAS UN GOÛT : *« 30 1st level
   spells, scrollable, MUST BE THE SAME HEIGHT AS CANTRIPS »*. Deux grilles,
   une hauteur. Le seul moyen de les faire diverger serait un sélecteur qui
   distingue l'une de l'autre — c'est exactement ce qu'on refuse ici.
   ⚠️ ET IL LIT LES OCTETS DE LA FEUILLE, comme les gardes de jetons : la
   hauteur d'une grille est un fait de peinture, aucun test de rendu ne peut
   la dire hors navigateur. */
const shellCss = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder", "shell.css"), "utf8");

/** Chaque règle dont le sélecteur parle de la grille, avec son corps —
 *  commentaires ôtés (un `height` cité dans un commentaire n'habille rien). */
function reglesDeGrille(css) {
  const sans = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...sans.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selecteur]) => /glisse-grille/.test(selecteur))
    .map(([, selecteur, corps]) => ({ selecteur: selecteur.trim().replace(/\s+/g, " "), corps }));
}

test("9 — une SEULE hauteur de grille dans toute la feuille", () => {
  const hauteurs = reglesDeGrille(shellCss)
    .flatMap(({ corps }) => [...corps.matchAll(/(?:^|;)\s*height\s*:\s*([^;]+)/g)].map((m) => m[1].trim()));
  assert.equal(hauteurs.length, 1,
    `la hauteur de grille se déclare UNE fois — trouvé : ${hauteurs.join(" | ") || "aucune"}`);
  assert.match(hauteurs[0], /var\(--grille-lignes\)/,
    "et elle se calcule depuis `--grille-lignes`, pour qu'un changement de lignes suffise");
});

test("9 bis — ⚔️ ATTAQUE : donner sa propre hauteur à une seule grille fait rougir CE garde", () => {
  /* Un garde qu'on n'attaque pas n'est pas un garde : on écrit EN MÉMOIRE la
     divergence que le croquis interdit, et on vérifie qu'elle est vue. */
  const faux = shellCss + '\n.glisse-grille[data-plan="prepared"] { height: 400px; }\n';
  const hauteurs = reglesDeGrille(faux)
    .flatMap(({ corps }) => [...corps.matchAll(/(?:^|;)\s*height\s*:\s*([^;]+)/g)].map((m) => m[1].trim()));
  assert.equal(hauteurs.length, 2, "la seconde hauteur doit être VUE — sinon ce garde ne lit rien");
});

test("9 ter — la case de grille tient son plancher tactile et son geste", () => {
  /* 🔴 `pan-y` ET NON `none` : c'est LA ligne qui rend la grille défilable au
     doigt, et elle a une contrepartie dans l'organe (le maintien). Si elle
     disparaissait, le geste marcherait encore au bureau et la grille
     deviendrait inutilisable au pouce — un défaut qu'aucun test de rendu ne
     verrait, et que ce dépôt a déjà décidé de ne plus découvrir à l'œil. */
  const corps = reglesDeGrille(shellCss)
    .filter(({ selecteur }) => /glisse-jeton/.test(selecteur))
    .map(({ corps }) => corps).join(" ");
  assert.match(corps, /touch-action\s*:\s*pan-y/,
    "dans une grille, le doigt défile d'abord — le glisser se prend au maintien");
});
