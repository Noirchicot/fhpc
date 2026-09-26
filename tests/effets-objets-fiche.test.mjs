/* ══ LOT 289 — LES OBJETS MAGIQUES ÉQUIPÉS CHANGENT ENFIN LES CHIFFRES DE LA FICHE ═══════
   ⚖️ Eric, 2026-09-26 : une Ioun Stone (Intellect) harmonisée donne VRAIMENT +2 en INT, et
   tout ce qui en découle bouge. Ses règles, validées le même jour (tête de
   `src/build/effets-objets.mjs`) : équipé, ET harmonisé quand la condition le dit ; ni
   consommable ni « à activer » ; la famille « chiffre » d'abord ; un déclenché à part, un
   état que le moteur voit calculé, un choix appliqué seulement s'il est fait.
   Puis, sur l'harmonisation : *« le joueur le coche dans la fiche X1 »* — c'est le choix
   `gear[N].attuned`, écrit depuis le lot 213, que le moteur lit enfin.

   ── CE QUE CES GARDES TIENNENT ────────────────────────────────────────────────
   🔴 LE PIÈGE DU LOT : `abilities[k].mod` est lu par tout ce qui suit dans `derive`. Un score
   juste et une sauvegarde fausse, c'est le défaut qu'on ne voit pas — le garde 1 le prouve
   donc par les chiffres EN AVAL (modificateur, sauvegarde, compétence, DD des sorts), pas
   par le score seul.
   ⚔️ Chacun a été vu ROUGE sous une mutation du moteur avant d'être cru vert (le rapport du
   lot 289 dit laquelle). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { makeHarness, manifestOf, readJson, PILE_SRD, ROOT } from "./build-harness.mjs";
import { createDocWriters } from "../src/doc/index.mjs";
import { ABILITY_KEYS } from "../src/build/index.mjs";
import { DECLENCHES, A_ETAT, classerEffet, appliquerAuNombre, PLAFOND_HARMONISATION }
  from "../src/build/effets-objets.mjs";
import { moduleDesEffets, generate as genererLaCopie, OUT_NAME } from "../src/tools/gen-effets-objets.mjs";
import { exempleFhEn } from "../src/tools/exemple-fh-en.mjs";

const H = makeHarness({ layers: PILE_SRD });
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
const INVENTAIRE = readJson("sources-effets/objets-magiques-srd.effets.json");
const WIZARD = { path: "class", ref: { kind: "class", id: "srd:class:en:wizard" } };

let numero = 0;
/** Un Wizard de niveau 1 — INT 15 (impair : +2 le fait passer à 17, mod +2 → +3). */
function perso(gear = [], scores = {}) {
  numero += 1;
  const doc = writers.composer({ name: "Nodren", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(H.layers), id: `effets-${numero}`, at: "2026-09-26T00:00:00Z" });
  const six = ABILITY_KEYS.map((clef) => ({ path: `abilities.${clef}`, value: scores[clef] ?? (clef === "int" ? 15 : 12) }));
  return H.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...doc.build.choices, WIZARD, ...six, ...gear] } } });
}
/** Une ligne `gear[N]` telle que la coquille l'écrit, plus ce que X1 et X5 y posent. */
function ligne(n, id, { kind = "item", equipped = true, attuned, variant, bonus, plan } = {}) {
  return [
    { path: `gear[${n}]`, ref: { kind, id } },
    { path: `gear[${n}].quantity`, value: 1 },
    { path: `gear[${n}].equipped`, value: equipped },
    ...(attuned === undefined ? [] : [{ path: `gear[${n}].attuned`, value: attuned }]),
    ...(variant === undefined ? [] : [{ path: `gear[${n}].variant`, value: variant }]),
    ...(bonus === undefined ? [] : [{ path: `gear[${n}].bonus`, value: bonus }]),
    ...(plan === undefined ? [] : [{ path: `gear[${n}].plan`, ref: { kind: "item", id: plan } }])
  ];
}
const item = (slug) => `srd:item:en:${slug}`;
const skill = (out, id) => out.resolved.skills.find((s) => s.id === id);
/** `resolved` sans ce que les objets ajoutent pour se DIRE (la provenance, la marque
 *  d'harmonisation sur la ligne) — ce qui reste doit être les chiffres seuls. */
