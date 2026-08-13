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
   suffisaient à rendre le garde zéro-DOM aveugle sur une zone entière.

   ── DÉFAUT n°5, AJOUTÉ LE 2026-08-08 (lot 13) ─────────────────────────
   Le vocabulaire §0.12 employait des FRONTIÈRES DE MOT : `spendDestiny`,
   `resolveArcana`, `settleAwakening`, `applyOverreach`, `rollChaos` et
   `const destinyDie = 1` traversaient tous le garde de la loi la plus haute
   du chantier sans le faire ciller. Trouvé par le lot 10, vérifié et aggravé
   par l'architecte, réparé ici — et attaqué DANS LES DEUX SENS : une
   violation composée doit rougir, et le code légitime doit rester vert. */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  stripComments, splitIdentifiers, walkSources, loadSources, findForbidden,
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
    "fates.push(1);",
    /* REWRITTEN 2026-08-08 (lot 16) — la Vibration entre au vocabulaire en même
       temps qu'elle entre au moteur. Les deux formes que le code emploierait :
       le mot nu, et l'identifiant composé qui porte son niveau. */
    "const vibration = card.vibration;",
    "entry.vibrationLevel = 3;",
    /* AJOUT 2026-08-09 (lot 21) — le Tilt, attaqué sous les trois formes que
       le code emploie réellement : le mot nu, le composé de réglage, et
       l'appel du résolveur (que seul le découpeur d'identifiants rend
       visible — `resolveTilt` → « resolve Tilt »). */
    "const tilt = cfg.tilts;",
    "entry.tiltDisadvantage = true;",
    "resolveTilt({ tilts: 2, disadvantage: false });"
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

/* ── DÉFAUT n°5 — les FORMES COMPOSÉES traversaient la frontière de mot ── */

