/* ══ LOT 48 — `champs-identite` : LES TROIS CHAMPS QUE CONCEPT ET UNIVERSE
   DEVRONT ÉCRIRE ═══════════════════════════════════════════════════════════

   Avant ce lot, le genre, l'alignement et le nom de code de campagne
   n'existaient NULLE PART — ni dans `fh-char.schema.json`, ni dans aucun
   verbe du bloc `doc`. Ce fichier prouve les huit points de la commande (§2),
   dans l'ordre :

     1. ⚔️ LE TEST QUI PROUVE LE LOT : `describe` lit sa liste blanche DANS
        LE SCHÉMA — ajouter une propriété racine facultative de type
        `string` la rend AUSSITÔT écrivable, sans toucher au verbe.
     2. Les trois champs s'écrivent, se relisent à la racine, ne créent
        AUCUN choix dans `build.choices`, et ne reviennent jamais dans
        `unconsumed`.
     3. Ils sont facultatifs : un document sans eux valide, avant comme
        après ce lot.
     4. Un champ trop long est un refus NOMMÉ, jamais un silence.
     5. ⚔️ Le verbe REFUSE d'écrire un champ que le schéma ne déclare pas —
        y compris un champ qui EXISTE au schéma mais hors de la liste
        blanche (`name`, requis ; `generator`, structuré).
     6. `create` les accepte, et réussit AUSSI sans eux.
     7. `rename` est inchangé — il ignore ces champs s'ils traînent dans
        son payload, exactement comme avant ce lot.
     8. Le brouillon les porte aussi : `deriveDraftSchema` n'a rien à
        changer, et le test le montre.

   ⚠️ AUCUN OCTET N'EST ÉCRIT SUR LE DISQUE ICI : magasins en mémoire,
   comme `doc-create.test.mjs`. */

import test from "node:test";
import assert from "node:assert/strict";

import { DocError } from "../src/doc/index.mjs";
import { compileSchema, deriveDraftSchema, describableFields } from "../src/doc/schema.mjs";
import { charSchema, exampleDocument, makeDoc } from "./doc-harness.mjs";
import { acceptanceDocument, makeHarness as makeBuildHarness, manifestOf } from "./build-harness.mjs";

const FT_LB = { distance: "ft", weight: "lb" };
const BASE = { name: "Sonde", lang: "en", units: FT_LB, layers: [] };

/* ── 0. LA LISTE BLANCHE RÉELLE, MESURÉE ──────────────────────────────── */

test("0 — describableFields(fh-char.schema.json) rend exactement les trois champs, et rien d'autre", () => {
  assert.deepEqual(describableFields(charSchema()), ["alignment", "campaign", "gender"],
    "triée, et EXACTEMENT ces trois — ni `generator` (structuré, pas du texte), ni `name`/`lang` (requis)");
});

/* ── 1. ⚔️ LE TEST QUI PROUVE LE LOT ───────────────────────────────────── */

test("1 — ⚔️ describe lit sa liste blanche DANS LE SCHÉMA : une propriété ajoutée devient écrivable SANS toucher au verbe", () => {
  const enrichi = structuredClone(charSchema());
  /* Une propriété FICTIVE, jamais nommée par `store.mjs` ni par
     `schema.mjs` — si elle devient écrivable, ce n'est parce qu'AUCUNE
     ligne de code ne la connaît par avance, donc parce que la liste
     blanche est bien LUE, pas recopiée. Même geste que le test 8 du lot 47
     sur `deriveDraftSchema` (ajouter une clef à `required` sans toucher la
     fonction) — ici appliqué à `describableFields`. */
  enrichi.properties.callsign = { type: "string", maxLength: 40 };
  assert.ok(!("callsign" in enrichi.required), "facultatif : absent de `required`, comme les trois du lot");
  assert.deepEqual(describableFields(enrichi), ["alignment", "callsign", "campaign", "gender"]);

  const { verbs } = makeDoc({ schema: enrichi });
  const draft = verbs.create(BASE);
  const decrit = verbs.describe({ document: draft, callsign: "Nightshade" });
  assert.equal(decrit.callsign, "Nightshade", "le champ ajouté SEULEMENT au schéma est déjà écrivable");

  /* LE PENDANT, sur le VRAI schéma (non enrichi) : la même clef est un
     refus NOMMÉ — la liste blanche du verbe suit le schéma qu'on lui
     injecte, elle n'a rien deviné ni gardé en mémoire d'un appel précédent. */
  const reel = makeDoc();
  const draftReel = reel.verbs.create(BASE);
  assert.throws(() => reel.verbs.describe({ document: draftReel, callsign: "Nightshade" }),
    /« callsign ».+ne déclare pas ce champ/s,
    "sur le schéma réel, `callsign` n'existe pas : describe le refuse et le NOMME");
});

