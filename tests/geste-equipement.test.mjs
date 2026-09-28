/* ══ LOT 347 — 🖐️ ARMER PUIS POSER, SUR EQUIPMENT (Gear, Pack, Wares, X5) ═══════════════════════════
   NORMES `geste-armer-puis-poser`, réponse 7 d'Eric (28/09) : « partout » — Species, Inheritance, Class,
   Skills, les dés d'Abilities, Equipment (Gear, Pack, Wares, X5). Le lot 340 a posé l'organe et les viviers ;
   celui-ci porte la grammaire aux jetons d'Equipment :
   · VOIR = tap (doigt) · clic droit (souris) → la fiche ;
   · ARMER = clic gauche (souris) · appui long (doigt) → les destinations LIBRES s'allument ;
   · POSER = clic ou tap sur une destination allumée, ou glisser ;
   · un objet verrouillé se VOIT, et refuse d'être armé (6b).
   ⏳ Les dés d'Abilities et le vivier de sorts du parchemin attendent la réponse d'Eric sur l'attente de
   500 ms au doigt (28/09) : la grammaire la leur ajouterait. */
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
/* ⚠️ LES ÉCRANS IMPORTENT `glisser.mjs?v=…` : c'est une AUTRE instance du module que `../ui/builder/glisser.mjs`.
   Son état (l'objet armé) est donc invisible d'ici — on lit ce que l'organe ÉCRIT au DOM (`data-deplacement`,
   `data-destination`, `data-flash`), et on désarme par Échap, qu'il écoute sur le document. */
const { MAINTIEN_EQUIPEMENT_MS } = await import("../ui/builder/glisser.mjs");
const { construireLEcranGear } = await import("../ui/builder/gear-ecran.mjs");
const { construireLeSac } = await import("../ui/builder/sac-ecran.mjs");
const { construireLesWares } = await import("../ui/builder/wares-ecran.mjs");
const { jetonAuVoisin } = await import("../ui/builder/x5-ecran.mjs");

/* ⭐ l'écran est posé AU DOCUMENT : sans portée déclarée, un jeton cherche ses destinations dans sa moitié
   d'écran, sinon dans l'application, sinon dans le document */
const desarmer = () => document.dispatchEvent({ type: "keydown", key: "Escape" });
const arme = (el) => el.dataset.deplacement === "arme";
function monter(noeud) {
  desarmer();
  document.body.childNodes.splice(0);
  document.body.append(noeud);
  return noeud;
}
const cliquer = (el, pointerType = "mouse", pointerId = 1) => {
  el.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId, button: 0, pointerType });
  document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId });
};
/* l'appui sur une destination allumée : il passe par l'écoute en capture du document */
const appuyerSur = (target, pointerId = 7) => {
  document.dispatchEvent({ type: "pointerdown", target, clientX: 0, clientY: 0, pointerId, button: 0, pointerType: "mouse" });
  document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId });
};
const clicDroit = (el) => el.dispatchEvent({ type: "contextmenu", pointerType: "mouse", preventDefault() {} });
const allumees = (n) => n.querySelectorAll('[data-destination="oui"]');

function gear(extra = {}) {
  const vus = []; const places = [];
  const n = monter(construireLEcranGear({
    boites: { tete1: { nom: "Helm", qte: 1, index: 3 }, tete2: { nom: "Crown", qte: 1, index: 4, locked: true } },
    collecte: new Set(), surJeton: (i) => vus.push(i), surPlacer: (i, b) => places.push([i, b]), ...extra
  }).noeud);
  return { n, vus, places, jeton: n.querySelector('[data-organe="tete1"]'), verrou: n.querySelector('[data-organe="tete2"]') };
}
function sac(extra = {}) {
  const vus = []; const places = [];
  const n = monter(construireLeSac({ sections: [{ nom: "Camp" }], section: 0, poids: {}, destinations: [],
    objets: [{ index: 4, nom: "Rope", qte: 1 }, { index: 5, nom: "Lantern", qte: 1, locked: true }],
    surJeton: (i) => vus.push(i), surPlacer: (i, c) => places.push([i, c]), ...extra }).noeud);
  const occupees = n.querySelectorAll('[data-occupe="oui"]').filter((c) => c.dataset.organe !== "collecteur");
  return { n, vus, places, jeton: occupees.find((c) => c.dataset.verrouille !== "oui"), verrou: occupees.find((c) => c.dataset.verrouille === "oui") };
}

