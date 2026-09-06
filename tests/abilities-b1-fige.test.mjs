/* ══ B1 FIGÉ — Eric, 2026-09-06 : « je veux que tu figes » ═══════════════════
   NORMES.md §7. Ces gardes tiennent les COTES et les RÈGLES du glisser des dés
   sur la donnée : les jetons de tokens.css, les constantes JS qui les répètent
   (deux écrivains pour une cote, le piège du 05/09), les règles de shell.css
   lues par sélecteur. Les GESTES (poser, déplacer, échanger, revenir, d'un
   podium à l'autre) sont éprouvés dans abilities-step.test.mjs. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const TOKENS = lire("ui/builder/tokens.css");
const SHELL = lire("ui/builder/shell.css");
const STEP = lire("ui/builder/abilities-step.mjs");
const TRAY = lire("ui/builder/abilities-tray.mjs");
const COQUILLE = lire("ui/builder/shell.mjs");

const jeton = (nom) => {
  const m = TOKENS.match(new RegExp(`^\\s*${nom.replace(/[-]/g, "\\-")}:\\s*([^;]+);`, "m"));
  return m ? m[1].trim() : null;
};
/* Les règles d'une feuille, par sélecteur — sans les commentaires. */
const regles = (css) => {
  const sans = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  for (const m of sans.matchAll(/([^{}]+)\{([^{}]*)\}/g)) out.push({ sel: m[1].trim().replace(/\s+/g, " "), corps: m[2] });
  return out;
};
const REGLES = regles(SHELL);
const corpsDe = (sel) => REGLES.filter((r) => r.sel === sel).map((r) => r.corps).join("\n");

test("7.1 — le dé est la cellule (41), sa face l'étalon (28), la dépression 80 % de la cellule", () => {
  assert.equal(jeton("--de-pose"), "41px");
  assert.equal(jeton("--collecteur-face"), "28px");
  assert.equal(jeton("--collecteur-creux").replace(/\s/g, ""), "calc(var(--de-pose)*.8)");
  assert.match(corpsDe(".ability-creneau .fs-de"), /width:\s*var\(--de-pose\)/, "le dé posé lit la cellule, jamais la colonne");
  const depression = REGLES.find((r) => r.sel.includes(".ability-creneau .glisse-cible-vide::before"));
  assert.ok(depression, "la dépression est dessinée par ::before");
  assert.match(depression.corps, /width:\s*var\(--collecteur-creux\)/);
  assert.match(depression.corps, /box-shadow:\s*var\(--creux\)/, "un creux, jamais un relief");
  const cellule = REGLES.find((r) => r.sel.startsWith(".ability-creneau .glisse-cible-vide,"));
  assert.match(cellule.corps, /width:\s*var\(--de-pose\)/, "la cible EST la cellule du dé");
});

test("7.1/7.5 — deux écrivains, une cote : TAILLE_DE_RESULTAT = --tray-de-resultat, FS.fantome = --de-pose", () => {
  const taille = Number(TRAY.match(/const TAILLE_DE_RESULTAT = (\d+);/)[1]);
  assert.equal(`${taille}px`, jeton("--tray-de-resultat"), "le 05/09, 30 ici et 26 là : quatre pixels de vide que personne ne voyait");
  const fantome = Number(STEP.match(/fantome:\s*(\d+)/)[1]);
  assert.equal(`${fantome}px`, jeton("--de-pose"), "le fantôme est identique à l'objet qu'on déplace");
  assert.match(corpsDe(".ability-fantome"), /width:\s*var\(--de-pose\)/);
});

test("7.2 — le dé du podium est réduit à .75 (face 28), et le .8 du moteur est repris partout où le dé est grand", () => {
  assert.match(corpsDe('.ability-des-gardes[data-podium] .fh-cd-static-die[data-sides="6"]'), /transform:\s*scale\(\.75\)/);
  assert.match(corpsDe('.ability-creneau .fs-de .fh-cd-static-die[data-sides="6"]'), /transform:\s*none/);
  assert.match(corpsDe('.ability-fantome .fh-cd-static-die[data-sides="6"]'), /transform:\s*none/);
  assert.match(corpsDe('.tray-case-de .porte-de .fh-cd-static-die[data-sides="6"]'), /transform:\s*none/, "le petit dé aussi : ×1,25 au chiffre");
});

test("7.2 — l'origine devient un collecteur : la pastille vidée porte la dépression, et la pose ne joue qu'à l'arrivée d'un lot", () => {
  assert.match(STEP, /el\("span", "fs-vide", \[renderCibleVide\(\)\]\)/, "la même dépression au podium");
  assert.match(STEP, /rollBatch\.rolls !== dernierLotPose/, "la pose est reconnue par l'identité des jets, jamais par un redessin");
  const pose = REGLES.filter((r) => r.corps.includes("ability-se-poser") && r.sel.includes("data-podium"));
  assert.ok(pose.length > 0 && pose.every((r) => r.sel.includes('[data-pose="true"]')), "la feuille n'anime que sous data-pose");
});

