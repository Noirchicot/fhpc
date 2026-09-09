/* 📍 tests/gen-livre-layer.test.mjs · le port d'import des livres du joueur · 09/09
   ⚖️ Eric, 09/09 : « Importe le PHB et DMG ! … LA VERSION OFFICIELLE NE CONTIENDRA
   PAS DMG ET PLAYER », « tu dois pouvoir les activer et les désactiver », « ils
   seront visibles dans le menu », « on superpose », ⛔ « on ne veut pas de
   doublons inutiles ».

   ⭐ POURQUOI CE FICHIER NE LIT PAS LE DISQUE. La source et la couche du livre
   sont IGNORÉES PAR GIT — c'est ce qui rend vraie la phrase d'Eric. Un test qui
   les lirait serait donc VERT chez lui et ABSENT en intégration : il ne
   garderait rien là où ça compte. Tout se prouve sur un montage écrit ici. */

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  construireCouche, slugDuNom, couleurDuNom, idCanonique,
  LIVRES, REPERTOIRES_HORS_DEPOT, ETAGERES, fail
} from "../src/tools/gen-livre-layer.mjs";
import { GEMMES_DU_LIVRE, idCanonique as idGemmeFH } from "../src/tools/gen-fh-gems-layer.mjs";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Un montage minuscule, mais qui porte les QUATRE sections et surtout les DEUX
   cas d'identité : `azurite` que Fate's Hand porte aussi, `obsidian` qu'il ne
   porte pas. Sans les deux, le test ne distingue rien. */
function source() {
  return {
    gemstones: { "10": ["Azurite (mottled deep blue)", "Obsidian (black)"] },
    art_objects: { "25": ["Silver ewer"] },
    trade_goods: [{ name: "Saffron", cost: "15 GP", unit: "1 lb." }],
    trade_bars: [{ name: "5-pound gold bar", gp: 250, lb: 5, dimensions: "5 in. long" }]
  };
}

test("témoin — le montage produit les quatre sections, et rien d'autre", () => {
  const { layer, comptes } = construireCouche(source());
  assert.equal(layer.id, "xdmg-en");
  assert.deepEqual(comptes, { gem: 2, gear: 3, shelving: 5 });
  assert.deepEqual(Object.keys(layer.records).sort(), ["gear", "gem", "shelving"]);
});

test("⚖️ LA SUPERPOSITION EST DANS L'ID — la pierre partagée porte le MÊME id des deux côtés", () => {
  const { layer, partages } = construireCouche(source());
  const ids = Object.keys(layer.records.gem);
  /* ⭐ LE CŒUR DU LOT. Le moteur ne sait superposer que si les deux couches
     posent le même id (`stack.mjs:143`, « le dernier qui parle gagne »). Ce
     test lit l'id que produit le générateur du LIVRE et celui que produit le
     générateur de FATE'S HAND, et exige qu'ils soient ÉGAUX. */
  assert.ok(ids.includes("srfh:gem:en:azurite"), "azurite est partagée : id `srfh:`");
  assert.equal(idGemmeFH("fh:gem:en:azurite"), "srfh:gem:en:azurite",
    "⛔ les deux générateurs doivent produire LE MÊME id, sinon le doublon revient");
  /* ⚔️ ET LE CAS INVERSE, sans lequel le garde dirait « tout est partagé » : une
     pierre que Fate's Hand n'a pas garde le sigle du livre et disparaît avec lui. */
  assert.ok(ids.includes("xdmg:gem:en:obsidian"),
    "obsidian n'est pas dans l'échelle d'Eric : elle appartient au DMG seul");
  assert.deepEqual(partages, ["azurite"]);
});

test("⚖️ LE RANGEMENT SUIT LA PIERRE — sinon le doublon revient par la porte du rangement", () => {
  const { layer } = construireCouche(source());
  const ids = Object.keys(layer.records.shelving);
  assert.ok(ids.includes("srfh:shelving:en:azurite"), "le rangement d'une pierre partagée est partagé");
  assert.ok(ids.includes("xdmg:shelving:en:obsidian"), "celui d'une pierre du livre seul ne l'est pas");
  /* ⚔️ Un rangement `xdmg:` pour azurite ferait DEUX lignes dans le rayon, avec
     une seule pierre dessous. C'est exactement le doublon qu'Eric refuse. */
  assert.equal(ids.includes("xdmg:shelving:en:azurite"), false);
});

test("🔴 LE SLUG IGNORE LA COULEUR — deux sources doivent produire le même mot", () => {
  assert.equal(slugDuNom("Star rose quartz (rosy stone with white star-shaped center)"), "star-rose-quartz");
  assert.equal(couleurDuNom("Azurite (mottled deep blue)"), "mottled deep blue");
  /* ⛔ SI LA PARENTHÈSE ENTRAIT DANS LE SLUG, aucune pierre ne collisionnerait
     jamais : la superposition serait silencieusement morte, et rien ne le dirait. */
  assert.equal(slugDuNom("Azurite (mottled deep blue)"), slugDuNom("Azurite"));
});

