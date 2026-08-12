/* ══ LA COUCHE D'AFFICHAGE DU BUILDER — lot 25 ════════════════════════

   `render(document, report) → string`. UNE FONCTION PURE : aucune lecture de
   disque, aucun DOM, aucune horloge. Elle rend une CHAÎNE, donc elle se teste
   avec `node:test` et zéro paquet — c'est la décision d'architecture du lot
   (LOT-25-BUILDER-AFFICHAGE.md §2). La page HTML n'est qu'une coquille qui
   reçoit cette chaîne : voir `src/tools/fiche.mjs`.

   ⚠️ CE N'EST PAS UN BLOC. Rien ici ne possède d'état, n'émet d'événement, ni
   n'expose de verbe. La tranche suivante décidera où vit la vraie vue ; ce
   fichier est un OUTIL, rangé avec les autres outils du dépôt.

   ══ LES QUATRE PROPRIÉTÉS QUE CE FICHIER TIENT ═══════════════════════

   1. TOUTE VALEUR AFFICHÉE PORTE SON CHEMIN, et le chemin est CONSTRUIT PAR
      LA MARCHE, jamais écrit dans un gabarit. Le rendu ne connaît le nom
      d'AUCUN champ de `resolved` — il descend ce qu'on lui donne. C'est ce qui
      permettra au builder d'apparier un chemin affiché avec
      `build.overrides[].path` sans qu'une ligne de ce fichier soit réécrite.

   2. UN CHEMIN CONSTRUIT N'EST PAS UN CHEMIN VALIDE, et le rendu le DIT. La
      grammaire d'override (`$defs/overridePath`) désigne un élément de
      collection par son IDENTITÉ, jamais par un indice — donc un élément sans
      `id` n'est adressable par personne. Le rendu ne fabrique pas d'ancre pour
      masquer le trou : il affiche le chemin qu'il faudrait, et le marque
      INADRESSABLE. La grammaire est IMPORTÉE (`OVERRIDE_PATH`), pas recopiée.

   3. `underived` ET `warnings` ONT UNE PLACE PERMANENTE. Elle est rendue même
      quand il n'y a rien à y mettre, et surtout quand le rapport est ABSENT —
      ce qui est le cas ordinaire, puisque `fh-char/1` n'a nulle part où le
      garder (voir INVENTAIRE-LOT-25.md, trou n°1). Une rubrique vide affiche
      la raison que le moteur en donne, jamais un blanc.

   4. LE RENDU NE CALCULE AUCUNE RÈGLE. Il n'additionne rien, ne dérive rien,
      ne complète rien. En particulier : le total d'une `stat` est affiché TEL
      QUE LE DOCUMENT LE PORTE, même s'il contredit son propre détail. Un écran
      qui « corrige » en recalculant masque les bugs du moteur — c'est l'attaque
      obligatoire du lot, et elle est jouée dans tests/render-fiche.test.mjs.

   Les mots de l'interface sont regroupés dans `LIBELLES` et `MOTS`, en bas de
   ce fichier. Aucun nom de règle n'est écrit ici (loi §0.13) : tout le reste
   des mots affichés vient du document. */

import { OVERRIDE_PATH } from "../build/paths.mjs";
import { createLabels } from "../labels.mjs";

/* ══ LA MARCHE ════════════════════════════════════════════════════════

   Elle descend une valeur JSON et rend un ARBRE de nœuds, chacun portant le
   chemin qui y mène. Trois formes, et rien d'autre :

     · `feuille` — un scalaire (ou `null`) : c'est ce qui s'affiche.
     · `objet`   — ses enfants sont ses clefs.
     · `liste`   — ses enfants sont ses éléments.

   ⚠️ L'ANCRE D'UN ÉLÉMENT DE LISTE. La grammaire d'override dit « par son
   identité » : on prend donc `item.id` quand il existe. Quand il n'existe pas,
   on écrit l'INDICE — qui est faux au regard de la grammaire, et c'est
   exactement ce qu'on veut voir. `adressable` le constate en passant le chemin
   fini à la grammaire elle-même ; aucune liste d'exceptions n'est tenue à la
   main ici, sinon elle divergerait du schéma le jour où il bouge. */
