/* ══ LE GARDE DE LA COTE DU FANTÔME — lot 204, 2026-09-13 ═════════════════

   ❓ IL NAÎT D'UNE QUESTION POSÉE À ERIC, ET DE SA RÉPONSE — et une décision se
   grave AVEC sa question, c'est la loi de la maison.
   La question du lot 203 : *« Sur “Ability boosts”, le jeton +1 fait 67 px de
   large, mais la maison déclare 87 (ta cote du 19/08) — c'est la case qui ne
   l'honore plus, et le fantôme dit 87. »*
   ✅ Sa réponse, le 13/09 : *« La cote descend à 67 »* — on acte la taille
   réellement peinte ; les rangées gardent leur densité, et le fantôme rétrécit
   pour correspondre.

   📏 CE QUE LE BANC A DIT, ET CE QUE ÇA CHANGE. Relevé le 2026-09-13 à
   512 × 900, Chromium avec WebGL (`--use-gl=swiftshader
   --enable-unsafe-swiftshader --ignore-gpu-blocklist`), sur « Ability boosts »,
   DANS LES DEUX PILES (SRD et Fate's Hand), verdict identique :

       zoom sur `.app` .......... 1,36533            (512 ÷ 375, la largeur sacrée)
       la case, en blg .......... flex-basis 49,1667
       le jeton, PEINT .......... 67,13 × 65,53      ← le « 67 px » de la question
       le fantôme, PEINT ........ 118,78 × 65,53     (87 blg × 1,36533)
       écart AVANT .............. 51,65 px de large · 0,00 de haut
       écart APRÈS .............. −0,01 px de large · 0,00 de haut

   ⛔ **67 EST UNE COTE PEINTE, PAS UNE COTE** : `49,1667 × 1,36533 = 67,13`.
   Écrire `--glisse-case: 67px` poserait 67 **blg** — le fantôme peindrait 91,5
   contre 67,1, soit 24 px d'écart, huit fois la tolérance ; et toutes les
   rangées encore au plafond (les sorts, les skills, les trois boutons de
   `Roll Options`) rétréciraient au passage, ce qu'Eric ne demande pas
   (*« les rangées gardent leur densité »*). La cote qui descend est donc celle
   que le FANTÔME déclare, et elle n'a pas de nombre : c'est `--case-vive`, ce
   que la case REND dans ce bloc-ci. `--glisse-case` reste le PLAFOND, 87, la
   cote du 19/08 — la question est reposée à Eric dans le rapport du lot.

   🔴 CE QUE CE GARDE EXISTE POUR EMPÊCHER, ET C'EST UNE PANNE VÉCUE : la cote
   de la case s'est écrite QUATRE fois de suite (deux nombres égaux, un
   pourcentage, `100cqw`, puis une déduction) et, chaque fois, un organe est
   resté en arrière parce qu'il lisait l'autre nom. Le fantôme était le dernier
   — il lisait le plafond quand la case lisait la formule. ⭐ La parade n'est
   pas de recopier une valeur : c'est qu'un régime de rangement NE PUISSE PAS
   déclarer sa cote sans la donner en même temps à qui la lit de dehors.

   ⚖️ CE QU'IL N'AFFIRME PAS : il ne mesure aucun pixel — le dépôt n'a pas de
   moteur de mise en page (`dom-stub` ne fabrique aucun rectangle, et c'est
   écrit chez lui). Il tient la MÉCANIQUE qui produit les pixels ; les pixels,
   eux, sont le relevé daté ci-dessus, capture regardée à l'appui. Deux
   regards, pas un. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTestDocument } from "./dom-stub.mjs";
import { stripComments } from "./source-scan.mjs";

globalThis.document = createTestDocument();

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const lire = (f) => stripComments(fs.readFileSync(path.join(UI, f), "utf8"));
const SHELL = lire("shell.css");
const LISTES = lire("listes.css");
const TOKENS = lire("tokens.css");

const { renderChoixGlisses } = await import("../ui/builder/glisser.mjs");

/** Les blocs `sélecteur { corps }` d'une feuille — lus, jamais recopiés. */
function blocs(css) {
  const out = [];
  for (const [, sel, corps] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const s = sel.replace(/\s+/g, " ").trim();
    out.push({ sel: s.slice(s.lastIndexOf("{") + 1).trim(), corps });
  }
  return out;
}

