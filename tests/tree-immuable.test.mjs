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

  /* ⚠️ DEUX PRÉCAUTIONS SUR L'ENVIRONNEMENT DU SOUS-PROCESSUS, et les deux ont
     été mesurées en écrivant ce garde :
     · `NODE_TEST_CONTEXT` est posé par `node --test` dans CHAQUE fichier de
       suite. Hérité, il fait basculer le petit-fils sur le format sérialisé
       interne du runner au lieu d'un rapport lisible — le garde ne trouvait
       alors aucun compte de tests et rougissait pour une raison qui n'était
       pas la sienne. On le retire.
     · le rapport est ÉPINGLÉ en TAP plutôt que laissé au défaut : le format
       par défaut dépend de l'attachement d'un terminal, et une preuve qui
       change de forme selon qui la regarde n'est pas une preuve. */
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const run = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...suites], {
    cwd: ROOT, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]
  });
  const apres = fingerprintTree(ROOT);

  /* NON-VACUITÉ, D'ABORD. Un sous-processus qui n'aurait rien exécuté
     laisserait forcément l'arbre intact, et le garde serait vert pour la pire
     des raisons. On exige donc que le compte de tests soit là, et qu'il y ait
     au moins un test par suite lancée. */
  assert.equal(run.error, undefined, `le sous-processus n'a pas démarré : ${run.error && run.error.message}`);
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
