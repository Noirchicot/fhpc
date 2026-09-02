/* ══ UN VERROU QUE LE NOYAU PEUT POSER A TOUJOURS UN MOT ═══════════════════

   📏 LE DÉFAUT, VU À L'ÉCRAN : `background.boost-total-mismatch` s'affichait
   **en rouge, tel quel**, sur deux écrans. Du français de développeur dans un
   écran de joueur — ce qu'Eric a déjà fait retirer le 23/08.

   🔴 ET LA PHRASE EXISTAIT, à soixante lignes de là. Deux tables de mots
   coexistaient — les onze clefs `skill-*` de `skills-step.mjs` et les clefs
   de DÉCISION de `carnet.mjs` — et les deux appelants ne consultaient que la
   première, dont le repli est *« rends la clef »*. **Ce n'était pas un mot
   manquant, c'était un mot non demandé.**

   ⭐ CE QUE CE GARDE FAIT, ET C'EST LUI QUI VAUT PLUS QUE LE CORRECTIF : il ne
   vérifie pas la clef qu'on vient de réparer, il énumère **toutes celles que
   le noyau peut poser sur un plan** et exige un mot pour chacune. Le correctif
   seul laissait passer le PROCHAIN verrou neuf ; celui-ci le fait rougir le
   jour où il est écrit.

   📏 MESURÉ EN L'ÉCRIVANT — et il a trouvé deux gouffres de plus que celui
   qu'on m'avait signalé : sur les **dix** clefs que `decisions.mjs` peut poser
   comme verrou, huit avaient un mot ; `background.boost-disallowed` et
   `abilities.score-out-of-creation-range` n'en avaient **aucun**, dans aucune
   des deux tables. Elles seraient sorties en code brut au premier joueur qui
   les rencontrait.

   ⚠️ LA PORTÉE EST NOMMÉE, ET ELLE N'EST PAS « TOUT LE NOYAU » : `src/` peut
   prononcer 28 violations, mais les douze `stat.*`, `derive.threw`,
   `document.invariant-violated` et consorts ne remontent jamais dans un
   `plan.lock` — ce sont des pannes de dérivation, qui ont leur propre chemin
   (`derivationImpossible`). Exiger un mot de joueur pour elles serait exiger
   un mot pour une chose que le joueur ne voit pas. **Le témoin est donc
   `src/build/decisions.mjs`, le seul module qui pose des verrous sur un
   plan** — et si un jour un autre module en pose, la clause de portée
   ci-dessous rougit avant. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/** Les clefs que `decisions.mjs` peut poser sur un plan — la source de vérité,
 *  lue là où elle est écrite, jamais recopiée dans ce fichier. */
