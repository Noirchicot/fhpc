/* ══ LE PARCOURS D'UNE ÉTAPE — guide, items, bilan ══════════════════════════
   Spec d'Eric, 2026-08-19. Ces tests tiennent la SEULE chose que le parcours
   décide : où en est-on, et quels sont les items.

   ⛔ CE QU'ILS EXISTENT POUR EMPÊCHER : que « répondu » et « confirmé »
   redeviennent la même chose. Un lignage posé puis quitté par `Back` est
   répondu et PAS confirmé — et c'est cette divergence qui fait tout le
   parcours. Chaque test ci-dessous l'attaque par un angle différent. */

import test from "node:test";
import assert from "node:assert/strict";

const { ETAT, etatDeLEtape, itemsDeLEtape, estConfirme, refusDuDone } =
  await import("../ui/builder/parcours.mjs");

/** Un carnet minimal — on nomme les plans, on n'en fabrique pas douze. */
const plan = (path, answered, expected, extra) =>
  ({ path, answered, expected, status: "answered", ...(extra || {}) });

const docAvec = (...confirmed) => ({ build: { confirmed } });

/* ══ 1. LES TROIS ÉTATS ═══════════════════════════════════════════════ */

test("sans espèce choisie, on est au CATALOGUE", () => {
  const decisions = [plan("species", 0, 1), { path: "species", selected: [] }];
  assert.equal(etatDeLEtape({ decisions: [{ path: "species", selected: [] }], document: null, racine: "species" }),
    ETAT.catalogue);
  assert.equal(etatDeLEtape({ decisions: [], document: null, racine: "species" }), ETAT.catalogue,
    "un carnet vide n'invente pas une espèce");
  void decisions;
});

test("espèce choisie mais guide non signé : on est au GUIDE, même si TOUT est répondu", () => {
  /* ⭐ LE CŒUR DE LA SPEC. Tout est coché, rien n'est confirmé : Eric veut le
     joueur au guide, devant son `Done`. Déduire le bilan de « answered »
     détruirait exactement la règle qu'il a posée. */
  const decisions = [
    { path: "species", selected: ["srd:species:en:elf"] },
    plan("species.lineage", 1, 1),
    plan("species.skillBudget", 2, 2)
  ];
  assert.equal(etatDeLEtape({ decisions, document: docAvec(), racine: "species" }), ETAT.guide);
});

test("le guide signé fait passer au BILAN — et lui seul", () => {
  const decisions = [{ path: "species", selected: ["srd:species:en:elf"] }];
  assert.equal(etatDeLEtape({ decisions, document: docAvec("species.lineage"), racine: "species" }), ETAT.guide,
    "signer un ITEM ne fait pas passer au bilan : c'est le guide qui valide l'étape");
  assert.equal(etatDeLEtape({ decisions, document: docAvec("species"), racine: "species" }), ETAT.bilan);
});

test("chaque étape a son parcours, et ils ne se marchent pas dessus", () => {
  const decisions = [
    { path: "species", selected: ["srd:species:en:elf"] },
    { path: "class", selected: ["srd:class:en:wizard"] }
  ];
  const doc = docAvec("species");
  assert.equal(etatDeLEtape({ decisions, document: doc, racine: "species" }), ETAT.bilan);
  assert.equal(etatDeLEtape({ decisions, document: doc, racine: "class" }), ETAT.guide,
    "⛔ Species validée ne valide pas Class — la racine est un argument, pas un mot en dur");
});

/* ══ 2. LES ITEMS ═════════════════════════════════════════════════════ */

test("UN ITEM PAR CHOIX — l'Elfe en porte deux : son lignage ET Keen Senses", () => {
  const decisions = [
    { path: "species", selected: ["srd:species:en:elf"] },
    plan("species.lineage", 1, 1),
    plan("species.skillBudget", 0, 2)
  ];
  const items = itemsDeLEtape({ decisions, document: docAvec("species.lineage"), racine: "species" });
  assert.deepEqual(items.map((i) => i.path), ["species.lineage", "species.skillBudget"]);
  assert.deepEqual(items.map((i) => i.confirme), [true, false]);
});

