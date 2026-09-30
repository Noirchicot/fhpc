/* ══ LOT 360 — CHAQUE PHRASE DE CHOIX DU NIVEAU 1 EST DÉCLARÉE ═══════════════
   Mandat : vault `FH-WEB/FHPC/FHPC lot 360 choix tus.md` (ARCHI 35, 29/09).

   LE DÉFAUT. En SRD, le builder annonçait des choix de règle sans les
   proposer : le Gnome lisait « Choose one of the following options… » puis
   disait « settled » ; le Druid rangeait Primal Order dans « Granted
   automatically ». Cause commune, relevée par la donnée : LA COUCHE NE
   DÉCLARAIT PAS LE CHOIX. Aucune garde ne pouvait le voir : elle aurait lu les
   plans, et c'est justement le plan qui manquait.

   ⭐ CE QUE CETTE GARDE LIT, ET CE QU'ELLE NE LIT PAS. Elle lit le TEXTE, pas
   les plans. Toute la donnée d'un record de niveau 1 — espèce, classe,
   arrière-plan, et don d'origine ou don offert par un plan du niveau 1 (les
   quatre familles du mandat) —, textes Fate's Hand compris (fiche, lore,
   blurb). ⛔ Ne s'exclut que ce que la DONNÉE date après le niveau 1 : un objet
   qui porte `level` > 1, une clef-palier entière > 1 (les paliers de lignée).
   C'est la liste inversée (ARCHI 35, Q1) : on nomme ce qui sort, par la
   donnée, jamais les champs qu'on lit — une liste de champs lus serait
   incomplète par construction.

   ⭐ LA FORME TROUVE, LA DONNÉE TRANCHE. `CHOIX` ci-dessous ne sert qu'à
   TROUVER les occurrences (« choose », « of your choice »…). Chacune doit être
   couverte par une DÉCLARATION de la couche qui écrit ce texte, sous sa clef
   `data[choix_du_texte:<id de la couche>]` — une clef par couche, un seul
   écrivain chacune (constat du lot : vingt fichiers de test montent des
   couches Fate's Hand sans `srfh-mecaniques-en`, un objet partagé les aurait
   fait jeter). Quatre natures :
     · `creation`   — nomme l'ÉTAPE et le CHEMIN du document qui posent le
                      choix ; cette garde vérifie que l'étape est montée et
                      que le chemin s'écrit bien au document (par le plan et
                      sa porte, ou par l'écrivain de l'étape) ;
     · `en-jeu`     — un choix de table (le souffle, l'appareil du Rock
                      Gnome, la Rage…), `quand` dit quand ;
     · `montee`     — un choix du passage de niveau, rangé pour le futur lot
                      Level up : `niveaux` (liste, "chaque", "table",
                      "multiclasse") et `quoi` ;
     · `hors-choix` — le mot ne désigne pas un choix, `pourquoi` le cite.
   Quand deux couches couvrent la même occurrence, la couche du DESSUS fait
   foi, comme partout dans la pile.

   ⭐ LA DETTE EST NOMMÉE ICI, PAS DANS LA COUCHE (ARCHI 35, Q2). Chaque ligne
   renvoie à SA ligne du relevé dans le mandat (« relevé 360 #6 ») et rougit
   dans les deux sens : si un choix non déclaré apparaît (la dette grandit), et
   si une ligne ne trouve plus d'occurrence non déclarée (le trou est comblé,
   ou le texte a changé) — un lot qui comble un trou ÔTE SA LIGNE.

   ⚠️ LIMITE, DITE : les sorts et les invocations offerts au niveau 1 ne sont
   pas lus — ils ne sont pas dans les quatre familles du mandat. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createTestDocument } from "./dom-stub.mjs";
import { ROOT, makeHarness, manifestOf, PILE_SRD } from "./build-harness.mjs";

globalThis.document = createTestDocument();
const { PILE } = await import("../src/tools/exemple-fh-en.mjs");
const { createFhDestinyStat } = await import("../src/modules/fh/destiny-stat.mjs");
const { createFhSkillPoolStat } = await import("../src/modules/fh/skill-pool.mjs");
const { createFhSpeciesTraits } = await import("../src/modules/fh/species-traits.mjs");
const { itemsDeLEtape } = await import("../ui/builder/parcours.mjs");
const { ceinture } = await import("../ui/builder/etapes.mjs");
const {
  departsDuPersonnage, butinDuDepart, appliquerLeButin, cheminDuDepart, cheminDeLOutil,
  CHEMIN_DEPENSE_SKILLS, outilsChoisisDansSkills
} = await import("../ui/builder/equipment-step.mjs");
const { skillsCheminsDeReset } = await import("../ui/builder/skills-step.mjs");

/* ══ LA FORME : elle TROUVE les occurrences, elle ne décide rien ════════════ */
const CHOIX = /\b(choose|chosen|choosing|of (?:your|their) choice|one of the following|you select|select one|your choice)\b/gi;
const PREFIXE = "choix_du_texte:";
const CLEF_EXACTE = /^choix_du_texte:[a-z0-9][a-z0-9-]*$/;
/* Une clef qui RESSEMBLE au préfixe sans le respecter accuse (ARCHI 35, 29/09) :
   `choix-du-texte:…`, `choixDuTexte`, `choix_du_text:…` passeraient sinon en silence. */
