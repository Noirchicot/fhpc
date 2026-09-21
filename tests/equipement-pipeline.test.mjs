/* ══ LES GARDES DU PIPELINE (B1 · B2 · SB3.x · les échanges internes) ════════
   Ce qui se mesure ici : la monnaie (parse, somme, couverture), le PANIER AU
   DOCUMENT (`cart[N]` — décision d'Eric du 24/08, « ok on fait le 2 »), la
   carte slot → boîtes (chaque boîte nommée EXISTE), et le PARCOURS entier
   joué au stub avec un harnais qui APPLIQUE les actions comme la coquille —
   copies mot à mot de ses séquences de verbes, même limite assumée que
   `equipment-step.test.mjs` (le garde d'octets couvre le câblage réel). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));

import { createTestDocument } from "./dom-stub.mjs";
globalThis.document = createTestDocument();

import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { CURRENCY_KEYS } from "../src/build/index.mjs";
import { parseCout, parsePoids, formatCout, multiplieCout, additionneCouts, bourseCouvre, enGP,
  currentCartLines, nextCartIndex, cartCompte, cartTotal, lignesParLieu, poidsParLieu,
  motDeLEncombrement, UNITE_DU_JEU, motDUnPoids, uniteAffichee }
  from "../ui/builder/equipement-pipeline.mjs";
import { SLOT_VERS_BOITES, POCHES_DEBORD, BOITES } from "../ui/builder/b3-disposition.mjs";
import { renderEquipmentStep, currentGearLines, nextGearIndex, currentCurrency, orDuDepart,
  butinDuDepart, departRepondu, cheminDuDepart }
  from "../ui/builder/equipment-step.mjs";

const fixture = exempleFhEn();
const query = fixture.layers.verbs.query;
const verbs = fixture.build.verbs;

/* ── le harnais : les actions de `shell.mjs`, rejouées à la main ── */
function appliquer(doc, a) {
  if (a.kind === "cartAdd") {
    const deja = currentCartLines(doc).find((l) => l.ref.id === a.ref.id);
    if (deja) return verbs.set({ document: doc, path: `cart[${deja.index}].quantity`, value: (deja.quantity || 1) + 1 }).document;
    const i = nextCartIndex(doc);
    let d = verbs.choose({ document: doc, path: `cart[${i}]`, ref: a.ref }).document;
    d = verbs.set({ document: d, path: `cart[${i}].quantity`, value: 1 }).document;
    return verbs.set({ document: d, path: `cart[${i}].gratuit`, value: false }).document;
  }
  if (a.kind === "cartClear") {
    let d = doc;
    for (const l of currentCartLines(d)) {
      for (const suffix of ["", ".quantity", ".gratuit"]) {
        d = verbs.clear({ document: d, path: `cart[${l.index}]${suffix}`, kind: "choice" }).document;
      }
    }
    return d;
  }
  if (a.kind === "payer") {
    let d = doc;
    const bourse = currentCurrency(d);
    for (const k of CURRENCY_KEYS) {
      d = verbs.set({ document: d, path: `currency.${k}`, value: (bourse[k] || 0) - (a.cout[k] || 0) }).document;
    }
    return d;
  }
  if (a.kind === "poserLeDepart") {
    /* ⭐ LOT 245 — CE HARNAIS REJOUE `poserLeDepart`, et il ne recalcule RIEN :
       il écrit ce que `butinDuDepart` lui rend — l'index, la quantité, l'or.
       ⛔ LOT 182, LA LEÇON QUI TIENT TOUJOURS : ce harnais portait un `+ 50` en
       dur, et il restait vert le jour où la règle changeait. Un témoin qui
       garde son propre nombre ne peut jamais accuser. */
    if (departRepondu(doc)) return doc;
    const butin = butinDuDepart({ query, document: doc, reponses: a.reponses });
    if (!butin.complet) return doc;
    let d = doc;
    for (const { genre, valeur } of butin.aEcrire) {
      d = verbs.set({ document: d, path: cheminDuDepart(genre), value: valeur }).document;
    }
    for (const pose of butin.aPoser) {
      if (pose.neuve) d = verbs.choose({ document: d, path: `gear[${pose.index}]`, ref: pose.ref }).document;
      d = verbs.set({ document: d, path: `gear[${pose.index}].quantity`, value: pose.quantity }).document;
      if (pose.neuve) d = verbs.set({ document: d, path: `gear[${pose.index}].equipped`, value: false }).document;
    }
    if (butin.cout) {
      const bourse = currentCurrency(d);
      for (const k of CURRENCY_KEYS) {
        const base = Number.isInteger(bourse[k]) ? bourse[k] : 0;
        d = verbs.set({ document: d, path: `currency.${k}`, value: base + (butin.cout[k] || 0) }).document;
      }
    }
    return d;
  }
  if (a.kind === "addGearLine") {
    const i = nextGearIndex(doc);
    let d = verbs.choose({ document: doc, path: `gear[${i}]`, ref: a.ref }).document;
    d = verbs.set({ document: d, path: `gear[${i}].quantity`, value: a.quantity }).document;
    d = verbs.set({ document: d, path: `gear[${i}].equipped`, value: a.equipped }).document;
    if (a.location) d = verbs.set({ document: d, path: `gear[${i}].location`, value: a.location }).document;
    return d;
  }
  return doc;
}

