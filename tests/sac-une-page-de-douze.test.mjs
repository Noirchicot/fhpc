/* ══ LOT 356 — UNE SECTION DE BACKPACK = UNE PAGE DE 12 ; SEND DÉBORDE DANS UN NOUVEAU « BACKPACK DROPDOWN » ═══════
   ⚖️ Eric, 2026-09-29, chaque réponse avec sa question :
     · « Sans balayage de la dalle, comment atteindre la page 2 d'une section (plus de 12 objets) ? »
       → « Une section, dans backpack, n'a qu'une seule page. 16 max »
     · « 16 : la grille passe à 16 cases (4 × 4) ? » → « Tu as raison c'est 12 pardon »
     · « Une section pleine : que devient le 13ᵉ objet qu'on y envoie ? » → « Le seul moment où on ne place pas un
       token à la main, c'est par send ; normalement ça va dans backpack dropdown ; s'il est plein un 2e backpack
       dropdown se crée »
   Règle : `equipement-une-section-une-page-de-12` (NORMES).

   Les gardes :
     1 — un vieux personnage (ses pages 2+) s'ouvre ENTIER : le débord se MONTRE comme par Send — dans Backpack
         dropdown, puis dans un dropdown montré au bout de la roue — et ⛔ rien n'est écrit au document ;
     2 — Send range dans Backpack dropdown ; plein, « Backpack dropdown 2 » SE CRÉE (nom et genre écrits), puis un 3e ;
     3 — le moteur : le genre `backpack.sections[N].depot` passe les verbes (ni violation, ni avertissement, ni
         `underived` neuf), ressort en `unconsumed`, et `clear` ne laisse rien ;
     4 — une section pleine REFUSE : aucune case libre ; et le pilote, écran réel monté par l'étape, refuse Send vers un
         Party bag plein — le gendarme le dit, rien n'est écrit, et l'objet reste au collecteur ;
     5 — le départ de classe sur un dépôt plein : tout ce qui tombe au sac est rangé par Send, rien ne se perd ;
         5 bis — une page de kit tient dans ses douze cases (les kits des deux livres, mesurés) ;
     6 — l'écran : une plaque par section, douze cases chacune, le dropdown montré au bout de la roue ; un objet posé
         dedans le fait ÉCRIRE, aux mêmes cases ;
     7 — le câblage de la coquille : tout ce qui arrive au sac sans main passe par `rangerParSend`, et une section
         pleine refuse AVANT d'écrire.
   ⚔️ Tous éprouvés ROUGES par mutation de la source (source restaurée, empreinte identique). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", f), "utf8"));

const {
  currentGearLines, nextGearIndex, nextSectionIndex, sectionsDuSac, boiteDeSection, disposerLeSac, rangerParSend,
  materialiserLesDepots, placeLibreDans, sectionsDepot, cheminDuDepot, NOM_DU_DEPOT, SECTION_DEPOT, SECTION_PARTY,
  MOT_SECTION_PLEINE, butinDuDepart, appliquerLeButin, departRepondu, renderEquipmentStep
} = await import("../ui/builder/equipment-step.mjs");
/* ⛔ LA TAILLE D'UNE SECTION NE SE RETAPE PAS : elle se compte dans le plan du sac. */
const { CASES_DU_SAC } = await import("../ui/builder/sac-ecran.mjs");

const fixture = exempleFhEn();
const verbs = fixture.build.verbs;
const query = fixture.layers.verbs.query;
const rebuild = (document) => verbs.rebuild({ document });
const CORDE = { kind: "gear", id: "srd:gear:en:rope" };
const tous = (n, sel) => [...n.querySelectorAll(sel)];

/** Une ligne d'objet posée comme la coquille la pose (`gear[N]`, `.quantity`, `.equipped`), puis, si on les donne,
 *  son lieu, sa boîte et sa place — ⚠️ `place` hors de la grille, c'est une ancienne page 2. */
