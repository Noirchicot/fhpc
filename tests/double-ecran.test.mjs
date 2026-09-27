/* ══ 🪟 LE DOUBLE ÉCRAN DE L'ÉTAPE EQUIPMENT — lot 307, 2026-09-27 ═══════════════════
   ⚖️ Eric, 26/09 : *« Si on est en double screen le drop du token dans un collecteur de la
   page voisine. Génère un popup. Varie en fonction »* ; « sur quel écran ? » → *« c »*
   (iPad couché ET ordinateur) ; l'exception du Tally (27/09) : *« quand l'item est
   transféré dans un Tally, il est crafté mais le paiement s'il est requis est différé au
   Tally. Cela doit apparaître dans le popup »*, puis *« Le group et le part tally »*.

   CE QUE CE FICHIER TIENT — chaque garde a été vu ROUGE par mutation (source restaurée,
   empreinte sha256 comparée) avant d'être gardé vert :
     1. sous la place, UNE page — et l'étape n'écrit rien de neuf dans le DOM ;
     2. au-dessus, DEUX pages, Gear à droite ;
     3. un jeton lâché dans le collecteur VOISIN ouvre le popup qui correspond, avec le
        texte ratifié et le montant LU ;
     4. accepter = le geste existant, au geste près ; Cancel = rien ne bouge ;
     5. un dépôt dans la MÊME page garde son geste d'aujourd'hui, sans popup ;
     6. un objet crafté vers un Tally reste DÉSACTIVÉ tant que le panier ne porte pas de
        recette — et le garde relit le panier pour le savoir.

   ⚠️ CE QU'IL NE TIENT PAS, ET QUI SE REGARDE : la géométrie (758 × 560, les deux pages
   de 375, le halo) — elle a été mesurée au navigateur, au doigt (CDP `touchStart/Move/End`)
   et à la souris ; la coquille ne se monte pas hors navigateur. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (p) => stripComments(fs.readFileSync(path.join(ROOT, p), "utf8"));

const {
  regimeDeLaVue, pagesDuDoubleEcran, choixDeLaLune, construireLaLune, popupDuDepotVoisin, genreDeLaCible, motDuMontant,
  LE_TALLY_PORTE_UN_OBJET_CRAFTE, VUES_TALLY
} = await import("../ui/builder/double-ecran.mjs");
const { renderEquipmentStep, butinDuDepart, appliquerLeButin, departRepondu, pageVoisineDeLEquipement,
  pageActiveDeLEquipement, choisirLeSatellite } = await import("../ui/builder/equipment-step.mjs");
const W = await import("../ui/builder/wares-disposition.mjs");
const SAC = await import("../ui/builder/sac-disposition.mjs");
const { currentCartLines } = await import("../ui/builder/equipement-pipeline.mjs");
const { estUnCreneauVoisin, armerJeton } = await import("../ui/builder/glisser.mjs");
const { EN_DEPOT_VOISIN, EN_LUNE } = await import("../src/labels.mjs");
const X5E = await import("../ui/builder/x5-ecran.mjs");

const fixture = exempleFhEn();
const { build, layers } = fixture;
const query = layers.verbs.query;

/* Un personnage au départ RÉPONDU (sinon Gear est X0 et n'a pas de collecteur), riche : un
   `Craft & pay` refusé pour la bourse ne prouverait rien du geste. */
function personnage() {
  let doc = fixture.document;
  if (!departRepondu(doc)) {
    const butin = butinDuDepart({ query, document: doc, reponses: { class: "A" } });
    doc = appliquerLeButin({ document: doc, verbs: build.verbs, query, butin });
  }
  for (const [k, v] of [["cp", 0], ["sp", 0], ["gp", 50000], ["pp", 0]]) {
    doc = build.verbs.set({ document: doc, path: `currency.${k}`, value: v }).document;
  }
  return doc;
}

/** Une moitié d'écran : l'étape rendue comme la coquille la rend en double écran. */
function moitie(doc, demiEcran, acts) {
  return renderEquipmentStep({ document: doc, resolved: null, query, search: true, demiEcran },
    (a) => acts.push(a));
}

/** Un glisser au DOIGT, comme `glisser.test.mjs` : la cible est ce que
 *  `elementFromPoint` rend — le navigateur la cherche sur TOUT le document. */
function glisser(jeton, cible) {
  document.elementFromPoint = () => cible;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 7, button: 0, pointerType: "touch" });
  document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 7 });
  document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 0, pointerId: 7 });
  document.elementFromPoint = () => null;
}
const cliquer = (n) => n.dispatchEvent({ type: "click", target: n, detail: 1 });
const choisir = (select, valeur) => { select.value = valeur; select.dispatchEvent({ type: "change", target: select }); };
const popups = (acts) => acts.filter((a) => a.kind === "popup" && a.texte);

/* ══ 1 — QUAND : sans place, rien ; sans COMMANDE, rien non plus (27/09) ═════════════ */
test("1 — 🔴 SOUS LA PLACE, UNE SEULE PAGE — ni la commande ni l'étape ne rouvrent un second panneau", () => {
  for (const voulue of [false, true]) {
    for (const etape of ["equipment", "class", null]) {
      assert.deepEqual(regimeDeLaVue({ place: false, voulue, etape }), { double: false, pages: false },
        `place absente, voulue=${voulue}, étape=${etape} : l'iPhone garde l'écran d'aujourd'hui`);
    }
  }
});

test("2 — ⛔ PAS DE SATELLITE SANS LA LUNE — la règle ④ du 14/09 : le double est ouvert par la fiche principale", () => {
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: false, etape: "equipment", satellite: false }), { double: false, pages: false },
    "⛔ la place seule n'ouvre rien (Eric, 27/09 : « Une commande pour ouvrir le double écran »)");
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: false, etape: "equipment", satellite: true }), { double: true, pages: true },
    "la lune de la principale a ouvert un satellite");
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: true, etape: "equipment", satellite: false }), { double: true, pages: false },
    "⭐ l'interrupteur du Menu garde SA double vue (lot 120) — il n'ouvre pas de satellite");
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: true, etape: "class", satellite: true }), { double: true, pages: false },
    "hors de l'Équipement, un satellite n'existe pas");
  assert.deepEqual(regimeDeLaVue({ place: false, voulue: true, etape: "equipment", satellite: true }), { double: false, pages: false });
  const shell = lire("ui/builder/shell.mjs");
  assert.match(shell, /satellite: pageVoisineDeLEquipement\(\) !== null,/, "la coquille demande le satellite à l'étape");
});