test("monnaie — parseCout lit les chaînes du SRD et refuse d'inventer", () => {
  assert.deepEqual(parseCout("25 GP"), { pp: 0, gp: 25, sp: 0, cp: 0 });
  assert.deepEqual(parseCout("2 sp"), { pp: 0, gp: 0, sp: 2, cp: 0 });
  assert.deepEqual(parseCout("1,500 GP"), { pp: 0, gp: 1500, sp: 0, cp: 0 });
  assert.equal(parseCout(undefined), null);
  assert.equal(formatCout(null), "—");
});

test("monnaie — somme, couverture clef à clef, le taux d'affichage en GP", () => {
  const total = additionneCouts([multiplieCout(parseCout("3 GP"), 2), parseCout("5 sp")]);
  assert.deepEqual(total, { pp: 0, gp: 6, sp: 5, cp: 0 });
  assert.equal(bourseCouvre({ gp: 6, sp: 5, cp: 0, pp: 0 }, total), true);
  assert.equal(bourseCouvre({ gp: 7, sp: 0, cp: 0, pp: 0 }, total), false,
    "⛔ pas de change automatique : 7 gp ne paient pas 5 sp tout seuls");
  assert.equal(enGP({ pp: 1, gp: 2, sp: 3, cp: 4 }), 10 + 2 + 0.3 + 0.04);
});

test("panier — il vit au DOCUMENT : il survit à ce qu'aucun module ne survit", () => {
  /* ⭐ C'est LE point de la décision d'Eric : le panier est des `choices`
     comme les autres — il traverse une sérialisation JSON (= un rechargement,
     un autre appareil) sans une ligne de code de plus. */
  let doc = fixture.document;
  const ref = { kind: "gear", id: "srd:gear:en:crowbar" };
  doc = appliquer(doc, { kind: "cartAdd", ref });
  doc = appliquer(doc, { kind: "cartAdd", ref });
  assert.equal(cartCompte(doc), 2, "deux crowbars = UNE ligne à ×2");

  const ressuscite = JSON.parse(JSON.stringify(doc));
  assert.equal(cartCompte(ressuscite), 2, "le panier a traversé le rechargement");

  const lignes = currentCartLines(doc).map((l) => ({ ...l, cout: parseCout("2 GP") }));
  assert.deepEqual(cartTotal(lignes), { pp: 0, gp: 4, sp: 0, cp: 0 });

  doc = appliquer(doc, { kind: "cartClear" });
  assert.equal(cartCompte(doc), 0, "CANCEL vide tout, et le document est propre");
  assert.equal(currentCartLines(doc).length, 0);
});

test("slot → boîtes — la carte RATIFIÉE : chaque boîte existe, dix slots couverts", () => {
  const clefs = new Set(BOITES.map((b) => b.clef));
  for (const [slot, boites] of Object.entries(SLOT_VERS_BOITES)) {
    assert.ok(boites.length > 0, `${slot} a au moins une boîte`);
    for (const b of boites) assert.ok(clefs.has(b), `${slot} → ${b} : cette boîte n'existe pas`);
  }
  assert.equal(Object.keys(SLOT_VERS_BOITES).length, 10);
  for (const b of POCHES_DEBORD) assert.ok(clefs.has(b), `débord ${b} : cette poche n'existe pas`);
});

test("lieux — location absente se lit « backpack », jamais « porté »", () => {
  const lignes = [{ ref: { id: "a" } }, { ref: { id: "b" }, location: "self" },
    { ref: { id: "c" }, location: "storage" }];
  assert.equal(lignesParLieu(lignes, "backpack").length, 1);
  assert.equal(lignesParLieu(lignes, "self").length, 1);
  assert.equal(lignesParLieu(lignes, "storage").length, 1);
});

/* ══ 🔄 PORTÉ SUR WARES v2 — lot 219, 20/09 ════════════════════════════════════
   ⚖️ LA LOI NE BOUGE PAS, L'ORGANE CHANGE DE NOM. Eric, 20/09 : *« Cart c'est tally tu l'as
   déjà fait »*. Le bouton `CART` de l'ancien catalogue est le `Tally` de Wares ; ces gardes
   suivent donc la FONCTION, pas le libellé.
   🔴 ET C'EST L'UN D'EUX QUI A TROUVÉ UNE FAUTE DE BRANCHEMENT : le Tally de Wares ouvrait la
   liste d'ENVOI (le geste de R, recopié) au lieu du PANIER. Un organe qui porte le même nom
   sur deux écrans n'y fait pas forcément la même chose, et rien ne le disait. */
const versLeCatalogue = (node) => node.querySelector('.gear-porte[data-porte="wares"]');
/* ⭐ UN SEUL CHEMIN VERS LE CATALOGUE, ET IL PART DE N'IMPORTE OÙ. La vue persiste entre les
   tests (c'est le produit), donc chaque garde doit pouvoir s'y rendre comme un joueur perdu.
   ⛔ Ces quatre lignes étaient recopiées dans trois gardes, chacune avec sa propre porte de
   sortie — trois chemins pour un voyage, et c'est le genre d'écriture qui diverge au premier
   écran renommé. */
