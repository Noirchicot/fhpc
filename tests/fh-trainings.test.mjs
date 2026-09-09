/* ══ LA COUCHE DES TRAININGS — DOUZE LANGUES ET LE GARROT ══════════════
   Lot 184-fh-skills-fendu-en-trois. Ces gardes vivaient dans
   `tests/fh-skills.test.mjs` depuis le lot 82 ; ils suivent le catalogue dans
   sa couche à lui.

   🔴 POURQUOI LA COUCHE EXISTE. `Trainings` est l'un des six interrupteurs de
   l'écran `Rules` (ARCHITECTURE.md, « La coupe des couches », 08/09). Tant
   qu'il vivait dans `fh-skills-en`, l'éteindre emportait le pool de points des
   douze classes.

   ⚠️ ON NOMME LES VALEURS, ON NE COMPTE PAS. « 13 trainings » passerait avec
   treize mauvais ; les treize noms sont donc épinglés, écrits à la main depuis
   le canon et jamais calculés depuis la source du générateur — une attente
   tirée de ce qu'elle vérifie ne vérifie rien.

   ⚠️ CETTE SUITE N'ÉCRIT QUE DANS UN RÉPERTOIRE TEMPORAIRE. `layers/` est un
   artefact commité. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createLayers } from "../src/layers/index.mjs";
import {
  ROOT,
  SRD_EN,
  FH_SPECIES_EN,
  FH_TRAININGS_EN,
  fileBytes,
  makeBus
} from "./build-harness.mjs";
import {
  buildLayer,
  generate,
  languesProduites,
  readSrdLayer,
  serialize,
  GenError
} from "../src/tools/gen-fh-trainings-layer.mjs";
import { EXPECTED, TRAININGS_ADDED } from "../src/tools/fh-trainings-source.mjs";

const SRD_PATH = join(ROOT, SRD_EN);

/** Les treize noms, épinglés depuis le canon §B.3 (Eric, 2026-08-18). */
const LES_13 = [
  "Araag", "Dragonborn", "Dwarf", "Elestu", "Elf", "Garrot", "Goliath",
  "Halfling", "Hoddon", "Human", "Loroka", "Orc", "Tiefling"
];

function pile({ trainings = true } = {}) {
  const bus = makeBus();
  const layers = createLayers({ bus });
  layers.verbs.register({ bytes: fileBytes(SRD_EN), origin: SRD_EN });
  if (trainings) layers.verbs.register({ bytes: fileBytes(FH_TRAININGS_EN), origin: FH_TRAININGS_EN });
  return layers.verbs;
}

/* ══ LOT 82 — LE CATALOGUE DES TRAININGS ══════════════════════════════ */

test("les treize trainings sont NOMMÉS — douze langues, une par peuple, plus le Garrot", () => {
  const verbs = pile();
  const catalogue = verbs.query({ kind: "training" });
  assert.equal(catalogue.length, EXPECTED.trainings);

  /* ⛔ ON NOMME, ON NE COMPTE PAS. « 13 » passerait avec treize mauvais. */
  assert.deepEqual(catalogue.map((v) => v.record.name).sort(), [...LES_13].sort(),
    "une langue par peuple, portant SON nom — pas d'Elvish, pas de Dwarvish : les formes " +
    "adjectivales du SRD tombent (canon §B.3, Eric 2026-08-18)");
});

test("⛔ UN TRAINING N'A NI PALIER NI CARACTÉRISTIQUE — c'est ce qui en fait un genre à part", () => {
  const verbs = pile();
  for (const vue of verbs.query({ kind: "training" })) {
    const data = vue.record.data;
    assert.equal(Number.isInteger(data.cost) && data.cost >= 1, true,
      `« ${vue.id} » doit porter son coût sur SON record — un training que le moteur ne sait pas tarifer ` +
      "est un training qu'il ne peut pas vendre");
    for (const interdit of ["ability", "ability_key", "tier_costs"]) {
      assert.equal(data[interdit], undefined,
        `« ${vue.id} » ne doit porter aucun \`${interdit}\` : on sait un training, on ne le pratique pas à ` +
        "un palier. Le loger chez les outils forcerait tout lecteur à tester un champ pour savoir ce " +
        "qu'il tient (loi §0.6) — c'est la raison d'être du genre.");
    }
    /* ⛔ ET PAS DE `from_level` : son ABSENCE est la règle générique (niveau 4,
       canon §B.3), sa PRÉSENCE serait la dérogation. Écrire 4 rendrait les
       deux indistinguables. */
    assert.equal(data.from_level, undefined,
      `« ${vue.id} » : le niveau générique se lit dans l'ABSENCE du champ, jamais dans un 4 recopié`);
  }
});

