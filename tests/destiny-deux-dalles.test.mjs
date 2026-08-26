/* ══ DESTINY — LA RÈGLE DES DEUX DALLES ══════════════════════════════════

   Eric, 2026-08-26 : *« la dalle **tarot** ne porte AUCUN AUTRE bouton que le
   tarot. C'est la dalle **TEXTE** qui porte les éléments classiques. »*

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER, ET C'EST MESURÉ (lot G, 26/08) :
   le `?` était appendu **dans la carte du tarot**. Un `<button>` DANS un
   `<button>` — du HTML invalide, et surtout un clic qui remonte :
   **demander de l'aide RETOURNAIT LA CARTE.**

   ⚠️ ET LA PARADE POSÉE ALORS EST UN EFFET, PAS LA RÈGLE. `:not(button)` dans
   le chercheur d'hôte marche parce que le tarot *se trouve* être un bouton.
   ⛔ Le jour où une dalle-image n'en serait pas un, elle recevrait le `?` sans
   que rien ne proteste. Ce fichier mesure **la règle**, pas son effet de bord.

   ⚖️ CE QU'IL N'AFFIRME PAS : ni que le tarot doit être un bouton, ni quelle
   forme il a. Il affirme **ce qu'il ne porte pas**, et **où va ce qu'il ne
   porte pas**. */

import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
const { renderDestinyStep } = await import("../ui/builder/destiny-step.mjs");

const ARCANE = "srd:arcana:en:the-magician";
const query = () => ({ record: { name: "The Magician", data: { numeral: "I", meaning: "…", destiny: { impact: 2 } } } });

/** L'écran, carte retournée et texte révélé — l'état où les deux dalles vivent. */
function ecran() {
  return renderDestinyStep({
    /* ⚠️ LA FORME DU `resolved` COMPTE, et mon premier jet l'avait devinée :
       `renderScore` lit `resolved.stats`, un TABLEAU, et y cherche l'entrée
       `fh:destiny`. Un objet `{ destiny: { value } }` le fait rendre `null` en
       silence — le Score disparaissait et le test accusait le mauvais coupable.
       ⛔ Une fixture inventée mesure la fixture, pas le code. */
    document: {}, resolved: { stats: [{ id: "fh:destiny", value: 2 }] }, query,
    intro: false, drawnId: ARCANE, face: "up", revealed: true
  }, () => {});
}

test("1 — 🃏 LA DALLE TAROT NE PORTE QUE LE TAROT", () => {
  const s = ecran();
  const tarot = s.querySelector(".card-face");
  assert.ok(tarot, "témoin : la carte du tarot est là");
  const dedans = tarot.querySelectorAll("button, .tuto-point, .fiche-livre, .card-action");
  assert.equal(dedans.length, 0,
    "⛔ ni `?`, ni livre, ni bouton d'action, ni pastille. Un bouton DANS le tarot est un clic qui " +
    "remonte : demander l'aide retournerait la carte (mesuré le 26/08).");
});

test("2 — 📄 LA DALLE TEXTE PORTE LES ÉLÉMENTS CLASSIQUES", () => {
  const s = ecran();
  const texte = s.querySelector(".card-reveal");
  assert.ok(texte, "témoin : la carte texte est là");
  const actions = texte.querySelectorAll(".card-action");
  assert.equal(actions.length, 2, "les deux gestes — `Draw again` et `Choose yourself` — vivent SUR elle");
  assert.ok(texte.querySelector(".card-score"), "le Score aussi : il porte du texte, il va où le texte va");
});

test("3 — ⛔ AUCUN BOUTON DANS LE FOND — Eric, 26/08", () => {
  /* Le fond ne peint rien (NORMES §1 quinquies bis) : ce n'est pas une
     surface, c'est une respiration. Un contrôle posé dessus n'a rien sous lui.
     Ici : aucun `.card-action` ne doit être un enfant DIRECT de l'écran. */
  const s = ecran();
  /* ⚠️ On lit `className`, PAS `classList` : le stub de test ne rend pas la
     seconde, et un garde qui s'appuie dessus rend `[]` sur tout — il serait
     vert pour toujours, y compris sur le défaut qu'il défend. Mesuré en
     écrivant ce fichier : l'attaque ci-dessous ne mordait pas. */
  const orphelins = [...s.children].filter((e) => String(e.className || "").split(/\s+/).includes("card-actions"));
  assert.deepEqual(orphelins, [],
    "les boutons étaient posés directement dans `.card-step`, donc sur le cadre d'écran. " +
    "Tant que le cadre peignait, ils AVAIENT L'AIR d'être sur quelque chose.");
});

test("⚔️ ATTAQUE — remettre les actions dans le fond fait rougir le test 3", () => {
  const faux = document.createElement("section");
  faux.className = "card-step";
  const actions = document.createElement("div");
  actions.className = "card-actions";
  faux.append(actions);
  const orphelins = [...faux.children].filter((e) => String(e.className || "").split(/\s+/).includes("card-actions"));
  assert.equal(orphelins.length, 1, "témoin : le test 3 sait voir un bouton posé sur le fond");
});
