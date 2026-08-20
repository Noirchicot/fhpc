/* ══ LES SORTS DE FATE'S HAND — LOT 80 ═════════════════════════════════════
   🔴 CE LOT EXISTE PARCE QUE LE LIVRE AVAIT HUIT SORTS QUE LE MOTEUR N'AVAIT
   PAS. Trouvé le 2026-08-20, et trouvé par l'inverse du chemin habituel : j'ai
   lu `spell : +0 ~0 -0` dans mon propre export et j'en ai conclu que Fate's
   Hand n'avait pas de sorts. Faux. La couche ne disait rien des sorts ; le
   CHAPITRE en portait huit, dont quatre entièrement neufs.
   ⛔ Une absence dans la donnée n'est pas une réponse sur le livre.

   ── LA RÈGLE D'ERIC, ET C'EST ELLE QUE LA FORME DE LA COUCHE EXPRIME ─────
   *« En fait tu prends le sort du SRD, tu rajoutes l'effet »* (2026-08-20).
   Quatre sorts sont neufs — ils s'ajoutent. Quatre sont des sorts du SRD
   auxquels Fate's Hand ajoute un effet — ils se PATCHENT, et le patch ne
   touche qu'un champ qui n'existe pas au SRD (`data[fh_effect]`).

   ⭐ LE `patch` N'EST PAS UN DÉTAIL D'IMPLÉMENTATION, C'EST LA RÈGLE EN
   MÉCANIQUE. Réécrire `data.description` aurait recopié la prose du SRD dans
   notre couche : elle se serait figée, et le jour où le SRD bouge elle aurait
   menti sans que rien ne le dise. Le garde central de cette suite est donc
   celui qui vérifie que **le texte SRD sort du pli intact**. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { monter } from "../src/tools/gen-fh-changes.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRD = JSON.parse(readFileSync(join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));
const COUCHE = JSON.parse(readFileSync(join(ROOT, "layers", "fh-spells-en.layer.json"), "utf8"));

/** Les quatre neufs, avec ce que le chapitre d'Eric déclare pour chacun. */
const NEUFS = [
  { id: "fh:spell:en:appease-the-chaos", name: "Appease the Chaos", level: 3, school: "abjuration", classes: ["Cleric", "Druid"] },
  { id: "fh:spell:en:devil-vision", name: "Devil-Vision", level: 2, school: "divination", classes: ["Wizard", "Warlock"] },
  { id: "fh:spell:en:consecration", name: "Consecration", level: 1, school: "abjuration", classes: ["Cleric", "Paladin"] },
  { id: "fh:spell:en:transfer-essence", name: "Transfer Essence", level: 1, school: "transmutation", classes: ["Wizard", "Cleric", "Druid", "Warlock"] }
];

/** Les quatre du SRD auxquels Fate's Hand ajoute un effet. */
const PATCHÉS = ["srd:spell:en:bless", "srd:spell:en:guidance", "srd:spell:en:identify", "srd:spell:en:gentle-repose"];

const pile = () => monter(PILE);

test("témoin — la pile porte les 339 du SRD PLUS les quatre maison", () => {
  const sorts = pile().query({ kind: "spell" });
  assert.equal(sorts.length, 343,
    "339 sorts SRD + 4 de Fate's Hand — si ce compte bouge, dire pourquoi avant de le corriger");
});

test("🔴 les quatre sorts neufs sont dans la pile, avec leur école et leur niveau", () => {
  const verbs = pile().query;
  for (const attendu of NEUFS) {
    const vue = pile().query({ kind: "spell", id: attendu.id });
    assert.ok(vue, `${attendu.name} devrait exister — sans lui, personne ne peut le choisir`);
    const data = vue.record.data;
    assert.equal(vue.record.name, attendu.name);
    assert.equal(data.level, attendu.level, `${attendu.name} : niveau`);
    assert.equal(data.school, attendu.school, `${attendu.name} : école`);
    assert.deepEqual(data.classes, attendu.classes, `${attendu.name} : qui le lance`);
  }
  void verbs;
});

test("⛔ un sort neuf SANS classe n'entrerait dans la liste de personne", () => {
  /* Mesuré sur `Devil-Vision` le 2026-08-20 : il est resté sans ligne
     `Classes` jusqu'au soir. Un sort qui existe dans le livre et dans aucune
     liste de classe est invisible pour tout personnage — un défaut qui ne
     casse rien, ne rougit nulle part, et rend le sort injouable. */
  for (const attendu of NEUFS) {
    const data = pile().query({ kind: "spell", id: attendu.id }).record.data;
    assert.ok(Array.isArray(data.classes) && data.classes.length > 0,
      `${attendu.name} n'a aucune classe : aucun personnage ne peut l'apprendre`);
  }
});

