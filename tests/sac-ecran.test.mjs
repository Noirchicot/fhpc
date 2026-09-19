/* ══ L'ÉCRAN SB3.1 — LE SAC ════════════════════════════════════════════════════
   Les gardes du lot 214. Ils tiennent ce que le plan promet, ⛔ pas ce que le
   code fait : chaque assertion se lit contre `sac-disposition.mjs`, la table
   générée, ou contre une phrase d'Eric datée. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTestDocument } from "./dom-stub.mjs";
/* ⛔ UN COMMENTAIRE N'EST PAS UN SÉLECTEUR — le garde du `?` a déjà rougi
   en lisant de la prose pour de la règle (18/09). Toute lecture de feuille
   passe par là. */
import { stripComments } from "./source-scan.mjs";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
globalThis.document = createTestDocument();
const D = await import("../ui/builder/sac-disposition.mjs");
const { construireLeSac, feuilleDesCotesSac, CLEF_DE, RANGS_GRILLE, COLS_GRILLE, CASES_DU_SAC } = await import("../ui/builder/sac-ecran.mjs");
const feuille = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
const PLAN = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "sac-cotes.json"), "utf8"));

const tous = (n, sel) => [...n.querySelectorAll(sel)];
const rendu = (o = {}) => construireLeSac({
  sections: [{ nom: "Potions" }, { nom: "Camp" }, { nom: "Trésor" }],
  section: 0, objets: [], poids: {}, destinations: [], ...o
}).noeud;

test("1 — la déclaration EST la table du plan, au blg près", () => {
  assert.deepEqual(D.ORGANES.map((o) => o.nom), PLAN.organes.map((o) => o.nom),
    "⛔ la déclaration se recopie du générateur, elle ne se retape pas");
  assert.equal(D.DALLE.h, PLAN.dalle.h);
  assert.equal(D.ROUE.dominant, PLAN.roue.dominant);
  assert.equal(D.ROUE.secondaire, PLAN.roue.secondaire);
});

test("2 — 🔴 LA RÈGLE D'ERIC (18/09) se vérifie sur la table, elle ne se déclare pas", () => {
  /* ⚖️ *« il faut que le T0 des petites tuiles remplissent idem que le T1 de la
     grande tuile »* · *« il faut qté en largeur idem en T1 et T0 »*.
     ⭐ Le critère est le NOMBRE DE SIGNES, donc le rapport des largeurs utiles
     doit valoir celui des polices : 8/10. */
  const m = D.ROUE.margePct;
  const utile = (L) => L * (1 - 2 * m);
  const rapport = utile(D.ROUE.secondaire) / utile(D.ROUE.dominant);
  assert.ok(Math.abs(rapport - 0.8) < 0.02,
    `le rapport des textes utiles vaut ${rapport.toFixed(3)}, il devrait valoir 0,800`);
  /* ⛔ et le budget de la piste tombe juste : D + 4W = 279 */
  assert.equal(D.ROUE.dominant + 4 * D.ROUE.secondaire, D.ROUE.budget);
});

test("3 — 🔴 LA MARGE D'UN CRAN SE DÉDUIT DE SA LARGEUR, ⛔ jamais d'un pour-cent CSS", () => {
  /* 🔴 FAUTE VUE AU BANC, premier rendu : `padding-inline: 7.5%` se résout sur la
     largeur du CONTENANT (la roue, 311), pas sur celle du cran — 23,3 de chaque
     côté, et tous les crans affichaient « P… ». ⭐ Le pourcentage reste dans la
     table, la feuille en DÉDUIT deux nombres. */
  const css = feuilleDesCotesSac();
  assert.doesNotMatch(css, /padding-inline:\s*[\d.]+%/,
    "⛔ un pour-cent de padding se résout chez le CONTENANT : il ne peut pas porter cette règle");
  for (const nom of ["CRAN 3", "CRAN 1"]) {
    const o = D.ORGANES.find((x) => x.nom === nom);
    const attendu = Math.round(o.l * D.ROUE.margePct * 100) / 100;
    assert.ok(css.includes(`[data-organe="${CLEF_DE[nom]}"]{padding-inline:${attendu}px}`),
      `${nom} : la marge devrait valoir ${attendu}`);
  }
});

test("4 — 🔴 UN ORGANE NICHÉ SE POSE PAR RAPPORT À SON HÔTE", () => {
  /* 🔴 FAUTE VUE AU BANC : les crans portaient les `x` de la table alors qu'ils
     vivent DANS la roue, elle-même posée à 32. Ils partaient 32 trop à droite. */
  const css = feuilleDesCotesSac();
  const roue = D.ORGANES.find((o) => o.nom === "ROUE");
  const cran = D.ORGANES.find((o) => o.nom === "CRAN 1");
  const attendu = cran.x - (roue.cible ? roue.cible.x : roue.x);
  assert.ok(css.includes(`[data-organe="cran-1"]{left:${attendu}px`),
    `le premier cran devrait se poser à ${attendu} DANS sa roue, pas à ${cran.x}`);
});

test("5 — ⛔ `shell.css` ne porte AUCUNE cote du sac : elles vivent dans la feuille construite", () => {
  const i = feuille.indexOf("/* ══ L'ÉCRAN SB3.1 — LE SAC");
  assert.ok(i > 0, "le bloc du sac existe dans la feuille");
  const bloc = feuille.slice(i);
  assert.doesNotMatch(bloc, /\n\s*(left|top):\s*[\d.]+px/,
    "⛔ une position écrite ici serait une cote recopiée — elles sortent de la table");
});

