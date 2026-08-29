/* ══ LOT 54 — L'ÉTAPE CONCEPT ═══════════════════════════════════════════
   Même loi que Compétences/Class/Species (lot 39/42) : « on teste la
   FONCTION, pas la page » (`tests/dom-stub.mjs`). `renderConceptStep` ne
   CONNAÎT aucun verbe (même discipline que `carnet.mjs`/`confirm.mjs`) —
   elle rend `{kind:"rename", name}`/`{kind:"describe", field, value}` à
   `onAction`, c'est `shell.mjs` qui choisit d'appeler `writers.rename`/
   `.describe`. Ce fichier prouve, dans l'ordre du §3 de la commande :

     1. les trois champs s'affichent et se relisent à la racine ;
     2. un nom vide est un refus NOMMÉ (à `shell.mjs`, via `writers`) —
        vérifié ici en rejouant EXACTEMENT ce que `shell.mjs` fait (appeler
        `writers.rename`, attraper le refus) ;
     3. l'alignement propose les neuf, et accepte une valeur hors de la
        liste ;
     4. le champ d'erreur s'affiche quand `ctx.fieldErrors` le porte. */

import test from "node:test";
import assert from "node:assert/strict";

import { createTestDocument } from "./dom-stub.mjs";
import { createDocWriters } from "../src/doc/writers.mjs";
import { charSchema } from "./doc-harness.mjs";

globalThis.document = createTestDocument();

const { renderConceptStep, ALIGNMENTS } = await import("../ui/builder/concept-step.mjs");

const FT_LB = { distance: "ft", weight: "lb" };
function draftDocument(extra = {}) {
  return {
    schema: "fh-char/1", id: "concept-step-test", name: "Sonde", lang: "en", units: FT_LB,
    created: "2026-08-13T00:00:00Z", modified: "2026-08-13T00:00:00Z",
    build: { layers: [], choices: [], budgets: {}, overrides: [] },
    ...extra
  };
}

/* `tests/dom-stub.mjs` ne sait pas résoudre un sélecteur `#id` (patron
   minimal : balise/classe/attribut, voir sa tête de fichier) — les trois
   champs sont donc retrouvés par ORDRE D'APPARITION (nom, genre, alignement,
   l'ordre posé par `renderConceptStep`), tous `.doc-field-input`. */
/* ⚠️ DEUX FAMILLES DE CHAMPS DEPUIS LE 2026-08-19, et c'est ce que ces
   sélecteurs disent : le NOM reste un champ libre (`input`), le GENRE et
   l'ALIGNEMENT sont devenus des MENUS (`select`) — Eric : *« Gender dropdown
   […] Alignment dropdown, bouton rules »*. Un champ libre invitait à écrire
   n'importe quoi dans un champ qui n'a que neuf réponses. */
/* ⚠️ TROISIÈME FORME DEPUIS LE 2026-08-19, et c'est la règle d'Eric qui la
   commande : *« le drop-down c'est moche, je préfère du drag and drop quand il
   y a plus de deux choix »*. Le NOM reste un champ libre ; le genre et
   l'alignement sont maintenant des viviers de jetons avec leur récepteur.
   ⛔ La valeur d'un champ ne se lit donc plus sur un `.value` : elle se lit
   dans le RÉCEPTEUR, là où le joueur la voit. */
function fields(node) { return node.querySelectorAll(".doc-field-input"); }
function nameInput(node) { return fields(node)[0]; }
function blocs(node) { return node.querySelectorAll(".choix-glisse"); }
function valeurDe(bloc) {
  const v = bloc.querySelector(".glisse-creneau-valeur");
  return v ? v.textContent : null;
}
function jetonDe(bloc, mot) {
  return [...bloc.querySelectorAll(".glisse-jeton")].find((j) => j.textContent === mot);
}

/* ══ 0 — LA LISTE DES NEUF, LUE À L'ÉCRAN, JAMAIS AU SCHÉMA ═══════════════ */

