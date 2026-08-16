/* ══ LA COQUILLE DU BUILDER — lots 30/31/33, REFONDUE AU LOT 58 ═══════
   Zéro framework, zéro build (loi Q3 du chantier) : DOM natif, ESM natif.

   🔴 CE QUI A CHANGÉ AU LOT 58, ET C'EST LA FONDATION DU RESTE.
   Jusqu'ici, `render()` faisait `app.innerHTML = ""` : toute l'application
   était détruite et reconstruite à chaque clic, et RIEN ne conservait la
   position de défilement. C'était la cause commune de « ça saute » et « ça
   remonte vers le haut » (ERGONOMIE-BUILDER.md, partie A §0), et ça
   détruisait exactement les cinq choses que les invariants exigent de
   garder.

   ⛔ LE CADRE EST MAINTENANT CONSTRUIT UNE FOIS ET NE MEURT JAMAIS :
   `mountFrame()`, plus bas. On y écrit des ATTRIBUTS, jamais des nœuds.
   Seul l'intérieur de la fiche est encore remplacé d'un coup — et
   `swapContent` (socle.mjs) y conserve le défilement.

   📌 LES RÈGLES SONT ÉCRITES À CÔTÉ DU CODE : `ui/builder/SOCLE.md`. Qui
   possède l'état · les trois verbes (`refresh` / `openSurface` / rien) ·
   ce qui ne se redessine jamais · ce qui doit survivre. Un lot d'écran lit
   ce fichier-là au lieu de deviner. */

import { bootEngine, loadExampleDocument, loadDocSchema } from "./engine.mjs?v=34";
import { swapContent, keepInView, watchSnap, mountChevrons } from "./socle.mjs?v=34";
import { mountPopup } from "./popup.mjs?v=34";
import { nomDeFichier, renderReviewStep, reviewValidate } from "./review-step.mjs?v=34";
import { rollAbilityBatch } from "./dice.mjs?v=34";
import { renderConceptStep } from "./concept-step.mjs?v=34";
import { renderUniverseStep, currentStack, fhRefChoices, FH_LAYER_IDS } from "./universe-step.mjs?v=34";
import { renderSkillsStep, renderSkillsBar, skillsCategories, skillsValidate, skillsRefusalWord } from "./skills-step.mjs?v=34";
import {
  catalogueCursor, catalogueValidate, renderCatalogueRail, renderCatalogueCards
} from "./catalogue.mjs?v=34";
import { CLASS_CATALOGUE, renderClassCardBody, renderClassChoices, classPalier2 } from "./class-step.mjs?v=34";
import { SPECIES_CATALOGUE, renderSpeciesCardBody, renderSpeciesChoices, speciesPalier2 } from "./species-step.mjs?v=34";
import { renderInheritanceStep, inheritanceValidate, renderFeatCardBody } from "./inheritance-step.mjs?v=34";
import { renderAbilitiesStep, emptyAbilityAssign, abilitiesValidate, standardArrayBatch } from "./abilities-step.mjs?v=34";
import {
  renderDestinyStep, renderArcanaCardBody, destinyValidate, currentArcanaId, drawArcana
} from "./destiny-step.mjs?v=34";
import { renderEquipmentStep, renderEquipmentBar, equipmentValidate, currentCurrency, nextGearIndex, INHERITED_PURSE_GP } from "./equipment-step.mjs?v=34";
import { CURRENCY_KEYS } from "../../src/build/index.mjs?v=34";
/* LOT 54, §1 — PAS `createDoc` : ce bloc refuse de se construire sans
   magasin, et le navigateur n'en a aucun (voir la tête de
   `src/doc/store.mjs` et `universe-step.mjs`). `createDocWriters` est
   PUR — ni magasin ni bus — importé directement de `writers.mjs`, jamais
   via `src/doc/index.mjs` (qui, lui, importe `store.mjs` et donc
   `node:crypto` : un import que le navigateur ne sait pas résoudre). */
import { createDocWriters } from "../../src/doc/writers.mjs?v=34";
/* ⛔ LOT 65 — `renderFiche` N'EST PLUS IMPORTÉ ICI, et c'est la fin d'une
   histoire : l'étape Review l'appelait pour déverser `resolved` en entier
   (lot 40, une CHAÎNE posée par `innerHTML`). B9 demande un masque, pas un
   dump. **La coquille ne contient donc plus AUCUN `innerHTML`** — les trois
   sites ont disparu l'un après l'autre : `app.innerHTML = ""` au lot 58,
   les crans de la molette au même lot, la fiche de Review ici.
   📌 `src/tools/render-fiche.mjs` VIT TOUJOURS et reste testé (35 tests) :
   c'est l'outil autonome de rendu de fiche, il n'a simplement plus de raison
   d'être appelé depuis le builder.

   ── ⭐ LOT 67 — ET IL EN A RETROUVÉ UNE, HORS DE LA PAGE ─────────────────
   B9.5 demande « un accès à un MODE EXPERT », B9.4 « possiblement un export
   HTML ». Les deux sont ce rendu-là : chaque valeur avec son chemin. Il
   revient donc — mais **jamais dans la coquille** : il part dans un onglet
   ou dans un fichier. C'est ce qui permet de le rendre sans rouvrir le seul
   `innerHTML` du dépôt, et ce n'est pas un contournement : une page autonome
   est précisément ce que `src/tools/fiche.mjs` produit déjà en ligne de
   commande. Le builder fait la même chose, avec le personnage vivant. */
import { injecte, render as renderFiche } from "../../src/tools/render-fiche.mjs?v=34";
/* `canonical.mjs` et pas `serialize.mjs` : le second importe `node:crypto`
   pour `digest` (même piège que `store.mjs` ci-dessous). Le premier est le
   corps de `toBytes`, sorti au lot 67 exactement pour cette page. */
import { canonicalText } from "../../src/doc/canonical.mjs?v=34";
import { ouvrirOnglet, telecharger } from "./fichier.mjs?v=34";
/* Lot 75 — la coquille est un chargement d'EXÉCUTION : elle doit porter la
   version du graphe comme les imports, sinon le cache peut servir la
   coquille d'avant avec un moteur neuf. Voir la tête de `version.mjs`. */
import { versionQuery } from "./version.mjs?v=34";

/* Mots d'interface en ANGLAIS (arbitrage d'Eric, 2026-08-10) : la table joue
   en anglais, décidé de longue date pour la couche FH — l'écran réel qui
   servira à la table doit être dans la même langue dès le départ, pas
   traduit après coup. */
/* 🔀 L'ORDRE EST CELUI QU'ERIC A DÉCIDÉ LE 2026-08-14 (ERGONOMIE-BUILDER.md,
   « LE NOUVEL ORDRE DES ÉTAPES »). Quatre écrans changent de place, six ne
   bougent pas : Abilities monte de la 5ᵉ à la 2ᵉ, Destiny de la 6ᵉ à la 4ᵉ,
   Inheritance descend de la 4ᵉ à la 5ᵉ, Class de la 2ᵉ à la 6ᵉ.

   ✅ MESURÉ SAIN AVANT D'ÊTRE APPLIQUÉ : les deux seuls écrans qui LISENT la
   classe (`skills-step`, `equipment-step`) restent APRÈS elle ; les quatre
   qui passent devant en comptent zéro occurrence. Et `REVIEW_INDEX` se
   trouve par l'id (loi du lot 40) — c'est précisément le scénario que cette
   loi protège, donc réordonner ce tableau SUFFIT.

   ⛔ « Concept » N'EST PAS RENOMMÉ EN « Identity », alors que la décision
   d'Eric le prévoit : `resolved.identity` existe DÉJÀ dans `fh-char/1` et ne
   désigne pas la même chose (ERGONOMIE-BUILDER.md le signale lui-même :
   « à trancher avant de coder, sinon c'est le piège des deux échelles
   typographiques qui recommence »). Deux « identity » qui divergent ont déjà
   coûté une fois sur ce chantier. Le renommage attend son arbitrage ; l'ordre
   n'attendait rien. */
const STEPS = [
  { id: "universe",   label: "Universe & Layers" },
  { id: "concept",    label: "Concept" },
  { id: "abilities",  label: "Abilities" },
  { id: "species",    label: "Species" },
  { id: "destiny",    label: "Destiny" },
  { id: "background", label: "Inheritance" }, // LOT 42, §3d — l'arrière-plan n'existe plus en Fate's Hand ; le libellé change seul
  { id: "class",      label: "Class" },
  { id: "skills",     label: "Skills" },
  { id: "equipment",  label: "Equipment" }, // LOT 49 — le paquet de la classe (une phrase, affichée telle quelle) + la bourse
  { id: "review",     label: "Review" }
];
/* LOT 40 — trouvé PAR l'id, jamais par la position. `STEPS.length - 1`
   désigne le même index aujourd'hui (review est le dernier pas de la
   ceinture), mais le bouton final (§3c) doit mener à Review PARCE QUE c'est
   Review, pas parce qu'un index de tableau coïncide avec elle. */
const REVIEW_INDEX = STEPS.findIndex((step) => step.id === "review");

