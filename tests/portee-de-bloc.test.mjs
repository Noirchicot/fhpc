/* ══ UNE LIAISON DE BLOC LUE HORS DE SON BLOC — le garde du lot 115 ═════════

   📏 LE DÉFAUT, MESURÉ AU NAVIGATEUR LE 2026-09-02 (Chromium, `ui/builder/
   index.html` servi en local, v424) : sur TOUTE étape sauf Destiny, un clic
   sur `Done` ou sur le `Choose` d'une fiche :

       Uncaught ReferenceError: gate is not defined   (pressDone, shell.mjs)

   ⛔ Le clic ne faisait RIEN. Aucune espèce, aucune classe, aucune étape ne
   pouvait plus être validée — en production de v417 à v424, deux jours.

   🔴 LA CAUSE TIENT EN UNE ACCOLADE. Le commit `d0d3af6` (30/08, la cérémonie
   de Destiny) a posé un bloc `if (destiny …) { … }` en tête de `pressDone`, et
   son accolade fermante est descendue SOUS les deux lignes qui suivaient :

       if (destiny) {
         …
         const gate = currentGate();   ← déclarée DANS le bloc
         if (!gate.ready) return;
       }
       if (gate.action) …              ← lue HORS du bloc → ReferenceError

   ⭐ POURQUOI 1536 TESTS VERTS N'ONT RIEN VU, et c'est ce que ce fichier ferme :
     · `shell.mjs` n'est jamais EXÉCUTÉ par la suite — il est lu comme texte
       (`shell-wiring`, `echelle-pied`…), et une regex qui trouve
       `pressDone()` ne sait pas si `gate` existe ;
     · le garde des orphelins (`viseur-tambour.test.mjs` §B) juge le FICHIER
       entier comme une seule portée, et le dit lui-même dans ses silences :
       *« une liaison de bloc lue hors de son bloc — le fichier entier fait
       portée ici, donc le garde se tait là où le navigateur jetterait »*.
       `gate` était déclarée deux fois dans `shell.mjs` : pour lui, elle
       existait.

   ── CE QUE CE GARDE JUGE ─────────────────────────────────────────────────
   Pour chaque fonction de premier niveau d'un module de `ui/` : un nom
   déclaré par `const`/`let` DANS un bloc imbriqué, puis LU à un endroit que
   ce bloc ne contient pas, sans qu'aucune autre déclaration (const, let, var,
   function, class, paramètre, import, module) ne couvre cet endroit.
   C'est exactement ce que le navigateur refuse — et rien de plus.

   ── ET CE QU'IL NE JUGE PAS, DIT PLUTÔT QUE MASQUÉ ────────────────────────
   Comme le §B, il est bâti pour être SILENCIEUX PAR CONSTRUCTION (pas
   d'analyseur syntaxique, loi Q3) :
     · l'ORDRE dans un bloc n'est pas jugé (une lecture avant sa `const`
       dans le même bloc, la zone morte temporelle) — une fermeture déclarée
       avant et appelée après est légitime, et on ne peut pas les distinguer ;
     · un `const` de tête de boucle (`for (const x of …)`) est rangé dans le
       bloc qui CONTIENT la boucle, plus large que son corps : une lecture
       après la boucle passe ;
     · un nom qui n'a AUCUNE déclaration `const`/`let` dans la fonction n'est
       pas son affaire — c'est celle du §B ;
     · une clef d'objet (`{ ready: … }`) et une propriété (`o.ready`) ne
       sont pas des lectures ; une GLOBALE (`document`, `window`…) non plus,
       puisqu'elle ne jette jamais.
   ⭐ Trois silences, jamais un cri sur du code juste — c'est la condition
   pour qu'un garde survive à sa première semaine. Et il est ATTAQUÉ plus
   bas (§C) avec la violation exacte du 30/08. */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stripComments, sansTexte, walkSources } from "./source-scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const IDENT = /[A-Za-z_$][\w$]*/y;
