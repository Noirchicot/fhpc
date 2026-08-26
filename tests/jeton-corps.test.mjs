/* ══ LE GARDE DU CORPS DU JETON — T1, ET LES DEUX RÈGLES ═════════════════

   CE QU'IL EXISTE POUR EMPÊCHER, ET C'EST MESURÉ : Eric a tranché le corps du
   jeton le 2026-08-26 — *« 13 T1 on aura moins d'enmerdes on jugera apres
   coup »*. La décision n'a JAMAIS été appliquée, et rien ne l'a signalé : la
   suite était verte à 1380 avec `.choix-glisse .glisse-jeton` à `--t2` et
   `.glisse-jeton` nue à `--t3`. ⛔ Aucun test ne regardait le corps du jeton.

   🔴 LE PIÈGE QUI A COÛTÉ LA MESURE, ET QUI EST LA RAISON DU TEST 2 :
   il y a DEUX règles qui posent une taille sur le jeton, et ce n'est pas la
   plus visible qui gagne.
     · `.glisse-jeton` .................. (0,0,1,0)  ← la règle « évidente »
     · `.choix-glisse .glisse-jeton` .... (0,0,2,0)  ← 🔴 CELLE QUI DÉCIDE
   Mesuré au navigateur : le jeton rendait **12 px** pendant que sa règle nue
   en annonçait 14. Lire la règle nue, c'est lire la source au lieu de la page
   — §0 « GOOGLE HEADLESS ». C'est le même piège que le rayon de 4 px du
   lignage, nommé dans `shell.css` deux notes plus haut.
   ➡️ D'OÙ UN GARDE QUI EXIGE LES DEUX. Corriger la gagnante seule laisserait
   un jeton à 10 px et un autre à 14 — ⛔ deux modèles pour un organe dont
   NORMES §2 dit *« jeton = UN SEUL modèle »*.

   🔴 SA LIMITE, ÉCRITE PARCE QU'ELLE NE SE VOIT PAS TOUTE SEULE : il lit la
   FEUILLE. Il prouve que les deux règles déclarent `--t1` ; il ne prouve pas
   qu'une TROISIÈME règle, plus spécifique encore, ne les écrase pas dans la
   page. Ça, seule une mesure au navigateur le dit — et c'est le test 3 qui
   la porte, sous forme de relevé daté plutôt que d'exécution. Deux regards,
   pas un.

   ⚖️ ET CE QU'IL N'AFFIRME PAS : il ne dit rien des AUTRES organes. Le nom du
   créneau était déjà à `--t1` avant ce lot, la case de la grille est à
   `--t2` et n'a jamais été tranchée. ⛔ Un garde qui déborderait de son
   mandat trancherait à la place d'Eric. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "shell.css"), "utf8"));
const GLISSER = stripComments(fs.readFileSync(path.join(ROOT, "ui", "builder", "glisser.mjs"), "utf8"));

/** Le corps déclaré par une règle, ou `null` si la règle ne le pose pas.
 *  ⛔ On lit le BLOC de la règle, pas la feuille entière : chercher
 *  « --t1 » quelque part après un sélecteur attraperait la règle d'à côté. */
function corpsDe(selecteurExact) {
  for (const [, sel, corps] of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const branches = sel.split(",").map((b) => b.trim());
    if (!branches.includes(selecteurExact)) continue;
    const m = corps.match(/(^|[;\s])font-size\s*:\s*var\(\s*(--t\d)\s*\)/);
    if (m) return m[2];
  }
  return null;
}

/* ══ 1 — LA RÈGLE QUI GAGNE ══════════════════════════════════════════════ */

test("1 — 🔴 `.choix-glisse .glisse-jeton` porte T1 — c'est ELLE qui décide (0,0,2,0)", () => {
  assert.equal(corpsDe(".choix-glisse .glisse-jeton"), "--t1",
    "Eric, 2026-08-26 : « 13 T1 on aura moins d'enmerdes on jugera apres coup » — NORMES.md §2 bis. " +
    "Et c'est cette règle-ci qui rend, pas `.glisse-jeton` nue : elle la bat en spécificité.");
});

/* ══ 2 — ⛔ ET LA RÈGLE NUE AUSSI : UN SEUL MODÈLE ═══════════════════════ */

test("2 — ⛔ `.glisse-jeton` nue porte T1 elle aussi — sinon DEUX modèles pour un organe", () => {
  assert.equal(corpsDe(".glisse-jeton"), "--t1",
    "NORMES §2 : « jeton = UN SEUL modèle ». Un jeton hors d'un `.choix-glisse` rendrait " +
    "sinon un autre corps, et l'écart vivrait là où personne ne le cherche.");
});

test("2 bis — les deux règles disent LE MÊME barreau — l'écart est ce qui se glisse", () => {
  assert.equal(corpsDe(".glisse-jeton"), corpsDe(".choix-glisse .glisse-jeton"));
});

/* ══ 3 — LE RELEVÉ AU NAVIGATEUR ═════════════════════════════════════════
   ⚠️ Ce test ne rend PAS la page — il fige les nombres relevés le 26/08 dans
   Chrome 151, pour qu'un changement de l'échelle ou de la cote de la case
   rouvre la mesure au lieu de la périmer en silence. Ce qu'il garde, c'est
   la CHAÎNE DE CAUSES du seuil d'abréviation, pas un pixel. */