const ressembleAuPrefixe = (clef) => /choix.*text/.test(String(clef).toLowerCase().replace(/[^a-z]/g, ""));
const NATURES = {
  creation: ["etape", "chemin"],
  "en-jeu": ["quand"],
  montee: ["niveaux", "quoi"],
  "hors-choix": ["pourquoi"]
};
const NIVEAUX_NOMMES = ["chaque", "table", "multiclasse"];
/* 🔄 LOT 365 — UNE PORTE DE CAPACITÉ DE CLASSE DIT SA PORTÉE (ARCHI 35, 29/09) : `entiere`
   (la porte EST la capacité) ou `partielle` (elle n'en est qu'une part). Le champ est
   facultatif dans cette grammaire — `porte-entiere-jamais-acquise.test.mjs` l'EXIGE sur
   toute capacité de classe à porte — mais sa valeur et sa place se vérifient ici. */
const PORTEES = ["entiere", "partielle"];

/* ══ LES DEUX PILES RÉELLES ══════════════════════════════════════════════════ */
const PILES = { SRD: PILE_SRD, FH: PILE };
const MODULES = () => [createFhDestinyStat(), createFhSkillPoolStat(), createFhSpeciesTraits()];
const CATALOGUES = ["species", "class", "background"];

function docDe(h, choices) {
  return {
    schema: "fh-char/1", id: "garde-360", name: "Garde 360", lang: "en", units: { distance: "ft", weight: "lb" },
    created: "2026-09-29T00:00:00Z", modified: "2026-09-29T00:00:00Z",
    build: { layers: manifestOf(h.layers), choices: [{ path: "level", value: 1 }, ...choices], budgets: {}, overrides: [], confirmed: [] }
  };
}

/* ══ LE LECTEUR ══════════════════════════════════════════════════════════════ */
function* chaines(valeur, chemin = "data") {
  if (typeof valeur === "string") { yield [chemin, valeur]; return; }
  if (Array.isArray(valeur)) { for (let i = 0; i < valeur.length; i += 1) yield* chaines(valeur[i], `${chemin}[${i}]`); return; }
  if (!valeur || typeof valeur !== "object") return;
  /* ⛔ SEULE LA DONNÉE EXCLUT : un objet daté après le niveau 1 */
  if (Number.isInteger(valeur.level) && valeur.level > 1) return;
  for (const [clef, x] of Object.entries(valeur)) {
    if (chemin === "data" && clef.startsWith(PREFIXE)) continue;   // les déclarations ne sont pas du texte
    if (/^\d+$/.test(clef) && Number(clef) > 1) continue;          // un palier après le niveau 1
    yield* chaines(x, `${chemin}.${clef}`);
  }
}
const decoupe = (texte) => String(texte).split(/(?<=[.!?:])\s+|\n+/).map((s) => s.trim()).filter(Boolean);

/** Les phrases de choix d'une donnée : `[{phrase, ou, occurrences: [[debut, fin, mot]]}]`. */
export function phrasesDeChoix(data) {
  const parPhrase = new Map();
  for (const [ou, texte] of chaines(data || {})) {
    for (const phrase of decoupe(texte)) {
      const occurrences = [...phrase.matchAll(new RegExp(CHOIX.source, "gi"))]
        .map((m) => [m.index, m.index + m[0].length, m[0]]);
      if (occurrences.length === 0) continue;
      if (!parPhrase.has(phrase)) parPhrase.set(phrase, { phrase, ou: [], occurrences });
      parPhrase.get(phrase).ou.push(ou);
    }
  }
  return [...parPhrase.values()];
}
function portees(phrase, extrait) {
  const out = [];
  if (typeof extrait !== "string" || extrait === "") return out;
  for (let i = phrase.indexOf(extrait); i >= 0; i = phrase.indexOf(extrait, i + 1)) out.push([i, i + extrait.length]);
  return out;
}
const couvre = (spans, [a, b]) => spans.some(([x, y]) => x <= a && b <= y);

