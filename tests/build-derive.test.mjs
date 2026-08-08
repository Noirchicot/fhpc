/* Lot 9 — LES REFUS, LES DÉGRADATIONS, ET CE QUE `rebuild` DIT.

   L'acceptation prouve que la dérivation SAIT plier. Cette suite-ci prouve
   qu'elle sait REFUSER : c'est la moitié qui coûte cher à ne pas avoir, parce
   qu'un pli approximatif est vert et se joue à la table.

   Chaque scénario retire une chose à la matière et regarde ce que le bloc
   fait de son absence. La règle attendue est toujours la même : un nombre
   manquant est ABSENT et déclaré, une collection qu'on ne sait pas nourrir est
   VIDE et déclarée, une clef hors catalogue JETTE, et rien n'est jamais
   deviné. */

import test from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";

import {
  makeHarness, acceptanceDocument, readJson, manifestOf,
  COMPLEMENT, COMPLEMENT_NIVEAU, COMPLEMENT_EQUIPEMENT, COMPLEMENT_BOURSE, SRD_FR
} from "./build-harness.mjs";
import { diffResolved } from "../src/build/diff.mjs";

const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateChar = ajv.compile(readJson("schemas/fh-char.schema.json"));

/** Le document d'acceptation privé de certains choix. */
function sans(layers, retirer) {
  const doc = acceptanceDocument(layers);
  doc.build.choices = doc.build.choices.filter((choice) => !retirer.includes(choice.path));
  return doc;
}

/** Le même, sans les overrides du MJ — les scénarios de dégradation mesurent
 *  la DÉRIVATION, et un override sur un champ qu'elle n'a pas produit est une
 *  question à part (voir la suite qui la pose, plus bas). */
function sansOverrides(layers) {
  const doc = acceptanceDocument(layers);
  doc.build.overrides = [];
  return doc;
}

/* ── le document produit VALIDE ─────────────────────────────────────── */

test("le document reconstruit valide le schéma fh-char/1", () => {
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.equal(validateChar(out.document), true, ajv.errorsText(validateChar.errors));
  /* C'est ce qui justifie la règle « collection vide + déclaration » plutôt
     que « collection absente » : les vingt clefs de `resolved` sont TOUTES
     obligatoires, et un document invalide est un document injouable. */
  assert.deepEqual(
    Object.keys(out.resolved).sort(),
    readJson("schemas/fh-char.schema.json").$defs.resolved.required.slice().sort()
  );
});

/* ── ce qui JETTE : le structurel et le hors-catalogue ──────────────── */

test("sans NIVEAU, la dérivation n'est pas incomplète : elle est impossible, et elle le dit", () => {
  const h = makeHarness();
  assert.throws(() => h.verbs.rebuild({ document: sans(h.layers, ["level"]) }), (error) => {
    assert.match(error.message, /aucun choix `level`/);
    assert.match(error.message, /n'y a pas de valeur par défaut|dérivable de rien/);
    return true;
  });
});

test("sans CLASSE, et sans un seul des six scores, elle jette en nommant ce qui manque", () => {
  const h = makeHarness();
  assert.throws(() => h.verbs.rebuild({ document: sans(h.layers, ["class"]) }), /aucun choix `class`/);
  assert.throws(() => h.verbs.rebuild({ document: sans(h.layers, ["abilities.wis"]) }), (error) => {
    assert.match(error.message, /abilities\.wis/);
    assert.match(error.message, /Un score ne se dérive de rien/);
    return true;
  });
});

test("UNE CLEF DE CARACTÉRISTIQUE HORS DES SIX JETTE — le moteur ne la rattrape pas", () => {
  /* ARBITRAGE DU 2026-08-08. La couche FR livrée porte encore `sag` et `for`
     sur six compétences ; la fixture applique la décision. En la retirant, on
     voit ce que le bloc fait d'une clef langue-native : il NOMME le record.
     Une table `"sag" → "wis"` dans `src/build/` serait la faute que ce lot
     existe pour éviter — le garde de vocabulaire la tient, ce test tient
     l'autre bout. */
  const h = makeHarness({ fixtureOptions: { corrigerClefsFr: false } });
  assert.throws(() => h.verbs.rebuild({ document: acceptanceDocument(h.layers) }), (error) => {
    assert.match(error.message, /srd:skill:fr:athletisme/, "la violation nomme le record");
    assert.match(error.message, /"for"/, "et la clef fautive");
    assert.match(error.message, /str, dex, con, int, wis, cha/, "et le catalogue des six");
    return true;
  });
});

test("la pile qui a bougé sous le personnage est une DÉGRADATION, pas une dérivation à tenter", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  doc.build.layers[0] = Object.assign({}, doc.build.layers[0], { hash: "0".repeat(64) });
  assert.throws(() => h.verbs.rebuild({ document: doc }), (error) => {
    assert.match(error.message, /la pile montée ne correspond pas à `build.layers`/);
    assert.match(error.message, /srd-5\.2\.1-fr@5\.2\.1#0{64}/, "le message montre les deux piles");
    return true;
  });
});

test("un document jamais construit ADOPTE la pile montée — et c'est la seule fois où `build` bouge", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  doc.build.layers = [];
  const out = h.verbs.rebuild({ document: doc });
  assert.deepEqual(out.document.build.layers, manifestOf(h.layers));
  assert.deepEqual(out.resolved.derivation.stack, out.document.build.layers);
  // Et les choix, eux, n'ont pas bougé d'un iota.
  assert.deepEqual(out.document.build.choices, doc.build.choices);
});

