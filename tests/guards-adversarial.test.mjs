/* ══ L'ATTAQUE DES GARDES (siège RELECTEUR Adverserial, 2026-08-08) ═══

   Cette suite ne teste pas le produit : elle teste LES GARDES DU PRODUIT.

   Motif : le 2026-08-08, le garde structurel de `play-block` a été trouvé
   creux alors qu'il était vert depuis le lot 3 — il n'assertait qu'un compte
   de fichiers. Un garde vert ne prouve rien tant qu'on ne l'a pas vu ROUGIR
   sous une violation délibérée ; c'est ce que fait chaque test ci-dessous.

   Les trois défauts que cette suite a trouvés, et qui échouaient AVANT le
   correctif (mesurés : 170/170 verts avec la violation en place) :

     1. l'arpenteur des gardes §0.12 / §L5.3 lisait `src/play/` À PLAT — un
        module posé dans `src/play/rules/` citant Destinée, Chaos, Overreach
        ET Éveil ne faisait ciller personne ;
     2. le vocabulaire interdit ne couvrait pas `arcana`, qui est pourtant
        L'IDENTIFIANT EMPLOYÉ PAR LE CODE (`fh.arcana`) ;
     3. le garde §L5.3 cherchait `layers/fh`, chemin mort depuis le
        déplacement des modules dans `src/modules/fh/` le même jour — un
        `import { fhTotal } from "../modules/fh/lexicon.mjs"` posé dans
        `src/play/utils.mjs` passait sans un mot.

   Le dépouilleur, lui, EFFAÇAIT DU CODE (défaut n°4) : deux cas ordinaires
   suffisaient à rendre le garde zéro-DOM aveugle sur une zone entière. */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  stripComments, walkSources, loadSources, findForbidden,
  HOUSE_MECHANICS, LAYER_NAMES
} from "./source-scan.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const playDir = path.join(here, "..", "src", "play");

/* ── DÉFAUT n°4 — le dépouilleur effaçait du code ─────────────────── */

test("ATTAQUE — le dépouilleur retire les commentaires SANS emporter de code", () => {
  /* Les deux cas mesurés le 2026-08-08 contre la version regex. Ils ne sont
     pas exotiques : une regex qui contient `/*`, une chaîne qui contient
     `//`. Sur chacun, l'ancien dépouilleur effaçait un mot INTERDIT — donc
     le garde zéro-DOM ne le voyait plus. */
  const withRegex = 'const RE = /a\\/*b/;\nwindow.alert(1);\nconst END = "*/";';
  assert.match(stripComments(withRegex), /window/,
    "un `/*` DANS une regex n'ouvre pas un commentaire — tout ce qui suivait devenait invisible");

  const withSlashes = 'const SEP = "a//b"; document.title = 1;';
  assert.match(stripComments(withSlashes), /document/,
    "un `//` DANS une chaîne n'ouvre pas un commentaire de ligne");

  // Et il retire toujours ce pour quoi il existe.
  assert.equal(/window/.test(stripComments("/* plus de window ici */ const a = 1;")), false);
  assert.equal(/document/.test(stripComments("const a = 1; // remplace document")), false);
  assert.equal(/localStorage/.test(stripComments("/* multi\n   ligne localStorage\n*/ const a = 1;")), false);

  /* Les littéraux de chaîne sont CONSERVÉS, et c'est essentiel : un import est
     une chaîne, et c'est par une chaîne d'import que le défaut n°3 est passé. */
  assert.match(stripComments('import { x } from "../modules/fh/lexicon.mjs";'), /modules\/fh/);
});

/* ── DÉFAUT n°1 — l'arpenteur lisait à plat ───────────────────────── */

