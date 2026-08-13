/* ══ LOT 47 — `doc.create` ET `doc.rename` : LA PORTE QUE LE BUILDER N'AVAIT
   PAS ═══════════════════════════════════════════════════════════════════

   Avant ce lot, aucun verbe ne composait un `fh-char/1` de zéro, aucun verbe
   n'écrivait `document.name`, et le schéma n'admettait qu'une seule forme
   (un personnage COMPLET, `resolved` compris) — un personnage à moitié
   construit ne pouvait donc jamais être `save`-é. Ce fichier prouve les trois
   portes ouvertes par ce lot, dans l'ordre où la commande les énumère (§3) :

     1. `create` rend un document que `build.projectDecisions` sait lire.
     2. `create` ne dérive rien.
     3. `build.rebuild` sur ce document JETTE, et c'est voulu — les trois
        portes du moteur (niveau, classe, caractéristiques), une par une.
     4. Une fois ces trois portes franchies, le MÊME document valide
        `fh-char/1` STRICT (celui qui exige `resolved`), sans conversion.
     5. Un nom vide ou trop long est un refus nommé.
     6. `rename` écrit `name` à la racine et ne pose AUCUN choix.
     7. Un brouillon voyage — save/open/export/import — à l'octet près.
     8. Le schéma de brouillon est DÉRIVÉ de `fh-char/1`, jamais recopié.
     9. `doc.list` distingue un brouillon d'un personnage complet.
    10. Un personnage complet s'enregistre exactement comme avant.

   ⚠️ AUCUN OCTET N'EST ÉCRIT SUR LE DISQUE ICI : les magasins sont en
   mémoire, comme dans `doc-acceptance.test.mjs` — ce n'est possible que
   parce que le stockage est injecté (décision D1). */

import test from "node:test";
import assert from "node:assert/strict";

import { DocError } from "../src/doc/index.mjs";
import { compileSchema, deriveDraftSchema } from "../src/doc/schema.mjs";
import { projectDecisions } from "../src/build/index.mjs";
import {
  charSchema, exampleDocument, makeDoc, memoryStorage
} from "./doc-harness.mjs";
import {
  SRD_EN, FH_SPECIES_EN, acceptanceDocument, makeHarness as makeBuildHarness, manifestOf
} from "./build-harness.mjs";

const FT_LB = { distance: "ft", weight: "lb" };

/* ── 1. `create` REND UN DOCUMENT QUE `projectDecisions` SAIT LIRE ────── */

test("1 — create rend un document que projectDecisions sait lire, et publie déjà les trois listes de records", () => {
  /* La pile MESURÉE par la commande (§0.3) : SRD anglais + espèces FH donne
     exactement `class` (12 options) et `species` (12) sur `choices: []`.
     Vérifié en dehors de la suite avant d'écrire ce test — ne pas le relire
     comme un nombre magique : c'est une mesure, pas une supposition. */
  const harness = makeBuildHarness({ layers: [SRD_EN, FH_SPECIES_EN] });
  const { verbs } = makeDoc();

  const draft = verbs.create({
    name: "Nouveau personnage", lang: "en", units: FT_LB, layers: manifestOf(harness.layers)
  });
  assert.equal(draft.build.choices.length, 0, "un document neuf n'a encore RIEN choisi");

  const query = (payload) => harness.layers.verbs.query(payload);
  const entries = projectDecisions({ query, choices: draft.build.choices });
  const byPath = Object.fromEntries(entries.map((entry) => [entry.path, entry]));

  assert.ok(byPath.class, "`class` doit être publié même sans aucun choix posé");
  assert.equal(byPath.class.options.length, 12, "mesuré §0.3 : 12 classes sur cette pile");
  assert.ok(byPath.species, "`species` doit être publié aussi");
  assert.equal(byPath.species.options.length, 12, "mesuré §0.3 : 12 espèces sur cette pile (SRD + fh-species)");
  assert.ok(byPath.background, "et la troisième liste, `background`");
  assert.ok(byPath.background.options.length > 0, "le SRD porte au moins un arrière-plan");
});

