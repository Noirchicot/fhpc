/* ══ LOT 301 — UN KIT QUI ARRIVE SE VERSE DANS UNE PAGE DU SAC NOMMÉE « Kit <nom> » ═══════════
   ⚖️ Eric, 2026-09-26, mot pour mot, en quatre messages :
     « Je suggère que quand il y a un kit, on crée une page équipement nommée kit et son contenu
       est mis dedans » · « Un b-page backpack pardon » · « Pour tous les kits on verse le contenu
       dans un storage » · « Qu'on nomme kit xxxxx ».
   ⭐ Une page du sac EST une section (`backpack.sections[N].name`, lot 214) : aucune structure
   neuve du document. Le kit écrit ce que le `+` puis un dépôt ordinaire écriraient.
   Règle : `equipement-kit-verse-dans-sa-page` (NORMES).

   Les gardes :
     1 — le départ du Wizard (option A, Scholar's Pack) crée « Kit Scholar’s Pack » avec son
         contenu, et plus de ligne pack ; les éléments ne se fondent pas, ne s'équipent pas ;
     2 — un achat d'Explorer's Pack dans Wares fait pareil (la coquille est rejouée, et son
         câblage est lu) ;
     3 — deux packs identiques donnent deux pages distinctes (deux achats, ou une ligne de 2) ;
     4 — le document se reconstruit : ni violation, ni avertissement, ni `underived` neuf, et
         aucune famille `unconsumed` que le chemin ordinaire (le `+`, puis un dépôt) n'écrit pas.
   ⚔️ Tous éprouvés ROUGES par mutation de la source (source restaurée, sha256 identique). */
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
  currentGearLines, nextGearIndex, accorderLEquipe, butinDuDepart, appliquerLeButin,
  contenuDuKit, verserLeKit, nomDeLaPageDuKit, PREFIXE_PAGE_DE_KIT, sectionsDuSac, boiteDeSection,
  nextSectionIndex, nomDeSectionParDefaut, lieuDeLaBoite, boitesDehors, placeNeuveDans
} = await import("../ui/builder/equipment-step.mjs");
const { CASES_DU_SAC } = await import("../ui/builder/sac-ecran.mjs");

const fixture = exempleFhEn();
const verbs = fixture.build.verbs;
const query = fixture.layers.verbs.query;
const rebuild = (document) => verbs.rebuild({ document });

const SCHOLAR = { kind: "gear", id: "srd:gear:en:scholar-s-pack" };
const EXPLORER = { kind: "gear", id: "srd:gear:en:explorer-s-pack" };
/* ⭐ le départ est répondu : sans lui, X0 remplace Gear (lot 254) */
const BASE = verbs.set({ document: fixture.document, path: "depart.class", value: "A" }).document;

/* ── `addGearLine` de `shell.mjs`, rejoué (même limite que les gestes du lot 49 : le câblage
   de la coquille est lu au garde 2) ── */
function acheter(doc, { ref, quantity = 1, location }) {
  const index = nextGearIndex(doc);
  let d = verbs.choose({ document: doc, path: `gear[${index}]`, ref }).document;
  d = verbs.set({ document: d, path: `gear[${index}].quantity`, value: quantity }).document;
  d = verbs.set({ document: d, path: `gear[${index}].equipped`, value: false }).document;
  if (location) d = verbs.set({ document: d, path: `gear[${index}].location`, value: location }).document;
  const verse = verserLeKit({ document: d, verbs, query, index });
  return verse !== d ? verse : accorderLEquipe({ document: d, verbs, query, index, voulu: false });
}

/* ── ce que le sac porte dans une page nommée ── */
function pageNommee(doc, nom) {
  const s = sectionsDuSac(doc).filter((x) => x.nom === nom);
  assert.equal(s.length, 1, `une page, et une seule, s'appelle « ${nom} »`);
  const boite = boiteDeSection(s[0].index);
  const lignes = currentGearLines(doc).filter((l) => l.boite === boite)
    .sort((a, b) => a.place - b.place);
  return { section: s[0], boite, lignes };
}

/* ── le contenu d'une page, comparé au record du kit — ⛔ jamais une liste écrite ici ── */
function pageEgaleAuKit(page, kit, doc) {
  assert.ok(kit.elements.length >= 5, "témoin : le kit porte un contenu (sinon ce garde ne prouve rien)");
  assert.deepEqual(page.lignes.map((l) => [l.ref.id, l.quantity]),
    kit.elements.map((e) => [e.ref.id, e.quantity]),
    "chaque élément du kit, à sa quantité, dans l'ordre du livre");
  assert.deepEqual(page.lignes.map((l) => l.place), kit.elements.map((_, i) => i),
    "chacun à sa place, la première libre de la page — le chemin d'un dépôt ordinaire");
  for (const l of page.lignes) {
    assert.equal(l.equipped, false, `${l.ref.id} : ⛔ un élément de kit n'est pas équipé, il est versé`);
    assert.equal(l.location, lieuDeLaBoite(page.boite, boitesDehors(doc)), `${l.ref.id} : le lieu de sa page`);
    assert.equal(l.location, "backpack", `${l.ref.id} : une page du sac — il pèse`);
  }
}

