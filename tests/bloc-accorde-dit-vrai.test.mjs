/* ══ LE BLOC « GAGNÉ D'OFFICE » DIT VRAI — lot 129, 2026-09-02 ═══════════

   Deux défauts d'Eric, le même jour, sur le même bloc — et la même maladie
   dessous : plusieurs voix pour une seule chose.

   🟢 A — CE QUI SE RÈGLE AILLEURS LE DIT. *« Je ne vois pas le petit texte
   vert qui indique, sur les pouvoirs granted, que c'est transféré à un choix
   dans un autre chapitre. Pour le reste la pastille verte signifie que tout le
   contenu est enregistré direct dans la fiche de perso. »* Puis, en le
   bornant : *« Texte vert : free points, feats, destiny. »*

   🔵 B — LA DESTINÉE DE L'ELFE SE CONTREDISAIT À DEUX LIGNES D'ÉCART : la
   ligne annonçait `Destiny : 2` et le trait juste dessous disait *« for a
   Destiny Base of 4 at character creation »*. Trois endroits lisaient
   `data.destiny.base` chacun pour son compte, aucun ne lisait `base_bonus`, et
   l'Elfe est la SEULE des douze à en porter un — la maladie était invisible
   sur onze espèces sur douze.

   ⚠️ CE QUE CE GARDE ÉPELLE, ET COMMENT IL LE MESURE :
     · pour A, il NOMME les six couples mesurés le 02/09 et exige que l'écran
       produise exactement ceux-là. ⛔ Une liste d'exceptions PAR NOM ne dit
       jamais qu'elle est incomplète ; une liste ATTENDUE, elle, rougit dans
       les deux sens — une entrée qui s'ajoute comme une qui disparaît.
       Et les ⚔️ du bas vérifient que le code, lui, dérive de l'EFFET : couper
       la déclaration éteint la ligne, renommer le trait ne l'éteint pas.
     · pour B, il lit le nombre affiché ET le texte du trait qui l'augmente,
       et il exige qu'ils disent le même chiffre. Une seconde lecture en sens
       inverse : c'est la seule qui attrape une contradiction. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";
import { createTestDocument } from "./dom-stub.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

globalThis.document = createTestDocument();

const { SPECIES_CATALOGUE } = await import("../ui/builder/species-step.mjs");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUERY = exempleFhEn().layers.verbs.query;

const LES_DOUZE = [
  "fh:species:en:araag", "fh:species:en:elestu", "fh:species:en:loroka",
  "srd:species:en:dragonborn", "srd:species:en:dwarf", "srd:species:en:elf",
  "srd:species:en:gnome", "srd:species:en:goliath", "srd:species:en:halfling",
  "srd:species:en:human", "srd:species:en:orc", "srd:species:en:tiefling"
];

function recordDe(query, id) {
  const vue = query({ kind: "species", id });
  return (vue && vue.record) || null;
}

function traitsDuRecord(record) {
  const data = (record && record.data) || {};
  const base = Array.isArray(data.traits) ? data.traits : [];
  const fh = Array.isArray(data.fh_traits) ? data.fh_traits : [];
  return [...base, ...fh].filter((trait) => trait && trait.name);
}

function decisionsDe(query, id) {
  const data = (recordDe(query, id) || {}).data || {};
  const dec = [{
    path: "species", status: "answered", answered: 1, expected: 1,
    options: [id], selected: [id]
  }];
  if (Array.isArray(data.lineages) && data.lineages.length > 0) {
    dec.push({
      path: "species.lineage", status: "pending", answered: 0, expected: 1,
      options: data.lineages.map((o) => o.id), selected: []
    });
  }
  if (traitsDuRecord(recordDe(query, id)).some((trait) => trait.id === "keen-senses")) {
    dec.push({
      path: "species.skillBudget", status: "pending", answered: 0, expected: 2,
      options: ["survival", "delve", "vigilance"], selected: []
    });
  }
  return dec;
}

/** LE BLOC ACCORDÉ, TEL QU'IL EST SERVI — la suite des nœuds, dans l'ordre.
 *  ⚠️ L'ORDRE COMPTE : le texte vert est une note SUR la ligne du dessus. S'il
 *  se posait ailleurs, il nommerait le mauvais trait — et un relevé qui
 *  ramasse tout en vrac ne le verrait pas. */