test("3 — 🪟 LA PAGE CHOISIE À GAUCHE (la flèche ← du croquis), l'active à droite ; jamais deux fois la même", () => {
  assert.deepEqual(pagesDuDoubleEcran({ active: "gear", voisine: "sac" }), { gauche: "sac", droite: "gear", active: "droite" });
  assert.deepEqual(pagesDuDoubleEcran({ active: "r", voisine: "gear" }), { gauche: "gear", droite: "r", active: "droite" });
  assert.deepEqual(pagesDuDoubleEcran({ active: "gear", voisine: null }), { gauche: "sac", droite: "gear", active: "droite" },
    "l'interrupteur du Menu, sans choix : le défaut");
  assert.deepEqual(pagesDuDoubleEcran({ active: "gear", voisine: "gear" }), { gauche: "sac", droite: "gear", active: "droite" },
    "⛔ une voisine égale à l'active cède au défaut");
  assert.deepEqual(pagesDuDoubleEcran({ active: "x5", voisine: null }).gauche, "gear");
});

test("3 bis — 🌕 CE QUE LA LUNE PROPOSE : les écrans des archives — Backpack · Tally · Wares · Gear — sauf la principale et le satellite", () => {
  const v = (o) => choixDeLaLune(o).map((c) => c.valeur);
  assert.deepEqual(v({ principale: "gear" }), ["sac", "b2", "r"], "l'ordre des lunes du croquis du 14/09");
  assert.deepEqual(v({ principale: "r" }), ["sac", "b2", "gear"]);
  assert.deepEqual(v({ principale: "gear", satellite: "sac" }), ["b2", "r", "fermer"],
    "⛔ pas le satellite déjà ouvert — et « Close » en dernier (Eric, 27/09 : « La lune propose un close dans son dropdown »)");
  /* 🔄 LOT 319 — Eric, 27/09 : « Close / Side screen » — le mot dit CE QU'il ferme */
  assert.equal(choixDeLaLune({ principale: "gear", satellite: "sac" }).at(-1).mot, "Close side screen");
  assert.ok(!v({ principale: "gear" }).includes("fermer"), "sans satellite, rien à fermer");
  /* ⛔ LA FORGE PEUT OUVRIR, JAMAIS ÊTRE OUVERTE (Eric, 27/09) : depuis X5 la lune propose les
     quatre écrans ; aucune lune, d'aucune page, ne propose X5 ni son aperçu */
  assert.deepEqual(v({ principale: "x5" }), ["sac", "b2", "r", "gear"]);
  for (const p of ["gear", "sac", "r", "b2", "x5"]) {
    for (const sat of [null, "sac", "gear"]) {
      assert.ok(!v({ principale: p, satellite: sat }).some((x) => x === "x5" || x === "x1-apercu"), `${p}/${sat}`);
    }
  }
  assert.deepEqual(choixDeLaLune({ principale: "gear" }).map((c) => c.mot), ["Backpack", "Tally", "Wares"]);
  assert.ok(!v({ principale: "gear" }).includes("x5"), "⛔ la Forge ne s'ouvre pas seule : il lui faut un plan");
  assert.ok(!choixDeLaLune({ principale: "gear", satellite: "sac" }).some((c) => /one screen/i.test(c.mot)),
    "⛔ « Back to one screen » n'est plus dans le menu : c'est « Close » (et « Close double screen » au rail)");
});