test("🔴 LE PRIX DES MARCHANDISES SE RECOPIE — il ne se convertit pas en po", () => {
  const { layer } = construireCouche(source());
  const saffron = layer.records.gear["xdmg:gear:en:saffron"];
  assert.equal(saffron.data.cost, "15 GP", "le prix est celui du livre, mot pour mot");
  const ble = construireCouche({ trade_goods: [{ name: "Wheat", cost: "1 CP", unit: "1 lb." }] });
  assert.equal(ble.layer.records.gear["xdmg:gear:en:wheat"].data.cost, "1 CP",
    "⛔ convertir « 1 CP » en po inventerait une précision que le livre ne donne pas");
});

test("⚔️ ATTAQUE — un livre inconnu, une source absente, un slug produit deux fois", () => {
  assert.throws(() => construireCouche(source(), "manuel-des-plans"), /livre inconnu/);
  assert.throws(() => construireCouche(null), /source absente/);
  assert.throws(() => construireCouche({
    gemstones: { "10": ["Azurite (deep blue)", "Azurite (pale blue)"] }
  }), /produit deux fois/);
  assert.throws(() => construireCouche({ gemstones: { "dix": ["Azurite"] } }), /palier de gemme illisible/);
});

test("⛔ LA VERSION OFFICIELLE NE PEUT PAS CONTENIR LE LIVRE — et c'est git qui le garantit", () => {
  /* ⚖️ Eric, 09/09 : « la version officielle ne contiendra pas DMG et player ».
     ⭐ CE GARDE NE VÉRIFIE PAS UNE INTENTION, IL VÉRIFIE UN MÉCANISME. Une
     règle qui ne vit que dans un commentaire ne survit pas à l'oubli ; ici
     c'est `git check-ignore` qui répond, et il répond la même chose à tout le
     monde. Un clone frais n'a NI la source NI la couche — par absence. */
  for (const dossier of REPERTOIRES_HORS_DEPOT) {
    const sortie = execFileSync("git", ["check-ignore", "-v", `${dossier}/x.json`],
      { cwd: RACINE, encoding: "utf8" });
    assert.match(sortie, new RegExp(`\\.gitignore.*${dossier}/`),
      `« ${dossier}/ » doit être ignoré par git — sans ça le livre peut entrer dans un commit`);
  }
  /* ⚔️ LE TÉMOIN QUI PROUVE QUE LA COMMANDE SAIT DIRE NON — un garde qui ne
     peut jamais accuser est le pire de tous. `layers/` n'est PAS ignoré. */
  assert.throws(() => execFileSync("git", ["check-ignore", "-q", "layers/x.json"], { cwd: RACINE }),
    "témoin : `layers/` doit rester versionné, sinon ce garde dit oui à tout");
  /* ⚔️ ET LE VRAI DANGER, MESURÉ SUR L'INDEX : aucun fichier de livre ne doit
     être SUIVI par git. Le `.gitignore` ne protège pas un fichier déjà ajouté. */
  const suivis = execFileSync("git", ["ls-files"], { cwd: RACINE, encoding: "utf8" })
    .split("\n").filter((f) => REPERTOIRES_HORS_DEPOT.some((d) => f.startsWith(`${d}/`)));
  assert.deepEqual(suivis, [],
    "⛔ un fichier de livre est SUIVI par git — `.gitignore` ne désindexe pas ce qui l'est déjà");
});

test("🔴 LE DÉPÔT PORTE LE GÉNÉRATEUR, ET LE GÉNÉRATEUR NE PORTE PAS LE LIVRE", () => {
  /* ⚔️ Le piège inverse du précédent : rien n'empêche quelqu'un d'INLINER les
     52 pierres dans le générateur « pour simplifier ». Le contenu serait alors
     dans le dépôt malgré le `.gitignore`. On mesure donc le générateur. */
  const code = readFileSync(join(RACINE, "src/tools/gen-livre-layer.mjs"), "utf8");
  for (const mot of ["Rhodochrosite", "Chrysoprase", "Sardonyx", "Bejeweled", "Alexandrite"]) {
    assert.equal(code.includes(mot), false,
      `« ${mot} » est un nom du DMG écrit DANS le générateur — le contenu doit rester hors du dépôt`);
  }
  /* ⚔️ Et le témoin : les mots cherchés existent bel et bien dans le livre,
     sinon ce garde chercherait des fantômes et serait vert pour rien. */
  const { layer } = construireCouche({ gemstones: { "50": ["Sardonyx (bands of red and white)"] } });
  assert.ok(Object.keys(layer.records.gem).includes("xdmg:gem:en:sardonyx"),
    "témoin : « Sardonyx » est bien un nom que ce générateur sait traiter");
});