/* ── 2. `create` NE DÉRIVE PAS ────────────────────────────────────────── */

test("2 — create ne dérive pas : le document rendu n'a pas de `resolved`", () => {
  const { verbs } = makeDoc();
  const draft = verbs.create({ name: "Vide", lang: "en", units: FT_LB, layers: [] });

  assert.equal("resolved" in draft, false, "créer et dériver sont deux gestes (§2a) — `create` ne fait que le premier");
  assert.deepEqual(Object.keys(draft).sort(),
    ["build", "created", "id", "lang", "modified", "name", "schema", "units"],
    "la forme exacte mesurée au §0.1 de la commande : fh-char/1 MOINS resolved");
  assert.deepEqual(Object.keys(draft.build).sort(), ["budgets", "choices", "layers", "overrides"]);
  assert.deepEqual(draft.build.choices, []);
  assert.deepEqual(draft.build.budgets, {});
  assert.deepEqual(draft.build.overrides, []);
});

/* ── 3. `rebuild` SUR CE DOCUMENT JETTE — LES TROIS PORTES ────────────── */

test("3 — ⚔️ rebuild sur ce document JETTE, et c'est NORMAL : les trois portes, une par une (§0.3)", () => {
  const harness = makeBuildHarness({ layers: [SRD_EN] });
  const { verbs } = makeDoc();
  const draft = verbs.create({
    name: "Portes", lang: "en", units: FT_LB, layers: manifestOf(harness.layers)
  });

  /* PORTE 1 — `choices: []`, tel que `create` le rend. */
  assert.throws(() => harness.verbs.rebuild({ document: draft }),
    /aucun choix `level`/,
    "sans aucun choix, le moteur refuse en nommant le niveau — pas un refus générique");

  /* PORTE 2 — le niveau seul : « pas une dérivation incomplète, une
     dérivation IMPOSSIBLE » (mot pour mot §0.3). */
  const withLevel = structuredClone(draft);
  withLevel.build.choices.push({ path: "level", value: 1 });
  assert.throws(() => harness.verbs.rebuild({ document: withLevel }),
    /un personnage sans classe n'est pas une dérivation incomplète, c'est une dérivation impossible/);

  /* PORTE 3 — niveau + classe : les six scores de caractéristique manquent. */
  const withClass = structuredClone(withLevel);
  withClass.build.choices.push({ path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } });
  assert.throws(() => harness.verbs.rebuild({ document: withClass }),
    /les six scores de caractéristique sont des CHOIX, et ceux-ci manquent/);
});

/* ── 4. LES TROIS PORTES FRANCHIES → VALIDE fh-char/1 SANS CONVERSION ─── */

test("4 — le document neuf, ses trois portes franchies, valide fh-char/1 SANS conversion (§1c)", () => {
  const harness = makeBuildHarness(); // SRD-fr + homebrew-fr : la pile de l'acceptation
  const { verbs } = makeDoc();
  const draft = verbs.create({
    name: "Sylvane Aubelame (recomposée)", lang: "fr", units: { distance: "m", weight: "kg" },
    layers: manifestOf(harness.layers)
  });

  /* Les choix PROUVÉS de l'acceptation : create → choix → rebuild → valide.
     `budgets`/`overrides` viennent avec, `external` reste absent (le
     brouillon n'en avait pas, et ce lot n'en fabrique pas). */
  const reference = acceptanceDocument(harness.layers);
  draft.build.choices = structuredClone(reference.build.choices);
  draft.build.budgets = structuredClone(reference.build.budgets);
  draft.build.overrides = structuredClone(reference.build.overrides);

  const report = harness.verbs.rebuild({ document: draft });
  assert.ok(report.document.resolved, "rebuild a posé `resolved` — la graduation");

  /* AUCUNE CONVERSION : le MÊME document, jugé par le validateur STRICT —
     celui qui exige `resolved` — pas par le brouillon dérivé. */
  const strict = compileSchema(charSchema(), "fh-char/1");
  const violations = strict.validate(report.document);
  assert.deepEqual(violations, [], violations.join(" | "));

  /* Et le pendant : le MÊME document reste admissible par doc.save. */
  const ecrit = verbs.save({ document: report.document, expect: null });
  assert.equal(verbs.open({ id: report.document.id }).document.name, "Sylvane Aubelame (recomposée)");
  assert.equal(verbs.list().find((entry) => entry.id === report.document.id).draft, false);
  assert.ok(ecrit.hash);
});

