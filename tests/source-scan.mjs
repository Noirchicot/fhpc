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

/* ── Le découpeur d'identifiants ──────────────────────────────────────
   Un garde de vocabulaire cherche des MOTS ; le code, lui, écrit des
   IDENTIFIANTS. `\bdestiny\b` ne voit rien dans `spendDestiny` : entre le `d`
   de `spend` et le `D` de `Destiny`, il n'y a aucune frontière de mot — les
   deux sont des caractères de mot. Idem pour `_` (`FH_DESTINY`), qui EST un
   caractère de mot en expression régulière.

   Ce découpage rétablit les frontières que les conventions de nommage
   effacent, et rien d'autre :

     · une minuscule ou un chiffre suivi d'une majuscule → `spendDestiny`
     · une suite de majuscules suivie d'un mot capitalisé → `HTTPArcana`
     · le souligné → `FH_DESTINY`, `destiny_die`

   Le trait d'union n'est pas traité : ce n'est pas un caractère de mot, `\b`
   y tombe déjà.

   ⚠️ IL NE REMPLACE PAS LE TEXTE BRUT, IL S'Y AJOUTE — `findForbidden` balaye
   les deux. Insérer une frontière peut CRÉER un match, mais peut aussi en
   casser un : `/\bfh[A-Z_]/` ne voit plus `fhTotal` une fois découpé en
   « fh Total ». Balayer les deux ne peut que trouver PLUS, jamais moins. */
export function splitIdentifiers(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/_/g, " ");
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
 *  que la même fonction serve au garde et à l'attaque du garde.
 *
 *  ⚠️ DURCI LE 2026-08-08 (lot 13) — chaque motif est essayé sur le texte
 *  DÉPOUILLÉ **et** sur le même texte passé au découpeur d'identifiants. Une
 *  seule violation est rendue par couple (fichier, motif) : ce sont deux
 *  regards sur le même fichier, pas deux fautes. Le texte brut est essayé en
 *  premier pour que le `match` rapporté soit la forme réellement écrite dans
 *  le fichier quand elle suffit — un garde qui cite un texte que personne n'a
 *  écrit fait chercher au mauvais endroit. */