function marche(valeur, chemin) {
  const noeud = { chemin, adressable: OVERRIDE_PATH.test(chemin) };

  if (Array.isArray(valeur)) {
    noeud.forme = "liste";
    noeud.enfants = valeur.map((item, index) => {
      const ancre = item !== null && typeof item === "object" && !Array.isArray(item) && typeof item.id === "string"
        ? item.id
        : String(index);
      const enfant = marche(item, `${chemin}[${ancre}]`);
      enfant.cle = ancre;
      /* L'indice a servi d'ancre : le chemin ne désigne rien pour un override,
         et le nœud porte POURQUOI plutôt qu'un simple « non ». */
      if (ancre === String(index)) enfant.sansIdentite = true;
      return enfant;
    });
    return noeud;
  }

  if (valeur !== null && typeof valeur === "object") {
    noeud.forme = "objet";
    noeud.enfants = Object.keys(valeur).map((cle) => {
      const enfant = marche(valeur[cle], `${chemin}.${cle}`);
      enfant.cle = cle;
      return enfant;
    });
    return noeud;
  }

  noeud.forme = "feuille";
  noeud.valeur = valeur;
  return noeud;
}

/** Les enfants, découpés en TRANCHES : une suite de feuilles voisines fait une
 *  ligne (une cellule par feuille) ; tout ce qui n'est pas une feuille fait un
 *  bloc à part.
 *
 *  ⚠️ C'EST DE LÀ QUE SORT « UN TERME = UNE LIGNE » pour le détail d'une
 *  statistique — sans un mot de gabarit sur `breakdown`, et sans que ce
 *  fichier connaisse le nom d'un seul champ. La règle est de FORME : ce qui se
 *  lit d'un coup d'œil se met sur une ligne. Elle vaut pour un terme de
 *  Score comme pour une compétence ou une pièce d'équipement. */
function tranches(noeud) {
  const sortie = [];
  for (const enfant of noeud.enfants) {
    const dernier = sortie[sortie.length - 1];
    if (enfant.forme === "feuille" && dernier !== undefined && dernier.ligne) dernier.noeuds.push(enfant);
    else sortie.push({ ligne: enfant.forme === "feuille", noeuds: [enfant] });
  }
  return sortie;
}

/* ══ LE MODÈLE ════════════════════════════════════════════════════════ */

/** La rubrique dont parle une entrée `underived`. Les `field` du moteur
 *  s'écrivent `stats`, `stats[fh:destiny].base`, `traits (espèce)` — la
 *  rubrique est l'identifiant de tête, et TOUT CE QUI N'EN EST PAS UN part au
 *  bloc commun. Aucune entrée n'est jetée : un test compte les deux bouts. */
export function rubriqueDe(field) {
  const tete = /^[a-zA-Z][a-zA-Z0-9]*/.exec(String(field));
  return tete === null ? null : tete[0];
}

/**
 * Le modèle de la fiche : ce que l'écran va montrer, avant tout HTML.
 * Rendu séparément du HTML pour que les tests portent sur la STRUCTURE
 * (« cette valeur a ce chemin ») et pas sur une chaîne à trous.
 *
 * @param {object} document un `fh-char/1`.
 * @param {object|null} report le rendu de `build.rebuild` — `{underived,
 *   warnings, …}`. ABSENT est le cas ordinaire : le document ne le porte pas.
 * @param {object} [libelles] le paquet de TITRES de rubrique — `LIBELLES`
 *   (français) par défaut. Lot 40 : `render()` passe `LIBELLES_EN` pour la
 *   langue anglaise. ⚠️ Ce paquet reste un objet ordinaire, jamais un
 *   accesseur qui jette : une rubrique que le contrat ajouterait demain doit
 *   pouvoir s'afficher quand même, sous sa clef nue (voir plus bas).
 */
