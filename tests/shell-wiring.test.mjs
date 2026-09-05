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

     Le garde s'inverse donc : il interdit leur retour silencieux.

     ══ ⚖️ ET LE RETOUR A EU LIEU LE 2026-09-02 — IL N'AVAIT RIEN DE SILENCIEUX
     Eric, croquis `2026-09-02-belt-etroit-tuiles-egales.jpg` à l'appui :
     *« sur la version courte je rajoute ces chevrons cliquables, qui
     s'intercalent parfaitement entre les tuiles »* · *« quand je suis en bout
     de course le chevron disparaît »* · *« il doit fonctionner en tactile et
     en clic souris »*. ⭐ **Le garde a fait exactement son travail** : il a
     exigé une décision, et la décision est venue — datée, dessinée, chiffrée.

     🔴 ET L'OBJECTION DU 15/08 EST RÉPONDUE, PAS OUBLIÉE. Ce qui était moche
     alors, c'était que les flèches étaient posées PAR-DESSUS la piste et
     tombaient sur le NUMÉRO du cran voisin. Les nouvelles vivent dans une
     zone que la piste **réserve** dans son écart : mesuré au navigateur, la
     cible occupe 29 → 73 blg et la première tuile commence à 73. Elles ne
     recouvrent plus rien.

     ➡️ LE GARDE SE RÉÉCRIT DONC À LA NOUVELLE VÉRITÉ (TRAPS : *« réécrire à
     la nouvelle vérité, jamais relâcher »*), et il est PLUS serré qu'avant :
     il ne comptait qu'une absence, il tient maintenant les quatre propriétés
     qu'Eric a nommées. */
  assert.match(shellText, /className = "belt-chevron"/,
    "les deux chevrons du belt étroit existent (décision d'Eric du 2026-09-02, croquis à l'appui)");
  assert.equal((shellText.match(/className = "belt-chevron"/g) || []).length, 1,
    "et ils sortent d'un SEUL producteur — deux fabriques divergeraient au premier réglage");
  assert.match(shellText, /belt\.avant\.hidden = mou <= 0 \|\| auDebut/,
    "🔴 en bout de course, le chevron DISPARAÎT — *« quand je suis en bout de course le chevron disparaît »*");
  assert.match(shellText, /belt\.apres\.hidden = mou <= 0 \|\| aLaFin/,
    "des deux côtés, et la même condition efface les deux en vue double (mou nul)");
  assert.match(shellText, /crans\[1\]\.offsetLeft - crans\[0\]\.offsetLeft/,
    "le pas se MESURE (une tuile plus sa gouttière), il ne s'écrit pas — §1 ter");
  assert.equal(/scrollBy\(\{ left: sens \* pas, behavior/.test(shellText), false,
    "⛔ aucun `behavior` en dur : un geste laisse le CSS trancher, `prefers-reduced-motion` compris");
  assert.equal(/frame\.prev\b|frame\.next\b/.test(shellText), false,
    "et les DEUX BOUTONS D'AVANT ne reviennent pas : ce sont des organes du belt, pas de la coquille");
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
/* 🔴 LES DEUX MOTS DU PIED, ARRÊTÉS PAR ERIC LE 2026-08-20 : *« done / i
   changed my mind »*. Ils remplacent `BACK` ET `CANCEL` — trois mots pour une
   même porte, dont un (`I changed my mind`) que le pied du guide employait
   déjà pour le même geste vu du dessus.
   ⚠️ Le budget de libellé passe de 8 à 21 caractères sur 24 : la marge n'est
   plus confortable, et c'est exactement pourquoi ce garde la compte. */
const SORTIE_ETAPE = {
  /* 🔴 TROIS MOTS, TROIS GESTES — Eric, 2026-08-20 : *« back n'efface pas ;
     pour effacer, c'est cancel ou i changed my mind »*. Une fusion des trois a
     vécu quelques heures et il l'a corrigée : un libellé nomme ce que son
     bouton FAIT, et `Back` ne fait que reculer.
     ⭐ CE QUI RESTE DE LA PASSE : la casse (`Done`, pas `DONE`) et surtout la
     façon d'identifier l'organe — par sa CLASSE et son VERBE, plus par son mot.
     Le pied du guide porte légitimement « I changed my mind » ; reconnaître la
     paire de la coquille à un libellé, c'était se faire tromper le jour où deux
     choses portent le même nom. */
  back: '"Back"', cancel: '"Cancel"', done: '"Done"', producteur: "ui/builder/shell.mjs",
  /* ⚠️ LE TÉMOIN SUIT LA CLASSE, PLUS LA CHAÎNE ENTIÈRE — lot 143. La coquille
     compose maintenant le nom : `Cancel` prend `sortie-annule` (le rouge de ce
     qui abandonne), `Back` garde `sortie-back` (le bleu du recul), et NORMES le
     veut ainsi — *« les classes nomment des ACTES, pas des teintes »*.
     ⭐ CE QUE LE GARDE TIENT N'A PAS BOUGÉ : il compte les PORTEURS, pas la
     forme littérale. Un écran qui écrirait l'une ou l'autre de ces classes
     rougirait exactement comme avant. */
  classeBack: '"sortie-back"',
  classeAnnule: '"sortie-annule"',
  classeDone: '"sortie-bouton sortie-done"'
};

/** QUELS fichiers de `ui/` écrivent un motif — sans le compte. ⭐ Pour les
 *  garanties qui portent sur le PROPRIÉTAIRE (« un seul organe l'appelle ») et
 *  non sur un nombre d'appels, qui est un détail d'implantation appelé à
 *  bouger. Épingler le compte ferait rougir un garde pour une raison qui n'est
 *  pas la sienne. */
function fichiersDuLibelle(libelle) {
  return porteursDuLibelle(libelle).map((entree) => entree.replace(/ \([0-9]+\)$/, ""));
}

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
  assert.deepEqual(porteursDuLibelle(SORTIE_ETAPE.classeDone), [`${SORTIE_ETAPE.producteur} (1)`],
    "le `Done` de la SORTIE D'ÉTAPE doit exister EXACTEMENT une fois, et dans la coquille — c'est elle qui possède l'enchaînement des paliers (I.4)");
  /* ⚠️ ON GARDE LE FICHIER, PAS LE COMPTE : `pressDone` est appelé plusieurs
     fois DANS la coquille (le bouton, le `done` des fiches, le `ficheChoose`),
     et ce nombre bougera. Ce qui ne doit jamais bouger, c'est qu'aucun ÉCRAN
     ne l'appelle. Épingler le compte ferait rougir ce garde à chaque lot, pour
     une raison qui n'est pas la sienne. */
  assert.deepEqual(fichiersDuLibelle("pressDone()"), [SORTIE_ETAPE.producteur],
    "le verbe de l'avance n'est appelé QUE dans la coquille — c'est elle qui possède l'enchaînement des paliers (I.4)");
  /* 🗣️ `(hote)` DEPUIS LE 2026-09-05 : la paire lit la DÉCLARATION de son hôte
     (mot du retour, `Done` ou pas, verbe). Le producteur reste unique — c'est
     ce que cette ligne garde, pas sa signature. */
  assert.match(shellText, /function renderSortieEtape\((?:hote)?\)/,
    "et la paire a un producteur nommé : un écran qui la recopierait en ferait la sortie d'UN écran");
  /* ⚠️ CE QUE CETTE LIGNE GARDE A CHANGÉ DE FORME LE 2026-08-17, PAS DE FOND.
     La sortie ne se pose plus toujours au bas de la scène : un écran peut
     DÉCLARER qu'il l'héberge (`data-sortie-ici`, voir `poserLaSortie`), et le
     collecteur d'Abilities le fait — le croquis dessine `BACK`/`DONE` dans sa
     boîte. Ce qui doit rester vrai est ce que le garde visait déjà : elle est
     PRODUITE ici et RÉELLEMENT POSÉE dans la scène. On garde donc les deux
     bouts de la chaîne, sans figer l'endroit où elle atterrit. */
  /* ⚠️ CIBLE ÉLARGIE UNE 2ᵉ FOIS LE 2026-08-19, ET POUR LA MÊME RAISON QU'EN
     2026-08-17 : la scène a gagné un nœud DEVANT — le chapeau de chapitre
     (`renderChapitreIntro`, F3/FF3 d'Eric). La propriété gardée n'a pas
     bougé d'un pouce : la sortie est PRODUITE ici et RÉELLEMENT POSÉE dans
     la scène. On garde donc les deux bouts de la chaîne, et on cesse de
     garder l'ORDRE des nœuds qu'on passe — c'était le détail, pas la règle. */
  assert.match(shellText, /swapContent\(frame\.stage,[\s\S]{0,160}poserLaSortie\(renderStepContent\(\), renderSortieEtape\(\)\)/,
    "⛔ elle est réellement POSÉE dans la scène — écrite sans être appelée, elle ne serait qu'un placeholder de plus");
  /* ⚠️ ÉLARGI AU LOT 143 : un écran peut déclarer PLUSIEURS hôtes — le catalogue
     de Destiny en pose 22, une par fiche. Eric l'a vu avant moi, sur son iPad :
     *« les autres dalles n'ont que choose »*. La coquille déposait sa sortie
     dans le PREMIER hôte, et les 21 autres fiches n'avaient pas de retour.
     ⭐ LA RÈGLE GARDÉE N'A PAS BOUGÉ D'UN MOT : l'écran DÉCLARE, la coquille
     FABRIQUE. Elle en fabrique simplement autant qu'il y a d'hôtes — et une
     par une, jamais par clonage : un clone perdrait ses écouteurs, et un bouton
     muet est pire qu'un bouton absent. */
  assert.match(shellText, /const hotes = \[\.\.\.contenu\.querySelectorAll\("\[data-sortie-ici\]"\)\];/,
    "et l'écran ne fait que DÉCLARER ses hôtes — il ne fabrique toujours aucune sortie (garde 17)");
  assert.match(shellText, /if \(hotes\.length === 0\) return noeuds;/,
    "⛔ un écran qui ne déclare rien garde le pied au bas de la scène : les neuf autres ne bougent pas");
  assert.match(shellText, /hotes\.forEach\([\s\S]{0,140}?renderSortieEtape\((?:h)?\)/,
    "⛔ et les hôtes suivants reçoivent une sortie NEUVE, jamais un clone : " +
    "`cloneNode` ne recopie pas les écouteurs, et le bouton répondrait à rien");
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
  /* ⚠️ ÉLARGI LE 2026-08-19 : la dalle d'item échappe à l'effacement — elle
     n'est pas une fiche, c'est le cran le plus intérieur du parcours, et c'est
     la paire de la coquille qui l'en sort. Sans cette exception, un item
     s'ouvrait SANS AUCUNE PORTE — mesuré dans la page, pas déduit. */
  /* 🔴 RÉÉCRIT LE 2026-08-20 — LA BORNE ÉTAIT `!== 2`, ET ELLE A ROUILLÉ AU
     PREMIER CRAN AJOUTÉ. Le don d'origine a ouvert un 3ᵉ palier (BS, les sorts
     au glisser) : `!== 2` y était VRAI, donc l'écran s'ouvrait SANS AUCUNE
     PORTE — le défaut exact que l'exception de l'item avait corrigé la veille,
     revenu par l'autre bout. Ce que la ligne veut dire n'a jamais été « au
     palier 2 » mais « au-delà de la chaîne de fiches » ; elle le dit
     maintenant, et ce test l'exige sous cette forme.
     📌 La leçon vaut au-delà d'ici : une borne écrite en `!==` sur un compteur
     qui peut grandir est juste tant que personne n'ajoute un cran. */
  assert.match(shellText, /\.fiche && state\.palier < 2 && !state\.parcoursItem\) return null/,
    "le drapeau `fiche` décide, et TOUS les paliers profonds gardent leur pied — pas seulement le 2ᵉ");
  assert.doesNotMatch(shellText, /state\.palier !== 2/,
    "aucune borne de palier ne se réécrit en `!== 2` : le 3ᵉ palier existe depuis le don d'origine");
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
  assert.deepEqual(porteursDuLibelle(SORTIE_ETAPE.classeBack), [`${SORTIE_ETAPE.producteur} (1)`],
    "un retour posé par un ÉCRAN rouvrirait deux chemins — ce que I.5 interdit ; celui de la coquille les unifie");
  assert.deepEqual(porteursDuLibelle(SORTIE_ETAPE.classeAnnule), [`${SORTIE_ETAPE.producteur} (1)`],
    "⛔ et le retour qui ABANDONNE non plus : deux teintes, un seul producteur");
  assert.deepEqual(fichiersDuLibelle("pressBack()"), [SORTIE_ETAPE.producteur],
    "et le verbe du recul n'est appelé QUE dans la coquille — c'est lui, pas le mot affiché, qui fait le retour");
  /* ⭐ ET IL RECULE DU PLUS INTÉRIEUR VERS LE PLUS EXTÉRIEUR : c'est CET
     ORDRE qui tient la nuance du lot 79. Inversé, le bouton sauterait le
     sous-écran qu'on vient de traverser — précisément le retour qui manquait
     aux paliers.
     ⚠️ ÉLARGI AU LOT 82, PAS ASSOUPLI : le panneau de lore s'intercale AVANT
     le palier, parce qu'il vit DANS un palier. Trois crans au lieu de deux,
     et le garde les tient tous les trois dans l'ordre — un lore qui se
     fermerait après l'étape rendrait le catalogue d'un autre écran. */
  /* ⚠️ ÉLARGI LE 2026-08-19, PAS ASSOUPLI : la dalle d'ITEM s'intercale AVANT
     le lore, parce qu'elle est le cran le plus intérieur du parcours d'étape
     — un item vit dans un guide, qui vit dans un palier, qui vit dans une
     étape. Quatre crans, et le garde les tient tous les quatre DANS L'ORDRE.
     ⭐ Et c'est ce garde qui a refusé un premier jet où la dalle d'item
     dessinait sa PROPRE paire `BACK`/`DONE` : deux chemins de retour, ce que
     I.5 interdit. L'item déclare maintenant un hôte et reçoit celle de la
     coquille. */
  /* ⚠️ ÉLARGI AU LOT 143, PAS ASSOUPLI — quatrième fois, et toujours la même
     opération : **le CATALOGUE de Destiny** s'intercale entre le lore et le
     palier. Eric, 2026-09-03 : *« en B2 le back ramène à R »*.
     ⭐ POURQUOI LÀ ET PAS AILLEURS : B2 vit SOUS le R de son étape, comme le
     lore vit sous le palier. Reculer depuis le catalogue doit rendre le R —
     placé après le palier, le bouton sauterait par-dessus l'écran qu'on vient
     de traverser, le défaut exact que le lot 79 avait relevé.
     ⛔ ET CE GARDE A FAIT SON TRAVAIL : il a refusé un premier jet où
     `destiny-step` dessinait son PROPRE bouton `Back` à côté de `Choose`. La
     demande d'Eric était juste, le chemin ne l'était pas — la rangée déclare
     maintenant `data-sortie-ici` et reçoit le retour de la coquille, comme la
     dalle d'item depuis le 19/08. Cinq crans, tenus DANS L'ORDRE. */
  assert.match(shellText, /function pressBack\(\) \{[\s\S]{0,600}?if \(state\.parcoursItem\)[\s\S]{0,400}?if \(state\.lore\)[\s\S]{0,1400}?retourInterne[\s\S]{0,400}?if \(state\.palier > 1\)/,
    "⛔ l'ITEM, le LORE, le CATALOGUE de Destiny, puis le PALIER, puis l'ÉTAPE — " +
    "du plus intérieur au plus extérieur, et cet ordre ne s'inverse pas");
  /* 🔴 RÉÉCRIT LE 2026-08-20. Ce garde interdisait `"Back"` en capitale douce,
     parce que c'était le libellé de la LIGNE DE COMMANDE disparue, et que la
     paire du croquis écrivait `BACK`. Eric a tranché la casse le même jour
     (*« done »*, pas `DONE`) : le mot en capitale douce est désormais celui de
     la paire elle-même.
     ⭐ CE QUE LE GARDE PROTÉGEAIT VRAIMENT — pas une casse, mais l'absence d'un
     SECOND organe de retour — n'a pas bougé d'un pouce : il l'exige maintenant
     sous la forme qui le dit, « une fois, et dans la coquille ».
     ⚠️ Un garde écrit contre une ORTHOGRAPHE devient faux le jour où
     l'orthographe change de camp. Écrit contre un PROPRIÉTAIRE, il tient. */
  assert.deepEqual(porteursDuLibelle('"Back"'), [`${SORTIE_ETAPE.producteur} (1)`],
    "`Back` est le mot de la paire, écrit UNE fois et par la coquille — jamais par un écran");
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

test("21 — ⛔ UN CATALOGUE DÉCLARE PAR OÙ IL SORT, et un guide porte SON pied", () => {
  /* 🔴 DEUX RÈGLES NÉES DU MÊME ÉCRAN, le 2026-08-20 (Eric) : *« la fin de la
     validation doit plutôt ramener au menu racine, où les bonus doivent aussi
     être validés »*, et *« quand la pastille bonus et la pastille feat est
     verte, [je veux] un petit prompt vert et un Next à la place du Done »*. */

  /* ① LA SORTIE D'UN ITEM À BRANCHES REMONTE, ELLE NE CHANGE PAS D'ÉTAPE.
     🔴 RÉÉCRIT AU LOT 77 — Eric, 2026-08-28 : le don n'est plus un catalogue
     (*« le choix des feats ça devient un choix de token »*), donc `fin:
     "close"` n'existe plus. La règle d'origine, elle, SURVIT mot pour mot :
     *« la fin de la validation doit ramener au menu racine »* — c'est
     désormais le B EMBOÎTÉ qui la porte, par trois faits :
       · `parentDeLItem` : fermer un SOUS-item rend le B du don, jamais le
         guide de l'étape deux crans plus haut ;
       · le `parcoursNext` d'une racine EMBOÎTÉE signe l'item et remonte au
         guide — il n'avance jamais l'étape ;
       · un item à sous-décisions ne se SIGNE pas à moitié : son Done refuse
         et nomme, comme celui du guide. */
  assert.match(shellText, /function parentDeLItem\(/,
    "fermer un sous-écran du don rend son B emboîté — le parent est calculé, jamais null en dur");
  /* ⚠️ RÉÉCRIT LE 2026-09-02 — L'INVARIANT NE BOUGE PAS, SON ORTHOGRAPHE SI.
     Cette clause épelait l'implémentation : `action.racine !==
     parcoursRacineCourante()`. Or cette écriture était FAUSSE — elle répond
     « emboîté » à toute étape SANS parcours, parce que la fonction y rend
     `null`, et elle tuait le `Next` d'Identity (mesuré à l'écran : deux clics,
     le cran ne bougeait pas). ⛔ Le garde tenait donc le défaut en place : il
     aurait rougi sur la CORRECTION.
     ⭐ Il vise maintenant le PRÉDICAT NOMMÉ, pas sa formule — et il tient les
     DEUX moitiés du `parcoursNext`, là où il n'en tenait qu'une. C'est cette
     moitié manquante qui a laissé vivre le défaut : personne ne vérifiait que
     le cas NON emboîté avançait. */
  assert.match(shellText, /parcoursNext[\s\S]{0,900}?racineEmboitee\(action\.racine\)[\s\S]{0,200}?state\.parcoursItem = null/,
    "le Next d'un B emboîté signe l'item et remonte au guide — il ne change pas d'étape");
  assert.match(shellText, /parcoursNext[\s\S]{0,1400}?goToStep\(state\.step \+ 1\)/,
    "🔴 et le Next d'un bilan NON emboîté avance d'une étape — la moitié que personne ne gardait");
  assert.match(shellText, /refusDuDone\(\{[\s\S]{0,120}?racine: ouvert\.path[\s\S]{0,300}?parcoursRefus = refusItem\.manquants/,
    "un item à branches ne se signe pas à moitié : le Done refuse et NOMME, comme au guide");
  /* ⚔️ LE TÉMOIN : Class reste une étape — son parcoursNext passe par
     `goToStep`, et rien ne déclare plus de `fin: "close"` nulle part. */
  assert.doesNotMatch(shellText, /fin: "close"/,
    "plus aucun catalogue ne « se ferme » : l'emboîtement du parcours a remplacé le mécanisme");

  /* ② LE PIED APPARTIENT AU GUIDE QUAND IL Y EN A UN. Mesuré à l'écran sur
     l'Inheritance le 19/08 : un `Done` FLOTTAIT sous la dalle pendant que le
     guide affichait déjà « I changed my mind · Next ». Deux validations pour un
     geste, ce qu'Eric a fait sauter le 19/08.

     🔴 CE GARDE A LAISSÉ PASSER LA MOITIÉ DU DÉFAUT, ET IL FAUT LE DIRE : sa
     version du 19/08 exigeait le texte EXACT `&& !fiche)`, en affirmant en
     commentaire que « Species et Class y échappaient par le drapeau `fiche` ».
     C'était faux à un mot près — le drapeau ne les couvre qu'AU PALIER 1, et le
     guide s'ouvre au palier 2. Résultat mesuré le 20/08 à 360 px, Fighter,
     juste après `Choose` : la dalle portait « I changed my mind · Next » et
     « Back · Done » flottait dessous. Le garde était vert.
     ⚠️ ET LE FLOTTANT N'ÉTAIT PAS UN DOUBLON INOFFENSIF : c'est le `Done` du
     PALIER, il avance d'une étape SANS signer la racine — le joueur quittait
     donc Class sans jamais voir sa conclusion. C'est exactement ce qu'Eric a
     rapporté (*« il devrait y avoir une phase bilan dans les classes aussi,
     avec un next »*).

     ⭐ CE QUE CE GARDE TIENT MAINTENANT, ET POURQUOI CE N'EST PLUS LE MÊME
     OBJET : il ne demande plus UNE EXPRESSION, il demande LES TROIS FAITS qui
     font la règle. Un garde écrit sur la forme exacte d'une condition rougit
     quand on la corrige et reste vert quand elle a tort — les deux fois dans le
     mauvais sens. */
  assert.match(shellText, /if \(!state\.parcoursItem && !state\.lore\) \{[\s\S]{0,600}?parcoursRacineCourante\(\)/,
    "la sortie de la coquille s'efface sur un guide de parcours — écrit sur le FAIT, pas sur un id d'étape");
  assert.match(shellText, /function parcoursRacineCourante\(\)/,
    "et la racine du parcours courant a UNE source pour les deux familles (catalogue et Inheritance)");
  /* ⚔️ BORNE 1 — UNE DALLE D'ITEM GARDE SA PAIRE : c'est le cran le plus
     intérieur du parcours, et c'est la coquille qui l'en sort. Sans elle,
     l'item s'ouvre sans aucune porte (le défaut mesuré le 19/08). */
  assert.match(shellText, /if \(!state\.parcoursItem && !state\.lore\)/,
    "⛔ jamais dans une dalle d'item, jamais sous le lore");
  /* ⚔️ BORNE 2 — UN PANNEAU OUVERT PAR-DESSUS LE GUIDE GARDE SA PAIRE (le don
     d'origine, BS, BSS laissent l'étape en état « guide »). Mais la borne se
     pose sur l'APPARTENANCE du panneau, pas sur sa PRÉSENCE : le catalogue du
     don porte `background.originFeat[0]` quand la racine est `background` — il
     est étranger ; celui de Class porte `class`, qui EST la racine — c'est le
     guide lui-même. La version `!fiche` confondait les deux cas. */
  assert.match(shellText, /const panneauEtranger = Boolean\(fiche\) && fiche\.path !== racine;/,
    "⛔ bornée par l'APPARTENANCE du panneau ouvert, pas par sa présence");
  assert.match(shellText, /if \(racine && !panneauEtranger\) \{/,
    "et c'est cette borne-là que la règle consulte");
  assert.doesNotMatch(shellText, /!state\.lore && !fiche\)/,
    "⛔ TÉMOIN : la borne `!fiche` est la version qui laissait Species et Class doubler leur pied au palier 2");
});

test("16 ter — ⛔ LE PIED EST UNE PAIRE, ET ELLE TIENT SUR UNE LIGNE (la condition des 76 px)", () => {
  /* Le pied se construit en une expression : deux boutons AU PLUS, jamais
     trois. Un troisième ajouterait 42 px de rembourrage à lui seul.
     ⚠️ « AU PLUS » DEPUIS LE 2026-08-17, et c'est un ASSOUPLISSEMENT DANS LE
     BON SENS : `BACK` n'existe plus que là où il y a un palier à quitter
     (Eric, sur Universe puis sur Concept — invariant I.5 rendu entier). Un
     pied à UN bouton tient évidemment la ligne que ce garde protège ; ce qui
     resterait un défaut, c'est un TROISIÈME. Le motif garde donc la forme
     exacte de l'expression, `.filter(Boolean)` compris — écrire `[back, done,
     autre]` la ferait rougir comme avant. */
  assert.match(shellText, /return el\("div", "sortie", \[back, done\]\.filter\(Boolean\)\);/,
    "⛔ DEUX boutons au plus dans le pied — un troisième ferait passer la paire à deux lignes, et les 76 px avec");
  /* ⚠️ ÉLARGI LE 2026-08-19, PAS ASSOUPLI : une dalle d'ITEM est un cran de
     plus à l'intérieur (parcours d'étape), donc « y a-t-il quelque chose
     derrière ? » y répond oui elle aussi. La règle gardée n'a pas bougé —
     `BACK` naît d'un FAIT, jamais d'un id d'étape — et le pied reste une
     PAIRE : la ligne juste au-dessus continue de l'exiger. */
  /* ⚠️ ÉLARGI LE 2026-08-19 : le bouton porte DEUX mots selon l'endroit —
     « CANCEL » dans une dalle d'item (Eric : quitter un item n'est pas reculer
     d'un cran, c'est abandonner ce qu'on y faisait), « BACK » partout
     ailleurs. La règle gardée n'a pas bougé : il naît d'un FAIT, il est POSÉ
     PAR LA COQUILLE, et le pied reste une PAIRE. C'est le mot qui varie, pas
     le producteur ni le compte. */
  /* ⚠️ ÉLARGI AU LOT 143, PAS ASSOUPLI — et ce garde a fait exactement son
     travail. Le catalogue de Destiny s'ouvre DEPUIS le R de son étape : il y a
     donc quelque chose derrière, et `Back` doit exister. Mon premier jet
     l'écrivait `STEPS[state.step].id === "destiny"` — un ID D'ÉTAPE, ce que la
     ligne ci-dessous interdit depuis toujours, et le garde l'a refusé.
     ⭐ LE FAIT EST DÉCLARÉ PAR LA TABLE DES CATALOGUES (`retourInterne`), et
     `catalogueCourant()` ne rend cette config que quand ce catalogue est
     OUVERT. Species ne le déclare pas : son catalogue EST l'entrée de son
     étape, et c'est la ceinture qui l'y ramène. La règle n'a pas bougé d'un
     mot — `Back` naît d'un FAIT, et le pied reste une PAIRE. */
  /* 🏁 ÉLARGI LE 06/09, PAS ASSOUPLI — même famille que le lot 143 : le bilan
     d'Abilities (R2) vit AU PALIER 1 et son `Cancel` rend le choix (R1). Le palier
     ne le voit pas ; l'hôte le DÉCLARE (`data-sortie-verbe`) — un fait, pas un
     id d'étape, et la ligne d'après continue de l'interdire. */
  assert.match(shellText, /const back = \(state\.palier > 1 \|\| state\.parcoursItem \|\| \(cfgRetour && cfgRetour\.retourInterne\) \|\| decl\.sortieVerbe\) \? button\(motDuRetour/,
    "⭐ et le retour ne naît que s'il y a quelque chose derrière — un palier, un item, un catalogue interne, ou un verbe DÉCLARÉ par l'hôte : entre étapes, c'est la ceinture qui ramène (I.5)");
  assert.doesNotMatch(shellText, /const back = [^\n]*STEPS\[state\.step\]\.id/,
    "⛔ et jamais d'un ID D'ÉTAPE : le jour où un écran veut son retour, il déclare un FAIT");
  /* 🔴 LE TÉMOIN DE LA DISTINCTION — Eric, 2026-08-20 : *« back n'efface pas ;
     pour effacer, c'est cancel ou i changed my mind »*. Les deux mots de la
     coquille NE DOIVENT PAS être celui du guide : ce bouton-ci recule ou
     abandonne, il ne révoque jamais. Les confondre promettrait un effacement
     qui n'arrive pas — la faute que ce garde existe pour rendre impossible. */
  /* 🔴 TROIS MOTS, ET CHACUN DIT SON GESTE (Eric, 2026-08-20, en deux temps) :
       · `Cancel`            abandonne une dalle d'item — rien n'y sera signé ;
       · `I changed my mind` EFFACE et remonte — le retour d'une branche, qui
                             rend la liste des dons pour en rechoisir un ;
       · `Back`              recule sans rien effacer, partout ailleurs.
     ⚠️ LE MOT QUI EFFACE NE S'ÉCRIT QUE LÀ OÙ ÇA EFFACE VRAIMENT : c'est la
     correction d'Eric du jour, et ce garde la tient en exigeant que le mot soit
     lié au drapeau `retourEfface`, jamais posé au hasard d'un écran. */
  /* ⚠️ ÉLARGI AU LOT 143, PAS ASSOUPLI — et les TROIS MOTS n'ont pas bougé.
     Eric, 2026-09-03 : *« cancel / choose »* au catalogue de Destiny. `Cancel`
     y a exactement le sens que ce garde lui donne : on ABANDONNE la lecture des
     vingt-deux, rien n'a été posé au document, donc rien n'est effacé.
     ⭐ CE QUI CHANGE EST QUI CHOISIT LE MOT, PAS QUELS MOTS EXISTENT : la TABLE
     des catalogues peut désigner lequel des trois s'applique chez elle. C'est le
     même remède que `retourEfface` deux lignes plus bas — un fait DÉCLARÉ, pas
     un id d'étape lu à la volée. Un quatrième mot resterait interdit : le
     garde ci-dessous vérifie que le vocabulaire n'a pas grandi. */
  /* ⚠️ RÉÉCRIT LE 2026-09-05 — CE GARDE ÉPELAIT LA TERNAIRE MOT POUR MOT. Il a
     donc rougi quand Eric a dit *« remplace par cancel partout »*, alors que la
     propriété qu'il défend — LE MOT SUIT LE GESTE — n'avait pas bougé d'un pouce.
     ⭐ ERIC A ÉNONCÉ LA LOI LE MÊME JOUR, ET C'EST ELLE QU'ON GARDE :
         « back = navigation = bleu · cancel = annulation = rouge »
         « back n'annule rien »
     DEUX mots, pas trois : `Cancel` et `I changed my mind` étaient déjà la même
     famille au corpus (DÉFAIRE, rouge) et ne se distinguaient que par leur
     DESTINATION — jamais par leur verbe.
     🔴 ET LA FUSION A RÉPARÉ UN DÉFAUT VIVANT : la teinte se déduit du MOT
     (`motDuRetour === "Cancel"`), donc `I changed my mind` — qui EFFACE —
     recevait `sortie-back`, c'est-à-dire du BLEU, la couleur de la navigation.
     Un bouton qui détruit du travail était peint comme un bouton qui recule. */
  assert.match(shellText, /\(state\.parcoursItem \|\| effaceAuRetour\) \? "Cancel"/,
    "⛔ un retour qui ABANDONNE ou qui EFFACE se dit `Cancel` — c'est de l'annulation, pas de la navigation");
  assert.match(shellText, /motDuRetour === "Cancel" \? "sortie-annule" : "sortie-back"/,
    "⛔ LA TEINTE SE DÉDUIT DU MOT : `Cancel` → `sortie-annule` (rouge) · sinon `sortie-back` (bleu)");
  assert.doesNotMatch(shellText, /motDuRetour\s*=\s*[^;]*"I changed my mind"/,
    "⛔ `I changed my mind` ne nomme plus aucun retour depuis le 2026-09-05");
  /* ⛔ ET LE VOCABULAIRE NE GRANDIT PAS : les mots qu'un catalogue peut déclarer
     sont ceux que ce garde nomme, pas un libellé neuf inventé dans une table. */
  for (const m of (shellText.match(/motDuRetour: "[^"]+"/g) || [])) {
    assert.ok(/"(Cancel|Back)"/.test(m),
      `${m} — un catalogue ne peut DÉSIGNER que l'un des DEUX mots (Cancel, Back), jamais en créer un troisième`);
  }
  assert.match(shellText, /cfgRetour\.retourEfface && state\.palier === 2/,
    "et « effacer » est DÉCLARÉ par le catalogue, jamais deviné d'un id d'étape");
  assert.match(shellText, /function oublierSousLaRacine\(racine\)/,
    "⭐ et il efface pour de vrai — signatures ET choix, comme le `Cancel` du guide (canon §5)");
  /* Et le budget de libellé, proxy assumé (voir l'en-tête). */
  const libelles = [SORTIE_ETAPE.cancel, SORTIE_ETAPE.done].map((l) => l.replace(/"/g, ""));
  const total = libelles.join("").length;
  /* 🔴 LE BUDGET EST PASSÉ DE 24 À 22 LE 2026-08-20, ET IL A ÉTÉ RECALIBRÉ SUR
     LE BON CHAMP. L'ancien nombre était mesuré sur le champ le plus LARGE
     (344 px, le bas de scène) ; il a dit OUI aux libellés d'Eric — 21 ≤ 24 —
     alors que dans le champ le plus ÉTROIT, la dalle d'item de Class à
     **234 px**, `Done` sortait de sa boîte de **28 px**. Un proxy ne vaut que
     dans le cas où on l'a mesuré, et celui-ci était calibré sur le cas facile.
     📏 Recalibré sur l'étroit, rembourrage nommé compris (`.sortie
     .sortie-bouton`, --sp-8) : 21 caractères rendent 159 + 56 + 8 = 223 px
     pour 234 disponibles — **4 px de mou**. Un caractère de plus les mange. */
  assert.ok(total <= 22,
    `les libellés du pied font ${total} caractères : au-delà de 22, la paire déborde les 234 px du champ le plus ÉTROIT (dalle d'item à 360) — mesuré, 4 px de mou pour 21 caractères`);
  /* ⚔️ LE TÉMOIN : le budget n'est pas si large qu'il ne puisse jamais mordre.
     Des libellés traduits plausibles (« RETOUR » / « TERMINER ») passent ; un
     pied bavard ne passe pas. */
  assert.ok("RETOURTERMINER".length <= 22, "une traduction raisonnable tient dans le budget");
  assert.equal("REVENIR EN ARRIERE".length + "VALIDER CETTE ETAPE".length <= 22, false,
    "et un pied bavard le dépasse — le garde n'est pas si lâche qu'il ne dise jamais non");
  /* ⚔️ ET LE TÉMOIN DE LA RECALIBRATION : les libellés d'Eric passaient sous
     l'ancien budget et débordaient pourtant. Sous le nouveau, ils passent tout
     juste — un mot de plus ne passerait pas. */
  /* 🔴 CE GARDE ÉTAIT CREUX, ET IL A VÉCU SEIZE JOURS — réparé le 2026-09-05.
     Il s'écrivait `assert.equal(X, false === true ? true : X)`. `false === true`
     est une constante fausse : le ternaire rend TOUJOURS son `else`, qui est la
     MÊME expression que le premier argument. Donc `assert.equal(X, X)` — ⛔ un
     garde qui ne peut JAMAIS rougir, quoi qu'on lui donne.

     ⭐ ET C'EST LA TAUTOLOGIE QUI A LAISSÉ MENTIR LE MESSAGE. Il annonçait « le
     nouveau le refuse » ; mesuré : 21 ≤ 22, donc il l'ACCEPTE. Le commentaire
     trois lignes plus haut disait déjà le contraire (« ils passent tout juste »),
     et les deux ont cohabité sans se contredire — parce qu'une assertion qui ne
     s'exécute jamais vraiment ne confronte jamais son message à son voisin.
     📌 La leçon générale est déjà au corpus : un garde n'est vert qu'après avoir
     été vu ROUGE. Celui-ci n'avait jamais pu l'être.

     ⛔ ET LA FAUSSE ALARME DU 06/09, ÉCRITE ICI POUR QU'ON NE LA REPOSE PAS.
     L'architecte a lu « il tient encore sous 22 » et en a conclu que le budget
     ne refusait pas le cas qui l'a fait naître, donc qu'il était trop lâche.
     C'EST FAUX, et la réponse était douze lignes plus haut : 22 n'a JAMAIS été
     choisi pour refuser ce libellé. Il a été choisi parce que, une fois le
     rembourrage nommé et la mesure refaite sur le bon champ, **21 caractères
     rendent 223 px pour 234 disponibles — 4 px de mou, et un caractère de plus
     les mange.** Le libellé ne débordait pas à cause de sa LONGUEUR, il
     débordait parce que le proxy était calibré sur le champ le plus LARGE.
     ⭐ Donc 22 est exact : 21 passe avec 4 px, 23 déborde. Rien à arbitrer.
     📌 La leçon : quand un garde a l'air incohérent, LIRE SON EN-TÊTE AVANT
     d'accuser son chiffre — ici la démonstration complète était déjà écrite,
     au-dessus, dans le même bloc.

     📌 ET LE MOT EST MORT DEPUIS LE 05/09 : l'organe s'appelle `Cancel`, donc
     `CancelDone` fait 10. Le témoin reste écrit avec l'ANCIEN libellé, et c'est
     voulu — c'est un témoin HISTORIQUE, daté, qui documente pourquoi le budget
     vaut 22. Le réécrire au mot d'aujourd'hui lui ferait mesurer un cas qui n'a
     jamais débordé, et la démonstration disparaîtrait. */
  assert.equal("I changed my mindDone".length > 22, false,
    "le témoin historique de la recalibration : 21 caractères, il PASSE sous 22 — " +
    "et c'est JUSTE : 223 px mesurés pour 234 disponibles, 4 px de mou");
});

test("16 quater — ⭐ UNE RACINE QUI BRANCHE N'A PAS DE SORTIE, et c'est CH6 étendu", () => {
  /* Eric, 2026-08-16 : *« la page racine n'a pas besoin de BACK ou DONE, car
     elle est à la racine et donne des branches »*. Un écran dont la page
     courante n'offre qu'un AIGUILLAGE n'a rien à valider — ses tuiles SONT le
     geste, exactement comme `CHOOSE` est le geste d'une fiche (CH6). Poser un
     `DONE` éteint à côté de quatre boutons qui mènent quelque part, c'est
     offrir une porte morte à côté de quatre portes vivantes.
     ⛔ Et `BACK` n'y manque pas : entre ÉTAPES, la ceinture porte le retour —
     l'argument d'origine de I.5. `BACK` ne gagne sa place que là où il n'y a
     pas de ceinture, c'est-à-dire dans une page de palier (lot 79 §4.1 bis). */
  assert.match(shellText, /if \(surUneRacineQuiBranche\(\)\) return null;/,
    "la sortie s'efface sur une page qui ne fait que brancher");
  /* ⚠️ `< 2` DEPUIS LE 2026-08-20 — l'écriture a changé, la règle non : Abilities
     n'a que deux paliers, donc `!== 2` et `< 2` y disaient la même chose. Ce qui
     a changé est ailleurs : un 3ᵉ palier EXISTE maintenant (les sorts d'un don),
     et une borne qui nomme un palier rouille au premier cran ajouté. */
  /* 🏁 06/09 — la racine d'Abilities qui porte le BILAN (R2) ne branche plus :
     elle a une sortie (`Next`, `Cancel`). Le drapeau est celui de la coquille. */
  assert.match(shellText, /function surUneRacineQuiBranche\(\) \{[\s\S]*?return STEPS\[state\.step\]\.id === "abilities" && state\.palier < 2 && !state\.abilityBilan;/,
    "…et la condition est NOMMÉE, pas un `if` anonyme de plus dans le rendu");
  /* ⚔️ ET ELLE EST BORNÉE : c'est la RACINE qui n'a pas de sortie, pas
     l'étape. La page d'une méthode (palier 2) garde la sienne — sans quoi
     Abilities deviendrait une impasse. */
  assert.equal(/id === "abilities"\) return null/.test(shellText), false,
    "⛔ jamais l'étape entière : le palier 2 doit garder sa sortie, sinon on ne peut plus avancer");
});

test("17 bis — ⚔️ ATTAQUE : un écran qui poserait sa propre sortie fait rougir 16 bis et 17, eux seuls", () => {
  /* Le geste exact qu'on redoute — un lot qui « ajoute juste un bouton » au
     pied de son écran plutôt que d'employer celui de la coquille. */
  /* ⚠️ L'ATTAQUE A ÉTÉ RÉÉCRITE LE 2026-08-20 : recopier le LIBELLÉ n'est plus
     une faute (le pied du guide le porte légitimement), recopier l'ORGANE en
     est une. Le geste redouté est donc bien celui-ci — un écran qui rebâtit la
     paire de la coquille, classe et verbe compris. */
  const ecranFautif = 'const b = button("Done", () => pressDone()); b.className = "sortie-bouton sortie-done";'
    /* ⚠️ L'ATTAQUE SUIT LA FORME COURANTE — lot 143 : la coquille compose
       désormais le nom de classe (`sortie-back` ou `sortie-annule` selon
       l'acte), donc le témoin est la classe seule, pas la chaîne complète. */
    + ' const r = button("I changed my mind", () => pressBack()); r.className = "sortie-back";';
  assert.equal(ecranFautif.includes(SORTIE_ETAPE.classeDone), true, "l'attaque rebâtit bien la sortie `Done`");
  assert.equal(ecranFautif.includes(SORTIE_ETAPE.classeBack), true, "et le retour de la coquille");
  assert.equal(ecranFautif.includes("pressBack()"), true, "avec le verbe qui n'appartient qu'à elle");
  /* Et les gardes VOISINS ne bougent pas : l'attaque n'introduit aucun
     `Validate`, ne touche ni le câblage du rail ni le bornage par REVIEW_INDEX. */
  assert.equal(ecranFautif.includes('"Validate"'), false);
  assert.match(shellText, /Math\.min\(REVIEW_INDEX, index\)/);
});

test("22 — 🔴 LE PERSONNAGE SURVIT AU RECHARGEMENT, et la sauvegarde se voit", () => {
  /* 📏 MESURÉ SUR LE SITE DÉPLOYÉ LE 2026-08-20, avant ce lot : choisir
     Fighter, recharger, retomber sur **Wizard** — le personnage d'exemple
     commité — avec `localStorage` vide avant ET après. Tout ce que le joueur
     faisait mourait avec l'onglet.
     Eric : *« Un perso est enregistré dans le navigateur de tout le monde, et
     disparaît s'il n'est pas enregistré s'il y a un reset. »* */

  /* ① LE DÉMARRAGE PRÉFÈRE LE PERSONNAGE GARDÉ — l'exemple n'est plus que le
     repli. ⛔ Le contraire (charger l'exemple et l'écraser ensuite) écrirait
     l'exemple par-dessus le personnage du joueur au premier repeint. */
  assert.match(shellText, /const garde = lirePersonnage\(\);[\s\S]{0,400}?state\.document = garde\.etat === "lu" \? garde\.document : exemple;/,
    "le navigateur rend son personnage ; l'exemple ne sert que s'il n'y en a pas");

  /* ② UNE PERTE NE SE TAIT PAS (loi §0.5). Un personnage gardé mais illisible
     laisse un message, sinon le joueur repart de l'exemple en croyant n'avoir
     jamais rien construit. */
  assert.match(shellText, /if \(garde\.etat === "refus"\) state\.memoireIgnoree = garde\.raison;/,
    "⛔ jamais un repli silencieux sur l'exemple");

  /* ③ LA SAUVEGARDE VIT DANS `refresh`, ET PAS DANS `rebuild` — et c'est une
     propriété, pas un goût : `rename`, `describe`, `confirm` et `revoke`
     écrivent le document puis appellent `refresh()` SANS repasser par
     `rebuild`. Une sauvegarde posée dans `rebuild` perdrait le NOM du
     personnage, c'est-à-dire le premier champ que le joueur remplit. */
  assert.match(shellText, /function refresh\(\) \{\s*memoriser\(\);/,
    "mémoriser d'abord, peindre ensuite — le Menu affiche l'état de CE tour");
  assert.doesNotMatch(shellText, /function rebuild\(\)[\s\S]{0,1200}?memoriser\(\)/,
    "⛔ TÉMOIN : dans `rebuild`, la sauvegarde manquerait tous les gestes d'écriture de document");

  /* ④ ON N'ÉCRIT QUE CE QUI A CHANGÉ. `refresh` passe aussi sur `resize` :
     sans cette comparaison, tourner le téléphone écrirait le personnage. */
  assert.match(shellText, /const texte = canonicalText\(state\.document\);\s*if \(texte === dernierTexteGarde\) return;/,
    "tourner le téléphone repeint et n'écrit rien");

  /* ⑤ LE MÊME TEXTE QUE L'EXPORT, PAR LA MÊME FONCTION. Deux sérialisations
     donneraient deux personnages identiques que rien ne reconnaîtrait comme
     tels — et la comparaison du ④ ne tiendrait plus. */
  assert.match(shellText, /import \{ canonicalText \} from/,
    "une seule sérialisation dans toute la coquille");

  /* ⑥ L'ÉCRAN REÇOIT L'ÉTAT, IL NE VA PAS LE CHERCHER — même loi que le
     tutoriel : un écran qui lirait `localStorage` deviendrait intestable. */
  assert.match(shellText, /memoire: state\.memoire,\s*memoireIgnoree: state\.memoireIgnoree/,
    "le Menu reçoit l'état de la mémoire");
  const universeText = stripComments(fs.readFileSync(path.join(UI_DIR, "universe-step.mjs"), "utf8"));
  assert.doesNotMatch(universeText, /localStorage/,
    "⛔ aucun écran ne lit le magasin lui-même");
});

/* ══ 18. 🔲 TOUTE RANGÉE DE CONTRÔLES EST CADRÉE, PAR UN SEUL POINT ═══════════
   Eric, 2026-09-04, après TROIS réparations partielles : *« c'est toujours pas
   bon »*. Le défaut a survécu deux fois parce que le cadrage était posé là où
   on CONSTRUIT une rangée, et qu'il existait à chaque fois un chemin de plus.

   📏 CE QUE ÇA DONNAIT, MESURÉ EN LIGNE EN v527 : sur Skills, `poserLaSortie`
   sort par son retour anticipé (`hotes.length === 0`), la rangée part en frère
   de la carte et n'a traversé NI `renderCard` NI `garnirLaSortie`. Grille à
   trois colonnes, un enfant sans groupe → placement automatique en colonne 1,
   celle du livre : `Done` rendu **44×44**, `scrollWidth` 55 pour `clientWidth`
   44 — libellé rogné. 1777 tests étaient verts.

   ⭐ CE QUE CE GARDE EXIGE : le cadrage est appelé sur `frame.stage` APRÈS le
   `swapContent`, c'est-à-dire au moment où le contenu ENTRE DANS LE DOCUMENT.
   C'est le seul point par lequel tout chemin passe, présent ou futur.
   ⛔ Il ne vérifie pas QU'IL EXISTE un appel — il vérifie qu'il est au point de
   passage obligé. Un appel de plus ailleurs ne le dérange pas (le cadrage est
   idempotent) ; c'est celui-ci qui ne doit jamais disparaître. */
test("18 — le cadrage des rangées se fait à l'entrée dans le document", () => {
  const t = stripComments(shellText);
  assert.match(t, /swapContent\(frame\.stage,[^;]*\);\s*cadrerLesRangees\(frame\.stage\);/,
    "⛔ `cadrerLesRangees(frame.stage)` doit suivre IMMÉDIATEMENT le `swapContent` de la scène : " +
    "c'est le seul point que TOUT chemin traverse. Posé ailleurs, il rate les rangées greffées " +
    "après la carte (Identity) et celles qui sortent par le retour anticipé de `poserLaSortie` (Skills).");
  /* ⑵ ET LE CADRAGE NE DOIT PAS LAISSER UN MAJEUR HORS DU GROUPE : c'est la
     forme même de la fonction qui le garantit — tout enfant qui n'est pas une
     borne entre dans `.rangee-majeurs`. Le garde lit la LOI, pas le résultat. */
  assert.match(t, /const BORNES = "\.fiche-livre, \.tuto-point";/,
    "les deux bornes sont nommées une seule fois");
  /* 📌 ANCRE ÉLARGIE LE 2026-09-05 : la LISTE lue a changé — elle aplatit
     désormais les boîtes `display: contents` (une `.sortie` dissoute affiche ses
     enfants comme enfants de la rangée, mais `children` rend la BOÎTE ; elle
     entrait donc dans le groupe avec le `?` dedans, groupe décentré de 43 blg).
     ⭐ CE QUE LE GARDE EXIGE N'A PAS BOUGÉ D'UN POUCE : le FILTRE est
     exactement `!n.matches(BORNES)`, sans condition ajoutée. C'est la loi —
     tout ce qui n'est pas une borne entre dans le groupe. Ce qui change est la
     SOURCE de la liste, pas le critère. */
  /* 📌 ANCRE RÉÉLARGIE LE 2026-09-05 : le filtre exclut aussi le GROUPE lui-même,
     parce que le cadrage est devenu complétant — il reprend un groupe existant
     au lieu de rendre la main, et sans cette exclusion il se remettrait dedans.
     ⭐ La LOI ne bouge pas : `!n.matches(BORNES)` reste le critère, et la seule
     exclusion tolérée est celle du contenant lui-même — jamais un organe. */
  assert.match(t, /const majeurs = [A-Za-z\[\].\s]*\.filter\(\(n\) => !n\.matches\(BORNES\)(?: && !n\.matches\("\.rangee-majeurs"\))?\);/,
    "⛔ TOUT ce qui n'est pas une borne entre dans le groupe — sans exception listée : " +
    "une exception par nom se périme au premier organe neuf (leçon `Draw`/`Choose`, même classe).");
});

/* ══ 19 — L'ABSOLU : LE LIVRE ET LE « ? » DANS LA **DERNIÈRE** RANGÉE
   🔴 ERIC, 2026-09-04 : *« livre et `?` toujours dans la dernière rangée.
   Dernière rangée de boutons = `?` et livre dedans. C'est un absolu. »*

   ⛔ CE QUE ÇA A REMPLACÉ : **TROIS écrivains** posaient ces deux bornes —
   `renderStepContent` (le `?`), `poserLaSortie` (le livre), `garnirLaSortie`
   (les deux, avec quatre lectures en cascade). Ils se rattrapaient l'un
   l'autre : le résultat était juste, la règle ne l'était pas.
   ⛔ ET AUCUN NE CHERCHAIT LA **DERNIÈRE** : les deux lectures employaient
   `querySelector`, qui rend la PREMIÈRE. Tant qu'un écran ne portait qu'une
   rangée, les deux mots désignaient le même nœud et la loi tenait PAR
   COÏNCIDENCE. R Abilities en porte deux depuis le 04/09 — c'est le premier
   écran du dépôt où la coïncidence cesse.

   📏 CE QUE LE PASSAGE UNIQUE REND, mesuré sur la page : le `?` en colonne 3
   sur les huit écrans qui portent une rangée ; sur les catalogues à douze
   fiches (Species, Class), **12 rangées, 12 `?`, 12 livres, zéro hors rangée,
   zéro rangée qui en porte deux**. */
test("19 — l'absolu : les deux bornes vont dans la DERNIÈRE rangée, et un seul écrivain les place", () => {
  const t = stripComments(shellText);

  /* ① LA DERNIÈRE, PAS LA PREMIÈRE. */
  assert.match(t, /function derniereRangee\(perimetre\)/, "un lecteur nommé, pas une lecture en place");
  assert.match(t, /return toutes\.length > 0 \? toutes\[toutes\.length - 1\] : null;/,
    "⛔ le DERNIER élément — `querySelector` rendrait le premier, et la loi ne tiendrait plus que par coïncidence");
  assert.match(t, /const RANGEES = "\.parcours-pied, \.sortie, \.fiche-actions, \.card-pied, \[data-rangee\]";/,
    "les cinq rangées énumérées UNE fois — deux listes recopiées divergent (celle du `?` ignorait `.card-pied`)");

  /* ② UN SEUL ÉCRIVAIN, ET IL EST AU POINT DE PASSAGE OBLIGÉ (garde 18). */
  assert.match(t, /function cadrerLesRangees\(racine\) \{\s*poserLesBornes\(racine\);/,
    "⛔ les bornes se posent AVANT le groupage : sinon le `prepend` du livre le mettrait derrière le groupe, "
    + "et le clavier suit le DOM, pas l'écran");
  assert.match(t, /if \(borne\.matches\("\.fiche-livre"\)\) rangee\.prepend\(borne\); else rangee\.append\(borne\);/,
    "le livre à gauche, le `?` à droite — la paire d'Eric du 26/08");

  /* ③ LE PÉRIMÈTRE S'ARRÊTE À LA FICHE. */
  assert.match(t, /borne\.closest\("\.fiche-dalle, \.catalogue-card, \[data-snap\]"\)/,
    "⛔ sur un catalogue, chaque fiche garde SA pastille — sans cette borne, les vingt-deux `?` "
    + "descendraient dans la rangée de la dernière fiche, invisible sans faire défiler");

  /* ④ ET UNE BORNE SANS RANGÉE NE BOUGE PAS — §6 pré autorise l'`absolute`
     « sur une dalle SANS rangée », et c'est le cas d'Équipement depuis le 23/08. */
  assert.match(t, /if \(!rangee \|\| borne\.parentElement === rangee\) continue;/,
    "aucune rangée, aucun déplacement");

  /* ⑤ « UNE CELLULE CONTENANT AU MOINS UN BOUTON » — Eric, 04/09. Le duo
     ENCADRE des gestes ; deux bornes autour d'une colonne vide se liraient comme
     les boutons de l'écran, ce qu'elles ne sont pas.
     ⛔ Et la recherche exclut les bornes elles-mêmes : se compter soi-même
     n'aurait rien prouvé, et la condition aurait été vraie partout. */
  assert.match(t, /rangee\.querySelector\("button:not\(\.fiche-livre\):not\(\.tuto-point\)"\)/,
    "⛔ le duo ne descend que dans une rangée qui porte au moins un MAJEUR");

  /* ⚔️ ATTAQUE — LE GARDE MORD-IL ? Il ne suffit pas que le bon écrivain
     existe : il faut que les DEUX AUTRES aient disparu. Un placement survivant
     ailleurs rendrait l'absolu dépendant de l'ordre d'exécution, ce qui est
     exactement ce qu'on vient de retirer. */
  const placements = (t.match(/\.(?:prepend|append)\((?:livre|point|borne|interro)\)/g) || []);
  assert.deepEqual([...new Set(placements)].sort(), [".append(borne)", ".append(point)", ".prepend(borne)"],
    "⛔ seul `poserLesBornes` place une borne (`borne`) ; `renderStepContent` ne fait plus que la DÉPOSER "
    + "sur son hôte (`point`). Tout `prepend(livre)` ou `append(interro)` survivant est un second écrivain.");
  assert.equal(/hote\.querySelector\(":scope > \.livre-de-sortie"\)/.test(t), false,
    "⛔ le livre ne se cherche plus dans deux fonctions : il était placé DEUX FOIS, avec deux commentaires "
    + "et deux raisons — la forme exacte du défaut que §6 pré nomme");
});

/* ══ 20 — AUCUNE RÉSERVE EN REMBOURRAGE SUR UNE RANGÉE DE CONTRÔLES
   🔴 NORMES §6 pré, 2026-09-04 : *« Une borne a une COLONNE, jamais une
   réserve. Une colonne existe même vide : la place est tenue par le GABARIT,
   jamais négociée par le contenu. »*

   ⚖️ LE LOT DE §6 pré EN A RETIRÉ QUATRE, ET IL EN RESTAIT TROIS — c'est
   exactement ce que la norme prédit d'un besoin satisfait plusieurs fois :
     · `.ability-collecteur > .sortie` : `padding-right: var(--touch)`, VIVANTE
       (spécificité 0,2,0 contre 0,1,0). Mesuré : colonnes `44 219 44` et le
       groupe centré **−22 blg** du milieu de la dalle — le témoin n° 2 de la
       norme, au chiffre près ;
     · `.sortie` et sa jumelle de grandeur étroite : MORTES, mais présentes.
       Une déclaration qui perd ne crie pas — elle attend qu'on déplace un bloc.
   ⭐ D'où un garde qui lit la SOURCE et non le rendu : le rendu ne montre que
   celle qui gagne aujourd'hui. */
test("20 — une borne a une colonne, jamais une réserve en rembourrage", () => {
  const css = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const RANGEE = /(parcours-pied|\.sortie|fiche-actions|card-pied|data-rangee)/;
  const coupables = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim(), corps = m[2];
    /* ⛔ on ne juge que les règles qui visent la RANGÉE elle-même : un
       `.parcours-pied button` habille un bouton, pas la rangée. */
    if (!RANGEE.test(sel)) continue;
    if (/(bouton|button|majeurs|livre|tuto-point|item)/.test(sel)) continue;
    for (const decl of corps.split(";")) {
      if (!/padding/.test(decl)) continue;
      /* 🔴 LA FAUTE EST NOMMÉE : réserver LA LARGEUR D'UNE BORNE. Une gouttière
         symétrique n'en est pas une — c'est `--touch` dans un rembourrage
         d'axe inline qui dit « je garde la place d'un rond ». */
      if (/--touch/.test(decl) && !/padding-block/.test(decl)) coupables.push(`${sel.split("\n")[0]} → ${decl.trim()}`);
    }
  }
  assert.deepEqual(coupables, [],
    "⛔ une rangée de contrôles ne réserve JAMAIS la largeur d'une borne en rembourrage (§6 pré)");

  /* ⚔️ ATTAQUE — le garde lit-il vraiment quelque chose ? On lui donne la règle
     qui vient d'être retirée, et il doit la voir. */
  const faux = ".ability-collecteur > .sortie {\n  padding-right: var(--touch);\n}";
  const vus = [];
  for (const m of faux.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim();
    if (!RANGEE.test(sel) || /(bouton|button|majeurs|livre|tuto-point|item)/.test(sel)) continue;
    for (const decl of m[2].split(";")) if (/padding/.test(decl) && /--touch/.test(decl)) vus.push(decl.trim());
  }
  assert.deepEqual(vus, ["padding-right: var(--touch)"],
    "⛔ le garde doit voir la réserve qu'on vient de retirer — sinon il passe pour vert en ne lisant rien");
});
