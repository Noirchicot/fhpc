/* ══ LOT 292 — UN OBJET N'EST ÉQUIPÉ QUE SUR UNE CASE DU GEAR QUI LUI CONVIENT ════════════

   ⚖️ Eric, 2026-09-26, mot pour mot : « seul un item sur les cases valide du gear, peuvent
   porter le symbole équipé, dès qu'elles le quittent elle ne sont plus équipées. »

   🔴 LE DÉFAUT : `placerGearLine` écrivait `equipped = lieu === "self"` — TOUTE boîte du
   personnage équipait, « Extra storage » compris, quel que soit l'objet. La table qui dit
   où un objet se porte (`SLOT_VERS_BOITES`, ratifiée le 24/08) existait, et personne ne la
   consultait au moment d'écrire l'état.

   ⭐ CE QUE CES GARDES TIENNENT :
   · une seule fonction décide (`caseValide`), mesurée contre la pile entière ;
   · l'écrivain (`accorderLEquipe`) : un anneau équipé sur la main ne l'est plus en Extra
     storage, au sac, au sol ; une armure hors du torse ne l'est jamais ; une scission garde
     l'état de la part qui reste ;
   · le lecteur : une ligne ancienne `equipped: true` au sac ou en poche s'affiche NUE ;
   · la fiche X1 : `Equip` s'éteint hors de la case, et dit pourquoi.

   ⛔ `shell.mjs` N'EXPORTE RIEN (il se rend à l'import). Les gestes sont donc rejoués ici
   par des COPIES de sa séquence, qui appellent les VRAIES fonctions exportées
   (`lieuDeLaBoite`, `scinderLaLigne`, `accorderLEquipe`) et les vrais verbes du moteur. Le
   garde d'octets, en fin de fichier, tient le second bout : la coquille appelle bien
   `accorder` dans chacun de ses gestes, et n'écrit `equipped` à `true` nulle part. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const {
  renderEquipmentStep, currentGearLines, nextGearIndex, lieuDeLaBoite, boitesDehors,
  scinderLaLigne, caseValide, accorderLEquipe, slotsDeLaPile, lignesSurLeurCase, slotParNature
} = await import("../ui/builder/equipment-step.mjs");
const { makeHarness, PILE_SRD } = await import("./build-harness.mjs");
const { SLOT_VERS_BOITES, POCHES_DEBORD, BOITES, CASES_POLYVALENTES } = await import("../ui/builder/b3-disposition.mjs");
const { construireLaFicheX1 } = await import("../ui/builder/x1-ecran.mjs");

const fixture = exempleFhEn();
const verbs = fixture.build.verbs;
const query = fixture.layers.verbs.query;
/* ⭐ le départ est répondu : sans lui, X0 remplace Gear (lot 254) */
const BASE = verbs.set({ document: fixture.document, path: "depart.class", value: "A" }).document;

const ANNEAU = { kind: "item", id: "srd:item:en:ring-of-protection" };   // slot fingers
const COTTE = { kind: "armor", id: "srd:armor:en:chain-mail" };          // slot torso
const DAGUE = { kind: "weapon", id: "srd:weapon:en:dagger" };            // slot hands

/* ── les gestes de `shell.mjs`, rejoués — voir l'en-tête ── */
const accorder = (doc, index, voulu) => accorderLEquipe({ document: doc, verbs, query, index, voulu });
function ajouter(doc, { ref, quantity = 1, equipped = false, location }) {
  const index = nextGearIndex(doc);
  let d = verbs.choose({ document: doc, path: `gear[${index}]`, ref }).document;
  d = verbs.set({ document: d, path: `gear[${index}].quantity`, value: quantity }).document;
  d = verbs.set({ document: d, path: `gear[${index}].equipped`, value: false }).document;
  if (location) d = verbs.set({ document: d, path: `gear[${index}].location`, value: location }).document;
  return { doc: accorder(d, index, equipped === true), index };
}
function placer(doc, index, boite) {
  const lieu = lieuDeLaBoite(boite, boitesDehors(doc));
  let d = verbs.set({ document: doc, path: `gear[${index}].boite`, value: boite }).document;
  d = verbs.set({ document: d, path: `gear[${index}].location`, value: lieu }).document;
  return accorder(d, index, lieu === "self");
}
function deplacer(doc, index, location) {
  let d = verbs.set({ document: doc, path: `gear[${index}].location`, value: location }).document;
  d = verbs.clear({ document: d, path: `gear[${index}].boite`, kind: "choice" }).document;
  d = verbs.clear({ document: d, path: `gear[${index}].place`, kind: "choice" }).document;
  return accorder(d, index, location === "self");
}
function scinder(doc, index, part, location) {
  const source = currentGearLines(doc).find((l) => l.index === index);
  const d = scinderLaLigne({ document: doc, verbs, source, part, index: nextGearIndex(doc), location });
  return accorder(d);
}
const equipe = (doc, index) => currentGearLines(doc).find((l) => l.index === index).equipped;