test("ATTAQUE — un module caché dans un SOUS-RÉPERTOIRE ne sort pas du périmètre", () => {
  /* La violation qui laissait les 170 tests verts : `src/play/rules/
     destiny-hook.mjs` citant quatre mécaniques maison d'un coup. */
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fhpc-guard-"));
  try {
    fs.mkdirSync(path.join(tmp, "rules"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "surface.mjs"), "export const a = 1;\n");
    fs.writeFileSync(
      path.join(tmp, "rules", "destiny-hook.mjs"),
      "export function bonus(e) { return e.destiny + e.chaos + e.overreach + e.awakening; }\n"
    );
    fs.writeFileSync(path.join(tmp, "rules", "notes.txt"), "destiny\n");

    const found = walkSources(tmp).map((file) => path.relative(tmp, file));
    assert.deepEqual(found, ["rules/destiny-hook.mjs", "surface.mjs"].sort(),
      "l'arpenteur descend dans les sous-répertoires, et ne ramasse que des .mjs");

    const hits = findForbidden(loadSources([tmp], tmp), HOUSE_MECHANICS);
    assert.ok(hits.some((hit) => hit.name.includes("rules/")),
      "le module enfoui DOIT être vu : à plat, il échappait à la loi §0.12 sans un mot");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

/* ── DÉFAUT n°2 — `arcana` traversait le vocabulaire interdit ─────── */

test("ATTAQUE — le vocabulaire interdit couvre les formes QUE LE CODE EMPLOIE", () => {
  /* `/\barcane?\b/i` matchait « arcane » et rien d'autre. Le dépôt, lui,
     écrit `fh.arcana`, `state.arcana`, `destinyBuild.arcana`. Un garde de
     vocabulaire calé sur le mot du cahier des charges plutôt que sur
     l'identifiant du code ne garde rien. */
  const hostile = [
    "const arcana = entry.arcana;",
    "state.arcana.name",
    "if (flags.includes('fh.arcana')) {}",
    "const destinies = [];",
    "const awakened = true;",
    "overreaches += 1;",
    "const chaos = 0;",
    "fates.push(1);"
  ];
  hostile.forEach((line, index) => {
    const hits = findForbidden([{ name: "probe-" + index + ".mjs", text: line }], HOUSE_MECHANICS);
    assert.ok(hits.length > 0, "cette forme doit être vue comme une mécanique maison : " + line);
  });

  // Et il ne mord pas sur du vocabulaire SRD légitime.
  ["const exhaustion = 0;", "const inspiration = 1;", "const advantage = true;"].forEach((line) => {
    assert.deepEqual(findForbidden([{ name: "srd.mjs", text: line }], HOUSE_MECHANICS), [],
      "un mot du SRD n'est pas une mécanique maison : " + line);
  });
});

/* ── DÉFAUT n°3 — le garde §L5.3 gardait un chemin mort ───────────── */

test("ATTAQUE — nommer la couche par son NOUVEAU chemin est vu comme la nommer", () => {
  /* Reproduction exacte de la violation qui laissait 170/170 verts : un
     import du module de couche depuis `src/play/`. L'ancienne liste cherchait
     `layers/fh` — le chemin d'avant le renommage du 2026-08-08. */
  const hostile = [
    'import { fhTotal } from "../modules/fh/lexicon.mjs";',
    'import { createChaos } from "../modules/fh/chaos.mjs";',
    'import { FH_VERDICTS } from "../modules/fh/lexicon.mjs";',
    'import { createFhLayer } from "../modules/fh/index.mjs";',
    'const mod = layers["fh"];',
    "if (play.engine.layers.fh) {}"
  ];
  hostile.forEach((line, index) => {
    const hits = findForbidden([{ name: "probe-" + index + ".mjs", text: line }], LAYER_NAMES);
    assert.ok(hits.length > 0, "le moteur ne doit pas pouvoir nommer sa couche ainsi : " + line);
  });

  /* Et il ne mord pas sur le préfixe d'erreur du moteur, qui commence lui
     aussi par « fh » — sans quoi le durcissement rendrait la suite rouge pour
     une raison qui n'est pas une violation. */
  assert.deepEqual(
    findForbidden([{ name: "session.mjs", text: 'throw new Error("fhpc/play: needs a bus");' }], LAYER_NAMES),
    [], "`fhpc/play:` préfixe légitimement les erreurs du moteur");
});

/* ── LE GARDE, EN VRAI, SUR L'ARBRE RÉEL ─────────────────────────── */

test("le périmètre inspecté par les gardes NOMME ce qu'il doit contenir", () => {
  /* Le défaut du 2026-08-08 était un `length >= N` : pointé au mauvais
     endroit, le compte tenait quand même. On nomme, donc. */
  const files = walkSources(playDir).map((file) => path.relative(playDir, file));
  ["dice.mjs", "export.mjs", "index.mjs", "labels.mjs", "lexicon.mjs",
    "rolltypes.mjs", "sequence.mjs", "session.mjs", "utils.mjs"].forEach((name) => {
    assert.ok(files.includes(name), "src/play/" + name + " doit être dans le périmètre du garde");
  });
  assert.ok(files.length >= 9);
});