function chiffres(resolved) {
  const r = structuredClone(resolved);
  delete r.effects;
  delete r.derivation;
  delete r.gear;
  return r;
}

const TEMOIN = perso();

test("1 — 🔴 IOUN STONE (INTELLECT) : +2 en INT, ET TOUT CE QUI EN DÉCOULE BOUGE", () => {
  const out = perso(ligne(0, item("ioun-stone"), { attuned: true, variant: "Intellect" }));
  assert.equal(TEMOIN.resolved.abilities.int.score, 15, "témoin : INT 15");
  assert.equal(TEMOIN.resolved.abilities.int.mod, 2);
  assert.equal(out.resolved.abilities.int.score, 17, "⭐ le score passe à 17");
  assert.equal(out.resolved.abilities.int.mod, 3, "⭐ le modificateur passe de +2 à +3");
  /* ⛔ LE PIÈGE : un effet posé APRÈS les lecteurs de `mod` laisserait tout ceci faux */
  assert.equal(out.resolved.saves.int.bonus, TEMOIN.resolved.saves.int.bonus + 1, "⭐ la sauvegarde d'INT suit le modificateur");
  assert.equal(skill(out, "arcana").bonus, skill(TEMOIN, "arcana").bonus + 1, "⭐ une compétence d'INT suit aussi");
  assert.equal(out.resolved.spellcasting.dc, TEMOIN.resolved.spellcasting.dc + 1, "⭐ et le DD des sorts du Wizard");
  assert.equal(out.resolved.spellcasting.attackBonus, TEMOIN.resolved.spellcasting.attackBonus + 1);
  /* ⛔ et rien d'autre ne bouge : les autres caractéristiques, la CA, les PV */
  for (const clef of ["str", "dex", "con", "wis", "cha"]) {
    assert.deepEqual(out.resolved.abilities[clef], TEMOIN.resolved.abilities[clef]);
  }
  assert.equal(out.resolved.ac, TEMOIN.resolved.ac);
  /* ⭐ LA PROVENANCE — ce qu'Eric lit en Expert view */
  assert.deepEqual(out.resolved.effects.applied, [{
    line: 0, object: "Ioun Stone (Intellect)", item: "Ioun Stone", target: "ability.int", mode: "bonus",
    value: 2, cap: 20, condition: "harmonise+porte", variant: "Intellect",
    path: "resolved.abilities.int.score", before: 15, after: 17
  }]);
  assert.deepEqual(out.resolved.effects.pending, []);
  assert.equal(out.resolved.gear[0].attuned, true, "la ligne dit qu'elle est harmonisée");
  assert.doesNotThrow(() => writers.assertValid(out.document, "effets-1"), "⭐ et le document valide `fh-char/1`");
});

test("2 — ⚖️ CLOAK OF PROTECTION HARMONISÉE : CA +1 ET LES SIX SAUVEGARDES +1", () => {
  const out = perso(ligne(0, item("cloak-of-protection"), { attuned: true }));
  assert.equal(out.resolved.ac, TEMOIN.resolved.ac + 1, "⭐ CA +1");
  for (const clef of ABILITY_KEYS) {
    assert.equal(out.resolved.saves[clef].bonus, TEMOIN.resolved.saves[clef].bonus + 1, `⭐ sauvegarde ${clef} +1`);
  }
  const chemins = out.resolved.effects.applied.map((e) => e.path).sort();
  assert.deepEqual(chemins, ["resolved.ac", ...ABILITY_KEYS.map((k) => `resolved.saves.${k}.bonus`)].sort(),
    "⭐ un +1 aux sauvegardes modifie SIX chiffres : six entrées, chacune à son chemin");
  assert.doesNotThrow(() => writers.assertValid(out.document, "effets-2"));
});

