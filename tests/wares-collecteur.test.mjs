/* ══ LE COLLECTEUR DE WARES GARDE L'OBJET, ET `Send` L'ACHÈTE — lot 315, 2026-09-27 ═══════════
   ⚖️ Eric, 27/09, mot pour mot : *« Le drag and drop de wares ne fonctionne tj pas »* · *« Harmonise
   le pied de page pack et wares, prends pack comme modèles, déplace encumbrance sous l'or dans
   wares »*. Et la règle des collecteurs, 26/09 : *« son contenu n'est pas un item tant qu'on n'a pas
   fait send »*. NORMES `equipement-wares-collecteur-garde-l-objet`.

   📏 LA PANNE, MESURÉE À LA v854/v855 : le geste marchait (fantôme, `data-vise`, dépôt), mais le
   dépôt faisait `cartAdd` — l'objet partait au Tally, et à l'écran RIEN ne changeait.

   CE QUE CE FICHIER TIENT — chaque garde a été vu ROUGE par une mutation de la source (restaurée,
   empreinte sha256 comparée) :
     1. l'écran : le collecteur de Wares EST celui de Pack (mêmes classes, même mot à vide) ; plein,
        il dit le nom (×qte) et reste une cible ; le tap sur l'objet retenu publie `surRetenu` ;
     2. le pilote, écran réel monté par l'étape : glisser → le collecteur montre l'objet, RIEN
        n'est écrit ; un second dépôt remplace le premier ;
     3. `Send`, plein → le popup d'achat du lot 307 ; `Cancel` ne vide pas ; `Buy` paie, pose à la
        destination du dropdown, et vide le collecteur ;
     4. `Send`, vide → le comportement d'avant (la liste d'envoi), sans popup. */

import test, { mock } from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
const { MAINTIEN_EQUIPEMENT_MS } = await import("../ui/builder/glisser.mjs");
/* ⏱️ LOT 331 — LE PÉAGE DE L'ÉTAPE : un glisser d'Equipment ne s'active qu'après
   `MAINTIEN_EQUIPEMENT_MS` d'appui (Eric, 27/09 : « Le drag doit attendre 500 ms »). Le geste
   simulé TIENT donc le jeton avant de le porter — sur une horloge simulée, pas une vraie attente. */
function tenirLeJeton(appui) {
  mock.timers.enable({ apis: ["setTimeout"] });
  try { appui(); mock.timers.tick(MAINTIEN_EQUIPEMENT_MS); } finally { mock.timers.reset(); }
}


globalThis.document = createTestDocument();

const { construireLesWares } = await import("../ui/builder/wares-ecran.mjs");
const { renderEquipmentStep, butinDuDepart, appliquerLeButin, departRepondu, pageActiveDeLEquipement } =
  await import("../ui/builder/equipment-step.mjs");
const { motDuMontant } = await import("../ui/builder/double-ecran.mjs");

const tous = (n, sel) => [...n.querySelectorAll(sel)];
const classes = (n) => String(n.className || "").split(/\s+/);
const cliquer = (n) => n.dispatchEvent({ type: "click", target: n, detail: 1 });
const choisir = (select, valeur) => { select.value = valeur; select.dispatchEvent({ type: "change", target: select }); };
const popups = (acts) => acts.filter((a) => a.kind === "popup" && a.texte);

/** Un glisser au DOIGT jusqu'à `cible` — la forme de `glisser.test.mjs` et `double-ecran.test.mjs`. */
function glisser(jeton, cible) {
  document.elementFromPoint = () => cible;
  tenirLeJeton(() => jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 9, button: 0, pointerType: "touch" }));
  document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 40, pointerId: 9 });
  document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 40, pointerId: 9 });
  document.elementFromPoint = () => null;
}

/* ══ 1 · L'ÉCRAN ════════════════════════════════════════════════════════════════════ */
const monter = (extra = {}) => construireLesWares({
  categories: [{ nom: "Armory" }], categorie: 0, sousCategories: [{ nom: "Rings" }], sousCategorie: 0,
  objets: [{ ref: "srd:item:en:a", nom: "Rope", qte: 1 }, { ref: "srd:item:en:b", nom: "Lamp", qte: 1 }],
  sections: [{ valeur: "backpack", mot: "Backpack" }], destination: "backpack", ...extra,
}).noeud;