test("6 — la roue remplit CINQ PLACES, pas cinq crans — et elle ne tourne pas sur elle-même", () => {
  /* 🔴 VU DANS L'APPLICATION, PAS AU BANC : avec le modulo, une seule section
     s'affichait CINQ fois, et un sac neuf — qui n'en a aucune — montrait cinq crans
     nus. ⛔ Une roue qui tourne sur elle-même ment sur ce qu'elle contient.
     ⭐ La table ne connaît que des PLACES ; c'est la roue qui dit combien elle en
     remplit, et elle n'en remplit jamais plus qu'il n'y a de sections. */
  const cinq = rendu({ sections: [1, 2, 3, 4, 5, 6].map((i) => ({ nom: `S${i}` })), section: 2 });
  const crans = tous(cinq, ".sac-cran");
  assert.equal(crans.length, 5, "deux de chaque côté du dominant (Eric, 18/09)");
  assert.deepEqual(crans.map((c) => c.dataset.dominant), ["non", "non", "oui", "non", "non"]);
  assert.deepEqual(crans.map((c) => c.textContent), ["S1", "S2", "S3", "S4", "S5"],
    "⛔ et chaque place porte une section DIFFÉRENTE");

  /* ⭐ LE TÉMOIN QUI TIENT LA FAUTE : une seule section ne se répète pas. */
  const une = rendu({ sections: [{ nom: "Backpack" }], section: 0 });
  const seul = tous(une, ".sac-cran");
  assert.equal(seul.length, 1, "une section, un cran — pas cinq copies");
  assert.equal(seul[0].dataset.dominant, "oui", "et c'est le dominant qui la porte");
  assert.equal(seul[0].dataset.organe, "cran-3", "à la place du milieu, celle du viseur");

  const n = rendu({ sections: [{ nom: "A" }, { nom: "B" }, { nom: "C" }] });
  /* ⭐ ET LA PREMIÈRE SECTION EST LE PREMIER CRAN RENDU : les deux places de gauche
     restent vides parce qu'il n'y a rien avant elle — la roue ne rembobine pas. */
  const dom = tous(n, ".sac-cran").find((c) => c.dataset.dominant === "oui");
  assert.equal(dom.getAttribute("aria-selected"), "true", "le dominant est celui qu'on regarde");
  assert.equal(dom.dataset.organe, "cran-3", "et il occupe toujours la place du viseur");
  assert.equal(tous(n, ".sac-cran").length, 3, "trois sections, trois crans");
  assert.equal(tous(n, ".sac-tuner").length, 2);
  /* ⛔ ET LA ROUE NOMME L'ÉCRAN — NORMES §1 quinquies, « le tambour désigne » :
     aucun titre n'est dû, donc aucun n'est posé. */
  assert.equal(n.querySelector("h1, h2"), null, "⛔ pas de titre : la roue désigne");
});

test("7 — la grille porte DOUZE places, et une case vide est une CIBLE", () => {
  /* ⚖️ Eric, 18/09 : *« un compartiment = 5 rangées de 3 »*, puis *« il nous manque
     un collecteur, il faut faire sauter une rangée »* → 4 × 3 = 12. */
  const n = rendu({ objets: [{ index: 1, nom: "Dagger", qte: 2, locked: true }] });
  const cases = tous(n, ".sac-case");
  assert.equal(cases.length, 12);
  assert.equal(cases[0].dataset.occupe, "oui");
  assert.equal(cases[0].querySelector(".jeton-nom").textContent, "Dagger",
    "⭐ le corps du jeton vient de son organe, il n'est pas redessiné ici");
  assert.equal(cases[0].dataset.verrouille, "oui", "le verrou se dit sur le nœud");
  assert.equal(cases[1].dataset.creneau, "case-1-2", "une case vide est une cible de dépôt");
  assert.equal(cases[1].dataset.occupe, undefined);
});

test("8 — la rangée d'échange porte les DEUX Tally, le collecteur et la bourse", () => {
  /* ⚖️ Eric, 18/09 : *« mets le Tally à gauche du collecteur, et la bourse à droite
     de celui-ci, idem Gear »*, puis *« cotes idem mais emplacement différent »*. */
  const n = rendu();
  for (const id of ["party-tally", "tally", "collecteur", "purse"]) {
    assert.ok(n.querySelector(`[data-organe="${id}"]`), `${id} est posé`);
  }
  const purse = D.ORGANES.find((o) => o.nom === "PURSE");
  assert.equal(purse.l, 50, "la bourse garde la cote de R");
  assert.equal(purse.x + purse.l, D.COLONNES[2] + D.JETON.l,
    "⭐ et son bord droit se cale sur la ligne de la 3ᵉ colonne (« tout reste sur une grille »)");
  /* ⚖️ ET LA PAIRE EST COTÉE AU BORD, PLUS À LA COLONNE — Eric, 18/09 : *« le
     premier à 24 du bord gauche, 8, le second Tally qui est à 24 du collecteur »*.
     🔴 Ses trois nombres ne fermaient pas : 24 + 40 + 8 + 40 + 24 = 136 quand le
     collecteur commence à 144. ⭐ Le premier a cédé — 32 — parce que c'était le
     moins coûteux : la gouttière reste légale et le « 24 du collecteur » tient. */
  const party = D.ORGANES.find((o) => o.nom === "PARTY TALLY");
  const tally = D.ORGANES.find((o) => o.nom === "TALLY");
  assert.equal(tally.x - (party.x + party.l), 8, "la gouttière entre les deux vaut 8");
  assert.equal(D.COLONNES[1] - (tally.x + tally.l), 24, "et le second est à 24 du collecteur");
});

test("9 — ⛔ les lunes sont cotées et NON POSÉES", () => {
  /* ⚖️ Eric, 16/09 : *« les lunes sont pour les écrans plus grands »* — même régime
     que sur R : le plan les dessine, la déclaration dit de ne pas les poser. */
  const lunes = D.ORGANES.filter((o) => o.sorte === "lune");
  assert.equal(lunes.length, 3, "Wares · Gear · Craft");
  assert.ok(lunes.every((l) => l.creation === false));
  const n = rendu();
  for (const l of lunes) {
    assert.equal(n.querySelector(`[data-organe="${(CLEF_DE[l.nom] || l.nom)}"]`), null,
      `${l.nom} ne se pose pas à la création`);
  }
  assert.doesNotMatch(feuilleDesCotesSac(), /lune/, "⛔ et la feuille ne leur fait pas de place");
});

test("10 — le tuner écoute la MOLETTE en plus du tap, et il l'empêche de défiler la page", () => {
  /* ⚖️ Eric, 18/09 : *« utiliser le scroll de la souris sur un chevron peut aider
     le défilement »*. ⛔ Et la molette S'AJOUTE : le tap marche toujours. */
  const tours = [];
  const n = rendu({ surTourner: (s) => tours.push(s) });
  const g = n.querySelector('[data-organe="tuner-g"]');
  g.dispatchEvent({ type: "click" });
  let empeche = false;
  g.dispatchEvent({ type: "wheel", deltaY: -1, preventDefault: () => { empeche = true; } });
  assert.deepEqual(tours, [-1, -1], "le tap et la molette tournent tous les deux");
  assert.equal(empeche, true, "⛔ sinon la page défilerait DERRIÈRE la roue");
  const source = fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8");
  assert.match(source, /passive:\s*false/, "sans lui le navigateur refuse le preventDefault");
});