function blocAccorde(query, id) {
  const noeud = SPECIES_CATALOGUE.resumeItem(
    { path: "species.granted", confirme: true },
    { decisions: decisionsDe(query, id), query }, () => {}
  );
  if (!noeud) return [];
  return noeud.querySelectorAll("p").map((p) => {
    const fort = p.querySelectorAll("strong")[0];
    if (!fort) return { vert: true, dit: p.textContent };
    return { vert: false, mot: fort.textContent.replace(/ : $/, ""),
      dit: String(p.textContent).slice(fort.textContent.length) };
  });
}

/** Les couples `trait → phrase verte` que l'écran produit vraiment. */
function portagesDe(query, id) {
  const lignes = blocAccorde(query, id);
  const trouves = [];
  lignes.forEach((ligne, index) => {
    if (!ligne.vert) return;
    const dessus = lignes[index - 1];
    trouves.push([dessus && !dessus.vert ? dessus.mot : "(orpheline)", ligne.dit]);
  });
  return trouves;
}

/* ══ 0. LE TÉMOIN ═══════════════════════════════════════════════════════ */

test("témoin — les douze espèces sont là, et l'Elfe est la SEULE à porter un bonus de Base", () => {
  const ids = QUERY({ kind: "species" }).map((vue) => vue.id).sort();
  assert.deepEqual(ids, [...LES_DOUZE].sort(),
    "si une espèce entre ou sort, ce garde le DIT avant de mesurer");
  const avecBonus = LES_DOUZE.filter((id) => {
    const destiny = (recordDe(QUERY, id).data || {}).destiny || {};
    return destiny.base_bonus !== undefined;
  });
  assert.deepEqual(avecBonus, ["srd:species:en:elf"],
    "⚠️ l'Elfe est le seul cas qui PROUVE la somme — les onze autres sont les témoins qui accusent");
});

/* ══ 1. 🟢 LE TEXTE VERT DE PORTAGE ═════════════════════════════════════ */

/** LES SIX COUPLES, MESURÉS LE 02/09 ET ÉCRITS. Le numéro d'étape est celui
 *  que la ceinture peint (`etapes.mjs`) — un contrôle plus bas le vérifie
 *  contre la liste elle-même, pour qu'un réordonnancement fasse rougir ici
 *  plutôt que de mentir à l'écran. */
const PORTAGES_ATTENDUS = {
  "fh:species:en:araag": [["Fast Learner", "→ chosen at step 7, Skills"]],
  "fh:species:en:elestu": [["Fast Learner", "→ chosen at step 7, Skills"]],
  "fh:species:en:loroka": [["Versatile", "→ chosen at step 3, Inheritance"]],
  "srd:species:en:human": [
    ["Skillful", "→ chosen at step 7, Skills"],
    ["Versatile", "→ chosen at step 3, Inheritance"]
  ],
  "srd:species:en:elf": [["Splinter of Anon", "→ chosen at step 4, Destiny"]]
};

test("🔴 un effet qui se règle ailleurs NOMME son étape — et lui seul", () => {
  const mesure = {};
  for (const id of LES_DOUZE) {
    const portages = portagesDe(QUERY, id);
    if (portages.length > 0) mesure[id] = portages;
  }
  assert.deepEqual(mesure, PORTAGES_ATTENDUS,
    "⛔ un septième portage qui apparaît, ou un des six qui disparaît, se DIT ici");
});

test("🔴 …et un choix EN JEU n'en est pas un — `breath-weapon` reste muet", () => {
  /* Le Dragonborn choisit la forme de son souffle *« each time »* : c'est un
     geste de partie, pas un effet reporté à un chapitre. Un crible qui
     cherche « un choix » au lieu d'un EFFET le ramasserait. */
  assert.deepEqual(portagesDe(QUERY, "srd:species:en:dragonborn"), [],
    "aucune ligne verte chez le Dragonborn — son choix ne se règle pas ailleurs");
  const texte = traitsDuRecord(recordDe(QUERY, "srd:species:en:dragonborn"))
    .find((t) => t.id === "breath-weapon").text;
  assert.match(texte, /choose the shape each time/,
    "témoin : le piège est bien là, c'est ce qui rend le contrôle du dessus utile");
});

test("🔴 aucune ligne verte n'est ORPHELINE — elle est toujours sous un trait", () => {
  /* Une note qui flotte nomme le mauvais trait ; c'est pire que pas de note. */
  for (const id of LES_DOUZE) {
    for (const [mot] of portagesDe(QUERY, id)) {
      assert.notEqual(mot, "(orpheline)", `${id} : une phrase verte sans trait au-dessus`);
    }
  }
});