/* ── 5. UN NOM VIDE, OU DE 201 CARACTÈRES, EST UN REFUS NOMMÉ ─────────── */

test("5 — un nom vide, ou de 201 caractères, est un refus NOMMÉ — à `create` comme à `rename`", () => {
  const { verbs } = makeDoc();
  const base = { lang: "en", units: FT_LB, layers: [] };

  assert.throws(() => verbs.create({ ...base, name: "" }), (error) => {
    assert.ok(error instanceof DocError);
    assert.match(error.message, /au moins 1 attendu/);
    return true;
  });
  assert.throws(() => verbs.create({ ...base, name: "x".repeat(201) }), (error) => {
    assert.ok(error instanceof DocError);
    assert.match(error.message, /200 au maximum/);
    return true;
  });

  const draft = verbs.create({ ...base, name: "Nom valide" });
  assert.throws(() => verbs.rename({ document: draft, name: "" }), /au moins 1 attendu/);
  assert.throws(() => verbs.rename({ document: draft, name: "y".repeat(201) }), /200 au maximum/);

  /* LE TÉMOIN : les bornes exactes passent, 1 et 200. */
  assert.equal(verbs.create({ ...base, name: "x" }).name, "x");
  assert.equal(verbs.create({ ...base, name: "x".repeat(200) }).name.length, 200);
});

test("create refuse l'appel incomplet, et NOMME le champ manquant (décision D3, aucun défaut deviné)", () => {
  const { verbs } = makeDoc();
  const complete = { name: "X", lang: "en", units: FT_LB, layers: [] };
  for (const missing of ["name", "lang", "units", "layers"]) {
    const partial = { ...complete };
    delete partial[missing];
    assert.throws(() => verbs.create(partial), (error) => {
      assert.ok(error instanceof DocError, `create sans \`${missing}\` doit refuser via un DocError`);
      assert.match(error.message, /décision D3/, `le refus doit citer la décision D3 — reçu : ${error.message}`);
      assert.match(error.message, new RegExp(`« ${missing} » manque`),
        `le refus doit NOMMER \`${missing}\` — reçu : ${error.message}`);
      return true;
    }, `create sans \`${missing}\` doit refuser et le NOMMER`);
  }
});

/* ── 6. `rename` : LE NOM SE RELIT, ET NE POSE AUCUN CHOIX ────────────── */

test("6 — le nom écrit se relit à la racine, et NE CRÉE AUCUN CHOIX", () => {
  const harness = makeBuildHarness();
  const { verbs } = makeDoc();
  const draft = verbs.create({
    name: "Provisoire", lang: "fr", units: { distance: "m", weight: "kg" }, layers: manifestOf(harness.layers)
  });

  const renamed = verbs.rename({ document: draft, name: "Sylvane, réellement" });
  assert.equal(renamed.name, "Sylvane, réellement", "le nom se relit à la racine");
  assert.equal(renamed.build.choices.length, 0, "renommer ne pose AUCUN choix");
  assert.notEqual(renamed, draft, "et l'appelant ne tient jamais l'objet d'entrée : c'est une COPIE");
  assert.equal(draft.name, "Provisoire", "…preuve : le document d'entrée n'a pas bougé");
});

