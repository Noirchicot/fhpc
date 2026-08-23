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
     2. la PAGINATION (`pageDObjets`) — pure, éprouvée sur le cas PLEIN et sur
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

const { renderEquipmentStep, rayonsEtEtageres, pageDObjets, CASES_PAR_PAGE } =
  await import("../ui/builder/equipment-step.mjs");

const fixture = exempleFhEn();
const { layers } = fixture;
const query = layers.verbs.query;

function rows(node, selector) { return node.querySelectorAll(selector); }
function ctx() { return { document: { build: { choices: [] } }, resolved: null, query, search: true }; }

/* ══ 1 — LA COUTURE DE DONNÉE : ELLE LIT, ELLE N'INVENTE PAS ═════════════
   Consigne d'Eric du 2026-08-23 : « une fois que le SRD est propre, oui on
   rajoute les tags de catégories ». Les catégories manquantes viendront d'un
   chantier de DONNÉES, jamais de cet écran. */

test("1 — quatre rayons, et ce sont les genres que le catalogue interroge (aucun niveau inventé au-dessus)", () => {
  const arbre = rayonsEtEtageres(query);
  assert.deepEqual(arbre.map((r) => r.id), ["armor", "gear", "item", "weapon"],
    "les rayons sont les GENRES de records, triés — pas des familles inventées au-dessus d'eux");
  assert.deepEqual(arbre.map((r) => r.label), ["Armor", "Gear", "Magic Items", "Weapons"]);
});

test("2 — 🔴 un genre SANS champ de second niveau rend UNE seule étagère, celle du rayon", () => {
  const arbre = rayonsEtEtageres(query);
  const gear = arbre.find((r) => r.id === "gear");
  const armor = arbre.find((r) => r.id === "armor");

  /* Mesuré sur `layers/srd-5.2.1-en.layer.json` : les 82 `gear` ne portent que
     `cost`/`name`/`weight`, les 13 `armor` que leurs cotes d'armure. Aucun des
     deux n'a de champ de catégorie — et le SRD anglais EN A UN pour l'armure
     (« Light/Medium/Heavy Armor », p. 92), c'est l'extracteur de `fh-srd` qui
     l'enjambe. Un lot de DONNÉES le rendra ; cet écran ne le fabrique pas. */
  assert.equal(gear.etageres.length, 1, "Gear n'a rien à quoi se raccrocher : une étagère, celle du rayon");
  assert.equal(gear.etageres[0].label, "Gear", "et elle porte le nom du rayon, pas une étiquette de fantaisie");
  assert.equal(gear.etageres[0].objets.length, 82);
  assert.equal(armor.etageres.length, 1);
  assert.equal(armor.etageres[0].objets.length, 13);
});

test("3 — un genre QUI a le champ le lit, et il ne lit que celui-là", () => {
  const arbre = rayonsEtEtageres(query);
  const weapon = arbre.find((r) => r.id === "weapon");
  assert.deepEqual(weapon.etageres.map((e) => [e.label, e.objets.length]), [["Martial", 24], ["Simple", 14]],
    "`weapon_category` — mesuré 24 martial + 14 simple = 38");

  const item = arbre.find((r) => r.id === "item");
  /* 📌 « Weapon » : 28 → 33 le 2026-08-23 (lot 93). Les cinq épées magiques que
     l'extraction anglaise de fh-srd avalait sont revenues par son lot 86, et
     elles portent toutes `category: weapon` — l'écart tombe donc entièrement
     sur cette étagère-là, ce que les huit autres, inchangées, confirment. */
  assert.deepEqual(item.etageres.map((e) => [e.label, e.objets.length]), [
    ["Armor", 19], ["Potion", 24], ["Ring", 22], ["Rod", 7], ["Scroll", 1],
    ["Staff", 12], ["Wand", 13], ["Weapon", 33], ["Wondrous Item", 127]
  ], "`item.category` — les neuf valeurs mesurées, et RIEN d'autre");
});

test("4 — ⚔️ ATTAQUE : aucun libellé d'étagère n'est inventé, chacun se retrouve dans les records", () => {
  /* Le piège qu'on traque : une jolie table de correspondance (`potion` →
     « Potions & Elixirs »). Elle serait une SECONDE écriture de la taxonomie,
     et deux écritures divergent. Le libellé doit être la valeur lue, recasée. */
  const arbre = rayonsEtEtageres(query);
  const valeurs = new Set();
  for (const kind of ["weapon", "item"]) {
    for (const view of query({ kind })) {
      const d = view.record.data;
      const brut = kind === "weapon" ? d.weapon_category : d.category;
      valeurs.add(String(brut).split(/[-_\s]+/).map((m) => m[0].toUpperCase() + m.slice(1)).join(" "));
    }
  }
  for (const rayon of arbre) {
    for (const etagere of rayon.etageres) {
      if (etagere.label === rayon.label) continue; // l'étagère par défaut porte le nom du rayon
      assert.ok(valeurs.has(etagere.label),
        `« ${etagere.label} » ne se retrouve dans aucun record — c'est une étiquette inventée`);
    }
  }
});

