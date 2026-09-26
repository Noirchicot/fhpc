/* ══ X5 — LE PARCHEMIN DE SORT — lot 285 ════════════════════════════════════════

   ⚖️ LA DICTÉE D'ERIC, 2026-09-26 : *« choisir : classe de sort · choisir lvl · 4 étages
   de sorts token, un dropdown · send »* ; puis *« toujours mettre rareté prix qté »* et
   *« n'extrapole pas le prix du parchemin par rapport à la rareté, garde les prix SRD »*.

   ── CE QUE CES GARDES TIENNENT ──────────────────────────────────────────────
     ① LE PRIX — la table du SRD (« Scribing Spell Scrolls », p. 103), ⛔ jamais le palier ;
     ② LA RARETÉ — lue dans la table du record `Spell Scroll`, ⛔ jamais écrite ;
     ③ LES CLASSES ET LES NIVEAUX — lus dans les sorts, ⛔ aucune liste ;
     ④ LA FICHE — la dictée, organe par organe, et le plan coté qui la porte ;
     ⑤ SEND — le coût de scribing se paie, la ligne porte la référence du sort ;
     ⑥ LE MOTEUR ET L'ÉCRAN — `gear[N].spell` est écrit, relu, nommé, coté, récité.
   ⛔ PAS DE PRÉREQUIS (sort préparé, maîtrise d'Arcana) : le mandat du lot dit de ne pas les
   vérifier — aucun garde ne les réclame. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";
import { makeHarness, manifestOf, readJson, PILE_SRD } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
/* ⛔ un mot compté compte aussi la phrase qui le nie : les commentaires sortent avant la mesure */
const lire = (f) => fs.readFileSync(path.join(ROOT, f), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

const D = await import("../ui/builder/x5-disposition.mjs");
const { construireX5, feuilleDesCotesX5, organesDeLaFamille } = await import("../ui/builder/x5-ecran.mjs");
const { feuilleDuParchemin, PAR_PAGE } = await import("../ui/builder/x5-parchemin.mjs");
const P = await import("../ui/builder/craft-parchemin.mjs");
const { SCRIBING_SRD, noteDeCraft, texteDeLaNote } = await import("../ui/builder/bareme-srfh.mjs");
const { enPieces, ouvertureX5, seCrafteDansX5 } = await import("../ui/builder/craft.mjs");
const { raretesDuParchemin, estPlanParchemin, estCrafte, nomDUnParchemin } = await import("../src/build/objet-crafte.mjs");
const { currentGearLines, recordProse } = await import("../ui/builder/equipment-step.mjs");
const W = await import("../ui/builder/wares-disposition.mjs");

const query = exempleFhEn().layers.verbs.query;
const items = query({ kind: "item" }).map((v) => v.record);
const PLAN = items.find((r) => r.data.name === "Spell Scroll");
const SORTS = query({ kind: "spell" }).map((v) => v.record);
const sortNomme = (n) => SORTS.find((s) => s.data.name === n);

function monte(o) {
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try { return construireX5({ plan: PLAN, sorts: SORTS, ...o }); }
  finally { if (avant === undefined) delete globalThis.document; else globalThis.document = avant; }
}
const organe = (n, nom) => n.querySelector(`[data-organe="${nom}"]`);
const options = (sel) => [...sel.querySelectorAll("option")];

/* ══ ① LE PRIX ═══════════════════════════════════════════════════════════════ */

test("parchemin 1 — ⚖️ LE PRIX EST CELUI DU SRD, niveau par niveau : temps, coût, valeur = 2 × coût", () => {
  /* 📏 SRD 5.2.1, « Scribing Spell Scrolls » (p. 103), relu dans le PDF — recopié ICI à la main,
     exprès : un garde qui lirait `SCRIBING_SRD` pour vérifier `SCRIBING_SRD` ne pourrait jamais
     accuser (une bijection fausse est cohérente). [niveau, jours, coût] */
  const PDF = [[0, 1, 15], [1, 1, 25], [2, 3, 100], [3, 5, 150], [4, 10, 1000], [5, 25, 1500],
    [6, 40, 10000], [7, 50, 12500], [8, 60, 15000], [9, 120, 50000]];
  assert.deepEqual(SCRIBING_SRD.map((l) => [l.niveau, l.jours, l.cout]), PDF, "⛔ la table du barème n'est plus celle du PDF");
  for (const [niveau, jours, cout] of PDF) {
    const c = P.coteDUnParchemin({ plan: PLAN, niveau });
    assert.equal(c.jours, jours, `niveau ${niveau} : ${jours} jours`);
    assert.equal(c.craftUnitaire, cout, `niveau ${niveau} : ${cout} GP à scriber`);
    assert.equal(c.venteUnitaire, 2 * cout, `niveau ${niveau} : il vaut le double`);
  }
});

test("parchemin 2 — 🔴 « N'EXTRAPOLE PAS LE PRIX PAR RAPPORT À LA RARETÉ » : un niveau 3 n'est pas un Uncommon", () => {
  /* ⚖️ Eric, 26/09. 📏 Le niveau 3 est Uncommon : le palier dirait 10 jours · 200 GP (400 de
     valeur), le palier consommable 5 jours · 100 GP. Le SRD dit 5 jours · 150 GP · 300. */
  const c = P.coteDUnParchemin({ plan: PLAN, niveau: 3 });
  assert.equal(c.rarete, "Uncommon");
  assert.deepEqual([c.jours, c.craftUnitaire, c.venteUnitaire], [5, 150, 300]);
  for (const consommable of [false, true]) {
    const palier = noteDeCraft({ rarete: "Uncommon", consommable });
    assert.notDeepEqual([c.jours, c.craftUnitaire], [palier.jours, palier.cout],
      `⛔ le prix du parchemin est celui du palier Uncommon${consommable ? " consommable" : ""}`);
  }
  /* ⚔️ ET PERSONNE NE LE RECALCULE PAR LA RARETÉ : le module du parchemin ne lit aucun organe
     des paliers. */
  const src = lire("ui/builder/craft-parchemin.mjs");
  for (const interdit of ["noteDeCraft", "PALIERS_SRFH", "palierLePlusProche", "paliterDeRarete", "categorieAffichee", "coteDe("]) {
    assert.ok(!src.includes(interdit), `⛔ craft-parchemin lit « ${interdit} » — le prix passerait par la rareté`);
  }
});

/* ══ ② LA RARETÉ ═════════════════════════════════════════════════════════════ */

test("parchemin 3 — ⚖️ LA RARETÉ SE LIT DANS LA TABLE DU RECORD — et elle n'est qu'une étiquette", () => {
  assert.deepEqual(raretesDuParchemin(PLAN.data).map((l) => `${l.niveau}:${l.rarete}`), [
    "0:Common", "1:Common", "2:Uncommon", "3:Uncommon", "4:Rare", "5:Rare",
    "6:Very Rare", "7:Very Rare", "8:Very Rare", "9:Legendary"]);
  /* ⚔️ LUE, PAS ÉCRITE : un record qui dirait « 3 Rare » ferait dire Rare à l'écran — et le
     PRIX ne bougerait pas d'une pièce (l'étiquette ne pèse rien). */
  const autre = { data: { ...PLAN.data, description: PLAN.data.description.replace("3 Uncommon 15 +7", "3 Rare 15 +7") } };
  const c = P.coteDUnParchemin({ plan: autre, niveau: 3 });
  assert.equal(c.rarete, "Rare", "⭐ la rareté suit le record");
  assert.equal(c.craftUnitaire, 150, "⛔ le prix, lui, ne suit pas la rareté");
  /* ⛔ un record sans table : pas de rareté inventée, mais le prix du SRD reste */
  const muet = P.coteDUnParchemin({ plan: { data: { name: "Spell Scroll" } }, niveau: 3 });
  assert.equal(muet.rarete, null);
  assert.equal(muet.craftUnitaire, 150);
});

test("parchemin 4 — ⭐ LE PLAN SE RECONNAÎT À SA TABLE : un seul record de la pile, et X5 s'ouvre sur lui", () => {
  assert.deepEqual(items.filter((r) => estPlanParchemin(r.data)).map((r) => r.data.name), ["Spell Scroll"],
    "⛔ aucun autre objet n'est pris pour un parchemin — et aucun nom n'est testé pour le trouver");
  const o = ouvertureX5(PLAN, items, []);
  assert.equal(o.plan, PLAN, "⭐ X5 s'ouvre sur le plan lui-même");
  assert.deepEqual(o.choix, {}, "rien de choisi d'avance");
  assert.equal(seCrafteDansX5(PLAN, [], items), true, "⭐ le menu Craft de X2 s'ouvre (garde 13 de x5-ecran)");
});

/* ══ ③ LES CLASSES ET LES NIVEAUX ═════════════════════════════════════════════ */

test("parchemin 5 — ⚖️ LES CLASSES ET LES NIVEAUX SE LISENT DANS LES SORTS — ⛔ aucune liste", () => {
  assert.deepEqual(P.classesDesSorts(SORTS),
    ["Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"]);
  assert.deepEqual(P.niveauxDeLaClasse(SORTS, "Paladin"), [1, 2, 3, 4, 5], "⚖️ seulement les niveaux où la classe a des sorts");
  assert.deepEqual(P.niveauxDeLaClasse(SORTS, "Wizard"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  /* ⭐ un sort Fate's Hand (`fh-spells`) entre tout seul, par ses propres `classes` */
  assert.ok(P.sortsDe(SORTS, "Cleric", 3).some((s) => s.data.name === "Appease the Chaos"),
    "⭐ la pile FH apporte ses sorts sans qu'on les liste");
  /* ⚔️ et une classe que personne n'a écrite apparaît dès qu'un sort la porte */
  const neuf = { data: { name: "Test Bolt", level: 1, classes: ["Artificer"] } };
  assert.ok(P.classesDesSorts([...SORTS, neuf]).includes("Artificer"));
  assert.equal(P.niveauDuSort({ data: { name: "Sans niveau" } }), null, "⛔ un niveau illisible n'est pas un cantrip");
});

/* ══ ④ LA FICHE ═══════════════════════════════════════════════════════════════ */

test("parchemin 6 — ⚖️ LA DICTÉE : Blueprint · CLASS ▾ · LEVEL ▾ · 4 étages de jetons · un dropdown · Send", () => {
  const { noeud } = monte({ choix: { classe: "Wizard", niveau: 3 } });
  assert.equal(noeud.dataset.famille, "parchemin");
  assert.equal(organe(noeud, "TITRE").textContent, "Blueprint");
  assert.deepEqual(options(organe(noeud, "CLASS")).map((o) => o.value), P.classesDesSorts(SORTS));
  assert.deepEqual(options(organe(noeud, "LEVEL")).map((o) => o.textContent),
    ["Cantrip", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9"]);
  const jetons = noeud.querySelectorAll('[data-organe="SORTS"] .x5-sort');
  assert.equal(PAR_PAGE, D.GRILLE_SORTS.colonnes * D.GRILLE_SORTS.rangees);
  assert.equal(D.GRILLE_SORTS.rangees, 4, "⚖️ « 4 étages »");
  assert.equal(jetons.length, Math.min(PAR_PAGE, P.sortsDe(SORTS, "Wizard", 3).length));
  assert.ok([...jetons].every((j) => j.querySelector(".jeton-nom")), "⭐ le corps de tous les jetons (`corpsDuJeton`)");
  assert.ok(organe(noeud, "SEND TO") && organe(noeud, "SEND") && organe(noeud, "CANCEL"), "« un dropdown · send », Cancel à gauche");
  for (const absent of ["STATUS", "ENCART", "PHRASE", "TYPE", "ITEM", "PLAN", "VARIANT"]) {
    assert.equal(organe(noeud, absent), null, `⛔ ${absent} n'est pas dans la fiche du parchemin`);
  }
});

test("parchemin 7 — ⚖️ « TOUJOURS METTRE RARETÉ PRIX QTÉ » : la note et le menu QTY", () => {
  const { noeud } = monte({ choix: { classe: "Wizard", niveau: 3, sort: "Fireball", qte: 2 } });
  const note = organe(noeud, "NOTE").textContent;
  assert.match(note, /Scribing: 5 days · 150 GP · Uncommon/, "⭐ le temps et le coût du SRD, la rareté lue");
  assert.match(note, /Qty 2 · Total 300 GP/, "⭐ la quantité et le total");
  assert.deepEqual(options(organe(noeud, "QTY")).map((o) => o.value), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "⚖️ « pas plus de 10 » (Eric, 24/09)");
});

/* ⭐ LES GESTES, AU SENS DE `glisser.mjs` — la forme de `wares-ecran.test.mjs` (tests 20) :
   appui puis relâché sans bouger = un TAP ; appui, 60 px, relâché sur une cible = un GLISSER.
   ⚠️ Le geste vit sur le `document` au moment de l'appui : il reste posé pendant le geste. */
function avecDocument(fn) {
  const avant = globalThis.document;
  globalThis.document = createTestDocument();
  try { return fn(); }
  finally { if (avant === undefined) delete globalThis.document; else globalThis.document = avant; }
}
function tap(jeton, pointerType = "touch") {
  avecDocument(() => {
    document.elementFromPoint = () => null;
    jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType });
    document.dispatchEvent({ type: "pointerup", clientX: 0, clientY: 0, pointerId: 1 });
  });
}
function glisserVers(jeton, cible) {
  avecDocument(() => {
    document.elementFromPoint = () => ({ closest: (sel) => (sel === "[data-creneau]" ? cible : null) });
    jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "touch" });
    document.dispatchEvent({ type: "pointermove", clientX: 60, clientY: 60, pointerId: 1 });
    document.dispatchEvent({ type: "pointerup", clientX: 60, clientY: 60, pointerId: 1 });
  });
}
const jetonDe = (n, nom) => [...n.querySelectorAll(".x5-sort")].find((j) => j.dataset.sort === nom);

test("parchemin 8 — ⭐ LE GESTE DU VIVIER : doigt tap = info, souris clic gauche = choisir — et l'état choisi se voit", () => {
  const recus = [], infos = [];
  const { noeud } = monte({ choix: { classe: "Wizard", niveau: 3, sort: "Fireball" },
    surChoix: (o, v) => recus.push([o, v]), surInfo: (s) => infos.push(s.data.name) });
  const choisis = [...noeud.querySelectorAll(".x5-sort")].filter((j) => j.getAttribute("aria-pressed") === "true");
  assert.deepEqual(choisis.map((j) => j.dataset.sort), ["Fireball"], "⭐ un seul jeton choisi, celui du sort");
  tap(jetonDe(noeud, "Fly"), "touch");
  assert.deepEqual(infos, ["Fly"], "⚖️ au doigt, le tap ouvre l'info du sort");
  assert.deepEqual(recus, [], "⛔ au doigt, un tap ne choisit pas");
  tap(jetonDe(noeud, "Fly"), "mouse");
  assert.deepEqual(recus.at(-1), ["SORT", "Fly"], "⚖️ à la souris, le clic gauche choisit");
  assert.equal(infos.length, 1, "⛔ le clic gauche n'ouvre pas l'info");
  jetonDe(noeud, "Haste").dispatchEvent({ type: "contextmenu", preventDefault() {} });
  assert.deepEqual(infos.at(-1), "Haste", "⚖️ le clic droit ouvre l'info");
  /* ⛔ SANS VUE D'INFO, le tap choisit au doigt aussi (la clause du vivier) */
  const sans = [];
  const nu = monte({ choix: { classe: "Wizard", niveau: 3 }, surChoix: (o, v) => sans.push([o, v]) }).noeud;
  tap(jetonDe(nu, "Fly"), "touch");
  assert.deepEqual(sans, [["SORT", "Fly"]]);
  const css = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
  assert.match(css, /\.x5-sort\[aria-pressed="true"\]\s*\{[^}]*box-shadow:[^}]*--spy-halo/, "⭐ le halo dit le choix à l'œil");
});

