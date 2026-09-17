/* ══ LE GARDE DE X1 — LA FICHE D'UN OBJET POSSÉDÉ — lot 213, 2026-09-17 ══════

   🔴 CE QU'IL DÉFEND : que la disposition posée au dépôt soit BIEN la table
   générée (`Plan-ecran-X1/X1_cotes.json` → `X1_declaration.js`), que cette
   table tienne les lois du plan — la dalle, la marge, le plancher des cibles,
   aucun chevauchement, le budget vertical fermé à 500 —, et que l'écran rende
   ce que la table déclare, sans qu'un nombre soit retapé nulle part.

   ⚖️ ET IL DÉFEND LA LOI DU RANG X, qui ne vit dans aucun autre garde : *« les
   x ne s'inscrivent pas dans le belt »* (Eric, 16/09). Une fiche d'objet
   n'écrit JAMAIS la 3ᵉ ligne — ce qui, en code, veut dire une chose précise et
   vérifiable : `x1` n'est pas une clef de `FENETRE_DE`.

   ⛔ SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS : il lit des tables, des
   sources et le DOM du stub. Il ne mesure AUCUN rendu — le rendu se regarde au
   navigateur (`ui/builder/banc-x1.html`, fait pour ça), et c'est là qu'ont été
   trouvés les deux défauts que ce garde n'aurait jamais vus : l'encre du site
   illisible sur le parchemin, et la déchirure qui mangeait le premier caractère
   de la description. */

import test from "node:test";
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
const { construireLaFicheX1, feuilleDesCotesX1, CLEF_DE } = await import("../ui/builder/x1-ecran.mjs");
const { construireLEcranGear } = await import("../ui/builder/gear-ecran.mjs");
const TABLE = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixtures", "x1-cotes.json"), "utf8"));
const shell = stripComments(fs.readFileSync(path.join(UI, "shell.css"), "utf8"));
const etape = stripComments(fs.readFileSync(path.join(UI, "equipment-step.mjs"), "utf8"));
const coquille = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
const source = stripComments(fs.readFileSync(path.join(UI, "x1-ecran.mjs"), "utf8"));

const { DALLE, MARGE, TOUCH, ORGANES } = D;
const rect = (o) => ({ x: o.x, y: o.y, l: o.l, h: o.h });
const cibleDe = (o) => (o.cible ? { x: o.cible.x, y: o.cible.y, l: o.cible.l, h: o.cible.h } : rect(o));
const secants = (a, b) => a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.h && b.y < a.y + a.h;

/* ══ 1 — LA DÉCLARATION EST LA TABLE, PAS UNE COPIE QUI DÉRIVE ═══════════ */

test("1 — la déclaration posée au dépôt EST la table du plan (mêmes organes, mêmes cotes)", () => {
  const parNom = Object.fromEntries(TABLE.boites.map((b) => [b.nom, b]));
  assert.equal(ORGANES.length, TABLE.boites.length, "même compte d'organes que la table");
  for (const o of ORGANES) {
    const t = parNom[o.nom];
    assert.ok(t, `« ${o.nom} » est dans la déclaration mais pas dans la table`);
    for (const k of ["x", "y", "l", "h", "sorte"]) assert.equal(o[k], t[k], `${o.nom}.${k}`);
  }
  assert.deepEqual([DALLE.l, DALLE.h, MARGE, TOUCH],
    [TABLE.dalle.l, TABLE.dalle.h, TABLE.marge, TABLE.touch]);
  /* ⭐ LE DÉBORD DU PARCHEMIN EST UNE COTE COMME LES AUTRES : il vient de la
     mesure faite sur l'image, pas d'un nombre choisi dans une feuille. */
  assert.equal(D.PARCHEMIN_DEBORD, TABLE.parchemin_debord);
});

/* ══ 2 — LES LOIS DU PLAN, RECALCULÉES ICI ═══════════════════════════════ */