/* ══ LES GARDES DE LA REPRISE — 18/09 ════════════════════════════════════════
   🔴 LES CINQ QUI SUIVENT NAISSENT D'UNE FAUTE QU'AUCUN GARDE N'AVAIT VUE, et
   qu'Eric a vue à l'œil sur l'écran en ligne. Ils ne mesurent donc PAS ce que la
   table dit — les dix premiers le font déjà — mais ce que l'écran REND : sa
   matière, ses images, ses glyphes, et le fait que ses deux bornes gardent leur
   ancre. ⭐ Chacun a été éprouvé ROUGE sur le code de la veille avant d'être
   écrit ; un garde vert qui n'a jamais été rouge ne prouve rien. */

test("11 — 🔴 LA DALLE PORTE LE VOILE DE SON RANG, et la cote se lit sur un TÉMOIN", () => {
  /* ⚖️ Eric, 18/09, en regardant l'écran en ligne : *« la dalle de fond 35 % de
     voile pfffff »*. Le sac est un rang B posé DANS la dalle de R — il relève donc
     de la ligne des blocs intérieurs, pas des 50 % d'un écran de parcours.
     ⛔ CE GARDE NE CONNAÎT AUCUN POURCENTAGE, et c'est exprès : il LIT la classe que
     porte le témoin du rang B — `.parcours-guide`, « la dalle du rang B qui rend
     Species, Inheritance et Class » (`dalle-du-rang.test.mjs`) — et exige la même.
     Le jour où Eric change le voile d'un rang B, ce garde suit tout seul ; s'il
     recopiait « 35 », il figerait la valeur d'aujourd'hui. */
  const parcours = fs.readFileSync(path.join(UI, "parcours-ecrans.mjs"), "utf8");
  const temoin = parcours.match(/"parcours-guide\s+(dalle-[a-z]+)"/);
  assert.ok(temoin, "⛔ le témoin du rang B ne déclare plus sa dalle dans parcours-ecrans.mjs : " +
    "sans lui ce garde ne mesure plus rien et passerait sur n'importe quoi.");
  const source = fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8");
  const mienne = source.match(/el\("section",\s*"sac\s+(dalle-[a-z]+)"\)/);
  assert.ok(mienne, "⛔ le sac ne déclare plus sa dalle par une classe — il la peindrait donc lui-même");
  assert.equal(mienne[1], temoin[1],
    `le sac porte \`${mienne[1]}\` là où le témoin du rang B porte \`${temoin[1]}\`. ` +
    "Un rang décide de son voile ; copier celui du voisin est la faute du 18/09.");
  assert.equal(rendu().className, `sac ${temoin[1]}`, "et c'est bien ce que l'écran rend");
});

test("12 — 🔴 LES DEUX BORNES DU PIED GARDENT LEUR ANCRE (le livre et le `?`)", () => {
  /* ⚖️ Eric, 18/09 : *« le livre et le ? qui sont mal centrés »*.
     ⛔ LA CAUSE : `.sac [data-organe]` pose `position: absolute`, et la règle qui le
     défaisait dans la rangée (`position: static`) attrapait les deux bornes. Or
     `shell.css` §6 pré l'écrit déjà : *« `relative`, JAMAIS `static` — ces deux
     bornes portent leur cercle en `::before` ABSOLU ; passées en `static` le cercle
     s'ancre sur l'ancêtre positionné le plus proche et se dessine À CÔTÉ du glyphe »*.
     📏 Mesuré au navigateur avant correction : `::before` du livre à `left: 11px`
     dans une rangée de 367 — son cercle collé au bord GAUCHE, à ~300 blg du glyphe.
     ⭐ LA PARADE EST DE TUER LA CAUSE : aucun enfant de la rangée ne porte
     `data-organe`, donc rien n'a d'`absolute` à défaire. C'est ce que fait R. */
  const n = rendu();
  const rangee = n.querySelector(".sac-rangee");
  assert.ok(rangee, "la rangée du pied existe");
  assert.equal(rangee.dataset.organe, "rangee", "⭐ la RANGÉE, elle, en porte un : c'est elle que la feuille pose");
  const marques = tous(rangee, "[data-organe]");
  assert.equal(marques.length, 0,
    "⛔ " + marques.map((e) => e.dataset.organe).join(", ") + " porte(nt) `data-organe` DANS la rangée. " +
    "La grille des rangées les range ; un `absolute` posé là oblige à le défaire, et le défaire " +
    "décroche le dessin des deux bornes.");
  assert.doesNotMatch(feuille, /\.sac-rangee\s*\[data-organe\]/,
    "⛔ la règle qui rendait les enfants `static` est revenue — avec elle revient la faute du 18/09");
  /* ⛔ ET L'ÉCRAN NE FABRIQUE PAS SON `?` : la source du chapitre le dit en toutes
     lettres — *« `.tuto-point`, posé par la COQUILLE, pas par l'écran »*. Le mien
     n'avait pas de `data-vu` (le parchemin plein / le cercle creux, §7) et aurait
     fait DOUBLON avec celui que `poserLesBornes` descend dans la dernière rangée. */
  assert.equal(n.querySelector(".tuto-point"), null,
    "⛔ le sac fabrique un `?` : la coquille en pose déjà un, et le sien n'a pas d'état");
  const livre = n.querySelector(".fiche-livre");
  assert.ok(livre, "le livre, lui, est posé par l'écran — comme sur R");
  assert.equal(livre.disabled, true,
    "⛔ sans cible FH WEB il est GRISÉ, jamais muet : « chaque conversion demande une CIBLE »");
});