test("7.4 — le fantôme divise par le zoom avant de poser, et prend la cellule du dé", () => {
  const corps = STEP.slice(STEP.indexOf("function fantomeBouger"), STEP.indexOf("function gestesDuFantome"));
  assert.match(corps, /facteurZoomCourant\(\)/, "il vit dans .app, qui porte le zoom — le lot 125 avait raté ce site");
  assert.match(corps, /\$\{x \/ z/, "…et divise AVANT de poser");
  assert.match(corpsDe(".ability-fantome .porte-de, .ability-fantome .fh-cd-static-die, .ability-fantome img.fh-cd-static-snap"), /width:\s*100%/,
    "sinon le dé est monté à sa résolution (96) et le centre tombe 24 px sous le doigt");
});

test("7.5 — le chiffre : T2 sur un grand dé, T1 sur un petit, T0 pour la somme", () => {
  assert.match(corpsDe(".valeur"), /font-size:\s*var\(--t2\)/);
  assert.match(corpsDe(".tray-case-de .valeur"), /font-size:\s*var\(--t1\)/);
  assert.match(corpsDe(".tray-case-detail"), /font-size:\s*var\(--t0\)/);
  assert.equal(jeton("--t0"), "8px", "le huitième barreau, né pour cette ligne");
});

test("7.6 — aucun artefact brun pendant le geste : rien de peint en --accent au survol, au podium comme aux collecteurs", () => {
  const survol = REGLES.filter((r) => /data-vise/.test(r.sel) && /(ability-creneau|data-podium)/.test(r.sel));
  assert.ok(survol.length >= 3, "les règles de survol existent (elles éteignent, elles n'allument pas)");
  for (const r of survol) {
    assert.ok(!r.corps.includes("--accent"), `${r.sel} peint de l'accent`);
    assert.ok(!(/outline:/.test(r.corps) && !/outline:\s*none/.test(r.corps)), `${r.sel} dessine un outline`);
  }
});

test("7.8 — les trois boutons du plateau : famille octogone, bleu du mouvement, une seule cote", () => {
  for (const suffixe of ["", "::before", "::after"]) {
    const famille = REGLES.find((r) => r.sel.includes(`.sortie-bouton${suffixe},`) && r.sel.includes(".species-done"));
    assert.ok(famille && famille.sel.includes(`.tray-bouton${suffixe},`),
      `.tray-bouton${suffixe} doit être dans la famille octogone — « de type next »`);
  }
  assert.match(corpsDe(".tray-bouton"), /flex:\s*0 0 var\(--glisse-case\)/, "trois boutons identiques, à la cote partagée");
  /* ⚠️ LE BLEU SE POSE APRÈS LA FAMILLE : le défaut gris vit dans son bloc, à
     spécificité égale — écrit avant, il gagnerait et la règle serait perdante. */
  const bleu = SHELL.indexOf(".tray-bouton { --bouton-fond: var(--info); }");
  const famille = SHELL.indexOf("--bouton-fond: var(--text-muted)");
  assert.ok(bleu > 0 && famille > 0 && bleu > famille, "la teinte du plateau doit être écrite APRÈS le défaut de la famille");
  assert.match(corpsDe(".tray-boutons"), /justify-self:\s*stretch/, "la cellule s'étire…");
  assert.match(corpsDe(".tray-boutons"), /justify-content:\s*center/, "…et son contenu se centre");
  /* ⛔ Aucune apparence en double : la famille pose fond, liseré, rayon et encre. */
  for (const interdit of [/background:/, /border:/, /border-radius:/, /color:\s*var\(--text\)/]) {
    assert.ok(!interdit.test(corpsDe(".tray-bouton")), `.tray-bouton réécrit ${interdit} que la famille pose déjà`);
  }
});

test("7.8 — les libellés n'ont qu'un écrivain : l'aiguilleur les LIT, il ne les recopie pas", () => {
  assert.match(TRAY, /export const LIBELLES = \{ flash: "Flash", reset: "Reset" \};/);
  assert.match(TRAY, /bouton\(LIBELLES\.flash,/);
  assert.match(TRAY, /bouton\(LIBELLES\.reset,/);
  assert.match(STEP, /\$\{LIBELLES\.flash\}/, "la phrase de l'aiguilleur lit le libellé du plateau");
  assert.match(STEP, /\$\{meca\.boutonUn\}/, "…et le premier vient de la mécanique, jamais recopié");
  /* 🔴 06/09 au soir — L'AIGUILLEUR DE L'ORGANE N'EXISTE PLUS EN SCÈNE 2 (Eric :
     *« le premier aiguilleur disparaît quand le 2ᵉ apparaît, il ne reste que le
     titre »*). Il ne suffit donc plus de ne pas NOMMER les boutons : le paragraphe
     entier est sous la porte de la scène, et c'est ce que ce garde lit. */
  assert.match(STEP, /if \(!scene2 && !composable\) \{\n\s*flux\.append\(el\("p", "guide-mot ability-organe-mot"/,
    "l'aiguilleur de l'organe est SOUS une porte — scène 1, et pas la palette de FREE");
  assert.match(STEP, /meca \? " " \+ motDesBoutons\(meca\)/, "et il nomme les boutons tant qu'ils sont là");
  assert.match(STEP, /if \(!scene2\) flux\.append\(plateau\.commandes\)/, "le bloc entier part en scène 2");
});

test("7.7 — la sortie : Done VERT quand allumé (Eric, 06/09 : « mieux en vert »), Cancel rouge quand armé — et la coquille arme Cancel dès le premier jet", () => {
  assert.match(corpsDe('.sortie-bouton.sortie-done[data-lit="true"]'), /--bouton-fond:\s*var\(--positive\)/);
  assert.match(corpsDe('.sortie-bouton.sortie-annule[data-arme="true"]'), /--bouton-fond:\s*var\(--critical\)/);
  assert.match(COQUILLE, /back\.dataset\.arme = String\(surAbilities \? \(state\.abilityRevele > 0 \|\| Boolean\(state\.abilityRoll\)\) : true\)/);
});
