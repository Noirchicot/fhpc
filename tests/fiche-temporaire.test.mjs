/* ══ LOT 294 — LA FICHE DE PERSONNAGE TEMPORAIRE DU SHEET ═══════════════════
   ⚖️ Eric, 2026-09-26 : *« une fiche de perso temporaire dans Sheet »* —
   honnête et lisible, en attendant la fiche définitive qu'il dessinera.

   ── CE QUE CES GARDES TIENNENT ─────────────────────────────────────────────
   1. Sur un témoin RÉEL (Ilyra, `exempleFhEn`), la fiche porte les chiffres
      de `resolved` : un score, la CA, une sauvegarde, une compétence et son
      palier Fate's Hand.
   2. ⛔ AUCUN CALCUL DANS L'ÉCRAN — et le garde se fonde sur la DONNÉE, pas
      sur la forme du code : on change des chiffres de `resolved` à des valeurs
      qu'aucune règle ne rendrait ensemble (INT 23 avec un modificateur +3), et
      la fiche suit, à la lettre. Un écran qui recalculerait le modificateur,
      ou qui écrirait l'`after` d'un effet au lieu du chiffre du moteur,
      rougirait ici.
   3. Une rubrique `underived` dit « not derived yet » ; une rubrique vide et
      NON déclarée dit « None » — les deux ne se confondent pas.
   4. Un objet dans `effects.applied` : la provenance apparaît, lue au chemin du
      chiffre. Un objet dans `pending` : la liste « Waiting », avec la raison en
      MOTS.
   5. Le titre « temporary » est dans l'écran Sheet.
   6. 🔴 CHAQUE CHIFFRE QU'UN OBJET CHANGE TROUVE SA CASE : sur trois
      personnages qui touchent toutes les familles de cibles du moteur, aucun
      effet appliqué ne tombe dans « Other item effects ». Le chemin qu'écrit
      `derive.mjs` et celui que la fiche demande ne peuvent plus diverger en
      silence.
   7. Chaque raison que le moteur ÉMET a ses mots — l'ensemble est lu dans la
      DONNÉE (le classement de tout l'inventaire) et dans les sources du
      moteur, jamais dans une liste recopiée ici.
   ⚔️ Chacun a été vu ROUGE sous une mutation avant d'être cru vert (le rapport
   du lot 294 dit laquelle). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { createTestDocument } from "./dom-stub.mjs";
import { makeHarness, manifestOf, readJson, PILE_SRD, ROOT } from "./build-harness.mjs";

globalThis.document = createTestDocument();

const { exempleFhEn } = await import("../src/tools/exemple-fh-en.mjs");
const { createDocWriters } = await import("../src/doc/index.mjs");
const { ABILITY_KEYS } = await import("../src/build/index.mjs");
const { classerEffet } = await import("../src/build/effets-objets.mjs");
const { EN_EFFECT_REASONS } = await import("../src/labels.mjs");
const { renderFicheTemporaire, MOTS_FICHE, motDeLaRaison } = await import("../ui/builder/fiche-temporaire.mjs");
const { renderReviewStep } = await import("../ui/builder/review-step.mjs");

const FH = ["fh.destiny", "fh.skills", "fh.inheritance"];
const ILYRA = exempleFhEn();

/** La fiche d'un `{document, report}` — `resolved` lu dans le document. */
function fiche({ document, report }, { flags = FH, resolved = document.resolved } = {}) {
  return renderFicheTemporaire({ resolved, report, document, flags });
}
const rubrique = (node, cle) => node.querySelector(`[data-rubrique="${cle}"]`);
const caseDe = (node, chemin) => node.querySelector(`[data-path="${chemin}"]`);
const valeurDe = (node, chemin) => caseDe(node, chemin).querySelector(".perso-cellule-valeur").textContent;
const ligneDe = (node, cle, nom) => rubrique(node, cle).querySelectorAll(".perso-ligne")
  .find((li) => li.querySelector(".perso-ligne-nom").textContent === nom);

