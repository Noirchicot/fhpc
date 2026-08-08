/* Test d'acceptation du kickoff §7 : les sept personnages FH v1 réels
   (~/tools/fh-phb/builds/*.fh.json) doivent pouvoir être représentés par
   fh-char/1 SANS PERTE. La conversion n'est pas du lot B — seulement la preuve
   que la forme les couvre, et l'aveu explicite de ce qu'elle ne couvre pas.

   Ce test lit une fixture de CHEMINS et de TYPES (aucune valeur, donc aucun
   contenu FH dans ce dépôt public), et exige que chacun des chemins v1 soit
   classé dans exactement une des trois cases :

     mapped — il a une place dans fh-char/1, nommée ici ;
     bloc:  — il appartient à un AUTRE bloc que `doc`, par décision d'architecte ;
     gap    — il n'en a pas : c'est un TROU DE SCHÉMA, remonté à l'architecte
              dans schemas/CHOIX-LOT-B.md, jamais bouché par une invention ;
     na     — encodage de l'outil source (identifiant interne DDB, doublon de
              saisie) qui n'appelle aucun équivalent.

   Revue d'architecte du 2026-08-08 : cinq trous bouchés (notes en liste, outils,
   générateur, lien externe, monnaie), un tranché hors document (la campagne),
   cinq REPORTÉS au M2 parce qu'ils dépendent de la couche Fate's Hand.

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

/* REWRITTEN 2026-08-08 — LA RÉVISION DU SCHÉMA EN A BOUCHÉ DEUX. `GAP-DERIVED`
   et `GAP-BUDGET` ont désormais leur place dans `fh-char/1` : `resolved.stats[]`
   avec son détail terme par terme, et `build.budgets`. Il en reste TROIS.

   ⚠️ Ce test compare sa propre table à elle-même, il ne lit pas le schéma :
   déplacer les classements ci-dessous est le geste qui empêche le schéma et
   cette couverture de diverger en silence. Sans lui, boucher un trou dans le
   schéma laisserait cette suite verte en le déclarant toujours ouvert. */
const GAPS = {
  "GAP-KIND": "Genre hors des 14 (arcana) : `kind` est une énumération fermée.",
  "GAP-ROLLS": "Historique des jets de création de caractéristiques.",
  "GAP-LOCK": "Provenance/verrou d'une maîtrise (accordée par une source, non dépensable)."
};

/* Classement chemin v1 → destination fh-char/1. Les préfixes se terminant par
   « . » couvrent leur sous-arbre ; une entrée exacte l'emporte sur un préfixe.

   REWRITTEN 2026-08-08 (lot 19) — l'ancre du Score s'écrit `fh:destiny` et non
   `fh.destiny`. Ce n'est pas un goût : `stats[].id` est un `$defs/slug`
   (`^[a-z][a-z0-9:_-]{0,79}$`) et le sélecteur d'un chemin d'override
   (`[a-z][a-z0-9:_-]*`) N'ADMET PAS LE POINT. Les chemins écrits ici avec un
   point désignaient donc une case que le schéma refuse et qu'aucun override ne
   peut atteindre. Le DRAPEAU, lui, reste `fh.destiny` — il voyage dans le champ
   `flag` de l'entrée. */
