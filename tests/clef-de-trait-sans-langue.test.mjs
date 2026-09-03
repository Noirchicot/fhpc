/* ══ LE PRÉALABLE DE LA ROUTE D — UN TRAIT N'A AUCUNE IDENTITÉ HORS LANGUE ══
 *
 *  Lot 148, 2026-09-04. ⛔ Ce fichier ne répare rien : il TIENT une mesure qui
 *  décide si le lot 148 est faisable, et il rougira le jour où la réponse
 *  changera.
 *
 *  ── POURQUOI IL EXISTE ────────────────────────────────────────────────
 *
 *  La route D dit : « les dix chemins par le mot deviennent des records
 *  `srfh+:species:*` qui étendent ». Neuf des dix RÉÉCRIVENT un trait SRD
 *  précis (son texte ou son nom), le dixième en RETIRE un. Pour qu'une règle
 *  Fate's Hand dise *« je remplace CE trait-là »* sans nommer un mot, il faut
 *  que le trait SRD ait une **identité qui survive au changement de langue**.
 *
 *  ⭐ ET LE PLAN NE L'AVAIT PAS MESURÉE — il l'avait supposée. `TRAIT-KEYS.md`
 *  §1 compte les clefs côte à côte et conclut « 9 jeux divergents », puis §5
 *  décrit un consommateur qui suivrait `data.extends`… sans jamais dire par
 *  quelle poignée ce consommateur appariera un trait FH à son homologue SRD.
 *  ⚠️ C'est la famille « une absence n'est jamais une réponse » : le document
 *  ne dit pas que la clef manque, il n'en parle pas.
 *
 *  ── CE QUI EST MESURÉ ICI, ET RIEN D'AUTRE ────────────────────────────
 *
 *      33 traits en anglais · 33 en français · UNE seule clef commune.
 *
 *  Et cette unique clef est un **homographe** — `brave`, chez le Halfelin,
 *  s'écrit pareil dans les deux langues. ⛔ Une clef qui coïncide n'est pas une
 *  clef appariée : un rapprochement qui s'appuierait dessus marcherait sur une
 *  espèce sur neuf et donnerait l'illusion que la méthode tient.
 *
 *  ── ✅ RATIFIÉ PAR ERIC LE 2026-09-04 ─────────────────────────────────
 *
 *      « oui, id hors langue = clé. il peut s'y mettre. »
 *
 *  La poignée manquante est donc COMMANDÉE, et le mandat est parti au siège
 *  Versatilité (dépôt `fh-srd`, ⛔ hors mandat de l'architecte).
 *
 *  ⭐ ET LE CONSOMMATEUR EST DÉJÀ PRÊT — mesuré, pas supposé.
 *  `src/layers/paths.mjs:158` apparie un élément de tableau sur `item.id` **OU**
 *  `item.slug`. Une clef neutre posée en `slug` est donc lue par la grammaire de
 *  chemins **sans une ligne de code à écrire ici**.
 *
 *  Éprouvé le 04/09 : neuf `slug` hors langue posés à la main sur la couche
 *  française, puis la pile remontée —
 *
 *      AVANT  `srd-fr + fh-species-en`  ⛔ refus au montage
 *      APRÈS  `srd-fr + fh-species-en`  ✅ monte · l'Humain rend
 *             `competent, polyvalent` — `ingenieux` a DISPARU, donc le RETRAIT
 *             Fate's Hand de `Resourceful` a traversé la langue.
 *
 *  ⛔ L'appariement de cette expérience était fait À LA MAIN et a été restauré
 *  (`git diff` nul). Une table écrite à la main divergerait au premier
 *  rafraîchissement de la source, et personne ne le verrait : la vraie clef doit
 *  être DÉRIVÉE de l'extraction. C'est très exactement ce que le mandat demande.
 *
 *  ⚠️ ET ÇA NE SOLDE PAS TOUT. Les dix chemins sont fautifs pour DEUX raisons :
 *  (a) ils visent un mot, donc une langue — c'est ce que la clef règle ;
 *  (b) ils écrivent des règles FH dans des records `srd:` — ⛔ intact. La route D
 *  reste à faire ; elle cesse d'être ce qui BLOQUE une capacité pour devenir une
 *  remise d'aplomb d'architecture. Le plafond des dix ne bouge pas d'ici là.
 *
 *  ⭐ CE GARDE ROUGIRA SUR UNE BONNE NOUVELLE, et c'est voulu — même patron que
 *  `layers-traits-fr.test.mjs`. Le jour où `fh-srd` donnera aux traits une
 *  identité hors langue (une clef partagée, un genre `trait`, ou une arête
 *  `translation_of` — les trois sont absents aujourd'hui, mesurés), ce fichier
 *  rougira. ⛔ Ce rouge N'EST PAS une régression : c'est le signal que le
 *  préalable du lot 148 est levé et que la route D peut se faire.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { REPO_ROOT } from "../src/tools/gen-fh-species-layer.mjs";

const lis = (nom) => JSON.parse(readFileSync(join(REPO_ROOT, "layers", nom), "utf8"));

/** Les clefs de traits d'un record d'espèce, par adresse, dans une couche. */
function clefsParEspece(nomDeCouche) {
  const especes = lis(nomDeCouche).records.species || {};
  const parAdresse = new Map();
  for (const [adresse, entree] of Object.entries(especes)) {
    const traits = ((entree.data || {}).traits) || [];
    if (!Array.isArray(traits) || !traits.length) continue;
    parAdresse.set(adresse, traits.map((trait) => trait && trait.id).filter(Boolean));
  }
  return parAdresse;
}