/* ══ 1 — LA TABLE, MESURÉE CONTRE LA PILE ENTIÈRE ═══════════════════════════════════════ */
test("1 — ⚖️ UNE SEULE FONCTION DÉCIDE : `SLOT_VERS_BOITES` plus les six cases polyvalentes — ⛔ ni forge, ni sol, ni sac", () => {
  const slotDe = slotsDeLaPile(query);
  const slotsDeLaCouche = new Set(query({ kind: "shelving" })
    .map((v) => v.record && v.record.data && v.record.data.slot && v.record.data.slot.slot).filter(Boolean));
  assert.ok(slotsDeLaCouche.size >= 10, "témoin : la couche donne ses slots");
  const toutes = [...BOITES.map((b) => b.clef), "sol1", "sol2", "s0", "s3", "party"];
  for (const slot of slotsDeLaCouche) {
    const valides = toutes.filter((b) => caseValide(b, slot));
    /* ⚖️ LOT 297 — Eric, 26/09 : « les extra storage et pockets sont des slots versatiles.
       Ground est exclu ». Les cases d'un slot = la table ratifiée ∪ les six polyvalentes. */
    const attendues = toutes.filter((b) => SLOT_VERS_BOITES[slot].includes(b) || CASES_POLYVALENTES.includes(b));
    assert.deepEqual(valides, attendues,
      `${slot} : ses cases valides sont la table ratifiée plus les polyvalentes, et pas une de plus`);
    for (const p of POCHES_DEBORD) assert.equal(caseValide(p, slot), true, `⭐ ${p} (Extra storage) est polyvalente`);
    for (const g of ["sol1", "sol2"]) assert.equal(caseValide(g, slot), false, `⛔ ${g} : « Ground est exclu »`);
  }
  for (const b of ["forge1", "forge2"]) {
    assert.ok(Object.keys(SLOT_VERS_BOITES).every((s) => !caseValide(b, s)),
      `${b} (Body forging) : aucun slot n'y mène — le trou est au rapport, ⛔ pas comblé ici`);
  }
  assert.equal(caseValide("fourreau1", null), false, "⛔ un objet sans slot n'a pas Arm/hands");
  for (const b of CASES_POLYVALENTES) assert.equal(caseValide(b, null), true, `⭐ ${b} accepte même un objet sans slot`);
  assert.deepEqual([...CASES_POLYVALENTES].sort(), ["fourreau3", "fourreau4", "poche1", "poche2", "poche3", "poche4"],
    "⭐ Pocket/weapon 1-2 et Extra storage 1-4, rien d'autre");
  assert.equal(caseValide("sol1", null), false, "⛔ ni le sol");
  assert.equal(caseValide("fourreau1", "constructor"), false, "⛔ une clef de prototype n'est pas un slot");
  /* ⭐ les trois témoins de ce fichier ont bien le slot qu'on leur prête */
  assert.equal(slotDe(ANNEAU), "fingers");
  assert.equal(slotDe(COTTE), "torso");
  assert.equal(slotDe(DAGUE), "hands");
});