test("6bis — ⚔️ ATTAQUE : sur un document COMPLET, `name` ne revient JAMAIS dans `unconsumed`", () => {
  /* Le risque mesuré au §0.2 de la commande : `build.set({path:"name", …})`
     poserait un CHOIX que rien ne consomme, et `name` resterait à jamais
     dans `unconsumed`. `rename` n'écrit RIEN dans `build.choices` : ce test
     prouve qu'après un `rename` suivi d'un `rebuild` complet, `name`
     n'apparaît nulle part dans ce que le moteur dit avoir ignoré. */
  const harness = makeBuildHarness();
  const { verbs } = makeDoc();
  const reference = acceptanceDocument(harness.layers); // brouillon, choix pleins, pas de `resolved`

  const full = verbs.rename({ document: reference, name: "Nom changé après coup" });
  const report = harness.verbs.rebuild({ document: full });

  assert.equal(report.document.name, "Nom changé après coup");
  assert.ok(!report.unconsumed.includes("name"),
    `« name » n'a rien à faire dans unconsumed : ${report.unconsumed.join(", ")}`);
});

/* ── 7. UN BROUILLON VOYAGE, À L'OCTET PRÈS ───────────────────────────── */

test("7 — un brouillon s'enregistre, se relit, s'exporte et se réimporte — à l'octet", () => {
  const { verbs } = makeDoc();
  const draft = verbs.create({ name: "Brouillon voyageur", lang: "en", units: FT_LB, layers: [] });

  const ecrit = verbs.save({ document: draft, expect: null });
  const ouvert = verbs.open({ id: draft.id });
  assert.deepEqual(ouvert.document, draft);
  assert.equal("resolved" in ouvert.document, false, "un brouillon relu reste un brouillon");

  const valise = verbs.export({ id: draft.id });
  assert.equal(valise.hash, ecrit.hash);

  const ailleurs = makeDoc({ storage: memoryStorage() });
  assert.deepEqual(ailleurs.verbs.list(), [], "le magasin d'arrivée est VIERGE");
  const arrivee = ailleurs.verbs.import({ bytes: valise.bytes });
  assert.equal(arrivee.hash, ecrit.hash);

  const retour = ailleurs.verbs.export({ id: draft.id });
  assert.equal(Buffer.compare(Buffer.from(retour.bytes), Buffer.from(valise.bytes)), 0,
    "le voyage complet rend les mêmes octets");
  assert.deepEqual(ailleurs.verbs.open({ id: draft.id }).document, draft);
});

/* ── 8. LE SCHÉMA DE BROUILLON EST DÉRIVÉ, PAS RECOPIÉ ────────────────── */

test("8 — ⚔️ le schéma de brouillon est DÉRIVÉ de fh-char/1, jamais recopié", () => {
  const schema = charSchema();
  const original = [...schema.required];

  const draftSchema = deriveDraftSchema(schema);
  assert.deepEqual(schema.required, original, "deriveDraftSchema NE MUTE PAS ce qu'on lui donne");
  assert.ok(!draftSchema.required.includes("resolved"), "`resolved` sort du required du brouillon");
  assert.ok(draftSchema.required.includes("name"), "et le reste de `required` survit tel quel");
  assert.equal(draftSchema.required.length, schema.required.length - 1,
    "une seule clef retirée, aucune autre touchée");

  /* L'ATTAQUE : une clef requise ajoutée à fh-char/1 doit AUSSITÔT devenir
     requise au brouillon aussi, sans qu'une ligne de deriveDraftSchema ne
     change — la seule preuve qui montre une DÉRIVATION plutôt qu'une copie
     figée au moment où ce lot a été écrit. */
  const enrichi = structuredClone(schema);
  enrichi.required.push("banner");
  const draftEnrichi = deriveDraftSchema(enrichi);
  assert.ok(draftEnrichi.required.includes("banner"),
    "si ce test rougit, la dérivation recopie une liste au lieu de lire `required` en direct");
  assert.ok(!draftEnrichi.required.includes("resolved"));

  /* ET LE PENDANT : le validateur compilé depuis le brouillon dérivé admet
     un document sans `resolved`, et le validateur du schéma BRUT le refuse
     toujours — les deux bouts de la promesse du §2c, sur le MÊME couple
     schéma/document. */
  const sansResolved = exampleDocument();
  delete sansResolved.resolved;
  assert.deepEqual(compileSchema(draftSchema, "brouillon").validate(sansResolved), []);
  const violationsStrict = compileSchema(schema, "fh-char/1").validate(sansResolved);
  assert.ok(violationsStrict.length > 0, "le schéma BRUT, lui, continue d'exiger `resolved`");
  assert.ok(violationsStrict.some((line) => /resolved/.test(line)));
});