/* ══ 1 — LE FANTÔME LIT LA COTE VIVE, PAS LE PLAFOND ═════════════════════ */

test("1 — la largeur du fantôme est `--case-vive` : ce que la case REND, pas la borne du socle", () => {
  const regle = blocs(SHELL).find((b) => /(^|,)\s*\.glisse-fantome\s*$/.test(b.sel) || /\.glisse-fantome\b/.test(b.sel) && /width\s*:/.test(b.corps));
  assert.ok(regle, "témoin — la règle du fantôme doit exister, sinon ce garde ne garde rien");
  assert.match(regle.corps, /width\s*:\s*var\(\s*--case-vive\s*\)/,
    "⛔ `--glisse-case` est un PLAFOND (87) ; une case de six caracs rend 49,17, et le fantôme mentait de 51,65 px peints");
  assert.match(regle.corps, /height\s*:\s*var\(\s*--glisse-h\s*\)/,
    "la hauteur, elle, était déjà juste des deux côtés — écart mesuré 0,00 px");
});

test("1 bis — `--case-vive` a une VALEUR DE REPLI au socle, et c'est le plafond", () => {
  /* ⭐ Sans repli, un bloc qui ne déclare aucun régime rendrait un fantôme de
     largeur `auto` — c'est-à-dire la largeur du MOT qu'il porte. Le repli du
     socle est ce qui rend la cote toujours définie. */
  const socle = blocs(TOKENS).filter((b) => /--case-vive\s*:/.test(b.corps));
  assert.equal(socle.length, 1, "un seul repli, au socle");
  assert.match(socle[0].corps, /--case-vive\s*:\s*var\(\s*--glisse-case\s*\)/,
    "⛔ pas un nombre écrit à la main : deux nombres égaux divergent au premier qui bouge");
});

/* ══ 2 — AUCUN RÉGIME NE PEUT SE TAIRE ═══════════════════════════════════
   🔴 C'EST L'ASSERTION QUI TIENT VRAIMENT LA LOI, et elle n'énumère AUCUN nom :
   elle lit les déclarations de la feuille et exige que toute règle qui pose la
   cote effective d'une case la donne AUSSI à `--case-vive`, dans la MÊME règle.
   Deux déclarations éloignées divergent au premier lot qui en bouge une ; deux
   déclarations collées ne le peuvent pas. */

test("2 — tout régime qui pose la cote d'une case la donne AUSSI à `--case-vive`, dans la même règle", () => {
  const regles = blocs(LISTES).filter((b) => /--(?:case-cedee|collecteur-case)\s*:/.test(b.corps));
  assert.ok(regles.length >= 2, "témoin — les régimes de rangement existent bien dans `listes.css`");
  const muettes = regles.filter((b) => !/--case-vive\s*:/.test(b.corps));
  assert.deepEqual(muettes.map((b) => b.sel), [],
    "⛔ un régime qui pose sa cote sans la passer à `--case-vive` laisse le fantôme sur le plafond du socle");
  /* ⭐ et ce qu'elle donne est bien SA cote, pas un second nombre */
  for (const b of regles) {
    const sienne = b.corps.match(/--(case-cedee|collecteur-case)\s*:/)[1];
    assert.match(b.corps, new RegExp(`--case-vive\\s*:\\s*var\\(\\s*--${sienne}\\s*\\)`),
      `${b.sel} — la cote vive LIT la formule du bloc, elle ne la recopie pas`);
  }
});

test("2 bis — ⚔️ ATTAQUE : un régime neuf qui se tait est VU", () => {
  const faux = LISTES + "\n.choix-glisse[data-rangs=\"runes\"] { --collecteur-case: min(var(--glisse-case), 40px); }\n";
  const muettes = blocs(faux).filter((b) => /--(?:case-cedee|collecteur-case)\s*:/.test(b.corps) && !/--case-vive\s*:/.test(b.corps));
  assert.equal(muettes.length, 1, "le régime ajouté sans cote vive est nommé");
  assert.match(muettes[0].sel, /runes/, "⭐ et il est NOMMÉ : un compte juste ne dirait pas lequel");
});