test("3 — ⛔ LE MÊME, NON HARMONISÉ : rien ne bouge, et l'effet ATTEND l'harmonisation", () => {
  for (const [cas, attuned] of [["absent", undefined], ["faux", false]]) {
    const out = perso(ligne(0, item("cloak-of-protection"), { attuned }));
    assert.deepEqual(chiffres(out.resolved), chiffres(TEMOIN.resolved), `${cas} : ⛔ aucun chiffre ne bouge`);
    assert.deepEqual(out.resolved.effects.applied, []);
    assert.deepEqual(out.resolved.effects.pending.map((e) => [e.target, e.reason]).sort(),
      [["ac", "attunement"], ["save.all", "attunement"]], `${cas} : ⭐ les deux effets sont en attente`);
    assert.ok(!("attuned" in out.resolved.gear[0]), "⛔ la marque n'est posée que si elle est vraie");
  }
});

test("4 — ⛔ LE MÊME, NON ÉQUIPÉ (même harmonisé) : rien, et rien en attente", () => {
  const out = perso(ligne(0, item("cloak-of-protection"), { equipped: false, attuned: true }));
  assert.deepEqual(chiffres(out.resolved), chiffres(TEMOIN.resolved));
  assert.deepEqual(out.resolved.effects, { applied: [], apart: [], pending: [] },
    "⛔ un objet dans le sac n'agit pas — il n'attend rien non plus : c'est un GESTE de rangement, pas un choix");
});

test("5 — ⚖️ BELT OF GIANT STRENGTH (HILL) : `fixe` 21 ne baisse JAMAIS une FOR de 23", () => {
  /* « The item has no effect on you if your Strength without the belt is equal to or
     greater than the belt's score. » */
  const fort = perso(ligne(0, item("belt-of-giant-strength"), { attuned: true, variant: "Hill" }), { str: 23 });
  assert.equal(fort.resolved.abilities.str.score, 23, "⭐ 23 reste 23");
  assert.deepEqual(fort.resolved.effects.applied.map((e) => [e.path, e.before, e.after]),
    [["resolved.abilities.str.score", 23, 23]], "la ceinture est EN FORCE, et la provenance dit qu'elle n'a rien changé");
  const faible = perso(ligne(0, item("belt-of-giant-strength"), { attuned: true, variant: "Hill" }), { str: 15 });
  const temoin = perso([], { str: 15 });
  assert.equal(faible.resolved.abilities.str.score, 21, "⭐ 15 devient 21");
  assert.equal(faible.resolved.abilities.str.mod, 5);
  assert.equal(skill(faible, "athletics").bonus, skill(temoin, "athletics").bonus + 3, "⭐ Athletics suit : +2 → +5");
});

test("6 — ⚖️ UNE POTION OF GIANT STRENGTH DANS LE SAC : rien appliqué, une entrée « à part »", () => {
  const out = perso(ligne(0, item("potion-of-giant-strength"), { equipped: false, variant: "Hill" }), { str: 12 });
  assert.deepEqual(chiffres(out.resolved), chiffres(TEMOIN.resolved), "⛔ une potion ne se boit pas en créant la fiche");
  assert.deepEqual(out.resolved.effects.applied, []);
  assert.deepEqual(out.resolved.effects.apart.map((e) => [e.target, e.mode, e.value, e.variant, e.reason]),
    [["ability.str", "fixe", 21, "Hill", "consumable"]],
    "⭐ SA variante seulement (Hill), pas les quatre autres géants — raison : consommable");
  assert.doesNotThrow(() => writers.assertValid(out.document, "effets-6"), "⭐ `apart` a la forme du schéma");
});