const state = {
  step: 0,
  engine: null,       // { build, layers, bus } — set once bootEngine() resolves
  document: null,      // the live fh-char/1 document
  decisions: [],        // the last rebuild()'s carnet
  resolved: null,        // the last rebuild()'s fiche — lot 39 needs it whole, not just decisions[]
  report: null,          // LOT 40 — the whole last rebuild() output: {underived, warnings,
                          // unconsumed, …}, exactly the shape render-fiche.mjs's `report` wants
  violations: [],          // the last validate()'s refusals — {key, params, path?}
  engineError: null,
  /* LOT 45 — le hasard n'a AUCUNE existence dans le document (Eric,
     2026-08-13 : "seul le résultat compte", voir ABILITIES/DESTINY steps).
     Ces deux champs sont donc ici, hors de `document`, exactement comme
     l'était `planOpen` — perdus si l'onglet ferme, et c'est voulu.
     *(`planOpen` est parti avec la ligne de commande, refonte 2 §1.)* */
  /* LOT 50 — `abilityRoll` porte maintenant aussi `assign` : la carte
     `clef → index de dé` (commande §2a, « la carte vit au même endroit que
     le lot »). Ni l'un ni l'autre champ n'existe dans `document` — voir
     `abilities-step.mjs`, en-tête. */
  abilityRoll: null,     // le dernier lot de dix jets ({rolls, rerollCount, assign}), ou null
  /* LOT 63 — B5.1c : « il faut CLIQUER pour faire apparaître les rollers ».
     Tant que `abilityMethod` est nul, l'écran ne montre que ses tuiles. */
  abilityMethod: null,   // "roll" | "standard" | "manual"
  /* LOT PLATEAU (2026-08-15) — combien des dix jets sont DÉCOUVERTS. Il vit
     ici et pas dans `abilityRoll` parce qu'il survit à un lot rejeté : le
     plateau remet à zéro lui-même quand il balaie. */
  abilityRevele: 0,
  /* LOT 64 — B4.1/B4.2 : quel panneau d'Inheritance est ouvert. Fermé, on
     voit les deux dalles ; ouvert, l'AUTRE disparaît. */
  inheritanceOpen: null, // "boost" | "feat" | null
  /* LOT 66 — B8.1 : le filtre de la molette d'équipement, et la barre de
     recherche invoquée par la loupe. Deux états d'écran, hors document. */
  equipmentCategory: "all",
  equipmentSearch: false,
  rollingMethod: "fh3d6",// B5.2a — réglé à la molette, jeté au palier (B5.2d)
  destinyMode: "draw",   // "draw" (défaut, ADDENDUMS §4) ou "choice" — jamais écrit au document (fh.destiny.* est un namespace strict, mesuré)
  /* LOT 61 — QUATRE ÉTATS D'ÉCRAN POUR DESTINY, ET AUCUN N'EST DANS LE
     DOCUMENT : B6.2 dit « rien n'est acté tant que Valid n'est pas tapé ».
     Le tirage vit donc ici et meurt avec l'onglet — cohérent avec la
     décision du 2026-08-13, « seul le résultat compte, aucun historique ». */
  /* LOT 62 — LE POPUP (III.4, B7.7). Son état vit ICI et non dans le DOM :
     c'est la quatrième des cinq choses que `innerHTML = ""` détruisait, et
     SOCLE.md l'annonçait — « il vivra dans `state` comme le reste ». */
  popup: null,            // { texte } quand il est ouvert, sinon null
  destinyIntro: true,     // le petit texte de B6.1a, chassé par OK
  destinyDraw: null,      // la carte TIRÉE, pas encore actée
  destinyFace: "down",    // B6.1c — retournée ou non
  destinyRevealed: false, // B6.1d — le texte arrive UNE SECONDE après
  /* LOT 54 — Concept/Universe. `docWriters` = `createDocWriters({schema})`,
     construit UNE FOIS au boot (juste en dessous) : PUR, sans magasin ni bus
     (voir shell.mjs, imports, et universe-step.mjs en tête). `fieldErrors`
     et `pendingStack` sont de l'état d'ÉCRAN, comme `abilityRoll` —
     jamais écrits au document, perdus si l'onglet ferme. */
  docWriters: null,       // { rename, describe } une fois le schéma chargé, sinon null
  fieldErrors: {},        // le dernier refus de rename/describe, par champ ({name, gender, alignment, campaign})
  pendingStack: null,     // "srd" pendant qu'une confirmation de passage à SRD est en attente, sinon null
  /* LOT 58 — DEUX ÉTATS D'ÉCRAN DE PLUS, ET ILS VIVENT ICI POUR UNE RAISON
     (SOCLE.md, « qui possède quoi ») : hors du DOM, donc ils survivent à un
     remplacement de contenu par construction. C'était deux des cinq choses
     que `innerHTML = ""` détruisait.
     · `palier` — où en est `Validate` sur l'écran courant (I.4). Remis à 1
       à chaque changement d'étape, jamais deviné.
     · `cursor` — le cran d'aimantation de l'écran à CATALOGUE courant (Class
       ou Species : le même écran, `catalogue.mjs`). 🔴 ÉCRIT PAR LE
       SCROLLSPY, ET PAR LUI SEUL, et il ne déclenche AUCUN redessin
       (SOCLE.md, la troisième ligne des trois verbes). */
  palier: 1,
  cursor: 0
};
const app = document.getElementById("app");

/** Re-runs `rebuild` on the current document and refreshes `decisions`.
 *  The ONLY place that mutates `state.document`/`state.decisions` — every
 *  skill click goes through this, never touches the document by hand.
 *  LOT 39 — also runs `validate()` right after: the Skills step displays its
 *  refusals (§3d of its command), and `validate()` needs the freshly rebuilt
 *  document, not the one before the click.
 *  LOT 40 — also keeps the WHOLE rebuild() output as `state.report`: the
 *  Review step passes it straight to `render()`, unread and unrecomputed. */
function rebuild() {
  const verbs = state.engine.build.verbs;
  const avant = state.violations.map((v) => v.key + (v.path || "")).join("|");
  const out = verbs.rebuild({ document: state.document });
  state.document = out.document;
  state.decisions = out.decisions || [];
  state.resolved = out.resolved;
  state.report = out;
  state.violations = verbs.validate({ document: state.document }).violations || [];
  /* ══ B7.7c — LE POPUP « SE RÉVEILLE À CHAQUE ÉCART » ═══════════════════
     « Chaque fois que le joueur tente quelque chose que les règles
     refusent. » Le moteur sait déjà quand il y a écart : `validate()` publie
     ses refus en `{key, params, path}`. Le popup a donc une SOURCE, il n'a
     pas à deviner.
     ⚠️ On compare aux refus D'AVANT : un refus qui PERSISTE n'est pas un
     écart neuf. Sans ça, le popup se rouvrirait à chaque clic tant que le
     pool reste dépassé — impossible à refermer, donc insupportable. */
  const apres = state.violations.map((v) => v.key + (v.path || "")).join("|");
  if (apres && apres !== avant) {
    const mot = motDeRefus();
    if (mot) state.popup = { texte: mot };
  }
}

/** Le MOT d'un refus appartient à l'écran (chacun a son vocabulaire) — la
 *  coquille ne fait que demander. Un écran qui n'en fournit pas n'ouvre
 *  simplement pas de popup : mieux vaut aucun mot qu'une clef machine. */
function motDeRefus() {
  const v = state.violations[state.violations.length - 1];
  if (!v) return null;
  if (surCompetences()) return skillsRefusalWord(v);
  return null;
}

/** `true` si CE personnage porte au moins un choix Fate's Hand nommable
 *  (`fhRefChoices`, `universe-step.mjs`) — la seule question qu'il faut
 *  trancher AVANT de savoir si passer à SRD mérite une confirmation. */
function fhRefChoicesPresent(document) {
  return fhRefChoices(document, state.engine.layers.verbs.query).length > 0;
}

/** LOT 54, §2b — CHANGE DE PILE, EN DEUX GESTES QUI VONT ENSEMBLE :
 *  1. `layers.enable`/`disable` sur les quatre couches FH — c'est CE QUE
 *     `build.verbs.rebuild` LIT (`dispatch("layers.stack")`, filtré sur
 *     `enabled`), jamais `document.build.layers` en amont.
 *  2. `document.build.layers = []` : `src/build/block.mjs` documente noir
 *     sur blanc qu'un `build.layers` VIDE fait ADOPTER la pile montée SANS
 *     RIEN ÉCRASER (« un document dont build.layers est VIDE n'a jamais
 *     été construit ») — c'est la porte que ce lot emploie pour BASCULER
 *     une pile déjà déclarée, pas seulement pour en adopter une la
 *     première fois. Aucun verbe `build`/`doc` ne pose ce champ
 *     directement : `build.layers` est STRUCTUREL (le schéma dit « l'ordre
 *     est la pile »), pas un point de décision de `build.choices`. */
/* 🔴 LOT 77 — ON DÉMONTE UNE PILE PAR LE HAUT, ON LA MONTE PAR LE BAS, et
   ce n'est pas une élégance : c'est une MESURE. `fh-fiche-en` patche les
   trois espèces que `fh-species-en` AJOUTE (araag, elestu, loroka). Éteindre
   dans l'ordre de la liste éteignait `fh-species-en` d'abord, et la pile
   jetait aussitôt — « la couche fh-fiche-en patche species fh:species:en:
   araag, qui n'est dans aucune couche sous elle » (§L7.2, et le refus a
   raison). Passer de « SRD + FH » à « SRD » plantait donc l'écran Universe.
   ⛔ Ne remets pas les deux boucles dans le même sens : à l'allumage, une
   couche haute posée avant sa base jetterait par l'autre bout. */
function applyLayerStack(value) {
  const layersVerbs = state.engine.layers.verbs;
  if (value === "srdfh") for (const id of FH_LAYER_IDS) layersVerbs.enable({ id });
  else for (const id of [...FH_LAYER_IDS].reverse()) layersVerbs.disable({ id });
  state.document = { ...state.document, build: { ...state.document.build, layers: [] } };
  rebuild();
}

/* ══ LOT 67 — LES TROIS PORTES DE REVIEW ═════════════════════════════════
   B9.4 et B9.5. Elles sortent des octets ; elles ne redessinent rien.

   ⚠️ LA COQUILLE EST CHERCHÉE PAR `fetch`, ET ÇA MARCHE EXACTEMENT QUAND LE
   BUILDER MARCHE. `fiche.shell.html` prévient qu'un `fetch` échoue en
   `file://` — mais cette page-ci est en modules ESM, que `file://` refuse
   AUSSI. Il n'existe donc aucun cas où le builder tourne et où la coquille
   serait hors de portée. Elle est lue UNE fois et gardée : deux exports
   d'affilée ne font pas deux allers-retours. */
let coquilleCache = null;
async function coquille() {
  if (coquilleCache === null) {
    /* ⚠️ La query se colle au CHEMIN, pas à la base : `new URL(relatif, base)`
       JETTE la query de la base (mesuré lot 75) — `import.meta.url` seul ne
       suffit donc pas à transmettre `?v=<N>`. */
    const reponse = await fetch(new URL(`../../src/tools/fiche.shell.html${versionQuery(import.meta.url)}`, import.meta.url));
    if (!reponse.ok) throw new Error(`${reponse.status} ${reponse.statusText}`);
    coquilleCache = await reponse.text();
  }
  return coquilleCache;
}

/** Le refus, DIT. ⛔ Jamais un `console.error` : le joueur ne lit pas la
 *  console, et un bouton qui ne fait rien en silence est le faux magasin que
 *  le mandat interdit. */
function porteEnPanne(quoi, cause) {
  state.popup = { titre: quoi, texte: `This did not work: ${cause}\n\nNothing was written, and your character is untouched.` };
  refresh();
}

function exporterJson() {
  if (!state.document) return porteEnPanne("Export JSON", "the engine has not finished loading.");
  try {
    telecharger({
      nom: nomDeFichier(state.document, "fh-char.json"),
      type: "application/json",
      /* ⭐ LES OCTETS DU MOTEUR, PAS UN `JSON.stringify` D'ÉCRAN : c'est la
         MÊME fonction que `toBytes` appelle (`canonical.mjs`, lot 67). Le
         fichier exporté est donc byte-identique à celui que le bloc `doc`
         écrirait — ce qui est la thèse du produit (« le joueur se balade
         partout avec ses persos »), pas un détail. */
      contenu: canonicalText(state.document)
    });
  } catch (cause) {
    porteEnPanne("Export JSON", cause.message);
  }
}

