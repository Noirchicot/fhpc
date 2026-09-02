/* ══ LE VERROU DE HAUTEUR DU SOUS-ÉCRAN — lot 123, 2026-09-02 ═════════════

   🔴 LE DÉFAUT D'ERIC, MOT POUR MOT : *« SB lineages : pour toutes les
   species sauf elf, la version mobile ne propose pas le scroll, ce qui casse
   toute la page. L'espace maximum dédié au texte descriptif doit être
   verrouillé, pour que tous les organes se trouvant en dessous ne soient pas
   poussés hors de la dalle. »*

   📏 MESURÉ AU NAVIGATEUR, à 375 × 812, dalle du sous-écran = 500 blg :

     | espèce     | forme | hauteur rendue | débord |
     |------------|-------|----------------|--------|
     | Elf        | prose |            500 |      0 |  ← témoin
     | Tiefling   | prose |            500 |      0 |  ← témoin
     | Hoddon     | table |            639 |   +139 |
     | Dragonborn | table |            742 |   +242 |
     | Goliath    | table |            775 |   +275 |

   ⭐ ET LA LIGNE DE PARTAGE N'EST PAS L'ESPÈCE, C'EST LA FORME DU TEXTE.
   Eric a écrit « toutes sauf Elf » ; Tiefling allait bien lui aussi. Ce que
   les deux ont en commun n'est pas leur nom, c'est d'être écrits en prose —
   et la prose était la seule forme que le verrou connaissait.

   ⚠️ CE QUE CE GARDE PEUT ET NE PEUT PAS : la suite tourne sur le DOM minimal
   de `tests/dom-stub.mjs`, qui n'a **aucune mise en page** — pas de
   `getBoundingClientRect`, donc aucune géométrie à lire. Un garde qui
   MESURERAIT le débord demanderait un navigateur, c'est-à-dire une dépendance
   que `CLAUDE.md` interdit (« zéro dépendance runtime », et la suite n'a
   qu'ajv). C'est donc le **second** garde de la commande qui est écrit ici :
   celui qui prouve que la règle vise bien LES DEUX FORMES.
   ⭐ Il tient en deux moitiés, et il faut les deux :
     ① la STRUCTURE — quelle que soit la forme, le corps du lignage est dans
       UNE fenêtre, et rien de ce corps ne pend directement à la section ;
     ② la RÈGLE — le verrou et le `:has()` nomment cette fenêtre, jamais une
       forme de texte.
   Sans ①, la feuille pourrait viser une fenêtre que personne ne pose ; sans
   ②, l'écran poserait une fenêtre que personne ne verrouille. Le défaut
   d'origine était exactement la seconde moitié.
   📌 La géométrie, elle, a été relevée au navigateur (table ci-dessus) et
   revérifiée après correction : les cinq espèces rendent 500 / débord 0. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { SPECIES_CATALOGUE } = await import("../ui/builder/species-step.mjs");

const SHELL = readFileSync(new URL("../ui/builder/shell.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "");

const query = exempleFhEn().layers.verbs.query;

/** Les deux témoins nommés par la commande : une espèce de chaque forme.
 *  ⛔ Ils ne sont pas choisis pour leur nom mais pour leur FORME — c'est ce
 *  que la troisième colonne dit, et c'est elle qui fait le partage. */
const TEMOINS = [
  { id: "srd:species:en:elf", nom: "Elf", forme: "prose", corps: "species-lignage-benefices" },
  { id: "srd:species:en:goliath", nom: "Goliath", forme: "table", corps: "species-lignage-table" }
];

function ecranDuLignage(id) {
  const record = query({ kind: "species", id }).record;
  const options = (record.data.lineages || []).map((o) => o.id);
  const decisions = [
    { path: "species", status: "answered", answered: 1, expected: 1, options: [id], selected: [id] },
    {
      path: "species.lineage", status: "pending", answered: 0, expected: 1,
      options, selected: []
    }
  ];
  return SPECIES_CATALOGUE.itemCorps({ path: "species.lineage" }, { decisions, query }, () => {});
}

/* ══ ① LA STRUCTURE — UNE FENÊTRE, QUELLE QUE SOIT LA FORME ══════════════ */

