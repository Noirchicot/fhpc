/* ══ LOT 390 — LE CATALOG D'UN CRÉATEUR : le modèle, le juge, et Import a book ouvert ═════════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 390 catalog de createur.md` (ARCHI 35, 30/09) ; Q1 → a (l'id
   `noirchicot-mistlands` préfixe les records, les noms de l'app sont interdits), Q2 → a (`attribution.author`).
   Règle : NORMES `menu-layers-catalog-de-createur`.

   🔴 CE QUE CE FICHIER GARDE :
     K1. LE MODÈLE est accepté par le juge ET par le juge du montage (`readLayer`), et il montre chaque genre.
     K2. CHAQUE FAUTE TYPE est refusée avec SON chemin et SA phrase — un champ manquant, un type inconnu, un id
         déjà pris (celui du SRD, et celui écrit deux fois), un record qui remplace au lieu d'ajouter, un
         espace de noms qui n'est pas le sien, un drapeau, un nom de l'app, une valeur hors liste.
     K3. LA LIGNE DE COMMANDE ET LE JUGE DE L'APP rendent le MÊME verdict sur les MÊMES fichiers.
     K4. CE QUE LE JUGE ACCEPTE, LE MONTAGE NE LE REFUSE JAMAIS — et sa phrase de secours n'est jamais servie.
     K5. `CHAMPS_EXIGES` n'invente rien : chaque champ est porté par tous les records SRD du genre, avec ce type ;
         chaque liste fermée est celle du SRD.
     K6. LES NOMS DE L'APP : chaque couche servie, chaque livre connu est un nom de l'app, refusé comme id.
     K7. UN CATALOG IMPORTÉ SE MONTE, S'ALLUME ET S'EFFACE COMME UN LIVRE — et un fichier posé à la main dans
         `books/` est jugé au montage.
     K8. LAYERS le montre (nom, « by <author> », `catalog`, l'interrupteur, la poubelle), ou dit pourquoi pas.
     K9. LE MENU et LE RECALAGE : `Books` l'écrit par son nom ; un catalog absent n'est pas effacé d'un perso.
     K10. LE REFUS À L'IMPORT dit les fautes ; LE GUIDE dit chaque champ exigé, le modèle, le texte pour l'IA ;
          ⛔ « homebrew » ne s'écrit nulle part où un joueur lit. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";

globalThis.document = createTestDocument();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODELE = path.join(ROOT, "examples", "catalog-modele.layer.json");

const { verifierUnCatalog, fauteEnLigne, CHAMPS_EXIGES, GENRES_DU_CATALOG, ESPACES_DE_L_APP, estUnNomDeLApp }
  = await import("../src/catalog/juge.mjs");
const { readLayer, GENRES } = await import("../src/layers/document.mjs");
const { validerUnLivre, creerLibrairie, librairieAppareil, livresDuLieu } = await import("../ui/builder/magasin.mjs");
const { renderLayersEcran, texteDuRefusDImport, FAUTES_DANS_LA_FENETRE, LIVRES_DU_JOUEUR } = await import("../ui/builder/layers-ecran.mjs");
const { renderUniverseStep, RULE_LAYER_IDS, SRD_LAYER_ID, currentBooks } = await import("../ui/builder/universe-step.mjs");
const { recalageDeLaPile } = await import("../ui/builder/recalage.mjs");
const { LAYER_FILES } = await import("../ui/builder/engine.mjs");

/* ── LES FIXTURES ─────────────────────────────────────────────────────────────────────────────────── */

const octetsDuModele = () => new Uint8Array(fs.readFileSync(MODELE));
const modele = () => JSON.parse(fs.readFileSync(MODELE, "utf8"));
const enOctets = (o) => new TextEncoder().encode(typeof o === "string" ? o : JSON.stringify(o, null, 2));
const ID = "example-emberwood";
const SORT = `${ID}:spell:en:ember-lance`;
const OUTIL = `${ID}:gear:en:ash-chalk`;

/** Les fichiers FAUTIFS, un par faute type — le modèle, avec UNE faute. `chemin` et `phrase` : ce que le juge
 *  doit dire. */