/** `Export HTML` et `Expert view` — LA MÊME PAGE, deux sorties. Une seule
 *  fonction : deux chemins qui rendent « la même page » divergeraient. */
function exporterFiche(sortie) {
  const quoi = sortie === "tab" ? "Expert view" : "Export HTML";
  if (!state.document || !state.report) return porteEnPanne(quoi, "the engine has not finished loading.");
  coquille().then((html) => {
    /* La LANGUE vient du document (`lang` est un champ racine REQUIS de
       `fh-char/1`, lot 54) — jamais de l'écran, dont les mots sont en
       anglais par arbitrage et ne disent rien du personnage. */
    const page = injecte(html, renderFiche(state.document, state.report, state.document.lang));
    const fichier = { nom: nomDeFichier(state.document, "fiche.html"), type: "text/html;charset=utf-8", contenu: page };
    if (sortie === "download") return telecharger(fichier);
    if (!ouvrirOnglet(fichier)) {
      porteEnPanne(quoi, "your browser blocked the new tab. Use Export HTML instead — the file is the same page.");
    }
    return undefined;
  }).catch((cause) => porteEnPanne(quoi, cause.message));
}

function applyDecisionAction(action) {
  /* LOT 54 — CONCEPT : `rename` écrit `document.name` par l'écrivain PUR
     (`state.docWriters.rename`, `src/doc/writers.mjs`), jamais par
     `build.set` (`name` n'est pas un point de décision — voir la tête de
     `store.mjs`, lot 47). AUCUN `rebuild()` : `derive.mjs` ne lit ni `name`
     ni `gender`/`alignment`/`campaign` (mesuré — zéro occurrence dans
     `src/build/derive.mjs`), donc rien de dérivable n'a changé, même
     patron que `roll`/`destinyMode` plus bas. Un refus (nom vide, plus de
     200 caractères) NE TOUCHE PAS `state.document` — il se pose dans
     `state.fieldErrors`, affiché par `concept-step.mjs`, jamais un silence
     ni une valeur à moitié écrite. */
  if (action.kind === "rename") {
    try {
      state.document = state.docWriters.rename({ document: state.document, name: action.name });
      state.fieldErrors = { ...state.fieldErrors, name: null };
    } catch (error) {
      state.fieldErrors = { ...state.fieldErrors, name: error.message };
    }
    refresh();
    return;
  }
  /* LOT 54 — CONCEPT (genre, alignement) ET UNIVERSE (campagne) : les trois
     champs facultatifs de `describableFields(schema)`, un à la fois
     (`action.field` ∈ {gender, alignment, campaign}). Même discipline que
     `rename` juste au-dessus : aucun `rebuild()`, un refus reste dans
     `state.fieldErrors` sans toucher `state.document`. */
  if (action.kind === "describe") {
    try {
      state.document = state.docWriters.describe({ document: state.document, [action.field]: action.value });
      state.fieldErrors = { ...state.fieldErrors, [action.field]: null };
    } catch (error) {
      state.fieldErrors = { ...state.fieldErrors, [action.field]: error.message };
    }
    refresh();
    return;
  }
  /* LOT 54 — UNIVERSE, LA PILE DE RÈGLES (§2b de la commande). Un clic sur
     un des deux boutons DEMANDE d'abord (`requestLayerStack`) : si aucun
     choix Fate's Hand n'est en jeu (mesuré dans `universe-step.mjs`,
     `fhRefChoices`), ou si la cible est « SRD + FH » (toujours sûr —
     n'ENLÈVE jamais de couche), le changement s'applique tout de suite.
     Sinon `state.pendingStack` s'ouvre et `universe-step.mjs` affiche la
     confirmation (`confirm.mjs`, même composant que Class au lot 46) —
     `confirmLayerStack`/`cancelLayerStack` la referment. */
  if (action.kind === "requestLayerStack") {
    if (currentStack(state.document) === action.value) { refresh(); return; } // déjà cette pile : rien à faire
    const needsConfirm = action.value === "srd" && fhRefChoicesPresent(state.document);
    if (needsConfirm) {
      state.pendingStack = "srd";
      refresh();
      return;
    }
    applyLayerStack(action.value);
    refresh();
    return;
  }
  if (action.kind === "confirmLayerStack") {
    applyLayerStack("srd");
    state.pendingStack = null;
    refresh();
    return;
  }
  if (action.kind === "cancelLayerStack") {
    /* Annuler NE TOUCHE RIEN — même loi que Class (lot 46, `confirm.mjs`
       en tête) : aucun verbe, aucune mutation du document ni de la pile
       montée dans `layers`. */
    state.pendingStack = null;
    refresh();
    return;
  }
  /* LOT 45 — DEUX GESTES QUI NE TOUCHENT JAMAIS LE DOCUMENT, traités ICI et
     RENDUS AVANT tout appel de verbe : `roll` régénère le lot de dix dés
     (`state.abilityRoll`), `destinyMode` bascule l'onglet Destinée
     (`state.destinyMode`) — ni l'un ni l'autre n'est un choix `fh-char/1`
     (voir l'en-tête de `abilities-step.mjs`/`destiny-step.mjs`). Aucun
     `rebuild()` : rien dans le document n'a changé. */
  /* ══ LOT 63 — LES TROIS GESTES DE B5, AUCUN NE TOUCHE LE DOCUMENT ═════ */
  /* ══ LOT 64 — OUVRIR ET FERMER UN PANNEAU D'INHERITANCE (B4.1/B4.2) ═══
     ⭐ L'ORDRE EST LIBRE (Eric, B4.1c) : rien ici n'impose de commencer par
     l'un ou par l'autre. */
  if (action.kind === "inheritanceOpen") {
    state.inheritanceOpen = action.value;
    if (action.value === "feat") state.cursor = inheritanceFeatCursor();
    openSurface();
    return;
  }
  if (action.kind === "abilityMethod") {
    state.abilityMethod = action.value;
    /* ⚠️ `abilities.mode` RESTE ÉCRIT AU DOCUMENT, comme au lot 45. Aucune
       règle ne le consomme (Review le classe dans « player choices no rule
       consumed »), mais c'est un champ du schéma que le joueur a rempli :
       cesser de l'écrire serait perdre une intention en silence. */
    state.document = state.engine.build.verbs
      .set({ document: state.document, path: "abilities.mode", value: action.value }).document;
    rebuild();
    /* `Standard array` n'a pas de dés : son lot est posé d'emblée, et il
       passe par la MÊME machinerie d'affectation (B5.7). */
    state.abilityRoll = action.value === "standard" ? standardArrayBatch() : null;
    openSurface();
    return;
  }
  if (action.kind === "rollingMethod") {
    /* ⛔ TOURNER LA MOLETTE NE JETTE RIEN (B5.2d, motif d'Eric : « pour
       éviter de faire ramer le mobile »). */
    state.rollingMethod = action.value;
    refresh();
    return;
  }
  /* ⛔ `rollBatch` A ÉTÉ RETIRÉ ICI, ET C'EST LE CŒUR DU LOT DU PLATEAU.
     Cette action était le palier de `Validate` qui JETAIT. Le plateau jette
     aussi — deux propriétaires du même lot, et quatre branchements s'y sont
     cassés. Le palier a cessé de tirer (voir `abilitiesValidate`) ; il ne
     reste qu'un seul jeteur, celui que le joueur presse. */
  /* ══ LES DEUX ACTIONS DU PLATEAU — ⛔ AUCUNE NE REDESSINE ══════════════
     Un `refresh()` remplace tout le contenu de la scène (`swapContent`) : les
     trois canvas WebGL mourraient en pleine animation, à chaque jet. Le
     plateau écrit donc dans des nœuds qui existent déjà, et ces deux actions
     ne font que RANGER ce qu'il a produit. C'est la troisième règle du socle,
     la même qui interdit au scrollspy de redessiner. */
  if (action.kind === "abilityLot") {
    state.abilityRoll = { ...action.lot, assign: emptyAbilityAssign() };
    /* ⭐ LA SEULE EXCEPTION, ET ELLE EST MESURÉE. Sans ce `refresh()`, l'écran
       est une IMPASSE : vérifié au navigateur, `flash roll` remplissait bien
       les dix cases et marquait les six gardés — et les six lignes
       d'affectation restaient à ZÉRO. Le joueur jetait, puis n'avait nulle
       part où poser ses dés.

       ⛔ LA RÈGLE « LE PLATEAU NE REDESSINE JAMAIS » N'EST PAS VIOLÉE : elle
       protège les canvas WebGL d'un remplacement EN PLEINE ANIMATION.
       `onNouveauLot` ne part qu'une fois le lot COMPLET — après la pause de
       2 500 ms du dixième jet, donc après que `settleSizePx` a figé chaque dé
       en image ET libéré son contexte. C'est le seul instant de la séquence
       où il n'y a rien à casser. `abilityRevele`, lui, part à CHAQUE jet : il
       ne redessine toujours pas.

       ⚠️ CE QUE ÇA COÛTE, ET QU'ERIC DOIT TRANCHER : le redessin vide le
       plateau, parce qu'un dé ne naît que d'un GESTE. Le joueur garde ses dix
       totaux et ses six gardés, mais les trois dés s'effacent. Le croquis B
       les montre posés. La reprise appartient au lot des 4 dalles. */
    refresh();
    return;
  }
  if (action.kind === "abilityRevele") {
    state.abilityRevele = action.valeur;
    return;                       // ⛔ pas de refresh non plus
  }
  if (action.kind === "abilityClear") {
    /* CLEAR « même en plein milieu » (Eric, 2026-08-15) : le lot ET son
       assignation partent. Ici on REDESSINE, parce que les six
       caractéristiques doivent se vider avec lui. */
    state.abilityRoll = null;
    state.abilityRevele = 0;
    openSurface();
    return;
  }
  if (action.kind === "roll") {
    /* LOT 50, §2b — un nouveau lot (premier tirage OU relance) remet TOUTE
       la carte d'assignation à `null` : relancer invalide l'assignation
       précédente, `rerollCount` (dans `rollAbilitySet`) dit déjà au joueur
       quand ça arrive. `emptyAbilityAssign()` vient d'`abilities-step.mjs`
       — jamais une seconde liste de six clefs recopiée ici.

       🔴 ET IL LIT MAINTENANT LA MOLETTE. Ce bouton `Roll` n'appartient plus
       qu'à `4d6` : FH 3d6 a son plateau, qui produit son lot lui-même. Il
       tirait pourtant `rollAbilitySet` — du **3d6** — quelle que soit la
       molette. Le défaut ne se voyait pas tant que le palier `rollBatch`
       (lui, method-aware) faisait le premier jet ; en le retirant, ce bouton
       devient le SEUL chemin de `4d6`, et il aurait servi du 3d6 en silence.
       📌 La forme du piège : un défaut couvert par un chemin qu'on supprime. */
    state.abilityRoll = { ...rollAbilityBatch(state.rollingMethod, Math.random), assign: emptyAbilityAssign() };
    refresh();
    return;
  }
  if (action.kind === "assignAbilityRoll") {
    /* LOT 50, §2a, ÉTENDU AU LOT 51 (§1b/§1d) — DEUX gestes qui ne touchent
       jamais le même endroit, traités ICI et RENDUS AVANT tout appel de
       verbe, même patron que `roll`/`destinyMode` juste au-dessus :
       1. la carte `state.abilityRoll.assign` reçoit l'INDEX du dé — hors
          document, elle meurt avec le lot (§2a, non négociable) ;
       2. le document reçoit la VALEUR, par le verbe `set` ORDINAIRE — même
          chemin que la saisie manuelle (`abilities.<key>`).
       Si `state.abilityRoll` est vide (aucun tirage), il n'y a rien à
       cartographier : seule la valeur est posée — ne devrait pas arriver
       (aucune option n'existe sans lot, voir `optionsForRow`), mais un
       geste qui ne peut QUE poser un score reste toujours correct.

       ⭐ LOT 51, §1b — LE dé cliqué peut déjà être tenu par une AUTRE clef
       (`abilities-step.mjs` offre maintenant les SIX dés à chaque rangée,
       voir son en-tête). `holderKey` la retrouve dans `assign` (jamais
       recalculée : c'est la SEULE carte qui sait « qui tient quoi »).
       Si elle existe, c'est un ÉCHANGE : `holderKey` reprend l'index que
       `action.key` tenait AVANT ce clic (`prevIndex`, `null` si `action.key`
       n'avait encore rien reçu — §1b, le cas limite d'une rangée non
       servie qui échange quand même). §1d — le document ne gagne toujours
       AUCUN champ : au plus DEUX `set`, jamais un troisième chemin. Le
       second `set` (celui de `holderKey`) ne part QUE si `prevIndex` désigne
       un vrai dé — sinon `holderKey` n'a RIEN à recevoir en retour (`action.key`
       ne lui cède qu'un `null`), et sa ligne redevient simplement « pas de ce
       tirage », sur la valeur qu'elle portait déjà (jamais effacée, jamais
       reposée pour rien : un `set` qui écrirait la même valeur ne prouverait
       rien de plus, voir INVENTAIRE-LOT-51.md pour la mesure de ce choix). */
    const verbs = state.engine.build.verbs;
    let document = state.document;
    if (state.abilityRoll) {
      const assign = state.abilityRoll.assign || {};
      const prevIndex = assign[action.key] ?? null;
      let holderKey = null;
      for (const [otherKey, otherIndex] of Object.entries(assign)) {
        if (otherKey !== action.key && otherIndex === action.rollIndex) { holderKey = otherKey; break; }
      }
      const newAssign = { ...assign, [action.key]: action.rollIndex };
      if (holderKey) newAssign[holderKey] = prevIndex; // §1b — l'échange : jamais deux clefs sur le même index

      document = verbs.set({ document, path: `abilities.${action.key}`, value: action.value }).document;
      if (holderKey && prevIndex !== null) {
        const prevDie = (state.abilityRoll.rolls || []).find((roll) => roll.index === prevIndex);
        if (prevDie) {
          document = verbs.set({ document, path: `abilities.${holderKey}`, value: prevDie.total }).document;
        }
      }
      state.abilityRoll = { ...state.abilityRoll, assign: newAssign };
    } else {
      document = verbs.set({ document, path: `abilities.${action.key}`, value: action.value }).document;
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  if (action.kind === "destinyMode") {
    state.destinyMode = action.value;
    if (action.value === "choice") state.cursor = destinyCursorDepart();
    refresh();
    return;
  }
  /* ══ LOT 61 — LES TROIS GESTES DE DESTINY, ET AUCUN NE TOUCHE LE DOCUMENT
     (B6.2). Même patron que `roll`/`destinyMode` : traités ICI, rendus AVANT
     tout appel de verbe. */
  /* LOT 62 — DEUX GESTES DE POPUP, ET AUCUN NE TOUCHE LE DOCUMENT (III.4). */
  /* Le raccourci de la molette de catégories (B7.1) : il AMÈNE la section
     dans le champ, il ne filtre rien — les six sont rendues ensemble. Aucun
     redessin : c'est un déplacement, pas un changement d'état. */
  if (action.kind === "snapTo") {
    const cibles = frame.stage.querySelectorAll("[data-snap]");
    if (cibles[action.index]) keepInView(frame.stage, cibles[action.index], "y-start");
    return;
  }
  /* ⭐ CH4 — LE RAIL SE TAPE COMME LA CEINTURE (Eric, 2026-08-15 : « ce serait
     bien de reporter ce fonctionnement aux classes et species »). Il n'y a
     RIEN de plus à écrire ici : un cran de rail émet le `snapTo` ci-dessus, le
     même que la molette de Compétences. Aucune action propre au rail n'existe,
     et c'est le fond de l'affaire — taper un cran DÉPLACE LE CHAMP, il ne
     choisit pas. Le record reste acté par le cran d'aimantation, donc par le
     spy (II.3), donc par le défilement (II.1). */
  /* ══ CH6 — `CHOOSE` EST LA VALIDATION DES DEUX ÉCRANS À FICHE ═══════════
     L'arbitrage qu'Eric a délégué (« CHOOSE et Validate ouvrent la même
     porte — lequel reste ? ») : CHOOSE reste, `Validate` disparaît de ces
     écrans-là (voir `renderValidation`, et le pied de `catalogue.mjs` pour
     les trois raisons).
     ⭐ LE CURSEUR EST POSÉ AVANT LA PORTE, et c'est le geste qui compte : le
     bouton pressé APPARTIENT à une fiche, et cette fiche-là connaît son
     index. Lire le curseur du spy à la place marcherait presque toujours —
     « presque » étant l'instant où le spy n'a pas relu (un volet masqué gèle
     `requestAnimationFrame`). Le doigt tranche, jamais l'observateur.
     ⛔ Aucun appel de verbe ici : `pressValidate` possède l'enchaînement des
     paliers (I.4) et c'est LUI qui choisit — dupliquer sa logique donnerait
     deux propriétaires de la même porte, la faute que `rollBatch` a payée. */
  if (action.kind === "ficheChoose") {
    state.cursor = action.index;
    pressValidate();
    return;
  }
  /* B9 — une ligne de Review mène à son écran. Voir qu'il manque quelque
     chose sans pouvoir y aller ferait de Review un constat, pas un
     récapitulatif. */
  if (action.kind === "equipmentCategory") { state.equipmentCategory = action.value; refresh(); return; }
  if (action.kind === "equipmentSearch") { state.equipmentSearch = !state.equipmentSearch; refresh(); return; }
  if (action.kind === "goToStepId") {
    goToStep(STEPS.findIndex((step) => step.id === action.value));
    return;
  }
  if (action.kind === "popup") {
    state.popup = action.texte ? { texte: action.texte, titre: action.titre || null } : null;
    refresh();
    return;
  }
  /* ══ LOT 67 — LES TROIS PORTES DE REVIEW (B9.4, B9.5) ═══════════════════
     Aucune ne touche le document, aucune ne redessine : elles SORTENT des
     octets. Le seul retour à l'écran est un popup, et seulement quand ça
     rate — un bouton qui échoue en silence est un faux magasin. */
  if (action.kind === "exportJson") { exporterJson(); return; }
  if (action.kind === "exportHtml") { exporterFiche("download"); return; }
  if (action.kind === "expertView") { exporterFiche("tab"); return; }
  if (action.kind === "destinyIntroDone") {
    state.destinyIntro = false;
    if (!state.destinyDraw) tirerUneCarte();
    openSurface();
    return;
  }
  if (action.kind === "destinyDraw") {
    /* `Draw again` est ILLIMITÉ (Eric, B6.2). La carte repart DE DOS : le
       geste de retournement est ce qui fait l'écran, le sauter le viderait. */
    tirerUneCarte();
    openSurface();
    return;
  }
  if (action.kind === "destinyFlip") {
    state.destinyFace = "up";
    refresh();
    /* B6.1d — « le texte apparaît UNE SECONDE APRÈS le retournement ».
       ⚠️ Ce minuteur ne retient AUCUN nœud : il n'écrit que `state` et
       rappelle `refresh()`. Un remplacement de contenu entre-temps ne le
       casse donc pas — c'est la règle du socle (SOCLE.md, « ce qui doit
       survivre »). */
    if (destinyTimer !== null) clearTimeout(destinyTimer);
    destinyTimer = setTimeout(() => {
      destinyTimer = null;
      state.destinyRevealed = true;
      refresh();
    }, DESTINY_REVEAL_MS);
    return;
  }
  const verbs = state.engine.build.verbs;
  /* Chaque verbe REND `{document}` — il ne mute pas en place (contracts/
     build.md). C'est ce document-là qui doit passer à `rebuild`, jamais
     celui d'avant. */
  if (action.kind === "resetSkills") {
    /* LOT 39, décision n°2 — *Reset* ne rend que les points DÉPENSÉS : une
       suite de `clear` sur le MÊME document, un seul `rebuild` à la fin.
       `clear` sur un chemin jamais posé n'est pas une faute (`build.mjs`),
       donc balayer les 62 chemins possibles ne coûte rien de plus qu'un
       clear unique. */
    let document = state.document;
    for (const path of action.paths) {
      document = verbs.clear({ document, path, kind: "choice" }).document;
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  /* LOT 49 — poser une LIGNE D'ÉQUIPEMENT, trois chemins d'un coup
     (`gear[N]`, `.quantity`, `.equipped` — §0.2 de sa commande : les trois
     vont ensemble, sinon `derive.mjs` déclare la ligne incomplète et la
     saute). Même patron que `resetSkills` juste au-dessus : une suite de
     verbes sur le MÊME document, un seul `rebuild` à la fin. L'INDEX est
     calculé ICI par `nextGearIndex` (importée d'`equipment-step.mjs`, jamais
     une seconde copie) — du bookkeeping d'écran pur (où placer le prochain
     élément d'un tableau), aucune règle de jeu. */
  if (action.kind === "addGearLine") {
    const index = nextGearIndex(state.document);
    let document = state.document;
    document = verbs.choose({ document, path: `gear[${index}]`, ref: action.ref }).document;
    document = verbs.set({ document, path: `gear[${index}].quantity`, value: action.quantity }).document;
    document = verbs.set({ document, path: `gear[${index}].equipped`, value: action.equipped }).document;
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  /* Symétrique — MESURÉ sûr (INVENTAIRE-LOT-49.md, commande §3 test 7) :
     `clear` sur `gear[N]` ne fait PAS jeter `rebuild`, contrairement aux six
     caractéristiques (lot 45, `abilities.*`). Les trois chemins partent
     ensemble pour ne laisser aucune entrée orpheline dans `build.choices`
     (le `gear[N].quantity` qui resterait sans son `gear[N]`, mesuré dans
     `tests/build-derive.test.mjs`, « SRD PUR »). */
  if (action.kind === "removeGearLine") {
    let document = state.document;
    for (const suffix of ["", ".quantity", ".equipped"]) {
      document = verbs.clear({ document, path: `gear[${action.index}]${suffix}`, kind: "choice" }).document;
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  /* Les 50 PO ADDENDUMS §4 (commande §1b/§1c) — posées par l'écran, jamais
     par le moteur. POSE LES QUATRE clefs (le piège de §0.2 : `gp` seul ne
     produit aucune bourse) et n'ÉCRASE JAMAIS ce qui est déjà là : chaque
     clef manquante part de 0, et seule `gp` reçoit le supplément (§0.1 — le
     paquet de classe garde SON propre or, les deux s'additionnent, jamais
     de collision). `INHERITED_PURSE_GP`/`currentCurrency` viennent
     d'`equipment-step.mjs` — même carte que le rendu, jamais une seconde
     copie du nombre. */
  if (action.kind === "addInheritedPurse") {
    const current = currentCurrency(state.document);
    let document = state.document;
    for (const key of CURRENCY_KEYS) {
      const base = Number.isInteger(current[key]) ? current[key] : 0;
      const value = key === "gp" ? base + INHERITED_PURSE_GP : base;
      document = verbs.set({ document, path: `currency.${key}`, value }).document;
    }
    state.document = document;
    rebuild();
    refresh();
    return;
  }
  /* LOT 42, §0.3 — MESURÉ : cette fonction ne savait poser que `set`/`clear`,
     jamais un RECORD. Class et Species posent leur choix avec `choose`
     (`{path, ref:{kind, id}}`, `src/build/block.mjs`) — même forme que les
     deux autres : le verbe rend `{document}`, c'est CE document qui repart
     au `rebuild`, jamais l'ancien (test 6 de la commande). */
  const out = action.kind === "choose"
    ? verbs.choose({ document: state.document, path: action.path, ref: action.ref })
    : action.kind === "set"
      ? verbs.set({ document: state.document, path: action.path, value: action.value })
      : verbs.clear({ document: state.document, path: action.path, kind: "choice" });
  state.document = out.document;
  rebuild();
  refresh();
}

/* ══ DESTINY — le tirage, et le délai théâtral ═══════════════════════════
   ⚠️ ERIC A RÉVISÉ SA PROPRE SPEC LE 2026-08-15. B6.1d disait « le texte
   apparaît UNE SECONDE APRÈS le retournement » ; à l'usage, il a mesuré
   l'inverse de ce qu'il voulait :

     *« On doit avoir le temps de la voir entière avant qu'elle rapetisse. »*

   Le chiffre expliquait pourquoi. Le retournement dure **0,45 s** (`.card-face`,
   `transition: transform .45s`) et le texte arrivait à 1 s : il restait
   **550 ms** de carte entière. Et à cet instant `.card-face { flex: 0 1 auto }`
   la fait rétrécir **d'un coup** — la transition du CSS porte sur `transform`,
   pas sur la taille.

   **Sa réponse : 3 secondes.** Le rétrécissement reste brutal ; c'est le délai
   qu'il a choisi de corriger, pas la transition — l'option lui a été posée. */
export const DESTINY_REVEAL_MS = 3000; // B6.1d RÉVISÉ par Eric, 2026-08-15
let destinyTimer = null;

/* ══ COMPÉTENCES — un `ctx` composé UNE FOIS pour le contenu ET la barre
   fixe : les deux doivent lire le même pool, sinon la barre afficherait un
   compte que la grille contredit. */
function skillsCtx() {
  return {
    resolved: state.resolved, decisions: state.decisions, violations: state.violations,
    query: state.engine.layers.verbs.query, cursor: state.cursor
  };
}
function equipmentCtx() {
  return {
    document: state.document, resolved: state.resolved, query: state.engine.layers.verbs.query,
    category: state.equipmentCategory, search: state.equipmentSearch
  };
}
function surCompetences() {
  return Boolean(state.engine) && STEPS[state.step].id === "skills";
}

/** Le catalogue du don d'origine s'ouvre devant celui qui est déjà posé —
 *  même loi que Class, Species et Destiny. */
function inheritanceFeatCursor() {
  return catalogueCursor(state.decisions, "background.originFeat[0]");
}

function arcanaCatalog() {
  return state.engine ? (state.engine.layers.verbs.query({ kind: "arcana" }) || []) : [];
}
/** Tire une carte AU HASARD et la pose de dos. ⛔ Aucun verbe, aucun
 *  document : B6.2. `drawArcana` vient de `dice.mjs`, la même source d'aléa
 *  que le reste du builder. */
function tirerUneCarte() {
  const carte = drawArcana(arcanaCatalog(), Math.random);
  state.destinyDraw = carte ? carte.id : null;
  state.destinyFace = "down";
  state.destinyRevealed = false;
}
/** En mode « Choose yourself », le catalogue s'ouvre devant la carte déjà
 *  actée s'il y en a une — même loi que Class et Species. */
function destinyCursorDepart() {
  const options = arcanaCatalog().map((v) => v.id);
  const pose = currentArcanaId(state.document);
  const i = options.indexOf(pose);
  return i >= 0 ? i : 0;
}

/* ══ LES DEUX ÉCRANS À CATALOGUE (B2 et B3) ══════════════════════════════
   Eric : « l'étape 3 va être identique à la 2 ». Cette table est la SEULE
   chose qui les distingue dans la coquille — le reste (fiches aimantées,
   rail, paliers) vit dans `catalogue.mjs`, écrit une fois. Ajouter un
   troisième écran à catalogue serait une ligne de plus ici. */
const CATALOGUES = {
  class: { ...CLASS_CATALOGUE, cardBody: renderClassCardBody, choices: renderClassChoices, palier2: classPalier2 },
  species: { ...SPECIES_CATALOGUE, cardBody: renderSpeciesCardBody, choices: renderSpeciesChoices, palier2: speciesPalier2 },
  /* Destiny n'a qu'UN palier : `palier2` rend `null`, donc `Validate` acte la
     carte et passe à l'étape suivante (voir `pressValidate`). */
  /* Le don d'origine : UN palier (B4.4 — « une seule validation suffit »),
     donc `palier2` rend `null` et `Validate` ferme le panneau. */
  feat: {
    path: "background.originFeat[0]", kind: "feat", label: "Origin feats",
    cardBody: renderFeatCardBody, choices: () => el("div", "catalogue-choices"), palier2: () => null
  },
  destiny: {
    path: "fh.destiny.arcana", kind: "arcana", label: "Major Arcana",
    cardBody: renderArcanaCardBody, choices: () => el("div", "catalogue-choices"), palier2: () => null
  }
};
function catalogueCourant() {
  if (!state.engine) return null;
  /* ⭐ B6.1g — « Choose yourself fait défiler les cartes comme B2/B3 ». Le
     mode « choice » de Destiny EST donc un catalogue, et il passe par le
     module partagé : le garde du lot 60 interdit d'en écrire un second, et
     c'est exactement ce qu'il doit faire ici.
     ⚠️ Une seule différence, mesurée au lot 45 : Destiny n'a AUCUN plan dans
     `decisions[]`, ses 22 options viennent donc du catalogue de couches
     (`ctx.options`, voir `catalogueOptions`). */
  if (STEPS[state.step].id === "destiny") {
    return state.destinyMode === "choice" ? CATALOGUES.destiny : null;
  }
  /* B4.4, étape 4 — le don d'origine « se choisit EXACTEMENT comme Class et
     Species : défilement aimanté + scrollspy ». C'est donc le catalogue
     partagé, et pas une troisième copie. */
  if (STEPS[state.step].id === "background") {
    return state.inheritanceOpen === "feat" ? CATALOGUES.feat : null;
  }
  return CATALOGUES[STEPS[state.step].id] || null;
}
/** Le `ctx` que les deux écrans et le catalogue partagent — composé ICI pour
 *  qu'aucun appelant n'en oublie un morceau. */
function catalogueCtx(cfg) {
  return {
    decisions: state.decisions, query: state.engine.layers.verbs.query,
    path: cfg.path, kind: cfg.kind, label: cfg.label,
    /* Le drapeau des écrans À FICHE, déclaré par `class-step`/`species-step`.
       Il commande deux choses : le `Validate` générique qui s'efface (Ch6) et
       l'enveloppe de rangée des dalles (`renderCatalogueCards`, 16/08). */
    fiche: Boolean(cfg.fiche),
    palier: state.palier, cursor: state.cursor,
    /* Seul Destiny en fournit — les autres lisent leur plan (voir
       `catalogueOptions`, la porte étroite). */
    options: cfg.kind === "arcana" ? arcanaCatalog().map((v) => v.id) : undefined
  };
}

/* ⚠️ LOT 38 : plus de "720" ici. Un `@media` CSS ne peut pas exposer sa
   propre valeur à `var()` — c'est une limite native, pas un choix — donc le
   seuil ne peut vivre qu'à UN endroit : le `@media (max-width: 720px)` de
   `shell.css`, qui pose le drapeau `--bp-hint` ("wide"/"narrow") sur
   `:root`. Cette fonction lit le drapeau, jamais le nombre — voir
   `tokens.css` et INVENTAIRE-LOT-38.md pour la mesure qui a fait diverger
   ce lot de la piste `--bp-mid` suggérée par la commande. */
function isMobile() {
  const hint = getComputedStyle(document.documentElement).getPropertyValue("--bp-hint").trim();
  return hint === "narrow";
}

function el(tag, className, children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const child of children || []) node.append(child);
  return node;
}

function button(label, onClick, disabled) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.disabled = Boolean(disabled);
  b.addEventListener("click", onClick);
  return b;
}

/* ── LE CONTENU DE LA FICHE ───────────────────────────────────────────
   ⚠️ CE N'EST PLUS LA SCÈNE ENTIÈRE. Avant le lot 58, cette fonction
   rendait la ceinture, la barre du plan, la carte ET les boutons Back /
   Continue — tout, à chaque clic. Elle ne rend plus que le CONTENU de
   l'écran courant ; le cadre (molette, ligne de commande, chevrons) vit
   dans `mountFrame()` et ne se redessine jamais. */
function renderStepContent() {
  const step = STEPS[state.step];
  /* LOT 59 — `dalle-majeure` est POSÉE DANS LE DOM, pas seulement supposée
     par la feuille de style : le vocabulaire des trois dalles (III.2) doit
     se lire sur l'élément, sinon personne ne sait quel régime porte un
     écran. Majeure parce qu'un écran dense porte des libellés en
     `--text-muted` — voir la matrice en tête de `shell.css`. */
  const card = el("section", "decision-card dalle-majeure");
  /* ⭐ TROUVÉ EN REGARDANT LA PAGE, PAS EN LISANT UN TEST : la feuille de
     style du lot attendait `[data-bleed]` pour donner sa hauteur à la
     chaîne des fiches de classe, et personne ne l'écrivait — les 935 tests
     restaient verts pendant que les douze fiches faisaient 299 px au lieu
     de 680. « Une fiche par écran » (B2.1f) tombait, sans un mot.
     PLEIN CADRE veut dire : la carte cesse d'être une carte (ni marge, ni
     bordure, ni mesure de prose) et prête sa hauteur à ce qu'elle
     contient. Aujourd'hui, seul le palier 1 de Class en a besoin. */
  /* ⚠️ `catalogueCourant()`, PAS `CATALOGUES[step.id]` : Destiny est dans la
     table mais n'EST un catalogue qu'en mode « Choose yourself ». Mesuré au
     navigateur — la branche attrapait l'écran théâtral et n'affichait plus
     rien du tout. */
  /* ⭐ COMPÉTENCES EST EN PLEIN CADRE AUSSI, ET C'EST UNE MESURE : l'écran
     est composé de SES PROPRES dalles (une par catégorie, B7.3a), donc la
     carte-enveloppe n'ajoute qu'une marge et un remplissage. Mesuré au
     navigateur : la ligne ne faisait plus que 286 px de large sur 360, et il
     ne restait que 65 px au nom là où B7.5 en comptait 124. Trois
     remplissages emboîtés — marge de carte, remplissage de carte,
     remplissage de dalle — mangeaient 74 px. */
  card.dataset.bleed = String((Boolean(catalogueCourant()) && state.palier === 1) || step.id === "skills");
  /* ⛔ PLUS DE TITRE D'ÉCRAN. B7.3b, généralisé : « ne pas re-préciser le
     titre — le spy et le snap le rendent évident ». La molette du haut
     porte déjà le nom de l'étape, surligné (B0.5) ; le répéter en T6 sous
     une barre qui l'affiche déjà coûtait une ligne de hauteur sur dix
     écrans, à 360 px. */

  /* LOT 54 — Concept et Universe suivent le MÊME trio de branches que les
     autres étapes (moteur prêt / en échec / en charge), même si elles ne
     lisent pas `decisions[]` : elles ont besoin de `state.docWriters`
     (construit au même moment que `state.engine`, voir le bas de ce
     fichier), donc du même garde. */
  if (step.id === "concept" && state.engine) {
    card.append(renderConceptStep({
      document: state.document,
      writers: state.docWriters,
      fieldErrors: state.fieldErrors
    }, applyDecisionAction));
  } else if (step.id === "concept" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "concept") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "universe" && state.engine) {
    card.append(renderUniverseStep({
      document: state.document,
      query: state.engine.layers.verbs.query,
      fieldErrors: state.fieldErrors,
      pendingStack: state.pendingStack
    }, applyDecisionAction));
  } else if (step.id === "universe" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "universe") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  /* LOT 42 — Class et Species suivent EXACTEMENT le patron Compétences
     (lot 39) : même trio de branches (moteur prêt / en échec / en charge),
     même `ctx` (`resolved` en moins — ni l'un ni l'autre écran n'en a
     besoin, ils ne lisent que `decisions[]`), même verbe `applyDecisionAction`
     pour les trois. */
  } else if (catalogueCourant()) {
    /* ⭐ UNE SEULE BRANCHE POUR CLASS ET SPECIES (lot 60) : « B3 = B2 ». Les
       deux champs de plus que les autres écrans sont les deux états du
       §RENDU — le PALIER de `Validate` (I.4) et le CRAN d'aimantation que le
       scrollspy écrit (II.3). Ni l'un ni l'autre n'existe dans le document :
       ils vivent dans `state`, hors du DOM, donc ils survivent au
       remplacement du contenu. */
    const cfg = catalogueCourant();
    const ctx = catalogueCtx(cfg);
    const section = el("section", "catalogue-step");
    section.dataset.palier = String(state.palier === 2 ? 2 : 1);
    if (state.palier === 2) {
      section.append(cfg.choices(ctx, applyDecisionAction));
    } else {
      /* Le 3ᵉ argument est le destinataire du `CHOOSE` de chaque fiche (Ch6).
         Les catalogues sans pied (Destiny, don d'origine) ne s'en servent
         pas : `renderCatalogueCards` ne trouve aucun bouton à câbler. */
      const cards = renderCatalogueCards(ctx, cfg.cardBody, applyDecisionAction);
      if (cards) section.append(cards);
    }
    card.append(section);
  } else if ((step.id === "class" || step.id === "species") && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "class" || step.id === "species") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "background" && state.engine) {
    /* LOT 46 — même trio de branches que Class/Species/Compétences (moteur
       prêt / en échec / en charge). `document`+`resolved` en plus de
       `decisions`/`query` : Inheritance lit les points de boost déjà posés
       dans `document.build.choices` (aucun plan ne les republie, voir
       `inheritance-step.mjs`) et le score final dans `resolved.abilities`,
       même paire que l'étape Abilities. */
    card.append(renderInheritanceStep({
      decisions: state.decisions,
      document: state.document,
      resolved: state.resolved,
      query: state.engine.layers.verbs.query,
      open: state.inheritanceOpen
    }, applyDecisionAction));
  } else if (step.id === "background" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "background") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "abilities" && state.engine) {
    card.append(renderAbilitiesStep({
      document: state.document,
      resolved: state.resolved,
      rollBatch: state.abilityRoll,
      revele: state.abilityRevele,
      method: state.abilityMethod,
      rollingMethod: state.rollingMethod
    }, applyDecisionAction));
  } else if (step.id === "abilities" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "abilities") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "destiny" && state.engine) {
    /* LOT 61 — le mode « choice » est rendu par la branche CATALOGUE
       au-dessus (`catalogueCourant`) ; on n'arrive ici qu'en mode « draw »,
       l'écran théâtral. */
    card.append(renderDestinyStep({
      document: state.document,
      resolved: state.resolved,
      query: state.engine.layers.verbs.query,
      intro: state.destinyIntro,
      drawnId: state.destinyDraw,
      face: state.destinyFace,
      revealed: state.destinyRevealed
    }, applyDecisionAction));
  } else if (step.id === "destiny" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "destiny") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "skills" && state.engine) {
    card.append(renderSkillsStep({
      resolved: state.resolved,
      decisions: state.decisions,
      violations: state.violations,
      query: state.engine.layers.verbs.query
    }, applyDecisionAction));
  } else if (step.id === "skills" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "skills") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "equipment" && state.engine) {
    /* LOT 49 — même trio de branches que les étapes précédentes (moteur
       prêt / en échec / en charge). `document`+`resolved`+`query` : la
       phrase de classe et les lignes `gear[N]` viennent du document brut
       (aucun plan `decisions[]` ne les republie, voir `equipment-step.mjs`
       en tête), l'AC et la bourse dérivées viennent de `resolved`. */
    card.append(renderEquipmentStep(equipmentCtx(), applyDecisionAction));
  } else if (step.id === "equipment" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "equipment") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  } else if (step.id === "review" && state.document && state.report) {
    /* ⚠️ LOT 65 — `renderFiche` A QUITTÉ CET ÉCRAN, avec son `innerHTML`.
       Il déversait `resolved` en entier : 11 894 px mesurés, 27 370 après
       quelques choix de plus, et il GRANDISSAIT AVEC LE PERSONNAGE. B9
       demande l'inverse — « un masque propre, TRÈS CLAIR, QUE DU TEXTE, sur
       une DALLE MAJEURE UNIQUE ».
       ⭐ Et la coquille n'a plus AUCUN `innerHTML` : c'était le dernier. */
    card.append(renderReviewStep({
      document: state.document, resolved: state.resolved,
      decisions: state.decisions, report: state.report, violations: state.violations
    }, applyDecisionAction));
  } else if (step.id === "review" && state.engineError) {
    card.append(el("p", "placeholder", [document.createTextNode(
      "Engine failed to load: " + state.engineError)]));
  } else if (step.id === "review") {
    card.append(el("p", "placeholder", [document.createTextNode("Loading the engine…")]));
  }
  /* LOT 54 — AUCUN `else` FINAL : les neuf étapes (`STEPS`, plus « review »,
     sa destination) sont toutes nommées ci-dessus. Un dixième `else`
     générique aurait été un PLACEHOLDER qu'aucune étape ne peut plus
     jamais atteindre — mort, mais toujours lisible comme si une étape
     restait à câbler. Ce lot clôt le builder (commande, §0) : le garder
     aurait menti sur ce qui reste à faire. */

  return card;
}

