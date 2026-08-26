/* ══ LE TEST D'ACCEPTATION DU LOT 7 (kickoff §L7) ══════════════════════

   > « Les deux vraies couches SRD se chargent, et `query("skill", …)` rend les
   > 18 compétences ; une couche homebrew empilée par-dessus en patche une et
   > en désactive une autre, et `query` rend le résultat plié — sans qu'aucun
   > autre bloc n'ait lu son état. »

   Écrit comme une suite exécutable, sur la VRAIE MATIÈRE : les deux couches
   `layers/srd-5.2.1-{fr,en}.layer.json` (16 genres, 2 651 records) et la
   couche d'exemple du lot 2. Aucune fixture ne remplace un fichier du dépôt.

   « SANS QU'AUCUN AUTRE BLOC N'AIT LU SON ÉTAT » est tenu de la seule façon
   qui se vérifie : tout ici passe par `dispatch("layers.<verbe>", …)`, et le
   bloc n'expose AUCUNE surface d'état à lire — la dernière section le montre
   plutôt que de le promettre. */

import test from "node:test";
import assert from "node:assert/strict";

import { dispatch } from "../src/kernel/registry.mjs";
import { registerLayers } from "../src/layers/index.mjs";
import { fileBytes, bytes, aLayer, readJson, SRD_FR, SRD_EN, HOMEBREW } from "./layers-harness.mjs";
import { sha256 } from "../src/layers/document.mjs";

registerLayers();
const changes = [];
const { on } = await import("../src/kernel/bus.mjs");
on("layers-changed", (event) => changes.push(event));

/* Les 18 compétences du SRD 5.2.1, en français, telles que `fh-srd` les livre
   (lot 6-srd-tables). Écrites ici en toutes lettres : « rend les 18
   compétences » n'est pas un COMPTE — un compte reste vert si la pile en rend
   dix-huit fausses. */
const DIX_HUIT = [
  "srd:skill:en:acrobatics", "srd:skill:en:arcana", "srd:skill:en:athletics",
  "srd:skill:en:stealth", "srd:skill:en:animal-handling", "srd:skill:en:sleight-of-hand",
  "srd:skill:en:history", "srd:skill:en:intimidation", "srd:skill:en:insight",
  "srd:skill:en:investigation", "srd:skill:en:medicine", "srd:skill:en:nature",
  "srd:skill:en:perception", "srd:skill:en:persuasion", "srd:skill:en:religion",
  "srd:skill:en:performance", "srd:skill:en:survival", "srd:skill:en:deception"
];

/* La couche de table : elle PATCHE une compétence et en DÉSACTIVE une autre,
   par leurs vrais identifiants SRD. C'est le seul artefact fabriqué de cette
   suite, et il ne fabrique rien du SRD : il le vise. */
const COUCHE_DE_TABLE = bytes(aLayer({
  id: "table-eric",
  name: "Maison — table d'Eric",
  description: "Deux gestes sur les compétences du SRD, pour le test d'acceptation du lot 7.",
  flags: ["maison.veillee"],
  records: {
    skill: {
      "srd:skill:en:perception": {
        op: "patch",
        note: "À cette table, la Perception passive est annoncée par le MJ.",
        changes: { "data[example_uses]": "Le MJ annonce ce que les sens relèvent sans qu'on ait à le demander." }
      },
      "srd:skill:en:animal-handling": {
        op: "disable",
        reason: "Pas de bêtes dressées dans cette campagne."
      }
    }
  }
}));

/* ── 1. Les deux vraies couches SRD se chargent ─────────────────────── */

