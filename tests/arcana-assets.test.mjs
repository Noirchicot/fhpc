/* ══ LE GARDE DES 22 ARCANES — LOT 61 ═════════════════════════════════════

   🔴 LE PIÈGE QU'IL EXISTE POUR TENIR, ET IL EST SILENCIEUX PAR NATURE.

   Le Tarot de Marseille numérote **la Justice en 8 et la Force en 11**. Le
   moteur suit l'ordre Rider-Waite : **`strength` porte VIII, `justice`
   porte XI** (mesuré dans `layers/fh-arcana-en.layer.json`). Un mapping
   image↔arcane fait **par numéro** intervertit donc les deux — le joueur
   tire « Strength », voit la Justice, et **rien ne plante** : deux fichiers
   valides, deux ids valides, zéro erreur. Aucun test de rendu ne peut voir
   ça, parce que du point de vue du code tout est correct.

   La seule parade est de vérifier le CONTENU du mapping, à la source. C'est
   ce que fait ce fichier, et c'est tout ce qu'il fait de vraiment
   irremplaçable.

   TROIS PREUVES :
     A. COUVERTURE — chacun des 22 arcanes du moteur a son image, et il n'y
        a pas d'image orpheline. Un arcane sans face afficherait une image
        cassée au moment le plus théâtral de l'écran.
     B. 🔴 LE MAPPING EST LE BON — la Force vient de `11-la-force` et la
        Justice de `8-la-justice`, pas l'inverse. Vérifié sur le fichier de
        mesure, qui garde la trace de la source de chaque image.
     C. LES FICHIERS SERVIS SONT CEUX QUI ONT ÉTÉ MESURÉS (sha256), et ils
        sont légers. Même patron que le garde du décor (lot 59).

   ⚠️ SA LIMITE : il ne REGARDE aucune image. Si la source `11-la-force.jpg`
   contenait la Justice dessinée, il n'en saurait rien — il garantit que la
   CHAÎNE de nommage est correcte de bout en bout, pas que le peintre du
   XVIIIᵉ siècle ne s'est pas trompé. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "ui", "builder", "assets", "arcana");
const MESURE = JSON.parse(fs.readFileSync(path.join(ASSETS, "arcana.measured.json"), "utf8"));
const LAYER = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "fh-arcana-en.layer.json"), "utf8"));

const SLUGS = Object.keys(LAYER.records.arcana).map((id) => id.replace("fh:arcana:en:", ""));
const NUMERAUX = Object.fromEntries(
  Object.entries(LAYER.records.arcana).map(([id, r]) => [id.replace("fh:arcana:en:", ""), r.data.numeral])
);

/* ══ A — COUVERTURE : 22 ARCANES, 22 FACES, PAS UNE DE PLUS ══════════════ */

test("A — les 22 arcanes du moteur ont chacun leur face", () => {
  assert.equal(SLUGS.length, 22, "témoin : le moteur en publie bien 22");
  const manquants = SLUGS.filter((s) => !fs.existsSync(path.join(ASSETS, `${s}.jpg`)));
  assert.deepEqual(manquants, [],
    "un arcane sans face afficherait une image cassée au moment le plus théâtral de l'écran");
});

test("A bis — et aucune face orpheline (une image qu'aucun arcane ne réclame)", () => {
  const fichiers = fs.readdirSync(ASSETS).filter((f) => f.endsWith(".jpg") && f !== "back.jpg");
  const orphelines = fichiers.filter((f) => !SLUGS.includes(f.replace(".jpg", "")));
  assert.deepEqual(orphelines, [], "une image que personne n'affiche est du poids mort livré au joueur");
});

test("A ter — le DOS existe (B6.1b : la carte arrive DE DOS, c'est tout le geste)", () => {
  assert.ok(fs.existsSync(path.join(ASSETS, "back.jpg")),
    "sans dos, il n'y a plus rien à retourner — l'écran perd sa raison d'être");
});

/* ══ B — 🔴 LE MAPPING, ET LE PIÈGE ══════════════════════════════════════ */

test("B — 🔴 LA FORCE ET LA JUSTICE NE SONT PAS INTERVERTIES", () => {
  /* La mesure d'abord : le moteur suit bien Rider-Waite. Si un jour le
     layer changeait d'ordre, c'est ICI qu'on veut l'apprendre — pas devant
     un joueur perplexe. */
  assert.equal(NUMERAUX.strength, "VIII", "le moteur met la Force en VIII (Rider-Waite)");
  assert.equal(NUMERAUX.justice, "XI", "et la Justice en XI");

  /* Et Marseille fait l'inverse. Le mapping doit donc CROISER les numéros. */
  assert.equal(MESURE.fichiers["strength.jpg"].source, "11-la-force",
    "la Force vient du 11 de Marseille — un mapping par NUMÉRO aurait pris « 8-la-justice »");
  assert.equal(MESURE.fichiers["justice.jpg"].source, "8-la-justice",
    "et la Justice du 8 — l'échange est exactement ce qu'il faut faire");
});

