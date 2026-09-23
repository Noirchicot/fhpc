/* ══ LE TAMBOUR DE L'ÉTAPE EQUIPMENT — LOT 84 ═════════════════════════════

   Deux roues (rayon → étagère) et une grille paginée, dans le VRAI écran.

   ⚠️ LA LIMITE DE MESURE, DITE D'ABORD PARCE QU'ELLE DÉCIDE DE TOUT CE
   FICHIER. La moitié « roue » de cette pièce NE SE TESTE PAS PAR SCRIPT, et
   ce n'est pas un manque d'effort :

     · `scroll-snap-type: mandatory` ramène instantanément tout `scrollLeft`
       assigné sur le cran le plus proche — l'état « entre deux crans », celui
       qui fait la rotation, n'existe pas pour un script ;
     · le viseur, la cascade et la couture de la roue infinie sortent tous
       d'une MISE EN PAGE (`offsetLeft`, `scrollLeft`), et `dom-stub.mjs`
       refuse délibérément d'en fabriquer une — « un rectangle de zéros
       laisserait un test passer en mesurant du vide ».

   ⭐ CE QUE CE FICHIER MESURE DONC, ET C'EST TOUT CE QUI EST MESURABLE :
     1. la COUTURE DE DONNÉE (`rayonsEtEtageres`) — pure, et c'est la pièce
        qui décide de la forme du lot ;
     2. la PAGINATION (`pageDeListe`) — pure, éprouvée sur le cas PLEIN et sur
        le cas dégénéré, jamais sur le cas courant ;
     3. l'ÉTAT D'ATTENTE et la structure, au DOM ;
     4. les HUIT PIÈGES DÉJÀ PAYÉS, sur les octets de la feuille de style —
        aucun d'eux ne fait rougir un test de comportement, c'est même leur
        signature commune. Un garde d'octets est ce qu'on peut leur opposer.

   ⛔ ET CE QUI RESTE À ÉRIC, PARCE QUE RIEN D'AUTRE NE PEUT LE DIRE : la roue
   n'a JAMAIS été vue sur iPad DANS l'écran réel. La moitié des défauts du
   2026-08-22 ne se voyaient qu'au doigt. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { PAR_PAGE } from "../ui/builder/wares-disposition.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** ⚠️ LES COMMENTAIRES SONT RETIRÉS AVANT TOUTE INSPECTION, ET IL A FALLU LE
 *  MESURER : les trois premiers gardes d'octets écrits ici ont rougi sur MES
 *  PROPRES COMMENTAIRES — ceux qui expliquent la parade nomment forcément le
 *  piège (« ⛔ surtout pas `scroll-snap-stop: always` », « ⛔ pas de
 *  `will-change` »). C'est exactement la loi de `tests/source-scan.mjs` :
 *  « un garde qui les lit interdirait d'expliquer la frontière qu'il défend ».
 *  Ce qui est jugé, c'est du CSS.
 *  📌 Un dépouilleur À PART de `stripComments` (qui est écrit pour du JS) : le
 *  CSS n'a ni `//`, ni gabarits, ni littéraux de regex — un balayage `/* … *\/`
 *  suffit, et il ne peut pas se tromper de frontière comme la version JS. */
function sansCommentairesCss(texte) {
  let out = "";
  let i = 0;
  while (i < texte.length) {
    const debut = texte.indexOf("/*", i);
    if (debut === -1) { out += texte.slice(i); break; }
    out += texte.slice(i, debut) + " ";
    const fin = texte.indexOf("*/", debut + 2);
    if (fin === -1) break;
    i = fin + 2;
  }
  return out;
}
const CSS = sansCommentairesCss(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8"));
const JS = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "equipment-step.mjs"), "utf8"));

const { renderEquipmentStep, rayonsEtEtageres, lireRangement, annoncerCourant, profondeurAccordee } =
  await import("../ui/builder/equipment-step.mjs");
/* ⭐ LA PAGINATION A DÉMÉNAGÉ AU SOCLE (2026-08-26) : le 15 est une norme du
   produit entier (NORMES.md §5), plus une constante de cet écran. Les mêmes
   mesures, sur la fonction partagée. */
const { pageDeListe, LISTE_PAR_PAGE } = await import("../ui/builder/normes.mjs");

/* ⭐ DEPUIS L'INVERSION DU 24/08 (mandat d'Eric), l'étape OUVRE SUR LE PERSONNAGE
   ÉQUIPÉ — depuis le lot 212, c'est l'écran R (Gear), et le catalogue est
   derrière sa porte `Wares` (croquis du 15/09). Ces suites regardent le
   CATALOGUE : on y entre comme le joueur, par cette porte. L'état de vue
   persiste entre les rendus (c'est le produit), le clic est donc conditionnel. */
/* 🔄 LOT 219 — DERRIÈRE LA PORTE `Wares`, C'EST WARES v2 (dicté par Eric le 20/09). L'entrée
   ne change pas — on y va comme le joueur — mais l'écran qu'on y trouve est le neuf, et ses
   organes portent d'autres noms. ⛔ La vue persiste entre les rendus (c'est le produit), donc
   le clic reste conditionnel. */
function monterR(ctx, onAction) {
  const node = renderEquipmentStep(ctx, onAction || (() => {}));
  const porte = node.querySelector('.gear-porte[data-porte="wares"]');
  if (porte) porte.click();
  return node;
}

const fixture = exempleFhEn();
const { layers } = fixture;
const query = layers.verbs.query;

function rows(node, selector) { return node.querySelectorAll(selector); }
function ctx() { return { document: { build: { choices: [] } }, resolved: null, query, search: true }; }

/* ══ 1 — LA COUTURE DE DONNÉE : ELLE LIT LE RANGEMENT D'ERIC ═════════════

   🔴 CES TESTS DISAIENT L'INVERSE, ET ILS AVAIENT RAISON. Le tambour lisait le
   GENRE des records, faute de taxonomie ; il affichait donc `Armor · Gear ·
   Item · Weapon` au premier niveau. ⛔ Eric, le 2026-08-24 : *« je devais pas
   voir armor au premier niveau, elles sont notées, on les respecte »*.

   Son rangement est dans la donnée depuis le lot 90 de fh-srd — couche `srfh`,
   genre `shelving`, 416 records portant `aisle` + `shelf` + `extends`. Le lot
   95 la monte et l'écran la lit. ⭐ La couture n'a pas changé de FORME, elle a
   changé de SOURCE : le rangement n'est plus déduit, il est LU là où Eric l'a
   écrit. */

const RANGEMENT = lireRangement(query);

test("1 — LES RAYONS SONT CEUX D'ERIC, plus jamais les genres de records", () => {
  const arbre = rayonsEtEtageres(query);
  assert.deepEqual(arbre.map((r) => r.id),
    ["adventuring", "arcana", "armory", "crafting", "marvels", "mundane", "tools", "trade-goods"],
    "⚖️ ERIC, 2026-09-23 : « ne mets pas crafting tools, mets tools » — le rayon dit ce que l\u2019objet EST,\n"
    + "   pas ce qu\u2019on en FAIT.\n"
    + "   ✅ ET `crafting` EST REVENU LE 24/09, exactement comme ce garde l'annonçait : il s'était VIDÉ "
    + "quand les outils sont partis, et une combinaison non peuplée n'est pas dans l'export (test 5 "
    + "ter). ⛔ MAIS PAS PAR OÙ ON L'ATTENDAIT : ce garde disait « il revient le jour où les 210 "
    + "ingrédients du Soulforging y entrent ». Les 210 n'y sont PAS ENTRÉS et n'y entreront jamais — "
    + "Eric a refusé 675 records au catalogue et posé QUATRE PLANS à leur place. Le rayon revient "
    + "avec `blueprints`, pas avec `ingredients`, qui a été retirée le même jour.\n"
    + "   🔧 ET LA PHRASE SUR `trade-goods` ÉTAIT FAUSSE : elle disait « le MOT DU LIVRE, 23 "
    + "marchandises typées TG au SRD 5.2 ». ⛔ Mesuré le 23/09 : le SRD n'en porte AUCUNE. Les deux "
    + "mots — `trade goods` ET `valuables` — sont dans la même phrase de prose du livre, donc §0.12 "
    + "ne tranchait rien ; le choix est une décision d'Eric du 09/09, et elle se suffit.");
  /* ⛔ ET AUCUN GENRE N'Y SURVIT : le défaut se reconnaît à ces quatre mots. */
  for (const genre of ["armor", "gear", "item", "weapon"]) {
    assert.equal(arbre.some((r) => r.id === genre), false,
      `« ${genre} » est un GENRE DE DONNÉES — sa présence au premier niveau EST le défaut du lot 95`);
  }
});

/* 🔴 LA SEULE ÉTAGÈRE QUI DÉBORDE LES 35 D'ERIC, ET C'EST UN ARBITRAGE QUI LUI
   REVIENT — ouvert le 2026-09-08 par le lot 181.

   Deux paroles d'Eric se contredisent, et aucune n'est de moi :
     · 2026-08-21/22, ÉCRIT — sa structure de rangement déclare `crafting ›
       gems`, à zéro. C'est ce que le lot 181 a rempli.
     · 2026-09-08, DIT — « les gemmes doivent être dans l'équipement :
       valuables ». ⚠️ Et `valuables` n'existe dans aucun des 470 records de
       rangement : ce serait une étagère NEUVE, donc une décision de taxonomie.

   ⛔ CE N'EST PAS UN DESSERRAGE, ET LA FORME LE PROUVE : la liste des
   débordements est confrontée ENTIÈRE (`deepEqual`), pas filtrée. Une SECONDE
   étagère qui déborderait ferait rougir ce test comme avant ; un compte de
   gemmes qui bouge aussi ; et le jour où Eric re-tranche le découpage, c'est
   cette constante qui rougit et qui le rappelle.
   📌 CE QUE DIT LE TEST ORIGINAL, ET QUI TIENT TOUJOURS : « si un jour une
   étagère déborde, c'est le DÉCOUPAGE qu'on refait, jamais la donnée qu'on
   refuse ». Le découpage se refait chez fh-srd (`src/shelving.py`) ET dans
   `ETAGERE_DES_GEMMES` (`src/tools/gen-fh-gems-layer.mjs`), une chaîne. */