test("2 — rien hors de la dalle, rien à moins de 4 d'un bord", () => {
  const fautes = [];
  for (const o of ORGANES) {
    const b = cibleDe(o);
    if (b.x < MARGE || b.y < MARGE || b.x + b.l > DALLE.l - MARGE || b.y + b.h > DALLE.h - MARGE) {
      fautes.push(`${o.nom} sort de la dalle utile`);
    }
  }
  assert.deepEqual(fautes, []);
});

test("3 — toute cible atteint 44 dans les DEUX sens, et le dessin peut être plus petit", () => {
  const fautes = [];
  for (const o of ORGANES) {
    if (!o.cible) continue;
    if (o.cible.l < TOUCH || o.cible.h < TOUCH) fautes.push(`${o.nom} : cible ${o.cible.l}×${o.cible.h}`);
    /* ⭐ ET LE DESSIN TIENT DANS SA CIBLE : une cible plus PETITE que son dessin
       ne serait pas une cible, ce serait une amputation. */
    if (o.l > o.cible.l || o.h > o.cible.h) fautes.push(`${o.nom} : dessin plus grand que sa cible`);
  }
  assert.deepEqual(fautes, []);
});

test("4 — aucun chevauchement de dessins, aucun chevauchement de cibles", () => {
  const dessins = [];
  const cibles = [];
  for (let i = 0; i < ORGANES.length; i += 1) {
    for (let j = i + 1; j < ORGANES.length; j += 1) {
      const a = ORGANES[i];
      const b = ORGANES[j];
      if (secants(rect(a), rect(b))) dessins.push(`${a.nom} × ${b.nom}`);
      if (secants(cibleDe(a), cibleDe(b))) cibles.push(`${a.nom} × ${b.nom}`);
    }
  }
  assert.deepEqual(dessins, [], "deux dessins qui se croisent sont un plan faux");
  assert.deepEqual(cibles, [], "deux cibles qui se croisent sont un doigt qui se trompe");
});

test("5 — le budget vertical est fermé : la description prend ce qui reste, et rien ne déborde", () => {
  const desc = ORGANES.find((o) => o.nom === "DESCRIPTION");
  const pied = ORGANES.filter((o) => o.y > desc.y + desc.h).map((o) => cibleDe(o));
  assert.equal(Math.max(...pied.map((b) => b.y + b.h)), DALLE.h - MARGE,
    "la dernière rangée finit à 4 du bas, pile");
  assert.equal(Math.min(...ORGANES.map((o) => cibleDe(o).y)), MARGE, "et la première commence à 4 du haut");
  /* ⭐ LA ZONE DU TEXTE EST UN GROUPE DE TROIS : un filet, la description, un filet
     — Eric, 17/09 au soir. Les filets sont COLLÉS à la description (ils la délimitent,
     ils ne la voisinent pas) ; la gouttière de 8 est au-dessus et au-dessous du GROUPE.
     🔴 RÉÉCRIT À LA NOUVELLE VÉRITÉ, pas relâché : la version d'avant mesurait 8 contre
     la description elle-même, et elle a rougi le jour où les filets sont arrivés. */
  const haut = ORGANES.find((o) => o.nom === "FILET HAUT");
  const bas = ORGANES.find((o) => o.nom === "FILET BAS");
  assert.equal(haut.y + haut.h, desc.y, "le filet du haut touche la description");
  assert.equal(desc.y + desc.h, bas.y, "et celui du bas aussi");
  assert.deepEqual([haut.x, haut.l, bas.x, bas.l], [desc.x, desc.l, desc.x, desc.l],
    "les filets partagent la colonne du texte — même marge, même largeur");
  const avant = Math.max(...ORGANES.filter((o) => o.y + o.h <= haut.y).map((o) => cibleDe(o).y + cibleDe(o).h));
  const apres = Math.min(...ORGANES.filter((o) => o.y >= bas.y + bas.h).map((o) => cibleDe(o).y));
  assert.equal(haut.y - avant, 8, "8 au-dessus du groupe");
  assert.equal(apres - (bas.y + bas.h), 8, "8 en dessous");
  /* ⚖️ ET LA MARGE DU TEXTE EST CELLE D'ERIC : 20, pas la marge de page. */
  assert.equal(desc.x, 20, "« une marge à gauche de 20 blg pour le texte » (17/09)");
  assert.equal(DALLE.l - (desc.x + desc.l), 20, "et la même à droite : filet et texte partagent une colonne");
});

