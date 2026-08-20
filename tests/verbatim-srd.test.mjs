/* ══ CE QUE FATE'S HAND NE TOUCHE PAS — la ligne verbatim ═══════════════════
   🔴 DÉCISION D'ERIC, 2026-08-20, en deux temps :
     *« Pour les armes, je n'ai rien fait de différent du SRD, idem SRD »*
     *« Dégage ma règle maison sur le graze […] Pareil, on reste verbatim SRD
       sur les feats de combat et les masteries. »*

   Ce qui l'a provoquée : le chapitre FH décrivait une interaction entre *Graze*
   et *Great Weapon Fighting* — la maîtrise scelle son dégât (« can be increased
   ONLY by increasing the ability modifier »), et la règle maison y versait le
   bonus de maîtrise. Une exception frontale, dans un domaine qu'Eric vient de
   déclarer identique au SRD. Elle est retirée, et la ligne est posée.

   ⛔ CE GARDE EXISTE PARCE QU'UNE DÉCISION QUI NE VIT QUE DANS UNE CONVERSATION
   N'EN EST PAS UNE. Rien n'empêchait, hier ou demain, une couche maison de
   patcher un style de combat — et personne ne l'aurait vu : un `patch` réussi
   est silencieux par construction, c'est tout son intérêt.

   ⭐ ET IL EST ÉCRIT SUR UN FAIT DE LA SOURCE, PAS SUR UNE LISTE DE NOMS. Le
   SRD classe lui-même ses dons (`data.category`), et `fighting-style` est l'une
   de ses valeurs — les quatre d'aujourd'hui sont Archery, Defense, Great Weapon
   Fighting, Two-Weapon Fighting. Un cinquième arrivé par une mise à jour du SRD
   serait donc protégé le jour même, sans que personne y pense. Une liste de
   quatre noms écrite ici aurait protégé quatre noms, et rien d'autre.

   ⚠️ CE QUE CE GARDE NE DIT PAS : que Fate's Hand ne peut rien changer. Il dit
   que ces trois domaines-là — styles de combat, maîtrises, armes — sont
   verbatim. `skilled`, `magic-initiate` et `auspicious` restent patchés ou
   ajoutés, et c'est très bien : ce sont des dons d'ORIGINE, pas de combat. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "layers", f), "utf8"));

const SRD = lire("srd-5.2.1-en.layer.json");

/** Les couches Fate's Hand de la pile réelle — celles que la page monte. */
const COUCHES_FH = [
  "fh-species-en.layer.json", "fh-skills-en.layer.json", "fh-arcana-en.layer.json",
  "fh-feats-en.layer.json", "fh-fiche-en.layer.json", "fh-lore-en.layer.json"
];

/** Les dons que le SRD classe lui-même comme styles de combat. */
const STYLES_DE_COMBAT = Object.entries(SRD.records.feat)
  .filter(([, record]) => record.data && record.data.category === "fighting-style")
  .map(([id]) => id);

test("témoin — le SRD classe bien ses styles de combat, sinon ce garde ne garde rien", () => {
  /* ⚔️ SANS CE TÉMOIN, un jour où `category` disparaîtrait de la couche, la
     liste ci-dessus serait VIDE et les trois tests suivants passeraient sur
     zéro don. Un garde qui protège un ensemble vide est vert et inutile. */
  assert.ok(STYLES_DE_COMBAT.length >= 4,
    `le SRD devrait déclarer au moins quatre styles de combat, il en déclare ${STYLES_DE_COMBAT.length}`);
  const noms = STYLES_DE_COMBAT.map((id) => SRD.records.feat[id].name).sort();
  assert.deepEqual(noms, ["Archery", "Defense", "Great Weapon Fighting", "Two-Weapon Fighting"]);
});

test("🔴 AUCUNE couche FH ne touche un style de combat — ni patch, ni disable, ni add", () => {
  const fautes = [];
  for (const fichier of COUCHES_FH) {
    const feats = (lire(fichier).records || {}).feat || {};
    for (const id of Object.keys(feats)) {
      if (STYLES_DE_COMBAT.includes(id)) fautes.push(`${fichier} → ${id} (${feats[id].op || "add"})`);
    }
  }
  assert.deepEqual(fautes, [],
    `un style de combat est modifié par une couche maison : ${fautes.join(", ")}. ` +
    "Eric, 2026-08-20 : « on reste verbatim SRD sur les feats de combat ».");
});