test("4 — ⚖️ LA COQUILLE DEMANDE À L'ORGANE UNIQUE — la place reste `laPlaceDuDouble`, jamais une seconde porte", () => {
  const shell = lire("ui/builder/shell.mjs");
  assert.match(shell, /regimeDeLaVue\(\{ place: laPlaceExiste\(\)/, "la place vient de la porte du lot 120");
  assert.equal((shell.match(/regimeDeLaVue\(/g) || []).length, 1, "⛔ un seul appel : un seul régime");
  assert.ok(!/innerWidth\s*[<>]=?\s*\d/.test(shell), "⛔ aucune largeur écrite en dur dans la coquille");
  /* le ctx de l'étape ne grandit QUE en double écran, et la lune QUE si la place existe */
  assert.match(shell, /if \(demiEcranEnCours\) ctx\.demiEcran = demiEcranEnCours;/);
  assert.match(shell, /if \(laPlaceExiste\(\)\) ctx\.placeDuDouble = true;/);
  /* la question du dépôt voyage jusqu'au popup : `exigeUneReponse` n'est plus jeté */
  assert.match(shell, /exigeUneReponse: action\.exigeUneReponse === true/);
});

/* ══ 5 — SOUS LA PLACE, LE DOM EST CELUI D'AVANT ════════════════════════════════════ */
test("5 — 🔴 SANS MOITIÉ D'ÉCRAN, L'ÉTAPE N'ÉCRIT AUCUN ATTRIBUT NEUF et le geste reste celui d'avant", () => {
  const acts = [];
  const doc = personnage();
  const gear = moitie(doc, undefined, acts);
  const neufs = ["data-demi-ecran", "data-vue-equipement", "data-recoit-voisin", "data-voisine"];
  const porteurs = (n) => [n, ...n.querySelectorAll("*")].filter((e) => neufs.some((a) => e.hasAttribute(a)));
  assert.equal(porteurs(gear).length, 0, "Gear en vue simple : aucun attribut du double écran");
  assert.equal(gear.querySelector('[data-organe="lune"]'), null, "⛔ sans la place : pas de lune");
  /* ⭐ ET LE GESTE : sans moitié, `estUnCreneauVoisin` ne voit jamais de voisin */
  const a = document.createElement("div"); const b = document.createElement("div");
  assert.equal(estUnCreneauVoisin(a, b), false);
  assert.equal(acts.length, 0, "un rendu n'écrit rien");
});

/* ══ 6 — LA PORTE DU GESTE : un créneau voisin n'atteint JAMAIS `onDepot` ═══════════ */
test("6 — ⛔ UN CRÉNEAU DE L'AUTRE MOITIÉ N'ATTEINT PAS `onDepot` ; receveur + `onDepotVoisin` seulement", () => {
  const racine = document.createElement("div");
  const g = document.createElement("section"); g.dataset.demiEcran = "gauche";
  const d = document.createElement("section"); d.dataset.demiEcran = "droite";
  racine.append(g, d);
  const jeton = document.createElement("button"); g.append(jeton);
  const muet = document.createElement("div"); muet.dataset.creneau = "collecteur"; d.append(muet);
  const receveur = document.createElement("div"); receveur.dataset.creneau = "collecteur";
  receveur.dataset.recoitVoisin = "true"; d.append(receveur);
  const chez = document.createElement("div"); chez.dataset.creneau = "collecteur"; g.append(chez);
  const recus = [];
  armerJeton(jeton, { onTap: () => recus.push("tap"), onDepot: (c) => recus.push(`depot:${c}`),
    onDepotVoisin: (c, cible) => recus.push(`voisin:${c}:${cible === receveur}`) });
  glisser(jeton, muet);
  assert.deepEqual(recus, [], "un créneau voisin qui ne se déclare pas receveur n'existe pas pour ce geste");
  glisser(jeton, receveur);
  assert.deepEqual(recus, ["voisin:collecteur:true"]);
  glisser(jeton, chez);
  assert.deepEqual(recus, ["voisin:collecteur:true", "depot:collecteur"], "la même page : le dépôt d'aujourd'hui");
  /* et sans `onDepotVoisin`, le receveur voisin n'est rien non plus */
  const autre = document.createElement("button"); g.append(autre);
  const r2 = [];
  armerJeton(autre, { onTap: () => {}, onDepot: (c) => r2.push(c), onHorsCible: () => r2.push("vide") });
  glisser(autre, receveur);
  assert.deepEqual(r2, ["vide"], "⛔ un jeton qui ne sait pas servir le voisin lâche dans le vide");
});

/* ══ 7 — LES TEXTES RATIFIÉS, ET LE MONTANT LU ══════════════════════════════════════ */
test("7 — ⚖️ LES SIX PHRASES D'ERIC, MOT POUR MOT, et leurs boutons", () => {
  const m = { pp: 0, gp: 2001, sp: 0, cp: 0 };
  const quinze = { pp: 0, gp: 15, sp: 0, cp: 0 };
  const mots = (p) => p.actions.map((a) => a.mot);
  const craft = popupDuDepotVoisin({ quoi: "craft", statut: "Crafting", cible: "corps", montant: m });
  assert.equal(craft.texte, "Craft this item for 2,001 GP?");
  assert.deepEqual(mots(craft), ["Craft & pay", "Cancel"]);
  const trouve = popupDuDepotVoisin({ quoi: "craft", statut: "Found", cible: "corps", montant: null });
  assert.equal(trouve.texte, "You found this item. It goes to your backpack.");
  assert.deepEqual(mots(trouve), ["OK"]);
  const achat = popupDuDepotVoisin({ quoi: "achat", cible: "corps", montant: quinze });
  assert.equal(achat.texte, "Buy this item for 15 GP?");
  assert.deepEqual(mots(achat), ["Buy", "Cancel"]);
  const auTally = popupDuDepotVoisin({ quoi: "achat", cible: "tally", montant: quinze });
  assert.equal(auTally.texte, "Add this item to the Tally for 15 GP?");
  assert.deepEqual(mots(auTally), ["Add", "Cancel"]);
  /* les deux phrases du craft vers un Tally existent au fichier de libellés, prêtes */
  assert.equal(EN_DEPOT_VOISIN["depot-voisin.craft-au-tally"]({ montant: "2,001 GP" }),
    "Craft this item? Its 2,001 GP will be paid at the Tally.");
  assert.equal(EN_DEPOT_VOISIN["depot-voisin.trouve-au-tally"], "You found this item. It goes to the Tally.");
  for (const p of [craft, trouve, achat, auTally]) {
    assert.equal(p.exigeUneReponse, true, "un dépôt est une question : il ne se referme pas d'un clic à côté");
    assert.equal(p.role, "aiguilleur");
  }
  assert.equal(motDuMontant({ gp: 2200 }), "2,200 GP");
  assert.equal(motDuMontant({ sp: 5 }), "5 SP");
});

test("8 — ⛔ UN OBJET CRAFTÉ VERS UN TALLY RESTE DÉSACTIVÉ, et c'est le PANIER qui le dit", () => {
  assert.equal(LE_TALLY_PORTE_UN_OBJET_CRAFTE, false);
  for (const statut of ["Crafting", "Found", "Buying"]) {
    assert.equal(popupDuDepotVoisin({ quoi: "craft", statut, cible: "tally", montant: { gp: 1 } }), null, statut);
  }
  /* ⭐ LA RAISON SE RELIT : une ligne `cart[N]` ne porte ni bonus, ni pouvoirs, ni variante,
     ni sort. Le jour où elle en porte, ce garde rougit — il est temps de rallumer le cas. */
  let doc = fixture.document;
  doc = build.verbs.choose({ document: doc, path: "cart[0]", ref: { kind: "gear", id: "srd:gear:en:crowbar" } }).document;
  const [ligne] = currentCartLines(doc);
  assert.ok(ligne, "le panier se lit");
  for (const champ of ["bonus", "pouvoirs", "powers", "variante", "variant", "sort", "spell", "recette", "plan"]) {
    assert.equal(champ in ligne, false, `⚠️ le panier porte « ${champ} » — rallumer le craft vers le Tally`);
  }
  assert.deepEqual([...VUES_TALLY], ["b2", "sb32"]);
  assert.equal(genreDeLaCible("b2"), "tally");
  assert.equal(genreDeLaCible("gear"), "corps");
});

/* ══ 9 — WARES → GEAR : le popup d'achat, Buy = l'achat de X2, Cancel = rien ════════ */
test("9 — 🛒 WARES LÂCHÉ SUR GEAR : « Buy this item for … GP? », Buy = `acheterUnObjet`, Cancel = rien", () => {
  const doc = personnage();
  const acts = [];
  const gauche = moitie(doc, { cote: "gauche", page: "r" }, acts);
  const droite = moitie(doc, { cote: "droite", page: "gear" }, []);
  assert.equal(gauche.dataset.vueEquipement, "r");
  assert.equal(droite.dataset.vueEquipement, "gear");
  const receveur = droite.querySelector('[data-creneau="collecteur"][data-recoit-voisin="true"]');
  assert.ok(receveur, "le collecteur de Gear se déclare receveur en double écran");
  const jeton = gauche.querySelector(".wares-jeton");
  const nom = jeton.getAttribute("aria-label") || jeton.textContent;
  glisser(jeton, receveur);
  const [p] = popups(acts);
  assert.ok(p, `le dépôt de « ${nom} » ouvre un popup`);
  assert.match(p.texte, /^Buy this item for [\d,]+ (GP|SP|CP)\?$/);
  assert.deepEqual(p.actions.map((a) => a.mot), ["Buy", "Cancel"]);
  /* Cancel : une seule action, fermer — rien n'est écrit */
  const avant = acts.length;
  p.actions[1].faire();
  assert.deepEqual(acts.slice(avant), [{ kind: "popup", texte: null }], "Cancel ne fait que fermer");
  /* Buy : payer, puis poser — le geste de X2, au sac */
  const apres = acts.length;
  p.actions[0].faire();
  const gestes = acts.slice(apres);
  assert.deepEqual(gestes.map((a) => a.kind), ["payer", "addGearLine"]);
  assert.equal(gestes[1].location, "backpack");
  assert.equal(p.texte, `Buy this item for ${motDuMontant(gestes[0].cout)}?`, "⭐ le montant affiché EST celui débité");
});

/* 🔄 LOT 315 — LA LOI DE LA MÊME PAGE A CHANGÉ, ET CE GARDE LE DIT. Eric, 27/09 : *« Le drag and
   drop de wares ne fonctionne tj pas »* — le dépôt faisait `cartAdd` et rien ne se voyait. Le
   collecteur de Wares GARDE désormais l'objet (comme celui de Pack), et c'est `Send` qui l'achète
   (`tests/wares-collecteur.test.mjs`). ⭐ Ce qui ne bouge pas, et que ce garde tient toujours : un
   dépôt dans la MÊME page n'ouvre AUCUN popup et n'écrit RIEN au document. */
test("10 — 🧺 LA MÊME PAGE GARDE SON GESTE : un jeton de Wares sur le collecteur de Wares y reste, sans popup ni écriture", () => {
  const doc = personnage();
  const acts = [];
  const gauche = moitie(doc, { cote: "gauche", page: "r" }, acts);
  const jeton = gauche.querySelector(".wares-jeton");
  const nom = jeton.querySelector(".jeton-nom").textContent;
  const chez = gauche.querySelector('.wares [data-organe="collecteur"]');
  glisser(jeton, chez);
  assert.equal(popups(acts).length, 0, "⛔ pas de popup dans la même page");
  assert.deepEqual(acts.map((a) => a.kind), [], "⛔ rien n'est écrit : le contenu d'un collecteur n'est pas un item avant Send");
  const retenu = gauche.querySelector('.wares [data-organe="collecteur"]');
  assert.equal(retenu.dataset.occupe, "oui", "⛔ le collecteur ne montre pas l'objet déposé");
  assert.equal(retenu.querySelector(".jeton-nom").textContent, nom);
});

/* ══ 11 — X5 → GEAR : Crafting, Found — le MÊME Send que le bouton ═════════════════ */
/** Ouvre X5 sur `Armor, +1…` depuis Wares, bonus +1, au statut voulu. Rend la moitié gauche. */
function versX5(doc, acts, statut, envoiVers = null) {
  /* ⭐ LE PLAN EST TAPÉ DANS LE SATELLITE (la loupe de Wares, à gauche), ET LA FORGE S'OUVRE DANS LA
     PRINCIPALE : Eric, 27/09, « Le forge peut ouvrir, mais ne peux pas être ouverte ».
     (Par la recherche : le tambour choisit au REPOS d'un défilement, qu'un stub ne sait pas faire.) */
  let gauche = moitie(doc, { cote: "gauche", page: "recherche" }, acts);
  const champ = gauche.querySelector("input");
  champ.value = "Armor, +1"; champ.dispatchEvent({ type: "input", target: champ });
  const plan = gauche.querySelectorAll("button").find((b) => (b.getAttribute("aria-label") || "") === "Open Armor, +1, +2, or +3");
  assert.ok(plan, "la recherche trouve le plan");
  cliquer(plan);
  assert.equal(pageActiveDeLEquipement(), "x5", "⛔ la Forge s'ouvre dans la PRINCIPALE, jamais dans le satellite");
  const g = { cote: "gauche", page: null };
  let fiche = moitie(doc, g, acts);
  const bonus = fiche.querySelector('select[data-organe="BONUS"]');
  choisir(bonus, bonus.querySelectorAll("option").map((o) => o.value).find(Boolean));
  if (statut) { fiche = moitie(doc, g, acts); choisir(fiche.querySelector('select[data-organe="STATUS"]'), statut); }
  if (envoiVers) { fiche = moitie(doc, g, acts); choisir(fiche.querySelector('select[data-organe="SEND TO"]'), envoiVers); }
  return moitie(doc, g, acts);
}

test("11 — ⚒️ X5 CRAFTING LÂCHÉ SUR GEAR : « Craft this item for … GP? » et [Craft & pay] = le Send du bouton", () => {
  const doc = personnage();
  const parBouton = [];
  const g1 = versX5(doc, [], null);
  const send = g1.querySelector('[data-organe="SEND"]');
  assert.equal(send.disabled, false, "Send est armé (bonus +1, bourse riche)");
  const n0 = parBouton.length;
  /* le bouton, sur une moitié qui écrit dans `parBouton` */
  const gBouton = moitie(doc, { cote: "gauche", page: null }, parBouton);
  cliquer(gBouton.querySelector('[data-organe="SEND"]'));
  const envoiBouton = parBouton.slice(n0).filter((a) => a.kind !== "fenetre" && a.kind !== "equipementRedessiner");

  /* le dépôt : on rouvre la même fiche, et on glisse */
  const acts = [];
  const gauche = versX5(doc, acts, null);
  const droite = moitie(doc, { cote: "droite", page: "gear" }, []);
  const avant = acts.length;
  glisser(gauche.querySelector(".x5-jeton"), droite.querySelector('[data-creneau="collecteur"][data-recoit-voisin="true"]'));
  const [p] = popups(acts.slice(avant));
  assert.ok(p, "le dépôt ouvre un popup");
  assert.match(p.texte, /^Craft this item for [\d,]+ GP\?$/);
  assert.deepEqual(p.actions.map((a) => a.mot), ["Craft & pay", "Cancel"]);
  const m = acts.length;
  p.actions[0].faire();
  const envoiDepot = acts.slice(m).filter((a) => a.kind !== "fenetre" && a.kind !== "equipementRedessiner");
  assert.deepEqual(envoiDepot.map((a) => a.kind), ["payer", "addGearLine"]);
  assert.deepEqual(envoiDepot, envoiBouton, "⭐ MÊME écrivain, même débit, même pose que `Craft & Send`");
  assert.equal(p.texte, `Craft this item for ${motDuMontant(envoiDepot[0].cout)}?`, "le montant affiché EST celui débité");
});

test("12 — ⚒️ [Cancel] NE CHANGE RIEN AU DOCUMENT — il ferme, et c'est tout", () => {
  const doc = personnage();
  const acts = [];
  const gauche = versX5(doc, acts, null);
  const droite = moitie(doc, { cote: "droite", page: "gear" }, []);
  glisser(gauche.querySelector(".x5-jeton"), droite.querySelector('[data-creneau="collecteur"][data-recoit-voisin="true"]'));
  const [p] = popups(acts);
  const m = acts.length;
  p.actions.find((a) => a.mot === "Cancel").faire();
  assert.deepEqual(acts.slice(m), [{ kind: "popup", texte: null }]);
});

test("13 — 🎁 X5 FOUND LÂCHÉ SUR GEAR : « You found this item. It goes to your backpack. » [OK] pose au sac", () => {
  const doc = personnage();
  const acts = [];
  /* ⚠️ la fiche envoie vers Gear (`SEND TO` = self) : le texte d'Eric dit « backpack », et
     c'est lui qui gagne pour un objet trouvé */
  const gauche = versX5(doc, acts, "Found", "self");
  const droite = moitie(doc, { cote: "droite", page: "gear" }, []);
  glisser(gauche.querySelector(".x5-jeton"), droite.querySelector('[data-creneau="collecteur"][data-recoit-voisin="true"]'));
  const [p] = popups(acts);
  assert.equal(p.texte, "You found this item. It goes to your backpack.");
  assert.deepEqual(p.actions.map((a) => a.mot), ["OK"]);
  const m = acts.length;
  p.actions[0].faire();
  const gestes = acts.slice(m).filter((a) => a.kind !== "fenetre" && a.kind !== "equipementRedessiner");
  assert.deepEqual(gestes.map((a) => a.kind), ["addGearLine"], "trouvé : rien à payer");
  assert.equal(gestes[0].location, "backpack");
  assert.equal(gestes[0].recette.bonus, "+1", "l'objet trouvé porte sa recette");
});

test("14 — ⛔ LE JETON DE X5 N'EST GLISSABLE QU'EN DOUBLE ÉCRAN — en vue simple il reste le bouton d'aperçu", () => {
  const src = lire("ui/builder/x5-ecran.mjs");
  assert.match(src, /if \(surDepotVoisin\) jetonAuVoisin\(jeton, \{ apercu, pret, envoi, surDepotVoisin \}\);\s*else jeton\.addEventListener\("click", apercu\);/);
  const etape = lire("ui/builder/equipment-step.mjs");
  assert.match(etape, /surDepotVoisin: demi \? \(\{ envoi, cible \}\) =>/, "X5 ne reçoit l'option qu'en double écran");
  assert.match(etape, /surDepotVoisin: demi \? \(ref, cible\) =>/, "Wares non plus");
  assert.match(etape, /recoitVoisin: Boolean\(demi\)/, "le collecteur de Gear non plus");
});

/* ══ 15 — LA LUNE, DANS LES TROIS PAGES ═════════════════════════════════════════════
   ⚖️ Eric, 27/09 : *« une lune qui propose un dropdown de choix d'écrans, une lune 30 diam »* ·
   *« À gauche dans gear »* · *« En bas à gauche dans wares »* · *« idem dans backpack »*. */
/* ⭐ LOT 311 — les portes d'Équipement sont des CARRÉS : leur nom est l'`aria-label` (« Backpack »),
   leur mot peint (« Pack ») n'en est qu'un raccourci. On cherche donc le NOM d'abord. */
const porte = (racine, mot) => racine.querySelectorAll("button").find((b) => b.getAttribute("aria-label") === mot)
  || racine.querySelectorAll("button").find((b) => b.textContent.trim() === mot);
/** L'étape en vue simple, sur Gear, avec ou sans la place du double. */
function seule(doc, acts, place) {
  const ctx = { document: doc, resolved: null, query, search: true };
  if (place) ctx.placeDuDouble = true;
  let n = renderEquipmentStep(ctx, (a) => acts.push(a));
  /* on se remet sur Gear si un test précédent a laissé une autre vue active (une Forge : Cancel) */
  if (pageActiveDeLEquipement() === "x5") {
    cliquer(n.querySelector('[data-organe="CANCEL"]'));
    n = renderEquipmentStep(ctx, (a) => acts.push(a));
  }
  if (pageActiveDeLEquipement() !== "gear") {
    const g = porte(n, "Gear");
    if (g) cliquer(g);
    n = renderEquipmentStep(ctx, (a) => acts.push(a));
  }
  return { n, ctx, rendre: () => renderEquipmentStep(ctx, (a) => acts.push(a)) };
}

test("15 — 🌕 LA LUNE ABSENTE SANS LA PLACE, présente avec — dans Gear, Wares et le Backpack", () => {
  const doc = personnage();
  for (const place of [false, true]) {
    const acts = [];
    const { n, rendre } = seule(doc, acts, place);
    assert.equal(pageActiveDeLEquipement(), "gear");
    const compte = (x) => x.querySelectorAll('[data-organe="lune"]').length;
    assert.equal(compte(n), place ? 1 : 0, `Gear, place=${place}`);
    cliquer(porte(n, "Wares"));
    const wares = rendre();
    assert.equal(pageActiveDeLEquipement(), "r");
    assert.equal(compte(wares), place ? 1 : 0, `Wares, place=${place}`);
    cliquer(porte(wares, "Backpack"));
    const sac = rendre();
    assert.equal(pageActiveDeLEquipement(), "sac");
    assert.equal(compte(sac), place ? 1 : 0, `Backpack, place=${place}`);
    cliquer(porte(sac, "Gear"));
  }
});

test("16 — 🌕 CHOISIR « Backpack » DANS LA LUNE DE GEAR ouvre le satellite Backpack | Gear", () => {
  const doc = personnage();
  const acts = [];
  const { n } = seule(doc, acts, true);
  const lune = n.querySelector('[data-organe="lune"]');
  assert.equal(lune.tagName, "SELECT", "un menu déroulant natif — le doigt comme la souris");
  const valeurs = lune.querySelectorAll("option").map((o) => o.value).filter(Boolean);
  assert.deepEqual(valeurs, ["sac", "b2", "r"], "Gear n'est pas proposé depuis Gear");
  choisir(lune, "sac");
  assert.equal(pageVoisineDeLEquipement(), "sac", "la principale a ouvert son satellite");
  assert.deepEqual(acts.at(-1), { kind: "equipementRedessiner" }, "⛔ pas `vueBascule` : l'interrupteur du Menu n'est pas touché");
  assert.deepEqual(pagesDuDoubleEcran({ active: pageActiveDeLEquipement(), voisine: pageVoisineDeLEquipement() }),
    { gauche: "sac", droite: "gear", active: "droite" }, "Backpack | Gear");
  /* ⛔ le satellite n'a pas de lune : il n'a pas de navigation, seule la principale ouvre */
  const sat = renderEquipmentStep({ document: doc, resolved: null, query, search: true, placeDuDouble: true,
    demiEcran: { cote: "gauche", page: "sac" } }, () => {});
  assert.equal(sat.querySelector('[data-organe="lune"]'), null);
});

test("17 — 🌕 « BACK TO ONE SCREEN » EST SUR LA BARRE DU RAIL et revient à un écran ; la lune du rail NOMME le satellite", () => {
  choisirLeSatellite("sac");
  assert.equal(pageVoisineDeLEquipement(), "sac");
  choisirLeSatellite(null);
  assert.equal(pageVoisineDeLEquipement(), null, "« Back to one screen » ferme le satellite");
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: false, etape: "equipment", satellite: pageVoisineDeLEquipement() !== null }),
    { double: false, pages: false }, "un seul écran");
  const shell = lire("ui/builder/shell.mjs");
  assert.match(shell, /const unEcran = button\(MOT_UN_SEUL_ECRAN, \(\) => \{ choisirLeSatellite\(null\); refresh\(\); \}\);\s*unEcran\.className = "belt-un-ecran";\s*belt\.racine\.append\(satellite, unEcran\);/,
    "le bouton vit dans le BELT (la barre du rail), posé une fois");
  assert.match(shell, /apres: chevrons\[1\], satellite: null, unEcran: null \}/,
    "⛔ et pas au montage : un téléphone ne l'a jamais dans sa page (iPhone inchangé, octet pour octet)");
  assert.match(shell, /construireLaLune\(\{ principale: cotes\.droite, satellite: cotes\.gauche, rail: true,/,
    "la lune du rail nomme le satellite, la principale à droite");
  const rail = construireLaLune({ principale: "gear", satellite: "sac", rail: true });
  const choisie = rail.querySelectorAll("option").find((o) => o.selected);
  assert.equal(choisie.textContent, "Backpack", "la lune « Backpack » du croquis");
  assert.equal(rail.dataset.taille, "dominante", "« La lune du double écran sera de taille dominante » (15/09)");
  /* le satellite se navigue lui-même : une fiche X s'y nomme par sa famille, jamais par un id */
  for (const [page, mot] of [["x5", "Forge"], ["x1", "Item"], ["recherche", "Wares"], ["sb32", "Tally"], ["???", "Screen"]]) {
    const l = construireLaLune({ principale: "gear", satellite: page, rail: true });
    assert.equal(l.querySelectorAll("option").find((o) => o.selected).textContent, mot, page);
  }
  const css = lire("ui/builder/shell.css");
  assert.match(css, /\.belt-satellite:not\(\[hidden\]\) \{[^}]*width: var\(--belt-tuile-dom\); height: var\(--belt-tuile-dom\);/,
    "sa cote est celle de la tuile dominante");
});

test("17 bis — 🎚️ LE RAIL SEUL : avec un satellite, le belt reprend son format ÉTROIT sur la principale (ses jetons = ceux de la vue simple)", () => {
  const tokens = lire("ui/builder/tokens.css");
  const decl = (bloc, nom) => (bloc.match(new RegExp(`${nom}:\\s*([^;]+);`)) || [])[1];
  const racine = tokens.slice(tokens.indexOf(":root {"));
  const sat = tokens.slice(tokens.indexOf(':root[data-vue="double"][data-pages="satellite"]'));
  for (const nom of ["--belt-chevron-zone", "--belt-espaceur"]) {
    assert.ok(decl(sat, nom), `${nom} redéclaré avec un satellite`);
    assert.equal(decl(sat, nom), decl(racine, nom), `${nom} : la valeur de la vue simple, recopiée à l'identique`);
  }
  const css = lire("ui/builder/shell.css");
  for (const r of [/:root\[data-vue="double"\]:not\(\[data-pages\]\) \.belt-item/, /:root\[data-vue="double"\]:not\(\[data-pages\]\) \.belt-track \{ overflow-x: hidden; \}/]) {
    assert.match(css, r, "le belt déroulé du lot 120 ne vaut plus quand un satellite est ouvert");
  }
});

/* ══ 18 — LES PIEDS DE WARES ET DU SAC FONT LA PLACE À LA LUNE ═══════════════════════ */
const secants = (a, b) => a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;
const boite = (o) => o.cible || o;

test("18 — 📐 WARES : Encumbrance SOUS la bourse, les Tally plus bas, la lune en bas à gauche — sans chevauchement", () => {
  const O = Object.fromEntries(W.ORGANES.map((o) => [o.nom, o]));
  const { LUNE, PURSE, ENCOMBREMENT: ENC, TALLY, "PARTY TALLY": PARTY, "SEND VERS": ENVOI } = O;
  assert.ok(ENC.y >= PURSE.y + PURSE.h, "l'encombrement est SOUS la bourse");
  assert.ok(ENC.x <= PURSE.x && PURSE.x + PURSE.l <= ENC.x + ENC.l, "dans la colonne de la bourse");
  assert.ok(LUNE.cible.y + LUNE.cible.h <= PARTY.cible.y && LUNE.cible.y + LUNE.cible.h <= TALLY.cible.y,
    "les Tally sont descendus sous la lune");
  assert.equal(LUNE.l, 30); assert.ok(LUNE.cible.l >= 44 && LUNE.cible.h >= 44);
  assert.ok(ENC.x >= ENVOI.x + ENVOI.l, "⛔ l'encombrement ne passe plus sous le dropdown (le défaut vu sur main)");
  const pied = W.ORGANES.filter((o) => o.dalle === "PIED" && !o.dans && o.nom !== "RANGEE" && o.coquille !== true);
  for (let i = 0; i < pied.length; i += 1) {
    for (const b of pied.slice(i + 1)) {
      assert.ok(!secants(boite(pied[i]), boite(b)), `${pied[i].nom} chevauche ${b.nom}`);
    }
  }
});

test("18 bis — 📐 BACKPACK : la lune en bas à gauche, les Tally descendus — sans chevauchement, cibles ≥ 44", () => {
  const O = Object.fromEntries(SAC.ORGANES.map((o) => [o.nom, o]));
  const { LUNE, TALLY, "PARTY TALLY": PARTY, "SEND VERS": ENVOI, COLLECTEUR, PURSE, RANGEE } = O;
  assert.ok(LUNE.cible.y + LUNE.cible.h <= PARTY.cible.y, "les Tally sont sous la lune");
  assert.equal(TALLY.y, ENVOI.y, "⭐ ils sont descendus sur la rangée du dropdown, à sa gauche");
  assert.ok(TALLY.x + TALLY.l < ENVOI.x, "sans le toucher");
  const poses = [LUNE, TALLY, PARTY, ENVOI, COLLECTEUR, PURSE];
  for (let i = 0; i < poses.length; i += 1) {
    for (const b of poses.slice(i + 1)) assert.ok(!secants(boite(poses[i]), boite(b)), `${poses[i].nom} chevauche ${b.nom}`);
    assert.ok(boite(poses[i]).l >= 44 && boite(poses[i]).h >= 44, `${poses[i].nom} : cible sous 44`);
    assert.ok(boite(poses[i]).y + boite(poses[i]).h <= RANGEE.y, `${poses[i].nom} mord la rangée du bas`);
  }
});


/* ══ 19 — LA FORGE A SA LUNE, ET ELLE OUVRE SANS ÊTRE OUVERTE (4ᵉ passe, 27/09) ═════════
   ⚖️ Eric : « La forge on lui donne une lune au dessus du bouton cancel. Quand on la ferme et qu'on
   revient à wares la sélection d'écran persiste à gauche. Le forge peut ouvrir, mais ne peux pas
   être ouverte. La lune propose un close dans son dropdown. » */
const X5P = await import("../ui/builder/x5-disposition.mjs");

test("19 — 🌕 LA LUNE DE LA FORGE EST AU-DESSUS DE CANCEL, dans les trois familles (Ø 30, cible 44, sans chevauchement)", () => {
  const { organesDeLaFamille } = X5E;
  for (const fam of ["base", "variante", "parchemin"]) {
    const os = organesDeLaFamille(fam);
    const lune = os.find((o) => o.nom === "LUNE");
    const cancel = os.find((o) => o.nom === "CANCEL");
    assert.ok(lune, `${fam} : la lune est au plan`);
    assert.equal(lune.grandEcran, true);
    assert.deepEqual([lune.l, lune.h, lune.cible.l, lune.cible.h], [30, 30, 44, 44]);
    assert.equal(lune.cible.x, cancel.cible.x, `${fam} : alignée sur Cancel`);
    assert.ok(lune.cible.y + lune.cible.h <= cancel.cible.y, `${fam} : AU-DESSUS de Cancel`);
    for (const o of os.filter((x) => x !== lune && !x.dans)) {
      assert.ok(!secants(boite(lune), boite(o)), `${fam} : la lune chevauche ${o.nom}`);
    }
  }
});

test("20 — ⭐ LA FORGE OUVRE UN SATELLITE, ET LA SÉLECTION PERSISTE : Backpack ouvert depuis X5 → Cancel → Wares à droite, Backpack à gauche", () => {
  const doc = personnage();
  const acts = [];
  const fiche = versX5(doc, acts, null);
  assert.equal(pageActiveDeLEquipement(), "x5");
  const principale = renderEquipmentStep({ document: doc, resolved: null, query, search: true, placeDuDouble: true },
    (a) => acts.push(a));
  const lune = principale.querySelector('[data-organe="lune"]');
  assert.ok(lune, "la Forge a sa lune");
  assert.deepEqual(lune.querySelectorAll("option").map((o) => o.value).filter(Boolean), ["sac", "b2", "r", "gear"]);
  choisir(lune, "sac");
  assert.equal(pageVoisineDeLEquipement(), "sac");
  cliquer(principale.querySelector('[data-organe="CANCEL"]'));
  /* la Forge avait été ouverte depuis la loupe de Wares : Cancel y revient */
  assert.ok(["r", "recherche"].includes(pageActiveDeLEquipement()), "Cancel rend Wares à la principale");
  assert.equal(pageVoisineDeLEquipement(), "sac", "⭐ le satellite choisi PERSISTE à gauche");
  assert.deepEqual(pagesDuDoubleEcran({ active: pageActiveDeLEquipement(), voisine: pageVoisineDeLEquipement() }),
    { gauche: "sac", droite: pageActiveDeLEquipement(), active: "droite" }, "Backpack | Wares");
  void fiche;
});

test("21 — ⛔ LA FORGE NE S'OUVRE JAMAIS DANS LE SATELLITE : un plan tapé à gauche l'ouvre à droite, le satellite reste", () => {
  const doc = personnage();
  choisirLeSatellite("r");
  const acts = [];
  versX5(doc, acts, null);   /* le plan est tapé dans la loupe de Wares, rendue en satellite */
  assert.equal(pageActiveDeLEquipement(), "x5", "la Forge est la principale");
  assert.notEqual(pageVoisineDeLEquipement(), "x5", "⛔ jamais le satellite");
  /* et « Close » de sa lune ferme le double écran */
  const principale = renderEquipmentStep({ document: doc, resolved: null, query, search: true, placeDuDouble: true,
    demiEcran: { cote: "droite", page: null } }, (a) => acts.push(a));
  const lune = principale.querySelector('[data-organe="lune"]');
  assert.equal(lune.querySelectorAll("option").at(-1).value, "fermer");
  choisir(lune, "fermer");
  assert.equal(pageVoisineDeLEquipement(), null, "Close ferme le satellite");
  cliquer(principale.querySelector('[data-organe="CANCEL"]'));
});

/** Un glisser qui paie le PÉAGE du sac (on tient le jeton avant de le porter). */
async function glisserTenu(jeton, cible) {
  document.elementFromPoint = () => cible;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 9, button: 0, pointerType: "touch" });
  await new Promise((r) => setTimeout(r, 450));
  document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 0, pointerId: 9 });
  document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 0, pointerId: 9 });
  document.elementFromPoint = () => null;
}