function allerAuCatalogue(rendre) {
  let node = rendre();
  for (let i = 0; i < 5 && !leCatalogue(node); i += 1) {
    const sortie = versLeCatalogue(node)
      || node.querySelector('[data-porte="gear"]')
      || [...node.querySelectorAll("button")].find((b) => b.textContent === "BACK");
    if (!sortie) break;
    sortie.click();
    node = rendre();
  }
  return node;
}
const leTally = (node) => node.querySelector('[data-organe="tally"]');
const leCatalogue = (node) => node.querySelector('[data-ecran="wares"]');

test("⭐ LE PARCOURS ENTIER — dépôt au panier (document), CART → B2, BUY paie UNE fois, envoie tout, vide le panier", () => {
  let doc = verbs.set({ document: fixture.document, path: "currency.gp", value: 100 }).document;
  doc = appliquer(doc, { kind: "cartAdd", ref: { kind: "gear", id: "srd:gear:en:crowbar" } });
  const rendre = () => renderEquipmentStep({ document: doc, resolved: fixture.resolved, query },
    (a) => { doc = appliquer(doc, a); });

  let node = allerAuCatalogue(rendre);
  const cart = leTally(node);
  assert.ok(cart, "⛔ la porte du panier : le `Tally` de Wares (Eric, 20/09 : « Cart c'est tally »)");
  assert.equal(cart.dataset.compte, "1", "le compteur du panier lit le document");
  cart.click();
  node = rendre();
  const b2 = node.querySelector('[data-ecran="B2"]');
  assert.ok(b2, "CART ouvre le panier");

  const gpAvant = currentCurrency(doc).gp;
  [...b2.querySelectorAll("button")].find((b) => b.textContent === "BUY").click();
  assert.equal(currentCurrency(doc).gp, gpAvant - 2, "BUY a payé le prix du record, une fois");
  const ligne = currentGearLines(doc).find((l) => l.ref && l.ref.id === "srd:gear:en:crowbar");
  assert.ok(ligne, "la ligne est au personnage");
  assert.equal(ligne.location, "backpack", "un PANIER sans destinataire va au sac (la règle d'Eric)");
  assert.equal(cartCompte(doc), 0, "et le panier du document est vidé");
});

test("⚔️ ATTAQUE — BUY refuse quand la bourse ne couvre pas, et n'écrit RIEN", () => {
  let doc = fixture.document;
  for (const k of CURRENCY_KEYS) {
    doc = verbs.set({ document: doc, path: `currency.${k}`, value: 0 }).document;
  }
  doc = appliquer(doc, { kind: "cartAdd", ref: { kind: "gear", id: "srd:gear:en:crowbar" } });
  const gearsAvant = currentGearLines(doc).length;
  const rendre = () => renderEquipmentStep({ document: doc, resolved: fixture.resolved, query },
    (a) => { doc = appliquer(doc, a); });

  let node = allerAuCatalogue(rendre);
  leTally(node).click();
  node = rendre();
  [...node.querySelectorAll('[data-ecran="B2"] button')].find((b) => b.textContent === "BUY").click();

  assert.equal(currentGearLines(doc).length, gearsAvant, "bourse vide : aucune ligne n'est partie");
  assert.equal(cartCompte(doc), 1, "et le panier n'est pas vidé — rien n'est parti");
  assert.ok(CURRENCY_KEYS.every((k) => (currentCurrency(doc)[k] || 0) === 0), "la bourse n'a pas bougé");
});

test("CANCEL — il vide le panier, BACK ne le touche pas (la loi des trois mots)", () => {
  let doc = appliquer(fixture.document, { kind: "cartAdd", ref: { kind: "gear", id: "srd:gear:en:crowbar" } });
  const rendre = () => renderEquipmentStep({ document: doc, resolved: fixture.resolved, query },
    (a) => { doc = appliquer(doc, a); });

  /* la vue persiste entre les tests (c'est le produit) : on NAVIGUE vers le
     catalogue depuis n'importe où, comme un joueur perdu le ferait. */
  let node = allerAuCatalogue(rendre);
  assert.ok(leCatalogue(node), "témoin : on a bien retrouvé le catalogue");
  leTally(node).click();
  node = rendre();

  const b2 = node.querySelector('[data-ecran="B2"]');
  [...b2.querySelectorAll("button")].find((b) => b.textContent === "BACK").click();
  assert.equal(cartCompte(doc), 1, "BACK recule, il n'efface pas");

  node = rendre();
  leTally(node).click();
  node = rendre();
  [...node.querySelectorAll('[data-ecran="B2"] button')].find((b) => b.textContent === "CANCEL").click();
  assert.equal(cartCompte(doc), 0, "CANCEL efface — c'est son seul métier");
});