/* ── les personnages aux objets magiques — le chemin de `effets-objets-fiche` ── */
const H = makeHarness({ layers: PILE_SRD });
const writers = createDocWriters({ schema: readJson("schemas/fh-char.schema.json") });
let numero = 0;
function perso({ classe = "wizard", espece = null, gear = [], scores = {} } = {}) {
  numero += 1;
  const doc = writers.composer({ name: "Nodren", lang: "en", units: { distance: "ft", weight: "lb" },
    layers: manifestOf(H.layers), id: `fiche-temporaire-${numero}`, at: "2026-09-26T00:00:00Z" });
  const six = ABILITY_KEYS.map((clef) => ({ path: `abilities.${clef}`, value: scores[clef] ?? (clef === "int" ? 15 : 12) }));
  const choix = [{ path: "class", ref: { kind: "class", id: `srd:class:en:${classe}` } }, ...six, ...gear];
  if (espece) choix.push({ path: "species", ref: { kind: "species", id: `srd:species:en:${espece}` } });
  const out = H.verbs.rebuild({ document: { ...doc, build: { ...doc.build, choices: [...doc.build.choices, ...choix] } } });
  return { document: out.document, report: out };
}
function ligneDObjet(n, slug, { equipped = true, attuned, variant } = {}) {
  return [
    { path: `gear[${n}]`, ref: { kind: "item", id: `srd:item:en:${slug}` } },
    { path: `gear[${n}].quantity`, value: 1 },
    { path: `gear[${n}].equipped`, value: equipped },
    ...(attuned === undefined ? [] : [{ path: `gear[${n}].attuned`, value: attuned }]),
    ...(variant === undefined ? [] : [{ path: `gear[${n}].variant`, value: variant }])
  ];
}

test("1 — 🔴 ILYRA : la fiche porte les chiffres de `resolved` — un score, la CA, une sauvegarde, une compétence", () => {
  const r = ILYRA.document.resolved;
  const node = fiche(ILYRA);
  assert.equal(valeurDe(node, "resolved.abilities.int.score"), String(r.abilities.int.score), "le score d'INT");
  assert.equal(caseDe(node, "resolved.abilities.int.score").querySelector(".perso-cellule-note").textContent, "+3",
    "son modificateur, tel que le moteur le porte");
  assert.equal(valeurDe(node, "resolved.ac"), String(r.ac), "la CA");
  assert.equal(valeurDe(node, "resolved.saves.int.bonus"), `+${r.saves.int.bonus}`, "la sauvegarde d'INT");
  assert.match(caseDe(node, "resolved.saves.int.bonus").textContent, /proficient/, "et sa maîtrise se dit");
  const arcana = r.skills.find((s) => s.id === "arcana");
  assert.equal(ligneDe(node, "skills", "Arcana").querySelector(".perso-ligne-valeur").textContent,
    `INT · +${arcana.bonus} · Novice`, "⭐ la compétence, son bonus ET son palier Fate's Hand");
  assert.equal(valeurDe(node, "resolved.vitals.hpMax"), String(r.vitals.hpMax), "les PV max");
  assert.equal(valeurDe(node, "resolved.proficiency"), `+${r.proficiency}`, "le bonus de maîtrise");
  /* le mot du palier suit la PILE : `adept` se dit « Adept » en Fate's Hand,
     « Proficient » sans le drapeau `fh.skills` (le mot du SRD) */
  const adepte = structuredClone(r);
  adepte.skills.find((s) => s.id === "arcana").proficiency = "adept";
  assert.match(ligneDe(fiche(ILYRA, { resolved: adepte }), "skills", "Arcana").textContent, /· Adept$/);
  assert.match(ligneDe(fiche(ILYRA, { resolved: adepte, flags: [] }), "skills", "Arcana").textContent, /· Proficient$/);
  assert.match(rubrique(node, "spellcasting").textContent, /Magic Missile/, "les sorts sont là");
  assert.match(rubrique(node, "gear").textContent, /Rations×5 · not equipped/, "l'équipement : quantité et état");
  assert.match(rubrique(node, "currency").textContent, /12 sp/, "la bourse");
});