test("⛔ LES DOUZE LANGUES CONTRE LES DOUZE ESPÈCES — dans les deux sens", () => {
  /* ⚠️ CE TEST MONTE AUSSI LES ESPÈCES, et il le doit. La pile de cette suite
     ne porte que le SRD et les trainings : les espèces Fate's Hand (Araag,
     Elestu, Loroka) n'y sont pas, et le Gnome n'y est pas encore Hoddon.
     Comparer les langues à cette pile-là mesurerait la mauvaise réalité — la
     correspondance est avec les DOUZE ESPÈCES JOUABLES, celles que le joueur
     voit. */
  const bus = makeBus();
  const layers = createLayers({ bus });
  for (const couche of [SRD_EN, FH_SPECIES_EN, FH_TRAININGS_EN]) {
    layers.verbs.register({ bytes: fileBytes(couche), origin: couche });
  }
  const verbs = layers.verbs;

  const langues = verbs.query({ kind: "training" })
    .filter((v) => v.record.data.category === "language")
    .map((v) => v.record.slug.replace(/^language-/, "")).sort();
  const especes = verbs.query({ kind: "species" }).map((v) => v.record.slug).sort();

  assert.equal(langues.length, especes.length,
    "un peuple muet et une langue orpheline passeraient toutes deux si on se contentait de compter d'un côté");
  assert.deepEqual(langues, especes,
    "chaque peuple jouable a sa langue, et aucune langue ne mène nulle part");
});

test("⛔ LES RITUELS SOMBRES NE SONT PAS DES TRAININGS — mesuré, pas supposé", () => {
  /* Le canon les annonçait trainings. Mesuré dans le chapitre qui les définit
     (`6. Spells & Magic/Dark Rituals.md`) : un rite est gaté par le NIVEAU
     CUMULÉ de ses lanceurs et par leur classe de lanceur de sorts, et payé en
     points de Destinée et en dégâts nécrotiques. Nulle part il n'est dit qu'on
     APPREND un rituel. Un rite se pratique, il ne se connaît pas. */
  const verbs = pile();
  const octets = JSON.stringify(verbs.query({ kind: "training" }));
  assert.equal(/ritual|rite/i.test(octets), false,
    "aucun rituel dans le catalogue : le canon est corrigé, et l'économie de points suit un chapitre " +
    "au lieu d'en annexer un");
});

/* ══ LOT 184 — LA COUCHE EST UN INTERRUPTEUR, ET ELLE NE FAIT QUE ÇA ═══ */

test("🔴 LOT 184 — la couche ne porte QUE le genre `training`, et rien du SRD ne bouge", () => {
  const couche = JSON.parse(readFileSync(join(ROOT, FH_TRAININGS_EN), "utf8"));
  assert.deepEqual(Object.keys(couche.records), ["training"],
    "un genre de plus ici, et l'interrupteur `Trainings` recommence à emporter autre chose que lui");
  assert.deepEqual(couche.flags, ["fh.trainings"]);
  /* ⛔ AUCUN `op` : cette couche n'éteint rien et ne patche rien. Le mesurer
     est ce qui permet de dire que l'éteindre ne RESTITUE rien non plus — un
     joueur qui coupe les Trainings perd des langues, il n'en retrouve pas
     d'autres. */
  const ops = Object.values(couche.records.training).map((r) => r.op).filter(Boolean);
  assert.deepEqual(ops, [], "treize additions, zéro retrait, zéro patch");
});

test("🔴 LOT 184 — sans la couche, la pile ne rend AUCUN training, et le SRD n'en a jamais porté", () => {
  /* ⚔️ LE TÉMOIN QUI FAIT DE L'AUTRE UN GARDE. Sans lui, « 13 trainings » se
     lirait aussi bien sur une pile qui les tiendrait d'ailleurs.
     📏 Et c'est mesuré sur la couche SRD commitée : elle ne porte aucun
     catalogue de langues — il n'y avait rien à reprendre, même en le voulant. */
  const verbs = pile({ trainings: false });
  assert.deepEqual(verbs.query({ kind: "training" }), [],
    "les treize trainings viennent de CETTE couche, et d'elle seule");
  const srd = readSrdLayer(SRD_PATH);
  assert.equal(Object.hasOwn(srd.records, "training"), false,
    "le SRD 5.2.1 ne porte pas le genre `training` : le catalogue est intégralement maison");
});

/* ══ LE GÉNÉRATEUR — REPRODUCTIBILITÉ ET REFUS ═════════════════════════ */

test("le fichier commité est EXACTEMENT ce que le générateur produit", () => {
  const { layer } = buildLayer({ srd: readSrdLayer(SRD_PATH) });
  assert.equal(serialize(layer), readFileSync(join(ROOT, FH_TRAININGS_EN), "utf8"),
    "un re-run doit laisser l'arbre propre (loi §0.3)");
});

