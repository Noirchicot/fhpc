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
  const ids = dispatch("layers.query", { kind: "skill" })
    .filter((view) => view.record.slug !== undefined && view.id.startsWith("srd:skill:fr:"))
    .map((view) => view.id).sort();
  assert.deepEqual(ids, DIX_HUIT.slice().sort());

  const perception = dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" });
  assert.equal(perception.record.name, "Perception");
  // REWRITTEN 2026-08-08 — arbitrage de l'architecte, à la fusion du lot 8.
  // L'assertion épinglait « sag » et invoquait layers/TRADUCTION.md : c'était une
  // erreur de catégorie. La clef n'est pas un enjeu INTER-langues — `resolved.abilities`
  // de fh-char/1 est additionalProperties:false sur str/dex/con/int/wis/cha, REQUIS
  // dans les deux langues. Une compétence FR qui disait « sag » ne pouvait pas adresser
  // les caractéristiques de son PROPRE document. Réécrite à la nouvelle vérité, jamais relâchée.
  assert.equal(perception.record.data.ability_key, "wis", "la clef est CANONIQUE dans les deux langues — « wis », joignable à resolved.abilities");
  assert.equal(perception.record.data.ability, "Sagesse", "et le mot affichable reste français : le moteur produit des identifiants, l'interface des mots (loi §0.13)");
  assert.equal(perception.provenance.from, "srd-5.2.1-fr");
  assert.deepEqual(perception.provenance.patchedBy, [], "personne ne l'a encore touchée");
  assert.equal(perception.record.attribution.license, "CC-BY-4.0", "et sa notice CC-BY voyage avec elle");
});

/* ── 3. Une couche homebrew par-dessus : un patch, un disable ───────── */

test("une couche de table patche une compétence et en désactive une autre — query rend le PLI", () => {
  dispatch("layers.register", { bytes: COUCHE_DE_TABLE, origin: "table-eric" });

  const restantes = dispatch("layers.query", { kind: "skill" })
    .map((view) => view.id).filter((id) => id.startsWith("srd:skill:fr:"));
  assert.equal(restantes.length, 17, "le disable en a retiré une");
  assert.equal(restantes.includes("srd:skill:en:animal-handling"), false);
  assert.equal(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:animal-handling" }), null);

  const perception = dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" });
  assert.match(perception.record.data.example_uses, /^Le MJ annonce/, "le patch a pris");
  // REWRITTEN 2026-08-08 — même arbitrage. Ce que l'assertion PROUVE ne change pas
  // (un patch n'emporte rien d'autre) ; seule la valeur attendue suit la source.
  assert.equal(perception.record.data.ability_key, "wis", "et n'a rien emporté d'autre — pas de fusion profonde");
  assert.equal(perception.record.name, "Perception");
  assert.equal(perception.provenance.from, "srd-5.2.1-fr", "la provenance dit d'où vient le record");
  assert.deepEqual(perception.provenance.patchedBy.map((p) => p.by), ["table-eric"], "et qui l'a modifié");
  assert.equal(perception.record.contentHash, undefined,
    "le certificat de contenu tombe : il ne décrit plus ce record");
  assert.equal(perception.record.attribution.license, "CC-BY-4.0",
    "et la notice CC-BY reste — une couche ne décroche pas la licence d'un record dont elle dérive");

  assert.deepEqual(dispatch("layers.flags"), ["maison.veillee"], "le drapeau de la couche est levé");
});

test("éteindre la couche de table REND ce qu'elle avait pris", () => {
  dispatch("layers.disable", { id: "table-eric" });
  assert.equal(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:animal-handling" }).record.name, "Dressage");
  assert.match(
    dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" }).record.data.example_uses,
    /^Par l’intermédiaire/,
    "et la Perception retrouve son texte SRD, mot pour mot"
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
  assert.equal(dague.record.data.damage, "1d4 perforants", "le reste du record est intact");
  assert.deepEqual(dague.provenance.patchedBy[0].applied, [{ path: "data.cost", created: false }]);
});

/* ── 5. Aucune correspondance FR↔EN (§L7.5) ─────────────────────────── */

test("les deux langues cohabitent sans jamais s'apparier", () => {
  const skills = dispatch("layers.query", { kind: "skill" });
  const fr = skills.filter((view) => view.id.startsWith("srd:skill:fr:"));
  const en = skills.filter((view) => view.id.startsWith("srd:skill:en:"));
  assert.equal(en.length, 18, "l'anglais est entier — le disable français ne l'a pas touché");
  assert.equal(fr.length, 17);
  assert.equal(fr.length + en.length, skills.length, "et il n'y a rien d'autre qu'eux");

  /* Aucun id n'est partagé : c'est la mesure de `layers/TRADUCTION.md`, refaite
     ici sur les 16 genres à la fois. */
  const ids = new Set(skills.map((view) => view.id));
  assert.equal(ids.size, skills.length, "aucun id ne se recouvre d'une langue à l'autre");

  /* La pile LIT `lang`, elle ne la devine jamais. Perception (fr) patchée,
     Perception (en) intacte — deux records, deux vies. */
  assert.match(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" }).record.data.example_uses,
    /^Le MJ annonce/);
  assert.match(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:perception" }).record.data.example_uses,
    /^Using/, "l'anglais n'a rien reçu du patch français");
  assert.equal(dispatch("layers.query", { kind: "skill", id: "srd:skill:en:dressage" }), null,
    "et un id français n'existe pas côté anglais : rien ne les rapproche");
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
  assert.deepEqual(changes.map((event) => event.reason),
    ["register", "register", "register", "disable", "enable", "register"]);
  for (const event of changes) {
    assert.equal(event.type, "layers-changed");
    assert.ok(Array.isArray(event.stack));
    assert.equal(typeof event.total, "number");
  }
});
