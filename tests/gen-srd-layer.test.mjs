/* Lot 4-couche-srd — le générateur de la couche SRD (kickoff §L4).

   Quatre obligations posées par le mandat : le MANIFEST se vérifie avant
   usage (mismatch → échec bruyant qui nomme le fichier) ; les deux couches
   valident contre fh-layer/1 ; les comptes par genre ne descendent pas sous
   les seuils relevés à la génération (2 613 records au total, kickoff §L4) ;
   trois ids connus se retrouvent tels quels.

   Le générateur est relancé ici (pas seulement lu depuis layers/ commité) :
   un test qui ne relit que la sortie déjà écrite ne prouve pas que la
   génération elle-même est reproductible.

   ⚠️ …ET IL EST RELANCÉ DANS UN RÉPERTOIRE TEMPORAIRE, jamais dans `layers/`.
   Cette suite y écrivait, et l'exécution suivante héritait de la mutation ;
   le récit complet et le garde qui l'interdit sont dans tests/tree-watch.mjs
   et tests/tree-immuable.test.mjs.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import {
  GENRES,
  LANGS,
  SRD_ROOT,
  verifyManifest,
  assertDigestMatches,
  buildLayer,
  generate
} from "../src/tools/gen-srd-layer.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const layerSchema = JSON.parse(readFileSync(join(root, "schemas/fh-layer.schema.json"), "utf8"));
const ajv = new Ajv2020({ strict: true, allErrors: true });
const validateLayer = ajv.compile(layerSchema);

/* fh-srd est une dépendance ferme de ce lot (kickoff §L4, worktree monté
   APRÈS le merge du lot 6-srd-tables) — pas un intrant optionnel qu'on
   saute en silence si absent. Un dépôt manquant est un échec bruyant, pas un
   `skip`. */
if (!existsSync(SRD_ROOT)) {
  throw new Error(`gen-srd-layer.test : fh-srd introuvable à ${SRD_ROOT} — dépendance ferme du lot 4-couche-srd.`);
}

test("le MANIFEST se vérifie avant usage : un mismatch nomme le fichier et jette", () => {
  assert.throws(
    () => assertDigestMatches("srd/en/spell.json", "deadbeef", { sha256: "cafebabe" }),
    /srd\/en\/spell\.json/,
    "l'erreur doit nommer le fichier fautif"
  );
});

test("le MANIFEST se vérifie avant usage : une entrée absente nomme aussi le fichier", () => {
  assert.throws(
    () => assertDigestMatches("srd/fr/skill.json", "deadbeef", undefined),
    /srd\/fr\/skill\.json/
  );
});

test("verifyManifest() passe sur les exports fh-srd réels (28 fichiers, 14 genres × 2 langues)", () => {
  assert.doesNotThrow(() => verifyManifest());
});

test("chaque couche générée valide contre fh-layer/1", () => {
  for (const lang of LANGS) {
    const { layer } = buildLayer(lang);
    const ok = validateLayer(layer);
    assert.equal(ok, true, `couche ${lang} devrait valider — ${ajv.errorsText(validateLayer.errors)}`);
  }
});

test("les 14 genres sont présents dans chaque couche, aucun manquant, aucun en trop", () => {
  for (const lang of LANGS) {
    const { layer } = buildLayer(lang);
    assert.deepEqual(Object.keys(layer.records).sort(), [...GENRES].sort());
  }
});

test("2 613 records au total — le chiffre du kickoff §L4, pas 2 553 (les deux genres neufs comptent)", () => {
  const { total: totalFr } = buildLayer("fr");
  const { total: totalEn } = buildLayer("en");
  assert.equal(totalFr + totalEn, 2613);
});

/* Seuils relevés à la génération (mesurés ci-dessus) : un futur sync fh-srd
   qui ferait taire un genre entier — un fichier vide lu sans erreur — doit
   casser ce test, pas passer inaperçu. */
const FLOORS = {
  armor: 13, background: 4, class: 12, "class-progression": 12, feat: 17,
  gear: 82, glossary: 152, item: 253, monster: 330, skill: 18, species: 9,
  spell: 339, tool: 25, weapon: 38
};

test("comptes par genre ≥ seuils relevés à la génération, pour les deux langues", () => {
  for (const lang of LANGS) {
    const { countsByGenre } = buildLayer(lang);
    for (const genre of GENRES) {
      assert.ok(
        countsByGenre[genre] >= FLOORS[genre],
        `${lang}/${genre} : ${countsByGenre[genre]} record(s), attendu ≥ ${FLOORS[genre]}`
      );
    }
  }
});

test("spot-check — un sort, une espèce, un don connus survivent tels quels", () => {
  const { layer: en } = buildLayer("en");
  const { layer: fr } = buildLayer("fr");

  assert.equal(en.records.spell["srd:spell:en:fireball"].name, "Fireball");
  assert.equal(en.records.species["srd:species:en:dragonborn"].name, "Dragonborn");
  assert.equal(en.records.feat["srd:feat:en:alert"].name, "Alert");

  assert.equal(fr.records.spell["srd:spell:fr:boule-de-feu"].name, "Boule de feu");
  assert.equal(fr.records.species["srd:species:fr:drakeide"].name, "Drakéide");
});