test("🔴 LES QUATRE ÉTAGÈRES SONT DISTINCTES, TOUTES AU RAYON DU LIVRE", () => {
  const rayons = new Set(Object.values(ETAGERES).map((e) => e.split(":")[0]));
  assert.deepEqual([...rayons], ["trade-goods"], "un seul rayon — le mot du livre, ratifié le 09/09");
  assert.equal(new Set(Object.values(ETAGERES)).size, 4,
    "quatre étagères : un joueur qui cherche un lingot ne cherche pas parmi 52 pierres");
});

test("🔴 LES DEUX LIVRES SONT DÉCLARÉS, AVEC LE SIGLE DU FORMAT D'ÉCHANGE", () => {
  assert.deepEqual(Object.keys(LIVRES).sort(), ["dmg-2024", "phb-2024"]);
  assert.deepEqual(Object.values(LIVRES).map((l) => l.sigle).sort(), ["XDMG", "XPHB"],
    "les sigles sont ceux de Foundry/5e.tools — « c'est essentiel de passer par ce format »");
  assert.equal(typeof fail, "function");
  assert.equal(idCanonique("gem", "azurite", LIVRES["dmg-2024"]), "srfh:gem:en:azurite");
  assert.ok(Object.hasOwn(GEMMES_DU_LIVRE, "azurite"));
});

/* ══════════════════════════════════════════════════════════════════════════
   ⚖️ « SI ON A BIEN FAIT NOTRE BOULOT, ON PEUT SUPERPOSER SRD + LIVRES + FH »
   Eric, 09/09. ⭐ Une ÉPREUVE, pas une phrase — et elle se mesure sur la pile
   RÉELLE, pas sur une intention. Ce qui suit monte les trois étages et exige
   trois choses : que ça tienne, qu'il n'y ait qu'UN record par pierre, et que
   ce soit FATE'S HAND qui gagne.
   ⚠️ La couche du livre est construite ICI, par `construireCouche` — jamais
   lue sur le disque : elle y est ignorée par git, et un test qui la lirait
   serait vert chez Eric et ABSENT partout ailleurs.
   ══════════════════════════════════════════════════════════════════════════ */

test("⚖️ L'ÉPREUVE DES TROIS ÉTAGES — la pile monte, et il n'y a qu'UNE azurite", () => {
  const { layer: livre } = construireCouche({
    gemstones: { "10": ["Azurite (mottled deep blue)", "Obsidian (black)"] }
  });
  const fh = JSON.parse(readFileSync(join(RACINE, "layers/fh-gems-en.layer.json"), "utf8"));

  /* ⭐ L'ORDRE EST LA LOI : le livre AU-DESSUS du SRD, EN DESSOUS de FH.
     C'est lui, et rien d'autre, qui décide que FH recouvre le livre. */
  const records = new Map();
  const recouvrements = [];
  const dansLeVide = [];
  for (const couche of [livre, fh]) {
    for (const [id, entree] of Object.entries(couche.records.gem || {})) {
      const op = entree.op || "add";
      if (op !== "add") { if (!records.has(id)) dansLeVide.push(`${couche.id} → ${id}`); continue; }
      if (records.has(id)) recouvrements.push({ id, sur: records.get(id).src, par: couche.id });
      records.set(id, { entree, src: couche.id });
    }
  }

  assert.deepEqual(dansLeVide, [], "aucune opération ne doit tomber dans le vide : la pile tient");

  /* ⛔ LE CŒUR DE L'ÉPREUVE. 2 gemmes au livre + 54 à FH feraient 56 lignes si
     rien ne se superposait. `azurite` étant partagée, il en reste 55. */
  const total = Object.keys(fh.records.gem).length + Object.keys(livre.records.gem).length;
  assert.equal(records.size, total - 1,
    "une pierre partagée doit donner UNE ligne, pas deux — c'est « on ne veut pas de doublons inutiles »");

  const azurites = [...records.keys()].filter((id) => id.endsWith(":azurite"));
  assert.deepEqual(azurites, ["srfh:gem:en:azurite"],
    "⛔ un second id finissant par « azurite » serait le doublon, revenu par un autre namespace");

  /* ⚔️ ET LE GAGNANT EST FATE'S HAND — « FH doit se superposer », donc au-dessus.
     Si le livre gagnait, la loi serait inversée sans que le compte le dise. */
  assert.equal(records.get("srfh:gem:en:azurite").src, "fh-gems-en",
    "c'est la couche FH qui doit recouvrir le livre, jamais l'inverse");
  assert.deepEqual(recouvrements.map((r) => [r.sur, r.par]), [["xdmg-en", "fh-gems-en"]],
    "le recouvrement est nommé : le livre en dessous, Fate's Hand au-dessus");

  /* ⚔️ ET LA PIERRE QUE FH N'A PAS SURVIT — sans quoi « superposer » voudrait
     dire « remplacer », et éteindre FH ne rendrait rien de plus. */
  assert.equal(records.get("xdmg:gem:en:obsidian").src, "xdmg-en",
    "obsidian n'est qu'au livre : elle reste, et elle reste au livre");
});
