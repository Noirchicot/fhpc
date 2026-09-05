/* ══ LE RÉGIME DES ANCRES — une règle a une adresse, un statut, une date ═══════

   Eric, 2026-09-05 : *« la priorité est qu'il n'y ait qu'une seule source de
   vérité »*, et l'AMENDEMENT n° 1 (NORMES § 1) : *« il faut que tout le monde
   sache, avant d'écrire quoi que ce soit dedans, respecte sa terminologie »*.

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER : que le corpus recommence à
   S'EMPILER. Une loi neuve doit PÉRIMER l'ancienne, pas s'installer à côté
   d'elle. Ça ne tient que si chaque règle a une ADRESSE — sans adresse, on ne
   peut ni la citer, ni la périmer, ni dire qu'une autre la remplace.

   ⛔ SA LIMITE, ET IL LA DIT LUI-MÊME : il ne juge pas si une règle est VRAIE,
   ni si deux règles s'accordent. Il juge que le DISPOSITIF d'adressage tient.
   Les contradictions de fond vivent dans `ui/builder/A-TRANCHER.md`, et c'est
   Eric qui les tranche — pas un test.

   ⚠️ POURQUOI LE LIEN NE REGARDE QUE VERS L'AVANT : la pratique établie du
   corpus est de RÉÉCRIRE EN PLACE (Eric, 26/08 : *« ne jamais relâcher,
   réécrire à la nouvelle vérité »*). Les règles écrasées avant le 2026-09-05
   n'ont plus de texte auquel se lier — leur exiger un lien retour reviendrait
   à en inventer un. Les amendements antérieurs sont donc NOMMÉS ci-dessous,
   par un compte EXACT : la liste peut rétrécir, ⛔ jamais grandir. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const CORPUS = ["NORMES.md", "CADRES.md", "SOCLE.md", "ECRANS.md", "A-TRANCHER.md"];
const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");

/* ⭐ LES STATUTS SONT UN JEU FERMÉ. Un statut inventé est une règle dont
   personne ne sait si elle oblige — c'est exactement ce qu'on répare ici. */
const STATUTS = new Set(["vivante", "dépréciée", "remplacée", "à trancher",
                         "en standby", "déployée, hors corpus"]);

/* La ligne d'adresse, telle qu'elle est posée par le lot 161 :
     📍 `mon-ancre` · vivante · 26/08 · remplace `autre-ancre`            */
const LIGNE = /^>?\s*📍\s+`([a-z0-9-]+)`\s+·\s+([^·]+?)\s+·\s+([0-9]{2}\/[0-9]{2}|\?)\s*(·.*)?$/;
const LIEN  = /\b(remplace|remplacée par)\s+`([a-z0-9-]+)`/g;

function ancres() {
  const out = [];
  for (const f of CORPUS) {
    lire(f).split("\n").forEach((l, i) => {
      /* ⛔ PAS « la ligne contient 📍 » : le pictogramme sert aussi de puce
         décorative dans la prose. Une ADRESSE est en TÊTE de ligne — c'est sa
         place qui la définit, pas sa décoration. */
      if (!/^>?\s*📍\s/.test(l)) return;
      const m = LIGNE.exec(l);
      out.push({ f, n: i + 1, brut: l, ok: !!m,
                 ancre: m?.[1], statut: m?.[2]?.trim(), date: m?.[3],
                 liens: m ? [...(m[4] || "").matchAll(LIEN)].map((x) => ({ sens: x[1], vers: x[2] })) : [] });
    });
  }
  return out;
}

test("① toute ligne d'adresse est bien formée, et son statut existe", () => {
  const mal = ancres().filter((a) => !a.ok).map((a) => `${a.f}:${a.n}  ${a.brut.trim()}`);
  assert.deepEqual(mal, [],
    "une ligne 📍 mal formée : la forme est ``📍 `ancre` · statut · JJ/MM`` " +
    "(puis, s'il y a lieu, ``· remplace `autre` ``).");
  const faux = ancres().filter((a) => a.ok && !STATUTS.has(a.statut))
    .map((a) => `${a.f}:${a.n}  statut « ${a.statut} »`);
  assert.deepEqual(faux, [],
    `statut hors du jeu fermé {${[...STATUTS].join(" · ")}}. Un statut inventé ` +
    "est une règle dont personne ne sait si elle oblige.");
});

test("② aucune ancre en double — une adresse désigne UNE règle", () => {
  const vus = new Map(), doubles = [];
  for (const a of ancres().filter((x) => x.ok)) {
    if (vus.has(a.ancre)) doubles.push(`${a.ancre} → ${vus.get(a.ancre)} ET ${a.f}:${a.n}`);
    else vus.set(a.ancre, `${a.f}:${a.n}`);
  }
  assert.deepEqual(doubles, [],
    "deux règles portent la même adresse : citer cette adresse ne désigne plus rien.");
});