/* ══ 2 — L'ANNEAU : sur la main il l'est, partout ailleurs il ne l'est plus ════════════════ */
test("2 — 🔴 un anneau sur la main est équipé, en Extra storage aussi (polyvalente) ; au sac puis au sol il ne l'est plus", () => {
  let { doc, index } = ajouter(BASE, { ref: ANNEAU, equipped: true });
  assert.equal(equipe(doc, index), false, "⛔ `addGearLine` avec `equipped: true` au sac est ramené à false");

  doc = placer(doc, index, "fourreau1");
  assert.equal(equipe(doc, index), true, "posé sur Arm/hands 1 : sa case, il est équipé");
  const surLaMain = doc;

  doc = placer(doc, index, "poche1");
  assert.equal(equipe(doc, index), true, "⭐ Extra storage 1 : case polyvalente, il reste équipé (lot 297)");
  doc = deplacer(doc, index, "backpack");
  assert.equal(equipe(doc, index), false, "⛔ au sac");
  doc = placer(doc, index, "sol1");
  assert.equal(equipe(doc, index), false, "⛔ au sol");

  /* ⚔️ ET CHAQUE ÉTAPE SEULE, depuis la main — sinon les trois dernières ne prouveraient
     que la première. */
  assert.equal(equipe(placer(surLaMain, index, "poche2"), index), true, "⭐ main → Extra storage : polyvalente");
  assert.equal(equipe(deplacer(surLaMain, index, "backpack"), index), false, "main → sac");
  assert.equal(equipe(placer(surLaMain, index, "sol2"), index), false, "main → sol");
  assert.equal(equipe(placer(surLaMain, index, "s0"), index), false, "main → une section du sac");
  assert.equal(equipe(placer(surLaMain, index, "party"), index), false, "main → party bag");
  assert.equal(equipe(placer(surLaMain, index, "torse1"), index), false, "⛔ main → le torse : une case du corps, pas la sienne");
  assert.equal(equipe(placer(surLaMain, index, "fourreau4"), index), true, "main → Pocket/weapon 2 : la table la donne aux doigts");
});

/* ══ 3 — L'ARMURE HORS DE SA CASE ══════════════════════════════════════════════════════ */
test("3 — ⛔ une armure posée sur une case qui ne lui convient pas n'est pas équipée — et une autre qu'on déloge non plus", () => {
  let { doc, index } = ajouter(BASE, { ref: COTTE });
  for (const boite of ["tete1", "fourreau1", "ceinture", "pied2", "forge1", "sol1"]) {
    assert.equal(equipe(placer(doc, index, boite), index), false, `⛔ une cotte de mailles sur ${boite}`);
  }
  assert.equal(equipe(placer(doc, index, "torse2"), index), true, "sur Torso/back 2 : sa case");
  assert.equal(equipe(placer(doc, index, "poche3"), index), true, "⭐ sur Extra storage 2 : polyvalente (lot 297)");

  /* ⭐ PORTÉE SANS CASE CHOISIE, elle se range par son slot — et elle est équipée si la
     case est libre. */
  doc = deplacer(doc, index, "self");
  assert.equal(equipe(doc, index), true, "`self` sans boîte : l'écran la pose sur le torse");

  /* ⚔️ TROIS ARMURES POSÉES À LA MAIN sur les trois cases du torse DÉLOGENT la première
     vers une poche. Personne ne l'a touchée, et elle a quitté sa case : `accorder` relit
     TOUTES les lignes, pas seulement celle du geste. */
  for (const boite of ["torse1", "torse2", "torse3"]) {
    const a = ajouter(doc, { ref: COTTE });
    doc = placer(a.doc, a.index, boite);
  }
  const sur = lignesSurLeurCase(currentGearLines(doc), slotsDeLaPile(query));
  const surLeTorse = currentGearLines(doc).filter((l) => ["torse1", "torse2", "torse3"].includes(l.boite));
  assert.equal(surLeTorse.some((l) => l.index === index), false, "témoin : le torse est pris par les trois autres");
  assert.equal(sur.has(index), true, "⭐ l'Extra storage est polyvalente : elle y est sur une case valide");
  assert.equal(equipe(doc, index), true, "⭐ délogée en Extra storage, elle reste équipée (lot 297)");
  /* ⛔ mais au sol, jamais */
  assert.equal(equipe(placer(doc, index, "sol2"), index), false, "⛔ au sol : Ground est exclu");
});

