/* ══ LOT 54 — LE CÂBLAGE DE shell.mjs, GARDÉ SUR LES OCTETS ═══════════════
   Même patron que `tests/ui-jetons.test.mjs` (garde 11) et
   `tests/doc-writers.test.mjs` (test 0/0bis) : `shell.mjs` n'a AUCUN
   harnais de rendu (aucun test ne le monte, lot 50 l'a déclaré) — la seule
   preuve possible est un garde d'OCTETS : la forme du code, pas son
   exécution. Ce fichier prouve les points STRUCTURELS du §3 de la commande
   qu'aucun autre test ne peut voir :

     7. ⚔️ aucun `createDoc` n'apparaît nulle part dans `ui/` — le magasin
        n'est JAMAIS monté dans le navigateur (§1 de la commande, arbitrage
        ferme de l'architecte).
     8. les NEUF étapes sont branchées dans `renderStage()` — et le
        placeholder générique qui restait avant ce lot a bien disparu :
        c'est LE test qui clôt le builder. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments, walkSources } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI_DIR = path.join(ROOT, "ui", "builder");
const SHELL_PATH = path.join(UI_DIR, "shell.mjs");
const shellText = stripComments(fs.readFileSync(SHELL_PATH, "utf8"));

/* Les DIX identifiants réels de `STEPS` (les neuf étapes de décision, plus
   `review`, la destination — voir la tête de `shell.mjs`, lot 33 : « les
   huit autres étapes restent des placeholders », Compétences déjà faite =
   neuf au total, `review` compté à part). Recopiés ici NOMMÉS plutôt que
   parsés dans `STEPS` : si `shell.mjs` change un id sans que ce test change
   avec lui, il DOIT rougir — c'est tout le sens du garde. */
const STEP_IDS = [
  "universe", "concept", "class", "species", "background",
  "abilities", "destiny", "skills", "equipment", "review"
];

/* ══ 7 — ⚔️ AUCUN createDoc DANS ui/ — LE MAGASIN N'Y ENTRE JAMAIS ═══════ */

test("7 — ⚔️ aucun `createDoc` nulle part dans ui/ — jamais un faux magasin monté dans le builder", () => {
  const files = walkSources(UI_DIR);
  assert.ok(files.length > 5, "témoin : le balayage a bien trouvé les fichiers du builder");
  const hits = [];
  /* \b…\b : ancré sur les deux bouts, pour ne PAS accuser `createDocWriters`
     (le nom légitime, importé par `concept-step.mjs`/`shell.mjs`) — voir
     INVENTAIRE-LOT-54.md, « ce qui m'a surpris » : un `.includes("createDoc")`
     naïf aurait fait rougir ce garde sur son propre remède. */
  for (const file of files) {
    const text = stripComments(fs.readFileSync(file, "utf8"));
    if (/\bcreateDoc\b/.test(text)) hits.push(path.relative(ROOT, file));
  }
  assert.deepEqual(hits, [], `createDoc apparaît là où aucun magasin ne doit être monté : ${hits.join(", ")}`);
});

test("7bis — témoin positif du garde : `createDocWriters` (le remède) EST bien présent, sans faire rougir 7", () => {
  const engineText = stripComments(fs.readFileSync(path.join(UI_DIR, "shell.mjs"), "utf8"));
  assert.match(engineText, /\bcreateDocWriters\b/,
    "shell.mjs doit importer createDocWriters — sinon Concept/Universe n'ont aucun moyen d'écrire le document");
});

test("7ter — ⚔️ ATTAQUE : une source FABRIQUÉE qui monte `createDoc` fait rougir le garde 7, lui seul", () => {
  const files = walkSources(UI_DIR).map((file) => ({
    file, text: stripComments(fs.readFileSync(file, "utf8"))
  }));
  const before = files.filter(({ text }) => /\bcreateDoc\b/.test(text));
  assert.deepEqual(before, [], "aucun fichier réel ne porte createDoc avant l'attaque");

  const mutated = files.map(({ file, text }) =>
    file === SHELL_PATH ? { file, text: `${text}\nimport { createDoc } from "../../src/doc/index.mjs";` } : { file, text }
  );
  const after = mutated.filter(({ text }) => /\bcreateDoc\b/.test(text));
  assert.deepEqual(after.map(({ file }) => file), [SHELL_PATH], "l'attaque doit être VUE, et nommée");
});

