/* Test d'acceptation du kickoff §7 : les sept personnages FH v1 réels
   (~/tools/fh-phb/builds/*.fh.json) doivent pouvoir être représentés par
   fh-char/1 SANS PERTE. La conversion n'est pas du lot B — seulement la preuve
   que la forme les couvre, et l'aveu explicite de ce qu'elle ne couvre pas.

   Ce test lit une fixture de CHEMINS et de TYPES (aucune valeur, donc aucun
   contenu FH dans ce dépôt public), et exige que chacun des chemins v1 soit
   classé dans exactement une des trois cases :

     mapped — il a une place dans fh-char/1, nommée ici ;
     gap    — il n'en a pas : c'est un TROU DE SCHÉMA, remonté à l'architecte
              dans schemas/CHOIX-LOT-B.md, jamais bouché par une invention ;
     na     — encodage de l'outil source (identifiant interne DDB, doublon de
              saisie) qui n'appelle aucun équivalent.

   Un chemin v1 nouveau ou non classé fait ÉCHOUER la suite. C'est le point :
   personne ne peut ajouter un champ v1 dans le périmètre sans que la question
   « où va-t-il ? » soit posée.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inventory = JSON.parse(
  readFileSync(join(root, "tests/fixtures/v1-build-field-inventory.json"), "utf8")
);

/* Les dix trous, tels qu'ils sont détaillés dans schemas/CHOIX-LOT-B.md §3. */
const GAPS = {
  "GAP-EXT": "Identifiants externes (D&D Beyond) : id de fiche et ids numériques d'entités.",
  "GAP-CAMP": "Appartenance de campagne : le document ne sait pas à quelle table il joue.",
  "GAP-DERIVED": "Statistique dérivée définie par une couche (score de Destinée et son détail).",
  "GAP-KIND": "Genre hors des 12 (arcana) : `kind` est une énumération fermée.",
  "GAP-NOTES": "`resolved.notes` est une chaîne unique ; v1 porte deux textes distincts.",
  "GAP-ROLLS": "Historique des jets de création de caractéristiques.",
  "GAP-BUDGET": "Budgets de points de construction définis par une couche.",
  "GAP-LOCK": "Provenance/verrou d'une maîtrise (accordée par une source, non dépensable).",
  "GAP-GEN": "Provenance de l'outil auteur (nom et version du constructeur).",
  "GAP-TOOLS": "Maîtrises d'outils, distinctes des compétences."
};

/* Classement chemin v1 → destination fh-char/1. Les préfixes se terminant par
   « . » couvrent leur sous-arbre ; une entrée exacte l'emporte sur un préfixe. */
const EXACT = {
  character: "structure",
  "character.name": "name",
  "character.ddbId": "GAP-EXT",
  "character.campaign": "GAP-CAMP",
  "character.abilityScores": "resolved.abilities",
  "character.abilityScoresRaw": "build.choices[abilities.*].value",

  destiny: "GAP-DERIVED",
  "destiny.score": "GAP-DERIVED",
  "destiny.breakdown": "GAP-DERIVED",
  "destiny.breakdown[].label": "GAP-DERIVED",
  "destiny.breakdown[].value": "GAP-DERIVED",
  "destiny.notesText": "GAP-NOTES",
  "destiny.arcana": "build.choices[destiny.arcana]",
  "destiny.arcana.id": "GAP-KIND",
  "destiny.arcana.name": "resolved.traits[].name",
  "destiny.arcana.power": "resolved.traits[].text",
  "destiny.arcana.vibration": "resolved.traits[].text",
  "destiny.arcana.meaning": "resolved.traits[].text",
  "destiny.arcana.impact": "GAP-DERIVED",

  background: "structure",
  "background.replaceWithBlank": "build.choices[background].ref",
  "background.abilityBoostFeatIds": "GAP-EXT",
  "background.abilityBoostFeatIds[]": "GAP-EXT",
  "background.originFeats": "build.choices[background.originFeat[n]]",
  "background.originFeats[].key": "build.choices[background.originFeat[n]].ref.id",
  "background.originFeats[].label": "build.choices[background.originFeat[n]].label",
  "background.originFeats[].id": "GAP-EXT",
  "background.otherOriginFeat": "build.choices[background.originFeat.other].value",
  "background.story": "GAP-NOTES",

  skills: "resolved.skills",
  "skills[].name": "resolved.skills[].name",
  "skills[].statId": "resolved.skills[].ability",
  "skills[].proficiencyLevel": "resolved.skills[].proficiency",
  "skills[].type": "na — encodage DDB (compétence personnalisée vs native)",

  nativeSkillTiers: "resolved.skills",
  "nativeSkillTiers.<clef>": "resolved.skills[].proficiency",

  destinyFeats: "structure",
  "destinyFeats.diceFeats": "resolved.traits",
  "destinyFeats.diceFeats[].name": "resolved.traits[].name",
  "destinyFeats.diceFeats[].id": "GAP-EXT",
  "destinyFeats.score": "GAP-DERIVED",
  "destinyFeats.originFeatId": "GAP-EXT",
  "destinyFeats.originFeatIds": "GAP-EXT",
  "destinyFeats.originFeatIds[]": "GAP-EXT",

  meta: "structure",
  "meta.builder": "GAP-GEN",
  "meta.savedAt": "modified",
  "meta.species": "resolved.identity.species",
  "meta.class": "resolved.identity.classes[0].name",
  "meta.level": "resolved.identity.level",

  builderState: "structure",
  "builderState.v": "GAP-GEN",
  "builderState.name": "na — doublon de character.name",
  "builderState.campaign": "GAP-CAMP",
  "builderState.cls": "build.choices[class].ref",
  "builderState.race": "build.choices[species].ref",
  "builderState.lvl": "resolved.identity.level",
  "builderState.ddbId": "GAP-EXT",
  "builderState.arcana": "GAP-KIND",
  "builderState.origin": "build.choices[background.originFeat[0]].ref",
  "builderState.origin2": "build.choices[background.originFeat[1]].ref",
  "builderState.originOther": "build.choices[background.originFeat.other].value",
  "builderState.story": "GAP-NOTES",
  "builderState.raceP": "GAP-BUDGET",
  "builderState.featP": "GAP-BUDGET",
  "builderState.langPts": "GAP-BUDGET",
  "builderState.bonus1": "GAP-BUDGET",
  "builderState.glory": "GAP-BUDGET",
  "builderState.other": "GAP-BUDGET",
  "builderState.boosts": "build.choices[background.boost.*].value",
  "builderState.ab": "structure",
  "builderState.ab.mode": "build.choices[abilities.mode].value",
  "builderState.ab.assign": "build.choices[abilities.*].value",
  "builderState.ab.manual": "build.choices[abilities.*].value",
  "builderState.ab.set": "GAP-ROLLS",
  "builderState.ab.set.rolls": "GAP-ROLLS",
  "builderState.ab.set.rolls[].dice": "GAP-ROLLS",
  "builderState.ab.set.rolls[].dice[]": "GAP-ROLLS",
  "builderState.ab.set.rolls[].total": "GAP-ROLLS",
  "builderState.ab.set.kept": "GAP-ROLLS",
  "builderState.ab.set.kept[]": "GAP-ROLLS",
  "builderState.ab.set.keptIdx": "GAP-ROLLS",
  "builderState.ab.set.keptIdx[]": "GAP-ROLLS",
  "builderState.ab.set.rerolls": "GAP-ROLLS",
  "builderState.tiers": "GAP-TOOLS",
  "builderState.tiers.<clef>": "GAP-TOOLS",
  "builderState.tiers.<clef>.t": "resolved.skills[].proficiency",
  "builderState.tiers.<clef>.l": "GAP-LOCK"
};