/* ── 2. ÉCRITURE, RELECTURE, AUCUN CHOIX, JAMAIS DANS unconsumed ──────── */

test("2 — les trois champs s'écrivent et se relisent à la racine, sans poser AUCUN choix", () => {
  const { verbs } = makeDoc();
  const draft = verbs.create(BASE);
  assert.equal(draft.build.choices.length, 0);

  const decrit = verbs.describe({
    document: draft, gender: "non-binaire, iel", alignment: "Chaotic Good (mostly)", campaign: "Le Sentier de Guilde"
  });
  assert.equal(decrit.gender, "non-binaire, iel");
  assert.equal(decrit.alignment, "Chaotic Good (mostly)");
  assert.equal(decrit.campaign, "Le Sentier de Guilde");
  assert.equal(decrit.build.choices.length, 0, "décrire n'est pas décider : AUCUN choix posé");
  assert.notEqual(decrit, draft, "l'appelant ne tient jamais l'objet d'entrée : c'est une COPIE");
  assert.equal("gender" in draft, false, "…preuve : le document d'entrée n'a pas bougé");
});

test("2bis — ⚔️ ATTAQUE : sur un document COMPLET, les trois champs ne reviennent JAMAIS dans `unconsumed`", () => {
  /* Même risque que le 6bis du lot 47 pour `name` : si ces champs entraient
     par un `build.set({path: "gender", …})`, ils poseraient un CHOIX que
     rien ne consomme, et resteraient à jamais dans `unconsumed`. `describe`
     n'écrit RIEN dans `build.choices` : ce test le prouve après un
     `rebuild` complet. */
  const harness = makeBuildHarness();
  const { verbs } = makeDoc();
  const reference = acceptanceDocument(harness.layers); // brouillon, choix pleins, pas de resolved

  const decrit = verbs.describe({
    document: reference, gender: "elfe, iel", alignment: "Lawful Neutral", campaign: "Varithond"
  });
  const report = harness.verbs.rebuild({ document: decrit });

  assert.equal(report.document.gender, "elfe, iel");
  assert.equal(report.document.alignment, "Lawful Neutral");
  assert.equal(report.document.campaign, "Varithond");
  for (const champ of ["gender", "alignment", "campaign"]) {
    assert.ok(!report.unconsumed.includes(champ),
      `« ${champ} » n'a rien à faire dans unconsumed : ${report.unconsumed.join(", ")}`);
  }
});

/* ── 3. FACULTATIFS : UN DOCUMENT SANS EUX VALIDE, AVANT COMME APRÈS ──── */

test("3 — facultatifs : le personnage d'exemple RÉEL (sans ces champs) valide toujours contre fh-char/1", () => {
  const strict = compileSchema(charSchema(), "fh-char/1");
  assert.deepEqual(strict.validate(exampleDocument()), [],
    "le fichier d'exemple du dépôt ne porte aucun des trois champs — ce lot ne le touche pas, et ne le rend pas invalide");
});

test("3bis — et un brouillon SANS eux valide aussi, à la sortie de create", () => {
  const { verbs } = makeDoc();
  const draft = verbs.create(BASE);
  assert.equal("gender" in draft, false);
  assert.equal("alignment" in draft, false);
  assert.equal("campaign" in draft, false);
  const draftSchema = deriveDraftSchema(charSchema());
  assert.deepEqual(compileSchema(draftSchema, "brouillon").validate(draft), []);
});

/* ── 4. UN CHAMP TROP LONG EST UN REFUS NOMMÉ ─────────────────────────── */

test("4 — un champ trop long est un refus NOMMÉ, jamais un silence — et la borne exacte passe", () => {
  const { verbs } = makeDoc();
  const draft = verbs.create(BASE);

  assert.throws(() => verbs.describe({ document: draft, gender: "x".repeat(61) }), /60 au maximum/);
  assert.throws(() => verbs.describe({ document: draft, alignment: "x".repeat(61) }), /60 au maximum/);
  assert.throws(() => verbs.describe({ document: draft, campaign: "x".repeat(81) }), /80 au maximum/);

  /* LES TÉMOINS : les bornes exactes passent. */
  assert.equal(verbs.describe({ document: draft, gender: "x".repeat(60) }).gender.length, 60);
  assert.equal(verbs.describe({ document: draft, alignment: "x".repeat(60) }).alignment.length, 60);
  assert.equal(verbs.describe({ document: draft, campaign: "x".repeat(80) }).campaign.length, 80);

  /* Chaque refus est un DocError, comme tout refus du bloc. */
  assert.throws(() => verbs.describe({ document: draft, gender: "x".repeat(61) }), (error) => {
    assert.ok(error instanceof DocError);
    return true;
  });
});

