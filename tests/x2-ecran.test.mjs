/* ══ LE GARDE DE X2 — LA FICHE D'UN OBJET DU CATALOGUE — lot 242, 2026-09-21 ══

   🔴 CE QU'IL DÉFEND, ET C'EST UNE SEULE CHOSE EN TROIS FORMES :
   **que la moitié haute de X2 soit IMPORTÉE de X1, et jamais recopiée.**
   ⭐ `parchemin.mjs` l'écrivait déjà : *« Le jour où un second écran en veut une,
   il l'importe — ⛔ il ne la recopie pas. »* Un organe que deux écrans fabriquent
   séparément finit toujours par diverger, et la divergence ne se voit pas : les
   deux écrans rendent, les deux gardes passent, et c'est Eric qui trouve l'écart
   six semaines plus tard.

   ⚖️ ET IL DÉFEND LE NOM. `NORMES.md` (`equipement-la-fiche-du-catalogue-est-un-x2`)
   donnait déjà `X2` à cet écran ; le dépôt le codait `b1` — *le même mot que le
   rang B1, qui est le sac*. ⛔ Un nom, deux objets.

   ⛔ SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS : comme le garde de X1, il lit
   des sources et le DOM du stub. ⛔ IL NE MESURE AUCUN RENDU — ni une largeur, ni
   une couleur, ni si le texte tient. Le rendu se regarde au navigateur, aux trois
   palettes, et c'est là qu'a été vu ce que ce fichier ne peut pas voir.

   ⭐ CHAQUE GARDE A ÉTÉ ÉPROUVÉ ROUGE avant d'être cru vert — la manière est notée
   sous chacun, pour qu'on puisse la refaire. */

import test from "node:test";
/* ⭐ LOT 248 — la famille du parchemin se LIT à sa source ; ce garde ne la
   recopie plus (elle était écrite quatre fois, cf. `parchemin.mjs`). */
import { SELECTEUR_DU_PARCHEMIN as PARCH } from "../ui/builder/parchemin.mjs";
import { SELECTEUR_DES_FICHES as FICHES, SELECTEUR_DE_LA_DALLE as DALLE } from "../ui/builder/x1-ecran.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UI = path.join(ROOT, "ui", "builder");
const D = await import("../ui/builder/x1-disposition.mjs");
const { construireLaFicheX1, CLEF_DE, BAS_DE_TETE, ORGANES_DE_TETE } = await import("../ui/builder/x1-ecran.mjs");
const { construireLaFicheX2, feuilleDesCotesX2 } = await import("../ui/builder/x2-ecran.mjs");

const shell = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
const etape = stripComments(fs.readFileSync(path.join(UI, "equipment-step.mjs"), "utf8"));
const pipeline = stripComments(fs.readFileSync(path.join(UI, "equipement-pipeline.mjs"), "utf8"));
const source = stripComments(fs.readFileSync(path.join(UI, "x2-ecran.mjs"), "utf8"));

const ITEM = {
  ref: { id: "helm" }, nom: "Winged Helmet", coutTexte: "15 gp", poidsTexte: "3 lb",
  prose: "A helmet with wings.", cout: { gp: 15 }
};
const tous = (n, sel) => [...n.querySelectorAll(sel)];
const rendu = (o = {}) => construireLaFicheX2({ liste: [ITEM], index: 0, bourse: { gp: 50 }, ...o });

/* ══ 1 — LA COUTURE ════════════════════════════════════════════════════════ */