const EXACT = {
  character: "structure",
  "character.name": "name",
  "character.ddbId": "build.external.ddb.characterId",
  "character.campaign": "bloc:table — le personnage ne porte pas sa table",
  "character.abilityScores": "resolved.abilities",
  "character.abilityScoresRaw": "build.choices[abilities.*].value",

  destiny: "resolved.stats[fh:destiny]",
  "destiny.score": "resolved.stats[fh:destiny].value",
  "destiny.breakdown": "resolved.stats[fh:destiny].breakdown",
  "destiny.breakdown[].label": "resolved.stats[fh:destiny].breakdown[].label",
  "destiny.breakdown[].value": "resolved.stats[fh:destiny].breakdown[].value",
  "destiny.notesText": "resolved.notes[].text",
  "destiny.arcana": "build.choices[destiny.arcana]",
  "destiny.arcana.id": "GAP-KIND",
  "destiny.arcana.name": "resolved.traits[].name",
  "destiny.arcana.power": "resolved.traits[].text",
  "destiny.arcana.vibration": "resolved.traits[].text",
  "destiny.arcana.meaning": "resolved.traits[].text",
  "destiny.arcana.impact": "resolved.stats[fh:destiny].breakdown[].value",

  background: "structure",
  "background.replaceWithBlank": "build.choices[background].ref",
  "background.abilityBoostFeatIds": "build.external.ddb.entityIds",
  "background.abilityBoostFeatIds[]": "build.external.ddb.entityIds",
  "background.originFeats": "build.choices[background.originFeat[n]]",
  "background.originFeats[].key": "build.choices[background.originFeat[n]].ref.id",
  "background.originFeats[].label": "build.choices[background.originFeat[n]].label",
  "background.originFeats[].id": "build.external.ddb.entityIds",
  "background.otherOriginFeat": "build.choices[background.originFeat.other].value",
  "background.story": "resolved.notes[].text",

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
  "destinyFeats.diceFeats[].id": "build.external.ddb.entityIds",
  "destinyFeats.score": "resolved.stats[fh:destiny].value",
  "destinyFeats.originFeatId": "build.external.ddb.entityIds",
  "destinyFeats.originFeatIds": "build.external.ddb.entityIds",
  "destinyFeats.originFeatIds[]": "build.external.ddb.entityIds",

  meta: "structure",
  "meta.builder": "generator.name",
  "meta.savedAt": "modified",
  "meta.species": "resolved.identity.species",
  "meta.class": "resolved.identity.classes[0].name",
  "meta.level": "resolved.identity.level",

  builderState: "structure",
  "builderState.v": "generator.version",
  "builderState.name": "na — doublon de character.name",
  "builderState.campaign": "bloc:table — le personnage ne porte pas sa table",
  "builderState.cls": "build.choices[class].ref",
  "builderState.race": "build.choices[species].ref",
  "builderState.lvl": "resolved.identity.level",
  "builderState.ddbId": "build.external.ddb.characterId",
  "builderState.arcana": "GAP-KIND",
  "builderState.origin": "build.choices[background.originFeat[0]].ref",
  "builderState.origin2": "build.choices[background.originFeat[1]].ref",
  "builderState.originOther": "build.choices[background.originFeat.other].value",
  "builderState.story": "resolved.notes[].text",
  "builderState.raceP": "build.budgets[fh.raceP]",
  "builderState.featP": "build.budgets[fh.featP]",
  "builderState.langPts": "build.budgets[fh.langPts]",
  "builderState.bonus1": "build.budgets[fh.bonus1]",
  "builderState.glory": "resolved.stats[fh:destiny].breakdown[] (by: gm)",
  "builderState.other": "resolved.stats[fh:destiny].breakdown[] (by: gm)",
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
  "builderState.tiers": "resolved.skills + resolved.tools",
  "builderState.tiers.<clef>": "resolved.tools[] (clefs « Tool - … ») ou resolved.skills[]",
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

test("tout trou invoqué par le classement figure dans la liste des cinq", () => {
  for (const field of inventory.fields) {
    const target = classify(field.path);
    if (target.startsWith("GAP-")) {
      assert.ok(Object.hasOwn(GAPS, target), `trou inconnu « ${target} » sur ${field.path}`);
    }
  }
});

/* ⚠️ CE QUE CE GARDE COUVRE, ET CE QU'IL NE COUVRE PAS — mesuré en l'attaquant
   le 2026-08-08, et écrit ici pour qu'on ne lui fasse pas plus confiance qu'il
   n'en mérite. Il est ENSEMBLISTE : il compare l'ensemble des trous invoqués à
   l'ensemble des trous déclarés.

   · Retirer le DERNIER chemin d'un trou → il rougit (vérifié en le faisant).
   · Retirer UN chemin sur deux → il reste VERT, et c'est normal : le trou est
     toujours invoqué par l'autre.

   Autrement dit il garde « aucun trou ne disparaît en douce », pas « aucun
   chemin ne change de maison ». Pour ce second besoin, c'est la couverture
   chiffrée plus bas qui parle. */
test("les TROIS trous restants sont tous encore vivants (aucun bouché en douce)", () => {
  const invoked = new Set(
    inventory.fields.map((field) => classify(field.path)).filter((t) => t.startsWith("GAP-"))
  );
  assert.deepEqual(
    [...invoked].sort(),
    Object.keys(GAPS).sort(),
    "un trou déclaré n'est plus invoqué par aucun champ, ou l'inverse : mettre à jour schemas/CHOIX-LOT-B.md §3"
  );
});

/* REWRITTEN 2026-08-08 — la revue d'architecte a bouché cinq trous : le seuil de
   0,4 décrivait l'état d'avant et ne mordrait plus. Réécrit à la nouvelle
   vérité, pas relâché. */
test("les SEPT trous bouchés le sont vraiment (aucun chemin v1 ne les invoque plus)", () => {
  /* REWRITTEN 2026-08-08 — deux de plus : la révision du schéma a donné leur
     place au Score de Destinée et aux budgets de construction. */
  const closed = ["GAP-NOTES", "GAP-TOOLS", "GAP-GEN", "GAP-EXT", "GAP-CAMP", "GAP-DERIVED", "GAP-BUDGET"];
  const invoked = inventory.fields
    .map((field) => ({ path: field.path, target: classify(field.path) }))
    .filter((entry) => closed.includes(entry.target));
  assert.deepEqual(invoked, [], "un trou déclaré bouché est encore invoqué par un chemin v1");
});

test("les deux tiers des champs v1 ont une place dans fh-char/1", () => {
  const total = inventory.fields.length;
  const placed = inventory.fields.filter((field) => {
    const target = classify(field.path);
    return (
      !target.startsWith("GAP-") &&
      !target.startsWith("na ") &&
      !target.startsWith("bloc:") &&
      target !== "structure"
    );
  }).length;
  assert.ok(
    placed >= total * 0.65,
    `seulement ${placed}/${total} champs placés — la forme a régressé sur la couverture v1`
  );
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
