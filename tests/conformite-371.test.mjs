/* ══ LOT 371 — LES LOTS DE LA NUIT, REMIS EN CONFORMITÉ AVEC LA BIBLE ══════════════════════════════

   L'audit du lot 370 (https://claude.ai/artifact/6Bchou6mByxFDvVKp2iDXv) a relu les dix lots du 29 au 30/09
   contre la Builder Bible. Ce garde tient les lignes que la Bible tranche seule et qui ne vivent pas déjà
   dans un garde d'écran (Gear : `gear-next-vit-dans-r` ; les deux fenêtres : `ecran-layers` D9 et
   `premier-pas` B4/G3) :
   ① l'étiquette de Layers au moins en T1 (`ecriture-aucun-texte-sous-t1`, `panneau-plancher`) ;
   ② `Back` bleu partout où la coquille le pose (`bouton-back-bleu-done-vert`) ;
   ③ un `Cancel` qui efface DEMANDE d'abord, et la question exige sa réponse (`bouton-famille-defaire`,
     `popup-question-exige-une-reponse`).

   ⛔ SA LIMITE : la coquille se lit dans sa SOURCE (comme `destiny-boucle`) — le comportement, la question
   rendue et le geste rejoué, se prouve au navigateur (rapport du lot 371). */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => fs.readFileSync(path.join(ROOT, "ui", "builder", f), "utf8");
const css = stripComments(lire("shell.css"));
const tokens = stripComments(lire("tokens.css"));
const shell = stripComments(lire("shell.mjs"));

/** La valeur en px d'un cran de texte (`--t0`…`--t7`), lue dans `tokens.css`. */
function pxDuCran(nom) {
  const m = tokens.match(new RegExp(`--${nom}:\\s*calc\\((\\d+)px`));
  assert.ok(m, `témoin : --${nom} est déclaré dans tokens.css`);
  return Number(m[1]);
}
/** La déclaration d'une propriété dans LA règle dont le sélecteur est exactement `selecteur`. */
function declaration(selecteur, propriete) {
  const esc = selecteur.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|})\\s*${esc}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `la règle « ${selecteur} » existe`);
  const d = m[1].match(new RegExp(`${propriete}:\\s*([^;]+);`));
  return d ? d[1].trim() : null;
}

test("① l'étiquette de Layers (« base book ») ne passe pas sous T1 ; seules les familles dictées restent en T0", () => {
  const plancher = pxDuCran("t1");
  const etiquette = declaration(".ligne-etiquette", "font-size");
  const cran = (etiquette.match(/var\(--(t\d)\)/) || [])[1];
  assert.ok(cran, `l'étiquette déclare un cran de l'échelle (${etiquette})`);
  assert.ok(pxDuCran(cran) >= plancher, `⛔ l'étiquette est en ${cran} (${pxDuCran(cran)} px) : sous T1 (${plancher} px)`);
  /* témoin : les familles restent en T0 — la dictée d'Eric (« en italique t0 »), une cote donnée */
  assert.equal(declaration(".ligne-familles", "font-size"), "var(--t0)");
});

test("② `Back` est bleu partout où la coquille le pose — pas seulement dans un pied de parcours", () => {
  assert.equal(declaration(".sortie-bouton.sortie-back", "--bouton-fond"), "var(--info)",
    "⛔ hors d'un pied de parcours, `Back` retombe sur le transparent (rangs B du Menu, audit du lot 370)");
  /* témoin : les deux autres états de la sortie, à la même spécificité */
  assert.equal(declaration('.sortie-bouton.sortie-done[data-lit="true"]', "--bouton-fond"), "var(--positive)");
  assert.equal(declaration('.sortie-bouton.sortie-annule[data-arme="true"]', "--bouton-fond"), "var(--critical)");
});

/** Le corps d'une branche `if (action.kind === "<verbe>") { … }` de la coquille, accolades comptées. */
function branche(verbe) {
  const debut = shell.indexOf(`if (action.kind === "${verbe}")`);
  assert.ok(debut >= 0, `témoin : la branche ${verbe} existe`);
  const ouvre = shell.indexOf("{", debut);
  let profondeur = 0;
  for (let i = ouvre; i < shell.length; i += 1) {
    if (shell[i] === "{") profondeur += 1;
    else if (shell[i] === "}" && --profondeur === 0) return shell.slice(ouvre, i + 1);
  }
  return "";
}

test("③ la question avant d'effacer : elle nomme, elle EXIGE sa réponse, et seul son « oui » rejoue l'effaceur", () => {
  const debut = shell.indexOf("function questionAvantDEffacer(");
  assert.ok(debut >= 0, "⛔ aucune question avant d'effacer");
  const corps = shell.slice(debut, shell.indexOf("\n  }\n", debut));
  assert.match(corps, /exigeUneReponse: true/, "⛔ un tap dehors fermerait la question (`popup-question-exige-une-reponse`)");
  assert.match(corps, /role: "aiguilleur"/, "ce qu'on ne peut pas refuser est un aiguilleur");
  assert.match(corps, /perdus\.map/, "elle NOMME ce qui part (le patron de `confirm.mjs`)");
  assert.match(corps, /defait: true, faire: \(\) => appliquerLaDecision\(\{ \.\.\.rejouer, confirme: true \}\)/,
    "⛔ le « oui » doit porter le rouge de ce qui défait ET rejouer le même geste, confirmé");
});

test("③ bis — les cinq `Cancel` qui effacent demandent D'ABORD, s'il y a quelque chose à perdre", () => {
  /* `parcoursCancel` : le guide de Species, de Background, de Class, et du don emboîté */
  const pc = branche("parcoursCancel");
  const garde = pc.indexOf("if (action.confirme !== true)");
  assert.ok(garde >= 0, "⛔ `parcoursCancel` efface sans demander");
  assert.ok(pc.indexOf("questionAvantDEffacer(action, perdus)") > garde, "la question se pose dans la garde");
  assert.match(pc, /if \(perdus\.length > 0\)/, "⚠️ la question ne se pose que s'il y a quelque chose à perdre (§C24)");
  for (const effaceur of ["revoke(", "verbs.clear("]) {
    assert.ok(pc.indexOf(effaceur) > garde, `⛔ ${effaceur} passe AVANT la question`);
  }
  /* `destinyReset` : le `Cancel` de Destiny */
  const dr = branche("destinyReset");
  const gardeD = dr.indexOf("if (action.confirme !== true");
  assert.ok(gardeD >= 0, "⛔ `destinyReset` efface sans demander");
  assert.ok(dr.indexOf("questionAvantDEffacer(action,") > gardeD);
  const premierEffacement = dr.indexOf("effacerLaDestinee();");
  assert.ok(premierEffacement > gardeD, "⛔ un effacement passe AVANT la question");
  /* témoin : les deux verbes sont bien ceux des cinq `Cancel` (parcours-ecrans ×2, destiny-step) */
  assert.equal((lire("parcours-ecrans.mjs").match(/kind: "parcoursCancel"/g) || []).length, 2);
  assert.match(lire("destiny-step.mjs"), /bouton\("Cancel", "parcours-annuler", \(\) => act\(\{ kind: "destinyReset" \}\)\)/);
});
