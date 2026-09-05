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
/* ⭐ DEUX RELATIONS, ET ELLES NE DISENT PAS LA MÊME CHOSE (Eric, 2026-09-05).
     · `remplace` / `remplacée par` — la neuve TUE l'ancienne. L'ancienne passe
       au statut `remplacée` : plus personne ne doit s'en servir.
     · `borne`    / `bornée par`    — la neuve N'EN TUE AUCUNE : elle découpe une
       exception nommée dans une règle qui reste VIVANTE partout ailleurs.
     ⛔ Écrire « remplacée par » là où il fallait « bornée par » est un mensonge
     qui tue une règle encore valable sur huit écrans sur dix ; laisser une règle
     bornée toute seule en « vivante » est ce qui a causé la faute de CADRES §8,
     qu'un lot appliquait à l'envers sans pouvoir le savoir. */
const LIEN  = /(remplacée par|remplace|bornée par|borne)\s+`([a-z0-9-]+)`/g;
const MIROIR = { "remplace": "remplacée par", "remplacée par": "remplace",
                 "borne": "bornée par", "bornée par": "borne" };

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
      const attendu = MIROIR[l.sens];
      if (!autre.liens.some((x) => x.sens === attendu && x.vers === a.ancre))
        boiteux.push(`${a.ancre} dit « ${l.sens} ${l.vers} » — mais ${l.vers} ne dit pas « ${attendu} ${a.ancre} »`);
    }
  assert.deepEqual(boiteux, [],
    "un lien à sens unique. Les deux règles se citent, ou aucune. ⭐ Une règle " +
    "peut être bornée par PLUSIEURS autres : chaque borne doit répondre.");
});

/* ⚠️ LES AMENDEMENTS ANTÉRIEURS AU RÉGIME — compte EXACT, liste NOMMÉE.
   Chacun réécrit une règle dont le texte a été écrasé : il n'y a plus d'ancre à
   laquelle se lier. ⛔ Cette liste ne grandit pas. Un amendement NEUF pose son
   lien, ou ⑤ rougit.

   ⛔ ET ON NE LES ÉPINGLE PAS PAR NUMÉRO DE LIGNE. La première version le
   faisait : les 334 lignes qu'un autre siège a ajoutées au-dessus, le même
   jour, ont décalé les cinq d'un coup et rendu le garde rouge sans qu'aucun
   amendement ait bougé. Un garde ancré sur une POSITION casse à chaque édition
   étrangère — et pousse le suivant à « remettre les numéros à jour », ce qui
   est la façon ordinaire dont un garde se fait désarmer. On épingle donc sur
   l'EMPREINTE du passage : une édition ailleurs ne le voit pas, une réécriture
   DE CE PASSAGE le fait rougir, et c'est précisément ce qu'on veut. */
const AMENDEMENTS_SANS_LIEN = [
  "ont été RÉÉCRITS à cette vérité",              // porte sur des gardes, pas sur une règle
  "QU'UN MOT D'ERIC RENVERSE",                    // le choix renversé n'a jamais été écrit
  "CECI AMENDE UNE LIGNE QUE J'AVAIS GRAVÉE",     // la ligne visée est écrasée
  "RENVERSE UNE DÉCISION DU LOT 120",             // sa cause a disparu avec elle
  "le centrage était FAUX par construction",      // un constat : la règle fausse n'existe plus
];

test("④ bis une règle BORNÉE reste vivante, une règle REMPLACÉE ne l'est plus", () => {
  /* ⚖️ C'est toute la différence entre les deux relations, et elle se vérifie.
     Une règle qu'on borne vaut encore partout ailleurs — la dire `remplacée`
     la retirerait des écrans où elle est la loi. */
  const tous = ancres().filter((a) => a.ok);
  const fautes = [];
  for (const a of tous) {
    const borne = a.liens.some((l) => l.sens === "bornée par");
    const mort  = a.liens.some((l) => l.sens === "remplacée par");
    if (borne && a.statut !== "vivante")
      fautes.push(`${a.ancre} est bornée mais porte « ${a.statut} » — une borne ne tue pas.`);
    if (mort && a.statut !== "remplacée")
      fautes.push(`${a.ancre} est remplacée mais porte « ${a.statut} » — son statut doit le dire.`);
    if (borne && mort)
      fautes.push(`${a.ancre} est à la fois bornée ET remplacée : choisir laquelle est vraie.`);
  }
  assert.deepEqual(fautes, [],
    "le statut et le lien se contredisent — c'est le lien qui dit ce qui est vrai.");
});