/* ── 9. `doc.list` DISTINGUE UN BROUILLON D'UN PERSONNAGE COMPLET ─────── */

test("9 — doc.list distingue un brouillon d'un personnage complet", () => {
  const { verbs } = makeDoc();
  const draft = verbs.create({ name: "Brouillon", lang: "en", units: FT_LB, layers: [] });
  verbs.save({ document: draft, expect: null });
  verbs.save({ document: exampleDocument() }); // complet, `resolved` compris

  const entries = verbs.list();
  const byId = Object.fromEntries(entries.map((entry) => [entry.id, entry]));

  assert.equal(byId[draft.id].draft, true);
  assert.equal(byId[draft.id].level, null, "un brouillon n'a pas de niveau à lire — pas de plantage, un `null`");
  assert.equal(byId["exemple-sylvane-aubelame"].draft, false);
  assert.equal(byId["exemple-sylvane-aubelame"].level, 1);

  /* ET LE PENDANT : `list` reste le seul verbe qui ne jette jamais, même
     pour un brouillon — l'ajout de §2c ne réintroduit pas de plantage sur
     `document.resolved.identity.level` quand `resolved` est absent. */
  assert.doesNotThrow(() => verbs.list());
});

/* ── 10. UN PERSONNAGE COMPLET S'ENREGISTRE EXACTEMENT COMME AVANT ────── */

test("10 — un personnage complet reste enregistrable exactement comme avant — ce lot ne retire rien", () => {
  const { verbs } = makeDoc();
  const complet = exampleDocument();
  const ecrit = verbs.save({ document: complet });
  assert.equal(ecrit.replaced, false);
  assert.deepEqual(verbs.open({ id: complet.id }).document, complet);
  assert.equal(verbs.list()[0].draft, false);
  assert.equal(verbs.list()[0].level, complet.resolved.identity.level);

  const valise = verbs.export({ id: complet.id });
  const ailleurs = makeDoc({ storage: memoryStorage() });
  ailleurs.verbs.import({ bytes: valise.bytes });
  assert.deepEqual(ailleurs.verbs.open({ id: complet.id }).document, complet);
});

/* ── L'ID DE `create` : PRODUIT PAR LE BLOC, PAS REÇU ──────────────────── */

test("l'id de `create` est produit par le bloc, respecte son motif, et deux appels ne collisionnent pas", () => {
  const { verbs } = makeDoc();
  const a = verbs.create({ name: "A", lang: "en", units: FT_LB, layers: [] });
  const b = verbs.create({ name: "B", lang: "en", units: FT_LB, layers: [] });
  assert.notEqual(a.id, b.id, "deux documents neufs ne partagent pas leur id");
  assert.match(a.id, /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/, "l'id respecte le motif du schéma ($defs sur `id`)");
  /* `create` n'a pas reçu d'id en entrée — contrairement à `duplicate`, qui
     EXIGE `as` (loi §0.10). Ici il n'y a encore personne à qui laisser le
     choix : `create` le produit lui-même, et ignore un `id` fourni de
     force plutôt que de le laisser mentir sur ce qu'il a produit. */
  const forced = verbs.create({ id: "id-impose", name: "C", lang: "en", units: FT_LB, layers: [] });
  assert.notEqual(forced.id, "id-impose", "`create` ne laisse jamais l'appelant choisir son id");
});
