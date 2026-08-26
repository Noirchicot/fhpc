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

/* ⭐ DEPUIS L'INVERSION DU 24/08 (mandat d'Eric), l'étape OUVRE SUR B3 — le
   dressing. Ces suites regardent le CATALOGUE : on y entre comme le joueur,
   par le bouton Equipment de la barre B3. L'état de vue persiste entre les
   rendus (c'est le produit), le clic est donc conditionnel. */
function monterR(ctx, onAction) {
  const node = renderEquipmentStep(ctx, onAction || (() => {}));
  const porte = node.querySelector('[aria-label="Equipment"]');
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
    ["adventuring", "arcana", "battlefield", "crafting", "marvels", "mundane"],
    "les rayons sont ceux de `shelving.aisle`, en ordre alphabétique");
  /* ⛔ ET AUCUN GENRE N'Y SURVIT : le défaut se reconnaît à ces quatre mots. */
  for (const genre of ["armor", "gear", "item", "weapon"]) {
    assert.equal(arbre.some((r) => r.id === genre), false,
      `« ${genre} » est un GENRE DE DONNÉES — sa présence au premier niveau EST le défaut du lot 95`);
  }
});

test("2 — 🔴 LE CRITÈRE D'ERIC : aucune étagère au-dessus de 35", () => {
  /* Eric, 2026-08-24, mot pour mot : « l'organisation de l'équipement permet
     toujours d'arriver à MOINS DE 35 ITEMS SUR LA DERNIÈRE CATÉGORIE, c'est
     l'idée ». ⭐ Les rayons ne sont pas une classification pour elle-même : ils
     existent pour qu'au bout de la descente le joueur tombe sur une étagère
     qu'il peut EMBRASSER. C'est le seul chiffre qui dit si ce lot a réussi.
     ⛔ 35 est une CIBLE DE DÉCOUPAGE, jamais un plafond de donnée : si un jour
     une étagère déborde, c'est le DÉCOUPAGE qu'on refait, jamais la donnée
     qu'on refuse — et la pagination, elle, n'a pas de plafond (test 9). */
  const arbre = rayonsEtEtageres(query);
  const toutes = arbre.flatMap((r) => r.etageres.map((e) => ({ nom: `${r.label} › ${e.label}`, n: e.objets.length })));
  const debordent = toutes.filter((e) => e.n >= 35);
  assert.deepEqual(debordent, [], "une étagère à 35 ou plus a raté l'unique raison d'être des rayons");
  const plusGrosse = toutes.reduce((a, b) => (b.n > a.n ? b : a));
  assert.equal(plusGrosse.n, 33, `mesuré le 2026-08-24 : la plus grosse est ${plusGrosse.nom}`);
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

test("5 — 🔴 LES 416 RANGEMENTS SONT LUS, ET LES DEUX ÉCARTÉS SONT NOMMÉS", () => {
  /* ⚠️ LE TOTAL N'EST PAS 416, ET C'EST CORRECT — un total juste ne dirait
     rien du contenu, celui-ci dit quelque chose en NE tombant PAS juste.
     `srfh` est construite sur le SRD seul ; deux de ses records rangent
     `gaming-set` et `musical-instrument`, que la couche `fh-skills-en`
     DÉSACTIVE (`op: disable`) pour les remplacer par sept outils plus fins.
     Un objet rangé qui n'existe plus dans la pile montée ne s'affiche pas —
     et il est COMPTÉ, jamais avalé. */
  assert.equal(RANGEMENT.lus, 416, "les 416 records de rangement sont bien lus");
  assert.equal(RANGEMENT.orphelins.length, 0, "aucun rangement sans rayon ni étagère");
  assert.deepEqual(RANGEMENT.introuvables.map((x) => x.extends).sort(),
    ["srd:tool:en:gaming-set", "srd:tool:en:musical-instrument"],
    "les deux seuls écartés, nommés : `fh-skills-en` les désactive");

  const arbre = rayonsEtEtageres(query);
  const total = arbre.reduce((t, r) => t + r.etageres.reduce((s, e) => s + e.objets.length, 0), 0);
  assert.equal(total, 414, "416 rangements − 2 records désactivés par une couche du dessus");
  const ids = new Set();
  for (const r of arbre) for (const e of r.etageres) for (const o of e.objets) ids.add(o.view.id);
  assert.equal(ids.size, 414, "et chaque objet n'est rangé que sur UNE étagère");
});

test("5 bis — ⭐ LES OUTILS SONT ENTRÉS, et les 14 outils Fate's Hand sont NOMMÉS comme non rangés", () => {
  /* AVANT CE LOT, ZÉRO OUTIL ÉTAIT VISIBLE : `EQUIPMENT_RECORD_KINDS` nommait
     quatre genres et `tool` n'en faisait pas partie. Les 25 outils du SRD
     étaient rangés depuis le lot 90 et invisibles depuis toujours.
     🔴 ET LE COMPTE RESTANT EST UNE DETTE, PAS UN SUCCÈS : `fh-skills-en`
     AJOUTE 14 outils Fate's Hand (jeux, instruments, véhicules, montures,
     Soulforging) que `srfh` n'a jamais vus — elle est construite sur le SRD
     seul. Ils n'ont AUCUNE étagère, donc ils n'apparaissent nulle part.
     ⛔ Ce test les nomme pour qu'un ajout futur casse ici au lieu de
     disparaître en silence : c'est la faute d'`item-value`, refusée d'avance. */
  const arbre = rayonsEtEtageres(query);
  const outils = arbre.find((r) => r.id === "crafting").etageres.find((e) => e.id === "crafting:tools");
  assert.equal(outils.objets.length, 23, "25 outils SRD − les 2 que `fh-skills-en` désactive");

  const ranges = new Set(query({ kind: "shelving" })
    .filter((v) => v.record.data.of_kind === "tool").map((v) => v.record.data.extends));
  const sansEtagere = query({ kind: "tool" }).map((v) => v.id).filter((id) => !ranges.has(id)).sort();
  assert.deepEqual(sansEtagere, [
    "fh:tool:en:gaming-set-cards", "fh:tool:en:gaming-set-dice",
    "fh:tool:en:gaming-set-dragonchess", "fh:tool:en:gaming-set-three-dragon",
    "fh:tool:en:instrument-other", "fh:tool:en:instrument-strings", "fh:tool:en:instrument-wind",
    "fh:tool:en:mount-air", "fh:tool:en:mount-land", "fh:tool:en:mount-water",
    "fh:tool:en:soulforging",
    "fh:tool:en:vehicles-air", "fh:tool:en:vehicles-land", "fh:tool:en:vehicles-water"
  ], "⏳ DETTE OUVERTE — 14 outils Fate's Hand sans étagère : le rangement d'Eric ne couvre que le SRD");
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
     des records. Trois rayons/étagères manquent aujourd'hui à l'appel —
     `companions › familiars`, `companions › henchmen`, `crafting › gems`,
     `crafting › ingredients` : tous à zéro, tous invisibles. */
  const arbre = rayonsEtEtageres(query);
  assert.equal(arbre.length, 6, "six rayons PEUPLÉS — c'est tout ce que l'export porte");
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

test("7 — 🔴 LE CAS DÉGÉNÉRÉ, ET IL EST RÉEL : `projectiles` ne porte QU'UN objet", () => {
  const arbre = rayonsEtEtageres(query);
  const minuscule = arbre.find((r) => r.id === "battlefield").etageres.find((e) => e.id === "battlefield:projectiles");
  assert.equal(minuscule.objets.length, 1, "témoin : une étagère à un seul objet existe vraiment dans les données");
  const vue = pageDeListe(minuscule.objets, 0);
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

test("10 — l'écran porte les deux roues SANS chevron-bouton, les deux gouttières de la grille et ses quinze cases", () => {
  const node = monterR(ctx());
  assert.equal(rows(node, ".equipment-drum").length, 1);
  assert.equal(rows(node, ".roue").length, 2, "DEUX étages — le troisième niveau est une grille, plus une roue");
  /* 🔴 ZÉRO CHEVRON SUR LE TAMBOUR, ET C'EST UN GARDE, PAS UN TROU — Eric,
     2026-08-24 : *« enlève les chevrons du haut à côté des tambours, ça fait
     trop moche »*. Deuxième fois qu'il les retire (déjà le 15/08) : ce test
     exigeait « une paire par étage », il exige maintenant l'inverse, pour
     qu'un lot suivant ne les rapporte pas sans qu'on le sache.
     ⭐ Et la souris n'est pas prise au piège : un cran est cliquable, `viser`
     le ramène sous le viseur — l'affordance est le CONTENU, pas un bouton à
     côté. Le trait posé à l'intérieur du bord l'annonce (`.roue::before/after`,
     `pointer-events: none` pour qu'il montre sans recevoir). */
  assert.equal(rows(node, ".roue-fleche").length, 0, "les chevrons-boutons ont dégagé, et ne reviennent pas");
  assert.match(CSS, /\.roue::before[^{]*\{[^}]*pointer-events:\s*none/s,
    "le chevron dessiné laisse passer le clic vers le cran qu'il désigne");
  assert.equal(rows(node, ".grille-rang").length, 1, "la grille et ses deux gouttières sur UNE rangée");
  assert.equal(rows(node, ".grille-gouttiere").length, 2, "une gouttière de chaque côté des jetons");
  assert.equal(rows(node, ".grille-fleche").length, 2);
  /* 🔴 DEUX CHIFFRES DEPUIS LE 2026-08-23, UN PAR GOUTTIÈRE — et ce n'est pas
     un doublon. Eric a fait dégager les comptes collés aux crans de la roue
     (*« les chiffres tout moches »*) puis les a fait revenir ailleurs :
     *« mets le compte des items sous le chevron gauche »*.
     ⭐ ILS NE DISENT PAS LA MÊME CHOSE, et c'est ce que ce garde tient : à
     gauche COMBIEN IL Y EN A dans l'étagère, à droite OÙ L'ON EST dans les
     pages. Un seul des deux, et l'écran perd une des deux questions. */
  const chiffres = rows(node, ".grille-compte");
  assert.equal(chiffres.length, 2, "un compte par gouttière : le total à gauche, la page à droite");
  const gouttieres = rows(node, ".grille-gouttiere");
  assert.equal(gouttieres[0].querySelectorAll(".grille-compte").length, 1,
    "le total vit sous le chevron GAUCHE");
  assert.equal(gouttieres[1].querySelectorAll(".grille-compte").length, 1,
    "la page vit sous le chevron DROIT");
  /* ⛔ AU MONTAGE LES DEUX SONT ÉTEINTS ENSEMBLE : la grille est en attente
     (test 11), donc aucun des deux ne décrit ce qu'on voit. Un total qui
     survivrait au tiret des pages parlerait d'une étagère qui n'est pas là. */
  assert.equal(chiffres[0].textContent, "—");
  assert.equal(chiffres[1].textContent, "—");
  assert.equal(rows(node, ".grille-case").length, LISTE_PAR_PAGE, "quinze cases — 5 lignes × 3 colonnes");
});

test("10 bis — ⛔ LE TITRE DE L'ÉTAGÈRE A DÉGAGÉ, ET SA BARRE AVEC — Eric, 23/08", () => {
  /* *« le titre n'a pas lieu d'être, il est porté par le rouleau »*. Un nom
     écrit à deux endroits est un nom qui finit par diverger : celui du cran de
     la roue est le seul qui reste. 📏 Et la barre pesait 52 px dans une carte
     qui en cherchait 12 — la coupe n'est pas cosmétique. */
  const node = monterR(ctx());
  assert.equal(rows(node, ".grille-titre").length, 0, "plus aucun nœud de titre");
  assert.equal(rows(node, ".grille-barre").length, 0, "et plus de barre horizontale pour le porter");

  /* ⭐ MAIS LE COMPTE RESTE, et il est DANS une gouttière : Eric n'a retiré que
     le titre — décider que le compte part avec aurait été décider à sa place. */
  const compte = rows(node, ".grille-compte")[0];
  assert.ok(compte, "le compte de pages est toujours là");
  assert.equal(compte.parentNode.className, "grille-gouttiere",
    "il compte des PAGES, donc il vit avec les flèches qui les tournent");
});

test("10 ter — les crans de la roue restent les SEULS porteurs du nom d'une étagère", () => {
  /* Le garde qui rend « il est porté par le rouleau » vérifiable : si un lot
     réintroduisait un titre ailleurs, ce compte bougerait. */
  const node = monterR(ctx());
  const crans = rows(node, ".roue-piste")[1].querySelectorAll(".roue-cran");
  assert.ok(crans.length > 0, "l'étage du bas porte bien des crans");
});

test("11 — L'ÉTAT DE DÉPART DU CROQUIS : rayons remplis, étagères ☆ ☉ ☾, grille FACE CACHÉE", () => {
  const node = monterR(ctx());
  const pistes = rows(node, ".roue-piste");
  assert.equal(pistes[0].dataset.attente, undefined, "la ligne du HAUT est remplie dès l'ouverture");
  assert.equal(pistes[1].dataset.attente, "oui", "la ligne du BAS attend");
  assert.equal(rows(node, ".grille-cases")[0].dataset.attente, "oui", "et la grille attend aussi (nouveau le 23/08)");

  /* 🔴 LES ☆ ☉ ☾ RESTENT SUR LA ROUE, ET SEULEMENT LÀ — Eric, 2026-08-23 :
     *« le 3 doit être des étoiles soleil lune, répartition dans l'ordre que
     j'ai dit »*, puis, le soir même : *« mets le dos de carte de tarot à la
     place des étoiles SUR LES ITEMS »*.
     ⭐ Les deux ordres ne se contredisent pas, ils nomment deux organes. Un
     cran de roue est un NOM masqué — un glyphe suffit. Une case de grille est
     une CARTE À RETOURNER — elle montre son dos. */
  const cransB = [...pistes[1].querySelectorAll(".roue-marqueur")].map((m) => m.textContent);
  assert.deepEqual(cransB, ["☆", "☉", "☾"], "la roue du bas garde la série, dans l'ordre");

  const marqueurs = rows(node, ".grille-marqueur");
  assert.equal(marqueurs.length, LISTE_PAR_PAGE);
  for (const m of marqueurs) {
    /* ⛔ AUCUN CARACTÈRE DERRIÈRE L'IMAGE : un symbole laissé dessous se
       devinerait en transparence, et un lecteur d'écran dirait deux choses là
       où l'écran n'en montre qu'une. */
    assert.equal(m.textContent, "", "une case face cachée ne porte aucun texte : la carte est peinte par la feuille");
    assert.equal(m.getAttribute("aria-hidden"), "true", "un dos de carte n'a rien à annoncer");
    assert.equal(m.tagName, "SPAN", "un marqueur n'est PAS un bouton : il n'y a rien à choisir");
  }

  /* ⚔️ ET LA CARTE EST VRAIMENT PEINTE — sans cette ligne, tout ce qui précède
     passerait sur quinze cases VIDES, ce qui est exactement le défaut qu'on
     risque en retirant un texte. Le garde lit la feuille, pas la promesse. */
  assert.match(CSS, /\.grille-marqueur[^}]*background-image:\s*url\("\.\/assets\/tarot-dos\.jpg\?v=\d+"\)/,
    "`.grille-marqueur` peint le dos de carte, et son `url()` porte sa version");

  assert.equal(rows(node, ".grille-compte")[0].textContent, "—",
    "et le compte ne MENT pas pendant l'attente — pas de « 1/1 » sur une grille qui ne montre rien");
});

test("12 — la roue du haut RÉPÈTE sa liste dans le bloc : 6 rayons deviennent 36 crans, pas 18", () => {
  /* 🔴 LE PIÈGE N°4, ET IL EST MUET : la roue pose trois blocs et saute d'un
     bloc dès qu'on quitte celui du milieu. Avec 4 crans, un bloc fait 484 px
     pour une fenêtre de 359 — on en sort au moindre geste et la couture tire
     presque en permanence. Eric l'a entendu avant de le voir : « la roue A bien
     fluide, la roue B pas bien, ça clignote », À CODE IDENTIQUE.
     ⭐ La parade : répéter la liste DANS le bloc jusqu'à 12 crans. */
  const node = monterR(ctx());
  const crans = rows(node, ".roue-piste")[0].querySelectorAll(".roue-cran");
  /* ⭐ LE TOTAL N'A PAS BOUGÉ EN PASSANT DE 4 À 6 RAYONS, ET CE N'EST PAS UNE
     COÏNCIDENCE HEUREUSE : la règle vise un PLANCHER de 12 crans par bloc, donc
     4 se répète 3 fois et 6 se répète 2 fois — 12 dans les deux cas. ⛔ C'est
     aussi pourquoi « 36 » ne prouve rien tout seul : c'est la liste des quatre
     premiers libellés, en dessous, qui dit quels rayons on regarde. */
  assert.equal(crans.length, 36, "3 tours × ceil(12 / 6) × 6 rayons = 36 crans");
  assert.deepEqual(crans.slice(0, 4).map((c) => c.textContent),
    ["Adventuring", "Arcana", "Battlefield", "Crafting"],
    "les rayons d'Eric, pas les genres de records");
  assert.deepEqual(crans.slice(0, 4).map((c) => c.dataset.rang), ["0", "1", "2", "3"],
    "chaque cran connaît son RANG dans la vraie liste — c'est ce qui rend la répétition invisible");
});

test("13 — un cran s'annonce par `aria-current`, jamais par `aria-pressed` (ce n'est pas une bascule)", () => {
  const node = monterR(ctx());
  const crans = rows(node, ".roue-cran").filter((c) => c.tagName === "BUTTON");
  assert.ok(crans.length > 0);
  for (const cran of crans) {
    assert.ok(cran.hasAttribute("aria-current"));
    assert.equal(cran.getAttribute("aria-pressed"), null,
      "`aria-pressed` dirait « bouton à bascule » à un lecteur d'écran — un cran n'en est pas un");
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

test("13 ter — au rendu, RIEN n'est annoncé : l'état d'attente du croquis n'a pas de cran courant", () => {
  /* ⭐ CE N'EST PAS UN CAS DÉGÉNÉRÉ, C'EST L'ÉTAT DE DÉPART (test 11) : tant que
     le joueur n'a rien touché, aucun rayon n'est choisi. Un `aria-current` posé
     là annoncerait un choix qui n'a pas eu lieu. */
  const node = monterR(ctx());
  const crans = rows(node, ".roue-piste")[0].querySelectorAll(".roue-cran");
  assert.equal(crans.filter((c) => c.getAttribute("aria-current") === "true").length, 0);
  assert.equal(crans.filter((c) => c.dataset.courant === "true").length, 0);
});

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
  /* Mesuré le 2026-08-23 : 0 des 258 `item` porte un `cost`, 0 porte un
     `weight`. Un autre chantier les remplira. En attendant, l'écran ne doit
     ni planter, ni inventer un « 0 gp » qui serait un mensonge.
     🔴 CE QUI A CHANGÉ LE 23/08 AU SOIR : le chercheur a dégagé avec tout ce
     qui était sous la carte, donc la ligne de résultat qui MONTRAIT l'absence
     par un tiret n'existe plus. Le constat se fait maintenant là où les objets
     se voient — dans la grille — et il est même plus fort : une case ne porte
     que le NOM. Il n'y a plus d'endroit où un prix inventé POURRAIT paraître.
     ⭐ Le témoin sur le corpus reste, et c'est lui qui donne son sens au reste :
     sans lui, ce test passerait aussi sur un catalogue vide. */
  const sansPrix = query({ kind: "item" }).filter((v) => v.record.data.cost === undefined);
  assert.equal(sansPrix.length, 258, "témoin : c'est bien le corpus entier qui est sans prix");

  const node = monterR(ctx());
  assert.equal(rows(node, ".equipment-item-meta").length, 0,
    "aucune ligne de méta ne subsiste où un prix pourrait être inventé");
  /* ⚠️ AU MONTAGE LA GRILLE EST EN ATTENTE (☆ ☉ ☾) — c'est l'état de départ du
     croquis, éprouvé par le test 11. Le témoin de CE test n'est donc pas « des
     objets s'affichent », c'est « la grille est bien là et n'a aucune place où
     loger un prix ». Prendre l'autre témoin ferait échouer un test juste. */
  assert.equal(rows(node, ".grille-cases").length, 1, "témoin : la grille est bien montée");
  for (const c of rows(node, ".grille-case")) {
    assert.doesNotMatch(c.textContent, /\bgp\b|\blb\b/i,
      "une case ne porte que le nom : ni prix, ni poids");
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