test("parchemin 9 — ⚖️ LES PAGES : plus de douze sorts se paginent, les chevrons tournent — une seule page, pas de flèche", () => {
  const recus = [];
  const wiz = monte({ choix: { classe: "Wizard", niveau: 2 }, surChoix: (o, v) => recus.push([o, v]) }).noeud;
  const n = P.sortsDe(SORTS, "Wizard", 2).length;
  assert.ok(n > PAR_PAGE, `témoin : Wizard niveau 2 a ${n} sorts`);
  const pages = Math.ceil(n / PAR_PAGE);
  assert.equal(organe(wiz, "PAGES").textContent, `1/${pages}`);
  organe(wiz, "PAGE G").dispatchEvent(new Event("click"));
  assert.deepEqual(recus.at(-1), ["PAGE", String(pages - 1)], "⭐ à la première page, ‹ mène à la dernière");
  const derniere = monte({ choix: { classe: "Wizard", niveau: 2, page: pages - 1 } }).noeud;
  assert.equal(derniere.querySelectorAll(".x5-sort").length, n - (pages - 1) * PAR_PAGE, "la dernière page porte le reste");
  /* ⭐ sans page demandée, la fiche ouvre celle du sort choisi */
  const dernierSort = P.sortsDe(SORTS, "Wizard", 2).at(-1).data.name;
  assert.equal(organe(monte({ choix: { classe: "Wizard", niveau: 2, sort: dernierSort } }).noeud, "PAGES").textContent, `${pages}/${pages}`);
  const peu = monte({ choix: { classe: "Paladin", niveau: 5 } }).noeud;
  assert.ok(P.sortsDe(SORTS, "Paladin", 5).length <= PAR_PAGE, "témoin : une seule page");
  assert.equal(organe(peu, "PAGE G"), null, "⛔ une seule page : pas de chevron (règle de Wares)");
  assert.equal(organe(peu, "PAGES").textContent, "1/1");
});