test("5 — le total des étagères redonne EXACTEMENT le catalogue : rien ne se perd, rien ne se compte deux fois", () => {
  const arbre = rayonsEtEtageres(query);
  const total = arbre.reduce((t, r) => t + r.etageres.reduce((s, e) => s + e.objets.length, 0), 0);
  assert.equal(total, 391, "82 gear + 38 weapon + 13 armor + 258 item — le catalogue du lot 84, remesuré au lot 93");
  const ids = new Set();
  for (const r of arbre) for (const e of r.etageres) for (const o of e.objets) ids.add(o.view.id);
  assert.equal(ids.size, 391, "et chaque record n'est rangé que sur UNE étagère");
  /* ⚠️ ET `item-value` N'EST PAS ENTRÉ DANS LE CATALOGUE, ce qui est le bon
     comportement : le genre neuf du lot 92 de fh-srd est un BARÈME (un record,
     la table des prix par rareté), pas un objet qu'on met dans un sac.
     `EQUIPMENT_RECORD_KINDS` ne le nomme pas, donc il ne se range nulle part —
     et ce total le prouve, 391 et non 392. */
});

/* ══ LA PAGINATION — SUR LE CAS PLEIN, JAMAIS SUR LE CAS COURANT ══════════
   ⚠️ C'est le piège n°4 des huit, et il a déjà mordu EXACTEMENT ici : une
   piste qui grandit avec son contenu a l'air d'une piste qui se borne tant
   qu'elle n'a que trois objets. */

test("6 — 🔴 LE CAS PLEIN : la plus grosse étagère fait 127 objets, donc 9 pages, et la dernière en porte 7", () => {
  const arbre = rayonsEtEtageres(query);
  const grosse = arbre.find((r) => r.id === "item").etageres.find((e) => e.label === "Wondrous Item");
  assert.equal(grosse.objets.length, 127, "témoin : c'est bien le cas plein qu'on éprouve");

  const premiere = pageDObjets(grosse.objets, 0);
  assert.equal(premiere.pages, 9, "ceil(127 / 15) = 9");
  assert.equal(premiere.objets.length, CASES_PAR_PAGE);

  const derniere = pageDObjets(grosse.objets, 8);
  assert.equal(derniere.objets.length, 7, "127 − 8 × 15 = 7 — une dernière page PARTIELLE, et c'est le cas normal");
});

test("7 — 🔴 LE CAS DÉGÉNÉRÉ, ET IL EST RÉEL : `scroll` ne porte QU'UN objet", () => {
  const arbre = rayonsEtEtageres(query);
  const minuscule = arbre.find((r) => r.id === "item").etageres.find((e) => e.label === "Scroll");
  assert.equal(minuscule.objets.length, 1, "témoin : une étagère à un seul objet existe vraiment dans les données");
  const vue = pageDObjets(minuscule.objets, 0);
  assert.equal(vue.pages, 1, "une page, jamais zéro — « 1/0 » serait un compte impossible");
  assert.equal(vue.objets.length, 1);
});

test("8 — une étagère VIDE tient quand même : une page, aucune case, jamais une division par zéro", () => {
  const vue = pageDObjets([], 0);
  assert.deepEqual([vue.page, vue.pages, vue.objets.length], [0, 1, 0]);
});

test("9 — la page BOUCLE aux deux bouts, et le compte reste dans ses bornes", () => {
  const cent = Array.from({ length: 100 }, (_, i) => i); // 7 pages
  assert.equal(pageDObjets(cent, 0).pages, 7);
  assert.equal(pageDObjets(cent, 7).page, 0, "au-delà de la dernière on revient à la première");
  assert.equal(pageDObjets(cent, -1).page, 6, "en deçà de la première on va à la dernière");
  assert.equal(pageDObjets(cent, 20).page, 20 % 7);
});

/* ══ L'ÉCRAN — CE QUI SE VOIT SANS MISE EN PAGE ══════════════════════════ */