test("7 — ⚖️ ③ UNE VARIANTE NON CHOISIE : les effets chiffrés ATTENDENT le choix", () => {
  const out = perso(ligne(0, item("ioun-stone"), { attuned: true }));
  assert.deepEqual(chiffres(out.resolved), chiffres(TEMOIN.resolved));
  assert.deepEqual(out.resolved.effects.applied, []);
  const attente = out.resolved.effects.pending;
  assert.ok(attente.length >= 8, `les huit pierres chiffrées attendent (${attente.length})`);
  assert.ok(attente.every((e) => e.reason === "choice"), "⭐ raison : le choix");
  assert.ok(attente.some((e) => e.variant === "Intellect" && e.target === "ability.int"));
  assert.doesNotThrow(() => writers.assertValid(out.document, "effets-7"), "⭐ `pending` a la forme du schéma");
});

test("8 — ⛔ QUATRE OBJETS HARMONISÉS : une violation, et AUCUN effet harmonisé ne s'applique", () => {
  const out = perso([
    ...ligne(0, item("cloak-of-protection"), { attuned: true }),
    ...ligne(1, item("ring-of-protection"), { attuned: true }),
    ...ligne(2, item("ioun-stone"), { attuned: true, variant: "Intellect" }),
    ...ligne(3, item("belt-of-giant-strength"), { attuned: true, variant: "Hill" })
  ]);
  assert.equal(PLAFOND_HARMONISATION, 3);
  assert.deepEqual(chiffres(out.resolved), chiffres(TEMOIN.resolved),
    "⛔ le moteur ne choisit pas les trois à garder à la place du joueur : aucun");
  assert.deepEqual(out.resolved.effects.applied, []);
  assert.ok(out.resolved.effects.pending.length > 0 && out.resolved.effects.pending.every((e) => e.reason === "attunement-cap"));
  const v = out.moduleViolations.filter((x) => x.key === "gear.attunement-over-cap");
  assert.deepEqual(v.map((x) => [x.params, x.path]), [[{ count: 4, max: 3 }, "gear"]], "⭐ la violation est NOMMÉE");
  assert.match(String(v[0]), /4 objets sont harmonisés/, "et elle a ses mots");
  const { violations } = H.verbs.validate({ document: out.document });
  assert.ok(violations.some((x) => x.key === "gear.attunement-over-cap"), "⭐ `validate` la porte aussi");
  /* ⭐ le témoin contraire : trois harmonisés, aucune violation */
  const trois = perso([
    ...ligne(0, item("cloak-of-protection"), { attuned: true }),
    ...ligne(1, item("ring-of-protection"), { attuned: true }),
    ...ligne(2, item("ioun-stone"), { attuned: true, variant: "Intellect" })
  ]);
  assert.equal(trois.moduleViolations.length, 0);
  assert.equal(trois.resolved.ac, TEMOIN.resolved.ac + 2, "trois : Cloak +1, Ring +1");
});

test("9 — ⭐ LE PERSONNAGE SANS OBJET MAGIQUE : `resolved` IDENTIQUE À AVANT, sauf `effects` vide", () => {
  /* ⭐ LE TÉMOIN EXISTANT : le `resolved` du personnage d'exemple tel que `main` (v833) le
     produisait AVANT ce lot — extrait par `git show`, jamais écrit à la main. */
  const avant = readJson("tests/fixtures/resolved-sans-objet-magique.avant-289.json").resolved;
  const apres = structuredClone(exempleFhEn().document.resolved);
  assert.deepEqual(apres.effects, { applied: [], apart: [], pending: [] }, "⭐ effects vide");
  delete apres.effects;
  apres.derivation.at = avant.derivation.at;
  assert.deepEqual(apres, avant, "⛔ pas un chiffre, pas une clef, pas un ordre de différence");
  assert.deepEqual(Object.keys(apres), Object.keys(avant), "l'ordre des rubriques aussi");
});