test("1 — 🪡 la couture est CALCULÉE depuis la table, ⛔ elle n'est écrite nulle part", () => {
  const filet = D.ORGANES.find((o) => o.nom === "FILET BAS");
  assert.equal(BAS_DE_TETE, filet.y + filet.h, "la couture est le pied du second filet");
  /* 🔴 ET CETTE PREMIÈRE ASSERTION NE PEUT PAS ACCUSER — je l'ai mesuré, et c'est la
     raison d'être des deux suivantes. En descendant `FILET BAS` de 266 à 276 dans la
     table, `BAS_DE_TETE` a suivi : le garde est resté VERT. ⛔ Il comparait une valeur
     à sa PROPRE définition. ⭐ Une assertion tautologique protège sa propre doc et
     n'accuse jamais personne — c'est le pire des témoins, parce qu'il rassure.
     ⭐ CE QUI ACCUSE, C'EST LA SOURCE : la couture ne doit exister qu'une fois, et
     comme un CALCUL. Le jour où quelqu'un écrit `274` pour aller plus vite, la table
     et le dépôt commencent à diverger en silence. */
  const x1src = stripComments(fs.readFileSync(path.join(UI, "x1-ecran.mjs"), "utf8"));
  assert.match(x1src, /BAS_DE_TETE = \(\(\) => \{[\s\S]{0,200}?ORGANES\.find\(\(o\) => o\.nom === "FILET BAS"\)/,
    "⭐ elle se DÉDUIT du plan");
  assert.ok(!new RegExp(`\\b${BAS_DE_TETE}\\b`).test(x1src),
    `⛔ ${BAS_DE_TETE} est écrit en dur quelque part dans x1-ecran.mjs — la couture a un second écrivain`);
  assert.ok(!new RegExp(`\\b${BAS_DE_TETE}\\b`).test(source),
    `⛔ ${BAS_DE_TETE} est écrit en dur dans x2-ecran.mjs`);
  /* 🔴 ÉPROUVÉ ROUGE en posant `export const BAS_DE_TETE = 274;` : les deux dernières
     assertions tombent ensemble, et la première reste verte — ⭐ la preuve, en une
     ligne, qu'elle ne servait à rien toute seule. */
});

test("2 — 🔴 le partage est GÉOMÉTRIQUE : la tête est déduite du plan, ⛔ pas énumérée", () => {
  /* 🔴 LA TÊTE A CHANGÉ AU LOT 255, ET X2 LA SUIT SANS UNE LIGNE — Eric, 23/09 :
     *« on dégage le X2 en haut à gauche de X1 ET X2 »*. ⭐ Le fait que cette liste
     soit la SEULE à mettre à jour est la preuve du partage : X2 monte la tête de X1,
     elle n'en a pas une seconde. La quantité a quitté la ligne du titre pour le
     CENTRE de la ligne de coût, entre UNITE et TOTAL. */
  /* ⚖️ LOT 279 — et la RARETÉ, en sous-titre sous le nom : X2 la reçoit sans une ligne. */
  const attendus = ["NOM", "RARETE", "UNITE", "QTE", "TOTAL", "FILET HAUT",
                    "DESCRIPTION", "JAUGE", "COPIER", "OEIL", "FILET BAS"];
  assert.deepEqual(ORGANES_DE_TETE.map((o) => o.nom), attendus,
    "le titre, les trois colonnes du coût, la ligne du haut, les deux filets, le texte, sa jauge, les deux ornements");
  /* ⭐ ET L'INVERSE EST LA VRAIE ASSERTION : aucun organe SOUS la couture n'a pu s'y
     glisser. Une liste par nom ne l'aurait jamais dit. */
  /* ⚠️ PAR NOM, ⛔ PAS PAR IDENTITÉ : `x1-disposition.mjs` et le même fichier avec
     `?v=790` sont DEUX instances de module, aux objets distincts. 📏 Mesuré ici même :
     ce garde rendait rouge sur QTE alors que la table était juste. */
  const noms = new Set(ORGANES_DE_TETE.map((o) => o.nom));
  for (const o of D.ORGANES) {
    const b = o.cible || o;
    const dedans = noms.has(o.nom);
    assert.equal(dedans, b.y + b.h <= BAS_DE_TETE,
      `${o.nom} — sa boîte décide, ⛔ pas son nom`);
  }
  /* 🔴 ÉPROUVÉ ROUGE en remplaçant le filtre par une liste de noms à laquelle
     j'avais « oublié » OEIL : garde 2 rouge sur la première assertion. */
});

/* ══ 2 — LA TÊTE EST IMPORTÉE, ET C'EST LE CŒUR DU LOT ═════════════════════ */

test("3 — ⛔ X2 NE FABRIQUE AUCUN ORGANE DE TÊTE : elle les reçoit", () => {
  /* ⭐ LE GARDE SE FONDE SUR CE QUE LA SOURCE FAIT, ⛔ pas sur ce qu'elle dit : on
     cherche les GESTES de fabrication, pas le mot « importer ». */
  for (const geste of ["habilleEnParchemin(", '"x1-nom"', '"x1-filet"', '"x1-chiffres"',
                       '"x1-description"', '"x1-copier"', '"x1-oeil"',
                       "veilleLeDebordement("]) {
    assert.ok(!source.includes(geste),
      `x2-ecran.mjs écrit \`${geste}\` — ⛔ il RECOPIE un organe de tête au lieu de l'importer`);
  }
  assert.match(source, /import \{[^}]*construireLaTeteDeFiche[^}]*\} from "\.\/x1-ecran\.mjs/,
    "⭐ la tête vient d'UN appel, et d'un seul");
  /* 🔴 ÉPROUVÉ ROUGE en recopiant dans `x2-ecran.mjs` la seule ligne du titre
     (`voyant(id, "x1-nom", …)`) : garde 3 rouge sur `"x1-nom"`. C'est exactement la
     faute qu'il existe pour attraper, et elle aurait rendu à l'écran. */
});