/* ══════════════════════════════════════════════════════════════════════
   LE CADRE PERSISTANT (§N d'ERGONOMIE-BUILDER.md, B0.21)
   ══════════════════════════════════════════════════════════════════════
   ┌─────────────────────────────┐
   │  ‹   ② Class   ③ Species  › │   LA MOLETTE — fixe, horizontale
   ├──────┬──────────────────────┤   ← la ligne de séparation, COUPÉE par l'icône
   │ Show │   Validate           │   LA LIGNE DE COMMANDE — fixe
   │ plan │                      │
   └──────┴──────────────────────┘
                                     LA FICHE — le SEUL élément qui défile
           ∧ / ∨ flottants           les chevrons flottent PAR-DESSUS elle

   🔴 CES NŒUDS SONT CRÉÉS UNE FOIS ET NE SONT JAMAIS REMPLACÉS. C'est tout
   le socle. Les fonctions `paint*` plus bas n'écrivent que des ATTRIBUTS
   dessus (`data-status`, `aria-current`, `data-lit`, `textContent`) —
   jamais un nœud neuf. Voir SOCLE.md, « ce qui ne se redessine jamais ».

   ⛔ `Back` N'EXISTE PLUS (I.5, B0.18) : le chevron gauche de la molette le
   remplace. Et il n'y a QU'UN SEUL `Validate` dans toute l'interface (I.3,
   répété deux fois par Eric) — celui-ci. Aucun écran n'a le droit d'en
   poser un second ; c'est pourquoi il est construit ICI et pas là-bas. */
