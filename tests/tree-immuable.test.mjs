/* ══ UNE SUITE NE MUTE JAMAIS UN ARTEFACT COMMITÉ (lot 13) ═════════════

   Le garde qui empêche la rechute du défaut mesuré par l'architecte le
   2026-08-08, et sa raison d'être complète est écrite dans tests/tree-watch.mjs
   (deux passes d'affilée, 307/1 puis 304/4, sans qu'une ligne ait changé).

   Deux tests, et il faut les deux :

     1. L'ATTAQUE. Le veilleur est nourri d'un arbre sali EXPRÈS — un octet
        ajouté, un fichier retiré, un fichier déposé — et il doit rougir sur
        chacun, en le nommant. Un garde qu'on n'a jamais vu rougir n'est pas un
        garde. L'attaque a lieu sur un arbre fabriqué dans un répertoire
        temporaire : salir le vrai dépôt pour prouver qu'on sait voir la saleté
        serait commettre la faute qu'on prétend interdire.

     2. LE FAIT. Toute la suite (moins ce fichier-ci) est rejouée dans un
        sous-processus, entre deux relevés du VRAI arbre, et rien ne doit avoir
        bougé. Ce n'est pas un garde sur `gen-srd-layer` : c'est un garde sur
        TOUTES les suites, y compris celles qui n'existent pas encore.

   ⚠️ La récursion est coupée par CONSTRUCTION, pas par un drapeau : le
   sous-processus reçoit la liste des suites moins celle-ci. Aucun `skip`, rien
   à se rappeler d'enlever un jour. */

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fingerprintTree, treeChanges, describeChanges, ARTEFACT_DIRS } from "./tree-watch.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "..");
const MOI = path.basename(fileURLToPath(import.meta.url));

/* ── 1. L'ATTAQUE ─────────────────────────────────────────────────── */