test("🔴 le NUMÉRO écrit est celui de la ceinture — pas un littéral qui dort", () => {
  /* ⛔ Les numéros ci-dessus sont ÉCRITS (une cote donnée bat une cote
     déduite), et ce contrôle vérifie qu'ils disent encore la vérité sur la
     liste d'où ils viennent — sans se laisser recalculer par elle. Le jour où
     l'ordre des étapes change, c'est ICI que ça rougit. */
  const source = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "etapes.mjs"), "utf8"));
  const bloc = source.match(/const STEPS = \[([\s\S]*?)\n\];/);
  assert.ok(bloc, "STEPS introuvable dans etapes.mjs — ce garde lit la mauvaise source");
  const crans = [...bloc[1].matchAll(/id:\s*"([a-z]+)",\s*label:\s*"([^"]+)"/g)]
    .map((m, index) => ({ index, id: m[1], label: m[2] }));
  const attendu = new Map([[3, "Inheritance"], [4, "Destiny"], [7, "Skills"]]);
  for (const [numero, mot] of attendu) {
    const cran = crans[numero];
    assert.ok(cran, `la ceinture n'a pas de cran ${numero}`);
    assert.equal(cran.label, mot,
      `le cran ${numero} de la ceinture s'appelle « ${cran.label} » — les phrases vertes disent « ${mot} »`);
  }
});

/* ══ 2. 🔵 LA DESTINÉE — LE NOMBRE ET LE TRAIT DISENT LA MÊME CHOSE ═════ */

test("🔴 la ligne Destiny et le trait qui l'augmente ne se contredisent JAMAIS", () => {
  /* ⚖️ LA SECONDE LECTURE, EN SENS INVERSE — la seule qui attrape une
     contradiction : on lit le nombre à l'écran, puis on lit le chiffre que le
     TEXTE du trait annonce, et on exige qu'ils soient le même. */
  const id = "srd:species:en:elf";
  const lignes = blocAccorde(QUERY, id);
  const nombre = lignes.find((l) => l.mot === "Destiny").dit.trim();
  assert.equal(nombre, "4", "l'Elfe porte Base 2 + Splinter of Anon 2 — l'écran doit dire 4");
  const trait = lignes.find((l) => l.mot === "Splinter of Anon");
  assert.ok(trait, "témoin : le trait est bien servi juste dessous, sinon rien n'est comparé");
  const annonce = /Destiny Base of (\d+)/.exec(trait.dit);
  assert.ok(annonce, "témoin : le texte du trait annonce bien un chiffre");
  assert.equal(annonce[1], nombre,
    "⛔ c'est la contradiction du 02/09 : la ligne disait 2, le trait disait 4");
});

test("🔴 les onze autres ne bougent pas d'un chiffre", () => {
  for (const id of LES_DOUZE) {
    if (id === "srd:species:en:elf") continue;
    const ligne = blocAccorde(QUERY, id).find((l) => l.mot === "Destiny");
    assert.equal(ligne && ligne.dit.trim(), "2",
      `${id} : une espèce sans bonus affiche sa Base nue — si ce lot débordait, ça se verrait ici`);
  }
});

