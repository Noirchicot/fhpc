/* ══ LOT 363 — LA SORTIE DE L'ÉTAPE ÉQUIPEMENT VIT DANS R (Gear) ══════════════════════════════

   ⚖️ NORMES `equipement-next-vit-dans-r`. Eric, 20/09 : *« en fait le next devra être dans R »* ;
   le 30/09 : *« A — sous la bourse »*, puis la dictée qui l'a achevée — *« pousse le ? à droite,
   aligne companions et next verticalement (dimension identique pour les 2) tout en les centrant.
   Comme dans les étapes precedentes on avait l'habitude de valider l'étape par un done. un texte de
   recap. probablement un recap sur un popup car peu de place pour le faire sur gear. en bas de ce
   recap cancel pour tweaker et next pour poursuivre. et validation de l'étape dans le belt »* et
   *« bourse done et Companions alignés verticalement, ? à 8 blg du bord droit »*. Ses réponses :
   « Done, puis Next » · « Gear, Pack, bourse » · le voyant « reste allumé » · « Centrée Send ↔ ? ».

   🔴 CE QUE CE GARDE DÉFEND, UN TÉMOIN PAR MANIÈRE DE MENTIR :
   ① la PLACE : la colonne bourse · `Done` · Companions sur UN axe, centré entre le dessin de `Send`
     et celui du `?` ; `Done` et Companions de même boîte ; le `?` à 8 du bord, sa cible au bord —
     et la bourse et le `?` IDENTIQUES sur les trois plans (Gear, Pack, Wares) ;
   ② le RENDU : un seul organe, `Done` avant validation (il ouvre le récap), `Next` après (il repart),
     bleu, jamais éteint ; le récap et ses trois blocs, `Cancel` qui referme, `Next` qui valide ;
   ③ la VALIDATION : l'étape câble `parcoursNext` sur la racine `equipment`, que le belt lit ;
   ④ le BELT : la signature allume le voyant d'Equipment, et le cran suivant est Sheet sur les deux piles.

   ⛔ SA LIMITE : il lit les plans, le DOM du stub et le texte des sources. Que la page peigne le `?`
   à sa cote et qu'un doigt atteigne `Done` se prouve au navigateur (rapport du lot 363). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";
import { ROOT, makeHarness, PILE_SRD } from "./build-harness.mjs";
import { charSchema } from "./doc-harness.mjs";
import { PILE } from "../src/tools/exemple-fh-en.mjs";
import { createFhDestinyStat } from "../src/modules/fh/destiny-stat.mjs";
import { createFhSkillPoolStat } from "../src/modules/fh/skill-pool.mjs";
import { createFhSpeciesTraits } from "../src/modules/fh/species-traits.mjs";
import { createDocWriters } from "../src/doc/writers.mjs";
globalThis.document = createTestDocument();

const UI = path.join(ROOT, "ui", "builder");
const G = await import("../ui/builder/gear-disposition.mjs");
const W = await import("../ui/builder/wares-disposition.mjs");
const P = await import("../ui/builder/sac-disposition.mjs");
const { construireLEcranGear, feuilleDesCotes, CLEF_DE, MOTS_DU_RECAP } = await import("../ui/builder/gear-ecran.mjs");
const { RACINE_EQUIPEMENT } = await import("../ui/builder/equipment-step.mjs");
const { estConfirme } = await import("../ui/builder/parcours.mjs");
const { cransAlignes } = await import("../ui/builder/etapes.mjs");

const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "gear-cotes.json"), "utf8"));
const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");
const un = (liste, nom) => {
  const tous = (liste || []).filter((o) => o.nom === nom);
  assert.equal(tous.length, 1, `un seul « ${nom} »`);
  return tous[0];
};
const centre = (o) => o.x + o.l / 2;

/* ══ ① LA PLACE ═══════════════════════════════════════════════════════════════════════════ */