test("ATTAQUE — le veilleur voit l'arbre sali : modifié, disparu, apparu, et il les NOMME", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fhpc-tree-"));
  try {
    fs.mkdirSync(path.join(tmp, "layers"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "layers", "srd.layer.json"), '{"schema":"fh-layer/1"}\n');
    fs.writeFileSync(path.join(tmp, "note.md"), "une ligne\n");
    const perimetre = { names: ["note.md"], dirs: ["layers"] };

    const avant = fingerprintTree(tmp, perimetre);
    assert.deepEqual([...avant.keys()], ["layers/srd.layer.json", "note.md"],
      "le périmètre couvre bien les deux ensembles : le fichier nommé ET le répertoire d'artefacts");

    /* LE TÉMOIN, D'ABORD. Sans lui, les trois assertions suivantes ne
       prouveraient rien de plus qu'un veilleur qui crie tout le temps. */
    assert.deepEqual(treeChanges(avant, fingerprintTree(tmp, perimetre)), [],
      "un arbre qu'on n'a pas touché ne bouge pas — un garde qui crie au loup se fait désactiver");

    // MODIFIÉ — la faute exacte de gen-srd-layer : réécrire un artefact.
    fs.writeFileSync(path.join(tmp, "layers", "srd.layer.json"), '{"schema":"fh-layer/1","x":1}\n');
    assert.deepEqual(treeChanges(avant, fingerprintTree(tmp, perimetre)),
      [{ name: "layers/srd.layer.json", kind: "modifié" }]);

    // APPARU — une suite qui DÉPOSE un fichier neuf dans `layers/`.
    fs.writeFileSync(path.join(tmp, "layers", "intrus.layer.json"), "{}\n");
    assert.deepEqual(treeChanges(avant, fingerprintTree(tmp, perimetre)), [
      { name: "layers/intrus.layer.json", kind: "apparu" },
      { name: "layers/srd.layer.json", kind: "modifié" }
    ], "et le fichier NEUF est vu alors qu'aucun fichier suivi n'a été touché — c'est pour ça que le second ensemble existe");

    // DISPARU — et le message d'échec nomme le fichier, pas « quelque chose ».
    fs.rmSync(path.join(tmp, "note.md"));
    const changes = treeChanges(avant, fingerprintTree(tmp, perimetre));
    assert.deepEqual(changes.find((c) => c.name === "note.md"), { name: "note.md", kind: "disparu" });
    assert.match(describeChanges(changes), /note\.md \(disparu\)/);

    /* Et la remise en état est vue comme telle : le veilleur compare des
       CONTENUS, pas des horodatages — une suite qui réécrit à l'identique ne
       salit pas l'arbre, et n'a pas à faire rougir qui que ce soit. */
    fs.writeFileSync(path.join(tmp, "layers", "srd.layer.json"), '{"schema":"fh-layer/1"}\n');
    fs.rmSync(path.join(tmp, "layers", "intrus.layer.json"));
    fs.writeFileSync(path.join(tmp, "note.md"), "une ligne\n");
    assert.deepEqual(treeChanges(avant, fingerprintTree(tmp, perimetre)), []);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

/* ── 2. LE FAIT, SUR LE VRAI ARBRE ────────────────────────────────── */

/** Le plafond du rapport que le sous-processus a le droit de rendre. Motivé,
 *  mesuré et attaqué plus bas — voir la troisième précaution et l'ATTAQUE. */
const MAX_BUFFER = 64 * 1024 * 1024;

/** Les suites du dépôt, moins celle-ci. La liste vient du disque : une suite
 *  écrite demain tombe sous le garde sans que personne l'y inscrive. */
function autresSuites() {
  return fs.readdirSync(path.join(ROOT, "tests"))
    .filter((name) => name.endsWith(".test.mjs") && name !== MOI)
    .sort()
    .map((name) => path.join("tests", name));
}

test("AUCUNE SUITE NE MUTE UN ARTEFACT COMMITÉ — toute la suite rejouée sous surveillance", () => {
  const suites = autresSuites();
  assert.ok(suites.length >= 20, `le garde doit voir toutes les suites — ${suites.length} trouvée(s)`);
  assert.ok(!suites.some((name) => name.endsWith(MOI)), "la récursion est coupée par construction");

  const avant = fingerprintTree(ROOT);
  assert.ok(avant.size > 40, "le relevé porte sur le vrai dépôt, pas sur trois fichiers");
  for (const dir of ARTEFACT_DIRS) {
    assert.ok([...avant.keys()].some((name) => name.startsWith(dir + "/")),
      `${dir}/ doit être dans le périmètre surveillé`);
  }

  /* ⚠️ TROIS PRÉCAUTIONS SUR L'ENVIRONNEMENT DU SOUS-PROCESSUS, et les trois
     ont été mesurées — les deux premières en écrivant ce garde, la troisième
     le 2026-08-23 :
     · `NODE_TEST_CONTEXT` est posé par `node --test` dans CHAQUE fichier de
       suite. Hérité, il fait basculer le petit-fils sur le format sérialisé
       interne du runner au lieu d'un rapport lisible — le garde ne trouvait
       alors aucun compte de tests et rougissait pour une raison qui n'était
       pas la sienne. On le retire.
     · le rapport est ÉPINGLÉ en TAP plutôt que laissé au défaut : le format
       par défaut dépend de l'attachement d'un terminal, et une preuve qui
       change de forme selon qui la regarde n'est pas une preuve.
     · `maxBuffer` est DIT, au lieu d'être laissé au 1 Mo par défaut de
       `spawnSync`. 🔴 CE DÉFAUT REND LE GARDE AVEUGLE EXACTEMENT QUAND LE DÉPÔT
       VA MAL : le rapport dépasse le mégaoctet dès qu'un test compare deux
       artefacts volumineux, et `spawnSync` TUE alors le sous-processus en
       plein vol — mesuré : `SIGTERM`, `status: null`, `error.code = ENOBUFS`,
       sortie tronquée à 1 114 112 octets. ⚠️ Ce n'est donc PAS « il n'a pas
       démarré » : il a démarré, il a été coupé, et la vraie question de ce
       garde — UNE SUITE A-T-ELLE MUTÉ UN ARTEFACT COMMITÉ ? — n'est plus posée
       du tout. Il échoue pour une raison qui n'est pas la sienne, et on le
       croit rouge à cause des autres.
       MESURÉ le 2026-08-23, sur le lot 93 : rapport vert de la suite entière
       (90 fichiers, 1 345 tests) = 316 Ko ; UN SEUL test rouge qui comparait
       les deux couches SRD de 3,3 Mo = 6,8 Mo à lui tout seul, et la suite
       entière 7,2 Mo. Le défaut était donc SEPT FOIS trop petit le jour où il
       fallait qu'il tienne. La valeur retenue reprend celle que
       `tree-watch.mjs` donne déjà à `git ls-files` : ~200× le rapport vert,
       ~9× le plus gros échec jamais mesuré ici. Ce n'est pas une allocation,
       c'est un plafond ; il ne coûte que ce que le rapport pèse vraiment. */
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const run = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...suites], {
    cwd: ROOT, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: MAX_BUFFER
  });
  const apres = fingerprintTree(ROOT);

  /* NON-VACUITÉ, D'ABORD. Un sous-processus qui n'aurait rien exécuté
     laisserait forcément l'arbre intact, et le garde serait vert pour la pire
     des raisons. On exige donc que le compte de tests soit là, et qu'il y ait
     au moins un test par suite lancée. */
  /* ⚠️ « n'a pas démarré » ÉTAIT UNE DEVINETTE, et elle était fausse dans le cas
     qui s'est produit : à `ENOBUFS`, le sous-processus a bien démarré — il a été
     TUÉ en plein vol (`SIGTERM`) parce que son rapport débordait. Le message
     dit donc ce qu'on a mesuré, signal compris, plutôt que la première cause
     qui vient à l'esprit. */
  assert.equal(run.error, undefined,
    `le sous-processus n'a rendu aucun rapport exploitable : ${run.error && run.error.code} — ` +
    `${run.error && run.error.message}${run.signal ? ` (tué par ${run.signal})` : ""}`);
  const compte = /^# tests (\d+)$/m.exec(run.stdout);
  assert.ok(compte, "le sous-processus doit rendre son compte de tests — sans lui, le garde ne prouve rien.\n" +
    run.stdout.slice(-600) + (run.stderr ? "\n[stderr] " + run.stderr.slice(-600) : ""));
  assert.ok(Number(compte[1]) >= suites.length,
    `${compte[1]} test(s) pour ${suites.length} suite(s) : le sous-processus n'a pas tout joué`);

  /* LE VERDICT DU GARDE. */
  const changes = treeChanges(avant, apres);
  assert.deepEqual(changes, [],
    "une suite a muté l'arbre de travail — " + describeChanges(changes) + ". Une suite génère dans un " +
    "répertoire temporaire et compare là ; elle n'écrit jamais dans `layers/`, `examples/`, `schemas/` " +
    "ni `contracts/`. Voir tests/tree-watch.mjs pour ce que ce défaut a coûté.");

  /* ET LE GARDE NE JUGE PAS SUR UNE SUITE ROUGE. Si le sous-processus a
     échoué, on ne sait pas si le code qui mute a seulement été atteint : le
     relevé identique ne prouverait alors rien. Le doublon d'affichage est le
     prix, et il ne se paye que quand la suite est déjà rouge. */
  assert.equal(run.status, 0,
    "le garde ne peut rien conclure d'une suite rouge — corriger l'échec d'abord :\n" +
    run.stdout.split("\n").filter((line) => line.startsWith("not ok")).join("\n"));
});