test("⑥ TOUTE SECTION DU CORPUS PORTE UNE ADRESSE — sinon on ne peut ni la citer, ni la périmer", () => {
  /* 🔴 LE PREMIER REFUS QUE LE MANDAT DEMANDE : « une règle neuve sans ancre ».
     Une section sans adresse ne peut ni être citée par Eric, ni être périmée par
     une loi plus récente : elle s'EMPILE, et c'est la maladie entière.

     ⭐ ON COMPTE EN HIÉRARCHIE, PAS LIGNE À LIGNE. Un `##` dont les adresses
     vivent dans ses `###` est couvert — exiger une adresse sur chaque niveau
     forcerait à en inventer pour des titres qui ne portent aucune règle. La
     portée d'une section va jusqu'au prochain titre de niveau ÉGAL OU SUPÉRIEUR.

     ⛔ ET LE COMPTE EST EXACT, PAS UN PLAFOND : zéro. Une dette qui se répand
     est pire qu'une dette qui grandit — si un jour il faut rouvrir une brèche,
     elle se nomme ici, ligne par ligne, jamais par un seuil qui glisse. */
  const nues = [];
  for (const f of ["NORMES.md", "CADRES.md", "SOCLE.md"]) {
    const L = lire(f).split("\n");
    const H = [];
    L.forEach((l, i) => { const m = /^(#{2,4}) /.exec(l); if (m) H.push([i, m[1].length]); });
    H.forEach(([i, niv], n) => {
      const suite = H.slice(n + 1).find(([, nj]) => nj <= niv);
      const fin = suite ? suite[0] : L.length;
      if (!L.slice(i, fin).some((l) => l.startsWith("📍 ")))
        nues.push(`${f}:${i + 1}  ${L[i].replace(/[*`]/g, "").slice(0, 72)}`);
    });
  }
  assert.deepEqual(nues, [],
    "une section du corpus sans adresse. Pose ``📍 `famille-ce-que-dit-le-titre` " +
    "· vivante · JJ/MM`` juste sous son titre — la famille se prend dans celles " +
    "qui existent déjà (⛔ ne pas en inventer une : AMENDEMENT n° 1), et le reste " +
    "de l'adresse se lit dans le titre lui-même, négations comprises.");
});

test("⑤ un amendement NEUF porte son lien retour", () => {
  /* ⚠️ `\b` EST ASCII EN JAVASCRIPT : `\bétait` ne matche JAMAIS, parce que `é`
     n'est pas un caractère de mot — la borne exigée devant lui ne peut pas
     exister. Le garde a été écrit avec, et il ne voyait pas le seul site du
     corpus qui porte ce mot, en restant vert. Même famille que « un garde se
     teste sur les FORMES QUE LE TEXTE EMPLOIE » (TRAPS.md). */
  const MOTS = /(\bAMENDE\b|\bRENVERSE\b|\bRÉÉCRITS?\b|CECI DÉFAIT|était FAUX)/;
  /* ⛔ « AMENDEMENT » en TITRE est autre chose : il amende le corpus entier,
     pas une règle nommée. Ce garde vise la supersession d'UNE règle. */
  const sites = [];
  for (const f of ["NORMES.md", "CADRES.md", "SOCLE.md"])
    lire(f).split("\n").forEach((l, i) => {
      if (/AMENDEMENT/.test(l)) return;
      if (MOTS.test(l)) sites.push({ ou: `${f}:${i + 1}`, texte: l });
    });

  const neufs = sites
    .filter((s) => !AMENDEMENTS_SANS_LIEN.some((e) => s.texte.includes(e)))
    .map((s) => `${s.ou}  ${s.texte.trim().slice(0, 90)}`);
  assert.deepEqual(neufs, [],
    "un passage qui en PÉRIME un autre sans que les deux se citent. Pose " +
    "``· remplace `ancre-de-l-ancienne` `` sur la neuve et ``· remplacée par " +
    "`ancre-de-la-neuve` `` sur l'ancienne — dans LES DEUX SENS, sinon la " +
    "périmée continue de se lire comme si elle valait.");

  /* ⭐ ET LA LISTE NE PROTÈGE QUE CE QUI EXISTE. Une empreinte qui ne trouve
     plus son passage est une exception qui couvre le vide : elle se retire
     dans le commit qui a fait disparaître le passage, jamais plus tard. */
  const orphelines = AMENDEMENTS_SANS_LIEN
    .filter((e) => !sites.some((s) => s.texte.includes(e)));
  assert.deepEqual(orphelines, [],
    "une exception nommée ne trouve plus son passage : le retirer de la liste " +
    "dans le même commit que la disparition, sinon elle couvre du vide.");
});