/* ── 5. ⚔️ LE VERBE REFUSE D'ÉCRIRE UN CHAMP QUE LE SCHÉMA NE DÉCLARE PAS ─ */

test("5 — ⚔️ describe refuse un champ inconnu, et NOMME celui qui est refusé", () => {
  const { verbs } = makeDoc();
  const draft = verbs.create(BASE);

  assert.throws(() => verbs.describe({ document: draft, faction: "Les Lames d'Argent" }), /« faction »/);

  /* LE CAS FIN : `generator` EXISTE au schéma, à la racine, facultatif —
     et il est quand même REFUSÉ par `describe`, parce qu'il n'est pas
     `type: "string"` (c'est un objet structuré à deux sous-champs). La
     liste blanche ne suit donc pas juste « existe et facultatif » : elle
     suit EXACTEMENT le filtre mesuré (§1b), pas une approximation plus
     large. */
  assert.throws(() => verbs.describe({ document: draft, generator: { name: "x", version: "1" } }),
    /« generator ».+ne déclare pas ce champ/s);

  /* ET `name` : requis, donc HORS liste blanche — `describe` ne peut pas
     faire le travail de `rename`, exactement l'inverse serait vrai aussi
     (§1d : « le schéma les coupe là, le verbe se coupe là »). */
  assert.throws(() => verbs.describe({ document: draft, name: "Vol de nom" }),
    /« name ».+ne déclare pas ce champ/s);

  /* PLUSIEURS clefs refusées d'un coup sont NOMMÉES ensemble, pas une par
     une au hasard d'un aller-retour. */
  assert.throws(() => verbs.describe({ document: draft, faction: "x", rang: "y" }),
    /« faction ».+« rang »|« rang ».+« faction »/s);
});

/* ── 6. create LES ACCEPTE, ET RÉUSSIT AUSSI SANS EUX ─────────────────── */

test("6 — create accepte les trois champs dès la naissance, et réussit AUSSI sans eux", () => {
  const { verbs } = makeDoc();

  const avecTout = verbs.create({
    ...BASE, gender: "homme", alignment: "Neutral Good", campaign: "Obvious Mimic"
  });
  assert.equal(avecTout.gender, "homme");
  assert.equal(avecTout.alignment, "Neutral Good");
  assert.equal(avecTout.campaign, "Obvious Mimic");

  const sansRien = verbs.create(BASE);
  assert.equal("gender" in sansRien, false);
  assert.equal("alignment" in sansRien, false);
  assert.equal("campaign" in sansRien, false);

  /* Un SEUL des trois, les deux autres restent absents — pas un défaut
     deviné pour les champs qu'on n'a pas donnés (§1c : « facultatif n'est
     pas deviné, c'est absent »). */
  const unSeul = verbs.create({ ...BASE, campaign: "Solo" });
  assert.equal(unSeul.campaign, "Solo");
  assert.equal("gender" in unSeul, false);
  assert.equal("alignment" in unSeul, false);
});

/* ── 7. rename EST INCHANGÉ ────────────────────────────────────────────── */

test("7 — rename ignore ces trois champs s'ils traînent dans son payload — ce n'est PAS son travail", () => {
  const { verbs } = makeDoc();
  const draft = verbs.create({ ...BASE, gender: "iel", alignment: "True Neutral", campaign: "Nymedes" });

  const renomme = verbs.rename({ document: draft, name: "Nouveau nom", gender: "IGNORÉ" });
  assert.equal(renomme.name, "Nouveau nom");
  assert.equal(renomme.gender, "iel", "rename ne touche QUE `name` — un `gender` dans son payload est ignoré, pas appliqué");
});

/* ── 8. deriveDraftSchema N'A RIEN À CHANGER ──────────────────────────── */

test("8 — deriveDraftSchema n'a rien à changer : les trois champs traversent la dérivation à l'identique", () => {
  const schema = charSchema();
  const draftSchema = deriveDraftSchema(schema);

  for (const champ of ["gender", "alignment", "campaign"]) {
    assert.deepEqual(draftSchema.properties[champ], schema.properties[champ],
      `${champ} n'a pas été touché par la dérivation — deriveDraftSchema ne filtre que \`required\`, ` +
      "jamais `properties`, et ces trois champs n'étaient de toute façon pas dans `required`");
  }
  assert.deepEqual(describableFields(draftSchema), describableFields(schema),
    "et la liste blanche de `describe`, lue sur le schéma de brouillon, est la MÊME que sur le schéma complet");
});
