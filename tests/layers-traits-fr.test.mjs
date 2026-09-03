/* ══ LES CLEFS DE TRAITS NE SONT PAS DES ADRESSES — ET LE PLI LE DIT ══════
 *
 *  Lot 108, 2026-08-26. La transition à froid (§0.13) a migré les ADRESSES
 *  vers l'anglais ; les clefs qui vivent DANS `data.traits[]` sont restées
 *  celles du livre de chaque langue. Mesure : 9 espèces, 9 jeux de clefs
 *  divergents, 0 apparié — relevé complet dans `fh-srd/docs/TRAIT-KEYS.md`.
 *
 *  CE QUE CE FICHIER ÉPINGLE, ET POURQUOI IL EXISTE. La couche FH d'espèces
 *  porte 6 chemins qui visent une clef de trait. Sous un rendu français, ces
 *  chemins ne visent rien — et le pli REFUSE, au montage, en nommant la
 *  couche, l'espèce, le chemin et la raison. C'est le bon comportement, et
 *  c'est fragile : il suffirait qu'un futur lot rende les chemins tolérants
 *  (« si le chemin n'existe pas, on passe ») pour que ce refus devienne un
 *  silence — et un silence ici produirait des fiches FH amputées sans que
 *  personne l'apprenne.
 *
 *  ⛔ CE TEST NE DEMANDAIT PAS QUE LA PILE FRANÇAISE MARCHE. Il demandait
 *  qu'elle ÉCHOUE BRUYAMMENT tant qu'elle ne marchait pas — et il annonçait
 *  depuis le lot 108 que le jour où les clefs seraient appariées, il rougirait,
 *  et que ce rouge serait le SIGNAL que la capacité est arrivée.
 *
 *  ══ ✅ CE JOUR EST ARRIVÉ — 2026-09-04 ═══════════════════════════════════
 *
 *  Eric a tranché le 03/09 (« FH en français un jour OUI ! », puis
 *  « maintenant »), puis ratifié la forme le 04/09 (« oui, id hors langue =
 *  clé »). Le siège Versatilité a posé dans `fh-srd` un `slug` NEUTRE,
 *  identique dans les deux langues, sur les 33 traits de chaque côté — dérivé
 *  de l'extraction, jamais tenu à la main. La grammaire de chemins de ce dépôt
 *  appariait déjà un élément sur `id` OU `slug` (`src/layers/paths.mjs:158`) :
 *  la clef est donc lue telle quelle, sans une ligne de code neuve.
 *
 *  ⭐ CE FICHIER EST DONC RÉÉCRIT À SA NOUVELLE VÉRITÉ, PAS DÉSARMÉ. Le second
 *  cas affirmait un REFUS ; il affirme maintenant que la pile MONTE et que le
 *  retrait Fate's Hand traverse la langue. C'est le rouge annoncé, encaissé.
 *
 *  ⛔ ET LA GARANTIE QU'IL PORTAIT N'EST PAS RELÂCHÉE POUR AUTANT. « Un chemin
 *  dans le vide est un échec, pas un silence » (§L7.2) reste vrai et reste
 *  éprouvé — sur une PRIVATION DÉLIBÉRÉE, plus sur une pénurie de circonstance
 *  (troisième cas ci-dessous). On ne relâche pas une garantie parce que la
 *  source s'est améliorée : on la reprouve autrement.
 *
 *  ⚠️ CE QUE CE ROUGE NE DIT PAS. La pile devient MONTABLE, pas FRANÇAISE : les
 *  règles Fate's Hand ne sont écrites qu'en anglais, donc un personnage
 *  français porte ses traits SRD en français et les textes FH en anglais. Et
 *  la violation du contrat est intacte — les dix chemins écrivent toujours des
 *  règles FH dans des records `srd:`. ⛔ Le plafond des dix ne bouge pas.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createLayers } from "../src/layers/index.mjs";
import { REPO_ROOT } from "../src/tools/gen-fh-species-layer.mjs";

const octets = (nom) => readFileSync(join(REPO_ROOT, "layers", nom));
const SRD_EN = "srd-5.2.1-en.layer.json";
const SRD_FR = "srd-5.2.1-fr.layer.json";
const FH_ESPECES = "fh-species-en.layer.json";

/** Une pile neuve par scénario. ⛔ PAS `registerLayers` : le registre du noyau
 *  est un singleton et jette au second enregistrement — « bonne loi pour une
 *  application, ingérable pour une suite » (`src/layers/index.mjs`). */
function pile(...noms) {
  const couches = createLayers({ bus: { emit() {} } });
  for (const nom of noms) couches.verbs.register({ bytes: octets(nom), origin: nom });
  return couches.verbs;
}

