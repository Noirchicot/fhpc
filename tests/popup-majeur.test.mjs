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

test("① X0 RECOUVRE, donc son écran se DÉCLARE recouvert", () => {
  const etape = lire("equipment-step.mjs");
  assert.ok(/noeud\.dataset\.popupMajeur\s*=\s*"oui"/.test(etape),
    "⛔ l'écran que X0 recouvre ne pose plus `data-popup-majeur` : ce qu'elle cache redeviendrait visible sous le parchemin");
  /* ⭐ ET L'ATTRIBUT EST POSÉ PAR L'ÉCRAN, JAMAIS PAR LE POPUP — un popup ne
     sait pas ce qu'il cache, un écran sait qu'il est caché. */
  const i = etape.indexOf("noeud.dataset.popupMajeur");
  const j = etape.indexOf("noeud.append(voile)", i);
  assert.ok(j > i && j - i < 400,
    "⛔ la déclaration s'est éloignée de la pose du voile : les deux gestes sont le même fait");
});

test("② la feuille ÉTEINT ce qui est recouvert, et ne le retire pas", () => {
  const css = lire("shell.css");
  const bloc = css.slice(css.indexOf('[data-popup-majeur="oui"]'));
  assert.ok(bloc.startsWith('[data-popup-majeur="oui"] > :not(.aiguilleur)'),
    "⛔ la règle ne vise plus « tout sauf le popup » : elle éteindrait le popup avec le reste");
  const corps = bloc.slice(0, bloc.indexOf("}"));
  assert.ok(/opacity:\s*0/.test(corps), "⛔ le voile 0 a disparu");
  assert.ok(/pointer-events:\s*none/.test(corps),
    "⛔ sans cela un doigt atteint une cible INVISIBLE à travers le parchemin — le pire des deux mondes");
  assert.ok(!/display:\s*none/.test(corps),
    "⛔ `display: none` retire la BOÎTE : au retour, tout est remesuré et rien n'est à sa place");
});

test("③ X1 et X2 REMPLACENT la vue — ⛔ elles ne se posent jamais PAR-DESSUS", () => {
  const etape = sansCommentaires(lire("equipment-step.mjs"));
  for (const vue of ["x1", "x2"]) {
    const re = new RegExp(`if \\(vue === "${vue}"[^)]*\\)[\\s\\S]{0,120}?return `);
    assert.ok(re.test(etape),
      `⛔ la vue « ${vue} » ne RETOURNE plus son nœud : si elle est désormais ajoutée à un écran existant, elle le recouvre sans l'éteindre`);
  }
  /* ⚔️ ET LE TÉMOIN EN SENS INVERSE : aucune des deux ne s'ajoute à un nœud. */
  assert.ok(!/\.append\(\s*construireLaFicheX[12]\b/.test(etape),
    "⛔ une fiche X est ajoutée à un nœud existant : elle devient un calque, et la règle des popups majeurs cesse d'être honorée par construction");
});
