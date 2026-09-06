/* ══ LA BOUCLE DE VALIDATION DE DESTINY — B1 ET B2 RENDENT LE MÊME ÉTAT ══════
   🔴 CE QUE CE GARDE TIENT, ET IL EST NÉ ROUGE (Eric, 2026-09-06 : *« répare la
   boucle de validation de Destiny B1 et B2, c'était en cours et pas fini »*).

   Depuis le 06/09, l'écran d'ARRIVÉE de Destiny porte un `Done` : il ACTE la
   carte au document ET SIGNE l'étape (la pastille verte de la ceinture). Cet
   écran est le même pour les deux chemins d'Eric :
     · **B1** — on tire la carte, on arrive au R d'arrivée. `destinyRang` = null.
     · **B2** — on la choisit au catalogue, et le même écran est rendu *depuis*
       le catalogue. `destinyRang` = "SB2", parce qu'Eric a réglé que `Cancel`
       y « revient à B2 ».

   ⛔ LE DÉFAUT QUE CE GARDE REFUSE : la sortie B2 de `destinyReset` a été écrite
   le 03/09, **quand aucun `Done` n'existait sur cet écran**. Son commentaire le
   dit lui-même — *« il n'efface pas plus que Back : la carte n'est actée qu'au
   Done »*. C'était vrai ce jour-là. Depuis le `Done` du 06/09, ce raccourci
   laisse partir le joueur avec **la pastille VERTE allumée sur une étape qu'il
   vient d'abandonner**, et l'arcane encore écrit à la fiche.

   ⭐ L'INVARIANT EST SUR LA DONNÉE, PAS SUR LA FORME : *aucune sortie de
   `destinyReset` ne laisse une signature debout ni une carte au document*. Il ne
   nomme aucun rang, aucun `if` : on ajoutera un troisième chemin de sortie sans
   le prévenir, et il tiendra quand même — c'est le sens de « le rang se lit, il
   ne se mémorise pas ».

   ⚠️ POURQUOI SUR LES OCTETS ET NON À L'EXÉCUTION : `shell.mjs` n'est jamais
   exécuté par la suite (leçon du lot 115 — 1536 tests verts pendant que chaque
   `Done` du builder était mort). Le dépôt garde donc ce fichier « sur les
   octets », patron de `socle.test.mjs` §E et de la garde 11 d'`ui-jetons`. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "builder");
const SHELL = fs.readFileSync(path.join(UI, "shell.mjs"), "utf8");

/** L'index de l'accolade qui ferme celle ouverte en `ouvrante`, ou -1.
    (Même fonction que `portee-de-bloc.test.mjs` — un compteur de profondeur,
    parce qu'un `[\s\S]*?` traverse l'accolade fermante en silence : TRAPS.) */
function accoladeFermante(texte, ouvrante) {
  let profondeur = 0;
  for (let i = ouvrante; i < texte.length; i += 1) {
    if (texte[i] === "{") profondeur += 1;
    else if (texte[i] === "}") { profondeur -= 1; if (profondeur === 0) return i; }
  }
  return -1;
}

/** Le code SANS ses commentaires.
    ⛔ CE GARDE A ÉTÉ VU VERT POUR UNE MAUVAISE RAISON AVANT DE L'ÊTRE POUR LA
    BONNE : j'ai retiré le `refresh()` de `destinyDone` pour l'éprouver, et il
    est resté vert — parce que le COMMENTAIRE que je venais d'écrire au-dessus
    contenait le mot `refresh()`. Un garde qui lit un commentaire ne garde rien,
    et il se protège lui-même d'autant mieux qu'on l'a bien documenté.
    ⭐ « Un match n'est pas une preuve tant qu'on n'a pas lu son contexte. » */
function sansCommentaires(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}

/** Le corps du gestionnaire `destinyReset`, accolades comprises. */
function blocDeDestinyReset() {
  const tete = SHELL.indexOf('if (action.kind === "destinyReset")');
  assert.notEqual(tete, -1, "le gestionnaire `destinyReset` doit exister dans shell.mjs");
  const ouvrante = SHELL.indexOf("{", tete);
  const fin = accoladeFermante(SHELL, ouvrante);
  assert.notEqual(fin, -1, "le bloc `destinyReset` doit être équilibré");
  return SHELL.slice(ouvrante, fin + 1);
}

test("le bloc destinyReset s'extrait et porte bien les deux chemins d'Eric", () => {
  const bloc = blocDeDestinyReset();
  /* ⛔ LE TÉMOIN SE VÉRIFIE AVANT DE SERVIR : un extracteur qui rendrait le
     fichier entier, ou trois lignes, ferait passer le garde pour de mauvaises
     raisons. On mesure sa taille et son contenu attendu. */
  assert.ok(bloc.length > 400, `bloc trop court (${bloc.length} caractères) : l'extraction a raté`);
  assert.ok(bloc.length < 4000, `bloc trop long (${bloc.length} caractères) : l'extraction a débordé`);
  assert.ok(bloc.includes('destinyRang === "SB2"'), "le chemin B2 doit être dans le bloc");
});

