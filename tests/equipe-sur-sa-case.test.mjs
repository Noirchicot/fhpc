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
  scinderLaLigne, caseValide, accorderLEquipe, slotsDeLaPile, lignesSurLeurCase
} = await import("../ui/builder/equipment-step.mjs");
const { SLOT_VERS_BOITES, POCHES_DEBORD, BOITES } = await import("../ui/builder/b3-disposition.mjs");
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
test("1 — ⚖️ UNE SEULE FONCTION DÉCIDE, et elle dit exactement `SLOT_VERS_BOITES` — ⛔ ni poche, ni forge, ni sol, ni sac", () => {
  const slotDe = slotsDeLaPile(query);
  const slotsDeLaCouche = new Set(query({ kind: "shelving" })
    .map((v) => v.record && v.record.data && v.record.data.slot && v.record.data.slot.slot).filter(Boolean));
  assert.ok(slotsDeLaCouche.size >= 10, "témoin : la couche donne ses slots");
  const toutes = [...BOITES.map((b) => b.clef), "sol1", "sol2", "s0", "s3", "party"];
  for (const slot of slotsDeLaCouche) {
    const valides = toutes.filter((b) => caseValide(b, slot));
    assert.deepEqual(valides, SLOT_VERS_BOITES[slot],
      `${slot} : ses cases valides sont celles de la table ratifiée, et pas une de plus`);
    for (const p of POCHES_DEBORD) assert.equal(caseValide(p, slot), false, `⛔ ${p} (Extra storage) est un débord, pas une case`);
  }
  for (const b of ["forge1", "forge2"]) {
    assert.ok(Object.keys(SLOT_VERS_BOITES).every((s) => !caseValide(b, s)),
      `${b} (Body forging) : aucun slot n'y mène — le trou est au rapport, ⛔ pas comblé ici`);
  }
  assert.equal(caseValide("fourreau1", null), false, "⛔ un objet sans slot n'a aucune case");
  assert.equal(caseValide("fourreau1", "constructor"), false, "⛔ une clef de prototype n'est pas un slot");
  /* ⭐ les trois témoins de ce fichier ont bien le slot qu'on leur prête */
  assert.equal(slotDe(ANNEAU), "fingers");
  assert.equal(slotDe(COTTE), "torso");
  assert.equal(slotDe(DAGUE), "hands");
});

/* ══ 2 — L'ANNEAU : sur la main il l'est, partout ailleurs il ne l'est plus ════════════════ */
test("2 — 🔴 un anneau sur la main est équipé ; en Extra storage, puis au sac, puis au sol, il ne l'est plus À CHAQUE ÉTAPE", () => {
  let { doc, index } = ajouter(BASE, { ref: ANNEAU, equipped: true });
  assert.equal(equipe(doc, index), false, "⛔ `addGearLine` avec `equipped: true` au sac est ramené à false");

  doc = placer(doc, index, "fourreau1");
  assert.equal(equipe(doc, index), true, "posé sur Arm/hands 1 : sa case, il est équipé");
  const surLaMain = doc;

  doc = placer(doc, index, "poche1");
  assert.equal(equipe(doc, index), false, "⛔ Extra storage 1 : il a quitté sa case");
  doc = deplacer(doc, index, "backpack");
  assert.equal(equipe(doc, index), false, "⛔ au sac");
  doc = placer(doc, index, "sol1");
  assert.equal(equipe(doc, index), false, "⛔ au sol");

  /* ⚔️ ET CHAQUE ÉTAPE SEULE, depuis la main — sinon les trois dernières ne prouveraient
     que la première. */
  assert.equal(equipe(placer(surLaMain, index, "poche2"), index), false, "main → Extra storage");
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
  for (const boite of ["tete1", "fourreau1", "ceinture", "pied2", "poche3", "forge1"]) {
    assert.equal(equipe(placer(doc, index, boite), index), false, `⛔ une cotte de mailles sur ${boite}`);
  }
  assert.equal(equipe(placer(doc, index, "torse2"), index), true, "sur Torso/back 2 : sa case");

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
  assert.equal(sur.has(index), false, "témoin : la première est bien délogée");
  assert.equal(equipe(doc, index), false, "⛔ délogée en poche, elle n'est plus équipée");
});

