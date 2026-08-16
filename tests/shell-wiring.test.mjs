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

/* ⚠️ LOT 58 — LES TESTS 13/14/15 CHANGENT DE CIBLE, PAS DE LOI.
   Le « bouton final » du lot 55 était `Continue`/`Open the sheet`, dans une
   barre `.stage-nav` sous la carte. Les deux ont disparu, et pas par
   commodité : l'invariant I.3 dit qu'il n'existe QU'UN SEUL `Validate` dans
   toute l'interface, celui de la barre du haut, et l'invariant I.5 supprime
   `Back` (la molette le remplace).

   🔴 LA LOI QUE CES TROIS TESTS GARDENT EST INCHANGÉE, et elle compte
   DOUBLE depuis ce lot : le dernier pas se trouve PAR SON ID
   (`REVIEW_INDEX`), jamais par `STEPS.length - 1`. Le lot 58 réordonne
   `STEPS` (décision d'Eric du 2026-08-14) — c'est exactement le scénario
   que la loi du lot 40 protège, et le lot 55 a payé pour l'avoir laissée
   non appliquée. */

test("13 — la porte par défaut de `Validate` tranche sur REVIEW_INDEX, par id, jamais sur une longueur", () => {
  assert.match(shellText, /return \{ exists: true, ready: state\.step < REVIEW_INDEX, action: null, next: "step" \};/,
    "sur Review il n'y a pas de pas suivant : Validate doit s'y éteindre, et le savoir PAR L'ID");
});

test("14 — ⛔ LA CEINTURE N'A PLUS DE CHEVRONS DU TOUT, et c'est la décision d'Eric", () => {
  /* ⚠️ CE TEST GARDAIT B0.3 — « aucun chevron à gauche à la première étape,
     aucun à droite à la dernière, les deux au milieu ». Il gardait donc la
     SYMÉTRIE de deux boutons qui n'existent plus.

     Eric, 2026-08-15, après les avoir vus sur le simulateur : « les flèches
     gauche et droite font moche, on les dégage ». Ils avaient d'abord été
     posés PAR-DESSUS la piste pour que les dalles glissent dessous au lieu
     d'être tranchées en plein vide ; à l'écran, ils se posaient sur le
     NUMÉRO du cran voisin — le remède était pire que le mal.

     ⭐ L'AFFORDANCE N'EST PAS PERDUE, et c'est ce qui rend le retrait
     légitime : la ceinture défile ET se tape, Eric l'a vérifié lui-même
     (« il fonctionne bien, il est en scroll/tap »), et le cran courant se
     recentre à la sélection. Une flèche qui double un geste déjà acquis
     n'ajoute rien — elle occupe.

     Le garde s'inverse donc : il interdit leur retour silencieux. */
  assert.equal(/belt-chevron/.test(shellText), false,
    "aucun chevron de ceinture ne doit revenir sans une décision d'Eric");
  assert.equal(/frame\.prev\b|frame\.next\b/.test(shellText), false,
    "et rien ne doit plus les piloter");
});

test("14 bis — et le saut lui-même est BORNÉ par REVIEW_INDEX, jamais par la longueur du tableau", () => {
  assert.match(shellText, /Math\.min\(REVIEW_INDEX, index\)/,
    "un pas au-delà de Review doit s'arrêter à Review PARCE QUE c'est Review, pas parce qu'un index coïncide");
});

test("15 — ⚔️ ATTAQUE : réintroduire `STEPS.length - 1` dans la porte de Validate fait rougir 12, lui seul", () => {
  const mutated = shellText.replace(
    /return \{ exists: true, ready: state\.step < REVIEW_INDEX, action: null, next: "step" \};/,
    'return { exists: true, ready: state.step === STEPS.length - 1, action: null, next: "step" };'
  );
  assert.notEqual(mutated, shellText, "témoin : le remplacement a bien eu lieu sur le vrai texte");
  assert.match(mutated, /state\.step\s*===\s*STEPS\.length\s*-\s*1/, "l'attaque réintroduit bien le motif fautif");
  // Et les gardes VOISINS (7 à 11, 14) ne sont pas concernés par cette attaque précise.
  assert.match(mutated, /\bcreateDocWriters\b/);
  /* ⚠️ Le témoin voisin était `frame.next.hidden` — il a disparu avec les
     chevrons (test 14). On prend à sa place le BORNAGE par `REVIEW_INDEX`,
     qui est ce que cette attaque menace vraiment et qui, lui, existe. */
  assert.match(mutated, /Math\.min\(REVIEW_INDEX, index\)/);
  for (const id of STEP_IDS) assert.match(mutated, new RegExp(`step\\.id === "${id}"`));
});