/* ⚖️ TRANCHÉ le 2026-09-08 : ce n'est plus une dette « en attente », c'est un
   débordement RATIFIÉ. 📌 Et `NORMES.md:2441` l'anticipait mot pour mot :
   *« le 35 par étagère est une CIBLE DE DÉCOUPE, jamais un plafond de données —
   le homebrew le fera déborder, c'est prévu »*. Le garde reste, parce qu'il
   attrape un débordement NON VOULU ; il nomme celui qui l'est. */
/* ✅ — ET LA DETTE DES GEMMES EST PAYÉE LE 2026-09-23, PAR LA COUPE D'ERIC.
   `trade-goods › trade-goods` portait 54 gemmes ; elles sont 27, sur une étagère
   à elles (*« sous trade goods tu auras gems »*), donc SOUS le seuil. ⛔ Il n'y a
   plus de débordement ratifié : la constante disparaît au lieu d'être mise à 27,
   parce qu'une tolérance qui ne tolère plus rien est un garde qui dort.
   🔴 ET UNE MESURE DU 23/09 CORRIGE CE QUE CE GARDE AFFIRMAIT : il annonçait
   « 77 quand les 23 marchandises du livre l'auront rejointe ». ⛔ LES 23 N'EXISTENT
   PAS DANS LE BUILDER — mesuré : aucun record `gear` ne porte Canvas, Cinnamon,
   Saffron, Silk…, et aucun record n'est non rangé. `trade-goods` n'a donc JAMAIS
   porté que des gemmes, et le 77 était une prévision, pas une mesure. */
/* ✅ 2026-09-23 — UN SECOND DÉBORDEMENT, ET ERIC L'A RATIFIÉ : *« pour les gemmes
   on [est] aussi au-dessus des 35 »*. La cible de 35 garde son sens — c'est une
   CIBLE DE DÉCOUPAGE — mais deux étagères l'assument désormais, et pour la même
   raison : ce qu'elles portent ne se découpe pas plus fin sans mentir. Un outil
   est un outil ; une gemme est une gemme.
   ⛔ RATIFIÉ NE VEUT PAS DIRE OUBLIÉ : les deux restent NOMMÉES ici, avec leur
   compte, pour qu'un troisième débordement rougisse au lieu de se glisser.
   ⭐ CE QUI A CHANGÉ CE JOUR-LÀ : le rayon s'appelle `tools`, plus `crafting`.
   Eric a demandé que les outils Fate's Hand rejoignent `crafting › tools`
   (« y'a pas une étagère tools ? dans crafting ? »). Ils y sont, et l'étagère
   passe de 25 à 37 — AU-DESSUS de son critère des 35.
   ⛔ Le commentaire du test dit quoi faire, et ce n'est pas tolérer : « si un
   jour une étagère déborde, c'est le DÉCOUPAGE qu'on refait ». Le découpage de
   `crafting` est justement la question ouverte depuis le 09/09 — ce rayon n'a
   qu'une étagère, et `gems`/`ingredients` y sont déclarées à zéro.
   ➡️ CE GARDE NE DIT PAS QUE 37 EST BIEN. Il dit que 37 est CONNU, et qu'il
   attend un mot d'Eric : recouper `crafting`, ou ratifier le débordement. */
const DEBORDEMENT_NOMME_A_TRANCHER = { id: "tools:tools", n: 37 };

test("2 — 🔴 LE CRITÈRE D'ERIC : aucune étagère au-dessus de 35, sauf celle qu'il a NOMMÉE", () => {
  /* Eric, 2026-08-24, mot pour mot : « l'organisation de l'équipement permet
     toujours d'arriver à MOINS DE 35 ITEMS SUR LA DERNIÈRE CATÉGORIE, c'est
     l'idée ». ⭐ Les rayons ne sont pas une classification pour elle-même : ils
     existent pour qu'au bout de la descente le joueur tombe sur une étagère
     qu'il peut EMBRASSER. C'est le seul chiffre qui dit si ce lot a réussi.
     ⛔ 35 est une CIBLE DE DÉCOUPAGE, jamais un plafond de donnée : si un jour
     une étagère déborde, c'est le DÉCOUPAGE qu'on refait, jamais la donnée
     qu'on refuse — et la pagination, elle, n'a pas de plafond (test 9). */
  const arbre = rayonsEtEtageres(query);
  /* 🔴 L'IDENTITÉ EST `aisle:shelf`, JAMAIS LE LIBELLÉ — loi du test 3. Une
     dette écrite « Crafting › Gems » se serait accrochée à un affichage. */
  const toutes = arbre.flatMap((r) => r.etageres.map((e) => ({ id: e.id, nom: `${r.label} › ${e.label}`, n: e.objets.length })));
  const debordent = toutes.filter((e) => e.n >= 35).map(({ id, n }) => ({ id, n }));
  assert.deepEqual(debordent, [DEBORDEMENT_NOMME_A_TRANCHER],
    "une étagère à 35 ou plus a raté l'unique raison d'être des rayons — la seule admise est " +
    "`tools › tools` à 37, RATIFIÉE le 23/09. ✅ ET ELLE EST SEULE DEPUIS CE JOUR-LÀ : " +
    "`trade-goods` portait 54 gemmes, la coupe d'Eric les ramène à 27 sur leur propre étagère, " +
    "sous le seuil. Une dette de six semaines soldée par une décision d'auteur, pas par un " +
    "redécoupage.");

  /* ⚔️ ET CE QUI RESTE TOLÉRÉ SE FONDE SUR LA DONNÉE, PAS SUR SON NOM : ce qui
     déborde doit être EXACTEMENT des outils. Sans ce témoin, un objet d'un autre
     genre rangé là par erreur se cacherait derrière un compte toléré. */
  const dette = arbre.find((r) => r.id === "tools").etageres.find((e) => e.id === DEBORDEMENT_NOMME_A_TRANCHER.id);
  assert.deepEqual([...new Set(dette.objets.map((o) => o.kind))], ["tool"],
    "l'étagère tolérée ne porte QUE des outils — sinon la tolérance couvrirait autre chose");
  /* ✅ ET LE TÉMOIN DE LA DETTE SOLDÉE : les gemmes sont bien là, et bien SOUS le seuil. */
  const gemmes = arbre.find((r) => r.id === "trade-goods").etageres.find((e) => e.id === "trade-goods:gems");
  assert.equal(gemmes.objets.length, 27, "✅ la coupe d'Eric du 23/09 — 54 → 27, et le seuil est tenu");

  /* Le rangement d'Eric HORS des deux débordements n'a pas bougé d'un objet.
     ⏳ `crafting › tools` en sort aussi depuis le 23/09 : il est NOMMÉ plus
     haut, et son compte est vérifié là — le mesurer deux fois ne dirait rien
     de plus, et masquerait un mouvement sur les 24 autres étagères. */
  const hors = new Set([DEBORDEMENT_NOMME_A_TRANCHER.id]);
  const sansLaDette = toutes.filter((e) => !hors.has(e.id));
  const plusGrosse = sansLaDette.reduce((a, b) => (b.n > a.n ? b : a));
  /* ⭐ 33 → 34 LE 23/09, ET CE N'EST PAS UN AJOUT : la couche générée avait DÉRIVÉ
     de sa source. `Pearl of Power` était passée de `marvels › consumables` à
     `marvels › foci-and-curios` en amont, et `layers/srfh-shelving-en` portait
     encore l'ancien rangement. La régénération du 23/09 a refermé l'écart —
     foci-and-curios 33 → 34, consumables 15 → 14, total inchangé.
     ⛔ Un généré qu'on ne régénère pas ment d'autant mieux qu'il est vert. */
  assert.equal(plusGrosse.n, 34, `mesuré le 2026-09-23 : la plus grosse est ${plusGrosse.nom}`);
});

test("3 — 🔴 UNE ÉTAGÈRE S'IDENTIFIE PAR `aisle:shelf`, JAMAIS PAR SON LIBELLÉ", () => {
  /* LA LEÇON LA PLUS CHÈRE DU CHANTIER, payée le 23/08 : les tables étaient
     indexées PAR LIBELLÉ, et l'écran a affiché « Armor 19 » au-dessus d'une
     grille de 13 parce que deux étagères portaient ce mot.
     ⭐ ET CE N'EST PAS THÉORIQUE DANS LA DONNÉE D'AUJOURD'HUI : `marvels` et
     `mundane` portent CHACUN une étagère « Clothing ». Ce test le prouve avec
     les deux vrais comptes — 32 et 5 — au lieu de l'affirmer. */
  const arbre = rayonsEtEtageres(query);
  const homonymes = arbre.flatMap((r) => r.etageres.filter((e) => e.label === "Clothing").map((e) => [r.id, e.id, e.objets.length]));
  assert.deepEqual(homonymes, [["marvels", "marvels:clothing", 32], ["mundane", "mundane:clothing", 5]],
    "deux étagères, un seul mot — et deux identités distinctes");

  const ids = arbre.flatMap((r) => r.etageres.map((e) => e.id));
  assert.equal(new Set(ids).size, ids.length, "aucune identité d'étagère n'est portée deux fois");
});