test("0 — les neuf alignements SRD, orthographe du dépôt (« Neutral », pas « True Neutral »)", () => {
  assert.deepEqual(ALIGNMENTS, [
    "Lawful Good", "Neutral Good", "Chaotic Good",
    "Lawful Neutral", "Neutral", "Chaotic Neutral",
    "Lawful Evil", "Neutral Evil", "Chaotic Evil"
  ]);
  assert.equal(new Set(ALIGNMENTS).size, 9);
});

/* ══ 1 — LES TROIS CHAMPS S'AFFICHENT À LA RACINE ═════════════════════════ */

test("1 — les trois champs affichent la valeur actuelle du document", () => {
  /* ⭐ ET LES DEUX VALEURS SONT HORS LISTE, DÉLIBÉRÉMENT : un personnage sauvé
     avant les menus peut porter « iel » ou « Chaotic Good (mostly) ». Les
     restreindre d'autorité les effacerait au premier rendu, EN SILENCE. Elles
     entrent dans le menu comme une option de plus. */
  const doc = draftDocument({ gender: "iel", alignment: "Chaotic Good (mostly)" });
  const node = renderConceptStep({ document: doc, fieldErrors: {} }, () => {});
  const [genre, alignement] = blocs(node);
  assert.equal(nameInput(node).value, "Sonde");
  assert.equal(valeurDe(genre), "iel");
  assert.equal(valeurDe(alignement), "Chaotic Good (mostly)");
  /* ⭐ ET LES DEUX SONT HORS LISTE : elles entrent dans le vivier comme un
     jeton de plus, sinon le passage au glisser les effacerait EN SILENCE. */
  assert.ok(jetonDe(genre, "iel"), "la valeur hors liste a son jeton");
  assert.ok(jetonDe(alignement, "Chaotic Good (mostly)"), "idem pour l'alignement");
});

test("1bis — genre et alignement absents du document DISENT ce qu'ils attendent", () => {
  const node = renderConceptStep({ document: draftDocument(), fieldErrors: {} }, () => {});
  const [genre, alignement] = blocs(node);
  /* 🔴 LE TIRET EST DEVENU UNE CONSIGNE — Eric, 2026-08-26 : *« drop it here, en
     T1, dans le collecteur ; ça disparaît quand c'est rempli »*.

     ⭐ ET C'EST LA SUITE DIRECTE DU RETRAIT DU POINTILLÉ, le même jour : tant
     qu'un contour tireté entourait la case, le tiret suffisait — la BOÎTE disait
     « dépose ici », le tiret disait « rien encore ». Le contour parti, il ne
     restait qu'un tiret pour porter les deux messages, et un tiret ne dit pas ce
     qu'on attend de vous.

     ⚠️ CE QUE CE TEST GARDE N'A PAS CHANGÉ : il interdit toujours qu'une valeur
     ABSENTE s'affiche « undefined ». C'est le mot de remplacement qui bouge, pas
     la vigilance — un champ vide doit dire quelque chose de VOULU. */
  /* ⏩ RACCOURCI LE 2026-08-29 : « drop it here » ne tenait pas dans la case
     de 47 px des six caractéristiques (il poussait le collecteur à 58 quand le
     jeton reste à 48). Eric, mis devant le choix entre masquer le mot et le
     raccourcir : *« ok alors "drop here" »* — la consigne survit partout. */
  assert.equal(valeurDe(genre), "drop here");
  assert.equal(valeurDe(alignement), "drop here");
  /* ⛔ Et jamais le mot du moteur. */
  for (const bloc of [genre, alignement]) {
    assert.doesNotMatch(valeurDe(bloc), /undefined|null|NaN/);
  }
});

/* ══ 2 — COMMIT SUR `change`, ET LE VERBE REND `rename`/`describe` ════════ */

