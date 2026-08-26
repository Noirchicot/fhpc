import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripComments } from "./source-scan.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

const SHELL = stripComments(readFileSync(new URL("../ui/builder/shell.mjs", import.meta.url), "utf8"));
const CONCEPT = stripComments(readFileSync(new URL("../ui/builder/concept-step.mjs", import.meta.url), "utf8"));

test("la section Alignment existe VRAIMENT dans le SRD, et se trouve par son slug", () => {
  /* 🔴 Eric, 2026-08-26 : *« connecte le livre à la section alignement dans le
     SRD »*. Ce test est le TÉMOIN de la source : si l'entrée disparaît d'une
     couche, le livre n'ouvrirait plus rien — et il le ferait poliment, donc
     sans que personne ne s'en aperçoive.

     ⚠️ ON LA CHERCHE PAR SLUG, PAS PAR ID. `srd:glossary:EN:alignment` porte la
     LANGUE dans son identifiant, et la couche `srd-5.2.1-fr` existe déjà à
     côté. Figer l'id, c'est câbler l'anglais dans un écran qui n'a aucune
     raison de le connaître. */
  const query = exempleFhEn().layers.verbs.query;
  const liste = query({ kind: "glossary" });
  const vue = liste.find((v) => v && v.record && v.record.slug === "alignment");
  assert.ok(vue, "aucune entrée de glossaire au slug « alignment »");
  assert.equal(vue.record.name, "Alignment");
  assert.ok(vue.record.data.description.length > 100,
    "la section doit porter un vrai texte, pas un libellé");
  /* ⭐ ET ELLE PORTE SA PROVENANCE — c'est ce qui la distingue d'une phrase
     écrite dans l'interface : une source, une version, une licence. */
  assert.match(vue.record.attribution.license, /CC-BY/);
  assert.ok(vue.record.source && vue.record.source.locator, "elle dit sa page");
});

test("⛔ le livre n'écrit AUCUN texte de règle dans l'interface", () => {
  /* ⛔ CE QU'IL OUVRAIT AVANT : deux phrases que j'avais écrites. Elles
     n'étaient pas fausses, et c'est le problème — **un texte de règle écrit
     dans l'interface est une règle publiée par l'interface**, sans source,
     sans version, sans empreinte (§0.8 du dépôt).
     ⭐ Ce garde ne relit pas MON texte (il a disparu) : il refuse la FORME
     qui le ramènerait — une longue chaîne littérale dans le popup du livre. */
  /* ⚠️ LE MOTIF NE TRAVERSE PAS UNE FIN DE LIGNE, et ma première écriture le
     faisait : `/"[^"]{80,}"/` appariait depuis la fin d'un littéral jusqu'au
     début du suivant, donc il mesurait le CODE entre deux chaînes. Il a rougi
     sur un fichier sain. **Un motif qui compte des caractères doit dire où il
     s'arrête.**
     📏 ET LE SEUIL EST MESURÉ, PAS CHOISI : le plus long littéral du fichier
     fait 50 caractères — c'est le message d'échec honnête ci-dessous. Les deux
     phrases de règle que le livre portait avant en faisaient environ 200. 80
     sépare les deux familles sans serrer ni l'une ni l'autre. */
  const litteraux = (CONCEPT.match(/"(?:[^"\\\n]|\\.)*"/g) || [])
    .filter((l) => l.length > 80);
  assert.deepEqual(litteraux, [],
    "une longue chaîne littérale est apparue dans l'écran : un texte de règle "
    + "doit venir de la couche, jamais de l'écran");
  assert.match(CONCEPT, /lireLaSectionSrd\(\s*ctxQuery\s*,\s*"alignment"\s*\)/,
    "le livre doit lire la section par le lecteur de couche");
});

test("⚔️ ATTAQUE — la coquille passe le VRAI chemin de `query`, pas un champ absent", () => {
  /* 🔴 CE TEST EXISTE PARCE QUE J'AI ÉCRIT LA FAUTE. J'ai d'abord passé
     `state.query` — un champ qui **n'existe pas** dans `shell.mjs`.
     ⚠️ ET RIEN NE SE SERAIT CASSÉ : `undefined` va au lecteur, qui rend `null`,
     et le livre affiche « this rule text could not be loaded ». **Le repli
     élégant se serait fait passer pour le comportement normal.** Un garde-fou
     qui absorbe une erreur de câblage est pire qu'une exception : il la rend
     crédible.
     ⭐ D'OÙ CE GARDE, QUI NE REGARDE PAS LE RÉSULTAT MAIS LE CHEMIN : le seul
     accès valide à la pile montée est `engine.layers.verbs.query`, et c'est ce
     que les cinq autres écrans utilisent déjà. */
  assert.match(SHELL, /query:\s*state\.engine\s*&&\s*state\.engine\.layers\.verbs\.query/,
    "Identity doit recevoir la pile par le même chemin que les autres écrans");
  assert.doesNotMatch(SHELL, /query:\s*state\.query\b/,
    "`state.query` n'existe pas — ce champ rendrait `undefined` en silence");
});