test("la DÉCISION DU DÉPART — elle vit au personnage, pas au navigateur (requalifiée 26/08)", () => {
  /* ⛔ Un « guide obligatoire » en clef navigateur ratait le SECOND personnage
     du même navigateur : la décision est PAR PERSONNAGE, donc au document. */
  let doc = fixture.document;
  const rendre = () => renderEquipmentStep({ document: doc, resolved: fixture.resolved, query },
    (a) => { doc = appliquer(doc, a); });

  /* la vue persiste entre les tests : on rejoint le dressing depuis
     n'importe où, par les portes du joueur. */
  /* 🔄 PORTÉ (lot 219) : l'aiguilleur vit sur **R**, et le chemin du retour a changé de nom.
     ⛔ L'ancien catalogue offrait un bouton `GEAR` ; le neuf offre la porte `[data-porte="gear"]`
     de sa rangée du pied. Sans elle, ce garde suivait la porte `Wares` et s'éloignait de R à
     chaque tour — il cherchait l'aiguilleur en lui tournant le dos. */
  let node = rendre();
  for (let i = 0; i < 5 && !node.querySelector(".aiguilleur"); i++) {
    const porte = [...node.querySelectorAll("button")].find((b) => b.textContent === "BACK")
      || node.querySelector('[data-porte="gear"]')
      || versLeCatalogue(node);
    if (porte) porte.click();
    node = rendre();
  }
  /* ⭐ LA CLASSE A CHANGÉ TROIS FOIS EN UN JOUR — `guide-oblige`, puis
     `decision-kit`, puis `aiguilleur` (Eric, 26/08 : *« c'est plutôt un
     aiguilleur, on a toujours besoin de lui »*). Ce que ce test défend n'a
     jamais bougé : un personnage SANS `depart` reçoit la question, un
     personnage qui a répondu ne la revoit pas. ⛔ Si un quatrième nom arrive,
     c'est le sélecteur qu'on change, pas l'assertion. */
  assert.ok(node.querySelector(".aiguilleur"), "un personnage sans `depart` reçoit la question");

  /* ⭐ LOT 182 — LE SÉLECTEUR NE CHERCHE PLUS « le bouton qui contient 50 ».
     Le montant est composé (Wizard 55 + Inheritance 50 = 105) : ce test-là
     n'aurait plus rien trouvé, et il ne l'aurait dit qu'en jetant. Il cherche
     le VERBE et compare au montant LU — le même que celui de l'écran. */
  /* ⭐ LOT 245 — LE POPUP EST DEVENU UN QCM, et le sélecteur suit l'organe.
     Ce que ce test défend n'a pas bougé d'une ligne : le montant ANNONCÉ est
     celui qui TOMBE, et la question ne se repose pas. ⛔ Ce qui a changé, c'est
     qu'elle se pose désormais PAR SOURCE — l'or dépend donc de l'option prise,
     et non plus de la dernière de chaque phrase.
     ⚠️ ET `Done` REFUSE TANT QU'UNE QUESTION ATTEND : sans réponse, il est
     désarmé — c'est le seul état où ce popup ne peut rien écrire. */
  const done = [...node.querySelectorAll(".aiguilleur-bouton")].find((b) => b.textContent === "Done");
  assert.equal(done.disabled, true, "aucune option choisie : `Done` ne peut rien poser");

  /* le Wizard de l'exemple : son option B est une bourse nue (55 PO) ; l'origine
     de Fate's Hand n'offre pas de choix et ajoute ses 50. 55 + 50 = 105 — le
     MÊME nombre que l'ancien lecteur global, et c'est voulu : répondre « la
     dernière lettre » partout EST l'ancien geste. */
  /* ⛔ ON NE RE-RENDU PAS APRÈS UN CLIC D'OPTION, ET C'EST LE POINT : un choix
     du QCM n'écrit RIEN au document et ne repasse pas par la coquille. Il
     repeint l'étape EN PLACE (`peindre()`), dans le nœud qu'on tient déjà.
     ⭐ Appeler `rendre()` ici rendrait une étape neuve — donc un QCM vierge —
     et le récapitulatif retomberait à l'or de l'origine seule (50). 📏 Mesuré :
     c'est exactement ce que ce test a rendu à sa première écriture. */
  /* ⚖️ LOT 246 — LE SÉLECTEUR SUIT L'ORGANE. Une option est devenue une RANGÉE
     (Eric, 21/09 : *« Deux lignes de texte un bouton à droite »*) : la pastille
     ne porte plus que la LETTRE, le texte vit à côté. ⛔ Ce que ce garde défend
     n'a pas bougé. */
  const optionB = [...node.querySelectorAll(".aiguilleur-option")].find((b) => b.textContent === "B");
  optionB.click();
  const attendu = orDuDepart({ query, document: doc }).cout;
  assert.equal(attendu.gp, 105, "le personnage d'exemple : Wizard 55 + Inheritance 50, chacun lu dans sa prose");
  const bilan = [...node.querySelectorAll(".aiguilleur-bilan-or")].map((l) => l.textContent);
  assert.deepEqual(bilan, [`${attendu.gp} GP`], "le récapitulatif ANNONCE le montant que `Done` pose");

  const gpAvant = currentCurrency(doc).gp || 0;
  [...node.querySelectorAll(".aiguilleur-bouton")].find((b) => b.textContent === "Done").click();
  assert.equal(doc.build.choices.find((c) => c.path === "depart.class")?.value, "B", "le choix est ÉCRIT au document");
  assert.equal(currentCurrency(doc).gp, gpAvant + attendu.gp,
    "et l'or annoncé tombe dans la bourse, à la pièce près — le geste ratifié, pas une copie");

  node = rendre();
  assert.equal(node.querySelectorAll(".aiguilleur").length, 0, "la question ne se repose pas : le document a répondu");

  const ressuscite = JSON.parse(JSON.stringify(doc));
  assert.equal(ressuscite.build.choices.find((c) => c.path === "depart.class")?.value, "B",
    "et la réponse traverse un rechargement — c'est tout le point du document");
});