/** Les déclarations d'une donnée de record, avec le RANG de leur couche dans la pile. */
function declarationsDe(data, rangs) {
  const out = [];
  for (const [clef, objet] of Object.entries(data || {})) {
    if (!clef.startsWith(PREFIXE)) continue;
    const couche = clef.slice(PREFIXE.length);
    for (const [nom, d] of Object.entries(objet || {})) out.push({ couche, rang: rangs.has(couche) ? rangs.get(couche) : -1, nom, d });
  }
  return out;
}

/** ⭐ LA COUVERTURE D'UN RECORD — chaque occurrence, la ou les déclarations EN VIGUEUR
 *  (celles de la couche la plus haute qui la couvre), ou aucune. */
export function couverture(data, rangs) {
  const decls = declarationsDe(data, rangs);
  const occurrences = [];
  for (const ph of phrasesDeChoix(data)) {
    for (const occ of ph.occurrences) {
      const couvrantes = decls.filter((x) => couvre(portees(ph.phrase, x.d && x.d.extrait), occ));
      const haut = Math.max(-1, ...couvrantes.map((x) => x.rang));
      occurrences.push({ phrase: ph.phrase, ou: ph.ou, occ, enVigueur: couvrantes.filter((x) => x.rang === haut) });
    }
  }
  return { decls, occurrences };
}

/* ══ LES PILES MONTÉES, UNE FOIS ═════════════════════════════════════════════ */
const ETAT = {};
for (const [nom, couches] of Object.entries(PILES)) {
  const h = makeHarness({ layers: couches, modules: MODULES() });
  const q = (kind) => h.layers.verbs.query({ kind }) || [];
  const rangs = new Map(h.layers.verbs.stack().filter((c) => c.enabled).map((c, i) => [c.id, i]));
  const montees = new Set(ceinture(h.layers.verbs.flags()).map((c) => c.id));
  /* Les porteurs de dons : les plans du niveau 1 qui OFFRENT un don (options de genre `feat`). */
  const porteurs = new Map();
  const records = [];
  for (const kind of CATALOGUES) {
    for (const vue of q(kind)) {
      records.push({ kind, vue });
      const decisions = h.verbs.decisions({ document: docDe(h, [{ path: kind, ref: { kind, id: vue.id } }]) }).decisions || [];
      for (const plan of decisions) {
        for (const option of plan.options || []) {
          if (typeof option !== "string" || !q("feat").some((f) => f.id === option)) continue;
          if (!porteurs.has(option)) porteurs.set(option, []);
          porteurs.get(option).push({ kind, id: vue.id, path: plan.path,
            requis: Boolean(plan.provenance && plan.provenance.mode === "required") });
        }
      }
    }
  }
  for (const vue of q("feat")) {
    if ((vue.record.data || {}).category === "origin" || porteurs.has(vue.id)) records.push({ kind: "feat", vue });
  }
  ETAT[nom] = { h, q, rangs, montees, porteurs, records };
}

/* ══ LA DETTE — chaque ligne renvoie à SA ligne du relevé 360 (mandat) ═════════
   Les lignes OUVERTES du relevé, telles que le mandat les tient : une ligne de
   dette qui citerait un autre numéro rougit — un choix neuf se relève AVANT de
   se mettre en dette. */
/* 🧬 LOT 364 — #6 (Versatile) et #16 (Skilled) sont COMBLÉS : ils sortent d'ici. */
/* 🧬 LOT 373 — #4, #5 et #15 (« une valeur parmi N » : la caractéristique d'incantation des
   lignées et de Magic Initiate, la taille) sont COMBLÉS : leurs dix lignes sortent. */
