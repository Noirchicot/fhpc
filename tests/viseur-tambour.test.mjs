/* ══ LE VISEUR DU TAMBOUR, ET LA FAMILLE DE FAUTES QUI L'A CASSÉ ═══════════

   📏 LE DÉFAUT, MESURÉ AU NAVIGATEUR LE 2026-08-26. Chrome 151, `ui/builder/
   index.html` servi en local, écran « 8 Equipment » › Equipment Browser. Un
   clic sur un cran de l'une des deux roues :

       Uncaught ReferenceError: glisserVers is not defined

   ⛔ Le clic ne faisait RIEN — ni bond, ni rayon, ni étagère. Seul le geste de
   défilement choisissait encore.

   🔴 CE FICHIER NE GARDE PAS « `glisserVers` », IL GARDE LES DEUX TROUS PAR
   LESQUELS IL EST PASSÉ, et le second vaut plus que le premier :

     §A — LE COMPORTEMENT. Personne ne CLIQUAIT un cran. Le tambour a 712
          lignes de tests (`tambour-equipement.test.mjs`) et elles disent
          elles-mêmes pourquoi : « la moitié roue de cette pièce NE SE TESTE
          PAS PAR SCRIPT », parce que `dom-stub.mjs` refuse de fabriquer une
          mise en page. La conséquence n'avait pas été tirée : le CLIC, lui,
          n'a besoin que d'une RANGÉE — trois cotes et un `scrollLeft` qui
          prévient. 🗄️ Archivé le 20/09 : ses gardes vivent dans
          `roue-tambour.test.mjs` (n° 4 et 5), et la rangée qui les servait
          est partie au lot 349 (voir §A plus bas).

     §B — LA SOURCE, ET C'EST LE VRAI GARDE. Aucun identifiant appelé dans
          `ui/` ne doit être ni introuvable ni orphelin. `glisserVers` n'était
          pas une faute de frappe : c'est un organe SUPPRIMÉ dont l'appel n'a
          pas été suivi, par un commit dont le message affirmait l'inverse
          (`de88997` : « ce qu'il portait survit — `glisserVers` reste employé
          par `viser` »). ⭐ Un garde de comportement n'aurait attrapé QUE cet
          écran ; celui-ci attrape la famille entière, sur les 32 modules.

   ⭐ ET LES DEUX SONT ATTAQUÉS PLUS BAS (§C) : on leur donne la violation
   exacte du 24/08 et on exige qu'ils rougissent. Un garde qui n'a jamais été
   attaqué n'est pas un garde, c'est une intention. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments, walkSources } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ══ 🗄️ §A — L'OUTILLAGE DE LA RANGÉE, PARTI AU LOT 349 ═════════════════════════════════
   La rangée DÉCLARÉE (`poserUneRangee` : trois cotes — cran 87, écart 8, champ 277 — et un
   `scrollLeft` qui prévient), sa surcharge de `getComputedStyle`, et le montage du catalogue
   (`monterCatalogue`, `rangCourant`, `pisteB`, `patienter`, avec le document de test et
   l'import de l'étape) ne servaient QUE les trois gardes archivés le 20/09 (voir plus bas).
   Plus rien ne les appelait — ⛔ et le lot 311 a encore remis à jour le sélecteur de porte
   de `monterCatalogue` le 27/09 : un outil mort coûte quand même son entretien.
   ⭐ CE QU'ILS SAVAIENT FAIRE N'EST PAS PERDU : le mécanisme de la roue est gardé dans
   `roue-tambour.test.mjs` (n° 4 et 5), et la leçon de §A.0 tient toujours — une géométrie
   DÉCLARÉE dans le test qui en a besoin ne peut tromper que son auteur ; le stub, lui,
   refuse d'en fabriquer une. Leur corps est dans l'historique :
   `git show 38c0eaf0:tests/viseur-tambour.test.mjs`. */