/* ══ LOT 180 — LIRE LE PRIX ET LE POIDS DANS LA PROSE DU LIVRE ═══════════════
   Le SRD donne le prix et le poids en toutes lettres. Ces gardes tiennent les
   DEUX lecteurs (`parseCout`, `parsePoids`) sur la matière RÉELLE des couches,
   pas sur des exemples choisis — c'est le balayage plus bas qui les tient. */

test("lecteur — les formes du livre se lisent, dans les deux éditions", () => {
  /* l'anglais */
  assert.deepEqual(parseCout("25 GP"), { pp: 0, gp: 25, sp: 0, cp: 0 });
  assert.deepEqual(parseCout("5 CP"), { pp: 0, gp: 0, sp: 0, cp: 5 });
  assert.deepEqual(parseCout("1,000 GP"), { pp: 0, gp: 1000, sp: 0, cp: 0 }, "la virgule des MILLIERS");
  /* le français : autres pièces, autre séparateur */
  assert.deepEqual(parseCout("1 000 po"), { pp: 0, gp: 1000, sp: 0, cp: 0 }, "l'espace des milliers");
  assert.deepEqual(parseCout("5 pa"), { pp: 0, gp: 0, sp: 5, cp: 0 }, "pa = pièce d'argent");
  assert.deepEqual(parseCout("5 pc"), { pp: 0, gp: 0, sp: 0, cp: 5 }, "pc = cuivre, et ce n'est PAS cp retourné");
  /* la conversion : 1 gp = 10 sp = 100 cp */
  assert.equal(enGP(parseCout("5 CP")), 0.05);
  assert.equal(enGP(parseCout("2 sp")), 0.2);

  /* le poids — les quatre formes qui rendaient un nombre FAUX */
  assert.deepEqual(parsePoids("1 lb."), { valeur: 1, unite: "lb" });
  assert.deepEqual(parsePoids("1/2 lb."), { valeur: 0.5, unite: "lb" }, "et non 2");
  assert.deepEqual(parsePoids("1/4 lb."), { valeur: 0.25, unite: "lb" }, "et non 4");
  assert.deepEqual(parsePoids("58½ lb."), { valeur: 58.5, unite: "lb" }, "et non null");
  assert.deepEqual(parsePoids("5 lb. (full)"), { valeur: 5, unite: "lb" }, "la parenthèse ne mange pas le nombre");
  /* le français : le kilo, et le GRAMME ramené au kilo */
  assert.deepEqual(parsePoids("0,5 kg"), { valeur: 0.5, unite: "kg" }, "la virgule DÉCIMALE, et non 5");
  assert.deepEqual(parsePoids("250 g"), { valeur: 0.25, unite: "kg" }, "le gramme se ramène au kilo, sinon 250 > 1 kg");
});

test("lecteur — ce qui n'est pas un prix se REFUSE, et ne devient jamais 0", () => {
  /* les faits de la source : un tiret et un « variable » ne sont pas des zéros */
  for (const nonPrix of ["Varies", "Variable", "variable", "—", "", "n'importe quoi"]) {
    assert.equal(parseCout(nonPrix), null, `« ${nonPrix} » n'est pas un prix`);
    assert.equal(parsePoids(nonPrix), null, `« ${nonPrix} » n'est pas un poids`);
  }
  /* ⭐ LE PIÈGE DU CHAMP HOMONYME : `data.cost` porte TROIS monnaies. */
  assert.equal(parseCout("1 Sorcery Point"), null, "un point de Sorcellerie n'est pas de l'or");
  assert.equal(parseCout("2 Sorcery Points"), null);
  assert.equal(parseCout("1 point de Sorcellerie"), null, "et « po » ne s'attrape pas dans « point »");
  assert.equal(parseCout(1), null, "un `cost` NOMBRE (fh:training) n'est pas un montant en pièces");
  assert.equal(parseCout(undefined), null);
  assert.equal(parsePoids(undefined), null);
});