const RELEVE_OUVERT = ["#10", "#11", "#12", "#13"];
const LES_DEUX = ["SRD", "FH"];
const DETTE = [
  /* #10 — l'Expertise du Roublard au niveau 1 (SRD : lot suivant ; FH : question à Eric) */
  { releve: "#10", piles: LES_DEUX, id: "srd:class:en:rogue", extrait: "You gain Expertise in two of your skill proficiencies of your choice" },
  /* #11 — Thieves' Cant, une langue de plus (avec les langues SRD, lot suivant) */
  { releve: "#11", piles: LES_DEUX, id: "srd:class:en:rogue", extrait: "one other language of your choice, which you choose from the language tables" },
  /* #12-13 — les outils du Barde et du Moine en SRD (porte à l'étape Class, lot suivant) ;
     en FH le pool les assume (`choix_du_texte:fh-skills-en`) */
  { releve: "#12", piles: ["SRD"], id: "srd:class:en:bard", extrait: "Choose 3 Musical Instruments" },
  { releve: "#12", piles: ["SRD"], id: "srd:class:en:bard", extrait: "Musical Instrument of your choice" },
  { releve: "#13", piles: ["SRD"], id: "srd:class:en:monk", extrait: "Choose one type of Artisan" },
  { releve: "#13", piles: ["SRD"], id: "srd:class:en:monk", extrait: "Musical Instrument chosen for the tool proficiency above" }
];
/* ⛔ LE COMPTE EST ÉPINGLÉ : un lot qui comble un trou ôte sa ligne ET baisse ce nombre ;
   le monter demande une ligne du relevé dans le mandat, jamais l'inverse. */
const DETTE_LIGNES = 6;   // lot 364 : 19 − #6 ×2 − #16 · lot 373 : 16 − #4 ×6 − #5 ×2 − #15 ×2

function detteDe(nomPile, id) {
  return DETTE.filter((l) => l.id === id && l.piles.includes(nomPile));
}

/* ══ LA VÉRIFICATION D'UNE DÉCLARATION « création » ═════════════════════════ */
/** Les documents qui PORTENT le record : lui-même pour un catalogue ; pour un don, chaque plan
 *  du niveau 1 qui l'offre — et, si la déclaration vise un chemin sous un plan, ceux-là seuls. */