const frame = mountFrame();

function mountFrame() {
  /* ── LA MOLETTE (B0.1-B0.5) ─────────────────────────────────────── */
  const belt = el("nav", "belt");
  belt.setAttribute("aria-label", "Character creation steps");
  /* ⛔ LES DEUX CHEVRONS DE LA CEINTURE SONT PARTIS — Eric, 2026-08-15, après
     les avoir vus sur le simulateur : « les flèches gauche et droite font
     moche, on les dégage ».
     Ils avaient d'abord été posés PAR-DESSUS la piste pour que les dalles
     glissent dessous plutôt que d'être tranchées en plein vide ; à l'écran,
     ils se posaient sur le NUMÉRO du cran voisin. Le remède était pire.
     ⭐ L'affordance ne disparaît pas : la ceinture défile et se tape, Eric
     l'a confirmé (« il fonctionne bien, il est en scroll/tap »), et le cran
     courant se recentre à la sélection. Une flèche qui double un geste déjà
     acquis ne sert qu'à occuper de la place. */
  const track = el("div", "belt-track");
  track.dataset.scroller = "belt";
  const items = STEPS.map((step, index) => {
    const item = button("", () => goToStep(index));
    item.className = "belt-item";
    /* Deux nœuds, posés une fois — jamais `innerHTML`, qui les recréerait
       à chaque peinture et rendrait le cadre aussi jetable qu'avant. */
    const num = el("span", "belt-index", [document.createTextNode(String(index))]);
    const label = el("span", "belt-label", [document.createTextNode(step.label)]);
    item.append(num, label);
    track.append(item);
    return item;
  });
  belt.append(track);

  /* ⛔ LA LIGNE DE COMMANDE N'EXISTE PLUS (refonte 2 §1, Eric 2026-08-15).
     Elle coûtait 45 px sur les dix écrans, tout le temps, pour deux boutons.
     `Show plan` disparaît — Review EST le plan, lu au carnet — et `Validate`
     descend dans le contenu de chaque écran (`renderValidation`), là où le
     geste se termine. Mesuré : la hauteur figée passe de 106 px à 61. */

  /* ── LA ZONE DE FICHE : le seul défilement de l'écran (B0.21a) ───── */
  const area = el("div", "stage-area");
  const stage = el("main", "stage");
  stage.dataset.scroller = "stage";
  /* Le rail de navigation interne (B0.19), FIXE lui aussi : un slot vide
     que l'écran courant garnit, ou laisse vide. Il est HORS de la fiche,
     donc il ne défile pas avec elle — et hors du contenu remplacé, donc
     `swapContent` ne le touche pas. */
  const aside = el("div", "stage-aside");
  aside.hidden = true;
  /* ⭐ LOT 62 — LA NAVIGATION INTERNE HORIZONTALE (B0.19), le second slot
     fixe que SOCLE.md annonçait sans le construire : « la forme horizontale
     n'est pas construite — elle demandera son propre slot, et ce lot ne
     l'invente pas d'avance ». Compétences en a besoin AUJOURD'HUI (sa
     molette de catégories et sa barre de pool doivent FLOTTER, B7.1), donc
     il entre maintenant, et pas avant.
     ⚠️ Il est HORS de la scène : il ne défile donc pas avec elle, et
     `swapContent` ne le touche jamais. */
  const topbar = el("div", "stage-topbar");
  topbar.hidden = true;
  const chevrons = el("div", "stage-chevrons");
  const up = button("\u2227", () => scroller.step(-1));
  up.className = "stage-chevron";
  up.setAttribute("aria-label", "Scroll up");
  const down = button("\u2228", () => scroller.step(1));
  down.className = "stage-chevron";
  down.setAttribute("aria-label", "Scroll down");
  chevrons.append(up, down);
  /* La surface de popup (III.4) — persistante, au-dessus de tout, hors du
     contenu remplacé. */
  const popup = el("div", "popup");
  popup.setAttribute("role", "status");
  popup.hidden = true;
  area.append(aside, stage, chevrons, popup);

  app.append(belt, topbar, area);

  /* LES DEUX ÉCOUTEURS QUI DOIVENT SURVIVRE — posés ICI, une fois, sur des
     nœuds qui ne meurent pas. C'est la différence entre ce lot et tout ce
     qui précède : avant, il n'y avait aucun endroit où les poser. */
  const scroller = mountChevrons(chevrons, stage);
  const popupLayer = mountPopup(popup, () => { state.popup = null; refresh(); });
  const spy = watchSnap(stage, onSnapSettle);

  return { belt, track, items, area, stage, aside, topbar, popup, popupLayer, chevrons, scroller, spy };
}