/* ── ce qui DÉGRADE : les champs mécaniques absents ─────────────────── */

/** Le monde tel qu'il est AUJOURD'HUI : la vraie couche SRD, la seule
 *  correction que l'architecte a déjà tranchée (les clefs canoniques), et
 *  AUCUN des champs mécaniques du §3 — ils sont en cours d'écriture dans
 *  l'autre dépôt. */
const AVANT_LOT_8 = { fixtureOptions: { seulesClefs: true } };

test("SANS LES CHAMPS MÉCANIQUES DU §3, rien n'est deviné : tout ce qui manque est nommé", () => {
  /* La dérivation ne s'effondre pas et n'invente rien — elle rend ce qu'elle
     peut et nomme le reste. C'est la mesure de l'architecte du 2026-08-08,
     reproduite ici par le code du lot. */
  const h = makeHarness(AVANT_LOT_8);
  const out = h.verbs.rebuild({ document: sansOverrides(h.layers) });
  const champs = out.underived.map((entry) => entry.field);

  for (const champ of ["saves", "speeds", "vitals.hpMax", "identity.size", "spellcasting", "skills (arrière-plan)"]) {
    assert.ok(champs.includes(champ), `« ${champ} » doit être déclaré non dérivé`);
  }
  assert.equal(out.resolved.vitals.hpMax, undefined, "un nombre qu'on ne sait pas calculer est ABSENT, pas nul");
  assert.equal(out.resolved.saves, undefined, "et six sauvegardes non maîtrisées ne sont pas un défaut acceptable");
  assert.equal(out.resolved.speeds, undefined);
  assert.match(
    out.underived.find((entry) => entry.field === "vitals.hpMax").reason,
    /hit_die/,
    "la raison nomme le champ mécanique attendu, pas un vague « données manquantes »"
  );
  /* Le bonus de maîtrise, lui, vient de `class-progression` — un des trois
     genres déjà propres. Il est là. */
  assert.equal(out.resolved.proficiency, 2, "class-progression est complet depuis le lot 6");
});