test("2 — ⛔ AUCUN CALCUL : on change les chiffres de `resolved`, la fiche suit À LA LETTRE", () => {
  const r = structuredClone(ILYRA.document.resolved);
  /* des valeurs qu'AUCUNE règle ne rendrait ensemble : un écran qui recalcule
     le modificateur (23 → +6), la sauvegarde ou le bonus de compétence depuis
     le score montrerait autre chose que ce qui est écrit ici. */
  r.abilities.int.score = 23;              // le mod reste +3 : la fiche ne le recalcule pas
  r.ac = 31;
  r.proficiency = 9;
  r.saves.int.bonus = 19;
  r.skills.find((s) => s.id === "arcana").bonus = 27;
  r.vitals.hpMax = 144;
  r.spellcasting.dc = 38;
  /* et un effet MENTEUR : son `after` dit 17, le moteur dit 23. Le chiffre
     affiché est celui de `resolved`, la provenance est celle de l'effet. */
  r.effects.applied = [{ line: 0, object: "Ioun Stone (Intellect)", item: "Ioun Stone", target: "ability.int",
    mode: "bonus", value: 2, cap: 20, condition: "harmonise+porte", path: "resolved.abilities.int.score",
    before: 15, after: 17 }];
  const node = fiche(ILYRA, { resolved: r });
  assert.equal(valeurDe(node, "resolved.abilities.int.score"), "23");
  assert.equal(caseDe(node, "resolved.abilities.int.score").querySelector(".perso-cellule-note").textContent, "+3",
    "⛔ le modificateur n'est PAS recalculé depuis le score");
  assert.equal(valeurDe(node, "resolved.ac"), "31");
  assert.equal(valeurDe(node, "resolved.proficiency"), "+9");
  assert.equal(valeurDe(node, "resolved.saves.int.bonus"), "+19");
  assert.match(ligneDe(node, "skills", "Arcana").textContent, /\+27/);
  assert.equal(valeurDe(node, "resolved.vitals.hpMax"), "144");
  assert.equal(valeurDe(node, "resolved.spellcasting.dc"), "38");
  assert.equal(caseDe(node, "resolved.abilities.int.score").querySelector(".perso-provenance").textContent,
    "15 +2 (max 20) Ioun Stone (Intellect)", "la provenance est LUE dans l'effet, pas recomposée");
});

test("3 — une rubrique `underived` dit « not derived yet » ; vide et non déclarée, elle dit « None »", () => {
  const node = fiche(ILYRA);
  /* témoin : Ilyra n'a pas d'actions, et le moteur le DÉCLARE */
  assert.ok(ILYRA.report.underived.some((u) => u.field === "actions"), "témoin : `actions` est déclarée");
  const actions = rubrique(node, "actions").querySelector(".perso-absent");
  assert.equal(actions.textContent, MOTS_FICHE.pasDerive);
  assert.equal(actions.dataset.absence, "non-derive");
  /* la MÊME rubrique vide, sans déclaration : le moteur a dérivé une liste vide */
  const sansDeclaration = { ...ILYRA.report, underived: ILYRA.report.underived.filter((u) => u.field !== "actions") };
  const vide = rubrique(fiche({ document: ILYRA.document, report: sansDeclaration }), "actions").querySelector(".perso-absent");
  assert.equal(vide.textContent, MOTS_FICHE.aucun, "⛔ une liste vide non déclarée n'est pas « non dérivée »");
  /* une rubrique ABSENTE de `resolved` — la bourse d'un personnage sans choix de bourse */
  const r = structuredClone(ILYRA.document.resolved);
  delete r.currency;
  const sansBourse = rubrique(fiche(ILYRA, { resolved: r }), "currency").querySelector(".perso-absent");
  assert.equal(sansBourse.textContent, MOTS_FICHE.pasDerive, "une rubrique absente n'est ni un tiret ni un zéro");
  /* et les deux lignes qu'une fiche de D&D porte sans que le contrat les ait */
  assert.match(node.querySelector('[data-rubrique="combat"]').textContent, /Initiativenot derived yet/);
  assert.match(rubrique(node, "senses").textContent, /Passive Perceptionnot derived yet/);
  /* ⛔ jamais un tiret muet */
  assert.ok(!/(^|\s)—(\s|$)/.test(node.textContent), "aucun tiret muet dans la fiche");
});