test("10 — ⭐ `gear[N].attuned` EST CONSOMMÉ : il ne ressort plus parmi les choix sans effet", () => {
  /* ⚖️ Jusqu'au lot 289, le choix que X1 écrit ressortait `unconsumed` (lot 213 : « la fiche
     de personnage ne le lit pas encore, l'écran si »). ⛔ Le moteur le lit désormais : le
     laisser dans `unconsumed` ferait dire à `validate` qu'il ne change rien à la fiche. */
  for (const attuned of [true, false]) {
    const out = perso(ligne(0, item("cloak-of-protection"), { attuned }));
    assert.ok(!out.unconsumed.includes("gear[0].attuned"), `attuned = ${attuned} : consommé`);
  }
  /* ⛔ ET SANS `attuned`, la ligne n'est pas « incomplète » : non harmonisé est l'état par défaut */
  const sans = perso(ligne(0, item("cloak-of-protection")));
  assert.ok(!sans.underived.some((e) => e.key === "underived.gear-line-incomplete"));
});

test("11 — 📐 L'ORDRE : base → bonus (chacun sous SON plafond) → fixe → plancher", () => {
  /* ⚖️ les citations qui le fondent — tête de `creerRegistre` */
  assert.equal(appliquerAuNombre(19, "bonus", 2, 20), 20, "« to a maximum of 20 »");
  assert.equal(appliquerAuNombre(20, "bonus", 2, 20), 20);
  assert.equal(appliquerAuNombre(21, "bonus", 2, 20), 21, "⛔ un plafond borne la HAUSSE, il ne baisse jamais");
  assert.equal(appliquerAuNombre(23, "fixe", 21), 23, "« no effect on you if your Strength … is equal to or greater »");
  assert.equal(appliquerAuNombre(25, "plancher", 30), 30);
  assert.equal(appliquerAuNombre(35, "plancher", 30), 35, "« unless your Speed is higher »");
  /* ⭐ DANS LE MOTEUR : FOR 18, Ioun (Strength) +2 max 20, puis la ceinture 21 — le bonus
     d'abord (« without the belt » = tout le reste), la ceinture ensuite : 21. */
  const out = perso([
    ...ligne(0, item("belt-of-giant-strength"), { attuned: true, variant: "Hill" }),
    ...ligne(1, item("ioun-stone"), { attuned: true, variant: "Strength" })
  ], { str: 18 });
  assert.equal(out.resolved.abilities.str.score, 21);
  assert.deepEqual(out.resolved.effects.applied.map((e) => [e.mode, e.before, e.after]),
    [["bonus", 18, 20], ["fixe", 20, 21]], "⭐ le bonus AVANT le fixe, quel que soit l'ordre des lignes");
  /* ⭐ deux bonus plafonnés : CON 17, Belt of Dwarvenkind +2 max 20, Ioun (Fortitude) +2 max 20 */
  const con = perso([
    ...ligne(0, item("belt-of-dwarvenkind"), { attuned: true }),
    ...ligne(1, item("ioun-stone"), { attuned: true, variant: "Fortitude" })
  ], { con: 17 });
  assert.equal(con.resolved.abilities.con.score, 20, "17 → 19 → 20, jamais 21");
});

test("12 — ⚖️ L'ARMURE +1 CRAFTÉE : son +1 compte UNE fois, et il est dans la provenance", () => {
  const base = { kind: "armor", equipped: true };
  const nue = perso(ligne(0, "srd:armor:en:breastplate", base));
  const plus1 = perso(ligne(0, "srd:armor:en:breastplate", { ...base, bonus: "+1", plan: item("armor-1-2-or-3") }));
  assert.equal(plus1.resolved.ac, nue.resolved.ac + 1, "⛔ pas +2 : le plan et la ligne disent le MÊME +1");
  assert.deepEqual(plus1.resolved.effects.applied.map((e) => [e.item, e.path, e.value]),
    [["Armor, +1, +2, or +3", "resolved.ac", 1]], "⭐ le +1 de la ligne se retrouve depuis `applied`");
  const sansPlan = perso(ligne(0, "srd:armor:en:breastplate", { ...base, bonus: "+1" }));
  assert.equal(sansPlan.resolved.ac, nue.resolved.ac + 1, "le lot 265 tient toujours : la ligne sans plan");
});