test("🔴 AUCUNE couche FH ne touche une maîtrise, une propriété d'arme, ou une arme", () => {
  /* Les trois genres du domaine « armes ». `weapon-mastery` et `weapon-property`
     sont arrivés le 2026-08-20 (lot 19 de fh-srd) ; `weapon` était là depuis le
     début et n'a jamais été patché — ce garde le FIGE plutôt que de le
     constater une fois de plus. */
  const GENRES_VERBATIM = ["weapon", "weapon-mastery", "weapon-property"];
  const fautes = [];
  for (const fichier of COUCHES_FH) {
    const records = lire(fichier).records || {};
    for (const genre of GENRES_VERBATIM) {
      for (const id of Object.keys(records[genre] || {})) {
        fautes.push(`${fichier} → ${genre}/${id}`);
      }
    }
  }
  assert.deepEqual(fautes, [],
    `une couche maison touche au domaine des armes : ${fautes.join(", ")}. ` +
    "Eric, 2026-08-20 : « pour les armes, je n'ai rien fait de différent du SRD ».");
});

test("⚔️ ATTAQUE — une couche qui patcherait Great Weapon Fighting est VUE, et nommée", () => {
  /* Le garde ne vaut que s'il mord. On fabrique la faute exacte qu'Eric vient
     de retirer : la règle maison du Graze, versée dans le style de combat. */
  const couchePiegee = {
    records: {
      feat: {
        "srd:feat:en:great-weapon-fighting": {
          op: "patch",
          changes: { "data.description": "…and Graze adds your Proficiency Bonus." }
        }
      }
    }
  };
  const touches = Object.keys(couchePiegee.records.feat)
    .filter((id) => STYLES_DE_COMBAT.includes(id));
  assert.deepEqual(touches, ["srd:feat:en:great-weapon-fighting"],
    "l'attaque doit être vue par le MÊME test que celui qui protège les vraies couches");
});

test("⚠️ BORNE — les dons d'ORIGINE restent patchables, et ils le sont", () => {
  /* Ce garde interdit trois domaines, pas la couche entière. Sans cette borne,
     on le lirait comme « FH ne touche plus aux dons », ce qui est faux et
     casserait Magic Initiate et Skilled — deux chapitres entiers du builder. */
  const feats = lire("fh-feats-en.layer.json").records.feat;
  const patches = Object.keys(feats);
  assert.ok(patches.length > 0, "témoin : la couche des dons FH n'est pas vide");
  for (const id of patches) {
    const srd = SRD.records.feat[id];
    /* `auspicious` est un ajout maison : il n'existe pas au SRD, donc pas de
       catégorie à lire — et un don qui n'existe pas au SRD ne peut pas être un
       style de combat du SRD. */
    if (!srd) continue;
    assert.notEqual(srd.data.category, "fighting-style", `${id} ne doit pas être un style de combat`);
  }
});

/* ══ LE POPUP NE PREND PAS LE POINTEUR — 2026-08-20 ═══════════════════════
   🔴 DÉFAUT MESURÉ DANS LA PAGE, ET ANTÉRIEUR À L'ÉCRAN QUI L'A RÉVÉLÉ. Le
   popup d'info est ancré `bottom: 0` — exactement là où vivent les RÉCEPTEURS
   du glisser-déposer. Mesuré à 360 sur l'écran des maîtrises :
   `document.elementFromPoint` au centre des deux récepteurs renvoyait
   `popup-titre`. Or c'est ce même `elementFromPoint` qui résout le dépôt
   (`creneauSous`, glisser.mjs) : un joueur qui tape une arme pour lire sa
   maîtrise, puis la glisse vers un créneau, DÉPOSAIT SUR LE POPUP.

   ⚠️ ET LE DÉFAUT EXISTAIT DÉJÀ POUR LES SORTS — même organe, même ancrage,
   même geste (« tap pour info, drag pour choisir »). Il n'avait jamais été
   mesuré parce que le glisser SANS info marche, et c'est celui qu'on essaie.

   ⛔ CE GARDE EST UN GARDE D'OCTETS, faute de mieux : aucun test ne monte la
   coquille, et la géométrie ne se mesure qu'au navigateur. Il tient donc la
   DÉCLARATION, et le commentaire de la feuille tient la raison. */
test("🔴 `.popup` déclare `pointer-events: none` — sinon il vole les dépôts du glisser", () => {
  const css = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8");
  const bloc = /\.popup \{[\s\S]*?\n\}/.exec(css);
  assert.ok(bloc, "témoin : le bloc `.popup` existe toujours dans la feuille");
  assert.match(bloc[0], /pointer-events:\s*none/,
    "le popup est un `role=\"status\"` SANS aucun contrôle : un objet qui ne s'actionne pas " +
    "n'a rien à faire dans la chaîne du pointeur, et il est posé sur les récepteurs.");
});