/* ══ 4 — X1 : `Equip` S'ÉTEINT SANS CASE POSSIBLE, ET LA CHERCHE SINON ═══════════════════ */
/** Le pilote : l'étape rendue, ses actions rejouées par les copies de la coquille. */
function pilote(depart) {
  const etat = { doc: depart, actions: [] };
  const appliquer = (a) => {
    etat.actions.push(a);
    if (a.kind === "placerGearLine") etat.doc = placer(etat.doc, a.index, a.boite);
    if (a.kind === "moveGearLine") etat.doc = deplacer(etat.doc, a.index, a.location);
  };
  etat.rendre = () => renderEquipmentStep({ document: etat.doc, resolved: null, query }, appliquer);
  /* ouvre la fiche X1 d'une ligne, depuis Gear (portée) ou depuis le sac */
  etat.ouvrir = (index) => {
    let n = etat.rendre();
    const surR = [...n.querySelectorAll('.gear-emplacement[data-occupe="oui"]')];
    const ligne = currentGearLines(etat.doc).find((l) => l.index === index);
    const nom = new RegExp(`${ligne.ref.id.split(":").pop().replace(/-/g, " ").slice(0, 8)}`, "i");
    let jeton = ["self", "ground"].includes(ligne.location) ? surR.find((e) => nom.test(e.getAttribute("aria-label"))) : null;
    if (!jeton) {
      n.querySelector('[data-porte="backpack"]').click();
      n = etat.rendre();
      jeton = [...n.querySelectorAll('[data-ecran="SB3.1"] [data-occupe="oui"]')].find((e) => nom.test(e.getAttribute("aria-label")));
    }
    assert.ok(jeton, `témoin : le jeton de gear[${index}] est trouvé — ${[...n.querySelectorAll('[data-occupe="oui"]')].map((e) => e.getAttribute("aria-label")).join(" / ")}`);
    jeton.dispatchEvent({ type: "contextmenu", preventDefault() {} });
    n = etat.rendre();
    const bascule = n.querySelector('.x1 [data-organe="equip-on"]');
    assert.ok(bascule, "la fiche X1 est ouverte");
    return { n, bascule, fermer: () => {
      n.querySelector('.x1 [data-organe="close"]').dispatchEvent({ type: "click" });
      const g = etat.rendre().querySelector('[data-porte="gear"]');
      if (g) g.click();
    } };
  };
  return etat;
}

test("4 — ⚖️ `Equip` n'est grisé que SANS case possible ; hors de sa case il la cherche, sur sa case il ne bouge rien", () => {
  /* l'organe, seul */
  const ecrits = [];
  const { noeud } = construireLaFicheX1({ objet: { index: 1, nom: "Luckstone", qte: 1, equipped: false },
    horsCase: "No Gear slot fits this item — it cannot be equipped", surEtat: (c, v) => ecrits.push([c, v]) });
  const b = noeud.querySelector('[data-organe="equip-on"]');
  assert.equal(b.disabled, true, "sans case possible, l'interrupteur s'éteint");
  assert.match(b.title, /No Gear slot fits/, "⛔ et il dit pourquoi — un contrôle désarmé sans raison est une panne");
  b.dispatchEvent({ type: "click" });
  assert.deepEqual(ecrits, [], "il n'écrit rien");

  /* l'étape : une Luckstone (aucun slot) — ⚖️ LOT 297 : en Extra storage, polyvalente, elle
     s'équipe, et Equip vit */
  let { doc, index: pierre } = ajouter(BASE, { ref: { kind: "item", id: "srd:item:en:stone-of-good-luck-luckstone" } });
  doc = placer(doc, pierre, "poche2");
  assert.equal(equipe(doc, pierre), true, "⭐ la Luckstone en Extra storage est équipée (Eric : « slots versatiles »)");
  /* un anneau posé sur le TORSE (pas sa case), ancien `equipped: true` */
  const a = ajouter(doc, { ref: ANNEAU });
  const index = a.index;
  doc = placer(a.doc, index, "torse1");
  doc = verbs.set({ document: doc, path: `gear[${index}].equipped`, value: true }).document;   // un document ancien
  const p = pilote(doc);
  const case1 = p.rendre().querySelector('.gear-emplacement[data-organe="torse1"]');
  assert.ok(case1, "témoin : l'anneau est dessiné sur Torso/back 1");
  assert.equal(case1.querySelector('[data-marque="equipe"]').dataset.etat, "non",
    "⛔ l'état ancien ne se dessine pas : le lecteur lit la position");

  let x1 = p.ouvrir(pierre);
  assert.notEqual(x1.bascule.disabled, true, "⭐ la Luckstone a des cases (polyvalentes) : Equip vit");
  assert.equal(x1.bascule.dataset.on, "true", "et il dit « équipée »");
  x1.fermer();

  /* l'anneau hors de sa case : Equip s'allume et LA LUI CHERCHE, par l'arbitre */
  x1 = p.ouvrir(index);
  assert.equal(x1.bascule.dataset.on, "false", "l'interrupteur dit « pas équipé »");
  assert.notEqual(x1.bascule.disabled, true, "⭐ il a une case possible : l'interrupteur vit");
  p.actions.length = 0;
  x1.bascule.dispatchEvent({ type: "click" });
  assert.deepEqual(p.actions, [{ kind: "moveGearLine", index, location: "self" }], "le geste d'avant, par l'arbitre");
  assert.equal(equipe(p.doc, index), true, "⭐ arrivé sur une main libre, il est équipé");
  x1.fermer();

  /* sur sa case, non équipé (une part scindée arrivée là) : l'allumer REPOSE l'objet sur la
     case où il est — ⛔ il ne le déplace pas */
  p.doc = placer(p.doc, index, "fourreau3");
  p.doc = verbs.set({ document: p.doc, path: `gear[${index}].equipped`, value: false }).document;
  x1 = p.ouvrir(index);
  p.actions.length = 0;
  x1.bascule.dispatchEvent({ type: "click" });
  assert.deepEqual(p.actions, [{ kind: "placerGearLine", index, boite: "fourreau3" }],
    "⭐ Equip = placer sur la case où il est déjà — la case ne change pas");
  assert.equal(equipe(p.doc, index), true);
  x1.fermer();
});

