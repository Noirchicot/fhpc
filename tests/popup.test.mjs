/* ══ LE GARDE DU POPUP — LOT 62, invariant III.4 ══════════════════════════

   LA LOI : « Un POPUP ou un OVERLAY se ferme en CLIQUANT DEHORS. ⛔ À coder
   UNE fois, pas trois. » Trois écrans l'emploient déjà — le commentaire de
   Compétences (B7.7), « What you already have » d'Equipment (B8.2), et
   l'overlay de l'œil (B8.3). Écrit trois fois, il divergerait trois fois :
   c'est exactement la faute que le dépôt paie depuis les deux échelles
   typographiques.

   TROIS PREUVES :
     A. STRUCTURELLE — personne d'autre que `popup.mjs` n'écoute le document
        pour fermer quelque chose. Sans elle, le deuxième écran écrirait sa
        propre version « juste pour cette fois ».
     B. COMPORTEMENTALE — il se ferme sur un clic DEHORS, et **pas** sur un
        clic DEDANS. Les deux moitiés comptent : un popup qui se ferme quand
        on clique son propre texte est aussi cassé qu'un popup qui ne se
        ferme jamais.
     C. 🔴 LE PIÈGE DU CLIC QUI OUVRE — le clic qui ouvre le popup se produit
        forcément DEHORS. Un écouteur armé tout de suite le refermerait dans
        le même geste : il clignoterait sans jamais s'afficher. C'est le
        défaut le plus probable de ce composant, et le seul qu'on ne verrait
        pas en relisant le code.

   ⚠️ SA LIMITE : `tests/dom-stub.mjs` n'a pas de propagation d'événements
   réelle. Le « clic dehors » est donc simulé en appelant l'écouteur du
   document avec une cible — ce que le navigateur ferait. La containment
   (« la cible est-elle DANS le popup ? ») est, elle, vraiment exercée. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { loadSources } from "./source-scan.mjs";

/* Le stub n'a pas de `document.addEventListener` : on l'ajoute ici, et on
   garde la main sur les écouteurs pour pouvoir les déclencher. */
const ecouteurs = [];
globalThis.document = Object.assign(createTestDocument(), {
  addEventListener(type, fn, options) { ecouteurs.push({ type, fn, options }); },
  removeEventListener(type, fn) {
    const i = ecouteurs.findIndex((e) => e.type === type && e.fn === fn);
    if (i >= 0) ecouteurs.splice(i, 1);
  }
});
const cliquerSur = (cible) => {
  for (const e of ecouteurs) if (e.type === "click") e.fn({ type: "click", target: cible });
};