/* ══ LE SCROLLSPY EST LE SÉLECTEUR (II.3) ═══════════════════════════════
   🔴 CETTE FONCTION NE REDESSINE RIEN, ET C'EST LA RÈGLE LA PLUS
   IMPORTANTE DU SOCLE (SOCLE.md, « les trois verbes »). Un spy qui
   appellerait `refresh()` se mordrait la queue : le redessin déplace le
   défilement, qui rappelle le spy. Il écrit `state`, touche un attribut,
   et s'arrête là. */
function onSnapSettle(index) {
  /* ⭐ DEUX PROPRIÉTAIRES DU CRAN, ET UN SEUL SPY. Les catalogues surlignent
     leur rail VERTICAL ; Compétences surligne sa molette HORIZONTALE. Le
     socle ne connaît ni l'un ni l'autre : il dit « on s'est posé sur le
     n-ième `[data-snap]` », et c'est tout.
     🔴 Et comme toujours : on écrit `state`, on touche un attribut, on
     s'arrête là. Aucun redessin (SOCLE.md, la troisième ligne). */
  if (surCompetences()) {
    state.cursor = index;
    const crans = frame.topbar.querySelectorAll(".skills-cat");
    crans.forEach((item, i) => item.setAttribute("aria-current", i === index ? "true" : "false"));
    if (crans[index]) keepInView(frame.topbar.querySelectorAll(".skills-catbar")[0], crans[index], "x");
    return;
  }
  if (!catalogueCourant()) return;
  state.cursor = index;
  const rail = frame.aside.querySelectorAll(".catalogue-rail-item");
  rail.forEach((item, i) => item.setAttribute("aria-current", i === index ? "true" : "false"));
  /* Le cran courant revient dans le champ DU RAIL, et de lui seul —
     `keepInView`, jamais `scrollIntoView` (qui déplacerait la fiche avec,
     le défaut §0 seconde moitié). */
  if (rail[index]) keepInView(frame.aside, rail[index], "y");
}