/* ══ 5 — LES DOCUMENTS DÉJÀ SAUVEGARDÉS ═══════════════════════════════════════════════ */
test("5 — 🔴 une ligne ancienne `equipped: true` au sac n'affiche pas le symbole (et la fixture en porte quatre)", () => {
  /* ⭐ LE TÉMOIN EST DÉJÀ DANS LE DÉPÔT : le personnage d'exemple porte `equipped: true` sur
     quatre lignes SANS `location` — donc au sac. */
  const anciennes = currentGearLines(BASE).filter((l) => l.equipped === true && !l.location);
  assert.ok(anciennes.length >= 4, "témoin : la fixture porte des lignes anciennes équipées au sac");
  const rendre = () => renderEquipmentStep({ document: BASE, resolved: null, query }, () => {});
  let n = rendre();
  n.querySelector('[data-porte="backpack"]').click();
  n = rendre();
  const marques = [...n.querySelectorAll('[data-ecran="SB3.1"] [data-marque="equipe"]')];
  assert.ok(marques.length >= anciennes.length, "témoin : les jetons du sac sont dessinés");
  assert.deepEqual(marques.filter((m) => m.dataset.etat === "oui"), [],
    "⛔ aucun jeton du sac ne porte le symbole équipé");
  const [porte] = [...n.querySelectorAll('[data-porte="gear"]')];
  if (porte) porte.click();
});

/* ══ 6 — LA SCISSION D'UNE LIGNE ÉQUIPÉE (lot 288) ══════════════════════════════════════ */
test("6 — ⚖️ scinder une pile équipée : la part qui reste sur la case garde son état, la part partie ne l'a pas", () => {
  let { doc, index } = ajouter(BASE, { ref: DAGUE, quantity: 3 });
  doc = placer(doc, index, "fourreau1");
  assert.equal(equipe(doc, index), true, "témoin : la pile est équipée sur la main");

  const auSac = scinder(doc, index, 1, "backpack");
  const neuveSac = Math.max(...currentGearLines(auSac).map((l) => l.index));
  assert.equal(equipe(auSac, index), true, "la part qui reste sur la case garde son état");
  assert.equal(equipe(auSac, neuveSac), false, "⛔ la part partie au sac ne l'a pas");

  /* ⚔️ ET MÊME PORTÉE SUR UNE CASE QUI LUI CONVIENT, la part détachée naît nue — Eric, 17/09 :
     « la part détachée perd tous ces : attunned locked equiped ». */
  const portee = scinder(doc, index, 1, "self");
  const neuve = Math.max(...currentGearLines(portee).map((l) => l.index));
  const sur = lignesSurLeurCase(currentGearLines(portee), slotsDeLaPile(query));
  assert.equal(sur.has(neuve), true, "témoin : la part portée est sur une case de main");
  assert.equal(equipe(portee, neuve), false, "⛔ elle n'est pas équipée pour autant");
  assert.equal(equipe(portee, index), true, "et la pile d'origine l'est toujours");
});