/* ── 3. ET LE GARDE NE DOIT PAS S'AVEUGLER QUAND LA SUITE EST BRUYANTE ── */

/* 🔴 LE DÉFAUT QUE CETTE ATTAQUE ÉPROUVE A ÉTÉ VU EN VRAI, le 2026-08-23 : la
   copie du SRD embarquée dans ce dépôt avait pris cinq lots de retard sur sa
   source, deux tests comparaient donc deux couches de 3,3 Mo, et CE GARDE-CI
   tombait en `ENOBUFS`. On l'a compté comme un troisième rouge ; il n'en était
   pas un — il n'avait rien mesuré du tout.

   ⛔ ET C'EST LA PIRE FORME DE PANNE POUR UN GARDE : il devient aveugle
   EXACTEMENT quand le dépôt va mal, c'est-à-dire quand on a le plus besoin de
   savoir si une suite a muté un artefact. Sa question n'est alors plus posée,
   et son silence ressemble à un échec de plus dans la liste.

   ⚠️ POURQUOI UNE SUITE FABRIQUÉE, ET NON LA VRAIE : parce qu'il faut du bruit
   À LA DEMANDE. Rendre la vraie suite bruyante pour éprouver ce garde
   reviendrait à casser le dépôt pour vérifier qu'on sait voir qu'il est cassé
   — la faute même que ce fichier interdit. La suite fabriquée vit dans un
   répertoire temporaire, hors du périmètre surveillé, et elle reproduit la
   forme exacte du bruit mesuré : un diff MULTILIGNE. La forme compte : node
   TRONQUE le diff d'une longue ligne unique (mesuré : 41 Ko pour deux chaînes
   de 2 Mo, aucun `ENOBUFS`) et déroule celui d'un texte à lignes. Une attaque
   sur la mauvaise forme aurait conclu qu'il n'y avait pas de défaut. */
