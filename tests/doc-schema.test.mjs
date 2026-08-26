/* ══ LA LISTE BLANCHE EST GÉNÉRÉE DU SCHÉMA — ET ON LE PROUVE ══════════
   Lot 14-bloc-doc.

   La leçon n°3 de `ARCHITECTURE.md` exige « une seule liste blanche générée du
   schéma ». Le bloc `layers` a résolu le même problème par DEUX copies plus un
   garde de dérive ; ce lot lit la règle. Restent deux façons pour cette
   promesse de devenir fausse, et chacune a son test ici :

     1. LE VALIDATEUR N'APPLIQUE PAS CE QUE LE SCHÉMA DIT. C'est `ajv` qui en
        juge : les deux validateurs sont confrontés sur un corpus de documents
        — le vrai personnage, puis une trentaine de mutations délibérées, une
        faute à la fois — et le moindre désaccord rougit. `ajv` est une
        dépendance de DÉV (loi §0.11) : elle ne peut pas valider à l'exécution,
        mais elle peut JUGER celui qui le fait.

     2. LE SCHÉMA DIT QUELQUE CHOSE QUE LE VALIDATEUR NE SAIT PAS APPLIQUER.
        Alors la compilation JETTE, en nommant le mot-clef et son emplacement.
        C'est le point qui rend l'approche tenable : une règle ajoutée au
        contrat ne peut pas rester silencieusement inappliquée.

   ⚠️ CE FICHIER N'ÉCRIT RIEN ET NE MONTE AUCUN MAGASIN : il juge le
   validateur, pas le bloc. */

import test from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";

import { compileSchema, SUPPORTED } from "../src/doc/index.mjs";
import { DocError } from "../src/doc/index.mjs";
import { charSchema, exampleDocument } from "./doc-harness.mjs";

const schema = charSchema();
const maison = compileSchema(schema, "fh-char/1");
const ajv = new Ajv2020({ strict: true, allErrors: true });
const juge = ajv.compile(schema);

/* ── LE CORPUS : une faute à la fois, et son nom ────────────────────── */

/** Chaque entrée : `[nom, mutateur, attendu]` où `attendu` vaut `"refusé"` ou
 *  `"admis"`. L'attendu est écrit À LA MAIN et non déduit d'`ajv` : un corpus
 *  dont la réponse vient du juge ne prouve que l'accord de deux copies d'une
 *  même erreur. Ici les trois doivent tomber d'accord. */
