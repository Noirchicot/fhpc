/* ══ DESTINY — LA RÈGLE DES DEUX DALLES ══════════════════════════════════

   Eric, 2026-08-26 : *« la dalle **tarot** ne porte AUCUN AUTRE bouton que le
   tarot. C'est la dalle **TEXTE** qui porte les éléments classiques. »*

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER, ET C'EST MESURÉ (lot G, 26/08) :
   le `?` était appendu **dans la carte du tarot**. Un `<button>` DANS un
   `<button>` — du HTML invalide, et surtout un clic qui remonte :
   **demander de l'aide RETOURNAIT LA CARTE.**

   ⭐ LA RÈGLE A SURVÉCU À LA REFONTE DU LOT 109, ET SES SÉLECTEURS ONT CHANGÉ.
   Les croquis d'Eric du 30/08 dessinent exactement les mêmes deux colonnes —
   `TAROT` à gauche, `TEXTE EXPLICATIF` à droite — et rangent la paire de
   boutons SOUS elles. C'est la même loi, sur un écran refait : la colonne
   d'image ne porte rien, la colonne de texte porte le reste.
   ⛔ Un garde qu'on supprime « parce que l'écran a changé » emporte la leçon
   avec l'implémentation. Celui-ci est réécrit, pas retiré.

   ⚖️ CE QU'IL N'AFFIRME PAS : ni que le tarot doit être un bouton, ni quelle
   forme il a. Il affirme **ce qu'il ne porte pas**, et **où va ce qu'il ne
   porte pas**. */

import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
const { renderDestinyStep } = await import("../ui/builder/destiny-step.mjs");
const { renderCeremonie } = await import("../ui/builder/destiny-ceremonie.mjs");

const ARCANE = "srd:arcana:en:the-magician";
const query = () => ({
  record: {
    name: "The Magician",
    data: {
      numeral: "I", meaning: "…", power: "…", ability: "Intelligence",
      destiny: { impact: 2 },
      vibrations: [{ rank: 1, name: "Sleight of Will", effect: "…" }]
    }
  }
});

/** L'écran final — celui où les deux dalles vivent, quelle que soit la
 *  branche qui y a mené (tirage ou choix : le croquis les dessine jumeaux).
 *  ⚠️ LA FORME DU `resolved` COMPTE, et mon premier jet l'avait devinée :
 *  le Score lit `resolved.stats`, un TABLEAU. Un objet `{ destiny: { value } }`
 *  le fait rendre `null` en silence — une fixture inventée mesure la fixture,
 *  pas le code. */
function ecran() {
  return renderDestinyStep({
    phase: "final", document: {},
    resolved: { stats: [{ id: "fh:destiny", value: 2 }] },
    query, drawnId: ARCANE
  }, () => {});
}

test("1 — 🃏 LA DALLE TAROT NE PORTE QUE LE TAROT", () => {
  const s = ecran();
  const tarot = s.querySelector(".card-final-carte");
  assert.ok(tarot, "témoin : la colonne du tarot est là");
  assert.equal(tarot.querySelectorAll("img").length, 1, "témoin : elle porte bien la carte");
  const dedans = tarot.querySelectorAll("button, .tuto-point, .fiche-livre, .parcours-pied");
  assert.equal(dedans.length, 0,
    "⛔ ni `?`, ni livre, ni bouton d'action, ni pastille. Un bouton DANS le tarot est un clic qui " +
    "remonte : demander l'aide retournerait la carte (mesuré le 26/08).");
});

test("2 — 📄 LA DALLE TEXTE PORTE LES ÉLÉMENTS CLASSIQUES", () => {
  const s = ecran();
  const texte = s.querySelector(".card-final-texte");
  assert.ok(texte, "témoin : la colonne de texte est là");
  assert.ok(texte.querySelector(".card-score"), "le Score vit avec le texte — il EST du texte");
  /* la paire de boutons vit dans la DALLE, sous les deux colonnes : c'est le
     croquis d'Eric, et c'est la loi « un bouton se pose sur une dalle, jamais
     sur le fond ». */
  const pied = s.querySelector(".parcours-pied");
  assert.ok(pied, "la rangée de boutons est dans la dalle");
  const gestes = pied.querySelectorAll("button").filter((b) => !b.className.includes("fiche-livre"));
  assert.equal(gestes.length, 2, "« I changed my mind » et « Next »");
  assert.ok(pied.querySelector(".fiche-livre"), "et le livre, l'organe des autres chapitres (Eric, 30/08)");
});

test("3 — 🃏 PENDANT LA CÉRÉMONIE AUSSI : la carte ne contient aucun autre bouton", () => {
  /* La séquence 3 fait de la carte elle-même un bouton (c'est le geste du
     retournement). Raison de plus pour qu'elle ne contienne rien d'autre : un
     bouton imbriqué y serait invalide ET ferait remonter le clic. */
  const fs = renderCeremonie({ phase: "seq3", drawnId: ARCANE, face: "down" }, () => {});
  const carte = fs.querySelector(".ceremonie-flip");
  assert.ok(carte, "témoin : la carte de la cérémonie est là");
  assert.equal(carte.querySelectorAll("button, .tuto-point, .fiche-livre").length, 0);
});