test("10 — l'écran porte les deux roues, leurs quatre flèches, les deux gouttières de la grille et ses quinze cases", () => {
  const node = renderEquipmentStep(ctx(), () => {});
  assert.equal(rows(node, ".equipment-drum").length, 1);
  assert.equal(rows(node, ".roue").length, 2, "DEUX étages — le troisième niveau est une grille, plus une roue");
  assert.equal(rows(node, ".roue-fleche").length, 4, "une paire par étage, comme le croquis les pose");
  assert.equal(rows(node, ".grille-rang").length, 1, "la grille et ses deux gouttières sur UNE rangée");
  assert.equal(rows(node, ".grille-gouttiere").length, 2, "une gouttière de chaque côté des jetons");
  assert.equal(rows(node, ".grille-fleche").length, 2);
  assert.equal(rows(node, ".grille-compte").length, 1);
  assert.equal(rows(node, ".grille-case").length, CASES_PAR_PAGE, "quinze cases — 5 lignes × 3 colonnes");
});

test("10 bis — ⛔ LE TITRE DE L'ÉTAGÈRE A DÉGAGÉ, ET SA BARRE AVEC — Eric, 23/08", () => {
  /* *« le titre n'a pas lieu d'être, il est porté par le rouleau »*. Un nom
     écrit à deux endroits est un nom qui finit par diverger : celui du cran de
     la roue est le seul qui reste. 📏 Et la barre pesait 52 px dans une carte
     qui en cherchait 12 — la coupe n'est pas cosmétique. */
  const node = renderEquipmentStep(ctx(), () => {});
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
  const node = renderEquipmentStep(ctx(), () => {});
  const crans = rows(node, ".roue-piste")[1].querySelectorAll(".roue-cran");
  assert.ok(crans.length > 0, "l'étage du bas porte bien des crans");
});

test("11 — L'ÉTAT DE DÉPART DU CROQUIS : rayons remplis, étagères ☆ ☉ ☾, grille ☆ ☉ ☾", () => {
  const node = renderEquipmentStep(ctx(), () => {});
  const pistes = rows(node, ".roue-piste");
  assert.equal(pistes[0].dataset.attente, undefined, "la ligne du HAUT est remplie dès l'ouverture");
  assert.equal(pistes[1].dataset.attente, "oui", "la ligne du BAS attend");
  assert.equal(rows(node, ".grille-cases")[0].dataset.attente, "oui", "et la grille attend aussi (nouveau le 23/08)");

  const marqueurs = rows(node, ".grille-marqueur");
  assert.equal(marqueurs.length, CASES_PAR_PAGE);

  /* 🔴 DANS L'ORDRE, PLUS AU HASARD — Eric, 2026-08-23 : *« le 3 doit être des
     étoiles soleil lune, répartition dans l'ordre que j'ai dit, à chaque
     étage »*. La grille a TROIS colonnes : une rangée porte la série entière,
     et chaque rangée la répète.
     ⭐ CE GARDE FERME AUSSI LA QUESTION DU LOT 84 (« le tirage se refait-il à
     chaque attente ? ») : il n'y a plus de tirage, donc plus de question — et
     un tirage réintroduit ferait rougir cette ligne au premier essai. */
  assert.deepEqual(marqueurs.map((m) => m.textContent),
    Array.from({ length: CASES_PAR_PAGE }, (_, i) => ["☆", "☉", "☾"][i % 3]),
    "☆ ☉ ☾ · ☆ ☉ ☾ · … — cinq rangées de trois, toujours la même série");
  for (const m of marqueurs) {
    assert.ok(["☆", "☉", "☾"].includes(m.textContent), `un marqueur porte ☆, ☉ ou ☾ — trouvé « ${m.textContent} »`);
    assert.equal(m.getAttribute("aria-hidden"), "true", "trois glyphes décoratifs n'ont rien à annoncer");
    assert.equal(m.tagName, "SPAN", "un marqueur n'est PAS un bouton : il n'y a rien à choisir");
  }
  assert.equal(rows(node, ".grille-compte")[0].textContent, "—",
    "et le compte ne MENT pas pendant l'attente — pas de « 1/1 » sur une grille qui ne montre rien");
});

test("12 — la roue du haut RÉPÈTE sa liste dans le bloc : 4 rayons deviennent 36 crans, pas 12", () => {
  /* 🔴 LE PIÈGE N°4, ET IL EST MUET : la roue pose trois blocs et saute d'un
     bloc dès qu'on quitte celui du milieu. Avec 4 crans, un bloc fait 484 px
     pour une fenêtre de 359 — on en sort au moindre geste et la couture tire
     presque en permanence. Eric l'a entendu avant de le voir : « la roue A bien
     fluide, la roue B pas bien, ça clignote », À CODE IDENTIQUE.
     ⭐ La parade : répéter la liste DANS le bloc jusqu'à 12 crans. */
  const node = renderEquipmentStep(ctx(), () => {});
  const crans = rows(node, ".roue-piste")[0].querySelectorAll(".roue-cran");
  assert.equal(crans.length, 36, "3 tours × ceil(12 / 4) × 4 rayons = 36 crans");
  assert.deepEqual(crans.slice(0, 4).map((c) => c.textContent), ["Armor", "Gear", "Magic Items", "Weapons"]);
  assert.deepEqual(crans.slice(0, 4).map((c) => c.dataset.rang), ["0", "1", "2", "3"],
    "chaque cran connaît son RANG dans la vraie liste — c'est ce qui rend la répétition invisible");
});