test("un outil sans `ability_key` est SAUTÉ et NOMMÉ — jamais émis à moitié", () => {
  const h = makeHarness(AVANT_LOT_8);
  const nu = h.verbs.rebuild({ document: sansOverrides(h.layers) });
  assert.deepEqual(nu.resolved.tools, []);
  assert.match(nu.underived.find((e) => e.field === "tools").reason, /tool_id/,
    "sans `tool_id`, l'arrière-plan n'accorde aucun outil, et c'est ce qui est dit");

  /* Et le cran d'après : l'arrière-plan accorde bien l'outil, mais le record
     d'outil n'a pas de clef de caractéristique. `resolved.tools[].ability` est
     obligatoire : on ne pose pas une entrée à moitié, on nomme l'outil sauté. */
  h.layers.verbs.register({
    bytes: Buffer.from(JSON.stringify({
      schema: "fh-layer/1", id: "couche-outil", version: "1.0.0", name: "Outil", lang: "fr",
      flags: [], attribution: { license: "CC0-1.0" },
      records: {
        background: {
          "srd:background:fr:sage": {
            op: "patch",
            changes: { "data[tool_id]": "srd:tool:fr:materiel-de-calligraphe" }
          }
        }
      }
    }), "utf8"),
    origin: "test"
  });
  const out = h.verbs.rebuild({ document: sansOverrides(h.layers) });
  assert.deepEqual(out.resolved.tools, []);
  const entree = out.underived.find((e) => e.field === "tools[materiel-de-calligraphe]");
  assert.match(entree.reason, /ability_key/);
  assert.match(entree.reason, /N'EST PAS DANS LE CONTRAT/,
    "et la raison dit que le champ manque AU CONTRAT, pas seulement au record");
});

/* ── la classe d'armure, avec et sans armure ────────────────────────── */

test("la CA avec armure, et son refus platement quand le champ mécanique manque", () => {
  const h = makeHarness();
  const base = acceptanceDocument(h.layers);
  const index = COMPLEMENT_EQUIPEMENT.length / 3;

  const avecArmure = structuredClone(base);
  avecArmure.build.choices.push(
    { path: `gear[${index}]`, ref: { kind: "armor", id: "srd:armor:fr:armure-de-cuir" } },
    { path: `gear[${index}].quantity`, value: 1 },
    { path: `gear[${index}].equipped`, value: true },
    { path: `gear[${index + 1}]`, ref: { kind: "armor", id: "srd:armor:fr:bouclier" } },
    { path: `gear[${index + 1}].quantity`, value: 1 },
    { path: `gear[${index + 1}].equipped`, value: true }
  );
  const out = h.verbs.rebuild({ document: avecArmure });
  assert.equal(out.resolved.ac, 15, "cuir 11 + Dex 2 (sans plafond) + bouclier 2 — arbitrage B4 : « +2 » est un modificateur");

  /* Et sans les champs mécaniques : « 11 + modificateur de Dex » est une
     phrase. Rendre 10 + Dex avec une armure sur le dos serait une fiche
     fausse ET jouable, le pire des deux. */
  const sansChamps = makeHarness(AVANT_LOT_8);
  const doc = structuredClone(avecArmure);
  doc.build.overrides = [];
  doc.build.layers = manifestOf(sansChamps.layers);
  const degrade = sansChamps.verbs.rebuild({ document: doc });
  assert.equal(degrade.resolved.ac, undefined);
  assert.match(degrade.underived.find((e) => e.field === "ac").reason, /ac_base/);
});

/* ── les overrides ──────────────────────────────────────────────────── */

test("un override dans le vide JETTE — il tweake ce qui existe, il ne crée rien", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  doc.build.overrides = [{ path: "resolved.vitals.hpTemporaire", value: 3, by: "gm" }];
  assert.throws(() => h.verbs.rebuild({ document: doc }), (error) => {
    assert.match(error.message, /resolved\.vitals\.hpTemporaire/);
    assert.match(error.message, /il ne fabrique pas la case qui manque/);
    return true;
  });

  doc.build.overrides = [{ path: "resolved.skills[voltige].bonus", value: 9, by: "gm" }];
  assert.throws(() => h.verbs.rebuild({ document: doc }), /resolved\.skills\[voltige\]/);
});