test("4 — ⚔️ ATTAQUE : aucun libellé n'est inventé, chacun se retrouve dans le rangement", () => {
  /* Le piège traqué depuis le lot 84 : une jolie table de correspondance
     (`wands-rods-staves` → « Baguettes & Bâtons »). Elle serait une SECONDE
     écriture de la taxonomie, et deux écritures divergent. Les noms d'Eric
     vivent chez fh-srd ; ici le libellé n'est que la valeur lue, recasée. */
  const arbre = rayonsEtEtageres(query);
  const recase = (v) => String(v).split(/[-_\s]+/).filter(Boolean).map((m) => m[0].toUpperCase() + m.slice(1)).join(" ");
  const rayonsLus = new Set();
  const etageresLues = new Set();
  for (const vue of query({ kind: "shelving" })) {
    const s = vue.record.data.shelf || {};
    rayonsLus.add(recase(s.aisle));
    etageresLues.add(recase(s.shelf));
  }
  for (const rayon of arbre) {
    assert.ok(rayonsLus.has(rayon.label), `« ${rayon.label} » ne se retrouve dans aucun record de rangement`);
    for (const etagere of rayon.etageres) {
      assert.ok(etageresLues.has(etagere.label), `« ${etagere.label} » est une étiquette inventée`);
    }
  }
});

/* LE RANGEMENT VIENT DE DEUX COUCHES DEPUIS LE LOT 181, et les deux sont
   NOMMÉES SÉPARÉMENT : un total juste ne dit rien du contenu — 470 se lit
   aussi bien « 416 + 54 » que « 470 records de la même couche ». Les deux
   chiffres se vérifient donc l'un après l'autre, par le PRÉFIXE d'id. */
const RANGEMENTS_SRFH = 416;   // `srfh-shelving-en`, lot 95 — le SRD habillé
const RANGEMENTS_GEMMES = 27;  // `fh-gems-en`, lot 181 — les gemmes d'Eric, 54 jusqu'au 23/09
/* ✅ LA COUPE D'ERIC, 23/09 : *« les 54 gemmes tombent à 27 »*, et elle suit la
   rareté — 3 noms par palier commun, 2 au milieu, 1 au sommet. ⛔ Le canon du
   vault garde ses 54 : la coupe est une DÉRIVATION du générateur, pas une
   amputation de la source, et elle se rejoue par la règle qu'il porte. */
/** Les 12 rangements d'outils Fate's Hand — 11 dans `fh-skills-en`, 1 dans
 *  `fh-soulforging-en`. ⏳ Ils poussent `crafting › tools` à 37, au-dessus du
 *  critère des 35 : voir `DEBORDEMENT_NOMME_A_TRANCHER`. */
const RANGEMENTS_OUTILS_FH = 12;
/** Les 4 rangements de munitions — `fh-munitions-en`. ⛔ Les flèches n'en ont
 *  PAS : elles RÉÉCRIVENT `srd:gear:en:ammunition`, déjà rangé par `srfh`. */
const RANGEMENTS_MUNITIONS = 4;
/** ✅ LES 4 PLANS DU SOULFORGING — `fh-soulforging-en`, Eric le 24/09 : « une
 *  seule étagère blueprints pour les quatre ». ⭐ ET C'EST LE COMPTE QUI DIT LE
 *  LOT : le chapitre porte 675 fiches (465 catalyseurs, 210 ingrédients). Les
 *  poser ici ferait plus du double de l'équipement entier ; Eric a mis QUATRE
 *  plans à leur place, et les 675 restent la donnée que les formulaires lisent. */
const RANGEMENTS_BLUEPRINTS = 4;

test("5 — 🔴 LES 463 RANGEMENTS SONT LUS (416 + 27 + 12 + 4 + 4), ET PLUS AUCUN NE POINTE DANS LE VIDE", () => {
  /* ⭐ 2026-09-09, LOT 185 — LE TOTAL AFFICHÉ EST REDEVENU LE TOTAL LU, et
     c'est le lot entier qui tient dans cet écart refermé.

     📏 CE QUI ÉTAIT MESURÉ ICI JUSQU'À CE JOUR : `srfh` est construite sur le
     SRD seul ; deux de ses records rangent `gaming-set` et
     `musical-instrument`, que `fh-skills-en` ÉTEIGNAIT pour les remplacer par
     sept outils plus fins. Deux rangements désignaient donc des records
     inexistants — et ce test les comptait, un par un, plutôt que de les avaler.

     🔴 ERIC, 2026-09-09 : *« Eh bien au lieu de soustraire, réécrit. »* Les deux
     outils ne s'éteignent plus : ils DEVIENNENT le jeu de dés et les cordes,
     sous leur id d'origine. Les deux rangements pointent donc vers des records
     bien vivants, sans qu'une seule ligne de `srfh-shelving-en` ait bougé.

     ⛔ ET CE TEST N'EST PAS DESSERRÉ POUR AUTANT — il exige maintenant le
     contraire, avec la même sévérité : `introuvables` doit être VIDE. Une
     future extinction s'y verrait immédiatement, là où un test qui aurait
     simplement retiré l'assertion l'aurait laissée passer.
     ⚠️ Rappel de ce que ces deux-là étaient : une incohérence de DONNÉE, pas un
     défaut d'affichage. Ils étaient déjà invisibles à l'écran avant comme après
     — ce qui a changé, c'est qu'ils désignent enfin quelque chose. */
  /* ⭐ 2026-09-23 — UNE TROISIÈME COUCHE POSE DES RANGEMENTS. `fh-skills-en`
     en porte 11 (ses outils neufs) et `fh-soulforging-en` 1. Même motif que les
     gemmes : une couche Fate's Hand range SES records, parce que `srfh` est
     bâtie sur le SRD seul et ne les a jamais vus. */
  assert.equal(RANGEMENT.lus, RANGEMENTS_SRFH + RANGEMENTS_GEMMES + RANGEMENTS_OUTILS_FH + RANGEMENTS_MUNITIONS + RANGEMENTS_BLUEPRINTS,
    "les 463 records de rangement des CINQ sources sont bien lus");
  /* ⚔️ ET LA DÉCOMPOSITION, sans quoi 416 pourraient devenir 470 d'un seul
     côté sans que ce test bronche.
     ⚖️ 09/09 — LE PARTAGE DES PRÉFIXES A CHANGÉ, ET C'EST UNE DÉCISION D'ERIC.
     `srfh:` ne veut plus dire « le rangement du livre SRD » : il veut dire
     « cet objet n'appartient pas à une seule source ». Les 23 gemmes que le
     DMG porte AUSSI y sont passées, pour que les deux couches posent le MÊME
     id et que le moteur n'en garde qu'un record (« on superpose », « pas de
     doublons inutiles »). Restent `fh:` les 31 inventions de Fate's Hand. */
  /* 📏 23 JUSQU'AU 23/09, 14 DEPUIS — ET LE SENS A CHANGÉ AVEC LE NOMBRE. La
     coupe d'Eric écarte QUATORZE pierres du DMG. ✅ Sa règle du 23/09 est en deux
     temps : *« les noms les plus courts, et alphabétiquement plus proches de A »*,
     puis *« si ça tombe sur du DMG tu élimines et passes au nom suivant »*.
     ⚠️ ET NEUF RESTENT QUAND MÊME, PARCE QUE QUATRE PALIERS N'ONT PAS LE CHOIX :
     à 10, 50, 100 et 1000 po, les pierres sont des gemmes RÉELLES — Jade, Jet,
     Onyx, Amber — et le livre les liste parce qu'elles existent. Le générateur
     replie alors, et il le DIT (voir sa sortie, et `tests/fh-gems.test.mjs`).
     ⛔ Un repli tu serait devenu, en six semaines, un choix qu'on croit avoir fait. */
  const GEMMES_PARTAGEES = 9;
  /* Les 12 rangements d'outils sont TOUS `fh:` — ils pointent vers des records
     qui n'existent pas sur le fil SRD. */
  const parPrefixe = { "srfh:": 0, "fh:": 0 };
  for (const vue of query({ kind: "shelving" })) {
    const prefixe = String(vue.id).startsWith("srfh:") ? "srfh:" : "fh:";
    parPrefixe[prefixe] += 1;
  }
  assert.deepEqual(parPrefixe, {
    "srfh:": RANGEMENTS_SRFH + GEMMES_PARTAGEES,
    "fh:": RANGEMENTS_GEMMES - GEMMES_PARTAGEES + RANGEMENTS_OUTILS_FH + RANGEMENTS_MUNITIONS
      + RANGEMENTS_BLUEPRINTS
  }, "416 du livre + 9 gemmes partagées d'un côté, 18 gemmes + 12 outils + 4 munitions + 4 plans "
    + "de l'autre. ⭐ LES QUATRE PLANS SONT `fh:` SANS DISCUSSION : le Soulforging n'existe dans "
    + "aucun SRD, donc aucun id n'est partagé avec le livre.");
  /* ⚔️ ET LE TOTAL NE BOUGE PAS — c'est ce qui prouve qu'on a DÉPLACÉ des
     rangements entre deux comptes, et non pas ajouté ou perdu des records. */
  assert.equal(parPrefixe["srfh:"] + parPrefixe["fh:"],
    RANGEMENTS_SRFH + RANGEMENTS_GEMMES + RANGEMENTS_OUTILS_FH + RANGEMENTS_MUNITIONS + RANGEMENTS_BLUEPRINTS,
    "le déplacement de 23 ids ne doit créer ni détruire aucun rangement");

  assert.equal(RANGEMENT.orphelins.length, 0, "aucun rangement sans rayon ni étagère");
  /* ⚔️ LE GARDE QUI PORTE LE LOT 185 : c'était 2, ce doit être 0. */
  assert.deepEqual(RANGEMENT.introuvables.map((x) => x.extends).sort(), [],
    "⛔ AUCUN rangement ne pointe vers un record que la pile ne porte pas — la réécriture les a tous sauvés");

  /* ⚔️ ET SON TÉMOIN INVERSE, GARDÉ : les deux ids qui pointaient dans le vide
     sont NOMMÉS et retrouvés vivants. Sans lui, `introuvables` vide serait
     aussi vert si `srfh-shelving-en` avait cessé de les ranger — un compte à
     zéro ne dit pas si le problème est réparé ou si le sujet a disparu. */
  const rangés = new Set(query({ kind: "shelving" }).map((v) => v.record.data.extends));
  for (const id of ["srd:tool:en:gaming-set", "srd:tool:en:musical-instrument"]) {
    assert.ok(rangés.has(id), `« ${id} » doit TOUJOURS être rangé par \`srfh-shelving-en\``);
    assert.ok(query({ kind: "tool", id }), `…et la pile doit le porter : c'est ce que la réécriture achète`);
  }

  const arbre = rayonsEtEtageres(query);
  const total = arbre.reduce((t, r) => t + r.etageres.reduce((s, e) => s + e.objets.length, 0), 0);
  assert.equal(total, RANGEMENTS_SRFH + RANGEMENTS_GEMMES + RANGEMENTS_OUTILS_FH + RANGEMENTS_MUNITIONS + RANGEMENTS_BLUEPRINTS,
    "les 463 rangements sont tous à l'étalage — plus aucun n'est écarté");
  const ids = new Set();
  for (const r of arbre) for (const e of r.etageres) for (const o of e.objets) ids.add(o.view.id);
  assert.equal(ids.size, RANGEMENTS_SRFH + RANGEMENTS_GEMMES + RANGEMENTS_OUTILS_FH + RANGEMENTS_MUNITIONS + RANGEMENTS_BLUEPRINTS, "et chaque objet n'est rangé que sur UNE étagère");
});