test("4 — 🔴 les effets d'objets : la provenance sur le chiffre, « Waiting » et « Not applied » en mots", () => {
  const out = perso({ gear: [
    ...ligneDObjet(0, "ioun-stone", { attuned: true, variant: "Intellect" }),
    ...ligneDObjet(1, "cloak-of-protection"),
    ...ligneDObjet(2, "potions-of-healing")
  ] });
  const effets = out.document.resolved.effects;
  assert.ok(effets.applied.some((a) => a.path === "resolved.abilities.int.score"), "témoin : l'Ioun Stone est appliquée");
  assert.ok(effets.pending.some((p) => p.reason === "attunement"), "témoin : la Cloak attend l'harmonisation");
  const node = fiche(out, { flags: [] });
  assert.equal(valeurDe(node, "resolved.abilities.int.score"), "17");
  assert.equal(caseDe(node, "resolved.abilities.int.score").querySelector(".perso-provenance").textContent,
    "15 +2 (max 20) Ioun Stone (Intellect)", "⭐ « INT 17 (15 +2 Ioun Stone) »");
  const attente = rubrique(node, "effects").querySelector('[data-liste="waiting"]');
  assert.ok(attente, "la liste « Waiting » apparaît");
  assert.equal(attente.querySelector(".perso-sous-titre").textContent, "Waiting");
  assert.match(attente.textContent, /Cloak of Protectionneeds attunement/, "la raison en MOTS");
  const apart = rubrique(node, "effects").querySelector('[data-liste="not-applied"]');
  assert.ok(apart, "la liste « Not applied » apparaît");
  assert.match(apart.textContent, /Potions of Healing/);
  assert.equal(apart.querySelectorAll(".perso-ligne").length, 1, "quatre entrées au moteur, UNE ligne pour le joueur");
  for (const li of [...attente.querySelectorAll(".perso-ligne"), ...apart.querySelectorAll(".perso-ligne")]) {
    assert.equal(li.querySelector(".perso-ligne-valeur").textContent, EN_EFFECT_REASONS[li.dataset.raison],
      `la raison « ${li.dataset.raison} » s'affiche en mots, pas en identifiant`);
  }
});

test("5 — le titre « temporary » est dans l'écran Sheet, au-dessus de la revue", () => {
  const node = renderReviewStep({ document: ILYRA.document, resolved: ILYRA.document.resolved,
    decisions: [], report: ILYRA.report, violations: [], flags: FH }, () => {});
  const titre = node.querySelector(".perso-titre");
  assert.ok(titre, "le titre existe");
  assert.match(titre.textContent, /temporary/i);
  assert.ok(node.querySelector(".perso-fiche"), "la fiche est dans la dalle");
  assert.ok(node.querySelector(".review-steps"), "la revue « fait / pas fait » reste, sous la fiche");
  assert.match(node.querySelector(".review-name").textContent, /Ilyra Duskleaf/);
  const texte = node.textContent;
  assert.ok(texte.indexOf("Character sheet (temporary)") < texte.indexOf("Build steps"), "la fiche d'abord, la revue ensuite");
  assert.ok(node.querySelectorAll(".review-porte").some((b) => b.textContent === "Expert view"), "Expert view reste accessible");
});