test("① la colonne bourse · Done · Companions : UN axe, centré entre le dessin de Send et celui du ?", () => {
  const done = un(G.ORGANES, "DONE");
  assert.equal(un(TABLE.boites, "DONE").x, done.x, "et il vient de la TABLE du plan, pas d'une retouche");
  const bourse = un(G.ORGANES, "PURSE"), comp = un(G.ORGANES, "COMPANIONS");
  const send = un(G.ORGANES, "SEND"), guide = un(G.ORGANES, "?");
  const axe = (send.x + send.l + guide.x) / 2;
  assert.equal(axe, 285.5, "témoin : l'axe tombe à 285,5");
  for (const o of [bourse, done, comp]) assert.equal(centre(o), axe, `⛔ ${o.nom} sort de l'axe (« alignés verticalement »)`);
  assert.deepEqual([done.l, done.h], [comp.l, comp.h], "« dimension identique pour les 2 »");
  assert.deepEqual([done.l, done.h], [G.PETIT, 40], "un petit, 77 × 40");
  /* 🔄 LOT 371 — à 8 SOUS LA BOURSE, et non plus sur la rangée des Tally (464) : c'est le seul moyen de tenir les
     deux écarts à 8 de la colonne sans rogner un organe (NORMES `equipement-colonne-du-pied`). */
  assert.equal(done.y, bourse.y + bourse.h + 8, "à 8 sous la bourse");
  assert.ok(done.x >= un(G.ORGANES, "SEND TO").x + un(G.ORGANES, "SEND TO").l + 8, "et à ≥ 8 de « destination »");
  /* 🔄 LOT 371 — le corps d'un bouton à libellé, 16 / 600 (`bouton-deux-largeurs`), plus le T2 de `Send` */
  assert.equal(done.cran, "16/600", "le corps que la Bible donne à un bouton à libellé");
  assert.equal(done.mot, "Done", "le plan porte le mot le plus long des deux (Done 40,29 > Next 36,05 à 16 px)");
  /* 🔒 LOT 371 — LE SACRÉ N° 3 : ≥ 8 blg entre voisins, mesurés entre les DESSINS (le lot 370 a relevé 6). */
  const colonne = [bourse, done, comp].sort((a, b) => a.y - b.y);
  for (let i = 0; i + 1 < colonne.length; i++) {
    const ecart = colonne[i + 1].y - (colonne[i].y + colonne[i].h);
    assert.ok(ecart >= 8, `⛔ ${colonne[i].nom} → ${colonne[i + 1].nom} : ${ecart} blg, sous le 8 du sacré n° 3`);
  }
  assert.ok(done.cible.l >= G.TOUCH && done.cible.h >= G.TOUCH, "une cible d'au moins 44");
});

test("① bis — le ? à 8 du bord droit, sa cible au bord ; la bourse et le ? identiques sur les trois plans", () => {
  for (const [nom, plan] of [["Gear", G], ["Pack", P], ["Wares", W]]) {
    const guide = un(plan.ORGANES, "?");
    assert.equal(guide.x + guide.l, 375 - 8, `${nom} : « ? à 8 blg du bord droit » (son dessin)`);
    assert.equal(guide.cible.x + guide.cible.l, 375, `${nom} : sa cible colle au bord (comme la lune à gauche)`);
    assert.ok(guide.cible.x <= guide.x && guide.x + guide.l <= guide.cible.x + guide.cible.l, `${nom} : le dessin tient dans sa cible`);
  }
  const bourses = [G, P].map((plan) => un(plan.ORGANES, "PURSE").x);
  assert.deepEqual(bourses, [260.5, 260.5], "la bourse, cote commune de Gear et de Pack (Wares la lit dans Pack)");
  /* 🔄 LOT 371 — et à 8 du haut de la dalle du pied, sur les deux plans (Gear sous son belt de 60) */
  assert.equal(un(G.ORGANES, "PURSE").y - G.BELT_H, un(P.ORGANES, "PURSE").y, "la même hauteur sous le belt");
  assert.equal(un(G.ORGANES, "PURSE").y - G.DALLES.find((d) => d.nom === "PIED").y, 8, "à 8 du haut du pied");
  assert.equal(un(W.ORGANES, "PURSE").x, 260.5, "et Wares la lit bien");
});