/* ══ 7 — LA COQUILLE : chaque geste passe par `accorder`, et personne n'écrit `true` ═════ */
test("7 — 🔒 TOUS LES ÉCRIVAINS PASSENT PAR `accorderLEquipe` — la coquille n'écrit `equipped` qu'à `false` de naissance", () => {
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  const bloc = (kind) => {
    const i = shell.indexOf(`action.kind === "${kind}"`);
    assert.ok(i > 0, `${kind} existe dans la coquille`);
    const j = shell.indexOf("action.kind === ", i + 20);
    return shell.slice(i, j > 0 ? j : undefined);
  };
  for (const kind of ["addGearLine", "placerGearLine", "moveGearLine", "splitGearLine", "removeGearLine", "poserLeDepart"]) {
    assert.match(bloc(kind), /accorder\(/, `⛔ ${kind} doit finir par accorder l'état à la case`);
  }
  assert.match(shell, /const accorder = \(document, index, voulu\) => accorderLEquipe\(/, "et `accorder` est `accorderLEquipe`");
  /* ⚔️ AUCUN FICHIER DE L'INTERFACE n'écrit `.equipped` à autre chose que `false`, sauf
     `accorderLEquipe` — qui écrit ce que le geste DEMANDE, puis le défait hors de la case. */
  for (const f of fs.readdirSync(UI).filter((x) => x.endsWith(".mjs"))) {
    const src = stripComments(fs.readFileSync(path.join(UI, f), "utf8"));
    const ecritures = [...src.matchAll(/path: `gear\[\$\{[^}]+\}\]\.equipped`, value: ([^}]+?) \}/g)].map((m) => m[1].trim());
    const libres = ecritures.filter((v) => v !== "false");
    /* ⚔️ un motif qui ne trouve rien serait vert à jamais : il doit voir les naissances */
    if (f === "shell.mjs") assert.ok(ecritures.length >= 2, `témoin : le motif voit les écritures de la coquille (${ecritures.length})`);
    if (f === "equipment-step.mjs") {
      assert.deepEqual(libres, ["voulu"], "⭐ le seul écrivain libre est `accorderLEquipe`, et il écrit la demande du geste");
    } else {
      assert.deepEqual(libres, [], `⛔ ${f} écrit \`equipped\` à ${libres.join(", ")} — seul \`accorderLEquipe\` le peut`);
    }
  }
});