test("347 · Pack — le clic gauche ARME (cases libres en bleu), ⛔ n'ouvre plus la fiche ; un clic sur une case y pose", () => {
  const s = sac();
  assert.ok(s.jeton, "un objet du sac");
  cliquer(s.jeton);
  assert.deepEqual(s.vus, [], "⛔ le clic gauche a ouvert la fiche : il doit armer (réponse 1a)");
  assert.ok(arme(s.jeton), "⛔ le clic gauche n'arme pas l'objet du sac");
  const lit = allumees(s.n);
  assert.ok(lit.length > 0, "⛔ aucune case libre ne s'allume");
  assert.ok(lit.every((c) => c.dataset.occupe !== "oui"), "⛔ une case occupée s'allume (5b)");
  const caseVide = lit.find((c) => c.dataset.creneau !== "collecteur");
  appuyerSur(caseVide);
  assert.deepEqual(s.places, [[4, caseVide.dataset.creneau]], "⛔ le clic sur la case allumée n'y pose pas l'objet");
  assert.ok(!arme(s.jeton), "posé, il se désarme");
});

test("347 · Pack — VOIR : le clic droit ouvre la fiche UNE fois ; au doigt, le tap l'ouvre", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const s = sac();
    clicDroit(s.jeton);
    assert.deepEqual(s.vus, [4], "⛔ le clic droit n'ouvre pas la fiche, ou l'ouvre deux fois");
    cliquer(s.jeton, "touch", 2);
    assert.deepEqual(s.vus, [4, 4], "⛔ au doigt, le tap ne voit pas");
    assert.ok(!arme(s.jeton), "⛔ un tap court a armé");
  } finally { mock.timers.reset(); }
});

test("347 · Pack → Gear au doigt, SANS GLISSER : appui long sur l'objet, puis tap sur la case de Gear voisine", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const poses = [];
    const n = el("div");
    const s = construireLeSac({ sections: [{ nom: "Camp" }], section: 0, poids: {}, destinations: [],
      objets: [{ index: 4, nom: "Rope", qte: 1 }], surDepotVoisin: (i, boite) => poses.push([i, boite]) }).noeud;
    const g = construireLEcranGear({ boites: {}, collecte: new Set(), recoitVoisin: true }).noeud;
    const gauche = el("div"); gauche.dataset.demiEcran = "gauche"; gauche.append(s);
    const droite = el("div"); droite.dataset.demiEcran = "droite"; droite.append(g);
    n.append(gauche, droite);
    monter(n);
    const jeton = s.querySelectorAll('[data-occupe="oui"]').find((c) => c.dataset.organe !== "collecteur");
    jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 3, button: 0, pointerType: "touch" });
    mock.timers.tick(MAINTIEN_EQUIPEMENT_MS);
    assert.ok(arme(jeton), "⛔ l'appui long n'arme pas l'objet du sac");
    assert.equal(jeton.dataset.flash, "halo", "⛔ l'appui long ne fait pas son flash");
    document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 3 });
    const caseDeGear = allumees(g).find((c) => c.dataset.creneau !== "collecteur");
    assert.ok(caseDeGear, "⛔ aucune case de Gear voisine ne s'allume");
    assert.equal(allumees(g).filter((c) => c.dataset.creneau === "collecteur").length, 0, "⛔ le collecteur de Gear s'allume : un objet du sac n'y va pas");
    appuyerSur(caseDeGear);
    assert.deepEqual(poses, [[4, caseDeGear.dataset.creneau]], "⛔ le tap sur la case de Gear n'y pose pas l'objet");
  } finally { mock.timers.reset(); }
});