test("13 — ⚖️ ② UN ÉTAT QUE LE MOTEUR VOIT : Bracers of Defense, sans armure ni bouclier", () => {
  const nus = perso(ligne(0, item("bracers-of-defense"), { attuned: true }));
  assert.equal(nus.resolved.ac, TEMOIN.resolved.ac + 2, "⭐ sans armure : +2");
  const armure = perso([...ligne(0, "srd:armor:en:breastplate", { kind: "armor" }),
    ...ligne(1, item("bracers-of-defense"), { attuned: true })]);
  const temoinArmure = perso(ligne(0, "srd:armor:en:breastplate", { kind: "armor" }));
  assert.equal(armure.resolved.ac, temoinArmure.resolved.ac, "⛔ en armure : rien");
  assert.deepEqual(armure.resolved.effects.apart.filter((e) => e.target === "ac").map((e) => e.reason), ["state-unmet"],
    "⭐ et l'effet est À PART, avec sa raison — pas perdu");
  const robe = perso(ligne(0, item("robe-of-the-archmagi"), { attuned: true }));
  assert.equal(robe.resolved.ac, 15 + robe.resolved.abilities.dex.mod, "⭐ Robe of the Archmagi : base 15 + Dex");
});

test("14 — ⭐ CHAQUE CHIFFRE MODIFIÉ SE RETROUVE DEPUIS `applied`", () => {
  /* ⭐ Un personnage chargé : INT (Ioun), CA et sauvegardes (Cloak), jets de carac (Luckstone).
     Tout chiffre qui diffère du témoin est, soit un chemin d'`applied`, soit la conséquence
     d'un score d'`applied` (son `mod`, et ce qui lit ce `mod`). */
  const out = perso([
    ...ligne(0, item("ioun-stone"), { attuned: true, variant: "Intellect" }),
    ...ligne(1, item("cloak-of-protection"), { attuned: true }),
    ...ligne(2, item("stone-of-good-luck-luckstone"), { attuned: true })
  ]);
  /* témoin : les trois objets agissent — la Luckstone touche les 18 compétences et les 6 sauvegardes */
  assert.deepEqual([...new Set(out.resolved.effects.applied.map((e) => e.item))].sort(),
    ["Cloak of Protection", "Ioun Stone", "Stone of Good Luck (Luckstone)"]);
  assert.equal(out.resolved.effects.applied.filter((e) => e.target === "check.all").length, out.resolved.skills.length);
  const chemins = new Set(out.resolved.effects.applied.map((e) => e.path));
  const scores = new Set(out.resolved.effects.applied.filter((e) => /\.score$/.test(e.path)).map((e) => e.path.split(".")[2]));
  const differences = [];
  const marche = (a, b, chemin) => {
    if (typeof a === "number" || typeof b === "number") { if (a !== b) differences.push(chemin); return; }
    if (Array.isArray(a)) { a.forEach((x, i) => marche(x, b[i], `${chemin}[${x && x.id ? x.id : i}]`)); return; }
    if (a && typeof a === "object") for (const k of Object.keys(a)) marche(a[k], b[k], `${chemin}.${k}`);
  };
  marche(chiffres(TEMOIN.resolved), chiffres(out.resolved), "resolved");
  assert.ok(differences.length > 10, `témoin : le personnage chargé bouge (${differences.length} chiffres)`);
  const orphelins = differences.filter((c) => {
    if (chemins.has(c)) return false;
    const m = /^resolved\.abilities\.(\w+)\.mod$/.exec(c);
    if (m) return !scores.has(m[1]);
    const clef = /^resolved\.saves\.(\w+)\.bonus$/.exec(c)?.[1]
      || out.resolved.skills.find((s) => c === `resolved.skills[${s.id}].bonus`)?.ability
      || (/^resolved\.spellcasting\.(dc|attackBonus)$/.test(c) ? out.resolved.spellcasting.ability : null);
    return !(clef && scores.has(clef));
  });
  assert.deepEqual(orphelins, [], "⛔ un chiffre changé sans provenance est un chiffre qu'Eric ne peut pas vérifier");
});

