/* ══ L'EXCEPTION NOMMÉE DU DRAGONBORN — lot 126, 2026-09-02 ═══════════════

   ⚖️ LA DÉCISION D'ERIC, mot pour mot : *« Dragonborn, SB lignages :
   exception, on change le donné. Le texte de l'aiguilleur dit "il y a 10
   lignées, cliquer sur les tokens de choix pour regarder les options". Tu
   fais court, tu fais plus joli que ça. C'est là que vivra la version
   synthétique pour chaque choix. »*

   📏 CE QUI LA MOTIVE, MESURÉ AU NAVIGATEUR (375 × 812, dalle de 500 blg) :
   les DIX jetons occupent QUATRE rangées, et il ne reste que **74 blg** de
   fenêtre pour le texte, alors que l'intro + la table des dix en demandent
   **316**. L'intro seule s'y voit ; la table entière vit sous le pli. C'est
   la question de NORMES §1 quater — *« qu'est-ce que cet écran porte EN
   TROP ? »* — et la réponse d'Eric est : la table des dix.

   ⛔ CE GARDE TIENT L'EXCEPTION PAR SON NOM, ET IL TIENT AUSSI SA FRONTIÈRE.
   Ce n'est pas « les espèces à beaucoup de lignées » : le Goliath (6) et le
   Hoddon (3) GARDENT leur table, et les deux tests qui le vérifient valent
   autant que ceux qui vérifient le Dragonborn. Une exception qu'on ne borne
   pas est une règle générale qui s'ignore.

   ⭐ ET LE GESTE N'EST PAS INVENTÉ : NORMES §7 ter le ratifie déjà — *« tap au
   doigt · clic droit à la souris → la même fenêtre FF »*. L'écran nommé ne
   crée pas un geste, il en fait la voie normale de lecture. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const { SPECIES_CATALOGUE } = await import("../ui/builder/species-step.mjs");
/* ⚠️ LE CODE, PAS LES NOTES : le fichier PARLE de `:nth-child` pour dire qu'il
   n'en veut pas. Un garde qui lirait les commentaires rougirait sur la phrase
   qui l'annonce — il ne verrait plus la différence entre nommer une faute et
   la commettre. */
const STEP = stripComments(
  readFileSync(new URL("../ui/builder/species-step.mjs", import.meta.url), "utf8"));

const QUERY = exempleFhEn().layers.verbs.query;

const DRAGONBORN = "srd:species:en:dragonborn";
/** Les deux témoins de la FRONTIÈRE : même forme de contenu, table gardée. */
const GARDENT_LEUR_TABLE = ["srd:species:en:goliath", "srd:species:en:gnome"];

function optionsDe(id) {
  return QUERY({ kind: "species", id }).record.data.lineages;
}

function ctxDe(id) {
  return {
    decisions: [
      { path: "species", status: "answered", answered: 1, expected: 1, options: [id], selected: [id] },
      {
        path: "species.lineage", status: "pending", answered: 0, expected: 1,
        options: optionsDe(id).map((o) => o.id), selected: []
      }
    ],
    query: QUERY
  };
}

function sousEcran(id, act) {
  return SPECIES_CATALOGUE.itemCorps({ path: "species.lineage" }, ctxDe(id), act || (() => {}));
}

/** Le tap tel que `glisser.mjs` l'entend — le geste ratifié, pas un raccourci. */
function tap(jeton) {
  document.elementFromPoint = () => null;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "touch" });
  jeton.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
}

/* ══ 1. L'ÉCRAN NOMMÉ NE PORTE PLUS LA TABLE ═════════════════════════════ */

test("1 — le sous-écran du Dragonborn n'a plus de table des dix, et pas de repli en prose", () => {
  const bloc = sousEcran(DRAGONBORN);
  assert.ok(bloc, "le sous-écran est rendu");
  assert.equal(bloc.querySelectorAll(".species-lignage-table").length, 0,
    "⛔ la table des dix a dégagé — c'est ce qu'Eric a tranché");
  assert.equal(bloc.querySelectorAll(".species-lignage-benefices").length, 0,
    "⛔ ni repli en prose : le `<dl>` rendrait les mêmes dix entrées et le même débord");
});