test("⚔️ ATTAQUE — une suite BRUYANTE rendait ce garde AVEUGLE, et `maxBuffer` lui rend la vue", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fhpc-bruit-"));
  try {
    fs.writeFileSync(path.join(tmp, "bruyante.test.mjs"), [
      'import test from "node:test";',
      'import assert from "node:assert/strict";',
      'test("un échec dont le diff pèse des mégaoctets", () => {',
      '  const lignes = Array.from({ length: 60000 }, (_, i) => `  "ligne ${i}": "une valeur de couche assez longue pour peser"`);',
      '  assert.equal(lignes.join("\\n"), lignes.map((l, i) => (i === 42 ? l + " (modifiée)" : l)).join("\\n"));',
      "});"
    ].join("\n"));

    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const args = ["--test", "--test-reporter=tap", "bruyante.test.mjs"];
    const lancer = (options) => spawnSync(process.execPath, args, {
      cwd: tmp, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options
    });
    const compteDe = (sortie) => /^# tests (\d+)$/m.exec(sortie || "");

    /* LE DÉFAUT, REPRODUIT — au 1 Mo par défaut de `spawnSync`. */
    const aveugle = lancer({});
    assert.equal(aveugle.error && aveugle.error.code, "ENOBUFS",
      "au défaut, un rapport de plusieurs mégaoctets fait rendre `ENOBUFS` à `spawnSync`");
    /* ⚠️ ET IL A BIEN DÉMARRÉ — c'est le point que le message d'échec du garde
       se trompait à nommer. `spawnSync` le TUE au dépassement : la sortie
       s'arrête net, et c'est pire qu'un lancement raté, parce que ça ressemble
       à un vrai verdict. */
    assert.equal(aveugle.signal, "SIGTERM", "le sous-processus a démarré puis a été COUPÉ, il n'a pas échoué à naître");
    assert.equal(aveugle.status, null);
    assert.match(aveugle.stdout, /^TAP version 13/, "témoin : il avait commencé à rendre son rapport");
    assert.equal(compteDe(aveugle.stdout), null,
      "⛔ ET LA PREUVE QUE LE GARDE NE MESURAIT PLUS RIEN : aucun compte de tests n'est lisible. " +
      "Le sous-processus a tourné, son rapport est tronqué — le verdict n'existe pas.");

    /* ET AVEC LA MESURE — le rapport passe entier, le verdict revient. */
    const voyant = lancer({ maxBuffer: MAX_BUFFER });
    assert.equal(voyant.error, undefined, "avec `maxBuffer` dit, le sous-processus rend son rapport");
    const compte = compteDe(voyant.stdout);
    assert.ok(compte, "le compte de tests redevient lisible — c'est lui, la non-vacuité du garde");
    assert.equal(Number(compte[1]), 1);
    assert.equal(voyant.status, 1, "et le garde voit bien que la suite est ROUGE, ce qu'`ENOBUFS` lui cachait");

    /* LE TÉMOIN DE L'ATTAQUE ELLE-MÊME. Sans lui, ce test resterait vert le
       jour où le bruit fabriqué cesserait d'être bruyant — et il prouverait
       alors qu'un rapport minuscule tient dans 1 Mo, ce que personne ne
       conteste. On exige donc que le bruit dépasse VRAIMENT le défaut. */
    const poids = Buffer.byteLength(voyant.stdout, "utf8");
    assert.ok(poids > 1024 * 1024,
      `témoin : le rapport fabriqué pèse ${poids} octet(s) — il DOIT dépasser le 1 Mo par défaut, sinon l'attaque ne prouve rien`);
    assert.ok(MAX_BUFFER > poids * 4,
      `et le plafond retenu (${MAX_BUFFER}) garde de la marge sur ce que le bruit pèse déjà (${poids})`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