/* ══ 8 — CE QUE L'OBJET EST DIT OÙ IL SE PORTE (seconde passe, l'architecte 26/09) ═════════ */
test("8 — ⚖️ armes, armures, boucliers, bâtons, baguettes et sceptres ont une case, LUE DANS LA DONNÉE du record", () => {
  const slotFH = slotsDeLaPile(query);
  const srd = makeHarness({ layers: PILE_SRD });
  const slotSRD = slotsDeLaPile(srd.layers.verbs.query);
  /* ⭐ LA DAGUE, DANS LES DEUX PILES — la couche `srfh-mecaniques` la PATCHE (son étagère), elle
     ne lui retire ni sa base ni son slot */
  assert.equal(slotFH(DAGUE), "hands", "Dagger, pile Fate's Hand");
  assert.equal(slotSRD(DAGUE), "hands", "Dagger, pile SRD");

  /* ⭐ LA NATURE, MESURÉE SUR TOUTE LA PILE : chaque objet magique de ces catégories a une case */
  const attendu = { weapon: "hands", staff: "hands", wand: "hands", rod: "hands" };
  let vus = 0;
  for (const v of query({ kind: "item" })) {
    const d = v.record.data || {};
    const slot = slotFH({ kind: "item", id: v.id });
    if (d.category in attendu) { assert.equal(slot, attendu[d.category], `${v.id} (${d.category})`); vus += 1; }
    if (d.category === "armor") { assert.equal(slot, d.subtype === "Shield" ? "hands" : "torso", `${v.id} (armor)`); vus += 1; }
  }
  assert.ok(vus >= 80, `témoin : ${vus} objets magiques armés ou armurés lus`);
  for (const v of query({ kind: "weapon" })) assert.equal(slotFH({ kind: "weapon", id: v.id }), "hands", v.id);
  for (const v of query({ kind: "armor" })) assert.ok(["hands", "torso"].includes(slotFH({ kind: "armor", id: v.id })), v.id);
  /* ⛔ ET LE RESTE RESTE SANS CASE — il va à Eric */
  for (const id of ["stone-of-good-luck-luckstone", "scarab-of-protection", "pearl-of-power", "horseshoes-of-speed", "potions-of-healing"]) {
    assert.equal(slotFH({ kind: "item", id: `srd:item:en:${id}` }), null, `⛔ ${id} : pas de case inventée`);
  }
  assert.equal(slotParNature("gear", { data: { category: "weapon" } }), null, "⛔ un `gear` n'est pas une arme parce qu'un champ le dit");

  /* ⭐ ET À L'USAGE : ils s'équipent sur leur case, pas ailleurs */
  const sur = (ref, boite, extra = {}) => {
    let { doc, index } = ajouter(BASE, { ref });
    for (const [champ, valeur] of Object.entries(extra)) {
      doc = champ === "plan" ? verbs.choose({ document: doc, path: `gear[${index}].plan`, ref: valeur }).document
        : verbs.set({ document: doc, path: `gear[${index}].${champ}`, value: valeur }).document;
    }
    return equipe(placer(doc, index, boite), index);
  };
  assert.equal(sur(DAGUE, "fourreau2"), true, "une Dagger en Arm/hand");
  assert.equal(sur({ kind: "weapon", id: "srd:weapon:en:longsword" }, "fourreau1",
    { bonus: "+1", plan: { kind: "item", id: "srd:item:en:weapon-1-2-or-3" } }), true, "un Weapon +1 crafté sur Longsword, en Arm/hand");
  assert.equal(sur({ kind: "armor", id: "srd:armor:en:plate-armor" }, "torse1", { bonus: "+1" }), true, "une Plate +1 en Torso");
  assert.equal(sur({ kind: "item", id: "srd:item:en:flame-tongue" }, "fourreau1"), true, "une Flame Tongue en Arm/hand");
  assert.equal(sur({ kind: "item", id: "srd:item:en:adamantine-armor" }, "torse2"), true, "une Adamantine Armor en Torso");
  assert.equal(sur({ kind: "item", id: "srd:item:en:adamantine-armor" }, "fourreau1"), false, "⛔ …mais pas en Arm/hand");
  assert.equal(sur({ kind: "item", id: "srd:item:en:animated-shield" }, "fourreau2"), true, "un Animated Shield en Arm/hand");
  assert.equal(sur({ kind: "item", id: "srd:item:en:staff-of-fire" }, "fourreau1"), true, "un Staff of Fire en Arm/hand");
  assert.equal(sur({ kind: "item", id: "srd:item:en:stone-of-good-luck-luckstone" }, "fourreau1"), false, "⛔ une Luckstone nulle part");

  /* ⛔ AUCUNE LISTE DE NOMS dans la fonction qui lit la nature */
  const src = stripComments(fs.readFileSync(path.join(UI, "equipment-step.mjs"), "utf8"));
  const corps = src.slice(src.indexOf("export function slotParNature"), src.indexOf("function lecteurDeSlot"));
  assert.doesNotMatch(corps, /\.name|Flame|Adamantine|Mithral|Vorpal|srd:/, "⛔ la nature se lit dans les champs, pas dans les noms");
});