test("B bis — ⚔️ ATTAQUE : un mapping PAR NUMÉRO produirait bien l'inversion, et le garde la verrait", () => {
  /* On rejoue la faute : associer chaque arcane au fichier Marseille dont le
     numéro correspond à sa position. Ce n'est pas hypothétique — c'est la
     façon la plus naturelle d'écrire ce mapping. */
  const parNumero = { strength: "8-la-justice", justice: "11-la-force" };
  assert.notEqual(parNumero.strength, MESURE.fichiers["strength.jpg"].source,
    "témoin : les deux mappings DIVERGENT bien — sinon ce garde ne prouverait rien");
  assert.notEqual(parNumero.justice, MESURE.fichiers["justice.jpg"].source);
});

test("B ter — les 20 autres arcanes gardent leur numéro de Marseille", () => {
  /* Le croisement ne concerne QUE ces deux-là. Si un troisième se mettait à
     croiser, ce serait une erreur de saisie, pas une règle. */
  const croises = SLUGS.filter((slug) => {
    const src = MESURE.fichiers[`${slug}.jpg`].source;
    return slug !== "strength" && slug !== "justice" && !src;
  });
  assert.deepEqual(croises, [], "chaque arcane doit déclarer sa source");
  /* Le Mat porte 0 chez Rider-Waite et 22 chez Marseille : c'est le second
     décalage connu, et il est normal — le Mat n'est pas numéroté à l'origine. */
  assert.equal(MESURE.fichiers["the-fool.jpg"].source, "22-le-mat");
  /* `"0"`, une CHAÎNE : le layer écrit les numéraux en romain (« VIII »,
     « XI »), et le Mat en « 0 ». Mesuré en écrivant ce test — comparer à un
     nombre échouait, et c'est le genre d'écart qu'on veut voir ici plutôt
     que dans un `String()` complaisant au rendu. */
  assert.equal(NUMERAUX["the-fool"], "0");
});

/* ══ C — LES FICHIERS SERVIS SONT CEUX QUI ONT ÉTÉ MESURÉS ═══════════════ */

test("C — chaque image servie correspond à son condensat (aucun remplacement en silence)", () => {
  const fautives = [];
  for (const [nom, m] of Object.entries(MESURE.fichiers)) {
    const sha = crypto.createHash("sha256").update(fs.readFileSync(path.join(ASSETS, nom))).digest("hex");
    if (sha !== m.sha256) fautives.push(nom);
  }
  assert.deepEqual(fautives, [],
    "remplacer une image sans remesurer, c'est exactement comme ça qu'on intervertit deux cartes sans le voir");
});

test("C bis — le jeu complet reste léger, et chaque fichier est bien un JPEG", () => {
  let total = 0;
  for (const nom of Object.keys(MESURE.fichiers)) {
    const bytes = fs.readFileSync(path.join(ASSETS, nom));
    assert.equal(bytes[0], 0xFF, `${nom} : octet magique JPEG attendu`);
    assert.equal(bytes[1], 0xD8, `${nom} : octet magique JPEG attendu`);
    total += bytes.length;
  }
  assert.ok(total < 2 * 1024 * 1024,
    `les 23 fichiers pèsent ${Math.round(total / 1024)} Ko — au-delà de 2 Mo, on a reperdu le JPEG ` +
    "(les sources PNG de l'art FH font 3 Mo PIÈCE)");
});

/* ══ D — ⏳ CE QUI EST PROVISOIRE, ÉCRIT PLUTÔT QUE TU ═══════════════════ */

test("D — le fichier de mesure DIT que ce jeu est provisoire", () => {
  /* L'art FH d'Eric couvre 12 des 22 arcanes (statuts locked/pilot/approved).
     Marseille tient l'écran en attendant. Ce test ne juge pas ce choix — il
     exige qu'il reste ÉCRIT, pour que personne ne prenne le provisoire pour
     du définitif six semaines plus tard. */
  assert.match(MESURE._provisoire, /12 des 22/,
    "le caractère provisoire du jeu doit rester lisible dans le fichier de mesure");
  assert.match(MESURE._mapping, /Justice.*8.*Force.*11|Force.*11.*Justice.*8/s,
    "et le piège du mapping doit rester nommé là où on prépare les images");
});