test("13 — 🔴 LES TROIS ORGANES D'ÉCHANGE SONT CEUX DE R, ET ILS PORTENT LEURS IMAGES", () => {
  /* ⚖️ Eric, 18/09 : *« les images de la bourse, des Tally »* — il les a vues nues.
     ⭐ Elles existent depuis le 16/09, déposées par lui : `--icone-bourse`,
     `--icone-parchemin`, `--icone-parchemin-party`. ⛔ On ne recopie pas leur habit :
     les trois boutons REPRENNENT `gear-bouton`, la classe de R. */
  const tokens = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");
  const n = rendu({ compteurs: { tally: 2, "party-tally": 0 } });
  for (const [id, jeton] of [["purse", "--icone-bourse"], ["tally", "--icone-parchemin"],
                             ["party-tally", "--icone-parchemin-party"]]) {
    const b = n.querySelector(`[data-organe="${id}"]`);
    assert.ok(b, `${id} est posé`);
    assert.ok(b.className.split(/\s+/).includes("gear-bouton"),
      `⛔ \`${id}\` porte « ${b.className} » au lieu de \`gear-bouton\` : une seconde famille ` +
      "recopie un habit, et deux habits divergent au premier réglage.");
    assert.match(feuille, new RegExp(`\\.gear-bouton\\[data-organe="${id}"\\][^}]*background-image:\\s*var\\(${jeton}\\)`),
      `⛔ rien ne peint \`${id}\` : il rendrait un rectangle nu, ce qu'Eric a vu le 18/09`);
    assert.match(tokens, new RegExp(`${jeton}:\\s*url\\(`), `⛔ le jeton ${jeton} n'existe plus`);
  }
  /* ⚖️ ET LE PARCHEMIN DIT SON ÉTAT — la source du chapitre, 15/09 : *« dès le
     premier item il porte un halo, et reste ainsi jusqu'à ce qu'il soit vidé »*.
     ⛔ Le vide ne s'entoure pas, il RECULE (Eric, 16/09) : c'est `data-compte`. */
  assert.equal(n.querySelector('[data-organe="tally"]').dataset.compte, "2");
  assert.equal(n.querySelector('[data-organe="party-tally"]').dataset.compte, "0");
  assert.equal(n.querySelector('[data-organe="purse"]').dataset.compte, undefined,
    "⛔ la bourse n'est pas un parchemin : elle ne s'efface pas quand elle est vide");
});

test("14 — ⚖️ LES DEUX OUTILS PORTENT LEUR MOT, EN VERT — et plus un glyphe", () => {
  /* ⚖️ Eric, 2026-09-19 : *« le bouton d'édition est trop grossier ; je préfère un
     carré vert simple : edit / sections. Et un autre bouton classique vert : Sort. »*
     🔴 CE GARDE DISAIT L'INVERSE HIER, et il avait raison hier : les deux boutons
     étaient NUS, et un glyphe valait mieux que rien. ⭐ Un mot vaut mieux qu'un
     glyphe — et Eric a tranché en regardant, ce qu'aucun garde ne sait faire. */
  const n = rendu();
  const trier = n.querySelector('[data-organe="trier"]');
  const sections = n.querySelector('[data-organe="sections"]');
  assert.equal(trier.textContent, "Sort", "⭐ le mot est VISIBLE, plus caché dans l'aria-label");
  assert.equal(sections.textContent, "editsections",
    "⭐ deux étages, deux nœuds — ⛔ un `\\n` dans le texte finirait dans l'aria-label");
  assert.deepEqual(tous(sections, ".sac-outil-etage").map((e) => e.textContent), ["edit", "sections"]);
  assert.equal(n.querySelector('[data-organe="sections"]').getAttribute("aria-label"), "Edit sections",
    "et le mot complet reste dit à qui ne voit pas l'écran");

  /* ⚖️ *« carré vert = bouton classique »* — Eric, 19/09, en tranchant sa propre
     phrase de la veille. ⭐ LES DEUX SONT DU MÊME GABARIT, et le mot « carré »
     désignait le VERT, pas la forme.
     🔴 J'AVAIS SORTI LE SECOND DE LA FAMILLE POUR ÉCHAPPER À SON `min-width` DE 77 —
     mesuré : posé à 44, il rendait 77 et SORTAIT de la dalle de 29, parce que la
     famille impose sa largeur sous un sélecteur à (0,3,1) (*« `:not(.tuto-point)`
     porte la spécificité de son argument »*). ⭐ Eric a tranché l'inverse : c'est au
     PLAN de lui donner ses 77. ⛔ On ne contourne pas une famille, on lui fait de la
     place — et la rangée s'est redisposée autour, le total prenant sa propre ligne. */
  for (const b of [trier, sections]) {
    assert.ok(b.className.split(/\s+/).includes("gear-porte"),
      `⛔ « ${b.className} » : les deux outils sont des boutons CLASSIQUES, ceux du pied`);
  }
  const plan = (nom) => D.ORGANES.find((o) => o.nom === nom);
  assert.equal(plan("TRIER").l, plan("TASSER").l,
    "⛔ et le plan leur donne la MÊME largeur : deux boutons du même gabarit au même endroit");
  assert.match(feuille, /\.sac-outil \{ --bouton-fond: var\(--positive\); \}/,
    "⚖️ *« vert »* — le liseré dit le verbe (§6), il ne se peint pas dans le balisage");

  /* ⛔ ET LES DEUX GLYPHES SONT MORTS AVEC EUX : un jeton que plus personne ne lit est
     un jeton à retirer — la leçon du lot 213 (`--icone-plus`, `--icone-coeur`). */
  const tokens = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");
  for (const mort of ["--icone-trier", "--icone-grille"]) {
    assert.doesNotMatch(tokens, new RegExp(`${mort}\\s*:`), `⛔ ${mort} ne sert plus à personne`);
  }
});

