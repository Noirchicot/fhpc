/* ══ LE TAMBOUR — les gardes du module feuille (lot 218) ═══════════════════════
   🔴 CE FICHIER EXISTE À CAUSE D'UNE ÉPREUVE ROUGE QUI EST RESTÉE VERTE. En descendant le
   mécanisme de la roue hors de `sac-ecran.mjs`, j'ai voulu prouver que les 2368 gardes de la
   suite voyaient bien le module. Deux épreuves, deux verdicts opposés :
     · retirer l'appendage des crans  → 11 gardes du sac accusent ✅
     · retirer l'AIMANTATION DU TAP   → ⛔ AUCUN garde n'accuse, la suite reste verte

   ⭐ ET LE CORPUS LE DISAIT DÉJÀ, sans que personne en tire la conséquence : *« ET IL AVAIT
   DISPARU DANS LA CHIRURGIE DU 19/09 : le tap appelait un `viser()` que je venais de
   supprimer. ⛔ Aucun garde de l'écran ne l'a vu — c'est celui des ORPHELINS qui l'a attrapé »*.
   L'orphelin l'avait attrapé parce que le nom n'existait plus ; un écouteur simplement ABSENT
   est du code valide, et plus rien ne le voit. ⛔ Un geste dont le seul témoin est l'accident
   d'un autre garde n'a pas de garde. */

import test from "node:test";
import assert from "node:assert/strict";
import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();
const { monterLeTambour } = await import("../ui/builder/roue-tambour.mjs");

const PAS = 65;

function monter(nb, actif = 0, options = {}) {
  const roue = document.createElement("div");
  const ruban = document.createElement("div");
  roue.append(ruban);
  const crans = [];
  for (let i = 0; i < nb; i += 1) {
    const c = document.createElement("button");
    c.type = "button";
    c.textContent = `cran ${i}`;
    if (options.inerte === i) c.dataset.inerte = "oui";
    if (options.lieu && options.lieu[i]) c.dataset.lieu = options.lieu[i];
    crans.push(c);
  }
  const loupe = options.loupe ? document.createElement("div") : undefined;
  monterLeTambour({ roue, ruban, crans, actif, pas: PAS, loupe });
  return { roue, ruban, crans, loupe };
}

/* ⭐ TÉMOIN : le ruban porte les crans, dans l'ordre, et UNE seule fois.
   ⛔ « une seule fois » n'est pas une évidence : la roue actuelle de Wares peint la liste
   DOUZE fois pour boucler. Eric, 19/09 : *« que ça tourne à l'infini n'aide pas »*. */
test("1 · le ruban porte les crans une seule fois, dans l'ordre — ⛔ il ne boucle pas", () => {
  /* 🔄 ON COMPTE LES CRANS, ⛔ PLUS LES ENFANTS (lot 222). Le ruban porte aussi DEUX CALES, une
     à chaque bout, pour qu'un cran d'extrémité puisse arriver au centre du viseur — un
     `padding` ne le permettait pas (il n'entre pas dans le `scrollWidth` d'un flex en
     défilement). ⭐ Un enfant n'est pas un cran, et le garde doit compter la CHOSE. C'est la
     même leçon que le `<style>` qui n'est pas une dalle, trois lots plus tôt. */
  const { ruban, crans } = monter(6, 2);
  const poses = [...ruban.children].filter((n) => n.className !== "roue-cale");
  assert.equal(poses.length, 6, "⛔ six crans donnés, six crans posés — ni copies, ni trous");
  for (let i = 0; i < 6; i += 1) assert.equal(poses[i], crans[i], `le cran ${i} n'est pas à son rang`);
  /* ⛔ ET LES DEUX CALES SONT LÀ, AUX DEUX BOUTS : une seule ne servirait qu'un côté. */
  assert.equal(ruban.children[0].className, "roue-cale", "⛔ pas de vide avant le premier cran");
  assert.equal(ruban.children[ruban.children.length - 1].className, "roue-cale",
    "⛔ pas de vide après le dernier : il ne pourra jamais arriver au viseur");
  assert.equal(ruban.children[0].getAttribute("aria-hidden"), "true",
    "⛔ un vide qui se lit à voix haute est un vide qui ment");
});

/* ⭐ TÉMOIN : UN seul cran est dominant, et c'est celui qu'on a visé. */
test("2 · un seul cran est dominant, et c'est l'actif", () => {
  const { roue, crans } = monter(5, 3);
  assert.equal(roue.dataset.vise, "3", "la roue publie le rang visé");
  assert.equal(crans[3].dataset.dominant, "oui", "⛔ l'actif n'est pas marqué");
  assert.equal(crans.filter((c) => c.dataset.dominant === "oui").length, 1,
    "⛔ deux crans dominants : le surligné et le choisi ont divergé");
});

/* ⭐ TÉMOIN : marquer ÉTEINT un nœud et en ALLUME un — ⛔ il ne parcourt pas le ruban.
   📏 L'écriture d'avant posait l'attribut sur LES QUINZE tuiles à chaque image. */