function verrousDUnPlan() {
  const src = stripComments(lire("src/build/decisions.mjs"));
  return [...new Set([...src.matchAll(/buildViolation\("([^"]+)"/g)].map((m) => m[1]))].sort();
}

/** Les clefs qui ont un mot, dans l'une ou l'autre table. */
function clefsAvecUnMot() {
  const table = (fichier, ancre) => {
    const src = stripComments(lire(fichier));
    const bloc = src.slice(src.indexOf(ancre));
    const fin = bloc.indexOf("\n};");
    return [...bloc.slice(0, fin).matchAll(/^\s*"([a-z][a-z0-9.-]+)":/gm)].map((m) => m[1]);
  };
  return new Set([
    ...table("ui/builder/skills-step.mjs", "const REFUSAL_WORDS"),
    ...table("ui/builder/carnet.mjs", "const DECISION_REFUSAL_WORDS")
  ]);
}

test("🔴 TOUT VERROU QU'UN PLAN PEUT PORTER A UN MOT — dans l'une ou l'autre table", () => {
  const verrous = verrousDUnPlan();
  assert.ok(verrous.length >= 8, `garde-fou de portée : ${verrous.length} verrous trouvés, au moins 8 attendus`);
  const mots = clefsAvecUnMot();
  const muets = verrous.filter((clef) => !mots.has(clef));
  assert.deepEqual(muets, [],
    "ces verrous s'afficheraient EN CODE BRUT, en rouge, dans un écran de joueur — " +
    "leur mot va dans `DECISION_REFUSAL_WORDS` (carnet.mjs) ou `REFUSAL_WORDS` (skills-step.mjs)");
});

test("⚔️ ATTAQUE — le garde mord : une clef sans mot le fait rougir", () => {
  /* Un garde jamais attaqué est une intention. On lui montre la violation
     exacte qu'il existe pour refuser. */
  const mots = clefsAvecUnMot();
  assert.equal(mots.has("background.boost-total-mismatch"), true, "la clef réparée a bien un mot");
  assert.equal(mots.has("verrou.invente-pour-l-attaque"), false, "et une clef inconnue n'en a pas");
  const muets = ["verrou.invente-pour-l-attaque"].filter((c) => !mots.has(c));
  assert.deepEqual(muets, ["verrou.invente-pour-l-attaque"], "le filtre attrape bien une clef muette");
});

test("🔴 UNE SEULE VOIX résout le mot — et le repli n'existe qu'à UN endroit", () => {
  /* ⛔ Deux résolveurs à repli séparé, c'est deux endroits où une clef nue
     peut sortir. `motDuVerrou` consulte la table des compétences PUIS celle
     des décisions, et c'est cette dernière qui porte l'unique repli. */
  const skills = stripComments(lire("ui/builder/skills-step.mjs"));
  assert.match(skills, /export function motDuVerrou\(violation\)/,
    "la voix unique est exportée sous un nom qui ne promet pas les compétences");
  assert.match(skills, /mots \? mots\(violation\.params \|\| \{\}\) : decisionRefusalWord\(violation\)/,
    "sa table d'abord, le carnet ensuite — et aucun repli sur la clef ici");
  assert.ok(!/: violation\.key;/.test(skills),
    "⛔ plus aucun repli sur la clef nue dans skills-step : il n'en reste qu'un, dans le carnet");
});

test("🔴 PLUS PERSONNE N'APPELLE L'ANCIENNE VOIX", () => {
  /* Un nom qui promet les compétences pour une fonction qui sert tous les
     verrous est un nom qui ment — et il mentait dans quatre fichiers. */
  for (const fichier of ["ui/builder/shell.mjs", "ui/builder/glisser.mjs",
                         "ui/builder/species-step.mjs", "ui/builder/skills-step.mjs"]) {
    assert.ok(!/skillsRefusalWord/.test(stripComments(lire(fichier))),
      `${fichier} appelle encore \`skillsRefusalWord\` — le nom est parti avec le métier`);
  }
});

test("⚠️ LA PORTÉE EST TENUE : aucun autre module ne pose de verrou sur un plan", () => {
  /* 🔴 CE QUE CETTE CLAUSE PROTÈGE : le garde du haut n'énumère qu'UN module.
     Si un second se mettait à poser des verrous de plan, la liste deviendrait
     silencieusement partielle — un garde qui ne lit plus tout ne garde rien.
     ⭐ On mesure donc que `decisions.mjs` reste le seul producteur, en lisant
     qui écrit `lock` / `stepLocks` dans `src/build/`. */
  const dossier = path.join(ROOT, "src/build");
  const poseUnVerrou = fs.readdirSync(dossier)
    .filter((f) => f.endsWith(".mjs"))
    .filter((f) => /(^|\s)lock\s*(\|\|)?=|stepLocks\.set\(/.test(stripComments(fs.readFileSync(path.join(dossier, f), "utf8"))));
  assert.deepEqual(poseUnVerrou, ["decisions.mjs"],
    "un second module pose des verrous de plan : la liste du garde ci-dessus est devenue partielle");
});
