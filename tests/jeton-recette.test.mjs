/* ══ LA DIAGONALE DE LA RECETTE — ce qui EST un blueprint, et ce qui ne l'est pas ══

   ⚖️ ERIC, 2026-09-23 : *« certains éléments de wares sont des recettes »*, puis
   *« il faut mettre en évidence les tokens recettes (blueprints) […] une diagonale
   de bas en haut, moitié inférieure droite, bleue »*, puis, le soir :
   *« les kits d'aventuriers sont des blueprints aussi. Activation simple mais
   activation nécessaire »*.

   🔴 CETTE SUITE NAÎT D'UNE DETTE, ET JE L'ÉCRIS EN TÊTE PARCE QUE C'EST LE VRAI
   SUJET : la diagonale a été dessinée le 23/09, commitée, déployée — ET AUCUN
   GARDE NE LA TENAIT. Trois organes (le prédicat, le nœud du jeton, la règle de
   feuille) et pas une assertion. ⛔ Un organe sans garde n'est pas « en attente
   de test » : il est en attente de RÉGRESSION SILENCIEUSE, et il l'aurait eue au
   premier record ajouté.

   ── CE QUE LES QUATRE FAMILLES DE GARDES TIENNENT ──────────────────────────
     ① le PRÉDICAT — ses trois signaux, chacun éprouvé SEUL, et ses refus ;
     ② la DONNÉE RÉELLE — les sept kits d'Eric, comptés sur la pile montée,
        jamais énumérés par leur nom ici ;
     ③ le JETON — le fond est un nœud, il passe AVANT le nom, il est muet, et
        le lecteur d'écran, lui, entend « recipe » ;
     ④ la FEUILLE — la diagonale est vraiment peinte, et sa couleur est un jeton.
*/
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8");
const TOKENS = fs.readFileSync(path.join(ROOT, "ui", "builder", "tokens.css"), "utf8");

const { estRecette, ETAGERE_DES_KITS } = await import("../ui/builder/equipement-pipeline.mjs");
const { corpsDuJeton, motDuJeton } = await import("../ui/builder/jeton-objet.mjs");

const fixture = exempleFhEn();
const query = fixture.layers.verbs.query;

/* ══ ① LE PRÉDICAT — TROIS SIGNAUX, ET CHACUN DOIT SUFFIRE SEUL ═══════════ */

test("1 — les trois signaux d'Eric, chacun ÉPROUVÉ SEUL sur un record qui ne porte que lui", () => {
  /* ⛔ « Seul » n'est pas une précaution de style : un record de test qui porte
     deux signaux passe même si l'un des deux est mort dans le code. */
  assert.equal(estRecette({ data: { category: "weapon" } }), true, "① une arme magique part de sa base mondaine");
  assert.equal(estRecette({ data: { category: "armor" } }), true, "① une armure aussi");
  assert.equal(estRecette({ data: { rarity: "Rarity Varies" } }), true, "② le marqueur de famille du SRD");
  assert.equal(estRecette({ data: {} }, ETAGERE_DES_KITS), true,
    "③ ⭐ ET LE KIT NE PORTE RIEN DANS SON RECORD : c'est son étagère, et elle seule, qui le dit");
});

test("2 — ⚔️ ATTAQUE : ce qui N'EST PAS une recette, et ces quatre cas sont réels", () => {
  /* 🔴 LE PIÈGE MESURÉ LE 23/09, ET IL A COÛTÉ UN COMPTE FAUX : un filtre sur la
     PROSE attrapait `Staff of Fire` et `Wand of Fear`, qui portent des tables de
     SORTS, pas de variantes. J'avais annoncé 28 familles ; il y en a 13. */
  assert.equal(estRecette({ data: { rarity: "Very Rare (Requires Attunement)" } }), false,
    "⛔ `(Requires Attunement)` suit UNE rareté — une parenthèse n'est pas une énumération");
  assert.equal(estRecette({ data: { rarity: "Rare" } }), false, "une rareté simple n'énumère rien");
  assert.equal(estRecette({ data: { cost: "2 GP", weight: "5 lb." } }), false,
    "⛔ un sac à dos ORDINAIRE n'est pas un kit : même genre, même étagère d'allée, autre étagère");
  assert.equal(estRecette({ data: {} }, "adventuring:camp"), false,
    "⛔ et une AUTRE étagère du même rayon ne déclenche rien — c'est `packs`, pas `adventuring`");
  /* ⚔️ le garde sait accuser : sans record du tout, il ne jette pas et ne dit pas oui. */
  assert.equal(estRecette(null), false, "un record absent n'est pas une recette (et ne fait pas tomber l'écran)");
  assert.equal(estRecette(undefined, undefined), false);
});