/* ══ 1 — LE DÉPART DU WIZARD ═════════════════════════════════════════════════════════════ */
test("1 — ⚖️ le départ du Wizard (option A) verse le Scholar's Pack dans « Kit Scholar’s Pack » — plus de ligne pack", () => {
  const depart = verbs.choose({ document: fixture.document, path: "class",
    ref: { kind: "class", id: "srd:class:en:wizard" } }).document;
  const butin = butinDuDepart({ query, document: depart, reponses: { class: "A" } });
  assert.ok(butin.complet, "témoin : l'option A du Wizard se pose sans autre question");
  assert.ok(butin.lignes.some((l) => l.ref.id === SCHOLAR.id), "témoin : l'option A porte le Scholar's Pack");
  const apres = appliquerLeButin({ document: depart, verbs, query, butin });

  const kit = contenuDuKit(query, SCHOLAR);
  assert.equal(`${PREFIXE_PAGE_DE_KIT} ${kit.nom}`, "Kit Scholar’s Pack", "« Qu'on nomme kit xxxxx » — le nom du record, tel quel");
  const page = pageNommee(apres, "Kit Scholar’s Pack");
  pageEgaleAuKit(page, kit, apres);
  assert.equal(currentGearLines(apres).filter((l) => l.ref.id === SCHOLAR.id).length, 0,
    "⛔ la ligne du pack ne reste pas : « on verse le contenu »");
  assert.equal(page.section.dehors, undefined, "une page DU SAC, ⛔ pas une place dorée (hors du sac)");

  /* ⭐ ILS NE SE FONDENT PAS : Ilyra porte déjà un Book et un Backpack au sac ; ceux du kit
     vont dans SA page, sur leur propre ligne (lot 296 : deux lignes du même record sont légales). */
  for (const id of ["srd:gear:en:book", "srd:gear:en:backpack"]) {
    const avant = currentGearLines(depart).find((l) => l.ref.id === id);
    assert.ok(avant, `témoin : ${id} est déjà au sac avant le départ`);
    const meme = currentGearLines(apres).find((l) => l.index === avant.index);
    assert.equal(meme.quantity, avant.quantity, `${id} : ⛔ la ligne d'avant ne grossit pas`);
    assert.notEqual(meme.boite, page.boite, `${id} : la ligne d'avant ne déménage pas dans la page`);
  }
  /* ⭐ et le reste du kit de départ garde la loi du lot 299 : au sac, hors des pages de kit */
  assert.ok(currentGearLines(apres).some((l) => l.ref.id === "srd:gear:en:robe" && l.boite !== page.boite),
    "témoin : la Robe (hors kit) est posée, et pas dans la page du kit");
});

