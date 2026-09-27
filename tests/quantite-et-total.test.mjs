/* ══ LOT 308 — LE MONTANT FINAL SUIT LA QUANTITÉ, ET LA SCISSION A LIEU ═══════════════════════

   ⚖️ Eric, 2026-09-27 : *« il faut tj que le montant final soit modifié avec l'augmentation en
   quantité »* · *« Quand j'ai 5 caltrops et que je veux en envoyer 2 ailleurs et send, mon total
   passe à 3 et on crée un nouveau token à la destination requise avec qty 2 »*.

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER — deux fautes MESURÉES le 27/09, aucune vue par un garde :
   · la scission n'avait JAMAIS lieu. Le pilote de X1 lisait `ligne.qte`, que le lecteur des lignes
     n'écrit pas : la pile valait 1, `part < total` était toujours faux, et `Send` déplaçait TOUTE la
     pile. 📏 Au navigateur : 5 caltrops, « 2 » tapé, Send vers Party → les 5 partaient. ⛔ Aucun
     garde ne passait par le pilote : ils testaient la fiche seule, ou `scinderLaLigne` seule.
   · X2 ne montrait aucun total : sa tête était bâtie avec `qte: 1`, et changer la quantité ne
     repeignait rien d'autre que le champ.
   ⭐ Ce garde passe donc par le PILOTE (l'étape rendue, la fiche ouverte au doigt, le geste rendu),
   et par la fiche X2 entière — pas par une fonction isolée.
   ⏳ SA LIMITE : le CONTRÔLE qui choisit la quantité n'est pas tranché (Eric, 27/09, le lot en
   pause). Ce garde nomme le champ d'aujourd'hui ; le jour où il change, seules les deux lignes
   `choisir(…)` changent — ce qu'elles prouvent (le total, le geste) reste. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { renderEquipmentStep, currentGearLines, nextGearIndex, scinderLaLigne } =
  await import("../ui/builder/equipment-step.mjs");
const { construireLaFicheX2 } = await import("../ui/builder/x2-ecran.mjs");
const { parseCout } = await import("../ui/builder/equipement-pipeline.mjs");

const fixture = exempleFhEn();
const verbs = fixture.build.verbs;
const query = fixture.layers.verbs.query;
/* ⭐ le départ est répondu : sans lui, X0 remplace Gear (lot 254) */
const BASE = verbs.set({ document: fixture.document, path: "depart.class", value: "A" }).document;
const CALTROPS = { kind: "gear", id: "srd:gear:en:caltrops" };   // 1 GP · 2 lb.

function ajouter(doc, ref, quantity) {
  const index = nextGearIndex(doc);
  let d = verbs.choose({ document: doc, path: `gear[${index}]`, ref }).document;
  d = verbs.set({ document: d, path: `gear[${index}].quantity`, value: quantity }).document;
  d = verbs.set({ document: d, path: `gear[${index}].equipped`, value: false }).document;
  d = verbs.set({ document: d, path: `gear[${index}].location`, value: "backpack" }).document;
  return { doc: d, index };
}
const texte = (n, organe) => (n.querySelector(`.x1 [data-organe="${organe}"]`) || {}).textContent;

/** Le pilote : l'étape rendue sur un document, ses gestes RELEVÉS (pas rejoués). */
function pilote(doc) {
  const actions = [];
  const rendre = () => renderEquipmentStep({ document: doc, resolved: null, query }, (a) => actions.push(a));
  return {
    actions,
    rendre,
    /** ouvre la fiche X1 des caltrops depuis le sac, comme le doigt le fait */
    ouvrir() {
      /* ⚠️ l'état d'écran de l'étape vit au module : après un Send, on est déjà au sac */
      let n = rendre();
      const ouverte = n.querySelector('.x1 [data-organe="close"]');
      if (ouverte) { ouverte.dispatchEvent({ type: "click" }); n = rendre(); }
      if (!n.querySelector('[data-ecran="SB3.1"]')) {
        n.querySelector('[data-porte="backpack"]').click();
        n = rendre();
      }
      const jeton = [...n.querySelectorAll('[data-ecran="SB3.1"] [data-occupe="oui"]')]
        .find((e) => /caltrops/i.test(e.getAttribute("aria-label")));
      assert.ok(jeton, "témoin : le jeton des caltrops est au sac");
      jeton.dispatchEvent({ type: "contextmenu", preventDefault() {} });
      n = rendre();
      assert.ok(n.querySelector(".x1"), "témoin : la fiche X1 est ouverte");
      return n;
    },
    /** ⏳ le seul endroit qui nomme le CONTRÔLE d'aujourd'hui (le champ « n / pile ») */
    choisir(n, v) {
      const champ = n.querySelector('.x1 [data-organe="send-n"] input');
      champ.value = String(v);
      champ.dispatchEvent({ type: "change" });
      /* ⭐ LE MÊME NŒUD, PAS UN RENDU NEUF : la fiche doit se repeindre D'ELLE-MÊME au choix —
         un garde qui re-rendrait l'étape verrait un total juste que le joueur ne verrait pas. */
      return n;
    },
    envoyer(n, destination) {
      const s = n.querySelector('.x1 [data-organe="send-vers"] select');
      s.value = destination;
      s.dispatchEvent({ type: "change" });
      n.querySelector('.x1 [data-organe="envoyer"]').dispatchEvent({ type: "click" });
    },
  };
}