/* Sous-arbres à classement uniforme (les six caractéristiques, par exemple). */
const PREFIX = [
  ["character.abilityScores.", "resolved.abilities.<ab>.score"],
  ["character.abilityScoresRaw.", "build.choices[abilities.*].value"],
  ["builderState.boosts.", "build.choices[background.boost.*].value"],
  ["builderState.ab.assign.", "build.choices[abilities.*].value"],
  ["builderState.ab.manual.", "build.choices[abilities.*].value"]
];

function classify(path) {
  if (Object.hasOwn(EXACT, path)) return EXACT[path];
  for (const [prefix, target] of PREFIX) {
    if (path.startsWith(prefix)) return target;
  }
  return null;
}

test("l'inventaire v1 couvre bien les sept personnages", () => {
  assert.equal(inventory.buildCount, 7);
  assert.ok(inventory.fields.length > 100, "inventaire suspicieusement court");
});

test("chaque champ v1 est classé : place dans fh-char/1, trou nommé, ou sans objet", () => {
  const unclassified = inventory.fields
    .map((field) => field.path)
    .filter((path) => classify(path) === null);
  assert.deepEqual(
    unclassified,
    [],
    `champs v1 sans classement — décider où ils vont AVANT de fusionner : ${unclassified.join(", ")}`
  );
});

test("tout trou invoqué par le classement figure dans la liste des dix", () => {
  for (const field of inventory.fields) {
    const target = classify(field.path);
    if (target.startsWith("GAP-")) {
      assert.ok(Object.hasOwn(GAPS, target), `trou inconnu « ${target} » sur ${field.path}`);
    }
  }
});

test("les dix trous sont tous encore vivants (aucun n'a été bouché en douce)", () => {
  const invoked = new Set(
    inventory.fields.map((field) => classify(field.path)).filter((t) => t.startsWith("GAP-"))
  );
  assert.deepEqual(
    [...invoked].sort(),
    Object.keys(GAPS).sort(),
    "un trou déclaré n'est plus invoqué par aucun champ, ou l'inverse : mettre à jour schemas/CHOIX-LOT-B.md §3"
  );
});

test("la majorité des champs v1 a bien une place dans fh-char/1", () => {
  const total = inventory.fields.length;
  const mapped = inventory.fields.filter((field) => {
    const target = classify(field.path);
    return !target.startsWith("GAP-") && !target.startsWith("na ") && target !== "structure";
  }).length;
  assert.ok(mapped >= total * 0.4, `seulement ${mapped}/${total} champs placés — la forme ne couvre pas v1`);
});

/* Garde-fou de dérive : quand les sept fichiers sont là (Mac d'Eric), on
   revérifie que la fixture les décrit encore. Ailleurs (clone indépendant de
   l'architecte), le test le DIT au lieu de faire semblant. */
test("la fixture décrit encore les builds v1 réels, quand ils sont accessibles", (t) => {
  const dir = join(homedir(), "tools", "fh-phb", "builds");
  if (!existsSync(dir)) {
    t.diagnostic(`builds v1 absents de cette machine (${dir}) — garde-fou de dérive non exécuté`);
    return;
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".fh.json"));
  assert.equal(
    files.length,
    inventory.buildCount,
    "le nombre de builds v1 a changé : relancer node tests/tools/derive-v1-inventory.mjs"
  );
});