test("2 — mais la RÈGLE COMMUNE reste, dans la fenêtre : c'est la table qui était en trop", () => {
  /* La règle du souffle (le cône, la ligne, 1d10, la Résistance) ne varie pas
     d'une lignée à l'autre : elle se lit une fois, en phrase. Ce qui variait
     — l'élément — est ce qui part au tap. */
  const bloc = sousEcran(DRAGONBORN);
  const fenetre = bloc.querySelector(".species-lignage-fenetre");
  assert.ok(fenetre, "la fenêtre du SB existe toujours (NORMES §4 quinquies)");
  const intro = bloc.querySelector(".species-lignage-intro");
  assert.ok(intro, "l'intro y est");
  assert.equal(intro.parentNode, fenetre, "et elle est DANS la fenêtre, comme partout ailleurs");
  for (const mot of ["Breath Weapon", "Cone", "Resistance"]) {
    assert.ok(intro.textContent.includes(mot), `la règle commune nomme « ${mot} »`);
  }
  assert.doesNotMatch(intro.textContent, /table/i,
    "⛔ et elle ne renvoie plus à un tableau qui n'est plus là — Eric : « on change le donné »");
});

/* ══ 2. LA FRONTIÈRE — l'exception ne fuit pas ═══════════════════════════ */

test("3 — Goliath et Hoddon GARDENT leur table : l'exception est un nom, pas un seuil", () => {
  for (const id of GARDENT_LEUR_TABLE) {
    const bloc = sousEcran(id);
    assert.equal(bloc.querySelectorAll(".species-lignage-table").length, 1,
      `${id} : sa table tient — sinon l'exception serait devenue une règle générale`);
  }
});

test("4 — et l'exception se lit comme un NOM DE RECORD, jamais comme un dessin ou un compte", () => {
  /* ⛔ NORMES §0 : *« une exception se nomme (jamais un `:nth-child` qui
     devine) et se pose à côté de son argument »*. Le contrôle porte sur la
     forme de la déclaration, la seule chose qui empêche la prochaine espèce
     d'y tomber par accident. */
  const liste = STEP.match(/const LIGNAGES_SANS_TABLE = \[([^\]]*)\]/s);
  assert.ok(liste, "l'exception vit dans une liste nommée");
  const noms = liste[1].match(/"([^"]+)"/g) || [];
  assert.deepEqual(noms, ['"srd:species:en:dragonborn"'],
    "un id de record, et un seul — le jour où un second entre, il s'écrit ici avec son argument");
  assert.doesNotMatch(STEP, /nth-child/, "⛔ aucune règle qui devine par la position");
  assert.doesNotMatch(STEP, /lineages\.length\s*[><]/,
    "⛔ et aucun seuil chiffré : « les espèces à beaucoup de lignées » n'est pas une règle");
});

/* ══ 3. LE TAP OUVRE LA VOIX UNIQUE ═════════════════════════════════════ */

