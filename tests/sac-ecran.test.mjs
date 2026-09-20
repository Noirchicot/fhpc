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
import { cranTypo } from "./source-scan.mjs";
import { stripComments } from "./source-scan.mjs";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
globalThis.document = createTestDocument();
const D = await import("../ui/builder/sac-disposition.mjs");
const jetons = stripComments(fs.readFileSync(path.join(UI, "tokens.css"), "utf8"));
const { construireLeSac, feuilleDesCotesSac, CLEF_DE, RANGS_GRILLE, COLS_GRILLE, CASES_DU_SAC,
        ORGANES_D_ECHANGE, MAINTIEN_MS, REPOS_MS, MARGE_MS, PEAGE_JETON_MS, poserLesDalles,
        CHAMPS_DE_SECTION } = await import("../ui/builder/sac-ecran.mjs");
const { coteDeLaCale } = await import("../ui/builder/roue-tambour.mjs");
const feuille = fs.readFileSync(path.join(UI, "shell.css"), "utf8");
const PLAN = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "sac-cotes.json"), "utf8"));

const tous = (n, sel) => [...n.querySelectorAll(sel)];

/* ══ ⏱️ ON ATTEND UNE CONDITION, ⛔ JAMAIS UNE DURÉE ═══════════════════════════
   🔴 CE QUE ÇA RÉPARE, ET C'EST ARRIVÉ LE 20/09 : le garde 26 est tombé sur `main`
   — `vues` rendait `[]` au lieu de `[2]` — et le code était JUSTE. Un sommeil fixe
   de `REPOS_MS + 80` doit CONTENIR un minuteur de 140 ms : 80 ms de marge. Sous
   charge (deux suites en parallèle sur la même machine), le corps du test a mis
   272,98 ms et l'assertion a mesuré trop tôt.
   ⛔ UN GARDE DONT LE VERDICT DÉPEND DE LA CHARGE DE LA MACHINE N'EST PAS UN GARDE,
   C'EST UN TIRAGE.

   ⭐ LA DISTINCTION QUI TRANCHE, et elle vaut pour tout ce fichier :
     · une attente qui doit CONTENIR un événement est une COURSE — elle se perd
       sous charge, et c'est elle qu'on remplace ;
     · une attente qui ne fait qu'AJOUTER DU TEMPS APRÈS coup (laisser un fantôme
       parler, vérifier qu'une roue jetée se TAIT) n'est pas une course : sous
       charge elle s'allonge, elle ne change pas de verdict. ⛔ Celles-là restent
       fixes — on ne peut pas attendre une ABSENCE.

   ⚠️ ET LA CONDITION DOIT ÊTRE MONOTONE. `vues.length > 0` l'est : un tableau qui
   ne fait que croître ne peut pas être surpris au mauvais instant. Une grandeur
   RÉVERSIBLE ne convient pas — guetter `roue.scrollLeft === pas` rendrait vert un
   code qui avance d'une tuile PUIS revient à zéro (le rouge du garde 34).

   ⭐ LE GARDE NE PERD PAS UNE DENT : si la condition n'arrive jamais, on brûle
   l'échéance entière et l'assertion qui suit accuse exactement comme avant. */
async function jusqua(condition, echeance = 3000) {
  const fin = Date.now() + echeance;
  while (Date.now() < fin) {
    if (condition()) return true;
    await new Promise((r) => setTimeout(r, 10));
  }
  return condition();
}
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

test("3 — 🔴 LA MARGE D'UNE TUILE SE DÉDUIT DE SA LARGEUR, ⛔ jamais d'un pour-cent CSS", () => {
  /* 🔴 FAUTE VUE AU BANC, premier rendu : `padding-inline: 7.5%` se résout sur la
     largeur du CONTENANT, pas sur celle du cran — 23,3 de chaque côté, et tous les
     crans affichaient « P… ». ⭐ Le pourcentage reste dans la table, la feuille en
     DÉDUIT un nombre.
     ⭐ ET IL N'EN DÉDUIT PLUS QU'UN SEUL depuis que la roue défile (Eric, 20/09) :
     toutes les tuiles font la MÊME largeur, c'est la LOUPE qui agrandit la posée et
     non sa boîte. Deux marges pour deux largeurs, c'était le monde d'avant. */
  const css = feuilleDesCotesSac();
  assert.doesNotMatch(css, /padding-inline:\s*[\d.]+%/,
    "⛔ un pour-cent de padding se résout chez le CONTENANT : il ne peut pas porter cette règle");
  const attendu = Math.round(D.ROUE.tuile * D.ROUE.margePct * 100) / 100;
  assert.ok(css.includes(
    `.sac .sac-cran{inline-size:${D.ROUE.tuile}px;block-size:${D.ROUE.hauteur}px;padding-inline:${attendu}px}`),
    `la tuile fait ${D.ROUE.tuile} × ${D.ROUE.hauteur} et sa marge ${attendu}`);

  /* 🔴 ET LA HAUTEUR EST LA MÊME POUR TOUTES — elle manquait, et rien ne le disait :
     chaque tuile prenait la hauteur de son texte, 11 pour `Party bag` et 25 pour
     `Backpack dropdown`, mesuré à l'écran le 19/09. Une rangée de pilules dépareillées.
     ⚖️ ET LA POSÉE GRANDIT SUR LES DEUX AXES — Eric, 19/09 au soir, en regardant le belt :
     *« la dalle centrale garde sa hauteur de 40 et largeur actuelle, les petites seront
     moins hautes aussi bien que moins larges »*. ⛔ Le matin il avait dicté l'inverse
     (*« 40 pour tout le monde en hauteur »*) ; c'est lui qui a retiré sa règle.
     ⭐ UN SEUL AGRANDISSEMENT, ET IL EST DÉJÀ DICTÉ : 71/57 = T1/T0. La boîte au repos se
     DÉDUIT de la posée, elle ne se tape pas — et le cadre de zoom tombe pile sur la posée
     parce qu'il EST sa boîte. */
  assert.equal(D.ROUE.hauteur, Math.round(D.ROUE.hauteurDominante / D.ROUE.loupe * 100) / 100,
    "⭐ la hauteur au repos se DÉDUIT de l'agrandissement — ⛔ elle ne se tape pas");
  assert.ok(css.includes(`.sac .sac-cran[data-dominant="oui"]{scale:${D.ROUE.loupe}}`),
    "⭐ un seul agrandissement, sur les deux axes — ⛔ plus rien à compenser");
  const loupe = D.ORGANES.find((o) => o.nom === "LOUPE");
  assert.equal(D.ROUE.hauteurDominante, loupe.h,
    "⚖️ et le cadre fait la hauteur de la POSÉE — les deux boîtes se superposent");
  assert.equal(D.ROUE.dominant, loupe.l, "en largeur aussi");
});

test("4 — 🔴 LE RUBAN S'ÉCARTE DE CE QU'IL FAUT POUR QUE LA PREMIÈRE TUILE SE CENTRE", () => {
  /* 🔴 CE GARDE TENAIT L'INVERSE HIER : les crans étaient NICHÉS dans la roue, et il
     vérifiait qu'ils se posaient par rapport à elle. ⛔ Plus aucun cran n'est posé —
     ils vivent dans le flux d'un ruban qui défile (Eric, 20/09).
     ⭐ CE QUI LE REMPLACE EST L'ARITHMÉTIQUE DU PAS : pour que la tuile `k` arrive SOUS LA
     LOUPE, il faut un vide aux deux bouts, et c'est lui qui rend `scrollLeft = pas × k` vrai.

     🔴 ET CE GARDE EXIGEAIT LA FORMULE FAUTIVE — il demandait `padding-inline: (piste − tuile)/2`,
     soit **137**. 📏 Mesuré le 21/09 : depuis le lot 218, le tambour partagé POSE deux cales que
     la feuille du sac ne dimensionnait pas. Une cale vide reste un élément flex, donc elle
     ajoutait un `gap` de 8 ENTRE le rembourrage et le premier cran : celui-ci commençait à 145,
     et centrer le cran `k` réclamait `8 + pas × k`. Le `scroll-snap` rattrapait les 8.
     ⛔ LE GARDE NE POUVAIT PAS LE VOIR, parce qu'il épelait un MÉCANISME (« un rembourrage de
     137 ») au lieu de vérifier ce que ce mécanisme doit RENDRE. Il aurait accusé la réparation,
     et c'est exactement ce qu'il a fait le 21/09.
     ⭐ IL DEMANDE DONC L'IDENTITÉ, et il la lit là où elle vit — dans le module qui POSE la cale :
     `cale + écart + tuile/2 = piste/2`. ⛔ Et le rembourrage doit avoir DISPARU : un ruban qui
     porterait les deux compterait le vide deux fois. */
  const css = feuilleDesCotesSac();
  const ecart = D.ROUE.pas - D.ROUE.tuile;
  assert.ok(css.includes(`.sac .sac-ruban{gap:${ecart}px}`),
    `le ruban espace les crans de ${ecart}`);
  assert.doesNotMatch(css, /\.sac-ruban\{[^}]*padding/,
    "⛔ le ruban porte ENCORE un rembourrage : avec les cales, le vide serait compté deux fois");
  const cale = coteDeLaCale(D.ROUE);
  assert.match(css, new RegExp(`\\.sac \\.roue-cale\\{[^}]*inline-size:${cale}px`),
    `⛔ la cale du sac ne vaut pas ${cale} : le premier cran ne tombera pas sous la loupe`);
  assert.match(css, /\.sac \.roue-cale\{[^}]*align-self:stretch/,
    "⛔ une cale sans hauteur ne compte pas dans le `scrollWidth` : le dernier cran n'arrive jamais");
  assert.equal(cale + ecart + D.ROUE.tuile / 2, D.ROUE.piste / 2,
    "⚖️ l'identité : cale + écart + demi-tuile = demi-piste");
  /* ⭐ ET LE PAS EST LA SOMME — ⛔ pas un nombre de plus */
  assert.equal(D.ROUE.pas, D.ROUE.tuile + (D.ROUE.pas - D.ROUE.tuile));
  assert.equal(D.ROUE.loupeX + D.ROUE.dominant / 2, D.DALLE.l / 2,
    "⚖️ la loupe est au centre de la dalle — donc à la place exacte qu'occupait le dominant");

  /* 🔴 ET CETTE MARGE NE COMPTE DANS LA COURSE QUE SI LE RUBAN A SA PROPRE LARGEUR.
     📏 Mesuré à l'écran le 19/09, en retirant `max-content` puis en le remettant :
     course **1241 avec, 1104 sans**, et l'écart vaut EXACTEMENT la marge de fin (137).
     ⚠️ La faute ne paraît pas là où on la cherche : les tuiles gardent leur 57 et le
     ruban défile quand même. Seulement, sans largeur propre, sa boîte est celle de sa
     fenêtre et la marge qui DÉPASSE ne compte pas : le dernier cran demande `pas × 14
     = 910` quand la course n'en offre que 773, et il n'arrive JAMAIS sous la loupe.
     ⛔ Un défileur qui défile n'est pas un défileur qui arrive — et c'est pour ça que
     ce garde-ci, celui de la marge, est aussi celui de `max-content`. */
  const bloc = [...stripComments(feuille).matchAll(/([^{}]*)\{([^{}]*)\}/g)]
    .map(([, sel, corps]) => ({ sel: sel.trim(), corps })).find((b) => b.sel === ".sac-ruban");
  assert.ok(bloc, "⛔ le ruban n'est plus habillé");
  assert.match(bloc.corps, /inline-size:\s*max-content/,
    "🔴 sans elle, la marge de fin sort de la course et les derniers crans n'atteignent plus la loupe");
});

test("5 — ⛔ `shell.css` ne porte AUCUNE cote du sac : elles vivent dans la feuille construite", () => {
  const i = feuille.indexOf("/* ══ L'ÉCRAN SB3.1 — LE SAC");
  assert.ok(i > 0, "le bloc du sac existe dans la feuille");
  const bloc = feuille.slice(i);
  assert.doesNotMatch(bloc, /\n\s*(left|top):\s*[\d.]+px/,
    "⛔ une position écrite ici serait une cote recopiée — elles sortent de la table");
});