function poser(doc, { boite, place, location } = {}) {
  const i = nextGearIndex(doc);
  let d = verbs.choose({ document: doc, path: `gear[${i}]`, ref: CORDE }).document;
  d = verbs.set({ document: d, path: `gear[${i}].quantity`, value: 1 }).document;
  d = verbs.set({ document: d, path: `gear[${i}].equipped`, value: false }).document;
  if (location) d = verbs.set({ document: d, path: `gear[${i}].location`, value: location }).document;
  if (boite) d = verbs.set({ document: d, path: `gear[${i}].boite`, value: boite }).document;
  if (Number.isInteger(place)) d = verbs.set({ document: d, path: `gear[${i}].place`, value: place }).document;
  return { doc: d, index: i };
}
function poserN(doc, n, quoi) {
  let d = doc;
  const ids = [];
  for (let k = 0; k < n; k += 1) { const r = poser(d, quoi(k)); d = r.doc; ids.push(r.index); }
  return { doc: d, ids };
}
/** ⭐ Send vers le sac, comme la coquille le fait (`moveGearLine` → `rangerParSend`) : la ligne arrive, Send la range. */
function envoyerAuSac(doc) {
  const { doc: d, index } = poser(doc);
  const apres = rangerParSend({ document: d, verbs, index });
  return { doc: apres, ligne: currentGearLines(apres).find((l) => l.index === index) };
}
/** Les lignes du sac que la disposition MONTRE — ⛔ un objet perdu y manquerait. */
function montrees(d) {
  const vus = [];
  for (const g of d.grilles.values()) for (const l of g) if (l) vus.push(l.index);
  return vus;
}
const auSac = (doc) => currentGearLines(doc).filter((l) =>
  (l.location || "backpack") === "backpack" || (l.location === "storage" && !!l.boite));
const trie = (xs) => [...xs].sort((a, b) => a - b);
/* ⭐ Un personnage d'exemple (Ilyra : huit objets SANS place au dépôt, montrés en 0..7) au départ répondu — sinon
   Gear est X0 et le sac n'a pas de collecteur. */
function personnage() {
  let doc = fixture.document;
  if (!departRepondu(doc)) {
    const butin = butinDuDepart({ query, document: doc, reponses: { class: "A" } });
    doc = appliquerLeButin({ document: doc, verbs, query, butin });
  }
  return doc;
}
/* ⭐ LE VIEUX PERSONNAGE : Storage 1 porte quinze objets (places 0..14 — sa « page 2 »), et le dépôt est plein à la
   main (douze objets posés, places 0..11) — les huit d'Ilyra, sans place, ne tiennent donc plus au dépôt. */
function vieuxPersonnage() {
  const avecPage2 = poserN(fixture.document, 15, (k) => ({ boite: "s1", place: k }));
  const plein = poserN(avecPage2.doc, CASES_DU_SAC, (k) => ({ boite: boiteDeSection(SECTION_DEPOT), place: k }));
  return { doc: plein.doc, page2: avecPage2.ids, depot: plein.ids };
}

/* ══ 1 — LE VIEUX PERSONNAGE ═════════════════════════════════════════════════════════════ */
test("1 — ⚖️ UN VIEUX PERSONNAGE S'OUVRE ENTIER : le débord se MONTRE comme par Send — ⛔ rien n'est écrit", () => {
  const { doc, ids } = poserN(fixture.document, 15, (k) => ({ boite: "s1", place: k }));
  const avant = JSON.stringify(doc);
  const d = disposerLeSac(doc);
  assert.equal(JSON.stringify(doc), avant, "⛔ la disposition a écrit au document : aucune écriture sans le geste du joueur");
  assert.equal(d.grilles.get("s1").length, CASES_DU_SAC, "une section = douze cases, ⛔ jamais une page 2");
  assert.deepEqual(d.grilles.get("s1").map((l) => l && l.index), ids.slice(0, CASES_DU_SAC),
    "les douze premières gardent leur case");
  const depot = d.grilles.get(boiteDeSection(SECTION_DEPOT));
  assert.equal(depot.slice(0, 8).filter(Boolean).length, 8, "témoin : les huit objets d'Ilyra sont au dépôt, en 0..7");
  assert.deepEqual(depot.slice(8, 11).map((l) => l && l.index), ids.slice(CASES_DU_SAC),
    "⚖️ les trois de la « page 2 » DÉBORDENT COMME PAR SEND : dans Backpack dropdown, à ses premières cases libres");
  assert.equal(d.sections.filter((s) => s.virtuelle).length, 0, "il y avait de la place au dépôt : aucun dropdown montré");
  assert.deepEqual(trie(montrees(d)), trie(auSac(doc).map((l) => l.index)),
    "⛔ AUCUNE PERTE : chaque objet du sac est montré, une fois et une seule");

  /* ⭐ LE DÉPÔT PLEIN : le débord (les huit d'Ilyra + les trois de la page 2) ouvre UN dropdown MONTRÉ, au bout */
  const vieux = vieuxPersonnage();
  const avantVieux = JSON.stringify(vieux.doc);
  const d2 = disposerLeSac(vieux.doc);
  assert.equal(JSON.stringify(vieux.doc), avantVieux, "⛔ montrer un dropdown n'écrit rien au document");
  const v = d2.sections.filter((s) => s.virtuelle);
  assert.equal(v.length, 1, "onze objets débordent : un seul dropdown montré les porte");
  assert.equal(v[0].nom, `${NOM_DU_DEPOT} 2`, "⏳ il s'appelle « Backpack dropdown 2 » (le mot est à Eric)");
  assert.equal(v[0].index, nextSectionIndex(vieux.doc), "son index est celui que Send lui donnera en l'écrivant");
  assert.ok(v[0].depot === true && v[0].fige === true && v[0].renommable === false,
    "montré, il est un dropdown, et il ne se renomme ni ne s'efface (rien à effacer au document)");
  assert.equal(d2.sections.at(-1), v[0], "au bout de la roue, comme une section neuve");
  assert.equal(d2.grilles.get(boiteDeSection(v[0].index)).filter(Boolean).length, 11);
  assert.ok(!sectionsDuSac(vieux.doc).some((s) => s.index === v[0].index), "⛔ il n'est PAS au document");
  assert.deepEqual(trie(montrees(d2)), trie(auSac(vieux.doc).map((l) => l.index)), "⛔ aucune perte");
});