/* ══ 2 — L'ACHAT DANS WARES ══════════════════════════════════════════════════════════════ */
test("2 — ⚖️ acheter un Explorer's Pack dans Wares le verse dans « Kit Explorer’s Pack » — et la coquille passe par le versement", () => {
  const avant = currentGearLines(BASE).length;
  const apres = acheter(BASE, { ref: EXPLORER, quantity: 1, location: "backpack" });
  const kit = contenuDuKit(query, EXPLORER);
  pageEgaleAuKit(pageNommee(apres, "Kit Explorer’s Pack"), kit, apres);
  assert.equal(currentGearLines(apres).filter((l) => l.ref.id === EXPLORER.id).length, 0, "⛔ plus de ligne pack");
  assert.equal(currentGearLines(apres).length, avant + kit.elements.length, "rien d'autre n'a bougé");
  /* ⭐ acheté « Slot (auto) » : un kit n'a pas de case, il se verse pareil */
  const auCorps = acheter(BASE, { ref: EXPLORER, quantity: 1, location: "self" });
  pageEgaleAuKit(pageNommee(auCorps, "Kit Explorer’s Pack"), kit, auCorps);

  /* 🔒 LE CÂBLAGE : `addGearLine` de la coquille appelle le versement, et n'accorde la ligne que
     si rien n'a été versé (sinon il réécrirait `equipped` sur une ligne retirée). */
  const shell = stripComments(fs.readFileSync(path.join(UI, "shell.mjs"), "utf8"));
  const i = shell.indexOf('action.kind === "addGearLine"');
  const bloc = shell.slice(i, shell.indexOf("action.kind === ", i + 20));
  assert.match(bloc, /verserLeKit\(\{ document, verbs, index,/, "⛔ `addGearLine` doit verser le kit");
  assert.match(bloc, /state\.document = verse !== document \? verse : accorder\(document, index,/,
    "⛔ et n'accorder la ligne que si elle n'a pas été versée");
  /* 🔒 le départ aussi — `appliquerLeButin` verse chaque ligne neuve */
  const etape = stripComments(fs.readFileSync(path.join(UI, "equipment-step.mjs"), "utf8"));
  const corps = etape.slice(etape.indexOf("export function appliquerLeButin"), etape.indexOf("function candidatesDuSlot"));
  assert.match(corps, /verserLeKit\(\{ document: doc, verbs, query, index: pose\.index \}\)/,
    "⛔ `appliquerLeButin` doit verser les kits du départ");
});

/* ══ 3 — DEUX KITS IDENTIQUES, DEUX PAGES ════════════════════════════════════════════════ */
test("3 — ⚖️ deux Explorer's Packs donnent deux pages : « Kit Explorer’s Pack » puis « Kit Explorer’s Pack 2 »", () => {
  const kit = contenuDuKit(query, EXPLORER);
  const deuxAchats = acheter(acheter(BASE, { ref: EXPLORER }), { ref: EXPLORER });
  const uneLigneDeDeux = acheter(BASE, { ref: EXPLORER, quantity: 2 });
  for (const [mot, doc] of [["deux achats", deuxAchats], ["une ligne de deux", uneLigneDeDeux]]) {
    const p1 = pageNommee(doc, "Kit Explorer’s Pack");
    const p2 = pageNommee(doc, "Kit Explorer’s Pack 2");
    assert.notEqual(p1.boite, p2.boite, `${mot} : deux pages distinctes`);
    pageEgaleAuKit(p1, kit, doc);
    pageEgaleAuKit(p2, kit, doc);
    assert.equal(currentGearLines(doc).filter((l) => l.ref.id === EXPLORER.id).length, 0, `${mot} : plus de ligne pack`);
  }
  /* ⭐ UN ACHAT PUIS LE DÉPART DU BARBARIAN (option A : Explorer's Pack) — deux chemins, deux pages */
  const barbare = (doc) => {
    const d = verbs.choose({ document: doc, path: "class", ref: { kind: "class", id: "srd:class:en:barbarian" } }).document;
    const sansDepart = verbs.clear({ document: d, path: "depart.class", kind: "choice" }).document;
    const butin = butinDuDepart({ query, document: sansDepart, reponses: { class: "A" } });
    assert.ok(butin.complet && butin.lignes.some((l) => l.ref.id === EXPLORER.id), "témoin : l'option A du Barbarian porte l'Explorer's Pack");
    return appliquerLeButin({ document: sansDepart, verbs, query, butin });
  };
  const achatPuisDepart = barbare(acheter(BASE, { ref: EXPLORER }));
  pageEgaleAuKit(pageNommee(achatPuisDepart, "Kit Explorer’s Pack"), kit, achatPuisDepart);
  pageEgaleAuKit(pageNommee(achatPuisDepart, "Kit Explorer’s Pack 2"), kit, achatPuisDepart);
  /* ⚖️ ET UN KIT NE SE FOND PAS (lot 296 borné) : un personnage sauvegardé AVANT ce lot porte une
     ligne Explorer's Pack au sac, jamais versée. Le kit du départ ne s'y fond pas : il ouvre sa
     ligne, donc sa page — et l'ancienne ligne reste telle quelle (⛔ ce lot ne réécrit pas le passé). */
  const ancien = (() => {
    const index = nextGearIndex(BASE);
    let d = verbs.choose({ document: BASE, path: `gear[${index}]`, ref: EXPLORER }).document;
    d = verbs.set({ document: d, path: `gear[${index}].quantity`, value: 1 }).document;
    return { doc: verbs.set({ document: d, path: `gear[${index}].equipped`, value: false }).document, index };
  })();
  const surAncien = barbare(ancien.doc);
  const vieille = currentGearLines(surAncien).filter((l) => l.ref.id === EXPLORER.id);
  assert.deepEqual(vieille.map((l) => [l.index, l.quantity]), [[ancien.index, 1]],
    "⛔ la ligne d'avant ne grossit pas, et elle reste la seule ligne pack");
  pageEgaleAuKit(pageNommee(surAncien, "Kit Explorer’s Pack"), kit, surAncien);

  /* ⭐ le suffixe prend le premier numéro libre, et un nom déjà pris par le joueur compte */
  const renomme = verbs.set({ document: BASE, path: "backpack.sections[1].name", value: "Kit Explorer’s Pack" }).document;
  assert.equal(nomDeLaPageDuKit(renomme, "Explorer’s Pack"), "Kit Explorer’s Pack 2");
  assert.equal(nomDeLaPageDuKit(BASE, "Explorer’s Pack"), "Kit Explorer’s Pack");
});

/* ══ 4 — LE MOTEUR ═══════════════════════════════════════════════════════════════════════ */
test("4 — 📏 le document versé se reconstruit : ni violation, ni avertissement, ni `underived`, ni famille `unconsumed` neuve", () => {
  const famille = (r) => new Set(r.unconsumed.map((p) => String(p).replace(/\[\d+\]/g, "[N]")));
  const avant = rebuild(BASE);
  /* ⭐ LE TÉMOIN EST LE CHEMIN ORDINAIRE, pas une liste : le `+` (une section nommée), puis un
     objet acheté et déposé dans sa grille. Ce qu'il écrit est ce que le produit sait déjà lire. */
  const section = nextSectionIndex(BASE);
  let ordinaire = verbs.set({ document: BASE, path: `backpack.sections[${section}].name`,
    value: nomDeSectionParDefaut(section) }).document;
  const i = nextGearIndex(ordinaire);
  const boite = boiteDeSection(section);
  ordinaire = verbs.choose({ document: ordinaire, path: `gear[${i}]`, ref: { kind: "gear", id: "srd:gear:en:rope" } }).document;
  ordinaire = verbs.set({ document: ordinaire, path: `gear[${i}].quantity`, value: 1 }).document;
  ordinaire = verbs.set({ document: ordinaire, path: `gear[${i}].equipped`, value: false }).document;
  ordinaire = verbs.set({ document: ordinaire, path: `gear[${i}].boite`, value: boite }).document;
  ordinaire = verbs.set({ document: ordinaire, path: `gear[${i}].location`, value: lieuDeLaBoite(boite, boitesDehors(ordinaire)) }).document;
  ordinaire = verbs.set({ document: ordinaire, path: `gear[${i}].place`,
    value: placeNeuveDans(currentGearLines(ordinaire), boite, CASES_DU_SAC) }).document;
  const permises = new Set([...famille(avant), ...famille(rebuild(ordinaire))]);

  const depart = verbs.choose({ document: fixture.document, path: "class",
    ref: { kind: "class", id: "srd:class:en:wizard" } }).document;
  const butin = butinDuDepart({ query, document: depart, reponses: { class: "A" } });
  const cas = [
    ["achat de deux Explorer's Packs", BASE, acheter(BASE, { ref: EXPLORER, quantity: 2 })],
    ["départ du Wizard", depart, appliquerLeButin({ document: depart, verbs, query, butin })]
  ];
  /* ⭐ les familles du départ lui-même (`depart.*`) sont écrites par le lot 299, pas par ce lot */
  const sansVersement = appliquerLeButin({ document: depart, verbs, query,
    butin: { ...butin, aPoser: butin.aPoser.filter((p) => p.ref.id !== SCHOLAR.id) } });
  for (const f of famille(rebuild(sansVersement))) permises.add(f);

  for (const [mot, de, doc] of cas) {
    const r0 = rebuild(de);
    const r = rebuild(doc);
    assert.deepEqual(r.moduleViolations, r0.moduleViolations, `${mot} : ⛔ aucune violation neuve`);
    assert.equal(r.warnings.length, r0.warnings.length, `${mot} : ⛔ aucun avertissement neuf`);
    assert.equal(r.underived.length, r0.underived.length, `${mot} : ⛔ aucun \`underived\` neuf`);
    const neuves = [...famille(r)].filter((f) => !permises.has(f));
    assert.deepEqual(neuves, [], `${mot} : ⛔ aucune famille \`unconsumed\` que le chemin ordinaire n'écrit pas`);
    /* ⚔️ témoin : la page se voit bien au moteur — sinon l'égalité ne dirait rien */
    assert.ok(famille(r).has("backpack.sections[N].name"), `${mot} : témoin — le nom de la page est au document`);
    /* ⭐ et le moteur voit les éléments versés dans la fiche */
    const ids = r.resolved.gear.map((g) => g.id);
    assert.ok(ids.some((x) => /^tinderbox/.test(x)), `${mot} : le Tinderbox versé est dans la fiche`);
  }
});