export function modele(document, report, libelles = LIBELLES) {
  const doc = document && typeof document === "object" ? document : {};
  const resolved = doc.resolved && typeof doc.resolved === "object" ? doc.resolved : null;

  const rapport = report && typeof report === "object" ? report : null;
  const underived = rapport && Array.isArray(rapport.underived) ? rapport.underived : [];
  const warnings = rapport && Array.isArray(rapport.warnings) ? rapport.warnings : [];
  /* LES CHOIX QUE LA DÉRIVATION N'A PAS CONSOMMÉS. Ce ne sont pas des champs
     manquants : ce sont des DÉCISIONS DU JOUEUR qui n'ont laissé aucune trace
     dans `resolved`. Le moteur les nomme, et un écran qui les tairait ferait
     croire qu'elles ont été prises en compte. */
  const unconsumed = rapport && Array.isArray(rapport.unconsumed) ? rapport.unconsumed : [];

  /* Les surcharges, indexées par chemin — c'est l'appariement qui fait tout
     l'intérêt d'un rendu adressé, et il ne coûte que cette ligne. */
  const overrides = new Map();
  const build = doc.build && typeof doc.build === "object" ? doc.build : {};
  if (Array.isArray(build.overrides)) {
    for (const entree of build.overrides) {
      if (entree && typeof entree === "object" && typeof entree.path === "string") overrides.set(entree.path, entree);
    }
  }

  const rubriques = [];
  const places = new Set();
  if (resolved !== null) {
    for (const cle of Object.keys(resolved)) {
      const racine = marche(resolved[cle], `resolved.${cle}`);
      racine.cle = cle;
      const declarations = underived.filter((entree) => entree && rubriqueDe(entree.field) === cle);
      for (const entree of declarations) places.add(entree);
      rubriques.push({
        cle,
        titre: libelles[cle] === undefined ? null : libelles[cle],
        racine,
        vide: estVide(resolved[cle]),
        declarations
      });
    }
  }

  return {
    /* L'en-tête du document. Ces champs vivent HORS de `resolved` : aucun
       chemin d'override ne peut les viser, et le rendu ne prétend pas le
       contraire (il ne leur attribue aucun chemin). */
    entete: {
      nom: doc.name,
      id: doc.id,
      lang: doc.lang,
      schema: doc.schema,
      modifie: doc.modified
    },
    manquant: resolved === null,
    rubriques,
    overrides,
    rapport: {
      present: rapport !== null,
      warnings,
      underived,
      unconsumed,
      /* Ce que personne ne réclame : les déclarations dont la rubrique de tête
         n'est pas l'une des rubriques du document. Elles s'affichent quand
         même, dans le bloc permanent — une déclaration perdue serait pire
         qu'une case vide. */
      orphelines: underived.filter((entree) => !places.has(entree))
    }
  };
}

function estVide(valeur) {
  if (Array.isArray(valeur)) return valeur.length === 0;
  if (valeur !== null && typeof valeur === "object") return Object.keys(valeur).length === 0;
  return false;
}

/* ══ LE HTML ══════════════════════════════════════════════════════════ */

const ECHAPPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/** Exporté pour les tests : ils cherchent dans la SORTIE des mots qui y sont
 *  échappés. Une seconde copie de l'échappement côté test divergerait de
 *  celle-ci, et le jour où elle divergerait, le test ne prouverait plus rien. */