/* ══ 2 — SEND ═════════════════════════════════════════════════════════════════════════════ */
test("2 — ⚖️ SEND RANGE DANS BACKPACK DROPDOWN ; PLEIN, « BACKPACK DROPDOWN 2 » SE CRÉE — puis un 3e", () => {
  let doc = fixture.document;
  const quatre = [];
  for (let k = 0; k < 4; k += 1) { const r = envoyerAuSac(doc); doc = r.doc; quatre.push(r.ligne); }
  assert.deepEqual(quatre.map((l) => [l.boite, l.place]),
    [8, 9, 10, 11].map((p) => [boiteDeSection(SECTION_DEPOT), p]),
    "le dépôt se remplit APRÈS ce qu'on y voit déjà (les huit d'Ilyra, montrés en 0..7) — ⛔ jamais sous eux");
  const neuf = nextSectionIndex(doc);
  const r13 = envoyerAuSac(doc);
  doc = r13.doc;
  assert.deepEqual([r13.ligne.boite, r13.ligne.place, r13.ligne.location], [boiteDeSection(neuf), 0, "backpack"],
    "⚖️ le dépôt plein : l'objet va dans une section NEUVE, à sa première case, et il reste au sac (il pèse)");
  const s2 = sectionsDuSac(doc).find((s) => s.index === neuf);
  assert.ok(s2, "« un 2e backpack dropdown se crée » — au document");
  assert.equal(s2.nom, `${NOM_DU_DEPOT} 2`);
  assert.ok(s2.depot === true && s2.renommable === false, "c'est un dropdown, et il ne se renomme pas (⏳ 4a)");
  assert.ok(sectionsDepot(doc).has(neuf), "⛔ son GENRE est écrit — sans lui le prochain Send ne le trouverait pas");
  for (let k = 1; k < CASES_DU_SAC; k += 1) doc = envoyerAuSac(doc).doc;
  const r3 = envoyerAuSac(doc);
  doc = r3.doc;
  const s3 = sectionsDuSac(doc).find((s) => boiteDeSection(s.index) === r3.ligne.boite);
  assert.deepEqual([s3.nom, s3.index, r3.ligne.place], [`${NOM_DU_DEPOT} 3`, neuf + 1, 0],
    "le 2e plein, un 3e se crée : la chaîne ne s'arrête jamais");
  const cases = currentGearLines(doc).filter((l) => Number.isInteger(l.place)).map((l) => `${l.boite}:${l.place}`);
  assert.equal(new Set(cases).size, cases.length, "⛔ deux objets sur la même case");
  assert.deepEqual(trie(montrees(disposerLeSac(doc))), trie(auSac(doc).map((l) => l.index)), "⛔ aucune perte");
});