test("4 — 📏 les DEUX fiches rendent la MÊME tête — même organes, mêmes classes", () => {
  const x1 = construireLaFicheX1({ objet: { nom: "Winged Helmet", prose: "x" } }).noeud;
  const x2 = rendu();
  const tete = (n) => tous(n, "[data-organe]")
    .map((e) => `${e.dataset.organe}.${e.className}`)
    .filter((s) => ORGANES_DE_TETE.some((o) => s.startsWith(CLEF_DE[o.nom] + ".")))
    .sort();
  assert.deepEqual(tete(x2), tete(x1),
    "⛔ un organe de tête qui diffère d'une classe est une divergence qui commence");
  assert.equal(tete(x2).length, ORGANES_DE_TETE.length, "les dix, ni plus ni moins");
  /* ⚖️ LOT 273 — ET NI L'UNE NI L'AUTRE NE PORTE PLUS DE PARCHEMIN : les fiches X sont des
     dalles (Eric, 25/09), peintes par une règle de famille — ⛔ rien à monter. */
  for (const [nom, n] of [["X1", x1], ["X2", x2]]) {
    assert.equal(n.querySelector(".parchemin"), null, `${nom} ne monte plus de parchemin`);
  }
  /* 🔴 ÉPROUVÉ ROUGE en donnant au titre de X2 la classe `x2-nom` : garde 4 rouge sur
     le `deepEqual` — ⭐ et c'est bien une SECONDE lecture, en sens inverse, qui
     l'attrape : compter dix organes des deux côtés ne l'aurait pas vu. */
});

test("5 — 👕 l'habit de la tête VOYAGE : ce sont des règles de CLASSE, ⛔ pas de descendance", () => {
  /* ⛔ `x1-qte` A DISPARU AU LOT 255 : la quantité porte `x1-chiffres` comme ses deux
     voisines de la ligne de coût — elle est devenue l'une d'elles. Une classe qui
     n'habille plus personne serait muette, et elle survivrait des mois. */
  for (const c of ["x1-nom", "x1-filet", "x1-chiffres", "x1-description", "x1-copier", "x1-oeil"]) {
    assert.ok(shell.includes(`.${c}`), `.${c} est déclaré`);
    assert.ok(!new RegExp(`\\.x1\\s+\\.${c}\\b`).test(shell),
      `⛔ \`.x1 .${c}\` enfermerait l'habit dans X1 — l'organe importé rendrait NU dans X2`);
  }
  /* ⭐ ET LES TROIS RÈGLES QUI SONT, ELLES, DESCENDANTES ont dû prendre `.x2` : sans
     elles la tête rendrait sans parchemin et SANS POSITION — tous les organes empilés
     en haut à gauche. 📏 C'est le défaut que le garde 4 ne voit pas (le DOM est juste)
     et que seule la page rendue dit. */
  for (const regle of [`${PARCH} .parchemin-fond`, `${FICHES} [data-organe]`,
                       `${FICHES} [data-organe="jauge"]`]) {
    assert.ok(shell.includes(regle), `${regle} — le décor et le mode sont partagés`);
  }
  /* ⭐ LA LISTE SE LIT À SA SOURCE (lot 254) : elle était écrite ici ET dans la
     feuille, et ajouter `.x0` a fait rougir ce garde sur un fait parfaitement
     vrai. Un garde qui épingle une liste devient un second écrivain de cette
     liste — et c'est lui qu'on finit par « corriger » à chaque ajout. */
  assert.ok(shell.includes(`${DALLE} {`),
    `⭐ les écrans qui recouvrent la dalle partagent UNE boîte : ${DALLE}`);
  /* ⭐ ET LES DEUX `:has()` DE LA CARTE LISENT LA MÊME LISTE — comptés, pas
     décrits : deux occurrences exactement, sinon une des deux a divergé. */
  const isDalle = `:is(${DALLE})`;
  assert.equal(shell.split(isDalle).length - 1, 2,
    `les deux \`:has()\` de la carte prennent la même famille : ${isDalle}`);
  /* 🔴 ÉPROUVÉ ROUGE en remettant `.x1 [data-organe]` : garde 5 rouge sur la règle
     partagée. Et au navigateur, la fiche rendait bien tous ses organes — empilés. */
});