/* ══════════════════════════════════════════════════════════════════════════
   §B — AUCUN NOM APPELÉ DANS `ui/` N'EST ORPHELIN
   ══════════════════════════════════════════════════════════════════════════

   🔴 LA QUESTION QUE POSE CE GARDE, EN UNE PHRASE : *un identifiant que ce
   fichier APPELLE est-il déclaré quelque part dans ce fichier, importé, ou
   connu du navigateur ?* Si non, le premier joueur qui déclenche cette ligne
   reçoit un `ReferenceError` — et rien avant lui ne l'aura dit.

   ⭐ POURQUOI ÇA VAUT PLUS QU'UN TEST DE CLIC : un test de comportement garde
   UN chemin. Celui-ci garde tous les appels des 32 modules de `ui/`, y compris
   ceux qu'aucun écran ne visite en test — et c'est exactement là que vivent
   les organes retirés dont l'appel a survécu.

   ── COMMENT IL DÉCIDE, ET POURQUOI IL NE CRIE PAS AU LOUP ────────────────
   Il n'y a pas d'analyseur syntaxique dans ce dépôt et on n'en ajoute pas un
   (loi Q3 : pas un paquet de plus). La décision est donc bâtie pour être
   SILENCIEUSE PAR CONSTRUCTION plutôt qu'exacte :

     1. les commentaires partent (`stripComments`) — ils NOMMENT les organes
        retirés, c'est même leur travail ; les juger interdirait d'expliquer ;
     2. le CONTENU des textes et des regex part aussi (`sansTexte`), en
        gardant leur place et le CODE des interpolations `${…}`. Sans cette
        passe le garde rendait 18 fausses alertes, toutes du même genre :
        `"translate("` en CSS, `max(` et `mix(` en GLSL, `${Slot}` dans un
        libellé. Avec elle : **une seule ligne, et c'était la vraie** ;
     3. est APPELÉ tout `nom(` qui ne suit pas un point et n'est pas un mot
        clef — ⛔ sauf si la parenthèse fermante est suivie d'un `{`, qui
        signe une DÉFINITION (`function f(a) {`, `get x() {`, une méthode
        d'objet), jamais un appel ;
     4. est DÉCLARÉ tout nom qui apparaît AILLEURS qu'en position d'appel —
        une liaison, un paramètre, une destructuration, une clause `import`,
        un renvoi comme valeur — plus les noms de `function f` / `class C` ;
     5. sont ADMIS les globales : celles du LANGAGE sont **dérivées** du
        `globalThis` de Node (moins ce qui n'est qu'à Node), celles du
        NAVIGATEUR sont écrites, parce que rien ici ne peut les dériver.

   ⚠️ LE HISSAGE PASSE, et c'est le point 4 qui le donne gratuitement : le
   garde ne regarde PAS l'ordre des lignes, seulement la présence d'une
   liaison dans le fichier. Une fonction appelée vingt lignes avant sa
   déclaration ne le fait pas ciller — comme le navigateur.

   ⛔ CE QU'IL NE VOIT PAS, DIT PLUTÔT QUE MASQUÉ :
     · un nom mort qui est AUSSI passé comme valeur quelque part
       (`armer(glisserVers)`) — le point 4 le croirait déclaré ;
     · une liaison de bloc lue hors de son bloc — le fichier entier fait
       portée ici, donc le garde se tait là où le navigateur jetterait ;
     · une propriété (`obj.rien()`) — ce n'est pas un `ReferenceError`.
   ⭐ Ces trois-là sont des SILENCES, jamais des cris : ce garde ne peut pas
   faire rougir une suite pour du code juste. C'est la condition pour qu'il
   survive à sa première semaine.

   📏 MESURÉ AVANT DE POSER, le 2026-08-26 : `ui/` → **1 seule prise**,
   `glisserVers` ; `src/` → zéro ; `bin/` → zéro. La portée reste `ui/` parce
   que c'est là que vit le navigateur ; l'élargir tient en une ligne. */

/* `sansTexte` a DÉMÉNAGÉ dans `source-scan.mjs` (lot 115) : le garde de portée
   de bloc (`portee-de-bloc.test.mjs`) en a besoin aussi, et importer un fichier
   de test en rejouerait les tests. Une brique, un écrivain — même règle que
   `stripComments`. */
import { sansTexte } from "./source-scan.mjs";
export { sansTexte };

const MOTS_CLEFS = new Set([
  "if", "for", "while", "switch", "catch", "function", "class", "return", "typeof",
  "instanceof", "new", "delete", "void", "await", "yield", "in", "of", "do", "else",
  "try", "finally", "case", "throw", "import", "export", "default", "const", "let",
  "var", "this", "super", "extends", "static", "get", "set", "async", "null", "true",
  "false", "break", "continue", "with", "debugger"
]);

/* ⛔ CE QUI N'EST QU'À NODE NE PASSE PAS : un `process.env` ou un `require()`
   dans `ui/` serait une vraie faute, et laisser le `globalThis` de Node les
   admettre en silence viderait le garde de moitié. */
const NODE_SEULEMENT = new Set([
  "process", "Buffer", "require", "module", "exports", "__dirname", "__filename",
  "global", "setImmediate", "clearImmediate", "gc"
]);
/** Les globales du LANGAGE — dérivées, jamais écrites : une liste tapée à la
 *  main vieillirait pendant que le langage bouge. */