test("les deux couches SRD réelles se chargent, 18 genres et 2 736 records", () => {
  const fr = dispatch("layers.register", { bytes: fileBytes(SRD_FR), origin: SRD_FR });
  const en = dispatch("layers.register", { bytes: fileBytes(SRD_EN), origin: SRD_EN });

  assert.equal(fr.id, "srd-5.2.1-fr");
  assert.equal(en.id, "srd-5.2.1-en");
  /* 🔴 LES DEUX LANGUES NE SONT PLUS À ÉGALITÉ, ET C'EST UNE INFORMATION.
     Elles l'étaient à 1 367 depuis le lot 93. La transition à froid de fh-srd
     (2026-08-24) a fait apparaître un écart qui existait déjà dans les LIVRES
     et que deux catalogues séparés cachaient :

       FR 1 369 = 1 366 appariés + 3 que le livre FRANÇAIS seul imprime
                  (`Vitesse d'escalade / de nage / de vol`)
       EN 1 367 = 1 366 appariés + 1 que le livre ANGLAIS seul imprime (`Size`)

     ⭐ Les trois françaises portent une adresse ANGLAISE ADOPTÉE — `climb-speed`,
     `swim-speed`, `fly-speed` — que le livre anglais imprime 74 fois SANS leur
     donner d'entrée de glossaire. Elles ne sont pas inventées : elles sont
     prises dans le livre. */
  assert.equal(fr.records, 1369);
  assert.equal(en.records, 1367);

  /* 🔴🔴 ET LA PILE N'EN PORTE PAS 2 736, ELLE EN PORTE 1 370 — C'EST TOUTE LA
     MIGRATION, VUE PAR LE MOTEUR.

     Ce test affirmait : « aucun id ne collisionne entre les deux langues ».
     C'était vrai, et ça ne l'est plus : les deux langues d'un record occupent
     désormais LA MÊME ADRESSE. Montées ensemble, elles ne s'additionnent pas,
     elles se RECOUVRENT — et celle du dessus donne les mots.

       1 370 = 1 366 adresses partagées
             +     3 que le livre FRANÇAIS seul imprime (les vitesses adoptées)
             +     1 que le livre ANGLAIS seul imprime (`Size`)

     ⭐ ET LE MOTEUR AVAIT DÉJÀ LE VOCABULAIRE : `shadowed` NOMME chacun des
     1 366 recouvrements, avec qui recouvre qui. Ce n'est pas un accident
     rattrapé, c'est le mécanisme du patch qui se voit. */
  const event = changes[changes.length - 1];
  assert.equal(event.total, 1370, "une adresse par record, quelle que soit la langue qui l'affiche");
  assert.equal(Object.keys(event.counts).length, 18);
  assert.equal(event.shadowed.length, 1366,
    "le recouvrement n'est pas silencieux : le moteur nomme chaque adresse " +
    "que la couche du dessus reprend à celle du dessous");
  assert.equal(event.shadowed.every((s) => s.by === "srd-5.2.1-en"
                                        && s.over === "srd-5.2.1-fr"), true,
    "l'anglais est monté en DERNIER ici, donc c'est lui qui donne les mots");

  /* L'empreinte rendue est celle des octets du fichier — c'est elle que
     `build.layers[].hash` transportera dans un `fh-char/1`. */
  assert.equal(fr.hash, sha256(fileBytes(SRD_FR)));
  assert.equal(en.hash, sha256(fileBytes(SRD_EN)));
});

/* ── 2. `query("skill", …)` rend les 18 compétences ─────────────────── */

