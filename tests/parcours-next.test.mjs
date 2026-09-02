/* ══ LE `NEXT` D'UN BILAN AVANCE — sauf sous un item EMBOÎTÉ ═══════════════

   📏 LE DÉFAUT, MESURÉ À L'ÉCRAN (375 × 812, v430) : sur **Identity**, `Done`
   marchait — la rangée passait bien à `I changed my mind` / `Next` — et
   **`Next` ne faisait rien, deux clics de suite**. Le cran restait `1Identity`.

   🔴 LA CAUSE, ET ELLE EST D'UNE FAMILLE QU'ON REVOIT : deux endroits
   demandaient *« sommes-nous dans un B emboîté ? »* en écrivant
   `action.racine !== parcoursRacineCourante()`. Or cette fonction rend
   **`null`** pour toute étape sans catalogue à parcours — `concept` en est
   une. `"concept" !== null` est vrai, donc la branche « emboîté » prenait la
   main, rouvrait la surface et RENDAIT : le `goToStep(state.step + 1)` deux
   lignes plus bas n'était jamais atteint.

   ⭐ **UNE ABSENCE N'EST JAMAIS UNE RÉPONSE.** `null` ne voulait pas dire
   « une autre racine », il voulait dire « pas de parcours ici » — et le test
   lisait le second comme le premier.

   ⚠️ ET LE MÊME TEST SERVAIT À `I changed my mind` (le second site), où il
   fabriquait un faux item emboîté `{racine: null, path: "concept"}`. Un seul
   prédicat nommé remplace les deux.

   ⭐ CE QUE CE GARDE FAIT DE PLUS QU'UNE RELECTURE : il EXÉCUTE le prédicat
   extrait de la source, sur les racines réelles du dépôt. Une relecture dirait
   que le mot `racineEmboitee` est là ; ceci dit ce qu'il RÉPOND. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = fs.readFileSync(path.join(ROOT, "ui/builder/shell.mjs"), "utf8");
/* ⚠️ LE CODE, SANS LES COMMENTAIRES — et ce garde me l'a appris en rougissant
   sur un dépôt SAIN : la note qui explique le défaut CITE l'ancienne
   écriture, et la clause « elle ne doit revenir nulle part » la trouvait là.
   ⛔ C'est la faute que NORMES §0 nomme quatre fois — chercher une
   sous-chaîne sans l'ancrer à ce qu'on veut vraiment mesurer. Une note qui
   raconte un défaut n'est pas le défaut. */
const code = stripComments(shell);

/** Le prédicat, sorti de la coquille et rendu appelable avec une racine
 *  d'étape imposée. ⛔ On n'en réécrit pas une copie : une copie divergerait
 *  au premier réglage et ce fichier jurerait sur un code qui n'existe plus. */
function predicat(racineDeLEtape) {
  const corps = shell.match(/function racineEmboitee\(racine\) \{[\s\S]*?\n\}/);
  assert.ok(corps, "`racineEmboitee` doit être lisible d'un coup d'œil dans shell.mjs");
  const fabrique = new Function("parcoursRacineCourante", `${corps[0]}\nreturn racineEmboitee;`);
  return fabrique(() => racineDeLEtape);
}

/* ══ 1 — LES DEUX FORMES, EXÉCUTÉES ════════════════════════════════════════ */

test("🔴 UNE ÉTAPE SANS PARCOURS N'EMBOÎTE RIEN — le cas qui tuait le `Next` d'Identity", () => {
  const emboitee = predicat(null);
  assert.equal(emboitee("concept"), false,
    "Identity : `parcoursRacineCourante()` rend null, et `null` ne veut pas dire « une autre racine »");
  assert.equal(emboitee("universe"), false, "et c'est vrai de toute étape sans parcours");
  assert.equal(emboitee("background.originFeat[0]"), false,
    "même un chemin qui RESSEMBLE à un item : sans parcours, il n'y a rien sous quoi s'emboîter");
});

test("🔴 UNE ÉTAPE À PARCOURS emboîte ce qui est SOUS sa racine, et rien d'autre", () => {
  const emboitee = predicat("background");
  assert.equal(emboitee("background.originFeat[0]"), true,
    "le don d'origine est sous l'Inheritance — c'est LE cas que la branche « emboîté » sert (lot 77)");
  assert.equal(emboitee("background"), false,
    "⛔ la racine de l'étape n'est pas emboîtée SOUS elle-même : c'est le bilan de l'étape, il avance");
  assert.equal(emboitee("backgrounds"), false,
    "⚔️ et le préfixe ne suffit pas — `backgrounds` n'est pas sous `background`, il lui ressemble");
  assert.equal(emboitee("species"), false, "une racine étrangère n'est pas un emboîtement");
});

test("⚔️ ATTAQUE — l'ancienne écriture répondait FAUX sur le cas d'Identity", () => {
  /* Si ce test tombe un jour parce que les deux écritures coïncident, c'est
     que le décor ne prouve plus rien : il doit rester un cas où le défaut se
     voit. */
  const ancienne = (racine, etape) => racine !== etape;
  assert.equal(ancienne("concept", null), true, "l'ancienne disait « emboîté » sur Identity…");
  assert.equal(predicat(null)("concept"), false, "…là où la nouvelle dit « non »");
});

/* ══ 2 — LES DEUX APPELANTS L'EMPLOIENT, ET PLUS PERSONNE N'ÉCRIT L'ANCIEN ══ */

test("🔴 les DEUX sites posent la question par le prédicat, jamais par une comparaison nue", () => {
  /* ⛔ Le second site (`I changed my mind`) fabriquait un faux item emboîté
     `{racine: null, path: "concept"}`. Il n'était pas dans le rapport de
     défaut ; il était dans la même ligne de code, écrite deux fois. */
  assert.ok(!/action\.racine !== parcoursRacineCourante\(\)/.test(code),
    "l'écriture fautive ne doit revenir à aucun des deux endroits");
  const appels = code.match(/racineEmboitee\(action\.racine\)/g) || [];
  assert.equal(appels.length, 2,
    "les deux sites — le `Next` du bilan et le `I changed my mind` — posent la MÊME question");
});

test("🔴 le prédicat emploie l'idiome « sous la racine » du dépôt, pas une comparaison inventée", () => {
  /* `oublierSousLaRacine` et `parcoursOublier` définissent déjà « sous » :
     `chemin.startsWith(racine + ".")` ou `+ "["`. Trois définitions du même
     mot finiraient par diverger. */
  const corps = shell.match(/function racineEmboitee\(racine\) \{[\s\S]*?\n\}/)[0];
  assert.match(corps, /startsWith\(`\$\{etape\}\.`\)/, "le point : `background.originFeat`");
  assert.match(corps, /startsWith\(`\$\{etape\}\[`\)/, "et le crochet : `background[0]`");
  assert.match(corps, /etape === null/, "et l'absence de parcours répond « non » avant de comparer");
});