const GLOBALES_DU_LANGAGE = new Set(
  Object.getOwnPropertyNames(globalThis).filter((n) => !NODE_SEULEMENT.has(n))
);
/** Les globales du NAVIGATEUR — écrites, parce que rien ici ne peut les
 *  dériver : Node n'est pas un navigateur, c'est tout le sujet de ce dépôt.
 *  ⚠️ ELLE EST FERMÉE PAR CHOIX. Le jour où `ui/` emploie une globale neuve,
 *  ce garde rougit et la demande — un mot à ajouter ici, une ligne de plus
 *  qui DIT ce que la page attend du navigateur. C'est le bon sens de la
 *  faute : un garde qui admettrait l'inconnu n'attraperait plus rien. */
const GLOBALES_DU_NAVIGATEUR = new Set([
  "document", "window", "navigator", "location", "history", "screen", "visualViewport",
  "getComputedStyle", "matchMedia", "getSelection",
  "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback", "cancelIdleCallback",
  "alert", "confirm", "prompt", "open", "close", "print", "focus", "blur",
  "localStorage", "sessionStorage", "indexedDB", "caches",
  "IntersectionObserver", "ResizeObserver", "MutationObserver",
  "Event", "CustomEvent", "PointerEvent", "KeyboardEvent", "MouseEvent", "TouchEvent",
  "Image", "Audio", "DOMParser", "XMLSerializer", "FileReader", "XMLHttpRequest",
  "Worker", "CSS", "Node", "Element", "HTMLElement", "Range", "createImageBitmap",
  "speechSynthesis", "postMessage", "scrollTo", "scrollBy"
]);