/* ══ 6 — LA FEUILLE CONSTRUITE POSE TOUT, ET shell.css NE POSE RIEN ══════ */

test("6 — la feuille construite pose chaque organe, à la cote de la table", () => {
  const css = feuilleDesCotesX1();
  for (const o of ORGANES) {
    const id = CLEF_DE[o.nom];
    assert.ok(id, `${o.nom} n'a pas de clef de dépôt`);
    const m = new RegExp(`\\.x1 \\[data-organe="${id}"\\]\\{([^}]*)\\}`).exec(css);
    assert.ok(m, `${o.nom} n'est pas posé par la feuille`);
    const b = cibleDe(o);
    assert.ok(m[1].includes(`left:${b.x}px`) && m[1].includes(`top:${b.y}px`),
      `${o.nom} : la feuille ne pose pas la boîte de la table`);
    if (o.cible) {
      assert.ok(m[1].includes(`border-width:${(o.cible.h - o.h) / 2}px ${(o.cible.l - o.l) / 2}px`),
        `${o.nom} : les bords transparents portent l'écart cible − dessin`);
    }
  }
  /* ⛔ ET LE SÉLECTEUR EST DESCENDANT, jamais un enfant direct : une cote enfermée
     dans une structure meurt à la première fois qu'un organe entre dans un groupe. */
  assert.doesNotMatch(css, /\.x1 > \[data-organe/, "un `>` enfermerait la cote dans la structure du jour");
});

test("7 — shell.css ne porte AUCUNE position de la fiche : les cotes sont dans la table", () => {
  const debut = shell.indexOf(".x1 { background:");
  assert.ok(debut > 0, "le bloc d'habit de la fiche existe");
  const bloc = shell.slice(debut);
  assert.ok(!/\b(left|top)\s*:\s*\d*\.?\d+px/.test(bloc), "une position en dur serait une cote recopiée");
  /* la fiche partage la boîte de la dalle avec l'écran R — une seule règle le dit */
  assert.match(shell, /\.gear,\s*\.x1\s*\{/, "la dalle est déclarée UNE fois pour les deux écrans");
});

/* ══ 8 — LA LOI DU RANG X ════════════════════════════════════════════════ */

test("8 — ⛔ la fiche n'écrit JAMAIS la 3ᵉ ligne du belt (« les x ne s'inscrivent pas dans le belt »)", () => {
  const m = /const FENETRE_DE = \{([^}]*)\}/.exec(etape);
  assert.ok(m, "la table des mots du belt existe");
  assert.ok(!/\bx1\s*:/.test(m[1]), "`x1` ne doit PAS être une clef de FENETRE_DE — c'est là, et seulement là, que la loi se tient");
  /* ⚔️ ET LA MOITIÉ QUI PROUVE QUE LE GARDE N'EST PAS CREUX : la table existe
     vraiment et porte bien les branches, sinon l'absence de `x1` ne dirait rien. */
  assert.match(m[1], /gear:\s*"Gear"/, "la table porte bien les branches qui, elles, écrivent");
});

test("9 — ⛔ le mot `Back` reste celui de la coquille : la fiche dit `Close`", () => {
  /* La loi I.5 et le garde 17 de `shell-wiring` : un écran qui écrit « Back »
     ouvre un second chemin de retour. Le mot ratifié pour une fenêtre qui FERME
     est `Close` (Eric, 07/09). ⏳ Le croquis de X1 dit « back » : la question est
     posée à Eric dans le rapport du lot. */
  assert.doesNotMatch(source, /"Back"/, "`Back` appartient à la coquille, jamais à un écran");
  assert.match(source, /"Close"/, "et la porte qui ferme porte le mot qui dit ce qu'elle fait");
});

/* ══ 10 — CE QUE L'ÉCRAN REND ════════════════════════════════════════════ */

const objetTemoin = {
  index: 3, nom: "Winged Helmet", qte: 2,
  prixUnite: "15 gp", prixTotal: "30 gp", poidsUnite: "3 lb", poidsTotal: "6 lb",
  prose: "A winged helmet.", equipped: true, attuned: false, locked: false
};
const rendu = (options = {}) => construireLaFicheX1({
  objet: objetTemoin, rang: { position: 2, total: 5 }, nombre: 1, destination: "backpack", ...options
}).noeud;
const tous = (n, sel) => [...n.querySelectorAll(sel)];

test("9 bis — la quantité se cale à gauche du titre, et ne s'écrit que si elle dit quelque chose", () => {
  const deux = rendu();
  assert.equal(deux.querySelector('[data-organe="qte"]').textContent, "×2");
  const seul = construireLaFicheX1({ objet: { ...objetTemoin, qte: 1 }, rang: { position: 1, total: 1 } }).noeud;
  assert.equal(seul.querySelector('[data-organe="qte"]').textContent, "", "« ×1 » est du bruit");
});

test("9 ter — les deux filets encadrent le texte, et ils ne parlent pas aux lecteurs d'écran", () => {
  const n = rendu();
  for (const id of ["filet-haut", "filet-bas"]) {
    const f = n.querySelector(`[data-organe="${id}"]`);
    assert.ok(f, `${id} est posé`);
    assert.equal(f.getAttribute("aria-hidden"), "true", "c'est la ZONE qui porte le sens, pas son trait");
  }
});

test("10 — la fiche rend chaque organe de la table, une fois", () => {
  const n = rendu();
  const ids = tous(n, "[data-organe]").map((e) => e.dataset.organe).sort();
  const attendus = ORGANES.map((o) => CLEF_DE[o.nom]).sort();
  assert.deepEqual(ids, attendus);
});

test("11 — les trois interrupteurs disent leur état sur trois canaux, et écrivent la bonne clef", () => {
  const ecrits = [];
  const n = rendu({ objet: { ...objetTemoin, attuned: true }, surEtat: (clef, valeur) => ecrits.push([clef, valeur]) });
  const bascules = tous(n, ".x1-bascule");
  assert.equal(bascules.length, 3, "equip · attune · lock");
  for (const b of bascules) {
    assert.equal(b.getAttribute("role"), "switch", "un interrupteur est un état vrai ou faux, pas un bouton qu'on enfonce");
    assert.ok(b.getAttribute("aria-checked") === "true" || b.getAttribute("aria-checked") === "false");
    assert.equal(b.dataset.on, b.getAttribute("aria-checked"), "la donnée et le rôle disent la MÊME chose");
  }
  /* ⭐ L'ÉTAT ALLUMÉ SE LIT SUR LE BON ORGANE : `attuned` est vrai, `locked` non. */
  const etatDe = Object.fromEntries(bascules.map((b) => [b.dataset.organe, b.dataset.on]));
  assert.deepEqual(etatDe, { "equip-on": "true", "attune-on": "true", "lock-on": "false" });
  /* et taper INVERSE, en nommant la clef du document */
  for (const b of bascules) b.dispatchEvent({ type: "click" });
  assert.deepEqual(ecrits, [["equipped", false], ["attuned", false], ["locked", true]]);
});

test("12 — le mot d'état vit DANS le petit carré, et seulement quand il est vrai", () => {
  const n = rendu({ objet: { ...objetTemoin, equipped: true, attuned: false, locked: false } });
  const carres = tous(n, ".x1-etat");
  assert.equal(carres.length, 3);
  const mots = carres.map((c) => {
    const m = c.querySelector(".x1-etat-mot");
    return [c.dataset.organe, m.textContent, m.hidden === true];
  });
  assert.deepEqual(mots, [["equip", "Equipped", false], ["attune", "Attuned", true], ["lock", "Locked", true]],
    "le mot est TOUJOURS posé — c'est sa visibilité qui dit l'état, pour que le titre ne saute pas");
  /* ⛔ et il est dans le carré du titre, pas dans une bande sous la rangée */
  for (const c of carres) {
    assert.ok(c.querySelector(".x1-etat-titre"), "le titre est là");
    assert.ok(c.querySelector(".x1-etat-mot"), "et le mot est son voisin dans la MÊME boîte");
  }
});

test("13 — les quatre portes publient leur geste ; `Use` et le menu `is` sont désarmés et le disent", () => {
  const gestes = [];
  const n = rendu({ surPorte: (id) => gestes.push(id) });
  const portes = tous(n, ".x1-porte").map((b) => [b.dataset.porte, b.textContent, b.disabled === true]);
  assert.deepEqual(portes, [
    ["close", "Close", false], ["use", "Use", true], ["envoyer", "Send", false], ["trash", "Trash", false]
  ]);
  for (const b of tous(n, ".x1-porte")) { if (!b.disabled) b.dispatchEvent({ type: "click" }); }
  assert.deepEqual(gestes, ["close", "envoyer", "trash"]);
  /* 🔴 RÉÉCRIT LE 17/09 AU SOIR : `is` n'a plus de menu. Eric — *« le dropdown `is`
     pas visible, pas de dropdown, juste du texte ? »* — a vu qu'un menu désarmé
     portait le voile des 20 % et disparaissait. Un menu qu'on ne peut pas ouvrir est
     une valeur : elle s'écrit. ⛔ Le garde ne se relâche pas, il change d'objet. */
  assert.equal(n.querySelector('[data-organe="is-quoi"] select'), null, "plus aucun menu pour `is`");
  assert.equal(n.querySelector('[data-organe="is-quoi"]').className, "x1-is-quoi", "c'est un mot, pas un contrôle");
});

test("14 — la pagination dit le rang dans le lieu, et les flèches s'éteignent aux deux bouts", () => {
  const premier = rendu({ rang: { position: 1, total: 3 }, surPrecedent: () => {}, surSuivant: () => {} });
  assert.equal(premier.querySelector('[data-organe="pagination"]').textContent, "1/3");
  /* ⚖️ UNE SEULE PAGE NE SE PAGINE PAS — Eric, 17/09 : *« s'il y a plusieurs pages »*. */
  const seule = rendu({ rang: { position: 1, total: 1 } });
  assert.equal(seule.querySelector('[data-organe="pagination"]').textContent, "",
    "un « 1/1 » ne dit rien à personne");
  /* ⭐ ET LES FLÈCHES SUIVENT LA PAGINATION : sans seconde page, elles se retirent —
     `hidden`, donc leur place reste et rien ne se décale. */
  for (const id of ["precedent", "suivant"]) {
    assert.equal(seule.querySelector(`[data-organe="${id}"]`).hidden, true, `${id} se retire`);
    assert.equal(premier.querySelector(`[data-organe="${id}"]`).hidden, false, `${id} reste quand il y a des pages`);
  }
  assert.equal(premier.querySelector('[data-organe="precedent"]').disabled, true, "rien avant le premier");
  assert.equal(premier.querySelector('[data-organe="suivant"]').disabled, false);
  const dernier = rendu({ rang: { position: 3, total: 3 }, surPrecedent: () => {}, surSuivant: () => {} });
  assert.equal(dernier.querySelector('[data-organe="suivant"]').disabled, true, "rien après le dernier");
});

test("15 — prix et poids : la quantité se dit UNE fois, sur la ligne du prix", () => {
  const n = rendu();
  assert.equal(n.querySelector('[data-organe="prix"]').textContent, "15 gp · ×2 · 30 gp");
  assert.equal(n.querySelector('[data-organe="poids"]').textContent, "3 lb · 6 lb",
    "⛔ pas de `×2` ici : la boîte du plan est taillée sur ce mot-là (43,73 dans 44)");
  /* un objet seul ne dit ni quantité ni total — « ×1 » est du bruit */
  const seul = construireLaFicheX1({ objet: { ...objetTemoin, qte: 1 }, rang: { position: 1, total: 1 } }).noeud;
  assert.equal(seul.querySelector('[data-organe="prix"]').textContent, "15 gp");
  assert.equal(seul.querySelector('[data-organe="poids"]').textContent, "3 lb");
});

/* ══ 16 — LE GESTE QUI L'OUVRE ═══════════════════════════════════════════ */

test("16 — le clic droit sur un jeton porté ouvre la fiche, et il nomme la LIGNE, pas la boîte", () => {
  const ouverts = [];
  const { noeud } = construireLEcranGear({
    boites: { tete1: { nom: "Winged Helmet", qte: 1, index: 7, equipped: true } },
    surJeton: (index) => ouverts.push(index)
  });
  const jeton = noeud.querySelector('[data-organe="tete1"]');
  assert.ok(jeton, "l'emplacement occupé est rendu");
  jeton.dispatchEvent({ type: "contextmenu", preventDefault() {} });
  assert.deepEqual(ouverts, [7], "c'est l'INDEX `gear[N]` qui voyage — une boîte n'identifie rien");
});

test("17 — 🔴 les deux états que la fiche écrit passent par un verbe, et par UN SEUL", () => {
  /* `equipped` reste le revers de la position (`moveGearLine`) : lui ouvrir un
     second écrivain ferait diverger l'état et le lieu. */
  assert.match(coquille, /action\.kind === "setGearFlag"/, "le verbe existe dans la coquille");
  const bloc = coquille.slice(coquille.indexOf('action.kind === "setGearFlag"'));
  assert.match(bloc.slice(0, 400), /action\.flag !== "attuned" && action\.flag !== "locked"/,
    "et il n'accepte QUE les deux états que X1 possède");
  assert.doesNotMatch(bloc.slice(0, 400), /\.equipped/, "⛔ `equipped` n'entre pas par ce chemin");
  /* ⚔️ et l'écran l'appelle bien avec la clef, pas avec un booléen anonyme */
  assert.match(etape, /kind: "setGearFlag", index: ligne\.index, flag: clef, value: valeur/);
});

test("18 — 🔴 l'écran R lit enfin les deux voyants que X1 écrit (la dette du 16/09 est payée)", () => {
  /* Le lot 212 dessinait ♥ et 🔒 en les laissant éteints, faute d'écrivain. Ce
     garde tient les DEUX bouts : la boîte les porte, et le jeton les allume. */
  assert.match(etape, /attuned: ligne\.attuned === true/, "la boîte porte l'état harmonisé");
  assert.match(etape, /locked: ligne\.locked === true/, "et l'état verrouillé");
  const { noeud } = construireLEcranGear({
    boites: { tete1: { nom: "Winged Helmet", qte: 1, index: 7, equipped: true, attuned: true, locked: true } }
  });
  const etats = {};
  for (const v of tous(noeud.querySelector('[data-organe="tete1"]'), "[data-voyant]")) etats[v.dataset.voyant] = v.dataset.etat;
  assert.deepEqual(etats, { verrou: "oui", equipe: "oui", harmonise: "oui" },
    "les trois voyants s'allument maintenant — ils attendaient X1, pas un dessin");
});