const MOTS_CLEFS = new Set([
  "if", "for", "while", "switch", "catch", "function", "class", "return", "typeof",
  "instanceof", "new", "delete", "void", "await", "yield", "in", "of", "do", "else",
  "try", "finally", "case", "throw", "import", "export", "default", "const", "let",
  "var", "this", "super", "extends", "static", "get", "set", "async", "null", "true",
  "false", "break", "continue", "with", "debugger", "undefined"
]);

/* Les GLOBALES — celles du langage, dérivées du `globalThis` de Node ; celles
   du navigateur, écrites, la même liste que viseur-tambour §B. Une lecture qui
   tombe sur une globale ne jette jamais : `document.querySelector` dans une
   fonction qui a aussi un `let document` local dans un AUTRE bloc est du code
   juste, et c'est le cas réel de `applyDecisionAction` (mesuré). */
const GLOBALES = new Set([
  ...Object.getOwnPropertyNames(globalThis),
  "document", "window", "navigator", "location", "history", "screen", "visualViewport",
  "getComputedStyle", "matchMedia", "getSelection", "requestAnimationFrame",
  "cancelAnimationFrame", "requestIdleCallback", "cancelIdleCallback", "alert", "confirm",
  "prompt", "open", "close", "print", "focus", "blur", "localStorage", "sessionStorage",
  "indexedDB", "caches", "IntersectionObserver", "ResizeObserver", "MutationObserver",
  "Event", "CustomEvent", "PointerEvent", "KeyboardEvent", "MouseEvent", "TouchEvent",
  "Image", "Audio", "DOMParser", "XMLSerializer", "FileReader", "XMLHttpRequest", "Worker",
  "CSS", "Node", "Element", "HTMLElement", "Range", "createImageBitmap", "speechSynthesis",
  "postMessage", "scrollTo", "scrollBy"
]);

/** L'index de l'accolade qui ferme celle ouverte en `ouvrante`, ou -1. */
function accoladeFermante(texte, ouvrante) {
  let profondeur = 0;
  for (let i = ouvrante; i < texte.length; i += 1) {
    if (texte[i] === "{") profondeur += 1;
    else if (texte[i] === "}") { profondeur -= 1; if (profondeur === 0) return i; }
  }
  return -1;
}

function parentheseFermante(texte, ouvrante) {
  let profondeur = 0;
  for (let i = ouvrante; i < texte.length; i += 1) {
    if (texte[i] === "(") profondeur += 1;
    else if (texte[i] === ")") { profondeur -= 1; if (profondeur === 0) return i; }
  }
  return -1;
}

/** Tous les BLOCS `{ … }` d'un texte, avec leurs bornes (accolade comprise). */
function blocs(texte) {
  const out = [];
  for (let i = 0; i < texte.length; i += 1) {
    if (texte[i] !== "{") continue;
    const fin = accoladeFermante(texte, i);
    if (fin !== -1) out.push({ debut: i, fin });
  }
  return out;
}

/** Le plus petit bloc de la liste qui contient la position `p` (bornes
 *  exclues : une accolade appartient au bloc du dessus). */
function blocAutour(liste, p) {
  let meilleur = null;
  for (const b of liste) {
    if (b.debut < p && p < b.fin && (!meilleur || b.fin - b.debut < meilleur.fin - meilleur.debut)) meilleur = b;
  }
  return meilleur;
}

/** Les noms liés par un motif de déclaration : `const a`, `let { a, b: c }`,
 *  `const [a, , b]`. Rend chaque nom avec la position où il est écrit. */