test("5 bis — ⭐ LA DETTE EST PAYÉE : les 12 outils Fate's Hand ONT une étagère", () => {
  /* AVANT LE LOT 95, ZÉRO OUTIL ÉTAIT VISIBLE : `EQUIPMENT_RECORD_KINDS` nommait
     quatre genres et `tool` n'en faisait pas partie. Les 25 outils du SRD
     étaient rangés depuis le lot 90 et invisibles depuis toujours.

     🔴 PUIS UNE DETTE EST RESTÉE, NOMMÉE ICI PENDANT DEUX SEMAINES : `fh-skills-en`
     AJOUTE des outils que `srfh` n'a jamais vus — elle est construite sur le SRD
     seul. Ils n'avaient AUCUNE étagère, donc ils n'apparaissaient nulle part.
     Ce test les nommait « pour qu'un ajout futur casse ici au lieu de disparaître
     en silence ». ⭐ IL A FAIT EXACTEMENT ÇA.

     ⚖️ ERIC, 2026-09-23 : *« y'a pas une étagère tools ? dans crafting ? »* — il
     y en a une, et les douze l'ont rejointe. Le rangement vit dans LEUR couche,
     pas dans `srfh` : motif des 54 gemmes, et il s'éteint avec l'interrupteur
     qui les allume.
     ⏳ CE QUE ÇA COÛTE, ET CE TEST NE LE CACHE PAS : l'étagère passe de 25 à 37,
     au-dessus du critère des 35 — ratifié par Eric le 23/09, voir
     `DEBORDEMENT_NOMME_A_TRANCHER`. ⭐ Et le rayon s'appelle `tools` depuis ce
     jour-là : « ne mets pas crafting tools, mets tools ». */
  const arbre = rayonsEtEtageres(query);
  const outils = arbre.find((r) => r.id === "tools").etageres.find((e) => e.id === "tools:tools");
  assert.equal(outils.objets.length, 37, "25 du SRD + 11 neufs + le Soulforging");

  const ranges = new Set(query({ kind: "shelving" })
    .filter((v) => v.record.data.of_kind === "tool").map((v) => v.record.data.extends));
  const sansEtagere = query({ kind: "tool" }).map((v) => v.id).filter((id) => !ranges.has(id)).sort();
  assert.deepEqual(sansEtagere, [],
    "⛔ PLUS AUCUN outil sans étagère — et si un ajout futur en repose un, c'est ici qu'il casse");

  /* ⛔ ET LES DEUX RÉÉCRITS N'EN ONT QU'UN SEUL. Ils gardent l'id du SRD, donc
     leur étagère vient de `srfh` ; leur en poser un second depuis `fh-skills-en`
     afficherait DEUX lignes pour un seul outil. Ce témoin le refuse. */
  for (const [id, nom] of [["srd:tool:en:gaming-set", "Dice Set (regular)"],
    ["srd:tool:en:musical-instrument", "Instrument (Strings, regular)"]]) {
    const poses = query({ kind: "shelving" }).filter((v) => v.record.data.extends === id);
    assert.equal(poses.length, 1, `« ${id} » doit avoir UN rangement, pas deux`);
    assert.equal(query({ kind: "tool", id }).record.name, nom,
      "…et porter le nom de son héritier : c'est lui que le joueur voit sur l'étagère");
  }
});

test("5 ter — ⏳ LES RAYONS VIDES NE SONT PAS DANS L'EXPORT, et ce garde le dit", () => {
  /* 🔴 LE MANDAT DU LOT 95 DEMANDAIT SEPT RAYONS, « `companions` porté à 0 et
     affiché ». MA MESURE LE CONTREDIT, et c'est elle qui gagne : la structure
     canonique déclare bien SEPT rayons et TRENTE étagères — mais elle vit dans
     `~/tools/fh-srd/src/shelving.py`, un fichier Python que ce dépôt ne lit
     pas, et `exports/srfh/en/shelving.json` ne porte QUE les combinaisons
     PEUPLÉES : 6 rayons, 26 étagères.

     ⛔ ET C'EST POURQUOI CE DÉPÔT NE LES ÉCRIT PAS À LA MAIN. Une liste de sept
     noms posée ici serait une SECONDE écriture de la taxonomie — exactement
     `ETAGERE_DE`, le défaut que ce lot vient de retirer, réinstallé un étage
     plus haut. Un rayon vide s'affichera le jour où la SOURCE le déclarera.

     ⏳ LOT À COMMANDER CHEZ fh-srd, et il tient en une ligne d'exportateur :
     publier la structure déclarée (rayons et étagères, peuplés ou non) à côté
     des records. Manquent aujourd'hui à l'appel — `companions › familiars`,
     `companions › henchmen`, `crafting › ingredients` : tous à zéro, tous
     invisibles.
     ⭐ MISE À JOUR DU 2026-09-08 (lot 181) — `crafting › gems` a QUITTÉ cette
     liste : elle porte les 54 gemmes d'Eric et s'affiche. Elle n'est pas venue
     de la structure publiée (fh-srd ne l'exporte toujours pas) mais des
     records eux-mêmes, par le seul chemin que ce dépôt accepte : une couche
     qui pose des rangements, jamais une taxonomie recopiée ici. */
  const arbre = rayonsEtEtageres(query);
  assert.equal(arbre.length, 8, "✅ HUIT rayons PEUPLÉS depuis le 24/09 — `crafting` est revenu, et "
    + "c'est le seul de la liste qui soit parti puis revenu. ⛔ ET PAS PAR OÙ ON L'ATTENDAIT : il "
    + "devait revenir avec les 210 ingrédients du Soulforging ; il revient avec QUATRE PLANS, parce "
    + "qu'Eric a refusé 675 records au catalogue. 🔧 `trade-goods`, lui, ne « sera pas rejoint par "
    + "les 23 marchandises du livre » : elles ne sont pas dans le SRD, mesuré le 23/09.");
  assert.equal(arbre.some((r) => r.id === "companions"), false,
    "⏳ le 7ᵉ rayon d'Eric est vide, donc absent de l'export : il n'apparaîtra qu'une fois la structure publiée");

  /* Le garde qui tiendra le jour où la source bougera : les rayons viennent de
     la DONNÉE et de rien d'autre. */
  const dansLaDonnee = new Set(query({ kind: "shelving" }).map((v) => v.record.data.shelf.aisle));
  assert.deepEqual(arbre.map((r) => r.id).sort(), [...dansLaDonnee].sort(),
    "aucun rayon n'est ajouté ni retiré entre la donnée et l'écran");
});

/* ══ LA PAGINATION — SUR LE CAS PLEIN, JAMAIS SUR LE CAS COURANT ══════════
   ⚠️ C'est le piège n°4 des huit, et il a déjà mordu EXACTEMENT ici : une
   piste qui grandit avec son contenu a l'air d'une piste qui se borne tant
   qu'elle n'a que trois objets. */

test("6 — 🔴 LE CAS PLEIN : la plus grosse étagère fait 33 objets, donc 3 pages, et la dernière en porte 3", () => {
  /* ⭐ ELLE EN FAISAIT 127 (« Wondrous Item ») JUSQU'AU LOT 97 DE fh-srd, qui a
     cassé les 149 merveilleux en sept étagères. 127 sur un écran visé à 35,
     c'était NEUF pages — le cas plein a maigri parce que le rangement a fait
     son travail, pas parce que le test a été assoupli. */
  const arbre = rayonsEtEtageres(query);
  const grosse = arbre.find((r) => r.id === "arcana").etageres.find((e) => e.id === "arcana:consumables-and-potions");
  assert.equal(grosse.objets.length, 33, "témoin : c'est bien le cas plein qu'on éprouve");

  const premiere = pageDeListe(grosse.objets, 0);
  assert.equal(premiere.pages, 3, "ceil(33 / 15) = 3");
  assert.equal(premiere.objets.length, LISTE_PAR_PAGE);

  const derniere = pageDeListe(grosse.objets, 2);
  assert.equal(derniere.objets.length, 3, "33 − 2 × 15 = 3 — une dernière page PARTIELLE, et c'est le cas normal");
});