test("15 — 🔴 LES DÉCLENCHÉS ET LES ÉTATS SONT TENUS PAR LA DONNÉE, pas par une liste de noms", () => {
  /* ⛔ Une liste par nom ne dit pas qu'elle est incomplète. On relit donc TOUTES les citations :
     un effet chiffré dont la cible a une place dans la fiche et dont la citation pose une
     restriction est soit un déclenché, soit un état, soit un `fixe`/`plancher` (dont le
     « unless » EST la règle de calcul) — et chaque entrée des deux tables est prouvée par SA
     citation. */
  const RESTRICTION = /\b(against|made to|if you|unless|bestowed by|when you)\b/i;
  const nommes = [...DECLENCHES, ...A_ETAT];
  const oublis = [];
  for (const o of INVENTAIRE.objets) for (const e of o.effets) {
    if (e.famille !== "chiffre" || ["consomme", "active"].includes(e.condition)) continue;
    const v = classerEffet(e, o.id).voie;
    if (["no-place", "mode-unsupported", "value-not-numeric"].includes(v)) continue;
    const nomme = nommes.some((d) => d.id === o.id && d.cible === e.cible);
    if (RESTRICTION.test(e.citation) && !nomme && !["fixe", "plancher"].includes(e.mode)) oublis.push(`${o.name} · ${e.cible}`);
  }
  assert.deepEqual(oublis, [], "⛔ un effet restreint serait appliqué comme s'il valait toujours");
  for (const d of nommes) {
    const o = INVENTAIRE.objets.find((x) => x.id === d.id);
    const e = o && o.effets.find((x) => x.cible === d.cible && x.citation.includes(d.preuve));
    assert.ok(e, `${d.id} · ${d.cible} : la preuve « ${d.preuve} » est une citation de l'inventaire`);
  }
});

test("16 — ⭐ LA COPIE ES EST L'INVENTAIRE, octet pour octet (régénérée dans un répertoire temporaire)", () => {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "effets-289-"));
  try {
    const { outPath } = genererLaCopie({ outDir: dossier });
    assert.equal(fs.readFileSync(outPath, "utf8"), fs.readFileSync(path.join(ROOT, "sources-effets", OUT_NAME), "utf8"),
      "⛔ la copie a dérivé de sa source : `node src/tools/gen-effets-objets.mjs`, puis commiter les deux");
  } finally {
    fs.rmSync(dossier, { recursive: true, force: true });
  }
  assert.throws(() => moduleDesEffets("{"), /JSON lisible/);
  assert.throws(() => moduleDesEffets('{"schema":"autre","objets":[]}'), /inventaire des effets/);
});

test("17 — 🔴 SUR LA PILE FATE'S HAND : l'effet sur une compétence SURVIT à la correction des paliers", () => {
  /* ⛔ LE SECOND PIÈGE DU LOT. Sur la pile maison, un module corrige les compétences APRÈS
     coup (`skillTiers`) et RECALCULE leur bonus depuis `mod` + son terme : un +1 posé avant
     serait effacé EN SILENCE. La pile SRD ne le montre pas (aucun module n'y tourne) — c'est
     donc ici, sur le personnage d'exemple, que le garde doit mordre. */
  const ex = exempleFhEn();
  const d = ex.document;
  const n = 1 + Math.max(...d.build.choices.filter((c) => /^gear\[\d+\]$/.test(c.path)).map((c) => Number(/\d+/.exec(c.path)[0])));
  const avec = { ...d, build: { ...d.build, choices: [...d.build.choices,
    ...ligne(n, item("stone-of-good-luck-luckstone"), { attuned: true })] } };
  const out = ex.build.verbs.rebuild({ document: avec });
  const corriges = d.resolved.skills.filter((s) => s.proficiency !== "none");
  assert.ok(corriges.length > 0, "témoin : le module a bien corrigé des compétences sur ce personnage");
  for (const s of d.resolved.skills) {
    assert.equal(skill(out, s.id).bonus, s.bonus + 1, `⭐ ${s.id} (${s.proficiency}) : +1 — « a +1 bonus to ability checks »`);
  }
});