test("aucune sortie de destinyReset ne laisse la signature debout ni la carte au document", () => {
  /* ⛔ SANS COMMENTAIRES, POUR LA MÊME RAISON QUE LE GARDE DU BAS : la prose
     de ce bloc parle d'effacement et de signature. Un garde qui la lirait se
     déclarerait vert en lisant ce qu'il vient lui-même de faire écrire. */
  const bloc = sansCommentaires(blocDeDestinyReset());
  const sorties = [];
  for (let i = bloc.indexOf("return"); i !== -1; i = bloc.indexOf("return", i + 1)) sorties.push(i);
  assert.ok(sorties.length >= 2, `on attend au moins deux sorties (B1 et B2), vu ${sorties.length}`);

  const manquantes = [];
  for (const i of sorties) {
    const avant = bloc.slice(0, i);
    const leve = avant.includes("revoke");
    const efface = avant.includes("clear");
    if (!leve || !efface) {
      const ligne = bloc.slice(0, i).split("\n").length;
      manquantes.push(`sortie ligne ${ligne} du bloc : ${leve ? "" : "ne LÈVE pas la signature"}${!leve && !efface ? " et " : ""}${efface ? "" : "n'EFFACE pas la carte"}`);
    }
  }
  assert.deepEqual(manquantes, [],
    "chaque sortie de `destinyReset` doit d'abord lever la signature (revoke) et effacer la carte (clear) :\n  " + manquantes.join("\n  "));

  /* ⛔ ET LE GARDE NE SE CONTENTE PAS DE « LE MOT EST QUELQUE PART AVANT » : un
     troisième chemin ajouté demain passerait, parce que l'effaceur écrit plus
     haut est *avant* lui dans le texte. On exige donc **autant d'effacements
     appelés que de sorties** — un chemin muet fait retomber le compte. */
  /* La DÉCLARATION s'écrit `effacerLaDestinee = () =>` : elle ne matche pas
     `effacerLaDestinee()`. Ce compte ne voit donc que les APPELS. */
  const appels = (bloc.match(/effacerLaDestinee\(\)/g) || []).length;
  assert.equal(appels, sorties.length,
    `${sorties.length} sorties pour ${appels} effacement(s) appelé(s) : un chemin repart sans effacer`);
});

/* ══ UN GESTE QUI NE NAVIGUE PAS DOIT REDESSINER ═══════════════════════════
   🔴 LE DÉFAUT QU'ERIC VOYAIT, ET IL EST PLUS SIMPLE QUE LE PRÉCÉDENT : on
   pressait `Done` sur l'écran d'arrivée de Destiny et **il ne se passait
   rien**. La signature partait bien au document — mesuré au banc le 06/09 à
   21:4x : `data-fait` du cran 4 passait à `true` dès qu'un AUTRE geste forçait
   un rendu — mais `destinyDone` finissait par `rebuild()` sans `refresh()`.
   ⛔ Or `rebuild()` RECALCULE la fiche, il ne DESSINE rien. Le joueur voyait
   un bouton mort, le `Next` n'apparaissait jamais, et la boucle s'arrêtait là.

   ⭐ L'INVARIANT, ET IL EST NÉ DE LA SÉPARATION MÊME DES DEUX MOTS : `Next`
   navigue (`goToStep` redessine en partant), `Done` reste sur place — donc
   `Done` doit redessiner LUI-MÊME. Tout gestionnaire de Destiny qui rend la
   main sans naviguer doit appeler `refresh()`.
   ⚠️ Ce garde a été vu ROUGE avant d'être vert : sans le `refresh()` du 06/09,
   `destinyDone` était la seule sortie fautive. */
test("chaque geste de Destiny qui ne navigue pas redessine l'écran", () => {
  const gestes = ["destinyDone", "destinyReset", "destinyDraw", "destinyFlip"];
  const muets = [];
  for (const geste of gestes) {
    const tete = SHELL.indexOf(`if (action.kind === "${geste}")`);
    if (tete === -1) continue;              // un geste retiré n'est pas une faute
    const ouvrante = SHELL.indexOf("{", tete);
    const fin = accoladeFermante(SHELL, ouvrante);
    const bloc = sansCommentaires(SHELL.slice(ouvrante, fin + 1));
    const navigue = bloc.includes("goToStep(") || bloc.includes("openSurface(");
    const redessine = bloc.includes("refresh()");
    if (!navigue && !redessine) muets.push(geste);
  }
  assert.deepEqual(muets, [],
    "ces gestes changent l'état et rendent la main sans rien redessiner — à l'écran, leur bouton a l'air mort : " + muets.join(", "));
});
