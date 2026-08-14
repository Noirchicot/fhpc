/* ══ L'AIMANTATION, ET SA CONDITION — LOT 73 ══════════════════════════════

   Eric, 2026-08-15, devant le site déployé : *« le snap défilement n'est pas
   fluide, ça s'arrête n'importe où »*.

   Il avait raison, et c'est un choix que J'AVAIS fait au lot 58 : `proximity`
   plutôt que `mandatory`, avec ce motif écrit dans le CSS — *« une fiche plus
   haute que le champ deviendrait partiellement inatteignable au repos »*.

   ⭐ LE MOTIF ÉTAIT BON. IL A CESSÉ D'ÊTRE VRAI. Mesuré sur le site déployé,
   Species ET Class : **douze fiches, toutes exactement la hauteur du champ
   (614 = 614), zéro plus haute, zéro dont le contenu déborde.** Depuis les
   lots 69/70, une fiche EST un champ. Le danger que `proximity` évitait
   n'existe plus ; son prix, lui, se voyait à chaque geste.

   ── CE QUE CE FICHIER GARDE, ET POURQUOI IL EXISTE ──────────────────────
   🔴 `mandatory` n'est PAS inconditionnellement bon : il l'est **parce que**
   une fiche fait un champ. Le jour où une fiche redeviendrait plus haute, son
   bas deviendrait inatteignable au repos — le danger du lot 58, revenu par la
   fenêtre, et invisible dans une suite verte.

   Ce lot ne se contente donc pas de changer un mot : il **écrit la condition
   et la garde**. C'est le patron du dépôt (« une brique, un écrivain, un
   garde »), appliqué à une décision qui, sinon, ne tiendrait que par la
   mémoire de celui qui l'a prise.

   ⚠️ SA LIMITE, NOMMÉE : ce garde lit le CSS, il ne mesure pas un navigateur.
   Il prouve que la fiche est VERROUILLÉE à la hauteur du champ (`height`, pas
   `min-height`) — donc qu'elle ne peut pas grandir. Il ne prouve pas que son
   CONTENU y tient : une fiche trop bavarde déborderait de sa boîte. Aucune ne
   le fait aujourd'hui (mesuré, `scrollHeight === clientHeight` sur les 24
   fiches de Species et Class) ; le jour où ça arrivera, c'est un autre défaut,
   et il se verra à l'œil. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS = stripComments(fs.readFileSync(path.join(ROOT, "ui/builder/shell.css"), "utf8"));

/** Le corps d'une règle CSS, par son sélecteur exact. Rendu plutôt
 *  qu'asserté, pour que la même lecture serve au garde et à son attaque. */
export function regle(css, selecteur) {
  const i = css.indexOf(`\n${selecteur} {`);
  if (i < 0) return null;
  return css.slice(i, css.indexOf("}", i));
}

test("A — la scène aimante en `mandatory` : il n'y a aucun endroit légitime où s'arrêter entre deux fiches", () => {
  const scene = regle(CSS, ".stage");
  assert.ok(scene, "sonde : la règle `.stage` existe");
  assert.match(scene, /scroll-snap-type:\s*y\s+mandatory/,
    "`proximity` lâche prise dès qu'on relâche loin d'un cran — c'est le « ça s'arrête n'importe où » d'Eric");
});

test("B — 🔴 LA CONDITION DE `mandatory` : une fiche est VERROUILLÉE à la hauteur du champ", () => {
  const carte = regle(CSS, ".catalogue-card");
  assert.ok(carte, "sonde : la règle `.catalogue-card` existe");
  assert.match(carte, /(^|[;{])\s*height:\s*100%/,
    "sans hauteur verrouillée, une fiche peut dépasser le champ — et `mandatory` rend son bas inatteignable");
  assert.doesNotMatch(carte, /min-height:/,
    "`min-height` autorise la fiche à GRANDIR avec son contenu : c'est exactement le cas que `mandatory` ne supporte pas");
  /* Le conteneur aussi : une fiche à 100 % d'un parent qui n'a pas de
     hauteur ne vaut rien. Les deux vont par paire, comme
     `scroll-snap-type` et `scroll-snap-align`. */
  assert.match(regle(CSS, ".catalogue-cards") || "", /height:\s*100%/);
});

test("C — l'aimant est posé sur la fiche, et le mécanisme sur le conteneur : les deux moitiés", () => {
  /* Le défaut du lot 58, rejoué comme témoin : `scroll-snap-align` était sur
     les douze fiches et `scroll-snap-type` nulle part — l'aimantation ne
     faisait RIEN, sous 935 tests verts. Une moitié seule ne se voit pas. */
  assert.match(regle(CSS, ".catalogue-card") || "", /scroll-snap-align:\s*start/);
  assert.match(regle(CSS, ".stage") || "", /scroll-snap-type:/);
});

test("⚔️ ATTAQUE A — revenir à `proximity` fait rougir le garde", () => {
  const casse = CSS.replace("scroll-snap-type: y mandatory", "scroll-snap-type: y proximity");
  assert.doesNotMatch(regle(casse, ".stage"), /mandatory/);
});

test("⚔️ ATTAQUE B — 🔴 `height` devenu `min-height` : la fiche peut grandir, et le garde MORD", () => {
  /* L'attaque qui compte : elle ne casse pas l'aimantation, elle casse sa
     CONDITION. Sans ce test, quelqu'un remplacerait `height` par
     `min-height` pour laisser respirer une fiche bavarde — geste raisonnable,
     et le bas de cette fiche deviendrait silencieusement inatteignable. */
  const casse = CSS.replace(/(\.catalogue-card \{[^}]*?)height: 100%/, "$1min-height: 100%");
  const carte = regle(casse, ".catalogue-card");
  assert.match(carte, /min-height:/, "sonde : l'attaque a bien modifié la règle");
  assert.doesNotMatch(carte, /(^|[;{])\s*height:\s*100%/,
    "et le garde B, qui exige `height`, rougirait sur cette source");
});