test("① ter — ⛔ ni Wares ni Pack ne portent la sortie (« Wares ne le porte pas », 20/09)", () => {
  for (const nom of ["DONE", "NEXT"]) {
    assert.equal((W.ORGANES || []).filter((o) => o.nom === nom).length, 0, `Wares : ${nom}`);
    assert.equal((P.ORGANES || []).filter((o) => o.nom === nom && !o.dans).length, 0, `Pack : ${nom} au pied`);
  }
});

/* ══ ② LE RENDU ═══════════════════════════════════════════════════════════════════════════ */

function gestesDe(options) {
  const gestes = [];
  const n = construireLEcranGear({
    ...options,
    surDone: () => gestes.push("done"),
    surSuivant: () => gestes.push("suivant"),
    surAnnulerRecap: () => gestes.push("annuler"),
    surPorte: (p) => gestes.push(`porte:${p}`),
    surBouton: (b) => gestes.push(`bouton:${b}`)
  }).noeud;
  return { n, gestes };
}

test("② avant validation : `Done`, bleu, allumé, qui ouvre le récap et rien d'autre", () => {
  assert.equal(CLEF_DE.DONE, "done");
  const { n, gestes } = gestesDe({ etapeSignee: false });
  const tous = [...n.querySelectorAll('[data-organe="done"]')];
  assert.equal(tous.length, 1, "un seul organe de sortie");
  const b = tous[0];
  assert.equal(b.tagName, "BUTTON");
  assert.equal(b.className, "gear-porte", "la famille des petits boutons à verbe, comme Companions");
  assert.equal(b.textContent, "Done");
  assert.equal(b.dataset.porte, "done");
  assert.notEqual(b.disabled, true, "jamais éteint : rien n'est obligatoire à l'Équipement");
  b.click();
  assert.deepEqual(gestes, ["done"]);
  assert.equal(n.querySelector(".gear-recap"), null, "le récap n'est pas ouvert d'office");
});

test("② bis — après validation : le MÊME organe dit `Next`, et il repart sans récap", () => {
  const { n, gestes } = gestesDe({ etapeSignee: true });
  const b = n.querySelector('[data-organe="done"]');
  assert.equal(b.textContent, "Next", "« Done, puis Next » — jamais les deux ensemble");
  assert.equal(b.dataset.porte, "next");
  b.click();
  assert.deepEqual(gestes, ["suivant"]);
});