/* ══ 3 — LE GESTE : LA COPIE EST MONTÉE DANS LE BLOC DE SON JETON ═════════
   ⭐ C'est la DONNÉE du geste, pas la forme du code : on joue un vrai glisser
   sur un vrai bloc rendu, et on regarde où la copie atterrit. L'héritage CSS
   ne descend que dans l'arbre — un fantôme monté ailleurs ne PEUT PAS lire
   `--case-vive`, quelle que soit la feuille. */

const planDe = () => ({ status: "pending", answered: 0, expected: 2 });
const slotsDe = () => ([
  { path: "x[0]", index: 0, options: ["a", "b"], selected: [] },
  { path: "x[1]", index: 1, options: ["a", "b"], selected: [] }
]);

function glisser(jeton) {
  document.elementFromPoint = () => null;
  jeton.dispatchEvent({ type: "pointerdown", clientX: 0, clientY: 0, pointerId: 1, button: 0, pointerType: "mouse" });
  document.dispatchEvent({ type: "pointermove", clientX: 40, clientY: 40, pointerId: 1 });
}
function relacher() {
  document.dispatchEvent({ type: "pointerup", clientX: 40, clientY: 40, pointerId: 1 });
}

test("3 — en plein vol, la copie est DANS le `.choix-glisse` de son jeton", () => {
  const bloc = renderChoixGlisses({
    plan: planDe(), slots: slotsDe(), titre: "Ability boosts", mot: "Ability",
    rangee: "caracs", labelOf: (id) => id, onAction: () => {}
  });
  const jeton = bloc.querySelectorAll(".glisse-jeton")[0];
  assert.ok(jeton, "témoin — le vivier rend bien des jetons");
  glisser(jeton);

  const fantome = bloc.querySelectorAll(".glisse-fantome")[0];
  assert.ok(fantome, "sonde — le fantôme existe, sinon ce garde ne garde rien");
  assert.equal(fantome.parentNode, bloc,
    "⭐ monté DANS le bloc : c'est la seule façon d'hériter `--case-vive` sans une taille en style EN LIGNE (garde 7)");
  assert.equal(jeton.closest(".choix-glisse"), bloc,
    "⭐ et c'est bien LE MÊME bloc que celui du jeton copié — pas un voisin");

  /* 🔴 ET LE BLOC PORTE L'ATTRIBUT QUI CHOISIT LE RÉGIME : sans lui, la règle
     de `listes.css` qui déclare `--case-vive` ne mordrait pas, et l'héritage
     rendrait le plafond. La chaîne est donc entière, bout à bout. */
  assert.equal(bloc.getAttribute("data-rangs"), "caracs",
    "le bloc déclare son régime — c'est lui que `listes.css` sélectionne pour poser la cote vive");
  relacher();
  assert.equal(bloc.querySelectorAll(".glisse-fantome").length, 0, "et rien ne survit au geste");
});

test("3 bis — ⚔️ ATTAQUE : un jeton SORTI de son bloc garde son fantôme (le repli tient)", () => {
  /* ⛔ Une réparation qui tuerait le fantôme d'un jeton vivant hors d'un
     `.choix-glisse` serait pire que le défaut qu'elle répare : le fantôme est
     ce qui dit au doigt ce qu'il transporte. Le repli se PROUVE, il ne se
     promet pas — et on le prouve sur le vrai organe, jeton armé par
     `renderChoixGlisses`, simplement reparenté hors de son bloc. */
  const bloc = renderChoixGlisses({
    plan: planDe(), slots: slotsDe(), titre: "x", mot: "Choice",
    labelOf: (id) => id, onAction: () => {}
  });
  const jeton = bloc.querySelectorAll(".glisse-jeton")[0];
  const ailleurs = document.createElement("div");
  document.body.append(ailleurs);
  ailleurs.append(jeton);
  assert.equal(jeton.closest(".choix-glisse"), null, "témoin — ce jeton n'a plus de bloc");

  glisser(jeton);
  assert.equal(document.body.querySelectorAll(".glisse-fantome").length, 1,
    "⭐ la copie existe quand même : elle est retombée sur le repli (`.app`, sinon `<body>`)");
  assert.equal(bloc.querySelectorAll(".glisse-fantome").length, 0,
    "et elle n'est pas allée se poser dans un bloc qui n'est plus le sien");
  relacher();
  assert.equal(document.body.querySelectorAll(".glisse-fantome").length, 0, "rangée avec le geste");
  ailleurs.remove();
});