const { mountPopup } = await import("../ui/builder/popup.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI_DIR = path.join(ROOT, "ui", "builder");

const attendreUnTour = () => new Promise((r) => setTimeout(r, 0));
function surfaceNeuve() {
  const host = document.createElement("div");
  host.hidden = true;
  let fermetures = 0;
  const popup = mountPopup(host, () => { fermetures += 1; });
  return { host, popup, dehors: () => fermetures };
}

/* ══ A — UNE SEULE IMPLÉMENTATION ════════════════════════════════════════ */

test("A — personne d'autre que popup.mjs n'écoute le document pour fermer", () => {
  const sources = loadSources([UI_DIR], ROOT);
  assert.ok(sources.length >= 10, "garde-fou de portée");
  const fautifs = sources
    .filter((s) => path.basename(s.name) !== "popup.mjs")
    .filter((s) => /document\.addEventListener\s*\(\s*["']click["']/.test(s.text))
    .map((s) => s.name);
  assert.deepEqual(fautifs, [],
    "« à coder UNE fois, pas trois » (III.4) — un second écouteur global divergerait du premier");
});

test("⚔️ ATTAQUE A — un écran qui écrirait son propre « clic dehors » est vu", () => {
  const source = {
    name: "equipment-step.mjs",
    text: 'document.addEventListener("click", () => overlay.hidden = true);'
  };
  const fautifs = [source]
    .filter((s) => path.basename(s.name) !== "popup.mjs")
    .filter((s) => /document\.addEventListener\s*\(\s*["']click["']/.test(s.text))
    .map((s) => s.name);
  assert.deepEqual(fautifs, ["equipment-step.mjs"]);
});

/* ══ B — IL SE FERME DEHORS, ET SEULEMENT DEHORS ═════════════════════════ */

test("B — un clic DEHORS ferme", async () => {
  const { host, popup, dehors } = surfaceNeuve();
  popup.show([document.createElement("p")]);
  assert.equal(host.hidden, false, "témoin : il est bien ouvert");
  await attendreUnTour();
  cliquerSur(document.createElement("button")); // un nœud qui n'est pas dans le popup
  assert.equal(dehors(), 1);
});

test("B bis — un clic DEDANS ne ferme PAS, même profond", async () => {
  const { host, popup, dehors } = surfaceNeuve();
  const texte = document.createElement("p");
  const lien = document.createElement("span");
  texte.append(lien);
  popup.show([texte]);
  await attendreUnTour();
  cliquerSur(lien); // deux niveaux sous `host`
  assert.equal(dehors(), 0,
    "un popup qui se ferme quand on clique son propre texte est aussi cassé qu'un popup qui ne se ferme jamais");
});

test("B ter — une fois fermé, il n'écoute plus rien", async () => {
  const { popup, dehors } = surfaceNeuve();
  popup.show([document.createElement("p")]);
  await attendreUnTour();
  popup.hide();
  cliquerSur(document.createElement("button"));
  assert.equal(dehors(), 0, "un popup caché qui signale encore ferait fermer ce qui n'est pas ouvert");
});

/* ══ C — 🔴 LE PIÈGE DU CLIC QUI OUVRE ═══════════════════════════════════ */

test("C — 🔴 le clic qui OUVRE ne referme pas dans le même geste", () => {
  /* Le geste réel : le joueur touche une ligne de compétence — DEHORS, donc
     — et cette action ouvre le popup. Si l'écouteur mordait tout de suite,
     le popup clignoterait sans jamais s'afficher, et personne ne saurait
     pourquoi. On n'attend PAS le tour de boucle, exprès. */
  const { popup, dehors } = surfaceNeuve();
  const ligne = document.createElement("div");
  popup.show([document.createElement("p")]);
  cliquerSur(ligne);
  assert.equal(dehors(), 0, "armé au tour de boucle SUIVANT — sinon il se referme sur son propre clic d'ouverture");
});

test("C bis — mais il s'arme bien juste après", async () => {
  const { popup, dehors } = surfaceNeuve();
  popup.show([document.createElement("p")]);
  await attendreUnTour();
  cliquerSur(document.createElement("div"));
  assert.equal(dehors(), 1, "sinon le différé serait un désarmement définitif, et le popup deviendrait indéboulonnable");
});

test("C ter — rouvrir RÉARME le différé (deux écarts d'affilée)", async () => {
  /* B7.7c : « il se réveille à CHAQUE écart ». Deux refus successifs
     rouvrent le popup deux fois, et le second doit se comporter comme le
     premier — pas hériter d'un armement resté de l'ouverture précédente. */
  const { popup, dehors } = surfaceNeuve();
  popup.show([document.createElement("p")]);
  await attendreUnTour();
  popup.show([document.createElement("p")]);      // second écart, même tour
  cliquerSur(document.createElement("div"));
  assert.equal(dehors(), 0, "le second affichage doit se réarmer, pas rester armé du premier");
  await attendreUnTour();
  cliquerSur(document.createElement("div"));
  assert.equal(dehors(), 1);
});

/* ══ D — LE CÂBLAGE DE LA COQUILLE, SUR LES OCTETS ═══════════════════════ */

const shellText = fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8");

test("D — l'état du popup vit dans `state`, jamais dans le DOM (SOCLE.md)", () => {
  assert.match(shellText, /\n  popup: null,/,
    "SOCLE.md l'annonçait : « l'état d'un popup doit survivre — il vivra dans `state` comme le reste »");
  assert.match(shellText, /frame\.popupLayer\.(show|hide)\(/,
    "et la coquille pilote la surface persistante, elle ne fabrique pas un popup par redessin");
});

test("D bis — B7.7c : le popup se réveille sur un écart NEUF, pas sur un refus qui persiste", () => {
  /* Sans la comparaison aux refus d'avant, le popup se rouvrirait à chaque
     clic tant que le pool reste dépassé — impossible à refermer. */
  assert.match(shellText, /const avant = state\.violations\.map/);
  assert.match(shellText, /if \(apres && apres !== avant\)/,
    "un refus qui PERSISTE n'est pas un écart neuf");
});
