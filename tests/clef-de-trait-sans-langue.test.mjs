/* ══ LA CLEF DE TRAIT HORS LANGUE — la mesure qui manquait, puis la poignée ══
 *
 *  Lot 148 (04/09, matin) puis lot 151 (04/09, soir). ⛔ Ce fichier ne répare
 *  rien : il tenait la mesure qui décidait si la route D était faisable, et il
 *  tient maintenant la poignée qui l'a rendue possible.
 *
 *  ⚠️ SON TITRE A CHANGÉ LE MÊME JOUR, et c'est le sujet. Il s'appelait
 *  « UN TRAIT N'A AUCUNE IDENTITÉ HORS LANGUE » — vrai le matin, faux le soir.
 *  Un fichier dont le titre survit à sa mesure répond de travers à qui le lit.
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
 *  ══ ✅ ET LA BONNE NOUVELLE EST ARRIVÉE — 2026-09-04, LE MÊME JOUR ═══════
 *
 *  Ce garde annonçait qu'il rougirait le jour où la poignée existerait, et que
 *  ce rouge serait le SIGNAL, pas une régression. Il a rougi le soir même.
 *
 *  Le siège Versatilité a posé dans `fh-srd` un **`slug` neutre**, identique
 *  dans les deux langues, sur les 33 traits de chaque côté — **dérivé de
 *  l'extraction** (quatre signaux joués jusqu'au point fixe : les nombres, les
 *  records déjà appariés, le recouvrement réciproque, le degré de mention entre
 *  frères), ⛔ jamais tenu à la main, et **vérifié par une seconde lecture en
 *  sens inverse** — 33 accords, 0 désaccord.
 *
 *  ⭐ Et il n'a fallu **aucune ligne de code ici** : `src/layers/paths.mjs:158`
 *  appariait déjà un élément de tableau sur `item.id` OU `item.slug`.
 *
 *  Mesuré sur les couches régénérées, les trois piles montent :
 *      `srd-fr + fh-species-en`            ✅ humain → competent, polyvalent
 *      `srd-en + srd-fr + fh-species-en`   ✅  (idem)
 *      `srd-en + fh-species-en`            ✅ humain → skillful, versatile
 *  `ingenieux` — le Resourceful français — est retiré par la couche FH : **le
 *  retrait a traversé la langue.** C'est la capacité qui manquait.
 *
 *  ── CE QUE CE FICHIER TIENT MAINTENANT ────────────────────────────────
 *
 *  ⛔ Il ne s'efface pas parce que sa mesure est devenue bonne — un garde qui
 *  s'efface laisse la régression revenir sans témoin. Il **change d'objet** :
 *
 *    · les deux premiers cas gardent la MESURE D'ORIGINE (1 clef d'`id` sur 33,
 *      un homographe). Elle reste vraie, et c'est elle qui explique POURQUOI le
 *      slug a dû exister : la clef AJOUTE une poignée, elle n'en déplace aucune ;
 *    · le troisième tient la PROPRIÉTÉ qui a coûté le chantier — le slug apparie
 *      les deux langues, trait pour trait, **sans exception**.
 *
 *  ⚠️ ET ÇA NE SOLDE PAS TOUT. Les dix chemins sont fautifs pour DEUX raisons :
 *  (a) ils visent un mot, donc une langue — ✅ la clef règle celle-là ;
 *  (b) ils écrivent des règles FH dans des records `srd:` — ⛔ intact.
 *  La route D reste à faire ; elle cesse d'être ce qui BLOQUE une capacité pour
 *  devenir une remise d'aplomb d'architecture. ⛔ Le plafond des dix ne bouge
 *  pas, et `chemin-par-le-mot-ferme` continue de refuser le onzième.
 *
 *  ⚠️ ET LA PILE DEVIENT MONTABLE, PAS FRANÇAISE : les règles Fate's Hand ne
 *  sont écrites qu'en anglais, donc un personnage français porte ses traits SRD
 *  en français et les textes FH en anglais. Traduire ces textes-là est du
 *  contenu — l'écriture d'Eric, pas un lot.
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

test("✅ LA POIGNÉE EST LÀ — un `slug` sur chaque trait, et il APPARIE 33 sur 33", () => {
  /* ⚠️ RÉÉCRIT LE 2026-09-04 — C'EST LE ROUGE ANNONCÉ, ENCAISSÉ. Ce cas
     affirmait qu'un trait ne portait que `id`, `name` et `text`. `fh-srd` a
     posé un `slug` neutre, dérivé de l'extraction, et le préalable du lot 148
     est levé.

     ⭐ ET LE GARDE CHANGE D'OBJET AU LIEU DE DISPARAÎTRE. Il tenait une
     ABSENCE ; il tient maintenant la PROPRIÉTÉ qui a coûté le chantier, et qui
     est la seule chose qui doive rester vraie : **le slug apparie les deux
     langues, trait pour trait, sans exception**. Un garde qui s'efface le jour
     où sa mesure devient bonne laisse la régression revenir sans témoin.

     ⛔ ET IL S'ÉPROUVE PAR LES DEUX BOUTS. Un slug manquant se voit ; un slug
     PRÉSENT DES DEUX CÔTÉS MAIS DIFFÉRENT aussi — c'est celui-là qui serait
     invisible à un simple compte, et c'est la famille « une bijection fausse
     est cohérente ». */
  const parLangue = {};
  for (const [langue, couche] of [["en", "srd-5.2.1-en.layer.json"], ["fr", "srd-5.2.1-fr.layer.json"]]) {
    const table = new Map();
    for (const [adresse, entree] of Object.entries(lis(couche).records.species || {})) {
      for (const trait of ((entree.data || {}).traits) || []) {
        table.set(`${adresse}  ${trait.id}`, { adresse, slug: trait.slug });
      }
    }
    parLangue[langue] = table;
  }

  /* ① AUCUN TRAIT SANS SLUG — dans l'une ou l'autre langue. */
  const sansSlug = [];
  for (const [langue, table] of Object.entries(parLangue)) {
    for (const [clef, entree] of table) if (typeof entree.slug !== "string") sansSlug.push(`${langue}  ${clef}`);
  }
  assert.deepEqual(sansSlug, [],
    "⛔ UN TRAIT A PERDU SA POIGNÉE. Sans slug, la couche FH ne le vise plus dans cette langue et la pile\n" +
    "   REFUSE de se monter. La réparation est en amont (`fh-srd`, `src/pair_traits.py`), ⛔ pas ici.");

  /* ② ET LES DEUX LANGUES PORTENT LE MÊME JEU DE SLUGS, ESPÈCE PAR ESPÈCE.
     ⛔ Comparé par ENSEMBLE dans chaque espèce, jamais par position : deux jeux
     triés séparément ne se contredisent jamais, même inversés. */
  const desaccords = [];
  const parEspece = (table) => {
    const carte = new Map();
    for (const { adresse, slug } of table.values()) {
      if (!carte.has(adresse)) carte.set(adresse, new Set());
      carte.get(adresse).add(slug);
    }
    return carte;
  };
  const en = parEspece(parLangue.en);
  const fr = parEspece(parLangue.fr);
  for (const [adresse, slugsEn] of en) {
    const slugsFr = fr.get(adresse);
    if (!slugsFr) { desaccords.push(`${adresse} : absente du français`); continue; }
    const manquants = [...slugsEn].filter((s) => !slugsFr.has(s));
    const en_trop = [...slugsFr].filter((s) => !slugsEn.has(s));
    if (manquants.length || en_trop.length) {
      desaccords.push(`${adresse} : fr sans ${JSON.stringify(manquants)} · fr en trop ${JSON.stringify(en_trop)}`);
    }
  }
  assert.deepEqual(desaccords, [],
    "⛔ LES DEUX LANGUES NE PORTENT PLUS LE MÊME JEU DE POIGNÉES. C'est la panne que ce chantier\n" +
    "   existe pour empêcher : un slug qui diverge rend un chemin de couche FH muet dans UNE langue,\n" +
    "   et un compte de slugs resterait juste pendant ce temps-là.");

  assert.equal(parLangue.en.size, 33, "33 traits en anglais");
  assert.equal(parLangue.fr.size, 33, "33 traits en français");
});