const CORPUS = [
  ["le document d'exemple, intact", () => {}, "admis"],

  // ── required
  ["un champ obligatoire retiré (name)", (d) => { delete d.name; }, "refusé"],
  ["un champ obligatoire retiré (resolved.abilities.cha)", (d) => { delete d.resolved.abilities.cha; }, "refusé"],
  ["un champ obligatoire retiré (units.weight)", (d) => { delete d.units.weight; }, "refusé"],
  ["`generator` sans sa version", (d) => { d.generator = { name: "x" }; }, "refusé"],
  ["`generator` absent (facultatif)", (d) => { delete d.generator; }, "admis"],

  // ── type
  ["un nom qui est un nombre", (d) => { d.name = 42; }, "refusé"],
  ["une CA qui est une chaîne", (d) => { d.resolved.ac = "13"; }, "refusé"],
  ["`craft` qui n'est pas une liste", (d) => { d.resolved.craft = "aucun"; }, "refusé"],
  ["un niveau fractionnaire", (d) => { d.resolved.identity.level = 1.5; }, "refusé"],

  // ── const / enum
  ["un schéma inconnu", (d) => { d.schema = "fh-char/2"; }, "refusé"],
  ["une unité de distance inventée", (d) => { d.units.distance = "km"; }, "refusé"],
  ["une taille de créature inventée", (d) => { d.resolved.identity.size = "colossal"; }, "refusé"],
  ["une maîtrise de compétence inventée", (d) => { d.resolved.skills[0].proficiency = "master"; }, "refusé"],
  ["un override signé par un tiers", (d) => { d.build.overrides[0].by = "dm"; }, "refusé"],

  // ── pattern
  ["une langue en majuscules", (d) => { d.lang = "FR"; }, "refusé"],
  ["une date qui est un mot", (d) => { d.created = "hier"; }, "refusé"],
  ["un id de document portant un séparateur de chemin", (d) => { d.id = "a/b"; }, "refusé"],
  ["une empreinte de couche tronquée", (d) => { d.build.layers[0].hash = "abc"; }, "refusé"],
  ["un id de compétence en capitales", (d) => { d.resolved.skills[0].id = "Arcanes"; }, "refusé"],
  ["un chemin d'override enraciné ailleurs que dans `resolved`",
    (d) => { d.build.overrides[0].path = "build.choices[0]"; }, "refusé"],
  ["un chemin d'override par INDEX", (d) => { d.build.overrides[0].path = "resolved.skills[0].bonus"; }, "refusé"],

  // ── minimum / maximum / minItems
  ["un bonus de maîtrise hors bornes", (d) => { d.resolved.proficiency = 11; }, "refusé"],
  ["un bonus de maîtrise négatif", (d) => { d.resolved.proficiency = -1; }, "refusé"],
  ["un score de caractéristique à 31", (d) => { d.resolved.abilities.str.score = 31; }, "refusé"],
  ["un personnage sans aucune classe", (d) => { d.resolved.identity.classes = []; }, "refusé"],
  ["un sort de niveau 10", (d) => { d.resolved.spellcasting.spells[0].level = 10; }, "refusé"],
  ["un objet au poids négatif", (d) => { d.resolved.gear[0].weight = -1; }, "refusé"],
  ["un lien DDB au characterId nul", (d) => { d.build.external = { ddb: { characterId: 0 } }; }, "refusé"],

  // ── additionalProperties (la fermeture de TOUS les objets)
  ["une clef inconnue à la racine", (d) => { d.session = { hand: [] }; }, "refusé"],
  ["de l'état de séance dans `resolved`", (d) => { d.resolved.traySelection = { dieId: "x" }; }, "refusé"],
  ["une dénomination de bourse hors des quatre", (d) => { d.resolved.currency.ep = 1; }, "refusé"],
  ["un système externe inconnu", (d) => { d.build.external = { roll20: { id: 1 } }; }, "refusé"],
  ["une clef en trop sur une compétence", (d) => { d.resolved.skills[0].couleur = "or"; }, "refusé"],

  // ── propertyNames
  ["un emplacement de sort de niveau 0", (d) => { d.resolved.spellcasting.slots["0"] = { max: 1, current: 1 }; }, "refusé"],

  // ── oneOf : « ref OU value, jamais les deux, jamais aucun »
  ["un choix qui porte `ref` ET `value`",
    (d) => { d.build.choices[0] = { path: "species", ref: { kind: "species", id: "srd:species:en:elf" }, value: 3 }; },
    "refusé"],
  ["un choix qui ne porte ni l'un ni l'autre", (d) => { d.build.choices[0] = { path: "species" }; }, "refusé"],
  ["`spellcasting` à null (un personnage sans incantation)", (d) => { d.resolved.spellcasting = null; }, "admis"],

  // ── not / safeKey : une couche est de la donnée, jamais du code
  ["un override dont la valeur porte une clef dangereuse",
    (d) => { d.build.overrides[0].value = { eval: "alert(1)" }; }, "refusé"],
  ["un override dont la valeur porte une clef ordinaire",
    (d) => { d.build.overrides[0].value = { note: "ok" }; }, "admis"],

  // ── anyOf : un choix scalaire, jamais une structure
  ["un choix dont la valeur est une structure", (d) => { d.build.choices[1] = { path: "abilities.int", value: { score: 15 } }; }, "refusé"],
  ["un choix dont la valeur est un booléen", (d) => { d.build.choices[1] = { path: "abilities.int", value: true }; }, "admis"],

  // ── témoins d'admission : le contrat n'est pas qu'un mur
  ["une note ajoutée", (d) => { d.resolved.notes.push({ id: "histoire", title: "Histoire", text: "…" }); }, "admis"],
  ["un `expiresAt` explicitement nul sur une ressource reçue",
    (d) => {
      d.resolved.resources.push({
        id: "de-recu", name: "Dé reçu", max: 1, current: 1,
        origin: { from: "Lyra", source: "bardic", timing: "advance", givenAt: "2026-08-08T12:00:00Z", expiresAt: null }
      });
    }, "admis"],
  ["une fenêtre de don inventée",
    (d) => {
      d.resolved.resources.push({
        id: "de-recu", name: "Dé reçu", max: 1, current: 1,
        origin: { from: "Lyra", source: "bardic", timing: "plus tard" }
      });
    }, "refusé"]
];

test("LE JUGE — `ajv` et le validateur du bloc rendent le MÊME verdict sur tout le corpus", () => {
  const desaccords = [];
  let admis = 0;
  let refuses = 0;

  for (const [nom, muter, attendu] of CORPUS) {
    const document = exampleDocument();
    muter(document);

    const parAjv = juge(document) ? "admis" : "refusé";
    const violations = maison.validate(document);
    const parLeBloc = violations.length === 0 ? "admis" : "refusé";

    if (parAjv !== attendu) {
      desaccords.push(`« ${nom} » : le CORPUS dit ${attendu}, ajv dit ${parAjv} (${ajv.errorsText(juge.errors)})`);
    }
    if (parLeBloc !== attendu) {
      desaccords.push(`« ${nom} » : le CORPUS dit ${attendu}, le bloc dit ${parLeBloc}` +
        (violations.length ? ` — ${violations.join(" | ")}` : ""));
    }
    if (attendu === "admis") admis += 1; else refuses += 1;
  }

  /* NON-VACUITÉ : un corpus qui n'aurait que des documents valides serait vert
     avec un validateur qui n'applique rien. */
  assert.ok(refuses >= 25, `le corpus doit porter de vraies fautes — ${refuses} refus attendus`);
  assert.ok(admis >= 5, `et de vrais témoins d'admission — ${admis} admissions attendues`);
  assert.deepEqual(desaccords, []);
});