function porteurDocs(etat, kind, id, chemin) {
  if (kind !== "feat") return [[{ path: kind, ref: { kind, id } }]];
  const sousUnPlan = typeof chemin === "string" && CATALOGUES.includes(chemin.split(/[.[]/)[0]);
  return (etat.porteurs.get(id) || [])
    .filter((p) => !sousUnPlan || chemin === p.path || chemin.startsWith(`${p.path}.`))
    .map((p) => [{ path: p.kind, ref: { kind: p.kind, id: p.id } },
      ...(p.requis ? [] : [{ path: p.path, ref: { kind: "feat", id } }])]);
}
function ancetres(chemin) {
  const out = [chemin];
  let c = chemin;
  while (true) {
    const sansIndice = c.replace(/\[\d+\]$/, "");
    const suivant = sansIndice !== c ? sansIndice : c.includes(".") ? c.slice(0, c.lastIndexOf(".")) : null;
    if (!suivant) break;
    out.push(suivant);
    c = suivant;
  }
  return out;
}
/** LE PLAN D'UN CHEMIN, QUITTE À RÉPONDRE À CE QUI LE PRÉCÈDE. Une porte peut en ouvrir une
 *  autre : en Fate's Hand, les tours de Magic Initiate n'existent qu'une fois la LISTE choisie
 *  (mesuré au lot 360). On répond donc, sous l'ancêtre le plus profond qui existe, aux plans
 *  ouverts à une seule réponse — la première option, en `ref` si c'est un record de la pile
 *  (l'id dit son genre : `source:genre:langue:slug`), en valeur sinon — et on relit. */
function planDuChemin(etat, choices, chemin) {
  let ajouts = [];
  for (let tour = 0; tour < 4; tour += 1) {
    const doc = docDe(etat.h, [...choices, ...ajouts]);
    const decisions = etat.h.verbs.decisions({ document: doc }).decisions || [];
    if (decisions.some((p) => p.path === chemin)) return { doc, decisions };
    const ancetre = ancetres(chemin).find((a) => decisions.some((p) => p.path === a));
    if (!ancetre) return { doc, decisions };
    /* 🧬 LOT 373 — …et l'ancêtre LUI-MÊME s'il est ouvert : la caractéristique d'une lignée
       (`species.lineage[0].ability`) n'existe qu'une fois `species.lineage[0]` répondu. */
    const ouverts = decisions.filter((p) => (p.path === ancetre || p.path.startsWith(`${ancetre}.`)) && p.expected === 1 &&
      p.answered < 1 && Array.isArray(p.options) && p.options.length > 0);
    if (ouverts.length === 0) return { doc, decisions };
    ajouts = [...ajouts, ...ouverts.map((p) => {
      const option = p.options[0];
      const genre = typeof option === "string" ? option.split(":")[1] : null;
      const record = genre && (etat.h.layers.verbs.query({ kind: genre }) || []).some((v) => v.id === option);
      return record ? { path: p.path, ref: { kind: genre, id: option } } : { path: p.path, value: option };
    })];
  }
  const doc = docDe(etat.h, [...choices, ...ajouts]);
  return { doc, decisions: etat.h.verbs.decisions({ document: doc }).decisions || [] };
}
function outilsDeLaFamille(etat, doc, famille) {
  return etat.q("tool").filter((vue) => typeof vue.record.slug === "string" && outilsChoisisDansSkills({
    query: etat.h.layers.verbs.query, famille,
    document: { ...doc, build: { ...doc.build, choices: [...doc.build.choices, { path: `${CHEMIN_DEPENSE_SKILLS}${vue.record.slug}`, value: "novice" }] } }
  }).length === 1);
}

/** Rend la liste des fautes d'une déclaration « création » dans une pile ([] = juste). */
export function fautesDeCreation(etat, { kind, id }, d) {
  const fautes = [];
  if (!etat.montees.has(d.etape)) return [`l'étape « ${d.etape} » n'est pas montée dans cette pile`];
  const docs = porteurDocs(etat, kind, id, d.chemin);
  if (docs.length === 0) return [`aucun plan du niveau 1 ne porte ce ${kind}`];
  const query = etat.h.layers.verbs.query;
  for (const choices of docs) {
    const doc = docDe(etat.h, choices);
    if (CATALOGUES.includes(d.etape)) {
      /* ── la porte d'un plan : le plan existe, et lui ou un ancêtre est une porte de l'étape ── */
      if (!d.chemin.startsWith(`${d.etape}.`)) { fautes.push(`le chemin « ${d.chemin} » n'est pas sous l'étape « ${d.etape} »`); continue; }
      const { doc: repondu, decisions } = planDuChemin(etat, choices, d.chemin);
      if (!decisions.some((p) => p.path === d.chemin)) { fautes.push(`aucun plan « ${d.chemin} » au document`); continue; }
      const portes = new Set(itemsDeLEtape({ decisions, document: repondu, racine: d.etape }).map((i) => i.path));
      if (!ancetres(d.chemin).some((c) => portes.has(c))) fautes.push(`le plan « ${d.chemin} » n'a pas de porte à l'étape « ${d.etape} »`);
    } else if (d.etape === "equipment") {
      /* ── l'écrivain d'Equipment : la question existe, et sa réponse s'écrit au document ── */
      const genre = kind;
      const source = departsDuPersonnage({ query, document: doc }).find((s) => s.genre === genre);
      if (!source) { fautes.push(`Equipment ne pose aucune question pour un ${genre}`); continue; }
      let docu = doc;
      const reponses = { [genre]: source.options[0] && source.options[0].lettre };
      if (d.chemin === cheminDuDepart(genre)) {
        if (source.options.length < 2) { fautes.push(`Equipment ne propose pas de choix de départ (${source.options.length} option)`); continue; }
      } else if (d.chemin === cheminDuDepart(cheminDeLOutil(genre))) {
        const option = source.options.find((o) => (o.outils || []).length > 0);
        if (!option) { fautes.push("aucune option du départ ne renvoie à un outil choisi"); continue; }
        reponses[genre] = option.lettre;
        const deux = outilsDeLaFamille(etat, doc, option.outils[0].from_family).slice(0, 2);
        if (deux.length < 2) { fautes.push("moins de deux outils de la famille à proposer"); continue; }
        docu = { ...doc, build: { ...doc.build, choices: [...doc.build.choices,
          ...deux.map((v) => ({ path: `${CHEMIN_DEPENSE_SKILLS}${v.record.slug}`, value: "novice" }))] } };
        reponses[cheminDeLOutil(genre)] = deux[0].id;
      } else { fautes.push(`« ${d.chemin} » n'est pas un chemin qu'Equipment écrit`); continue; }
      const butin = butinDuDepart({ query, document: docu, reponses });
      const apres = appliquerLeButin({ document: docu, verbs: etat.h.verbs, query, butin });
      if (!apres.build.choices.some((c) => c.path === d.chemin)) fautes.push(`Equipment n'écrit pas « ${d.chemin} » au document`);
    } else if (d.etape === "skills") {
      /* ── l'écrivain de Skills : la famille de chemins que Skills écrit, que Reset efface et
            qu'Equipment relit — trois lecteurs d'accord, sinon le chemin est faux ── */
      const sonde = `${d.chemin}.sonde`;
      if (`${d.chemin}.` !== CHEMIN_DEPENSE_SKILLS) fautes.push(`« ${d.chemin} » n'est pas la famille des dépenses de Skills (${CHEMIN_DEPENSE_SKILLS})`);
      else if (!skillsCheminsDeReset({ build: { choices: [{ path: sonde, value: "novice" }] } }).includes(sonde)) fautes.push("Skills ne reconnaît pas ce chemin comme le sien");
    } else {
      fautes.push(`aucun vérificateur pour l'étape « ${d.etape} » — une déclaration nomme une étape que cette garde ne sait pas relire`);
    }
  }
  return [...new Set(fautes)];
}

function forme(d) {
  if (!d || typeof d !== "object") return ["n'est pas un objet"];
  const fautes = [];
  if (!Object.hasOwn(NATURES, d.nature)) return [`nature inconnue « ${d.nature} »`];
  if (typeof d.extrait !== "string" || !new RegExp(CHOIX.source, "i").test(d.extrait)) fautes.push("l'extrait ne contient aucun mot de choix");
  for (const champ of NATURES[d.nature]) if (d[champ] === undefined || d[champ] === "") fautes.push(`\`${champ}\` manque`);
  const permis = new Set(["extrait", "nature", "note", ...NATURES[d.nature], ...(d.nature === "creation" ? ["portee"] : [])]);
  for (const champ of Object.keys(d)) if (!permis.has(champ)) fautes.push(`champ inconnu \`${champ}\``);
  if (d.portee !== undefined) {
    if (d.etape !== "class") fautes.push(`\`portee\` n'a de sens que sur une porte de l'étape Class (étape « ${d.etape} »)`);
    else if (!PORTEES.includes(d.portee)) fautes.push(`portee « ${d.portee} » : ${PORTEES.join(" ou ")}`);
  }
  if (d.nature === "montee") {
    const n = d.niveaux;
    const juste = NIVEAUX_NOMMES.includes(n) || (Array.isArray(n) && n.length > 0 && n.every((x) => Number.isInteger(x) && x >= 2));
    if (!juste) fautes.push(`niveaux « ${JSON.stringify(n)} » : une liste d'entiers ≥ 2 ou ${NIVEAUX_NOMMES.join(", ")}`);
  }
  return fautes;
}

/* ══════════════════════════════════════════════════════════════════════════ */

test("🔎 le lecteur lit les quatre familles dans les deux piles, et trouve des choix", () => {
  for (const [nom, etat] of Object.entries(ETAT)) {
    const kinds = new Set(etat.records.map((r) => r.kind));
    for (const kind of [...CATALOGUES, "feat"]) assert.ok(kinds.has(kind), `${nom} : aucun record « ${kind} » lu`);
    const n = etat.records.reduce((s, r) => s + phrasesDeChoix(r.vue.record.data).length, 0);
    assert.ok(n > 50, `${nom} : ${n} phrases de choix seulement — le lecteur ne lit plus`);
  }
});

test("⭐ toute occurrence de choix du niveau 1 est déclarée — ou nommée dans la dette du relevé 360", () => {
  const fautes = [];
  for (const [nom, etat] of Object.entries(ETAT)) {
    for (const { vue } of etat.records) {
      const { occurrences } = couverture(vue.record.data, etat.rangs);
      const dette = detteDe(nom, vue.id);
      for (const o of occurrences) {
        if (o.enVigueur.length > 0) continue;
        if (dette.some((l) => couvre(portees(o.phrase, l.extrait), o.occ))) continue;
        fautes.push(`${nom} ${vue.id} « ${o.occ[2]} » (${o.ou[0]}) : ${o.phrase.slice(0, 140)}`);
      }
    }
  }
  assert.deepEqual(fautes, [], "un choix du niveau 1 sans déclaration — déclare-le dans la couche qui écrit ce texte " +
    "(création : l'étape et le chemin ; en jeu ; montée ; hors-choix), ou relève-le avant de le mettre en dette");
});

test("📋 chaque déclaration est bien formée, et EN VIGUEUR sur au moins une occurrence d'une pile", () => {
  const vues = new Map();   // couche · record · nom → en vigueur quelque part ?
  const fautes = [];
  for (const [nom, etat] of Object.entries(ETAT)) {
    for (const { vue } of etat.records) {
      const { decls, occurrences } = couverture(vue.record.data, etat.rangs);
      for (const x of decls) {
        const clef = `${x.couche} · ${vue.id} · ${x.nom}`;
        if (x.rang < 0) fautes.push(`${nom} ${clef} : la couche « ${x.couche} » n'est pas montée dans cette pile`);
        for (const f of forme(x.d)) fautes.push(`${clef} : ${f}`);
        if (!vues.has(clef)) vues.set(clef, false);
      }
      for (const o of occurrences) for (const x of o.enVigueur) vues.set(`${x.couche} · ${vue.id} · ${x.nom}`, true);
    }
  }
  for (const [clef, enVigueur] of vues) if (!enVigueur) fautes.push(`${clef} : ne couvre aucune occurrence en vigueur — orpheline, ou éclipsée partout`);
  assert.deepEqual([...new Set(fautes)], []);
});

test("🚪 une déclaration « création » nomme une étape montée, et son chemin s'écrit au document", () => {
  const fautes = [];
  let vues = 0;
  for (const [nom, etat] of Object.entries(ETAT)) {
    for (const { kind, vue } of etat.records) {
      const { occurrences } = couverture(vue.record.data, etat.rangs);
      const enVigueur = new Map();
      for (const o of occurrences) for (const x of o.enVigueur) if (x.d.nature === "creation") enVigueur.set(`${x.couche}·${x.nom}`, x);
      for (const x of enVigueur.values()) {
        vues += 1;
        for (const f of fautesDeCreation(etat, { kind, id: vue.id }, x.d)) fautes.push(`${nom} ${vue.id} [${x.couche} · ${x.nom}] ${f}`);
      }
    }
  }
  assert.ok(vues > 100, `${vues} déclarations de création vérifiées seulement`);
  assert.deepEqual(fautes, []);
});

test("🧾 la dette : chaque ligne cite le relevé 360 et désigne un choix encore non déclaré, dans chaque pile qu'elle nomme", () => {
  assert.equal(DETTE.length, DETTE_LIGNES, "la dette ne grandit pas ; un lot qui comble un trou ôte sa ligne et baisse ce compte");
  const fautes = [];
  for (const ligne of DETTE) {
    if (!RELEVE_OUVERT.includes(ligne.releve)) fautes.push(`${ligne.id} : « relevé 360 ${ligne.releve} » n'est pas une ligne ouverte du relevé`);
    for (const nom of ligne.piles) {
      const etat = ETAT[nom];
      const r = etat.records.find((x) => x.vue.id === ligne.id);
      const libres = r ? couverture(r.vue.record.data, etat.rangs).occurrences
        .filter((o) => o.enVigueur.length === 0 && couvre(portees(o.phrase, ligne.extrait), o.occ)) : [];
      if (libres.length === 0) fautes.push(`${nom} ${ligne.id} « ${ligne.extrait} » (relevé 360 ${ligne.releve}) : aucune occurrence non déclarée — trou comblé ou texte changé : ôte la ligne`);
    }
  }
  assert.deepEqual(fautes, []);
});

test("🚪 tout plan offert au niveau 1 a une porte dans une étape montée", () => {
  const fautes = [];
  for (const [nom, etat] of Object.entries(ETAT)) {
    for (const { kind, vue } of etat.records.filter((r) => CATALOGUES.includes(r.kind))) {
      assert.ok(etat.montees.has(kind), `${nom} : l'étape « ${kind} » n'est pas montée`);
      const doc = docDe(etat.h, [{ path: kind, ref: { kind, id: vue.id } }]);
      const decisions = etat.h.verbs.decisions({ document: doc }).decisions || [];
      const portes = new Set(itemsDeLEtape({ decisions, document: doc, racine: kind }).map((i) => i.path));
      for (const plan of decisions) {
        if (typeof plan.path !== "string" || !plan.path.startsWith(`${kind}.`)) continue;
        if (plan.provenance && plan.provenance.mode === "required") continue;
        if (!ancetres(plan.path).some((c) => portes.has(c))) fautes.push(`${nom} ${vue.id} : le plan « ${plan.path} » n'a pas de porte`);
      }
    }
  }
  assert.deepEqual(fautes, []);
});

test("🔑 les clefs : chacune porte l'id de la couche qui l'écrit (lu dans la couche), et aucune ne ressemble au préfixe sans le respecter", () => {
  const fautes = [];
  const dossier = path.join(ROOT, "layers");
  for (const fichier of fs.readdirSync(dossier).filter((f) => f.endsWith(".layer.json"))) {
    const couche = JSON.parse(fs.readFileSync(path.join(dossier, fichier), "utf8"));
    for (const [kind, genre] of Object.entries(couche.records || {})) {
      for (const [id, entree] of Object.entries(genre || {})) {
        const clefs = [
          ...Object.keys((entree && entree.data) || {}),
          ...Object.keys((entree && entree.changes) || {}).map((p) => {
            const m = /^data(?:\.([A-Za-z][A-Za-z0-9]*)|\[([^\]]+)\])/.exec(p);
            return m ? (m[1] || m[2]) : "";
          })
        ];
        for (const clef of clefs) {
          if (!ressembleAuPrefixe(clef)) continue;
          if (!CLEF_EXACTE.test(clef)) fautes.push(`${fichier} ${kind} ${id} : « ${clef} » ressemble au préfixe « ${PREFIXE} » sans le respecter`);
          else if (clef.slice(PREFIXE.length) !== couche.id) fautes.push(`${fichier} ${kind} ${id} : « ${clef} » — la couche « ${couche.id} » écrit la clef d'une autre`);
        }
      }
    }
  }
  assert.deepEqual(fautes, []);
});