test("parchemin 10 — ⭐ UNE CLASSE SANS LE NIVEAU CHOISI RETOMBE SUR LE SIEN — rien de vide à l'écran", () => {
  const { noeud } = monte({ choix: { classe: "Paladin", niveau: 9 } });
  const niveau = options(organe(noeud, "LEVEL")).find((o) => o.selected);
  assert.equal(niveau.value, "1", "⭐ le Paladin n'a pas de niveau 9 : son premier niveau");
  assert.ok(noeud.querySelectorAll(".x5-sort").length > 0);
});

/* ══ ⑤ SEND ═══════════════════════════════════════════════════════════════════ */

test("parchemin 11 — 💰 `SEND` PAIE LE COÛT DE SCRIBING et rend le sort — le jeton rend l'aperçu", () => {
  let envoi = null, apercu = null;
  const { noeud } = monte({ choix: { classe: "Wizard", niveau: 3, sort: "Fireball", qte: 2, destination: "backpack" },
    surEnvoyer: (e) => { envoi = e; }, surJeton: (a) => { apercu = a; } });
  const send = organe(noeud, "SEND");
  assert.equal(send.disabled, false);
  send.dispatchEvent(new Event("click"));
  assert.equal(envoi.plan, PLAN);
  assert.equal(envoi.sort, sortNomme("Fireball"), "⭐ un RECORD, pour que la ligne pose sa référence");
  assert.equal(envoi.niveau, 3);
  assert.deepEqual(envoi.cout, enPieces(300), "⭐ 2 × 150 GP — le coût de scribing, ⛔ pas la valeur");
  const jeton = organe(noeud, "JETON");
  assert.equal(jeton.querySelector(".jeton-nom").textContent, "Spell Scroll (Fireball)", "le nom du moteur");
  jeton.dispatchEvent(new Event("click"));
  assert.equal(apercu.nom, "Spell Scroll (Fireball)");
  assert.equal(apercu.sort, sortNomme("Fireball"));
  /* ⛔ sans sort choisi, ni Send ni l'aperçu — et Send dit pourquoi */
  const vide = monte({ choix: { classe: "Wizard", niveau: 3 }, surEnvoyer: () => {}, surJeton: () => {} }).noeud;
  assert.equal(organe(vide, "SEND").disabled, true);
  assert.match(organe(vide, "SEND").title, /choose a spell first/);
  assert.equal(organe(vide, "JETON").textContent, "", "⛔ sans sort, le collecteur ne dit rien (lot 290)");
});