test("1 — ⚖️ X1 : 5 caltrops, 2 choisis → la tête dit ×2 et le total de DEUX (2 gp · 4 lb)", () => {
  const { doc } = ajouter(BASE, CALTROPS, 5);
  const p = pilote(doc);
  let n = p.ouvrir();
  assert.equal(texte(n, "unite"), "1 GP · 2 lb.", "témoin : l'unité du record");
  /* ⭐ la fiche s'ouvre sur la pile entière : son total est celui de la pile */
  assert.equal(texte(n, "qte"), "×5");
  assert.equal(texte(n, "total"), "5 gp · 10 lb");
  n = p.choisir(n, 2);
  assert.equal(texte(n, "qte"), "×2", "la quantité en jeu est celle qu'on a choisie");
  assert.equal(texte(n, "total"), "2 gp · 4 lb",
    "⚖️ « il faut tj que le montant final soit modifié avec l'augmentation en quantité »");
  n = p.choisir(n, 1);
  assert.equal(texte(n, "total"), "", "⛔ à un seul, pas de total qui répète l'unité");
});

test("2 — ⚖️ LES CALTROPS D'ERIC : 2 sur 5 → une SCISSION (3 restent, un jeton de 2 part) ; 5 sur 5 → toute la pile", () => {
  const { doc, index } = ajouter(BASE, CALTROPS, 5);

  const deux = pilote(doc);
  deux.envoyer(deux.choisir(deux.ouvrir(), 2), "party");
  const geste = deux.actions.find((a) => /GearLine$/.test(a.kind));
  assert.deepEqual(geste, { kind: "splitGearLine", index, quantity: 2, location: "party" },
    "🔴 Send avec 2 sur 5 est une scission — ⛔ pas le déplacement de toute la pile");
  /* ⭐ et la scission rend bien 3 + 2 : le verbe de la coquille, rejoué */
  const source = currentGearLines(doc).find((l) => l.index === index);
  const apres = currentGearLines(scinderLaLigne({ document: doc, verbs, source, part: geste.quantity,
    index: nextGearIndex(doc), location: geste.location }));
  const caltrops = apres.filter((l) => l.ref && l.ref.id === CALTROPS.id);
  assert.deepEqual(caltrops.map((l) => [l.quantity, l.location || "backpack"]).sort(),
    [[2, "party"], [3, "backpack"]], "« mon total passe à 3 et on crée un nouveau token … avec qty 2 »");

  const cinq = pilote(doc);
  cinq.envoyer(cinq.choisir(cinq.ouvrir(), 5), "party");
  assert.deepEqual(cinq.actions.find((a) => /GearLine$/.test(a.kind)),
    { kind: "moveGearLine", index, location: "party" }, "au total, c'est la pile entière qui part, sans scission");

  /* ⭐ et sans toucher au nombre, la fiche envoie la pile — ce que le joueur voyait jusqu'ici */
  const rien = pilote(doc);
  rien.envoyer(rien.ouvrir(), "party");
  assert.equal(rien.actions.find((a) => /GearLine$/.test(a.kind)).kind, "moveGearLine");
});

test("3 — ⚖️ X2 : 3 achetés → la tête dit ×3 et le total de TROIS, et BUY paie 3 et pose 3", () => {
  const ITEM = { ref: CALTROPS, nom: "Caltrops", coutTexte: "1 GP", cout: parseCout("1 GP"),
    poidsTexte: "2 lb.", prose: "" };
  const actions = [];
  const n = construireLaFicheX2({ liste: [ITEM], index: 0, bourse: { gp: 50 }, onAction: (a) => actions.push(a) });
  const organe = (o) => n.querySelector(`[data-organe="${o}"]`).textContent;
  assert.equal(organe("total"), "", "témoin : à un, pas de total");
  /* ⏳ le contrôle d'aujourd'hui : le `+` deux fois */
  const plus = n.querySelector(".pipeline-pas-plus");
  plus.click(); plus.click();
  assert.equal(organe("qte"), "×3");
  assert.equal(organe("total"), "3 gp · 6 lb", "⚖️ le montant final suit la quantité");
  /* ⭐ un prix marchandé change le total, et ⛔ un `+` ne l'efface plus */
  const prix = [...n.querySelectorAll(".pipeline-typein")].find((e) => e.getAttribute("aria-label") === "Price");
  prix.value = "2 GP";
  prix.dispatchEvent({ type: "change" });
  assert.equal(organe("total"), "6 gp · 6 lb");
  n.querySelector(".pipeline-pas-moins").click();
  assert.equal(prix.value, "2 GP", "⛔ changer la quantité ne remet pas le prix du record");
  assert.equal(organe("total"), "4 gp · 4 lb");
  n.querySelector(".pipeline-pas-plus").click();
  /* BUY */
  [...n.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Pay, send, and return").click();
  assert.deepEqual(actions.find((a) => a.kind === "payer").cout, { pp: 0, gp: 6, sp: 0, cp: 0 },
    "BUY paie le total affiché");
  assert.equal(actions.find((a) => a.kind === "addGearLine").quantity, 3, "et pose 3");
});