export function echappe(valeur) {
  return String(valeur).replace(/[&<>"']/g, (c) => ECHAPPES[c]);
}
const ech = echappe;

/** Une valeur de feuille, telle qu'elle est. `null` et la chaîne vide se
 *  DISENT, ils ne se rendent pas en blanc : un blanc se confond avec « pas
 *  affiché », et le document ne dit pas la même chose dans les deux cas.
 *  `mots(id)` est l'accesseur du paquet ACTIF (voir `packFor`, en bas de ce
 *  fichier) — il jette si `id` n'y a pas de mot, jamais un blanc silencieux. */
function valeurHtml(valeur, mots) {
  if (valeur === null) return `<em class="rien">${ech(mots("nul"))}</em>`;
  if (valeur === "") return `<em class="rien">${ech(mots("chaineVide"))}</em>`;
  if (typeof valeur === "boolean") return `<span class="bool">${valeur ? ech(mots("oui")) : ech(mots("non"))}</span>`;
  return ech(valeur);
}

/** L'étiquette d'une valeur : le CHEMIN, et son verdict d'adressabilité. */
function chemin(noeud, override, mots) {
  const classes = ["chemin", noeud.adressable ? "ok" : "ko"];
  if (override !== undefined) classes.push("surcharge");
  const titre = noeud.adressable
    ? mots("adressable")
    : (noeud.sansIdentite ? mots("sansIdentite") : mots("horsGrammaire"));
  return `<code class="${classes.join(" ")}" data-path="${ech(noeud.chemin)}" ` +
    `data-adressable="${noeud.adressable ? "oui" : "non"}" title="${ech(titre)}">${ech(noeud.chemin)}</code>`;
}

function badgeOverride(override, mots) {
  if (override === undefined) return "";
  const qui = typeof override.by === "string" ? override.by : "?";
  const note = typeof override.note === "string" && override.note.length > 0 ? ` — ${ech(override.note)}` : "";
  return `<span class="badge">${ech(mots("surcharge"))} · ${ech(qui)}${note}</span>`;
}

function feuilleHtml(noeud, overrides, mots) {
  const override = overrides.get(noeud.chemin);
  return `<div class="feuille">${chemin(noeud, override, mots)}` +
    `<span class="val">${valeurHtml(noeud.valeur, mots)}</span>${badgeOverride(override, mots)}</div>`;
}

/** Une tranche de feuilles voisines : UNE ligne, une cellule par feuille. Le
 *  nom de la clef est affiché parce qu'il vient du DOCUMENT — ce n'est pas un
 *  mot d'interface. */
function ligneHtml(feuilles, overrides, mots) {
  const cellules = feuilles.map((enfant) => {
    const override = overrides.get(enfant.chemin);
    return `<span class="cell">${chemin(enfant, override, mots)}` +
      `<b>${valeurHtml(enfant.valeur, mots)}</b>${badgeOverride(override, mots)}</span>`;
  }).join("");
  return `<div class="ligne"><div class="cells">${cellules}</div></div>`;
}

function noeudHtml(noeud, overrides, mots) {
  if (noeud.forme === "feuille") return feuilleHtml(noeud, overrides, mots);
  if (noeud.enfants.length === 0) {
    return `<div class="ligne vide">${chemin(noeud, overrides.get(noeud.chemin), mots)}` +
      `<em class="rien">${ech(noeud.forme === "liste" ? mots("listeVide") : mots("objetVide"))}</em></div>`;
  }
  const corps = tranches(noeud)
    .map((tranche) => (tranche.ligne
      ? ligneHtml(tranche.noeuds, overrides, mots)
      : noeudHtml(tranche.noeuds[0], overrides, mots)))
    .join("");
  const override = overrides.get(noeud.chemin);
  return `<div class="bloc">${chemin(noeud, override, mots)}${badgeOverride(override, mots)}${corps}</div>`;
}

function declarationsHtml(declarations, mots) {
  if (declarations.length === 0) return "";
  const items = declarations.map((entree) =>
    `<li><code>${ech(entree.field)}</code> — ${ech(entree.reason)}</li>`).join("");
  return `<div class="declare"><strong>${ech(mots("nonDerive"))}</strong><ul>${items}</ul></div>`;
}

function rubriqueHtml(rubrique, overrides, mots) {
  const titre = rubrique.titre === null
    ? `<code>${ech(rubrique.cle)}</code> <em class="rien">${ech(mots("sansLibelle"))}</em>`
    : ech(rubrique.titre);
  /* UNE RUBRIQUE VIDE ET SANS RAISON EST UN DÉFAUT, ET ELLE LE DIT. C'est la
     seule façon pour l'écran de rester aussi honnête que le moteur : « vide »
     n'est une information que lorsqu'on sait pourquoi. */
  const muette = rubrique.vide && rubrique.declarations.length === 0
    ? `<div class="muette">${ech(mots("videSansRaison"))}</div>`
    : "";
  return `<section data-rubrique="${ech(rubrique.cle)}">` +
    `<h2>${titre} <code class="cle">${ech(rubrique.cle)}</code></h2>` +
    declarationsHtml(rubrique.declarations, mots) + muette +
    noeudHtml(rubrique.racine, overrides, mots) +
    "</section>";
}

function rapportHtml(rapport, mots) {
  const lignes = [];
  if (!rapport.present) {
    lignes.push(`<p class="alerte">${ech(mots("rapportAbsent"))}</p>`);
  } else {
    lignes.push(rapport.warnings.length === 0
      ? `<p class="rien">${ech(mots("aucunAvertissement"))}</p>`
      : `<ul class="warn">${rapport.warnings.map((mot) => `<li>${ech(mot)}</li>`).join("")}</ul>`);
    lignes.push(`<p class="compte">${ech(mots("compteNonDerive"))} ${rapport.underived.length}</p>`);
    if (rapport.unconsumed.length > 0) {
      lignes.push(`<div class="declare"><strong>${ech(mots("nonConsommes"))}</strong><ul>` +
        rapport.unconsumed.map((chemin) => `<li><code>${ech(chemin)}</code></li>`).join("") +
        "</ul></div>");
    }
    if (rapport.orphelines.length > 0) {
      lignes.push(`<div class="declare"><strong>${ech(mots("orphelines"))}</strong><ul>` +
        rapport.orphelines.map((entree) =>
          `<li><code>${ech(entree.field)}</code> — ${ech(entree.reason)}</li>`).join("") +
        "</ul></div>");
    }
  }
  return `<section data-bloc="rapport"><h2>${ech(mots("titreRapport"))}</h2>${lignes.join("")}</section>`;
}

function enteteHtml(entete, mots) {
  /* `<b class="meta">` et non `<b>` : ces valeurs-là n'ont PAS de chemin, et un
     test compte les `<b>` nus pour interdire qu'une valeur de `resolved` soit
     un jour rendue sans le sien. Les deux ne doivent pas se confondre. */
  const champs = Object.keys(entete)
    .map((cle) => `<span class="cell"><span class="cle">${ech(cle)}</span>` +
      `<b class="meta">${valeurHtml(entete[cle] === undefined ? null : entete[cle], mots)}</b></span>`)
    .join("");
  return `<header data-bloc="entete"><h1>${ech(entete.nom === undefined ? mots("sansNom") : entete.nom)}</h1>` +
    `<div class="cells">${champs}</div>` +
    `<p class="note">${ech(mots("enteteHorsResolved"))}</p></header>`;
}

/* ══ LES PAQUETS DE MOTS, PAR LANGUE — LOT 40 ═════════════════════════

   `LIBELLES`/`MOTS` (français) existaient depuis le lot 25 ; ce lot y ajoute
   `LIBELLES_EN`/`MOTS_EN`, SANS toucher au français (loi de la commande :
   « ne traduis pas en place »). Le mécanisme est celui de `src/labels.mjs`,
   littéralement réemployé plutôt qu'imité — `createLabels` produit un
   accesseur qui JETTE sur un identifiant sans mot, au lieu de rendre un blanc
   ou l'identifiant nu. C'est le paquet MOTS qui passe par cet accesseur : un
   ID de mot d'interface est un ensemble FERMÉ, connu du code, donc une
   absence est une faute du paquet. `LIBELLES`, lui, reste un objet ordinaire
   consulté par clef nue : ses clefs sont celles de `resolved`, un ensemble
   OUVERT que le contrat peut agrandir, et une rubrique sans libellé s'affiche
   quand même, marquée comme telle (voir `rubriqueHtml`) — pas une régression
   à faire jeter. */

function packFor(lang) {
  const pack = { fr: { libelles: LIBELLES, mots: MOTS_T_FR }, en: { libelles: LIBELLES_EN, mots: MOTS_T_EN } }[lang];
  if (pack === undefined) {
    throw new Error(`fhpc/render-fiche: no word pack for lang "${lang}" (known: fr, en).`);
  }
  return pack;
}

/**
 * LE RENDU. `document` seul suffit à produire une page ; `report` est le
 * rendu de `build.rebuild`, et son absence est AFFICHÉE, pas comblée.
 *
 * @param {object} document un `fh-char/1`.
 * @param {object} [report] `{underived, warnings, …}` du dernier `rebuild`.
 * @param {"fr"|"en"} [lang] la langue des MOTS D'INTERFACE — "fr" par défaut
 *   (comportement du lot 25, inchangé). "en" est le paquet du lot 40 : c'est
 *   celui que le builder (mots anglais, arbitrage d'Eric 2026-08-10) emploie.
 *   ⚠️ Ne traduit jamais le DOCUMENT — seulement les mots que ce fichier
 *   ajoute autour de lui.
 * @returns {string} un fragment HTML — la coquille s'occupe du reste.
 */
export function render(document, report, lang = "fr") {
  const { libelles, mots } = packFor(lang);
  const vue = modele(document, report, libelles);
  const corps = vue.manquant
    ? `<p class="alerte">${ech(mots("resolvedAbsent"))}</p>`
    : vue.rubriques.map((rubrique) => rubriqueHtml(rubrique, vue.overrides, mots)).join("");
  return `<article class="fiche">${enteteHtml(vue.entete, mots)}${rapportHtml(vue.rapport, mots)}${corps}</article>`;
}

/* ══ LES MOTS DE L'INTERFACE — TOUS ICI, ET NULLE PART AILLEURS ═══════

   Loi §0.13 : aucun nom de règle n'est écrit dans un rendu. Ce qui suit n'est
   pas du vocabulaire de jeu — ce sont les titres des rubriques du CONTRAT et
   les phrases de l'écran. Les clefs sont celles de `$defs/resolved` ; une
   rubrique que le contrat ajouterait demain s'affiche quand même, sous sa clef
   nue et marquée « sans libellé » (voir `rubriqueHtml`). */
export const LIBELLES = {
  derivation: "Dérivation",
  identity: "Identité",
  abilities: "Caractéristiques",
  proficiency: "Bonus de maîtrise",
  ac: "Classe d'armure",
  vitals: "Points de vie et états",
  speeds: "Vitesses",
  senses: "Sens",
  languages: "Langues",
  saves: "Jets de sauvegarde",
  skills: "Compétences",
  tools: "Outils",
  actions: "Actions",
  spellcasting: "Incantation",
  resources: "Ressources",
  traits: "Traits et aptitudes",
  gear: "Équipement",
  currency: "Bourse",
  craft: "Artisanat",
  stats: "Statistiques dérivées",
  notes: "Notes"
};

export const MOTS = {
  titreRapport: "Rapport de dérivation",
  rapportAbsent: "AUCUN RAPPORT DE DÉRIVATION N'ACCOMPAGNE CE DOCUMENT. " +
    "`fh-char/1` n'a pas de place pour le conserver : les déclarations « non dérivé » et les " +
    "avertissements sont le rendu de `build.rebuild`, et ils sont perdus dès qu'on referme le fichier. " +
    "Ce qui suit est donc muet sur ce que le moteur savait.",
  aucunAvertissement: "Aucun avertissement.",
  compteNonDerive: "Déclarations « non dérivé » reçues :",
  nonConsommes: "Choix du joueur qu'aucune règle n'a consommés — ils ne laissent AUCUNE trace dans la fiche :",
  orphelines: "Déclarations qui ne se rattachent à aucune rubrique du document :",
  nonDerive: "Non dérivé — ce que le moteur n'a pas pu établir, et pourquoi :",
  videSansRaison: "Vide, et le rapport n'en donne aucune raison.",
  resolvedAbsent: "CE DOCUMENT NE PORTE PAS DE `resolved` : il n'y a pas de fiche à afficher.",
  listeVide: "liste vide",
  objetVide: "objet vide",
  nul: "null",
  chaineVide: "chaîne vide",
  oui: "vrai",
  non: "faux",
  sansNom: "(sans nom)",
  sansLibelle: "(rubrique sans libellé)",
  surcharge: "surchargé",
  adressable: "Chemin d'override valide.",
  sansIdentite: "INADRESSABLE : cet élément n'a pas d'`id`, la grammaire d'override le désigne par " +
    "son identité et refuse un indice.",
  horsGrammaire: "INADRESSABLE : ce chemin n'entre pas dans la grammaire de `$defs/overridePath`.",
  enteteHorsResolved: "Ces champs vivent hors de `resolved` : aucun override ne peut les viser."
};

/* ══ LE PAQUET ANGLAIS — LOT 40 ═══════════════════════════════════════
   Les mots d'interface du BUILDER sont en anglais (arbitrage d'Eric,
   2026-08-10 : sa table joue en anglais). `render-fiche.mjs` restait le seul
   endroit encore en français que l'écran réel du joueur allait consommer.

   ⛔ Le français ci-dessus n'a pas bougé, et ce paquet n'en est pas une
   traduction posée « à côté sans lien » : c'est le MÊME jeu de clefs — un
   test (`tests/render-fiche-en.test.mjs`) le garde, comme `LIBELLES`/`MOTS`
   sont déjà gardés l'un contre l'autre par le schéma. */
export const LIBELLES_EN = {
  derivation: "Derivation",
  identity: "Identity",
  abilities: "Abilities",
  proficiency: "Proficiency bonus",
  ac: "Armor Class",
  vitals: "Hit points and conditions",
  speeds: "Speeds",
  senses: "Senses",
  languages: "Languages",
  saves: "Saving throws",
  skills: "Skills",
  tools: "Tools",
  actions: "Actions",
  spellcasting: "Spellcasting",
  resources: "Resources",
  traits: "Traits and features",
  gear: "Gear",
  currency: "Currency",
  craft: "Craft",
  stats: "Derived stats",
  notes: "Notes"
};

export const MOTS_EN = {
  titreRapport: "Derivation report",
  rapportAbsent: "NO DERIVATION REPORT ACCOMPANIES THIS DOCUMENT. " +
    "`fh-char/1` has nowhere to keep it: the “underived” declarations and " +
    "warnings are the output of `build.rebuild`, and they are lost the moment the file is closed. " +
    "What follows is therefore silent about what the engine knew.",
  aucunAvertissement: "No warnings.",
  compteNonDerive: "“Underived” declarations received:",
  nonConsommes: "Player choices no rule consumed — they leave NO trace on the sheet:",
  orphelines: "Declarations that attach to no section of this document:",
  nonDerive: "Underived — what the engine could not establish, and why:",
  videSansRaison: "Empty, and the report gives no reason for it.",
  resolvedAbsent: "THIS DOCUMENT CARRIES NO `resolved`: there is no sheet to display.",
  listeVide: "empty list",
  objetVide: "empty object",
  nul: "null",
  chaineVide: "empty string",
  oui: "true",
  non: "false",
  sansNom: "(unnamed)",
  sansLibelle: "(section without a label)",
  surcharge: "overridden",
  adressable: "Valid override path.",
  sansIdentite: "UNADDRESSABLE: this element has no `id` — the override grammar names it by " +
    "identity and refuses an index.",
  horsGrammaire: "UNADDRESSABLE: this path does not fit the grammar of `$defs/overridePath`.",
  enteteHorsResolved: "These fields live outside `resolved`: no override can target them."
};

/* Les accesseurs qui JETTENT — le mécanisme de `src/labels.mjs`, réemployé
   tel quel plutôt qu'imité (voir `packFor`, plus haut). `MOTS`/`MOTS_EN`
   restent des objets ordinaires exportés pour que les tests (et le garde de
   couverture) les comparent clef à clef ; ce sont CES accesseurs que le rendu
   HTML consulte, jamais `MOTS.xxx`/`MOTS_EN.xxx` en dur. */
const MOTS_T_FR = createLabels(MOTS);
const MOTS_T_EN = createLabels(MOTS_EN);