test("7 — ⭐ RANGED WEAPONS EST ENFIN CE QUE SON NOM DIT : 21 objets, et `projectiles` n'existe plus", () => {
  /* 🔴 CE TEST A CHANGÉ TROIS FOIS, ET CHAQUE FOIS SUR UN MOT D'ERIC.
     Il disait d'abord « `projectiles` ne porte QU'UN objet » — un témoin réel du
     cas dégénéré. Puis les cinq munitions l'ont peuplée. Puis Eric, le 23/09 :
     *« les munitions vont dans Armory / Ranged Weapons »* — et elle s'est vidée.

     ⭐ ET LE 23/09 AU SOIR ELLE A ÉTÉ RETIRÉE DE LA STRUCTURE, PAS SEULEMENT VIDÉE,
     parce qu'Eric a lu le rapport de construction et vu la ligne qui restait :
     *« donc ammo et les autres projectiles, à mettre dans ranged weapons »*. La
     ligne `Ammunition` du SRD dormait seule sur une étagère que les cinq
     munitions de Fate's Hand avaient quittée — et c'était la couche FH qui la
     déménageait, donc la pile SRD seule la laissait derrière. ⚠️ OR ERIC AVAIT
     DÉJÀ TRANCHÉ *« idem pour FH et SRD »* le 20/09 : la fusion appartient donc à
     `fh-srd/src/shelving.py`, en amont, où les DEUX piles la lisent.
     ⛔ ET L'ÉTAGERE NE SURVIT PAS À ZÉRO, contrairement à `companions` et
     `crafting` : celles-là sont déclarées vides parce qu'elles seront remplies ;
     celle-ci ne le sera jamais. Une étagère déclarée qui n'attend rien ment.
     ⭐ LE TOTAL N'A PAS BOUGÉ — 21 avant, 21 après — ET C'EST LA PREUVE que le
     déménagement a seulement CHANGÉ DE MAIN : ce que la couche FH faisait, la
     base le fait. C'est la pile SRD seule qui y gagne, et elle n'est pas ici. */
  const arbre = rayonsEtEtageres(query);
  const armory = arbre.find((r) => r.id === "armory");
  assert.equal(armory.etageres.find((e) => e.id === "armory:projectiles"), undefined,
    "⛔ `projectiles` est VIDE, donc absente du tambour — la fusion d'Eric, appliquée");
  const ranged = armory.etageres.find((e) => e.id === "armory:ranged-weapons");
  assert.equal(ranged.objets.length, 21,
    "⭐ 10 armes à distance + 6 armes de JET + 5 munitions — Eric, 23/09 : « toutes les armes de " +
    "jet, les munitions vont dans cette catégorie ».\n" +
    "   🔴 ET C'EST LA RÉPARATION D'UN NOM QUI MENTAIT : `thrown-weapons` ne contenait AUCUNE arme " +
    "de jet. Ses dix records venaient de `derived:weapon.weapon_range` — arcs, arbalètes, fronde, " +
    "sarbacane, mousquet, pistolet. Les six vraies `Thrown` (Dagger, Handaxe, Javelin, Light " +
    "Hammer, Spear, Trident) dormaient chez les mêlées, parce qu'elles frappent aussi de près.");
  const melee = armory.etageres.find((e) => e.id === "armory:melee-weapons");
  assert.equal(melee.objets.length, 22, "28 − les 6 armes de jet qui ont déménagé");
  assert.equal(ranged.label, "Ranged Weapons",
    "⭐ LE LIBELLÉ ET LA CLEF DISENT ENFIN LA MÊME CHOSE. Le libellé est tranché depuis le 20/09 ; " +
    "le slug a migré le 23/09 dans `fh-srd/src/shelving.py`, et la couche générée l'a suivi. " +
    "⛔ Le tambour n'affiche plus « Thrown Weapons » sur une étagère qui n'en contenait aucune.");

  /* ⚔️ ET LE CAS D'UN SEUL OBJET RESTE ÉPROUVÉ, sur un inventaire fabriqué —
     plus aucune étagère du catalogue ne le porte, mais un homebrew le recrée. */
  const vue = pageDeListe([{ kind: "gear", view: { id: "x" } }], 0);
  assert.equal(vue.pages, 1, "une page, jamais zéro — « 1/0 » serait un compte impossible");
  assert.equal(vue.objets.length, 1);
});

test("8 — une étagère VIDE tient quand même : une page, aucune case, jamais une division par zéro", () => {
  const vue = pageDeListe([], 0);
  assert.deepEqual([vue.page, vue.pages, vue.objets.length], [0, 1, 0]);
});

test("9 — la page BOUCLE aux deux bouts, et le compte reste dans ses bornes", () => {
  const cent = Array.from({ length: 100 }, (_, i) => i); // 7 pages
  assert.equal(pageDeListe(cent, 0).pages, 7);
  assert.equal(pageDeListe(cent, 7).page, 0, "au-delà de la dernière on revient à la première");
  assert.equal(pageDeListe(cent, -1).page, 6, "en deçà de la première on va à la dernière");
  assert.equal(pageDeListe(cent, 20).page, 20 % 7);
});

/* ══ L'ÉCRAN — CE QUI SE VOIT SANS MISE EN PAGE ══════════════════════════ */

test("10 — l'écran porte DEUX roues, leurs quatre tuners, les deux gouttières et ses DOUZE cases", () => {
  /* 🔄 PORTÉ SUR WARES v2 (lot 219). La loi tient — deux étages, deux gouttières, une grille —
     et DEUX de ses nombres ont été renversés par Eric le 20/09 :

     · QUINZE CASES → DOUZE. *« 5 rangées de 3 tokens, si on a la place »*, puis, la mesure
       faite : *« eh ben 4 rangées alors »*. À cinq rangées l'écran demande 556 blg pour une
       scène qui en offre 500.
     · PAS DE CHEVRON → QUATRE TUNERS. Ce test exigeait leur absence (*« enlève les chevrons du
       haut à côté des tambours »*, 24/08). ⚖️ LA LOI DES DEUX ÂGES TRANCHE : la roue du SAC les
       porte depuis le 18/09 (*« les tuners sont pour la souris »*, et au repos ce sont des
       chevrons qui réclament leurs 44), et Eric a dit le 20/09 *« fonctionnement exactement
       celui de backpack »*. La règle du 18/09 est la plus récente ; elle fait foi.
     ⛔ ET ON NE LES COMPTE PAS EN DOUCE : quatre, deux par étage, sans quoi un étage ne se
     tourne pas à la souris. */
  const node = monterR(ctx());
  assert.equal(rows(node, '[data-ecran="wares"]').length, 1, "on est bien derrière la porte");
  assert.equal(rows(node, ".wares-roue").length, 2, "DEUX étages — le troisième niveau est une grille");
  assert.equal(rows(node, ".wares-tuner").length, 4, "deux tuners par étage, et il y a deux étages");
  /* 🔄 DEPUIS QUE LA DALLE TRAVERSE (21/09), CHAQUE DALLE PORTE SES DEUX GOUTTIÈRES — elles
     voyagent avec elle, donc l'écran en compte deux PAR dalle posée. ⛔ En compter deux sur tout
     l'écran mesurait un écran à une seule dalle : il rendait 12 pour six.
     ⭐ Ce que la loi tient est « deux par dalle », et c'est ce que le garde lit. */
  const dallesQuiPassent = rows(node, ".wares-grille");
  assert.ok(dallesQuiPassent.length >= 1, "⛔ aucune dalle dans la fenêtre");
  for (const d of dallesQuiPassent) {
    assert.equal(rows(d, ".wares-gouttiere").length, 2,
      `⛔ la dalle ${d.dataset.plaque} n'a pas ses deux gouttières : le compte d'objets et le compte de pages`);
  }
  /* ⛔ « DOUZE » EST UN PLAFOND DE PAGE, PAS UN COMPTE DE CASES — et c'est le garde qui me
     l'a appris : la première sous-catégorie de ce montage n'a que TROIS objets, et une page
     courte n'en invente pas. ⭐ Ce que la loi dit est « au plus douze », et le nombre lui-même
     vit au plan : on le LIT, on ne le retape pas. */
  /* 🔄 ET DEPUIS LE VERROU (21/09), L'ÉCRAN PORTE PLUSIEURS PLAQUES À LA FOIS — une par
     sous-catégorie, *« uniquement la première page de chaque dalle »* (Eric). ⛔ Compter les
     cases de TOUT l'écran ne mesure donc plus une page : il rendait 39 pour trois plaques.
     ⭐ Le plafond porte sur UNE plaque, et c'est ce que le garde lit maintenant — chacune
     séparément, pas seulement la courante : une voisine qui déborderait déborderait aussi
     une fois sous le viseur. */
  const plaques = rows(node, ".wares-cases");
  assert.ok(plaques.length >= 1, "⛔ aucune plaque : la piste n'a rien à faire suivre");
  for (const plaque of plaques) {
    const cases = rows(plaque, ".wares-case").length;
    assert.ok(cases > 0 && cases <= PAR_PAGE,
      `⛔ la plaque ${plaque.dataset.plaque} porte ${cases} cases : une page en porte au plus ${PAR_PAGE}`);
  }
  assert.equal(PAR_PAGE, 12, "et le plafond du plan est bien douze");
});