/* ══ LES PALIERS DE `Validate` (I.4) ════════════════════════════════════
   Un écran qui ne déclare rien a UN palier : avancer. C'est exactement ce
   que faisait le bouton `Continue` d'avant — donc aucun des neuf autres
   écrans ne ment sur des paliers qu'il n'a pas encore. Class en déclare
   deux (B2.4), et c'est le seul aujourd'hui. */
function currentGate(palier = state.palier) {
  const cfg = catalogueCourant();
  if (cfg) return catalogueValidate({ ...catalogueCtx(cfg), palier }, cfg.palier2(state.decisions));
  /* B8 — rien n'est obligatoire sur Equipment : la porte est toujours prête. */
  if (STEPS[state.step].id === "equipment" && state.engine) return equipmentValidate();
  /* B9 — Review est la destination : pas de pas suivant, donc pas de palier. */
  if (STEPS[state.step].id === "review") return reviewValidate();
  /* B4 — sur Inheritance, `Validate` FERME le panneau ouvert, ou avance
     quand les deux cercles sont cochés. */
  if (STEPS[state.step].id === "background" && state.engine && state.inheritanceOpen !== "feat") {
    return inheritanceValidate({ decisions: state.decisions, open: state.inheritanceOpen });
  }
  /* B5 — sur Abilities, `Validate` JETTE au premier palier, puis avance. */
  if (STEPS[state.step].id === "abilities" && state.engine) {
    return abilitiesValidate({
      document: state.document, method: state.abilityMethod, rollBatch: state.abilityRoll
    });
  }
  /* B7.3d — sur Compétences, `Validate` s'illumine quand le compte est bon. */
  if (surCompetences()) return skillsValidate(skillsCtx());
  /* B6.1e — sur Destiny en mode « draw », `Validate` s'allume quand la carte
     est retournée, et c'est LUI qui l'acte (B6.2). */
  if (STEPS[state.step].id === "destiny" && state.engine) {
    return destinyValidate({ drawnId: state.destinyDraw, face: state.destinyFace });
  }
  return { exists: true, ready: state.step < REVIEW_INDEX, action: null, next: "step" };
}

function pressValidate() {
  const gate = currentGate();
  if (!gate.ready) return;
  /* L'ACTION D'ABORD, LE PALIER ENSUITE : `applyDecisionAction` appelle
     `rebuild()` puis `refresh()`, donc le carnet est à jour AVANT que le
     palier suivant ne le lise. */
  if (gate.action) applyDecisionAction(gate.action);
  /* B4.4, étape 2 — « toutes les fenêtres intermédiaires disparaissent ».
     Fermer n'est ni un palier ni une étape : c'est le troisième mouvement de
     `Validate`, et il n'existe que sur cet écran. */
  if (gate.next === "close") { state.inheritanceOpen = null; openSurface(); return; }
  if (gate.next === "palier") {
    /* ⭐ LA PORTE EST RÉ-INTERROGÉE APRÈS LE `choose`, et il le faut : le
       plan du 2ᵉ palier décrit le record CHOISI, pas celui qui était sous le
       curseur. Une espèce qui n'accorde rien (Loroka) n'a donc qu'UN palier,
       et on ne peut le savoir qu'ici — pousser vers un menu vide serait un
       geste pour rien (I.4 : « un écran peut compter un, deux ou trois »). */
    if (currentGate(state.palier + 1).exists === false) { goToStep(state.step + 1); return; }
    state.palier += 1;
    openSurface();
    return;
  }
  goToStep(state.step + 1);
}

/* ⛔ TOUJOURS PAR `REVIEW_INDEX` (trouvé par id), jamais par
   `STEPS.length - 1` : c'est la loi du lot 40, et le lot 55 a payé pour
   l'avoir laissée non appliquée (le bouton final se pointait sur lui-même).
   Elle compte double depuis que l'ordre des étapes a bougé (voir `STEPS`). */