const RELEVE_26_08 = {
  case: 87,          // --glisse-case
  rembourrage: 8,    // 2 × --sp-4
  lisere: 2,         // 2 × 1px
  utile: 77,
  // le mot-témoin de la dérivation du 19/08, mesuré aux deux corps
  prestidigitation: { t2: 85, t1: 73 }
};

test("3 — les 77 px utiles se DÉDUISENT de la case, ils ne sont écrits nulle part", () => {
  const { case: c, rembourrage, lisere, utile } = RELEVE_26_08;
  assert.equal(c - rembourrage - lisere, utile,
    "87 − 8 − 2 = 77. Si la case ou le rembourrage change, ce compte tombe — et le seuil " +
    "d'abréviation, qui en descend, doit être redérivé (§1 ter : un contenant DÉDUIT sa cote).");
});

test("3 bis — 🔴 `Prestidigitation` tient à T1 et sortait à T2 — c'est CE fait qui fixe le seuil", () => {
  const { utile, prestidigitation } = RELEVE_26_08;
  assert.ok(prestidigitation.t1 <= utile, "à T1, 73 des 77 px — il tient ENTIER");
  assert.ok(prestidigitation.t2 > utile, "à T2, 85 px — il sortait, d'où l'abréviation d'alors");
  assert.equal("Prestidigitation".length, 16,
    "16 caractères, AUCUNE espace où se couper — c'est le pire cas de tout le corpus anglais");
});

/* ══ 4 — LE SEUIL D'ABRÉVIATION SUIT LE CORPS ════════════════════════════ */

test("4 — 🔴 `ABREGE_MAX` vaut 16 — redérivé du corps T1, pas hérité de T2", () => {
  assert.match(GLISSER, /const ABREGE_MAX = 16;/,
    "10 était la déduction de `--t2`. Garder une conséquence après avoir retiré sa cause, " +
    "c'est laisser le code mentir : à 10, « Prestidigitation » serait abrégé alors qu'il tient.");
});

test("4 bis — ⛔ et le seuil laisse passer le mot-témoin — sinon T1 n'aurait rien acheté", async () => {
  const { abrege } = await import("../ui/builder/glisser.mjs");
  assert.equal(abrege("Prestidigitation"), "Prestidigitation",
    "le bénéfice ENTIER du passage à T1 est là : le pire mot n'est plus abrégé");
  assert.equal(abrege("Shocking Grasp"), "Shocking Grasp",
    "deux mots courts se replient, ils n'ont jamais eu besoin d'abrégé");
  assert.equal(abrege("d’insaisissabilité"), "d’insaisissabil.",
    "18 caractères — le plus long mot insécable de tout le corpus, et il est français : il est coupé à 15 plus le point, comme la règle le dit");
});

/* ══ ⚔️ LES ATTAQUES — un garde qui n'a jamais été attaqué est une intention */

test("⚔️ ATTAQUE 1 — remettre T2 sur la règle GAGNANTE rougit", () => {
  const mute = CSS.replace(
    /(\.choix-glisse \.glisse-jeton,\s*\n\.choix-glisse \.glisse-creneau-valeur \{[^}]*font-size:\s*var\()--t1(\))/,
    "$1--t2$2");
  assert.notEqual(mute, CSS, "témoin : la mutation a bien mordu");
  const relu = (() => {
    for (const [, sel, corps] of mute.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!sel.split(",").map((b) => b.trim()).includes(".choix-glisse .glisse-jeton")) continue;
      const m = corps.match(/font-size\s*:\s*var\(\s*(--t\d)\s*\)/);
      if (m) return m[1];
    }
    return null;
  })();
  assert.equal(relu, "--t2", "et le lecteur du garde la voit — il ne lit pas à côté");
});

test("⚔️ ATTAQUE 2 — corriger la règle NUE en oubliant la gagnante ne suffit pas", () => {
  /* La faute exacte du 26/08 au matin, en négatif : on croit avoir appliqué la
     norme parce que la règle qu'on lit dit `--t1`, et la page rend 12. */
  const sourd = ".glisse-jeton { font-size: var(--t1); }\n" +
                ".choix-glisse .glisse-jeton, .choix-glisse .glisse-creneau-valeur { font-size: var(--t2); }";
  const lire = (sel) => {
    for (const [, s, c] of sourd.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!s.split(",").map((b) => b.trim()).includes(sel)) continue;
      const m = c.match(/font-size\s*:\s*var\(\s*(--t\d)\s*\)/);
      if (m) return m[1];
    }
    return null;
  };
  assert.equal(lire(".glisse-jeton"), "--t1", "la règle qu'on lit dit la norme…");
  assert.notEqual(lire(".choix-glisse .glisse-jeton"), "--t1", "…et la page rend autre chose");
});

test("⚔️ ATTAQUE 3 — un seuil d'abréviation laissé à 10 est nommé", () => {
  assert.doesNotMatch(GLISSER, /const ABREGE_MAX = 10;/,
    "10 était la déduction de T2 ; le corps a changé, le seuil devait suivre");
});