test("🔴 LE PRÉALABLE DE LA ROUTE D — une clef de trait sur 33, et c'est un homographe", () => {
  const en = clefsParEspece("srd-5.2.1-en.layer.json");
  const fr = clefsParEspece("srd-5.2.1-fr.layer.json");

  /* ⭐ LE TÉMOIN EST NOMMÉ AVANT LA MESURE : on ne compare que les espèces que
     les DEUX couches portent. Comparer un jeu à un vide rendrait « zéro clef
     commune » pour la mauvaise raison — une mesure juste sur le mauvais point
     de comparaison est une mesure fausse. */
  const communes = [...en.keys()].filter((adresse) => fr.has(adresse)).sort();
  assert.equal(communes.length, 9,
    "neuf espèces portent des traits dans les DEUX langues — si ce compte bouge, la mesure est à refaire");

  let totalEn = 0;
  let totalFr = 0;
  const appariees = [];
  for (const adresse of communes) {
    const ensembleEn = new Set(en.get(adresse));
    const ensembleFr = new Set(fr.get(adresse));
    totalEn += ensembleEn.size;
    totalFr += ensembleFr.size;
    for (const clef of ensembleEn) if (ensembleFr.has(clef)) appariees.push(`${adresse}  ${clef}`);
  }

  assert.equal(totalEn, 33, "33 traits en anglais");
  assert.equal(totalFr, 33, "33 traits en français");

  /* ⛔ PAR LA LISTE, PAS PAR LE COMPTE. Un compte reste vert quand une clef
     s'apparie pendant qu'une autre cesse de l'être. La liste dit LAQUELLE. */
  assert.deepEqual(appariees, ["srd:species:en:halfling  brave"],
    "⭐ SI CETTE LISTE S'EST ALLONGÉE, LA BONNE NOUVELLE EST ARRIVÉE : `fh-srd` donne désormais aux\n" +
    "   traits une identité qui survit à la langue, et le PRÉALABLE DU LOT 148 EST LEVÉ — la route D\n" +
    "   peut se faire. ⛔ Ce rouge n'est pas une régression : mets ce garde à sa nouvelle vérité et\n" +
    "   ouvre le lot. Si elle s'est RACCOURCIE, c'est l'homographe qui a bougé, et rien n'a changé\n" +
    "   au fond : `brave` coïncide, il n'apparie pas.");
});

test("⛔ ET L'HOMOGRAPHE NE PROUVE RIEN — deux traits de même clef ne disent pas la même règle", () => {
  /* Le pendant, sans lequel le garde au-dessus ressemblerait à « il en reste
     une, ce n'est pas si grave ». `brave` s'écrit pareil et désigne bien le
     même trait — c'est justement pour ça qu'il est un piège : il donne à une
     méthode fausse l'air de marcher sur l'espèce qu'on regarde en premier. */
  const en = lis("srd-5.2.1-en.layer.json").records.species["srd:species:en:halfling"].data.traits;
  const fr = lis("srd-5.2.1-fr.layer.json").records.species["srd:species:en:halfling"].data.traits;

  const braveEn = en.find((trait) => trait.id === "brave");
  const braveFr = fr.find((trait) => trait.id === "brave");
  assert.ok(braveEn && braveFr, "les deux couches portent bien la clef `brave`");

  /* Les trois AUTRES traits du Halfelin, eux, ne s'apparient pas — et c'est la
     vraie image de la situation, à laquelle `brave` fait exception. */
  const autresEn = en.map((trait) => trait.id).filter((clef) => clef !== "brave").sort();
  const autresFr = fr.map((trait) => trait.id).filter((clef) => clef !== "brave").sort();
  assert.equal(autresEn.length, autresFr.length, "même nombre de traits des deux côtés");
  assert.deepEqual(autresEn.filter((clef) => autresFr.includes(clef)), [],
    "⛔ sur la MÊME espèce, aucune autre clef ne se retrouve : `brave` coïncide, il n'apparie pas");
});

test("⛔ AUCUNE AUTRE POIGNÉE NON PLUS — un trait ne porte que `id`, `name` et `text`", () => {
  /* La question complète n'est pas « les clefs s'apparient-elles ? » mais
     « existe-t-il UNE poignée hors langue ? ». Un champ neutre — un rang, une
     clef canonique, un renvoi — répondrait oui sans que les clefs bougent.
     ⛔ Mesuré : il n'y en a aucun. Sans ce troisième cas, le garde répondrait
     à une question plus étroite que celle qu'il a l'air de poser. */
  const champs = new Set();
  for (const couche of ["srd-5.2.1-en.layer.json", "srd-5.2.1-fr.layer.json"]) {
    for (const entree of Object.values(lis(couche).records.species || {})) {
      for (const trait of ((entree.data || {}).traits) || []) {
        for (const champ of Object.keys(trait)) champs.add(champ);
      }
    }
  }
  assert.deepEqual([...champs].sort(), ["id", "name", "text"],
    "⭐ UN CHAMP NEUTRE EST APPARU sur les traits — s'il survit à la langue, c'est la poignée qui\n" +
    "   manquait au lot 148, et la route D redevient faisable. ⛔ Sinon, c'est un champ localisé de\n" +
    "   plus, et il ne change rien : la question est « survit-il à la langue ? », pas « existe-t-il ? ».");
});