test("22 — 🎒 FIGURE ⑤ : UN OBJET DU SAC (satellite) LÂCHÉ SUR UNE CASE DE GEAR s'y pose par `placerGearLine`, sans popup", async () => {
  const doc = personnage();
  const acts = [];
  const sac = moitie(doc, { cote: "gauche", page: "sac" }, acts);
  const gear = moitie(doc, { cote: "droite", page: "gear" }, []);
  const jeton = sac.querySelectorAll("[data-glissable]").find((j) => j.closest && j.closest(".sac") && j.dataset.organe !== "collecteur");
  assert.ok(jeton, "un objet du sac");
  const caseVide = gear.querySelectorAll('[data-recoit-voisin="true"]').find((c) => c.dataset.creneau !== "collecteur");
  assert.ok(caseVide, "une case vide de Gear se déclare receveuse en double écran");
  await glisserTenu(jeton, caseVide);
  assert.equal(popups(acts).length, 0, "⛔ pas de popup : rien n'est acheté ni crafté");
  const pose = acts.find((a) => a.kind === "placerGearLine");
  assert.ok(pose, "le MÊME verbe que le glisser dans Gear");
  assert.equal(pose.boite, caseVide.dataset.creneau, "sur la case visée");
  /* ⛔ le collecteur de Gear n'est pas une case : un objet du sac n'y va pas */
  const n = acts.length;
  await glisserTenu(jeton, gear.querySelector('[data-creneau="collecteur"]'));
  assert.equal(acts.slice(n).filter((a) => a.kind === "placerGearLine").length, 0);
});

