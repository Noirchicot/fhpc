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

import { createTestDocument } from "./dom-stub.mjs";
globalThis.document = createTestDocument();

const { renderChoixGlisses } = await import("../ui/builder/glisser.mjs");

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
function geste(jeton, { dx = 0, dy = 0, cible = null } = {}) {
  document.elementFromPoint = () => cible;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "touch" });
  if (dx || dy) jeton.dispatchEvent({ type: "pointermove", clientX: dx, clientY: dy, pointerId: 1 });
  jeton.dispatchEvent({ type: "pointerup", clientX: dx, clientY: dy, pointerId: 1 });
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