test("piège de forme — class-progression du lanceur de pacte n'est pas « corrigé »", () => {
  /* kickoff §L4, encadré « CE QUI A CHANGÉ SOUS TES PIEDS » : spell_slots est
     un TABLEAU chez un lanceur plein/demi, et ABSENT chez l'occultiste, dont
     la magie de pacte vit en scalaire dans resources.spell_slots avec son
     slot_level. Discriminant fiable : spell_slot_levels ∈ {0, 5, 9}. */
  const { layer: en } = buildLayer("en");
  const warlock = en.records["class-progression"]["srd:class-progression:en:warlock"].data;
  const wizard = en.records["class-progression"]["srd:class-progression:en:wizard"].data;
  const fighter = en.records["class-progression"]["srd:class-progression:en:fighter"].data;

  assert.equal(warlock.spell_slot_levels, 0, "l'occultiste n'a pas de bande d'emplacements — c'est une magie de pacte");
  assert.equal(
    Object.hasOwn(warlock.levels[0], "spell_slots"),
    false,
    "l'occultiste ne porte AUCUN tableau spell_slots au niveau du level — ne pas en fabriquer un"
  );
  assert.equal(typeof warlock.levels[0].resources.spell_slots, "number", "chez l'occultiste, spell_slots est un SCALAIRE dans resources");
  assert.equal(typeof warlock.levels[0].resources.slot_level, "number");

  assert.equal(wizard.spell_slot_levels, 9);
  assert.equal(wizard.levels[0].spell_slots.length, 9);
  assert.equal(typeof wizard.levels[0].resources.cantrips, "number", "le magicien garde ses ressources propres (cantrips…) EN PLUS de la bande de slots, jamais l'une à la place de l'autre");

  assert.equal(fighter.spell_slot_levels, 0);
  assert.equal(Object.hasOwn(fighter.levels[0], "spell_slots"), false, "un non-lanceur n'a pas de bande d'emplacements du tout");

  const levels = [...new Set([warlock, wizard, fighter].map((d) => d.spell_slot_levels))];
  for (const v of levels) assert.ok([0, 5, 9].includes(v), `spell_slot_levels doit être 0, 5 ou 9 — obtenu ${v}`);
});

test("aucune correspondance FR↔EN inventée — les deux couches restent autonomes", () => {
  const { layer: en } = buildLayer("en");
  const { layer: fr } = buildLayer("fr");
  assert.equal(en.lang, "en");
  assert.equal(fr.lang, "fr");
  const enSpellIds = new Set(Object.keys(en.records.spell));
  const frSpellIds = new Set(Object.keys(fr.records.spell));
  const shared = [...enSpellIds].filter((id) => frSpellIds.has(id));
  assert.equal(shared.length, 0, "aucun id de sort ne devrait être partagé entre les deux langues");
});

test("déterminisme — deux générations produisent des objets byte-identiques une fois sérialisés", () => {
  for (const lang of LANGS) {
    const first = JSON.stringify(buildLayer(lang).layer);
    const second = JSON.stringify(buildLayer(lang).layer);
    assert.equal(first, second);
  }
});

/* REWRITTEN 2026-08-08 (lot 13) — CE TEST ÉCRIVAIT DANS `layers/`.
   Il appelait `generate()`, dont la destination était en dur, donc il
   ÉCRASAIT les deux couches commitées, puis comparait avant/après. Défaut
   mesuré et reproductible par l'architecte, avec deux conséquences :

     · la suite laissait l'arbre SALE à chaque exécution ;
     · l'exécution SUIVANTE héritait de la mutation — deux passes d'affilée
       sans nettoyage : 307 vertes / 1 rouge, puis 304 vertes / 4 rouges. La
       même suite, deux verdicts, sans qu'une ligne ait changé.

   CE QUE LE TEST PROUVE N'A PAS BOUGÉ ; L'ENDROIT OÙ IL L'ÉCRIT, SI. Il
   génère dans un répertoire temporaire — `generate()` prend sa destination en
   argument depuis ce lot — et compare la sortie fraîche aux fichiers
   commités. C'est même un peu plus fort qu'avant : l'ancienne version
   comparait le disque à lui-même APRÈS l'avoir écrasé, donc elle ne pouvait
   plus rougir sur une couche commitée périmée ; celle-ci le peut.

   Le garde qui interdit la rechute — pour cette suite et pour toutes les
   autres — est tests/tree-immuable.test.mjs. */
test("generate() écrit les deux couches DANS SA DESTINATION, et les fichiers commités sont ceux-là", () => {
  const tmp = mkdtempSync(join(tmpdir(), "fhpc-gen-srd-"));
  const avant = {
    fr: readFileSync(join(root, "layers/srd-5.2.1-fr.layer.json"), "utf8"),
    en: readFileSync(join(root, "layers/srd-5.2.1-en.layer.json"), "utf8")
  };
  try {
    const results = generate({ outDir: tmp });
    assert.deepEqual(Object.keys(results).sort(), ["en", "fr"], "les deux langues sont écrites, pas une");

    for (const lang of LANGS) {
      const attendu = join(tmp, `srd-5.2.1-${lang}.layer.json`);
      assert.equal(results[lang].outPath, attendu, "le générateur DIT où il a écrit");
      assert.equal(existsSync(attendu), true, `le fichier ${lang} doit exister dans la destination donnée`);
      assert.equal(readFileSync(attendu, "utf8"), avant[lang],
        `la couche ${lang} commitée n'est plus celle que le générateur produit — régénérer, ou dire ce qui a bougé`);
    }

    /* ET IL N'A ÉCRIT QUE LÀ. La preuve du lot : les deux couches commitées
       sont intactes après l'appel. Sans cette assertion, la réparation elle-
       même reposerait sur la confiance. */
    assert.equal(readFileSync(join(root, "layers/srd-5.2.1-fr.layer.json"), "utf8"), avant.fr,
      "`generate({outDir})` ne doit RIEN écrire dans layers/");
    assert.equal(readFileSync(join(root, "layers/srd-5.2.1-en.layer.json"), "utf8"), avant.en);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