test("1 — chaque forme de lignage rend UNE fenêtre, et son corps est dedans", () => {
  for (const t of TEMOINS) {
    const bloc = ecranDuLignage(t.id);
    assert.ok(bloc, `${t.nom} : la section du lignage est rendue`);
    const fenetres = bloc.querySelectorAll(".species-lignage-fenetre");
    assert.equal(fenetres.length, 1,
      `${t.nom} (${t.forme}) : exactement UNE fenêtre — c'est elle qui portera la hauteur`);
    const corps = bloc.querySelector(`.${t.corps}`);
    assert.ok(corps, `${t.nom} : le corps en ${t.forme} est bien rendu (.${t.corps})`);
    assert.equal(corps.parentNode, fenetres[0],
      `${t.nom} : le corps est DANS la fenêtre — sinon rien ne borne sa hauteur`);
  }
});

test("2 — ⛔ rien du texte ne pend directement à la section (c'était le défaut)", () => {
  /* 🔴 LE DÉFAUT EXACT : `.parcours-item-dalle > section { flex: 0 0 auto }`
     laisse grandir sans fin tout enfant direct. La forme table posait son
     intro et sa table LÀ, donc la section grandissait, donc la dalle avec —
     +275 blg chez le Goliath. La fenêtre est le seul enfant qui a le droit
     de porter du texte. */
  const TEXTE = ["species-lignage-benefices", "species-lignage-table", "species-lignage-intro"];
  for (const t of TEMOINS) {
    const bloc = ecranDuLignage(t.id);
    const directs = bloc.children.map((n) => n.className || "");
    for (const classe of TEXTE) {
      assert.ok(!directs.some((c) => c.split(/\s+/).includes(classe)),
        `${t.nom} : « ${classe} » ne doit jamais être un enfant DIRECT de la section`);
    }
  }
});

test("3 — l'intro du Goliath est entrée dans la fenêtre avec sa table", () => {
  /* Eric, 28/08 : « un petit texte pour expliquer le tableau c'est bien ».
     Une intro laissée dehors aurait gardé la moitié du débord — et surtout
     elle aurait séparé deux morceaux d'une même lecture. */
  const bloc = ecranDuLignage("srd:species:en:goliath");
  const fenetre = bloc.querySelector(".species-lignage-fenetre");
  const intro = bloc.querySelector(".species-lignage-intro");
  assert.ok(intro, "le Goliath porte bien une intro (data[lineage_intro])");
  assert.equal(intro.parentNode, fenetre, "et elle défile avec la table, pas au-dessus d'elle");
});

/* ══ ② LA RÈGLE — ELLE NOMME LA FENÊTRE, JAMAIS UNE FORME DE TEXTE ═══════ */

test("4 — le verrou de hauteur est posé sur la FENÊTRE", () => {
  const regle = SHELL.match(/\.species-lignage-fenetre \{[^}]*\}/s);
  assert.ok(regle, "la règle .species-lignage-fenetre existe");
  assert.match(regle[0], /overflow-y:\s*auto/, "la zone de texte défile (NORMES §5 bis)");
  assert.match(regle[0], /flex:\s*1 1 auto/, "elle prend le rab de la dalle");
  assert.match(regle[0], /min-height:\s*0/,
    "⛔ sans lui, un enfant flex garde sa taille de contenu et le défilement ne mord pas");
});

test("5 — le `:has()` de la section reconnaît la fenêtre, plus une forme de texte", () => {
  /* 🔴 LA CAUSE, EN UNE LIGNE : il disait `:has(.species-lignage-benefices)`,
     donc il ne voyait un corps de lignage que lorsqu'il était un `<dl>`. */
  const has = SHELL.match(/\.parcours-item-dalle > section:has\(([^)]*)\)/g) || [];
  assert.ok(has.length > 0, "la section a bien une règle d'étirement conditionnelle");
  for (const regle of has) {
    assert.match(regle, /species-lignage-fenetre/,
      "⛔ un `:has()` calé sur UNE forme du contenu est la faute qu'on répare");
  }
});

test("6 — ⛔ la prose ne reprend pas le verrou pour elle seule", () => {
  /* Si `.species-lignage-benefices` reprenait `overflow-y` ou `flex: 1 1`,
     on aurait DEUX scrollers imbriqués sur la forme prose et un seul sur la
     forme table : la divergence reviendrait par la porte de derrière, et
     Elf redeviendrait un cas à part sans que personne l'écrive. */
  const regles = SHELL.match(/\.species-lignage-benefices[^{]*\{[^}]*\}/gs) || [];
  const corps = regles.join(" ");
  assert.ok(regles.length > 0, "la classe de prose garde bien ses règles de typographie");
  assert.doesNotMatch(corps, /overflow-y\s*:/, "⛔ la prose ne défile plus pour son compte");
  assert.doesNotMatch(corps, /flex\s*:\s*1 1/, "⛔ et elle ne réclame plus le rab");
});