test("⚠️ QUESTION 6 — un override sur un champ NON DÉRIVÉ jette aujourd'hui, et ce test le montre", () => {
  /* La conséquence mesurée de la règle « un override ne crée rien », posée
     ici pour l'architecte plutôt que décidée par le lot (loi §0.10).

     Le personnage d'exemple porte `resolved.vitals.hpMax = 9` en override du
     MJ. Tant que la couche ne porte pas `hit_die`, la dérivation ne produit
     PAS `hpMax` — et l'override, qui ne fabrique aucune case, jette.

     Deux lectures s'affrontent, et elles sont toutes deux dans l'architecture :
     « un override tweake ce qui existe » d'un côté ; « un seul chemin
     d'édition AVEC OU SANS couches : l'override » de l'autre. La seconde
     ferait de l'override le chemin de secours du MJ quand la pile ne sait pas
     nourrir un champ. Le lot n'a pas tranché : il tient la règle stricte, la
     rend visible ici, et pose la question. */
  const h = makeHarness(AVANT_LOT_8);
  assert.throws(() => h.verbs.rebuild({ document: acceptanceDocument(h.layers) }), (error) => {
    assert.match(error.message, /resolved\.vitals\.hpMax/);
    assert.match(error.message, /que la dérivation n'a pas produit/);
    return true;
  });
  // Alors que la même pile, sans cet override, rend une fiche jouable et honnête.
  const out = h.verbs.rebuild({ document: sansOverrides(h.layers) });
  assert.equal(out.resolved.vitals.hpMax, undefined);
  assert.ok(out.underived.some((entry) => entry.field === "vitals.hpMax"));
});

test("le verbe `override` exige de savoir QUI a écarté la règle", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.throws(() => h.verbs.override({ path: "resolved.ac", value: 18 }), /"player" ou "gm"/);
  assert.throws(() => h.verbs.override({ path: "resolved.ac", value: 18, by: "mj" }), /"player" ou "gm"/);
  const out = h.verbs.override({ path: "resolved.ac", value: 18, by: "gm", note: "armure prêtée" });
  assert.deepEqual(out.override, { path: "resolved.ac", replaced: false, kind: "override" });
  assert.equal(h.verbs.rebuild({}).resolved.ac, 18);
});

/* ── l'état de jeu ──────────────────────────────────────────────────── */

test("UNE RECONSTRUCTION NE SOIGNE PERSONNE — l'état de jeu traverse le pli", () => {
  const h = makeHarness();
  const premier = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.equal(premier.resolved.vitals.hpCurrent, 9, "un personnage neuf part en pleine forme, APRÈS les overrides");

  // La table joue : cinq points de dégâts, un emplacement dépensé, un état posé.
  const blesse = structuredClone(premier.document);
  blesse.resolved.vitals.hpCurrent = 4;
  blesse.resolved.vitals.tempHp = 2;
  blesse.resolved.vitals.conditions = ["exhaustion-1"];
  blesse.resolved.spellcasting.slots["1"].current = 1;

  const second = h.verbs.rebuild({ document: blesse });
  assert.equal(second.resolved.vitals.hpCurrent, 4, "le MJ corrige la fiche, il ne rend pas les points de vie");
  assert.equal(second.resolved.vitals.tempHp, 2);
  assert.deepEqual(second.resolved.vitals.conditions, ["exhaustion-1"]);
  assert.deepEqual(second.resolved.spellcasting.slots["1"], { max: 2, current: 1 });
  assert.equal(second.resolved.vitals.hpMax, 9, "et le maximum, lui, est bien re-dérivé");
});

/* ── l'événement et son diff ────────────────────────────────────────── */

test("`char-rebuilt` porte un diff en chemins d'OVERRIDE, jamais en index", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  const premier = h.bus.last("char-rebuilt");
  assert.ok(premier.diff.length > 0, "la première construction change tout");
  assert.ok(premier.diff.every((change) => change.path.startsWith("resolved.")));

  // Une décision change : un seul chemin bouge, et il est recopiable tel quel.
  h.verbs.set({ path: "class.skills[1]", value: "nature" });
  const out = h.verbs.rebuild({});
  const event = h.bus.last("char-rebuilt");
  assert.deepEqual(event.diff.map((change) => change.path).filter((path) => path.includes("skills")), [
    "resolved.skills[nature].bonus",
    "resolved.skills[nature].proficiency",
    "resolved.skills[religion].bonus",
    "resolved.skills[religion].proficiency"
  ], "l'ancre est l'IDENTITÉ du record, pas sa place dans la liste");
  assert.equal(event.id, out.document.id);
  assert.deepEqual(event.stack, out.document.build.layers);
  assert.deepEqual(event.underived, out.underived);

  // Rejouer le même pli deux fois ne produit AUCUN changement : le pli est déterministe.
  const encore = h.verbs.rebuild({});
  assert.deepEqual(
    diffResolved(out.resolved, encore.resolved).filter((change) => change.path !== "resolved.derivation.at"),
    []
  );
});