test("15 — ⚖️ LE MODE ÉDITION : deux poignées À CHEVAL sur la boîte regardée", () => {
  /* ⚖️ Eric, 2026-09-19 : *« dans le mode edit mettre un x (carré 40 × 40 à gauche, À
     CHEVAL) et un / (carré 40 × 40 à droite) de la boîte sélectionnée : on peut
     l'éditer ou l'effacer. Le swipe et les chevrons permettent de naviguer. »* ·
     *« quand je dis 40 c'est 40 de hauteur, pour les sections »*.
     🔴 CE GARDE DÉCRIVAIT UNE AUTRE FORME HIER — le `−` prenait la place de `Sort` et
     le champ s'ouvrait tout seul en entrant en édition. ⭐ Les deux étaient des
     raccourcis : un outil qui change de métier selon le mode se relit à chaque fois,
     et une boîte qu'on ne peut plus LIRE sans être en train de la modifier n'est plus
     une liste. Eric a donné au renommage et à la suppression leurs propres poignées. */
  const trois = [{ nom: "Potions" }, { nom: "Camp" }, { nom: "Trésor" }];
  const gestes = [];
  const n = rendu({ sections: trois, section: 1, edition: true,
    surAjouter: () => gestes.push("ajouter"),
    surEditer: () => gestes.push("editer"),
    surRenommer: (i, nom) => gestes.push(`renommer:${i}:${nom}`),
    surSupprimer: () => gestes.push("supprimer") });
  assert.equal(n.dataset.mode, "edition", "⭐ le mode vit sur la DALLE, pas dans cinq organes");

  /* ① LES DEUX POIGNÉES, ET LEUR PLACE EST DANS LE PLAN — ⛔ pas dans le module. */
  const effacer = n.querySelector('[data-organe="effacer"]');
  const editer = n.querySelector('[data-organe="editer"]');
  assert.ok(effacer && editer, "⛔ sans elles, on ne peut ni renommer ni supprimer");
  assert.equal(effacer.textContent, "×");
  assert.equal(editer.textContent, "/");
  const dom = D.ORGANES.find((o) => o.nom === "CRAN 3");
  const pose = (nom) => D.ORGANES.find((o) => o.nom === nom);
  assert.equal(pose("EFFACER").x + pose("EFFACER").l / 2, dom.x,
    "⚖️ le `×` est centré sur le coin BAS-GAUCHE du cran dominant");
  assert.equal(pose("EDITER").x + pose("EDITER").l / 2, dom.x + dom.l,
    "⚖️ et le `/` sur son coin bas-droit — c'est ce qui dit de QUELLE boîte ils parlent");
  /* ⚖️ ET LE CHEVAL EST VERTICAL, SUR L'ARÊTE DU BAS — croquis d'Eric, 19/09 : les
     deux signes PENDENT sous le cran. 🔴 Je les avais mis aux côtés, à mi-hauteur :
     ils mordaient alors sur les deux crans VOISINS, et un signe posé sur la boîte
     d'à-côté ment sur ce qu'il désigne. Sous le cran, il n'y a personne. */
  for (const p of ["EFFACER", "EDITER"]) {
    assert.equal(pose(p).y + pose(p).h / 2, dom.y + dom.h,
      `${p} doit être centré sur l'arête BASSE du dominant — moitié dedans, moitié dessous`);
  }
  /* ⚖️ ERIC, 2026-09-19 AU SOIR, ET IL CORRIGE SON PROPRE 40 : *« j'ai demandé dessin
     30×30 / tactile 44×44 »* · *« x = effacer, / = editer »* · *« seulement × et / —
     les quatre autres restent à 40 »*. ⭐ Le `40 × 40` qu'il avait dicté le matin
     visait la HAUTEUR des sections ; ces deux poignées-ci portent un GLYPHE, pas un
     mot, et elles n'ont donc pas besoin de la largeur d'un mot.
     ⛔ CE GARDE A ROUGI SUR CE CHANGEMENT, ET IL AVAIT RAISON DE ROUGIR : c'est sa
     fonction de tenir une cote dictée contre la dérive. On le réécrit AVEC sa date,
     ⛔ on ne retourne pas un nombre en silence.
     📌 ET LE PARTAGE SURVIT À LA RÉDUCTION : le dessin enjambe 15/15 l'arête du cran,
     la CIBLE (44, inchangée) l'enjambe 22/22 — ce que *« dépasse de 20 à l'intérieur
     et à l'extérieur »* voulait dire au doigt. */
  for (const p of ["EFFACER", "EDITER"]) {
    assert.deepEqual([pose(p).l, pose(p).h], [30, 30], "⚖️ *« dessin 30×30 »* (19/09 au soir)");
    assert.deepEqual([pose(p).cible.l, pose(p).cible.h], [D.TOUCH, D.TOUCH],
      "⚖️ *« tactile 44×44 »* — ⛔ le dessin rétrécit, la cible ne descend jamais sous le plancher");
  }

  /* ③ 🔴 ET LA PASTILLE DOIT LIRE CE DESSIN, SINON LA COTE EST INERTE. Faute mesurée le
     19/09 : la table déclarait 40 et la pastille valait `--sp-24` en dur — deux cotes
     pour un seul organe, dont aucune ne tenait l'autre d'accord. Le plan pouvait bouger
     sans que rien ne suive, ET SANS QUE RIEN NE LE DISE. ⭐ `inset: 0` la fait tenir la
     boîte de contenu, c'est-à-dire le dessin que la feuille construite pose. */
  const regleDeLaPastille = [...stripComments(feuille).matchAll(/([^{}]*)\{([^{}]*)\}/g)]
    .map(([, sel, corps]) => ({ sel: sel.trim(), corps }))
    .find((b) => b.sel === ".sac-poignee::before");
  assert.ok(regleDeLaPastille, "⛔ la pastille des poignées n'est plus habillée : ce garde doit être réécrit");
  assert.match(regleDeLaPastille.corps, /inset:\s*0/,
    "⛔ la pastille doit prendre la boîte de contenu — donc le DESSIN du plan");
  assert.doesNotMatch(regleDeLaPastille.corps, /(inline|block)-size\s*:/,
    "⛔ une cote propre à la pastille serait un second écrivain : 30 vit dans `backpack_gen.py`");

  /* ④ `Sort` NE CHANGE PLUS DE MÉTIER — il était devenu le `−` en édition. */
  assert.equal(n.querySelector('[data-organe="trier"]').textContent, "Sort");

  /* ⑤ LE CHAMP NE S'OUVRE QUE PAR LE `/` */
  assert.equal(n.querySelector(".sac-cran-champ"), null,
    "⛔ entrer en édition n'ouvre pas un champ : on doit pouvoir LIRE la liste");
  editer.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, ["editer"]);
  const ouvert = rendu({ sections: trois, section: 1, edition: true, renommage: true,
    surRenommer: (i, nom) => gestes.push(`renommer:${i}:${nom}`) });
  const champ = ouvert.querySelector(".sac-cran-champ");
  assert.ok(champ, "⭐ et le `/` l'ouvre sur la boîte regardée");
  assert.equal(champ.value, "Camp");
  assert.equal(champ.maxLength, 22, "la cote du cran sur deux étages");
  champ.value = "Potions de soin";
  champ.dispatchEvent({ type: "keydown", key: "Enter", preventDefault: () => {} });
  assert.deepEqual(gestes, ["editer", "renommer:1:Potions de soin"],
    "⛔ et on n'écrit QU'À LA VALIDATION : un verbe par frappe redessinerait sous les doigts");

  effacer.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, ["editer", "renommer:1:Potions de soin", "supprimer"]);

  /* ④ UNE BOÎTE FIGÉE DÉSARME SA POIGNÉE — ⛔ un bouton qui s'allume pour refuser est
     pire qu'un bouton éteint (*« non coloré = non cliquable »*). */
  const socle = rendu({ sections: [{ nom: "Backpack section 1", fige: true },
                                   { nom: "Party inventory", fige: true, renommable: false }],
                        section: 1, edition: true });
  assert.equal(socle.querySelector('[data-organe="effacer"]').disabled, true,
    "⛔ on ne supprime pas une place qu'on n'a pas faite");
  assert.equal(socle.querySelector('[data-organe="editer"]').disabled, true,
    "⛔ ni ne rebaptise celle dont le nom dit à qui elle est");

  /* ⑤ L'INTERRUPTEUR DU MODE s'allume, et il ne bouge pas de place */
  const bascule = n.querySelector('[data-organe="sections"]');
  assert.equal(bascule.dataset.on, "true");
  assert.equal(bascule.getAttribute("aria-pressed"), "true");

  /* ⑥ ⚖️ LA ROUE EST INFINIE DANS LES DEUX MODES — Eric, 19/09 : *« ça doit être une
     roue infinie ; le halo et le zoom restent au centre, les boîtes défilent dans le
     halo »* · *« il doit toujours y avoir 2 sections à gauche et 2 à droite »*.
     ⭐ Le `+` est un cran DE PLUS SUR L'ANNEAU, pas une butée à son bout : c'est ce
     qui rend l'infini et le `+` compatibles. */
  const cinq = [1, 2, 3, 4, 5].map((i) => ({ nom: `S${i}` }));
  /* ⚖️ EN ÉDITION, LES DEUX BOUTS SONT LES DEUX `+` — croquis du 19/09 : `Backpack +
     section` à gauche, `Outside backpack + section` à droite. ⛔ Il ne reste donc que
     TROIS sections visibles, et c'est ce que son croquis montre.
     🔴 C'EST L'INVERSE DE CE QUE J'AVAIS FAIT LA VEILLE : j'avais posé un `+` unique
     SUR l'anneau, pour qu'un ruban infini garde un endroit où créer. Eric l'en sort —
     un bouton qui défile est un bouton qu'on doit chercher. */
  const bout = rendu({ sections: cinq, section: 4, edition: true,
    surAjouter: (ou) => gestes.push(`ajouter:${ou}`) });
  assert.deepEqual(tous(bout, ".sac-cran").map((c) => c.textContent || c.value),
    ["+", "S4", "S5", "S1", "+"],
    "⭐ deux `+` aux bouts, et l'anneau des sections continue de tourner entre eux");
  const [gauche, droite] = tous(bout, '[data-role="ajouter"]');
  assert.equal(gauche.dataset.lieu, undefined, "le `+` de gauche crée DANS le sac");
  assert.equal(droite.dataset.lieu, "dehors", "⚖️ celui de droite crée DEHORS — et son `+` est doré");
  gauche.dispatchEvent({ type: "click" });
  droite.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes.slice(-2), ["ajouter:sac", "ajouter:dehors"],
    "⛔ et le geste dit LEQUEL : deux boutons, deux destinations");
  const repos = rendu({ sections: cinq, section: 0 });
  assert.deepEqual(tous(repos, ".sac-cran").map((c) => c.textContent),
    ["S4", "S5", "S1", "S2", "S3"],
    "⚖️ au repos l'anneau vaut n : *« un belt infini déroulant »* (Eric, 18/09)");
  assert.equal(tous(repos, '[data-role="ajouter"]').length, 0, "⛔ et il ne porte aucun `+`");
  for (const x of [bout, repos]) {
    assert.deepEqual(tous(x, ".sac-cran").map((c) => c.dataset.dominant),
      ["non", "non", "oui", "non", "non"], "le halo et le zoom restent au centre");
  }
  /* ⚖️ ET TROIS LISERÉS DISENT TROIS GENRES — croquis du 19/09 : blanc = une section
     du sac, BLEU = le party inventory, DORÉ = hors du sac. ⛔ Le blanc ne se déclare
     pas : c'est le défaut de la maison, et un défaut qu'on réécrit cesse d'en être un. */
  const genres = rendu({ section: 1, sections: [
    { nom: "Weapons" }, { nom: "Party inventory", party: true }, { nom: "Red chest", dehors: true }] });
  const parNom = Object.fromEntries(tous(genres, ".sac-cran").map((c) => [c.textContent, c.dataset.lieu]));
  assert.equal(parNom["Weapons"], undefined, "une section du sac n'a pas de lieu déclaré : blanc");
  assert.equal(parNom["Party inventory"], "party", "⚖️ le party inventory est BLEU");
  assert.equal(parNom["Red chest"], "dehors", "⚖️ et ce qui est hors du sac est DORÉ");
  assert.match(feuille, /\.sac-cran\[data-lieu="party"\][^}]*var\(--info\)/);
  assert.match(feuille, /\.sac-cran\[data-lieu="dehors"\][^}]*var\(--dehors\)/);

  /* ⑦ ⚖️ *« la hauteur des sections = 40 »* — et le zoom vit en largeur et en corps.
     ⛔ Une boîte qui change de hauteur en entrant dans le halo ne défile pas : elle
     saute. */
  for (const c of ["CRAN 1", "CRAN 3", "CRAN 5"]) {
    assert.equal(pose(c).h, 40, `${c} doit faire 40 de haut`);
  }
  assert.ok(pose("CRAN 3").l > pose("CRAN 1").l, "⭐ c'est la LARGEUR qui dit le dominant");
});