/* ══ 3 — LE MOTEUR ════════════════════════════════════════════════════════════════════════ */
test("3 — 📏 LE GENRE `backpack.sections[N].depot` EST MESURÉ CONTRE LE MOTEUR, et la mesure reste un test", () => {
  let doc = fixture.document;
  for (let k = 0; k < 5; k += 1) doc = envoyerAuSac(doc).doc;          /* 8 + 5 = 13 : le 2e naît */
  const n = [...sectionsDepot(doc)].find((i) => i !== SECTION_DEPOT);
  assert.ok(Number.isInteger(n), "témoin : un 2e dropdown est né");
  const r0 = rebuild(fixture.document);
  const r = rebuild(doc);
  assert.deepEqual(r.moduleViolations, r0.moduleViolations, "⛔ un genre de section fâche un module : ce n'est pas une règle de jeu");
  assert.equal(r.warnings.length, r0.warnings.length, "⛔ et il n'ajoute aucun avertissement");
  assert.equal(r.underived.length, r0.underived.length, "⛔ et il ne rend aucune dérivation impossible");
  assert.ok(r.unconsumed.includes(cheminDuDepot(n)),
    "il ressort en `unconsumed` : la fiche de personnage ne le lit pas, le sac si");
  const net = verbs.clear({ document: doc, path: cheminDuDepot(n), kind: "choice" }).document;
  assert.ok(!rebuild(net).unconsumed.some((p) => String(p).endsWith(".depot")),
    "⛔ `clear` doit ne rien laisser derrière");
});

/* ══ 4 — LA SECTION PLEINE ════════════════════════════════════════════════════════════════ */
test("4 — ⛔ UNE SECTION PLEINE REFUSE : aucune case libre ; Send vers un Party bag plein est refusé, et l'objet reste au collecteur", () => {
  const party = boiteDeSection(SECTION_PARTY.clef);
  const base = personnage();
  const plein = poserN(base, CASES_DU_SAC, (k) => ({ boite: party, location: "storage", place: k })).doc;
  assert.equal(placeLibreDans(plein, party), null, "⛔ un Party bag plein offre encore une case");
  assert.equal(placeLibreDans(plein, "s2"), 0, "témoin : Storage 2, vide, offre sa première case");

  /* ⭐ LE PILOTE, ÉCRAN RÉEL MONTÉ PAR L'ÉTAPE : un objet du dépôt glissé au collecteur, « Party bag » choisi, Send */
  const acts = [];
  const n = renderEquipmentStep({ document: plein, resolved: null, query, search: true,
    demiEcran: { cote: "gauche", page: "sac" } }, (a) => acts.push(a));
  const rangDuDepot = disposerLeSac(plein).sections.findIndex((s) => s.index === SECTION_DEPOT);
  const jeton = n.querySelector(`.sac-dalle[data-dalle="${rangDuDepot}"] .sac-case[data-occupe="oui"]`);
  const collecteur = n.querySelector('[data-creneau="collecteur"]');
  assert.ok(jeton && collecteur, "témoin : un objet du dépôt, et le collecteur vide");
  document.elementFromPoint = () => collecteur;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 31, button: 0, pointerType: "touch" });
  document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 40, pointerId: 31 });
  document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 40, pointerId: 31 });
  document.elementFromPoint = () => null;
  assert.equal(n.querySelector('[data-organe="collecteur"]').dataset.occupe, "oui", "témoin : le collecteur retient l'objet");
  const choisir = (valeur) => {
    const s = n.querySelector('[data-organe="send-vers"] select');
    s.value = valeur;
    s.dispatchEvent({ type: "change", target: s });
  };
  const send = () => { const b = n.querySelector('[data-porte="send"]'); b.dispatchEvent({ type: "click", target: b, detail: 1 }); };
  choisir(SECTION_PARTY.clef);
  acts.length = 0;
  send();
  assert.ok(acts.some((a) => a.kind === "popup" && a.texte === MOT_SECTION_PLEINE && a.titre === SECTION_PARTY.nom),
    "⛔ le gendarme ne dit pas que le Party bag est plein");
  assert.deepEqual(acts.filter((a) => a.kind !== "popup"), [], "⛔ un Send refusé a écrit quelque chose");
  /* ⭐ ET L'OBJET EST RESTÉ AU COLLECTEUR : le même Send, vers le sac, part bel et bien */
  choisir("backpack");
  acts.length = 0;
  send();
  assert.ok(acts.some((a) => a.kind === "moveGearLine" && a.location === "backpack"),
    "⛔ l'objet n'était plus au collecteur après le refus");
});

