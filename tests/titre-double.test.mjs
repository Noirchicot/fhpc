/* ══ ⛔ ON NE NOMME PAS DEUX FOIS ═════════════════════════════════════════

   Eric, 2026-08-26 : *« si doublon de titre, effacer celui de la DALLE »*.

   📏 LE DÉFAUT MESURÉ par le lot A le même jour, sur l'écran des sorts
   préparés : « Prepared spells » écrit DEUX fois — `h2.guide-titre` pour
   l'écran, `h3` pour la dalle du vivier. Une ligne de hauteur perdue sur une
   page qui débordait déjà de 237 px.

   ⭐ CE QUE LE GARDE TIENT, ET SA MOITIÉ LA PLUS IMPORTANTE EST LA SECONDE :
     · un titre de dalle IDENTIQUE à celui de l'écran s'efface ;
     · ⛔ un titre DIFFÉRENT reste. « Skill budget » sous « Elf » nomme deux
       choses — l'effacer perdrait de l'information. Un nettoyage trop large
       est pire que le doublon qu'il retire.

   📌 §1 quinquies : *« un titre posé au-dessus d'un objet qui dit déjà de quoi
   il s'agit coûte 40 px pour ne rien apprendre »*. */

import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
/* ⛔ ON N'IMPORTE PAS `shell.mjs` ICI, et c'est une mesure : à son chargement
   il appelle `document.getElementById("app")`, que le stub de test ne rend pas
   — le module est la COQUILLE, il s'attache au vrai DOM. Les tests 5 et
   l'attaque lisent donc sa SOURCE, ce qui suffit à prouver le câblage sans
   monter l'application entière. */

/** Une carte fabriquée à la main : le garde vise la FONCTION, pas un écran. */
function carte(titreEcran, titresDalles) {
  const c = document.createElement("section");
  c.className = "decision-card";
  const h2 = document.createElement("h2");
  h2.className = "guide-titre";
  h2.append(document.createTextNode(titreEcran));
  c.append(h2);
  for (const t of titresDalles) {
    const d = document.createElement("section");
    d.className = "choix-glisse";
    const h3 = document.createElement("h3");
    h3.append(document.createTextNode(t));
    d.append(h3);
    c.append(d);
  }
  return c;
}

/* La fonction n'est pas exportée — on la rejoue à l'identique, et le test 4
   vérifie qu'elle est bien CÂBLÉE dans le rendu réel. C'est la paire du
   dépôt : la loi ici, le branchement là-bas. */
function effacer(card) {
  const ecran = card.querySelector("h1, h2");
  if (!ecran) return card;
  const mot = (ecran.textContent || "").trim().toLowerCase();
  if (!mot) return card;
  for (const titre of card.querySelectorAll("h2, h3")) {
    if (titre === ecran) continue;
    if ((titre.textContent || "").trim().toLowerCase() === mot) titre.remove();
  }
  return card;
}

test("1 — le titre de la DALLE s'efface quand il double celui de l'écran", () => {
  const c = effacer(carte("Prepared spells", ["Prepared spells"]));
  assert.equal(c.querySelectorAll("h3").length, 0, "le doublon part");
  assert.equal(c.querySelectorAll("h2").length, 1, "⛔ et celui de l'ÉCRAN reste — c'est la dalle qui cède");
});

test("2 — ⛔ un titre DIFFÉRENT reste : « Skill budget » sous « Elf » nomme deux choses", () => {
  const c = effacer(carte("Elf", ["Skill budget", "Lineage"]));
  assert.deepEqual([...c.querySelectorAll("h3")].map((h) => h.textContent), ["Skill budget", "Lineage"],
    "un nettoyage trop large est pire que le doublon qu'il retire");
});

test("3 — la comparaison ignore la casse et les blancs, jamais le sens", () => {
  const c = effacer(carte("Prepared Spells", ["  prepared spells  "]));
  assert.equal(c.querySelectorAll("h3").length, 0, "un doublon reste un doublon sous une majuscule");
});

test("4 — ⛔ un écran SANS titre ne fait rien perdre à ses dalles", () => {
  const c = document.createElement("section");
  const d = document.createElement("section");
  const h3 = document.createElement("h3");
  h3.append(document.createTextNode("Cantrips"));
  d.append(h3); c.append(d);
  effacer(c);
  assert.equal(c.querySelectorAll("h3").length, 1,
    "sans titre d'écran il n'y a pas de doublon possible — et la dalle est alors la SEULE à nommer");
});

test("5 — le rendu réel est bien CÂBLÉ dessus", async () => {
  const src = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("../ui/builder/shell.mjs", import.meta.url), "utf8"));
  assert.match(src, /effacerLesTitresEnDouble\(card\);/,
    "la loi ne sert à rien si le rendu ne l'appelle pas — c'est la faute du garde qui teste une fonction que personne n'importe");
});

test("⚔️ ATTAQUE — retirer l'appel dans le rendu fait rougir", async () => {
  const src = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("../ui/builder/shell.mjs", import.meta.url), "utf8"));
  const mute = src.replace("effacerLesTitresEnDouble(card);", "/* retiré */");
  assert.doesNotMatch(mute, /^\s*effacerLesTitresEnDouble\(card\);/m,
    "témoin : la mutation mord bien, donc le test 5 défend quelque chose");
});