test("un CRÉNEAU n'est pas un item — deux voyants pour une décision seraient un mensonge", () => {
  const decisions = [
    { path: "species", selected: ["srd:species:en:elf"] },
    plan("species.skills", 0, 2),
    plan("species.skills[0]", 0, 1),
    plan("species.skills[1]", 0, 1)
  ];
  const items = itemsDeLEtape({ decisions, document: docAvec(), racine: "species" });
  assert.deepEqual(items.map((i) => i.path), ["species.skills"]);
});

test("la RACINE n'est pas un item — on ne redemande pas ce qui a mené ici", () => {
  const decisions = [{ path: "species", selected: ["srd:species:en:elf"] }, plan("species.lineage", 0, 1)];
  const items = itemsDeLEtape({ decisions, document: docAvec(), racine: "species" });
  assert.equal(items.some((i) => i.path === "species"), false);
});

test("RÉPONDU et CONFIRMÉ sont rendus séparément, et peuvent diverger", () => {
  /* ⚔️ LE CAS EXACT D'ERIC : le joueur a posé son lignage puis est reparti par
     `Back`. Le carnet dit « répondu », le document ne porte aucune signature. */
  const decisions = [
    { path: "species", selected: ["srd:species:en:dragonborn"] },
    plan("species.lineage", 1, 1)
  ];
  const [item] = itemsDeLEtape({ decisions, document: docAvec(), racine: "species" });
  assert.equal(item.repondu, true, "la valeur EST posée");
  assert.equal(item.confirme, false, "et l'item reste éteint — `Back` ne valide pas");
});

test("une espèce sans aucun choix n'a AUCUN item — et son guide n'a rien à refuser", () => {
  const decisions = [{ path: "species", selected: ["srd:species:en:dwarf"] }];
  const items = itemsDeLEtape({ decisions, document: docAvec(), racine: "species" });
  assert.deepEqual(items, []);
  assert.equal(refusDuDone({ decisions, document: docAvec(), racine: "species" }), null,
    "rien à cocher, donc `Done` part");
});

/* ══ 3. LE REFUS DU DONE ══════════════════════════════════════════════ */

test("`Done` ne part pas tant qu'un item n'est pas SIGNÉ — et il NOMME lesquels", () => {
  const decisions = [
    { path: "species", selected: ["srd:species:en:elf"] },
    plan("species.lineage", 1, 1),
    plan("species.skillBudget", 2, 2)
  ];
  /* ⚔️ TOUT EST RÉPONDU. Un `Done` qui regarderait le carnet partirait ; c'est
     la signature qu'il doit regarder. */
  const refus = refusDuDone({ decisions, document: docAvec("species.lineage"), racine: "species" });
  assert.deepEqual(refus.manquants, ["species.skillBudget"],
    "⛔ il ne dit pas « il manque quelque chose » : il dit QUOI");
  assert.equal(refusDuDone({ decisions, document: docAvec("species.lineage", "species.skillBudget"), racine: "species" }),
    null, "les deux signés : il part");
});

test("estConfirme LIT, il ne déduit pas — et un document sans champ ne signe rien", () => {
  assert.equal(estConfirme({ build: {} }, "species"), false);
  assert.equal(estConfirme(null, "species"), false, "un document absent ne fait pas planter l'écran");
  assert.equal(estConfirme(docAvec("species"), "species"), true);
  assert.equal(estConfirme(docAvec("species"), "species.lineage"), false,
    "signer le guide ne signe pas ses items");
});

test("un SOUS-CHEMIN n'est pas un item — mesuré dans la page le 2026-08-19", () => {
  /* ⚔️ L'Elfe affichait QUATRE items : son lignage, sa bourse, puis `Survival`
     et `Vigilance` — qui sont les compétences DANS la bourse, pas des
     décisions à part. Un item est une décision ; ce qui vit dessous en est le
     contenu. */
  const decisions = [
    { path: "species", selected: ["srd:species:en:elf"] },
    plan("species.lineage", 0, 1),
    plan("species.skillBudget", 0, 2),
    plan("species.skillBudget.survival", 0, 1),
    plan("species.skillBudget.vigilance", 0, 1)
  ];
  const items = itemsDeLEtape({ decisions, document: docAvec(), racine: "species" });
  assert.deepEqual(items.map((i) => i.path), ["species.lineage", "species.skillBudget"]);
});