test("3 — 🔴 L'ÉTAGÈRE EST NOMMÉE À SA SOURCE, et c'est une IDENTITÉ, pas un libellé", () => {
  /* ⭐ LA LEÇON D'ARCHI 35, 23/09 : une liste écrite deux fois rougit un jour sur
     un fait parfaitement vrai. `ETAGERE_DES_KITS` est donc exporté et lu ici —
     ⛔ la chaîne « adventuring:packs » n'est PAS retapée dans ce fichier ailleurs
     que dans cette assertion-ci, qui est précisément celle qui la définit. */
  assert.equal(ETAGERE_DES_KITS, "adventuring:packs");
  assert.match(ETAGERE_DES_KITS, /^[a-z-]+:[a-z-]+$/,
    "⛔ `aisle:shelf` — l'identité d'une étagère, jamais son libellé (loi du tambour, test 3)");
});

/* ══ ② LA DONNÉE RÉELLE — SUR LA PILE MONTÉE, PAS SUR UN RECORD FABRIQUÉ ══ */

test("4 — ⭐ LES KITS D'ERIC SONT EXACTEMENT CEUX DE SON ÉTAGÈRE, comptés sur la pile", () => {
  /* ⛔ AUCUN NOM DE KIT N'EST ÉCRIT ICI. On BALAIE le rangement et on retient ce
     que l'étagère déclare — le jour où un huitième kit y entre, ce garde le
     compte sans qu'on le retouche, et c'est tout l'intérêt de lire une étagère
     plutôt qu'une liste. */
  const [rayon, etagere] = ETAGERE_DES_KITS.split(":");
  const kits = query({ kind: "shelving" }).filter((v) => {
    const sh = ((v.record && v.record.data) || {}).shelf || {};
    return sh.aisle === rayon && sh.shelf === etagere;
  });
  assert.equal(kits.length, 7, "les sept packs du SRD — Burglar, Diplomat, Dungeoneer, Entertainer, Explorer, Priest, Scholar");

  /* 🔴 ET VOICI CE QUI JUSTIFIE TOUT LE DÉTOUR PAR L'ÉTAGÈRE, MESURÉ : pas un
     seul de ces sept records ne porte quoi que ce soit qui le distingue d'un
     sac à dos. Ni contenu, ni catégorie, ni marqueur. ⛔ Si ce garde tombe un
     jour parce qu'un champ est apparu, la question à se poser est « le signal
     doit-il déménager dans le record ? » — pas « comment le faire taire ? ». */
  for (const k of kits) {
    const base = k.record.data.extends;
    const objet = query({ kind: k.record.data.of_kind, id: base });
    assert.ok(objet, `le kit ${base} pointe un record réel`);
    assert.deepEqual(Object.keys(objet.record.data).sort(), ["cost", "name", "weight"],
      `⛔ ${objet.record.name} ne porte QUE cost/name/weight — rien dans le record ne dit « kit »`);
    assert.equal(estRecette(objet.record, ETAGERE_DES_KITS), true,
      `⭐ et il est pourtant une recette : ${objet.record.name}`);
    assert.equal(estRecette(objet.record), false,
      "🔴 …ET SEULEMENT PAR SON ÉTAGÈRE — sans elle, le prédicat ne peut rien voir. "
      + "C'est la mesure qui prouve que le détour n'est pas un ornement.");
  }
});

/* ══ ③ LE JETON — L'ORDRE DU DOM EST LA LOI, PAS UN `z-index` ═════════════ */