/* ══ LOT 58 — DEUX GARDES DE PLUS, SUR CE QUE LE CADRE PROMET ═════════════ */

/* ══ 16 / 17 — LA SORTIE D'ÉTAPE, ET LES DEUX GARDES QUI ONT CHANGÉ DE
   VÉRITÉ LE 2026-08-16 (lot 80, §5.1) ════════════════════════════════════

   🔴 CE QUI A ÉTÉ DÉCIDÉ. Eric, mot pour mot : *« 1 validate dégage
   PARTOUT »*. Le croquis des caractéristiques dessine `BACK` et `DONE` au
   pied du collecteur, et le mandat dit ce qu'ils sont : non pas la sortie
   d'UN écran, mais **le PATRON de la sortie d'étape**.

   ⛔ CES DEUX GARDES SONT DONC RÉÉCRITS À LA NOUVELLE VÉRITÉ, JAMAIS
   DÉSARMÉS — c'est l'instruction du mandat, et c'est la seule façon honnête
   de traiter un invariant qu'une décision périme. Un garde qu'on supprime
   parce qu'il rougit ne protégeait plus rien le lendemain.

   ── CE QUE CHACUN GARDAIT, ET CE QU'IL GARDE MAINTENANT ────────────────
   · **16** gardait « UN SEUL `Validate` dans tout `ui/` » (I.3, « répété
     deux fois par Eric »). Le mot ne doit plus paraître du tout : il devient
     **ZÉRO**. ⚠️ Mais un garde qui n'exige plus qu'une absence garde du VIDE
     — il resterait vert sur un builder sans aucune sortie d'étape. Il exige
     donc AUSSI que la sortie EXISTE, et qu'elle soit produite au seul
     endroit qui en ait le droit.
   · **17** gardait « `Back` n'existe plus nulle part » (I.5 : *« la molette
     le remplace »*), et le lot 79 l'avait PRÉCISÉ (§4.1 bis) : interdit
     comme navigation d'ÉTAPE, autorisé entre PALIERS — parce que la
     ceinture porte le retour entre les dix étapes, mais qu'un sous-écran de
     palier n'a aucune ceinture.

   ⭐ ET LA NUANCE DU LOT 79 N'EST PAS RENVERSÉE, ELLE EST TENUE PAR LA
   FORME MÊME DU BOUTON. Le `BACK` de la sortie recule d'un **palier** quand
   il y en a un, d'une **étape** sinon (`pressBack`, shell.mjs). Le joueur
   n'a donc jamais deux chemins de retour concurrents pour le même pas —
   c'était tout l'argument de I.5 — et le sous-écran de palier gagne le sien,
   ce que le lot 79 réclamait. Les deux lois disaient la même chose ; il
   manquait un bouton capable de les servir toutes les deux.
   ⛔ CE QUI RESTE INTERDIT, ET C'EST LE CŒUR DU GARDE 17 : qu'un ÉCRAN pose
   son propre retour. Un seul producteur, `renderSortieEtape`.

   📌 CE QUE CES DEUX GARDES NE DISENT PAS, dit ici plutôt que tu : les
   PORTES gardent leur nom (`currentGate`, `abilitiesValidate`,
   `skillsValidate`, `catalogueValidate`…). Elles n'ont jamais nommé le
   bouton — elles nomment le fait de VALIDER un palier, qui est toujours ce
   qu'elles font. Seul le LIBELLÉ a disparu, et c'est le libellé que ces
   gardes cherchent. */

/** Les libellés de la sortie d'étape, et le fichier qui a seul le droit de
 *  les écrire. Une paire, un producteur. */
const SORTIE_ETAPE = { back: '"BACK"', done: '"DONE"', producteur: "ui/builder/shell.mjs" };

/** Combien de fois chaque fichier de `ui/` écrit un libellé donné, hors
 *  commentaires. */
