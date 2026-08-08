/* L'arpenteur et le dépouilleur PARTAGÉS des gardes structurels.

   Ils vivaient en trois copies inline (play-block, et deux fois dans
   play-srd-only), et les trois avaient déjà DIVERGÉ : celle de play-block
   marchait l'arbre, les deux autres lisaient un seul répertoire à plat. Un
   fichier posé dans `src/play/rules/` échappait donc à la loi §0.12 sans un
   mot — attaqué et vérifié le 2026-08-08 (RELECTEUR Adverserial, défaut n°1).

   Une seule copie, donc, et elle est elle-même sous test : voir
   tests/guards-adversarial.test.mjs, qui la nourrit de violations délibérées
   et exige qu'elle rougisse. Un garde qui n'a jamais été attaqué n'est pas un
   garde, c'est une intention. */

import fs from "node:fs";
import path from "node:path";

/* ── Le dépouilleur ──────────────────────────────────────────────────
   Les commentaires sont retirés avant l'inspection : ils NOMMENT ce qui a été
   remplacé (« plus de `window` », « remplace localStorage »), et un garde qui
   les lit interdirait d'expliquer la frontière qu'il défend. Ce qui est jugé,
   c'est du code.

   ⚠️ La version regex (un `replace` d'ouverture-à-fermeture) EFFAÇAIT DU CODE
   RÉEL, mesuré le 2026-08-08 sur deux cas ordinaires — les deux littéraux
   exacts sont dans tests/guards-adversarial.test.mjs, ils ne peuvent pas être
   recopiés ici sans fermer ce commentaire, ce qui EST la démonstration :

     - une regex qui contient une ouverture de commentaire : tout ce qui la
       sépare de la fermeture suivante part, `window` avec — le garde zéro-DOM
       devient aveugle sur la zone ;
     - une chaîne qui contient deux barres obliques : elles sont prises pour
       un commentaire de ligne, la fin de la ligne disparaît, `document` avec.

   D'où ce balayage à états : il ne retire un commentaire que lorsqu'il n'est
   PAS dans une chaîne, un gabarit ou une regex. Les littéraux de chaîne sont
   CONSERVÉS — un import (`"../modules/fh/lexicon.mjs"`) est du code qui compte,
   et c'est par là que le défaut n°1 est passé. */
export function stripComments(text) {
  let out = "";
  let i = 0;
  let prev = ""; // dernier caractère significatif : distingue `/` division de `/` regex
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];

    if (c === "/" && next === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 2;
      out += " "; // un blanc, pour ne pas souder deux jetons voisins
      continue;
    }
    if (c === "/" && next === "/") {
      const end = text.indexOf("\n", i);
      i = end === -1 ? text.length : end;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const end = skipString(text, i);
      out += text.slice(i, end);
      prev = c;
      i = end;
      continue;
    }
    if (c === "/" && regexCanStartAfter(prev)) {
      const end = skipRegex(text, i);
      out += text.slice(i, end);
      prev = "/";
      i = end;
      continue;
    }
    out += c;
    if (!/\s/.test(c)) prev = c;
    i += 1;
  }
  return out;
}

function skipString(text, start) {
  const quote = text[start];
  let i = start + 1;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\") { i += 2; continue; }
    if (c === quote) return i + 1;
    // Une chaîne simple ne franchit pas la ligne ; un gabarit, si.
    if (c === "\n" && quote !== "`") return i;
    i += 1;
  }
  return text.length;
}

/* Après ces caractères, un `/` ouvre une regex ; après un identifiant, un
   nombre, `)` ou `]`, c'est une division. Heuristique standard, et elle penche
   du bon côté : au pire un opérateur est lu comme du texte, jamais un
   commentaire n'est laissé pour du code. */
function regexCanStartAfter(prev) {
  return prev === "" || "(,=:[!&|?{};+-*%~^<>".includes(prev);
}