test("ATTAQUE — un identifiant COMPOSÉ ne cache plus une mécanique maison", () => {
  /* TROISIÈME RETOUR DE LA MÊME FAMILLE (`arcane` contre `arcana`, le balayage
     à plat, et maintenant la frontière de mot). Le garde cherchait
     `\bdestiny\b` : dans `spendDestiny` il n'y a AUCUNE frontière avant le
     « D », et `_` est lui aussi un caractère de mot — `FH_DESTINY` passait.
     Le tableau ci-dessous est celui que l'architecte a mesuré, plus les formes
     voisines que la même cause laissait passer. */
  const violations = [
    "export function spendDestiny(n) { return n; }",
    "const points = setDestinyPoints(p);",
    "resolveArcana(state);",
    "settleAwakening(entry);",
    "applyOverreach(entry);",
    "const d = rollChaos(dice);",
    "addPendingFate(f);",
    "const destinyDie = 1;",
    "const FH_DESTINY = 1;",
    "let destiny_die = 2;",
    "export const chaosTable = [];",
    "import { resolveArcana } from './x.mjs';"
  ];
  violations.forEach((line, index) => {
    const hits = findForbidden([{ name: "probe-" + index + ".mjs", text: line }], HOUSE_MECHANICS);
    assert.ok(hits.length > 0, "forme composée non vue par le garde §0.12 : " + line);
  });

  /* ET UNE VIOLATION COMPOSÉE DANS UN VRAI FICHIER, sur le vrai chemin du
     garde (`loadSources` → `findForbidden`) : une ligne de code n'est pas un
     fichier, et c'est par le fichier que le défaut n°1 était passé. */
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fhpc-compose-"));
  try {
    fs.writeFileSync(path.join(tmp, "moteur.mjs"),
      "export function stage(entry) {\n  return spendDestinyDie(entry) + entry.chaosPool;\n}\n");
    const hits = findForbidden(loadSources([tmp], tmp), HOUSE_MECHANICS);
    assert.ok(hits.some((hit) => hit.name === "moteur.mjs"),
      "le fichier entier doit rougir, pas seulement la ligne isolée");
    assert.ok(hits.some((hit) => hit.label === "Destiny") && hits.some((hit) => hit.label === "Chaos"),
      "et les DEUX mécaniques sont nommées, pas la première seulement");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("ATTAQUE EN SENS INVERSE — l'élargissement ne mord pas sur le code légitime", () => {
  /* Un garde qui crie au loup se fait désactiver, et c'est alors la garantie
     ENTIÈRE qui est perdue — pas seulement le cas qui criait. L'élargissement
     a donc son attaque dans les deux sens. Les cas ci-dessous sont ceux que
     les deux mécanismes du durcissement auraient pu mordre : le retrait de
     l'ancre finale (`fatal`, `destination`) et le découpage d'identifiants,
     qui insère des frontières là où il n'y en avait pas (`isFatalError` →
     « is Fatal Error »). */
  const legitimes = [
    "const exhaustion = 0;",
    "const inspiration = 1;",
    "const advantage = true;",
    "throw new FatalError('x');",
    "if (isFatalError(e)) return;",
    "const destination = new URL(href);",
    "const destinataire = who;",
    "const updatedAt = now();",
    "const chapterIndex = 1;",
    /* AJOUT 2026-08-09 (lot 21) — le voisinage de `tilt` : aucune frontière de
       mot ne s'ouvre au milieu de `untilted`, et « until » ne contient pas le
       motif. Sans ces deux-là, l'ajout serait posé sans qu'on sache s'il mord
       au-delà de sa cible. */
    "while (i < n) untilted += 1;",
    "const until = Date.now() + 1000;",
    'import { readFileSync } from "node:fs";',
    'throw new Error("fhpc/build: le document doit porter build.layers");'
  ];
  legitimes.forEach((line, index) => {
    assert.deepEqual(findForbidden([{ name: "sain-" + index + ".mjs", text: line }], HOUSE_MECHANICS), [],
      "le garde §0.12 mord sur du code légitime : " + line);
  });

  /* Le découpeur lui-même, sur ses trois règles — parce qu'un découpage faux
     déplacerait les frontières de TOUS les gardes qui passent par lui. */
  assert.equal(splitIdentifiers("spendDestiny"), "spend Destiny");
  assert.equal(splitIdentifiers("FH_DESTINY"), "FH DESTINY");
  assert.equal(splitIdentifiers("HTTPArcana"), "HTTP Arcana");
  assert.equal(splitIdentifiers("const a = 1;"), "const a = 1;", "et il ne touche pas au code ordinaire");

  /* ⚠️ LE DÉCOUPAGE S'AJOUTE AU TEXTE BRUT, IL NE LE REMPLACE PAS. Insérer une
     frontière peut CASSER un match : découpé, `fhTotal` devient « fh Total »,
     que `/\bfh[A-Z_]/` ne voit plus. Le garde §L5.3 doit continuer de le voir
     — c'est la preuve que `findForbidden` balaye bien les deux. */
  assert.ok(
    findForbidden([{ name: "utils.mjs", text: 'import { fhTotal } from "./x.mjs";' }], LAYER_NAMES).length > 0,
    "le durcissement du garde §0.12 ne doit pas avoir aveuglé le garde §L5.3"
  );
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

/* ══ DÉFAUT n°6 — UN GARDE QUI NE PEUT PAS LIRE SON SUJET ════════════
   Trouvé par l'architecte le 2026-08-13, et c'est un cran EN DESSOUS de
   tout ce qui précède. Les défauts 1 à 5 sont des gardes qui cherchent
   MAL. Celui-ci est un fichier que l'instrument ne lit PAS DU TOUT.

   LA MESURE : `src/build/block.mjs` portait DEUX octets NUL bruts (à sa
   ligne 410, un séparateur de clef composite écrit en octets au lieu de
   sa séquence d'échappement). `file` le classait « data », donc grep le
   sautait EN SILENCE — `grep -c ""` sur ce fichier rendait ZÉRO, et
   `grep -c "export"` aussi.

   🔴 CE QUE ÇA A COÛTÉ, ET C'EST MESURÉ : l'architecte a cherché au grep
   les producteurs de `background.boost-disallowed`, n'en a trouvé QU'UN,
   et en a conclu qu'une dette déclarée par le lot 43 était retirée.
   FAUX — il y en a DEUX, et le second est dans ce fichier même. Un lot
   allait être privé de sa raison d'être sur une mesure creuse.

   ⭐ ET C'EST PIRE QU'UN FAUX NÉGATIF ORDINAIRE : dans tout ce chantier,
   « zéro occurrence » se lit comme une PREUVE D'ABSENCE — c'est la forme
   de la moitié des mesures du mandat. Un seul fichier illisible transforme
   chacune d'elles en mensonge silencieux, et rien ne le signale.

   LA CORRECTION : la séquence d'échappement au lieu de l'octet brut.
   Valeur d'exécution identique (780 verts avant comme après), fichier
   redevenu du texte, grep le revoit.

   LE GARDE : aucun fichier de `src/` ne porte un caractère de contrôle
   hors tabulation, saut de ligne et retour chariot. La loi est sur les
   OCTETS, comme §0.12 — parce que c'est une propriété des octets, pas du
   sens. */

function premierOctetDeControle(bytes) {
  for (let i = 0; i < bytes.length; i += 1) {
    const b = bytes[i];
    /* Autorisés : tabulation (9), saut de ligne (10), retour chariot (13).
       Tout le reste sous 32 fait basculer le fichier en « data ». */
    if (b < 32 && b !== 9 && b !== 10 && b !== 13) return { octet: b, position: i };
  }
  return null;
}

test("DÉFAUT n°6 — aucun fichier de src/ n'est illisible au grep (pas d'octet de contrôle)", () => {
  const srcDir = path.join(here, "..", "src");
  const coupables = [];
  for (const file of walkSources(srcDir)) {
    const trouve = premierOctetDeControle(fs.readFileSync(file));
    if (trouve) coupables.push(`${path.relative(srcDir, file)} : octet ${trouve.octet} à la position ${trouve.position}`);
  }
  assert.deepEqual(coupables, [],
    "un octet de contrôle rend le fichier « data » : grep le saute EN SILENCE, et « zéro occurrence » cesse " +
    "de vouloir dire « absent ». Écris la séquence d'échappement, jamais l'octet.");
});

test("⚔️ ATTAQUE du défaut n°6 — le garde MORD sur un octet NUL, et PAS sur sa séquence d'échappement", () => {
  /* Le garde ci-dessus est vert sur l'arbre réel. Vert ne prouve rien : on
     lui redonne le fichier fautif tel qu'il était, et il doit rougir. */
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fhpc-nul-"));
  try {
    const fautif = path.join(tmp, "fautif.mjs");
    fs.writeFileSync(fautif, Buffer.concat([
      Buffer.from("const k = `a", "utf8"), Buffer.from([0]), Buffer.from("b`;\n", "utf8")
    ]));
    assert.deepEqual(premierOctetDeControle(fs.readFileSync(fautif)), { octet: 0, position: 12 },
      "le garde doit voir le NUL, et dire OÙ");

    /* ⭐ LA CONTRE-PREUVE QUI COMPTE : le même contenu écrit avec la
       séquence d'échappement passe. C'est bien l'OCTET qu'on interdit, pas
       la valeur — sans quoi le garde interdirait la correction elle-même. */
    const propre = path.join(tmp, "propre.mjs");
    fs.writeFileSync(propre, "const k = `a\\u0000b`;\n");
    assert.equal(premierOctetDeControle(fs.readFileSync(propre)), null,
      "la séquence d'échappement porte la même valeur SANS rendre le fichier illisible");

    /* Et la valeur d'exécution est bien la même — sinon la correction
       appliquée à block.mjs aurait changé le comportement en silence.
       Les deux écritures doivent produire le MÊME octet. */
    const parEchappement = "a\u0000b";
    assert.equal(parEchappement.charCodeAt(1), 0);
    assert.equal(parEchappement, "a" + String.fromCharCode(0) + "b");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