test("16 — 🔴 LA GRILLE SE COMPTE DANS LA TABLE, ⛔ elle ne s'écrit pas dans le module", () => {
  /* ⛔ LA FAUTE QUE CE GARDE TIENT : je bouclais sur `r < 4` et `c < 3` — deux
     nombres retapés, dans le seul fichier du lot qui a le droit de n'en porter
     aucun. Le jour où le plan rend sa cinquième rangée (elle a été retirée pour le
     collecteur, elle peut revenir), la boucle aurait menti sans rougir. */
  const rangs = new Set(D.ORGANES.filter((o) => /^CASE \d+\.\d+$/.test(o.nom))
    .map((o) => Number(/^CASE (\d+)\./.exec(o.nom)[1])));
  const cols = new Set(D.ORGANES.filter((o) => /^CASE \d+\.\d+$/.test(o.nom))
    .map((o) => Number(/\.(\d+)$/.exec(o.nom)[1])));
  assert.equal(RANGS_GRILLE, rangs.size, "les rangées se comptent dans le plan");
  assert.equal(COLS_GRILLE, cols.size, "les colonnes aussi");
  assert.equal(CASES_DU_SAC, rangs.size * cols.size);
  assert.equal(tous(rendu(), ".sac-case").length, CASES_DU_SAC,
    "⛔ et l'écran en rend exactement autant — pas un de plus, pas un de moins");
  const source = fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8");
  assert.doesNotMatch(source, /r\s*<\s*\d+;|c\s*<\s*\d+;/,
    "⛔ une borne de boucle écrite en clair : la taille de la grille vient de la TABLE");
  /* ⛔ ET LE NOM DE LA COTE N'EST PAS CELUI DE LA NORME : l'ancien nom local de la
     page de listes est INTERDIT dans `ui/`, et c'est `tests/listes.test.mjs` qui le
     tient — ⭐ pas ce fichier-ci. Un second garde pour la même loi, c'est deux
     occasions de diverger ; et il m'a mordu ici, sur le COMMENTAIRE qui l'explique.
     📌 La cote du sac s'appelle `CASES_DU_SAC`, et elle est une DÉROGATION assumée à
     la norme du produit (15), pour la cause qu'on voit à l'écran : le collecteur. */
});