function nomsLies(texte, apres) {
  const noms = [];
  let i = apres;
  while (i < texte.length && /\s/.test(texte[i])) i += 1;
  if (texte[i] === "{" || texte[i] === "[") {
    const fermeture = texte[i] === "{" ? accoladeFermante(texte, i) : crochetFermant(texte, i);
    const interieur = texte.slice(i, fermeture + 1);
    /* dans `{ a, b: c, d = 1 }` les noms liés sont `a`, `c`, `d` : ce qui
       précède `:` est une clef, pas une liaison. */
    for (const m of interieur.matchAll(/([A-Za-z_$][\w$]*)\s*(?=[,}\]=]|\s*:)/g)) {
      const suite = interieur.slice(m.index + m[1].length).match(/^\s*:/);
      if (suite) continue;
      noms.push({ nom: m[1], pos: i + m.index });
    }
    return noms;
  }
  IDENT.lastIndex = i;
  const m = IDENT.exec(texte);
  if (m) noms.push({ nom: m[0], pos: i });
  return noms;
}

function crochetFermant(texte, ouvrant) {
  let profondeur = 0;
  for (let i = ouvrant; i < texte.length; i += 1) {
    if (texte[i] === "[") profondeur += 1;
    else if (texte[i] === "]") { profondeur -= 1; if (profondeur === 0) return i; }
  }
  return -1;
}

/** Les noms déclarés au NIVEAU DU MODULE (hors de tout bloc) : imports,
 *  const/let/var, function, class. Ils couvrent tout le fichier. */
function nomsDuModule(texte, tousLesBlocs) {
  const noms = new Set();
  const horsBloc = (p) => !blocAutour(tousLesBlocs, p);
  for (const m of texte.matchAll(/\b(?:const|let|var)\s+/g)) {
    if (!horsBloc(m.index)) continue;
    for (const { nom } of nomsLies(texte, m.index + m[0].length)) noms.add(nom);
  }
  for (const m of texte.matchAll(/\b(?:function\s*\*?|class)\s+([A-Za-z_$][\w$]*)/g)) {
    if (horsBloc(m.index)) noms.add(m[1]);
  }
  for (const m of texte.matchAll(/\bimport\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(",")) {
      const nom = part.trim().split(/\s+as\s+/).pop();
      if (nom) noms.add(nom);
    }
  }
  for (const m of texte.matchAll(/\bimport\s+([A-Za-z_$][\w$]*)\s*(?:,|from)/g)) noms.add(m[1]);
  return noms;
}

/** Les paramètres d'une fonction dont la parenthèse ouvrante est en `ouvrante`. */
function parametres(texte, ouvrante) {
  const fermante = parentheseFermante(texte, ouvrante);
  const noms = new Set();
  for (const m of texte.slice(ouvrante, fermante).matchAll(/[A-Za-z_$][\w$]*/g)) noms.add(m[0]);
  return noms;
}