test("2 — changer le nom dispatche {kind:\"rename\", name}, rien d'autre", () => {
  const actions = [];
  const node = renderConceptStep({ document: draftDocument(), fieldErrors: {} }, (action) => actions.push(action));
  const input = nameInput(node);
  input.value = "Ilyra Duskleaf";
  input.dispatchEvent({ type: "change" });
  assert.deepEqual(actions, [{ kind: "rename", name: "Ilyra Duskleaf" }]);
});

test("2bis — changer genre/alignement dispatche {kind:\"describe\", field, value}", () => {
  const actions = [];
  const node = renderConceptStep({ document: draftDocument(), fieldErrors: {} }, (action) => actions.push(action));
  const [genre, alignement] = blocs(node);
  /* Le tap à la souris POSE (le doigt, lui, ouvre l'info) — geste d'Eric. */
  /* ⚠️ `button: 0` EST REQUIS — l'organe filtre les boutons secondaires, et
     sans lui la séquence n'est même pas ouverte. Même forme que
     `tests/glisser.test.mjs`, qui est la référence de ce geste. */
  const taper = (jeton) => {
    jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
    jeton.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
  };
  taper(jetonDe(genre, "Woman"));
  taper(jetonDe(alignement, "Chaotic Good"));
  assert.deepEqual(actions, [
    { kind: "describe", field: "gender", value: "Woman" },
    { kind: "describe", field: "alignment", value: "Chaotic Good" }
  ]);
});

/* ══ 3 — ⚔️ LE VERBE RÉEL, REJOUÉ COMME shell.mjs LE FERAIT ═══════════════
   `renderConceptStep` ne valide rien elle-même (elle ne connaît aucun
   verbe) — c'est `writers.rename`/`.describe` qui refusent. On rejoue donc
   ICI le geste exact de `shell.mjs` (`try { writers.rename(...) } catch`)
   pour prouver que le refus est NOMMÉ et que le document reste intact. */

test("3 — ⚔️ un nom vide est un refus NOMMÉ ; les trois autres champs restent facultatifs", () => {
  const writers = createDocWriters({ schema: charSchema() });
  const doc = draftDocument();

  assert.throws(() => writers.rename({ document: doc, name: "" }), /vide|caractère/i);

  /* Témoins : les trois autres champs, eux, réussissent SANS valeur —
     `describe({document})` sans aucun champ ne jette pas (facultatifs). */
  const inchange = writers.describe({ document: doc });
  assert.deepEqual(inchange, doc);
});

test("3bis — ⚔️ l'alignement accepte une valeur HORS des neuf — la liste vit à l'écran, pas au schéma", () => {
  const writers = createDocWriters({ schema: charSchema() });
  const doc = draftDocument();
  const decrit = writers.describe({ document: doc, alignment: "Chaotic Good (mostly)" });
  assert.equal(decrit.alignment, "Chaotic Good (mostly)");
  assert.ok(!ALIGNMENTS.includes("Chaotic Good (mostly)"), "témoin : cette valeur n'est PAS dans la liste suggérée");
});

/* ══ 4 — LE REFUS S'AFFICHE, NOMMÉ, JAMAIS UN SILENCE ═════════════════════ */

test("4 — un fieldError posé par shell.mjs s'affiche sous le champ, et marque aria-invalid", () => {
  const node = renderConceptStep({
    document: draftDocument(),
    fieldErrors: { name: "fhpc/doc: rename : « » n'a pas 1 caractère au minimum." }
  }, () => {});
  const input = nameInput(node);
  assert.equal(input.getAttribute("aria-invalid"), "true");
  const error = node.querySelectorAll(".doc-field-error")[0];
  assert.ok(error, "le message de refus doit être rendu");
  assert.match(error.textContent, /rename/);
});

test("4bis — sans erreur, aria-invalid n'est pas posé et aucun .doc-field-error n'apparaît", () => {
  const node = renderConceptStep({ document: draftDocument(), fieldErrors: {} }, () => {});
  assert.equal(nameInput(node).getAttribute("aria-invalid"), null);
  assert.equal(node.querySelectorAll(".doc-field-error").length, 0);
});