test("10 bis — ⛔ LE TITRE A DÉGAGÉ, ET SA BARRE AVEC — Eric, 23/08, toujours vrai le 20/09", () => {
  /* 🔄 PORTÉ SUR WARES v2 (lot 219), et la loi n'a pas bougé d'un mot : un nom écrit à deux
     endroits finit par diverger ; celui du cran de la roue est le seul qui reste.
     ⭐ ET ERIC L'A REDITE LE 20/09, PLUS LARGEMENT : *« Equipment browser dégage »* — l'écran
     n'a plus de titre du tout, pas seulement l'étagère. Le compte, lui, reste : il compte des
     PAGES, donc il vit avec les chevrons qui les tournent. */
  const node = monterR(ctx());
  assert.equal(rows(node, ".grille-titre").length + rows(node, ".wares-titre").length, 0,
    "plus aucun nœud de titre");
  assert.equal(rows(node, ".grille-barre").length, 0, "et plus de barre horizontale pour le porter");
  assert.equal(node.querySelectorAll("h1").length + node.querySelectorAll("h2").length, 0,
    "⛔ ni titre de rang : le cran sous le viseur NOMME l'écran");
  const compte = node.querySelector('[data-organe="compte-pages"]');
  assert.ok(compte, "le compte de pages est toujours là");
  assert.ok(compte.parentNode.className.includes("wares-gouttiere"),
    "il compte des PAGES, donc il vit avec les chevrons qui les tournent");
});

test("10 ter — 🔴 UNE SEULE PAGE : LA RANGÉE N'EST QUE SES TOKENS — Eric, 26/08", () => {
  /* Eric, 2026-08-26 : *« quand il y a 3 tokens, on n'affiche que 3 tokens,
     pas besoin de flèches »*. Deux flèches qui ne mènent nulle part sont deux
     cibles tactiles de 44 px que le pouce vise pour rien, et les gouttières
     coûtent 96 px de largeur à une rangée qui n'en a que 20 de reste.

     ⛔ ET SURTOUT PAS `display: none` : écrit ainsi d'abord, refusé par le
     garde 4 de `ui-jetons.test.mjs`, qui avait raison — c'est le défaut n°3 du
     dépôt, *« effacer un mot au lieu de recomposer »*. Une flèche masquée garde
     sa place et reste atteignable au clavier. Le garde et Eric disent la même
     chose : la rangée EST ses trois tokens, pas une rangée à cinq places dont
     deux se taisent.

     ⚠️ CE GARDE LIT LA SOURCE, ET IL FAUT DIRE POURQUOI — c'est plus faible
     qu'un clic, et ce n'était pas le premier choix. Conduire la roue au banc
     lève `getBoundingClientRect() sans géométrie déclarée` : le stub REFUSE de
     fabriquer une mise en page, à raison, et la sélection d'étagère est
     couplée au recentrage visuel du cran. Une géométrie inventée ferait passer
     un test qui ne mesurerait rien.
     ⭐ CE QU'IL TIENT QUAND MÊME, ET QUI EST LE VRAI RISQUE : que les DEUX
     écrans qui paginent gardent la MÊME règle. `glisser.mjs` la porte depuis le
     lot A, Équipement depuis aujourd'hui — deux endroits, donc une divergence
     possible. Si l'un des deux perd sa condition, ce test rougit. */
  const equipement = JS;
  const glisse = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "glisser.mjs"), "utf8"));

  assert.match(equipement, /swapContent\(\s*rang\s*,\s*vue\.pages > 1\s*\?/,
    "Équipement recompose sa rangée selon le nombre de pages");
  assert.match(glisse, /if \(vue\.pages > 1\)/,
    "et `glisser.mjs` porte la même condition — une règle, pas deux");

  /* ⛔ ET AUCUN DES DEUX NE CACHE : le garde 4 tient `shell.css`, mais rien ne
     tenait le JS. Un `style.display` posé à la main y passerait sans bruit. */
  for (const [nom, source] of [["equipment-step", equipement], ["glisser", glisse]]) {
    assert.doesNotMatch(source, /style\.display\s*=/,
      `${nom}.mjs efface un mot au lieu de recomposer (défaut n°3)`);
  }
});

/* ══ 🗄️ ARCHIVÉ LE 20/09 — L'ÉTAT D'ATTENTE N'EST PLUS DANS L'ÉCRAN ═══════════════════
   Ce garde tenait le croquis du 23/08 : au rendu, la roue du bas montrait ☆ ☉ ☾ et la grille
   des dos de carte de tarot, tant qu'aucune étagère n'était choisie.
   ⛔ LA DICTÉE D'ERIC DU 20/09 NE LE REPREND PAS. Wares v2 s'ouvre sur un choix : première
   catégorie, première sous-catégorie, première page — il n'y a plus d'instant où l'écran ne
   sait pas quoi montrer, donc plus rien à masquer.
   ⚖️ LOI DES DEUX ÂGES : rien ne se supprime, une règle périmée est ARCHIVÉE — elle porte
   l'incident qui l'a fait naître, et cet incident se repaie si on l'oublie. Ce qu'elle avait
   coûté : cinq passes en un jour pour trouver le bon MOMENT du masquage, et un défaut vu au
   téléphone (*« j'ai bougé, la 2ᵉ et la 3ᵉ montrent des items — pas normal »*).
   ⏳ SI L'ATTENTE REVIENT — par exemple le jour où une sous-catégorie se charge lentement —
   c'est CE texte qu'on relit avant d'en réécrire une. */

/* ══ 🗄️ ARCHIVÉ LE 20/09 — LA ROUE NE BOUCLE PLUS, DONC ELLE NE SE RÉPÈTE PLUS ═════════
   Ce garde tenait la parade de l'anneau infini : peindre la liste TROIS fois et répéter
   jusqu'à douze crans par bloc, pour que la couture ne tire pas à chaque geste (7 rayons →
   42 crans). Eric l'avait entendu avant de le voir : *« la roue A bien fluide, la roue B pas
   bien, ça clignote »*, à code identique.
   🔴 ABROGÉ PAR ERIC, DEUX FOIS ET EXPLICITEMENT : le 19/09 pour le sac (*« que ça tourne à
   l'infini n'aide pas ; autorise l'absence de tuiles à droite et à gauche »*), puis le 20/09
   pour Wares (*« ça ne tourne plus à l'infini »* · *« les tambours ne sont plus à l'infini
   bien sûr »*).
   ⭐ CE QUI DISPARAÎT AVEC LA BOUCLE : les copies, la téléportation à l'arrêt, le tour du
   milieu, et le remarquage de la tuile jumelle. Un anneau n'a pas de bout, donc il ne pouvait
   dire ni « tu es au début » ni « tu es à la fin » — et c'est exactement ce qu'Eric veut voir :
   du VIDE au bout de la liste. 📏 L'ancienne roue de Wares en portait DOUZE copies dans le DOM.
   ⚖️ Le garde qui tient la règle neuve vit désormais dans `roue-tambour.test.mjs` n° 1 et
   `wares-ecran.test.mjs` n° 4 : « trois crans, trois nœuds ». */

test("13 — un cran annonce son état, ⛔ JAMAIS par `aria-pressed` (ce n'est pas une bascule)", () => {
  /* 🔄 PORTÉ SUR WARES v2 (lot 219). ⭐ CE QUE LA LOI INTERDIT N'A PAS BOUGÉ D'UN MOT :
     `aria-pressed` dirait « bouton à bascule » à un lecteur d'écran, et un cran n'en est pas un.
     ⚖️ CE QUI CHANGE EST LA FORME DE L'ANNONCE, ET C'EST LE SAC QUI LA POSE : ses crans sont des
     `role="tab"` qui portent `aria-selected`. Eric, 20/09 : *« fonctionnement exactement celui
     de backpack »* — la forme suit. ⛔ Les deux annoncent ; une seule ment, et c'est celle-là
     qui reste interdite.
     ⛔ ET LE GARDE EXIGE QU'UNE ANNONCE EXISTE : se contenter d'interdire `aria-pressed`
     laisserait passer un cran parfaitement MUET, ce qui est pire. */
  const node = monterR(ctx());
  const crans = rows(node, ".wares-cran").filter((c) => c.tagName === "BUTTON");
  assert.ok(crans.length > 0, "témoin : il y a bien des crans à lire");
  for (const cran of crans) {
    assert.equal(cran.getAttribute("aria-pressed"), null,
      "`aria-pressed` dirait « bouton à bascule » à un lecteur d'écran — un cran n'en est pas un");
    assert.ok(cran.hasAttribute("aria-selected") || cran.hasAttribute("aria-current"),
      "⛔ un cran muet : il faut que son état se DISE, par l'une ou l'autre forme");
  }
  /* ⛔ UN CHOISI PAR ÉTAGE, ET LE GARDE DOIT COMPTER PAR ÉTAGE — ma première écriture comptait
     sur les DEUX roues et trouvait deux, ce qui est juste et ne prouve rien. ⭐ Deux organes qui
     se ressemblent se comptent séparément, sinon le total masque le détail. */
  for (const roue of rows(node, ".wares-roue")) {
    const choisis = [...roue.querySelectorAll('.wares-cran[aria-selected="true"]')];
    assert.equal(choisis.length, 1,
      `⛔ ${choisis.length} crans choisis sur l'étage « ${roue.dataset.organe} » — il en faut UN`);
  }
});