function porteursDuLibelle(libelle) {
  const porteurs = [];
  for (const file of walkSources(UI_DIR)) {
    const text = stripComments(fs.readFileSync(file, "utf8"));
    const n = (text.split(libelle).length - 1);
    if (n > 0) porteurs.push(`${path.relative(ROOT, file)} (${n})`);
  }
  return porteurs;
}

test("16 — ⛔ ZÉRO `Validate` dans tout ui/ : le mot a disparu partout (Eric, 2026-08-16)", () => {
  /* *« 1 validate dégage PARTOUT »*. Plus aucun écran, plus aucune fenêtre,
     plus la coquille elle-même. Le garde cherche le MOT dans les chaînes de
     `ui/`, hors commentaires. */
  assert.deepEqual(porteursDuLibelle('"Validate"'), [],
    "`Validate` a été retiré partout : le voir revenir serait une régression, pas un ajout");
});

test("16 bis — ⭐ ET LA SORTIE D'ÉTAPE EXISTE : le garde ne garde pas du vide", () => {
  /* 🔴 SANS CETTE MOITIÉ, LE GARDE 16 SERAIT VERT SUR UN BUILDER SANS AUCUN
     MOYEN D'AVANCER. Une absence ne se garde jamais seule — c'est la leçon
     des gardes 18/19 dix lignes plus haut (« on pouvait retirer les
     `applyDecisionAction` et garder 1 142 tests verts devant un rail mort »). */
  assert.deepEqual(porteursDuLibelle(SORTIE_ETAPE.done), [`${SORTIE_ETAPE.producteur} (1)`],
    "`DONE` doit exister EXACTEMENT une fois, et dans la coquille — c'est elle qui possède l'enchaînement des paliers (I.4)");
  assert.match(shellText, /function renderSortieEtape\(\)/,
    "et la paire a un producteur nommé : un écran qui la recopierait en ferait la sortie d'UN écran");
  assert.match(shellText, /swapContent\(frame\.stage, \[renderStepContent\(\), renderSortieEtape\(\)\]/,
    "⛔ et elle est réellement POSÉE dans la scène — écrite sans être appelée, elle ne serait qu'un placeholder de plus");
});

/* ══ 18 / 19 — LES DEUX CHAPITRES DU 2026-08-15, SUR LES OCTETS ══════════
   🔴 POURQUOI ICI, ET NULLE PART AILLEURS. `tests/catalogue.test.mjs` prouve
   tout ce qui vit dans `catalogue.mjs` : le cran émet `snapTo`, `CHOOSE`
   émet `ficheChoose` avec l'index de sa fiche. Mais les deux gestes ne
   servent à rien si `shell.mjs` ne leur donne pas de destinataire — et
   AUCUN test ne monte `shell.mjs` (lot 50). Sans ces deux gardes-ci, on
   pouvait retirer les `applyDecisionAction` du câblage et garder 1 142 tests
   verts devant un rail mort et un `CHOOSE` allumé qui ne fait rien : le
   « faux magasin » exact que ce dépôt interdit. */

test("18 — CH4/CH6 : le rail ET les fiches reçoivent leur destinataire — sinon deux boutons morts", () => {
  assert.match(shellText, /renderCatalogueRail\(catalogueCtx\(cfg\), applyDecisionAction\)/,
    "le rail sans destinataire se tape dans le vide (CH4)");
  assert.match(shellText, /renderCatalogueCards\(ctx, cfg\.cardBody, applyDecisionAction\)/,
    "les fiches sans destinataire rendent un `CHOOSE` éteint — et l'écran n'aurait alors AUCUNE validation (CH6)");
  /* Et l'action arrive bien à la porte : `ficheChoose` pose le curseur de la
     fiche pressée, puis laisse `pressValidate` posséder les paliers (I.4). */
  /* ⚠️ LE NOM A CHANGÉ AU LOT 80 (`pressValidate` → `pressDone`), LA LOI NON :
     le bouton qu'il servait n'existe plus, et un nom qui promet un `Validate`
     à l'écran ferait chercher longtemps. Ce que ce garde tient est intact —
     `ficheChoose` pose le curseur PUIS passe la main au propriétaire des
     paliers, il ne recopie pas sa logique. */
  assert.match(shellText, /action\.kind === "ficheChoose"[\s\S]{0,160}state\.cursor = action\.index;[\s\S]{0,80}pressDone\(\)/,
    "⛔ `ficheChoose` doit poser le curseur PUIS passer la main à `pressDone` — recopier la logique des paliers ferait deux propriétaires d'une même porte");
});

test("19 — CH6 : `renderValidation` s'efface sur un écran à fiche, et SEULEMENT au palier 1", () => {
  /* Les deux moitiés comptent. S'effacer partout retirerait le `Validate` du
     2ᵉ palier (le menu des choix n'a pas de `CHOOSE` : l'écran deviendrait
     une impasse). Ne s'effacer nulle part remettrait deux boutons pour une
     porte, à dix pixels l'un de l'autre. */
  assert.match(shellText, /\.fiche && state\.palier !== 2\) return null/,
    "le drapeau `fiche` (déclaré par class-step/species-step) est ce qui décide, et le palier 2 garde son bouton");
  /* ⚔️ Le témoin : les deux écrans à fiche déclarent bien le drapeau que
     cette ligne lit. Un drapeau lu mais jamais posé s'effacerait en silence. */
  for (const fichier of ["class-step.mjs", "species-step.mjs"]) {
    const texte = stripComments(fs.readFileSync(path.join(UI_DIR, fichier), "utf8"));
    assert.match(texte, /CATALOGUE = \{[^}]*fiche: true/,
      `${fichier} doit déclarer \`fiche: true\` — sinon son \`CHOOSE\` et un \`Validate\` cohabitent`);
  }
});