/* ══ LOT 290 — LE COLLECTEUR ══════════════════════════════════════════════════
   ⚖️ Eric, 26/09 : *« le collecteur doit être vide pour accueillir le sort dans X5 »*. */

test("parchemin 11 bis — ⚖️ SANS SORT, LE COLLECTEUR EST VIDE : le creux de l'Équipement, aucun mot, une cible", () => {
  const vide = organe(monte({ choix: { classe: "Wizard", niveau: 3 } }).noeud, "JETON");
  assert.equal(vide.textContent, "", "⛔ un mot dans le collecteur vide");
  assert.equal(vide.querySelector(".jeton-nom"), null, "⛔ pas de corps de jeton : il n'y a rien de posé");
  assert.doesNotMatch(vide.getAttribute("aria-label"), /Spell Scroll/, "⛔ « Spell Scroll » avant tout choix");
  assert.ok(vide.className.split(" ").includes("gear-collecteur"), "⭐ le collecteur de l'Équipement, réutilisé — ⛔ pas un style neuf");
  assert.equal(vide.dataset.rempli, "false");
  assert.equal(vide.dataset.creneau, "x5:sort", "⭐ il annonce qu'il accueille un dépôt");
  /* ⭐ ET LE COLLECTEUR VIDE EXISTE DANS LA FEUILLE : le creux, et la lumière sous le doigt */
  const css = fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
  assert.match(css, /\.gear-emplacement, \.gear-collecteur \{[^}]*box-shadow: var\(--creux\)/, "le creux");
  assert.match(css, /\.gear-collecteur\[data-vise="true"\]\s*\{/, "la cible s'allume");
});

test("parchemin 11 ter — ⭐ UN SORT CHOISI SE POSE DANS LE COLLECTEUR : « Spell Scroll (X) », rempli, cible encore", () => {
  for (const [classe, niveau, sort] of [["Wizard", 3, "Fireball"], ["Cleric", 1, "Bless"]]) {
    const j = organe(monte({ choix: { classe, niveau, sort } }).noeud, "JETON");
    assert.equal(j.querySelector(".jeton-nom").textContent, `Spell Scroll (${sort})`);
    assert.equal(j.dataset.rempli, "true");
    assert.equal(j.dataset.creneau, "x5:sort", "⭐ un autre sort glissé dessus le remplace");
    assert.ok(!j.className.split(" ").includes("gear-collecteur"), "⭐ rempli, il prend l'habit du jeton");
  }
});

test("parchemin 11 quater — ⚖️ CHANGER DE CLASSE OU DE NIVEAU REVIDE LE COLLECTEUR", () => {
  /* dans l'écran : le sort d'un autre niveau n'est pas offert → le collecteur est vide */
  const n = monte({ choix: { classe: "Wizard", niveau: 2, sort: "Fireball" }, surEnvoyer: () => {} }).noeud;
  assert.equal(organe(n, "JETON").dataset.rempli, "false", "⛔ Fireball n'est pas un sort de niveau 2");
  assert.equal(organe(n, "SEND").disabled, true, "⛔ et Send reste inactif");
  const c = monte({ choix: { classe: "Paladin", niveau: 3, sort: "Fireball" } }).noeud;
  assert.equal(organe(c, "JETON").dataset.rempli, "false", "⛔ Fireball n'est pas un sort de Paladin");
  /* et dans l'appelant : CLASS et LEVEL remettent le sort à `null` */
  const ecran = lire("ui/builder/equipment-step.mjs");
  assert.match(ecran, /if \(organe === "CLASS"\) \{ c\.classe = valeur; c\.sort = null;/, "⛔ CLASS ne revide plus le sort");
  assert.match(ecran, /else if \(organe === "LEVEL"\) \{ c\.niveau = Number\(valeur\); c\.sort = null;/, "⛔ LEVEL ne revide plus le sort");
});

test("parchemin 11 quinquies — ⭐ GLISSER UN SORT SUR LE COLLECTEUR LE CHOISIT — ⛔ et ce n'est pas un tap", () => {
  const recus = [], infos = [];
  const n = monte({ choix: { classe: "Wizard", niveau: 3 },
    surChoix: (o, v) => recus.push([o, v]), surInfo: (s) => infos.push(s.data.name) }).noeud;
  const collecteur = organe(n, "JETON");
  glisserVers(jetonDe(n, "Fly"), collecteur);
  assert.deepEqual(recus, [["SORT", "Fly"]], "⛔ le dépôt sur le collecteur n'a rien choisi");
  assert.deepEqual(infos, [], "⛔ un glisser a aussi ouvert l'info");
  /* ⛔ lâché ailleurs : rien */
  glisserVers(jetonDe(n, "Haste"), { dataset: { creneau: "ailleurs" } });
  assert.equal(recus.length, 1, "⛔ un dépôt hors du collecteur a choisi");
  /* ⭐ rempli, il accueille encore : un autre sort remplace le premier */
  const plein = monte({ choix: { classe: "Wizard", niveau: 3, sort: "Fireball" }, surChoix: (o, v) => recus.push([o, v]) }).noeud;
  glisserVers(jetonDe(plein, "Haste"), organe(plein, "JETON"));
  assert.deepEqual(recus.at(-1), ["SORT", "Haste"]);
});

test("parchemin 11 sexies — ⭐ L'INFO DU SORT EST CELLE DE L'ÉTAPE DES SORTS (`spellInfo`), ⛔ pas une vue neuve", () => {
  const ecran = lire("ui/builder/equipment-step.mjs");
  assert.match(ecran, /import \{ spellInfo \} from "\.\/class-step\.mjs\?v=\d+";/);
  assert.match(ecran, /surInfo: \(s\) => \{[^}]*spellInfo\(query, ref\.id\)[^}]*act\(info\)/,
    "⛔ X5 n'ouvre plus l'info du sort par `spellInfo` et le popup de la coquille");
});

/* ══ ⑥ LE MOTEUR ET L'ÉCRAN ═══════════════════════════════════════════════════ */

const H = makeHarness({ layers: PILE_SRD });
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
const CLASSE = { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } };
const SIX = ABILITY_KEYS.map((clef) => ({ path: `abilities.${clef}`, value: 12 }));
const rebuild = (id, choix) => {
  const doc = writers.composer({ name: "Nodren", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(H.layers), id, at: "2026-09-26T00:00:00Z" });
  /* une classe donnée par l'appelant remplace le Wizard par défaut */
  const classe = choix.some((c) => c.path === "class") ? [] : [CLASSE];
  return H.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...classe, ...SIX, ...choix] } } });
};
/* La ligne telle que `addGearLine` l'écrit pour un parchemin. */
const FIREBALL = [
  { path: "gear[0]", ref: { kind: "item", id: "srd:item:en:spell-scroll" } },
  { path: "gear[0].quantity", value: 2 }, { path: "gear[0].equipped", value: false },
  { path: "gear[0].spell", ref: { kind: "spell", id: "srd:spell:en:fireball" } },
  { path: "gear[0].note", value: "Crafted by Nodren" },
];