test("lecteur — BALAYAGE des couches réelles : rien ne se lit de travers", () => {
  const couche = (f) => JSON.parse(fs.readFileSync(path.join(ICI, "..", "layers", f), "utf8")).records;
  const EN = couche("srd-5.2.1-en.layer.json");
  const FR = couche("srd-5.2.1-fr.layer.json");
  const GENRES = ["gear", "armor", "weapon", "tool"];

  /* ① AUCUN point de Sorcellerie ne devient de l'argent. Dix records portent
        « 1 Sorcery Point » dans le MÊME champ `cost` que les objets. */
  const options = Object.values(EN["class-option"]).filter((r) => r.data?.cost !== undefined);
  assert.equal(options.length, 10, "dix class-option portent un `cost` — si ce compte bouge, relire le champ");
  for (const r of options) {
    assert.equal(parseCout(r.data.cost), null, `${r.slug} : « ${r.data.cost} » n'est pas une somme d'argent`);
  }

  /* ② LA SECONDE LECTURE, EN SENS INVERSE. L'édition française est une
        traduction du MÊME tableau : elle doit lire et refuser exactement les
        mêmes records. C'est ce croisement qui a démasqué « 1/2 lb. » → 2. */
  let compares = 0;
  for (const genre of GENRES) {
    const frParSlug = new Map(Object.values(FR[genre]).map((r) => [r.slug, r]));
    for (const en of Object.values(EN[genre])) {
      const fr = frParSlug.get(en.slug);
      assert.ok(fr, `${en.slug} n'a pas d'homologue français`);
      assert.equal(!!parseCout(en.data.cost), !!parseCout(fr.data.cost),
        `${en.slug} : les deux éditions doivent s'accorder sur « ce prix se lit-il ? »`);
      const pEN = parsePoids(en.data.weight); const pFR = parsePoids(fr.data.weight);
      assert.equal(!!pEN, !!pFR, `${en.slug} : accord sur « ce poids se lit-il ? »`);
      if (parseCout(en.data.cost)) {
        assert.equal(enGP(parseCout(en.data.cost)), enGP(parseCout(fr.data.cost)),
          `${en.slug} : le prix converti en po doit être le MÊME dans les deux éditions`);
      }
      if (pEN && pFR) {
        compares += 1;
        assert.equal(pEN.unite, "lb"); assert.equal(pFR.unite, "kg");
        /* 📏 écart max MESURÉ sur les 135 paires : 0,25 kg (le paquetage de
           ménestrel, 58½ lb. arrondi à 29 kg par l'éditeur). L'édition FR est
           un ARRONDI, pas une conversion — la borne vient de la mesure. */
        assert.ok(Math.abs(pEN.valeur / 2 - pFR.valeur) <= 0.25,
          `${en.slug} : ${pEN.valeur} lb et ${pFR.valeur} kg ne parlent pas du même objet`);
      }
    }
  }
  assert.equal(compares, 135, "135 paires ont un poids lisible des deux côtés");

  /* ③ LES COMPTES, pour que le jour où la couche change, le test le dise. */
  const compte = (R, champ, lu) => {
    let n = 0;
    for (const g of GENRES) for (const r of Object.values(R[g])) {
      const v = champ === "cost" ? parseCout(r.data[champ]) : parsePoids(r.data[champ]);
      if (!!v === lu) n += 1;
    }
    return n;
  };
  assert.equal(compte(EN, "cost", true), 152, "152 prix lus sur 158");
  assert.equal(compte(EN, "cost", false), 6, "6 refusés — les six « Varies »");
  assert.equal(compte(EN, "weight", true), 135, "135 poids lus sur 158");
  assert.equal(compte(EN, "weight", false), 23, "23 refusés — 18 tirets et 5 « Varies »");
  assert.equal(compte(FR, "cost", true), 152, "la couche FR lit AUTANT que l'anglaise");
  assert.equal(compte(FR, "weight", true), 135, "idem pour le poids");

  /* ④ LES QUATRE VALEURS HISTORIQUEMENT FAUSSES, relues sur le vrai record. */
  const rec = (g, slug) => Object.values(EN[g]).find((r) => r.slug === slug);
  assert.equal(parsePoids(rec("gear", "mirror").data.weight).valeur, 0.5, "le miroir pesait 2 lb.");
  assert.equal(parsePoids(rec("weapon", "dart").data.weight).valeur, 0.25, "la fléchette pesait 4 lb.");
  assert.equal(parsePoids(rec("gear", "entertainer-s-pack").data.weight).valeur, 58.5, "le paquetage ne pesait rien");
  assert.equal(parseCout(rec("gear", "spyglass").data.cost).gp, 1000, "la longue-vue coûte 1 000 po");
});