/* ══ LES TÉMOINS — la garde sait ACCUSER (un témoin qui ne peut accuser est le pire) ══ */

test("⚔️ témoin : un choix AJOUTÉ DEMAIN au texte, sans déclaration, est accusé", () => {
  const etat = ETAT.SRD;
  const gnome = etat.records.find((r) => r.vue.id === "srd:species:en:gnome").vue.record.data;
  const avant = couverture(gnome, etat.rangs).occurrences.filter((o) => o.enVigueur.length === 0).length;
  const demain = structuredClone(gnome);
  demain.traits.push({ id: "demain", name: "Tomorrow", text: "Choose a favorite color from the Rainbow table." });
  const apres = couverture(demain, etat.rangs).occurrences.filter((o) => o.enVigueur.length === 0);
  assert.equal(apres.length, avant + 1, "le choix ajouté n'est pas vu");
  assert.equal(apres.at(-1).occ[2], "Choose");
});

test("⚔️ témoin : une déclaration « création » dont le chemin ne s'écrit pas est accusée, à chaque étape", () => {
  const etat = ETAT.FH;
  const gnome = { kind: "species", id: "srd:species:en:gnome" };
  assert.deepEqual(fautesDeCreation(etat, gnome, { nature: "creation", etape: "species", chemin: "species.lineage" }), []);
  assert.notDeepEqual(fautesDeCreation(etat, gnome, { nature: "creation", etape: "species", chemin: "species.couleur" }), []);
  assert.notDeepEqual(fautesDeCreation(etat, gnome, { nature: "creation", etape: "concept", chemin: "species.lineage" }), []);
  const barde = { kind: "class", id: "srd:class:en:bard" };
  assert.deepEqual(fautesDeCreation(etat, barde, { nature: "creation", etape: "equipment", chemin: "depart.class-tool" }), []);
  assert.notDeepEqual(fautesDeCreation(etat, barde, { nature: "creation", etape: "equipment", chemin: "depart.background" }), []);
  assert.notDeepEqual(fautesDeCreation(etat, barde, { nature: "creation", etape: "skills", chemin: "fh.skills.train" }), []);
  assert.notDeepEqual(fautesDeCreation(ETAT.SRD, barde, { nature: "creation", etape: "skills", chemin: "fh.skills.spend" }), [],
    "en SRD l'étape Skills n'est pas montée");
});

test("⚔️ témoin : une clef mal orthographiée ressemble au préfixe et accuse", () => {
  for (const clef of ["choix-du-texte:srfh-mecaniques-en", "choixDuTexte", "choix_du_text:fh-lore-en", "choix_du_texte"]) {
    assert.ok(ressembleAuPrefixe(clef) && !CLEF_EXACTE.test(clef), clef);
  }
  assert.ok(CLEF_EXACTE.test("choix_du_texte:fh-lore-en"));
  assert.ok(!ressembleAuPrefixe("feature_choices"));
});