/* ══ 4 — X1 : `Equip` S'ÉTEINT HORS DE LA CASE, ET LE DIT ══════════════════════════════ */
test("4 — ⚖️ `Equip` est grisé et parlant hors d'une case valide ; sur la case, il repose l'objet LÀ OÙ IL EST", () => {
  /* l'organe, seul */
  const ecrits = [];
  const { noeud } = construireLaFicheX1({ objet: { index: 1, nom: "Ring", qte: 1, equipped: false },
    horsCase: "Not on a Gear slot that fits it — place it there first", surEtat: (c, v) => ecrits.push([c, v]) });
  const b = noeud.querySelector('[data-organe="equip-on"]');
  assert.equal(b.disabled, true, "hors de sa case, l'interrupteur s'éteint");
  assert.match(b.title, /Gear slot/, "⛔ et il dit pourquoi — un contrôle désarmé sans raison est une panne");
  b.dispatchEvent({ type: "click" });
  assert.deepEqual(ecrits, [], "il n'écrit rien");

  /* l'étape : un anneau en Extra storage, ancien `equipped: true` — ouvert depuis Gear */
  let { doc, index } = ajouter(BASE, { ref: ANNEAU });
  doc = placer(doc, index, "poche1");
  doc = verbs.set({ document: doc, path: `gear[${index}].equipped`, value: true }).document;   // un document ancien
  const actions = [];
  const rendre = () => renderEquipmentStep({ document: doc, resolved: null, query }, (a) => actions.push(a));
  let n = rendre();
  const case1 = n.querySelector('.gear-emplacement[data-organe="poche1"]');
  assert.ok(case1, "témoin : l'anneau est dessiné en Extra storage 1");
  assert.equal(case1.querySelector('[data-marque="equipe"]').dataset.etat, "non",
    "⛔ l'état ancien ne se dessine pas : le lecteur lit la position");
  case1.dispatchEvent({ type: "contextmenu", preventDefault() {} });
  n = rendre();
  const bascule = n.querySelector('.x1 [data-organe="equip-on"]');
  assert.ok(bascule, "la fiche X1 est ouverte");
  assert.equal(bascule.dataset.on, "false", "l'interrupteur dit « pas équipé »");
  assert.equal(bascule.disabled, true, "⛔ et il est éteint");
  assert.match(bascule.title, /Not on a Gear slot that fits it/);
  /* on ferme la fiche pour le témoin suivant */
  n.querySelector('.x1 [data-organe="close"]').dispatchEvent({ type: "click" });

  /* sur sa case, non équipé (une part scindée arrivée là) : l'interrupteur s'allume, et
     l'allumer REPOSE l'objet sur la case où il est — ⛔ il ne le déplace pas */
  doc = placer(doc, index, "fourreau3");
  doc = verbs.set({ document: doc, path: `gear[${index}].equipped`, value: false }).document;
  n = rendre();
  n.querySelector('.gear-emplacement[data-organe="fourreau3"]').dispatchEvent({ type: "contextmenu", preventDefault() {} });
  n = rendre();
  const allume = n.querySelector('.x1 [data-organe="equip-on"]');
  assert.notEqual(allume.disabled, true, "sur sa case, on peut l'équiper");
  actions.length = 0;
  allume.dispatchEvent({ type: "click" });
  assert.deepEqual(actions, [{ kind: "placerGearLine", index, boite: "fourreau3" }],
    "⭐ Equip = placer sur la case où il est déjà — la case ne change pas");
  n.querySelector('.x1 [data-organe="close"]').dispatchEvent({ type: "click" });
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