test("la pile LIVRÉE monte, et la couche FH mord bien sur le SRD anglais", () => {
  const verbes = pile(SRD_EN, FH_ESPECES);
  const humain = verbes.query({ kind: "species", id: "srd:species:en:human" });
  assert.equal(humain.provenance.from, "srd-5.2.1-en");
  assert.deepEqual(humain.record.data.traits.map((t) => t.id), ["skillful", "versatile"],
    "`resourceful` a été RETIRÉ par la couche FH — le retrait a trouvé sa cible");
  assert.equal(Object.hasOwn(humain.record.data, "granted_skill_choice"), false,
    "et le second chemin du même retrait a mordu lui aussi");
});

test("✅ sous un rendu FRANÇAIS, la couche FH d'espèces SE MONTE — la clef hors langue a ouvert la route", () => {
  /* ⚠️ RÉÉCRIT LE 2026-09-04, ET C'EST LE ROUGE ANNONCÉ DEPUIS LE LOT 108.
     Ce cas affirmait un REFUS au montage, et c'était le bon comportement tant
     qu'aucune clef n'appariait les deux langues. `fh-srd` a posé un `slug`
     neutre sur les 33 traits de chaque côté : les dix chemins de la couche FH
     trouvent désormais leur cible en français comme en anglais.
     ⛔ Le garde n'est pas désarmé, il est mis à sa nouvelle vérité — et il
     éprouve maintenant la chose qui compte vraiment : que la règle Fate's Hand
     TRAVERSE la langue au lieu de disparaître en silence. */
  const verbes = pile(SRD_FR, FH_ESPECES);
  const humain = verbes.query({ kind: "species", id: "srd:species:en:human" });

  assert.equal(humain.provenance.from, "srd-5.2.1-fr", "c'est bien le rendu FRANÇAIS qui est servi");
  assert.deepEqual(humain.record.data.traits.map((t) => t.id), ["competent", "polyvalent"],
    "⭐ `ingenieux` — le Resourceful français — a été RETIRÉ par la couche FH. Le retrait a trouvé sa " +
    "cible À TRAVERS LA LANGUE : c'est très exactement la capacité qui manquait.");
  assert.equal(Object.hasOwn(humain.record.data, "granted_skill_choice"), false,
    "et le second chemin du même retrait a mordu lui aussi, comme du côté anglais");

  /* ⭐ ET C'EST BIEN LE `slug` QUI PORTE, PAS L'`id` — les ids divergent
     toujours, et c'est voulu : la clef AJOUTE une poignée, elle n'en déplace
     aucune. Sans ce contrôle, le test resterait vert le jour où quelqu'un
     migrerait les ids et croirait que c'est la même chose. */
  const ingenieux = verbes.query({ kind: "species", id: "srd:species:en:elf" })
    .record.data.traits.find((t) => t.id === "sens-aiguises");
  assert.equal(ingenieux.slug, "keen-senses",
    "le trait français garde son id français et porte le slug anglais — c'est la poignée hors langue");
});

test("⛔ ET LA GARANTIE DU REFUS N'EST PAS RELÂCHÉE — un chemin dans le vide échoue toujours", () => {
  /* Le cas au-dessus prouvait, jusqu'au 04/09, que « un chemin dans le vide est
     un échec, pas un silence » (§L7.2). Il ne le prouve plus : les chemins ne
     sont plus dans le vide. ⛔ On ne relâche pas une garantie parce que la
     source s'est améliorée — on la reprouve sur une PRIVATION DÉLIBÉRÉE.
     C'est la leçon du lot 13 : une preuve qui s'appuie sur une pénurie de
     circonstance s'évapore EN RESTANT VERTE le jour où la pénurie cesse. */
  const couche = {
    schema: "fh-layer/1",
    id: "scenario-chemin-dans-le-vide",
    version: "1.0.0",
    name: "Couche de scénario — un chemin qui ne vise rien",
    lang: "en",
    flags: [],
    attribution: { license: "all-rights-reserved", text: "scénario de test" },
    records: {
      species: {
        "srd:species:en:human": {
          op: "patch",
          changes: { "data.traits[trait-qui-n-existe-nulle-part].text": "…" },
          note: "scénario — un chemin qui ne vise rien"
        }
      }
    }
  };
  const couches = createLayers({ bus: { emit() {} } });
  couches.verbs.register({ bytes: octets(SRD_EN), origin: SRD_EN });

  assert.throws(
    () => couches.verbs.register({
      bytes: Buffer.from(JSON.stringify(couche, null, 2) + "\n", "utf8"),
      origin: "couche du scénario"
    }),
    (erreur) => {
      const dit = String(erreur.message);
      assert.match(dit, /scenario-chemin-dans-le-vide/, "le refus nomme LA COUCHE fautive");
      assert.match(dit, /srd:species:en:human/, "et L'ESPÈCE visée");
      assert.match(dit, /trait-qui-n-existe-nulle-part/, "et LE CHEMIN qui ne vise rien");
      assert.match(dit, /ne devine pas la forme/, "et LA RAISON, en clair");
      return true;
    },
    "un chemin dans le vide est un échec, pas un silence (§L7.2)"
  );
});