test("13 bis — 🔧 DETTE SOLDÉE : le courant s'ANNONCE une fois, et s'ALLUME sur toutes ses copies", () => {
  /* ⛔ MESURÉ PAR LE LOT 94 ET LAISSÉ EXPRÈS pour ne pas faire de conflit :
     `troisTours` répète la liste, et `aria-current="true"` était posé sur
     CHAQUE copie du cran courant — 9 sur la roue A. Un lecteur d'écran
     annonçait neuf fois « courant ».
     ⭐ ET LA CORRECTION NAÏVE AURAIT CASSÉ LE VISUEL : c'est `aria-current` que
     le CSS coiffait. Les deux rôles sont donc séparés — `data-courant` allume
     (toutes les copies : l'œil suit une roue qui tourne), `aria-current`
     annonce (une seule).

     ⚠️ ÉPROUVÉ SUR LA FONCTION, PAS SUR L'ÉCRAN, et ce n'est pas un repli :
     l'état « courant » ne s'atteint qu'en TOURNANT la roue, et
     `scroll-snap: mandatory` rend ce geste intestable par script (limite
     connue, écrite au logbook). Une piste fabriquée éprouve l'invariant
     lui-même — même patron que `deriveGenres`, éprouvé sur un inventaire
     fabriqué plutôt que sur le dépôt du voisin. */
  const piste = document.createElement("div");
  /* NEUF copies de trois rangs — la vraie forme de la roue A. */
  for (let tour = 0; tour < 3; tour += 1) {
    for (const rang of [0, 1, 2]) {
      const cran = document.createElement("button");
      cran.dataset.rang = String(rang);
      cran.dataset.courant = rang === 1 ? "true" : "false";
      piste.appendChild(cran);
    }
  }
  annoncerCourant(piste);

  const crans = piste.querySelectorAll("button");
  const allumes = crans.filter((c) => c.dataset.courant === "true");
  const annonces = crans.filter((c) => c.getAttribute("aria-current") === "true");
  assert.equal(allumes.length, 3, "témoin : le cran courant est bien répété — c'est la condition du défaut");
  assert.equal(annonces.length, 1, "UNE SEULE annonce, quel que soit le nombre de copies");
  assert.equal(annonces[0].dataset.courant, "true", "la copie annoncée est bien une copie allumée");
  assert.equal(crans.every((c) => c.hasAttribute("aria-current")), true,
    "les autres portent `false` plutôt que rien : on voit qu'on a répondu, pas qu'on a oublié");
});

/* ══ 🗄️ ARCHIVÉ LE 20/09 — IL TENAIT L'ÉTAT D'ATTENTE, QUI N'EXISTE PLUS ═══════════════
   Ce garde disait : au rendu, aucun cran n'est `aria-current`, parce que le joueur n'a rien
   touché et qu'un choix annoncé sans choix est un mensonge au lecteur d'écran.
   ⛔ IL TOMBE AVEC SON SUJET (voir l'archive du n° 11) : Wares v2 s'ouvre sur un choix réel —
   première catégorie, première sous-catégorie — et l'annoncer est alors la VÉRITÉ.
   ⭐ LA MOITIÉ QUI SURVIT EST DANS LE N° 13 : ⛔ jamais `aria-pressed`. Elle, rien ne l'abroge. */

test("14 — ⛔ LA LIGNE DE PROFONDEUR A QUITTÉ L'ÉCRAN, et elle ne peut pas y revenir", () => {
  /* 🔴 RENVERSÉ LE 2026-08-23, ET C'EST ERIC QUI L'A RENVERSÉ. Ce test gardait
     l'inverse : « la ligne existe ». Le §6 avait raison sur le BESOIN — savoir
     si l'on juge la roue ou son ombre — et tort sur la PLACE : c'est de
     l'anglais de développeur dans un écran que le joueur regarde, et 15,5 px
     dans une carte de 440. Eric l'a montrée trois fois : *« enlève ça »*.
     ⭐ LE BESOIN N'EST PAS ABANDONNÉ, IL DÉMÉNAGE : `profondeurAccordee` est
     exportée, et le BANC (`ecran-r.html`) l'affiche dans son relevé. On lit la
     réponse là où l'on regarde l'écran, pas dedans.
     ⛔ Et ce garde mord dans les deux sens : il tient la ligne hors de l'écran,
     ET il vérifie que la fonction qui la produit est toujours joignable — la
     retirer pour de bon serait perdre le §6, pas le déplacer. */
  const node = monterR(ctx());
  assert.equal(rows(node, ".drum-profondeur").length, 0,
    "l'écran du joueur ne porte aucune ligne de diagnostic");
  assert.equal(typeof profondeurAccordee, "function",
    "témoin : la mesure du §6 reste joignable, c'est le banc qui la lit");
  assert.equal(typeof profondeurAccordee(), "boolean");
});
test("15 — poser un objet et ouvrir son texte restent les DEUX seuls actes qui parlent à la coquille", () => {
  /* ⭐ LE CŒUR DU LOT : `shell.mjs` répond à toute action par un `refresh()`
     qui reconstruit la carte entière. Un cran franchi qui dispatcherait ferait
     donc DÉMONTER LA ROUE AU MILIEU DU GESTE. Le tambour se met à jour
     lui-même ; il ne parle à la coquille que pour les gestes du joueur. */
  const calls = [];
  const node = monterR(ctx(), (a) => calls.push(a));
  assert.equal(calls.length, 0, "monter le tambour ne dispatche RIEN");

  for (const fleche of rows(node, ".roue-fleche")) fleche.click();
  for (const fleche of rows(node, ".grille-fleche")) fleche.click();
  assert.equal(calls.length, 0,
    "et tourner une roue ou une page non plus — sinon la coquille démonterait l'écran sous le doigt");
});

test("16 — ⚔️ ATTAQUE : un objet magique n'a NI PRIX NI POIDS, et l'écran n'en invente aucun", () => {
  /* 🔄 PORTÉ SUR WARES v2 (lot 219), et la loi en sort RENFORCÉE. 258 records du corpus n'ont
     ni `cost` ni `weight` ; l'écran ne doit ni planter, ni inventer un « 0 gp » qui mentirait.
     ⭐ ET ERIC A FERMÉ LA PORTE PLUS LOIN LE 20/09 : *« les jetons EXACTEMENT la même règle que
     dans les menus Gear/Backpack »* — donc AUCUN prix sur un jeton, jamais, même quand le
     record en porte un. Il n'y a plus d'endroit où un prix inventé POURRAIT paraître.
     ⭐ Le témoin sur le corpus reste, et c'est lui qui donne son sens au reste : sans lui, ce
     test passerait aussi sur un catalogue vide. */
  const sansPrix = query({ kind: "item" }).filter((v) => v.record.data.cost === undefined);
  assert.equal(sansPrix.length, 258, "témoin : c'est bien le corpus entier qui est sans prix");
  const node = monterR(ctx());
  assert.equal(rows(node, ".equipment-item-meta").length, 0,
    "aucune ligne de méta : la case ne porte que le NOM");
  const cases = rows(node, ".wares-jeton");
  assert.ok(cases.length > 0, "témoin : la grille porte bien des jetons");
  for (const c of cases) {
    assert.ok(!/\d\s*(gp|sp|cp|lb)/i.test(c.textContent),
      `⛔ un prix ou un poids sur le jeton « ${c.textContent.trim()} » — ils vivent sur la fiche`);
  }
});
/* ══ LES HUIT PIÈGES PAYÉS, GARDÉS SUR LES OCTETS DE LA FEUILLE ═══════════
   ⭐ LEUR SIGNATURE COMMUNE : aucun ne fait rougir un test de comportement.
   Ils se voient à l'oeil, sur l'appareil, et ils ont coûté une journée. Un
   garde d'octets est ce qu'on peut leur opposer — il ne prouve pas que la roue
   est belle, il prouve qu'on n'a pas re-supprimé la parade. */

/** Le corps d'un bloc CSS, pour ne juger que le sélecteur visé. */
function bloc(selecteur) {
  const i = CSS.indexOf(selecteur + " {");
  assert.notEqual(i, -1, `le sélecteur « ${selecteur} » doit exister dans shell.css`);
  return CSS.slice(i, CSS.indexOf("\n}", i));
}

test("piège 1 — la perspective est sur la PISTE, le parent DIRECT des crans", () => {
  /* Une passe de réglage entière perdue : déclarée un niveau trop haut, elle ne
     descend pas jusqu'aux crans (`getComputedStyle` rendait `none`), et Eric
     réglait une courbure dont il ne voyait que l'échelle. */
  assert.match(bloc(".roue-piste"), /perspective:\s*var\(--roue-fuite\)/);
  assert.doesNotMatch(bloc(".equipment-drum"), /^\s*perspective:/m,
    "elle ne doit PAS être posée sur le conteneur : elle n'atteindrait jamais les crans");
});

test("piège 2 — `scroll-snap-stop: always` n'est revenu nulle part", () => {
  assert.doesNotMatch(CSS, /scroll-snap-stop/,
    "c'est LUI qui empêchait la roue de rouler : un geste ample n'avançait que d'un cran et calait");
});

test("piège 3 — la couture rend la main dans une AUTRE tâche (attribut, pas style en ligne)", () => {
  assert.match(CSS, /\.roue-piste\[data-couture="oui"\]/,
    "couper l'aimantation passe par un attribut — le garde 7 interdit `.style` dans ui/");
  assert.match(bloc('.roue-piste[data-couture="oui"]'), /scroll-snap-type:\s*none/);
  assert.match(bloc('.roue-piste[data-couture="oui"]'), /scroll-behavior:\s*auto/);
});

test("piège 5 — `min-width: 0` sur le cran, et `max-width: none`", () => {
  /* Avec `auto`, un item flex refuse de descendre sous son mot le plus long :
     120 px là où ses voisins font 114, à `flex-basis` IDENTIQUE. Deux étagères
     sur trois obéissent — c'est ce qui rend le défaut presque invisible. */
  assert.match(bloc(".roue-cran"), /min-width:\s*0/);
  assert.match(bloc(".roue-cran"), /max-width:\s*none/);
});

test("piège 6 — `box-sizing: border-box` explicite sur le cran, et sa hauteur est FIXE", () => {
  assert.match(bloc(".roue-cran"), /box-sizing:\s*border-box/);
  assert.match(bloc(".roue-cran"), /height:\s*var\(--roue-cran-h\)/,
    "une roue dont les crans changent de hauteur n'est pas une roue — et tout ce qui vit dessous sautait");
});

