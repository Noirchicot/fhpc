/* ══ LES GARDES DU PIPELINE (B1 · B2 · SB3.x · les échanges internes) ════════
   Ce qui se mesure ici : la monnaie (parse, somme, couverture), le panier,
   la carte slot → boîtes (chaque boîte nommée EXISTE — une clef fantôme
   posrait un objet nulle part sans bruit), et le PARCOURS entier joué au
   stub : B3 → R → tap → B1 → BUY, avec la séquence d'actions exacte. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
globalThis.document = createTestDocument();

import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { parseCout, formatCout, multiplieCout, additionneCouts, bourseCouvre, enGP,
  panierAjouter, panierVider, panierCompte, panierTotal, lignesParLieu }
  from "../ui/builder/equipement-pipeline.mjs";
import { SLOT_VERS_BOITES, BOITES } from "../ui/builder/b3-disposition.mjs";
import { renderEquipmentStep } from "../ui/builder/equipment-step.mjs";

const fixture = exempleFhEn();
const query = fixture.layers.verbs.query;

test("monnaie — parseCout lit les chaînes du SRD et refuse d'inventer", () => {
  assert.deepEqual(parseCout("25 GP"), { pp: 0, gp: 25, sp: 0, cp: 0 });
  assert.deepEqual(parseCout("2 sp"), { pp: 0, gp: 0, sp: 2, cp: 0 });
  assert.deepEqual(parseCout("1,500 GP"), { pp: 0, gp: 1500, sp: 0, cp: 0 });
  /* ⛔ un objet sans prix N'EST PAS un objet à 0 : null, et l'écran le dit. */
  assert.equal(parseCout(undefined), null);
  assert.equal(parseCout("—"), null);
  assert.equal(formatCout(null), "—");
});

test("monnaie — somme, couverture clef à clef, et le taux d'affichage en GP", () => {
  const total = additionneCouts([multiplieCout(parseCout("3 GP"), 2), parseCout("5 sp")]);
  assert.deepEqual(total, { pp: 0, gp: 6, sp: 5, cp: 0 });
  assert.equal(bourseCouvre({ gp: 6, sp: 5, cp: 0, pp: 0 }, total), true);
  /* ⛔ PAS DE CHANGE AUTOMATIQUE : 7 gp ne paient pas 5 sp tout seuls —
     le change est un acte de table, pas d'écran. */
  assert.equal(bourseCouvre({ gp: 7, sp: 0, cp: 0, pp: 0 }, total), false);
  assert.equal(enGP({ pp: 1, gp: 2, sp: 3, cp: 4 }), 10 + 2 + 0.3 + 0.04);
});

test("panier — il additionne les mêmes refs, et le FREE de ligne sort du total", () => {
  panierVider();
  const ref = { kind: "gear", id: "srd:gear:en:crowbar" };
  panierAjouter({ ref, nom: "Crowbar", cout: parseCout("2 GP") });
  panierAjouter({ ref, nom: "Crowbar", cout: parseCout("2 GP") });
  assert.equal(panierCompte(), 2, "deux crowbars = UNE ligne à ×2");
  assert.deepEqual(panierTotal(), { pp: 0, gp: 4, sp: 0, cp: 0 });
  panierVider();
});

test("slot → boîtes — chaque boîte nommée par la carte provisoire EXISTE", () => {
  /* ⛔ une clef fantôme enverrait un objet porté NULLE PART, sans un bruit —
     exactement le genre d'absence qui n'est jamais une réponse. */
  const clefs = new Set(BOITES.map((b) => b.clef));
  for (const [slot, boites] of Object.entries(SLOT_VERS_BOITES)) {
    assert.ok(boites.length > 0, `${slot} a au moins une boîte`);
    for (const b of boites) assert.ok(clefs.has(b), `${slot} → ${b} : cette boîte n'existe pas`);
  }
  /* témoin : les DIX slots de la donnée sont tous couverts. */
  assert.equal(Object.keys(SLOT_VERS_BOITES).length, 10);
});

