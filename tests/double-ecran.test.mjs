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
  regimeDeLaVue, coteDesPages, popupDuDepotVoisin, genreDeLaCible, motDuMontant,
  LE_TALLY_PORTE_UN_OBJET_CRAFTE, VUES_TALLY, PAGE_DU_CORPS
} = await import("../ui/builder/double-ecran.mjs");
const { renderEquipmentStep, butinDuDepart, appliquerLeButin, departRepondu } =
  await import("../ui/builder/equipment-step.mjs");
const { currentCartLines } = await import("../ui/builder/equipement-pipeline.mjs");
const { estUnCreneauVoisin, armerJeton } = await import("../ui/builder/glisser.mjs");
const { EN_DEPOT_VOISIN } = await import("../src/labels.mjs");

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

/* ══ 1 — QUAND : sous la place, rien ; au-dessus, l'étape s'ouvre en deux pages ═════ */
test("1 — 🔴 SOUS LA PLACE, UNE SEULE PAGE — ni le réglage ni l'étape ne rouvrent un second panneau", () => {
  for (const voulue of [false, true]) {
    for (const etape of ["equipment", "class", null]) {
      assert.deepEqual(regimeDeLaVue({ place: false, voulue, etape }), { double: false, pages: false },
        `place absente, voulue=${voulue}, étape=${etape} : l'iPhone garde l'écran d'aujourd'hui`);
    }
  }
});

test("2 — ⭐ AU-DESSUS : Equipment s'ouvre en DEUX PAGES d'office ; les autres étapes gardent la loi du lot 120", () => {
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: false, etape: "equipment" }), { double: true, pages: true },
    "« c » : iPad couché ET ordinateur — sans attendre le réglage");
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: true, etape: "equipment" }), { double: true, pages: true });
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: false, etape: "class" }), { double: false, pages: false },
    "⛔ une autre étape ne s'ouvre pas en deux d'office");
  assert.deepEqual(regimeDeLaVue({ place: true, voulue: true, etape: "class" }), { double: true, pages: false },
    "le double d'étapes du lot 120 est intact");
});

test("3 — 🪟 GEAR À DROITE, la page d'où l'on prend à gauche ; quand l'active EST Gear, le sac à gauche", () => {
  for (const vue of ["r", "x5", "x1", "x2", "b2", "sb32", "sac", "recherche", "x1-apercu"]) {
    assert.deepEqual(coteDesPages(vue), { gauche: vue, droite: PAGE_DU_CORPS, active: "gauche" }, vue);
  }
  assert.deepEqual(coteDesPages("gear"), { gauche: "sac", droite: "gear", active: "droite" });
});

test("4 — ⚖️ LA COQUILLE DEMANDE À L'ORGANE UNIQUE — la place reste `laPlaceDuDouble`, jamais une seconde porte", () => {
  const shell = lire("ui/builder/shell.mjs");
  assert.match(shell, /regimeDeLaVue\(\{ place: laPlaceExiste\(\)/, "la place vient de la porte du lot 120");
  assert.equal((shell.match(/regimeDeLaVue\(/g) || []).length, 1, "⛔ un seul appel : un seul régime");
  assert.ok(!/innerWidth\s*[<>]=?\s*\d/.test(shell), "⛔ aucune largeur écrite en dur dans la coquille");
  /* le ctx de l'étape ne grandit QUE en double écran */
  assert.match(shell, /if \(demiEcranEnCours\) ctx\.demiEcran = demiEcranEnCours;/);
  /* la question du dépôt voyage jusqu'au popup : `exigeUneReponse` n'est plus jeté */
  assert.match(shell, /exigeUneReponse: action\.exigeUneReponse === true/);
});

/* ══ 5 — SOUS LA PLACE, LE DOM EST CELUI D'AVANT ════════════════════════════════════ */
test("5 — 🔴 SANS MOITIÉ D'ÉCRAN, L'ÉTAPE N'ÉCRIT AUCUN ATTRIBUT NEUF et le geste reste celui d'avant", () => {
  const acts = [];
  const doc = personnage();
  const gear = moitie(doc, undefined, acts);
  const neufs = ["data-demi-ecran", "data-vue-equipement", "data-recoit-voisin"];
  const porteurs = (n) => [n, ...n.querySelectorAll("*")].filter((e) => neufs.some((a) => e.hasAttribute(a)));
  assert.equal(porteurs(gear).length, 0, "Gear en vue simple : aucun attribut du double écran");
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
  const receveur = droite.querySelector('[data-recoit-voisin="true"]');
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

test("10 — 🧺 LA MÊME PAGE GARDE SON GESTE : un jeton de Wares sur le collecteur de Wares va au panier, sans popup", () => {
  const doc = personnage();
  const acts = [];
  const gauche = moitie(doc, { cote: "gauche", page: "r" }, acts);
  const jeton = gauche.querySelector(".wares-jeton");
  const chez = gauche.querySelector(".wares-collecteur");
  glisser(jeton, chez);
  assert.equal(popups(acts).length, 0, "⛔ pas de popup dans la même page");
  assert.deepEqual(acts.map((a) => a.kind), ["cartAdd"]);
});

/* ══ 11 — X5 → GEAR : Crafting, Found — le MÊME Send que le bouton ═════════════════ */
/** Ouvre X5 sur `Armor, +1…` depuis Wares, bonus +1, au statut voulu. Rend la moitié gauche. */
function versX5(doc, acts, statut, envoiVers = null) {
  const g = { cote: "gauche", page: null };
  /* par la loupe de Wares (la recherche) : le tambour, lui, choisit au REPOS d'un défilement,
     ce qu'un stub sans mise en page ne sait pas faire */
  let gauche = moitie(doc, { cote: "gauche", page: "recherche" }, acts);
  const champ = gauche.querySelector("input");
  champ.value = "Armor, +1"; champ.dispatchEvent({ type: "input", target: champ });
  const plan = gauche.querySelectorAll("button").find((b) => (b.getAttribute("aria-label") || "") === "Open Armor, +1, +2, or +3");
  assert.ok(plan, "la recherche trouve le plan");
  cliquer(plan);
  gauche = moitie(doc, g, acts);
  assert.equal(gauche.dataset.vueEquipement, "x5", "le plan mène à X5");
  const bonus = gauche.querySelector('select[data-organe="BONUS"]');
  choisir(bonus, bonus.querySelectorAll("option").map((o) => o.value).find(Boolean));
  if (statut) { gauche = moitie(doc, g, acts); choisir(gauche.querySelector('select[data-organe="STATUS"]'), statut); }
  if (envoiVers) { gauche = moitie(doc, g, acts); choisir(gauche.querySelector('select[data-organe="SEND TO"]'), envoiVers); }
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
  glisser(gauche.querySelector(".x5-jeton"), droite.querySelector('[data-recoit-voisin="true"]'));
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
  glisser(gauche.querySelector(".x5-jeton"), droite.querySelector('[data-recoit-voisin="true"]'));
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
  glisser(gauche.querySelector(".x5-jeton"), droite.querySelector('[data-recoit-voisin="true"]'));
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