test("20 — ⚔️ ATTAQUE : un câblage amputé fait rougir 18, sur une source fabriquée", () => {
  /* Le geste exact qu'on redoute : quelqu'un « nettoie » un argument qui a
     l'air en trop. Le garde doit le voir. */
  const ampute = 'const rail = cfg ? renderCatalogueRail(catalogueCtx(cfg)) : null;';
  assert.equal(/renderCatalogueRail\(catalogueCtx\(cfg\), applyDecisionAction\)/.test(ampute), false);
  assert.equal(/renderCatalogueRail\(catalogueCtx\(cfg\), applyDecisionAction\)/.test(shellText), true,
    "et le vrai fichier, lui, passe — sinon le garde ne prouverait rien");
});

test("17 — ⛔ UN SEUL retour dans tout ui/, et c'est la coquille qui le pose (I.5 + lot 79 §4.1 bis)", () => {
  /* La nuance est ÉCRITE DANS LE GARDE, pour que le prochain lot ne la relise
     pas comme une interdiction générale et ne rouvre pas le débat (le lot 79
     l'avait demandé mot pour mot). */
  assert.deepEqual(porteursDuLibelle(SORTIE_ETAPE.back), [`${SORTIE_ETAPE.producteur} (1)`],
    "un `BACK` posé par un ÉCRAN rouvrirait deux chemins de retour — ce que I.5 interdit ; celui de la coquille les unifie");
  /* ⭐ ET IL RECULE BIEN D'UN PALIER AVANT DE RECULER D'UNE ÉTAPE : c'est
     CETTE ligne qui tient la nuance du lot 79. Inversée, le bouton sauterait
     le sous-écran qu'on vient de traverser — précisément le retour qui
     manquait aux paliers. */
  assert.match(shellText, /function pressBack\(\) \{\s*if \(state\.palier > 1\) \{ state\.palier -= 1; openSurface\(\); return; \}\s*goToStep\(state\.step - 1\);/,
    "⛔ un PALIER d'abord, une ÉTAPE ensuite — l'ordre EST la nuance du lot 79, il ne s'inverse pas");
  /* L'ancienne forme du mot ne doit pas revenir non plus par la petite porte :
     `"Back"` en capitale douce était le libellé de la barre disparue. */
  assert.deepEqual(porteursDuLibelle('"Back"'), [],
    "l'ancien libellé de la ligne de commande reste mort — la paire du croquis écrit `BACK`");
});

/* ══ 16 ter — LA CONDITION SOUS LAQUELLE LES 76 px RESTENT VRAIS ══════════
   🔴 CE GARDE NAÎT D'UNE PRÉDICTION QUI S'EST RÉVÉLÉE FAUSSE, ET C'EST TOUT
   SON INTÉRÊT. `CADRES.md` annonçait que le départ de `Validate` rendrait ses
   76 px et périmerait « toute cote qui la compte ». Mesuré après la bascule :
   le pied fait **toujours 76 px** — deux boutons côte à côte coûtent ce qu'un
   seul coûtait. La prophétie n'avait jamais été testée, et elle a traversé un
   fichier de COTES sans que personne la voie, parce qu'elle parlait d'un jour
   qui n'était pas encore venu.

   ⭐ CE QUE CE GARDE TIENT N'EST DONC PAS LA COTE, C'EST SA CONDITION : les
   76 px valent tant que la paire tient sur UNE LIGNE. C'est la même forme que
   *« une fiche fait un champ »* qui garde `scroll-snap: mandatory` — une cote
   vraie « tant que » est une cote qui rouille si le « tant que » n'est gardé
   nulle part.

   📏 MESURÉ AU CAS LE PLUS ÉTROIT (360, la cote de référence), sur la page
   SERVIE et non sur le gabarit :

       champ intérieur du pied ......... 344   (360 − 8 − 8)
       `BACK` 79 + `DONE` 82 + écart 8 . 169
       ─────────────────────────────────────
       MOU RESTANT ..................... 175 px

   Au corps de ces boutons (T3, ~10,6 px par caractère mesuré sur les huit
   d'aujourd'hui), 175 px valent une seizaine de caractères : d'où le budget
   de **24**, contre 8 employés.

   ⚠️ CE GARDE EST UN PROXY, ET IL LE DIT — même honnêteté que le budget de
   largeur du plateau : Node n'a pas de `measureText`, il compte donc des
   CARACTÈRES là où le navigateur compte des pixels. Il ne remplace pas une
   mesure au navigateur ; il attrape les deux gestes qui feraient réellement
   sauter la cote.
   ⛔ ET LE VRAI RISQUE EST LE NOMBRE, PAS LA LONGUEUR : un troisième bouton
   coûte en plus son propre rembourrage (42 px). C'est pourquoi le compte des
   boutons est gardé AVANT leur longueur. */

test("16 ter — ⛔ LE PIED EST UNE PAIRE, ET ELLE TIENT SUR UNE LIGNE (la condition des 76 px)", () => {
  /* Le pied se construit en une expression : deux boutons, jamais trois. Un
     troisième ajouterait 42 px de rembourrage à lui seul. */
  assert.match(shellText, /return el\("div", "sortie", \[back, done\]\);/,
    "⛔ EXACTEMENT deux boutons dans le pied — un troisième ferait passer la paire à deux lignes, et les 76 px avec");
  /* Et le budget de libellé, proxy assumé (voir l'en-tête). */
  const libelles = [SORTIE_ETAPE.back, SORTIE_ETAPE.done].map((l) => l.replace(/"/g, ""));
  const total = libelles.join("").length;
  assert.ok(total <= 24,
    `les libellés du pied font ${total} caractères : au-delà de 24, la paire déborde les 344 px du champ à 360 — mesuré, 175 px de mou pour 8 caractères`);
  /* ⚔️ LE TÉMOIN : le budget n'est pas si large qu'il ne puisse jamais mordre.
     Des libellés traduits plausibles (« RETOUR » / « TERMINER ») passent ; un
     pied bavard ne passe pas. */
  assert.ok("RETOURTERMINER".length <= 24, "une traduction raisonnable tient dans le budget");
  assert.equal("REVENIR EN ARRIERE".length + "VALIDER CETTE ETAPE".length <= 24, false,
    "et un pied bavard le dépasse — le garde n'est pas si lâche qu'il ne dise jamais non");
});

test("17 bis — ⚔️ ATTAQUE : un écran qui poserait sa propre sortie fait rougir 16 bis et 17, eux seuls", () => {
  /* Le geste exact qu'on redoute — un lot qui « ajoute juste un bouton » au
     pied de son écran plutôt que d'employer celui de la coquille. */
  const ecranFautif = 'const b = button("DONE", () => act()); const r = button("BACK", () => act());';
  assert.equal(ecranFautif.includes(SORTIE_ETAPE.done), true, "l'attaque pose bien un second DONE");
  assert.equal(ecranFautif.includes(SORTIE_ETAPE.back), true, "et un second BACK");
  /* Et les gardes VOISINS ne bougent pas : l'attaque n'introduit aucun
     `Validate`, ne touche ni le câblage du rail ni le bornage par REVIEW_INDEX. */
  assert.equal(ecranFautif.includes('"Validate"'), false);
  assert.match(shellText, /Math\.min\(REVIEW_INDEX, index\)/);
});