test("1 · le collecteur de Wares est celui de Pack : vide, « Send collector » ; plein, le nom — et il reste une cible", () => {
  const vide = monter().querySelector('[data-organe="collecteur"]');
  assert.ok(classes(vide).includes("gear-collecteur"), "⛔ Wares ne porte pas le collecteur de Pack (`gear-collecteur`)");
  assert.equal(vide.querySelector(".gear-nom").textContent, "Send collector");
  assert.equal(vide.dataset.compte, "0");
  assert.equal(vide.dataset.occupe, undefined, "⛔ un collecteur vide se dit occupé");

  const vus = [];
  const plein = monter({ retenu: { nom: "Rope", qte: 3 }, surRetenu: () => vus.push("x2") })
    .querySelector('[data-organe="collecteur"]');
  assert.equal(plein.dataset.occupe, "oui", "⛔ le collecteur plein ne se dit pas occupé");
  assert.equal(plein.querySelector(".jeton-nom").textContent, "Rope ×3", "⛔ il ne dit pas le nom de l'objet (et sa quantité)");
  assert.equal(plein.getAttribute("aria-label"), "Send collector — Rope");
  assert.equal(plein.dataset.creneau, "wares:collecteur",
    "⛔ plein, il a cessé d'être une cible : un second dépôt ne pourrait plus remplacer le premier");
  /* 🔄 LOT 331 — le collecteur plein est ARMÉ (il se glisse vers la page voisine) : son tap est
     celui de `armerJeton` — un appui relâché sans bouger —, ⛔ plus un `click`, qui ouvrirait la
     fiche une seconde fois après chaque glisser. */
  plein.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 3, button: 0, pointerType: "touch" });
  document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 3 });
  assert.deepEqual(vus, ["x2"], "⛔ le tap sur l'objet retenu n'ouvre pas sa fiche");
  cliquer(plein);
  assert.deepEqual(vus, ["x2"], "⛔ un `click` ouvre la fiche une seconde fois");
});

test("1 bis · `Send to` est celui de Pack : `.sac-destination` et `.pipeline-dropdown`, ⛔ plus `select.wares-send-vers`", () => {
  const n = monter();
  const boite = n.querySelector('[data-organe="send-vers"]');
  assert.ok(classes(boite).includes("sac-destination"), "⛔ la boîte de `Send to` n'est pas celle de Pack");
  assert.equal(tous(boite, "select.pipeline-dropdown").length, 1, "⛔ le select n'est pas l'organe du §8");
  assert.equal(tous(n, ".wares-send-vers").length, 0, "⛔ le dropdown maison de Wares est revenu");
});

/* ══ 2 · LE PILOTE — l'écran réel, monté par l'étape ══════════════════════════════════ */
const fixture = exempleFhEn();
const { build, layers } = fixture;
const query = layers.verbs.query;

function personnage() {
  let doc = fixture.document;
  if (!departRepondu(doc)) {
    const butin = butinDuDepart({ query, document: doc, reponses: { class: "A" } });
    doc = appliquerLeButin({ document: doc, verbs: build.verbs, query, butin });
  }
  /* ⚠️ une bourse riche DANS CHAQUE PIÈCE : `bourseCouvre` compare pièce à pièce (il ne fait pas
     la monnaie), et un objet à 5 SP serait refusé par une bourse de 50 000 GP sans une pièce d'argent */
  for (const [k, v] of [["cp", 50000], ["sp", 50000], ["gp", 50000], ["pp", 0]]) {
    doc = build.verbs.set({ document: doc, path: `currency.${k}`, value: v }).document;
  }
  return doc;
}
const DOC = personnage();
const rendre = (acts) => renderEquipmentStep({ document: DOC, resolved: null, query, search: true }, (a) => acts.push(a));
/** l'étape ouverte sur Wares (la porte du pied de R) */
function wares(acts) {
  const n = rendre(acts);
  if (pageActiveDeLEquipement() !== "r") cliquer(n.querySelector('.porte-carree[data-porte="wares"]'));
  assert.equal(pageActiveDeLEquipement(), "r", "l'étape n'est pas sur Wares");
  /* ⭐ la navigation écrit la 3ᵉ ligne du belt (`fenetre`) : ce n'est pas le geste mesuré */
  acts.length = 0;
  return n;
}
/** un jeton de la grille qui a un prix connu (le popup d'achat en a besoin) — lu dans son nom */
const collecteur = (n) => n.querySelector('.wares [data-organe="collecteur"]');
const jetonsVisibles = (n) => tous(n, ".wares-grille").filter((g) => !g.hasAttribute("inert"))
  .flatMap((g) => tous(g, ".wares-jeton"));

test("2 · glisser un jeton sur le collecteur : il MONTRE l'objet, et rien n'est écrit — un second dépôt le remplace", () => {
  const acts = [];
  const n = wares(acts);
  const [j1, j2] = jetonsVisibles(n);
  const nom = (j) => j.querySelector(".jeton-nom").textContent;
  glisser(j1, collecteur(n));
  assert.equal(collecteur(n).dataset.occupe, "oui", "⛔ le dépôt ne se voit pas : la panne du lot 315");
  assert.equal(collecteur(n).querySelector(".jeton-nom").textContent, nom(j1));
  assert.deepEqual(acts, [], "⛔ le dépôt a écrit : le contenu d'un collecteur n'est pas un item avant Send");
  glisser(jetonsVisibles(n)[1], collecteur(n));
  assert.equal(collecteur(n).querySelector(".jeton-nom").textContent, nom(j2), "⛔ un second dépôt ne remplace pas le premier");
  assert.deepEqual(acts, []);
});