/* ══ 3 — LE NOM, ET LE RETOUR ══════════════════════════════════════════════ */

test("6 — ⚖️ la vue s'appelle `x2` ; ⛔ `b1` ne nomme plus un écran", () => {
  assert.ok(etape.includes('montrer("x2")'), "le pilote ouvre `x2`");
  /* ⚖️ LOT 267 — les trois portes d'entrée (la tuile, le jeton de R, le résultat de
     recherche) passent désormais par UNE seule, `ouvrirLObjet`, qui envoie un plan
     craftable à X5 et le reste à X2 (Eric, 25/09 : « un blueprint doit mener
     directement à X5 »). Le compte des trois vit au garde 16 de `x5-ecran`. */
  assert.equal((etape.match(/montrer\("x2"\)/g) || []).length, 1,
    "UNE porte d'entrée : `ouvrirLObjet`, que les trois chemins appellent");
  assert.ok(!/["']b1["']/.test(etape), "⛔ plus aucun `b1` dans le pilote");
  assert.ok(!pipeline.includes("renderB1"), "⛔ l'ancien écrivain a quitté le pipeline");
  assert.match(etape, /vue === "x2" && ficheEnCours/, "la vue est branchée sur la fiche en cours");
  /* 🔴 ÉPROUVÉ ROUGE avant la bascule : les trois assertions tombaient ensemble.
     ⚠️ ET LE COMPTE EST UNE FORME, PAS UN MOT : `grep -c` aurait compté la phrase qui
     NIE `b1` autant que celle qui le pose — ici on mesure `montrer("x2")`, l'emploi. */
});

test("7 — ⚖️ LA LOI DU RANG X : ⛔ X2 n'écrit jamais dans le belt", () => {
  const i = etape.indexOf("const FENETRE_DE = {");
  const table = etape.slice(i, etape.indexOf("}", i));
  assert.ok(!/\bx2\b/.test(table), "⛔ `x2` n'est pas une clef de FENETRE_DE — *« les x ne s'inscrivent pas dans le belt »*");
  assert.ok(!/\bx1\b/.test(table), "⛔ ni `x1` : la loi vaut pour la paire");
  assert.ok(/\br:/.test(table) && /gear:/.test(table), "⭐ éprouvé : la table est bien LUE (les branches y sont)");
  /* 🔴 ÉPROUVÉ ROUGE en ajoutant `x2: "Wares"` à la table : garde 7 rouge.
     ⭐ ET LA TROISIÈME ASSERTION EST LÀ POUR QUE LE GARDE PUISSE ACCUSER : sans elle,
     une découpe ratée rendrait une chaîne VIDE, où `x2` est absent — le garde serait
     vert en ne lisant rien. ⛔ Un témoin qui ne peut jamais accuser est le pire. */
});

test("8 — 🚪 LE RETOUR EST VIVANT, et il est REÇU, ⛔ pas décidé par la fiche", () => {
  let ferme = 0;
  const n = rendu({ fermer: () => { ferme += 1; } });
  const cancel = tous(n, "button").find((b) => b.textContent.includes("CANCEL"));
  assert.ok(cancel, "le pied porte CANCEL — le mot du croquis du 21/09");
  cancel.dispatchEvent({ type: "click" });
  assert.equal(ferme, 1, "⭐ CANCEL appelle le `fermer` du pilote, le même geste qu'avant");
  /* ⭐ ET LE PILOTE LE CÂBLE TOUJOURS SUR L'ORIGINE, pas sur un écran en dur : c'est
     ce qui rend Wares avec son rayon, sa sous-catégorie et sa page (📏 mesuré au
     navigateur le 20/09 — ⛔ ce garde-ci ne le mesure pas, il vérifie le câblage). */
  assert.match(etape, /construireLaFicheX2\(\{[\s\S]{0,400}?fermer: \(\) => montrer\(ficheEnCours\.retour \|\| "r"\)/);
  /* 🔴 ÉPROUVÉ ROUGE en câblant `fermer: () => montrer("r")` : garde 8 rouge sur la
     seconde assertion, et VERT sur la première — ⭐ deux témoins séparés, parce qu'un
     seul aurait laissé passer la moitié de la faute. */
});

/* ══ 4 — CE QUE LE CROQUIS POSE, ET CE QU'IL RETIRE ════════════════════════ */

test("9 — ✂️ les flèches rondes et le `1/X` ont DÉGAGÉ (Eric, 21/09)", () => {
  const n = rendu();
  assert.equal(tous(n, ".pipeline-fleche").length, 0, "⛔ *« les flèches rondes dégagent »*");
  assert.equal(tous(n, ".pipeline-compte").length, 0, "⛔ *« le 1/X dégage »*");
  assert.ok(!/[←→]/.test(n.textContent || ""), "aucun glyphe de flèche ne reste");
  /* ⭐ MAIS LA DONNÉE RESTE, ET C'EST DÉLIBÉRÉ : Eric a retiré deux ORGANES D'ÉCRAN,
     il n'a rien dit du feuilletage. `equipment-step.mjs` publie toujours
     `itemsDeLaPage` « pour la fiche », et `naviguer` reste branché. */
  let cable = 0;
  rendu({ naviguer: () => { cable += 1; } });
  assert.equal(cable, 1, "⛔ le feuilletage n'est pas démonté — c'est un arbitrage, pas un nettoyage");
  /* 🔴 ÉPROUVÉ ROUGE en gardant les deux boutons `pipeline-fleche` : garde 9 rouge. */
});

test("10 — ✏️ le croquis du 21/09 est posé SOUS la couture, dans la bande", () => {
  const n = rendu();
  const bande = n.querySelector('[data-organe="x2-pied"]');
  assert.ok(bande, "la bande existe et porte un `data-organe` — donc la feuille la pose");
  /* les organes du dessin, de haut en bas */
  assert.ok(bande.querySelector(".x2-bourse-titre"), "PURSE");
  assert.deepEqual(tous(bande, ".x2-bourse-unite").map((e) => e.textContent), ["PP", "GP", "SP", "CP"]);
  assert.ok(bande.querySelector(".pipeline-qte"), "QTY, une case de saisie");
  assert.equal(tous(bande, ".x2-pas .pipeline-pas").length, 2, "⭐ `+` et `−` EMPILÉS, ⛔ pas côte à côte");
  assert.equal(tous(bande, ".pipeline-typein").length, 2, "QTY et PRICE");
  assert.ok(bande.querySelector(".x2-dropdown"), "SEND TO, le grand bouton-menu");
  const mot = (b) => (b.querySelector(".x2-bouton-mot") || b).textContent;
  assert.deepEqual(tous(bande, ".x2-portes button").map(mot),
    ["CANCEL", "BUY", "FREE"], "les trois boutons du pied, dans l'ordre du dessin");
  assert.deepEqual(tous(bande, ".x2-bouton-sous").map((e) => e.textContent),
    ["PAY / SEND / CLEAR", "SEND / CLEAR"], "les deux sous-titres, mot pour mot");
  /* 🔴 ÉPROUVÉ ROUGE en sortant la bande du nœud : garde 10 rouge sur la première
     assertion, et les huit suivantes rouges derrière — ⭐ elles pendent toutes à
     `bande`, donc le garde ne peut pas être vert en ne lisant rien. */
});

test("11 — 📏 les cotes de la bande sont LUES dans la table de X1, ⛔ aucune n'est écrite", () => {
  const css = feuilleDesCotesX2();
  const bande = css.match(/\[data-organe="x2-pied"\]\{([^}]*)\}/);
  assert.ok(bande, "la bande est posée par la feuille CONSTRUITE, ⛔ pas par shell.css");
  const lu = Object.fromEntries(bande[1].split(";").map((r) => r.split(":")));
  assert.equal(lu.top, `${BAS_DE_TETE}px`, "son haut EST la couture");
  assert.equal(lu.left, `${D.MARGE_COTE}px`, "ses côtés sont la marge de côté de X1");
  assert.equal(lu.width, `${D.DALLE.l - 2 * D.MARGE_COTE}px`);
  assert.equal(lu.height, `${D.DALLE.h - D.MARGE_PIED - BAS_DE_TETE}px`,
    "son bas est la dalle moins la marge de pied — la déchirure mord, la bande s'écarte");
  /* 🔴 ET LES QUATRE ÉGALITÉS CI-DESSUS NE SUFFISENT PAS — mesuré : en écrivant
     `height:${px(192)}` EN DUR, elles restent toutes VERTES, parce que 192 EST la
     bonne hauteur aujourd'hui. ⛔ Un total juste ne dit rien du contenu (14/09), et
     ⛔ une cote inventée qui tombe juste voyage ensuite comme une cote mesurée.
     ⭐ CE QUI ACCUSE, C'EST L'ABSENCE DE LITTÉRAL : la loi de ce fichier est
     « aucune cote ne s'écrit ici », et elle se vérifie sur la FORME de la source, pas
     sur la valeur du résultat. Deux nombres sont tolérés, et ils sont nommés :
       · `2`  — le multiplicateur des deux marges de côté
       · `8`  — l'écart de lecture, le même que X1 écrit (`basL = … - 8`)
     ⛔ Tout autre chiffre dans cette fonction est une cote retapée. */
  const corps = source.slice(source.indexOf("export function feuilleDesCotesX2"));
  const fin = corps.indexOf("\n}");
  const nombres = (corps.slice(0, fin).match(/\b\d+\b/g) || []).filter((n) => n !== "2" && n !== "8");
  assert.deepEqual(nombres, [], "⛔ une cote est écrite dans `feuilleDesCotesX2`");
  assert.match(source, /D\.DALLE\.h/, "⭐ la dalle se LIT");
  /* 🔴 ÉPROUVÉ ROUGE avec `px(192)` : `nombres` rend `["192"]`. ⭐ Et il rougit AUSSI
     sur un `left:14px` recopié, que rien d'autre ici n'aurait vu. */
});

test("12 — 🪙 les destinations sont celles de l'écran R, ⛔ pas une seconde liste", () => {
  assert.match(source, /import \{ DESTINATIONS \} from "\.\/gear-ecran\.mjs/);
  assert.ok(!/Party inventory|Merchant|Companion|Group PC/i.test(source),
    "⛔ le croquis en dessine huit ; compléter la liste depuis un DESSIN serait une "
    + "règle de jeu écrite par un écran — ⏳ elle appartient à Eric");
  const n = rendu();
  const menu = n.querySelector(".x2-dropdown");
  assert.ok(tous(menu, "option").some((o) => o.disabled),
    "⭐ les destinations non câblées sont POSÉES et DÉSARMÉES — elles ne mentent pas");
  /* 🔴 ÉPROUVÉ ROUGE en posant une vraie option `Party inventory` dans la source.
     ⚠️ ET MA PREMIÈRE TENTATIVE N'A RIEN PROUVÉ : j'avais écrit le mot dans un
     COMMENTAIRE, et `stripComments` le mange — le garde est resté vert, à raison.
     ⭐ C'est la bonne leçon dans les deux sens : compter un mot compte aussi la phrase
     qui le nie, donc ce garde lit la source SANS ses commentaires ; mais alors une
     mutation posée dans un commentaire ne l'éprouve pas. ⛔ Un témoin ne se croit
     rouge que sur une mutation qui vit là où il regarde. */
});

test("13 — 🖋️ l'encre du parchemin est SCOPÉE à X2 ; ⛔ elle ne fuit pas sur les autres écrans", () => {
  /* 📏 MESURÉ AU NAVIGATEUR, aux trois palettes — ⛔ et ce garde ne le mesure PAS :
     sur la bleutée, les deux champs et le menu rendaient à **1,1:1** (invisible),
     parce qu'ils portaient les jetons du SITE (sombre) sur un papier CLAIR. Après :
     **11,1:1**. ⭐ Aucun garde ne pouvait le voir — le DOM, les classes et la feuille
     étaient justes. Il a fallu regarder, puis mesurer.
     ⭐ CE QUE CE GARDE DÉFEND, LUI, C'EST LE PÉRIMÈTRE : `.pipeline-*` sert aussi B2,
     SB3.1 et la recherche, qui sont sur le fond du SITE et où l'encre du site est la
     bonne. Une réparation non scopée aurait cassé trois écrans pour en sauver un. */
  /* ⚠️ ON LIT DES BLOCS, ⛔ PAS DES LIGNES — 📏 et ce garde a vraiment commis la faute :
     ma première version filtrait ligne à ligne, or une règle CSS s'écrit sur PLUSIEURS
     lignes. Le sélecteur et la déclaration ne se rencontraient jamais dans la même
     chaîne, donc la condition « globale ET encre de parchemin » ne pouvait pas être
     vraie — ⛔ le garde était vert PAR CONSTRUCTION, et il l'est resté sous la mutation
     qui devait le faire rougir. C'est comme ça qu'on l'a su. */
  const blocs = [...shell.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((m) => ({ sel: m[1].trim(), corps: m[2] }))
    .filter((b) => /\.pipeline-(typein|dropdown|libelle)\b/.test(b.sel));
  assert.ok(blocs.length >= 3,
    `⭐ éprouvé : les règles sont bien LUES (${blocs.length} blocs) — ⛔ un témoin vert en ne lisant rien est le pire`);
  for (const b of blocs) {
    if (!b.corps.includes("var(--x1-")) continue;
    /* la déclaration d'origine a le droit d'être globale — c'est elle que les autres
       écrans portent. Ce qui n'a pas le droit, c'est une encre de PARCHEMIN sans son
       préfixe : elle fuirait sur B2, SB3.1 et la recherche. */
    assert.ok(b.sel.includes(".x2-pied"),
      `⛔ une encre de parchemin sans \`.x2-pied\` — elle fuit sur les autres écrans : ${b.sel}`);
  }
  /* ⛔ ET LES BOUTONS N'Y SONT PAS, ET C'EST UNE CORRECTION QUE J'AI DÛ FAIRE :
     mon premier jet les avait inclus. Ils sont passés de 1,1 à 9,2 « sur le papier »
     — et sont devenus ILLISIBLES à l'œil, parce qu'un bouton n'est PAS sur le papier :
     le patron de la famille lui peint son propre fond. ⭐ Un chiffre juste sur le
     mauvais organe ne prouve rien : il faut savoir de quelle FAMILLE est l'organe. */
  assert.ok(!/\.x2-pied[^{]*\.pipeline-bouton[^{]*\{[^}]*--x1-encre/.test(shell),
    "⛔ un bouton ne prend pas l'encre du parchemin : il porte l'habit de sa famille");
});

test("273 — 🔴 L'ŒIL DE X2 MARCHE : il bascule en lecture, et il en sort", () => {
  /* ⚖️ Eric, 25/09 : « l'œil ne marche pas sur X2 ». La tête appelait `surLecture`, X2 ne
     répondait pas. ⭐ Deux taps : un pour entrer, un pour sortir — la tête relit l'état. */
  const n = rendu();
  const oeil = n.querySelector('[data-organe="oeil"]');
  assert.ok(oeil, "X2 porte bien l'œil de la tête");
  assert.equal(n.dataset.lecture, undefined, "témoin : pas en lecture au départ");
  oeil.dispatchEvent(new Event("click"));
  assert.equal(n.dataset.lecture, "oui", "⭐ un tap : la fiche passe en lecture");
  assert.equal(oeil.dataset.on, "oui");
  oeil.dispatchEvent(new Event("click"));
  assert.equal(n.dataset.lecture, undefined, "⭐ un second tap : elle en sort");
  /* ⭐ ET LA LECTURE CHANGE VRAIMENT QUELQUE CHOSE — le lot 242 avait posé le bas de lecture
     SUR la couture : le mode existait et ne faisait rien. */
  const f = feuilleDesCotesX2();
  const haut = Number(/\.x2\[data-lecture="oui"\] \[data-organe="description"\]\{height:([\d.]+)px/.exec(f)[1]);
  assert.ok(haut > 180 + 100, `📏 en lecture le texte gagne la place des réglages (${haut} blg)`);
  assert.match(shell, /\.x2\[data-lecture="oui"\] :is\(\.x2-marche, \.x2-sendto[^)]*\)\s*\{\s*visibility:\s*hidden/,
    "⭐ les réglages s'effacent — ⛔ par la feuille, `hidden` perdait contre `display: flex`");
});