test("17 — 🔴 LA MOLETTE SUR LA GRILLE TOURNE LA PAGE, et se tait quand il n'y en a qu'une", () => {
  /* ⚖️ Eric, 18/09 : *« plus de place, ça va dans la page suivante ou celle d'après…
     voire ça crée une page supplémentaire si besoin »* — donc une section a des
     pages, et il faut pouvoir les atteindre. ⭐ C'est l'idiome du tuner, celui qu'il
     a demandé pour la roue. */
  const tours = [];
  const deux = rendu({ pages: 2, surPage: (s) => tours.push(s) });
  const c = deux.querySelector('[data-organe="case-1-1"]');
  let empeche = false;
  c.dispatchEvent({ type: "wheel", deltaY: 1, preventDefault: () => { empeche = true; } });
  c.dispatchEvent({ type: "wheel", deltaY: -1, preventDefault: () => {} });
  assert.deepEqual(tours, [1, -1], "un cran par coup de molette, dans les deux sens");
  assert.equal(empeche, true, "⛔ sinon la page du navigateur défilerait DERRIÈRE la grille");

  /* ⛔ UNE SEULE PAGE, AUCUN GESTE : un écran qui réagit à un geste sans rien changer
     apprend à ne plus faire le geste. */
  const muets = [];
  const une = rendu({ pages: 1, surPage: (s) => muets.push(s) });
  une.querySelector('[data-organe="case-1-1"]')
    .dispatchEvent({ type: "wheel", deltaY: 1, preventDefault: () => { muets.push("empeche"); } });
  assert.deepEqual(muets, [], "⛔ et il ne prend même pas la molette au navigateur");
});