test("347 · Gear — clic gauche ARME, clic droit VOIT (une fois), clic sur une case libre y pose", () => {
  const g = gear();
  cliquer(g.jeton);
  assert.deepEqual(g.vus, [], "⛔ le clic gauche a ouvert la fiche");
  assert.ok(arme(g.jeton), "⛔ le clic gauche n'arme pas l'objet de Gear");
  const lit = allumees(g.n);
  assert.ok(lit.some((c) => c.dataset.creneau === "collecteur"), "⛔ le collecteur vide n'est pas une destination");
  assert.equal(lit.filter((c) => c.dataset.creneau === "tete2").length, 0, "⛔ une case occupée s'allume (5b)");
  const libre = lit.find((c) => c.dataset.creneau !== "collecteur");
  appuyerSur(libre);
  assert.deepEqual(g.places, [[3, libre.dataset.creneau]]);
  clicDroit(g.jeton);
  assert.deepEqual(g.vus, [3], "⛔ le clic droit n'ouvre pas la fiche, ou l'ouvre deux fois");
});

test("347 · 6b — un objet VERROUILLÉ (Pack, Gear) : le clic gauche REFUSE, ⛔ ne se lève pas ; il se VOIT au clic droit et au tap", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    for (const [nom, e] of [["Pack", sac()], ["Gear", gear()]]) {
      const v = e.verrou;
      assert.ok(v, `${nom} : un objet verrouillé`);
      assert.notEqual(v.dataset.glissable, "true", `⛔ ${nom} : un objet verrouillé est armé pour le glisser`);
      v.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
      v.dispatchEvent({ type: "click", detail: 1 });
      assert.equal(v.dataset.flash, "refus", `⛔ ${nom} : le clic gauche sur un verrou ne refuse pas`);
      assert.equal(e.vus.length, 0, `⛔ ${nom} : le clic gauche sur un verrou a ouvert la fiche`);
      assert.ok(!arme(v), `⛔ ${nom} : un verrou s'est armé`);
      clicDroit(v);
      assert.equal(e.vus.length, 1, `⛔ ${nom} : le clic droit ne voit pas le verrou`);
      v.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 2, button: 0, pointerType: "touch" });
      v.dispatchEvent({ type: "click", detail: 1 });
      assert.equal(e.vus.length, 2, `⛔ ${nom} : au doigt, le tap ne voit pas le verrou`);
      mock.timers.tick(1000);
    }
  } finally { mock.timers.reset(); }
});

test("347 · Wares — le clic gauche ARME l'objet de la grille (le collecteur s'allume) ; un clic sur lui y dépose ; clic droit = X2", () => {
  const vus = []; const deposes = [];
  const n = monter(construireLesWares({
    categories: [{ nom: "Armory" }], categorie: 0, sousCategories: [{ nom: "Rings" }], sousCategorie: 0,
    objets: [{ ref: "srd:item:en:a", nom: "Rope", qte: 1 }], sections: [{ valeur: "backpack", mot: "Backpack" }],
    destination: "backpack", surJeton: (r) => vus.push(r), surDepot: (r) => deposes.push(r),
  }).noeud);
  const jeton = n.querySelector('[data-ref-id="srd:item:en:a"]');
  assert.ok(jeton, "un objet de la grille");
  cliquer(jeton);
  assert.deepEqual(vus, [], "⛔ le clic gauche a ouvert le X2");
  const collecteur = allumees(n).find((c) => c.dataset.organe === "collecteur");
  assert.ok(collecteur, "⛔ le collecteur ne s'allume pas");
  appuyerSur(collecteur);
  assert.deepEqual(deposes, ["srd:item:en:a"], "⛔ le clic sur le collecteur allumé n'y dépose pas");
  clicDroit(jeton);
  assert.deepEqual(vus, ["srd:item:en:a"], "⛔ le clic droit n'ouvre pas le X2, ou l'ouvre deux fois");
});

test("347 · X5 — le jeton du craft : clic droit = aperçu ; ⛔ sans voisin prêt, le clic gauche refuse (6b)", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    let vus = 0;
    const jeton = el("button"); jeton.type = "button";
    monter(jeton);
    jetonAuVoisin(jeton, { apercu: () => { vus += 1; }, pret: false, envoi: () => ({}), surDepotVoisin: () => {} });
    clicDroit(jeton);
    assert.equal(vus, 1, "⛔ le clic droit ne montre pas l'aperçu");
    cliquer(jeton);
    assert.equal(vus, 1, "⛔ le clic gauche a montré l'aperçu : il doit armer");
    assert.equal(jeton.dataset.flash, "refus", "⛔ sans destination, le clic gauche ne refuse pas");
    mock.timers.tick(1000);
  } finally { mock.timers.reset(); }
});

function el(balise) { return document.createElement(balise); }