test("query rend les DIX-HUIT compétences, nommément", () => {
  /* 🔴 LE FILTRE PAR PRÉFIXE A DISPARU, ET IL NE POUVAIT PAS SURVIVRE. Ce bloc
     séparait les deux langues sur `srd:skill:fr:` — depuis la transition à
     froid, elles partagent l'adresse. Il n'y a plus DEUX fois dix-huit
     compétences empilées, il y en a DIX-HUIT, et la couche du dessus donne les
     mots. ⭐ Le discriminant est désormais `provenance.from`, que le moteur
     porte déjà : voir plus bas. */
  const ids = dispatch("layers.query", { kind: "skill" })
    .map((view) => view.id).sort();
  assert.deepEqual(ids, DIX_HUIT.slice().sort());

  const perception = dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" });
  // REWRITTEN 2026-08-08 — arbitrage de l'architecte, à la fusion du lot 8.
  // L'assertion épinglait « sag » et invoquait layers/TRADUCTION.md : c'était une
  // erreur de catégorie. La clef n'est pas un enjeu INTER-langues — `resolved.abilities`
  // de fh-char/1 est additionalProperties:false sur str/dex/con/int/wis/cha, REQUIS
  // dans les deux langues. Une compétence FR qui disait « sag » ne pouvait pas adresser
  // les caractéristiques de son PROPRE document. Réécrite à la nouvelle vérité, jamais relâchée.
  assert.equal(perception.record.data.ability_key, "wis", "la clef est CANONIQUE dans les deux langues — « wis », joignable à resolved.abilities");
  /* ⭐⭐ ET VOICI LA LOI §0.13 RENDUE VISIBLE PAR LE MOTEUR. L'anglais est monté
     en dernier, donc c'est LUI qui donne les mots à cette adresse — et la
     provenance le dit. Éteindre l'anglais rend la même adresse au français, et
     le mot change SANS que l'adresse bouge. Une adresse, deux mots. */
  assert.equal(perception.record.name, "Perception");
  assert.equal(perception.record.data.ability, "Wisdom");
  assert.equal(perception.provenance.from, "srd-5.2.1-en");

  dispatch("layers.disable", { id: "srd-5.2.1-en" });
  const enFrancais = dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" });
  assert.equal(enFrancais.id, perception.id, "la MÊME adresse — c'est tout le point");
  assert.equal(enFrancais.record.data.ability, "Sagesse",
    "et le mot devient français : le moteur produit des identifiants, l'interface produit des mots");
  assert.equal(enFrancais.provenance.from, "srd-5.2.1-fr");
  dispatch("layers.enable", { id: "srd-5.2.1-en" });
  assert.deepEqual(perception.provenance.patchedBy, [], "personne ne l'a encore touchée");
  assert.equal(perception.record.attribution.license, "CC-BY-4.0", "et sa notice CC-BY voyage avec elle");
});

/* ── 3. Une couche homebrew par-dessus : un patch, un disable ───────── */