test("5 — 🔴 LE FOND PASSE AVANT LE NOM, et c'est ce qui évite un `z-index` à accorder", () => {
  const document = createTestDocument();
  globalThis.document = document;
  try {
    const noeuds = corpsDuJeton({ nom: "Explorer's Pack", qte: 1, recette: true });
    assert.equal(noeuds[0].className, "jeton-recette",
      "⛔ PREMIER, toujours : un fond posé après le nom le recouvrirait. L'ordre du DOM suffit, "
      + "et il n'a pas à s'accorder avec les `z-index` des quatre marques.");
    assert.equal(noeuds[0].getAttribute("aria-hidden"), "true",
      "⛔ MUET : une couleur que rien ne prononce est une information réservée aux voyants");

    const sans = corpsDuJeton({ nom: "Backpack", qte: 1, recette: false });
    assert.equal(sans.some((n) => n.className === "jeton-recette"), false,
      "⚔️ et le garde sait accuser : sans le drapeau, aucun fond");
    /* ⛔ `recette: true` STRICTEMENT — une valeur molle (1, "oui") ne peint pas. */
    const mou = corpsDuJeton({ nom: "x", qte: 1, recette: 1 });
    assert.equal(mou.some((n) => n.className === "jeton-recette"), false,
      "⛔ le drapeau est un booléen VRAI, pas une valeur qui ressemble à vrai");
  } finally { delete globalThis.document; }
});

test("6 — ⭐ CE QUE LE LECTEUR D'ÉCRAN ENTEND : « recipe », et il l'entend EN PREMIER", () => {
  assert.equal(motDuJeton({ nom: "Explorer's Pack", qte: 1, recette: true }), "Explorer's Pack, recipe");
  assert.equal(motDuJeton({ nom: "Arrows", qte: 10, recette: true, equipped: true }),
    "Arrows ×10, recipe, equipped",
    "⭐ l'ordre est celui du croquis : la quantité tient au nom, puis la nature, puis les états");
  assert.equal(motDuJeton({ nom: "Backpack", qte: 1 }), "Backpack",
    "⚔️ et un objet ordinaire ne dit rien de plus");
});

/* ══ ④ LA FEUILLE — LA DIAGONALE EST VRAIMENT PEINTE ═════════════════════ */

test("7 — ⚔️ LA DIAGONALE EXISTE DANS LA FEUILLE, et elle va bien en BAS À DROITE", () => {
  /* 🔴 SANS CE GARDE, TOUT CE QUI PRÉCÈDE PASSERAIT SUR UN NŒUD INVISIBLE — un
     `<span>` sans règle est un nœud parfaitement valide, parfaitement vide, et
     les six tests d'au-dessus resteraient verts. C'est le défaut exact que la
     grille du tambour a payé le 23/08 (« quinze cases VIDES »). */
  const regle = /\.jeton-recette\s*\{([^}]*)\}/.exec(CSS);
  assert.ok(regle, "`.jeton-recette` porte une règle");
  const corps = regle[1];
  assert.match(corps, /linear-gradient\(\s*to bottom right\s*,\s*transparent 50%\s*,\s*var\(--jeton-recette\) 50%\s*\)/,
    "⭐ MOITIÉ INFÉRIEURE DROITE, de bas en haut — le croquis d'Eric, et la coupure est NETTE (50 % / 50 %)");
  assert.match(corps, /position:\s*absolute/);
  assert.match(corps, /inset:\s*0/, "il couvre la tuile entière, c'est le dégradé qui découpe");
  assert.match(corps, /pointer-events:\s*none/,
    "⛔ un fond ne prend pas le clic : la tuile dessous reste le bouton");
  assert.match(corps, /border-radius:\s*inherit/,
    "⛔ sinon la diagonale déborde des coins arrondis de la tuile");
});

test("8 — 🎨 LA COULEUR EST UN JETON, aux DEUX thèmes — jamais un hex dans la feuille", () => {
  assert.equal(/--jeton-recette/.test(CSS), true, "la feuille lit le jeton");
  const valeurs = [...TOKENS.matchAll(/--jeton-recette:\s*([^;]+);/g)].map((m) => m[1].trim());
  assert.equal(valeurs.length, 2,
    "⛔ DEUX déclarations : le jour et la nuit. Une seule voudrait dire qu'un thème hérite de l'autre "
    + "une couleur qui n'a pas été mesurée sur son fond.");
  for (const v of valeurs) assert.match(v, /^#[0-9a-f]{6}$/i, `« ${v} » — une couleur, chez les jetons`);
  assert.notEqual(valeurs[0], valeurs[1], "⚔️ et les deux thèmes ne portent pas la MÊME valeur");
});