/* ══ LE GARDE CENTRAL — « on prend le sort du SRD, on ajoute l'effet » ════ */

test("🔴 les quatre sorts patchés sortent du pli avec leur TEXTE SRD INTACT", () => {
  /* ⭐ C'EST LA RÈGLE D'ERIC, VÉRIFIÉE PLUTÔT QUE PROMISE. Chaque champ que le
     SRD publie doit traverser le pli sans une virgule de différence ; seul
     `fh_effect`, qui n'existe pas au SRD, s'ajoute. */
  const verbs = pile();
  for (const id of PATCHÉS) {
    const avant = SRD.records.spell[id].data;
    const apres = verbs.query({ kind: "spell", id }).record.data;
    for (const champ of Object.keys(avant)) {
      assert.deepEqual(apres[champ], avant[champ],
        `${id} : le champ « ${champ} » a été modifié — Fate's Hand AJOUTE un effet, il ne réécrit pas le SRD`);
    }
    assert.ok(typeof apres.fh_effect === "string" && apres.fh_effect.length > 0,
      `${id} : l'effet Fate's Hand est absent`);
  }
});

test("⚔️ ATTAQUE — un patch qui réécrirait `data.description` est VU par le même contrôle", () => {
  /* Le garde ne vaut que s'il mord. On fabrique la faute exacte que la règle
     d'Eric interdit : la description du SRD, recopiée et retouchée. */
  const avant = SRD.records.spell["srd:spell:en:bless"].data;
  const falsifié = { ...avant, description: avant.description + "\n\nAnd Fate's Hand says otherwise." };
  const fautes = Object.keys(avant).filter((champ) =>
    JSON.stringify(falsifié[champ]) !== JSON.stringify(avant[champ]));
  assert.deepEqual(fautes, ["description"],
    "l'attaque doit être vue par le MÊME contrôle que celui qui garde les vraies couches");
});

test("⛔ la couche ne DÉCLARE que `data[fh_effect]` sur les records du SRD", () => {
  /* Le garde ci-dessus lit le RÉSULTAT du pli ; celui-ci lit l'INTENTION
     écrite dans la couche. Les deux peuvent diverger : un patch pourrait viser
     un champ que le SRD n'a pas encore et qui arriverait demain. */
  for (const id of PATCHÉS) {
    const entrée = COUCHE.records.spell[id];
    assert.equal(entrée.op, "patch", `${id} doit être un patch, jamais un add`);
    assert.deepEqual(Object.keys(entrée.changes), ["data[fh_effect]"],
      `${id} : un patch de sort ne touche QUE le champ maison`);
    assert.equal(entrée.remove, undefined, `${id} : un patch de sort ne retire rien du SRD`);
  }
});

test("⭐ le magicien de niveau 1 voit le sort maison de son niveau, pas celui du niveau 2", () => {
  /* La preuve que le lot sert à quelque chose : avant lui, un magicien ne
     pouvait pas préparer `Transfer Essence` alors que le chapitre le lui
     donnait. Et `Devil-Vision`, de niveau 2, reste hors de portée — le filtre
     de niveau n'a pas été desserré au passage. */
  const sorts = pile().query({ kind: "spell" });
  const duMage = (niveau) => sorts.filter((v) => {
    const d = v.record.data || {};
    return Array.isArray(d.classes) && d.classes.includes("Wizard") && d.level === niveau;
  }).map((v) => v.id);
  assert.ok(duMage(1).includes("fh:spell:en:transfer-essence"));
  assert.ok(duMage(2).includes("fh:spell:en:devil-vision"));
  assert.equal(duMage(1).includes("fh:spell:en:devil-vision"), false);
});

test("la couche n'éteint AUCUN sort du SRD, et n'en renomme aucun", () => {
  /* Eric, 2026-08-20 : *« tout ce qui n'est pas SRD ou FH doit dégager »*. Le
     tri a été fait dans le chapitre, pas dans la couche : ici on n'a rien à
     retirer, et le vérifier empêche qu'un lot futur le fasse en passant. */
  const entrées = Object.entries(COUCHE.records.spell);
  const éteints = entrées.filter(([, v]) => v.op === "disable").map(([id]) => id);
  assert.deepEqual(éteints, [], "aucun sort du SRD n'est éteint par Fate's Hand");
  const ajouts = entrées.filter(([, v]) => !v.op);
  assert.equal(ajouts.length, 4, "quatre ajouts, pas un de plus");
  for (const [id] of ajouts) {
    assert.match(id, /^fh:spell:en:/, "un ajout maison porte un id maison — jamais un id srd:");
  }
});
