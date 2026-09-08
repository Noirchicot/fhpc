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
  currentCartLines, nextCartIndex, cartCompte, cartTotal, lignesParLieu, poidsParLieu }
  from "../ui/builder/equipement-pipeline.mjs";
import { SLOT_VERS_BOITES, POCHES_DEBORD, BOITES } from "../ui/builder/b3-disposition.mjs";
import { renderEquipmentStep, currentGearLines, nextGearIndex, currentCurrency }
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
  if (a.kind === "choisirDepart") {
    let d = verbs.set({ document: doc, path: "depart", value: a.valeur }).document;
    if (a.valeur === "purse") {
      const bourse = currentCurrency(d);
      for (const k of CURRENCY_KEYS) {
        const base = Number.isInteger(bourse[k]) ? bourse[k] : 0;
        d = verbs.set({ document: d, path: `currency.${k}`, value: k === "gp" ? base + 50 : base }).document;
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

test("⭐ LE PARCOURS ENTIER — dépôt au panier (document), CART → B2, BUY paie UNE fois, envoie tout, vide le panier", () => {
  let doc = verbs.set({ document: fixture.document, path: "currency.gp", value: 100 }).document;
  doc = appliquer(doc, { kind: "cartAdd", ref: { kind: "gear", id: "srd:gear:en:crowbar" } });
  const rendre = () => renderEquipmentStep({ document: doc, resolved: fixture.resolved, query },
    (a) => { doc = appliquer(doc, a); });

  let node = rendre();
  const gear = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "GEAR");
  if (gear) gear.click();
  node = rendre();
  assert.equal(node.querySelectorAll(".b3-scene").length, 1, "le dressing d'abord");
  node.querySelector('[aria-label="Equipment"]').click();
  node = rendre();
  const cart = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "CART");
  assert.equal(cart.dataset.compte, "1", "le compteur du CART lit le document");
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

  let node = rendre();
  const gear = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "GEAR");
  if (gear) gear.click();
  node = rendre();
  node.querySelector('[aria-label="Equipment"]').click();
  node = rendre();
  [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "CART").click();
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
  let node = rendre();
  for (let i = 0; i < 4 && !node.querySelector(".carte-r"); i++) {
    const sortie = [...node.querySelectorAll("button")].find((b) => b.textContent === "BACK")
      || node.querySelector('[aria-label="Equipment"]');
    if (sortie) sortie.click();
    node = rendre();
  }
  assert.ok(node.querySelector(".carte-r"), "témoin : on a bien retrouvé le catalogue");
  [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "CART").click();
  node = rendre();

  const b2 = node.querySelector('[data-ecran="B2"]');
  [...b2.querySelectorAll("button")].find((b) => b.textContent === "BACK").click();
  assert.equal(cartCompte(doc), 1, "BACK recule, il n'efface pas");

  node = rendre();
  [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "CART").click();
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
  let node = rendre();
  for (let i = 0; i < 5 && !node.querySelector(".aiguilleur"); i++) {
    const porte = [...node.querySelectorAll("button")].find((b) => b.textContent === "BACK")
      || [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "GEAR")
      || node.querySelector('[aria-label="Equipment"]');
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

  const prendre = [...node.querySelectorAll(".aiguilleur-bouton")]
    .find((b) => b.textContent.includes("50"));
  const gpAvant = currentCurrency(doc).gp || 0;
  prendre.click();
  assert.equal(doc.build.choices.find((c) => c.path === "depart")?.value, "purse", "le choix est ÉCRIT au document");
  assert.equal(currentCurrency(doc).gp, gpAvant + 50, "et les 50 po tombent dans la bourse — le geste ratifié, pas une copie");

  node = rendre();
  assert.equal(node.querySelectorAll(".aiguilleur").length, 0, "la question ne se repose pas : le document a répondu");

  const ressuscite = JSON.parse(JSON.stringify(doc));
  assert.equal(ressuscite.build.choices.find((c) => c.path === "depart")?.value, "purse",
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