const APPEL = /(?<![.\w$?])([A-Za-z_$][\w$]*)\s*\(/g;
const IDENTIFIANT = /(?<![.\w$?])([A-Za-z_$][\w$]*)/g;

function parentheseFermante(texte, ouvrante) {
  let profondeur = 0;
  for (let i = ouvrante; i < texte.length; i += 1) {
    if (texte[i] === "(") profondeur += 1;
    else if (texte[i] === ")") { profondeur -= 1; if (profondeur === 0) return i; }
  }
  return -1;
}

function caractereSuivant(texte, i) {
  while (i < texte.length && /\s/.test(texte[i])) i += 1;
  return texte[i] || "";
}

/** Rend les noms ORPHELINS d'un module : appelés, déclarés nulle part, et
 *  inconnus du navigateur. Rendre la LISTE plutôt qu'asserter sur place, pour
 *  que la même fonction serve au garde ET à l'attaque du garde (§C). */
export function nomsOrphelins(source) {
  const texte = sansTexte(stripComments(source));

  const appeles = [];
  const positionsDAppel = new Set();
  APPEL.lastIndex = 0;
  let trouve;
  while ((trouve = APPEL.exec(texte))) {
    const nom = trouve[1];
    positionsDAppel.add(trouve.index);
    if (MOTS_CLEFS.has(nom)) continue;
    const ouvrante = texte.indexOf("(", trouve.index + nom.length);
    const fermante = parentheseFermante(texte, ouvrante);
    if (fermante !== -1 && caractereSuivant(texte, fermante + 1) === "{") continue; // définition
    appeles.push(nom);
  }

  const declares = new Set();
  IDENTIFIANT.lastIndex = 0;
  while ((trouve = IDENTIFIANT.exec(texte))) {
    if (!positionsDAppel.has(trouve.index)) declares.add(trouve[1]);
  }
  for (const m of texte.matchAll(/\b(?:function\s*\*?|class)\s+([A-Za-z_$][\w$]*)/g)) declares.add(m[1]);

  const orphelins = [];
  for (const nom of new Set(appeles)) {
    if (declares.has(nom)) continue;
    if (GLOBALES_DU_LANGAGE.has(nom) || GLOBALES_DU_NAVIGATEUR.has(nom)) continue;
    orphelins.push(nom);
  }
  return orphelins;
}

/* ══ 🗄️ ARCHIVÉS LE 20/09 — LEUR ORGANE A DÉMÉNAGÉ, ET LEUR LOI AVEC ═══════════════════
   Trois gardes vivaient ici, tous sur le VISEUR de l'ancien tambour d'Équipement :

   · « A — CLIQUER UN CRAN L'AMÈNE SOUS LE VISEUR, ET LE VISEUR CHANGE LE RAYON »
   · « A bis — LE CLIC SE POSE AU CENTRE EXACT DU CRAN, PAS À CÔTÉ »
   · « C3 — LE GARDE DE COMPORTEMENT VOIT UN CLIC QUI NE FAIT RIEN »

   ⚖️ LA LOI QU'ILS TENAIENT EST VIVANTE, ET ELLE A UN MEILLEUR TOIT. Le mécanisme de la roue
   est descendu en module feuille le 20/09 (`roue-tambour.mjs`), parce que Wares en monte DEUX
   de plus. Ses gardes tiennent exactement ce que ces trois-ci tenaient :
     · n° 5 — « taper un cran aimante la roue sur lui » — ⭐ ET IL EST ÉPROUVÉ ROUGE : retirer
       l'écouteur du module le fait tomber, et lui seul. C'est très précisément le métier de
       l'ancien C3, et il le fait sur le mécanisme plutôt que sur un écran.
     · n° 4 — « placer accepte une position fractionnaire, et arrondit le MARQUAGE seul » —
       l'arithmétique `pas × rang` que l'ancien A bis mesurait au pixel.

   🔴 ET CE QUI NE SE PORTE PAS EST ABROGÉ, PAS PERDU : ces gardes exigeaient « la roue répète
   sa liste jusqu'à DOUZE crans », la parade de l'anneau infini. Eric l'a retirée deux fois et
   explicitement — 19/09 pour le sac, 20/09 pour Wares : *« les tambours ne sont plus à
   l'infini bien sûr »*. Le garde qui tient la règle neuve est `roue-tambour` n° 1 : « trois
   crans, trois nœuds ».

   ⚖️ LOI DES DEUX ÂGES : rien ne se supprime. Ce texte garde ce qu'ils avaient coûté — cinq
   passes pour trouver le bon moment du masquage, et un défaut entendu avant d'être vu
   (*« la roue A bien fluide, la roue B pas bien, ça clignote »*, à code identique).
   ⛔ Si un viseur revient un jour dans Wares, c'est ICI qu'on relit avant d'en réécrire un. */

test("B — AUCUN IDENTIFIANT APPELÉ DANS `ui/` N'EST ORPHELIN", () => {
  const modules = walkSources(path.join(ROOT, "ui"));
  assert.ok(modules.length >= 30, `l'arpenteur a trouvé ${modules.length} modules — la portée n'est pas vide`);
  const prises = [];
  for (const fichier of modules) {
    for (const nom of nomsOrphelins(fs.readFileSync(fichier, "utf8"))) {
      prises.push(`${path.relative(ROOT, fichier)} → ${nom}()`);
    }
  }
  assert.deepEqual(prises, [],
    "un nom est appelé sans être déclaré, importé, ni connu du navigateur — " +
    "le joueur qui déclenche cette ligne reçoit un ReferenceError :\n  " + prises.join("\n  "));
});

/* ══════════════════════════════════════════════════════════════════════════
   §C — L'ATTAQUE DES DEUX GARDES
   ══════════════════════════════════════════════════════════════════════════
   ⭐ On rejoue la violation EXACTE du 2026-08-24 et on exige que le garde la
   voie. Sans ça, « vert » ne veut rien dire : les 1366 tests du dépôt étaient
   verts avec le clic mort. */

test("C1 — LE GARDE DE SOURCE VOIT LA VIOLATION DU 24/08", () => {
  const violation = `
    function viser(noeud) {
      const cible = centreDe(noeud);
      if (cible === null) return;
      glisserVers(cible);
    }
    function centreDe(n) { return n; }
  `;
  assert.deepEqual(nomsOrphelins(violation), ["glisserVers"]);
});

test("C2 — ET IL NE CRIE PAS SUR CE QUI EST JUSTE", () => {
  /* Chacune de ces lignes a fait rougir une version antérieure du garde ;
     elles sont gardées comme mesure, pas comme décoration. */
  const juste = `
    import { armerJeton } from "./glisser.mjs?v=294";
    const style = "transform: translate(3px) scale(2)";
    const gabarit = \`url(\${chemin}) et \${calculer(1)}\`;
    const motif = /\\bdestin(y|ies)/i;
    const objet = { methode() { return 1; }, get taille() { return 2; } };
    export function monter({ longueur, quandCran }, ...reste) {
      const { rayons } = lireRangement(longueur);
      armerJeton(rayons);
      quandCran(hisse());          // appelée AVANT sa déclaration : le hissage
      objet.methode();
      return reste.map((v, i) => v + i) + style + gabarit + motif.source;
    }
    function hisse() { return 0; }
    function lireRangement(q) { return { rayons: q }; }
    const chemin = "x";
    function calculer(n) { return n; }
  `;
  assert.deepEqual(nomsOrphelins(juste), []);
});