test("6 — 🔴 chaque chiffre qu'un objet change trouve sa case : rien ne tombe dans « Other item effects »", () => {
  const personnages = [
    /* INT (bonus), CA (bonus + base d'état), les six sauvegardes, DD et attaque de sort */
    perso({ gear: [
      ...ligneDObjet(0, "ioun-stone", { attuned: true, variant: "Intellect" }),
      ...ligneDObjet(1, "ring-of-protection", { attuned: true }),
      ...ligneDObjet(2, "robe-of-the-archmagi", { attuned: true })
    ] }),
    /* maîtrise, toutes les compétences (check.all), la vitesse (plancher) */
    perso({ espece: "elf", gear: [
      ...ligneDObjet(0, "ioun-stone", { attuned: true, variant: "Mastery" }),
      ...ligneDObjet(1, "stone-of-good-luck-luckstone", { attuned: true }),
      ...ligneDObjet(2, "boots-of-striding-and-springing", { attuned: true })
    ] }),
    /* PV max, une compétence (bonus), CON (fixe) */
    perso({ classe: "fighter", gear: [
      ...ligneDObjet(0, "berserker-axe", { attuned: true }),
      ...ligneDObjet(1, "gloves-of-thievery"),
      ...ligneDObjet(2, "amulet-of-health", { attuned: true })
    ] })
  ];
  const cibles = new Set();
  for (const out of personnages) {
    const applied = out.document.resolved.effects.applied;
    for (const a of applied) cibles.add(a.path.replace(/\[[^\]]+\]/, "[]").replace(/\.(str|dex|con|int|wis|cha)\./, ".*."));
    const node = fiche(out, { flags: [] });
    const autres = rubrique(node, "effects").querySelector('[data-liste="other"]');
    assert.equal(autres, null, `aucun effet orphelin : ${autres ? autres.textContent : ""}`);
    assert.equal(node.querySelectorAll(".perso-provenance").filter((p) => !p.closest('[data-rubrique="stats"]')).length > 0, true);
  }
  /* le TÉMOIN : les trois personnages touchent bien toutes ces familles — sinon
     le garde serait vert faute d'avoir rien à accuser */
  for (const attendu of ["resolved.abilities.*.score", "resolved.ac", "resolved.saves.*.bonus", "resolved.proficiency",
    "resolved.skills[].bonus", "resolved.speeds.walk", "resolved.vitals.hpMax", "resolved.spellcasting.dc",
    "resolved.spellcasting.attackBonus"]) {
    assert.ok(cibles.has(attendu), `témoin : un objet change « ${attendu} » (vus : ${[...cibles].join(", ")})`);
  }
});

test("7 — chaque raison que le moteur ÉMET a ses mots, jamais son identifiant", () => {
  const emises = new Set(["attunement", "attunement-cap", "choice"]); // les trois raisons de `pending`
  /* ① la DONNÉE : le classement de chaque effet de l'inventaire */
  const inventaire = readJson("sources-effets/objets-magiques-srd.effets.json");
  for (const objet of inventaire.objets) {
    for (const effet of objet.effets) {
      const { voie } = classerEffet(effet, objet.id);
      if (voie !== "applicable") emises.add(voie);
    }
  }
  /* ② les raisons que le moteur pose lui-même, lues dans SES sources */
  for (const fichier of ["src/build/effets-objets.mjs", "src/build/derive.mjs"]) {
    const source = fs.readFileSync(path.join(ROOT, fichier), "utf8");
    for (const m of source.matchAll(/(?:reason|raison|voie):\s*"([a-z][a-z0-9-]*)"/g)) emises.add(m[1]);
    for (const m of source.matchAll(/ecarter\(\s*a\s*,\s*"([a-z][a-z0-9-]*)"\s*\)/g)) emises.add(m[1]);
  }
  emises.delete("applicable");
  assert.ok(emises.size >= 10, `témoin : le relevé voit les raisons du moteur (${[...emises].join(", ")})`);
  for (const raison of emises) {
    assert.ok(Object.prototype.hasOwnProperty.call(EN_EFFECT_REASONS, raison), `la raison « ${raison} » n'a pas de mots`);
    assert.notEqual(motDeLaRaison(raison), raison);
    assert.notEqual(motDeLaRaison(raison), MOTS_FICHE.sansRaison);
  }
});