test("parchemin 12 — 🔴 LE MOTEUR LIT `gear[N].spell` : « Spell Scroll (Fireball) », rien d'orphelin, document valide", () => {
  const out = rebuild("scroll-12", FIREBALL);
  const ligne = out.resolved.gear.find((g) => /Spell Scroll/.test(g.name));
  assert.ok(ligne, "le parchemin est dans `resolved.gear`");
  assert.equal(ligne.name, "Spell Scroll (Fireball)");
  assert.equal(ligne.quantity, 2);
  assert.deepEqual(out.unconsumed.filter((p) => p.startsWith("gear[0]")), [],
    "⛔ `gear[0].spell` est LU — un chemin écrit et jamais relu serait une recette muette");
  assert.doesNotThrow(() => writers.assertValid(out.document, "scroll-12"));
  /* ⛔ un sort absent de la pile garde son id — le personnage s'ouvre quand même */
  const perdu = rebuild("scroll-12b", [...FIREBALL.slice(0, 3),
    { path: "gear[0].spell", ref: { kind: "spell", id: "homebrew:spell:en:absent" } }]);
  assert.equal(perdu.resolved.gear[0].name, "Spell Scroll (homebrew:spell:en:absent)");
  assert.equal(nomDUnParchemin("Spell Scroll", ""), "Spell Scroll", "sans sort, le nom du plan");
});