test("🔴 UNE seule lecture de la Base dans l'écran — pas trois", () => {
  /* 📏 LA CAUSE MESURÉE : trois endroits lisaient `data.destiny.base` chacun
     pour son compte, et les trois oubliaient le bonus. Le remède n'est pas
     « corriger les trois », c'est n'en avoir qu'UNE.

     ⚠️ CE QUI EST COMPTÉ, ET POURQUOI PAS AUTRE CHOSE : ma première écriture
     comptait les occurrences du texte `destiny.base` et en attendait UNE — or
     la lecture unique en fait deux (le test de validité, puis la somme), donc
     ce garde rougissait sur sa propre réparation. Ce qui est vrai, c'est que
     toutes les occurrences vivent DANS le même bloc.
     ⛔ `stripComments` d'abord : un garde a déjà rougi sur son propre
     commentaire dans ce fichier. */
  const source = stripComments(
    fs.readFileSync(path.join(ROOT, "ui", "builder", "species-step.mjs"), "utf8")
  );
  const debut = source.indexOf("function baseDeDestinee(");
  assert.notEqual(debut, -1, "la lecture unique est introuvable — ce garde lit la mauvaise source");
  const fin = source.indexOf("\n}", debut);
  assert.ok(fin > debut, "témoin : le bloc de la lecture unique se referme bien");

  const dehors = [...source.matchAll(/destiny\s*\.\s*base\b/g)]
    .filter((m) => m.index < debut || m.index > fin)
    .map((m) => source.slice(Math.max(0, m.index - 40), m.index + 20).replace(/\s+/g, " "));
  assert.deepEqual(dehors, [],
    "⛔ une lecture de la Base HORS de la lecture unique — c'est la maladie du 02/09 qui rouvre");

  /* ⚖️ ET L'AUTRE MOITIÉ : le compte serait vert si plus PERSONNE n'affichait
     de Destinée. Les deux blocs qui en affichent une passent bien par elle. */
  const affichages = [...source.matchAll(/\["Destiny",/g)].length;
  const appels = [...source.matchAll(/baseDeDestinee\(/g)].length - 1; // moins sa définition
  assert.equal(affichages, 2, "deux blocs affichent une ligne Destiny — s'il en naît un troisième, il se DIT");
  assert.equal(appels, affichages, "…et chacun passe par la lecture unique");
});

/* ══ 3. ⚔️ LES ATTAQUES — les gardes mordent-ils ? ══════════════════════ */

test("⚔️ le portage se dérive de l'EFFET : couper la déclaration éteint la ligne", () => {
  /* ⛔ C'est la preuve que ce n'est PAS une liste de noms : on ne touche pas
     au nom du trait, on retire la déclaration qui dit ce qu'il accorde. */
  const id = "fh:species:en:araag";
  const sansDeclaration = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data };
    delete data.skill_points;
    return { ...vue, record: { ...vue.record, data } };
  };
  assert.deepEqual(portagesDe(sansDeclaration, id), [],
    "⚔️ sans la déclaration de points, `Fast Learner` n'a plus rien à reporter");
  assert.deepEqual(portagesDe(QUERY, id), [["Fast Learner", "→ chosen at step 7, Skills"]],
    "…et sur la pile réelle, la ligne est bien là");
});

test("⚔️ …et RENOMMER le trait ne l'éteint pas — c'est l'effet qui décide", () => {
  /* ⛔ Une liste par nom aurait perdu la ligne ici, en silence. Le Hoddon a
     déjà vu son trait rebaptisé une fois : ce n'est pas une hypothèse. */
  const id = "srd:species:en:human";
  const rebaptise = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const data = { ...vue.record.data };
    data.traits = data.traits.map((t) => (t.id === "skillful" ? { ...t, name: "Gifted" } : t));
    return { ...vue, record: { ...vue.record, data } };
  };
  const dit = portagesDe(rebaptise, id);
  assert.deepEqual(dit, [
    ["Gifted", "→ chosen at step 7, Skills"],
    ["Versatile", "→ chosen at step 3, Inheritance"]
  ], "⚔️ le trait renommé garde sa ligne verte, sous son nouveau nom");
});

test("⚔️ un bonus de Base d'une AUTRE valeur suit — la lecture somme, elle ne récite pas", () => {
  const id = "srd:species:en:elf";
  const gonfle = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const destiny = { ...vue.record.data.destiny, base_bonus: 3 };
    return { ...vue, record: { ...vue.record, data: { ...vue.record.data, destiny } } };
  };
  const ligne = blocAccorde(gonfle, id).find((l) => l.mot === "Destiny");
  assert.equal(ligne.dit.trim(), "5", "⚔️ 2 + 3 — un total en dur serait resté à 4");
});

test("⚔️ une lecture qui IGNORE le bonus rouvre la contradiction, et le contrôle la voit", () => {
  /* On rejoue le défaut : le bonus retiré de la donnée pendant que le trait
     continue d'annoncer 4. La comparaison en sens inverse doit le nommer. */
  const id = "srd:species:en:elf";
  const ampute = (demande) => {
    const vue = QUERY(demande);
    if (!vue || !vue.record || demande.id !== id) return vue;
    const destiny = { ...vue.record.data.destiny };
    delete destiny.base_bonus;
    return { ...vue, record: { ...vue.record, data: { ...vue.record.data, destiny } } };
  };
  const lignes = blocAccorde(ampute, id);
  const nombre = lignes.find((l) => l.mot === "Destiny").dit.trim();
  const annonce = /Destiny Base of (\d+)/.exec(lignes.find((l) => l.mot === "Splinter of Anon").dit);
  assert.equal(nombre, "2", "le bonus retiré, l'écran retombe à 2…");
  assert.notEqual(annonce[1], nombre,
    "⚔️ …et le trait continue d'annoncer 4 : c'est EXACTEMENT la contradiction que le garde refuse");
});