test("18 — 🔴 LE DÉFILEMENT PAR LA MARGE : un seul minuteur, au MODULE, et il s'arrête", () => {
  /* ⚖️ Eric, 18/09 : *« le drag dans la marge fait défiler latéralement les sections
     en maintenant le fantôme, ce qui permet de le déplacer d'une section à l'autre »*.
     📏 MESURÉ AU NAVIGATEUR, pas à pas : Potions → (seuil franchi, fantôme posé) →
     entré dans la marge gauche à +30 ms : Composants → maintenu à +500 ms : Trésor →
     relâché : Trésor, et plus rien ne tourne.
     ⛔ CE GARDE NE REJOUE PAS CE GESTE — il tient les trois invariants de STRUCTURE
     qui, eux, pourrissent en silence. */
  const source = fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8");

  /* ① LE MINUTEUR SE TIENT AU MODULE. 🔴 En fermeture il FUIT : chaque cran repeint
     l'écran, donc crée un nouvel objet d'écran, pendant que l'ancien minuteur
     continue — la roue serait partie toute seule et ne se serait plus arrêtée.
     C'est la loi de `gesteVivant` dans `glisser.mjs` : *« ce qui est partagé se tient
     au module, pas dans une fermeture »*. */
  assert.match(source, /^let defilementVivant = null;$/m,
    "⛔ le minuteur du défilement doit être une variable de MODULE");
  const dansUneFonction = source.slice(source.indexOf("function construireLeSac"));
  assert.doesNotMatch(dansUneFonction, /setInterval/,
    "⛔ un `setInterval` posé dans la construction de l'écran est un minuteur par repeint");

  /* ② LA MARGE VIENT DU PLAN, ⛔ pas d'un pour-cent écrit à la main : c'est tout ce
     qui est HORS de la largeur de la grille, et cette largeur est dans la table. */
  const marge = source.slice(source.indexOf("function margeDuGlisser"),
                            source.indexOf("export function arreteLeDefilement"));
  assert.match(marge, /COLONNES\[0\]/, "le bord gauche est la première colonne de la grille");
  assert.match(marge, /COLONNES\[COLONNES\.length - 1\] \+ JETON\.l/, "le bord droit est la fin de la dernière");
  assert.doesNotMatch(marge, /\d+\s*\/\s*100|0\.\d+\s*\*/, "⛔ aucun pour-cent inventé");
  /* ⛔ ET LE ZOOM SE LIT PAR SON ORGANE : un rectangle rend des pixels PEINTS, la
     mise en page des blg. Deux lecteurs du facteur finiraient par diverger. */
  assert.match(marge, /facteurZoomCourant\(document\)/,
    "⛔ le facteur du zoom se LIT sur la racine d'échelle, il ne se recalcule pas ici");

  /* ③ LE GESTE S'ARRÊTE PAR LES DEUX SORTIES. ⛔ Un geste qui se termine n'importe
     comment — dépôt, lâcher dans le vide, annulation — doit rendre la roue immobile. */
  const organe = source.slice(source.indexOf("function glisserDuSac"),
                              source.indexOf("/** Un tuner"));
  assert.match(organe, /onPoser:[^\n]*arreteLeDefilement\(\)/, "le lâcher arrête le défilement");
  assert.match(organe, /onDepot:[^\n]*arreteLeDefilement\(\)/, "le dépôt aussi");

  /* ④ ET LES DEUX ORGANES QUI GLISSENT PARTAGENT LE MÊME : une case et le collecteur.
     ⛔ Deux copies divergeraient au premier réglage — c'est la doctrine payée cinq
     fois dans ce chapitre (l'interrupteur, les chevrons, le jeton, le collecteur). */
  assert.equal((source.match(/armerJeton\(/g) || []).length, 1,
    "⛔ un seul `armerJeton` dans tout l'écran : le glisser est UN organe");
  assert.equal((source.match(/glisserDuSac\(/g) || []).length, 3,
    "sa définition, la case, le collecteur");
});

test("19 — ⚖️ LE BALAYAGE TOURNE LA PAGE, et il sait ne PAS être un glisser", () => {
  /* ⚖️ Eric, 18/09 au soir, après avoir tranché que les tuners sont une affaire de
     souris : *« reste le balayage, qui est accessible »*. ⭐ La molette tourne la page
     à la souris, le balayage la tourne au doigt — et c'est LUI le geste que tout le
     monde peut faire.
     📏 MESURÉ AU NAVIGATEUR, les cinq cas : gauche → 2/2 · droite → 1/2 · vertical →
     rien · trop court → rien · depuis un jeton → rien. */
  const tours = [];
  const n = rendu({ pages: 2, surPage: (s) => tours.push(s),
    objets: [{ index: 1, nom: "Dagger", qte: 1 }] });
  const vide = tous(n, ".sac-case").find((c) => c.dataset.occupe === undefined);
  const jeton = n.querySelector('[data-organe="case-1-1"]');
  const balaye = (cible, dx, dy) => {
    n.dispatchEvent({ type: "pointerdown", target: cible, clientX: 200, clientY: 100 });
    n.dispatchEvent({ type: "pointerup", target: cible, clientX: 200 + dx, clientY: 100 + dy });
  };

  balaye(vide, -90, 0);
  assert.deepEqual(tours, [1], "⭐ vers la GAUCHE = la page SUIVANTE, la convention du téléphone");
  balaye(vide, 90, 0);
  assert.deepEqual(tours, [1, -1], "et vers la droite, la précédente");

  /* ⛔ LES TROIS REFUS, et chacun a sa raison. */
  balaye(vide, -10, 90);
  balaye(vide, -20, 0);
  balaye(jeton, -90, 0);
  assert.deepEqual(tours, [1, -1],
    "⛔ un geste vertical appartient au défilement · un geste plus court qu'une CIBLE (44) " +
    "est un tap qui a tremblé · et un geste parti d'un JETON est un GLISSER, pas un balayage — " +
    "sans cette dernière règle, prendre un objet pour le déplacer tournerait la page sous lui.");

  /* ⛔ ET UNE SEULE PAGE NE SE BALAIE PAS : un écran qui réagit à un geste sans rien
     changer apprend à ne plus faire le geste. */
  const muets = [];
  const une = rendu({ pages: 1, surPage: (s) => muets.push(s) });
  const seule = tous(une, ".sac-case")[0];
  une.dispatchEvent({ type: "pointerdown", target: seule, clientX: 200, clientY: 100 });
  une.dispatchEvent({ type: "pointerup", target: seule, clientX: 110, clientY: 100 });
  assert.deepEqual(muets, []);

  /* ⭐ ET LE SEUIL NE S'INVENTE PAS : c'est le plancher tactile, pas un nombre choisi. */
  const source = fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8");
  assert.match(source, /const SEUIL_BALAYAGE = TOUCH;/,
    "⛔ un seuil écrit en clair serait un nombre de plus à tenir d'accord avec le plan");
});
test("20 — 🪞 UN DESSIN DÉCENTRÉ NE SE MIROITE PAS AUTOUR DE SA CIBLE", () => {
  /* 🔴 LA FAUTE DU 19/09, mesurée dans l'application : le chevron droit se peignait
     335..345 là où le plan le déclare 361..371 — 26 blg, SUR le mot du dernier cran.
     ⛔ ET AUCUNE COTE NE POUVAIT LE DIRE : la cible est symétrique au blg près (0..44
     et 331..375), donc la boîte était juste. C'est `transform-origin`, résolu par
     défaut sur la boîte de BORDURE, qui mirait un dessin décentré autour du mauvais
     centre — 22 au lieu de 35.
     ⭐ CE TÉMOIN NE MESURE PAS UNE COTE. Il demande à la feuille de DIRE sur quoi son
     miroir se prend, et il ne le demande QUE pour les organes que la TABLE dit
     décentrés : si le plan recentre un jour les tuners, la question tombe d'elle-même. */

  /* ① LA DONNÉE : le plan décentre-t-il encore le dessin des tuners dans leur cible ? */
  const ecart = (o) => [o.x - o.cible.x, (o.cible.x + o.cible.l) - (o.x + o.l)];
  const decentre = (o) => { const [g, d] = ecart(o); return Math.abs(g - d) > 0.01; };
  const tuners = D.ORGANES.filter((o) => o.sorte === "tuner");
  assert.ok(tuners.length >= 2, "⛔ le sac a perdu ses tuners : ce garde a changé de sujet");
  const decentres = tuners.filter((o) => o.cible && decentre(o));
  if (decentres.length === 0) return;   /* ⭐ plan recentré : plus de piège, plus de dette */

  /* ② LA FEUILLE : miroite-t-elle un de ces organes ? ⛔ sur le texte SANS commentaires */
  const REGLE = /([^{}]*)\{([^{}]*)\}/g;
  const blocs = [...stripComments(feuille).matchAll(REGLE)]
    .map(([, sel, corps]) => ({ sel: sel.trim(), corps }))
    .filter((b) => b.sel.includes(".sac-tuner"));
  assert.ok(blocs.length > 0, "⛔ `.sac-tuner` n'est plus habillé : le garde doit être réécrit");
  const mire = blocs.some((b) => /transform\s*:[^;]*scale[XxYy]?\(\s*-\s*1/.test(b.corps));
  assert.ok(mire,
    "⛔ plus aucun miroir sur `.sac-tuner` — si le chevron droit est peint autrement,\n" +
    "   ce garde ne protège plus rien et doit être réécrit, pas supprimé.");

  /* ③ ALORS ELLE DOIT RENDRE L'ORIGINE AU DESSIN */
  const rend = blocs.some((b) => /transform-box\s*:\s*content-box/.test(b.corps));
  assert.ok(rend,
    `⛔ ${decentres.map((o) => o.nom).join(" et ")} ont un dessin DÉCENTRÉ dans leur cible ` +
    `(écarts ${decentres.map((o) => ecart(o).join("/")).join(" · ")}), et la feuille les mire.\n` +
    "   Sans `transform-box: content-box`, le miroir se prend sur la CIBLE et le dessin\n" +
    "   repart de la somme des deux écarts — 26 blg le 19/09.");
});