test("deux générations d'affilée rendent le même octet", () => {
  const dir = mkdtempSync(join(tmpdir(), "fh-trainings-"));
  try {
    const a = generate({ outDir: dir, srdPath: SRD_PATH });
    const premier = readFileSync(a.outPath, "utf8");
    const b = generate({ outDir: dir, srdPath: SRD_PATH });
    assert.equal(readFileSync(b.outPath, "utf8"), premier, "le générateur est déterministe");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("REFUS — une espèce jouable sans sa langue fait jeter, en la NOMMANT", () => {
  /* ⚔️ LE GARDE, ÉPROUVÉ ROUGE. On enlève une langue le temps d'une passe et
     on la rend : un garde qu'on n'a jamais vu accuser ne protège rien. */
  const index = TRAININGS_ADDED.findIndex((e) => e.slug === "language-hoddon");
  assert.notEqual(index, -1, "témoin — la langue qu'on va retirer existe bien dans la source");
  const [retirée] = TRAININGS_ADDED.splice(index, 1);
  try {
    assert.throws(() => buildLayer({ srd: readSrdLayer(SRD_PATH) }),
      (e) => e instanceof GenError && /hoddon/.test(e.message));
  } finally {
    TRAININGS_ADDED.splice(index, 0, retirée);
  }
  assert.doesNotThrow(() => buildLayer({ srd: readSrdLayer(SRD_PATH) }));
});

test("REFUS — une langue qui ne correspond à aucun peuple fait jeter", () => {
  const intruse = { slug: "language-gnome", name: "Gnome", category: "language", cost: 1, description: "x" };
  TRAININGS_ADDED.push(intruse);
  try {
    assert.throws(() => buildLayer({ srd: readSrdLayer(SRD_PATH) }),
      (e) => e instanceof GenError && /gnome/.test(e.message));
  } finally {
    TRAININGS_ADDED.pop();
  }
});

test("REFUS — un training que le moteur ne sait pas tarifer fait jeter", () => {
  const garrot = TRAININGS_ADDED.find((e) => e.slug === "garrot");
  const cost = garrot.cost;
  try {
    garrot.cost = 0;
    assert.throws(() => buildLayer({ srd: readSrdLayer(SRD_PATH) }),
      (e) => e instanceof GenError && /tarifer/.test(e.message));
  } finally {
    garrot.cost = cost;
  }
});

test("REFUS — un training qui existerait DÉJÀ au SRD serait un ajout qui en recouvre un autre", () => {
  /* ⚔️ CE GARDE NE PEUT PAS MORDRE AUJOURD'HUI — le SRD ne porte pas le genre.
     Il est donc éprouvé sur une couche SRD ENRICHIE, pas sur la vraie : une
     assertion qui ne peut jamais accuser est le pire des gardes. */
  const srd = JSON.parse(JSON.stringify(readSrdLayer(SRD_PATH)));
  srd.records.training = {
    "fh:training:en:garrot": { name: "Garrot", slug: "garrot", data: { category: "weapon", cost: 1 } }
  };
  assert.throws(() => buildLayer({ srd }),
    (e) => e instanceof GenError && /recouvre/.test(e.message));
});

test("REFUS — un catalogue sans une seule langue ferait un octroi vide", () => {
  /* `languesProduites` est la porte par laquelle l'Inheritance prend sa liste.
     Zéro langue n'est pas « rien à offrir » : c'est un menu vide affiché sous
     la phrase « choisis deux langues ». */
  assert.throws(() => languesProduites({
    "fh:training:en:garrot": { data: { category: "weapon" } }
  }), (e) => e instanceof GenError && /menu vide/.test(e.message));
});

test("REFUS — une prose du SRD recopiée à la main dans un training fait jeter", () => {
  const garrot = TRAININGS_ADDED.find((e) => e.slug === "garrot");
  const description = garrot.description;
  const srd = readSrdLayer(SRD_PATH);
  /* Une phrase RÉELLE du SRD, prise dans la couche commitée — pas une phrase
     inventée qui ressemblerait à du SRD. */
  const phraseSrd = Object.values(srd.records.tool)
    .map((r) => (r.data || {}).utilize)
    .find((v) => typeof v === "string" && v.length >= 40);
  assert.ok(phraseSrd, "témoin — la couche SRD porte bien une phrase assez longue pour être attrapée");
  try {
    garrot.description = phraseSrd;
    assert.throws(() => buildLayer({ srd }),
      (e) => e instanceof GenError && /mot pour mot/.test(e.message));
  } finally {
    garrot.description = description;
  }
});
