/* ══ L'ÉTAPE EQUIPMENT — lot 49 ═══════════════════════════════════════
   Même loi que Class/Species/Compétences/Inheritance : le moteur prononce,
   l'écran affiche. ZÉRO règle de jeu ici — ce fichier ne calcule ni un
   total, ni un poids, ni une classe d'armure : `derive.mjs:404-445` sait
   déjà tout faire dès qu'une ligne `gear[N]` (ref + quantity + equipped) et
   les quatre clefs de `currency` sont posées (§0.2 de la commande, mesuré).

   ── ⛔ AUCUN PLAN `decisions[]` POUR `gear`/`currency` (mesuré, comme
   Abilities/Destiny) — `decisions.mjs` ne publie rien sous ces deux
   racines : ce fichier lit et pose directement dans
   `document.build.choices`, jamais un `planAt(decisions, "gear")` qui
   n'existerait pas.

   ── ⭐ LE CHOIX D'ARCHITECTE, RATIFIÉ (commande §1a, Eric 2026-08-13) —
   L'ÉCRAN AFFICHE LA PHRASE DE LA CLASSE TELLE QUELLE, IL NE LA STRUCTURE
   PAS. `data.starting_equipment` est UNE SEULE CHAÎNE DE PROSE sur les
   douze classes (« Choose A or B: … », le Fighter en a TROIS — « Choose A,
   B, or C » — §0.4 de la commande, mesuré) ; la structurer en boutons
   créerait une DEUXIÈME écriture de la même règle, à côté du texte SRD, et
   deux copies divergent sauf si quelque chose les compare. Le joueur COMPOSE
   son sac lui-même avec le chercheur plus bas, en lisant la phrase.

   ── LA BOURSE (commande §1b/§1c) — Les 50 PO ADDENDUMS §4 sont une RÈGLE
   que le moteur ne connaît pas : c'est CET ÉCRAN qui les pose, jamais
   automatiquement (`shell.mjs`, action `addInheritedPurse` — un CLIC, pas un
   effet de rendu, pour ne jamais réécrire une bourse déjà dépensée). Le
   nombre est nommé UNE FOIS (`INHERITED_PURSE_GP`, plus bas), jamais un `50`
   nu dans une fonction de rendu.

   ── 🔴 LE PIÈGE DE LA BOURSE, RENDU VISIBLE, PAS CONTOURNÉ — `CURRENCY_KEYS`
   (importé de `src/build/index.mjs`, JAMAIS recopié : même liste que
   `derive.mjs`, zéro divergence possible) vaut quatre clefs, pas d'`ep`.
   Poser `currency.gp` seul ne produit AUCUNE bourse dérivée
   (`derive.mjs:442`) — cet écran ne le cache pas : les quatre champs sont
   TOUJOURS visibles, et `resolved.currency` ne s'affiche QUE quand le
   moteur l'a vraiment produit.

   ── ⚠️ DISCIPLINE DE FICHIER : `document` (le personnage brut, dans les
   `ctx`) SHADOWS le `document` DOM global à l'intérieur des fonctions qui le
   reçoivent — même geste qu'`abilities-step.mjs`/`inheritance-step.mjs`.
   AUCUNE fonction qui reçoit ce paramètre n'appelle `document.createElement`
   directement : tout passe par `el`/`text`/`button`/`numberField`/
   `searchField`, définis en tête de fichier, dont le PROPRE `document`
   référencé est toujours le DOM global (portée de module, jamais ombragée). */

import { renderPicker } from "./carnet.mjs?v=278";
import { CURRENCY_KEYS } from "../../src/build/index.mjs?v=278";
import { swapContent } from "./socle.mjs?v=278";

/* §0.3 de la commande, mesuré : 82 `gear` + 38 `weapon` + 13 `armor` = 133
   records. Bookkeeping d'ÉCRAN (quels genres ce chercheur interroge) — pas
   une règle de jeu : `derive.mjs` accepte n'importe quel `ref` valide sous
   `gear[n]`, cette liste ne fait que dire à QUI `query({kind})` est posée.

   ── ⭐ LOT 84 — `item` ENTRE, ET C'EST UNE DÉCISION D'ERIC (2026-08-23,
   « oui ça rentre à l'équipement »). Le catalogue passe donc de 133 à 386
   records (mesuré : 82 + 38 + 13 + 253). La commande du lot l'INTERDISAIT
   tant que personne n'avait tranché ; il est tranché.

   ── 🔴 CE QUE `item` APPORTE ET CE QU'IL N'A PAS, mesuré sur
   `layers/srd-5.2.1-en.layer.json` : les 253 objets magiques portent
   `category` (non vide 253/253) — c'est le SEUL vrai second niveau du
   catalogue — mais **0 sur 253 portent un `cost`, 0 sur 253 portent un
   `weight`**. Un autre chantier les remplira. Cet écran doit donc afficher
   un objet SANS PRIX ET SANS POIDS sans rien casser et sans inventer de
   valeur : `recordCost`/`recordWeight` rendent `null`, et la ligne de méta
   affiche « — ». L'absence est MONTRÉE, jamais comblée. */
const EQUIPMENT_RECORD_KINDS = ["gear", "weapon", "armor", "item"];

/* ADDENDUMS §4 (Eric, 2026-08-13), ratifié §0.1 de la commande : « Le
   paquet de la CLASSE, plus une bourse de 50 PO. » HÉRITÉ, pas inventé :
   c'est l'option B des quatre arrière-plans SRD supprimés (« … or 50 GP »).
   Le paquet de classe porte SON PROPRE or (le Barbare option A : « … and 15
   GP ») et les deux s'ADDITIONNENT — aucune collision, vérifié §0.1. Nommé
   UNE SEULE FOIS, ici — jamais un `50` nu au milieu d'une fonction de rendu
   (§1c de la commande). */
export const INHERITED_PURSE_GP = 50;

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}
function text(value) { return document.createTextNode(String(value)); }

function button(label, className, onClick, ariaLabel) {
  const b = document.createElement("button");
  b.type = "button";
  if (className) b.className = className;
  b.textContent = label;
  if (ariaLabel) b.setAttribute("aria-label", ariaLabel);
  b.addEventListener("click", onClick);
  return b;
}

function numberField({ value, min, className, ariaLabel, onChange }) {
  const input = document.createElement("input");
  input.type = "number";
  if (min !== undefined) input.min = String(min);
  if (className) input.className = className;
  input.value = Number.isInteger(value) ? String(value) : "";
  if (ariaLabel) input.setAttribute("aria-label", ariaLabel);
  input.addEventListener("change", () => onChange(input.value));
  return input;
}

function searchField({ placeholder, className, ariaLabel, onInput }) {
  const input = document.createElement("input");
  input.type = "search";
  if (className) input.className = className;
  if (placeholder) input.placeholder = placeholder;
  if (ariaLabel) input.setAttribute("aria-label", ariaLabel);
  input.addEventListener("input", () => onInput(input.value));
  return input;
}

/* ══ LA LECTURE BRUTE, HORS `decisions[]` (aucun plan pour gear/currency) ══ */

/** Le choix `class` brut, lu dans `document.build.choices` — jamais
 *  `resolved` (cette lecture doit marcher MÊME si la dérivation entière n'a
 *  pas encore réussi, test 8 de la commande : « une classe non choisie »). */
function currentClassRef(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const entry = choices.find((c) => c.path === "class");
  return entry && entry.ref ? entry.ref : null;
}

/** Les lignes `gear[N]` déjà posées, indexées par N — aucun plan
 *  `decisions[]` ne les republie (mesuré : `gear` n'apparaît nulle part dans
 *  `decisions.mjs`). Une ligne peut être INCOMPLÈTE (ref sans quantity, ou
 *  l'inverse) : `derive.mjs` la déclare et la saute (`underived.gear-line-
 *  incomplete`) plutôt que de la refuser — ce lecteur rend donc TOUT ce qui
 *  existe, complet ou non, et laisse `renderGearRow` le dire. */