/* ══ 8 — LES NEUF ÉTAPES SONT BRANCHÉES, PLUS AUCUN PLACEHOLDER ═════════ */

test("8 — chacun des dix ids de STEPS (les neuf + review) a sa branche dans renderStage()", () => {
  for (const id of STEP_IDS) {
    assert.match(shellText, new RegExp(`step\\.id === "${id}"`),
      `aucune branche pour l'étape « ${id} » — renderStage() ne sait pas la rendre`);
  }
});

test("8bis — ⭐ LE TEST QUI CLÔT LE BUILDER : le placeholder générique (lot 33) a disparu de shell.mjs", () => {
  /* La phrase exacte du placeholder d'origine (voir git blame, lot 33) —
     si elle réapparaît, c'est qu'une étape est retombée en `else` générique
     au lieu d'une branche nommée : shell.mjs ment alors sur ce qui reste à
     câbler. */
  assert.doesNotMatch(shellText, /decisions\[\] ledger \(lot 28\)/,
    "le placeholder générique doit avoir disparu — les neuf étapes sont toutes branchées par leur id");
});

test("8ter — ⚔️ ATTAQUE : réintroduire un `else` générique fait rougir 8bis, lui seul", () => {
  const mutated = `${shellText}\nelse { /* This step will read the decisions[] ledger (lot 28) for its options */ }\n`;
  assert.doesNotMatch(shellText, /decisions\[\] ledger \(lot 28\)/, "le vrai fichier est propre avant l'attaque");
  assert.match(mutated, /decisions\[\] ledger \(lot 28\)/, "l'attaque réintroduit bien la phrase");
  /* Et les gardes VOISINS (7, 8) ne bougent pas — l'attaque touche
     exactement ce qu'elle vise. */
  for (const id of STEP_IDS) assert.match(mutated, new RegExp(`step\\.id === "${id}"`));
  assert.doesNotMatch(mutated, /\bcreateDoc\b/);
});

/* ══ CÂBLAGE DES ACTIONS — rename/describe/requestLayerStack, RÉELLEMENT
   ÉCRITS (même défaut que la garde 11 de ui-jetons.test.mjs : prouver que
   c'est POSSIBLE ne prouve pas que c'est FAIT). ═══════════════════════ */

test("9 — applyDecisionAction câble rename/describe sur state.docWriters, pas ailleurs", () => {
  assert.match(shellText, /state\.docWriters\.rename\(\s*\{\s*document:\s*state\.document,\s*name:\s*action\.name\s*\}\s*\)/);
  assert.match(shellText, /state\.docWriters\.describe\(\s*\{\s*document:\s*state\.document,\s*\[action\.field\]:\s*action\.value\s*\}\s*\)/);
});

test("10 — requestLayerStack : le passage à SRD teste fhRefChoicesPresent AVANT d'ouvrir pendingStack", () => {
  assert.match(shellText, /needsConfirm\s*=\s*action\.value\s*===\s*"srd"\s*&&\s*fhRefChoicesPresent\(state\.document\)/);
  assert.match(shellText, /state\.pendingStack\s*=\s*"srd"/);
});

test("11 — applyLayerStack pose bien layers.enable/disable PUIS build.layers = [] — jamais un verbe build/doc pour ce champ", () => {
  assert.match(shellText, /layersVerbs\.enable\(\s*\{\s*id\s*\}\s*\)/);
  assert.match(shellText, /layersVerbs\.disable\(\s*\{\s*id\s*\}\s*\)/);
  assert.match(shellText, /build:\s*\{\s*\.\.\.state\.document\.build,\s*layers:\s*\[\]\s*\}/);
});