test("③ aucun lien ne pointe dans le vide", () => {
  const connues = new Set(ancres().filter((a) => a.ok).map((a) => a.ancre));
  const morts = [];
  for (const a of ancres().filter((x) => x.ok))
    for (const l of a.liens)
      if (!connues.has(l.vers)) morts.push(`${a.f}:${a.n}  ${a.ancre} ${l.sens} \`${l.vers}\` — inconnue`);
  assert.deepEqual(morts, [],
    "un lien vers une ancre qui n'existe pas. ⛔ Ne pas retirer le lien : " +
    "retrouver la règle qu'il désigne, ou corriger l'adresse.");
});

test("④ LE LIEN VA DANS LES DEUX SENS — c'est tout le sujet", () => {
  /* 🔴 L'échec le plus courant de cette pratique (ADR) est *« mettre à jour un
     côté et oublier l'autre »*. Un lien à sens unique ne vaut rien : la règle
     périmée reste lisible comme si elle valait encore. */
  const par = new Map(ancres().filter((a) => a.ok).map((a) => [a.ancre, a]));
  const boiteux = [];
  for (const a of par.values())
    for (const l of a.liens) {
      const autre = par.get(l.vers);
      if (!autre) continue;
      const attendu = l.sens === "remplace" ? "remplacée par" : "remplace";
      if (!autre.liens.some((x) => x.sens === attendu && x.vers === a.ancre))
        boiteux.push(`${a.ancre} dit « ${l.sens} ${l.vers} » — mais ${l.vers} ne dit pas « ${attendu} ${a.ancre} »`);
    }
  assert.deepEqual(boiteux, [],
    "un lien à sens unique. Les deux règles se citent, ou aucune.");
});

/* ⚠️ LES AMENDEMENTS ANAMNÉSIQUES — compte EXACT, liste NOMMÉE.
   Chacun réécrit une règle dont le texte a été écrasé : il n'y a plus d'ancre
   à laquelle se lier. ⛔ Cette liste ne grandit pas. Un amendement NEUF pose
   son lien, ou ce test rougit. */
const AMENDEMENTS_SANS_LIEN = [
  "CADRES.md:65",    // « les gardes ont été RÉÉCRITS à cette vérité » — porte sur des tests, pas sur une règle
  "NORMES.md:1745",  // « un choix que le lot a pris, et qu'un mot d'Eric RENVERSE » — le choix n'a jamais été écrit
  "NORMES.md:3123",  // « CECI AMENDE UNE LIGNE QUE J'AVAIS GRAVÉE LE MATIN MÊME » — la ligne est écrasée
  "NORMES.md:3591",  // « ÇA RENVERSE UNE DÉCISION DU LOT 120, DONT LA CAUSE A DISPARU »
  "NORMES.md:4163",  // « le centrage était FAUX par construction » — constat, la règle fausse n'existe plus
];

test("⑤ un amendement NEUF porte son lien retour", () => {
  /* ⚠️ `\b` EST ASCII EN JAVASCRIPT : `\bétait` ne matche JAMAIS, parce que `é`
     n'est pas un caractère de mot — la borne exigée devant lui ne peut pas
     exister. Le garde a été écrit avec, et il ne voyait pas le seul site du
     corpus qui porte ce mot. Même famille que « un garde se teste sur les
     FORMES QUE LE TEXTE EMPLOIE » (TRAPS.md). */
  const MOTS = /(\bAMENDE\b|\bRENVERSE\b|\bRÉÉCRITS?\b|CECI DÉFAIT|était FAUX)/;
  /* ⛔ « AMENDEMENT » en TITRE est autre chose : il amende le corpus entier,
     pas une règle nommée. Ce garde vise la supersession d'UNE règle. */
  const trouves = [];
  for (const f of ["NORMES.md", "CADRES.md", "SOCLE.md"])
    lire(f).split("\n").forEach((l, i) => {
      if (/AMENDEMENT/.test(l)) return;
      if (MOTS.test(l)) trouves.push(`${f}:${i + 1}`);
    });
  const neufs = trouves.filter((t) => !AMENDEMENTS_SANS_LIEN.includes(t));
  assert.deepEqual(neufs, [],
    "un passage qui en PÉRIME un autre sans que les deux se citent. Pose " +
    "``· remplace `ancre-de-l-ancienne` `` sur la neuve et ``· remplacée par " +
    "`ancre-de-la-neuve` `` sur l'ancienne — dans LES DEUX SENS, sinon la " +
    "périmée continue de se lire comme si elle valait.");
  const partis = AMENDEMENTS_SANS_LIEN.filter((t) => !trouves.includes(t));
  assert.deepEqual(partis, [],
    "un amendement de la liste nommée a disparu : la liste doit être mise à " +
    "jour dans le même commit — sinon elle protège un site qui n'existe plus.");
});