const FAUTIFS = [
  { nom: "sans auteur", fabriquer: (m) => { delete m.attribution.author; },
    chemin: "attribution.author", phrase: /^Missing\. Write your name/ },
  { nom: "un type inconnu", fabriquer: (m) => { m.records.spel = { [`${ID}:spel:en:x`]: { name: "X", data: {} } }; },
    chemin: "records.spel", phrase: /"spel" is not a type of record\. A catalog can add: armor, background, feat, gear, item, species, spell, weapon\./ },
  { nom: "un type qu'un catalog n'ajoute pas", fabriquer: (m) => { m.records.class = {}; },
    chemin: "records.class", phrase: /A catalog cannot add a "class" yet/ },
  { nom: "un id du SRD", fabriquer: (m) => { m.records.spell["srd:spell:en:fire-bolt"] = m.records.spell[SORT]; },
    chemin: "records.spell[\"srd:spell:en:fire-bolt\"]", phrase: /is an id of the SRD\. A catalog never replaces a record that already exists/ },
  { nom: "un id de Fate's Hand", fabriquer: (m) => { m.records.feat["fh:feat:en:x"] = m.records.feat[`${ID}:feat:en:ashen-resolve`]; },
    chemin: "records.feat[\"fh:feat:en:x\"]", phrase: /is an id of Fate's Hand/ },
  { nom: "un id écrit deux fois", texte: (t) => t.replace(`"${OUTIL}": {`, `"${OUTIL}": { "name": "Twice", "data": { "cost": "1 SP", "weight": "1 lb." } },\n      "${OUTIL}": {`),
    chemin: `records.gear["${OUTIL}"]`, phrase: /is written twice in this file\. Each record needs its own id/ },
  { nom: "un record qui remplace (patch)", fabriquer: (m) => { m.records.spell[SORT].op = "patch"; },
    chemin: `records.spell["${SORT}"].op`, phrase: /"patch" would change a record that already exists\. A catalog only adds new records/ },
  { nom: "un record qui retire (disable)", fabriquer: (m) => { m.records.gear[OUTIL] = { op: "disable" }; },
    chemin: `records.gear["${OUTIL}"].op`, phrase: /"disable" would remove a record that already exists/ },
  { nom: "un champ manquant", fabriquer: (m) => { delete m.records.spell[SORT].data.level; },
    chemin: `records.spell["${SORT}"].data.level`, phrase: /^Missing\. A spell needs "level": a whole number from 0 to 9/ },
  { nom: "un champ du mauvais type", fabriquer: (m) => { m.records.species[`${ID}:species:en:cindrel`].data.speed_ft = "30 feet"; },
    chemin: `records.species["${ID}:species:en:cindrel"].data.speed_ft`, phrase: /^Must be a number/ },
  { nom: "une valeur hors liste", fabriquer: (m) => { m.records.weapon[`${ID}:weapon:en:hookblade`].data.damage_type_key = "fire"; },
    chemin: `records.weapon["${ID}:weapon:en:hookblade"].data.damage_type_key`, phrase: /"fire" is not one of: bludgeoning, piercing, slashing\./ },
  { nom: "un espace de noms qui n'est pas le sien", fabriquer: (m) => { m.records.gear["someone-else:gear:en:ash-chalk"] = m.records.gear[OUTIL]; delete m.records.gear[OUTIL]; },
    chemin: "records.gear[\"someone-else:gear:en:ash-chalk\"]", phrase: /must begin with your catalog's id: "example-emberwood:gear:en:ash-chalk"/ },
  { nom: "un drapeau", fabriquer: (m) => { m.flags = ["fh.destiny"]; },
    chemin: "flags", phrase: /cannot switch on a rule of the game/ },
  { nom: "une valeur de règle", fabriquer: (m) => { m.ruleValues = { "fh.exhaustion": 1 }; },
    chemin: "ruleValues", phrase: /cannot change a rule of the game/ },
  { nom: "un nom de l'app", fabriquer: (m) => { m.id = "fh-mistlands"; },
    chemin: "id", phrase: /is a name the app keeps for Fate's Hand/ },
  { nom: "sans licence", fabriquer: (m) => { delete m.attribution.license; },
    chemin: "attribution.license", phrase: /^Missing\. Say which licence/ },
  { nom: "du JSON cassé", texte: (t) => t.replace("\"records\": {", "\"records\" {"),
    chemin: "(file)", phrase: /^This is not valid JSON/ }
];
function octetsFautifs(f) {
  if (f.texte) return enOctets(f.texte(fs.readFileSync(MODELE, "utf8")));
  const m = modele();
  f.fabriquer(m);
  return enOctets(m);
}

function baseDeFixture() {
  const rayons = new Map();
  const rayon = (nom) => { if (!rayons.has(nom)) rayons.set(nom, new Map()); return rayons.get(nom); };
  return {
    rayons,
    lire: async (nom, clef) => (rayons.has(nom) && rayons.get(nom).has(clef) ? rayons.get(nom).get(clef) : null),
    ecrire: async (nom, clef, valeur) => { rayon(nom).set(clef, valeur); },
    effacer: async (nom, clef) => { rayon(nom).delete(clef); },
    tout: async (nom) => [...rayon(nom).entries()].map(([clef, valeur]) => ({ clef, valeur })),
    echanger: async (nom, clef, decider) => { const s = decider(rayon(nom).has(clef) ? rayon(nom).get(clef) : null); if (s !== undefined) rayon(nom).set(clef, s); }
  };
}
/** LE MOTEUR DE LA PAGE, sous Node — les couches du disque ; aucun livre servi par le site. */
async function moteur(livresDuLieuFn) {
  const vraiFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const chemin = String(url).split("?")[0];
    if (!fs.existsSync(chemin)) return { ok: false, status: 404, json: async () => null, arrayBuffer: async () => new ArrayBuffer(0) };
    const o = fs.readFileSync(chemin);
    return { ok: true, status: 200, arrayBuffer: async () => o.buffer.slice(o.byteOffset, o.byteOffset + o.byteLength), json: async () => JSON.parse(o.toString("utf8")) };
  };
  try {
    const { bootEngine } = await import("../ui/builder/engine.mjs");
    return await bootEngine({ root: ROOT, livresDuLieu: livresDuLieuFn });
  } finally {
    globalThis.fetch = vraiFetch;
  }
}

/* ══ K1 — LE MODÈLE ═══════════════════════════════════════════════════════════════════════════════════ */

test("K1 — 📐 LE MODÈLE est accepté par le juge ET par le juge du montage, et il montre CHAQUE genre qu'un catalog ajoute", () => {
  const v = verifierUnCatalog(octetsDuModele());
  assert.deepEqual(v, { etat: "valide", id: ID, nom: "Emberwood (model catalog)", auteur: "SOWLREACH", version: "1.0.0", records: 8 });
  assert.doesNotThrow(() => readLayer(octetsDuModele(), "modèle"), "⭐ le juge du montage l'accepte aussi");
  assert.deepEqual(Object.keys(modele().records).sort(), [...GENRES_DU_CATALOG].sort(), "un record de CHAQUE genre — le modèle ne tait aucun type");
  assert.deepEqual(validerUnLivre(octetsDuModele()).etat, "valide", "et `Import a book` l'accepte");
});

/* ══ K2 — CHAQUE FAUTE, SON CHEMIN, SA PHRASE ═════════════════════════════════════════════════════════ */

test("K2 — ⛔ CHAQUE FAUTE TYPE est refusée avec SON chemin et SA phrase — et le juge les dit TOUTES, pas la première", () => {
  for (const f of FAUTIFS) {
    const v = verifierUnCatalog(octetsFautifs(f));
    assert.equal(v.etat, "refus", `${f.nom} : refusé`);
    const la = v.fautes.find((x) => x.chemin === f.chemin);
    assert.ok(la, `${f.nom} : la faute est à « ${f.chemin} » (dit : ${v.fautes.map((x) => x.chemin).join(" | ")})`);
    assert.match(la.phrase, f.phrase, `${f.nom} : sa phrase`);
  }
  /* toutes, pas la première : trois fautes posées, trois dites */
  const m = modele();
  delete m.attribution.author;
  m.flags = ["fh.destiny"];
  delete m.records.spell[SORT].data.level;
  assert.deepEqual(verifierUnCatalog(enOctets(m)).fautes.map((x) => x.chemin),
    ["flags", "attribution.author", `records.spell["${SORT}"].data.level`]);
});

/* ══ K3 — UN SEUL JUGE : LA LIGNE DE COMMANDE ET L'APP ═══════════════════════════════════════════════ */

test("K3 — ⚖️ LA LIGNE DE COMMANDE ET L'APP rendent le MÊME verdict sur les MÊMES fichiers (un seul juge)", () => {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-390-"));
  try {
    const cas = [{ nom: "modele", octets: octetsDuModele() }, ...FAUTIFS.map((f, i) => ({ nom: `fautif-${i}`, octets: octetsFautifs(f) }))];
    const fichiers = cas.map((c) => { const p = path.join(dossier, `${c.nom}.json`); fs.writeFileSync(p, c.octets); return p; });
    let sortie;
    let code = 0;
    try { sortie = execFileSync(process.execPath, [path.join(ROOT, "tools", "verifier-catalog.mjs"), "--json", ...fichiers], { encoding: "utf8" }); }
    catch (e) { sortie = e.stdout; code = e.status; }
    assert.equal(code, 1, "un fichier refusé : la commande sort en 1");
    const cli = JSON.parse(sortie);
    assert.equal(cli.length, cas.length);
    cas.forEach((c, i) => {
      const app = validerUnLivre(c.octets);
      assert.equal(cli[i].etat, app.etat, `${c.nom} : le même verdict`);
      if (app.etat === "valide") assert.deepEqual([cli[i].id, cli[i].nom, cli[i].auteur], [app.id, app.nom, app.auteur]);
      else assert.deepEqual(cli[i].fautes, app.fautes, `${c.nom} : les mêmes fautes, dans le même ordre`);
    });
    /* et le modèle seul : la commande sort en 0 */
    assert.equal(execFileSync(process.execPath, [path.join(ROOT, "tools", "verifier-catalog.mjs"), MODELE], { encoding: "utf8" }).startsWith("✅"), true);
  } finally {
    fs.rmSync(dossier, { recursive: true, force: true });
  }
});

/* ══ K4 — CE QUE LE JUGE ACCEPTE, LE MONTAGE NE LE REFUSE JAMAIS ══════════════════════════════════════ */

test("K4 — 🔴 CE QUE LE JUGE ACCEPTE, LE MONTAGE NE LE REFUSE JAMAIS — et sa phrase de secours n'est jamais servie", () => {
  const variantes = [
    (m) => { m.units = { distance: "m", weight: "kg" }; },
    (m) => { m.records.spell[SORT].attribution = { license: "CC-BY-4.0", author: "Someone" }; },
    (m) => { m.records.spell[SORT].source = { id: "my notebook", locator: "p. 3", version: "1" }; },
    (m) => { m.records.gear[OUTIL].op = "add"; m.records.gear[OUTIL].slug = "ash-chalk"; },
    (m) => { delete m.description; delete m.units; delete m.attribution.text; delete m.attribution.url; },
    (m) => { m.lang = "fr"; for (const [g, e] of Object.entries(m.records)) m.records[g] = Object.fromEntries(Object.entries(e).map(([k, v]) => [k.replace(":en:", ":fr:"), v])); }
  ];
  for (const [i, v] of variantes.entries()) {
    const m = modele();
    v(m);
    const octets = enOctets(m);
    assert.equal(verifierUnCatalog(octets).etat, "valide", `variante ${i} acceptée`);
    assert.doesNotThrow(() => readLayer(octets, `variante-${i}`), `variante ${i} : le montage l'accepte`);
  }
  for (const f of FAUTIFS) {
    const v = verifierUnCatalog(octetsFautifs(f));
    assert.equal(v.fautes.some((x) => /^The app could not read this file/.test(x.phrase)), false,
      `${f.nom} : ⛔ la phrase de secours n'est jamais servie — le juge a nommé la faute lui-même`);
  }
});

/* ══ K5 — LES CHAMPS EXIGÉS VIENNENT DE LA DONNÉE ═══════════════════════════════════════════════════ */

test("K5 — 📏 `CHAMPS_EXIGES` n'invente rien : chaque champ est porté par TOUS les records SRD du genre, avec ce type ; chaque liste fermée est celle du SRD", () => {
  const srd = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", "srd-5.2.1-en.layer.json"), "utf8"));
  const typeDe = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);
  assert.deepEqual(Object.keys(CHAMPS_EXIGES).sort(), [...GENRES_DU_CATALOG].sort());
  for (const g of GENRES_DU_CATALOG) {
    assert.ok(GENRES.includes(g), `${g} est un genre du contrat`);
    const records = Object.values(srd.records[g]).map((r) => r.data);
    for (const { champ, types, valeurs } of CHAMPS_EXIGES[g]) {
      for (const d of records) {
        assert.ok(champ in d, `${g}.${champ} : chaque record SRD le porte`);
        assert.ok(types.includes(typeDe(d[champ])), `${g}.${champ} : type ${typeDe(d[champ])} déclaré`);
      }
      if (valeurs) assert.deepEqual([...valeurs].sort(), [...new Set(records.map((d) => d[champ]))].sort(), `${g}.${champ} : la liste fermée est celle du SRD`);
    }
  }
});

/* ══ K6 — LES NOMS DE L'APP ═════════════════════════════════════════════════════════════════════════ */

test("K6 — 🏷️ LES NOMS DE L'APP : chaque couche servie, chaque livre connu est un nom de l'app — refusé comme id de catalog", () => {
  const surLeDisque = fs.readdirSync(path.join(ROOT, "layers")).filter((f) => f.endsWith(".layer.json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "layers", f), "utf8")).id);
  const ids = [...new Set([...surLeDisque, ...LAYER_FILES.map((f) => f.replace(/\.layer\.json$/, "")), ...RULE_LAYER_IDS, ...LIVRES_DU_JOUEUR.map((l) => l.id)])];
  for (const id of ids) {
    assert.equal(estUnNomDeLApp(id), true, `${id} est un nom de l'app`);
    const m = modele();
    m.id = id;
    const v = verifierUnCatalog(enOctets(m));
    assert.ok(v.etat === "refus" && v.fautes.some((f) => f.chemin === "id"), `⛔ « ${id} » refusé comme id de catalog`);
  }
  /* et le premier segment de chaque record de l'app est un espace de noms réservé */
  for (const f of fs.readdirSync(path.join(ROOT, "layers")).filter((x) => x.endsWith(".layer.json"))) {
    const couche = JSON.parse(fs.readFileSync(path.join(ROOT, "layers", f), "utf8"));
    for (const entrees of Object.values(couche.records)) {
      for (const rid of Object.keys(entrees)) assert.ok(rid.split(":")[0] in ESPACES_DE_L_APP, `${rid} (${f}) vit sous un espace de l'app`);
    }
  }
  assert.equal(estUnNomDeLApp(ID), false, "le modèle, lui, n'en est pas un");
});

/* ══ K7 — IMPORTÉ, MONTÉ, ALLUMÉ, EFFACÉ ════════════════════════════════════════════════════════════ */

test("K7 — 🔌 UN CATALOG IMPORTÉ SE MONTE, S'ALLUME ET S'EFFACE COMME UN LIVRE — et un fichier posé à la main est jugé au montage", async () => {
  const base = baseDeFixture();
  const librairie = creerLibrairie(librairieAppareil(base));
  assert.deepEqual(await librairie.ranger(octetsDuModele()), { ok: true, id: ID, nom: "Emberwood (model catalog)", auteur: "SOWLREACH" });
  /* un fichier posé À LA MAIN, jamais passé par l'import : il se juge au montage */
  const m = modele(); m.id = "someone-bad"; delete m.attribution.author;
  await base.ecrire("livres", "someone-bad", enOctets(m));

  let engine = await moteur(() => livresDuLieu(librairie));
  const pile = engine.layers.verbs.stack();
  const monte = pile.find((c) => c.id === ID);
  assert.ok(monte, "⭐ le catalog se monte depuis le lieu");
  assert.equal(monte.enabled, false, "ÉTEINT : c'est le document qui dit ce qui est allumé");
  assert.ok(pile.findIndex((c) => c.id === ID) < pile.findIndex((c) => c.id === "fh-species-en"), "sous Fate's Hand");
  assert.deepEqual(engine.cataloguesDuLieu, [{ id: ID, nom: "Emberwood (model catalog)", auteur: "SOWLREACH" }]);
  assert.equal(pile.some((c) => c.id === "someone-bad"), false, "⛔ le fichier posé à la main, fautif, ne se monte pas");
  const refus = engine.livresRefuses.find((r) => r.id === "someone-bad");
  assert.ok(refus, "…et il se DIT");
  assert.match(refus.raison, /^attribution\.author — Missing\./);

  assert.equal(engine.layers.verbs.query({ kind: "spell", id: SORT }), null, "éteint : son sort n'est pas lu");
  engine.layers.verbs.enable({ id: ID });
  assert.equal(engine.layers.verbs.query({ kind: "spell", id: SORT }).record.name, "Ember Lance", "⭐ allumé : son sort se lit");
  assert.equal(engine.layers.verbs.query({ kind: "spell", id: "srd:spell:en:fire-bolt" }).record.name, "Fire Bolt", "et le SRD n'a rien perdu");

  assert.deepEqual(await librairie.effacer(ID), { ok: true });
  engine = await moteur(() => livresDuLieu(librairie));
  assert.equal(engine.layers.verbs.stack().some((c) => c.id === ID), false, "⭐ effacé : il ne se monte plus");
});

/* ══ K8 — LAYERS ═════════════════════════════════════════════════════════════════════════════════════ */

test("K8 — 🎛️ LAYERS montre le catalog : son nom, « by <author> », `catalog`, l'interrupteur et la poubelle — ou dit pourquoi pas", () => {
  const doc = (declares = []) => ({ schema: "fh-char/1", id: "k", name: "Kara", build: { layers: [{ id: SRD_LAYER_ID }, ...declares.map((id) => ({ id }))], choices: [], budgets: {}, overrides: [] } });
  const pile = [{ id: SRD_LAYER_ID, enabled: true }, { id: ID, name: "Emberwood (model catalog)", enabled: false }];
  const ctx = { pile, lieuDesLivres: { etat: "liste", ids: [ID] }, cataloguesDuLieu: [{ id: ID, nom: "Emberwood (model catalog)", auteur: "SOWLREACH" }] };
  const gestes = [];
  const n = renderLayersEcran({ document: doc(), ...ctx }, (a) => gestes.push(a));
  const ligne = n.querySelectorAll(`[data-ligne-livre="${ID}"]`)[0];
  assert.ok(ligne, "une ligne pour le catalog");
  assert.match(ligne.textContent, /Emberwood \(model catalog\)/);
  assert.match(ligne.textContent, /by SOWLREACH/, "⭐ son auteur, à la place de « your copy »");
  assert.match(ligne.textContent, /catalog/);
  assert.equal(/engine|world/.test(ligne.querySelectorAll(".ligne-familles")[0].textContent), false, "⛔ famille catalog seulement");
  const trash = ligne.querySelectorAll(".poubelle")[0];
  assert.equal(trash.disabled, false, "il vit dans le lieu : sa poubelle s'allume");
  trash.click();
  assert.deepEqual(gestes.pop(), { kind: "demanderEffacerUnLivre", id: ID });
  /* déclaré par le perso, absent de cet appareil */
  const absent = renderLayersEcran({ document: doc([ID]), pile: [pile[0]], lieuDesLivres: { etat: "liste", ids: [] } }, () => {});
  assert.match(absent.querySelectorAll(`[data-livre="${ID}"]`)[0].textContent, /not on this device/);
  /* refusé au montage */
  const refuse = renderLayersEcran({ document: doc(), pile: [pile[0]], livresRefuses: [{ id: "someone-bad", raison: "attribution.author — Missing." }] }, () => {});
  assert.match(refuse.querySelectorAll(`[data-livre="someone-bad"]`)[0].textContent, /unreadable: attribution\.author — Missing\./);
  /* ⛔ jamais une couche de l'app comme catalog */
  const tout = renderLayersEcran({ document: doc(), pile: [pile[0], { id: "fh-species-en", enabled: false }] }, () => {});
  assert.equal(tout.querySelectorAll(`[data-ligne-livre="fh-species-en"], [data-livre="fh-species-en"]`).length, 0);
});

/* ══ K9 — LE MENU ET LE RECALAGE ═════════════════════════════════════════════════════════════════════ */

test("K9 — 📖 LE MENU écrit le catalog par son nom dans `Books` ; ⛔ LE RECALAGE ne l'efface pas d'un perso quand il manque", () => {
  const doc = { schema: "fh-char/1", id: "k", name: "Kara", lang: "en", units: { distance: "ft", weight: "lb" },
    build: { layers: [{ id: SRD_LAYER_ID }, { id: "srfh-shelving-en" }, { id: "srfh-mecaniques-en" }, { id: ID }], choices: [], budgets: {}, overrides: [] } };
  assert.deepEqual(currentBooks(doc), [ID]);
  const avec = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, pile: [{ id: SRD_LAYER_ID }, { id: ID, name: "Emberwood (model catalog)" }] }, () => {});
  const books = (n) => n.querySelectorAll('.tdc-ligne-lue[data-ligne="books"] .tdc-ligne-valeur')[0].textContent;
  assert.equal(books(avec), "SRD · Emberwood (model catalog)", "⭐ par son NOM, tel que la pile le porte");
  const sans = renderUniverseStep({ document: doc, query: () => null, fieldErrors: {}, pile: [{ id: SRD_LAYER_ID }] }, () => {});
  assert.equal(books(sans), `SRD · ${ID}`, "absent : son id");
  assert.equal(sans.querySelectorAll(".tdc-livre-absent")[0].textContent, ID, "…en ROUGE (le lot 388)");
  /* le recalage */
  const c = (id, hash) => ({ id, version: "1", hash });
  assert.equal(recalageDeLaPile([c(SRD_LAYER_ID, "a"), c(ID, "x")], [c(SRD_LAYER_ID, "A")]), null,
    "⛔ un catalog absent de cet appareil n'est pas une mise à jour : le perso le garde");
  assert.deepEqual(recalageDeLaPile([c(SRD_LAYER_ID, "a"), c("fh-retiree-en", "r")], [c(SRD_LAYER_ID, "A")]).changees, [SRD_LAYER_ID, "fh-retiree-en"],
    "une couche retirée du produit, elle, se recale — les noms de l'app la séparent d'un catalog");
});

/* ══ K10 — LE REFUS, LE GUIDE, LE LEXIQUE ═══════════════════════════════════════════════════════════ */

test("K10 — 🪟 LE REFUS DIT LES FAUTES ; LE GUIDE dit chaque champ exigé, le modèle et le texte pour l'IA ; ⛔ jamais « homebrew »", () => {
  const m = modele();
  delete m.attribution.author;
  m.flags = ["fh.destiny"];
  for (const k of ["school", "range", "duration"]) delete m.records.spell[SORT].data[k];
  const issue = validerUnLivre(enOctets(m));
  const texte = texteDuRefusDImport({ raison: issue.raison, fautes: issue.fautes });
  const lignes = texte.split("\n").filter((l) => l.startsWith("· "));
  assert.equal(lignes.length, FAUTES_DANS_LA_FENETRE, "les premières fautes, pas toutes : la fenêtre ne défile pas");
  assert.equal(lignes[0], `· ${fauteEnLigne(issue.fautes[0])}`, "chacune avec son chemin");
  assert.match(texte, /^This catalog was not imported\. \d+ things to fix:/);
  assert.match(texte, new RegExp(`…and ${issue.fautes.length - FAUTES_DANS_LA_FENETRE} more\\. Fix them, then import the file again\\.$`));
  assert.equal(texteDuRefusDImport({ raison: "the judge said so" }), "This book was not imported: the judge said so", "un livre connu : la raison de son juge (lot 388)");

  const guide = fs.readFileSync(path.join(ROOT, "docs", "CATALOG.md"), "utf8");
  for (const [g, champs] of Object.entries(CHAMPS_EXIGES)) {
    const ligne = guide.split("\n").find((l) => l.startsWith(`| \`${g}\` |`));
    assert.ok(ligne, `le guide a une ligne pour ${g}`);
    for (const { champ, valeurs } of champs) {
      assert.ok(ligne.includes(`\`${champ}\``), `le guide nomme ${g}.${champ}`);
      for (const v of valeurs || []) assert.ok(ligne.includes(`\`${v}\``), `…et sa valeur ${v}`);
    }
  }
  assert.match(guide, /examples\/catalog-modele\.layer\.json/, "le guide mène au modèle");
  assert.match(guide, /## The text to paste into an AI\n[\s\S]*```\nYou write a catalog for SOWLREACH/, "le texte pour l'IA");
  assert.match(guide, /importing the second\s+\*\*replaces\*\* the first/, "deux catalogs du même id : le second remplace le premier (Q1)");
  assert.match(guide, /\*\*Subclasses\.\*\*/, "la sous-classe, dite honnêtement");
  /* ⛔ le lexique : « homebrew » ne s'écrit nulle part où un joueur lit */
  const layers = renderLayersEcran({ document: { schema: "fh-char/1", id: "k", name: "K", build: { layers: [{ id: SRD_LAYER_ID }], choices: [], budgets: {}, overrides: [] } },
    pile: [{ id: SRD_LAYER_ID, enabled: true }, { id: ID, name: "Emberwood (model catalog)", enabled: false }], cataloguesDuLieu: [{ id: ID, nom: "E", auteur: "A" }] }, () => {});
  for (const [ou, t] of [["le guide", guide], ["Layers", layers.textContent], ["le refus", texte], ["le modèle", fs.readFileSync(MODELE, "utf8")]]) {
    assert.equal(/homebrew/i.test(t), false, `⛔ « homebrew » dans ${ou}`);
  }
});