/** LE JUGE. Rend la liste des lectures hors portée : `{ nom, fonction }`. */
export function liaisonsHorsBloc(source) {
  const texte = sansTexte(stripComments(source));
  const tousLesBlocs = blocs(texte);
  const module = nomsDuModule(texte, tousLesBlocs);
  const prises = [];

  for (const f of texte.matchAll(/\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)?\s*\(/g)) {
    const ouvrante = f.index + f[0].length - 1;
    if (blocAutour(tousLesBlocs, f.index)) continue;          // seules les fonctions de premier niveau
    const fermante = parentheseFermante(texte, ouvrante);
    const corpsDebut = texte.indexOf("{", fermante);
    const corpsFin = accoladeFermante(texte, corpsDebut);
    if (corpsDebut === -1 || corpsFin === -1) continue;
    const corps = { debut: corpsDebut, fin: corpsFin };
    const params = parametres(texte, ouvrante);
    const blocsDuCorps = tousLesBlocs.filter((b) => b.debut >= corpsDebut && b.fin <= corpsFin);

    /* Les déclarations du corps, chacune avec le bloc qu'elle couvre. */
    const declarations = new Map(); // nom → [{bloc, lexicale}]
    const poser = (nom, bloc, lexicale) => {
      if (!declarations.has(nom)) declarations.set(nom, []);
      declarations.get(nom).push({ bloc, lexicale });
    };
    const zone = texte.slice(corpsDebut, corpsFin + 1);
    for (const m of zone.matchAll(/\b(const|let|var)\s+/g)) {
      const p = corpsDebut + m.index;
      const bloc = m[1] === "var" ? corps : (blocAutour(blocsDuCorps, p) || corps);
      for (const { nom } of nomsLies(texte, p + m[0].length)) poser(nom, bloc, m[1] !== "var");
    }
    for (const m of zone.matchAll(/\b(?:function\s*\*?|class)\s+([A-Za-z_$][\w$]*)/g)) {
      const p = corpsDebut + m.index;
      poser(m[1], blocAutour(blocsDuCorps, p) || corps, false);
    }
    /* Les PARAMÈTRES des fonctions, flèches et méthodes IMBRIQUÉES, et les
       `catch (e)` : leur portée exacte demanderait de délimiter un corps
       d'expression (`x => x.a`), ce qu'on ne peut pas faire sans analyseur.
       Un nom qui sert de paramètre quelque part dans la fonction est donc
       laissé en paix PARTOUT — un silence, jamais un cri. */
    const parametresImbriques = new Set();
    /* ⚠️ `if (gate.ready) {` ressemble à une liste de paramètres ; ce qui la
       distingue est le mot AVANT la parenthèse : `function` ou un nom de
       méthode, jamais `if`/`for`/`while`/`switch`/`catch`. Mesuré :
       sans ce tri, l'attaque C1 passait au vert — le garde s'était tu sur
       la violation même qu'il doit voir. */
    const CONTROLE = new Set(["if", "for", "while", "switch", "catch", "with", "return"]);
    for (const m of zone.matchAll(/(?:\bfunction\s*\*?\s*[\w$]*|(?<![\w$.])([A-Za-z_$][\w$]*))\s*\(([^()]*)\)\s*\{/g)) {
      if (m[1] && CONTROLE.has(m[1])) continue;
      for (const n of m[2].matchAll(/[A-Za-z_$][\w$]*/g)) parametresImbriques.add(n[0]);
    }
    for (const m of zone.matchAll(/\(([^()]*)\)\s*=>/g)) {
      for (const n of m[1].matchAll(/[A-Za-z_$][\w$]*/g)) parametresImbriques.add(n[0]);
    }
    for (const m of zone.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\s*=>/g)) parametresImbriques.add(m[1]);
    for (const m of zone.matchAll(/\bcatch\s*\(\s*([A-Za-z_$][\w$]*)/g)) parametresImbriques.add(m[1]);

    /* Les LECTURES : tout identifiant qui n'est ni clef, ni propriété, ni
       mot-clef, ni le nom d'une déclaration. */
    for (const m of zone.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)(?![\w$])/g)) {
      const nom = m[1];
      if (MOTS_CLEFS.has(nom) || GLOBALES.has(nom) || params.has(nom) || module.has(nom) || parametresImbriques.has(nom)) continue;
      const decls = declarations.get(nom);
      if (!decls || !decls.some((d) => d.lexicale)) continue;   // pas une liaison de bloc : affaire du §B
      const p = corpsDebut + m.index;
      const avant = zone.slice(Math.max(0, m.index - 12), m.index);
      if (/(?:const|let|var|function|class)\s+$/.test(avant)) continue;      // c'est la déclaration elle-même
      const apres = zone.slice(m.index + nom.length).match(/^\s*(:|=>)/);
      if (apres && apres[1] === ":") continue;                                // clef d'objet
      if (apres && apres[1] === "=>") continue;                               // paramètre de flèche
      if (/[{,]\s*$/.test(avant) && /^\s*[,}]/.test(zone.slice(m.index + nom.length)) && blocAutour(blocsDuCorps, p)) {
        /* `{ a, b }` : une destructuration ou un raccourci d'objet — les deux
           sont une déclaration ou une écriture, jamais une lecture jugeable. */
        continue;
      }
      const couverte = decls.some((d) => d.bloc.debut < p && p < d.bloc.fin);
      if (!couverte) prises.push({ nom, fonction: f[1] || "(anonyme)" });
    }
  }
  return prises;
}

