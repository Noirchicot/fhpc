/* ══ AUCUNE COUCHE FH NE VISE UN ÉLÉMENT PAR UN MOT — LE CHEMIN EST FERMÉ ══
 *
 *  Lot 146, 2026-09-03.
 *
 *  ⭐ LA DÉCISION QUI FONDE CE GARDE. Eric, le 2026-09-03 : « FH en français un
 *  jour OUI ! ». Cette réponse ferme trois routes sur quatre et n'en laisse
 *  qu'une — la ROUTE D : rendre à la couche `srfh+` les règles Fate's Hand qui
 *  sont aujourd'hui écrites DANS des records `srd:`. Ce n'est pas une migration
 *  de données, c'est une remise d'aplomb d'architecture.
 *  📌 Le relevé complet, les quatre routes chiffrées et la décision datée :
 *  `fh-srd/docs/TRAIT-KEYS.md`. Le contrat des trois étages : `ui/builder/SOCLE.md`.
 *
 *  L'INVARIANT QUE CE FICHIER TIENT — et c'est l'invariant, ⛔ jamais la liste :
 *
 *      Un patch de couche vise un CHAMP DE SCHÉMA, jamais un ÉLÉMENT DE
 *      CONTENU désigné par un mot.
 *
 *  ⭐ POURQUOI ÇA COMPTE, en une phrase mesurée : une couche qui respecte le
 *  contrat vise une ADRESSE ; une couche qui l'enfreint finit par viser un MOT
 *  — et un mot a une langue. C'est très exactement ce qui rend aujourd'hui un
 *  personnage FH impossible à construire en français.
 *
 *  ⚠️ LA DETTE EXISTANTE EST CONNUE, FERMÉE ET PLAFONNÉE À DIX. Elle n'est pas
 *  tolérée par oubli : elle est datée, chiffrée, et son remboursement est
 *  décidé. Ce que ce garde interdit, c'est le ONZIÈME — parce que la courbe
 *  mesurée dit qu'il arriverait tout seul : 3 chemins le 08/08, 6 le 20/08,
 *  10 le 27/08, dont +4 en un seul lot que personne n'avait cadré comme
 *  creusant quoi que ce soit.
 *
 *  ⛔ CE GARDE NE SE « RÉPARE » PAS EN MONTANT LE PLAFOND. S'il rougit parce
 *  qu'un onzième chemin est né, la réparation est de ne pas l'écrire — le
 *  besoin qu'il servait appartient à `srfh+`. Le plafond ne descend que le jour
 *  où la route D est faite, et il descend alors à zéro.
 *
 *  ⭐ À LIRE AVEC SON JUMEAU : `tests/layers-traits-fr.test.mjs`. Les deux
 *  bougeront le même jour et en sens contraire. Celui-ci descendra vers zéro ;
 *  celui-là ROUGIRA — son deuxième cas affirme que la pile française refuse de
 *  se monter, et ce rouge sera le SIGNAL QUE LA CAPACITÉ EST ARRIVÉE, pas une
 *  régression. C'est écrit en tête de ce fichier-là depuis le lot 108, pour ce
 *  jour précisément.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { REPO_ROOT } from "../src/tools/gen-fh-species-layer.mjs";

const DOSSIER = join(REPO_ROOT, "layers");
const PLAFOND = 10;

const lis = (nom) => JSON.parse(readFileSync(join(DOSSIER, nom), "utf8"));
const couches = () => readdirSync(DOSSIER).filter((n) => n.endsWith(".layer.json"));

/** Le record que ce patch vise, tel que la couche de base le porte. */
function recordVise(adresse) {
  for (const nom of couches()) {
    const doc = lis(nom);
    const bag = doc.records || doc.patches || {};
    for (const genre of Object.keys(bag)) {
      const e = bag[genre][adresse];
      if (e && e.data && !(e.changes || e.remove)) return e;   // un record, pas un patch
    }
  }
  return null;
}

/* ⛔ ON NE DEVINE PAS SUR LA FORME DU CHEMIN. `data[skill_choice][count]` a deux
   crochets et ne désigne aucun mot : `skill_choice` est un OBJET de schéma. La
   seule question qui tranche est ce que le crochet TRAVERSE :

     · un crochet sur un OBJET   → il nomme un CHAMP  → même nom dans les deux langues
     · un crochet sur un TABLEAU → il nomme un ÉLÉMENT par son identité → un MOT

   On marche donc le chemin DANS le vrai record, et on regarde. */
function viseUnMot(chemin, record) {
  const segments = chemin.match(/[^.[\]]+/g) || [];
  const crochets = new Set();
  for (const m of chemin.matchAll(/\[([^\]]+)\]/g)) crochets.add(m[1]);

  let ici = record;
  for (const seg of segments) {
    if (ici === null || typeof ici !== "object") return false;
    if (Array.isArray(ici)) {
      if (crochets.has(seg)) return true;          // ⭐ identité dans une collection
      return false;
    }
    ici = ici[seg];
  }
  return false;
}