test("poids — ce qui ne se pèse pas se COMPTE à part, au lieu de peser 0", () => {
  /* ⛔ L'ancienne version sautait l'objet illisible en silence : il entrait
     dans `compte` et ajoutait 0 à `somme`. Un sac de trois objets dont deux
     portent « — » s'affichait donc avec un poids d'aplomb. */
  const catalogue = {
    "corde": { data: { weight: "5 lb." } },
    "cloche": { data: { weight: "—" } },
    "focaliseur": { data: { weight: "Varies" } }
  };
  const lignes = [
    { ref: { id: "corde" }, quantity: 2, location: "backpack" },
    { ref: { id: "cloche" }, quantity: 1, location: "backpack" },
    { ref: { id: "focaliseur" }, quantity: 1, location: "self" }
  ];
  const p = poidsParLieu(lignes, (ref) => catalogue[ref.id]);
  assert.equal(p.somme.backpack, 10, "deux cordes de 5 lb.");
  assert.equal(p.compte.backpack, 3, "trois objets dans le sac");
  assert.equal(p.inconnus.backpack, 1, "et la cloche est DÉCLARÉE illisible, pas pesée 0");
  assert.equal(p.inconnus.self, 1, "le focaliseur aussi");
  assert.equal(p.somme.self, 0, "on ne lui invente pas un poids");
  assert.equal(p.unite, "lb", "l'unité est celle du livre");
  assert.equal(p.melange, false);

  /* mélanger deux unités est une faute de données, pas une somme à arrondir */
  const mixte = poidsParLieu(
    [{ ref: { id: "a" }, quantity: 1 }, { ref: { id: "b" }, quantity: 1 }],
    (ref) => ({ data: { weight: ref.id === "a" ? "5 lb." : "2 kg" } })
  );
  assert.equal(mixte.melange, true, "livre et kilo dans la même pile : la somme ne veut rien dire");
  assert.equal(mixte.unite, null);
});
test("🔴 LE FIL DE LA BOURSE DU SAC — on CLIQUE, et le popup doit s'ouvrir", () => {
  /* 🔴 LA FAUTE, MESURÉE À L'ÉCRAN LE 19/09 AU SOIR : un clic sur la bourse du sac ne
     produisait RIEN. Son bouton existait depuis le 18/09, il publiait bien
     `surPorte("purse")` — et le `surPorte` du sac ne connaissait que `gear`, `wares`
     et `send`. ⛔ Un organe posé sans son fil, pour la QUATRIÈME fois dans ce lot.
     ⚠️ ET DEUX GARDES PLUS FAIBLES ONT ÉTÉ ÉCRITS AVANT CELUI-CI, TOUS DEUX VERTS SUR
     LA FAUTE : l'un éprouvait l'ÉCRAN (qui faisait son travail), l'autre cherchait
     `id === "purse"` dans la source — chaîne qui existe AUSSI chez R. ⭐ Seul un témoin
     qui CLIQUE pour de vrai, dans l'écran monté, pouvait accuser. Il le fait. */
  let doc = fixture.document;
  const rendre = () => renderEquipmentStep({ document: doc, resolved: fixture.resolved, query },
    (a) => { doc = appliquer(doc, a); });

  let node = rendre();
  const gear = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "GEAR");
  if (gear) gear.click();
  node = rendre();
  /* la porte `Backpack` de R ouvre le sac B1 */
  const porte = node.querySelector('.gear-porte[data-porte="backpack"]');
  assert.ok(porte, "⛔ la porte du sac a disparu de R : ce garde doit être réécrit");
  porte.click();
  node = rendre();

  const sac = node.querySelector(".sac");
  assert.ok(sac, "on est bien dans le sac");
  assert.equal(sac.querySelector('[data-organe="bourse-voile"]'), null, "elle est fermée d'abord");

  const bourse = sac.querySelector('[data-organe="purse"]');
  assert.ok(bourse, "⛔ le bouton de la bourse a disparu du sac");
  bourse.click();
  node = rendre();
  assert.ok(node.querySelector('[data-organe="bourse-voile"]'),
    "🔴 CLIQUER LA BOURSE DU SAC DOIT L'OUVRIR — c'est exactement ce qui ne se passait pas le 19/09.\n" +
    "   Un organe qui publie son geste et que personne n'écoute est un organe MORT.");

  /* ⭐ ET RETAPER LA REFERME — le même geste que sur R, parce que c'est le MÊME état. */
  node.querySelector('.sac [data-organe="purse"]').click();
  node = rendre();
  assert.equal(node.querySelector('[data-organe="bourse-voile"]'), null,
    "⚖️ *« retaper la bourse la referme »* — et l'état est celui de R, pas un second");
});

/* ══ L'ENCOMBREMENT DIT SON UNITÉ, ⛔ ET IL N'EN INVENTE PAS ═══════════════════
   ⚖️ ERIC, 2026-09-21 : *« rajoute l'unité d'encombrement »*.
   🔴 CE QUE CE GARDE REMPLACE : rien. Le libellé vivait dans `equipment-step.mjs`, sans unité,
   et son commentaire justifiait ce manque par *« elle est dite trois fois juste dessous »*.
   📏 Relevé sur le site déployé le 21/09 : les trois lignes du dessous rendent `Gear 0`,
   `Backpack 0`, `Other 0` — **aucune ne la dit**. La justification était morte et personne ne
   l'avait vu, parce qu'aucun garde ne lisait cette phrase.
   ⭐ LA LEÇON : une justification qui s'appuie sur un VOISIN meurt quand le voisin change, et le
   commentaire, lui, continue d'affirmer. Une phrase que personne ne tient dérive en silence. */