test("le `shadowed` de la pile REMONTE dans rebuild — il ne s'avale pas", () => {
  /* Arbitrage n°2 de contracts/layers.md : « `shadowed` remonte dans le
     résultat de `rebuild` ». Le bloc ne va pas le chercher — il s'abonne à
     `layers-changed`, qui est le seul moyen de savoir. */
  const h = makeHarness();
  const out = h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  assert.deepEqual(out.shadowed, [], "aucune couche n'en recouvre une autre dans cette pile");
  assert.deepEqual(out.warnings, [], "et l'événement a bien été reçu");

  /* Et quand il y en a un : la fixture repose un record que le SRD portait
     déjà, par `add`. */
  const bytes = Buffer.from(JSON.stringify({
    schema: "fh-layer/1", id: "couche-de-table", version: "1.0.0", name: "Table", lang: "fr",
    flags: [], attribution: { license: "CC0-1.0" },
    records: { skill: { "srd:skill:fr:perception": { op: "add", name: "Perception", slug: "perception", data: { ability_key: "wis" } } } }
  }), "utf8");
  h.layers.verbs.register({ bytes, origin: "test" });
  const doc = acceptanceDocument(h.layers);
  const apres = h.verbs.rebuild({ document: doc });
  assert.deepEqual(apres.shadowed, [{ kind: "skill", id: "srd:skill:fr:perception", by: "couche-de-table", over: "srd-5.2.1-fr" }]);
});

/* ── `validate` ─────────────────────────────────────────────────────── */

test("`validate` compte les compétences à choisir, et refuse un boost illégal", () => {
  const h = makeHarness();
  h.verbs.rebuild({ document: sans(h.layers, ["class.skills[1]"]) });
  let verdict = h.verbs.validate({});
  assert.equal(verdict.ok, false);
  assert.ok(verdict.violations.some((line) => /« class » fait choisir 2 compétence\(s\) et les choix en désignent 1/.test(line)));

  h.verbs.rebuild({ document: acceptanceDocument(h.layers) });
  h.verbs.set({ path: "background.boost.str", value: 2 });
  verdict = h.verbs.validate({});
  assert.ok(verdict.violations.some((line) => /background\.boost\.str/.test(line) && /ne nomme pas/.test(line)),
    "l'arrière-plan Sage nomme con, int et wis — pas str");
});

test("`validate` voit un ref mort, un don qui ne correspond pas, et ne change RIEN", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  const avant = structuredClone(doc);
  h.verbs.choose({ document: doc, path: "class.cantrips[0]", ref: { kind: "spell", id: "srd:spell:fr:sort-fantome" } });
  let verdict = h.verbs.validate({});
  assert.ok(verdict.violations.some((line) => /srd:spell:fr:sort-fantome/.test(line)));

  h.verbs.rebuild({ document: structuredClone(avant) });
  h.verbs.choose({ path: "background.feat", ref: { kind: "feat", id: "exemple:feat:fr:lecteur-de-marges" } });
  verdict = h.verbs.validate({});
  assert.ok(verdict.violations.some((line) => /background\.feat/.test(line) && /initie-a-la-magie/.test(line)));

  // `validate` n'écrit rien : le `resolved` du document n'a pas bougé.
  const apres = h.verbs.validate({});
  assert.deepEqual(apres, verdict);
});

/* ── la loi §0.12 : le SRD seul ─────────────────────────────────────── */