test("23 — 🤫 « CLOSE DOUBLE SCREEN » EST EN HAUT AU MILIEU, discret : un lien, T1, cible 44, sans chevaucher la lune ni le belt", () => {
  const css = lire("ui/builder/shell.css");
  const r = css.match(/\.belt-un-ecran:not\(\[hidden\]\) \{([^}]*)\}/);
  assert.ok(r, "la règle existe");
  assert.match(r[1], /left: 50%; transform: translate\(-50%, -50%\)/, "centré sur la largeur de l'app");
  assert.match(r[1], /height: var\(--touch\)/, "cible de 44");
  assert.match(r[1], /color: var\(--lien\)/, "le contrôle discret de la maison : le lien");
  assert.match(r[1], /background: none/); assert.match(r[1], /border: 0/);
  assert.match(r[1], /font-size: var\(--t1\)/);
  assert.match(r[1], /width: calc\(2 \* var\(--astre-cible\)\)/);
  /* 📏 les cotes, en blg : app 758 ; lune Ø 45 centrée sur le satellite ; chevron avant à 383 + 44 */
  const app = 375 * 2 + 8, astre = 44, lune = 45, l = 2 * astre;
  const [x0, x1] = [app / 2 - l / 2, app / 2 + l / 2];
  assert.ok(x0 >= (375 + lune) / 2 + 8, `ne touche pas la lune (${x0})`);
  assert.ok(x1 <= 375 + 8 + astre, `ne touche pas le chevron du belt (${x1})`);
  assert.match(css, /:root\[data-pages="satellite"\] \.belt-chevron\[data-sens="avant"\] \{\s*left: calc\(var\(--panneau-l\) \* 1px \+ var\(--sp-8\) \+ var\(--astre-cible\)\);/);
  const shell = lire("ui/builder/shell.mjs");
  assert.match(shell, /button\(MOT_UN_SEUL_ECRAN,/);
  assert.equal(EN_LUNE["lune.fermer-double"], "Close double screen");
});

test("22 — ⚖️ LOT 319 : la lune parle ROUGE, dit « Double / Screen », et porte le halo quand un side screen est ouvert", () => {
  /* Eric, 27/09 : « Le texte dans lune doit être en rouge : Double Screen · Quand actif halo · Close
     Side screen · La lune au dessus du side screen le texte est rouge aussi » */
  const css = lire("ui/builder/shell.css");
  const tokens = lire("ui/builder/tokens.css");
  assert.match(css, /\.lune-ecrans \{[^}]*color: var\(--astre-encre-pleine-lune\);/, "⛔ l'encre de la lune n'est pas le rouge");
  assert.match(tokens, /--astre-encre-pleine-lune: #aa3f2f;/);
  const mot = tokens.match(/--lune-mot-double: url\("([^"]+)"\)/);
  assert.ok(mot, "le mot « Double / Screen » est un jeton");
  const svg = decodeURIComponent(mot[1].replace("data:image/svg+xml,", ""));
  assert.ok(svg.includes(">Double<") && svg.includes(">Screen<"), "deux lignes : Double, puis Screen");
  assert.ok(svg.includes("fill='#aa3f2f'"), "⛔ le mot n'est pas à l'encre de la lune");
  assert.match(css, /\.lune-ecrans\[data-organe="lune"\] \{[^}]*background-image: var\(--lune-mot-double\), var\(--astre-pleine-lune\);/,
    "le mot se pose SUR l'astre, sur la lune d'une page (celle du rail garde son nom)");
  /* le halo : sur la lune d'une page quand un side screen est ouvert, jamais sur celle du rail */
  assert.equal(construireLaLune({ principale: "gear", satellite: "sac" }).dataset.actif, "true");
  assert.equal(construireLaLune({ principale: "gear" }).dataset.actif, undefined);
  assert.equal(construireLaLune({ principale: "gear", satellite: "sac", rail: true }).dataset.actif, undefined);
  assert.match(css, /\.lune-ecrans\[data-actif="true"\] \{\s*filter: drop-shadow\(0 0 var\(--halo-epais\) var\(--belt-halo\)\)/);
});