test("② ter — la feuille le pose à sa cote du plan ; aucune règle ne le repeint ; Cancel est rouge", () => {
  const done = un(G.ORGANES, "DONE");
  const regle = feuilleDesCotes().split("}").find((r) => r.includes('[data-organe="done"]'));
  assert.ok(regle, "⛔ la feuille ne pose pas la sortie : elle flotterait à l'origine de l'écran");
  assert.ok(regle.includes(`left:${done.cible.x}px;top:${done.cible.y - G.BELT_H}px;width:${done.cible.l}px;height:${done.cible.h}px`), regle);
  const css = stripComments(lire("shell.css"));
  assert.match(css, /\.gear-porte, \.wares-porte \{[^}]*--bouton-fond:\s*var\(--info\)/, "témoin : la famille est bleue");
  /* 🔄 LOT 371 — la couleur de son VERBE (`bouton-trois-verbes`) et le corps de la Bible (`bouton-deux-largeurs`) :
     `Done` VERT, `Next` le BLEU de la famille, tous deux à 16 / 600 — lus dans la feuille, sur leur verbe. */
  assert.match(css, /button\.gear-porte\[data-organe="done"\]\[data-porte="done"\]\s*\{\s*--bouton-fond:\s*var\(--positive\)/,
    "⛔ `Done` n'est pas vert");
  assert.match(css, /button\.gear-porte\[data-organe="done"\]\[data-porte\]\s*\{\s*font-size:\s*var\(--t4\)/,
    "⛔ la sortie n'est pas au corps 16 px");
  assert.doesNotMatch(css, /\[data-porte="next"\]/, "⛔ `Next` quitterait le bleu de la famille");
  assert.match(lire("tokens.css"), /--t4:\s*calc\(16px/, "témoin : `--t4` vaut bien 16 px");
  /* 🔄 LOT 371 — le récap porte `Back` (Eric, 30/09 : « a) Back, bleu ») : le bleu de la famille, aucune règle à lui */
  assert.doesNotMatch(css, /\[data-porte="(annuler|retour)"\]/, "⛔ une règle propre au retour du récap le sortirait du bleu");
});

test("② quater — le récap : Gear, Pack, bourse ; il EXIGE sa réponse (Cancel referme, Next valide) et cache Done", () => {
  const boites = { tete1: { nom: "Hat", qte: 1 }, fourreau1: { nom: "Dagger", qte: 2 } };
  const { n, gestes } = gestesDe({
    etapeSignee: false, recapOuvert: true, boites, bourse: { gp: 64 },
    recapSac: [{ objet: "Robe", qte: 1 }, { objet: "Ration", qte: 5 }]
  });
  const recap = n.querySelector(".gear-recap");
  assert.ok(recap, "le récap est ouvert");
  const blocs = [...recap.querySelectorAll(".gear-recap-bloc")];
  assert.deepEqual(blocs.map((b) => b.querySelector(".gear-recap-tete").textContent), ["Gear", "Pack", "Purse"]);
  const texte = (i) => blocs[i].querySelector(".gear-recap-liste").textContent;
  assert.equal(texte(0), "HEAD/NECK 1 — Hat · ARM/HAND 1 — 2 × Dagger", "l'emplacement tel que l'écran l'écrit, dans l'ordre du plan");
  assert.equal(texte(1), "Robe · 5 × Ration");
  assert.equal(texte(2), "64 gp", "l'or, écrit comme le montant posé sur la bourse");
  const [annuler, suivant] = [...recap.querySelector(".gear-recap-pied").querySelectorAll("button")];
  /* 🔄 LOT 371 — Eric, 30/09 : « a) Back, bleu … if you want to tweak some more, réécris qq chose » */
  assert.deepEqual([annuler.textContent, suivant.textContent], ["Back", "Next"], "Back pour retoucher, Next pour poursuivre");
  assert.equal(annuler.dataset.porte, "retour", "le verbe de ce qui recule — jamais `annuler`, qui défait");
  assert.equal(recap.querySelector(".gear-recap-invite").textContent, MOTS_DU_RECAP.invite, "la phrase qui invite à retoucher");
  /* ⚖️ LOT 371 — `popup-question-exige-une-reponse` : le récap ne se ferme QUE par ses réponses. Un clic sur le
     voile — à côté du récap — ne fait RIEN (il exigeait « annuler » au lot 363). */
  n.querySelector('[data-organe="recap-voile"]').click();
  annuler.click();
  suivant.click();
  /* un clic DANS le récap ne le referme pas — ⚠️ le stub ne fait pas remonter les événements : on remet
     au voile ce qu'il recevrait après la remontée, un clic dont la CIBLE est le récap. (Un `recap.click()`
     n'atteindrait jamais le voile, et ce témoin serait vert quoi qu'on fasse — vu rouge à la mutation.) */
  n.querySelector('[data-organe="recap-voile"]').dispatchEvent({ type: "click", target: recap });
  assert.deepEqual(gestes, ["annuler", "suivant"], "ni le voile ni un clic dans le récap ne répondent à sa place");
  /* ⚖️ LOT 371 — `bouton-done-et-next-jamais-ensemble` : le récap porte `Next`, donc `Done` n'est pas rendu. */
  assert.equal(n.querySelector('[data-organe="done"]'), null, "⛔ Done visible sous le récap, à côté de son Next");
  const ferme = construireLEcranGear({ etapeSignee: false, recapOuvert: false }).noeud;
  assert.ok(ferme.querySelector('[data-organe="done"]'), "témoin : récap fermé, Done est là");
});

/* ══ ③ LA VALIDATION ══════════════════════════════════════════════════════════════════════ */

test("③ l'étape câble la signature et `parcoursNext` sur la racine `equipment`, jamais un nom d'étape", () => {
  assert.equal(RACINE_EQUIPEMENT, "equipment", "la racine EST l'id du cran — c'est lui que le belt lit");
  const src = stripComments(lire("equipment-step.mjs"));
  assert.match(src, /etapeSignee:\s*estConfirme\(docu, RACINE_EQUIPEMENT\)/, "⛔ la sortie ne saurait pas dire `Next`");
  assert.match(src, /surDone:\s*\(\)\s*=>\s*\{\s*recapOuvert = true;/, "⛔ `Done` n'ouvrirait pas le récap");
  assert.match(src, /surAnnulerRecap:\s*\(\)\s*=>\s*\{\s*recapOuvert = false;\s*peindre\(\);\s*\}/, "⛔ `Cancel` écrirait, ou ne refermerait pas");
  assert.match(src, /surSuivant:\s*\(\)\s*=>\s*\{\s*recapOuvert = false;\s*act\(\{ kind: "parcoursNext", racine: RACINE_EQUIPEMENT \}\);\s*\}/,
    "⛔ `Next` ne validerait pas l'étape");
  assert.doesNotMatch(src, /["']review["']|goToStepId/, "⛔ l'étape suivante se lit sur le belt, elle ne s'écrit pas");
});

test("③ bis — `parcoursNext` signe la racine PUIS passe au cran suivant du belt (le geste de toutes les étapes)", () => {
  const src = stripComments(lire("shell.mjs"));
  const debut = src.indexOf('if (action.kind === "parcoursNext")');
  assert.ok(debut >= 0, "témoin : la branche existe");
  const branche = src.slice(debut, src.indexOf("goToStep(cranVoisin(1));", debut) + 30);
  assert.match(branche, /docWriters\.confirm\(\{ document: state\.document, path: action\.racine \}\)/, "elle signe");
  assert.match(branche, /goToStep\(cranVoisin\(1\)\)/, "puis elle repart au cran suivant");
});

test("③ ter — l'écrivain de document accepte la signature `equipment`, et `estConfirme` la relit", () => {
  const writers = createDocWriters({ schema: charSchema() });
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "personnage-fh-en-niveau1.fh-char.json"), "utf8"));
  assert.equal(estConfirme(doc, RACINE_EQUIPEMENT), false, "témoin : l'exemple n'a pas validé son Équipement");
  const signe = writers.confirm({ document: doc, path: RACINE_EQUIPEMENT });
  assert.equal(estConfirme(signe, RACINE_EQUIPEMENT), true);
  assert.equal(JSON.stringify(signe.build.choices), JSON.stringify(doc.build.choices), "signer ne touche aucun choix");
});

/* ══ ④ LE BELT ════════════════════════════════════════════════════════════════════════════ */

const PILES = { SRD: PILE_SRD, FH: PILE };
const MODULES = () => [createFhDestinyStat(), createFhSkillPoolStat(), createFhSpeciesTraits()];

test("④ la signature allume le voyant d'Equipment, et le cran suivant est Sheet sur les deux piles", () => {
  const src = stripComments(lire("shell.mjs"));
  const corps = src.slice(src.indexOf("function paintBelt("));
  assert.match(corps, /item\.dataset\.fait = String\(!nonResolu && \(estConfirme\(state\.document, racine\)/,
    "témoin : le voyant lit la signature de la racine du cran");
  for (const [nom, couches] of Object.entries(PILES)) {
    const h = makeHarness({ layers: couches, modules: MODULES() });
    const crans = cransAlignes(h.layers.verbs.flags());
    const ici = crans.findIndex((c) => c && c.id === RACINE_EQUIPEMENT);
    assert.ok(ici >= 0, `${nom} : Equipment est un cran de la ceinture, sous l'id de sa racine`);
    const suivant = crans.slice(ici + 1).find(Boolean);
    assert.equal(suivant && suivant.id, "review", `${nom} : après Equipment, Sheet`);
  }
});