test("piège 7 — 🔧 LE FONDU EST UN RAPPORT AU PAS, et la piste fait TROIS crans, sans cran de marge", () => {
  /* Amendement du 2026-08-23, corrigé le 24. Le masque en POURCENTAGE DE LA
     PISTE a coûté une passe : plus la piste s'élargissait, plus il rongeait de
     crans, et Eric réglait « 7 » pour en voir 5. ⛔ Et pas de cran de marge :
     il en ferait voir QUATRE.
     ⭐ MAIS `10px` FIGÉ N'ÉTAIT PAS LA RÉPONSE NON PLUS, et c'est la dette que
     le lot 95 solde : depuis que le pas est borné par `min()`, il tombe à 73,8
     sur un téléphone — 10 px y rongent 13,5 % du cran contre 8,3 % à 121. Le
     fondu grossissait à mesure que le cran maigrissait. `pas / 12.1` vaut 10 px
     À L'IDENTIQUE là où la place existe, et suit le cran ailleurs.
     🔴 Un pourcentage DE LA PISTE et un rapport AU PAS ne sont pas la même
     grandeur : le premier suit l'écran, le second suit une valeur BORNÉE. */
  assert.match(bloc(".equipment-drum"), /--roue-fondu:\s*calc\(var\(--roue-pas\) \/ 12\.1\)/,
    "le fondu est un rapport au pas, comme --roue-ecart — jamais un pixel figé dans une roue fluide");
  assert.match(bloc(".equipment-drum"), /--roue-champ:\s*calc\(3 \* var\(--roue-pas\) - var\(--roue-ecart\)\)/,
    "trois pas moins un écart — trois crans exactement, jamais 4 ni 5");
  /* 🔴 MESURÉ AU NAVIGATEUR : à 375 px, trois crans de 117 plus deux flèches de
     44 demandent 455 px là où la carte en offre 327 — la piste rendait 229 px,
     soit MOINS DE DEUX crans. Le pas se BORNE donc à 121 au lieu de s'y fixer :
     121 partout où la place existe (l'iPad d'Eric), moins quand elle manque. */
  assert.match(bloc(".equipment-drum"), /--roue-pas:\s*min\(var\(--roue-pas-max\),/,
    "le pas est BORNÉ, pas fixé — sinon « trois crans visibles » se perd sur un téléphone");
  assert.match(bloc(".equipment-drum"), /--roue-pas-max:\s*121px/, "et sa borne est la cote ratifiée du 22/08");
  assert.match(bloc(".equipment-drum"), /--roue-ecart:\s*calc\(var\(--roue-pas\) \/ 30\.25\)/,
    "l'écart est un RAPPORT au pas — c'est ce qui garde `d max = ±1,96694 pas` vrai à toutes les largeurs");
  const masque = bloc(".roue-piste");
  assert.match(masque, /mask-image:[^;]*#000 var\(--roue-fondu\)/);
  assert.match(masque, /mask-image:[^;]*#000 calc\(100% - var\(--roue-fondu\)\)/);
  /* ⚠️ ON VISE L'ARRÊT DE COULEUR, PAS N'IMPORTE QUEL POURCENTAGE : le
     `calc(100% - …)` légitime en contient un, et un garde qui l'interdirait
     crierait au loup sur la bonne écriture. Ce qu'on refuse, c'est `#000 22%`. */
  assert.doesNotMatch(masque, /#000\s+\d+%/,
    "un fondu en POURCENTAGE ronge d'autant plus de crans que la piste est large");
});

test("piège 8 — §6 : aucun `will-change` sur les crans, et AUCUNE transformation écrite par image", () => {
  assert.doesNotMatch(bloc(".roue-cran"), /will-change/,
    "il fige la rasterisation : un cran qui change d'échelle voit sa TEXTURE étirée au lieu d'être redessinée — c'est ce qui « frise »");
  /* Même dépouilleur que le garde 7 lui-même : ce qui est jugé, c'est du code. */
  assert.doesNotMatch(JS, /\.style\s*(\.\w+|\[)/,
    "le défilement est composité sur un thread séparé : du JS qui repeint les transformations est DÉSYNCHRONISÉ, pas lent");
});

test("piège 9 — 🔴 l'animation est SOUS `@supports`, sinon la dégradation est PIRE que l'absence", () => {
  /* Sans le `@supports`, un navigateur qui ignore `animation-timeline` garde
     quand même l'animation — sur la timeline du document, en 0s, avec
     `fill: both` : tous les crans se figeraient sur la DERNIÈRE image, à
     +33,5°. Une roue cassée au lieu d'une roue plate. */
  const i = CSS.indexOf("@supports (animation-timeline: view())");
  assert.notEqual(i, -1, "les déclarations d'animation doivent être gardées par leur `@supports`");
  const fin = CSS.indexOf("\n}", CSS.indexOf("\n  }", i));
  const dedans = CSS.slice(i, fin);
  assert.match(dedans, /animation-timeline:\s*view\(inline\)/);
  assert.match(dedans, /animation-name:\s*fhpc-roue/);
  assert.match(dedans, /animation-duration:\s*auto/,
    "sans `auto`, la durée retombe à 0s et l'animation se joue d'un coup au lieu de suivre le défilement");
  /* Le garde doit tenir des DEUX côtés : une seule déclaration de cette
     animation dans tout le fichier, et elle est dans le `@supports`. */
  assert.equal((CSS.match(/animation-name:\s*fhpc-roue/g) || []).length, 1,
    "aucune déclaration de cette animation ne doit vivre HORS du `@supports`");
});

test("garde — les 51 crans de l'animation REDONNENT la formule du cylindre, au millième", () => {
  /* ⭐ CE QUE CE GARDE PROTÈGE : les valeurs d'Eric (courbure 3,36 · angle max
     61° · fuite 12,9), trouvées AU POUCE en cinq passes. Écrites à la main dans
     51 blocs, elles peuvent dériver d'un chiffre sans que rien ne le voie.
     ⭐ ET LES 2 % COMPTENT : à 5 %, l'interpolation LINÉAIRE entre deux points
     coupe la sinusoïde en segments droits, et ça se voit (le « frisage »). */
  const CRAN = 117, ECART = 4, PAS = CRAN + ECART;
  const D_MAX = (3 * CRAN + 2 * ECART + CRAN) / 2;   // ±238 px
  const COURBURE = 3.36;
  const ANGLE_MAX = 61 * Math.PI / 180;

  const debut = CSS.indexOf("@keyframes fhpc-roue {");
  assert.notEqual(debut, -1);
  const corps = CSS.slice(debut, CSS.indexOf("\n}", debut));
  const crans = [...corps.matchAll(
    /(\d+)% \{ transform: translateX\(calc\((-?[\d.]+) \* var\(--roue-pas\)\)\) translateZ\(calc\((-?[\d.]+) \* var\(--roue-pas\)\)\) rotateY\((-?[\d.]+)deg\); \}/g
  )];
  assert.equal(crans.length, 51, "51 images, une tous les 2 % — pas une de moins");

  let borneMordue = 0;
  for (const [, pct, correction, z, deg] of crans) {
    const p = Number(pct) / 100;
    const d = D_MAX * (1 - 2 * p) / PAS;
    const brut = d / COURBURE;
    if (Math.abs(brut) > ANGLE_MAX) borneMordue += 1;
    const theta = Math.max(-ANGLE_MAX, Math.min(ANGLE_MAX, brut));
    assert.ok(Math.abs(Number(correction) - (COURBURE * Math.sin(theta) - d)) < 1e-4,
      `${pct}% : la correction x − d a dérivé`);
    assert.ok(Math.abs(Number(z) - COURBURE * (Math.cos(theta) - 1)) < 1e-4, `${pct}% : la profondeur a dérivé`);
    assert.ok(Math.abs(Number(deg) - (-theta * 180 / Math.PI)) < 1e-3, `${pct}% : l'angle a dérivé`);
  }
  assert.equal(crans[25][1], "50", "témoin : le point du milieu existe");
  assert.equal(Number(crans[25][4]), 0, "et le cran sous le viseur n'est ni tourné ni reculé — sinon il ne se lit plus");
  assert.equal(borneMordue, 0,
    "MESURE : dans une fenêtre de trois crans, θ ne monte qu'à 33,5° — la borne de 61° n'est JAMAIS atteinte");
});

test("garde — la grille NE TOURNE PAS : ni perspective, ni aimantation, ni timeline", () => {
  /* ⛔ On n'étend pas la mécanique de la roue à un objet qui PAGINE. Et surtout :
     la grille n'a PAS DE VISEUR, ce qui est sa raison d'être — la règle d'Eric
     « le joueur aurait acheté l'objet devant lequel il s'est arrêté » doit
     rester impossible. */
  const g = bloc(".grille-cases");
  for (const interdit of [/perspective/, /scroll-snap/, /animation-timeline/]) {
    assert.doesNotMatch(g, interdit, `la grille ne doit porter aucune mécanique de roue — ${interdit}`);
  }
  assert.match(g, /grid-template-columns:\s*repeat\(3,/);
  assert.match(g, /grid-template-rows:\s*repeat\(5, var\(--fhpc-case-h\)\)/,
    "cinq rangées IMPOSÉES : une dernière page de 7 objets ne doit pas faire remonter tout ce qui vit dessous");
});

test("garde — la taille d'une case vit à UN seul endroit, et son contenu à un autre", () => {
  /* ⏳ Eric n'a pas tranché « la case porte le NOM ou une IMAGE », et c'est ce
     qui décide de la cote. Le jour où il tranche : deux endroits, pas quinze. */
  assert.equal((CSS.match(/--fhpc-case-h:/g) || []).length, 1,
    "une seule déclaration de la cote — sinon « on change deux endroits » devient un voeu");
  assert.equal((JS.match(/function contenuDeCase\(/g) || []).length, 1);
});