test("LE COÛT, CHIFFRÉ : 10 chemins sur 7 espèces — pas 9 espèces (élargi le 27/08 par la conversion PROF)", () => {
  /* Le chiffre « 9 espèces sur 9 divergentes » mesure la DIVERGENCE. Ce qui
     coûte, c'est ce qui s'APPUIE dessus. Les six autres espèces divergent
     aussi et ne coûtent rien : aucune couche ne vise leurs clefs. */
  const fh = JSON.parse(readFileSync(join(REPO_ROOT, "layers", FH_ESPECES), "utf8"));
  const chemins = [];
  for (const [adresse, entree] of Object.entries(fh.records.species)) {
    for (const p of [...Object.keys(entree.changes || {}), ...(entree.remove || [])]) {
      if (p.startsWith("data.traits[")) chemins.push(`${adresse} ${p}`);
    }
  }
  /* 2026-08-27 — QUATRE CHEMINS DE PLUS, et la dette est assumée : la
     conversion « Proficiency Bonus » → échelle écrite (dictée d'Eric) vise
     les textes de breath-weapon, stonecunning, giant-ancestry et
     adrenaline-rush. Le relevé de fh-srd/docs/TRAIT-KEYS.md est à rafraîchir
     en conséquence. */
  assert.deepEqual(chemins.sort(), [
    "srd:species:en:dragonborn data.traits[breath-weapon].text",
    "srd:species:en:dwarf data.traits[stonecunning].text",
    "srd:species:en:elf data.traits[keen-senses].text",
    "srd:species:en:gnome data.traits[gnomish-cunning].name",
    "srd:species:en:gnome data.traits[gnomish-lineage].name",
    "srd:species:en:gnome data.traits[gnomish-lineage].text",
    "srd:species:en:goliath data.traits[giant-ancestry].text",
    "srd:species:en:human data.traits[resourceful]",
    "srd:species:en:human data.traits[skillful].text",
    "srd:species:en:orc data.traits[adrenaline-rush].text"
  ], "si cette liste grandit, la dette grandit avec elle — et le relevé de `fh-srd/docs/TRAIT-KEYS.md` est périmé");

  /* ⚠️ 2026-09-03 — LE TITRE DISAIT « 6 espèces », LA LISTE EN PORTE 7. La liste
     était juste, le libellé mentait : il avait été écrit à la main le 27/08 et
     n'a pas suivi les quatre chemins que ce même lot ajoutait. Une règle qui
     décrit un état inexact est pire qu'une absence — elle répond de travers à
     qui la lit.
     ⛔ La réparation n'est donc pas de corriger le chiffre : c'est de le
     DÉRIVER, pour qu'aucun titre ne puisse plus mentir seul. */
  const especes = new Set(chemins.map((c) => c.split(" ")[0]));
  assert.equal(especes.size, 7, "SEPT adresses distinctes — le compte du titre se vérifie ici, il ne se recopie pas");
  assert.deepEqual([...especes].map((a) => a.replace("srd:species:en:", "")).sort(),
    ["dragonborn", "dwarf", "elf", "gnome", "goliath", "human", "orc"]);
});

test("⛔ ET LE PIÈGE : `brave` coïncide chez le halfling, et ça ne prouve RIEN", () => {
  /* Une clef qui coïncide n'est pas une clef appariée. Le halfling est le seul
     homographe sur les neuf espèces : une méthode qui rapprocherait les clefs
     par leur mot marcherait sur 1 espèce sur 9 et aurait l'air de tenir.
     C'est exactement ce que §0.13 interdit. Ce test existe pour que le piège
     soit ÉCRIT quelque part, pas découvert. */
  const lis = (nom) => JSON.parse(readFileSync(join(REPO_ROOT, "layers", nom), "utf8")).records.species;
  const en = lis(SRD_EN), fr = lis(SRD_FR);
  const clefs = (r) => new Set((((r && r.data) || {}).traits || []).map((t) => t.id));

  const communes = [];
  for (const adresse of Object.keys(en)) {
    for (const clef of clefs(en[adresse])) if (clefs(fr[adresse]).has(clef)) communes.push(`${adresse}:${clef}`);
  }
  assert.deepEqual(communes, ["srd:species:en:halfling:brave"],
    "UNE seule clef coïncide sur les neuf espèces — et c'est une coïncidence de mot, pas un appariement");

  const total = Object.keys(en).reduce((n, a) => n + clefs(en[a]).size, 0);
  assert.ok(communes.length / total < 0.05,
    `${communes.length} clefs communes sur ${total} : au-delà, ce serait le signe d'un appariement par libellé`);
});