test("une couche de table patche une compétence et en désactive une autre — query rend le PLI", () => {
  dispatch("layers.register", { bytes: COUCHE_DE_TABLE, origin: "table-eric" });

  /* ⭐ ET LE PATCH DE LA TABLE ATTEINT LES DEUX RENDUS À LA FOIS — c'est neuf,
     et c'est la conséquence directe de l'adresse unique. Cette couche vise des
     identifiants écrits quand ils étaient FRANÇAIS ; ils sont maintenant
     PARTAGÉS, donc son `disable` retire la compétence pour tout le monde et son
     `patch` s'applique quelle que soit la langue affichée. ⛔ Une couche de
     table ne choisit plus une langue : elle vise un OBJET. */
  const restantes = dispatch("layers.query", { kind: "skill" }).map((view) => view.id);
  assert.equal(restantes.length, 17, "le disable en a retiré une, pour les deux langues");
  assert.equal(restantes.includes("srd:skill:en:animal-handling"), false);
  assert.equal(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:animal-handling" }), null);

  const perception = dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" });
  assert.match(perception.record.data.example_uses, /^Le MJ annonce/, "le patch a pris");
  // REWRITTEN 2026-08-08 — même arbitrage. Ce que l'assertion PROUVE ne change pas
  // (un patch n'emporte rien d'autre) ; seule la valeur attendue suit la source.
  assert.equal(perception.record.data.ability_key, "wis", "et n'a rien emporté d'autre — pas de fusion profonde");
  assert.equal(perception.record.name, "Perception");
  assert.equal(perception.provenance.from, "srd-5.2.1-en", "la provenance dit de quelle couche vient le record — l'anglais est monté en dernier");
  assert.deepEqual(perception.provenance.patchedBy.map((p) => p.by), ["table-eric"], "et qui l'a modifié");
  assert.equal(perception.record.contentHash, undefined,
    "le certificat de contenu tombe : il ne décrit plus ce record");
  assert.equal(perception.record.attribution.license, "CC-BY-4.0",
    "et la notice CC-BY reste — une couche ne décroche pas la licence d'un record dont elle dérive");

  assert.deepEqual(dispatch("layers.flags"), ["maison.veillee"], "le drapeau de la couche est levé");
});

test("éteindre la couche de table REND ce qu'elle avait pris", () => {
  dispatch("layers.disable", { id: "table-eric" });
  assert.equal(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:animal-handling" }).record.name,
    "Animal Handling", "rendue par la couche du dessus, qui est l'anglaise");
  assert.match(
    dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" }).record.data.example_uses,
    /^Using a combination/,
    "et la Perception retrouve son texte SRD, mot pour mot — celui de la couche du dessus"
  );
  assert.deepEqual(dispatch("layers.flags"), []);
  dispatch("layers.enable", { id: "table-eric" });
  assert.equal(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:animal-handling" }), null);
});

/* ── 4. La couche d'exemple du lot 2, sur la vraie pile ─────────────── */

test("la couche d'exemple du lot 2 s'applique au vrai SRD : elle ajoute, patche et désactive", () => {
  const registered = dispatch("layers.register", { bytes: fileBytes(HOMEBREW), origin: HOMEBREW });
  /* Le pont avec le lot 2 : l'empreinte calculée ici est celle que le
     personnage d'exemple transporte déjà dans `build.layers[]`. */
  const character = readJson("examples/personnage-srd-fr-niveau1.fh-char.json");
  const ref = character.build.layers.find((layer) => layer.id === "exemple-homebrew-fr");
  assert.equal(registered.hash, ref.hash);

  assert.equal(dispatch("layers.query", { kind: "gear", id: "exemple:gear:fr:lanterne-pliante" }).record.name,
    "Lanterne pliante", "l'ajout est là");
  assert.equal(dispatch("layers.query", { kind: "weapon", id: "srd:weapon:en:dagger" }).record.data.cost,
    "3 po", "le patch a touché le VRAI record SRD (2 po chez le SRD)");
  assert.equal(dispatch("layers.query", { kind: "spell", id: "srd:spell:en:fire-shield" }), null,
    "et le disable a retiré le vrai sort");

  const dague = dispatch("layers.query", { kind: "weapon", id: "srd:weapon:en:dagger" });
  // REWRITTEN 2026-08-26 — même arbitrage, valeur réadressée. Le patch homebrew
  // ne touche que `data.cost` ; tout le reste du record continue de venir de la
  // couche du dessus, qui est l'anglaise. C'est exactement ce que l'assertion
  // prouvait avant : un patch n'emporte rien d'autre que ce qu'il nomme.
  assert.equal(dague.record.data.damage, "1d4 Piercing", "le reste du record est intact");
  assert.deepEqual(dague.provenance.patchedBy[0].applied, [{ path: "data.cost", created: false }]);
});

/* ── 5. Une seule adresse, deux rendus (§0.13) ──────────────────────── */

/* REWRITTEN 2026-08-26 — la transition froide a retourné ce test.
   Il affirmait : « aucun id ne collisionne entre les deux langues », et citait
   `layers/TRADUCTION.md` (§L7.5) pour dire que RIEN ne rapproche un record
   français de son homologue anglais. C'était vrai, et la loi §0.13 l'a rendu
   faux EXPRÈS : les deux langues partagent désormais une adresse, et le
   français est un patch de mots par-dessus. Ce qui se mesure ici n'est donc
   plus une séparation mais son contraire — et surtout sa CONSÉQUENCE, qui est
   neuve : une couche de table écrite contre des identifiants français atteint
   maintenant le rendu anglais, parce qu'elle vise un objet, pas une langue. */

test("une adresse porte les deux langues, et une couche vise l'objet — pas la langue", () => {
  const skills = dispatch("layers.query", { kind: "skill" });
  assert.equal(skills.length, 17, "17 compétences, pas 35 : le disable de la table en a retiré une");
  assert.equal(skills.filter((view) => view.id.startsWith("srd:skill:en:")).length, skills.length,
    "et elles portent toutes l'adresse anglaise, qui est l'adresse tout court");

  /* ⛔ Plus aucun identifiant français nulle part, sur AUCUN des 16 genres —
     c'est la mesure de la transition froide, refaite ici sur la pile montée. */
  const genres = new Set(dispatch("layers.stack").flatMap((layer) => Object.keys(layer.records)));
  const francais = [...genres].flatMap((kind) => dispatch("layers.query", { kind }))
    .map((view) => view.id).filter((id) => id.includes(":fr:"));
  assert.deepEqual(francais, [], "un identifiant n'a plus de langue");

  /* La couche `table-eric` a été écrite quand `Dressage` et `Perception`
     étaient des records FRANÇAIS. Elle n'a pas changé d'une ligne, et elle
     mord maintenant sur l'anglais : c'est le prix — et le cadeau — de
     l'adresse unique. */
  assert.equal(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:animal-handling" }), null,
    "son disable retire la compétence pour les deux langues à la fois");
  assert.match(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" }).record.data.example_uses,
    /^Le MJ annonce/, "et son patch s'affiche sous un rendu anglais, tel qu'il a été écrit");

  /* Ce que la pile n'a PAS fait : deviner. Elle n'a jamais rapproché deux
     records par leur nom — l'appariement a été fait en amont, à froid, et la
     pile ne fait que le lire. Un slug français n'est pas une adresse. */
  assert.equal(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:dressage" }), null);
});

/* ── 6. « sans qu'aucun autre bloc n'ait lu son état » ──────────────── */

test("tout ce qui précède est passé par les VERBES, et il n'y a rien d'autre à lire", () => {
  /* Le bloc enregistré sur le noyau n'offre que `dispatch` ; l'instance
     elle-même n'a ni `state`, ni rouages, ni carte de la pile. Il n'existe
     aucun chemin de lecture en dehors de `query`, `flags`, `ruleValues` et
     `stack` — c'est ce qui rend la loi des blocs vérifiable plutôt que
     promise. */
  assert.throws(() => dispatch("layers.state"), /unknown verb "state"/);
  assert.throws(() => dispatch("layers.records"), /unknown verb "records"/);

  const stack = dispatch("layers.stack");
  assert.deepEqual(stack.map((layer) => layer.id), ["srd-5.2.1-fr", "srd-5.2.1-en", "table-eric", "exemple-homebrew-fr"]);
  for (const layer of stack) {
    /* Les trois champs que `fh-char/1` exige de `build.layers[]`, prêts à être
       recopiés par le bloc `build` — et rien qui se lise à travers eux. */
    assert.match(layer.hash, /^[0-9a-f]{64}$/);
    assert.equal(typeof layer.version, "string");
    assert.equal(typeof layer.id, "string");
    assert.equal(layer.records === undefined, false);
  }
  assert.throws(() => { stack[0].hash = "0".repeat(64); }, TypeError, "et le manifeste rendu est immuable");
});

test("le bus a annoncé chaque changement de pile, et rien de plus", () => {
  /* Deux `disable`/`enable` de plus qu'au lot 2 : le premier couple vient du
     test qui éteint la couche ANGLAISE pour voir ressortir les mots français
     sous la même adresse — un geste qui n'existait pas avant §0.13. */
  assert.deepEqual(changes.map((event) => event.reason),
    ["register", "register", "disable", "enable", "register", "disable", "enable", "register"]);
  for (const event of changes) {
    assert.equal(event.type, "layers-changed");
    assert.ok(Array.isArray(event.stack));
    assert.equal(typeof event.total, "number");
  }
});