test("lieux — location absente se lit « backpack », jamais « porté »", () => {
  const lignes = [{ ref: { id: "a" } }, { ref: { id: "b" }, location: "self" },
    { ref: { id: "c" }, location: "storage" }];
  assert.equal(lignesParLieu(lignes, "backpack").length, 1);
  assert.equal(lignesParLieu(lignes, "self").length, 1);
  assert.equal(lignesParLieu(lignes, "storage").length, 1);
});

test("⭐ LE PARCOURS ENTIER — B3 → Equipment → R, dépôt au panier, CART → B2, BUY paie UNE fois et envoie tout", () => {
  panierVider();
  const actions = [];
  const doc = fixture.build.verbs.set({ document: fixture.document, path: "currency.gp", value: 100 }).document;
  const node = renderEquipmentStep({ document: doc, resolved: fixture.resolved, query }, (a) => actions.push(a));

  /* B3 est la porte d'entrée (si un test précédent a laissé la vue ailleurs,
     on y revient par GEAR — l'état de vue est un état d'écran, c'est voulu). */
  const gear = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "GEAR");
  if (gear) gear.click();
  assert.equal(node.querySelectorAll(".b3-scene").length, 1, "le dressing d'abord");
  node.querySelector('[aria-label="Equipment"]').click();
  assert.equal(node.querySelectorAll(".carte-r").length, 1, "le catalogue derrière sa porte");

  /* le panier se remplit par le PILOTE (le dépôt SHOPPING LIST du glisser) —
     on le joue ici par l'API du panier, le geste lui-même est gardé par les
     suites du glisser. */
  panierAjouter({ ref: { kind: "gear", id: "srd:gear:en:crowbar" }, nom: "Crowbar", cout: parseCout("2 GP") });
  const cart = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "CART");
  cart.click();
  const b2 = node.querySelector('[data-ecran="B2"]');
  assert.ok(b2, "CART ouvre le panier");

  const buy = [...b2.querySelectorAll("button")].find((b) => b.textContent === "BUY");
  buy.click();
  const payer = actions.find((a) => a.kind === "payer");
  const ajout = actions.find((a) => a.kind === "addGearLine");
  assert.ok(payer, "BUY paie");
  assert.deepEqual(payer.cout, { pp: 0, gp: 2, sp: 0, cp: 0 }, "le prix du record, pas un tarif inventé");
  assert.ok(ajout, "et la ligne part au personnage");
  assert.equal(ajout.location, "backpack", "destination par défaut : le sac");
  assert.equal(panierCompte(), 0, "le panier est vidé après l'envoi");
  assert.equal(node.querySelectorAll(".b3-scene, .carte-r").length, 1, "retour à UNE vue");
});

test("⚔️ ATTAQUE — BUY refuse quand la bourse ne couvre pas, et n'écrit RIEN", () => {
  panierVider();
  const actions = [];
  let doc = fixture.document;
  for (const k of ["cp", "sp", "gp", "pp"]) {
    doc = fixture.build.verbs.set({ document: doc, path: `currency.${k}`, value: 0 }).document;
  }
  const node = renderEquipmentStep({ document: doc, resolved: fixture.resolved, query }, (a) => actions.push(a));
  panierAjouter({ ref: { kind: "gear", id: "srd:gear:en:crowbar" }, nom: "Crowbar", cout: parseCout("2 GP") });

  const gear = [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "GEAR");
  if (gear) gear.click();
  node.querySelector('[aria-label="Equipment"]').click();
  [...node.querySelectorAll(".carte-r-bouton")].find((b) => b.dataset.mot === "CART").click();
  const b2 = node.querySelector('[data-ecran="B2"]');
  [...b2.querySelectorAll("button")].find((b) => b.textContent === "BUY").click();

  assert.equal(actions.filter((a) => a.kind === "payer" || a.kind === "addGearLine").length, 0,
    "bourse vide : AUCUNE écriture, ni paiement ni ligne");
  assert.equal(panierCompte(), 1, "et le panier n'est pas vidé — rien n'est parti");
  panierVider();
});