test("5 — le tap sur un jeton ouvre la version synthétique de CETTE lignée", () => {
  const actions = [];
  const bloc = sousEcran(DRAGONBORN, (a) => actions.push(a));
  const jetons = bloc.querySelectorAll(".glisse-jeton");
  assert.equal(jetons.length, optionsDe(DRAGONBORN).length,
    "les dix jetons sont là — c'est eux qu'on tape, ils n'ont pas bougé");
  tap(jetons[9]);
  assert.equal(actions.length, 1, "un tap, une fenêtre");
  assert.equal(actions[0].kind, "popup", "et c'est la fenêtre FF de NORMES §7 ter");
  assert.equal(actions[0].titre, "White", "titrée du nom de la lignée tapée");
  assert.ok(actions[0].texte.length > 0, "elle DIT ce que cette lignée donne");
  assert.doesNotMatch(actions[0].texte, /\[\[/,
    "⛔ aucune marque de lien à l'écran : le popup est du texte nu");
});

test("6 — ce que le popup montre est la MÊME matière que le bilan du B — pas une seconde source", () => {
  /* ⭐ NORMES §4 quinquies : « UNE source, trois consommateurs ». Le contrôle
     ne cite aucune fonction : il compare ce que DEUX consommateurs rendent
     pour la même lignée, ce qui reste vrai quelle que soit la plomberie. */
  for (const option of optionsDe(DRAGONBORN)) {
    const actions = [];
    const bloc = sousEcran(DRAGONBORN, (a) => actions.push(a));
    const jetons = bloc.querySelectorAll(".glisse-jeton");
    const index = optionsDe(DRAGONBORN).findIndex((o) => o.id === option.id);
    tap(jetons[index]);
    const popup = actions[0].texte;

    const decisions = [
      { path: "species", status: "answered", answered: 1, expected: 1, options: [DRAGONBORN], selected: [DRAGONBORN] },
      {
        path: "species.lineage", status: "answered", answered: 1, expected: 1,
        options: optionsDe(DRAGONBORN).map((o) => o.id), selected: [option.id]
      }
    ];
    const bilan = SPECIES_CATALOGUE.resumeItem({ path: "species.lineage", confirme: true },
      { decisions, query: QUERY }, () => {});
    /* ⚠️ LE TÉMOIN S'EST RESSERRÉ AU LOT 128 : le bilan porte aussi les traits
       que la lignée accorde (`.trait-de-lignee`), que le popup n'a jamais
       montrés. Comparer les deux blocs entiers ferait rougir une divergence
       qui n'en est pas une — et masquerait celle qu'on cherche. On compare ce
       que chacun dit DE LA LIGNÉE. */
    const portes = new Set(bilan.querySelectorAll(".trait-de-lignee"));
    const propres = [...bilan.querySelectorAll("p")].filter((p) => !portes.has(p));
    const luAuBilan = propres.map((p) => String(p.textContent))
      .join("").replace(/^At level 1 : /, "").trim();
    assert.equal(popup.replace(/^At level 1 : /, "").trim(), luAuBilan,
      `${option.id} : le tap et le bilan disent la même chose — deux voix divergeraient au premier réglage`);
  }
});

/* ══ 4. LA BANDE D'AIGUILLEUR ═══════════════════════════════════════════ */

test("7 — la bande dit ce que la table disait : combien il y en a, et que le tap les ouvre", () => {
  const mot = SPECIES_CATALOGUE.itemAiguilleur("species.lineage", ctxDe(DRAGONBORN));
  assert.match(mot, /^Ten lineages/, "le compte d'abord — c'est ce qu'Eric a demandé de dire");
  assert.match(mot, /tap to read/, "puis le geste de lecture");
  assert.match(mot, /drag one into the slot to choose/, "puis le geste de choix, dans la langue des autres bandes");
  assert.ok(mot.endsWith("Leaving this open marks nothing — only Done records the choice."),
    "et le socle de prévention du gabarit reste, mot pour mot (NORMES §4 quinquies)");
});

test("8 — ⚔️ « Ten » ne se croit pas sur parole : le compte est celui de la couche", () => {
  /* ⛔ Un chiffre écrit à la main dans une phrase ment le jour où la donnée
     bouge, et il ment SILENCIEUSEMENT. Le garde le rattache à sa source. */
  const MOTS = { 3: "Three", 6: "Six", 10: "Ten" };
  const mot = SPECIES_CATALOGUE.itemAiguilleur("species.lineage", ctxDe(DRAGONBORN));
  const attendu = MOTS[optionsDe(DRAGONBORN).length];
  assert.ok(attendu, "le compte des lignées du Dragonborn doit rester un nombre qui s'écrit");
  assert.ok(mot.startsWith(`${attendu} lineages`),
    `la couche en déclare ${optionsDe(DRAGONBORN).length} — la bande doit dire « ${attendu} »`);
});

test("9 — les autres espèces à lignage gardent la bande commune", () => {
  for (const id of [...GARDENT_LEUR_TABLE, "srd:species:en:elf", "srd:species:en:tiefling"]) {
    const mot = SPECIES_CATALOGUE.itemAiguilleur("species.lineage", ctxDe(id));
    assert.match(mot, /^Tap a lineage to read what it grants/,
      `${id} : sa bande n'a pas changé — l'exception est bornée à un écran`);
  }
});