test("l'encombrement dit son unité — et il n'en invente pas une quand elles sont mêlées", () => {
  /* ① LE CAS DU JEU : la livre — Eric, 21/09 : *« non, en mesures impériales ici »*. */
  assert.equal(motDeLEncombrement({ somme: 46.5, inconnus: 0 }, { unite: "lb", melange: false }),
    "Encumbrance : 46.5 lb");
  assert.equal(UNITE_DU_JEU, "lb", "⚖️ et l'unité du jeu est bien la livre");

  /* ② ⛔ UN TOTAL QUI N'EST PAS EN LIVRES EST UNE ANOMALIE, ⛔ PAS UN CAS D'AFFICHAGE.
     ⭐ On ne le réétiquette pas — le chiffre mentirait — et on ne le CONVERTIT pas : la maison
     l'interdit en toutes lettres *(« la livre et le kilo ne se convertissent JAMAIS l'un dans
     l'autre ici… convertir inventerait une précision que le livre ne donne pas »)*. On le DIT. */
  const enKilos = motDeLEncombrement({ somme: 12, inconnus: 0 }, { unite: "kg", melange: false });
  assert.doesNotMatch(enKilos, /\blb\b/,
    `⛔ un total en kilos réétiqueté en livres : « ${enKilos} » — le chiffre ment, et il se recopie`);
  assert.match(enKilos, /hors mesures impériales/, "⭐ et il le DIT, ⛔ il ne se tait pas");

  /* ③ MÊME TRAITEMENT POUR UN MÉLANGE : des livres ET des kilos dans le même total. */
  const mele = motDeLEncombrement({ somme: 30, inconnus: 0 }, { unite: null, melange: true });
  assert.doesNotMatch(mele, /\blb\b|\bkg\b/,
    `⛔ une unité affichée sur un total qui en mêle plusieurs : « ${mele} »`);
  assert.match(mele, /hors mesures impériales/, "⭐ et il le DIT aussi");

  /* ④ l'absence de mesure n'est PAS une autre unité : l'unité du jeu s'applique par défaut */
  assert.equal(motDeLEncombrement({ somme: 0, inconnus: 0 }, { unite: null, melange: false }),
    "Encumbrance : 0 lb",
    "⛔ aucun objet pesé n'est pas « une autre unité » : c'est l'unité du jeu qui s'applique");

  /* ⑤ et les objets sans poids connu restent annoncés — une somme qui ne porte pas tout le dit */
  assert.match(motDeLEncombrement({ somme: 5, inconnus: 2 }, { unite: "lb", melange: false }),
    /2 sans poids/, "⛔ une somme qui ne pèse pas tout doit le dire");
});

/* ══ CHAQUE COMPOSANT DIT SON UNITÉ, ET C'EST LE MÊME JUGE QUE LE TOTAL ════════
   ⚖️ ERIC, 2026-09-21, en listant ce qu'il veut voir : *« Encumbrance 34 lb · Gear 0 lb ·
   Backpack 34 lb · Other 0 lb »*.
   ⭐ CE QUE CE GARDE TIENT VRAIMENT : ⛔ pas « il y a écrit lb », mais **que les quatre lignes
   consultent le MÊME juge**. Deux lignes voisines qui afficheraient deux unités pour une seule
   pesée seraient pires qu'une ligne nue — le lecteur additionnerait. */
test("chaque ligne de poids dit son unité, et jamais une autre que le total", () => {
  const pesee = { unite: "lb", melange: false };
  assert.equal(motDUnPoids("Gear", 0, 0, pesee), "Gear 0 lb");
  assert.equal(motDUnPoids("Backpack", 34, 0, pesee), "Backpack 34 lb");
  /* ⭐ et les objets sans poids connu restent annoncés — une part qui ne pèse pas tout le dit */
  assert.equal(motDUnPoids("Other", 2.5, 3, pesee), "Other 2.5 lb +3?");

  /* ⛔ L'ANOMALIE SE PROPAGE : si le total n'est pas en livres, AUCUNE ligne ne s'étiquette.
     ⭐ Et c'est le total qui l'explique, UNE fois — ⛔ pas chaque ligne qui répète. */
  for (const anormal of [{ unite: "kg", melange: false }, { unite: null, melange: true }]) {
    const ligne = motDUnPoids("Gear", 12, 0, anormal);
    assert.doesNotMatch(ligne, /\blb\b|\bkg\b/,
      `⛔ une ligne étiquetée alors que la pesée ne l'est pas : « ${ligne} »`);
    assert.equal(uniteAffichee(anormal), null, "⛔ le juge doit refuser, pas choisir au hasard");
  }

  /* 🔴 LE TÉMOIN QUI COMPTE : le total et les lignes ne peuvent PAS diverger, parce qu'ils
     posent la question au même juge. ⛔ Si un jour l'un d'eux calcule son unité tout seul, ce
     garde tombe — c'est exactement ce qu'on veut qu'il attrape. */
  for (const cas of [{ unite: "lb", melange: false }, { unite: "kg", melange: false },
                     { unite: null, melange: true }, { unite: null, melange: false }]) {
    const total = motDeLEncombrement({ somme: 34, inconnus: 0 }, cas);
    const ligne = motDUnPoids("Backpack", 34, 0, cas);
    const totalEtiquete = /\blb\b/.test(total);
    const ligneEtiquetee = /\blb\b/.test(ligne);
    assert.equal(ligneEtiquetee, totalEtiquete,
      `⛔ divergence : total « ${total} » contre ligne « ${ligne} »`);
  }
});