test("3 · `Send`, collecteur plein : le popup d'achat ; Cancel ne vide pas ; Buy paie, pose au sac, et vide", () => {
  const acts = [];
  const n = wares(acts);
  assert.equal(collecteur(n).dataset.occupe, "oui", "le collecteur retient l'objet du garde 2 (état d'écran)");
  cliquer(n.querySelector('.wares [data-porte="send"]'));
  const [p] = popups(acts);
  assert.ok(p, "⛔ `Send` n'ouvre pas le popup d'achat");
  assert.match(p.texte, /^Buy this item for [\d,]+ (PP|GP|SP|CP)( [\d,]+ (GP|SP|CP))*\?$/);
  assert.deepEqual(p.actions.map((a) => a.mot), ["Buy", "Cancel"]);
  assert.equal(p.exigeUneReponse, true, "⛔ un achat est une intention : il exige une réponse");

  /* Cancel : fermer, rien d'autre — et le collecteur GARDE l'objet */
  const avant = acts.length;
  p.actions[1].faire();
  assert.deepEqual(acts.slice(avant), [{ kind: "popup", texte: null }], "⛔ Cancel a écrit quelque chose");
  assert.equal(collecteur(wares(acts)).dataset.occupe, "oui", "⛔ Cancel a vidé le collecteur");

  /* Buy : payer, puis poser à la destination du dropdown (Backpack par défaut) — le geste de X2 */
  const apres = acts.length;
  p.actions[0].faire();
  const gestes = acts.slice(apres);
  assert.deepEqual(gestes.map((a) => a.kind), ["payer", "addGearLine"], "⛔ Buy n'est pas le geste d'achat de X2");
  assert.equal(gestes[1].location, "backpack");
  assert.equal(p.texte, `Buy this item for ${motDuMontant(gestes[0].cout)}?`, "⭐ le montant affiché EST celui débité");
  const vide = collecteur(wares(acts));
  assert.equal(vide.dataset.occupe, undefined, "⛔ Buy n'a pas vidé le collecteur");
  assert.equal(vide.querySelector(".gear-nom").textContent, "Send collector");
});

test("3 bis · la destination est celle du dropdown `Send to` de Wares : Gear → l'objet est posé sur soi", () => {
  const acts = [];
  let n = wares(acts);
  choisir(n.querySelector('.wares [data-organe="send-vers"] select'), "self");
  n = wares(acts);
  glisser(jetonsVisibles(n)[0], collecteur(n));
  cliquer(n.querySelector('.wares [data-porte="send"]'));
  const [p] = popups(acts);
  const apres = acts.length;
  p.actions[0].faire();
  const pose = acts.slice(apres).find((a) => a.kind === "addGearLine");
  assert.ok(pose, "⛔ Buy n'a rien posé");
  assert.equal(pose.location, "self", "⛔ la destination du dropdown est ignorée");
  choisir(wares(acts).querySelector('.wares [data-organe="send-vers"] select'), "backpack");
});

test("4 · `Send`, collecteur vide : le comportement d'avant — aucun popup", () => {
  const acts = [];
  const n = wares(acts);
  assert.equal(collecteur(n).dataset.occupe, undefined, "le collecteur est vide");
  cliquer(n.querySelector('.wares [data-porte="send"]'));
  assert.equal(popups(acts).length, 0, "⛔ Send à vide ouvre un popup d'achat");
  assert.equal(pageActiveDeLEquipement(), "sb32", "⛔ Send à vide n'ouvre plus la liste d'envoi");
});

test("5 · ⏱️ LOT 331 · 339 : au DOIGT le glisser attend 500 ms (porté plus tôt : ni glisser ni tap) ; à la SOURIS il part tout de suite", () => {
  /* ⚖️ Eric, 27/09 : « Le drag doit attendre 500 ms, avant de s'activer » ; puis 28/09 : « oui fait la
     distinction, souris doigt » — l'appui long est un geste du doigt. */
  const porter = (pointerType, avantArmement) => {
    const vus = [];
    const n = monter({ surJeton: () => vus.push("x2"), surDepot: () => vus.push("depot") });
    const cible = n.querySelector('[data-organe="collecteur"]');
    document.elementFromPoint = () => cible;
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      n.querySelector(".wares-jeton").dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 4, button: 0, pointerType });
      mock.timers.tick(avantArmement);
      document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 40, pointerId: 4 });
      document.dispatchEvent({ type: "pointermove", clientX: 80, clientY: 80, pointerId: 4 });
      document.dispatchEvent({ type: "pointerup", clientX: 80, clientY: 80, pointerId: 4 });
    } finally { mock.timers.reset(); document.elementFromPoint = () => null; }
    return vus;
  };
  assert.deepEqual(porter("touch", MAINTIEN_EQUIPEMENT_MS - 1), [], "⛔ au doigt, porté avant 500 ms : ni dépôt, ni fiche ouverte");
  assert.deepEqual(porter("touch", MAINTIEN_EQUIPEMENT_MS), ["depot"], "⭐ au doigt, tenu 500 ms : le dépôt");
  assert.deepEqual(porter("mouse", 0), ["depot"], "⛔ à la souris, le glisser attend encore : il doit partir tout de suite");
});