test("UN REFUS NOMME SON CHEMIN — pas « le document est invalide »", () => {
  const document = exampleDocument();
  document.resolved.skills[3].bonus = 99;
  document.resolved.abilities.dex.score = 0;
  const violations = maison.validate(document);
  assert.equal(violations.length, 2, violations.join(" | "));
  assert.ok(violations.some((line) => /document\.resolved\.skills\[3\]\.bonus/.test(line)),
    `le chemin exact du champ fautif doit être dans le message : ${violations.join(" | ")}`);
  assert.ok(violations.some((line) => /document\.resolved\.abilities\.dex\.score/.test(line)),
    violations.join(" | "));
  assert.ok(violations.every((line) => /\d/.test(line)), "et la valeur ou la borne y est, pas seulement le champ");
});

/* ── L'AUTRE MOITIÉ : CE QUE LE VALIDATEUR NE SAIT PAS FAIRE, IL LE DIT ── */

test("ATTAQUE — un mot-clef non pris en charge fait JETER la compilation, en le nommant", () => {
  for (const [ou, poser] of [
    ["à la racine", (s) => { s.dependentRequired = { id: ["name"] }; }],
    ["dans une propriété", (s) => { s.properties.resolved.uniqueItems = true; }],
    ["dans une définition", (s) => { s.$defs.slug.format = "uuid"; }],
    ["dans une branche de oneOf", (s) => { s.$defs.resolved.properties.spellcasting.oneOf[1].allOf = []; }]
  ]) {
    const copie = structuredClone(schema);
    poser(copie);
    let error = null;
    try { compileSchema(copie, "fh-char/1 (sonde)"); } catch (caught) { error = caught; }
    assert.ok(error instanceof DocError, `un mot-clef inconnu ${ou} doit JETER, pas être ignoré`);
    assert.match(error.message, /mot-clef/, error && error.message);
  }

  /* LE PENDANT : le VRAI schéma compile, et il compile ENTIÈREMENT. Un garde
     qui ne rougit jamais et un garde qui rougit toujours sont aussi inutiles
     l'un que l'autre. */
  assert.ok(compileSchema(schema, "fh-char/1").validate(exampleDocument()).length === 0);
});

test("ATTAQUE — une référence hors « #/$defs/ » ou vers une définition absente est REFUSÉE", () => {
  for (const [quoi, valeur] of [
    ["un schéma distant", "https://exemple.test/schema.json"],
    ["un ancrage", "#/properties/name"],
    ["une définition absente", "#/$defs/inexistante"]
  ]) {
    const copie = structuredClone(schema);
    copie.properties.name = { $ref: valeur };
    let error = null;
    try { compileSchema(copie, "fh-char/1 (sonde)"); } catch (caught) { error = caught; }
    assert.ok(error instanceof DocError, `${quoi} doit être refusé`);
  }
});

test("LA LISTE DES MOTS-CLEFS PRIS EN CHARGE COUVRE EXACTEMENT CE QUE LE SCHÉMA EMPLOIE", () => {
  /* Ni plus, ni moins, et les deux sens comptent : un mot-clef supporté que le
     schéma n'emploie pas est du code qui n'est prouvé par rien ; un mot-clef
     employé et non supporté est une règle qui ne s'applique pas — mais
     celui-là fait déjà jeter la compilation, donc il ne peut pas arriver ici. */
  const employes = new Set();
  (function walk(node) {
    if (node === true || node === false || node === null || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    for (const key of Object.keys(node)) employes.add(key);
    for (const key of ["properties", "patternProperties", "$defs"]) {
      if (node[key]) Object.values(node[key]).forEach(walk);
    }
    for (const key of ["items", "not", "propertyNames", "additionalProperties"]) {
      if (node[key] !== undefined) walk(node[key]);
    }
    for (const key of ["oneOf", "anyOf"]) if (node[key]) node[key].forEach(walk);
  })(schema);

  const inconnus = [...employes].filter((key) => !SUPPORTED.has(key)).sort();
  assert.deepEqual(inconnus, [], "le schéma emploie un mot-clef que le validateur ne connaît pas");

  const inutiles = [...SUPPORTED].filter((key) => !employes.has(key)).sort();
  assert.deepEqual(inutiles, [],
    "ces mots-clefs sont pris en charge alors que le schéma ne les emploie pas : du code que rien ne prouve. " +
    "Les retirer, ou écrire le cas du schéma qui les justifie.");
});