function skipRegex(text, start) {
  let i = start + 1;
  let inClass = false;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\") { i += 2; continue; }
    if (c === "\n") return i; // regex non terminée : ce n'était pas une regex
    if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) {
      i += 1;
      while (i < text.length && /[a-z]/.test(text[i])) i += 1; // drapeaux
      return i;
    }
    i += 1;
  }
  return text.length;
}

/* ── L'arpenteur ─────────────────────────────────────────────────────
   RÉCURSIF, et ce n'est pas un détail de confort : à plat, un sous-répertoire
   est une porte de sortie silencieuse hors de toute loi structurelle. */
export function walkSources(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .flatMap((item) => {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) return walkSources(full);
      return item.name.endsWith(".mjs") ? [full] : [];
    });
}

/** Charge les modules de plusieurs racines : `name` relatif à `base`, le texte
 *  brut ET le texte dépouillé — les gardes ont besoin des deux. */
export function loadSources(roots, base) {
  return roots.flatMap(walkSources).map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    return { name: path.relative(base, file), raw, text: stripComments(raw) };
  });
}

/** Applique une liste `[regex, libellé]` et rend une violation par couple
 *  (fichier, motif) trouvé. Rendre la LISTE plutôt qu'asserter sur place, pour
 *  que la même fonction serve au garde et à l'attaque du garde. */
export function findForbidden(sources, patterns) {
  const hits = [];
  for (const { name, text } of sources) {
    for (const [pattern, label] of patterns) {
      const found = text.match(pattern);
      if (found) hits.push({ name, label, match: found[0] });
    }
  }
  return hits;
}

/* ── Le vocabulaire Fate's Hand interdit dans le chemin commun ────────
   §0.12 : « un personnage SRD pur traverse-t-il ce code de bout en bout ? »

   ⚠️ DURCI LE 2026-08-08 après attaque. L'ancienne liste portait
   `/\barcane?\b/i` — qui ne matche NI `arcana`, NI `arcanes`, NI `arcanum`.
   Or l'identifiant réel de la mécanique dans ce dépôt est `fh.arcana`, et
   `state.arcana` traversait le garde sans le faire ciller. La règle qu'on en
   tire : un garde de vocabulaire se teste sur les FORMES QUE LE CODE EMPLOIE,
   pas sur le mot du cahier des charges. */
export const HOUSE_MECHANICS = [
  [/\bdestin(y|ies)\b/i, "Destiny"],
  [/\bchaos\b/i, "Chaos"],
  [/\boverreach(ed|es)?\b/i, "Overreach"],
  [/\barcan(a|e|es|um)\b/i, "Arcana"],
  [/\bawaken(ing|ed)?\b/i, "Awakening"],
  [/\bfate(s|d)?\b/i, "Fate"]
];

/* §L5.3 : les modules s'inscrivent, ils ne sont pas appelés — donc aucun
   fichier du moteur ne NOMME une couche.

   ⚠️ DURCI LE 2026-08-08 après attaque. L'ancienne liste cherchait
   `layers/fh` : ce chemin est MORT depuis que l'architecte a déplacé les
   modules dans `src/modules/fh/` (le même jour). Le garde gardait donc une
   porte qui n'existait plus, pendant que la vraie restait ouverte — un
   `import { fhTotal } from "../modules/fh/lexicon.mjs"` posé dans
   `src/play/utils.mjs` laissait les 170 tests verts.
   `fh[A-Z_]` (sans le drapeau `i`) couvre la convention d'export de la couche
   — `fhTotal`, `FH_VERDICTS` — sans mordre sur `fhpc/play:`, qui préfixe
   légitimement les erreurs du moteur. */
export const LAYER_NAMES = [
  [/\b(layers|modules)\/fh\b/i, "chemin du module de couche"],
  [/\bfh[A-Z_]/, "symbole exporté par la couche"],
  [/["'`]fh["'`]/i, "nom de couche en littéral"],
  [/\bfh\./, "accès à une couche par son nom"],
  [/\.fh\b/, "lecture d'une couche par son nom (`engine.layers.fh`)"],
  [/createFhLayer/, "constructeur de la couche"]
];