test("6 — 🔴 LE RUBAN PORTE LES SECTIONS **UNE FOIS**, et ses bouts sont VIDES", () => {
  /* 🔴 CE GARDE TENAIT L'INVERSE HIER, ET C'EST ERIC QUI L'A RETOURNÉ — 2026-09-19 :
     *« que ça tourne à l'infini n'aide pas ; autorise l'absence de tuiles à droite et à
     gauche »*. ⛔ On peignait la liste TROIS fois et on rattrapait le défilement d'une
     longueur quand il quittait la copie du milieu.
     ⭐ CE QUI SE GAGNE EN LE RETIRANT, et ce n'est pas que de la simplicité : un anneau
     n'a pas de bout, donc il ne pouvait PAS dire « tu es au début » ni « tu es à la
     fin ». Le vide au bout de la liste EST l'information.
     📌 Et la marge du ruban `(piste − tuile) / 2` était déjà ce qu'il fallait : elle
     laisse la première et la dernière tuile arriver au centre, et ce qui reste à côté
     d'elles est de la piste nue. */
  const six = rendu({ sections: [1,2,3,4,5,6].map((i) => ({ nom: `S${i}` })), section: 2 });
  const crans = tous(six, ".sac-cran");
  assert.equal(crans.length, 6, "⭐ six sections, six tuiles — ⛔ plus de copies");
  assert.deepEqual(crans.map((c) => c.textContent), ["S1","S2","S3","S4","S5","S6"]);

  /* 🔴 ET AUCUNE SECTION NE PARAÎT DEUX FOIS — la loi qui remplace celle de la boucle.
     ⛔ Un ruban qui se répète ment sur ce qu'il contient : c'était déjà vrai sous trois
     sections, c'est vrai partout maintenant. */
  const positions = crans.map((c) => c.dataset.position);
  assert.equal(new Set(positions).size, positions.length,
    "⛔ une section paraît deux fois dans le ruban");
  assert.doesNotMatch(JSON.stringify(crans.map((c) => ({ ...c.dataset }))), /copie/,
    "⛔ plus de tours, donc plus de numéro de tour à porter");

  /* ⭐ UN SEUL DOMINANT, et c'est la section qu'on regarde */
  const dom = crans.filter((c) => c.dataset.dominant === "oui");
  assert.equal(dom.length, 1);
  assert.equal(dom[0].dataset.position, "2");

  const une = rendu({ sections: [{ nom: "Backpack" }], section: 0 });
  assert.equal(tous(une, ".sac-cran").length, 1, "une section, un cran");
  assert.equal(tous(une, ".sac-cran")[0].dataset.dominant, "oui");

  /* ⭐ ET LE DÉFILEMENT VISÉ EST LE RANG DE LA SECTION, au pas près — l'arithmétique
     du belt, débarrassée du tour du milieu. */
  assert.equal(Number(six.querySelector(".sac-roue").dataset.vise), 2,
    "la tuile visée est la 2ᵉ du ruban, et il n'y en a plus qu'un");

  const n = rendu({ sections: [{ nom: "A" }, { nom: "B" }, { nom: "C" }] });
  assert.equal(tous(n, ".sac-tuner").length, 2);
  /* ⛔ ET LA ROUE NOMME L'ÉCRAN — NORMES §1 quinquies : aucun titre n'est dû. */
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

test("10 — 🔴 LE CHEVRON POUSSE LE RUBAN D'UNE TUILE, ⛔ il ne saute plus", () => {
  /* ⚖️ Eric, 2026-09-20 : *« ils font défiler d'une tuile »*, et le tout doit être
     *« aussi fluide que dans le belt »*.
     🔴 CE GARDE TENAIT L'INVERSE : il vérifiait que le chevron appelait `surTourner`,
     c'est-à-dire qu'il SAUTAIT d'un cran. ⛔ Deux régimes de mouvement sur une même
     surface — l'un qui glisse, l'autre qui téléporte — rendent un écran illisible au
     doigt. Le chevron pousse maintenant du MÊME pas aimanté que le doigt.
     ⭐ ET LA MOLETTE S'AJOUTE TOUJOURS (Eric, 18/09) : le tap marche encore. */
  const n = rendu({ sections: [1,2,3,4,5,6].map((i) => ({ nom: `S${i}` })), section: 2 });
  const roue = n.querySelector(".sac-roue");
  const g = n.querySelector('[data-organe="tuner-g"]');
  const d = n.querySelector('[data-organe="tuner-d"]');

  /* 🔄 ET C'EST LE RUBAN DE DALLES QU'ILS POUSSENT DEPUIS LE 19/09, plus la roue.
     Eric : *« le glisser sur la grille change de section »* — donc une seule surface porte
     le mouvement, et la roue la suit. ⛔ Pousser la roue directement la désaccorderait des
     dalles d'une tuile à chaque clic, et personne ne l'aurait vu tout de suite. */
  /* ⚖️ ET C'EST LA ROUE QU'ILS POUSSENT — Eric, 19/09 : *« le swipe fait bouger les
     tuiles, les dalles suivent »*. ⛔ Pousser les dalles directement les désaccorderait
     de la roue, et personne ne l'aurait vu tout de suite. */
  const piste = n.querySelector(".sac-dalles");
  assert.ok(piste, "le ruban de dalles existe");

  roue.scrollLeft = D.ROUE.pas * 2;
  d.dispatchEvent({ type: "click" });
  assert.equal(roue.scrollLeft, D.ROUE.pas * 3, "⭐ le chevron droit avance d'UNE tuile");
  g.dispatchEvent({ type: "click" });
  assert.equal(roue.scrollLeft, D.ROUE.pas * 2, "et le gauche recule d'autant");

  let empeche = false;
  g.dispatchEvent({ type: "wheel", deltaY: -1, preventDefault: () => { empeche = true; } });
  assert.equal(roue.scrollLeft, D.ROUE.pas, "la molette pousse aussi — elle s'AJOUTE au tap");
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

  /* 🔄 LE VOILE A CHANGÉ DE PORTEUR LE 19/09, ⛔ PAS DE LOI. Eric : *« une transparence
     identique entre les dalles fixes et mobiles »*.
     🔴 CE QU'IL AVAIT VU : `.sac` portait le voile, et je venais d'en poser un SECOND sur
     la plaque mobile pour qu'elle se détache. 35 % sur 35 % — la plaque était plus sombre
     que ses voisines. ⛔ Un voile qui se superpose à lui-même n'est pas un réglage à
     corriger, c'est DEUX ÉCRIVAINS pour une seule matière.
     ⭐ La dalle du sac ne porte donc plus rien, et les TROIS bandes en portent une chacune
     — la même, celle du rang B. La question de ce garde ne bouge pas d'un mot : *le sac
     porte-t-il le voile de son rang, ou en peint-il un à lui ?* */
  assert.doesNotMatch(source, /el\("section",\s*"sac\s+dalle-/,
    "⛔ la dalle du sac ne porte plus de voile : sous les bandes, il se superposerait au leur");
  assert.equal(rendu().className, "sac", "et c'est bien ce que l'écran rend");

  const bandes = [...source.matchAll(/el\("div",\s*"sac-(?:bande|dalle)\s+(dalle-[a-z]+)"\)/g)]
    .map((m) => m[1]);
  assert.equal(bandes.length, 2, "⭐ deux déclarations : la bande fixe et la plaque mobile");
  for (const v of bandes) {
    assert.equal(v, temoin[1],
      `une bande porte \`${v}\` là où le témoin du rang B porte \`${temoin[1]}\`. ` +
      "Un rang décide de son voile ; copier celui du voisin est la faute du 18/09.");
  }
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
  assert.deepEqual(tous(sections, ".sac-etage").map((e) => e.textContent), ["edit", "sections"]);
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

test("15 — ⚖️ LE MODE ÉDITION : quatre poignées À CHEVAL sur les deux arêtes de la boîte regardée", () => {
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
  /* ⭐ ELLES S'ACCROCHENT À LA LOUPE, PAS À UN CRAN — et c'est ce qui les rend STABLES
     depuis que la roue défile (Eric, 20/09) : le cran passe, la loupe reste. ⛔ Le
     croquis disait déjà *« de la boîte sélectionnée »*, et la boîte sélectionnée est
     désormais celle qui est SOUS la loupe. Leur cote n'a pas bougé d'un blg : la loupe
     occupe la place exacte qu'avait le dominant. */
  const dom = D.ORGANES.find((o) => o.nom === "LOUPE");
  const pose = (nom) => D.ORGANES.find((o) => o.nom === nom);
  /* ⚖️ QUATRE POIGNÉES, SOUS LA TUILE, DANS LE PANNEAU — Eric, 2026-09-20, montage sur
     capture : *« les 4 boutons × / → ← sont juste sous le bouton à éditer »* · *« les 2
     boutons de création ne sont plus à l'intérieur des sections »*.
     🔴 CE QUE CE MONTAGE A SUPPRIMÉ, ET C'EST BEAUCOUP : elles étaient À CHEVAL sur les
     arêtes de la tuile, donc la flèche du haut tombait à −11 et mordait sur le belt ; il
     avait fallu descendre la roue ET la rangée d'outils de 11, et cacher `Encumbrance`
     pour que la place existe. ⭐ Tout cela disparaît parce que la QUESTION a changé de
     forme, pas parce qu'on l'a résolue.
     📌 ELLES SONT `dans: NOTICE`, donc leurs cotes sont relatives au panneau — le même
     mécanisme que les douze cases dans la plaque. Deux rangées de deux, centrées sous le
     viseur, `/` à gauche du `×` : renommer est le geste courant, effacer celui qu'on
     regrette, et le courant vient en premier dans le sens de lecture. */
  const centre = dom.x + dom.l / 2;
  for (const [p2, rangee, cote] of [["EDITER", 1, "gauche"], ["EFFACER", 1, "droite"],
                                    ["RECULER", 2, "gauche"], ["AVANCER", 2, "droite"]]) {
    assert.equal(pose(p2).dans, "NOTICE", `⛔ ${p2} doit vivre DANS le panneau`);
    assert.deepEqual([pose(p2).l, pose(p2).h], [30, 30], "⚖️ *« dessin 30×30 »* (19/09 au soir)");
    assert.deepEqual([pose(p2).cible.l, pose(p2).cible.h], [D.TOUCH, D.TOUCH],
      "⚖️ *« tactile 44×44 »* — ⛔ le dessin rétrécit, la cible ne descend jamais sous le plancher");
    const x = pose(p2).x + (cote === "gauche" ? pose(p2).l : 0);
    assert.equal(x, centre + (cote === "gauche" ? -4 : 4),
      `⚖️ ${p2} borde le centre du viseur, à une demi-gouttière — c'est ça, « juste sous le bouton à éditer »`);
  }
  assert.equal(pose("RECULER").y - pose("EDITER").y, pose("EDITER").h + 8,
    "⚖️ la seconde rangée tombe une gouttière sous la première");
  assert.equal(pose("EDITER").y, pose("EFFACER").y, "⚖️ et les deux du haut sont de niveau");
  /* ⛔ ET LA DESCENTE N'EXISTE PLUS : plus rien ne mord sur le belt, donc plus rien à
     descendre ni à cacher. Un reste de ce mécanisme serait un organe sans cause. */
  assert.equal(D.EDITION.decalage, undefined, "⛔ `decalage` a perdu sa raison d'être");
  const emiseSansDescente = feuilleDesCotesSac();
  assert.doesNotMatch(emiseSansDescente, /data-mode="edition"\] :is\([^)]*\)\{translate/,
    "⛔ plus personne ne descend en édition");
  assert.doesNotMatch(emiseSansDescente, /visibility:hidden/,
    "⛔ et `Encumbrance` n'a plus à se cacher : le panneau la recouvre");

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
  /* ⭐ ET LE CURSEUR EST DÉJÀ DEDANS — Eric, 2026-09-20 : *« / renommer (faire apparaître un
     curseur directement pour écrire, éviterait de devoir resélectionner) »*.
     ⛔ ET ÇA NE PEUT PAS SE FAIRE À LA CONSTRUCTION : un nœud hors document ne prend pas le
     focus — l'appel réussit et ne fait RIEN, en silence. C'est le piège du placement du
     ruban, et il se règle au même endroit : après la pose.
     ⭐ Le texte est SÉLECTIONNÉ : on renomme plus souvent qu'on ne complète, donc la
     première frappe doit remplacer. */
  const vu = [];
  champ.focus = () => vu.push("focus");
  champ.select = () => vu.push("select");
  assert.deepEqual(vu, [], "⛔ rien ne doit se passer avant que l'écran soit posé");
  poserLesDalles();
  assert.deepEqual(vu, ["focus", "select"], "⛔ le curseur doit arriver avec le champ");
  poserLesDalles();
  assert.deepEqual(vu, ["focus", "select"], "⛔ et une seule fois : un focus qui se rejoue vole le clavier");
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
  /* 🧹 LE RUBAN NE PORTE PLUS DE `+` — Eric, 2026-09-20 : *« les 2 boutons de création ne
     sont plus à l'intérieur des sections »*.
     🔴 CE GARDE A TENU TROIS ÉTATS DE CETTE ROUE, et c'est la même question à chaque
     fois : *que porte le ruban ?* Cinq places dont le texte change · trois copies et une
     téléportation · la liste nue plus deux `+` aux bouts · et maintenant la liste NUE.
     ⭐ CE QUI LE JUSTIFIE : un `+` n'est pas une section. Il occupait deux places dans une
     LISTE de sections, et il défilait — un bouton qui défile est un bouton qu'on cherche.
     ⛔ Le décalage du rang meurt avec lui : la tuile `i` est au rang `i` dans les deux
     modes, et une traduction qui ne traduit plus rien est une occasion de diverger. */
  const bout = rendu({ sections: cinq, section: 4, edition: true,
    surAjouter: (ou) => gestes.push(`ajouter:${ou}`) });
  const crans = tous(bout, ".sac-cran");
  assert.deepEqual(crans.map((c) => c.dataset.role || "section"), cinq.map(() => "section"),
    "⛔ le ruban ne porte QUE des sections, dans les deux modes");
  assert.deepEqual(crans.map((c) => c.textContent || c.value), cinq.map((x) => x.nom),
    "⛔ dans l'ordre, du premier au dernier");
  const rangs = crans.map((c) => c.dataset.position);
  assert.equal(new Set(rangs).size, rangs.length, "⛔ une section y paraît deux fois");

  /* ⚖️ ET LES DEUX CRÉATIONS VIVENT DANS LE PANNEAU, chacune disant CE QU'ELLE CRÉE —
     Eric, 19/09 au soir : *« au-dessus et en dessous du + vert : backpack / + / Storage »*
     · *« au-dessus et en dessous du + doré : Other / + / Storage »*. ⭐ Le mot du dessus
     dit OÙ, celui du dessous dit QUOI : c'est l'ORDRE qui porte la phrase. */
  const etages = (c) => [...c.childNodes].map((x) => x.textContent);
  const ajoutSac = bout.querySelector('[data-organe="ajout-sac"]');
  const ajoutDehors = bout.querySelector('[data-organe="ajout-dehors"]');
  assert.ok(ajoutSac && ajoutDehors, "⛔ les deux créations ont disparu du panneau");
  assert.deepEqual(etages(ajoutSac), ["+", "Backpack", "Storage"],
    "⚖️ le vert crée un rangement qui pèse dans `Backpack`");
  assert.deepEqual(etages(ajoutDehors), ["+", "Other", "Storage"],
    "⚖️ et le doré un rangement qui compte dans `Other` — le mot du panneau de poids");
  assert.equal(ajoutDehors.dataset.lieu, "dehors", "⭐ c'est ce `data-lieu` qui le dore");
  assert.equal(ajoutSac.dataset.lieu, undefined, "⛔ et le vert ne le porte pas");
  /* 🔴 ET LES DEUX SONT HABILLÉS — faute vue À L'ÉCRAN : leurs règles avaient manqué un
     tour EN SILENCE (un `replace` visant un sélecteur renommé deux commandes plus tôt), et
     ils sont sortis en BLANC, l'habit par défaut du navigateur, leurs deux étages sur une
     seule ligne. ⛔ Une écriture qui échoue sans bruit est pire qu'une lecture fausse. */
  const habits = [...stripComments(feuille).matchAll(/([^{}]*)\{([^{}]*)\}/g)]
    .map(([, sel, corps]) => ({ sel: sel.trim(), corps }));
  const base = habits.find((b) => b.sel === ".sac-ajout");
  assert.ok(base, "⛔ les deux créations ne sont plus habillées");
  /* ⚖️ *« bouton classique 40x71 (liseré vert fond sombre) »* · *« (liseré jaune fond
     sombre) »* — Eric, 20/09. ⭐ C'est la famille `gear-porte` : corps graphite pour tous,
     et l'ANNEAU du liseré porte le verbe par `--bouton-fond`. ⛔ Pas un fond plein : le
     jeton ne peint plus le corps depuis le lot 209, et une teinte écrite ici serait une
     troisième famille à habiller. */
  assert.match(base.corps, /--bouton-fond:\s*var\(--positive\)/, "⚖️ liseré VERT : on crée dans le sac");
  assert.match(base.corps, /display:\s*grid/, "⚖️ deux étages plus un `+`, donc une grille");
  assert.match(habits.find((b) => b.sel === '.sac-ajout[data-lieu="dehors"]').corps,
    /--bouton-fond:\s*var\(--dehors\)/, "⚖️ liseré JAUNE : ce qu'on crée là est un ailleurs");
  /* ⚖️ *« + en T3, texte du bouton en T1 ou T2 »* — le `+` est ce qu'on cherche des yeux,
     les mots ne font que dire OÙ ça atterrit. ⭐ T1 plutôt que T2 : `Backpack` et le `+`
     partagent 71 blg de large, et T2 les met à l'étroit. */
  assert.match(habits.find((b) => b.sel === ".sac-ajout-plus").corps, /font-size:\s*var\(--t3\)/,
    "⚖️ le `+` en T3");
  for (const sel of [".sac-ajout-ou", ".sac-ajout-quoi"])
    assert.match(habits.find((b) => b.sel === sel).corps, /font-size:\s*var\(--t1\)/,
      `⚖️ ${sel} en T1 — le cran en dessous, parce que le `+` prime`);
  for (const clef of ["AJOUT SAC", "AJOUT DEHORS"])
    assert.equal(pose(clef).dans, "NOTICE", `⛔ ${clef} doit vivre DANS le panneau`);
  ajoutSac.dispatchEvent({ type: "click" });
  ajoutDehors.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes.slice(-2), ["ajouter:sac", "ajouter:dehors"],
    "⛔ et le geste dit LEQUEL : deux boutons, deux destinations");
  const repos = rendu({ sections: cinq, section: 0 });
  /* 🧊 AU REPOS LE RUBAN NE BOUCLE PLUS — Eric, 19/09 : *« que ça tourne à l'infini
     n'aide pas ; autorise l'absence de tuiles à droite et à gauche »*. ⛔ Ce garde a
     tenu successivement les TROIS états de cette roue — cinq places dont le texte
     change, puis trois copies et une téléportation, puis la liste nue. C'est la même
     question à chaque fois : *que porte le ruban ?* */
  const auRepos = tous(repos, ".sac-cran");
  assert.equal(auRepos.length, cinq.length, "la liste, une fois — ⛔ plus de copies");
  assert.deepEqual(auRepos.map((c) => c.textContent), cinq.map((x) => x.nom),
    "⛔ et dans son ordre, du premier au dernier");
  assert.equal(tous(repos, '[data-role="ajouter"]').length, 0, "⛔ et il ne porte aucun `+`");
  assert.equal(repos.querySelector('[data-organe="notice"]'), null, "⛔ ni le panneau d'édition");
  /* ⭐ UN SEUL DOMINANT DANS CHAQUE ÉTAT — le halo est une LOUPE FIXE, et c'est la tuile
     qui passe dessous qui s'allume. ⛔ Deux allumées voudraient dire deux viseurs. */
  for (const x of [bout, repos]) {
    assert.equal(tous(x, '.sac-cran[data-dominant="oui"]').length, 1,
      "le halo et le zoom restent au centre — une seule tuile les porte à la fois");
  }
  assert.ok(repos.querySelector(".sac-loupe"), "⭐ et la LOUPE est là, fixe, sœur de la roue");
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

  /* ⑦ ⚖️ *« la hauteur des sections = 40 »* (Eric, 19/09) — et depuis le 20/09 c'est la
     LOUPE qui la déclare, parce que la table ne connaît plus cinq crans mais le cadre
     sous lequel ils passent.
     🔴 ET LA LARGEUR NE DIT PLUS LE DOMINANT — c'est le renversement de ce lot. Une
     boîte qui s'élargit en entrant dans le halo DÉCALE le défilement : c'est pour ça
     que le belt garde des tuiles égales et *« rallume »* la courante. ⭐ Ici la loupe
     AGRANDIT ce qui passe dessous, sans toucher à la mise en page. Toutes les tuiles
     font donc `ROUE.tuile`, et le rapport d'agrandissement est celui du plan. */
  assert.equal(pose("LOUPE").h, 40, "la loupe fait 40 de haut, comme les sections");
  assert.equal(pose("LOUPE").l, D.ROUE.dominant, "et sa largeur est celle du dominant d'avant");
  assert.ok(Math.abs(D.ROUE.loupe - D.ROUE.dominant / D.ROUE.tuile) < 0.001,
    "⭐ l'agrandissement EST `dominant / tuile` — ⛔ pas un facteur choisi");
  const t0 = parseFloat(cranTypo(jetons, "--t0"));
  const t1 = parseFloat(cranTypo(jetons, "--t1"));
  assert.ok(Math.abs(D.ROUE.loupe - t1 / t0) < 0.01,
    "🔴 ET C'EST AUSSI `T1 / T0` : les deux règles dictées le 18/09 sont LE MÊME RAPPORT.\n" +
    "   Un seul agrandissement les rend toutes les deux — c'est ce qui permet de\n" +
    "   supprimer le `font-size` du dominant sans rien perdre.");
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

  /* ⑤ ⏱️ LA LATENCE EST CELLE QU'ERIC A DITE — 2026-09-19 : *« le drag and drop aura
     une latence de 500 ms avant de sauter d'une dalle à l'autre »*.
     🔴 ET ELLE VAUT AUSSI POUR LE PREMIER SAUT. Le code partait sur-le-champ à l'entrée
     dans la marge, avec ma raison écrite à côté : *« sinon la marge semble morte »*.
     ⛔ C'était mon raisonnement, pas le sien, et il ne tient plus : depuis que les
     dalles glissent, un doigt qui porte un objet traverse forcément une marge en
     chemin, et l'écran partirait sous lui à chaque fois.
     ⭐ UNE SEULE COTE POUR LES DEUX ATTENTES : deux nombres pour une question
     divergeraient au premier réglage. */
  assert.equal(MARGE_MS, 500, "⚖️ la latence dictée le 19/09");
  const lanceur = source.slice(source.indexOf("function regardeLaMarge"),
                               source.indexOf("/** Le glisser d'un jeton du sac"));
  assert.doesNotMatch(lanceur, /options\.surTourner\(sens\);\s*\n/,
    "⛔ un premier saut posé hors du minuteur est un saut immédiat : la latence ne le couvre pas");
  assert.match(lanceur, /setInterval\([\s\S]*?,\s*MARGE_MS\)/,
    "⭐ tout passe par le minuteur, donc tout attend — le premier saut comme les suivants");
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
test("21 — 📏 LES TROIS ÉTAGES DU `+` TIENNENT DANS LE CRAN, et ça se CALCULE", () => {
  /* ⚖️ Eric, 2026-09-19 au soir : *« si ça passe en T1 fais en T1 italique »* · *« ou T0
     italique »*. ⭐ SA RÈGLE EST UNE MESURE, PAS UN GOÛT — essaie le grand, tombe au petit
     s'il ne rentre pas. Ce témoin fait l'essai à la place de celui qui écrira demain.
     🔴 CE QUI A ÉTÉ PAYÉ EN LE POSANT : T1 passait en LARGEUR (`backpack` rend 48,05 pour
     48,46 utiles — de 0,41 blg) et j'ai failli m'arrêter là. C'est la HAUTEUR qui refusait,
     et `.sac-cran` porte `overflow: hidden` : un blg rogné, en silence, sans une ligne de
     console. ⛔ Regarder une seule dimension d'une boîte à deux dimensions.
     ⭐ ET CE GARDE NE RECOPIE AUCUN NOMBRE : il lit les jetons, l'interligne du cran et la
     hauteur du cran DANS LE PLAN, et refait l'addition. Si un jeton bouge, il refait.
     ⛔ La LARGEUR, elle, ne se calcule pas ici — il n'y a pas de métrique de police sous
     Node. Elle a été mesurée dans l'application, et c'est écrit dans `shell.css`. */
  const css = stripComments(feuille);
  const jetons = stripComments(fs.readFileSync(path.join(UI, "tokens.css"), "utf8"));
  const jeton = (nom) => {
    const cran = cranTypo(jetons, `--${nom}`);
    if (cran) return parseFloat(cran);
    const m = jetons.match(new RegExp(`--${nom}\\s*:\\s*([\\d.]+)px`));
    assert.ok(m, `⛔ le jeton --${nom} a disparu : ce garde doit être réécrit, pas supprimé`);
    return parseFloat(m[1]);
  };
  /* 🔄 DANS LA LISTE, ⛔ PAS UNE ÉGALITÉ — même correction que le second `bloc` de ce fichier
     (lot 221) : une règle partagée avec `.wares-cran` est la MÊME règle, et exiger que le
     sélecteur soit seul, c'est épeler une implémentation. On compare des membres DÉCOUPÉS,
     donc `.sac-cran-champ` ne répond pas pour `.sac-cran`. */
  const bloc = (selecteur) => {
    const b = [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)]
      .map(([, sel, corps]) => ({ membres: sel.split(",").map((m) => m.trim()), corps }))
      .find((x) => x.membres.includes(selecteur));
    assert.ok(b, `⛔ la règle \`${selecteur}\` n'existe plus : ce garde doit être réécrit`);
    return b.corps;
  };

  /* ① l'interligne et la hauteur viennent d'où ils sont ÉCRITS */
  const lh = parseFloat(bloc(".sac-cran").match(/line-height:\s*([\d.]+)/)[1]);
  /* ⭐ LA HAUTEUR D'UNE TUILE EST CELLE DE LA LOUPE — depuis que la roue défile, la
     table ne déclare plus cinq crans : elle déclare le cadre sous lequel ils passent,
     et toutes les tuiles font sa hauteur. */
  const cran = D.ORGANES.find((o) => o.nom === "LOUPE");
  assert.ok(cran && cran.h > 0, "⛔ le plan ne déclare plus de loupe : ce garde a changé de sujet");

  /* ② les deux tailles de la pile : celle des mots, celle du signe */
  const taille = (corps) => {
    const m = corps.match(/font-size:\s*var\(--(t\d)\)/);
    assert.ok(m, "⛔ une taille en littéral ici serait un nombre de plus à tenir d'accord");
    return jeton(m[1]);
  };
  const mot = taille(bloc('.sac-cran[data-role="ajouter"] .sac-etage'));
  const signe = taille(bloc('.sac-cran[data-role="ajouter"]'));

  /* ③ L'ADDITION — une ligne occupe `ceil(taille × interligne)`, comme le navigateur */
  const ligne = (px) => Math.ceil(px * lh);
  const pile = ligne(mot) + ligne(signe) + ligne(mot);
  assert.ok(pile <= cran.h,
    `⛔ les trois étages font ${pile} blg (${ligne(mot)} + ${ligne(signe)} + ${ligne(mot)}, ` +
    `interligne ${lh}) dans un cran de ${cran.h} — et \`.sac-cran\` porte \`overflow: hidden\`, ` +
    "donc le débord se ROGNE sans rien dire.\n" +
    "   ⭐ Eric a nommé la sortie lui-même : si ça ne passe pas en T1, c'est T0 (19/09).\n" +
    "   ⛔ Ne serre PAS l'interligne pour sauver la taille du dessus : ce serait inventer\n" +
    "      une cote qu'il n'a pas donnée.");

  /* ④ ET L'ITALIQUE EST LA PHRASE, PAS L'ORNEMENT : ces deux mots ne nomment pas le cran,
     ils disent ce que le `+` va FAIRE. En romain ils se liraient comme des sections. */
  assert.match(bloc('.sac-cran[data-role="ajouter"] .sac-etage'), /font-style:\s*italic/,
    "⚖️ *« T1 italique »* · *« ou T0 italique »* — l'italique, lui, n'était pas au choix");
});
test("22 — 🔴 LES TROIS ORGANES D'ÉCHANGE ONT LEUR FIL, ⛔ ou se montrent inertes", () => {
  /* 🔴 LA FAUTE, MESURÉE À L'ÉCRAN LE 19/09 AU SOIR : un clic sur la bourse du sac ne
     produisait RIEN. Les trois boutons existaient depuis le 18/09 et appelaient bien
     `surPorte(id)` — mais le `surPorte` du sac ne connaissait que `gear`, `wares` et
     `send`. ⛔ Trois organes posés sans leur fil, et c'est la QUATRIÈME fois que ce lot
     paie cette faute, après la poignée `/`, le `×` et le `+`.
     ⭐ CE GARDE NE VÉRIFIE PAS QU'UN BOUTON EXISTE — il vérifie qu'il PARLE. Un témoin
     qui compte des boutons aurait été vert tout du long. */
  const gestes = [];
  const n = rendu({ surPorte: (id) => gestes.push(id), compteurs: { tally: 3, "party-tally": 0 } });

  const bourse = n.querySelector('[data-organe="purse"]');
  const tally = n.querySelector('[data-organe="tally"]');
  const groupe = n.querySelector('[data-organe="party-tally"]');
  assert.ok(bourse && tally && groupe, "les trois sont là");

  bourse.dispatchEvent({ type: "click" });
  tally.dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, ["purse", "tally"],
    "⭐ les deux qui ont un destinataire publient leur geste — c'est ce qui manquait");

  /* ⚖️ ET LE GROUP TALLY SE MONTRE INERTE — la loi du produit : *« une place réservée
     se montre inerte »*. ⛔ Il n'existe qu'EN JEU ; un bouton qui accepte le doigt et
     ne répond jamais apprend à ne plus toucher. */
  assert.equal(groupe.disabled, true, "⛔ il ne fait pas SEMBLANT d'écouter");
  assert.equal(groupe.dataset.compte, "0");

  /* ⭐ ET LA BOURSE EST CELLE DE R, PAS UNE SECONDE — même organe, même habit. */
  const ouverte = rendu({ bourseOuverte: true, bourse: { gp: 8, sp: 12, cp: 4, pp: 0 } });
  const voile = ouverte.querySelector('[data-organe="bourse-voile"]');
  assert.ok(voile, "⛔ le popup se peint DANS le sac : sans lui le bouton bascule un état que rien ne montre");
  assert.equal(voile.querySelector(".gear-bourse").getAttribute("aria-label"), "Purse",
    "⭐ `gear-bourse` — la classe de R : une seconde bourse divergerait au premier réglage");
  const source = fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8");
  assert.match(source, /import \{ popupDeLaBourse, reglesDeLaBourse, montantDeLaBourse \} from "\.\/gear-ecran\.mjs/,
    "⛔ le sac IMPORTE l'organe, il ne le redessine pas — le dessin, ses cotes ET son montant");
  /* 🔴 ET LE MONTANT SE VOIT SANS OUVRIR LA BOURSE — Eric, 2026-09-20 : *« le montant
     total n'est visible sur la bourse »*. ⛔ Il n'existait que dans R : même organe, même
     moitié laissée chez son premier hôte que les cotes du popup une heure plus tôt. Le sac
     montrait donc une bourse MUETTE — on l'ouvrait pour savoir ce qu'elle contient, quand
     R le dit sans l'ouvrir. ⭐ Et c'est le MÊME nombre vu à deux endroits : l'écrire de
     deux façons ferait douter que ce soit le même (Eric, 17/09). */
  const avecOr = rendu({ bourse: { gp: 8, sp: 12, cp: 4, pp: 0 } });
  const montant = avecOr.querySelector('[data-organe="montant"]');
  assert.ok(montant, "⛔ la bourse du sac est muette : il faut l'ouvrir pour la lire");
  assert.match(montant.textContent, /gp/, "⭐ et il porte son unité, comme dans R");
  const placeDuMontant = feuilleDesCotesSac().match(/\.sac \.gear-montant\{[^}]*top:([\d.]+)px/);
  assert.ok(placeDuMontant, "⛔ et il n'a pas de place : il retomberait dans le flux");
  const ancreP = D.ORGANES.find((o) => o.nom === "PURSE");
  /* ⚖️ **SUR** LA BOURSE, pas dessous — Eric, 2026-09-20 : *« le montant doit être SUR la
     bourse »*. 🔴 Je l'avais mis DESSOUS en recopiant le repli de R — or R a de la place
     sous sa bourse et le sac n'en a pas : la rangée d'échange finit là. ⛔ Recopier une
     DISPOSITION d'un écran à l'autre, c'est recopier ses contraintes avec. */
  assert.equal(Number(placeDuMontant[1]), ancreP.y,
    "⚖️ le montant se pose SUR la bourse : sa boîte est celle de la bourse");
  const hauteurDuMontant = feuilleDesCotesSac().match(/\.sac \.gear-montant\{[^}]*height:([\d.]+)px/);
  assert.ok(hauteurDuMontant && Number(hauteurDuMontant[1]) === ancreP.h,
    "… et sa hauteur aussi — le nombre se lit DANS l'image");
  /* 🔴 ET LES COTES VIENNENT AVEC LUI — Eric, 2026-09-20 : *« la bourse, je veux la même
     que dans Gear, et centrée sur l'emplacement de la bourse dans B1 »*.
     ⛔ LE POPUP SORTAIT SANS COTES : ses règles n'existaient que sous `.gear`, donc il se
     dimensionnait sur son contenu et naissait n'importe où. Un organe partagé dont la
     MOITIÉ reste chez son premier hôte n'est pas partagé — c'est la faute de ce lot en
     entier (le collecteur, les chevrons, le jeton, le glisser, l'interrupteur), payée une
     fois de plus. ⭐ Les mêmes règles s'ÉMETTENT pour l'autre portée ; deux listes
     divergeraient au premier réglage de la bourse. */
  const emiseBourse = feuilleDesCotesSac();
  assert.match(emiseBourse, /\.sac \.gear-bourse\{width:/,
    "⛔ la bourse du sac n'a pas de boîte : elle se dimensionnerait sur son contenu");
  const ancre = D.ORGANES.find((o) => o.nom === "PURSE");
  const place = emiseBourse.match(/\.sac \.gear-bourse\{left:([\d.]+)px;top:([\d.]+)px\}/);
  assert.ok(place, "⛔ et elle n'a pas de place : *« centrée sur l'emplacement de la bourse dans B1 »*");
  /* ⚖️ CENTRÉE SUR SA PROPRE PLACE, puis serrée dans la dalle — un popup centré sur une
     bourse posée près du bord sortirait de l'écran sans qu'aucune cote ait l'air fausse. */
  const attendu = Math.min(Math.max(ancre.x + ancre.l / 2 - 186 / 2, D.MARGE), D.DALLE.l - 186 - D.MARGE);
  assert.ok(Math.abs(Number(place[1]) - attendu) < 0.01,
    `⚖️ centrée sur la bourse du SAC (x ${ancre.x}), pas sur celle de R`);

  /* ⑤ ⚠️ ET CE GARDE-CI NE VOIT QUE L'ÉCRAN — il est INCAPABLE de voir le fil. Je l'ai
     éprouvé : en retirant l'écouteur dans `equipment-step.mjs`, il est resté VERT, et
     une première version qui cherchait `id === "purse"` dans la source est restée verte
     aussi — cette chaîne existe AUSSI chez R. *Un témoin qui ne peut jamais accuser est
     le pire de tous.*
     ➡️ LE VRAI TÉMOIN EST AILLEURS, et il clique pour de bon : `equipement-pipeline`,
     « LE FIL DE LA BOURSE DU SAC ». Celui-ci garde ce qu'il sait garder — que l'écran
     PUBLIE, et que l'inerte se montre inerte. */
});
test("23 — \u2702\ufe0f UN SEUL MODE EDIT : les quatre poign\u00e9es remplacent le maintien de 1,5 s", async () => {
  /* \u2696\ufe0f Eric, 2026-09-19 au soir, croquis \u00ab EDIT MODE 1 \u00bb \u00e0 l'appui : *\u00ab il n'y a d\u00e9sormais
     qu'un seul edit mode \u00bb* \u00b7 *\u00ab les fl\u00e8ches permettent de d\u00e9placer le storage \u00e0 droite et
     \u00e0 gauche \u00bb*.
     \ud83d\udd34 CE GARDE TENAIT LE MODE QUI DISPARA\u00ceT, et il le tenait bien : *\u00ab le x, +, /
     disparaissent pour voir l'ordre des sections \u00bb*, toute la roue sur un fond cr\u00e8me,
     ouverte par un maintien de 1,5 s. \u26d4 On ne retourne pas une dict\u00e9e en silence \u2014 celle
     du 19/09 au matin est ABROG\u00c9E PAR SON AUTEUR le m\u00eame soir, et ce garde change de
     question avec sa date.
     \u2b50 CE QUI SE GAGNE : un mode qu'on d\u00e9couvre en maintenant est un mode que personne ne
     trouve, et deux modes dans un mode, personne ne les distingue. Deux boutons visibles
     disent la m\u00eame chose, tout le temps. \ud83d\udccc Ce qui meurt avec : un minuteur de 1,5 s, un
     seuil de tremblement, trois phases, un `elementFromPoint` par image, l'\u00e9tat `tenu`
     sur les crans et un r\u00e9gime de dessin pour toute la roue. */
  const cinq = [{ nom: "A" }, { nom: "B" }, { nom: "C" }, { nom: "D" }, { nom: "E" }];
  const gestes = [];
  const edite = rendu({ sections: cinq, section: 1, edition: true,
    surDeplacerSection: (sens) => gestes.push(sens) });

  /* \u2460 LES QUATRE POIGN\u00c9ES SONT L\u00c0, ET LES DEUX `+` AUSSI */
  for (const clef of ["reculer", "avancer", "effacer", "editer"])
    assert.ok(edite.querySelector(`[data-organe="${clef}"]`), `\u26d4 la poign\u00e9e ${clef} manque`);
  /* 🧹 ET LES DEUX CRÉATIONS ONT QUITTÉ LE RUBAN (20/09) : elles sont dans le panneau. */
  assert.equal(tous(edite, '.sac-cran[data-role="ajouter"]').length, 0,
    "⛔ un `+` dans le ruban est un bouton qui défile — et une place dans une liste de sections");
  for (const clef of ["ajout-sac", "ajout-dehors"])
    assert.ok(edite.querySelector(`[data-organe="${clef}"]`), `⛔ la création ${clef} manque au panneau`);

  /* \u2461 LES FL\u00c8CHES D\u00c9PLACENT, ET ELLES DISENT LEUR SENS */
  edite.querySelector('[data-organe="reculer"]').dispatchEvent({ type: "click" });
  edite.querySelector('[data-organe="avancer"]').dispatchEvent({ type: "click" });
  assert.deepEqual(gestes, [-1, 1], "\u26d4 un seul geste pour deux sens serait \u00e0 deviner");

  /* \u2462 \u26d4 ET UNE FL\u00c8CHE S'\u00c9TEINT AU BOUT DE LA COURSE \u2014 *\u00ab non color\u00e9 = non cliquable \u00bb* :
     un bouton qui s'allume pour refuser est pire qu'un bouton \u00e9teint. */
  const premier = rendu({ sections: cinq, section: 0, edition: true });
  assert.equal(premier.querySelector('[data-organe="reculer"]').disabled, true, "\u26d4 rien \u00e0 gauche du premier");
  assert.equal(premier.querySelector('[data-organe="avancer"]').disabled, false);
  const dernier = rendu({ sections: cinq, section: 4, edition: true });
  assert.equal(dernier.querySelector('[data-organe="avancer"]').disabled, true, "\u26d4 ni \u00e0 droite du dernier");

  /* \u2463 \ud83e\uddf9 ET LE SECOND MODE N'EXISTE PLUS NULLE PART \u2014 \u26d4 pas \u00ab cach\u00e9 \u00bb : un \u00e9tat qui
     survit dans le code revient par une porte qu'on n'a pas referm\u00e9e. */
  const source = stripComments(fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8"));
  for (const mort of ["armerLeDeplacement", "surDeplacer\\(", "data-tenu", "dataset\\.tenu",
                      "options\\.deplacement", "dataset\\.deplacement"])
    assert.doesNotMatch(source, new RegExp(mort),
      `\u26d4 \`${mort}\` survit au mode qui l'employait \u2014 il n'a plus personne pour l'appeler`);
  assert.equal(rendu({ sections: cinq, section: 1, edition: true }).dataset.deplacement, undefined,
    "\u26d4 et la dalle ne porte plus son \u00e9tat");

  /* \u2465 \ud83d\udccb LA NOTICE RECOUVRE LA GRILLE \u2014 *\u00ab elle recouvre la grille (elle ne remplace
     pas) \u00bb* : sa bo\u00eete est EXACTEMENT celle des douze jetons, donc les 8 blg de marge de la
     plaque restent visibles tout autour. \u26d4 Une notice qui mangerait la plaque ferait
     croire \u00e0 un autre \u00e9cran. */
  const notice = edite.querySelector('[data-organe="notice"]');
  assert.ok(notice, "\u26d4 la notice du mode edit manque");
  assert.equal(rendu({ sections: cinq, section: 1 }).querySelector('[data-organe="notice"]'), null,
    "\u26d4 et elle ne para\u00eet QUE en \u00e9dition");
  const boite = D.ORGANES.find((o) => o.nom === "NOTICE");
  /* \u2696\ufe0f *\u00ab recouvre parfaitement la dalle pour faire bien joli, sans recouvrir le
     s\u00e9lecteur \u00bb* (Eric, 20/09). \u26d4 Ses deux bornes ne se tapent pas : il commence \u00e0
     l'ar\u00eate BASSE de la roue et finit au bas de la dalle. \u00ab Parfaitement \u00bb veut dire
     qu'on ne voit rien d\u00e9passer \u2014 ni en haut, ni en bas, ni sur les c\u00f4t\u00e9s. */
  const roueOrg = D.ORGANES.find((o) => o.nom === "ROUE");
  assert.deepEqual([boite.x, boite.l], [0, D.DALLE.l], "\u2696\ufe0f toute la largeur, bord \u00e0 bord");
  assert.equal(boite.y, roueOrg.y + roueOrg.h, "\u2696\ufe0f il commence o\u00f9 le s\u00e9lecteur finit \u2014 et ne le recouvre pas");
  assert.equal(boite.y + boite.h, D.DALLE.h, "\u2696\ufe0f et il finit au bas de la dalle");
  /* 🔴 ET TOUT CE QUE LE PANNEAU PORTE A UNE BOÎTE AU PLAN — faute vue À L'ÉCRAN :
     en réécrivant le bloc du générateur j'ai avalé la déclaration de `ENCART`. Le nœud
     a continué d'exister, il a simplement perdu sa place : sans règle il retombe dans
     le FLUX, remonte en haut du panneau et se peint PAR-DESSUS les sept boutons.
     ⛔ Et rien ne rougissait : le garde du plan ne voit que ce qui est déclaré, et
     l'écran ne se plaint pas d'un organe qu'il pose sans cote. ⭐ Ce témoin ferme le
     trou par les DEUX bouts : il énumère les enfants réels du panneau et exige que la
     feuille construite les pose — donc qu'ils existent dans la table. */
  const posees = feuilleDesCotesSac();
  for (const enfant of [...notice.childNodes]) {
    const clef = enfant.dataset && enfant.dataset.organe;
    assert.ok(clef, "⛔ un enfant du panneau sans `data-organe` ne peut pas être posé");
    assert.ok(posees.includes(`[data-organe="${clef}"]`),
      `⛔ \`${clef}\` est posé dans le panneau mais n'a pas de boîte au plan : ` +
      "il retombera dans le flux et se peindra par-dessus les autres");
  }
  /* \u2696\ufe0f *\u00ab l\u00e9gendes des 4 poign\u00e9es, explication des couleurs, ce qui s'efface ce qui ne
     s'efface pas \u00bb*. \u26d4 ET LA DERNI\u00c8RE LIGNE SE D\u00c9DUIT DES SECTIONS : un texte qui nomme
     des donn\u00e9es \u00e0 la main ment le jour o\u00f9 le socle change. */
  assert.deepEqual(tous(notice, ".sac-notice-signe").map((n) => n.dataset.signe),
    ["editer", "effacer", "reculer", "avancer"],
    "\u26d4 l'encart lit les quatre boutons DANS L'ORDRE O\u00d9 ILS SONT POS\u00c9S \u2014 une l\u00e9gende qui " +
    "ne suit pas le dessin oblige \u00e0 chercher");
  /* \ud83d\udd34 ET ELLE EST OPAQUE \u2014 faute vue \u00c0 L'\u00c9CRAN au premier rendu, pas au banc : avec la
     mati\u00e8re d'un bloc int\u00e9rieur (35 %) on lisait `Belt of Dwarvenkind` \u00c0 TRAVERS la notice.
     \u26d4 Une notice qu'on voit au travers fait croire que les jetons sont encore
     atteignables \u2014 or elle les recouvre. \u2b50 Le mot est celui de la maison
     (`--voile-majeure`, 100 %), pas une couleur \u00e9crite \u00e0 la main. */
  const habitDeLaNotice = [...stripComments(feuille).matchAll(/([^{}]*)\{([^{}]*)\}/g)]
    .map(([, sel, corps]) => ({ sel: sel.trim(), corps })).find((b) => b.sel === ".sac-notice");
  assert.ok(habitDeLaNotice, "\u26d4 la notice n'est plus habill\u00e9e");
  /* \u2696\ufe0f *\u00ab bo\u00eete noire comme pour Sort \u00bb* \u00b7 *\u00ab avec contour bleu \u00bb* \u00b7 *\u00ab enfin, m\u00eame
     couleur que les boutons quoi \u00bb* \u2014 Eric, 20/09, en trois temps. \u2b50 C'est donc la FACE
     des boutons, pas une teinte \u00e0 elle : celle de `Sort`, `Gear`, `Send`, `Wares`.
     \ud83d\udd35 Et le liser\u00e9 est BLEU l\u00e0 o\u00f9 le popup l'a rouge : ce panneau ne pr\u00e9vient de rien,
     il \u00e9dite. \ud83d\udd34 Opaque : au premier rendu on lisait `Belt of Dwarvenkind` \u00c0 TRAVERS. */
  assert.match(habitDeLaNotice.corps, /background:[^;]*var\(--bouton-face\)/,
    "\u26d4 le panneau doit MASQUER, pas voiler \u2014 et c'est la face des boutons");
  assert.match(habitDeLaNotice.corps, /border:[^;]*var\(--info\)/,
    "\u2696\ufe0f *\u00ab bo\u00eete noire avec contour bleu \u00bb*");
  /* 🔴 ET LE SECOND PLAN DE L'ENCART SE PREND DANS L'ENCRE DU PANNEAU — Eric, 20/09,
     capture iPad de nuit : *« rendu du texte sur iPad en nuit pas bon »*.
     ⛔ `--text-soft` est calibré contre `--surface`, la surface de la PAGE, pas contre une
     face de BOUTON : sur le brun du panneau il rendait ~2,7:1 et les paragraphes
     mouraient, pendant que les titres tenaient (ils héritent de `--bouton-encre`).
     ⭐ Un jeton se lit DANS SA FAMILLE : le second plan est l'encre du panneau,
     affaiblie — et elle suit le thème toute seule, comme son parent. */
  const tous2 = [...stripComments(feuille).matchAll(/([^{}]*)\{([^{}]*)\}/g)]
    .map(([, sel, corps]) => ({ sel: sel.trim(), corps }));
  for (const sel of [".sac-encart-fige", ".sac-encart-deux dd, .sac-encart-figees dd"]) {
    const b2 = tous2.find((x) => x.sel === sel);
    assert.ok(b2, `⛔ ${sel} n'est plus habillé`);
    assert.doesNotMatch(b2.corps, /var\(--text-soft\)/,
      "⛔ `--text-soft` est l'encre douce de la PAGE : sur une face de bouton elle meurt");
    assert.match(b2.corps, /var\(--bouton-encre\)/,
      "⭐ le second plan se prend dans l'encre du panneau lui-même");
  }
  const fige = rendu({ sections: [{ nom: "Party bag", fige: true, renommable: false }, { nom: "B" }],
                       section: 1, edition: true }).querySelector(".sac-encart-fige");
  assert.match(fige.textContent, /Party bag cannot be deleted/);
  assert.match(fige.textContent, /Party bag cannot be renamed/);
  /* \u2696\ufe0f ET LES DEUX SECTIONS QU'ON NE PEUT PAS EFFACER S'EXPLIQUENT \u2014 Eric, 20/09 :
     *\u00ab on ne peut pas effacer le party bag : le party bag explications \u00bb* \u00b7 *\u00ab le backpack
     dropdown non plus : explication de ce que c'est aussi \u2014 tout atterrit l\u00e0 \u00bb*.
     \u2b50 ELLES SE D\u00c9SIGNENT PAR CE QU'ELLES SONT, \u26d4 pas par leur nom \u00e9crit dans le code : le
     party porte `party`, le d\u00e9p\u00f4t est la section fig\u00e9e qui n'est pas lui. Un texte qui
     \u00e9crit \u00ab Party bag \u00bb \u00e0 la main ment le jour o\u00f9 le socle change de mot \u2014 et il a chang\u00e9
     deux fois en deux jours sur cet \u00e9cran.
     \ud83d\udccc UN BOUTON \u00c9TEINT NE DIT PAS POURQUOI : l'\u00e9cran montre d\u00e9j\u00e0 que la poign\u00e9e refuse,
     il ne dit pas ce que la section EST. */
  const deux = rendu({ sections: [{ nom: "Party bag", party: true, fige: true, renommable: false },
                                  { nom: "Backpack dropdown", fige: true }, { nom: "B" }],
                       section: 2, edition: true }).querySelector(".sac-encart-figees");
  const dits = [...deux.childNodes].map((x) => x.textContent);
  assert.equal(dits[0], "Party bag");
  assert.match(dits[1], /whole party/, "\u26d4 le party bag doit dire ce qu'il EST");
  assert.equal(dits[2], "Backpack dropdown");
  assert.match(dits[3], /Where everything lands/, "\u2696\ufe0f *\u00ab tout atterrit l\u00e0 \u00bb*");
  assert.doesNotMatch(rendu({ sections: cinq, section: 1, edition: true })
    .querySelector(".sac-encart-fige").textContent, /cannot/,
    "\u26d4 quand rien n'est fig\u00e9, la notice ne doit pas inventer une contrainte");
});
test("24 — 🎒 LE SAC EN FILIGRANE : derrière, muet, et sa cote se DÉDUIT de la grille", () => {
  /* ⚖️ Eric, 2026-09-20 : *« peux-tu faire avec ceci comme avec le bonhomme dans Gear, en
     fond transparent derrière »*, avec une maquette qui montre le placement.
     ⭐ C'EST LE PANTIN DE R : même rôle, même place au plan, même mécanique — un MASQUE
     sur un aplat de `--text-soft`, donc un filigrane qui suit le thème.
     ⛔ MAIS PAS SON TRAITEMENT : le pantin est une silhouette PLATE. Posée telle quelle,
     elle aurait perdu les cordes, la lanterne et les boucles que la maquette montre. Ici
     l'alpha de l'actif vaut « 255 − la noirceur du dessin », donc le détail survit.
     🔴 ET L'IMAGE NE POUVAIT PAS ÊTRE POSÉE TELLE QUELLE : elle est SOMBRE. Vérifié à
     l'écran — sur le fond de nuit, elle s'évanouissait. C'est ce que le masque répare. */

  /* ① IL EST LÀ, UNE FOIS, ET IL SE TAIT */
  const n = rendu();
  const fonds = tous(n, ".sac-fond");
  assert.equal(fonds.length, 1, "un seul filigrane");
  assert.equal(fonds[0].getAttribute("aria-hidden"), "true",
    "⛔ un repère n'a rien à dire à un lecteur d'écran");
  assert.equal(fonds[0].textContent, "", "il ne porte aucun mot");

  /* ② IL EST DERRIÈRE — et c'est l'ORDRE du document qui le dit, ⛔ pas un `z-index` */
  const enfants = [...n.children];
  const iFond = enfants.indexOf(fonds[0]);
  const iRoue = enfants.findIndex((e) => e.className === "sac-roue");
  assert.ok(iFond >= 0 && iRoue >= 0 && iFond < iRoue,
    "⛔ posé avant la roue : tous les organes qui suivent sont absolus comme lui et le recouvrent");
  const feuilleCss = stripComments(feuille);
  assert.doesNotMatch(feuilleCss, /\.sac-fond[^{]*\{[^}]*z-index/,
    "⛔ un empilement déclaré serait un nombre de plus à tenir d'accord avec un ordre qui le dit déjà");

  /* ③ SA COTE VIENT DU PLAN, ET LA FEUILLE CONSTRUITE LA POSE */
  const css = feuilleDesCotesSac();
  assert.ok(D.FOND, "⛔ le plan ne déclare plus de fond : ce garde a changé de sujet");
  assert.ok(css.includes(`.sac > .sac-fond{left:${D.FOND.x}px;top:${D.FOND.y}px;` +
                         `width:${D.FOND.l}px;height:${D.FOND.h}px;`),
    "la boîte du filigrane est celle du plan, au blg près");
  assert.match(css, new RegExp(`mask-image:url\\(\\./assets/${D.FOND.image}`),
    "⭐ un MASQUE, ⛔ pas une `background-image` : c'est ce qui le rend THÉMATIQUE");
  assert.match(css, new RegExp(`-webkit-mask-image:url\\(\\./assets/${D.FOND.image}`),
    "et son jumeau préfixé, sans quoi le filigrane disparaît sur WebKit");
  /* ⚠️ LA VERSION NE SE VÉRIFIE PAS ICI, ET IL FAUT LE DIRE : sous test le module est
     importé SANS `?v=`, donc `versionQuery` rend une chaîne vide — une assertion sur
     `?v=` serait verte pour une mauvaise raison le jour où l'appel disparaîtrait.
     ⭐ Ce qui se tient, c'est que la feuille APPELLE `versionQuery` : sans ça l'image
     resterait dans le cache dix minutes après un déploiement, et on chercherait le
     défaut dans le dessin. */
  const source = stripComments(fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8"));
  assert.match(source, /mask-image:url\(\.\/assets\/\$\{FOND\.image\}\$\{versionQuery\(import\.meta\.url\)\}/,
    "⛔ l'URL de l'actif porte la version du graphe, comme le masque du pantin");

  /* ④ 🔴 ET CETTE COTE SE DÉDUIT, ⛔ ELLE NE SE TAPE PAS. C'est ce qui fait qu'une rangée
     qui bouge emmène le fond avec elle — sinon le filigrane resterait où il était, et
     personne ne verrait pourquoi il a glissé. */
  const debord = D.FOND.y === D.RANGEES[0] - (D.FOND.h - ((D.RANGEES[D.RANGEES.length - 1] + D.JETON.h) - D.RANGEES[0])) / 2;
  assert.ok(debord, "⚖️ il déborde de la grille d'autant en haut qu'en bas");
  assert.equal(D.FOND.h, (D.RANGEES[D.RANGEES.length - 1] + D.JETON.h) - D.RANGEES[0] + 2 * (D.RANGEES[0] - D.FOND.y),
    "la hauteur est celle de la GRILLE, plus son débord");
  assert.ok(Math.abs(D.FOND.l - D.FOND.h * D.FOND.rapport) < 0.01,
    "⭐ la largeur suit le RAPPORT MESURÉ de l'image détourée — une propriété de l'actif, pas un goût");
  assert.ok(Math.abs((D.FOND.x + D.FOND.l / 2) - D.DALLE.l / 2) < 0.01,
    "⚖️ et il est centré sur la dalle, comme la maquette le montre");

  /* ⑤ L'HABIT SUIT LE THÈME, et ⛔ aucune valeur n'y est écrite en clair */
  const regle = [...feuilleCss.matchAll(/([^{}]*)\{([^{}]*)\}/g)]
    .map(([, sel, corps]) => ({ sel: sel.trim(), corps })).find((b) => b.sel === ".sac-fond");
  assert.ok(regle, "⛔ le filigrane n'est plus habillé");
  assert.match(regle.corps, /background:\s*var\(--text-soft\)/,
    "🔴 un aplat qui suit le thème — l'image, elle, est SOMBRE et disparaissait la nuit");
  assert.match(regle.corps, /opacity:\s*var\(--filigrane\)/,
    "⛔ le voile est un JETON : écrit en clair, un garde de R l'a refusé, et il avait raison");
  assert.match(jetons, /--filigrane:\s*\.\d+/, "et le jeton existe, avec sa valeur justifiée");
  assert.match(regle.corps, /pointer-events:\s*none/, "⛔ il ne prend pas le doigt");
  assert.doesNotMatch(regle.corps, /#[0-9a-fA-F]{3,8}|rgb\(/, "⛔ aucune teinte en clair");
});
test("25 — 🔒 VERROUILLÉ : le filigrane est à la place qu'Eric a ratifiée (20/09)", () => {
  /* ⚖️ Eric, 2026-09-20, après trois passages devant l'écran : *« c'est parfait exactement
     ça, bon positionnement, fige cela »*.
     🔒 CE TÉMOIN NE DÉFEND PAS UNE MÉCANIQUE, IL DÉFEND UNE DÉCISION. Il tient les
     nombres EXACTS qu'Eric a regardés et acceptés. ⛔ Ils ne se retouchent pas en
     passant : il faut son mot, et la date qu'on écrira ici à la place de celle-ci.
     ⚠️ ET IL EST EN TENSION AVEC LE GARDE 24, DÉLIBÉRÉMENT — les deux ne posent pas la
     même question. Le 24 demande *« la cote se DÉDUIT-elle encore de la grille ? »* ;
     celui-ci demande *« est-ce encore la place qu'il a dite ? »*. Le jour où une rangée
     bougera, le 24 restera vert et CELUI-CI rougira — c'est exactement ce qu'on veut :
     la mécanique aura tenu, et la décision devra repasser par Eric. */
  /* 🔄 ET IL A ROUGI UNE FOIS, LE 19/09 — exactement comme annoncé. Eric a ordonné
     *« descend la grille de 8 »* pour fermer la couture du haut de son croquis ; le
     filigrane, dont la cote se DÉDUIT de la grille, est descendu avec elle. ⭐ Le garde 24
     est resté vert (la mécanique a tenu), celui-ci a rougi (la place a changé), et la
     décision est repassée par Eric avant que le nombre ne soit regravé. C'est le tour
     complet que ces deux gardes servent à faire. */
  assert.deepEqual(
    [D.FOND.x, D.FOND.y, D.FOND.l, D.FOND.h],
    [90.48, 106, 194.03, 228],
    "🔒 la boîte du filigrane, ratifiée le 20/09 et descendue de 8 le 19/09 sur l'ordre d'Eric.\n" +
    "   ⛔ Si ce garde rougit, ce n'est pas lui qu'on corrige : c'est la question qu'on pose.");
  assert.equal(D.FOND.rapport, 0.851,
    "🔒 et le rapport est celui du modèle simplifié qu'il a choisi — un autre dessin, un autre garde");

  /* 🔒 LE VOILE AUSSI, ET IL EN FAUT DEUX — quatre valeurs regardées avant celles-là
     (.20, .42, .6, .28).
     🔴 UNE SEULE COTE POUR DEUX THÈMES ÉTAIT LA FAUTE, et elle portait sa propre
     vérification : la feuille disait *« .40 tient les deux bouts — vérifié jour ET
     nuit »*. Eric, 2026-09-20 : *« le sac sur fond nuit ne ressort pas suffisamment »*.
     📐 LA CONTRAINTE N'EST PAS SYMÉTRIQUE, et c'est mesurable : le dessin est un APLAT
     de `--text-soft`, sombre le jour et CLAIR la nuit. Le jour il pose de l'encre sur du
     crème — contraste franc. La nuit il pose du clair sur du sombre ET il passe sous le
     voile de la plaque, qui l'atténue une SECONDE fois.
     ⭐ .40 reste ratifié pour le jour (*« c'est parfait »*) ; la nuit prend .62, regardé
     contre .40 (fantôme) et .85 (il monte au premier plan). */
  assert.match(jetons, /--filigrane:\s*\.40\s*;/,
    "🔒 .40 le JOUR — *« rends-le encore un peu plus discret »* (20/09), puis *« c'est parfait »*");
  const nuit = jetons.slice(jetons.indexOf("prefers-color-scheme: dark"));
  assert.match(nuit, /--filigrane:\s*\.62\s*;/,
    "🔒 .62 la NUIT — ⛔ et il ne se confond pas avec celui du jour : deux thèmes, deux cotes");
});

test("26 — 🧊 LES DEUX BOUTS SONT VIDES, et c'est le ruban de DALLES qui le dit", async () => {
  /* ⚖️ Eric, 2026-09-19 : *« que ça tourne à l'infini n'aide pas ; autorise l'absence de
     tuiles à droite et à gauche »* · *« je vois les deux défiler en même temps, ils sont
     liés »*.
     🔄 CE GARDE A CHANGÉ DE SUJET DEUX FOIS, ET SA QUESTION JAMAIS. Il a tenu la
     recouture d'un anneau, puis la course de la roue ; il tient maintenant celle du ruban
     de DALLES — parce que c'est LUI qui porte le geste, et que la roue le suit.
     📐 UNE DALLE PAR SECTION, plus une par page qui déborde : la course vaut donc
     `largeur × (dalles − 1)`, et de part et d'autre il reste de la piste nue. */
  const vues = [];
  const n = rendu({ sections: [1,2,3,4,5].map((i) => ({ nom: `S${i}` })), section: 0,
                    dalles: [0,1,2,3,4].map((i) => ({ section: i, page: 0, objets: [] })),
                    dalle: 0, surDalle: (k) => vues.push(k) });
  const piste = n.querySelector(".sac-dalles");
  const roue = n.querySelector(".sac-roue");
  assert.equal(piste.childNodes.length, 5, "cinq sections, cinq dalles");
  assert.equal(roue.querySelectorAll(".sac-cran").length, 5, "et cinq tuiles, une par section");

  /* ① ON OUVRE SUR LA PREMIÈRE — donc à gauche d'elle, il n'y a QUE de la piste */
  poserLesDalles();
  assert.equal(roue.scrollLeft, 0, "⭐ le début du ruban EST le début de la course");
  assert.equal(piste.scrollLeft, 0, "et les dalles sont à la première");

  /* ② ET LES DALLES SUIVENT LA ROUE — Eric : *« le swipe fait bouger les tuiles, les
     dalles suivent »*. ⛔ Le maître est la roue, et il n'y en a qu'un. */
  const large = piste.clientWidth || D.DALLE.l;
  roue.scrollLeft = D.ROUE.pas * 2;
  /* 🏁 la COURSE devient une condition — et le repos qui suit ne court contre rien :
     il garde la fenêtre où une parole de TROP se verrait (elle valait 220 ms, elle
     vaut maintenant l'arrivée + 140). */
  await jusqua(() => vues.length > 0);
  await new Promise((r) => setTimeout(r, REPOS_MS));
  assert.equal(piste.scrollLeft, large * 2, "🔗 deux tuiles franchies, deux dalles");
  assert.deepEqual(vues, [2], "⚖️ et la section se commet à l'arrêt, une fois");
  const dom = tous(roue, '[data-dominant="oui"]');
  assert.equal(dom.length, 1, "⛔ un seul cran allumé");
  assert.equal(dom[0].dataset.position, "2", "🔴 et c'est celui de la dalle centrée");

  /* ③ 🔗 ET LE LIEN EST CONTINU, ⛔ pas cran par cran : à mi-chemin entre deux tuiles,
     les dalles sont à mi-chemin. C'est tout le *« je vois les deux défiler EN MÊME
     TEMPS »* — sans ça, les dalles sauteraient pendant que le ruban glisserait. */
  roue.scrollLeft = D.ROUE.pas * 2.5;
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(piste.scrollLeft, large * 2.5, "🔗 une demi-tuile vaut une demi-dalle");
});
test("27 — ⛔ LE RUBAN NE SE POSE PAS TOUT SEUL : c'est CELUI QUI L'INSÈRE qui le pose", () => {
  /* 🔴 CE GARDE VIENT D'UN RELEVÉ, PAS D'UNE IDÉE. Le 19/09, dans l'application, en
     échantillonnant la roue toutes les 40 ms pendant qu'on la faisait défiler :
         t=2722  scrollLeft 910   (le ruban est au bout)
         t=2841  scrollLeft **0** (la section a changé → tout l'écran repeint)
         t=3762  scrollLeft 585   (la bonne place, enfin)
     ⛔ Entre les deux, le ruban montrait son DÉBUT. La roue attendait une image
     (`requestAnimationFrame`) pour se replacer — et sur un onglet en arrière-plan cette
     image ne vient JAMAIS : le ruban y restait à zéro pour de bon, ce qui m'a d'abord
     fait croire à une roue morte et chercher la faute dans le CSS pendant une heure.
     🔴 ET LA RÉPARATION ÉVIDENTE ÉTAIT FAUSSE : poser la roue à la fin du `peindre()` de
     l'étape ne marche pas non plus, et — c'est le pire — ça ne dit rien. Mesuré au
     navigateur : à cet instant l'étape est encore DÉTACHÉE (`isConnected: false`,
     `clientWidth: 0`), la coquille ne l'insère qu'après. Une écriture de `scrollLeft`
     sur un nœud détaché ne lève rien : elle tombe dans le vide en silence.
     ⭐ DONC LA ROUE PUBLIE SON PLACEMENT et le laisse à qui l'insère — la coquille, au
     même point de passage où elle cadre déjà les rangées. Un organe posé avec son fil. */
  const n = rendu({ sections: [1,2,3,4,5].map((i) => ({ nom: `S${i}` })), section: 2 });
  const roue = n.querySelector(".sac-roue");
  const vise = Number(roue.dataset.vise);
  assert.equal(vise, 2, "🧊 le rang de la section, et plus rien d'autre — le ruban ne boucle plus");

  /* ① ⛔ CONSTRUIRE NE POSE RIEN, et c'est la moitié du contrat */
  assert.equal(roue.scrollLeft, 0,
    "⛔ la roue ne doit pas s'écrire une position à elle-même : au moment où elle existe, " +
    "elle n'est pas dans la page, et cette écriture-là tombe dans le vide sans rien dire");

  /* ② ⭐ ET C'EST L'APPEL DE CELUI QUI L'INSÈRE QUI LA POSE */
  poserLesDalles();
  assert.equal(roue.scrollLeft, D.ROUE.pas * vise,
    "⭐ `pas × visée` — la même arithmétique que le belt, et elle tombe juste");

  /* ③ ⛔ ET IL NE SE REJOUE PAS : un second appel rejetterait le ruban à la place du
     rendu précédent alors que le doigt l'a déjà déplacé. */
  roue.scrollLeft = D.ROUE.pas * (vise + 2);
  poserLesDalles();
  assert.equal(roue.scrollLeft, D.ROUE.pas * (vise + 2),
    "⛔ le placement se consomme une fois — sinon il reviendrait tirer le ruban en arrière");

  /* ③bis 🔴 MAIS IL NE SE CONSOMME QUE S'IL A PRIS. Deux écrans l'appellent, et l'un des
     deux peint parfois détaché : `scrollLeft` n'y lève rien et n'y garde rien. Un
     placement avalé par cet appel-là laisserait le ruban à zéro pour l'autre — c'est
     exactement ce qui s'est vu dans l'application (`sl 0 / visée 9`).
     ⭐ On refait donc le tour avec une roue QUI REFUSE D'ÉCRIRE, comme un nœud détaché : */
  const n2 = rendu({ sections: [1,2,3,4,5].map((i) => ({ nom: `T${i}` })), section: 1 });
  const roue2 = n2.querySelector(".sac-roue");
  const vise2 = Number(roue2.dataset.vise);
  let sourd = true;
  Object.defineProperty(roue2, "scrollLeft", {
    configurable: true, get: () => 0, set: () => { if (!sourd) throw new Error("écrit"); }
  });
  poserLesDalles();                                   /* l'écran détaché appelle en premier */
  delete roue2.scrollLeft;                         /* → la roue entre dans la page */
  roue2.scrollLeft = 0;
  poserLesDalles();                                   /* … et le second appel la trouve encore là */
  assert.equal(roue2.scrollLeft, D.ROUE.pas * vise2,
    "⛔ le premier appel a écrit dans le vide : il ne doit PAS avoir mangé le placement");

  /* ④ ⚖️ ET LA COQUILLE L'APPELLE LÀ OÙ LE CONTENU ENTRE DANS LE DOCUMENT — la même
     ligne que `cadrerLesRangees`, qui existe pour exactement la même raison. */
  const coquille = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  assert.match(coquille, /cadrerLesRangees\(frame\.stage\);\s*poserLesDalles\(\);/,
    "⛔ la coquille doit poser le ruban au point de passage où elle cadre déjà les rangées");
  /* ⑤ 🔴 ET L'ÉTAPE L'APPELLE AUSSI — ⛔ pas « à la place » : EN PLUS, parce qu'il y a
     DEUX entrées dans le document et que j'ai cru une heure qu'il n'y en avait qu'une.
     • changer de SECTION repeint par l'étape, dont la section est déjà montée ;
     • changer de VUE passe par la coquille, qui reconstruit l'étape DÉTACHÉE puis l'insère.
     📏 N'en câbler qu'un laissait le ruban à zéro une fois sur deux — relevé dans
     l'application : `sl 0 / visée 9`. ⭐ Et les deux appels ne se marchent pas dessus
     parce que le placement SE RELIT avant de se consommer (③ ci-dessus). */
  const etape = stripComments(fs.readFileSync(path.join(UI, "equipment-step.mjs"), "utf8"));
  assert.match(etape, /swapContent\(section, \[construireVue\(vueEquipement\)\]\);\s*poserLesDalles\(\);/,
    "⛔ l'étape doit poser la roue juste après son propre échange de contenu");
});

test("28 — 👻 UN MINUTEUR QUI SURVIT À SON NŒUD PARLE APRÈS SA MORT", async () => {
  /* 🔴 RELEVÉ DANS L'APPLICATION LE 19/09, en jetant le ruban jusqu'au bout :
         910  (le doigt lâche au bout)  →  585  (recouture + sélection : JUSTE)
                                          →  **325, « Party bag »**  — tout seul, 160 ms plus tard
     ⛔ LA CHAÎNE : la recouture écrit `scrollLeft` → cette écriture émet un `scroll` →
     le `scroll` réarme l'attente de repos → la sélection repeint l'écran et la roue est
     jetée → le minuteur, lui, survit. 140 ms plus tard il s'exécute sur un nœud
     DÉTACHÉ, où `scrollLeft` vaut 0, en conclut « premier cran » et commet la première
     section. ⭐ Un minuteur appartient au rendu qui l'a armé, et un rendu mort se tait.
     📌 Ici la roue n'est pas détachée (le stub n'a pas de document), donc le fantôme
     ne dit pas « zéro » : il RÉPÈTE la sélection. La faute est la même — une parole de
     trop — et elle se compte exactement. */
  const vus = [];
  const n = rendu({ sections: [1,2,3,4,5].map((i) => ({ nom: `S${i}` })), section: 0,
                    dalles: [0,1,2,3,4].map((i) => ({ section: i, page: 0, objets: [] })),
                    dalle: 0, surDalle: (k) => vus.push(k) });
  const roue = n.querySelector(".sac-roue");

  roue.scrollLeft = D.ROUE.pas * 4;                /* le doigt jette jusqu'au dernier cran */
  /* 🏁 la course seule : le repos de décantation est JUSTE EN DESSOUS, et lui reste fixe */
  await jusqua(() => vus.length > 0);
  assert.deepEqual(vus, [4], "⚖️ la sélection se commet à l'arrêt, une fois");

  /* → et on laisse passer DEUX repos de plus : le fantôme, s'il existe, parle là */
  await new Promise((r) => setTimeout(r, REPOS_MS * 2 + 80));
  assert.deepEqual(vus, [4],
    "⛔ la roue a reparlé après son arrêt : c'est notre propre écriture qui a réarmé " +
    "l'attente, et ce minuteur-là survit au rendu qui l'a posé");
});

test("29 — 👻 UNE ROUE JETÉE NE COMMET PLUS RIEN, même si son minuteur survit", async () => {
  /* 🔴 LE RELEVÉ, DANS L'APPLICATION, EN JETANT LE RUBAN JUSQU'AU BOUT :
         910  →  585, « Storage 3 »   (recouture + sélection : JUSTE)
              →  **325, « Party bag »**  — 160 ms plus tard, sans que personne ne touche rien
     ⛔ ET LA CHAÎNE NE PASSE PAS OÙ JE L'AI CHERCHÉE DEUX FOIS. La sélection repeint
     l'écran, donc la roue est RETIRÉE du document — et un défileur détaché voit son
     `scrollLeft` retomber à zéro. Cette retombée émet un `scroll`, qui ressemble à un
     geste, arme l'attente de repos, et fait commettre « cran 0 » à une roue morte.
     ⚠️ J'AI ÉCRIT DEUX PARADES FAUSSES AVANT CELLE-CI, et chacune était juste sur une
     autre question : un drapeau « c'est nous qui écrivons » (il s'est COINCÉ — le
     `scroll` du placement d'ouverture n'est pas toujours émis, et c'est le premier vrai
     geste qui se faisait avaler), puis la comparaison de position du belt (elle ne peut
     pas voir celui-ci : la position a VRAIMENT changé). ⭐ Ce n'est pas « notre
     écriture », c'est UN MORT QUI BOUGE — et le seul critère juste est l'IDENTITÉ. */
  const vus = [];
  const morte = rendu({ sections: [1,2,3,4,5].map((i) => ({ nom: `S${i}` })), section: 2,
                        surSection: (i) => vus.push(i) });
  const roue = morte.querySelector(".sac-roue");
  /* ⛔ ET ON LA POSE POUR DE VRAI — sinon elle est déjà à zéro, la retombée ne change
     rien, aucun `scroll` n'est émis et ce garde ne peut RIEN accuser. 🔴 C'est l'erreur
     que je viens de faire : la première écriture de ce témoin restait verte sans la
     réparation qu'elle prétendait défendre. Un témoin se vérifie ROUGE avant d'être cru. */
  poserLesDalles();
  assert.equal(roue.scrollLeft, D.ROUE.pas * 2, "la roue jetée était bien posée quelque part");

  /* → LE REPEINT, POUR DE VRAI : un hôte porte le premier rendu, puis le second le
     remplace — et c'est ça qui jette le premier hors du document. ⛔ Construire un second
     rendu ne suffit PAS : j'ai cru un moment que « la dernière roue construite » était le
     bon critère, et il était faux d'un cran — une roue bâtie après puis JETÉE aurait
     fait taire celle qui est à l'écran. Mesuré dans l'application : la sélection ne se
     commettait plus du tout. C'est l'appartenance au DOCUMENT qui tranche, rien d'autre. */
  const hote = document.createElement("div");
  hote.append(morte);
  assert.equal(roue.isConnected, true, "tant qu'elle est portée, elle est à l'écran");
  hote.replaceChildren(rendu({ sections: [1,2,3,4,5].map((i) => ({ nom: `S${i}` })), section: 4 }));
  assert.equal(roue.isConnected, false, "… et le repeint l'en a sortie");

  /* → et la roue jetée voit son défilement retomber à zéro, comme au détachement */
  roue.scrollLeft = 0;
  await new Promise((r) => setTimeout(r, REPOS_MS + 120));
  assert.deepEqual(vus, [],
    "⛔ une roue qui n'est plus à l'écran vient de choisir une section à la place du joueur");
});

test("30 — ⚖️ UN CADRE DE ZOOM BIEN MARQUÉ, ET LES DEUX GENRES QUI SE VOIENT", () => {
  /* ⚖️ Eric, 2026-09-19, en une phrase : *« fais-moi des tuiles plus rectangulaires que
     ça et fais-moi un halo (= encadré de zoom de la même forme, bien marqué) »* ·
     *« n'oublie pas le reflet bleuté sur la tuile inventory, et le reflet doré sur les
     tuiles ''outer'' s'il y en a »*.
     🔴 LES DEUX REFLETS ÉTAIENT DÉJÀ LÀ, ET C'EST LE PIRE CAS : posés, câblés, corrects
     — et illisibles à 1 blg. Un organe qu'on ne voit pas ne se distingue pas d'un organe
     absent, sauf pour celui qui lit le code.
     ⭐ L'ÉPAISSEUR N'EST PAS UN CHOIX DE CE LOT : c'est le jeton d'Eric du 26/08, *« le
     collecteur doit doubler son épaisseur de liseré témoin, trop fin pas assez visible »*,
     dont il a dit *« ça c'est global à tout le site »*. Une demande qui revient sous une
     autre forme se sert de la règle déjà écrite. */
  const css = stripComments(feuille);
  /* 🔄 IL CHERCHE LE SÉLECTEUR DANS LA LISTE, ⛔ PLUS UNE ÉGALITÉ EXACTE (lot 221, 20/09).
     Une règle PARTAGÉE est la même règle : depuis qu'Eric a demandé que la tuile de Wares ait
     *« la même morphologie, aura idem »* que celle du sac, elle entre dans SES listes plutôt
     que d'être recopiée — et `.sac-cran, .wares-cran { … }` cessait de répondre à `=== ".sac-cran"`.
     ⭐ CE N'EST PAS AFFAIBLIR LE GARDE : il tient toujours exactement le même corps de règle,
     sur exactement le même sélecteur. Il cesse seulement d'exiger que ce sélecteur soit SEUL —
     ce qui était épeler une implémentation, la faute que ce dépôt repaie tous les quinze jours.
     ⛔ Et il refuse toujours une fausse correspondance : `.sac-cran-champ` ne contient pas le
     membre `.sac-cran`, parce qu'on compare des membres DÉCOUPÉS, pas des sous-chaînes. */
  const bloc = (sel) => {
    const b = [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)]
      .map(([, s2, c]) => ({ membres: s2.split(",").map((m) => m.trim()), corps: c }))
      .find((x) => x.membres.includes(sel));
    assert.ok(b, `⛔ ${sel} n'est plus habillé`);
    return b.corps;
  };

  /* ① LA TUILE EST PLUS RECTANGULAIRE — ⛔ et surtout, plus le rayon du JETON */
  const cran = bloc(".sac-cran");
  assert.match(cran, /border-radius:\s*var\(--radius-md\)/,
    "⭐ le rayon de la tuile descend d'un barreau — Eric : « plus rectangulaires que ça »");
  assert.doesNotMatch(cran, /border-radius:\s*var\(--organe-rayon\)/,
    "⛔ `--organe-rayon` est le rayon de la famille du JETON : sur 57 × 40 il arrondissait " +
    "presque toute la hauteur, et la rangée ressemblait à un chapelet de pastilles");

  /* ② 🔴 LE CADRE SE SUPERPOSE AU REBORD, ⛔ IL NE S'AJOUTE PAS AUTOUR.
     ⚖️ Eric, 2026-09-19, en deux temps : *« plutôt qu'entourer, le halo souligne
     précisément le rebord de la tuile maîtresse ; l'actuel halo est moche »*, puis, en
     regardant le rendu : *« la loupe doit parfaitement se superposer, donc trait plus fin,
     forme identique, même taille que le bord de la tuile »*.
     📏 CE QUE LA PHOTO MONTRAIT, ET C'EST DEUX TRAITS, PAS UN TROP ÉPAIS : la tuile porte
     déjà son liseré, dessiné `inset` donc À L'INTÉRIEUR de son bord ; un `outline` se pose
     À L'EXTÉRIEUR, contre lui. Les deux s'ADDITIONNENT en une bande de 3 blg à deux
     couleurs — clair dehors, sombre dedans. C'est ça, l'autocollant.
     ⛔ ET UNE SUPERPOSITION N'EST PAS UNE RESSEMBLANCE : la tuile posée est AGRANDIE de
     1,2456, donc son rayon PEINT vaut `--radius-md × 1,2456` et son liseré `1 × 1,2456`.
     Un trait recopié tel quel raterait les quatre coins de 2 blg. La règle se GÉNÈRE
     donc, là où l'agrandissement est une cote du plan.
     ⭐ ET CE GARDE LIT LE REBORD PLUTÔT QUE DE LE RETAPER : si la tuile change de rayon ou
     d'épaisseur demain, il exige que la loupe suive. Deux copies à la main divergeraient
     au premier réglage — et une superposition qui diverge est exactement le défaut qu'on
     vient de réparer. */
  const loupe = bloc(".sac-loupe");
  assert.doesNotMatch(loupe, /outline/,
    "⛔ un `outline` se pose DEHORS du bord : il s'ajoute au liseré de la tuile au lieu de " +
    "s'y superposer, et les deux font un autocollant");
  assert.doesNotMatch(loupe, /border-radius|box-shadow/,
    "⛔ la forme ne s'écrit pas dans la feuille : elle porte l'agrandissement, donc elle " +
    "se génère — ⛔ et deux écrivains pour une forme divergent");
  assert.match(loupe, /--loupe-trait:\s*var\(--verre-lisere\)/,
    "⭐ ce qui reste ici est la FENTE de couleur : un seul écrivain pour la teinte");
  assert.match(bloc('.sac-loupe[data-lieu="dehors"]'), /--loupe-trait:\s*var\(--dehors\)/,
    "🟡 et le genre passe par la fente");
  assert.match(bloc('.sac-loupe[data-lieu="party"]'), /--loupe-trait:\s*var\(--info\)/,
    "🔵 idem pour le bleu");

  /* → et la règle générée REPRODUIT le rebord de la tuile, agrandi du même facteur */
  const rebordEp = (cran.match(/box-shadow:\s*inset 0 0 0 (\S+) var\(--verre-lisere\)/) || [])[1];
  const rebordRayon = (cran.match(/border-radius:\s*(var\(--[a-z-]+\))/) || [])[1];
  assert.ok(rebordEp && rebordRayon, "⛔ le rebord de la tuile ne se lit plus : ce garde est aveugle");
  const emise = feuilleDesCotesSac();
  const regle = (emise.match(/\.sac \.sac-loupe\{([^}]*)\}/) || [])[1];
  assert.ok(regle, "⛔ la loupe n'a plus de règle générée : plus rien ne porte l'agrandissement");
  const echappe = (s2) => s2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(regle, new RegExp(`border-radius:calc\\(${echappe(rebordRayon)} \\* ${D.ROUE.loupe}\\)`),
    "⚖️ « forme identique » : le rayon DE LA TUILE, multiplié par l'agrandissement");
  assert.match(regle, new RegExp(`inset 0 0 0 calc\\(${echappe(rebordEp)} \\* ${D.ROUE.loupe}\\)`),
    "⚖️ « trait plus fin, même taille » : l'épaisseur DU REBORD, multipliée par l'agrandissement");
  assert.match(regle, /var\(--loupe-trait\)/, "⭐ et la couleur vient de la fente, pas d'ici");

  /* ③ LES DEUX REFLETS SE VOIENT — et le blanc reste le défaut muet de la maison */
  assert.match(bloc('.sac-cran[data-lieu="party"]'),
    /box-shadow:\s*inset 0 0 0 var\(--creneau-lisere-rempli\) var\(--info\)/,
    "🔵 le reflet bleuté du party inventory");
  assert.match(bloc('.sac-cran[data-lieu="dehors"]'),
    /box-shadow:\s*inset 0 0 0 var\(--creneau-lisere-rempli\) var\(--dehors\)/,
    "🟡 le reflet doré de ce qui est hors du sac");
  assert.match(cran, /box-shadow:\s*inset 0 0 0 1px var\(--verre-lisere\)/,
    "⭐ et le blanc reste à 1 : c'est le défaut de la maison, il n'a rien à annoncer");

  /* ③ bis 🔵 ET LE PARTY BAG PORTE UN HABIT, ⛔ pas qu'un trait — Eric, 2026-09-19 :
     *« le party bag doit avoir une écriture bleu marine, fond bleu proche du bleu du
     parchemin tally »*. ⭐ C'est la règle de l'or appliquée au bleu : du 19/09 aussi,
     *« outside your gear (horse, chest, house), COULEUR DE FOND dorée »*.
     📏 LES DEUX TEINTES SE DÉRIVENT, ⛔ elles ne se recopient pas : `parchemin-party.webp`
     rend #a6b6c7 en moyenne sur ses bleus, et `--info` à 35 % dans `--surface` rend
     #adbac7. Un hex recopié ne basculerait plus la nuit.
     🔴 ET LE DOMINANT DOIT LE REPRENDRE : sa règle pose `--dalle-inter` à la même
     spécificité et PLUS BAS dans la feuille — sans la reprise, le Party bag redeviendrait
     gris au moment précis où on le regarde. ⛔ Ce piège a déjà été payé ici, sur le
     liseré ; ce garde est ce qui l'empêche de l'être une troisième fois. */
  for (const [genre, source] of [["party", "--info"], ["dehors", "--dehors"]]) {
    for (const [sel, quoi] of [[`.sac-cran[data-lieu="${genre}"]`, "au repos"],
                               [`.sac-cran[data-dominant="oui"][data-lieu="${genre}"]`, "sous le viseur"]]) {
      assert.match(bloc(sel), new RegExp(`background-color:\\s*var\\(--${genre}-fond\\)`),
        `le fond du genre « ${genre} », ${quoi}`);
      assert.match(bloc(sel), new RegExp(`color:\\s*var\\(--${genre}-encre\\)`),
        `et son encre, ${quoi}`);
    }
    const t = jetons.match(new RegExp(`--${genre}-fond:\\s*([^;]+);\\s*--${genre}-encre:\\s*([^;]+);`));
    assert.ok(t, `⛔ les deux teintes du genre « ${genre} » ont disparu des jetons`);
    assert.equal(t[1].trim(), `color-mix(in srgb, var(${source}) 35%, var(--surface))`,
      `📏 le fond est \`${source}\` à 35 % dans la surface — le cran mesuré sur le parchemin, ` +
      "et Eric l'a confirmé à l'œil (*« 35% »*, 19/09)");
    assert.equal(t[2].trim(), `color-mix(in srgb, var(${source}) 55%, var(--text))`,
      `⭐ et l'encre est le MÊME ton, encré — ⛔ pas une seconde teinte qui dériverait de la première`);
  }

  /* ④ ⚖️ DE TRANSPARENT À PLEIN, EN 60 ms — Eric, 19/09 : *« de transparent à plein, c'est
     plus efficace »* · *« tu fais une transition de 60 ms »*.
     ⭐ LE FOND EST LE SIGNE : ce qui est plein est ce qui est choisi. ⛔ Avant, toutes les
     tuiles portaient le même fond et la posée ne se distinguait que par sa taille.
     📏 ET 60 PLUTÔT QUE 120, parce que le ruban traverse une tuile toutes les ~50 ms en
     lancée : une transition de 120 ms ne FINIT jamais, elle montre en permanence l'état
     d'il y a deux tuiles. ⛔ Ce n'est pas cher, c'est EN RETARD — ce qui se voit.
     🔴 ET ELLE EST PORTÉE PAR TOUTES LES TUILES, pas par le seul état allumé : sinon le
     DÉ-zoom de celle qui s'en va ne s'anime pas, et Eric a demandé les deux sens. */
  /* 🔄 AMENDÉ LE 2026-09-21 — Eric : *« pour les tuiles non sélectionnées rajouter du voile sur
     le fond à 20 ou 35 % serait plus joli »*, puis *« voile des tuiles à 20% »*.
     🗄️ Le repos n'est plus `transparent` : il porte `--dalle-cran` (20 %). ⭐ CE QUE LA LOI DU
     19/09 DIT RESTE VRAI — le fond est le SIGNE — mais l'échelle va de *à peine* à *plein* au
     lieu de *rien* à *plein*. ⛔ ET LE GARDE NE SE CONTENTE PAS DE LÂCHER : il vérifie que
     l'écart SUBSISTE, parce que c'est lui qui désigne. Un garde qui accepterait deux voiles
     égaux laisserait disparaître la distinction qu'il est là pour tenir. */
  assert.match(cran, /background-color:\s*var\(--dalle-cran\)/,
    "⛔ la tuile au repos porte le voile de 20 % (Eric, 21/09)");
  assert.match(bloc('.sac-cran[data-dominant="oui"]'), /background-color:\s*var\(--dalle-inter\)/,
    "⭐ et la posée est pleine");
  {
    const jetons = fs.readFileSync(path.join(UI, "tokens.css"), "utf8");
    const pct = (nom) => Number((jetons.match(new RegExp("--" + nom + ":\\s*(\\d+)%")) || [])[1]);
    const repos = pct("voile-cran"), posee = pct("voile-inter");
    assert.ok(repos > 0 && posee > 0, "⛔ les deux voiles doivent exister et être chiffrés");
    assert.ok(posee - repos >= 20,
      `⛔ le repos (${repos} %) et la posée (${posee} %) se ressemblent trop : le fond ne DÉSIGNE plus`);
  }
  const transitions = [...css.matchAll(/\.sac-cran\s*\{([^}]*)\}/g)].map((m) => m[1])
    .filter((c) => /transition:/.test(c));
  assert.equal(transitions.length, 1, "une seule règle porte la transition des tuiles");
  assert.match(transitions[0], /scale 60ms[^;]*background-color 60ms/,
    "⏱️ 60 ms, et la même durée pour le zoom et le remplissage — un seul changement d'état");

  /* ⑤ 🔴 ET LE HALO NE REVIENT PAS SUR LES TUILES — il avait suivi la loupe le 20/09
     (« le halo doit rester centré »), mais DEUX règles du dominant le repeignaient encore
     sur la tuile : un halo qui voyageait, donc exactement ce qu'on avait retiré. ⛔ Vu en
     relisant la feuille, pas à l'écran — il se confondait avec le cadre. */
  const i = css.indexOf("LE SAC");
  const sac = css.slice(i);
  assert.doesNotMatch(sac, /\.sac-cran\[[^{]*\{[^}]*--belt-halo/,
    "⛔ une tuile porte de nouveau le halo : il est à la LOUPE, qui ne bouge pas");
});

test("31 — 🎚️ LES DEUX SURFACES DÉFILENT, ⛔ mais il n'y a qu'UN maître par geste", () => {
  /* ⚖️ Eric, 2026-09-19, en trois temps : *« les deux si ça ne crée pas de conflits »* ·
     puis, sur ma réponse trop absolue, *« donc pas de swipe de dalle »* · puis, le
     springboard d'iOS à l'appui : *« 350 ms sur jeton, swipe désactivé, fait tout passer
     en mode drag'n'drop… si on n'est pas en mode drag le swipe fonctionne »*.
     🔴 CE GARDE A TENU LA DÉCISION INVERSE PENDANT UNE HEURE, et c'est ma faute : j'avais
     répondu que le swipe et le glisser ne pouvaient PAS coexister. iOS le fait. Ce qui
     l'achète est un PÉAGE — on tient une app avant de pouvoir la porter.
     ⭐ ET LE PÉAGE N'EST PAS UNE RUSTINE : c'est le prix universel de deux gestes sur les
     mêmes pixels, et ce dépôt l'avait déjà payé (grille des sorts, `pan-y` + 350 ms,
     jusqu'au 20/08). Il revient parce que SA CAUSE revient — un ascenseur. */
  const css = stripComments(feuille);
  /* 🔄 IL CHERCHE LE SÉLECTEUR DANS LA LISTE, ⛔ PLUS UNE ÉGALITÉ EXACTE (lot 221, 20/09).
     Une règle PARTAGÉE est la même règle : depuis qu'Eric a demandé que la tuile de Wares ait
     *« la même morphologie, aura idem »* que celle du sac, elle entre dans SES listes plutôt
     que d'être recopiée — et `.sac-cran, .wares-cran { … }` cessait de répondre à `=== ".sac-cran"`.
     ⭐ CE N'EST PAS AFFAIBLIR LE GARDE : il tient toujours exactement le même corps de règle,
     sur exactement le même sélecteur. Il cesse seulement d'exiger que ce sélecteur soit SEUL —
     ce qui était épeler une implémentation, la faute que ce dépôt repaie tous les quinze jours.
     ⛔ Et il refuse toujours une fausse correspondance : `.sac-cran-champ` ne contient pas le
     membre `.sac-cran`, parce qu'on compare des membres DÉCOUPÉS, pas des sous-chaînes. */
  const bloc = (sel) => {
    const b = [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)]
      .map(([, s2, c]) => ({ membres: s2.split(",").map((m) => m.trim()), corps: c }))
      .find((x) => x.membres.includes(sel));
    assert.ok(b, `⛔ ${sel} n'est plus habillé`);
    return b.corps;
  };

  /* ① LES DEUX DÉFILENT — l'une comme l'autre */
  assert.match(bloc(".sac-roue"), /overflow-x:\s*auto/, "la roue défile");
  assert.match(bloc(".sac-dalles"), /overflow-x:\s*auto/, "et les dalles aussi");

  /* ② 🔴 ET C'EST EXACTEMENT POURQUOI IL FAUT UN ARBITRE : deux défileurs verrouillés
     l'un à l'autre OSCILLENT — chacun lit l'autre et le corrige à l'image suivante. ⛔ Ce
     n'est pas une question de réglage, c'est une boucle. ⭐ Celui que le doigt a touché
     mène, et il n'écrit que dans l'autre. */
  const source = stripComments(fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8"));
  assert.match(source, /r\.addEventListener\("pointerdown", \(\) => mener\("roue"\)/,
    "⛔ toucher la roue doit la désigner maître");
  assert.match(source, /piste\.addEventListener\("pointerdown", \(\) => mener\("dalles"\)/,
    "⛔ toucher les dalles doit les désigner maîtres");

  /* ② bis 🔴 ET LE SUIVEUR N'AIMANTE PAS — sinon il ne peut pas suivre, et c'est MESURÉ.
     📏 19/09, roue immobilisée à mi-chemin (97 = 65 × 1,5) : les dalles rendaient **383**
     au lieu de 563. Une aimantation `mandatory` REFUSE une position intermédiaire ; le
     navigateur la corrige à l'image suivante. Le suiveur sautait de cran en cran pendant
     que le meneur glissait.
     ⛔ ET AUCUN DE MES RELEVÉS NE POUVAIT L'ATTRAPER : ils tombaient tous sur des
     positions DÉJÀ alignées (65 × 3, 375 × 3), où l'aimantation ne corrige rien. ⭐ Une
     mesure qui ne visite que les crans ne dit RIEN de l'entre-deux — c'est Eric qui l'a vu
     à l'œil, après trois de mes relevés « verts ». */
  assert.match(source, /r\.dataset\.mene = qui === "roue" \? "oui" : "non";/,
    "⛔ la roue doit dire si elle mène");
  assert.match(source, /piste\.dataset\.mene = qui === "dalles" \? "oui" : "non";/,
    "⛔ et les dalles aussi");
  assert.match(css, /\.sac-roue\[data-mene="non"\], \.sac-dalles\[data-mene="non"\] \{[^}]*scroll-snap-type:\s*none/,
    "⛔ le suiveur garde son aimantation : il ne peut alors se poser que sur des crans, " +
    "et il saute au lieu de suivre");
  assert.match(source, /const suivre = \(\) => \{\s*enAttente = false;\s*if \(maitre !== "roue"\) return;/,
    "⛔ la roue n'écrit dans les dalles que si c'est ELLE qu'on pousse");
  assert.match(source, /if \(maitre !== "dalles"\) return;/,
    "⛔ et réciproquement — sinon les deux s'écrivent dessus et le geste oscille");

  /* ③ ⏱️ LE PÉAGE, ET IL EST UNE OPTION — ⛔ pas un retour global. Eric, 20/08 :
     *« il ne faut plus d'ascenseurs couplés avec des actions drag and drop »*, et la
     parade d'alors fut de supprimer l'ascenseur. Species et les sorts n'en ont toujours
     pas : ils gardent leur glisser IMMÉDIAT. ⭐ « Laisse les autres écrans en dehors de
     ça » — Eric, 19/09. */
  assert.equal(PEAGE_JETON_MS, 350, "⏱️ la cote qu'il a dite, et celle d'avant le 20/08");
  assert.match(source, /maintien: PEAGE_JETON_MS/, "le sac paie le péage");
  const organe = stripComments(fs.readFileSync(path.join(UI, "glisser.mjs"), "utf8"));
  assert.match(organe, /const peage = Number\.isFinite\(maintien\) && maintien > 0;/,
    "⭐ et l'organe ne le prend que si on le lui donne — sans option, pas de péage");
  const autres = ["skills-step.mjs", "species-step.mjs", "b3-dressing.mjs"]
    .filter((f) => fs.existsSync(path.join(UI, f)))
    .filter((f) => /maintien:/.test(stripComments(fs.readFileSync(path.join(UI, f), "utf8"))));
  assert.deepEqual(autres, [],
    "⛔ un autre écran vient de prendre le péage : il n'a pas d'ascenseur, donc pas de cause");

  /* ④ ET LE JETON REND L'AXE AU NAVIGATEUR TANT QU'IL N'EST PAS PORTÉ. ⛔ Sans ça
     `[data-glissable]` lui donne `touch-action: none` et AUCUN swipe ne peut naître sur
     un jeton — or la grille est faite de jetons. */
  assert.match(bloc('.sac-case[data-glissable="true"]'), /touch-action:\s*pan-x/,
    "⛔ le jeton du sac doit laisser passer le défilement horizontal jusqu'au péage");
});

test("32 — 📐 LE JOUR EST À LA PLAQUE CE QUE LA GOUTTIÈRE EST À LA TUILE", () => {
  /* ⚖️ Eric, 2026-09-19, après deux essais : *« on crée un décalage, c'est pas bon — à
     quel espacement entre dalles j'ai un mouvement PROPORTIONNEL ? »*.
     ⭐ LA RÉPONSE SE DÉDUIT, ⛔ elle ne se choisit pas : pour que le ruban de plaques soit
     le ruban de tuiles AGRANDI — la même image à deux échelles — il faut que le jour soit
     à la plaque ce que la gouttière est à la tuile.
     🔴 8 ET 24 N'ÉTAIENT PAS DES RÉGLAGES, C'ÉTAIENT DES ESSAIS : à 8 le rapport valait
     5,89, à 24 il valait 6,14, et il en fallait 6,579. Les plaques traînaient derrière les
     tuiles — de moins en moins, mais elles traînaient. C'est ce qu'Eric appelait le
     décalage, et il avait raison contre mes deux nombres.
     ⚠️ ET ÇA COÛTE DU MOUVEMENT : une plaque parcourt 427,6 par tuile au lieu de 399. La
     proportionnalité et « moins de mouvement » tirent en sens inverse — on ne peut pas
     avoir les deux, et c'est la proportionnalité qu'il a choisie. */
  const gouttiere = D.RANGEES[1] - D.RANGEES[0] - D.JETON.h;
  assert.equal(D.DALLES.jour, Math.round(D.DALLE.l * gouttiere / D.ROUE.tuile * 100) / 100,
    "⭐ le jour se DÉDUIT : largeur de plaque × gouttière ÷ largeur de tuile");

  /* ⭐ ET LE TÉMOIN EST LE RAPPORT DES PAS — c'est lui qu'on regarde à l'écran : le pas
     d'une plaque sur le pas d'une tuile doit valoir la largeur d'une plaque sur celle
     d'une tuile. ⛔ Sinon un ruban avance pendant que l'autre traîne. */
  const pasPlaque = D.DALLE.l + D.DALLES.jour;
  assert.ok(Math.abs(pasPlaque / D.ROUE.pas - D.DALLE.l / D.ROUE.tuile) < 0.001,
    `les deux rubans ne sont pas homothétiques : ${(pasPlaque / D.ROUE.pas).toFixed(4)} ` +
    `contre ${(D.DALLE.l / D.ROUE.tuile).toFixed(4)}`);

  /* ⛔ ET LA FEUILLE POSE CE JOUR-LÀ, pas un autre : un `gap` écrit à la main ici
     rouvrirait la question que ce garde vient de fermer. */
  assert.ok(feuilleDesCotesSac().includes(`.sac .sac-dalles{gap:${D.DALLES.jour}px}`),
    "le ruban de plaques doit espacer du jour du plan");
});

test("33 — \u2194\ufe0f LE CHEMIN INVERSE N'H\u00c9RITE DE RIEN : il lit le PAS, et il POSE la roue", async () => {
  /* \ud83d\udcf8 LE REL\u00c9V\u00c9 QUI L'A OUVERT \u2014 capture d'Eric sur son iPad, 19/09 \u00e0 22:52, l\u00e9gend\u00e9e
     *\u00ab r\u00e9sultat du premier d\u00e9calage suite \u00e0 un swipe sur dalle \u00bb* : la plaque \u00e9tait juste
     (grille de `Storage 1`, vide), et la ROUE \u00e9tait fausse \u2014 `Storage 1` dessin\u00e9e \u00e0 cheval
     sur `Storage 2`. Une tuile arr\u00eat\u00e9e ENTRE deux crans.
     \ud83d\udd34 TROIS FAUTES, ET ELLES SONT TOUTES LA M\u00caME : j'ai \u00e9crit le verrou dans le sens
     roue \u2192 plaques, puis je l'ai *retourn\u00e9*, et un retournement h\u00e9rite du calcul sans
     h\u00e9riter de ce qui l'entoure.
       \u2460 le pas \u2014 le sens direct LIT `offsetLeft` ; l'inverse divisait par la LARGEUR, or
         entre deux plaques il y a un JOUR (52,63). 374 au lieu de 426,63 : 14 % de d\u00e9rive
         \u00e0 la deuxi\u00e8me plaque, 28 % \u00e0 la troisi\u00e8me, 42 % \u00e0 la quatri\u00e8me.
       \u2461 la pose \u2014 le sens direct pose le suiveur exactement \u00e0 l'arr\u00eat ; l'inverse ne
         posait rien, et l'aimantation du suiveur est COUP\u00c9E par construction. Rien ne
         ramenait la roue sur son cran.
       \u2462 l'arbitre \u2014 et celle-ci mangeait les deux autres : le minuteur de repos
         choisissait son ex\u00e9cutant \u00c0 L'ARMEMENT. Le suivi \u00e9crit `r.scrollLeft`, \u00e7a \u00e9met un
         `scroll` sur la roue, et l'\u00e9couteur de la roue r\u00e9armait le repos avec `arrete`.
         \u26d4 `arreteLesDalles` ne tournait jamais. */
  const vues = [];
  /* ⛔ ET LE RUBAN SE PEUPLE POUR DE VRAI : sans `dalles`, l'écran n'en pose qu'UNE,
     et un ruban d'une seule plaque ne peut rien décaler — le témoin serait resté vert
     sur la faute qu'il défend. */
  const noeud = rendu({ surDalle: (k) => vues.push(k),
    dalles: [0, 1, 2].map((i) => ({ section: i, objets: [] })) });
  const piste = noeud.querySelector('[data-organe="dalles"]');
  const roue = noeud.querySelector(".sac-roue");
  poserLesDalles();

  /* \u2192 ON DONNE AUX PLAQUES LA MISE EN PAGE QU'ELLES ONT DANS LE NAVIGATEUR \u2014 une
     largeur, PLUS un jour. \u26d4 Sans \u00e7a le banc ne peut RIEN accuser : hors navigateur
     `offsetLeft` n'existe pas, le repli multiplie par la largeur, largeur et pas se
     confondent et la faute \u2460 dort. C'est exactement pourquoi 2340 gardes verts n'ont
     pas vu ce qu'Eric a vu du premier coup d'\u0153il. */
  const pas = D.DALLE.l + D.DALLES.jour;
  [...piste.children].forEach((n, k) => { n.offsetLeft = pas * k; });

  /* \u2192 et c'est LA PLAQUE qu'on pousse \u2014 le doigt s'y pose, elle m\u00e8ne */
  piste.dispatchEvent({ type: "pointerdown", target: piste });
  /* ⛔ ET LE DOIGT LÂCHE ENTRE DEUX PLAQUES, — pas pile sur un cran. C'est le cas RÉEL,
     et c'est le seul qui puisse accuser la pose : le repos tire à 140 ms, bien avant que
     l'aimantation du MAÎTRE ait fini de ranger sa plaque. Pendant ce temps le suiveur,
     lui, a son aimantation COUPÉE par construction — donc si personne ne le pose, il
     reste où l'interpolation l'a laissé.
     🔴 MA PREMIÈRE ÉCRITURE DE CE TÉMOIN POSAIT LA PLAQUE PILE SUR SON CRAN, et elle
     restait VERTE en retirant la pose : à une position entière, le suivi tombe juste tout
     seul. Un témoin qui ne peut jamais accuser est le pire de tous. */
  piste.scrollLeft = pas + 40;
  /* 🏁 même conversion : `vues` est monotone, donc on peut la guetter sans risque de
     l'attraper dans un état transitoire. Le repos qui suit ne court contre rien. */
  await jusqua(() => vues.length > 0);
  await new Promise((r) => setTimeout(r, REPOS_MS));

  assert.equal(Math.round(roue.scrollLeft), D.ROUE.pas,
    `\u26d4 la roue s'est arr\u00eat\u00e9e \u00e0 ${roue.scrollLeft} au lieu de ${D.ROUE.pas} : ` +
    "une tuile \u00e0 cheval sur sa voisine, exactement la capture du 19/09");
  assert.deepEqual(vues, [1], "\u26d4 et la section doit \u00eatre commise une fois, \u00e0 l'arr\u00eat");

  /* \u2192 ET LA SYM\u00c9TRIE SE TIENT DANS LA SOURCE, parce qu'elle ne se voit pas \u00e0 l'\u0153il :
     \u26d4 aucune position de plaque ne se d\u00e9duit d'une largeur. */
  const source = stripComments(fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8"));
  assert.doesNotMatch(source, /piste\.scrollLeft\s*\/\s*l\b|piste\.scrollLeft\s*\/\s*largeurDalle\(\)/,
    "\u26d4 une LARGEUR n'est pas un PAS : entre deux plaques il y a un jour");
  assert.match(source, /const positionDesDalles = \(x\) => \{/,
    "\u2b50 l'inverse de `xDeLaDalle` se LIT dans la mise en page, comme lui");
  assert.match(source, /const repose = \(\) => \{\s*repos = null;\s*if \(maitre === "dalles"\)/,
    "\u26d4 le repos doit choisir son ex\u00e9cutant \u00c0 L'ARRIV\u00c9E : entre l'armement et le tir, " +
    "le suivi fait parler l'autre surface");
  assert.equal((source.match(/setTimeout\(repose, REPOS_MS\)/g) || []).length, 2,
    "\u26d4 les deux \u00e9couteurs arment LE M\u00caME repos");
});

test("34 — 👆 UN DÉFILEMENT PROGRAMMÉ N'EST PAS UN DOIGT : il rend la main à la roue", async () => {
  /* ⚖️ Eric, 2026-09-19, juste après la réparation du chemin inverse : *« le drag and drop
     maintenant il ne fonctionne plus, mettre le token dans la marge fait défiler les tuiles
     mais pas les dalles »*.
     🔴 LA CHAÎNE : un `pointerdown` sur un jeton BULLE jusqu'à la piste — et il le doit,
     puisqu'avant le péage de 350 ms ce même doigt peut encore balayer les plaques. Mais une
     fois l'objet PORTÉ, plus personne ne fait glisser de plaque : la marge pousse la ROUE,
     et le verrou refusait de la suivre parce que l'arbitre désignait encore les plaques.
     ⭐ LA LOI : *l'arbitre nomme la surface que le DOIGT fait glisser.* Chevrons, tuner,
     marge, placement d'ouverture — aucun n'est un doigt, donc chacun rend la main.
     ⛔ ET C'EST MA FAUTE DU TOUR D'AVANT : en donnant un maître à chaque geste, j'ai fait
     dépendre de lui des défilements qui n'ont pas de doigt du tout. Un arbitre qui tranche
     entre deux doigts ne dit RIEN d'un mouvement qui n'en a pas. */
  const noeud = rendu({ dalles: [0, 1, 2].map((i) => ({ section: i, objets: [] })) });
  const piste = noeud.querySelector('[data-organe="dalles"]');
  const roue = noeud.querySelector(".sac-roue");
  poserLesDalles();
  const pas = D.DALLE.l + D.DALLES.jour;
  [...piste.children].forEach((n, k) => { n.offsetLeft = pas * k; });

  /* → LE DOIGT SE POSE SUR UN JETON, donc sur la piste : l'arbitre désigne les plaques */
  piste.dispatchEvent({ type: "pointerdown", target: piste });
  assert.equal(piste.dataset.mene, "oui", "le doigt a bien désigné les plaques");

  /* → et c'est la MARGE qui pousse, pas le doigt — le même chemin que les chevrons, le
     tuner et le défilement du glisser (`agir = () => pisteNoeud.pousser(sens)`) */
  piste.pousser(1);
  /* ⛔ CELUI-CI NE SE CONVERTIT PAS, et c'est délibéré. La grandeur sous test est
     RÉVERSIBLE : le rouge documenté ci-dessous est « la roue avance à 65, puis
     l'arbitre la repose à 0 ». Guetter `roue.scrollLeft === pas` attraperait le
     TRANSITOIRE et rendrait ce garde vert sur du code cassé — on échangerait une
     sensibilité à la charge contre une dent en moins, ce qui est pire.
     ⏳ Il reste donc une course, avec 160 ms de marge. Assumé et nommé. */
  await new Promise((r) => setTimeout(r, REPOS_MS + 160));

  /* 📏 ROUGE MESURÉ en retirant le mot : la roue ne rend pas 65 mais **0**. Elle avance
     bien d'une tuile, puis la fin de geste des PLAQUES — qui mènent toujours, aux yeux de
     l'arbitre — la repose sur la plaque courante et la ramène au départ. ⭐ La pose exacte
     du garde 33 est juste ; c'est l'arbitre qui la fait tirer du mauvais côté. */
  assert.equal(Math.round(roue.scrollLeft), D.ROUE.pas, "la roue a bien avancé d'une tuile");
  assert.equal(Math.round(piste.scrollLeft), Math.round(pas),
    `⛔ les plaques sont restées à ${piste.scrollLeft} : la marge fait défiler les tuiles ` +
    "et pas les dalles — exactement ce qu'Eric a vu le 19/09");

  /* → ET LE MÊME MOT SUR LES DEUX CHEMINS PROGRAMMÉS, parce qu'il ne se voit pas à l'œil */
  const source = stripComments(fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8"));
  const pousse = source.slice(source.indexOf("piste.pousser = (sens)"));
  assert.match(pousse.slice(0, 200), /mener\("roue"\)/,
    "⛔ chevrons, tuner et marge passent tous par `pousser` : il doit rendre la main");
  const ouverture = source.slice(source.indexOf("placementEnAttente = () =>"));
  assert.match(ouverture.slice(0, 200), /mener\("roue"\)/,
    "⛔ le placement d'ouverture non plus n'est pas un doigt");
});

test("35 — \ud83c\udfa8 LE GENRE D'UNE SECTION PERSISTE, et l'or ne p\u00e8se pas", async () => {
  /* \u2696\ufe0f Eric, 2026-09-20 : *\u00ab je veux mon bleu pour le party bag, et mon dor\u00e9 pour les
     other \u00bb* \u00b7 *\u00ab implication des other storage : ne compte pas dans l'\u00e9quipement, c'est
     ailleurs \u2014 le cheval, un coffre dans le manoir \u00bb*.
     \ud83d\udd34 LE LISER\u00c9 DOR\u00c9 EXISTAIT DEPUIS DEUX JOURS, ET IL N'AVAIT AUCUN SUJET : le `+` de
     droite cr\u00e9ait une section ORDINAIRE. Le genre vivait \u00e0 l'\u00e9cran et rien ne l'\u00c9CRIVAIT
     au document \u2014 donc il mourait au premier repeint. \u26d4 Un genre qui ne persiste pas
     n'est pas un genre, c'est une couleur.
     \ud83d\udd34 ET LA CONS\u00c9QUENCE, JE L'AVAIS \u00c9CRITE DANS L'ENCART SANS QU'ELLE SOIT VRAIE DU
     CODE : une ligne rang\u00e9e dans une place dor\u00e9e gardait `backpack` et pesait dans
     `Encumbrance`. \u26d4 Un texte qui promet une r\u00e8gle que le code ne tient pas est pire
     qu'un texte absent \u2014 le joueur le croit.
     \u2b50 LE M\u00c9CANISME \u00c9TAIT ENTIER : le party bag rend `storage` pour cette raison exacte,
     et `LIEUX_PESES` ne somme que `self + backpack`. Il n'y avait rien \u00e0 inventer. */
  const E = await import("../ui/builder/equipment-step.mjs");
  const doc = { build: { choices: [
    { path: "backpack.sections[3].name", value: "Red chest" },
    { path: "backpack.sections[3].dehors", value: 1 },
  ] } };

  /* \u2460 LE GENRE SE LIT AU DOCUMENT */
  assert.deepEqual([...E.sectionsDehors(doc)], [3], "\u26d4 le `+` dor\u00e9 doit \u00c9CRIRE le genre");
  assert.deepEqual([...E.boitesDehors(doc)], [E.boiteDeSection(3)]);
  const dite = E.sectionsDuSac(doc).find((x) => x.index === 3);
  assert.equal(dite.dehors, true, "\u26d4 et la liste des sections doit le porter");
  assert.equal(E.sectionsDuSac({ build: { choices: [] } }).some((x) => x.dehors), false,
    "\u26d4 aucune section n'est dehors par d\u00e9faut : c'est le joueur qui le dit");

  /* \u2461 ET UNE PLACE DOR\u00c9E PESE COMME LE PARTY BAG \u2014 hors `Encumbrance` */
  assert.equal(E.lieuDeLaBoite(E.boiteDeSection(3)), "backpack",
    "\u26d4 sans le fait, la loi ne peut pas deviner : une bo\u00eete `sN` est dans le sac");
  assert.equal(E.lieuDeLaBoite(E.boiteDeSection(3), E.boitesDehors(doc)), "storage",
    "\u2b50 avec le fait, elle rend `storage` \u2014 la ligne `Other`, hors encombrement");
  assert.equal(E.lieuDeLaBoite(E.boiteDeSection(2), E.boitesDehors(doc)), "backpack",
    "\u26d4 et les voisines ne changent pas : le genre est PAR SECTION");

  /* \u2462 \ud83c\udfa8 LES DEUX HABITS, ET LEURS DEUX \u00c9TATS \u2014 d\u00e9j\u00e0 tenus par le garde 30 ; ici on
     v\u00e9rifie que l'\u00c9CRAN pose le `data-lieu` \u00e0 partir de la DONN\u00c9E. */
  const n = rendu({ section: 1, sections: [
    { nom: "Weapons" }, { nom: "Party bag", party: true }, { nom: "Red chest", dehors: true }] });
  const parNom = Object.fromEntries(tous(n, ".sac-cran").map((c) => [c.textContent, c.dataset.lieu]));
  assert.equal(parNom["Weapons"], undefined, "une section du sac n'a pas de lieu d\u00e9clar\u00e9");
  assert.equal(parNom["Party bag"], "party", "\ud83d\udd35 le bleu");
  assert.equal(parNom["Red chest"], "dehors", "\ud83d\udfe1 et l'or");

  /* \u2463 \u26d4 ET LE BANC EN MONTRE UNE : un banc qui ne peut pas montrer l'organe ne prouve
     rien de lui \u2014 c'est le d\u00e9faut du ruban \u00e0 une seule plaque, une seconde fois. */
  const banc = fs.readFileSync(path.join(UI, "banc-sac.html"), "utf8");
  assert.match(banc, /dehors: true/, "\u26d4 le banc doit porter une place hors du sac");
});

test("36 — \ud83d\udd0c LE CONTRAT D'UNE SECTION TRAVERSE L'\u00c9TAPE, \u26d4 il ne s'y fait pas rogner", () => {
  /* \u2696\ufe0f Eric, 2026-09-20, capture \u00e0 l'appui : *\u00ab absolument rien de bleu \u00bb* \u00b7 *\u00ab je ne
     l'ai jamais vu, ni sur iPad ni sur Mac \u00bb*.
     \ud83d\udd34 ET IL DISAIT VRAI : le bleu n'a JAMAIS exist\u00e9 dans l'application. L'\u00e9tape recopiait
     les sections en ne gardant que `nom` et `fige` \u2014 `party`, `dehors` et `renommable`
     \u00e9taient jet\u00e9s en route. Donc `data-lieu` n'\u00e9tait jamais pos\u00e9, donc ni bleu ni or, et
     la poign\u00e9e `/` restait arm\u00e9e sur une place qui refuse d'\u00eatre renomm\u00e9e.
     \u26d4 ET LE BANC NE POUVAIT PAS LE VOIR : lui passe les objets ENTIERS. Le genre \u00e9tait
     VERT au banc et ABSENT \u00e0 l'\u00e9cran \u2014 c'est pour \u00e7a que j'ai cherch\u00e9 une teinte, puis un
     cran de nuit, puis un th\u00e8me, pendant qu'il manquait un CHAMP. Trois heures.
     \u2b50 LA LE\u00c7ON EST CELLE D\u00c9J\u00c0 PAY\u00c9E SUR LES POIDS, LE 19/09 : *un contrat chang\u00e9 d'un
     c\u00f4t\u00e9 se change des DEUX*. La parade n'est pas de recopier mieux, c'est de n'avoir
     plus qu'UNE liste \u2014 et que celle qui LIT la publie. */
  const source = stripComments(fs.readFileSync(path.join(UI, "equipment-step.mjs"), "utf8"));

  /* \u2460 L'\u00c9TAPE NE RETAPE PLUS LA LISTE : elle lit celle de l'\u00e9cran. */
  assert.match(source, /CHAMPS_DE_SECTION/,
    "\u26d4 l'\u00e9tape doit employer la liste publi\u00e9e par l'\u00e9cran");
  assert.doesNotMatch(source, /sections: sections\.map\(\(s\) => \(\{ nom:/,
    "\u26d4 une seconde liste \u00e9crite \u00e0 la main : c'est exactement ce qui a mang\u00e9 le genre");

  /* \u2461 ET LA LISTE COUVRE TOUT CE QUE L'\u00c9CRAN LIT \u2014 le t\u00e9moin qui compte, parce qu'il
     rougira au prochain champ ajout\u00e9 sans \u00eatre publi\u00e9. */
  const ecran = stripComments(fs.readFileSync(path.join(UI, "sac-ecran.mjs"), "utf8"));
  const lus = new Set();
  for (const m of ecran.matchAll(/\bs\.([a-z]+)\b/g)) lus.add(m[1]);
  for (const m of ecran.matchAll(/\bfigee\.([a-z]+)\b/g)) lus.add(m[1]);
  for (const champ of ["nom", "fige", "renommable", "party", "dehors"]) {
    assert.ok(lus.has(champ), `\u26d4 l'\u00e9cran ne lit plus \`${champ}\` : ce garde est p\u00e9rim\u00e9`);
    assert.ok(CHAMPS_DE_SECTION.includes(champ),
      `\u26d4 \`${champ}\` est lu par l'\u00e9cran mais ne traverse pas l'\u00e9tape \u2014 il arrivera \`undefined\``);
  }

  /* \u2462 ET L'\u00c9CRAN POSE BIEN LE GENRE \u00c0 PARTIR DE LA DONN\u00c9E QU'IL RE\u00c7OIT */
  const n = rendu({ section: 0, sections: [
    { nom: "Party bag", party: true, fige: true, renommable: false },
    { nom: "Red chest", dehors: true }] });
  const parNom = Object.fromEntries(tous(n, ".sac-cran").map((c) => [c.textContent, c.dataset.lieu]));
  assert.equal(parNom["Party bag"], "party", "\ud83d\udd35");
  assert.equal(parNom["Red chest"], "dehors", "\ud83d\udfe1");
});

test("37 — \ud83d\udcd0 LE BAS DU BLOC DE POIDS EST \u00c0 8 DE L'AR\u00caTE DE SA BANDE", () => {
  /* \u2696\ufe0f Eric, 2026-09-20 : *\u00ab as-tu oubli\u00e9 de mettre 8 blg entre le bas de la cellule et la
     fin de la dalle ? \u00bb*.
     \ud83d\udd34 OUI, ET LE COMMENTAIRE DU PLAN AFFIRMAIT LE CONTRAIRE : *\u00ab cal\u00e9 en bas, il reste
     ses 8 sous le bloc avant la grille \u00bb*. \ud83d\udccf Mesur\u00e9 \u00e0 l'\u00e9cran : le bloc finissait \u00e0 96,
     et la bande HAUTE finit \u00e0 96 elle aussi. Z\u00e9ro jeu \u2014 le texte \u00e9tait coll\u00e9 \u00e0 l'ar\u00eate.
     \u26d4 LES 8 QUE LA PHRASE COMPTAIT SONT CEUX DU JOUR ENTRE LES DEUX BANDES, pas ceux du
     bloc dans la sienne. Un m\u00eame nombre \u00e0 deux endroits, et j'ai lu l'un pour l'autre \u2014
     c'est la faute des *deux nombres voisins qui ne mesurent pas la m\u00eame grandeur*, une
     fois de plus.
     \u2b50 ET CE T\u00c9MOIN MESURE LES DEUX S\u00c9PAR\u00c9MENT, parce que c'est leur CONFUSION qui a
     co\u00fbt\u00e9 : le jour entre bandes, et la marge du bloc dans la sienne. */
  const org = (nom) => D.ORGANES.find((o) => o.nom === nom);
  const bandeHaute = D.DALLES.y - 8;                   /* la plaque, moins le jour */
  const basDuBloc = org("POIDS DETAIL").y + org("POIDS DETAIL").h;
  assert.equal(bandeHaute - basDuBloc, 8,
    `\u26d4 le bloc de poids finit \u00e0 ${basDuBloc} et sa bande \u00e0 ${bandeHaute} : le texte touche l'ar\u00eate`);
  assert.equal(D.DALLES.y - bandeHaute, 8,
    "\u26d4 et le jour entre les deux bandes reste 8 \u2014 ce sont DEUX huit, pas un seul");

  /* \u2b50 ET LE BLOC S'ALIGNE SUR LES DEUX BOUTONS DE SA RANG\u00c9E : une rang\u00e9e se lit sur une
     seule ligne d'horizon. \u26d4 Avant, il partait 8 plus bas qu'eux. */
  assert.equal(org("POIDS TOTAL").y, org("TRIER").y,
    "\u2696\ufe0f le total part au niveau du haut de `Sort`");
  assert.equal(org("POIDS TOTAL").y, org("TASSER").y, "\u2026 et de `edit sections`");

  /* \ud83d\udd12 ET LE BAS DE L'\u00c9CRAN TENAIT D\u00c9J\u00c0 \u2014 NORMES : *\u00ab \u00e0 8 blg du bord bas de la dalle \u00bb*.
     \u26d4 Ce garde le tient aussi, pour qu'on sache lequel des deux a boug\u00e9 le jour o\u00f9 l'un
     des deux cassera. */
  assert.equal(D.DALLE.h - (org("RANGEE").y + org("RANGEE").h), 8,
    "\u2696\ufe0f la derni\u00e8re rang\u00e9e est \u00e0 8 du bas de la dalle");
});