/** Tous les chemins de patch qui désignent un élément par son mot. */
export function cheminsParLeMot() {
  const trouves = [];
  for (const nom of couches()) {
    const doc = lis(nom);
    const bag = doc.records || doc.patches || {};
    for (const genre of Object.keys(bag)) {
      for (const [adresse, entree] of Object.entries(bag[genre])) {
        const chemins = [...Object.keys(entree.changes || {}), ...(entree.remove || [])];
        if (!chemins.length) continue;
        const cible = recordVise(adresse);
        if (!cible) continue;
        for (const p of chemins) if (viseUnMot(p, cible)) trouves.push(`${doc.id}  ${adresse}  ${p}`);
      }
    }
  }
  return trouves.sort();
}

test("LE PLAFOND — dix chemins par le mot, connus et nommés, et PAS ONZE", () => {
  const trouves = cheminsParLeMot();

  /* ⛔ On plafonne par un COMPTE EXACT et par la LISTE, pas par « ça n'augmente
     pas » : un compte qui ne dit que le nombre reste vert quand quelqu'un en
     retire un et en ajoute un autre. La liste dit LESQUELS. */
  assert.deepEqual(trouves, [
    "fh-species-en  srd:species:en:dragonborn  data.traits[breath-weapon].text",
    "fh-species-en  srd:species:en:dwarf  data.traits[stonecunning].text",
    "fh-species-en  srd:species:en:elf  data.traits[keen-senses].text",
    "fh-species-en  srd:species:en:gnome  data.traits[gnomish-cunning].name",
    "fh-species-en  srd:species:en:gnome  data.traits[gnomish-lineage].name",
    "fh-species-en  srd:species:en:gnome  data.traits[gnomish-lineage].text",
    "fh-species-en  srd:species:en:goliath  data.traits[giant-ancestry].text",
    "fh-species-en  srd:species:en:human  data.traits[resourceful]",
    "fh-species-en  srd:species:en:human  data.traits[skillful].text",
    "fh-species-en  srd:species:en:orc  data.traits[adrenaline-rush].text"
  ],
    "⛔ CE CHEMIN EST FERMÉ (Eric, 2026-09-03 : « FH en français un jour oui ! »).\n" +
    "   Un patch vise un CHAMP DE SCHÉMA, jamais un élément de contenu désigné par un MOT :\n" +
    "   un mot a une langue, et c'est ce qui rend un personnage FH impossible à construire\n" +
    "   en français aujourd'hui.\n" +
    "   ⛔ Si tu viens d'ajouter un chemin, NE MONTE PAS LE PLAFOND — le besoin que tu sers\n" +
    "   appartient à la couche `srfh+` (route D). Voir `fh-srd/docs/TRAIT-KEYS.md` §5 et\n" +
    "   le contrat des trois étages dans `ui/builder/SOCLE.md`.\n" +
    "   ⭐ Si tu viens de FAIRE la route D, cette liste doit se vider — et son jumeau\n" +
    "   `tests/layers-traits-fr.test.mjs` doit rougir : ce rouge-là est le signal que la\n" +
    "   capacité est arrivée, pas une régression.");

  assert.equal(trouves.length, PLAFOND, `${trouves.length} chemins par le mot — le plafond est ${PLAFOND}`);
});

test("UNE SEULE COUCHE porte la dette — les autres sont propres, et doivent le rester", () => {
  const parCouche = new Map();
  for (const t of cheminsParLeMot()) {
    const id = t.split("  ")[0];
    parCouche.set(id, (parCouche.get(id) || 0) + 1);
  }
  assert.deepEqual([...parCouche.entries()], [["fh-species-en", 10]],
    "⛔ une SECONDE couche vient de viser un élément par son mot — c'est la dette qui se répand, " +
    "et c'est pire que sa taille : `srfh-shelving-en`, `fh-fiche-en`, `fh-lore-en`, `fh-skills-en`, " +
    "`fh-spells-en` et `fh-feats-en` n'adressent que des champs de schéma. Elles sont insensibles " +
    "à la langue, et c'est ce qui doit rester vrai.");
});

test("⭐ LE GARDE MORD — éprouvé sur un ONZIÈME chemin fabriqué", () => {
  /* ⛔ Un garde qui n'a jamais rougi est une intention. On lui présente donc un
     record réel et un chemin qui désigne un élément par son mot, et on vérifie
     qu'il le voit. On vérifie AUSSI qu'il laisse passer un champ de schéma
     imbriqué — `data[skill_choice][count]` a deux crochets et ne nomme aucun
     mot : sans cette seconde moitié, le garde crierait au loup. */
  const en = lis("srd-5.2.1-en.layer.json").records.species["srd:species:en:tiefling"];

  assert.equal(viseUnMot("data.traits[darkvision].text", en), true,
    "un onzième chemin, sur une espèce jusqu'ici épargnée, DOIT être vu");
  assert.equal(viseUnMot("data.traits[fiendish-legacy]", en), true,
    "un retrait par le mot aussi — `remove` et `changes` sont la même grammaire");

  assert.equal(viseUnMot("data[granted_skill_choice]", en), false,
    "⛔ mais un CHAMP de `data` n'est pas un mot de contenu");
  assert.equal(viseUnMot("data[skill_choice][count]", { data: { skill_choice: { count: 2 } } }), false,
    "⛔ ni un champ de schéma imbriqué, même avec deux crochets — c'est `fh-skills-en` qui l'écrit");
  assert.equal(viseUnMot("data.size", en), false, "⛔ ni un champ simple");
});