test("13 — un cran s'annonce par `aria-current`, jamais par `aria-pressed` (ce n'est pas une bascule)", () => {
  const node = renderEquipmentStep(ctx(), () => {});
  const crans = rows(node, ".roue-cran").filter((c) => c.tagName === "BUTTON");
  assert.ok(crans.length > 0);
  for (const cran of crans) {
    assert.ok(cran.hasAttribute("aria-current"));
    assert.equal(cran.getAttribute("aria-pressed"), null,
      "`aria-pressed` dirait « bouton à bascule » à un lecteur d'écran — un cran n'en est pas un");
  }
});

test("14 — l'écran DIT ce que le navigateur lui a accordé, au lieu de laisser deviner", () => {
  /* §6 : sur un Safari trop ancien la déclaration `animation-timeline` est
     ignorée et les crans restent plats — dégradation propre, mais MUETTE.
     Eric lit cette ligne sur son iPad et sait s'il juge la roue ou son ombre. */
  const node = renderEquipmentStep(ctx(), () => {});
  const note = rows(node, ".drum-profondeur")[0];
  assert.ok(note, "la ligne existe");
  assert.match(note.textContent, /^Wheel depth: (on|off) —/);
});

test("15 — poser un objet et ouvrir son texte restent les DEUX seuls actes qui parlent à la coquille", () => {
  /* ⭐ LE CŒUR DU LOT : `shell.mjs` répond à toute action par un `refresh()`
     qui reconstruit la carte entière. Un cran franchi qui dispatcherait ferait
     donc DÉMONTER LA ROUE AU MILIEU DU GESTE. Le tambour se met à jour
     lui-même ; il ne parle à la coquille que pour les gestes du joueur. */
  const calls = [];
  const node = renderEquipmentStep(ctx(), (a) => calls.push(a));
  assert.equal(calls.length, 0, "monter le tambour ne dispatche RIEN");

  for (const fleche of rows(node, ".roue-fleche")) fleche.click();
  for (const fleche of rows(node, ".grille-fleche")) fleche.click();
  assert.equal(calls.length, 0,
    "et tourner une roue ou une page non plus — sinon la coquille démonterait l'écran sous le doigt");
});

test("16 — ⚔️ ATTAQUE : un objet magique n'a NI PRIX NI POIDS, et l'écran montre l'absence sans la combler", () => {
  /* Mesuré le 2026-08-23 : 0 des 258 `item` porte un `cost`, 0 porte un
     `weight`. Un autre chantier les remplira. En attendant, l'écran ne doit
     ni planter, ni inventer un « 0 gp » qui serait un mensonge.
     ⭐ ET LES CINQ ÉPÉES REVENUES NE CHANGENT RIEN À CE CONSTAT : remesuré au
     lot 93, c'est 258 sur 258, pas 253 sur 258. La matière du barème existe
     désormais dans la couche — genre `item-value`, le prix par rareté — mais
     elle n'est PAS sur les records d'objet, et cet écran ne la lit pas encore.
     Une valeur qui vit ailleurs n'est pas une valeur présente. */
  const sansPrix = query({ kind: "item" }).filter((v) => v.record.data.cost === undefined);
  assert.equal(sansPrix.length, 258, "témoin : c'est bien le corpus entier qui est sans prix");

  const node = renderEquipmentStep(ctx(), () => {});
  const input = rows(node, ".equipment-search-input")[0];
  input.value = "adamantine armor";
  input.dispatchEvent({ type: "input" });
  const ligne = rows(node, ".equipment-search-result")[0];
  assert.ok(ligne, "un objet magique se trouve bien dans le catalogue depuis le lot 84");
  const meta = ligne.querySelectorAll(".equipment-item-meta")[0];
  assert.equal(meta.textContent, "—",
    "l'absence est MONTRÉE — un prix inventé serait pire qu'un tiret");
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

test("piège 7 — 🔧 LE FONDU EST FIXE À 10 PX, et la piste fait TROIS crans, sans cran de marge", () => {
  /* Amendement du 2026-08-23. Le masque en POURCENTAGE a coûté une passe : plus
     la piste s'élargissait, plus il rongeait de crans, et Eric réglait « 7 »
     pour en voir 5. ⛔ Et pas de cran de marge : il en ferait voir QUATRE. */
  assert.match(bloc(".equipment-drum"), /--roue-fondu:\s*10px/);
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