/* ══ 9 — EQUIP DEPUIS LE SAC : L'ARBITRE D'ERIC, PUIS LA CASE D'ARRIVÉE ══════════════════ */
test("9 — ⚖️ Equip ON depuis le sac : une main libre, sinon Pocket/weapon, sinon Extra storage (équipé, lot 297), sinon le sac", () => {
  const equiperDepuisLeSac = (depart) => {
    const { doc, index } = ajouter(depart, { ref: ANNEAU });
    const p = pilote(doc);
    const x1 = p.ouvrir(index);
    assert.notEqual(x1.bascule.disabled, true, "⭐ un anneau a des cases : Equip vit, même au sac");
    p.actions.length = 0;
    x1.bascule.dispatchEvent({ type: "click" });
    const actions = p.actions.filter((a) => /GearLine$/.test(a.kind));
    x1.fermer();
    const ligne = currentGearLines(p.doc).find((l) => l.index === index);
    return { actions, index, ligne, sur: lignesSurLeurCase(currentGearLines(p.doc), slotsDeLaPile(query)).has(index) };
  };
  const occuper = (doc, ref, boites) => {
    let d = doc;
    for (const b of boites) { const a = ajouter(d, { ref }); d = placer(a.doc, a.index, b); }
    return d;
  };
  const PIERRE = { kind: "item", id: "srd:item:en:stone-of-good-luck-luckstone" };

  /* ① les mains libres : il prend sa case, et il est équipé */
  let r = equiperDepuisLeSac(BASE);
  assert.deepEqual(r.actions, [{ kind: "moveGearLine", index: r.index, location: "self" }]);
  assert.equal(r.ligne.location, "self");
  assert.equal(r.ligne.equipped, true, "⭐ sur une main libre, équipé");

  /* ② les deux mains prises : Pocket/weapon, que la table donne aux doigts — équipé */
  r = equiperDepuisLeSac(occuper(BASE, DAGUE, ["fourreau1", "fourreau2"]));
  assert.equal(r.sur, true, "témoin : il est sur une Pocket/weapon");
  assert.equal(r.ligne.equipped, true, "⭐ Pocket/weapon est valide pour un anneau : équipé");

  /* ③ les quatre prises : l'arbitre le met en Extra storage — ⚖️ LOT 297 : polyvalente, équipé */
  r = equiperDepuisLeSac(occuper(BASE, DAGUE, ["fourreau1", "fourreau2", "fourreau3", "fourreau4"]));
  assert.equal(r.ligne.location, "self", "l'arbitre l'a gardé sur le corps, en débord");
  assert.equal(r.sur, true);
  assert.equal(r.ligne.equipped, true, "⭐ Extra storage est polyvalente : équipé");

  /* ④ tout est pris : l'arbitre le laisse au sac, non équipé */
  r = equiperDepuisLeSac(occuper(occuper(BASE, DAGUE, ["fourreau1", "fourreau2", "fourreau3", "fourreau4"]),
    PIERRE, ["poche1", "poche2", "poche3", "poche4"]));
  assert.deepEqual(r.actions, [{ kind: "moveGearLine", index: r.index, location: "backpack", equipped: false }], "« sinon backpack » — le mot de l'arbitre");
  assert.equal(r.ligne.equipped, false, "⛔ au sac, pas équipé");
});

/* ══ 10 — LES MUNITIONS MAGIQUES — lot 298 ═══════════════════════════════════════════════
   ⚖️ Eric, 2026-09-26, mot pour mot : « Munitions magiques hand weapon pocket extra » — en
   réponse à : « elles se portent en main (catégorie `weapon` du record) — ça te va ? ».
   ⭐ Arm/hands 1-2, Pocket/weapon 1-2 (le slot `hands`) et Extra storage 1-4 (polyvalentes) ;
   ⛔ nulle part ailleurs, et jamais au sol. */
test("10 — ⚖️ les munitions magiques s'équipent en main, en Pocket/weapon et en Extra storage — nulle part ailleurs", () => {
  const slotDe = slotsDeLaPile(query);
  const attendues = ["fourreau1", "fourreau2", "fourreau3", "fourreau4", "poche1", "poche2", "poche3", "poche4"];
  const toutes = [...BOITES.map((b) => b.clef), "sol1", "sol2", "s0", "party"];
  for (const id of ["srd:item:en:ammunition-1-2-or-3", "srd:item:en:ammunition-of-slaying"]) {
    const slot = slotDe({ kind: "item", id });
    assert.equal(slot, "hands", `${id} : le slot se lit dans la catégorie du record`);
    assert.deepEqual(toutes.filter((b) => caseValide(b, slot)).sort(), [...attendues].sort(),
      `${id} : hand · weapon · pocket · extra, et rien d'autre`);
  }
});