test("3 · marquer déplace la dominante, et n'allume jamais deux crans", () => {
  const { roue, crans } = monter(5, 0);
  roue.marquer(4);
  assert.equal(crans[0].dataset.dominant, "non", "⛔ l'ancien dominant est resté allumé");
  assert.equal(crans[4].dataset.dominant, "oui", "⛔ le neuf n'est pas allumé");
  assert.equal(crans.filter((c) => c.dataset.dominant === "oui").length, 1, "⛔ deux dominants à la fois");
});

/* ⭐ TÉMOIN : placer pose le ruban à `pas × k`, et `k` peut être FRACTIONNAIRE.
   📐 C'est ça, *« je vois les deux défiler en même temps »* — à mi-chemin entre deux dalles,
   le ruban est à mi-chemin entre deux tuiles. ⛔ Un placement cranté ne rendrait pas ça. */
test("4 · placer accepte une position fractionnaire, et arrondit le MARQUAGE seul", () => {
  const { roue, crans } = monter(8, 0);
  roue.placer(3);
  assert.equal(roue.scrollLeft, PAS * 3, "⛔ le ruban n'est pas à sa place");
  roue.placer(6.4);
  assert.equal(roue.scrollLeft, PAS * 6.4, "⛔ la position a été crantée — le mouvement cesse d'être continu");
  assert.equal(crans[6].dataset.dominant, "oui", "à 6,4 c'est encore le 6ᵉ qui est sous le viseur");
  roue.placer(6.6);
  assert.equal(crans[7].dataset.dominant, "oui", "à 6,6 c'est le 7ᵉ");
});

/* ══ 🔴 LE GARDE QUI MANQUAIT ══════════════════════════════════════════════════
   ⭐ TÉMOIN : taper un cran AIMANTE la roue sur lui. ⛔ C'est le geste que deux chirurgies
   ont cassé sans que rien ne le dise. Il est éprouvé ROUGE : retirer l'écouteur du module
   fait tomber ce test, et lui seul dans toute la suite. */
test("5 · taper un cran aimante la roue sur lui — le geste que rien ne gardait", () => {
  const { roue, crans } = monter(6, 0);
  assert.equal(roue.scrollLeft || 0, 0, "au départ le ruban est à zéro");
  crans[4].dispatchEvent(new (globalThis.Event || Object)("click"));
  assert.equal(roue.scrollLeft, PAS * 4,
    "⛔ taper le 5ᵉ cran n'a pas aimanté la roue — c'est exactement la panne du 19/09");
});

/* ⭐ TÉMOIN : un cran marqué INERTE ne s'aimante pas. ⛔ Le tambour ne sait pas distinguer un
   champ de saisie d'un bouton : taper dans un champ pose le curseur, ça ne vise rien. */
test("6 · un cran inerte ne s'aimante pas — taper dans un champ n'est pas viser", () => {
  const { roue, crans } = monter(6, 0, { inerte: 2 });
  crans[2].dispatchEvent(new (globalThis.Event || Object)("click"));
  assert.equal(roue.scrollLeft || 0, 0, "⛔ un cran inerte a quand même aimanté la roue");
  crans[3].dispatchEvent(new (globalThis.Event || Object)("click"));
  assert.equal(roue.scrollLeft, PAS * 3, "⛔ et son voisin, lui, doit toujours aimanter");
});

/* ⭐ TÉMOIN : le halo prend le GENRE du cran qu'il cadre, et le REND quand le cran n'en a pas.
   ⛔ « il le prend » ne dit pas « il le rend » : un halo qui garde un genre périmé teint le
   cran suivant d'une couleur qui n'est pas la sienne. Les deux sens, ou rien. */
test("7 · le halo prend le genre du cran, et le rend quand le suivant n'en a pas", () => {
  const { roue, loupe } = monter(4, 1, { loupe: true, lieu: { 1: "party", 2: "dehors" } });
  assert.equal(loupe.dataset.lieu, "party", "⛔ le halo n'a pas pris le genre de l'actif");
  roue.marquer(2);
  assert.equal(loupe.dataset.lieu, "dehors", "⛔ il n'a pas suivi");
  roue.marquer(3);
  assert.ok(!loupe.dataset.lieu, "⛔ il a gardé un genre périmé sur un cran qui n'en a pas");
});

/* ⭐ TÉMOIN : la traduction rang ↔ cran sort avec la roue, dans les DEUX sens.
   ⛔ Elle est l'identité aujourd'hui, et c'est précisément pourquoi elle est nommée : un cran
   de service (un `+`, un `blank`) la décalerait, et deux formules pour une traduction
   divergeraient au premier mode. */
test("8 · la traduction sort avec la roue, et elle est réversible", () => {
  const { roue } = monter(5, 0);
  for (let i = 0; i < 5; i += 1) assert.equal(roue.section(roue.rang(i)), i, `⛔ le rang ${i} ne revient pas`);
});

/* ⭐ TÉMOIN : une roue VIDE ne casse pas. ⛔ Une sous-catégorie peut être vide, et un écran
   qui lève une exception sur zéro cran est un écran mort — pas un écran vide. */
test("9 · zéro cran ne lève rien", () => {
  const { roue } = monter(0, 0);
  assert.equal(roue.dataset.vise, "0", "une roue vide vise zéro");
  roue.placer(0);
  roue.marquer(0);
});