function goToStep(index) {
  const target = Math.max(0, Math.min(REVIEW_INDEX, index));
  if (target === state.step) return;
  state.step = target;
  /* Un écran neuf repart à son PREMIER palier, jamais à celui d'avant. */
  state.palier = 1;
  /* ⭐ ET IL REPART SUR LE CHOIX DÉJÀ POSÉ, PAS EN HAUT DE LA LISTE — trouvé
     en regardant la page : le personnage d'exemple est un Magicien, et
     arriver sur Class le posait devant Barbarian. Comme le défilement EST le
     choix (II.1), un `Validate` poussé sans regarder aurait écrasé sa classe
     en silence. Un écran qui reprend doit montrer où on en est. */
  if (STEPS[target].id === "destiny" && state.engine) {
    /* La scène se rejoue à chaque arrivée — SAUF si la carte est déjà actée :
       rejouer le théâtre devant un choix déjà pris serait le proposer à
       nouveau sans le dire. */
    const dejaActee = currentArcanaId(state.document);
    state.destinyMode = "draw";
    state.destinyIntro = !dejaActee;
    state.destinyDraw = dejaActee || null;
    state.destinyFace = dejaActee ? "up" : "down";
    state.destinyRevealed = Boolean(dejaActee);
    if (!dejaActee) tirerUneCarte();
    openSurface();
    return;
  }
  if (STEPS[target].id === "skills") { state.cursor = 0; openSurface(); return; }
  /* Arriver sur Inheritance montre TOUJOURS les deux dalles (B4.1) — jamais
     un panneau resté ouvert d'une visite précédente. */
  if (STEPS[target].id === "background") { state.inheritanceOpen = null; openSurface(); return; }
  const cfg = state.engine ? CATALOGUES[STEPS[target].id] : null;
  if (!cfg) { openSurface(); return; }
  state.cursor = catalogueCursor(state.decisions, cfg.path);
  openSurface(state.cursor);
}

/* ══ LES PEINTRES — ILS N'ÉCRIVENT QUE DES ATTRIBUTS ════════════════════ */

function paintBelt() {
  frame.items.forEach((item, index) => {
    item.dataset.status = index < state.step ? "done" : index === state.step ? "current" : "upcoming";
    item.setAttribute("aria-current", index === state.step ? "step" : "false");
  });
  /* B0.3 — aucun chevron à gauche à la première étape, aucun à droite à la
     dernière, les deux au milieu. `hidden` plutôt qu'un `display:none` en
     feuille de style : le garde 4 des jetons l'interdit dans `shell.css`,
     et un bouton retiré du flux ne doit pas laisser sa place vide. */
  const current = frame.items[state.step];
  if (current) keepInView(frame.track, current, "x");
}

/* ══ LA VALIDATION VIT DANS LE DOCUMENT (refonte 2 §1b) ═══════════════
   Eric, 2026-08-15 : « il faudra mettre un bouton validate dans les
   documents ». Le bouton quitte la barre fixe et va au bas du contenu de
   l'écran, à l'endroit où le geste se termine.

   ⚠️ CE QUE ÇA COÛTE, ET IL FAUT LE DIRE : le `Validate` fixe était TOUJOURS
   atteignable sans remonter — c'était l'argument d'Eric lui-même pour y
   mettre `Reset` (B7.8). Au bas d'un écran qui défile, il se cherche.
   ⭐ La refonte 2 y répond écran par écran (§3), et cette forme-ci est la
   PROVISOIRE : un bouton, la même porte, aucun décor. Chaque écran recevra
   ensuite sa forme propre — « plus petit » sur Biography, sous les six
   barillets sur Abilities, `This is my calling` sur Destiny.

   📌 IL SE RECONSTRUIT AVEC LE CONTENU, donc aucune fonction de peinture :
   il naît et meurt dans le `swapContent` de `refresh()`, comme le reste de
   la scène. C'est ce qui le dispense d'être un nœud persistant. */
function renderValidation() {
  /* B9 — Review est la DESTINATION : aucun pas suivant, donc pas de porte.
     Un bouton mort au bas de la dernière page ne dirait rien à personne. */
  if (STEPS[state.step].id === "review") return null;
  /* ⭐ CH6 — LES DEUX ÉCRANS À FICHE VALIDENT CHEZ EUX. Le pied de la fiche
     porte `CHOOSE`, qui ouvre EXACTEMENT la porte de ce bouton-ci ; les
     garder tous les deux serait deux commandes pour un geste, à dix pixels
     l'une de l'autre. Les croquis A et C ne dessinent que `LORE` / `CHOOSE`.
     ⛔ SEULEMENT AU PALIER 1 : le 2ᵉ palier n'a plus de fiche (c'est le menu
     des choix, B2.3), donc plus de `CHOOSE` — il garde ce bouton, et il en a
     besoin. Le croquis C l'appelle `Choose your cantrips`, le croquis A
     `Finish` : ⏳ le renommer par écran est un geste de plus, pas celui-ci. */
  const fiche = catalogueCourant();
  if (fiche && fiche.fiche && state.palier !== 2) return null;
  const gate = currentGate();
  const bouton = button("Validate", () => pressValidate());
  bouton.className = "valider-bouton";
  /* B0.11 lu à travers I.4 — il s'allume aux conditions DU PALIER COURANT.
     Éteint, il reste LISIBLE : un bouton qu'on ne peut pas presser doit dire
     pourquoi par son apparence, jamais disparaître. */
  bouton.dataset.lit = String(gate.ready);
  bouton.disabled = !gate.ready;
  return el("div", "valider", [bouton]);
}

/** LE SLOT HORIZONTAL (B0.19) — garni par l'écran qui en a un, vidé pour
 *  les autres. Aujourd'hui : Compétences seul. Le slot PERSISTE, ce qu'un
 *  écran y met peut changer — même loi que le rail. */
function paintTopbar() {
  const barre = surCompetences() ? renderSkillsBar(skillsCtx(), applyDecisionAction)
    : (STEPS[state.step].id === "equipment" && state.engine)
      ? renderEquipmentBar(equipmentCtx(), applyDecisionAction)
      : null;
  frame.topbar.hidden = !barre;
  swapContent(frame.topbar, barre ? [barre] : []);
}

/** Le popup (III.4) — montré ou caché selon `state.popup`, jamais selon un
 *  nœud qui traînerait dans le contenu. */
function paintPopup() {
  if (!state.popup) { frame.popupLayer.hide(); return; }
  const contenu = [];
  if (state.popup.titre) contenu.push(el("h3", "popup-titre", [document.createTextNode(state.popup.titre)]));
  /* Le texte peut porter des sauts de ligne (la prose d'un record, le
     « what you already have ») : chacun devient un paragraphe, jamais un
     `innerHTML` — la coquille n'en a plus aucun depuis le lot 65. */
  for (const paragraphe of String(state.popup.texte).split("\n").filter((l) => l.trim() !== "")) {
    contenu.push(el("p", "popup-texte", [document.createTextNode(paragraphe)]));
  }
  frame.popupLayer.show(contenu);
}

/* Le rail (B0.19) : garni par l'écran qui en a un, vidé pour les autres.
   Le SLOT ne bouge jamais — seul son contenu change, par `swapContent`
   comme la fiche. */
function paintAside() {
  const cfg = catalogueCourant();
  /* CH4 — le rail reçoit le destinataire de ses `snapTo`. ⚠️ Il est RECONSTRUIT
     à chaque `refresh()` (`swapContent` juste en dessous), donc ses écouteurs
     meurent et renaissent avec lui : aucun ne fuit, aucun ne double. C'est le
     slot qui persiste, pas son contenu (SOCLE.md). */
  const rail = cfg ? renderCatalogueRail(catalogueCtx(cfg), applyDecisionAction) : null;
  const show = Boolean(rail) && state.palier !== 2; // le menu des choix (B2.3) n'a pas de rail : il n'y a plus douze fiches à suivre
  frame.aside.hidden = !show;
  frame.area.dataset.aside = show ? "on" : "off";
  swapContent(frame.aside, show ? [rail] : []);
}

/* ══ LES DEUX SEULS VERBES DE REDESSIN (SOCLE.md) ═══════════════════════ */

/** UNE MISE À JOUR — le défilement SURVIT. C'est ce qu'appelle chaque
 *  clic de choix. */
function refresh() {
  paintBelt();
  paintAside();
  paintTopbar();
  paintPopup();
  swapContent(frame.stage, [renderStepContent(), renderValidation()].filter(Boolean));
  frame.spy.settle();
  /* LOT 70 — la géométrie des chevrons et de l'amorce se relit ici, comme
     le spy : un remplacement de contenu n'émet aucun `scroll`, et `resize`
     passe par ce verbe. SANS annonce — un choix cliqué n'est pas une
     surface neuve. */
  frame.scroller.settle();
}

/** UNE NOUVELLE SURFACE — changement d'étape, ou changement de palier. Le
 *  défilement repart EN HAUT, et c'est le SEUL endroit du dépôt qui le
 *  décide (`swapContent` ne le fait jamais tout seul).
 *
 *  `at` : l'index du point d'aimantation sur lequel se poser, quand « en
 *  haut » serait un mensonge — un écran qui reprend un choix déjà fait doit
 *  s'ouvrir DEVANT ce choix. C'est le seul écart, il est nommé, et il passe
 *  par `keepInView` (socle.mjs) plutôt que par un second calcul maison. */
function openSurface(at) {
  refresh();
  const snaps = frame.stage.querySelectorAll("[data-snap]");
  const target = Number.isInteger(at) ? snaps[at] : null;
  if (target) keepInView(frame.stage, target, "y-start");
  else frame.stage.scrollTo({ top: 0, behavior: "instant" }); // `instant` : arriver n'est pas voyager (voir swapContent)
  frame.spy.settle();
  /* LOT 70 — AVEC annonce : une surface neuve qui défile se montre une
     seconde (B0.22b, et la réserve de découvrabilité de l'architecte —
     l'indicateur iOS qui flashe à l'ouverture d'une vue, la comparaison
     d'Eric elle-même). Un écran qui tient en entier n'annonce RIEN :
     mesuré à 1440, Universe flashait deux chevrons sur un champ 800/800. */
  frame.scroller.settle(true);
}

/* ⚠️ `resize` appelle `refresh`, PAS `openSurface` : tourner le téléphone ne
   doit pas renvoyer le joueur en haut d'un écran de 16 513 px. C'était le
   cas avant ce lot (l'ancien `render` était branché tel quel sur `resize`),
   et personne ne l'avait mesuré. */
window.addEventListener("resize", refresh);
refresh();

/* Le moteur charge en tâche de fond ; l'écran s'affiche immédiatement
   (placeholder « Loading… » sur l'étape Compétences) et se corrige une
   fois la pile montée et le premier `rebuild` fait. */
(async () => {
  try {
    const [engine, document, schema] = await Promise.all([bootEngine(), loadExampleDocument(), loadDocSchema()]);
    state.engine = engine;
    state.document = document;
    /* LOT 54 — construit UNE FOIS ; `rename`/`describe` ci-dessous
       réutilisent la MÊME instance à chaque action, jamais reconstruite par
       clic (le schéma ne change pas en cours de session). */
    state.docWriters = createDocWriters({ schema });
    rebuild();
  } catch (error) {
    state.engineError = error.message;
  }
  refresh();
})();