/* ══ 5 — LE DÉPART DE CLASSE ══════════════════════════════════════════════════════════════ */
test("5 — ⚖️ LE DÉPART DE CLASSE SUR UN DÉPÔT PLEIN : tout ce qui tombe au sac est rangé par Send, rien ne se perd", () => {
  /* ⭐ LE ROGUE, ET PAS LE FIGHTER : mesuré le 29/09, l'option A du Fighter équipe tout sur le corps (rien de neuf au
     dépôt), celle du Rogue met trois objets au sac hors de son kit — un garde sans objet à ranger ne prouverait rien. */
  const classe = verbs.choose({ document: fixture.document, path: "class",
    ref: { kind: "class", id: "srd:class:en:rogue" } }).document;
  const plein = poserN(classe, CASES_DU_SAC, (k) => ({ boite: boiteDeSection(SECTION_DEPOT), place: k })).doc;
  const butin = butinDuDepart({ query, document: plein, reponses: { class: "A" } });
  assert.ok(butin.complet, "témoin : l'option A du Rogue se pose sans autre question");
  const apres = appliquerLeButin({ document: plein, verbs, query, butin });
  const avant = new Set(currentGearLines(plein).map((l) => l.index));
  const neuves = currentGearLines(apres).filter((l) => !avant.has(l.index) && (l.location || "backpack") === "backpack");
  for (const l of neuves) {
    assert.ok(l.boite && Number.isInteger(l.place) && l.place >= 0 && l.place < CASES_DU_SAC,
      `${l.ref.id} : ⛔ tombé au sac sans boîte ni case — Send ne l'a pas rangé`);
  }
  const depots = new Set([...sectionsDepot(apres)].map(boiteDeSection));
  const parSend = neuves.filter((l) => depots.has(l.boite));
  assert.ok(parSend.length >= 1, "témoin : le départ du Rogue met au sac, hors de son kit, des objets que Send range");
  assert.ok(parSend.every((l) => l.boite !== boiteDeSection(SECTION_DEPOT)),
    "⛔ un objet rangé dans le dépôt PLEIN — il devait aller au 2e dropdown");
  assert.ok([...sectionsDepot(apres)].some((i) => i !== SECTION_DEPOT), "le dépôt plein a fait naître Backpack dropdown 2");
  const cases = currentGearLines(apres).filter((l) => Number.isInteger(l.place)).map((l) => `${l.boite}:${l.place}`);
  assert.equal(new Set(cases).size, cases.length, "⛔ deux objets sur la même case");
  assert.deepEqual(trie(montrees(disposerLeSac(apres))), trie(auSac(apres).map((l) => l.index)), "⛔ aucune perte");
});

test("5 bis — 📏 UNE PAGE DE KIT TIENT DANS SES DOUZE CASES : les kits des deux livres, mesurés", () => {
  const tailles = [];
  for (const livre of ["srd-5.2.1-en.layer.json", "srd-5.2.1-fr.layer.json"]) {
    const couche = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", livre), "utf8"));
    const parcourir = (o) => {
      if (Array.isArray(o)) { o.forEach(parcourir); return; }
      if (!o || typeof o !== "object") return;
      if (o.data && Array.isArray(o.data.contents) && o.data.contents.length) tailles.push([livre, o.name || o.id, o.data.contents.length]);
      Object.values(o).forEach(parcourir);
    };
    parcourir(couche);
  }
  assert.ok(tailles.length >= 14, `témoin : les sept kits de chaque livre sont lus (${tailles.length})`);
  const tropGros = tailles.filter(([, , n]) => n > CASES_DU_SAC);
  assert.deepEqual(tropGros, [], "⛔ un kit ne tient pas dans sa page — il déborderait comme par Send (`verserLeKit`)");
});