export function currentGearLines(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const byIndex = new Map();
  const pathRe = /^gear\[(\d+)\](?:\.(quantity|equipped))?$/;
  for (const choice of choices) {
    const match = typeof choice.path === "string" ? pathRe.exec(choice.path) : null;
    if (!match) continue;
    const index = Number(match[1]);
    if (!byIndex.has(index)) byIndex.set(index, { index });
    const line = byIndex.get(index);
    if (match[2] === "quantity") line.quantity = choice.value;
    else if (match[2] === "equipped") line.equipped = choice.value;
    else if (choice.ref) line.ref = choice.ref;
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}

/** Le prochain index `gear[N]` libre — jamais réutilisé après un retrait
 *  (un index qui a existé ne redevient pas anonyme, même loi que
 *  `emptyAbilityAssign`/`ABILITY_METHODS` : une carte simple, exportée pour
 *  que `shell.mjs` l'importe plutôt que d'en tenir une seconde copie). */
export function nextGearIndex(document) {
  return currentGearLines(document).reduce((max, line) => Math.max(max, line.index + 1), 0);
}

/** Les quatre clefs de `currency.*` déjà posées, lues brutes — une clef
 *  absente n'apparaît pas dans l'objet rendu (jamais un `0` inventé ici :
 *  c'est `resolved.currency` qui dit si la bourse est complète, ce lecteur
 *  ne fait que recopier ce que le joueur a VRAIMENT tapé). */
export function currentCurrency(document) {
  const choices = document && document.build && Array.isArray(document.build.choices) ? document.build.choices : [];
  const out = {};
  for (const key of CURRENCY_KEYS) {
    const entry = choices.find((c) => c.path === `currency.${key}`);
    if (entry) out[key] = entry.value;
  }
  return out;
}

function recordLabel(view) {
  return view && view.record && typeof view.record.name === "string" ? view.record.name : null;
}
function recordCost(view) {
  const data = view && view.record && view.record.data;
  return data && typeof data.cost === "string" ? data.cost : null;
}
function recordWeight(view) {
  const data = view && view.record && view.record.data;
  return data && typeof data.weight === "string" ? data.weight : null;
}

/** Les 133 records — `gear` ∪ `weapon` ∪ `armor`, TELS QUE `query({kind})`
 *  les rend (aucune liste composée à la main). */
function catalogue(query) {
  const items = [];
  for (const kind of EQUIPMENT_RECORD_KINDS) {
    for (const view of query({ kind }) || []) items.push({ kind, view });
  }
  return items;
}

/* ══ LE TAMBOUR (lot 84) — DEUX ROUES, PUIS UNE GRILLE PAGINÉE ════════════
   Croquis d'Eric du 2026-08-23. Rayon → étagère → objet, où les deux
   premiers niveaux sont des ROUES (on se pose sur un cran, et s'y poser EST
   le choix) et le troisième une GRILLE qui PAGINE (elle montre, elle ne
   désigne pas).

   ⛔ ET C'EST LA RAISON D'ÊTRE DE LA GRILLE, pas un choix de forme : la règle
   d'Eric du 22/08 — « le joueur aurait acheté l'objet devant lequel il s'est
   arrêté » — doit rester IMPOSSIBLE. Une roue d'objets aurait un viseur, donc
   un objet courant ; une grille n'en a pas. En A et B se poser est choisir ;
   en C il faut un geste. */

/* ══ §4 — LA COUTURE DE DONNÉE, ET IL N'Y EN A QU'UNE ════════════════════
   🔴 LE TROU, MESURÉ le 2026-08-23 sur `layers/srd-5.2.1-en.layer.json` :

     genre     n     champ de 2e niveau
     gear     82     🔴 AUCUN — les records ne portent que cost/name/weight
     armor    13     🔴 AUCUN DANS LA COUCHE (le SRD imprime bien
                     « Light Armor / Medium Armor / Heavy Armor / Shield »
                     p. 92, mais l'extracteur les ENJAMBE : c'est un lot de
                     `fh-srd`, pas d'ici)
     weapon   38     ✅ `weapon_category` — martial 24 · simple 14
     item    253     ✅ `category` — wondrous-item 127 · weapon 28 · potion 24
                     · ring 22 · armor 19 · wand 13 · staff 12 · rod 7 · scroll 1

   ⛔ AUCUN ANALYSEUR DE PROSE. Ni sur `cost`, ni sur `weight`, ni sur
   `rarity`, ni sur les noms (« ça commence par "Potion of" donc c'est une
   potion »). L'étape 3 de la route versatilité va TYPER ces champs, et tout
   analyseur écrit cette semaine serait à jeter.

   ⛔ ET AUCUNE CATÉGORIE INVENTÉE — consigne d'Eric du 2026-08-23 : « une
   fois que le SRD est propre, oui on rajoute les tags de catégories ». Les
   catégories qui manquent arriveront par un chantier de DONNÉES, jamais par
   cet écran. Cette fonction LIT ce qui existe et S'ABSTIENT là où il n'y a
   rien : un genre sans champ de second niveau rend UNE seule étagère, celle
   du rayon lui-même. C'est pour ça que « Gear » et « Armor » n'ont qu'une
   étagère aujourd'hui, et ce n'est pas un manque à combler ici.

   ⭐ QUAND L'ÉTAPE 3 TYPERA LES CHAMPS : une seule ligne bouge dans tout le
   dépôt — la table `ETAGERE_DE` juste en dessous. Rien d'autre de cet écran
   ne sait d'où vient la taxonomie.

   ⚠️ LA LANGUE EST L'ANGLAIS, et c'est une décision d'Eric du 23/08 (« ici
   pour le moment on construit autour de l'anglais »), pas une déduction.
   Les mots du croquis (« Parchemins », « Baguettes ») sont ceux de sa main,
   pas ceux de l'interface. 🔍 Et AUCUN test ne l'attrape :
   `ui-player-facing-language.test.mjs` cherche le vocabulaire de chantier
   (`LOT-`, `.md`, `TODO`), jamais le français. Règle tenue à l'œil.
   📌 La couche française reste des LIBELLÉS PAR-DESSUS — jamais un second
   jeu d'identifiants (route versatilité, lot 83). */

/** Le nom d'un rayon. Ce ne sont PAS des catégories inventées : ce sont les
 *  genres de records que cet écran interroge déjà, avec les mots que la
 *  molette d'aujourd'hui emploie (`EQUIPMENT_CATEGORIES`, plus bas). */
const LIBELLE_DE_GENRE = {
  gear: "Gear",
  weapon: "Weapons",
  armor: "Armor",
  item: "Magic Items"
};

/** 🔴 LE SEUL ENDROIT DU DÉPÔT QUI SACHE D'OÙ SORT UNE ÉTAGÈRE.
 *  Un genre absent de cette table n'a PAS d'étagère — et c'est une mesure,
 *  pas un oubli : `gear` et `armor` ne portent aucun champ de second niveau.
 *  ⛔ N'y ajoute un genre que le jour où le champ EXISTE dans les records. */
const ETAGERE_DE = {
  weapon: (data) => data.weapon_category,
  item: (data) => data.category
};

/** La valeur brute d'un champ, rendue lisible — et RIEN DE PLUS.
 *  ⛔ Pas de pluriel, pas de renommage, pas de table de correspondance : le
 *  libellé EST la valeur lue, seulement recasée. « wondrous-item » devient
 *  « Wondrous Item », jamais « Wondrous Items » — une table de jolis noms
 *  serait une seconde écriture de la taxonomie, et deux écritures divergent. */
function titreDeValeur(valeur) {
  return String(valeur).split(/[-_\s]+/).filter(Boolean)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join(" ");
}

const parLibelle = (a, b) => a.label.localeCompare(b.label, "en");
const parNom = (a, b) => (recordLabel(a.view) || "").localeCompare(recordLabel(b.view) || "", "en");

/**
 * L'arbre du tambour : rayons → étagères → objets.
 *
 * ⏳ PROVISOIRE — la taxonomie n'existe pas encore dans les records
 * (lot 84, §4). Quand l'étape 3 de la route versatilité type les champs,
 * SEULE `ETAGERE_DE` ci-dessus change ; cette fonction, elle, ne bouge pas.
 *
 * @param {Function} query `layers.verbs.query`
 * @returns {Array<{id:string,label:string,etageres:Array<{id:string,label:string,objets:Array}>}>}
 */
export function rayonsEtEtageres(query) {
  const rayons = [];
  for (const kind of EQUIPMENT_RECORD_KINDS) {
    const libelle = LIBELLE_DE_GENRE[kind] || titreDeValeur(kind);
    const lire = ETAGERE_DE[kind];
    /* Une `Map` plutôt qu'un objet : elle garde l'ordre de rencontre, qu'on
       remplace ensuite par un tri explicite — jamais l'ordre du hasard. */
    const paniers = new Map();
    for (const view of query({ kind }) || []) {
      const data = (view && view.record && view.record.data) || {};
      const brut = lire ? lire(data) : null;
      /* ⚠️ UNE ABSENCE N'EST JAMAIS UNE RÉPONSE : une valeur vide n'est pas
         une catégorie « vide », c'est un record NON CLASSÉ. Il tombe dans le
         panier du rayon, sous le nom du rayon — visible, jamais rangé de
         force sous une étiquette qu'il ne porte pas. */
      const clef = typeof brut === "string" && brut !== "" ? brut : "";
      if (!paniers.has(clef)) paniers.set(clef, []);
      paniers.get(clef).push({ kind, view });
    }
    const etageres = [...paniers].map(([clef, objets]) => ({
      id: clef === "" ? kind : `${kind}:${clef}`,
      label: clef === "" ? libelle : titreDeValeur(clef),
      objets: objets.sort(parNom)
    })).sort(parLibelle);
    rayons.push({ id: kind, label: libelle, etageres });
  }
  return rayons.sort(parLibelle);
}

/* ══ L'ATTENTE — ☆ ☉ ☾, ET CE QUI LES DÉCLENCHE ══════════════════════════
   Règle d'Eric, arrivée en cinq passes le 22/08 et étendue à la grille le
   23/08 : « dès qu'une roue tourne, tout l'aval montre ses marqueurs ; 500 ms
   d'immobilité, et le choix paraît ». Le compte mesure L'IMMOBILITÉ, pas le
   temps : il se réarme à chaque geste.

   ⭐ CE QUI A PRIS CINQ PASSES : le mécanisme n'a jamais changé, seul son
   MOMENT. Marqueurs sans délai → ça clignote à chaque cran franchi. Masquage
   complet → la moitié de l'écran disparaît à chaque geste. */
const ATTENTE_MS = 500;
const SYMBOLES_ATTENTE = ["☆", "☉", "☾"]; // ☆ ☉ ☾

/** ⭐ CHOIX PAR DÉFAUT ASSUMÉ (lot 84) — LE TIRAGE SE FAIT UNE FOIS PAR
 *  MONTAGE DE L'ÉCRAN, jamais à chaque attente. C'est la question qu'Eric a
 *  laissée ouverte, et son inquiétude tranche dans ce sens : « un tirage qui
 *  change à chaque geste attire l'œil sur du bruit ». Le renverser tient en
 *  une ligne — appeler ceci depuis `enAttente` au lieu du montage. */
function tirerLesSymboles(combien) {
  return Array.from({ length: combien },
    () => SYMBOLES_ATTENTE[Math.floor(Math.random() * SYMBOLES_ATTENTE.length)]);
}

/* ══ LA GRILLE — 5 LIGNES × 3 COLONNES ══════════════════════════════════ */
export const CASES_PAR_PAGE = 15;

/**
 * UNE PAGE DE LA GRILLE — l'arithmétique seule, sans un nœud de DOM.
 *
 * ⭐ EXTRAITE EXPRÈS, ET C'EST LA LOI DU DÉPÔT (« on teste la fonction, pas la
 * page ») : tout ce qui touche à la ROUE a besoin d'une mise en page pour
 * exister — position de défilement, viseur, cascade — et ne se teste donc
 * qu'au doigt. La PAGINATION, elle, est de l'arithmétique pure. La sortir
 * d'ici, c'est la rendre mesurable sur le cas PLEIN (127 objets, 9 pages) et
 * sur le cas dégénéré (1 objet, 1 page) sans navigateur.
 *
 * ⛔ LE NOMBRE DE PAGES EST DÉRIVÉ, JAMAIS STOCKÉ : un compte écrit deux fois
 * est un compte qui finit par se contredire.
 * ⭐ Et la page BOUCLE : au-delà de la dernière on revient à la première, en
 * deçà de la première on va à la dernière. Une flèche qui ne fait rien au bout
 * serait une cible tactile morte.
 *
 * @param {Array} objets tous les objets de l'étagère
 * @param {number} page  la page demandée, éventuellement hors bornes
 * @returns {{page:number, pages:number, objets:Array}} la page RAMENÉE dans ses bornes
 */
export function pageDObjets(objets, page) {
  const total = Array.isArray(objets) ? objets.length : 0;
  const pages = Math.max(1, Math.ceil(total / CASES_PAR_PAGE));
  const brut = Number.isInteger(page) ? page : 0;
  const p = ((brut % pages) + pages) % pages;
  const debut = p * CASES_PAR_PAGE;
  return { page: p, pages, objets: (objets || []).slice(debut, debut + CASES_PAR_PAGE) };
}

/** ⏳ CE QU'UNE CASE PORTE — LE NOM, en attendant qu'Eric tranche.
 *  Sa question est ouverte (« les cases portent le NOM ou une IMAGE ? ») et
 *  elle décide de la taille des cases. La réponse d'ingénieur, pas d'arbitre :
 *  le contenu sort d'ICI et de nulle part ailleurs, et la taille d'une case
 *  est la seule variable `--fhpc-case-h` (`shell.css`). Le jour où il tranche,
 *  on change DEUX endroits, pas quinze.
 *  ⭐ Le nom, parce que c'est ce que le produit sait déjà afficher. */
function contenuDeCase(item) {
  return [text(recordLabel(item.view) || item.view.id)];
}

/* ══ LA ROUE — TROIS TOURS DE PISTE, ET LE SAUT QUI LES RECOUD ═══════════
   « Quand on arrive au bout on revient au début » (Eric, 22/08). On pose la
   liste TROIS FOIS bout à bout et on se tient dans le tour du milieu ; quand
   le défilement le quitte, on le ramène d'une longueur de tour. Le contenu
   est identique au pixel près, donc le saut ne se voit pas.

   🔴 ON FABRIQUE, ON NE CLONE PAS : `cloneNode(true)` ne copie pas les
   écouteurs, et un tiers de la roue serait mort — un tiers seulement, donc le
   défaut aurait l'air d'un caprice tactile.

   ⭐ UN BLOC DOIT ÊTRE LARGE, PAS SEULEMENT RÉPÉTÉ. Mesuré le 22/08 : avec
   3 crans, un bloc fait 3 × 121 = 363 px pour une fenêtre de 359 — on en sort
   au moindre geste, la couture tire en permanence, et l'œil la voit. Eric :
   « la roue A bien fluide, la roue B pas bien, ça clignote », À CODE
   IDENTIQUE. On répète donc la liste DANS le bloc jusqu'à MIN_BLOC crans.

   ⛔ EN DESSOUS DE TROIS CRANS, PAS DE ROUE : tripler une liste d'un ou deux
   crans fabrique une roue qui tourne sans avancer. Et le cas est RÉEL, pas
   théorique — « Gear » et « Armor » n'ont qu'une étagère, `scroll` n'a qu'un
   objet. */
const MIN_BLOC = 12;

function troisTours(liste, fabriquer) {
  const un = () => liste.map(fabriquer);
  if (liste.length < 3) return un();
  const tours = 3 * Math.ceil(MIN_BLOC / liste.length);
  const sortie = [];
  for (let t = 0; t < tours; t += 1) sortie.push(...un());
  return sortie;
}

/* ══ LES DEUX ORDONNANCEURS, ET POURQUOI ILS NE SONT PAS UN DRAPEAU ═══════
   🔴 UN GARDE BOOLÉEN SEMBLE ÉQUIVALENT ET NE L'EST PAS : si le
   `requestAnimationFrame` est demandé au moment où l'onglet passe en
   arrière-plan, il ne s'exécute JAMAIS — le drapeau reste levé et la roue est
   morte pour de bon. L'utilisateur revient, plus rien ne répond, et rien n'a
   rougi. Annuler puis replanifier donne le même throttle à une image, sans
   état qui puisse rester coincé.
   📌 Le repli `setTimeout` n'est pas du confort : hors navigateur il n'y a ni
   `requestAnimationFrame` ni mise en page, et tout ce qui suit se tait de
   lui-même (voir `pas()`). Ce qui compte, c'est que restaurer l'aimantation
   se fasse dans une AUTRE tâche — jamais dans celle qui l'a coupée. */
const demanderImage = typeof requestAnimationFrame === "function"
  ? (fn) => requestAnimationFrame(fn)
  : (fn) => setTimeout(fn, 16);
const annulerImage = typeof cancelAnimationFrame === "function"
  ? (id) => cancelAnimationFrame(id)
  : (id) => clearTimeout(id);

/* ══ LE TIC — UN CROCHET, PAS UNE PROMESSE ═══════════════════════════════
   `UISelectionFeedbackGenerator` — l'haptique qu'Apple réserve au passage
   entre valeurs discrètes — est NATIVE, et `navigator.vibrate()` n'existe pas
   sur Safari iOS. Une page servie dans Safari ne ticquera pas, quoi qu'on
   écrive ici ; le crochet est volontairement INERTE plutôt que remplacé par
   un ersatz visuel. Le jour où FHPC passe en WKWebView, le Swift n'a qu'à
   répondre au message.
   ⛔ ET IL NE TICQUE QU'AU CHANGEMENT DE CRAN, jamais à l'événement de
   défilement : un balayage rapide donne tic-tic-tic, un par cran franchi. */
function tic() {
  const pont = globalThis.webkit && globalThis.webkit.messageHandlers && globalThis.webkit.messageHandlers.haptic;
  if (pont) { try { pont.postMessage("selection"); return; } catch { /* pont muet */ } }
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(8);
}

/** Ce que le navigateur a VRAIMENT accordé à la roue.
 *  ⚠️ `animation-timeline: view()` demande Chrome 115+ ou Safari 26+. En
 *  dessous, la déclaration est ignorée et les crans restent PLATS — une
 *  dégradation propre, mais muette. §6 de la commande : « fais dire à l'écran
 *  ce qu'il a obtenu » plutôt que de laisser deviner. Eric lit cette ligne sur
 *  son iPad et sait tout de suite s'il juge la roue ou son ombre. */
function profondeurAccordee() {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  try {
    return CSS.supports("animation-timeline: view()") || CSS.supports("animation-timeline", "view()");
  } catch { return false; }
}

/* ══ UNE ROUE VIVANTE ════════════════════════════════════════════════════
   ⛔ CE QUI N'EST PAS ICI, ET C'EST TOUT LE §6 : AUCUNE ÉCRITURE DE
   TRANSFORMATION PAR IMAGE. Le défilement est composité sur un thread séparé ;
   du JS qui repeint les transformations est structurellement EN RETARD d'une
   image ou deux — pas trop lent, DÉSYNCHRONISÉ. Mesuré : passer de 0,448 ms à
   0,050 ms par image n'a rien changé à l'œil. La rotation vient donc de
   `animation-timeline: view()` (`shell.css`), évaluée par le compositeur.
   📌 Ce JS-ci ne fait plus que TROIS choses : dire quel cran est sous le
   viseur, recoudre la roue infinie, et armer l'attente de 500 ms.

   ⛔ ET IL N'ÉCRIT AUCUN `.style` : le garde 7 (`tests/ui-jetons.test.mjs`)
   l'interdit dans tout `ui/` hors du moteur de dés recopié. Couper
   l'aimantation le temps d'un bond passe donc par un ATTRIBUT, et la feuille
   fait le reste — ce qui est de toute façon la bonne place du décor. */
function monterRoue(piste, { longueur, rangCourant, quandCran }) {
  let pasCache = 0;
  let dernier = -1;
  let idImage = 0;
  let programmatique = 0;

  /** Le pas d'un cran, LU DANS LA MISE EN PAGE et mis en cache.
   *  ⭐ Il n'est écrit NULLE PART en JS : la cote vit dans `shell.css`
   *  (`--roue-cran-l` + `--roue-ecart`), et un nombre écrit deux fois est un
   *  nombre qui finit par se contredire.
   *  ⚠️ Il rend `0` tant que la mise en page n'a rien à dire — hors navigateur,
   *  ou avant le premier calcul. Tout ce qui en dépend se TAIT alors, au lieu
   *  de mesurer du vide. */
  function pas() {
    if (pasCache > 0) return pasCache;
    const enfants = piste.children;
    if (enfants.length >= 2) {
      const a = enfants[0].offsetLeft;
      const b = enfants[1].offsetLeft;
      if (Number.isFinite(a) && Number.isFinite(b) && b > a) pasCache = b - a;
    }
    return pasCache;
  }

  /** ⭐ L'INDEX SORT DE `scrollLeft` ET DU PAS, JAMAIS D'UN RECTANGLE PAR
   *  ENFANT. Lire `getBoundingClientRect()` puis écrire, item par item, coûtait
   *  36 recalculs de mise en page PAR IMAGE (mesuré le 22/08). Ici : trois
   *  lectures pour toute la roue, et rien à écrire.
   *  📐 On cherche l'enfant dont le CENTRE est le plus proche du centre du
   *  champ. ⚠️ Et on part du premier enfant plutôt que de supposer qu'il est
   *  collé à zéro : une piste trop courte pour tourner porte une CALE (voir
   *  `data-court`), et cette cale décale tout. Mesuré : sans elle, la roue
   *  s'ouvrait sur le DEUXIÈME rayon (« Gear ») au lieu du premier — alors
   *  qu'Eric a posé la règle inverse au banc, « le premier est celui qui
   *  s'ouvre ». */
  function indexAuViseur() {
    const p = pas();
    const n = longueur();
    const premier = piste.children[0];
    if (p <= 0 || n <= 0 || !premier) return -1;
    const champ = piste.clientWidth;
    if (!(champ > 0)) return -1;
    const centre = piste.scrollLeft + champ / 2;
    const rang = Math.round((centre - premier.offsetLeft - p / 2) / p);
    return ((rang % n) + n) % n;
  }

  /** La position qui met le cran `rang` sous le viseur — l'inverse exact de
   *  `indexAuViseur`, et écrite comme telle pour que les deux ne puissent pas
   *  diverger. `depart` est le premier enfant du tour du milieu. */
  function positionDe(rang) {
    const p = pas();
    const premier = piste.children[0];
    const champ = piste.clientWidth;
    const n = piste.children.length;
    if (p <= 0 || !premier || !(champ > 0)) return null;
    const depart = longueur() >= 3 && n >= 3 ? n / 3 : 0;
    return premier.offsetLeft + (depart + rang) * p + p / 2 - champ / 2;
  }

  /** 🔴 NOS PROPRES ÉCRITURES DE `scrollLeft` ÉMETTENT UN `scroll`
   *  INDISTINGUABLE D'UN GESTE. Sans ce marquage, poser la roue au chargement
   *  armait le compte d'attente, et l'aval se révélait tout seul une seconde
   *  plus tard — donc LOIN de sa cause, ce qui rend le défaut introuvable.
   *  ⭐ Un COMPTE et pas un booléen : deux gestes programmatiques peuvent se
   *  chevaucher, et un booléen rendrait la main trop tôt. */
  function programmatiquement(faire) {
    programmatique += 1;
    faire();
    demanderImage(() => { programmatique -= 1; });
  }

  /** Bond instantané, sans aimantation ni animation.
   *  🔴 RENDRE LA MAIN À LA PROCHAINE TÂCHE, PAS TOUT DE SUITE. Restaurer dans
   *  la même tâche, c'est n'avoir JAMAIS coupé l'aimantation : le navigateur ne
   *  voit que l'état final, re-snappe, et la roue saute — le « ça fait sauter
   *  l'écran » d'Eric venait aussi de là. */
  function sauter(cible) {
    piste.dataset.couture = "oui";
    programmatiquement(() => { piste.scrollLeft = cible; });
    demanderImage(() => { piste.dataset.couture = "non"; });
  }

  /** Recoud la roue : quand le défilement quitte le tour du milieu, il y
   *  revient d'un bond invisible — le contenu est identique au pixel près.
   *  ⛔ Sous trois crans il n'y a pas de roue, donc rien à recoudre. */
  function enrouler() {
    const p = pas();
    const n = piste.children.length;
    if (p <= 0 || longueur() < 3 || n < 3) return;
    const tour = (n / 3) * p;
    if (!(tour > 0)) return;
    const x = piste.scrollLeft;
    if (x < tour * 0.5) sauter(x + tour);
    else if (x > tour * 1.5) sauter(x - tour);
  }

  function juger() {
    /* La couture d'abord : on recentre AVANT de juger, pour que le verdict
       porte sur la position définitive et pas sur celle d'avant le bond. */
    enrouler();
    const i = indexAuViseur();
    if (i < 0) return;
    for (const enfant of piste.children) {
      enfant.dataset.vise = String(Number(enfant.dataset.rang) === i);
    }
    if (i === dernier) return;
    /* ⛔ PAS DE TIC AU TOUT PREMIER JUGEMENT : `dernier` vaut −1 au montage et
       à chaque remplissage. Ticquer là ferait vibrer l'appareil à l'ouverture
       de l'écran — un retour qui ne répond à aucun geste. */
    if (dernier !== -1 && programmatique === 0) tic();
    dernier = i;
    quandCran(i, programmatique > 0);
  }

  piste.addEventListener("scroll", () => {
    annulerImage(idImage);
    idImage = demanderImage(juger);
  }, { passive: true });

  /** Un cran de plus ou de moins — le geste de la FLÈCHE, que le croquis pose
   *  hors du bloc sombre, une paire par étage.
   *  ⭐ ELLE PASSE PAR LE MÊME CHEMIN QUE LE DOIGT, littéralement : elle écrit
   *  `scrollLeft`, et c'est le défilement natif (`scroll-behavior: smooth` +
   *  `scroll-snap`) qui porte le mouvement, émet ses `scroll` et déclenche la
   *  même cascade. Une animation maison aurait été un SECOND chemin, et deux
   *  chemins divergent au premier réglage.
   *  ⏳ CHOIX PAR DÉFAUT ASSUMÉ : le lissage natif dure ~400 ms et n'est pas
   *  réglable. C'est le prix du chemin unique ; s'il gêne au doigt, c'est ici
   *  qu'on le reprendra. */
  function avancer(sens) {
    const p = pas();
    if (p <= 0) return;
    piste.scrollLeft = piste.scrollLeft + sens * p;
  }

  /** Reposer la roue après un remplissage : les enfants sont neufs, l'ancien
   *  `dernier` désigne un nœud mort, et la position doit revenir sur le tour du
   *  milieu — sinon le PREMIER geste déclencherait un bond de recouture au lieu
   *  d'un défilement.
   *  ⚠️ TOUT LE GESTE EST PROGRAMMATIQUE, y compris quand il n'y a rien à
   *  sauter (une roue à un ou deux crans) : sans ça, remplir une étagère
   *  ressemblerait à un geste et rearmerait l'attente en boucle. */
  function reposer() {
    dernier = -1;
    demanderImage(() => programmatiquement(() => {
      /* ⭐ « Le premier est celui qui s'ouvre » — règle d'Eric au banc. La roue
         ne se pose donc pas au hasard du tour du milieu : elle se pose sur le
         cran COURANT, qui vaut 0 tant que rien n'a été choisi. C'est aussi ce
         qui restitue sa position après un `refresh()` de la coquille. */
      const cible = positionDe(rangCourant());
      if (cible !== null) sauter(cible);
      juger();
    }));
  }

  /** Amener UN cran donné sous le viseur — le clic sur un cran.
   *  ⭐ « Se poser sur un cran EST le choix » : le clic ne choisit pas
   *  directement, il AMÈNE le cran sous le viseur, et c'est le viseur qui
   *  choisit. Un clic qui poserait le choix sans bouger la roue ferait deux
   *  chemins pour un seul geste, et ils divergeraient. */
  function viser(noeud) {
    const p = pas();
    const premier = piste.children[0];
    if (p <= 0 || !premier) return;
    const base = premier.offsetLeft;
    if (!Number.isFinite(noeud.offsetLeft) || !Number.isFinite(base)) return;
    piste.scrollLeft = noeud.offsetLeft - base - p;
  }

  reposer();
  return { avancer, reposer, viser };
}

/* ══ LES FABRIQUES DE NŒUDS ══════════════════════════════════════════════ */

/** UN CRAN — le même fabricant pour les deux roues, et c'est délibéré : ce qui
 *  doit différer est le NIVEAU (un attribut sur la roue), pas le balisage.
 *  Deux fabricants auraient laissé les deux roues diverger par distraction.
 *  ⚠️ `aria-current` et pas `aria-pressed` : un cran n'est pas une bascule,
 *  c'est « celui-ci est le courant ». Même geste que `.equipment-cat`. */
function faireCran(libelle, rang, courant, onClic) {
  const cran = document.createElement("button");
  cran.type = "button";
  cran.className = "roue-cran";
  cran.dataset.rang = String(rang);
  cran.dataset.vise = "false";
  cran.setAttribute("aria-current", courant ? "true" : "false");
  cran.textContent = libelle;
  cran.addEventListener("click", onClic);
  return cran;
}

/** UN MARQUEUR D'ATTENTE — ni bouton, ni cible : une bande qui tourne invite à
 *  choisir, une bande figée dit qu'il n'y a rien à choisir.
 *  ⚠️ `aria-hidden` : un lecteur d'écran n'a rien à faire de trois glyphes
 *  décoratifs, et les annoncer serait pire que le silence. */
function faireMarqueur(symbole, className) {
  const marqueur = el("span", className);
  marqueur.textContent = symbole;
  marqueur.setAttribute("aria-hidden", "true");
  return marqueur;
}

/** UNE CASE DE LA GRILLE — le jeton, plus l'œil.
 *  ⛔ LE GESTE SUR UN OBJET GARDE L'ACTION D'AUJOURD'HUI : `+` ajoute une
 *  ligne, `👁` ouvre le popup. Le croquis dit « tap → la fiche B1 » — B1
 *  n'existe pas, et un lot qui l'inventerait coderait deux fois. */
function faireCase(item, onAction) {
  const nom = recordLabel(item.view) || item.view.id;
  const case_ = el("div", "grille-case");

  const jeton = document.createElement("button");
  jeton.type = "button";
  jeton.className = "grille-jeton";
  jeton.setAttribute("aria-label", `Add ${nom}`);
  for (const enfant of contenuDeCase(item)) jeton.append(enfant);
  jeton.addEventListener("click", () => onAction({
    kind: "addGearLine", ref: { kind: item.kind, id: item.view.id }, quantity: 1, equipped: false
  }));
  case_.append(jeton);

  case_.append(button("\u{1F441}", "grille-oeil",
    () => onAction({ kind: "popup", titre: nom, texte: recordProse(item.view) }),
    `About ${nom}`));
  return case_;
}

/** L'étage d'une roue : ses deux flèches, et sa piste entre elles.
 *  ⚠️ LES FLÈCHES SONT NEUVES — mesuré : le banc du 22/08 n'en avait aucune.
 *  Le croquis en pose une paire par étage, HORS du bloc sombre, et le motif est
 *  évident : au doigt on lance la roue, à la souris on n'a rien pour avancer
 *  d'un cran. */
function faireEtage(niveau, nom, piste, avancer) {
  const roue = el("div", "roue");
  roue.dataset.niveau = niveau;
  roue.append(button("‹", "roue-fleche", () => avancer(-1), `Previous ${nom}`));
  roue.append(piste);
  roue.append(button("›", "roue-fleche", () => avancer(1), `Next ${nom}`));
  return roue;
}

/* ══ LA POSITION DU TAMBOUR — DE L'ÉTAT D'ÉCRAN, PAS UN CHAMP DU PERSONNAGE ══
   🔴 ET IL FAUT LE DIRE, PARCE QUE C'EST UNE CONTRAINTE DE LA COQUILLE :
   `shell.mjs` reconstruit TOUTE la carte à chaque `refresh()`, et poser un
   objet (`addGearLine`) en déclenche un. Sans cette mémoire, le joueur qui
   ajoute une potion retrouve la roue sur « Armor », page 1 — c'est
   exactement le défaut que le banc a mesuré le 22/08 (« relevé 0/21 après
   quatre clics »), vu depuis l'autre bout.
   ⛔ CE N'EST PAS UN CHAMP DU DOCUMENT : trois valeurs qui meurent avec
   l'onglet, de la même famille que `state.equipmentCategory` dans
   `shell.mjs`. Rien ici n'atteint jamais `build.choices`.
   ⭐ `rayon: null` EST L'ÉTAT D'ATTENTE DU CROQUIS : rien n'a encore été
   choisi, donc l'aval montre ses marqueurs. */
const positionDuTambour = { rayon: null, etagere: null, page: 0 };

/**
 * LE TAMBOUR — deux roues et une grille paginée.
 * Rend DEUX nœuds séparés parce que le croquis les sépare : les roues sont
 * au-dessus de la recherche, la grille en dessous.
 */
function renderTambour({ query, onAction }) {
  const arbre = rayonsEtEtageres(query);
  const symboles = tirerLesSymboles(CASES_PAR_PAGE);

  const pisteA = el("div", "roue-piste");
  const pisteB = el("div", "roue-piste");
  const titre = el("span", "grille-titre");
  const compte = el("span", "grille-compte");
  const cases = el("div", "grille-cases");

  let rayonId = positionDuTambour.rayon;
  let etagereId = positionDuTambour.etagere;
  let page = positionDuTambour.page;
  /* Vrai tant que le joueur n'a rien touché : c'est l'état de départ du
     croquis — rayons remplis, étagères ☆ ☉ ☾, grille ☆ ☉ ☾. */
  let vierge = positionDuTambour.rayon === null;
  let minuteur = 0;
  let roueA = null;
  let roueB = null;

  const rayonCourant = () => arbre.find((r) => r.id === rayonId) || arbre[0] || null;
  const etageresCourantes = () => (rayonCourant() ? rayonCourant().etageres : []);
  const etagereCourante = () => etageresCourantes().find((e) => e.id === etagereId) || etageresCourantes()[0] || null;

  /* ── LE COMPTE D'IMMOBILITÉ ────────────────────────────────────────────
     Il mesure L'IMMOBILITÉ, pas le temps : chaque geste le réarme. Et il ne
     s'arme QUE sur un geste — nos écritures de `scrollLeft` sont marquées
     (voir `programmatiquement`), sans quoi l'aval se révélerait tout seul une
     seconde après le chargement. */
  function armer(faire) {
    clearTimeout(minuteur);
    minuteur = setTimeout(faire, ATTENTE_MS);
  }

  function marquerCourant(piste, rang) {
    for (const enfant of piste.children) {
      enfant.setAttribute("aria-current", String(Number(enfant.dataset.rang) === rang));
    }
  }

  /* ── L'ATTENTE ─────────────────────────────────────────────────────────
     ⛔ ON NE DÉMONTE PAS LA PISTE : on remplace son contenu. Démonter mettrait
     `scrollWidth` à zéro, et la roue perdrait sa couture au moment précis où
     elle en a besoin. L'attribut coupe l'aimantation, la perspective et les
     `pointer-events` — une bande figée dit qu'il n'y a rien à choisir. */
  function attendreB() {
    pisteB.dataset.attente = "oui";
    swapContent(pisteB, symboles.slice(0, 3).map((s) => faireMarqueur(s, "roue-cran roue-marqueur")));
  }
  function attendreGrille() {
    cases.dataset.attente = "oui";
    swapContent(cases, symboles.map((s) => faireMarqueur(s, "grille-case grille-marqueur")));
    titre.textContent = "—";
    compte.textContent = "—";
  }

  /* ── LA GRILLE ─────────────────────────────────────────────────────────
     ⛔ LE NOMBRE DE PAGES EST DÉRIVÉ, JAMAIS ÉCRIT À CÔTÉ DU COMPTE : un
     compte écrit deux fois est un compte qui finit par se contredire.
     ⭐ ET LA GRILLE NE TOURNE PAS : ni perspective, ni aimantation, ni
     `animation-timeline`. Deux pièces différentes, deux mécaniques
     différentes, et c'est voulu. */
  function remplirGrille() {
    const etagere = etagereCourante();
    if (!etagere) { attendreGrille(); return; }
    /* ⭐ TOUTE L'ARITHMÉTIQUE EST DEHORS (`pageDObjets`) — ce qui reste ici est
       du rendu, et rien d'autre. */
    const vue = pageDObjets(etagere.objets, page);
    page = vue.page;
    cases.dataset.attente = "non";
    swapContent(cases, vue.objets.map((item) => faireCase(item, onAction)));
    titre.textContent = etagere.label;
    compte.textContent = `${vue.page + 1}/${vue.pages}`;
    if (!vierge) positionDuTambour.page = page;
  }

  function tournerPage(sens) {
    if (!etagereCourante() || vierge) return;
    page += sens;
    remplirGrille();
  }

  /* ── LES DEUX ROUES ────────────────────────────────────────────────────
     ⭐ AUCUN DE CES GESTES NE PASSE PAR `onAction`, ET C'EST LE CŒUR DU LOT :
     `shell.mjs` répond à toute action par un `refresh()` qui reconstruit la
     carte entière. Un cran franchi qui dispatcherait ferait donc démonter la
     roue AU MILIEU DU GESTE. Le tambour se met à jour lui-même, par
     `swapContent`, et ne parle à la coquille que pour les deux actes du
     joueur : poser un objet, et ouvrir son texte. */
  function remplirB() {
    const liste = etageresCourantes();
    if (liste.length === 0) { attendreB(); return; }
    const choisie = etagereCourante();
    etagereId = choisie ? choisie.id : null;
    if (!vierge) positionDuTambour.etagere = etagereId;
    pisteB.dataset.attente = "non";
    /* ⛔ SOUS TROIS CRANS, PAS DE ROUE — et le cas est RÉEL : « Gear » et
       « Armor » n'ont qu'une étagère. Une piste droite ne peut pas amener son
       unique cran au milieu toute seule : la feuille lui pose une CALE d'un
       pas de chaque côté (`data-court`), et `indexAuViseur` la lit au lieu de
       la supposer. C'est la cale d'un tiers que le banc gardait, et il ne faut
       pas la jeter avec la roue de C. */
    pisteB.dataset.court = liste.length < 3 ? "oui" : "non";
    swapContent(pisteB, troisTours(liste, (etagere) => faireCran(
      etagere.label, liste.indexOf(etagere), etagere.id === etagereId,
      (noeud) => roueB.viser(noeud)
    )));
    roueB.reposer();
  }

  function quandRayon(rang, programmatique) {
    if (!programmatique) vierge = false;
    const rayon = arbre[rang];
    if (!rayon) return;
    if (rayon.id !== rayonId) {
      rayonId = rayon.id;
      /* ⏳ CHOIX PAR DÉFAUT ASSUMÉ — CHANGER DE RAYON REPART SUR LA PREMIÈRE
         ÉTAGÈRE (le mode « A » du banc : le bas OUBLIE). Le mode « B » — chaque
         rayon garde la sienne — n'a jamais été tranché au doigt ; il tient en
         une carte `rayon → étagère` ici. */
      etagereId = null;
      page = 0;
    }
    if (!vierge) { positionDuTambour.rayon = rayonId; positionDuTambour.etagere = etagereId; }
    marquerCourant(pisteA, rang);
    /* L'état de départ du croquis : tant que rien n'a été touché, l'aval reste
       en marqueurs — même quand notre propre placement traverse un cran. */
    if (vierge) { attendreB(); attendreGrille(); return; }
    if (programmatique) { remplirB(); remplirGrille(); return; }
    attendreB();
    attendreGrille();
    armer(() => { remplirB(); remplirGrille(); });
  }

  function quandEtagere(rang, programmatique) {
    if (!programmatique) vierge = false;
    const etagere = etageresCourantes()[rang];
    if (!etagere) return;
    if (etagere.id !== etagereId) {
      etagereId = etagere.id;
      page = 0;
      if (!vierge) positionDuTambour.etagere = etagereId;
    }
    marquerCourant(pisteB, rang);
    if (vierge) { attendreGrille(); return; }
    if (programmatique) { remplirGrille(); return; }
    attendreGrille();
    armer(remplirGrille);
  }

  /* ── LE MONTAGE ────────────────────────────────────────────────────────
     La roue des rayons est TOUJOURS remplie — c'est la ligne du haut du
     croquis. Ce sont l'étagère et la grille qui attendent. */
  pisteA.dataset.court = arbre.length < 3 ? "oui" : "non";
  swapContent(pisteA, troisTours(arbre, (rayon) => faireCran(
    rayon.label, arbre.indexOf(rayon), rayon.id === rayonId,
    (noeud) => roueA.viser(noeud)
  )));
  roueA = monterRoue(pisteA, {
    longueur: () => arbre.length,
    rangCourant: () => Math.max(0, arbre.findIndex((r) => r.id === rayonId)),
    quandCran: quandRayon
  });
  roueB = monterRoue(pisteB, {
    longueur: () => etageresCourantes().length,
    rangCourant: () => Math.max(0, etageresCourantes().findIndex((e) => e.id === etagereId)),
    quandCran: quandEtagere
  });

  if (vierge) { attendreB(); attendreGrille(); } else { remplirB(); remplirGrille(); }

  const roues = el("section", "equipment-drum");
  roues.append(faireEtage("rayons", "aisle", pisteA, (sens) => roueA.avancer(sens)));
  roues.append(faireEtage("etageres", "shelf", pisteB, (sens) => roueB.avancer(sens)));
  /* §6 — CE QUE LE NAVIGATEUR A VRAIMENT ACCORDÉ, DIT PLUTÔT QUE DEVINÉ. */
  roues.append(el("p", "drum-profondeur", [text(profondeurAccordee()
    ? "Wheel depth: on — the browser turns the drum from the scroll itself."
    : "Wheel depth: off — this browser shows the drum flat.")]));

  const barre = el("div", "grille-barre");
  barre.append(button("‹", "grille-fleche", () => tournerPage(-1), "Previous page"));
  barre.append(titre, compte);
  barre.append(button("›", "grille-fleche", () => tournerPage(1), "Next page"));
  const grille = el("section", "equipment-grille");
  grille.append(barre, cases);

  return { roues, grille };
}

/* ══ LA PHRASE DE CLASSE (§1a) ═══════════════════════════════════════════
   AFFICHÉE TELLE QUELLE — zéro découpage en « A »/« B »/« C », zéro
   supposition sur le nombre d'options (le Fighter en a trois, §0.4). */
function renderClassPhrase(query, classRef) {
  const wrap = el("section", "equipment-class-block");
  wrap.append(el("h3", null, [text("Class starting equipment")]));
  if (!classRef) {
    wrap.append(el("p", "equipment-empty-note", [
      text("Choose a class first — its starting equipment text will show here.")
    ]));
    return wrap;
  }
  const view = query({ kind: classRef.kind, id: classRef.id });
  const name = recordLabel(view);
  if (name) wrap.append(el("p", "equipment-class-name", [text(name)]));
  const phrase = view && view.record && view.record.data && typeof view.record.data.starting_equipment === "string"
    ? view.record.data.starting_equipment
    : null;
  wrap.append(el("p", phrase ? "equipment-class-phrase" : "equipment-empty-note", [
    text(phrase || "No starting equipment text on this class record.")
  ]));
  return wrap;
}

/* ══ UNE LIGNE DE SAC ═════════════════════════════════════════════════════
   Éditable (quantity, equipped), retirable. « Retirable » n'est offert QUE
   parce que c'est MESURÉ sûr — voir INVENTAIRE-LOT-49.md : `clear` sur
   `gear[N]` ne fait PAS jeter `rebuild` (contrairement aux six
   caractéristiques, lot 45), et les trois chemins (`gear[N]`, `.quantity`,
   `.equipped`) sont retirés ensemble par `shell.mjs` (`removeGearLine`) pour
   ne laisser aucune entrée orpheline dans `build.choices`. */
function renderGearRow(line, { query, onAction }) {
  const complete = Boolean(line.ref) && Number.isInteger(line.quantity) && typeof line.equipped === "boolean";
  const row = el("div", "equipment-gear-row");
  row.dataset.onSheet = String(complete);

  const view = line.ref ? query({ kind: line.ref.kind, id: line.ref.id }) : null;
  const name = recordLabel(view) || (line.ref ? line.ref.id : "(no item)");
  row.append(el("span", "equipment-gear-name", [text(name)]));

  const meta = [recordCost(view), recordWeight(view)].filter(Boolean).join(" · ");
  if (meta) row.append(el("span", "equipment-gear-meta", [text(meta)]));

  row.append(numberField({
    value: line.quantity,
    min: 1,
    className: "equipment-gear-qty",
    ariaLabel: `Quantity for ${name}`,
    onChange: (raw) => {
      const n = Number(raw);
      if (Number.isInteger(n) && n > 0) onAction({ kind: "set", path: `gear[${line.index}].quantity`, value: n });
    }
  }));

  row.append(renderPicker({
    options: [true, false],
    selected: typeof line.equipped === "boolean" ? [line.equipped] : [],
    labelOf: (v) => (v ? "Equipped" : "Stowed"),
    onSelect: (v) => onAction({ kind: "set", path: `gear[${line.index}].equipped`, value: v })
  }));

  row.append(button("Remove", "equipment-gear-remove",
    () => onAction({ kind: "removeGearLine", index: line.index }),
    `Remove ${name}`));

  if (!complete) {
    row.append(el("p", "equipment-gear-pending", [
      text("Missing quantity or equipped — this line will not reach the sheet until both are set.")
    ]));
  }

  return row;
}

/* ══ LE CHERCHEUR (§1a) — 133 records, un champ, l'action « Add » ═══════
   Toutes les lignes sont rendues UNE FOIS (pas de reconstruction du DOM à
   chaque frappe) et filtrées par `hidden` — même geste que le plan
   escamotable de `shell.mjs` (`aside.hidden`), jamais `display: none` en
   dur dans la feuille de style (garde `tests/ui-jetons.test.mjs`, clause 4).
   Repliée par défaut (une liste de 133 boutons au premier coup d'œil serait
   le défaut inverse de « rien ne se cache » : tout montrer d'un coup revient
   à ne rien distinguer). */
function renderGearSearch({ query, onAction, category, search }) {
  const wrap = el("section", "equipment-search-block");

  /* ⭐ B8.1 — LA MOLETTE FILTRE VRAIMENT. Sans ça elle serait un décor : les
     133 records s'affichaient tous, et l'écran faisait 7 099 px. Le filtre
     est un `kind`, lu sur l'item — jamais un test sur son nom. */
  const tous = catalogue(query);
  const items = !category || category === "all" ? tous : tous.filter((i) => i.kind === category);
  wrap.append(el("h4", null, [text(`Add from the catalogue — ${items.length} records`)]));
  /* ⚠️ LA PHRASE NOMMAIT TROIS GENRES, ET IL Y EN A QUATRE DEPUIS LE LOT 84.
     Ce n'est pas un embellissement : `item` étant entré au catalogue, « gear,
     weapon and armor » décrivait 133 des 386 records montrés. Une phrase que
     la décision d'Eric a rendue fausse se corrige ; le COMPORTEMENT de la
     recherche, lui, ne bouge pas d'une ligne. */
  const emptyNote = el("p", "equipment-empty-note", [
    text(`Type a name to search the ${items.length} records of the catalogue.`)
  ]);
  const resultsWrap = el("div", "equipment-search-results");
  /* 🔴 ON NE REND QUE CE QUI S'AFFICHE, et c'est une mesure : les 133 lignes
     étaient construites puis masquées par `hidden` — sauf qu'`[hidden]` ne
     bat pas un `display: flex` d'auteur. Résultat vu à l'écran : **7 054 px**
     de lignes invisibles mais présentes. Et on ne peut pas y répondre par un
     `display: none` — le garde des jetons l'interdit dans `shell.css`
     (défaut n°3 : effacer des mots). La bonne réponse était de ne pas les
     construire.
     ⛔ Le remplissage passe par `swapContent` (socle.mjs) : le garde du lot
     58 n'autorise `replaceChildren` que là, et il a raison ici aussi. */
  const indexed = items.map((item) => ({
    name: (recordLabel(item.view) || "").toLowerCase(),
    item
  }));

  const MAX_SHOWN = 25;
  const moreNote = el("p", "equipment-search-more", []);
  const afficher = (needle) => {
    const trouves = needle.length === 0 ? [] : indexed.filter((e) => e.name.includes(needle));
    swapContent(resultsWrap, trouves.slice(0, MAX_SHOWN).map((e) => renderSearchResultRow(e.item, onAction)));
    emptyNote.hidden = needle.length > 0;
    moreNote.textContent = trouves.length > MAX_SHOWN
      ? `${trouves.length} matches — showing the first ${MAX_SHOWN}. Refine your search to see the rest.`
      : "";
  };
  const input = searchField({
    placeholder: "Search gear, weapons, armor…",
    className: "equipment-search-input",
    ariaLabel: "Search the equipment catalogue",
    onInput: (raw) => afficher(raw.trim().toLowerCase())
  });

  /* ⏳ B8.1 — la barre de recherche est REPLIÉE DERRIÈRE LA LOUPE, et c'est
     ce qui évite une CINQUIÈME barre fixe (le cumul que B7.6 signale). Eric
     l'a formulé au conditionnel — « si on a la place » : la place existe,
     mesurée, et la loupe la rend. */
  if (search) wrap.append(input);
  wrap.append(emptyNote, resultsWrap, moreNote);
  return wrap;
}

/* ══ B8.3 — CHAQUE ITEM TIENT SUR DEUX LIGNES ════════════════════════════
   « Ligne 1 : le titre. Ligne 2 : prix et poids. `+` et `👁` à droite, et ils
   occupent les deux lignes en hauteur. »

   ⭐ ET LA CONTRAINTE DE B7.3c NE S'APPLIQUE PAS ICI, c'est écrit noir sur
   blanc : Compétences COMPRIME (une ligne), Equipment EMPILE (deux). Les
   deux écrans les plus denses résolvent le même problème de largeur
   différemment, et c'est délibéré — ⛔ ne pas « harmoniser ».
   📌 C'est aussi ce qui règle les trois noms d'outils que Compétences devait
   couper (`Calligrapher's Supplies`…) : ici, ils ont la ligne entière. */
function renderSearchResultRow({ kind, view }, onAction) {
  const row = el("div", "equipment-search-result");
  const name = recordLabel(view) || view.id;
  const texte = el("div", "equipment-item-text");
  texte.append(el("span", "equipment-item-name", [text(name)]));
  const meta = [recordCost(view), recordWeight(view)].filter(Boolean).join(" · ");
  texte.append(el("span", "equipment-item-meta", [text(meta || "—")]));
  row.append(texte);
  row.append(button("+", "equipment-item-add",
    () => onAction({ kind: "addGearLine", ref: { kind, id: view.id }, quantity: 1, equipped: false }),
    `Add ${name}`));
  /* B8.3d/e — « l'œil ouvre une GROSSE fenêtre en overlay avec le texte
     associé », et « elle se ferme si on tape ou clique dehors ». C'est le
     popup partagé (III.4, lot 62) — la troisième de ses trois occurrences
     annoncées, et il n'a pas fallu en écrire une ligne de plus. */
  row.append(button("\u{1F441}", "equipment-item-eye",
    () => onAction({ kind: "popup", titre: name, texte: recordProse(view) }),
    `About ${name}`));
  return row;
}

/** LE TEXTE ASSOCIÉ À UN RECORD — recopié, jamais résumé. Les genres n'ont
 *  pas les mêmes champs : une arme porte ses dégâts et ses propriétés, une
 *  armure sa CA et son malus de discrétion (mesuré au §B8.0). On lit ce qui
 *  existe, dans l'ordre où le record le porte.
 *
 *  🔴 ET DEPUIS QUE `item` EST AU CATALOGUE (lot 84), CET ŒIL MONTRE UN DÉFAUT
 *  D'EXTRACTION QU'IL NE FAUT PAS PRENDRE POUR LE SIEN. Cinq objets magiques
 *  anglais n'existent pas dans le corpus : leur texte a été AVALÉ par le record
 *  qui les précède alphabétiquement. Vérifié ligne à ligne le 2026-08-23 —
 *  les cinq absents (Dancing Sword, Frost Brand, Luck Blade, Sword of Life
 *  Stealing, Sword of Wounding) et les cinq qui les portent (Dagger of Venom
 *  1437 car., Folding Boat 1449, Lantern of Revealing 1120, Sun Blade 1313,
 *  Sword of Sharpness 710). L'œil posé sur « Dagger of Venom » montre donc
 *  DEUX objets dans un seul, et rien ne rougit.
 *  ⛔ ON NE RÉPARE RIEN ICI : c'est `fh-srd`, un autre dépôt, un autre lot —
 *  qui connaît déjà le défaut et l'a gravé (garde `POLLUTED_BY_EXTRACTION`,
 *  `src/correspond.py`, et son test d'acceptation). Ce commentaire existe pour
 *  qu'on ne cherche pas le défaut ici. */
function recordProse(view) {
  const data = (view && view.record && view.record.data) || {};
  const lignes = [];
  if (typeof data.description === "string" && data.description) lignes.push(data.description);
  for (const [label, valeur] of [
    ["Damage", data.damage],
    ["Mastery", data.mastery],
    ["Properties", Array.isArray(data.properties) ? data.properties.join(", ") : data.properties],
    ["AC", data.ac_base],
    ["Strength", data.strength],
    ["Stealth", data.stealth_disadvantage ? "disadvantage" : null]
  ]) {
    if (valeur !== undefined && valeur !== null && valeur !== "") lignes.push(`${label}: ${valeur}`);
  }
  return lignes.length > 0 ? lignes.join("\n") : "No further detail on this record.";
}

/* ══ LE SAC — la liste des lignes déjà posées, plus le chercheur ═════════ */
function renderGearBlock({ document, resolved, query, onAction, category, search }) {
  const wrap = el("section", "equipment-gear-block");
  wrap.append(el("h3", null, [text("Gear")]));

  /* La preuve que l'écran parle au moteur (commande §4, test 5) : l'AC
     affichée ici est LUE dans `resolved.ac`, jamais recalculée — une armure
     posée `equipped: true` la change sous les yeux, ou elle ne change rien
     du tout. */
  if (resolved && Number.isInteger(resolved.ac)) {
    wrap.append(el("p", "equipment-ac-readout", [text(`Armor Class: ${resolved.ac}`)]));
  }

  const lines = currentGearLines(document);
  const list = el("div", "equipment-gear-list");
  if (lines.length === 0) {
    list.append(el("p", "equipment-empty-note", [
      text("No gear yet — search the catalogue below to add a first item.")
    ]));
  } else {
    for (const line of lines) list.append(renderGearRow(line, { query, onAction }));
  }
  wrap.append(list);

  /* ══ LOT 84 — LE TAMBOUR, ET L'ORDRE VIENT DU CROQUIS ══════════════════
     Eric, 2026-08-23 : les deux roues sont AU-DESSUS de la recherche, la
     grille EN DESSOUS. Le dessin fait foi, et il sépare bien les deux — d'où
     un tambour qui rend deux nœuds au lieu d'un bloc d'un seul tenant.
     ⛔ LA RECHERCHE NE BOUGE PAS D'UNE LIGNE : elle reste ce qu'elle est,
     entre les deux, avec sa loupe et ses 25 premiers résultats. */
  const { roues, grille } = renderTambour({ query, onAction });
  wrap.append(roues);
  wrap.append(renderGearSearch({ query, onAction, category, search }));
  wrap.append(grille);
  return wrap;
}

/* ══ LA BOURSE (§1b/§1c) ══════════════════════════════════════════════════
   Quatre champs TOUJOURS visibles (le piège de §0.2 rendu, pas caché) plus
   un geste explicite pour les 50 PO hérités — jamais posé tout seul au
   rendu (§1b : « il ne les repose pas à chaque passage »), seulement au
   clic (`addInheritedPurse`, `shell.mjs`). */
function renderCurrencyBlock({ document, resolved, onAction }) {
  const wrap = el("section", "equipment-currency-block");
  wrap.append(el("h3", null, [text("Purse")]));

  const current = currentCurrency(document);
  const row = el("div", "equipment-currency-row");
  for (const key of CURRENCY_KEYS) {
    row.append(el("label", "equipment-currency-field", [
      el("span", "equipment-currency-label", [text(key.toUpperCase())]),
      numberField({
        value: current[key],
        min: 0,
        className: "equipment-currency-input",
        ariaLabel: `${key.toUpperCase()} coins`,
        onChange: (raw) => {
          const n = Number(raw);
          if (Number.isInteger(n) && n >= 0) onAction({ kind: "set", path: `currency.${key}`, value: n });
        }
      })
    ]));
  }
  wrap.append(row);

  /* 🔴 LE PIÈGE, RENDU VISIBLE : tant que les quatre clefs ne sont pas
     posées (zéros compris), `resolved.currency` n'existe pas — cette ligne
     ne l'invente jamais, elle dit l'état tel quel. */
  if (resolved && resolved.currency) {
    const total = CURRENCY_KEYS.map((key) => `${resolved.currency[key]} ${key}`).join(", ");
    wrap.append(el("p", "equipment-purse-readout", [text(`On the sheet: ${total}`)]));
  } else {
    wrap.append(el("p", "equipment-empty-note", [
      text("All four denominations (cp / sp / gp / pp) must be set — zeros count — before a purse reaches the sheet.")
    ]));
  }

  wrap.append(button(`Add the inherited purse (${INHERITED_PURSE_GP} GP)`, "equipment-purse-btn",
    () => onAction({ kind: "addInheritedPurse" })));
  wrap.append(el("p", "equipment-purse-note", [text(
    "Where this comes from: Fate's Hand dropped the four SRD backgrounds, and with them their " +
    "“or 50 GP” option. These 50 GP are inherited from that option, not invented — they " +
    "add to whatever gold the class package already grants, they never replace it."
  )]));

  return wrap;
}

/**
 * @param {object} ctx
 * @param {object} [ctx.document] le document brut du dernier `rebuild()` — seule source de `class`, `gear[N]`, `currency.*`
 * @param {object} [ctx.resolved] la fiche dérivée — `resolved.ac`, `resolved.gear`, `resolved.currency`, jamais recalculés
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {(action:{kind:string, [key:string]:*}) => void} onAction  `set`/`clear` ordinaires, plus les trois gestes
 *   composites de `shell.mjs` : `addGearLine` ({ref,quantity,equipped}), `removeGearLine` ({index}), `addInheritedPurse` ()
 */
/* ══ B8.1 — LE BANDEAU DU HAUT, ET IL FLOTTE ════════════════════════════
   « Le budget en pièces, SANS TROP PRENDRE DE PLACE » · « une molette
   horizontale qui catégorise les équipements » · « un point d'interrogation
   à côté du budget » qui rappelle « What you already have ».

   ⏳ LA LOUPE — Eric l'a formulée AU CONDITIONNEL : « SI on a la place pour
   poser une loupe dans les flottants pour invoquer la barre de recherche, ce
   serait pas mal ». C'est donc une PRÉFÉRENCE, pas une exigence — et la
   place existe, mesurée : le bandeau tient sur deux lignes de 44 px comme
   celui de Compétences. La loupe est là, et elle évite une CINQUIÈME barre
   fixe (le point que B7.6 signalait). */

export const EQUIPMENT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "weapon", label: "Weapons" },
  { id: "armor", label: "Armor" },
  { id: "gear", label: "Gear" }
];