test("UN PERSONNAGE SRD PUR, SANS AUCUNE COUCHE FH, TRAVERSE LA DÉRIVATION DE BOUT EN BOUT", () => {
  /* La question de la loi §0.12, posée au code : « un personnage SRD pur,
     sans aucune couche FH chargée, traverse-t-il ce code de bout en bout ? »
     Ici, même pas de couche d'exemple : le SRD et la fixture mécanique, rien
     d'autre. Aucune ligne de `src/build/` ne cite la Destinée, le Chaos ni
     l'Overreach — c'est le garde de vocabulaire de `build-block` qui le tient
     structurellement ; celui-ci le tient à l'exécution. */
  const h = makeHarness({ layers: [SRD_FR] });
  const exemple = readJson("examples/personnage-srd-fr-niveau1.fh-char.json");
  const choices = exemple.build.choices
    .filter((choice) => !choice.ref || choice.ref.id.startsWith("srd:"))
    .filter((choice) => choice.path !== "feat.magicInitiate.cantrip" && choice.path !== "feat.extra");

  const doc = {
    schema: "fh-char/1", id: "srd-pur", name: "SRD pur", lang: "fr",
    units: exemple.units, created: exemple.created, modified: exemple.modified,
    build: {
      layers: manifestOf(h.layers),
      choices: [...choices, ...COMPLEMENT_NIVEAU, ...COMPLEMENT_BOURSE],
      overrides: []
    }
  };
  const out = h.verbs.rebuild({ document: doc });
  assert.equal(out.resolved.proficiency, 2);
  assert.equal(out.resolved.vitals.hpMax, 8, "sans l'override du MJ : d6 + Constitution 2");
  assert.equal(out.resolved.skills.length, 18);
  assert.equal(out.resolved.spellcasting.dc, 13);
  assert.equal(out.resolved.spellcasting.spells.length, 7, "les sept sorts SRD, sans le sort mineur du homebrew");
  assert.deepEqual(h.layers.verbs.flags(), [], "aucun drapeau de couche n'est levé");
  assert.equal(validateChar(out.document), true, ajv.errorsText(validateChar.errors));
});

/* ── choose / set, les deux moitiés d'une règle du schéma ───────────── */

test("`choose` pose un record, `set` pose un scalaire — jamais les deux, jamais aucun", () => {
  const h = makeHarness();
  const doc = acceptanceDocument(h.layers);
  assert.throws(() => h.verbs.choose({ document: doc, path: "class", value: "magicien" }), /pour un scalaire, c'est `set`/);
  assert.throws(() => h.verbs.set({ path: "class", ref: { kind: "class", id: "x" } }), /pour un record, c'est `choose`/);
  assert.throws(() => h.verbs.set({ path: "class", value: { kind: "class" } }), /une structure serait une règle déguisée/);
  assert.throws(() => h.verbs.choose({ path: "class", ref: { kind: "class", id: "x" }, value: 1 }), /exactement un/);

  // Une décision REMPLACE la précédente sur le même chemin.
  const out = h.verbs.set({ path: "abilities.str", value: 12 });
  assert.equal(out.choice.replaced, true);
  assert.equal(out.document.build.choices.filter((choice) => choice.path === "abilities.str").length, 1);
  assert.equal(h.verbs.rebuild({}).resolved.abilities.str.score, 12);

  /* Un chemin mal formé est refusé À L'ENTRÉE, là où le geste a lieu — pas
     à la reconstruction, loin de la main qui l'a écrit. */
  assert.throws(() => h.verbs.set({ path: "Class.skills", value: "x" }), /chemin de choix mal formé/);
  assert.throws(() => h.verbs.set({ path: "class.__proto__", value: "x" }), /clef interdite/);
  assert.throws(() => h.verbs.override({ path: "ac", value: 1, by: "gm" }), /chemin d'override mal formé/);
  assert.throws(() => h.verbs.override({ path: "resolved.skills[0].bonus", value: 1, by: "gm" }),
    /jamais par un index/);
});

test("le bloc rend des COPIES : l'appelant ne tient jamais l'objet du bloc", () => {
  const h = makeHarness();
  const entree = acceptanceDocument(h.layers);
  const out = h.verbs.rebuild({ document: entree });
  assert.equal(entree.resolved, undefined, "le document d'entrée n'a pas été mué");

  out.document.resolved.ac = 99;
  out.resolved.proficiency = 99;
  const encore = h.verbs.rebuild({});
  assert.equal(encore.resolved.proficiency, 2, "mutiler ce qu'on a reçu ne corrompt pas la tranche du bloc");
});