/* ══ 6 — L'ÉCRAN ══════════════════════════════════════════════════════════════════════════ */
test("6 — 🎒 L'ÉCRAN : une plaque par section, douze cases chacune, le dropdown montré au bout de la roue — et poser dedans l'ÉCRIT", () => {
  const vieux = vieuxPersonnage().doc;
  const vue = disposerLeSac(vieux);
  const n = renderEquipmentStep({ document: vieux, resolved: null, query, search: true,
    demiEcran: { cote: "gauche", page: "sac" } }, () => {});
  const dalles = tous(n, ".sac-dalle");
  assert.equal(dalles.length, vue.sections.length, "⛔ une section vaut une plaque — ni une page 2, ni un dropdown oublié");
  for (const d of dalles) assert.equal(d.querySelectorAll(".sac-case").length, CASES_DU_SAC, "douze cases par plaque");
  const crans = tous(n, "button.sac-cran");
  assert.equal(crans.at(-1).textContent, `${NOM_DU_DEPOT} 2`, "le dropdown montré est au bout de la roue");
  const plaque = dalles.at(-1).querySelectorAll('.sac-case[data-occupe="oui"]').length;
  assert.equal(plaque, 11, "et sa plaque montre les onze objets qui débordent");

  /* ⭐ POSÉ DEDANS À LA MAIN, IL S'ÉCRIT (`placerGearLine` → `materialiserLesDepots`) — aux mêmes cases */
  const v = vue.sections.at(-1);
  const ecrit = materialiserLesDepots({ document: vieux, verbs, index: v.index });
  const s = sectionsDuSac(ecrit).find((x) => x.index === v.index);
  assert.ok(s && s.nom === v.nom && sectionsDepot(ecrit).has(v.index), "⛔ le dropdown montré ne s'est pas écrit");
  const apres = disposerLeSac(ecrit);
  assert.equal(apres.sections.filter((x) => x.virtuelle).length, 0, "écrit, il n'est plus « montré »");
  assert.deepEqual(apres.grilles.get(boiteDeSection(v.index)).map((l) => l && l.index),
    vue.grilles.get(boiteDeSection(v.index)).map((l) => l && l.index),
    "⛔ l'écrire a déplacé ce qu'il montrait : mêmes objets, mêmes cases");
  assert.equal(materialiserLesDepots({ document: fixture.document, verbs, index: 99 }), fixture.document,
    "rien à écrire → le MÊME document");
});

/* ══ 7 — LE CÂBLAGE DE LA COQUILLE ═══════════════════════════════════════════════════════ */
test("7 — 🔒 LE CÂBLAGE : tout ce qui arrive au sac sans main passe par `rangerParSend`, et une section pleine refuse AVANT d'écrire", () => {
  /* ⭐ Même limite que le garde 2 de `kit-verse-dans-une-page` : la coquille n'exporte rien, son câblage se lit. Les
     gestes eux-mêmes sont éprouvés plus haut, sur les organes qu'elle appelle. */
  const shell = lire("shell.mjs");
  const bloc = (kind) => {
    const i = shell.indexOf(`action.kind === "${kind}"`);
    assert.ok(i > 0, `témoin : le verbe ${kind} est trouvé`);
    return shell.slice(i, shell.indexOf("action.kind === ", i + 20));
  };
  assert.match(bloc("moveGearLine"), /if \(action\.location === "backpack"\) document = rangerParSend\(\{ document, verbs, index: action\.index \}\)/,
    "⛔ `moveGearLine` vers le sac ne range plus par Send");
  assert.match(bloc("splitGearLine"), /rangerParSend\(\{ document, verbs, index: neuve \}\)/,
    "⛔ la part scindée envoyée au sac n'est plus rangée par Send");
  assert.match(bloc("addGearLine"), /action\.posePrevue !== true[\s\S]*?rangerParSend\(\{ document, verbs, index \}\)/,
    "⛔ l'achat au sac n'est plus rangé par Send (hors pose prévue)");
  const placer = bloc("placerGearLine");
  assert.match(placer, /materialiserLesDepots\(\{ document, verbs, index: /, "⛔ poser dans un dropdown montré ne l'écrit plus");
  /* 🔴 CE GARDE LISAIT SEULEMENT LE MOT DU REFUS AVANT L'ÉCRITURE — et la mutation `if (false)` (le refus éteint) le
     laissait VERT : le mot était toujours là. ⭐ Il lit maintenant la CONDITION (la place vue, `null` = pleine), le
     gendarme, et le retour — sans une écriture entre les deux. */
  const refus = /if \(range && place === null\) \{([\s\S]*?)return;\s*\}/.exec(placer);
  assert.ok(refus, "⛔ la section pleine ne refuse plus : la condition `range && place === null` a disparu");
  assert.match(refus[1], /texte: MOT_SECTION_PLEINE/, "⛔ le refus ne dit plus pourquoi (§0.5 : un refus muet se lit comme une panne)");
  assert.doesNotMatch(refus[1], /verbs\.(set|clear|choose)\(/, "⛔ le refus écrit quelque chose avant de rendre la main");
  assert.match(placer, /: placeLibreDans\(document, action\.boite, action\.index\)\);/,
    "⛔ la case libre ne se lit plus dans le sac tel qu'on le voit");
  const ecriture = placer.indexOf("gear[${action.index}].boite");
  assert.ok(refus.index > 0 && ecriture > refus.index, "⛔ la section pleine doit refuser AVANT d'écrire la moindre chose");
});