test("parchemin 12 bis — 🔴 UN PARCHEMIN N'APPREND PAS SON SORT AU PERSONNAGE", () => {
  /* 🔴 MESURÉ AVANT LA RÉPARATION (sonde du lot 285) : `derive` prenait TOUT choix
     `ref {kind: "spell"}` pour un sort du personnage (lot 72, écrit quand seuls
     `class.cantrips[n]` et `class.prepared[n]` en portaient). Un Wizard qui scribait
     « Spell Scroll (Fireball) » voyait Fireball dans ses sorts préparés ; un Barbarian, sa
     fiche d'incantation passer de `null` à « non dérivée ». ⭐ Le sort d'un OBJET n'est pas un
     sort du personnage. */
  const sansSort = (classe, avec) => rebuild(`scroll-12b-${classe}-${avec}`, [
    { path: "class", ref: { kind: "class", id: `srd:class:en:${classe}` } }, ...(avec ? FIREBALL : FIREBALL.slice(0, 3))]);
  const sorts = (out) => (out.resolved.spellcasting && out.resolved.spellcasting.spells || []).map((x) => x.name);
  assert.deepEqual(sorts(sansSort("wizard", true)), sorts(sansSort("wizard", false)),
    "⛔ le parchemin a ajouté son sort aux sorts du Wizard");
  assert.ok(!sorts(sansSort("wizard", true)).includes("Fireball"));
  assert.equal(sansSort("barbarian", true).resolved.spellcasting, null,
    "⛔ un Barbarian qui porte un parchemin n'est pas devenu lanceur de sorts");
});