export function findForbidden(sources, patterns) {
  const hits = [];
  for (const { name, text } of sources) {
    const words = splitIdentifiers(text);
    for (const [pattern, label] of patterns) {
      const found = text.match(pattern) || words.match(pattern);
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
   pas sur le mot du cahier des charges.

   ⚠️ DURCI DE NOUVEAU LE 2026-08-08 (lot 13), TROISIÈME RETOUR DE LA MÊME
   FAMILLE. La leçon ci-dessus avait été écrite, et la liste n'avait été
   durcie que sur un mot : les FRONTIÈRES DE MOT restaient, et n'importe quel
   identifiant composé passait au travers. Mesuré : `destiny` ✅ mais
   `spendDestiny`, `resolveArcana`, `settleAwakening`, `applyOverreach`,
   `rollChaos` ⛔, et `const destinyDie = 1` ⛔ aussi.

   Les deux bouts du mot lâchaient, et chacun est repris par son moyen :

     · EN TÊTE — c'est le découpeur d'identifiants qui rend la frontière
       (`spendDestiny` → « spend Destiny »), pas un motif plus large ; la
       liste reste lisible ;
     · EN QUEUE — l'ancre finale est RETIRÉE ici. `\bdestin(y|ies)` suffit à
       voir `destinyDie` dans le texte brut, sans découpage.

   POURQUOI RETIRER L'ANCRE FINALE NE FABRIQUE PAS DE FAUX POSITIFS : chaque
   motif garde son ancre de TÊTE et un discriminant qui le sort du vocabulaire
   ordinaire. `destin` seul mordrait « destination » et « destinataire » — d'où
   `destin(y|ies)`, qui ne matche ni l'un ni l'autre, ni le français
   « destinée ». `fate` ne préfixe que `fated`/`fateful`, jamais `fatal`.
   `arcan(a|e|um)` ne préfixe qu'`arcane`/`arcanes`/`arcana`/`arcanum`.

   MESURÉ AVANT DE DURCIR, sur tout `src/` et `bin/` : le durcissement ne rend
   AUCUNE suite rouge — zéro occurrence nouvelle hors de `src/modules/fh/`,
   qui a le droit de nommer FH et n'est sous aucun de ces gardes. Un garde qui
   crie au loup se fait désactiver ; celui-ci a été mesuré avant d'être posé.

   CE QU'IL NE VOIT TOUJOURS PAS, et c'est dit plutôt que masqué : une
   concaténation tout en minuscules et sans séparateur (`destinydie`) n'offre
   aucune frontière à rétablir. Aucune convention du dépôt ne l'écrit ainsi ;
   le jour où l'une le ferait, c'est ici que ça se réparerait. */
/* ⚠️ AJOUT DU 2026-08-08 (lot 16) — `vibration`. Elle n'était dans aucune
   liste parce qu'elle n'était dans aucun fichier : la mécanique avait été
   PERDUE AU PORTAGE, et un vocabulaire interdit ne peut pas garder un mot que
   personne n'a encore écrit. Elle rentre dans le moteur par
   `src/modules/fh/`, donc elle rentre ici en même temps — sinon le premier
   `entry.vibrationLevel` posé dans `src/play/` passerait comme `arcana` est
   passé. MESURÉ AVANT DE POSER : zéro occurrence hors de `src/modules/fh/`,
   aucune suite ne rougit. Pas d'ancre finale, pour la même raison que les
   autres (`vibrations`, `vibrationLevel`) ; le mot ne préfixe rien du
   vocabulaire SRD. */
/* ⚠️ AJOUT DU 2026-08-09 (lot 21) — `tilt`, et il entre le jour même où la
   mécanique entre. C'est la leçon de la Vibration appliquée EN AVANCE plutôt
   qu'après coup : elle avait été perdue au portage, puis retrouvée, et le mot
   n'était entré dans cette liste qu'à ce moment-là. Le Tilt est la seule façon
   dont Fate's Hand penche un jet — s'il s'écrivait un jour dans `src/play/`,
   le chemin commun porterait une règle maison sans qu'un test bronche.

   MESURÉ AVANT DE POSER, sur `src/` et `bin/` en entier : ZÉRO occurrence de
   « tilt » hors de `src/modules/fh/`, et aucune suite ne rougit. Pas d'ancre
   finale, comme les six autres (`tilts`, `tiltDisadvantage`) ; le mot ne
   préfixe rien du vocabulaire SRD — ni du français du dépôt. */
export const HOUSE_MECHANICS = [
  [/\bdestin(y|ies)/i, "Destiny"],
  [/\bchaos/i, "Chaos"],
  [/\boverreach/i, "Overreach"],
  [/\barcan(a|e|um)/i, "Arcana"],
  [/\bawaken/i, "Awakening"],
  [/\bfate/i, "Fate"],
  [/\bvibration/i, "Vibration"],
  [/\btilt/i, "Tilt"]
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

/* ── §0.12 CONTRE L'ÉNUMÉRATION FERMÉE DES GENRES ────────────────────
   LA COLLISION, MESURÉE LE 2026-08-08, en ouvrant le genre `arcana`.

   Deux règles vraies se contredisent à la lettre :

     - §0.12 interdit le vocabulaire Fate's Hand dans le chemin commun, et
       le garde a été DURCI deux fois pour mordre sur `"destiny"` nu comme
       sur `resolveArcana` ;
     - l'énumération des genres est FERMÉE par choix (c'est la seule défense
       contre `spel`), elle est recopiée à l'identique dans
       `src/layers/document.mjs`, et un garde de dérive compare les deux
       listes mot pour mot. `arcana` DOIT donc être écrit dans `src/layers/`.

   L'arbitrage de l'architecte, et son critère : §0.12 se teste par « un
   personnage SRD pur traverse-t-il ce code de bout en bout ? ». Un nom de
   genre dans une énumération est une CLEF DE VOCABULAIRE, pas une mécanique
   — aucune règle ne s'exécute, le genre reste un seau vide qu'aucune couche
   SRD ne remplit. Le garde mordait sur le MOT alors qu'il vise le CODE.

   LE MASQUE EST DONC ÉTROIT, ET SA FORME EST LE CRITÈRE : seul le genre
   ENTRE GUILLEMETS est retiré, parce que c'est la forme qu'a une clef dans
   une énumération. Tout le reste continue de mordre — l'identifiant
   (`resolveArcana`), le composé (`entry.arcanaPool`), le mot nu sans
   guillemets. Et la liste des exemptions n'est PAS tenue à la main : elle
   est lue dans le schéma, donc elle ne peut couvrir que ce que le contrat
   déclare déjà.

   ⚠️ PORTÉE : le masque ne s'applique qu'à `src/layers/`, LE BLOC QUI POSSÈDE
   le vocabulaire des genres. Aucun autre bloc n'a le droit de nommer un
   genre, et aucun ne le fait — vérifié le 2026-08-08 en retirant la liste
   des genres de la description MCP, où elle n'était qu'une copie du contrat
   (et où elle avait DÉJÀ dérivé : elle annonçait 14 genres après la révision
   qui en avait fait 15). */
export function genreVocabulary(schemaPath) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const genres = Object.keys(schema.properties.records.properties);
  if (genres.length === 0) {
    throw new Error(`source-scan: aucun genre lu dans ${schemaPath} — le masque serait vide sans le dire.`);
  }
  return genres;
}

export function maskGenreVocabulary(text, genres) {
  let out = text;
  for (const genre of genres) out = out.split(`"${genre}"`).join('""');
  return out;
}


/* ══ LE TEXTE EFFACÉ, LA PLACE GARDÉE — venu de viseur-tambour.test.mjs (lot 115) ══
   Deux gardes de source lisent le code sans analyseur syntaxique ; ce qu'ils
   ont en commun vit ici. `stripComments` retire les commentaires en gardant
   les chaînes (un chemin d'import est du code) ; `sansTexte` vide ensuite le
   CONTENU des chaînes et des regex, index par index, en gardant le code des
   interpolations `${…}`. Après les deux, il ne reste que du code. */
/** Vide le CONTENU des littéraux de texte et des regex, EN GARDANT LEUR PLACE
 *  (mêmes index, donc les positions restent comparables) et en gardant le CODE
 *  des interpolations `${…}` d'un gabarit.
 *  ⚠️ `stripComments` conserve délibérément les chaînes — un chemin d'import
 *  est du code qui compte pour LUI. Pour CE garde-ci elles sont du bruit :
 *  `"translate(3px)"` n'appelle rien. D'où cette seconde passe, à part, qui ne
 *  retire rien à la première. */
export function sansTexte(texte) {
  const out = texte.split("");
  const efface = (i) => { out[i] = " "; };
  let i = 0;
  let precedent = ""; // dernier caractère significatif : `/` division ou `/` regex ?
  const gabarit = []; // profondeur d'accolades dans le `${…}` courant ; 0 = texte brut
  while (i < texte.length) {
    const c = texte[i];
    const dansTexteDeGabarit = gabarit.length > 0 && gabarit[gabarit.length - 1] === 0;

    if (dansTexteDeGabarit) {
      if (c === "\\") { efface(i); efface(i + 1); i += 2; continue; }
      if (c === "`") { gabarit.pop(); i += 1; precedent = "`"; continue; }
      if (c === "$" && texte[i + 1] === "{") { gabarit[gabarit.length - 1] = 1; i += 2; precedent = "{"; continue; }
      efface(i); i += 1; continue;
    }

    if (c === "'" || c === '"') {
      const fin = finDeChaine(texte, i);
      for (let k = i + 1; k < fin - 1 && k < texte.length; k += 1) efface(k);
      i = fin; precedent = c; continue;
    }
    if (c === "`") { gabarit.push(0); i += 1; continue; }
    if (c === "/" && texte[i + 1] !== "/" && texte[i + 1] !== "*" && regexPossible(precedent)) {
      const fin = finDeRegex(texte, i);
      if (fin > i) { for (let k = i + 1; k < fin - 1; k += 1) efface(k); i = fin; precedent = "/"; continue; }
    }
    if (gabarit.length > 0 && gabarit[gabarit.length - 1] > 0) {
      if (c === "{") gabarit[gabarit.length - 1] += 1;
      else if (c === "}") gabarit[gabarit.length - 1] -= 1;
    }
    if (!/\s/.test(c)) precedent = c;
    i += 1;
  }
  return out.join("");
}

function finDeChaine(texte, debut) {
  const guillemet = texte[debut];
  let i = debut + 1;
  while (i < texte.length) {
    if (texte[i] === "\\") { i += 2; continue; }
    if (texte[i] === guillemet) return i + 1;
    if (texte[i] === "\n") return i; // chaîne non terminée : on rend la main
    i += 1;
  }
  return texte.length;
}

/* Même heuristique que `source-scan.mjs` : après ces caractères un `/` ouvre
   une regex ; après un identifiant, un nombre, `)` ou `]`, c'est une division. */
function regexPossible(precedent) {
  return precedent === "" || "(,=:[!&|?{};+-*%~^<>".includes(precedent);
}

function finDeRegex(texte, debut) {
  let i = debut + 1;
  let classe = false;
  while (i < texte.length) {
    const c = texte[i];
    if (c === "\\") { i += 2; continue; }
    if (c === "\n") return debut; // ce n'était pas une regex
    if (c === "[") classe = true;
    else if (c === "]") classe = false;
    else if (c === "/" && !classe) {
      i += 1;
      while (i < texte.length && /[a-z]/.test(texte[i])) i += 1;
      return i;
    }
    i += 1;
  }
  return debut;
}

/** ══ LE LECTEUR DE FEUILLE — un seul, partagé (lot 142) ═══════════════════
 *
 *  ⛔ TROIS GARDES ONT ÉCRIT LEUR PROPRE LECTEUR DE CSS, ET DEUX SE SONT
 *  TROMPÉS DE LA MÊME FAÇON : une expression régulière qui exige `{` juste
 *  après le sélecteur rate toute règle écrite en LISTE (`a, b, c { … }`), et un
 *  `matchAll` ancré sur `}` en rate une sur deux — le `}` d'une règle est
 *  consommé, donc il ne peut plus ancrer la suivante. Les deux échouent en
 *  rendant `null`, c'est-à-dire en ACCUSANT une feuille juste.
 *  ⭐ Un scanner à profondeur ne peut pas se tromper là-dessus : il lit les
 *  accolades, pas un motif. Il vit ici pour qu'il n'y ait plus qu'un lecteur.
 *
 *  ⭐ ET LE CONTEXTE `@` FAIT PARTIE DE L'IDENTITÉ D'UNE RÈGLE : la même
 *  déclaration au même sélecteur, une fois au premier niveau et une fois sous
 *  `prefers-color-scheme: dark`, n'est pas un doublon — c'est l'idiome du thème.
 *
 *  @param {string} css — la feuille, commentaires retirés (`stripComments`)
 *  @returns {{sel:string, parts:string[], corps:string, sous:string}[]}
 */
export function reglesDeLaFeuille(css) {
  const regles = [];
  const contexte = [];
  let tete = "";
  let i = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === "{") {
      const prelude = tete.trim().replace(/\s+/g, " ");
      tete = "";
      if (prelude.startsWith("@")) { contexte.push(prelude); i++; continue; }
      let j = i + 1, prof = 1;
      while (j < css.length && prof > 0) {
        if (css[j] === "{") prof++;
        else if (css[j] === "}") prof--;
        j++;
      }
      regles.push({
        sel: prelude,
        parts: prelude.split(",").map((p) => p.trim()).filter(Boolean),
        corps: css.slice(i + 1, j - 1).trim().replace(/\s+/g, " "),
        sous: contexte.join(" >> ")
      });
      i = j;
      continue;
    }
    if (c === "}") { contexte.pop(); tete = ""; i++; continue; }
    tete += c;
    i++;
  }
  return regles;
}

/** La DERNIÈRE déclaration d'une propriété pour un sélecteur, au premier niveau.
 *  ⚖️ La dernière l'emporte, comme dans la cascade à spécificité égale : prendre
 *  la première mentirait sur ce que le navigateur applique. */
export function declarationDe(regles, selecteur, propriete) {
  let dernier = null;
  for (const r of regles) {
    if (r.sous || !r.parts.includes(selecteur)) continue;
    const m = r.corps.match(new RegExp(`(?:^|;)\\s*${propriete}:\\s*([^;}]+)`));
    if (m) dernier = m[1].trim().replace(/\s+/g, " ");
  }
  return dernier;
}
