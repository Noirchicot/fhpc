/* ══ LE GARDE DES POPUPS MAJEURS — lot 251, 2026-09-23 ═══════════════════════
   ⚖️ Eric, 23/09 : *« règles pour les popups majeurs : ce qu'ils recouvrent
   passe au voile 0 tant qu'ils sont ouverts »*, puis *« X0 est un popup
   majeur »*, puis, à la question laissée ouverte au lot 250 — *« quels autres
   popups le sont ? »* — sa réponse : *« X1 et X2 »*.

   ⭐ ET LES TROIS N'HONORENT PAS LA RÈGLE DE LA MÊME FAÇON, ce qui est le fond
   de ce garde :
     · X0 RECOUVRE l'écran Gear — son nœud reste au document, donc il faut
       l'éteindre. C'est le cas où la règle TRAVAILLE.
     · X1 et X2 REMPLACENT la vue — `rendu()` retourne LEUR nœud, et celui du
       sac n'est jamais construit. 📏 Mesuré au navigateur le 23/09 : la fiche
       X1 ouverte n'a AUCUN frère dans `.equipment-step`. Il n'y a rien à
       voiler, et c'est la forme la plus forte de la règle.

   🔴 CE QUE CE GARDE EMPÊCHE, ET IL N'EST PAS THÉORIQUE : le jour où X1 ou X2
   deviendrait un CALQUE posé par-dessus le sac — pour garder le défilement,
   pour animer une ouverture — elle recouvrirait sans éteindre, et le sac
   transparaîtrait sous le parchemin. ⛔ Le symptôme serait visuel, tardif, et
   personne ne penserait à cette règle en le voyant. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const lire = (f) => fs.readFileSync(path.join(UI, f), "utf8");
/* ⛔ UN GARDE LIT LE CODE, JAMAIS LA PROSE QUI L'ENTOURE — 🔴 sans ce retrait,
   ce garde rougissait sur un `return` parfaitement correct : un commentaire de
   250 caractères le séparait de son `if`. Un garde qu'on relâche pour faire
   passer un commentaire finit par ne plus rien garder. */
const sansCommentaires = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/* 🔴 LES DEUX PREMIERS GARDES ONT ÉTÉ RETIRÉS LE 2026-09-23 (lot 254), ET LEUR
   LOI AVEC EUX. Eric : *« X0 va utiliser le même process que X1 et X2. ou oublie
   le voile 0 »*. X0 ne RECOUVRE plus Gear : elle le REMPLACE, comme X1 et X2.
   ⭐ IL N'Y A DONC PLUS DE « POPUP MAJEUR » DU TOUT — la catégorie était née
   d'un seul cas, et ce cas vient de rejoindre les autres. Ce qui reste est une
   loi plus simple, plus forte, et qui n'a plus d'exception à nommer : UN ÉCRAN
   DE RANG X REMPLACE SA VUE, IL NE SE POSE JAMAIS DESSUS.
   ⛔ Le garde ③ ci-dessous la tient pour les TROIS, et il n'a pas eu besoin
   d'être modifié : il demandait déjà que la vue RETOURNE son nœud. C'est le
   signe qu'il gardait le bon fait — le voile 0 n'était qu'un pansement sur la
   seule qui ne le faisait pas. */

test("LES TROIS ÉCRANS DE RANG X REMPLACENT leur vue — ⛔ aucun ne se pose PAR-DESSUS", () => {
  const etape = sansCommentaires(lire("equipment-step.mjs"));
  /* ⭐ X0 A REJOINT LA LISTE LE 23/09 : elle était le seul calque, et c'est à ça
     qu'on a vu que son parchemin ne se peignait jamais. */
  assert.ok(/return construireX0\(\)/.test(etape),
    "⛔ X0 ne se RETOURNE plus : si elle est ajoutée à un écran, elle le recouvre sans l'éteindre");
  assert.ok(!/noeud\.append\(voile\)/.test(etape),
    "⛔ le voile de X0 est de nouveau AJOUTÉ dans un autre écran — le calque est revenu");
  /* 🔴 RESSERRÉ APRÈS AVOIR ÉTÉ ÉPROUVÉ MUET (23/09). La première écriture
     acceptait 120 caractères entre le `if` et le `return` — et attrapait le
     `return` de la branche SUIVANTE. ⚔️ Remplacer `return construireX1()` par
     un simple appel ne la faisait pas rougir : elle gardait le mot « return »
     du voisin. ⛔ Un garde trop large ne garde pas moins, il ne garde RIEN.
     ⭐ Le `return` doit maintenant suivre l'accolade fermante du `if`, sans
     rien entre les deux — c'est exactement ce que la loi dit. */
  for (const vue of ["x1", "x2"]) {
    const re = new RegExp(`if \\(vue === "${vue}"[^)]*\\)\\s*(\\{\\s*)?return `);
    assert.ok(re.test(etape),
      `⛔ la vue « ${vue} » ne RETOURNE plus son nœud : si elle est désormais ajoutée à un écran existant, elle le recouvre sans l'éteindre`);
  }
  /* ⚔️ ET LE TÉMOIN EN SENS INVERSE : aucune des deux ne s'ajoute à un nœud. */
  assert.ok(!/\.append\(\s*construireLaFicheX[12]\b/.test(etape),
    "⛔ une fiche X est ajoutée à un nœud existant : elle devient un calque, et la règle des popups majeurs cesse d'être honorée par construction");
});