test("A — AUCUNE LIAISON DE BLOC N'EST LUE HORS DE SON BLOC DANS `ui/`", () => {
  const modules = walkSources(path.join(ROOT, "ui"));
  assert.ok(modules.length >= 30, `l'arpenteur a trouvé ${modules.length} modules — la portée n'est pas vide`);
  const prises = [];
  for (const fichier of modules) {
    for (const { nom, fonction } of liaisonsHorsBloc(fs.readFileSync(fichier, "utf8"))) {
      prises.push(`${path.relative(ROOT, fichier)} › ${fonction}() lit \`${nom}\` hors du bloc qui le déclare`);
    }
  }
  assert.deepEqual(prises, [],
    "une `const`/`let` déclarée dans un bloc est lue en dehors — le joueur qui déclenche cette ligne reçoit un ReferenceError :\n  " + prises.join("\n  "));
});

/* ══ §C — L'ATTAQUE DU GARDE ══════════════════════════════════════════════
   ⭐ La violation EXACTE du 30/08, et le garde doit la voir. Puis la forme
   corrigée, et il doit se taire. Un garde qui n'a jamais rougi est une
   intention, pas un garde. */

const VIOLATION_DU_30_08 = `
  function pressDone() {
    if (STEPS[state.step].id === "destiny" && state.destinyMode === "choice" && state.engine) {
      const vue = arcanaCatalog()[state.cursor];
      if (vue) {
        state.destinyDraw = vue.id;
        refresh();
        return;
      }
    const gate = currentGate();
    if (!gate.ready) return;
    }
    if (gate.action) applyDecisionAction(gate.action);
    if (gate.next === "close") { fermerLePanneau(); return; }
  }
`;

test("C1 — LE GARDE VOIT LA VIOLATION DU 30/08", () => {
  assert.deepEqual(liaisonsHorsBloc(VIOLATION_DU_30_08), [
    { nom: "gate", fonction: "pressDone" },
    { nom: "gate", fonction: "pressDone" },
    { nom: "gate", fonction: "pressDone" }
  ]);
});

test("C2 — ET IL SE TAIT SUR LA FORME CORRIGÉE", () => {
  const corrige = VIOLATION_DU_30_08
    .replace("      }\n    const gate = currentGate();\n    if (!gate.ready) return;\n    }",
      "      }\n    }\n    const gate = currentGate();\n    if (!gate.ready) return;");
  assert.notEqual(corrige, VIOLATION_DU_30_08, "le remplacement a bien eu lieu");
  assert.deepEqual(liaisonsHorsBloc(corrige), []);
});

test("C3 — ET IL NE CRIE PAS SUR CE QUI EST JUSTE", () => {
  /* Chaque forme ci-dessous est légitime pour le navigateur ; une version
     naïve du garde rougissait sur l'une ou l'autre. Gardées comme mesure. */
  const juste = `
    import { lire } from "./x.mjs";
    const GLOBAL = 1;
    function a(items, gate) {
      if (items.length) { const gate = 2; use(gate); }
      return gate + GLOBAL;                       // le paramètre, pas la const du bloc
    }
    function b() {
      for (const item of items) { use(item); }
      const item = lire();                        // une seconde liaison, au bon niveau
      return item;
    }
    function c(o) {
      if (o) { const { ready, next: suite } = o; use(ready, suite); }
      return { ready: true, next: 1 };            // des clefs, pas des lectures
    }
    function d() {
      items.forEach((gate) => { use(gate); });    // paramètre de flèche
      const plan = { gate: 1 };
      return plan.gate;                           // une propriété
    }
    function e() {
      let total = 0;
      if (x) { let total = 1; use(total); }
      return total;                               // couverte par le let du dessus
    }
    function f() {
      const [premier, , second] = paire();
      const { a, b = 1, ...reste } = objet();
      return premier + second + a + b + reste;
    }
  `;
  assert.deepEqual(liaisonsHorsBloc(juste), []);
});