test("parchemin 13 — 🔴 CE QUE LA COQUILLE ÉCRIT EST CE QUE L'ÉCRAN RELIT", () => {
  const shell = lire("ui/builder/shell.mjs");
  const bloc = shell.slice(shell.indexOf('action.kind === "addGearLine"'), shell.indexOf('action.kind === "placerGearLine"'));
  assert.match(bloc, /verbs\.choose\(\{ document, path: `gear\[\$\{index\}\]\.spell`, ref: recette\.sort \}\)/,
    "⛔ addGearLine n'écrit plus la référence du sort");
  const lignes = currentGearLines({ build: { choices: FIREBALL } });
  assert.equal(lignes.length, 1);
  assert.equal(lignes[0].ref.id, "srd:item:en:spell-scroll", "⭐ la ligne pointe sur le PLAN");
  assert.equal(lignes[0].sort.id, "srd:spell:en:fireball", "⭐ et porte son sort");
  assert.equal(estCrafte({ sort: lignes[0].sort }), true, "⭐ un sort est une recette");
  assert.equal(estCrafte({ sort: null }), false);
  /* ⭐ l'écran nomme la ligne par la fonction du moteur, et `Send` pose la référence du sort */
  const ecran = lire("ui/builder/equipment-step.mjs");
  assert.match(ecran, /const nomDeLaLigne = \(l\) => \{[\s\S]{0,700}?return nomDUnParchemin\(/,
    "⛔ l'écran nomme un parchemin par `nomDUnParchemin`, dans `nomDeLaLigne`");
  assert.match(ecran, /if \(e\.sort\) \{[\s\S]{0,900}?kind: "payer"[\s\S]{0,300}?recette: \{ sort: refSort/,
    "⛔ `Send` paie PUIS pose la ligne avec la référence du sort");
});

test("parchemin 14 — 💰 LA FICHE X1 DE LA LIGNE : 300 GP · Uncommon · « Crafting: 5 days · 150 GP · Uncommon »", () => {
  const v = P.valeurDUnParchemin(PLAN, sortNomme("Fireball"));
  assert.equal(v.cout, "300 GP");
  assert.equal(v.rarete, "Uncommon");
  assert.equal(texteDeLaNote(v.craft), "Crafting: 5 days · 150 GP · Uncommon");
  assert.equal(texteDeLaNote(P.valeurDUnParchemin(PLAN, sortNomme("Wish")).craft), "Crafting: 120 days · 50,000 GP · Legendary");
  /* ⭐ la porte de l'écran passe par elle — ⛔ pas par la cote d'un assemblage */
  const ecran = lire("ui/builder/equipment-step.mjs");
  assert.match(ecran, /if \(r\.sortRef\) \{\s*const p = r\.sort \? valeurDUnParchemin\(rec, r\.sort\) : null;/);
});

test("parchemin 15 — ⭐ LE TEXTE : celui du parchemin (SA ligne de la table), puis celui du sort", () => {
  const recette = { kind: "item", sortRef: { kind: "spell", id: "srd:spell:en:fireball" }, sort: sortNomme("Fireball") };
  const texte = recordProse({ record: PLAN }, recette);
  assert.match(texte, /^3 Uncommon 15 \+7$/m, "⭐ la ligne du niveau 3");
  assert.doesNotMatch(texte, /^4 Rare 15 \+7$/m, "⛔ pas celle d'un autre niveau (la leçon du lot 281)");
  assert.equal((texte.match(/Spell Level Rarity Save DC Attack Bonus/g) || []).length, 1, "⛔ l'en-tête répété tombe");
  assert.match(texte, /^Spell: Fireball \(Level 3 · Evocation\)$/m);
  assert.match(texte, /^Range: 150 feet$/m);
  assert.ok(texte.indexOf("A Spell Scroll bears") < texte.indexOf("A bright streak flashes"),
    "⭐ le texte du sort vient SOUS celui du parchemin");
});

/* ══ LE PLAN COTÉ ═════════════════════════════════════════════════════════════ */

test("parchemin 16 — 📐 LA GRILLE EST CELLE DE WARES, et sa feuille ne pose que des cotes de la table", () => {
  assert.deepEqual([D.GRILLE_SORTS.colonnes, D.GRILLE_SORTS.rangees, D.GRILLE_SORTS.l, D.GRILLE_SORTS.h, D.GRILLE_SORTS.ecart],
    [W.COLONNES_GRILLE, W.RANGEES_GRILLE, W.JETON.l, W.JETON.h, W.ECART], "⭐ 3 × 4 jetons de 87 × 48, écart 8");
  const grille = D.ORGANES.find((o) => o.nom === "SORTS");
  assert.equal(grille.l, W.RENDU_GRILLE.jetons.l);
  assert.equal(grille.h, W.RENDU_GRILLE.jetons.h);
  const connus = new Set([D.GRILLE_SORTS.l, D.GRILLE_SORTS.h, D.GRILLE_SORTS.ecart].map(String));
  for (const m of feuilleDuParchemin().matchAll(/(-?[\d.]+)px/g)) {
    assert.ok(connus.has(m[1]), `🔴 ${m[1]}px n'est pas une cote de la grille — écrite à la main`);
  }
});

test("parchemin 17 — 📐 UNE REDÉCLARATION SE RANGE SOUS SA FAMILLE — l'arme garde son pied", () => {
  const f = feuilleDesCotesX5();
  for (const o of organesDeLaFamille("parchemin")) {
    const b = o.cible || o;
    const redecl = o.famille && D.ORGANES.some((x) => x !== o && x.nom === o.nom && !x.famille);
    const sel = `${redecl ? '.x5[data-famille="parchemin"]' : ".x5"} [data-organe="${({ PURSE: "purse", MONTANT: "montant" })[o.nom] || o.nom}"]`;
    assert.ok(f.includes(`${sel}{position:absolute;left:${b.x}px;top:${b.y}px;`), `⛔ ${o.nom} n'est pas posé à sa cote sous sa famille`);
  }
  /* ⚔️ le pied COMMUN reste où il était : une règle non rangée sous sa famille l'aurait écrasé */
  const commun = D.ORGANES.find((o) => o.nom === "SEND" && !o.famille);
  assert.ok(f.includes(`.x5 [data-organe="SEND"]{position:absolute;left:${commun.cible.x}px;top:${commun.cible.y}px;`));
  assert.ok(!f.includes(`.x5 [data-organe="SEND"]{position:absolute;left:${commun.cible.x}px;top:${D.ORGANES.find((o) => o.nom === "SEND" && o.famille === "parchemin").cible.y}px;`),
    "⛔ la cote du parchemin ne fuit pas hors de sa famille");
  /* ⚔️ ET LA REMONTÉE DE LA VARIANTE N'EN PREND PAS UNE SECONDE : un organe commun a UNE règle
     `data-pouvoirs="aucun"`. Une redéclaration qui y entrerait écrirait une seconde cote — la
     dernière gagnerait, et le pied de la Ioun Stone descendrait à celui du parchemin. */
  for (const nom of ["JETON", "purse", "QTY", "CANCEL", "SEND TO", "SEND"]) {
    const n = f.split(`[data-pouvoirs="aucun"] [data-organe="${nom}"]{`).length - 1;
    assert.equal(n, 1, `⛔ ${nom} a ${n} règles de remontée`);
  }
});

test("parchemin 18 — 📐 LE PLAN DU PARCHEMIN TIENT DANS LA DALLE — cibles, marges, rien ne se recouvre", () => {
  const os = organesDeLaFamille("parchemin");
  const bas = Math.max(...os.map((o) => { const b = o.cible || o; return b.y + b.h; }));
  assert.equal(bas + D.MARGE, D.HAUTEURS.parchemin);
  assert.ok(D.DALLE.h - bas >= 8, `📏 la marge sous le pied (${D.DALLE.h - bas}) couvre l'écart du belt (garde 31)`);
  for (const o of os) {
    const b = o.cible || o;
    assert.ok(b.x >= D.MARGE_COTE && b.x + b.l <= D.DALLE.l - D.MARGE_COTE, `${o.nom} sort des marges`);
    if (["dropdown", "porte", "chevron"].includes(o.sorte)) assert.ok(b.h >= D.TOUCH && b.l >= D.TOUCH, `${o.nom} : cible < 44`);
  }
  const libres = os.filter((o) => !o.dans).map((o) => [o.nom, o.cible || o]);
  for (let i = 0; i < libres.length; i += 1) {
    for (let k = i + 1; k < libres.length; k += 1) {
      const [na, a] = libres[i], [nc, c] = libres[k];
      const recouvre = a.x < c.x + c.l && c.x < a.x + a.l && a.y < c.y + c.h && c.y < a.y + a.h;
      assert.ok(!recouvre, `⛔ ${na} recouvre ${nc}`);
    }
  }
  /* ⭐ la quantité est le miroir de la bourse autour du jeton */
  const par = (n) => os.find((o) => o.nom === n);
  const q = par("QTY").cible, j = par("JETON"), p = par("PURSE");
  assert.equal(q.x + q.l / 2, (D.MARGE_COTE + j.x) / 2);
  assert.equal(p.x + p.l / 2, (j.x + j.l + D.DALLE.l - D.MARGE_COTE) / 2);
});