/* ══ LOT 55, §1 — LE BOUTON FINAL NE SE POINTE PLUS SUR LUI-MÊME ═══════════
   `shell.mjs` n'a AUCUN harnais de rendu (voir la tête de ce fichier) — même
   patron que les gardes 7/8/9/10/11 ci-dessus : un garde d'OCTETS, pas une
   exécution.

   LE DÉFAUT MESURÉ (commande §1) : AVANT ce lot, le libellé ET le saut
   partageaient la MÊME expression, `state.step === STEPS.length - 1` — qui
   coïncide avec `REVIEW_INDEX` (9 === 9) PAR LA LONGUEUR du tableau, pas par
   l'id. Sur Review, la condition était vraie : le bouton affichait « Open
   the sheet » et REMETTAIT `state.step` à sa propre valeur — un clic qui ne
   change rien, zéro erreur en console (vérifié dans le navigateur, commande
   §1). La cause exacte, GARDÉE ICI PAR SON OCTET, jamais RETROUVÉE PAR
   HASARD : le bouton comparait sa condition de LIBELLÉ à `STEPS.length - 1`,
   une coïncidence de position, plutôt qu'à `REVIEW_INDEX`, trouvé par id
   (lot 40, le commentaire au-dessus de la déclaration de `STEPS`). */

test("12 — ⛔ le bouton final n'utilise plus `STEPS.length - 1` pour décider quoi que ce soit sur `state.step`", () => {
  /* Le motif exact du défaut d'origine : `state.step === STEPS.length - 1`
     comparé pour choisir le LIBELLÉ ou la CIBLE du saut. `REVIEW_INDEX` (une
     variable à part, trouvée par id) reste légitime partout ailleurs dans le
     fichier — ce garde ne vise QUE la comparaison à la longueur du tableau. */
  assert.doesNotMatch(shellText, /state\.step\s*===\s*STEPS\.length\s*-\s*1/,
    "le bouton final ne doit plus comparer state.step à STEPS.length - 1 — c'est exactement la coïncidence qui le faisait pointer sur lui-même");
});

test("13 — le bouton final compare désormais sa condition à REVIEW_INDEX, par id, comme Back compare la sienne à 0", () => {
  assert.match(shellText, /state\.step\s*===\s*REVIEW_INDEX\s*\?\s*"Open the sheet"\s*:\s*"Continue"/,
    "le libellé doit trancher sur REVIEW_INDEX (par id), jamais sur une longueur de tableau");
});

test("14 — sur Review, le bouton final est DÉSACTIVÉ — même geste que Back désactivé à l'étape 0 (disabled === true, mesuré)", () => {
  /* `button(label, onClick, disabled)` — le TROISIÈME argument porte l'état
     désactivé (voir sa définition, plus haut dans ce fichier). Back le pose
     déjà en dur : `state.step === 0`. Ce test exige la SYMÉTRIE nommée par
     la commande (§1) : le bouton final le pose aussi, sur REVIEW_INDEX. */
  assert.match(shellText,
    /button\(state\.step === REVIEW_INDEX \? "Open the sheet" : "Continue",\s*\n\s*\(\) => \{ state\.step = Math\.min\(REVIEW_INDEX, state\.step \+ 1\); render\(\); \},\s*\n\s*state\.step === REVIEW_INDEX\)/,
    "le bouton final doit passer `state.step === REVIEW_INDEX` en troisième argument (disabled) à button(), exactement comme Back passe `state.step === 0`");
});

test("15 — ⚔️ ATTAQUE : réintroduire `STEPS.length - 1` dans la condition du bouton final fait rougir 12, lui seul", () => {
  const mutated = shellText.replace(
    /state\.step === REVIEW_INDEX \? "Open the sheet" : "Continue"/,
    'state.step === STEPS.length - 1 ? "Open the sheet" : "Continue"'
  );
  assert.notEqual(mutated, shellText, "témoin : le remplacement a bien eu lieu sur le vrai texte");
  assert.match(mutated, /state\.step\s*===\s*STEPS\.length\s*-\s*1/, "l'attaque réintroduit bien le motif fautif");
  // Et les gardes VOISINS (7 à 11, 13) ne sont pas concernés par cette attaque précise.
  assert.match(mutated, /\bcreateDocWriters\b/);
  for (const id of STEP_IDS) assert.match(mutated, new RegExp(`step\\.id === "${id}"`));
});