/** LA BARRE FIXE de l'écran : la bourse, le `?`, la loupe, la molette. */
export function renderEquipmentBar(ctx, onAction) {
  const act = onAction || ctx.onAction || (() => {});
  const wrap = el("div", "equipment-topbar");

  const ligne = el("div", "equipment-purse-bar");
  const purse = currentCurrency(ctx.document);
  const pieces = CURRENCY_KEYS.map((k) => `${purse[k] || 0} ${k.toUpperCase()}`).join(" · ");
  ligne.append(el("span", "equipment-purse-value", [text(pieces)]));
  /* B8.1 — le point d'interrogation, À CÔTÉ DU BUDGET, qui rappelle la
     fenêtre. B8.2d, mot pour mot. */
  ligne.append(button("?", "equipment-help",
    () => act({ kind: "popup", titre: "What you already have", texte: whatYouHave(ctx) }),
    "What you already have"));
  ligne.append(button("\u{1F50D}", "equipment-magnifier",
    () => act({ kind: "equipmentSearch" }), "Search the catalogue"));
  wrap.append(ligne);

  const bar = el("nav", "equipment-catbar");
  bar.setAttribute("aria-label", "Equipment categories");
  for (const cat of EQUIPMENT_CATEGORIES) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "equipment-cat";
    item.dataset.value = cat.id;
    item.setAttribute("aria-current", cat.id === (ctx.category || "all") ? "true" : "false");
    item.textContent = cat.label;
    item.addEventListener("click", () => act({ kind: "equipmentCategory", value: cat.id }));
    bar.append(item);
  }
  wrap.append(bar);
  return wrap;
}

/** B8.2 — « une fenêtre qui dit ce qu'on POSSÈDE DÉJÀ, et explique
 *  POURQUOI ». Le pourquoi vient du document : le paquet de la classe et les
 *  50 PO d'héritage sont deux origines distinctes, et le joueur doit savoir
 *  laquelle lui a donné quoi. */
export function whatYouHave(ctx) {
  const doc = ctx.document;
  const lignes = currentGearLines(doc);
  const purse = currentCurrency(doc);
  const morceaux = [];
  const classRef = currentClassRef(doc);
  if (classRef) {
    const view = ctx.query({ kind: "class", id: classRef.id });
    const phrase = view && view.record && view.record.data && view.record.data.starting_equipment;
    if (phrase) morceaux.push(`From your class:\n${phrase}`);
  }
  morceaux.push(`In your purse: ${CURRENCY_KEYS.map((k) => `${purse[k] || 0} ${k.toUpperCase()}`).join(" · ")}`);
  morceaux.push(lignes.length > 0
    ? `You have added ${lignes.length} line${lignes.length === 1 ? "" : "s"} of gear.`
    : "You have not added anything yet.");
  return morceaux.join("\n\n");
}

/**
 * @param {object} ctx
 * @param {object} ctx.document   le document brut
 * @param {object} ctx.resolved   la fiche dérivée — l'AC et la bourse
 * @param {Function} ctx.query    `layers.verbs.query`
 * @param {string} [ctx.category] le filtre courant de la molette
 * @param {boolean} [ctx.search]  la barre de recherche est-elle invoquée
 */
export function renderEquipmentStep(ctx, onAction) {
  const doc = ctx.document || null;
  const resolved = ctx.resolved || null;
  const query = ctx.query || (() => []);
  const act = onAction || ctx.onAction || (() => {});
  const section = el("section", "equipment-step");

  section.append(renderGearBlock({ document: doc, resolved, query, onAction: act, category: ctx.category, search: ctx.search }));
  section.append(renderCurrencyBlock({ document: doc, resolved, onAction: act }));
  return section;
}

/** LE PALIER — un seul, et il est toujours prêt : **rien n'est obligatoire
 *  ici**. Un personnage sans équipement est incomplet, pas fautif — et le
 *  moteur ne refuse rien sur ce chemin (mesuré : aucune violation
 *  `gear.*`). */
export function equipmentValidate() {
  return { exists: true, ready: true, action: null, next: "step" };
}
